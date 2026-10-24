---
title: 高等数学-2 导数与微分
description: 从导数的定义出发，依次讲清求导法则、高阶导数、隐函数与参数方程求导，最后落到微分与线性近似，把变化率与变化量一次算清。
category: 数学
subject: 数学
subfield: 高等数学
topic: 导数与微分
difficulty: 基础
date: "2026-10-20"
tags: [高等数学, 导数, 微分, 求导法则, 链式法则, 高阶导数, 隐函数求导, 参数方程求导]
draft: false
featured: false
---

## 导数概念

极限描述了"当 $x$ 趋近某点时，$f(x)$ 趋近何值"。导数将极限用于一个全新的问题：**函数在某点的变化率**——即当自变量发生微小变化时，函数值变化有多快。

### 导数的定义

#### 定义与记号

设函数 $y = f(x)$ 在点 $x_0$ 的某个邻域内有定义。当自变量 $x$ 在 $x_0$ 处取得增量 $\Delta x$（点 $x_0 + \Delta x$ 仍在该邻域内）时，因变量取得增量 $\Delta y = f(x_0 + \Delta x) - f(x_0)$。如果 $\Delta y$ 与 $\Delta x$ 之比当 $\Delta x \to 0$ 时极限存在，那么称函数 $y = f(x)$ 在点 $x_0$ 处**可导**，并称这个极限为函数 $y = f(x)$ 在点 $x_0$ 处的**导数**，记为 $f'(x_0)$：

$$
f'(x_0) = \lim_{\Delta x \to 0} \frac{\Delta y}{\Delta x} = \lim_{\Delta x \to 0} \frac{f(x_0 + \Delta x) - f(x_0)}{\Delta x}
$$

也可记作 $y'|_{x=x_0}$，$\frac{dy}{dx}\big|_{x=x_0}$ 或 $\frac{df(x)}{dx}\big|_{x=x_0}$。

导数的本质是**差商的极限**：$\frac{\Delta y}{\Delta x}$ 是函数在 $[x_0, x_0+\Delta x]$ 上的平均变化率，取极限 $\Delta x \to 0$ 后就得到了 $x_0$ 处的**瞬时变化率**——这正是导数最核心的物理意义。

> **注意**：导数定义中的极限必须存在且为有限值。$\Delta x \to 0$ 是双侧极限，不能只用单侧。

#### 导数的等价定义形式

在实际计算中，导数的定义有三种等价形式，灵活选用可以简化计算：

$$
\begin{aligned}
f'(x_0) &= \lim_{\Delta x \to 0} \frac{f(x_0 + \Delta x) - f(x_0)}{\Delta x} & \text{（增量形式）} \\
f'(x_0) &= \lim_{h \to 0} \frac{f(x_0 + h) - f(x_0)}{h} & \text{（h-形式，上下一致，定点出现）} \\
f'(x_0) &= \lim_{x \to x_0} \frac{f(x) - f(x_0)}{x - x_0} & \text{（x→x₀ 形式）}
\end{aligned}
$$

特别地，当 $x_0 = 0$ 时：$f'(0) = \lim\limits_{x \to 0} \frac{f(x) - f(0)}{x}$（常用简化形式）。

导数定义的应用：以下例题考察对导数定义各种等价形式的灵活运用——不需要求出导数本身，只通过定义形式的变形即可求解。

:::example 例 1 · 连乘积在 x = 0 处的导数
设 $f(x) = x(x+1)(x+2)\dots(x+n)$，求 $f'(0)$。

**思路**：用 $x \to 0$ 形式的导数定义 $f'(0) = \lim\limits_{x \to 0} \frac{f(x) - f(0)}{x}$。$f(0) = 0$，分子中每一项都含 $x$，可以约去。

**解**：

$$
f'(0) = \lim_{x \to 0} \frac{f(x) - f(0)}{x - 0} = \lim_{x \to 0} \frac{x(x+1)(x+2)\dots(x+n)}{x} = \lim_{x \to 0} (x+1)(x+2)\dots(x+n) = n!
$$

**评注**：选对定义形式是解题关键。如果对连乘积直接求导会很繁琐，但利用 $x \to 0$ 形式，分子的 $x$ 因子直接约去，立刻得到答案。

:::

:::example 例 2 · 已知导数值，求差商的极限
已知 $f'(3) = 2$，求 $\lim\limits_{h \to 0} \dfrac{f(3 - h) - f(3)}{2h}$。

**思路**：将极限表达式向导数定义 $f'(3) = \lim\limits_{h \to 0} \frac{f(3 + h) - f(3)}{h}$ 的方向配凑。注意 $3 - h = 3 + (-h)$，因此 $\frac{f(3 - h) - f(3)}{-h} \to f'(3)$。

**解**：

$$
\lim_{h \to 0} \frac{f(3 - h) - f(3)}{2h} = \lim_{h \to 0} \frac{f(3 - h) - f(3)}{-h} \cdot \left(-\frac{1}{2}\right) = f'(3) \cdot \left(-\frac{1}{2}\right) = -1
$$

**评注**：核心技巧是"配凑分母"：使分母与 $f$ 内部自变量的变化量保持一致——这里 $f$ 内部从 $3$ 变到 $3-h$，变化量为 $-h$，因此分母需要是 $-h$ 才能直接得到 $f'(3)$。

:::

:::example 例 3 · 复合自变量的差商
设 $f(x)$ 在 $x = 1$ 处可导，且 $f(1) = 2$，$f'(1) = 1$，求 $\lim\limits_{x \to 1} \dfrac{f(x^2) - 2}{x - 1}$。

**思路**：$f(x^2)$ 是复合形式，用 $x \to x_0$ 形式的导数定义。分子 $f(x^2) - f(1)$，需要分母变为 $x^2 - 1$ 才能凑出 $f'(1)$。

**解**：

$$
\lim_{x \to 1} \frac{f(x^2) - 2}{x - 1} = \lim_{x \to 1} \frac{f(x^2) - f(1)}{x^2 - 1} \cdot (x + 1) = f'(1) \cdot 2 = 2
$$

**评注**：当 $f$ 内部不是单纯的 $x$ 而是 $x^2$ 时，通过乘除 $(x^2-1)/(x-1) = x+1$ 来配凑导数定义的标准形式。$x \to 1$ 时 $x^2 \to 1$，满足"定点出现"的条件。

:::

:::example 例 4 · 两点差商化为导数
设函数 $f(x)$ 在点 $x = x_0$ 处的导数 $f'(x_0)$ 存在，求 $\lim\limits_{h \to 0} \dfrac{f(x_0 + 4h) - f(x_0 + 2h)}{h}$。

**思路**：分子是两点函数值之差，通过"减 $f(x_0)$ 再加 $f(x_0)$"的技巧拆成两个导数定义的极限。

**解**：

$$
\begin{aligned}
\text{原式} &= \lim_{h \to 0} \frac{[f(x_0 + 4h) - f(x_0)] - [f(x_0 + 2h) - f(x_0)]}{h} \\
&= 4 \lim_{h \to 0} \frac{f(x_0 + 4h) - f(x_0)}{4h} - 2 \lim_{h \to 0} \frac{f(x_0 + 2h) - f(x_0)}{2h} \\
&= 4 f'(x_0) - 2 f'(x_0) = 2 f'(x_0)
\end{aligned}
$$

**评注**："减 $f(x_0)$ 再加 $f(x_0)$"是导数定义题中的核心代数技巧。将两点差拆为两个"以 $x_0$ 为定点"的差，然后各自配凑分母。

:::

#### 导函数

如果函数 $y = f(x)$ 在开区间 $I$ 内的每点处都可导，就称 $f(x)$ 在开区间 $I$ 内**可导**。这时，对任一 $x \in I$，都对应着 $f(x)$ 的一个确定的导数值，这样就构成了一个新的函数，叫做原来函数 $y = f(x)$ 的**导函数**，记作 $y'$，$f'(x)$，$\frac{dy}{dx}$ 或 $\frac{df(x)}{dx}$。导函数简称**导数**。

#### 单侧导数

与函数极限需要区分左右极限一样，导数作为差商的极限，自然也有"从左逼近"和"从右逼近"之分。对于分段函数在分段点处的可导性，以及 $y = \lvert x \rvert$ 这种在一点两侧变化趋势截然不同的函数，必须分别考察左右导数：

- **左导数**：$f'_-(x_0) = \lim\limits_{h \to 0^-} \frac{f(x_0 + h) - f(x_0)}{h}$
- **右导数**：$f'_+(x_0) = \lim\limits_{h \to 0^+} \frac{f(x_0 + h) - f(x_0)}{h}$

#### 可导的充要条件与不可导的情形

函数 $f(x)$ 在点 $x_0$ 处可导的**充要条件**是左导数 $f'_-(x_0)$ 和右导数 $f'_+(x_0)$ 都存在且相等。

如果 $f(x)$ 在开区间 $(a, b)$ 内可导，且 $f'_+(a)$ 及 $f'_-(b)$ 都存在，就说 $f(x)$ 在闭区间 $[a, b]$ 上可导。

**不可导的四种典型情形：**

![导数不存在的四种典型情形：间断点、角点、尖点与垂直切线](/notes-assets/hm2-01-non-differentiable-cases.jpg)

| 情形 | 特征 | 例子 |
| :--- | :--- | :--- |
| 间断点 | 不连续 | 分段函数在跳跃处 |
| **角点** | 连续，左右导数存在但不相等 | $y = \lvert x \rvert$ 在 $x = 0$ |
| **尖点** | 连续，单侧导数分别为 $+\infty$ 和 $-\infty$ | $y = x^{2/3}$ 在 $x = 0$ |
| 垂直切线 | 连续，左右导数同为 $+\infty$ 或 $-\infty$ | $y = \sqrt[3]{x}$ 在 $x = 0$ |

#### 用定义求基本初等函数的导数

以下通过定义直接推导几个最基本的导数公式，它们是后续所有求导法则的"原子"。

:::example 例 1 · 常数函数的导数
求 $f(x) = C$（$C$ 为常数）的导数。

**解**：$f'(x) = \lim\limits_{\Delta x \to 0} \frac{C - C}{\Delta x} = \lim\limits_{\Delta x \to 0} 0 = 0$，即 $(C)' = 0$。

**评注**：常数函数的变化率恒为零——几何上对应水平直线的斜率为零。

:::

:::example 例 2 · 幂函数的导数
求 $f(x) = x^\mu$（$\mu \in \mathbb{R}$）的导数。

**解**：利用等价无穷小 $(1 + \frac{\Delta x}{x})^\mu - 1 \sim \mu \cdot \frac{\Delta x}{x}$：

$$
f'(x) = \lim_{\Delta x \to 0} \frac{(x + \Delta x)^\mu - x^\mu}{\Delta x} = \lim_{\Delta x \to 0} \frac{x^\mu \big[ (1 + \frac{\Delta x}{x})^\mu - 1 \big]}{\Delta x} = x^\mu \cdot \frac{\mu \cdot \frac{\Delta x}{x}}{\Delta x} = \mu x^{\mu - 1}
$$

即 $(x^\mu)' = \mu x^{\mu - 1}$。

**评注**：幂函数求导公式是使用频率最高的导数公式。特例：$(\sqrt{x})' = (x^{1/2})' = \frac{1}{2\sqrt{x}}$，$(\frac{1}{x})' = (x^{-1})' = -\frac{1}{x^2}$。

:::

:::example 例 3 · 正弦函数的导数
求 $f(x) = \sin x$ 的导数。

**解**：利用和差化积 $\sin(x + \Delta x) - \sin x = 2 \cos(x + \frac{\Delta x}{2}) \sin \frac{\Delta x}{2}$：

$$
f'(x) = \lim_{\Delta x \to 0} \frac{2 \cos(x + \frac{\Delta x}{2}) \sin \frac{\Delta x}{2}}{\Delta x} = \lim_{\Delta x \to 0} \cos\!\left(x + \frac{\Delta x}{2}\right) \cdot \frac{\sin \frac{\Delta x}{2}}{\frac{\Delta x}{2}} = \cos x
$$

即 $(\sin x)' = \cos x$。同理可得 $(\cos x)' = -\sin x$。

**评注**：此推导用到了高等数学-1 函数与极限的第一重要极限 $\frac{\sin \square}{\square} \to 1$——极限是求导的工具，这里体现得很直接。

:::

:::example 例 4 · 指数函数的导数
求 $f(x) = a^x$（$a > 0, a \neq 1$）的导数。

**解**：利用等价无穷小 $a^{\Delta x} - 1 \sim \Delta x \ln a$：

$$
f'(x) = \lim_{\Delta x \to 0} \frac{a^{x + \Delta x} - a^x}{\Delta x} = a^x \lim_{\Delta x \to 0} \frac{a^{\Delta x} - 1}{\Delta x} = a^x \ln a
$$

即 $(a^x)' = a^x \ln a$。特别地，$(e^x)' = e^x$（因为 $\ln e = 1$）。

**评注**：$e^x$ 的导数等于它本身，这是 $e^x$ 最重要的性质，也是自然对数底 $e$ 的"灵魂"所在。

:::

### 导数的几何意义

#### 切线斜率与切线方程

![导数的几何意义：曲线 y = f(x) 在点 (x₀, y₀) 处切线的斜率就是 f′(x₀)](/notes-assets/hm2-02-geometric-meaning.svg)

导数 $f'(x_0)$ 在几何上表示曲线 $y = f(x)$ 在点 $(x_0, f(x_0))$ 处的**切线斜率**。由此得到：

- **切线方程**：$y - y_0 = f'(x_0)(x - x_0)$
- **法线方程**：$y - y_0 = -\dfrac{1}{f'(x_0)}(x - x_0)$（当 $f'(x_0) \neq 0$ 时；若 $f'(x_0) = 0$，法线为 $x = x_0$）

#### 例题

:::example 例 1 · 求指定点处的切线与法线方程
求 $y = \dfrac{1}{x^{2}}$ 在点 $\left(\dfrac{1}{2}, 2\right)$ 处的切线和法线方程。

**思路**：先求导得出该点处的切线斜率 $k = f'(x_0)$，再套用切线、法线的点斜式方程。注意 $y = x^{-2}$，用幂函数求导公式。

**解**：$y' = -2x^{-3} = -\dfrac{2}{x^{3}}$。在 $x = \dfrac{1}{2}$ 处：

$$
k = f'\left(\frac{1}{2}\right) = -\frac{2}{\left(\frac{1}{2}\right)^{3}} = -16
$$

切线：$y - 2 = -16\left(x - \dfrac{1}{2}\right)$，即 $16x + y - 10 = 0$。

法线斜率与切线斜率互为负倒数，即 $-\dfrac{1}{k} = \dfrac{1}{16}$，故 $y - 2 = \dfrac{1}{16}\left(x - \dfrac{1}{2}\right)$，即 $2x - 32y + 63 = 0$。

**评注**：求切线方程的三步：求导得斜率 → 代入切点坐标 → 写出点斜式。法线斜率是切线斜率的负倒数，所以要先确认 $f'(x_0) \neq 0$。

:::

:::example 例 2 · 求过定点的切线方程
求 $y = x^{\frac{3}{2}}$ 通过点 $(0, -4)$ 的切线方程。

**思路**：点 $(0, -4)$ 不在曲线上（$x=0$ 时 $y=0 \neq -4$），因此需要先设切点 $(x_0, x_0^{3/2})$，用切点坐标和导数表示切线方程，再代入 $(0,-4)$ 解出 $x_0$。

**解**：$y' = \frac{3}{2} x^{1/2}$。设切点为 $(x_0, y_0) = (x_0, x_0^{3/2})$，则 $k = \frac{3}{2} \sqrt{x_0}$。切线方程：$y - x_0^{3/2} = \frac{3}{2} \sqrt{x_0} (x - x_0)$。代入 $(0, -4)$：

$$
-4 - x_0^{3/2} = \frac{3}{2} \sqrt{x_0} \cdot (-x_0) \Rightarrow -4 = x_0^{3/2} - \frac{3}{2} x_0^{3/2} = -\frac{1}{2} x_0^{3/2} \Rightarrow x_0^{3/2} = 8 \Rightarrow x_0 = 4
$$

$y_0 = 4^{3/2} = 8$，$k = \frac{3}{2} \cdot 2 = 3$。切线：$y - 8 = 3(x - 4)$，即 $3x - y - 4 = 0$。

**评注**："过某点的切线"与"在某点处的切线"不同——若给定点不在曲线上，需先设切点再解出。

:::

### 可导性与连续性的关系

#### 可导必连续

如果 $y = f(x)$ 在点 $x$ 处可导，那么函数在该点必连续。

> **注意**：**可导 $\Rightarrow$ 连续，但连续 $\nRightarrow$ 可导。** 最经典的例子是 $y = |x|$ 在 $x = 0$ 处连续但不可导（角点——左右导数分别为 $-1$ 和 $1$）。

#### 分段函数可导性的判断

判断分段函数在分段点处的可导性，需要两步：先验证**连续性**（不连续则必然不可导），再验证**左右导数是否相等**。

:::example 例 1 · 分段函数可导求参数
若 $f(x) = \begin{cases} b(1 + \sin x + a + 2), & x > 0 \\ e^{ax} - 1, & x \leq 0 \end{cases}$ 在 $x = 0$ 处可导，求 $a, b$。

**思路**：可导必连续 $\to$ 先用连续性建立第一个方程；左右导数相等 $\to$ 用可导性建立第二个方程。

**解**：由连续性：$\lim\limits_{x \to 0^+} f(x) = b(1 + 0 + a + 2) = b(a + 3)$，$\lim\limits_{x \to 0^-} f(x) = e^0 - 1 = 0$，$f(0) = 0$。故 $b(a + 3) = 0$。

由可导性：$f'_+(0) = \lim\limits_{x \to 0^+} \frac{b(1 + \sin x + a + 2) - 0}{x} = b \cdot \lim\limits_{x \to 0^+} \frac{\sin x + a + 3}{x}$，这个极限存在要求 $a + 3 = 0$，此时极限 $= b \cdot 1$。$f'_-(0) = \lim\limits_{x \to 0^-} \frac{e^{ax} - 1}{x} = a$。由 $f'_+(0) = f'_-(0)$ 得 $b = a$。结合 $a + 3 = 0$ 得 $a = b = -3$。

**评注**：分段函数在分段点处的可导性，是这类问题里最经典的综合题型。解题顺序：(1) 连续性 $\to$ (2) 左右导数 $\to$ (3) 联立解参数。

:::

:::example 例 2 · 分段点处的连续性与可导性
设 $f(x) = \begin{cases} x^3 + \ln x, & x \geq 1 \\ x^3 \ln x, & 0 < x < 1 \end{cases}$，讨论 $f(x)$ 在 $x = 1$ 处的连续性与可导性。

**思路**：先算左右极限判断连续性；若不连续则直接得出不可导（可导的必要条件是连续）。

**解**：$\lim\limits_{x \to 1^-} f(x) = 1^3 \cdot \ln 1 = 0$，$\lim\limits_{x \to 1^+} f(x) = 1^3 + \ln 1 = 1$，$f(1) = 1$。左右极限不相等（$0 \neq 1$），故 $f(x)$ 在 $x = 1$ 处**不连续**，从而必然**不可导**。

**评注**："不连续 $\Rightarrow$ 不可导"是一种快速判断——如果函数在分段点处连连续性都不满足，就无需再计算左右导数了。

:::

## 函数的求导法则

用定义求导——每一道题都需要回到 $\lim \frac{\Delta y}{\Delta x}$，效率太低。本节建立一套完整的求导法则，使我们能够从少数几个基本初等函数的导数出发，通过四则运算、反函数、复合函数等规则，求出任意初等函数的导数。这些法则是整个微分学的**计算基础**。

### 四则运算求导法则

#### 和、差、积、商的求导法则

$$
\begin{aligned}
\big[ u(x) \pm v(x) \big]' &= u'(x) \pm v'(x) \\
\big[ C \cdot u(x) \big]' &= C \cdot u'(x) \quad (C \text{ 为常数}) \\
\big[ u(x) \cdot v(x) \big]' &= u'(x) v(x) + u(x) v'(x) \\
\left[ \frac{u(x)}{v(x)} \right]' &= \frac{u'(x) v(x) - u(x) v'(x)}{v^2(x)} \quad (v(x) \neq 0)
\end{aligned}
$$

:::note 乘积法则的推导
在差商中插入 $u(x)v(x+h)$ 这一项（"减一项加一项"）：

$$
\begin{aligned}
\frac{u(x+h)v(x+h) - u(x)v(x)}{h} &= \frac{u(x+h)v(x+h) - u(x)v(x+h) + u(x)v(x+h) - u(x)v(x)}{h} \\
&= \frac{u(x+h) - u(x)}{h} \cdot v(x+h) + u(x) \cdot \frac{v(x+h) - v(x)}{h}
\end{aligned}
$$

令 $h \to 0$：第一项 $\to u'(x) \cdot v(x)$（$v$ 可导必连续，故 $v(x+h) \to v(x)$），第二项 $\to u(x) \cdot v'(x)$。即得 $(uv)' = u'v + uv'$。商的法则可由乘积法则结合倒数求导 $(\frac{1}{v})' = -\frac{v'}{v^2}$ 推出，不再单独证明。

:::

> **注意**：积的求导是"前导后不导 + 前不导后导"，**不是**各自求导再相乘。商的求导公式分子是"**子导母不导 − 子不导母导**"，顺序不能记反。

:::example 例 1 · 正切函数的导数
求 $y = \tan x$ 的导数。

**思路**：$\tan x = \frac{\sin x}{\cos x}$，用商的求导法则。

**解**：$(\tan x)' = \left( \dfrac{\sin x}{\cos x} \right)' = \dfrac{\cos x \cdot \cos x - \sin x \cdot (-\sin x)}{\cos^2 x} = \dfrac{\cos^2 x + \sin^2 x}{\cos^2 x} = \dfrac{1}{\cos^2 x} = \sec^2 x$。

同理可得 $(\cot x)' = -\csc^2 x$。

**评注**：六个三角函数的导数中，$\tan x$ 和 $\sec x$ 的导数互为关联：$(\tan x)' = \sec^2 x$，$(\sec x)' = \sec x \tan x$。

:::

:::example 例 2 · 正割函数的导数
求 $y = \sec x$ 的导数。

**解**：$(\sec x)' = \left( \dfrac{1}{\cos x} \right)' = \dfrac{0 \cdot \cos x - 1 \cdot (-\sin x)}{\cos^2 x} = \dfrac{\sin x}{\cos^2 x} = \sec x \tan x$。

同理可得 $(\csc x)' = -\csc x \cot x$。

:::

### 反函数的求导法则

#### 反函数求导公式

如果 $x = f(y)$ 在区间 $I_y$ 内单调、可导且 $f'(y) \neq 0$，那么它的反函数 $y = f^{-1}(x)$ 在对应区间内也可导，且：

$$
\big[ f^{-1}(x) \big]' = \frac{1}{f'(y)} \quad \text{或} \quad \frac{dy}{dx} = \frac{1}{\frac{dx}{dy}}
$$

:::note 反函数求导公式的推导
设 $y = f^{-1}(x)$，其反函数为 $x = f(y)$。由反函数的连续性，$\Delta x \to 0$ 时 $\Delta y \to 0$。考虑差商：

$$
\frac{\Delta y}{\Delta x} = \frac{1}{\frac{\Delta x}{\Delta y}}
$$

令 $\Delta x \to 0$（此时 $\Delta y \to 0$），取极限即得 $\frac{dy}{dx} = \frac{1}{\frac{dx}{dy}}$，即 $[f^{-1}(x)]' = \frac{1}{f'(y)}$。几何解释：切线斜率互为倒数——若原函数在 $(y, x)$ 处斜率为 $f'(y)$，则反函数在 $(x, y)$ 处斜率为 $1/f'(y)$（图像关于 $y = x$ 对称）。

:::

> **注意**：反函数求导的关键：$y = f^{-1}(x) \Leftrightarrow x = f(y)$，对 $x = f(y)$ 两边关于 $x$ 求导，得 $1 = f'(y) \cdot y'$，故 $y' = 1/f'(y)$。注意最终答案要用 $x$ 表示（将 $y$ 换回 $x$ 的表达式）。

:::example 例 3 · 反正弦函数的导数
求 $y = \arcsin x$ 的导数。

**思路**：$y = \arcsin x \Rightarrow x = \sin y$（$y \in [-\frac{\pi}{2}, \frac{\pi}{2}]$）。由反函数求导公式：$y' = 1 / (\sin y)' = 1 / \cos y$。再用 $\cos y = \sqrt{1 - \sin^2 y} = \sqrt{1 - x^2}$（$y \in [-\frac{\pi}{2}, \frac{\pi}{2}]$ 时 $\cos y \geq 0$，取正号）。

**解**：$y = \arcsin x \Rightarrow x = \sin y$，两边对 $x$ 求导：$1 = \cos y \cdot y' \Rightarrow y' = \dfrac{1}{\cos y} = \dfrac{1}{\sqrt{1 - \sin^2 y}} = \dfrac{1}{\sqrt{1 - x^2}}$。

即 $(\arcsin x)' = \dfrac{1}{\sqrt{1 - x^2}}$。同理 $(\arccos x)' = -\dfrac{1}{\sqrt{1 - x^2}}$。

**评注**：$\arcsin x$ 和 $\arccos x$ 的导数只差一个负号，可以对比记忆：$\arcsin x$ 单调递增（导数为正），$\arccos x$ 单调递减（导数为负）。

:::

:::example 例 4 · 反正切函数的导数
求 $y = \arctan x$ 的导数。

**解**：$y = \arctan x \Rightarrow x = \tan y$（$y \in (-\frac{\pi}{2}, \frac{\pi}{2})$）。两边对 $x$ 求导：

$$
1 = \sec^2 y \cdot y' \Rightarrow y' = \frac{1}{\sec^2 y} = \frac{1}{1 + \tan^2 y} = \frac{1}{1 + x^2}
$$

即 $(\arctan x)' = \dfrac{1}{1 + x^2}$。同理 $(\operatorname{arccot} x)' = -\dfrac{1}{1 + x^2}$。

:::

:::example 例 5 · 反函数在一点的导数值
设可导函数 $y = f(x)$ 的反函数为 $x = \varphi(y)$，且 $f(1) = 2$，$f(2) = 3$，$f'(1) = 4$，$f'(2) = 5$，求 $\varphi'(2)$。

**思路**：$\varphi$ 是 $f$ 的反函数，$\varphi'(y) = 1/f'(x)$ 其中 $y = f(x)$。$\varphi'(2)$ 对应 $y = 2$，此时 $x$ 满足 $f(x) = 2$，即 $x = 1$。

**解**：$\varphi'(2) = \dfrac{1}{f'(1)} = \dfrac{1}{4}$。

**评注**：反函数求导数值题的关键是"对号入座"：$\varphi'(y_0)$ 要找 $x_0$ 使 $f(x_0) = y_0$，然后用 $1/f'(x_0)$。注意不是代入 $f'(2)$——$\varphi'(2)$ 的原像 $x$ 是使 $f(x) = 2$ 的值（即 $x = 1$）。

:::

### 复合函数的求导法则（链式法则）

#### 链式法则

如果 $u = g(x)$ 在点 $x$ 处可导，而 $y = f(u)$ 在点 $u = g(x)$ 处可导，则复合函数 $y = f[g(x)]$ 在点 $x$ 处可导，且：

$$
\frac{dy}{dx} = f'(u) \cdot g'(x) \quad \text{或} \quad \frac{dy}{dx} = \frac{dy}{du} \cdot \frac{du}{dx}
$$

链式法则是求导法则中最重要的一条——它使得任意多层复合的函数都能被"层层剥开"求导。**核心口诀：由外向内，逐层求导，层层相乘。**

> **注意**：最常见的错误是**漏层**——只对外层求导而忘记乘以内层的导数。例如 $(\sin 2x)' = \cos 2x \cdot 2$，不能只写 $\cos 2x$ 漏掉 $\cdot 2$。

:::example 例 6 · 三层复合函数求导
设 $y = \ln \cos(e^x)$，求 $\dfrac{dy}{dx}$。

**思路**：三层复合：$y = \ln u$，$u = \cos v$，$v = e^x$。逐层求导相乘。

**解**：

$$
\frac{dy}{dx} = \frac{1}{\cos(e^x)} \cdot \big[ -\sin(e^x) \big] \cdot e^x = -e^x \tan(e^x)
$$

**评注**：三层复合的链式法则为 $\frac{dy}{dx} = \frac{dy}{du} \cdot \frac{du}{dv} \cdot \frac{dv}{dx}$。求导时在心中默念"外层→中层→内层"，边念边乘，避免漏层。

:::

### 基本求导公式总表

| 函数 | 导数 | 函数 | 导数 |
| :--- | :--- | :--- | :--- |
| $C$（常数） | $0$ | | |
| $x^\mu$ | $\mu x^{\mu - 1}$ | | |
| $\sin x$ | $\cos x$ | $\cos x$ | $-\sin x$ |
| $\tan x$ | $\sec^2 x$ | $\cot x$ | $-\csc^2 x$ |
| $\sec x$ | $\sec x \tan x$ | $\csc x$ | $-\csc x \cot x$ |
| $\arcsin x$ | $\dfrac{1}{\sqrt{1 - x^2}}$ | $\arccos x$ | $-\dfrac{1}{\sqrt{1 - x^2}}$ |
| $\arctan x$ | $\dfrac{1}{1 + x^2}$ | $\operatorname{arccot} x$ | $-\dfrac{1}{1 + x^2}$ |
| $a^x$ | $a^x \ln a$ | $e^x$ | $e^x$ |
| $\log_a x$ | $\dfrac{1}{x \ln a}$ | $\ln x$ | $\dfrac{1}{x}$ |

> **注意**：记忆技巧——$\sin$/$\cos$ 互导但有符号变化；$\tan$/$\cot$ 导出平方关系；$\arcsin$/$\arccos$ 和 $\arctan$/$\operatorname{arccot}$ 差一个负号；$e^x$ 导数是它本身。

## 高阶导数

导数 $f'(x)$ 本身也是一个函数，自然可以继续对它求导，得到"导数的导数"。这种反复求导的操作引出了高阶导数的概念，在物理（加速度是位移的二阶导数）和泰勒展开式中都有重要应用。

### 高阶导数的定义

#### 二阶及高阶导数

把 $y' = f'(x)$ 的导数叫做函数 $y = f(x)$ 的**二阶导数**，记作 $y''$ 或 $\dfrac{d^2 y}{dx^2}$。

类似地，三阶导数记作 $y'''$ 或 $\dfrac{d^3 y}{dx^3}$，$n$ 阶导数记作 $y^{(n)}$ 或 $\dfrac{d^n y}{dx^n}$。二阶及以上的导数统称为**高阶导数**。

### 常用高阶导数公式

#### 基本初等函数的高阶导数

- $(x^\mu)^{(n)} = \mu(\mu-1)\cdots(\mu-n+1) x^{\mu-n}$（当 $\mu$ 为正整数且 $n > \mu$ 时结果为 $0$）
- $(a^x)^{(n)} = \ln^n a \cdot a^x$，特别地 $(e^x)^{(n)} = e^x$
- $[\ln(1 + x)]^{(n)} = (-1)^{n-1} \dfrac{(n-1)!}{(1 + x)^n}$
- $(\sin x)^{(n)} = \sin\!\left(x + n \cdot \dfrac{\pi}{2}\right)$
- $(\cos x)^{(n)} = \cos\!\left(x + n \cdot \dfrac{\pi}{2}\right)$

> **注意**：$\sin x$ 和 $\cos x$ 每求导一次，相位前进 $\frac{\pi}{2}$，函数名在 $\sin/\cos/-\sin/-\cos$ 之间循环，周期为 $4$。

#### 高阶导数的运算法则

- $(u \pm v)^{(n)} = u^{(n)} \pm v^{(n)}$
- $(C u)^{(n)} = C \cdot u^{(n)}$

#### 莱布尼茨公式（乘积的高阶导数）

$$
(uv)^{(n)} = \sum_{k=0}^{n} \binom{n}{k} u^{(n-k)} v^{(k)}
$$

其中 $\binom{n}{k} = C_n^k = \frac{n!}{k!(n-k)!}$。莱布尼茨公式在形式上和二项式定理 $(a+b)^n$ 完全一致，将"幂次"替换为"求导阶数"即可。由数学归纳法可证：$(uv)' = u'v + uv'$ 是 $n=1$ 的基础情形，假设 $n$ 阶成立，再求一次导即得 $n+1$ 阶形式，系数的递推 $C_n^{k-1} + C_n^k = C_{n+1}^k$ 与二项式展开完全同构。

#### 例题

:::example 例 1 · 正弦函数的 n 阶导数
设 $y = \sin x$，求 $y^{(n)}$。

**思路**：逐阶求导，观察规律。每求一次导，$\sin$ 和 $\cos$ 交替出现，符号每两阶变化一次。

**解**：$y' = \cos x = \sin(x + \frac{\pi}{2})$，$y'' = -\sin x = \sin(x + 2 \cdot \frac{\pi}{2})$，$y''' = -\cos x = \sin(x + 3 \cdot \frac{\pi}{2})$，归纳得：

$$
y^{(n)} = \sin\!\left(x + n \cdot \frac{\pi}{2}\right)
$$

同理 $(\cos x)^{(n)} = \cos(x + n \cdot \frac{\pi}{2})$。

**评注**：$\sin x$ 和 $\cos x$ 的高阶导数是"循环型"的——求导不会增加复杂度，只是相位移动。

:::

:::example 例 2 · 莱布尼茨公式求 20 阶导数
设 $y = x^2 \cdot e^{2x}$，求 $y^{(20)}$。

**思路**：乘积的高阶导数用莱布尼茨公式。$u = x^2$ 从三阶导数开始全部为零（$(x^2)''' = 0$），因此公式中只有 $k = 0, 1, 2$ 三项非零。

**解**：令 $u = x^2$，$v = e^{2x}$。$v^{(n)} = 2^n e^{2x}$。由莱布尼茨公式：

$$
\begin{aligned}
y^{(20)} &= \sum_{k=0}^{20} C_{20}^k (x^2)^{(k)} (e^{2x})^{(20-k)} \\
&= C_{20}^0 \cdot x^2 \cdot 2^{20} e^{2x} + C_{20}^1 \cdot 2x \cdot 2^{19} e^{2x} + C_{20}^2 \cdot 2 \cdot 2^{18} e^{2x} \\
&= 2^{20} e^{2x} \left[ x^2 + \frac{20 \cdot 2x}{2} + \frac{190 \cdot 2}{4} \right] = 2^{20} e^{2x} (x^2 + 20x + 95)
\end{aligned}
$$

**评注**：莱布尼茨公式在 $u$ 的低阶导数很快归零时（如 $u$ 为多项式）特别好用——只需计算前几项。

:::

## 隐函数及参数方程求导

并非所有函数都能写成 $y = f(x)$ 的显式形式。方程 $e^y + xy - e = 0$ 确定的 $y(x)$ 就无法解出显式。本节处理两类"非显式"函数的求导：隐函数（由方程 $F(x, y) = 0$ 确定）和参数方程（由 $\begin{cases}x = \varphi(t) \\ y = \psi(t)\end{cases}$ 确定）。

### 隐函数求导

#### 隐函数的概念

等号左端是因变量符号、右端是含有自变量的式子，这样表达的函数叫做**显函数**。不遵循上述表达方式的函数叫做**隐函数**（如 $x + y^3 - 1 = 0$）。把一个隐函数化成显函数，叫做隐函数的显化——但很多隐函数无法显化。

#### 隐函数求导法

**核心方法：方程两边同时对 $x$ 求导。** 关键是把 $y$ 看作 $x$ 的函数，每次遇到含 $y$ 的项时，用链式法则乘上 $y'$（即 $\frac{dy}{dx}$）。

> **注意**：隐函数求导最常见的错误是**忘了 $y$ 是 $x$ 的函数**——例如 $(y^2)' = 2y \cdot y'$，不能只写 $2y$。

:::example 例 1 · 隐函数的一阶导数
求隐函数 $e^y + xy - e = 0$ 的导数 $\dfrac{dy}{dx}$。

**思路**：两边对 $x$ 求导，$e^y$ 求导得 $e^y \cdot y'$（$y$ 是 $x$ 的函数），$xy$ 用乘积法则得 $1 \cdot y + x \cdot y'$。

**解**：两边对 $x$ 求导：$e^y \cdot y' + (y + x y') = 0$，整理得 $(e^y + x) y' = -y$，故 $\dfrac{dy}{dx} = -\dfrac{y}{e^y + x}$。

**评注**：隐函数求导的结果中通常仍然含有 $y$——这是正常的，因为隐函数没有显式表达。

:::

:::example 例 2 · 隐函数在给定点的导数值
已知 $y^5 + 2y - x - 3x^7 = 0$，求 $\left. \dfrac{dy}{dx} \right|_{x=0}$。

**思路**：先隐函数求导得 $y'$ 的表达式，再代入点。$x=0$ 时先从原方程解出 $y(0)$。

**解**：两边求导：$5y^4 y' + 2y' - 1 - 21x^6 = 0$，得 $y' = \dfrac{1 + 21x^6}{5y^4 + 2}$。

$x = 0$ 时，原方程 $y^5 + 2y = 0 \Rightarrow y(y^4 + 2) = 0 \Rightarrow y = 0$。故 $y'(0) = \dfrac{1}{2}$。

**评注**：隐函数求导后代入特定点时，需要先从原方程求出该点处的 $y$ 值。

:::

:::example 例 3 · 椭圆的切线方程
求椭圆 $\dfrac{x^2}{16} + \dfrac{y^2}{9} = 1$ 在点 $(2, \frac{3}{2}\sqrt{3})$ 处的切线方程。

**思路**：隐函数求导得斜率，再代入切线公式。

**解**：两边对 $x$ 求导：$\dfrac{x}{8} + \dfrac{2y}{9} \cdot y' = 0 \Rightarrow y' = -\dfrac{9x}{16y}$。

在 $(2, \frac{3}{2}\sqrt{3})$ 处：$k = -\dfrac{9 \cdot 2}{16 \cdot \frac{3}{2}\sqrt{3}} = -\dfrac{18}{24\sqrt{3}} = -\dfrac{\sqrt{3}}{4}$。

切线：$y - \frac{3\sqrt{3}}{2} = -\frac{\sqrt{3}}{4}(x - 2)$，即 $\sqrt{3}x + 4y - 8\sqrt{3} = 0$。

:::

:::example 例 4 · 隐函数的二阶导数
已知 $x - y + \frac{1}{2} \sin y = 0$，求 $\dfrac{d^2 y}{dx^2}$。

**思路**：先求一阶导数 $y'$，再对 $y'$ 求导得 $y''$。注意 $y'$ 的表达式中含有 $y$，求 $y''$ 时需要再用链式法则。

**解**：两边对 $x$ 求导：$1 - y' + \frac{1}{2} \cos y \cdot y' = 0$，解得 $y' = \dfrac{2}{2 - \cos y}$。

再对 $x$ 求导：$y'' = \dfrac{d}{dx} \left( \dfrac{2}{2 - \cos y} \right) = -\dfrac{2}{(2 - \cos y)^2} \cdot (\sin y \cdot y') = -\dfrac{2 \sin y \cdot y'}{(2 - \cos y)^2}$。

代入 $y'$：$y'' = -\dfrac{4 \sin y}{(2 - \cos y)^3}$。

**评注**：隐函数求二阶导的标准流程：(1) 求 $y'$（含 $y$）$\to$ (2) 对 $y'$ 再求导（$y$ 要再乘 $y'$）$\to$ (3) 代入 $y'$ 消去。

:::

#### 对数求导法

**应用场景**：(1) **幂指函数** $f(x) = [\varphi(x)]^{\psi(x)}$，既不是幂函数也不是指数函数；(2) **多项式乘除开方**的复杂表达式。

**核心操作**：两边先取对数，将乘除变为加减、指数变为乘积，再隐函数求导。

:::example 例 5 · 幂指函数的导数
求 $y = x^{\sin x}$（$x > 0$）的导数。

**思路**：幂指函数，底数和指数都含 $x$，先取对数化为乘积。

**解**：两边取对数：$\ln y = \sin x \cdot \ln x$。两边对 $x$ 求导：

$$
\frac{1}{y} \cdot y' = \cos x \cdot \ln x + \frac{\sin x}{x}
$$

$$
y' = y \left( \cos x \ln x + \frac{\sin x}{x} \right) = x^{\sin x} \left( \cos x \ln x + \frac{\sin x}{x} \right)
$$

**评注**：幂指函数的标准处理：(1) 取对数 $\to$ (2) 隐函数求导 $\to$ (3) 乘回 $y$ 表示为 $x$ 的函数。也可以化为 $y = e^{\sin x \ln x}$ 直接用复合函数求导（两种方法等价）。

:::

:::example 例 6 · 对数求导法处理乘除开方
求 $y = \sqrt{\dfrac{(x-1)(x-2)}{(x-3)(x-4)}}$ 的导数。

**思路**：根号内含多项式乘除，直接乘积法则太繁琐。取对数将乘除化为加减、开方化为系数。

**解**：两边取对数：

$$
\ln y = \frac{1}{2} \big[ \ln(x-1) + \ln(x-2) - \ln(x-3) - \ln(x-4) \big]
$$

两边对 $x$ 求导：

$$
\frac{y'}{y} = \frac{1}{2} \left( \frac{1}{x-1} + \frac{1}{x-2} - \frac{1}{x-3} - \frac{1}{x-4} \right)
$$

$$
y' = \frac{y}{2} \left( \frac{1}{x-1} + \frac{1}{x-2} - \frac{1}{x-3} - \frac{1}{x-4} \right)
$$

**评注**：对数求导法将"乘除"变为"加减"，将"乘方开方"变为"系数乘法"，从根本上降低了求导复杂度。

:::

### 参数方程求导

#### 参数方程的一阶导数

若参数方程 $\begin{cases} x = \varphi(t) \\ y = \psi(t) \end{cases}$ 确定 $y$ 与 $x$ 的函数关系，且 $\varphi'(t) \neq 0$，则：

$$
\frac{dy}{dx} = \frac{dy/dt}{dx/dt} = \frac{\psi'(t)}{\varphi'(t)}
$$

#### 参数方程的二阶导数

$$
\frac{d^2 y}{dx^2} = \frac{d\left( \frac{dy}{dx} \right) / dt}{dx/dt} = \frac{\varphi'(t) \psi''(t) - \psi'(t) \varphi''(t)}{[\varphi'(t)]^3}
$$

> **注意**：$\dfrac{d^2 y}{dx^2} \neq \dfrac{\psi''(t)}{\varphi''(t)}$！二阶导是一阶导再对 $x$ 求导，分母是 $dx/dt$（即 $\varphi'(t)$）而不是直接除以 $\varphi''(t)$。最常见的错误就是直接用 $\psi''/\varphi''$。

#### 例题

:::example 例 7 · 椭圆参数方程在定点处的切线
已知椭圆的参数方程 $\begin{cases} x = a \cos t \\ y = b \sin t \end{cases}$，求在 $t = \frac{\pi}{4}$ 处的切线方程。

**思路**：先用参数方程求导公式得 $dy/dx$，代入 $t$ 得斜率，再求切点坐标。

**解**：$\dfrac{dy}{dx} = \dfrac{b \cos t}{-a \sin t} = -\dfrac{b}{a} \cot t$。$t = \frac{\pi}{4}$ 时：$x_0 = \frac{\sqrt{2}}{2}a$，$y_0 = \frac{\sqrt{2}}{2}b$，$k = -\frac{b}{a} \cdot 1 = -\frac{b}{a}$。

切线：$y - \frac{\sqrt{2}}{2}b = -\frac{b}{a}(x - \frac{\sqrt{2}}{2}a)$，化简得 $bx + ay - \sqrt{2}ab = 0$。

:::

:::example 例 8 · 摆线的二阶导数
计算摆线 $\begin{cases} x = a(t - \sin t) \\ y = a(1 - \cos t) \end{cases}$ 所确定的函数的二阶导数。

**思路**：先求一阶导 $dy/dx$，再用参数方程二阶导公式。注意一阶导化简为 $\cot \frac{t}{2}$。

**解**：

$$
\frac{dy}{dx} = \frac{a \sin t}{a(1 - \cos t)} = \frac{\sin t}{1 - \cos t} = \cot \frac{t}{2}
$$

$$
\frac{d^2 y}{dx^2} = \frac{d(\cot \frac{t}{2}) / dt}{dx/dt} = \frac{-\frac{1}{2} \csc^2 \frac{t}{2}}{a(1 - \cos t)} = -\frac{1}{a(1 - \cos t)^2} \quad (t \neq 2n\pi)
$$

**评注**：摆线的二阶导数公式是参数方程二阶导的经典例题。注意最后将结果用 $t$ 表示即可，不需要换回 $x$。

:::

### 相关变化率*

设 $x = x(t)$，$y = y(t)$ 均可导，且 $x$ 与 $y$ 之间存在某种关系 $F(x, y) = 0$。对 $t$ 求导后可得 $\frac{dx}{dt}$ 与 $\frac{dy}{dt}$ 之间的关系，这两个相互依赖的变化率称为**相关变化率**。解题关键是**对关系式两边关于 $t$ 求导**（与隐函数求导类似，只是求导变量换成了 $t$）。

## 函数的微分

导数描述的是函数的变化**率**，微分描述的是函数的变化**量**——当自变量有一个微小增量时，函数值大约增加多少。微分是线性近似的核心工具，也是后续积分学中 $dx$ 记号的源头。

### 微分的定义

#### 定义与记号

设函数 $y = f(x)$ 在某区间内有定义，$x_0$ 及 $x_0 + \Delta x$ 在这区间内。如果函数的增量 $\Delta y = f(x_0 + \Delta x) - f(x_0)$ 可表示为：

$$
\Delta y = A \cdot \Delta x + o(\Delta x)
$$

其中 $A$ 是不依赖于 $\Delta x$ 的常数，那么称 $y = f(x)$ 在点 $x_0$ 是**可微**的，而 $A \cdot \Delta x$ 叫做函数 $y = f(x)$ 在点 $x_0$ 相应于自变量增量 $\Delta x$ 的**微分**，记作 $dy$，即 $dy = A \cdot \Delta x$。

#### 可微与可导的关系

函数 $f(x)$ 在点 $x_0$ 可微的**充要条件**是 $f(x)$ 在点 $x_0$ 可导，且 $dy = f'(x_0) \Delta x$。

通常把自变量 $x$ 的增量 $\Delta x$ 称为自变量的微分，记作 $dx$，即 $dx = \Delta x$。因此：

$$
dy = f'(x) \, dx
$$

从而导数也可记作 $\frac{dy}{dx}$——这就是莱布尼茨记号的由来：导数是微分的**商**（微商）。

#### 微分的几何意义

微分 $dy$ 表示曲线 $y = f(x)$ 在点 $x_0$ 处的**切线**的增量，而 $\Delta y$ 表示曲线的实际增量。当 $\Delta x$ 很小时，$dy \approx \Delta y$（用切线近似曲线）。

> **注意**：$dy$ 和 $\Delta y$ 的区别——$dy = f'(x_0) \Delta x$（线性部分），$\Delta y = f(x_0 + \Delta x) - f(x_0)$（实际增量）。两者的差是 $o(\Delta x)$（高阶无穷小）。

### 微分公式与运算法则

#### 基本微分公式

由 $dy = f'(x) dx$，直接将求导公式乘上 $dx$ 即得微分公式。例如 $d(\sin x) = \cos x \, dx$，$d(e^x) = e^x \, dx$。

#### 微分的四则运算法则

$$
\begin{aligned}
d(u \pm v) &= du \pm dv \\
d(Cu) &= C \, du \\
d(uv) &= v \, du + u \, dv \\
d\left( \frac{u}{v} \right) &= \frac{v \, du - u \, dv}{v^2}
\end{aligned}
$$

#### 微分形式不变性

设 $y = f(u)$ 及 $u = g(x)$ 都可导，则复合函数 $y = f[g(x)]$ 的微分为：

$$
dy = y'_x \, dx = f'(u) g'(x) \, dx = f'(u) \, du
$$

即**无论 $u$ 是自变量还是中间变量，$dy = f'(u) \, du$ 的形式始终不变**。这一性质称为**微分形式不变性**，是一阶微分独有的重要特征（高阶微分不具有此性质）。

#### 例题

:::example 例 1 · 求指定点处的微分
求 $y = x^2$ 在 $x = 1$ 和 $x = 3$ 处的微分。

**解**：$dy = 2x \, dx$。$dy|_{x=1} = 2 \, dx$，$dy|_{x=3} = 6 \, dx$。

**评注**：微分 $dy$ 不仅依赖于 $x$，还依赖于 $dx$，因此不能简单比较不同点处的微分大小。

:::

:::example 例 2 · 复合函数的微分
设 $y = \sin(2x + 1)$，求 $dy$。

**思路**：利用微分形式不变性，先对 $\sin$ 求导再乘上内部的微分。

**解**：$dy = \cos(2x + 1) \, d(2x + 1) = 2 \cos(2x + 1) \, dx$。

**评注**：用微分形式不变性可以"跳步"：先写外层导数，再乘内部的微分，无需将复合过程拆成多步。

:::

### 微分在近似计算中的应用

#### 近似公式

由 $\Delta y \approx dy$ 得：

$$
f(x_0 + \Delta x) \approx f(x_0) + f'(x_0) \Delta x
$$

或 $f(x) \approx f(x_0) + f'(x_0)(x - x_0)$。这本质是用切线（一次函数）近似曲线。

#### 常用近似公式（$|x|$ 较小时）

利用 $f(x) \approx f(0) + f'(0) x$（即麦克劳林一次近似）：

- $(1 + x)^\alpha \approx 1 + \alpha x$
- $\sin x \approx x$
- $\tan x \approx x$
- $e^x \approx 1 + x$
- $\ln(1 + x) \approx x$

:::example 例 3 · 用微分估算球壳体积
有一批半径为 $1\,\text{cm}$ 的球，给该球镀上一层 $0.01\,\text{cm}$ 厚度的铜。求镀每只球需用多少体积的铜？

**思路**：体积增量 $\Delta V \approx dV$。球体积 $V = \frac{4}{3}\pi r^3$，微分 $dV = 4\pi r^2 \, dr$。

**解**：$\Delta V \approx dV = 4\pi r^2 \Delta r = 4\pi \times 1^2 \times 0.01 = 0.04\pi \approx 0.13\,\text{cm}^3$。

**评注**：微分的近似计算思想：将非线性的增量 $\Delta y$ 用线性的 $dy$ 来近似，在 $\Delta x$ 很小时误差可忽略。

:::

## 小结

1. **导数**是差商 $\frac{\Delta y}{\Delta x}$ 的极限，本质是 $x_0$ 处的**瞬时变化率**；定义有增量形式、h-形式与 $x \to x_0$ 形式三种等价写法，选对形式能把繁琐求导化成一次约分。
2. 函数在一点**可导的充要条件**是左导数与右导数都存在且相等；间断点、**角点**、**尖点**、垂直切线是四种不可导情形，$y = |x|$ 在 $x = 0$ 处就是典型的角点。
3. **可导 $\Rightarrow$ 连续，连续 $\nRightarrow$ 可导**——$y = |x|$ 在 $x = 0$ 处连续但不可导；判断分段函数在分段点的可导性，顺序是先验连续性、再比左右导数。
4. 导数的几何意义是**切线斜率**：切线为 $y - y_0 = f'(x_0)(x - x_0)$，法线斜率是它的负倒数；"在某点处的切线"与"过某点的切线"是两类题，后者要先设切点再解。
5. **四则运算法则**中积是"前导后不导 + 前不导后导"，商的分子顺序不能记反；**反函数**求导 $[f^{-1}(x)]' = 1/f'(y)$，求具体点的导数值时要"对号入座"，用 $\varphi'(y_0) = 1/f'(x_0)$ 且 $f(x_0) = y_0$。
6. **链式法则** $\frac{dy}{dx} = \frac{dy}{du} \cdot \frac{du}{dx}$ 是最重要的一条法则：由外向内、逐层求导、层层相乘，最常见的错误是**漏层**。
7. **高阶导数**里 $\sin x$、$\cos x$ 的 $n$ 阶导是循环型的，每求导一次相位前进 $\frac{\pi}{2}$；乘积的高阶导用**莱布尼茨公式**，当其中一个因子是多项式时其低阶导数很快归零，只需算前几项。
8. **隐函数求导**的关键是始终把 $y$ 看作 $x$ 的函数——遇到含 $y$ 的项必须乘 $y'$；求二阶导时 $y'$ 中的 $y$ 还要再乘一次 $y'$；**对数求导法**先取对数把乘除化为加减，专门对付幂指函数与多项式乘除开方。
9. **参数方程**求导一阶是 $\dfrac{dy}{dx} = \dfrac{\psi'(t)}{\varphi'(t)}$，但二阶导**不是** $\dfrac{\psi''(t)}{\varphi''(t)}$，它是一阶导再对 $x$ 求导，分母仍为 $\varphi'(t)$。
10. **可微 $\Leftrightarrow$ 可导**，$dy = f'(x)dx$ 是切线增量而 $\Delta y$ 是曲线的实际增量，两者相差 $o(\Delta x)$；**微分形式不变性**（$dy = f'(u)du$）是一阶微分独有的性质，也是 $f(x_0 + \Delta x) \approx f(x_0) + f'(x_0)\Delta x$ 这类近似计算的依据。
