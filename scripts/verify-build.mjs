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
 *   4e. 声明了「最后更新」（updated）的笔记，详情页是否真的显示了「更新于」
 *   4f. 产物 CSS 是否关掉了编程连字（`!=` 不会被画成 `≠`）
 *   4g. 笔记页尾的「同课程笔记」列表是否真的渲染出来、高亮自己、且没有死链（opinion-8）
 *   4h. 例题 / callout 内嵌块是否真的渲染出来、没有残留围栏标记（opinion-22）
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
  ['学习路线', 'notes/route/index.html'],
  // 旧地址（知识图谱，opinion-24 下线）必须还在：astro.config.mjs 的 redirects
  // 会为它生成一个 meta refresh 页，老书签才不会 404。
  ['旧地址重定向 /notes/graph/', 'notes/graph/index.html'],
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
 * （目前是 /notes/route/ 学习路线，另有一个 /notes/graph/ 的旧地址重定向）。那些不是笔记，没有也不该有 .md 原文，
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
  // ⚠️ 不能用 /<img[^>]*>/：属性值里完全可能有 `>`（图注写「f″ > 0」就会），
  // 那样一个 `[^>]*` 会在引号中间截断，这一张图的 loading / width / data-zoomable
  // 就全都「看不见」，检查会报成「有图没懒加载」。按引号成对地吃掉属性才是对的。
  for (const m of html.matchAll(/<img\b(?:[^>"']|"[^"]*"|'[^']*')*>/g)) {
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

// ------------------------------------------- 4e. 「最后更新」字段（opinion-11）
// frontmatter 里写了 updated 的笔记，详情页必须真的显示「更新于 X」——否则字段写了等于没写，
// 而且不会报任何错。这里是构建产物层面唯一的兜底：字段有、字就得在页面上。
console.log('\n【4e】「最后更新」字段（opinion-11）');
/** 从手写原文的 frontmatter 里取一个 YYYY-MM-DD 标量 */
function fmDate(src, key) {
  const end = src.indexOf('\n---', 3);
  const fm = src.startsWith('---') && end > 0 ? src.slice(4, end) : '';
  const m = fm.match(new RegExp(`^${key}:\\s*["']?(\\d{4}-\\d{2}-\\d{2})`, 'm'));
  return m ? m[1] : '';
}
const declaredUpdates = [];
// 只查**真的产出了页面**的笔记（= 已发布）。`draft: true` 的笔记本来就不进产物，
// 拿它们的 frontmatter 去要求「页面上必须有『更新于』」是错的判定 ——
// 数学那 11 篇草稿在转正之前会让这一项永远红着（踩过）。
for (const id of notePageDirs) {
  const src = fs.readFileSync(path.join(notesSrcDir, `${id}.md`), 'utf8');
  const date = fmDate(src, 'date');
  const updated = fmDate(src, 'updated');
  // 跟 utils/notes.ts 的 noteUpdated 保持同一条判定：不比 date 晚就当没更新
  if (!updated || (date && updated <= date)) continue;
  declaredUpdates.push({ id, updated });
}
if (declaredUpdates.length === 0) {
  console.log('  ⚠ 没有笔记声明最后更新（frontmatter 加 updated: YYYY-MM-DD 即可标记修订）');
} else {
  const notShown = declaredUpdates.filter(({ id, updated }) => {
    const page = path.join(notesDir, id, 'index.html');
    if (!fs.existsSync(page)) return true;
    return !fs.readFileSync(page, 'utf8').includes(`更新于 ${updated}`);
  });
  if (notShown.length === 0) {
    ok(`${declaredUpdates.length} 篇笔记声明了最后更新，详情页都显示了「更新于」`);
    info(declaredUpdates.map(({ id, updated }) => `${updated}  ${id}`).join('\n    '));
  } else {
    bad(`${notShown.length} 篇声明了 updated 却没在页面上显示：`);
    notShown.slice(0, 8).forEach(({ id, updated }) => info(`${id}（frontmatter 写的是 ${updated}）`));
    info('提示：updated 必须比 date 晚才会显示，见 src/utils/notes.ts 的 noteUpdated()');
    failures++;
  }
}

// ------------------------------------------- 4f. 代码不启用编程连字（bug-10）
// 等宽编程字体默认会把 `!=` 合成 `≠`、`>=` 合成 `≥`，读者看着像源码被改了字符。
// 这里只保证「关连字」那条规则确实进了产物 —— 规则被谁删掉时能立刻发现。
// （渲染层面的验收靠人眼 + headless Chrome 对照，见 README「踩过的坑」#11。）
console.log('\n【4f】代码不启用编程连字（bug-10）');
const cssFiles = all.filter((f) => f.endsWith('.css'));
const ligOff = cssFiles.some((f) => /font-variant-ligatures:\s*none/.test(fs.readFileSync(f, 'utf8')));
if (ligOff) {
  ok('产物 CSS 有关闭编程连字的规则（font-variant-ligatures: none）');
} else {
  bad('产物 CSS 里找不到关闭连字的规则 —— 代码里的 != 可能又被画成 ≠');
  info('修复见 src/styles/global.css 的「代码里关掉编程连字」一节');
  failures++;
}

// ------------------------------------------- 4g. 页尾「同课程笔记」（opinion-8）
// 每篇笔记的页尾都该按 curriculum.ts 列出同课程全系列、并高亮自己。这块整块消失、高亮错行、
// 链接指向没构建出来的笔记，构建本身都不会报错，所以在这里逐页兜住：
//   ① 同 subfield 有 ≥2 篇的笔记，页尾必须真有这块列表；
//   ② 高亮（aria-current="page"）正好一行，且就是这一页自己；
//   ③ 列表里的链接必须都指向已构建的笔记（不能是死链）；
//   ④ 同一门课的其他已上线笔记都得在列表里（漏挂 / 漏渲染都能看出来）；
//   ⑤ 表头写的「共 N 篇」要和实际行数一致；
//   ⑥ 章号必须从头到尾递增（bug-16：以前直接照抄 curriculum.ts 数组的顺序，
//      高数那 11 章印出来是 1 → 2 → 7 → 4 → 3 → …，看着就是乱的）。
console.log('\n【4g】页尾「同课程笔记」（opinion-8）');
/** 从手写原文的 frontmatter 里取一个纯文本标量 */
function fmText(src, key) {
  const end = src.indexOf('\n---', 3);
  const fm = src.startsWith('---') && end > 0 ? src.slice(4, end) : '';
  const m = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : '';
}
const builtPages = new Set(notePageDirs);
const bySubfield = new Map();
for (const id of notePageDirs) {
  const src = fs.readFileSync(path.join(notesSrcDir, `${id}.md`), 'utf8');
  const subfield = fmText(src, 'subfield');
  if (!subfield) continue;
  if (!bySubfield.has(subfield)) bySubfield.set(subfield, []);
  bySubfield.get(subfield).push(id);
}
const noBlock = [];
const wrongCurrent = [];
const deadSeriesLinks = [];
const notListed = [];
const countMismatch = [];
const outOfOrder = [];
let seriesPages = 0;
for (const [course, ids] of bySubfield) {
  if (ids.length < 2) continue; // 这门课只有一篇：没有「其他笔记」可列，页面本来就不该有这块
  for (const id of ids) {
    const page = path.join(notesDir, id, 'index.html');
    const html = fs.readFileSync(page, 'utf8');
    const block = (html.match(/<nav class="series"[\s\S]*?<\/nav>/) ?? [''])[0];
    if (!block) {
      noBlock.push(`${id}（${course}）`);
      continue;
    }
    seriesPages++;

    const marks = [...block.matchAll(/<li[^>]*data-note-id="([^"]+)"[^>]*aria-current="page"/g)].map(
      (m) => m[1]
    );
    if (marks.length !== 1 || marks[0] !== id) {
      wrongCurrent.push(`${id} → ${marks.length ? marks.join('、') : '没有任何一行高亮'}`);
    }

    const rowIds = new Set([...block.matchAll(/data-note-id="([^"]+)"/g)].map((m) => m[1]));
    const missing = ids.filter((other) => !rowIds.has(other));
    if (missing.length > 0) notListed.push(`${id} 的列表里缺 ${missing.join('、')}`);

    for (const link of block.matchAll(/href="\/notes\/([^/"]+)\//g)) {
      if (!builtPages.has(link[1])) deadSeriesLinks.push(`${id} → /notes/${link[1]}/`);
    }

    const meta = (block.match(/series__meta">([^<]*)</) ?? [])[1] ?? '';
    const declared = Number((meta.match(/共\s*(\d+)\s*篇/) ?? [])[1]);
    if (!Number.isFinite(declared) || declared !== rowIds.size) {
      countMismatch.push(`${id} → 表头「${meta}」，实际 ${rowIds.size} 行`);
    }

    // 章号递增（bug-16）。只比对「已编入课程」的行：兜底补进来的那几篇
    // （data-note-id 在 curriculum.ts 里没有）本来就排在末尾，不参与这个判定。
    const order = [...block.matchAll(/class="series__num">(\d+)</g)].map((m) => Number(m[1]));
    const monotonic = order.every((n, i) => i === 0 || n >= order[i - 1]);
    if (!monotonic) outOfOrder.push(`${id} → ${order.join(' → ')}`);
  }
}
if (seriesPages === 0) {
  console.log('  ⚠ 没有找到带「同课程笔记」的笔记详情页，跳过');
} else {
  const problems = [
    [noBlock, '笔记页尾没有「同课程笔记」列表', '同 subfield 只有一篇时本来就不渲染这块，检查 curriculum.ts 的 chapters'],
    [wrongCurrent, '高亮行不对', '高亮的一行必须正好是这一页自己'],
    [notListed, '漏掉了同课程的笔记', '同 subfield 的笔记没挂进 curriculum.ts 会被兜底补上，不该缺'],
    [deadSeriesLinks, '列表里是死链', 'href 只在笔记已上线时才会生成（见 utils/course-series.ts）'],
    [countMismatch, '表头篇数与实际行数不一致', '见 src/pages/notes/[id].astro 的 series__meta'],
    [
      outOfOrder,
      '页尾章节顺序乱',
      '章节要按章号升序（utils/toc.ts 的 byChapter）；别照抄 curriculum.ts 的 chapters 数组顺序（bug-16）',
    ],
  ];
  let broken = 0;
  for (const [list, label, hint] of problems) {
    if (list.length === 0) continue;
    broken += list.length;
    bad(`${list.length} 处${label}：`);
    list.slice(0, 8).forEach(info);
    info(`提示：${hint}`);
  }
  if (broken === 0) ok(`${seriesPages} 篇笔记的页尾列表都在，各自高亮了自己，章节都按章号升序`);
  else failures++;
}

// ------------------------------------------- 4h. 例题内嵌块 / callout（opinion-22）
// 正文写 `:::example 例 1 · 求数组最大值 … :::`，产物里必须真的变成
// <div class="callout callout--example">。这类「围栏被原样印在页面上」的故障
// 构建完全不会报错（最坏的结果就是读者看到一行 :::example），所以在这里兜住：
//   ① 源码里有几道围栏，产物里就该有几个 callout 块；
//   ② 产物的正文里不许残留未被消费的 `:::` / `[!example]`；
//   ③ 例题框必须带角标（callout__chip），否则等于退回成一个普通灰框。
console.log('\n【4h】例题 / callout 内嵌块（opinion-22）');
const calloutShort = [];
const calloutLeaked = [];
const calloutNoChip = [];
let calloutPages = 0;
let calloutTotal = 0;
for (const id of notePageDirs) {
  const src = fs.readFileSync(path.join(notesSrcDir, `${id}.md`), 'utf8');
  // 开头围栏：行首的 `:::类型`；收尾的裸 `:::` 不算
  const fenced = (src.match(/^:::[ \t]*[A-Za-z][\w-]*/gm) ?? []).length;
  const aliased = (src.match(/^>[ \t]*\[![\w-]+\]/gm) ?? []).length;
  const declared = fenced + aliased;
  if (declared === 0) continue;

  const html = fs.readFileSync(path.join(notesDir, id, 'index.html'), 'utf8');
  const rendered = (html.match(/class="callout callout--[\w-]+"/g) ?? []).length;
  calloutPages++;
  calloutTotal += rendered;

  if (rendered < declared) calloutShort.push(`${id} 源码 ${declared} 个 / 产物 ${rendered} 个`);

  // 没被插件消费掉的围栏会作为正文原样出现（`<p>:::example` 或 `<p>[!example]`）
  const leak = html.match(/<p>:::[ \t]*[\w-]*|<p>[ \t]*\[![\w-]+\]/);
  if (leak) calloutLeaked.push(`${id} → ${leak[0]}`);

  // 例题框必须有角标：`.callout__head` 里有 `callout__chip`
  const heads = (html.match(/class="callout__head"[\s\S]{0,400}?<\/div>/g) ?? []).length;
  const chips = (html.match(/class="callout__chip"/g) ?? []).length;
  if (chips < heads) calloutNoChip.push(`${id} 头 ${heads} 个 / 角标 ${chips} 个`);
}
if (calloutPages === 0) {
  console.log('  ⚠ 没有任何笔记用到 callout 围栏，跳过');
} else {
  ok(`${calloutPages} 篇笔记用了 callout，产物里共 ${calloutTotal} 个内嵌块`);
  const table = [
    [calloutShort, '围栏没有全部渲染成 callout 块', '检查 scripts/remark-callout.mjs 的围栏配对与 astro.config.mjs 的注册'],
    [calloutLeaked, '正文里残留了未消费的围栏标记', '多半是收尾的 `:::` 写成了别的样子，或围栏没顶格写'],
    [calloutNoChip, '有 callout 头没有角标', '见 scripts/remark-callout.mjs 的 splitTitle / buildCallout'],
  ];
  let broken = 0;
  for (const [list, label, hint] of table) {
    if (list.length === 0) continue;
    broken += list.length;
    bad(`${list.length} 处${label}：`);
    list.slice(0, 8).forEach(info);
    info(`提示：${hint}`);
  }
  if (broken === 0) ok('callout 全部正常渲染（含角标），没有残留围栏标记');
  else failures++;
}

// ------------------------------------------ 4i. 学习路线页（opinion-25）
// 这一页把「全部学科依次排开」改成了「搜索 + 学科标签页 + 一次只显示一个」，
// 结构一旦走形，页面还是能打开、只是不能用 —— 构建不会报错，所以在这里兜住：
//   ① 标签页与面板必须一一对应（点了切不过去，最常见的原因就是这俩数量对不上）；
//   ② 每篇已上线笔记都要能在路线上找到入口（挂漏了由兜底补上，不该缺）；
//   ③ 搜索索引必须内联进页面（缺了的话，搜索框就是个摆设）；
//   ④ 渐进增强的开关 `has-js` 必须在 —— 没有它，标签页和搜索框会一直藏着。
console.log('\n【4i】学习路线页（opinion-25）');
{
  const routeHtml = fs.readFileSync(path.join(DIST, 'notes', 'route', 'index.html'), 'utf8');
  const tabsN = (routeHtml.match(/role="tab"/g) ?? []).length;
  const panelsN = (routeHtml.match(/role="tabpanel"/g) ?? []).length;
  if (tabsN > 0 && tabsN === panelsN) ok(`${tabsN} 个学科：标签页与面板一一对应`);
  else {
    bad(`标签页 ${tabsN} 个、面板 ${panelsN} 个，对不上`);
    info('提示：见 src/pages/notes/route.astro —— 两个循环都跑 route.disciplines');
    failures++;
  }

  const notOnRoute = notePageDirs.filter((id) => !routeHtml.includes(`/notes/${id}/`));
  if (notOnRoute.length === 0) ok(`${notePageDirs.length} 篇笔记在路线上都有入口`);
  else {
    bad(`${notOnRoute.length} 篇笔记在学习路线上找不到入口：`);
    notOnRoute.slice(0, 8).forEach(info);
    info('提示：挂进 curriculum.ts 的 chapters，或确认它的 subfield 与课程名一致');
    failures++;
  }

  // 二级标签（课程）与课程卡片必须一一对应；并且**没有「全部」**、
  // 每个学科出厂就选中一门课（否则 JS 跑起来之前那块是空的）。
  const courseCards = (routeHtml.match(/id="course-\d+"/g) ?? []).length;
  const coursePills = (routeHtml.match(/data-course-filter="course-\d+"/g) ?? []).length;
  const leftoverAll = (routeHtml.match(/data-course-filter=""/g) ?? []).length;
  const activePills = (routeHtml.match(/route-course-tab is-active/g) ?? []).length;
  const shownCards = (routeHtml.match(/route-course is-shown/g) ?? []).length;
  if (
    courseCards > 0 &&
    coursePills === courseCards &&
    leftoverAll === 0 &&
    activePills === panelsN &&
    shownCards === panelsN
  ) {
    ok(`${panelsN} 个学科共 ${courseCards} 门课：标签与卡片一一对应，每科默认选中一门`);
  } else {
    bad(
      `课程标签/卡片对不上：卡片 ${courseCards}、标签 ${coursePills}、` +
        `残留「全部」${leftoverAll} 个、选中标签 ${activePills}、显示卡片 ${shownCards}` +
        `（后三项每科应各为 1，残留「全部」应为 0）`
    );
    info('提示：见 src/pages/notes/route.astro 里 route-course-tabs 与 route-course 两段');
    failures++;
  }

  const rawIndex = (
    routeHtml.match(/<script type="application\/json" id="route-index">([\s\S]*?)<\/script>/) ?? []
  )[1];
  let searchItems = null;
  try {
    searchItems = rawIndex ? JSON.parse(rawIndex) : null;
  } catch {
    searchItems = null;
  }
  if (Array.isArray(searchItems) && searchItems.length > 0) {
    const courseItems = searchItems.filter((x) => x.kind === 'course').length;
    ok(`搜索索引内联了 ${searchItems.length} 条（课程 ${courseItems} + 章节 ${searchItems.length - courseItems}）`);
  } else {
    bad('页面上没有可用的搜索索引（#route-index）');
    info('提示：见 src/pages/notes/route.astro 的 set:html={JSON.stringify(searchIndex)}');
    failures++;
  }

  if (/classList\.add\(['"]has-js['"]\)/.test(routeHtml)) {
    ok('渐进增强开关 has-js 在（没有 JS 时不会露出点了没反应的标签页）');
  } else {
    bad('页面里找不到 has-js 开关脚本');
    info('提示：见 src/pages/notes/route.astro 顶部的 <script is:inline>');
    failures++;
  }

  // 交互脚本必须真的随页面发出去（标签页 / 二级课程过滤 / 搜索都在这支脚本里）。
  // 它可能被内联，也可能被抽成 /_astro/route.astro…js —— 两种都算数，所以两边都读。
  const inlineJs = [...routeHtml.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)]
    .map((m) => m[1])
    .join('\n');
  const externalJs = [...routeHtml.matchAll(/src="(\/_astro\/[^"]+\.js)"/g)]
    .map((m) => path.join(DIST, m[1].replace(/^\//, '')))
    .filter((p) => fs.existsSync(p))
    .map((p) => fs.readFileSync(p, 'utf8'))
    .join('\n');
  const pageJs = inlineJs + '\n' + externalJs;
  if (pageJs.includes('route-course-tab') && pageJs.includes('route-q')) {
    ok('交互脚本已随页面发布（学科标签页 + 二级课程过滤 + 搜索）');
  } else {
    bad('页面没有带上交互脚本，标签页 / 课程过滤 / 搜索都会是死的');
    info('提示：见 src/pages/notes/route.astro 末尾那段 <script>');
    failures++;
  }
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
