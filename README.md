# Nakika 个人网站

网络工程在读 / B站配音与翻唱 UP主 —— 项目 · 博客 · 作品 · 学习笔记。

🌐 **线上地址：<https://nakikaml.github.io>**

**技术栈**：Astro 7 静态站点 + 一套自检脚本 + GitHub Actions 自动部署。

> **当前状态**：内容已全部改为手写，笔记/博客/作品板块暂时为空（等你自己写）。
> 仓库刚重建过，**代码尚未推送** —— 推送到 `main` 后线上地址即恢复。

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
| `pnpm check:live` | 检查线上站点 13 个关键点 |
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
tags: [Java, JVM]
draft: true                  # ← 改成 false 才会发布
---

正文正常写 Markdown。
```

其他可用字段：`kind`（`note` 默认 / `moc` 知识地图）、`difficulty`、`featured`（首页精选）。

**笔记文件名就是 URL**，用英文小写 + 连字符最稳（如 `jvm-memory-model.md`）。

> ⚠️ **写多行公式时把 `$$` 单独放一行。**

### ✍️ 加一篇博客

在 `src/content/blog/` 新建 `.md`，格式与笔记类似，字段为
`title` / `description` / `date` / `tags` / `draft`。

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

### 🗂️ 加一个项目

编辑 `src/data/projects.ts`，照着现有条目加。

### 🖼️ 插图

放到 `public/notes-assets/`，然后在笔记里写 `![说明](/notes-assets/你的图.png)`。

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
├── astro.config.mjs          站点配置（域名、KaTeX、sitemap、picomatch 垫片）
├── pnpm-workspace.yaml       构建脚本白名单
│
├── scripts/
│   ├── sync-vault.mjs        Obsidian 同步管线（当前停用，代码保留）
│   ├── verify-build.mjs      产物自检
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
│   ├── utils/notes.ts        共用工具函数
│   ├── layouts/BaseLayout.astro
│   ├── components/           Header / Footer / 卡片
│   ├── styles/global.css     全站样式
│   └── pages/
│       ├── index.astro       首页（只展示有内容的板块）
│       ├── about.astro       关于我
│       ├── notes/            笔记列表 + 详情
│       ├── maps/             知识地图
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

笔记是写给自己的，直接搬运对读者没有价值。详见博客文章
《[为什么我要做一个个人网站](/blog/why-i-built-this-site/)》。

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

---

## 已知问题与待办

### 1. 笔记板块目前是空的

这是有意为之。首页和笔记页都会显示「正在重构中」的说明，不会出现空壳或报错。

### 2. 作品集是空的

`src/content/works/` 下只有三个 `draft: true` 的模板。
填上 B站 作品链接、把 `draft` 改成 `false` 即可上线。

### 3. `src/site.config.ts` 里的联系方式还没填全

`bilibili` 是空的，页脚和关于页不会显示它。填上即可。

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
