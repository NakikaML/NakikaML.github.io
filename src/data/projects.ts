/**
 * 项目页数据 —— 直接改这个文件就能更新「项目」页面。
 * 不需要懂代码，照着下面的格式往里加条目即可。
 */

export interface Project {
  /** 项目名 */
  name: string;
  /** 一句话定位 */
  tagline: string;
  /** 详细介绍，可以多段 */
  description: string;
  /** 我的角色 */
  role: string;
  /** 起止时间，例如 '2026.06 – 2026.07' */
  period: string;
  /** 状态 */
  status: '进行中' | '已完成' | '筹备中';
  /** 技术栈 / 关键词 */
  stack: string[];
  /** 外部链接（GitHub 仓库、Demo 等），没有就留空 */
  link?: string;
}

export const projects: Project[] = [
  {
    name: '外审专家管理系统',
    tagline: '为「极客工坊」设计的外审专家调度与管理系统',
    description:
      '参与温州人工智能高等研究院与温州大学联合创办的「极客工坊」项目，负责外审专家管理系统的设计与开发。系统用于管理外审专家信息、匹配评审任务并跟踪评审进度。',
    role: '开发成员',
    period: '2026.06 – 至今',
    status: '进行中',
    stack: ['数据库系统', 'Java', '需求分析'],
  },
  {
    name: '计算机系统能力大赛 · 数据库系统方向',
    tagline: '数据库系统实现赛道的参赛项目',
    description:
      '受学长邀请加入数据库系统方向参赛队伍，参与数据库内核相关模块的开发与调试。',
    role: '参赛队员',
    period: '2026 春季 – 至今',
    status: '进行中',
    stack: ['C/C++', '数据库内核', '存储引擎'],
  },
  {
    name: 'ACM 程序设计竞赛训练',
    tagline: '算法竞赛训练与题解复盘',
    description:
      '入选学校 ACM 集训队，持续进行算法训练，并把每场比赛的复盘整理成题解笔记，沉淀在「编程习题」板块中。',
    role: '集训队员',
    period: '2025 秋 – 至今',
    status: '进行中',
    stack: ['C++', '算法', '数据结构', 'STL'],
  },
  {
    name: '个人知识库系统',
    tagline: '一套可持续演进的结构化知识管理体系',
    description:
      '以 Obsidian 为载体，构建了覆盖计算机科学、语言学习、通识课程、编程习题等方向的结构化笔记体系，并通过自动化管线把其中可公开的部分发布成本站。',
    role: '独立设计与实现',
    period: '2025 – 至今',
    status: '进行中',
    stack: ['Obsidian', 'Markdown', 'Node.js', 'Astro'],
  },
];
