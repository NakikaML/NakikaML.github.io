/**
 * updates.ts —— 「更新日志」的数据层（opinion-31）
 * ==================================================================
 * 首页那条「最近更新了什么」的小横幅，和 /updates/ 更新日志页，读的都是这里。
 *
 * 只统计**内容**：新笔记、更新/订正过的笔记（opinion-11 的 `updated`）、新作品、新博客。
 * 代码与样式改动**不算** —— 否则改一个错别字也会让所有访客看到一次「有新内容」，
 * 这条提示很快就变成噪音。
 *
 * 两个关键设计：
 *
 * ① **批次指纹（batchId）不能由构建时间算**。
 *    `pnpm build` 每次部署都会重算一遍；如果用时间/随机数当批次号，那么每次 push
 *    （哪怕只改了一行 CSS）指纹都会变，所有看过的人又被弹一次。
 *    这里只用**最新几条内容的 `kind:id@date`** 拼出来算哈希：
 *    内容不变 → 指纹不变 → 老访客安静；真加了东西 → 指纹变 → 弹一次。
 *    刻意只取前几条而不是全部：早期条目随着时间「沉下去」不该改变指纹。
 *
 * ② **横幅默认 hidden，由页面脚本判断后才显示**。
 *    静态站没有会话，唯一可用的记忆是 localStorage（见 components/UpdateNotice.astro）。
 *    默认隐藏可以保证认过的访客不会先看到一眼再消失（0 闪烁），
 *    没有 JS 的访客也永远看不到这条提示 —— 它不该挡内容。
 */

import type { Note, Post, Work } from './notes';
import { fmtDate, noteUpdated, workAnchor } from './notes';
import { featureLog } from '../data/feature-log';

export type UpdateKind = 'feature' | 'note' | 'work' | 'post';

/** 更新日志里的一条 */
export interface SiteUpdate {
  kind: UpdateKind;
  /** 笔记 id / 作品 id / 博客 id / 功能标题 */
  id: string;
  title: string;
  href: string;
  /** YYYY-MM-DD：一条更新的发生日 —— 新增取 `date`，更新取 `updated`，功能取上线那天，其余取发布日期 */
  date: string;
  /** true = 回头更新/订正过的（只有笔记会为 true） */
  revised: boolean;
  /** 只有功能条目有：一句话说明，显示在 /updates/ 里 */
  summary?: string;
}

export const UPDATE_KIND_LABEL: Record<UpdateKind, string> = {
  feature: '功能',
  note: '笔记',
  work: '作品',
  post: '博客',
};

/** 同一天里谁排在前面：功能 > 笔记 > 作品 > 博客（功能最稀有，值得先看到） */
const KIND_RANK: Record<UpdateKind, number> = { feature: 0, note: 1, work: 2, post: 3 };

/** 横幅只列最近这段时间里的东西：再久就不叫「最近更新」了 */
const WINDOW_DAYS = 45;
/** 横幅里最多列几条（太多就变成第二次「最近更新」板块了） */
const BATCH_MAX = 5;

/**
 * 作品**先不进**更新日志。
 *
 * 原因不是「作品不算内容」，而是**日期不可比**：作品的 `date` 是 B 站投稿日期，
 * 不是它被放上本站的日期。批量导入之后，那 100 个视频会变成
 * 「2023 年 3 月站上更新了 7 次」——站那时候根本还不存在。
 * 真要收进来，先得给作品记一个「上站日期」（比如导入时间），再把这个开关打开。
 */
const INCLUDE_WORKS = false;

const DAY_MS = 24 * 60 * 60 * 1000;

/** FNV-1a：短、无依赖，只用来「比一下是不是同一批」，不需要抗碰撞 */
function shortHash(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

/**
 * 批次指纹。空列表返回 ''（没有内容时横幅根本不该出现）。
 *
 * 取的是「**最新那一天的整批条目**」，哈希里带上日期：
 *   · 同一天又补了一篇笔记 / 上线了一个功能 → 这一批变了 → 指纹变 → 老访客会再看一次提示；
 *   · 旧条目随时间沉出 45 天窗口 → 最新那天没变 → 指纹不变 → 不会无缘无故再弹；
 *   · 自己先 `sort()` 再拼 —— 展示顺序会随 `KIND_RANK`、`order`、甚至一次排版调整而变，
 *     指纹要是跟着展示顺序变，那就等于「改个排版给所有人再弹一次」。
 *
 * 已知取舍：**补录一条日期在过去的条目不会触发提示**（最新那天没动）。
 * 这是故意的 —— 那种情况不属于「最近更新」。
 */
export function updateBatchId(list: SiteUpdate[]): string {
  if (list.length === 0) return '';
  let newest = '';
  for (const u of list) if (u.date > newest) newest = u.date;
  const sameDay = list
    .filter((u) => u.date === newest)
    .map((u) => `${u.kind}:${u.id}`)
    .sort()
    .join('|');
  return shortHash(`${newest}|${sameDay}`);
}

/** 把三个集合里的条目 + 手写的功能日志摊平成更新日志（按日期倒序） */
export function collectUpdates(input: { notes: Note[]; works: Work[]; posts: Post[] }): SiteUpdate[] {
  const out: SiteUpdate[] = [];

  // 手写的「重大功能」条目（src/data/feature-log.ts）。收录标准写在那份文件里：
  // 只收访客能看见、能用上的新东西，修 bug / 重构 / 微调不算。
  for (const f of featureLog) {
    out.push({
      kind: 'feature',
      id: f.title,
      title: f.title,
      href: f.href ?? '',
      date: f.date,
      revised: false,
      summary: f.summary,
    });
  }

  for (const n of input.notes) {
    const href = `/notes/${n.id}/`;
    const created = fmtDate(n.data.date);
    // noteUpdated 只在 updated 真的比 date 晚时才有值（见 utils/notes.ts）
    const revisedOn = noteUpdated(n);

    // 新增与更新**各记一条**。早先这里是一条记录、日期取「更新的那天」，
    // 结果笔记一更新，它当初「发布」那条日志就被顶掉消失了 ——
    // 日志的意义就是留住这两件事，所以两个日期都保留。
    if (created) {
      out.push({ kind: 'note', id: n.id, title: n.data.title, href, date: created, revised: false });
    }
    if (revisedOn) {
      out.push({ kind: 'note', id: n.id, title: n.data.title, href, date: revisedOn, revised: true });
    }
  }

  if (INCLUDE_WORKS) {
    for (const w of input.works) {
      const date = fmtDate(w.data.date);
      if (!date) continue;
      out.push({ kind: 'work', id: w.id, title: w.data.title, href: workAnchor(w), date, revised: false });
    }
  }

  for (const p of input.posts) {
    const date = fmtDate(p.data.date);
    if (!date) continue;
    out.push({ kind: 'post', id: p.id, title: p.data.title, href: `/blog/${p.id}/`, date, revised: false });
  }

  // 同一天里：功能排在内容前面（更稀有），同样地位的保持插入顺序 ——
  // 功能条目按 feature-log.ts 里手写的顺序（我认为的「重要的先」），
  // 笔记按内容集合本来的顺序（已按日期倒序、同日按标题）。
  // 这里刻意不拿标题兜底排序：那会把作者手写的先后打乱。
  return out.sort((a, b) => b.date.localeCompare(a.date) || KIND_RANK[a.kind] - KIND_RANK[b.kind]);
}

/** 按月分组（/updates/ 页用）。月份按遇到顺序排，输入已是倒序，所以天然从新到旧 */
export function groupByMonth(list: SiteUpdate[]): { month: string; label: string; items: SiteUpdate[] }[] {
  const groups: { month: string; label: string; items: SiteUpdate[] }[] = [];
  for (const item of list) {
    const month = item.date.slice(0, 7); // YYYY-MM
    let g = groups.find((x) => x.month === month);
    if (!g) {
      const [y, m] = month.split('-');
      g = { month, label: `${y} 年 ${Number(m)} 月`, items: [] };
      groups.push(g);
    }
    g.items.push(item);
  }
  return groups;
}

export interface UpdateFeed {
  /** 横幅用：最近 WINDOW_DAYS 天里的条目（最多 BATCH_MAX 条） */
  batch: SiteUpdate[];
  /** 批次指纹；没有内容时是 '' */
  batchId: string;
  /** /updates/ 页用：全部条目 */
  all: SiteUpdate[];
  /** /updates/ 页用：按月分组 */
  months: { month: string; label: string; items: SiteUpdate[] }[];
}

/**
 * 装配更新日志。
 *
 * @param input 已按草稿可见性过滤过的三个集合（见 utils/notes.ts 的 visible）
 * @param now   测试用；默认取当前时间
 */
export function updateFeed(
  input: { notes: Note[]; works: Work[]; posts: Post[] },
  now: Date = new Date()
): UpdateFeed {
  const all = collectUpdates(input);
  // 指纹只看「最新几条」，与窗口无关 —— 旧条目沉出窗口不该让所有人再看一次提示
  const batchId = updateBatchId(all);
  const cutoff = fmtDate(new Date(now.getTime() - WINDOW_DAYS * DAY_MS));
  const batch = cutoff ? all.filter((u) => u.date >= cutoff).slice(0, BATCH_MAX) : all.slice(0, BATCH_MAX);

  return { batch, batchId, all, months: groupByMonth(all) };
}

/** 横幅上那句人话：`10 月 20 日` */
export function dayLabel(date: string): string {
  const [, m, d] = date.split('-');
  return `${Number(m)} 月 ${Number(d)} 日`;
}
