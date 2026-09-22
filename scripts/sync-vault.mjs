#!/usr/bin/env node
/**
 * sync-vault.mjs — 把 Obsidian 知识库里「可以公开」的笔记编译成网站内容。
 *
 * 流程：
 *   1. 扫库建索引（笔记 basename / 别名 → slug；图片 basename → 路径）
 *   2. 按白名单 + 硬黑名单 + frontmatter 开关筛出可公开笔记
 *   3. 内容级密钥扫描（第二道闸）
 *   4. 清洗正文：wikilink → 站内链接、图片双链 → 复制图片 + md 图片
 *   5. 落盘到 src/content/notes/，并输出一份同步报告
 *
 * 用法： pnpm sync
 * 只读演练： pnpm sync --dry
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../content-sync.config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry');

const VAULT = config.vaultRoot;
const OUT_DIR = path.join(ROOT, config.outDir);
const IMG_DIR = path.join(ROOT, config.imageOutDir);

/**
 * 同步清单：记录「上一次同步生成了哪些文件」。
 *
 * 为什么需要它：早期版本直接 rmSync 整个输出目录，
 * 那会把手写的网站笔记一起删掉（因为网站笔记也放在 src/content/notes/）。
 * 改成按清单精确删除 —— 只清理自己生成的东西，绝不碰你的手写内容。
 */
const MANIFEST_PATH = path.join(ROOT, '.sync-manifest.json');

function loadManifest() {
  try {
    const m = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    return { notes: m.notes ?? [], images: m.images ?? [] };
  } catch {
    return { notes: [], images: [] };
  }
}

/** 本次运行实际引用的图片名（用于写入新清单） */
const generatedImages = new Set();

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif', '.bmp']);
const SKIP_DIRS = new Set(['.obsidian', '.trash', '.claude', '.dsh', '.git', 'node_modules', '%SystemDrive%']);

const report = {
  scanned: 0,
  published: 0,
  skippedPrivate: [],
  skippedBlocked: [],
  skippedSecret: [],
  skippedOversize: [],
  unresolvedLinks: new Map(),
  imagesCopied: 0,
  imagesMissing: [],
  collisions: [],
};

// ---------------------------------------------------------------- 工具函数

function walk(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function relToVault(full) {
  return toPosix(path.relative(VAULT, full));
}

/** 生成 URL 安全的 slug：保留中英文与数字，其余折叠成连字符 */
function makeSlug(name) {
  return name
    .replace(/\.md$/i, '')
    // C++ → Cpp（`+` 在静态托管的路径里容易出问题，先换掉）
    .replace(/\+/g, 'p')
    .replace(/[\\/:*?"<>|#%{}^~\[\]`'@!$&()+,;=]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/** 极简 YAML frontmatter 解析：覆盖本库实际出现的写法 */
function parseFrontmatter(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!m) return { data: {}, body: raw, hasFm: false };

  const data = {};
  const lines = m[1].split(/\r?\n/);
  let key = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || /^\s*#/.test(line)) continue;

    // 块数组： key:\n  - item
    const listItem = /^\s+-\s+(.*)$/.exec(line);
    if (listItem && key) {
      if (!Array.isArray(data[key])) data[key] = data[key] == null ? [] : [data[key]];
      data[key].push(scalar(listItem[1]));
      continue;
    }

    // 嵌套 map（如 Obsidian 主页插件的配置）——本库中出现在被排除的目录里，直接忽略
    if (/^\s+\S/.test(line)) continue;

    const kv = /^([A-Za-z0-9_\u4e00-\u9fa5-]+)\s*:\s*(.*)$/.exec(line);
    if (!kv) continue;

    key = kv[1];
    const rest = kv[2].trim();

    if (rest === '') {
      data[key] = '';            // 可能是后面跟块数组
    } else if (rest.startsWith('[') && rest.endsWith(']')) {
      data[key] = rest
        .slice(1, -1)
        .split(',')
        .map((s) => scalar(s.trim()))
        .filter((s) => s !== '');
    } else {
      data[key] = scalar(rest);
    }
  }
  return { data, body: raw.slice(m[0].length), hasFm: true };
}

function scalar(v) {
  if (v == null) return v;
  let s = String(v).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  return s;
}

/** 去掉字段里的 Obsidian 双链语法（本库里有笔记把 subject 写成 [[xxx]]） */
function cleanField(v) {
  return String(v ?? '')
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .trim();
}

/** 输出 YAML 字符串值 */
function yamlStr(v) {
  const s = String(v ?? '').replace(/"/g, '\\"');
  return `"${s}"`;
}

/** 判断某路径是否命中硬黑名单（子串匹配，永远优先于白名单） */
function isHardBlocked(relPath) {
  return config.hardBlocklist.some((frag) => relPath.includes(frag));
}

/**
 * 白名单匹配：支持子目录，最长 key 优先。
 * 返回命中的配置对象（含 label / kind），未命中返回 null。
 */
function matchInclude(relPath) {
  let best = null;
  let bestLen = -1;
  for (const [key, cfg] of Object.entries(config.includeFolders)) {
    if (relPath === key || relPath.startsWith(key + '/')) {
      if (key.length > bestLen) {
        bestLen = key.length;
        best = { key, ...cfg };
      }
    }
  }
  return best;
}

/** 内容级密钥扫描 —— 返回命中的规则数 */
function scanSecrets(text) {
  let hits = 0;
  for (const re of config.secretPatterns) {
    re.lastIndex = 0;
    if (re.test(text)) hits++;
  }
  return hits;
}

// ------------------------------------------------------- 1. 扫库建索引

if (!fs.existsSync(VAULT)) {
  console.error(`✗ 找不到知识库目录：${VAULT}`);
  console.error('  请检查 content-sync.config.mjs 里的 vaultRoot。');
  process.exit(1);
}

console.log(`▸ 扫描知识库：${VAULT}`);
const allFiles = walk(VAULT);
const mdFiles = allFiles.filter((f) => f.toLowerCase().endsWith('.md'));
const imgFiles = allFiles.filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()));
report.scanned = mdFiles.length;

// basename → relPath（用于解析 [[双链]]）
const noteIndex = new Map();
// 别名 → relPath
const aliasIndex = new Map();
// 图片 basename → 绝对路径
const imageIndex = new Map();

for (const f of mdFiles) {
  const base = path.basename(f, '.md');
  const rel = relToVault(f);
  if (!noteIndex.has(base)) noteIndex.set(base, rel);
  else if (noteIndex.get(base) !== rel) {
    // 同名笔记：保留先到的，记一笔
    report.collisions.push(base);
  }
}

for (const f of imgFiles) {
  const base = path.basename(f);
  if (!imageIndex.has(base)) imageIndex.set(base, f);
}

console.log(`  笔记 ${mdFiles.length} 篇 / 图片 ${imgFiles.length} 张`);

// --------------------------------------------------- 2. 筛选可公开笔记

const candidates = [];

for (const f of mdFiles) {
  const rel = relToVault(f);

  // 硬黑名单优先
  if (isHardBlocked(rel)) {
    report.skippedBlocked.push(rel);
    continue;
  }

  // 白名单目录（支持子路径，最长匹配优先）
  const inc = matchInclude(rel);
  const inWhitelist = inc !== null;

  let raw;
  try {
    raw = fs.readFileSync(f, 'utf8');
  } catch {
    continue;
  }

  if (Buffer.byteLength(raw, 'utf8') > config.maxNoteBytes) {
    report.skippedOversize.push(rel);
    continue;
  }

  const { data, body } = parseFrontmatter(raw);

  // frontmatter 级开关
  const explicitlyPrivate =
    data.private === true || data.private === 'true' ||
    data.publish === false || data.publish === 'false' ||
    data.draft === true || data.draft === 'true';
  const explicitlyPublic = data.publish === true || data.publish === 'true';

  if (explicitlyPrivate) {
    report.skippedPrivate.push(rel);
    continue;
  }
  if (!inWhitelist && !explicitlyPublic) {
    report.skippedBlocked.push(rel);
    continue;
  }

  // 第二道闸：密钥扫描
  if (scanSecrets(raw) > 0) {
    report.skippedSecret.push(rel);
    continue;
  }

  candidates.push({
    full: f, rel, raw, data, body,
    topFolder: rel.split('/')[0],
    category: inc?.label || rel.split('/')[0],
    kind: inc?.kind || 'note',
  });
}

console.log(`  可公开候选：${candidates.length} 篇`);

// 用候选笔记的别名补索引（只在公开集合内互链，避免链到不存在的页面）
for (const c of candidates) {
  const aliases = Array.isArray(c.data.aliases) ? c.data.aliases : c.data.aliases ? [c.data.aliases] : [];
  for (const a of aliases) {
    const key = String(a).trim();
    if (key && !aliasIndex.has(key)) aliasIndex.set(key, c.rel);
  }
}

// relPath → slug
const slugByRel = new Map();
const usedSlugs = new Set();
for (const c of candidates) {
  let slug = makeSlug(path.basename(c.rel, '.md'));
  if (!slug) slug = 'note';
  let final = slug;
  let n = 2;
  while (usedSlugs.has(final)) final = `${slug}-${n++}`;
  usedSlugs.add(final);
  slugByRel.set(c.rel, final);
}

// ------------------------------------------- 3. 正文清洗 + 链接转换

/** 把 [[目标]] / [[目标|别名]] 解析成站内 URL */
function resolveWikilink(target) {
  let t = target.trim();
  let anchor = '';
  const hashIdx = t.indexOf('#');
  if (hashIdx >= 0) {
    anchor = t.slice(hashIdx + 1);
    t = t.slice(0, hashIdx);
  }
  t = t.replace(/\\/g, '/').trim();
  const base = path.basename(t);

  const rel = noteIndex.get(base) || noteIndex.get(t) || aliasIndex.get(base);
  if (!rel || !slugByRel.has(rel)) return null;
  return { slug: slugByRel.get(rel), anchor };
}

/**
 * 代码块语言规范化。
 *
 * Shiki 的语言 id 是**区分大小写**的：```Java 会被当成未知语言，静默退化成纯文本，
 * 语法高亮全丢。本库里有 125 个代码块犯了这个毛病（Java/SQL/XML/YAML/HTML）。
 */
const LANG_ALIAS = {
  cxx: 'cpp', 'c++': 'cpp', 'c#': 'csharp', cs: 'csharp',
  js: 'javascript', ts: 'typescript', py: 'python',
  sh: 'bash', shell: 'bash',
  yml: 'yaml',
  plain: 'text', plaintext: 'text', txt: 'text',
  xsd: 'xml', dtd: 'xml',
};

function normalizeLang(raw) {
  const l = String(raw || '').trim().toLowerCase();
  if (!l) return '';
  return LANG_ALIAS[l] || l;
}

// ---------------------------------------------------------- 公式定界符修复

/**
 * 把「多行 $$ 公式」的定界符整理成独占一行。
 *
 * 为什么需要（已用 remark-math 实测验证）：
 *   remark-math 只有在 `$$` 后面**只剩空白**时，才会把它识别为块级公式。
 *   如果写成 `$$\begin{aligned}`（$$ 后面紧跟内容），`\begin{aligned}` 会被当成普通文本吞掉，
 *   公式里只剩下 `&` 对齐符 —— KaTeX 直接报 "Expected 'EOF', got '&'"，
 *   页面上渲染成一段红色错误文字。
 *
 * 本库里有 14 个页面踩了这个坑（全部是 aligned / cases / matrix 环境）。
 * 这里自动把定界符挪到独立行，源笔记不用改。
 *
 * 只处理**跨行**的公式；单行 `$$x$$` 保持原样（remark-math 能正确处理）。
 * 支持引用块（`> $$...`），插入新行时会保留 `>` 前缀。
 */
function normalizeDisplayMath(body) {
  const segments = body.split(/(^[ \t]*```[^\n]*\n[\s\S]*?^[ \t]*```[ \t]*$)/m);
  return segments
    .map((seg, i) => (i % 2 === 1 ? seg : normalizeMathSegment(seg)))
    .join('');
}

function splitQuotePrefix(line) {
  const m = /^([ \t]*(?:>[ \t]?)*)([\s\S]*)$/.exec(line);
  return [m[1], m[2]];
}

/**
 * 把行内代码（`...`）的内容替换成等长的 \x00。
 * 长度不变 ⇒ 索引位置仍可映射回原文，但扫描 $$ 时不会误命中代码里的内容。
 */
function maskInlineCode(text) {
  return text
    .split('\n')
    .map((line) => {
      let out = '';
      let i = 0;
      while (i < line.length) {
        if (line[i] === '`') {
          let n = 1;
          while (line[i + n] === '`') n++;
          const fence = '`'.repeat(n);
          const close = line.indexOf(fence, i + n);
          if (close >= 0) {
            out += fence + '\x00'.repeat(close - (i + n)) + fence;
            i = close + n;
            continue;
          }
        }
        out += line[i++];
      }
      return out;
    })
    .join('\n');
}

/** 取 pos 所在行的引用块前缀（`> ` 之类） */
function prefixAt(text, pos) {
  const lineStart = text.lastIndexOf('\n', pos - 1) + 1;
  let end = lineStart;
  while (end < text.length && /[ \t]/.test(text[end])) end++;
  while (end < text.length && text[end] === '>') {
    end++;
    if (text[end] === ' ') end++;
  }
  return text.slice(lineStart, end);
}

/**
 * 把「跨行的 $$ 公式」的定界符整理到独立行。
 *
 * 为什么要做（已用 remark-math 实测验证）：
 *   remark-math 只有在 `$$` 后面**只剩空白**时，才把它识别为块级公式。
 *   若写成 `$$\begin{aligned}` 或 `$$S = \begin{cases}`（$$ 后面紧跟内容）且公式跨行，
 *   定界符之后的内容会被当成普通文本吞掉，公式里只剩下 `&` 对齐符，
 *   KaTeX 报 "Expected 'EOF', got '&'"，页面渲染成一段红色错误文字。
 *
 * 处理策略：
 *   · 先把行内代码屏蔽掉，再按索引扫描所有 $$ 并按顺序两两配对；
 *   · 只有当一对 $$ 之间**跨行**时才调整，单行 `$$x$$` 一律不动；
 *   · 插入换行时保留引用块前缀（`> `），不会把内容踢出引用块。
 */
function normalizeMathSegment(text) {
  const masked = maskInlineCode(text);

  // 收集所有未被转义的 $$
  const positions = [];
  for (let i = 0; i < masked.length - 1; i++) {
    if (masked[i] === '\\') { i++; continue; }        // 跳过 \$ 转义
    if (masked[i] === '$' && masked[i + 1] === '$') {
      positions.push(i);
      i++;
    }
  }
  if (positions.length < 2) return text;

  // 按顺序两两配对，收集需要插入的换行
  const inserts = []; // {pos, text}
  for (let k = 0; k + 1 < positions.length; k += 2) {
    const open = positions[k];
    const close = positions[k + 1];
    const inner = text.slice(open + 2, close);
    if (!inner.includes('\n')) continue;             // 单行公式，跳过

    // ① 开定界符后紧跟内容 → 在 $$ 之后补一个换行 + 前缀
    const afterOpen = text.slice(open + 2);
    const openLineRest = afterOpen.slice(0, afterOpen.indexOf('\n'));
    if (openLineRest.trim() !== '') {
      inserts.push({ pos: open + 2, text: '\n' + prefixAt(text, open) });
    }

    // ② 闭定界符前有内容 → 在 $$ 之前补一个换行 + 前缀
    const lineStart = text.lastIndexOf('\n', close - 1) + 1;
    const beforeClose = text.slice(lineStart, close);
    if (beforeClose.trim() !== '') {
      inserts.push({ pos: close, text: '\n' + prefixAt(text, close) });
    }

    // ③ 闭定界符后还有内容（如 `$$（2分）`）→ 在 $$ 之后补一个换行 + 前缀
    //    否则 $$ 后面粘着文字，remark-math 依然不会把它当块级公式定界符。
    const afterClose = text.slice(close + 2);
    const closeLineRest = afterClose.slice(0, afterClose.indexOf('\n'));
    if (closeLineRest.trim() !== '') {
      inserts.push({ pos: close + 2, text: '\n' + prefixAt(text, close) });
    }
  }

  if (inserts.length === 0) return text;

  // 从后往前插入，避免位置位移
  inserts.sort((a, b) => b.pos - a.pos);
  let out = text;
  for (const { pos, text: ins } of inserts) {
    out = out.slice(0, pos) + ins + out.slice(pos);
  }
  return out;
}

function transformBody(body, rel) {
  let out = body;

  // 去掉 Obsidian 注释 %%...%%
  out = out.replace(/%%[\s\S]*?%%/g, '');

  // 去掉 dataview / 查询代码块（网站上是空壳，留着难看）
  out = out.replace(/```(?:dataview|dataviewjs|query)\b[\s\S]*?```/gi, '');

  // 代码块语言统一小写（保住 Shiki 语法高亮）
  out = out.replace(
    /^(\s*```)([A-Za-z][A-Za-z0-9+#._-]*)\s*$/gm,
    (whole, fence, lang) => fence + normalizeLang(lang)
  );

  // 多行 $$ 公式的定界符挪到独立行（否则 \begin{aligned} 会被吞掉导致 KaTeX 报错）
  out = normalizeDisplayMath(out);

  // 图片双链： ![[name.png]] / ![[name.png|300]] / ![[name.png|alt]]
  out = out.replace(/!\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]/g, (whole, target, pipe) => {
    const name = path.basename(String(target).trim());
    if (!IMAGE_EXT.has(path.extname(name).toLowerCase())) {
      // 不是图片 → 当普通双链处理
      const r = resolveWikilink(String(target));
      return r ? `[${name}](/notes/${r.slug}/)` : name;
    }
    const src = imageIndex.get(name);
    if (!src) {
      report.imagesMissing.push(`${rel} → ${name}`);
      return `*（图片缺失：${name}）*`;
    }
    // 复制图片
    if (!DRY) {
      fs.mkdirSync(IMG_DIR, { recursive: true });
      const dest = path.join(IMG_DIR, name);
      if (!fs.existsSync(dest)) fs.copyFileSync(src, dest);
    }
    generatedImages.add(name);
    report.imagesCopied++;
    // |300 这种是宽度，忽略；其余当 alt
    const alt = pipe && !/^\d+$/.test(String(pipe).trim()) ? String(pipe).trim() : name;
    return `![${alt}](/notes-assets/${encodeURIComponent(name)})`;
  });

  // 笔记双链： [[目标]] / [[目标|别名]] / [[目标#小节]]
  out = out.replace(/\[\[([^\]]+?)\]\]/g, (whole, inner) => {
    const [targetPart, aliasPart] = String(inner).split('|');
    const r = resolveWikilink(targetPart);
    const label = (aliasPart ?? path.basename(String(targetPart).split('#')[0])).trim();
    if (!r) {
      report.unresolvedLinks.set(
        String(targetPart),
        (report.unresolvedLinks.get(String(targetPart)) || 0) + 1
      );
      return label; // 目标不在公开集合里 → 退化成纯文本，不留死链
    }
    return `[${label}](/notes/${r.slug}/)`;
  });

  // 指向本地 md 的相对链接 → 尽量转成站内链接
  out = out.replace(/\[([^\]]+)\]\(([^)]+\.md)(#[^)]*)?\)/g, (whole, label, href) => {
    const base = path.basename(decodeURIComponent(href), '.md');
    const rel2 = noteIndex.get(base);
    if (rel2 && slugByRel.has(rel2)) return `[${label}](/notes/${slugByRel.get(rel2)}/)`;
    return label;
  });

  return out;
}

// ---------------------------------------------------------- 4. 落盘

// 清理上一次同步的产物（只删清单里记录的，不动手写文件）
const prevManifest = loadManifest();
let removedCount = 0;

if (!DRY) {
  for (const f of prevManifest.notes) {
    const p = path.join(OUT_DIR, f);
    if (fs.existsSync(p)) { fs.rmSync(p); removedCount++; }
  }
  for (const f of prevManifest.images) {
    const p = path.join(IMG_DIR, f);
    if (fs.existsSync(p)) { fs.rmSync(p); removedCount++; }
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const manifest = [];
const generatedNotes = [];

for (const c of candidates) {
  const slug = slugByRel.get(c.rel);
  const body = transformBody(c.body, c.rel);
  const title =
    (typeof c.data.title === 'string' && c.data.title.trim()) ||
    path.basename(c.rel, '.md');

  const tags = Array.isArray(c.data.tags)
    ? c.data.tags.map(String)
    : c.data.tags
      ? [String(c.data.tags)]
      : [];

  const category = c.category;
  const dateSrc =
    c.data.created_date || c.data.created || c.data.date || c.data.upload_date || '';
  const date = /^\d{4}-\d{2}-\d{2}/.test(String(dateSrc)) ? String(dateSrc).slice(0, 10) : '';

  const fm = [
    '---',
    `title: ${yamlStr(title)}`,
    `slug: ${yamlStr(slug)}`,
    `category: ${yamlStr(category)}`,
    `kind: ${yamlStr(c.kind)}`,
    `subject: ${yamlStr(cleanField(c.data.subject))}`,
    `subfield: ${yamlStr(cleanField(c.data.subfield))}`,
    `topic: ${yamlStr(cleanField(c.data.topic))}`,
    `difficulty: ${yamlStr(cleanField(c.data.difficulty))}`,
    `date: ${yamlStr(date)}`,
    `sourcePath: ${yamlStr(c.rel)}`,
    `url: ${yamlStr(c.data.url || '')}`,
    tags.length ? `tags: [${tags.map(yamlStr).join(', ')}]` : 'tags: []',
    '---',
    '',
  ].join('\n');

  if (!DRY) {
    fs.writeFileSync(path.join(OUT_DIR, `${slug}.md`), fm + body, 'utf8');
    generatedNotes.push(`${slug}.md`);
  }
  manifest.push({ slug, title, category, date, rel: c.rel });
  report.published++;
}

// 写入新清单（供下次同步精确清理用）
if (!DRY) {
  fs.writeFileSync(
    MANIFEST_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        note: '本文件由 scripts/sync-vault.mjs 自动维护，记录同步生成的文件，用于下次精确清理。手写内容不会被记录、也不会被删除。',
        notes: generatedNotes,
        images: [...generatedImages],
      },
      null,
      2
    ) + '\n',
    'utf8'
  );
}

// ------------------------------------------------------- 5. 报告

console.log('\n════════════════ 同步报告 ════════════════');
console.log(`✓ 已发布      ${report.published} 篇`);
console.log(`  └ 图片引用  ${report.imagesCopied} 处`);
console.log(`✗ 黑名单拦截  ${report.skippedBlocked.length} 篇`);
console.log(`✗ 手动隐藏    ${report.skippedPrivate.length} 篇`);
console.log(`✗ 体积超限    ${report.skippedOversize.length} 篇`);
if (removedCount > 0) {
  console.log(`↺ 清理上次产物 ${removedCount} 个文件（手写内容不受影响）`);
}

if (report.published === 0) {
  console.log(
    '\nℹ 当前白名单为空，没有任何笔记被同步 —— 这是「只发布重构过的内容」模式的正常状态。\n' +
      '  想重新开启同步：编辑 content-sync.config.mjs 的 includeFolders，填上要公开的目录。'
  );
}

if (report.skippedSecret.length) {
  console.log(`\n🚨 密钥扫描拦截 ${report.skippedSecret.length} 篇（已阻止上网）：`);
  for (const f of report.skippedSecret) console.log(`     ${f}`);
}

if (report.imagesMissing.length) {
  console.log(`\n⚠ 缺失图片 ${report.imagesMissing.length} 处（前 10）：`);
  for (const f of report.imagesMissing.slice(0, 10)) console.log(`     ${f}`);
}

if (report.unresolvedLinks.size) {
  const total = [...report.unresolvedLinks.values()].reduce((a, b) => a + b, 0);
  console.log(`\nℹ 未解析双链 ${report.unresolvedLinks.size} 个目标 / 共 ${total} 处`);
  console.log('  （目标笔记不在公开集合里，已退化为纯文本，不会产生死链）');
  const top = [...report.unresolvedLinks.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  for (const [t, n] of top) console.log(`     ${t} ×${n}`);
}

if (report.collisions.length) {
  console.log(`\nℹ 同名笔记 ${report.collisions.length} 个（已自动加后缀区分）：`);
  for (const c of report.collisions.slice(0, 10)) console.log(`     ${c}`);
}

const byCategory = {};
for (const m of manifest) byCategory[m.category] = (byCategory[m.category] || 0) + 1;
console.log('\n── 分类分布 ──');
for (const [k, v] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
  console.log(`   ${k.padEnd(12)} ${v} 篇`);
}

if (DRY) console.log('\n（--dry 演练模式，未写入任何文件）');
console.log('');
