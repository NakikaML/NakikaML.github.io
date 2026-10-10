/**
 * /notes/<id>.md —— 笔记原文下载（opinion-1）
 * ==========================================
 * 构建时每篇笔记额外产出一份 Markdown 原文，笔记详情页的「下载原文 .md」直接链过来。
 *
 * 为什么不写个脚本在 `astro build` 之后往 dist/ 里拷：
 *   那样只有跑 `pnpm build` 才有产物，单独跑 `astro build`（或以后换别的构建方式）
 *   就会悄悄少一批文件，而且多一处「dist 里该有什么」的隐式约定。
 *   放在 pages 里当静态端点，Astro 自己保证「有这篇笔记就有这个文件」。
 *
 * 读取顺序：
 *   1. 直接读磁盘上的手写原文（连 frontmatter 一起给），这样下载下来就是能直接
 *      丢进 Obsidian / Typora 的完整文件；
 *   2. 磁盘读不到（比如以后换成远程内容源）时，用 frontmatter + 正文拼一份出来，
 *      保证端点永远有内容，不会因为取不到文件就 500。
 */

import fs from 'node:fs';
import path from 'node:path';
import type { APIRoute } from 'astro';
import { allNotes, type Note } from '../../utils/notes';

export async function getStaticPaths() {
  const notes = await allNotes();
  return notes.map((note) => ({
    params: { id: note.id },
    props: { note },
  }));
}

/** YAML 里的标量：统一用双引号包，内部转义，避免中文冒号、# 之类把 YAML 读歪 */
function yamlString(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/** 从 data 拼 frontmatter（只在读不到磁盘原文时兜底用） */
function buildFrontmatter(data: Note['data']): string {
  const lines: string[] = ['---'];
  lines.push(`title: ${yamlString(data.title)}`);
  if (data.description) lines.push(`description: ${yamlString(data.description)}`);
  if (data.slug) lines.push(`slug: ${yamlString(data.slug)}`);
  lines.push(`category: ${yamlString(data.category)}`);
  for (const key of ['subject', 'subfield', 'topic', 'difficulty'] as const) {
    if (data[key]) lines.push(`${key}: ${yamlString(data[key])}`);
  }
  if (data.date) lines.push(`date: ${yamlString(data.date)}`);
  // 「最后更新」（opinion-11）也要带出去：读者把原文下载回本地，
  // 得能看出这篇是什么时候修订过的，跟页面上看到的一致。
  if (data.updated) lines.push(`updated: ${yamlString(data.updated)}`);
  if (data.sourcePath) lines.push(`sourcePath: ${yamlString(data.sourcePath)}`);
  if (data.url) lines.push(`url: ${yamlString(data.url)}`);
  if (data.tags.length > 0) {
    lines.push(`tags: [${data.tags.map((t) => yamlString(t)).join(', ')}]`);
  }
  if (data.draft) lines.push('draft: true');
  if (data.featured) lines.push('featured: true');
  lines.push('---', '');
  return lines.join('\n');
}

/** 取这篇笔记的 Markdown 原文 */
function sourceOf(note: Note): string {
  const rel = note.filePath;
  if (rel) {
    const abs = path.isAbsolute(rel) ? rel : path.resolve(process.cwd(), rel);
    try {
      const raw = fs.readFileSync(abs, 'utf8');
      if (raw.trim()) return raw;
    } catch {
      /* 读不到就走下面的兜底 */
    }
  }
  return `${buildFrontmatter(note.data)}\n${note.body ?? ''}`;
}

export const GET: APIRoute = ({ props }) => {
  const { note } = props as { note: Note };
  return new Response(sourceOf(note), {
    headers: {
      // 静态托管会忽略这里，但 dev 下（astro dev）响应头是真实生效的
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
};
