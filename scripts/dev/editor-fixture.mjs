/**
 * editor-fixture.mjs —— 编辑功能自检共用的临时笔记与工具
 * ==================================================================
 * 被 scripts/dev/test-editor.mjs（不起服务器，纯 HTTP 契约测试）和
 * scripts/dev/smoke-editor.mjs（起真 dev server 的端到端测试）共用。
 *
 * 这个 fixture 特意覆盖了几种典型块：
 *   · 普通单行段落
 *   · **软换行的跨行段落**（Obsidian 手写的常态，改完应合成一行）
 *   · 列表项（要保住 "- " 前缀）
 *   · 含行内公式的段落（**不允许**被标记为可编辑）
 *   · 标题（要保住 "## " 前缀）
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// 用 Astro 自己的 frontmatter 解析器，保证自检里的「正文」和线上渲染的那份一模一样
import { parseFrontmatter } from '@astrojs/markdown-remark';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const NOTE_ID = '_smoke-edit-temp';
export const NOTE_FILE = path.join(ROOT, 'src', 'content', 'notes', `${NOTE_ID}.md`);
export const REL_PATH = `src/content/notes/${NOTE_ID}.md`;

export const FIXTURE = `---
title: 编辑接口自检（脚本临时创建，跑完自动删除）
description: 由 scripts/dev 下的自检脚本生成
date: "2026-01-01"
category: 自检
tags: [自检]
---

第一段是纯文本，用来测行内改字。

这是跨行的段落第一行
第二行接着写，改完应该被合成一行。

- 列表项测试

包含公式的段落不该被标记：$a^2 + b^2 = c^2$

## 小标题测试

最后一段。
`;

export function writeFixture() {
  fs.writeFileSync(NOTE_FILE, FIXTURE, 'utf8');
}

export function removeFixture() {
  if (fs.existsSync(NOTE_FILE)) fs.unlinkSync(NOTE_FILE);
}

export const readFile = () => fs.readFileSync(NOTE_FILE, 'utf8');
export const readLines = () => readFile().split(/\r?\n/);

/** 某个字符串所在的行号（1-based，文件行号） */
export function lineOf(needle) {
  return readLines().findIndex((l) => l.includes(needle)) + 1;
}

/** frontmatter 原文（含结尾换行） */
export function frontmatterHead(src) {
  const m = /^---[ \t]*\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/.exec(src);
  return m ? m[0] : '';
}

/** Astro 解析出来的原始 frontmatter 文本（用来断言「一个字节都没动」） */
export function rawFrontmatter(src) {
  return parseFrontmatter(src).rawFrontmatter;
}

/**
 * Astro 真正交给 Markdown 处理器的正文。
 *
 * 出处（必须一模一样，否则自检算出来的行号会和页面差一行）：
 *   astro/dist/vite-plugin-markdown/content-entry-type.js
 *     body = safeParseFrontmatter(contents).content.trim()
 *   astro/dist/content/utils.js
 *     safeParseFrontmatter = parseFrontmatter(src, { frontmatter: 'empty-with-spaces' })
 */
export function bodyOf(src) {
  return parseFrontmatter(src, { frontmatter: 'empty-with-spaces' }).content.trim();
}

/** 正文第 1 行对应文件的第几行（要往正文行号上加的偏移量） */
export function bodyLineOffset(src) {
  const { content } = parseFrontmatter(src, { frontmatter: 'empty-with-spaces' });
  const body = content.trim();
  if (!body) return 0;
  return (content.slice(0, content.indexOf(body)).match(/\n/g) || []).length;
}

/**
 * 从渲染出的 HTML 里抠出某个块的行号属性。
 * 用「包含这段文字的最近一个开标签」，对属性顺序不敏感。
 */
export function attrsOf(html, needle) {
  const at = html.indexOf(needle);
  if (at === -1) return null;
  const open = html.lastIndexOf('<', at);
  const close = html.indexOf('>', open);
  if (open === -1 || close === -1) return null;
  const tag = html.slice(open, close + 1);
  const start = tag.match(/data-edit-start="(\d+)"/);
  const end = tag.match(/data-edit-end="(\d+)"/);
  if (!start || !end) return null;
  return { start: Number(start[1]), end: Number(end[1]), tag };
}

/** 渲染出的 HTML 里一共有几个可编辑块 */
export function markCount(html) {
  return (html.match(/data-edit="simple"/g) || []).length;
}
