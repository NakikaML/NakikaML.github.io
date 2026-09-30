#!/usr/bin/env node
/**
 * test-image-size.mjs —— rehype-image-figure 的回归测试
 * ==================================================================
 * 跑法：node scripts/test-image-size.mjs   （或 pnpm test:img）
 *
 * 为什么值得单独测：
 *   1. 图片宽高是从**二进制文件头**里抠出来的（jpg/png/gif/webp/bmp 各有各的
 *      偏移量），偏移写错一个字节不会报错，只会让页面上每张图的比例都是错的。
 *      构建照样通过，所以必须单独钉住。
 *   2. 包 <figure> 的规则很容易踩到非法嵌套：<figure> 不能塞进 <p>，
 *      <button> 不能塞进 <a>。这里把「独占一段 / 带链接 / 夹在文字里」三种
 *      情况都测一遍，免得以后改着改着把页面结构改成浏览器要自己纠正的样子。
 *
 * 夹具说明：
 *   · jpg 用仓库里的真实素材（public/notes-assets/*.jpg），尺寸是与
 *     System.Drawing 对过的一组真实值；
 *   · png / gif 是真实的 1×1 文件（base64 内联）；
 *   · webp / bmp 没有可用素材，用**按格式规范拼出来的文件头**测偏移量
 *     （只验证「读第几个字节」，不验证解码本身）。
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import rehypeImageFigure from './rehype-image-figure.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');

let pass = 0;
const fails = [];
const check = (label, actual, expect) => {
  if (actual === expect) pass++;
  else fails.push(`${label}\n    期望 ${JSON.stringify(expect)}\n    实际 ${JSON.stringify(actual)}`);
};

// ------------------------------------------------------------------ 夹具
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'nakika-img-test-'));

// 真实的 1×1 PNG / GIF
const PNG_1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==',
  'base64'
);
const GIF_1x1 = Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', 'base64');

/** 按 BMP 规范拼一个 w×h 的 24 位 BMP（只需要头部，像素数据留空） */
function makeBmp(w, h) {
  const buf = Buffer.alloc(54);
  buf.write('BM', 0, 'ascii');
  buf.writeUInt32LE(54, 2);
  buf.writeUInt32LE(54, 10); // 像素数据偏移
  buf.writeUInt32LE(40, 14); // BITMAPINFOHEADER
  buf.writeInt32LE(w, 18);
  buf.writeInt32LE(h, 22);
  buf.writeUInt16LE(1, 26);
  buf.writeUInt16LE(24, 28);
  return buf;
}

/** VP8X（扩展格式）：宽高各 24 位，存的是「实际值 - 1」 */
function makeWebpVp8x(w, h) {
  const buf = Buffer.alloc(30);
  buf.write('RIFF', 0, 'ascii');
  buf.writeUInt32LE(22, 4);
  buf.write('WEBP', 8, 'ascii');
  buf.write('VP8X', 12, 'ascii');
  buf.writeUInt32LE(10, 16);
  const put = (v, at) => {
    buf[at] = (v - 1) & 0xff;
    buf[at + 1] = ((v - 1) >> 8) & 0xff;
    buf[at + 2] = ((v - 1) >> 16) & 0xff;
  };
  put(w, 24);
  put(h, 27);
  return buf;
}

/** VP8（有损）：宽高在 26 / 28 字节，各占 14 位 */
function makeWebpVp8(w, h) {
  const buf = Buffer.alloc(30);
  buf.write('RIFF', 0, 'ascii');
  buf.writeUInt32LE(22, 4);
  buf.write('WEBP', 8, 'ascii');
  buf.write('VP8 ', 12, 'ascii');
  buf.writeUInt32LE(10, 16);
  buf.writeUInt16LE(w & 0x3fff, 26);
  buf.writeUInt16LE(h & 0x3fff, 28);
  return buf;
}

/** VP8L（无损）：宽 14 位 + 高 14 位，从小端 32 位字里按位切 */
function makeWebpVp8l(w, h) {
  const buf = Buffer.alloc(30);
  buf.write('RIFF', 0, 'ascii');
  buf.writeUInt32LE(22, 4);
  buf.write('WEBP', 8, 'ascii');
  buf.write('VP8L', 12, 'ascii');
  buf.writeUInt32LE(10, 16);
  buf.writeUInt32LE(((w - 1) & 0x3fff) | (((h - 1) & 0x3fff) << 14), 21);
  return buf;
}

fs.writeFileSync(path.join(TMP, 't.png'), PNG_1x1);
fs.writeFileSync(path.join(TMP, 't.gif'), GIF_1x1);
fs.writeFileSync(path.join(TMP, 't.bmp'), makeBmp(7, 5));
fs.writeFileSync(path.join(TMP, 't-vp8x.webp'), makeWebpVp8x(100, 50));
fs.writeFileSync(path.join(TMP, 't-vp8.webp'), makeWebpVp8(320, 200));
fs.writeFileSync(path.join(TMP, 't-vp8l.webp'), makeWebpVp8l(640, 480));
fs.writeFileSync(path.join(TMP, 'broken.jpg'), Buffer.from([0xff, 0xd8, 0x00, 0x01]));

// ------------------------------------------------------------- hast 小工具
const el = (tagName, properties = {}, children = []) => ({
  type: 'element',
  tagName,
  properties,
  children,
});
const text = (value) => ({ type: 'text', value });

/** 跑一遍插件，方便按需取回处理后的树 */
function run(children) {
  const tree = { type: 'root', children };
  rehypeImageFigure({ publicDir: TMP })(tree, { path: path.join(TMP, 'fake.md') });
  return tree;
}

const imgOf = (node) => {
  if (node.tagName === 'img') return node;
  for (const c of node.children ?? []) {
    const found = imgOf(c);
    if (found) return found;
  }
  return null;
};

// ------------------------------------------------------ 1. 各格式的尺寸解析
const sizeCases = [
  ['/t.png', 1, 1, 'png'],
  ['/t.gif', 1, 1, 'gif'],
  ['/t.bmp', 7, 5, 'bmp'],
  ['/t-vp8x.webp', 100, 50, 'webp / VP8X'],
  ['/t-vp8.webp', 320, 200, 'webp / VP8'],
  ['/t-vp8l.webp', 640, 480, 'webp / VP8L'],
];
for (const [src, w, h, label] of sizeCases) {
  const tree = run([el('p', {}, [el('img', { src, alt: label })])]);
  const img = imgOf(tree);
  check(`${label} 宽（${src}）`, img.properties.width, w);
  check(`${label} 高（${src}）`, img.properties.height, h);
}

// 真实 jpg：尺寸是与 System.Drawing 核对过的真实值
const realJpg = [
  ['dsa6-01-directed-vs-undirected.jpg', 1754, 442],
  ['dsa6-02-simple-vs-multigraph.jpg', 1754, 383],
  ['dsa6-03-vertex-degree.jpg', 1754, 415],
  ['dsa6-04-subgraph.jpg', 1754, 401],
];
for (const [file, w, h] of realJpg) {
  const tree = { type: 'root', children: [el('p', {}, [el('img', { src: `/notes-assets/${file}`, alt: '' })])] };
  rehypeImageFigure({ publicDir: PUBLIC })(tree, { path: path.join(PUBLIC, 'fake.md') });
  const img = imgOf(tree);
  check(`真实 jpg ${file} 宽`, img.properties.width, w);
  check(`真实 jpg ${file} 高`, img.properties.height, h);
}

// ------------------------------------------------------ 2. jpg 解析健壮性
// 半截 jpg：宽高应当取不到，且不影响其它属性
{
  const tree = run([el('p', {}, [el('img', { src: '/broken.jpg', alt: 'x' })])]);
  const img = imgOf(tree);
  check('损坏 jpg 不写 width', img.properties.width, undefined);
  check('损坏 jpg 仍然补 lazy', img.properties.loading, 'lazy');
}
// 不存在的文件、外链、data URI：都不该炸
{
  const tree = run([
    el('p', {}, [el('img', { src: '/nope.png', alt: '' })]),
    el('p', {}, [el('img', { src: 'https://example.com/a.png', alt: '' })]),
    el('p', {}, [el('img', { src: 'data:image/png;base64,AAAA', alt: '' })]),
  ]);
  check('三种取不到尺寸的图片来源都不写 width', imgOf(tree).properties.width, undefined);
}

// ------------------------------------------------------ 3. figure 包裹规则
{
  // 独占一段的图 → figure > [img, button]
  const tree = run([el('p', {}, [el('img', { src: '/t.png', alt: '图注' })])]);
  const fig = tree.children[0];
  check('独占一段的图被包成 figure', fig.tagName, 'figure');
  check('figure 的 class', (fig.properties.className ?? []).join(' '), 'figure');
  check('figure 里第一个是 img', fig.children[0].tagName, 'img');
  check('figure 里第二个是放大按钮', fig.children[1].tagName, 'button');
  check('按钮带原图地址', fig.children[1].properties['data-img-zoom'], '/t.png');
  check('按钮带 alt 供图注使用', fig.children[1].properties['data-img-alt'], '图注');
  check('按钮有 aria-label', fig.children[1].properties['aria-label'], '放大查看：图注');
}
{
  // [![alt](img)](link) → figure > a > img，按钮在 <a> 外面（<a> 里不能有 <button>）
  const tree = run([
    el('p', {}, [el('a', { href: 'https://example.com' }, [el('img', { src: '/t.png', alt: '' })])]),
  ]);
  const fig = tree.children[0];
  check('带链接的图也包成 figure', fig.tagName, 'figure');
  check('figure 里是 <a>', fig.children[0].tagName, 'a');
  check('<a> 里是 <img>', fig.children[0].children[0].tagName, 'img');
  check('放大按钮不在 <a> 内部', fig.children[1].tagName, 'button');
}
{
  // 夹在文字里的图 → 保持 <p>，只补属性（点击图片本身放大）
  const tree = run([
    el('p', {}, [text('看这张：'), el('img', { src: '/t.png', alt: '' }), text('就是这样')]),
  ]);
  const p = tree.children[0];
  check('夹在文字里的图不被包 figure', p.tagName, 'p');
  check('夹在文字里的图补了 lazy', imgOf(p).properties.loading, 'lazy');
  check('夹在文字里的图带 data-zoomable', imgOf(p).properties['data-zoomable'], '');
}
{
  // 一个段落里两张图 → 不该被当成「独占一段」，两张都只补属性
  const tree = run([
    el('p', {}, [el('img', { src: '/t.png', alt: '' }), el('img', { src: '/t.gif', alt: '' })]),
  ]);
  check('一段两张图时不包 figure', tree.children[0].tagName, 'p');
}

// -------------------------------------------------------------------- 结果
fs.rmSync(TMP, { recursive: true, force: true });

console.log(`\n通过 ${pass} 项`);
if (fails.length > 0) {
  console.log(`失败 ${fails.length} 项：`);
  for (const f of fails) console.log(`  ✗ ${f}`);
  process.exit(1);
}
console.log('✅ image-figure 测试全部通过\n');
