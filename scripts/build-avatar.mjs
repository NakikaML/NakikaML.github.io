#!/usr/bin/env node
/**
 * build-avatar.mjs —— 从一张原始头像图生成「首页头像 + 全套站点图标」
 * ============================================================================
 * 你只需要做一件事：把 OC 头像原图放到
 *
 *     src/assets/avatar.png
 *
 * （也接受 avatar.jpg / .jpeg / .webp / .avif，按顺序找第一个存在的）
 * 原图多大都行、比例也不必是正方形 —— 脚本会自动裁成正方形。
 *
 * 然后跑： pnpm run avatar      （`pnpm run build` 也会自动先跑一遍）
 *
 * 产出（都写到 public/，直接被网站引用）：
 *   avatar-360.webp        首页头像（1x）
 *   avatar-720.webp        首页头像（2x，高分屏用）
 *   favicon.ico            浏览器标签页图标（内嵌 16/32/48 三档 PNG）
 *   favicon-32.png         现代浏览器
 *   apple-touch-icon.png   iOS 添加到主屏（180）
 *   icon-192.png           安卓 / PWA
 *   icon-512.png           安卓 / PWA
 *
 * 想换图标：替换 src/assets/avatar.png 后重跑即可（画师给你新图也是这么换）。
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(ROOT, 'src', 'assets');
const OUT_DIR = path.join(ROOT, 'public');

const CANDIDATES = ['avatar.png', 'avatar.jpg', 'avatar.jpeg', 'avatar.webp', 'avatar.avif'];

const log = (...a) => console.log('[avatar]', ...a);

// --------------------------------------------------------------- 加载 sharp
// sharp 是 Astro 的图片优化依赖，装在 .pnpm 里但没提升到顶层，
// 所以先试常规 require，失败再按 .pnpm 目录名找（目录名带 peer 后缀，用 glob 匹配）。
function loadSharp() {
  const require = createRequire(import.meta.url);
  try {
    return require('sharp');
  } catch {
    /* 继续找 */
  }
  const pnpm = path.join(ROOT, 'node_modules', '.pnpm');
  if (fs.existsSync(pnpm)) {
    for (const d of fs.readdirSync(pnpm)) {
      if (!d.startsWith('sharp@')) continue;
      const p = path.join(pnpm, d, 'node_modules', 'sharp');
      if (fs.existsSync(p)) {
        try {
          return require(p);
        } catch {
          /* 换下一个 */
        }
      }
    }
  }
  throw new Error('找不到可用的 sharp（它是 Astro 的依赖，先跑一次 pnpm install）');
}

/** 生成一个「PNG 内嵌」的 .ico —— ICO 从 Vista 起就允许直接塞 PNG，不需要额外编码库 */
function buildIco(entries) {
  const n = entries.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type = icon
  header.writeUInt16LE(n, 4); // count
  const dir = Buffer.alloc(16 * n);
  let offset = 6 + 16 * n;
  const blobs = [];
  entries.forEach((e, i) => {
    const o = i * 16;
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, o); // 宽（0 表示 256）
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, o + 1); // 高
    dir.writeUInt8(0, o + 2); // 调色板数
    dir.writeUInt8(0, o + 3); // 保留
    dir.writeUInt16LE(1, o + 4); // 色彩平面
    dir.writeUInt16LE(32, o + 6); // 位深
    dir.writeUInt32LE(e.png.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += e.png.length;
    blobs.push(e.png);
  });
  return Buffer.concat([header, dir, ...blobs]);
}

// ------------------------------------------------------------------ 主流程
const srcName = CANDIDATES.find((f) => fs.existsSync(path.join(SRC_DIR, f)));
if (!srcName) {
  log('⚠ 没找到源图，跳过生成。');
  log(`  请把头像放到： ${path.join(SRC_DIR, 'avatar.png')}`);
  log('  （支持 .png / .jpg / .jpeg / .webp / .avif，文件名统一叫 avatar）');
  log('  已有的图标文件会保持原样，不影响构建。');
  process.exit(0);
}

const SRC = path.join(SRC_DIR, srcName);
const sharp = loadSharp();
const meta = await sharp(SRC).metadata();
log(`源图 ${srcName}  ${meta.width}×${meta.height}  ${(fs.statSync(SRC).size / 1024).toFixed(0)} KB`);

/** 统一裁成正方形。优先用「注意力」裁剪（自动找视觉重心，适合人像），失败退回居中 */
async function square(size, outFile, fmt) {
  let pipe = sharp(SRC).resize(size, size, { fit: 'cover', position: 'attention' });
  try {
    await pipe.clone().toBuffer(); // 探测 attention 是否可用
  } catch {
    pipe = sharp(SRC).resize(size, size, { fit: 'cover', position: 'centre' });
  }
  const out = fmt === 'webp' ? pipe.webp({ quality: 88 }) : pipe.png({ compressionLevel: 9 });
  await out.toFile(path.join(OUT_DIR, outFile));
  return path.join(OUT_DIR, outFile);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

// ---- 首页头像（1x / 2x）----
await square(360, 'avatar-360.webp', 'webp');
await square(720, 'avatar-720.webp', 'webp');

// ---- 各尺寸 PNG 图标 ----
await square(32, 'favicon-32.png', 'png');
await square(180, 'apple-touch-icon.png', 'png');
await square(192, 'icon-192.png', 'png');
await square(512, 'icon-512.png', 'png');

// ---- favicon.ico（内嵌 16 / 32 / 48）----
const icoEntries = [];
for (const size of [16, 32, 48]) {
  const png = await sharp(SRC)
    .resize(size, size, { fit: 'cover', position: 'attention' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  icoEntries.push({ size, png });
}
fs.writeFileSync(path.join(OUT_DIR, 'favicon.ico'), buildIco(icoEntries));

// ------------------------------------------------------------------ 汇报
const produced = [
  'avatar-360.webp',
  'avatar-720.webp',
  'favicon.ico',
  'favicon-32.png',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
];
log('生成完成：');
let total = 0;
for (const f of produced) {
  const p = path.join(OUT_DIR, f);
  const ok = fs.existsSync(p);
  const kb = ok ? fs.statSync(p).size / 1024 : 0;
  total += kb;
  log(`  ${ok ? '✓' : '✗'} ${f.padEnd(22)} ${kb.toFixed(1)} KB`);
}
log(`合计 ${total.toFixed(1)} KB`);
if (meta.width !== meta.height) {
  log(`提示：源图不是正方形（${meta.width}×${meta.height}），已自动裁成正方形。`);
  log('      如果裁掉了想保留的部分，换一张构图更居中的图，或把人物放中间再试。');
}
