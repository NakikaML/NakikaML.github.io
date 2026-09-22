#!/usr/bin/env node
/**
 * smoke-test.mjs —— 对运行中的站点做 HTTP 冒烟测试
 *
 * 用法：
 *   1. 另开一个终端跑 pnpm preview （默认 http://localhost:4321）
 *   2. node scripts/smoke-test.mjs [baseUrl]
 */

const BASE = (process.argv[2] ?? 'http://localhost:4321').replace(/\/$/, '');

const PATHS = [
  '/',
  '/about/',
  '/notes/',
  '/maps/',
  '/blog/',
  '/blog/why-i-built-this-site/',
  '/works/',
  '/projects/',
  '/rss.xml',
  '/sitemap-index.xml',
  '/favicon.svg',
  '/robots.txt',
  '/404.html',
  '/notes/hm-6-微分方程/',
  '/notes/cpp-1-cpp基础操作/',
  '/notes/web-1-前端开发基础/',
];

let failed = 0;

console.log(`冒烟测试 → ${BASE}\n`);

for (const p of PATHS) {
  const url = BASE + encodeURI(p);
  try {
    const res = await fetch(url);
    const body = await res.text();
    const kb = (Buffer.byteLength(body, 'utf8') / 1024).toFixed(0);
    if (!res.ok) {
      failed++;
      console.log(`  ✗ ${String(res.status).padEnd(4)} ${p}`);
      continue;
    }
    // 顺带检查几个关键页面的内容特征
    let note = '';
    if (p === '/') note = body.includes('Nakika') ? '' : ' ← 首页缺少站点名';
    if (p === '/notes/') {
      const n = (body.match(/class="note-item"/g) || []).length;
      note = ` ← ${n} 条笔记卡片`;
    }
    if (p.startsWith('/notes/hm-6')) {
      note = body.includes('class="katex') ? ' ← KaTeX 已渲染' : ' ← ⚠ 公式未渲染';
    }
    if (note.includes('⚠')) failed++;
    console.log(`  ✓ ${String(res.status).padEnd(4)} ${kb.padStart(6)} KB  ${p}${note}`);
  } catch (e) {
    failed++;
    console.log(`  ✗ 连接失败 ${p} — ${e.message}`);
  }
}

console.log(
  failed === 0
    ? '\n✅ 冒烟测试全部通过\n'
    : `\n❌ ${failed} 项失败\n`
);
process.exit(failed === 0 ? 0 : 1);
