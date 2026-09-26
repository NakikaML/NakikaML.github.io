/**
 * content-editor-plugin.mjs —— 本地开发专用的「在页面上改字」写接口
 * ==================================================================
 * 设计目标（和你的需求一一对应）：
 *
 *   · 本地 pnpm dev   →  页面上能直接改文字，保存后写回 src/content/notes/*.md
 *   · 上线到 GitHub   →  访问者只读，连「尝试写入」的机会都不存在
 *
 * 后半句为什么是免费的：本站是 Astro 静态构建，GitHub Pages 上只有
 * HTML/CSS/JS，没有服务端。这个文件注册的接口写在 **Vite 插件**里，
 * 而且 apply: 'serve' —— 打包时这个插件根本不会被加载，接口不可达。
 * 不是「用 if 判断跳过写操作」，是那段代码物理上不在 dist/ 里。
 *
 * 安全边界（三条，缺一不可）：
 *   1. 只认 loopback 请求：别人就算能访问到你的 dev server（--host / 内网穿透），
 *      也拿不到写权限。要显式放开得自己设 NAKIKA_ALLOW_REMOTE_EDIT=1。
 *   2. Host 头校验：防 DNS rebinding —— 恶意网页把你的域名解析到 127.0.0.1
 *      来打这个接口时，Host 头不是 localhost，直接拒。
 *   3. 路径白名单 + 越界检查：只允许写 EDITABLE_COLLECTIONS 里列出的目录下的
 *      .md，resolve 之后必须仍在该目录内（挡 ../ 穿越）。
 *
 * 目前只开 notes；要放开 blog / works，在 EDITABLE_COLLECTIONS 里加一行，
 * 再把 DevNoteEditor 组件挂到对应页面上即可。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// 直接用 Astro 自己的 frontmatter 解析器，别自己写正则猜 —— 见 bodyLineOffset
import { parseFrontmatter } from '@astrojs/markdown-remark';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** 允许本地编辑的内容集合 → 磁盘目录 */
const EDITABLE_COLLECTIONS = {
  notes: path.join(ROOT, 'src', 'content', 'notes'),
  // blog: path.join(ROOT, 'src', 'content', 'blog'),
  // works: path.join(ROOT, 'src', 'content', 'works'),
};

/** 接口前缀。verify-build.mjs 会扫描产物里有没有这个字符串。 */
const MARKER = '/__edit';

/** 单个请求体上限（笔记正文不会这么大，超过多半是打错了） */
const MAX_BODY_BYTES = 4 * 1024 * 1024;

/** 允许的 Host 头（去掉端口后比较），用于挡 DNS rebinding */
const ALLOWED_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]', '0.0.0.0']);

/**
 * 行首「标记前缀」：缩进 + 引用号 + 列表标记 + 标题井号。
 * 保存时保留前缀、只换后面的文字，所以 `- ` 还是 `- `，`## ` 还是 `## `。
 */
const PREFIX_RE = /^(\s*(?:>[ \t]*)*(?:[-*+][ \t]+|\d+[.)][ \t]+)?(?:#{1,6}[ \t]+)?)/;

// ------------------------------------------------------------------ 小工具

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(body);
}

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw httpError(413, '请求体过大');
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw httpError(400, '请求体不是合法 JSON');
  }
}

function isLoopback(req) {
  const addr = req.socket?.remoteAddress || '';
  return addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1';
}

function hostAllowed(req) {
  const raw = req.headers?.host || '';
  const host = raw.replace(/:\d+$/, '');
  return ALLOWED_HOSTS.has(host);
}

/** collection + id → 磁盘上的绝对路径（带越界检查） */
function resolveTarget(collection, id) {
  const dir = EDITABLE_COLLECTIONS[collection];
  if (!dir) {
    throw httpError(404, `集合「${collection}」没有开放本地编辑`);
  }
  if (typeof id !== 'string' || !id.trim()) throw httpError(400, '缺少 id');
  if (path.isAbsolute(id) || id.includes('\0')) throw httpError(400, '非法 id');

  const file = path.resolve(dir, `${id}.md`);
  const rel = path.relative(dir, file);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) {
    throw httpError(403, '路径越界：只能写白名单目录下的 .md');
  }
  if (!fs.existsSync(file)) {
    throw httpError(404, `找不到源文件：${path.relative(ROOT, file)}`);
  }
  if (!fs.statSync(file).isFile()) throw httpError(400, '目标不是文件');
  return file;
}

/** 拆出 frontmatter（含结尾换行）与正文。没有 frontmatter 时 head 为空串。 */
function splitFrontmatter(src) {
  const m = /^---[ \t]*\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/.exec(src);
  if (!m) return { head: '', body: src };
  return { head: m[0], body: src.slice(m[0].length) };
}

/**
 * 正文第 1 行对应文件的第几行（0-based，即要往正文行号上加的偏移量）。
 *
 * ⚠️ 这里必须**完全照抄 Astro 的算法**，否则会差一行、把文件写错位置
 *    （这正是端到端自检第一次跑出来抓到的 bug）。
 *
 * Astro 真正交给 Markdown 处理器的正文是这条链：
 *   astro/dist/vite-plugin-markdown/content-entry-type.js
 *     body = safeParseFrontmatter(contents).content.trim()
 *   astro/dist/content/utils.js
 *     safeParseFrontmatter = parseFrontmatter(src, { frontmatter: 'empty-with-spaces' })
 * 也就是说：frontmatter 被换成**等行数的空格**（这样行号不乱），然后整体 trim。
 * 于是「正文第 1 行」= 文件里 frontmatter 之后第一个非空行 ——
 * 如果按「frontmatter 有几个换行」去算，就会少算掉那个空行。
 *
 * 所以这里用同一个 parseFrontmatter，量出 trim 之后正文起点前面有几个换行。
 */
function bodyLineOffset(src) {
  const { content } = parseFrontmatter(src, { frontmatter: 'empty-with-spaces' });
  const body = content.trim();
  if (!body) return 0;
  const at = content.indexOf(body); // trim 出来的必然是 content 的子串
  return (content.slice(0, at).match(/\n/g) || []).length;
}

function detectEol(src) {
  return src.includes('\r\n') ? '\r\n' : '\n';
}

/** 原样落盘。就一次写，不做临时文件 + rename —— 文本很小，简单更可靠。 */
function writeFile(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}

/** 检查保存后的文字里有没有会改变渲染结果的 Markdown 符号，只是提醒，不拦。 */
function collectWarnings(text) {
  const warnings = [];
  if (/[*_`\[\]<>|$]/.test(text)) {
    warnings.push(
      '新内容含 Markdown 特殊符号（* _ ` [ ] < > | $），渲染结果可能和你想的不一样，建议看一眼；不对就用「编辑原文」改。'
    );
  }
  if (/^\s*(?:[-*+>]|\d+[.)])\s/.test(text)) {
    warnings.push('新内容开头像 Markdown 标记，可能被解析成列表或引用。');
  }
  return warnings;
}

// ------------------------------------------------------------------ 三个操作

/** op: body —— 只换正文，frontmatter 一个字节都不动 */
function opBody(file, payload) {
  const src = fs.readFileSync(file, 'utf8');
  const eol = detectEol(src);
  const { head } = splitFrontmatter(src);

  let body = String(payload.body ?? '').replace(/\r\n?/g, eol);
  if (!body.endsWith(eol)) body += eol;

  writeFile(file, head + body);
  return { warnings: [] };
}

/**
 * op: lines —— 把第 start..end 行替换成一行：行首标记前缀（保留）+ 新文字
 *
 * ⚠️ start / end 是**正文内行号**（页面上的 data-edit-start 就是这么来的），
 *    这里先加上 frontmatter 的偏移换算成文件行号，否则会写错位置。
 *
 * 这是行内改字走的路：只动这几行，其余源码原封不动。
 */
function opLines(file, payload) {
  const src = fs.readFileSync(file, 'utf8');
  const eol = detectEol(src);
  const lines = src.split(/\r?\n/);
  const offset = bodyLineOffset(src);

  const bodyStart = Number(payload.start);
  const bodyEnd = Number(payload.end);
  if (!Number.isInteger(bodyStart) || !Number.isInteger(bodyEnd)) {
    throw httpError(400, '行号必须是整数');
  }

  const start = bodyStart + offset;
  const end = bodyEnd + offset;
  if (start < 1 || end < start || end > lines.length) {
    throw httpError(
      400,
      `行号越界：正文 ${bodyStart}..${bodyEnd} 行 → 文件 ${start}..${end} 行（文件共 ${lines.length} 行）——页面可能已经过期，刷新后再试`
    );
  }

  const prefix = (PREFIX_RE.exec(lines[start - 1]) || [''])[0];
  const text = String(payload.text ?? '')
    // 软换行的段落会带着 \n 上来：折成空格，和浏览器现在的显示一致
    .replace(/\s*\r?\n\s*/g, ' ')
    .trim();

  if (!text) {
    throw httpError(400, '内容不能为空。要删掉整段，请用「编辑原文」。');
  }

  const next = [
    ...lines.slice(0, start - 1),
    prefix + text,
    ...lines.slice(end),
  ];
  writeFile(file, next.join(eol));

  return { warnings: collectWarnings(text), start, end, bodyStart, bodyEnd };
}

/** op: full —— 整份文件（含 frontmatter）替换，走「连 frontmatter 一起改」开关 */
function opFull(file, payload) {
  const content = String(payload.content ?? '');
  if (!/^---[ \t]*\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/.test(content)) {
    throw httpError(
      400,
      '整份文件必须以 --- 包裹的 frontmatter 开头，否则笔记的标题/日期会全部失效。已拒绝写入。'
    );
  }
  const eol = detectEol(content);
  let out = content.replace(/\r\n?/g, eol);
  if (!out.endsWith(eol)) out += eol;

  writeFile(file, out);
  // 正文有没有被改坏（比如整段删了）没法在这里判断，交给页面刷新后的渲染结果
  return { warnings: [] };
}

// ------------------------------------------------------------------ 路由

async function handleRequest(req, res, url) {
  const allowRemote = process.env.NAKIKA_ALLOW_REMOTE_EDIT === '1';

  if (!allowRemote && !isLoopback(req)) {
    throw httpError(403, '本地编辑接口只接受本机（127.0.0.1）请求。要远程开放请自行设 NAKIKA_ALLOW_REMOTE_EDIT=1。');
  }
  if (!allowRemote && !hostAllowed(req)) {
    throw httpError(403, `Host 头「${req.headers.host || ''}」不被信任（防 DNS rebinding）。请用 http://localhost:4321 打开。`);
  }

  const route = url.pathname.slice(MARKER.length);

  if (route === '/note' && req.method === 'GET') {
    const collection = url.searchParams.get('collection') || '';
    const id = url.searchParams.get('id') || '';
    const file = resolveTarget(collection, id);
    const src = fs.readFileSync(file, 'utf8');
    const { head, body } = splitFrontmatter(src);
    return sendJson(res, 200, {
      ok: true,
      id,
      collection,
      path: path.relative(ROOT, file).split(path.sep).join('/'),
      frontmatter: head,
      body,
      content: src,
      lines: src.split(/\r?\n/).length,
    });
  }

  if (route === '/note' && req.method === 'POST') {
    const payload = await readJsonBody(req);

    // 先校验 op，再看目标文件：请求本身不合法就报 400，
    // 而不是因为 collection 缺失误报成 404。
    // 用 Map 而不是普通对象，避免 'constructor' 这类键被当成合法 op。
    const OP_HANDLERS = new Map([
      ['body', opBody],
      ['lines', opLines],
      ['full', opFull],
    ]);
    const run = OP_HANDLERS.get(payload.op);
    if (!run) throw httpError(400, `未知的 op：${payload.op}`);

    const file = resolveTarget(payload.collection, payload.id);
    const result = run(file, payload);

    return sendJson(res, 200, {
      ok: true,
      path: path.relative(ROOT, file).split(path.sep).join('/'),
      ...result,
    });
  }

  throw httpError(404, `未知的编辑接口：${req.method} ${url.pathname}`);
}

// ------------------------------------------------------------------ 插件

/**
 * 纯 connect 风格的中间件（不依赖 Vite）。
 * 拆出来是为了能直接挂到 node:http 上做自动化测试 —— 见 scripts/dev/test-editor.mjs，
 * 那样测的是真实的 HTTP 契约，又不用起 dev server。
 */
export function createEditHandler() {
  return function editHandler(req, res, next) {
    let url;
    try {
      url = new URL(req.url || '/', 'http://localhost');
    } catch {
      return next();
    }
    // 不是编辑接口的请求一律放行，绝不吞掉正常请求
    if (!url.pathname.startsWith(`${MARKER}/`)) return next();

    handleRequest(req, res, url).catch((err) => {
      if (res.writableEnded) return;
      const status = err?.status || 500;
      if (status >= 500) console.error('[content-editor]', err);
      sendJson(res, status, { ok: false, error: err?.message || '内部错误' });
    });
  };
}

export function contentEditor() {
  return {
    name: 'nakika-content-editor',
    /**
     * ★ 核心保险：apply: 'serve' 让 Vite 只在 dev server 里加载这个插件。
     *   `astro build` 时它连加载都不会加载，中间件自然不存在 —— 这是
     *   「上传后只读」这一半的物理保证，而不是靠运行时判断。
     */
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(createEditHandler());

      // 起服时提示一句，免得不记得有这个功能
      console.log(
        `\n  \x1b[38;5;179m[content-editor]\x1b[0m 本地编辑已就绪：笔记页右下角「行内改字」/「编辑原文」` +
          `\n  \x1b[2m写接口 ${MARKER}/note 只监听本机回环地址，构建产物里不存在这个接口\x1b[0m\n`
      );
    },
  };
}

export default contentEditor;
