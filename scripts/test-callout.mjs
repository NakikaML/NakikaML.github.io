#!/usr/bin/env node
/**
 * test-callout.mjs —— remark-callout 的回归测试（opinion-22）
 * ==================================================================
 * 跑法：node scripts/test-callout.mjs   （或 pnpm test:callout）
 *
 * 为什么值得单独测：
 *   1. 插件在 **mdast 层**重组节点，产物只是「几个带类名的 div」——
 *      类名 / data-callout 写错、或者标题拆分不对，构建**照样通过**，
 *      只会在页面上看起来「就是个普通框」，所以必须钉住。
 *   2. `:::` 是围栏语法，最容易出的错是「吞掉后面的正文」：
 *      忘写收尾、嵌套一层、里面还有代码块 / 表格 / 公式，都要能扛住。
 *      这里每种情况都用**真实渲染管线**（@astrojs/markdown-remark）跑一遍，看产物。
 *
 * 注意：这里刻意用和站点同一套 markdown 处理器，而不是手搓 hast，
 * 否则测的就不是「作者写进去的那段 markdown」了。
 */

import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { unified } from '@astrojs/markdown-remark';
import remarkCallout from './remark-callout.mjs';

let pass = 0;
const fails = [];
const check = (label, cond, detail) => {
  if (cond) pass++;
  else fails.push(`${label}${detail ? `\n    ${detail}` : ''}`);
};

const processor = unified({ remarkPlugins: [remarkCallout], gfm: true });
const renderer = await processor.createRenderer({ syntaxHighlight: false });
// 夹具给一个**绝对** file URL：Astro 的渲染器会拿它当文章路径（Windows 下 file:///xxx 会报错）
const FIXTURE = pathToFileURL(path.resolve('fixture.md'));
const render = async (md) => (await renderer.render(md, { fileURL: FIXTURE })).code;

// ------------------------------------------------------------ 1. 基本形状
{
  const html = await render(
    [
      ':::example 例 1 · 求数组最大值',
      '找出数组 `{300, 350, 200, 400, 250}` 中的最大值。',
      '',
      '**思路**：打擂台。',
      ':::',
      '',
      '正文继续。',
    ].join('\n')
  );
  check('生成 callout 外壳', html.includes('class="callout callout--example"'), html);
  check('带 data-callout 标记', html.includes('data-callout="example"'));
  check('带 role="note"', html.includes('role="note"'));
  check('角标是「例 1」', html.includes('<span class="callout__chip">例 1</span>'));
  check('标题是「求数组最大值」', html.includes('<span class="callout__title">求数组最大值</span>'));
  check('正文进了 callout__body', /callout__body[\s\S]*打擂台[\s\S]*<\/div>/.test(html));
  check('收尾之后的内容留在框外', /<\/div>[\s\S]*正文继续/.test(html));
  check('没有残留 :::', !html.includes(':::'));
}

// ------------------------------------------- 2. 标题的几种写法都要认
{
  const cases = [
    // [写进去的标题, 期望角标, 期望标题]
    ['例 1 · 求数组最大值', '例 1', '求数组最大值'],
    ['例 3（三位水仙花数）', '例 3', '三位水仙花数'],
    ['例：总时延计算', '例题', '总时延计算'],
    ['例：', '例题', ''],
    ['习题 12 树的深度', '习题 12', '树的深度'],
    ['哈夫曼树构造', '例题', '哈夫曼树构造'],
    ['', '例题', ''],
  ];
  for (const [title, chip, rest] of cases) {
    const html = await render(`:::example ${title}\n内容\n:::\n`);
    const chipOk = html.includes(`<span class="callout__chip">${chip}</span>`);
    const restOk = rest === '' ? !html.includes('callout__title') : html.includes(`>${rest}</span>`);
    check(`标题「${title}」→ 角标「${chip}」/ 标题「${rest}」`, chipOk && restOk, html);
  }
}

// ------------------------------------------------ 3. 其它类型与未知类型
{
  const tip = await render(':::tip 小技巧\n先想清楚再写代码。\n:::\n');
  check('tip → callout--tip + 角标「提示」', tip.includes('callout--tip') && tip.includes('小技巧'));

  const unknown = await render(':::exmaple 拼错类型\n内容\n:::\n');
  check('未知类型退化成 note，且不丢内容', unknown.includes('callout--note') && unknown.includes('内容'), unknown);
}

// ------------------------------------------- 4. 忘写收尾不能吞掉后面
{
  const html = await render(
    [':::example 例 1', '题目。', '', '## 下一节', '', '这一节不该被吞掉。'].join('\n')
  );
  check('缺收尾时在下一个标题前停住', /<\/div>\s*<h2/.test(html), html);
  check('标题后面的正文还在', html.includes('这一节不该被吞掉'));
}

// ------------------------------------------------ 5. 代码块 / 表格 / 公式
{
  const html = await render(
    [
      ':::example 例 2 · 求和',
      '求数组和。',
      '',
      '| 元素 | 说明 |',
      '| :--- | :--- |',
      '| 1 | 一 |',
      '',
      '```cpp',
      'int main() { return 0; }',
      '```',
      '',
      '$$',
      'a^2 + b^2 = c^2',
      '$$',
      ':::',
    ].join('\n')
  );
  check('callout 里能放表格', html.includes('<table>'));
  check('callout 里能放代码块', html.includes('int main()'));
  check('callout 里能放块级公式', html.includes('$$') || html.includes('math'));
  check('没有残留 :::', !html.includes(':::'), html);
}

// ---------------------------------------------------------- 6. 嵌套
{
  // 嵌套时内外都用 ::: —— 插件靠「数层数」把收尾配对，别把外层提前关掉
  const nested = await render(
    [':::example 例 1', '外层。', '', ':::tip 内层提示', '里层。', ':::', ':::', '', '框外正文。'].join('\n')
  );
  check('嵌套：两个 callout 都生成', (nested.match(/class="callout /g) || []).length === 2, nested);
  check(
    '嵌套：内层在外层 body 里面',
    /callout__body[\s\S]*callout--tip[\s\S]*callout__body[\s\S]*里层/.test(nested),
    nested
  );
  check('嵌套：没有残留 :::', !nested.includes(':::'), nested);
  check('嵌套：框外正文在最后一个 </div> 之后', /<\/div>\s*<p>框外正文/.test(nested), nested);
}

// ------------------------- 7. 收尾围栏紧跟在清单 / 表格 / 代码块后面
// CommonMark 会把紧跟清单的 `:::` 当成最后一个列表项的惰性续行 ——
// 围栏会掉进 <li> 里，和外层的开围栏不同级，配对失败（页面上就是一行字面的 :::）。
{
  const afterList = await render(
    [
      ':::example 例 1',
      '求路径数。',
      '',
      '**解**：',
      '',
      '- $A^2[1][3] = 1$：路径 1 条；',
      '- $A^2[2][2] = 2$：路径 2 条。',
      ':::',
      '',
      '> **为什么成立**：解释。',
    ].join('\n')
  );
  check('清单后面直接收尾也能配对', afterList.includes('callout--example'), afterList);
  check('清单后面收尾：没有残留 :::', !afterList.includes(':::'), afterList);
  check(
    '清单后面收尾：引用块留在框外',
    /<\/div>\s*<blockquote>[\s\S]*为什么成立/.test(afterList),
    afterList
  );

  const afterTable = await render(
    [':::example 例 2', '看表。', '', '| a | b |', '| :--- | :--- |', '| 1 | 2 |', ':::'].join('\n')
  );
  check('表格后面直接收尾也能配对', afterTable.includes('callout--example') && !afterTable.includes(':::'), afterTable);

  const afterCode = await render(
    [':::example 例 3', '看代码。', '', '```cpp', 'int a = 1;', '```', ':::'].join('\n')
  );
  check('代码块后面直接收尾也能配对', afterCode.includes('callout--example') && !afterCode.includes(':::'), afterCode);

  const afterQuote = await render(
    [':::example 例 4', '看引用。', '', '> 引用一行。', '> 再一行。', ':::'].join('\n')
  );
  check('引用块后面直接收尾也能配对', afterQuote.includes('callout--example') && !afterQuote.includes(':::'), afterQuote);
}

// ----------------------------------------- 8. Obsidian 原生 `> [!example]`
{
  const html = await render(
    ['> [!example] 例 1 · 求数组最大值', '> 找出数组中的最大值。', '>', '> **思路**：打擂台。', '', '正文继续。'].join('\n')
  );
  check('别名写法也生成 callout', html.includes('class="callout callout--example"'), html);
  check('别名写法：角标「例 1」', html.includes('>例 1</span>'));
  check('别名写法：正文进了 body', html.includes('打擂台'));
  check('别名写法：没有残留 [!example]', !html.includes('[!example]'), html);
  check('别名写法：不留下空的 blockquote', !html.includes('<blockquote>'), html);
}

// ------------------------------------------- 8. 正文里没有 callout 时不乱动
{
  const html = await render(
    ['普通段落。', '', '> 普通引用块。', '', '这一行里的冒号 ::: 不在行首，不算围栏。'].join('\n')
  );
  check('普通引用块保持原样', html.includes('<blockquote>'), html);
  check('没有凭空生出 callout', !html.includes('class="callout'), html);
}

// ------------------------------------------------------------- 结果
console.log(`\n${pass} 项通过${fails.length ? `，${fails.length} 项失败` : ''}`);
if (fails.length) {
  for (const f of fails) console.log(`\n  ✗ ${f}`);
  process.exit(1);
}
console.log('✓ callout 插件行为正常');
