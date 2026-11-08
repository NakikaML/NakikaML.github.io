---
title: 高等数学-8 多元函数微分学
description: 从二重极限与连续出发，讲透偏导数、全微分、复合与隐函数求导、几何应用、方向导数与梯度，最后求解多元函数极值。
category: 数学
subject: 数学
subfield: 高等数学
topic: 多元函数微分学
difficulty: 基础
date: "2026-11-08"
tags: [高等数学, 二重极限, 偏导数, 全微分, 方向导数, 梯度, 多元函数极值, 拉格朗日乘数法]
draft: false
featured: false
---

## 多元函数的基本概念

从一元到多元，微积分面临的核心变化不是"公式变得更复杂"，而是**自变量从一条线变成了一个面（或更高维空间）**。极限不再只是"从左和从右逼近"，而是"从任意方向逼近"；连续不再由左右极限相等保证，而是任意路径都收敛到同一点。这一节的核心任务就是建立多元函数的极限和连续理论，为后续的偏导数和全微分打下基础。

### 平面点集与多元函数

#### 坐标平面与点集

二元有序实数组 $(x,y)$ 的全体 $\mathbf{R}^{2} = \{(x,y) \mid x,y \in \mathbf{R}\}$ 称为坐标平面。具有某种性质的点的集合称为**平面点集**：$E = \{(x,y) \mid (x,y)\ \text{具有性质}\ P\}$。

#### 邻域

设 $P_{0}(x_{0},y_{0})$，$\delta > 0$，与 $P_{0}$ 距离小于 $\delta$ 的点 $P(x,y)$ 的全体称为 $P_{0}$ 的 **$\delta$ 邻域**：$U(P_{0},\delta) = \{P \mid |PP_{0}| < \delta\}$。去掉 $P_{0}$ 本身的称为**去心邻域** $\overset{\circ}{U}(P_{0},\delta)$。

#### 点与点集的关系

| 类型 | 定义 | 是否属于 $E$ |
| :--- | :--- | :--- |
| **内点** | 存在某个邻域完全包含于 $E$ | 必属于 |
| **外点** | 存在某个邻域与 $E$ 不相交 | 必不属于 |
| **边界点** | 任一邻域内既有 $E$ 中的点也有不是 $E$ 中的点 | 可能属于也可能不属于 |
| **聚点** | 任一去心邻域内总有 $E$ 中的点 | 可能属于也可能不属于 |

![点与点集 E 的关系：内点的某个邻域完全落在 E 内，外点的邻域与 E 不相交，边界点的每个邻域都横跨 E 的内外](/notes-assets/hm8-01-point-set-relations.svg)

> $E$ 的边界点的全体，称为 $E$ 的边界，记作 $\partial E$
>
> 内点必为聚点；外点必不为聚点。边界点可能是也可能不是聚点。

#### 重要的平面点集类型

- **开集**：所有点都是内点。**闭集**：所有聚点都属于该集（或没有聚点）。
- **连通集**：任意两点可用完全在集合内的折线连接。
- **（开）区域**：连通的开集。**闭区域**：开区域连同其边界。
- **有界集**：可被某个以原点为中心的圆包含；否则为**无界集**。

> 空集 $\varnothing$ 和全集 $\mathbf{R}^{2}$ 既是开集又是闭集

:::example 例 1 · 判断平面点集的类型
判定下列平面点集中哪些是开集、闭集、区域、有界集，并指出聚点集（导集）和边界。

(1) $\{(x,y) \mid x \neq 0, y \neq 0\}$ —— 开集（非区域）；无界；导集 $\mathbf{R}^{2}$；边界为两坐标轴。

(2) $\{(x,y) \mid 1 < x^{2}+y^{2} \le 4\}$ —— 非开非闭；有界；导集 $\{(x,y) \mid 1 \le x^{2}+y^{2} \le 4\}$；边界 $\{(x,y) \mid x^{2}+y^{2}=1 \text{ 或 } x^{2}+y^{2}=4\}$。

(3) $\{(x,y) \mid y \ge x^{2}\}$ —— 闭集；闭区域；无界；导集 $\{(x,y) \mid y \ge x^{2}\}$；边界 $\{(x,y) \mid y = x^{2}\}$。

**评注**："非开非闭"是常见题型——内环开（不包含）、外环闭（包含），导致既不是开集也不是闭集。

:::

### 多元函数的极限与连续

#### 二元函数的定义与图形

设 $D$ 是 $\mathbf{R}^{2}$ 的一个非空子集，称映射 $f: D \to \mathbf{R}$ 为定义在 $D$ 上的**二元函数**，通常记为 $z = f(x,y),\ (x,y) \in D$。其中 $D$ 称为定义域，$x,y$ 为自变量，$z$ 为因变量，函数值的全体构成值域。

推广到 $n$ 维：$u = f(x_1,x_2,\dots,x_n),\ (x_1,\dots,x_n) \in D \subset \mathbf{R}^{n}$。当 $n \ge 2$ 时统称为**多元函数**。

二元函数的图形通常是一张曲面——定义域 $D$ 是 $xOy$ 面上的一个区域，对于 $D$ 内每一点 $(x,y)$，在 $z$ 轴方向上取高度 $f(x,y)$，所有这些点构成的点集 $\{(x,y,z) \mid z=f(x,y),\ (x,y)\in D\}$ 就是函数的图形。

#### 二元函数的极限

设二元函数 $f(P)=f(x,y)$ 的定义域为 $D$，$P_0(x_0,y_0)$ 是 $D$ 的聚点。如果存在常数 $A$，对于任意给定的正数 $\varepsilon$，总存在正数 $\delta$，使得当点 $P(x,y) \in D \cap \overset{\circ}{U}(P_0,\delta)$ 时，都有：

$$
\lvert f(x,y) - A\rvert < \varepsilon
$$

成立，那么就称常数 $A$ 为函数 $f(x,y)$ 当 $(x,y) \to (x_0,y_0)$ 时的**二重极限**，记作：

$$
\lim_{(x,y)\to(x_0,y_0)} f(x,y) = A \quad \text{或} \quad \lim_{P\to P_0} f(P) = A
$$

![二重极限：动点以任意方式趋近 P0 时函数值都趋于 A](/notes-assets/hm8-02-double-limit-definition.jpg)

> **二重极限的核心要求——"以任何方式"**：动点 $P(x,y)$ 必须以**任意方式**（沿任意曲线、任意方向）趋近于 $P_0$ 时，$f(x,y)$ 都无限接近于同一个常数 $A$。这与一元极限有本质区别——一元极限只需考察左右两个方向的逼近，而二重极限要求在平面上无穷多条可能的路径上，极限值都一致。正是这个"任意路径"的要求，使得二重极限的存在性判断远比一元极限严格。

#### 证明二重极限不存在的方法——四种路径法

既然二重极限要求"任意路径都收敛到同一值"，要证明它**不存在**，只需找到两条路径给出不同极限值，或找到一条路径极限不存在。四种标准方法：

| 方法 | 操作 | 判定依据 |
| :--- | :--- | :--- |
| **单路径法** | 取一条特定路径（如 $y=x$） | 沿该路径极限为 $\infty$ 或不存在 ⇒ 二重极限不存在 |
| **双路径法** | 取两条不同路径（如 $y=x$ 和 $y=-x$） | 两条路径极限值不同 ⇒ 不存在 |
| **$y=kx^{p}$ 路径法** | 令 $y=kx^{p}$（含参数 $k$），代入化简 | 结果含 $k$ ⇒ 不存在（不同 $k$ 对应不同路径） |
| **极坐标换元法** | 令 $x=\rho\cos\theta,\ y=\rho\sin\theta$，令 $\rho\to 0^{+}$ | 结果与 $\theta$ 有关 ⇒ 不存在（不同 $\theta$ 对应不同方向） |

:::example 例 2 · 用单路径法证明二重极限不存在
证明 $\displaystyle\lim_{(x,y)\to(0,0)}\frac{x+y}{xy}$ 不存在。

**思路**：分母可以为零，取一条使分母保持非零的路径。

**解**：令 $y=x$：

$$
\lim_{x\to 0}\frac{2x}{x^{2}} = \lim_{x\to 0}\frac{2}{x} = \infty
$$

⇒ 极限不存在。

**评注**：单路径法最快——如果一条路径极限不存在（包括 $\infty$），直接下结论。

:::

:::example 例 3 · 一题三法证明二重极限不存在
证明 $\displaystyle\lim_{(x,y)\to(0,0)}\frac{xy}{x^{2}+y^{2}}$ 不存在。

**思路**：这道题是证明二重极限不存在的"标准模板"，恰好可以用三种不同方法各解一遍，对比学习。

**法一（双路径法）**：

令 $y=x$：$\displaystyle\lim_{x\to 0}\frac{x^{2}}{x^{2}+x^{2}} = \frac{1}{2}$

令 $y=-x$：$\displaystyle\lim_{x\to 0}\frac{-x^{2}}{x^{2}+x^{2}} = -\frac{1}{2}$

两条路径极限不同 ⇒ 不存在。

**法二（$y=kx$ 法）**：

令 $y=kx$（$k$ 为任意实数）：

$$
\lim_{x\to 0}\frac{kx^{2}}{x^{2}(1+k^{2})} = \frac{k}{1+k^{2}}
$$

结果依赖于 $k$（$k=1$ 得 $\frac{1}{2}$，$k=-1$ 得 $-\frac{1}{2}$）⇒ 不存在。

**法三（极坐标法）**：

令 $x=\rho\cos\theta,\ y=\rho\sin\theta$：

$$
\lim_{\rho\to 0^{+}}\frac{\rho^{2}\cos\theta\sin\theta}{\rho^{2}} = \cos\theta\sin\theta
$$

结果与 $\theta$ 有关 ⇒ 不存在。

**评注**：三种方法殊途同归。$y=kx$ 法最通用——如果代入后结果含 $k$，直接得证。极坐标法几何含义最清晰——$\theta$ 代表逼近的方向，与 $\theta$ 有关就是不沿所有方向收敛到同一值。

:::

:::example 例 4 · 所有直线路径极限相同也不等于极限存在
证明 $\displaystyle\lim_{(x,y)\to(0,0)}\frac{xy^{2}}{x^{2}+y^{4}}$ 不存在。

**思路**：先试试 $y=kx$（直线路径）：$\lim_{x\to 0}\frac{k^{2}x^{3}}{x^{2}+k^{4}x^{4}} = 0$，**所有直线路径都给出 $0$**——如果你就此下结论说"极限存在且为 $0$"，那就中计了。尝试曲线路径 $x=ky^{2}$（抛物线）。

**解**：令 $x=ky^{2}$：

$$
\lim_{y\to 0}\frac{(ky^{2})\cdot y^{2}}{k^{2}y^{4}+y^{4}} = \lim_{y\to 0}\frac{ky^{4}}{y^{4}(k^{2}+1)} = \frac{k}{k^{2}+1}
$$

结果与 $k$ 有关 ⇒ 极限不存在。

**评注**：这道题揭示了二重极限最深层的陷阱——**沿所有直线路径极限相同，不足以证明二重极限存在！** 因为二重极限要求沿**任意曲线**路径都收敛到同一值，直线只是无穷多路径中的一小部分。当你发现直线路径都给出相同结果时，要再试一条曲线路径（抛物线 $x=ky^{2}$ 是最常见的突破口）。

:::

:::example 例 5 · 分母在某条路径上恒为零时怎么办
证明 $\displaystyle\lim_{(x,y)\to(0,0)}\frac{x+y}{x-y}$ 不存在。

**思路**：这道题最直观的想法是令 $y=kx$，但当 $k=1$ 时分母为 $0$——也就是说不能沿 $y=x$ 这条直线逼近原点（分母恒为零，函数无定义）。这种情况下需要在 $y=x$ 的基础上**叠加一个高次项**使得分母保持非零，同时分子分母次数拉开差距。

**解**：令 $y=x+x^{2}$（在 $y=x$ 上叠加高次项 $x^{2}$，使得 $x-y=-x^{2} \neq 0$）：

$$
\lim_{x\to 0}\frac{x+(x+x^{2})}{x-(x+x^{2})} = \lim_{x\to 0}\frac{2x+x^{2}}{-x^{2}} = \infty
$$

⇒ 极限不存在。

**评注**：当最自然的路径（$y=kx$ 中的某个 $k$ 值）使分母为零时，就在该路径上叠加一个高次项——让分母的次数高于分子的次数，极限必然发散。这是处理"分母在某路径上恒为零"类问题的标准技巧。

:::

此外，还有一个快捷判敛结论：

对于形如 $\displaystyle\lim_{(x,y)\to(0,0)}\frac{x^{p}y^{q}}{x^{m}+y^{n}}$（$m,n\in\mathbb{N}^{*},\ p,q>0$）的极限，可以直接套用结论而无需每次重新选路径：

(1) 若 $m$ 和 $n$ 中有奇数 → **极限存在**

(2) 若 $m$ 和 $n$ 全为偶数：

- $\frac{p}{m}+\frac{q}{n} > 1$ → 极限 $=0$
- $\frac{p}{m}+\frac{q}{n} \le 1$ → **极限不存在**，取路径 $y = kx^{\frac{m-p}{q}}$ 即可证明

> 验证例 3：$\frac{xy}{x^{2}+y^{2}}$，$m=n=2$（全偶），$\frac{1}{2}+\frac{1}{2}=1 \le 1$ → 不存在 ✓。
>
> 验证例 4：$\frac{xy^{2}}{x^{2}+y^{4}}$，$m=2,\ n=4$（全偶），$\frac{1}{2}+\frac{2}{4}=1 \le 1$ → 不存在 ✓。

#### 二元函数的连续性

设二元函数 $f(P)=f(x,y)$ 的定义域为 $D$，$P_0(x_0,y_0)$ 为 $D$ 的聚点且 $P_0 \in D$。如果：

$$
\lim_{(x,y)\to(x_0,y_0)} f(x,y) = f(x_0,y_0)
$$

则称函数 $f(x,y)$ 在点 $P_0$ 处**连续**。不连续的点称为**间断点**。

![二元函数在点 P0 处连续的示意](/notes-assets/hm8-03-continuity.jpg)

> **多元初等函数**：由常数及具有不同自变量的一元基本初等函数经过有限次四则运算和复合得到的可用一个式子表示的多元函数。**一切多元初等函数在其定义域内是连续的**——这为下节的"直接代值求极限"提供了理论依据。

#### 有界闭区域上多元连续函数的性质

- **有界性与最值定理**：在有界闭区域 $D$ 上的多元连续函数必有界，且能取到最大值和最小值。
- **介值定理**：在有界闭区域上的多元连续函数必取得介于最大值和最小值之间的任何值。

#### 二重极限的计算方法

当极限存在（或可判定存在）时求值。五种方法先列出框架，再逐一配例题：

| 方法 | 操作 | 适用场景 |
| :--- | :--- | :--- |
| **直接代值** | 将 $(x_0,y_0)$ 直接代入 $f(x,y)$ | 函数在目标点连续 |
| **等价无穷小代换** | $\sin u\sim u,\ e^{u}-1\sim u,\ \ln(1+u)\sim u$ 等 | 复合变量 $u\to 0$ |
| **有界量 × 无穷小 = 0** | 拆出一个 $\to 0$ 的因子 × 一个有界因子 | 含 $\sin\frac{1}{u}$、$\frac{x}{\sqrt{x^{2}+y^{2}}}$ 等 |
| **夹逼准则** | 套绝对值，放大/缩小到已知极限的函数 | 表达式复杂但可放缩 |
| **极坐标代换** | $x=\rho\cos\theta,\ y=\rho\sin\theta,\ \rho\to 0^{+}$ | 验证极限存在且与路径无关 |

**(1) 连续点处直接代值**——若函数在目标点连续，直接代入坐标即得极限。

:::example 例 6 · 连续点处直接代值
求 $\displaystyle\lim_{(x,y)\to(1,2)}\frac{x+y}{xy}$。

**解**：函数 $\frac{x+y}{xy}$ 在 $(1,2)$ 处连续（分母不为零），直接代入：$\frac{1+2}{2} = \frac{3}{2}$。

**评注**：这是最省事的方法——只要判断函数在目标点连续（通常是初等函数且分母不为零），代入即答案。

:::

**(2) 等价无穷小代换**——多元极限中，只要复合变量 $u \to 0$，一元等价无穷小全部适用（$\sin u \sim u,\ e^{u}-1 \sim u,\ \ln(1+u) \sim u$ 等）。

:::example 例 7 · 用等价无穷小代换求二重极限
求下列二重极限。

(a) $\displaystyle\lim_{(x,y)\to(0,2)}\frac{\sin(xy^{2})}{x}$。

**解**：$\frac{\sin(xy^{2})}{x} = \frac{\sin(xy^{2})}{xy^{2}} \cdot y^{2}$。当 $(x,y)\to(0,2)$ 时 $xy^{2} \to 0$，$\frac{\sin(xy^{2})}{xy^{2}} \to 1$，$y^{2} \to 4$。极限 $=4$。

(b) $\displaystyle\lim_{(x,y)\to(0,0)}\frac{e^{xy}-1}{\sqrt{xy+4}-2}$。

**解**：$e^{xy}-1 \sim xy$（$xy\to 0$）。分母 $\sqrt{xy+4}-2 = \frac{xy}{\sqrt{xy+4}+2} \sim \frac{xy}{4}$。原式 $\sim \frac{xy}{xy/4} = 4$。

**评注**：(b) 中分母有理化是关键——$\sqrt{a+u}-\sqrt{a} = \frac{u}{\sqrt{a+u}+\sqrt{a}} \sim \frac{u}{2\sqrt{a}}$。

:::

**(3) 有界变量 × 无穷小 = 0**——一个趋于零的因子乘以一个有界量，极限为零。

:::example 例 8 · 有界量乘无穷小判定连续性
设

$$
f(x,y)=\begin{cases}(x^{2}+y^{2})\sin\frac{1}{\sqrt{x^{2}+y^{2}}}, & x^{2}+y^{2}\neq 0 \\ 0, & x^{2}+y^{2}=0\end{cases}
$$

讨论 $f(x,y)$ 在 $(0,0)$ 的连续性。

**思路**：连续性 = 极限值是否等于函数值。$(x^{2}+y^{2})$ 是无穷小（$\to 0$），$\sin\frac{1}{\sqrt{x^{2}+y^{2}}}$ 始终有界（$\lvert\sin u\rvert \le 1$），乘积 $\to 0$。

**解**：

$$
\lim_{(x,y)\to(0,0)} f(x,y) = \lim_{(x,y)\to(0,0)} (x^{2}+y^{2})\sin\frac{1}{\sqrt{x^{2}+y^{2}}} = 0 = f(0,0)
$$

⇒ $f(x,y)$ 在 $(0,0)$ 处连续。

**评注**：$\sin\frac{1}{\sqrt{x^{2}+y^{2}}}$ 在原点附近剧烈振荡（频率趋于无穷），但它始终在 $[-1,1]$ 之间——有界。乘以无穷小后，振荡的幅度被压到零。

:::

**(4) 夹逼准则**——套绝对值，放缩到已知极限的函数。

:::example 例 9 · 夹逼准则的三种解法
求 $\displaystyle\lim_{(x,y)\to(0,0)}\frac{xy}{\sqrt{x^{2}+y^{2}}}$。

**思路**：$\frac{xy}{\sqrt{x^{2}+y^{2}}}$ 中分子是二阶无穷小，分母是一阶无穷小，整体趋于 $0$。用三种方法验证。

**法一（夹逼）**：$0 \le \left\lvert\frac{xy}{\sqrt{x^{2}+y^{2}}}\right\rvert = \lvert x\rvert \cdot \frac{\lvert y\rvert}{\sqrt{x^{2}+y^{2}}} \le \lvert x\rvert \cdot 1 = \lvert x\rvert \to 0$，由夹逼准则极限 $=0$。

**法二（有界量 × 无穷小）**：$\left\lvert\frac{xy}{\sqrt{x^{2}+y^{2}}}\right\rvert = \lvert x\rvert \cdot \left\lvert\frac{y}{\sqrt{x^{2}+y^{2}}}\right\rvert$，$\frac{y}{\sqrt{x^{2}+y^{2}}}$ 有界（$\le 1$），$\lvert x\rvert \to 0$ ⇒ 极限 $=0$。

**法三（极坐标）**：$x=\rho\cos\theta,\ y=\rho\sin\theta$，原式 $=\frac{\rho^{2}\cos\theta\sin\theta}{\rho} = \rho\cos\theta\sin\theta \to 0$（$\rho\to 0$，$\cos\theta\sin\theta$ 有界）。

**评注**：三种方法殊途同归。极坐标法在"判断极限是否存在"时最有力——$\rho\to 0$ 后若与 $\theta$ 无关，则极限存在且等于该值。

:::

**(5) 综合应用**——多种技巧结合。

:::example 例 10 · 综合技巧求二重极限
求下列二重极限。

(a) $\displaystyle\lim_{(x,y)\to(0,0)}\frac{\ln(1+x^{2}y^{4})}{x^{2}+y^{2}}$：$\ln(1+x^{2}y^{4}) \sim x^{2}y^{4}$，原式 $=\frac{x^{2}y^{4}}{x^{2}+y^{2}} = y^{4} \cdot \frac{x^{2}}{x^{2}+y^{2}} \to 0 \cdot \text{有界量} = 0$。

(b) $\displaystyle\lim_{(x,y)\to(0,0)}\frac{x^{2}+y^{2}}{\lvert x\rvert+\lvert y\rvert}$：$=\lvert x\rvert\cdot\frac{\lvert x\rvert}{\lvert x\rvert+\lvert y\rvert} + \lvert y\rvert\cdot\frac{\lvert y\rvert}{\lvert x\rvert+\lvert y\rvert}$，每项中分数部分 $\le 1$，整体 $\le \lvert x\rvert+\lvert y\rvert \to 0$ ⇒ 极限 $=0$。

**评注**：(a) 的先等价代换再拆分为有界量×无穷小的套路，(b) 的拆项放缩法，都是处理复杂二重极限的标准武器。

:::

#### 二次极限与二重极限

前面讨论的 $\displaystyle\lim_{(x,y)\to(x_0,y_0)} f(x,y)$ 是**二重极限**——两个自变量**同时**趋近于目标点。还有一种写法是 $\displaystyle\lim_{x\to x_0}\lim_{y\to y_0} f(x,y)$——先固定 $x$，对 $y$ 求极限，得到一个关于 $x$ 的函数，再对 $x$ 求极限。这称为**二次极限**（或累次极限）。同理还有 $\displaystyle\lim_{y\to y_0}\lim_{x\to x_0} f(x,y)$。

**二重极限和二次极限是两个完全不同的概念**：

- 二重极限：$(x,y)$ 以**任意方式**同时趋近 $(x_0,y_0)$
- 二次极限：先沿一个方向取极限，再沿另一个方向取极限（先后的顺序是固定的）

它们之间没有必然的蕴含关系——一个存在不代表另一个存在，即使两者都存在也可能不相等。

:::example 例 11 · 二重极限存在而二次极限不存在
考虑 $f(x,y)=x\sin\frac{1}{y}+y\sin\frac{1}{x}$。

**二重极限**：$\displaystyle\lim_{(x,y)\to(0,0)}\left(x\sin\frac{1}{y}+y\sin\frac{1}{x}\right)=0$。因为 $\lvert x\sin\frac{1}{y}\rvert\le\lvert x\rvert\to 0$，$\lvert y\sin\frac{1}{x}\rvert\le\lvert y\rvert\to 0$（有界量 × 无穷小）。

**二次极限（先 $y$ 后 $x$）**：$\displaystyle\lim_{x\to 0}\lim_{y\to 0}\left(x\sin\frac{1}{y}+y\sin\frac{1}{x}\right)=\lim_{x\to 0}\left(\lim_{y\to 0}x\sin\frac{1}{y}+0\right)$。但对于任意固定的 $x\neq 0$，$\lim_{y\to 0}x\sin\frac{1}{y}$ 不存在（在 $x$ 和 $-x$ 之间振荡），因此整个二次极限**不存在**。

**评注**：这道题干净利落地展示了二重极限 ≠ 二次极限——二重极限 $=0$，但二次极限不存在。原因：二次极限中先对 $y$ 取极限时 $x$ 被"冻结"为一个固定的非零常数，而 $\sin\frac{1}{y}$ 在 $y\to 0$ 时剧烈振荡，乘以固定常数 $x$ 后仍然振荡无极限。

:::

## 偏导数

多元函数有多个自变量，求导时需要**逐个处理**——每次只对一个变量求导，其他变量"假装"是常数。这就是偏导数。形式上，偏导数是一元函数求导的直接推广；但含义上有本质区别——**偏导数存在不能保证函数连续**（这与一元函数"可导必连续"完全不同），因为偏导数只保证沿坐标轴两个特定方向的连续性，而连续需要任意方向的逼近都一致。

### 偏导数的定义与计算

#### 偏导数的定义

设函数 $z=f(x,y)$ 在点 $(x_{0},y_{0})$ 的某一邻域内有定义。当 $y$ 固定在 $y_{0}$ 而 $x$ 在 $x_{0}$ 处有增量 $\Delta x$ 时，相应的函数有增量 $f(x_{0}+\Delta x,y_{0})-f(x_{0},y_{0})$。如果极限

$$
\lim_{\Delta x\to 0}\frac{f(x_{0}+\Delta x,y_{0})-f(x_{0},y_{0})}{\Delta x}
$$

存在，那么称此极限为函数 $z=f(x,y)$ 在点 $(x_{0},y_{0})$ 处**对 $x$ 的偏导数**，记作

$$
\left.\frac{\partial z}{\partial x}\right|_{(x_{0},y_{0})},\quad \left.\frac{\partial f}{\partial x}\right|_{(x_{0},y_{0})},\quad \text{或}\quad f_x(x_{0},y_{0})
$$

类似地，函数 $z=f(x,y)$ 在点 $(x_{0},y_{0})$ 处**对 $y$ 的偏导数**定义为

$$
\left.\frac{\partial z}{\partial y}\right|_{(x_{0},y_{0})} = \lim_{\Delta y\to 0}\frac{f(x_{0},y_{0}+\Delta y)-f(x_{0},y_{0})}{\Delta y}
$$

#### 偏导函数的定义

如果函数 $z=f(x,y)$ 在区域 $D$ 内每一点 $(x,y)$ 处对 $x$ 的偏导数都存在，那么这个偏导数就是 $x,y$ 的函数，称为函数 $z=f(x,y)$ 对自变量 $x$ 的**偏导函数**，记作 $\frac{\partial z}{\partial x}$、$\frac{\partial f}{\partial x}$、或 $f_x(x,y)$。同理有对 $y$ 的偏导函数。偏导函数简称为**偏导数**。

#### 偏导数的计算方法

求 $\frac{\partial z}{\partial x}$ 时，将 $y$ 视为常数，对 $x$ 求导。求 $\frac{\partial z}{\partial y}$ 时，将 $x$ 视为常数，对 $y$ 求导。计算法则与一元函数求导完全相同——和差积商、链式法则等全部照用。

:::example 例 1 · 求二元函数的两个一阶偏导数
已知 $z=x^{2}\sin 2y$，求 $\frac{\partial z}{\partial x}$、$\frac{\partial z}{\partial y}$。

**解**：$\frac{\partial z}{\partial x}=2x\sin 2y$（$y$ 视为常数）；$\frac{\partial z}{\partial y}=2x^{2}\cos 2y$（$x$ 视为常数）。

:::

:::example 例 2 · 求指定点处偏导数的两种算法
求 $z=x^{2}+3xy+y^{2}$ 在点 $(1,2)$ 处的偏导数。

**思路**：法一先求偏导函数再代入；法二先把另一变量固定为指定值再求导。

**法一**：$\frac{\partial z}{\partial x}=2x+3y$，$\left.\frac{\partial z}{\partial x}\right|_{(1,2)}=8$；$\frac{\partial z}{\partial y}=3x+2y$，$\left.\frac{\partial z}{\partial y}\right|_{(1,2)}=7$。

**法二**：$\left.\frac{\partial z}{\partial x}\right|_{y=2}=\frac{\mathrm{d}}{\mathrm{d}x}(x^{2}+6x+4)=2x+6$，代入 $x=1$ 得 $8$。同理 $\left.\frac{\partial z}{\partial y}\right|_{x=1}=3+2y$，代入 $y=2$ 得 $7$。

**评注**：法二在函数形式复杂时更省力——先代入数值化为一元函数，再求导。

:::

:::example 例 3 · 证明关于偏导数的恒等式
设 $z=x^{y}\ (x>0,x\neq 1)$，求证 $\frac{x}{y}\frac{\partial z}{\partial x}+\frac{1}{\ln x}\frac{\partial z}{\partial y}=2z$。

**证明**：$\frac{\partial z}{\partial x}=y x^{y-1}$，$\frac{\partial z}{\partial y}=x^{y}\ln x$。左边 $=\frac{x}{y}\cdot y x^{y-1}+\frac{1}{\ln x}\cdot x^{y}\ln x=x^{y}+x^{y}=2z=$ 右边。

:::

:::example 例 4 · 用定义求分段函数在一点的偏导
设 $f(x,y)=\frac{2x+3y}{1+xy\sqrt{x^{2}+y^{2}}}$，求 $f_x(0,0)$ 和 $f_y(0,0)$。

**思路**：直接求偏导函数非常繁琐。利用偏导定义，固定一个变量为零后表达式大大简化。

**解**：$f_x(0,0)=\lim_{x\to 0}\frac{f(x,0)-f(0,0)}{x}=\lim_{x\to 0}\frac{2x-0}{x}=2$。同理 $f_y(0,0)=3$。

**评注**：求指定点的偏导数时，**先代入再求导**往往比先求偏导函数再代入简单得多。

:::

#### 多元函数连续性与偏导数的关系

> ⚠️ **偏导数都存在 ⇏ 函数连续**（这与一元函数"可导必连续"截然不同！）。偏导数存在只能保证函数沿 $x$ 轴和 $y$ 轴两个特定方向连续，但不能保证沿其他方向连续。

:::example 例 5 · 偏导存在但不连续的概念选择
$f(x,y)=\begin{cases}\frac{xy}{x^{2}+y^{2}},&(x,y)\neq(0,0)\\0,&(0,0)\end{cases}$ 在 $(0,0)$ 处（　）

A. 连续且偏导存在　B. 连续但偏导不存在　C. 不连续但偏导存在　D. 不连续且偏导不存在

**解**：选 **C**。$\lim_{(x,y)\to(0,0)}\frac{xy}{x^{2}+y^{2}}$ 不存在 ⇒ 不连续。但 $f_x(0,0)=\lim_{x\to 0}\frac{0}{x}=0$，$f_y(0,0)=\lim_{y\to 0}\frac{0}{y}=0$，偏导存在。

:::

反过来，多元函数连续也未必存在偏导数。例如 $z=\sqrt{x^{2}+y^{2}}$ 在 $(0,0)$ 处连续，但偏导数不存在（尖点）。

#### 偏导数的几何意义

对 $x$ 的偏导数 $f_x(x_0,y_0)$ 的几何意义：用平面 $y=y_0$ 去截曲面 $z=f(x,y)$，得到一条平面曲线 $z=f(x,y_0)$。$f_x(x_0,y_0)$ 就是这条曲线在点 $(x_0,y_0)$ 处的切线斜率（对 $x$ 轴的倾角的正切）。同理，$f_y(x_0,y_0)$ 是平面 $x=x_0$ 截出的曲线在该点的切线斜率。

![偏导数的几何意义：平面 y=y0 截曲面所得曲线的切线斜率](/notes-assets/hm8-04-partial-derivative-geometry.jpg)

:::example 例 6 · 用偏导数的几何意义求倾角
曲线 $\begin{cases}z=\frac{x^{2}+y^{2}}{4}\\y=4\end{cases}$ 在点 $(2,4,5)$ 处的切线对 $x$ 轴的倾角是多少？

**解**：$f(x,y)=\frac{x^{2}+y^{2}}{4}$，$f_x(x,y)=\frac{x}{2}$。$f_x(2,4)=1=\tan\alpha$ ⇒ $\alpha=\frac{\pi}{4}$。

:::

### 高阶偏导数

#### 二阶偏导数

设函数 $z=f(x,y)$ 在区域 $D$ 内具有偏导数 $f_x(x,y)$、$f_y(x,y)$，如果这两个偏导函数的偏导数也存在，则称它们是 $z=f(x,y)$ 的**二阶偏导数**。按照对变量求导的次序不同，有下列四种：

$$
\begin{aligned}
\frac{\partial}{\partial x}\!\left(\frac{\partial z}{\partial x}\right)=\frac{\partial^{2}z}{\partial x^{2}}=f_{xx}(x,y) && \frac{\partial}{\partial y}\!\left(\frac{\partial z}{\partial x}\right)=\frac{\partial^{2}z}{\partial x\partial y}=f_{xy}(x,y) \\
\frac{\partial}{\partial x}\!\left(\frac{\partial z}{\partial y}\right)=\frac{\partial^{2}z}{\partial y\partial x}=f_{yx}(x,y) && \frac{\partial}{\partial y}\!\left(\frac{\partial z}{\partial y}\right)=\frac{\partial^{2}z}{\partial y^{2}}=f_{yy}(x,y)
\end{aligned}
$$

其中 $f_{xy}$ 和 $f_{yx}$ 称为**混合偏导数**。同理可定义三阶、四阶直至 $n$ 阶偏导数。二阶及以上的偏导数统称为**高阶偏导数**。

> **定理（混合偏导数与次序无关的条件）**：如果在点 $(x,y)$ 的邻域内函数 $z=f(x,y)$ 的偏导数 $\dfrac{\partial z}{\partial x}$，$\dfrac{\partial z}{\partial y}$ 及 $\dfrac{\partial^{2}z}{\partial x\partial y}$ 都存在，且 $\dfrac{\partial^{2}z}{\partial y\partial x}$ 在点 $(x,y)$ 处连续，那么混合偏导数 $\dfrac{\partial^{2}z}{\partial y\partial x}$ 在点 $(x,y)$ 处也存在，且 $\dfrac{\partial^{2}z}{\partial y\partial x}=\dfrac{\partial^{2}z}{\partial x\partial y}$，换句话说，二阶混合偏导数在连续的条件下与求导次序无关
>
> 高阶偏导数在偏导连续的条件下也与求导次序无关，例：$f_{xxy}=f_{xyx}$

:::example 例 7 · 求二阶与三阶偏导数
设 $z=x^{3}y^{2}-3xy^{3}-xy+1$，求 $\frac{\partial^{2}z}{\partial x\partial y}$、$\frac{\partial^{2}z}{\partial y\partial x}$、$\frac{\partial^{3}z}{\partial x^{3}}$。

**解**：$\frac{\partial z}{\partial x}=3x^{2}y^{2}-3y^{3}-y$，$\frac{\partial^{2}z}{\partial x\partial y}=6x^{2}y-9y^{2}-1$。$\frac{\partial z}{\partial y}=2x^{3}y-9xy^{2}-x$，$\frac{\partial^{2}z}{\partial y\partial x}=6x^{2}y-9y^{2}-1$。两者相等（验证了定理）。$\frac{\partial^{3}z}{\partial x^{3}}=6y^{2}$。

**评注**：此例中 $f_{xy}=f_{yx}$，体现了混合偏导与求导次序无关的性质。

:::

:::example 例 8 · 验证拉普拉斯方程
验证 $z=\ln\sqrt{x^{2}+y^{2}}$ 满足拉普拉斯方程 $\frac{\partial^{2}z}{\partial x^{2}}+\frac{\partial^{2}z}{\partial y^{2}}=0$。

**解**：$z=\frac{1}{2}\ln(x^{2}+y^{2})$。$\frac{\partial z}{\partial x}=\frac{x}{x^{2}+y^{2}}$，$\frac{\partial^{2}z}{\partial x^{2}}=\frac{y^{2}-x^{2}}{(x^{2}+y^{2})^{2}}$。由对称性 $\frac{\partial^{2}z}{\partial y^{2}}=\frac{x^{2}-y^{2}}{(x^{2}+y^{2})^{2}}$。相加得 $0$。

:::

:::example 例 9 · 幂指函数的两个偏导数
设 $z=(1+xy)^{y}$，求 $z_x,\ z_y$。

**思路**：底和指数都含 $y$。$f(x)^{g(x)}=e^{g(x)\ln f(x)}$——这是处理幂指函数的标准套路。

**解**：$z=e^{y\ln(1+xy)}$。

$$
z_x = e^{y\ln(1+xy)}\cdot\frac{y^{2}}{1+xy}=y^{2}(1+xy)^{y-1}
$$

$$
z_y = e^{y\ln(1+xy)}\left[\ln(1+xy)+y\cdot\frac{x}{1+xy}\right] = (1+xy)^{y}\left[\ln(1+xy)+\frac{xy}{1+xy}\right]
$$

**评注**：对 $x$ 偏导时 $y$ 是常数，$(1+xy)^{y}$ 可以当作幂函数求导（$y$ 提到前面，指数减 $1$，再乘内层 $(1+xy)$ 对 $x$ 的导数 $y$）。但对 $y$ 偏导时底和指数都含 $y$，必须化 $e^{y\ln(1+xy)}$。

:::

:::example 例 10 · 三元幂指函数的三个偏导数
设 $u=x^{\frac{y}{z}}$，求 $\frac{\partial u}{\partial x},\frac{\partial u}{\partial y},\frac{\partial u}{\partial z}$。

**解**：$\frac{\partial u}{\partial x}=\frac{y}{z}x^{\frac{y}{z}-1}$（视 $y,z$ 为常数，幂函数求导）。$\frac{\partial u}{\partial y}=x^{\frac{y}{z}}\ln x\cdot\frac{1}{z}$（视 $x,z$ 为常数，指数函数求导）。$\frac{\partial u}{\partial z}=x^{\frac{y}{z}}\ln x\cdot y\cdot(-\frac{1}{z^{2}})$。

:::

## 全微分

一元函数的微分 $dy=f'(x)dx$ 表示"当自变量 $x$ 变化微小量时，因变量 $y$ 近似变化多少"。将这个思想推广到二元：当 $x$ 和 $y$ **同时**有微小变化时，$z$ 的总变化近似等于各自方向变化的**叠加**——这就是全微分的核心思想。但并不是所有函数都可微——可微需要比偏导存在更强的条件。本节的核心任务就是理清"连续、偏导存在、偏导连续、可微"之间的逻辑关系，这是多元微分学中最容易混淆的一组概念关系。

#### 偏增量、全增量与全微分

对于一元函数，$\Delta y = f(x_0+\Delta x)-f(x_0) = A\Delta x + o(\Delta x) \approx dy$。

对于二元函数，$f(x_0+\Delta x, y_0)-f(x_0,y_0) \approx f_x(x,y)\Delta x$ 称为对 $x$ 的**偏增量**，$f_x(x,y)\Delta x$ 称为对 $x$ 的**偏微分**。对 $y$ 同理。

函数值的总变化 $\Delta z = f(x+\Delta x, y+\Delta y)-f(x,y)$ 称为**全增量**。如果全增量可以表示为

$$
\Delta z = A\Delta x + B\Delta y + o(\rho),\quad \rho=\sqrt{(\Delta x)^{2}+(\Delta y)^{2}}
$$

其中 $A,B$ 不依赖于 $\Delta x,\Delta y$ 而仅与 $x,y$ 有关，则称函数 $z=f(x,y)$ 在点 $(x,y)$ **可微分**，$A\Delta x+B\Delta y$ 称为**全微分**，记作

$$
dz = A\Delta x + B\Delta y
$$

习惯上，自变量的微分等于它的增量：$\Delta x = dx,\ \Delta y = dy$。故全微分常写为 $dz = Adx + Bdy$。

#### 可微的等价定义

函数 $z=f(x,y)$ 在点 $(x_0,y_0)$ 可微 ⇔

$$
\lim_{(\Delta x,\Delta y)\to(0,0)}\frac{\Delta z - (A\Delta x+B\Delta y)}{\sqrt{(\Delta x)^{2}+(\Delta y)^{2}}} = 0
$$

其中 $A,B$ 不依赖于 $\Delta x,\Delta y$。当函数可微时，必有 $A=f_x(x_0,y_0),\ B=f_y(x_0,y_0)$。

:::example 例 1 · 由等价定义反推可微并求全微分
设 $z=f(x,y)$ 满足

$$
\lim_{(x,y)\to(0,1)}\frac{f(x,y)-f(0,1)-2x+y-1}{\sqrt{x^{2}+(y-1)^{2}}}=0
$$

问 $f$ 在 $(0,1)$ 是否可微？并求 $dz|_{(0,1)}$。

**解**：以 $(0,1)$ 为基准点，令 $\Delta x = x-0 = x$，$\Delta y = y-1$，则 $x=\Delta x,\ y=1+\Delta y$。分母 $\sqrt{x^{2}+(y-1)^{2}}=\sqrt{(\Delta x)^{2}+(\Delta y)^{2}}=\rho$。将分子改写：

$$
\begin{aligned}
f(x,y)-f(0,1)-2x+y-1
&= f(\Delta x,1+\Delta y)-f(0,1)-2\Delta x+(1+\Delta y)-1 \\
&= \underbrace{[f(\Delta x,1+\Delta y)-f(0,1)]}_{\Delta z} - \underbrace{(2\Delta x - \Delta y)}_{A\Delta x+B\Delta y}
\end{aligned}
$$

原极限式化为 $\displaystyle\lim_{\rho\to 0}\frac{\Delta z-(2\Delta x-\Delta y)}{\rho}=0$，即 $\Delta z=2\Delta x-\Delta y+o(\rho)$。对照 $\Delta z=A\Delta x+B\Delta y+o(\rho)$，读出 $A=2,\ B=-1$。故 $f$ 在 $(0,1)$ 可微，且 $dz|_{(0,1)}=2dx-dy$。

**评注**：这类题的关键——先识别基准点，设 $\Delta x=x-x_0,\ \Delta y=y-y_0$，把分子重新整理为 $\Delta z-(A\Delta x+B\Delta y)$。标准形式一旦凑出来，$A,B$ 直接就是 $f_x,f_y$。

:::

#### 可微的几何意义——局部可线性化

一元函数可微 ⇔ 存在切线逼近曲线；二元函数可微 ⇔ 存在**切平面**逼近曲面。可微的本质就是"以直代曲"——在该点附近能用线性函数无限逼近原函数。

#### 可微的必要条件

如果函数 $z=f(x,y)$ 在点 $(x,y)$ 可微分，则它在该点的偏导数必定存在，且

$$
dz = \frac{\partial z}{\partial x}dx + \frac{\partial z}{\partial y}dy
$$

:::tip 可微必有偏导的证明思路
可微 ⇒ $\Delta z = A\Delta x+B\Delta y+o(\rho)$。令 $\Delta y=0$，则 $\Delta z = A\Delta x+o(|\Delta x|)$，除以 $\Delta x$ 取极限得 $f_x=A$。同理 $f_y=B$。

:::

> **全微分叠加原理（三元推广）**：若 $u=f(x,y,z)$ 可微，则 $du = \frac{\partial u}{\partial x}dx+\frac{\partial u}{\partial y}dy+\frac{\partial u}{\partial z}dz$。

:::example 例 2 · 求二元函数的全微分
求 $z=x^{2}y+y^{2}$ 的全微分。

**解**：$\frac{\partial z}{\partial x}=2xy$，$\frac{\partial z}{\partial y}=x^{2}+2y$。$dz=2xy\,dx+(x^{2}+2y)dy$。

:::

:::example 例 3 · 求三元函数的全微分
求 $u=x+\sin\frac{y}{2}+e^{yz}$ 的全微分。

**解**：$\frac{\partial u}{\partial x}=1,\ \frac{\partial u}{\partial y}=\frac{1}{2}\cos\frac{y}{2}+ze^{yz},\ \frac{\partial u}{\partial z}=ye^{yz}$。$du=dx+(\frac{1}{2}\cos\frac{y}{2}+ze^{yz})dy+ye^{yz}dz$。

:::

:::example 例 4 · 求指定点的全微分与数值全微分
求 $z=e^{xy}$ 在 $(2,1)$ 的全微分；以及当 $x=1,y=1,\Delta x=0.15,\Delta y=0.1$ 时的全微分。

**解**：$f_x=ye^{xy}$，$f_y=xe^{xy}$。$dz|_{(2,1)}=e^{2}dx+2e^{2}dy$。$dz|_{(1,1)}=e\cdot0.15+e\cdot0.1=0.25e$。

**评注**：全微分的数值近似：$\Delta z \approx dz$。这是全微分最实用的功能——用线性近似代替精确计算。

:::

#### 可微的充分条件

**定理（偏导连续 ⇒ 可微）**：如果函数 $z=f(x,y)$ 的偏导数 $f_x,\ f_y$ 存在且在点 $(x,y)$ **连续**，那么函数在该点**可微分**。

:::tip 偏导连续推出可微的证明思路
全增量拆为两段：$\Delta z = [f(x_0+\Delta x,y_0+\Delta y)-f(x_0,y_0+\Delta y)] + [f(x_0,y_0+\Delta y)-f(x_0,y_0)]$。两段分别用拉格朗日中值定理，引入 $f_x$ 和 $f_y$。由偏导的连续性，$f_x(\xi,y_0+\Delta y)=f_x(x_0,y_0)+\varepsilon_1$（$\varepsilon_1\to0$），$f_y(x_0,\eta)=f_y(x_0,y_0)+\varepsilon_2$。代入得 $\Delta z = f_x\Delta x+f_y\Delta y+\varepsilon_1\Delta x+\varepsilon_2\Delta y$，最后两项可证为 $o(\rho)$。

:::

> 注意：偏导连续是**充分条件**而非必要条件——可微的函数其偏导未必连续（见下面例 6）。因此，验证可微最可靠的方法仍是等价定义 $\frac{\Delta z-(f_x\Delta x+f_y\Delta y)}{\rho}\to 0$。

:::example 例 5 · 偏导存在但不可微
设 $f(x,y)=\begin{cases}\frac{xy}{\sqrt{x^{2}+y^{2}}},&(x,y)\neq(0,0)\\0,&(0,0)\end{cases}$，讨论在 $(0,0)$ 是否可微。

**思路**：先验证偏导存在性（用定义），再检验可微等价条件。

**解**：$f_x(0,0)=\lim_{x\to 0}\frac{f(x,0)-f(0,0)}{x}=0$，同理 $f_y(0,0)=0$。检验可微：

$$
\lim_{(\Delta x,\Delta y)\to(0,0)}\frac{\frac{\Delta x\Delta y}{\sqrt{(\Delta x)^{2}+(\Delta y)^{2}}}-0}{\sqrt{(\Delta x)^{2}+(\Delta y)^{2}}} = \lim\frac{\Delta x\Delta y}{(\Delta x)^{2}+(\Delta y)^{2}} \text{ 不存在}
$$

⇒ **不可微**。

**评注**：偏导存在 ≠ 可微——形式上的 $0\cdot dx+0\cdot dy$ 不等于全微分。

:::

:::example 例 6 · 可微但偏导不连续
设 $f(x,y)=\begin{cases}(x^{2}+y^{2})\sin\frac{1}{x^{2}+y^{2}},&(x,y)\neq(0,0)\\0,&(0,0)\end{cases}$，问：

(1) 在 $(0,0)$ 是否可微？(2) 偏导是否连续？

**解**：

(1) $f_x(0,0)=f_y(0,0)=0$。检验可微：$\frac{[(\Delta x)^{2}+(\Delta y)^{2}]\sin\frac{1}{(\Delta x)^{2}+(\Delta y)^{2}}}{\rho} = \rho\sin\frac{1}{\rho^{2}}\to 0$ ⇒ **可微**。

(2) $(x,y)\neq(0,0)$ 时 $f_x = 2x\sin\frac{1}{x^{2}+y^{2}} - \frac{2x}{x^{2}+y^{2}}\cos\frac{1}{x^{2}+y^{2}}$。$\lim_{(x,y)\to(0,0)}f_x$ 不存在（第二项振荡无极限）⇒ $f_x$ 在 $(0,0)$ **不连续**。

**评注**：可微 ⇏ 偏导连续。例 5（偏导存在 ⇏ 可微）和例 6（可微 ⇏ 偏导连续）是一对"镜像反例"——完整的关系图见 8.7 节末尾的"金字塔"。

:::

## 多元复合函数的求导法则

一元复合函数求导的核心是链式法则：$\frac{dz}{dx}=\frac{dz}{du}\cdot\frac{du}{dx}$。多元复合函数的思想完全一样——**"路径相乘，多路求和"**。自变量到最终函数之间可能有多条依赖路径，每条路径上的偏导相乘，所有路径的结果相加。理解了"画变量依赖树→沿路径求偏导→求和"的三步法，无论复合结构多复杂都能写出正确的求导公式。

#### 一元函数与多元函数复合——全导数

如果 $z=f(u,v)$，而 $u=\varphi(t),\ v=\psi(t)$，则复合函数 $z=f[\varphi(t),\psi(t)]$ 是 $t$ 的一元函数，它对 $t$ 的导数称为**全导数**：

$$
\frac{dz}{dt} = \frac{\partial z}{\partial u}\cdot\frac{du}{dt} + \frac{\partial z}{\partial v}\cdot\frac{dv}{dt}
$$

:::example 例 1 · 用链式法则与直接代入求全导数
设 $z=u^{2}+v$，$u=x^{3}$，$v=\sin x$，求 $\frac{dz}{dx}$。

**法一（链式）**：$\frac{dz}{dx}=\frac{\partial z}{\partial u}\frac{du}{dx}+\frac{\partial z}{\partial v}\frac{dv}{dx}=2u\cdot3x^{2}+1\cdot\cos x=6x^{5}+\cos x$。

**法二（代入）**：$z=x^{6}+\sin x$ ⇒ $\frac{dz}{dx}=6x^{5}+\cos x$。

**评注**：两法结果一致。链式法则在中间变量复杂时威力更大——不需要把复合结果显式写出来。

:::

#### 多元函数与多元函数复合

如果 $z=f(u,v)$，而 $u=\varphi(x,y),\ v=\psi(x,y)$，则复合函数 $z=f[\varphi(x,y),\psi(x,y)]$ 是 $x,y$ 的二元函数：

$$
\frac{\partial z}{\partial x} = \frac{\partial z}{\partial u}\cdot\frac{\partial u}{\partial x} + \frac{\partial z}{\partial v}\cdot\frac{\partial v}{\partial x},\qquad \frac{\partial z}{\partial y} = \frac{\partial z}{\partial u}\cdot\frac{\partial u}{\partial y} + \frac{\partial z}{\partial v}\cdot\frac{\partial v}{\partial y}
$$

> **记忆技巧——变量依赖树**：从自变量 $(x,y)$ 出发，画出到最终函数 $z$ 的所有路径：$x\to u\to z$、$x\to v\to z$、$y\to u\to z$、$y\to v\to z$。每条路径上的偏导相乘，同自变量的不同路径相加。

:::example 例 2 · 基本复合结构求偏导
设 $z=e^{u}\sin v$，$u=xy$，$v=x+y$，求 $\frac{\partial z}{\partial x},\frac{\partial z}{\partial y}$。

**解**：$\frac{\partial z}{\partial x}=e^{u}\sin v\cdot y+e^{u}\cos v\cdot 1=e^{xy}[y\sin(x+y)+\cos(x+y)]$。

$\frac{\partial z}{\partial y}=e^{u}\sin v\cdot x+e^{u}\cos v\cdot 1=e^{xy}[x\sin(x+y)+\cos(x+y)]$。

:::

#### 中间变量与自变量混合的情形

如果 $z=f(u,x,y)$，其中 $u=\varphi(x,y)$，注意 $f$ 既是 $u$ 的函数又直接依赖于 $x,y$。此时：

$$
\frac{\partial z}{\partial x} = \frac{\partial f}{\partial u}\cdot\frac{\partial u}{\partial x} + \frac{\partial f}{\partial x},\qquad \frac{\partial z}{\partial y} = \frac{\partial f}{\partial u}\cdot\frac{\partial u}{\partial y} + \frac{\partial f}{\partial y}
$$

> ⚠️ 此处 $\frac{\partial z}{\partial x}$ 和 $\frac{\partial f}{\partial x}$ 含义不同！$z$ 是 $x,y$ 的二元函数（$u$ 已被 $x,y$ 表示），而 $f$ 是 $u,x,y$ 的三元函数。$\frac{\partial f}{\partial x}$ 表示在 $f(u,x,y)$ 中把 $u$ 和 $y$ 固定，对第三个位置求偏导。

:::example 例 3 · 混合情形下区分 z 与 f 的偏导
设 $z=f(u,x,y)=u^{2}+x+2y$，$u=xy$。求 $\frac{\partial z}{\partial x}$ 和 $\frac{\partial f}{\partial x}$。

**解**：代入 $u=xy$ 得 $z=x^{2}y^{2}+x+2y$ ⇒ $\frac{\partial z}{\partial x}=2xy^{2}+1$。而 $\frac{\partial f}{\partial x}$ 是在 $f(u,x,y)$ 中视 $u,y$ 为常数对 $x$ 求偏导：$\frac{\partial f}{\partial x}=1$。两者不相等——因为 $z$ 中的 $x$ 还通过 $u$ 间接影响函数值。

:::

#### 抽象复合函数的高阶偏导数

:::example 例 4 · 抽象复合函数的一阶与二阶偏导
设 $w=f(x+y+z,\ xyz)$，$f$ 具有二阶连续偏导数，求 $\frac{\partial w}{\partial x}$ 及 $\frac{\partial^{2}w}{\partial x\partial z}$。

**思路**：引入中间变量 $u=x+y+z,\ v=xyz$。用 $f_u$（或 $f_1'$）表示对第一个中间变量的偏导，$f_v$（或 $f_2'$）表示对第二个的偏导。

**解**：$\frac{\partial w}{\partial x}=f_u\cdot 1+f_v\cdot yz=f_u+yz f_v$。

$$
\begin{aligned}
\frac{\partial^{2}w}{\partial x\partial z} &= \frac{\partial}{\partial z}(f_u+yz f_v) = \frac{\partial f_u}{\partial z} + y\left(f_v + z\frac{\partial f_v}{\partial z}\right) \\
&= (f_{uu}\cdot 1+f_{uv}\cdot xy) + y[f_v + z(f_{vu}\cdot 1+f_{vv}\cdot xy)]
\end{aligned}
$$

**评注**：求二阶偏导时，**$f_u$ 和 $f_v$ 仍然是复合函数**——它们依赖于 $u,v$，而 $u,v$ 又依赖于 $x,y,z$。所以再对 $z$ 求导时，$f_u$ 和 $f_v$ 也需要再用链式法则展开。记 $f_1',f_2'$ 和 $f_{11}'',f_{12}'',f_{22}''$ 是常见的简化写法。

:::

:::example 例 5 · 极坐标下把偏导组合式改写
设 $u=f(x,y)$ 所有二阶偏导连续，将 $(\frac{\partial u}{\partial x})^{2}+(\frac{\partial u}{\partial y})^{2}$ 转换为极坐标系中的形式。

**思路**：$x=\rho\cos\theta,\ y=\rho\sin\theta$。先反解 $\rho=\sqrt{x^{2}+y^{2}},\ \theta=\arctan\frac{y}{x}$，再用链式法则。

**解**：$\frac{\partial u}{\partial x}=\frac{\partial u}{\partial\rho}\cos\theta-\frac{\partial u}{\partial\theta}\frac{\sin\theta}{\rho}$，$\frac{\partial u}{\partial y}=\frac{\partial u}{\partial\rho}\sin\theta+\frac{\partial u}{\partial\theta}\frac{\cos\theta}{\rho}$。代入得：

$$
\left(\frac{\partial u}{\partial x}\right)^{2}+\left(\frac{\partial u}{\partial y}\right)^{2} = \left(\frac{\partial u}{\partial\rho}\right)^{2}+\frac{1}{\rho^{2}}\left(\frac{\partial u}{\partial\theta}\right)^{2}
$$

**评注**：这是 Laplace 算子在极坐标下的表达式的关键组成部分，在偏微分方程和物理（热传导、波动方程）中大量使用。

:::

#### 全微分形式不变性

无论 $u,v$ 是自变量还是中间变量，函数 $z=f(u,v)$ 的全微分形式始终为

$$
dz = \frac{\partial z}{\partial u}du + \frac{\partial z}{\partial v}dv
$$

> 利用这个性质可以**绕过链式法则**——先写出 $dz$ 用 $du,dv$ 的表达式，再把 $du,dv$ 用 $dx,dy$ 表示，凑出 $\frac{\partial z}{\partial x}$ 和 $\frac{\partial z}{\partial y}$。

## 隐函数的求导公式

方程 $F(x,y)=0$ 隐含地定义了 $y$ 是 $x$ 的函数，但我们往往无法（或不愿）解出显式表达式 $y=f(x)$。隐函数存在定理告诉我们：只要 $F_y\neq 0$，可以直接用偏导数的比值求出导数——$dy/dx = -F_x/F_y$。这个简洁的公式是 8.4 复合求导法则的直接应用，它将"隐式关系"转化为"显式导数"，是多元微分学最优雅的工具之一。

### 单个方程情形

#### 一元隐函数存在定理

设函数 $F(x,y)$ 在点 $(x_0,y_0)$ 的某一邻域内具有连续偏导数，且 $F(x_0,y_0)=0$，$F_y(x_0,y_0)\neq 0$。则方程 $F(x,y)=0$ 在点 $(x_0,y_0)$ 的某一邻域内恒能唯一确定一个连续且具有连续导数的函数 $y=f(x)$，满足 $y_0=f(x_0)$，并有

$$
\frac{dy}{dx} = -\frac{F_x}{F_y}
$$

:::tip 隐函数求导公式的推导思路
$F(x,f(x))\equiv 0$ 两边对 $x$ 求全导数：$F_x + F_y\cdot\frac{dy}{dx}=0$，移项即得。

:::

:::example 例 1 · 一元隐函数求导的两种算法
已知 $e^{y}+x^{2}y=6$，求 $\frac{dy}{dx}$。

**法一（直接求导）**：两边对 $x$ 求导：$e^{y}\cdot\frac{dy}{dx}+2xy+x^{2}\frac{dy}{dx}=0$ ⇒ $\frac{dy}{dx}=-\frac{2xy}{e^{y}+x^{2}}$。

**法二（隐函数公式）**：$F(x,y)=e^{y}+x^{2}y-6=0$，$F_x=2xy,\ F_y=e^{y}+x^{2}$ ⇒ $\frac{dy}{dx}=-\frac{2xy}{e^{y}+x^{2}}$。

:::

:::example 例 2 · 隐函数求一阶与二阶导数
已知 $x^{2}+y^{2}-1=0$，求 $\frac{dy}{dx}$ 及 $\frac{d^{2}y}{dx^{2}}$。

**解**：$\frac{dy}{dx}=-\frac{F_x}{F_y}=-\frac{2x}{2y}=-\frac{x}{y}$。

$$
\frac{d^{2}y}{dx^{2}}=\frac{d}{dx}\!\left(-\frac{x}{y}\right)=-\frac{y-x\cdot\frac{dy}{dx}}{y^{2}}=-\frac{y+\frac{x^{2}}{y}}{y^{2}}=-\frac{x^{2}+y^{2}}{y^{3}}=-\frac{1}{y^{3}}
$$

**评注**：隐函数求二阶导时，先求一阶导（会含 $y$），再对 $x$ 求导时将 $\frac{dy}{dx}$ 用已得的一阶导表达式代入。

:::

#### 二元隐函数存在定理

设函数 $F(x,y,z)$ 在点 $(x_0,y_0,z_0)$ 的某一邻域内具有连续偏导数，且 $F(x_0,y_0,z_0)=0$，$F_z(x_0,y_0,z_0)\neq 0$。则方程 $F(x,y,z)=0$ 在点 $(x_0,y_0,z_0)$ 的某一邻域内恒能唯一确定一个连续且具有连续偏导数的函数 $z=f(x,y)$，并有

$$
\frac{\partial z}{\partial x} = -\frac{F_x}{F_z},\qquad \frac{\partial z}{\partial y} = -\frac{F_y}{F_z}
$$

:::example 例 3 · 求二元隐函数的两个偏导
已知 $x^{2}yz+z^{2}=0$，求 $\frac{\partial z}{\partial x},\ \frac{\partial z}{\partial y}$。

**解**：$F(x,y,z)=x^{2}yz+z^{2}=0$。$F_x=2xyz,\ F_y=x^{2}z,\ F_z=x^{2}y+2z$。

$$
\frac{\partial z}{\partial x}=-\frac{2xyz}{x^{2}y+2z},\quad \frac{\partial z}{\partial y}=-\frac{x^{2}z}{x^{2}y+2z}
$$

:::

:::example 例 4 · 求二元隐函数的二阶偏导
设 $x^{2}+y^{2}+z^{2}-4z=0$，求 $\frac{\partial^{2}z}{\partial x^{2}}$。

**解**：$\frac{\partial z}{\partial x}=-\frac{F_x}{F_z}=-\frac{2x}{2z-4}=\frac{x}{2-z}$。

$$
\frac{\partial^{2}z}{\partial x^{2}}=\frac{\partial}{\partial x}\!\left(\frac{x}{2-z}\right)=\frac{(2-z)-x(-\frac{\partial z}{\partial x})}{(2-z)^{2}}=\frac{(2-z)+\frac{x^{2}}{2-z}}{(2-z)^{2}}=\frac{(2-z)^{2}+x^{2}}{(2-z)^{3}}
$$

:::

:::example 例 5 · 隐函数与复合函数结合的证明题
设 $\Phi(u,v)$ 具有连续偏导数，证明由方程 $\Phi(cx-az,\ cy-bz)=0$ 所确定的函数 $z=f(x,y)$ 满足 $a\frac{\partial z}{\partial x}+b\frac{\partial z}{\partial y}=c$。

**思路**：先令 $F(x,y,z)=\Phi(cx-az,\ cy-bz)=0$，用隐函数公式写出偏导，再代入左边验证。

**证明**：$F_x = \Phi_1'\cdot c$，$F_y = \Phi_2'\cdot c$，$F_z = \Phi_1'\cdot(-a)+\Phi_2'\cdot(-b)$。

$\frac{\partial z}{\partial x}= -\frac{c\Phi_1'}{-a\Phi_1'-b\Phi_2'}$，$\frac{\partial z}{\partial y}= -\frac{c\Phi_2'}{-a\Phi_1'-b\Phi_2'}$。代入左边得 $a\frac{\partial z}{\partial x}+b\frac{\partial z}{\partial y}=c$。证毕。

**评注**：隐函数与复合函数结合是综合证明题的经典题型。关键：正确识别 $F(x,y,z)=0$ 的形式，并用链式法则计算 $F_x,F_y,F_z$。

:::

### 方程组情形——雅可比行列式

设方程组 $\begin{cases}F(x,y,u,v)=0\\G(x,y,u,v)=0\end{cases}$ 确定隐函数 $u=u(x,y),\ v=v(x,y)$。当雅可比行列式

$$
J = \frac{\partial(F,G)}{\partial(u,v)} = \begin{vmatrix}F_u & F_v \\ G_u & G_v\end{vmatrix} \neq 0
$$

时，可用行列式之比分量的形式求出偏导数。例如对 $x$ 求偏导时：

$$
\frac{\partial u}{\partial x} = -\frac{1}{J}\frac{\partial(F,G)}{\partial(x,v)} = -\frac{\begin{vmatrix}F_x & F_v \\ G_x & G_v\end{vmatrix}}{\begin{vmatrix}F_u & F_v \\ G_u & G_v\end{vmatrix}}
$$

> **记忆法**：分母永远是 $J=\frac{\partial(F,G)}{\partial(u,v)}$；分子是把 $J$ 中要求偏导的那个变量（如求 $\frac{\partial u}{\partial x}$ 时把 $u$ 列）换成对哪个自变量求偏导（换成 $x$ 列）。

:::example 例 6 · 用雅可比行列式求方程组的偏导
设 $\begin{cases}xu-yv=0\\yu+xv=1\end{cases}$，求 $\frac{\partial u}{\partial x},\frac{\partial u}{\partial y},\frac{\partial v}{\partial x},\frac{\partial v}{\partial y}$。

**思路**：可以分别对 $x$ 和 $y$ 求偏导（视另一变量为常数），构造线性方程组用克莱姆法则求解。

**解**：对 $x$ 求偏导：

$$
\begin{cases}u+xu_x-yv_x=0\\yu_x+v+xv_x=0\end{cases} \Rightarrow \begin{cases}xu_x-yv_x=-u\\yu_x+xv_x=-v\end{cases}
$$

$$
J=\begin{vmatrix}x&-y\\y&x\end{vmatrix}=x^{2}+y^{2},\quad u_x=\frac{\begin{vmatrix}-u&-y\\-v&x\end{vmatrix}}{J}=-\frac{xu+yv}{x^{2}+y^{2}}
$$

类似可求得 $v_x=\frac{yu-xv}{x^{2}+y^{2}}$，$u_y=\frac{xv-yu}{x^{2}+y^{2}}$，$v_y=-\frac{xu+yv}{x^{2}+y^{2}}$。

:::

## 多元函数微分学的几何应用

有了偏导数和全微分的工具，现在回到几何——用导数来描述空间曲线和曲面的局部线性逼近。这一节是 8.2~8.5 的"终极应用"：切线的方向向量是导向量（偏导数的几何化身），切平面的法向量是梯度（偏导数组成的向量）。同时这一节与高等数学-7 向量代数与空间解析几何直接衔接——切线就是空间直线（点向式），法平面和切平面就是空间平面（点法式）。联合使用这两章的知识，一切关于曲线和曲面的切线、法平面、切平面、法线问题都可以按固定流程解决。

### 一元向量值函数及其导数

#### 向量值函数的概念

前面讨论的函数都是"输入一个数，输出一个数"。现在引入一个新的对象——**一元向量值函数**："输入一个数 $t$，输出一个向量 $\overrightarrow{r}$"。

空间曲线 $\Gamma$ 的参数方程 $\begin{cases}x=\varphi(t)\\y=\psi(t)\\z=\omega(t)\end{cases}$（$t\in[\alpha,\beta]$）可以写成紧凑的向量形式：

$$
\overrightarrow{r} = \overrightarrow{f}(t) = (\varphi(t),\ \psi(t),\ \omega(t)) = \varphi(t)\overrightarrow{i} + \psi(t)\overrightarrow{j} + \omega(t)\overrightarrow{k}
$$

记数集 $D\subset\mathbf{R}$，映射 $f:D\to\mathbf{R}^{3}$ 就称为**一元向量值函数**。它的三个分量 $\varphi(t),\psi(t),\omega(t)$ 都是普通的一元函数。

#### 向量值函数的极限与连续

向量值函数的极限可以**分量地**定义——这大大简化了理论。设 $\overrightarrow{f}(t)=(\varphi(t),\psi(t),\omega(t))$，则

$$
\lim_{t\to t_0}\overrightarrow{f}(t) = \left(\lim_{t\to t_0}\varphi(t),\ \lim_{t\to t_0}\psi(t),\ \lim_{t\to t_0}\omega(t)\right)
$$

> 向量值函数的极限存在的**充要条件**是三个分量函数的极限都存在。连续性同理：$\overrightarrow{f}(t)$ 在 $t_0$ 连续 ⇔ 三个分量都在 $t_0$ 连续。

#### 向量值函数的导数——导向量

如果极限

$$
\lim_{\Delta t\to 0}\frac{\Delta\overrightarrow{r}}{\Delta t} = \lim_{\Delta t\to 0}\frac{\overrightarrow{f}(t_0+\Delta t)-\overrightarrow{f}(t_0)}{\Delta t}
$$

存在，则称此极限向量为 $\overrightarrow{f}(t)$ 在 $t_0$ 处的**导数**或**导向量**，记作 $\overrightarrow{f}'(t_0)$ 或 $\left.\frac{d\overrightarrow{r}}{dt}\right|_{t=t_0}$。

同样可以分量地求导：

$$
\overrightarrow{f}'(t_0) = (\varphi'(t_0),\ \psi'(t_0),\ \omega'(t_0))
$$

> 向量值函数可导的**充要条件**是三个分量函数都可导。

**导向量的几何意义**：设空间曲线 $\Gamma$ 是 $\overrightarrow{r}=\overrightarrow{f}(t)$ 的终端曲线，$\overrightarrow{OM}=\overrightarrow{f}(t_0)$。则 $\overrightarrow{f}'(t_0)$ 是曲线 $\Gamma$ 在点 $M$ 处的**切向量**，方向与参数 $t$ 的增长方向一致。

![导向量 向量 f'(t0) 是曲线在点 M 处的切向量](/notes-assets/hm8-05-derivative-vector-geometry.jpg)

#### 向量值函数的求导运算法则

设 $\overrightarrow{u}(t),\overrightarrow{v}(t)$ 是可导的向量值函数，$\overrightarrow{c}$ 是常向量，$\varphi(t)$ 是可导的数量函数：

(1) $\frac{d}{dt}\overrightarrow{c}=\overrightarrow{0}$　(2) $\frac{d}{dt}[C\overrightarrow{u}]=C\overrightarrow{u}'$　(3) $\frac{d}{dt}[\overrightarrow{u}\pm\overrightarrow{v}]=\overrightarrow{u}'\pm\overrightarrow{v}'$

(4) $\frac{d}{dt}[\varphi(t)\overrightarrow{u}]=\varphi'\overrightarrow{u}+\varphi\overrightarrow{u}'$

(5) $\frac{d}{dt}[\overrightarrow{u}\cdot\overrightarrow{v}]=\overrightarrow{u}'\cdot\overrightarrow{v}+\overrightarrow{u}\cdot\overrightarrow{v}'$（数量积的求导法则）

(6) $\frac{d}{dt}[\overrightarrow{u}\times\overrightarrow{v}]=\overrightarrow{u}'\times\overrightarrow{v}+\overrightarrow{u}\times\overrightarrow{v}'$（向量积的求导法则）

(7) $\frac{d}{dt}\overrightarrow{u}[\varphi(t)]=\varphi'(t)\overrightarrow{u}'[\varphi(t)]$（链式法则）

:::example 例 1 · 求导向量与单位切向量
设 $\overrightarrow{r}=\overrightarrow{f}(t)=(t^{2}+1,\ 4t-3,\ 2t^{2}-6t)$，求 $t=2$ 处的单位切向量。

**解**：$\overrightarrow{f}'(t)=(2t,4,4t-6)$，$\overrightarrow{f}'(2)=(4,4,2)$，$|\overrightarrow{f}'(2)|=\sqrt{16+16+4}=6$。单位切向量 $=\pm\frac{(4,4,2)}{6}=\pm\bigl(\frac{2}{3},\frac{2}{3},\frac{1}{3}\bigr)$。

**评注**：单位切向量有两个方向（正反）——分别对应参数 $t$ 增大和减小的方向。

:::

### 空间曲线的切线与法平面

有了导向量的概念，空间曲线的切线和法平面就可以直接写出来了。设空间曲线 $\Gamma$ 的参数方程为 $\begin{cases}x=\varphi(t)\\y=\psi(t)\\z=\omega(t)\end{cases}$，点 $M(x_0,y_0,z_0)$ 对应参数 $t=t_0$。

#### 参数方程情形

由导向量的几何意义，向量 $\overrightarrow{T}=\overrightarrow{f}'(t_0)=(\varphi'(t_0),\psi'(t_0),\omega'(t_0))$ 就是曲线在 $M$ 处的**切向量**。于是：

- **切线方程**（点向式）：$\displaystyle\frac{x-x_0}{\varphi'(t_0)}=\frac{y-y_0}{\psi'(t_0)}=\frac{z-z_0}{\omega'(t_0)}$
- **法平面方程**（点法式）：$\varphi'(t_0)(x-x_0)+\psi'(t_0)(y-y_0)+\omega'(t_0)(z-z_0)=0$

![空间曲线在点 M 处的切线与法平面](/notes-assets/hm8-06-space-curve-tangent-normal-plane.jpg)

> 法平面是通过点 $M$ 且与切线垂直的平面——切向量就是它的法向量。

:::example 例 2 · 参数式曲线的切线与法平面
求曲线 $\begin{cases}x=t\\y=t^{2}\\z=t^{3}\end{cases}$ 在点 $(1,1,1)$ 处的切线及法平面方程。

**思路**：先确定参数 $t_0$（代入 $x=1$ 得 $t=1$），再求导向量。

**解**：$x'=1,\ y'=2t,\ z'=3t^{2}$。$t=1$ 时 $\overrightarrow{T}=(1,2,3)$。切线 $\frac{x-1}{1}=\frac{y-1}{2}=\frac{z-1}{3}$。法平面 $(x-1)+2(y-1)+3(z-1)=0$，即 $x+2y+3z=6$。

:::

#### 特殊形式：$y=\varphi(x),\ z=\psi(x)$

当空间曲线以 $\begin{cases}y=\varphi(x)\\z=\psi(x)\end{cases}$ 的形式给出时，取 $x$ 自身为参数：$\begin{cases}x=x\\y=\varphi(x)\\z=\psi(x)\end{cases}$。此时 $\overrightarrow{T}=(1,\ \varphi'(x_0),\ \psi'(x_0))$。切线方程和法平面方程中代入对应的分量即可。

#### 一般式方程情形

当曲线以两曲面交线的形式 $\begin{cases}F(x,y,z)=0\\G(x,y,z)=0\end{cases}$ 给出时，曲线同时在两个曲面上。由 8.6.3 将看到，曲面 $F=0$ 在 $M$ 处的法向量为 $\overrightarrow{n_1}=(F_x,F_y,F_z)$，曲面 $G=0$ 的法向量为 $\overrightarrow{n_2}=(G_x,G_y,G_z)$。曲线同时在两曲面上 ⇒ 曲线的切向量同时垂直于两个法向量 ⇒ **切向量 = 两法向量的叉积**：

$$
\overrightarrow{T} = \overrightarrow{n_1}\times\overrightarrow{n_2} = \left(\begin{vmatrix}F_y&F_z\\G_y&G_z\end{vmatrix},\ \begin{vmatrix}F_z&F_x\\G_z&G_x\end{vmatrix},\ \begin{vmatrix}F_x&F_y\\G_x&G_y\end{vmatrix}\right)
$$

> 在实际解题中，直接对 $x$ 求全导数并解出 $\frac{dy}{dx},\frac{dz}{dx}$ 往往比代数余子式展开更省力——因为 $\overrightarrow{T}$ 的方向与 $(1,\frac{dy}{dx},\frac{dz}{dx})$ 平行。

:::example 例 3 · 一般式曲线的切线与法平面
求曲线 $\begin{cases}x^{2}+y^{2}+z^{2}=6\\x+y+z=0\end{cases}$ 在点 $(1,-2,1)$ 处的切线及法平面方程。

**思路**：对 $x$ 求全导数（视 $y,z$ 为 $x$ 的函数），解出 $\frac{dy}{dx},\frac{dz}{dx}$ 得切向量。

**解**：对 $x$ 求导：

$$
\begin{cases}2x+2y\frac{dy}{dx}+2z\frac{dz}{dx}=0\\1+\frac{dy}{dx}+\frac{dz}{dx}=0\end{cases}
$$

代入 $(1,-2,1)$：

$$
\begin{cases}2-4y'+2z'=0\\1+y'+z'=0\end{cases} \Rightarrow y'=0,\ z'=-1
$$

$\overrightarrow{T}=(1,0,-1)$。切线 $\frac{x-1}{1}=\frac{y+2}{0}=\frac{z-1}{-1}$。法平面 $(x-1)+0\cdot(y+2)+(-1)(z-1)=0$，即 $x-z=0$。

**评注**：$y'=0$ 时切向量的 $y$ 分量为 $0$，点向式中分母 $0$ 理解为分子也为 $0$（即 $y=-2$ 恒成立，直线在平面 $y=-2$ 上）。

:::

### 曲面的切平面与法线

空间曲线在某点有切线（一维线性逼近），曲面在某点则有切平面（二维线性逼近）。切平面的法向量是理解曲面局部几何的关键。

#### 隐式曲面 $F(x,y,z)=0$——切平面方程的核心推导

设曲面 $\Sigma:F(x,y,z)=0$，$M(x_0,y_0,z_0)$ 是 $\Sigma$ 上一点。在 $\Sigma$ 上过 $M$ 任作一条曲线 $\Gamma:\begin{cases}x=\varphi(t)\\y=\psi(t)\\z=\omega(t)\end{cases}$，对应 $t=t_0$。由于 $\Gamma$ 完全在 $\Sigma$ 上，有恒等式

$$
F[\varphi(t),\psi(t),\omega(t)]\equiv 0
$$

两边在 $t=t_0$ 处对 $t$ 求全导数（链式法则）：

$$
F_x(x_0,y_0,z_0)\varphi'(t_0) + F_y(x_0,y_0,z_0)\psi'(t_0) + F_z(x_0,y_0,z_0)\omega'(t_0) = 0
$$

这恰好是向量 $\overrightarrow{n}=(F_x,F_y,F_z)|_M$ 与切向量 $\overrightarrow{T}=(\varphi',\psi',\omega')$ 的点积为零——即 $\overrightarrow{n}\perp\overrightarrow{T}$。

![曲面在点 M 处的切平面与法线](/notes-assets/hm8-07-surface-tangent-plane-normal.jpg)

因为 $\Gamma$ 是过 $M$ 的**任意**一条在曲面上的曲线，上式说明 $\overrightarrow{n}$ 与过 $M$ 的**所有**切向量都垂直。这意味着过 $M$ 的所有切线都在同一个平面上——这个平面就是以 $\overrightarrow{n}$ 为法向量的平面，称为曲面在 $M$ 处的**切平面**。

于是：

- **法向量**：$\overrightarrow{n} = (F_x(x_0,y_0,z_0),\ F_y(x_0,y_0,z_0),\ F_z(x_0,y_0,z_0))$
- **切平面方程**（点法式）：$F_x(x-x_0)+F_y(y-y_0)+F_z(z-z_0)=0$
- **法线方程**（过 $M$ 沿 $\overrightarrow{n}$ 方向的直线，点向式）：$\displaystyle\frac{x-x_0}{F_x}=\frac{y-y_0}{F_y}=\frac{z-z_0}{F_z}$

:::example 例 4 · 隐式曲面的切平面与法线
求球面 $x^{2}+y^{2}+z^{2}=14$ 在点 $(1,2,3)$ 处的切平面及法线方程。

**解**：$F(x,y,z)=x^{2}+y^{2}+z^{2}-14$。$F_x=2x,\ F_y=2y,\ F_z=2z$。在 $(1,2,3)$ 处 $\overrightarrow{n}=(2,4,6)$，可化简为 $(1,2,3)$。切平面 $(x-1)+2(y-2)+3(z-3)=0$ ⇒ $x+2y+3z-14=0$。法线 $\frac{x-1}{1}=\frac{y-2}{2}=\frac{z-3}{3}$。

**评注**：球面的法向量恰好沿半径方向——从球心指向切点。这符合几何直觉：球的切平面垂直于半径。

:::

#### 显式曲面 $z=f(x,y)$

当曲面以 $z=f(x,y)$ 的显式形式给出时，令 $F(x,y,z)=f(x,y)-z$，则

$$
F_x = f_x(x,y),\quad F_y = f_y(x,y),\quad F_z = -1
$$

法向量 $\overrightarrow{n} = (f_x(x_0,y_0),\ f_y(x_0,y_0),\ -1)$。注意这里 $F_z=-1$，意味着法向量始终指向 $z$ 轴的负方向（向下）。若想取向上的法向量，取 $\overrightarrow{n}=(-f_x,-f_y,1)$ 即可。

由此得出显式曲面的：

- **切平面**：$f_x(x_0,y_0)(x-x_0)+f_y(x_0,y_0)(y-y_0)-(z-z_0)=0$
- **法线**：$\displaystyle\frac{x-x_0}{f_x}=\frac{y-y_0}{f_y}=\frac{z-z_0}{-1}$

若取法向量向上（$\overrightarrow{n}$ 的 $z$ 分量为正），法向量的方向余弦为：

$$
\cos\alpha=\frac{-f_x}{\sqrt{1+f_x^{2}+f_y^{2}}},\quad \cos\beta=\frac{-f_y}{\sqrt{1+f_x^{2}+f_y^{2}}},\quad \cos\gamma=\frac{1}{\sqrt{1+f_x^{2}+f_y^{2}}}
$$

:::example 例 5 · 显式曲面的切平面与法线
求旋转抛物面 $z=x^{2}+y^{2}-1$ 在点 $(2,1,4)$ 处的切平面及法线方程。

**解**：$f(x,y)=x^{2}+y^{2}-1$。$f_x(2,1)=4,\ f_y(2,1)=2$。法向量 $\overrightarrow{n}=(4,2,-1)$。切平面 $4(x-2)+2(y-1)-(z-4)=0$ ⇒ $4x+2y-z-6=0$。法线 $\frac{x-2}{4}=\frac{y-1}{2}=\frac{z-4}{-1}$。

:::

## 方向导数与梯度

偏导数只描述函数沿坐标轴方向的变化率。如果问"沿东北方向走，函数值变化多快？"——偏导数回答不了。**方向导数**恰恰回答这个问题：任意指定一个方向，函数在该方向上的变化率。而**梯度**把所有方向的变化率信息压缩成一个向量——任何方向的方向导数等于梯度在该方向上的投影，梯度自身的模就是最大的方向导数。方向导数与梯度的关系是多元微分学中几何意义最丰富、物理应用最广泛的部分。

### 方向导数

#### 方向导数的定义

偏导数 $f_x$ 回答的是"沿 $x$ 轴正方向走，函数变化多快"，$f_y$ 回答的是"沿 $y$ 轴正方向走，函数变化多快"。但在实际应用中（如爬山时想知道"沿东北方向坡度多大"），我们需要知道沿**任意指定方向**的变化率。这就是**方向导数**要解决的问题。

设 $l$ 是 $xOy$ 平面上以 $P_0(x_0,y_0)$ 为始点的一条射线，其方向由单位向量 $\overrightarrow{e_l}=(\cos\alpha,\cos\beta)$ 确定。射线 $l$ 的参数方程为

$$
\begin{cases}x = x_0 + t\cos\alpha \\ y = y_0 + t\cos\beta\end{cases}\quad (t \ge 0)
$$

其中 $t$ 是沿射线 $l$ 从 $P_0$ 出发走过的距离。当动点 $P$ 沿 $l$ 趋于 $P_0$ 时（即 $t\to 0^{+}$），如果函数值的平均变化率 $\frac{f(P)-f(P_0)}{t}$ 的极限存在，则这个极限就是该方向上的瞬时变化率：

$$
\frac{\partial f}{\partial l}\bigg|_{(x_0,y_0)} = \lim_{t\to 0^{+}}\frac{f(x_0+t\cos\alpha,\ y_0+t\cos\beta)-f(x_0,y_0)}{t}
$$

这个极限值称为函数 $f(x,y)$ 在点 $P_0$ 沿方向 $l$ 的**方向导数**。

![方向导数：沿射线 l 方向的变化率](/notes-assets/hm8-08-directional-derivative.jpg)

> 注意定义中极限是 $t\to 0^{+}$（**单侧**极限）。因为射线只能从一个方向逼近起点，不能从反方向来——这与偏导数的双侧极限有本质区别，也是方向导数与偏导数关系微妙的原因。

#### 方向导数与偏导数的关系——偏导数是特殊的方向导数

取特定方向即可看出方向导数包含了偏导数：

- $\overrightarrow{e_l}=\overrightarrow{i}=(1,0)$（沿 $x$ 轴正向）：$\frac{\partial f}{\partial l}=f_x$
- $\overrightarrow{e_l}=-\overrightarrow{i}=(-1,0)$（沿 $x$ 轴负向）：$\frac{\partial f}{\partial l}=-f_x$
- $\overrightarrow{e_l}=\overrightarrow{j}=(0,1)$（沿 $y$ 轴正向）：$\frac{\partial f}{\partial l}=f_y$
- $\overrightarrow{e_l}=-\overrightarrow{j}=(0,-1)$（沿 $y$ 轴负向）：$\frac{\partial f}{\partial l}=-f_y$

**偏导数是特殊的方向导数**——当方向恰好沿着坐标轴时，方向导数退化为偏导数。

但反之不成立！**方向导数存在不能推出偏导数存在**。因为方向导数只需单侧极限（$t\to 0^{+}$），而偏导数需要双侧极限（$\Delta x\to 0$ 可正可负）。

:::example 例 1 · 方向导数存在而偏导不存在的反例
求函数 $z=\sqrt{x^{2}+y^{2}}$ 在点 $(0,0)$ 处沿方向 $\overrightarrow{i}=(1,0)$ 的方向导数。

**解**：$\frac{\partial z}{\partial l}\big|_{(0,0)}=\lim_{t\to 0^{+}}\frac{z(t,0)-z(0,0)}{t}=\lim_{t\to 0^{+}}\frac{\sqrt{t^{2}}-0}{t}=\lim_{t\to 0^{+}}\frac{\lvert t\rvert}{t}=1$。

但 $\frac{\partial z}{\partial x}\big|_{(0,0)}=\lim_{\Delta x\to 0}\frac{z(\Delta x,0)-z(0,0)}{\Delta x}=\lim_{\Delta x\to 0}\frac{\lvert\Delta x\rvert}{\Delta x}$ 不存在（$\Delta x\to 0^{+}$ 时为 $1$，$\Delta x\to 0^{-}$ 时为 $-1$）。

**评注**：函数 $z=\sqrt{x^{2}+y^{2}}$ 在原点是一个圆锥的顶点——它是尖点，不是光滑的。沿 $x$ 轴正向走，方向导数存在（单侧坡度是 $1$）；但偏导数需要左右两侧坡度一致，而左侧坡度是 $-1$，不相等，所以偏导数不存在。这正是方向导数核心的微妙之处。

:::

#### 方向导数的计算公式——可微时的便利公式

如果函数 $f(x,y)$ 在点 $P_0(x_0,y_0)$ **可微**，则沿任意方向 $l$ 的方向导数都存在，且可以由偏导数直接算出：

$$
\frac{\partial f}{\partial l} = f_x(x_0,y_0)\cos\alpha + f_y(x_0,y_0)\cos\beta
$$

:::tip 方向导数公式的推导思路
由可微 ⇒ $\Delta z = f_x\Delta x + f_y\Delta y + o(\rho)$。将射线参数方程代入：$\Delta x = t\cos\alpha,\ \Delta y = t\cos\beta$，此时 $\rho = t$。于是方向导数 $=\lim_{t\to 0^{+}}\frac{f_x t\cos\alpha + f_y t\cos\beta + o(t)}{t} = f_x\cos\alpha + f_y\cos\beta$。

:::

三元函数推广：若 $u=f(x,y,z)$ 在 $P_0$ 可微，$\overrightarrow{e_l}=(\cos\alpha,\cos\beta,\cos\gamma)$，则

$$
\frac{\partial f}{\partial l} = f_x\cos\alpha + f_y\cos\beta + f_z\cos\gamma
$$

> **注意**：公式需要**可微**作为前提条件。如果只知偏导存在而不可微（如例 1 中的圆锥函数），方向导数不能简单用此公式计算——例 1 中偏导不存在，恰好说明了这一点。

:::example 例 2 · 按标准流程求方向导数
求 $z=xe^{2y}$ 在 $P(1,0)$ 处从 $P$ 到 $Q(2,-1)$ 的方向的方向导数。

**思路**：①判断可微性（初等函数，可微）→ ②求方向向量并单位化得 $\overrightarrow{e_l}$ → ③求偏导 → ④代入公式。

**解**：$\overrightarrow{PQ}=(1,-1)$，单位化得 $\overrightarrow{e_l}=(\frac{1}{\sqrt{2}},-\frac{1}{\sqrt{2}})$，即 $\cos\alpha=\frac{1}{\sqrt{2}},\ \cos\beta=-\frac{1}{\sqrt{2}}$。

$z=xe^{2y}$ 可微。$f_x(1,0)=e^{0}=1$，$f_y(1,0)=2\cdot1\cdot e^{0}=2$。方向导数 $=1\cdot\frac{1}{\sqrt{2}}+2\cdot(-\frac{1}{\sqrt{2}})=-\frac{\sqrt{2}}{2}$。

**评注**：方向导数为负，说明沿 $\overrightarrow{PQ}$ 方向走，函数值在**减少**——这从 $z=xe^{2y}$ 在 $P(1,0)$ 处的梯度方向也能预判。

:::

### 梯度

#### 梯度的定义

观察方向导数公式 $\frac{\partial f}{\partial l}=f_x\cos\alpha+f_y\cos\beta$。右边恰好可以写成两个向量的点积：向量 $(f_x,f_y)$ 与方向单位向量 $(\cos\alpha,\cos\beta)$ 的点积。这个由偏导数构成的向量非常重要——它包含了函数在一点处所有方向的变化率信息。我们给它一个专门的名字：

$$
\operatorname{grad} f(x_0,y_0) = \nabla f(x_0,y_0) = (f_x(x_0,y_0),\ f_y(x_0,y_0))
$$

称为函数 $f(x,y)$ 在 $P_0$ 处的**梯度**。符号 $\nabla$ 读作"nabla"，$\nabla = \frac{\partial}{\partial x}\overrightarrow{i}+\frac{\partial}{\partial y}\overrightarrow{j}$ 称为 **Nabla 算子**或**向量微分算子**——把它"作用"在 $f$ 上，就是把各偏导作为分量组成一个向量。

三元推广：$\nabla f = (f_x,f_y,f_z)$，$\nabla = \frac{\partial}{\partial x}\overrightarrow{i}+\frac{\partial}{\partial y}\overrightarrow{j}+\frac{\partial}{\partial z}\overrightarrow{k}$。

> 梯度是一个**向量**，方向导数是一个**数**。梯度是"母向量"——知道了梯度，任何方向的方向导数就是梯度在该方向上的投影。

:::example 例 3 · 求二元函数的梯度
求 $z=4-x-y$ 在点 $(2,2,0)$ 的梯度。

**解**：$\frac{\partial z}{\partial x}\big|_{(2,2)}=-1,\ \frac{\partial z}{\partial y}\big|_{(2,2)}=-1$ ⇒ $\nabla f(2,2)=(-1,-1)$。

:::

#### 梯度与方向导数的关系

将方向导数公式用梯度重写：

$$
\frac{\partial f}{\partial l} = \nabla f \cdot \overrightarrow{e_l} = \lvert\nabla f\rvert \cos\theta
$$

其中 $\theta = \langle\nabla f,\ \overrightarrow{e_l}\rangle$ 是梯度方向与指定方向 $l$ 的夹角。这个简洁的等式包含了梯度的全部几何意义：

| $\theta$ | $\frac{\partial f}{\partial l}$ | 几何意义 |
| :--- | :--- | :--- |
| $0$（$l$ 与 $\nabla f$ 同向） | $\lvert\nabla f\rvert$（**最大正值**） | **梯度方向是函数增加最快的方向** |
| $\pi$（$l$ 与 $\nabla f$ 反向） | $-\lvert\nabla f\rvert$（**最小负值**） | 梯度反方向是函数减少最快的方向 |
| $\frac{\pi}{2}$（$l$ 与 $\nabla f$ 垂直） | $0$ | 变化率为零——沿等值线的切线方向 |

![梯度方向是函数值增加最快的方向](/notes-assets/hm8-09-gradient-geometry.jpg)

> **梯度方向的物理直觉**：爬山时，梯度指向最陡的上山方向；梯度反方向指向最陡的下山方向；垂直于梯度的方向（沿等高线走）高度不变。这个直觉在优化算法（梯度下降法）中被充分利用——每次沿负梯度方向走一小步，函数值就下降最快。

:::example 例 4 · 二维情形的最速方向
设 $f(x,y)=\frac{1}{2}(x^{2}+y^{2})$，$P_0(1,1)$。求 (1) 增加最快方向及方向导数 (2) 减少最快方向及方向导数 (3) 变化率为零的方向。

**解**：$\nabla f=(x,y)$，$\nabla f(1,1)=(1,1)$，$\lvert\nabla f\rvert=\sqrt{2}$。

(1) 增加最快方向 $=\frac{(1,1)}{\sqrt{2}}$，方向导数 $=\sqrt{2}$。

(2) 减少最快方向 $=-\frac{(1,1)}{\sqrt{2}}$，方向导数 $=-\sqrt{2}$。

(3) 变化率为零方向 $=\pm\frac{(1,-1)}{\sqrt{2}}$（与 $(1,1)$ 正交）。

:::

:::example 例 5 · 三维情形的最速方向
设 $f(x,y,z)=x^{3}-xy^{2}-z$，$P_0(1,1,0)$，求函数在该点变化最快的方向和变化率。

**解**：$\nabla f=(3x^{2}-y^{2},-2xy,-1)$，$\nabla f(1,1,0)=(2,-2,-1)$，$\lvert\nabla f\rvert=3$。沿 $\nabla f$ 方向增加最快，变化率 $=3$；沿 $-\nabla f$ 减少最快，变化率 $=-3$。

:::

#### 等值线与梯度的几何关系

$f(x,y)=C$（$C$ 为常数）所定义的平面曲线称为函数 $f$ 的**等值线**。在等值线上，所有点的函数值都相等——类似于地图上的等高线。三元函数 $f(x,y,z)=C$ 则定义**等值面**。

![等值线与梯度：梯度方向垂直于等值线并指向函数值增加的一方](/notes-assets/hm8-10-contour-lines.jpg)

一个深刻的几何事实将梯度和等值线联系起来：**梯度方向处处垂直于等值线，并指向函数值增加的一方**。

> 为什么呢？在等值线上，函数值不变 ⇒ 沿等值线切线方向的方向导数为 $0$。而方向导数为 $0$ 意味着 $\nabla f$ 与切线方向垂直（$\cos\theta=0$）。所以梯度垂直于等值线。至于"指向增加的一方"，由 $\frac{\partial f}{\partial l}=\nabla f\cdot\overrightarrow{e_l}$ 可知，沿 $\nabla f$ 自身方向的方向导数 $=\lvert\nabla f\rvert>0$，所以沿梯度方向函数值必增加。

由此可得一个实用结论——等值线 $f(x,y)=C$ 在 $P_0$ 处的**单位法向量**恰好是：

$$
\overrightarrow{n} = \frac{\nabla f(P_0)}{\lvert\nabla f(P_0)\rvert}
$$

:::example 例 6 · 用梯度求曲面的切平面与法线
求曲面 $x^{2}+y^{2}+z=9$ 在点 $P_0(1,2,4)$ 的切平面和法线方程。

**思路**：$F(x,y,z)=x^{2}+y^{2}+z-9=0$。由梯度与等值面的关系，$\nabla F(1,2,4)$ 就是 $P_0$ 处的法向量。直接用 8.6.3 的公式。

**解**：$\nabla F=(2x,2y,1)$，$\nabla F(1,2,4)=(2,4,1)$ 即为法向量。切平面 $2(x-1)+4(y-2)+(z-4)=0$ ⇒ $2x+4y+z-14=0$。法线 $\frac{x-1}{2}=\frac{y-2}{4}=\frac{z-4}{1}$。

**评注**：这道题展示了梯度与 8.6 节切平面/法线的内在联系——曲面的法向量就是该曲面作为等值面时的梯度。

:::

#### 数量场与向量场

如果空间区域 $G$ 内的每一点 $M$ 都对应一个确定的数值 $f(M)$（如温度场中每点的温度、电势场中每点的电势），则称在 $G$ 内确定了一个**数量场**（标量场）。若每点对应的是一个向量 $\overrightarrow{F}(M)$（如电场中每点的电场强度、流速场中每点的速度），则称为**向量场**。

如果存在一个数量函数 $f(M)$，使得向量场 $\overrightarrow{F}(M)$ 恰好是 $f$ 的梯度（即 $\overrightarrow{F}=\nabla f$），则称 $f$ 是 $\overrightarrow{F}$ 的一个**势函数**，$\overrightarrow{F}$ 称为**势场**（或有势场）。引力场、静电场都是势场——这正是大学物理中"势能"和"场强"之间梯度关系的数学表达。

### 多元函数微分学的完整逻辑链——"金字塔"

学完方向导数后，现在可以把"连续、偏导存在、可微、偏导连续、方向导数存在"这五个概念之间的完整关系一次性理清：

```text
       f_x, f_y 连续
             ↓  (充分不必要条件)
           可微
        ↙   ↓    ↘
      连续  f_x,f_y存在  方向导数存在
```

关键结论：

- **偏导连续 ⇒ 可微**（8.3 充分条件定理）——充分不必要条件
- **可微 ⇒ 连续**（$\Delta z=A\Delta x+B\Delta y+o(\rho)\to0$）
- **可微 ⇒ 偏导存在**（且 $A=f_x,\ B=f_y$）
- **可微 ⇒ 任意方向的方向导数存在**（且 $\frac{\partial f}{\partial l}=f_x\cos\alpha+f_y\cos\beta$）
- **偏导存在 ⇏ 可微**（8.3 例 5：$\frac{xy}{\sqrt{x^{2}+y^{2}}}$）
- **偏导存在 ⇏ 连续**（8.2 例 5：$\frac{xy}{x^{2}+y^{2}}$）——与一元函数"可导必连续"截然不同
- **可微 ⇏ 偏导连续**（8.3 例 6：$(x^{2}+y^{2})\sin\frac{1}{x^{2}+y^{2}}$）
- **方向导数存在 ⇏ 偏导存在**（8.7 例 1：$\sqrt{x^{2}+y^{2}}$ 沿 $\overrightarrow{i}$ 方向导数存在但 $f_x$ 不存在）

> 这五者之间的关系最容易混淆。牢记三个反例——偏导存在但不连续（8.2 例 5）、偏导存在但不可微（8.3 例 5）、可微但偏导不连续（8.3 例 6）——配合金字塔图，所有推断关系题都能搞定。

:::example 例 7 · 判断四条性质之间的推出关系
考虑二元函数 $f(x,y)$ 的四条性质：

(1) $f(x,y)$ 在点 $(x_0,y_0)$ 连续；(2) $f_x,f_y$ 在 $(x_0,y_0)$ 连续；

(3) $f(x,y)$ 在 $(x_0,y_0)$ 可微；(4) $f_x(x_0,y_0),f_y(x_0,y_0)$ 存在。

若"$P\Rightarrow Q$"表示可由 $P$ 推出 $Q$，则正确的是（　）

**解**：根据金字塔：$(2)\Rightarrow(3)$（偏导连续 ⇒ 可微），$(3)\Rightarrow(1)$（可微 ⇒ 连续），$(3)\Rightarrow(4)$（可微 ⇒ 偏导存在）。故 $(2)\Rightarrow(3)\Rightarrow(1)$ 或 $(4)$ 均成立。

**评注**：这类"箭头推断题"的唯一依据就是金字塔图——从上层到下层可推，从下层到上层不可推。

:::

:::example 例 8 · 可微的充分条件概念辨析
$f(x,y)$ 在 $(0,0)$ 可微的一个充分条件是（　）

A. $\lim_{(x,y)\to(0,0)}[f(x,y)-f(0,0)]=0$

B. $\lim_{x\to 0}\frac{f(x,0)-f(0,0)}{x}=0$ 且 $\lim_{y\to 0}\frac{f(0,y)-f(0,0)}{y}=0$

C. $\lim_{(x,y)\to(0,0)}\frac{f(x,y)-f(0,0)}{\sqrt{x^{2}+y^{2}}}=0$

D. $\lim_{x\to 0}[f_x(x,0)-f_x(0,0)]=0$ 且 $\lim_{y\to 0}[f_y(0,y)-f_y(0,0)]=0$

**解**：选 **C**。A 只表明连续（可微的必要条件）。B 表明 $f_x(0,0)=f_y(0,0)=0$（偏导存在，但偏导存在推不出可微）。C 中令 $A=B=0$，极限式恰好是 $\frac{\Delta z-(A\Delta x+B\Delta y)}{\rho}\to0$，即可微等价定义——这是可微的**充分条件**。D 表明 $f_x(x,0)$ 和 $f_y(0,y)$ 分别在 $(0,0)$ 连续（仅是偏导在特定线上的连续，不是偏导在二维邻域内连续，推不出可微）。

**评注**：可微的判定归根结底两条路——要么验证偏导在二维邻域内连续（充分），要么直接用等价定义 $\frac{\Delta z-(f_x\Delta x+f_y\Delta y)}{\rho}\to0$。

:::

:::example 例 9 · 方向导数、偏导与连续的关系辨析
下列命题正确的是（　）

A. $f_x,f_y$ 都在 $(x_0,y_0)$ 连续，则 $f(x,y)$ 在 $(x_0,y_0)$ 不一定可微

B. $f_x|_{P_0}$ 与 $f_y|_{P_0}$ 都存在，则 $f(x,y)$ 在 $P_0$ 必连续

C. $f(x,y)$ 在 $P_0$ 沿任意方向的方向导数存在，则 $f_x|_{P_0}$ 与 $f_y|_{P_0}$ 可能不存在

D. $f(x,y)$ 在 $P_0$ 沿任意方向的方向导数存在，则 $f(x,y)$ 在 $P_0$ 必连续

**解**：选 **C**。A：偏导连续 ⇒ 可微（充分条件定理），所以"不一定可微"错。B：偏导存在推不出连续（反例 $\frac{xy}{x^{2}+y^{2}}$），错。C：正确——方向导数存在推不出偏导存在（反例 $\sqrt{x^{2}+y^{2}}$ 在 $(0,0)$ 沿 $\overrightarrow{i}$ 方向导数存在但偏导不存在）。D：方向导数存在推不出连续（方向导数只沿射线方向单侧逼近，连续性需要全平面逼近），错。

**评注**：这三道例题覆盖了金字塔中所有箭头方向的推断关系——记住每个箭头的方向（向下可推、向上不可推），以及每个反例对应破坏了哪条逆向推断，概念选择题就能一网打尽。

:::

## 多元函数的极值及其求法

一元函数找极值：求导 → 驻点 → 判二阶导符号。多元函数完全类似——"一阶导 = 0"推广为"偏导数全为零（驻点）"，"二阶导符号"推广为"黑塞矩阵的正定性判定（$AC-B^{2}$）"。加上附加条件时（条件极值），用拉格朗日乘数法将约束融入目标函数，化条件极值为无条件极值来求解。

### 无条件极值

#### 极值的定义

设函数 $z=f(x,y)$ 的定义域为 $D$，$P_0(x_0,y_0)$ 为 $D$ 的内点。若存在 $P_0$ 的某个邻域 $U(P_0)\subset D$，使得对该邻域内异于 $P_0$ 的任意点 $(x,y)$，都有 $f(x,y)<f(x_0,y_0)$，则称 $f(x,y)$ 在 $(x_0,y_0)$ 有**极大值**；若 $f(x,y)>f(x_0,y_0)$，则为**极小值**。极大值和极小值统称**极值**。

> 例：$z=3x^{2}+4y^{2}$ 在 $(0,0)$ 处有极小值 $0$；$z=-\sqrt{x^{2}+y^{2}}$ 在 $(0,0)$ 处有极大值 $0$；$z=xy$ 在 $(0,0)$ 处不取极值（马鞍点）。

![多元函数的极大值、极小值与鞍点](/notes-assets/hm8-11-extrema.jpg)

#### 极值取得的必要条件

若 $f(x,y)$ 在 $(x_0,y_0)$ 处有极值且偏导数存在，则

$$
f_x(x_0,y_0)=0,\quad f_y(x_0,y_0)=0
$$

满足这两个条件的点称为**驻点**。**极值点必是驻点，但驻点未必是极值点**（如 $z=xy$ 在 $(0,0)$）。

:::tip 极值必要条件的证明思路
设 $f$ 在 $(x_0,y_0)$ 有极大值。取 $y=y_0$，则一元函数 $\varphi(x)=f(x,y_0)$ 在 $x=x_0$ 处有极大值 ⇒ $\varphi'(x_0)=0$ ⇒ $f_x(x_0,y_0)=0$。$f_y=0$ 同理。

:::

> 注意：若函数在个别点处偏导数不存在，这些点也可能是极值点（如 $z=-\sqrt{x^{2}+y^{2}}$ 在 $(0,0)$ 取得极大值，但偏导不存在）。

#### 极值取得的充分条件——黑塞矩阵判别法

设 $f(x,y)$ 在 $(x_0,y_0)$ 的某邻域内有一阶及二阶连续偏导数，且 $(x_0,y_0)$ 是驻点。令

$$
A = f_{xx}(x_0,y_0),\quad B = f_{xy}(x_0,y_0),\quad C = f_{yy}(x_0,y_0)
$$

构造判别式 $AC-B^{2}$：

| $AC-B^{2}$ | $A$ 的符号 | 结论 |
| :--- | :--- | :--- |
| $>0$ | $A<0$ | 极大值 |
| $>0$ | $A>0$ | 极小值 |
| $<0$ | — | 无极值（鞍点） |
| $=0$ | — | 无法判定，需用定义 |

> $AC-B^{2} = \begin{vmatrix}A&B\\B&C\end{vmatrix}$ 恰好是**黑塞矩阵** $H = \begin{pmatrix}A&B\\ B&C\end{pmatrix}=\begin{pmatrix}\dfrac{\partial^{2}f}{\partial x^{2}} & \dfrac{\partial^{2}f}{\partial x\partial y} \\[6pt] \dfrac{\partial^{2}f}{\partial y\partial x} & \dfrac{\partial^{2}f}{\partial y^{2}}\end{pmatrix}$ 的行列式。$AC-B^{2}>0$ 且 $A>0$ ⇔ $H$ 正定 ⇒ 极小值；$A<0$ ⇔ $H$ 负定 ⇒ 极大值。

:::tip 为什么 AC-B² 能判别极值
在驻点 $(x_0,y_0)$ 处 $f_x=f_y=0$。由二元泰勒公式，函数增量可展开为：

$$
f(x_0+\Delta x,y_0+\Delta y)-f(x_0,y_0) = \frac{1}{2}\bigl[f_{xx}(\Delta x)^{2}+2f_{xy}\Delta x\Delta y+f_{yy}(\Delta y)^{2}\bigr] + \cdots
$$

高阶项可忽略。令 $A=f_{xx},\ B=f_{xy},\ C=f_{yy}$，平方项部分可配方为二次型。设 $\Delta y\neq0$，令 $u=\frac{\Delta x}{\Delta y}$：

$$
h(\Delta x,\Delta y) \approx \frac{1}{2}(\Delta y)^{2}\bigl[A u^{2}+2B u+C\bigr]
$$

这是关于 $u$ 的二次三项式，其判别式 $\Delta=(2B)^{2}-4AC=4(B^{2}-AC)$。当 $AC-B^{2}>0$（即 $\Delta<0$）时，二次三项式恒正（$A>0$ 时）或恒负（$A<0$ 时）——这就分别对应极小值和极大值。当 $AC-B^{2}<0$（即 $\Delta>0$）时，二次三项式可正可负，函数值在驻点附近既有上升又有下降——对应鞍点（无极值）。

:::

:::example 例 1 · 按四步流程求函数极值
求 $f(x,y)=x^{3}-y^{3}+3x^{2}+3y^{2}-9x$ 的极值。

**思路**：①解 $f_x=f_y=0$ 找驻点 → ②计算 $A,B,C$ → ③对每个驻点用 $AC-B^{2}$ 判别 → ④有极值的代回求函数值。

**解**：$f_x=3x^{2}+6x-9=0$ ⇒ $x=1$ 或 $x=-3$。$f_y=-3y^{2}+6y=0$ ⇒ $y=0$ 或 $y=2$。四个驻点：$(1,0),(1,2),(-3,0),(-3,2)$。

$A=f_{xx}=6x+6$，$B=f_{xy}=0$，$C=f_{yy}=-6y+6$。

- $(1,0): A=12,B=0,C=6$，$AC-B^{2}=72>0,A>0$ ⇒ **极小值** $f(1,0)=-5$
- $(1,2): A=12,B=0,C=-6$，$AC-B^{2}<0$ ⇒ 无极值
- $(-3,0): A=-12,B=0,C=6$，$AC-B^{2}<0$ ⇒ 无极值
- $(-3,2): A=-12,B=0,C=-6$，$AC-B^{2}=72>0,A<0$ ⇒ **极大值** $f(-3,2)=31$

**评注**：当 $B=0$（$f_{xy}=0$）时，$AC-B^{2}=A\cdot C$，判别退化为看 $A$ 和 $C$ 是否同号。同号则有极值（$A>0$ 极小，$A<0$ 极大），异号则无极值。

:::

#### 最值的求解方法

在有界闭区域 $D$ 上求最值，需比较三类点的函数值：① $D$ 内部的驻点 ② $D$ 内部偏导不存在的点 ③ $D$ 的边界上的最值点。取最大者为最大值，最小者为最小值。

:::example 例 2 · 用料最省的水箱设计
用铁板做一体积为 $2\text{m}^{3}$ 的有盖长方体水箱，长宽高各取多少时用料最省？

**解**：设长 $x$、宽 $y$，高 $\frac{2}{xy}$。用料面积 $A=2(xy+\frac{2}{x}+\frac{2}{y})$。由 $A_x=A_y=0$ 解得 $x=y=\sqrt[3]{2}$，此时高也为 $\sqrt[3]{2}$。即正方体水箱用料最省。

:::

### 条件极值与拉格朗日乘数法

#### 条件极值的思想

前面讨论的极值对自变量**没有附加约束**（仅要求在定义域内），称为**无条件极值**。若对自变量有附加条件 $\varphi(x,y)=0$，则称为**条件极值**。

求解方法有二：(1) 从约束中解出一个变量代入目标函数，化为无条件极值；(2) **拉格朗日乘数法**——适用于约束方程不易显式解出的情况。

#### 拉格朗日乘数法

对于 $z=f(x,y)$ 在约束 $\varphi(x,y)=0$ 下求极值，构造**拉格朗日函数**

$$
L(x,y,\lambda) = f(x,y) + \lambda\varphi(x,y)
$$

其中 $\lambda$ 称为**拉格朗日乘子**。令 $L$ 对各变量的偏导为零：

$$
\begin{cases}
L_x = f_x + \lambda\varphi_x = 0 \\
L_y = f_y + \lambda\varphi_y = 0 \\
L_{\lambda} = \varphi(x,y) = 0
\end{cases}
$$

解出 $x,y,\lambda$，$(x,y)$ 即为可能极值点。

![拉格朗日乘数法：等值线与约束曲线相切时的几何直观](/notes-assets/hm8-12-lagrange-multiplier.jpg)

> **几何直觉**：在条件极值点处，目标函数的等值线 $f(x,y)=C$ 与约束曲线 $\varphi(x,y)=0$ **相切**——即两曲线在该点的法向量平行：$\nabla f \parallel \nabla\varphi$，也即 $\nabla f + \lambda\nabla\varphi = 0$。拉格朗日乘数法本质上就是在找这两个梯度平行的点。

:::example 例 3 · 拉格朗日乘数法的基本型
求 $z=x^{2}+y^{2}$ 在 $x+y=1$ 条件下的极值。

**法一（代入消元）**：$y=1-x$，$z=x^{2}+(1-x)^{2}=2x^{2}-2x+1$。$\frac{dz}{dx}=4x-2=0$ ⇒ $x=\frac{1}{2}$，$y=\frac{1}{2}$，极小值 $\frac{1}{2}$。

**法二（拉格朗日）**：$L=x^{2}+y^{2}+\lambda(x+y-1)$。解 $\begin{cases}2x+\lambda=0\\2y+\lambda=0\\x+y-1=0\end{cases}$ 得 $x=y=\frac{1}{2}$，$\lambda=-1$。极小值 $\frac{1}{2}$。

**评注**：两法结果一致。拉格朗日乘数法的威力在于约束方程复杂（无法显式解出）时仍能系统求解。

:::

#### 双约束推广

求 $u=f(x,y,z)$ 在 $\varphi(x,y,z)=0$ 和 $\psi(x,y,z)=0$ 两个约束下的极值时，设

$$
F(x,y,z,\lambda,\mu) = f(x,y,z) + \lambda\varphi(x,y,z) + \mu\psi(x,y,z)
$$

令五个偏导 $F_x=F_y=F_z=F_{\lambda}=F_{\mu}=0$，解出可能极值点。

:::example 例 4 · 双约束下的距离最值
抛物面 $z=x^{2}+y^{2}$ 被平面 $x+y+z=1$ 截成一椭圆，求椭圆上点到原点距离的最大值和最小值。

**思路**：目标 $d^{2}=x^{2}+y^{2}+z^{2}$，约束 $z=x^{2}+y^{2}$ 且 $x+y+z=1$。双约束 ⇒ 两个乘子。

**解**：$L=x^{2}+y^{2}+z^{2}+\lambda(z-x^{2}-y^{2})+\mu(x+y+z-1)$。解五元方程组，$①-②$ 得 $x=y$ 或 $\lambda=1$。$\lambda=1$ 时 $\mu=0,z=-\frac{1}{2}$ 舍去。$x=y$ 代入 $④⑤$ 解得两驻点，代入得 $d_{\min}^{2}=9-5\sqrt{3},\ d_{\max}^{2}=9+5\sqrt{3}$。

:::

:::example 例 5 · 有界闭区域上的最值
求 $z=x^{2}-y^{2}+2$ 在椭圆域 $x^{2}+\frac{y^{2}}{4}\le 1$ 上的最值。

**思路**：①区域内部：找驻点 → ②边界上：条件极值（代入消元或拉格朗日）→ ③比较所有候选点的函数值。

**解**：

① 内部驻点：$z_x=2x=0,\ z_y=-2y=0$ ⇒ $(0,0)$，$f(0,0)=2$。

② 边界 $x^{2}+\frac{y^{2}}{4}=1$：$y^{2}=4(1-x^{2})$ 代入得 $z=5x^{2}-2$，$x\in[-1,1]$。端点 $x=\pm1$ 时 $z=3$（此时 $y=0$）；内部 $y=\pm2,x=0$ 时 $z=-2$。

③ 比较：最大值 $3$（在 $(\pm1,0)$），最小值 $-2$（在 $(0,\pm2)$）。

**评注**：有界闭区域最值 = 内部驻点 + 边界条件极值 + 比较。边界上代入消元比拉格朗日乘数法更简便时优先使用代入法。

:::

:::example 例 6 · 椭圆上到直线距离最短的点
在椭圆 $x^{2}+4y^{2}=4$ 上求一点，使其到直线 $2x+3y-6=0$ 的距离最短。

**思路**：目标函数是距离 $d=\frac{\lvert 2x+3y-6\rvert}{\sqrt{13}}$。由于求最值点而非最值本身，可以去掉根号和绝对值——构造与原函数单调性一致的函数 $f(x,y)=(2x+3y-6)^{2}$ 作为优化目标，约束为椭圆方程。

**解**：令 $L(x,y,\lambda)=(2x+3y-6)^{2}+\lambda(x^{2}+4y^{2}-4)$。

$$
\begin{cases}
L_x = 4(2x+3y-6)+2\lambda x = 0 & ① \\
L_y = 6(2x+3y-6)+8\lambda y = 0 & ② \\
L_{\lambda} = x^{2}+4y^{2}-4 = 0 & ③
\end{cases}
$$

由 $4y\cdot① - x\cdot②$ 消去 $\lambda$：$16y(2x+3y-6)-6x(2x+3y-6)=0$。因为椭圆上的点到直线的距离不为零（直线不穿过椭圆），$2x+3y-6\neq0$，故 $16y-6x=0$ ⇒ $x=\frac{8}{3}y$。代入③解得两驻点 $(\frac{8}{5},\frac{3}{5})$ 和 $(-\frac{8}{5},-\frac{3}{5})$。分别计算距离：$d_1=\frac{1}{\sqrt{13}}$，$d_2=\frac{11}{\sqrt{13}}$。最小值点为 $(\frac{8}{5},\frac{3}{5})$。

**评注**：拉格朗日乘数法的灵活应用——当目标函数含绝对值和根号时，可以先"去掉包袱"（平方消绝对值、去根号），构造一个在最值点处与原函数"走势一致"的简化函数。另外，用 $4y\cdot① - x\cdot②$ 消 $\lambda$ 是处理此类方程组的常用技巧——找到不含 $\lambda$ 的 $x,y$ 关系式，再与约束方程联立。

:::

## 小结

1. **二重极限**要求动点以任意方式（任意曲线、任意方向）逼近时函数值都趋于同一个数，所以证不存在只需两条路径给出不同值、或一条路径发散；反过来，**沿所有直线路径极限相同也不足以说明极限存在**，还要再试 $x=ky^{2}$ 这类曲线路径。
2. **二重极限与二次极限是两个不同的概念**：一个存在推不出另一个存在，两者都存在也未必相等——二次极限先冻结住一个变量，振荡项可能永远没有极限。
3. **偏导数**是把其余变量当作常数求导，几何上是用坐标平面截曲面所得曲线的切线斜率；它与连续的关系和一元函数截然不同——**偏导存在推不出连续**，连续也推不出偏导存在（如 $z=\sqrt{x^{2}+y^{2}}$ 在原点）。二阶**混合偏导数**在连续的条件下与求导次序无关，即 $f_{xy}=f_{yx}$。
4. **全微分** $dz=f_x dx+f_y dy$ 的本质是"以直代曲"，用切平面线性逼近曲面；可微必有偏导且必连续，但**偏导存在推不出可微**，判定可微最可靠的办法仍是等价定义 $\Delta z-(f_x\Delta x+f_y\Delta y)=o(\rho)$。
5. **偏导连续是可微的充分不必要条件**：偏导在邻域内连续 ⇒ 可微，可微却推不出偏导连续。把"偏导连续 ⇒ 可微 ⇒ 连续、偏导存在、方向导数存在"这条**金字塔**记牢——箭头只能从上层往下推，向上的每一步都被一个反例挡着。
6. 多元复合函数求导的法则是"**路径相乘，多路求和**"；当 $z=f(u,x,y)$ 时 $\frac{\partial z}{\partial x}$ 与 $\frac{\partial f}{\partial x}$ 含义不同，而**全微分形式不变性**给出了绕过链式法则的另一条路。
7. **隐函数**不必解出也能求导：$F(x,y)=0$ 时 $\frac{dy}{dx}=-\frac{F_x}{F_y}$（$F_y\neq0$），$F(x,y,z)=0$ 时 $\frac{\partial z}{\partial x}=-\frac{F_x}{F_z}$；方程组情形用**雅可比行列式**，分母恒为 $J=\frac{\partial(F,G)}{\partial(u,v)}$，分子只把对应的一列换掉。
8. 几何应用有两条主线：空间曲线的**切向量**就是导向量，配点向式写出切线与法平面；曲面的**法向量**就是 $\nabla F=(F_x,F_y,F_z)$，配点法式写出切平面与法线（显式曲面 $z=f(x,y)$ 的法向量取 $(f_x,f_y,-1)$）；曲线作为两曲面的交线给出时，切向量取两法向量的叉积。
9. **梯度**把所有方向的变化率压缩成一个向量：$\frac{\partial f}{\partial l}=\nabla f\cdot\overrightarrow{e_l}=\lvert\nabla f\rvert\cos\theta$，所以梯度方向是函数增加最快的方向、它的模就是最大的方向导数，并且梯度**垂直于等值线**、指向函数值增加的一侧。
10. 极值的必要条件只是**驻点**，驻点未必是极值点（$z=xy$ 在原点），要用 $AC-B^{2}$ 判别：$>0$ 且 $A>0$ 为极小值、$A<0$ 为极大值，$<0$ 无极值，$=0$ 只能回到定义；偏导不存在的点也可能是极值点。
11. 条件极值用**拉格朗日乘数法**：$L=f+\lambda\varphi$，解 $L_x=L_y=L_{\lambda}=0$，几何上找的就是 $\nabla f$ 与 $\nabla\varphi$ 平行的点；有界闭区域上的最值则要比较内部驻点、偏导不存在的点与边界上的候选取值。
