#!/usr/bin/env node
/**
 * test-inline-dfrac.mjs —— remark-inline-dfrac 的回归测试
 * ==================================================================
 * 跑法：node scripts/test-inline-dfrac.mjs   （或 pnpm test:frac）
 *
 * 为什么值得单独测：这个插件会**改写所有笔记里的行内公式**，
 * 一旦判断错，坏的是正文内容而不是构建结果——构建照样通过，
 * 只是页面上的公式变得不对。所以边界情况要钉死。
 *
 * 其中「hChildren」那一组是真实踩过的坑：remark-math 把 TeX 同时放在
 * node.value 和 node.data.hChildren，而 remark-rehype 只认后者，
 * 第一版插件只改了 node.value，于是"改了但没生效"，构建全绿、页面照旧。
 */
import remarkInlineDfrac, { promoteTopLevelFrac } from './remark-inline-dfrac.mjs';

// ---------------------------------------------------------------- 纯函数
const cases = [
  // [输入, 期望, 说明]
  ['\\frac{a}{b}', '\\dfrac{a}{b}', '最基本的提升'],
  ['x = \\frac{1}{2}', 'x = \\dfrac{1}{2}', '正文中的分式'],
  ['\\frac{n(n-1)}{2}', '\\dfrac{n(n-1)}{2}', 'CN-1 笔记里的真实用例'],
  ['\\frac12', '\\dfrac12', '不带花括号的简写'],
  ['\\frac ab', '\\dfrac ab', '单个 token 参数'],
  ['\\frac{1}{2} + \\frac{3}{4}', '\\dfrac{1}{2} + \\dfrac{3}{4}', '一行多个分式'],
  ['\\left(\\frac{a}{b}\\right)', '\\left(\\dfrac{a}{b}\\right)', '括号内的顶层分式'],
  ['\\text{速率} = \\frac{1}{2}', '\\text{速率} = \\dfrac{1}{2}', '带 \\text 的中文公式'],

  ['\\frac{\\frac{a}{b}}{c}', '\\dfrac{\\frac{a}{b}}{c}', '嵌套：只提升外层'],
  ['\\frac{a}{\\frac{b}{c}}', '\\dfrac{a}{\\frac{b}{c}}', '嵌套：分母里的不动'],
  ['a_{\\frac{1}{2}}', 'a_{\\frac{1}{2}}', '下标里的分式不动'],
  ['\\sqrt{\\frac{a}{b}}', '\\sqrt{\\frac{a}{b}}', '参数里的分式不动'],
  ['\\text{\\frac{a}{b}}', '\\text{\\frac{a}{b}}', '\\text 里的不动'],

  ['\\dfrac{a}{b}', '\\dfrac{a}{b}', '已经是 dfrac，不重复处理'],
  ['\\tfrac{a}{b}', '\\tfrac{a}{b}', 'tfrac 是刻意写法，不碰'],
  ['\\cfrac{a}{b}', '\\cfrac{a}{b}', '其它 frac 命令不误伤'],
  ['\\binom{n}{k}', '\\binom{n}{k}', '无关命令'],
  ['\\{a\\} \\frac{1}{2}', '\\{a\\} \\dfrac{1}{2}', '转义花括号不影响层级'],
  ['\\\\frac{a}{b}', '\\\\frac{a}{b}', '换行符开头的 frac 不动'],
  ['\\frac{a}{b', '\\dfrac{a}{b', '括号不闭合也不崩'],
  ['', '', '空串'],
  ['10^3 + 2^{-4}', '10^3 + 2^{-4}', '没有分式时原样返回'],
];

let pass = 0;
const fails = [];

for (const [input, expect, label] of cases) {
  const got = promoteTopLevelFrac(input);
  if (got === expect) pass++;
  else {
    fails.push(
      `${label}\n    输入 ${JSON.stringify(input)}\n    期望 ${JSON.stringify(expect)}\n    实际 ${JSON.stringify(got)}`
    );
  }
}

// ------------------------------------------------------- remark 插件（树）
const check = (label, actual, expect) => {
  if (actual === expect) pass++;
  else fails.push(`${label}\n    期望 ${JSON.stringify(expect)}\n    实际 ${JSON.stringify(actual)}`);
};

/** 造一个带 hChildren 的 inlineMath 节点，模拟 remark-math 的真实产物 */
const mathNode = (tex) => ({
  type: 'inlineMath',
  value: tex,
  data: {
    hName: 'code',
    hProperties: { className: ['language-math', 'math-inline'] },
    hChildren: [{ type: 'text', value: tex }],
  },
});

{
  const inline = mathNode('\\frac{1}{2}');
  const block = { type: 'math', value: '\\frac{1}{2}' };
  const nested = mathNode('a_{\\frac{1}{2}}');

  const tree = {
    type: 'root',
    children: [
      { type: 'paragraph', children: [inline] },
      block,
      { type: 'blockquote', children: [{ type: 'paragraph', children: [nested] }] },
    ],
  };

  remarkInlineDfrac()(tree);

  check('树：行内公式的 node.value 被替换', inline.value, '\\dfrac{1}{2}');
  check(
    '树：data.hChildren 也要一起替换（remark-rehype 只认它）',
    inline.data.hChildren[0].value,
    '\\dfrac{1}{2}'
  );
  check('树：块级公式（math）不动', block.value, '\\frac{1}{2}');
  check('树：块引用里的下标分式不动', nested.value, 'a_{\\frac{1}{2}}');
}

{
  // 没有 hChildren 的节点（别的管线 / 手工造的）也不能崩
  const bare = { type: 'inlineMath', value: '\\frac{1}{2}' };
  const tree = { type: 'root', children: [{ type: 'paragraph', children: [bare] }] };
  remarkInlineDfrac()(tree);
  check('树：没有 data.hChildren 时也能正常替换', bare.value, '\\dfrac{1}{2}');
}

// ------------------------------------------------------------------ 汇总
console.log(`通过 ${pass} / ${pass + fails.length}`);
if (fails.length) {
  console.log('\n失败项：');
  fails.forEach((f) => console.log('  ✗ ' + f));
  process.exit(1);
}
console.log('全部通过 ✓');
