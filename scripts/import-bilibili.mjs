#!/usr/bin/env node
/**
 * import-bilibili.mjs —— 把浏览器导出的 bili-works.json 变成网站的作品
 * ============================================================================
 * 配套脚本：scripts/bili-export-browser.js（在浏览器控制台里跑，导出 json）
 *
 * 它做四件事：
 *   1. 读取 bili-works.json
 *   2. 下载每个视频的封面 → public/works/<BVID>.jpg
 *   3. 生成 src/content/works/<标题>.md（frontmatter 完全符合 content.config.ts 的 schema）
 *   4. 自检：封面是否都落地、日期是否齐全、有没有重复
 *
 * 用法：
 *   node scripts/import-bilibili.mjs                  # 默认读根目录 bili-works.json
 *   node scripts/import-bilibili.mjs --dry-run        # 只预览，不写任何文件
 *   node scripts/import-bilibili.mjs --draft          # 全部标记为草稿（先不上线）
 *   node scripts/import-bilibili.mjs --update         # 覆盖已有作品（保留 roles/tags/featured）
 *   node scripts/import-bilibili.mjs --input x.json   # 指定输入文件
 *   node scripts/import-bilibili.mjs --limit 5        # 只处理前 5 条（先试水）
 *
 * 安全默认：**已存在的作品默认跳过**，绝不覆盖你手写过的 roles / tags。
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WORKS_MD = path.join(ROOT, 'src', 'content', 'works');
const PUBLIC_WORKS = path.join(ROOT, 'public', 'works');
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

// ----------------------------------------------------------------- 参数
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f, d) => {
  const i = argv.indexOf(f);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : d;
};
const DRY = has('--dry-run');
const FORCE_DRAFT = has('--draft');
const UPDATE = has('--update');
const RECLASSIFY = has('--reclassify');
const FORCE_COVERS = has('--force-covers');
// 输入文件：优先 --input；否则用 bili-works.json；再否则自动挑根目录里最新的 bili-works*.json
const INPUT = (() => {
  const explicit = val('--input', null);
  if (explicit) return path.resolve(ROOT, explicit);
  const dflt = path.join(ROOT, 'bili-works.json');
  if (fs.existsSync(dflt)) return dflt;
  const cands = fs.readdirSync(ROOT).filter((f) => /^bili-works.*\.json$/.test(f));
  if (cands.length) {
    cands.sort((a, b) => fs.statSync(path.join(ROOT, b)).mtimeMs - fs.statSync(path.join(ROOT, a)).mtimeMs);
    return path.join(ROOT, cands[0]);
  }
  return dflt;
})();
const LIMIT = Number(val('--limit', '0')) || 0;
// 封面瘦身：B 站图床支持在 URL 后加 @宽w_高h_裁剪c.格式 直接取缩图。
// 原图约 250KB，@640w_360h_1c.webp 只要约 22KB —— 101 张能从约 25MB 压到约 2MB。
// 作品卡片封面是 16/9，所以 640x360 正好，不浪费一个像素。
// 想用原图：加 --cover-original
const COVER_RESIZE = !has('--cover-original');
const COVER_SUFFIX = val('--cover-suffix', '@640w_360h_1c.webp');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);

// ------------------------------------------------------------- 封面下载
let resizedCovers = 0;
let originalCovers = 0;
let coverBytes = 0;

/** 拼缩图 URL；不是 B 站图床、或已经带过 @ 参数，就返回 null */
function resizedUrl(url) {
  if (!COVER_RESIZE) return null;
  if (!/hdslb\.com/.test(url)) return null;
  if (url.includes('@')) return null;
  return url + COVER_SUFFIX;
}

async function grab(url) {
  const r = await fetch(url, {
    headers: { 'User-Agent': UA, Referer: 'https://www.bilibili.com/' },
    signal: AbortSignal.timeout(30000),
  });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const ct = r.headers.get('content-type') || '';
  if (!/^image\//.test(ct)) throw new Error('返回的不是图片（' + ct + '）');
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 100) throw new Error('文件过小（' + buf.length + ' B）');
  const ext = ct.includes('png')
    ? '.png'
    : ct.includes('webp')
      ? '.webp'
      : ct.includes('gif')
        ? '.gif'
        : ct.includes('avif')
          ? '.avif'
          : '.jpg';
  return { buf, ext };
}

/** 先试缩图，失败再退回原图 —— 保证「宁可大一点，也不要没封面」 */
async function fetchCover(url, bvid) {
  const small = resizedUrl(url);
  const tries = small ? [[small, '缩图'], [url, '原图']] : [[url, '原图']];
  let lastWhy = '';
  for (const [u, label] of tries) {
    try {
      const { buf, ext } = await grab(u);
      fs.writeFileSync(path.join(PUBLIC_WORKS, bvid + ext), buf);
      if (label === '缩图') resizedCovers++;
      else originalCovers++;
      coverBytes += buf.length;
      return { ok: true, rel: `/works/${bvid}${ext}`, kb: Math.round(buf.length / 1024), label };
    } catch (e) {
      lastWhy = `${label}失败(${e.message})`;
      await sleep(200);
    }
  }
  return { ok: false, why: lastWhy };
}

// ----------------------------------------------------------------- 类型猜测
// 猜错不影响构建，只是作品页上的分组/配色不对，后续手动改 type 即可。
const TYPES = ['配音', '翻唱', '知识分享', '其他'];
const TYPE_RULES = [
  // 注意「配了配」「有语音」「朗读」这类口语说法 —— 只认字面「配音」会漏掉一大批投稿
  [
    '配音',
    /配音|翻配|配了配|配个音|广播剧|中配|日配|俄配|英配|声优|CV列表|同人剧|配音剧|剧情歌|演绎|声线|献声|有语音|亲自读|朗读|台词来源|\bdub\b/i,
  ],
  ['翻唱', /翻唱|唱见|演唱|合唱|对唱|歌って|弾いて|\bcover\b|主题曲|插曲|歌曲|情歌|高音|民谣/i],
  ['知识分享', /科普|教程|讲解|知识|教学|分析|解析|测评|评测|入门|指南|技巧|原理|手把手|避坑/i],
];
function guessType(video) {
  const hay = `${video.title || ''} ${video.description || ''}`;
  for (const [t, re] of TYPE_RULES) if (re.test(hay)) return t;
  return '其他';
}

// ----------------------------------------------------------------- 小工具
function safeName(title, bvid) {
  let s = String(title || '')
    .replace(/[\\/:*?"<>|\r\n\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/, '');
  if (s.length > 50) s = s.slice(0, 50).trim();
  if (!s || /^(con|prn|aux|nul|com\d|lpt\d)$/i.test(s)) s = bvid;
  return s;
}

const bvidOf = (s) => (String(s || '').match(/BV[0-9A-Za-z]+/) || [])[0] || null;
const ymd = (unix) => (unix ? new Date(unix * 1000).toISOString().slice(0, 10) : null);
const q = (s) => JSON.stringify(String(s ?? '')); // JSON 字符串就是合法的 YAML 双引号标量

/** 极简 frontmatter 解析：只取我们关心的几个字段 */
function parseFrontmatter(text) {
  // 去掉 UTF-8 BOM —— Windows 记事本 / PowerShell 的 Set-Content -Encoding UTF8
  // 都会在文件开头写 BOM，不去掉的话 ^--- 匹配不上，就会被误判成「新作品」而覆盖掉手写内容。
  const m = String(text)
    .replace(/^\uFEFF/, '')
    .match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const body = m[1];
  const one = (k) => {
    const mm = body.match(new RegExp('^' + k + ':\\s*(.*)$', 'm'));
    return mm ? mm[1].trim().replace(/^["']|["']$/g, '') : '';
  };
  const list = (k) => {
    const blk = body.match(new RegExp('^' + k + ':\\s*\\r?\\n((?:[ \\t]*-[ \\t]*.*\\r?\\n?)+)', 'm'));
    if (blk)
      return blk[1]
        .split(/\r?\n/)
        .map((l) => l.replace(/^[ \t]*-[ \t]*/, '').trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    const inl = one(k);
    if (inl.startsWith('['))
      return inl
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    return [];
  };
  return {
    title: one('title'),
    url: one('url'),
    type: one('type'),
    roles: list('roles'),
    tags: list('tags'),
    featured: one('featured') === 'true',
    draft: one('draft') === 'true',
    date: one('date'),
  };
}

// ----------------------------------------------------------------- 主流程
if (!fs.existsSync(INPUT)) {
  console.error(`✗ 找不到输入文件：${INPUT}`);
  console.error('  请先在浏览器里跑 scripts/bili-export-browser.js，把导出的 json 放到项目根目录。');
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
const allVideos = Array.isArray(payload) ? payload : payload.videos || [];
const videos = LIMIT ? allVideos.slice(0, LIMIT) : allVideos;

log('');
log('════════════════════════════════════════════════════');
log('  B 站作品导入');
log('════════════════════════════════════════════════════');
log(`  输入        ${path.relative(ROOT, INPUT)}`);
log(`  数据来源    ${payload.source || '未知'}${payload.declaredTotal ? `（B 站声明共 ${payload.declaredTotal} 条）` : ''}`);
log(`  待处理      ${videos.length} 条${LIMIT ? `（已按 --limit 截断，原 ${allVideos.length} 条）` : ''}`);
log(`  模式        ${DRY ? 'DRY-RUN（不写文件）' : '实际写入'}${FORCE_DRAFT ? ' + 全部草稿' : ''}${UPDATE ? ' + 覆盖已有' : ''}`);
log('════════════════════════════════════════════════════');

// 建立 bvid -> 已有文件 的索引
const existing = new Map();
for (const f of fs.readdirSync(WORKS_MD)) {
  if (!f.endsWith('.md')) continue;
  const full = path.join(WORKS_MD, f);
  const fm = parseFrontmatter(fs.readFileSync(full, 'utf8'));
  if (!fm) continue;
  const b = bvidOf(fm.url);
  if (b) existing.set(b, { file: f, fm });
}

// 可选：类型覆盖表
let typeMap = {};
const typeMapPath = path.join(ROOT, 'bili-types.json');
if (fs.existsSync(typeMapPath)) {
  typeMap = JSON.parse(fs.readFileSync(typeMapPath, 'utf8'));
  log(`  类型覆盖表  bili-types.json（${Object.keys(typeMap).length} 条）`);
}

if (!DRY) fs.mkdirSync(PUBLIC_WORKS, { recursive: true });

// ------------------------------------------------------- 只重算类型（--reclassify）
// 改完上面 TYPE_RULES、或补好 bili-types.json 之后跑：
//   node scripts/import-bilibili.mjs --reclassify
// 只改 md 里的 type: 那一行，标题/日期/简介/封面/roles/tags 全都不动。
if (RECLASSIFY) {
  const byBvid = new Map(videos.map((v) => [bvidOf(v.bvid), v]));
  const changes = [];
  let same = 0;
  for (const [bvid, info] of existing) {
    const v = byBvid.get(bvid);
    if (!v) continue;
    let next = typeMap[bvid] || guessType(v);
    if (!TYPES.includes(next)) next = '其他';
    if (next === info.fm.type) {
      same++;
      continue;
    }
    const full = path.join(WORKS_MD, info.file);
    const txt = fs.readFileSync(full, 'utf8').replace(/^type:.*$/m, 'type: ' + next);
    if (!DRY) fs.writeFileSync(full, txt, 'utf8');
    changes.push({ file: info.file, from: info.fm.type, to: next, title: info.fm.title });
  }
  log(`\n重新分类：改了 ${changes.length} 条，未变 ${same} 条${DRY ? '（DRY-RUN，没写）' : ''}`);
  for (const c of changes) log(`  ${c.from} → ${c.to}   ${String(c.title).slice(0, 46)}`);
  if (!changes.length) log('  （没有需要改的）');
  else log('\n  只动了 type 一行，其它字段原样保留。');
  process.exit(0);
}

const created = [];
const updated = [];
const skipped = [];
const noDate = [];
const coverFail = [];
const typeTally = {};

for (const v of videos) {
  const bvid = bvidOf(v.bvid);
  if (!bvid) {
    skipped.push({ bvid: '(无)', title: v.title, why: '缺少 BVID' });
    continue;
  }
  const date = ymd(v.pubdate);
  if (!date) {
    noDate.push({ bvid, title: v.title });
    continue;
  }

  // 已存在且没开 --update -> 跳过，保护手写内容
  if (existing.has(bvid) && !UPDATE) {
    skipped.push({ bvid, title: v.title, why: `已存在（${existing.get(bvid).file}）` });
    continue;
  }

  let type = typeMap[bvid] || guessType(v);
  if (!['配音', '翻唱', '知识分享', '其他'].includes(type)) type = '其他';
  typeTally[type] = (typeTally[type] || 0) + 1;

  // ---- 封面 ----
  let cover = '';
  const prev = existing.get(bvid);
  if (prev) {
    const pm = fs.readFileSync(path.join(WORKS_MD, prev.file), 'utf8').match(/^cover:\s*(.+)$/m);
    if (pm) cover = pm[1].trim().replace(/^["']|["']$/g, '');
  }
  const already = fs.existsSync(PUBLIC_WORKS)
    ? fs.readdirSync(PUBLIC_WORKS).find((f) => f.replace(/\.[^.]+$/, '') === bvid)
    : null;

  if (already && !FORCE_COVERS) {
    cover = `/works/${already}`;
  } else if (v.cover) {
    if (DRY) {
      cover = `/works/${bvid}${COVER_RESIZE ? '.webp' : '.jpg'} (待下载)`;
    } else {
      const got = await fetchCover(v.cover, bvid);
      if (got.ok) cover = got.rel;
      else {
        coverFail.push({ bvid, why: got.why });
        cover = '';
      }
      await sleep(200); // 对 CDN 温柔一点
    }
  }

  // ---- 保留手写字段 ----
  const keepRoles = prev?.fm?.roles?.length ? prev.fm.roles : [];
  const keepTags = prev?.fm?.tags?.length ? prev.fm.tags : [];
  const keepFeatured = prev?.fm?.featured ?? false;

  // 不再写 description —— 这是个人站，作品只跳 B 站，卡片上只呈现标题 + 平台·时间
  const fm = [
    '---',
    `title: ${q(v.title)}`,
    `type: ${type}`,
    'platform: Bilibili',
    `url: ${q(`https://www.bilibili.com/video/${bvid}/`)}`,
    `cover: ${q(cover)}`,
    `date: ${date}`,
    keepRoles.length ? `roles:\n${keepRoles.map((r) => `  - ${q(r)}`).join('\n')}` : 'roles: []',
    keepTags.length ? `tags: [${keepTags.join(', ')}]` : 'tags: []',
    `featured: ${keepFeatured}`,
    `draft: ${FORCE_DRAFT ? 'true' : 'false'}`,
    '---',
    '',
    `> 从 B 站自动导入（${bvid}）。作品页只渲染上面的 frontmatter，正文不显示。`,
    v.play != null ? `> 播放量：${v.play} · 时长：${v.duration || '—'}` : '',
    '',
  ]
    .filter((l) => l !== '')
    .join('\n');

  const filename = prev ? prev.file : safeName(v.title, bvid) + '.md';
  if (!DRY) fs.writeFileSync(path.join(WORKS_MD, filename), fm, 'utf8');
  (prev ? updated : created).push({ bvid, title: v.title, filename, type, date, cover: cover.replace(' (待下载)', '') });
}

// ----------------------------------------------------------------- 报告
log('');
log(`✅ 新建 ${created.length} 条 · 更新 ${updated.length} 条 · 跳过 ${skipped.length} 条`);
if (Object.keys(typeTally).length) {
  log('   类型分布（猜测，可在 md 里手动改 type）：');
  for (const [t, n] of Object.entries(typeTally).sort((a, b) => b[1] - a[1])) log(`     ${t.padEnd(6)} ${n}`);
}
if (resizedCovers + originalCovers > 0) {
  log(
    `   封面：缩图 ${resizedCovers} 张 · 原图 ${originalCovers} 张 · 合计约 ${(coverBytes / 1024 / 1024).toFixed(1)} MB`
  );
}
if (skipped.length) {
  log('');
  log(`⏭  跳过 ${skipped.length} 条（默认不覆盖已有作品；要覆盖加 --update）：`);
  skipped.slice(0, 10).forEach((s) => log(`     ${s.bvid}  ${String(s.title).slice(0, 34)}  ← ${s.why}`));
  if (skipped.length > 10) log(`     …另有 ${skipped.length - 10} 条`);
}
if (noDate.length) {
  log('');
  log(`⚠️  ${noDate.length} 条没有日期（works schema 里 date 是必填，直接写会让构建失败），已跳过，请手动补：`);
  noDate.slice(0, 8).forEach((s) => log(`     ${s.bvid}  ${String(s.title).slice(0, 40)}`));
}
if (coverFail.length) {
  log('');
  log(`⚠️  ${coverFail.length} 条封面下载失败（会先显示成 emoji 占位，可重跑本脚本）：`);
  coverFail.slice(0, 8).forEach((s) => log(`     ${s.bvid}  ${s.why}`));
}

if (created.length) {
  log('');
  log('   新建预览（前 8 条）：');
  created.slice(0, 8).forEach((c) => log(`     ${c.date}  [${c.type}] ${c.title.slice(0, 32)}  → ${c.filename}`));
}

// 写一份可读报告，方便一眼检查 100 多条的猜测是否合理
if (!DRY && videos.length > 10) {
  const rep = [
    '# B 站导入报告',
    '',
    `导入时间：${new Date().toLocaleString('zh-CN')}　来源：${payload.source || '未知'}`,
    '',
    `新建 ${created.length} · 更新 ${updated.length} · 跳过 ${skipped.length}`,
    '',
    '| 日期 | 类型 | 标题 | BVID | 文件 |',
    '| :-- | :-- | :-- | :-- | :-- |',
    ...[...created, ...updated].map(
      (c) => `| ${c.date} | ${c.type} | ${String(c.title).replace(/\|/g, '\\|')} | ${c.bvid} | \`${c.filename}\` |`
    ),
    '',
    '> 类型是脚本按关键词猜的，猜错直接在对应 md 里改 `type` 即可',
    '> （只能是 配音 / 翻唱 / 知识分享 / 其他）。',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(ROOT, 'bili-import-report.md'), rep, 'utf8');
  log('');
  log('   📄 已生成 bili-import-report.md（逐条清单，方便核对类型猜得对不对）');
}

// ----------------------------------------------------------------- 自检
if (!DRY && created.length + updated.length > 0) {
  log('');
  log('── 自检 ──');
  const problems = [];
  for (const c of [...created, ...updated]) {
    const full = path.join(WORKS_MD, c.filename);
    if (!fs.existsSync(full)) {
      problems.push(`md 没写成功：${c.filename}`);
      continue;
    }
    const txt = fs.readFileSync(full, 'utf8');
    if (!/^date:\s*\d{4}-\d{2}-\d{2}$/m.test(txt)) problems.push(`date 不合法：${c.filename}`);
    if (!/^type:\s*(配音|翻唱|知识分享|其他)$/m.test(txt)) problems.push(`type 不合法：${c.filename}`);
    // cover 可能是 ""（封面没下下来时的合法占位），不能当成「路径缺失」误报
    const cm = txt.match(/^cover:\s*(.*)$/m);
    let coverPath = cm ? cm[1].trim() : '';
    if (
      (coverPath.startsWith('"') && coverPath.endsWith('"')) ||
      (coverPath.startsWith("'") && coverPath.endsWith("'"))
    ) {
      coverPath = coverPath.slice(1, -1);
    }
    if (coverPath) {
      const rel = coverPath.replace(/^\//, '');
      if (!fs.existsSync(path.join(ROOT, 'public', rel))) problems.push(`封面文件缺失：${rel}`);
    }
  }
  if (problems.length === 0) log('   ✓ 所有 md 的 date/type/封面引用都正常');
  else {
    log(`   ✗ ${problems.length} 个问题：`);
    problems.slice(0, 10).forEach((p) => log('     ' + p));
  }
}

log('');
if (DRY) log('（DRY-RUN，什么都没写。去掉 --dry-run 就会真正导入。）');
else {
  log('下一步：');
  log('   1. 看一眼 bili-import-report.md，核对 type 猜得对不对');
  log('   2. npm run build       # 构建');
  log('   3. node scripts/verify-build.mjs   # 自检（会检查封面是否都落地）');
  log('   4. git add -A && git commit && git push   # 封面必须提交，否则线上裂图');
}
log('');
