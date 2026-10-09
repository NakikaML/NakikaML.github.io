/**
 * 课程依赖图数据 —— 知识图谱（/notes/graph/）唯一需要手写的东西
 * ==================================================================
 * 这个文件描述「先学什么、再学什么」，也就是笔记之间的**有向依赖**。
 * 之所以不放进每篇笔记的 frontmatter：
 *   · 依赖是**课程级**的信息（一门课的顺序只有放在一起看才清楚），
 *     散到十几篇 frontmatter 里会很难维护，也容易改漏；
 *   · 它是**手写的教学判断**，不是从正文里能推出来的东西。
 * 想改顺序 / 加一篇新笔记，只改下面的数组即可，代码不用动。
 *
 * 三件事：
 *   1. courses      —— 课程列表 + 每门课的笔记顺序 + 依赖关系
 *   2. courseDeps   —— 课程与课程之间的依赖（跨课程「先修」）
 *   3. draftTitles  —— 还没发布的笔记的标题
 *
 * ⚠️ 关于 draftTitles：`id` 必须与 `src/content/notes/<id>.md` 的文件名一致。
 *    图谱用的是「已发布笔记」的真实标题；这里只是给**尚未发布**（draft: true）
 *    的笔记兜底标题，好让依赖链看起来是完整的。
 *    等某篇改成 draft: false 上线后，它会自动改用 frontmatter 里的真实标题，
 *    这个表里的条目就可以删掉（留着也无害，不会再被用到）。
 */

export interface Chapter {
  /** 笔记 id，必须等于 src/content/notes/<id>.md 的文件名 */
  id: string;
  /** 先修笔记的 id 列表（"只有箭头来源"，写在这里表示"要先学它们"） */
  prereq?: string[];
}

export interface Course {
  /** 课程名，与笔记 frontmatter 的 subfield 保持一致 */
  id: string;
  /** 展开后显示在课程头上的说明 */
  note?: string;
  chapters: Chapter[];
}

/**
 * 课程之间的依赖：`a` 依赖 `b` 表示"学完 b 再学 a"。
 * 目前三门课相互独立，所以这里是空的 —— 留成显式字段是为了
 * 以后真有跨课程先修时（比如「操作系统」依赖「数据结构」）有个地方写。
 */
export const courseDeps: Array<[string, string]> = [];

/**
 * 各课程的笔记顺序与依赖。
 * 数组顺序只在**同一层级**（依赖深度相同）时用来决定上下次序，
 * 真正的纵向位置由 prereq 算出来 —— 所以顺序写反了也不会画错，只是同层内可能上下颠倒。
 */
export const courses: Course[] = [
  {
    id: 'C++程序设计基础',
    note: '从语法骨架到现代 C++，一条主线走完',
    chapters: [
      { id: 'cpp-1-basics' },
      { id: 'cpp-2-data-types-and-operators', prereq: ['cpp-1-basics'] },
      { id: 'cpp-3-control-flow', prereq: ['cpp-2-data-types-and-operators'] },
      { id: 'cpp-4-functions', prereq: ['cpp-3-control-flow'] },
      { id: 'cpp-5-arrays', prereq: ['cpp-4-functions'] },
      { id: 'cpp-6-pointers', prereq: ['cpp-4-functions'] },
      { id: 'cpp-7-structs', prereq: ['cpp-4-functions'] },
      { id: 'cpp-8-oop', prereq: ['cpp-6-pointers', 'cpp-7-structs'] },
      { id: 'cpp-9-file-io', prereq: ['cpp-4-functions'] },
      { id: 'cpp-10-templates', prereq: ['cpp-8-oop'] },
      { id: 'cpp-11-stl', prereq: ['cpp-10-templates'] },
      { id: 'cpp-12-modern-cpp', prereq: ['cpp-11-stl'] },
    ],
  },
  {
    id: '数据结构与算法',
    note: '从线性结构到树、图与查找排序',
    chapters: [
      { id: 'dsa-1-introduction' },
      { id: 'dsa-2-linear-list', prereq: ['dsa-1-introduction'] },
      { id: 'dsa-3-stack-and-queue', prereq: ['dsa-2-linear-list'] },
      { id: 'dsa-4-string-array-generalized-list', prereq: ['dsa-2-linear-list'] },
      { id: 'dsa-5-tree-and-binary-tree', prereq: ['dsa-3-stack-and-queue'] },
      { id: 'dsa-6-graph', prereq: ['dsa-3-stack-and-queue'] },
      { id: 'dsa-7-search', prereq: ['dsa-5-tree-and-binary-tree'] },
      { id: 'dsa-8-sort', prereq: ['dsa-5-tree-and-binary-tree'] },
    ],
  },
  {
    id: '计算机网络',
    note: '自下而上走一遍五层模型',
    chapters: [
      { id: 'cn-1-network-overview' },
      { id: 'cn-2-physical-layer', prereq: ['cn-1-network-overview'] },
      { id: 'cn-3-data-link-layer', prereq: ['cn-2-physical-layer'] },
      { id: 'cn-4-network-layer', prereq: ['cn-3-data-link-layer'] },
      { id: 'cn-5-transport-layer', prereq: ['cn-4-network-layer'] },
      { id: 'cn-6-application-layer', prereq: ['cn-5-transport-layer'] },
    ],
  },
];

/** 尚未发布的笔记的兜底标题（上线后可删） */
export const draftTitles: Record<string, string> = {
  'cpp-8-oop': 'C++程序设计基础-8 面向对象编程',
  'cpp-9-file-io': 'C++程序设计基础-9 文件操作与重定向',
  'cpp-10-templates': 'C++程序设计基础-10 模板',
  'cpp-11-stl': 'C++程序设计基础-11 STL标准模板库',
  'cpp-12-modern-cpp': 'C++程序设计基础-12 现代C++',
  'cn-3-data-link-layer': '计算机网络-3 数据链路层',
  'cn-4-network-layer': '计算机网络-4 网络层',
  'cn-5-transport-layer': '计算机网络-5 运输层',
  'cn-6-application-layer': '计算机网络-6 应用层',
};

/**
 * 把 frontmatter 里的完整标题（"C++程序设计基础-6 指针"）压成图上好看的短标题（"指针"）。
 * 规则：去掉课程名前缀，再去掉开头的章节序号 —— 序号在图上由位置表达，不必再写一遍。
 */
export function shortTitle(title: string, courseId: string): string {
  let t = title;
  if (t.startsWith(courseId)) t = t.slice(courseId.length);
  t = t.replace(/^[\s\-–—]*\d+\s*/, '');
  return t.trim() || title;
}
