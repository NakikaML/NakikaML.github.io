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
  'hm5-01-definite-integral-geometry': [
    [0, 1, 0, 'f(1) = 0（零点）'],
    [0, -1, 0, 'f(−1) = 0（零点）'],
    [0, 0, -1, 'f(0) = −1'],
  ],
  'hm5-03-1-even-parity': [[0, 2, 2, 'f(2) = 2²/2 = 2'], [0, 0, 0, '偶函数过原点']],
  'hm5-03-2-odd-parity': [[0, 2, 2, 'f(2) = 2³/4 = 2'], [0, -2, -2, 'f(−2) = −2']],
  'hm5-04-improper-infinite-limit': [[0, 2, 0.5, '1/2 = 0.5'], [0, 1, 1, '1/1 = 1']],
  'hm5-05-improper-p-integral': [
    [0, 4, 0.5, 'p = 1/2：1/√4 = 0.5'],
    [1, 4, 0.25, 'p = 1：1/4 = 0.25'],
    [2, 2, 0.25, 'p = 2：1/4 = 0.25'],
  ],
  'hm5-06-improper-discontinuity': [[0, 4, 0.5, '1/√4 = 0.5'], [0, 1, 1, '1/√1 = 1']],
  'hm5-07-x-type-region-area': [
    [0, 0, 2.2, '上曲边 f(0) = 2.2'],
    [1, 0, 0.7, '下曲边 g(0) = 0.7'],
  ],
  'hm5-10-area-example-two-curves': [
    [0, 2, -2, '抛物线过交点 (2, −2)'],
    [0, 8, 4, '抛物线过交点 (8, 4)'],
    [1, 2, -2, '直线过 (2, −2)'],
    [1, 8, 4, '直线过 (8, 4)'],
  ],
  'hm5-11-cycloid-graph': [
    [0, 0, 0, 't=0：(0, 0)'],
    [0, Math.PI, 2, 't=π：最高点 (πa, 2a)'],
  ],
  'hm5-22-arc-length-element': [[0, 2.3, 0.22 * 2.3 * 2.3 + 0.5, 'Q 点落在曲线上']],

  // ---- 第 8 章：等值线 / 邻域 / 相切这些位置关系，全图就靠它们成立
  'hm8-01-point-set-relations': [
    [0, 1.9, 0, 'E 的边界过 (1.9, 0)'],
    [0, 0, 0.95, 'E 的边界过 (0, 0.95)'],
    [0, 0.65, 0.893, '边界点 R 确实落在边界上'],
  ],
  'hm8-02-double-limit-definition': [
    [0, -1.1, 0.7, '第一条直线过 (−1.1, 0.7)'],
    [1, 1.0, -0.65, '第二条直线过 (1.0, −0.65)'],
    [2, -1.0, 0.55, '抛物线过 (−1.0, 0.55)'],
  ],
  'hm8-08-directional-derivative': [
    [1, 1.789, 0, '第二圈等值线过 (1.789, 0)'],
    [2, 0, 1.549, '最外圈等值线过 (0, 1.549)'],
  ],
  'hm8-09-gradient-geometry': [
    [0, 0.894, 0, '内圈等值线过 (0.894, 0)'],
    // P₀(1.0, 0.6) 满足 f = x²/2 + y² = 0.86，必须正好落在红色等值线上
    [1, 1.0, 0.6, 'P₀ 落在 f = 0.86 的等值线上'],
    [2, 0, 1.265, '外圈等值线过 (0, 1.265)'],
  ],
  'hm8-10-contour-lines': [
    [0, 0, 0.7, '内圈过 (0, 0.7)'],
    [1, 1.3, 0, '中圈过 (1.3, 0)'],
    [1, 0.996, 0.836, '箭头起点在中圈上'],
    [2, 0, -1.85, '外圈过 (0, −1.85)'],
  ],
  'hm8-12-lagrange-multiplier': [
    [0, 0.5, 0.5, '切点落在 r = 0.7071 的等值线上'],
    [3, 0.5, 0.5, '切点落在约束直线 x + y = 1 上'],
    [3, 0, 1, '约束直线过 (0, 1)'],
    [3, 1, 0, '约束直线过 (1, 0)'],
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

/**
 * 填充区域的面积校验 —— 这一章的图说的就是「这块面积等于多少」，
 * 所以光看曲线过不过点不够，得把填色多边形的面积算出来，跟独立算的积分值对账。
 * 期望值由测试里自己的 Simpson 求积给出（不复用 build-plots 的采样器）。
 */
const FILL_AREAS = {
  'hm5-01-definite-integral-geometry': [
    [0, (x) => x * x - 1, -1.6, -1, '左边正面积'],
    [1, (x) => x * x - 1, -1, 1, '中间负面积'],
    [2, (x) => x * x - 1, 1, 1.6, '右边正面积'],
  ],
  'hm5-07-x-type-region-area': [
    [0, (x) => 2.2 + 0.55 * x - (0.7 + 0.15 * x * x), -1, 2, '上曲边减下曲边'],
  ],
  'hm5-02-1-interval-additivity-inside': [
    [0, (x) => 2 + Math.sin(x), 0, 2.5, '∫ₐᶜ 那块'],
    [1, (x) => 2 + Math.sin(x), 2.5, 5, '∫ᶜᵇ 那块'],
  ],
  'hm5-02-2-interval-additivity-outside': [
    [0, (x) => 2 + Math.sin(x), 0, 2.5, '∫ₐᵇ 那块'],
    [1, (x) => 2 + Math.sin(x), 2.5, 5, '∫ᵇᶜ 那块'],
  ],
  'hm5-08-y-type-region': [
    [0, (y) => 2.6 + 0.4 * y - (0.9 + 0.15 * y * y), -1, 2, '右曲边减左曲边'],
  ],
  'hm5-10-area-example-two-curves': [
    [0, (y) => y + 4 - (y * y) / 2, -2, 4, 'y²=2x 与 y=x−4 围成（应为 18）'],
  ],
  'hm5-11-cycloid-graph': [
    [0, (t) => (1 - Math.cos(t)) ** 2, 0, 2 * Math.PI, '摆线一拱（应为 3π）'],
  ],
};

/** 绘图区的四边留白，与 build-plots.mjs 的 PAD 保持一致（换算屏幕坐标要用） */
const PADP = { top: 34, right: 24, bottom: 36, left: 46 };

/** 独立实现的 Simpson 求积 —— 和 build-plots 里那套采样没关系 */
function simpson(f, a, b, n = 2000) {
  if (n % 2) n++;
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

/** 填色多边形（屏幕坐标）→ 用鞋带公式求它在数据空间里的面积 */
function fillAreas(svg, fig) {
  const w = fig.width - PADP.left - PADP.right;
  const h = fig.height - PADP.top - PADP.bottom;
  const toData = ([sx, sy]) => [
    fig.x[0] + ((sx - PADP.left) / w) * (fig.x[1] - fig.x[0]),
    fig.y[0] + ((PADP.top + h - sy) / h) * (fig.y[1] - fig.y[0]),
  ];
  return [...svg.matchAll(/<path d="([^"]+)" class="fill/g)].map((m) => {
    const pts = [...m[1].matchAll(/([ML])(-?[\d.]+) (-?[\d.]+)/g)].map((p) =>
      toData([Number(p[2]), Number(p[3])])
    );
    let s = 0;
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % pts.length];
      s += x1 * y2 - x2 * y1;
    }
    return Math.abs(s / 2);
  });
}

// ---------------------------------------------------------------- 工具
/**
 * 只取「曲线」那类 <path>（class="curve"）。
 * 填充、角度弧、箭头尖也都是 <path>，全算进来就没法和规格里的曲线数对账了。
 * 文档顺序：curves → segments → tangents（填充和弧是另外的元素组）。
 */
const pathsOf = (svg) =>
  [...svg.matchAll(/<path d="([^"]+)" class="curve/g)].map((m) =>
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

// disabled 的图不生成，也就不检查（规格还在文件里备查）
const figures = (ONLY ? FIGURES.filter((f) => f.id.includes(ONLY)) : FIGURES).filter(
  (f) => !f.disabled
);
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
  const kb = (Buffer.byteLength(svg) / 1024).toFixed(1);
  let bad = 0;

  // 三维图走另一套检查：二维那几项（曲线条数、面积、切线斜率）对它没意义，
  // 真正会出错的是「投影算歪了、图被裁在画布外」。
  if (fig.threeD) {
    const nums = [...svg.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map((m) => [
      Number(m[1]),
      Number(m[2]),
    ]);
    for (const m of svg.matchAll(/<line x1="(-?[\d.]+)" y1="(-?[\d.]+)" x2="(-?[\d.]+)" y2="(-?[\d.]+)"/g)) {
      nums.push([Number(m[1]), Number(m[2])], [Number(m[3]), Number(m[4])]);
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const [x, y] of nums) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      if (x < -1 || x > fig.width + 1 || y < -1 || y > fig.height + 1) {
        fail(`${fig.id}：投影后的点跑到画布外 (${x}, ${y})`);
        bad++;
        break;
      }
    }
    if (!bad) {
      const cover = ((maxX - minX) / fig.width) * 100;
      console.log(
        `  ✓ ${fig.id.padEnd(30)}${kb.padStart(6)} KB · 三维 ${nums.length} 个顶点 · ` +
          `占据 x ${minX.toFixed(0)}–${maxX.toFixed(0)} / y ${minY.toFixed(0)}–${maxY.toFixed(0)}（横向 ${cover.toFixed(0)}%）`
      );
    }
    if (SHOW_ART) console.log(art(svg, fig.width, fig.height));
    continue;
  }

  const paths = pathsOf(svg);

  if (paths.length !== expectPaths) {
    fail(`${fig.id}：有 ${paths.length} 条折线，规格里是 ${expectPaths} 条曲线`);
    bad++;
  }

  // 范围：坐标不能跑到画布外面（说明裁剪漏了）。
  // 只查 fn 曲线 —— 参数曲线和极坐标曲线不预裁剪，靠 <g clip-path> 剪，
  // 数据坐标本来就可能落在画布外（比如摆线右侧那一拱伸出去的部分）。
  const declares = fig.curves ?? [];
  for (const [i, pts] of paths.entries()) {
    const c = declares[i];
    if (!c || c.parametric || c.polar) continue;
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

  // 面积：填色多边形算出来的面积，要等于独立求积的结果
  const areaChecks = FILL_AREAS[fig.id] ?? [];
  let areaWorst = 0;
  if (areaChecks.length) {
    const areas = fillAreas(svg, fig);
    for (const [idx, f, a, b, label] of areaChecks) {
      const want = Math.abs(simpson(f, a, b));
      const got = areas[idx];
      if (got == null) {
        fail(`${fig.id}：${label} —— 找不到第 ${idx + 1} 块填充`);
        bad++;
        continue;
      }
      const rel = Math.abs(got - want) / (want || 1);
      areaWorst = Math.max(areaWorst, rel);
      // 多边形是采样近似 + 抽稀过的，0.5% 以内就算对
      if (rel > 0.005) {
        fail(`${fig.id}：${label} 面积 ${got.toFixed(3)}，应为 ${want.toFixed(3)}（差 ${(rel * 100).toFixed(2)}%）`);
        bad++;
      }
    }
  }

  if (!bad) {
    const bits = [`${expectPaths} 条折线`];
    if (probes.length) bits.push(`${probes.length} 个期望点最大偏差 ${worst.toFixed(2)}px`);
    if (slopeProbes.length) bits.push(`${slopeProbes.length} 条切线斜率对`);
    if (areaChecks.length) bits.push(`${areaChecks.length} 块面积最大误差 ${(areaWorst * 100).toFixed(2)}%`);
    console.log(`  ✓ ${fig.id.padEnd(30)}${kb.padStart(6)} KB · ${bits.join(' · ')}`);
  }

  if (SHOW_ART) console.log(`\n${art(svg, fig.width, fig.height)}\n`);
}

if (failed === 0) {
  console.log(`\n✅ 生成图全部通过（${figures.length} 张）\n`);
} else {
  console.log(`\n❌ 有 ${failed} 处不对\n`);
  process.exitCode = 1;
}
