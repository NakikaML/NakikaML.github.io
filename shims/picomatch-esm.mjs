/**
 * picomatch 是 CommonJS 包（package.json 里没有 "type": "module"），
 * 但 @astrojs/internal-helpers/dist/create-filter.js 用 ESM 语法 `import picomatch from 'picomatch'`
 * 去引入它。
 *
 * 在 pnpm 的严格目录布局 + Vite 8 的模块运行器下，这个 CJS 包会被当作 ESM 内联执行，
 * 于是 `require is not defined` —— 表现为 astro sync / build 直接失败。
 *
 * 这个垫片用 createRequire 走 Node 原生的 CJS 加载路径，再以 ESM 默认导出暴露出去，
 * 从而绕开 Vite 的 CJS 互操作缺陷。由 astro.config.mjs 的 resolve.alias 挂上。
 */

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// @ts-expect-error -- CJS 包没有类型声明
const picomatch = require('picomatch');

export default picomatch;
export const { makeRe, scan, parse, compile, test, matchBase, braces, constants, isMatch } = picomatch;
