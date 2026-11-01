---
title: 高等数学-9 重积分
description: 把二重积分化为二次积分的全流程——直角坐标、极坐标、换元与对称性技巧，再推广到三重积分的投影法、截面法与柱面、球面坐标系。
category: 数学
subject: 数学
subfield: 高等数学
topic: 重积分
difficulty: 基础
date: "2026-10-17"
tags: [高等数学, 二重积分, 三重积分, 极坐标, 柱面坐标, 球面坐标, 雅可比行列式, 轮换对称性]
draft: true
featured: false
---

## 二重积分的概念与性质

高等数学-5 定积分解决了一元函数在区间上的累积量问题。当被积函数从一元推广到二元、积分区域从线段变成平面区域时，就得到了二重积分。二重积分的定义与定积分一脉相承——"分割→近似→求和→取极限"，只不过分割的对象从小区间变成了小面积块。如果说定积分的几何意义是曲边梯形的面积，那么二重积分的几何意义就是曲顶柱体的体积。

#### 二重积分的定义

设 $f(x,y)$ 是有界闭区域 $D$ 上的有界函数。将 $D$ 任意分成 $n$ 个小闭区域 $\Delta\sigma_1,\Delta\sigma_2,\dots,\Delta\sigma_n$（$\Delta\sigma_i$ 同时表示第 $i$ 个小区域及其面积）。在每个 $\Delta\sigma_i$ 上任取一点 $(\xi_i,\eta_i)$，作积分和 $\sum_{i=1}^{n} f(\xi_i,\eta_i)\Delta\sigma_i$。记 $\lambda$ 为各小闭区域直径的最大值。如果当 $\lambda \to 0$ 时，积分和的极限总存在，且与区域的分法及点 $(\xi_i,\eta_i)$ 的取法无关，则称此极限为 $f(x,y)$ 在 $D$ 上的**二重积分**：

$$
\iint\limits_{D} f(x,y)\,d\sigma = \lim_{\lambda \to 0} \sum_{i=1}^{n} f(\xi_i,\eta_i)\Delta\sigma_i
$$

其中 $f(x,y)$ 为被积函数，$d\sigma$ 为**面积元素**，$D$ 为积分区域。在直角坐标系中，面积元素常写为 $d\sigma = dx\,dy$，故二重积分也记为 $\iint_{D} f(x,y)\,dx\,dy$。

#### 二重积分的几何意义

当 $f(x,y) \ge 0$ 时，$\iint_{D} f(x,y)\,d\sigma$ 表示以 $D$ 为底面、以曲面 $z = f(x,y)$ 为顶面的**曲顶柱体的体积**。如果 $f(x,y)$ 在 $D$ 上有正有负，则积分等于 $xOy$ 面上方柱体体积减去下方柱体体积。

![二重积分 ∬_D f(x,y) dσ 表示曲顶柱体的体积](/notes-assets/hm9-01-meaning-of-double-integral.jpg)

#### 二重积分的性质

二重积分继承了定积分的全部基本性质，只需将区间换成平面区域：

- **线性性**：$\iint_{D} [\alpha f + \beta g]\,d\sigma = \alpha\iint_{D} f\,d\sigma + \beta\iint_{D} g\,d\sigma$

- **区域可加性**：若 $D = D_1 \cup D_2$ 且 $D_1,D_2$ 除边界外不重叠，则 $\iint_{D} = \iint_{D_1} + \iint_{D_2}$

- **常数积分**：$\iint_{D} 1 \cdot d\sigma = \sigma$（$\sigma$ 为 $D$ 的面积）

- **保号性**：若在 $D$ 上 $f(x,y) \le g(x,y)$，则 $\iint_{D} f\,d\sigma \le \iint_{D} g\,d\sigma$。推论：$\lvert\iint_{D} f\,d\sigma\rvert \le \iint_{D} \lvert f\rvert\,d\sigma$

- **估值不等式**：设 $M,m$ 为 $f$ 在 $D$ 上的最大值和最小值，$\sigma$ 为 $D$ 的面积，则

$$
m\sigma \le \iint_{D} f(x,y)\,d\sigma \le M\sigma
$$

- **二重积分中值定理**：若 $f(x,y)$ 在 $D$ 上连续，则存在 $(\xi,\eta) \in D$ 使得

$$
\iint_{D} f(x,y)\,d\sigma = f(\xi,\eta)\,\sigma
$$

其中 $f(\xi,\eta) = \frac{1}{\sigma}\iint_{D} f\,d\sigma$ 称为 $f$ 在 $D$ 上的**积分平均值**——这与定积分的中值定理完全相同，只是将区间长度换成了区域面积。

## 二重积分的计算法

二重积分的定义依赖于极限，直接计算几乎不可能。与定积分一样，实际计算二重积分的关键是**化为二次积分**——先对一个变量积分、再对另一个变量积分。从此，二重积分的全部技巧归结为两件事：①正确描述积分区域（$X$ 型还是 $Y$ 型？）；②选择最优的积分次序和坐标系（直角坐标？极坐标？换元？）。9.2 按这三个层次展开。

### 直角坐标计算二重积分

#### 积分区域的两种描述——X 型与 Y 型

将二重积分化为二次积分，首先要能用集合语言描述积分区域。平面区域可分为两类：

| 类型 | 集合表示 | 几何特征 |
| :--- | :--- | :--- |
| **X 型** | $\{(x,y) \mid a \le x \le b,\ \varphi_1(x) \le y \le \varphi_2(x)\}$ | 上下边界为 $x$ 的函数，左右边界为竖直线 |
| **Y 型** | $\{(x,y) \mid \psi_1(y) \le x \le \psi_2(y),\ c \le y \le d\}$ | 左右边界为 $y$ 的函数，上下边界为水平线 |

![X 型区域与 Y 型区域的点集表示](/notes-assets/hm9-02-x-type-and-y-type-regions.jpg)

> 同一个区域通常可以用两种类型表示。选择哪一种取决于哪种表示法使积分更容易计算。

:::example 例 1 · 用 X 型与 Y 型描述同一个区域
(1) $y=x$ 与 $x$ 轴正半轴、$x=1$ 围成：X 型 $\{(x,y)\mid 0\le x\le 1,\ 0\le y\le x\}$，Y 型 $\{(x,y)\mid y\le x\le 1,\ 0\le y\le 1\}$。

(2) $y=x^2$ 与 $y$ 轴正半轴、$y=1$ 围成：X 型 $\{(x,y)\mid 0\le x\le 1,\ x^2\le y\le 1\}$，Y 型 $\{(x,y)\mid 0\le x\le\sqrt{y},\ 0\le y\le 1\}$。

(3) $y=x,\ y=2x$ 与 $x=1$ 围成：X 型 $\{(x,y)\mid 0\le x\le 1,\ x\le y\le 2x\}$；Y 型需拆分为两段 $\{(\frac{y}{2}\le x\le y,\ 0\le y\le 1)\}\cup\{(\frac{y}{2}\le x\le 1,\ 1\le y\le 2)\}$。

:::

#### 化为二次积分

曲顶柱体体积可以理解为"先沿 $y$ 方向切片、再沿 $x$ 方向累加"：

$$
V = \int_{a}^{b} \left[ \int_{\varphi_1(x)}^{\varphi_2(x)} f(x,y)\,dy \right] dx
$$

![先沿 y 方向切片、再沿 x 方向累加得到曲顶柱体的体积](/notes-assets/hm9-03-curved-top-column-volume.jpg)

这就是**二次积分**——把一个二重积分分解为两次定积分。一般地：

| 区域类型 | 二次积分公式 | 积分次序 |
| :--- | :--- | :--- |
| X 型 | $\displaystyle\iint_{D} f(x,y)\,d\sigma = \int_{a}^{b} dx \int_{\varphi_1(x)}^{\varphi_2(x)} f(x,y)\,dy$ | 先 $y$ 后 $x$ |
| Y 型 | $\displaystyle\iint_{D} f(x,y)\,d\sigma = \int_{c}^{d} dy \int_{\psi_1(y)}^{\psi_2(y)} f(x,y)\,dx$ | 先 $x$ 后 $y$ |

:::tip 二次积分的定限口诀
"后积先定限，限内画直线，先交写下限，后交写上限。"——外层积分的上下限是常数，内层积分的上下限是外层变量的函数。沿内层积分方向画一条直线穿过区域，先碰到的边界为下限，后碰到的为上限。

:::

:::example 例 2 · X 型区域上的基本计算
计算 $\iint_{D} xy\,dx\,dy$，$D=\{(x,y)\mid 0\le x\le 1,\ 0\le y\le x\}$。

**解**：

$$
\iint_{D} xy\,dx\,dy = \int_{0}^{1} dx \int_{0}^{x} xy\,dy = \int_{0}^{1} \frac{1}{2}x y^{2}\big|_{0}^{x} dx = \int_{0}^{1} \frac{1}{2}x^{3} dx = \frac{1}{8}
$$

:::

:::example 例 3 · X 型与 Y 型的计算量对比
计算 $\iint_{D} (x+y)\,dx\,dy$，$D$ 由 $y=2x,\ y=x,\ x=1$ 围成。

**思路**：X 型不用拆分区域，Y 型需拆为两段——优先选 X 型。

**法一（X 型·优选）**：$D=\{(x,y)\mid 0\le x\le 1,\ x\le y\le 2x\}$，一个积分即可：

$$
\iint_{D}(x+y)\,dx\,dy = \int_{0}^{1} dx \int_{x}^{2x} (x+y)\,dy = \int_{0}^{1} \frac{3}{2}x^{2} dx = \frac{1}{2}
$$

**法二（Y 型·对比）**：$D$ 需拆为两段——下半段 $(\frac{y}{2}\le x\le y,\ 0\le y\le 1)$，上半段 $(\frac{y}{2}\le x\le 1,\ 1\le y\le 2)$：

$$
\iint_{D}(x+y)\,dx\,dy = \int_{0}^{1} dy \int_{\frac{y}{2}}^{y} (x+y)\,dx + \int_{1}^{2} dy \int_{\frac{y}{2}}^{1} (x+y)\,dx = \frac{1}{2}
$$

**评注**：同一个区域、同样的被积函数、同样的结果——但 X 型一行搞定，Y 型需要拆成两项积分。选择区域类型的第一原则：**哪个不用拆分就选哪个**。如果两种都要拆分，优先选拆分后每段积分更容易计算的那个。

:::

#### 交换积分次序

当一种次序下内层积分"积不出来"时（如 $\int e^{-y^{2}}dy$），交换积分次序往往能化腐朽为神奇。

**交换次序的方法**：根据原二次积分的上下限，画出积分区域 $D$ → 换一种类型重新描述 $D$ → 写出新的二次积分。

:::example 例 4 · 交换次序解掉积不出的内层积分
计算 $\iint_{D} e^{-y^{2}}\,dx\,dy$，$D$ 由 $y=x,\ y=2,\ x=0$ 围成。

**思路**：X 型下 $\int_{x}^{2} e^{-y^{2}} dy$ 不可积（$e^{-y^{2}}$ 无初等原函数）。换 Y 型后内层对 $x$ 积分，$e^{-y^{2}}$ 作为常数提出，问题迎刃而解。

**解**：Y 型 $D=\{(x,y)\mid 0\le x\le y,\ 0\le y\le 2\}$。

$$
\iint_{D} e^{-y^{2}}\,dx\,dy = \int_{0}^{2} dy \int_{0}^{y} e^{-y^{2}}\,dx = \int_{0}^{2} y e^{-y^{2}}\,dy = \frac{1}{2}(1-e^{-4})
$$

**评注**：这道题是交换积分次序的经典范例——一种次序积不出来时，画区域、换次序、重新列积分。$e^{-y^{2}}$ 在 $y$ 方向不可积但在 $x$ 方向上仅仅是常数！

:::

:::example 例 5 · 内层积分上限含变量的二次积分
计算二次积分 $\int_{0}^{1} x^{2}\,dx \int_{x}^{1} e^{-y^{2}}\,dy$。

**解**：$D=\{(x,y)\mid 0\le x\le 1,\ x\le y\le 1\}$。换 Y 型：$D=\{(x,y)\mid 0\le x\le y,\ 0\le y\le 1\}$。

$$
\int_{0}^{1} x^{2}\,dx \int_{x}^{1} e^{-y^{2}}\,dy = \int_{0}^{1} dy \int_{0}^{y} x^{2} e^{-y^{2}}\,dx = \int_{0}^{1} e^{-y^{2}} \cdot \frac{y^{3}}{3}\,dy = \frac{1}{6} - \frac{1}{3e}
$$

:::

#### 被积函数可分离变量的情形

若 $f(x,y)=f_1(x)\cdot f_2(y)$ 且积分区域为矩形 $D=\{(x,y)\mid a\le x\le b,\ c\le y\le d\}$，则二重积分可以拆成两个定积分的乘积：

$$
\iint_{D} f_1(x)f_2(y)\,dx\,dy = \left(\int_{a}^{b} f_1(x)\,dx\right) \cdot \left(\int_{c}^{d} f_2(y)\,dy\right)
$$

:::note 为什么能拆成两个定积分的乘积
在矩形区域上，上下限都是常数。内层对 $y$ 积分时 $f_1(x)$ 作为常数提出，积分结果 $\int_{c}^{d} f_2(y)dy$ 是一个常数 $C$，再被外层的 $\int_{a}^{b} f_1(x)dx$ 乘以。

:::

#### 分段函数的二重积分

当被积函数含有分段定义时，以分界线划分积分区域，分别积分。

:::example 例 6 · 分段函数按双曲线拆开区域
计算 $\iint_{D} \max\{xy,1\}\,dxdy$，$D=\{(x,y)\mid 0\le x\le 2,\ 0\le y\le 2\}$。

**思路**：$\max\{xy,1\}$ 以双曲线 $xy=1$ 为界。$xy\ge 1$ 区域用 $f=xy$，$xy<1$ 区域用 $f=1$。

**解**：拆为 $D_1=\{xy\ge 1\}$ 和 $D_2=\{xy<1\}$。经过计算得 $I = \iint_{D_1} xy\,dxdy + \iint_{D_2} 1\,dxdy = \frac{19}{4} + \ln 2$。

**评注**：分段函数二重积分的通用策略——找出分界线 → 拆分区域 → 各区域分别用对应的被积表达式积分再相加。

:::

#### 二重积分的对称性

利用对称性可以大幅简化计算——与定积分的"偶倍奇零"完全平行。

| 对称类型 | 条件 | 结果 |
| :--- | :--- | :--- |
| $D$ 关于 $x$ 轴对称 | $f(x,-y)=-f(x,y)$（关于 $y$ 奇） | $I=0$ |
| | $f(x,-y)=f(x,y)$（关于 $y$ 偶） | $I=2\iint_{D_{\text{上}}}$ |
| $D$ 关于 $y$ 轴对称 | $f(-x,y)=-f(x,y)$（关于 $x$ 奇） | $I=0$ |
| | $f(-x,y)=f(x,y)$（关于 $x$ 偶） | $I=2\iint_{D_{\text{右}}}$ |

![D 关于坐标轴对称时，被积函数的奇偶性直接决定积分值](/notes-assets/hm9-04-double-integral-parity-symmetry.jpg)

:::example 例 7 · 用对称性把复杂积分一步化零
$D$ 由 $y=4-x^{2},\ y=-3x,\ x=1$ 围成，求 $I=\iint_{D} y\ln(x+\sqrt{1+x^{2}})\,dxdy$。

**思路**：被积函数看起来非常复杂，先别急着硬算——看对称性。

![用直线 y=3x 把原区域 D 划成 D1 与 D2 两部分](/notes-assets/hm9-05-double-integral-example-10.jpg)

联立方程组

$$
\begin{cases}
y = 4-x^{2} \\
y = -3x
\end{cases}
$$

得交点 $x=-1$ 和 $x=4$。作直线 $y=3x$ 将原区域 $D$ 划分为两块：

- **$D_1$**（$y=3x$ 左侧）：由 $y=4-x^{2}$、$y=-3x$、$y=3x$ 围成。这部分关于 **y 轴**对称。
- **$D_2$**（$y=3x$ 右侧）：由 $y=4-x^{2}$、$y=3x$、$x=1$ 围成。这部分关于 **x 轴**对称。

**解**：

$$
I = \iint_{D_1} y\ln(x+\sqrt{1+x^{2}})\,dxdy + \iint_{D_2} y\ln(x+\sqrt{1+x^{2}})\,dxdy
$$

在 $D_1$ 上，区域关于 $y$ 轴对称。$\ln(x+\sqrt{1+x^{2}})$ 是**奇函数**（$\ln(-x+\sqrt{1+x^{2}})=\ln\frac{1}{x+\sqrt{1+x^{2}}}=-\ln(x+\sqrt{1+x^{2}})$）。被积函数关于 $x$ 为奇 ⇒ $\iint_{D_1}=0$。

在 $D_2$ 上，区域关于 $x$ 轴对称。$y$ 关于 $y$ 为**奇函数**（$f(x,-y)=-f(x,y)$），$\ln(x+\sqrt{1+x^{2}})$ 与 $y$ 无关。被积函数关于 $y$ 为奇 ⇒ $\iint_{D_2}=0$。

综上 $I = 0 + 0 = 0$。

**评注**：这道题的巧妙之处在于用 $y=3x$（恰好是 $y=-3x$ 关于 $x$ 轴的对称线）将区域一分为二——左半关于 $y$ 轴对称（$\ln$ 奇函数得零），右半关于 $x$ 轴对称（$y$ 奇函数得零）。遇到复杂被积函数先看对称性，往往能一步得零，省去所有繁琐计算。

:::

#### 轮换对称性

若积分区域 $D$ 关于直线 $y=x$ 对称（即 $x$ 与 $y$ 互换后 $D$ 不变），则称 $D$ 关于 $x,y$ 具有**轮换对称性**。此时：

$$
\iint_{D} f(x,y)\,d\sigma = \iint_{D} f(y,x)\,d\sigma = \frac{1}{2}\iint_{D} [f(x,y)+f(y,x)]\,d\sigma
$$

更特殊的情况：若 $f(x,y)=-f(y,x)$，则积分为零；若 $f(x,y)=f(y,x)$，则积分等于半个区域上积分的两倍。

**特别地——被积函数仅含一个变量时（最常用形式）**：若被积函数只依赖于 $x$（或只依赖于 $y$），利用轮换对称性可以直接"平均化"：

$$
\iint_{D} f(x)\,dxdy = \iint_{D} f(y)\,dxdy = \frac{1}{2}\iint_{D} [f(x)+f(y)]\,dxdy
$$

> 这个公式的威力在于：当 $f(x)$ 不好直接积分时，可以换为 $f(y)$，或取两者的平均值——往往平均值比单独一个更容易积分。三重积分的轮换对称性同理（$\iiint_{\Omega} f(z)\,dV = \frac{1}{3}\iiint_{\Omega} [f(x)+f(y)+f(z)]\,dV$），将在 9.3.4 节遇到。

:::example 例 8 · 轮换对称性让分子分母约分
$D=\{(x,y)\mid x^{2}+y^{2}\le 4,\ x\ge 0,\ y\ge 0\}$，$f(x)$ 为正连续函数，$a,b$ 为常数。求 $\iint_{D} \frac{a\sqrt{f(x)}+b\sqrt{f(y)}}{\sqrt{f(x)}+\sqrt{f(y)}}\,d\sigma$。

**解**：$D$ 关于 $y=x$ 对称。轮换对称性 ⇒ $I = \frac{1}{2}\iint_{D} \left[\frac{a\sqrt{f(x)}+b\sqrt{f(y)}}{\sqrt{f(x)}+\sqrt{f(y)}} + \frac{a\sqrt{f(y)}+b\sqrt{f(x)}}{\sqrt{f(y)}+\sqrt{f(x)}}\right] d\sigma$。通分后分子 $=(a+b)(\sqrt{f(x)}+\sqrt{f(y)})$，恰好与分母约去 ⇒ $I = \frac{1}{2}(a+b)\iint_{D} d\sigma = \frac{a+b}{2}\pi$。

**评注**：轮换对称性最神奇的应用——用一个看似复杂的被积函数，通过 $f(x,y)+f(y,x)$ 两相加后分子分母恰好约分，变成一个常数积分。

:::

:::example 例 9 · 验证轮换反对称后直接得零
计算 $\iint_{D} \sqrt[3]{x^{2}-y^{2}}\,d\sigma$，$D=\{(x,y)\mid 0\le x\le 1,\ 0\le y\le 1\}$。

**思路**：$D$ 是正方形 $[0,1]\times[0,1]$，关于 $y=x$ 对称。验证被积函数是否满足 $f(y,x)=-f(x,y)$。

**解**：$f(x,y)=\sqrt[3]{x^{2}-y^{2}}$，则 $f(y,x)=\sqrt[3]{y^{2}-x^{2}}=-\sqrt[3]{x^{2}-y^{2}}=-f(x,y)$。由轮换对称性，$I=0$。

**评注**：这题如果硬算——先对 $y$ 积分再对 $x$ 积分——极其繁琐（被积函数含立方根）。但 $f(y,x)=-f(x,y)$ 意味着在关于 $y=x$ 对称的区域上，每一对 $(x,y)$ 和 $(y,x)$ 处的函数值互为相反数，全部抵消。这是轮换对称性最简单也最容易被忽略的应用——先花五秒钟验证 $f(x,y)$ 和 $f(y,x)$ 的关系，可能省下十分钟的计算。

:::

### 极坐标计算二重积分

#### 极坐标的应用场景

直角坐标下，当积分区域是圆形、扇形、环形，或被积函数含 $x^{2}+y^{2}$ 时，极坐标几乎总是更优的选择。极坐标将圆方程化为 $\rho = \text{常数}$，将 $x^{2}+y^{2}$ 化为 $\rho^{2}$——这使积分上下限和表达式同时简化。

#### 极坐标下的面积元素

极坐标下面积元素不是简单的 $d\rho\,d\theta$，而是 $\rho\,d\rho\,d\theta$。原因：面积微元是一个小扇形环——外半径 $(\rho+\Delta\rho)$、内半径 $\rho$、张角 $\Delta\theta$，其面积 $\approx \rho\Delta\rho\Delta\theta$。

![极坐标下的面积微元：外半径 ρ+Δρ、内半径 ρ、张角 Δθ 的小扇形环](/notes-assets/hm9-06-polar-area-element.jpg)

$$
\iint_{D} f(x,y)\,d\sigma = \iint_{D} f(\rho\cos\theta,\ \rho\sin\theta)\ \rho\,d\rho\,d\theta
$$

:::warning 极坐标最容易漏掉的因子
忘记乘 $\rho$ 是极坐标二重积分里最常见的一处错误——面积元素是 $\rho\,d\rho\,d\theta$，不是 $d\rho\,d\theta$。

:::

#### 极坐标下的区域表示

| 区域类型 | 极坐标表示 |
| :--- | :--- |
| 圆心在原点的圆 $x^{2}+y^{2} \le a^{2}$ | $0\le\rho\le a,\ 0\le\theta\le 2\pi$ |
| 圆 $(x-a)^{2}+y^{2}=a^{2}$（即 $x^{2}+y^{2}=2ax$） | $\rho=2a\cos\theta$ |

:::example 例 1 · 圆域上的极坐标计算
$\iint_{D} (x^{2}+y^{2})\,d\sigma$，$D:x^{2}+y^{2}\le 1$。

**解**：

$$
\iint_{D} (x^{2}+y^{2})\,d\sigma = \int_{0}^{2\pi} d\theta \int_{0}^{1} \rho^{2} \cdot \rho\,d\rho = 2\pi \cdot \frac{1}{4} = \frac{\pi}{2}
$$

**评注**：直角坐标下此题需要算 $\int_{-1}^{1}dx\int_{-\sqrt{1-x^{2}}}^{\sqrt{1-x^{2}}}(x^{2}+y^{2})dy$——极坐标只用了两行。

:::

:::example 例 2 · 偏心圆区域上的极坐标计算
$\iint_{D} (x^{2}+y^{2})\,dx\,dy$，$D$ 为 $(x-1)^{2}+y^{2}=1$ 的上半圆。

**解**：$\rho=2\cos\theta$（$0\le\theta\le\frac{\pi}{2}$）。

$$
\iint_{D} (x^{2}+y^{2})\,dx\,dy = \int_{0}^{\frac{\pi}{2}} d\theta \int_{0}^{2\cos\theta} \rho^{2}\cdot\rho\,d\rho = \int_{0}^{\frac{\pi}{2}} 4\cos^{4}\theta\,d\theta = 4\cdot\frac{3}{4}\cdot\frac{1}{2}\cdot\frac{\pi}{2} = \frac{3\pi}{4}
$$

**评注**：点火公式 $\int_{0}^{\frac{\pi}{2}} \cos^{4}\theta\,d\theta = \frac{3}{4}\cdot\frac{1}{2}\cdot\frac{\pi}{2}$——极坐标与点火公式是绝配。

:::

:::example 例 3 · 用二重积分算一个积不出的反常积分
利用二重积分计算 $\int_{0}^{+\infty} e^{-x^{2}}\,dx$。

**思路**：令 $I = \int_{0}^{+\infty} e^{-x^{2}}\,dx$。则 $I^{2} = \int_{0}^{+\infty} e^{-x^{2}}\,dx \cdot \int_{0}^{+\infty} e^{-y^{2}}\,dy = \iint_{\text{第一象限}} e^{-(x^{2}+y^{2})}\,dxdy$。转化为极坐标后可直接积分。

**解**：极坐标下第一象限 $=\{0\le\rho<+\infty,\ 0\le\theta\le\frac{\pi}{2}\}$。

$$
I^{2} = \int_{0}^{\frac{\pi}{2}} d\theta \int_{0}^{+\infty} e^{-\rho^{2}} \rho\,d\rho = \frac{\pi}{2} \cdot \frac{1}{2} = \frac{\pi}{4}
$$

故 $I = \frac{\sqrt{\pi}}{2}$。

**评注**：这是整个概率论中最重要的积分结论——$\int_{-\infty}^{+\infty} e^{-x^{2}}\,dx = \sqrt{\pi}$。正态分布的归一化常数就来源于此。

:::

:::example 例 4 · 极坐标求立体体积
求球体 $x^{2}+y^{2}+z^{2}\le 4a^{2}$ 被圆柱面 $x^{2}+y^{2}=2ax$ 截得的含在圆柱面内的立体体积。

![球体被圆柱面截出的立体，其在 xOy 面上的投影为 x² + y² ≤ 2ax](/notes-assets/hm9-07-polar-double-integral-example.jpg)

**解**：由对称性 $V = 4\iint_{D} \sqrt{4a^{2}-x^{2}-y^{2}}\,dxdy$，$D$ 为 $x^{2}+y^{2}\le 2ax$ 在第一象限部分。极坐标：$\rho=2a\cos\theta,\ 0\le\theta\le\frac{\pi}{2}$。

$$
V = 4\int_{0}^{\frac{\pi}{2}} d\theta \int_{0}^{2a\cos\theta} \sqrt{4a^{2}-\rho^{2}}\,\rho\,d\rho = \frac{32}{3}a^{3}\left(\frac{\pi}{2}-\frac{2}{3}\right)
$$

**评注**：双重积分求立体体积的标准流程——由几何关系写出 $z=f(x,y)$ → 确定投影区域 $D$ → 选坐标系求二重积分。

:::

#### 坐标系选择速查

| 积分区域特征 | 被积函数特征 | 推荐坐标系 |
| :--- | :--- | :--- |
| 矩形、三角形、一般多边形 | 任意 | 直角坐标 |
| 圆、扇形、环形 | 含 $x^{2}+y^{2}$ | 极坐标 |
| 圆、扇形、环形 | 不含 $x^{2}+y^{2}$ | 极坐标（区域简单）或直角（函数简单） |

### 二重积分的换元法

#### 一般换元公式

极坐标只是换元法的特例（$x=\rho\cos\theta,\ y=\rho\sin\theta$）。更一般地，设变换 $T: x=x(u,v),\ y=y(u,v)$ 将 $uOv$ 平面上的区域 $D'$ 一一映射为 $xOy$ 平面上的 $D$，且雅可比行列式 $J(u,v)=\frac{\partial(x,y)}{\partial(u,v)} \neq 0$，则：

$$
\iint_{D} f(x,y)\,dxdy = \iint_{D'} f[x(u,v),y(u,v)]\ \lvert J(u,v)\rvert\ dudv
$$

极坐标就是它的特例，其雅可比行列式为

$$
J =
\begin{vmatrix}
\cos\theta & -\rho\sin\theta \\
\sin\theta & \rho\cos\theta
\end{vmatrix} = \rho
$$

这就是 $\rho\,d\rho\,d\theta$ 中那个 $\rho$ 的来源。

#### 广义极坐标（椭圆区域）

对于椭圆 $\frac{x^{2}}{a^{2}}+\frac{y^{2}}{b^{2}}=1$ 围成的区域，作变换 $x=ar\cos\theta,\ y=br\sin\theta$，雅可比 $J=abr$。此时椭圆区域化为 $0\le r\le 1,\ 0\le\theta\le 2\pi$ 的矩形区域。

:::example 例 1 · 广义极坐标处理椭圆区域
计算 $\iint_{D} \sqrt{1-\frac{x^{2}}{a^{2}}-\frac{y^{2}}{b^{2}}}\,dxdy$，$D$ 为椭圆 $\frac{x^{2}}{a^{2}}+\frac{y^{2}}{b^{2}}=1$。

![椭圆区域经 x = ar cos θ、y = br sin θ 变为 rθ 平面上的矩形](/notes-assets/hm9-08-substitution-example-2.jpg)

**解**：令 $x=ar\cos\theta,\ y=br\sin\theta$，$J=abr$。

$$
\begin{aligned}
\text{原式} &= \int_{0}^{2\pi} d\theta \int_{0}^{1} \sqrt{1-r^{2}}\,ab\,r\,dr \\
&= 2\pi\cdot ab\cdot\left(-\frac{1}{3}\right)(1-r^{2})^{3/2}\Big|_{0}^{1} = \frac{2}{3}\pi ab
\end{aligned}
$$

**评注**：广义极坐标的核心——通过伸缩变换把椭圆区域"拉"成圆形区域来处理。

:::

:::example 例 2 · 一般换元处理分式指数
计算 $\iint_{D} e^{\frac{y-x}{y+x}}\,dxdy$，$D$ 由 $x=0,y=0,x+y=2$ 围成。

**思路**：被积函数含 $\frac{y-x}{y+x}$，令 $u=y-x,\ v=y+x$ 使指数简化为 $e^{\frac{u}{v}}$。

![换元 u=y-x,\ v=y+x 后，三角形区域 D 变为 uOv 面上的区域 D'](/notes-assets/hm9-09-substitution-example-1.jpg)

**解**：作变换 $u=y-x,\ v=y+x$，反解得

$$
\begin{cases}
u = y-x \\
v = y+x
\end{cases}
\quad \Rightarrow \quad
\begin{cases}
x = \frac{v-u}{2} \\
y = \frac{u+v}{2}
\end{cases},
\qquad J = -\frac{1}{2}
$$

区域 $D'=\{ -v\le u\le v,\ 0\le v\le 2\}$。

$$
\iint_{D} e^{\frac{y-x}{y+x}}\,dxdy = \iint_{D'} e^{\frac{u}{v}}\cdot\frac{1}{2}\,dudv = \int_{0}^{2} dv \int_{-v}^{v} e^{\frac{u}{v}}\frac{1}{2}\,du = e-e^{-1}
$$

**评注**：换元的思路——如果被积函数是 $\frac{y\pm x}{y\mp x}$ 或类似的分式线性组合，令 $u=y-x,\ v=y+x$ 常常能极大简化。

:::

## 三重积分

二重积分将定积分从线段推广到了平面区域。三重积分再进一步——将积分推广到空间区域。如果说二重积分的几何意义是曲顶柱体的体积，三重积分的物理意义更直观：当被积函数表示体密度时，三重积分就是空间物体的总质量。三重积分的计算同样依赖"化为逐次积分"——而坐标系的选择（直角/柱面/球面）成了最关键的技术决策。

### 三重积分的概念

#### 定义

设 $f(x,y,z)$ 是空间有界闭区域 $\Omega$ 上的有界函数。将 $\Omega$ 任意分成 $n$ 个小闭区域 $\Delta V_i$（$\Delta V_i$ 同时表示体积），在每个 $\Delta V_i$ 上任取 $(\xi_i,\eta_i,\zeta_i)$，作积分和。当各小区域直径的最大值 $\lambda\to 0$ 时，若积分和的极限存在且与分法和取点无关，则称此极限为**三重积分**：

$$
\iiint_{\Omega} f(x,y,z)\,dV = \lim_{\lambda\to 0} \sum_{i=1}^{n} f(\xi_i,\eta_i,\zeta_i)\Delta V_i
$$

在直角坐标下 $dV = dx\,dy\,dz$。

#### 定积分、二重积分、三重积分的物理意义

| 积分类型 | 被积函数含义 | 积分含义 | 积分区域 |
| :--- | :--- | :--- | :--- |
| $\int_{a}^{b} f(x)\,dx$ | 线密度 | 线段质量 | 线段 $[a,b]$ |
| $\iint_{D} f(x,y)\,d\sigma$ | 面密度 | 薄片质量 | 平面区域 $D$ |
| $\iiint_{\Omega} f(x,y,z)\,dV$ | 体密度 | 立体质量 | 空间区域 $\Omega$ |

![线密度、面密度、体密度分别对应一重、二重、三重积分](/notes-assets/hm9-10-physical-meaning.jpg)

### 直角坐标计算三重积分

#### 投影法——"先一后二"

将 $\Omega$ 投影到 $xOy$ 平面得 $D_{xy}$。$\Omega$ 以曲面 $z=z_1(x,y)$ 为底面、$z=z_2(x,y)$ 为顶面。先对 $z$ 积分（从底到顶），再对投影区域 $D_{xy}$ 做二重积分：

$$
\iiint_{\Omega} f(x,y,z)\,dV = \iint_{D_{xy}} \left[ \int_{z_1(x,y)}^{z_2(x,y)} f(x,y,z)\,dz \right] d\sigma
$$

![投影法（先一后二）：先沿 z 方向从底面到顶面积分，再在投影区域 Dxy 上做二重积分](/notes-assets/hm9-11-projection-method.jpg)

同理，可将 $\Omega$ 投影至其他坐标面。

> **口诀**：后积先投影，域内画直线，先交写下限，后交写上限。

#### 截面法——"先二后一"

用平行于 $xOy$ 面的平面 $z=$ 常数去截 $\Omega$，得截面 $D_z$（其面积易求）。先对 $(x,y)$ 在 $D_z$ 上做二重积分，再对 $z$ 积分：

$$
\iiint_{\Omega} f(x,y,z)\,dV = \int_{c_1}^{c_2} \left[ \iint_{D_z} f(x,y,z)\,dxdy \right] dz
$$

![截面法（先二后一）：用 z= 常数的平面截 Ω 得到截面 Dz，先在 Dz 上二重积分再对 z 积分](/notes-assets/hm9-12-slicing-method.jpg)

> **适用场景**：被积函数仅含单变量（如 $f(z)$）且截面 $D_z$ 面积易求——此时截面法远快于投影法。

| 方法 | 次序 | 适用场景 |
| :--- | :--- | :--- |
| 投影法 | 先 $z$ 后 $(x,y)$ | 底和顶由 $z=\varphi(x,y)$ 明确给出 |
| 截面法 | 先 $(x,y)$ 后 $z$ | 被积函数仅含 $z$ 或截面面积易求 |

:::example 例 1 · 投影法基本型
$\Omega$ 为 $z=x^{2}+y^{2}$ 与 $z=2$ 围成，求 $\iiint_{\Omega} 5\,dV$。

**解**：$D_{xy}: x^{2}+y^{2}\le 2$。

$$
\iiint_{\Omega} 5\,dV = \iint_{D_{xy}} dxdy \int_{x^{2}+y^{2}}^{2} 5\,dz = \iint_{D_{xy}} 5(2-x^{2}-y^{2})\,dxdy
$$

极坐标下算得 $\iiint_{\Omega} 5\,dV = (20\sqrt{2}-10)\pi$。

:::

:::example 例 2 · 截面法处理只含单变量的被积函数
$\Omega$ 为椭球面 $\frac{x^{2}}{a^{2}}+\frac{y^{2}}{b^{2}}+\frac{z^{2}}{c^{2}}=1$，求 $\iiint_{\Omega} z^{2}\,dxdydz$。

**解**：截面 $D_z$ 为椭圆 $\frac{x^{2}}{a^{2}(1-\frac{z^{2}}{c^{2}})}+\frac{y^{2}}{b^{2}(1-\frac{z^{2}}{c^{2}})}\le 1$，面积 $=\pi ab(1-\frac{z^{2}}{c^{2}})$。

$$
\iiint_{\Omega} z^{2}\,dV = \int_{-c}^{c} z^{2} \cdot \pi ab\left(1-\frac{z^{2}}{c^{2}}\right)dz = \frac{4}{15}\pi abc^{3}
$$

**评注**：被积函数仅含 $z$，截面面积 $\pi ab(1-\frac{z^{2}}{c^{2}})$ 易求——截面法完美匹配。

:::

### 柱面坐标计算三重积分

空间中点 $M$ 的**柱面坐标** $(\rho,\theta,z)$：$\rho,\theta$ 是 $M$ 在 $xOy$ 面上投影的极坐标，$z$ 不变。

$$
\begin{cases}
x = \rho\cos\theta \\
y = \rho\sin\theta \\
z = z
\end{cases}
\quad (\rho\ge 0,\ 0\le\theta\le 2\pi)
$$

体积元素：$dV = \rho\,d\rho\,d\theta\,dz$

![柱面坐标 (ρ, θ, z) 及体积元素 dV = ρ dρ dθ dz](/notes-assets/hm9-13-cylindrical-coordinates.jpg)

> **适用场景**：$\Omega$ 为中心轴平行于 $z$ 轴的旋转体（圆柱、圆锥、旋转抛物面），或被积函数含 $x^{2}+y^{2}$。

:::example 例 1 · 投影法与截面法在柱面坐标下的对比
$\Omega$ 由 $z=x^{2}+y^{2}$ 与 $z=4$ 围成，求 $\iiint_{\Omega} z\,dxdydz$。

**思路**：方法一用投影法+柱面坐标（先 $z$ 后 $(\rho,\theta)$），方法二用截面法+柱面坐标（先 $(\rho,\theta)$ 后 $z$）。两种方法都能解，但截面法在此题中更简洁——因为被积函数仅含 $z$，截面面积又恰好是 $\pi z$。

**法一（投影法+柱面坐标）**：$\Omega$ 在 $xOy$ 面的投影为 $x^{2}+y^{2}\le 4$（$\rho\le 2$），底面 $z=\rho^{2}$，顶面 $z=4$。

$$
\begin{aligned}
I &= \iint_{D_{xy}} dxdy \int_{x^{2}+y^{2}}^{4} z\,dz
= \int_{0}^{2\pi} d\theta \int_{0}^{2} \rho\,d\rho \int_{\rho^{2}}^{4} z\,dz \\
&= 2\pi \int_{0}^{2} \rho\cdot\frac{1}{2}(16-\rho^{4})\,d\rho
= \pi\left(8\rho^{2}-\frac{1}{6}\rho^{6}\right)\Big|_{0}^{2}
= \frac{64}{3}\pi
\end{aligned}
$$

**法二（截面法+柱面坐标）**：用 $z=$ 常数截 $\Omega$，截面 $D_z$ 为圆 $x^{2}+y^{2}\le z$（$0\le z\le 4$），面积 $=\pi z$。被积函数仅含 $z$，直接用截面法：

$$
I = \int_{0}^{4} z\,dz \iint_{D_z} dxdy
= \int_{0}^{4} z \cdot \pi z\,dz
= \pi\cdot\frac{z^{3}}{3}\Big|_{0}^{4}
= \frac{64}{3}\pi
$$

**评注**：同一道题，投影法需二重积分再定积分，截面法只用一次定积分——因为被积函数仅含 $z$ 且截面面积 $\pi z$ 极简单。截面法的选择信号：**被积函数仅含单变量 + 截面面积易求**。

:::

### 球面坐标计算三重积分

#### 球面坐标

空间中点 $M$ 的**球面坐标** $(r,\varphi,\theta)$：

- $r$：到原点的距离（$r\ge 0$）
- $\varphi$：$\overrightarrow{OM}$ 与 $z$ 轴正向的夹角（$0\le\varphi\le\pi$）
- $\theta$：$\overrightarrow{OM}$ 在 $xOy$ 面投影与 $x$ 轴正向的夹角（$0\le\theta\le 2\pi$）

$$
\begin{cases}
x = r\sin\varphi\cos\theta \\
y = r\sin\varphi\sin\theta \\
z = r\cos\varphi
\end{cases}
$$

> $x^{2}+y^{2}+z^{2}=r^{2}$，$x^{2}+y^{2}=r^{2}\sin^{2}\varphi$。

体积元素：$dV = r^{2}\sin\varphi\,dr\,d\varphi\,d\theta$

![球面坐标 (r, φ, θ) 及体积元素 dV = r² sin φ dr dφ dθ](/notes-assets/hm9-14-spherical-coordinates.jpg)

> **适用场景**：$\Omega$ 为球体或部分球体、锥体与球体所围立体；被积函数含 $x^{2}+y^{2}+z^{2}$。

#### 三重积分的普通对称性

与二重积分的奇偶对称性完全平行——将坐标轴对称推广为坐标面对称：

| 对称类型 | 条件 | 结果 |
| :--- | :--- | :--- |
| $\Omega$ 关于 $xOy$ 面对称 | $f(x,y,-z)=-f(x,y,z)$（关于 $z$ 奇） | $I=0$ |
| | $f(x,y,-z)=f(x,y,z)$（关于 $z$ 偶） | $I=2\iiint_{\Omega_{\text{上}}}$ |
| $\Omega$ 关于 $yOz$ 面对称 | $f(-x,y,z)=-f(x,y,z)$（关于 $x$ 奇） | $I=0$ |
| | $f(-x,y,z)=f(x,y,z)$（关于 $x$ 偶） | $I=2\iiint_{\Omega_{\text{右}}}$ |
| $\Omega$ 关于 $zOx$ 面对称 | $f(x,-y,z)=-f(x,y,z)$（关于 $y$ 奇） | $I=0$ |
| | $f(x,-y,z)=f(x,y,z)$（关于 $y$ 偶） | $I=2\iiint_{\Omega_{\text{前}}}$ |

> 拿到三重积分的第一反应——先看 $\Omega$ 有没有对称性、$f$ 有没有对应的奇偶性。如果有，$x,y,z$ 的奇函数项可以直接消掉，大幅减少计算量（见例 2）。

#### 三重积分的轮换对称性

若积分区域 $\Omega$ 关于 $x,y,z$ 有轮换对称性（即 $y$ 替换 $x$，$z$ 替换 $y$，$x$ 替换 $z$ 后，$\Omega$ 不变），则有：

$$
\iiint\limits_{\Omega}f(x,y,z)\,dxdydz
=\iiint\limits_{\Omega}f(y,z,x)\,dydzdx
=\iiint\limits_{\Omega}f(z,x,y)\,dxdydz
$$

特别地，有：

$$
\iiint_{\Omega} f(x)\,dV = \iiint_{\Omega} f(y)\,dV = \iiint_{\Omega} f(z)\,dV = \frac{1}{3}\iiint_{\Omega} [f(x)+f(y)+f(z)]\,dV
$$

:::example 例 1 · 球面坐标配合轮换对称性
$\Omega$ 为 $x^{2}+y^{2}+z^{2}=1$，求 $\iiint_{\Omega} z^{2}\,dxdydz$。

**解**：由轮换对称性，$\iiint_{\Omega} z^{2}\,dV = \frac{1}{3}\iiint_{\Omega} (x^{2}+y^{2}+z^{2})\,dV$。球面坐标下

$$
\frac{1}{3}\iiint_{\Omega} (x^{2}+y^{2}+z^{2})\,dV = \frac{1}{3}\int_{0}^{2\pi} d\theta \int_{0}^{\pi} \sin\varphi\,d\varphi \int_{0}^{1} r^{2}\cdot r^{2}\,dr = \frac{1}{3}\cdot 2\pi\cdot 2\cdot\frac{1}{5} = \frac{4}{15}\pi
$$

**评注**：轮换对称性将难以直接积分的 $z^{2}$ 转化为容易积分的 $x^{2}+y^{2}+z^{2}=r^{2}$——三重积分中最优雅的化简技巧。

:::

:::example 例 2 · 先用对称性消项，再上球面坐标
$\Omega$ 由 $x^{2}+y^{2}+z^{2}=2z\ (z\ge 1)$ 与 $z=\sqrt{x^{2}+y^{2}}$ 围成，求 $\iiint_{\Omega} (x+y+z^{3})\,dV$。

**思路**：先看对称性——$\Omega$ 关于 $zOx$ 面和 $yOz$ 面对称，$x$ 和 $y$ 的奇函数在对称区域上积分为零，消掉两个最麻烦的项。剩下的 $z^{3}$ 用球面坐标处理。

![球面 x²+y²+(z-1)²=1 与锥面 z=x²+y² 围成的区域](/notes-assets/hm9-15-triple-integral-example.jpg)

**解**：$\Omega$ 关于 $zOx$ 面和 $yOz$ 面对称 ⇒ $\iiint_{\Omega} x\,dV = \iiint_{\Omega} y\,dV = 0$。原式 $=\iiint_{\Omega} z^{3}\,dV$。

$x^{2}+y^{2}+z^{2}=2z \Leftrightarrow x^{2}+y^{2}+(z-1)^{2}=1$，球面坐标下 $r=2\cos\varphi$。锥面 $z=\sqrt{x^{2}+y^{2}}$ 对应 $\varphi=\frac{\pi}{4}$（因为 $\tan\varphi=\frac{\sqrt{x^{2}+y^{2}}}{z}=1$）。区域 $\varphi\in[0,\frac{\pi}{4}]$。

$$
\begin{aligned}
\iiint_{\Omega} z^{3}\,dV
&= \int_{0}^{2\pi} d\theta \int_{0}^{\frac{\pi}{4}} \sin\varphi\,d\varphi \int_{0}^{2\cos\varphi} r^{3}\cos^{3}\varphi \cdot r^{2}\,dr \\
&= 2\pi \int_{0}^{\frac{\pi}{4}} \sin\varphi\cos^{3}\varphi\,d\varphi \cdot \frac{1}{6}(2\cos\varphi)^{6} \\
&= \frac{64}{3}\pi \int_{0}^{\frac{\pi}{4}} \sin\varphi\cos^{9}\varphi\,d\varphi
= -\frac{64}{3}\pi\cdot\frac{1}{10}\cos^{10}\varphi\Big|_{0}^{\frac{\pi}{4}}
= \frac{31}{15}\pi
\end{aligned}
$$

**评注**：拿到三重积分第一反应——看对称性。$x$ 和 $y$ 两项被对称性秒杀后只剩 $z^{3}$，再用球面坐标。识别的关键：方程 $x^{2}+y^{2}+z^{2}=2z$ 配方得 $x^{2}+y^{2}+(z-1)^{2}=1$——球心在 $(0,0,1)$、半径为 $1$ 的球面，球面坐标下简化为 $r=2\cos\varphi$。

:::

#### 坐标系选择速查

| $\Omega$ 特征 | 被积函数特征 | 推荐坐标系 |
| :--- | :--- | :--- |
| 长方体、四面体 | 任意 | 直角坐标 |
| 圆柱、圆锥、旋转抛物面 | 含 $x^{2}+y^{2}$ | 柱面坐标 |
| 球体、球冠、锥+球 | 含 $x^{2}+y^{2}+z^{2}$ | 球面坐标 |

## 小结

1. 二重积分沿用定积分的"分割→近似→求和→取极限"，只是分割对象从小区间换成了**面积元素** $d\sigma$；$f(x,y)\ge 0$ 时它的几何意义是**曲顶柱体的体积**，有正有负时则是上方体积减去下方体积。
2. 二重积分的性质与定积分一一对应——线性性、区域可加性、常数积分 $\iint_{D} d\sigma = \sigma$、保号性、估值不等式与中值定理，只需把区间长度换成区域面积；中值定理给出的那一点 $f(\xi,\eta)$ 正是 $f$ 在 $D$ 上的**积分平均值** $\frac{1}{\sigma}\iint_{D} f\,d\sigma$。
3. 计算的第一步永远是**化为二次积分**：先用集合语言把区域写成 **X 型**（$a\le x\le b,\ \varphi_1(x)\le y\le \varphi_2(x)$）或 **Y 型**（$\psi_1(y)\le x\le \psi_2(y),\ c\le y\le d$），"后积先定限，限内画直线，先交写下限，后交写上限"——外层上下限是常数，内层上下限是外层变量的函数。
4. 选哪种类型的第一原则是**哪个不用拆分就选哪个**；若某种次序下内层积不出来（如 $\int e^{-y^{2}}\,dy$），就画出区域、换成另一种类型重列积分——**交换积分次序**的意义就在于把不可积的变量从内层挪出去。
5. 被积函数能写成 $f_1(x)f_2(y)$ 且区域是**矩形**时，二重积分可以拆成两个定积分的乘积；被积函数分段定义时（如 $\max\{xy,1\}$）则以分界线拆开区域，各段用各自的表达式积分再相加。
6. 对称性是与定积分"偶倍奇零"完全平行的一步化简：区域关于 $x$ 轴（或 $y$ 轴）对称时，被积函数关于 $y$（或 $x$）为奇则积分为零、为偶则是半个区域上的两倍；区域关于 $y=x$ 对称时可用**轮换对称性**，把 $\iint_{D} f(x,y)\,d\sigma$ 改写成 $\frac{1}{2}\iint_{D}[f(x,y)+f(y,x)]\,d\sigma$，复杂的被积函数常借此一步得零或直接约分。
7. 极坐标下别忘了面积元素是 $\rho\,d\rho\,d\theta$，不是 $d\rho\,d\theta$——那个 $\rho$ 来自雅可比行列式 $J=\rho$；圆形、扇形、环形区域或含 $x^{2}+y^{2}$ 的被积函数首选极坐标，圆不过原点时边界化为 $\rho=2a\cos\theta$，配合**点火公式**还能算出 $\int_{0}^{+\infty} e^{-x^{2}}dx=\frac{\sqrt{\pi}}{2}$。
8. 极坐标只是**换元法**的特例：一般换元把 $dx\,dy$ 换成 $\lvert J\rvert\,du\,dv$，$J=\frac{\partial(x,y)}{\partial(u,v)}$；椭圆区域用**广义极坐标** $x=ar\cos\theta,\ y=br\sin\theta$（$J=abr$）拉成矩形，被积函数含 $\frac{y-x}{y+x}$ 这类分式时令 $u=y-x,\ v=y+x$ 往往能极大简化。
9. 三重积分把面积元素换成**体积元素** $dV$：被积函数依次表示线密度、面密度、体密度时，一重、二重、三重积分分别给出线段质量、薄片质量与立体质量。直角坐标下有**投影法**（先一后二）与**截面法**（先二后一）；被积函数只含单变量且截面面积易求时，截面法只需一次定积分，比投影法快得多。
10. 坐标系选择直接决定计算量：旋转体或含 $x^{2}+y^{2}$ 的用**柱面坐标**（$dV=\rho\,d\rho\,d\theta\,dz$），球体或含 $x^{2}+y^{2}+z^{2}$ 的用**球面坐标**（$dV=r^{2}\sin\varphi\,dr\,d\varphi\,d\theta$）；拿到题目先看对称性，关于坐标面对称就把奇函数项直接消掉，剩下的再用**轮换对称性** $\iiint_{\Omega} f(x)\,dV=\frac{1}{3}\iiint_{\Omega}[f(x)+f(y)+f(z)]\,dV$ 化成好积的形式。
