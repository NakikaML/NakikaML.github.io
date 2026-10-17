---
title: 高等数学-1 函数与极限
description: 从映射与函数出发建立 ε-N 与 ε-δ 两套极限语言，再讲夹逼准则、两个重要极限、等价无穷小替换与闭区间上连续函数的三大定理。
category: 数学
subject: 数学
subfield: 高等数学
topic: 函数与极限
difficulty: 基础
date: "2026-10-17"
tags: [高等数学, 函数, 极限, 收敛数列, 夹逼准则, 等价无穷小, 间断点, 介值定理]
draft: false
featured: false
---

## 映射与函数

微积分的研究对象是**函数**，而函数本质上是一种特殊的**映射**

### 映射

#### 映射的定义

**映射**是集合之间的一种对应关系。设 $X, Y$ 是两个非空集合，如果存在一个法则 $f$，使得对 $X$ 中每个元素 $x$，按法则 $f$，在 $Y$ 中有**唯一确定**的元素 $y$ 与之对应，那么称 $f$ 为从 $X$ 到 $Y$ 的**映射**，记作：

$$
f: X \rightarrow Y
$$

其中 $y$ 称为元素 $x$（在映射 $f$ 下）的**像**，记作 $f(x)$，即 $y = f(x)$；元素 $x$ 称为元素 $y$（在映射 $f$ 下）的一个**原像**。集合 $X$ 称为映射 $f$ 的**定义域**，记作 $D_f = X$；$X$ 中所有元素的像所组成的集合称为映射 $f$ 的**值域**，记作 $R_f$ 或 $f(X)$：

$$
R_f = f(X) = \{ f(x) \mid x \in X \}
$$

> **注意**：值域 $R_f$ 是 $Y$ 的子集，即 $R_f \subset Y$，不一定等于 $Y$。

#### 映射三要素

一个映射由三个要素完全确定：

- **定义域** $D_f = X$：原像所在的集合
- **值域所在集合** $Y$：像所在的"目标"集合（注意：不是值域 $R_f$）
- **对应法则** $f$：使每个 $x$ 对应唯一 $y$ 的规则

#### 满射、单射、双射

根据值域与目标集合的关系以及对应的唯一性，映射可分为三类：

- **满射**：若 $R_f = Y$，即 $Y$ 中任一元素 $y$ 都是 $X$ 中某元素的像，则称 $f$ 为 $X$ 到 $Y$ 上的映射
- **单射**：若对 $X$ 中任意两个不同元素 $x_1 \neq x_2$，它们的像 $f(x_1) \neq f(x_2)$，则称 $f$ 为 $X$ 到 $Y$ 的单射
- **双射（一一映射）**：若 $f$ 既是单射又是满射，则称 $f$ 为双射

#### 逆映射

设 $f$ 是 $X$ 到 $Y$ 的单射，对 $\forall y \in R_f$，有唯一的 $x \in X$ 适合 $f(x) = y$。定义映射 $g: R_f \rightarrow X$ 使 $g(y) = x$，这个映射 $g$ 称为 $f$ 的**逆映射**，记作 $f^{-1}$。其定义域 $D_{f^{-1}} = R_f$，值域 $R_{f^{-1}} = X$。

> **注意**：只有单射才有逆映射。若 $f$ 不是单射，则存在 $x_1 \neq x_2$ 使 $f(x_1) = f(x_2) = y$，此时 $y$ 的原像不唯一，无法定义一个确定的映射。

#### 复合映射

设有两个映射 $g: X \rightarrow Y_1$ 和 $f: Y_2 \rightarrow Z$，其中 $Y_1 \subset Y_2$。则由映射 $g$ 和 $f$ 可以确定一个从 $X$ 到 $Z$ 的对应法则，记为 $f \circ g: X \rightarrow Z$：

$$
(f \circ g)(x) = f[g(x)], \quad x \in X
$$

构成复合映射的条件是：$R_g \subset D_f$，即内层映射的值域必须落在外层映射的定义域内。

### 函数

#### 函数的定义

**函数**是定义在数集上的特殊映射。设数集 $D \subset \mathbb{R}$，则称映射 $f: D \rightarrow \mathbb{R}$ 为定义在 $D$ 上的**函数**，记作 $y = f(x)$，$x \in D$。其中 $x$ 称为**自变量**，$y$ 称为**因变量**。

#### 构成函数的要素

函数由两个要素完全确定：**定义域** $D_f$ 和**对应法则** $f$。两个函数相等，当且仅当它们的定义域和对应法则完全相同。

#### 两个特殊函数

**符号函数**：

$$
y = \operatorname{sgn} x = \begin{cases} -1, & x < 0 \\ 0, & x = 0 \\ 1, & x > 0 \end{cases}
$$

推论：$x = \operatorname{sgn} x \cdot |x|$。符号函数是分段函数的典型代表。

![符号函数的图像：x 为负时取 -1，为零时取 0，为正时取 1](/notes-assets/hm1-01-symbol-function-graph.jpg)

**取整函数**：$[x]$ 表示不超过 $x$ 的最大整数。$\lceil x \rceil$ 为向上取整，$\lfloor x \rfloor$ 为向下取整。

![取整函数的图像：阶梯状，每经过一个整数跳一级](/notes-assets/hm1-02-floor-function-graph.jpg)

#### 函数的性质

- **有界性**：设 $f(x)$ 的定义域为 $D$，数集 $X \subset D$。若 $\exists M > 0$，$\forall x \in X$，都有 $|f(x)| \leq M$，则称 $f(x)$ 在 $X$ 上**有界**；否则称**无界**。
  - 等价刻画：$f(x)$ 在 $X$ 上有界 $\Leftrightarrow$ $f(x)$ 在 $X$ 上既有上界又有下界

- **单调性**：设区间 $I \subset D$，对 $\forall x_1, x_2 \in I$：
  - 当 $x_1 < x_2$ 时恒有 $f(x_1) < f(x_2)$，则称 $f(x)$ 在 $I$ 上**单调递增**
  - 当 $x_1 < x_2$ 时恒有 $f(x_1) > f(x_2)$，则称 $f(x)$ 在 $I$ 上**单调递减**

- **奇偶性**：设 $f(x)$ 的定义域 $D$ 关于原点对称：
  - 若 $\forall x \in D$ 恒有 $f(-x) = f(x)$，则称 $f(x)$ 为**偶函数**（图像关于 $y$ 轴对称）
  - 若 $\forall x \in D$ 恒有 $f(-x) = -f(x)$，则称 $f(x)$ 为**奇函数**（图像关于原点对称）

- **周期性**：若 $\exists l \in (0, +\infty)$，使得 $\forall x \in D$ 有 $(x + l) \in D$ 且 $f(x + l) = f(x)$ 恒成立，则称 $f(x)$ 为**周期函数**，$l$ 称为 $f(x)$ 的**周期**，其中最小的正数 $l$ 称为**最小正周期**。

:::note 并非每个周期函数都有最小正周期
例如狄利克雷函数：

$$
D(x) = \begin{cases} 1, & x \in \mathbb{Q} \\ 0, & x \in \mathbb{Q}^C \end{cases}
$$

任何正有理数都是它的周期，但不存在最小的正有理数，因此它没有最小正周期。

:::

#### 反函数

设函数 $f: D \rightarrow f(D)$ 是单射，则它存在逆映射 $f^{-1}: f(D) \rightarrow D$，称此映射 $f^{-1}$ 为函数 $f$ 的**反函数**。对 $\forall y \in f(D)$，存在唯一的 $x \in D$ 使得 $f(x) = y$，则 $f^{-1}(y) = x$。

若 $f$ 是定义在 $D$ 上的单调函数，则 $f: D \rightarrow f(D)$ 是单射，于是 $f$ 的反函数必定存在，且 $f^{-1}$ 也是 $f(D)$ 上的单调函数。$f(x)$ 和 $f^{-1}(x)$ 的图像关于直线 $y = x$ 对称。

![函数与反函数的图像关于直线 y = x 对称](/notes-assets/hm1-03-inverse-function-graph.jpg)

#### 复合函数

设函数 $y = f(u)$ 的定义域为 $D_f$，函数 $u = g(x)$ 的定义域为 $D_g$，且其值域 $R_g \subset D_f$，则 $y = f[g(x)]$（$x \in D_g$）称为由 $u = g(x)$ 与 $y = f(u)$ 构成的**复合函数**，其中 $u$ 称为**中间变量**。

#### 函数的四则运算

设 $f(x)$、$g(x)$ 的定义域分别为 $D_f$、$D_g$，$D = D_f \cap D_g \neq \varnothing$，则：

$$
\begin{aligned}
(f \pm g)(x) &= f(x) \pm g(x), \quad x \in D \\
(f \cdot g)(x) &= f(x) \cdot g(x), \quad x \in D \\
\left( \frac{f}{g} \right)(x) &= \frac{f(x)}{g(x)}, \quad x \in D \setminus \{ x \mid g(x) = 0 \}
\end{aligned}
$$

一个重要结论：设 $f(x)$ 的定义域为 $(-l, l)$，则必存在 $(-l, l)$ 上的偶函数 $g(x)$ 及奇函数 $h(x)$，使得 $f(x) = g(x) + h(x)$。即**任何定义在对称区间上的函数都可以分解为一个偶函数与一个奇函数之和**。

#### 初等函数

以下五类函数统称为**基本初等函数**：

- **幂函数**：$y = x^\mu$（$\mu \in \mathbb{R}$ 是常数）
- **指数函数**：$y = a^x$（$a > 0$ 且 $a \neq 1$）
- **对数函数**：$y = \log_a x$（$a > 0$ 且 $a \neq 1$）
- **三角函数**：$y = \sin x$，$y = \cos x$，$y = \tan x$，$y = \cot x$，$y = \sec x$，$y = \csc x$
- **反三角函数**：
  - $y = \arcsin x$：定义域 $[-1, 1]$，值域 $[-\frac{\pi}{2}, \frac{\pi}{2}]$，奇函数
  - $y = \arccos x$：定义域 $[-1, 1]$，值域 $[0, \pi]$，非奇非偶
  - $y = \arctan x$：定义域 $(-\infty, +\infty)$，值域 $(-\frac{\pi}{2}, \frac{\pi}{2})$，奇函数
  - $y = \operatorname{arccot} x$：定义域 $(-\infty, +\infty)$，值域 $(0, \pi)$，非奇非偶

![余切、正割、余割三个函数的图像](/notes-assets/hm1-04-cot-sec-csc-graphs.jpg)

![四个反三角函数的图像](/notes-assets/hm1-05-inverse-trig-function-graphs.jpg)

由**常数**和**基本初等函数**经过有限次四则运算和有限次函数复合步骤所构成、并可用一个式子表示的函数，称为**初等函数**。

**拓展——双曲函数**：

- 双曲正弦：$\operatorname{sh} x = \sinh x = \dfrac{e^x - e^{-x}}{2}$
- 双曲余弦：$\operatorname{ch} x = \cosh x = \dfrac{e^x + e^{-x}}{2}$
- 双曲正切：$\operatorname{th} x = \tanh x = \dfrac{\sinh x}{\cosh x} = \dfrac{e^x - e^{-x}}{e^x + e^{-x}}$

:::example 例 1 · 复合函数求定义域
已知 $f(x) = \arccos(2x + 1) + \log_2(3x + 2)$，求定义域 $D_f$。

**思路**：求初等函数定义域，列出每个组成部分的约束条件（反三角函数的定义域范围、对数函数的真数大于零），取交集。

**解**：

$$
\begin{cases} -1 \leq 2x + 1 \leq 1 \\ 3x + 2 > 0 \end{cases} \Rightarrow \begin{cases} -1 \leq x \leq 0 \\ x > -\frac{2}{3} \end{cases} \Rightarrow D_f = \left( -\frac{2}{3}, 0 \right]
$$

**评注**：求定义域的核心是"列约束取交集"。反三角函数 $\arccos u$ 要求 $|u| \leq 1$，对数函数 $\log_a u$ 要求 $u > 0$——这两条是最常出现的约束。

:::

:::example 例 2 · 分段函数的复合 f[g(x)] 与 g[f(x)]
已知 $f(x) = \begin{cases} -1, & x < 0 \\ 1, & x \geq 0 \end{cases}$，$g(x) = 2x - 1$，求 $f[g(x)]$ 和 $g[f(x)]$。

**思路**：求分段函数的复合，关键是**以内层函数的取值范围为分段依据**，代入外层函数的对应表达式。

**解**：

对于 $f[g(x)]$，令 $u = g(x) = 2x - 1$。$f(u)$ 以 $u = 0$ 为分界：

$$
\begin{aligned}
u < 0 &\Rightarrow 2x - 1 < 0 \Rightarrow x < \frac{1}{2}, \quad f(u) = -1 \\
u \geq 0 &\Rightarrow 2x - 1 \geq 0 \Rightarrow x \geq \frac{1}{2}, \quad f(u) = 1
\end{aligned}
$$

$$
\Rightarrow f[g(x)] = \begin{cases} -1, & x < \frac{1}{2} \\ 1, & x \geq \frac{1}{2} \end{cases}
$$

对于 $g[f(x)]$，$f(x)$ 的值只有 $-1$ 和 $1$ 两种：

$$
g[f(x)] = \begin{cases} g(-1) = -3, & x < 0 \\ g(1) = 1, & x \geq 0 \end{cases}
$$

**评注**：注意 $f[g(x)]$ 和 $g[f(x)]$ 一般不同——复合顺序决定结果。分段点需要根据内层函数的输出范围重新确定。

:::

:::example 例 3 · 判断函数在给定区间上是否有界
函数 $f(x) = \dfrac{1}{x - 2}$ 分别在 $x \in (2, 3)$ 与 $x \in (3, +\infty)$ 内是否有界？

![例 3 中 f(x) = 1/(x-2) 的图像](/notes-assets/hm1-06-boundedness-example-graph.jpg)

**思路**：判断函数在区间上的有界性，就是看函数值是否有上界又有下界——"有界"要求两头都被挡住。

**解**：

- 在 $(2, 3)$ 上：当 $x \to 2^+$ 时 $f(x) \to +\infty$，函数无上界。虽有下界 $1$（当 $x \to 3^-$ 时 $f(x) \to 1$），但一侧无界即无界 $\Rightarrow$ **无界**。
- 在 $(3, +\infty)$ 上：$x > 3$ 时 $x - 2 > 1$，于是 $0 < f(x) < 1$；且 $x \to 3^+$ 时 $f(x) \to 1$，$x \to +\infty$ 时 $f(x) \to 0^+$。所以有上界 $1$、有下界 $0$ $\Rightarrow$ **有界**。

**评注**：函数在某区间上"有界"必须**同时**有上界和下界。即使一侧有界而另一侧趋于无穷，也属无界。

:::

## 数列的极限

### 数列极限的定义

#### 数列的概念

如果按照某一法则，对 $\forall n \in \mathbb{N}_+$，对应着一个确定的实数 $x_n$，这些实数 $x_n$ 按照下标 $n$ 从小到大排列得到一个序列 $x_1, x_2, x_3, \dots, x_n, \dots$，就叫做**数列**，简记为 $\{ x_n \}$。数列中的每一个数叫做数列的**项**，第 $n$ 项 $x_n$ 叫做数列的**通项**。

#### 数列极限的 $\varepsilon$-$N$ 定义

直观上，"$\{x_n\}$ 的极限是 $a$"意味着：当 $n$ 无限增大时，$x_n$ 无限接近 $a$。但"无限接近"不是严格的数学语言。$\varepsilon$-$N$ 定义将这一直观精确化：

> 设 $\{ x_n \}$ 为一数列，如果存在常数 $a$，对于**任意给定的正数 $\varepsilon$**（不论它多么小），总存在正整数 $N$，使得当 $n > N$ 时，不等式 $|x_n - a| < \varepsilon$ 都成立，那么就称常数 $a$ 是数列 $\{ x_n \}$ 的**极限**，或者称数列 $\{ x_n \}$ **收敛**于 $a$，记为 $\lim\limits_{n \to \infty} x_n = a$ 或 $x_n \to a \, (n \to \infty)$。

用 $\varepsilon$-$N$ 语言简写为：

$$
\lim_{n \to \infty} x_n = a \Leftrightarrow \forall \varepsilon > 0, \, \exists N \in \mathbb{N}_+, \, \text{当} \, n > N \, \text{时}, \, |x_n - a| < \varepsilon
$$

如果不存在这样的常数 $a$，就说数列 $\{ x_n \}$ 没有极限，或者说 $\{ x_n \}$ 是**发散**的。

> **注意**：定义中 $\varepsilon$ 的**任意性**是关键——无论你要求多么接近（$\varepsilon$ 多小），我总能找到一个 $N$，使第 $N$ 项之后的所有项都满足这个接近程度。$\varepsilon$ 必须先给定，$N$ 依赖于 $\varepsilon$——顺序不能颠倒。

#### 用定义证明极限

用 $\varepsilon$-$N$ 定义证明极限的核心思路是**倒推法**：从希望成立的不等式 $|x_n - a| < \varepsilon$ 出发，解出 $n > g(\varepsilon)$，然后取 $N = [g(\varepsilon)] + 1$（取整加一确保 $N \in \mathbb{N}_+$）。

:::example 例 1 · 用 ε-N 定义证明 1/n 的极限为 0
证明 $\lim\limits_{n \to \infty} \dfrac{1}{n} = 0$。

**思路**：这是最基础的 $\varepsilon$-$N$ 证明。从 $|\frac{1}{n} - 0| < \varepsilon$ 直接解出 $n > \frac{1}{\varepsilon}$，取 $N = [\frac{1}{\varepsilon}] + 1$ 即可。

**证明**：$\forall \varepsilon > 0$，要使 $|\frac{1}{n} - 0| < \varepsilon$，即 $\frac{1}{n} < \varepsilon$，只需 $n > \frac{1}{\varepsilon}$。取 $N = \left[ \frac{1}{\varepsilon} \right] + 1$，则当 $n > N$ 时，必有 $|\frac{1}{n} - 0| < \varepsilon$。由定义，$\lim\limits_{n \to \infty} \frac{1}{n} = 0$。

**评注**：加 $1$ 是为了防止 $[\frac{1}{\varepsilon}] = 0$（当 $\varepsilon > 1$ 时）导致 $N \notin \mathbb{N}_+$。定义证明中 $N$ 的取法不唯一，只要逻辑正确即可。

:::

:::example 例 2 · 用 ε-N 定义证明等比数列的极限为 0
设 $|q| < 1$，证明 $\lim\limits_{n \to \infty} q^{n-1} = 0$。

**思路**：与例 1 不同，这里需要用到对数来"提取"指数。从 $|q|^{n-1} < \varepsilon$ 两边取对数得 $(n-1)\ln|q| < \ln\varepsilon$。注意 $|q| < 1$ 时 $\ln|q| < 0$，不等式方向会反转。

**证明**：$\forall \varepsilon > 0$（不妨设 $\varepsilon < 1$），要使 $|q^{n-1} - 0| = |q|^{n-1} < \varepsilon$，两边取自然对数：

$$
(n-1) \ln |q| < \ln \varepsilon
$$

因为 $|q| < 1$ 时 $\ln|q| < 0$，不等式方向反转：

$$
n - 1 > \frac{\ln \varepsilon}{\ln |q|} \quad \Rightarrow \quad n > \frac{\ln \varepsilon}{\ln |q|} + 1
$$

取 $N = \left[ \frac{\ln \varepsilon}{\ln |q|} + 1 \right] + 1$，则当 $n > N$ 时，$|q^{n-1} - 0| < \varepsilon$。故 $\lim\limits_{n \to \infty} q^{n-1} = 0$。

**评注**：当不等式两边取对数时，务必注意对数的正负——$\ln|q| < 0$ 导致不等号反转，这是常见易错点。

:::

### 收敛数列的性质

#### 唯一性

若 $\{ x_n \}$ 收敛，那么它的极限唯一。这保证了极限定义的良定性——一个数列不可能同时收敛到两个不同的值。

#### 有界性

若 $\{ x_n \}$ 收敛，那么 $\{ x_n \}$ 一定有界。即存在 $M > 0$，对一切 $x_n$ 有 $|x_n| \leq M$。

> **注意**：有界不一定收敛。例如 $x_n = (-1)^{n+1}$，它有界（$|x_n| \leq 1$），但极限不存在（在 $-1$ 和 $1$ 之间振荡）。

#### 保号性

若 $\lim\limits_{n \to \infty} x_n = a$，且 $a > 0$（或 $a < 0$），那么 $\exists N \in \mathbb{N}_+$，当 $n > N$ 时，都有 $x_n > 0$（或 $x_n < 0$）。

推论：若 $\{ x_n \}$ 从某项起有 $x_n \geq 0$（或 $x_n \leq 0$），且 $\lim\limits_{n \to \infty} x_n = a$，那么 $a \geq 0$（或 $a \leq 0$）。注意这里只能是 $\geq$ 而不能是 $>$，因为极限可能刚好等于 $0$。

#### 子数列关系

在数列 $\{ x_n \}$ 中任意抽取无限多项并保持先后次序所得到的数列，称为原数列 $\{ x_n \}$ 的**子数列**（或子列）。

若 $\{ x_n \}$ 收敛于 $a$，那么它的**任一子数列也收敛，且极限也是 $a$**。

推论：

- 若 $\{ x_n \}$ 有两个子数列收敛于不同的极限，则 $\{ x_n \}$ 发散（例如 $x_n = (-1)^{n+1}$ 的奇子列极限为 $1$，偶子列极限为 $-1$）
- $\lim\limits_{n \to \infty} x_n = a \Leftrightarrow \lim\limits_{n \to \infty} x_{2n} = \lim\limits_{n \to \infty} x_{2n+1} = a$

## 函数的极限

数列极限只描述了自变量 $n$ 离散趋于无穷的情况，但实际应用中绝大多数函数的自变量是连续变化的——时间、距离、温度……都连续变化。函数极限将极限概念从离散推向连续，覆盖了 $x \to x_0$（趋于有限点）和 $x \to \infty$（趋于无穷大）两种情形。两者在逻辑结构上完全一致（$\varepsilon$-$N$ 对应 $\varepsilon$-$\delta$）。

### 函数极限的定义

#### 邻域的概念

描述"$x$ 接近 $x_0$"需要一个精确的工具——邻域：

- **邻域**：以 $x_0$ 为中心的任何开区间，记作 $U(x_0)$
- **$\delta$ 邻域**：$U(x_0, \delta) = \{ x \mid |x - x_0| < \delta \}$，其中 $\delta$ 称为邻域半径
- **去心邻域**：在 $U(x_0)$ 中去掉中心 $x_0$ 后，记作 $\overset{\circ}{U}(x_0)$
- **去心 $\delta$ 邻域**：$\overset{\circ}{U}(x_0, \delta) = \{ x \mid 0 < |x - x_0| < \delta \}$

函数极限使用**去心**邻域，因为我们在意的是 $x$ 趋近于 $x_0$ 时的变化趋势，与 $f(x)$ 在 $x_0$ 处是否有定义、取什么值无关。

#### 函数极限的 $\varepsilon$-$\delta$ 定义

设函数 $f(x)$ 在点 $x_0$ 的某一去心邻域内有定义。如果存在常数 $A$，对于 $\forall \varepsilon > 0$（不论它多么小），总 $\exists \delta > 0$，使得当 $0 < |x - x_0| < \delta$ 时，对应的 $f(x)$ 都满足 $|f(x) - A| < \varepsilon$，那么常数 $A$ 就叫做函数 $f(x)$ 当 $x \to x_0$ 时的**极限**，记作 $\lim\limits_{x \to x_0} f(x) = A$。

用 $\varepsilon$-$\delta$ 语言简写为：

$$
\lim_{x \to x_0} f(x) = A \Leftrightarrow \forall \varepsilon > 0, \, \exists \delta > 0, \, 0 < |x - x_0| < \delta \Rightarrow |f(x) - A| < \varepsilon
$$

> **注意**：与数列极限的 $\varepsilon$-$N$ 语言对比——数列中用 $N$ 控制 $n$（离散），函数中用 $\delta$ 控制 $x$（连续）。两者的逻辑结构完全相同，只是用 $\delta$ 替换了 $N$，用 $0 < |x - x_0| < \delta$ 替换了 $n > N$。

:::example 例 1 · 用 ε-δ 定义证明一次函数的极限
证明 $\lim\limits_{x \to 1} (2x - 1) = 1$。

**思路**：将 $|f(x) - A| = |(2x - 1) - 1| = 2|x - 1|$ 与 $\varepsilon$ 建立联系，令 $2|x - 1| < \varepsilon$，解出 $|x - 1| < \frac{\varepsilon}{2}$，取 $\delta = \frac{\varepsilon}{2}$。

**证明**：$\forall \varepsilon > 0$，取 $\delta = \frac{\varepsilon}{2}$。当 $0 < |x - 1| < \delta$ 时：

$$
|(2x - 1) - 1| = |2x - 2| = 2|x - 1| < 2 \cdot \frac{\varepsilon}{2} = \varepsilon
$$

由定义，$\lim\limits_{x \to 1} (2x - 1) = 1$。

**评注**：这是最基础的 $\varepsilon$-$\delta$ 证明。"找 $\delta$"的过程本质是**从 $|f(x) - A|$ 中提取 $|x - x_0|$ 的因子**。

:::

:::example 例 2 · 用 ε-δ 定义证明分式在可去点处的极限
证明 $\lim\limits_{x \to 1} \dfrac{x^2 - 1}{x - 1} = 2$。

**思路**：注意 $x \to 1$ 时分子分母都趋于 $0$，不能直接代入。但 $x \neq 1$ 时可以先约分：$\frac{(x-1)(x+1)}{x-1} = x + 1$。约分后的函数在 $x = 1$ 的去心邻域内等于 $x + 1$。

**证明**：$\forall \varepsilon > 0$，取 $\delta = \varepsilon$。当 $0 < |x - 1| < \delta$ 时（此时 $x \neq 1$）：

$$
\left| \frac{x^2 - 1}{x - 1} - 2 \right| = \left| \frac{(x-1)(x+1)}{x-1} - 2 \right| = |x + 1 - 2| = |x - 1| < \varepsilon
$$

由定义，$\lim\limits_{x \to 1} \frac{x^2 - 1}{x - 1} = 2$。

**评注**：函数在 $x = 1$ 处无定义（分母为零），但极限仍存在——这正体现了"去心邻域"的意义：极限只关心 $x$ 趋近但**不等于** $x_0$ 时的行为。

:::

#### 单侧极限

有时函数在 $x_0$ 两侧的行为不同，需要分别考虑**左极限**和**右极限**：

- **左极限**：$\lim\limits_{x \to x_0^-} f(x) = A \Leftrightarrow \forall \varepsilon > 0, \exists \delta > 0$，当 $x_0 - \delta < x < x_0$ 时，$|f(x) - A| < \varepsilon$
- **右极限**：$\lim\limits_{x \to x_0^+} f(x) = A \Leftrightarrow \forall \varepsilon > 0, \exists \delta > 0$，当 $x_0 < x < x_0 + \delta$ 时，$|f(x) - A| < \varepsilon$

左极限与右极限统称为**单侧极限**。

#### 函数极限存在的充要条件

函数 $f(x)$ 当 $x \to x_0$ 时极限存在的**充要条件**是：左极限和右极限各自存在且相等。

$$
\lim_{x \to x_0} f(x) = A \Leftrightarrow \lim_{x \to x_0^-} f(x) = \lim_{x \to x_0^+} f(x) = A
$$

这一条件常用于判断分段函数在分段点处极限的存在性。

:::example 例 3 · 用左右极限证明分段点处极限不存在
$f(x) = \begin{cases} x - 1, & x < 0 \\ 0, & x = 0 \\ x + 1, & x > 0 \end{cases}$，证明当 $x \to 0$ 时 $f(x)$ 的极限不存在。

**思路**：分别求出左右极限，若不等则极限不存在。左极限用 $x < 0$ 段的表达式，右极限用 $x > 0$ 段的表达式。

**证明**：

$$
\lim_{x \to 0^-} f(x) = \lim_{x \to 0^-} (x - 1) = -1, \quad \lim_{x \to 0^+} f(x) = \lim_{x \to 0^+} (x + 1) = 1
$$

由于 $\lim\limits_{x \to 0^-} f(x) \neq \lim\limits_{x \to 0^+} f(x)$，由极限存在的充要条件，$\lim\limits_{x \to 0} f(x)$ 不存在。

**评注**：分段函数在分段点处的极限，必须分别计算左右极限。注意 $f(0) = 0$ 与极限值无关。

:::

#### 自变量趋于无穷时的极限（$\varepsilon$-$X$ 定义）

设函数 $f(x)$ 当 $|x|$ 大于某一正数时有定义。如果存在常数 $A$，对于 $\forall \varepsilon > 0$，总 $\exists X > 0$，使得当 $|x| > X$ 时，都有 $|f(x) - A| < \varepsilon$，那么称 $A$ 为函数 $f(x)$ 当 $x \to \infty$ 时的极限，记作 $\lim\limits_{x \to \infty} f(x) = A$。

用 $\varepsilon$-$X$ 语言简写：

$$
\lim_{x \to \infty} f(x) = A \Leftrightarrow \forall \varepsilon > 0, \, \exists X > 0, \, |x| > X \Rightarrow |f(x) - A| < \varepsilon
$$

同理，$x \to +\infty$ 时的极限用 $x > X$ 控制；$x \to -\infty$ 时的极限用 $x < -X$ 控制。极限 $\lim\limits_{x \to \infty} f(x)$ 存在的充要条件是 $\lim\limits_{x \to +\infty} f(x) = \lim\limits_{x \to -\infty} f(x) = A$。

:::example 例 4 · 用 ε-X 定义证明 1/x 趋于 0
证明 $\lim\limits_{x \to \infty} \dfrac{1}{x} = 0$。

**思路**：$|\frac{1}{x} - 0| = \frac{1}{|x|} < \varepsilon \Rightarrow |x| > \frac{1}{\varepsilon}$，取 $X = \frac{1}{\varepsilon}$。

**证明**：$\forall \varepsilon > 0$，取 $X = \frac{1}{\varepsilon}$。当 $|x| > X$ 时：

$$
\left| \frac{1}{x} - 0 \right| = \frac{1}{|x|} < \frac{1}{X} = \varepsilon
$$

由定义，$\lim\limits_{x \to \infty} \frac{1}{x} = 0$。

:::

#### 三种极限定义的对比

| 类型 | 语言 | 自变量的控制 | 接近的刻画 |
| :--- | :--- | :--- | :--- |
| 数列极限 | $\varepsilon$-$N$ | $n > N$ | $n$ 充分大 |
| 函数极限（$x \to x_0$） | $\varepsilon$-$\delta$ | $0 < \vert x - x_0 \vert < \delta$ | $x$ 充分接近 $x_0$ |
| 函数极限（$x \to \infty$） | $\varepsilon$-$X$ | $\vert x \vert > X$ | $x$ 充分大 |

三种定义的逻辑结构完全一致：$\forall \varepsilon > 0, \exists \text{控制量}, \text{条件} \Rightarrow |f - A| < \varepsilon$。

### 函数极限的性质

以下性质以 $x \to x_0$ 情形为主，其他情形完全类似。

#### 唯一性

如果 $\lim\limits_{x \to x_0} f(x)$ 存在，那么该极限唯一。

#### 局部有界性

如果 $\lim\limits_{x \to x_0} f(x) = A$，那么存在常数 $M > 0$ 和 $\delta > 0$，使得当 $0 < |x - x_0| < \delta$ 时，有 $|f(x)| \leq M$。这里"局部"意味着有界性只在 $x_0$ 的某个去心邻域内成立，而非整个定义域上。

#### 局部保号性

如果 $\lim\limits_{x \to x_0} f(x) = A$ 且 $A > 0$（或 $A < 0$），那么存在 $\delta > 0$，使得当 $0 < |x - x_0| < \delta$ 时，有 $f(x) > 0$（或 $f(x) < 0$）。

推论：若 $\lim\limits_{x \to x_0} f(x) = A \neq 0$，则存在 $x_0$ 的某一去心邻域 $\overset{\circ}{U}(x_0)$，当 $x \in \overset{\circ}{U}(x_0)$ 时，有 $|f(x)| > \frac{|A|}{2}$。

#### 函数极限与数列极限的关系（海涅定理）

如果 $\lim\limits_{x \to x_0} f(x)$ 存在，$\{ x_n \}$ 为 $f(x)$ 定义域内任一收敛于 $x_0$ 的数列，且满足 $x_n \neq x_0$（$n \in \mathbb{N}_+$），那么相应的函数值数列 $\{ f(x_n) \}$ 必收敛，且：

$$
\lim_{n \to \infty} f(x_n) = \lim_{x \to x_0} f(x)
$$

这一定理将函数极限与数列极限联系起来，是后续诸多证明的重要工具。

## 无穷小与无穷大

无穷小和无穷大不是具体的数，而是描述函数在某一变化过程中变化趋势的**语言工具**

### 无穷小

#### 无穷小的定义

如果函数 $f(x)$ 当 $x \to x_0$（或 $x \to \infty$）时的极限为 $0$，那么称函数 $f(x)$ 为当 $x \to x_0$（或 $x \to \infty$）时的**无穷小**。特别地，以零为极限的数列 $\{ a_n \}$ 称为 $n \to \infty$ 时的无穷小。

#### 无穷小与极限的关系

在自变量的同一变化过程中，函数 $f(x)$ 有极限 $A$ 的**充要条件**是 $f(x) = A + \alpha$，其中 $\alpha$ 是无穷小。即：

$$
\lim f(x) = A \Leftrightarrow f(x) = A + \alpha, \quad \alpha \to 0
$$

这个关系非常重要：它告诉我们，有极限的函数可以表示为"常数 $+$ 无穷小"的形式，为极限运算提供了理论基础。

### 无穷大

#### 无穷大的定义

设函数 $f(x)$ 在 $x_0$ 的某一去心邻域内有定义（或 $|x|$ 大于某一正数时有定义）。如果对于 $\forall M > 0$（不论它多么大），总 $\exists \delta > 0$（或 $\exists X > 0$），只要 $x$ 满足 $0 < |x - x_0| < \delta$（或 $|x| > X$），就有 $|f(x)| > M$，那么称 $f(x)$ 是当 $x \to x_0$（或 $x \to \infty$）时的**无穷大**，记作 $\lim f(x) = \infty$。

#### 无穷大与无穷小的关系

在自变量的同一变化过程中：

- 如果 $f(x)$ 为无穷大，那么 $\frac{1}{f(x)}$ 为无穷小
- 如果 $f(x)$ 为无穷小且 $f(x) \neq 0$，那么 $\frac{1}{f(x)}$ 为无穷大

这就是"无穷大与无穷小互为倒数"的根本原因。

### 无穷小与无穷大的运算

设 $\alpha, \beta, \gamma$ 均为无穷小量，按以下规则运算：

| 运算 | 结果 | 说明 |
| :--- | :--- | :--- |
| $\alpha \pm \beta$ | $\gamma$（无穷小） | 有限个无穷小的和仍为无穷小 |
| $\alpha \cdot \beta$ | $\gamma$（无穷小） | 有限个无穷小的积仍为无穷小 |
| $\frac{\alpha}{\beta}$ | 不一定 | 需要进一步比较 |
| $\infty \pm \infty$ | 不存在 | 不定式 |
| $\infty \cdot \infty$ | $\infty$ | |
| $\pm\infty + (\pm\infty)$ | $\pm\infty$ | 同号无穷大相加 |
| $\pm\infty - (\mp\infty)$ | 不存在 | 异号无穷大相减 |

> **注意**：无穷大不是具体的数，不能按普通算术运算处理。$\infty \pm \infty$、$\frac{\infty}{\infty}$ 等称为**不定式**，需要借助极限方法（如抓大头、等价无穷小替换等）来求解。

:::example 例 1 · 无界但非无穷大的反例
函数 $y = x \cos x$ 在 $(-\infty, +\infty)$ 内是否无界？当 $x \to +\infty$ 时，$y$ 是否为无穷大？

![y = x·cos x 的图像：振幅随 |x| 增大而增大，在正负之间无限振荡](/notes-assets/hm1-07-unbounded-not-infinite.jpg)

**思路**：区分"无界"和"无穷大"——无界意味着函数值可以任意大；无穷大意味着 $x$ 趋于某值时**持续**趋于无穷。函数在趋于无穷和趋于零之间无限振荡，则无界但非无穷大。

**解**：由图像可知，$y = x \cos x$ 的值可以取到任意大的正数（当 $\cos x = 1$ 时 $y = x$），也可以取到任意小的负数（当 $\cos x = -1$ 时 $y = -x$），故函数在 $(-\infty, +\infty)$ 内**无界**。但当 $x \to +\infty$ 时，函数在正值和负值之间无限次振荡，$\lim\limits_{x \to +\infty} x \cos x$ 不存在（不是无穷大）。

**评注**：这是"无界 $\nRightarrow$ 无穷大"的经典反例。无穷大要求 $\forall M > 0$，存在某个阶段之后**所有**函数值都大于 $M$；而无界只要求函数值**能**任意大。

:::

:::example 例 2 · 无穷大参与四则运算的结果
若 $\lim\limits_{x \to \infty} f(x) = \infty$，$\lim\limits_{x \to \infty} g(x) = \infty$，求以下极限（若无结果，指明）。

**思路**：$\infty \pm \infty$ 是不定式；常数乘以无穷大仍是无穷大。

**解**：

- $\lim\limits_{x \to \infty} [f(x) \pm g(x)]$ —— **无结果**（$\infty \pm \infty$ 为不定式）
- $\lim\limits_{x \to \infty} k f(x) = \infty$（$k \neq 0$ 为常数）

**评注**：判断不定式是极限计算的第一步。$\infty \pm \infty$、$\frac{\infty}{\infty}$、$\frac{0}{0}$、$0 \cdot \infty$、$1^\infty$ 等都是不定式。

:::

## 极限运算法则

### 无穷小的运算性质

#### 无穷小的和

两个无穷小的和仍是无穷小。

推论：有限个无穷小的和也是无穷小。

:::note 无限个无穷小的和不一定是无穷小
例如：

$$
\lim_{n \to \infty} \left( \frac{1}{n} + \frac{1}{n} + \cdots + \frac{1}{n} \right) \quad (n \text{ 个 } \frac{1}{n}) = \lim_{n \to \infty} n \cdot \frac{1}{n} = 1
$$

每个 $\frac{1}{n}$ 都是无穷小，但无限个加起来却是 $1$

:::

#### 有界函数与无穷小的积

有界函数与无穷小的乘积仍是无穷小。

推论：

- 常数与无穷小的乘积是无穷小
- 有限个无穷小的乘积是无穷小

> **注意**：同样，**无限个**无穷小的乘积不一定是无穷小。

### 极限的四则运算法则

#### 函数极限的四则运算

如果 $\lim f(x) = A$，$\lim g(x) = B$，那么：

$$
\begin{aligned}
\lim [f(x) \pm g(x)] &= A \pm B \\
\lim [f(x) \cdot g(x)] &= A \cdot B \\
\lim \frac{f(x)}{g(x)} &= \frac{A}{B} \quad (B \neq 0) \\
\lim [c f(x)] &= c \cdot A \\
\lim [f(x)]^n &= A^n
\end{aligned}
$$

#### 数列极限的四则运算

设有数列 $\{ x_n \}$ 和 $\{ y_n \}$，若 $\lim\limits_{n \to \infty} x_n = A$，$\lim\limits_{n \to \infty} y_n = B$，则上述四则运算法则同样成立。

#### 函数值大小与极限大小的关系

如果 $\varphi(x) \geq \psi(x)$，而 $\lim \varphi(x) = A$，$\lim \psi(x) = B$，则 $A \geq B$。注意：即使严格不等式 $\varphi(x) > \psi(x)$，极限仍可能是 $A = B$。

### 复合函数的极限运算

#### 复合函数的极限运算法则

设函数 $y = f[g(x)]$ 由 $u = g(x)$ 与 $y = f(u)$ 复合而成，$f[g(x)]$ 在点 $x_0$ 的某去心邻域内有定义。若 $\lim\limits_{x \to x_0} g(x) = u_0$，$\lim\limits_{u \to u_0} f(u) = A$，且存在 $\delta_0 > 0$，当 $x \in \overset{\circ}{U}(x_0, \delta_0)$ 时，有 $g(x) \neq u_0$，则：

$$
\lim_{x \to x_0} f[g(x)] = \lim_{u \to u_0} f(u) = A
$$

这一法则允许我们在求极限时"换元"，是计算复杂极限的重要技巧。

#### "抓大头"公式

对于有理分式函数，当 $x \to \infty$ 时，极限取决于分子分母的**最高次项**：

$$
\lim_{x \to \infty} \frac{a_0 x^m + a_1 x^{m-1} + \cdots + a_m}{b_0 x^n + b_1 x^{n-1} + \cdots + b_n} = \begin{cases} 0, & m < n \\ \dfrac{a_0}{b_0}, & m = n \\ \infty, & m > n \end{cases}
$$

直观理解：当 $x$ 非常大时，最高次项"压倒"所有低次项，因此只需比较分子分母的最高次数。

> **注意**："抓大头"不仅适用于有理分式，也适用于含有 $\sqrt{x}$、$a^x$ 等函数的极限——核心思想始终是找出变化最快的项。

:::example 例 1 · 0/0 型：因式分解后约分
求 $\lim\limits_{x \to 3} \dfrac{x - 3}{x^2 - 9}$。

**思路**：直接代入得 $\frac{0}{0}$ 不定式。分子分母有公因式 $(x-3)$，先约分再代值。

**解**：

$$
\lim_{x \to 3} \frac{x - 3}{x^2 - 9} = \lim_{x \to 3} \frac{x - 3}{(x - 3)(x + 3)} = \lim_{x \to 3} \frac{1}{x + 3} = \frac{1}{6}
$$

**评注**：处理 $\frac{0}{0}$ 型的第一步：**因式分解**，看能否约去使分子分母同时为零的因子。

:::

:::example 例 2 · ∞/∞ 型：抓大头比较最高次
求 $\lim\limits_{x \to \infty} \dfrac{3x^3 + 4x^2 + 2}{7x^3 + 5x^2 - 3}$。

**思路**：$m = n = 3$，极限为最高次系数之比 $\frac{3}{7}$。

**解**：分子分母同除以 $x^3$：

$$
\lim_{x \to \infty} \frac{3x^3 + 4x^2 + 2}{7x^3 + 5x^2 - 3} = \lim_{x \to \infty} \frac{3 + \frac{4}{x} + \frac{2}{x^3}}{7 + \frac{5}{x} - \frac{3}{x^3}} = \frac{3}{7}
$$

:::

:::example 例 3 · 先求和再求极限
求 $\lim\limits_{n \to \infty} \left( \dfrac{1}{n^2 + 1} + \dfrac{2}{n^2 + 1} + \cdots + \dfrac{n}{n^2 + 1} \right)$。

**思路**：先对分子求和（等差数列），再计算极限。

**解**：

$$
\lim_{n \to \infty} \frac{1}{n^2 + 1} \cdot \frac{n(n + 1)}{2} = \lim_{n \to \infty} \frac{n^2 + n}{2n^2 + 2} = \frac{1}{2}
$$

:::

:::example 例 4 · 无穷等比级数求和
求 $\lim\limits_{n \to \infty} \left( \dfrac{1}{a} + \dfrac{1}{a^2} + \cdots + \dfrac{1}{a^n} \right)$（$a > 1$）。

**思路**：等比数列求和公式 $S_n = \frac{a_1(1 - q^n)}{1 - q}$，$n \to \infty$ 时 $(\frac{1}{a})^n \to 0$。

**解**：首项 $\frac{1}{a}$，公比 $\frac{1}{a}$：

$$
\lim_{n \to \infty} \frac{\frac{1}{a}\left(1 - \frac{1}{a^n}\right)}{1 - \frac{1}{a}} = \frac{\frac{1}{a}}{1 - \frac{1}{a}} = \frac{1}{a - 1}
$$

:::

:::example 例 5 · 裂项相消求对数和式的极限
求 $\lim\limits_{n \to \infty} \sum\limits_{k=0}^{n} \ln \dfrac{k+1}{k+2}$。

**思路**：利用对数性质 $\ln\frac{a}{b} = \ln a - \ln b$ 转化为加减，观察相邻项相消。

**解**：

$$
\begin{aligned}
\lim_{n \to \infty} \sum_{k=0}^{n} \ln \frac{k+1}{k+2} &= \lim_{n \to \infty} \ln \left( \frac{1}{2} \cdot \frac{2}{3} \cdot \cdots \cdot \frac{n+1}{n+2} \right) \\
&= \lim_{n \to \infty} \ln \frac{1}{n+2} = -\infty
\end{aligned}
$$

**评注**：裂项相消的核心在于将乘积转化为连加（通过取对数），或直接识别 $\frac{k+1}{k+2}$ 型连乘的消去规律。

:::

:::example 例 6 · ∞-∞ 型：分子有理化
求 $\lim\limits_{n \to \infty} \left( \sqrt{1 + 2 + \cdots + (n+1)} - \sqrt{1 + 2 + \cdots + n} \right)$。

**思路**：$\infty - \infty$ 不定式，采用**分子有理化**：乘以共轭式，将差化为商。

**解**：利用 $\sum_{k=1}^n k = \frac{n(n+1)}{2}$：

$$
\begin{aligned}
\text{原式} &= \lim_{n \to \infty} \frac{\frac{(n+1)(n+2)}{2} - \frac{n(n+1)}{2}}{\sqrt{\frac{(n+1)(n+2)}{2}} + \sqrt{\frac{n(n+1)}{2}}} = \lim_{n \to \infty} \frac{n+1}{\sqrt{\frac{(n+1)(n+2)}{2}} + \sqrt{\frac{n(n+1)}{2}}}
\end{aligned}
$$

分子分母同除以 $n$：

$$
= \lim_{n \to \infty} \frac{1 + \frac{1}{n}}{\sqrt{\frac{1}{2}(1 + \frac{1}{n})(1 + \frac{2}{n})} + \sqrt{\frac{1}{2} \cdot 1 \cdot (1 + \frac{1}{n})}} = \frac{1}{\frac{1}{\sqrt{2}} + \frac{1}{\sqrt{2}}} = \frac{\sqrt{2}}{2}
$$

**评注**：分子有理化是处理含根式的 $\infty - \infty$ 型的**首选方法**。共轭式 $\sqrt{A} - \sqrt{B} \to \frac{A - B}{\sqrt{A} + \sqrt{B}}$。

:::

:::example 例 7 · 含参极限：分母趋于零反推分子
已知 $\lim\limits_{x \to 2} \dfrac{x^2 + ax + b}{x^2 - 4} = 3$，求 $a$ 和 $b$。

**思路**：分母 $\to 0$，极限为有限值 $\Rightarrow$ 分子也必趋于 $0$。由此建立方程，约分后代入极限值。

**解**：$\lim\limits_{x \to 2} (x^2 - 4) = 0$，要使分式极限存在且为有限值，必须有：

$$
\lim_{x \to 2} (x^2 + ax + b) = 0 \Rightarrow 4 + 2a + b = 0 \Rightarrow b = -4 - 2a
$$

代入约分：

$$
\lim_{x \to 2} \frac{x^2 + ax - 4 - 2a}{x^2 - 4} = \lim_{x \to 2} \frac{(x-2)(x+2) + a(x-2)}{(x-2)(x+2)} = \lim_{x \to 2} \frac{x + 2 + a}{x + 2} = \frac{4 + a}{4} = 3
$$

解得 $a = 8$，$b = -20$。

**评注**："分母趋于零而极限存在" $\Rightarrow$ "分子也必趋于零"，这是含参极限题的核心推理链。

:::

:::example 例 8 · x 趋于负无穷时开方的符号陷阱
已知 $\lim\limits_{x \to -\infty} (4x + \sqrt{ax^2 - bx - 1}) = 1$（$a > 0$），求 $a$ 和 $b$。

**思路**：$x \to -\infty$ 时提取 $x$（负值），$\sqrt{x^2} = |x| = -x$。令发散部分的系数为零解出 $a$，再分子有理化解出 $b$。

**解**：

$$
\begin{aligned}
\lim_{x \to -\infty} (4x + \sqrt{ax^2 - bx - 1}) &= \lim_{x \to -\infty} x \left( 4 + \frac{\sqrt{ax^2 - bx - 1}}{x} \right)
\end{aligned}
$$

当 $x \to -\infty$ 时 $x < 0$，$\frac{\sqrt{ax^2}}{x} = -\sqrt{a}$：

$$
= \lim_{x \to -\infty} x \left( 4 - \sqrt{a - \frac{b}{x} - \frac{1}{x^2}} \right)
$$

$x \to -\infty$，要使极限为有限值 $1$，必须有 $4 - \sqrt{a} = 0 \Rightarrow a = 16$。

代回 $a = 16$，分子有理化：

$$
\lim_{x \to -\infty} (4x + \sqrt{16x^2 - bx - 1}) = \lim_{x \to -\infty} \frac{bx + 1}{4x - \sqrt{16x^2 - bx - 1}}
$$

分子分母同除以 $x$（注意 $\frac{\sqrt{16x^2}}{x} = -4$）：

$$
= \lim_{x \to -\infty} \frac{b + \frac{1}{x}}{4 - (-4)} = \frac{b}{8} = 1 \Rightarrow b = 8
$$

**评注**：$x \to -\infty$ 时 $\sqrt{x^2} = |x| = -x$，这是极其关键的细节。许多同学在此处漏掉负号导致全错。

:::

## 极限存在准则 & 两个重要极限

极限运算法则解决了"已知极限存在，如何计算"的问题。但很多时候我们甚至不知道极限是否存在——比如递推数列 $\sqrt{2}, \sqrt{2+\sqrt{2}}, \dots$。本节的两个准则——**夹逼准则**和**单调有界准则**——专门解决"判断极限是否存在"的问题：它们不要求事先知道极限值，只通过不等式放缩或单调有界性就能断言收敛性。在此基础上，两个重要极限 $\frac{\sin x}{x} \to 1$ 和 $(1+\frac{1}{x})^x \to e$ 给出了微积分中使用频率最高的两个极限结果，也是等价无穷小替换和第二重要极限型问题（$1^\infty$ 不定式）的源头。

### 极限存在准则

#### 夹逼准则（三明治定理/极限存在的迫敛性）

**数列情形**：如果数列 $\{ x_n \}, \{ y_n \}, \{ z_n \}$ 满足：

1. 从某项起，有 $y_n \leq x_n \leq z_n$
2. $\lim\limits_{n \to \infty} y_n = \lim\limits_{n \to \infty} z_n = a$

那么 $\lim\limits_{n \to \infty} x_n = a$。

**函数情形**：如果当 $x \in \overset{\circ}{U}(x_0, r)$（或 $|x| > M$）时，$g(x) \leq f(x) \leq h(x)$，且 $\lim g(x) = \lim h(x) = A$，则 $\lim f(x) = A$。

夹逼准则的核心思想是：**如果两边都夹向了同一个值，那么被夹在中间的也只能趋于那个值**。

**数列放缩常用技巧**：

- 整体放缩：$n \cdot a_{\min} \leq a_1 + a_2 + \cdots + a_n \leq n \cdot a_{\max}$
- 整体放缩（乘法）：$a_{\min}^n \leq a_1 a_2 \cdots a_n \leq a_{\max}^n$
- 局部放缩：利用已知不等式关系灵活处理

:::example 例 1 · 夹逼准则：分母不同化统一
求 $\lim\limits_{n \to \infty} \left( \dfrac{1}{n^2 + n + 1} + \dfrac{2}{n^2 + n + 2} + \cdots + \dfrac{n}{n^2 + n + n} \right)$。

**思路**：通项 $\frac{i}{n^2 + n + i}$ 的分母各不相同。用夹逼准则：把分母统一放缩为 $n^2 + n + 1$（最小）和 $n^2 + 2n$（最大），求和后两端趋于相同极限 $\frac{1}{2}$。

**解**：

$$
\frac{i}{n^2 + 2n} \leq \frac{i}{n^2 + n + i} \leq \frac{i}{n^2 + n + 1}
$$

对 $i$ 求和：

$$
\frac{n(n+1)/2}{n^2 + 2n} \leq \text{原式} \leq \frac{n(n+1)/2}{n^2 + n + 1}
$$

两边取极限均趋于 $\frac{1}{2}$，由夹逼准则，原式 $= \frac{1}{2}$。

**评注**：夹逼的关键是**将变化的部分换成常数**（最大/最小值），使求和可以执行。

:::

:::example 例 2 · 夹逼准则：最大底数主导
设 $a_i > 0$（$i = 1, 2, \dots, m$），求 $\lim\limits_{n \to \infty} \sqrt[n]{a_1^n + a_2^n + \cdots + a_m^n}$。

**思路**：当 $n \to \infty$ 时，$a_i^n$ 中最大的一项"压倒"其余。设 $A = \max\{a_i\}$，下界取 $A$，上界取 $\sqrt[n]{m} \cdot A$（$m$ 个最大项）。$\sqrt[n]{m} \to 1$，故极限为 $A$。

**解**：令 $A = \max\{a_i\}$：

$$
A = \sqrt[n]{A^n} \leq \text{原式} \leq \sqrt[n]{m \cdot A^n} = \sqrt[n]{m} \cdot A
$$

$\lim A = A$，$\lim \sqrt[n]{m} \cdot A = A \cdot 1 = A$。由夹逼准则，原式 $= \max\{a_i\}$。

:::

#### 单调有界准则

**数列情形**：单调有界数列必有极限。这是实数完备性的直接推论。

- 若 $\{x_n\}$ 单调递增且有上界，则极限存在且 $\lim x_n = \sup\{x_n\}$
- 若 $\{x_n\}$ 单调递减且有下界，则极限存在且 $\lim x_n = \inf\{x_n\}$

**函数情形**：设 $f(x)$ 在 $x_0$ 的某左邻域内单调且有界，则左极限 $f(x_0^-)$ 存在。类似地，右极限也有相应结论。

:::example 例 3 · 单调有界准则：递推数列求极限
证明 $\sqrt{2}, \sqrt{2 + \sqrt{2}}, \sqrt{2 + \sqrt{2 + \sqrt{2}}}, \dots$ 的极限存在并求之。

**思路**：递推式 $a_1 = \sqrt{2}$，$a_{n+1} = \sqrt{2 + a_n}$。三步：(1) 证单调递增；(2) 证有上界 $2$；(3) 对递推式取极限解 $L$。

**解**：

**(1) 单调性**：$a_2 = \sqrt{2 + \sqrt{2}} > \sqrt{2} = a_1$。设 $a_k > a_{k-1}$，则 $a_{k+1} = \sqrt{2 + a_k} > \sqrt{2 + a_{k-1}} = a_k$。归纳得 $\{a_n\}$ 单调递增。

**(2) 有界性**：$a_1 = \sqrt{2} < 2$。设 $a_k < 2$，则 $a_{k+1} = \sqrt{2 + a_k} < \sqrt{2 + 2} = 2$。归纳得 $\{a_n\}$ 有上界 $2$。

由单调有界准则，极限存在。设 $\lim a_n = L$，则：

$$
L = \sqrt{2 + L} \Rightarrow L^2 - L - 2 = 0 \Rightarrow L = 2 \ (\text{舍 } L = -1)
$$

**评注**：单调有界准则的模板题。三步：证单调 $\to$ 证有界 $\to$ 递推式取极限。舍去不合题意的根。

:::

#### 柯西收敛准则（柯西审敛原理）

数列 $\{ x_n \}$ 收敛的**充要条件**是：$\forall \varepsilon > 0, \exists N > 0$，当 $m, n > N$ 时，$|x_n - x_m| < \varepsilon$。

与前两个准则不同，柯西准则不需要事先知道极限值是什么——它仅通过数列本身的性质来判断是否收敛。

#### 三个准则对比

| 准则 | 条件 | 需要预知极限值？ | 适用场景 |
| :--- | :--- | :--- | :--- |
| 夹逼准则 | 两边夹住 | 需要（两边的极限） | 和式、乘积式极限 |
| 单调有界 | 单调 + 有界 | 不需要 | 递推数列 |
| 柯西准则 | 尾项任意接近 | 不需要 | 理论证明 |

### 两个重要极限

#### 第一重要极限

$$
\lim_{x \to 0} \frac{\sin x}{x} = 1
$$

推论：$\lim\limits_{x \to 0} \dfrac{x}{\sin x} = 1$，$\lim\limits_{x \to 0} \cos x = 1$；当 $x \in [0, \frac{\pi}{2}]$ 时，$\sin x < x < \tan x$。

第一重要极限的证明基于几何不等式 $\sin x < x < \tan x$ 和夹逼准则。它揭示了 $\sin x$ 在 $x = 0$ 附近与 $x$ 的"等价"关系。

:::example 例 4 · 第一重要极限：正切化正弦
求 $\lim\limits_{x \to 0} \dfrac{\tan x}{x}$。

**解**：$\tan x = \frac{\sin x}{\cos x}$，$\lim\limits_{x \to 0} \frac{\tan x}{x} = \lim\limits_{x \to 0} \frac{\sin x}{x} \cdot \frac{1}{\cos x} = 1 \cdot 1 = 1$。

:::

:::example 例 5 · 第一重要极限：半角公式的推论
求 $\lim\limits_{x \to 0} \dfrac{1 - \cos x}{x^2}$。

**解**：$1 - \cos x = 2 \sin^2 \frac{x}{2}$：

$$
\lim_{x \to 0} \frac{1 - \cos x}{x^2} = \lim_{x \to 0} \frac{2 \sin^2 \frac{x}{2}}{x^2} = 2 \cdot \left( \frac{1}{2} \right)^2 = \frac{1}{2}
$$

**评注**：此即 $1 - \cos x \sim \frac{x^2}{2}$（$x \to 0$）的来源。

:::

:::example 例 6 · 第一重要极限：配凑 sin(kx)/kx
求 $\lim\limits_{x \to 0} \dfrac{2x - \sin 3x}{2x + \sin 4x}$。

**思路**：分子分母同除以 $x$：$\frac{\sin(kx)}{x} = k \cdot \frac{\sin(kx)}{kx} \to k \cdot 1 = k$。

**解**：同除以 $x$：

$$
\lim_{x \to 0} \frac{2 - \frac{\sin 3x}{x}}{2 + \frac{\sin 4x}{x}} = \lim_{x \to 0} \frac{2 - 3 \cdot \frac{\sin 3x}{3x}}{2 + 4 \cdot \frac{\sin 4x}{4x}} = \frac{2 - 3}{2 + 4} = -\frac{1}{6}
$$

:::

#### 第二重要极限

$$
\lim_{n \to \infty} \left( 1 + \frac{1}{n} \right)^n = e, \quad \lim_{x \to \infty} \left( 1 + \frac{1}{x} \right)^x = e, \quad \lim_{x \to 0} (1 + x)^{\frac{1}{x}} = e
$$

三种形式等价，代表了 $1^\infty$ 不定式的极限。关键在于识别并凑出 $(1 + \square)^{\frac{1}{\square}}$ 的形式。

:::example 例 7 · 第二重要极限：(1-1/x)^x
求 $\lim\limits_{x \to \infty} \left( 1 - \dfrac{1}{x} \right)^x$。

**解**：$\lim\limits_{x \to \infty} \left(1 - \frac{1}{x}\right)^x = \lim\limits_{x \to \infty} \left[ \left(1 + \frac{-1}{x}\right)^{\frac{x}{-1}} \right]^{-1} = e^{-1}$。

:::

:::example 例 8 · 第二重要极限：(x+a)/(x+b) 型
求 $\lim\limits_{x \to \infty} \left( \dfrac{x + 1}{x - 1} \right)^{2x}$。

**思路**：$\frac{x+1}{x-1} = 1 + \frac{2}{x-1}$。凑指数使括号内趋于 $e$。

**解**：

$$
\frac{x+1}{x-1} = 1 + \frac{2}{x-1}
$$

$$
\text{原式} = \lim_{x \to \infty} \left[ \left(1 + \frac{2}{x-1}\right)^{\frac{x-1}{2}} \right]^{\frac{4x}{x-1}} = e^4 \quad \left(\frac{4x}{x-1} \to 4\right)
$$

**评注**：$\frac{x+a}{x+b} = 1 + \frac{a-b}{x+b}$ 是标准变形。

:::

:::example 例 9 · 第二重要极限：底数与指数同阶
求 $\lim\limits_{x \to \infty} \left( \dfrac{2x^2 - 1}{2x^2 + 1} \right)^{x^2}$。

**思路**：底数 $= 1 - \frac{2}{2x^2+1}$，指数 $x^2$ 与分母中的 $x^2$ 同阶。凑 $e^k$ 形式。

**解**：

$$
\frac{2x^2 - 1}{2x^2 + 1} = 1 + \frac{-2}{2x^2 + 1}
$$

$$
\text{原式} = \lim_{x \to \infty} \left[ \left(1 + \frac{-2}{2x^2 + 1}\right)^{\frac{2x^2 + 1}{-2}} \right]^{\frac{-2x^2}{2x^2 + 1}} = e^{-1}
$$

:::

## 无穷小的比较

两个无穷小虽然都趋于 $0$，但它们趋于 $0$ 的**速度**可能相差很大。比如 $x^2$ 比 $x$ 更快趋于 $0$。无穷小的比较正是量化这种"快慢"差异的工具。

#### 无穷小的阶

设 $\alpha, \beta$ 是同一自变量变化过程中的无穷小，且 $\alpha \neq 0$：

| 关系 | 条件 | 记号 |
| :--- | :--- | :--- |
| $\beta$ 是比 $\alpha$ **高阶**的无穷小 | $\lim \frac{\beta}{\alpha} = 0$ | $\beta = o(\alpha)$ |
| $\beta$ 是比 $\alpha$ **低阶**的无穷小 | $\lim \frac{\beta}{\alpha} = \infty$ | — |
| $\beta$ 与 $\alpha$ **同阶**无穷小 | $\lim \frac{\beta}{\alpha} = c \neq 0$ | — |
| $\beta$ 与 $\alpha$ **等价**无穷小 | $\lim \frac{\beta}{\alpha} = 1$ | $\alpha \sim \beta$ |
| $\beta$ 是关于 $\alpha$ 的 **$k$ 阶**无穷小 | $\lim \frac{\beta}{\alpha^k} = c \neq 0$ | — |

:::example 例 1 · 证明 n 次根式与 x/n 等价
证明 $\sqrt[n]{1 + x} - 1 \sim \dfrac{1}{n} x$（$x \to 0$）。

**思路**：利用 $a^n - b^n = (a - b)(a^{n-1} + a^{n-2}b + \cdots + b^{n-1})$，令 $a = \sqrt[n]{1 + x}$，$b = 1$。

**证明**：令 $a = \sqrt[n]{1 + x}$，$b = 1$，则 $x = a^n - 1 = (a - 1)(a^{n-1} + a^{n-2} + \cdots + 1)$：

$$
a - 1 = \frac{x}{a^{n-1} + a^{n-2} + \cdots + 1}
$$

当 $x \to 0$ 时 $a \to 1$，分母 $\to n$：

$$
\lim_{x \to 0} \frac{\sqrt[n]{1 + x} - 1}{x} = \lim_{x \to 0} \frac{1}{a^{n-1} + a^{n-2} + \cdots + 1} = \frac{1}{n}
$$

$\therefore \sqrt[n]{1 + x} - 1 \sim \frac{1}{n}x$（$x \to 0$）。

:::

#### 等价无穷小替换定理

设 $\alpha \sim \tilde{\alpha}$，$\beta \sim \tilde{\beta}$，且 $\lim \dfrac{\tilde{\beta}}{\tilde{\alpha}}$ 存在，则：

$$
\lim \frac{\beta}{\alpha} = \lim \frac{\tilde{\beta}}{\tilde{\alpha}}
$$

> **注意**：等价无穷小替换**只能用于乘除因子**，不能用于加减项！这是最常见的错误。例如 $\lim\limits_{x \to 0} \dfrac{\tan x - \sin x}{x^3}$ 中，虽然 $\tan x \sim x$ 和 $\sin x \sim x$，但分子是 $\tan x - \sin x$（加减），不能直接替换成 $x - x = 0$。正确做法是化为 $\dfrac{\tan x(1 - \cos x)}{x^3}$ 再逐一替换。

#### 常见等价无穷小（$x \to 0$）

| 等价关系 | 说明 |
| :--- | :--- |
| $\sin x \sim x$ | 三角函数基本等价 |
| $\tan x \sim x$ | |
| $\arcsin x \sim x$ | |
| $\arctan x \sim x$ | |
| $1 - \cos x \sim \dfrac{x^2}{2}$ | 半角公式推导 |
| $(1 + x)^\alpha - 1 \sim \alpha x$ | 含 $\sqrt[n]{1 + x} - 1 \sim \frac{1}{n}x$ |
| $a^x - 1 \sim x \ln a$ | 含 $e^x - 1 \sim x$ |
| $\ln(1 + x) \sim x$ | 对数基本等价 |

#### 二级结论（由麦克劳林展开推导）

这些结论在处理 $x - \sin x$、$\tan x - x$ 等"相消型"极限时十分有用：

![等价无穷小二级结论记忆数轴（一）：arctan x、sin x、x、arcsin x、tan x 从右往左逐格相差 x³/6](/notes-assets/hm1-08-equivalent-infinitesimal-axis.jpg)

![等价无穷小二级结论记忆数轴（二）：ln(1+x)、x、e^x-1 从右往左逐格相差 x²/2](/notes-assets/hm1-09-equivalent-infinitesimal-axis-2.jpg)

- $x - \sin x \sim \dfrac{1}{6} x^3$
- $\arcsin x - x \sim \dfrac{1}{6} x^3$
- $\tan x - x \sim \dfrac{1}{3} x^3$
- $x - \arctan x \sim \dfrac{1}{3} x^3$
- $\tan x - \sin x \sim \dfrac{1}{2} x^3$
- $\arcsin x - \arctan x \sim \dfrac{1}{2} x^3$
- $e^x - 1 - x \sim \dfrac{1}{2} x^2$
- $x - \ln(1 + x) \sim \dfrac{1}{2} x^2$
- $e^x - 1 - \ln(1 + x) \sim x^2$

> **注意**：二级结论的关键记忆法——看 $\sin$ 和 $\tan$ 在数轴上的位置：$\sin$ 在左边，系数为 $\frac{1}{6}$（更小），$\tan$ 在右边，系数为 $\frac{1}{3}$（更大）。详见上方数轴图。

#### 例题

:::example 例 2 · 乘除因子直接替换
求 $\lim\limits_{x \to 0} \dfrac{\tan 2x}{\sin 5x}$。

**解**：$\tan 2x \sim 2x$，$\sin 5x \sim 5x$，$\lim\limits_{x \to 0} \dfrac{2x}{5x} = \dfrac{2}{5}$。

:::

:::example 例 3 · 幂函数与余弦的等价替换
求 $\lim\limits_{x \to 0} \dfrac{(1 + x^2)^{\frac{1}{3}} - 1}{\cos x - 1}$。

**思路**：分子用 $(1+u)^\alpha - 1 \sim \alpha u$，分母 $\cos x - 1 = -(1 - \cos x) \sim -\frac{x^2}{2}$。

**解**：$\lim\limits_{x \to 0} \dfrac{\frac{1}{3}x^2}{-\frac{1}{2}x^2} = -\dfrac{2}{3}$。

:::

:::example 例 4 · 由高阶无穷小反求参数 k 的范围
当 $x \to 0$ 时，$(\sqrt{1 + x^2} - 1) \ln(1 + x^3)$ 是 $x (\arcsin x)^k$ 的高阶无穷小，求 $k$ 的取值范围。

**思路**：将分子和分母分别等价为 $x$ 的幂函数，高阶无穷小意味着分子阶数 > 分母阶数。

**解**：分子 $\sim \frac{1}{2}x^2 \cdot x^3 = \frac{1}{2}x^5$，分母 $\sim x \cdot x^k = x^{k+1}$。

由高阶无穷小定义：$\lim \frac{\frac{1}{2}x^5}{x^{k+1}} = 0 \Rightarrow 5 > k + 1 \Rightarrow k < 4$。

**评注**：此类题的标准步骤：(1) 各因子等价为幂函数；(2) 合成阶数；(3) 利用阶的比较条件列不等式。

:::

:::example 例 5 · 综合极限：多因子逐一替换
求 $\lim\limits_{x \to 0} \dfrac{(\sin x - \tan x)(e - e^{\cos x})}{(2x + 1) \sin^5 x}$。

**思路**：逐一分析每个因子的等价——

- $\sin x - \tan x$：用二级结论 $\tan x - \sin x \sim \frac{1}{2}x^3$，故 $\sin x - \tan x \sim -\frac{1}{2}x^3$
- $e - e^{\cos x} = e(1 - e^{\cos x - 1})$，$1 - e^{\cos x - 1} \sim -(\cos x - 1) \sim \frac{x^2}{2}$，故 $\sim \frac{e}{2}x^2$

**解**：

$$
\text{原式} = \lim_{x \to 0} \frac{(-\frac{1}{2}x^3) \cdot (\frac{e}{2}x^2)}{1 \cdot x^5} = -\frac{e}{4}
$$

**评注**：综合极限需要熟练调用各种等价无穷小（包括二级结论）。每步替换后及时化简幂次。

:::

## 函数的连续性与间断点

连续性是比"有极限"更强的性质。函数在某点有极限，只要求在该点附近的值趋近于某个数；函数在某点连续，还要求这个极限恰好等于函数值。

### 函数的连续性

#### 增量

设变量 $u$ 从初值 $u_1$ 变到终值 $u_2$，则**增量** $\Delta u = u_2 - u_1$。增量可正可负：$\Delta u > 0$ 表示增加，$\Delta u < 0$ 表示减少。

#### 连续的定义

设 $y = f(x)$ 在 $x_0$ 的某邻域有定义。若自变量的增量 $\Delta x = x - x_0 \to 0$ 时，函数增量 $\Delta y = f(x_0 + \Delta x) - f(x_0) \to 0$，则称 $f(x)$ 在 $x_0$ 处**连续**。

等价定义（极限形式）：$\lim\limits_{x \to x_0} f(x) = f(x_0)$。这个定义有三层含义：

1. $f(x)$ 在 $x_0$ 处有定义
2. $\lim\limits_{x \to x_0} f(x)$ 存在
3. 极限值等于函数值

**左连续**：$\lim\limits_{x \to x_0^-} f(x) = f(x_0)$；**右连续**：$\lim\limits_{x \to x_0^+} f(x) = f(x_0)$。$f(x)$ 在 $x_0$ 连续 $\Leftrightarrow$ 左连续且右连续。

:::example 例 1 · 判断分段函数在分段点处是否连续
判断 $f(x) = \begin{cases} x + 1, & x \leq 0 \\ x - 1, & x > 0 \end{cases}$ 在 $x = 0$ 处的连续性。

**思路**：分段点连续性的标准流程：求左极限、右极限、函数值，三者相等则连续。

**解**：

$$
\lim_{x \to 0^-} f(x) = \lim_{x \to 0^-} (x + 1) = 1, \quad \lim_{x \to 0^+} f(x) = \lim_{x \to 0^+} (x - 1) = -1, \quad f(0) = 1
$$

左极限 $= f(0)$（左连续），右极限 $\neq f(0)$（右不连续），故 $f(x)$ 在 $x = 0$ 处**不连续**。

:::

:::example 例 2 · 由连续性反求参数 k
已知 $f(x) = \begin{cases} \dfrac{e^{2x} - 1}{\sin 4x}, & x \neq 0 \\ k, & x = 0 \end{cases}$ 在 $(-\infty, +\infty)$ 内连续，求 $k$。

**思路**：$x \neq 0$ 时自动连续。只需确保 $x = 0$ 处连续：$\lim\limits_{x \to 0} f(x) = f(0) = k$。

**解**：$e^{2x} - 1 \sim 2x$，$\sin 4x \sim 4x$：

$$
\lim_{x \to 0} f(x) = \lim_{x \to 0} \frac{2x}{4x} = \frac{1}{2} \quad \Rightarrow \quad k = \frac{1}{2}
$$

:::

### 函数的间断点

#### 间断点的定义与分类

若 $f(x)$ 在 $x_0$ 的某去心邻域有定义，且满足以下任一条件，则 $x_0$ 为**间断点**：

1. $f(x)$ 在 $x_0$ 处没有定义
2. $\lim\limits_{x \to x_0} f(x)$ 不存在
3. $\lim\limits_{x \to x_0} f(x)$ 存在但不等于 $f(x_0)$

![间断点的分类：第一类与第二类](/notes-assets/hm1-10-discontinuity-types.jpg)

| 大类 | 条件 | 子类 | 子类条件 |
| :--- | :--- | :--- | :--- |
| **第一类** | 左右极限**都存在** | **可去间断点** | 左右极限相等 |
| | | **跳跃间断点** | 左右极限不相等 |
| **第二类** | 左右极限至少有一个不存在 | **无穷间断点** | 极限为 $\infty$ |
| | | **振荡间断点** | 函数值振荡无极限 |

> **注意**：第一类间断点的核心判断标准是"左右极限都存在"——只要这个条件满足，无论极限值与函数值是否相等，都属于第一类。

:::example 例 3 · 含极限式的函数求间断点并判类型
求 $f(x) = \lim\limits_{n \to \infty} \dfrac{x^2 + n x (1 - x) \sin^2 \pi x}{1 + n \sin^2 \pi x}$ 的间断点并判断类型。

**思路**：先"化掉"极限得到分段表达式。讨论 $\sin \pi x$ 是否为零（即 $x$ 是否为整数）。

**解**：

- 若 $x \in \mathbb{Z}$（$\sin \pi x = 0$）：$f(x) = x^2$
- 若 $x \notin \mathbb{Z}$：分子分母同除以 $n$，$f(x) = x(1-x)$

在 $x = 0$ 处：$f(0) = 0$，$\lim\limits_{x \to 0} f(x) = 0$，连续。

在 $x = k \neq 0$（$k \in \mathbb{Z}$）处：$f(k) = k^2$，但 $\lim\limits_{x \to k} f(x) = k(1-k) \neq k^2$，为**可去间断点**。

**评注**：含 $\lim\limits_{n \to \infty}$ 的表达式需要根据参数讨论分段。三角函数出现时，零点与非零点是自然的分段依据。

:::

:::example 例 4 · x 的 2n 次幂型：连续区间与间断点
已知 $f(x) = \lim\limits_{n \to \infty} \dfrac{1 + x}{1 + x^{2n}}$，求连续区间及间断点类型。

**思路**：讨论 $|x|$ 与 $1$ 的关系决定 $x^{2n}$ 的极限行为：$|x|<1 \Rightarrow x^{2n}\to 0$；$|x|>1 \Rightarrow x^{2n}\to\infty$；$|x|=1 \Rightarrow x^{2n}\equiv 1$。

**解**：

$$
f(x) = \begin{cases} 0, & x \leq -1 \\ 1 + x, & -1 < x < 1 \\ 1, & x = 1 \\ 0, & x > 1 \end{cases}
$$

在 $x = -1$ 处：$f(-1) = 0$，$\lim_{x \to -1^+} f(x) = 0 = \lim_{x \to -1^-} f(x)$，连续。

在 $x = 1$ 处：$f(1) = 1$，但 $\lim_{x \to 1^-} f = 2$，$\lim_{x \to 1^+} f = 0$，左右极限不等，为**跳跃间断点**。

连续区间：$(-\infty, 1) \cup (1, +\infty)$。

**评注**：$x^{2n}$ 型极限题的讨论边界永远在 $|x| = 1$。注意 $x = -1$ 时分子 $1+x=0$ 导致 $f(-1)=0$，恰好与左侧极限一致，因此连续——这是容易忽略的细节。

:::

## 连续函数的运算与初等函数的连续性

#### 连续函数的四则运算

若 $f, g$ 在 $x_0$ 处连续，则 $f \pm g$、$f \cdot g$ 在 $x_0$ 处连续；当 $g(x_0) \neq 0$ 时，$\frac{f}{g}$ 也在 $x_0$ 处连续。

#### 反函数与复合函数的连续性

- **反函数**：若 $y = f(x)$ 在区间 $I_x$ 上单调且连续，则其反函数 $x = f^{-1}(y)$ 在对应区间上也单调且连续
- **复合函数**：
  - 若 $\lim\limits_{x \to x_0} g(x) = u_0$，$y = f(u)$ 在 $u = u_0$ 连续，则 $\lim\limits_{x \to x_0} f[g(x)] = f(u_0)$——即"极限号可以穿过连续函数"
  - 若 $u = g(x)$ 在 $x_0$ 连续，$y = f(u)$ 在 $u_0 = g(x_0)$ 连续，则 $f[g(x)]$ 在 $x_0$ 连续

#### 初等函数的连续性

- 一切**基本初等函数**在其**定义域**内都是连续的
- 一切**初等函数**在其**定义区间**内都是连续的

> **注意**：初等函数是在**定义区间**内连续，而非定义域！例如 $y = \sqrt{\sin x - 1}$ 的定义域是离散点集 $\{ x \mid \sin x = 1 \} = \{ \frac{\pi}{2} + 2k\pi \}$，它不构成区间，因此不能用"连续性"来描述。

初等函数的连续性使我们求极限时有一个强大的工具：对于初等函数，只要 $x_0$ 落在其定义区间内，就有 $\lim\limits_{x \to x_0} f(x) = f(x_0)$——直接代入即可！

## 闭区间上连续函数的性质

开区间上的连续函数可能"无界"或"取不到最值"。一旦区间是闭的，连续函数就具有三个优良性质。

#### 有界性与最值定理

若 $f(x)$ 在闭区间 $[a, b]$ 上连续，则它在该区间上**必有界**，且必能取到**最大值**和**最小值**。

直观理解：闭区间的"闭"保证了边界的存在，连续性保证了中间不会有"跳跃"或"断裂"，两者结合保证了最值一定被取到。

#### 零点定理

若 $f(x)$ 在 $[a, b]$ 上连续，且 $f(a) \cdot f(b) < 0$（即端点函数值异号），则至少存在一点 $\xi \in (a, b)$ 使 $f(\xi) = 0$。

零点定理是证明方程根存在的核心工具。使用步骤：

1. 构造函数 $f(x)$（将要证明的方程移项为 $f(x) = 0$ 的形式）
2. 找两个点 $a, b$ 使 $f(a)$ 与 $f(b)$ 异号
3. 验证 $f(x)$ 在 $[a, b]$ 上连续
4. 由零点定理得出结论

:::example 例 1 · 用零点定理证明方程有根
证明 $x^3 - 4x^2 + 1 = 0$ 在 $(0, 1)$ 上至少有一个根。

**思路**：零点定理标准应用。构造 $f(x) = x^3 - 4x^2 + 1$，在端点试算符号。

**证明**：设 $f(x) = x^3 - 4x^2 + 1$，$f(x)$ 为多项式，在 $[0, 1]$ 上连续。

$$
f(0) = 1 > 0, \quad f(1) = 1 - 4 + 1 = -2 < 0
$$

$f(0) \cdot f(1) < 0$，由零点定理，存在 $\xi \in (0, 1)$ 使 $f(\xi) = 0$。

**评注**：证明方程根的存在，零点定理是首选工具。关键是**选对端点**——优先代入简单的值。

:::

#### 介值定理

若 $f(x)$ 在 $[a, b]$ 上连续，且 $f(a) = A$，$f(b) = B$，则对于 $A$ 与 $B$ 之间的任意数 $C$，至少存在一点 $\xi \in (a, b)$ 使 $f(\xi) = C$。

![介值定理的几何意义：f(a) 与 f(b) 之间的每个值都能被取到](/notes-assets/hm1-11-intermediate-value-theorem.jpg)

介值定理是零点定理的推广。事实上，零点定理是介值定理在 $C = 0$ 时的特例。

推论：闭区间上连续函数的值域必为闭区间 $[m, M]$，其中 $m, M$ 为该区间上的最小值与最大值。

> **注意**：这三个定理的条件中，"闭区间"和"连续"缺一不可。开区间 $(a, b)$ 上的连续函数不一定有界，也不一定能取到最值。

:::tip 用介值定理证题的关键
与零点定理不同，介值定理通常出现在**证明题**中——题目不会直接说"用介值定理"，而是让你证明某个中间值的存在性。关键在于**构造辅助函数**：将要证明的等式移项，设为一个新函数 $F(x)$，然后对 $F(x)$ 验证介值定理（或零点定理）的条件。介值定理也常与后续微分中值定理联合考察。

:::

:::example 例 2 · 构造辅助函数证明中间值相等
设函数 $f$ 在 $[0, 2a]$ 上连续，且 $f(0) = f(2a)$，证明：存在点 $x_0 \in [0, a]$，使得 $f(x_0) = f(x_0 + a)$。

**思路**：要证 $f(x_0) = f(x_0 + a)$，即 $f(x_0) - f(x_0 + a) = 0$。构造辅助函数 $F(x) = f(x) - f(x + a)$，则只需证 $\exists x_0 \in [0, a]$ 使 $F(x_0) = 0$——这就转化为了零点定理问题。验证 $F(0)$ 与 $F(a)$ 的符号。

**证明**：令 $F(x) = f(x) - f(x + a)$，$x \in [0, a]$。由于 $f(x)$ 在 $[0, 2a]$ 上连续，$F(x)$ 在 $[0, a]$ 上也连续。

$$
\begin{aligned}
F(0) &= f(0) - f(a) \\
F(a) &= f(a) - f(2a) = f(a) - f(0) \quad (\text{由 } f(0) = f(2a))
\end{aligned}
$$

观察到 $F(0) = -F(a)$。因此 $F(0) \cdot F(a) = -[F(0)]^2 \leq 0$。

- 若 $F(0) = F(a) = 0$，则 $x_0 = 0$ 或 $x_0 = a$ 即满足要求。
- 若 $F(0) \cdot F(a) < 0$，由零点定理，存在 $x_0 \in (0, a)$ 使 $F(x_0) = 0$，即 $f(x_0) = f(x_0 + a)$。

综上，存在 $x_0 \in [0, a]$ 使 $f(x_0) = f(x_0 + a)$。证毕。

**评注**：本题的关键技巧在于**构造辅助函数** $F(x) = f(x) - f(x + a)$——将"两个函数值相等"转化为"差为零"，从而套用零点定理。$F(0) = -F(a)$ 的发现是解题的突破口：它保证了端点值异号（或同时为零），无需知道 $f(0)$ 和 $f(a)$ 的具体大小。这类"构造辅助函数 + 验证端点符号"的模式，是介值定理和零点定理证明题的通用套路。

:::

#### 闭区间上连续函数三大定理对比

| 定理 | 结论 | 条件 | 核心用法 |
| :--- | :--- | :--- | :--- |
| 最值定理 | $f$ 能取到最大值和最小值 | $f \in C[a, b]$ | 保证最值存在 |
| 零点定理 | $\exists \xi, f(\xi) = 0$ | $f \in C[a, b]$ 且 $f(a)f(b) < 0$ | 证明方程根的存在 |
| 介值定理 | $\exists \xi, f(\xi) = C$ | $f \in C[a, b]$，$C$ 介于 $f(a)$ 与 $f(b)$ 之间 | 证明中间值的存在 |

## 小结

1. 函数是定义在数集上的特殊映射，由**定义域**与**对应法则**两个要素完全确定，两者都相同才算同一个函数。映射的值域 $R_f$ 只是目标集合 $Y$ 的子集，只有**单射**才有逆映射，复合映射则要求内层值域落在 $R_g \subset D_f$ 之内。
2. **有界**要求同时有上界与下界，一侧趋于无穷即属无界。**周期函数**不一定有最小正周期（狄利克雷函数就没有），而定义域对称的函数总能拆成一个偶函数与一个奇函数之和。
3. 数列极限的 $\varepsilon$-$N$、函数极限的 $\varepsilon$-$\delta$ 与 $\varepsilon$-$X$ 三套定义逻辑结构完全一致，都是"任意给定 $\varepsilon$，去找一个控制量"。$\varepsilon$ 的任意性是关键，控制量依赖 $\varepsilon$ 且顺序不能颠倒；用定义证明走**倒推法**，取 $N = [g(\varepsilon)] + 1$ 以保证它落在正整数集里。
4. 收敛数列**极限唯一**且**必有界**，但有界不一定收敛——$x_n = (-1)^{n+1}$ 就在 $-1$ 与 $1$ 之间振荡。**保号性**反向只能得到 $\geq$（$x_n \geq 0$ 只能推出 $a \geq 0$），而数列收敛等价于奇、偶两个子列收敛于同一极限。
5. 函数极限用**去心邻域**，因为 $x \to x_0$ 时不看 $f(x_0)$：$\frac{x^2 - 1}{x - 1}$ 在 $x = 1$ 处无定义，极限仍是 $2$。极限存在的**充要条件**是左右极限都存在且相等，这是判断分段函数在分段点行为的标准做法。
6. $\lim f(x) = A \Leftrightarrow f(x) = A + \alpha$（$\alpha$ 为**无穷小**），无穷大与无穷小互为倒数，**海涅定理**则把函数极限归结为数列极限。有限个无穷小的和、积仍是无穷小，无限个不一定；**无界**不等于无穷大（$y = x\cos x$），而 $\infty \pm \infty$、$\frac{\infty}{\infty}$ 这类**不定式**不能按普通算术处理。
7. 算极限要先判型再动手：$\frac{0}{0}$ 型因式分解后约分，$x \to \infty$ 的有理分式**抓大头**比最高次，和式先求和（等差、等比、裂项相消），含根式的 $\infty - \infty$ 型**分子有理化**。含参题靠"分母趋于零而极限存在 $\Rightarrow$ 分子也必趋于零"反推，$x \to -\infty$ 时 $\sqrt{x^2} = |x| = -x$ 这个负号是最容易丢的细节。
8. 判断极限是否存在看三个准则：**夹逼准则**需要两边的极限已知，**单调有界准则**适合递推数列（先证单调、再证有界、最后对递推式取极限），**柯西准则**只看尾项是否任意接近，不需预知极限值。$\lim\limits_{x \to 0} \frac{\sin x}{x} = 1$ 由 $\sin x < x < \tan x$ 与夹逼得到，$\lim\limits_{x \to \infty}\left(1 + \frac{1}{x}\right)^x = e$ 专治 $1^\infty$ 型，关键是凑出 $(1 + \square)^{\frac{1}{\square}}$。
9. **等价无穷小替换**只能用在**乘除因子**上，加减项直接替换会出错：$\frac{\tan x - \sin x}{x^3}$ 的分子不能换成 $x - x = 0$，应化为 $\frac{\tan x(1 - \cos x)}{x^3}$ 再逐项替换。$x - \sin x \sim \frac{1}{6}x^3$、$\tan x - x \sim \frac{1}{3}x^3$ 这类**二级结论**由麦克劳林展开推出，专门处理"相消型"极限。
10. 连续 $\Leftrightarrow \lim\limits_{x \to x_0} f(x) = f(x_0)$，它同时要求有定义、极限存在、极限值等于函数值；间断点按左右极限是否都存在分为**第一类**（可去、跳跃）与**第二类**（无穷、振荡）。初等函数在**定义区间**内连续（不是定义域，如 $\sqrt{\sin x - 1}$），所以求极限可以直接代入；闭区间上连续函数的最值、零点、介值三大定理都以"闭区间 + 连续"为前提、缺一不可，证明中间值存在则靠构造辅助函数 $F(x) = f(x) - f(x + a)$。
