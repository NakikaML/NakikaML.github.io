#!/usr/bin/env node
/**
 * test-editor.mjs —— 编辑功能的自动化测试（**不启动 dev server，不用 spawn**）
 * ==================================================================
 * 两段：
 *
 *   [1] 行号换算：直接用 Astro 的 Markdown 处理器 + remark 插件渲染 fixture，
 *       核对「页面上的行号 + frontmatter 偏移 === 文件真实行号」。
 *       这是最容易错、错了就写错文件的地方（Astro 只把正文交给处理器，
 *       所以插件拿到的是正文内行号）。
 *
 *   [2] HTTP 契约：把中间件挂到一个普通的 node:http 上（不经过 Vite），
 *       用真实请求把三个写操作和各种拒绝路径全打一遍，包括伪造 Host 头。
 *
 * 用法： node scripts/dev/test-editor.mjs
 * 退出码 0 = 全部通过。跑完会删掉自己创建的临时笔记。
 */

import http from 'node:http';
import fs from 'node:fs';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import remarkSourceLines from './remark-source-lines.mjs';
import { createEditHandler } from './content-editor-plugin.mjs';
import * as fx from './editor-fixture.mjs';

// ------------------------------------------------------------------ 断言

let pass = 0;
let fail = 0;
const ok = (m) => {
  pass++;
  console.log(`  \u001b[32m✓\u001b[0m ${m}`);
};
const bad = (m) => {
  fail++;
  console.log(`  \u001b[31m✗\u001b[0m ${m}`);
};
const check = (cond, m) => (cond ? ok(m) : bad(m));

// ------------------------------------------------------------------ 工具

fx.writeFixture();

const processor = await createMarkdownProcessor({
  remarkPlugins: [remarkMath, remarkSourceLines],
  gfm: true,
});

/** 按当前文件内容渲染一遍正文 —— 相当于页面刷新一次 */
async function renderBody() {
  const { code } = await processor.render(fx.bodyOf(fx.readFile()));
  return code;
}

/**
 * 取出指定块的行号属性。
 * 锚点文字改过之后就失效了，所以每次只查「这一次真正要用的块」。
 */
async function attrs(needles) {
  const html = await renderBody();
  const out = { html };
  for (const [key, needle] of Object.entries(needles)) {
    out[key] = fx.attrsOf(html, needle);
    if (!out[key]) throw new Error(`渲染结果里找不到「${needle}」这个可编辑块，后面的断言没法继续`);
  }
  return out;
}

async function main() {
  console.log('\n=== 编辑功能自动化测试 ===\n');

  // ---------------------------------------------------------------- [1]
  console.log('[1] 行号换算：页面行号 + frontmatter 偏移 = 文件行号');
  const offset = fx.bodyLineOffset(fx.readFile());
  const html0 = await renderBody();

  check(fx.markCount(html0) === 5, `可编辑块数量正确（期望 5，实际 ${fx.markCount(html0)}）`);
  check(fx.attrsOf(html0, '包含公式的段落不该被标记') === null, '含行内公式的段落**没有**被标记（防止改坏公式）');

  const a0 = await attrs({
    plain: '第一段是纯文本',
    multi: '这是跨行的段落第一行',
    list: '列表项测试',
    head: '小标题测试',
    last: '最后一段。',
  });

  check(
    a0.plain.start + offset === fx.lineOf('第一段是纯文本'),
    `普通段落行号换算正确（页面 ${a0.plain.start} + 偏移 ${offset} = 文件 ${fx.lineOf('第一段是纯文本')}）`
  );
  check(
    a0.list.start + offset === fx.lineOf('- 列表项测试'),
    `列表项行号换算正确（文件 ${fx.lineOf('- 列表项测试')}）`
  );
  check(
    a0.head.start + offset === fx.lineOf('## 小标题测试'),
    `标题行号换算正确（文件 ${fx.lineOf('## 小标题测试')}）`
  );
  check(
    a0.last.start + offset === fx.lineOf('最后一段。'),
    `最后一段行号换算正确（文件 ${fx.lineOf('最后一段。')}）`
  );
  check(
    a0.multi.start + offset === fx.lineOf('这是跨行的段落第一行') && a0.multi.end === a0.multi.start + 1,
    `软换行段落自带正确区间（页面 ${a0.multi.start}..${a0.multi.end} → 文件 ${fx.lineOf('这是跨行的段落第一行')}..${fx.lineOf('第二行接着写')}）`
  );

  // ---------------------------------------------------------------- [2]
  console.log('\n[2] HTTP 契约（真实请求打到 node:http 上的中间件）');

  const handler = createEditHandler();
  const server = http.createServer((req, res) => {
    handler(req, res, () => {
      res.statusCode = 404;
      res.end('NOT_AN_EDIT_ROUTE');
    });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const BASE = `http://127.0.0.1:${port}`;

  const api = async (method, body, query = '') => {
    const res = await fetch(`${BASE}/__edit/note${query}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    let json = null;
    try {
      json = await res.json();
    } catch {
      /* 非 JSON */
    }
    return { status: res.status, json };
  };

  /** 原始请求：可以伪造 Host 头（fetch 不允许改 Host） */
  const raw = (method, pathName, headers = {}, body = '') =>
    new Promise((resolve, reject) => {
      const req = http.request(
        {
          host: '127.0.0.1',
          port,
          method,
          path: pathName,
          headers: {
            ...(body
              ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
              : {}),
            ...headers,
          },
        },
        (res) => {
          let data = '';
          res.setEncoding('utf8');
          res.on('data', (c) => (data += c));
          res.on('end', () => resolve({ status: res.statusCode, text: data }));
        }
      );
      req.on('error', reject);
      if (body) req.write(body);
      req.end();
    });

  const editLines = (a, text) =>
    api('POST', { op: 'lines', collection: 'notes', id: fx.NOTE_ID, start: a.start, end: a.end, text });

  try {
    // ---- 读取
    let r = await api('GET', null, `?collection=notes&id=${encodeURIComponent(fx.NOTE_ID)}`);
    check(r.status === 200 && r.json?.ok === true, 'GET 读回源文件成功');
    check(r.json?.path === fx.REL_PATH, 'GET 返回仓库内相对路径');
    check(typeof r.json?.frontmatter === 'string' && typeof r.json?.body === 'string', 'GET 同时返回 frontmatter 与正文');

    // ---- 行内改字：单行（用页面会给出的行号）
    let a = await attrs({ plain: '第一段是纯文本' });
    const plainFileLine = fx.lineOf('第一段是纯文本');
    r = await editLines(a.plain, '第一段已经被行内改字改过了。');
    check(r.status === 200 && r.json?.ok === true, '行内改字：保存成功');
    check(fx.readLines()[plainFileLine - 1] === '第一段已经被行内改字改过了。', '页面行号 → 写对了文件行');

    // ---- 行内改字：软换行的跨行段落合并
    const linesBefore = fx.readLines().length;
    a = await attrs({ multi: '这是跨行的段落第一行' });
    r = await editLines(a.multi, '跨行段落被合并成一行了。');
    check(r.status === 200, '行内改字：跨行段落保存成功');
    check(fx.readLines()[fx.lineOf('跨行段落被合并成一行了。') - 1] === '跨行段落被合并成一行了。', '两行被合成一行');
    check(fx.readLines().length === linesBefore - 1, '文件行数相应减少 1 行');
    check(fx.lineOf('- 列表项测试') === fx.lineOf('跨行段落被合并成一行了。') + 2, '后面的块没有错位');

    // ---- 行内改字：列表项 / 标题前缀保留
    a = await attrs({ list: '列表项测试' });
    r = await editLines(a.list, '列表项测试（改过）');
    check(r.status === 200 && fx.readLines()[fx.lineOf('列表项测试（改过）') - 1] === '- 列表项测试（改过）', '列表项的 “- ” 前缀被保留');

    a = await attrs({ head: '小标题测试', last: '最后一段。' });
    r = await editLines(a.head, '改过的标题');
    check(r.status === 200 && fx.readLines()[fx.lineOf('改过的标题') - 1] === '## 改过的标题', '标题的 “## ” 前缀被保留');

    // ---- 行内改字的拒绝路径
    r = await editLines(a.last, '   ');
    check(r.status === 400, '空内容被拒（避免把 Markdown 结构写坏）');

    r = await api('POST', { op: 'lines', collection: 'notes', id: fx.NOTE_ID, start: 999999, end: 999999, text: 'x' });
    check(r.status === 400 && /行号越界/.test(r.json?.error || ''), '越界行号被拒，并说明换算后的文件行号');

    r = await api('POST', { op: 'lines', collection: 'notes', id: fx.NOTE_ID, start: 1.5, end: 2, text: 'x' });
    check(r.status === 400, '非整数行号被拒');

    r = await editLines(a.last, '带 *星号* 与 $公式$ 的文字');
    check(r.status === 200 && (r.json?.warnings?.length ?? 0) > 0, '含 Markdown 特殊符号时给出提醒（不拦，但会告知）');

    // ---- 编辑原文
    const rawFmBefore = fx.rawFrontmatter(fx.readFile());
    r = await api('POST', { op: 'body', collection: 'notes', id: fx.NOTE_ID, body: '整段正文被替换了。\n\n再来一段。\n' });
    check(r.status === 200, 'op: body 保存成功');
    check(fx.rawFrontmatter(fx.readFile()) === rawFmBefore, 'frontmatter 一个字节都没动（用 Astro 自己的解析器比对）');
    check(fx.bodyOf(fx.readFile()) === '整段正文被替换了。\n\n再来一段。', '正文精确替换为新内容（按 Astro 的口径比对）');

    r = await api('POST', { op: 'full', collection: 'notes', id: fx.NOTE_ID, content: '没有 frontmatter 的内容' });
    check(r.status === 400, 'op: full 缺 frontmatter 时被拒（防止整篇元信息消失）');

    const goodFull = '---\ntitle: 整份替换测试\ndate: "2026-01-02"\n---\n\n整份替换后的正文。\n';
    r = await api('POST', { op: 'full', collection: 'notes', id: fx.NOTE_ID, content: goodFull });
    check(r.status === 200 && fx.readFile() === goodFull, 'op: full 带合法 frontmatter 时写入成功');

    r = await api('POST', { op: '不存在的操作', collection: 'notes', id: fx.NOTE_ID });
    check(r.status === 400, '未知 op 被拒');

    // ---- 安全边界
    r = await api('GET', null, '?collection=blog&id=x');
    check(r.status === 404, '未开放编辑的集合（blog）→ 404');
    r = await api('GET', null, '?collection=notes&id=..%2F..%2F..%2Fpackage');
    check(r.status === 400 || r.status === 403, '路径穿越（../）被拒');
    r = await api('GET', null, '?collection=notes&id=根本不存在的笔记');
    check(r.status === 404, '不存在的笔记 → 404');
    r = await api('GET', null, '?collection=notes');
    check(r.status === 400, '缺 id → 400');

    const forged = await raw('GET', `/__edit/note?collection=notes&id=${encodeURIComponent(fx.NOTE_ID)}`, {
      Host: 'evil.example.com',
    });
    check(forged.status === 403, '伪造 Host 头被拒（防 DNS rebinding）');

    const goodHost = await raw('GET', `/__edit/note?collection=notes&id=${encodeURIComponent(fx.NOTE_ID)}`, {
      Host: `localhost:${port}`,
    });
    check(goodHost.status === 200, 'localhost 的 Host 头正常放行');

    // ---- 不该吞掉正常请求
    const other = await raw('GET', '/notes/whatever/');
    check(other.status === 404 && other.text === 'NOT_AN_EDIT_ROUTE', '非编辑接口的请求被原样放行（next）');

    const empty = await raw('POST', '/__edit/note', { 'Content-Type': 'application/json' }, '');
    check(empty.status === 400, '空请求体的 POST → 400（不会打崩服务）');

    const notFound = await raw('POST', '/__edit/unknown', { 'Content-Type': 'application/json' }, '{}');
    check(notFound.status === 404, '未知编辑接口 → 404');
  } finally {
    await new Promise((r) => server.close(r));
    fx.removeFixture();
  }

  check(!fs.existsSync(fx.NOTE_FILE), '临时笔记已删除');

  console.log(
    `\n${fail === 0 ? '\u001b[32m✅ 全部通过\u001b[0m' : `\u001b[31m❌ ${fail} 项未通过\u001b[0m`}（通过 ${pass} 项）\n`
  );
  process.exitCode = fail === 0 ? 0 : 1;
}

main().catch((err) => {
  bad(`测试异常中断：${err.stack || err.message}`);
  try {
    fx.removeFixture();
  } catch {
    /* 忽略 */
  }
  process.exitCode = 1;
});
