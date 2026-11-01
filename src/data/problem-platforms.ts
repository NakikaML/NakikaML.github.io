/**
 * problem-platforms.ts —— 练习题单的「平台」登记表（opinion-7）
 * ==================================================================
 * 笔记 frontmatter 里的 `problems` 只写「平台 + 题号 + 题名」，**地址由这里拼**。
 * 为什么要这么绕：手写 Markdown 链接的出错方式太隐蔽了 ——
 * 把 `P1601` 敲成 `P1061` 一样能点开，只是点到了另一道题，构建不会报错、
 * 读者也不会告诉你。把平台和题号拆开之后，格式错了在构建时就拦下来。
 *
 * 三处用到：
 *   · `src/content.config.ts` —— 用 `problemIssue()` 做 schema 校验（写错平台/题号直接构建失败）；
 *   · `src/components/ProblemList.astro` —— 用 `resolveProblem()` 拿到要显示的 label 与 href；
 *   · `scripts/verify-build.mjs` —— 兜底检查产物里的链接是不是都是 https 绝对地址。
 *
 * 加一个平台 = 在 `problemPlatforms` 里加一项（`pattern` + `url`），别处不用动。
 * 遇到登记表里没有的 OJ：条目里直接写 `url:`，平台名会原样当徽章文字。
 */

export interface ProblemPlatform {
  /** frontmatter 里 `platform` 的写法（小写）；同时是徽章 CSS 类名的后缀 */
  key: string;
  /** 页面上显示的名字（作者写简称，显示一律用这个） */
  label: string;
  /** 作者还可能怎么写（中文名 / 常见简称），匹配时不区分大小写 */
  aliases: string[];
  /** 题号格式；对不上就报错，别等读者点出 404 */
  pattern: RegExp;
  /** 题号 → 题目地址 */
  url: (id: string) => string;
  /** 题号的规范写法（洛谷统一大写 P1601、Codeforces 统一 1234A） */
  normalize?: (id: string) => string;
  /** 格式示例，报错时告诉作者该怎么写 */
  hint: string;
}

export const problemPlatforms: ProblemPlatform[] = [
  {
    key: 'luogu',
    label: '洛谷',
    aliases: ['洛谷', 'lg'],
    pattern: /^[A-Z]{1,3}\d{3,6}$/,
    hint: 'P1601',
    normalize: (id) => id.toUpperCase(),
    url: (id) => `https://www.luogu.com.cn/problem/${id}`,
  },
  {
    key: 'leetcode',
    label: 'LeetCode',
    // 题号（66）拼不出地址，地址要用题目 slug（plus-one）：
    // 所以题号与 slug 都写时用 `66:plus-one`，只写 slug 也认。
    // slug 里至少要有一个字母 —— 光写数字（`66`）会拼出 /problems/66/ 这种 404 地址。
    pattern: /^(?=.*[a-z])[a-z0-9]+(?:-[a-z0-9]+)*$/,
    hint: '66:plus-one（题号:slug）或直接 plus-one',
    aliases: ['力扣', 'lc', 'leetcode'],
    normalize: (id) => id.toLowerCase(),
    url: (id) => `https://leetcode.cn/problems/${id}/`,
  },
  {
    key: 'codeforces',
    label: 'Codeforces',
    aliases: ['cf'],
    pattern: /^\d{3,5}[A-Z]\d?$/,
    hint: '1234A（题号里带字母）',
    normalize: (id) => id.toUpperCase(),
    url: (id) => {
      const m = /^(\d{3,5})([A-Z]\d?)$/.exec(id.toUpperCase());
      return m ? `https://codeforces.com/problemset/problem/${m[1]}/${m[2]}` : '';
    },
  },
  {
    key: 'atcoder',
    label: 'AtCoder',
    aliases: ['at'],
    pattern: /^[a-z]{2,4}\d{3}_[a-h]$/,
    hint: 'abc300_a',
    normalize: (id) => id.toLowerCase(),
    url: (id) => {
      const contest = id.split('_')[0];
      return `https://atcoder.jp/contests/${contest}/tasks/${id}`;
    },
  },
];

/** key / label / 别名 → 平台（全都小写存，查的时候也小写） */
const INDEX = new Map<string, ProblemPlatform>();
for (const p of problemPlatforms) {
  INDEX.set(p.key, p);
  INDEX.set(p.label.toLowerCase(), p);
  for (const a of p.aliases) INDEX.set(a.trim().toLowerCase(), p);
}

/** 认 key、label 和中文名；认不出来返回 undefined */
export function findPlatform(raw: string): ProblemPlatform | undefined {
  return INDEX.get(String(raw ?? '').trim().toLowerCase());
}

/** 可用平台清单，拼进报错信息 */
export const platformKeys = problemPlatforms.map((p) => p.key);

/** frontmatter 里一条题单（对象写法的形状） */
export interface ProblemInput {
  platform: string;
  id: string;
  /** 题号（可选）。只有 LeetCode 这种「题号拼不出地址」的平台才需要单独写 */
  no?: string;
  title?: string;
  note?: string;
  difficulty?: string;
  /** 登记表里没有的 OJ：直接给地址 */
  url?: string;
}

/** 渲染用：题号、徽章文字、链接都已经算好 */
export interface ResolvedProblem {
  platform: string;
  label: string;
  /** 徽章后面那个「题号」：填了 no 就用 no，否则用 id */
  no: string;
  /** 真正的题号 / slug，写进 data 属性，方便以后做统计 */
  id: string;
  title: string;
  note: string;
  difficulty: string;
  href: string;
}

/**
 * 校验一条题单，返回**给人看的错误信息**（没问题返回 null）。
 * 平台没登记但给了 `url` 是允许的 —— OJ 那么多，总要有条后路。
 */
export function problemIssue(p: ProblemInput): string | null {
  const def = findPlatform(p.platform);
  if (!def) {
    if (p.url) return null;
    return `未知的平台「${p.platform}」，可用：${platformKeys.join(' / ')}；其它 OJ 请直接写 url:`;
  }
  const id = def.normalize ? def.normalize(p.id) : p.id;
  if (!def.pattern.test(id)) {
    return `${def.label} 的题号「${p.id}」格式不对，应该像 ${def.hint}`;
  }
  return null;
}

/** 把一条题单变成页面上要的东西（题号规范化、地址拼好、徽章文字定死） */
export function resolveProblem(p: ProblemInput): ResolvedProblem {
  const def = findPlatform(p.platform);
  const id = def?.normalize ? def.normalize(p.id) : p.id;
  const href = p.url?.trim() || (def ? def.url(id) : '');
  return {
    platform: def?.key ?? p.platform,
    label: def?.label ?? p.platform,
    no: p.no?.trim() || id,
    id,
    title: p.title ?? '',
    note: p.note ?? '',
    difficulty: p.difficulty ?? '',
    href,
  };
}
