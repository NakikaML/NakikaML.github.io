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
  // varname 可以是单个名字，也可以是名字数组（三维曲面的 x(u,v)、y(u,v)、z(u,v)）。
  // 内部统一按「变量表」求值，单变量的调用方式保持原样。
  const varNames = Array.isArray(varname) ? varname : [varname];
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
      if (varNames.includes(name)) return { k: 'var', name };
      if (name in extra) return { k: 'num', v: extra[name] };
      if (name in CONSTS) return { k: 'num', v: CONSTS[name] };
      fail(`未知标识符 ${name}（自变量是 ${varNames.join('、')}）`);
    }

    fail(`这里不该出现 "${tk.t}"`);
    return null;
  }

  const ast = parseExpr();
  if (i < tokens.length) fail(`第 ${tokens[i].at + 1} 个字符之后多出内容`);

  // 单变量：沿用 f(x) 的调用姿势；多变量：f({u, v})
  if (varNames.length === 1) {
    const name = varNames[0];
    return (v) => evalNode(ast, { [name]: v });
  }
  return (env) => evalNode(ast, env);

  function evalNode(n, env) {
    switch (n.k) {
      case 'num':
        return n.v;
      case 'var':
        return env[n.name];
      case 'neg':
        return -evalNode(n.a, env);
      case 'call':
        return FUNCS[n.name](evalNode(n.a, env));
      case 'bin': {
        const l = evalNode(n.l, env);
        const r = evalNode(n.r, env);
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
  let [x0, x1] = fig.x;
  let [y0, y1] = fig.y;
  const W = fig.width;
  const H = fig.height;
  const L = PAD.left;
  const T = PAD.top;
  const w = W - PAD.left - PAD.right;
  const h = H - PAD.top - PAD.bottom;

  // 等比：把 y 范围按画布比例撑开（保持原来的中心）。
  // 画邻域圆、方向角弧、等值线椭圆时必须开，否则圆会被拉成椭圆、
  // 手填的 (width-70)/(height-70) 又很容易算错。
  if (fig.equalAspect) {
    const want = ((x1 - x0) * h) / w;
    const mid = (y0 + y1) / 2;
    y0 = mid - want / 2;
    y1 = mid + want / 2;
  }

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
    const len = Math.hypot(dx, dy);

    // 首尾重合的闭合折线（比如「曲线 + 回到起点」的填充多边形）会把这条
    // 基准线退化成一点：d = |…|/len 全是 0，整块就被压成一个点了。
    // 这时候改用「离起点最远的那个点」切一刀，两边各自再递归。
    if (len < eps) {
      let far = -1;
      let farD = -1;
      for (let i = a + 1; i < b; i++) {
        const d = Math.hypot(pts[i][0] - ax, pts[i][1] - ay);
        if (d > farD) {
          farD = d;
          far = i;
        }
      }
      if (far > a && far < b) {
        keep[far] = 1;
        stack.push([a, far], [far, b]);
      }
      continue;
    }

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

// ------------------------------------------------------------------ 三维
/**
 * 三维示意图：参数曲面 → 正交投影 → 画家算法 → 填充着色。
 *
 * 为什么用「画家算法 + 半透明」而不是隐藏线消除：
 *   教材上的立体图习惯画成半透明网格（远处的东西隐约可见），这样读者能同时看到
 *   前后两半。半透明还有个附带好处 —— 排序偶尔出一点小错也几乎看不出来。
 *
 * 坐标约定：方位角 θ 绕 z 轴（θ=0 时 +x 朝屏幕左下方、+y 朝右下方），仰角 φ 抬高视点。
 * 屏幕右 / 屏幕上 / 指向相机 三个基向量由 θ、φ 算出，所以任何视角都不用改代码。
 */
function renderThreeD(fig) {
  const W = fig.width;
  const H = fig.height;
  const D = fig.threeD ?? {};
  const rad = (d) => (d * Math.PI) / 180;

  const theta = rad(D.azimuth ?? 40);
  const phi = rad(D.elevation ?? 20);

  const ct = Math.cos(theta);
  const st = Math.sin(theta);
  const cp = Math.cos(phi);
  const sp = Math.sin(phi);

  // 「哪个坐标轴朝上」可以指定：默认 z（右手系常规视点）。
  // 画绕 y 轴旋转的立体时，如果 y 还在屏幕里斜着躺，读者根本看不出「这是个旋转体」，
  // 所以允许把 y 摆成竖直方向 —— 只是换了个相机位置，几何一点没变。
  const AXIS_IDX = { x: 0, y: 1, z: 2 };
  const upIdx = AXIS_IDX[D.upAxis ?? 'z'] ?? 2;
  const plane = [0, 1, 2].filter((k) => k !== upIdx);
  // h1 × h2 必须等于「上」方向，否则画面会镜像
  const isCyclic = (a, b, c) =>
    (a === 0 && b === 1 && c === 2) || (a === 1 && b === 2 && c === 0) || (a === 2 && b === 0 && c === 1);
  const [i1, i2] = isCyclic(plane[0], plane[1], upIdx) ? plane : [plane[1], plane[0]];
  const h1 = [0, 0, 0];
  const h2 = [0, 0, 0];
  const upv = [0, 0, 0];
  h1[i1] = 1;
  h2[i2] = 1;
  upv[upIdx] = 1;

  const R = [0, 1, 2].map((k) => -st * h1[k] + ct * h2[k]); //              屏幕右
  const U = [0, 1, 2].map((k) => -sp * (ct * h1[k] + st * h2[k]) + cp * upv[k]); // 屏幕上
  const V = [0, 1, 2].map((k) => cp * (ct * h1[k] + st * h2[k]) + sp * upv[k]); //  指向相机

  const basis = (p) => [
    p[0] * R[0] + p[1] * R[1] + p[2] * R[2],
    p[0] * U[0] + p[1] * U[1] + p[2] * U[2],
    p[0] * V[0] + p[1] * V[1] + p[2] * V[2],
  ];

  // ---- 自动适配画布：先把所有几何用「单位缩放」投影一遍，量出边界，
  // 再反算缩放比和原点。手填 scale / origin 的版本试错成本太高 ——
  // 椭球面的远角动不动就顶到画布外面去。
  let scale = D.scale;
  let ox = D.origin?.[0];
  let oy = D.origin?.[1];
  if (D.autoFit !== false) {
    const bx = [];
    const by = [];
    const note = (p) => {
      const q = basis(p);
      if (q.every(Number.isFinite)) {
        bx.push(q[0]);
        by.push(q[1]);
      }
    };
    for (const surf of D.surfaces ?? []) {
      const fx = compile(surf.x, ['u', 'v'], surf.consts ?? {});
      const fy = compile(surf.y, ['u', 'v'], surf.consts ?? {});
      const fz = compile(surf.z, ['u', 'v'], surf.consts ?? {});
      const [u0, u1] = surf.u;
      const [v0, v1] = surf.v;
      const k = 14;
      for (let i = 0; i <= k; i++) {
        for (let j = 0; j <= k; j++) {
          const u = u0 + ((u1 - u0) * i) / k;
          const v = v0 + ((v1 - v0) * j) / k;
          note([fx({ u, v }), fy({ u, v }), fz({ u, v })]);
        }
      }
    }
    for (const ax of D.axes ?? []) {
      note(ax.from ?? [0, 0, 0]);
      note(ax.to);
    }
    for (const c of D.curves ?? []) {
      const fx = compile(c.x, 't', c.consts ?? {});
      const fy = compile(c.y, 't', c.consts ?? {});
      const fz = compile(c.z, 't', c.consts ?? {});
      const [t0, t1] = c.t;
      for (let i = 0; i <= 32; i++) {
        const t = t0 + ((t1 - t0) * i) / 32;
        note([fx(t), fy(t), fz(t)]);
      }
    }
    for (const pt of D.points ?? []) note(pt.p);

    const padL = 30;
    const padR = 24;
    const padT = 44; // 顶上给标题留位置
    const padB = 24;
    const spanX = Math.max(...bx) - Math.min(...bx) || 1;
    const spanY = Math.max(...by) - Math.min(...by) || 1;
    scale = Math.min((W - padL - padR) / spanX, (H - padT - padB) / spanY);
    // 水平居中；竖直从顶部留白处开始排 —— 否则窄高的图会全部挤在左边
    ox = (W - spanX * scale) / 2 - Math.min(...bx) * scale;
    oy = padT + Math.max(...by) * scale;
  }

  const project = (p) => {
    const [X, Y, Z] = basis(p);
    return [ox + X * scale, oy - Y * scale, Z];
  };
  const P = (x, y, z) => project([x, y, z]);

  // 光源固定在左上前方：三张图的光照方向一致，拼在一起才像一套图
  const L = [-0.42, -0.48, 0.77];
  const Ln = Math.hypot(...L);

  /** 待排序的图元：depth 越大越靠近相机，最后画 */
  const items = [];
  const push = (depth, svg) => items.push({ depth, svg });

  // ---------------------------------------------------------- 曲面
  for (const surf of D.surfaces ?? []) {
    const fx = compile(surf.x, ['u', 'v'], surf.consts ?? {});
    const fy = compile(surf.y, ['u', 'v'], surf.consts ?? {});
    const fz = compile(surf.z, ['u', 'v'], surf.consts ?? {});
    const nu = surf.nu ?? 22;
    const nv = surf.nv ?? 22;
    const [u0, u1] = surf.u;
    const [v0, v1] = surf.v;
    const at = (u, v) => [fx({ u, v }), fy({ u, v }), fz({ u, v })];

    const color = surf.color ?? 'accent';
    const alpha = surf.opacity ?? 0.8;

    for (let i = 0; i < nu; i++) {
      for (let j = 0; j < nv; j++) {
        const ua = u0 + ((u1 - u0) * i) / nu;
        const ub = u0 + ((u1 - u0) * (i + 1)) / nu;
        const va = v0 + ((v1 - v0) * j) / nv;
        const vb = v0 + ((v1 - v0) * (j + 1)) / nv;

        const p00 = at(ua, va);
        const p10 = at(ub, va);
        const p11 = at(ub, vb);
        const p01 = at(ua, vb);
        const corners = [p00, p10, p11, p01];
        if (!corners.every((c) => c.every(Number.isFinite))) continue;

        // 法向量 = 两个切向的叉积；取绝对值当漫反射，避免背面全黑
        const du = [p10[0] - p00[0], p10[1] - p00[1], p10[2] - p00[2]];
        const dv = [p01[0] - p00[0], p01[1] - p00[1], p01[2] - p00[2]];
        const nx = du[1] * dv[2] - du[2] * dv[1];
        const ny = du[2] * dv[0] - du[0] * dv[2];
        const nz = du[0] * dv[1] - du[1] * dv[0];
        const nl = Math.hypot(nx, ny, nz) || 1;
        const lam = Math.abs((nx * L[0] + ny * L[1] + nz * L[2]) / (nl * Ln));

        const q = corners.map(project);
        const depth = (q[0][2] + q[1][2] + q[2][2] + q[3][2]) / 4;
        // 坐标只留整数：640px 的画布上 1px 的误差看不出来，但能省下近一半体积
        const d =
          q.map((p, k) => `${k ? 'L' : 'M'}${num(p[0], 0)} ${num(p[1], 0)}`).join(' ') + ' Z';
        push(
          depth,
          `<path class="sf-${color}" d="${d}" fill-opacity="${num(alpha * (0.42 + 0.58 * lam), 2)}"/>`
        );
      }
    }
  }

  // ---------------------------------------------------------- 坐标轴
  const headSize = 8;
  for (const ax of D.axes ?? []) {
    const from = ax.from ?? [0, 0, 0];
    const to = ax.to;
    const a = project(from);
    const b = project(to);
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const ux = (b[0] - a[0]) / len;
    const uy = (b[1] - a[1]) / len;
    const color = COLOR[ax.color] ?? COLOR.axis;

    // 轴线切成 6 段分别入队：穿过曲面内部的那几段排在后面先画，
    // 于是被半透明曲面盖住 —— 看起来就像「藏在立体里的坐标轴」。
    const N = 6;
    for (let k = 0; k < N; k++) {
      const t0 = k / N;
      const t1 = (k + 1) / N;
      const p0 = [a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0];
      const p1 = [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1];
      const depth = a[2] + (b[2] - a[2]) * ((t0 + t1) / 2);
      push(
        depth,
        `<line class="st-${ax.color ?? 'axis'}" x1="${num(p0[0], 1)}" y1="${num(p0[1], 1)}" x2="${num(
          p1[0],
          1
        )}" y2="${num(p1[1], 1)}" stroke-width="1.1"/>`
      );
    }
    if (ax.arrow !== false) {
      // 箭头永远画在最上面，免得被曲面吃掉
      push(
        b[2] + 1000,
        `<path d="M${num(b[0], 1)} ${num(b[1], 1)} L${num(b[0] - ux * headSize + uy * 3.2, 1)} ${num(
          b[1] - uy * headSize - ux * 3.2,
          1
        )} L${num(b[0] - ux * headSize - uy * 3.2, 1)} ${num(
          b[1] - uy * headSize + ux * 3.2,
          1
        )} Z" fill="${color}"/>`
      );
    }
  }

  // ---------------------------------------------------------- 三维线段（旋转轴、半径、母线）
  for (const ln of D.lines3d ?? []) {
    const a = project(ln.from);
    const b = project(ln.to);
    const color = COLOR[ln.color] ?? COLOR.ink;
    const N = 5;
    for (let k = 0; k < N; k++) {
      const t0 = k / N;
      const t1 = (k + 1) / N;
      const p0 = [a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0];
      const p1 = [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1];
      push(
        a[2] + (b[2] - a[2]) * ((t0 + t1) / 2) + (ln.onTop ? 1000 : 0),
        `<line class="st-${ln.color ?? 'ink'}" x1="${num(p0[0], 1)}" y1="${num(
          p0[1],
          1
        )}" x2="${num(p1[0], 1)}" y2="${num(p1[1], 1)}" stroke-width="${ln.width ?? 1.4}"${
          ln.dash ? ` stroke-dasharray="${ln.dash}"` : ''
        }/>`
      );
    }
  }

  // ---------------------------------------------------------- 空间曲线（截面曲线等）
  for (const c of D.curves ?? []) {
    const fx = compile(c.x, 't', c.consts ?? {});
    const fy = compile(c.y, 't', c.consts ?? {});
    const fz = compile(c.z, 't', c.consts ?? {});
    const n = c.samples ?? 72;
    const [t0, t1] = c.t;
    const pts = [];
    for (let k = 0; k <= n; k++) {
      const t = t0 + ((t1 - t0) * k) / n;
      pts.push(P(fx(t), fy(t), fz(t)));
    }
    const color = c.color ?? 'red';
    // 逐段入队，遮挡关系和曲面一致；线宽内联，颜色走 st-<color> 类名
    for (let k = 0; k < pts.length - 1; k++) {
      push(
        (pts[k][2] + pts[k + 1][2]) / 2 + 1000,
        `<line class="st-${color}" x1="${num(pts[k][0], 1)}" y1="${num(pts[k][1], 1)}" x2="${num(
          pts[k + 1][0],
          1
        )}" y2="${num(pts[k + 1][1], 1)}" stroke-width="${c.width ?? 1.8}"/>`
      );
    }
  }

  // ---------------------------------------------------------- 排序后输出
  items.sort((x, y) => x.depth - y.depth);
  const scene = items.map((it) => it.svg).join('\n  ');

  // ---------------------------------------------------------- 文字标注（永远画在最上层）
  const texts = [];
  if (fig.title) {
    texts.push(
      `<text class="figname" x="20" y="22" fill="${COLOR.ink}">${richText(fig.title)}</text>`
    );
  }
  for (const ax of D.axes ?? []) {
    if (!ax.label) continue;
    const b = project(ax.to);
    // labelAt 给的是三维点（更准），没给就在箭头旁边偏移一点
    const [lx, ly] = ax.labelAt ? project(ax.labelAt) : [b[0] + 10, b[1] + 6];
    texts.push(
      `<text class="axisname3d" x="${num(lx)}" y="${num(ly)}" text-anchor="middle" fill="${
        COLOR[ax.color] ?? COLOR.ink
      }">${richText(ax.label)}</text>`
    );
  }
  for (const pt of D.points ?? []) {
    const p = project(pt.p);
    texts.push(
      `<circle cx="${num(p[0], 1)}" cy="${num(p[1], 1)}" r="3.2" fill="${COLOR.ink}"/>`
    );
    if (pt.label) {
      texts.push(
        `<text class="note" data-color="${pt.color ?? 'ink'}" x="${num(p[0] + (pt.dx ?? 9))}" y="${num(
          p[1] + (pt.dy ?? -8)
        )}" text-anchor="start">${richText(pt.label)}</text>`
      );
    }
  }
  for (const n of fig.notes ?? []) {
    if (!Array.isArray(n.at3)) continue;
    const p = project(n.at3);
    texts.push(
      `<text class="note" data-color="${n.color ?? 'muted'}" x="${num(p[0] + (n.dx ?? 0))}" y="${num(
        p[1] + (n.dy ?? 0)
      )}" text-anchor="${n.anchor ?? 'start'}">${richText(n.text)}</text>`
    );
  }

  // 每种曲面一个类：把 fill/stroke 的颜色写进 <style> 一次，
  // 比在每个 <path> 上重复一遍 var(--plot-c1, #d78b34) 省下几百字节 × 几百个格子
  const sfColors = [...new Set((D.surfaces ?? []).map((sf) => sf.color ?? 'accent'))];
  // 曲线 / 线段 / 坐标轴都是一条条 <line>，数量同样可观 —— 描边色也走类名
  const stColors = [
    ...new Set([
      ...(D.curves ?? []).map((c) => c.color ?? 'red'),
      ...(D.lines3d ?? []).map((l) => l.color ?? 'ink'),
      ...(D.axes ?? []).map((a) => a.color ?? 'axis'),
    ]),
  ];
  const sfCss = [
    ...sfColors.map(
      (c) =>
        `  svg .sf-${c} { fill: ${COLOR[c] ?? COLOR.accent}; stroke: ${COLOR[c] ?? COLOR.accent}; ` +
        `stroke-opacity: 0.2; stroke-width: 0.5; }`
    ),
    ...stColors.map((c) => `  svg .st-${c} { stroke: ${COLOR[c] ?? COLOR.ink}; }`),
  ].join('\n');

  const style = `
  svg { font-family: -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; }
  svg .figname { font-size: 13px; font-weight: 600; }
  svg .axisname3d { font-size: 13px; font-style: italic; }
  svg .note { font-size: 12px; fill: ${COLOR.muted}; }
  svg .note[data-color="accent"] { fill: ${COLOR.accent}; }
  svg .note[data-color="red"] { fill: ${COLOR.red}; }
  svg .note[data-color="green"] { fill: ${COLOR.green}; }
  svg .note[data-color="ink"] { fill: ${COLOR.ink}; }
${sfCss}`.trim();

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(
    fig.alt ?? fig.id
  )}">
  <title>${esc(fig.alt ?? fig.id)}</title>
  <style>${style}</style>
  <g class="scene">
  ${scene}
  </g>
  <g class="labels">
  ${texts.join('\n  ')}
  </g>
</svg>
`;
}

function renderFigure(fig) {
  if (fig.threeD) return renderThreeD(fig);
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
  // bare：纯示意图（如「区间可加性」的条形图），不要网格、刻度、坐标轴
  const bare = !!fig.bare;

  // 网格
  if (!bare) for (const t of xTickList) {
    const X = sx(t.v);
    if (X > L + 0.5 && X < right - 0.5) {
      grid.push(`<line x1="${num(X)}" y1="${num(T)}" x2="${num(X)}" y2="${num(bottom)}"/>`);
    }
  }
  for (const t of yTickList) {
    const Y = sy(t.v);
    if (Y > T + 0.5 && Y < bottom - 0.5 && !bare) {
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
  const axisY = !bare && y0 <= 0 && y1 >= 0 ? sy(0) : null;
  const axisX = !bare && x0 <= 0 && x1 >= 0 ? sx(0) : null;
  if (axisY !== null) {
    axis.push(`<line x1="${num(L - 6)}" y1="${num(axisY)}" x2="${num(right + 8)}" y2="${num(axisY)}"/>`);
  }
  if (axisX !== null) {
    axis.push(`<line x1="${num(axisX)}" y1="${num(bottom + 4)}" x2="${num(axisX)}" y2="${num(T - 8)}"/>`);
  }

  // 刻度 + 文字
  for (const t of bare ? [] : xTickList) {
    // 原点的「0」由下面 y 轴那一轮统一画（贴着 y 轴、位置更合适）。
    // 两轴都在图内时，这里再画一个就会跟它叠成「0 0」。
    if (Math.abs(t.v) < 1e-9 && axisX !== null && axisY !== null) continue;
    const X = sx(t.v);
    const Y = axisY ?? bottom;
    axis.push(`<line x1="${num(X)}" y1="${num(Y)}" x2="${num(X)}" y2="${num(Y + 4)}"/>`);
    labels.push(
      `<text class="tick" x="${num(X)}" y="${num(Y + 15)}" text-anchor="middle">${esc(t.label)}</text>`
    );
  }
  for (const t of bare ? [] : yTickList) {
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

  // 额外刻度：a / b / C / x₀ 这类「正文里点名的位置」，比普通刻度更显眼。
  // dy 用来把这些标记压到第二行 —— 否则 x = 0 处的「a」会和刻度的「0」叠在一起。
  for (const m of fig.xMarks ?? []) {
    const X = sx(m.x);
    const Y = axisY ?? bottom;
    labels.push(
      `<text class="tick tick--mark" x="${num(X)}" y="${num(Y + (m.dy ?? 15))}" text-anchor="middle">${richText(
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
  if (axisY !== null && !bare) labels.push(`<text class="axisname" x="${num(right + 6)}" y="${num(axisY - 7)}">x</text>`);
  if (axisX !== null && !bare) labels.push(`<text class="axisname" x="${num(axisX + 7)}" y="${num(T - 4)}">y</text>`);

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

  // ---- 坐标换算（带夹紧）：填充多边形可能跑到画外。夹到绘图区边界上，
  // 视觉效果与「让 clipPath 剪掉」完全一样（外面本来就要剪），
  // 但坐标不会越界、path 数据也短。
  const spanX = x1 - x0;
  const spanYd = y1 - y0;
  const px = (x) => sx(Math.max(x0, Math.min(x1, x)));
  const py = (y) => sy(Math.max(y0, Math.min(y1, y)));

  /**
   * 把一个「边界规格」采成数据坐标点列。四种写法：
   *   { fn, var?, from, to }  一元函数（var 缺省 'x'；写 'y' 时点 = (f(t), t)）
   *   { param: { x, y, t } }  参数曲线
   *   { polar: { rho, theta } } 极坐标曲线 ρ = ρ(θ)
   *   { point: [x, y] }       退化成一个点（扇形的顶点就用它）
   */
  function boundaryPoints(spec, n = 240) {
    if (spec.point) return [[spec.point[0], spec.point[1]]];

    if (spec.param) {
      const p = spec.param;
      const fx = compile(p.x, p.var ?? 't', p.consts ?? {});
      const fy = compile(p.y, p.var ?? 't', p.consts ?? {});
      const total = p.samples ?? n;
      const [t0, t1] = p.t;
      const out = [];
      for (let i = 0; i <= total; i++) {
        const t = t0 + ((t1 - t0) * i) / total;
        out.push([fx(t), fy(t)]);
      }
      return out;
    }

    if (spec.polar) {
      const q = spec.polar;
      const fr = compile(q.rho, 't', q.consts ?? {});
      const total = q.samples ?? n;
      const [a, b] = q.theta;
      const out = [];
      for (let i = 0; i <= total; i++) {
        const t = a + ((b - a) * i) / total;
        const r = fr(t);
        out.push([r * Math.cos(t), r * Math.sin(t)]);
      }
      return out;
    }

    const v = spec.var ?? 'x';
    const fn = compile(spec.fn, v, spec.consts ?? {});
    const [a, b] = spec.range ?? [0, 1];
    const out = [];
    for (let i = 0; i <= n; i++) {
      const t = a + ((b - a) * i) / n;
      out.push(v === 'x' ? [t, fn(t)] : [fn(t), t]);
    }
    return out;
  }

  // ---- 面积填充（定积分的几何意义、两个函数围成的区域、极坐标扇形都靠它）
  const fills = [];
  const hatchDefs = [];
  for (const fl of fig.fills ?? []) {
    let upper = fl.upper;
    let lower = fl.lower;

    // 简写：{ fn, from, to, baseline } = 曲线到某条水平线之间的面积
    if (fl.fn) {
      const varName = fl.var ?? 'x';
      const range = [fl.from, fl.to];
      upper = { fn: fl.fn, var: varName, range, consts: fl.consts };
      lower = { fn: String(fl.baseline ?? 0), var: varName, range };
    } else {
      // 完整写法里 from/to 挂在外面，这里补进各自的 range
      const range = fl.from != null ? [fl.from, fl.to] : null;
      if (range) {
        upper = { ...upper, range: upper.range ?? range };
        lower = { ...lower, range: lower.range ?? range };
      }
    }

    const up = boundaryPoints(upper);
    const lo = boundaryPoints(lower);
    const poly = lo.length === 1 ? [...up, lo[0]] : [...up, ...[...lo].reverse()];

    // 和曲线一样抽稀，但容差更细（0.12px）：填充的「面积」本身就是要表达的信息，
    // 容差放大会让小块区域的面积误差逼近 0.5%（曲线只要形状对，面积不对不行）。
    const screenPts = simplify(
      poly.map(([x, y]) => [px(x), py(y)]),
      0.12
    );
    const d = screenPts
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${num(x, 1)} ${num(y, 1)}`)
      .join(' ');

    // hatch: true → 不铺色块，改画 45° 斜线阴影（教材里「积分区域」的习惯画法）。
    // 做法：把区域多边形存成 clipPath，再在一大片平行线外面套上这个 clip。
    if (fl.hatch) {
      const hid = `hatch-${fig.id}-${hatchDefs.length}`;
      hatchDefs.push(`<clipPath id="${hid}"><path d="${d} Z"/></clipPath>`);
      const xs = screenPts.map((p) => p[0]);
      const ys = screenPts.map((p) => p[1]);
      const bx0 = Math.min(...xs);
      const bx1 = Math.max(...xs);
      const by0 = Math.min(...ys);
      const by1 = Math.max(...ys);
      const gap = fl.hatchGap ?? 7;
      const lines = [];
      // hatchAngle：45°（默认，教材里的斜线阴影）/ 90°（竖线）/ 0°（横线）。
      // 竖线和横线用来画「沿这个方向切片」的示意。
      const ang = ((fl.hatchAngle ?? 45) * Math.PI) / 180;
      const dx = Math.cos(ang);
      const dy = -Math.sin(ang);
      const nx = -dy; // 法向
      const ny = dx;
      const reach = Math.hypot(bx1 - bx0, by1 - by0);
      const ccx = (bx0 + bx1) / 2;
      const ccy = (by0 + by1) / 2;
      // 只需要覆盖 bbox 在法向上的投影范围，多出来的线纯属浪费字节
      const halfExtent = (Math.abs(nx) * (bx1 - bx0) + Math.abs(ny) * (by1 - by0)) / 2;
      const steps = Math.ceil(halfExtent / gap) + 1;
      for (let k = -steps; k <= steps; k++) {
        const ax1 = ccx + nx * k * gap - dx * reach;
        const ay1 = ccy + ny * k * gap - dy * reach;
        const ax2 = ccx + nx * k * gap + dx * reach;
        const ay2 = ccy + ny * k * gap + dy * reach;
        lines.push(`<line x1="${num(ax1, 1)}" y1="${num(ay1, 1)}" x2="${num(ax2, 1)}" y2="${num(
          ay2,
          1
        )}"/>`);
      }
      fills.push(
        `<g clip-path="url(#${hid})"><g class="hatch" stroke="${
          COLOR[fl.color] ?? COLOR.accent
        }">${lines.join('')}</g></g>`
      );
      continue;
    }

    fills.push(
      `<path d="${d} Z" class="fill" fill="${COLOR[fl.color] ?? COLOR.accent}" fill-opacity="${
        fl.opacity ?? 0.2
      }" stroke="none"/>`
    );
  }

  // ---- 边界实线（面积图里的 x = a、x = b 是「边界」不是「渐近线」，所以是实线）
  const guides = [];
  for (const g of fig.vguides ?? []) {
    if (g.x < x0 - 1e-6 || g.x > x1 + 1e-6) continue;
    const X = px(g.x);
    guides.push(
      `<line x1="${num(X)}" y1="${num(T)}" x2="${num(X)}" y2="${num(bottom)}"${
        g.dash ? ` stroke-dasharray="${g.dash}"` : ''
      }/>`
    );
    if (g.label) {
      // 标签必须放进未裁剪的 labels 组：guide 组带 clip-path，
      // 而这里 y = T - 4 正好落在裁剪框外面，写进 guides 里会被整条裁掉（曾经如此）
      labels.push(
        `<text class="guide-label" x="${num(X)}" y="${num(T - 5)}" text-anchor="middle">${richText(
          g.label
        )}</text>`
      );
    }
  }
  for (const g of fig.hbars ?? []) {
    if (g.y < y0 - 1e-6 || g.y > y1 + 1e-6) continue;
    const Y = py(g.y);
    guides.push(
      `<line x1="${num(L)}" y1="${num(Y)}" x2="${num(right)}" y2="${num(Y)}"${
        g.dash ? ` stroke-dasharray="${g.dash}"` : ''
      }/>`
    );
    if (g.label) {
      // 同上：hbars 的标签也在裁剪框边缘，放进 labels 才看得见
      labels.push(
        `<text class="guide-label" x="${num(right - 4)}" y="${num(Y - 5)}" text-anchor="end">${richText(
          g.label
        )}</text>`
      );
    }
  }

  // ---- 曲线
  const curves = [];
  for (const c of fig.curves ?? []) {
    const stroke = COLOR[c.color] ?? COLOR.ink;
    let lines;

    if (c.polar) {
      // 极坐标简写：ρ = ρ(θ)，内部按参数曲线画
      const q = c.polar;
      const fr = compile(q.rho, 't', q.consts ?? {});
      const total = q.samples ?? 1200;
      const [a, b] = q.theta;
      const pts = [];
      for (let i = 0; i <= total; i++) {
        const t = a + ((b - a) * i) / total;
        const r = fr(t);
        pts.push([sx(r * Math.cos(t)), sy(r * Math.sin(t))]);
      }
      lines = [pts];
    } else if (c.parametric) {
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

  // ---- 箭头（极限箭头、微元标注、坐标轴方向都靠它）
  const arrows = [];
  const HEAD = 7;
  for (const a of fig.arrows ?? []) {
    const x1s = sx(a.from[0]);
    const y1s = sy(a.from[1]);
    const x2s = sx(a.to[0]);
    const y2s = sy(a.to[1]);
    const len = Math.hypot(x2s - x1s, y2s - y1s);
    if (len < 1) continue;
    const ux = (x2s - x1s) / len;
    const uy = (y2s - y1s) / len;
    const color = COLOR[a.color] ?? COLOR.ink;
    // 线身收在箭头根部，免得线头从三角形尖上戳出来
    const shorten = a.head === false ? 0 : Math.min(HEAD * 0.85, len * 0.6);
    arrows.push(
      `<line x1="${num(x1s)}" y1="${num(y1s)}" x2="${num(x2s - ux * shorten)}" y2="${num(
        y2s - uy * shorten
      )}" class="arrow" stroke="${color}"${a.dash ? ` stroke-dasharray="${a.dash}"` : ''}/>`
    );
    if (a.head !== false) {
      const bx = x2s - ux * HEAD;
      const by = y2s - uy * HEAD;
      const nx = -uy;
      const ny = ux;
      arrows.push(
        `<path d="M${num(x2s)} ${num(y2s)} L${num(bx + nx * HEAD * 0.45)} ${num(
          by + ny * HEAD * 0.45
        )} L${num(bx - nx * HEAD * 0.45)} ${num(by - ny * HEAD * 0.45)} Z" fill="${color}"/>`
      );
    }
  }

  // ---- 角度弧（极坐标里的 θ）：按折线采样，非等比缩放下也不会变成歪椭圆
  const arcs = [];
  for (const r of fig.arcs ?? []) {
    const [cx, cy] = r.center;
    const total = 60;
    const pts = [];
    for (let i = 0; i <= total; i++) {
      const t = r.from + ((r.to - r.from) * i) / total;
      pts.push([cx + r.radius * Math.cos(t), cy + r.radius * Math.sin(t)]);
    }
    const d = pts
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${num(px(x), 1)} ${num(py(y), 1)}`)
      .join(' ');
    const color = COLOR[r.color] ?? COLOR.ink;
    arcs.push(
      `<path d="${d}" class="arc" stroke="${color}"${r.dash ? ` stroke-dasharray="${r.dash}"` : ''}/>`
    );
    if (r.label) {
      const tm = r.from + (r.to - r.from) * (r.labelAt ?? 0.5);
      const lr = r.labelRadius ?? r.radius;
      arcs.push(
        `<text class="note" data-color="${r.color ?? 'ink'}" x="${num(
          px(cx + lr * Math.cos(tm))
        )}" y="${num(py(cy + lr * Math.sin(tm))) + 4}" text-anchor="middle">${richText(
          r.label
        )}</text>`
      );
    }
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
  // 只给用到的图加对应样式：不然每张图都多几条用不上的规则，
  // 已提交的 27 个 SVG 会全部变成「已修改」，纯属噪音。
  const extraCss = [
    (fig.vguides?.length ?? 0) + (fig.hbars?.length ?? 0) > 0
      ? `  svg .guide line { stroke: ${COLOR.axis}; stroke-width: 1; stroke-dasharray: none; }\n` +
        `  svg .guide-label { font-size: 11px; fill: ${COLOR.muted}; }`
      : '',
    fig.arrows?.length ? `  svg .arrow { stroke-width: 1.3; fill: none; }` : '',
    fig.arcs?.length ? `  svg .arc { fill: none; stroke-width: 1.3; }` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const style = `
  svg { font-family: -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; }
  svg .grid line, svg .grid ellipse { stroke: ${COLOR.grid}; stroke-width: 1; fill: none; }
  svg .axis line { stroke: ${COLOR.axis}; stroke-width: 1.2; }
  svg .asym line { stroke: ${COLOR.asym}; stroke-width: 1; stroke-dasharray: 5 5; }
  svg .curve { fill: none; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
${extraCss ? `${extraCss}\n` : ''}  svg .tick { font-size: 11px; fill: ${COLOR.muted}; }
  svg .tick--mark { font-size: 12px; font-style: italic; font-weight: 600; fill: ${COLOR.ink}; }
  svg .axisname { font-size: 12px; font-style: italic; fill: ${COLOR.ink}; }
  svg .legend { font-size: 12px; fill: ${COLOR.ink}; }
  svg .figname { font-size: 13px; font-weight: 600; }
  svg .note { font-size: 12px; fill: ${COLOR.muted}; }
  svg .note[data-color="accent"] { fill: ${COLOR.accent}; }
  svg .note[data-color="red"] { fill: ${COLOR.red}; }
  svg .note[data-color="green"] { fill: ${COLOR.green}; }
  svg .note[data-color="ink"] { fill: ${COLOR.ink}; }${
    (fig.fills ?? []).some((fl) => fl.hatch)
      ? `\n  svg .hatch { stroke-width: 1; stroke-opacity: 0.55; stroke-linecap: round; }`
      : ''
  }`.trim();

  const body = [
    `<style>${style}</style>`,
    `<defs><clipPath id="${clipId}"><rect x="${num(L)}" y="${num(T)}" width="${num(
      w
    )}" height="${num(h)}" rx="6"/></clipPath>${hatchDefs.join('')}</defs>`,
    `<rect x="${num(L)}" y="${num(T)}" width="${num(w)}" height="${num(h)}" fill="${
      fig.background ?? 'none'
    }" rx="6"/>`,
    `<g class="grid" clip-path="url(#${clipId})">${grid.join('')}</g>`,
    // 空图层不输出：不然每张用不到填充/箭头的图都会多出几行空 <g>，
    // 已提交的旧图会全部变成「已修改」，diff 全是噪音。
    fills.length ? `<g class="fill-layer" clip-path="url(#${clipId})">${fills.join('')}</g>` : '',
    `<g class="asym" clip-path="url(#${clipId})">${asym.join('')}</g>`,
    guides.length ? `<g class="guide" clip-path="url(#${clipId})">${guides.join('')}</g>` : '',
    `<g class="axis">${axis.join('')}</g>`,
    `<g clip-path="url(#${clipId})">${curves.join('')}</g>`,
    arcs.length ? `<g class="arc-layer" clip-path="url(#${clipId})">${arcs.join('')}</g>` : '',
    arrows.length ? `<g class="arrow-layer">${arrows.join('')}</g>` : '',
    `<g>${labels.join('')}</g>`,
    `<g>${dots.join('')}</g>`,
    `<g>${notes.join('')}</g>`,
    `<g>${heading.join('')}</g>`,
    `<g>${legend.join('')}</g>`,
    ]
    .filter(Boolean)
    .join('\n  ');

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

// 区间可加性那两张图共用的函数：全程为正，填出来的曲边梯形一眼就能比较大小
const ADD_F = '2 + sin(x)';
const addAt = (x) => 2 + Math.sin(x);

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
  // ── 第 5 章（定积分）─────────────────────────────────────────────
  // 这一章的函数图几乎都要「画出面积」：fills 负责填色区域，vguides 负责
  // x = a / x = b 这种边界（实线，不是渐近线的虚线），xbars 式的东西用 hbars。
  {
    id: 'hm5-01-definite-integral-geometry',
    alt: '定积分的几何意义：x 轴上方的面积取正、下方的面积取负，两者代数和才是定积分的值',
    width: 640,
    height: 400,
    x: [-1.9, 1.9],
    y: [-1.6, 2.2],
    xTick: { type: 'num', target: 6 },
    yTick: { type: 'num', target: 4 },
    fills: [
      { fn: 'x^2-1', from: -1.6, to: -1, baseline: 0, color: 'accent' },
      { fn: 'x^2-1', from: -1, to: 1, baseline: 0, color: 'red' },
      { fn: 'x^2-1', from: 1, to: 1.6, baseline: 0, color: 'accent' },
    ],
    curves: [{ fn: 'x^2-1', color: 'accent' }],
    vguides: [
      { x: -1.6, label: 'a' },
      { x: 1.6, label: 'b' },
    ],
    notes: [
      { x: -1.3, y: 0.3, text: '+', color: 'accent', anchor: 'middle' },
      { x: 0, y: -0.55, text: '−', color: 'red', anchor: 'middle' },
      { x: 1.3, y: 0.3, text: '+', color: 'accent', anchor: 'middle' },
    ],
  },
  // 区间可加性：**带函数、把面积填出来**的两张对照图。
  // 只画两条色条说明不了「为什么可加」——得分明看见曲边梯形被 c 切成两块。
  // 两张图的坐标系完全相同，翻页就是纯对照。
  {
    id: 'hm5-02-1-interval-additivity-inside',
    alt: '区间可加性（c 在区间内）：曲边梯形被 x = c 处的分界线切成两块，A、C、B 三点在曲线上，∫ₐᵇ = ∫ₐᶜ + ∫ᶜᵇ',
    width: 640,
    height: 400,
    x: [-0.6, 5.6],
    y: [-0.5, 3.7],
    xTick: { type: 'num', target: 6 },
    yTick: { type: 'num', target: 4 },
    fills: [
      { fn: ADD_F, from: 0, to: 2.5, baseline: 0, color: 'accent' },
      { fn: ADD_F, from: 2.5, to: 5, baseline: 0, color: 'green' },
    ],
    curves: [{ fn: ADD_F, color: 'ink' }],
    // 三条分界线只从 x 轴画到曲线 —— 正好把两块曲边梯形围出来，
    // 画满整个高度反而像「渐近线」，也压住了曲线。
    segments: [
      { points: [[0, 0], [0, addAt(0)]], color: 'axis', width: 1.2 },
      { points: [[2.5, 0], [2.5, addAt(2.5)]], color: 'axis', width: 1.2 },
      { points: [[5, 0], [5, addAt(5)]], color: 'axis', width: 1.2 },
    ],
    // 函数上的 A、C、B 三点（与 x 轴上的 a、c、b 对应）
    dots: [
      { x: 0, y: addAt(0), color: 'ink', r: 3.4, label: 'A', dx: -11, dy: -5, anchor: 'end' },
      { x: 2.5, y: addAt(2.5), color: 'ink', r: 3.4, label: 'C', dx: 10, dy: -9 },
      { x: 5, y: addAt(5), color: 'ink', r: 3.4, label: 'B', dx: 10, dy: -6 },
    ],
    xMarks: [
      { x: 0, label: 'a', dy: 28 },
      { x: 2.5, label: 'c', dy: 28 },
      { x: 5, label: 'b', dy: 28 },
    ],
    notes: [
      { x: 1.25, y: 0.55, text: '∫ₐᶜ', anchor: 'middle', color: 'accent' },
      { x: 3.75, y: 0.55, text: '∫ᶜᵇ', anchor: 'middle', color: 'green' },
      { x: 5.35, y: 3.35, text: 'y = f(x)', anchor: 'end', color: 'ink' },
      { x: 5.35, y: 3.0, text: '∫ₐᵇ = ∫ₐᶜ + ∫ᶜᵇ', anchor: 'end', color: 'muted' },
    ],
  },
  {
    id: 'hm5-02-2-interval-additivity-outside',
    alt: '区间可加性（c 在区间外）：a 到 c 整段被 x = b 处的分界线切成两块，A、B、C 三点在曲线上，∫ₐᶜ = ∫ₐᵇ + ∫ᵇᶜ',
    width: 640,
    height: 400,
    x: [-0.6, 5.6],
    y: [-0.5, 3.7],
    xTick: { type: 'num', target: 6 },
    yTick: { type: 'num', target: 4 },
    fills: [
      { fn: ADD_F, from: 0, to: 2.5, baseline: 0, color: 'accent' },
      { fn: ADD_F, from: 2.5, to: 5, baseline: 0, color: 'green' },
    ],
    curves: [{ fn: ADD_F, color: 'ink' }],
    segments: [
      { points: [[0, 0], [0, addAt(0)]], color: 'axis', width: 1.2 },
      { points: [[2.5, 0], [2.5, addAt(2.5)]], color: 'axis', width: 1.2 },
      { points: [[5, 0], [5, addAt(5)]], color: 'axis', width: 1.2 },
    ],
    dots: [
      { x: 0, y: addAt(0), color: 'ink', r: 3.4, label: 'A', dx: -11, dy: -5, anchor: 'end' },
      { x: 2.5, y: addAt(2.5), color: 'ink', r: 3.4, label: 'B', dx: 10, dy: -9 },
      { x: 5, y: addAt(5), color: 'ink', r: 3.4, label: 'C', dx: 10, dy: -6 },
    ],
    xMarks: [
      { x: 0, label: 'a', dy: 28 },
      { x: 2.5, label: 'b', dy: 28 },
      { x: 5, label: 'c', dy: 28 },
    ],
    notes: [
      { x: 1.25, y: 0.55, text: '∫ₐᵇ', anchor: 'middle', color: 'accent' },
      { x: 3.75, y: 0.55, text: '∫ᵇᶜ', anchor: 'middle', color: 'green' },
      { x: 5.35, y: 3.35, text: 'y = f(x)', anchor: 'end', color: 'ink' },
      { x: 5.35, y: 3.0, text: '∫ₐᶜ = ∫ₐᵇ + ∫ᵇᶜ', anchor: 'end', color: 'muted' },
    ],
  },
  // 对称区间上的奇偶性：一图一条（和 1~3 章的做法一致），两张框完全一样，方便对照
  {
    id: 'hm5-03-1-even-parity',
    alt: '偶函数在对称区间上的积分：左右两半的面积相等，因此等于右半面积的两倍（偶倍）',
    width: 600,
    height: 400,
    x: [-2.4, 2.4],
    y: [-0.3, 2.6],
    xTick: { type: 'num', target: 5 },
    yTick: { type: 'num', target: 4 },
    fills: [
      { fn: 'x^2/2', from: -2, to: 0, baseline: 0, color: 'accent' },
      { fn: 'x^2/2', from: 0, to: 2, baseline: 0, color: 'accent' },
    ],
    curves: [{ fn: 'x^2/2', color: 'accent' }],
    vguides: [
      { x: -2, label: '−a' },
      { x: 0, dash: '4 4' },
      { x: 2, label: 'a' },
    ],
    notes: [
      { x: -1.2, y: 0.55, text: 'S', anchor: 'middle', color: 'ink' },
      { x: 1.2, y: 0.55, text: 'S', anchor: 'middle', color: 'ink' },
      { x: 0, y: 2.3, text: '偶函数：∫₋ₐᵃ = 2∫₀ᵃ', anchor: 'middle', color: 'accent' },
    ],
  },
  {
    id: 'hm5-03-2-odd-parity',
    alt: '奇函数在对称区间上的积分：左右两半面积大小相等、符号相反，加起来为 0（奇零）',
    width: 600,
    height: 400,
    x: [-2.4, 2.4],
    y: [-2.2, 2.2],
    xTick: { type: 'num', target: 5 },
    yTick: { type: 'num', target: 4 },
    fills: [
      { fn: 'x^3/4', from: -2, to: 0, baseline: 0, color: 'red' },
      { fn: 'x^3/4', from: 0, to: 2, baseline: 0, color: 'accent' },
    ],
    curves: [{ fn: 'x^3/4', color: 'accent' }],
    vguides: [
      { x: -2, label: '−a' },
      { x: 0, dash: '4 4' },
      { x: 2, label: 'a' },
    ],
    notes: [
      { x: -1.15, y: -0.62, text: '−S', anchor: 'middle', color: 'red' },
      { x: 1.15, y: 0.62, text: 'S', anchor: 'middle', color: 'accent' },
      { x: 0, y: 1.85, text: '奇函数：∫₋ₐᵃ = 0', anchor: 'middle', color: 'red' },
    ],
  },
  {
    id: 'hm5-04-improper-infinite-limit',
    alt: '无穷限反常积分：先把上限取成有限的 t 算出曲边梯形面积，再让 t 趋于 +∞ 取极限',
    width: 640,
    height: 400,
    x: [-0.4, 6.2],
    y: [-0.3, 2.4],
    xTick: { type: 'num', target: 6 },
    yTick: { type: 'num', target: 4 },
    fills: [{ fn: '1/x', from: 1, to: 3, baseline: 0, color: 'accent' }],
    curves: [{ fn: '1/x', color: 'accent', domain: [0.16, 6.2] }],
    vguides: [
      { x: 1, label: 'a' },
      { x: 3, dash: '5 4', label: 't' },
    ],
    arrows: [{ from: [3.5, 0.16], to: [5.9, 0.16], color: 'red' }],
    notes: [
      { x: 2, y: 0.32, text: '∫ₐᵗ', anchor: 'middle', color: 'ink' },
      { x: 5.5, y: 0.42, text: 't → +∞', anchor: 'end', color: 'red' },
    ],
  },
  {
    id: 'hm5-05-improper-p-integral',
    alt: 'p 积分的几何理解：p 越大曲线衰减越快，尾部面积越容易收敛；p = 1 时面积发散',
    width: 640,
    height: 400,
    x: [-0.2, 6.2],
    y: [-0.2, 2.5],
    xTick: { type: 'num', target: 6 },
    yTick: { type: 'num', target: 5 },
    curves: [
      { fn: '1/sqrt(x)', color: 'accent' },
      { fn: '1/x', color: 'red' },
      { fn: '1/x^2', color: 'green' },
    ],
    legend: [
      { label: 'p = 1/2（发散）', color: 'accent' },
      { label: 'p = 1（发散）', color: 'red' },
      { label: 'p = 2（收敛）', color: 'green' },
    ],
    notes: [
      { x: 3.4, y: 0.42, text: 'p 越大，衰减越快', color: 'muted' },
      { x: 3.4, y: 0.2, text: '尾部面积越容易收敛', color: 'muted' },
    ],
  },
  {
    id: 'hm5-06-improper-discontinuity',
    alt: '瑕积分：被积函数在瑕点 a 处无界，积分要先把下限取成 t 再让 t 趋于 a 的右侧极限',
    width: 640,
    height: 400,
    x: [-0.35, 4.2],
    y: [-0.3, 4.6],
    xTick: { type: 'num', target: 6 },
    yTick: { type: 'num', target: 6 },
    fills: [{ fn: '1/sqrt(x)', from: 0.5, to: 3, baseline: 0, color: 'accent' }],
    curves: [{ fn: '1/sqrt(x)', color: 'accent', domain: [0.045, 4.2] }],
    vguides: [
      { x: 0, dash: '5 4', label: 'a（瑕点）' },
      { x: 0.5, label: 't' },
    ],
    arrows: [{ from: [1.3, 0.2], to: [0.15, 0.2], color: 'red' }],
    notes: [
      { x: 1.8, y: 0.42, text: '∫ₜᵇ', anchor: 'middle', color: 'ink' },
      { x: 1.4, y: 3.9, text: 'x → a⁺ 时 f(x) → ∞', color: 'red' },
    ],
  },
  {
    id: 'hm5-07-x-type-region-area',
    alt: 'X 型区域：上下两条曲边加左右两条竖直线，面积用上曲边减下曲边作被积函数',
    width: 640,
    height: 400,
    x: [-1.8, 2.8],
    y: [-0.3, 3.9],
    xTick: { type: 'num', target: 5 },
    yTick: { type: 'num', target: 4 },
    fills: [
      {
        upper: { fn: '2.2+0.55*x', range: [-1, 2] },
        lower: { fn: '0.7+0.15*x^2', range: [-1, 2] },
        color: 'accent',
        opacity: 0.22,
      },
    ],
    curves: [
      { fn: '2.2+0.55*x', color: 'accent' },
      { fn: '0.7+0.15*x^2', color: 'green' },
    ],
    vguides: [
      { x: -1, label: 'a' },
      { x: 2, label: 'b' },
    ],
    notes: [
      { x: 2.35, y: 3.5, text: 'y = f(x)', anchor: 'end', color: 'accent' },
      { x: 2.35, y: 1.62, text: 'y = g(x)', anchor: 'end', color: 'green' },
      { x: 1.35, y: 1.3, text: 'S', anchor: 'middle', color: 'ink' },
    ],
  },
  {
    id: 'hm5-08-y-type-region',
    alt: 'Y 型区域：左右两条曲边加上下两条水平线，面积用右曲边减左曲边作被积函数',
    width: 640,
    height: 400,
    x: [0.2, 4.2],
    y: [-1.6, 2.6],
    xTick: { type: 'num', target: 5 },
    yTick: { type: 'num', target: 5 },
    fills: [
      {
        upper: { fn: '2.6+0.4*y', var: 'y', range: [-1, 2] },
        lower: { fn: '0.9+0.15*y^2', var: 'y', range: [-1, 2] },
        color: 'accent',
        opacity: 0.22,
      },
    ],
    curves: [
      { parametric: { x: '2.6+0.4*t', y: 't', t: [-1, 2] }, color: 'accent' },
      { parametric: { x: '0.9+0.15*t^2', y: 't', t: [-1, 2] }, color: 'green' },
    ],
    hbars: [
      { y: -1, label: 'c' },
      { y: 2, label: 'd' },
    ],
    notes: [
      { x: 3.9, y: 2.15, text: 'x = ψ(y)', anchor: 'end', color: 'accent' },
      { x: 0.95, y: -0.72, text: 'x = φ(y)', anchor: 'start', color: 'green' },
      { x: 1.95, y: 0.55, text: 'S', anchor: 'middle', color: 'ink' },
    ],
  },
  {
    id: 'hm5-09-y-type-region-area',
    alt: 'Y 型区域的面积元：在高度 y 处取一条水平窄条，宽度是右曲边减左曲边 ψ(y) − φ(y)',
    width: 640,
    height: 400,
    x: [0.2, 4.2],
    y: [-1.6, 2.6],
    xTick: { type: 'num', target: 5 },
    yTick: { type: 'num', target: 5 },
    fills: [
      {
        upper: { fn: '2.6+0.4*y', var: 'y', range: [-1, 2] },
        lower: { fn: '0.9+0.15*y^2', var: 'y', range: [-1, 2] },
        color: 'accent',
        opacity: 0.16,
      },
    ],
    curves: [
      { parametric: { x: '2.6+0.4*t', y: 't', t: [-1, 2] }, color: 'accent' },
      { parametric: { x: '0.9+0.15*t^2', y: 't', t: [-1, 2] }, color: 'green' },
    ],
    // 代表窄条：y = 0.6 处从 φ(0.6) 到 ψ(0.6)
    segments: [
      {
        points: [
          [0.9 + 0.15 * 0.36, 0.6],
          [2.6 + 0.4 * 0.6, 0.6],
        ],
        color: 'red',
        width: 3,
      },
    ],
    hbars: [{ y: 0.6, dash: '4 4' }],
    notes: [
      { x: 2.6, y: 0.92, text: 'ψ(y) − φ(y)', anchor: 'middle', color: 'red' },
      { x: 3.75, y: 0.36, text: 'y', anchor: 'start', color: 'muted' },
    ],
  },
  {
    id: 'hm5-10-area-example-two-curves',
    alt: '例 1 的图形：抛物线 y² = 2x 与直线 y = x − 4 交于 (2, −2) 与 (8, 4)，所围区域按 Y 型一次积完',
    width: 660,
    height: 420,
    x: [-0.6, 9.2],
    y: [-3.6, 5.2],
    xTick: { type: 'num', target: 6 },
    yTick: { type: 'num', target: 5 },
    fills: [
      {
        upper: { fn: 'y+4', var: 'y', range: [-2, 4] },
        lower: { fn: 'y^2/2', var: 'y', range: [-2, 4] },
        color: 'accent',
        opacity: 0.22,
      },
    ],
    curves: [
      { parametric: { x: 't^2/2', y: 't', t: [-3.2, 5] }, color: 'accent' },
      { parametric: { x: 't+4', y: 't', t: [-3.2, 5] }, color: 'green' },
    ],
    dots: [
      { x: 2, y: -2, color: 'ink', label: '(2, −2)', dx: 10, dy: 16, anchor: 'start' },
      { x: 8, y: 4, color: 'ink', label: '(8, 4)', dx: -10, dy: -10, anchor: 'end' },
    ],
    notes: [
      { x: 1.1, y: 3.6, text: 'y² = 2x', anchor: 'start', color: 'accent' },
      { x: 6.0, y: 1.2, text: 'y = x − 4', anchor: 'start', color: 'green' },
      { x: 5.2, y: 2.6, text: 'S = 18', anchor: 'middle', color: 'ink' },
    ],
  },
  {
    id: 'hm5-11-cycloid-graph',
    alt: '摆线 x = a(t − sin t)、y = a(1 − cos t) 的一拱，与 x 轴围成的面积是 3πa²',
    width: 660,
    height: 400,
    x: [-0.6, 7.2],
    y: [-0.5, 2.6],
    xTick: { type: 'num', target: 5 },
    yTick: { type: 'num', target: 4 },
    fills: [
      {
        upper: {
          param: { x: 't-sin(t)', y: '1-cos(t)', t: [0, 2 * Math.PI], samples: 600 },
        },
        lower: { fn: '0', range: [0, 2 * Math.PI] },
        color: 'accent',
        opacity: 0.2,
      },
    ],
    curves: [
      { parametric: { x: 't-sin(t)', y: '1-cos(t)', t: [0, 2 * Math.PI], samples: 800 }, color: 'accent' },
    ],
    vguides: [{ x: 2 * Math.PI, dash: '5 4', label: '2πa' }],
    xMarks: [{ x: Math.PI, label: 'πa' }],
    dots: [
      { x: 0, y: 0, color: 'ink', r: 3.2 },
      { x: 2 * Math.PI, y: 0, color: 'ink', r: 3.2 },
      { x: Math.PI, y: 2, color: 'ink', r: 3.2, label: '最高点 2a', dx: 10, dy: -9 },
    ],
    notes: [{ x: 3.1, y: 0.55, text: 'S = 3πa²', anchor: 'middle', color: 'ink' }],
  },
  // 极坐标系：等比例画布（x 跨度 4.8、y 跨度 3.6，配 510×400 → 1 单位像素相同），
  // 否则角度弧和射线会被拉歪。
  {
    id: 'hm5-12-polar-coordinates',
    alt: '极坐标系：极点 O、极轴、极径 ρ 与极角 θ；点 M 的极坐标写作 (ρ, θ)',
    width: 510,
    height: 400,
    x: [-0.8, 4.0],
    y: [-1.4, 2.2],
    bare: true,
    polarGrid: { rays: 45, circles: [1, 2, 3] },
    segments: [
      { points: [[0, 0], [3.85, 0]], color: 'accent', width: 1.6 },
      { points: [[0, 0], [1.9, 1.25]], color: 'green', width: 1.6 },
    ],
    arrows: [{ from: [3.55, 0], to: [3.95, 0], color: 'accent' }],
    arcs: [{ center: [0, 0], radius: 0.85, from: 0, to: Math.atan2(1.25, 1.9), color: 'red', label: 'θ', labelRadius: 1.12 }],
    dots: [
      { x: 0, y: 0, color: 'ink', r: 3.4 },
      { x: 1.9, y: 1.25, color: 'ink', r: 3.6, label: 'M(ρ, θ)', dx: 10, dy: -8 },
    ],
    notes: [
      { x: -0.14, y: -0.2, text: 'O', anchor: 'end', color: 'ink' },
      { x: 3.3, y: -0.26, text: '极轴', anchor: 'middle', color: 'accent' },
      { x: 1.18, y: 0.86, text: 'ρ', anchor: 'middle', color: 'green' },
    ],
  },
  {
    id: 'hm5-13-polar-area-sector',
    alt: '曲边扇形的面积：ρ = ρ(θ) 与两条射线围成的区域，面积微元是 dS = ½ρ²dθ',
    width: 510,
    height: 400,
    x: [-3.0, 3.0],
    y: [-2.25, 2.25],
    bare: true,
    polarGrid: { rays: 45, circles: [1, 2] },
    fills: [
      {
        upper: { polar: { rho: '1.7+0.5*cos(2*t)', theta: [0.35, 1.25] } },
        lower: { point: [0, 0] },
        color: 'accent',
        opacity: 0.22,
      },
    ],
    curves: [
      { polar: { rho: '1.7+0.5*cos(2*t)', theta: [0, 2 * Math.PI] }, color: 'accent' },
    ],
    segments: [
      { points: [[0, 0], [1.7 * 0 + (1.7 + 0.5 * Math.cos(0.7)) * Math.cos(0.35), (1.7 + 0.5 * Math.cos(0.7)) * Math.sin(0.35)]], color: 'green', dash: '5 4' },
      { points: [[0, 0], [(1.7 + 0.5 * Math.cos(2.5)) * Math.cos(1.25), (1.7 + 0.5 * Math.cos(2.5)) * Math.sin(1.25)]], color: 'green', dash: '5 4' },
    ],
    arcs: [{ center: [0, 0], radius: 0.6, from: 0.35, to: 1.25, color: 'red' }],
    notes: [
      { x: 1.0, y: 0.36, text: 'dθ', anchor: 'start', color: 'red' },
      { x: 1.55, y: 1.05, text: 'ρ = ρ(θ)', anchor: 'start', color: 'accent' },
      { x: 0.15, y: -0.28, text: 'O', anchor: 'start', color: 'ink' },
      { x: 1.05, y: 0.86, text: 'dS = ½ρ²dθ', anchor: 'start', color: 'ink' },
    ],
  },
  {
    id: 'hm5-14-polar-area-between-curves',
    alt: '两条极坐标曲线 ρ = ρ₁(θ) 与 ρ = ρ₂(θ) 之间、夹在两条射线之间的区域，面积是两者平方差的一半积分',
    width: 510,
    height: 400,
    // 外圈半径 2.3，y 必须给到 ±2.6 以上，否则圆会被绘图区上下边裁掉一截
    x: [-3.5, 3.5],
    y: [-2.625, 2.625],
    bare: true,
    polarGrid: { rays: 45, circles: [1, 2] },
    fills: [
      {
        upper: { polar: { rho: '2.3', theta: [0.3, 1.5] } },
        lower: { polar: { rho: '1.35', theta: [0.3, 1.5] } },
        color: 'accent',
        opacity: 0.22,
      },
    ],
    curves: [
      { polar: { rho: '2.3', theta: [0, 2 * Math.PI] }, color: 'accent' },
      { polar: { rho: '1.35', theta: [0, 2 * Math.PI] }, color: 'green' },
    ],
    arcs: [{ center: [0, 0], radius: 0.55, from: 0.3, to: 1.5, color: 'red' }],
    notes: [
      { x: 1.85, y: 1.15, text: 'ρ₁(θ)', anchor: 'start', color: 'accent' },
      { x: 0.95, y: 0.72, text: 'ρ₂(θ)', anchor: 'start', color: 'green' },
      { x: 0.42, y: 0.2, text: 'α', anchor: 'end', color: 'red' },
      { x: 0.45, y: 1.42, text: 'β', anchor: 'end', color: 'red' },
    ],
  },
  {
    id: 'hm5-22-arc-length-element',
    alt: '弧长微元：在小段曲线上用弦长近似弧长，ds = √(dx² + dy²)',
    width: 640,
    height: 400,
    x: [0.3, 2.9],
    y: [0.3, 2.4],
    xTick: { type: 'num', target: 5 },
    yTick: { type: 'num', target: 4 },
    curves: [{ fn: '0.22*x^2+0.5', color: 'accent' }],
    segments: [
      // 直角三角形两条直角边：dx 水平、dy 竖直
      { points: [[1.0, 0.72], [2.3, 0.72]], color: 'green', dash: '5 4' },
      { points: [[2.3, 0.72], [2.3, 1.6636]], color: 'red', dash: '5 4' },
    ],
    dots: [
      { x: 1.0, y: 0.72, color: 'ink', r: 3.4, label: 'P', dx: -12, dy: 4, anchor: 'end' },
      { x: 2.3, y: 1.6636, color: 'ink', r: 3.4, label: 'Q', dx: 10, dy: -6 },
    ],
    notes: [
      { x: 1.65, y: 0.55, text: 'dx', anchor: 'middle', color: 'green' },
      { x: 2.42, y: 1.2, text: 'dy', anchor: 'start', color: 'red' },
      { x: 1.42, y: 1.36, text: 'ds（弦长）', anchor: 'end', color: 'ink' },
      { x: 1.9, y: 2.15, text: 'ds = √(dx² + dy²)', anchor: 'middle', color: 'ink' },
    ],
  },
  // ── 第 5 章：定积分应用里的立体 ─────────────────────────────────────
  // 这一组的关键是「切片」：曲面画得淡（0.3~0.4），截面/代表微元画得实（0.6~0.9），
  // 读者的注意力自然落到「那一刀切下去是什么形状」上。
  {
    disabled: true, // 作者认为三维网格不够清晰，改用手绘
    id: 'hm5-16-parallel-cross-section',
    title: '平行截面法  V = ∫A(x)dx',
    alt: '平行截面法：用垂直于 x 轴的平面去截立体 Ω，截面面积是 x 的函数 A(x)，把每个薄片 A(x)dx 累加就是体积',
    width: 600,
    height: 460,
    threeD: {
      azimuth: 40,
      elevation: 20,
      surfaces: [
        {
          u: [0, Math.PI],
          v: [0, Math.PI * 2],
          nu: 16,
          nv: 30,
          x: '1.55*sin(u)*cos(v)',
          y: '1.15*sin(u)*sin(v)',
          z: '0.95*cos(u)',
          color: 'accent',
          opacity: 0.3,
        },
        {
          // x = 0.6 处切下来的截面（椭圆片）
          u: [0, 1],
          v: [0, Math.PI * 2],
          nu: 2,
          nv: 40,
          x: '0.6',
          y: '1.06*u*cos(v)',
          z: '0.876*u*sin(v)',
          color: 'red',
          opacity: 0.7,
        },
      ],
      axes: [{ to: [2.1, 0, 0], label: 'x', labelAt: [2.25, 0, 0] }],
      points: [{ p: [0.6, 0, 0.876], label: '截面面积 A(x)', dx: 12, dy: -8, color: 'red' }],
    },
    notes: [],
  },
  {
    disabled: true, // 作者认为三维网格不够清晰，改用手绘
    id: 'hm5-17-cylinder-cut-volume',
    title: '平面斜截圆柱体',
    alt: '平面斜截圆柱体：底圆半径为 R 的圆柱被一个与底面成角 α 的平面截下，截口的斜高是 y·tan α',
    width: 600,
    height: 460,
    threeD: {
      azimuth: 38,
      elevation: 20,
      surfaces: [
        {
          // 侧面：高度随 y 变化，z 从 0 到 R·tanα·sin v
          u: [0, Math.PI * 2],
          v: [0, 1],
          nu: 32,
          nv: 10,
          x: '1.2*cos(u)',
          y: '1.2*sin(u)',
          z: '0.55*1.2*sin(u)*v',
          color: 'accent',
          opacity: 0.34,
        },
        {
          // 底面圆
          u: [0, 1],
          v: [0, Math.PI * 2],
          nu: 3,
          nv: 36,
          x: '1.2*u*cos(v)',
          y: '1.2*u*sin(v)',
          z: '0',
          color: 'red',
          opacity: 0.5,
        },
        {
          // 斜截口（平面截出来的椭圆面）
          u: [0, 1],
          v: [0, Math.PI * 2],
          nu: 3,
          nv: 36,
          x: '1.2*u*cos(v)',
          y: '1.2*u*sin(v)',
          z: '0.55*1.2*u*sin(v)',
          color: 'green',
          opacity: 0.6,
        },
      ],
      axes: [{ to: [0, 0, 1.4], label: 'z', labelAt: [0, 0, 1.55] }],
      points: [{ p: [0, 1.2, 0.66], label: '斜高 y·tan α', dx: 12, dy: -6, color: 'green' }],
    },
    notes: [],
  },
  {
    disabled: true, // 作者认为三维网格不够清晰，改用手绘
    id: 'hm5-18-solid-x-type-region',
    title: 'X 型区域绕 x 轴旋转（圆盘法）',
    alt: '圆盘法：曲线 y = f(x) 与 x 轴围成的区域绕 x 轴旋转，垂直于 x 轴的截面是半径 |f(x)| 的圆',
    width: 620,
    height: 460,
    threeD: {
      azimuth: 34,
      elevation: 18,
      surfaces: [
        {
          u: [-1.5, 1.5],
          v: [0, Math.PI * 2],
          nu: 20,
          nv: 34,
          x: 'u',
          y: '(0.85 - 0.2*u^2)*cos(v)',
          z: '(0.85 - 0.2*u^2)*sin(v)',
          color: 'accent',
          opacity: 0.32,
        },
        {
          // x = 0.6 处的圆盘截面
          u: [0, 1],
          v: [0, Math.PI * 2],
          nu: 2,
          nv: 36,
          x: '0.6',
          y: '0.778*u*cos(v)',
          z: '0.778*u*sin(v)',
          color: 'red',
          opacity: 0.75,
        },
      ],
      axes: [{ to: [1.95, 0, 0], label: 'x', labelAt: [2.1, 0, 0] }],
      curves: [
        // 生成曲线（在 xOz 面内）
        {
          x: 't',
          y: '0',
          z: '0.85 - 0.2*t^2',
          t: [-1.5, 1.5],
          color: 'green',
          width: 2.4,
          samples: 50,
        },
      ],
      points: [{ p: [0.6, 0, 0.778], label: '半径 |f(x)|', dx: 12, dy: -8, color: 'red' }],
    },
    notes: [],
  },
  {
    disabled: true, // 作者认为三维网格不够清晰，改用手绘
    id: 'hm5-19-solid-y-type-region',
    title: 'Y 型区域绕 y 轴旋转（圆盘法）',
    alt: '圆盘法：曲线 x = φ(y) 与 y 轴围成的区域绕 y 轴旋转，垂直于 y 轴的截面是半径 |φ(y)| 的圆',
    width: 320,
    height: 470,
    threeD: {
      // 旋转轴是 y，把 y 摆成竖直方向，读者才认得出「这是个旋转体」
      upAxis: 'y',
      azimuth: 38,
      elevation: 18,
      surfaces: [
        {
          u: [-1.25, 1.25],
          v: [0, Math.PI * 2],
          nu: 20,
          nv: 34,
          x: '(0.8 - 0.15*u^2)*cos(v)',
          y: 'u',
          z: '(0.8 - 0.15*u^2)*sin(v)',
          color: 'accent',
          opacity: 0.32,
        },
        {
          u: [0, 1],
          v: [0, Math.PI * 2],
          nu: 2,
          nv: 36,
          x: '0.7625*u*cos(v)',
          y: '0.5',
          z: '0.7625*u*sin(v)',
          color: 'red',
          opacity: 0.75,
        },
      ],
      axes: [{ to: [0, 1.95, 0], label: 'y', labelAt: [0, 2.1, 0] }],
      curves: [
        { x: '0.8 - 0.15*t^2', y: 't', z: '0', t: [-1.25, 1.25], color: 'green', width: 2.4, samples: 50 },
      ],
      points: [{ p: [0.7625, 0.5, 0], label: '半径 |φ(y)|', dx: 12, dy: -8, color: 'red' }],
    },
    notes: [],
  },
  {
    disabled: true, // 作者认为三维网格不够清晰，改用手绘
    id: 'hm5-20-solid-ring-region',
    title: '环形区域绕 x 轴旋转（截面是圆环）',
    alt: '圆环法：上下两条曲线之间的区域绕 x 轴旋转，截面是外径 f₁(x)、内径 f₂(x) 的圆环',
    width: 620,
    height: 460,
    threeD: {
      azimuth: 34,
      elevation: 18,
      surfaces: [
        {
          u: [-1.2, 1.2],
          v: [0, Math.PI * 2],
          nu: 12,
          nv: 26,
          x: 'u',
          y: '(1.0 - 0.1*u^2)*cos(v)',
          z: '(1.0 - 0.1*u^2)*sin(v)',
          color: 'accent',
          opacity: 0.3,
        },
        {
          u: [-1.2, 1.2],
          v: [0, Math.PI * 2],
          nu: 12,
          nv: 26,
          x: 'u',
          y: '(0.55 + 0.05*u^2)*cos(v)',
          z: '(0.55 + 0.05*u^2)*sin(v)',
          color: 'green',
          opacity: 0.34,
        },
        {
          // x = 0.5 处的圆环截面
          u: [0, 1],
          v: [0, Math.PI * 2],
          nu: 2,
          nv: 36,
          x: '0.5',
          y: '(0.5625 + 0.4125*u)*cos(v)',
          z: '(0.5625 + 0.4125*u)*sin(v)',
          color: 'red',
          opacity: 0.7,
        },
      ],
      axes: [{ to: [1.7, 0, 0], label: 'x', labelAt: [1.85, 0, 0] }],
      points: [{ p: [0.5, 0, 0.975], label: '外径 f₁、内径 f₂', dx: 12, dy: -8, color: 'red' }],
    },
    notes: [],
  },
  {
    disabled: true, // 作者认为三维网格不够清晰，改用手绘
    id: 'hm5-21-shell-method',
    title: '柱壳法：窄条绕 y 轴旋转成柱壳',
    alt: '柱壳法：在 x 处取宽 dx 的窄条，绕 y 轴旋转形成一个薄柱壳，展开后是长 2πx、高 |f(x)|、厚 dx 的薄片',
    width: 620,
    height: 470,
    threeD: {
      // 柱壳是绕 y 轴卷起来的，同样把 y 摆成竖直
      upAxis: 'y',
      azimuth: 34,
      elevation: 16,
      surfaces: [
        {
          // 代表柱壳：半径 t = 0.9，高 f(0.9)
          u: [0, Math.PI * 2],
          v: [0, 1],
          nu: 32,
          nv: 8,
          x: '0.9*cos(u)',
          y: '1.103*v',
          z: '0.9*sin(u)',
          color: 'accent',
          opacity: 0.42,
        },
        {
          // 生成区域（在 xOy 面内）
          u: [0.4, 1.4],
          v: [0, 1],
          nu: 12,
          nv: 8,
          x: 'u',
          y: '(1.2 - 0.12*u^2)*v',
          z: '0',
          color: 'green',
          opacity: 0.42,
        },
      ],
      axes: [{ to: [0, 1.9, 0], label: 'y', labelAt: [0, 2.05, 0] }],
      lines3d: [
        // 代表窄条：x = 0.9 处的一竖条
        { from: [0.9, 0, 0], to: [0.9, 1.103, 0], color: 'red', width: 3, onTop: true },
      ],
      points: [{ p: [0.9, 1.103, 0], label: '高 |f(x)|、厚 dx', dx: 12, dy: -8, color: 'red' }],
    },
    notes: [],
  },
  // ── 第 7 章：二次曲面（截痕法 + 旋转/平移生成）───────────────────────
  // 统一约定：虚实线用同一套配色；截痕曲线一律红色；曲面半透明（0.7 左右），
  // 这样背面看得见，截痕落在曲面里也读得出前后关系。
  {
    id: 'hm7-17-ellipsoid-and-sphere',
    title: '椭球面  x²/a² + y²/b² + z²/c² = 1',
    alt: '椭球面：压扁的球，用水平面 z = t 截出的是椭圆；t 从 −c 变到 c 时椭圆先变大再缩小为一点',
    width: 600,
    height: 470,
    threeD: {
      azimuth: 40,
      elevation: 22,
      surfaces: [
        {
          u: [0, Math.PI],
          v: [0, Math.PI * 2],
          nu: 16,
          nv: 30,
          x: '1.5*sin(u)*cos(v)',
          y: '1.1*sin(u)*sin(v)',
          z: '0.9*cos(u)',
          color: 'accent',
          opacity: 0.55,
        },
      ],
      axes: [
        { to: [1.95, 0, 0], label: 'x', labelAt: [2.1, 0, 0] },
        { to: [0, 1.55, 0], label: 'y', labelAt: [0, 1.7, 0] },
        { to: [0, 0, 1.35], label: 'z', labelAt: [0, 0, 1.5] },
      ],
      // 两个截口：z = 0 最大（红），z = 0.55 小一圈（绿）—— 直观说明「椭圆随 t 变化」
      curves: [
        { x: '1.5*cos(t)', y: '1.1*sin(t)', z: '0', t: [0, Math.PI * 2], color: 'red', width: 2 },
        {
          x: '1.188*cos(t)',
          y: '0.871*sin(t)',
          z: '0.55',
          t: [0, Math.PI * 2],
          color: 'green',
          width: 2,
        },
      ],
      points: [{ p: [0, 0, 0.55], label: 'z = t', dx: 12, dy: -4, color: 'green' }],
    },
    notes: [],
  },
  {
    id: 'hm7-18-elliptic-cone',
    title: '椭圆锥面  x²/a² + y²/b² = z²',
    alt: '椭圆锥面：漏斗形，上下一对锥面在原点相接；用 z = t 截得椭圆，t 越大椭圆越大',
    width: 450,
    height: 470,
    threeD: {
      azimuth: 40,
      elevation: 24,
      surfaces: [
        {
          u: [-1.45, 1.45],
          v: [0, Math.PI * 2],
          nu: 14,
          nv: 30,
          x: '1.1*u*cos(v)',
          y: '0.8*u*sin(v)',
          z: 'u',
          color: 'accent',
          opacity: 0.6,
        },
      ],
      axes: [
        { to: [1.55, 0, 0], label: 'x', labelAt: [1.72, 0, 0] },
        { to: [0, 1.15, 0], label: 'y', labelAt: [0, 1.3, 0] },
        { to: [0, 0, 1.85], label: 'z', labelAt: [0, 0, 2.0] },
      ],
      curves: [
        {
          x: '0.99*cos(t)',
          y: '0.72*sin(t)',
          z: '0.9',
          t: [0, Math.PI * 2],
          color: 'red',
          width: 2,
        },
        {
          x: '0.66*cos(t)',
          y: '0.48*sin(t)',
          z: '0.6',
          t: [0, Math.PI * 2],
          color: 'green',
          width: 2,
        },
      ],
      points: [{ p: [0, 0, 0], label: '顶点', dx: 12, dy: 12, color: 'ink' }],
    },
    notes: [],
  },
  {
    id: 'hm7-19-elliptic-paraboloid',
    title: '椭圆抛物面  z = x²/a² + y²/b²',
    alt: '椭圆抛物面：开口朝上的碗形曲面，用水平面 z = t 去截，截线是一族椭圆',
    width: 600,
    height: 470,
    threeD: {
      azimuth: 40,
      elevation: 24,
      surfaces: [
        {
          u: [-1.6, 1.6],
          v: [-1.2, 1.2],
          nu: 18,
          nv: 16,
          x: 'u',
          y: 'v',
          z: '0.34*u^2 + 0.62*v^2',
          color: 'accent',
          opacity: 0.65,
        },
      ],
      axes: [
        { to: [1.95, 0, 0], label: 'x', labelAt: [2.12, 0, 0] },
        { to: [0, 1.55, 0], label: 'y', labelAt: [0, 1.72, 0] },
        { to: [0, 0, 1.95], label: 'z', labelAt: [0, 0, 2.1] },
      ],
      // z = 0.8 处的截线：0.34x² + 0.62y² = 0.8 即椭圆 x²/1.53² + y²/1.14² = 1
      curves: [
        {
          x: '1.534*cos(t)',
          y: '1.136*sin(t)',
          z: '0.8',
          t: [0, Math.PI * 2],
          color: 'red',
          width: 2,
        },
      ],
      points: [{ p: [0, 0, 0.8], label: 'z = t 截得椭圆', dx: 13, dy: 5, color: 'red' }],
    },
    notes: [],
  },
  {
    id: 'hm7-20-hyperboloid-one-sheet',
    title: '单叶双曲面  x²/a² + y²/b² − z²/c² = 1',
    alt: '单叶双曲面：腰鼓形，中间最细处是腰椭圆；用 z = t 截得的椭圆始终存在，上下越来越大',
    width: 470,
    height: 470,
    threeD: {
      azimuth: 40,
      elevation: 22,
      surfaces: [
        {
          u: [-1.25, 1.25],
          v: [0, Math.PI * 2],
          nu: 16,
          nv: 30,
          x: '1.0*cosh(u)*cos(v)',
          y: '0.8*cosh(u)*sin(v)',
          z: '0.9*sinh(u)',
          color: 'accent',
          opacity: 0.55,
        },
      ],
      axes: [
        { to: [1.9, 0, 0], label: 'x', labelAt: [2.05, 0, 0] },
        { to: [0, 1.6, 0], label: 'y', labelAt: [0, 1.75, 0] },
        { to: [0, 0, 1.5], label: 'z', labelAt: [0, 0, 1.65] },
      ],
      // 腰椭圆（z = 0，最小）与 z = 0.6 处的椭圆（更大）—— 说明「椭圆始终存在」
      curves: [
        { x: '1.0*cos(t)', y: '0.8*sin(t)', z: '0', t: [0, Math.PI * 2], color: 'red', width: 2 },
        {
          x: '1.202*cos(t)',
          y: '0.961*sin(t)',
          z: '0.6',
          t: [0, Math.PI * 2],
          color: 'green',
          width: 2,
        },
      ],
      points: [{ p: [0, 0, 0], label: '腰椭圆', dx: 12, dy: 14, color: 'red' }],
    },
    notes: [],
  },
  {
    id: 'hm7-21-hyperboloid-two-sheets',
    title: '双叶双曲面  z²/c² − x²/a² − y²/b² = 1',
    alt: '双叶双曲面：上下两片互相分离；只有 |z| ≥ c 的平面才截得到椭圆，z = ±c 时缩成两点',
    width: 320,
    height: 470,
    threeD: {
      azimuth: 40,
      elevation: 20,
      surfaces: [
        {
          u: [1, 1.9],
          v: [0, Math.PI * 2],
          nu: 10,
          nv: 28,
          x: '0.75*sqrt(u^2-1)*cos(v)',
          y: '0.6*sqrt(u^2-1)*sin(v)',
          z: 'u',
          color: 'accent',
          opacity: 0.62,
        },
        {
          u: [1, 1.9],
          v: [0, Math.PI * 2],
          nu: 10,
          nv: 28,
          x: '0.75*sqrt(u^2-1)*cos(v)',
          y: '0.6*sqrt(u^2-1)*sin(v)',
          z: '-u',
          color: 'accent',
          opacity: 0.62,
        },
      ],
      axes: [
        { to: [1.5, 0, 0], label: 'x', labelAt: [1.65, 0, 0] },
        { to: [0, 1.2, 0], label: 'y', labelAt: [0, 1.35, 0] },
        { to: [0, 0, 2.15], label: 'z', labelAt: [0, 0, 2.3] },
      ],
      // z = ±1.6 处的截口椭圆（r = sqrt(1.6² − 1) = 1.249）
      curves: [
        {
          x: '0.937*cos(t)',
          y: '0.749*sin(t)',
          z: '1.6',
          t: [0, Math.PI * 2],
          color: 'red',
          width: 2,
        },
        {
          x: '0.937*cos(t)',
          y: '0.749*sin(t)',
          z: '-1.6',
          t: [0, Math.PI * 2],
          color: 'red',
          width: 2,
        },
      ],
      points: [{ p: [0, 0, 1], label: 'z = c 时缩为一点', dx: 13, dy: -4, color: 'ink' }],
    },
    notes: [],
  },
  {
    id: 'hm7-22-hyperbolic-paraboloid',
    title: '双曲抛物面（马鞍面）  z = x²/a² − y²/b²',
    alt: '双曲抛物面：马鞍形，一个方向向上弯、另一个方向向下弯；用 z = t 截得双曲线，用 x = t 截得抛物线',
    width: 600,
    height: 470,
    threeD: {
      azimuth: 40,
      elevation: 18,
      surfaces: [
        {
          u: [-1.5, 1.5],
          v: [-1.5, 1.5],
          nu: 16,
          nv: 16,
          x: 'u',
          y: 'v',
          z: '0.42*u^2 - 0.42*v^2',
          color: 'accent',
          opacity: 0.62,
        },
      ],
      axes: [
        { to: [1.95, 0, 0], label: 'x', labelAt: [2.1, 0, 0] },
        { to: [0, 1.95, 0], label: 'y', labelAt: [0, 2.1, 0] },
        { to: [0, 0, 1.3], label: 'z', labelAt: [0, 0, 1.45] },
      ],
      // z = 0 时是两条相交直线；z = 0.5 时是左右两支双曲线
      curves: [
        {
          x: '1.091*cosh(t)',
          y: '1.091*sinh(t)',
          z: '0.5',
          t: [-0.9, 0.9],
          color: 'red',
          width: 2,
        },
        {
          x: '-1.091*cosh(t)',
          y: '1.091*sinh(t)',
          z: '0.5',
          t: [-0.9, 0.9],
          color: 'red',
          width: 2,
        },
      ],
      points: [{ p: [0, 0, 0], label: '鞍点', dx: 12, dy: 14, color: 'ink' }],
    },
    notes: [],
  },
  {
    id: 'hm7-23-surface-of-revolution',
    title: '曲线绕 z 轴旋转 → 旋转曲面',
    alt: '旋转曲面：yOz 面内的母线绕 z 轴旋转，母线上每一点画出一个纬圆',
    width: 600,
    height: 470,
    threeD: {
      azimuth: 34,
      elevation: 20,
      surfaces: [
        {
          u: [0, 1.25],
          v: [0, Math.PI * 2],
          nu: 14,
          nv: 30,
          x: 'u*cos(v)',
          y: 'u*sin(v)',
          z: 'u^2',
          color: 'accent',
          opacity: 0.34,
        },
      ],
      axes: [{ to: [0, 0, 2.1], label: 'z', labelAt: [0, 0, 2.25], color: 'axis' }],
      // 母线：位于 yOz 面（x = 0）内的 z = y²
      curves: [
        {
          x: '0',
          y: 't',
          z: 't^2',
          t: [0, 1.25],
          color: 'red',
          width: 2.4,
          samples: 60,
        },
        // 两个纬圆（高度不变、半径不变）
        {
          x: '0.707*cos(t)',
          y: '0.707*sin(t)',
          z: '0.5',
          t: [0, Math.PI * 2],
          color: 'green',
          width: 1.8,
        },
        {
          x: '1.0*cos(t)',
          y: '1.0*sin(t)',
          z: '1.0',
          t: [0, Math.PI * 2],
          color: 'green',
          width: 1.8,
        },
      ],
      points: [{ p: [0, 0.707, 0.5], label: '纬圆', dx: 11, dy: -6, color: 'green' }],
    },
    notes: [],
  },
  {
    id: 'hm7-24-cone-surface',
    title: '圆锥面  z² = (x² + y²)cot²α',
    alt: '圆锥面：yOz 面内的直线 z = y·cot α 绕 z 轴旋转，得到顶点在原点的圆锥面',
    width: 600,
    height: 470,
    threeD: {
      azimuth: 38,
      elevation: 20,
      surfaces: [
        {
          u: [0, 1.75],
          v: [0, Math.PI * 2],
          nu: 14,
          nv: 30,
          x: 'u*cos(v)',
          y: 'u*sin(v)',
          z: '0.72*u',
          color: 'accent',
          opacity: 0.4,
        },
      ],
      axes: [
        { to: [0, 0, 2.0], label: 'z', labelAt: [0, 0, 2.15] },
        { to: [1.6, 0, 0], label: 'x', labelAt: [1.75, 0, 0] },
      ],
      curves: [
        // 母线 z = y·cot α（在 yOz 面内）
        { x: '0', y: 't', z: '0.72*t', t: [0, 1.75], color: 'red', width: 2.4, samples: 40 },
        // 一个纬圆
        {
          x: '1.26*cos(t)',
          y: '1.26*sin(t)',
          z: '0.907',
          t: [0, Math.PI * 2],
          color: 'green',
          width: 1.8,
        },
      ],
      points: [{ p: [0, 0, 0], label: '顶点', dx: 12, dy: 14, color: 'ink' }],
    },
    notes: [],
  },
  {
    id: 'hm7-25-revolved-hyperboloid',
    title: '旋转单叶双曲面  (x² + y²)/a² − z²/c² = 1',
    alt: '旋转单叶双曲面：双曲线 y²/a² − z²/c² = 1 绕 z 轴旋转所得，腰鼓形',
    width: 450,
    height: 470,
    threeD: {
      azimuth: 38,
      elevation: 20,
      surfaces: [
        {
          u: [-1.1, 1.1],
          v: [0, Math.PI * 2],
          nu: 14,
          nv: 30,
          x: '0.75*cosh(u)*cos(v)',
          y: '0.75*cosh(u)*sin(v)',
          z: '0.9*sinh(u)',
          color: 'accent',
          opacity: 0.5,
        },
      ],
      axes: [
        { to: [0, 0, 1.6], label: 'z', labelAt: [0, 0, 1.75] },
        { to: [1.35, 0, 0], label: 'x', labelAt: [1.5, 0, 0] },
      ],
      // 母线：yOz 面内的双曲线 y²/a² − z²/c² = 1 的右支
      curves: [
        {
          x: '0',
          y: '0.75*cosh(t)',
          z: '0.9*sinh(t)',
          t: [-1.1, 1.1],
          color: 'red',
          width: 2.4,
          samples: 60,
        },
        {
          x: '1.2*cos(t)',
          y: '1.2*sin(t)',
          z: '0.8',
          t: [0, Math.PI * 2],
          color: 'green',
          width: 1.8,
        },
      ],
      points: [{ p: [0, 0.75, 0], label: '腰圆', dx: 12, dy: 12, color: 'red' }],
    },
    notes: [],
  },
  {
    id: 'hm7-26-revolved-paraboloid',
    title: '旋转抛物面  z = x² + y²',
    alt: '旋转抛物面：抛物线 z = k·y² 绕 z 轴旋转所得，开口朝上的碗形',
    width: 480,
    height: 470,
    threeD: {
      azimuth: 38,
      elevation: 22,
      surfaces: [
        {
          u: [0, 1.35],
          v: [0, Math.PI * 2],
          nu: 14,
          nv: 30,
          x: 'u*cos(v)',
          y: 'u*sin(v)',
          z: '1.15*u^2',
          color: 'accent',
          opacity: 0.55,
        },
      ],
      axes: [
        { to: [0, 0, 2.3], label: 'z', labelAt: [0, 0, 2.45] },
        { to: [1.6, 0, 0], label: 'x', labelAt: [1.75, 0, 0] },
      ],
      curves: [
        { x: '0', y: 't', z: '1.15*t^2', t: [-1.35, 1.35], color: 'red', width: 2.4, samples: 60 },
        {
          x: '1.0*cos(t)',
          y: '1.0*sin(t)',
          z: '1.15',
          t: [0, Math.PI * 2],
          color: 'green',
          width: 1.8,
        },
      ],
      points: [{ p: [0, 0, 0], label: '顶点', dx: 12, dy: 14, color: 'ink' }],
    },
    notes: [],
  },
  {
    id: 'hm7-27-circular-cylinder',
    title: '圆柱面  x² + y² = R²',
    alt: '圆柱面：圆沿 z 轴方向平移形成，缺少变量 z 说明母线平行于 z 轴',
    width: 450,
    height: 470,
    threeD: {
      azimuth: 36,
      elevation: 18,
      surfaces: [
        {
          u: [0, Math.PI * 2],
          v: [0, 2.4],
          nu: 30,
          nv: 10,
          x: '1.1*cos(u)',
          y: '1.1*sin(u)',
          z: 'v',
          color: 'accent',
          opacity: 0.45,
        },
      ],
      axes: [{ to: [0, 0, 2.9], label: 'z', labelAt: [0, 0, 3.05] }],
      curves: [
        // 准线：xOy 面上的圆
        {
          x: '1.1*cos(t)',
          y: '1.1*sin(t)',
          z: '0',
          t: [0, Math.PI * 2],
          color: 'red',
          width: 2.2,
        },
      ],
      // 母线：曲面上的竖直直线
      lines3d: [
        { from: [1.1, 0, 0], to: [1.1, 0, 2.4], color: 'green', width: 2, onTop: true },
      ],
      points: [{ p: [1.1, 0, 2.4], label: '母线 ∥ z 轴', dx: 11, dy: -6, color: 'green' }],
    },
    notes: [],
  },
  {
    id: 'hm7-28-1-parabolic-cylinder',
    title: '抛物柱面  x² = 2py',
    alt: '抛物柱面：抛物线沿 z 轴方向平移形成，方程里缺少 z',
    width: 380,
    height: 460,
    threeD: {
      azimuth: 36,
      elevation: 18,
      surfaces: [
        {
          u: [-1.4, 1.4],
          v: [0, 2.3],
          nu: 22,
          nv: 12,
          x: 'u',
          y: '0.55*u^2 - 0.9',
          z: 'v',
          color: 'accent',
          opacity: 0.5,
        },
      ],
      axes: [{ to: [0, 0, 2.85], label: 'z', labelAt: [0, 0, 3.0] }],
      curves: [
        {
          x: 't',
          y: '0.55*t^2 - 0.9',
          z: '0',
          t: [-1.4, 1.4],
          color: 'red',
          width: 2.2,
          samples: 60,
        },
      ],
      points: [{ p: [0, -0.9, 0], label: '准线', dx: 10, dy: 14, color: 'red' }],
    },
    notes: [],
  },
  {
    id: 'hm7-28-2-hyperbolic-cylinder',
    title: '双曲柱面  x²/a² − y²/b² = 1',
    alt: '双曲柱面：双曲线沿 z 轴方向平移形成，分成左右两片',
    width: 560,
    height: 460,
    threeD: {
      azimuth: 36,
      elevation: 18,
      surfaces: [
        {
          u: [-1.15, 1.15],
          v: [0, 2.3],
          nu: 14,
          nv: 12,
          x: '1.0*cosh(u)',
          y: '0.75*sinh(u)',
          z: 'v',
          color: 'accent',
          opacity: 0.5,
        },
        {
          u: [-1.15, 1.15],
          v: [0, 2.3],
          nu: 14,
          nv: 12,
          x: '-1.0*cosh(u)',
          y: '0.75*sinh(u)',
          z: 'v',
          color: 'accent',
          opacity: 0.5,
        },
      ],
      axes: [{ to: [0, 0, 2.85], label: 'z', labelAt: [0, 0, 3.0] }],
      curves: [
        {
          x: '1.0*cosh(t)',
          y: '0.75*sinh(t)',
          z: '0',
          t: [-1.15, 1.15],
          color: 'red',
          width: 2.2,
          samples: 50,
        },
        {
          x: '-1.0*cosh(t)',
          y: '0.75*sinh(t)',
          z: '0',
          t: [-1.15, 1.15],
          color: 'red',
          width: 2.2,
          samples: 50,
        },
      ],
      points: [{ p: [1.0, 0, 0], label: '两片分离', dx: 10, dy: 14, color: 'red' }],
    },
    notes: [],
  },
  // ── 第 8 章：多元函数微分学 ─────────────────────────────────────────
  // 这一组全是平面上的几何图，所以一律开 equalAspect —— 邻域要画成圆、
  // 等值线要画成真正的椭圆/圆，比例一歪这些图就没法看了。
  // 三维的那几张（偏导数几何意义、切向量、切平面与法线）仍然是手绘。
  {
    id: 'hm8-01-point-set-relations',
    title: '内点、外点与边界点',
    alt: '平面上点与点集 E 的关系：内点的某个邻域完全落在 E 内，外点的邻域与 E 不相交，边界点的任一邻域内既有 E 中的点也有 E 外的点',
    width: 600,
    height: 430,
    x: [-2.7, 2.7],
    y: [-1.6, 1.6],
    equalAspect: true,
    fills: [
      {
        upper: { fn: '0.95*sqrt(1-(x/1.9)^2)', range: [-1.9, 1.9] },
        lower: { fn: '-0.95*sqrt(1-(x/1.9)^2)', range: [-1.9, 1.9] },
        color: 'accent',
        opacity: 0.22,
      },
    ],
    curves: [
      {
        parametric: { x: '1.9*cos(t)', y: '0.95*sin(t)', t: [0, Math.PI * 2] },
        color: 'accent',
        width: 1.9,
      },
    ],
    arcs: [
      { center: [0.45, 0.35], radius: 0.42, from: 0, to: Math.PI * 2, color: 'green', dash: '4 3' },
      { center: [-2.15, 1.32], radius: 0.4, from: 0, to: Math.PI * 2, color: 'red', dash: '4 3' },
      { center: [0.65, 0.893], radius: 0.38, from: 0, to: Math.PI * 2, color: 'ink', dash: '4 3' },
    ],
    dots: [
      { x: 0.45, y: 0.35, color: 'green', r: 3.6, label: '内点 P', dx: 10, dy: -8 },
      { x: -2.15, y: 1.32, color: 'red', r: 3.6, label: '外点 Q', dx: 10, dy: -8 },
      { x: 0.65, y: 0.893, color: 'ink', r: 3.6, label: '边界点 R', dx: 9, dy: -14 },
    ],
    notes: [{ x: -1.05, y: -0.42, text: 'E', anchor: 'middle', color: 'accent' }],
  },
  {
    disabled: true, // 作者认为手绘更好，改回原图
    id: 'hm8-02-double-limit-definition',
    title: '二重极限：沿任意路径都趋于 A',
    alt: '二重极限：动点 P 沿直线、抛物线等任意路径趋近 P₀ 时，函数值都趋于同一个 A，二元极限才存在',
    width: 600,
    height: 430,
    x: [-2.5, 2.5],
    y: [-1.7, 1.7],
    equalAspect: true,
    curves: [
      { parametric: { x: '-2.2+2.2*t', y: '1.4-1.4*t', t: [0, 1] }, color: 'ink', width: 1.5 },
      { parametric: { x: '2.0-2.0*t', y: '-1.3+1.3*t', t: [0, 1] }, color: 'ink', width: 1.5 },
      { parametric: { x: 't', y: '0.55*t^2', t: [-1.75, -0.12] }, color: 'ink', width: 1.5 },
    ],
    arrows: [
      { from: [-0.40, 0.254], to: [-0.13, 0.083], color: 'ink' },
      { from: [0.38, -0.247], to: [0.12, -0.078], color: 'ink' },
      { from: [-0.56, 0.172], to: [-0.17, 0.016], color: 'ink' },
    ],
    arcs: [
      { center: [0, 0], radius: 0.5, from: 0, to: Math.PI * 2, color: 'accent', dash: '5 4' },
    ],
    dots: [{ x: 0, y: 0, color: 'red', r: 4, label: 'P₀', dx: 9, dy: 17 }],
    notes: [
      { x: 0.72, y: 0.72, text: 'δ 邻域', anchor: 'start', color: 'accent' },
      { x: -2.32, y: 1.12, text: '直线', anchor: 'end', color: 'muted' },
      { x: -1.62, y: 1.42, text: '抛物线', anchor: 'start', color: 'muted' },
      { x: 2.3, y: -1.42, text: '直线', anchor: 'end', color: 'muted' },
    ],
  },
  {
    disabled: true, // 作者认为手绘更好，改回原图
    id: 'hm8-08-directional-derivative',
    title: '方向导数：沿射线 l 的变化率',
    alt: '方向导数：从 P₀ 出发沿射线 l（与 x 轴夹角 α）走一段距离，函数值的平均变化率取极限就是方向导数',
    width: 600,
    height: 430,
    x: [-2.4, 2.4],
    y: [-1.5, 1.5],
    equalAspect: true,
    curves: [
      {
        parametric: { x: '1.265*cos(t)', y: '0.894*sin(t)', t: [0, Math.PI * 2] },
        color: 'green',
        width: 1.4,
      },
      {
        parametric: { x: '1.789*cos(t)', y: '1.265*sin(t)', t: [0, Math.PI * 2] },
        color: 'green',
        width: 1.4,
      },
      {
        parametric: { x: '2.191*cos(t)', y: '1.549*sin(t)', t: [0, Math.PI * 2] },
        color: 'green',
        width: 1.4,
      },
    ],
    segments: [
      { points: [[1.0, 0.55], [2.106, 1.324]], color: 'red', width: 2 },
      { points: [[1.0, 0.55], [1.95, 0.55]], color: 'muted', width: 1.2, dash: '4 3' },
    ],
    arrows: [{ from: [1.86, 1.043], to: [2.08, 1.30], color: 'red' }],
    arcs: [
      {
        center: [1.0, 0.55],
        radius: 0.52,
        from: 0,
        to: (35 * Math.PI) / 180,
        color: 'red',
        label: 'α',
        labelRadius: 0.68,
      },
    ],
    dots: [{ x: 1.0, y: 0.55, color: 'ink', r: 3.6, label: 'P₀', dx: 8, dy: -9 }],
    notes: [
      { x: 2.16, y: 1.44, text: 'l', anchor: 'middle', color: 'red' },
      { x: 1.62, y: 0.16, text: '∂f/∂l', anchor: 'middle', color: 'red' },
      { x: -1.55, y: 1.06, text: '等值线', anchor: 'middle', color: 'green' },
    ],
  },
  {
    disabled: true, // 作者认为手绘更好，改回原图
    id: 'hm8-09-gradient-geometry',
    title: '梯度方向 = 函数值增加最快的方向',
    alt: '梯度方向垂直于过该点的等值线，并指向函数值增加的一侧；沿梯度走是上升最陡的方向',
    width: 600,
    height: 430,
    x: [-2.3, 2.3],
    y: [-1.5, 1.5],
    equalAspect: true,
    curves: [
      {
        parametric: { x: '0.894*cos(t)', y: '0.632*sin(t)', t: [0, Math.PI * 2] },
        color: 'green',
        width: 1.4,
      },
      {
        parametric: { x: '1.312*cos(t)', y: '0.927*sin(t)', t: [0, Math.PI * 2] },
        color: 'red',
        width: 1.9,
      },
      {
        parametric: { x: '1.789*cos(t)', y: '1.265*sin(t)', t: [0, Math.PI * 2] },
        color: 'green',
        width: 1.4,
      },
    ],
    segments: [
      { points: [[0.347, 1.144], [1.653, 0.056]], color: 'muted', width: 1.2, dash: '4 3' },
    ],
    arrows: [{ from: [1.10, 0.72], to: [1.60, 1.32], color: 'accent' }],
    dots: [{ x: 1.0, y: 0.6, color: 'red', r: 3.8, label: 'P₀', dx: 9, dy: -9 }],
    notes: [
      { x: 1.72, y: 1.34, text: '∇f', anchor: 'middle', color: 'accent' },
      { x: 2.25, y: 0.10, text: '切线（变化率为 0）', anchor: 'end', color: 'muted' },
      { x: -1.5, y: 1.02, text: 'f = C', anchor: 'middle', color: 'red' },
    ],
  },
  {
    disabled: true, // 作者认为手绘更好，改回原图
    id: 'hm8-10-contour-lines',
    title: '等值线与梯度',
    alt: '等值线是一圈圈同心圆（函数值为常数的曲线）；每个点处的梯度都垂直于该点的等值线，并指向函数值增大的一侧',
    width: 560,
    height: 470,
    x: [-2.3, 2.3],
    y: [-1.5, 1.5],
    equalAspect: true,
    curves: [
      { parametric: { x: '0.7*cos(t)', y: '0.7*sin(t)', t: [0, Math.PI * 2] }, color: 'green', width: 1.4 },
      { parametric: { x: '1.3*cos(t)', y: '1.3*sin(t)', t: [0, Math.PI * 2] }, color: 'green', width: 1.4 },
      { parametric: { x: '1.85*cos(t)', y: '1.85*sin(t)', t: [0, Math.PI * 2] }, color: 'green', width: 1.4 },
    ],
    arrows: [
      { from: [1.034, 0.868], to: [1.494, 1.254], color: 'accent' },
      { from: [-1.224, 0.570], to: [-1.769, 0.824], color: 'accent' },
    ],
    dots: [
      { x: 0.996, y: 0.836, color: 'red', r: 3.6 },
      { x: -1.178, y: 0.549, color: 'red', r: 3.6 },
    ],
    notes: [
      { x: 1.05, y: 1.42, text: '∇f', anchor: 'middle', color: 'accent' },
      { x: -1.86, y: 1.06, text: '∇f', anchor: 'middle', color: 'accent' },
      { x: 0.0, y: 0.32, text: 'C₁', anchor: 'middle', color: 'muted' },
      { x: 0.0, y: 1.36, text: 'C₂', anchor: 'middle', color: 'muted' },
      { x: -1.32, y: -1.32, text: 'C₃', anchor: 'middle', color: 'muted' },
      { x: 1.72, y: -1.16, text: 'C₁ < C₂ < C₃', anchor: 'middle', color: 'muted' },
    ],
  },
  {
    disabled: true, // 作者认为手绘更好，改回原图
    id: 'hm8-12-lagrange-multiplier',
    title: '拉格朗日乘数法：两梯度平行处相切',
    alt: '拉格朗日乘数法：目标函数的等值线与约束曲线相切时取得条件极值，此时两个梯度 ∇f 与 ∇φ 平行',
    width: 600,
    height: 430,
    // 最外那条等值线的半径是 1.6，y 必须留到 ±1.75 以上，否则圆的下半截会被画布裁掉。
    // x 跨度 5.3 配 600×430（内容区 530×360）正好让 equalAspect 算出 y 跨度 3.6。
    x: [-1.8, 3.5],
    y: [-1.75, 1.85],
    equalAspect: true,
    curves: [
      // 目标函数 f = x² + y² 的等值线（圆）。r = 0.707 那一条正好与约束直线相切 ——
      // 它就是条件极值点所在的等值线，用副色加粗突出，另外两条只当背景。
      {
        parametric: { x: '0.707*cos(t)', y: '0.707*sin(t)', t: [0, Math.PI * 2] },
        color: 'red',
        width: 1.9,
      },
      {
        parametric: { x: '1.1*cos(t)', y: '1.1*sin(t)', t: [0, Math.PI * 2] },
        color: 'green',
        width: 1.3,
      },
      {
        parametric: { x: '1.6*cos(t)', y: '1.6*sin(t)', t: [0, Math.PI * 2] },
        color: 'green',
        width: 1.3,
      },
      // 约束曲线 φ: x + y = 1
      { parametric: { x: 't', y: '1-t', t: [-0.72, 2.02] }, color: 'ink', width: 2.2 },
    ],
    arrows: [{ from: [0.58, 0.58], to: [1.18, 1.18], color: 'accent' }],
    dots: [{ x: 0.5, y: 0.5, color: 'red', r: 4.2, label: '切点', dx: -40, dy: -16 }],
    notes: [
      { x: 1.34, y: 1.30, text: '∇f ∥ ∇φ', anchor: 'start', color: 'accent' },
      { x: 2.0, y: -0.45, text: 'x + y = 1', anchor: 'start', color: 'ink' },
      { x: -1.72, y: 1.66, text: '等值线 f = C', anchor: 'start', color: 'green' },
    ],
  },
  // ── 第 9 章：重积分 ───────────────────────────────────────────────
  // 这一章大半是「实体」和坐标系图（曲顶柱体、投影法、柱面/球面坐标），
  // 按取舍原则继续留给手绘。
  {
    disabled: true, // 作者认为手绘更好，改回原图
    id: 'hm9-06-polar-area-element',
    title: '极坐标的面积微元',
    alt: '极坐标面积微元：取内半径 ρ、外半径 ρ+Δρ、张角 Δθ 的小扇形环，其面积约为 ρ·Δρ·Δθ',
    width: 520,
    height: 500,
    x: [-0.9, 3.3],
    y: [-0.9, 3.3],
    equalAspect: true,
    bare: true,
    polarGrid: { rays: 15, circles: [1, 2, 3] },
    fills: [
      {
        upper: { polar: { rho: '2.7', theta: [0.55, 0.95] } },
        lower: { polar: { rho: '2.2', theta: [0.55, 0.95] } },
        color: 'accent',
        opacity: 0.35,
      },
    ],
    segments: [
      { points: [[0, 0], [2.52, 1.54]], color: 'red', width: 1.6 },
      { points: [[0, 0], [1.72, 2.40]], color: 'red', width: 1.6 },
    ],
    curves: [
      { polar: { rho: '2.2', theta: [0.55, 0.95] }, color: 'red', width: 1.8 },
      { polar: { rho: '2.7', theta: [0.55, 0.95] }, color: 'red', width: 1.8 },
    ],
    arcs: [
      {
        center: [0, 0],
        radius: 0.95,
        from: 0.55,
        to: 0.95,
        color: 'red',
        label: 'Δθ',
        labelRadius: 1.16,
      },
    ],
    dots: [{ x: 0, y: 0, color: 'ink', r: 3.2 }],
    notes: [
      { x: -0.08, y: -0.22, text: 'O', anchor: 'end', color: 'ink' },
      { x: 1.34, y: 1.28, text: 'ρ', anchor: 'middle', color: 'red' },
      { x: 2.36, y: 1.42, text: 'ρ+Δρ', anchor: 'start', color: 'red' },
      { x: 0.42, y: -0.62, text: 'Δσ ≈ ρ·Δρ·Δθ', anchor: 'start', color: 'accent' },
    ],
  },
  {
    disabled: true, // 作者认为手绘更好，改回原图
    id: 'hm9-15-triple-integral-example',
    title: '球面 x²+y²+z²=2z 与锥面 z=√(x²+y²) 围成的区域',
    alt: '球面 x²+y²+z²=2z（球心在 (0,0,1)、半径为 1）与锥面 z=√(x²+y²) 围成的立体：球在锥内的那一顶（φ≤π/4），两曲面的交线是 z=1 平面上的单位圆',
    width: 620,
    height: 520,
    threeD: {
      azimuth: 38,
      elevation: 22,
      surfaces: [
        {
          // 球面在 Ω 之外的部分（φ 从 π/4 到 π，即 z 从 1 落到 0）：只当底色，
          // 让人看出「这一顶是从整个球上切下来的」
          u: [Math.PI / 4, Math.PI],
          v: [0, Math.PI * 2],
          nu: 12,
          nv: 28,
          x: 'sin(u)*cos(v)',
          y: 'sin(u)*sin(v)',
          z: '1 + cos(u)',
          color: 'accent',
          opacity: 0.16,
        },
        {
          // Ω 的球面部分：φ ∈ [0, π/4]
          u: [0, Math.PI / 4],
          v: [0, Math.PI * 2],
          nu: 5,
          nv: 28,
          x: 'sin(u)*cos(v)',
          y: 'sin(u)*sin(v)',
          z: '1 + cos(u)',
          color: 'red',
          opacity: 0.5,
        },
        {
          // Ω 的锥面部分：顶点到交线（u 到 √2 时 z = 1）
          u: [0, Math.SQRT2],
          v: [0, Math.PI * 2],
          nu: 9,
          nv: 26,
          x: 'u*cos(v)',
          y: 'u*sin(v)',
          z: 'u',
          color: 'red',
          opacity: 0.42,
        },
      ],
      axes: [
        { to: [0, 0, 2.4], label: 'z', labelAt: [0, 0, 2.55] },
        { to: [1.55, 0, 0], label: 'x', labelAt: [1.7, 0, 0] },
        { to: [0, 1.55, 0], label: 'y', labelAt: [0, 1.7, 0] },
      ],
      // 两曲面的交线：φ = π/4 处 r = 2cos(π/4) = √2，落在 z = 1 的单位圆上
      curves: [
        {
          x: 'cos(t)',
          y: 'sin(t)',
          z: '1',
          t: [0, Math.PI * 2],
          color: 'red',
          width: 2.2,
          samples: 64,
        },
      ],
      points: [{ p: [1, 0, 1], label: '交线 z = 1、ρ = 1', dx: 10, dy: -8, color: 'red' }],
    },
    notes: [],
  },
  {
    id: 'hm9-02-x-type-and-y-type-regions',
    title: 'X 型区域与 Y 型区域',
    alt: '左：X 型区域，上下边界是 x 的函数 y=φ₂(x) 与 y=φ₁(x)，左右边界是竖直线 x=a 与 x=b；右：Y 型区域，左右边界是 y 的函数 x=ψ₁(y) 与 x=ψ₂(y)，上下边界是水平线 y=c 与 y=d',
    width: 820,
    height: 370,
    x: [-0.6, 13.4],
    y: [-0.9, 4.7],
    equalAspect: true,
    bare: true,
    // 两块面板拼在一张画布上：左边 X 型（左右用竖线切），右边 Y 型（上下用横线切）。
    // 斜线阴影用 hatch —— 教材里「积分区域」的习惯画法，比铺一层淡色更明确。
    fills: [
      {
        upper: { fn: '3.05 - 0.14*(x-3.2)^2 + 0.26*sin(2.1*(x-1.5))', range: [1.5, 5.0] },
        lower: { fn: '1.45 + 0.22*cos(1.9*(x-1.5)) + 0.085*(x-3.2)^2', range: [1.5, 5.0] },
        color: 'accent',
        hatch: true,
      },
      {
        upper: {
          param: { x: '12.1 - 0.20*(t-2.3)^2 + 0.22*cos(1.8*(t-1.05))', y: 't', t: [1.05, 3.6] },
        },
        lower: {
          param: { x: '8.6 + 0.30*sin(1.8*(t-1.05)) + 0.10*(t-2.3)^2', y: 't', t: [1.05, 3.6] },
        },
        color: 'accent',
        hatch: true,
      },
    ],
    curves: [
      // 左：上下两条边界
      {
        fn: '3.05 - 0.14*(x-3.2)^2 + 0.26*sin(2.1*(x-1.5))',
        domain: [1.5, 5.0],
        color: 'accent',
        width: 1.9,
      },
      {
        fn: '1.45 + 0.22*cos(1.9*(x-1.5)) + 0.085*(x-3.2)^2',
        domain: [1.5, 5.0],
        color: 'accent',
        width: 1.9,
      },
      // 右：左右两条边界（写成 y 的参数曲线）
      {
        parametric: { x: '8.6 + 0.30*sin(1.8*(t-1.05)) + 0.10*(t-2.3)^2', y: 't', t: [1.05, 3.6] },
        color: 'accent',
        width: 1.9,
      },
      {
        parametric: { x: '12.1 - 0.20*(t-2.3)^2 + 0.22*cos(1.8*(t-1.05))', y: 't', t: [1.05, 3.6] },
        color: 'accent',
        width: 1.9,
      },
    ],
    segments: [
      // 坐标轴（bare 模式下自己画）
      { points: [[0.4, 0], [6.3, 0]], color: 'ink', width: 1.5 },
      { points: [[0.4, 0], [0.4, 4.4]], color: 'ink', width: 1.5 },
      { points: [[7.7, 0], [13.2, 0]], color: 'ink', width: 1.5 },
      { points: [[7.7, 0], [7.7, 4.4]], color: 'ink', width: 1.5 },
      // 左面板的两条竖直边界 x = a、x = b
      { points: [[1.5, 0], [1.5, 2.646]], color: 'muted', width: 1.2, dash: '4 3' },
      { points: [[5.0, 0], [5.0, 2.826]], color: 'muted', width: 1.2, dash: '4 3' },
      // 右面板的两条水平边界 y = c、y = d
      { points: [[7.7, 1.05], [8.756, 1.05]], color: 'muted', width: 1.2, dash: '4 3' },
      { points: [[7.7, 3.6], [8.470, 3.6]], color: 'muted', width: 1.2, dash: '4 3' },
    ],
    arrows: [
      { from: [6.0, 0], to: [6.35, 0], color: 'ink' },
      { from: [0.4, 4.05], to: [0.4, 4.45], color: 'ink' },
      { from: [12.9, 0], to: [13.25, 0], color: 'ink' },
      { from: [7.7, 4.05], to: [7.7, 4.45], color: 'ink' },
    ],
    notes: [
      { x: 0.26, y: -0.34, text: 'O', anchor: 'end', color: 'ink' },
      { x: 6.44, y: 0.14, text: 'x', anchor: 'start', color: 'ink' },
      { x: 0.2, y: 4.5, text: 'y', anchor: 'end', color: 'ink' },
      { x: 1.5, y: -0.36, text: 'a', anchor: 'middle', color: 'ink' },
      { x: 5.0, y: -0.36, text: 'b', anchor: 'middle', color: 'ink' },
      { x: 5.18, y: 3.0, text: 'y = φ_{2}(x)', anchor: 'start', color: 'accent' },
      { x: 5.18, y: 1.72, text: 'y = φ_{1}(x)', anchor: 'start', color: 'accent' },

      { x: 7.56, y: -0.34, text: 'O', anchor: 'end', color: 'ink' },
      { x: 13.34, y: 0.14, text: 'x', anchor: 'start', color: 'ink' },
      { x: 7.5, y: 4.5, text: 'y', anchor: 'end', color: 'ink' },
      { x: 7.56, y: 1.0, text: 'c', anchor: 'end', color: 'ink' },
      { x: 7.56, y: 3.55, text: 'd', anchor: 'end', color: 'ink' },
      { x: 8.62, y: 3.86, text: 'x = ψ_{1}(y)', anchor: 'middle', color: 'accent' },
      { x: 11.68, y: 3.86, text: 'x = ψ_{2}(y)', anchor: 'middle', color: 'accent' },
    ],
  },
  {
    id: 'hm9-04-double-integral-parity-symmetry',
    title: '二重积分的对称性',
    alt: '左：积分区域 D 关于 x 轴对称，上下两半互为镜像；右：积分区域 D 关于 y 轴对称，左右两半互为镜像',
    width: 700,
    height: 400,
    x: [-0.8, 4.9],
    y: [-1.5, 1.5],
    equalAspect: true,
    bare: true,
    // 两张小图并排，都是笛卡尔心形线，只是朝向差 90°：
    // 左图 ρ = a(1 + cos θ) —— 尖点在原点、两瓣朝右，整体【关于 x 轴对称】；
    // 右图 ρ = a(1 − sin θ) —— 凹口朝上、圆底在下，整体【关于 y 轴对称】。
    curves: [
      {
        parametric: {
          x: '0.8*(1 + cos(t))*cos(t)',
          y: '0.8*(1 + cos(t))*sin(t)',
          t: [0, Math.PI * 2],
        },
        color: 'accent',
        width: 2.2,
        samples: 220,
      },
      {
        parametric: {
          x: '3.5 + 0.9*(1 - sin(t))*cos(t)',
          y: '0.9 + 0.9*(1 - sin(t))*sin(t)',
          t: [0, Math.PI * 2],
        },
        color: 'accent',
        width: 2.2,
        samples: 220,
      },
    ],
    segments: [
      { points: [[-0.5, 0], [1.85, 0]], color: 'ink', width: 1.4 },
      { points: [[0, -1.4], [0, 1.4]], color: 'ink', width: 1.4 },
      { points: [[2.25, 0], [4.75, 0]], color: 'ink', width: 1.4 },
      { points: [[3.5, -1.4], [3.5, 1.4]], color: 'ink', width: 1.4 },
    ],
    arrows: [
      { from: [1.6, 0], to: [1.88, 0], color: 'ink' },
      { from: [0, 1.18], to: [0, 1.44], color: 'ink' },
      { from: [4.5, 0], to: [4.78, 0], color: 'ink' },
      { from: [3.5, 1.18], to: [3.5, 1.44], color: 'ink' },
    ],
    notes: [
      { x: -0.1, y: -0.24, text: 'O', anchor: 'end', color: 'ink' },
      { x: 1.9, y: 0.2, text: 'x', anchor: 'start', color: 'ink' },
      { x: -0.08, y: 1.36, text: 'y', anchor: 'end', color: 'ink' },
      { x: 0.9, y: -1.38, text: 'D 关于 x 轴对称', anchor: 'middle', color: 'accent' },
      { x: 3.4, y: -0.24, text: 'O', anchor: 'end', color: 'ink' },
      { x: 4.8, y: 0.2, text: 'x', anchor: 'start', color: 'ink' },
      { x: 3.42, y: 1.36, text: 'y', anchor: 'end', color: 'ink' },
      { x: 3.5, y: -1.38, text: 'D 关于 y 轴对称', anchor: 'middle', color: 'accent' },
    ],
  },
  {
    id: 'hm9-05-double-integral-example-10',
    title: '用直线 y = 3x 把区域 D 分成 D₁、D₂',
    alt: '区域 D 由抛物线 y=4−x²、直线 y=−3x 与竖直线 x=1 围成；再用直线 y=3x 把它分成两块：D₁ 关于 y 轴对称，D₂ 关于 x 轴对称',
    width: 520,
    height: 620,
    // 这道题纵向跨 7.4、横向只有 3，严格等比会画成一根竖条。
    // 教材原图也是压扁画的（横向像素密度约为纵向的 2 倍），这里照做。
    x: [-1.5, 1.5],
    y: [-3.4, 4.0],
    fills: [
      // D₁ 的左半（区域关于 y 轴对称，所以左右各填一块）
      { upper: { fn: '4 - x^2', range: [-1, 0] }, lower: { fn: '-3*x', range: [-1, 0] }, color: 'accent', opacity: 0.22 },
      { upper: { fn: '4 - x^2', range: [0, 1] }, lower: { fn: '3*x', range: [0, 1] }, color: 'accent', opacity: 0.22 },
      // D₂：夹在 y = ±3x 之间
      { upper: { fn: '3*x', range: [0, 1] }, lower: { fn: '-3*x', range: [0, 1] }, color: 'green', opacity: 0.3 },
    ],
    curves: [
      { fn: '4 - x^2', domain: [-1.5, 1.5], color: 'accent', width: 2 },
      { fn: '-3*x', domain: [-1.5, 1.32], color: 'accent', width: 2 },
      { fn: '3*x', domain: [-1.2, 1.2], color: 'green', width: 2, dash: '6 4' },
    ],
    segments: [{ points: [[1, -3], [1, 3.2]], color: 'accent', width: 2 }],
    dots: [
      { x: 1, y: 3, color: 'red', r: 3.6 },
      { x: 1, y: -3, color: 'red', r: 3.6 },
      { x: -1, y: 3, color: 'red', r: 3.6 },
    ],
    notes: [
      { x: -0.08, y: -0.26, text: 'O', anchor: 'end', color: 'ink' },
      { x: -0.6, y: 2.55, text: 'D_{1}', anchor: 'middle', color: 'ink' },
      { x: 0.56, y: 1.35, text: 'D_{2}', anchor: 'middle', color: 'ink' },
      { x: 1.12, y: 3.15, text: '(1, 3)', anchor: 'start', color: 'red' },
      { x: 1.12, y: -3.15, text: '(1, −3)', anchor: 'start', color: 'red' },
      { x: -1.12, y: 3.15, text: '(−1, 3)', anchor: 'end', color: 'red' },
      { x: 1.36, y: 2.3, text: 'x = 1', anchor: 'start', color: 'accent' },
      { x: 0.72, y: 2.35, text: 'y = 3x', anchor: 'start', color: 'green' },
    ],
  },
  {
    id: 'hm9-08-substitution-example-2',
    title: '广义极坐标：椭圆区域拉成圆',
    alt: '广义极坐标：椭圆 x²/a²+y²/b²=1 经 x = ar cos θ、y = br sin θ 的伸缩变换，变成 rθ 方向上的单位圆（0 ≤ r ≤ 1）',
    width: 760,
    height: 340,
    x: [-2.2, 6.0],
    y: [-1.5, 1.5],
    equalAspect: true,
    bare: true,
    fills: [
      {
        upper: { fn: '0.8*sqrt(1-(x/1.5)^2)', range: [-1.5, 1.5] },
        lower: { fn: '-0.8*sqrt(1-(x/1.5)^2)', range: [-1.5, 1.5] },
        color: 'accent',
        hatch: true,
      },
      {
        upper: { fn: 'sqrt(1-(x-4.6)^2)', range: [3.6, 5.6] },
        lower: { fn: '-sqrt(1-(x-4.6)^2)', range: [3.6, 5.6] },
        color: 'accent',
        hatch: true,
      },
    ],
    curves: [
      {
        parametric: { x: '1.5*cos(t)', y: '0.8*sin(t)', t: [0, Math.PI * 2] },
        color: 'accent',
        width: 2,
      },
      {
        parametric: { x: '4.6 + cos(t)', y: 'sin(t)', t: [0, Math.PI * 2] },
        color: 'accent',
        width: 2,
      },
    ],
    segments: [
      // 左：椭圆区域的坐标轴
      { points: [[-1.9, 0], [2.1, 0]], color: 'ink', width: 1.4 },
      { points: [[0, -1.3], [0, 1.3]], color: 'ink', width: 1.4 },
      // 中间的变换箭头
      { points: [[2.35, 0], [3.05, 0]], color: 'ink', width: 1.4 },
      // 右：单位圆的坐标轴，以及从极点出发的半径
      { points: [[3.2, 0], [6.0, 0]], color: 'ink', width: 1.4 },
      { points: [[4.6, -1.3], [4.6, 1.3]], color: 'ink', width: 1.4 },
      { points: [[4.6, 0], [5.366, 0.643]], color: 'red', width: 1.6 },
    ],
    arrows: [
      { from: [1.85, 0], to: [2.15, 0], color: 'ink' },
      { from: [0, 1.05], to: [0, 1.35], color: 'ink' },
      { from: [2.78, 0], to: [3.08, 0], color: 'ink' },
      { from: [5.72, 0], to: [6.02, 0], color: 'ink' },
      { from: [4.6, 1.05], to: [4.6, 1.35], color: 'ink' },
    ],
    arcs: [
      {
        center: [4.6, 0],
        radius: 0.36,
        from: 0,
        to: Math.PI / 4.5,
        color: 'red',
        label: 'θ',
        labelRadius: 0.55,
      },
    ],
    notes: [
      { x: -0.08, y: -0.24, text: 'O', anchor: 'end', color: 'ink' },
      { x: 2.16, y: 0.2, text: 'x', anchor: 'start', color: 'ink' },
      { x: -0.08, y: 1.28, text: 'y', anchor: 'end', color: 'ink' },
      { x: 1.62, y: -0.3, text: 'a', anchor: 'start', color: 'accent' },
      { x: 0.16, y: 0.86, text: 'b', anchor: 'start', color: 'accent' },
      { x: 4.94, y: 0.44, text: 'r', anchor: 'start', color: 'red' },
      { x: 5.66, y: -0.26, text: '1', anchor: 'start', color: 'accent' },
      { x: 4.52, y: -0.24, text: 'O', anchor: 'end', color: 'ink' },
      { x: 6.06, y: 0.2, text: 'x', anchor: 'start', color: 'ink' },
      { x: 4.52, y: 1.28, text: 'y', anchor: 'end', color: 'ink' },
    ],
  },
  {
    id: 'hm9-09-substitution-example-1',
    title: '一般换元：三角形区域 D → D′',
    alt: '换元 u=y−x、v=y+x：xOy 面上由 x=0、y=0、x+y=2 围成的三角形 D，变成 uOv 面上由 u=−v、u=v、v=2 围成的三角形 D′',
    width: 760,
    height: 360,
    x: [-0.7, 7.7],
    y: [-0.5, 2.9],
    equalAspect: true,
    bare: true,
    fills: [
      { fn: '2-x', from: 0, to: 2, baseline: 0, color: 'accent', hatch: true },
      {
        upper: { param: { x: '5.2 + t', y: 't', t: [0, 2] } },
        lower: { param: { x: '5.2 - t', y: 't', t: [0, 2] } },
        color: 'accent',
        hatch: true,
      },
    ],
    curves: [
      { fn: '2-x', domain: [0, 2], color: 'accent', width: 2 },
      { parametric: { x: '5.2 + t', y: 't', t: [0, 2] }, color: 'accent', width: 2 },
      { parametric: { x: '5.2 - t', y: 't', t: [0, 2] }, color: 'accent', width: 2 },
    ],
    segments: [
      { points: [[-0.35, 0], [2.5, 0]], color: 'ink', width: 1.4 },
      { points: [[0, -0.35], [0, 2.5]], color: 'ink', width: 1.4 },
      { points: [[2.8, 1.2], [3.5, 1.2]], color: 'ink', width: 1.4 },
      { points: [[2.9, 0], [7.4, 0]], color: 'ink', width: 1.4 },
      { points: [[5.2, 0], [5.2, 2.6]], color: 'ink', width: 1.4 },
    ],
    arrows: [
      { from: [2.2, 0], to: [2.52, 0], color: 'ink' },
      { from: [0, 2.2], to: [0, 2.52], color: 'ink' },
      { from: [3.22, 1.2], to: [3.52, 1.2], color: 'ink' },
      { from: [7.1, 0], to: [7.42, 0], color: 'ink' },
      { from: [5.2, 2.3], to: [5.2, 2.62], color: 'ink' },
    ],
    notes: [
      { x: -0.08, y: -0.22, text: 'O', anchor: 'end', color: 'ink' },
      { x: 2.56, y: 0.2, text: 'x', anchor: 'start', color: 'ink' },
      { x: -0.08, y: 2.42, text: 'y', anchor: 'end', color: 'ink' },
      { x: 2.0, y: -0.26, text: '2', anchor: 'middle', color: 'ink' },
      { x: -0.22, y: 1.94, text: '2', anchor: 'end', color: 'ink' },
      { x: 1.18, y: 1.06, text: 'x + y = 2', anchor: 'start', color: 'accent' },
      { x: 5.12, y: -0.22, text: 'O', anchor: 'end', color: 'ink' },
      { x: 7.48, y: 0.2, text: 'u', anchor: 'start', color: 'ink' },
      { x: 5.36, y: 2.5, text: 'v', anchor: 'start', color: 'ink' },
      { x: 5.36, y: 1.95, text: '2', anchor: 'start', color: 'ink' },
      { x: 4.3, y: 0.82, text: 'u = −v', anchor: 'end', color: 'accent' },
      { x: 6.1, y: 0.82, text: 'u = v', anchor: 'start', color: 'accent' },
    ],
  },
  // ── 第 10 章：曲线积分与曲面积分 ──────────────────────────────────
  // 这一章 10 张图里有 6 张是三维曲面/证明图（面片、法向量、高斯与斯托克斯的证明、
  // 右手定则），按取舍原则留给手绘；下面 4 张是平面图。
  {
    id: 'hm10-01-arc-length-integral-computation',
    title: '弧长微元  ds = √(x′² + y′²) dt',
    alt: '对弧长的曲线积分：在曲线上取一小段弧，弧长微元 ds 是切线方向的斜边，它在两条坐标轴上的投影分别是 dx 与 dy',
    width: 560,
    height: 400,
    x: [-0.5, 2.4],
    y: [-0.4, 1.6],
    equalAspect: true,
    curves: [{ fn: '0.45*x^2', domain: [0, 1.75], color: 'accent', width: 2 }],
    // 直角三角形的斜边取曲线上的【两个点】P(1.2, 0.648) 与 Q(1.4, 0.882) 的弦，
    // 这样三个顶点里有两点严格落在曲线上（之前画成切线延长，末端会差一点点）。
    segments: [
      { points: [[1.2, 0.648], [1.4, 0.648]], color: 'ink', width: 1.3 },
      { points: [[1.4, 0.648], [1.4, 0.882]], color: 'ink', width: 1.3 },
      { points: [[1.2, 0.648], [1.4, 0.882]], color: 'red', width: 2.2 },
    ],
    dots: [
      { x: 0, y: 0, color: 'ink', r: 3.2 },
      { x: 1.2, y: 0.648, color: 'red', r: 3.4 },
      { x: 1.4, y: 0.882, color: 'red', r: 3.4 },
    ],
    notes: [
      { x: -0.06, y: -0.2, text: 'O', anchor: 'end', color: 'ink' },
      { x: 1.3, y: 0.55, text: 'dx', anchor: 'middle', color: 'ink' },
      { x: 1.46, y: 0.75, text: 'dy', anchor: 'start', color: 'ink' },
      { x: 1.16, y: 0.86, text: 'ds', anchor: 'middle', color: 'red' },
      { x: 1.62, y: 1.24, text: 'L', anchor: 'middle', color: 'accent' },
    ],
  },
  {
    id: 'hm10-02-planar-connected-region',
    title: '单连通区域与复连通区域',
    alt: '三种情形：左，单连通区域，任一条闭曲线所围的部分仍在区域内（无洞）；中，复连通区域，中间被挖去一个洞；右，复连通区域，中间只被挖去一个点（洞缩成一点，仍是复连通）',
    width: 960,
    height: 340,
    x: [-0.3, 7.9],
    y: [-1.1, 1.1],
    equalAspect: true,
    bare: true,
    curves: [
      {
        parametric: { x: '0.95 + 0.9*cos(t)', y: '0.78*sin(t) + 0.06*sin(2*t)', t: [0, Math.PI * 2] },
        color: 'accent',
        width: 2,
      },
      {
        parametric: { x: '3.8 + 0.9*cos(t)', y: '0.78*sin(t) + 0.06*sin(2*t)', t: [0, Math.PI * 2] },
        color: 'accent',
        width: 2,
      },
      {
        parametric: { x: '3.8 + 0.32*cos(t)', y: '0.28*sin(t)', t: [0, Math.PI * 2] },
        color: 'red',
        width: 2,
      },
      {
        parametric: { x: '6.65 + 0.9*cos(t)', y: '0.78*sin(t) + 0.06*sin(2*t)', t: [0, Math.PI * 2] },
        color: 'accent',
        width: 2,
      },
    ],
    // 第三种情形：洞缩成一个点。点被挖掉后，绕着它的任意小圆周都不能缩成一点 ——
    // 所以「挖掉一个点」依然是复连通（格林公式里挖奇点那类题正是这种区域）。
    dots: [{ x: 6.65, y: 0, color: 'red', r: 5, open: true }],
    notes: [
      { x: 0.95, y: 0.08, text: 'D', anchor: 'middle', color: 'accent' },
      { x: 3.8, y: 0.6, text: 'D', anchor: 'middle', color: 'accent' },
      { x: 3.8, y: -0.04, text: '洞', anchor: 'middle', color: 'red' },
      { x: 6.65, y: 0.6, text: 'D', anchor: 'middle', color: 'accent' },
      { x: 6.65, y: -0.34, text: '挖去的点', anchor: 'middle', color: 'red' },
      { x: 0.95, y: -1.06, text: '单连通（无洞）', anchor: 'middle', color: 'ink' },
      { x: 3.8, y: -1.06, text: '复连通（挖掉一个洞）', anchor: 'middle', color: 'ink' },
      { x: 6.65, y: -1.06, text: '复连通（挖掉一个点）', anchor: 'middle', color: 'ink' },
    ],
  },
  {
    disabled: true, // 作者认为手绘更好，改回原图
    id: 'hm10-03-boundary-orientation',
    title: '边界曲线的正向',
    alt: '边界正向：沿边界行走时区域 D 始终在左侧，所以外边界取逆时针、内边界取顺时针',
    width: 520,
    height: 440,
    x: [-1.35, 1.35],
    y: [-1.15, 1.15],
    equalAspect: true,
    bare: true,
    curves: [
      { parametric: { x: 'cos(t)', y: 'sin(t)', t: [0, Math.PI * 2] }, color: 'accent', width: 2.2 },
      {
        parametric: { x: '0.42*cos(t)', y: '0.42*sin(t)', t: [0, Math.PI * 2] },
        color: 'accent',
        width: 2.2,
      },
    ],
    segments: [
      // 两条「区域在左侧」的提示短箭头：外边界逆时针、内边界顺时针
      { points: [[-0.342, 0.94], [-0.63, 0.833]], color: 'red', width: 2.4 },
      { points: [[0.144, 0.395], [0.285, 0.344]], color: 'red', width: 2.4 },
    ],
    arrows: [
      { from: [-0.55, 0.85], to: [-0.66, 0.81], color: 'red' },
      { from: [0.24, 0.36], to: [0.30, 0.34], color: 'red' },
    ],
    notes: [
      { x: 0.66, y: 0.04, text: 'D', anchor: 'middle', color: 'accent' },
      { x: -0.78, y: -0.78, text: 'L_{外}', anchor: 'middle', color: 'accent' },
      { x: 0.0, y: -0.62, text: 'L_{内}', anchor: 'middle', color: 'accent' },
      { x: 0, y: -1.06, text: '沿边界走，区域 D 恒在左侧', anchor: 'middle', color: 'ink' },
    ],
  },
  {
    disabled: true, // 作者认为手绘更好，改回原图
    id: 'hm10-04-green-theorem-proof',
    title: '格林公式的证明：X 型区域与 Y 型区域',
    alt: '格林公式的证明分两步：左图把区域看成 X 型（先对 y 积分，竖直窄条），右图看成 Y 型（先对 x 积分，水平窄条）',
    width: 760,
    height: 360,
    x: [-0.4, 7.4],
    y: [-1.0, 2.0],
    equalAspect: true,
    bare: true,
    fills: [
      // 左：整块区域淡淡铺一层；右：同理
      {
        upper: { fn: '1.55 - 0.10*(x-1.65)^2 + 0.28*sin(2.0*(x-0.3))', range: [0.3, 3.0] },
        lower: { fn: '0.15 + 0.20*cos(1.7*(x-0.3))', range: [0.3, 3.0] },
        color: 'accent',
        opacity: 0.12,
      },
      {
        upper: { param: { x: '7.0 - 0.22*(t-0.5)^2 + 0.25*cos(1.4*(t+0.8))', y: 't', t: [-0.8, 1.8] } },
        lower: { param: { x: '4.85 + 0.28*sin(1.6*(t+0.8)) + 0.10*(t-0.5)^2', y: 't', t: [-0.8, 1.8] } },
        color: 'accent',
        opacity: 0.12,
      },
      // 左边那一条竖直窄条 (x, x+dx)
      {
        upper: { fn: '1.55 - 0.10*(x-1.65)^2 + 0.28*sin(2.0*(x-0.3))', range: [1.5, 1.64] },
        lower: { fn: '0.15 + 0.20*cos(1.7*(x-0.3))', range: [1.5, 1.64] },
        color: 'accent',
        opacity: 0.35,
      },
      // 右边那一条水平窄条 (y, y+dy)
      {
        upper: {
          param: { x: '7.0 - 0.22*(t-0.5)^2 + 0.25*cos(1.4*(t+0.8))', y: 't', t: [0.62, 0.76] },
        },
        lower: {
          param: { x: '4.85 + 0.28*sin(1.6*(t+0.8)) + 0.10*(t-0.5)^2', y: 't', t: [0.62, 0.76] },
        },
        color: 'accent',
        opacity: 0.35,
      },
    ],
    curves: [
      { fn: '1.55 - 0.10*(x-1.65)^2 + 0.28*sin(2.0*(x-0.3))', domain: [0.3, 3.0], color: 'accent', width: 2 },
      { fn: '0.15 + 0.20*cos(1.7*(x-0.3))', domain: [0.3, 3.0], color: 'accent', width: 2 },
      {
        parametric: { x: '7.0 - 0.22*(t-0.5)^2 + 0.25*cos(1.4*(t+0.8))', y: 't', t: [-0.8, 1.8] },
        color: 'accent',
        width: 2,
      },
      {
        parametric: { x: '4.85 + 0.28*sin(1.6*(t+0.8)) + 0.10*(t-0.5)^2', y: 't', t: [-0.8, 1.8] },
        color: 'accent',
        width: 2,
      },
    ],
    segments: [
      // 左右两块区域的竖直边界
      { points: [[0.3, 0.35], [0.3, 1.368]], color: 'accent', width: 1.6 },
      { points: [[3.0, 0.123], [3.0, 1.152]], color: 'accent', width: 1.6 },
      { points: [[5.019, -0.8], [6.912, -0.8]], color: 'accent', width: 1.6 },
      { points: [[4.778, 1.8], [6.410, 1.8]], color: 'accent', width: 1.6 },
      // 窄条的两条边界
      { points: [[1.5, 0.55], [1.5, 1.62]], color: 'red', width: 1.4, dash: '4 3' },
      { points: [[1.64, 0.56], [1.64, 1.62]], color: 'red', width: 1.4, dash: '4 3' },
      { points: [[4.99, 0.62], [6.94, 0.62]], color: 'red', width: 1.4, dash: '4 3' },
      { points: [[4.98, 0.76], [6.94, 0.76]], color: 'red', width: 1.4, dash: '4 3' },
    ],
    notes: [
      { x: 1.57, y: 1.78, text: 'dx', anchor: 'middle', color: 'red' },
      { x: 5.9, y: 0.9, text: 'dy', anchor: 'middle', color: 'red' },
      { x: 1.65, y: -0.62, text: 'X 型：先对 y 积分', anchor: 'middle', color: 'ink' },
      { x: 5.9, y: -1.0, text: 'Y 型：先对 x 积分', anchor: 'middle', color: 'ink' },
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

  // disabled 的图跳过不生成（规格留着备查，见文件里标记了 disabled 的那几条）
  const targets = FIGURES.filter((fig) => !only || fig.id.includes(only)).filter(
    (fig) => !fig.disabled
  );
  if (targets.length === 0) {
    console.error(`[plot] --only ${only} 没有匹配到任何图`);
    process.exitCode = 1;
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const rows = [];
  for (const fig of targets) {
    // 先把所有表达式编译一遍：写错时直接指出是哪张图、哪一条，别留下半套图。
    // 曲线的三种写法（fn / parametric / polar）都要过一遍，漏掉一种就会在渲染时才炸。
    const checkCurve = (c, where) => {
      try {
        // 曲线用 parametric、填充的边界用 param，两种名字都认
        const par = c.parametric ?? c.param;
        if (c.polar) compile(c.polar.rho, 't', c.polar.consts ?? {});
        else if (par) {
          compile(par.x, par.var ?? 't', par.consts ?? {});
          compile(par.y, par.var ?? 't', par.consts ?? {});
        } else compile(c.fn, c.var ?? 'x', c.consts ?? {});
      } catch (e) {
        throw new Error(`[${fig.id}] ${where}：${e.message}`);
      }
    };
    for (const c of fig.curves ?? []) checkCurve(c, 'curves');
    for (const t of fig.tangents ?? []) checkCurve({ fn: t.fn, consts: t.consts }, 'tangents');
    for (const fl of fig.fills ?? []) {
      if (fl.fn) checkCurve({ fn: fl.fn, consts: fl.consts }, 'fills');
      else {
        if (fl.upper && !fl.upper.point) checkCurve(fl.upper, 'fills.upper');
        if (fl.lower && !fl.lower.point) checkCurve(fl.lower, 'fills.lower');
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
