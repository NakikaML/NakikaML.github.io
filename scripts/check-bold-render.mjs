#!/usr/bin/env node
/**
 * check-bold-render.mjs —— 检查笔记里的 **加粗** 是不是真的渲染成了加粗
 * ==================================================================
 * 为什么需要这个检查：
 *   CommonMark 的 flanking 规则会让下面这种写法**静默失效**
 *
 *       **术语(English)**中文        ← 闭合的 ** 前是标点、后是汉字
 *       **术语（中文）**中文         ← 全角标点同样中招
 *
 *   规范要求闭合的 ** 必须是 right-flanking：它前面若紧跟标点，
 *   后面又必须跟空白或标点才能成立；而中文写作里标点后面直接接汉字，
 *   于是这个 ** 无法闭合 —— 页面上的表现是 ** 原样显示出来，
 *   更糟的是解析器会把加粗套到后面某一段完全不相干的文字上。
 *   Obsidian 的解析器不遵守这套规则，所以知识库里看着一切正常，
 *   搬到网站上才暴露。（同一个公式在两边表现不同的第二例，第一例见
 *   scripts/remark-inline-dfrac.mjs。）
 *
 *   本项目用 remark-cjk-friendly 修正解析（见 astro.config.mjs）。
 *   但这类依赖一旦被摘掉、或升级后行为变化，页面**不会报错**，
 *   只会静默变样 —— 所以内容改完跑一下这个脚本，比眼睛快。
 *
 * 用法：
 *   node scripts/check-bold-render.mjs            # 检查 src/content/notes
 *   node scripts/check-bold-render.mjs 某个目录    # 检查别处
 *
 * 退出码：0 = 正常；1 = 有块渲染出了字面的 **
 */
import fs from 'node:fs';
import path from 'node:path';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import remarkCjkFriendly from 'remark-cjk-friendly';
import rehypeKatex from 'rehype-katex';
import remarkInlineDfrac from './remark-inline-dfrac.mjs';

const dir = path.resolve(process.argv[2] ?? 'src/content/notes');
if (!fs.existsSync(dir)) {
  console.error('目录不存在:', dir);
  process.exit(1);
}

// 与 astro.config.mjs 的 markdown 配置保持一致（少了 remarkSourceLines：
// 那个只在 dev 生效，且不影响解析结果）
const processor = await createMarkdownProcessor({
  remarkPlugins: [remarkCjkFriendly, remarkMath, remarkInlineDfrac],
  rehypePlugins: [[rehypeKatex, { strict: false, throwOnError: false, output: 'html', trust: true }]],
  gfm: true,
});

let files = 0;
let bad = 0;

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md'))) {
  let text = fs.readFileSync(path.join(dir, f), 'utf8');
  // 去掉 frontmatter，只渲染正文
  text = text.replace(/^---[\s\S]*?\n---\n?/, '');

  const { code } = await processor.render(text);
  files++;

  // 段落 / 列表项里若还剩字面的 **，就是没解析成功的加粗
  for (const m of code.matchAll(/<(p|li)>([\s\S]*?)<\/\1>/g)) {
    if (!m[2].includes('**')) continue;
    bad++;
    const plain = m[2]
      .replace(/<strong>/g, '⟦粗⟧')
      .replace(/<\/strong>/g, '⟦/粗⟧')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    console.log(`✗ ${f}`);
    console.log(`    ${plain.slice(0, 300)}`);
    console.log('    ↑ 字面的 ** 表示这里的加粗没闭合成功');
  }
}

console.log(`\n检查 ${files} 个文件，加粗异常 ${bad} 处`);
process.exit(bad === 0 ? 0 : 1);
