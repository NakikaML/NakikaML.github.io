/**
 * rehype-image-figure.mjs —— 正文图片：懒加载 + 预留尺寸 + 点击放大
 * ==============================================================
 * 需求见 bug及意见汇总.md 的 bug-5（图片零优化）与 opinion-9（右上角放大按钮）。
 *
 * 对 Markdown 正文里每一个 <img>：
 *   1. 补 `loading="lazy"` `decoding="async"` —— 一篇 dsa-6 有 31 张图（约 8 MB），
 *      不懒加载的话进页面就会把整篇的图一次性全下下来。
 *   2. 从磁盘上的真实图片文件读出宽高补成 width/height 属性 ——
 *      CSS 里 `img { max-width: 100%; height: auto }` 拿到这两个属性后，
 *      浏览器会在图片下载完成前就按比例把位置留好，不再一边加载一边顶正文（CLS）。
 *   3. 把「独占一段的图片」包成
 *
 *        <figure class="figure">
 *          <img …>
 *          <button class="figure__zoom" data-img-zoom="/notes-assets/x.jpg" data-img-alt="…">放大</button>
 *        </figure>
 *
 *      （如果原文是 `[![alt](img)](link)` 这种带链接的图，则包成 figure > a > img，
 *        按钮跟在 <a> 后面 —— <a> 里塞 <button> 是非法嵌套。）
 *   4. 所有图片都补 `data-zoomable`，这样即使它夹在文字中间、没资格包 figure，
 *      点击图片本身也能放大（逻辑在 BaseLayout.astro 的 <dialog> 里）。
 *
 * 为什么必须替换整个 <p> 而不是就地替换 <img>：
 *   Markdown 的 `![](x)` 会被解析成 <p><img></p>，而 <figure> 是流内容，
 *   塞进 <p> 里是非法嵌套（浏览器会自己拆标签，样式随之失控）。
 *
 * 尺寸读取只认 public/ 下的本地文件（本站图片都在 public/notes-assets/），
 * 读不到就只做懒加载、不写 width/height，绝不因此让构建失败。
 * 支持 jpg / png / gif / webp / bmp；svg、avif 没有意义或解析太啰嗦，直接跳过。
 */

import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------- hast 小工具
const el = (tagName, properties, children) => ({
  type: 'element',
  tagName,
  properties: properties ?? {},
  children: children ?? [],
});
const txt = (value) => ({ type: 'text', value });

/** 判断节点是不是「只当排版用的空白文本」 */
const isBlankText = (n) => n.type === 'text' && !n.value.trim();

// ------------------------------------------------------------ 图片尺寸解析
/** 只读文件头 64 KB —— SOF 段（真正带尺寸的那段）不会离头部太远 */
const HEAD_BYTES = 64 * 1024;

function readHead(abs) {
  const fd = fs.openSync(abs, 'r');
  try {
    const size = Math.min(HEAD_BYTES, fs.fstatSync(fd).size);
    const buf = Buffer.alloc(size);
    fs.readSync(fd, buf, 0, size, 0);
    return buf;
  } finally {
    fs.closeSync(fd);
  }
}

/** JPEG：扫到 SOFn 段，宽高各占 2 字节（big-endian） */
function jpegSize(buf) {
  if (buf.length < 4 || buf.readUInt16BE(0) !== 0xffd8) return null;
  let off = 2;
  while (off + 9 < buf.length) {
    if (buf[off] !== 0xff) {
      off++;
      continue;
    }
    const marker = buf[off + 1];
    // 无长度字段的独立标记：SOI / TEM / RSTn
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      off += 2;
      continue;
    }
    const len = buf.readUInt16BE(off + 2);
    // SOF0~SOF15，其中 C4(DHT)、C8(JPG)、CC(DAC) 不是 SOF
    if (
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    ) {
      return { height: buf.readUInt16BE(off + 5), width: buf.readUInt16BE(off + 7) };
    }
    if (len < 2) return null;
    off += 2 + len;
  }
  return null;
}

/** PNG：IHDR 紧跟在 8 字节签名 + 4 字节长度 + 4 字节类型之后 */
function pngSize(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/** GIF：宽高是紧跟在签名后的两个 little-endian 16 位 */
function gifSize(buf) {
  if (buf.length < 10 || buf.toString('ascii', 0, 3) !== 'GIF') return null;
  return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
}

/** WebP：三种子格式（有损 VP8 / 无损 VP8L / 扩展 VP8X）尺寸的放法都不一样 */
function webpSize(buf) {
  if (buf.length < 30) return null;
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') {
    return null;
  }
  const kind = buf.toString('ascii', 12, 16);
  if (kind === 'VP8 ') {
    return {
      width: buf.readUInt16LE(26) & 0x3fff,
      height: buf.readUInt16LE(28) & 0x3fff,
    };
  }
  if (kind === 'VP8L') {
    // 14 位宽 / 14 位高，从第 21 字节起按小端位序压在一起
    const bits = buf.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }
  if (kind === 'VP8X') {
    return {
      width: (buf[24] | (buf[25] << 8) | (buf[26] << 16)) + 1,
      height: (buf[27] | (buf[28] << 8) | (buf[29] << 16)) + 1,
    };
  }
  return null;
}

/** BMP：宽高是第 18 / 22 字节起的 little-endian 32 位 */
function bmpSize(buf) {
  if (buf.length < 26 || buf.toString('ascii', 0, 2) !== 'BM') return null;
  return { width: buf.readInt32LE(18), height: Math.abs(buf.readInt32LE(22)) };
}

const READERS = {
  '.jpg': jpegSize,
  '.jpeg': jpegSize,
  '.jfif': jpegSize,
  '.png': pngSize,
  '.gif': gifSize,
  '.webp': webpSize,
  '.bmp': bmpSize,
};

// -------------------------------------------------------------------- 主逻辑
export default function rehypeImageFigure(options = {}) {
  const publicDir = options.publicDir ?? path.resolve('public');
  /** 同一个文件被多篇笔记引用时只解析一次 */
  const sizeCache = new Map();

  function sizeOf(abs) {
    if (sizeCache.has(abs)) return sizeCache.get(abs);
    let size = null;
    try {
      const reader = READERS[path.extname(abs).toLowerCase()];
      if (reader) size = reader(readHead(abs));
      // 宽高都是 0 或负数说明解析走偏了，宁可不写属性
      if (size && !(size.width > 0 && size.height > 0)) size = null;
    } catch {
      size = null;
    }
    sizeCache.set(abs, size);
    return size;
  }

  /** 把 URL 还原成磁盘路径：站点绝对路径走 public/，相对路径按 Markdown 文件所在目录算 */
  function resolveAbs(src, file) {
    const clean = src.split('#')[0].split('?')[0];
    if (!clean) return '';
    // 外链 / data: / 协议相对，一律不碰
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(clean)) return '';
    if (clean.startsWith('/')) return path.join(publicDir, clean.slice(1));
    const base = file?.path ? path.dirname(file.path) : process.cwd();
    try {
      return path.resolve(base, decodeURIComponent(clean));
    } catch {
      // 非法转义序列（%zz 之类），按原样拼，读不到就只是没有尺寸
      return path.resolve(base, clean);
    }
  }

  /** 给一个 <img> 补懒加载 / 尺寸标记，返回它的 src 与 alt 供放大按钮使用 */
  function decorate(img, file) {
    const props = (img.properties ??= {});
    props.loading = 'lazy';
    props.decoding = 'async';
    props['data-zoomable'] = '';

    const src = typeof props.src === 'string' ? props.src : '';
    if (src) {
      const size = sizeOf(resolveAbs(src, file));
      if (size) {
        if (props.width == null) props.width = size.width;
        if (props.height == null) props.height = size.height;
      }
    }

    const alt = typeof props.alt === 'string' ? props.alt : '';
    return { src, alt };
  }

  function zoomButton({ src, alt }) {
    return el(
      'button',
      {
        type: 'button',
        className: ['figure__zoom'],
        'data-img-zoom': src,
        'data-img-alt': alt,
        'aria-label': alt ? `放大查看：${alt}` : '放大查看图片',
        title: '点击放大',
      },
      [txt('放大')]
    );
  }

  /** <p> 里是不是只有一张图（或一个只包着一张图的链接） */
  function loneImage(node) {
    const kids = (node.children ?? []).filter((c) => !isBlankText(c));
    if (kids.length !== 1) return null;
    const only = kids[0];
    if (only.type !== 'element') return null;
    if (only.tagName === 'img') return { img: only, anchor: null };

    if (only.tagName === 'a') {
      const inner = (only.children ?? []).filter((c) => !isBlankText(c));
      if (inner.length === 1 && inner[0].type === 'element' && inner[0].tagName === 'img') {
        return { img: inner[0], anchor: only };
      }
    }
    return null;
  }

  function walkChildren(node, file) {
    if (!Array.isArray(node.children)) return;
    node.children = node.children
      // 独占一段的图片 → 整段换成 <figure>
      .map((child) => {
        if (child.type !== 'element') return child;
        if (child.tagName === 'p') {
          const lone = loneImage(child);
          if (lone) {
            const info = decorate(lone.img, file);
            const content = lone.anchor ?? lone.img;
            return el('figure', { className: ['figure'] }, [content, zoomButton(info)]);
          }
        }
        walkChildren(child, file);
        return child;
      })
      // 夹在文字/其它标签里的图片 → 只补属性，点击图片本身也能放大
      .map((child) => {
        if (child.type === 'element' && child.tagName === 'img') {
          decorate(child, file);
        }
        return child;
      });
  }

  return (tree, file) => walkChildren(tree, file);
}
