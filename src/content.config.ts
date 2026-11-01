import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { problemIssue } from './data/problem-platforms';

/**
 * 三个内容集合：
 *   notes  — 网站笔记。**手写**，放在 src/content/notes/
 *            （历史上这里曾由 scripts/sync-vault.mjs 从 Obsidian 批量生成，
 *             现已改为手写重构，脚本只会在你主动开启白名单时才写入）
 *   blog   — 手写博客，放在 src/content/blog/
 *   works  — 配音 / 翻唱 / 知识分享作品，放在 src/content/works/
 *
 * 三者的 pattern 都额外带一条 `!` 否定规则，把下划线开头的文件排除掉。
 * 原因：`_模板-*.md` 是给人复制用的模板，不是内容。以前只靠它们自带的
 * `draft: true` 挡住；现在开发服务器会把草稿也列出来（见 utils/notes.ts 的
 * SHOW_DRAFTS），模板就会混进本地预览里，所以干脆在入口处排除。
 */

/** 所有集合共用的匹配规则：所有 md，但不含 `_` 开头的模板 */
const CONTENT_PATTERN = ['**/*.md', '!**/_*.md'];

// ---------------------------------------------------------------- 练习题单
/**
 * 题单条目的紧凑写法（opinion-7）—— 一条一行，**不写 URL**，地址由平台拼：
 *
 *     problems:
 *       - luogu P1601 A+B Problem | 高精度加法模板 | ★
 *       - leetcode 66:plus-one 加一 | 数组形式的整数加一 | ★
 *
 * 语法：`平台 题号 题名 | 考察点 | 难度`
 *   · 平台认 key / 中文名 / 简称（luogu·洛谷·lg / leetcode·力扣·lc / …，见 data/problem-platforms.ts）；
 *   · LeetCode 的题号拼不出地址，要用「题号:slug」两个都给，或者只写 slug；
 *   · 考察点、难度都可以省略；
 *   · 也想直接写对象（字段 `platform` / `id` / `no` / `title` / `note` / `difficulty` / `url`），
 *     非 string 原样交给 schema。
 *
 * 平台写错、题号格式不对，会在**构建时**报错并指出是哪篇笔记 —— 手写 URL 是发现不了这类错的。
 */
function parseProblemShorthand(v: unknown) {
  if (typeof v !== 'string') return v;
  const [head = '', ...rest] = v.split('|').map((s) => s.trim());
  const [platform = '', rawId = '', ...titleWords] = head.split(/\s+/).filter(Boolean);
  // `66:plus-one` → 题号 66、slug plus-one
  const [no = '', slug = rawId] = rawId.includes(':') ? rawId.split(':') : ['', rawId];
  return {
    platform,
    id: slug || rawId,
    no,
    title: titleWords.join(' '),
    note: rest[0] ?? '',
    difficulty: rest[1] ?? '',
  };
}

const problemEntry = z.preprocess(
  parseProblemShorthand,
  z
    .object({
      platform: z.string(),
      id: z.string(),
      /** 题号（可选）：LeetCode 这种「题号拼不出地址」的平台才需要单独写 */
      no: z.string().default(''),
      title: z.string().default(''),
      note: z.string().default(''),
      difficulty: z.string().default(''),
      /** 登记表里没有的 OJ：直接给地址 */
      url: z.string().default(''),
    })
    .superRefine((p, ctx) => {
      const issue = problemIssue(p);
      if (issue) ctx.addIssue({ code: 'custom', message: issue });
    })
);

// ---------------------------------------------------------------- notes
const notes = defineCollection({
  loader: glob({ pattern: CONTENT_PATTERN, base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    /** 一句话摘要，显示在列表页与搜索结果里 */
    description: z.string().default(''),
    slug: z.string().optional(),
    category: z.string().default('未分类'),
    subject: z.string().default(''),
    subfield: z.string().default(''),
    topic: z.string().default(''),
    difficulty: z.string().default(''),
    /**
     * 日期。这里用 preprocess 兼容两种写法：
     *   date: 2026-09-22     ← YAML 会解析成 Date 对象
     *   date: "2026-09-22"   ← 字符串
     * 手写笔记时很容易忘记加引号，不兼容的话整篇会因为 schema 校验失败而构建报错。
     */
    date: z.preprocess(
      (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
      z.string().default('')
    ),
    /**
     * 最后更新日期（opinion-11）。**跟 date 一样兼容加不加引号。**
     *
     * `date` 是「这篇写给哪个时间点」（很多时候是课程章序的锚点），
     * `updated` 是「我最后一次补充/订正它是什么时候」。只有 updated 比 date 晚，
     * 页面上才会多出一行「更新于 X」——读者因此能看出这篇是回头改过的，
     * 而不是「标注了日期就再没动过」。
     *
     * 没写过就留空（默认），页面表现跟以前完全一样。
     * 手改一行，或者 `pnpm stamp <笔记>` 让它帮你写（scripts/stamp-updated.mjs），都行。
     */
    updated: z.preprocess(
      (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
      z.string().default('')
    ),
    sourcePath: z.string().default(''),
    url: z.string().default(''),
    tags: z.array(z.string()).default([]),
    /**
     * 练习题单（opinion-7）：笔记页尾渲染成一块「题单面板」。
     * 写法见上面 parseProblemShorthand —— 只写平台与题号，**地址由平台拼**。
     */
    problems: z.array(problemEntry).default([]),
    /** true = 草稿，不发布 */
    draft: z.boolean().default(false),
    /** 是否在首页精选展示 */
    featured: z.boolean().default(false),
  }),
});

// ---------------------------------------------------------------- blog
const blog = defineCollection({
  loader: glob({ pattern: CONTENT_PATTERN, base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// --------------------------------------------------------------- works
// 配音 / 翻唱 / 声展 / 知识分享 —— 你的创作作品集
const works = defineCollection({
  loader: glob({ pattern: CONTENT_PATTERN, base: './src/content/works' }),
  schema: z.object({
    title: z.string(),
    /** 作品类型，决定分组与配色（新增类型记得同步三处：
     *  这里、src/pages/works/index.astro 的 TYPES、src/styles/global.css 的 .badge--xxx） */
    type: z.enum(['配音', '翻唱', '声展', '知识分享', '其他']).default('其他'),
    /** 发布平台 */
    platform: z.enum(['Bilibili', 'YouTube', '其他']).default('Bilibili'),
    /** 作品外链（B站视频地址等） */
    url: z.string().default(''),
    /** 封面图，放在 public/works/ 下，填 /works/xxx.jpg */
    cover: z.string().default(''),
    date: z.coerce.date(),
    /** 参与角色，如「配音：张三」 */
    roles: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    /** 是否在首页精选展示 */
    featured: z.boolean().default(false),
    /** 是否公开 */
    draft: z.boolean().default(false),
  }),
});

export const collections = { notes, blog, works };
