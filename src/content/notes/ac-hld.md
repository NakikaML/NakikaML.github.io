---
title: 算法竞赛-树的重链剖分
description: 把树上路径拆成 O(log n) 段连续区间，交给线段树——重儿子、重链、dfn 分配、爬链循环，以及边权怎么下放成点权。
category: 计算机科学
subject: 计算机科学
subfield: 算法竞赛
topic: 树的重链剖分
difficulty: 困难
date: "2026-11-01"
tags: [算法竞赛, 树, 树链剖分, 重链剖分, HLD, 线段树, LCA]
problems:
  - luogu P3384 重链剖分 | 路径加/和 + 子树加/和（模板） | ★★★
  - luogu P3178 树上操作 | 子树加 + 路径和 | ★★
  - luogu P3038 种草 | 边权转点权 + 路径加 | ★★★
  - luogu P4116 QTree3 | 单点改色 + 查根路径上第一个黑点 | ★★★
  - luogu P3976 旅游 | 路径上有向的最大收益 | ★★★★
draft: false
---

:::note 前置
线段树、树的直径与重心、最小公共祖先LCA、树上DP
:::

## 重链剖分概述

**重链剖分**（Heavy-Light Decomposition，HLD）把树上任意一条路径拆成 $O(\log n)$ 段，**每一段都恰好是数组上连续的一段区间**。于是"树上路径操作"就变成了"区间操作" —— 剩下的交给线段树。

### 重链剖分的基本概念

对每个点 $u$，看它的所有儿子，**子树最大的那个**叫**重儿子**，其余的叫**轻儿子**。

- 从 $u$ 连向重儿子的边叫**重边**，连向轻儿子的叫**轻边**；
- 顺着重边一路往下，会形成一条链，叫**重链**；
- 每条重链上**深度最小**的那个点叫**链顶**（`top`）。它是根的"轻儿子"，或者它本身就是根。

规则：

> **分配 DFS 序的时候，先走重儿子** 

### 重链剖分的实现

具体的实现步骤如下

第一遍求 `sz` 与重儿子 `son`，第二遍按"重儿子优先"分配 `dfn` 和 `top`。

```cpp
// 第一遍：求 sz、son（可以递归，但深链会爆栈，正式版本见下面的迭代版）
void dfs1(int u, int f) {
    fa[u] = f; dep[u] = dep[f] + 1; sz[u] = 1; son[u] = 0;
    for (int v : g[u]) {
        if (v == f) continue;
        dfs1(v, u);
        sz[u] += sz[v];
        if (sz[v] > sz[son[u]]) son[u] = v;   // 子树最大的才是重儿子
    }
}

// 第二遍：重儿子沿用链顶，轻儿子自己开一条新链
void dfs2(int u, int tp) {
    top[u] = tp; dfn[u] = ++timer; rk[timer] = u;
    if (son[u]) dfs2(son[u], tp);              // 重儿子：同一条链
    for (int v : g[u])
        if (v != fa[u] && v != son[u]) dfs2(v, v);   // 轻儿子：新链的链顶
}
```

重要结论：

| # | 不变式 | 原因 |
| :--- | :--- | :--- |
| 1 | 同一条重链上的点，`dfn` **连续，且从上到下递增** | 第二遍会先把重儿子一路走到底 |
| 2 | 每棵子树内的点 `dfn` 连续，区间正好是 `[dfn[x], dfn[x]+sz[x]-1]` | 任何 DFS 序都有这个性质 |
| 3 | 任意一条路径，最多被拆成 $O(\log n)$ 段重链 | 每跨一条轻边，子树大小至少翻倍 |

证明：

设 $u$ 是轻儿子，父亲 $f$ 的重儿子是 $h$。因为 $h$ 是"子树最大的儿子"，所以 $\text{sz}[h] \ge \text{sz}[u]$，于是

$$\text{sz}[f] \ge 1 + \text{sz}[h] + \text{sz}[u] \ge 1 + 2\,\text{sz}[u] > 2\,\text{sz}[u]$$

**每往上跨一条轻边，所在子树的大小至少翻一倍。** 从任何点爬到根，最多跨 $\log_2 n$ 条轻边 —— 段数自然是 $O(\log n)$。

> **注意**：这个 $O(\log n)$ 说的是**段数**，不是点数。一条重链上哪怕有几十万个点，也只需要**一次**区间操作。

### 迭代实现

链状数据上递归深度 = $n$，$10^5$ 就足以爆栈。正式写法是"BFS 求父与深度 + 倒序递推算 `sz`/`son` + 显式栈分配 `dfn`"：

```cpp
int order[N];                                  // BFS 序：父一定排在子前面
int fa[N], dep[N], sz[N], son[N], top[N], dfn[N], rk[N], timer;

void prework(int root, int n) {
    // ① 父与深度
    int head = 0, tail = 0;
    order[tail++] = root; fa[root] = 0; dep[root] = 0;
    while (head < tail) {
        int u = order[head++];
        for (int v : g[u]) {
            if (v == fa[u]) continue;
            fa[v] = u; dep[v] = dep[u] + 1; order[tail++] = v;
        }
    }
    // ② 倒序递推：算 sz 与重儿子
    for (int i = 0; i < n; i++) { sz[order[i]] = 1; son[order[i]] = 0; }
    for (int i = n - 1; i >= 0; i--) {
        int u = order[i];
        if (!fa[u]) continue;
        sz[fa[u]] += sz[u];
        if (sz[u] > sz[son[fa[u]]]) son[fa[u]] = u;
    }
    // ③ 显式栈：重儿子优先分配 dfn
    static int stk[N];
    int sp = 0;
    top[root] = root; stk[sp++] = root;
    while (sp) {
        int u = stk[--sp];
        dfn[u] = ++timer; rk[timer] = u;
        for (int v : g[u])                     // 轻儿子先压栈（后处理）
            if (v != fa[u] && v != son[u]) { top[v] = v; stk[sp++] = v; }
        if (son[u]) {                          // 重儿子最后压栈 → 紧接着被处理
            top[son[u]] = top[u];
            stk[sp++] = son[u];
        }
    }
}
```

栈是后进先出，所以"重儿子最后压栈"等于"重儿子最先被处理"。这正是"重儿子优先"，只是从递归换成了显式栈。

| 数组 | 含义 | 哪一步算出来的 |
| :--- | :--- | :--- |
| `fa` / `dep` | 父亲 / 深度 | ① |
| `sz` / `son` | 子树大小 / 重儿子（0 表示没有） | ②（倒序递推） |
| `top` / `dfn` / `rk` | 链顶 / 结点→下标 / 下标→结点 | ③（显式栈） |

## 爬链循环

路径操作是一个"双指针往上爬"的循环：

```cpp
// 以"路径加"为例。把 update 换成累加 query，就是路径查询
void pathAdd(int u, int v, long long x) {
    while (top[u] != top[v]) {                        // 不在同一条链上
        if (dep[top[u]] < dep[top[v]]) swap(u, v);    // 先处理链顶更深的那一侧
        update(1, 1, n, dfn[top[u]], dfn[u], x);      // 整条链就是一段连续区间
        u = fa[top[u]];                               // 跨过这条轻边，跳到链顶的父亲
    }
    if (dep[u] > dep[v]) swap(u, v);                  // 同一条链上：保证 u 较浅
    update(1, 1, n, dfn[u], dfn[v], x);               // 处理剩下的这一段
}
```

这三行注释对应三个最容易写错的地方：

1. **比较的是 `dep[top[u]]`，不是 `dep[u]`**。比链顶深度才能保证"每次至少往上跳一条链"，比点深度会让两边互相抢、原地打转；
2. **跳出循环后还要再比一次 `dep[u]` 和 `dep[v]`**。同一条链上 `dfn` 从上往下递增，左端点必须是较浅的那个；
3. **复杂度是 $O(\log^2 n)$**：$O(\log n)$ 段 × 每段线段树 $O(\log n)$。

子树操作则简单到只有一行（不变式 2）：

```cpp
void subtreeAdd(int x, long long v) {
    update(1, 1, n, dfn[x], dfn[x] + sz[x] - 1, v);
}
```

:::example 例 1 · 一条路径被拆成哪几段
树：`1-2`、`1-3`、`2-4`、`2-5`、`4-6`、`4-7`，以 1 为根。先算 `sz` 与重儿子：

| 点 | `sz` | 重儿子 `son` |
| :--- | :--- | :--- |
| 6 / 7 / 5 / 3 | 1 | 0 |
| 4 | 3 | 6（两个儿子一样大，取先遇到的） |
| 2 | 5 | 4 |
| 1 | 7 | 2 |

按"重儿子优先"分配 `dfn`，得到三条链：

| 链 | 点 | `top` | `dfn` |
| :--- | :--- | :--- | :--- |
| 主链 | 1 → 2 → 4 → 6 | 1 | 1, 2, 3, 4 |
| 7 自己一条 | 7 | 7 | 5 |
| 5 自己一条 | 5 | 5 | 6 |
| 3 自己一条 | 3 | 3 | 7 |

现在走一遍路径 `7 → 3`（真实路径是 `7-4-2-1-3`）：

| 轮 | `top[u]` / `top[v]` | 谁的链顶更深 | 处理的区间 | 之后 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `top[7]=7`、`top[3]=3` | 7（$dep=3$） | `[dfn[7], dfn[7]] = [5,5]` | `u = fa[7] = 4` |
| 2 | `top[4]=1`、`top[3]=3` | 3（$dep=1$） | `[dfn[3], dfn[3]] = [7,7]` | `v = fa[3] = 1` |
| 3 | `top[4]=1`、`top[1]=1` 相同 | — | 同链收尾：`[dfn[1], dfn[4]] = [1,3]` | 结束 |

三段区间 `[5,5]`、`[7,7]`、`[1,3]` 对应的点分别是 7、3、`{1,2,4}` —— 合起来正好是整条路径。

**评注**：注意第 3 轮那段 `[1,3]`：它**一次覆盖了三个点**（1、2、4 都在主链上）。这就是"重链连续"带来的好处 —— 越是"主干"上的路径，越能一次处理一大片。
:::

## 重链剖分在 LCA 问题中的应用

树剖求 LCA 只需要爬链，不需要整张跳表：

```cpp
int lca(int u, int v) {
    while (top[u] != top[v]) {
        if (dep[top[u]] < dep[top[v]]) swap(u, v);
        u = fa[top[u]];                 // 链顶深的那个，整条链跳过去
    }
    return dep[u] < dep[v] ? u : v;     // 同一条链上，浅的那个是 LCA
}
```

预处理 $O(n)$、单次 $O(\log n)$，常数比倍增小，代码还短。**如果你已经写了树剖，就不用再写倍增了。**

## 边权求解

树剖的 `dfn` 是给**点**编号的，而有些题问的是**边**（比如"路径上的最大边权"）。做法是把边权**记在较深的那个端点上**：

- 边 $(fa[v],\ v)$ 的权值记在点 $v$ 上；
- 于是"路径上所有边"就变成了"路径上除 LCA 以外所有点"。

代码上只差一处：最后那段**从 `dfn[lca] + 1` 开始**。

```cpp
// 边权版本的最后一段（u 此时是 LCA）
update(1, 1, n, dfn[u] + 1, dfn[v], x);
```

> **易错点**：漏掉 `+ 1` 的典型症状是"答案比正确答案**略大**，而且总是恰好多算了 LCA 那一条边"。因为 LCA 代表的边是"LCA 与它父亲之间"的边，根本不在路径上。

## 线段树与树剖的结合

树剖只负责把路径变成区间，这是可结合线段树（区间加 + 区间和 + 懒标记）存储：

```cpp
long long sum[N << 2], tag[N << 2], a[N];      // a[] 按 dfn 顺序排好的点权

void pull(int p) { sum[p] = sum[p << 1] + sum[p << 1 | 1]; }

void apply(int p, int l, int r, long long v) {
    sum[p] += v * (r - l + 1);
    tag[p] += v;
}

void push(int p, int l, int r) {
    if (!tag[p]) return;
    int m = (l + r) >> 1;
    apply(p << 1, l, m, tag[p]);
    apply(p << 1 | 1, m + 1, r, tag[p]);
    tag[p] = 0;
}

void update(int p, int l, int r, int ql, int qr, long long v) {
    if (ql <= l && r <= qr) { apply(p, l, r, v); return; }
    push(p, l, r);
    int m = (l + r) >> 1;
    if (ql <= m) update(p << 1, l, m, ql, qr, v);
    if (qr > m) update(p << 1 | 1, m + 1, r, ql, qr, v);
    pull(p);
}

long long query(int p, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) return sum[p];
    push(p, l, r);
    int m = (l + r) >> 1;
    long long res = 0;
    if (ql <= m) res += query(p << 1, l, m, ql, qr);
    if (qr > m) res += query(p << 1 | 1, m + 1, r, ql, qr);
    return res;
}

// 建树时按 dfn 的顺序灌入点权：a[dfn[u]] = val[u]，再 build(1, 1, n)
```

> **提示**：只有"区间加 + 单点查"时，把线段树换成**树状数组**能把常数砍一半。要不要换，看题目允不允许。

:::summary 小结
1. **重儿子** = 子树最大的儿子；**重链** = 顺着重边走到底；**`top`** = 链顶。
2. 分配 `dfn` 时**重儿子优先** → 重链连续、子树连续、路径拆成 $O(\log n)$ 段。
3. 路径操作 = 爬链循环；子树操作 = **一次区间**。
4. 边权先记到深端点，最后一段从 `dfn[lca] + 1` 开始。
:::
