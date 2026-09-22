/**
 * 站点级配置 —— 改这里就能改全站信息，不用翻组件。
 * 带 TODO 的地方需要你填自己的真实信息。
 */

export const site = {
  /** 显示名（顶栏 / 页脚 / 版权） */
  name: '鸣鹿Nakika',

  /** 顶栏 Logo 里的字，1~2 个字符最好看 */
  mark: 'N',

  /** 默认 SEO 描述（显示在搜索结果和分享卡片里） */
  description:
    '网络工程在读 / B站配音与翻唱 UP主。这里放我的项目、文章与创作作品。',

  /** 站点语言 */
  lang: 'zh-CN',

  /** 作者署名（页脚版权用）。想跟顶栏显示名一致就写一样的。 */
  author: '鸣鹿Nakika',

  // ---------------------------------------------------- 联系方式
  // 留空字符串则不在页脚显示对应链接。
  links: {
    email: 'nakika0511@outlook.com',
    bilibili: 'https://space.bilibili.com/451932330',
    github: 'https://github.com/NakikaML',
    rss: '/rss.xml',
  },

  /** 顶栏导航 */
  nav: [
    { href: '/', label: '首页' },
    { href: '/about/', label: '关于我' },
    { href: '/notes/', label: '笔记' },
    //{ href: '/maps/', label: '知识地图' },
    { href: '/blog/', label: '博客' },
    { href: '/works/', label: '作品' },
    { href: '/projects/', label: '项目' },
  ],
} as const;

export type Site = typeof site;
