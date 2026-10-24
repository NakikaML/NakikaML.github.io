#!/usr/bin/env node
/**
 * test-plots.mjs —— build-plots.mjs 产出的自检
 * ============================================================================
 * 图这种东西「看起来对」特别不可靠：坐标轴一翻转、裁剪一写错，曲线还是能画出
 * 一条漂亮的弧，只是它画的是别的函数。所以这里不靠肉眼，做三件事：
 *
 *   1. 结构：每张图的 .svg 存在、<path> 条数与规格里的曲线数一致；
 *   2. 范围：所有坐标都落在 viewBox 内（裁剪没把线画到画布外面）；
 *   3. 几何：取若干「这个函数必然经过的点」，换算成像素后量它到折线的最短距离 ——
 *      期望值在这里**独立算一遍**（不用 build-plots 里那套求值器），
 *      所以就算求值器本身写错也能被抓出来。
 *
 * 用法：
 *   node scripts/test-plots.mjs        # 只跑检查，退出码非 0 表示有图不对
 *   node scripts/test-plots.mjs --art  # 顺带把每张图在终端里画成字符图
 *
 * 加一张新图之后：先 pnpm build 生成，再跑这个。新图没写 probes 也没关系，
 * 结构 + 范围两项照样管着它。
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FIGURES, makeFrame } from './build-plots.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(ROOT, 'public', 'notes-assets');
const SHOW_ART = process.argv.includes('--art');
const onlyArg = process.argv.indexOf('--only');
const ONLY = onlyArg > -1 ? process.argv[onlyArg + 1] : null;

// ---------------------------------------------------------------- 期望点
// 每项：[折线序号, 自变量, 期望的函数值]。函数值手算/独立算，别去复用求值器。
const PROBES = {
  // 一图一条：每张只有一条折线，所以序号统一是 0
  'hm1-04-1-cot-graph': [
    [0, Math.PI / 4, 1, 'cot(π/4) = 1'],
    [0, (3 * Math.PI) / 4, -1, 'cot(3π/4) = -1'],
    [0, -Math.PI / 4, -1, 'cot(-π/4) = -1'],
  ],
  'hm1-04-2-sec-graph': [
    [0, 0, 1, 'sec(0) = 1'],
    [0, Math.PI, -1, 'sec(π) = -1'],
    [0, 2 * Math.PI, 1, 'sec(2π) = 1'],
  ],
  'hm1-04-3-csc-graph': [
    [0, Math.PI / 2, 1, 'csc(π/2) = 1'],
    [0, -Math.PI / 2, -1, 'csc(-π/2) = -1'],
    [0, (3 * Math.PI) / 2, -1, 'csc(3π/2) = -1'],
  ],
  'hm1-01-symbol-function-graph': [
    [0, -1.5, -1, 'x < 0 时 sgn x = -1'],
    [0, -0.2, -1, '靠近 0 的负半轴仍是 -1'],
    [1, 0.2, 1, '靠近 0 的正半轴是 1'],
    [1, 2.5, 1, 'x > 0 时 sgn x = 1'],
  ],
  'hm1-02-floor-function-graph': [
    [0, 0.5, 0, '[0.5] = 0'],
    [0, 1.5, 1, '[1.5] = 1'],
    [0, -0.5, -1, '[-0.5] = -1'],
    [0, 2.9, 2, '[2.9] = 2'],
  ],
  'hm1-03-inverse-function-graph': [
    [0, 0, 1, 'e⁰ = 1'],
    [0, 1, Math.E, 'e¹ = e'],
    [1, 1, 0, 'ln 1 = 0'],
    [1, Math.E, 1, 'ln e = 1'],
    [2, 2, 2, '对称轴 y = x 过 (2, 2)'],
  ],
  'hm1-05-1-arcsin-graph': [
    [0, 0.5, Math.PI / 6, 'arcsin(1/2) = π/6'],
    [0, 1, Math.PI / 2, 'arcsin 1 = π/2'],
    [0, -1, -Math.PI / 2, 'arcsin(-1) = -π/2'],
  ],
  'hm1-05-2-arccos-graph': [
    [0, 0, Math.PI / 2, 'arccos 0 = π/2'],
    [0, -1, Math.PI, 'arccos(-1) = π'],
    [0, 1, 0, 'arccos 1 = 0'],
  ],
  'hm1-05-3-arctan-graph': [
    [0, 1, Math.PI / 4, 'arctan 1 = π/4'],
    [0, -1, -Math.PI / 4, 'arctan(-1) = -π/4'],
    [0, 0, 0, 'arctan 0 = 0'],
  ],
  'hm1-05-4-arccot-graph': [
    [0, 1, Math.PI / 4, 'arccot 1 = π/4'],
    [0, 0, Math.PI / 2, 'arccot 0 = π/2'],
    [0, -1, (3 * Math.PI) / 4, 'arccot(-1) = 3π/4'],
  ],
  'hm1-06-boundedness-example-graph': [
    [0, 3, 1, 'f(3) = 1（例 3 的分界点）'],
    [0, 2.5, 2, 'f(2.5) = 2'],
    [0, 4, 0.5, 'f(4) = 1/2'],
  ],
  'hm1-11-intermediate-value-theorem': [
    [0, 0.8, 2 + 1.2 * Math.sin(1.4 * (0.8 - 1)) + 0.32 * (0.8 - 1), '端点 a 处的值'],
    [0, 5.6, 2 + 1.2 * Math.sin(1.4 * (5.6 - 1)) + 0.32 * (5.6 - 1), '端点 b 处的值'],
  ],
  'hm2-02-geometric-meaning': [
    [0, 1, 1.5, 'f(1) = 1.5（切点）'],
    [1, 1, 1.5, '切线过切点'],
    [1, 2.5, 3, '切线 y = x + 0.5 过 (2.5, 3)'],
  ],
  'hm1-12-1-sinh-graph': [
    [0, 0, 0, 'sh 0 = 0（奇函数过原点）'],
    [0, 1, (Math.E - 1 / Math.E) / 2, 'sh 1 = (e − 1/e)/2'],
    [0, -1, -(Math.E - 1 / Math.E) / 2, 'sh(-1) = −sh 1'],
  ],
  'hm1-12-2-cosh-graph': [
    [0, 0, 1, 'ch 0 = 1（最小值）'],
    [0, 1, (Math.E + 1 / Math.E) / 2, 'ch 1 = (e + 1/e)/2'],
    [0, -1, (Math.E + 1 / Math.E) / 2, 'ch(-1) = ch 1（偶函数）'],
  ],
  'hm1-12-3-tanh-graph': [
    [0, 0, 0, 'th 0 = 0'],
    [0, 1, Math.tanh(1), 'th 1 = tanh 1'],
    [0, -1, -Math.tanh(1), 'th(-1) = −tanh 1'],
  ],
  'hm3-01-fermat-lemma': [
    [0, 1, 3, '极值点 (1, 3)'],
    [0, -1, 1, 'f(-1) = 3 − 0.5·4 = 1'],
    [0, 3, 1, 'f(3) = 1（关于 x = 1 对称）'],
  ],
  'hm3-02-rolles-theorem': [
    [0, 0.6, 1.2, 'f(a) = 1.2'],
    [0, 4.8, 1.2, 'f(b) = 1.2 = f(a)'],
    [0, 2.7, 2.8, '峰顶 (2.7, 2.8)'],
  ],
  'hm3-03-lagrange-mvt': [
    [0, 0.6, 2.2, 'f(a) = 2.2'],
    [0, 5.4, 2.2 + 1.5 * Math.sin(0.7 * 4.8), 'f(b)'],
  ],
  'hm3-04-1-concave-graph': [
    [0, 0, 0.35, '凹弧中点 (0, 0.35)'],
    [0, 1.8, 0.35 * 1.8 * 1.8 + 0.35, '端点 (1.8, f)'],
  ],
  'hm3-04-2-convex-graph': [
    [0, 0, 2.45, '凸弧中点 (0, 2.45)'],
    [0, 1.8, 2.45 - 0.35 * 1.8 * 1.8, '端点 (1.8, f)'],
  ],
  'hm3-06-horizontal-asymptote': [
    [0, 0, 1, 'f(0) = 1'],
    [0, 3, 1.9, 'f(3) = (18+1)/(9+1) = 1.9'],
  ],
  'hm3-07-vertical-asymptote': [
    [0, 2, 1, 'f(2) = 1'],
    [0, 0, -1, 'f(0) = -1'],
  ],
  'hm3-08-oblique-asymptote': [
    [0, 0, 2, 'f(0) = 2'],
    [0, 2, 2 + 2 / 5, 'f(2) = 2 + 2/5'],
    [1, 3, 3, '渐近线 y = x 过 (3, 3)'],
  ],
  'hm3-05-function-graphing': [
    [0, 0, 0, '极大值点 (0, 0)'],
    [0, 2, 4, '极小值点 (2, 4)'],
    [0, 3, 4.5, 'f(3) = 9/2 = 4.5'],
    [0, -1, -0.5, 'f(-1) = 1/(-2) = -0.5'],
    [1, 4, 5, '斜渐近线 y = x + 1 过 (4, 5)'],
  ],
  'hm1-07-unbounded-not-infinite': [
    [2, 0, 0, '0·cos0 = 0'],
    [2, Math.PI, -Math.PI, 'π·cosπ = -π'],
    [2, 2 * Math.PI, 2 * Math.PI, '2π·cos2π = 2π'],
    [0, Math.PI, Math.PI, '包络 y = x 过 (π, π)'],
  ],
  'hm5-15-cardioid-graph': [
    [0, 4, 0, 'θ=0：ρ=4，落在极轴上'],
    [0, 0, 2, 'θ=π/2：点 (0, 2)'],
    [0, -0.5, Math.sin((2 * Math.PI) / 3), 'θ=2π/3：点 (-0.5, √3/2)'],
  ],
};

// 切线 / 弦这类直线的斜率期望值。SVG 坐标 y 轴向下，所以画出来的斜率应是 −k。
// 这一项专治「图看着像平行，其实差一点」—— 而中值定理的图，平行就是全部信息。
const SLOPE_PROBES = {
  'hm3-01-fermat-lemma': [[1, 0, '极大值点处切线水平']],
  'hm3-02-rolles-theorem': [[2, 0, 'f′(ξ) = 0，切线水平']],
  'hm3-03-lagrange-mvt': [
    [2, (2.2 + 1.5 * Math.sin(0.7 * 4.8) - 2.2) / 4.8, '切线斜率 = 弦斜率'],
  ],
  'hm2-02-geometric-meaning': [[1, 1, 'f′(1) = 2·0.5·1 = 1']],
};

// ---------------------------------------------------------------- 工具
const pathsOf = (svg) =>
  [...svg.matchAll(/<path d="([^"]+)"/g)].map((m) =>
    [...m[1].matchAll(/([ML])(-?[\d.]+) (-?[\d.]+)/g)].map((p) => [Number(p[2]), Number(p[3])])
  );

function distToPolyline(pts, px, py) {
  let best = Infinity;
  if (pts.length === 1) return Math.hypot(px - pts[0][0], py - pts[0][1]);
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
    const d = Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
    if (d < best) best = d;
  }
  return best;
}

/** 终端字符图：只给 --art 用，方便在没有浏览器的地方扫一眼形状 */
function art(svg, W, H) {
  const COLS = 96;
  const ROWS = 30;
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(' '));
  const CH = ['#', '+', 'o', 'x'];
  const put = (px, py, ch) => {
    const c = Math.round((px / W) * (COLS - 1));
    const r = Math.round((py / H) * (ROWS - 1));
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
    grid[r][c] = grid[r][c] === ' ' || grid[r][c] === ch ? ch : '*';
  };
  pathsOf(svg).forEach((pts, idx) => {
    const ch = CH[idx % CH.length];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      const n = Math.min(Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1))), 4000);
      for (let k = 0; k <= n; k++) {
        const t = n === 0 ? 0 : k / n;
        put(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, ch);
      }
    }
  });
  return [`+${'-'.repeat(COLS)}+`, ...grid.map((r) => `|${r.join('')}|`), `+${'-'.repeat(COLS)}+`].join(
    '\n'
  );
}

// ---------------------------------------------------------------- 跑
let failed = 0;
const fail = (msg) => {
  failed++;
  console.log(`  ✗ ${msg}`);
};

const figures = ONLY ? FIGURES.filter((f) => f.id.includes(ONLY)) : FIGURES;
console.log(`\n检查生成图${ONLY ? `（只查 ${ONLY}）` : ''}：`);

for (const fig of figures) {
  const file = path.join(ASSETS, `${fig.id}.svg`);
  const expectPaths =
    (fig.curves ?? []).length + (fig.segments ?? []).length + (fig.tangents ?? []).length;

  if (!fs.existsSync(file)) {
    fail(`${fig.id}：没有 ${path.relative(ROOT, file)}（先跑 node scripts/build-plots.mjs）`);
    continue;
  }

  const svg = fs.readFileSync(file, 'utf8');
  const paths = pathsOf(svg);
  const kb = (Buffer.byteLength(svg) / 1024).toFixed(1);
  let bad = 0;

  if (paths.length !== expectPaths) {
    fail(`${fig.id}：有 ${paths.length} 条折线，规格里是 ${expectPaths} 条曲线`);
    bad++;
  }

  // 范围：坐标不能跑到画布外面（说明裁剪漏了）
  for (const [i, pts] of paths.entries()) {
    for (const [x, y] of pts) {
      if (x < -0.5 || x > fig.width + 0.5 || y < -0.5 || y > fig.height + 0.5) {
        fail(`${fig.id}：第 ${i + 1} 条折线有点跑到画布外 (${x}, ${y})`);
        bad++;
        break;
      }
    }
  }

  // 几何：点到折线的最短距离
  const probes = PROBES[fig.id] ?? [];
  let worst = 0;
  if (probes.length) {
    const f = makeFrame(fig);
    for (const [idx, at, want, label] of probes) {
      const px = f.sx(at);
      const py = f.sy(want);
      const d = distToPolyline(paths[idx] ?? [], px, py);
      worst = Math.max(worst, d);
      if (d >= 1.2) {
        fail(`${fig.id}：${label} 处偏离 ${d.toFixed(2)}px（应 < 1.2px）`);
        bad++;
      }
    }
  }

  // 斜率：切线到底有没有「水平」、有没有「平行于弦」—— 这一条光是看图看不出来
  const slopeProbes = SLOPE_PROBES[fig.id] ?? [];
  if (slopeProbes.length) {
    const f = makeFrame(fig);
    // 屏幕里 y 轴向下、两轴缩放还不一样，所以要换算回数据空间的斜率：
    //   screen_dy/screen_dx = −k · (h/yspan) / (w/xspan)
    const ax = f.w / (f.x1 - f.x0);
    const ay = f.h / (f.y1 - f.y0);
    for (const [idx, k, label] of slopeProbes) {
      const pts = paths[idx] ?? [];
      if (pts.length < 2) {
        fail(`${fig.id}：${label} —— 找不到第 ${idx + 1} 条折线`);
        bad++;
        continue;
      }
      const [x1, y1] = pts[0];
      const [x2, y2] = pts[pts.length - 1];
      const drawn = (-(y2 - y1) / (x2 - x1)) * (ax / ay);
      if (Math.abs(drawn - k) > 0.01) {
        fail(`${fig.id}：${label} —— 画出的斜率 ${drawn.toFixed(4)}，应为 ${k.toFixed(4)}`);
        bad++;
      }
    }
  }

  if (!bad) {
    const bits = [`${expectPaths} 条折线`];
    if (probes.length) bits.push(`${probes.length} 个期望点最大偏差 ${worst.toFixed(2)}px`);
    if (slopeProbes.length) bits.push(`${slopeProbes.length} 条切线斜率对`);
    console.log(`  ✓ ${fig.id.padEnd(30)}${kb.padStart(6)} KB · ${bits.join(' · ')}`);
  }

  if (SHOW_ART) console.log(`\n${art(svg, fig.width, fig.height)}\n`);
}

if (failed === 0) {
  console.log(`\n✅ 生成图全部通过（${FIGURES.length} 张）\n`);
} else {
  console.log(`\n❌ 有 ${failed} 处不对\n`);
  process.exitCode = 1;
}
