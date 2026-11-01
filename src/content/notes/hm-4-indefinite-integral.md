---
title: 高等数学-4 不定积分
description: 从导数反求原函数：不定积分的概念与性质、基本积分表、凑微分与三角换元两类换元法、分部积分，以及有理函数的部分分式积分。
category: 数学
subject: 数学
subfield: 高等数学
topic: 不定积分
difficulty: 基础
date: "2026-10-25"
tags: [高等数学, 不定积分, 原函数, 换元积分法, 凑微分, 分部积分法, 有理函数积分, 三角换元]
draft: false
featured: false
---

## 不定积分的概念与性质

### 原函数与不定积分的概念

#### 原函数

如果在区间 $I$ 上，可导函数 $F(x)$ 的导函数为 $f(x)$，即对 $\forall x \in I$ 都有 $F'(x) = f(x)$ 或 $dF(x) = f(x)\,dx$，那么 $F(x)$ 就称为 $f(x)$ 在区间 $I$ 上的一个**原函数**。

#### 原函数存在定理

如果函数 $f(x)$ 在区间 $I$ 上连续，那么在区间 $I$ 上存在可导函数 $F(x)$，使 $\forall x \in I$ 都有 $F'(x) = f(x)$。简言之：**连续函数一定有原函数**

关于原函数的两个基本事实：

- $(F(x) + C)' = F'(x) = f(x)$——原函数不唯一，彼此相差一个常数
- 若 $F'(x) = \Phi'(x) = f(x)$，则 $F(x) - \Phi(x) \equiv C$——同一函数的任意两个原函数之间只差常数

#### 不定积分

在区间 $I$ 上，函数 $f(x)$ 的带有任意常数项的原函数称为 $f(x)$ 在区间 $I$ 上的**不定积分**，记作 $\int f(x)\,dx$。即：

$$
\int f(x)\,dx = F(x) + C
$$

其中 $\int$ 称为**积分号**，$f(x)$ 称为**被积函数**，$f(x)\,dx$ 称为**被积表达式**，$x$ 称为**积分变量**，$C$ 称为**积分常数**。

> **注意**：不定积分的结果**必须加 $C$**！这是初学者最容易遗忘的一点——漏掉 $+C$ 只得到一个原函数，而不是全体原函数。不定积分表示的是一族函数（原函数族），而非一个函数。

#### 不定积分与导数、微分的关系（互逆性）

$$
\frac{d}{dx}\left[ \int f(x)\,dx \right] = f(x), \quad \int F'(x)\,dx = F(x) + C
$$

$$
d\left[ \int f(x)\,dx \right] = f(x)\,dx, \quad \int dF(x) = F(x) + C
$$

这表明**微分和积分是互逆运算**：先积后导还原，先导后积还原（差一个常数）。

#### 基本积分表

以下公式由基本求导公式直接反向得到，是整个不定积分计算的基石：

| 积分公式 | 对应求导公式 |
| :--- | :--- |
| $\displaystyle\int k\,dx = kx + C$ | $(kx)' = k$ |
| $\displaystyle\int x^\mu\,dx = \frac{x^{\mu+1}}{\mu+1} + C$（$\mu \neq -1$） | $(x^{\mu+1})' = (\mu+1)x^\mu$ |
| $\displaystyle\int \frac{1}{x}\,dx = \ln\lvert x \rvert + C$ | $(\ln\lvert x\rvert)' = \frac{1}{x}$ |
| $\displaystyle\int \frac{1}{1+x^2}\,dx = \arctan x + C$ | $(\arctan x)' = \frac{1}{1+x^2}$ |
| $\displaystyle\int \frac{1}{\sqrt{1-x^2}}\,dx = \arcsin x + C$ | $(\arcsin x)' = \frac{1}{\sqrt{1-x^2}}$ |
| $\displaystyle\int \cos x\,dx = \sin x + C$ | $(\sin x)' = \cos x$ |
| $\displaystyle\int \sin x\,dx = -\cos x + C$ | $(-\cos x)' = \sin x$ |
| $\displaystyle\int \sec^2 x\,dx = \tan x + C$ | $(\tan x)' = \sec^2 x$ |
| $\displaystyle\int \csc^2 x\,dx = -\cot x + C$ | $(-\cot x)' = \csc^2 x$ |
| $\displaystyle\int \sec x \tan x\,dx = \sec x + C$ | $(\sec x)' = \sec x \tan x$ |
| $\displaystyle\int \csc x \cot x\,dx = -\csc x + C$ | $(-\csc x)' = \csc x \cot x$ |
| $\displaystyle\int e^x\,dx = e^x + C$ | $(e^x)' = e^x$ |
| $\displaystyle\int a^x\,dx = \frac{a^x}{\ln a} + C$ | $(a^x)' = a^x \ln a$ |

> **注意**：$\int \frac{1}{x}\,dx = \ln\lvert x \rvert + C$，这里的绝对值符号不可省略——当 $x < 0$ 时 $(\ln(-x))' = \frac{1}{x}$ 同样成立，所以原函数应覆盖正负两种情况。

### 不定积分的性质——线性性

$$
\int [f(x) \pm g(x)]\,dx = \int f(x)\,dx \pm \int g(x)\,dx
$$

$$
\int k f(x)\,dx = k \int f(x)\,dx \quad (k \text{ 为非零常数})
$$

线性性是积分计算最基本的手段：**拆项分别积分，常数提到积分号外**。

#### 例题

:::example 例 1 · 拆项积分
求 $\displaystyle\int \frac{(x-1)^3}{x^2}\,dx$。

**思路**：分子展开后逐项除以 $x^2$，拆成幂函数的和再逐项积分。

**解**：

$$
\int \frac{x^3 - 3x^2 + 3x - 1}{x^2}\,dx = \int \left( x - 3 + \frac{3}{x} - \frac{1}{x^2} \right) dx = \frac{1}{2}x^2 - 3x + 3\ln\lvert x\rvert + \frac{1}{x} + C
$$

**评注**：有理式积分的第一步永远是判断"假分式化真分式"或"拆项"——把复杂分式化为多项式和简单分式的组合，然后逐项套用基本积分表。

:::

:::example 例 2 · 三角恒等变换后积分
求 $\displaystyle\int \tan^2 x\,dx$。

**思路**：基本积分表中没有 $\tan^2 x$ 的直接公式。利用恒等式 $\tan^2 x = \sec^2 x - 1$ 化为已知积分。

**解**：

$$
\int \tan^2 x\,dx = \int (\sec^2 x - 1)\,dx = \tan x - x + C
$$

**评注**：被积函数含有 $\tan^2 x$、$\cot^2 x$、$\sin^2 x$、$\cos^2 x$ 时，先利用三角恒等式化为基本积分表中的形式——这是处理三角函数的统一思路。

:::

:::example 例 3 · 半角公式降幂
求 $\displaystyle\int \sin^2\frac{x}{2}\,dx$。

**思路**：$\sin^2$ 和 $\cos^2$ 的积分不能直接用基本公式。利用降幂公式 $\sin^2\frac{x}{2} = \frac{1-\cos x}{2}$ 化为一次式。

**解**：

$$
\int \sin^2\frac{x}{2}\,dx = \int \frac{1 - \cos x}{2}\,dx = \frac{1}{2}(x - \sin x) + C
$$

**评注**：**降幂公式**是处理 $\sin^2$ / $\cos^2$ 的基本工具——$\sin^2\alpha = \frac{1-\cos2\alpha}{2}$，$\cos^2\alpha = \frac{1+\cos2\alpha}{2}$。本题中 $\alpha = x/2$，$2\alpha = x$。

:::

:::example 例 4 · 多项式除法化简
求 $\displaystyle\int \frac{2x^4 + x^2 + 3}{x^2 + 1}\,dx$。

**思路**：分子次数高于分母，用多项式除法化假分式为真分式。

**解**：$2x^4 + x^2 + 3 = (x^2+1)(2x^2-1) + 4$，故：

$$
\int \frac{2x^4 + x^2 + 3}{x^2 + 1}\,dx = \int \left( 2x^2 - 1 + \frac{4}{x^2+1} \right) dx = \frac{2}{3}x^3 - x + 4\arctan x + C
$$

**评注**：假分式的积分流程：多项式除法 → 化为多项式 + 真分式 → 分别积分。

:::

## 换元积分法

基本积分表只能处理最简单的函数。当被积函数是复合函数形式时，需要**换元**——通过变量替换将被积函数"化简"为基本积分表中的形式。换元法分两类：第一类（凑微分，正向复合）和第二类（变量代换，反向拆解）。

### 第一类换元法（凑微分法）

#### 原理

设 $f(u)$ 具有原函数，$u = \varphi(x)$ 可导，则：

$$
\int f[\varphi(x)]\,\varphi'(x)\,dx = \int f[\varphi(x)]\,d\varphi(x) = \left[ \int f(u)\,du \right]_{u=\varphi(x)}
$$

**核心思想**：将被积函数的一部分"塞进"微分号 $d$ 里面（凑成 $d\varphi(x) = \varphi'(x)dx$），使积分变量从 $x$ 变为 $u = \varphi(x)$，从而匹配基本积分公式。

> **注意**：凑微分的关键是**识别 $\varphi'(x)dx$ 的组合**——常见的有 $x\,dx = \frac{1}{2}d(x^2)$，$\frac{1}{x}dx = d(\ln x)$，$e^x dx = d(e^x)$，$\cos x\,dx = d(\sin x)$ 等。

#### 常见凑微分形式

| 被积表达式 | 凑微分 | 适用场景 |
| :--- | :--- | :--- |
| $x^n dx$ | $\frac{1}{n+1}d(x^{n+1})$ | 幂函数 |
| $\frac{1}{x}dx$ | $d(\ln\lvert x\rvert)$ | 对数型 |
| $e^x dx$ | $d(e^x)$ | 指数型 |
| $\sin x\,dx$ | $-d(\cos x)$ | 三角型 |
| $\cos x\,dx$ | $d(\sin x)$ | 三角型 |
| $\sec^2 x\,dx$ | $d(\tan x)$ | 三角型 |
| $\frac{1}{1+x^2}dx$ | $d(\arctan x)$ | 反三角型 |
| $\frac{1}{\sqrt{1-x^2}}dx$ | $d(\arcsin x)$ | 反三角型 |

#### 例题

:::example 例 1 · 分母为平方和的凑微分
求 $\displaystyle\int \frac{1}{a^2 + x^2}\,dx$（$a \neq 0$）。

**思路**：将分母化为 $1 + (\frac{x}{a})^2$ 的形式，凑出 $\arctan$ 的微分。

**解**：

$$
\int \frac{1}{a^2 + x^2}\,dx = \frac{1}{a^2} \int \frac{1}{1 + (\frac{x}{a})^2}\,dx = \frac{1}{a} \int \frac{1}{1 + (\frac{x}{a})^2}\,d\!\left(\frac{x}{a}\right) = \frac{1}{a}\arctan\frac{x}{a} + C
$$

**评注**：这是 $\int \frac{1}{a^2+x^2}dx$ 的通用公式，结果带 $\frac{1}{a}$ 系数——不要漏掉。

:::

:::example 例 2 · 拆项加换元
求 $\displaystyle\int \frac{x^2}{(x+2)^3}\,dx$。

**思路**：令 $u = x+2$，则 $x = u-2$，$dx = du$。代入后分子拆开逐项积分。

**解**：令 $u = x+2$：

$$
\int \frac{(u-2)^2}{u^3}\,du = \int \frac{u^2 - 4u + 4}{u^3}\,du = \int \left( \frac{1}{u} - \frac{4}{u^2} + \frac{4}{u^3} \right) du = \ln\lvert u\rvert + \frac{4}{u} - \frac{2}{u^2} + C
$$

回代 $u = x+2$ 即得结果。

**评注**：当分母是 $(x+a)^n$ 而分子含 $x$ 的多项式时，令 $u = x+a$ 是最直接的换元——将"平移"后的幂函数化开，拆项积分。

:::

:::example 例 3 · 平方差型裂项
求 $\displaystyle\int \frac{1}{x^2 - a^2}\,dx$（$a \neq 0$）。

**思路**：$\frac{1}{x^2-a^2} = \frac{1}{2a}\left( \frac{1}{x-a} - \frac{1}{x+a} \right)$，裂项后分别积分为对数。

**解**：

$$
\int \frac{1}{x^2 - a^2}\,dx = \frac{1}{2a} \int \left( \frac{1}{x-a} - \frac{1}{x+a} \right) dx = \frac{1}{2a} \ln\left\lvert \frac{x-a}{x+a} \right\rvert + C
$$

**评注**：分母可因式分解为 $(x-a)(x+a)$ 的有理式，标准方法是**部分分式裂项**。这个公式可以和 $\int \frac{1}{a^2+x^2}dx = \frac{1}{a}\arctan\frac{x}{a}$ 对比记忆——$+$ 号出 $\arctan$，$-$ 号出对数。

:::

:::example 例 4 · 正弦奇次幂凑微分
求 $\displaystyle\int \sin^3 x\,dx$。

**思路**：$\sin^3 x = \sin^2 x \cdot \sin x = (1-\cos^2 x)\sin x$。把一个 $\sin x$ 与 $dx$ 凑成 $-d(\cos x)$，剩余的 $\sin^2 x$ 用 $\cos x$ 表示。

**解**：

$$
\int \sin^3 x\,dx = -\int (1 - \cos^2 x)\,d(\cos x) = -\cos x + \frac{1}{3}\cos^3 x + C
$$

**评注**：三角函数的奇次幂积分通用套路：**分出一个一次因子凑微分**，剩余偶次幂用恒等式 $\sin^2 + \cos^2 = 1$ 转化为单一函数。奇次幂是"容易"的情形。

:::

:::example 例 5 · 正切与余切的积分公式
求 $\displaystyle\int \tan x\,dx$ 和 $\displaystyle\int \cot x\,dx$。

**解**：

$$
\int \tan x\,dx = -\int \frac{1}{\cos x}\,d(\cos x) = -\ln\lvert\cos x\rvert + C
$$

$$
\int \cot x\,dx = \int \frac{1}{\sin x}\,d(\sin x) = \ln\lvert\sin x\rvert + C
$$

**评注**：$\tan x = \frac{\sin x}{\cos x}$，分子恰为分母导数（相差负号），凑微分一步到位。这两个公式使用频率极高，建议记住。

:::

:::example 例 6 · 余弦平方降幂
求 $\displaystyle\int \cos^2 x\,dx$。

**思路**：偶次幂无法"分出一个凑微分"。用降幂公式 $\cos^2 x = \frac{1+\cos2x}{2}$。

**解**：

$$
\int \cos^2 x\,dx = \int \frac{1 + \cos2x}{2}\,dx = \frac{1}{2}x + \frac{1}{4}\sin2x + C
$$

**评注**：三角函数**偶次幂**的处理方式与奇次幂完全不同——用**降幂公式**化为一次式。奇次幂凑微分，偶次幂降幂，这是核心分界线。

:::

:::example 例 7 · 正割与余割的积分公式
求 $\displaystyle\int \sec x\,dx$ 和 $\displaystyle\int \csc x\,dx$。

**思路**：$\int \sec x\,dx$ 的经典处理——分子分母同乘 $(\sec x + \tan x)$，凑出 $\frac{d(\sec x + \tan x)}{\sec x + \tan x}$。

**解**：

$$
\begin{aligned}
\int \sec x\,dx &= \int \frac{\sec x(\sec x + \tan x)}{\sec x + \tan x}\,dx = \int \frac{d(\sec x + \tan x)}{\sec x + \tan x} \\
&= \ln\lvert\sec x + \tan x\rvert + C
\end{aligned}
$$

$$
\int \csc x\,dx = \ln\lvert\csc x - \cot x\rvert + C \quad \text{（同理）}
$$

**评注**：$\sec x$ 和 $\csc x$ 的积分公式使用频率极高。记忆技巧：$\sec$ 对应 $\sec + \tan$（都是正号），$\csc$ 对应 $\csc - \cot$（带减号）。

:::

:::example 例 8 · 积化和差
求 $\displaystyle\int \cos3x \cos2x\,dx$。

**思路**：不同频率的三角函数乘积无法直接积分。利用积化和差公式化为和差形式。

**解**：$\cos3x \cos2x = \frac{1}{2}(\cos x + \cos5x)$：

$$
\int \cos3x \cos2x\,dx = \frac{1}{2}\int (\cos x + \cos5x)\,dx = \frac{1}{2}\sin x + \frac{1}{10}\sin5x + C
$$

**评注**：$\sin mx \cos nx$、$\sin mx \sin nx$、$\cos mx \cos nx$ 型一律用**积化和差**化为和差再逐项积分。

:::

### 第二类换元法

#### 原理

设 $x = \psi(t)$ 是单调的可导函数，且 $\psi'(t) \neq 0$，则：

$$
\int f(x)\,dx = \left[ \int f[\psi(t)]\,\psi'(t)\,dt \right]_{t = \psi^{-1}(x)}
$$

与第一类换元（"凑进去"）不同，第二类换元是**主动设 $x = \psi(t)$**，把 $x$ 替换为 $t$ 的表达式。主要用于处理**含根式**的被积函数——通过三角换元消去根号。

#### 三角换元对照表

| 被积函数含 | 换元 | 微分 | 根式化简 |
| :--- | :--- | :--- | :--- |
| $\sqrt{a^2 - x^2}$ | $x = a\sin t$ | $dx = a\cos t\,dt$ | $\sqrt{a^2-x^2} = a\cos t$ |
| $\sqrt{a^2 + x^2}$ | $x = a\tan t$ | $dx = a\sec^2 t\,dt$ | $\sqrt{a^2+x^2} = a\sec t$ |
| $\sqrt{x^2 - a^2}$ | $x = a\sec t$ | $dx = a\sec t\tan t\,dt$ | $\sqrt{x^2-a^2} = a\tan t$ |

记忆口诀：**塞进去（$\sin$），弹出来（$\tan$），$a$ 在前用 $arc$**。

> **注意**：第二类换元最后必须**将 $t$ 换回 $x$**。一般借助换元时定义的直角三角形来写出 $\sin t$、$\cos t$、$\tan t$ 等用 $x$ 表示的式子。

#### 例题

:::example 例 9 · 平方差根式的三角换元
求 $\displaystyle\int \sqrt{a^2 - x^2}\,dx$（$a > 0$）。

**思路**：含 $\sqrt{a^2-x^2}$，令 $x = a\sin t$（$t \in (-\frac{\pi}{2}, \frac{\pi}{2})$）。消去根号后用降幂公式。

**解**：令 $x = a\sin t$，$dx = a\cos t\,dt$，$\sqrt{a^2-x^2} = a\cos t$：

$$
\begin{aligned}
\int \sqrt{a^2-x^2}\,dx &= \int a^2\cos^2 t\,dt = a^2\int \frac{1+\cos2t}{2}\,dt \\
&= \frac{a^2}{2}t + \frac{a^2}{4}\sin2t + C = \frac{a^2}{2}\arcsin\frac{x}{a} + \frac{1}{2}x\sqrt{a^2-x^2} + C
\end{aligned}
$$

**评注**：最后回代时 $\sin2t = 2\sin t\cos t = 2 \cdot \frac{x}{a} \cdot \frac{\sqrt{a^2-x^2}}{a}$。借助 $\sin t = x/a$ 所确定的直角三角形来写出 $\cos t$。

:::

:::example 例 10 · 平方和根式的三角换元
求 $\displaystyle\int \frac{1}{\sqrt{x^2 + a^2}}\,dx$（$a > 0$）。

**思路**：含 $\sqrt{x^2+a^2}$，令 $x = a\tan t$。

**解**：令 $x = a\tan t$，$dx = a\sec^2 t\,dt$，$\sqrt{x^2+a^2} = a\sec t$：

$$
\int \frac{a\sec^2 t}{a\sec t}\,dt = \int \sec t\,dt = \ln\lvert\sec t + \tan t\rvert + C = \ln\lvert x + \sqrt{x^2+a^2} \rvert + C
$$

**评注**：结果 $\ln\lvert x + \sqrt{x^2+a^2} \rvert$ 是一个常用公式，应记住。$\sqrt{x^2-a^2}$ 型同理可得 $\ln\lvert x + \sqrt{x^2-a^2} \rvert$。

:::

:::example 例 11 · 配方后凑反正弦
求 $\displaystyle\int \frac{dx}{\sqrt{1 + x - x^2}}$。

**思路**：根号内是二次三项式，先**配方**化为 $k^2 - (x-h)^2$ 的形式，再套用 $\int \frac{1}{\sqrt{a^2-u^2}}du = \arcsin\frac{u}{a}$。

**解**：

$$
1 + x - x^2 = \frac{5}{4} - \left(x - \frac{1}{2}\right)^2
$$

$$
\int \frac{dx}{\sqrt{\frac{5}{4} - (x-\frac{1}{2})^2}} = \int \frac{d(x-\frac{1}{2})}{\sqrt{(\frac{\sqrt{5}}{2})^2 - (x-\frac{1}{2})^2}} = \arcsin\frac{2x-1}{\sqrt{5}} + C
$$

**评注**：根号内含二次三项式时的标准流程：**配方 → 凑微分 → 套 $\arcsin$ 或 $\ln$ 公式**。配方法看似简单，却最容易被忽略，一旦想不起来就容易卡住。

:::

#### 两类换元法对比

| 对比项 | 第一类换元（凑微分） | 第二类换元 |
| :--- | :--- | :--- |
| **操作方向** | 把 $x$ 的表达式"塞进"微分号 | 设 $x = \psi(t)$，把 $x$ 替换出去 |
| **公式** | $\int f[\varphi(x)]\varphi'(x)dx = \int f(u)du$ | $\int f(x)dx = \int f[\psi(t)]\psi'(t)dt$ |
| **适用场景** | 被积函数明显含 $\varphi'(x)dx$ 组合 | 含二次根式 $\sqrt{a^2\pm x^2}$、$\sqrt{x^2-a^2}$ |
| **核心技巧** | 识别微分配对 | 三角换元消根号，最后回代 |

## 分部积分法

换元法处理的是"复合函数"型积分。但当被积函数是**两类不同函数的乘积**时（如 $x\cos x$、$x e^x$、$e^x\sin x$），换元法无能为力。分部积分法正是为这类乘积设计的。

### 分部积分公式

由乘积求导公式 $(uv)' = u'v + uv'$ 移项积分即得：

$$
\int uv'\,dx = uv - \int u'v\,dx \quad \text{即} \quad \int u\,dv = uv - \int v\,du
$$

核心思想：**把一部分函数"吃掉"放进微分号，把剩下的作为另一部分**，将原积分转化为另一个（希望更简单的）积分。

### 选择 $u$ 的优先级

选择谁作 $u$（即最后要被求导的那部分）直接决定了转化后的积分是变简单还是变更复杂。经验法则：

| 优先级 | 函数类型 | 如何选择 | 示例 |
| :--- | :--- | :--- | :--- |
| 1 | **反**三角函数 | 作 $u$ | $\arctan x$、$\arcsin x$ |
| 2 | **对**数函数 | 作 $u$ | $\ln x$ |
| 3 | **幂**函数 | 视情况 | $x^n$（当与反/对搭配时作 $dv$） |
| 4 | **三**角函数 | 作 $dv$ | $\sin x$、$\cos x$（凑微分容易） |
| 5 | **指**数函数 | 作 $dv$ | $e^x$（凑微分容易） |

口诀：**反对幂指三**，越靠前越优先作 $u$。反/对数函数求导后"消失"或变简单，三角/指数函数积分后保持原样——这是排名逻辑。

### 例题

:::example 例 1 · 幂函数乘三角函数
求 $\displaystyle\int x\cos x\,dx$。

**思路**："反对幂指三"——$x$ 是幂函数（排第 3），$\cos x$ 是三角函数（排第 4），$\cos x$ 排位更低，应作 $dv$。

**解**：

$$
\int x\cos x\,dx = \int x\,d(\sin x) = x\sin x - \int \sin x\,dx = x\sin x + \cos x + C
$$

**评注**：$x$ 求导后变成 $1$（更简单），$\sin x$ 积分后仍是三角函数（保持），这正是分部积分期望的效果。

:::

:::example 例 2 · 两次分部降幂
求 $\displaystyle\int x^2 e^x\,dx$。

**思路**：$x^2$ 是幂函数，$e^x$ 是指数函数。每次分部消去 $x$ 的一个幂次，需做两次。

**解**：

$$
\int x^2 e^x\,dx = \int x^2\,d(e^x) = x^2 e^x - 2\int x e^x\,dx
$$

对 $\int x e^x\,dx$ 再分部一次：$= x e^x - \int e^x\,dx = (x-1)e^x + C$。代回：

$$
\int x^2 e^x\,dx = x^2 e^x - 2(x-1)e^x + C = e^x(x^2 - 2x + 2) + C
$$

**评注**：$x^n$ 乘以 $e^x$（或 $\sin x$、$\cos x$）的积分，每做一次分部积分，$x^n$ 降一次幂。做 $n$ 次后幂函数消失，只留下指数/三角函数的积分。

:::

:::example 例 3 · 对数函数作 u
求 $\displaystyle\int x\ln x\,dx$。

**思路**："反对幂指三"——$\ln x$ 是**对**数函数（排第 2，优先级高），应作 $u$。

**解**：

$$
\int x\ln x\,dx = \int \ln x\,d\!\left(\frac{1}{2}x^2\right) = \frac{1}{2}x^2\ln x - \frac{1}{2}\int x^2 \cdot \frac{1}{x}\,dx = \frac{1}{2}x^2\ln x - \frac{1}{4}x^2 + C
$$

**评注**：$\ln x$ 求导后 $\to \frac{1}{x}$，幂次降低，乘积变简单——这正是 $\ln x$ 天然适合做 $u$ 的原因。

:::

:::example 例 4 · 反三角函数作 u
求 $\displaystyle\int x\arctan x\,dx$。

**思路**："反对幂指三"——$\arctan x$ 是**反**三角函数（排第 1），应作 $u$。

**解**：

$$
\begin{aligned}
\int x\arctan x\,dx &= \frac{1}{2}\int \arctan x\,d(x^2) = \frac{1}{2}x^2\arctan x - \frac{1}{2}\int \frac{x^2}{1+x^2}\,dx \\
&= \frac{1}{2}x^2\arctan x - \frac{1}{2}\int \left(1 - \frac{1}{1+x^2}\right) dx \\
&= \frac{1}{2}x^2\arctan x - \frac{1}{2}(x - \arctan x) + C = \frac{1}{2}(x^2+1)\arctan x - \frac{1}{2}x + C
\end{aligned}
$$

**评注**：反三角函数求导后变为有理函数，积分可继续处理。$\int \frac{x^2}{1+x^2}dx$ 的处理技巧是"加减常数拆项"——加 $1$ 减 $1$：$\frac{x^2}{1+x^2} = 1 - \frac{1}{1+x^2}$。

:::

:::example 例 5 · 循环型积分
求 $\displaystyle\int e^x\sin x\,dx$。

**思路**：$e^x$ 和 $\sin x$ 无论谁作 $u$ 谁作 $dv$，分部一次后积分中仍然同时含 $e^x$ 和 $\cos x$。再分部一次，原积分重新出现——移项解方程。

**解**：

$$
\begin{aligned}
\int e^x\sin x\,dx &= \int \sin x\,d(e^x) = e^x\sin x - \int e^x\cos x\,dx \\
&= e^x\sin x - \int \cos x\,d(e^x) = e^x\sin x - \left( e^x\cos x + \int e^x\sin x\,dx \right)
\end{aligned}
$$

设 $I = \int e^x\sin x\,dx$，则 $I = e^x(\sin x - \cos x) - I$，解得：

$$
I = \frac{1}{2}e^x(\sin x - \cos x) + C
$$

**评注**：$e^{ax}\sin bx$ 和 $e^{ax}\cos bx$ 型统称为**循环型积分**——分部两次后原积分重现，移项解方程即得结果。核心技巧是坚持"同一方向"分部（每次 $e^{ax}$ 作 $dv$，或每次三角作 $dv$）。

:::

:::example 例 6 · 正割三次方的分部积分
求 $\displaystyle\int \sec^3 x\,dx$。

**思路**：拆出一个 $\sec^2 x$ 凑成 $d(\tan x)$，剩余 $\sec x$ 用 $\sec^2 x = 1 + \tan^2 x$ 展开。

**解**：

$$
\begin{aligned}
\int \sec^3 x\,dx &= \int \sec x\,d(\tan x) = \sec x\tan x - \int \tan^2 x\sec x\,dx \\
&= \sec x\tan x - \int (\sec^3 x - \sec x)\,dx
\end{aligned}
$$

设 $I = \int \sec^3 x\,dx$，则 $I = \sec x\tan x - I + \int \sec x\,dx$，得：

$$
I = \frac{1}{2}\left( \sec x\tan x + \ln\lvert\sec x + \tan x\rvert \right) + C
$$

**评注**：$\sec^3 x$ 和 $\csc^3 x$ 是最常用的非基本积分公式之一。不需要每次都推导，记住结果更好：$\int \sec^3 x\,dx = \frac{1}{2}(\sec x\tan x + \ln\lvert\sec x+\tan x\rvert) + C$。

:::

:::example 例 7 · 先换元再分部
求 $\displaystyle\int e^{\sqrt{x}}\,dx$。

**思路**：指数上是根号，先换元令 $t = \sqrt{x}$ 消去根号，化为 $2\int t e^t dt$，再分部积分。

**解**：令 $t = \sqrt{x}$，$x = t^2$，$dx = 2t\,dt$：

$$
\int e^{\sqrt{x}}\,dx = 2\int t e^t\,dt = 2(te^t - e^t) + C = 2e^{\sqrt{x}}(\sqrt{x} - 1) + C
$$

**评注**：被积函数含 $\sqrt{x}$ 时，先令 $t = \sqrt{x}$ 换元化为多项式形式，再用前面学过的 $t e^t$ 分部积分。换元法和分部积分法经常配合使用——先换元简化被积函数的结构，再分部处理乘积。

:::

## 有理函数的积分

有理函数（两个多项式的商）在实际应用中非常普遍，且总存在初等原函数。本节建立有理函数积分的系统方法。

### 有理函数的定义与分类

两个多项式的商 $\frac{P(x)}{Q(x)}$ 称为**有理函数**（有理分式）。当分子次数小于分母次数时称为**真分式**，否则为**假分式**。

#### 假分式的处理

假分式先用**多项式除法**（长除法）化为"多项式 + 真分式"：

![用长除法把假分式化为「多项式 + 真分式」](/notes-assets/hm4-01-polynomial-long-division.jpg)

#### 真分式的部分分式分解

真分式 $\frac{P(x)}{Q(x)}$ 可按分母的因式类型拆分为简单分式之和：

- 单实根 $(x-A)$：$\dfrac{a}{x-A}$
- $p$ 重实根 $(x-A)^p$：$\dfrac{a_1}{x-A} + \dfrac{a_2}{(x-A)^2} + \cdots + \dfrac{a_p}{(x-A)^p}$
- 二次质因式 $(x^2+Mx+N)$：$\dfrac{bx+c}{x^2+Mx+N}$

:::example 例 1 · 加减常数化假分式
求 $\displaystyle\int \frac{x^2}{x^2+1}\,dx$。

**思路**：分子分母次数相同（均为 2 次），为假分式。通过"加 1 减 1"化为真分式。

**解**：

$$
\int \frac{x^2}{x^2+1}\,dx = \int \left(1 - \frac{1}{x^2+1}\right) dx = x - \arctan x + C
$$

**评注**：对于 $\frac{x^2}{x^2+1}$、$\frac{x}{x+1}$ 这类"次数差很小"的假分式，用**加减常数法**比长除法更快捷。

:::

:::example 例 2 · 配方后用反正切
求 $\displaystyle\int \frac{1}{x^2 + 2x + 2}\,dx$。

**思路**：分母为二次三项式但判别式小于零（不能因式分解），先**配方**再用 $\arctan$ 公式。

**解**：

$$
x^2 + 2x + 2 = (x+1)^2 + 1
$$

$$
\int \frac{1}{(x+1)^2+1}\,dx = \int \frac{d(x+1)}{1+(x+1)^2} = \arctan(x+1) + C
$$

**评注**：分母为不可分解的二次式时，统一套路：**配方 → 化为 $u^2 + a^2$ 形式 → $\frac{1}{a}\arctan\frac{u}{a}$**。

:::

:::example 例 3 · 单实根裂项
求 $\displaystyle\int \frac{1}{(x-1)(x-2)}\,dx$。

**思路**：分母为两个不同单实根，裂项：$\frac{1}{(x-1)(x-2)} = \frac{A}{x-1} + \frac{B}{x-2}$，用待定系数法求 $A, B$。

**解**：设 $\frac{1}{(x-1)(x-2)} = \frac{A}{x-1} + \frac{B}{x-2}$，通分后比较分子：$1 = A(x-2) + B(x-1)$。令 $x=1$ 得 $A=-1$，令 $x=2$ 得 $B=1$。故：

$$
\int \frac{1}{(x-1)(x-2)}\,dx = \int \left( \frac{1}{x-2} - \frac{1}{x-1} \right) dx = \ln\left\lvert \frac{x-2}{x-1} \right\rvert + C
$$

**评注**：待定系数解法的快捷方式——对每个因式，把它在分母中对应的根代入等式中消去其他未知数。

:::

:::example 例 4 · 分子恰为分母导数
求 $\displaystyle\int \frac{2x+3}{x^2+3x-10}\,dx$。

**思路**：分子 $2x+3$ 恰为分母 $x^2+3x-10$ 的导数。直接凑成 $\int \frac{d(\text{分母})}{\text{分母}}$。

**解**：

$$
\int \frac{2x+3}{x^2+3x-10}\,dx = \int \frac{d(x^2+3x-10)}{x^2+3x-10} = \ln\lvert x^2+3x-10 \rvert + C
$$

**评注**：在做有理函数积分时，第一步永远是**检查分子是否为分母导数的常数倍**——如果是，一步到位 $\ln\lvert\text{分母}\rvert$，可以省去大量裂项工作。

:::

:::example 例 5 · 单根与二次质因式混合
求 $\displaystyle\int \frac{1}{(1+2x)(1+x^2)}\,dx$。

**思路**：分母含一个单根因式 $(1+2x)$ 和一个二次质因式 $(1+x^2)$。裂项形式：$\frac{A}{1+2x} + \frac{Bx+C}{1+x^2}$。

**解**：设 $\frac{1}{(1+2x)(1+x^2)} = \frac{A}{1+2x} + \frac{Bx+C}{1+x^2}$。待定系数得 $A = \frac{4}{5}$，$B = -\frac{2}{5}$，$C = \frac{1}{5}$。

$$
\begin{aligned}
\int \frac{1}{(1+2x)(1+x^2)}\,dx &= \frac{4}{5}\int \frac{1}{1+2x}\,dx - \frac{2}{5}\int \frac{x}{1+x^2}\,dx + \frac{1}{5}\int \frac{1}{1+x^2}\,dx \\
&= \frac{2}{5}\ln\lvert 1+2x \rvert - \frac{1}{5}\ln(x^2+1) + \frac{1}{5}\arctan x + C
\end{aligned}
$$

**评注**：混合因式的裂项对照通式：单根 $\to \frac{A}{x-a}$，二次质因式 $\to \frac{Bx+C}{x^2+Mx+N}$。分别积分时，单根出对数，二次质因式拆成 $\frac{x}{x^2+Mx+N}$（凑对数）和 $\frac{1}{x^2+Mx+N}$（配方出 $\arctan$）。

:::

:::example 例 6 · 重因式裂项
求 $\displaystyle\int \frac{1}{(x+1)(x-1)^2}\,dx$。

**思路**：分母含重因式 $(x-1)^2$，裂项形式：$\frac{A}{x+1} + \frac{B}{x-1} + \frac{C}{(x-1)^2}$。

**解**：待定系数得 $A = \frac{1}{4}$，$B = -\frac{1}{4}$，$C = \frac{1}{2}$。

$$
\begin{aligned}
\int \frac{1}{(x+1)(x-1)^2}\,dx &= \frac{1}{4}\int \frac{1}{x+1}\,dx - \frac{1}{4}\int \frac{1}{x-1}\,dx + \frac{1}{2}\int \frac{1}{(x-1)^2}\,dx \\
&= \frac{1}{4}\ln\left\lvert \frac{x+1}{x-1} \right\rvert - \frac{1}{2}\cdot\frac{1}{x-1} + C
\end{aligned}
$$

**评注**：重因式 $(x-a)^n$ 的裂项包含从 $1$ 次到 $n$ 次的全部幂次。积分时：一次项出对数，高次项用 $\int (x-a)^{-k}dx = \frac{1}{1-k}(x-a)^{1-k}$。

:::

### 三角函数有理式的积分（万能换元）

对于只含 $\sin x$ 和 $\cos x$ 的有理式，**万能换元** $u = \tan\frac{x}{2}$ 可以将其化为普通有理函数：

$$
\sin x = \frac{2u}{1+u^2}, \quad \cos x = \frac{1-u^2}{1+u^2}, \quad dx = \frac{2}{1+u^2}\,du
$$

> **注意**：万能换元虽然是通法，但计算量通常较大。优先尝试凑微分或三角恒等变换，实在无路可走时再用万能换元——它可以"兜底"但不应是首选。

### 三角函数六边形记忆法

本记忆法源自B站视频：https://www.bilibili.com/video/BV1si4y1R7FG

![三角函数六边形的布局：六个函数按 sin、cos、tan、cot、sec、csc 排布](/notes-assets/hm4-02-trigonometric-hexagon.jpg)

#### 规则一：顺时针比值关系

沿六边形**顺时针**方向，每个函数等于其后第一个函数除以第二个函数：

$$
\sin x = \frac{\cos x}{\cot x}, \quad \cos x = \frac{\cot x}{\csc x}, \quad \cot x = \frac{\csc x}{\sec x}, \quad \csc x = \frac{\sec x}{\tan x}, \quad \sec x = \frac{\tan x}{\sin x}, \quad \tan x = \frac{\sin x}{\cos x}
$$

最常用的两个：$\tan x = \dfrac{\sin x}{\cos x}$，$\cot x = \dfrac{\cos x}{\sin x}$。其他四个关系虽然不常用，但完美展示了六边形的对称性。

#### 规则二：倒三角形——平方恒等式

在六边形中心画一个 "1"，连接各顶点构成三个**倒三角形**（▽），每个倒三角形的规律是：**上两顶点的平方和等于下顶点**：

三个倒三角形（▽）及其对应的平方恒等式：

$$
\begin{aligned}
\sin^2 x + \cos^2 x &= 1 \quad &\text{（倒三角①：上两顶点 sin, cos → 下顶点 1）} \\
\tan^2 x + 1 &= \sec^2 x \quad &\text{（倒三角②：上两顶点 tan, 1 → 下顶点 sec）} \\
1 + \cot^2 x &= \csc^2 x \quad &\text{（倒三角③：上两顶点 1, cot → 下顶点 csc）}
\end{aligned}
$$

这三个恒等式在三角换元（$\sec^2 - \tan^2 = 1$ 等变形）和有理函数积分时极其常用。

#### 规则三：右侧函数求导与积分带负号

六边形中位于**右侧**的三个函数——$\cos x$、$\cot x$、$\csc x$——在求导和积分时都**带有负号**：

| 左侧（正号） | 右侧（负号） |
| :--- | :--- |
| $(\sin x)' = +\cos x$ | $(\cos x)' = -\sin x$ |
| $(\tan x)' = +\sec^2 x$ | $(\cot x)' = -\csc^2 x$ |
| $(\sec x)' = +\sec x\tan x$ | $(\csc x)' = -\csc x\cot x$ |

只需记住六边形**右边三个都带负号**，左边三个不带——求导和积分都是这个规律。

**求导积分口诀：中下二，下中下，导相乘，对对和。**

#### 规则四：「中下二」（中间行的 tan/cot）

中间行的函数（tan、cot），由**底下那行的函数用两次**构成：

| 函数 | 导数（导相乘） | 积分（对对和） |
| :--- | :--- | :--- |
| **tan** | $(\tan x)' = \sec x \cdot \sec x = \sec^2 x$ | $\int \tan x\,dx = \ln\lvert\sec x + \sec x\rvert + C = -\ln\lvert\cos x\rvert + C$ |
| **cot** | $(\cot x)' = -\csc x \cdot \csc x = -\csc^2 x$ | $\int \cot x\,dx = -\ln\lvert\csc x + \csc x\rvert + C = \ln\lvert\sin x\rvert + C$ |

- **导相乘**：底下那个函数乘自己（$\sec \cdot \sec = \sec^2$）
- **对对和**：底下那个函数跟自己配对，求和取对数绝对值（$\ln\lvert\sec + \sec\rvert \to \ln\lvert\sec\rvert$，常数 $\ln 2$ 被 $C$ 吸收）。cot 的同理得 $-\ln\lvert\csc\rvert$。

#### 规则五：「下中下」（底下行的 sec/csc）

底下行的函数（sec、csc），由**中间行与底下行**构成：

| 函数 | 导数（导相乘） | 积分（对对和） |
| :--- | :--- | :--- |
| **sec** | $(\sec x)' = \tan x \cdot \sec x$ | $\int \sec x\,dx = \ln\lvert\sec x + \tan x\rvert + C$ |
| **csc** | $(\csc x)' = -\cot x \cdot \csc x$ | $\int \csc x\,dx = -\ln\lvert\csc x + \cot x\rvert + C$ |

- **导相乘**：中间 × 底下（$\tan \cdot \sec$）
- **对对和**：求导时的两个因子配对，求和取对数绝对值（$\ln\lvert\sec + \tan\rvert$）

> **总结**：这一个六边形 + 十二个字，同时覆盖了 $\tan$/$\cot$/$\sec$/$\csc$ 四个函数的**求导**和**积分**——导数是"相乘"，积分是"求和取绝对值后取对数"。

#### 三角函数的常用积分公式总结

| 积分 | 结果 | 技巧来源 |
| :--- | :--- | :--- |
| $\displaystyle\int \tan x\,dx$ | $-\ln\lvert\cos x\rvert + C$ | 凑微分 |
| $\displaystyle\int \cot x\,dx$ | $\ln\lvert\sin x\rvert + C$ | 凑微分 |
| $\displaystyle\int \sec x\,dx$ | $\ln\lvert\sec x + \tan x\rvert + C$ | 乘共轭凑微分 |
| $\displaystyle\int \csc x\,dx$ | $\ln\lvert\csc x - \cot x\rvert + C$ | 乘共轭凑微分 |
| $\displaystyle\int \sec^3 x\,dx$ | $\frac{1}{2}(\sec x\tan x + \ln\lvert\sec x+\tan x\rvert) + C$ | 分部 + 循环 |
| $\displaystyle\int \frac{1}{a^2+x^2}\,dx$ | $\frac{1}{a}\arctan\frac{x}{a} + C$ | 凑微分 |
| $\displaystyle\int \frac{1}{\sqrt{a^2-x^2}}\,dx$ | $\arcsin\frac{x}{a} + C$ | 凑微分 |
| $\displaystyle\int \frac{1}{\sqrt{x^2 \pm a^2}}\,dx$ | $\ln\lvert x + \sqrt{x^2\pm a^2} \rvert + C$ | 三角换元 |

## 小结

1. 不定积分是**求导的逆运算**，$\int f(x)\,dx = F(x) + C$ 给出的是一个**原函数族**而不是一个函数——漏掉 $+C$ 只得到一个原函数。连续函数一定有原函数，同一函数的任意两个原函数之间只差常数。
2. **微分与积分互逆**：先积后导还原出 $f(x)$，先导后积还原出 $F(x) + C$（差一个常数）。基本积分表就是求导公式反过来读，所以记住求导公式比硬背积分表更根本。
3. $\int \frac{1}{x}\,dx = \ln\lvert x \rvert + C$ 里的绝对值不能省：$x < 0$ 时 $(\ln(-x))' = \frac{1}{x}$ 同样成立，原函数必须同时覆盖正负两种情况。
4. **线性性**（拆项、常数提到积分号外）是最基本的手段；被积函数含 $\tan^2 x$、$\sin^2 x$、$\cos^2 x$ 时，先用三角恒等式或**降幂公式**化为基本积分表中的形式，再逐项积分。
5. 第一类换元法（**凑微分**）的本质是凑出 $d\varphi(x) = \varphi'(x)\,dx$，关键在识别 $\varphi'(x)\,dx$ 的配对（$x\,dx = \frac{1}{2}d(x^2)$、$\frac{1}{x}dx = d(\ln\lvert x\rvert)$、$\cos x\,dx = d(\sin x)$）；凑不出来时，若被积函数含二次根式，就该转向第二类换元。
6. 第二类换元法方向相反：**主动设** $x = \psi(t)$，主要用来消去根号——$\sqrt{a^2-x^2}$ 配 $x = a\sin t$、$\sqrt{a^2+x^2}$ 配 $x = a\tan t$、$\sqrt{x^2-a^2}$ 配 $x = a\sec t$；算完必须把 $t$ **回代**成 $x$。
7. 三角函数积分的分界线是**奇次幂凑微分、偶次幂降幂**；$\sin mx\cos nx$ 这类不同频率的乘积一律先用**积化和差**化为和差。$\int\tan x\,dx$、$\int\cot x\,dx$、$\int\sec x\,dx$、$\int\csc x\,dx$ 与 $\int\sec^3 x\,dx$ 的结果应当直接记住，六边形**右侧三个函数**（$\cos$、$\cot$、$\csc$）求导与积分都带负号。
8. 根号内或分母是二次三项式时，标准流程是**配方 → 凑微分 → 套公式**：配成 $u^2 + a^2$ 用 $\arctan$（$\frac{1}{a}$ 这个系数不能漏），配成 $a^2 - u^2$ 用 $\arcsin$；分母能分解成 $x^2 - a^2$ 时则裂项出对数——$+$ 号出 $\arctan$，$-$ 号出对数。
9. **分部积分** $\int u\,dv = uv - \int v\,du$ 专门处理两类不同函数的乘积，选 $u$ 按「**反对幂指三**」，越靠前越优先作 $u$——反三角与对数函数求导后变简单，三角与指数函数积分后保持原形。
10. 分部积分有三类典型形态：$x^n$ 乘 $e^x$ 或三角函数要反复分部**降幂**，$e^{ax}\sin bx$ 分部两次后**移项解方程**，含 $\sqrt{x}$ 的先换元再分部；有理函数积分则按流程走——假分式先化「多项式 + 真分式」，真分式按分母因式裂项，动手前先看分子是否为分母导数的常数倍，而万能换元 $u = \tan\frac{x}{2}$ 只是兜底而非首选。
