import { getCollection, type CollectionEntry } from 'astro:content';

export type Note = CollectionEntry<'notes'>;
export type Work = CollectionEntry<'works'>;
export type Post = CollectionEntry<'blog'>;

/** 笔记详情页 URL */
export function noteHref(note: { id: string }): string {
  return `/notes/${note.id}/`;
}

/** 作品详情/外链 URL */
export function workAnchor(work: Work): string {
  return work.data.url || `/works/#${work.id}`;
}

/** 按日期倒序，没有日期的排最后，其次按标题 */
export function byDateDesc<T extends { data: { date?: string | Date } }>(a: T, b: T): number {
  const da = a.data.date ? new Date(a.data.date).getTime() : 0;
  const db = b.data.date ? new Date(b.data.date).getTime() : 0;
  if (da !== db) return db - da;
  return 0;
}

/** 全部笔记（已过滤草稿），按日期倒序 */
export async function allNotes(): Promise<Note[]> {
  const notes = await getCollection('notes');
  return notes.filter((n) => !n.data.draft).sort(byDateDesc);
}

/** 笔记卡片用的摘要：优先用 frontmatter 的 description，没有才从正文抽 */
export function noteSummary(note: Note, len = 110): string {
  const d = note.data.description?.trim();
  if (d) return d.length > len ? d.slice(0, len) + '…' : d;
  return excerpt(note.body, len);
}

/** 只取普通笔记（排除 MOC 索引页） */
export async function contentNotes(): Promise<Note[]> {
  return (await allNotes()).filter((n) => n.data.kind !== 'moc');
}

/** 只取 MOC 知识地图页 */
export async function mapNotes(): Promise<Note[]> {
  return (await allNotes()).filter((n) => n.data.kind === 'moc');
}

/** 分类 → 篇数，按篇数倒序 */
export function countByCategory(notes: Note[]): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const n of notes) {
    const c = n.data.category || '未分类';
    map.set(c, (map.get(c) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/** 标签 → 篇数，只保留出现次数 >= min 的 */
export function countByTag(notes: Note[], min = 2): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const n of notes) {
    for (const t of n.data.tags ?? []) map.set(t, (map.get(t) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .filter((t) => t.count >= min)
    .sort((a, b) => b.count - a.count);
}

/** 同分类内的上一篇 / 下一篇（按日期倒序排列后取相邻） */
export function siblings(notes: Note[], current: Note): { prev?: Note; next?: Note } {
  const sameCat = notes.filter((n) => n.data.category === current.data.category);
  const idx = sameCat.findIndex((n) => n.id === current.id);
  if (idx === -1) return {};
  return { prev: sameCat[idx + 1], next: sameCat[idx - 1] };
}

/** 按共享标签数找相关笔记 */
export function relatedNotes(notes: Note[], current: Note, limit = 5): Note[] {
  const own = new Set(current.data.tags ?? []);
  if (own.size === 0) return [];
  return notes
    .filter((n) => n.id !== current.id)
    .map((n) => ({
      note: n,
      score: (n.data.tags ?? []).filter((t) => own.has(t)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.note);
}

/** 格式化日期为 YYYY-MM-DD */
export function fmtDate(d?: string | Date): string {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

/** 从 markdown 正文提取一段纯文本摘要 */
export function excerpt(body: string | undefined, len = 120): string {
  if (!body) return '';
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')       // 代码块
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')     // 块级公式
    .replace(/\$[^$\n]+\$/g, ' ')          // 行内公式
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // 图片
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, '$2$1') // 双链
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')              // 链接
    .replace(/^\s{0,3}#{1,6}\s+/gm, ' ')   // 标题
    .replace(/[*_`>#|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > len ? text.slice(0, len) + '…' : text;
}
