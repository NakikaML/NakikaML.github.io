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
- [x] bug-6: mermaid 图完全显示不出来 —— 页面上只有一个灰色代码块，从来没有渲染成图。
      现状（已在 dev 页面与构建产物里分别核对）：`BaseLayout.astro` 的渲染脚本查的是
      `document.querySelectorAll('code.language-mermaid')`，但 Astro 的 Shiki 集成把语言写在
      `<pre data-language="mermaid">` 上、并把 `<code>` 的 `language-*` 类**去掉了** ——
      两边 HTML 里 `language-mermaid` 都是 **0 处**，于是脚本在 `if (blocks.length === 0) return;`
      就提前退出，连 `import('mermaid')` 都没执行（mermaid 的 chunk 其实一直好好地躺在 dist 里）。
      这个 bug 长期没暴露，是因为之前上线的 9 篇笔记里一张 mermaid 图都没有，
      直到这批 C++ 笔记带进来 23 张图才显形。
      → 已修（`src/layouts/BaseLayout.astro`）：选择器改成认 `pre[data-language="mermaid"]`，
        同时保留 `code.language-mermaid` 这条老写法（上游以后换写法也不会再瞎）；
        连 `.code-block`（语言标签 + 复制按钮）那层壳一起换成 `.mermaid` 容器 —— 图不需要复制按钮；
        渲染失败时把原始代码块放回去（原来那版失败后只会留一片空白，还把源码弄丢了）。
        验收：用 headless Chrome 实际渲染 9 个含图页面（cpp-1/3/4/5/6/8/10/11/12），
        **23/23 张图**都产出 `<svg>` 且带 `data-processed="true"`，页面里 0 处残留 mermaid 源码块。
- [x] bug-7: mermaid **又**不渲染了 —— 页面上仍是一个灰色代码块，但**没有任何报错**。
      根因在 mermaid v12 的**懒加载**：37 种图表都不在主包里，`mermaid.core.mjs` 写的是
      `import("./chunks/mermaid.core/flowDiagram-xxx.mjs")`，要等 `detectType` 认不出类型时才在
      **运行时**去 import 那个 chunk。所以渲染结果取决于「运行时那次动态 import 成不成功」——
      bug-6 只修了「找不找得到代码块」，没修掉这条不确定的路径，于是它又犯了。
      本地实测（Node + DOM 垫片，直接跑 `dist/_astro/` 里的产物）：
      · `detectType('flowchart LR …')` 第一轮 → **`No diagram type detected`**（懒加载还没发生）；
      · 先 `parse()` 一次把模块 import 进来 → `detectType` 才返回 `flowchart-v2`；
      · 也就是说：**第一轮渲染必然踩在懒加载上**，那一步一失败就被 catch 吞掉、回退成源码块。
      → 已修（`src/layouts/BaseLayout.astro`）：不再依赖运行时懒加载，改为**静态 import 图表模块并注册**——
        `await import('mermaid/dist/chunks/mermaid.core/flowDiagram-KWPJA3E3.mjs')` 拿到 `diagram`，
        再用 `mermaid.registerExternalDiagrams([{ id:'flowchart-v2', detector:/^\s*(graph|flowchart)/, loader, lazyLoad:false }])`
        注册，`detectType` 第一轮即可命中。本站 23 张图**全部是 flowchart**（含 `graph` 写法），只注册这一个。
        ⚠️ 那串 hash 是 mermaid 的内部 chunk 名，升级 mermaid 后可能变；届时**构建会直接报错**（import 解析不到），
        而不是又变成「悄悄不渲染」，照提示换成新文件名即可。
        顺手把 catch 里的日志改成带上真正的 `err.message`（原来只打整个对象，控制台里抓不住重点）。
      → 验收（用 headless Chrome 实际渲染 `dist` 产物，`--dump-dom` 取渲染后的 DOM）：
        **23/23 张图全部产出 `<svg data-processed="true">`，页面里 0 处残留 mermaid 源码块。**
        逐页结果：cpp-1 1/1、cpp-3 6/6、cpp-4 3/3、cpp-5 3/3、cpp-6 4/4、cpp-8 3/3、cpp-10 1/1、cpp-11 1/1、cpp-12 1/1；
        另确认 cpp-2／cpp-7／cpp-9／cn-2 这些**本来就没有图**的页面为 0 处残留。
        （验收脚本：起一个静态服务指向 `dist/`，再用
        `chrome --headless=new --virtual-time-budget=15000 --dump-dom <url>` 抓渲染后的 DOM，
        数 `data-processed="true"` 即可。这比 bug-6 那次靠肉眼看页面更可复核。）
        注：cpp-8～12 当时是草稿、不在产物里，验收时临时把 `SHOW_DRAFTS` 置为 `true` 构建了一次，
        验完已还原（`git status` 确认 `src/utils/notes.ts` 无改动）。
- [x] bug-8: 

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
- [x] opinion-10: 笔记之间暂时不要跳转 —— 去掉笔记库里的「链接」
      → 已做，改动两处：
        ① **正文里的站内笔记链接**：`[C++程序设计基础-6 指针](/notes/cpp-6-pointers/)` → `C++程序设计基础-6 指针`
           （纯文字，点了不跳）。共拆掉 **53 处，涉及 11 篇 CPP 笔记**（DSA 那 8 篇原文本来就是字面，没有链接）。
           拆完顺手把「标题＋空格＋汉字」的断口收干净（**20 处**，如 `…基础-6 指针 里展开` → `…基础-6 指针里展开`；
           标题内部的空格、以及标题以拉丁字符结尾时的中英混排间距都没有动）。
        ② **详情页底部的「相关笔记」自动推荐区块**：整块摘掉（`src/pages/notes/[id].astro`）。
        `relatedNotes()` 留在 `src/utils/notes.ts` 里没删，函数注释写明了它是「当前未使用」以及怎么恢复。
      → **保留的**：「上一篇 / 下一篇」同分类导航、本页目录（TOC）、面包屑与标签跳
        `/notes/?cat=…` / `?tag=…` —— 后两类是「进列表页」，不是笔记之间跳转，按确认保留。
      → **恢复办法**：正文把链接照原样写回 `[标题](/notes/slug/)`；
        「相关笔记」把 `[id].astro` 里 getStaticPaths 的 `related` 与底部那段区块还原即可（函数一直在）。
- [ ] opinion-11: 加入“最后更新字段”，一个是创建时间，另一个是最后更新时间，这样我如果对笔记有新的理解加入笔记库中，就可以及时更新笔记，让读者能够看到最新状态的笔记，而不会误以为是修改后就不再更新的笔记
- [ ] opinion-12: 在网站页脚加一段，笔记库/博客库内容为个人学习整理、图示来源部分为我自己的手绘，也有部分源于网络、仅供学习交流、如有侵权请告知，我将及时删除或替换！）
- [x] opinion-13: **知识地图不再单独成块：融进笔记库 + 改做成 Obsidian 风格的知识图谱**
      → 已做。删掉独立的「知识地图」(/maps/) —— 一个永远空着的导航项不如没有；
        改为在**笔记库右上角**放一个小按钮进入图谱。
        · **删除**：`src/pages/maps/` 整页、`site.config.ts` 的导航项、首页「知识地图」板块、
          `contentNotes/mapNotes` 的 moc 过滤、`content.config.ts` 的 `kind` 字段，
          以及 `check-live` / `smoke-test` / `verify-build` 三处对 `/maps/` 的检查。
          其中 `verify-build` 的【4c】改成「以 `src/content/notes/` 的真实文件认定哪些是笔记详情页」——
          否则 `/notes/graph/` 会被误判成一篇缺 `.md` 原文的笔记而报错。
          「关于我」板块表里的「知识地图」改为「知识图谱」并指向新页面。
        · **新增**：`src/pages/notes/graph.astro` + 笔记库页头的 `.graph-entry`
          （小图标 + 「知识图谱」+ 篇数徽章）。
        · **实现方式：零新依赖**。力导引仿真（斥力 + 弹簧 + 向心力 + 阻尼）与 SVG 渲染都在页面里手写。
          不引第三方图谱库的理由与 mermaid 那次同源——上游的运行时懒加载／打包行为可能在产物里
          **静默失效**；而这个规模（22 篇 = 231 个节点对）自己算完全够用，还省掉一个升级风险。
        · **数据在构建期算好**，内联成一段 JSON 交给客户端：
          节点 = 一篇已发布笔记（草稿不进图谱，与列表页口径一致）；
          **边 = 同 `subfield`（同课程，权重 2）＋ 每共享一个标签（权重 1）**。
          笔记之间目前没有显式互链（opinion-10 摘掉了「相关笔记」），关系只能从这两个 frontmatter
          字段推——这也是当初保留它们的另一个理由。实测 17 篇 → 51 条边。
        · **交互**：拖拽节点（拖动时给仿真加一点温，邻居会跟着让位）、滚轮以光标为锚点缩放、
          空白处拖拽平移、单击进笔记（位移 > 4px 视为拖拽、不跳转）、双击钉住／松开、
          悬停出信息卡、搜索高亮、「标签」开关、重新布局、适应窗口、左侧按课程筛选，
          并支持 `?focus=<笔记id>` 直达某节点（会自动切到它所在课程）。
        · **验收**（headless Chrome 实测 `dist` 产物）：17 节点 / 51 连线全部渲染；
          最小节点间距 **54px**（无重叠）；三门课质心两两相距 **229–286px**、各自离散度 **44–59px**，
          确认**各自成团、没有混在一起**；`?focus=cpp-6-pointers` 正确筛成 7 个节点并高亮选中项。
        · 以后要加别的关系（例如正文里的显式互链），只要在构建期多推一种边，客户端不用动。
- [ ] opinion-14: **分享卡片补一张 `og:image`（现在分享出去是"裸链接"）**
      → 现状：`BaseLayout.astro` 已有 `og:type/title/description/url` 与
        `twitter:card: summary_large_image`，但**没有设 `og:image`**；
        而 `summary_large_image` 恰恰是"要图"的声明，两者配在一起会让分享卡片落空。
        微信／QQ 都认这套标签，正好是现在收反馈的两个渠道。
      → 做法（未做）：照 `scripts/build-avatar.mjs` 的路子写 `scripts/build-og.mjs`，
        用已有的 `sharp` 生成 1200×630 卡片——可以全站一张兜底图，也可以笔记页用标题 + 分类压字。
        `astro.config.mjs` 的 `SITE` 已配置，拼绝对 URL 时用它。