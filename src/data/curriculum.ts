/**
 * 课程依赖数据 —— 「学习路线」（/notes/route/）与页尾「同课程笔记」共用的手写数据
 * ==================================================================
 * 这个文件描述「先学什么、再学什么」，也就是笔记之间的**有向依赖**。
 * 它被两处用到（挂一次，两边一起更新）：
 *   · /notes/route/ 学习路线页的分野、课程顺序与章节顺序（opinion-24 下线图谱后改用它）；
 *   · 笔记详情页页尾的「同课程笔记」列表（opinion-8）——列出这门课的全系列（按章号排，见下）。
 * 之所以不放进每篇笔记的 frontmatter：
 *   · 依赖是**课程级**的信息（一门课的顺序只有放在一起看才清楚），
 *     散到十几篇 frontmatter 里会很难维护，也容易改漏；
 *   · 它是**手写的教学判断**，不是从正文里能推出来的东西。
 * 想改顺序 / 加一篇新笔记，只改下面的数组即可，代码不用动。
 *
 * 四件事：
 *   1. disciplines  —— **学科分野**（计算机科学 / 数学 …）。学习路线页按分野分成上下两块，
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
   * 这一章在 408 考研里的权重（opinion-26）—— 只对本系列（计组融合课）有意义。
   *
   *   `core`  408 必考重点（学习路线页上标一个「408」角标）
   *   `basic` 408 要求了解 / 只考其中一部分（标「408·了解」）
   *   `off`   408 不考（本校课特色内容，不标）
   *
   * 不填 = 不标。这一项只影响两处：章行上的角标，和学习路线页的搜索
   * （搜 `408` 能筛出所有考点章，搜 `408核心` 只出重点章）。
   * **别把考点判断写进正文散文里** —— 408 大纲每年微调，改一行数据比改十篇正文便宜。
   */
  exam408?: 'core' | 'basic' | 'off';
  /**
   * 先修笔记的 id 列表：写在这里表示「要先学它们」。
   *
   * 两种都支持：
   *   · **课内先修**（同一门课的上一章）→ 学习路线页上写「先修 第 N 章」；
   *   · **跨课程先修**（如「程序的机器级表示」要先用过 C++ 的函数与指针）→
   *     写成「先修 C++程序设计基础 · 4」，不占本课的顺序，只做提示。
   *
   * ⚠️ 跨课程先修**不参与任何排序**：写错只会显示得怪，不会把章序排歪。
   */
  prereq?: string[];
}

export interface Course {
  /** 课程名，与笔记 frontmatter 的 subfield 保持一致 */
  id: string;
  /**
   * 所属**学科分野**：`disciplines[].key`（见下）。
   * 省略时按 `计算机科学`（`cs`）处理 —— 早期数据没写这一项。
   * 这个字段决定三件事：① 这门课归到哪个分野标签页里（学习路线页）；
   * ② 课程卡片的配色（一个分野一个色系，见 global.css 的 `--disc-*`）；
   * ③ 哪些课程先修算「跨学科」（先修标签上会标一下）。
   */
  discipline?: string;
  /**
   * 搜索别名（opinion-25）：学习路线页的搜索框能认这些写法。
   *
   * 课程名是「数据结构与算法」这种正式名字，但人搜的时候会敲 `DSA`、`计网`、`线代`。
   * 除了这里，每篇章的笔记 id（`dsa-3-stack-and-queue`）也参与检索 ——
   * 所以不填别名时，搜 `dsa` 也仍然能找到这门课的章节；别名补的是「课程卡片本身」
   * 与中文简称这两种情况（如搜「高数」要能找到高等数学这门课）。
   */
  aliases?: string[];
  /**
   * 这门课在**全局列网格**里摆哪一格：`[列, 行]`，都从 0 起。
   *
   * ⚠️ 这是当年知识图谱用的格位（作者 2026-10 的草图），图谱已下线（opinion-24），
   *    现在只剩「记录当时怎么想的」这个作用，学习路线页不读它。
   * 列 = 学习的先后（左先右后），行 = 带内并行的两条路线（0 是上面那一行）。
   */
  at?: [number, number];
  /** 卡片上的一句话说明 */
  note?: string;
  chapters: Chapter[];
  /**
   * true = **预留课程**：笔记还在规划中，暂时没有任何章节。
   * 它照常占一张课程卡片（好把学习路线画完整），但没有任何章节行；
   * 等笔记上线后把这里改成 false 并补上 chapters 即可。
   */
  planned?: boolean;
}

/**
 * 学科分野 —— 学习路线最外一层的分组（opinion-18）。
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
  // 这门课的真正前置是 C++：第 3 章「程序的机器级表示」直接从 C 程序讲到栈帧与指针。
  // （原来是挂在「数据结构与算法」下，但那门课对它几乎用不上。）
  ['计算机系统基础与组成原理', 'C++程序设计基础'],
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
 *
 * ⚠️ **这里数组的顺序不决定任何显示顺序**（bug-16 之后）：
 * 两个使用方都按标题里的**章号升序**排（排序器是 `utils/toc.ts` 的 byChapter）——
 *   · 学习路线页：章号；页尾「同课程笔记」：章号。
 * 所以高数那 11 章写成 `1, 2, 7, 4, 3, 6, 5, 8, 9, 11, 10`（照依赖草图）没问题，
 * C++ 把「文件操作」放在「面向对象」前面也没问题 —— 读者看到的永远是 1、2、3…
 * 「先学谁」由各章的 `prereq` 表达（学习路线页会把它写成「先修 第 N 章」的标签）。
 *
 * 课程头的 `at: [列, 行]` 是当年图谱用的格位（作者 2026-10 的草图），
 * 图谱已下线（opinion-24），现在它只剩「记录作者当时怎么想的」这个作用：
 * 列号全图共用，所以同一个列号在两条带里落在同一条竖线上。
 *
 *        第 0 列              第 1 列                 第 2 列              第 3 列
 *                          ┌ Java程序设计基础              JavaWeb开发          系统基础与组成原理
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
    aliases: ['C++', 'CPP'],
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
    aliases: ['DSA', '数据结构', '数据结构与算法'],
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
    aliases: ['计网', '网络'],
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

  // ------------------------------------------------ 计算机系统基础与组成原理
  // 本校「计算机系统基础」（袁春风教材 8 章）为骨架，融合 408 计算机组成原理
  // 与 CSAPP 的内容（opinion-26）。为什么并成一门、以及三本书的章怎么对位，
  // 见根目录《内容规划-计算机系统基础与组成原理.md》。
  //
  // 章序 = 教材章序（1~7 跟书走）+ 408 独有的「总线」插在第 8 位 + I/O 收尾：
  //   1 概述 → 2 数据表示与运算 → 3 机器级表示 → 4 链接 → 5 程序的执行 →
  //   6 存储系统 → 7 异常控制流 → 8 总线（408 独有）→ 9 I/O 系统
  //
  // 写作约定（作者 2026-10 定）：
  //   · 骨架教材是袁春风，主线用 **IA-32**（跟课上、考试一致）；CSAPP 的 x86-64
  //     只在第 3 章末尾做对照表，Y86-64 只借它的数据通路/流水线画法。
  //   · 校验码不单独写：CRC / 海明码在《计算机网络-3 数据链路层》里讲。
  //   · CSAPP 第 5 章「优化程序性能」暂不进（以后自学再补进第 5 章或单开一节）。
  //   · CSAPP 第 11/12 章（网络编程、并发编程）**不进本系列** —— 归以后的「操作系统」笔记区。
  //   · 虚拟内存只讲「机制与地址翻译」（页表 / TLB / 缺页处理）；页面置换算法与
  //     内存管理策略归操作系统笔记区，两边交叉引用，别写两遍。
  //
  // ⚠️ 名字就是 subfield：改名会让 frontmatter 里 `subfield` 对不上的笔记从课程里掉出去。
  //    改的时候这门课还没有任何笔记，所以是零成本；以后有了笔记再改名要同步改所有 subfield。
  {
    id: '计算机系统基础与组成原理',
    discipline: 'cs',
    aliases: [
      '计组',
      '组成原理',
      '计算机组成原理',
      '系统基础',
      // 旧名也留着当检索词：脑子里想的还是「计算机系统基础」时也能搜到
      '计算机系统基础',
      'CSAPP',
    ],
    at: [3, 0],
    note: '数据的机器级表示 → 指令与执行 → 存储系统 → 总线与 I/O',
    chapters: [
      // 1~7 跟教材章序走；exam408 标的是「这一章在 408 里值多少」。
      { id: 'sys-1-overview', exam408: 'core' },
      { id: 'sys-2-data-representation', prereq: ['sys-1-overview'], exam408: 'core' },
      // 第 3 章要用到 C++ 的函数与指针（栈帧、地址计算），跨课程先修只做提示、不参与排序
      {
        id: 'sys-3-machine-level-programs',
        prereq: ['sys-2-data-representation', 'cpp-4-functions', 'cpp-6-pointers'],
        exam408: 'core',
      },
      // 链接是 408 不考的本校课特色章
      { id: 'sys-4-linking', prereq: ['sys-3-machine-level-programs'], exam408: 'off' },
      // 程序的执行 = 数据通路 + 控制器 + 流水线（408 的「中央处理器」整章）
      { id: 'sys-5-program-execution', prereq: ['sys-3-machine-level-programs'], exam408: 'core' },
      // 存储系统 = Cache + 主存/外存 + 虚拟内存（408 的「存储系统」整章）
      { id: 'sys-6-memory-system', prereq: ['sys-3-machine-level-programs'], exam408: 'core' },
      // 异常控制流：408 只考其中的「中断」，所以是 basic 而不是 core
      { id: 'sys-7-exceptional-control-flow', prereq: ['sys-5-program-execution'], exam408: 'basic' },
      // 总线：三本教材都不细讲，408 必考 —— 纯自学章
      { id: 'sys-8-bus', prereq: ['sys-6-memory-system'], exam408: 'core' },
      // I/O 系统 = I/O 硬件与 I/O 方式（408 核心）+ 系统级 I/O（408 不考，在本章后半）
      {
        id: 'sys-9-io-system',
        prereq: ['sys-7-exceptional-control-flow', 'sys-8-bus'],
        exam408: 'core',
      },
    ],
    // 不再标 planned：章序已经定好了（9 章全在「待发布」状态），
    // 课程卡片上显示「0/9 章」比显示「规划中」信息量大。
  },
  {
    id: 'Java程序设计基础',
    discipline: 'cs',
    aliases: ['Java', 'Java基础'],
    at: [1, 0],
    note: 'Java 语法与面向对象基础（先修，笔记规划中）',
    chapters: [],
    planned: true,
  },
  {
    id: 'JavaWeb开发',
    discipline: 'cs',
    aliases: ['JavaWeb', 'Web开发', 'Web'],
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
    aliases: ['高数', '微积分'],
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
    aliases: ['线代'],
    at: [0, 1],
    note: '矩阵与线性方程组、向量空间、特征值与二次型（笔记规划中）',
    chapters: [],
    planned: true,
  },
  {
    id: '概率论与数理统计',
    discipline: 'math',
    aliases: ['概率', '概统', '概率统计', '数理统计'],
    at: [1, 1],
    note: '随机变量与分布、数字特征、参数估计与假设检验（先修：高等数学；笔记规划中）',
    chapters: [],
    planned: true,
  },
  {
    id: '离散数学',
    discipline: 'math',
    aliases: ['离散'],
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

  // 计算机系统基础与组成原理 9 章：章序已定（opinion-26），笔记还没开始写。
  // 这些兜底标题让学习路线上先显示成灰色的「待发布」，等某章上线后会自动改用
  // frontmatter 里的真实标题；标题里的 `-N` 就是章号，路线与页尾都按它排序。
  'sys-1-overview': '计算机系统基础与组成原理-1 计算机系统概述',
  'sys-2-data-representation': '计算机系统基础与组成原理-2 数据的机器级表示与运算',
  'sys-3-machine-level-programs': '计算机系统基础与组成原理-3 程序的机器级表示',
  'sys-4-linking': '计算机系统基础与组成原理-4 程序的链接',
  'sys-5-program-execution': '计算机系统基础与组成原理-5 程序的执行',
  'sys-6-memory-system': '计算机系统基础与组成原理-6 存储系统',
  'sys-7-exceptional-control-flow': '计算机系统基础与组成原理-7 异常控制流',
  'sys-8-bus': '计算机系统基础与组成原理-8 总线',
  'sys-9-io-system': '计算机系统基础与组成原理-9 I/O系统',
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
