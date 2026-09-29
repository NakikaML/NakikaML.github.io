/**
 * toc.ts —— 把笔记的标题组装成「类论文」的层级目录
 * ============================================================
 * 需求（见 bug及意见汇总.md 的 opinion-2）：
 *   目录要像论文的目录那样带层级编号，结构一眼可读：
 *
 *     1.1 数据结构                      ← h2
 *       1.1.1 数据结构的基本概念          ← h3
 *             · 数据                     ← h4，只罗列、不编号，一行一个
 *             · 数据元素
 *       1.1.2 数据类型
 *
 * 编号规则：
 *   · 一篇笔记 = 一章，章号从 title 里取（"数据结构与算法-2 线性表" → 2）
 *   · h2 → {章}.{位次}      h3 → {章}.{h2位次}.{位次}
 *   · h4 → 空编号，正文里以「·」逐个罗列，作为知识点出现
 *
 * 为什么 h4 不编号：它列的是「这一小节讲了哪些概念」，是条目而不是章节，
 * 加上 1.1.1.1 这种四级编号反而看不清。
 */

export interface TocHeading {
  depth: number;
  slug: string;
  text: string;
}

export interface TocNode {
  /** 锚点 id；空串表示这是一个占位父节点（正文意外以 h3 开头时才会出现） */
  slug: string;
  /** 显示用标题 */
  text: string;
  /** 类论文编号，如 "1.1"、"1.1.2"；h4 与占位节点为空串 */
  number: string;
  children: TocNode[];
}

/**
 * 从笔记标题里取章号：`数据结构与算法-2 线性表` → 2。
 * 取不到就退回 1——目录照样能编号，只是从 1.1 开始，
 * 不会因为标题格式不同就整篇没有目录。
 */
export function chapterOf(title: string): number {
  const m = title.match(/-(\d+)(?:\s|$)/);
  const n = m ? Number(m[1]) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/**
 * 剥掉作者手写在样式标题里的顶层序号："1. 数据结构" → "数据结构"。
 *
 * 只在这个序号**正好等于它在本篇里的位次**时才剥，避免误伤
 * "2 的幂""3 种存储结构"这类标题——那种情况下原样显示。
 */
export function stripOwnNumber(text: string, position: number): string {
  return text.replace(new RegExp(`^${position}\\.\\s*`), '');
}

/** 只让 h2 / h3 / h4 进目录：h1 是页面标题，h5/h6 太细。 */
const TOC_DEPTHS = [2, 3, 4];

export function buildToc(headings: TocHeading[], chapter: number): TocNode[] {
  const roots: TocNode[] = [];
  let h2: TocNode | null = null;
  let h3: TocNode | null = null;
  let h2Pos = 0;
  let h3Pos = 0;

  const ensureH2 = (): TocNode => {
    if (!h2) {
      h2 = { slug: '', text: '', number: '', children: [] };
      roots.push(h2);
    }
    return h2;
  };

  for (const h of headings) {
    if (!TOC_DEPTHS.includes(h.depth)) continue;

    if (h.depth === 2) {
      h2Pos += 1;
      h3Pos = 0;
      h3 = null;
      h2 = {
        slug: h.slug,
        text: stripOwnNumber(h.text, h2Pos),
        number: `${chapter}.${h2Pos}`,
        children: [],
      };
      roots.push(h2);
      continue;
    }

    if (h.depth === 3) {
      const parent = ensureH2();
      h3Pos += 1;
      h3 = {
        slug: h.slug,
        text: h.text,
        number: parent.number ? `${parent.number}.${h3Pos}` : '',
        children: [],
      };
      parent.children.push(h3);
      continue;
    }

    // h4：知识点，不编号。挂到最近的 h3 下；没有 h3 就直接挂到 h2 下。
    const leaf: TocNode = { slug: h.slug, text: h.text, number: '', children: [] };
    if (h3) h3.children.push(leaf);
    else ensureH2().children.push(leaf);
  }

  return roots;
}

/** 目录条目总数（含各层），用来决定要不要渲染目录。 */
export function countToc(nodes: TocNode[]): number {
  return nodes.reduce((sum, n) => sum + 1 + countToc(n.children), 0);
}
