/**
 * learning-route.ts —— 「学习路线」页（/notes/route/）用的数据装配
 * ============================================================
 * 一句话：把 `src/data/curriculum.ts` 里手写的**教学判断**，翻译成页面能直接渲染的
 * 「学科分野 → 课程 → 章节」三层结构。页面里不许再写排版逻辑，也不许重新排序。
 *
 * 为什么不再画图（原先的 /notes/graph/ 已下线，见 bug及意见汇总.md 的 opinion-24）：
 *   · 图要回答的其实只有一件事 —— **先学什么、再学什么**。这件事用一份带章号的有序
 *     列表就能讲清，而且列表在手机、窄屏、无障碍、搜索、Ctrl+F 里全都是赢的；
 *   · 图的成本却是实打实的：旧版 graph.astro 一个文件近 1500 行手写 SVG 布局
 *     （依赖分层、重心排序、正交折线、y 车道分配、跨带绕行），bug-8~15 里七条都是它。
 *     笔记与课程只会越加越多，这套布局的维护费没有上限；
 *   · 缩放也有硬天花板（旧版最小 0.3 倍），再加两个学科分野就开始看不清了 ——
 *     那才是「越来越乱」的真身。列表没有这个问题：加多少章就往下长多长。
 *
 * 三件**不要动**的事（改了会失真）：
 *   ① 课程顺序与章节顺序来自 curriculum.ts；章号只用来「同课程内按 1、2、3… 排」，
 *      不参与跨课程排序。
 *   ② 已上线 / 待发布一律以「笔记是否真的存在」为准，不看 draftTitles 有没有写。
 *   ③ 没挂进 curriculum.ts 的笔记**不许静默消失**：同课程的就补在课程末尾并标记
 *      「未编入路线」，连课程都对不上就落到页面底部的「其他笔记」里。
 *      （旧版图谱没有这层兜底：忘登记 = 那篇在图上是彻底不存在的，而且不报错。）
 */

import {
  courses,
  courseDeps,
  disciplines,
  disciplineOf,
  draftTitles,
  shortTitle,
  type Course,
} from '../data/curriculum';
import type { Note } from './notes';
import { byChapter, chapterOf } from './toc';

/** 一条先修：`full` 是完整说法（悬停提示 / 屏幕阅读器），`short` 是行内小标签 */
export interface RoutePrereq {
  short: string;
  full: string;
}

export interface RouteChapter {
  /** 笔记 id（= 文件名 = URL 末段） */
  id: string;
  /** 短标题，与页尾「同课程笔记」、旧图谱同一套规则（shortTitle） */
  label: string;
  /** 章号，从标题的 `-N` 取（见 utils/toc.ts 的 chapterOf） */
  chapter: number;
  /** 详情页地址；null = 这一章还没上线，渲染成不可点的灰行 */
  href: string | null;
  /** 先修（同课程的与跨课程的都在这里，已经换成人话） */
  prereq: RoutePrereq[];
  /** 408 考研权重（curriculum.ts 的 `exam408`）：core / basic / off / undefined */
  exam408?: 'core' | 'basic' | 'off';
  /** true = 这篇笔记写了，但没编进 curriculum.ts 的顺序，被兜底补到末尾 */
  unlisted: boolean;
}

export interface RouteCourse {
  /** 课程名，同时是笔记 frontmatter 的 subfield */
  id: string;
  /** 页内锚点 id，先修课程的小标签会链到它 */
  anchor: string;
  /** 课程说明（curriculum.ts 的 `note`） */
  note: string;
  /** 搜索别名（curriculum.ts 的 `aliases`），搜「DSA」「计网」时用得上 */
  aliases: string[];
  /** true = 预留课程：还没开始写，只能在路线里占个位 */
  planned: boolean;
  /** 先修**课程**（来自 courseDeps），带所属分野，好在跨学科的标签上标一下 */
  prereq: { id: string; anchor: string; cross: boolean }[];
  /** 已上线章节数 / 章节总数 */
  live: number;
  total: number;
  chapters: RouteChapter[];
}

export interface RouteDiscipline {
  key: string;
  label: string;
  note?: string;
  anchor: string;
  /** 本分野的课程，按「依赖深度 → curriculum.ts 书写顺序」排好 */
  courses: RouteCourse[];
  live: number;
  total: number;
}

export interface LearningRoute {
  disciplines: RouteDiscipline[];
  /** 连课程都对不上的笔记（subfield 空或不认识），别让它们从页面上消失 */
  orphanNotes: { id: string; title: string; href: string }[];
  stats: {
    disciplines: number;
    courses: number;
    plannedCourses: number;
    chapters: number;
    liveChapters: number;
  };
}

/**
 * 装配整条学习路线。
 *
 * @param notes 已按草稿可见性过滤过的笔记集合（`contentNotes()` 的返回值）
 */
export function learningRoute(notes: Note[]): LearningRoute {
  const published = new Map(notes.map((n) => [n.id, n]));

  /** 章 → 它属于哪门课（跨课程先修箭头/标签要靠它找人话名字） */
  const courseOfChapter = new Map<string, string>();
  for (const c of courses) {
    for (const ch of c.chapters) courseOfChapter.set(ch.id, c.id);
  }

  /** 课程先修：`courseDeps` 是 `[后学, 先学]`，这里反着建表 */
  const prereqOfCourse = new Map<string, string[]>();
  for (const [after, before] of courseDeps) {
    const list = prereqOfCourse.get(after) ?? [];
    list.push(before);
    prereqOfCourse.set(after, list);
  }

  /** 课程之间的依赖深度（只在同一分野内算），用来排「哪门课先出现」 */
  const depthOfCourse = new Map<string, number>();
  const depth = (id: string, seen = new Set<string>()): number => {
    const cached = depthOfCourse.get(id);
    if (cached !== undefined) return cached;
    if (seen.has(id)) return 0; // 数据写错（成环）也不至于死循环
    seen.add(id);
    const ds = (prereqOfCourse.get(id) ?? []).map((p) => depth(p, seen) + 1);
    const d = ds.length ? Math.max(...ds) : 0;
    depthOfCourse.set(id, d);
    return d;
  };
  for (const c of courses) depth(c.id);

  /** 章号 — 标题 → 短标题。拿不到标题（既没上线、也没写 draftTitles）就返回空，调用方跳过 */
  const titleOf = (id: string): string => published.get(id)?.data.title ?? draftTitles[id] ?? '';

  /** 把一条先修 id 换成人话：同课程「第 N 章」，跨课程「课程名 · 第 N 章」 */
  const prereqLabel = (prereqId: string, ownCourse: string): RoutePrereq | null => {
    const owner = courseOfChapter.get(prereqId) ?? ownCourse;
    const title = titleOf(prereqId);
    if (!title) return null;
    const chapter = chapterOf(title);
    const name = shortTitle(title, owner);
    if (owner === ownCourse) {
      return { short: `第 ${chapter} 章`, full: `先学第 ${chapter} 章 ${name}` };
    }
    return {
      short: `${owner} · ${chapter}`,
      full: `先学 ${owner} 第 ${chapter} 章 ${name}`,
    };
  };

  const buildCourse = (c: Course, index: number): RouteCourse => {
    const anchor = `course-${index}`;

    // 章节行：只收「能叫出名字」的 —— 既没上线又没兜底标题的章连名字都没有，
    // 宁可不出现，也别凭空造一个。然后按章号升序：这是列表，读者期望 1、2、3…
    const listed: RouteChapter[] = [];
    for (const ch of c.chapters) {
      const title = titleOf(ch.id);
      if (!title) continue;
      listed.push({
        id: ch.id,
        label: shortTitle(title, c.id),
        chapter: chapterOf(title),
        href: published.has(ch.id) ? `/notes/${ch.id}/` : null,
        prereq: (ch.prereq ?? [])
          .map((p) => prereqLabel(p, c.id))
          .filter((x): x is RoutePrereq => x !== null),
        exam408: ch.exam408,
        unlisted: false,
      });
    }
    listed.sort(byChapter);

    // 兜底（同 course-series.ts 的做法，理由一样）：挂漏的笔记补在末尾 ——
    // 不然它就是从这条路线里凭空消失，而页面看上去一切正常。
    const listedIds = new Set(c.chapters.map((ch) => ch.id));
    const extras = notes
      .filter((n) => n.data.subfield?.trim() === c.id && !listedIds.has(n.id))
      .map((n) => ({
        id: n.id,
        label: shortTitle(n.data.title, c.id),
        chapter: chapterOf(n.data.title),
        href: `/notes/${n.id}/`,
        prereq: [] as RoutePrereq[],
        unlisted: true,
      }))
      .sort(byChapter);

    const chapters = [...listed, ...extras];
    // 进度只按**计划内的章**算：兜底补进来的那几篇不占名额，
    // 否则「12 章里上线了 12 章」会永远显示成不满。
    const live = listed.filter((ch) => ch.href).length;

    return {
      id: c.id,
      anchor,
      note: c.note ?? '',
      aliases: c.aliases ?? [],
      planned: !!c.planned,
      prereq: (prereqOfCourse.get(c.id) ?? [])
        // 分野写错/课程不存在时，这条先修无处可链，直接丢掉
        .map((p) => {
          const idx = courses.findIndex((x) => x.id === p);
          return idx === -1
            ? null
            : {
                id: p,
                anchor: `course-${idx}`,
                cross: (disciplineOf(courses[idx]) ?? 'cs') !== disciplineOf(c),
              };
        })
        .filter((x): x is { id: string; anchor: string; cross: boolean } => x !== null),
      live,
      total: listed.length,
      chapters,
    };
  };

  // 课程在分野内的顺序：**依赖深度优先**（先学的排在前面，这才是「路线」），
  // 同深度再按 curriculum.ts 的书写顺序 —— 作者在那里的排列本身就是有意的。
  const byDepthThenIndex = (a: { course: Course; index: number }, b: { course: Course; index: number }) =>
    (depthOfCourse.get(a.course.id) ?? 0) - (depthOfCourse.get(b.course.id) ?? 0) || a.index - b.index;

  const buckets = new Map<string, { course: Course; index: number }[]>();
  courses.forEach((course, index) => {
    const key = disciplineOf(course);
    const list = buckets.get(key) ?? [];
    list.push({ course, index });
    buckets.set(key, list);
  });

  // 分野顺序照 disciplines 里的书写顺序；数据里冒出未登记的分野时，兜在最后而不是丢掉
  const knownKeys = disciplines.map((d) => d.key);
  const allKeys = [...knownKeys, ...[...buckets.keys()].filter((k) => !knownKeys.includes(k))];

  const routeDisciplines: RouteDiscipline[] = [];
  for (const key of allKeys) {
    const items = buckets.get(key);
    if (!items || items.length === 0) continue;
    const meta = disciplines.find((d) => d.key === key);
    const built = items.sort(byDepthThenIndex).map(({ course, index }) => buildCourse(course, index));
    routeDisciplines.push({
      key,
      label: meta?.label ?? key,
      note: meta?.note,
      anchor: `disc-${key}`,
      courses: built,
      live: built.reduce((sum, c) => sum + c.live, 0),
      total: built.reduce((sum, c) => sum + c.total, 0),
    });
  }

  // 连课程都对不上的笔记：页面底部单列一块，标成「未编入路线」
  const knownCourses = new Set(courses.map((c) => c.id));
  const orphanNotes = notes
    .filter((n) => !knownCourses.has(n.data.subfield?.trim() ?? ''))
    .sort((a, b) => b.data.title.localeCompare(a.data.title, 'zh-Hans-CN'))
    .map((n) => ({ id: n.id, title: n.data.title, href: `/notes/${n.id}/` }));

  const allCourses = routeDisciplines.flatMap((d) => d.courses);

  return {
    disciplines: routeDisciplines,
    orphanNotes,
    stats: {
      disciplines: routeDisciplines.length,
      courses: allCourses.length,
      plannedCourses: allCourses.filter((c) => c.planned).length,
      chapters: allCourses.reduce((sum, c) => sum + c.total, 0),
      liveChapters: allCourses.reduce((sum, c) => sum + c.live, 0),
    },
  };
}

/* ================================================================
   搜索索引（opinion-25）
   ================================================================
   学习路线页上方有个搜索框：题目只写「搜索具体系列笔记」，但实际要能搜三类东西 ——
   · **章节**（最常用：搜「指针」「线性表」直接跳到那一篇）；
   · **课程**（搜「DSA」「计网」「线代」，先落到那门课，再看它有哪些章）；
   · **规划中的课程**（搜「线性代数」时它一篇笔记都没有，没有课程条目就搜不到）。

   所以索引里同时放课程条目和章节条目，`kind` 区分。课程条目没有独立页面，
   它的 `href` 是**页内锚点**：点了会切到那门课所在的分野标签页、再滚到那张卡片。
   件数（≤ 几百）直接内联成 JSON 交给前端过滤，不另开接口。
   ================================================================ */

/** 搜索条目：前端拿到后只做 `search.includes(关键词)` 这一种匹配 */
export interface RouteSearchItem {
  kind: 'course' | 'chapter';
  /** 主标题：章节名 / 课程名 */
  label: string;
  /** 副标题，拼在标题下面一行 */
  meta: string;
  /** 检索串：已归一化（小写 + 空白折叠），命中信息全在这里 */
  search: string;
  /** 章节 → 笔记地址；课程 → 页内锚点 `#course-N` */
  href: string;
  /** 所属分野（点了要切到哪个标签页） */
  disc: string;
  discLabel: string;
  /** 章号（课程条目为 0），仅用于排序 */
  chapter: number;
  /** true = 这一章还没上线 / 这门课还在规划中（点了没有去处，前端渲染成灰行） */
  pending: boolean;
}

/** 归一化：小写 + 空白折叠。中英文混排时「C++ 程序设计」和「c++程序设计」都能命中 */
const normalize = (s: string): string => s.toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * 把整条路线摊平成一张搜索清单（课程条目在前、它自己的章节紧跟其后）。
 * 顺序就是 `learning-route.ts` 算好的展示顺序，前端只在此基础上按匹配度重排。
 */
export function routeSearchIndex(route: LearningRoute): RouteSearchItem[] {
  const items: RouteSearchItem[] = [];

  for (const d of route.disciplines) {
    for (const c of d.courses) {
      items.push({
        kind: 'course',
        label: c.id,
        meta: c.planned
          ? `规划中的课程 · ${d.label}`
          : `课程 · ${c.total} 章（已上线 ${c.live} 章）· ${d.label}`,
        search: normalize(
          [c.id, ...c.aliases, d.label, d.key, '课程', c.planned ? '规划中' : '', c.note].join(' ')
        ),
        href: `#${c.anchor}`,
        disc: d.key,
        discLabel: d.label,
        chapter: 0,
        pending: c.planned,
      });

      for (const ch of c.chapters) {
        // 408 考点也进检索串：搜「408」筛出所有考点章，「408核心」只出重点章（opinion-26）
        const exam = ch.exam408;
        const examWords =
          exam === 'core'
            ? '408 408核心 考研 考点'
            : exam === 'basic'
              ? '408 408了解 408基础 考研'
              : exam === 'off'
                ? '408不考 非考点'
                : '';

        items.push({
          kind: 'chapter',
          label: ch.label,
          meta: `${c.id} · 第 ${ch.chapter} 章 · ${d.label}`,
          // 笔记 id 也参与检索：搜 `dsa` `cpp` `hm` 就能命中整门课的章节，
          // 这样即使课程没写 aliases，英文缩写也照样好使。
          search: normalize(
            [
              ch.label,
              c.id,
              ...c.aliases,
              d.label,
              `第 ${ch.chapter} 章`,
              String(ch.chapter),
              ch.id,
              ch.unlisted ? '未编入路线' : '',
              ch.href ? '' : '待发布',
              examWords,
            ].join(' ')
          ),
          href: ch.href ?? '',
          disc: d.key,
          discLabel: d.label,
          chapter: ch.chapter,
          pending: !ch.href,
        });
      }
    }
  }

  return items;
}
