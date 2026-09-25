#!/usr/bin/env node
/**
 * bili-receive.mjs —— 本地接收器：让浏览器把抓取结果直接 POST 进项目
 * ============================================================================
 * 为什么需要它？
 *   从浏览器控制台用 a.click() 触发下载有时会被 Chrome 静默拦掉
 *   （"自动下载被阻止"），文件根本不会落盘，找都找不到。
 *   这个接收器省掉「下载 → 再手动挪进项目」这一步：
 *   浏览器直接把 JSON POST 到本机，服务器写进项目根目录。
 *
 * 用法：
 *   node scripts/bili-receive.mjs [端口] [输出文件名]
 *   默认：端口 49811，输出 bili-works-451932330.json（写到项目根目录）
 *
 * 然后在浏览器（已打开 space.bilibili.com 且已跑过导出脚本的那个标签页）
 * 的控制台里粘贴：
 *
 *   fetch('http://127.0.0.1:49811/save', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'text/plain' },
 *     body: JSON.stringify(__biliExport.status())
 *   }).then(r => r.text()).then(t => console.log('✅ 已发送:', t))
 *     .catch(e => console.error('❌ 发送失败:', e));
 *
 * 说明：
 *   · 页面是 HTTPS，请求是 HTTP —— 目标 127.0.0.1 属于「potentially trustworthy」，
 *     浏览器不会当成混合内容拦掉。
 *   · 用 text/plain 是为了走「简单请求」，避免额外预检；同时也实现了
 *     OPTIONS 预检（含 Private Network Access 头），两种路径都能过。
 * ============================================================================
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.argv[2]) || 49811;
const OUTFILE = process.argv[3] || 'bili-works-451932330.json';
const DEST = path.join(ROOT, OUTFILE);
const MAX_LIFETIME_MS = 60 * 60 * 1000; // 最多待 1 小时

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  // Chrome 的 Private Network Access：公网页面访问 localhost 会发预检，需要这个头
  'Access-Control-Allow-Private-Network': 'true',
};

let saves = 0;

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    return res.end();
  }

  if (req.method === 'GET') {
    res.writeHead(200, { ...CORS, 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(
      `<meta charset="utf-8"><body style="font:14px/1.7 system-ui;padding:2rem">
       <h2>✅ 接收器已就绪</h2>
       <p>端口 <b>${PORT}</b>，已收到 <b>${saves}</b> 次数据。</p>
       <p>现在回到 B 站空间页的控制台，粘贴我给的那段 fetch 即可。</p>
       <p>目标文件：<code>${OUTFILE}</code></p></body>`
    );
  }

  if (req.method !== 'POST') {
    res.writeHead(405, CORS);
    return res.end('只接受 POST');
  }

  const chunks = [];
  let size = 0;
  req.on('data', (c) => {
    chunks.push(c);
    size += c.length;
  });
  req.on('end', () => {
    const body = Buffer.concat(chunks).toString('utf8');
    let parsed = null;
    try {
      parsed = JSON.parse(body);
    } catch (e) {
      console.error(`✗ 收到 ${size} 字节，但不是合法 JSON：${e.message}`);
      res.writeHead(400, { ...CORS, 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('不是合法 JSON: ' + e.message);
    }

    const videos = Array.isArray(parsed) ? parsed : parsed.videos;
    if (!Array.isArray(videos)) {
      console.error('✗ JSON 里没有 videos 数组，字段：' + Object.keys(parsed).join(','));
      res.writeHead(400, { ...CORS, 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('JSON 里没有 videos 数组');
    }

    try {
      fs.writeFileSync(DEST, JSON.stringify(parsed, null, 2), 'utf8');
    } catch (e) {
      console.error('✗ 写文件失败：' + e.message);
      res.writeHead(500, { ...CORS, 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('写文件失败: ' + e.message);
    }

    saves++;
    const declared = parsed.declaredTotal ? `（B站声明 ${parsed.declaredTotal} 条）` : '';
    console.log(
      `\n✅ 第 ${saves} 次接收成功：${videos.length} 条${declared}，${(size / 1024).toFixed(1)} KB → ${OUTFILE}\n` +
        `   前 3 条：${videos
          .slice(0, 3)
          .map((v) => `${v.bvid} ${String(v.title).slice(0, 22)}`)
          .join(' | ')}\n`
    );

    res.writeHead(200, { ...CORS, 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`收到 ${videos.length} 条，已写入 ${OUTFILE}`);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[接收器] 监听 http://127.0.0.1:${PORT}`);
  console.log(`[接收器] 目标文件：${DEST}`);
  console.log(`[接收器] 在浏览器新标签页打开 http://127.0.0.1:${PORT} 可自测连通性`);
  console.log(`[接收器] 等待浏览器 POST…（最多待 1 小时）`);
});

setTimeout(() => {
  console.log('[接收器] 已到 1 小时上限，自动退出');
  process.exit(0);
}, MAX_LIFETIME_MS);
