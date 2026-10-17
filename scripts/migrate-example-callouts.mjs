#!/usr/bin/env node
/**
 * migrate-example-callouts.mjs —— 一次性把「例题」改写成 callout 内嵌块（opinion-22）
 * ==================================================================
 * 跑法：
 *   node scripts/migrate-example-callouts.mjs --dry     # 只打印将要改什么
 *   node scripts/migrate-example-callouts.mjs           # 真写盘
 *
 * 改之前（现状：题目是一行加粗的引用块，思路 / 解 / 评注散在正文里）：
 *
 *     > **例 1（求数组最大值）** 找出数组 `{…}` 中的最大值。
 *
 *     **思路**：……
 *     **解**：……
 *
 * 改之后（整道题连同解答一起成为 `:::example` 内嵌块）：
 *
 *     :::example 例 1 · 求数组最大值
 *     找出数组 `{…}` 中的最大值。
 *
 *     **思路**：……
 *     **解**：……
 *     :::
 *
 * 边界怎么定（这是整件事里唯一需要动脑子的一步）：
 *   · 终点默认取「下一个标题 / 下一道例题 / 文件末尾」，即整节内容都归这道题；
 *   · **末尾的引用块一律排除** —— 那些是「易错点 / 补充 / 口诀」这类
 *     挂在整节上的提示，不是这道题的一部分，让它们留在框外当普通引用块，
 *     和绿色的例题框形成对比；
 *   · 少数几处「题后还跟着一段换话题的正文」用 OVERRIDES 手工截断，
 *     见文件末尾那张表（每条都写了理由）。
 *
 * 跑完之后请用 `git diff` 扫一眼，然后 `pnpm build && pnpm verify`。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOTES = path.join(ROOT, 'src', 'content', 'notes');
const DRY = process.argv.includes('--dry');

/**
 * 手工截断表：`file` + 原文件里的行号（1 起）+ `stopAt`（那一块的起始文字前缀）。
 * 命中后，从该块开始的内容全部留在 callout 外面。
 */
const OVERRIDES = [
  {
    file: 'cn-1-network-overview.md',
    line: 562,
    stopAt: '**网络利用率**',
    why: '「网络利用率」是下一小节的概念，不属于蓝牙传照片这道题',
  },
  {
    file: 'cpp-1-basics.md',
    line: 106,
    stopAt: '三种方式各有适用场景',
    why: '这句开始讲流程图 / N-S 图 / 伪代码三种描述方式，是下一段的正文',
  },
  {
    file: 'cpp-1-basics.md',
    line: 293,
    stopAt: '初学阶段最容易踩的三类错误',
    why: '题后的「常见错误表 + 调试技巧」是整节通用的，不属于这道题',
  },
  {
    file: 'dsa-8-sort.md',
    line: 1032,
    stopAt: '**一个小例子说明最佳归并树的价值**',
    why: '题后另起的一个补充说明段落，挂在整节上',
  },
];

const isExampleHeader = (line) => /^>\s*\*\*例/.test(line) && !/^>\s*\*\*例外/.test(line);
const isAnyExampleHeader = (line) => /^>\s*\*\*例/.test(line) && !/^>\s*\*\*例外/.test(line);

/** 把 `**例 1（求数组最大值）**` 这种加粗标题转成 callout 的标题行 */
function toTitle(bold) {
  const b = bold.trim();

  // 例 3（三位水仙花数）→ 例 3 · 三位水仙花数
  let m = /^(例(?:题|如)?)\s*([0-9]+(?:\.[0-9]+)?)\s*[（(]([\s\S]*)[）)]$/.exec(b);
  if (m) return `${m[1]} ${m[2]} · ${m[3].trim()}`;

  // 例 3 / 习题 12
  m = /^(例(?:题|如)?|习题|练习|题目)\s*([0-9]+(?:\.[0-9]+)?)$/.exec(b);
  if (m) return `${m[1]} ${m[2]}`;

  // 例：总时延计算 → 例：总时延计算（插件会把「例：」认成角标之外的前缀）
  m = /^例\s*[：:]\s*([\s\S]*)$/.exec(b);
  if (m) return m[1].trim() ? `例：${m[1].trim()}` : '';

  // 单独一个「例」/「例：」
  if (/^例\s*[：:]?$/.test(b)) return '';

  // 其它奇怪写法原样留着当标题
  return b;
}

/** 按空行切块（会照顾围栏代码块，代码块里的空行不算分隔） */
function splitBlocks(lines, from, to) {
  const blocks = [];
  let cur = null;
  let inFence = false;
  for (let i = from; i < to; i++) {
    const line = lines[i];
    const fence = /^\s*(```|~~~)/.test(line);
    if (fence) {
      if (!cur) cur = { start: i, end: i };
      inFence = !inFence;
      cur.end = i;
      if (!inFence) {
        blocks.push(cur);
        cur = null;
      }
      continue;
    }
    if (inFence) {
      cur.end = i;
      continue;
    }
    if (line.trim() === '') {
      if (cur) {
        blocks.push(cur);
        cur = null;
      }
      continue;
    }
    if (!cur) cur = { start: i, end: i };
    else cur.end = i;
  }
  if (cur) blocks.push(cur);
  return blocks;
}

const isQuoteBlock = (lines, block) =>
  lines.slice(block.start, block.end + 1).every((l) => /^\s*>/.test(l));

/** 把引用块的一行剥掉一层 `>` */
const unquote = (line) => line.replace(/^\s*>\s?/, '');

const stats = { files: 0, examples: 0, changed: 0 };
const report = [];

for (const name of fs.readdirSync(NOTES).filter((f) => f.endsWith('.md') && !f.startsWith('_'))) {
  const abs = path.join(NOTES, name);
  const raw = fs.readFileSync(abs, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.split(/\r?\n/);
  const out = [];
  let i = 0;
  let changed = 0;

  while (i < lines.length) {
    if (!isExampleHeader(lines[i])) {
      out.push(lines[i]);
      i++;
      continue;
    }

    // ① 题目所在的引用块（第一行是 `> **例 …**`，后面可能还有几行题目）
    let g = i;
    while (g < lines.length && /^\s*>/.test(lines[g])) g++;
    const headText = unquote(lines[i]);
    const m = /^\*\*([^*]+)\*\*\s*([\s\S]*)$/.exec(headText);
    const bold = m ? m[1] : headText.replace(/\*\*/g, '');
    const inlineRest = (m ? m[2] : '').trim();
    const statement = [];
    if (inlineRest) statement.push(inlineRest.replace(/^[：:]\s*/, ''));
    for (let k = i + 1; k < g; k++) statement.push(unquote(lines[k]).trimEnd());

    // ② 这道题的终点：下一个标题 / 下一道例题 / 文件末尾
    let end = g;
    while (end < lines.length) {
      if (/^#{1,6}\s/.test(lines[end])) break;
      if (isAnyExampleHeader(lines[end])) break;
      end++;
    }

    // ③ 手工截断
    const override = OVERRIDES.find((o) => o.file === name && o.line === i + 1);
    if (override) {
      let hit = false;
      for (let k = g; k < end; k++) {
        if (lines[k].trim().startsWith(override.stopAt)) {
          end = k;
          hit = true;
          break;
        }
      }
      if (!hit) console.warn(`⚠ ${name}:${i + 1} 的手工截断没命中（stopAt=${override.stopAt}）`);
    }

    // ④ 结尾的引用块（易错点 / 补充 / 口诀…）留给框外的正文
    let regionEnd = end;
    const dropTrailingQuote = () => {
      const blocks = splitBlocks(lines, g, regionEnd);
      while (blocks.length > 0 && isQuoteBlock(lines, blocks[blocks.length - 1])) {
        regionEnd = blocks[blocks.length - 1].start;
        blocks.pop();
        while (regionEnd > g && lines[regionEnd - 1].trim() === '') regionEnd--;
      }
    };
    dropTrailingQuote();
    // 结尾多余的空行也别包进框里
    while (regionEnd > g && lines[regionEnd - 1].trim() === '') regionEnd--;

    // ⑤ 组装
    const title = toTitle(bold);
    out.push(title ? `:::example ${title}` : ':::example');
    if (statement.length > 0) out.push(...statement);
    const body = lines.slice(g, regionEnd);
    // 题目和正文之间只留一个空行（原文引用块后面本来就有空行时别再补一个）
    if (body.length > 0 && statement.length > 0 && lines[g].trim() !== '') out.push('');
    out.push(...body);
    out.push(':::');
    out.push('');

    // 跳过被吃掉的那些空行，别留下双份
    i = regionEnd;
    while (i < end && lines[i].trim() === '') i++;

    changed++;
    stats.examples++;
    report.push(`${name}:${i + 1} → ${title || '(无标题)'}  含 ${body.length} 行`);
  }

  if (changed > 0) {
    stats.files++;
    stats.changed += changed;
    if (!DRY) fs.writeFileSync(abs, out.join(eol), 'utf8');
  }
}

console.log(`${DRY ? '[dry-run] ' : ''}改了 ${stats.files} 个文件，共 ${stats.changed} 道例题`);
for (const line of report) console.log('  ' + line);
if (DRY) console.log('\n（--dry 模式，没有写盘）');
