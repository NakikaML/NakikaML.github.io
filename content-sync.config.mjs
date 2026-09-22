/**
 * 内容同步规则配置
 * ------------------------------------------------------------------
 * 这个文件是「你的知识库」和「公开网站」之间唯一的闸门。
 *
 * 设计原则：默认关闭（opt-in）。
 *   只有明确列进 includeFolders 的目录才会被同步；不在名单里的一律不上网。
 *   想放什么上去，就打开对应的开关；不放心的，就别打开。
 *
 * 改完这个文件后运行： pnpm sync
 */

export const config = {
  /** Obsidian 库根目录 */
  vaultRoot: 'F:/MyKnowledgeBase/My Knowledge Base',

  /** 同步产物落盘位置（相对项目根） */
  outDir: 'src/content/notes',
  /** 笔记引用的图片复制到哪（相对项目根，会进 public/） */
  imageOutDir: 'public/notes-assets',

  /**
   * 白名单：vault 相对路径（可以是子目录）→ 站点分类。
   * 匹配规则：笔记路径 === key，或笔记路径以 `key/` 开头。最长匹配优先。
   *
   * `kind: 'moc'` 的会被网站当作「知识地图」单独归类，而不是普通笔记。
   *
   * ⚠️ 当前为**空**：网站不再从 Obsidian 直接提取任何笔记。
   *    给外人看的内容都需要重构，所以改由手写完成，
   *    直接放在 src/content/notes/ 下（见该目录的模板文件）。
   *
   * 想恢复「批量导入某目录」时，把对应行取消注释即可，例如：
   *   '03-ComputerScience': { label: '计算机科学' },
   *   '01-Home/MOC索引': { label: '知识地图', kind: 'moc' },
   *
   * 安全说明：同步只会删除「上次自己生成的文件」（记录在 .sync-manifest.json），
   *          你手写的笔记永远不会被它删掉。
   */
  includeFolders: {
    // ── 已全部关闭 ──
    // '03-ComputerScience': { label: '计算机科学' },
    // '04-GECourseNotes': { label: '通识课程' },
    // '05-ExtraLearning': { label: '拓展学习' },
    // '06-Figures': { label: '人物志' },
    // '07-Language': { label: '语言学习' },
    // '10-Application': { label: '编程习题' },
    // '01-Home/MOC索引': { label: '知识地图', kind: 'moc' },
  },

  /**
   * 硬黑名单：无论白名单怎么设，只要路径含这些片段就永不上网。
   * **不要删这一节** —— 它是防止误开开关的最后一道闸。
   */
  hardBlocklist: [
    '13-Other',            // 含明文 API 密钥文件
    'AI-API',
    '00-AIIO',             // 个人简介 / 成绩单 / 规划
    'AIIO-profile',
    '11-Templates',        // 模板没必要上网
    '12-Picture',          // 图片由管线按引用复制，不整目录搬
    '主页.md',             // Obsidian 主页插件配置
    'INBOX 增量暂存',
    '.trash', '.obsidian', '.claude', '.dsh',
  ],

  /**
   * 第二道闸：内容级密钥扫描。
   * 只要正文命中任一模式，整篇跳过并写进报告 ——
   * 防止密钥换个文件名又溜出去（这是纵深防御，不是替代黑名单）。
   */
  secretPatterns: [
    /sk-[A-Za-z0-9]{20,}/g,
    /ghp_[A-Za-z0-9]{20,}/g,
    /github_pat_[A-Za-z0-9_]{20,}/g,
    /AKIA[0-9A-Z]{16}/g,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
    /(?:api[_-]?key|secret|passwd|password|token)\s*[:=]\s*['"]?[A-Za-z0-9_\-]{24,}/gi,
  ],

  /**
   * frontmatter 级开关（写在你 Obsidian 笔记的头部）：
   *   publish: false   → 这篇不上网
   *   private: true    → 这篇不上网
   *   draft: true      → 这篇不上网
   *   publish: true    → 强制上网（即使在未开启的目录里）
   */
  frontmatterPrivateKeys: ['publish', 'private', 'draft'],

  /** 网站 URL 前缀（部署到子路径时填，例如 '/site'） */
  baseUrl: '',

  /** 单篇正文最大体积（字节），超过的跳过（多半是误粘贴的大文件） */
  maxNoteBytes: 400_000,
};

export default config;
