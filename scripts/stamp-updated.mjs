#!/usr/bin/env node
/**
 * stamp-updated.mjs —— 给笔记打「最后更新」日期（opinion-11）
 * ==========================================================
 * 页面上「发布于 X · 更新于 Y」里的 Y，来自笔记 frontmatter 的 `updated` 字段。
 * 手动敲日期容易忘、也容易敲错格式，这个小工具负责把它写进去。
 *
 * 用法：
 *   node scripts/stamp-updated.mjs
 *       只列清单：每篇的 date / updated 以及「要不要补」，**不改任何文件**。
 *
 *   node scripts/stamp-updated.mjs <笔记> [日期]
 *       给这一篇写上 / 改掉 updated。日期省略就是今天。
 *       `<笔记>` 可以写文件名（cpp-1-basics）、带扩展名（cpp-1-basics.md）或完整路径。
 *       可以一次传多篇：node scripts/stamp-updated.mjs cpp-1-basics dsa-5-tree-and-binary-tree
 *
 *   node scripts/stamp-updated.mjs <笔记> --unset
 *       把这一篇的 updated 摘掉（回退成「没更新过」的样子）。
 *
 * 为什么不做成「按 git 提交日期自动生成」：
 *   1. 提交日期 ≠ 内容修订日期 —— 一次批量提交（换样式、改插件）会把几十篇
 *      全部标成「今天更新过」，读者反而看不出哪篇是真的补过内容；
 *   2. GitHub Actions 默认是浅克隆（fetch-depth: 1），构建机上拿不到逐文件历史，
 *      真要自动生成就得依赖「必须在完整仓库里构建」，多一条隐性约束。
 *   所以：**由你在改完内容后显式打一次日期**，字段随文件走，构建机不需要 git 历史。
 *
 * 一条规则会在这里兜住：**updated 必须比 date 晚**，否则页面上不会显示「更新于」
 * （判定见 src/utils/notes.ts 的 noteUpdated）。写反了会提醒你，不会默默写进去。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOTES_DIR = path.join(ROOT, 'src', 'content', 'notes');

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** 今天（本地时区）的 YYYY-MM-DD —— 不用 toISOString，避免晚上跑变成「昨天」 */
function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** 所有手写笔记（跳过 `_` 开头的模板），按文件名排序 */
function listNotes() {
  if (!fs.existsSync(NOTES_DIR)) return [];
  return fs
    .readdirSync(NOTES_DIR)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .sort()
    .map((f) => ({ file: f, id: f.slice(0, -3), abs: path.join(NOTES_DIR, f) }));
}

/** 把命令行给的「笔记」解析成一条笔记记录；认不出来就返回 null */
function resolve(target, notes) {
  const cleaned = target.replace(/\\/g, '/').split('/').pop().replace(/\.md$/i, '');
  return notes.find((n) => n.id === cleaned) ?? null;
}

/** 读 frontmatter 里某个标量（字符串形式，去引号） */
function readField(raw, key) {
  const fm = raw.startsWith('---')
    ? raw.slice(raw.indexOf('\n') + 1, raw.indexOf('\n---', 3))
    : '';
  const m = fm.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, 'm'));
  if (!m) return '';
  return m[1].replace(/^["']|["']$/g, '').trim();
}

/**
 * 在 raw 里写入 / 替换 / 删除 updated 字段。
 * 插入位置固定放在 `date:` 后面 —— 两个日期挨在一起，人肉改的时候不容易看漏。
 * 换行符跟随原文件（仓库里是 LF，但不写死，免得在别的机器上把整篇改成 CRLF）。
 */
function writeUpdated(raw, value) {
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const hasLine = /^updated:.*$/m.test(raw);

  if (value === null) {
    if (!hasLine) return { text: raw, changed: false };
    return { text: raw.replace(/^updated:.*\r?\n/m, ''), changed: true };
  }

  const line = `updated: "${value}"`;
  if (hasLine) {
    if (readField(raw, 'updated') === value) return { text: raw, changed: false };
    return { text: raw.replace(/^updated:.*$/m, line), changed: true };
  }

  // 插到 date: 之后；万一这篇没写 date，就插到 frontmatter 的第一行
  if (/^date:.*$/m.test(raw)) {
    return { text: raw.replace(/^(date:.*)$/m, `$1${eol}${line}`), changed: true };
  }
  return { text: raw.replace(/^---\r?\n/, `---${eol}${line}${eol}`), changed: true };
}

// -------------------------------------------------------------------- main
const args = process.argv.slice(2);
const notes = listNotes();

if (notes.length === 0) {
  console.error(`✗ ${path.relative(ROOT, NOTES_DIR)} 里没有笔记`);
  process.exit(1);
}

const unset = args.includes('--unset');
const positional = args.filter((a) => !a.startsWith('--'));

// 模式一：只列清单
if (positional.length === 0) {
  console.log('\n笔记的 date / updated 现状：\n');
  let stale = 0;
  for (const n of notes) {
    const raw = fs.readFileSync(n.abs, 'utf8');
    const date = readField(raw, 'date');
    const updated = readField(raw, 'updated');
    let mark = '·';
    let note = '';
    if (updated && date && updated <= date) {
      mark = '!';
      note = `updated 不比 date 晚 → 页面上不显示「更新于」`;
    } else if (updated) {
      mark = '↻';
      note = `更新于 ${updated}`;
    }
    if (mark === '!') stale++;
    console.log(`  ${mark} ${n.id.padEnd(38)} date ${(date || '(空)').padEnd(10)}  ${note}`);
  }
  console.log(
    `\n共 ${notes.length} 篇，其中 ${notes.filter((n) => readField(fs.readFileSync(n.abs, 'utf8'), 'updated')).length} 篇标了 updated。`
  );
  if (stale > 0) console.log(`⚠ ${stale} 篇的 updated 不比 date 晚，页面上不会显示更新标记。`);
  console.log(
    '\n改完某篇内容后，跑一次：\n' +
      '  node scripts/stamp-updated.mjs <笔记> [YYYY-MM-DD]     # 日期省略 = 今天\n' +
      '（pnpm 用户：pnpm stamp <笔记>）\n'
  );
  process.exit(0);
}

// 参数分两拨：能认成日期的当日期，其余当笔记名
let dateArg = '';
const resolved = [];
const unknown = [];
for (const p of positional) {
  if (ISO.test(p)) {
    dateArg = p;
    continue;
  }
  const note = resolve(p, notes);
  if (note) resolved.push({ t: p, note });
  else unknown.push(p);
}
if (unknown.length > 0) {
  console.error(`✗ 找不到这些笔记：${unknown.join('、')}`);
  console.error(`  当前有：${notes.map((n) => n.id).join('、')}`);
  console.error('  日期要写成 YYYY-MM-DD（例如 2026-10-10），省略即今天。');
  process.exit(1);
}
if (unset && dateArg) {
  console.error('✗ --unset 和日期不能同时给：要么打日期，要么摘掉这个字段。');
  process.exit(1);
}
const stamp = unset ? null : dateArg || today();

let failures = 0;
for (const { note } of resolved) {
  const raw = fs.readFileSync(note.abs, 'utf8');
  const date = readField(raw, 'date');

  if (stamp !== null && date && stamp <= date) {
    console.error(
      `✗ ${note.id}: 要写的日期 ${stamp} 不比 date(${date}) 晚 —— 页面上不会显示「更新于」。\n` +
        `  确认日期没错的话，直接改 frontmatter；或者先核对 date 是否该更新。`
    );
    failures++;
    continue;
  }

  const { text, changed } = writeUpdated(raw, stamp);
  if (!changed) {
    console.log(`· ${note.id}: 无需改动（updated 已经是 ${stamp ?? '未设置'}）`);
    continue;
  }
  fs.writeFileSync(note.abs, text, 'utf8');
  console.log(stamp === null ? `↻ ${note.id}: 已摘掉 updated` : `↻ ${note.id}: updated → ${stamp}`);
}

if (failures > 0) {
  console.error(`\n✗ ${failures} 篇没有写入。`);
  process.exit(1);
}
console.log('\n✅ 完成。构建后注意：详情页页头和卡片会多出「更新于」标记，首页「最近更新」也会把它排到前面。\n');
