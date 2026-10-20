# Nakika 个人网站

网络工程在读 / B站配音与翻唱 UP主 —— 项目 · 博客 · 作品 · 学习笔记。

🌐 **线上地址：<https://nakikaml.github.io>**

**技术栈**：Astro 7 静态站点 + 一套自检脚本 + GitHub Actions 自动部署。

> **当前状态**：笔记（数据结构与算法 / C++程序设计基础 / 计算机网络 三门课）与作品集都已上线，
> 推送到 `main` 即自动部署；博客还是空的（只有模板），等你自己写。
> 内容全部手写，不从 Obsidian 搬运。（篇数用 `pnpm stamp` 看，或直接看站点。）

> 📖 **想改网站上的文字，看 [`编辑指南.md`](编辑指南.md)** ——
> 那份文件列出了「网站上哪句话在哪个文件里」，不用懂编程也能改。

---

## ⚠️ 第一件要知道的事：网站内容全部手写

**这个网站上的笔记不从 Obsidian 直接搬运。**

你的 Obsidian 知识库（1000+ 篇）是写给自己的速记 —— 跳步、自造缩写、只在本篇成立的上下文。
直接发布出去，读者看到的是天书。所以规则是：

> 放上网站的每一篇，都要重新写一遍。

同步脚本还在（`scripts/sync-vault.mjs`），但**白名单是空的**，
跑 `pnpm sync` 会同步出 **0 篇** —— 这是预期结果，不是坏了。

以后如果某个目录整理到真的适合直接公开，把 `content-sync.config.mjs` 里对应的行
取消注释就能重新开启。

---

## 目录

- [快速开始](#快速开始)
- [日常怎么用](#日常怎么用)
- [怎么加内容](#怎么加内容)
- [部署与更新流程](#部署与更新流程)
- [项目结构](#项目结构)
- [学习路线：搜索 + 学科标签页](#学习路线搜索--学科标签页opinion-24--opinion-25)
- [踩过的坑与修复记录](#踩过的坑与修复记录)
- [已知问题与待办](#已知问题与待办)

---

## 快速开始

```bash
pnpm install      # 装依赖（只需一次）
pnpm dev          # 本地预览 → http://localhost:4321
pnpm release      # 构建 + 自检（推荐日常用这个）
pnpm preview      # 预览构建产物
```

| 命令 | 作用 |
| :--- | :--- |
| `pnpm build` | 同步 + 构建（同步当前是空操作） |
| `pnpm verify` | 检查产物：页面齐全 / 公式渲染 / 图片完整 / 体积构成 |
| `pnpm check:math` | 检查公式定界符合法性 |
| `pnpm test:callout` | `remark-callout` 的回归测试（例题内嵌块的围栏配对 / 标题拆分） |
| `pnpm check:live` | 检查线上站点 13 个关键点 |
| `pnpm stamp` | 列/写笔记的「最后更新」日期（见下方「最后更新」一节） |
| `pnpm sync` | 从 Obsidian 同步（当前白名单为空，输出 0 篇） |
| `pnpm sync:dry` | 同步演练，不写任何文件 |
| `node scripts/smoke-test.mjs` | 对本地运行中的站点跑 HTTP 冒烟测试 |

> **Windows 提示**：若 PowerShell 报「禁止运行脚本」，把 `pnpm` 换成 `pnpm.cmd`。
>
> **TLS 提示**：本机有 TLS 中间层，Node 访问外网需要加 `--use-system-ca`
> （`pnpm check:live` 已注明）。

---

## 日常怎么用

```
① 写内容 → 直接新建 .md 文件（笔记 / 博客 / 作品）
        ↓
② pnpm release        （构建 + 自检）
        ↓
③ git push            （自动部署，约 2 分钟生效）
```

---

## 怎么加内容

### 📝 加一篇网站笔记

在 `src/content/notes/` 新建 `.md`。**参考现成模板 `_模板-网站笔记.md`**（复制改名即可）。

```markdown
---
title: JVM 内存模型到底在讲什么
description: 一句话摘要，显示在卡片上。不填会从正文自动截取。
category: 计算机科学          # 会出现在筛选按钮里
date: "2026-09-22"           # 加引号更保险
updated: "2026-10-05"        # 可选：回头补充/订正过才填，见下
tags: [Java, JVM]
draft: true                  # ← 改成 false 才会发布
---

正文正常写 Markdown。
```

其他可用字段：`difficulty`（难度）、`featured`（首页精选）、`subject` / `subfield` / `topic`（分层归类的细粒度字段）。

> `subfield` 写课程名（如 `数据结构与算法`）时，这篇笔记就归到那门课里 ——
> 页尾的「同课程笔记」列表按它分组（见 `bug及意见汇总.md` 的 opinion-8）。

**笔记文件名就是 URL**，用英文小写 + 连字符最稳（如 `jvm-memory-model.md`）。

#### 最后更新（opinion-11）

`date` 是「这篇写给哪个时间点」，`updated` 是「我最后一次补充/订正它是什么时候」。
两者都填、且 `updated` 比 `date` 晚时，页面才会多出更新标记：

| 位置 | 没更新过 | 更新过 |
| :--- | :--- | :--- |
| 笔记详情页页头 | `发布于 2026-09-22` | `发布于 2026-09-22` ＋ `已更新 更新于 2026-10-05` |
| 笔记卡片（列表/首页） | `2026-09-22` | `↻ 更新于 2026-10-05`（绿色） |
| 首页「最近更新」排序 | 按 `date` | 按 `updated`（补写过的旧笔记会重新冒到前面） |

所以改完一篇旧笔记、打上 `updated`，读者就能看出这篇是新的，而不是以为标过日期就再没动过。

```bash
pnpm stamp                                  # 只看：列出每篇的 date / updated 现状
pnpm stamp cpp-1-basics                     # 写上今天的日期
pnpm stamp cpp-1-basics 2026-10-05          # 或指定日期
pnpm stamp cpp-1-basics --unset             # 摘掉这个字段
```

> `updated` 不比 `date` 晚时**不会显示**（判定见 `src/utils/notes.ts` 的 `noteUpdated`），
> 避免出现「标了个没信息量的更新日期」。`pnpm stamp` 会直接拦住这种写法。
> 构建时由 `pnpm verify` 的第 4e 项兜底：字段写了却没渲染出来会报错。

> 🚫 **正文里不要手写指向别的笔记的链接**（`[文字](/notes/xxx/)`）——直接写标题字面就行
> （例如「见 C++程序设计基础-6 指针」），要跳转由页面上的导航负责。
>
> ✅ **页尾的「同课程笔记」（opinion-8）** 会自动把整门课列出来并高亮正在读的这一篇：
> 课程顺序、章名、哪些章还没写，全部来自 `src/data/curriculum.ts`（与「学习路线」页同一份数据）。
> 所以想让它出现在课程列表里 → 把那篇挂进对应课程的 `chapters`；
> 挂进去但还没写的章会显示成灰色的「待发布」。
> 「上一篇 / 下一篇」、本页目录、分类与标签跳转也都在。
> （当初摘掉的是**按标签算**的那块「相关笔记」，见 opinion-10。）

> ⚠️ **写多行公式时把 `$$` 单独放一行。**

#### 例题内嵌块（opinion-22）

例题不再写成「一行加粗引用 + 一堆正文」，而是整块包进 `:::example … :::`，
渲染成「角标（例 N）+ 标题 + 正文」的内嵌块（视觉参考 Obsidian 的 callout）：

```markdown
:::example 例 1 · 求数组最大值
找出数组 `{300, 350, 200, 400, 250}` 中的最大值。

**思路**：……
**解**：……
:::
```

- 同一个写法还支持 `:::tip`（提示）、`:::warning`（易错）、`:::note`（说明）、
  `:::summary`（小结）、`:::quote` / `:::info` / `:::danger`。
  例题是青碧绿，警告系是绯朱红，其余用暖橙金 —— 与正文里原有的引用块（暖橙金）区分开。
- **从 Obsidian 粘过来的 `> [!example] 例 1` 也认**，渲染结果完全一致。
- 收尾的 `:::` 忘了写不会吃掉整篇：会在下一个标题前自动收住并打印警告；
  `pnpm verify` 的第 4h 项还会兜住「源码有围栏、产物没有 callout」和残留标记。
- 实现：`scripts/remark-callout.mjs`（remark 阶段重组节点，靠 `data.hName` 落地成 div），
  样式在 `global.css` 的 `.callout` 一节，回归测试 `pnpm test:callout`。
- 现有 132 道例题是用 `scripts/migrate-example-callouts.mjs` 批量改写的
  （边界规则、以及 4 处「题后跟着换话题正文」的手工截断都写在那份文件里；
  再跑一次是空操作，可以放心当文档看）。
- ⚠️ 「下载原文 .md」给的是**磁盘上的原文**，所以里面保留的就是 `:::example` 围栏 ——
  Obsidian 不认这套写法（它认 `> [!example]`），读者在 Obsidian 里会看到字面的 `:::`。
  想让下载件在 Obsidian 里也是 callout，正文就按 `> [!example]` 写，站点渲染结果一样。

### ✍️ 加一篇博客

在 `src/content/blog/` 新建 `.md`，格式与笔记类似，字段为
`title` / `description` / `date` / `updated`（可选，同笔记的「最后更新」）/ `tags` / `draft`。

### 🎙️ 加一个作品

在 `src/content/works/` 新建 `.md`。同目录下有三个现成模板：
`_模板-配音.md`、`_模板-翻唱.md`、`_模板-知识分享.md`。

```markdown
---
title: 作品名
type: 配音              # 配音 / 翻唱 / 知识分享 / 其他
platform: Bilibili
url: https://www.bilibili.com/video/BVxxxxxxxxxx
cover: /works/cover.jpg # 封面图放 public/works/ 下
date: 2026-01-01
description: 一句话介绍
featured: true          # 首页精选
draft: false
---
```

> **首页精选怎么算**：首页最多显示 3 件作品，标了 `featured: true` 的排在前面；
> 不足 3 件时用最新作品自动补齐（一件都没标就是最新 3 件）。
> `pnpm run import:bili --update` 重新导入时会保留你手填的 `featured`，不会被覆盖。

### 🗂️ 加一个项目

编辑 `src/data/projects.ts`，照着现有条目加。

### 🖼️ 插图

放到 `public/notes-assets/`，然后在笔记里写 `![说明](/notes-assets/你的图.png)`。

插图的几件事是**自动**的，不用手写 HTML：

| 自动发生什么 | 谁在做 |
| :--- | :--- |
| 补 `loading="lazy"`，长文不会一进页面就下完整篇的图 | `scripts/rehype-image-figure.mjs` |
| 从图片文件头读出宽高写进 `width`/`height`，图片没加载完也先占好位置（不抖） | 同上 |
| 独占一段的图被包成 `<figure>`，右上角多一个「放大」按钮，点了全屏看原图 | 同上 + `BaseLayout.astro` 里的 `<dialog>` |

图片说明（alt）会顺手当成全屏看时的图注，所以别写「图片1」这种，写「BFS 遍历过程（一）」。

笔记详情页右上角还有一个「**下载原文 .md**」，下载的是这篇笔记的完整 Markdown
（连 frontmatter 一起），由 `src/pages/notes/[id].md.ts` 在构建时产出。

---

## 部署与更新流程

| 项目 | 值 |
| :--- | :--- |
| 仓库 | <https://github.com/NakikaML/NakikaML.github.io> |
| 线上地址 | <https://nakikaml.github.io> |
| 托管 | GitHub Pages（Source = GitHub Actions） |
| 自动部署 | 推送到 `main` 即触发 `.github/workflows/deploy.yml` |
| 构建机 | Ubuntu + Node 24 + pnpm（版本取自 `packageManager` 字段） |

> ⚠️ **仓库名必须叫 `NakikaML.github.io`**。
> GitHub Pages 的「用户站点」规则要求仓库名 = `用户名.github.io`，站点才在根路径 `/`。
> 换成普通项目仓库，站点会落到 `/<仓库名>/` 子路径，页面里所有 `/notes/...` 绝对链接都会失效。

### 更新站点

```bash
pnpm release
git add -A && git commit -m "更新内容" && git push
```

推送后约 2 分钟生效，可在 [Actions 页面](https://github.com/NakikaML/NakikaML.github.io/actions) 看进度。

### 自查线上状态

```bash
pnpm check:live
```

检查 13 个关键点：各页面 HTTP 状态、内容特征、KaTeX 渲染、中文 URL、404 行为。

---

## 项目结构

```
Nakika-Personal-Website/
├── content-sync.config.mjs   Obsidian 同步闸门（当前白名单为空 = 关闭）
├── astro.config.mjs          站点配置（域名、KaTeX、callout、sitemap、picomatch 垫片）
├── pnpm-workspace.yaml       构建脚本白名单
│
├── scripts/
│   ├── sync-vault.mjs        Obsidian 同步管线（当前停用，代码保留）
│   ├── verify-build.mjs      产物自检（最后更新字段 / 同课程笔记列表 / 图片与链接…）
│   ├── stamp-updated.mjs     给笔记打「最后更新」日期（pnpm stamp）
│   ├── rehype-code-meta.mjs  代码块：语言标签 + 复制按钮
│   ├── remark-callout.mjs    例题 / 提示内嵌块（`:::example … :::`，opinion-22）
│   ├── test-callout.mjs      上面那个插件的回归测试（围栏配对 / 标题拆分）
│   ├── migrate-example-callouts.mjs 一次性迁移脚本：旧例题 → 内嵌块（已跑完）
│   ├── rehype-image-figure.mjs 正文图片：懒加载 / 尺寸占位 / 放大按钮
│   ├── test-image-size.mjs   上面那个插件的回归测试（含各图片格式的尺寸解析）
│   ├── check-math-delims.mjs 公式定界符检查
│   ├── check-live.mjs        线上站点可用性检查
│   └── smoke-test.mjs        本地 HTTP 冒烟测试
│
├── .github/workflows/
│   └── deploy.yml            推送到 main 即自动部署
│
├── shims/
│   └── picomatch-esm.mjs     CJS/ESM 互操作垫片（见「踩过的坑」）
│
├── src/
│   ├── site.config.ts        站点信息（名字、导航、社交链接）
│   ├── content.config.ts     三个内容集合的 schema
│   ├── content/
│   │   ├── notes/            ✍️ 手写网站笔记（含模板文件）
│   │   ├── blog/             ✍️ 手写博客
│   │   └── works/            ✍️ 手写作品（含三个模板）
│   ├── data/projects.ts      ✍️ 项目数据
│   ├── data/curriculum.ts    ✍️ 学科分野 + 课程顺序 + 先修（学习路线 + 页尾「同课程笔记」共用）
│   ├── utils/notes.ts        共用工具函数
│   ├── utils/course-series.ts 页尾「同课程笔记」列表（opinion-8）
│   ├── utils/learning-route.ts 「学习路线」页的三层结构装配（opinion-24）
│   ├── layouts/BaseLayout.astro
│   ├── components/           Header / Footer / 卡片
│   ├── styles/global.css     全站样式
│   └── pages/
│       ├── index.astro       首页（只展示有内容的板块）
│       ├── about.astro       关于我
│       ├── notes/            笔记列表 + 详情（外加详情页的可下载 .md 原文、学习路线页）
│       ├── blog/             博客
│       ├── works/            作品集
│       ├── projects.astro    项目
│       ├── 404.astro
│       └── rss.xml.ts        RSS
│
└── public/
    ├── favicon.svg
    ├── robots.txt
    └── notes-assets/         笔记插图（手放）
```

---

## 关于 Obsidian 同步管线（当前停用）

### 为什么停用

笔记是写给自己的 —— 跳步、自造缩写、只在本篇成立的上下文，直接搬上来读者看到的是天书。
所以每一篇放上网站的都重写过（这也是笔记板块更新慢的原因）。

### 想重新开启时

编辑 `content-sync.config.mjs`：

```js
includeFolders: {
  '03-ComputerScience': { label: '计算机科学' },   // 取消注释即开启
},
```

然后 `pnpm sync`。

### 安全机制（重新开启后依然有效）

| 层级 | 配置项 | 作用 |
| :--- | :--- | :--- |
| ① 白名单 | `includeFolders` | **只有**列出的目录会被同步 |
| ② 硬黑名单 | `hardBlocklist` | 无论白名单怎么设，命中就永不上网 |
| ③ 密钥扫描 | `secretPatterns` | 正文命中密钥特征 → 整篇跳过并报警 |
| ④ 单篇开关 | frontmatter | `publish: false` / `private: true` / `draft: true` |

**关于删除安全性**：同步脚本**不会**再整目录清空输出目录。
它只删除 `.sync-manifest.json` 里记录的、自己上次生成的文件，
**你手写的笔记永远安全**（这是踩过坑后专门改的，见下方 #9）。

---

## 踩过的坑与修复记录

### 1. `picomatch` 的 CJS/ESM 互操作崩溃

- **现象**：`astro sync` / `astro build` 失败，报 `require is not defined`，栈指向 `picomatch/index.js`。
- **原因**：`picomatch` 是 CJS 包，但 `@astrojs/internal-helpers` 用 ESM 语法默认导入它；pnpm 严格目录布局 + Vite 8 模块运行器下被当 ESM 内联执行。
- **修复**：`shims/picomatch-esm.mjs` 用 `createRequire` 走 Node 原生 CJS 路径，通过 `resolve.alias` 挂上；并把 `picomatch` 加成直接依赖。

### 2. Astro 7 换了默认 Markdown 处理器

- **修复**：安装 `@astrojs/markdown-remark`，改用 `markdown.processor: unified({ remarkPlugins, rehypePlugins })`。

### 3. 跨行 `$$` 公式的定界符被吞

- **现象**：公式渲染成红色错误文字，报 `Expected 'EOF', got '&'`。
- **原因**（remark-math 实测确认）：只有当 `$$` 后面只剩空白时，remark-math 才认它是块级公式。写成 `$$\begin{aligned}` 且跨行时，`\begin{aligned}` 被当普通文本吞掉，公式里只剩 `&` 对齐符。**与引用块无关**。
- **修复**：同步时自动把跨行公式的定界符挪到独立行（保留 `> ` 前缀），单行 `$$x$$` 不动。
- **手写时的建议**：**把 `$$` 单独放一行。**

### 4. 代码块语言大小写导致语法高亮丢失

- **原因**：Shiki 语言 id **区分大小写**，```` ```Java ```` 会被当成未知语言静默退化成纯文本。
- **修复**：同步时统一小写并映射别名。

### 5. pnpm 11 的配置迁移

- **修复**：配置从 `package.json` 的 `pnpm` 字段搬到 `pnpm-workspace.yaml`，语法改为 `allowBuilds`。

### 6. Mermaid 图整站不渲染（bug-17）

- **现象**：含 ```` ```mermaid ```` 的页面全部只剩灰色代码块（带「Mermaid」标签和复制按钮），
  而且**全站一起坏**，构建完全正常、控制台之外看不出异常。
- **成因一 · 依赖预打包**：`BaseLayout` 里的 mermaid 是**运行时**才 `await import('mermaid')` 的，
  Vite 启动时扫源码看不到它；第一次渲染图才「发现新依赖」→ 中途重新预打包 → 已经发出去的页面
  还指着旧 hash 的 URL（`/node_modules/.vite/deps/mermaid.js?v=旧hash`）→ **504 Outdated Optimize Dep**
  → 动态 import 抛错 → 被 catch 接住 → 静默回退成代码块。
  **修复**：`astro.config.mjs` 里 `optimizeDeps.include: ['mermaid']`，依赖图在启动时一次算定。
  排查判据：控制台搜 `Outdated Optimize Dep`；`node_modules/.vite/deps/_metadata.json` 的
  `optimized` 里必须有 `mermaid`。（⚠️ 别改成 `exclude`——mermaid 的 CJS 依赖 dayjs 会被原样发到
  浏览器，报 `does not provide an export named 'default'`。）
- **成因二 · 多图互相污染**：用 `mermaid.run()` 批量渲染时，mermaid 的图表数据库是**模块级单例**，
  一页多图就会出现「第 2 张把第 3 张的节点一起画了、第 3 张变成没有 viewBox 的空 SVG」，
  而且每张都带 `data-processed`，**不报错**。
  **修复**：改成逐张 `await mermaid.render(id, text)`，自己把返回的 svg 字符串塞进容器。
- **以后要验证**：改动 mermaid 相关代码后，光看构建结果不够，得真的开一次页面
  （或用 `msedge --headless=new --dump-dom` 抓 JS 执行后的 DOM，检查 `.mermaid > svg` 有没有 `viewBox`）。

### 6. Astro 遥测写入用户目录

- **修复**：设 `ASTRO_TELEMETRY_DISABLED=1`，或跑 `npx astro telemetry disable`。

### 7. pnpm 版本被声明了两次，首次部署第一步就失败

- **现象**：CI 在 `Run pnpm/action-setup@v4` 直接失败，后续全部跳过。
- **原因**：`package.json` 的 `packageManager` 与 workflow 的 `with: version` 同时指定。
- **修复**：删掉 workflow 里的 `version`。**两者只能留一个。**

### 8. 本机 TLS 中间层导致 Node / git 证书校验失败

- **现象**：Node `fetch` 报 `UNABLE_TO_VERIFY_LEAF_SIGNATURE`；`git push` 报 `schannel: SEC_E_NO_CREDENTIALS`。
- **修复**：Node 加 `--use-system-ca`；git 保持系统默认 schannel 后端（**不要**改成 openssl）。
- **注意**：本机环境问题，不影响 GitHub Actions。

### 9. 同步脚本会整目录清空 —— 差点删掉手写笔记

- **现象**（潜在风险，已消除）：旧版 `sync-vault.mjs` 在落盘前执行
  `fs.rmSync(OUT_DIR, { recursive: true, force: true })`，会**清空整个 `src/content/notes/`**。
- **后果**：一旦开始往这个目录手写笔记，跑一次 `pnpm sync` 就会把之前手写的全删掉。
- **修复**：改为**按清单精确删除** —— 同步时把生成的文件名写入 `.sync-manifest.json`，
  下次只删这个清单里记录的旧产物。手写文件不在清单里，永远不受影响。

### 10. 手写笔记的日期导致 schema 校验失败

- **现象**：新建笔记写 `date: 2026-09-22`（没加引号），构建报
  `InvalidContentEntryDataError: notes → xxx data does not match collection schema`。
- **原因**：YAML 会把不加引号的 `2026-09-22` 解析成 **Date 对象**，而 schema 要求字符串。
- **修复**：schema 用 `z.preprocess` 兼容两种写法（Date 自动转成 `YYYY-MM-DD` 字符串）。
  模板里也改成了加引号的写法。

### 11. 代码里的 `!=` 显示成 `≠`（编程连字，不是字符被改）

- **现象**：笔记里 `if (maxIdx != i)` 在页面上显示成 `if (maxIdx ≠ i)`，像是构建管线改了字符。
- **真相**：**字符一直是 `!=`**（源文件与产物 HTML 里的 `!=` 数量逐篇核对一致；复制出来也是 `!=`）。
  是**字体连字**在骗眼睛 —— 等宽编程字体（JetBrains Mono / Cascadia Code / Fira Code）默认会把
  `!=` 合成 `≠`、`>=` 合成 `≥`、`->` 合成 `→`。本机装了 Cascadia Code，而 `--font-mono` 的第一个
  候选 JetBrains Mono 没装，于是代码就落到了 Cascadia Code 上。
- **修复**：`global.css` 里对 `pre / code / kbd / samp / .code-block` 关掉连字
  （`font-variant-ligatures: none` + `font-feature-settings: "liga" 0, "clig" 0, "calt" 0, ...`）。
  **`calt` 必须一起关** —— 这几个字体的连字主要挂在 calt（上下文替代）上，只关 `liga` 不生效。
- **验收方式**（不是靠肉眼猜）：把截图里的那段代码 + 站点真实 CSS 拼成一个临时 HTML，
  用 headless Chrome 渲染 A/B 两组 —— 关连字组显示 `!=`，强制打开连字组显示 `≠`。
- **注意**：这只修网站。**Obsidian 的阅读视图有自己的字体设置**，那边的连字要去
  `设置 → 外观 → 等宽字体` 里处理，跟本站无关。

### 12. `:::` 围栏被 markdown 吞进清单 / 表格里（opinion-22 期间踩到）

- **现象**：例题框在页面上变成一行字面的 `:::example 例 1 · …`，收尾的 `:::` 没了，
  构建时只在终端里留下一条 `[callout] xxx.md:211 没有找到收尾的 :::`。
- **原因**：CommonMark 的**惰性续行**。围栏前后没有空行时，紧跟在清单 / 引用块后面的
  `:::` 会被当成**最后一个列表项的续行**（跑进 `<li>` 里）；GFM 表格更狠，
  会把它当成**新的一行**（`<td>:::</td>`）。两种情况下围栏都和外层的开围栏不在同一层。
- **修复**：`scripts/remark-callout.mjs` 里分两步处理：先把「一行围栏」从所在的段落里
  拆出来（`explodeFences`），再把被吞进容器末尾的围栏一层层提回同级
  （`hoistTrailingFences`，清单 / 引用块 / 表格都覆盖）。这两个行为都有回归测试。
- **写的时候仍然建议**：`:::` 前后各留一个空行。插件能救回来，但不该指望它每次都救。

---

## 学习路线：搜索 + 学科标签页（opinion-24 / opinion-25）

`/notes/route/` 是笔记库的总纲：**搜索框 + 学科标签页 + 学科内的课程标签 + 一次只显示一个学科的目录**
（分野 → 课程 → 章节）。它取代了原来的知识图谱 `/notes/graph/`（理由见下面「为什么不再画图」）。

```
计算机科学（cs · 暖橙金）   C++程序设计基础 → 数据结构与算法 → 计算机网络 / 计算机系统基础与组成原理
                          Java程序设计基础 → JavaWeb开发
数学（math · 青碧绿）       高等数学 → 概率论与数理统计
                          高等数学 + 线性代数 → 离散数学
跨学科                    离散数学 → 数据结构与算法
```

- **上面搜（全局）**：按标题、课程名、英文缩写搜，范围是**全部学科**，不受当前标签页限制。
  课程条目点了跳到那门课、章节条目直接进那篇笔记；待发布 / 规划中的条目是灰行、不可点。
  缩写来自两处 —— `curriculum.ts` 里课程的 `aliases`（`DSA` / `计网` / `线代`…），
  以及每篇笔记的 id（`dsa-3-stack-and-queue` 也能被 `dsa` 命中）。
  索引是 `routeSearchIndex()` 在构建时算好、内联成 `<script type="application/json" id="route-index">`，
  前端只做 `includes` 过滤，不另开接口。
- **下面切（一次一科）**：一屏只显示一个学科的目录，`计算机科学` / `数学` … 点标签切换。
  加新学科只是多一个标签，页面不会越滚越长，手机端一屏就看得到完整的一科 ——
  opinion-25 就是为了这个改的（旧版把所有学科依次排开，手机上一屏根本看不完）。
- **再下一层是课程标签（必选，没有「全部」）**：选中学科后，下面是一排课程
  （`C++程序设计基础` / `数据结构与算法` / `计算机网络`…，各带 `已上线/计划 章`），
  点一门就**只显示那一门课**的章节。进学科会默认选中**第一门课** —— 也就是依赖深度最靠前、
  最该先学的那门，所以下方永远有且只有一门课的内容，不会出现一堆卡片或一片空白。
  两层用两套颜色（学科 = 分野色，课程 = 主题色），不会看成同一层。
  网址也跟着走：`#course-3` 是某一门课，`#cs` 也认（落到计算机科学的第一门课），
  刷新和分享都回到同一状态。
- **数据**：`src/data/curriculum.ts`（`disciplines` / `courses` / `courseDeps` / `aliases`）。
- **装配**：`src/utils/learning-route.ts` —— `learningRoute()` 出三层结构，
  `routeSearchIndex()` 把整条路线摊平成搜索索引。页面（`src/pages/notes/route.astro`）只负责渲染，
  顺序在数据层算好：分野照 `disciplines`，课程在分野内按**依赖深度**，章节按**章号升序**。
- **先修分两级**：课程卡片上写「先修课程」（跨学科的多一个「跨学科」角标，点了会切到那个学科再滚过去）；
  每一章下面写「先修 第 N 章」（跨课程的写成「C++程序设计基础 · 7」），悬停有完整说明。
- **408 考研权重**（opinion-26）：章的 `exam408: 'core' | 'basic' | 'off'` 会在章行上变成角标 ——
  `core` 是红色「408」、`basic` 是灰色「408·了解」、`off` 不标。
  它同时进搜索索引：搜 **`408`** 筛出全部考点章、搜 **`408核心`** 只出重点章。
  目前只有《计算机系统基础与组成原理》那 9 章标了，别的课不填就没有角标。
- **配色**：`--disc-<key>-soft / -line / -text`，浅色与深色各一套（`cs` 暖橙金、`math` 青碧绿）。
  页面把这三个变量挂在分野元素上，CSS 一律读变量并带 `var(--disc-line, …)` 回退 ——
  **加一个新学科只要在 CSS 补三行色值，样式表一个字都不用改**。
- **进度**：每门课右上角 `已上线/计划 章`，下面一条 3px 细线；灰行 = 计划内还没写完（标「待发布」）。
- **兜底**：笔记上线了却忘挂进 `curriculum.ts` 时不会从路线上消失 —— 同课程的补在该课程末尾并标
  「未编入路线」，连课程都对不上的落到页面底部「其他笔记」。
- **渐进增强**：标签页和搜索框只在 `html.has-js` 下出现 —— 没有 JS 时不会露出点了没反应的按钮，
  所有学科的目录会依次排开、页内锚点照样能用；首屏默认激活第一个学科，且 `is-active`
  是**服务端写死的**，脚本跑到之前也不会白屏。
- **`pnpm verify` 的【4i】兜六件事**：标签页与面板一一对应、课程标签与课程卡片一一对应、
  每篇已上线笔记在路线上都有入口、搜索索引真的内联进去了、`has-js` 开关还在、
  交互脚本真的随页面发了出去。
- **旧地址**：`/notes/graph/` 由 `astro.config.mjs` 的 `redirects` 生成一个 meta refresh 页，
  老书签照样落到新页面；`pnpm verify` 与 `check-live` 都会盯住这一条。

### 为什么不再画图

图要回答的其实只有一件事 —— 先学什么、再学什么。这件事用一份带章号的有序列表说得更清楚，
而且列表在手机、窄屏、Ctrl+F、屏幕阅读器上全都是赢的。图的成本却是实打实的：
旧版 `graph.astro` 一个文件近 1500 行手写 SVG（依赖分层 + 重心排序 + 正交折线 + y 车道分配 +
跨带绕行），bug-8~15 里七条都是它；最小缩放写死 0.3 倍，再加两个学科分野就开始看不清 ——
**「越来越乱」的真身是这个天花板，不是笔记变多**（节点只来自手写的 `curriculum.ts`，
新写一篇笔记并不会让图上多出十根线）。想回看当时的做法，去 git 历史里翻 `graph.astro`。

## 已知问题与待办

### 1. 笔记板块仍在陆续补内容

`src/content/notes/` 下的都是重写过的公开版（DSA-1~8、CPP、CN-1~2、高等数学 1~11，会继续一篇篇加）。
**还没写完的仍是 `draft: true`** —— 只有 `pnpm dev` 里看得到，写完把 `draft` 改成 `false` 即可上线。
想确认当前哪几篇还是草稿：看 `pnpm dev` 列表页顶部的提示条，或搜 frontmatter 里的 `draft: true`。
笔记页的「目前还没有内容」空状态只在真的一篇都没有时才会出现。

> 高等数学那 11 篇是从知识库整体搬过来的**第一批成体系的非计算机笔记**
> （2026-10 转换，全部 `draft: true`，等作者逐篇审阅后转正）。
> 它们同时验证了「数学」这个新分野在学习路线里的分组与配色 —— 见上面「学习路线」一节。

### 2. 作品集

`src/content/works/` 里的作品已按 `date` 倒序发布，封面图在 `public/works/`。
`_模板-*.md` 是给人复制用的模板，以下划线开头，任何模式下都不会出现在网站上。
以后再从 B站 拉新投稿：`pnpm import:bili`（读根目录的 `bili-works*.json`），
跑完记得扫一眼它生成的 `bili-import-report.md` 核对 `type` 猜得对不对。

### 3. 联系方式（已填全）

`src/site.config.ts` 的 `links` 里 B站 / GitHub / 合作 QQ / 邮箱 / RSS 都已填好。
合作 QQ 号要改时**同时改两处**：`links.qq` 的 `uin=` 和 `qqNumber`（前者是链接、后者是页面上显示的数字）。

### 4. 🚨 知识库里有明文 API 密钥，建议轮换

```
F:\MyKnowledgeBase\My Knowledge Base\13-Other\其他杂项\AI-API.md
→ DeepSeek ×1、极客工坊 DeepSeek ×2、MinerU ×1
```

这个文件在同步黑名单里，**从未也不会**出现在网站上。但密钥本身仍以明文存在磁盘上，
建议尽快轮换，以后改用环境变量或密码管理器。

### 5. Mermaid 需要客户端渲染

含 Mermaid 图的页面首次加载会拉约 1 MB 的 JS（已按需拆包）。
介意的话可以改成构建时预渲染。

### 6. 学习路线取代了知识图谱（opinion-24）

`/notes/graph/` 已下线，换成 `/notes/route/`（学习路线：学科分野 → 课程 → 章节）。
数据仍来自 `curriculum.ts`，页面自动生成，旧地址留了 meta refresh 重定向。
为什么不再画图、加新学科要改哪两处，见上面「学习路线：学科分野与课程顺序」一节。
