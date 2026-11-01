---
title: 高等数学-5 定积分
description: 从黎曼和的定义与性质出发，经牛顿-莱布尼茨公式、换元与分部积分，到反常积分的判敛，再到面积、体积、弧长的微元法应用，讲清定积分从概念到计算的完整链条。
category: 数学
subject: 数学
subfield: 高等数学
topic: 定积分
difficulty: 基础
date: "2026-10-17"
tags: [高等数学, 定积分, 牛顿-莱布尼茨公式, 变限积分, 换元法, 分部积分, 反常积分, 微元法]
draft: true
featured: false
---

## 定积分的概念与性质

第四章解决了"如何求原函数"的问题，但积分的另一个起源——求面积、求路程、求累积量——尚未触及。本章从黎曼和的极限出发，将积分从"求导的逆运算"拓展为"连续量的累积工具"，并建立定积分的性质体系，为后续计算（牛莱公式、换元分部、几何应用）打下地基。

### 定积分的定义

#### 定积分

设函数 $f(x)$ 在 $[a,b]$ 上有界。在 $[a,b]$ 中任意插入分点

$$
a = x_{0} < x_{1} < x_{2} < \dots < x_{n-1} < x_{n} = b
$$

把区间分为 $n$ 个小区间，各小区间长度依次为 $\Delta x_{i} = x_{i} - x_{i-1}$。

在每个小区间 $[x_{i-1}, x_{i}]$ 上任取一点 $\xi_{i}$，作乘积 $f(\xi_{i}) \Delta x_{i}$，并求和：

$$
S = \sum_{i=1}^{n} f(\xi_{i}) \Delta x_{i}
$$

记 $\lambda = \max\{\Delta x_{1}, \dots, \Delta x_{n}\}$。如果当 $\lambda \to 0$ 时，这个和的极限总存在，且与区间分法和 $\xi_{i}$ 的取法无关，则称此极限 $I$ 为 $f(x)$ 在 $[a,b]$ 上的**定积分**，记作：

$$
\int_{a}^{b} f(x) \, dx = I = \lim_{\lambda \to 0} \sum_{i=1}^{n} f(\xi_{i}) \Delta x_{i}
$$

其中 $f(x)$ 为**被积函数**，$a$、$b$ 分别为**积分下限**和**积分上限**，和式 $\sum f(\xi_i)\Delta x_i$ 称为**积分和**（黎曼和）。

> **注意**：定积分只与被积函数和积分区间有关，与积分变量用什么符号无关。例如 $\int_{1}^{2} x^{2} \, dx$ 与 $\int_{1}^{2} t^{2} \, dt$ 表示同一个定积分。

#### 可积条件

如果 $f(x)$ 在 $[a,b]$ 上的定积分存在，则称 $f(x)$ 在 $[a,b]$ 上**可积**。

**充分条件**（满足其一即可）：

- ① $f(x)$ 在 $[a,b]$ 上连续；
- ② $f(x)$ 在 $[a,b]$ 上有界，且只有有限个间断点。

#### 定积分的几何意义

![定积分 ∫ₐᵇ f(x)dx 的几何含义：x 轴上方的面积取正、下方取负](/notes-assets/hm5-01-definite-integral-geometry.jpg)

$$
\int_{a}^{b} f(x) \, dx = \text{（$x$ 轴上方面积）} - \text{（$x$ 轴下方面积）}
$$

具体地：

$$
S = \begin{cases}
\int_{a}^{b} f(x) \, dx, & f(x) \ge 0 \\[4pt]
-\int_{a}^{b} f(x) \, dx, & f(x) \le 0
\end{cases}
$$

#### 用定积分求 $n$ 项和数列极限

设 $f(x)$ 在 $[0,1]$ 上可积，将 $[0,1]$ $n$ 等分，则：

$$
\int_{0}^{1} f(x) \, dx = \lim_{n \to \infty} \sum_{i=1}^{n} f\!\left( \frac{i}{n} \right) \cdot \frac{1}{n}
$$

**推论**：设 $f(x)$ 在 $[a, a+1]$ 可积，则

$$
\int_{a}^{a+1} f(x) \, dx = \lim_{n \to \infty} \sum_{i=1}^{n} f\!\left( a + \frac{i}{n} \right) \cdot \frac{1}{n}
$$

:::example 例 1 · 用定义计算定积分
利用定义计算 $\int_{0}^{1} x^{2} \, dx$。

**思路**：将 $[0,1]$ $n$ 等分，取右端点 $\xi_{i}=x_{i}=i/n$，化为 $\sum i^{2}$ 公式求极限。

**解**：

$$
\begin{aligned}
\sum_{i=1}^{n} f(\xi_{i}) \Delta x_{i}
&= \sum_{i=1}^{n} \left( \frac{i}{n} \right)^{2} \cdot \frac{1}{n}
= \frac{1}{n^{3}} \sum_{i=1}^{n} i^{2} \\
&= \frac{1}{n^{3}} \cdot \frac{n(n+1)(2n+1)}{6}
\end{aligned}
$$

$$
\Rightarrow \int_{0}^{1} x^{2} \, dx = \lim_{n \to \infty} \frac{n(n+1)(2n+1)}{6n^{3}} = \frac{1}{3}
$$

**评注**：这是唯一一道用定义直接计算定积分的例题，目的是体会"分割→近似→求和→取极限"四步。后续所有定积分都通过牛莱公式计算，不会再回到定义。

:::

:::example 例 2 · 把 n 项和的极限化为定积分
求极限 $\displaystyle\lim_{n \to \infty} \frac{1}{n} \sum_{i=1}^{n} \sqrt{1 + \frac{i}{n}}$。

**思路**：提取 $\frac{1}{n}$ 作为 $\Delta x$，括号内 $\frac{i}{n}$ 替换为 $x$ 即得被积函数。

**解**：

$$
\lim_{n \to \infty} \frac{1}{n} \sum_{i=1}^{n} \sqrt{1 + \frac{i}{n}}
= \lim_{n \to \infty} \sum_{i=1}^{n} \sqrt{1 + \frac{i}{n}} \cdot \frac{1}{n}
= \int_{0}^{1} \sqrt{1 + x} \, dx
$$

**评注**：这一步只是"翻译"——把和式极限写成定积分形式。具体计算需用牛莱公式（见 5.2）。关键技巧是识别 $\frac{1}{n} \to dx$，$\frac{i}{n} \to x$。

:::

:::example 例 3 · 用几何意义求 n 项和的极限
求 $\displaystyle\lim_{n \to \infty} \frac{1}{n^{2}} \left( \sqrt{n^{2} - 1^{2}} + \sqrt{n^{2} - 2^{2}} + \cdots + \sqrt{n^{2} - n^{2}} \right)$。

**思路**：先提 $\frac{1}{n}$ 构造 $\Delta x$，注意此处分母是 $n^{2}$，需要多提一个 $\frac{1}{n}$。

**解**：

$$
\begin{aligned}
\text{原式}
&= \lim_{n \to \infty} \sum_{i=1}^{n} \sqrt{n^{2} - i^{2}} \cdot \frac{1}{n^{2}}
= \lim_{n \to \infty} \sum_{i=1}^{n} \sqrt{1 - \left( \frac{i}{n} \right)^{2}} \cdot \frac{1}{n} \\
&= \int_{0}^{1} \sqrt{1 - x^{2}} \, dx = \frac{1}{4} \pi
\end{aligned}
$$

**评注**：最后一步 $\int_{0}^{1} \sqrt{1-x^{2}}\,dx = \frac{\pi}{4}$ 来自几何意义：这是单位圆在第一象限的面积。

:::

### 定积分的性质

#### 基本规定

- $\int_{a}^{a} f(x) \, dx = 0$（上下限相等，积分为 0）
- $\int_{a}^{b} f(x) \, dx = -\int_{b}^{a} f(x) \, dx$（上下限交换，变号）

#### 线性性

设 $\alpha, \beta$ 为常数，则

$$
\int_{a}^{b} [\alpha f(x) \pm \beta g(x)] \, dx = \alpha \int_{a}^{b} f(x) \, dx \pm \beta \int_{a}^{b} g(x) \, dx
$$

> **注意**：$\int_{a}^{b} f(x) \cdot g(x) \, dx \ne \int_{a}^{b} f(x) \, dx \cdot \int_{a}^{b} g(x) \, dx$——积分的乘积 ≠ 乘积的积分，只有线性运算才能拆开。

#### 区间可加性

$$
\int_{a}^{b} f(x) \, dx = \int_{a}^{c} f(x) \, dx + \int_{c}^{b} f(x) \, dx
$$

此式对 $a, b, c$ 的任意相对位置均成立。

![定积分的区间可加性：拆分点 c 可以在区间内部，也可以在区间外](/notes-assets/hm5-02-interval-additivity.jpg)

#### 保号性

如果在 $[a, b]$（$a < b$）上 $f(x) \ge 0$，则 $\int_{a}^{b} f(x) \, dx \ge 0$。

**推论**：

- ① 若 $f(x) \le g(x)$，则 $\int_{a}^{b} f(x) \, dx \le \int_{a}^{b} g(x) \, dx$。
- ② $\displaystyle\left\lvert \int_{a}^{b} f(x) \, dx \right\rvert \le \int_{a}^{b} \lvert f(x) \rvert \, dx \quad (a < b)$

:::example 例 4 · 用保号性比较两个定积分
比较 $\int_{1}^{2} \ln x \, dx$ 和 $\int_{1}^{2} (\ln x)^{2} \, dx$ 的大小。

**思路**：比较被积函数在积分区间上的大小关系，利用保号性转化为积分关系。

**解**：当 $1 \le x \le 2$ 时，$0 = \ln 1 \le \ln x \le \ln 2 < \ln e = 1$，即 $0 \le \ln x < 1$。

$$
\Rightarrow \ln x \ge (\ln x)^{2} \quad \text{（} 0 \le t < 1 \text{ 时 } t \ge t^{2}\text{）}
$$

$$
\Rightarrow \int_{1}^{2} \ln x \, dx > \int_{1}^{2} (\ln x)^{2} \, dx
$$

**评注**：比较定积分大小的标准方法：比较被积函数在积分区间上的大小。关键是注意到 $\ln x \in [0,1]$，而在 $[0,1]$ 上一个数大于它的平方。

:::

#### 估值定理

设 $M$ 和 $m$ 分别是 $f(x)$ 在 $[a, b]$ 上的最大值和最小值，则：

$$
m(b - a) \le \int_{a}^{b} f(x) \, dx \le M(b - a)
$$

:::example 例 5 · 用估值定理估计积分值
估计 $\int_{\frac{\pi}{4}}^{\frac{5\pi}{4}} (1 + \sin^{2} x) \, dx$ 的值。

**思路**：在积分区间上求 $f(x) = 1 + \sin^{2} x$ 的最值，代入估值不等式。

**解**：$x \in \left[\frac{\pi}{4}, \frac{5\pi}{4}\right]$，$f(x)_{\max} = f\!\left(\frac{\pi}{2}\right) = 2$，$f(x)_{\min} = f(\pi) = 1$。

$$
1 \cdot \pi \le \int_{\frac{\pi}{4}}^{\frac{5\pi}{4}} f(x) \, dx \le 2 \cdot \pi \quad \Rightarrow \quad \pi \le \text{原式} \le 2\pi
$$

**评注**：估值定理不需要计算积分值，只需最值。常用于证明题中建立不等式。

:::

#### 积分中值定理

如果 $f(x)$ 在 $[a, b]$ 上连续，则至少存在一点 $\xi \in [a, b]$，使得：

$$
\int_{a}^{b} f(x) \, dx = f(\xi)(b - a)
$$

:::tip 积分中值定理的证明思路
估值定理给出 $m \le \frac{1}{b-a}\int_{a}^{b} f(x)\,dx \le M$，再由连续函数的介值定理，必存在 $\xi$ 使 $f(\xi)$ 等于该中间值。
:::

称 $f(\xi) = \frac{1}{b - a} \int_{a}^{b} f(x) \, dx$ 为 $f(x)$ 在 $[a, b]$ 上的**积分平均值**。

:::example 例 6 · 用积分中值定理证明存在零点
设 $f(x)$ 在 $[0,2]$ 上连续，$f(0) = -1$，$\frac{1}{2} \int_{0}^{2} f(x) \, dx = 1$，求证：$\exists \xi \in (0, 2)$，使 $f(\xi) = 0$。

**思路**：积分中值定理找一个正值点，与 $f(0) = -1$ 异号，再用零点定理。

**证明**：$f(x)$ 在 $[0,2]$ 上连续，由积分中值定理：

$$
\exists C \in (0, 2),\ f(C) = \frac{1}{2} \int_{0}^{2} f(x) \, dx = 1
$$

则 $f(0) = -1 < 0$，$f(C) = 1 > 0$。由零点定理，$\exists \xi \in (0, C) \subset (0, 2)$，使 $f(\xi) = 0$。

**评注**：积分中值定理在证明中常用于"制造"一个函数值。结合零点定理/罗尔定理是证明题的常见套路。

:::

## 微积分基本公式

上一节用定义计算定积分极其繁琐（例 1 仅算 $\int_{0}^{1} x^{2} dx$ 就用了一页）。本节建立微分与积分的桥梁——变限积分函数的求导法则和牛顿-莱布尼茨公式——从此不定积分的全部技术（换元、分部）都可以为定积分服务。这是微积分史上最重要的一步。

### 变限积分函数

#### 定义

如果上限 $x$ 在区间 $[a, b]$ 上任意变动，那么对于每一个取定的 $x$ 值，定积分有一个对应值，所以它在 $[a, b]$ 上定义了一个函数，即**变上限积分函数**或**积分上限的函数**：

$$
\Phi(x) = \int_{a}^{x} f(t) \, dt \quad (a \le x \le b)
$$

同理，可以定义**变下限积分函数**或**积分下限的函数**：

$$
\Phi(x) = \int_{x}^{b} f(t) \, dt \quad (a \le x \le b)
$$

二者统称为**变限积分函数**或**积分限函数**。

#### 变上限积分函数的导数（原函数存在定理）

如果 $f(x)$ 在 $[a, b]$ 上连续，则变上限积分函数 $\Phi(x) = \int_{a}^{x} f(t) \, dt$ 在 $[a, b]$ 上可导，且：

$$
\Phi'(x) = \frac{d}{dx} \int_{a}^{x} f(t) \, dt = f(x)
$$

:::tip 变上限积分求导的证明思路
增量 $\Delta\Phi = \int_{x}^{x+\Delta x} f(t)\,dt$，积分中值定理给出 $\Delta\Phi = f(\xi)\Delta x$，取极限 $\Delta x \to 0$ 时 $\xi \to x$，故 $\Phi'(x) = f(x)$。
:::

由此可直接推出：连续函数必有原函数——$\Phi(x) = \int_{a}^{x} f(t)\,dt$ 就是它的一个原函数。这就是**原函数存在定理**。

此外，变限积分还有一个"天然"的性质——只要 $f$ 可积，$F$ 就一定连续，即使 $f$ 本身有间断点：

> **变限积分的天然连续性**：若 $f(x)$ 在 $[a, b]$ 上可积，则 $F(x) = \int_{a}^{x} f(t) \, dt$ 在 $[a, b]$ 上**连续**（但未必可导）。

:::tip 变限积分连续性的证明思路
只需证 $\lim_{\Delta x \to 0} \lvert F(x+\Delta x) - F(x)\rvert = 0$。

$$
0 \le \lvert F(x+\Delta x) - F(x)\rvert
= \left\lvert \int_{x}^{x+\Delta x} f(t) \, dt \right\rvert
\le \int_{x}^{x+\Delta x} \lvert f(t)\rvert \, dt
\le M \cdot \lvert\Delta x\rvert
$$

其中 $M$ 为 $\lvert f(t)\rvert$ 在 $[a, b]$ 上的上界（$f$ 可积必有界）。当 $\Delta x \to 0$ 时 $M \cdot \lvert\Delta x\rvert \to 0$，由夹逼准则即得 $F$ 连续。
:::

> **注意**：这个结论的关键推论是——**$f$ 有跳跃间断点，$F$ 却没有跳跃**。例如：
>
> 设 $f(x) = \begin{cases} -1, & x < 0 \\ 1, & x \ge 0 \end{cases}$（在 $x=0$ 处有跳跃间断点），则 $F(x) = \int_{0}^{x} f(t)\,dt = \lvert x\rvert$。
>
> 可以看到：$f$ 在 $x=0$ 处跳跃（$-1 \to 1$），但 $F(x) = \lvert x\rvert$ 在 $x=0$ 处是**连续**的（只是不可导——尖点）。因此"$f$ 有跳跃间断点 $\Rightarrow$ $\int_{a}^{x} f(t)\,dt$ 也有跳跃间断点"这一说法**错误**。反过来，$f$ 有跳跃时 $F$ 在对应点连续但不可导（出现尖点/角点）。

#### 变限积分求导公式

如果函数 $f(x)$ 在 $[a, b]$ 上连续，$\varphi(x)$，$\psi(x)$ 在 $[a, b]$ 内可导，那么积分限函数 $F(x) = \int_{\varphi(x)}^{\psi(x)} f(t) \, dt$ 在 $[a, b]$ 上可导，且：

$$
F'(x) = f[\psi(x)] \cdot \psi'(x) - f[\varphi(x)] \cdot \varphi'(x)
$$

:::tip 变限积分求导公式的推导
从最简单的 $\int_{a}^{x}$ 出发，逐层叠加复杂因素，最后组装出通式。

**Step 1**　$\displaystyle\left( \int_{a}^{x} f(t) \, dt \right)' = f(x)$ —— 基本结论（5.2.1 第 2 小节已证）。

**Step 2**　$\displaystyle\left( \int_{x}^{b} f(t) \, dt \right)' = -f(x)$ —— 调换上下限（$\int_{x}^{b} = -\int_{b}^{x}$），化归 Step 1。

**Step 3**　$\displaystyle\left( \int_{a}^{\varphi(x)} f(t) \, dt \right)' = f(\varphi(x)) \cdot \varphi'(x)$ —— Step 1 + 链式法则。

**Step 4**　$\displaystyle\left( \int_{\varphi(x)}^{b} f(t) \, dt \right)' = -f(\varphi(x)) \cdot \varphi'(x)$ —— Step 2 + 链式法则。

**Step 5**　$\displaystyle\left( \int_{g(x)}^{h(x)} f(t) \, dt \right)' = f(h)h' - f(g)g'$ —— 插入常数点拆分 $\int_{g}^{h} = \int_{a}^{h} - \int_{a}^{g}$，分别套 Step 3 相减即得通式。
:::

**速查表**：

| 情形 | 公式 | 由来 |
| :--- | :--- | :--- |
| 上限 $x$，下限常数 | $(\int_{a}^{x} f(t)\,dt)' = f(x)$ | Step 1 |
| 下限 $x$，上限常数 | $(\int_{x}^{b} f(t)\,dt)' = -f(x)$ | Step 2 |
| 上限 $\varphi(x)$ | $(\int_{a}^{\varphi(x)} f(t)\,dt)' = f(\varphi) \cdot \varphi'$ | Step 3 |
| 下限 $\varphi(x)$ | $(\int_{\varphi(x)}^{b} f(t)\,dt)' = -f(\varphi) \cdot \varphi'$ | Step 4 |
| **上下限均为函数** | $\boldsymbol{(\int_{g}^{h} f(t)\,dt)' = f(h)h' - f(g)g'}$ | Step 5 |

> **注意**：$x$ 为求导变量，$t$ 为积分变量。以上公式**仅在被积函数不含 $x$** 时直接使用。若被积函数含 $x$，需先通过恒等变形将 $x$ 移出积分号（如 $x$ 是常数可提出，见例 3）。

:::example 例 1 · 变限积分求导后套洛必达
求 $\displaystyle\lim_{x \to 0} \frac{\int_{0}^{x} \cos t^{2} \, dt}{x}$。

**思路**：$\frac{0}{0}$ 型，用洛必达法则，分子求导直接套变限积分求导公式。

**解**：

$$
\lim_{x \to 0} \frac{\int_{0}^{x} \cos t^{2} \, dt}{x} = \lim_{x \to 0} \frac{\cos x^{2}}{1} = 1
$$

**评注**：这是变限积分+洛必达的最简模型。核心是记住 $(\int_{a}^{x} f(t)\,dt)' = f(x)$。

:::

:::example 例 2 · 上下限都是函数的变限积分
求 $\displaystyle\lim_{x \to 0} \frac{\int_{\cos x}^{1} e^{-t^{2}} \, dt}{x^{2}}$。

**思路**：$\frac{0}{0}$ 型，上限是常量 $1$、下限是 $\cos x$，注意负号。

**解**：

$$
\begin{aligned}
\lim_{x \to 0} \frac{\int_{\cos x}^{1} e^{-t^{2}} \, dt}{x^{2}}
&= \lim_{x \to 0} \frac{-e^{-\cos^{2} x} \cdot (-\sin x)}{2x} \\
&= \lim_{x \to 0} \frac{e^{-\cos^{2} x} \cdot \sin x}{2x}
= \frac{e^{-1}}{2} = \frac{1}{2e}
\end{aligned}
$$

**评注**：下限为函数时，$(\int_{\varphi(x)}^{b} f(t)\,dt)' = -f(\varphi(x)) \cdot \varphi'(x)$。这里 $\varphi(x) = \cos x$，$\varphi'(x) = -\sin x$，两个负号抵消。

:::

:::example 例 3 · 被积函数含参数的变限积分
设 $g(x)$ 连续，$F(x) = \int_{a}^{x} x \cdot t g(t) \, dt$，求 $F'(x)$。

**思路**：被积函数中的 $x$ 相对于积分变量 $t$ 是常数，先提到积分号外再求导。

**解**：

$$
\begin{aligned}
F(x) &= \int_{a}^{x} x \cdot t g(t) \, dt = x \int_{a}^{x} t g(t) \, dt \\[4pt]
\Rightarrow F'(x) &= 1 \cdot \int_{a}^{x} t g(t) \, dt + x \cdot x g(x) \\
&= \int_{a}^{x} t g(t) \, dt + x^{2} g(x)
\end{aligned}
$$

**评注**：被积函数含 $x$ 时，必须将 $x$ 移出积分号再求导。这里用的是乘积求导法则 $(uv)' = u'v + uv'$。

:::

### 牛顿-莱布尼茨公式

#### 微积分基本定理

如果 $F(x)$ 是连续函数 $f(x)$ 在 $[a, b]$ 上的一个原函数，则：

$$
\int_{a}^{b} f(x) \, dx = F(x) \Big|_{a}^{b} = F(b) - F(a)
$$

:::tip 牛顿-莱布尼茨公式的证明思路
设 $\Phi(x) = \int_{a}^{x} f(t)\,dt$ 和 $F(x)$ 均为 $f(x)$ 的原函数，则 $F(x) - \Phi(x) = C$。代入 $x = a$ 得 $C = F(a)$，再代入 $x = b$ 即得 $F(b) - \Phi(b) = F(a)$，移项完成。
:::

:::example 例 4 · 用牛顿-莱布尼茨公式计算
求 $\int_{0}^{1} x^{2} \, dx$。

**解**：

$$
\int_{0}^{1} x^{2} \, dx = \frac{1}{3} x^{3} \Big|_{0}^{1} = \frac{1}{3}
$$

**评注**：与 5.1 节例 1 对比——同样一道题，牛莱公式只需一行，定义法用了整页。这就是微积分基本定理的力量。

:::

:::example 例 5 · 原函数必须带绝对值
求 $\int_{-2}^{-1} \frac{1}{x} \, dx$。

**思路**：$\frac{1}{x}$ 的原函数是 $\ln\lvert x\rvert$，不是 $\ln x$。积分区间为负值时绝对值符号至关重要。

**解**：

$$
\int_{-2}^{-1} \frac{1}{x} \, dx = \ln\lvert x\rvert \Big|_{-2}^{-1} = \ln 1 - \ln 2 = -\ln 2
$$

**评注**：最容易犯的错误是写 $\ln x |_{-2}^{-1}$——$\ln(-2)$ 没有意义。牢记 $\int \frac{1}{x} dx = \ln\lvert x\rvert + C$。

:::

:::example 例 6 · 三角恒等变形后再积分
求 $\int_{0}^{\frac{\pi}{4}} \tan^{2} \theta \, d\theta$。

**思路**：$\tan^{2}\theta$ 没有直接的原函数公式，但 $\tan^{2}\theta = \sec^{2}\theta - 1$，后者可直接积分。

**解**：

$$
\int_{0}^{\frac{\pi}{4}} \tan^{2} \theta \, d\theta
= \int_{0}^{\frac{\pi}{4}} (\sec^{2} \theta - 1) \, d\theta
= (\tan \theta - \theta) \Big|_{0}^{\frac{\pi}{4}} = 1 - \frac{\pi}{4}
$$

**评注**：牛莱公式 + 恒等变形是定积分计算的基本模式。$\tan^{2}x = \sec^{2}x - 1$ 和 $\cot^{2}x = \csc^{2}x - 1$ 是两个必须牢记的恒等式。

:::

## 定积分的换元法和分部积分法

牛莱公式打通了定积分与不定积分的联系——第四章积累的全部积分技术都可以直接用于定积分。本节讨论定积分特有的技巧：换元时同时换限、分部时用上下限直接代入、对称区间/周期函数/区间再现等特殊简化。掌握这些，定积分的计算速度和准确性会有质的飞跃。

### 换元法与分部积分法

#### 定积分换元法

设 $f(x)$ 在 $[a, b]$ 上连续，函数 $x = \varphi(t)$ 满足：

- (1) $\varphi(\alpha) = a$，$\varphi(\beta) = b$；
- (2) $\varphi(t)$ 在 $[\alpha, \beta]$（或 $[\beta, \alpha]$）上具有连续导数，且其值域 $R_{\varphi} = [a, b]$。

则有：

$$
\int_{a}^{b} f(x) \, dx = \int_{\alpha}^{\beta} f[\varphi(t)] \varphi'(t) \, dt
$$

> **注意**：
> (1) **换元必须换限**——这是定积分换元与不定积分换元的最大区别。
> (2) 换元后无需回代原变量，直接用新上下限代入即可。

:::example 例 1 · 三角换元与几何意义两法对照
求 $\int_{0}^{a} \sqrt{a^{2} - x^{2}} \, dx \quad (a > 0)$。

**思路**：法一利用几何意义（$\frac{1}{4}$ 圆面积），法二用三角换元 $x = a\sin t$。两法对照，体会换元法步骤。

**法一（几何意义）**：$y = \sqrt{a^{2} - x^{2}} \Rightarrow x^{2} + y^{2} = a^{2}$ 是上半圆，积分区间 $[0, a]$ 是右半部分。

$$
\int_{0}^{a} \sqrt{a^{2} - x^{2}} \, dx = \frac{1}{4} \pi a^{2}
$$

**法二（三角换元）**：令 $x = a \sin t$，$dx = a \cos t \, dt$。$x: 0 \to a$，$t: 0 \to \frac{\pi}{2}$。

$$
\begin{aligned}
\text{原式} &= \int_{0}^{\frac{\pi}{2}} \sqrt{a^{2} - a^{2} \sin^{2} t} \cdot a \cos t \, dt \\
&= a^{2} \int_{0}^{\frac{\pi}{2}} \cos^{2} t \, dt
= a^{2} \cdot \frac{1}{2} \cdot \frac{\pi}{2} = \frac{1}{4} \pi a^{2}
\end{aligned}
$$

**评注**：定积分换元三步走：①令 $x = \varphi(t)$ ②求 $dx = \varphi'(t)dt$ ③换限（$x:a\to b$ 对应 $t:\alpha\to\beta$）。之后直接用新变量在新限上计算，无需回代。

:::

:::example 例 2 · 开偶次根号必须先写绝对值
求 $\int_{0}^{\pi} \sqrt{\sin^{3} x - \sin^{5} x} \, dx$。

**思路**：提公因式 $\sin^{3}x$ 得 $\sqrt{\sin^{3}x \cos^{2}x} = \sin^{\frac{3}{2}}x \lvert\cos x\rvert$。$\cos x$ 在 $[0,\frac{\pi}{2}]$ 为正、$[\frac{\pi}{2},\pi]$ 为负，需分段去掉绝对值。

**解**：

$$
\begin{aligned}
\int_{0}^{\pi} \sqrt{\sin^{3} x - \sin^{5} x} \, dx
&= \int_{0}^{\pi} \sin^{\frac{3}{2}} x \lvert\cos x\rvert \, dx \\
&= \int_{0}^{\frac{\pi}{2}} \sin^{\frac{3}{2}} x \cos x \, dx - \int_{\frac{\pi}{2}}^{\pi} \sin^{\frac{3}{2}} x \cos x \, dx \\
&= \frac{2}{5} \sin^{\frac{5}{2}} x \Big|_{0}^{\frac{\pi}{2}} - \frac{2}{5} \sin^{\frac{5}{2}} x \Big|_{\frac{\pi}{2}}^{\pi} = \frac{4}{5}
\end{aligned}
$$

**评注**：$\sqrt{u^{2}} = \lvert u\rvert$ 而非 $u$——这是定积分计算中最常见的错误之一。见到偶次根号或 $\sqrt{f^{2}(x)}$ 必须先写绝对值，再根据积分区间分段讨论。

:::

:::example 例 3 · 根式整体换元
求 $\int_{0}^{4} \frac{x + 2}{\sqrt{2x + 1}} \, dx$。

**思路**：令 $t = \sqrt{2x+1}$，将根式整体替换为 $t$。换元后 $x = \frac{1}{2}(t^{2} - 1)$，$dx = t\,dt$。

**解**：令 $t = \sqrt{2x + 1}$，$x = \frac{1}{2}(t^{2} - 1)$，$dx = t \, dt$。$x: 0 \to 4$，$t: 1 \to 3$。

$$
\begin{aligned}
\text{原式} &= \int_{1}^{3} \frac{\frac{1}{2}(t^{2} - 1) + 2}{t} \cdot t \, dt
= \int_{1}^{3} \frac{t^{2} + 3}{2} \, dt \\
&= \frac{1}{2} \left( \frac{1}{3} t^{3} + 3t \right) \Big|_{1}^{3} = \frac{22}{3}
\end{aligned}
$$

**评注**：含 $\sqrt{ax+b}$ 的被积函数，令 $t = \sqrt{ax+b}$ 是标准换元。换元后分式中的 $t$ 恰好与 $dx$ 中的 $t$ 约去，积分简化为多项式。

:::

#### 定积分分部积分法

设 $u(x), v(x)$ 在 $[a, b]$ 上连续可导，则：

$$
\int_{a}^{b} u \, dv = uv \Big|_{a}^{b} - \int_{a}^{b} v \, du
$$

:::example 例 4 · 反三角函数作被积函数的分部积分
求 $\int_{0}^{\frac{1}{2}} \arcsin x \, dx$。

**思路**：反三角函数没有直接的原函数，必须用分部积分。取 $u = \arcsin x$，$dv = dx$。

**解**：

$$
\begin{aligned}
\int_{0}^{\frac{1}{2}} \arcsin x \, dx
&= x \arcsin x \Big|_{0}^{\frac{1}{2}} - \int_{0}^{\frac{1}{2}} x \cdot \frac{1}{\sqrt{1 - x^{2}}} \, dx \\
&= \frac{1}{2} \cdot \frac{\pi}{6} + \frac{1}{2} \int_{0}^{\frac{1}{2}} \frac{1}{\sqrt{1 - x^{2}}} \, d(1 - x^{2}) \\
&= \frac{\pi}{12} + \sqrt{1 - x^{2}} \Big|_{0}^{\frac{1}{2}}
= \frac{\pi}{12} + \frac{\sqrt{3}}{2} - 1
\end{aligned}
$$

**评注**：$\arcsin x$、$\arctan x$、$\ln x$ 这类函数求导后会变成代数函数，因此分部积分时取它们为 $u$（口诀"反对幂指三"，**反**优先做 $u$）。

:::

:::example 例 5 · 先换元消根号再分部
求 $\int_{0}^{1} e^{\sqrt{x}} \, dx$。

**思路**：先换元 $t = \sqrt{x}$ 消去根号，得到 $\int t e^{t} dt$ 的形式，再分部积分。

**解**：令 $t = \sqrt{x}$，$x = t^{2}$，$dx = 2t \, dt$。$x: 0 \to 1$，$t: 0 \to 1$。

$$
\begin{aligned}
\int_{0}^{1} e^{\sqrt{x}} \, dx
&= 2 \int_{0}^{1} t e^{t} \, dt
= 2 \int_{0}^{1} t \, d(e^{t}) \\
&= 2 \left( t e^{t} \Big|_{0}^{1} - \int_{0}^{1} e^{t} \, dt \right)
= 2(e - (e - 1)) = 2
\end{aligned}
$$

**评注**："先换元消根号，再分部积分"是处理 $e^{\sqrt{x}}$、$\sin\sqrt{x}$ 等含根号函数的通用策略。

:::

#### 华里士公式（点火公式）

$$
I_{n} = \int_{0}^{\frac{\pi}{2}} \sin^{n} x \, dx = \int_{0}^{\frac{\pi}{2}} \cos^{n} x \, dx = \begin{cases}
\dfrac{(n-1)!!}{n!!} \cdot \dfrac{\pi}{2}, & n \text{ 为正偶数} \\[10pt]
\dfrac{(n-1)!!}{n!!}, & n \text{ 为大于 1 的正奇数}
\end{cases}
$$

:::note 双阶乘 n!! 的记号
$n!!$ 读作"$n$ 的双阶乘"，表示**每隔一个数乘一次**，只乘与 $n$ 同奇偶的数：

- $n$ 为偶数：$n!! = n \times (n-2) \times (n-4) \times \cdots \times 4 \times 2$
- $n$ 为奇数：$n!! = n \times (n-2) \times (n-4) \times \cdots \times 3 \times 1$

例如：$6!! = 6 \times 4 \times 2 = 48$，$5!! = 5 \times 3 \times 1 = 15$。规定 $0!! = 1$。
:::

:::note 为什么叫"点火公式"
观察递推过程：从 $I_n$ 开始，每次乘以 $\frac{n-1}{n}$ 降到 $I_{n-2}$，最终落到 $I_0$ 或 $I_1$。

- 若 $n$ 为**偶数**：终点是 $I_0 = \frac{\pi}{2}$——$\frac{\pi}{2}$ 出现，**点火成功**
- 若 $n$ 为**奇数**：终点是 $I_1 = 1$——$\frac{\pi}{2}$ 不出现，**熄火**

$$
\begin{aligned}
I_6 &= \frac{5}{6} \cdot \frac{3}{4} \cdot \frac{1}{2} \cdot \underbrace{\frac{\pi}{2}}_{\text{🔥点火}} &\quad I_5 &= \frac{4}{5} \cdot \frac{2}{3} \cdot \underbrace{1}_{\text{💤熄火}}
\end{aligned}
$$

记忆口诀：**偶点火（有 $\frac{\pi}{2}$），奇熄火（没有 $\frac{\pi}{2}$）。**
:::

:::tip 华里士公式的递推证明
$I_n = \int_{0}^{\pi/2} \sin^{n-1}x \, d(-\cos x)$，分部积分得递推 $I_n = \frac{n-1}{n} I_{n-2}$，反复应用至 $I_0 = \frac{\pi}{2}$ 或 $I_1 = 1$。
:::

**应用示例**：

- $\int_{0}^{\frac{\pi}{2}} \sin^{4} x \, dx = \dfrac{3}{4} \cdot \dfrac{1}{2} \cdot \dfrac{\pi}{2} = \dfrac{3\pi}{16}$
- $\int_{0}^{\frac{\pi}{2}} \cos^{5} x \, dx = \dfrac{4}{5} \cdot \dfrac{2}{3} \cdot 1 = \dfrac{8}{15}$

**广义华里士公式**（$\sin^{m}x \cos^{n}x$ 型）：

$$
\int_{0}^{\frac{\pi}{2}} \sin^{m} x \cos^{n} x \, dx = \begin{cases}
\dfrac{(m-1)!!\,(n-1)!!}{(m+n)!!}, & m, n \text{ 不全为偶数} \\[10pt]
\dfrac{(m-1)!!\,(n-1)!!}{(m+n)!!} \cdot \dfrac{\pi}{2}, & m, n \text{ 全为偶数}
\end{cases}
$$

### 对称区间与区间再现

#### 对称区间上的定积分

若 $f(x)$ 在 $[-a, a]$ 上连续（$a > 0$），则：

| $f(x)$ 奇偶性 | 结果 | 口诀 |
| :--- | :--- | :--- |
| 偶函数 | $\displaystyle\int_{-a}^{a} f(x) \, dx = 2\int_{0}^{a} f(x) \, dx$ | 偶倍 |
| 奇函数 | $\displaystyle\int_{-a}^{a} f(x) \, dx = 0$ | 奇零 |

![奇函数与偶函数在对称区间上的积分：偶函数的面积翻倍，奇函数的面积相消](/notes-assets/hm5-03-symmetric-interval-parity.jpg)

:::tip 对称区间结论的证明思路
$\int_{-a}^{a} = \int_{-a}^{0} + \int_{0}^{a}$，前者令 $x = -t$ 换元化为 $\int_{0}^{a} f(-x)\,dx$。奇函数 $f(-x) = -f(x)$ 两项抵消；偶函数 $f(-x) = f(x)$ 两项叠加。
:::

**推论**（非奇非偶也适用）：

$$
\int_{-a}^{a} f(x) \, dx = \int_{0}^{a} [f(x) + f(-x)] \, dx
$$

:::example 例 6 · 偶次根号的经典错误
求 $\int_{-1}^{1} (x^{2})^{\frac{3}{2}} \, dx$。

**思路**：$(x^{2})^{3/2} = \lvert x\rvert^{3}$，不是 $x^{3}$！这是一个高频陷阱。

**常见错误**：$\int_{-1}^{1} (x^{2})^{\frac{3}{2}} \, dx = \int_{-1}^{1} x^{3} \, dx = 0$（✗）

**正确解法**：

$$
(x^{2})^{\frac{3}{2}} = \lvert x\rvert^{3} \quad \text{（偶函数）}
$$

$$
\int_{-1}^{1} (x^{2})^{\frac{3}{2}} \, dx = 2 \int_{0}^{1} x^{3} \, dx = 2 \cdot \frac{1}{4} = \frac{1}{2}
$$

**评注**：$(x^{2})^{\frac{3}{2}} = \lvert x\rvert^{3}$，$\sqrt{x^{2}} = \lvert x\rvert$——偶次根号出来永远是绝对值。判断奇偶性之前，必须先把函数化为最简形式。

:::

:::example 例 7 · 非奇非偶函数的对称区间积分
求 $\int_{-\frac{\pi}{2}}^{\frac{\pi}{2}} \frac{\sin^{2} x}{1 + e^{x}} \, dx$。

**思路**：$\frac{\sin^{2}x}{1+e^{x}}$ 非奇非偶，不能用"偶倍奇零"。使用推论 $\int_{-a}^{a} f(x) = \int_{0}^{a} [f(x) + f(-x)]$。

**解**：

$$
\begin{aligned}
\text{原式} &= \int_{0}^{\frac{\pi}{2}} \left[ \frac{\sin^{2} x}{1 + e^{x}} + \frac{\sin^{2} (-x)}{1 + e^{-x}} \right] dx \\
&= \int_{0}^{\frac{\pi}{2}} \left[ \frac{\sin^{2} x}{1 + e^{x}} + \frac{e^{x} \sin^{2} x}{1 + e^{x}} \right] dx \\
&= \int_{0}^{\frac{\pi}{2}} \sin^{2} x \, dx = \frac{1}{2} \cdot \frac{\pi}{2} = \frac{\pi}{4}
\end{aligned}
$$

**评注**：对含有 $e^{x}$、$e^{-x}$ 的对称区间积分，$f(x) + f(-x)$ 常常能"消掉"讨厌的指数项。这是对称区间推论最经典的应用场景。

:::

:::example 例 8 · 对称区间上的"纸老虎"
求 $\displaystyle\int_{-1}^{1} \left[ \frac{x^{2} \sin^{2} x}{x^{4} + 2x^{2} + 1} + (x^{4} + 1) \sqrt{1 - x^{2}} \right] dx$。

**思路**：被积表达式又长又丑——但积分区间 $[-1,1]$ 是对称的！先判断每一项的奇偶性，用"偶倍奇零"拆开，再分别计算。

**解**：

**第一步——判断奇偶性**：

- 第一项 $\frac{x^{2} \sin^{2} x}{x^{4} + 2x^{2} + 1} = \frac{x^{2} \sin^{2} x}{(x^{2}+1)^{2}}$：分子 $x^{2}$（偶）$\times \sin^{2}x$（偶）= 偶，分母 $(x^{2}+1)^{2}$（偶）。偶/偶 = **偶函数**。
- 第二项 $(x^{4}+1)\sqrt{1-x^{2}}$：$x^{4}+1$（偶）$\times \sqrt{1-x^{2}}$（偶）= **偶函数**。

**第二步——用"偶倍"拆开**：

$$
\begin{aligned}
\text{原式}
&= 2\int_{0}^{1} \frac{x^{2} \sin^{2} x}{(x^{2}+1)^{2}} \, dx
  + 2\int_{0}^{1} x^{4} \sqrt{1 - x^{2}} \, dx
  + 2\int_{0}^{1} \sqrt{1 - x^{2}} \, dx
\end{aligned}
$$

**第三步——计算能直接看出来的部分**：

$$
2\int_{0}^{1} \sqrt{1 - x^{2}} \, dx = 2 \cdot \frac{\pi}{4} = \frac{\pi}{2} \quad \text{（$\frac{1}{4}$ 单位圆面积）}
$$

剩下两项 $2\int_{0}^{1} \frac{x^{2}\sin^{2}x}{(x^{2}+1)^{2}}\,dx$ 与 $2\int_{0}^{1} x^{4}\sqrt{1-x^{2}}\,dx$ 需继续用三角换元配合华里士公式，此处不再展开。

**评注**：这道题的核心教训：**看到 $[-a,a]$ 上的积分，第一反应永远是判断奇偶性。** 哪怕表达式再复杂，"偶倍奇零"这四字就能把你从繁琐计算中解救出来。正是这种"看起来吓人、用对称性秒变简单"的特质，让它得名"纸老虎"。

:::

#### 区间再现公式

设 $f(x)$ 为连续函数，则：

$$
\int_{a}^{b} f(x) \, dx = \int_{a}^{b} f(a + b - x) \, dx = \frac{1}{2} \int_{a}^{b} [f(x) + f(a + b - x)] \, dx
$$

:::tip 区间再现公式的证明思路
令 $x = a + b - u$，换元即得。几何意义：$f(x)$ 与 $f(a+b-x)$ 关于区间中点 $x = \frac{a+b}{2}$ 对称。
:::

:::example 例 9 · 正弦余弦商型积分的经典结果
计算 $\int_{0}^{\frac{\pi}{2}} \frac{\sin^{n} x}{\sin^{n} x + \cos^{n} x} \, dx$，其中 $n \in N^{*}$。

**思路**：令 $x = \frac{\pi}{2} - t$ 做区间再现，得到分母相同但分子互换的积分，两式相加。

**解**：

$$
I = \int_{0}^{\frac{\pi}{2}} \frac{\sin^{n} x}{\sin^{n} x + \cos^{n} x} \, dx
$$

区间再现：

$$
I = \int_{0}^{\frac{\pi}{2}} \frac{\cos^{n} x}{\cos^{n} x + \sin^{n} x} \, dx
$$

两式相加：

$$
2I = \int_{0}^{\frac{\pi}{2}} \frac{\sin^{n} x + \cos^{n} x}{\sin^{n} x + \cos^{n} x} \, dx = \frac{\pi}{2} \quad \Rightarrow \quad I = \frac{\pi}{4}
$$

**评注**：结果与 $n$ 无关！这是区间再现公式的经典案例。任何 $\int_{0}^{\pi/2} \frac{f(\sin x, \cos x)}{f(\sin x, \cos x) + f(\cos x, \sin x)}\,dx = \frac{\pi}{4}$。

:::

:::example 例 10 · 对数三角积分的区间再现
计算 $\int_{0}^{\frac{\pi}{4}} \ln(1 + \tan x) \, dx$。

**思路**：令 $x = \frac{\pi}{4} - t$，$\tan(\frac{\pi}{4} - x) = \frac{1 - \tan x}{1 + \tan x}$，得到原积分的等式，解出积分值。

**解**：

$$
\begin{aligned}
I &= \int_{0}^{\frac{\pi}{4}} \ln\!\left(1 + \tan\!\left(\frac{\pi}{4} - x\right)\right) dx
= \int_{0}^{\frac{\pi}{4}} \ln\!\left(1 + \frac{1 - \tan x}{1 + \tan x}\right) dx \\
&= \int_{0}^{\frac{\pi}{4}} \ln\!\left(\frac{2}{1 + \tan x}\right) dx
= \int_{0}^{\frac{\pi}{4}} \ln 2 \, dx - I
\end{aligned}
$$

$$
\Rightarrow 2I = \frac{\pi}{4} \ln 2 \quad \Rightarrow \quad I = \frac{\pi}{8} \ln 2
$$

**评注**：区间再现用于对数三角积分时，常常能通过恒等式变形得到 $I = C - I$ 的形式，直接解出 $I$。

:::

:::example 例 11 · 区间再现与传统换元的对比
求 $\displaystyle\lim_{x \to 0^{+}} \frac{\int_{0}^{x} \sqrt{x - t}\, e^{t} \, dt}{x^{\frac{3}{2}}}$。

**思路**：被积函数里 $x$ 和 $t$ 纠缠在一起（$\sqrt{x-t}$），传统做法需要用 $u = x-t$ 换元分离。但区间再现公式 $f(t) \to f(x-t)$ 只需一步就能把 $x$ 提出来，更简洁。

**法一（传统换元）**：令 $u = x - t$，$dt = -du$，$t: 0 \to x$，$u: x \to 0$。

$$
\int_{0}^{x} \sqrt{x - t}\, e^{t} \, dt = \int_{x}^{0} \sqrt{u}\, e^{x-u} \, d(-u) = e^{x} \int_{0}^{x} \sqrt{u}\, e^{-u} \, du
$$

$$
\Rightarrow \lim_{x \to 0^{+}} \frac{e^{x} \int_{0}^{x} \sqrt{u}\, e^{-u} \, du}{x^{\frac{3}{2}}}
= \lim_{x \to 0^{+}} \frac{\sqrt{x}\, e^{-x}}{\frac{3}{2}\sqrt{x}} = \frac{2}{3}
$$

**法二（区间再现）**：令 $t \to x - t$，一步到位。

$$
\begin{aligned}
\lim_{x \to 0^{+}} \frac{\int_{0}^{x} \sqrt{x - t}\, e^{t} \, dt}{x^{\frac{3}{2}}}
&= \lim_{x \to 0^{+}} \frac{\int_{0}^{x} \sqrt{t}\, e^{x-t} \, dt}{x^{\frac{3}{2}}} \\
&= \lim_{x \to 0^{+}} \frac{e^{x} \int_{0}^{x} \sqrt{t}\, e^{-t} \, dt}{x^{\frac{3}{2}}}
= \frac{2}{3}
\end{aligned}
$$

**评注**：区间再现在此题的妙处——传统换元需要设 $u = x-t$、换限、处理 $d(-u)$ 的负号，而区间再现直接 $\sqrt{x-t} \to \sqrt{t}$，$x$ 自动从根号里"弹"到指数上。**当被积函数含 $f(x-t)$ 且积分变量与参数混在一起时，区间再现往往比换元更省力。**

:::

### 三类特殊函数的定积分

#### 三角函数的定积分

$f(x)$ 在 $[0,1]$ 上连续时，有以下简化公式：

| 公式 | 条件 |
| :--- | :--- |
| $\displaystyle\int_{0}^{\frac{\pi}{2}} f(\sin x) \, dx = \int_{0}^{\frac{\pi}{2}} f(\cos x) \, dx$ | 区间再现 $x = \frac{\pi}{2} - t$ |
| $\displaystyle\int_{0}^{\pi} f(\sin x) \, dx = 2\int_{0}^{\frac{\pi}{2}} f(\sin x) \, dx$ | 对称性 |
| $\displaystyle\int_{0}^{\pi} x f(\sin x) \, dx = \frac{\pi}{2} \int_{0}^{\pi} f(\sin x) \, dx$ | 区间再现消除 $x$ |
| $\displaystyle\int_{0}^{2\pi} \sin^{n} x \, dx = \begin{cases} 4\int_{0}^{\frac{\pi}{2}} \sin^{n} x \, dx, & n\text{ 偶} \\ 0, & n\text{ 奇} \end{cases}$ | 周期性+对称性 |

:::example 例 12 · 含 x 的三角积分消去 x
求 $\int_{0}^{\pi} \frac{x \sin x}{1 + \cos^{2} x} \, dx$。

**思路**：被积函数含 $x \cdot f(\sin x)$（注意 $\cos^{2}x = 1 - \sin^{2}x$，分母是 $\sin x$ 的函数），直接用公式三消去 $x$。

**解**：

$$
\begin{aligned}
\int_{0}^{\pi} \frac{x \sin x}{1 + \cos^{2} x} \, dx
&= \frac{\pi}{2} \int_{0}^{\pi} \frac{\sin x}{1 + \cos^{2} x} \, dx \\
&= -\frac{\pi}{2} \int_{0}^{\pi} \frac{d(\cos x)}{1 + \cos^{2} x} \\
&= -\frac{\pi}{2} \arctan(\cos x) \Big|_{0}^{\pi}
= \frac{\pi^{2}}{4}
\end{aligned}
$$

**评注**：$\int_{0}^{\pi} x f(\sin x)\,dx = \frac{\pi}{2}\int_{0}^{\pi} f(\sin x)\,dx$ 是最常用的三角函数定积分公式。关键识别：分母中的 $\cos^{2}x = 1 - \sin^{2}x$，整体仍是 $\sin x$ 的函数。

:::

#### 周期函数的定积分

设 $f(x)$ 是连续的周期函数，周期为 $T$，则：

(1) $\displaystyle\int_{a}^{a+T} f(x) \, dx = \int_{0}^{T} f(x) \, dx$（任意长度为 $T$ 的区间上积分相等）

(2) $\displaystyle\int_{a}^{a+nT} f(x) \, dx = n\int_{0}^{T} f(x) \, dx \quad (n \in \mathbb{N})$

:::example 例 13 · 周期函数加绝对值去根号
求 $\int_{0}^{n\pi} \sqrt{1 + \sin 2x} \, dx$。

**思路**：$\sqrt{1+\sin 2x}$ 周期为 $\pi$，先化为一周期上的积分，再去根号分段。

**解**：

$$
\begin{aligned}
\int_{0}^{n\pi} \sqrt{1 + \sin 2x} \, dx
&= n \int_{0}^{\pi} \sqrt{(\sin x + \cos x)^{2}} \, dx \\
&= n \int_{0}^{\pi} \lvert\sin x + \cos x\rvert \, dx \\
&= \sqrt{2} n \int_{0}^{\pi} \left\lvert\sin\!\left(x + \frac{\pi}{4}\right)\right\rvert \, dx \\
&= \sqrt{2} n \int_{0}^{\pi} \sin t \, dt \quad \text{（令 }t = x + \tfrac{\pi}{4}\text{）} \\
&= 2\sqrt{2} n
\end{aligned}
$$

**评注**：周期函数积分的标准处理：先利用周期性将 $n$ 个周期的积分化为 $n$ 倍单周期，再在一个周期内完成计算。

:::

#### 分段函数的定积分

分段函数的定积分需要在分段点拆开积分区间分别计算。

:::example 例 14 · 含绝对值的对数积分
计算 $\int_{\frac{1}{e}}^{e} \lvert\ln x\rvert \, dx$。

**思路**：$\ln x$ 在 $(0,1)$ 为负、$(1,e)$ 为正。以 $x=1$ 为界拆分，分别去掉绝对值。

**解**：

$$
\begin{aligned}
\int_{\frac{1}{e}}^{e} \lvert\ln x\rvert \, dx
&= \int_{\frac{1}{e}}^{1} (-\ln x) \, dx + \int_{1}^{e} \ln x \, dx \\
&= -x(\ln x - 1) \Big|_{\frac{1}{e}}^{1} + x(\ln x - 1) \Big|_{1}^{e} \\
&= 2 - \frac{2}{e}
\end{aligned}
$$

**评注**：含绝对值的定积分通用策略：找零点 → 以零点为界拆区间 → 各区间去绝对值 → 分别积分。

:::

:::example 例 15 · 分段函数与平移换元
设 $f(x) = \begin{cases} \dfrac{1}{1 + \cos x}, & -\pi < x < 0 \\ x e^{-x^{2}}, & x \ge 0 \end{cases}$，求 $\int_{1}^{4} f(x-2) \, dx$。

**思路**：先令 $t = x - 2$ 将积分区间平移到分段点对应位置，再按 $f(t)$ 的分段拆分。

**解**：令 $x - 2 = t$，$dx = dt$，$x: 1 \to 4$，$t: -1 \to 2$。

$$
\begin{aligned}
\int_{1}^{4} f(x-2) \, dx
&= \int_{-1}^{2} f(t) \, dt
= \int_{-1}^{0} \frac{1}{1 + \cos t} \, dt + \int_{0}^{2} t e^{-t^{2}} \, dt \\
&= \int_{-1}^{0} \sec^{2}\frac{t}{2} \, d\!\left(\frac{t}{2}\right) - \frac{1}{2} e^{-t^{2}} \Big|_{0}^{2} \\
&= \tan\frac{1}{2} - \frac{1}{2}e^{-4} + \frac{1}{2}
\end{aligned}
$$

**评注**：处理 $f(x \pm c)$ 型积分的标准做法：先做平移换元，将自变量还原为分段函数定义的形式。

:::

## 反常积分

至此讨论的定积分有两个默认前提：积分区间有限、被积函数有界。本节突破这两个限制——积分区间无穷、或被积函数在区间内无界——引入反常积分的概念与判敛方法。反常积分在概率统计（正态分布尾部）、物理（势能计算）中有大量应用。

### 无穷限的反常积分

#### 定义

此前所有定积分 $\int_{a}^{b} f(x)\,dx$ 都默认两个前提：积分区间 $[a,b]$ 是**有限**的、被积函数在区间上**有界**。现在逐一突破为**反常积分**。

**第一种——上限趋于 $+\infty$**：设 $f(x)$ 在 $[a, +\infty)$ 上连续。任取 $t > a$，先做定积分 $\int_{a}^{t} f(x)\,dx$，再令 $t \to +\infty$ 取极限：

$$
\int_{a}^{+\infty} f(x) \, dx = \lim_{t \to +\infty} \int_{a}^{t} f(x) \, dx
$$

若该极限存在，称反常积分**收敛**；否则称**发散**。

**第二种——下限趋于 $-\infty$**：对称地定义

$$
\int_{-\infty}^{b} f(x) \, dx = \lim_{t \to -\infty} \int_{t}^{b} f(x) \, dx
$$

**第三种——双向无穷 $(-\infty, +\infty)$**：拆分为两个反常积分之和

$$
\int_{-\infty}^{+\infty} f(x) \, dx = \int_{-\infty}^{0} f(x) \, dx + \int_{0}^{+\infty} f(x) \, dx
$$

> **关键**：右边**两个反常积分都收敛**时，左边才收敛；只要有一个发散，整体发散。拆分点不限于 $0$，任意有限点均可。

![无穷限反常积分：把上限推向 +∞ 时曲边梯形面积的极限](/notes-assets/hm5-04-improper-infinite-limit.jpg)

#### 广义牛莱公式

反常积分的计算同样可以借助原函数——只需把上下限代入时换为取极限：

$$
\begin{aligned}
\int_{a}^{+\infty} f(x) \, dx &= F(x) \Big|_{a}^{+\infty} = \lim_{x \to +\infty} F(x) - F(a) \\[6pt]
\int_{-\infty}^{b} f(x) \, dx &= F(x) \Big|_{-\infty}^{b} = F(b) - \lim_{x \to -\infty} F(x) \\[6pt]
\int_{-\infty}^{+\infty} f(x) \, dx &= F(x) \Big|_{-\infty}^{+\infty} = \lim_{x \to +\infty} F(x) - \lim_{x \to -\infty} F(x)
\end{aligned}
$$

> **注意**：使用广义牛莱公式的前提是 $F'(x) = f(x)$ 且反常积分收敛。形式上写成 $F(+\infty) - F(-\infty)$，但必须理解为两个独立极限的差——不能写成 $\lim_{x\to\infty}[F(x)-F(-x)]$（两个无穷大相减可能抵消出任何结果）。

:::example 例 1 · 最经典的无穷限反常积分
求 $\int_{-\infty}^{+\infty} \frac{1}{1 + x^{2}} \, dx$。

**思路**：原函数 $\arctan x$，利用 $\lim_{x\to+\infty}\arctan x = \frac{\pi}{2}$，$\lim_{x\to-\infty}\arctan x = -\frac{\pi}{2}$。

**解**：

$$
\int_{-\infty}^{+\infty} \frac{1}{1 + x^{2}} \, dx = \arctan x \Big|_{-\infty}^{+\infty} = \frac{\pi}{2} - \left(-\frac{\pi}{2}\right) = \pi
$$

**评注**：这是最经典的收敛反常积分——曲线下的"总面积"恰好为 $\pi$。

:::

:::example 例 2 · 分部积分配合广义极限
求 $\int_{0}^{+\infty} t e^{-pt} \, dt \quad (p > 0)$。

**思路**：分部积分，$\lim_{t\to+\infty} t e^{-pt} = 0$（指数衰减快于多项式增长）。

**解**：

$$
\begin{aligned}
\int_{0}^{+\infty} t e^{-pt} \, dt
&= -\frac{1}{p} \int_{0}^{+\infty} t \, d(e^{-pt})
= -\frac{1}{p} \left( t e^{-pt} \Big|_{0}^{+\infty} - \int_{0}^{+\infty} e^{-pt} \, dt \right) \\
&= -\frac{1}{p} \left( 0 - 0 - \left(-\frac{1}{p}\right) \right)
= \frac{1}{p^{2}}
\end{aligned}
$$

**评注**：$\lim_{t\to+\infty} t^{k}e^{-pt} = 0$（$p>0$，$k$ 任意）是处理含指数反常积分的核心极限。此题在概率论（指数分布的期望）中反复出现。

:::

:::example 例 3 · 无穷限 p 积分的敛散性
证明 $\int_{a}^{+\infty} \frac{dx}{x^{p}} \ (a > 0)$ 当 $p > 1$ 时收敛，当 $p \le 1$ 时发散。

**思路**：$p=1$ 单独处理（对数发散），$p \ne 1$ 用幂函数原函数，分析 $x^{1-p}$ 在 $+\infty$ 的极限。

**证明**：

- $p = 1$：$\int_{a}^{+\infty} \frac{1}{x} \, dx = \ln x \big|_{a}^{+\infty} = +\infty$，发散。
- $p \ne 1$：$\int_{a}^{+\infty} x^{-p} \, dx = \frac{1}{1-p} x^{1-p} \big|_{a}^{+\infty}$。
  - $p < 1$（$1-p > 0$）：$x^{1-p} \to +\infty$，发散。
  - $p > 1$（$1-p < 0$）：$x^{1-p} \to 0$，收敛于 $\frac{a^{1-p}}{p-1}$。

**结论**：$\int_{a}^{+\infty} \frac{dx}{x^{p}} \ (a > 0)$ **$p > 1$ 收敛，$p \le 1$ 发散。**

![无穷限 p 积分的几何理解：p 越大，曲线衰减越快，面积越容易收敛](/notes-assets/hm5-05-improper-p-integral.jpg)

**评注**：这是判敛的"标尺"——比较判别法的基础。记住：$\int_{1}^{+\infty} \frac{1}{x}\,dx$ 发散（尽管 $\frac{1}{x} \to 0$），$\int_{1}^{+\infty} \frac{1}{x^{2}}\,dx$ 收敛。

:::

### 瑕积分

#### 瑕点与瑕积分

5.4.1 突破了"区间有限"的前提，本节突破第二个前提——**被积函数有界**。

如果 $f(x)$ 在点 $a$ 的任一邻域内都无界，则称 $a$ 为 $f(x)$ 的**瑕点**（也称无界间断点）。典型例子：$\frac{1}{x}$ 在 $x=0$ 处、$\frac{1}{\sqrt{a^{2}-x^{2}}}$ 在 $x=a$ 处。

瑕积分同样按瑕点位置分三种情形定义：

**第一种——瑕点在左端点 $a$**：$f(x)$ 在 $(a, b]$ 上连续，$a$ 为瑕点。任取 $t > a$，先做定积分 $\int_{t}^{b} f(x)\,dx$，再令 $t \to a^{+}$ 取极限：

$$
\int_{a}^{b} f(x) \, dx = \lim_{t \to a^{+}} \int_{t}^{b} f(x) \, dx
$$

若该极限存在，称瑕积分**收敛**；否则称**发散**。

**第二种——瑕点在右端点 $b$**：对称地定义

$$
\int_{a}^{b} f(x) \, dx = \lim_{t \to b^{-}} \int_{a}^{t} f(x) \, dx
$$

**第三种——瑕点在区间内部 $c \in (a, b)$**：以 $c$ 为界拆分为两个瑕积分之和

$$
\int_{a}^{b} f(x) \, dx = \int_{a}^{c} f(x) \, dx + \int_{c}^{b} f(x) \, dx
$$

> **关键**：右边**两个瑕积分都收敛**时，左边才收敛；只要有一个发散，整体发散。这与双向无穷限反常积分的处理逻辑完全一致。

![瑕积分：被积函数在瑕点处无界，积分要取单侧极限](/notes-assets/hm5-06-improper-discontinuity.jpg)

#### 瑕积分的牛莱公式

与无穷限类似——只需把瑕点处的函数值换为单侧极限：

$$
\begin{aligned}
a \text{ 为瑕点：} \quad \int_{a}^{b} f(x) \, dx &= F(x) \Big|_{a}^{b} = F(b) - F(a^{+}) = F(b) - \lim_{x \to a^{+}} F(x) \\[6pt]
b \text{ 为瑕点：} \quad \int_{a}^{b} f(x) \, dx &= F(x) \Big|_{a}^{b} = F(b^{-}) - F(a) = \lim_{x \to b^{-}} F(x) - F(a)
\end{aligned}
$$

> **注意**：瑕积分**看起来和普通定积分一模一样**（积分号都是 $\int_{a}^{b}$），所以更容易被忽略。计算 $\int_{a}^{b} f(x)\,dx$ 之前，务必检查 $f(x)$ 在 $[a,b]$ 内是否有瑕点——这是本节最重要的习惯。

:::example 例 4 · 瑕点在上限的瑕积分
求 $\int_{0}^{a} \frac{1}{\sqrt{a^{2} - x^{2}}} \, dx \quad (a > 0)$。

**思路**：$x = a$ 是瑕点（分母为零）。用牛莱公式时上限定为 $a^{-}$。

**解**：$a$ 为 $\frac{1}{\sqrt{a^{2} - x^{2}}}$ 的瑕点。

$$
\int_{0}^{a} \frac{1}{\sqrt{a^{2} - x^{2}}} \, dx = \arcsin\frac{x}{a} \Big|_{0}^{a} = \lim_{x \to a^{-}} \arcsin\frac{x}{a} - 0 = \frac{\pi}{2}
$$

**评注**：虽然答案是 $\frac{\pi}{2}$，但必须意识到 $x = a$ 是瑕点——直接代入 $x = a$ 得到 $\arcsin 1 = \frac{\pi}{2}$ 碰巧正确，但思想上是取极限的结果。

:::

:::example 例 5 · 不能直接用牛莱公式的经典错误
求 $\int_{-1}^{1} \frac{1}{x^{2}} \, dx$。

**思路**：$x = 0$ 是瑕点，不能直接用牛莱公式 $-\frac{1}{x}|_{-1}^{1} = -2$！

**常见错误**：$\int_{-1}^{1} \frac{1}{x^{2}} \, dx = -\frac{1}{x} \Big|_{-1}^{1} = -2$（✗）

**正确解法**：以瑕点 $x = 0$ 为界拆分：

$$
\int_{-1}^{1} \frac{1}{x^{2}} \, dx = \int_{-1}^{0} \frac{1}{x^{2}} \, dx + \int_{0}^{1} \frac{1}{x^{2}} \, dx
$$

其中 $\int_{0}^{1} \frac{1}{x^{2}} \, dx = \lim_{t \to 0^{+}} \left(-\frac{1}{x}\right) \Big|_{t}^{1} = +\infty$，发散。

$$
\Rightarrow \int_{-1}^{1} \frac{1}{x^{2}} \, dx \text{ 发散}
$$

**评注**：这是瑕积分最常见的错误——没识别出瑕点就直接套牛莱公式。$\frac{1}{x^{2}}$ 是偶函数，但瑕积分不能直接用"偶倍奇零"！必须先判断敛散性。

:::

:::example 例 6 · 瑕积分 q 积分的一般形式
证明 $\displaystyle\int_{a}^{b} \frac{dx}{(x - a)^{q}}$ 当 $0 < q < 1$ 时收敛，当 $q \ge 1$ 时发散。

**思路**：左端点 $a$ 是瑕点。$q = 1$ 时对数发散，$q \ne 1$ 时分析 $(x-a)^{1-q}$ 在 $a^{+}$ 的极限。

**证明**：

- $q = 1$：$\int_{a}^{b} \frac{dx}{x-a} = \ln(x-a) \big|_{a}^{b} = \ln(b-a) - \lim_{x \to a^{+}} \ln(x-a) = +\infty$，发散。
- $q \ne 1$：$\int_{a}^{b} (x-a)^{-q} \, dx = \frac{1}{1-q} (x-a)^{1-q} \big|_{a}^{b}$。
  - $0 < q < 1$（$1-q > 0$）：$(x-a)^{1-q} \to 0$（当 $x \to a^{+}$），收敛于 $\frac{(b-a)^{1-q}}{1-q}$。
  - $q > 1$（$1-q < 0$）：$(x-a)^{1-q} \to +\infty$（当 $x \to a^{+}$），发散。

**结论**：$\int_{a}^{b} \frac{dx}{(x-a)^{q}}$ **$0 < q < 1$ 收敛，$q \ge 1$ 发散。**

**评注**：这是瑕积分 $p$-判敛的**一般形式**（左端点为瑕点）。$a=0$ 时就是下面的特例。与无穷限的 $\int_{a}^{+\infty} \frac{1}{x^{p}}\,dx$（$p>1$ 收敛）对比——瑕积分恰好"反过来"：**指数越小越收敛**（$0<q<1$），因为 $x \to a$ 时 $(x-a)^{-q}$ 的奇异性随 $q$ 增大而增强。

:::

:::example 例 7 · 瑕积分 p 积分的特例
讨论 $\int_{0}^{1} \frac{1}{x^{p}} \, dx \ (p > 0)$ 的收敛性。

**思路**：$x = 0$ 是瑕点。$p = 1$ 时对数发散，$p \ne 1$ 时分析 $x^{1-p}$ 在 $0^{+}$ 的极限。

**解**：

- $p = 1$：$\int_{0}^{1} \frac{1}{x} \, dx = \ln x \big|_{0}^{1} = +\infty$，发散。
- $p \ne 1$：$\int_{0}^{1} x^{-p} \, dx = \frac{1}{1-p} x^{1-p} \big|_{0}^{1}$。
  - $p > 1$（$1-p < 0$）：$x^{1-p} \to +\infty$（当 $x \to 0^{+}$），发散。
  - $0 < p < 1$（$1-p > 0$）：$x^{1-p} \to 0$（当 $x \to 0^{+}$），收敛于 $\frac{1}{1-p}$。

**结论**：$\int_{0}^{1} \frac{1}{x^{p}} \, dx \ (p > 0)$ **$0 < p < 1$ 收敛，$p \ge 1$ 发散。**

**评注**：与无穷限 $p$-积分对照记忆：

| 类型 | $\int_{a}^{+\infty} \frac{1}{x^{p}}\,dx$ | $\int_{0}^{a} \frac{1}{x^{p}}\,dx$ |
| :--- | :--- | :--- |
| 收敛 | $p > 1$ | $0 < p < 1$ |
| 发散 | $p \le 1$ | $p \ge 1$ |

无穷限"大指数收敛"；瑕积分"小指数收敛"——恰好相反。

:::

## 定积分在几何学上的应用

本章最后将定积分用于几何：面积、体积、弧长。核心思想是将几何量表示为"微元"的积分——面积微元 $dS$、体积微元 $dV$、弧长微元 $ds$——再用定积分求和。相比记忆公式，理解微元法的选取逻辑（沿 $x$ 还是 $y$ 积分？用圆盘还是柱壳？）更为重要。

**微元法**是贯穿本节以及诸多物理学连续分布相关的理论的统一方法论。它的思想直接来自定积分的定义——黎曼和的极限——但反过来使用：

> **从"分割求和"到"微元积分"**

定积分的定义是：分割 $\to$ 近似 $\to$ 求和 $\to$ 取极限。微元法是这个过程的**逆向工程**——当我们要求一个连续分布的量 $Q$（面积、体积、弧长、功、质量……）时：

| 步骤 | 操作 | 说明 |
| :--- | :--- | :--- |
| **① 选坐标系** | 确定积分变量 $x$（或 $y$、$t$、$\theta$） | 根据几何对称性选择最简方向 |
| **② 取微元** | 在 $[x, x+dx]$ 上写出 $dQ = f(x)\,dx$ | 核心步骤——"局部近似"：在无穷小段内以直代曲、以不变代变 |
| **③ 定区间** | 确定积分上下限 $a, b$ | 微元覆盖整个对象 |
| **④ 求积分** | $Q = \int_{a}^{b} dQ = \int_{a}^{b} f(x)\,dx$ | 用牛莱公式计算 |

> **微元法的本质**

定积分定义是"先求和再取极限"（$\lim\sum f(\xi_i)\Delta x_i$），微元法是"先取极限再求和"（$\int f(x)\,dx$）。两者等价，但微元法在实际应用中高效得多——我们不再需要显式地写出黎曼和，而是直接在无穷小尺度上写出 $dQ$ 的表达式，然后积分。

> **为什么物理里无处不在？**

物理中凡是涉及"连续分布"的计算都依赖微元法：求变力做功（$dW = F\,dx$）、求电荷电场（$dE = \frac{k\,dq}{r^2}$）、求转动惯量（$dI = r^2\,dm$）……这些公式本质上都是"先写微元 $dQ$，再积分 $\int dQ$"。本节在纯几何背景下掌握微元法，后续物理中用起来就会觉得自然而然。

> **本节各小节的微元一览**

| 几何量 | 微元 | 积分公式 |
| :--- | :--- | :--- |
| 面积（X 型） | $dS = \lvert f(x)-g(x)\rvert\,dx$ | $S = \int_{a}^{b} dS$ |
| 面积（极坐标） | $dS = \frac{1}{2}\rho^{2}(\theta)\,d\theta$ | $S = \int_{\alpha}^{\beta} dS$ |
| 体积（圆盘法） | $dV = \pi [f(x)]^{2}\,dx$ | $V = \int_{a}^{b} dV$ |
| 体积（柱壳法） | $dV = 2\pi x\lvert f(x)\rvert\,dx$ | $V = \int_{a}^{b} dV$ |
| 弧长 | $ds = \sqrt{(dx)^{2}+(dy)^{2}}$ | $s = \int ds$ |

> **常见错误**：跳过微元直接套公式。遇到非标准图形（旋转轴不是坐标轴、截面不是圆等）时，只有从微元出发才能正确列式。微元法比公式更重要——公式忘了可以推，微元思想丢了寸步难行。

### 平面图形的面积计算

#### X 型区域

曲线 $y = f(x)$，$y = g(x)$ 及直线 $x = a$，$x = b$（$a < b$）所围面积：

$$
S = \int_{a}^{b} \lvert f(x) - g(x) \rvert \, dx
$$

![X 型区域：用上曲边减下曲边作被积函数](/notes-assets/hm5-07-x-type-region-area.jpg)

**总结**：以上、下曲边的函数差作被积函数，该分割时就分割。

#### Y 型区域

曲线 $x = \varphi(y)$，$x = \psi(y)$ 及直线 $y = c$，$y = d$（$c < d$）所围面积：

$$
S = \int_{c}^{d} \lvert \varphi(y) - \psi(y) \rvert \, dy
$$

![Y 型区域：由左右两条曲边和两条水平直线围成](/notes-assets/hm5-08-y-type-region.jpg)

![Y 型区域的面积计算：用右曲边减左曲边](/notes-assets/hm5-09-y-type-region-area.jpg)

**总结**：以右、左曲边的函数差作被积函数。

#### 计算步骤

1. 画出区域，确定交点坐标
2. 选择区域类型（优先 X 型；若需分割，考虑换 Y 型）
3. 确定上下（或左右）曲边，列积分式

> **注意**：有时 Y 型比 X 型简洁很多——选对类型可以避免拆分区间。

:::example 例 1 · X 型与 Y 型两种算法对比
计算 $y^{2} = 2x$ 与 $y = x - 4$ 所围图形的面积。

**思路**：求交点 → 分别用 X 型和 Y 型两种方法计算，体会 Y 型在此题中的优势（无需拆分区间）。

**解**：解方程组 $\begin{cases} y^{2} = 2x \\ y = x - 4 \end{cases}$ 得交点 $(2, -2)$ 和 $(8, 4)$。

![例 1 的图形：y²=2x 与直线 y=x-4 所围区域](/notes-assets/hm5-10-area-example-two-curves.jpg)

**法一（X 型·需拆分为两段）**：

$$
\begin{aligned}
S &= \int_{0}^{2} [\sqrt{2x} - (-\sqrt{2x})] \, dx + \int_{2}^{8} [\sqrt{2x} - (x - 4)] \, dx \\
&= 2\sqrt{2} \cdot \frac{2}{3} x^{\frac{3}{2}} \Big|_{0}^{2} + \left( \sqrt{2} \cdot \frac{2}{3} x^{\frac{3}{2}} - \frac{1}{2}x^{2} + 4x \right) \Big|_{2}^{8} \\
&= \frac{16}{3} + \frac{38}{3} = 18
\end{aligned}
$$

**法二（Y 型·无需拆分）**：$x = y + 4$，$x = \frac{1}{2}y^{2}$。

$$
\begin{aligned}
S &= \int_{-2}^{4} \left( y + 4 - \frac{1}{2} y^{2} \right) dy \\
&= \left( \frac{1}{2} y^{2} + 4y - \frac{1}{6} y^{3} \right) \Big|_{-2}^{4}
= \frac{40}{3} - \left(-\frac{14}{3}\right) = 18
\end{aligned}
$$

**评注**：X 型需要分段（左半 $[0,2]$ 上边是 $\sqrt{2x}$、下边是 $-\sqrt{2x}$；右半 $[2,8]$ 上边是 $\sqrt{2x}$、下边是 $x-4$），而 Y 型只需一个积分。选择积分方向的黄金法则：**尽量让左右曲边由同一个函数对给出，避免拆分区间。**

:::

#### 参数方程情形

设曲线 $C: \begin{cases} x = x(t) \\ y = y(t) \end{cases}$（$\alpha \le t \le \beta$），则由该曲线、$x(\alpha) = a$，$x(\beta) = b$ 以及 $x$ 轴围成的平面图形的面积为

$$
S = \int_{\alpha}^{\beta} y(t) x'(t) \, dt
$$

:::example 例 2 · 参数方程求摆线一拱的面积
求摆线 $\begin{cases} x = a(t - \sin t) \\ y = a(1 - \cos t) \end{cases} (a > 0)$ 的一拱与 $x$ 轴所围面积。

**思路**：参数方程下 $S = \int y(t)\,x'(t)\,dt$，摆线一拱对应 $t \in [0, 2\pi]$。注意到 $x'(t) = a(1-\cos t) = y(t)$，被积函数简化为 $y^{2}(t)$。

**解**：

![摆线 x=a(t-sin t)、y=a(1-cos t) 的一拱](/notes-assets/hm5-11-cycloid-graph.jpg)

$$
\begin{aligned}
S &= \int_{0}^{2\pi} y(t) \cdot x'(t) \, dt \\
&= \int_{0}^{2\pi} a(1 - \cos t) \cdot a(1 - \cos t) \, dt \\
&= a^{2} \int_{0}^{2\pi} (1 - 2\cos t + \cos^{2} t) \, dt \\
&= a^{2} \left( 2\pi - 0 + 4 \int_{0}^{\frac{\pi}{2}} \cos^{2} t \, dt \right) \\
&= a^{2} \left( 2\pi + 4 \cdot \frac{1}{2} \cdot \frac{\pi}{2} \right) = 3\pi a^{2}
\end{aligned}
$$

**评注**：摆线一拱面积 $= 3\pi a^{2}$（正好是生成圆面积的 3 倍），这是一个经典结果。参数方程面积公式本质是换元：$dx = x'(t)\,dt$。

:::

#### 极坐标情形

**极坐标的基本概念**：

在平面上取定一点 $O$（**极点**），从 $O$ 引一条射线 $OA$（**极轴**），再选定长度单位和角的正方向（通常取逆时针）。平面上任意一点 $M$ 的位置用两个数表示：

- **极径** $\rho = \lvert OM\rvert$（$\rho \ge 0$）：点到极点的距离
- **极角** $\theta = \angle AOM$（$0 \le \theta < 2\pi$）：极轴逆时针转到 $OM$ 的角度

有序数对 $(\rho, \theta)$ 称为点 $M$ 的**极坐标**。

![极坐标系：极点、极轴、极径 ρ 与极角 θ](/notes-assets/hm5-12-polar-coordinates.jpg)

**极坐标与直角坐标的互化**：

$$
\begin{aligned}
\text{极} \to \text{直：}&\quad x = \rho \cos \theta,\quad y = \rho \sin \theta \\[4pt]
\text{直} \to \text{极：}&\quad \rho^{2} = x^{2} + y^{2},\quad \tan \theta = \frac{y}{x}\;(x \ne 0)
\end{aligned}
$$

> 例如：直角坐标 $(1, 1)$ 对应的极坐标为 $(\sqrt{2}, \frac{\pi}{4})$。

**极坐标下的面积公式**——曲边扇形：

曲线 $\rho = \rho(\theta)$ 与射线 $\theta = \alpha$，$\theta = \beta$（$\alpha < \beta$）所围面积为：

$$
S = \int_{\alpha}^{\beta} \frac{1}{2} \rho^{2}(\theta) \, d\theta
$$

![曲边扇形的面积：ρ=ρ(θ) 与两条射线围成的区域](/notes-assets/hm5-13-polar-area-sector.jpg)

微元解释：取 $[\theta, \theta+d\theta]$ 上的小扇形，面积 $dS = \frac{1}{2}\rho^{2}(\theta)\,d\theta$（类比扇形面积 $S_{\text{扇}} = \frac{1}{2}r^{2}\theta$），积分即得。

同样地，曲线 $\rho = \rho_{1}(\theta)$，$\rho = \rho_{2}(\theta)$ 及射线 $\theta = \alpha$，$\theta = \beta$ $(\alpha < \beta)$ 所围成的平面图形面积为：

$$
S = \int_{\alpha}^{\beta} \frac{1}{2} [\rho_{1}^{2}(\theta) - \rho_{2}^{2}(\theta)] \, d\theta
$$

![两条极坐标曲线之间的面积](/notes-assets/hm5-14-polar-area-between-curves.jpg)

:::example 例 3 · 极坐标求心形线面积
计算 $\rho = a(1 + \cos \theta)\ (a > 0)$ 所围图形的面积。

**思路**：利用对称性（关于极轴对称），只需算 $[0, \pi]$ 再乘 2。

**解**：

![心形线 ρ=a(1+cosθ) 的图形](/notes-assets/hm5-15-cardioid-graph.jpg)

$$
\begin{aligned}
S &= 2 \cdot \frac{1}{2} \int_{0}^{\pi} \rho^{2}(\theta) \, d\theta
= \int_{0}^{\pi} a^{2} (1 + \cos \theta)^{2} \, d\theta \\
&= a^{2} \int_{0}^{\pi} \left(1 + 2\cos\theta + \cos^{2}\theta\right) d\theta \\
&= a^{2} \left( \pi + 0 + 2 \cdot \frac{1}{2} \cdot \frac{\pi}{2} \right)
= \frac{3}{2} \pi a^{2}
\end{aligned}
$$

**评注**：极坐标面积公式 $\frac{1}{2}\int \rho^{2}\,d\theta$ 中的 $\frac{1}{2}$ 容易忘。记忆方法：类比扇形面积 $S = \frac{1}{2} r^{2} \theta$，此处 $\rho^{2}d\theta$ 是其微分形式。

:::

### 体积计算

#### 平行截面面积已知的立体体积

体积计算的**一般原理**——不仅适用于旋转体，适用于任何截面面积已知的立体。

在区间 $[a, b]$ 上，用一个垂直于 $x$ 轴的平面去截立体 $\Omega$，截面面积是 $x$ 的连续函数 $A(x)$。取微元 $[x, x+dx]$，这一薄片的体积近似为 $dV = A(x)\,dx$，积分即得：

$$
V = \int_{a}^{b} A(x) \, dx
$$

![平行截面法：截面面积 A(x) 已知的立体](/notes-assets/hm5-16-parallel-cross-section.jpg)

> 这是体积计算的"母公式"——后面所有旋转体公式（圆盘、柱壳）都是它的特例。关键是针对具体几何体找出 $A(x)$ 的表达式。

:::example 例 4 · 平行截面法求非旋转体体积
一平面经过半径为 $R$ 的圆柱体的底圆中心，并与底面交成角 $\alpha$，计算该平面截圆柱体所得立体的体积。

**思路**：这不是旋转体，无法套圆盘/柱壳公式。必须回到平行截面法：选好截面方向，求出 $A(x)$ 或 $A(y)$。两种切法殊途同归。

![例 4 的立体：平面斜截圆柱体所得图形](/notes-assets/hm5-17-cylinder-cut-volume.jpg)

**法一（垂直于 $x$ 轴切——截面为直角三角形）**：

在 $x$ 处，圆柱截口为宽 $2y = 2\sqrt{R^{2}-x^{2}}$ 的矩形，斜面夹角 $\alpha$ 使截面成为直角三角形，面积 $A(x) = \frac{1}{2} \cdot (2y) \cdot (y\tan\alpha) = y^{2}\tan\alpha$。

$$
V = \int_{-R}^{R} \frac{1}{2} y^{2} \tan\alpha \, dx
= \tan\alpha \int_{-R}^{R} \frac{1}{2}(R^{2} - x^{2}) \, dx
= \frac{2}{3} R^{3} \tan\alpha
$$

**法二（垂直于 $y$ 轴切——截面为矩形）**：

在 $y$ 处，截面为宽 $2x = 2\sqrt{R^{2}-y^{2}}$、高 $y\tan\alpha$ 的矩形，面积 $A(y) = 2x \cdot y\tan\alpha$。

$$
V = \int_{0}^{R} 2x \cdot y \tan\alpha \, dy
= 2\tan\alpha \int_{0}^{R} y\sqrt{R^{2} - y^{2}} \, dy
= \frac{2}{3} R^{3} \tan\alpha
$$

**评注**：这题的核心教训——**不是所有立体都是旋转出来的**。遇到非旋转体，唯一的出路就是平行截面法：选好截面方向，用几何关系写出 $A(x)$ 或 $A(y)$，再积分。两种切法结果一致，选积分表达式更简单的一方。

:::

#### 旋转体的体积——圆盘法

旋转体的核心特征：**横截面都是圆**。因此 $A(x) = \pi r^{2}$，其中半径 $r$ 取决于旋转曲线到转轴的距离。

**(1) X 型区域绕 $x$ 轴**

曲线 $y = f(x)$（$a \le x \le b$）与 $x$ 轴围成的区域绕 $x$ 轴旋转。在 $x$ 处作垂直于 $x$ 轴的截面，得到半径为 $\lvert f(x)\rvert$ 的圆：

$$
A(x) = \pi [f(x)]^{2} \quad \Rightarrow \quad V_{x} = \pi \int_{a}^{b} f^{2}(x) \, dx
$$

![X 型区域绕 x 轴旋转：截面是半径为 |f(x)| 的圆](/notes-assets/hm5-18-solid-x-type-region.jpg)

**(2) Y 型区域绕 $y$ 轴**

曲线 $x = \varphi(y)$（$c \le y \le d$）与 $y$ 轴围成的区域绕 $y$ 轴旋转。在 $y$ 处截面半径为 $\lvert\varphi(y)\rvert$：

$$
V_{y} = \pi \int_{c}^{d} \varphi^{2}(y) \, dy
$$

![Y 型区域绕 y 轴旋转：截面是半径为 |φ(y)| 的圆](/notes-assets/hm5-19-solid-y-type-region.jpg)

**(3) 环形区域**（两条曲线之间的区域旋转）

上曲线 $y = f_{1}(x)$、下曲线 $y = f_{2}(x)$ 与 $x = a, x = b$ 围成区域绕 $x$ 轴旋转。截面是一个**圆环**——外径 $f_{1}(x)$，内径 $f_{2}(x)$：

$$
A(x) = \pi [f_{1}^{2}(x) - f_{2}^{2}(x)] \quad \Rightarrow \quad V = \pi \int_{a}^{b} [f_{1}^{2}(x) - f_{2}^{2}(x)] \, dx
$$

![环形区域绕 x 轴旋转：截面是一个圆环](/notes-assets/hm5-20-solid-ring-region.jpg)

本质：大旋转体减去小旋转体。

#### 旋转体的体积——柱壳法

当旋转轴**不是**积分变量的轴时，用圆盘法需要换元、反函数，有时非常麻烦。柱壳法提供了另一种思路。

**X 型区域 $y = f(x)$ 绕 $y$ 轴旋转**：在 $x$ 处取宽 $dx$ 的窄条，它绕 $y$ 轴旋转形成的是一个**柱壳**（圆柱面），展开后为长 $2\pi x$、高 $\lvert f(x)\rvert$、厚 $dx$ 的薄片：

$$
dV = 2\pi x \cdot \lvert f(x)\rvert \cdot dx \quad \Rightarrow \quad V_{y} = 2\pi \int_{a}^{b} x \lvert f(x)\rvert \, dx
$$

![柱壳法：绕 y 轴旋转时取薄柱壳作体积微元](/notes-assets/hm5-21-shell-method.jpg)

同理，**Y 型区域 $x = \varphi(y)$ 绕 $x$ 轴**：

$$
V_{x} = 2\pi \int_{c}^{d} y \lvert\varphi(y)\rvert \, dy
$$

**圆盘法 vs 柱壳法——如何选择？**

| 对比项 | 圆盘法 | 柱壳法 |
| :--- | :--- | :--- |
| 微元形状 | 薄圆盘（截面法） | 薄柱壳 |
| 适用场景 | 旋转轴 **=** 积分变量轴 | 旋转轴 **≠** 积分变量轴 |
| 绕 $x$ 轴 | $\displaystyle \pi \int y^{2}\,dx$（用 $dx$） | $\displaystyle 2\pi \int y\lvert x\rvert\,dy$（用 $dy$） |
| 绕 $y$ 轴 | $\displaystyle \pi \int x^{2}\,dy$（用 $dy$） | $\displaystyle 2\pi \int x\lvert y\rvert\,dx$（用 $dx$） |
| 口诀 | 切片求体积 | 剥壳求体积 |

> **选择原则**：积分变量应与旋转轴**不同轴**时优先用柱壳法（避免反函数）；环形区域优先用圆盘法（截面就是圆环）。

:::example 例 5 · 圆环体的体积
求圆 $x^{2} + (y - b)^{2} = a^{2}$ 绕 $x$ 轴旋转形成的旋转体体积。

**思路**：这是圆环体（torus）。右侧半边 $y_{1} = b + \sqrt{a^{2} - x^{2}}$，左侧半边 $y_{2} = b - \sqrt{a^{2} - x^{2}}$。环形区域公式：$V = \pi \int (y_{1}^{2} - y_{2}^{2})\,dx$。

**解**：

$$
\begin{aligned}
V &= \int_{-a}^{a} \pi \left[ (b + \sqrt{a^{2} - x^{2}})^{2} - (b - \sqrt{a^{2} - x^{2}})^{2} \right] dx \\
&= \int_{-a}^{a} \pi (4b\sqrt{a^{2} - x^{2}}) \, dx \\
&= 4\pi b \cdot \frac{1}{2} \pi a^{2} = 2\pi^{2} a^{2} b
\end{aligned}
$$

**评注**：$(y_{1}^{2} - y_{2}^{2}) = (y_{1} - y_{2})(y_{1} + y_{2})$，展开后交叉项恰好消去。环形旋转体体积的本质是大旋转体减去小旋转体。

:::

:::example 例 6 · 参数方程求摆线旋转体体积
求摆线 $\begin{cases} x = a(t - \sin t) \\ y = a(1 - \cos t) \end{cases}$ 绕 $x$ 轴旋转形成的体积。

**思路**：参数方程下 $V_{x} = \pi \int_{0}^{2\pi a} y^{2}\,dx = \pi \int_{0}^{2\pi} y^{2}(t) \cdot x'(t)\,dt$。

**解**：

$$
x'(t) = a(1 - \cos t) = y(t)
$$

$$
\begin{aligned}
V_{x} &= \pi \int_{0}^{2\pi} a^{2}(1 - \cos t)^{2} \cdot a(1 - \cos t) \, dt \\
&= \pi a^{3} \int_{0}^{2\pi} (1 - \cos t)^{3} \, dt = 5\pi^{2} a^{3}
\end{aligned}
$$

**评注**：参数方程体积公式 $V_{x} = \pi \int y^{2}(t)\,x'(t)\,dt$——本质是换元 $dx = x'(t)dt$。这里 $x'(t) = a(1-\cos t) = y(t)$ 使被积函数简化为 $y^{3}(t)$。

:::

:::example 例 7 · 圆盘法与柱壳法反求参数
设 $D$ 由 $y = x^{\frac{1}{3}}$、$x = a\ (a > 0)$ 及 $x$ 轴围成，$V_{x}, V_{y}$ 分别是 $D$ 绕 $x$ 轴和 $y$ 轴旋转所得体积，若 $V_{y} = 10V_{x}$，求 $a$。

**思路**：分别用圆盘法（$V_{x}$）和柱壳法（$V_{y}$）表示体积，代入条件解 $a$。

**解**：

$$
V_{x} = \pi \int_{0}^{a} (x^{\frac{1}{3}})^{2} \, dx = \pi \int_{0}^{a} x^{\frac{2}{3}} \, dx = \frac{3}{5}\pi a^{\frac{5}{3}}
$$

$$
V_{y} = 2\pi \int_{0}^{a} x \cdot x^{\frac{1}{3}} \, dx = 2\pi \int_{0}^{a} x^{\frac{4}{3}} \, dx = \frac{6}{7}\pi a^{\frac{7}{3}}
$$

$$
V_{y} = 10V_{x} \Rightarrow \frac{6}{7}\pi a^{\frac{7}{3}} = 10 \cdot \frac{3}{5}\pi a^{\frac{5}{3}} \Rightarrow \frac{6}{7}a^{\frac{7}{3}} = 6a^{\frac{5}{3}} \Rightarrow a^{\frac{2}{3}} = 7 \Rightarrow a = 7^{\frac{3}{2}}
$$

**评注**：绕 $x$ 轴用圆盘法（$\pi y^{2}dx$），绕 $y$ 轴用柱壳法（$2\pi x y\,dx$）——因为旋转轴与积分变量不同轴。

:::

### 平面曲线的弧长计算

#### 弧长微元

求曲线的弧长，本质是求一条"弯曲的线"拉直后有多长。微元法的思路是：在无穷小段上，弧长近似等于弦长。

取曲线上相邻两点 $(x, y)$ 和 $(x+dx, y+dy)$，连接它们的弦长为（勾股定理）：

$$
ds = \sqrt{(dx)^{2} + (dy)^{2}}
$$

![弧长微元：无穷小段上以弦长代替弧长](/notes-assets/hm5-22-arc-length-element.jpg)

这就是**弧长微元**。所有弧长公式都是 $ds$ 在不同坐标系下的具体表达式——积分即得总弧长：

$$
s = \int ds
$$

#### 参数方程情形

曲线 $\begin{cases} x = \varphi(t) \\ y = \psi(t) \end{cases}$（$\alpha \le t \le \beta$），$\varphi(t), \psi(t)$ 有一阶连续导数。

由 $dx = \varphi'(t)\,dt$，$dy = \psi'(t)\,dt$ 代入弧长微元：

$$
ds = \sqrt{[\varphi'(t)]^{2} + [\psi'(t)]^{2}} \, dt
$$

$$
\Rightarrow \quad s = \int_{\alpha}^{\beta} \sqrt{[\varphi'(t)]^{2} + [\psi'(t)]^{2}} \, dt
$$

#### 直角坐标情形

$y = f(x)$（$a \le x \le b$）。这是参数方程的特例——把 $x$ 自身作为参数：

$$
\begin{cases} x = x \\ y = f(x) \end{cases} \quad \Rightarrow \quad \varphi'(x) = 1,\; \psi'(x) = f'(x)
$$

$$
\Rightarrow \quad ds = \sqrt{1 + [f'(x)]^{2}} \, dx \qquad s = \int_{a}^{b} \sqrt{1 + [f'(x)]^{2}} \, dx
$$

#### 极坐标情形

$\rho = \rho(\theta)$（$\alpha \le \theta \le \beta$）。将极坐标**参数化**——以 $\theta$ 为参数：

$$
\begin{cases} x = \rho(\theta) \cos \theta \\ y = \rho(\theta) \sin \theta \end{cases}
$$

求导并代入 $ds = \sqrt{(x')^{2} + (y')^{2}}\,d\theta$，化简后得到：

$$
ds = \sqrt{\rho^{2}(\theta) + [\rho'(\theta)]^{2}} \, d\theta
$$

$$
\Rightarrow \quad s = \int_{\alpha}^{\beta} \sqrt{\rho^{2}(\theta) + [\rho'(\theta)]^{2}} \, d\theta
$$

> **记忆方法**：三种坐标系下弧长公式都源于同一个微元 $ds = \sqrt{dx^{2} + dy^{2}}$。参数方程是"母式"，直角坐标和极坐标都是它的特例。

:::example 例 8 · 参数方程求摆线一拱的弧长
计算摆线 $\begin{cases} x = a(t - \sin t) \\ y = a(1 - \cos t) \end{cases}$ $(0 \le t \le 2\pi)$ 一拱的长度。

**思路**：先算 $\sqrt{(x')^{2} + (y')^{2}}$，化简后用半角公式去根号。

**解**：$x'(t) = a(1 - \cos t)$，$y'(t) = a\sin t$。

$$
\begin{aligned}
s &= \int_{0}^{2\pi} \sqrt{a^{2}(1 - \cos t)^{2} + a^{2} \sin^{2} t} \, dt \\
&= a \int_{0}^{2\pi} \sqrt{2 - 2\cos t} \, dt
= a \int_{0}^{2\pi} \sqrt{4\sin^{2}\frac{t}{2}} \, dt \\
&= 2a \int_{0}^{2\pi} \left\lvert\sin\frac{t}{2}\right\rvert \, dt
= 4a \int_{0}^{\pi} \sin u \, du = 8a
\end{aligned}
$$

**评注**：弧长计算的核心技巧：$\sqrt{2 - 2\cos t} = 2\lvert\sin\frac{t}{2}\rvert$，$1 - \cos t = 2\sin^{2}\frac{t}{2}$。三角恒等式在半角/倍角化简中不可或缺。

:::

:::example 例 9 · 极坐标求心形线的弧长
求心形线 $\rho = a(1 + \cos \theta)$ 的弧长。

**思路**：心形线关于极轴对称，算出 $[0,\pi]$ 乘 2。极坐标弧长公式 $\sqrt{\rho^{2} + (\rho')^{2}}$。

**解**：$\rho'(\theta) = -a\sin\theta$。

$$
\begin{aligned}
s &= 2 \int_{0}^{\pi} \sqrt{a^{2}(1 + \cos\theta)^{2} + a^{2}\sin^{2}\theta} \, d\theta \\
&= 2a \int_{0}^{\pi} \sqrt{2 + 2\cos\theta} \, d\theta
= 2a \int_{0}^{\pi} \sqrt{4\cos^{2}\frac{\theta}{2}} \, d\theta \\
&= 4a \int_{0}^{\pi} \left\lvert\cos\frac{\theta}{2}\right\rvert \, d\theta
= 8a \sin\frac{\theta}{2} \Big|_{0}^{\pi} = 8a
\end{aligned}
$$

**评注**：$\sqrt{2+2\cos\theta} = 2\lvert\cos\frac{\theta}{2}\rvert$（注意正负号，恰好 $[0,\pi]$ 上半角 $\frac{\theta}{2} \in [0,\frac{\pi}{2}]$，$\cos\frac{\theta}{2} \ge 0$）。心形线的总面积 $\frac{3}{2}\pi a^{2}$ 和总弧长 $8a$ 是两个经典结果。

:::

## 小结

1. **定积分**是黎曼和的极限 $\int_{a}^{b} f(x)\,dx=\lim_{\lambda\to 0}\sum f(\xi_{i})\Delta x_{i}$，与区间分法和 $\xi_{i}$ 的取法无关，只与被积函数、积分区间有关而与积分变量的字母无关；函数连续，或有界且只有有限个间断点，就必然可积。
2. 定积分的几何意义是"$x$ 轴上方面积减下方面积"，性质则是估值与拆分的工具：线性性、区间可加性、保号性、**估值定理** $m(b-a)\le\int_{a}^{b} f(x)\,dx\le M(b-a)$ 与**积分中值定理** $\int_{a}^{b} f(x)\,dx=f(\xi)(b-a)$；中值定理常在证明中用来"制造"一个函数值，而积分的乘积不等于乘积的积分。
3. 变上限积分 $\Phi(x)=\int_{a}^{x} f(t)\,dt$ 的导数就是 $f(x)$，这正是**原函数存在定理**，通式为 $F'(x)=f[\psi(x)]\psi'(x)-f[\varphi(x)]\varphi'(x)$，被积函数含 $x$ 时必须先把 $x$ 移出积分号；只要 $f$ 可积，变限积分就一定连续——$f$ 有跳跃间断时 $F$ 仍连续，只是不可导。
4. **牛顿-莱布尼茨公式** $\int_{a}^{b} f(x)\,dx=F(b)-F(a)$ 把定积分彻底降为求原函数——同一道 $\int_{0}^{1} x^{2}\,dx$，定义法要一整页、牛莱公式只要一行；但原函数该带绝对值时必须带，$\int\frac{dx}{x}=\ln\lvert x\rvert$。
5. 定积分换元**必须同时换限**，换完直接用新限代入、不必回代原变量；开偶次根号一律先写绝对值 $\sqrt{u^{2}}=\lvert u\rvert$，再按积分区间分段去绝对值——这是本章最高频的错误来源。
6. 分部积分 $\int_{a}^{b}u\,dv=uv\Big|_{a}^{b}-\int_{a}^{b}v\,du$ 中 $u$ 按"**反对幂指三**"选取，反三角与对数优先；遇到 $e^{\sqrt{x}}$、$\sin\sqrt{x}$ 这类含根号的，先换元消根号再分部。
7. **华里士公式**给出 $\int_{0}^{\pi/2}\sin^{n}x\,dx=\int_{0}^{\pi/2}\cos^{n}x\,dx$ 的闭式结果：$n$ 为偶数时是 $\frac{(n-1)!!}{n!!}\cdot\frac{\pi}{2}$（偶点火），$n$ 为大于 1 的奇数时是 $\frac{(n-1)!!}{n!!}$（奇熄火）。
8. 对称与再现是省计算的两把钥匙：$[-a,a]$ 上"**偶倍奇零**"，非奇非偶则用 $\int_{-a}^{a} f(x)\,dx=\int_{0}^{a}[f(x)+f(-x)]\,dx$（常能消掉 $e^{x}$）；区间再现 $\int_{a}^{b} f(x)\,dx=\int_{a}^{b} f(a+b-x)\,dx$ 能给出与 $n$ 无关的结果，如 $\int_{0}^{\pi/2}\frac{\sin^{n}x}{\sin^{n}x+\cos^{n}x}\,dx=\frac{\pi}{4}$。
9. 周期函数可把 $n$ 个周期压缩为 $n$ 倍单周期上的积分，含绝对值或分段的函数要按零点、分段点拆开区间；$\int_{0}^{\pi} xf(\sin x)\,dx=\frac{\pi}{2}\int_{0}^{\pi} f(\sin x)\,dx$ 则专门用来消掉那个多出来的 $x$。
10. 反常积分只有两类：无穷限 $\int_{a}^{+\infty}\frac{dx}{x^{p}}$ 在 $p>1$ 时收敛、$p\le 1$ 时发散；瑕积分 $\int_{0}^{a}\frac{dx}{x^{p}}$ 在 $0<p<1$ 时收敛、$p\ge 1$ 时发散——两者**恰好相反**。双向无穷与内部瑕点必须拆开、两边都收敛才收敛，而瑕积分外观与普通定积分一模一样，动笔前先查有没有瑕点（$\int_{-1}^{1}\frac{dx}{x^{2}}$ 直接套牛莱必错）。
11. **微元法**（选积分变量 → 写出 $dQ$ → 定上下限 → 积分）是面积、体积、弧长的统一方法：面积优先选 X 型或 Y 型以避免拆区间，极坐标用 $dS=\frac{1}{2}\rho^{2}d\theta$（别忘 $\frac{1}{2}$）；体积以平行截面法 $V=\int_{a}^{b}A(x)\,dx$ 为母公式，旋转轴与积分变量同轴用圆盘法、不同轴用柱壳法；三种弧长公式都只是 $ds=\sqrt{(dx)^{2}+(dy)^{2}}$ 的特例。
