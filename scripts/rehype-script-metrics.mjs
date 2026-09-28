/**
 * rehype-script-metrics.mjs —— 把 KaTeX 的上下标间距拉开一点
 * ==================================================================
 * 为什么需要：
 *   KaTeX 的上下标位置是**渲染时算好写进内联样式**的（`style="top:-2.4519em"`），
 *   不是 CSS 能改的；而它用的是 TeX 的固定度量（上标抬 0.413em、下标压 0.247em，
 *   字号 70%）。MathJax（Obsidian 用的那个）改成从数学字体的 OpenType MATH 表里取，
 *   同一个 `C_{2n}^{n}` 会更舒展——所以两边看起来不一样，这是引擎差异不是配置问题。
 *
 *   KaTeX 没有暴露度量配置，但它的输出结构很稳定，于是这里在构建期直接改那几个
 *   内联数值：**只处理同时带上标和下标的那种盒子**（`msupsub` 里的两行 vlist），
 *   也就是 `C_{2n}^{n}`、`x_i^2` 这类挤在一起的写法；
 *   `O(n^2)` 这种只有上标的、以及分式/根号一律不碰。
 *
 *   调整量：上标再抬高 EXTRA_GAP_EM、下标再压低 EXTRA_GAP_EM，
 *   对应的 vlist 高度与深度同步加长。想更松/更紧就改这一个常数。
 *
 * 失效保护：KaTeX 哪天改了输出结构，这里会因为找不到预期节点而原样返回，
 * 上下标退回 KaTeX 默认间距——不会把公式改坏。
 *
 * 注意：字号那一半在 global.css 里（`.katex .msupsub .sizing... { font-size }`），
 * 两处要一起调才协调：字号变大而间距不变会更挤。
 */

/** 上标抬高、下标压低各多少 em。想更舒展就调大（建议 0 ~ 0.12；0 = 完全不改）。 */
const EXTRA_GAP_EM = 0.05;

const hasClass = (node, name) => {
  const cls = node?.properties?.className;
  const list = Array.isArray(cls) ? cls : typeof cls === 'string' ? cls.split(/\s+/) : [];
  return list.includes(name);
};

const topOf = (node) => {
  const m = /(?:^|;)\s*top:\s*(-?[\d.]+)em/.exec(node?.properties?.style ?? '');
  return m ? Number(m[1]) : null;
};

const heightOf = (node) => {
  const m = /(?:^|;)\s*height:\s*([\d.]+)em/.exec(node?.properties?.style ?? '');
  return m ? Number(m[1]) : null;
};

const bumpTop = (node, delta) => {
  const v = topOf(node);
  if (v === null) return;
  node.properties.style = node.properties.style.replace(
    /((?:^|;)\s*top:\s*)(-?[\d.]+)em/,
    (_all, prefix) => `${prefix}${(v + delta).toFixed(4)}em`
  );
};

const bumpHeight = (node, delta) => {
  const v = heightOf(node);
  if (v === null) return;
  node.properties.style = node.properties.style.replace(
    /((?:^|;)\s*height:\s*)([\d.]+)em/,
    (_all, prefix) => `${prefix}${(v + delta).toFixed(4)}em`
  );
};

const children = (node) => (Array.isArray(node?.children) ? node.children : []);

/** 处理一个 msupsub 盒子；结构不符合预期就什么都不做 */
function widenOne(msupsub) {
  // vlist-t2 = 两行（正好一个上标 + 一个下标）；只有一行时是 vlist-t，跳过
  const stack = children(msupsub).find((c) => hasClass(c, 'vlist-t2'));
  if (!stack) return;

  const rows = children(stack).filter((c) => hasClass(c, 'vlist-r'));
  if (rows.length < 2) return;

  const scriptVlist = children(rows[0]).find((c) => hasClass(c, 'vlist'));
  const depthVlist = children(rows[1]).find((c) => hasClass(c, 'vlist'));
  if (!scriptVlist || !depthVlist) return;

  const scripts = children(scriptVlist).filter((c) => topOf(c) !== null);
  if (scripts.length !== 2) return;

  // top 越负 = 位置越高。所以更负的那个是上标，另一个是下标。
  const [a, b] = scripts;
  const sup = topOf(a) < topOf(b) ? a : b;
  const sub = sup === a ? b : a;

  bumpTop(sup, -EXTRA_GAP_EM); // 上标再高一点
  bumpTop(sub, EXTRA_GAP_EM); // 下标再低一点
  bumpHeight(scriptVlist, EXTRA_GAP_EM); // 整盒更高
  bumpHeight(depthVlist, EXTRA_GAP_EM); // 整盒更深
}

function walk(node) {
  if (hasClass(node, 'msupsub')) widenOne(node);
  for (const child of node.children ?? []) {
    if (child && typeof child === 'object') walk(child);
  }
}

export default function rehypeScriptMetrics() {
  return (tree) => walk(tree);
}
