// @ts-check
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// 上线域名。
// 用 GitHub Pages 的「用户站点」仓库（仓库名 = NakikaML.github.io）时，
// 站点位于根路径，不需要 base 前缀 —— 页面里的 /notes/... 这类绝对链接才能正常工作。
export const SITE = 'https://nakikaml.github.io';

/**
 * 包一层 rehype-katex，过滤掉它在构建时刷出的良性噪音警告。
 *
 * 这些警告不影响渲染结果，但几百行刷屏会让人误以为构建出错了：
 *   · "No character metrics for '①' ..." —— 公式里出现了 KaTeX 字体没有度量的字符
 *     （圈码 ①②③、上标 ⁻¹ 等），照常渲染，只是字距不完美。
 *   · "LaTeX-incompatible input ..." —— strict 模式对中文入公式的提示。
 *
 * 只过滤这两类消息，其它警告一律照常输出。
 */
function quietKatex(options) {
  const inner = rehypeKatex(options);
  const NOISE = /No character metrics|LaTeX-incompatible input/;

  return async function (tree, file) {
    const origWarn = console.warn;
    const origError = console.error;
    const mute = (fn) => (...args) => {
      if (typeof args[0] === 'string' && NOISE.test(args[0])) return;
      fn.apply(console, args);
    };
    console.warn = mute(origWarn);
    console.error = mute(origError);
    try {
      return await inner.call(this, tree, file);
    } finally {
      console.warn = origWarn;
      console.error = origError;
    }
  };
}

/**
 * 让 `astro dev` 也自动生成头像/图标。
 *
 * 不加这个的话，dev 期间替换 src/assets/avatar.png 会「没反应」——
 * 因为 scripts/build-avatar.mjs 只在 build 时跑，生成物没更新，
 * 页面上就还是旧头像（public/ 虽然是实时读盘的，但读到的还是旧文件）。
 *
 * 这里在 dev 启动时先跑一次，再监听 src/assets/ 的增删改：
 * 你往里面丢/换图片，会自动重新生成并刷新页面。
 */
function avatarAssets() {
  const SCRIPT = fileURLToPath(new URL('./scripts/build-avatar.mjs', import.meta.url));
  return {
    name: 'nakika-avatar-assets',
    configureServer(server) {
      /**
       * 必须用**异步** execFile，不能用 execFileSync：
       * 同步版会阻塞事件循环几百毫秒，正好卡在 Vite 初始化模块系统的时机上，
       * 实测会触发 "Vite module runner has been closed" 报错。
       */
      const run = (reload) => {
        execFile(process.execPath, [SCRIPT], { stdio: 'inherit' }, (err) => {
          if (err) {
            console.warn('[avatar] 生成失败（不影响 dev 运行）：', err.message);
            return;
          }
          if (reload) server.ws.send({ type: 'full-reload' });
        });
      };
      // 让出一轮事件循环，别和 Vite 自己的启动流程抢
      setTimeout(() => run(false), 0);

      const onFs = (file) => {
        if (!/[\\/]src[\\/]assets[\\/]/.test(file)) return;
        console.log('[avatar] 检测到 src/assets 有变化，重新生成…');
        run(true);
      };
      server.watcher.on('add', onFs);
      server.watcher.on('change', onFs);
      server.watcher.on('unlink', onFs);
    },
  };
}

export default defineConfig({
  site: SITE,
  integrations: [sitemap()],

  build: {
    // /notes/xxx/ 生成 /notes/xxx/index.html
    format: 'directory',
  },

  markdown: {
    // Astro 7 起默认 Markdown 处理器换成了 Sätteri；
    // 要跑 remark/rehype 插件（这里用于 KaTeX 数学公式），
    // 必须显式装配 @astrojs/markdown-remark 的 unified 处理器。
    //
    // 为什么需要：知识库里有 6000+ 处行内公式与 1200+ 处块级公式，
    // 不过 KaTeX 的话页面上会显示成一片 $...$ 原文。
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        // 笔记里有不少用中文直接写的公式（如 $$开始索引 = (当前页码-1) * 每页条数$$），
        // 关掉严格模式 + 不因渲染失败而中断构建，让它尽力渲染；
        // quietKatex 负责把随之而来的良性警告静音。
        [
          quietKatex,
          {
            strict: false,
            throwOnError: false,
            output: 'html',
            trust: true,
          },
        ],
      ],
      gfm: true,
    }),

    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },

  devToolbar: { enabled: false },

  vite: {
    plugins: [avatarAssets()],
    resolve: {
      alias: {
        // picomatch 是 CJS 包，被 @astrojs/internal-helpers 用 ESM 语法默认导入，
        // 在 pnpm + Vite 8 下会内联失败（require is not defined）。
        // 指向 ESM 垫片，走 Node 原生 CJS 加载路径。详见 shims/picomatch-esm.mjs
        picomatch: fileURLToPath(new URL('./shims/picomatch-esm.mjs', import.meta.url)),
      },
    },
  },
});
