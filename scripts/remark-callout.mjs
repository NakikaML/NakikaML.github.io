/**
 * remark-callout.mjs —— 例题 / 提示 等「内嵌引用块」（Obsidian callout 风格）
 * ==================================================================
 * 需求见 bug及意见汇总.md 的 opinion-22：给正文里的「例题」一个专属格式，
 * 像 Obsidian 的 callout 那样整块嵌在正文里，而不是散落成一堆加粗文字。
 *
 * 写法一（推荐，本项目的笔记正文都用这种）—— `:::类型 标题` 起头，`:::` 收尾：
 *
 *     :::example 例 1 · 求数组最大值
 *     找出数组 `{300, 350, 200, 400, 250}` 中的最大值。
 *
 *     **思路**：……
 *     **解**：……
 *     :::
 *
 * 写法二（Obsidian 原生语法，从知识库粘贴过来直接就能用）：
 *
 *     > [!example] 例 1 · 求数组最大值
 *     > 找出数组 ……
 *
 * 两种写法渲染成同一段 HTML：
 *
 *     <div class="callout callout--example" data-callout="example" role="note">
 *       <div class="callout__head">
 *         <span class="callout__chip">例 1</span>
 *         <span class="callout__title">求数组最大值</span>
 *       </div>
 *       <div class="callout__body">……</div>
 *     </div>
 *
 * 类型 → 角标默认文字见 TYPES：example 例题 / note 说明 / tip 提示 /
 * warning 易错 / danger 警告 / summary 小结 / quote 引用 / info 补充。
 * 例题还会把标题里的「例 N」拆成角标，剩下的当标题（标题是纯文本，不支持行内语法）。
 *
 * 几个刻意的取舍：
 *   · 在 **mdast 层**（而不是 rehype 层）做：`::: … :::` 这种围栏必须在转成 HTML
 *     之前就把散落的块重新组装成父子关系。产物靠 mdast 节点的 `data.hName` /
 *     `data.hProperties` 落地，mdast-util-to-hast 会照办。
 *   · 不引第三方依赖（unist-util-visit、remark-directive 之类），遍历自己写，
 *     和 rehype-code-meta.mjs 的做法保持一致。
 *   · **必须先炸开段落**：markdown 会把没有空行隔开的好几行并成一个 paragraph
 *     （软换行是文本里的 \n，不是独立节点）。不先按行切开，
 *     `:::example 例 1` 后面那一行正文会被当成标题的一部分。见 explodeFences。
 *   · 忘记写收尾时**不让它吞掉整篇**：只在当前这一层往下找，找不到就在下一个
 *     标题前停住，并打印一条带行号的警告。
 */

/** 支持的类型 → 角标默认文字（类名同时是 .callout--<类型>） */
const TYPES = {
  example: '例题',
  note: '说明',
  tip: '提示',
  warning: '易错',
  danger: '警告',
  summary: '小结',
  quote: '引用',
  info: '补充',
};

/**
 * 一行围栏：`:::`（收尾）或 `:::类型 标题`（开头）。
 * 第一组是类型（可能为空），第二组是标题。
 */
const FENCE = /^:::[ \t]*([^\s:]*)[ \t]*([\s\S]*)$/;
/** Obsidian 的 `[!example]` / `[!example]-`（`-`/`+` 是折叠标记，本项目不折叠，忽略） */
const ALIAS = /^\[!([A-Za-z][\w-]*)\]([+-]?)[ \t]*([^\n]*)(\n|$)/;
/** 标题里的「例 3」「习题 12」「题目 2.3」 */
const NUM = /^(例(?:题|如)?|习题|练习|题目)\s*([0-9]+(?:\.[0-9]+)?)/;

/** 拼一个「只是个带类名的元素」的 mdast 节点 —— 落地成 div/span 靠 data.hName */
const part = (hName, className, children) => ({
  type: 'calloutPart',
  data: { hName, hProperties: { className } },
  children,
});

const text = (value) => ({ type: 'text', value });

/** 取节点的纯文本（不引 mdast-util-to-string，少一个依赖） */
function textOf(node) {
  if (!node) return '';
  if (typeof node.value === 'string') return node.value;
  if (Array.isArray(node.children)) return node.children.map(textOf).join('');
  return '';
}

/**
 * 把标题拆成「角标 + 标题文字」。
 *   例 1 · 求数组最大值 → 角标「例 1」，标题「求数组最大值」
 *   例 1（求数组最大值）→ 同上（圆括号当分隔符）
 *   求数组最大值        → 角标「例题」，标题整条
 */
function splitTitle(raw, type) {
  const title = (raw ?? '').trim().replace(/^[：:、，,\s]+/, '');

  if (type !== 'example') {
    return { chip: TYPES[type] ?? '说明', rest: title };
  }

  const m = NUM.exec(title);
  if (!m) {
    // 只有「例：总时延计算」这种没编号的写法，去掉前缀当标题
    const rest = title.replace(/^例\s*[：:]\s*/, '');
    return { chip: TYPES.example, rest };
  }

  let rest = title.slice(m[0].length).replace(/^[·・.、,:：\u2014\-\s]+/, '');
  // 「（求数组最大值）」整条被括号包住时，把括号剥掉，标题才干净
  const paren = /^[（(]([\s\S]*)[）)]$/.exec(rest);
  if (paren) rest = paren[1];
  return { chip: `${m[1]} ${m[2]}`, rest: rest.trim() };
}

/**
 * 标题是**纯文本**：`$…$` 在本插件之前就已被 remark-math 拆成 math 节点，
 * 到这里只剩 TeX 源码（`\frac{0}{0}`），而标题不会再解析公式 ——
 * 于是 `:::example 例 1 · 基本的 $\frac{0}{0}$ 型` 会显示成「基本的 \frac{0}{0} 型」。
 * 这条警告就是为了别再靠肉眼发现：标题里请写纯文字。
 */
function warnTexTitle(rest, file, position) {
  if (!rest) return;
  if (/\\[a-zA-Z]+|[\^_]\s*\{|[{}]/.test(rest)) {
    warnAt(file, { position }, `callout 标题里有公式源码（标题不解析公式）：「${rest}」`);
  }
}

/** 组装 callout 的 mdast 节点 */
function buildCallout({ type, title }, children, position, file) {
  const { chip, rest } = splitTitle(title, type);
  warnTexTitle(rest, file, position);

  const head = [part('span', ['callout__chip'], [text(chip)])];
  if (rest) head.push(part('span', ['callout__title'], [text(rest)]));

  const parts = [part('div', ['callout__head'], head)];
  if (children.length > 0) parts.push(part('div', ['callout__body'], children));

  return {
    type: 'callout',
    position,
    data: {
      hName: 'div',
      hProperties: {
        className: ['callout', `callout--${type}`],
        'data-callout': type,
        role: 'note',
      },
    },
    children: parts,
  };
}

/** 类型规范化 + 未知类型的兜底（拼错类型不该让整块内容消失） */
function normalizeType(raw, file, node) {
  const type = String(raw ?? '').toLowerCase();
  if (type in TYPES) return type;
  warnAt(file, node, `未知的 callout 类型「${raw}」，已按 note 渲染`);
  return 'note';
}

/** 这一行是不是开头围栏（只认，不报警 —— 配对时要反复扫，别刷一屏警告） */
function rawOpen(node) {
  if (node?.type !== 'paragraph') return null;
  const m = FENCE.exec(textOf(node).trim());
  if (!m || !m[1]) return null; // 光秃秃的 ::: 是收尾
  return m;
}

/** 开头围栏 → { type, title }（类型拼错时退化成 note） */
function matchOpen(node, file) {
  const m = rawOpen(node);
  if (!m) return null;
  return { type: normalizeType(m[1], file, node), title: m[2] };
}

/** 这一行是不是收尾围栏 */
function isClose(node) {
  if (node?.type !== 'paragraph') return null;
  const m = FENCE.exec(textOf(node).trim());
  return m && !m[1] ? m : null;
}

/** 一行文本是不是围栏（开或关） */
const isFenceLine = (line) => FENCE.test(line.trim());

/** 这个节点是不是「一整段就是一行围栏」 */
function isFenceParagraph(node) {
  return node?.type === 'paragraph' && isFenceLine(textOf(node));
}

/**
 * 块级容器：围栏可能被 CommonMark 的「惰性续行」吞进这些节点里。
 * （行内节点不用管 —— 围栏不可能出现在行内）
 */
const BLOCK_CONTAINERS = new Set(['list', 'listItem', 'blockquote', 'footnoteDefinition', 'table']);

/** 从节点的最深末尾掏出一个围栏段（有就返回，没有就 null） */
function popTrailingFence(node) {
  const kids = node?.children;
  if (!Array.isArray(kids) || kids.length === 0) return null;

  const last = kids[kids.length - 1];
  if (isFenceParagraph(last)) {
    kids.pop();
    return last;
  }
  // GFM 表格会把紧随其后的 `:::` 当成新的一行（`| ::: |  |`）
  if (last.type === 'tableRow' && isFenceLine(textOf(last))) {
    kids.pop();
    return { type: 'paragraph', position: last.position, children: [text(':::')] };
  }
  if (!BLOCK_CONTAINERS.has(last.type)) return null;

  const deep = popTrailingFence(last);
  if (deep) {
    // 掏空了的容器（例如整条列表只剩一个空 listItem）就别留在树里
    if (Array.isArray(last.children) && last.children.length === 0) kids.pop();
    return deep;
  }
  return null;
}

/**
 * 把「被吞进容器里的收尾围栏」提到容器外面。
 *
 * 踩过的坑（真事）：清单 / 引用块的末尾紧跟 `:::`（中间没空行）时，
 * CommonMark 会把这行当成最后一个列表项的**惰性续行**，
 * 于是收尾围栏跑进了 <li> 里，和外层的开围栏不在同一层，配对直接失败 ——
 * 页面上会看到一行字面的 `:::`。这里把它一层层提回同级。
 *
 * 只处理「末尾」方向：收尾围栏总在例题的最后，覆盖真实写法；
 * 开围栏被吞（例如把一个 `:::example` 直接接在 `- 列表项` 后面）属于罕见写法，
 * 交给 findClose 的警告提示作者补空行。
 */
function hoistTrailingFences(children) {
  const out = [];
  for (const node of children) {
    if (Array.isArray(node.children)) node.children = hoistTrailingFences(node.children);
    out.push(node);
    if (!BLOCK_CONTAINERS.has(node.type)) continue;
    let fence;
    while ((fence = popTrailingFence(node))) out.push(fence);
  }
  return out;
}

/**
 * 把一个 paragraph 的行内子节点按「行」切开。
 * mdast 里软换行就是文本里的 \n，所以切分文本节点就够了。
 * @returns {Array<Array<object>>} 每行的行内节点
 */
function splitByLine(children) {
  const lines = [[]];
  for (const child of children) {
    if (typeof child.value === 'string') {
      const segments = child.value.split('\n');
      segments.forEach((segment, idx) => {
        if (idx > 0) lines.push([]);
        if (segment !== '') lines[lines.length - 1].push({ ...child, value: segment });
      });
      continue;
    }
    lines[lines.length - 1].push(child);
  }
  return lines;
}

/**
 * 预处理：把「含围栏的段落」按行炸开成多个块。
 *
 * 为什么非做不可：作者很可能这样写（本项目的笔记就是这样）——
 *
 *     :::example 例 1 · 求数组最大值
 *     找出数组 ……
 *
 * 没有空行隔开的两行是**同一个 paragraph**。不炸开的话，
 * 「找出数组 ……」会被当成标题的一部分塞进 callout__head。
 * 炸开之后再交给 transform 配对，写起来就跟代码块一样随手。
 */
function explodeFences(children) {
  const out = [];
  for (const node of children) {
    if (node?.type === 'paragraph' && textOf(node).includes('\n')) {
      const lines = splitByLine(node.children ?? []);
      if (lines.some((line) => isFenceLine(textOf({ children: line })))) {
        let buffer = [];
        const flush = () => {
          if (buffer.length === 0) return;
          const kids = [];
          buffer.forEach((lineKids, idx) => {
            if (idx > 0) kids.push(text('\n'));
            kids.push(...lineKids);
          });
          if (kids.length > 0) out.push({ type: 'paragraph', position: node.position, children: kids });
          buffer = [];
        };
        for (const lineKids of lines) {
          const lineText = textOf({ children: lineKids }).trim();
          // 「这一行是不是空的」不能只看文本：图片、行内/块级公式这些节点没有文本，
          // 但它们绝不是空行。以前只判 `lineText === ''`，于是
          //
          //     :::example 例 1 · 描绘图形
          //     ![图](/notes-assets/x.svg)        ← 紧跟围栏、同一段
          //
          // 里那张图会被当成空行丢掉（页面上图就没了，也不报错）。
          const onlyBlankText = lineKids.every(
            (n) => typeof n.value === 'string' && n.value.trim() === ''
          );
          if (isFenceLine(lineText)) {
            flush();
            out.push({ type: 'paragraph', position: node.position, children: lineKids });
          } else if (lineKids.length === 0 || onlyBlankText) {
            flush();
          } else {
            buffer.push(lineKids);
          }
        }
        flush();
        continue;
      }
    }
    if (Array.isArray(node.children)) node.children = explodeFences(node.children);
    out.push(node);
  }
  return out;
}

function warnAt(file, node, message) {
  const name = file?.path ? String(file.path).split(/[\\/]/).pop() : '未知文件';
  const line = node?.position?.start?.line;
  console.warn(`[callout] ${name}${line ? `:${line}` : ''} ${message}`);
}

/**
 * 从 from 开始找收尾；找不到就退到下一个标题之前，别把整篇吞掉。
 *
 * 必须自己数层数：`:::` 同一个标记既开又关，只找「第一个 :::」
 * 会把外层提前关掉，内层的收尾就变成正文里一行字面的 `:::`。
 */
function findClose(children, from, opener, file) {
  let depth = 0;
  for (let k = from; k < children.length; k++) {
    if (isClose(children[k])) {
      if (depth === 0) return { contentEnd: k, resume: k + 1 };
      depth--;
      continue;
    }
    if (rawOpen(children[k])) depth++;
  }
  for (let k = from; k < children.length; k++) {
    if (children[k]?.type === 'heading') {
      warnAt(file, opener, '没有找到收尾的 `:::`，已在下一个标题前自动结束');
      return { contentEnd: k, resume: k };
    }
  }
  warnAt(file, opener, '没有找到收尾的 `:::`，已延伸到这一层的末尾');
  return { contentEnd: children.length, resume: children.length };
}

/**
 * 把 paragraph 开头 count 个字符切掉，剩下的行内节点原样保留。
 * 用于从 `[!example] 标题` 这一行里把标记和标题抠掉。
 */
function cutPrefix(node, count) {
  let left = count;
  const out = [];
  for (const child of node.children ?? []) {
    if (left <= 0) {
      out.push(child);
      continue;
    }
    if (typeof child.value === 'string') {
      if (child.value.length <= left) {
        left -= child.value.length;
        continue;
      }
      out.push({ ...child, value: child.value.slice(left) });
      left = 0;
      continue;
    }
    const len = textOf(child).length;
    if (len <= left) {
      left -= len;
      continue;
    }
    left = 0; // 标记横跨行内节点（几乎不会发生）：整个丢掉，别产出半截节点
  }
  return out;
}

/** `> [!example] 标题` 这种 Obsidian 写法 → callout */
function parseAlias(node, file) {
  if (node?.type !== 'blockquote') return null;
  const first = node.children?.[0];
  if (!first || first.type !== 'paragraph') return null;

  const m = ALIAS.exec(textOf(first).trimStart());
  if (!m) return null;

  // 标题占掉的是「标记 + 标题 + 换行」，同一段里后续几行还要留在正文
  const restChildren = cutPrefix(first, m[0].length);
  const body = [];
  if (restChildren.length > 0) body.push({ ...first, children: restChildren });
  body.push(...(node.children ?? []).slice(1));

  return { type: normalizeType(m[1], file, node), title: m[3], body, position: node.position };
}

/** 递归改写：按顺序扫一层，遇到开围栏就把它和收围栏之间的兄弟节点收进来 */
function transform(children, file) {
  const out = [];
  let i = 0;
  while (i < children.length) {
    const node = children[i];

    const alias = parseAlias(node, file);
    if (alias) {
      out.push(buildCallout(alias, transform(alias.body, file), alias.position, file));
      i++;
      continue;
    }

    const open = matchOpen(node, file);
    if (open) {
      const close = findClose(children, i + 1, node, file);
      const inner = transform(children.slice(i + 1, close.contentEnd), file);
      out.push(buildCallout(open, inner, node.position, file));
      i = close.resume;
      continue;
    }

    if (Array.isArray(node.children)) node.children = transform(node.children, file);
    out.push(node);
    i++;
  }
  return out;
}

export default function remarkCallout() {
  return (tree, file) => {
    // 顺序不能换：先按行炸开段落（围栏才会成为独立的块），
    // 再把被惰性续行吞进清单 / 引用块里的收尾围栏提出来，最后才配对。
    const exploded = explodeFences(tree.children);
    const hoisted = hoistTrailingFences(exploded);
    tree.children = transform(hoisted, file);
  };
}
