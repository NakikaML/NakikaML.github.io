#!/usr/bin/env node
/**
 * verify-build.mjs —— 构建产物自检
 *
 * 检查项：
 *   1. 关键页面是否都生成了
 *   2. LaTeX 公式是否真的渲染成 KaTeX（而不是残留 $...$）
 *   3. 有没有残留的 Obsidian 双链 [[...]]
 *   4. 笔记引用的图片是否都存在
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
  ['知识地图', 'maps/index.html'],
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
