#!/usr/bin/env node
/**
 * check-live.mjs —— 检查线上站点的可用性
 *
 * 用法：
 *   node scripts/check-live.mjs                          # 默认查 https://nakikaml.github.io
 *   node scripts/check-live.mjs https://你的域名
 *
 * 注意：本机若有 TLS 中间层，需用 node --use-system-ca 运行。
 */

const BASE = (process.argv[2] ?? 'https://nakikaml.github.io').replace(/\/$/, '');

const CHECKS = [
  { path: '/', expect: 'Nakika', label: '首页含站点名' },
  { path: '/about/', expect: '关于我' },
  { path: '/notes/', expect: '学习笔记', label: '页面正常' },
  { path: '/maps/', expect: '知识地图' },
  { path: '/blog/', expect: '博客' },
  { path: '/blog/why-i-built-this-site/', expect: '为什么我要做一个个人网站', label: '博客正文' },
  { path: '/works/', expect: '作品' },
  { path: '/projects/', expect: '项目' },
  { path: '/rss.xml', expect: '<rss' },
  { path: '/sitemap-index.xml', expect: 'sitemap' },
  { path: '/robots.txt', expect: 'User-agent' },
  { path: '/favicon.svg', expect: '<svg' },
  { path: '/this-page-should-not-exist-xyz/', expect: null, expectStatus: 404 },
];

console.log(`线上可用性检查 → ${BASE}\n`);

let failed = 0;

/**
 * 带重试的 fetch。
 * 本机若有 TLS 中间层，偶发会报 "fetch failed"，重试即可 ——
 * 不重试的话会把网络抖动误报成站点故障。
 */
async function fetchWithRetry(url, attempts = 3) {
  let lastErr;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fetch(url, { redirect: 'follow' });
    } catch (e) {
      lastErr = e;
      if (i < attempts) await new Promise((r) => setTimeout(r, 800 * i));
    }
  }
  throw lastErr;
}

for (const c of CHECKS) {
  const url = BASE + encodeURI(c.path);
  try {
    const res = await fetchWithRetry(url);
    const body = await res.text();
    const kb = (Buffer.byteLength(body, 'utf8') / 1024).toFixed(0);

    const wantStatus = c.expectStatus ?? 200;
    if (res.status !== wantStatus) {
      failed++;
      console.log(`  ✗ ${res.status} (期望 ${wantStatus})  ${c.path}`);
      continue;
    }

    let note = `${kb} KB`;

    if (c.expect) {
      if (body.includes(c.expect)) {
        if (c.count) {
          const n = (body.match(/class="note-item"/g) || []).length;
          note += `  ← ${n} 条笔记卡片`;
        } else if (c.label) {
          note += `  ← ${c.label}`;
        }
      } else {
        failed++;
        console.log(`  ✗ ${res.status}  ${c.path}  内容校验失败：未找到 "${c.expect}"`);
        continue;
      }
    }

    console.log(`  ✓ ${res.status}  ${note.padEnd(28)} ${c.path}`);
  } catch (e) {
    failed++;
    console.log(`  ✗ 连接失败  ${c.path}  → ${e.message}`);
  }
}

console.log(
  failed === 0
    ? '\n✅ 线上站点全部检查通过\n'
    : `\n❌ ${failed} 项未通过\n`
);
process.exit(failed === 0 ? 0 : 1);
