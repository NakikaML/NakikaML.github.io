import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * 三个内容集合：
 *   notes  — 网站笔记。**手写**，放在 src/content/notes/
 *            （历史上这里曾由 scripts/sync-vault.mjs 从 Obsidian 批量生成，
 *             现已改为手写重构，脚本只会在你主动开启白名单时才写入）
 *   blog   — 手写博客，放在 src/content/blog/
 *   works  — 配音 / 翻唱 / 知识分享作品，放在 src/content/works/
 */

// ---------------------------------------------------------------- notes
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    /** 一句话摘要，显示在列表页与搜索结果里 */
    description: z.string().default(''),
    slug: z.string().optional(),
    category: z.string().default('未分类'),
    /** note = 普通笔记；moc = 知识地图（总览索引页） */
    kind: z.string().default('note'),
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
    sourcePath: z.string().default(''),
    url: z.string().default(''),
    tags: z.array(z.string()).default([]),
    /** true = 草稿，不发布 */
    draft: z.boolean().default(false),
    /** 是否在首页精选展示 */
    featured: z.boolean().default(false),
  }),
});

// ---------------------------------------------------------------- blog
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
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
// 配音 / 翻唱 / 知识分享 —— 你的创作作品集
const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
  schema: z.object({
    title: z.string(),
    /** 作品类型，决定分组与配色 */
    type: z.enum(['配音', '翻唱', '知识分享', '其他']).default('其他'),
    /** 发布平台 */
    platform: z.enum(['Bilibili', 'YouTube', '其他']).default('Bilibili'),
    /** 作品外链（B站视频地址等） */
    url: z.string().default(''),
    /** 封面图，放在 public/works/ 下，填 /works/xxx.jpg */
    cover: z.string().default(''),
    date: z.coerce.date(),
    /** 作品简介 */
    description: z.string().default(''),
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
