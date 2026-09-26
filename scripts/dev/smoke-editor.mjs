#!/usr/bin/env node
/**
 * smoke-editor.mjs —— 「本地编辑」的端到端自检（**会真的起 astro dev**）
 * ==================================================================
 * 和 test-editor.mjs 的分工：
 *   · test-editor.mjs  ：不起服务器，快速覆盖行号换算与 HTTP 契约（平时跑这个）
 *   · 本脚本           ：起一个真 dev server，确认整条链在真实 Vite 管线里也成立
 *                        —— 页面渲染出行号、编辑器脚本被注入、按页面给的数字
 *                        发请求真的改对了文件
 *
 * 用隔离端口（默认 4399），不会打扰你平时开着的 4321。
 * 用法： node scripts/dev/smoke-editor.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import * as fx from './editor-fixture.mjs';

const PORT = Number(process.env.SMOKE_PORT || 4399);
const BASE = `http://127.0.0.1:${PORT}`;

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

let dev = null;
let devExited = false;

function startDev() {
  const bin = path.join(fx.ROOT, 'node_modules', 'astro', 'bin', 'astro.mjs');
  dev = spawn(
    process.execPath,
    // --ignore-lock：Astro 默认会在 .astro/dev.json 里记一把「已有 dev server」的锁，
    // 你自己开着 pnpm dev 时本脚本就会被它挡住。这个标志既不检查也不写锁，
    // 所以既不会打扰你的服务器，也不会在强杀之后留下脏锁。
    [bin, 'dev', '--port', String(PORT), '--ignore-lock'],
    {
      cwd: fx.ROOT,
      // 不用管道：受限环境里 Node 的管道式 spawn 会被拒，inherit 最稳
      stdio: ['ignore', 'inherit', 'inherit'],
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
    }
  );
  dev.on('exit', () => {
    devExited = true;
  });
}

/** 先礼后兵：给 SIGTERM 一点时间优雅退出，超时再强杀整棵进程树 */
async function stopDev() {
  if (!dev || devExited) return;
  const pid = dev.pid;
  try {
    dev.kill();
  } catch {
    /* 忽略 */
  }
  const deadline = Date.now() + 4000;
  while (Date.now() < deadline && !devExited) {
    await new Promise((r) => setTimeout(r, 100));
  }
  if (devExited) return;
  try {
    spawn('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
  } catch {
    /* 忽略 */
  }
}

function cleanup() {
  fx.removeFixture();
  void stopDev();
}

process.on('exit', cleanup);
process.on('SIGINT', async () => {
  fx.removeFixture();
  await stopDev();
  process.exit(130);
});

async function waitForDev(timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (devExited) throw new Error('dev server 提前退出了');
    try {
      if ((await fetch(`${BASE}/`)).ok) return;
    } catch {
      /* 还没起来 */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`等 dev server 超时（${timeoutMs}ms）`);
}

async function fetchPage(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  let last = { status: 0, text: '' };
  while (Date.now() < deadline) {
    const res = await fetch(url);
    last = { status: res.status, text: await res.text() };
    if (res.ok && last.text.includes('data-edit')) return last;
    await new Promise((r) => setTimeout(r, 500));
  }
  return last;
}

/** 反复取页面，直到出现某段文字（用来等 dev server 把改动热更新出来） */
async function waitForText(url, needle, timeoutMs = 25_000) {
  const deadline = Date.now() + timeoutMs;
  let last = '';
  while (Date.now() < deadline) {
    const res = await fetch(url);
    last = await res.text();
    if (last.includes(needle)) return { found: true, text: last };
    await new Promise((r) => setTimeout(r, 500));
  }
  return { found: false, text: last };
}

/** 反复取页面，直到某段文字消失（用来等 dev server 把「文件没了」同步进内容层） */
async function waitForGone(url, needle, timeoutMs = 12_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const text = await (await fetch(url)).text();
      if (!text.includes(needle)) return true;
    } catch {
      /* 服务器正在退出，视为已经看不到了 */
      return true;
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

/**
 * dev 模式下的内容层缓存（性能缓存，可再生产物）。
 * 出处：astro/dist/content/paths.js —— dev 用 .astro/data-store.json，
 * build/preview 用 cacheDir（默认 node_modules/.astro/）。
 */
const DEV_STORE = path.join(fx.ROOT, '.astro', 'data-store.json');

const devStoreHasResidue = () => {
  try {
    return fs.readFileSync(DEV_STORE, 'utf8').includes(fx.NOTE_ID);
  } catch {
    return false;
  }
};

async function main() {
  console.log('\n=== 本地编辑功能端到端自检（真实 dev server） ===\n');

  fx.writeFixture();

  console.log(`[1/4] 启动 astro dev（端口 ${PORT}）…`);
  startDev();
  await waitForDev();
  ok('dev server 已就绪');

  console.log('\n[2/4] 页面渲染');
  const page = await fetchPage(`${BASE}/notes/${fx.NOTE_ID}/`);
  check(page.status === 200, `笔记页面可访问（HTTP ${page.status}）`);
  check(page.text.includes('第一段是纯文本'), '正文渲染正常');
  check(fx.markCount(page.text) === 5, `可编辑块数量正确（期望 5，实际 ${fx.markCount(page.text)}）`);
  check(page.text.includes('nakika-dev-editor'), '本地编辑器已注入页面（仅 dev）');
  check(page.text.includes('class="katex'), '行内公式仍然正常渲染成 KaTeX');

  const forMath = page.text.indexOf('class="katex');
  const mathTag = page.text.slice(page.text.lastIndexOf('<p', forMath), page.text.indexOf('</p>', forMath));
  check(!mathTag.includes('data-edit'), '含公式的段落没有被标记为可编辑');

  // 客户端模块真的被 dev server 供出去了（页面能加载到它）
  const clientRes = await fetch(`${BASE}/src/dev/editor-client.ts`);
  const clientSrc = clientRes.ok ? await clientRes.text() : '';
  check(clientRes.ok && clientSrc.includes('initEditor'), '编辑器客户端模块在 dev 下可正常加载');

  console.log('\n[3/4] 按页面给出的行号真的改写文件');
  const offset = fx.bodyLineOffset(fx.readFile());
  const plain = fx.attrsOf(page.text, '第一段是纯文本');
  const multi = fx.attrsOf(page.text, '这是跨行的段落第一行');
  check(plain !== null && multi !== null, '从页面里取到了行号属性');

  if (!plain || !multi) throw new Error('页面里没找到可编辑块的行号属性');

  const plainFileLine = fx.lineOf('第一段是纯文本');
  check(
    plain.start + offset === plainFileLine,
    `页面行号 + frontmatter 偏移 = 文件真实行号（${plain.start} + ${offset} = ${plainFileLine}）`
  );
  check(multi.end === multi.start + 1, '软换行段落带的是两行的区间');

  const post = async (payload) => {
    const res = await fetch(`${BASE}/__edit/note`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return { status: res.status, json: await res.json().catch(() => null) };
  };

  let r = await post({
    op: 'lines',
    collection: 'notes',
    id: fx.NOTE_ID,
    start: plain.start,
    end: plain.end,
    text: '这一段是端到端改出来的。',
  });
  check(r.status === 200 && r.json?.ok, '按页面行号提交，接口返回成功');
  check(fx.readLines()[plainFileLine - 1] === '这一段是端到端改出来的。', '文件里对应的那一行真的被改了');

  const multiFileLine = fx.lineOf('这是跨行的段落第一行');
  r = await post({
    op: 'lines',
    collection: 'notes',
    id: fx.NOTE_ID,
    start: multi.start,
    end: multi.end,
    text: '软换行段落合并成一行。',
  });
  check(r.status === 200, '跨行段落提交成功');
  check(fx.readLines()[multiFileLine - 1] === '软换行段落合并成一行。', '两行被合并成一行，位置正确');
  check(fx.lineOf('- 列表项测试') === fx.lineOf('软换行段落合并成一行。') + 2, '后面的内容没有错位');

  // 改完之后 dev 应该能反映出新内容（内容层 watcher + 页面重新渲染）
  const after = await waitForText(`${BASE}/notes/${fx.NOTE_ID}/`, '这一段是端到端改出来的。');
  check(
    after.found,
    after.found
      ? 'dev server 反映出了改动（页面重新渲染拿到新内容）'
      : 'dev server 没能反映出改动 —— 内容层热更新可能失效，需要刷新页面才能看到'
  );

  console.log('\n[4/4] 清理');
  fx.removeFixture();

  /**
   * 关键一步：**趁 dev server 还活着**，等它把「文件没了」同步进内容层缓存。
   * 之前是先删文件再立刻 SIGTERM，服务器来不及重写 .astro/data-store.json，
   * 于是缓存里留下一个幽灵条目 —— 下次打开笔记列表，那篇已经删掉的临时笔记
   * 还会赫然列在那儿（源码里确实没有了，纯粹是缓存没跟上）。
   */
  const synced = await waitForGone(`${BASE}/notes/`, fx.NOTE_ID);
  check(synced, 'dev server 已把删除同步进内容层（笔记列表里不再出现临时笔记）');

  await stopDev();
  const deadline = Date.now() + 6000;
  while (Date.now() < deadline && !devExited) await new Promise((r) => setTimeout(r, 100));
  check(!fs.existsSync(fx.NOTE_FILE), '临时笔记已删除');
  check(devExited, 'dev server 已退出，没有留下后台进程');

  // 兜底：万一服务器在同步完成前就退出了，缓存里可能仍有残留。
  // .astro/ 是可再生的缓存目录（已 gitignore），直接丢掉最省事也最干净。
  let purged = false;
  if (devStoreHasResidue()) {
    fs.rmSync(DEV_STORE, { force: true });
    purged = true;
  }
  check(
    !devStoreHasResidue(),
    purged ? '内容层缓存里检测到残留，已清除（Astro 下次启动会自动重建）' : '内容层缓存干净，没有残留条目'
  );

  console.log(
    `\n${fail === 0 ? '\u001b[32m✅ 全部通过\u001b[0m' : `\u001b[31m❌ ${fail} 项未通过\u001b[0m`}（通过 ${pass} 项）\n`
  );
  process.exitCode = fail === 0 ? 0 : 1;
}

main().catch((err) => {
  bad(`自检异常中断：${err.message}`);
  cleanup();
  process.exitCode = 1;
});
