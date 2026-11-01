#!/usr/bin/env node
/**
 * test-problems.mjs —— 练习题单登记的回归测试（opinion-7）
 * ==================================================================
 * 跑法：node --experimental-strip-types scripts/test-problems.mjs
 *      （或 pnpm test:problems —— package.json 里已经带上了那个 flag）
 *
 * 为什么值得单独测：
 *   平台的地址是**拼出来的**，拼错了构建照样通过 —— 读者点进去才发现是 404，
 *   或者更糟：拼出来的是另一道题，而且看一眼标题还发现不了。
 *   所以这里把「认哪些写法、拼出什么地址、哪些写法必须被拒」全部钉住。
 *
 * 被测文件是 TypeScript（src/data/problem-platforms.ts），靠 Node 的类型擦除
 * 直接跑，不额外引测试框架 —— 和 scripts/test-callout.mjs 一个思路：能用原生就跑原生。
 */

import {
  findPlatform,
  problemIssue,
  resolveProblem,
  platformKeys,
} from '../src/data/problem-platforms.ts';

let pass = 0;
const fails = [];
const check = (label, cond, detail) => {
  if (cond) pass++;
  else fails.push(`${label}${detail ? `\n    ${detail}` : ''}`);
};

/** 一条「能过校验 + 地址对」的用例 */
function accept(label, input, expect) {
  const issue = problemIssue(input);
  check(`${label} 应通过校验`, issue === null, issue ?? '');
  const r = resolveProblem(input);
  for (const [key, want] of Object.entries(expect)) {
    check(`${label} 的 ${key}`, r[key] === want, `期望 ${want}，实际 ${r[key]}`);
  }
}

/** 一条「必须被拒」的用例 */
function reject(label, input, expectPart) {
  const issue = problemIssue(input);
  check(`${label} 应被拒`, issue !== null, '居然通过了');
  if (issue) check(`${label} 的报错要说清楚`, issue.includes(expectPart), issue);
}

// ------------------------------------------------- 1. 平台别名与题号规范化
accept('luogu + 小写题号', { platform: 'luogu', id: 'p1601' }, {
  platform: 'luogu',
  label: '洛谷',
  no: 'P1601',
  href: 'https://www.luogu.com.cn/problem/P1601',
});
accept('平台写中文名', { platform: '洛谷', id: 'P1303' }, {
  platform: 'luogu',
  label: '洛谷',
  href: 'https://www.luogu.com.cn/problem/P1303',
});
accept('平台写简称 lc', { platform: 'lc', id: 'Two-Sum' }, {
  platform: 'leetcode',
  label: 'LeetCode',
  no: 'two-sum',
  href: 'https://leetcode.cn/problems/two-sum/',
});
accept('题号 + slug 都写', { platform: 'leetcode', id: 'plus-one', no: '66' }, { no: '66' });
accept('codeforces 自动拆题号', { platform: 'cf', id: '1234a' }, {
  label: 'Codeforces',
  no: '1234A',
  href: 'https://codeforces.com/problemset/problem/1234/A',
});
accept('atcoder 自动补 contest', { platform: 'atcoder', id: 'ABC300_A' }, {
  label: 'AtCoder',
  no: 'abc300_a',
  href: 'https://atcoder.jp/contests/abc300/tasks/abc300_a',
});
accept('未登记的 OJ + 显式 url', { platform: '牛客', id: 'NC16622', url: 'https://ac.nowcoder.com/acm/problem/16622' }, {
  platform: '牛客',
  label: '牛客',
  href: 'https://ac.nowcoder.com/acm/problem/16622',
});

// ------------------------------------------------- 2. 必须被拒的写法
reject('洛谷题号太短', { platform: 'luogu', id: 'P16' }, '格式不对');
reject('洛谷题号少前缀', { platform: 'luogu', id: '1601' }, '格式不对');
reject('LeetCode 只写数字题号', { platform: 'leetcode', id: '66' }, 'plus-one');
reject('Codeforces 题号没字母', { platform: 'codeforces', id: '1234' }, '格式不对');
reject('AtCoder 少下划线', { platform: 'atcoder', id: 'abc300a' }, '格式不对');
reject('未登记的 OJ 又没给 url', { platform: '牛客', id: 'NC1' }, '未知的平台');

// ------------------------------------------------- 3. 查表本身
check('findPlatform 不区分大小写', findPlatform('LeetCode')?.key === 'leetcode');
check('findPlatform 认不出来时返回 undefined', findPlatform('不存在的平台') === undefined);
check('平台清单是四项', platformKeys.join(',') === 'luogu,leetcode,codeforces,atcoder', platformKeys.join(','));

// ------------------------------------------------------------- 结果
console.log(`\n${pass} 项通过${fails.length ? `，${fails.length} 项失败` : ''}`);
if (fails.length) {
  for (const f of fails) console.log(`\n  ✗ ${f}`);
  process.exit(1);
}
console.log('✓ 练习题单的平台登记与校验正常');
