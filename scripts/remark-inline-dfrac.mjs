/**
 * remark-inline-dfrac.mjs —— 行内公式里的 \frac 自动按 display 样式排版
 * ==================================================================
 * 解决什么问题：
 *   KaTeX 对行内公式 $…$ 用「文本样式（text style）」排版，\frac 的分子分母
 *   会被降到 script 尺寸（0.7em），分数线上下只留约 0.25em 间隙——在中文正文里
 *   看起来就是「分母贴在分数线上」。而 Obsidian 用 MathJax 渲染，同一个 \frac
 *   看上去是正常的，所以从知识库搬过来的写法一到网站上就显糊。
 *
 *   实测（KaTeX 0.16 吐出的几何参数）：
 *     \frac{n(n-1)}{2}   → vlist 高 1.01em，分子分母 0.7em（span.mtight）
 *     \dfrac{n(n-1)}{2}  → vlist 高 1.427em，分子分母 1em，间距正常
 *
 * 做什么：
 *   只把**行内公式**里**顶层**的 \frac 换成 \dfrac（数学意义完全相同，
 *   只是强制 display 样式）。"顶层" = 不在任何 { } 之内：
 *
 *     $\frac{a}{b}$              → \dfrac{a}{b}     ✓ 提升
 *     $x = \frac{1}{2}$          → \dfrac{1}{2}     ✓ 提升
 *     $\frac{\frac{a}{b}}{c}$    → 只提升外层；内层保持 \frac
 *                                  （嵌套分式本来就该小一号，放大反而难看）
 *     $a_{\frac{1}{2}}$          → 不动（上下标里的分式本该是 script 尺寸）
 *     $\sqrt{\frac{a}{b}}$       → 不动（在参数里，同上）
 *
 *   $$…$$ 块级公式不动：display 模式本来就是全尺寸排版。
 *
 * 刻意不碰：
 *   · \tfrac —— 显式要求小号分式，是刻意的写法
 *   · \dfrac —— 已经是目标形态
 *   · \cfrac、\binom 等其它命令（\frac 要求反斜杠后紧跟 f，天然不会误伤）
 *
 * 副作用：
 *   行内公式会变高约 0.4em（1.01em → 1.427em），含分式的那一行会比相邻行略高。
 *   这是正常的排版收缩，不会叠字——KaTeX 的 .katex 自带 line-height:1.2，
 *   内部的 .base 又是 inline-block，行盒会自己撑开到足够高度。
 *
 * 挂载位置：astro.config.mjs 的 markdown.processor 里，**紧跟 remarkMath 之后**
 *   （必须先有 inlineMath 节点才能改），dev 与 build 都生效。
 */

const FRAC = '\\frac';
const DFRAC = '\\dfrac';

/**
 * 把一段行内 TeX 里「顶层」的 \frac 升成 \dfrac。
 *
 * 逐字符扫描而不是用正则替换：需要知道当前的花括号层级，
 * 而正则数不了嵌套层级。反斜杠序列整段跳过，
 * 这样 `\{`、`\}`、`\\` 都不会被误当成层级变化。
 *
 * @param {string} tex 行内公式的 TeX 源码（不含首尾 $）
 * @returns {string} 转换后的 TeX
 */
export function promoteTopLevelFrac(tex) {
  let out = '';
  let depth = 0;
  let i = 0;

  while (i < tex.length) {
    const ch = tex[i];

    if (ch === '\\') {
      // 顶层且不是 `\\frac` 这种被转义/换行开头的写法 → 提升
      if (depth === 0 && tex.startsWith(FRAC, i) && tex[i - 1] !== '\\') {
        out += DFRAC;
        i += FRAC.length;
        continue;
      }
      // 其它反斜杠序列整段照抄：\{ \} \\ \frac（非顶层）等
      out += tex.slice(i, i + 2);
      i += 2;
      continue;
    }

    if (ch === '{') depth += 1;
    else if (ch === '}') depth = Math.max(0, depth - 1);

    out += ch;
    i += 1;
  }

  return out;
}

/** 自己走一遍树：不引 unist-util-visit，免得依赖 pnpm 不提升的传递依赖 */
function walk(node, visit) {
  visit(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child, visit);
  }
}

/**
 * 写入新的 TeX 源码。
 *
 * ⚠️ 这是本插件唯一一个"反直觉"的地方，也是第一版没生效的原因：
 *   remark-math 解析 $…$ 时，会把同一份 TeX **同时**放在两处
 *     · node.value                  —— mdast 规范字段
 *     · node.data.hChildren[0].value —— 预置好的 hast（<code class="language-math math-inline">）
 *   而 remark-rehype 走的是 hast 那条路（优先用 data.hChildren），
 *   KaTeX 最终拿到的文本来自后者。只改 node.value 的话，
 *   mdast 看着变了、渲染出来纹丝不动。
 *   所以两边一起改，才能在任意管线配置下都生效。
 */
function setTex(node, next) {
  node.value = next;

  const kids = node.data && node.data.hChildren;
  if (!Array.isArray(kids)) return;
  for (const child of kids) {
    if (child && child.type === 'text' && typeof child.value === 'string') {
      child.value = next;
    }
  }
}

export default function remarkInlineDfrac() {
  return (tree) => {
    walk(tree, (node) => {
      if (node.type !== 'inlineMath') return;
      if (typeof node.value !== 'string') return;

      const next = promoteTopLevelFrac(node.value);
      if (next !== node.value) setTex(node, next);
    });
  };
}
