---
title: 高等数学-7 向量代数与空间解析几何
description: 用向量语言精确描述三维空间：线性运算、数量积与向量积，平面与直线的方程，以及截痕法、旋转曲面、柱面与空间曲线的投影。
category: 数学
subject: 数学
subfield: 高等数学
topic: 向量代数与空间解析几何
difficulty: 基础
date: "2026-11-08"
tags: [高等数学, 向量代数, 数量积与向量积, 混合积, 平面方程, 空间直线, 二次曲面, 截痕法]
draft: false
featured: false
---

## 向量及其线性运算

这一章是微积分从"数"走向"形"的转折点。前六章我们一直在和函数打交道——求导、积分、解微分方程——工具越来越强，但几何直觉可能越来越弱。向量代数与空间解析几何要做的，是用代数语言精确描述三维空间中的几何对象：点的位置、直线的方向、平面的朝向、曲面的形状。向量是这个体系的通用语言——理解了向量运算，后面的平面方程、直线方程、曲面方程就是自然而然的推论。

### 向量的概念

#### 向量

既有大小又有方向的量称为**向量**（也叫矢量），通常用带上箭头的字母表示，如 $\overrightarrow{a}$，也可以用有向线段 $\overrightarrow{AB}$ 表示（起点 $A$，终点 $B$）。

- **模**：向量的长度，记作 $\lvert\overrightarrow{a}\rvert$。模是一个非负实数。
- **零向量**：模等于 $0$ 的向量，记作 $\overrightarrow{0}$。零向量的方向是任意的。
- **单位向量**：模等于 $1$ 的向量。对于任意非零向量 $\overrightarrow{a}$，与它同方向的单位向量记作 $\overrightarrow{e}_{a}$。
- **夹角**：将两个非零向量平移使起点重合，所成的不超过 $\pi$ 的那个角称为两向量的夹角，记作 $\langle\overrightarrow{a},\overrightarrow{b}\rangle$，范围是 $[0,\pi]$。

#### 向量间的关系

- **平行（共线）**：夹角为 $0$ 或 $\pi$，记作 $\overrightarrow{a} \parallel \overrightarrow{b}$。
- **垂直**：夹角为 $\frac{\pi}{2}$，记作 $\overrightarrow{a} \perp \overrightarrow{b}$。特别规定：零向量与任何向量都垂直，也都平行。
- **共面**：$k$（$k \ge 3$）个向量的起点和终点落在同一平面上。
- **相等**：$\lvert\overrightarrow{a}\rvert = \lvert\overrightarrow{b}\rvert$ 且方向相同，则 $\overrightarrow{a} = \overrightarrow{b}$。向量相等只关心大小和方向，不关心起点位置——这正是"自由向量"的含义。

### 向量的线性运算

#### 向量的加法

由于向量有方向，加法需要遵守几何规则：

- **(1) 三角形法则**：将 $\overrightarrow{b}$ 的起点平移到 $\overrightarrow{a}$ 的终点，从 $\overrightarrow{a}$ 的起点指向 $\overrightarrow{b}$ 的终点的向量即为 $\overrightarrow{a} + \overrightarrow{b}$。适用于首尾相连的场景。
- **(2) 平行四边形法则**：将两向量平移到共起点，以它们为邻边作平行四边形，从公共起点出发的对角线即为和。适用于共起点的场景。

![向量加法的三角形法则（首尾相连）与平行四边形法则（共起点）](/notes-assets/hm7-01-triangle-and-parallelogram-rules.jpg)

加法的运算律与数的加法一致：交换律 $\overrightarrow{a} + \overrightarrow{b} = \overrightarrow{b} + \overrightarrow{a}$；结合律 $(\overrightarrow{a} + \overrightarrow{b}) + \overrightarrow{c} = \overrightarrow{a} + (\overrightarrow{b} + \overrightarrow{c})$。

#### 向量的减法

- **负向量**：与 $\overrightarrow{a}$ 模相同、方向相反的向量，记作 $-\overrightarrow{a}$。
- **减法法则**：$\overrightarrow{b} - \overrightarrow{a} = \overrightarrow{b} + (-\overrightarrow{a})$。当两向量共起点时，差指向被减向量（从 $\overrightarrow{a}$ 终点指向 $\overrightarrow{b}$ 终点）。

![向量的减法法则：共起点时，差向量指向被减向量的终点](/notes-assets/hm7-02-vector-subtraction-rule.jpg)

由三角形法则直接推出**向量不等式**（三角形两边之和大于第三边）：

$$
\lvert\overrightarrow{a} + \overrightarrow{b}\rvert \le \lvert\overrightarrow{a}\rvert + \lvert\overrightarrow{b}\rvert, \quad \lvert\overrightarrow{a} - \overrightarrow{b}\rvert \le \lvert\overrightarrow{a}\rvert + \lvert\overrightarrow{b}\rvert
$$

#### 向量的数乘

实数 $\lambda$ 与向量 $\overrightarrow{a}$ 的乘积 $\lambda\overrightarrow{a}$ 仍是一个向量：

- 模：$\lvert\lambda\overrightarrow{a}\rvert = \lvert\lambda\rvert \lvert\overrightarrow{a}\rvert$
- 方向：$\lambda > 0$ 时同向，$\lambda < 0$ 时反向，$\lambda = 0$ 时为零向量

**单位化**：$\overrightarrow{e}_{\overrightarrow{a}} = \frac{\overrightarrow{a}}{\lvert\overrightarrow{a}\rvert}$——任何非零向量除以自己的模，得到同方向单位向量。只表达方向，不携带长度信息。

**共线充要条件**：设 $\overrightarrow{a} \neq \overrightarrow{0}$，则 $\overrightarrow{b} \parallel \overrightarrow{a} \Leftrightarrow$ 存在唯一实数 $\lambda$ 使 $\overrightarrow{b} = \lambda\overrightarrow{a}$。

### 空间直角坐标系

#### 坐标系与卦限

在空间中取定点 $O$ 和三个两两垂直的单位向量 $\overrightarrow{i},\overrightarrow{j},\overrightarrow{k}$，确定三条坐标轴：$x$ 轴（横）、$y$ 轴（纵）、$z$ 轴（竖），构成空间直角坐标系。三轴两两确定三个坐标面（$xOy$ 面，$yOz$ 面，$zOx$ 面），将空间分为八个**卦限**（I~VIII）。

在 $xOy$ 平面上方且 $yOz$ 平面前方、$zOx$ 平面右方的卦限叫做第 I 卦限，其他第 II、III、IV 卦限在 $xOy$ 平面上方，按逆时针方向确定。第 V 至第 VIII 卦限分别在 $xOy$ 平面下方，其中第 V 卦限在第 I 卦限下方，其余卦限按逆时针方向确定。

![空间直角坐标系与八个卦限的约定顺序](/notes-assets/hm7-03-space-coordinate-octants.jpg)

任意向量 $\overrightarrow{r}$ 可唯一分解：$\overrightarrow{r} = x\overrightarrow{i} + y\overrightarrow{j} + z\overrightarrow{k}$，记作 $\overrightarrow{r} = (x, y, z)$。

![向量在空间直角坐标系中的坐标表示](/notes-assets/hm7-04-vector-in-space-coordinates.jpg)

#### 坐标下的线性运算

设 $\overrightarrow{a} = (a_x, a_y, a_z)$，$\overrightarrow{b} = (b_x, b_y, b_z)$：

$$
\overrightarrow{a} \pm \overrightarrow{b} = (a_x \pm b_x,\ a_y \pm b_y,\ a_z \pm b_z)
$$

$$
\lambda\overrightarrow{a} = (\lambda a_x,\ \lambda a_y,\ \lambda a_z)
$$

平行判定：$\overrightarrow{a} \parallel \overrightarrow{b} \Leftrightarrow \frac{b_x}{a_x} = \frac{b_y}{a_y} = \frac{b_z}{a_z}$（分母为零时理解为分子也为零）。

:::example 例 1 · 解向量方程组
解向量方程组 $\begin{cases} 5\overrightarrow{x} - 3\overrightarrow{y} = \overrightarrow{a} \\ 3\overrightarrow{x} - 2\overrightarrow{y} = \overrightarrow{b} \end{cases}$，其中 $\overrightarrow{a} = (2,1,2)$，$\overrightarrow{b} = (-1,1,-2)$。

**思路**：向量方程组的消元法与数方程组完全一致——把向量当成数来操作即可。

**解**：消元得：

$$
\overrightarrow{x} = 2\overrightarrow{a} - 3\overrightarrow{b} = (4,2,4) - (-3,3,-6) = (7,-1,10)
$$

$$
\overrightarrow{y} = 3\overrightarrow{a} - 5\overrightarrow{b} = (6,3,6) - (-5,5,-10) = (11,-2,16)
$$

**评注**：坐标系的便利正在于此——几何运算退化为三个独立的分量运算。

:::

#### 向量的模与两点间距离

$$
\lvert\overrightarrow{r}\rvert = \sqrt{x^{2} + y^{2} + z^{2}}, \quad \lvert\overrightarrow{AB}\rvert = \sqrt{(x_2-x_1)^{2} + (y_2-y_1)^{2} + (z_2-z_1)^{2}}
$$

#### 定比分点公式

若 $\overrightarrow{AM} = \lambda\overrightarrow{MB}$，则 $\overrightarrow{OM} = \frac{1}{1+\lambda}\overrightarrow{OA} + \frac{\lambda}{1+\lambda}\overrightarrow{OB}$。

![定比分点：向量 AM = λ向量 MB 时点 M 在 AB 上的位置](/notes-assets/hm7-05-section-point-formula.jpg)

:::example 例 2 · 求与向量 AB 同向的单位向量
已知 $A(4,0,5)$，$B(7,1,3)$，求与 $\overrightarrow{AB}$ 同向的单位向量。

**思路**：先求向量坐标 → 求模 → 向量除以模得到同向单位向量。

**解**：

$$
\overrightarrow{AB} = (3, 1, -2), \quad \lvert\overrightarrow{AB}\rvert = \sqrt{9+1+4} = \sqrt{14}
$$

$$
\overrightarrow{e}_{\overrightarrow{AB}} = \frac{\overrightarrow{AB}}{\lvert\overrightarrow{AB}\rvert} = \frac{1}{\sqrt{14}}(3, 1, -2)
$$

**评注**：任何非零向量除以自己的模，就得到同方向的单位向量。在后面求夹角、做法向量和方向向量时大量用到。

:::

## 数量积与向量积

加减和数乘（线性运算）可以描述向量的伸缩和平移，但无法回答"这两个向量夹角多大？""它们围成的平行四边形面积是多少？"这类问题。我们需要两种新的乘积运算——数量积（结果为数，刻画投影和垂直）和向量积（结果为向量，刻画面积和平行）。这两种运算构成了空间解析几何真正的"工作语言"。

### 方向角与投影

#### 方向角与方向余弦

非零向量 $\overrightarrow{r}$ 与 $x$ 轴、$y$ 轴、$z$ 轴的夹角分别记为 $\alpha, \beta, \gamma$，统称为**方向角**，范围均为 $[0, \pi]$。

![方向角 α,β,γ：向量与三条坐标轴的夹角](/notes-assets/hm7-06-direction-angles.jpg)

**方向余弦**：设 $\overrightarrow{r} = (x, y, z)$，则

$$
\cos\alpha = \frac{x}{\lvert\overrightarrow{r}\rvert}, \quad \cos\beta = \frac{y}{\lvert\overrightarrow{r}\rvert}, \quad \cos\gamma = \frac{z}{\lvert\overrightarrow{r}\rvert}
$$

![方向余弦：同向单位向量的三个坐标分量](/notes-assets/hm7-07-direction-cosines.jpg)

方向余弦恰好就是同向单位向量的三个坐标：$(\cos\alpha, \cos\beta, \cos\gamma) = \overrightarrow{e}_{\overrightarrow{r}}$。由此得到恒等式：

$$
\cos^{2}\alpha + \cos^{2}\beta + \cos^{2}\gamma = 1
$$

:::example 例 1 · 求模、方向余弦与方向角
已知 $M_1(2, 2, \sqrt{2})$ 和 $M_2(1, 3, 0)$，求 $\overrightarrow{M_1M_2}$ 的模、方向余弦和方向角。

**思路**：先写出向量坐标 → 求模 → 各分量除以模得方向余弦 → 反余弦得方向角。

**解**：

$$
\overrightarrow{M_1M_2} = (-1, 1, -\sqrt{2}), \quad \lvert\overrightarrow{M_1M_2}\rvert = \sqrt{1+1+2} = 2
$$

$$
\cos\alpha = -\frac{1}{2}, \quad \cos\beta = \frac{1}{2}, \quad \cos\gamma = -\frac{\sqrt{2}}{2}
$$

$$
\Rightarrow \alpha = \frac{2\pi}{3}, \quad \beta = \frac{\pi}{3}, \quad \gamma = \frac{3\pi}{4}
$$

**评注**：$\alpha > \frac{\pi}{2}$ 说明向量指向 $x$ 轴负方向，与坐标分量 $x = -1$ 一致。方向余弦直接给出了向量在空间中的精确朝向。

:::

#### 向量在轴上的投影

点 $O$ 和单位向量 $\overrightarrow{e}$ 确定 $u$ 轴。向量 $\overrightarrow{r}$ 在 $u$ 轴上的**投影**是一个数（可正可负），记作 $\operatorname{Prj}_u\overrightarrow{r}$ 或 $(\overrightarrow{r})_u$。

![向量在 u 轴上的投影：一个可正可负的数](/notes-assets/hm7-08-projection-on-axis.jpg)

投影的性质：

- ① $\operatorname{Prj}_u\overrightarrow{a} = \lvert\overrightarrow{a}\rvert\cos\varphi$
- ② $\operatorname{Prj}_u(\overrightarrow{a} + \overrightarrow{b}) = \operatorname{Prj}_u\overrightarrow{a} + \operatorname{Prj}_u\overrightarrow{b}$
- ③ $\operatorname{Prj}_u(\lambda\overrightarrow{a}) = \lambda\operatorname{Prj}_u\overrightarrow{a}$

### 数量积（点积）

#### 定义

两个向量 $\overrightarrow{a}$ 和 $\overrightarrow{b}$ 的**数量积**是一个**数**：

$$
\overrightarrow{a} \cdot \overrightarrow{b} = \lvert\overrightarrow{a}\rvert \lvert\overrightarrow{b}\rvert \cos\theta \quad (\theta = \langle\overrightarrow{a}, \overrightarrow{b}\rangle)
$$

几何意义：$\lvert\overrightarrow{b}\rvert\cos\theta$ 是 $\overrightarrow{b}$ 在 $\overrightarrow{a}$ 方向上的投影长度，所以数量积就是"一个向量的模 × 另一个向量在其方向上的投影"。

#### 坐标计算

$$
\overrightarrow{a} \cdot \overrightarrow{b} = a_x b_x + a_y b_y + a_z b_z
$$

#### 核心应用

| 用途 | 公式 | 说明 |
| :--- | :--- | :--- |
| 求夹角 | $\cos\theta = \frac{\overrightarrow{a}\cdot\overrightarrow{b}}{\lvert\overrightarrow{a}\rvert\lvert\overrightarrow{b}\rvert}$ | 由定义直接推出 |
| 判垂直 | $\overrightarrow{a} \cdot \overrightarrow{b} = 0 \Leftrightarrow \overrightarrow{a} \perp \overrightarrow{b}$ | $\cos\frac{\pi}{2}=0$ |
| 自身点积 | $\overrightarrow{a} \cdot \overrightarrow{a} = \lvert\overrightarrow{a}\rvert^{2}$ | $\cos 0 = 1$ |

#### 运算律

数量积满足交换律、分配律和数乘结合律——和普通数的乘法一致：

- 交换律：$\overrightarrow{a}\cdot\overrightarrow{b}=\overrightarrow{b}\cdot\overrightarrow{a}$
- 分配律：$(\overrightarrow{a}+\overrightarrow{b})\cdot\overrightarrow{c}=\overrightarrow{a}\cdot\overrightarrow{c}+\overrightarrow{b}\cdot\overrightarrow{c}$
- 数乘结合律：$(\lambda\overrightarrow{a})\cdot\overrightarrow{b}=\lambda(\overrightarrow{a}\cdot\overrightarrow{b})$

### 向量积（叉积）

#### 定义

两个向量 $\overrightarrow{a}$ 和 $\overrightarrow{b}$ 的**向量积**是一个**向量** $\overrightarrow{a} \times \overrightarrow{b}$：

- **方向**：右手定则——四指从 $\overrightarrow{a}$ 弯向 $\overrightarrow{b}$（走较小角度），拇指所指方向。同时垂直于 $\overrightarrow{a}$ 和 $\overrightarrow{b}$。
- **大小**：$\lvert\overrightarrow{a} \times \overrightarrow{b}\rvert = \lvert\overrightarrow{a}\rvert \lvert\overrightarrow{b}\rvert \sin\theta$

![向量积的方向由右手定则确定](/notes-assets/hm7-09-cross-product-direction.jpg)

几何意义：$\lvert\overrightarrow{a} \times \overrightarrow{b}\rvert$ 恰好等于以 $\overrightarrow{a}$ 和 $\overrightarrow{b}$ 为邻边的**平行四边形面积**。

![以向量 a、向量 b 为邻边的平行四边形，面积等于 |a × b|](/notes-assets/hm7-10-cross-product-area.jpg)

#### 坐标计算

$$
\overrightarrow{a} \times \overrightarrow{b} =
\begin{vmatrix}
\overrightarrow{i} & \overrightarrow{j} & \overrightarrow{k} \\
a_x & a_y & a_z \\
b_x & b_y & b_z
\end{vmatrix}
= (a_y b_z - a_z b_y,\ a_z b_x - a_x b_z,\ a_x b_y - a_y b_x)
$$

#### 核心应用

| 用途 | 条件/公式 | 原因 |
| :--- | :--- | :--- |
| 判平行 | $\overrightarrow{a} \times \overrightarrow{b} = \overrightarrow{0} \Leftrightarrow \overrightarrow{a} \parallel \overrightarrow{b}$ | $\sin\theta = 0$ |
| 求面积 | $S_{\text{平行四边形}} = \lvert\overrightarrow{a} \times \overrightarrow{b}\rvert$ | 几何意义直接 |
| 三角形面积 | $S_{\triangle} = \frac{1}{2}\lvert\overrightarrow{a} \times \overrightarrow{b}\rvert$ | 平行四边形的一半 |
| 求法向量 | $\overrightarrow{n} = \overrightarrow{a} \times \overrightarrow{b}$ 同时垂直于 $\overrightarrow{a}$ 和 $\overrightarrow{b}$ | 叉积的方向 |

#### 运算律

- 反交换律：$\overrightarrow{a} \times \overrightarrow{b} = -\overrightarrow{b} \times \overrightarrow{a}$——交换次序会**反向**（与数量积最大不同）
- 分配律：$(\overrightarrow{a}+\overrightarrow{b})\times\overrightarrow{c}=\overrightarrow{a}\times\overrightarrow{c}+\overrightarrow{b}\times\overrightarrow{c}$
- 数乘结合律：$\lambda\overrightarrow{a}\times\overrightarrow{b}=\lambda(\overrightarrow{a}\times\overrightarrow{b})$

:::example 例 1 · 求叉积与同时垂直的单位向量
设 $\overrightarrow{a} = (2, 1, -1)$，$\overrightarrow{b} = (1, -1, 2)$。(1) 计算 $\overrightarrow{a} \times \overrightarrow{b}$；(2) 求与 $\overrightarrow{a}$ 和 $\overrightarrow{b}$ 均垂直的单位向量。

**思路**：(1) 行列式展开；(2) 叉积结果自动垂直于两个运算向量，单位化即得。注意有两个方向（正负）。

**解**：

(1) $\overrightarrow{a} \times \overrightarrow{b} = \begin{vmatrix} \overrightarrow{i} & \overrightarrow{j} & \overrightarrow{k} \\ 2 & 1 & -1 \\ 1 & -1 & 2 \end{vmatrix} = (1,\ -5,\ -3)$

(2) $\lvert\overrightarrow{a} \times \overrightarrow{b}\rvert = \sqrt{1+25+9} = \sqrt{35}$，$\overrightarrow{e} = \pm\frac{1}{\sqrt{35}}(1, -5, -3)$

**评注**：与两个不共线向量同时垂直的方向只有两个（互为正反），叉积给出其中之一。求法向量时反复使用。

:::

#### 数量积与向量积对照

| — | 数量积（点积） | 向量积（叉积） |
| :--- | :--- | :--- |
| 符号 | $\overrightarrow{a} \cdot \overrightarrow{b}$ | $\overrightarrow{a} \times \overrightarrow{b}$ |
| 结果 | **数** | **向量** |
| 定义 | $\lvert a\rvert\lvert b\rvert\cos\theta$ | $\lvert a\rvert\lvert b\rvert\sin\theta$，方向 ⊥ 于两者 |
| 坐标计算 | 分量相乘再求和 | 三阶行列式展开 |
| 几何意义 | 一个向量在另一个上的投影 × 模 | 以两向量为边的平行四边形面积 |
| 判垂直 | $\overrightarrow{a} \cdot \overrightarrow{b} = 0$ | — |
| 判平行 | — | $\overrightarrow{a} \times \overrightarrow{b} = \overrightarrow{0}$ |
| 交换律 | 满足 | **不满足**（反交换） |

### * 混合积

#### 定义与几何意义

三个向量的**混合积**定义为"先叉积再点积"：

$$
[\overrightarrow{a}\ \overrightarrow{b}\ \overrightarrow{c}] = (\overrightarrow{a} \times \overrightarrow{b}) \cdot \overrightarrow{c}
$$

混合积是一个**数**。其绝对值等于以三个向量为棱的**平行六面体的体积**。

![混合积的绝对值等于以三个向量为棱的平行六面体体积](/notes-assets/hm7-11-mixed-product-volume.jpg)

若三个向量构成右手系，混合积为正；构成左手系，则为负。

#### 坐标计算

$$
[\overrightarrow{a}, \overrightarrow{b}, \overrightarrow{c}] =
\begin{vmatrix}
a_x & a_y & a_z \\
b_x & b_y & b_z \\
c_x & c_y & c_z
\end{vmatrix}
$$

#### 性质

- 轮换对称：$[\overrightarrow{a}, \overrightarrow{b}, \overrightarrow{c}] = [\overrightarrow{b}, \overrightarrow{c}, \overrightarrow{a}] = [\overrightarrow{c}, \overrightarrow{a}, \overrightarrow{b}]$
- 对换变号：交换任意两向量，混合积反号
- **三向量共面** $\Leftrightarrow$ 混合积 $= 0$（体积为零）
- 有两向量相同则混合积必为零

:::example 例 1 · 用混合积判定四点共面
已知 $A(1,2,0)$，$B(2,3,1)$，$C(4,2,2)$，$M(x,y,z)$ 四点共面，求 $x,y,z$ 满足的关系式。

**思路**：四点共面 $\Leftrightarrow$ $\overrightarrow{AB}, \overrightarrow{AC}, \overrightarrow{AM}$ 共面 $\Leftrightarrow$ 混合积 $=0$。

**解**：

$$
\overrightarrow{AB} = (1, 1, 1), \quad \overrightarrow{AC} = (3, 0, 2), \quad \overrightarrow{AM} = (x-1, y-2, z)
$$

$$
\begin{vmatrix}
1 & 1 & 1 \\
3 & 0 & 2 \\
x-1 & y-2 & z
\end{vmatrix} = 0
\ \Rightarrow\ 2x + y - 3z - 4 = 0
$$

**评注**："四点共面"问题最标准的代数解法就是混合积为零。结果是一个平面方程——说明四点确定了一个平面。

:::

## 平面方程与空间直线方程

有了向量的加、减、数乘、点积、叉积这套完整的运算体系，现在我们可以用代数方程来精确描述空间中的平面和直线了。核心思路很简单：**平面的朝向用法向量描述，直线的方向用方向向量描述，位置则通过已知点来确定**。一旦建立起方程，空间中点、线、面之间的距离和夹角就能通过向量运算快速算出。

### 平面及其方程

#### 法向量

垂直于平面的非零向量称为该平面的**法向量**，通常记作 $\overrightarrow{n} = (A, B, C)$。一个平面有无穷多个法向量，但全部互相平行——法向量确定了平面的"朝向"。

#### 平面的点法式方程

已知法向量 $\overrightarrow{n} = (A, B, C)$ 及平面上一点 $P_0(x_0, y_0, z_0)$。平面上任意点 $P(x, y, z)$ 满足 $\overrightarrow{P_0P} \perp \overrightarrow{n}$，所以：

$$
\overrightarrow{n} \cdot \overrightarrow{P_0P} = 0 \ \Rightarrow\ A(x - x_0) + B(y - y_0) + C(z - z_0) = 0
$$

称为平面的**点法式方程**——这是所有平面方程的基础。

![平面的点法式方程：法向量与平面内任意向量的点积为零](/notes-assets/hm7-12-plane-point-normal-form.jpg)

#### 平面的一般式方程

展开点法式，令 $D = -(Ax_0 + By_0 + Cz_0)$，得到三元一次方程：

$$
Ax + By + Cz + D = 0
$$

称为平面的**一般式方程**。注意：系数 $(A, B, C)$ 直接就是法向量。

**系数与平面位置的关系**：

| 系数特征 | 几何意义 |
| :--- | :--- |
| $D = 0$ | 平面过原点 |
| $A = 0$ | 法向量无 $x$ 分量 → 平面平行于 $x$ 轴 |
| $B = 0$ | 平面平行于 $y$ 轴 |
| $C = 0$ | 平面平行于 $z$ 轴 |
| $A = B = 0$ | 法向量 $(0,0,C)$ → 平面平行于 $xOy$ 面 |

#### 平面的截距式方程

平面与三轴交于 $P(a,0,0), Q(0,b,0), R(0,0,c)$（$a,b,c \neq 0$）时：

$$
\frac{x}{a} + \frac{y}{b} + \frac{z}{c} = 1
$$

$a,b,c$ 分别称为平面在三轴上的截距。

:::example 例 1 · 由点与法向量写平面方程
求过点 $(2, -3, 0)$ 且以 $\overrightarrow{n} = (1, -2, 3)$ 为法向量的平面方程。

**解**：点法式：$(x-2) - 2(y+3) + 3(z-0) = 0$ → $x - 2y + 3z - 8 = 0$。

**评注**：一般式中系数 $(1,-2,3)$ 恰好就是法向量——最需要记住的事实。

:::

:::example 例 2 · 过三点的平面（叉积法与待定系数法）
求过 $M_1(2,-1,4), M_2(-1,3,-2), M_3(0,2,3)$ 的平面方程。

**思路**：法一：由不共线三点构造两个方向向量，叉积得法向量。法二：待定系数。

**法一（叉积法）**：

$$
\overrightarrow{M_1M_2} = (-3, 4, -6), \quad \overrightarrow{M_1M_3} = (-2, 3, -1)
$$

$$
\overrightarrow{n} = \overrightarrow{M_1M_2} \times \overrightarrow{M_1M_3} = \begin{vmatrix} \overrightarrow{i} & \overrightarrow{j} & \overrightarrow{k} \\ -3 & 4 & -6 \\ -2 & 3 & -1 \end{vmatrix} = (14, 9, -1)
$$

点法式：$14(x-2) + 9(y+1) - (z-4) = 0$ → $14x + 9y - z - 15 = 0$。

**法二（待定系数法）**：设 $Ax+By+Cz+D=0$，代入三点解方程组，同样得 $14x+9y-z-15=0$。

**评注**：叉积法简洁高效——不共线三点天然提供了两个方向向量。待定系数法在有未知参数时使用。

:::

**拓展——平面的三点式方程**（直接由三点坐标写出，无需先求法向量）：

$$
\begin{vmatrix}
x-x_1 & y-y_1 & z-z_1 \\
x_2-x_1 & y_2-y_1 & z_2-z_1 \\
x_3-x_1 & y_3-y_1 & z_3-z_1
\end{vmatrix} = 0
$$

:::example 例 3 · 过坐标轴的平面
求通过 $x$ 轴和点 $A(4,-3,-1)$ 的平面方程。

**思路**：过 $x$ 轴 $\Leftrightarrow$ 过原点且 $x$ 轴在平面内。法一：$x$ 轴方向 $\overrightarrow{i}$ 与 $\overrightarrow{OA}$ 叉积得法向量。法二：过 $x$ 轴 $\Rightarrow$ 一般式中 $A=0$ 且 $D=0$。

**法一**：$\overrightarrow{n} = \overrightarrow{i} \times \overrightarrow{OA} = \begin{vmatrix} \overrightarrow{i} & \overrightarrow{j} & \overrightarrow{k} \\ 1 & 0 & 0 \\ 4 & -3 & -1 \end{vmatrix} = (0, 1, -3)$。过原点：$y - 3z = 0$。

**法二**：设 $By + Cz = 0$，代入 $A$ 得 $-3B - C = 0$，取 $B=1, C=-3$，得 $y - 3z = 0$。

**评注**："过什么轴就缺什么变量"——过 $x$ 轴缺 $x$，过原点缺常数项。特殊位置平面的快捷识别法。

:::

#### 两平面的夹角

两平面的夹角等于其法向量的夹角（取锐角）：

$$
\cos\theta = \frac{\lvert\overrightarrow{n_1} \cdot \overrightarrow{n_2}\rvert}{\lvert\overrightarrow{n_1}\rvert \lvert\overrightarrow{n_2}\rvert}, \quad \theta \in \left[0, \frac{\pi}{2}\right]
$$

![两平面的夹角等于两法向量的夹角（取锐角）](/notes-assets/hm7-13-angle-between-planes.jpg)

| 位置关系 | 判定条件 |
| :--- | :--- |
| 垂直 | $A_1 A_2 + B_1 B_2 + C_1 C_2 = 0$ |
| 平行 | $\frac{A_1}{A_2} = \frac{B_1}{B_2} = \frac{C_1}{C_2}$ |

#### 点到平面的距离

$$
d = \frac{\lvert Ax_0 + By_0 + Cz_0 + D\rvert}{\sqrt{A^{2} + B^{2} + C^{2}}}
$$

![点到平面的距离：沿法向量方向度量](/notes-assets/hm7-14-point-plane-distance.jpg)

:::example 例 4 · 过两点且垂直于已知平面
一平面过 $M_1(1,1,1)$ 和 $M_2(0,1,-1)$ 且垂直于 $x+y+z=0$，求其方程。

**思路**：所求平面的法向量同时垂直于 $\overrightarrow{M_1M_2}$ 和已知平面的法向量——两个垂直条件 → 叉积一次得出。

**解**：$\overrightarrow{M_1M_2} = (-1, 0, -2)$，$\overrightarrow{n_1} = (1, 1, 1)$。

$$
\overrightarrow{n} = \overrightarrow{M_1M_2} \times \overrightarrow{n_1} = \begin{vmatrix} \overrightarrow{i} & \overrightarrow{j} & \overrightarrow{k} \\ -1 & 0 & -2 \\ 1 & 1 & 1 \end{vmatrix} = (2, -1, -1)
$$

取 $\overrightarrow{n} = (2, -1, -1)$，过 $M_1$：$2(x-1)-(y-1)-(z-1)=0$ → $2x-y-z=0$。

**评注**：所求法向量要同时垂直于两个已知向量 → 叉积一步到位。这是"过两点 + 垂直某平面"类问题的标准解法。

:::

### 空间直线及其方程

#### 空间直线的三种方程

**(1) 一般式**（空间直线 $L$ 可以视为两个平面 $\Pi_1$ 和 $\Pi_2$ 的交线）：

$$
\begin{cases}
A_1 x + B_1 y + C_1 z + D_1 = 0 \\
A_2 x + B_2 y + C_2 z + D_2 = 0
\end{cases}
$$

如果一个非零向量平行于一条已知直线，那么这个向量叫做这条直线的**方向向量**。方向向量可以由确定这条直线的两个平面的法向量叉积得到：$\overrightarrow{s} = \overrightarrow{n_1} \times \overrightarrow{n_2}$。

![空间直线的一般式：两个平面的交线](/notes-assets/hm7-15-line-general-form.jpg)

**(2) 点向式（对称式）**——已知一点 $P_0$ 和方向向量 $\overrightarrow{s} = (m,n,p)$：

$$
\frac{x - x_0}{m} = \frac{y - y_0}{n} = \frac{z - z_0}{p}
$$

若分母有零（如 $m=0$），理解为分子也为零（即 $x = x_0$）。

**(3) 参数式**——点向式令三个比值 $= t$：

$$
\begin{cases}
x = x_0 + mt \\
y = y_0 + nt \\
z = z_0 + pt
\end{cases}
$$

:::example 例 1 · 一般式化为点向式与参数式
用点向式和参数式表示直线 $\begin{cases} x+y+z+1=0 \\ 2x-y+3z+4=0 \end{cases}$。

**思路**：① 任取一值求一点；② 叉积求方向向量。

**解**：取 $x=1$ 代入得 $y=0, z=-2$，点 $(1,0,-2)$。$\overrightarrow{s} = (1,1,1)\times(2,-1,3) = (4,-1,-3)$。

点向式：$\frac{x-1}{4}=\frac{y}{-1}=\frac{z+2}{-3}$；参数式：$\begin{cases} x=1+4t \\ y=-t \\ z=-2-3t \end{cases}$。

**评注**：一般式 → 点向式两步走：找一点 + 叉积求方向。

:::

#### 两直线的夹角

$$
\cos\varphi = \frac{\lvert\overrightarrow{s_1} \cdot \overrightarrow{s_2}\rvert}{\lvert\overrightarrow{s_1}\rvert \lvert\overrightarrow{s_2}\rvert}
$$

| 关系 | 条件 |
| :--- | :--- |
| 垂直 | $m_1 m_2 + n_1 n_2 + p_1 p_2 = 0$ |
| 平行 | $\frac{m_1}{m_2} = \frac{n_1}{n_2} = \frac{p_1}{p_2}$ |

#### 直线与平面的夹角

直线与它在平面上投影直线之间的夹角（取锐角）。设方向向量 $\overrightarrow{s} = (m,n,p)$，法向量 $\overrightarrow{n} = (A,B,C)$：

$$
\sin\varphi = \frac{\lvert\overrightarrow{s} \cdot \overrightarrow{n}\rvert}{\lvert\overrightarrow{s}\rvert \lvert\overrightarrow{n}\rvert}
$$

![直线与平面的夹角：方向向量与法向量的夹角是线面夹角的余角](/notes-assets/hm7-16-angle-between-line-and-plane.jpg)

> 注意是 $\sin\varphi$ 而不是 $\cos\varphi$！因为方向向量和法向量的夹角是线面夹角的余角。

| 关系 | 条件 | 几何理解 |
| :--- | :--- | :--- |
| $L \perp \Pi$ | $\frac{A}{m} = \frac{B}{n} = \frac{C}{p}$ | 方向向量与法向量平行 |
| $L \parallel \Pi$ | $Am + Bn + Cp = 0$ | 方向向量与法向量垂直 |

:::example 例 2 · 求与已知直线垂直相交的直线
求过点 $(2,1,3)$ 且与直线 $\frac{x+1}{3}=\frac{y-1}{2}=\frac{z}{-1}$ 垂直相交的直线方程。

**思路**：在已知直线上取参数点 $B$，利用 $\overrightarrow{AB} \perp \overrightarrow{s_1}$（垂直条件）解出参数 → 找到交点 → 得方向向量。

**解**：$B(-1+3t,\ 1+2t,\ -t)$，$A(2,1,3)$。

$$
\overrightarrow{AB} = (-3+3t,\ 2t,\ -t-3)
$$

$\overrightarrow{AB} \perp \overrightarrow{s_1} = (3,2,-1)$：

$$
3(-3+3t)+2(2t)-(-t-3)=0 \ \Rightarrow\ -9+9t+4t+t+3=0 \ \Rightarrow\ t=\frac{3}{7}
$$

$$
\overrightarrow{AB} = \frac{6}{7}(-2,1,-4)
$$

方向向量取 $(-2,1,-4)$，方程：$\frac{x-2}{-2}=\frac{y-1}{1}=\frac{z-3}{-4}$。

**评注**："垂直相交"统一为 $\overrightarrow{AB} \perp \overrightarrow{s_1}$，通过解参数方程一步找到交点。

:::

#### 平面束方程

设直线 $L$ 的一般方程为 $\begin{cases} A_1x+B_1y+C_1z+D_1=0 \\ A_2x+B_2y+C_2z+D_2=0 \end{cases}$，其中系数 $A_1,B_1,C_1$ 与 $A_2,B_2,C_2$ 不成比例，则过直线 $L$ 的平面束方程为

$$
A_1x+B_1y+C_1z+D_1+\lambda(A_2x+B_2y+C_2z+D_2)=0
$$

**平面束**表示通过直线 $L$ 的所有平面的全体（除平面 $A_2x+B_2y+C_2z+D_2=0$ 以外），其中 $\lambda$ 为任意常数。

:::example 例 3 · 用平面束求过定点的平面
求过点 $M_0(3,1,-2)$ 且包含直线 $\frac{x-4}{5}=\frac{y+3}{2}=\frac{z}{1}$ 的平面方程。

**思路**：将直线化为两平面交线 → 写平面束 → 代入 $M_0$ 定 $\lambda$。

**解**：直线等价于 $\pi_1:\frac{x-4}{5}-\frac{y+3}{2}=0,\ \pi_2:y+3-2z=0$。平面束：$\frac{x-4}{5}-\frac{y+3}{2}+\lambda(y+3-2z)=0$。代入 $(3,1,-2)$ 得 $\lambda=\frac{11}{40}$，整理得 $8x-9y-22z-59=0$。

**评注**：平面束不需求方向向量，直接用一个参数表示过该直线的所有平面，条件定参数一步到位。

:::

:::example 例 4 · 求直线在平面上的投影直线
求直线 $\begin{cases} x+y-z-1=0 \\ x-y+z+1=0 \end{cases}$ 在平面 $x+y+z=0$ 上的投影直线。

**思路**：投影直线 = 过原直线且垂直于投影平面的平面 ∩ 投影平面。第一步用平面束 + 垂直条件求投影平面。

**解**：平面束：$(x+y-z-1)+\lambda(x-y+z+1)=0$，法向量 $(1+\lambda,1-\lambda,\lambda-1)$。

与 $x+y+z=0$ 垂直 $\Rightarrow$ $(1+\lambda)+(1-\lambda)+(\lambda-1)=0$ $\Rightarrow$ $\lambda=-1$。

投影平面：$y-z-1=0$。投影直线：$\begin{cases} y-z-1=0 \\ x+y+z=0 \end{cases}$

**评注**："求投影直线"的标准套路——平面束 + 垂直条件 + 联立，方法极为固定。

:::

## 曲面方程与空间曲线方程

平面和直线是一次方程描述的几何对象。现在把方程从一次提升到二次甚至更高次——二次曲面、旋转曲面、柱面、空间曲线。这些对象不再有"平"和"直"的简单性。本节按"是什么 → 怎么看 → 怎么来的"组织：先定义二次曲面并引入截痕法作为分析工具，再讲曲面的两种生成方式——旋转（曲线绕轴转）和柱面（直线沿曲线平移），最后讨论空间曲线及其投影。

### 二次曲面与截痕法

#### 二次曲面的定义

三元二次方程 $F(x, y, z) = 0$ 所表示的曲面统称为**二次曲面**（平面是一次曲面）。二次曲面共有九种基本类型，它们的标准方程和特征如下：

| 名称 | 标准方程 | 特征记忆 |
| :--- | :--- | :--- |
| 椭球面 | $\frac{x^{2}}{a^{2}}+\frac{y^{2}}{b^{2}}+\frac{z^{2}}{c^{2}}=1$ | $a=b=c$ 时为球面 |
| 单叶双曲面 | $\frac{x^{2}}{a^{2}}+\frac{y^{2}}{b^{2}}-\frac{z^{2}}{c^{2}}=1$ | 一个减号 |
| 双叶双曲面 | $\frac{x^{2}}{a^{2}}+\frac{y^{2}}{b^{2}}-\frac{z^{2}}{c^{2}}=-1$ | 一个减号 + 右端 $-1$ |
| 椭圆抛物面 | $\frac{x^{2}}{a^{2}}+\frac{y^{2}}{b^{2}}=z$ | 一次项为 $z$ |
| 双曲抛物面（马鞍面） | $\frac{x^{2}}{a^{2}}-\frac{y^{2}}{b^{2}}=z$ | 一个减号 + 一次项 |
| 椭圆锥面 | $\frac{x^{2}}{a^{2}}+\frac{y^{2}}{b^{2}}=z^{2}$ | 平方和 = $z^{2}$ |
| 椭圆柱面 | $\frac{x^{2}}{a^{2}}+\frac{y^{2}}{b^{2}}=1$ | 缺 $z$ |
| 双曲柱面 | $\frac{x^{2}}{a^{2}}-\frac{y^{2}}{b^{2}}=1$ | 缺 $z$，一个减号 |
| 抛物柱面 | $x^{2}=2py$ | 缺 $z$，仅一个二次项 |

#### 截痕法

直接看二次曲面方程，很难在脑海中浮现它的立体形状。**截痕法**提供了一种系统的方法：用平行于坐标面的平面（如 $z = t$）去截曲面，观察截口是什么曲线（椭圆？双曲线？抛物线？），再通过这些截口随 $t$ 变化的趋势"拼出"曲面的全貌——本质是**降维**，把三维形状问题转化为一系列二维曲线问题。

![椭球面：用水平面 z = t 截出的是椭圆，t 从 −c 变到 c 时椭圆先变大再缩小为一点](/notes-assets/hm7-17-ellipsoid-and-sphere.svg)

以椭球面 $\frac{x^{2}}{a^{2}}+\frac{y^{2}}{b^{2}}+\frac{z^{2}}{c^{2}}=1$ 为例：用 $z = t$（$\lvert t\rvert < c$）去截，得到 $\frac{x^{2}}{a^{2}}+\frac{y^{2}}{b^{2}}=1-\frac{t^{2}}{c^{2}}$——一个椭圆。$t$ 从 $-c$ 变到 $c$，椭圆先变大再变小，在 $t = \pm c$ 时缩为一点。同时，用 $x = t$ 或 $y = t$ 去截也得到椭圆。三种方向的截痕综合起来，就能在脑海中构建出一个"压扁的球"的形象。

各二次曲面的截痕特征一览：

| 曲面 | 用 $z = t$ 截 | 用 $x = t$ 或 $y = t$ 截 | 整体形状 |
| :--- | :--- | :--- | :--- |
| 椭球面 | 椭圆（$\lvert t\rvert < c$） | 椭圆 | 压扁的球 |
| 椭圆抛物面 | 椭圆（$t > 0$） | 抛物线 | 碗状 |
| 单叶双曲面 | 椭圆（始终存在） | 双曲线 | 腰鼓形 |
| 双叶双曲面 | 椭圆（$\lvert t\rvert \ge c$） | 双曲线 | 两片分离 |
| 椭圆锥面 | 椭圆（$t \neq 0$） | 两条直线（$t=0$ 缩为点） | 漏斗形 |
| 双曲抛物面 | 双曲线 | 抛物线 | 马鞍形 |

![椭圆锥面：漏斗形，用 z = t 截得椭圆（越往上越大），上下两个锥面在原点相接](/notes-assets/hm7-18-elliptic-cone.svg)

![椭圆抛物面：碗形，用 z = t（t > 0）截得椭圆，用 x = t 截得抛物线](/notes-assets/hm7-19-elliptic-paraboloid.svg)

![单叶双曲面：腰鼓形，腰椭圆最细；用 z = t 截得的椭圆始终存在，越往上下越大](/notes-assets/hm7-20-hyperboloid-one-sheet.svg)

![双叶双曲面：上下两片互相分离，只有 |z| ≥ c 的水平面才截得到椭圆，z = ±c 时缩成两点](/notes-assets/hm7-21-hyperboloid-two-sheets.svg)

![双曲抛物面（马鞍面）：一个方向向上弯、另一个方向向下弯；用 z = t 截得双曲线，用 x = t 截得抛物线](/notes-assets/hm7-22-hyperbolic-paraboloid.svg)

### 旋转曲面

#### 定义与一般方法

有了截痕法这个分析工具，现在来看曲面是如何"生成"的。第一种方式：**旋转**。

一条平面曲线绕其所在平面内的一条直线旋转一周所形成的曲面称为**旋转曲面**。曲线叫**母线**，直线叫**轴**。

设在 $yOz$ 面内曲线 $C: f(y, z) = 0$（此时 $x = 0$），绕 $z$ 轴旋转后的曲面方程为：

$$
f(\pm\sqrt{x^{2} + y^{2}},\ z) = 0
$$

推导的关键在于理解**纬圆**——母线上每一点绕 $z$ 轴旋转时，轨迹是一个垂直于 $z$ 轴的圆。这些圆就像地球仪上的纬线，因此称为**纬圆**。在同一个纬圆上，有两个量始终保持不变：① 该点的 $z$ 坐标不变（高度不变）；② 该点到 $z$ 轴的距离不变（纬圆的半径不变，即 $\sqrt{x^{2}+y^{2}}$ 恒等于母线对应点 $y$ 坐标的绝对值）。

![曲线绕 z 轴旋转生成曲面：红色是 yOz 面内的母线，绿色是母线上一点旋转出的纬圆（高度不变、到 z 轴的距离不变）](/notes-assets/hm7-23-surface-of-revolution.svg)

:::tip 推导思路：纬圆的"两不变"
设母线上一点 $(0, y_1, z_1)$ 满足 $f(y_1, z_1)=0$。该点绕 $z$ 轴旋转时，由纬圆的两不变性，旋转后任意位置 $(x, y, z)$ 满足 $z = z_1$ 且 $x^{2}+y^{2} = y_1^{2}$。从第二式解出 $y_1 = \pm\sqrt{x^{2}+y^{2}}$，代入 $f(y_1, z_1)=0$ 即得 $f(\pm\sqrt{x^{2}+y^{2}},\ z)=0$。

:::

**核心规则**：绕哪个轴转，那个坐标不变；另一个坐标替换为 $\pm\sqrt{\text{其余两坐标平方和}}$。

:::example 例 1 · 曲线绕坐标轴旋转所得曲面
写出下列曲线绕指定轴旋转所得曲面方程：(1) $z = y^{2}$ 绕 $z$ 轴；(2) $z = y$ 绕 $z$ 轴。

**解**：

(1) $y$ 替换为 $\pm\sqrt{x^{2}+y^{2}}$ → $z = x^{2}+y^{2}$（旋转抛物面）

(2) $y$ 替换为 $\pm\sqrt{x^{2}+y^{2}}$ → $z^{2} = x^{2}+y^{2}$（圆锥面）

**评注**：绕 $z$ 轴旋转后，$x$ 和 $y$ 必然以 $x^{2}+y^{2}$ 的形式对称出现——识别旋转曲面最有效的信号。

:::

#### 常见旋转曲面

| 名称 | 母线 | 绕 $z$ 轴方程 | 特征 |
| :--- | :--- | :--- | :--- |
| 旋转抛物面 | $z = ky^{2}$ | $z = k(x^{2}+y^{2})$ | — |
| 圆锥面 | $z = y\cot\alpha$ | $z^{2} = (x^{2}+y^{2})\cot^{2}\alpha$ | 顶点在原点 |
| 旋转单叶双曲面 | $\frac{y^{2}}{a^{2}}-\frac{z^{2}}{c^{2}}=1$ | $\frac{x^{2}+y^{2}}{a^{2}}-\frac{z^{2}}{c^{2}}=1$ | 绕 $z$ 轴 |
| 旋转双叶双曲面 | — | $\frac{x^{2}}{a^{2}}-\frac{y^{2}+z^{2}}{c^{2}}=1$ | 绕 $x$ 轴 |

![圆锥面：母线 z = y·cot α 绕 z 轴旋转，顶点在原点](/notes-assets/hm7-24-cone-surface.svg)

![旋转单叶双曲面：双曲线 y²/a² − z²/c² = 1 绕 z 轴旋转所得的腰鼓形曲面](/notes-assets/hm7-25-revolved-hyperboloid.svg)

![旋转抛物面：抛物线 z = k·y² 绕 z 轴旋转，开口朝上的碗形](/notes-assets/hm7-26-revolved-paraboloid.svg)

**伸缩变换**——从旋转曲面到一般二次曲面：沿哪个轴伸缩 $k$ 倍，该变量乘以 $\frac{1}{k}$。例如旋转单叶双曲面 $\frac{x^{2}+y^{2}}{a^{2}}-\frac{z^{2}}{c^{2}}=1$ 沿 $y$ 轴伸缩即得一般单叶双曲面 $\frac{x^{2}}{a^{2}}+\frac{y^{2}}{b^{2}}-\frac{z^{2}}{c^{2}}=1$。

:::example 例 2 · 同一曲线绕两条轴旋转
求曲线 $\begin{cases} 2x^{2}+y^{2}=1 \\ z=0 \end{cases}$ 分别绕 $x$ 轴和 $y$ 轴旋转产生的曲面方程。

**解**：绕 $x$ 轴：$2x^{2}+(y^{2}+z^{2})=1$。绕 $y$ 轴：$2(x^{2}+z^{2})+y^{2}=1$。

**评注**：曲线在 $xOy$ 面内（$z=0$），绕哪个轴哪个坐标保留不替换，另一个替换为 $\pm\sqrt{\cdots}$。

:::

### 柱面

第二种生成方式：**平移**。直线 $L$ 沿一条定曲线 $C$ 平行移动，所形成的曲面称为**柱面**。定曲线 $C$ 叫做**准线**，动直线 $L$ 叫做**母线**。

![圆柱面：方程里缺少 z，说明母线平行于 z 轴 —— 红色是 xOy 面上的准线（圆），绿色是母线](/notes-assets/hm7-27-circular-cylinder.svg)

柱面最显著的识别特征是方程中**缺少某个变量**。例如 $x^{2}+y^{2}=R^{2}$（缺 $z$）表示以 $z$ 轴方向为母线的圆柱面——无论 $z$ 取什么值，$x$ 和 $y$ 都满足同一个圆方程，所以 $xOy$ 面上的圆沿着 $z$ 方向无限延伸。

| 类型 | 方程 | 母线方向 |
| :--- | :--- | :--- |
| 圆柱面 | $x^{2}+y^{2}=R^{2}$ | ∥ $z$ 轴 |
| 抛物柱面 | $x^{2}=2py$ | ∥ $z$ 轴 |
| 双曲柱面 | $\frac{x^{2}}{a^{2}}-\frac{y^{2}}{b^{2}}=1$ | ∥ $z$ 轴 |

![抛物柱面：抛物线沿 z 轴平移，方程里缺少 z](/notes-assets/hm7-28-1-parabolic-cylinder.svg)

![双曲柱面：双曲线沿 z 轴平移，分成左右两片](/notes-assets/hm7-28-2-hyperbolic-cylinder.svg)

**求柱面方程**：母线平行于哪个轴就消去哪个变量。例如准线为 $\begin{cases} F(x,y,z)=0 \\ G(x,y,z)=0 \end{cases}$，母线 ∥ $z$ 轴 → 消 $z$ 得 $H(x,y)=0$ 即为柱面方程。

> 注意区分：缺 $z$ 的方程表示的柱面母线方向是 ∥ $z$ 轴，而一般式中 $C=0$ 表示平面 ∥ $z$ 轴——两者本质相同：缺少某个变量意味着在该变量方向上"无约束"。

:::example 例 1 · 消元法求柱面方程
求以曲线 $\begin{cases} 2x^{2}+2y^{2}+3z^{2}=1 \\ z=x^{2}+y^{2} \end{cases}$ 为准线，母线平行于 $z$ 轴的柱面方程。

**思路**：母线 ∥ $z$ 轴 → 消去变量 $z$。将 $z = x^{2}+y^{2}$ 代入第一个方程，得到的 $x,y$ 方程即为柱面。

**解**：将 $z = x^{2}+y^{2}$ 代入 $2x^{2}+2y^{2}+3z^{2}=1$：

$$
2x^{2}+2y^{2}+3(x^{2}+y^{2})^{2}=1
$$

令 $u = x^{2}+y^{2} \ge 0$，则 $3u^{2}+2u-1=0 \Rightarrow (3u-1)(u+1)=0$。

$u \ge 0$ $\Rightarrow$ $u = \frac{1}{3}$，即 $x^{2}+y^{2} = \frac{1}{3}$。

**评注**：柱面方程求法的完整流程——消去母线方向的变量 → 如果得到的是含平方的方程，做变量代换降次 → 取符合实际范围的解。这里最终得到的是一个圆柱面方程。

:::

### 空间曲线及其方程

#### 空间曲线的表示

由空间直线的定义可扩展至空间曲线，空间曲线是由两个曲面的方程联立所得：

- **一般式**：$\begin{cases} F(x,y,z)=0 \\ G(x,y,z)=0 \end{cases}$
- **参数式**：$\begin{cases} x=\varphi(t) \\ y=\psi(t) \\ z=\omega(t) \end{cases}$

#### 空间曲线在坐标面上的投影

由 $L:\begin{cases} F(x,y,z)=0 \\ G(x,y,z)=0 \end{cases}$，消去其中一个变量（如 $z$）得到方程 $H(x,y)=0$，则曲线 $L$ 的所有点都在柱面 $H(x,y)=0$ 上，此柱面（垂直于 $xOy$ 平面）称为**投影柱面**，投影柱面与 $xOy$ 平面的交线叫做曲线 $C$ 在 $xOy$ 面上的**投影曲线**，用方程表示为

$$
\begin{cases}
H(x,y)=0 \\
z=0
\end{cases}
$$

同理可以求出空间曲线 $C$ 在其他坐标面的投影曲线，即消去一个变量得投影柱面，联立该坐标面得投影曲线。**消谁就是向哪个坐标面投影**。

:::example 例 1 · 消元法求投影曲线
求曲线 $\begin{cases} \frac{x^{2}}{16}+\frac{y^{2}}{4}-\frac{z}{5}=1 \\ x-2z+3=0 \end{cases}$ 在 $xOy$ 面上的投影。

**思路**：消 $z$ → 得投影柱面 → 联立 $z=0$。

**解**：由 $x-2z+3=0$ 得 $z=\frac{x+3}{2}$，代入曲面方程：

$$
\frac{x^{2}}{16}+\frac{y^{2}}{4}-\frac{x+3}{10}=1
$$

两边乘 $80$ 化简：

$$
5x^{2}+20y^{2}-8x-104=0
$$

投影曲线：$\begin{cases} 5x^{2}+20y^{2}-8x-104=0 \\ z=0 \end{cases}$。

**评注**：消哪个变量就是向哪个坐标面投影。消 $z$ → $xOy$ 面投影，消 $x$ → $yOz$ 面投影。

:::

:::example 例 2 · 由几何直观直接写投影
求上半球 $0 \le z \le \sqrt{a^{2}-x^{2}-y^{2}}$ 与圆柱体 $x^{2}+y^{2} \le ax\ (a>0)$ 的公共部分在 $xOy$ 面和 $xOz$ 面上的投影。

**思路**：这类题不需要消元——直接从几何形状出发判断投影区域。公共部分是一个"圆柱体截出来的球顶"，从上往下看（$xOy$ 面）就是圆柱底面，从侧面看（$xOz$ 面）是球被圆柱截出的侧影。

![空间曲线的投影：球顶被圆柱截出的公共部分](/notes-assets/hm7-29-space-curve-projection.jpg)

**解**：

- 在 $xOy$ 面投影：公共部分在 $z$ 方向上完全被圆柱 $x^{2}+y^{2} \le ax$ 约束，投影即为该圆域 $\begin{cases} x^{2}+y^{2} \le ax \\ z = 0 \end{cases}$。
- 在 $xOz$ 面投影：从 $y$ 方向看，公共部分的边界由球面 $x^{2}+z^{2}=a^{2}$ 和圆柱侧面 $y^{2}=ax-x^{2}$ 的交线决定，消去 $y$ 后球面本身给出投影区域 $\begin{cases} x^{2}+z^{2} \le a^{2},\ x \ge 0 \\ y = 0 \end{cases}$。

**评注**：这道题与上一例形成对照——上一例是"代数消元法"求投影，本例是"几何直观法"求投影。当几何体形状清晰时（球、柱、锥等基本立体），直接从几何意义判断投影往往比消元更快。两种方法互补使用。

:::

## 小结

1. **向量**只由大小和方向决定，与起点位置无关（这正是"自由向量"的含义）；模、零向量（方向任意）、单位向量 $\overrightarrow{e}_{\overrightarrow{a}} = \frac{\overrightarrow{a}}{\lvert\overrightarrow{a}\rvert}$ 与夹角是描述它的基本量，三个以上向量还有共面这一层关系。
2. 加减与数乘是**线性运算**，加法既可以按三角形法则首尾相连，也可以按平行四边形法则共起点作图；**共线**的充要条件是存在唯一 $\lambda$ 使 $\overrightarrow{b} = \lambda\overrightarrow{a}$，在坐标下表现为分量成比例，而模、两点距离、定比分点都能直接由坐标算出。
3. **方向余弦**恰是同向单位向量的三个坐标，因此恒有 $\cos^{2}\alpha + \cos^{2}\beta + \cos^{2}\gamma = 1$；**投影**则是一个可正可负的数，并且对加法与数乘保持线性。
4. 三种乘积分工明确：**数量积**管夹角与投影（$\overrightarrow{a} \cdot \overrightarrow{b} = 0$ 判垂直），**向量积**管面积与垂直（$\lvert\overrightarrow{a} \times \overrightarrow{b}\rvert$ 就是以两向量为邻边的平行四边形面积，结果本身还是同时垂直于两者的法向量），**混合积**管体积与共面（$[\overrightarrow{a}\ \overrightarrow{b}\ \overrightarrow{c}] = 0$ 判共面，绝对值是平行六面体体积）。
5. 数量积满足**交换律**，向量积却**反交换**——交换次序结果反向，这是两种乘积最容易踩的差别；坐标计算上，前者是分量相乘求和，后两者都要展开三阶行列式。
6. 平面由**法向量**和一点唯一确定：**点法式**是基础，展开即一般式 $Ax + By + Cz + D = 0$，系数 $(A, B, C)$ 直接就是法向量；$D = 0$ 过原点，缺哪个变量就平行于那个变量对应的坐标轴，点到平面的距离则是把点坐标代入一般式取绝对值、再除以 $\lvert\overrightarrow{n}\rvert$。
7. 直线由**方向向量**和一点确定：一般式化为点向式的两步是"取一点 + $\overrightarrow{s} = \overrightarrow{n_1} \times \overrightarrow{n_2}$"；求角时面面、线线用 $\cos$，线面必须用 $\sin\varphi$，因为方向向量与法向量的夹角是线面夹角的余角。
8. 过一条直线的一切平面可写成**平面束** $A_1x + B_1y + C_1z + D_1 + \lambda(A_2x + B_2y + C_2z + D_2) = 0$，求投影直线、求过定点的平面都是"平面束 + 一个条件定 $\lambda$"这一固定套路。
9. **截痕法**用 $z = t$ 这类平行于坐标面的平面去截曲面，把三维形状问题降维成一系列二维截口曲线，是识别九种二次曲面形状的统一工具。
10. 曲面有两种生成方式：**旋转**是母线绕轴转，绕哪个轴那个坐标不变、另一坐标替换为 $\pm\sqrt{\text{其余两坐标平方和}}$；**柱面**是直线沿准线平移，方程特征是缺一个变量。空间曲线向坐标面投影则是"消谁就向哪个坐标面投影"。
