/**
 * remark-source-lines.mjs —— 给「可以安全行内编辑」的块打上源码行号
 * ==================================================================
 * 这是「本地在页面上直接改字」功能的一半：
 *
 *   渲染 Markdown 时，把每个「纯文本块」在 .md 源文件里的行号写进 HTML：
 *       <p data-edit="simple" data-edit-start="14" data-edit-end="14">…</p>
 *   页面上的编辑器拿到行号，就能在保存时**精确替换对应的源码行**，
 *   而不是去反解 HTML —— 这是整个方案能做到无损的关键。
 *
 * 什么算「纯文本块」（可安全行内编辑）：
 *   · paragraph / heading / listItem
 *   · 内部**只有 text 子节点** —— 一旦出现 强调、粗体、行内代码、链接、
 *     行内公式（remark-math 会先把 $…$ 变成 inlineMath 节点）、图片、
 *     硬换行、原生 HTML，就一律不标记。
 *
 * ⚠️ 行号是「**正文内的行号**」，不是文件行号。
 *    Astro 只把去掉 frontmatter 之后的正文交给 Markdown 处理器，所以
 *    `node.position.start.line` 从正文第 1 行算起。真正写文件的是
 *    scripts/dev/content-editor-plugin.mjs，它负责加上 frontmatter 占的行数
 *    （见那里的 bodyLineOffset）。这两边必须一致，
 *    scripts/dev/test-editor.mjs 里有一项专门盯这个换算。
 *
 * 为什么这么严：行内编辑拿到的是渲染后的 textContent，标记语法已经丢了。
 * 只有「渲染结果 === 原文」的块，回写才不会破坏内容；其余的全部退化成
 * 「用原文抽屉改」，宁可不方便，也不能把公式和加粗改没了。
 *
 * 该插件只在本地 dev 挂载（astro.config.mjs 的 IS_DEV 分支），
 * 并且自己再判一次 NODE_ENV，双保险确保构建产物里没有一个多余属性。
 */

/** 可标记的节点类型 */
const BLOCK_TYPES = new Set(['paragraph', 'heading', 'listItem']);

/**
 * 块的子节点是否全是「纯文本」。
 *
 * 允许文本里带软换行（`\n`）—— 一个软换行的段落仍然是**单个** text 节点，
 * 渲染出来和普通段落毫无区别（HTML 会把换行折成空格），而 Obsidian 里
 * 手写的段落几乎都是软换行的。保存时服务端会把它合成一行，不影响渲染。
 *
 * 但硬换行（行尾两个空格或反斜杠）会生成 break 节点，就不是纯文本了，
 * 一律不标记，避免把 <br> 弄丢。
 */
function isPlainText(node) {
  const kids = node.children;
  if (!Array.isArray(kids) || kids.length === 0) return false;
  return kids.every(
    (child) =>
      child.type === 'text' && typeof child.value === 'string' && child.value.trim() !== ''
  );
}

/** 把行号写进节点的 hProperties，最终落到 HTML 属性上 */
function markSimple(node) {
  node.data = node.data || {};
  node.data.hProperties = {
    ...(node.data.hProperties || {}),
    'data-edit': 'simple',
    'data-edit-start': String(node.position.start.line),
    'data-edit-end': String(node.position.end.line),
  };
}

/** 自己走一遍树：不引 unist-util-visit，免得依赖 pnpm 不提升的传递依赖 */
function walk(node, parent, visit) {
  visit(node, parent);
  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child, node, visit);
  }
}

export default function remarkSourceLines() {
  return (tree) => {
    // 兜底：构建期直接不做事（正常也不会被挂上，见 astro.config.mjs）
    if (process.env.NODE_ENV === 'production') return;

    walk(tree, undefined, (node, parent) => {
      if (!node.position || !BLOCK_TYPES.has(node.type)) return;
      const parentType = parent?.type;

      if (node.type === 'heading') {
        if (isPlainText(node)) markSimple(node);
        return;
      }

      if (node.type === 'paragraph') {
        // 列表项里的段落交给 listItem 统一处理（紧凑列表会被 unwrap 掉，
        // 属性挂在段落上会丢），脚注定义的行首是 [^1]:，前缀规则不一样，也跳过
        if (parentType === 'listItem' || parentType === 'footnoteDefinition') return;
        if (isPlainText(node)) markSimple(node);
        return;
      }

      // listItem：只认「单行 + 唯一子节点是纯文本段落」，多行/嵌套列表一律不动
      if (node.type === 'listItem') {
        if (parentType === 'footnoteDefinition') return;
        if (node.position.start.line !== node.position.end.line) return;
        const kids = Array.isArray(node.children) ? node.children : [];
        if (kids.length !== 1) return;
        if (kids[0].type !== 'paragraph' || !isPlainText(kids[0])) return;
        markSimple(node);
      }
    });
  };
}
