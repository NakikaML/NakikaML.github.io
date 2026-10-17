/**
 * 课程依赖图数据 —— 知识图谱（/notes/graph/）与页尾「同课程笔记」共用的手写数据
 * ==================================================================
 * 这个文件描述「先学什么、再学什么」，也就是笔记之间的**有向依赖**。
 * 它被两处用到（挂一次，两边一起更新）：
 *   · /notes/graph/ 的节点、箭头、章节层次；
 *   · 笔记详情页页尾的「同课程笔记」列表（opinion-8）——按下面的书写顺序列全系列。
 * 之所以不放进每篇笔记的 frontmatter：
 *   · 依赖是**课程级**的信息（一门课的顺序只有放在一起看才清楚），
 *     散到十几篇 frontmatter 里会很难维护，也容易改漏；
 *   · 它是**手写的教学判断**，不是从正文里能推出来的东西。
 * 想改顺序 / 加一篇新笔记，只改下面的数组即可，代码不用动。
 *
 * 四件事：
 *   1. disciplines  —— **学科分野**（计算机科学 / 数学 …）。图上按分野分成上下两带，
 *                      配色也按分野走（同一个分野同一个色系，见 opinion-18）
 *   2. courses      —— 课程列表 + 每门课的笔记顺序 + 依赖关系（必须写上所属分野）
 *   3. courseDeps   —— 课程与课程之间的依赖（跨课程「先修」）
 *   4. draftTitles  —— 还没发布的笔记的标题（页尾列表里显示成「待发布」）
 *
 * ⚠️ 关于 draftTitles：`id` 必须与 `src/content/notes/<id>.md` 的文件名一致。
 *    图谱与页尾列表用的都是「已发布笔记」的真实标题；这里只是给**尚未发布**
 *    的笔记兜底标题，好让依赖链、课程列表看起来是完整的。
 *    页尾的「同课程笔记」会照它渲染成灰色的「待发布」；两个标题都没有的章，
 *    页尾干脆不出现那一行（不猜名字）。
 *    等某篇上线后，它会自动改用 frontmatter 里的真实标题，
 *    这个表里的条目就可以删掉（留着也无害，不会再被用到）。
 */

export interface Chapter {
  /** 笔记 id，必须等于 src/content/notes/<id>.md 的文件名 */
  id: string;
  /**
   * 展开后它在图上摆在哪一格：`[列, 行]`（列可以带小数，行从 1 开始）。
   *
   * ⚠️ **填了就锁定位置**：这门课的章节图完全按这里摆，不再由算法自动排序。
   * 适合「我就是要这个形状」的图（高等数学那 11 章就是照着作者手画的图钉死的）。
   * 不填 = 交给自动布局（按依赖深度分层 + 重心排序）。
   * 同一门课里要么全填、要么全不填 —— 混着填会有一半节点没位置。
   */
  at?: [number, number];
  /**
   * 先修笔记的 id 列表：写在这里表示「要先学它们」。
   *
   * 两种都支持，但**在图上的出现方式不同**：
   *   · **课内先修**（同一门课的上一章）→ 画成实线主干 / 虚线旁支，
   *     并决定章节的上下层次与章号顺序（rank）；
   *   · **跨课程先修**（如 DSA-3 栈和队列要先用过 CPP-7 结构体）→ **不画常驻线**：
   *     图一次只展开一门课，这条边的另一头永远是收起的，画出来只能是一条横穿画布的长线。
   *     它只体现在两处 —— 点某章时先修链会顺着它亮到那门课的**课程头**
   *     （课程级箭头一起亮，正好说明「为什么另一门课也亮着」），
   *     以及信息卡里写明「结构体（C++程序设计基础）」。实现见 graph.astro 的 prereqOf。
   *
   * ⚠️ 跨课程先修**不参与布局与分层**：写错不会把图排歪，但也不会改变任何位置。
   */
  prereq?: string[];
}

export interface Course {
  /** 课程名，与笔记 frontmatter 的 subfield 保持一致 */
  id: string;
  /**
   * 所属**学科分野**：`disciplines[].key`（见下）。
   * 省略时按 `计算机科学`（`cs`）处理 —— 早期数据没写这一项。
   * 这个字段决定三件事：① 图上这门课落在哪条分野带里；
   * ② 课程头的配色（一个分野一个色系，见 global.css 的 `--disc-*`）；
   * ③ 课程之间的先修箭头只在本分野内画（跨分野的先修请改布局，不要硬画）。
   */
  discipline?: string;
  /**
   * 这门课在**全局列网格**里摆哪一格：`[列, 行]`，都从 0 起。
   *
   * ⚠️ **列是全图共用的**（不是每条带各排各的）：同一个列号在两条带里落在同一条竖线上。
   *    所以「离散数学」正好在「C++程序设计基础」的**正上方** —— 它那条跨带虚线才能
   *    与 C++ 的箭头并成同一支（作者 2026-10 的草图就是这么画的）。
   * 列 = 学习的先后（左先右后），行 = 带内并行的两条路线（0 是上面那一行，行号只在本带内有效）。
   * 填了就**钉死**：布局不再按依赖深度分列，只照抄这个格子；
   * 不填 = 退回老算法（列 = 依赖深度、行 = 0），临时加一门课也不会掉出图。
   */
  at?: [number, number];
  /** 展开后显示在课程头上的说明 */
  note?: string;
  chapters: Chapter[];
  /**
   * true = **预留课程**：笔记还在规划中，暂时没有任何章节。
   * 它在图上照常出现（好把学习路线画完整），但**不能展开**，
   * 悬停/点击会提示"笔记还在安排中"。等笔记上线后把这里改成 false 并补上 chapters 即可。
   */
  planned?: boolean;
}

/**
 * 学科分野 —— 知识图谱最外一层的分组（opinion-18）。
 * ============================================================
 * 一门课属于哪个分野，就在 `courses` 里写 `discipline: '<key>'`。
 * 图的排版、配色、图例全部按这里的顺序与 key 走，**改顺序就改这里**：
 *   · 图上每个分野一条横向底带，分野之间留空档，带内按依赖分列；
 *   · 配色写在 `src/styles/global.css` 的 `--disc-<key>-*`（浅色 / 深色两套）；
 *   · 新增分野 = 这里加一项 + global.css 补三行色值，代码不用动。
 */
export interface Discipline {
  /** ASCII 键：CSS 的 `--disc-<key>-*` 与图上 `data-disc` 都用它 */
  key: string;
  /** 图上显示的名字 */
  label: string;
  /** 图例 / 分野带上的一句话说明（可选） */
  note?: string;
}

export const disciplines: Discipline[] = [
  {
    key: 'cs',
    label: '计算机科学',
    note: '从语言基础到数据结构、系统与网络',
  },
  {
    key: 'math',
    label: '数学',
    note: '高等数学 / 线性代数 / 概率论与数理统计 / 离散数学 —— 从连续到离散',
  },
];

/** 取一门课的所属分野（没写就是计算机科学） */
export function disciplineOf(course: Course): string {
  return course.discipline?.trim() || 'cs';
}

/**
 * 课程之间的依赖：`[后学, 先学]`，表示"学完后学之前，先学先学"。
 * 图上画成从 `先学` 指向 `后学` 的箭头。
 *
 * ⚠️ 这里**只列显式声明的关系**；同一条链上相邻的两门课不会自动连边，
 * 想要箭头就写在这里（写少了就是图上看不到，不会报错）。
 *
 * 分层：**课程级**依赖写这里（画成课程之间的箭头）；
 * **章节级**的跨课程依赖写在下面各 `chapters[].prereq` 里（不画线，只在点亮先修链与信息卡里出现）。
 */
export const courseDeps: Array<[string, string]> = [
  ['数据结构与算法', 'C++程序设计基础'],
  ['计算机网络', '数据结构与算法'],
  ['计算机系统基础', '数据结构与算法'],
  ['JavaWeb开发', 'Java程序设计基础'],
  // 跨分野：离散数学是数据结构与算法的先修（集合与关系 → 图论/逻辑，正是 DSA 的地基）。
  // 它在图上画成一条跨带连线，不参与两条带内部的「列」计算。
  ['数据结构与算法', '离散数学'],

  // 数学分野的内部路线：高数 → 统概、高数 → 离散、线代 → 离散
  ['概率论与数理统计', '高等数学'],
  ['离散数学', '高等数学'],
  ['离散数学', '线性代数'],
];

/**
 * 各课程的笔记顺序与依赖。
 * 数组顺序只在**同一层级**（依赖深度相同）时用来决定上下次序，
 * 真正的纵向位置由 prereq 算出来 —— 所以顺序写反了也不会画错，只是同层内可能上下颠倒。
 *
 * 课程头在**全局列网格**里的位置由 `at: [列, 行]` 决定（作者 2026-10 的草图）：
 * 列号全图共用，所以同一个列号在两条带里落在同一条竖线上。
 *
 *        第 0 列              第 1 列                 第 2 列              第 3 列
 *                          ┌ Java程序设计基础              JavaWeb开发          计算机系统基础
 *                          │ C++程序设计基础               数据结构与算法       计算机网络
 *   高等数学 ┐            │
 *   线性代数 ┴────────────┴ 离散数学 / 概率论与数理统计
 *
 * 关键一点：**离散数学与 C++ 同列**，所以「离散数学 → 数据结构与算法」那条虚线
 * 竖直抬上去以后，正好落进「C++ → 数据结构与算法」那支箭头的竖轨里，两条合成一支。
 */
export const courses: Course[] = [
  {
    id: 'C++程序设计基础',
    discipline: 'cs',
    at: [1, 1],
    note: '从语法基础骨架到现代 C++',
    chapters: [
      { id: 'cpp-1-basics' },
      { id: 'cpp-2-data-types-and-operators', prereq: ['cpp-1-basics'] },
      { id: 'cpp-3-control-flow', prereq: ['cpp-2-data-types-and-operators'] },
      { id: 'cpp-4-functions', prereq: ['cpp-3-control-flow'] },
      { id: 'cpp-5-arrays', prereq: ['cpp-4-functions'] },
      { id: 'cpp-6-pointers', prereq: ['cpp-4-functions'] },
      { id: 'cpp-7-structs', prereq: ['cpp-4-functions'] },
      { id: 'cpp-9-file-io', prereq: ['cpp-4-functions'] },
      { id: 'cpp-8-oop', prereq: ['cpp-6-pointers', 'cpp-7-structs'] },
      { id: 'cpp-10-templates', prereq: ['cpp-8-oop'] },
      { id: 'cpp-11-stl', prereq: ['cpp-10-templates'] },
      { id: 'cpp-12-modern-cpp', prereq: ['cpp-11-stl'] },
    ],
  },
  {
    id: '数据结构与算法',
    discipline: 'cs',
    at: [2, 1],
    note: '从线性结构到树、图与查找排序',
    chapters: [
      { id: 'dsa-1-introduction' },
      { id: 'dsa-2-linear-list', prereq: ['dsa-1-introduction'] },
      { id: 'dsa-3-stack-and-queue', prereq: ['dsa-2-linear-list', 'cpp-7-structs'] },
      { id: 'dsa-4-string-array-generalized-list', prereq: ['dsa-2-linear-list'] },
      { id: 'dsa-5-tree-and-binary-tree', prereq: ['dsa-3-stack-and-queue'] },
      { id: 'dsa-6-graph', prereq: ['dsa-3-stack-and-queue'] },
      { id: 'dsa-7-search', prereq: ['dsa-5-tree-and-binary-tree'] },
      { id: 'dsa-8-sort', prereq: ['dsa-5-tree-and-binary-tree'] },
    ],
  },
  {
    id: '计算机网络',
    discipline: 'cs',
    at: [3, 1],
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

  // ------------------------------------------------ 以下为预留课程（笔记规划中）
  {
    id: '计算机系统基础',
    discipline: 'cs',
    at: [3, 0],
    note: '计算机组成、操作系统与体系结构方向的整理计划',
    chapters: [],
    planned: true,
  },
  {
    id: 'Java程序设计基础',
    discipline: 'cs',
    at: [1, 0],
    note: 'Java 语法与面向对象基础（先修，笔记规划中）',
    chapters: [],
    planned: true,
  },
  {
    id: 'JavaWeb开发',
    discipline: 'cs',
    at: [2, 0],
    note: 'Servlet / Spring 方向的 Web 开发笔记（规划中）',
    chapters: [],
    planned: true,
  },

  // ================================================ 数学分野
  // 四门课的全局路线（写在下面对应的 courseDeps 里）：
  //     高等数学 → 概率论与数理统计
  //     高等数学 → 离散数学
  //     线性代数 → 离散数学
  {
    id: '高等数学',
    discipline: 'math',
    at: [0, 0],
    note: '一元微积分 → 空间解析几何 → 多元微积分 → 曲线曲面积分与级数',
    /**
     * ⚠️ 这 11 章的位置是**照作者手画的草图钉死的**（`at: [列, 行]`），不走自动布局：
     *      1
     *      2        7
     *      4        3
     *      6   5        8
     *           11            9
     *                        10
     * 改动前先想清楚：这是「作者认可的排版」，不是算法算出来的。
     */
    chapters: [
      { id: 'hm-1-functions-and-limits', at: [2.3, 1] },
      { id: 'hm-2-derivatives-and-differentials', at: [1.45, 2], prereq: ['hm-1-functions-and-limits'] },
      { id: 'hm-7-vectors-and-analytic-geometry', at: [3.8, 2], prereq: ['hm-1-functions-and-limits'] },
      { id: 'hm-4-indefinite-integral', at: [0.45, 3], prereq: ['hm-2-derivatives-and-differentials'] },
      {
        id: 'hm-3-mean-value-theorems',
        at: [2.45, 3],
        prereq: ['hm-2-derivatives-and-differentials'],
      },
      { id: 'hm-6-differential-equations', at: [0, 4], prereq: ['hm-4-indefinite-integral'] },
      { id: 'hm-5-definite-integral', at: [1.1, 4], prereq: ['hm-4-indefinite-integral'] },
      {
        id: 'hm-8-multivariable-calculus',
        at: [3.2, 4],
        prereq: ['hm-3-mean-value-theorems', 'hm-7-vectors-and-analytic-geometry'],
      },
      {
        id: 'hm-9-multiple-integrals',
        at: [3.4, 5],
        prereq: ['hm-5-definite-integral', 'hm-8-multivariable-calculus'],
      },
      { id: 'hm-11-infinite-series', at: [1.0, 5], prereq: ['hm-5-definite-integral'] },
      { id: 'hm-10-line-and-surface-integrals', at: [3.35, 6], prereq: ['hm-9-multiple-integrals'] },
    ],
  },
  {
    id: '线性代数',
    discipline: 'math',
    at: [0, 1],
    note: '矩阵与线性方程组、向量空间、特征值与二次型（笔记规划中）',
    chapters: [],
    planned: true,
  },
  {
    id: '概率论与数理统计',
    discipline: 'math',
    at: [1, 1],
    note: '随机变量与分布、数字特征、参数估计与假设检验（先修：高等数学；笔记规划中）',
    chapters: [],
    planned: true,
  },
  {
    id: '离散数学',
    discipline: 'math',
    at: [1, 0],
    note: '集合与关系、图论、数理逻辑 —— 数学与计算机的交汇（先修：高等数学 + 线性代数；笔记规划中）',
    chapters: [],
    planned: true,
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

  // 高等数学 11 章：目前全部是 `draft: true`（等作者审阅后转正）。
  // 留着这些兜底标题，构建出来的线上图谱/页尾也能把整条路线画完、显示成灰色的「待发布」；
  // 某一章转正之后，这条就自动改用 frontmatter 里的真实标题，删掉也无害。
  'hm-1-functions-and-limits': '高等数学-1 函数与极限',
  'hm-2-derivatives-and-differentials': '高等数学-2 导数与微分',
  'hm-3-mean-value-theorems': '高等数学-3 微分中值定理与导数的应用',
  'hm-4-indefinite-integral': '高等数学-4 不定积分',
  'hm-5-definite-integral': '高等数学-5 定积分',
  'hm-6-differential-equations': '高等数学-6 微分方程',
  'hm-7-vectors-and-analytic-geometry': '高等数学-7 向量代数与空间解析几何',
  'hm-8-multivariable-calculus': '高等数学-8 多元函数微分学',
  'hm-9-multiple-integrals': '高等数学-9 重积分',
  'hm-10-line-and-surface-integrals': '高等数学-10 曲线积分与曲面积分',
  'hm-11-infinite-series': '高等数学-11 无穷级数',
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
