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
- [ ] bug-5:

# 用户提出的意见/我的灵感及想法

- [ ] opinion-1: 开放笔记下载.md或.pdf格式下载
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
- [ ] opinion-6: 随着笔记数量的增多，笔记区可以参照作品区的做法，在笔记区增加如标签筛选、搜索等等内容
- [ ] opinion-7: 数据结构与算法课程中（例如：DSA-3 栈和队列的单调栈部分）又相关如洛谷、力扣的题目，可以加一个链接前往指定的题目
- [ ] opinion-8: 