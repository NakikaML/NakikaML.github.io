---
title: 数据结构与算法-6 图
description: 图的术语体系、四种存储结构、BFS/DFS 遍历，以及最小生成树、最短路径、拓扑排序与关键路径四大应用。
category: 计算机科学
subject: 计算机科学
subfield: 数据结构与算法
topic: 图
difficulty: 困难
date: "2026-09-29"
tags: [数据结构与算法, 图, 最小生成树, 最短路径, 拓扑排序, 关键路径, 并查集]
draft: false
featured: false
---

## 图的基本概念

### 图的定义与分类

**图** $G$ 由顶点集 $V$ 和边集 $E$ 组成，记为 $G=(V,E)$，其中 $V(G)$ 表示图 $G$ 中顶点的有限非空集，$E(G)$ 表示图 $G$ 中顶点之间的关系（边）集合。

- 若 $V=\{v_1,v_2,\dots,v_n\}$，则用 $|V|$ 表示图 $G$ 中顶点的个数，也称图 $G$ 的**阶**；
- $E=\{(u,v)\mid u\in V,\ v\in V\}$，用 $|E|$ 表示图 $G$ 中边的条数。

图与树的本质区别在于"路径是否唯一"：树中任意两个顶点之间至多有一条路径（连通且无环），而图中顶点之间**可以有多条路径、可以成环**。正因为存在回路，图的遍历才必须带访问标记数组，否则会在环上无限打转——这是后面所有算法都要反复用到的前提。

#### 无向图与有向图

边是否有方向，决定了记号、术语和几乎全部算法的写法：

| 类型 | 边的表示 | 边的关系 | 示例 |
| :--- | :--- | :--- | :--- |
| **无向图** | $(v,w)$ 或 $(w,v)$，无序对 | 顶点 $w$ 与 $v$ 互为**邻接点** | $(A,B)=(B,A)$ |
| **有向图** | $\langle v,w \rangle$，有序对 | $v$ 为**弧尾**，$w$ 为**弧头**，称 $v$ 邻接到 $w$ | $\langle A,B \rangle \neq \langle B,A \rangle$ |

两个具体的例子如下：

- 无向图 $G_1$：$V_1=\{A,B,C,D,E\}$，$E_1=\{(A,B),(B,D),(B,E),(C,D),(C,E),(D,E)\}$；
- 有向图 $G_2$：$V_2=\{A,B,C,D,E\}$，$E_2=\{\langle A,B \rangle,\langle A,C \rangle,\langle A,D \rangle,\langle A,E \rangle,\langle B,A \rangle,\langle B,C \rangle,\langle B,E \rangle,\langle C,D \rangle\}$。

![无向图与有向图](/notes-assets/dsa6-01-directed-vs-undirected.jpg)

*无向图的边是无序对，有向图的边是有序对——这是两者一切差异的源头。*

#### 简单图与多重图

**简单图**：既不存在重复边，也不存在顶点到自身的边。

**多重图**：某两个顶点之间的边数多于一条，或存在顶点通过同一条边和自己关联。

![简单图与多重图](/notes-assets/dsa6-02-simple-vs-multigraph.jpg)

> **约定**：除非特别说明，数据结构中讨论的都是**简单图**，本章的所有算法与性质同样只针对简单图。多重图在现实中确实存在（例如两地之间的多条交通路线），但它不属于本章的核心范围。

#### 顶点的度与握手定理

**度**刻画一个顶点"连了多少边"，有向图中还要区分方向：

| 图类型 | 度的定义 | 公式 |
| :--- | :--- | :--- |
| **无向图** | 依附于该顶点的边的条数，记为 $TD(v)$ | $\sum TD(v_i) = 2\lvert E\rvert$ |
| **有向图** | 入度 $ID(v)$（以 $v$ 为终点）与出度 $OD(v)$（以 $v$ 为起点） | $TD(v)=ID(v)+OD(v)$，$\sum ID = \sum OD = \lvert E\rvert$ |

![顶点的度](/notes-assets/dsa6-03-vertex-degree.jpg)

> **握手定理**：在具有 $n$ 个顶点、$e$ 条边的无向图中
>
> $$
> \sum_{i=1}^{n}TD(v_i)=2e
> $$
>
> 在有向图中则有两端各自守恒的关系：$\sum_{i=1}^{n}ID(v_i)=\sum_{i=1}^{n}OD(v_i)=e$。这是图论最基本的定理：**每条边给两个端点各贡献 1 度**，所以度数之和必须是偶数。它常用来判断一个度序列能否构成图，以及由部分顶点的度反推未知顶点数。

> **例 1（由握手定理求最少顶点数）**
> 一个无向图有 16 条边，其中 3 个顶点的度为 4，4 个顶点的度为 3，其余顶点的度都小于 3。问该图至少有多少个顶点？

**思路**：由握手定理得度数之和为 $2 \times 16 = 32$；先减去已知顶点的度数和，剩余度数由"度 ≤ 2"的顶点分摊。要求顶点数**最少**，就要让每个剩余顶点**尽量满**，即每个取度数上限 2。

**解**：已知部分度数和为 $3 \times 4 + 4 \times 3 = 24$，剩余 $32 - 24 = 8$ 度。其余顶点度小于 3，即最多为 2，故至少需要 $\lceil 8/2 \rceil = 4$ 个顶点。总顶点数至少为 $3 + 4 + 4 = 11$。

> **易错点**：求"至少"要往**最满**的方向想——每个剩余顶点度数取最大（2），才能用最少的顶点凑够剩余度数；反过来求"至多"则取最小（度为 0）。另外，"度均小于 3"的严格表述是"度 ≤ 2"，不要误当成"≤ 3"。

#### 完全图、稀疏图与稠密图

完全图是边数的上限，也是判断"稠密/稀疏"的参照系：

| 类型 | 无向图边数 | 有向图边数 |
| :--- | :--- | :--- |
| **完全图** | $\lvert E\rvert = \binom{n}{2} = \frac{n(n-1)}{2}$ | $\lvert E\rvert = 2\binom{n}{2} = n(n-1)$ |
| **稀疏图** | $\lvert E\rvert < n\log n$（经验准则） | 同上 |
| **稠密图** | 边数接近完全图 | 同上 |

完全图的边数给了我们一把尺子：稀疏图的边数远小于它（经验准则是 $|E| < n\log n$，注意这个不等式里的对数以 2 为底），稠密图的边数则接近 $n(n-1)/2$。存储结构的选型完全取决于这个分类，后面的"稠密用矩阵、稀疏用邻接表"就是从这张表直接推出来的。

### 顶点间的关系与图的连通性

#### 路径、回路与子图

- **路径**：顶点 $V_p$ 到 $V_q$ 的顶点序列 $V_p, V_{i_1}, V_{i_2}, \dots, V_{i_m}, V_q$；
- **回路**（环）：第一个顶点和最后一个顶点相同的路径；
- **简单路径**：路径序列中顶点不重复的路径；
- **简单回路**：除第一个和最后一个顶点外，其余顶点不重复的回路；
- **路径长度**：无权图上等于路径的边数，带权图上等于路径上所有边的权值之和；
- **距离**：从 $u$ 到 $v$ 的最短路径长度，若不存在则记为 $\infty$。

**子图**的定义是"顶点集和边集都取子集"：设有两个图 $G=(V,E)$ 和 $G'=(V',E')$，若 $V' \subseteq V$ 且 $E' \subseteq E$，则称 $G'$ 是 $G$ 的子图。若进一步有 $V'=V$，则称 $G'$ 为 $G$ 的**生成子图**。

![子图](/notes-assets/dsa6-04-subgraph.jpg)

"子图"与"生成子图"的区别只在顶点集：生成子图**必须包含全部顶点**，边可以少。这一点是生成树与生成森林概念的源头。

#### 连通性、连通分量与生成树

连通性是把图"分成几块"的语言：

| 概念 | 无向图 | 有向图 |
| :--- | :--- | :--- |
| 两点连通 | 从 $u$ 到 $v$ 有路径 | — |
| 两点强连通 | — | 从 $u$ 到 $v$ **且** 从 $v$ 到 $u$ 都有路径 |
| 图的连通 | 任意两点都连通 | 任意两点都强连通 |

有向图的"强连通"比无向图的"连通"苛刻得多：必须**双向可达**。因此有向图的强连通分量分析比无向图的连通分量复杂得多。

在这套语言之上，四个层层递进的概念是：

**连通分量**：无向图中的**极大连通子图**——再加一个顶点进来就不连通了。

**强连通分量**：有向图中的极大强连通子图。

**生成树**：包含全部顶点的**极小连通子图**——边尽可能少但依然连通，$n$ 个顶点的生成树恰好有 $n-1$ 条边。

**生成森林**：非连通图中，各个连通分量的生成树合起来构成的森林。

![连通分量与生成树](/notes-assets/dsa6-05-connected-components-spanning-tree.jpg)

"极大"与"极小"是两个相反的方向：连通分量要求**顶点尽量多**（把能连的都连进来），生成树要求**边尽量少**（去掉任意一条边就不再连通）。这两个词看着像，含义正好相反。

#### 连通图边数的极值

一张 $n$ 个顶点的图，边多边少各有一个临界值：

| 条件 | 无向图 | 有向图（强连通） |
| :--- | :--- | :--- |
| 最少边数（连通） | $n-1$ | $n$（恰好形成回路） |
| 最多边数（非连通） | $\binom{n-1}{2}$ | — |

> **树与图的关系**：树是一种特殊的图——不存在回路且连通的无向图。$n$ 个顶点的树必有 $n-1$ 条边，因此 $n$ 个顶点的图若 $|E| > n-1$ 则**必有回路**。这是判断图是否含环的充分条件，但不是必要条件——有环的图也可能恰好只有 $n-1$ 条边。

> **例 1（保证连通的最少边数）**
> $n = 6$ 个顶点的无向图，至少要有多少条边，才能保证无论边如何分布图都连通？

**思路**：考虑最坏情况——前 $n-1$ 个顶点构成完全图，此时第 $n$ 个顶点孤立在一边；再添任意一条边，它必然连到第 $n$ 个顶点，全图随即连通。

**解**：前 5 个顶点构成完全图需要 $\binom{5}{2} = 10$ 条边，再加 1 条边连向第 6 个顶点，共 $10 + 1 = 11$ 条边。

验证：10 条边时可以构造"5 顶点完全图 + 1 个孤立点"，图不连通；11 条边时若图仍不连通，则必有一个连通分量顶点数 ≤ 5，其边数 ≤ $\binom{5}{2} = 10 < 11$，矛盾，故必连通。

> **易错点**：公式 $\binom{n-1}{2} + 1$ 是"保证连通"的充要边数，与"连通图最少 $n-1$ 条边"是**两个不同的问题**：$n-1$ 条边只保证"存在一种连通的画法"，不保证"任意画法都连通"。做题时先分清问的是"至少"还是"保证"。

### 带权图

#### 权

边上标有的、具有某种含义的数值（距离、成本、时间等）。

#### 带权图（网）

边上带有权值的图。

#### 带权路径长度

一条路径上所有边的权值之和。

带权图是后面所有应用（最小生成树、最短路径、关键路径）的载体：权值赋予边"代价"的含义，于是所有算法目标都变成同一个——**使总代价最小或最大**。

## 图的存储结构

图的四种存储结构按"是否显式存边"分成两派。**邻接矩阵**用二维数组存下所有可能的边，代价是空间 $O(\lvert V\rvert^2)$，换来的是判边 $O(1)$ 与表示唯一；**邻接表**只存实际存在的边，空间降到 $O(\lvert V\rvert+\lvert E\rvert)$，代价是查找变慢、表示不唯一。**十字链表**与**邻接多重表**则分别针对有向图查入边、无向图删边的痛点做了优化。

一句话记住选型：**稠密用矩阵、稀疏用邻接表**。本节最后给出六种组合（矩阵/邻接表 × 无向/带权无向/带权有向）的完整实现。

### 邻接矩阵

顶点数为 $n$ 的图 $G=(V,E)$ 的**邻接矩阵** $A$ 是一个 $n \times n$ 的方阵：

$$
A[i][j] = \begin{cases} 1, & \text{若 }(v_i,v_j)\text{ 或 }\langle v_i,v_j\rangle \in E(G) \\ 0, & \text{否则} \end{cases}
$$

```c
const int MaxVertexNum = 100;
struct MGraph {
    char Vex[MaxVertexNum];                 // 顶点表
    int Edge[MaxVertexNum][MaxVertexNum];   // 邻接矩阵，边表
    int vexnum, arcnum;                     // 顶点数和边数
};
```

![邻接矩阵](/notes-assets/dsa6-06-adjacency-matrix.jpg)

带权图（网）的邻接矩阵中，$A[i][j]$ 存放边的权值，不存在的边用无穷大表示：

```c
#define INFINITY INT_MAX
typedef char VertexType;
typedef int EdgeType;

struct MGraph {
    VertexType Vex[MaxVertexNum];
    EdgeType Edge[MaxVertexNum][MaxVertexNum];
    int vexnum, arcnum;
};
```

邻接矩阵的性质有四条，每一条都直接决定了它的适用场景：

1. **求度**：无向图第 $i$ 个顶点的度 = 第 $i$ 行（或第 $i$ 列）的非零元素个数；有向图的入度 = 第 $i$ 列的非零元素个数，出度 = 第 $i$ 行的非零元素个数。时间复杂度 $O(|V|)$。
2. **路径计数**：设图 $G$ 的邻接矩阵为 $A$，则 $A^n$ 的元素 $A^n[i][j]$ 等于由顶点 $i$ 到顶点 $j$ 的长度为 $n$ 的路径数目。
3. 无向图的邻接矩阵一定是对称矩阵，可以只存上三角或下三角来压缩存储。
4. 空间复杂度 $O(|V|^2)$，**只和顶点数相关、与边数无关**，因此适合存储**稠密图**。

> **注意**：邻接矩阵的空间代价是刚性的。对稀疏图（例如 $|E| \approx |V|$）来说，矩阵里绝大多数位置都是零，空间利用率极低，这时应当改用邻接表。

> **例 1（邻接矩阵的路径计数）**
> 一个无向图只有 3 个顶点，边为 $(v_1,v_2)$、$(v_2,v_3)$。写出邻接矩阵 $A$，求 $A^2$，并解释 $A^2[2][2]$ 与 $A^2[1][3]$ 的含义。

**思路**：$A[i][j]=1$ 表示存在边；$A^2$ 的元素是"行向量 × 列向量"的点积，统计的是**经过一个中转顶点**的路径数。

**解**：

$$
A = \begin{pmatrix} 0 & 1 & 0 \\ 1 & 0 & 1 \\ 0 & 1 & 0 \end{pmatrix}, \quad A^2 = \begin{pmatrix} 1 & 0 & 1 \\ 0 & 2 & 0 \\ 1 & 0 & 1 \end{pmatrix}
$$

- $A^2[1][3] = 1$：从 $v_1$ 到 $v_3$ 的长度为 2 的路径有 1 条，即 $v_1 \to v_2 \to v_3$；
- $A^2[2][2] = 2$：从 $v_2$ 出发回到 $v_2$ 的长度为 2 的路径有 2 条，即 $v_2 \to v_1 \to v_2$ 与 $v_2 \to v_3 \to v_2$。

> **为什么成立**：$A^2[i][j] = \sum_k A[i][k]A[k][j]$，只有"$i$ 到 $k$ 有边且 $k$ 到 $j$ 有边"时才贡献 1，这里的 $k$ 就是中转顶点。这个性质是路径计数问题的通解，也隐含了 Floyd 算法"允许中转顶点"的思想雏形。

### 邻接表

邻接表为每个顶点维护一条链表，链表中的结点就是该顶点的所有邻接顶点——因而**只存实际存在的边**：

```c
struct ArcNode {            // 边/弧结点
    int adjvex;             // 边/弧指向哪个顶点
    struct ArcNode *next;   // 指向下一条弧的指针
    // InfoType info;       // 边权值
};

struct VNode {              // 顶点结点
    VertexType data;        // 顶点信息
    ArcNode *first;         // 第一条边/弧
} AdjList[MaxVertexNum];

struct ALGraph {            // 邻接表
    AdjList vertices;
    int vexnum, arcnum;
};
```

![邻接表](/notes-assets/dsa6-07-adjacency-list.jpg)

邻接表的性能特征如下：

| 指标 | 无向图 | 有向图 |
| :--- | :--- | :--- |
| 边结点数量 | $2\lvert E\rvert$（每条边存两次） | $\lvert E\rvert$ |
| 空间复杂度 | $O(\lvert V\rvert+2\lvert E\rvert)$ | $O(\lvert V\rvert+\lvert E\rvert)$ |
| 求度 | 遍历该顶点的链表，$O(1)\sim O(\lvert V\rvert)$ | 出度方便，入度需遍历全表 |
| 表示唯一性 | **不唯一**（链表顺序任意） | **不唯一** |

> **注意**：无向图的每条边要存两次（$u$ 的链表里存 $v$，$v$ 的链表里存 $u$），因此边结点数为 $2|E|$；有向图每条弧只存一次（存在弧尾的链表中）。这个"存几次"的差异直接影响空间复杂度，也直接影响删边、删除顶点等操作的实现难度。邻接表最大的短板是**难以查找有向图的入边**，计算入度必须遍历整张表。

### 十字链表

十字链表是专为**有向图**设计的链式存储结构，它同时解决了出边与入边的快速查找问题。

#### 弧结点

包含五个域：`tailvex`（弧尾编号）、`headvex`（弧头编号）、`hlink`（弧头相同的下一条弧）、`tlink`（弧尾相同的下一条弧）、`info`（权值）。

#### 顶点结点

包含三个域：`data`（顶点信息）、`firstin`（作为弧头的第一条弧）、`firstout`（作为弧尾的第一条弧）。

![十字链表](/notes-assets/dsa6-08-orthogonal-list.jpg)

- 空间复杂度 $O(|V|+|E|)$；
- 同时方便找出边和入边——沿 `firstout` 顺着 `tlink` 链可以枚举出边，沿 `firstin` 顺着 `hlink` 链可以枚举入边。

### 邻接多重表

邻接多重表是专为**无向图**设计的链式存储结构：每条边只存一个结点，从而解决了邻接表中"删一条边要找两个边结点"的问题。

#### 边结点

包含五个域：`i`、`j`（两个顶点编号）、`ilink`（依附于 $i$ 的下一条边）、`jlink`（依附于 $j$ 的下一条边）、`info`（权值）。

#### 顶点结点

包含两个域：`data`（顶点信息）、`firstedge`（第一条边）。

![邻接多重表](/notes-assets/dsa6-09-adjacency-multilist.jpg)

- 空间复杂度 $O(|V|+|E|)$；
- 删边时只需找到该边结点并断开它挂着的两条链，是 $O(1)$ 级别的操作；而邻接表必须同时删除两个方向上的结点。

#### 四种存储结构的对比与选型

| 存储结构 | 空间复杂度 | 找相邻边 | 删除边/顶点 | 适用 | 表示唯一性 |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **邻接矩阵** | $O(\lvert V\rvert^2)$ | $O(\lvert V\rvert)$，遍历一整行 | 删边 $O(1)$，删顶点需移动大量数据 | **稠密图** | 唯一 |
| **邻接表** | $O(\lvert V\rvert+\lvert E\rvert)$ | 出边 $O(1)\sim O(\lvert V\rvert)$，入边需遍历 | 不方便 | **稀疏图** | 不唯一 |
| **十字链表** | $O(\lvert V\rvert+\lvert E\rvert)$ | 出边与入边都方便 | 方便 | 有向图 | 不唯一 |
| **邻接多重表** | $O(\lvert V\rvert+\lvert E\rvert)$ | 方便 | 方便 | 无向图 | 不唯一 |

> **选型口诀**：
> - 稠密图 / 需要 $O(1)$ 判断边是否存在 → **邻接矩阵**；
> - 稀疏图 / 内存受限 / 主要遍历出边 → **邻接表**（最常用）；
> - 有向图且频繁查询入边与出边 → **十字链表**；
> - 无向图且频繁删边 → **邻接多重表**。

### 图的基本操作

同一种操作在不同的存储结构上代价不同，这些差异最终决定遍历算法的复杂度：

| 操作 | 函数原型 | 邻接矩阵 | 邻接表 |
| :--- | :--- | :---: | :---: |
| 判断边存在 | `Adjacent(G,x,y)` | $O(1)$ | $O(1)\sim O(\lvert V\rvert)$ |
| 列出邻接边 | `Neighbors(G,x)` | $O(\lvert V\rvert)$ | 出边 $O(1)\sim O(\lvert V\rvert)$ |
| 插入顶点 | `InsertVertex(G,x)` | $O(\lvert V\rvert)$（增行列） | $O(1)$ |
| 删除顶点 | `DeleteVertex(G,x)` | $O(\lvert V\rvert)$ | $O(\lvert E\rvert)$（需删所有关联边） |
| 添加边 | `AddEdge(G,x,y)` | $O(1)$ | $O(1)\sim O(\lvert V\rvert)$ |
| 找第一个邻接点 | `FirstNeighbor(G,x)` | $O(1)\sim O(\lvert V\rvert)$ | $O(1)$（出边） |
| 找下一个邻接点 | `NextNeighbor(G,x,y)` | $O(1)\sim O(\lvert V\rvert)$ | $O(1)$ |

邻接矩阵"判边 $O(1)$"是它不可替代的优势；邻接表则胜在遍历邻接点与空间占用。

#### 邻接矩阵与邻接表的完整实现

下面六段代码覆盖矩阵/邻接表 × 无向/带权无向/带权有向六种组合，可以直接当作基础模板使用。

**邻接矩阵——无向图**

```c
typedef enum { OK = 1, ERROR = 0 } Status;

typedef struct {
    int** matrix;    // matrix[i][j] = 1 表示 i-j 存在边
    int size;        // 顶点数
    int edgeCount;   // 边数
} MGraph;

// CreateGraph —— 动态分配 n×n 邻接矩阵
MGraph* CreateGraph(int size) {
    if (size <= 0) return NULL;
    MGraph* g = (MGraph*)malloc(sizeof(MGraph));
    g->size = size; g->edgeCount = 0;
    g->matrix = (int**)malloc(size * sizeof(int*));
    for (int i = 0; i < size; i++) {
        g->matrix[i] = (int*)calloc(size, sizeof(int));
    }
    return g;
}

// AddEdge —— 无向图对称设置
Status AddEdge(MGraph* g, int u, int v) {
    if (g == NULL || u < 0 || u >= g->size || v < 0 || v >= g->size || u == v)
        return ERROR;
    if (g->matrix[u][v] == 1) return ERROR;  // 重边检测
    g->matrix[u][v] = g->matrix[v][u] = 1;
    g->edgeCount++;
    return OK;
}

// GetDegree —— 统计行中非零元素个数
int GetDegree(MGraph* g, int v) {
    if (g == NULL || v < 0 || v >= g->size) return -1;
    int deg = 0;
    for (int i = 0; i < g->size; i++)
        if (g->matrix[v][i] != 0) deg++;
    return deg;
}

// DestroyGraph —— 双指针释放，由内向外
void DestroyGraph(MGraph** pg) {
    if (pg == NULL || *pg == NULL) return;
    for (int i = 0; i < (*pg)->size; i++) free((*pg)->matrix[i]);
    free((*pg)->matrix);
    free(*pg);
    *pg = NULL;
}
```

**邻接矩阵——带权无向图**

```c
typedef struct {
    int** matrix;    // matrix[i][j] != 0 表示边的权值
    int size;
    int edgeCount;
} WGraph;

// AddEdge —— 带权边，需要 w > 0
Status AddEdge(WGraph* g, int u, int v, int w) {
    if (g == NULL || u < 0 || u >= g->size || v < 0 || v >= g->size
        || u == v || w <= 0) return ERROR;
    if (g->matrix[u][v] != 0) return ERROR;
    g->matrix[u][v] = g->matrix[v][u] = w;
    g->edgeCount++;
    return OK;
}

// GetWeight —— 返回边的权值
int GetWeight(WGraph* g, int u, int v) {
    if (g == NULL || u < 0 || u >= g->size || v < 0 || v >= g->size)
        return -1;
    return g->matrix[u][v];
}
```

**邻接矩阵——带权有向图**

```c
typedef struct {
    int** matrix;    // matrix[i][j] != 0 表示从 i 到 j 的有向边权值
    int size;
    int edgeCount;
} WDGraph;

// GetOutDegree —— 统计第 v 行非零元素个数
int GetOutDegree(WDGraph* g, int v) {
    if (g == NULL || v < 0 || v >= g->size) return -1;
    int deg = 0;
    for (int i = 0; i < g->size; i++)
        if (g->matrix[v][i] != 0) deg++;
    return deg;
}

// GetInDegree —— 统计第 v 列非零元素个数
int GetInDegree(WDGraph* g, int v) {
    if (g == NULL || v < 0 || v >= g->size) return -1;
    int deg = 0;
    for (int i = 0; i < g->size; i++)
        if (g->matrix[i][v] != 0) deg++;
    return deg;
}
```

**邻接表——无向图**

```c
typedef struct AdjNode {
    int vertex;
    struct AdjNode* next;
} AdjNode;

typedef struct {
    AdjNode** heads;     // 顶点指针数组
    int size;
    int edgeCount;
} ALGraph;

// AddEdgeHead —— 头插法 O(1)，每条无向边插入两次
Status AddEdgeHead(ALGraph* g, int u, int v) {
    if (g == NULL || u < 0 || u >= g->size || v < 0 || v >= g->size || u == v)
        return ERROR;
    // 插入 u->v
    AdjNode* node1 = (AdjNode*)malloc(sizeof(AdjNode));
    node1->vertex = v; node1->next = g->heads[u]; g->heads[u] = node1;
    // 插入 v->u
    AdjNode* node2 = (AdjNode*)malloc(sizeof(AdjNode));
    node2->vertex = u; node2->next = g->heads[v]; g->heads[v] = node2;
    g->edgeCount++;
    return OK;
}

// RemoveEdge —— prev 指针追踪删除
Status RemoveEdge(ALGraph* g, int u, int v) {
    if (g == NULL || u < 0 || u >= g->size || v < 0 || v >= g->size)
        return ERROR;
    // 删除 u->v
    AdjNode *cur = g->heads[u], *prev = NULL;
    while (cur != NULL && cur->vertex != v) { prev = cur; cur = cur->next; }
    if (cur == NULL) return ERROR;
    if (prev) prev->next = cur->next; else g->heads[u] = cur->next;
    free(cur);
    // 删除 v->u（同上，略）
    g->edgeCount--;
    return OK;
}

// DestroyGraph —— 释放所有链表结点
void DestroyGraph(ALGraph** pg) {
    if (pg == NULL || *pg == NULL) return;
    for (int i = 0; i < (*pg)->size; i++) {
        AdjNode* p = (*pg)->heads[i];
        while (p != NULL) { AdjNode* t = p; p = p->next; free(t); }
    }
    free((*pg)->heads); free(*pg); *pg = NULL;
}
```

**邻接表——带权无向图**

```c
typedef struct WAdjNode {
    int vertex;
    int weight;
    struct WAdjNode* next;
} WAdjNode;

typedef struct {
    WAdjNode** heads;
    int size;
    int edgeCount;
} WALGraph;
```

**邻接表——带权有向图**

```c
typedef struct WDAdjNode {
    int vertex;
    int weight;
    struct WDAdjNode* next;
} WDAdjNode;

typedef struct {
    WDAdjNode** heads;
    int size;
    int edgeCount;
} WDALGraph;

// AddEdge —— 有向边仅插入一次（头插法）
Status AddEdge(WDALGraph* g, int u, int v, int w) {
    if (g == NULL || u < 0 || u >= g->size || v < 0 || v >= g->size)
        return ERROR;
    // 检测重边
    WDAdjNode* cur = g->heads[u];
    while (cur) { if (cur->vertex == v) return ERROR; cur = cur->next; }
    WDAdjNode* node = (WDAdjNode*)malloc(sizeof(WDAdjNode));
    node->vertex = v; node->weight = w;
    node->next = g->heads[u]; g->heads[u] = node;  // 头插法
    g->edgeCount++;
    return OK;
}
```

**邻接矩阵与邻接表的取舍**

| 对比维度 | 邻接矩阵 | 邻接表 |
| :--- | :--- | :--- |
| **空间** | $O(\lvert V\rvert^2)$，与边数无关 | $O(\lvert V\rvert+\lvert E\rvert)$，与边数成正比 |
| **判断边存在** | $O(1)$（直接索引） | $O(1)\sim O(\lvert V\rvert)$（遍历链表） |
| **遍历所有边** | $O(\lvert V\rvert^2)$（必须扫描全矩阵） | $O(\lvert V\rvert+\lvert E\rvert)$（只遍历存在的边） |
| **适用场景** | 稠密图、频繁判定边存在 | 稀疏图、频繁遍历邻接点 |
| **实现复杂度** | 低（二维数组） | 中（链表操作、`prev` 指针） |
| **销毁模式** | 释放每一行 + 矩阵 + 结构体 | 释放每个链表的所有结点 + heads + 结构体 |

> **实际编码时的经验**：顶点数不超过 100 时，邻接矩阵最省事——边操作直观、代码简短、不用处理指针。顶点数大而边稀疏时改用邻接表，空间从 $O(n^2)$ 降到 $O(n+e)$。两种实现都值得掌握：同一个算法要求挂在哪种存储结构上，代码写法差别很大。

## 图的遍历

**遍历**是图算法的通用前置操作：BFS 用**队列**逐层扩散（先近后远），DFS 用**栈或递归**一路到底（先深后广）。与树的遍历不同，图可能存在回路，搜索相邻顶点时可能撞上已经访问过的顶点，因此必须引入 **visited 访问标记数组**。

遍历的副产品是生成树或生成森林；而"BFS 求无权最短路径""DFS 环检测"这类进阶应用，直接成为后面最小生成树与最短路径各算法的基石。

### 广度优先遍历（BFS）

**BFS**（Breadth First Search）在树上的对应物就是层次遍历，在图上则是"从起点开始，一圈一圈向外扩散"。算法借助队列的 FIFO 特性保证：**先被访问的顶点，其邻接点也先被访问**——于是顶点按"距离源点由近及远"的层次顺序输出。

![广度优先遍历](/notes-assets/dsa6-10-bfs.jpg)

**邻接矩阵版**：

```c
void BFS(MGraph* g, int start, int* seq, int* cnt) {
    if (g == NULL || start < 0 || start >= g->size) { *cnt = 0; return; }
    int q[g->size];                              // 数组模拟队列
    int visited[g->size];
    for (int i = 0; i < g->size; i++) visited[i] = 0;
    int front = 0, rear = 0;
    seq[(*cnt)++] = start;
    visited[start] = 1;
    q[rear++] = start;
    while (front != rear) {
        int cur = q[front++];
        for (int i = 0; i < g->size; i++) {
            if (g->matrix[cur][i] && !visited[i]) {
                seq[(*cnt)++] = i;
                visited[i] = 1;                  // 入队时立即标记
                q[rear++] = i;
            }
        }
    }
}
```

![BFS 遍历过程（一）](/notes-assets/dsa6-11-1-bfs-trace.jpg)

![BFS 遍历过程（二）](/notes-assets/dsa6-11-2-bfs-trace.jpg)

**邻接表版**：

```c
void BFS(ALGraph* g, int start, int* seq, int* cnt) {
    if (g == NULL || start < 0 || start >= g->size) { *cnt = 0; return; }
    int queue[g->size], visited[g->size];
    for (int i = 0; i < g->size; i++) visited[i] = 0;
    int front = 0, rear = 0;
    seq[(*cnt)++] = start; visited[start] = 1; queue[rear++] = start;
    while (front < rear) {
        int cur = queue[front++];
        for (AdjNode* p = g->heads[cur]; p != NULL; p = p->next) {
            if (!visited[p->vertex]) {
                seq[(*cnt)++] = p->vertex;
                visited[p->vertex] = 1;
                queue[rear++] = p->vertex;
            }
        }
    }
}
```

> **关键细节**：标记 `visited` 要放在**入队时**，而不是出队时。如果等到出队才标记，同一个顶点会被它的多个邻接点重复入队——在它真正出队之前，每个先出队的邻居都会看到它"尚未访问"。

**性能分析**：

| 存储结构 | 时间复杂度 | 空间复杂度 |
| :--- | :---: | :---: |
| 邻接矩阵 | $O(\lvert V\rvert^2)$ | $O(\lvert V\rvert)$（队列） |
| 邻接表 | $O(\lvert V\rvert+\lvert E\rvert)$ | $O(\lvert V\rvert)$（队列） |

### 深度优先遍历（DFS）

**DFS**（Depth First Search）在树上的对应物是先根遍历。算法沿着一条路径一直走到底，无路可走时回溯，再换一个分支继续——本质是**递归 + 回溯**。

![深度优先遍历](/notes-assets/dsa6-13-dfs.jpg)

**邻接矩阵版**：

```c
static void DFSHelper(MGraph* g, int v, int* seq, int* cnt, int* visited) {
    seq[(*cnt)++] = v;
    visited[v] = 1;
    for (int i = 0; i < g->size; i++)
        if (g->matrix[v][i] && !visited[i])
            DFSHelper(g, i, seq, cnt, visited);
}

void DFS(MGraph* g, int start, int* seq, int* cnt) {
    if (g == NULL || start < 0 || start >= g->size) { *cnt = 0; return; }
    int visited[g->size];
    for (int i = 0; i < g->size; i++) visited[i] = 0;
    *cnt = 0;
    DFSHelper(g, start, seq, cnt, visited);
}
```

![DFS 遍历过程（一）](/notes-assets/dsa6-14-1-dfs-trace.jpg)

![DFS 遍历过程（二）](/notes-assets/dsa6-14-2-dfs-trace.jpg)

**邻接表版**：

```c
static void DFSHelper(ALGraph* g, int v, int* seq, int* cnt, int* visited) {
    seq[(*cnt)++] = v;
    visited[v] = 1;
    int neighbors[g->size];
    int nCnt = GetNeighbors(g, v, neighbors);  // 获取排序后的邻居列表
    for (int i = 0; i < nCnt; i++)
        if (!visited[neighbors[i]])
            DFSHelper(g, neighbors[i], seq, cnt, visited);
}

void DFS(ALGraph* g, int start, int* seq, int* cnt) {
    if (g == NULL || start < 0 || start >= g->size) { *cnt = 0; return; }
    int visited[g->size];
    for (int i = 0; i < g->size; i++) visited[i] = 0;
    *cnt = 0;
    DFSHelper(g, start, seq, cnt, visited);
}
```

**性能分析**：

| 存储结构 | 时间复杂度 | 空间复杂度 |
| :--- | :---: | :---: |
| 邻接矩阵 | $O(\lvert V\rvert^2)$ | $O(\lvert V\rvert)$（递归栈深度） |
| 邻接表 | $O(\lvert V\rvert+\lvert E\rvert)$ | $O(\lvert V\rvert)$（递归栈深度） |

> **注意**：DFS 的递归深度有风险。最坏情况（图退化成一条单链）递归深度可达 $O(|V|)$，可能造成栈溢出，这时应当用显式栈把递归改写成非递归版本。


#### BFS 与 DFS 的对比

| 对比维度 | BFS | DFS |
| :--- | :--- | :--- |
| **数据结构** | 队列（FIFO） | 栈（递归隐式或显式） |
| **遍历方式** | 逐层扩散（先近后远） | 一路到底（先深后广） |
| **生成树** | 广度优先生成树（矮胖） | 深度优先生成树（高瘦） |
| **无权最短路径** | 天然支持（先访问即距离最短） | 不保证最短 |
| **连通分量** | 可以 | 可以 |
| **环检测** | 可以（但 DFS 更自然） | 可以（3 色标记法） |
| **拓扑排序** | 可以（Kahn 算法） | 可以（DFS 后序） |
| **迷宫求解** | 求最短路径 | 求任意一条路径 |

选型可以归纳成四句话：

- 求**无权图最短路径** → BFS，只有它能保证先访问的顶点距离更短；
- 求**连通分量 / 环检测** → DFS，递归实现的代码更简洁；
- 求**拓扑排序** → 两者皆可（Kahn 是 BFS 思想，后序法是 DFS 思想）；
- 图**很大很深** → 优先 BFS，避免 DFS 的递归栈溢出。

> **例 1（BFS 遍历序列与最短距离）**
> 一张无向图的顶点为 1~6，边为 $(1,2)$、$(1,3)$、$(2,4)$、$(2,5)$、$(3,5)$、$(4,6)$、$(5,6)$。从顶点 1 出发做 BFS，写出访问序列，并求 1 到 6 的最短路径长度。

**思路**：队列按入队顺序出队访问；BFS 首次访问到某个顶点时经过的边数，就是它到源点的最短距离。

**解**：访问序列为 **1, 2, 3, 4, 5, 6**。

- 1 出队，发现 2、3（距离 1），入队；
- 2 出队，发现 4、5（距离 2），入队；
- 3 出队，它的邻接点 1、5 都已被访问；
- 4 出队，发现 6（距离 3），入队；
- 5、6 依次出队，其邻接点均已被访问。

1 到 6 的最短路径长度为 **3**（例如 $1 \to 2 \to 4 \to 6$）。

> **评注**：BFS 的"逐层扩散"保证**首次访问即最短**，这是它能求无权图最短路径的根本原因。另外要注意，访问序列与邻接表的存储顺序有关：某个顶点的邻接链表顺序不同，序列可能不同（例如先访问 3 再访问 2），但**层次关系不变**。

> **例 2（DFS 遍历序列）**
> 仍用上面那张图（顶点 1~6），从顶点 1 出发做 DFS，约定邻接点按编号升序访问，写出访问序列，并与 BFS 序列对比。

**思路**：每到达一个顶点，先访问它，再递归访问它编号最小的、尚未访问的邻接点；无路可走时回溯。

**解**：访问序列为 **1, 2, 4, 6, 5, 3**。

- 从 1 出发，编号最小的未访问邻接点是 2；
- 2 的邻接点为 1、4、5，选 4；
- 4 的邻接点为 2、6，选 6；
- 6 的邻接点为 4、5，选 5；
- 5 的邻接点为 2、3、6，其中 **3 尚未访问**，于是访问 3；
- 3 的邻接点 1、5 都已访问，回溯到 5，再依次回溯到 6、4、2、1，全部顶点都已访问，遍历结束。

对比两种序列：BFS 的 1, 2, 3, 4, 5, 6 按层扩散，序列中相邻访问的顶点之间距离很近；DFS 的 1, 2, 4, 6, 5, 3 是一路走到底再回溯，序列中相邻访问的顶点之间是"路径关系"。

> **评注**：DFS 对"邻接点按编号升序"这个约定很敏感——如果 1 先访问 3，序列会完全不同。题目若不说明邻接顺序，通常默认按编号（或字母序）访问。DFS 的递归结构与括号匹配同构，这也是编译器用 DFS 做括号匹配检查的原因。

### 遍历的进阶应用

#### 非连通图的遍历与连通分量

上面两个函数都只覆盖了起点所在的连通分量。要遍历整张图，必须在外层再套一个循环，对每个尚未访问的顶点各发起一次遍历：

```c
bool visited[MAX_VERTEX_NUM];

void BFSTraverse(Graph G) {
    for (int i = 0; i < G.vexnum; i++) visited[i] = FALSE;
    InitQueue(Q);
    for (int i = 0; i < G.vexnum; i++)
        if (!visited[i])
            BFS(G, i);        // 每个连通分量调用一次 BFS
}

void DFSTraverse(Graph G) {
    for (int i = 0; i < G.vexnum; i++) visited[i] = FALSE;
    for (int i = 0; i < G.vexnum; i++)
        if (!visited[i])
            DFS(G, i);        // 每个连通分量调用一次 DFS
}
```

对无向图而言，**外层循环中调用遍历函数的次数，恰好等于连通分量的个数**。这条性质是"图的体检报告"：一次遍历看能否访问全部顶点，就能判断图是否连通。

```c
// IsConnected —— 从 0 运行 DFS，检查是否所有顶点都被访问
int IsConnected(MGraph* g) {
    if (g == NULL || g->size == 0) return 0;
    int seq[g->size], cnt;
    DFS(g, 0, seq, &cnt);                // 从顶点 0 出发 DFS
    return (cnt == g->size);             // 全部访问 = 连通
}

// GetConnectedComponents —— 统计连通分量个数
int GetConnectedComponents(MGraph* g) {
    if (g == NULL) return -1;
    int visited[g->size];
    for (int i = 0; i < g->size; i++) visited[i] = 0;
    int components = 0;
    for (int i = 0; i < g->size; i++) {
        if (!visited[i]) {
            components++;                // 新连通分量
            int seq[g->size], cnt;
            DFSHelper(g, i, seq, &cnt, visited);  // DFS 标记该分量全部顶点
        }
    }
    return components;
}
```

#### 生成树与遍历序列的唯一性

遍历过程中真正"走路"的那些边（即由已访问顶点指向未访问顶点、使对方首次被访问的边）与全部顶点一起，构成一棵生成树：连通图得到**广度/深度优先生成树**，非连通图则得到**生成森林**。

![广度优先生成树](/notes-assets/dsa6-12-bfs-spanning-tree.jpg)

![深度优先生成树](/notes-assets/dsa6-15-dfs-spanning-tree.jpg)

遍历序列是否唯一，取决于存储结构：**邻接矩阵的表示是唯一的**，所以 BFS/DFS 序列唯一；**邻接表的表示不唯一**（链表结点的先后顺序任意），因此遍历序列也可能不唯一。BFS 生成树的形状是"矮胖"的，DFS 生成树是"高瘦"的——这正是两种遍历策略在结构上的直接投影。

#### 无权图最短路径

BFS 按距离递增的顺序访问顶点——先访问距离 1 的，再访问距离 2 的，以此类推，因此第一次访问到目标顶点时对应的路径一定是最短的。完整的实现（含路径回溯）见后面的 BFS 单源最短路径一节。

#### 无向图环检测

3 色标记法把顶点分成三种状态：0 = 尚未访问，1 = 正在当前 DFS 栈中，2 = 已完成。DFS 过程中若遇到一个状态为 1 的邻接点，说明绕回到了当前路径上的顶点，即存在环：

```c
// 3-color DFS: 0=未访问, 1=当前DFS栈中, 2=已完成
static int HasCycleHelper(ALGraph* g, int v, int parent, int* visited) {
    visited[v] = 1;  // 标记为"正在访问"
    for (AdjNode* p = g->heads[v]; p != NULL; p = p->next) {
        int nb = p->vertex;
        if (nb == parent) continue;           // 跳过父顶点（无向图特有）
        if (visited[nb] == 1) return 1;       // 回到栈中顶点 → 有环
        if (visited[nb] == 0)
            if (HasCycleHelper(g, nb, v, visited)) return 1;
    }
    visited[v] = 2;  // 标记为"已完成"
    return 0;
}

int HasCycle(ALGraph* g) {
    if (g == NULL) return 0;
    int visited[g->size];
    for (int i = 0; i < g->size; i++) visited[i] = 0;
    for (int i = 0; i < g->size; i++)
        if (visited[i] == 0)
            if (HasCycleHelper(g, i, -1, visited)) return 1;
    return 0;
}
```

#### 有向图环检测

即判断是否为 DAG。有向图不需要 `parent` 参数——指向栈中顶点的回边就是环，不存在"父子边"被误判的问题：

```c
static int IsDAGHelper(WDGraph* g, int v, int* visited) {
    visited[v] = 1;
    for (int i = 0; i < g->size; i++) {
        if (g->matrix[v][i] != 0) {
            if (visited[i] == 1) return 1;    // 回边 → 有环
            if (visited[i] == 0)
                if (IsDAGHelper(g, i, visited)) return 1;
        }
    }
    visited[v] = 2;
    return 0;
}

int IsDAG(WDGraph* g) {
    if (g == NULL || g->size == 0) return 0;
    int visited[g->size];
    for (int i = 0; i < g->size; i++) visited[i] = 0;
    for (int i = 0; i < g->size; i++)
        if (visited[i] == 0)
            if (IsDAGHelper(g, i, visited)) return 0;   // 有环
    return 1;  // 无环 = DAG
}
```

> **两者为什么不同**：无向图的 DFS 从 $u$ 走到 $v$ 后，$v$ 看到的第一个"已访问"邻接点就是 $u$。如果不把父顶点排除在外，每一对邻接边都会被误判成环，所以无向图必须带 `parent` 参数跳过它。有向图则不存在这个问题：圆弧是有方向的，从 $u$ 到 $v$ 的弧不会让 $v$ 沿同一条弧回到 $u$，因此凡是能回到"栈中顶点"的边都是真正的回边。

## 最小生成树

最小生成树是图上第一个"最优化"问题：在保证连通的前提下，让选中的边权之和最小。它是"贪心策略在图上的落地"，两种经典算法分别从顶点和边两个角度切入，得到了同一个答案。

### 最小生成树的定义与性质

**最小生成树**（Minimum Spanning Tree，MST）：对于带权连通无向图 $G=(V,E)$，所有生成树中边权之和最小的那一棵。它的三条性质值得单独记下：

- 若连通图本身就是一棵树，那么它的最小生成树就是它自己；
- 最小生成树可能有多棵（当存在权值相等的边时），但**权值之和唯一且最小**；
- 最小生成树的边数一定是 $|V| - 1$。

### Prim 算法：加点法

**思想**：从一个顶点开始，每一轮把"代价最小的新顶点"纳入生成树，直到所有顶点都被纳入。它属于**加点法**——生成树从一个点逐渐"生长"出来，每一步只新增一个顶点和一条边。

![Prim 算法图示](/notes-assets/dsa6-16-prim.jpg)

**邻接矩阵版实现**：

```c
int Prim(WGraph* g, int edges[][3], int* cnt) {
    if (g == NULL || edges == NULL || cnt == NULL) return -1;
    int n = g->size;
    if (n == 0) return -1;
    int inMST[n];
    for (int i = 0; i < n; i++) inMST[i] = 0;
    inMST[0] = 1; // 从顶点 0 开始
    *cnt = 0;
    /* 共 n-1 次选择 */
    for (int k = 0; k < n - 1; k++) {
        int minU = -1, minV = -1, minW = INT_MAX;
        /* 遍历已在 MST 中的顶点 */
        for (int i = 0; i < n; i++) {
            if (!inMST[i]) continue;
            /* 找连接到未加入顶点的最小权边 */
            for (int j = 0; j < n; j++) {
                if (inMST[j] || g->matrix[i][j] == 0) continue;
                int w = g->matrix[i][j];
                if (w < minW || (w == minW && j < minV)
                           || (w == minW && j == minV && i < minU)) {
                    minU = i; minV = j; minW = w;
                }
            }
        }
        if (minU == -1) return -1; // 图不连通
        edges[*cnt][0] = minU;
        edges[*cnt][1] = minV;
        edges[*cnt][2] = minW;
        (*cnt)++;
        inMST[minV] = 1;
    }
    return GetMSTWeight(edges, *cnt); // 返回 MST 总权重
}
```

![Prim 算法流程](/notes-assets/dsa6-17-prim-steps.jpg)

**邻接表版实现**：

```c
int Prim(WALGraph* g, int edges[][3], int* cnt) {
    if (g == NULL || edges == NULL || cnt == NULL) return -1;
    int n = g->size; *cnt = 0;
    int inMST[n];
    for (int i = 0; i < n; i++) inMST[i] = 0;
    inMST[0] = 1;
    for (int k = 0; k < n - 1; k++) {
        int minU = -1, minV = -1, minW = INT_MAX;
        for (int i = 0; i < n; i++) {
            if (!inMST[i]) continue;
            for (WAdjNode* p = g->heads[i]; p != NULL; p = p->next) {
                if (inMST[p->vertex]) continue;
                int w = p->weight;
                if (w < minW || (w == minW && p->vertex < minV))
                    minU = i, minV = p->vertex, minW = w;
            }
        }
        if (minU == -1) return -1;
        edges[*cnt][0] = minU; edges[*cnt][1] = minV;
        edges[*cnt][2] = minW; (*cnt)++;
        inMST[minV] = 1;
    }
    return GetMSTWeight(edges, *cnt);
}
```

上面两版都在每一轮重新扫描"树内顶点到树外顶点的所有边"，所以时间复杂度是 $O(|V|^2)$。**适用场景是边稠密图**：当 $|E|$ 接近 $|V|^2$ 时，$O(|V|^2)$ 反而优于 Kruskal 的 $O(|E|\log|E|)$。

**用 `lowCost[]` 优化**。更常见的写法是用一个 `lowCost[]` 数组记录**每个树外顶点到生成树的最小边权**，再用 `parent[]` 记录这条最小边在树内的那一端。这样每轮只需 $O(V)$ 选出最小值、再用新加入的顶点 $O(V)$ 更新一遍 `lowCost[]`，总复杂度仍为 $O(V^2)$，但常数明显更小，也顺带得到了生成树的边集：

```c
/* lowCost[i]：树外顶点 i 到生成树的最小边权；parent[i] 记录该边在树内的端点 */
int Prim(WDGraph* g, int* parent) {
    int n = g->size;
    int lowCost[n], inMST[n];
    for (int i = 0; i < n; i++) {
        lowCost[i] = (g->matrix[0][i] != 0) ? g->matrix[0][i] : INT_MAX;
        parent[i] = 0;
        inMST[i] = 0;
    }
    inMST[0] = 1;
    int weight = 0;
    for (int k = 1; k < n; k++) {
        int min = INT_MAX, v = -1;
        for (int i = 0; i < n; i++)          /* 选树外 lowCost 最小的顶点 */
            if (!inMST[i] && lowCost[i] < min) min = lowCost[i], v = i;
        if (v == -1) return -1;              /* 图不连通 */
        inMST[v] = 1;
        weight += min;
        for (int i = 0; i < n; i++)          /* 用新顶点更新其余顶点的 lowCost */
            if (!inMST[i] && g->matrix[v][i] != 0 && g->matrix[v][i] < lowCost[i]) {
                lowCost[i] = g->matrix[v][i];
                parent[i] = v;
            }
    }
    return weight;
}
```

> **例 1（Prim 算法演示）**
> 一张带权无向图的顶点为 1~5，边为 $(1,2,3)$、$(1,3,4)$、$(2,3,2)$、$(2,4,6)$、$(3,4,5)$、$(3,5,7)$、$(4,5,1)$（括号内为权值）。从顶点 1 出发用 Prim 算法求最小生成树及其总权。

**思路**：维护一个"已在树中"的顶点集合，每轮只从"连接集合内与集合外的所有边"中挑权值最小的那条加入。

**解**：

| 轮次 | 已入树顶点 | 候选最小边 | 加入 |
| :---: | :--- | :--- | :---: |
| 1 | {1} | $1-2(3) < 1-3(4)$ | $(1,2,3)$ |
| 2 | {1,2} | $2-3(2)$ 最小 | $(2,3,2)$ |
| 3 | {1,2,3} | $3-4(5) < 2-4(6) < 3-5(7)$ | $(3,4,5)$ |
| 4 | {1,2,3,4} | $4-5(1)$ 最小 | $(4,5,1)$ |

生成树总权为 $3 + 2 + 5 + 1 = 11$。

> **评注**：Prim 每一步**只考虑"树内与树外之间"的边**——树内两个顶点之间的边（例如 $1-3$ 的权 4）永远不会被选中，这正是"加点法"不会成环的原因：新加入的顶点在树外，与树之间只有一条边，不可能围出环。

### Kruskal 算法：加边法

**思想**：把所有边按权值从小到大排序，依次试探每一条边；若它的两个端点尚未连通（不在同一个集合里），就把它加入生成树，否则跳过。它属于**加边法**——从小边开始"捡"，用**并查集**判断两端是否已经连通。

![Kruskal 算法图示](/notes-assets/dsa6-18-kruskal.jpg)

**邻接矩阵版实现**：

```c
// 使用简单 Union-Find
static int findParent(int parent[], int x) {
    while (parent[x] != x) x = parent[x];
    return x;
}

int Kruskal(WGraph* g, int edges[][3], int* cnt) {
    if (g == NULL || edges == NULL || cnt == NULL) return -1;
    int parent[g->size];
    int tempEdges[g->edgeCount][3];
    int edgeCnt = 0;
    /* 收集所有边（只取上三角，避免重复） */
    for (int i = 0; i < g->size; i++)
        for (int j = i + 1; j < g->size; j++)
            if (g->matrix[i][j] != 0) {
                tempEdges[edgeCnt][0] = i;
                tempEdges[edgeCnt][1] = j;
                tempEdges[edgeCnt][2] = g->matrix[i][j];
                edgeCnt++;
            }
    /* 按权值冒泡排序 */
    for (int i = 0; i < edgeCnt; i++)
        for (int j = edgeCnt - 1; j > i; j--)
            if (tempEdges[j-1][2] > tempEdges[j][2]) {
                int t0 = tempEdges[j-1][0], t1 = tempEdges[j-1][1], t2 = tempEdges[j-1][2];
                tempEdges[j-1][0] = tempEdges[j][0];
                tempEdges[j-1][1] = tempEdges[j][1];
                tempEdges[j-1][2] = tempEdges[j][2];
                tempEdges[j][0] = t0; tempEdges[j][1] = t1; tempEdges[j][2] = t2;
            }
    /* 初始化并查集 */
    for (int i = 0; i < g->size; i++) parent[i] = i;
    *cnt = 0;
    /* 按权值从小到大选边 */
    for (int i = 0; i < edgeCnt; i++) {
        int rootU = findParent(parent, tempEdges[i][0]);
        int rootV = findParent(parent, tempEdges[i][1]);
        if (rootU != rootV) { // 不在同一集合 → 不会形成环
            parent[rootU] = rootV; // 合并
            edges[*cnt][0] = tempEdges[i][0];
            edges[*cnt][1] = tempEdges[i][1];
            edges[*cnt][2] = tempEdges[i][2];
            (*cnt)++;
        }
    }
    if (*cnt == g->size - 1) return GetMSTWeight(edges, *cnt);
    return -1; // 不连通
}
```

![Kruskal 算法流程（一）](/notes-assets/dsa6-19-1-kruskal-steps.jpg)

![Kruskal 算法流程（二）](/notes-assets/dsa6-19-2-kruskal-steps.jpg)

**邻接表版实现**（使用带优化的并查集）：

```c
/* ---- 并查集（带路径压缩 + 按秩合并） ---- */
typedef struct {
    int* parent;
    int* rank;
    int size;
} UnionFind;

int UFFind(UnionFind* uf, int x) {
    if (uf->parent[x] != x)
        uf->parent[x] = UFFind(uf, uf->parent[x]); // 路径压缩
    return uf->parent[x];
}

Status UFUnion(UnionFind* uf, int x, int y) {
    int rx = UFFind(uf, x), ry = UFFind(uf, y);
    if (rx == ry) return OK;
    /* 按秩合并：秩小的挂到秩大的下面 */
    if (uf->rank[rx] < uf->rank[ry]) uf->parent[rx] = ry;
    else if (uf->rank[rx] > uf->rank[ry]) uf->parent[ry] = rx;
    else { uf->parent[ry] = rx; uf->rank[rx]++; }
    return OK;
}

/* Kruskal 算法（使用 UnionFind） */
int Kruskal(WALGraph* g, int edges[][3], int* cnt) {
    if (g == NULL || edges == NULL || cnt == NULL) return -1;
    // 收集边并冒泡排序（同上，略）
    // ...
    UnionFind uf;
    uf.parent = (int*)malloc(g->size * sizeof(int));
    uf.rank = (int*)calloc(g->size, sizeof(int));
    for (int i = 0; i < g->size; i++) uf.parent[i] = i;
    *cnt = 0;
    for (int i = 0; i < edgeCnt; i++) {
        if (UFFind(&uf, tempEdges[i][0]) != UFFind(&uf, tempEdges[i][1])) {
            UFUnion(&uf, tempEdges[i][0], tempEdges[i][1]);
            edges[*cnt][0] = tempEdges[i][0];
            edges[*cnt][1] = tempEdges[i][1];
            edges[*cnt][2] = tempEdges[i][2];
            (*cnt)++;
        }
    }
    free(uf.parent); free(uf.rank);
    if (*cnt == g->size - 1) return GetMSTWeight(edges, *cnt);
    return -1;
}
```

时间复杂度是 $O(|E|\log|E|)$（由排序主导）；配合并查集后，选边阶段近乎 $O(|E|\cdot \alpha(|V|))$。**适用场景是边稀疏图**——边数少时排序代价小。

> **例 2（Kruskal 算法演示）**
> 仍用 Prim 那一节的同一张图（顶点 1~5，7 条带权边），用 Kruskal 算法求最小生成树，并与 Prim 的结果对照。

**思路**：边按权值排序，从小到大试探；用并查集判断两端是否已连通，不连通才加入。

**解**：边排序后依次为 $(4,5,1)$、$(2,3,2)$、$(1,2,3)$、$(1,3,4)$、$(3,4,5)$、$(2,4,6)$、$(3,5,7)$。

| 候选边 | 两端连通？ | 动作 |
| :--- | :---: | :--- |
| $(4,5,1)$ | 否 | 加入 |
| $(2,3,2)$ | 否 | 加入 |
| $(1,2,3)$ | 否 | 加入 |
| $(1,3,4)$ | **是**（1、3 已同集合） | 跳过 |
| $(3,4,5)$ | 否 | 加入 |
| $(2,4,6)$ | 是 | 跳过 |
| $(3,5,7)$ | 是 | 跳过 |

生成树边集为 $\{(4,5,1),\ (2,3,2),\ (1,2,3),\ (3,4,5)\}$，总权为 $1+2+3+5 = 11$，与 Prim 的结果完全一致。

> **评注**：注意权 4 的边 $(1,3,4)$ 排在权 5 的边 $(3,4,5)$ 之前，却因为会成环而被跳过——**Kruskal 是"宁缺毋滥"的：小的边也可能被放弃，大的边也可能被选中**。并查集判环是关键：两端 Find 结果相同，说明它们已经连通，再加这条边必定成环。两种算法得到同一棵权值之和为 11 的生成树，这也印证了"最小生成树的权值唯一"这一性质。

#### Prim 与 Kruskal 的对比

| 对比维度 | Prim | Kruskal |
| :--- | :--- | :--- |
| **算法类型** | 加点法（选最近的顶点加入） | 加边法（选最小的边加入） |
| **核心数据结构** | `lowCost[]` 或直接扫描 | **并查集** |
| **时间复杂度** | $O(\lvert V\rvert^2)$ | $O(\lvert E\rvert\log\lvert E\rvert)$ |
| **适合图类型** | **稠密图**（$\lvert E\rvert \approx \lvert V\rvert^2$） | **稀疏图**（$\lvert E\rvert \ll \lvert V\rvert^2$） |
| **实现方式** | 每轮选距生成树最近的顶点 | 排序 + 并查集判环 |
| **堆优化** | 可优化至 $O(\lvert E\rvert\log\lvert V\rvert)$ | — |

> **选型建议**：顶点少、边多时用 **Prim**（$O(n^2)$，没有排序开销）；边少、顶点多时用 **Kruskal**（$O(e\log e)$，排序很快）。实际编码时 Prim 通常写朴素版（不配堆），Kruskal 则一律配并查集。

#### Kruskal 的判环工具：并查集

并查集是一种用于处理不相交集合的合并（Union）与查找（Find）的数据结构，它的存储结构正是树一章介绍过的双亲表示法：数组下标表示元素，值表示父结点，根结点的值指向自己。

仅使用**按秩合并**与**路径压缩**两项优化，Find 与 Union 操作的均摊复杂度就能达到 $O(\alpha(n))$，其中 $\alpha$ 是反阿克曼函数——对任何实际可能出现的 $n$，$\alpha(n) \le 4$，因此可以认为它近乎常数时间。前面 `UFFind`（递归路径压缩）与 `UFUnion`（按秩合并）就是并查集的完整优化实现。

Kruskal 算法用并查集判断"加入这条边是否会形成环"，这正是并查集最经典的应用。

## 最短路径算法

最短路径问题按"源点数量"分成两类：**单源**指从一个源点到其余所有顶点（BFS、Dijkstra、Bellman-Ford），**多源**指所有顶点对之间（Floyd）。四个算法构成一条"条件递增、代价递增"的谱系：无权图用 BFS，非负权图用 Dijkstra，带负权边用 Bellman-Ford，要求所有顶点对则用 Floyd。

### BFS 求无权图的单源最短路径

无权图可以看成"每条边权值都为 1"的带权图，于是 BFS 的层次编号恰好就是最短距离：

```c
void BFS_MIN_Distance(Graph G, int u) {
    for (int i = 0; i < G.vexnum; i++) {
        d[i] = INF;
        path[i] = -1;
    }
    d[u] = 0; visited[u] = TRUE;
    EnQueue(Q, u);
    while (!Empty(Q)) {
        DeQueue(Q, u);
        for (w = FirstNeighbor(G, u); w >= 0; w = NextNeighbor(G, u, w))
            if (!visited[w]) {
                d[w] = d[u] + 1;       // 路径长度 +1
                path[w] = u;           // 记录前驱
                visited[w] = TRUE;
                EnQueue(Q, w);
            }
    }
}
```

![BFS 求无权图的单源最短路径](/notes-assets/dsa6-20-bfs-shortest-path.jpg)

- 数组 `d[]` 记录最短路径长度，`path[]` 记录前驱顶点，可以据此回溯出完整路径；
- 时间复杂度：邻接矩阵 $O(|V|^2)$，邻接表 $O(|V|+|E|)$。

### Dijkstra 算法

**思想**：贪心。每一轮选出当前 `dist` 最小且尚未确定最终距离的顶点，把它标记为"已确定"，再用它松弛所有邻接点。**"已确定"顶点的 `dist` 永不再更新**，这是算法正确性的基石。

**邻接矩阵版**：

```c
Status Dijkstra(WDGraph* g, int src, int* dist, int* prev) {
    if (g == NULL || dist == NULL || prev == NULL
        || src < 0 || src >= g->size) return ERROR;
    /* 初始化 */
    int final[g->size]; // final[i] = 1 表示顶点 i 已确定最短距离
    for (int i = 0; i < g->size; i++) {
        dist[i] = (g->matrix[src][i] != 0) ? g->matrix[src][i] : INT_MAX;
        prev[i] = (g->matrix[src][i] != 0) ? src : -1;
        final[i] = 0;
    }
    dist[src] = 0; final[src] = 1; prev[src] = -1;
    /* 每轮确定一个顶点的最短距离 */
    while (1) {
        int k = -1, min = INT_MAX;
        for (int i = 0; i < g->size; i++) // 选 dist 最小的未确定顶点
            if (!final[i] && dist[i] < min)
                min = dist[i], k = i;
        if (k == -1) break; // 所有可达顶点都已确定
        final[k] = 1;
        if (dist[k] == INT_MAX) continue;
        /* 松弛操作 */
        for (int i = 0; i < g->size; i++) {
            if (g->matrix[k][i] == 0 || final[i]) continue;
            if (dist[i] > dist[k] + g->matrix[k][i]) {
                dist[i] = dist[k] + g->matrix[k][i];
                prev[i] = k;
            }
        }
    }
    return OK;
}
```

![Dijkstra 算法图示（一）](/notes-assets/dsa6-21-1-dijkstra-trace.jpg)

![Dijkstra 算法图示（二）](/notes-assets/dsa6-21-2-dijkstra-trace.jpg)

**邻接表版**：

```c
Status Dijkstra(WDALGraph* g, int src, int* dist, int* prev) {
    if (g == NULL || dist == NULL || prev == NULL
        || src < 0 || src >= g->size) return ERROR;
    int final[g->size];
    for (int i = 0; i < g->size; i++) {
        dist[i] = INT_MAX; prev[i] = -1; final[i] = 0;
    }
    dist[src] = 0;
    /* 初始化源点的直接邻居 */
    for (WDAdjNode* p = g->heads[src]; p != NULL; p = p->next) {
        dist[p->vertex] = p->weight;
        prev[p->vertex] = src;
    }
    final[src] = 1;
    while (1) {
        int k = -1, min = INT_MAX;
        for (int i = 0; i < g->size; i++)
            if (!final[i] && dist[i] < min) min = dist[i], k = i;
        if (k == -1) break;
        final[k] = 1;
        for (WDAdjNode* p = g->heads[k]; p != NULL; p = p->next) {
            if (final[p->vertex]) continue;
            if ((long long)dist[k] + p->weight < dist[p->vertex]) {
                dist[p->vertex] = dist[k] + p->weight;
                prev[p->vertex] = k;
            }
        }
    }
    return OK;
}
```

**路径重构**（用 `prev[]` 从终点一路回溯到源点，再逆序）：

```c
int GetShortestPathSeq(WDALGraph* g, int src, int dst, int* path, int* len) {
    int dist[g->size], prev[g->size];
    Dijkstra(g, src, dist, prev);
    if (dist[dst] == INT_MAX) { *len = 0; return -1; }  // 不可达
    // 从 dst 回溯到 src，存入临时数组
    int temp[g->size], cnt = 0;
    for (int cur = dst; cur != -1; cur = prev[cur])
        temp[cnt++] = cur;
    // 逆序复制到 path（得到 src→dst 的正确顺序）
    *len = cnt;
    for (int i = 0; i < cnt; i++) path[i] = temp[cnt - 1 - i];
    return dist[dst];
}
```

- **时间复杂度**：$O(|V|^2)$（朴素版，每轮选最小值用线性扫描）；
- **限制**：**不适用于带有负权边的图**，因为一条负权边可能让"已确定"的顶点变得更短。

> **为什么不能有负权边**：Dijkstra 的正确性依赖于"已确定顶点的 `dist` 不会再被更新"这一假设。一旦存在负权边，一条经过尚未确定的顶点的路径，可能比当前已确定顶点的 `dist` 还要短，贪心选择就失去了依据。带负权边的图必须改用 **Bellman-Ford**。

> **例 1（Dijkstra 算法演示）**
> 一张带权有向图的顶点为 1~5，边为 $1\to2(10)$、$1\to4(5)$、$2\to3(1)$、$2\to4(2)$、$3\to5(4)$、$4\to2(3)$、$4\to3(9)$、$4\to5(2)$、$5\to3(6)$。求从顶点 1 出发到其余各顶点的最短路径。

**思路**：每轮从"未确定"顶点中选出 `dist` 最小者标记为确定，并用它松弛所有邻接点。

**解**：

| 轮次 | 确定顶点 | 松弛后的 dist（d2, d3, d4, d5） |
| :---: | :--- | :--- |
| 初始 | {1} | $(10, \infty, 5, \infty)$ |
| 1 | +4（dist = 5 最小） | $1\to4\to2$：d2 = min(10, 5+3) = **8**；d3 = 5+9 = 14；$1\to4\to5$：d5 = 5+2 = **7** |
| 2 | +5（dist = 7） | $5\to3$：d3 = min(14, 7+6) = 13 |
| 3 | +2（dist = 8） | $2\to3$：d3 = min(13, 8+1) = **9** |
| 4 | +3（dist = 9） | 无未确定邻接点 |

最终结果：d2 = **8**（$1\to4\to2$），d3 = **9**（$1\to4\to2\to3$），d4 = **5**（$1\to4$），d5 = **7**（$1\to4\to5$）。

> **评注**：注意 d3 被**更新了两次**——先算出 14（经 4 直达 3 的 9 权边），再降到 13（经 5），最后降到 9（经 2）。只有"未确定"的顶点才能被松弛更新，已确定的顶点（例如 d4 = 5）永不再变。易错点在于松弛时**必须跳过已确定的顶点**，否则可能推翻已经确定的结果——这也正是 Dijkstra 与负权边冲突的根源。

### Bellman-Ford 算法

Dijkstra 处理不了负权边，Bellman-Ford 可以，而且它还能顺带检测负权环：

```c
Status BellmanFord(WDGraph* g, int src, int* dist, int* prev) {
    if (g == NULL || dist == NULL || prev == NULL
        || src < 0 || src >= g->size) return ERROR;
    int V = g->size;
    for (int i = 0; i < V; i++) { dist[i] = INT_MAX; prev[i] = -1; }
    dist[src] = 0;
    // V-1 轮松弛操作
    for (int i = 1; i < V; i++) {
        int updated = 0;
        for (int u = 0; u < V; u++) {
            if (dist[u] == INT_MAX) continue;
            for (int v = 0; v < V; v++) {
                if (g->matrix[u][v] == 0) continue;
                long long newDist = (long long)dist[u] + g->matrix[u][v];
                if (newDist < dist[v]) {
                    dist[v] = (int)newDist;
                    prev[v] = u;
                    updated = 1;
                }
            }
        }
        if (!updated) break;     // 本轮无更新 → 提前结束
    }
    // 负权环检测：再做一轮松弛，如果还能更新则存在负权环
    for (int u = 0; u < V; u++) {
        if (dist[u] == INT_MAX) continue;
        for (int v = 0; v < V; v++) {
            if (g->matrix[u][v] == 0) continue;
            if ((long long)dist[u] + g->matrix[u][v] < dist[v])
                return ERROR;    // 存在负权环
        }
    }
    return OK;
}
```

- **时间复杂度**：$O(|V|\cdot|E|)$；
- **优势**：可以处理**负权边**，并且能**检测负权环**；
- **劣势**：比 Dijkstra 慢，不适合稠密大图。

**核心思想**：一条最短路径至多经过 $|V|-1$ 条边（否则必然含有环，而含环的路径可以去掉环变得不劣），因此做 $|V|-1$ 轮全边松弛必然收敛。如果第 $|V|$ 轮还能松弛成功，说明存在负权环——沿着这个环可以无限缩短路径，最短路径根本不存在。

### Floyd 算法

Floyd 求的是**所有顶点对之间**的最短路径，用的是动态规划：依次允许 $v_0, v_1, \dots, v_{n-1}$ 作为中转点，逐步更新任意两点之间的距离。

```c
void Floyd(int A[][MaxVertexNum], int path[][MaxVertexNum], int n) {
    for (int k = 0; k < n; k++)                  // 中转点
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (A[i][k] + A[k][j] < A[i][j]) {
                    A[i][j] = A[i][k] + A[k][j];
                    path[i][j] = k;              // 记录中转点
                }
}
```

![Floyd 算法图示](/notes-assets/dsa6-22-floyd-trace.jpg)

- **时间复杂度** $O(|V|^3)$，**空间复杂度** $O(|V|^2)$；
- 可以处理带**负权边**的图，但**不能处理带有负权回路的图**；
- 适用于**稠密图的多源最短路径**问题。

> **例 2（Floyd 算法演示）**
> 一张带权有向图的顶点为 1~3，边为 $1\to2(4)$、$1\to3(11)$、$2\to3(2)$、$3\to1(6)$。求所有顶点对之间的最短路径。

**思路**：三重循环依次允许 k = 1, 2, 3 作为中转点，若 $A[i][k]+A[k][j] < A[i][j]$ 则更新。

**解**：初始矩阵 $A^{(0)}$（行下标 $i$、列下标 $j$）：

$$
A^{(0)} = \begin{pmatrix} 0 & 4 & 11 \\ \infty & 0 & 2 \\ 6 & \infty & 0 \end{pmatrix}
$$

- 允许 k = 1 作为中转：$A[3][2] = \min(\infty,\ 6+4) = 10$；
- 允许 k = 2 作为中转：$A[1][3] = \min(11,\ 4+2) = 6$；
- 允许 k = 3 作为中转：$A[2][1] = \min(\infty,\ 2+6) = 8$。

最终得到：

$$
A^{(3)} = \begin{pmatrix} 0 & 4 & 6 \\ 8 & 0 & 2 \\ 6 & 10 & 0 \end{pmatrix}
$$

于是 $1\to3$ 的最短路径长度为 **6**（$1\to2\to3$，$4+2$ 优于直达的 11），$3\to2$ 的最短路径长度为 **10**（$3\to1\to2$）。

> **评注**：Floyd 的关键是**中转点 k 必须放在最外层循环**——如果把 k 放到内层，同一轮里会多次使用尚未更新完的矩阵，结果就错了。$A^{(k)}[i][j]$ 的含义是"只允许经过编号不超过 k 的中转点"时的最短路径长度，这个递推式正是动态规划"状态 + 阶段"结构的典型形态。

#### 四种最短路径算法的对比

| 算法 | 类型 | 处理负权边 | 检测负权环 | 时间复杂度 | 适用场景 |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **BFS** | 单源 | 否 | 否 | $O(\lvert V\rvert+\lvert E\rvert)$ | 无权图 |
| **Dijkstra** | 单源 | 否 | 否 | $O(\lvert V\rvert^2)$ | 非负权图，单源最常用 |
| **Bellman-Ford** | 单源 | 是 | 是 | $O(\lvert V\rvert\cdot\lvert E\rvert)$ | 带负权边 / 需要检测负环 |
| **Floyd** | 多源 | 是 | 否 | $O(\lvert V\rvert^3)$ | 稠密图多源 / 传递闭包 |

选型可以归纳为四条：

- 无权图 → **BFS**，$O(V+E)$，最简单；
- 非负权单源 → **Dijkstra**，$O(V^2)$，最常用；
- 有负权边的单源 → **Bellman-Ford**，比 Dijkstra 慢但更通用；
- 所有顶点对之间 → 稠密图用 **Floyd**（$O(V^3)$），稀疏图可以跑 $V$ 次 Dijkstra，复杂度 $O(V\cdot E\log V)$。

## 有向无环图及其应用

**有向无环图**（DAG，Directed Acyclic Graph）是不存在环的有向图。它是一类"可以排序"的图：**有向图存在拓扑排序，当且仅当它是一张 DAG**。DAG 有三个典型用途：合并重复的子表达式（编译优化）、拓扑排序（任务调度）、关键路径（工程管理）。

### DAG 描述表达式

表达式二叉树中可能存在**重复的子表达式**。例如 $(a+b)\times(a+b)$ 的两棵 $(a+b)$ 子树结构完全相同，在二叉树里各自独立存储，造成了结点冗余。DAG 通过**合并相同的子表达式**来解决这个问题。

以表达式 $((a+b)\times(a+b))+(c-d)$ 为例：

#### 二叉树表示

每个运算符和操作数都是独立结点，$(a+b)$ 出现了两次就要两棵完整子树，共 11 个结点。

#### DAG 表示

两个 $(a+b)$ 共享同一个 `+` 结点，该 `+` 结点有两个父结点指向它；$(c-d)$ 同理可以与其他相同的子表达式共享。最终结点数显著减少。

![表达式二叉树转 DAG](/notes-assets/dsa6-23-expression-dag.jpg)

**转换方法**有五步：

1. 按照表达式构造二叉树（操作数在叶子，运算符在内结点）；
2. 自底向上遍历这棵二叉树，为每个结点计算一个**标识符**（例如"运算符 + 左子树 ID + 右子树 ID"）；
3. 若两个结点的标识符相同，说明它们代表的子表达式完全等价，**合并为一个共享结点**；
4. 合并后，原来指向被合并结点的指针全部改为指向共享结点；
5. 最终得到的有向无环图就是 DAG——它的内部结点可能有**多个父结点**（被多次引用）。

> **DAG 与二叉树的本质区别**：在二叉树中，每个结点（除根之外）有且仅有一个父结点；在 DAG 中，一个结点可以被多个父结点共享。这种"共享"正是 DAG 节省空间、避免重复计算的关键——公共子表达式只算一次，结果被所有引用者复用。

> **在编译优化中的作用**：DAG 是编译器**公共子表达式消除**（Common Subexpression Elimination，CSE）的理论基础。编译器在生成中间代码时构造 DAG，自动识别并合并重复计算——源码里写了两遍 `a+b`，编译后只算一次。

### AOV 网与拓扑排序

#### AOV 网

**AOV 网**（Activity On Vertex）用顶点表示活动，用有向边表示活动之间的先后顺序。

![AOV 网示例](/notes-assets/dsa6-24-aov-network.jpg)

#### 拓扑排序

把 DAG 的所有顶点排成一个线性序列，使得对任意一条边 $\langle v_i, v_j \rangle$，都有 $v_i$ 排在 $v_j$ 之前。换句话说，拓扑序就是一张"合法的做事顺序表"。

### 拓扑排序的实现

#### Kahn 算法

**BFS 思想**：每轮选出一个入度为 0 的顶点输出，然后逻辑删除它及其所有出边（把后继的入度减 1），循环直到没有入度为 0 的顶点为止。

```c
int TopoSortKahn(WDGraph* g, int* seq) {
    if (g == NULL || seq == NULL) return 0;
    /* 初始化入度数组 */
    int inDegree[g->size];
    for (int i = 0; i < g->size; i++) inDegree[i] = 0;
    for (int i = 0; i < g->size; i++)
        for (int j = 0; j < g->size; j++)
            if (g->matrix[i][j] != 0) inDegree[j]++;

    int cnt = 0;
    while (1) {
        int cur = -1;
        /* 找入度为 0 的最小序号顶点 */
        for (int i = 0; i < g->size; i++)
            if (inDegree[i] == 0) { cur = i; break; }
        if (cur == -1) break; // 不存在入度为 0 → 有环或已完成
        seq[cnt++] = cur;
        inDegree[cur] = -1; // 标记为已处理
        for (int i = 0; i < g->size; i++)
            if (g->matrix[cur][i] != 0) inDegree[i]--;
    }
    return cnt;  // cnt < g->size 说明有环
}
```

![Kahn 算法图示（一）](/notes-assets/dsa6-25-1-kahn-trace.jpg)

![Kahn 算法图示（二）](/notes-assets/dsa6-25-2-kahn-trace.jpg)

#### DFS 后序法

DFS 的后序序列（顶点完成访问的顺序）反过来就是拓扑序。实现上从数组末尾往前填结果，并在遇到回边时报告有环：

```c
static int TopoSortDFSHelper(WDGraph* g, int u, int* visited,
                              int* result, int* pos) {
    visited[u] = 1; // 标记为 GRAY（访问中）
    for (int i = 0; i < g->size; i++) {
        if (g->matrix[u][i] != 0) {
            if (visited[i] == 1) return -1; // 回边 → 有环
            if (visited[i] == 0)
                if (TopoSortDFSHelper(g, i, visited, result, pos) == -1)
                    return -1;
        }
    }
    visited[u] = 2; // 标记为 BLACK（已完成）
    result[(*pos)--] = u; // 后序：从末尾往前填
    return 0;
}

int TopoSortDFS(WDGraph* g, int* seq) {
    if (g == NULL || seq == NULL) return -1;
    int visited[g->size];
    for (int i = 0; i < g->size; i++) visited[i] = 0;
    int result[g->size], pos = g->size - 1;
    for (int i = 0; i < g->size; i++)
        if (visited[i] == 0)
            if (TopoSortDFSHelper(g, i, visited, result, &pos) == -1)
                return -1;
    for (int i = 0; i < g->size; i++) seq[i] = result[i];
    return g->size;
}
```

两种实现的时间复杂度都是：邻接表 $O(|V|+|E|)$，邻接矩阵 $O(|V|^2)$。

**逆拓扑排序**：把 Kahn 算法改为每次选出度为 0 的顶点，得到的就是逆拓扑序；或者直接取 DFS 的出栈序列。

> **拓扑排序的存在性**：**有向图存在拓扑排序，当且仅当它是 DAG**。如果 `TopoSortKahn` 输出的顶点数小于总顶点数，说明图中存在环；如果 `TopoSortDFS` 遇到回边（`visited == 1`），同样说明有环。

> **例 1（拓扑排序）**
> 一张 AOV 网的顶点为 1~6，弧为 $1\to2$、$1\to3$、$2\to4$、$3\to4$、$3\to5$、$4\to6$、$5\to6$。用 Kahn 算法求一个拓扑序列。

**思路**：每轮取入度为 0 的顶点输出，逻辑上删除它及其出边（相应后继入度减 1），循环至空。

**解**：

| 轮次 | 入度为 0 的顶点 | 输出 | 入度变化 |
| :---: | :--- | :---: | :--- |
| 1 | {1} | 1 | 2、3 入度归零 |
| 2 | {2,3} | 2（取最小） | 4 入度 2 → 1 |
| 3 | {3} | 3 | 4 → 0，5 → 0 |
| 4 | {4,5} | 4（取最小） | 6 入度 2 → 1 |
| 5 | {5} | 5 | 6 → 0 |
| 6 | {6} | 6 | — |

拓扑序列为 **1, 2, 3, 4, 5, 6**。

> **评注**：第 2、4 轮都存在多个候选（{2,3} 与 {4,5}），这里取最小序号，才得到唯一的结果——**若不作约定，拓扑序列并不唯一**。如果给这张图再加上一条弧 $4\to2$ 形成环，那么到某一步就再也找不到入度为 0 的顶点，输出个数小于 6，算法以"有环"终止——这就是 Kahn 算法顺带判环的原理。DFS 后序法得到的是同一个问题的另一种构造，两者输出的序列可能不同，但都合法。

#### 两种拓扑排序实现的对比

| 对比维度 | Kahn 算法（BFS 思想） | DFS 后序法 |
| :--- | :--- | :--- |
| **核心思想** | 每次选入度为 0 的顶点输出 | DFS 完成后把顶点逆序输出 |
| **辅助结构** | `inDegree[]` 数组 | `visited[]` 3 色标记 |
| **环检测** | 最终输出顶点数 < 总顶点数 | 遇到回边（`visited == 1`） |
| **结果顺序** | 可能不唯一（取决于选点策略） | 可能不唯一（取决于遍历顺序） |
| **是否修改图** | 逻辑删除（`inDegree` 置 -1） | 不修改 |
| **实现难度** | 中等 | 稍难（后序倒填） |

#### DAG 最长路径

**DAG 上的最长路径可以用动态规划在多项式时间内求出，而一般有向图的最长路径问题是 NP 难的**——差别就在于 DAG 无环，拓扑序让动态规划的"阶段"天然有序，不存在循环依赖。

```c
// 按拓扑序遍历，DP 更新最长距离
int GetLongestPath(WDGraph* g) {
    if (g == NULL || !IsDAG(g)) return -1;
    if (g->size == 0 || g->edgeCount == 0) return 0;
    int n = g->size, seq[n];
    TopoSortKahn(g, seq); // 获取拓扑序
    int dist[n];
    for (int i = 0; i < n; i++) dist[i] = 0;
    int maxLen = 0;
    /* 按拓扑序遍历 */
    for (int i = 0; i < n; i++) {
        int u = seq[i];
        for (int v = 0; v < n; v++) {
            int w = g->matrix[u][v];
            if (w > 0) {
                int newDist = dist[u] + w;
                if (newDist > dist[v]) {
                    dist[v] = newDist;
                    if (newDist > maxLen) maxLen = newDist;
                }
            }
        }
    }
    return maxLen;
}
```

> **注意**：DAG 最长路径是关键路径的前置知识。它的动态规划解法正是 AOE 网关键路径的基础：对 AOE 网而言，汇点的最早发生时间就等于从源点到汇点的最长路径长度，也就是整个工程的最短工期。

### AOE 网与关键路径

工程管理最关心的问题是"这批任务最早什么时候能全部做完"。把任务依赖关系画成一张带权的有向无环图，答案就落在"最长路径"上——这就是关键路径方法。

#### AOE 网

**AOE 网**（Activity On Edge）：顶点表示**事件**，有向边表示**活动**，边上的权值表示活动的开销（时间）。整个工程只有一个**源点**（入度为 0）和一个**汇点**（出度为 0）。

#### 关键路径

从源点到汇点的所有路径中，**路径长度最大**的那一条。关键路径上的活动称为**关键活动**。

![AOE 网示例](/notes-assets/dsa6-26-aoe-network.jpg)

> **关键路径为什么是最长路径**：工程要全部完工，必须等所有并行分支都做完，因此总工期由"最慢的那条链"决定。最短工期等于最长路径长度，这个结论初看反直觉，但正是"木桶最短板"在工程上的体现。

| 概念 | 符号 | 含义 |
| :--- | :--- | :--- |
| 事件最早发生时间 | $Ve(k)$ | 从源点到 $v_k$ 的最长路径长度 |
| 事件最迟发生时间 | $Vl(k)$ | 不推迟工期的前提下 $v_k$ 最迟发生的时间 |
| 活动最早开始时间 | $e(i)$ | $e(i) = Ve(\text{弧尾})$ |
| 活动最迟开始时间 | $l(i)$ | $l(i) = Vl(\text{弧头}) - \text{活动耗时}$ |
| 时间余量 | $d(i) = l(i) - e(i)$ | $d(i)=0$ 的活动为**关键活动** |

**求关键路径的步骤**共四步：

1. 按**拓扑序**求各顶点的 $Ve(k)$——每一步取"前驱的 $Ve$ 加上入边权值"的**最大值**；
2. 按**逆拓扑序**求各顶点的 $Vl(k)$——每一步取"后继的 $Vl$ 减去出边权值"的**最小值**；
3. 对每条活动（边）计算 $e(i)$、$l(i)$ 与 $d(i)$；
4. $d(i)=0$ 的活动即为关键活动，它们连起来构成关键路径。

> **注意**：$Ve$ 用"取最大"（一个事件要等所有前驱都完成，所以取决于最慢的那个），$Vl$ 用"取最小"（一个事件的最迟时间受最快的后继约束），两者的方向相反，这是最容易算错的地方。

> **例 1（AOE 网求关键路径）**
> 一张 AOE 网的事件为 1~6，活动为 $a_1:1\to2(3)$、$a_2:1\to3(2)$、$a_3:2\to4(2)$、$a_4:3\to4(4)$、$a_5:3\to5(3)$、$a_6:4\to5(1)$、$a_7:4\to6(3)$、$a_8:5\to6(2)$。求关键路径与最短工期。

**思路**：① 按拓扑序求 $Ve$（取最大）；② 按逆拓扑序求 $Vl$（取最小）；③ 对每条活动算 $e = Ve(\text{弧尾})$、$l = Vl(\text{弧头}) - \text{耗时}$；④ $d = l - e = 0$ 者为关键活动。

**解**：

① 求 $Ve$（自源点向后推）：

- $Ve(1)=0$；
- $Ve(2)=3$，$Ve(3)=2$；
- $Ve(4)=\max(3+2,\ 2+4)=6$；
- $Ve(5)=\max(2+3,\ 6+1)=7$；
- $Ve(6)=\max(6+3,\ 7+2)=9$。

② 求 $Vl$（自汇点向前推，$Vl(6)=Ve(6)=9$）：

- $Vl(5)=9-2=7$；
- $Vl(4)=\min(7-1,\ 9-3)=6$；
- $Vl(3)=\min(6-4,\ 7-3)=2$；
- $Vl(2)=6-2=4$；
- $Vl(1)=\min(4-3,\ 2-2)=0$。

③ 逐条活动计算 $e$、$l$、$d$：

| 活动 | $e$ | $l$ | $d = l-e$ | 关键？ |
| :---: | :---: | :---: | :---: | :---: |
| $a_1$ (1→2) | 0 | 4-3 = 1 | 1 | 否 |
| $a_2$ (1→3) | 0 | 2-2 = 0 | 0 | 是 |
| $a_3$ (2→4) | 3 | 6-2 = 4 | 1 | 否 |
| $a_4$ (3→4) | 2 | 6-4 = 2 | 0 | 是 |
| $a_5$ (3→5) | 2 | 7-3 = 4 | 2 | 否 |
| $a_6$ (4→5) | 6 | 7-1 = 6 | 0 | 是 |
| $a_7$ (4→6) | 6 | 9-3 = 6 | 0 | 是 |
| $a_8$ (5→6) | 7 | 9-2 = 7 | 0 | 是 |

④ 关键活动为 $a_2$、$a_4$、$a_6$、$a_7$、$a_8$，构成两条关键路径：$1\to3\to4\to6$（$2+4+3=9$）与 $1\to3\to4\to5\to6$（$2+4+1+2=9$）。最短工期为 **9**。

> 关键路径是"**最长的路径**"而不是"最忙的路径"——活动 $a_1$ 从源点出发却不是关键活动，因为事件 2 有 1 个单位的时间余量（$Vl(2)-Ve(2)=1$）。这张网有两条关键路径，意味着只缩短 $a_7$ 或只缩短 $a_8$ 都无法缩短总工期，**必须同时加快两条路径上的关键活动**。

#### 缩短工期的方法

关键路径的性质决定了工程优化的方向：

- 若某个关键活动的耗时就增加，**整个工期会被拉长**；
- 缩短关键活动可以缩短工期，但缩短到一定程度后，它可能变成非关键活动（时间余量不再为 0）；
- 一张 AOE 网可能有多条关键路径——只有**同时加快所有关键路径上的关键活动**，才能缩短总工期。

## 小结

- **术语是地基**：图 $G=(V,E)$ 描述"多对多"关系；**握手定理** $\sum TD(v_i)=2|E|$ 是所有度相关计算的起点，无向图中度数之和必为偶数。
- **连通性有两个方向**：连通分量是**极大**连通子图（顶点尽量多），生成树是**极小**连通子图（边尽量少）；$n$ 个顶点的连通图至少 $n-1$ 条边，而"保证连通"需要 $\binom{n-1}{2}+1$ 条边，这是两个不同的问题。
- **存储结构决定算法代价**：邻接矩阵判边 $O(1)$、表示唯一但空间 $O(\lvert V\rvert^2)$，适合稠密图；邻接表空间 $O(\lvert V\rvert+\lvert E\rvert)$、表示不唯一，适合稀疏图；十字链表与邻接多重表分别优化有向图查入边、无向图删边。
- **遍历只有两种骨架**：BFS 用队列逐层扩散、天然支持无权图最短路；DFS 用栈或递归一路到底、更适合环检测与连通分量；两者都必须带 visited 标记，非连通图上外层循环的次数等于连通分量个数。
- **最小生成树是贪心的两种落地**：Prim 加点、$O(\lvert V\rvert^2)$，适合稠密图；Kruskal 加边配并查集、$O(\lvert E\rvert\log\lvert E\rvert)$，适合稀疏图；两者结果权值之和唯一且相同。
- **最短路径算法是一条谱系**：无权选 BFS，非负权单源选 Dijkstra，带负权边或需检测负环选 Bellman-Ford，所有顶点对选 Floyd——**Dijkstra 的正确性以非负权为前提，不能处理负权边**。
- **DAG 让"顺序"可计算**：有向图存在拓扑排序当且仅当它是 DAG，Kahn（入度为 0）与 DFS 后序两种实现都能顺带判环；AOE 网的关键路径就是源点到汇点的最长路径，$Ve$ 取最大、$Vl$ 取最小，$d=l-e=0$ 的活动是关键活动。
