/**
 * course-series.ts —— 笔记详情页页尾的「同课程笔记」（opinion-8）
 * ============================================================
 * 以前页尾那块「相关笔记」是按**标签重合度**算的（后来整块摘掉了，见 opinion-10）；
 * 现在换成按**课程体系**列全系列：打开 DSA-1，页尾就是 DSA-1…DSA-8，当前这篇高亮。
 *
 * 为什么按课程而不是按标签：
 *   · 标签是横向的（讲「栈」的和讲「二叉树」的都能算相关），课程是纵向的 ——
 *     读者读完一章，真正想知道的是「这门课还有哪几章、我走到哪儿了」；
 *   · 这个顺序是作者手写的教学判断，已经放在 `src/data/curriculum.ts` 的 `courses` 里了，
 *     这里只把它翻译成「页面上要渲染的一行行」，**不重新排序**。想调顺序就改那个文件。
 *
 * 三种行的形态：
 *   · 已上线            → 可点的链接；
 *   · 课程里挂了、笔记还没写 → 灰行 +「待发布」（标题用 curriculum.ts 的 draftTitles 兜底）；
 *   · 同一 subfield 但没挂进课程 → 补到列表末尾（新写完忘了挂时，至少别让它从自己的页尾消失）。
 */

import { courses, draftTitles, shortTitle } from '../data/curriculum';
import type { Note } from './notes';
import { chapterOf } from './toc';

export interface SeriesItem {
  /** 笔记 id（= 文件名 = URL 末段） */
  id: string;
  /** 短标题：剥掉课程名前缀与章号，与知识图谱沿用同一套规则（shortTitle） */
  label: string;
  /** 章号，从完整标题里取（"数据结构与算法-2 线性表" → 2），与目录编号同一套规则 */
  chapter: number;
  /** 详情页地址；null = 这一章还没上线，页面上渲染成不可点的灰行 */
  href: string | null;
  /** 是不是正在读的这一篇 */
  current: boolean;
  /** true = 同一 subfield 但没写进 curriculum.ts，被兜底补进来的 */
  unlisted: boolean;
}

export interface CourseSeries {
  /** 课程名（= 笔记 frontmatter 的 subfield） */
  course: string;
  /** 按课程顺序排好的全系列，含当前这篇 */
  items: SeriesItem[];
}

/**
 * 算出这篇笔记所属课程的全系列列表；算不出来（或只有自己一篇）时返回 null，页面就不渲染这一块。
 *
 * @param notes 已经过草稿可见性过滤的笔记集合（见 utils/notes.ts 的 visible）
 */
export function courseSeries(notes: Note[], current: Note): CourseSeries | null {
  const course = current.data.subfield?.trim();
  if (!course) return null;

  const published = new Map(notes.map((n) => [n.id, n]));
  const items: SeriesItem[] = [];
  const listed = new Set<string>();

  for (const ch of courses.find((c) => c.id === course)?.chapters ?? []) {
    // 已上线的用 frontmatter 的真实标题；还没写的用 draftTitles 的兜底标题。
    // 两个都没有 → 连章名都不知道，宁可不渲染这一行，也别凭空造一个名字出来。
    const title = published.get(ch.id)?.data.title ?? draftTitles[ch.id] ?? '';
    if (!title) continue;
    listed.add(ch.id);
    items.push({
      id: ch.id,
      label: shortTitle(title, course),
      chapter: chapterOf(title),
      href: published.has(ch.id) ? `/notes/${ch.id}/` : null,
      current: ch.id === current.id,
      unlisted: false,
    });
  }

  // 兜底：同一门课里还没写进 curriculum.ts 的笔记。
  // 不补的话，它自己的页尾会连「高亮的那一行」都没有 —— 看着像功能坏了。
  // 顺序按章号（无章的排最后），跟上面「按课程顺序」的差别只在这几篇上。
  const extras = notes
    .filter((n) => n.data.subfield?.trim() === course && !listed.has(n.id))
    .map((n) => ({ note: n, chapter: chapterOf(n.data.title) }))
    .sort((a, b) => a.chapter - b.chapter || a.note.data.title.localeCompare(b.note.data.title));
  for (const { note: n, chapter } of extras) {
    items.push({
      id: n.id,
      label: shortTitle(n.data.title, course),
      chapter,
      href: `/notes/${n.id}/`,
      current: n.id === current.id,
      unlisted: true,
    });
  }

  // 只有自己一篇时没什么可列的；自己不在列表里（数据对不上）也宁可不显示
  if (items.length < 2 || !items.some((i) => i.current)) return null;
  return { course, items };
}
