# 用户或我发现/指出的bug

- [x] bug-1: 本地端编辑器没有起到实际作用（打算删除）
      → 已删除：`src/components/DevNoteEditor.astro`、`src/dev/editor-client.ts`、`scripts/dev/` 整个目录（5 个文件）；
        同步摘掉 `astro.config.mjs` 的 IS_DEV 分支与两处 import、`package.json` 的 test:editor / smoke:editor、
        `[id].astro` 的挂载点、`verify-build.mjs` 的【6】检查、`.gitignore` 的临时笔记、编辑指南第九节。
        重新构建后确认 dist 里 0 处编辑器痕迹。
- [x] bug-2: 笔记页面目录手机端无法跳转至指定
- [x] bug-3: 作品筛选到作品后，底部依然显示没有符合条件的作品（筛选到的话可以显示“已经到底部了哦~”）
      → 已修（`global.css` + `works/index.astro`）：根因是 `.works-empty { display: flex }` 盖掉了 HTML 的 `[hidden]`，
        JS 那边 `emptyEl.hidden = shown !== 0` 其实是对的（旁边 `.work-item[hidden]` 这条就写对了，只有它漏了）。
        补一行 `.works-empty[hidden] { display: none; }`；另加 `#works-end`「已经到底部了哦~」，
        有结果时显示、无结果时与空状态互斥。
- [x] bug-4: 笔记页的标签链接是死链 —— `/notes/?tag=xxx`（`src/pages/notes/[id].astro` 第 59 行）点进去后
      笔记列表并没有按标签过滤：`src/pages/notes/index.astro` 只解析了 `cat`，没解析 `tag`。
      （另一边 `?cat=` 是好的）
      → 已修（`src/pages/notes/index.astro`）：补上 `?tag=` 解析 + 按钮高亮；热门标签里没有的冷门标签会
        临时补一个按钮（否则筛了也看不出筛了什么、没有取消入口）；筛选状态用 replaceState 写回 URL，
        刷新和分享都能复现同一批结果。
- [x] bug-5: 笔记正文的图片没有任何加载优化 —— 没有 `loading="lazy"`，也没有宽高/`aspect-ratio`。
      现状（已在构建产物里核对）：`src/styles/global.css` 的 `.prose img` 只给了圆角、边框和居中；
      构建出的 `/notes/dsa-6-graph/` 里 31 个 `<img>`，`loading=` 0 处、`width=` 0 处。
      目前 `public/notes-assets/` 已有 161 张图、共 23.1 MB，其中 dsa-6 单篇就 31 张（约 8 MB），
      进页面会把整篇的图一次性全下载；宽高缺失还会在图片陆续加载时把正文顶来顶去（CLS）。
      修法：加一个 rehype 插件统一补 `loading="lazy" decoding="async"`，
      能取到尺寸的就补 `width`/`height`（或 CSS `aspect-ratio` 留位）；顺手可以一起做 opinion-9 的点击放大。
      → 已修（`scripts/rehype-image-figure.mjs` + `astro.config.mjs` + `global.css`），与 opinion-9 一次做完：
        每个 `<img>` 补 `loading="lazy"` `decoding="async"`；直接从图片文件头读宽高写成 `width`/`height`
        （jpg/png/gif/webp/bmp 各自的偏移量都实现了，读不到就只退化这一项，绝不让构建失败）；
        独占一段的图包成 `<figure class="figure">`，夹在文字里的只补属性、点图片本身也能放大。
        自检：`verify-build.mjs` 新增【4d】，构建产物里 161 张正文配图 **全部**带 lazy、`width`+`height`、放大标记；
        尺寸解析另有回归测试 `pnpm test:img`（38 项，jpg 用仓库真实素材对照 System.Drawing 的值）。
        效果：dsa-6 那 31 张图现在首屏只拉进入视口的那几张。

# 用户提出的意见/我的灵感及想法

- [x] opinion-1: 开放笔记下载.md或.pdf格式下载
      → 已做 `.md` 那一半（`src/pages/notes/[id].md.ts` + `[id].astro`）：
        做成 Astro 静态端点，而不是「build 之后往 dist 拷文件」的脚本 —— 后者只有跑 `pnpm build` 才有产物，
        单独跑 `astro build` 就会悄悄少一批文件。端点由 Astro 保证「有这篇笔记就有这份原文」，
        9 篇笔记各产出一份（连 frontmatter 一起，下载下来能直接丢回 Obsidian），
        详情页右上角是「下载原文 .md」。
      → `.pdf` 不做：为了导出 PDF 要拖进一个几百 MB 的无头浏览器（playwright/puppeteer），
        和这个纯静态站的分量不匹配。真要 PDF，用浏览器自带的「打印 → 另存为 PDF」就够。
- [x] opinion-2: 笔记目录格式参照类论文的标题格式（如 1.1 XXX 1.1.1 XXX 如此，可以显得结构清晰）
      → 已实现（`src/utils/toc.ts` + 笔记页目录）：h2 → `1.1`、h3 → `1.1.1`，章号从标题自动取；
        h4 知识点作为第三层**只罗列不编号**（一行一个，见 opinion-5），如 `1.1.1 数据结构的基本概念` 下面竖排
        `· 数据` / `· 数据元素` / `· 数据项`
- [x] opinion-3: 笔记的二级、三级、四级标题可以设置特定样式，目前的四级标题与加粗文本几乎完全一样，需要稍作调整以示区分（例如可以给不同标题加上颜色）
      → 已实现（`src/styles/global.css`）：h2 整条下划线、h3 左侧主题色细条、h4 主题色文字 + 前置小方块，与正文加粗已明显区分
- [x] opinion-4: 代码块的左上角可以类似于Obsidian，显示语言（C++/Java等），再在右上角加一个小小的复制按钮
      → 已实现（`scripts/rehype-code-meta.mjs` + `global.css` + `BaseLayout.astro`）：每个代码块套一层
        `.code-block`，左上角显示语言（```c → C、```cpp → C++、无语言 → 文本），右上角是「复制」按钮，
        点击后变「已复制」，1.6 秒后复原。语言取自 Shiki 的 `data-language`，回退读 `language-xxx` 类名
- [x] opinion-5: 笔记区的目录可以放到左侧，这样可以随时跳转，并且阅读的时候可以提示当前阅读的部分（例如读到“线性表”，用特殊颜色标出）
      → 已实现（`src/pages/notes/[id].astro` + `global.css`）：宽屏（≥1024px）时目录独占左栏并吸顶
        （`top: 5rem` 让开 4rem 的 sticky 顶栏），正文那一栏仍是原来的 768px 阅读宽度；
        窄屏自动回到「目录在上、正文在下」（DOM 顺序本来就是目录在前，不需要额外规则）。
        滚动时用 rAF 节流定位当前小节并给对应目录项加 `.is-current`（主题色 + 浅底色），
        长目录还会在自己那一栏里保持高亮项可见 —— 只动目录的 scrollTop，不会拽动页面。
        另：h4 知识点原来是横着用「·」连成一行，集中到左栏后显得拥挤，已改成一行一个（带行首点 + 悬挂缩进）；
        单栏模式（<1024px）的长目录也一并加了 60vh 上限，免得竖排之后在平板上占满好几屏。
- [x] opinion-6: 随着笔记数量的增多，笔记区可以参照作品区的做法，在笔记区增加如标签筛选、搜索等等内容，删除“热门标签”
      → 已实现（`src/pages/notes/index.astro` + `global.css`）：关键词搜索（标题 / 分类 / 标签 / 学科 / 子领域）
        和分类、标签筛选都已具备；「热门标签」这个说法去掉，改成「标签」。
        标签现在按出现次数排序、**全都在**：默认露前 12 个，其余收在「全部标签（+N）」后面，
        点开关展开、再点收起（`TAGS_VISIBLE` 控制首屏露几个）。
        原来只列出现次数 ≥3 的标签，等于把冷门标签彻底藏了起来，现在它们有了入口；
        从 `?tag=xxx` 深链进来时，如果那个标签正好被折叠着，会自动露出来；
        收起时也会留住正在选中的那一个，否则筛完就看不见自己在筛什么、也没有取消入口。
- [ ] opinion-7: 数据结构与算法课程中（例如：DSA-3 栈和队列的单调栈部分）又相关如洛谷、力扣的题目，可以加一个链接前往指定的题目
      → 现状：还没加，全站现在搜不到任何洛谷 / 力扣外链。
        做法上建议别在正文里手写 `<a>`，而是在笔记 frontmatter 里挂一个题目清单（或自定义 Markdown 容器），
        渲染成一个小卡片列表，这样加题、改题号都不用动正文。
- [ ] opinion-8: 最后的“相关笔记”可以替换为同课程体系内的其他笔记：例如DSA-1 的尾页可以展示DSA全系列课程，然后DSA-1 高亮
      → 现状：还没做。`src/pages/notes/[id].astro` 底部的「相关笔记」现在是用 `relatedNotes()`（按共享标签数排序）
        挑出来的，跟「同一门课的上下篇」是两回事；DSA-1 页尾也不会列出 DSA 全系列。
        真要改成课程体系视图，得先有一个「课程 → 笔记顺序」的字段（比如 frontmatter 里的 `series` + `order`）。
- [x] opinion-9: 笔记区的图片右上角可以添加一个放大按钮，点击后放大显示
      → 已实现，和 bug-5 一次做完（`scripts/rehype-image-figure.mjs` + `BaseLayout.astro` + `global.css`）：
        独占一段的图片包进 `<figure>`，右上角是「放大」按钮（半透明底，浅图深图都看得清）；
        夹在文字中间、没资格包 figure 的图片，点图片本身也能放大。
        点击后是全屏 `<dialog>` 看原图（点遮罩、点关闭、按 Esc 都能退；alt 顺手当图注显示）。
        `<dialog>` 全站只建一个、首次点击才建 —— 否则 dsa-6 这种 31 张图的页面要白背 31 份浮层 DOM。
        细节：图片外面套着链接时（`[![alt](img)](url)`），点图走链接、想放大点右上角按钮，
        免得一次点击既跳转又弹浮层。
- [ ] opinion-10: 
