#!/usr/bin/env node
/**
 * build-plots.mjs —— 把「函数规格」画成静态 SVG，落到 public/notes-assets/
 * ============================================================================
 * 用途：给笔记里那些「图形本身没有信息、只有形状」的插图（标准一元函数曲线、
 * 极坐标曲线、参数曲线）一个可复算的来源。画出来的是**普通 .svg 文件**，
 * 正文里照旧写
 *
 *     ![图注](/notes-assets/xxx.svg)
 *
 * 于是既不动 Markdown 解析链，也不影响「下载原文 .md」（opinion-1），
 * 还沿用编辑指南里「图片放 public/notes-assets/」那一套约定。
 *
 * 它**不替代**手绘图：带箭头、区域划分、多面板对比的示意图还是手绘更快；
 * 三维曲面（hm-7 的二次曲面、hm-5 的旋转体）也不在能力范围内。
 *
 * 用法：
 *   node scripts/build-plots.mjs            # 生成下面 FIGURES 里所有的图
 *   node scripts/build-plots.mjs --only hm1 # 只生成 id 含该子串的
 *
 * 表达式语法（写错的会在终端直接指出哪张图、哪个表达式、错在第几个字符）：
 *   + - * / ^        四则与乘方（^ 右结合，-x^2 = -(x^2)）
 *   x                自变量（参数曲线里是 t）
 *   pi, e            常数
 *   函数              sin cos tan cot sec csc / asin acos atan / ln log lg log2
 *                     exp sqrt abs floor ceil sign / sinh cosh tanh
 *   隐式乘法          2x、3(x+1)、x sin(x) 都认；但 xsin(x) 不行 —— 标识符按最长匹配，
 *                     会当成一个叫 xsin 的名字，写 x*sin(x) 就好。
 *
 * 主题色：所有颜色都走 CSS 变量 + 回退值（var(--plot-ink, #241d17)），
 * 所以这些 SVG **内联**进页面时能跟着深色模式走；用 <img src> 引用时拿到的是回退值
 * （即浅色配色）。想要深色版就再生成一份、或改成内联，见 README/汇总里的说明。
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'public', 'notes-assets');

const TAU = Math.PI * 2;

// ------------------------------------------------------------------ 表达式求值
// 不碰 eval / new Function：这里只用「词法 → 递归下降 → AST → 闭包」，
// 免得哪天规格文件里的表达式变成一条可执行的注入面。

const FUNCS = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  cot: (v) => 1 / Math.tan(v),
  sec: (v) => 1 / Math.cos(v),
  csc: (v) => 1 / Math.sin(v),
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  ln: Math.log,
  log: Math.log, // 中文数学语境里 log 默认自然对数，底数另有 lg / log2
  lg: Math.log10,
  log2: Math.log2,
  exp: Math.exp,
  sqrt: Math.sqrt,
  abs: Math.abs,
  floor: Math.floor,
  ceil: Math.ceil,
  sign: Math.sign,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
};

const CONSTS = { pi: Math.PI, e: Math.E };

function tokenize(src) {
  const out = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if ('+-*/^(),'.includes(c)) {
      out.push({ t: c, at: i });
      i++;
      continue;
    }
    const num = /^\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(src.slice(i));
    if (num) {
      out.push({ t: 'num', v: parseFloat(num[0]), at: i });
      i += num[0].length;
      continue;
    }
    const id = /^[A-Za-z]+/.exec(src.slice(i));
    if (id) {
      out.push({ t: 'id', v: id[0], at: i });
      i += id[0].length;
      continue;
    }
    throw new Error(`无法识别的字符 "${c}"（第 ${i + 1} 个字符）`);
  }
  return out;
}

/**
 * 把表达式编译成 (v) => number。
 * @param {string} src      表达式源码
 * @param {string} varname  自变量名（一元曲线是 x，参数曲线是 t）
 * @param {object} extra    额外常数（如极坐标里的 a）
 */
function compile(src, varname = 'x', extra = {}) {
  const tokens = tokenize(src);
  let i = 0;

  const peek = (k = 0) => tokens[i + k];
  const isFactorStart = (tk) =>
    tk && (tk.t === 'num' || tk.t === 'id' || tk.t === '(');
  const fail = (msg) => {
    throw new Error(`${msg}（表达式：${src}）`);
  };

  function parseExpr() {
    let node = parseTerm();
    while (peek() && (peek().t === '+' || peek().t === '-')) {
      const op = tokens[i++].t;
      node = { k: 'bin', op, l: node, r: parseTerm() };
    }
    return node;
  }

  function parseTerm() {
    let node = parseUnary();
    for (;;) {
      const tk = peek();
      if (tk && (tk.t === '*' || tk.t === '/')) {
        i++;
        node = { k: 'bin', op: tk.t, l: node, r: parseUnary() };
        continue;
      }
      // 隐式乘法：2x、3(x+1)、x sin(x)
      if (isFactorStart(tk)) {
        node = { k: 'bin', op: '*', l: node, r: parseUnary() };
        continue;
      }
      return node;
    }
  }

  function parseUnary() {
    const tk = peek();
    if (tk && (tk.t === '-' || tk.t === '+')) {
      i++;
      const node = parseUnary();
      return tk.t === '-' ? { k: 'neg', a: node } : node;
    }
    return parsePower();
  }

  function parsePower() {
    const base = parseAtom();
    if (peek() && peek().t === '^') {
      i++;
      // 右结合，且指数可以是负号：2^-1、x^2^3 = x^(2^3)
      return { k: 'bin', op: '^', l: base, r: parseUnary() };
    }
    return base;
  }

  function parseAtom() {
    const tk = peek();
    if (!tk) fail('表达式意外结束');

    if (tk.t === 'num') {
      i++;
      return { k: 'num', v: tk.v };
    }

    if (tk.t === '(') {
      i++;
      const node = parseExpr();
      if (!peek() || peek().t !== ')') fail('少一个右括号');
      i++;
      return node;
    }

    if (tk.t === 'id') {
      const name = tk.v;
      i++;
      if (peek() && peek().t === '(') {
        i++;
        const args = [];
        if (!peek() || peek().t !== ')') {
          args.push(parseExpr());
          while (peek() && peek().t === ',') {
            i++;
            args.push(parseExpr());
          }
        }
        if (!peek() || peek().t !== ')') fail(`函数 ${name}( 少一个右括号`);
        i++;
        if (!(name in FUNCS)) fail(`未知函数 ${name}`);
        if (args.length !== 1) fail(`${name}() 只接受一个参数`);
        return { k: 'call', name, a: args[0] };
      }
      if (name === varname) return { k: 'var' };
      if (name in extra) return { k: 'num', v: extra[name] };
      if (name in CONSTS) return { k: 'num', v: CONSTS[name] };
      fail(`未知标识符 ${name}（自变量是 ${varname}）`);
    }

    fail(`这里不该出现 "${tk.t}"`);
    return null;
  }

  const ast = parseExpr();
  if (i < tokens.length) fail(`第 ${tokens[i].at + 1} 个字符之后多出内容`);
  return (v) => evalNode(ast, v);

  function evalNode(n, v) {
    switch (n.k) {
      case 'num':
        return n.v;
      case 'var':
        return v;
      case 'neg':
        return -evalNode(n.a, v);
      case 'call':
        return FUNCS[n.name](evalNode(n.a, v));
      case 'bin': {
        const l = evalNode(n.l, v);
        const r = evalNode(n.r, v);
        switch (n.op) {
          case '+':
            return l + r;
          case '-':
            return l - r;
          case '*':
            return l * r;
          case '/':
            return l / r;
          case '^':
            return Math.pow(l, r);
          default:
            return NaN;
        }
      }
      default:
        return NaN;
    }
  }
}

// ------------------------------------------------------------------ 小工具
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * 极简「上标 / 下标」：把 ^{…} 和 _{…} 变成带 baseline-shift 的 tspan。
 * 只为把 y = e^{x}、x_{0}、f′(x_{0}) 写成教材那种排版 ——
 * 不是排版引擎，不支持嵌套，也不解析 LaTeX。
 */
function richText(s) {
  const out = [];
  let buf = '';
  for (let i = 0; i < String(s).length; i++) {
    const str = String(s);
    const m = /^[\^_]\{([^{}]*)\}/.exec(str.slice(i));
    if (m) {
      if (buf) {
        out.push(esc(buf));
        buf = '';
      }
      out.push(
        `<tspan baseline-shift="${str[i] === '^' ? 'super' : 'sub'}" font-size="0.72em">${esc(
          m[1]
        )}</tspan>`
      );
      i += m[0].length - 1;
      continue;
    }
    buf += str[i];
  }
  if (buf) out.push(esc(buf));
  return out.join('');
}

const num = (v, digits = 2) => {
  const r = Number(v.toFixed(digits));
  return Object.is(r, -0) ? '0' : String(r);
};

/** 轴刻度取整：把步长吸到 1 / 2 / 2.5 / 5 / 10 × 10^k */
function niceStep(raw) {
  if (!(raw > 0)) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / mag;
  const pick = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return pick * mag;
}

function numTicks(min, max, target) {
  const step = niceStep((max - min) / Math.max(1, target));
  const ticks = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-6; v += step) {
    const val = Number(v.toFixed(10));
    if (val >= min - 1e-9 && val <= max + 1e-9) ticks.push(val);
  }
  return { step, ticks };
}

const gcd = (a, b) => (b ? gcd(b, a % b) : a);

/** 把 k·(π/denom) 写成 -2π / -3π/2 / 0 这种教材写法 */
function piLabel(k, denom) {
  if (k === 0) return '0';
  const sign = k < 0 ? '-' : '';
  const a = Math.abs(k);
  const g = gcd(a, denom);
  const n = a / g;
  const d = denom / g;
  const head = n === 1 ? 'π' : `${n}π`;
  return sign + (d === 1 ? head : `${head}/${d}`);
}

function piTicks(min, max, denom) {
  const step = Math.PI / denom;
  const ticks = [];
  const kMin = Math.ceil(min / step - 1e-9);
  const kMax = Math.floor(max / step + 1e-9);
  for (let k = kMin; k <= kMax; k++) ticks.push({ v: k * step, label: piLabel(k, denom) });
  return ticks;
}

/** 估算文本宽度（中文按 12px、西文按 6.9px 算），用来摆图例，够用就行 */
const textWidth = (s, size = 12) => {
  let w = 0;
  for (const ch of String(s)) w += /[\u4e00-\u9fff\uff00-\uffef]/.test(ch) ? size : size * 0.58;
  return w;
};

// ------------------------------------------------------------------ 坐标系
const PAD = { top: 34, right: 24, bottom: 36, left: 46 };

export function makeFrame(fig) {
  const [x0, x1] = fig.x;
  const [y0, y1] = fig.y;
  const W = fig.width;
  const H = fig.height;
  const L = PAD.left;
  const T = PAD.top;
  const w = W - PAD.left - PAD.right;
  const h = H - PAD.top - PAD.bottom;

  const sx = (x) => L + ((x - x0) / (x1 - x0)) * w;
  const sy = (y) => T + h - ((y - y0) / (y1 - y0)) * h;

  return { x0, x1, y0, y1, W, H, L, T, w, h, sx, sy, right: L + w, bottom: T + h };
}

/** Liang–Barsky：把线段裁到矩形内，返回 [p, q] 或 null */
function clipSegment(ax, ay, bx, by, r) {
  let t0 = 0;
  let t1 = 1;
  const dx = bx - ax;
  const dy = by - ay;
  const tests = [
    [-dx, ax - r.left],
    [dx, r.right - ax],
    [-dy, ay - r.top],
    [dy, r.bottom - ay],
  ];
  for (const [p, q] of tests) {
    if (Math.abs(p) < 1e-12) {
      if (q < 0) return null;
      continue;
    }
    const u = q / p;
    if (p < 0) {
      if (u > t1) return null;
      if (u > t0) t0 = u;
    } else {
      if (u < t0) return null;
      if (u < t1) t1 = u;
    }
  }
  return [
    [ax + t0 * dx, ay + t0 * dy],
    [ax + t1 * dx, ay + t1 * dy],
  ];
}

/**
 * 采样一条曲线，返回若干条屏幕坐标的折线（已经裁到绘图区内）。
 *
 * 两处断点处理：
 *   · 相邻两点的函数值一个在顶上、一个在底下时，判为渐近线而不是直连 ——
 *     否则 tan / cot / sec 会在渐近线处多出一条贯穿全图的竖线；
 *   · 规格里显式给了 breaks（取整函数在整数处、符号函数在 0 处）时，
 *     跨过那些 x 值的线段一律断开，阶梯才不会连成一条斜线。
 */
function sampleCurve(fn, frame, samples = 2000, breaks = [], domain = null) {
  const { x0, x1, y0, y1, sx, sy, L, T, w, h } = frame;
  const rect = { left: L, top: T, right: L + w, bottom: T + h };
  const spanY = y1 - y0;

  // 有定义域时只在定义域内采样，并且**首末点一定落在端点上**。
  // 少了这一步，反三角函数这种「端点处切线竖直」的曲线会差 3px 画不到端点：
  // 采样点离 x=1 差 0.001，函数值就差出 3px，看着像曲线断了一截。
  const lo = domain ? Math.max(x0, domain[0]) : x0;
  const hi = domain ? Math.min(x1, domain[1]) : x1;

  const raw = [];
  for (let i = 0; i <= samples; i++) {
    const x = i === 0 ? lo : i === samples ? hi : lo + ((hi - lo) * i) / samples;
    const y = fn(x);
    raw.push(
      Number.isFinite(y)
        ? { dx: x, x: sx(x), y: sy(y), dy: y, ok: true }
        : { dx: x, x: sx(x), y: 0, dy: NaN, ok: false }
    );
  }

  const lines = [];
  let cur = null;

  for (let i = 0; i < raw.length - 1; i++) {
    const a = raw[i];
    const b = raw[i + 1];
    if (!a.ok || !b.ok) {
      cur = null;
      continue;
    }

    // 显式断点：这一段跨过了某个断点 x，就不连
    if (breaks.some((bp) => a.dx < bp && bp <= b.dx)) {
      cur = null;
      continue;
    }

    // 跨越渐近线：一上一下且落差极大 —— 断开，别连一条竖线
    const aboveTop = a.dy > y1 && b.dy < y0;
    const belowBottom = a.dy < y0 && b.dy > y1;
    const jump = Math.abs(b.dy - a.dy) > spanY * 8;
    if (jump && (aboveTop || belowBottom)) {
      cur = null;
      continue;
    }

    const seg = clipSegment(a.x, a.y, b.x, b.y, rect);
    if (!seg) {
      cur = null;
      continue;
    }

    const [p, q] = seg;
    if (cur && Math.hypot(p[0] - cur[cur.length - 1][0], p[1] - cur[cur.length - 1][1]) < 1e-6) {
      cur.push(q);
    } else {
      cur = [p, q];
      lines.push(cur);
    }
  }

  return lines;
}

/**
 * Douglas–Peucker 抽稀：把「采样点」压成「够用的点」。
 * 采样密是为了不丢尖点和陡峭段，但 2000 个点全写进 path，一张图就是上百 KB；
 * 容差 0.35px 在 760px 宽的图上是肉眼看不出来的差别，体积却能掉一个数量级。
 */
function simplify(pts, eps = 0.35) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = 1;
  keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];

  while (stack.length) {
    const [a, b] = stack.pop();
    if (b - a < 2) continue;
    const [ax, ay] = pts[a];
    const [bx, by] = pts[b];
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy) || 1e-9;
    let far = -1;
    let farD = -1;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = pts[i];
      const d = Math.abs((px - ax) * dy - (py - ay) * dx) / len;
      if (d > farD) {
        farD = d;
        far = i;
      }
    }
    if (farD > eps) {
      keep[far] = 1;
      stack.push([a, far], [far, b]);
    }
  }

  const out = [];
  for (let i = 0; i < pts.length; i++) if (keep[i]) out.push(pts[i]);
  return out;
}

const toPath = (lines) =>
  lines
    .map((pts) => {
      const p = simplify(pts);
      if (p.length < 2) return '';
      // 坐标只留 1 位小数：0.1px 在屏幕上不够一像素，却能把文件再压掉一半
      return p.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${num(x, 1)} ${num(y, 1)}`).join(' ');
    })
    .filter(Boolean)
    .join(' ');

// ------------------------------------------------------------------ 画图
const COLOR = {
  ink: 'var(--plot-ink, #241d17)',
  muted: 'var(--plot-muted, #6c6255)',
  axis: 'var(--plot-axis, #9a8d7d)',
  grid: 'var(--plot-grid, #e2d7c7)',
  asym: 'var(--plot-asym, #c2ac92)',
  accent: 'var(--plot-c1, #d78b34)',
  red: 'var(--plot-c2, #c9402e)',
  green: 'var(--plot-c3, #4f9a76)',
};

function renderFigure(fig) {
  const f = makeFrame(fig);
  const { L, T, w, h, sx, sy, x0, x1, y0, y1, W, H, right, bottom } = f;
  const clipId = `clip-${fig.id}`;
  const parts = [];

  // ---- 坐标轴与刻度
  // x 与 y 都支持「按 π 的倍数标」——反三角函数的图不这么标就没法读值域
  const tickList = (spec, lo, hi, fallbackTarget) => {
    if (spec?.type === 'pi') return piTicks(lo, hi, spec.denom ?? 2);
    return numTicks(lo, hi, spec?.target ?? fallbackTarget).ticks.map((v) => ({
      v,
      label: num(v, 2),
    }));
  };
  const xTickList = tickList(fig.xTick, x0, x1, 8);
  const yTickList = tickList(fig.yTick, y0, y1, 6);

  const grid = [];
  const axis = [];
  const labels = [];

  // 网格
  for (const t of xTickList) {
    const X = sx(t.v);
    if (X > L + 0.5 && X < right - 0.5) {
      grid.push(`<line x1="${num(X)}" y1="${num(T)}" x2="${num(X)}" y2="${num(bottom)}"/>`);
    }
  }
  for (const t of yTickList) {
    const Y = sy(t.v);
    if (Y > T + 0.5 && Y < bottom - 0.5) {
      grid.push(`<line x1="${num(L)}" y1="${num(Y)}" x2="${num(right)}" y2="${num(Y)}"/>`);
    }
  }

  // 极坐标辅助：同心圆 + 射线（只用于极坐标图）
  if (fig.polarGrid) {
    const { rays = 30, circles = [1, 2, 3, 4] } = fig.polarGrid;
    for (const r of circles) {
      grid.push(
        `<ellipse cx="${num(sx(0))}" cy="${num(sy(0))}" rx="${num((r / (x1 - x0)) * w)}" ry="${num(
          (r / (y1 - y0)) * h
        )}"/>`
      );
    }
    for (let deg = 0; deg < 360; deg += rays) {
      const th = (deg * Math.PI) / 180;
      const rMax = Math.max(x1 - x0, y1 - y0) * 2;
      grid.push(
        `<line x1="${num(sx(0))}" y1="${num(sy(0))}" x2="${num(sx(Math.cos(th) * rMax))}" y2="${num(
          sy(Math.sin(th) * rMax)
        )}"/>`
      );
    }
  }

  // 轴线（各画一整条，超出绘图区的部分靠 clip 剪掉）
  const axisY = y0 <= 0 && y1 >= 0 ? sy(0) : null;
  const axisX = x0 <= 0 && x1 >= 0 ? sx(0) : null;
  if (axisY !== null) {
    axis.push(`<line x1="${num(L - 6)}" y1="${num(axisY)}" x2="${num(right + 8)}" y2="${num(axisY)}"/>`);
  }
  if (axisX !== null) {
    axis.push(`<line x1="${num(axisX)}" y1="${num(bottom + 4)}" x2="${num(axisX)}" y2="${num(T - 8)}"/>`);
  }

  // 刻度 + 文字
  for (const t of xTickList) {
    const X = sx(t.v);
    const Y = axisY ?? bottom;
    axis.push(`<line x1="${num(X)}" y1="${num(Y)}" x2="${num(X)}" y2="${num(Y + 4)}"/>`);
    labels.push(
      `<text class="tick" x="${num(X)}" y="${num(Y + 15)}" text-anchor="middle">${esc(t.label)}</text>`
    );
  }
  for (const t of yTickList) {
    const Y = sy(t.v);
    const X = axisX ?? L;
    if (Math.abs(t.v) < 1e-9 && axisX !== null) {
      labels.push(
        `<text class="tick" x="${num(X - 9)}" y="${num(Y + 12)}" text-anchor="end">0</text>`
      );
      continue;
    }
    axis.push(`<line x1="${num(X)}" y1="${num(Y)}" x2="${num(X - 4)}" y2="${num(Y)}"/>`);
    labels.push(
      `<text class="tick" x="${num(X - 8)}" y="${num(Y + 4)}" text-anchor="end">${esc(t.label)}</text>`
    );
  }

  // 额外刻度：a / b / C / x₀ 这类「正文里点名的位置」，比普通刻度更显眼
  for (const m of fig.xMarks ?? []) {
    const X = sx(m.x);
    const Y = axisY ?? bottom;
    labels.push(
      `<text class="tick tick--mark" x="${num(X)}" y="${num(Y + 15)}" text-anchor="middle">${richText(
        m.label
      )}</text>`
    );
  }
  for (const m of fig.yMarks ?? []) {
    const Y = sy(m.y);
    const X = axisX ?? L;
    labels.push(
      `<text class="tick tick--mark" x="${num(X - 8)}" y="${num(Y + 4)}" text-anchor="end">${richText(
        m.label
      )}</text>`
    );
  }

  // 轴名
  if (axisY !== null) labels.push(`<text class="axisname" x="${num(right + 6)}" y="${num(axisY - 7)}">x</text>`);
  if (axisX !== null) labels.push(`<text class="axisname" x="${num(axisX + 7)}" y="${num(T - 4)}">y</text>`);

  // ---- 虚线：竖直渐近线 + 水平辅助线（值域边界、介值定理里的 C）
  const asym = [];
  for (const a of fig.asymptotes ?? []) {
    const X = sx(a.x);
    if (a.x <= x0 + 1e-6 || a.x >= x1 - 1e-6) continue; // 正好在边框上的不画
    if (Math.abs(X - (axisX ?? -1e9)) < 3) continue; // 与 y 轴重合的不画，免得糊成一片
    asym.push(`<line x1="${num(X)}" y1="${num(T)}" x2="${num(X)}" y2="${num(bottom)}"/>`);
  }
  for (const g of fig.hguides ?? []) {
    const Y = sy(g.y);
    if (Y <= T + 1 || Y >= bottom - 1) continue;
    asym.push(`<line x1="${num(L)}" y1="${num(Y)}" x2="${num(right)}" y2="${num(Y)}"/>`);
    if (g.label) {
      labels.push(
        `<text class="note" data-color="${g.color ?? 'muted'}" x="${num(right - 4)}" y="${num(
          Y - 6
        )}" text-anchor="end">${richText(g.label)}</text>`
      );
    }
  }

  const rect = { left: L, top: T, right, bottom };

  // ---- 曲线
  const curves = [];
  for (const c of fig.curves ?? []) {
    const stroke = COLOR[c.color] ?? COLOR.ink;
    let lines;

    if (c.parametric) {
      const p = c.parametric;
      const fx = compile(p.x, p.var ?? 't', p.consts ?? {});
      const fy = compile(p.y, p.var ?? 't', p.consts ?? {});
      const n = p.samples ?? 900;
      const [t0, t1] = p.t;
      const pts = [];
      for (let i = 0; i <= n; i++) {
        const t = t0 + ((t1 - t0) * i) / n;
        pts.push([sx(fx(t)), sy(fy(t))]);
      }
      lines = [pts];
    } else {
      const fn = compile(c.fn, 'x', c.consts ?? {});
      lines = sampleCurve(fn, f, c.samples ?? 2400, c.breaks ?? [], c.domain ?? null);
    }

    curves.push(
      `<path d="${toPath(lines)}" class="curve${c.dash ? ' dashed' : ''}" stroke="${stroke}"${
        c.dash ? ` stroke-dasharray="${c.dash}"` : ''
      }/>`
    );
  }

  // ---- 显式线段（符号函数那种两段水平射线，交给采样器反而麻烦）
  for (const s of fig.segments ?? []) {
    const d = s.points
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${num(sx(x), 1)} ${num(sy(y), 1)}`)
      .join(' ');
    curves.push(
      `<path d="${d}" class="curve" stroke="${COLOR[s.color] ?? COLOR.ink}" stroke-width="${
        s.width ?? 1.9
      }"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''} stroke-linecap="butt"/>`
    );
  }

  // ---- 切线（斜率用中心差分算，规格里只写「哪条曲线、在哪一点」）
  for (const t of fig.tangents ?? []) {
    const fn = compile(t.fn, 'x', t.consts ?? {});
    const hh = 1e-5;
    const k = (fn(t.at + hh) - fn(t.at - hh)) / (2 * hh);
    const y0t = fn(t.at);
    const seg = clipSegment(
      sx(x0),
      sy(y0t + k * (x0 - t.at)),
      sx(x1),
      sy(y0t + k * (x1 - t.at)),
      rect
    );
    if (!seg) continue;
    curves.push(
      `<path d="M${num(seg[0][0], 1)} ${num(seg[0][1], 1)} L${num(seg[1][0], 1)} ${num(
        seg[1][1], 1
      )}" class="curve" stroke="${COLOR[t.color] ?? COLOR.red}"${
        t.dash ? ` stroke-dasharray="${t.dash}"` : ''
      }/>`
    );
  }

  // ---- 关键点：实心 / 空心圆点，以及「曲线与水平线的交点」
  const dots = [];
  const putDot = (x, y, opts = {}) => {
    const X = sx(x);
    const Y = sy(y);
    const color = COLOR[opts.color] ?? COLOR.ink;
    dots.push(
      `<circle cx="${num(X)}" cy="${num(Y)}" r="${opts.r ?? 3.6}" fill="${
        opts.open ? 'none' : color
      }" stroke="${color}" stroke-width="1.6"/>`
    );
    if (opts.label) {
      dots.push(
        `<text class="note" data-color="${opts.color ?? 'ink'}" x="${num(X + (opts.dx ?? 9))}" y="${num(
          Y + (opts.dy ?? -9)
        )}" text-anchor="${opts.anchor ?? 'start'}">${richText(opts.label)}</text>`
      );
    }
  };
  for (const d of fig.dots ?? []) putDot(d.x, d.y, d);

  // 交点：规格里只写「哪条曲线、与哪条水平线相交」，第一个交点由这里二分算出来
  for (const cr of fig.crossings ?? []) {
    const fn = compile(cr.fn, 'x', cr.consts ?? {});
    const N = 6000;
    let xi = null;
    let prevX = x0;
    let prevD = fn(x0) - cr.y;
    for (let i = 1; i <= N && xi === null; i++) {
      const X = x0 + ((x1 - x0) * i) / N;
      const d = fn(X) - cr.y;
      if (Number.isFinite(prevD) && Number.isFinite(d) && prevD * d <= 0 && d !== prevD) {
        let lo = prevX;
        let hi = X;
        for (let k = 0; k < 80; k++) {
          const mid = (lo + hi) / 2;
          if ((fn(lo) - cr.y) * (fn(mid) - cr.y) <= 0) hi = mid;
          else lo = mid;
        }
        xi = (lo + hi) / 2;
      }
      prevX = X;
      prevD = d;
    }
    if (xi !== null) {
      putDot(xi, cr.y, { label: cr.label, color: cr.color ?? 'red', dx: cr.dx, dy: cr.dy });
    }
  }

  // ---- 标注
  const notes = [];
  for (const n of fig.notes ?? []) {
    const X = sx(n.x);
    const Y = sy(n.y);
    notes.push(
      `<text class="note" data-color="${n.color ?? 'muted'}" x="${num(X)}" y="${num(
        Y
      )}" text-anchor="${n.anchor ?? 'start'}">${richText(n.text)}</text>`
    );
  }

  // ---- 图题（一图一条时标出画的是哪个函数；有图题就不再占一行画图例）
  const heading = [];
  if (fig.title) {
    const tone =
      fig.titleColor ?? (fig.curves?.length === 1 ? fig.curves[0].color : 'ink');
    heading.push(
      `<text class="figname" x="${num(L)}" y="${num(18)}" fill="${COLOR[tone] ?? COLOR.ink}">${richText(
        fig.title
      )}</text>`
    );
  }

  // ---- 图例（顶部一行）
  const legend = [];
  if (fig.legend?.length) {
    let cursor = L;
    for (const item of fig.legend) {
      const color = COLOR[item.color] ?? COLOR.ink;
      legend.push(
        `<line x1="${num(cursor)}" y1="${num(18)}" x2="${num(cursor + 18)}" y2="${num(
          18
        )}" stroke="${color}" stroke-width="2"${item.dash ? ` stroke-dasharray="${item.dash}"` : ''}/>`
      );
      legend.push(
        `<text class="legend" x="${num(cursor + 24)}" y="${num(22)}">${richText(item.label)}</text>`
      );
      cursor += 24 + textWidth(item.label, 12) + 20;
    }
  }

  // ---- 组装
  // 每条选择器都带 svg 前缀：这份 <style> 万一被内联进页面，
  // 也只能命中 svg 里的元素，不会污染站点自己的 .curve / .tick 之类。
  const style = `
  svg { font-family: -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; }
  svg .grid line, svg .grid ellipse { stroke: ${COLOR.grid}; stroke-width: 1; fill: none; }
  svg .axis line { stroke: ${COLOR.axis}; stroke-width: 1.2; }
  svg .asym line { stroke: ${COLOR.asym}; stroke-width: 1; stroke-dasharray: 5 5; }
  svg .curve { fill: none; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
  svg .tick { font-size: 11px; fill: ${COLOR.muted}; }
  svg .tick--mark { font-size: 12px; font-style: italic; font-weight: 600; fill: ${COLOR.ink}; }
  svg .axisname { font-size: 12px; font-style: italic; fill: ${COLOR.ink}; }
  svg .legend { font-size: 12px; fill: ${COLOR.ink}; }
  svg .figname { font-size: 13px; font-weight: 600; }
  svg .note { font-size: 12px; fill: ${COLOR.muted}; }
  svg .note[data-color="accent"] { fill: ${COLOR.accent}; }
  svg .note[data-color="red"] { fill: ${COLOR.red}; }
  svg .note[data-color="green"] { fill: ${COLOR.green}; }
  svg .note[data-color="ink"] { fill: ${COLOR.ink}; }`.trim();

  const body = [
    `<style>${style}</style>`,
    `<defs><clipPath id="${clipId}"><rect x="${num(L)}" y="${num(T)}" width="${num(
      w
    )}" height="${num(h)}" rx="6"/></clipPath></defs>`,
    `<rect x="${num(L)}" y="${num(T)}" width="${num(w)}" height="${num(h)}" fill="${
      fig.background ?? 'none'
    }" rx="6"/>`,
    `<g class="grid" clip-path="url(#${clipId})">${grid.join('')}</g>`,
    `<g class="asym" clip-path="url(#${clipId})">${asym.join('')}</g>`,
    `<g class="axis">${axis.join('')}</g>`,
    `<g clip-path="url(#${clipId})">${curves.join('')}</g>`,
    `<g>${labels.join('')}</g>`,
    `<g>${dots.join('')}</g>`,
    `<g>${notes.join('')}</g>`,
    `<g>${heading.join('')}</g>`,
    `<g>${legend.join('')}</g>`,
  ].join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(
    fig.alt ?? fig.id
  )}">
  <title>${esc(fig.alt ?? fig.id)}</title>
  ${body}
</svg>
`;
}

// ------------------------------------------------------------------ 图形清单
const A = 2; // 心形线的 a

// 介值定理那张图：函数、两个端点、被取到的中间值都写在一处，
// 图和「A = f(a)」「B = f(b)」这些标注就不会对不上。
const IVT_F = '2 + 1.2*sin(1.4*(x-1)) + 0.32*(x-1)';
const ivtAt = (x) => 2 + 1.2 * Math.sin(1.4 * (x - 1)) + 0.32 * (x - 1);
const IVT_A = 0.8;
const IVT_B = 5.6;
const IVT_C = 2.8;

// 中值定理那几张：函数、区间、被点名的位置都只写一处。
// ξ 不手抄坐标 —— 罗尔定理解的是 f′(ξ)=0，拉格朗日解的是 f′(ξ)=弦斜率；
// 手填一个「大概在 3.5」，图和定理就对不上了。
function fnOf(expr, consts = {}) {
  return compile(expr, 'x', consts);
}

/** 在 [lo, hi] 里解 f′(x) = slope，返回第一个解 */
function solveSlope(expr, slope, lo, hi, consts = {}) {
  const f = compile(expr, 'x', consts);
  const h = 1e-5;
  const d = (x) => (f(x + h) - f(x - h)) / (2 * h);
  const N = 4000;
  let px = lo;
  let pv = d(lo) - slope;
  for (let i = 1; i <= N; i++) {
    const x = lo + ((hi - lo) * i) / N;
    const v = d(x) - slope;
    if (pv * v <= 0) {
      let a = px;
      let b = x;
      for (let k = 0; k < 80; k++) {
        const m = (a + b) / 2;
        if ((d(a) - slope) * (d(m) - slope) <= 0) b = m;
        else a = m;
      }
      return (a + b) / 2;
    }
    px = x;
    pv = v;
  }
  return null;
}

// 费马引理：内点取到极大值，极值点处切线水平
const FERMAT_F = '3 - 0.5*(x-1)^2';
const FERMAT_X0 = 1;

// 罗尔定理：f(a) = f(b)，内部必有 f′(ξ) = 0
const ROLLE_F = '1.2 + 1.6*sin(pi*(x-0.6)/4.2)';
const ROLLE_A = 0.6;
const ROLLE_B = 4.8;
const ROLLE_XI = solveSlope(ROLLE_F, 0, ROLLE_A, ROLLE_B);

// 拉格朗日：ξ 由「f′(ξ) = 弦斜率」解出来
const LAG_F = '2.2 + 1.5*sin(0.7*(x-0.6))';
const LAG_A = 0.6;
const LAG_B = 5.4;
const LAG_K = (fnOf(LAG_F)(LAG_B) - fnOf(LAG_F)(LAG_A)) / (LAG_B - LAG_A);
const LAG_XI = solveSlope(LAG_F, LAG_K, LAG_A, LAG_B);

// 凹弧 / 凸弧：同一个框里的镜像（凹弧的弦在上方，凸弧的弦在下方）
const CONCAVE_F = '0.35*x^2 + 0.35';
const CONVEX_F = '2.45 - 0.35*x^2';
const CURVE_A = -1.8;
const CURVE_B = 1.8;

export const FIGURES = [
  {
    id: 'hm1-01-symbol-function-graph',
    title: 'y = sgn x',
    alt: '符号函数的图像：x 为负时取值 -1，为零时取值 0，为正时取值 1',
    width: 640,
    height: 400,
    x: [-3.2, 3.2],
    y: [-2, 2],
    xTick: { type: 'num', target: 6 },
    yTick: { type: 'num', target: 4 },
    // 分段函数的两段水平射线：直接给端点比让采样器去猜跳变干净得多
    segments: [
      { points: [[-3.2, -1], [0, -1]], color: 'accent' },
      { points: [[0, 1], [3.2, 1]], color: 'accent' },
    ],
    dots: [
      { x: 0, y: 0, color: 'ink', label: '(0, 0)', dx: 10, dy: -8 },
      { x: 0, y: 1, color: 'accent', open: true, r: 3.2 },
      { x: 0, y: -1, color: 'accent', open: true, r: 3.2 },
    ],
  },
  {
    id: 'hm1-02-floor-function-graph',
    title: 'y = [x]',
    alt: '取整函数的图像：阶梯状，x 每经过一个整数，函数值就往上跳一级',
    width: 640,
    height: 400,
    x: [-3.2, 3.2],
    y: [-4.2, 3.8],
    xTick: { type: 'num', target: 6 },
    yTick: { type: 'num', target: 8 },
    // breaks：跨过整数的线段要断开，否则阶梯会被连成一条斜线
    curves: [{ fn: 'floor(x)', color: 'accent', breaks: [-3, -2, -1, 0, 1, 2, 3] }],
  },
  {
    id: 'hm1-03-inverse-function-graph',
    alt: '函数 y = e^x 与它的反函数 y = ln x 的图像关于直线 y = x 对称',
    width: 530,
    height: 530, // 正方形 + 两轴同范围 = 1:1 比例，y = x 才能真正画成 45°
    x: [-3.4, 3.4],
    y: [-3.4, 3.4],
    xTick: { type: 'num', target: 6 },
    yTick: { type: 'num', target: 6 },
    curves: [
      { fn: 'exp(x)', color: 'accent' },
      { fn: 'ln(x)', color: 'red' },
      { fn: 'x', color: 'grid', dash: '6 5', samples: 2 },
    ],
    legend: [
      { label: 'y = e^{x}', color: 'accent' },
      { label: 'y = ln x', color: 'red' },
      { label: 'y = x', color: 'grid', dash: '6 5' },
    ],
    // 一对互为对称的点：(0,1) 与 (1,0)
    dots: [
      { x: 0, y: 1, color: 'accent', r: 3 },
      { x: 1, y: 0, color: 'red', r: 3 },
    ],
  },
  // 余切 / 正割 / 余割：**一图一条**。三条叠在一张里（原来的手绘图就是这样）
  // 交点、渐近线、零点全挤在一块儿，读者盯着看也分不清哪条是哪条；
  // 分开之后每张都能单独配一句「为什么长这样」的说明。
  // 三张统一 x ∈ [-2π, 2π]、y ∈ [-6, 6]，读者来回翻的时候坐标框架是同一个。
  {
    id: 'hm1-04-1-cot-graph',
    title: 'y = cot x',
    alt: '余切函数 y = cot x 的图像：周期为 π，在每个 kπ 处有竖直渐近线，零点在 π/2 + kπ',
    width: 640,
    height: 400,
    x: [-2 * Math.PI, 2 * Math.PI],
    y: [-6, 6],
    xTick: { type: 'pi', denom: 2 },
    yTick: { type: 'num', target: 6 },
    curves: [{ fn: 'cot(x)', color: 'accent' }],
    // x = 0 那条与 y 轴重合、±2π 两条压在边框上，代码会自己跳过
    asymptotes: [{ x: -2 * Math.PI }, { x: -Math.PI }, { x: 0 }, { x: Math.PI }, { x: 2 * Math.PI }],
  },
  {
    id: 'hm1-04-2-sec-graph',
    title: 'y = sec x',
    alt: '正割函数 y = sec x 的图像：周期为 2π，在 π/2 + kπ 处有竖直渐近线，|sec x| ≥ 1',
    width: 640,
    height: 400,
    x: [-2 * Math.PI, 2 * Math.PI],
    y: [-6, 6],
    xTick: { type: 'pi', denom: 2 },
    yTick: { type: 'num', target: 6 },
    curves: [{ fn: 'sec(x)', color: 'red' }],
    asymptotes: [
      { x: -1.5 * Math.PI },
      { x: -0.5 * Math.PI },
      { x: 0.5 * Math.PI },
      { x: 1.5 * Math.PI },
    ],
  },
  {
    id: 'hm1-04-3-csc-graph',
    title: 'y = csc x',
    alt: '余割函数 y = csc x 的图像：周期为 2π，在每个 kπ 处有竖直渐近线，|csc x| ≥ 1',
    width: 640,
    height: 400,
    x: [-2 * Math.PI, 2 * Math.PI],
    y: [-6, 6],
    xTick: { type: 'pi', denom: 2 },
    yTick: { type: 'num', target: 6 },
    curves: [{ fn: 'csc(x)', color: 'green' }],
    asymptotes: [{ x: -2 * Math.PI }, { x: -Math.PI }, { x: 0 }, { x: Math.PI }, { x: 2 * Math.PI }],
  },
  // 四个反三角函数：一本教材里通常是 2×2 的四联图，但那是「一张图里塞四个坐标系」。
  // 判读时四个坐标系挤在一起，值域又各不相同；按一图一条拆成四张之后，
  // 每张都把「定义域端点有没有取到」用实心点标出来，读者不用来回比。
  {
    id: 'hm1-05-1-arcsin-graph',
    title: 'y = arcsin x',
    alt: '反正弦函数 y = arcsin x 的图像：定义域 [-1, 1]，值域 [-π/2, π/2]，单调递增',
    width: 620,
    height: 400,
    x: [-1.35, 1.35],
    y: [-2.1, 2.1],
    xTick: { type: 'num', target: 5 },
    yTick: { type: 'pi', denom: 2 },
    hguides: [{ y: -Math.PI / 2 }, { y: Math.PI / 2 }],
    curves: [{ fn: 'asin(x)', color: 'accent', domain: [-1, 1] }],
    dots: [
      { x: -1, y: -Math.PI / 2, color: 'accent', r: 3.2 },
      { x: 1, y: Math.PI / 2, color: 'accent', r: 3.2 },
    ],
  },
  {
    id: 'hm1-05-2-arccos-graph',
    title: 'y = arccos x',
    alt: '反余弦函数 y = arccos x 的图像：定义域 [-1, 1]，值域 [0, π]，单调递减',
    width: 620,
    height: 400,
    x: [-1.35, 1.35],
    y: [-0.6, 3.6],
    xTick: { type: 'num', target: 5 },
    yTick: { type: 'pi', denom: 2 },
    hguides: [{ y: 0 }, { y: Math.PI }],
    curves: [{ fn: 'acos(x)', color: 'accent', domain: [-1, 1] }],
    dots: [
      { x: -1, y: Math.PI, color: 'accent', r: 3.2 },
      { x: 1, y: 0, color: 'accent', r: 3.2 },
    ],
  },
  {
    id: 'hm1-05-3-arctan-graph',
    title: 'y = arctan x',
    alt: '反正切函数 y = arctan x 的图像：定义域 R，值域 (-π/2, π/2)，两端是水平渐近线',
    width: 640,
    height: 400,
    x: [-6, 6],
    y: [-2.1, 2.1],
    xTick: { type: 'num', target: 6 },
    yTick: { type: 'pi', denom: 2 },
    hguides: [{ y: -Math.PI / 2 }, { y: Math.PI / 2 }],
    curves: [{ fn: 'atan(x)', color: 'accent' }],
  },
  {
    id: 'hm1-05-4-arccot-graph',
    title: 'y = arccot x',
    alt: '反余切函数 y = arccot x 的图像：定义域 R，值域 (0, π)，两端是水平渐近线 y = 0 与 y = π',
    width: 640,
    height: 400,
    x: [-6, 6],
    y: [-0.6, 3.6],
    xTick: { type: 'num', target: 6 },
    yTick: { type: 'pi', denom: 2 },
    hguides: [{ y: 0 }, { y: Math.PI }],
    // 本站取 arccot 的值域为 (0, π)，所以它是 π/2 - arctan x，不是 arctan(1/x)
    curves: [{ fn: 'pi/2 - atan(x)', color: 'accent' }],
  },
  {
    id: 'hm1-06-boundedness-example-graph',
    alt: '例 3 中 f(x) = 1/(x-2) 的图像：x 从右侧靠近 2 时函数值趋于 +∞，x 趋于 +∞ 时函数值趋于 0',
    width: 640,
    height: 400,
    x: [-1.5, 6.5],
    y: [-4, 4],
    xTick: { type: 'num', target: 8 },
    yTick: { type: 'num', target: 8 },
    asymptotes: [{ x: 2 }],
    curves: [{ fn: '1/(x-2)', color: 'accent' }],
    // 例 3 把区间分成 (2,3) 和 (3,+∞)，这里标出分界点
    dots: [{ x: 3, y: 1, color: 'ink', label: '(3, 1)', dx: 9, dy: -9 }],
  },
  {
    id: 'hm1-07-unbounded-not-infinite',
    alt: 'y = x·cos x 的图像：振幅随 |x| 增大而增大，在正负之间无限振荡；虚线为包络 y = ±x',
    width: 760,
    height: 400,
    x: [-4 * Math.PI, 4 * Math.PI],
    y: [-14, 14],
    xTick: { type: 'pi', denom: 2 },
    yTick: { type: 'num', target: 7 },
    curves: [
      { fn: 'x', color: 'grid', dash: '6 5', samples: 2 },
      { fn: '-x', color: 'grid', dash: '6 5', samples: 2 },
      { fn: 'x*cos(x)', color: 'accent' },
    ],
    legend: [
      { label: 'y = x cos x', color: 'accent' },
      { label: 'y = ±x（包络）', color: 'grid', dash: '6 5' },
    ],
    notes: [
      { x: 2.2 * Math.PI, y: 10.4, text: '振幅随 |x| 增大', color: 'muted' },
      { x: 2.2 * Math.PI, y: 8.2, text: '但始终有界地被包住', color: 'muted' },
    ],
  },
  {
    id: 'hm1-11-intermediate-value-theorem',
    alt: '介值定理的几何意义：f(a) = A 与 f(b) = B 之间的任意一个 C，曲线上都至少有一点取到它',
    width: 660,
    height: 420,
    x: [-0.2, 6.6],
    y: [1.2, 4.2],
    xTick: { type: 'num', target: 3 },
    yTick: { type: 'num', target: 4 },
    // 用竖直虚线标出 a、b，水平虚线标出 C
    asymptotes: [{ x: IVT_A }, { x: IVT_B }],
    hguides: [{ y: IVT_C }],
    curves: [{ fn: IVT_F, color: 'accent' }],
    xMarks: [
      { x: IVT_A, label: 'a' },
      { x: IVT_B, label: 'b' },
    ],
    yMarks: [
      { y: ivtAt(IVT_A), label: 'A' },
      { y: ivtAt(IVT_B), label: 'B' },
      { y: IVT_C, label: 'C' },
    ],
    dots: [
      { x: IVT_A, y: ivtAt(IVT_A), color: 'ink', r: 3.2 },
      { x: IVT_B, y: ivtAt(IVT_B), color: 'ink', r: 3.2 },
    ],
    // 交点由求值器自己二分算出来，省得手填一个「大概在 1.44」的数
    crossings: [{ fn: IVT_F, y: IVT_C, label: 'ξ', color: 'red', dx: 8, dy: -9 }],
  },
  {
    id: 'hm2-02-geometric-meaning',
    alt: '导数的几何意义：曲线 y = f(x) 在点 (x₀, y₀) 处切线的斜率就是 f′(x₀)',
    width: 640,
    height: 420,
    x: [-3, 3.2],
    y: [-0.8, 5.2],
    xTick: { type: 'num', target: 4 },
    yTick: { type: 'num', target: 4 },
    asymptotes: [{ x: 1 }],
    curves: [{ fn: '0.5*x^2 + 1', color: 'accent' }],
    // 斜率由中心差分算，规格里只写「哪条曲线、在哪一点切线」
    tangents: [{ fn: '0.5*x^2 + 1', at: 1, color: 'red' }],
    xMarks: [{ x: 1, label: 'x_{0}' }],
    yMarks: [{ y: 1.5, label: 'y_{0}' }],
    dots: [{ x: 1, y: 1.5, color: 'ink', label: '(x_{0}, y_{0})', dx: 10, dy: -10 }],
    notes: [{ x: 2.05, y: 4.35, text: '切线：斜率 = f′(x_{0})', color: 'red' }],
  },
  // 双曲函数（初等函数一节的「拓展」）：同样一图一条，画布与前三组一致。
  // 编号取 12 而不是插进 05 后面 —— 06–11 已经在正文里引用了，改名只会制造无谓改动。
  // 这里三个函数的 y 范围不完全相同：sinh/cosh 按 eˣ/2 增长，用 ±6；
  // tanh 夹在 (−1, 1) 里，硬套 ±6 会把它压成贴着 x 轴的一条直线，所以单独取 ±1.8。
  {
    id: 'hm1-12-1-sinh-graph',
    title: 'y = sinh x',
    alt: '双曲正弦 y = sh x = sinh x = (e^x − e^(−x))/2 的图像：奇函数，过原点，|x| 增大时按指数增长',
    width: 640,
    height: 400,
    x: [-2.5, 2.5],
    y: [-6, 6],
    xTick: { type: 'num', target: 5 },
    yTick: { type: 'num', target: 6 },
    curves: [{ fn: '(exp(x) - exp(-x))/2', color: 'accent' }],
    dots: [{ x: 0, y: 0, color: 'ink', r: 3.2 }],
  },
  {
    id: 'hm1-12-2-cosh-graph',
    title: 'y = cosh x',
    alt: '双曲余弦 y = ch x = cosh x = (e^x + e^(−x))/2 的图像：偶函数，在 x = 0 处取最小值 1，图像呈悬链线形',
    width: 640,
    height: 400,
    x: [-2.5, 2.5],
    y: [-6, 6],
    xTick: { type: 'num', target: 5 },
    yTick: { type: 'num', target: 6 },
    // 最小值那条水平虚线是这张图的信息量所在：cosh x ≥ 1
    hguides: [{ y: 1 }],
    curves: [{ fn: '(exp(x) + exp(-x))/2', color: 'accent' }],
    dots: [{ x: 0, y: 1, color: 'ink', r: 3.2, label: '(0, 1)', dx: 9, dy: -8 }],
  },
  {
    id: 'hm1-12-3-tanh-graph',
    title: 'y = tanh x',
    alt: '双曲正切 y = th x = tanh x 的图像：奇函数，单调递增，两端以 y = 1 与 y = −1 为水平渐近线',
    width: 640,
    height: 400,
    x: [-2.5, 2.5],
    y: [-1.8, 1.8],
    xTick: { type: 'num', target: 5 },
    yTick: { type: 'num', target: 6 },
    hguides: [{ y: -1 }, { y: 1 }],
    curves: [{ fn: 'tanh(x)', color: 'accent' }],
    dots: [{ x: 0, y: 0, color: 'ink', r: 3.2 }],
  },
  // ── 微分中值定理（第 3 章）─────────────────────────────────────────
  // 这几张的共同点：曲线 + 一条虚线（弦或渐近线）+ 一条切线。
  // ξ 一律由 solveSlope 解出来，保证「切线确实平行于弦」是算出来的，不是画得像。
  {
    id: 'hm3-01-fermat-lemma',
    alt: '费马引理：可导的极大值点 x₀ 处，曲线的切线是水平的',
    width: 640,
    height: 400,
    x: [-2, 4],
    y: [-2, 4],
    xTick: { type: 'num', target: 6 },
    yTick: { type: 'num', target: 6 },
    curves: [{ fn: FERMAT_F, color: 'accent' }],
    tangents: [{ fn: FERMAT_F, at: FERMAT_X0, color: 'red' }],
    asymptotes: [{ x: FERMAT_X0 }],
    xMarks: [{ x: FERMAT_X0, label: 'x_{0}' }],
    dots: [{ x: FERMAT_X0, y: fnOf(FERMAT_F)(FERMAT_X0), color: 'ink', label: '极大值点', dx: 10, dy: -11 }],
    legend: [
      { label: 'y = f(x)', color: 'accent' },
      { label: '切线（水平）', color: 'red' },
    ],
  },
  {
    id: 'hm3-02-rolles-theorem',
    alt: '罗尔定理：f(a) = f(b) 时，区间内至少有一点 ξ 处切线水平、平行于两端点的连线',
    width: 640,
    height: 400,
    x: [-0.4, 6],
    y: [0.3, 3.4],
    xTick: { type: 'num', target: 4 },
    yTick: { type: 'num', target: 4 },
    curves: [{ fn: ROLLE_F, color: 'accent' }],
    asymptotes: [{ x: ROLLE_A }, { x: ROLLE_B }],
    // 弦：因为 f(a) = f(b)，它正好是水平的
    segments: [
      {
        points: [
          [ROLLE_A, fnOf(ROLLE_F)(ROLLE_A)],
          [ROLLE_B, fnOf(ROLLE_F)(ROLLE_B)],
        ],
        color: 'red',
        dash: '6 5',
      },
    ],
    tangents: [{ fn: ROLLE_F, at: ROLLE_XI, color: 'green' }],
    xMarks: [
      { x: ROLLE_A, label: 'a' },
      { x: ROLLE_B, label: 'b' },
    ],
    dots: [
      { x: ROLLE_A, y: fnOf(ROLLE_F)(ROLLE_A), color: 'ink', r: 3.2 },
      { x: ROLLE_B, y: fnOf(ROLLE_F)(ROLLE_B), color: 'ink', r: 3.2 },
      { x: ROLLE_XI, y: fnOf(ROLLE_F)(ROLLE_XI), color: 'ink', label: 'ξ', dx: 9, dy: -8 },
    ],
    legend: [
      { label: 'y = f(x)', color: 'accent' },
      { label: '弦（水平）', color: 'red', dash: '6 5' },
      { label: 'f′(ξ) = 0', color: 'green' },
    ],
  },
  {
    id: 'hm3-03-lagrange-mvt',
    alt: '拉格朗日中值定理：区间内至少有一点 ξ，该点切线平行于连接两端点的弦',
    width: 640,
    height: 400,
    x: [-0.2, 6.2],
    y: [-0.8, 4.4],
    xTick: { type: 'num', target: 4 },
    yTick: { type: 'num', target: 5 },
    curves: [{ fn: LAG_F, color: 'accent' }],
    asymptotes: [{ x: LAG_A }, { x: LAG_B }],
    segments: [
      {
        points: [
          [LAG_A, fnOf(LAG_F)(LAG_A)],
          [LAG_B, fnOf(LAG_F)(LAG_B)],
        ],
        color: 'red',
        dash: '6 5',
      },
    ],
    // 切线斜率 = 弦斜率（由 solveSlope 解出 ξ，指数来的斜率自然相同）
    tangents: [{ fn: LAG_F, at: LAG_XI, color: 'green' }],
    xMarks: [
      { x: LAG_A, label: 'a' },
      { x: LAG_B, label: 'b' },
    ],
    dots: [
      { x: LAG_A, y: fnOf(LAG_F)(LAG_A), color: 'ink', r: 3.2 },
      { x: LAG_B, y: fnOf(LAG_F)(LAG_B), color: 'ink', r: 3.2 },
      { x: LAG_XI, y: fnOf(LAG_F)(LAG_XI), color: 'ink', label: 'ξ', dx: 9, dy: -8 },
    ],
    legend: [
      { label: 'y = f(x)', color: 'accent' },
      { label: '弦', color: 'red', dash: '6 5' },
      { label: '切线（平行于弦）', color: 'green' },
    ],
  },
  {
    id: 'hm3-04-1-concave-graph',
    alt: '凹弧：曲线位于弦的下方，f″ > 0，开口向上',
    width: 600,
    height: 400,
    x: [-2.2, 2.2],
    y: [0, 2.8],
    xTick: { type: 'num', target: 4 },
    yTick: { type: 'num', target: 4 },
    curves: [{ fn: CONCAVE_F, color: 'accent' }],
    segments: [
      // 弦
      {
        points: [
          [CURVE_A, fnOf(CONCAVE_F)(CURVE_A)],
          [CURVE_B, fnOf(CONCAVE_F)(CURVE_B)],
        ],
        color: 'red',
        dash: '6 5',
      },
      // 中点处的「弦高 − 弧高」：这一段就是凹凸性定义的几何含义
      {
        points: [
          [0, fnOf(CONCAVE_F)(0)],
          [0, fnOf(CONCAVE_F)(CURVE_A)],
        ],
        color: 'red',
        dash: '3 4',
        width: 1.4,
      },
    ],
    dots: [
      { x: CURVE_A, y: fnOf(CONCAVE_F)(CURVE_A), color: 'ink', r: 3 },
      { x: CURVE_B, y: fnOf(CONCAVE_F)(CURVE_B), color: 'ink', r: 3 },
      { x: 0, y: fnOf(CONCAVE_F)(0), color: 'ink', r: 3 },
    ],
    legend: [
      { label: '凹弧 f″ > 0', color: 'accent' },
      { label: '弦', color: 'red', dash: '6 5' },
    ],
  },
  {
    id: 'hm3-04-2-convex-graph',
    alt: '凸弧：曲线位于弦的上方，f″ < 0，开口向下',
    width: 600,
    height: 400,
    x: [-2.2, 2.2],
    y: [0, 2.8],
    xTick: { type: 'num', target: 4 },
    yTick: { type: 'num', target: 4 },
    curves: [{ fn: CONVEX_F, color: 'accent' }],
    segments: [
      {
        points: [
          [CURVE_A, fnOf(CONVEX_F)(CURVE_A)],
          [CURVE_B, fnOf(CONVEX_F)(CURVE_B)],
        ],
        color: 'red',
        dash: '6 5',
      },
      {
        points: [
          [0, fnOf(CONVEX_F)(0)],
          [0, fnOf(CONVEX_F)(CURVE_A)],
        ],
        color: 'red',
        dash: '3 4',
        width: 1.4,
      },
    ],
    dots: [
      { x: CURVE_A, y: fnOf(CONVEX_F)(CURVE_A), color: 'ink', r: 3 },
      { x: CURVE_B, y: fnOf(CONVEX_F)(CURVE_B), color: 'ink', r: 3 },
      { x: 0, y: fnOf(CONVEX_F)(0), color: 'ink', r: 3 },
    ],
    legend: [
      { label: '凸弧 f″ < 0', color: 'accent' },
      { label: '弦', color: 'red', dash: '6 5' },
    ],
  },
  // ── 渐近线三张：三种类型各一张，判断顺序「铅直 → 水平 → 斜」就是这三张的顺序 ──
  {
    id: 'hm3-07-vertical-asymptote',
    alt: '铅直渐近线：x 趋于 x₀ 时函数值的绝对值无限增大，曲线贴近竖直直线 x = x₀',
    width: 640,
    height: 400,
    x: [-2.5, 4.5],
    y: [-6, 6],
    xTick: { type: 'num', target: 6 },
    yTick: { type: 'num', target: 6 },
    asymptotes: [{ x: 1 }],
    curves: [{ fn: '1/(x-1)', color: 'accent' }],
    legend: [
      { label: 'y = f(x)', color: 'accent' },
      { label: 'x = x_{0}', color: 'asym' },
    ],
    notes: [{ x: 1.12, y: 4.9, text: 'x → x_{0} 时 f(x) → ∞', color: 'muted' }],
  },
  {
    id: 'hm3-06-horizontal-asymptote',
    alt: '水平渐近线：x 趋于 ±∞ 时曲线无限贴近水平直线 y = A',
    width: 640,
    height: 400,
    x: [-6, 6],
    y: [-0.3, 2.7],
    xTick: { type: 'num', target: 6 },
    yTick: { type: 'num', target: 3 },
    hguides: [{ y: 2 }],
    curves: [{ fn: '(2*x^2+1)/(x^2+1)', color: 'accent' }],
    legend: [
      { label: 'y = f(x)', color: 'accent' },
      { label: 'y = A', color: 'asym' },
    ],
    notes: [{ x: 2.9, y: 1.25, text: 'x → ±∞ 时贴近 y = A', color: 'muted' }],
  },
  {
    id: 'hm3-08-oblique-asymptote',
    alt: '斜渐近线：x 趋于 ±∞ 时曲线与直线 y = kx + b 无限接近',
    width: 640,
    height: 400,
    x: [-6, 6],
    y: [-7, 7],
    xTick: { type: 'num', target: 6 },
    yTick: { type: 'num', target: 4 },
    curves: [{ fn: 'x + 2/(x^2+1)', color: 'accent' }],
    segments: [
      {
        points: [
          [-6, -6],
          [6, 6],
        ],
        color: 'red',
        dash: '6 5',
      },
    ],
    legend: [
      { label: 'y = f(x)', color: 'accent' },
      { label: 'y = kx + b', color: 'red', dash: '6 5' },
    ],
    notes: [{ x: 2.4, y: 0.95, text: 'x → ∞ 时贴近 y = kx + b', color: 'muted' }],
  },
  // 「函数图形的描绘」那道例题的图：把上面五步的结果全画在一张图上 ——
  // 定义域断点、极值点、渐近线、两侧的凹凸性，读者一边看解法一边对图。
  {
    id: 'hm3-05-function-graphing',
    alt: '例 1 的图形：y = x²/(x−1) 在 x = 0 处取极大值 0、在 x = 2 处取极小值 4；x = 1 是铅直渐近线，y = x + 1 是斜渐近线',
    width: 640,
    height: 420,
    x: [-5, 6],
    y: [-6, 9],
    xTick: { type: 'num', target: 6 },
    yTick: { type: 'num', target: 8 },
    asymptotes: [{ x: 1 }],
    // 斜渐近线 y = x + 1（端点给在框外，靠裁剪）
    segments: [
      {
        points: [
          [-5, -4],
          [6, 7],
        ],
        color: 'red',
        dash: '6 5',
      },
    ],
    curves: [{ fn: 'x^2/(x-1)', color: 'accent' }],
    dots: [
      { x: 0, y: 0, color: 'ink', label: '极大值 (0, 0)', dx: 10, dy: -8 },
      { x: 2, y: 4, color: 'ink', label: '极小值 (2, 4)', dx: 10, dy: -10 },
    ],
    legend: [
      { label: 'y = x²/(x − 1)', color: 'accent' },
      { label: 'y = x + 1', color: 'red', dash: '6 5' },
      { label: 'x = 1', color: 'asym' },
    ],
  },
  {
    id: 'hm5-15-cardioid-graph',
    alt: '心形线 ρ = 2(1 + cos θ) 的图形，画在极坐标网格上',
    width: 600,
    height: 500,
    x: [-1.2, 4.8],
    y: [-3.2, 3.2],
    xTick: { type: 'num', target: 6 },
    yTick: { type: 'num', target: 6 },
    polarGrid: { rays: 30, circles: [1, 2, 3, 4] },
    curves: [
      {
        parametric: {
          t: [0, TAU],
          var: 't',
          consts: { a: A },
          x: 'a*(1+cos(t))*cos(t)',
          y: 'a*(1+cos(t))*sin(t)',
          samples: 900,
        },
        color: 'accent',
      },
    ],
    legend: [{ label: 'ρ = 2(1 + cos θ)', color: 'accent' }],
    notes: [
      { x: 4, y: 0.42, text: 'θ = 0：ρ = 4', anchor: 'end', color: 'muted' },
      { x: 1.05, y: -2.55, text: 'θ = π：ρ = 0（尖点）', color: 'muted' },
    ],
  },
];

// ------------------------------------------------------------------ 主流程
function main() {
  const onlyArg = process.argv.indexOf('--only');
  const only = onlyArg > -1 ? process.argv[onlyArg + 1] : null;

  const targets = FIGURES.filter((fig) => !only || fig.id.includes(only));
  if (targets.length === 0) {
    console.error(`[plot] --only ${only} 没有匹配到任何图`);
    process.exitCode = 1;
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const rows = [];
  for (const fig of targets) {
    // 先全部编译一遍再落盘：表达式写错时不要留下半套图
    for (const c of fig.curves ?? []) {
      if (c.parametric) {
        compile(c.parametric.x, c.parametric.var ?? 't', c.parametric.consts ?? {});
        compile(c.parametric.y, c.parametric.var ?? 't', c.parametric.consts ?? {});
      } else {
        compile(c.fn, 'x', c.consts ?? {});
      }
    }

    const svg = renderFigure(fig);
    const file = path.join(OUT_DIR, `${fig.id}.svg`);
    fs.writeFileSync(file, svg, 'utf8');
    rows.push({ id: fig.id, bytes: Buffer.byteLength(svg, 'utf8'), file });
  }

  const pad = (s, n) => String(s).padEnd(n);
  console.log('');
  console.log(`  ${pad('图', 34)}${pad('SVG', 10)}${pad('手绘 JPG', 12)}对比`);
  console.log(`  ${'-'.repeat(68)}`);
  for (const r of rows) {
    const jpg = path.join(OUT_DIR, `${r.id}.jpg`);
    let jpgText = '—';
    let ratio = '';
    if (fs.existsSync(jpg)) {
      const jb = fs.statSync(jpg).size;
      jpgText = `${(jb / 1024).toFixed(0)} KB`;
      ratio = `${(jb / r.bytes).toFixed(0)}× 小`;
    }
    console.log(`  ${pad(r.id, 34)}${pad(`${(r.bytes / 1024).toFixed(1)} KB`, 10)}${pad(jpgText, 12)}${ratio}`);
  }
  console.log('');
  console.log(`  → ${path.relative(ROOT, OUT_DIR)}/`);
  console.log('');
}

// 只在「直接运行」时生成图；被 test-plots.mjs 导入时不自动跑（它要自己读 FIGURES）
const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) main();
