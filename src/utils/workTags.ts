/**
 * workTags.ts —— 作品标签体系（从标题命名规律自动推导）
 * ============================================================================
 * 你的作品标题是「形式-作品-角色」三段式，例如：
 *   中文翻配-原神-阿罗夏
 *   广播剧-汪汪队立大功：萌汪公寓-主线剧情·第十三集-重逢之夜
 *   漫画翻配-The Backwards House（倒置屋）-第二集（下）
 *   翻唱-Il aurait suffi（with 果茹）
 *
 * 所以标签不用一篇篇手写，直接从标题推导，分成三组：
 *   形式  翻配 / 漫画翻配 / 广播剧 / 有声书 / 小剧场 / 角色合集 / 二创配音 / 翻唱 / 自留 / 声展
 *   语言  中文 / 日语 / 俄语 / 英语 / 法语 / 多语种
 *   IP    原神 / 崩坏：星穹铁道 / 明日方舟 / 明日方舟：终末地 / 鸣潮 ……（作品出处）
 *
 * ── 侧边栏瘦身：只有 1-2 件作品的小众标签会折叠成「其他」──
 *   侧边栏靠 buildTagIndex() 生成。每组里出现次数 < MIN_TAG_COUNT 的标签不单独列出，
 *   只带小众标签的作品会被收进该组的「其他」条目里 ——
 *   这样侧边栏从 43 条降到 22 条，同时**任何一件作品仍然能被筛出来**，不会找不到。
 *   想调门槛改 MIN_TAG_COUNT；想改成「直接不显示」就把 buildTagIndex 里推入 OTHER_TAG 那段删掉。
 *
 * ── 想调整标签体系，只改下面 RULES 这一个表就行 ──
 *   · 加了新 IP：加一行 { tag: '新IP', group: 'IP', re: /标题里出现的词/ }
 *   · 标签名想统一：改 tag 字段即可（例如把「英语」和「英文」都收敛到「英语」）
 *   · 同一组内**取第一个命中的规则**（所以顺序有意义：漫画翻配 要排在 翻配 前面，
 *     否则「中文漫画翻配」会同时被算成 翻配）
 *   · IP 组例外：允许一条标题命中多个出处
 *
 * ── 想给某一篇单独加标签 ──
 *   直接在那篇 md 的 frontmatter 里写 tags: [日语, 翻唱]，会和自动推导的合并（去重）。
 *   这条也用来补自动推导覆盖不到的情况，比如翻唱作品标题里没写语言。
 * ============================================================================
 */

import type { Work } from './notes';

export const TAG_GROUP_ORDER = ['形式', '语言', 'IP'] as const;
export type TagGroup = (typeof TAG_GROUP_ORDER)[number];

interface Rule {
  tag: string;
  group: TagGroup;
  re: RegExp;
}

export const RULES: Rule[] = [
  // ------------------------------------------------------------ 形式
  // 顺序很重要：越具体的越靠前
  { tag: '漫画翻配', group: '形式', re: /漫画翻配/ },
  { tag: '广播剧', group: '形式', re: /广播剧/ },
  { tag: '有声书', group: '形式', re: /有声书/ },
  { tag: '小剧场', group: '形式', re: /小剧场/ },
  { tag: '角色合集', group: '形式', re: /角色合集/ },
  { tag: '二创配音', group: '形式', re: /二创配音/ },
  { tag: '声展', group: '形式', re: /声展/ },
  { tag: '翻唱', group: '形式', re: /翻唱/ },
  { tag: '自留', group: '形式', re: /自留/ },
  { tag: '翻配', group: '形式', re: /翻配/ },

  // ------------------------------------------------------------ 语言
  // 兼容标题里出现过的各种写法（英语/英文、日语/日配 都归到同一个标签）
  { tag: '多语种', group: '语言', re: /多语种|多语言|四国语言/ },
  { tag: '中文', group: '语言', re: /中文|中配/ },
  { tag: '日语', group: '语言', re: /日语|日配/ },
  { tag: '俄语', group: '语言', re: /俄语|俄配/ },
  { tag: '英语', group: '语言', re: /英语|英文|英配/ },
  { tag: '法语', group: '语言', re: /法语|法配/ },

  // ------------------------------------------------------------ 作品 / IP 出处
  { tag: '原神', group: 'IP', re: /原神/ },
  { tag: '崩坏：星穹铁道', group: 'IP', re: /星穹铁道|崩坏/ },
  { tag: '鸣潮', group: 'IP', re: /鸣潮/ },
  { tag: '明日方舟：终末地', group: 'IP', re: /终末地/ },
  { tag: '明日方舟', group: 'IP', re: /明日方舟(?![：:]终末地)/ },
  { tag: '物华弥新', group: 'IP', re: /物华弥新/ },
  { tag: '赤潮', group: 'IP', re: /赤潮/ },
  { tag: '非人哉', group: 'IP', re: /非人哉/ },
  { tag: '重返未来：1999', group: 'IP', re: /重返未来/ },
  { tag: '王者荣耀', group: 'IP', re: /王者荣耀/ },
  { tag: '英雄联盟', group: 'IP', re: /英雄联盟/ },
  { tag: '阴阳师', group: 'IP', re: /阴阳师/ },
  { tag: '黑执事', group: 'IP', re: /黑执事/ },
  { tag: '忘川风华录', group: 'IP', re: /忘川风华录/ },
  { tag: '时光代理人', group: 'IP', re: /时光代理人/ },
  { tag: '有兽焉', group: 'IP', re: /有兽焉/ },
  { tag: '雾山五行', group: 'IP', re: /雾山五行/ },
  { tag: '食物语', group: 'IP', re: /食物语/ },
  { tag: '咒术回战', group: 'IP', re: /五条悟|咒术/ },
  { tag: 'The Backwards House', group: 'IP', re: /Backwards House/i },
  { tag: '汪汪队立大功', group: 'IP', re: /汪汪队/ },
  { tag: '生草执事与大小姐', group: 'IP', re: /生草执事/ },
  { tag: '我家大师兄脑子有坑', group: 'IP', re: /大师兄脑子有坑/ },
  { tag: '太沐与科技城', group: 'IP', re: /太沐/ },
  { tag: '地缚少年花子君', group: 'IP', re: /花子君/ },
  { tag: '小王子', group: 'IP', re: /小王子/ },
  { tag: '马萨里克医生', group: 'IP', re: /马萨里克/ },
];

/**
 * 推导一篇作品的全部标签。
 * 只看标题 —— 标题是你自己定的规范，比简介可靠；简介里提到别的作品容易误伤。
 */
export function deriveTags(work: Work): string[] {
  const out: string[] = [];
  for (const group of TAG_GROUP_ORDER) {
    for (const t of tagsOfGroup(work.data.title ?? '', group)) out.push(t);
  }

  // frontmatter 里手写的 tags 作为补充（去重）
  for (const t of work.data.tags ?? []) {
    if (!out.includes(t)) out.push(t);
  }
  return out;
}

/**
 * 少于这个数量的标签会被折叠进「其他」，免得侧边栏被只出现一两次的标签撑爆。
 * 设成 1 就等于不折叠（所有标签都列出来）。想改成「直接不显示」也可以，
 * 把 buildTagIndex 里推入 OTHER_TAG 那段删掉即可。
 */
export const MIN_TAG_COUNT = 3;
/** 折叠后的收纳标签名 */
export const OTHER_TAG = '其他';

/** 一篇作品在某一组里命中的标签（IP 组允许多个，其余组只取第一个命中的规则） */
function tagsOfGroup(title: string, group: TagGroup): string[] {
  const hit = RULES.filter((r) => r.group === group && r.re.test(title));
  if (hit.length === 0) return [];
  return group === 'IP' ? hit.map((r) => r.tag) : [hit[0].tag];
}

/** 一篇作品 → 每组各自的标签（未折叠） */
function perWorkTags(work: Work): Map<string, string[]> {
  const m = new Map<string, string[]>();
  const title = work.data.title ?? '';
  for (const group of TAG_GROUP_ORDER) m.set(group, tagsOfGroup(title, group));
  return m;
}

export interface TagIndex {
  /** 侧边栏用：按组归类、组内按数量倒序，末尾附一个折叠出来的「其他」 */
  groups: { group: TagGroup; tags: { name: string; count: number }[] }[];
  /** work.id → 「组:标签」串（写进 DOM 给前端筛选）；小众标签已折叠成「其他」 */
  attrs: Map<string, string>;
}

/**
 * 一次算好侧边栏需要的全部东西：
 *   · 每组有哪些标签、各多少件（只列 >= MIN_TAG_COUNT 的，避免臃肿）
 *   · 只含小众标签的作品会归到该组的「其他」里 —— 这样任何一件作品都还能被筛出来，
 *     不会出现「标签被藏了、作品也就找不到了」的情况
 *   · 每篇作品的 data-tags 串
 */
export function buildTagIndex(works: Work[]): TagIndex {
  const perWork = works.map((w) => ({ work: w, byGroup: perWorkTags(w) }));

  // 先统计每组每个标签的总数
  const totals = new Map<string, Map<string, number>>();
  for (const g of TAG_GROUP_ORDER) totals.set(g, new Map());
  for (const { byGroup } of perWork) {
    for (const g of TAG_GROUP_ORDER) {
      for (const t of byGroup.get(g) ?? []) {
        const m = totals.get(g)!;
        m.set(t, (m.get(t) ?? 0) + 1);
      }
    }
  }
  const isCommon = (group: TagGroup, tag: string) =>
    (totals.get(group)?.get(tag) ?? 0) >= MIN_TAG_COUNT;

  const groups = TAG_GROUP_ORDER.map((group) => {
    const total = totals.get(group)!;
    const tags = [...total.entries()]
      .filter(([, c]) => c >= MIN_TAG_COUNT)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh'));

    // 该组里「一个常见标签都没命中」的作品，全部收进「其他」
    let bucket = 0;
    for (const { byGroup } of perWork) {
      const own = byGroup.get(group) ?? [];
      if (own.length === 0) continue;
      if (!own.some((t) => isCommon(group, t))) bucket++;
    }
    if (bucket > 0) tags.push({ name: OTHER_TAG, count: bucket });
    return { group, tags };
  }).filter((g) => g.tags.length > 0);

  const attrs = new Map<string, string>();
  for (const { work, byGroup } of perWork) {
    const parts: string[] = [];
    for (const group of TAG_GROUP_ORDER) {
      const own = byGroup.get(group) ?? [];
      const common = own.filter((t) => isCommon(group, t));
      // 标签名要 encodeURIComponent：data-tags 是用空格分隔的，
      // 而标签名本身可能带空格（例如「The Backwards House」），不编码会被拆成三截，筛选就永远命中不了。
      if (common.length) common.forEach((t) => parts.push(`${group}:${encodeURIComponent(t)}`));
      else if (own.length) parts.push(`${group}:${encodeURIComponent(OTHER_TAG)}`);
    }
    // frontmatter 手写的 tags 一并带上（不参与侧边栏折叠）
    for (const t of work.data.tags ?? []) parts.push(`补充:${encodeURIComponent(t)}`);
    attrs.set(work.id, parts.join(' '));
  }

  return { groups, attrs };
}

/** 搜索用的文本（小写、拼在一起），覆盖标题/角色/标签 */
export function searchText(work: Work): string {
  return [work.data.title, (work.data.roles ?? []).join(' '), deriveTags(work).join(' ')]
    .join(' ')
    .toLowerCase();
}
