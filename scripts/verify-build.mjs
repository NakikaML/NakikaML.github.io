#!/usr/bin/env node
/**
 * verify-build.mjs —— 构建产物自检
 *
 * 检查项：
 *   1. 关键页面是否都生成了
 *   2. LaTeX 公式是否真的渲染成 KaTeX（而不是残留 $...$）
 *   3. 有没有残留的 Obsidian 双链 [[...]]
 *   4. 笔记引用的图片是否都存在
 *   4b. 根路径静态资源（作品封面等）是否都存在
 *   4c. 每篇笔记是否都产出了可下载的 .md 原文、详情页是否链到了它
 *   4d. 正文配图是否都带 lazy / width+height / 放大标记
 *   5. 产物体积构成
 *
 * 用法： node scripts/verify-build.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

if (!fs.existsSync(DIST)) {
  console.error('✗ 找不到 dist/，先运行 pnpm build');
  process.exit(1);
}

const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => console.log(`  ✗ ${m}`);
const info = (m) => console.log(`    ${m}`);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const all = walk(DIST);
const htmlFiles = all.filter((f) => f.endsWith('.html'));
let failures = 0;

// ---------------------------------------------------------- 1. 关键页面
console.log('\n【1】关键页面');
const required = [
  ['首页', 'index.html'],
  ['关于我', 'about/index.html'],
  ['履历（跳转到 /about/#cv）', 'cv/index.html'],
  ['笔记列表', 'notes/index.html'],
  ['知识图谱', 'notes/graph/index.html'],
  ['博客列表', 'blog/index.html'],
  ['作品集', 'works/index.html'],
  ['项目', 'projects/index.html'],
  ['404', '404.html'],
  ['RSS', 'rss.xml'],
  ['sitemap', 'sitemap-index.xml'],
  ['图标 favicon.ico', 'favicon.ico'],
  ['图标 apple-touch-icon', 'apple-touch-icon.png'],
  ['首页头像', 'avatar-360.webp'],
];
for (const [label, rel] of required) {
  if (fs.existsSync(path.join(DIST, rel))) ok(`${label} → /${rel}`);
  else { bad(`${label} 缺失：/${rel}`); failures++; }
}

// ------------------------------------------------------ 2. KaTeX 渲染
console.log('\n【2】LaTeX 公式渲染');
let pagesWithKatex = 0;
let pagesWithRawMath = 0;
let katexErrors = 0;
const errPages = [];
const rawSamples = [];

for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8');
  if (html.includes('class="katex')) pagesWithKatex++;

  // KaTeX 解析失败会渲染成 class="katex-error" 的红色文本
  const errs = (html.match(/class="katex-error"/g) || []).length;
  if (errs > 0) {
    katexErrors += errs;
    errPages.push(`${path.relative(DIST, f)} ×${errs}`);
  }

  // 页面上残留的字面 $$...$$（说明没被 remark-math 接住）
  const raw = html.match(/\$\$[^<>\n]{3,}\$\$/g);
  if (raw && raw.length > 0) {
    pagesWithRawMath++;
    if (rawSamples.length < 5) {
      rawSamples.push(`${path.relative(DIST, f)} → ${raw[0].slice(0, 70)}`);
    }
  }
}

ok(`${pagesWithKatex} 个页面渲染了 KaTeX 公式`);
if (katexErrors === 0) {
  ok('没有公式解析失败（katex-error）');
} else {
  bad(`${katexErrors} 处公式解析失败，分布在 ${errPages.length} 个页面：`);
  errPages.slice(0, 10).forEach(info);
  failures++;
}
if (pagesWithRawMath === 0) {
  ok('没有页面残留未渲染的 $$ 公式');
} else {
  console.log(`  ⚠ ${pagesWithRawMath} 个页面含字面 $$（多半位于代码块内，属正常）`);
  rawSamples.forEach(info);
}

// -------------------------------------------------------- 3. 双链残留
console.log('\n【3】Obsidian 双链残留');
let linkLeftovers = 0;
const linkSamples = [];
for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8');
  // 正文里出现 [[xxx]] 说明转换漏了（排除代码块里的合法内容较难，先粗筛）
  const m = html.match(/\[\[[^\]\n]{1,60}\]\]/g);
  if (m) {
    linkLeftovers += m.length;
    if (linkSamples.length < 5) linkSamples.push(`${path.relative(DIST, f)} → ${m[0]}`);
  }
}
if (linkLeftovers === 0) {
  ok('没有残留的 [[双链]]');
} else {
  console.log(`  ⚠ ${linkLeftovers} 处 [[...]] 残留（可能位于代码块内，属正常）：`);
  linkSamples.forEach(info);
}

// -------------------------------------------------------- 4. 图片完整性
console.log('\n【4】图片引用完整性');
const imgDir = path.join(DIST, 'notes-assets');
const present = new Set(
  fs.existsSync(imgDir) ? fs.readdirSync(imgDir) : []
);
const referenced = new Set();
for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/\/notes-assets\/([^"'\\)\s]+)/g)) {
    referenced.add(decodeURIComponent(m[1]));
  }
}
const missingImgs = [...referenced].filter((r) => !present.has(r));
ok(`磁盘上有 ${present.size} 张图，页面共引用 ${referenced.size} 张`);
if (missingImgs.length === 0) {
  ok('所有被引用的图片都存在');
} else {
  bad(`${missingImgs.length} 张被引用的图片找不到：`);
  missingImgs.slice(0, 8).forEach(info);
  failures++;
}

// ------------------------------------------- 4b. 根路径静态资源完整性
// 曾经踩过的坑：作品封面 cover 写 /works/xxx.png，但图被放进了
// src/content/works/ 而不是 public/works/。Astro 只把 public/ 原样拷进 dist/，
// 所以构建**不报错**、页面里却是一个 404 的 <img>（裂图）。
// 这里把「所有根路径静态资源引用」统一对照 dist/ 兜住，封面图也在内。
const ASSET_EXT = /\.(?:png|jpe?g|webp|gif|avif|svg|ico|bmp|mp3|mp4|webm|ogg|wav|pdf|woff2?|ttf|otf)$/i;
const assetRefs = new Map(); // 资源路径 → 首个引用它的页面
for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/(?:src|href)\s*=\s*"([^"]*)"|srcset\s*=\s*"([^"]*)"/gi)) {
    const raw = m[1] ?? m[2] ?? '';
    // srcset 是逗号分隔的候选列表，逐个拆开只取 URL 部分
    for (const cand of raw.split(',')) {
      const url = cand.trim().split(/\s+/)[0];
      if (!url || !url.startsWith('/') || url.startsWith('//')) continue;
      const clean = url.split('#')[0].split('?')[0];
      if (!ASSET_EXT.test(clean)) continue;
      let decoded = clean;
      try {
        decoded = decodeURIComponent(clean);
      } catch {
        /* 非法转义序列，按原样比对 */
      }
      if (!assetRefs.has(decoded)) assetRefs.set(decoded, path.relative(DIST, f));
    }
  }
}
const missingAssets = [...assetRefs].filter(
  ([p]) => !fs.existsSync(path.join(DIST, p.replace(/^\//, '')))
);
ok(`页面共引用 ${assetRefs.size} 个根路径静态资源`);
if (missingAssets.length === 0) {
  ok('所有根路径静态资源都存在于 dist/');
} else {
  bad(`${missingAssets.length} 个根路径静态资源缺失（页面上会显示成裂图）：`);
  missingAssets.slice(0, 10).forEach(([p, page]) => info(`${p}  ← 被 ${page} 引用`));
  info('提示：封面图要放在 public/ 下，cover 字段写 /works/xxx.png 才能被服务出去');
  failures++;
}

// ------------------------------------------- 4c. 笔记原文（.md）导出
// 每篇笔记都应该有一份可下载的 Markdown 原文（opinion-1），
// 由 src/pages/notes/[id].md.ts 这个静态端点产出。
// 踩坑点：端点路由写成 [id].md.ts 时才输出 /notes/xxx.md；
// 一旦 Astro 把它当成页面处理（或 build.format 把目录补进来），
// 页面里的下载链接就会变成 404，而且构建本身不会报错 —— 所以在这里兜住。
console.log('\n【4c】笔记原文（.md）导出');
const notesDir = path.join(DIST, 'notes');
/**
 * 注意：dist/notes/ 下除了「一篇笔记一个目录」，还会有 **别的子路由**
 * （目前是 /notes/graph/ 知识图谱）。那些不是笔记，没有也不该有 .md 原文，
 * 所以这里以 src/content/notes/ 里的真实笔记文件为准来认定「哪些是笔记详情页」，
 * 而不是把 notes/ 下每个带 index.html 的目录都当成笔记。
 */
const notesSrcDir = path.join(ROOT, 'src', 'content', 'notes');
const noteIds = fs.existsSync(notesSrcDir)
  ? fs
      .readdirSync(notesSrcDir)
      .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
      .map((f) => f.slice(0, -3))
  : [];
const notePageDirs = fs.existsSync(notesDir)
  ? fs
      .readdirSync(notesDir, { withFileTypes: true })
      .filter(
        (e) =>
          e.isDirectory() &&
          noteIds.includes(e.name) &&
          fs.existsSync(path.join(notesDir, e.name, 'index.html'))
      )
      .map((e) => e.name)
  : [];
const mdMissing = notePageDirs.filter((id) => !fs.existsSync(path.join(notesDir, `${id}.md`)));
ok(`笔记详情页 ${notePageDirs.length} 篇，产出 .md 原文 ${notePageDirs.length - mdMissing.length} 份`);
if (notePageDirs.length === 0) {
  console.log('  ⚠ 没有找到笔记详情页，跳过（笔记板块目前为空？）');
} else if (mdMissing.length === 0) {
  const sample = fs.readFileSync(path.join(notesDir, `${notePageDirs[0]}.md`), 'utf8');
  const hasFrontmatter = sample.startsWith('---');
  ok(`每篇笔记都有对应的 /notes/<id>.md${hasFrontmatter ? '（含 frontmatter）' : ''}`);
} else {
  bad(`${mdMissing.length} 篇笔记缺少 .md 原文（页面上的「下载原文」会 404）：`);
  mdMissing.slice(0, 8).forEach((id) => info(`/notes/${id}.md`));
  failures++;
}
// 详情页里确实链到了这份原文
if (notePageDirs.length > 0) {
  const noLink = notePageDirs.filter((id) => {
    const html = fs.readFileSync(path.join(notesDir, id, 'index.html'), 'utf8');
    return !html.includes(`/notes/${id}.md`);
  });
  if (noLink.length === 0) ok('每篇笔记详情页都有「下载原文 .md」链接');
  else {
    bad(`${noLink.length} 篇笔记详情页没有下载链接：`);
    noLink.slice(0, 8).forEach((id) => info(id));
    failures++;
  }
}

// ------------------------------------------- 4d. 正文图片优化（bug-5 / opinion-9）
// 图片必须懒加载、必须有宽高（否则加载时会顶动正文）、必须有放大标记。
console.log('\n【4d】正文图片优化与放大');
let imgTotal = 0;
let imgLazy = 0;
let imgSized = 0;
let imgZoomable = 0;
for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    // 只统计正文配图（站点图标、头像、作品封面这些不该被要求 lazy）
    if (!/\/notes-assets\//.test(tag)) continue;
    imgTotal++;
    if (/loading="lazy"/.test(tag)) imgLazy++;
    if (/\swidth="\d+"/.test(tag) && /\sheight="\d+"/.test(tag)) imgSized++;
    if (/data-zoomable|data-img-zoom/.test(tag)) imgZoomable++;
  }
}
if (imgTotal === 0) {
  console.log('  ⚠ 构建产物里没有正文配图，跳过');
} else {
  const report = (n, label, hint) => {
    if (n === imgTotal) ok(`${imgTotal} 张正文配图全部${label}`);
    else {
      console.log(`  ⚠ ${imgTotal - n}/${imgTotal} 张正文配图没有${label}（${hint}）`);
    }
  };
  report(imgLazy, ' lazy 懒加载', '见 scripts/rehype-image-figure.mjs');
  report(imgSized, ' width/height 占位', '图片尺寸解析失败时只会退化成不写尺寸');
  report(imgZoomable, '放大标记', '见 bug-5 / opinion-9');
  if (imgLazy < imgTotal || imgZoomable < imgTotal) failures++;
}

// ------------------------------------------------------------ 5. 体积
console.log('\n【5】产物体积构成');
const buckets = { html: 0, images: 0, js: 0, css: 0, other: 0 };
for (const f of all) {
  const size = fs.statSync(f).size;
  // 图片按扩展名统计 —— 以前只算 notes-assets，作品封面会被错算进 other
  if (/\.(png|jpe?g|webp|gif|avif|svg|ico|bmp)$/i.test(f)) buckets.images += size;
  else if (f.endsWith('.html')) buckets.html += size;
  else if (f.endsWith('.js')) buckets.js += size;
  else if (f.endsWith('.css')) buckets.css += size;
  else buckets.other += size;
}
const mb = (b) => (b / 1024 / 1024).toFixed(1) + ' MB';
for (const [k, v] of Object.entries(buckets)) {
  console.log(`    ${k.padEnd(8)} ${mb(v)}`);
}
console.log(`    ${'总计'.padEnd(7)} ${mb(all.reduce((s, f) => s + fs.statSync(f).size, 0))}`);

// 找出最大的几个 HTML 页面
const topHtml = htmlFiles
  .map((f) => ({ f, size: fs.statSync(f).size }))
  .sort((a, b) => b.size - a.size)
  .slice(0, 5);
console.log('\n    最大的 5 个页面：');
for (const { f, size } of topHtml) {
  console.log(`      ${(size / 1024).toFixed(0).padStart(6)} KB  ${path.relative(DIST, f)}`);
}

console.log(
  failures === 0
    ? '\n✅ 全部检查通过\n'
    : `\n❌ ${failures} 项检查未通过\n`
);
process.exit(failures === 0 ? 0 : 1);
