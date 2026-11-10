---
title: 高等数学-10 曲线积分与曲面积分
description: 从两类曲线积分与两类曲面积分出发，讲清格林、高斯、斯托克斯三大公式的条件、用法与联系，并说清散度、旋度的物理含义。
category: 数学
subject: 数学
subfield: 高等数学
topic: 曲线积分与曲面积分
difficulty: 中等
date: "2026-11-10"
tags: [高等数学, 曲线积分, 曲面积分, 格林公式, 高斯公式, 斯托克斯公式, 散度与旋度]
draft: false
featured: false
---

## 对弧长的曲线积分

定积分沿数轴累积，二重积分在平面区域上累积。如果把积分路径从直线区间换成平面上的一条曲线，就得到了**曲线积分**。本章从两类曲线积分出发，逐步建立格林公式、高斯公式、斯托克斯公式这三大定理，它们统一揭示了一个深刻原理：**区域内部的某种变化率的总和，等于边界上的流量总和**——这也是微积分基本定理（牛顿-莱布尼茨公式）在高维空间的终极推广。

对弧长的曲线积分（第一类曲线积分）没有方向性，只关心曲线本身的长度和函数沿曲线的分布。它直接继承定积分的定义方式——"分割→近似→求和→取极限"，只是分割的对象从数轴上的小区间变成了平面上的一条曲线弧。

#### 定义

设 $L$ 为 $xOy$ 面内的一条光滑曲线弧，函数 $f(x,y)$ 在 $L$ 上有界。在 $L$ 上任意插入一点列 $M_1,M_2,\cdots,M_{n-1}$ 把 $L$ 分成 $n$ 个小段，设第 $i$ 个小段的长度为 $\Delta S_i$。又 $(\xi_i,\eta_i)$ 为第 $i$ 个小段上任意取定的一点，作乘积 $f(\xi_i,\eta_i)\Delta S_i\ (i=1,2,\cdots,n)$，并作和 $\sum\limits_{i=1}^{n}f(\xi_i,\eta_i)\Delta S_i$。如果当各小弧段的长度的最大值 $\lambda \to 0$ 时，这和的极限总存在，且与曲线弧 $L$ 的分法及点 $(\xi_i,\eta_i)$ 的取法无关，那么称此极限为函数 $f(x,y)$ 在曲线弧 $L$ 上的**对弧长的曲线积分**，或**第一类曲线积分**，记作 $\int_{L}f(x,y)\,ds$，即

$$
\int_{L} f(x,y)\,ds = \lim_{\lambda \to 0} \sum_{i=1}^{n} f(\xi_i,\eta_i)\Delta S_i
$$

其中 $f(x,y)$ 叫做**被积函数**，$L$ 叫做**积分弧段**。

> **直观理解**：定积分 $\int_a^b f(x)\,dx$ 是把 $x$ 轴上的区间 $[a,b]$ 切成小段，每段长度 $\Delta x_i$，乘以该段的函数值再求和取极限。第一类曲线积分做的事情完全一样，只是把"直线段"换成了"曲线弧"——小弧段的长度 $\Delta S_i$ 替代了 $\Delta x_i$。因此 $ds$ 就是**弧长微元**，这也是为什么它被称为"对弧长"的曲线积分。

上述定义可以类似地推广到积分弧段为空间曲线 $\Gamma$ 的情形，即函数 $f(x,y,z)$ 在曲线弧 $\Gamma$ 上对弧长的曲线积分：

$$
\int_{\Gamma} f(x,y,z)\,ds = \lim_{\lambda \to 0} \sum_{i=1}^{n} f(\xi_i,\eta_i,\zeta_i)\Delta S_i
$$

如果 $L$（或 $\Gamma$）在平面（或空间）内为一条闭曲线，那么函数 $f(x,y)$（或 $f(x,y,z)$）在闭曲线 $L$（或 $\Gamma$）上对弧长的曲线积分记为

$$
\oint_{L} f(x,y)\,ds \quad \text{或} \quad \oint_{\Gamma} f(x,y,z)\,ds
$$

#### 性质

- **线性性**：$\int_{L} [\alpha f + \beta g]\,ds = \alpha\int_{L} f\,ds + \beta\int_{L} g\,ds$
- **路径可加性**：$L = L_1 \cup L_2 \Rightarrow \int_{L} = \int_{L_1} + \int_{L_2}$
- **常数积分**：$\int_{L} ds = S$（$S$ 为 $L$ 的弧长），$\int_{L} k\,ds = kS$
- **方向无关性**：$\int_{\text{顺}} f\,ds = \int_{\text{反}} f\,ds$（与方向无关，区别于第二类曲线积分）
- **保号性**：$f \le g$ 在 $L$ 上 $\Rightarrow \int_{L} f\,ds \le \int_{L} g\,ds$；特别地 $\bigl\lvert\int_{L} f\,ds\bigr\rvert \le \int_{L} \lvert f\rvert\,ds$

#### 计算法——化归为定积分

第一类曲线积分不能直接从定义计算（那需要取极限），但与定积分一脉相承的思路是：利用曲线方程把 $x,y$ 都用一个参数 $t$ 表示，弧长微元 $ds$ 也写成 $dt$ 的表达式，从而整个曲线积分转化为一个关于 $t$ 的定积分。

设 $f(x,y)$ 在曲线弧 $L$ 上有定义且连续，$L$ 的参数方程为 $\begin{cases}x=\varphi(t) \\ y=\psi(t)\end{cases}\ (\alpha \le t \le \beta)$。若 $\varphi(t),\psi(t)$ 在 $[\alpha,\beta]$ 上具有一阶连续导数，且 $\varphi'^2(t)+\psi'^2(t) \neq 0$（即曲线上没有奇点），则曲线积分 $\int_{L} f(x,y)\,ds$ 存在，且：

$$
\int_{L} f(x,y)\,ds = \int_{\alpha}^{\beta} f[\varphi(t),\psi(t)] \sqrt{\varphi'^2(t) + \psi'^2(t)}\,dt \quad (\alpha < \beta)
$$

:::tip 弧长微元的参数化推导
这个公式的推导逻辑非常自然——

**第一步（弧长微元的参数化）**：由参数方程 $x=\varphi(t),\ y=\psi(t)$，微分得 $dx = \varphi'(t)dt,\ dy = \psi'(t)dt$。根据勾股定理，弧长微元为

$$
ds = \sqrt{(dx)^2 + (dy)^2} = \sqrt{\varphi'^2(t) + \psi'^2(t)}\,dt
$$

**第二步（积分和式的改写）**：设点 $(\xi_i,\eta_i)$ 对应于参数值 $\tau_i$，即 $\xi_i = \varphi(\tau_i),\ \eta_i = \psi(\tau_i)$，其中 $\tau_i \in [t_{i-1}, t_i]$。由于 $\Delta S_i = \int_{t_{i-1}}^{t_i} \sqrt{\varphi'^2(t)+\psi'^2(t)}\,dt$，应用积分中值定理得 $\Delta S_i = \sqrt{\varphi'^2(\tau_i)+\psi'^2(\tau_i)}\,\Delta t_i$。

**第三步（取极限）**：代入积分和式，令 $\lambda \to 0$（等价于 $\Delta t \to 0$），积分和式的极限正是函数 $f[\varphi(t),\psi(t)]\sqrt{\varphi'^2(t)+\psi'^2(t)}$ 在 $[\alpha,\beta]$ 上的定积分。证毕。

:::

> **注意**：定积分的下限 $\alpha$ 一定要小于上限 $\beta$——这是因为 $ds = \sqrt{\varphi'^2+\psi'^2}\,dt$ 是正数，弧长只能正向累积。这一点与 10.2 节的对坐标曲线积分恰好相反（那里 $\alpha$ 对应起点、$\beta$ 对应终点，$\alpha$ 可以大于 $\beta$）。

推广到空间曲线 $\Gamma$：$\begin{cases}x=\varphi(t) \\ y=\psi(t) \\ z=\omega(t)\end{cases}$ 时，

$$
\int_{\Gamma} f(x,y,z)\,ds = \int_{\alpha}^{\beta} f[\varphi,\psi,\omega] \sqrt{\varphi'^2+\psi'^2+\omega'^2}\,dt
$$

**三种特殊情形**：

| 曲线形式 | 公式 | 条件 |
| :--- | :--- | :--- |
| $y=\varphi(x)$ | $\int_{a}^{b} f[x,\varphi(x)]\sqrt{1+\varphi'^2(x)}\,dx$ | $a \le x \le b$ |
| $x=\psi(y)$ | $\int_{a}^{b} f[\psi(y),y]\sqrt{\psi'^2(y)+1}\,dy$ | $a \le y \le b$ |
| $\rho=\rho(\theta)$ | $\int_{\alpha}^{\beta} f[\rho\cos\theta,\rho\sin\theta]\sqrt{\rho^2+\rho'^2}\,d\theta$ | $\alpha \le \theta \le \beta$ |

![对弧长的曲线积分：在曲线上取一小段弧，两端点 P、Q 都在曲线上，斜边 ds 是这段弧的弦，两条直角边分别是它在坐标轴上的投影 dx 与 dy](/notes-assets/hm10-01-arc-length-integral-computation.svg)

:::example 例 1 · 抛物线弧上的对弧长积分
计算 $\int_{L}\sqrt{y}\,ds$，$L$ 为 $y=x^2$ 上 $O(0,0)$ 到 $B(1,1)$ 的一段弧。

**思路**：曲线已给显式 $y=x^2$，直接用 $x$ 作参数。

**解**：参数方程 $\begin{cases}y=x^2 \\ x=x\end{cases}$，$0\le x\le 1$。

$$
\int_{L}\sqrt{y}\,ds = \int_{0}^{1} \sqrt{x^2} \cdot \sqrt{1+(2x)^2}\,dx = \int_{0}^{1} x\sqrt{4x^2+1}\,dx = \frac{1}{12}(5\sqrt{5}-1)
$$

**评注**：$ds = \sqrt{1+(y')^2}\,dx$ 是直角坐标下最常用的弧长微元公式。

:::

:::example 例 2 · 用曲线方程化简被积函数
计算 $\int_{L}(x+y)\,ds$，$L$ 为直线 $y=2-x$ 上 $A(0,2)$ 到 $B(2,0)$ 的线段。

**思路**：注意到 $x+y=2$ 在 $L$ 上是常数，可从被积函数中提出。

**解**：$\int_{L}(x+y)\,ds = \int_{L} 2\,ds = 2 \cdot |AB| = 2 \cdot 2\sqrt{2} = 4\sqrt{2}$。

**评注**：将被积函数用曲线方程化简是常用技巧——$L$ 上的点始终满足 $L$ 的方程。

:::

:::example 例 3 · 分段光滑曲线的三段积分
计算 $\oint_{L} e^{\sqrt{x^2+y^2}}\,ds$，$L$ 由 $\overline{OA}$、$\overset{\frown}{AB}$、$\overline{BO}$ 构成，$A(2,0)$，$B(\sqrt{2},\sqrt{2})$，$\overset{\frown}{AB}$ 为 $x^2+y^2=4$ 上的一段弧。

**思路**：三段曲线需分别参数化——直线段用 $x$ 作参数，圆弧用角度作参数。

**解**：

- $\overline{OA}$（$y=0,\ 0\le x\le 2$）：$\int_{\overline{OA}} e^x\sqrt{1+0}\,dx = e^2-1$
- $\overset{\frown}{AB}$（$x=2\cos t,\ y=2\sin t,\ 0\le t\le\frac{\pi}{4}$）：被积函数 $e^{\sqrt{4}}=e^2$，$ds=2dt$，积分 $= \frac{\pi}{2}e^2$
- $\overline{BO}$（$y=x,\ 0\le x\le\sqrt{2}$）：$\int_{0}^{\sqrt{2}} e^{\sqrt{2}x}\sqrt{2}\,dx = e^2-1$

合计：$\bigl(\frac{\pi}{2}+2\bigr)e^2-2$

**评注**：分段曲线积分 = 各段之和。圆弧段利用 $x^2+y^2=$ 常数可以消去根号。

:::

:::example 例 4 · 空间螺旋线上的对弧长积分
计算 $\int_{\Gamma}(x^2+y^2+z^2)\,ds$，$\Gamma$ 为螺旋线 $x=a\cos t,\ y=a\sin t,\ z=kt$ 上 $t$ 从 $0$ 到 $2\pi$ 的一段。

**思路**：空间曲线直接用三维弧长公式，$ds = \sqrt{x'^2+y'^2+z'^2}\,dt$。

**解**：$x^2+y^2+z^2 = a^2+k^2t^2$，$ds = \sqrt{a^2\sin^2 t + a^2\cos^2 t + k^2}\,dt = \sqrt{a^2+k^2}\,dt$。

$$
\int_{\Gamma} = \sqrt{a^2+k^2}\int_{0}^{2\pi} (a^2+k^2t^2)\,dt = \frac{2}{3}\pi\sqrt{a^2+k^2}(3a^2+4\pi^2k^2)
$$

**评注**：螺旋线的弧长微元出乎意料地简单——$\sqrt{a^2+k^2}$ 是常数。

:::

#### 普通对称性

设平面曲线 $L$ 关于 $y$ 轴对称，$f(x,y)$ 关于 $x$ 有奇偶性：

$$
\int_{L} f(x,y)\,ds =
\begin{cases}
0, & f(-x,y) = -f(x,y) \\
2\int_{L_1} f(x,y)\,ds, & f(-x,y) = f(x,y)
\end{cases}
$$

其中 $L_1$ 是 $L$ 在 $x$ 轴正半轴的部分。关于 $x$ 轴对称时类似。

同样地，推广至空间曲线 $\Gamma$ 关于 $yOz$ 面对称，且 $f(x,y,z)$ 关于 $x$ 有奇偶性，则有

$$
\int_{\Gamma}f(x,y,z)\,ds=
\begin{cases}
0, & f(-x,y,z)=-f(x,y,z) \\
2\int_{\Gamma_1}f(x,y,z)\,ds, & f(-x,y,z)=f(x,y,z)
\end{cases}
$$

其中 $\Gamma_1$ 是 $\Gamma$ 在 $x$ 轴正半轴的部分，同理可得关于其他平面的普通对称性。

> **注意**：第一类曲线积分（无方向）的对称性规律为"**偶倍奇零**"——与定积分的对称性一致。

:::example 例 5 · 用对称性化简椭圆上的积分
$L$ 为椭圆 $\frac{x^2}{4}+\frac{y^2}{3}=1$，周长为 $a$，求 $\oint_{L}(2xy+3x^2+4y^2)\,ds$。

**思路**：$2xy$ 关于 $x$ 为奇函数，$L$ 关于 $y$ 轴对称 → 该项积分为零。剩余项用椭圆方程化简。

**解**：$\oint_{L} 2xy\,ds = 0$（奇函数）。由 $\frac{x^2}{4}+\frac{y^2}{3}=1$ 得 $3x^2+4y^2=12$。

$$
\oint_{L}(3x^2+4y^2)\,ds = 12\oint_{L} ds = 12a
$$

**评注**：将曲线方程代入被积函数是本章反复使用的核心技巧。

:::

#### 轮换对称性

**平面曲线**：若 $L$ 关于 $y=x$ 对称（对调 $x,y$ 后 $L$ 不变），则

$$
\int_{L} f(x,y)\,ds = \int_{L} f(y,x)\,ds
$$

特别地，$\int_{L} f(x)\,ds = \int_{L} f(y)\,ds = \frac{1}{2}\int_{L}[f(x)+f(y)]\,ds$。

**空间曲线**：设积分曲线 $\Gamma$ 关于 $x,y,z$ 有轮换对称性，则

$$
\int_{\Gamma}f(x,y,z)\,ds=\int_{\Gamma}f(y,z,x)\,ds=\int_{\Gamma}f(z,x,y)\,ds
$$

特别地，有：

$$
\int_{\Gamma} f(x)\,ds = \int_{\Gamma} f(y)\,ds = \int_{\Gamma} f(z)\,ds = \frac{1}{3}\int_{\Gamma}[f(x)+f(y)+f(z)]\,ds
$$

:::example 例 6 · 球面与平面交线上的轮换对称性
计算 $\oint_{L}(x^2+y^2)\,ds$，$L$ 为球面 $x^2+y^2+z^2=a^2$ 与平面 $x+y+z=0$ 的交线。

**思路**：交线关于 $x,y,z$ 完全对称，用轮换对称性将 $x^2+y^2$ 与 $z^2$ 联系起来。

**解**：由轮换对称性 $\oint_{L} x^2\,ds = \oint_{L} y^2\,ds = \oint_{L} z^2\,ds = \frac{1}{3}\oint_{L}(x^2+y^2+z^2)\,ds$。

$$
\text{原式} = \frac{2}{3}\oint_{L}(x^2+y^2+z^2)\,ds = \frac{2}{3}a^2 \cdot 2\pi a = \frac{4}{3}\pi a^3
$$

**评注**：$L$ 是半径为 $a$ 的球的大圆，周长为 $2\pi a$。轮换对称性将二元问题转化为三元对称问题，再用球面方程消去变量。

:::

#### 形心公式

形心是均匀物体的**质心**。对曲线段，线密度 $\mu(x,y)$ 均匀时：

$$
\bar{x} = \frac{\int_{L} x\,ds}{\int_{L} ds} \;\Longrightarrow\; \int_{L} x\,ds = \bar{x} \int_{L} ds,\quad \int_{L} y\,ds = \bar{y} \int_{L} ds
$$

形心公式的威力在于：如果曲线形心已知（如圆环的形心在圆心），可以把积分转化为弧长乘以形心坐标，避免了直接计算。

:::example 例 7 · 形心公式与轮换对称性双解
计算 $\oint_{L} x\,ds$，$L$ 为球面 $x^2+y^2+z^2=a^2$ 与平面 $x+y+z=0$ 的交线。

**思路**：法一用轮换对称性直接求和；法二利用形心在原点。

**解（法一 · 轮换对称性）**：$\oint_{L} x\,ds = \frac{1}{3}\oint_{L}(x+y+z)\,ds = 0$。

**解（法二 · 形心公式）**：形心在原点 $\bar{x}=0$，$\oint_{L} x\,ds = \bar{x} \cdot 2\pi a = 0$。

**评注**：两种方法殊途同归。轮换对称性更通用；形心公式更快——只要知道形心位置。

:::

形心公式同样适用于第一类曲面积分和重积分：

$$
\iint_{\Sigma} x\,dS = \bar{x}\iint_{\Sigma} dS,\qquad \iiint_{\Omega} x\,dV = \bar{x}\iiint_{\Omega} dV
$$

## 对坐标的曲线积分

第一类曲线积分只关心"走了多长"，不关心"朝哪个方向走"。但物理学中，力沿路径做功显然与方向有关——顺向做正功、反向做负功。**对坐标的曲线积分**（第二类曲线积分）正是为了刻画这种方向性而引入的，它天然与向量场、功、环流量等物理概念绑定。

### 概念与计算法

#### 定义

第二类曲线积分最自然的物理原型是**力做功**。设质点在力场 $\overrightarrow{F}(x,y) = P(x,y)\overrightarrow{i} + Q(x,y)\overrightarrow{j}$ 作用下沿有向曲线 $L$ 从起点 $A$ 运动到终点 $B$。将 $L$ 细分为 $n$ 个有向小弧段，在第 $i$ 段 $\overrightarrow{M_{i-1}M_i}$ 上，位移的 $x$ 分量 $\Delta x_i = x_i - x_{i-1}$，$y$ 分量 $\Delta y_i = y_i - y_{i-1}$。力在小段上近似为常力 $P(\xi_i,\eta_i)\overrightarrow{i} + Q(\xi_i,\eta_i)\overrightarrow{j}$，该小段做功 ≈ $P(\xi_i,\eta_i)\Delta x_i + Q(\xi_i,\eta_i)\Delta y_i$。累加所有小段并取极限，即得总功。

形式化地：设 $L$ 为 $xOy$ 面内从点 $A$ 到点 $B$ 的一条有向光滑曲线弧，函数 $P(x,y)$ 与 $Q(x,y)$ 在 $L$ 上有界。在 $L$ 上沿 $L$ 的方向任意插入一点列 $M_1(x_1,y_1),M_2(x_2,y_2),\cdots,M_{n-1}(x_{n-1},y_{n-1})$，把 $L$ 分成 $n$ 个有向小弧段 $\overrightarrow{M_{i-1}M_i}\ (i=1,2,\cdots,n;\ M_0=A,\ M_n=B)$。设 $\Delta x_i = x_i - x_{i-1}$，$\Delta y_i = y_i - y_{i-1}$，点 $(\xi_i,\eta_i)$ 为 $\overrightarrow{M_{i-1}M_i}$ 上任意取定的一点。如果当各小弧段长度的最大值 $\lambda \to 0$ 时，和式 $\sum P(\xi_i,\eta_i)\Delta x_i$ 的极限总存在，且与曲线弧 $L$ 的分法及点 $(\xi_i,\eta_i)$ 的取法无关，则称此极限为函数 $P(x,y)$ 在有向曲线弧 $L$ 上**对坐标 $x$ 的曲线积分**，记作 $\int_{L} P(x,y)\,dx$。类似地定义 $\int_{L} Q(x,y)\,dy$。即：

$$
\int_{L} P(x,y)\,dx = \lim_{\lambda \to 0} \sum_{i=1}^{n} P(\xi_i,\eta_i)\Delta x_i
$$

$$
\int_{L} Q(x,y)\,dy = \lim_{\lambda \to 0} \sum_{i=1}^{n} Q(\xi_i,\eta_i)\Delta y_i
$$

其中 $P(x,y),Q(x,y)$ 叫做**被积函数**，$L$ 叫做**积分弧段**。以上两个积分也称为**第二类曲线积分**。

> **与第一类的本质区别**：第一类积分乘的是弧长 $\Delta S_i$（正数，无方向），第二类积分乘的是坐标增量 $\Delta x_i,\Delta y_i$（可正可负，有方向）。因此 $\int_{L} P\,dx$ 中，沿 $x$ 轴正方向走时 $dx>0$，沿反方向走时 $dx<0$——积分值直接依赖于路径的走向。

应用上经常合并写为：

$$
\int_{L} P(x,y)\,dx + Q(x,y)\,dy
$$

**向量形式**：$\displaystyle\int_{L} \overrightarrow{F}(x,y) \cdot d\overrightarrow{r}$，其中 $\overrightarrow{F} = P\overrightarrow{i} + Q\overrightarrow{j}$ 是向量值函数，$d\overrightarrow{r} = dx\,\overrightarrow{i} + dy\,\overrightarrow{j}$ 是有向弧长微元。这个写法清晰地表达了"力·位移"的物理含义。

同样地，推广到空间有向曲线弧 $\Gamma$：

$$
\int_{\Gamma} P(x,y,z)\,dx + Q(x,y,z)\,dy + R(x,y,z)\,dz
$$

或写为向量形式 $\displaystyle\int_{\Gamma} \overrightarrow{A}(x,y,z) \cdot d\overrightarrow{r}$，其中 $\overrightarrow{A} = P\overrightarrow{i}+Q\overrightarrow{j}+R\overrightarrow{k}$，$d\overrightarrow{r} = dx\,\overrightarrow{i}+dy\,\overrightarrow{j}+dz\,\overrightarrow{k}$。

#### 性质

- **线性性**：$\int_{L} [\alpha\overrightarrow{F_1} + \beta\overrightarrow{F_2}] \cdot d\overrightarrow{r} = \alpha\int_{L} \overrightarrow{F_1} \cdot d\overrightarrow{r} + \beta\int_{L} \overrightarrow{F_2} \cdot d\overrightarrow{r}$
- **路径可加性**：若 $L$ 可分成两段光滑有向曲线弧 $L_1$ 和 $L_2$，则 $\int_{L} = \int_{L_1} + \int_{L_2}$
- **方向性**（与第一类的核心区别）：设 $L^-$ 是 $L$ 的反向曲线弧，则 $\displaystyle\int_{L^-} \overrightarrow{F} \cdot d\overrightarrow{r} = -\int_{L} \overrightarrow{F} \cdot d\overrightarrow{r}$

> **注意**：对坐标的曲线积分**必须关注积分弧段的方向**——反向后积分值变号，这一点是两类曲线积分最根本的差异。

#### 计算法

与第一类曲线积分一样，第二类曲线积分的实际计算也依赖于参数化后化为定积分。但这里有一个关键区别：**参数 $t$ 的变化方向必须与曲线的走向一致**。

设 $P(x,y)$ 与 $Q(x,y)$ 在有向曲线弧 $L$ 上有定义且连续，$L$ 的参数方程为 $\begin{cases}x=\varphi(t) \\ y=\psi(t)\end{cases}$。当参数 $t$ 单调地由 $\alpha$ 变到 $\beta$ 时，点 $M(x,y)$ 从 $L$ 的起点 $A$ 运动到终点 $B$。若 $\varphi(t),\psi(t)$ 在以 $\alpha$ 及 $\beta$ 为端点的闭区间上具有一阶连续导数，且 $\varphi'^2(t)+\psi'^2(t) \neq 0$，则曲线积分存在，且：

$$
\int_{L} P(x,y)\,dx = \int_{\alpha}^{\beta} P[\varphi(t),\psi(t)]\,\varphi'(t)\,dt
$$

$$
\int_{L} Q(x,y)\,dy = \int_{\alpha}^{\beta} Q[\varphi(t),\psi(t)]\,\psi'(t)\,dt
$$

合并为：

$$
\int_{L} P\,dx + Q\,dy = \int_{\alpha}^{\beta} \bigl\{P[\varphi(t),\psi(t)]\varphi'(t) + Q[\varphi(t),\psi(t)]\psi'(t)\bigr\}\,dt
$$

:::tip 微元代换的逻辑
将 $x=\varphi(t)$ 代入 $dx = \varphi'(t)dt$，将 $y=\psi(t)$ 代入 $dy = \psi'(t)dt$，被积函数中的 $x,y$ 全部替换为 $t$ 的函数。于是 $\int_{L} P\,dx = \int_{\alpha}^{\beta} P[\varphi(t),\psi(t)] \cdot \varphi'(t)\,dt$。本质上就是把 $dx$ 写成 $\frac{dx}{dt}dt$。

:::

> **注意**：下限 $\alpha$ 对应 $L$ 的**起点**，上限 $\beta$ 对应 $L$ 的**终点**，$\alpha$ 不一定小于 $\beta$——如果沿反方向走，$\alpha > \beta$，积分区间是"倒着"的，结果自然变号。这正是第二类曲线积分方向性的代数体现。

:::example 例 1 · 抛物线弧上的对坐标积分
计算 $\int_{L} xy\,dx$，$L$ 为抛物线 $y^2=x$ 上从 $A(1,-1)$ 到 $B(1,1)$ 的一段弧。

**思路**：两种参数化方式——对 $x$ 积分需拆分为两段，对 $y$ 积分一段搞定。

**解（法一 · 对 $x$）**：分 $\overline{AO}$（$y=-\sqrt{x},\ x:1\to 0$）和 $\overline{OB}$（$y=\sqrt{x},\ x:0\to 1$）。

$$
\int_{L} xy\,dx = \int_{1}^{0} x(-\sqrt{x})\,dx + \int_{0}^{1} x\sqrt{x}\,dx = 2\int_{0}^{1} x^{3/2}\,dx = \frac{4}{5}
$$

**解（法二 · 对 $y$ · 优选）**：$x=y^2,\ y:-1\to 1$。

$$
\int_{L} xy\,dx = \int_{-1}^{1} y^2 \cdot y \cdot 2y\,dy = 2\int_{-1}^{1} y^4\,dy = \frac{4}{5}
$$

**评注**：选 $y$ 作参数只需一段——选择参数的第一原则仍是**避免拆分**。

:::

:::example 例 2 · 同一被积函数、不同路径的结果
计算 $\int_{L} y^2\,dx$：(1) 上半圆周 $x=a\cos t,\ y=a\sin t$，$t:0\to\pi$（逆时针）；(2) $x$ 轴上 $A(a,0)$ 到 $B(-a,0)$ 的直线段。

**思路**：同一被积函数、相同起点终点，路径不同结果可能不同。

**解**：(1) $\int_{0}^{\pi} a^2\sin^2 t \cdot (-a\sin t)\,dt = -a^3\int_{0}^{\pi}\sin^3 t\,dt = -\frac{4}{3}a^3$。

(2) $y=0 \Rightarrow \int_{L} y^2\,dx = 0$。

**评注**：曲线积分的值不仅取决于起点和终点，还与路径有关——这与后文"积分与路径无关"的条件形成对比。

:::

:::example 例 3 · 三条路径上的积分值对比
计算 $\int_{L} 2xy\,dx + x^2\,dy$，$L$ 为 $O(0,0)$ 到 $B(1,1)$：(1) $y=x^2$；(2) $x=y^2$；(3) 折线 $O \to A(1,0) \to B$。

**思路**：三种路径分别计算，观察结果是否一致。

**解**：(1) $\int_{0}^{1}(2x\cdot x^2 + x^2\cdot 2x)\,dx = 4\int_{0}^{1}x^3\,dx = 1$。

(2) $\int_{0}^{1}(2y^3\cdot y\cdot 2y + y^4)\,dy = \int_{0}^{1}5y^4\,dy = 1$。

(3) $\overline{OA}: y=0 \Rightarrow 0$；$\overline{AB}: x=1,\ y:0\to 1 \Rightarrow \int_{0}^{1} dy = 1$。合计 $=1$。

**评注**：三条路径结果相同——这不是巧合！$\frac{\partial P}{\partial y}=2x=\frac{\partial Q}{\partial x}$，这就是 10.3 节要讲的"积分与路径无关"的条件。

:::

:::example 例 4 · 空间直线段上的对坐标积分
计算 $\int_{\Gamma} x^3\,dx + 3zy^2\,dy - x^2yz\,dz$，$\Gamma$ 为 $A(3,2,1)$ 到 $B(0,0,0)$ 的直线段。

**思路**：空间直线的参数方程用比例式写出。

**解**：$\frac{x}{3}=\frac{y}{2}=\frac{z}{1}=t \Rightarrow x=3t,\ y=2t,\ z=t$，$t:1\to 0$。

$$
\int_{\Gamma} = \int_{1}^{0} (27t^3\cdot 3 + 3t\cdot 4t^2\cdot 2 - 9t^2\cdot 2t\cdot t)\,dt = \int_{1}^{0} (105t^3-18t^4)\,dt = -\frac{453}{20}
$$

**评注**：空间直线参数化：各分量同除方向数即得 $t$ 的系数。

:::

#### 对称性

第二类曲线积分的对称性与第一类**完全不同**——方向性改变了奇偶规律。设 $L$ 关于 $y$ 轴对称：

| 积分类型 | $P(-x,y)=-P(x,y)$（关于 $x$ 奇） | $P(-x,y)=P(x,y)$（关于 $x$ 偶） |
| :--- | :--- | :--- |
| $\int_{L} P\,dx$ | $2\int_{L_1}$（偶倍） | $0$（奇零） |
| $\int_{L} P\,dy$ | $0$（奇零） | $2\int_{L_1}$（偶倍） |

> **口诀**："对 $x$ 积分偶倍奇零，对 $y$ 积分偶零奇倍"——与第一类的"一律奇零偶倍"完全不同，根源在于 $dx$ 本身也随对称性变号。

### 两类曲线积分之间的联系

有向曲线弧 $L$ 的**单位切向量** $\overrightarrow{t} = (\cos\alpha, \cos\beta)$，其中方向余弦由参数方程给出：

$$
\cos\alpha = \frac{\varphi'(t)}{\sqrt{\varphi'^2+\psi'^2}},\quad \cos\beta = \frac{\psi'(t)}{\sqrt{\varphi'^2+\psi'^2}}
$$

两类曲线积分的转换公式：

$$
\int_{L} P\,dx + Q\,dy = \int_{L} (P\cos\alpha + Q\cos\beta)\,ds
$$

向量形式：$\displaystyle\int_{L} \overrightarrow{A} \cdot d\overrightarrow{r} = \int_{L} \overrightarrow{A} \cdot \overrightarrow{t}\,ds$。

> **直观理解**：$dx = \cos\alpha\,ds$，$dy = \cos\beta\,ds$——有向弧长微元在坐标轴上的投影。

空间曲线 $\Gamma$ 同理，切向量方向余弦为三个分量，转换公式为

$$
\int_{\Gamma} P\,dx+Q\,dy+R\,dz = \int_{\Gamma}(P\cos\alpha+Q\cos\beta+R\cos\gamma)\,ds
$$

:::example 例 1 · 把第二类曲线积分化为第一类
将 $\int_{L} P\,dx+Q\,dy$ 化为第一类曲线积分，$L$ 为 $y=x^2$ 从 $(0,0)$ 到 $(2,4)$。

**解**：$\cos\alpha = \frac{1}{\sqrt{1+4x^2}},\ \cos\beta = \frac{2x}{\sqrt{1+4x^2}}$。

$$
\int_{L} P\,dx+Q\,dy = \int_{L} \left(P\cdot\frac{1}{\sqrt{1+4x^2}} + Q\cdot\frac{2x}{\sqrt{1+4x^2}}\right)ds
$$

:::

## 格林公式及其应用

前两节分别在曲线上做积分——要么沿弧长累积（第一类），要么沿坐标轴分量累积（第二类）。格林公式揭示了两者之间的深层联系：**平面闭区域上的二重积分，等于其边界上的曲线积分**。这一定理不仅是计算工具（二重积分 ↔ 曲线积分互化），更开启了从牛顿-莱布尼茨公式到广义斯托克斯定理的"边界-内部对偶"体系。

### 格林公式

#### 预备概念

**单连通与复连通**：若 $D$ 内任一闭曲线所围部分都在 $D$ 内，则 $D$ 为**单连通区域**（无"洞"）；否则为**复连通区域**（有"洞"）。

![三种情形：左 —— 单连通区域，任一条闭曲线所围的部分仍在区域内（无洞）；中 —— 复连通区域，中间被挖去一个洞；右 —— 复连通区域，中间只被挖去一个点（洞缩成一点，绕着它的小圆周仍不能缩成一点，所以依旧是复连通）](/notes-assets/hm10-02-planar-connected-region.svg)

**边界曲线的正向**：沿 $L$ 行走时，区域 $D$ 始终在观察者的**左边**。因此外边界正向为**逆时针**，内边界正向为**顺时针**。

![边界曲线正向的规定：沿边界行走时区域始终在观察者左侧](/notes-assets/hm10-03-boundary-orientation.jpg)

#### 公式与条件

设闭区域 $D$ 由分段光滑曲线 $L$ 围成，$P,Q$ 在 $D$ 上有一阶连续偏导数，则：

$$
\iint\limits_{D} \left(\frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y}\right)dxdy = \oint_{L} P\,dx + Q\,dy
$$

其中 $L$ 是 $D$ 的正向边界。

:::tip 格林公式的证明思路
先证 $-\iint_{D}\frac{\partial P}{\partial y}dxdy = \oint_{L} P\,dx$（将 $D$ 视为 $X$ 型区域，二重积分化为二次积分），再证 $\iint_{D}\frac{\partial Q}{\partial x}dxdy = \oint_{L} Q\,dy$（视为 $Y$ 型区域），两式相加即得。对一般区域，用辅助线切割为若干 $X$ 型 + $Y$ 型子区域，辅助线上积分相互抵消。

![格林公式的证明：先对 X 型区域证第一项，再对 Y 型区域证第二项](/notes-assets/hm10-04-green-theorem-proof.jpg)

:::

:::example 例 1 · 用格林公式把曲线积分化为二重积分
计算 $\oint_{L} x^2y\,dx - xy^2\,dy$，$L$ 为正向圆周 $x^2+y^2=a^2$。

**思路**：闭曲线直接套格林公式，二重积分用极坐标。

**解**：$P=x^2y,\ Q=-xy^2 \Rightarrow \frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y} = -y^2-x^2$。

$$
\oint_{L} = \iint_{D} (-x^2-y^2)\,dxdy = -\int_{0}^{2\pi}d\theta\int_{0}^{a} \rho^2\cdot\rho\,d\rho = -\frac{1}{2}\pi a^4
$$

**评注**：直接算曲线积分也可（参数方程代入），但格林公式一步转化为极坐标二重积分，明显更快。

:::

:::example 例 2 · 反向用格林公式算二重积分
计算 $\iint_{D} e^{-y^2}\,dxdy$，$D$ 以 $O(0,0),A(1,1),B(0,1)$ 为顶点。

**思路**：$e^{-y^2}$ 对 $y$ 不可积（无初等原函数）。用格林公式反方向转化，需构造 $P,Q$ 使 $\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}=e^{-y^2}$。

**解**：取 $P=0,\ Q=xe^{-y^2}$，则 $\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}=e^{-y^2}$。

$$
\iint_{D} e^{-y^2}\,dxdy = \oint_{L} xe^{-y^2}\,dy
$$

边界由 $\overline{OA}$（$y=x$）、$\overline{AB}$（$y=1$）和 $\overline{BO}$（$x=0$）组成。$\overline{AB}$ 上 $y=1$ 为常数 $\Rightarrow dy=0$；$\overline{BO}$ 上 $x=0 \Rightarrow$ 被积函数为零。只剩 $\overline{OA}$：

$$
\int_{\overline{OA}} xe^{-y^2}\,dy = \int_{0}^{1} x e^{-x^2}\,dx = \frac{1}{2}(1-e^{-1})
$$

**评注**：格林公式可以双向使用——二重积分难算时化曲线积分，曲线积分难算时化二重积分。这里构造 $P,Q$ 时让 $\frac{\partial Q}{\partial x}$ 产生被积函数而 $\frac{\partial P}{\partial y}=0$，是一种标准手法。

:::

#### 补线法

当 $L$ 不是闭曲线时，补一条辅助线使其封闭，用格林公式后再减去辅助线上的积分。

:::example 例 3 · 补线法处理非闭曲线
计算 $\int_{L} x^2\,dx + (y-x)\,dy$，$L$ 为上半圆周 $y=\sqrt{a^2-x^2}$，逆时针方向。

**思路**：补 $x$ 轴上线段 $L_1: y=0,\ x:-a\to a$ 使曲线封闭，用格林公式。

**解**：$\oint_{L+L_1} = \iint_{D}(-1)\,dxdy = -\frac{1}{2}\pi a^2$。

$\int_{L_1} = \int_{-a}^{a} x^2\,dx = \frac{2}{3}a^3$。

$$
\int_{L} = \oint_{L+L_1} - \int_{L_1} = -\frac{1}{2}\pi a^2 - \frac{2}{3}a^3
$$

**评注**：补的线越是简单越好——这里补了 $x$ 轴上的线段，$y=0$ 使 $dy$ 项消失。

:::

#### 挖洞法

当 $P,Q$ 在区域内某点无定义（分母为零）时，以该点为中心挖一个小洞，对外围区域用格林公式。

:::example 例 4 · 挖洞法处理奇点
计算 $I=\oint_{L} \frac{x\,dy-y\,dx}{4x^2+y^2}$，$L$ 为以 $(1,0)$ 为中心、$R>1$ 为半径的圆周，逆时针。

**思路**：原点 $(0,0)$ 处被积函数无定义（奇点）。挖一个以原点为中心的小椭圆 $L_1: 4x^2+y^2=\varepsilon^2$（顺时针），在 $L+L_1$ 围成的环形区域上用格林公式。

**解**：验证 $\frac{\partial P}{\partial y} = \frac{y^2-4x^2}{(4x^2+y^2)^2} = \frac{\partial Q}{\partial x}$，环形区域内格林公式给出 $\oint_{L+L_1}=0$，于是

$$
I = -\oint_{L_1} \frac{x\,dy-y\,dx}{4x^2+y^2} = \frac{1}{\varepsilon^2}\oint_{L_1^{\text{逆}}} x\,dy - y\,dx
$$

其中 $L_1^{\text{逆}}$ 是 $L_1$ 反向（改为逆时针）后的椭圆。对 $L_1^{\text{逆}}$ 用格林公式：

$$
I = \frac{1}{\varepsilon^2}\iint_{D_\varepsilon} 2\,d\sigma = \frac{2}{\varepsilon^2}\cdot\pi\cdot\frac{\varepsilon}{2}\cdot\varepsilon = \pi
$$

**评注**：挖洞的形状应与分母匹配——分母是 $4x^2+y^2$，挖一个同形椭圆使分母在小椭圆上变为常数，即可提到积分号外。这是挖洞法的精髓。

:::

#### 空间闭曲线降维法

空间闭曲线不能直接使用格林公式（格林公式是平面定理）。策略是**消去一个变量**，投影到坐标面，在投影曲线上用格林公式。

:::example 例 5 · 空间闭曲线消元降维
计算 $I=\oint_{\Gamma} y\,dx+z\,dy+x\,dz$，$\Gamma: \begin{cases}x^2+y^2+z^2=2az \\ x+z=a\end{cases}$，从 $z$ 轴正向看逆时针。

**思路**：消去 $z$（用 $z=a-x$），将 $\Gamma$ 投影到 $xOy$ 面，化为平面曲线积分后用格林公式。

**解**：消 $z$ 得投影曲线 $L: 2x^2+y^2=a^2$（椭圆），方向不变。

$$
I = \oint_{L} y\,dx + (a-x)\,dy + x\,(-dx) = \oint_{L} (y-x)\,dx + (a-x)\,dy
$$

格林公式：$I = \iint_{D} [-1 - 1]\,dxdy = -2 \cdot \pi\cdot\frac{a}{\sqrt{2}}\cdot a = -\sqrt{2}\pi a^2$。

**评注**：降维法的关键是消元后重新整理 $dx,dy,dz$ 的关系——这里 $z=a-x \Rightarrow dz=-dx$，代入整理即可。

:::

#### 利用格林公式求面积

取 $P=-y,\ Q=x$，则 $\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}=2$，格林公式给出：

$$
A = \frac{1}{2}\oint_{L} x\,dy - y\,dx
$$

这就是用曲线积分计算平面图形面积的公式。

:::example 例 6 · 用曲线积分求椭圆面积
求椭圆 $x=a\cos\theta,\ y=b\sin\theta$ 的面积。

**解**：$A = \frac{1}{2}\int_{0}^{2\pi} [a\cos\theta\cdot b\cos\theta - b\sin\theta\cdot(-a\sin\theta)]\,d\theta = \frac{1}{2}ab\int_{0}^{2\pi} d\theta = \pi ab$。

**评注**：比二重积分快——不需要画区域、不需要坐标变换，直接参数代入。

:::

### 平面上曲线积分与路径无关的条件

#### 路径无关的充要条件

设 $D$ 为**单连通区域**，$P,Q$ 在 $D$ 上有一阶连续偏导数，则以下五个命题**等价**：

1. 对 $D$ 内任一闭曲线 $C$，$\oint_{C} P\,dx+Q\,dy = 0$
2. 在 $D$ 内曲线积分 $\int_{L} P\,dx+Q\,dy$ **与路径无关**（只取决于起点和终点）
3. 在 $D$ 内恒有 $\displaystyle\frac{\partial P}{\partial y} = \frac{\partial Q}{\partial x}$
4. 存在 $u(x,y)$ 使 $du = P\,dx + Q\,dy$（$P\,dx+Q\,dy$ 是**全微分**）
5. $P\overrightarrow{i} + Q\overrightarrow{j}$ 是某函数 $u(x,y)$ 的**梯度**（$\nabla u$）

> **注意**："单连通"是必要条件——在有"洞"的区域上，即使 $\frac{\partial P}{\partial y}=\frac{\partial Q}{\partial x}$，曲线积分仍可能与路径有关（如 10.3.1 节的例 4 的挖洞题）。

物理意义：条件 $\frac{\partial P}{\partial y}=\frac{\partial Q}{\partial x}$ 等价于向量场 $\overrightarrow{F}=(P,Q)$ 是**保守场**（如重力、静电力），保守力做功与路径无关。

:::example 例 1 · 验证与路径无关并求积分值
证明 $\int_{(0,0)}^{(2,1)} (2xy-y^4+3)\,dx + (x^2-4xy^3)\,dy$ 与路径无关并求值。

**思路**：验证偏导相等后，选一条最简单的路径（如折线：先水平后竖直）计算。

**解**：$\frac{\partial P}{\partial y}=2x-4y^3 = \frac{\partial Q}{\partial x} \Rightarrow$ 与路径无关。

取路径 $(0,0) \to (2,0) \to (2,1)$：

$$
\int_{0}^{2} 3\,dx + \int_{0}^{1} (4-8y^3)\,dy = 6 + [4y-2y^4]_0^1 = 6+2 = 8
$$

**评注**：选路径时尽量让一个变量为常数（水平或竖直），使 $dx=0$ 或 $dy=0$ 简化计算。

:::

:::example 例 2 · 由全微分条件确定参数
设 $\frac{(x+ky)\,dx+y\,dy}{(x+y)^2}$ 为某二元函数的全微分，求 $k$。

**思路**：全微分 $\Leftrightarrow \frac{\partial P}{\partial y} = \frac{\partial Q}{\partial x}$，由此确定 $k$。

**解**：$P=\frac{x+ky}{(x+y)^2},\ Q=\frac{y}{(x+y)^2}$。令 $\frac{\partial P}{\partial y}=\frac{\partial Q}{\partial x}$，解得 $k=2$。

**评注**："是某函数的全微分"="是某函数的梯度"=条件 $\frac{\partial P}{\partial y}=\frac{\partial Q}{\partial x}$——三种说法同一含义。

:::

#### 全微分方程

若 $P\,dx+Q\,dy=0$ 的左端恰是某函数 $u(x,y)$ 的全微分，则为**全微分方程**，通解为 $u(x,y)=C$。

原函数公式：

$$
u(x,y) = \int_{x_0}^{x} P(x,y_0)\,dx + \int_{y_0}^{y} Q(x,y)\,dy + C
$$

:::example 例 3 · 全微分方程的两种解法
验证 $ye^{y^2}dx + (xe^{y^2}+2xy^2e^{y^2})dy = 0$ 为全微分方程并求通解。

**思路**：先验证 $\frac{\partial P}{\partial y}=\frac{\partial Q}{\partial x}$，再用凑微分（快）或公式（稳）求原函数。

**解（法一 · 凑微分）**：$ye^{y^2}dx + x\,d(ye^{y^2}) = d(xye^{y^2}) = 0 \Rightarrow xye^{y^2}=C$。

**解（法二 · 公式法）**：$u(x,y) = \int_{0}^{x} 0\,dx + \int_{0}^{y} x(e^{y^2}+2y^2e^{y^2})\,dy = xye^{y^2}$。

**评注**：凑微分需要识别 $d(ye^{y^2}) = (1+2y^2)e^{y^2}dy$，公式法更稳健。实际解题推荐先用公式法求出原函数再验证。

:::

## 对面积的曲面积分

把第一类曲线积分的思路从"曲线"升级到"曲面"：分割的对象从小弧段变成小曲面片，累积的量从弧长变成曲面面积。**对面积的曲面积分**（第一类曲面积分）没有方向性，只关心函数在曲面上的分布——它本质上是用曲面面积加权的积分。物理上，若 $f(x,y,z)$ 表示面密度，则 $\iint_{\Sigma} f\,dS$ 就是曲面 $\Sigma$ 的总质量。

#### 定义

设曲面 $\Sigma$ 是光滑的，函数 $f(x,y,z)$ 在 $\Sigma$ 上有界。把 $\Sigma$ 任意分成 $n$ 小块 $\Delta S_i$（$\Delta S_i$ 同时也代表第 $i$ 小块曲面的面积），设 $(\xi_i,\eta_i,\zeta_i)$ 是 $\Delta S_i$ 上任意取定的一点，作乘积 $f(\xi_i,\eta_i,\zeta_i) \cdot \Delta S_i\ (i=1,2,\cdots,n)$，并作和 $\sum\limits_{i=1}^{n} f(\xi_i,\eta_i,\zeta_i)\Delta S_i$。如果当各小块曲面的直径的最大值 $\lambda \to 0$ 时，这和的极限总存在，且与曲面 $\Sigma$ 的分法及点 $(\xi_i,\eta_i,\zeta_i)$ 的取法无关，那么称此极限为函数 $f(x,y,z)$ 在曲面 $\Sigma$ 上的**对面积的曲面积分**，或**第一类曲面积分**，记作 $\iint\limits_{\Sigma} f(x,y,z)\,dS$，即

$$
\iint\limits_{\Sigma} f(x,y,z)\,dS = \lim_{\lambda \to 0} \sum_{i=1}^{n} f(\xi_i,\eta_i,\zeta_i)\Delta S_i
$$

其中 $f(x,y,z)$ 叫做**被积函数**，$\Sigma$ 叫做**积分曲面**。

![曲面 Σ 上的小面片 ΔSᵢ 与其上取定的点 (ξᵢ, ηᵢ, ζᵢ)](/notes-assets/hm10-05-surface-integral-over-area.jpg)

> **直观理解**：如果把第一类曲线积分理解为"把一条曲线拉直称重"（弧长 × 线密度），那么第一类曲面积分就是"把一张曲面铺平称重"（面积 × 面密度）。$dS$ 是**曲面面积微元**，积分就是把每个小面片上的量累加起来。

当 $f(x,y,z)$ 在光滑曲面 $\Sigma$ 上连续时，其对面积的曲面积分必存在。如果 $\Sigma$ 是分片光滑的，可将 $\Sigma$ 分成多个光滑曲面，分别积分后相加。对面积的曲面积分的性质（线性性、可加性、无方向性、保号性）与对弧长的曲线积分完全类似。

#### 计算法

设曲面 $\Sigma: z=z(x,y)$，$\Sigma$ 在 $xOy$ 面上的投影区域为 $D_{xy}$，则：

$$
\iint\limits_{\Sigma} f(x,y,z)\,dS = \iint\limits_{D_{xy}} f[x,y,z(x,y)] \sqrt{1 + z_x^2 + z_y^2}\,dxdy
$$

:::tip 曲面面积微元的来历
曲面面积微元 $dS = \sqrt{1+z_x^2+z_y^2}\,dxdy$（即切平面上的面积元素在水平面上的投影放大），代入定义即化为 $D_{xy}$ 上的二重积分。

![曲面面积微元的放大系数：切平面上的面积元素投影到 xOy 面](/notes-assets/hm10-06-surface-integral-computation.jpg)

:::

**关键步骤**（三步走）：

1. 将 $\Sigma$ 投影到坐标面，得投影区域 $D_{xy}$
2. 写出 $z=z(x,y)$，计算 $z_x,z_y$，代入 $\sqrt{1+z_x^2+z_y^2}$
3. 被积函数中的 $z$ 用 $z(x,y)$ 替换，化为 $D_{xy}$ 上的二重积分

:::example 例 1 · 平面片上的对面积积分
计算 $\iint_{\Sigma} (x+y+z)\,dS$，$\Sigma$ 为平面 $x+2y+3z=1$ 在 $x\ge 0,y\ge 0,z\ge 0$ 的部分。

**思路**：从平面方程解出 $z$，投影到 $xOy$ 面，按三步走。

**解**：$z=\frac{1}{3}-\frac{1}{3}x-\frac{2}{3}y$，$z_x=-\frac{1}{3},\ z_y=-\frac{2}{3}$，$\sqrt{1+z_x^2+z_y^2}=\frac{\sqrt{14}}{3}$。

$$
\iint_{\Sigma} = \iint_{D_{xy}} \left(\frac{2}{3}x+\frac{1}{3}y+\frac{1}{3}\right) \cdot \frac{\sqrt{14}}{3}\,dxdy = \cdots = \frac{11\sqrt{14}}{216}
$$

**评注**：$\sqrt{1+z_x^2+z_y^2}$ 是曲面面积元素对投影区域的放大系数——平面方程越"陡"，放大系数越大。

:::

:::example 例 2 · 四面体整个表面的分片计算
计算 $\iint_{\Sigma} xyz\,dS$，$\Sigma$ 为由平面 $x=0,y=0,z=0$ 及 $x+y+z=1$ 围成的四面体的整个边界。

**思路**：边界由四个平面组成——三个坐标面上的积分为零（被积函数含坐标为零），只需算斜面。

**解**：坐标面 $\Sigma_1,\Sigma_2,\Sigma_3$ 上被积函数含零因子，积分 $=0$。

$\Sigma_4: z=1-x-y$，$z_x=z_y=-1$，$\sqrt{3}$ 为放大系数。

$$
\iint_{\Sigma_4} = \iint_{D_{xy}} xy(1-x-y)\sqrt{3}\,dxdy = \sqrt{3}\int_{0}^{1} dx\int_{0}^{1-x} xy(1-x-y)\,dy = \frac{\sqrt{3}}{120}
$$

**评注**：被积函数含坐标时，坐标面上的积分自动为零——这省去了大量计算。

:::

:::example 例 3 · 球面顶部上的对面积积分
计算 $\iint_{\Sigma} \frac{1}{z}\,dS$，$\Sigma$ 为球面 $x^2+y^2+z^2=a^2$ 被 $z=h\ (0<h<a)$ 截出的顶部。

**思路**：从球面方程解出 $z=\sqrt{a^2-x^2-y^2}$，投影区域是圆 $x^2+y^2 \le a^2-h^2$，用极坐标。

**解**：$z_x = -\frac{x}{\sqrt{a^2-x^2-y^2}}$，$z_y = -\frac{y}{\sqrt{a^2-x^2-y^2}}$，$\sqrt{1+z_x^2+z_y^2} = \frac{a}{\sqrt{a^2-x^2-y^2}}$。

$$
\iint_{\Sigma} = \iint_{D_{xy}} \frac{1}{\sqrt{a^2-x^2-y^2}} \cdot \frac{a}{\sqrt{a^2-x^2-y^2}}\,dxdy = \iint_{D_{xy}} \frac{a}{a^2-x^2-y^2}\,dxdy
$$

极坐标：

$$
= a\int_{0}^{2\pi}d\theta\int_{0}^{\sqrt{a^2-h^2}} \frac{\rho}{a^2-\rho^2}\,d\rho = 2\pi a\ln\frac{a}{h}
$$

**评注**：球面部分的投影放大系数 $\frac{a}{z}$——越靠近球顶（$z\approx a$），放大系数越接近 1；越靠近赤道（$z\approx 0$），放大系数越大。

:::

#### 对称性

**普通对称性**（与第一类曲线积分一致——"偶倍奇零"）：若 $\Sigma$ 关于 $xOy$ 面对称，

$$
\iint_{\Sigma} f(x,y,z)\,dS =
\begin{cases}
2\iint_{\Sigma_1} f\,dS, & f(x,y,-z)=f(x,y,z) \\
0, & f(x,y,-z)=-f(x,y,z)
\end{cases}
$$

**轮换对称性**：若 $\Sigma$ 关于 $x,y,z$ 轮换对称，则

$$
\iint_{\Sigma} f(x)\,dS = \iint_{\Sigma} f(y)\,dS = \iint_{\Sigma} f(z)\,dS = \frac{1}{3}\iint_{\Sigma}[f(x)+f(y)+f(z)]\,dS
$$

:::example 例 4 · 球面上的对称性综合
计算 $\iint_{\Sigma} (x^2+y^2+yz)\,dS$，$\Sigma$ 为球面 $x^2+y^2+z^2=R^2$。

**思路**：普通对称性消去 $yz$ 项（奇函数），轮换对称性将 $x^2+y^2$ 与 $z^2$ 联系起来，再用球面方程化简。

**解**：$\Sigma$ 关于 $xOz$ 面对称，$yz$ 关于 $y$ 为奇函数 $\Rightarrow \iint_{\Sigma} yz\,dS = 0$。

轮换对称性：$\iint_{\Sigma} x^2\,dS = \iint_{\Sigma} y^2\,dS = \frac{1}{3}\iint_{\Sigma} (x^2+y^2+z^2)\,dS$。

$$
\text{原式} = \frac{2}{3}\iint_{\Sigma} (x^2+y^2+z^2)\,dS = \frac{2}{3}R^2 \cdot 4\pi R^2 = \frac{8}{3}\pi R^4
$$

**评注**：球面总面积 $4\pi R^2$ 是常识。对称性 + 球面方程是处理球面积分的标准组合拳。

:::

## 对坐标的曲面积分

第一类曲面积分只关心"在曲面上累积了多少"，不关心方向。但当流体以一定速度穿过曲面时，从上侧穿过和下侧穿过含义相反——**对坐标的曲面积分**（第二类曲面积分）正是为了刻画这种方向性。它与向量场的**通量（流量）**直接关联，是高斯公式和斯托克斯公式的基础。

### 概念与计算法

#### 曲面的侧

曲面分为**双侧曲面**和**单侧曲面**。通常我们遇到的曲面都是双侧的（如球面有内侧与外侧，平面有上侧与下侧）。而对于莫比乌斯带、克莱因瓶等单侧曲面，无法一致地定义"哪面朝外"——本章仅讨论双侧曲面。

对于一张包围某一空间区域的闭曲面，有内侧与外侧之分。我们规定法向量所指的一侧为正：

- **正侧**：上侧（$\cos\gamma>0$）、右侧（$\cos\beta>0$）、前侧（$\cos\alpha>0$）
- **负侧**：下侧（$\cos\gamma<0$）、左侧（$\cos\beta<0$）、后侧（$\cos\alpha<0$）

![曲面取正侧、负侧时法向量与坐标轴的夹角](/notes-assets/hm10-07-surface-side-orientation.jpg)

对于取定了法向量即选定了侧的曲面——如对于 $z=z(x,y)$，法向量 $\overrightarrow{n}$ 的方向朝上，我们就认为取定了曲面的上侧。这样的曲面称为**有向曲面**。

**有向投影面积**：设 $\Sigma$ 是有向曲面，在 $\Sigma$ 上取一小块曲面 $\Delta S$，其在 $xOy$ 面上的投影区域面积为 $(\Delta\sigma)_{xy}$。我们规定 $\Delta S$ 在 $xOy$ 面上的**有向投影面积** $(\Delta S)_{xy}$ 为：

$$
(\Delta S)_{xy} =
\begin{cases}
+(\Delta\sigma)_{xy}, & \cos\gamma > 0\ \text{（上侧——法向量与 }z\text{ 轴夹锐角）} \\
-(\Delta\sigma)_{xy}, & \cos\gamma < 0\ \text{（下侧——法向量与 }z\text{ 轴夹钝角）} \\
0, & \cos\gamma = 0\ \text{（曲面垂直于 }xOy\text{ 面）}
\end{cases}
$$

> **为什么要这样定义？** 因为流体从上侧穿过曲面时，在 $xOy$ 面上的投影是"正向"的；从下侧穿过时，投影方向反转。这种带符号的投影面积自然地刻画了方向的"进出"。

$yOz$ 和 $zOx$ 面上的有向投影 $(\Delta S)_{yz}$、$(\Delta S)_{zx}$ 定义同理，符号分别由 $\cos\alpha$ 和 $\cos\beta$ 的正负决定。

#### 流量与对坐标的曲面积分的定义

**质量流量**（简称流量）指单位时间内通过某个截面的流体质量：流量 = 密度 × 速度 × 截面积。

对于稳定流动的不可压缩液体（密度 $\rho=1$），以速度 $\overrightarrow{V} = P(x,y,z)\overrightarrow{i} + Q(x,y,z)\overrightarrow{j} + R(x,y,z)\overrightarrow{k}$ 定向流过有向曲面 $\Sigma$。在单位时间内流过曲面微元 $\Delta S$ 的流量为速度在法向量方向上的分量乘以面积：

$$
\Delta m = \Delta S \cdot \overrightarrow{V} \cdot \overrightarrow{n} = (P\cos\alpha + Q\cos\beta + R\cos\gamma)\Delta S
$$

其中 $\overrightarrow{n}=(\cos\alpha,\cos\beta,\cos\gamma)$ 是 $\Sigma$ 的单位法向量。注意到 $\Delta S\cos\gamma$ 正是 $\Delta S$ 在 $xOy$ 面上的有向投影面积 $(\Delta S)_{xy}$，同理 $\Delta S\cos\alpha = (\Delta S)_{yz}$，$\Delta S\cos\beta = (\Delta S)_{zx}$。因此：

$$
\Delta m = P \cdot (\Delta S)_{yz} + Q \cdot (\Delta S)_{zx} + R \cdot (\Delta S)_{xy}
$$

将曲面细分后求和取极限，就得到了**对坐标的曲面积分**的定义：

$$
\iint\limits_{\Sigma} R(x,y,z)\,dxdy = \lim_{\lambda \to 0} \sum_{i=1}^{n} R(\xi_i,\eta_i,\zeta_i)(\Delta S_i)_{xy}
$$

$$
\iint\limits_{\Sigma} P(x,y,z)\,dydz = \lim_{\lambda \to 0} \sum_{i=1}^{n} P(\xi_i,\eta_i,\zeta_i)(\Delta S_i)_{yz}
$$

$$
\iint\limits_{\Sigma} Q(x,y,z)\,dzdx = \lim_{\lambda \to 0} \sum_{i=1}^{n} Q(\xi_i,\eta_i,\zeta_i)(\Delta S_i)_{zx}
$$

其中 $P,Q,R$ 叫做**被积函数**，$\Sigma$ 叫做**积分曲面**。这三个积分统称为**第二类曲面积分**。通常合并写为：

$$
\iint\limits_{\Sigma} P(x,y,z)\,dydz + Q(x,y,z)\,dzdx + R(x,y,z)\,dxdy
$$

> **符号的物理含义**：$dxdy$ 不是"对 $x$ 和 $y$ 的二重积分"，而是曲面有向微元在 $xOy$ 面上的投影——$dxdy = (\Delta S)_{xy} = \cos\gamma\,dS$。换句话说，$\iint_{\Sigma} R\,dxdy$ 测量的是 $R$（速度的 $z$ 分量）乘以曲面在 $xOy$ 面上的有向投影面积——这正是"垂直于 $xOy$ 面的流量分量"。

#### 性质

- **可加性**：$\Sigma = \Sigma_1 \cup \Sigma_2 \Rightarrow \iint_{\Sigma} = \iint_{\Sigma_1} + \iint_{\Sigma_2}$
- **方向性**：$\displaystyle\iint_{\Sigma^-} = -\iint_{\Sigma}$（取相反侧积分变号）

#### 计算法

设 $\Sigma: z=z(x,y)$ 取上侧，$\Sigma$ 在 $xOy$ 面上的投影区域为 $D_{xy}$，则：

$$
\iint\limits_{\Sigma} R(x,y,z)\,dxdy = \iint\limits_{D_{xy}} R[x,y,z(x,y)]\,dxdy
$$

若取下侧，右端加负号。对 $dydz$ 和 $dzdx$ 的积分，分别向 $yOz$ 和 $zOx$ 面投影，规则相同。

> **核心**：将曲面积分化为投影区域上的二重积分 → 替换 $z=z(x,y)$ → 根据曲面侧确定正负号。

:::example 例 1 · 三角形上侧的对坐标积分
计算 $\iint_{\Sigma} x\,dxdy$，$\Sigma$ 为平面 $x+y+z=1$ 上侧在 $x\ge 0,y\ge 0,z\ge 0$ 的部分。

**思路**：直接投影到 $xOy$ 面，$z=1-x-y$，上侧取正号。

**解**：$\iint_{\Sigma} x\,dxdy = \iint_{D_{xy}} x\,dxdy = \int_{0}^{1} dx\int_{0}^{1-x} x\,dy = \int_{0}^{1} x(1-x)\,dx = \frac{1}{6}$。

**评注**：第二类曲面积分化为二重积分后，$dS$ 的放大系数 $\sqrt{1+z_x^2+z_y^2}$ 不再出现——因为 $dxdy$ 是投影面积而非真实面积。

:::

:::example 例 2 · 长方体整个表面的分片计算
计算 $\oiint_{\Sigma} x^2\,dydz + y^2\,dzdx + z^2\,dxdy$，$\Sigma$ 为长方体 $\Omega: 0\le x\le a, 0\le y\le b, 0\le z\le c$ 的整个表面外侧。

**思路**：六个面分别计算。利用"只有与投影面平行的面才有非零投影"——$dydz$ 只需算前后两面。

**解**：对 $\oiint_{\Sigma} x^2\,dydz$：只有 $x=a$（前侧，正）和 $x=0$（后侧，负）有非零投影。

$$
= \iint_{D_{yz}} a^2\,dydz - \iint_{D_{yz}} 0^2\,dydz = a^2bc
$$

同理得 $y^2 \to ab^2c$，$z^2 \to abc^2$。合计 $=abc(a+b+c)$。

**评注**：规则：哪个面在对应投影面上有投影就算哪个面。前后两面（$x$ 为常数）贡献 $dydz$ 项，左右两面贡献 $dzdx$ 项，上下两面贡献 $dxdy$ 项。

:::

#### 对称性

第二类曲面积分的对称性与第一类**相反**（因为有方向性）。设 $\Sigma$ 关于 $xOy$ 面对称：

$$
\iint_{\Sigma} R(x,y,z)\,dxdy =
\begin{cases}
0, & R(x,y,-z) = R(x,y,z)\ \text{（关于 }z\text{ 偶）} \\
2\iint_{\Sigma_1} R\,dxdy, & R(x,y,-z) = -R(x,y,z)\ \text{（关于 }z\text{ 奇）}
\end{cases}
$$

> **口诀**："关于 $z$ 偶零奇倍"——与第一类的"奇零偶倍"恰好相反，原因在于 $dxdy$ 在翻转侧时变号。

:::example 例 3 · 球面部分上的对称性应用
计算 $\iint_{\Sigma} xyz\,dxdy$，$\Sigma$ 为球面 $x^2+y^2+z^2=1$ 外侧在 $x\ge 0,y\ge 0$ 的部分。

**思路**：$xyz$ 关于 $z$ 为奇函数，$\Sigma$ 关于 $xOy$ 面对称，由"奇倍"得下半球取正 + 上半球取正，实质是分上下半球分别算。

**解**：分为下半球面 $\Sigma_1: z=-\sqrt{1-x^2-y^2}$ 和上半球面 $\Sigma_2: z=\sqrt{1-x^2-y^2}$。外侧下半球投影方向取下侧（$-dxdy$），外侧上半球取上侧（$+dxdy$）。

$$
\iint_{\Sigma} = 2\iint_{D_{xy}} xy\sqrt{1-x^2-y^2}\,dxdy = \frac{2}{15}
$$

**评注**："偶零奇倍"用于 $dxdy$ 型积分时，需同时考虑被积函数的奇偶性和曲面侧的翻转——初学者建议直接分上下半球算，不容易错。

:::

### 两类曲面积分之间的联系

有向曲面 $\Sigma: z=z(x,y)$ 的单位法向量 $\overrightarrow{n} = (\cos\alpha, \cos\beta, \cos\gamma)$，其中：

$$
\cos\alpha = \frac{-z_x}{\sqrt{1+z_x^2+z_y^2}},\quad \cos\beta = \frac{-z_y}{\sqrt{1+z_x^2+z_y^2}},\quad \cos\gamma = \frac{1}{\sqrt{1+z_x^2+z_y^2}}
$$

两类曲面积分的转换公式：

$$
\iint\limits_{\Sigma} P\,dydz + Q\,dzdx + R\,dxdy = \iint\limits_{\Sigma} (P\cos\alpha + Q\cos\beta + R\cos\gamma)\,dS
$$

向量形式：$\displaystyle\iint_{\Sigma} \overrightarrow{A} \cdot d\overrightarrow{S} = \iint_{\Sigma} \overrightarrow{A} \cdot \overrightarrow{n}\,dS = \iint_{\Sigma} A_n\,dS$。

其中 $d\overrightarrow{S} = \overrightarrow{n}\,dS = (dydz, dzdx, dxdy)$ 为**有向曲面元**。

> **直观理解**：$dydz = \cos\alpha\,dS$，$dzdx = \cos\beta\,dS$，$dxdy = \cos\gamma\,dS$——有向面积微元在坐标面上的投影。

> **补充——转换投影法公式**：当 $\Sigma: z=z(x,y)$ 时，可将所有坐标面投影统一到 $xOy$ 面：
>
> $$
> \iint_{\Sigma} P\,dydz+Q\,dzdx+R\,dxdy = \pm\iint_{D_{xy}} [P(-z_x)+Q(-z_y)+R]\,dxdy
> $$
>
> 上侧取正，下侧取负。前提：$\Sigma$ 在 $D_{xy}$ 上连续可偏导。

:::example 例 1 · 用转换投影法统一投影
计算 $\iint_{\Sigma} (z^2+x)\,dydz - z\,dxdy$，$\Sigma$ 为 $z=\frac{1}{2}(x^2+y^2)$ 介于 $z=0$ 和 $z=2$ 之间的部分的下侧。

**思路**：直接算 $dydz$ 项需分前后两片，较繁。用转换投影法统一投影到 $xOy$ 面。

**解**：$z_x = x,\ z_y = y$，下侧取负号。$\frac{\cos\alpha}{\cos\gamma} = -z_x = -x$。

$$
\iint_{\Sigma} (z^2+x)\,dydz = \iint_{\Sigma} (z^2+x)(-x)\,dxdy
$$

$$
\text{原式} = \iint_{\Sigma} [(z^2+x)(-x)-z]\,dxdy = \cdots = 8\pi
$$

**评注**：转换投影法的关键在于 $\frac{\cos\alpha}{\cos\gamma} = -z_x$（上侧时），统一投影后所有项都是 $dxdy$，可以合并简化。

:::

## 高斯公式与散度

格林公式建立了平面区域上的二重积分与边界曲线积分的关系。**高斯公式**是它在三维空间的直接推广：**空间闭区域上的三重积分，等于其边界曲面上的曲面积分**。同时，高斯公式引出了向量分析中散度的概念——描述向量场在某点是"发散"还是"汇聚"。

### 高斯公式

#### 公式与条件

设空间闭区域 $\Omega$ 由分片光滑的闭曲面 $\Sigma$ 围成，$P,Q,R$ 在 $\Omega$ 上有一阶连续偏导数，则：

$$
\iiint\limits_{\Omega} \left(\frac{\partial P}{\partial x} + \frac{\partial Q}{\partial y} + \frac{\partial R}{\partial z}\right)dV = \oiint\limits_{\Sigma} P\,dydz + Q\,dzdx + R\,dxdy
$$

或等价地：$\displaystyle\iiint_{\Omega} \left(\frac{\partial P}{\partial x}+\frac{\partial Q}{\partial y}+\frac{\partial R}{\partial z}\right)dV = \oiint_{\Sigma} (P\cos\alpha+Q\cos\beta+R\cos\gamma)\,dS$。

其中 $\Sigma$ 是 $\Omega$ 的整个边界曲面的**外侧**。

:::tip 高斯公式的证明思路
先证 $\iiint_{\Omega} \frac{\partial R}{\partial z}\,dV = \oiint_{\Sigma} R\,dxdy$：将 $\Omega$ 向 $xOy$ 面投影，上下边界分别记为 $z_2(x,y)$ 和 $z_1(x,y)$，三重积分化为先 $z$ 后 $xy$ 的积分：$\iint_{D_{xy}} [R(x,y,z_2)-R(x,y,z_1)]\,dxdy$。上侧 $R(x,y,z_2)\,dxdy$ 取正，下侧 $R(x,y,z_1)\,dxdy$ 取负，恰为 $\oiint_{\Sigma} R\,dxdy$。$P$ 和 $Q$ 同理，三式相加即得。

![高斯公式的证明：把三重积分先对 z 积分，再与上下侧曲面积分对上](/notes-assets/hm10-08-gauss-theorem-proof.jpg)

:::

:::example 例 1 · 柱体边界上的高斯公式
计算 $\oiint_{\Sigma} (x-y)\,dxdy + (y-z)x\,dydz$，$\Sigma$ 为柱面 $x^2+y^2=1$ 及平面 $z=0,z=3$ 所围闭区域 $\Omega$ 的整个边界曲面外侧。

**思路**：闭曲面直接套高斯公式，三重积分用对称性简化。

**解**：$P=(y-z)x,\ Q=0,\ R=x-y$。

$\frac{\partial P}{\partial x}+\frac{\partial Q}{\partial y}+\frac{\partial R}{\partial z} = (y-z)+0+0 = y-z$。

$$
\iint_{\Sigma} = \iiint_{\Omega} (y-z)\,dV
$$

$\Omega$ 关于 $zOx$ 面对称，$y$ 为奇函数 $\Rightarrow \iiint_{\Omega} y\,dV = 0$。

$$
\text{原式} = -\iiint_{\Omega} z\,dV = -\bar{z}\cdot V_{\Omega} = -\frac{3}{2}\cdot(\pi\cdot 1^2\cdot 3) = -\frac{9}{2}\pi
$$

**评注**：形心公式 $\bar{z} = \frac{3}{2}$（圆柱体形心在中心轴上中点高度）配合对称性，三重积分秒算。

:::

:::example 例 2 · 高斯公式配形心公式
计算 $\oiint_{\Sigma} x^2\,dydz + y^2\,dzdx + z^2\,dxdy$，$\Sigma$ 为长方体 $[0,a]\times[0,b]\times[0,c]$ 的整个表面外侧（与 10.5.1 节的例 2 是同一题）。

**思路**：对比直接分片计算与高斯公式的差异。

**解（高斯公式）**：$\frac{\partial P}{\partial x}+\frac{\partial Q}{\partial y}+\frac{\partial R}{\partial z} = 2x+2y+2z$。

$$
\iint_{\Sigma} = \iiint_{\Omega} 2(x+y+z)\,dV = 2(\bar{x}+\bar{y}+\bar{z})\cdot V = 2\left(\frac{a}{2}+\frac{b}{2}+\frac{c}{2}\right)abc = abc(a+b+c)
$$

**评注**：高斯公式 + 形心公式一行搞定——而直接分片算需要分别处理六个面。这就是公式的威力。

:::

#### 补面法

曲面不封闭时，补一个辅助面使其构成闭曲面，用高斯公式后再减去辅助面上的积分。

:::example 例 3 · 补面法处理锥面下侧
计算 $\iint_{\Sigma} (x^2\cos\alpha+y^2\cos\beta+z^2\cos\gamma)\,dS$，$\Sigma$ 为锥面 $x^2+y^2=z^2$ 介于 $z=0$ 和 $z=h$ 之间部分的下侧。

**思路**：锥面下侧不封闭，补顶部圆盘 $\Sigma_1: z=h,\ x^2+y^2\le h^2$（上侧）。$\Sigma+\Sigma_1$ 构成闭曲面（锥体），用高斯公式。

**解**：由高斯公式，$\oiint_{\Sigma+\Sigma_1} = \iiint_{\Omega} 2(x+y+z)\,dV$。对称性消去 $x,y$ 项，保留 $2\iiint_{\Omega} z\,dV$。柱面坐标计算得 $\frac{1}{2}\pi h^4$。

$\iint_{\Sigma_1} = \iint_{\Sigma_1} z^2\,dxdy = \iint_{D_{xy}} h^2\,dxdy = h^2 \cdot \pi h^2 = \pi h^4$。

$$
\iint_{\Sigma} = \frac{1}{2}\pi h^4 - \pi h^4 = -\frac{1}{2}\pi h^4
$$

**评注**：补面技巧与格林公式的补线法完全一致。补的面越简单越好——圆盘上法向量与 $z$ 轴平行，$\cos\alpha=\cos\beta=0$，只保留 $R\,dxdy$ 项。

:::

#### 挖洞法

被积函数在区域内某点无定义时，以该点为中心挖一个小球面，对外围区域用高斯公式。

:::example 例 4 · 挖洞法处理原点奇点
计算 $I=\oiint_{\Sigma} \frac{x\,dydz+y\,dzdx+z\,dxdy}{(x^2+y^2+z^2)^{3/2}}$，$\Sigma$ 为 $2x^2+2y^2+z^2=4$ 的外侧。

**思路**：原点 $(0,0,0)$ 是奇点。挖小球面 $\Sigma_1: x^2+y^2+z^2=\varepsilon^2$（内侧），在 $\Sigma+\Sigma_1$ 围成的区域内 $\frac{\partial P}{\partial x}+\frac{\partial Q}{\partial y}+\frac{\partial R}{\partial z}=0$。

**解**：验证 $\frac{\partial P}{\partial x}+\frac{\partial Q}{\partial y}+\frac{\partial R}{\partial z}=0$（在非原点处），高斯公式给出 $\oiint_{\Sigma+\Sigma_1}=0$。

$$
I = -\iint_{\Sigma_1} \frac{x\,dydz+y\,dzdx+z\,dxdy}{\varepsilon^3} = -\frac{1}{\varepsilon^3}\iint_{\Sigma_1} (x\,dydz+y\,dzdx+z\,dxdy)
$$

对 $\Sigma_1$ 内侧用高斯公式：

$$
= -\frac{1}{\varepsilon^3}\left(-3\cdot\frac{4}{3}\pi\varepsilon^3\right) = 4\pi
$$

**评注**：分子恰好是 $(x,y,z)$，分母是 $r^3$，在小球面上分母变为常数 $\varepsilon^3$，分子变为线性函数——高斯公式一步得出 $-3V$。挖洞形状选球面是因为分母是 $r^3$（球对称），在小球面上变为常数。

:::

### 通量与散度

#### 通量

向量场 $\overrightarrow{A}(x,y,z)$ 通过曲面 $\Sigma$ 向着指定侧的**通量（流量）**为：

$$
\iint\limits_{\Sigma} \overrightarrow{A} \cdot \overrightarrow{n}\,dS = \iint\limits_{\Sigma} P\,dydz + Q\,dzdx + R\,dxdy
$$

#### 散度

向量场 $\overrightarrow{A}$ 的**散度**定义为：

$$
\operatorname{div}\overrightarrow{A} = \frac{\partial P}{\partial x} + \frac{\partial Q}{\partial y} + \frac{\partial R}{\partial z} = \nabla \cdot \overrightarrow{A}
$$

**物理意义**：散度是单位体积的向外流量（通量密度）。

- $\operatorname{div}\overrightarrow{A} > 0$：该点有"**正源**"（流体向外发散）
- $\operatorname{div}\overrightarrow{A} < 0$：该点有"**负源**"（汇/洞，流体向内汇聚）
- $\operatorname{div}\overrightarrow{A} = 0$：**无源场**

高斯公式的向量形式：$\displaystyle\oiint_{\Sigma} \overrightarrow{A} \cdot d\overrightarrow{S} = \iiint_{\Omega} (\nabla \cdot \overrightarrow{A})\,dV$。即：穿过闭曲面的总通量 = 散度在内部的体积分——也称**高斯散度定理**。

:::example 例 1 · 求向量场的散度
求 $\overrightarrow{A} = yz\overrightarrow{i} + z^2\overrightarrow{k}$ 的散度。

**解**：$\operatorname{div}\overrightarrow{A} = \frac{\partial(yz)}{\partial x} + \frac{\partial(z^2)}{\partial z} = 0 + 2z = 2z$。

:::

## 斯托克斯公式与旋度

格林公式是 $2\to 1$ 维的边界-内部对偶（平面区域 → 边界曲线）。**斯托克斯公式**将它推广为 $2\to 1$（三维空间中曲面 → 边界曲线），描绘了向量场的**环流量**与**旋度**的关系——旋度衡量向量场在某点附近的旋转趋势，环流量是它沿闭合路径的累积效应。

#### 右手规则

有向曲面 $\Sigma$ 的边界 $\Gamma$ 的正向由**右手规则**确定：右手四指沿 $\Gamma$ 绕行方向，拇指指向 $\Sigma$ 的法向量方向。

![有向曲面的边界曲线正向：右手四指沿 Γ 绕行，拇指指向法向量](/notes-assets/hm10-09-right-hand-rule.jpg)

#### 斯托克斯公式

设 $\Gamma$ 为分段光滑的空间有向闭曲线，$\Sigma$ 是以 $\Gamma$ 为边界的分片光滑有向曲面，$\Gamma$ 的正向与 $\Sigma$ 的侧符合右手规则，则：

$$
\iint\limits_{\Sigma} \left(\frac{\partial R}{\partial y}-\frac{\partial Q}{\partial z}\right)dydz + \left(\frac{\partial P}{\partial z}-\frac{\partial R}{\partial x}\right)dzdx + \left(\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}\right)dxdy = \oint_{\Gamma} P\,dx+Q\,dy+R\,dz
$$

**行列式形式**（便于记忆）：

$$
\iint\limits_{\Sigma} \begin{vmatrix} dydz & dzdx & dxdy \\ \frac{\partial}{\partial x} & \frac{\partial}{\partial y} & \frac{\partial}{\partial z} \\ P & Q & R \end{vmatrix} = \oint_{\Gamma} P\,dx+Q\,dy+R\,dz
$$

或用法向量方向余弦：

$$
\iint\limits_{\Sigma} \begin{vmatrix} \cos\alpha & \cos\beta & \cos\gamma \\ \frac{\partial}{\partial x} & \frac{\partial}{\partial y} & \frac{\partial}{\partial z} \\ P & Q & R \end{vmatrix} dS = \oint_{\Gamma} P\,dx+Q\,dy+R\,dz
$$

:::tip 斯托克斯公式的证明思路
将 $\Sigma$ 表示为 $z=f(x,y)$，把曲面积分投影到 $xOy$ 面，对投影区域用格林公式，再将结果拉回曲面。核心逻辑：曲面积分 → 投影为二重积分 → 格林公式化为投影区域的边界曲线积分 → 恰好等于 $\Gamma$ 上的曲线积分。

![斯托克斯公式的证明：投影到 xOy 面后用格林公式，再拉回曲面](/notes-assets/hm10-10-stokes-theorem-proof.jpg)

:::

> **注意**：斯托克斯公式中的曲面积分是**行列式形式**——系数是偏导数的差，不要与高斯公式的散度形式（偏导数和）混淆。

:::example 例 1 · 三角形边界上的斯托克斯公式
计算 $\oint_{\Gamma} z\,dx + x\,dy + y\,dz$，$\Gamma$ 为平面 $x+y+z=1$ 被三个坐标面截成的三角形的边界，从 $z$ 轴正向看逆时针。

**思路**：空间三角形边界，直接用斯托克斯公式化为三角形区域上的曲面积分。

**解**：取 $\Sigma$ 为三角形所在平面（上侧）。行列式展开：

$$
\iint_{\Sigma} \begin{vmatrix} dydz & dzdx & dxdy \\ \frac{\partial}{\partial x} & \frac{\partial}{\partial y} & \frac{\partial}{\partial z} \\ z & x & y \end{vmatrix} = \iint_{\Sigma} (1\,dydz + 1\,dzdx + 1\,dxdy)
$$

各项分别是 $\Sigma$ 在三个坐标面上的投影面积——均为 $\frac{1}{2}$（第一卦限中三角形的投影）。

$$
\oint_{\Gamma} = \frac{1}{2}+\frac{1}{2}+\frac{1}{2} = \frac{3}{2}
$$

**评注**：行列式展开技巧：$\begin{vmatrix} \partial_y & \partial_z \\ x & y \end{vmatrix} = \frac{\partial y}{\partial y} - \frac{\partial x}{\partial z} = 1-0 = 1$ 对应 $dydz$ 的系数。

:::

:::example 例 2 · 平面截立方体所得截痕
计算 $\oint_{\Gamma} (y^2-z^2)\,dx + (z^2-x^2)\,dy + (x^2-y^2)\,dz$，$\Gamma$ 为平面 $x+y+z=\frac{3}{2}$ 截立方体 $[0,1]^3$ 表面的截痕，从 $x$ 轴正向看逆时针。

**思路**：用法向量方向余弦形式，平面法向量各分量相等，简化行列式。

**解**：平面法向量 $\overrightarrow{n}=(\frac{1}{\sqrt{3}},\frac{1}{\sqrt{3}},\frac{1}{\sqrt{3}})$。

$$
\oint_{\Gamma} = \iint_{\Sigma} \begin{vmatrix} 1/\sqrt{3} & 1/\sqrt{3} & 1/\sqrt{3} \\ \frac{\partial}{\partial x} & \frac{\partial}{\partial y} & \frac{\partial}{\partial z} \\ y^2-z^2 & z^2-x^2 & x^2-y^2 \end{vmatrix} dS
$$

展开得 $-\frac{4}{\sqrt{3}}\iint_{\Sigma}(x+y+z)\,dS = -\frac{4}{\sqrt{3}}\cdot\frac{3}{2}\iint_{\Sigma} dS = -2\sqrt{3}\iint_{\Sigma} dS$。

化为 $xOy$ 面投影：$=-2\sqrt{3}\iint_{D_{xy}} \frac{1}{\cos\gamma}\,dxdy = -6\iint_{D_{xy}} dxdy$。投影区域面积 $=\frac{3}{4}$，结果 $=-\frac{9}{2}$。

**评注**：截痕在立方体表面上，实际投影区域需考虑立方体范围。$x+y+z=\frac{3}{2}$ 在 $xOy$ 面上的投影为 $x+y\le\frac{3}{2}$（在第一卦限），但受立方体约束 $x,y\le 1$，实际面积为 $\frac{3}{4}$。

:::

#### 环流量

向量场 $\overrightarrow{A}$ 沿有向闭曲线 $\Gamma$ 的**环流量**：

$$
\oint_{\Gamma} \overrightarrow{A} \cdot \overrightarrow{\varepsilon}\,ds = \oint_{\Gamma} \overrightarrow{A} \cdot d\overrightarrow{r} = \oint_{\Gamma} P\,dx+Q\,dy+R\,dz
$$

其中 $\overrightarrow{\varepsilon}$ 是 $\Gamma$ 的单位切向量。

:::example 例 3 · 求向量场沿圆的环流量
求 $\overrightarrow{A}=(x^2-y)\overrightarrow{i}+4yz\overrightarrow{j}+x^2\overrightarrow{k}$ 沿 $\Gamma$ 的环流量，$\Gamma$ 为锥面 $z=\sqrt{x^2+y^2}$ 与 $z=2$ 的交线，从 $z$ 轴正向看逆时针。

**思路**：$\Gamma$ 是平面 $z=2$ 上的圆 $x^2+y^2=4$，可直接参数化计算。

**解**：$x=2\cos\theta,\ y=2\sin\theta,\ z=2,\ 0\le\theta\le 2\pi$。

$$
\oint_{\Gamma} = \int_{0}^{2\pi} [(4\cos^2\theta-2\sin\theta)(-2\sin\theta) + 8\cdot(2\cos\theta) + 4\cos^2\theta\cdot 0]\,d\theta = 4\pi
$$

**评注**：环流量 = $\oint \overrightarrow{A}\cdot d\overrightarrow{r}$。当 $\Gamma$ 在一个水平平面上时，$dz=0$ 简化计算。

:::

#### 旋度

向量场 $\overrightarrow{A}$ 的**旋度**：

$$
\operatorname{rot}\overrightarrow{A} = \left(\frac{\partial R}{\partial y}-\frac{\partial Q}{\partial z}\right)\overrightarrow{i} + \left(\frac{\partial P}{\partial z}-\frac{\partial R}{\partial x}\right)\overrightarrow{j} + \left(\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}\right)\overrightarrow{k}
$$

**行列式记忆**：$\operatorname{rot}\overrightarrow{A} = \nabla \times \overrightarrow{A} = \begin{vmatrix} \overrightarrow{i} & \overrightarrow{j} & \overrightarrow{k} \\ \frac{\partial}{\partial x} & \frac{\partial}{\partial y} & \frac{\partial}{\partial z} \\ P & Q & R \end{vmatrix}$

**物理意义**：旋度描述向量场在某点的局部旋转方向和强度——方向由右手定则确定（拇指指向旋度方向，四指弯曲方向为旋转方向），大小等于该点的**环流量面密度**。

斯托克斯公式的向量形式：$\displaystyle\oint_{\Gamma} \overrightarrow{A} \cdot d\overrightarrow{r} = \iint_{\Sigma} \operatorname{rot}\overrightarrow{A} \cdot d\overrightarrow{S}$。即：环流量 = 旋度穿过曲面的通量。

若 $\operatorname{rot}\overrightarrow{A} \equiv 0$，$\overrightarrow{A}$ 为**无旋场**（保守场）；无源且无旋的场称为**调和场**。

:::example 例 4 · 求向量场的旋度
求 $\overrightarrow{A} = (x^2-y)\overrightarrow{i} + 4zy\overrightarrow{j} + x^2\overrightarrow{k}$ 的旋度。

**解**：$\operatorname{rot}\overrightarrow{A} = \begin{vmatrix} \overrightarrow{i} & \overrightarrow{j} & \overrightarrow{k} \\ \frac{\partial}{\partial x} & \frac{\partial}{\partial y} & \frac{\partial}{\partial z} \\ x^2-y & 4zy & x^2 \end{vmatrix} = -4y\overrightarrow{i} - 2x\overrightarrow{j} + \overrightarrow{k}$。

:::

#### 总结：梯度、散度与旋度

| 名称 | 定义 | 作用对象 | 结果类型 | 物理含义 |
| :--- | :--- | :--- | :--- | :--- |
| **梯度** | $\operatorname{grad} f = \nabla f$ | 标量场 | 向量 | 变化最快的方向和速率 |
| **散度** | $\operatorname{div}\overrightarrow{A} = \nabla\cdot\overrightarrow{A}$ | 向量场 | 标量 | 发散/汇聚的源头强度 |
| **旋度** | $\operatorname{rot}\overrightarrow{A} = \nabla\times\overrightarrow{A}$ | 向量场 | 向量 | 旋转趋势的轴心和强度 |

#### 广义斯托克斯定理——四大公式的统一

从牛顿-莱布尼茨公式到斯托克斯公式，揭示了一个统一的数学结构——**内部变化率的总和 = 边界上的流量**：

| 公式 | 维度关系 | 核心形式 |
| :--- | :--- | :--- |
| 牛顿-莱布尼茨 | $1 \to 0$ | $\int_{a}^{b} f'(x)\,dx = f(b)-f(a)$ |
| 格林公式 | $2 \to 1$ | $\iint_{D} (\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y})\,dxdy = \oint_{L} P\,dx+Q\,dy$ |
| 高斯公式 | $3 \to 2$ | $\iiint_{\Omega} (\nabla\cdot\overrightarrow{A})\,dV = \oiint_{\Sigma} \overrightarrow{A}\cdot d\overrightarrow{S}$ |
| 斯托克斯公式 | $2 \to 1$（三维） | $\iint_{\Sigma} (\nabla\times\overrightarrow{A})\cdot d\overrightarrow{S} = \oint_{\Gamma} \overrightarrow{A}\cdot d\overrightarrow{r}$ |

这四大公式都可以统一表达为广义斯托克斯定理：

$$
\int_{\Omega} d\omega = \int_{\partial\Omega} \omega
$$

其中 $\Omega$ 是积分区域，$\partial\Omega$ 是其边界，$\omega$ 是微分形式，$d\omega$ 是其外微分。**这就是微积分学最深刻的统一原理。**

## 小结

1. 两类积分的分界线是**方向**：第一类乘的是弧长 $ds$、面积 $dS$（恒为正），与走向无关；第二类乘的是有向投影 $dx=\cos\alpha\,ds$、$dxdy=\cos\gamma\,dS$，反向走一遍积分就变号。
2. 第一类积分统一靠参数化把微元换掉（$ds=\sqrt{\varphi'^2+\psi'^2}\,dt$、$dS=\sqrt{1+z_x^2+z_y^2}\,dxdy$），下限必须小于上限；第二类的下限对应起点、上限对应终点，$\alpha>\beta$ 完全合法——这正是方向性的代数体现。
3. 第二类曲面积分化为二重积分时**不带**放大系数——$dxdy$ 本身就是投影面积；"投影 → 替换 → 定符号"三步即可，转换投影法把所有项统一成 $\pm\iint_{D_{xy}}[P(-z_x)+Q(-z_y)+R]\,dxdy$ 后再合并。
4. **对称性**不能套错口诀：第一类（曲线、曲面）一律"**偶倍奇零**"；第二类对 $x$ 积分偶倍奇零、对 $y$ 积分偶零奇倍，$dxdy$ 型则是"关于 $z$ 偶零奇倍"——差别全在微元本身随翻转改号。
5. **轮换对称性**把 $f(x)$、$f(y)$、$f(z)$ 的积分打通（$\int_{\Gamma} f(x)\,ds=\frac{1}{3}\int_{\Gamma}[f(x)+f(y)+f(z)]\,ds$），再用曲线、曲面方程把被积函数化为常数，是本章最省力的组合技巧。
6. **形心公式** $\int_{L} x\,ds=\bar{x}\int_{L} ds$（对曲面、三重积分同理）把积分退化为"长度 × 形心坐标"；形心落在对称中心时积分直接为 $0$。
7. **格林公式**要成立，必须 $L$ 取**正向**（区域始终在观察者左侧：外边界逆时针、内边界顺时针）、$P,Q$ 在闭区域上有一阶连续偏导——缺一条就得补线、挖洞或换区域，不能硬套。
8. **补线**（曲线不闭）、**挖洞**（被积函数有奇点）、**消元降维**（空间闭曲线）是条件不满足时的三种补救：补的线越简单越好，挖的洞要与分母同形，使被积函数在辅助线上成为常数从而提出积分号外。
9. 曲线积分**与路径无关**的五个命题彼此等价（闭路积分为零、只依赖起终点、$\frac{\partial P}{\partial y}=\frac{\partial Q}{\partial x}$、$P\,dx+Q\,dy$ 是**全微分**、$\overrightarrow{F}$ 是某函数的**梯度**），但前提是区域**单连通**——有洞时偏导相等也未必与路径无关。
10. **高斯公式**是格林公式的三维版本，要求 $\Sigma$ 取**外侧**；不封闭就补面、有奇点就挖球面，套路与格林公式逐条对应，配上形心公式常能把三重积分一行算完。
11. **斯托克斯公式**把"边界—内部"对偶抬到三维曲面，$\Gamma$ 的正向与 $\Sigma$ 的侧必须符合**右手规则**；**散度**是通量密度（标量）、**旋度**是环流量面密度（向量），四大公式最终统一为 $\int_{\Omega} d\omega=\int_{\partial\Omega} \omega$。
