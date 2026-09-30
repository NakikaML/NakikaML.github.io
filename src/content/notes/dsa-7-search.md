---
title: 数据结构与算法-7 查找
description: 查找要比较多少次关键字？本章从顺序表讲到散列表，覆盖 ASL、判定树、平衡树与冲突处理。
category: 计算机科学
subject: 计算机科学
subfield: 数据结构与算法
topic: 查找
difficulty: 中等
date: "2026-09-30"
tags: [数据结构与算法, 查找, 平衡二叉树, 红黑树, B树, 散列表]
draft: false
featured: false
---

## 查找的基本概念

### 查找的定义与分类

#### 查找

**查找**（Search）：在数据集合中寻找满足某种条件的数据元素的过程。

#### 查找表

**查找表**（Search Table）：用于查找的数据集合，由同一类型的数据元素组成。

#### 关键字

**关键字**（Key）：数据元素中**唯一标识**该元素的某个数据项的值。

三者的关系是：查找表提供集合，关键字提供身份，查找就是"**按关键字定位元素**"。关键字不一定是元素的全部内容——在学生表里，学号足以唯一确定一条记录，姓名、成绩都是附带数据。

#### 静态查找表与动态查找表

按"查找之外还要不要改表"，查找表分成两类，这个划分直接决定了算法选型：

| 类型 | 操作 | 关注点 | 示例 |
| :--- | :--- | :--- | :--- |
| **静态查找表** | 仅查找 | 查找速度 | 学生信息查询系统 |
| **动态查找表** | 查找 + 插入 + 删除 | 查找速度 + 增删是否方便 | 商品订单管理系统 |

静态表可以用折半查找（有序数组）追求极致速度；动态表则必须选择插入、删除代价小的结构，例如二叉排序树或散列表——**一张表一旦需要频繁增删，"有序数组 + 折半"就不再划算**，因为数组插入要搬移元素。

### 平均查找长度 ASL

**查找长度**：一次查找运算中需要**比较关键字的次数**。

**平均查找长度（ASL, Average Search Length）**：所有查找过程中关键字比较次数的平均值。

$$
ASL = \sum_{i=1}^{n} P_i C_i
$$

其中 $P_i$ 是查找第 $i$ 个元素的概率（通常 $\sum P_i = 1$），$C_i$ 是找到第 $i$ 个元素所需的比较次数。

评价一个查找算法必须同时给出两个数字，缺一不可：

- $ASL_{\text{成功}}$：**找到**目标关键字时的平均比较次数；
- $ASL_{\text{失败}}$：**确认目标不存在**时的平均比较次数。

> **注意**：失败查找也要算——它衡量的是"查一个不在表里的关键字要付多少代价"，这在真实系统里恰恰是最常见的情形。计算 ASL 时最容易漏掉失败的那一次比较。

> **例 1（等概率下的 ASL）**
> 长度为 8 的顺序表，各元素的查找概率相等。求顺序查找的 $ASL_{\text{成功}}$ 与 $ASL_{\text{失败}}$。

**思路**：等概率时 $P_i = 1/n$；顺序查找从头开始逐个比较，第 $i$ 个元素的查找长度就是 $C_i = i$。

**解**：$n = 8$ 时，$ASL_{\text{成功}} = \frac{1+2+\cdots+8}{8} = \frac{36}{8} = 4.5$，$ASL_{\text{失败}} = 8 + 1 = 9$。8 个元素全部比较完仍然没找到，此时还不能下结论，必须再多比较一次才能确认"表中不存在"。

**评注**：两个结论值得记住——等概率顺序查找 $ASL_{\text{成功}} = \frac{n+1}{2}$、$ASL_{\text{失败}} = n+1$。失败长度比 $n$ 多 1，就是那"最后一次确认"；这是最容易漏算的加一。

## 顺序查找

**顺序查找**（Sequential Search）又称线性查找：按序列顺序逐个比较，直到命中或走完。它是唯一同时适用于**无序表与链表**的查找方法，价值在于"下限"——$O(n)$ 的时间换来对存储结构的零要求。下面先看最朴素的写法，再看哨兵优化省下的那一次判断，最后把"有序"这一先验信息加进来。

### 基本实现

```c
struct SSTable {
    ElemType *elem;        // 动态数组基址
    int TableLen;          // 表的长度
};

int Search_Seq(SSTable ST, ElemType key) {
    int i;
    for (i = 0; i < ST.TableLen && ST.elem[i] != key; ++i);
    return i == ST.TableLen ? -1 : i;
}
```

循环条件里藏着两个判断：**越界判断**（`i < ST.TableLen`）与**关键字比较**（`ST.elem[i] != key`）。每轮循环都要做两次比较，这就是优化的切入点。

#### 哨兵优化

```c
int Search_Seq(SSTable ST, ElemType key) {
    ST.elem[0] = key;          // 哨兵：0 号位置存放 key
    int i;
    for (i = ST.TableLen; ST.elem[i] != key; --i);  // 从后往前，无需判越界
    return i;                  // 返回 0 表示失败，否则返回位序
}
```

![顺序查找的哨兵优化](/notes-assets/dsa7-01-sentinel-search.jpg)

**为什么能省一次判断**：把 key 预先存入 0 号位置之后，循环**不可能越界**——最坏情况下走到 0 号位也一定命中（命中的是哨兵自己）。于是循环里只剩一个条件，"找没找到"和"走没走完"合二为一。省下的是每轮一次的比较，规模越大收益越明显；代价是 0 号位置不能再存正常数据。

> **注意**：哨兵是典型的"用一点空间换一条指令"的工程技巧。它不改变 $O(n)$ 的复杂度，但把循环体的常数项压到了最小。

#### 顺序查找的效率与不等概率优化

$$
ASL_{\text{成功}} = \frac{1+2+\cdots+n}{n} = \frac{n+1}{2}, \qquad ASL_{\text{失败}} = n+1
$$

时间复杂度 $O(n)$。注意上面的 $ASL_{\text{成功}}$ 建立在"等概率"的假设上。如果各元素的查找概率已知且不等，**把高频元素放到前面**就能降低 ASL。

> **例 2（不等概率下的顺序优化）**
> 原表为 `7, 13, 19, 29, 37, 43`，各元素的查找概率依次为 `15%, 5%, 10%, 40%, 28%, 2%`。如何调整存储顺序使 ASL 最小？最小 ASL 是多少？

**思路**：查找长度随位置递增（第 1 个元素比较 1 次，第 $i$ 个比较 $i$ 次），所以概率大的元素应该放在前面。按概率降序重排即可。

**解**：概率降序为 29(40%)、37(28%)、7(15%)、19(10%)、13(5%)、43(2%)，优化后的顺序是 `29, 37, 7, 19, 13, 43`。

原序 $ASL = 0.15\times1 + 0.05\times2 + 0.10\times3 + 0.40\times4 + 0.28\times5 + 0.02\times6 = 3.67$；优化后 $ASL = 0.40\times1 + 0.28\times2 + 0.15\times3 + 0.10\times4 + 0.05\times5 + 0.02\times6 = 2.18$。

**评注**：不等概率顺序查找的优化原则是**概率降序排列**——把最高频的元素放到比较次数最少的位置，是一个贪心策略。本例 ASL 从 3.67 降到 2.18，降幅约 40%，"存储顺序影响效率"在顺序查找里体现得最直接。

### 有序表的顺序查找

如果表内元素**有序**（递增或递减），失败查找就可以提前终止：一旦遇到比 key 更大的元素，后面不必再比了。把顺序查找的比较过程画成树，就得到**查找判定树**：

![有序表顺序查找的判定树](/notes-assets/dsa7-02-search-decision-tree.jpg)

对这棵树有两条读法：

- 一个**成功结点**的查找长度 = 自身所在层数；
- 一个**失败结点**的查找长度 = 其**父结点**所在层数（失败发生在某个矩形区间里，进入该区间前已经比较过父结点）。

失败结点的 ASL 公式为：

$$
ASL_{\text{失败}} = \frac{1+2+\cdots+n+n}{n+1} = \frac{n}{2} + \frac{n}{n+1}
$$

有序表顺序查找在失败时能提前终止，所以 $ASL_{\text{失败}}$ 比无序表的 $n+1$ 小；但**成功时的 ASL 不变**，仍是 $\frac{n+1}{2}$——因为成功路径的平均长度与顺序无关。

> **注意**：判定树是本章的第一件通用工具。后面折半查找、BST、AVL 的效率分析全都沿用同一句话——**查找长度就是结点所在层数**，$ASL$ 就是各层结点数的加权平均。

## 折半查找

**折半查找**（Binary Search）把"有序"这一先验信息用到极致：每次与中间元素比较，把候选范围**减半**。$O(\log_2 n)$ 的复杂度使它成为静态有序表的首选。这一节的重点是**判定树**——把折半过程画成一棵平衡二叉树，从而严格推导 ASL。

### 适用条件与基本思想

折半查找的适用条件只有两条：**顺序存储**（数组）且**关键字有序**。基本思想是：比较目标值与区间中间元素，小于则到左半区继续，大于则到右半区继续，逐步缩小范围，直至命中或确认不存在。

**为什么链表不行**：折半查找每一步都要能 $O(1)$ 地取到区间的中间元素，这依赖数组的**随机访问**能力（由下标直接算出地址）。链表取第 $k$ 个元素必须从头遍历，代价 $O(k)$，折半省下的比较次数会被遍历开销吃掉，"折半"退化成一个没有意义的动作。所以**有序并不够，还得能随机访问**。

### 实现与溢出陷阱

```c
int Binary_Search(SSTable L, ElemType key) {
    int low = 0, high = L.TableLen - 1, mid;
    while (low <= high) {
        mid = (low + high) / 2;          // 可用 mid = low + (high-low)/2 防溢出
        if (L.elem[mid] == key)
            return mid;
        else if (L.elem[mid] > key)
            high = mid - 1;
        else
            low = mid + 1;
    }
    return -1;
}
```

> **注意**：`mid = (low + high) / 2` 在 `low` 与 `high` 都很大时可能**整数溢出**——两个大整数相加先溢出，再除 2 已经错了。安全写法是 `mid = low + (high - low) / 2`。在元素不多的场景里它不是问题，但工程代码里应当养成习惯。

### 判定树

把折半查找的比较过程画成二叉树，每个结点对应一次 `mid` 取值，这就是**判定树**：

![折半查找的比较过程](/notes-assets/dsa7-03-1-binary-search-example.jpg)

![折半查找的比较过程（续）](/notes-assets/dsa7-03-2-binary-search-example.jpg)

判定树有如下性质：

- 判定树一定是**平衡二叉树**，且满足**左 < 中 < 右**——它本身就是一棵二叉排序树；
- 树高 $h = \lceil \log_2 (n+1) \rceil$；
- 成功结点 $n$ 个，失败结点 $n+1$ 个（每个空隙对应一个失败位置）；
- 时间复杂度 $O(\log_2 n)$。

![折半查找的判定树](/notes-assets/dsa7-04-binary-search-decision-tree.jpg)

**判定树的构造规则**：每次取

$$
mid = \left\lfloor \frac{low + high}{2} \right\rfloor
$$

据此可以推出两条结构性结论：

- 若当前区间有**奇数**个元素，mid 分隔后左右两部分元素个数**相等**；
- 若当前区间有**偶数**个元素，mid 分隔后**左半部分比右半部分少一个元素**。

于是得到一条好用的推论：折半查找判定树中，对任一结点必有 $\text{右子树结点数} - \text{左子树结点数} = 0 \text{ 或 } 1$，即判定树"左瘦右胖"；若把 mid 改成 $\lceil (low+high)/2 \rceil$，得到的判定树就镜像对称。

> **例 3（判定树与 ASL 计算）**
> 对长度为 11 的有序表进行折半查找，画出判定树并计算 $ASL_{\text{成功}}$ 与 $ASL_{\text{失败}}$。

**思路**：按 $mid = \lfloor (low+high)/2 \rfloor$ 递归构造判定树（元素编号 1~11），再按"成功长度 = 层数、失败长度 = 父结点层数"统计。

**解**：根为 6；左子树区间 1-5 取 mid = 3，右子树区间 7~11 取 mid = 9，依次递归，得到

```
            6
         /     \
        3       9
       / \     / \
      1   4   7   10
       \   \   \    \
        2   5   8    11
```

各层结点数：第 1 层 1 个、第 2 层 2 个、第 3 层 4 个、第 4 层 4 个，共 11 个。

成功查找长度之和为 $1 \times 1 + 2 \times 2 + 3 \times 4 + 4 \times 4 = 33$，即 $ASL_{\text{成功}} = \frac{33}{11} = 3$。失败结点共 $n+1 = 12$ 个：第 3 层结点的空左子树 4 个（查找长度 3），第 4 层结点的空子树 8 个（查找长度 4）。

于是 $ASL_{\text{失败}} = \frac{3 \times 4 + 4 \times 8}{12} = \frac{44}{12} = \frac{11}{3} \approx 3.67$。

**评注**：把查找问题"树形化"是本章最重要的手法，后续 BST、AVL、B 树的 ASL 分析全都沿用这一思想。对 n = 11 的判定树，失败位置比成功结点多 1 个、平均代价略高于成功查找，这也是 $\frac{11}{3} > 3$ 的原因。

### 平均查找长度与比较次数上限

判定树的高度决定了查找成功的**比较次数上限**：最多比较 $h = \lceil \log_2 (n+1) \rceil$ 次就一定走到叶子，要么命中要么失败。

当 $n$ 恰好为 $2^h - 1$（判定树是一棵满二叉树）时，第 $i$ 层有 $2^{i-1}$ 个结点，可以精确求和：

$$
ASL_{\text{成功}} = \frac{1}{n}\sum_{i=1}^{h} i \cdot 2^{i-1} = \frac{(h-1)2^h + 1}{2^h - 1} = \frac{n+1}{n}\log_2(n+1) - 1
$$

当 $n$ 较大时 $\frac{n+1}{n}$ 趋近于 1，于是得到常用的近似结论：

$$
ASL_{\text{成功}} \approx \log_2 (n+1) - 1
$$

举例来说，$n = 11$ 时近似值为 $\log_2 12 - 1 \approx 3.58 - 1 = 2.58$，实测 3；$n = 1000$ 时近似值约 8.97，而比较次数上限是 10 次——**一千个元素里找目标最多比 10 次**，这就是折半查找的威力。

## 分块查找

**分块查找**（Block Search）又称索引顺序查找，是"索引 + 顺序"的混合策略：**块间有序、块内无序**。它用一张索引表换取查找速度，又保留了块内动态插入的灵活性，是折半查找与顺序查找的折中。

### 索引顺序表

索引表为每一个块记录两个信息：**块内最大关键字**与**块的存储区间**。

```c
struct Index {
    ElemType maxvalue;   // 块内最大关键字
    int low, high;       // 块在顺序表中的区间
};
ElemType List[100];      // 顺序表存储实际元素
```

![分块查找的思想](/notes-assets/dsa7-05-block-search.jpg)

查找分两步：先在索引表中定位目标可能所属的块，再在块内顺序查找。因为索引表按块的最大关键字有序，索引查找既可以用顺序查找，也可以用折半查找。若用折半查找且索引表中不含目标关键字，折半过程最终停在 `low > high`，此时应进入 `low` 所指的分块继续查找；若 `low` 已经越过最后一个块，则查找失败。

![分块查找示例](/notes-assets/dsa7-06-block-search-example.jpg)

静态的索引顺序表难以插入删除，可以用**链式存储**实现动态分块查找：每个块组织成链表，块满就分裂、块空就合并，索引表随之维护。

![动态分块查找的链式存储](/notes-assets/dsa7-07-dynamic-block-table.jpg)

### 查找效率与最优块长

设表长 $n$，分成 $b$ 块，每块 $s$ 个元素，则 $n = b \cdot s$。查找代价由两段组成，即 $ASL = L_I + L_S$，其中 $L_I$ 是索引查找的代价，$L_S$ 是块内顺序查找的代价。

| 索引查找方式 | ASL 公式 | 最优块长 $s$ | 最小 ASL |
| :--- | :--- | :---: | :---: |
| 顺序查找索引 | $\frac{b+1}{2} + \frac{s+1}{2}$ | $\sqrt{n}$ | $\sqrt{n} + 1$ |
| 折半查找索引 | $\lceil \log_2(b+1) \rceil + \frac{s+1}{2}$ | — | — |

**块长取 $\sqrt{n}$ 最优的推导**：索引用顺序查找时，把 $b = n/s$ 代入，

$$
ASL = \frac{b+1}{2} + \frac{s+1}{2} = \frac{n/s + s}{2} + 1
$$

由基本不等式 $n/s + s \ge 2\sqrt{n}$，当且仅当 $n/s = s$、即 $s = \sqrt{n}$ 时取等号，于是

$$
ASL_{\min} = \frac{2\sqrt{n}}{2} + 1 = \sqrt{n} + 1
$$

直观理解：**两个阶段的开销最均衡时总开销最小**。块太长，块内比较多；块太多，索引比较多；让两者相等正好把总代价压到最低。

> **例 4（最优块长的选取）**
> 有 100 个元素，采用分块查找且索引表用顺序查找。每块多少个元素时 ASL 最小？最小 ASL 是多少？

**思路**：由 $s = \sqrt{n}$ 直接得最优块长；若想验证，可对 $ASL = \frac{n/s + s}{2} + 1$ 求极值点。

**解**：最优块长 $s = \sqrt{100} = 10$，块数 $b = 100/10 = 10$。

此时 $ASL = \frac{10+1}{2} + \frac{10+1}{2} = 5.5 + 5.5 = 11$，恰好等于 $\sqrt{100} + 1$。

**评注**："两块开销均衡"是这类问题的通用解法：只要总代价能写成"$A$ 与 $B$ 之和、且 $A \cdot B$ 为常数"的形式，令 $A = B$ 即得最优。若索引表改用折半查找，索引开销从 $O(b)$ 降为 $O(\log b)$，此时块长取大一些反而更优——因为块内顺序查找变成了主要成本。

### 三种静态查找算法对比

| 查找算法 | 适用结构 | 时间复杂度 | 适用场景 |
| :--- | :--- | :---: | :--- |
| 顺序查找 | 顺序表 / 链表 | $O(n)$ | 无序或小数据量 |
| 折半查找 | 有序顺序表 | $O(\log_2 n)$ | 有序静态表 |
| 分块查找 | 顺序表 + 索引表 | $O(\sqrt{n})$ | 动态变化的数据 |

## 树形查找

### 二叉排序树（BST）

树形查找把"有序"从数组搬进树：**二叉排序树**是基础，但插入序列有序时会退化成链表；**AVL 树**用严格平衡（平衡因子只有 $-1, 0, 1$）保证树高 $O(\log n)$，适合以查为主的场景；**红黑树**用宽松平衡（最长路径不超过最短路径的两倍）换取插入删除时只有常数次旋转，成为工程标配。三者层层递进：先解决"怎么查"，再解决"怎么一直查得快"。

#### 定义与中序性质

**二叉排序树**（BST, Binary Search Tree）又称二叉查找树、二叉搜索树，它或者是一棵空树，或者满足：

- **左子树上所有结点的关键字 < 根结点的关键字**；
- **右子树上所有结点的关键字 > 根结点的关键字**；
- 左右子树本身也各是一棵二叉排序树。

BST的中序性质：**中序遍历一棵 BST 得到递增有序序列**。这条性质使 BST 同时具备"查找树"与"有序序列"两重身份——所以它能做散列表做不到的事：按序输出、查第 K 小、范围检索。

#### 结点结构与创建

```c
typedef enum { OK = 1, ERROR = 0 } Status;

typedef struct BSTNode {
    int data;
    struct BSTNode* left;
    struct BSTNode* right;
    struct BSTNode* parent;   // 指向父结点（便于找前驱后继和 LCA）
} BSTNode;

BSTNode* CreateNode(int data) {
    BSTNode* n = (BSTNode*)malloc(sizeof(BSTNode));
    if (n == NULL) return NULL;
    n->data = data;
    n->left = n->right = n->parent = NULL;
    return n;
}
```

#### 查找

```c
// 递归版
BSTNode* BSTSearch(BSTNode* root, int key) {
    if (root == NULL || root->data == key) return root;
    if (key < root->data) return BSTSearch(root->left, key);
    else return BSTSearch(root->right, key);
}

// 迭代版
BSTNode* BSTSearchIter(BSTNode* root, int key) {
    while (root != NULL) {
        if (key == root->data) return root;
        else if (key < root->data) root = root->left;
        else root = root->right;
    }
    return NULL;
}
```

查找每深入一层，候选范围就缩小到其中一棵子树——这正是 BST 中"排序"二字的威力：**比较一次，排除一整棵子树**。

#### 插入

```c
Status BSTInsert(BSTNode** root, int data) {
    BSTNode* newNode = CreateNode(data);
    if (newNode == NULL) return ERROR;
    if (*root == NULL) { *root = newNode; return OK; }
    BSTNode *cur = *root, *parent = NULL;
    while (cur != NULL) {
        parent = cur;
        if (data < cur->data) cur = cur->left;
        else if (data > cur->data) cur = cur->right;
        else { free(newNode); return ERROR; }  // 已存在的关键字，不再插入
    }
    newNode->parent = parent;
    if (data < parent->data) parent->left = newNode;
    else parent->right = newNode;
    return OK;
}
```

![BST 插入示例](/notes-assets/dsa7-08-bst-insert.jpg)

> **注意**：新插入的结点**一定是叶子结点**——插入只是把新结点挂到某个已有结点的空指针上，从不改动已有结点的结构。这保证了插入不会破坏 BST 的性质，但也意味着**插入无法自行纠正不平衡**：树越插越偏，正是后面 AVL 与红黑树要解决的问题。

#### 删除

删除分三种情况，分开讨论是理解 BST 删除的关键：

**叶子结点**：直接摘掉，把父结点对应的孩子指针置空；

**单孩子结点**：用它的孩子顶替它的位置（孩子整棵子树顶上来）；

**双子结点**：不能直接删。做法是用**中序后继**（右子树中最左下的结点，也就是比它大的最小关键字）的值覆盖它，再转为删除那个后继结点。

第三种情况能这样化归，是因为**中序后继至多只有一个孩子**（它没有左孩子），所以删它必然落回前两种情况。

```c
Status BSTDelete(BSTNode** root, int key) {
    // 1. 定位目标结点，同时记录它的父结点
    BSTNode *target = *root, *parent = NULL;
    while (target != NULL && target->data != key) {
        parent = target;
        if (key < target->data) target = target->left;
        else target = target->right;
    }
    if (target == NULL) return ERROR;         // 未找到

    // 2. 双子结点：用中序后继的值覆盖，转化为删除后继结点
    if (target->left != NULL && target->right != NULL) {
        BSTNode* succParent = target;
        BSTNode* succ = target->right;
        while (succ->left != NULL) { succParent = succ; succ = succ->left; }
        target->data = succ->data;            // 值覆盖
        parent = succParent;                  // 待删结点改成 succ，父结点同步更新
        target = succ;
    }

    // 3. 此时 target 至多一个孩子：用孩子（或 NULL）顶替它
    BSTNode* child = (target->left != NULL) ? target->left : target->right;
    if (parent == NULL)
        *root = child;                        // 删除的是根
    else if (parent->left == target)
        parent->left = child;
    else
        parent->right = child;
    if (child != NULL) child->parent = parent;
    free(target);
    return OK;
}
```

![BST 删除示例](/notes-assets/dsa7-09-bst-delete.jpg)

> **注意**：删除的核心技巧是**化归**——把所有情况都收敛到"叶子或单孩子"这一种。注意第二步里 `parent` 必须跟着 `target` 一起更新为后继的父结点：后继通常不是原结点的直接右孩子，忘记更新会挂错指针。同样地，若被删的正是根，`parent` 为 `NULL`，必须单独处理。

#### 前驱与后继

中序前驱就是"比当前结点小的最大关键字"，中序后继是"比当前结点大的最小关键字"，两者求法完全对称，各分两种情况：

**有对应子树**：前驱取左子树的**最右**结点，后继取右子树的**最左**结点（一路向下找最值）；

**没有对应子树**：沿 `parent` 链向上走，找到第一个"自己是父结点的右孩子"的祖先，该祖先就是后继；前驱则找第一个"自己是父结点的左孩子"的祖先（一路向上找拐点）。

```c
BSTNode* GetMin(BSTNode* root) {
    while (root && root->left) root = root->left;
    return root;
}

BSTNode* GetMax(BSTNode* root) {
    while (root && root->right) root = root->right;
    return root;
}

BSTNode* Predecessor(BSTNode* node) {
    if (node->left) return GetMax(node->left);       // 左子树的最右下
    BSTNode* cur = node;
    while (cur->parent && cur == cur->parent->left)  // 沿父链向上找拐点
        cur = cur->parent;
    return cur->parent;
}

BSTNode* Successor(BSTNode* node) {
    if (node->right) return GetMin(node->right);     // 右子树的最左下
    BSTNode* cur = node;
    while (cur->parent && cur == cur->parent->right)
        cur = cur->parent;
    return cur->parent;
}
```

> **例 5（BST 的构造、中序验证与删除）**
> 依次插入 50, 30, 70, 20, 40, 60, 80, 35 构造 BST。① 写出最终树形与中序序列；② 求等概率查找的 $ASL_{\text{成功}}$；③ 删除关键字 30，写出删除后的树。

**思路**：插入按"小左大右"逐点定位；中序遍历可以验证有序性；删除 30 属于双子情况，用中序后继替换。

**解**：① 逐点插入后树形为

```
        50
      /    \
     30     70
    / \    /  \
   20  40 60   80
      /
     35
```

中序序列为 **20, 30, 35, 40, 50, 60, 70, 80**，递增有序，验证通过。

② 成功查找长度等于结点所在层数：50 在第 1 层，30、70 在第 2 层，20、40、60、80 在第 3 层，35 在第 4 层，于是

于是 $ASL_{\text{成功}} = \frac{1+2+2+3+3+3+3+4}{8} = \frac{21}{8} = 2.625$。

③ 删除 30：它有左右两个孩子（20 与 40），取中序后继 = 40 子树的最左下 = **35**。用 35 覆盖 30 所在结点，再删除原来的 35 结点（它是叶子，直接摘掉）：

```
        50
      /    \
     35     70
    / \    /  \
   20  40 60   80
```

中序序列为 **20, 35, 40, 50, 60, 70, 80**，仍然有序。

**评注**：用前驱（左子树最右）替换也同样可行，只是代码里通常取后继，写起来更顺手。$ASL$ 计算中"查找长度 = 层数"与折半判定树完全一致——由此可见 **BST 的效率分析是折半判定树分析的一般化**，只是 BST 的树形由插入顺序决定，而折半判定树由 mid 的取整方式决定。

#### 查找效率与退化风险

| 情况 | 树高 | ASL | 条件 |
| :--- | :---: | :---: | :--- |
| 最好（尽量平衡） | $\lfloor \log_2 n \rfloor + 1$ | $O(\log_2 n)$ | 插入序列随机 |
| 最坏（单支） | $n$ | $O(n)$ | 插入序列有序 |

> **例 6（BST 退化为单支树）**
> 将有序序列 1, 2, 3, 4, 5 依次插入一棵空的 BST，求查找成功的 ASL，并与例 5 对比。

**思路**：每个新结点都大于前一个，全部落在右链上，树退化为单链表。

**解**：树形是一条右链 1 → 2 → 3 → 4 → 5，各结点查找长度分别是 1, 2, 3, 4, 5：

于是 $ASL_{\text{成功}} = \frac{1+2+3+4+5}{5} = 3$。

例 5 中 8 个结点的 ASL 是 2.625，而这里 5 个结点的 ASL 反而更大——**结点更少却更慢**。

**评注**：这是 BST 的致命弱点——**插入序列有序时，BST 与顺序查找无异**。实际系统里数据常常有序到达（时间戳、自增 ID、已排序的导入数据），所以生产环境不能只依赖裸 BST，必须用 AVL 或红黑树这类自平衡结构。

#### 进阶操作：高度、结点数与第 K 小

```c
int GetHeight(BSTNode* root) {
    if (root == NULL) return 0;
    int lh = GetHeight(root->left);
    int rh = GetHeight(root->right);
    return (lh > rh ? lh : rh) + 1;
}

int CountNodes(BSTNode* root) {
    if (root == NULL) return 0;
    return CountNodes(root->left) + CountNodes(root->right) + 1;
}

int GetLevel(BSTNode* node) {       // 利用 parent 指针，O(深度)
    int level = 0;
    while (node) { level++; node = node->parent; }
    return level;
}
```

"第 K 小"与"范围查询"都直接建立在**中序有序**之上：中序遍历中第 k 个被访问的结点就是第 k 小；中序遍历里落在闭区间 $[lo, hi]$ 内的值就是范围查询的结果。

```c
// 中序遍历到第 k 个即停止
void _FindKth(BSTNode* root, int k, int* cnt, int* result) {
    if (root == NULL || *cnt >= k) return;
    _FindKth(root->left, k, cnt, result);
    (*cnt)++;
    if (*cnt == k) { *result = root->data; return; }
    _FindKth(root->right, k, cnt, result);
}

int FindKth(BSTNode* root, int k) {
    if (root == NULL || k < 1 || k > CountNodes(root)) return -1;
    int cnt = 0, result = -1;
    _FindKth(root, k, &cnt, &result);
    return result;
}

// RangeQuery —— 中序遍历，筛出 [lo, hi] 范围内的值
void RangeQuery(BSTNode* root, int lo, int hi, int* result, int* cnt) {
    if (root == NULL) return;
    RangeQuery(root->left, lo, hi, result, cnt);
    if (root->data >= lo && root->data <= hi)
        result[(*cnt)++] = root->data;
    RangeQuery(root->right, lo, hi, result, cnt);
}
```

**支持排序与范围查询正是 BST 相对散列表的独有优势**：散列表只能做等值查询，而 BST 可以按顺序遍历、按名次取元素、按区间检索。若"第 K 小"被频繁调用，还可以给结点增加一个 `size` 字段记录子树规模，把复杂度从 $O(n)$ 降到 $O(\log n)$——典型的用空间换时间。

#### 平衡判断与最低公共祖先

```c
int IsBalanced(BSTNode* root) {
    if (root == NULL) return 1;
    int lh = GetHeight(root->left);
    int rh = GetHeight(root->right);
    if (abs(lh - rh) > 1) return 0;
    return IsBalanced(root->left) && IsBalanced(root->right);
}

// 最低公共祖先 —— 利用 parent 指针
BSTNode* LCA(BSTNode* a, BSTNode* b) {
    int da = GetLevel(a), db = GetLevel(b);
    while (da > db) { a = a->parent; da--; }    // 先对齐深度
    while (db > da) { b = b->parent; db--; }
    while (a != b) { a = a->parent; b = b->parent; }  // 再同步上移
    return a;
}
```

LCA 的"**深度对齐后同步上移**"是经典技巧：先把两个结点提到同一深度，再同时向上走，首次相遇处就是最低公共祖先。这个技巧只用到了 `parent` 指针，**不依赖 BST 的关键字性质**，对一般二叉树同样适用。

#### 重复关键字的处理

标准 BST 通常规定"关键字互不相同"，插入重复关键字直接拒绝。若业务上需要统计重复次数，可以在结点里加一个计数字段：插入时遇到相同关键字就令计数加一；删除时若计数大于 1 则只递减，等于 1 才真正执行标准删除。

```c
typedef struct CountBSTNode {
    int data;
    int count;             // 出现次数
    struct CountBSTNode *left, *right, *parent;
} CountBSTNode;

Status CountBSTInsert(CountBSTNode** root, int data) {
    // 先查找插入位置
    CountBSTNode *cur = *root, *parent = NULL;
    while (cur != NULL) {
        parent = cur;
        if (data < cur->data) cur = cur->left;
        else if (data > cur->data) cur = cur->right;
        else { cur->count++; return OK; }  // 重复关键字：只增加计数
    }
    // 新结点：count 初始为 1
    CountBSTNode* node = (CountBSTNode*)malloc(sizeof(CountBSTNode));
    node->data = data; node->count = 1;
    node->left = node->right = NULL; node->parent = parent;
    if (parent == NULL) *root = node;
    else if (data < parent->data) parent->left = node;
    else parent->right = node;
    return OK;
}

// 计数感知删除：count > 1 时仅递减
Status CountBSTDelete(CountBSTNode** root, int key) {
    CountBSTNode* target = *root;
    while (target && target->data != key) {
        if (key < target->data) target = target->left;
        else target = target->right;
    }
    if (target == NULL) return ERROR;
    if (target->count > 1) { target->count--; return OK; }
    // count == 1：执行标准 BST 删除（三种情况，见 5.5 节）
    return OK;
}
```

> **例 7（第 K 小与范围查询）**
> 基于例 5 中删除 30 之后的 BST（中序为 20, 35, 40, 50, 60, 70, 80），求第 3 小元素与区间 [30, 60] 内的所有元素。

**思路**：第 K 小就是中序遍历的第 k 个；范围查询就是把中序遍历中落在区间内的值全筛出来。

**解**：中序序列为 20, 35, 40, 50, 60, 70, 80。

- 第 3 小 = **40**（第 1、2 小分别是 20、35）；
- 区间 [30, 60] 内的元素 = **35, 40, 50, 60**。

**评注**：两个操作的朴素实现都是 $O(n)$，因为都依赖一次完整的中序遍历。而数据库里范围查询能做到 $O(\log n + k)$（$k$ 为结果个数），靠的正是 B+ 树把叶子结点串成链表，再加上分支结点只存索引——见第 8 节。

### 平衡二叉树（AVL）

BST 的退化说明"有序"还不够，还得**主动维持平衡**。AVL 树给出的方案最严格：任何结点的左右子树高度差都不超过 1。代价是每次插入删除都要检查并旋转修复，收益是树高被死死钉在 $O(\log n)$。

#### 定义与平衡因子

**平衡因子**（Balance Factor, BF）定义为

$$
BF = \text{左子树高度} - \text{右子树高度}
$$

**平衡二叉树**（AVL 树）是一棵二叉排序树，且**任一结点的平衡因子只可能是 $-1$、$0$、$1$**。换句话说，任何结点的左右子树高度差不超过 1。

```c
struct AVLNode {
    int key;
    int height;             // 当前结点的高度（便于快速计算平衡因子）
    struct AVLNode *left, *right;
};

int GetHeight(AVLNode* node) {
    return node ? node->height : 0;
}

int GetBalance(AVLNode* node) {
    return node ? GetHeight(node->left) - GetHeight(node->right) : 0;
}
```

> **注意**：把高度缓存在结点里是 AVL 的常见实现方式——否则每算一次平衡因子都要递归求高度，整体复杂度会退化。

#### AVL 的旋转

插入会沿途增加某些祖先的高度，可能让某个祖先的 $|BF|$ 变成 2。修复的抓手是**最小不平衡子树**：从插入点向上找到的**第一个** $|BF| = 2$ 的祖先。按"新结点插在它的哪一侧的哪一侧"，只有四种情形：

| 失配类型 | 场景 | 旋转方式 | 记忆口诀 |
| :--- | :--- | :--- | :--- |
| **LL** | 在左子树的**左**子树上插入 | 右单旋 | 左左，向右转 |
| **RR** | 在右子树的**右**子树上插入 | 左单旋 | 右右，向左转 |
| **LR** | 在左子树的**右**子树上插入 | 先左旋左子树，再右旋根 | 左右，先左后右 |
| **RL** | 在右子树的**左**子树上插入 | 先右旋右子树，再左旋根 | 右左，先右后左 |

![AVL 的 LL 旋转与 RR 旋转](/notes-assets/dsa7-10-1-avl-ll-rr.jpg)

![AVL 的 LR 旋转与 RL 旋转](/notes-assets/dsa7-10-2-avl-lr-rl.jpg)

*四种旋转的共同效果是：把"高"的那条链往上提，同时保持中序序列不变。*

```c
// 右单旋（用于 LL）
AVLNode* RotateRight(AVLNode* y) {
    AVLNode* x = y->left;
    AVLNode* T2 = x->right;
    x->right = y;                        // x 的右孩子变为 y
    y->left = T2;                        // y 的左孩子变为 x 的原右子树
    y->height = 1 + max(GetHeight(y->left), GetHeight(y->right));
    x->height = 1 + max(GetHeight(x->left), GetHeight(x->right));
    return x;                            // 返回新的子树根
}

// 左单旋（用于 RR）
AVLNode* RotateLeft(AVLNode* x) {
    AVLNode* y = x->right;
    AVLNode* T2 = y->left;
    y->left = x;                         // y 的左孩子变为 x
    x->right = T2;                       // x 的右孩子变为 y 的原左子树
    x->height = 1 + max(GetHeight(x->left), GetHeight(x->right));
    y->height = 1 + max(GetHeight(y->left), GetHeight(y->right));
    return y;                            // 返回新的子树根
}

// AVL 插入（含自平衡）
AVLNode* AVLInsert(AVLNode* root, int key) {
    // 1. 标准 BST 插入
    if (root == NULL) {
        AVLNode* node = (AVLNode*)malloc(sizeof(AVLNode));
        node->key = key; node->height = 1;
        node->left = node->right = NULL;
        return node;
    }
    if (key < root->key)
        root->left = AVLInsert(root->left, key);
    else if (key > root->key)
        root->right = AVLInsert(root->right, key);
    else
        return root;                    // 重复关键字不做处理

    // 2. 更新高度
    root->height = 1 + max(GetHeight(root->left), GetHeight(root->right));

    // 3. 检查平衡因子并旋转
    int balance = GetBalance(root);

    // LL 型：左子树高，且 key 落在左子树的左边
    if (balance > 1 && key < root->left->key)
        return RotateRight(root);
    // RR 型：右子树高，且 key 落在右子树的右边
    if (balance < -1 && key > root->right->key)
        return RotateLeft(root);
    // LR 型：左子树高，且 key 落在左子树的右边
    if (balance > 1 && key > root->left->key) {
        root->left = RotateLeft(root->left);
        return RotateRight(root);
    }
    // RL 型：右子树高，且 key 落在右子树的左边
    if (balance < -1 && key < root->right->key) {
        root->right = RotateRight(root->right);
        return RotateLeft(root);
    }
    return root;
}
```

双旋的本质是"**先扳直、再平衡**"：LR 型先把"左孩子的右偏"通过一次左旋变成 LL 形态，再对根右旋；RL 型同理。旋转只改指针不改数据，**中序遍历序列在旋转前后完全不变**，这就是旋转正确性的根本保证。

#### 最小不平衡子树的判定

判定过程可以固定成一个两步流程：先找失衡结点，再看它孩子的平衡因子。

```
失衡结点平衡因子 =  2 → 左孩子平衡因子 =  1 → LL 型（右单旋）
                                      = -1 → LR 型（先左后右双旋）
                  = -2 → 右孩子平衡因子 =  1 → RL 型（先右后左双旋）
                                      = -1 → RR 型（左单旋）
```

![AVL 最小不平衡子树的判定](/notes-assets/dsa7-11-avl-min-unbalanced-subtree.jpg)

> **注意**：口诀是"**失衡结点正 2 看左孩，负 2 看右孩；子孩同号单旋，异号双旋**"。插入时判定还可以直接用 key 与左右孩子的大小关系（代码就是这么做）；而删除时被删结点已经不在树里了，只能靠孩子的平衡因子来判。若同时有多个祖先失衡，只需修复**最近的那个**（最小不平衡子树），修好之后整棵树就恢复平衡了。

> **例 8（AVL 插入与旋转演示）**
> 依次向空的 AVL 树插入 14, 9, 5, 17, 11, 12，写出每次失衡后的旋转与最终树形。

**思路**：每插入一个结点，从插入点向上找第一个 $|BF| = 2$ 的祖先，再按"失衡结点与孩子的平衡因子符号"判定旋转类型。

**解**：

① 插入 14、9、5：14 为根，9 为 14 的左孩子，5 为 9 的左孩子。此时 14 的 $BF = 2 - 0 = +2$，左孩子 9 的 $BF = +1$，同号 → **LL 型，对 14 右单旋**：

```
       9
      / \
     5   14
```

② 插入 17、11：17 落在 14 的右，11 落在 14 的左，9 的 $BF = 1 - 2 = -1$，全树仍平衡。

③ 插入 12：12 > 9 且 12 < 14 且 12 > 11，落在 11 的右：

```
          9
        /   \
       5     14
            /  \
           11   17
             \
              12
```

此时 9 的 $BF = 1 - 3 = -2$，右孩子 14 的 $BF = +1$，**异号 → RL 型，先右旋 14 再左旋 9**。

右旋 14 后（11 被提上来）：

```
          9
        /   \
       5     11
               \
                14
              /    \
             12     17
```

再左旋 9，得到最终树：

```
         11
        /  \
       9    14
      /    /  \
     5    12   17
```

平衡校验：11 的 $BF = 0$，9 的 $BF = +1$，14 的 $BF = 0$，全部落在 $\{-1, 0, 1\}$ 内。中序序列 5, 9, 11, 12, 14, 17 递增有序。

**评注**：本例的关键是**找准失衡结点**。失衡的是根 9（左高 1、右高 3），不是 11；把失衡结点认错，后面的旋转类型和结果就全错了。

完整插入序列 14, 9, 5, 17, 11, 12, 7, 19, 16, 27 的构造过程如下：

![AVL 构造示例](/notes-assets/dsa7-12-avl-construction.jpg)

在例 8 的最终树（根为 11）基础上继续：

- 插入 **7**：落在 5 的右，9 的 $BF = 2 - 2 = 0$，无需旋转；
- 插入 **19**：落在 17 的右，14 的 $BF = 2 - 2 = 0$，无需旋转；
- 插入 **16**：落在 17 的左，17 的 $BF = 1 - 1 = 0$，无需旋转；
- 插入 **27**：落在 19 的右，19 的 $BF = -1$、17 的 $BF = -1$，而 **14 的 $BF = 1 - 3 = -2$**，属 **RR 型**（右孩子 17 的 $BF = -1 \le 0$）→ 对 14 左单旋。

旋转后的最终树为

```
          11
        /    \
       9      17
      /      /  \
     5      14   19
      \    /  \    \
       7  12  16   27
```

树高 4，中序序列 5, 7, 9, 11, 12, 14, 16, 17, 19, 27 递增有序，所有结点的 $|BF| \le 1$。

#### 查找效率与高度界

设 $n_h$ 为高度为 $h$ 的 AVL 树所含的**最少结点数**。要让结点尽量少，根的两棵子树必须一棵高 $h-1$、一棵高 $h-2$（差 1，刚好不违反平衡条件），于是

$$
n_0 = 0,\quad n_1 = 1,\quad n_2 = 2,\quad n_h = n_{h-1} + n_{h-2} + 1
$$

这个递推式与斐波那契数列同构，通项中会出现黄金分割比 $\phi = \frac{1+\sqrt{5}}{2}$：

$$
n_h \approx \frac{\phi^{h+2}}{\sqrt{5}} - 1
$$

反解即得 AVL 树的高度上界：

$$
h < \frac{3}{2}\log_2 (N+1)
$$

也就是说，**含 $n$ 个结点的 AVL 树，树高始终是 $O(\log_2 n)$**，查找、插入、删除都是 $O(\log n)$。

> **例 9（AVL 的最少结点数）**
> 高度为 5 的 AVL 树至少有多少个结点？反过来，12 个结点的 AVL 树最大高度是多少？

**思路**：套用递推 $n_h = n_{h-1} + n_{h-2} + 1$——最省的构造是"根 + 尽量矮的左子树 + 尽量矮的右子树"。

**解**：由 $n_1 = 1$、$n_2 = 2$ 出发：

$$
n_3 = 2 + 1 + 1 = 4,\quad n_4 = 4 + 2 + 1 = 7,\quad n_5 = 7 + 4 + 1 = 12
$$

高度为 5 的 AVL 树至少 **12** 个结点；反过来，12 个结点的 AVL 树最大高度为 5（因为 11 个结点最多只能到高度 4，而 $n_5 = 12$）。

**评注**："少到不能再少的 AVL"就是左右子树高度差恰好为 1 的极值树。把 $n_h \ge \phi^{h}$ 取对数，就能反解出 $h \le \log_\phi n$，再换底得 $\log_\phi n = \frac{\log_2 n}{\log_2 \phi} \approx 1.44\log_2 n$——这正是上界里 $3/2$ 的来历。

#### 删除与平衡调整

AVL 的删除建立在 BST 删除的基础上：先按 BST 的方式删掉结点，然后**从被删位置向上回溯到根**，逐个检查祖先的平衡因子并修复失衡。

**算法步骤**：

1. 执行标准 BST 删除（双子结点用后继替换，转化为删叶子或单孩子结点）；
2. 从被修改的位置向上回溯，对路径上的每个祖先：更新高度 → 计算平衡因子 → 若 $|BF| = 2$ 则判定类型并旋转；
3. 一直回溯到根结点才停止。

![AVL 树删除结点示例](/notes-assets/dsa7-13-avl-delete.jpg)

> **注意**：删除与插入的回溯范围**不一样**。插入只需修复第一个失衡祖先，修好之后整棵树就平衡了，可以立即停止；删除则会**降低子树高度**，上游本来刚好平衡的祖先可能被连锁打破，因此必须一路回溯到根。这也是"删除比插入麻烦"的根源。

```c
AVLNode* AVLDelete(AVLNode* root, int key) {
    // 1. 标准 BST 删除
    if (root == NULL) return root;
    if (key < root->key)
        root->left = AVLDelete(root->left, key);
    else if (key > root->key)
        root->right = AVLDelete(root->right, key);
    else {
        // 单孩子或叶子
        if (root->left == NULL) {
            AVLNode* temp = root->right;
            free(root);
            return temp;
        } else if (root->right == NULL) {
            AVLNode* temp = root->left;
            free(root);
            return temp;
        }
        // 双子：用中序后继替换，再递归删除后继
        AVLNode* succ = root->right;
        while (succ->left) succ = succ->left;
        root->key = succ->key;
        root->right = AVLDelete(root->right, succ->key);
    }

    // 2. 更新高度
    root->height = 1 + max(GetHeight(root->left), GetHeight(root->right));

    // 3. 检查平衡并旋转（复用插入时的 RotateRight / RotateLeft）
    int balance = GetBalance(root);

    // LL：左子树高，且左子树的左子树不矮于它的右子树
    if (balance > 1 && GetBalance(root->left) >= 0)
        return RotateRight(root);
    // LR：左子树高，但左子树的右子树更高
    if (balance > 1 && GetBalance(root->left) < 0) {
        root->left = RotateLeft(root->left);
        return RotateRight(root);
    }
    // RR：右子树高，且右子树的右子树不矮于它的左子树
    if (balance < -1 && GetBalance(root->right) <= 0)
        return RotateLeft(root);
    // RL：右子树高，但右子树的左子树更高
    if (balance < -1 && GetBalance(root->right) > 0) {
        root->right = RotateRight(root->right);
        return RotateLeft(root);
    }
    return root;
}
```

删除时的判定方式与插入**不同**：插入时可以用 key 与左右孩子的大小关系判类型，删除时被删结点已经不在树里了，只能看孩子的平衡因子：

| 失衡条件 | 左孩子 BF | 右孩子 BF | 旋转类型 |
| :--- | :---: | :---: | :--- |
| $BF = 2$（左高） | $\ge 0$ | — | **LL**（右单旋） |
| $BF = 2$（左高） | $< 0$ | — | **LR**（先左后右双旋） |
| $BF = -2$（右高） | — | $\le 0$ | **RR**（左单旋） |
| $BF = -2$（右高） | — | $> 0$ | **RL**（先右后左双旋） |

> **注意**：LL 的判定条件是 $\ge 0$ 而不是 $> 0$。当左孩子的 $BF = 0$（它的左右子树等高）时，LL 单旋与 LR 双旋都能恢复平衡，选更简单的 LL 单旋即可。照抄插入代码写成 $> 0$ 就会误判成 LR。

**三个删除示例**。以如下 AVL 树为起点：

```
        5
       / \
      3   8
     /   / \
    2   6   10
```

- **删除 6**（叶子）：直接移除。回溯 8：左高 0、右高 1，$BF = -1$；回溯 5：左右均高 2，$BF = 0$。全程无需旋转。
- **删除 2**（叶子）：移除后回溯 3，$BF = -1$；再回溯 5，左高 1、右高 3，**$BF = -2$**，且右孩子 8 的右子树更高（$BF(8) = -1 \le 0$）→ **RR 型**，对 5 左单旋。
- **删除 8**（有双子）：用中序后继 10 覆盖 8，转化为删除叶子 10；回溯到 10 的父结点 8：左高 1（结点 6）、右高 0，$BF = 1$，无需旋转。

> **注意**：删除的旋转次数——插入最多需要 1 次旋转（单旋或双旋）；删除在最坏情况下可能需要 $O(\log n)$ 次旋转，因为路径上每个祖先都可能依次失衡。这正是实际工程中红黑树更受欢迎的原因之一：红黑树的插入和删除都只需常数次旋转与染色，更适合频繁写入的场景。

### 红黑树（RBT）

AVL 的平衡太"紧"了：任何高度差超过 1 都要立刻修，代价是删除时可能沿路径旋转很多次。红黑树换了个思路——**用颜色约束代替高度约束**，只保证"最长路径不超过最短路径的两倍"这种**近似平衡**，从而把插入删除的调整次数压到常数级。它是 C++ `std::map`、Java `TreeMap`、Linux 内核 CFS 调度器都在用的结构。

#### 红黑树的性质

**红黑树**（Red-Black Tree, RBT）是满足以下五条性质的二叉排序树：

1. 每个结点是**红色**或**黑色**；
2. **根结点是黑色**；
3. 叶结点（NULL / 外部结点）是黑色；
4. 不存在两个相邻的红结点（红结点的父结点与子结点都必须是黑色）；
5. 对每个结点，从该结点到任一叶结点的所有简单路径上，所含**黑结点数目相同**，这个数目称为该结点的**黑高**（$bh$）。

![红黑树示例](/notes-assets/dsa7-14-red-black-tree.jpg)

记忆口诀：**左根右，根叶黑，不红红，黑路同**——"左根右"是 BST 性质，"根叶黑"是性质 2 与 3，"不红红"是性质 4，"黑路同"是性质 5。

```c
struct RBNode {
    int key;
    RBNode *parent;
    RBNode *left, *right;
    int color;   // 0 = BLACK, 1 = RED
};
```

#### 核心性质与查找效率

由性质 4、5 可以直接推出三条结论：

1. 从根到叶的**最长路径不超过最短路径的 2 倍**。最短路径全是黑结点（长度为 $bh$）；最长路径必然是"黑红交替"，红结点不能相邻，所以长度至多 $2bh$。
2. 有 $n$ 个内部结点的红黑树，高度满足 $h \le 2\log_2(n+1)$。
3. 查找的时间复杂度为 $O(\log_2 n)$。

> **注意**：性质 5 之所以用"到叶结点的路径"来定义，是因为红黑树里的 NULL 也算黑色叶结点——把空指针补成叶结点，全树才是一棵"每个结点都有两个孩子"的满结构，黑高才有统一口径。

#### AVL 与红黑树的对比

| 对比维度 | AVL 树 | 红黑树 |
| :--- | :--- | :--- |
| **平衡条件** | 严格（平衡因子为 $-1, 0, 1$） | 宽松（最长路径不超过最短路径的 2 倍） |
| **树高** | 更矮 | 稍高（最坏约 2 倍） |
| **查找速度** | 稍快（树更矮） | 稍慢 |
| **插入的旋转次数** | 最多 1 次（单旋或双旋） | 最多 2 次，另加染色 |
| **删除的旋转次数** | 最坏 $O(\log n)$ 次 | 最多 3 次，另加染色 |
| **适用场景** | 以查为主、很少增删 | **频繁插入删除** |

**为什么工程上更常用**：真实系统的读写比例里，插入删除往往并不比查询少——日志、缓存、索引、调度器都在不停增删。AVL 把高度压到最低，换来的是"每次写入都可能沿路径反复旋转"；红黑树牺牲一点查找速度（树高最坏是 AVL 的两倍，但仍是 $O(\log n)$，常数很小），换取**插入删除调整次数为常数**。这笔交易在绝大多数工程场景里都划算。

#### 插入与修复

插入的思路是两步：**先把新结点染红**（染红不改变任何路径的黑结点数目，因此不破坏性质 5），再检查是否违反性质 2 与性质 4，违反就修复。修复的全部依据是**叔结点的颜色**。

```c
// 红黑树插入（含修复）
RBNode* InsertRB(RBNode* root, int key);
void InsertFixup(RBNode** root, RBNode* z);

void InsertFixup(RBNode** root, RBNode* z) {
    while (z->parent && z->parent->color == RED) {
        RBNode* grandparent = z->parent->parent;
        if (z->parent == grandparent->left) {     // 父是爷的左孩子
            RBNode* uncle = grandparent->right;   // 叔结点
            if (uncle && uncle->color == RED) {
                // Case 1：叔为红 → 父叔变黑，爷变红，z 上移到爷
                z->parent->color = BLACK;
                uncle->color = BLACK;
                grandparent->color = RED;
                z = grandparent;
            } else {
                // Case 2：叔为黑，且 z 是父的右孩子（LR 型）→ 先左旋父，转成 LL
                if (z == z->parent->right) {
                    z = z->parent;
                    RotateLeft(z);                // 复用 AVL 的左旋
                }
                // Case 3：叔为黑，且 z 是父的左孩子（LL 型）→ 父变黑，爷变红，右旋爷
                z->parent->color = BLACK;
                grandparent->color = RED;
                RotateRight(grandparent);
            }
        } else {                                  // 父是爷的右孩子（左右对称）
            RBNode* uncle = grandparent->left;
            if (uncle && uncle->color == RED) {
                z->parent->color = BLACK;
                uncle->color = BLACK;
                grandparent->color = RED;
                z = grandparent;
            } else {
                if (z == z->parent->left) {
                    z = z->parent;
                    RotateRight(z);
                }
                z->parent->color = BLACK;
                grandparent->color = RED;
                RotateLeft(grandparent);
            }
        }
    }
    (*root)->color = BLACK;   // 根始终为黑
}
```

三种情形的分工是：

| 情形 | 条件 | 处理 | 性质 |
| :--- | :--- | :--- | :--- |
| **Case 1** | 叔结点为**红** | 父变黑、叔变黑、爷变红，把 z 上移到爷，继续循环 | 只染色，不动结构 |
| **Case 2** | 叔结点为**黑**，且 z 与父、爷构成"折线"（LR / RL 型） | 先对父旋转一次，把折线扳直成 LL / RR | 是 Case 3 的前置 |
| **Case 3** | 叔结点为**黑**，且 z 与父、爷构成"直线"（LL / RR 型） | 父变黑、爷变红，再对爷旋转 | 旋转 + 染色，修复结束 |

> **注意**：Case 3 里"先染色、再旋转"的顺序不能颠倒——染色的目的是在旋转前后维持每条路径的黑结点数目一致。另外，Case 1 会把问题**向上推**给祖父（祖父变红后可能与自己的父结点冲突），所以修复是一个可能向上的循环；但每轮只做常数级操作，且 Case 2/3 一旦执行就结束了，因此总旋转次数不超过 2 次。

> **例 10（红黑树插入演示）**
> 从空树开始依次插入 20, 10, 5, 30, 40，写出每次插入后的树形与颜色，并验证最终满足五条性质。

**思路**：新结点先染红，再按"看叔的颜色"修复；无论中间怎样，最后根结点强制染黑。

**解**：

① 插入 20：成为根，**染黑**。

② 插入 10：20 的左孩子，红色，父结点为黑，无冲突。

③ 插入 5：10 的左孩子，红色。父 10 为红，叔结点是 20 的右孩子（NULL，黑）→ **叔黑，且呈 LL 型（Case 3）**：父 10 变黑、爷 20 变红、对 20 右单旋。

```
      10(B)
     /     \
    5(R)   20(R)
```

④ 插入 30：落在 20 的右，红色。父 20 为红，叔结点是 5（红）→ **Case 1**：父叔变黑、爷 10 变红，z 上移到 10。此时 z 已没有红父，循环结束，再把根 10 染黑：

```
      10(B)
     /     \
    5(B)   20(B)
              \
              30(R)
```

⑤ 插入 40：落在 30 的右，红色。父 30 为红，叔结点是 20 的左孩子（NULL，黑）→ **叔黑，且呈 RR 型（Case 3）**：父 30 变黑、爷 20 变红、对 20 左单旋：

```
      10(B)
     /     \
    5(B)   30(B)
          /    \
       20(R)  40(R)
```

**验证五条性质**：根 10 为黑；叶结点 NULL 全为黑；无相邻红结点（20、40 的父结点 30 是黑）；黑高一致（到 5 的路径 2 个黑结点，到 40 的路径 2 个黑结点）；中序序列 5, 10, 20, 30, 40 递增有序。

**评注**：这五步恰好覆盖了全部三种情形——Case 3（叔黑、直线）、Case 1（叔红、纯染色）、Case 3 的对称版本（叔黑、RR）。**记住"看叔的颜色"这一条，修复逻辑就不会散**：叔红就染色并上移，叔黑就旋转加染色。

#### 构造示例

从空树开始依次插入 20, 10, 5, 30, 40, 37, 3, 2, 4, 35, 25, 18, 22, 23, 24, 19，各步的处理方式如下：

![红黑树构造示例（一）](/notes-assets/dsa7-15-1-rbt-construction.jpg)

![红黑树构造示例（二）](/notes-assets/dsa7-15-2-rbt-construction.jpg)

![红黑树构造示例（三）](/notes-assets/dsa7-15-3-rbt-construction.jpg)

![红黑树构造示例（四）](/notes-assets/dsa7-15-4-rbt-construction.jpg)

| 步骤 | 插入 | 情况 | 处理 |
| :--- | :---: | :--- | :--- |
| 1 | 20 | 新根 | 染黑（根） |
| 2 | 10, 5 | 5 的叔为黑（NIL），LL 型 | 右单旋 20 + 父换爷染色 |
| 3 | 30, 40 | 40 的叔为黑（NIL），RR 型 | 左单旋 30 + 父换爷染色 |
| 4 | 37 | 37 的叔为红（结点 5） | 叔父爷染色，爷 40 变新的 z |
| 5 | 3, 2 | 2 的叔为黑（NIL），LL 型 | 沿 3→5 路径右单旋 + 染色 |
| 6 | 4 | 4 的叔为红 | 叔父爷染色，爷变新的 z，继续上溯 |
| 7 | 35 | 叔为黑，RL 型 | 先右后左双旋 + 儿换爷染色 |
| 8 | 25, 18 | 18 的叔为黑，LR 型 | 先左后右双旋 + 儿换爷染色 |
| 9 | 22 | 叔为红 | 叔父爷染色，爷变新的 z |
| 10 | 23 | 叔为黑，LR 型 | 先左后右双旋 + 染色 |
| 11 | 24 | 叔为红 → 上溯后叔变黑 | 染色 + 旋转 |
| 12 | 19 | 叔为红 | 叔父爷染色，爷变新的 z，上溯调整 |

> **注意**：无论插入序列多长，红黑树每次都只做**染色**（Case 1）或**旋转 + 染色**（Case 2/3），且一旦进入 Case 2/3 当轮就结束，不会再沿路径一路转上去。这正是它与 AVL 删除的差别所在。

## B 树与 B+ 树

前面的 BST、AVL、红黑树都在**内存**里工作——每一次比较都很快。一旦数据大到内存装不下、必须放在磁盘上，瓶颈就从"比较次数"变成"**磁盘 I/O 次数**"，因为一次磁盘读取要按块（block）进行，代价比一次比较高出好几个数量级。B 树家族的全部设计都是为了这一个目标：**让树尽可能矮，把一次 I/O 摊到尽可能多的关键字上**。MySQL InnoDB、MongoDB 的索引底层都是 B+ 树。

### B 树

#### m 叉排序树

B 树是二叉排序树的直接推广：把每个结点从二叉扩展为 $m$ 叉。要让 $m$ 叉排序树的查找效率有保证，必须补上两条约束：

**除根结点外，任何结点至少有 $\lceil m/2 \rceil$ 个分叉**（即至少有 $\lceil m/2 \rceil - 1$ 个关键字）；

#### 绝对平衡

**任何一个结点的所有子树高度都相同**（绝对平衡）。

第一条防止结点"太瘦"导致树太高，第二条防止结点"偏科"导致树形不齐。两条合起来，查找路径长度就稳定在 $O(\log_m n)$。

#### B 树的定义

**B 树**（B-Tree, Balanced Tree）又称**多路平衡查找树**，所有结点的孩子个数的最大值称为 **B 树的阶**，通常记作 $m$。一棵 **$m$ 阶 B 树**满足：

1. 每个结点**至多 $m$ 棵子树**，即至多 $m-1$ 个关键字；
2. 若根结点不是终端结点，则**至少有 2 棵子树**；
3. 除根结点外的所有非叶结点**至少 $\lceil m/2 \rceil$ 棵子树**，即至少 $\lceil m/2 \rceil - 1$ 个关键字；
4. 所有**叶结点都在同一层**（绝对平衡）；
5. 结点内的关键字有序排列 $K_1 < K_2 < \dots < K_n$，且指针 $P_{i-1}$ 所指子树中的所有关键字都小于 $K_i$。

![B 树的结构](/notes-assets/dsa7-16-b-tree.jpg)

其中"**$n$ 个关键字对应 $n+1$ 棵子树**"是最容易被记混的一条——这一点与 B+ 树恰好相反（见 8.7 节）。

> **注意**：$m$ 阶 B 树每个结点的关键字个数范围是 $[\lceil m/2 \rceil - 1,\ m-1]$，根结点例外（可以是 $[1,\ m-1]$）。以 5 阶 B 树为例，非根结点的关键字个数必须在 $2 \sim 4$ 之间，"少于 2 个"就必须借或合并。

#### B 树的高度

对含有 $n$ 个关键字的 $m$ 阶 B 树，高度有两个界。

**最小高度**：让每个结点都装满（各含 $m-1$ 个关键字、$m$ 个分叉），则全部关键字数为

$$
n \le (m-1)(1 + m + m^2 + \cdots + m^{h-1}) = m^h - 1
$$

反解得

$$
h_{\min} = \lceil \log_m (n+1) \rceil
$$

**最大高度**：让每个结点尽量空（根结点 2 棵子树，其余结点 $\lceil m/2 \rceil$ 棵子树），则第 $h$ 层的结点数至少为 $2 \cdot \lceil m/2 \rceil^{\,h-1}$，每个结点至少 $\lceil m/2 \rceil - 1$ 个关键字，于是

$$
n+1 \ge 2 \cdot \lceil m/2 \rceil^{\,h-1}
$$

反解得

$$
h_{\max} = \left\lfloor \log_{\lceil m/2 \rceil} \frac{n+1}{2} \right\rfloor + 1
$$

> **注意**：最大高度公式里的"2"来自"根结点至少有 2 棵子树"这条约束。$m$ 越大，树越矮——这正是 B 树用于磁盘的立足点。

> **例 11（B 树高度的取值范围）**
> 一棵 5 阶 B 树含有 100 个关键字，求其高度的取值范围。

**思路**：最小高度按"结点全满"估算（每个结点 $m-1$ 个关键字）；最大高度按"结点最空"估算（根 2 棵子树、其余 $\lceil m/2 \rceil$ 棵子树）。

**解**：$m = 5$，$\lceil m/2 \rceil = 3$，$n = 100$。

最小高度（每结点满 4 个关键字）：

$$
h_{\min} = \lceil \log_5 (100+1) \rceil = \lceil \log_5 101 \rceil = 3 \qquad (5^2 = 25 < 101 \le 125 = 5^3)
$$

最大高度（根 2 叉、其余 3 叉）：

$$
h_{\max} = \left\lfloor \log_3 \frac{101}{2} \right\rfloor + 1 = \lfloor \log_3 50.5 \rfloor + 1 = 3 + 1 = 4 \qquad (3^3 = 27 \le 50.5 < 81 = 3^4)
$$

所以高度范围为 $3 \le h \le 4$。

**评注**：两个公式的推导逻辑刚好相反——最小高度把**每一层都塞满**，用等比数列求和得到 $m^h - 1$；最大高度让**每一层都尽量少**，首层 2 个分叉、其余每层 $\lceil m/2 \rceil$ 个分叉。5 阶 B 树装 100 个关键字只需要 3~4 层，而 100 个结点的二叉树最坏要 100 层——**这就是磁盘 I/O 的全部意义**。

#### 插入与分裂

B 树的插入规则只有两条，但必须记牢：

新元素总是插入到**最底层的终端结点**（先用查找确定位置）；

插入后若关键字数超过上限（$> m-1$），就从第 $\lceil m/2 \rceil$ 个位置**分裂**：左半留在原结点，右半放进新结点，**中间那个关键字提升到父结点**；若父结点也超限，则递归分裂，一直分裂到根——此时树高加 1。

![B 树插入与分裂示例](/notes-assets/dsa7-17-b-tree-insert.jpg)

**构造示例**：依次插入 25, 38, 49, 60, 80, 90, 88, 99, 83, 87, 70 等关键字，构造一棵 **5 阶 B 树**（每个结点关键字数 $2 \le n \le 4$）。

| 步骤 | 插入 | 结点状态 | 操作 |
| :--- | :--- | :--- | :--- |
| 1 | 25, 38, 49, 60 | 根结点满 4 个关键字 `[25,38,49,60]` | — |
| 2 | 80 | 超限（5 > 4） | 从 49 分裂：`[25,38]` + 49 提升 + `[60,80]` |
| 3 | 90, 88 | 右结点 `[60,80,88,90]` | — |
| 4 | 99 | 超限 | 从 88 分裂：`[60,80]` + 88 提升 + `[90,99]` |
| 5 | 83 | `[60,80,83]` | — |
| 6 | 87 | `[60,80,83,87]` | — |
| 7 | 70 | 超限 | 从 80 分裂：`[60,70]` + 80 提升 + `[83,87]` |

分裂后根结点为 `[49,88]`；第 7 步插入 70 后，该结点内五个关键字从小到大是 60, 70, 80, 83, 87，第 $\lceil 5/2 \rceil = 3$ 个关键字是 **80**，所以提升的是 80，左半是 `[60,70]`、右半是 `[83,87]`；根结点随之变成 `[49,80,88]`，仍然不超过 4 个关键字，无需继续分裂。

> **注意**：**分裂是唯一能让 B 树长高的操作**——插入永远发生在最底层，不会像 BST 那样在中间层挂结点。这与 BST"新结点必为叶子"一脉相承：B 树的终端结点，就是 BST 的叶子层。

#### 删除

删除要同时对付两种结点，还要守住"关键字数不少于 $\lceil m/2 \rceil - 1$"这条下限：

**删除终端结点**：**被删关键字在终端结点**：直接删除；

**删除非终端结点**：**被删关键字在非终端结点**：用它的**直接前驱或直接后继**（左子树最右 / 右子树最左的关键字）替换它，问题就转成"删除终端层的关键字"；

**删除后关键字数低于下限**：先看兄弟。若某个**兄弟结点富裕**（关键字数超过下限），就**借位**；若兄弟也刚好只有下限个关键字，就**合并**。

**借位（父子换位）**：兄弟富裕时，把父结点中夹在这两个结点之间的关键字下移到当前结点，再把兄弟中"最靠近父结点"的那个关键字上移到父结点。以 5 阶 B 树为例，父结点为 `[49, 90]`、待调整的结点为 `[60]`（低于下限 2）、右兄弟为 `[95, 99, 100]`（富裕）：父结点的 90 下移，兄弟最小的 95 上移，得到

```
当前结点 [60, 90]      父结点 [49, 95]      右兄弟 [99, 100]
```

**合并**：兄弟也刚好只有下限个关键字时，把"当前结点 + 父结点中夹着的那个关键字 + 兄弟结点"合成一个结点。同样以上面的结构为例，若右兄弟只有 `[95,99]`：合并后得到 `[60, 88, 95, 99]`（4 个关键字，合法），父结点少一个关键字；若父结点因此低于下限，就要**继续向上借位或合并**，直到根。根被"掏空"（只剩 0 个关键字）时，树高减 1。

![B 树删除示例](/notes-assets/dsa7-18-b-tree-delete.jpg)

> **注意**：删除的三种手段——**删、借、并**——全都围绕"保下限"展开。判断顺序很重要：先看能不能直接删，再看能不能借，最后才合并；合并会让父结点少一个关键字，可能引发连锁反应，这正是 B 树删除比插入麻烦的地方。

### B+ 树

$m$ 阶 B+ 树与 B 树的区别集中在四点：

| 特性 | B 树 | B+ 树 |
| :--- | :--- | :--- |
| **关键字数与子树数** | $n$ 个关键字 → $n+1$ 棵子树 | $n$ 个关键字 → $n$ 棵子树 |
| **数据存储位置** | 所有结点都存数据 | **只有叶结点存数据** |
| **分支结点的内容** | 关键字 + 数据 + 子树指针 | 只存子树中的最大关键字 + 子树指针（纯索引） |
| **叶结点之间的链接** | 无 | 叶结点按关键字顺序**串成链表** |
| **查找路径** | 中途可能就命中 | **必须查到叶结点**（类似分块查找） |

![B+ 树的结构](/notes-assets/dsa7-19-b-plus-tree.jpg)

> **注意**：B+ 树可以看成一棵**多级分块查找树**：分支结点是"索引表"，叶结点是"数据块"，叶结点之间的链表则让范围查询可以顺序扫过去。数据库聚簇索引正是这个结构——主键等值查找走树，范围扫描走叶结点链表。

#### B+ 树适合磁盘的原因

**分支结点更小**：**分支结点不存数据，只存关键字与指针**，于是同样大小的一个磁盘块能容纳更多分支——出度更大，树更矮，磁盘 I/O 次数更少；

**查找路径稳定**：**所有查找都要走到叶结点**，路径长度稳定，性能可预测；

**叶结点链表**：**叶结点串成有序链表**，范围查询与全表顺序扫描可以顺着链表走，不必反复回到上层；

**数据集中叶层**：**数据全部集中在叶结点**，插入删除只需维护叶层与索引层的一致性，实现上更规整。

对比一下：B 树把数据分散在所有结点里，命中可能提前结束（等值查询偶尔更快），但范围查询要反复中序遍历、跨层跳跃，分支结点的出度也更小。这就是数据库索引清一色选择 B+ 树的原因。

## 散列表

散列表是查找的"另一种解法"：前面所有结构都靠**比较**逼近目标，散列表干脆**直接算出地址**——$Addr = H(key)$。理想情况下不需要任何比较，查找是 $O(1)$。代价是必须精心设计两件事：**散列函数**与**冲突处理**。

### 基本概念与散列函数

- **散列表**（Hash Table）：又称哈希表，根据关键字直接计算存储地址的数据结构；
- **散列函数**：建立"关键字 → 存储地址"的映射，基本形式为 $Addr = H(key)$；
- **冲突**（Collision）：不同的关键字被映射到同一个地址；
- **同义词**：发生冲突的这些关键字互称同义词。

![散列表的直观示意](/notes-assets/dsa7-20-hash-table.jpg)

**散列函数的设计原则**：

1. 定义域必须覆盖所有可能出现的关键字；
2. 值域不能超出散列表的地址范围；
3. 尽可能让关键字**均匀分布**，减少冲突；
4. 计算要简单快速。

常用的构造方法：

| 方法 | 公式 | 特点 |
| :--- | :--- | :--- |
| **除留余数法** | $H(key) = key \bmod p$ | $p$ 取不大于表长的质数，最常用 |
| **直接定址法** | $H(key) = a \cdot key + b$ | 不会冲突，但空间浪费大 |
| **数字分析法** | 取关键字中分布较均匀的若干位 | 适合关键字位数较多的场景 |
| **平方取中法** | 取 $key^2$ 的中间几位 | 适合关键字各位分布不均的场景 |

> **注意**：除留余数法里"$p$ 取质数"不是形式要求。若 $p$ 含有较多小因子，关键字的分布规律会被放大成聚集（例如 $p$ 取偶数时，奇偶性相同的关键字必然冲突）。让 $p$ 为质数，冲突分布最接近随机。

#### 冲突处理之一：链地址法

**链地址法**又称链接法、拉链法：把所有同义词挂在同一个链表里——**冲突不换位置，而是排队挂链**。

![链地址法散列表](/notes-assets/dsa7-21-separate-chaining.jpg)

```c
typedef struct HashNode {
    int key;
    int value;
    struct HashNode* next;
} HashNode;

typedef struct {
    HashNode** buckets;    // 桶指针数组
    int size;              // 桶的数量
    int count;             // 元素总数
} HashTable;

int HashFunc(HashTable* ht, int key) {
    int hash = key % ht->size;
    return hash < 0 ? hash + ht->size : hash;
}
```

```c
// Insert —— 头插法（O(1) 挂到链表头）
Status HashInsert(HashTable* ht, int key, int value) {
    int idx = HashFunc(ht, key);
    HashNode* cur = ht->buckets[idx];
    while (cur) {                          // 检查是否已存在同一个 key
        if (cur->key == key) { cur->value = value; return ERROR; }
        cur = cur->next;
    }
    HashNode* node = (HashNode*)malloc(sizeof(HashNode));
    node->key = key; node->value = value;
    node->next = ht->buckets[idx];         // 头插
    ht->buckets[idx] = node;
    ht->count++;
    return OK;
}

// Delete —— 用 prev 指针追踪，完成物理删除
Status HashDelete(HashTable* ht, int key) {
    int idx = HashFunc(ht, key);
    HashNode *cur = ht->buckets[idx], *prev = NULL;
    while (cur && cur->key != key) { prev = cur; cur = cur->next; }
    if (cur == NULL) return ERROR;
    if (prev) prev->next = cur->next;
    else ht->buckets[idx] = cur->next;     // 删除的是链表头结点
    free(cur);
    ht->count--;
    return OK;
}

// Resize —— 扩容重哈希（所有元素都要重新计算桶位置）
Status HashResize(HashTable* ht, int newSize) {
    HashNode** newBuckets = (HashNode**)calloc(newSize, sizeof(HashNode*));
    int oldSize = ht->size;
    ht->size = newSize;                    // 先更新 size，让 HashFunc 用新表长
    for (int i = 0; i < oldSize; i++) {
        HashNode* p = ht->buckets[i];
        while (p) {
            HashNode* next = p->next;
            int idx = HashFunc(ht, p->key);
            p->next = newBuckets[idx];     // 头插到新桶
            newBuckets[idx] = p;
            p = next;
        }
    }
    free(ht->buckets);
    ht->buckets = newBuckets;
    return OK;
}
```

**扩容为什么是 $O(n)$**：表长一变，`key % size` 的结果就变，所有元素都必须重新计算桶位置。所以工程上通常采用"**容量翻倍 + 均摊**"策略——单次扩容很贵，但摊到每次插入上仍是常数级。

> **注意**：链地址法的删除是**物理删除**（改链表指针），这一点与开放定址法形成鲜明对比。它的装填因子还可以大于 1——链表可以无限延伸，无非是查询变慢。

#### 冲突处理之二：开放定址法

开放定址法不引入链表，而是在表内按一个**探测序列** $d_i$ 去找下一个空闲位置：

$$
H_i = (H(key) + d_i) \bmod m
$$

查找的过程与之对称：沿同一条探测序列依次比对，命中目标就成功，**遇到空单元就失败**（空单元意味着这条探测链到此为止）。

| 方法 | $d_i$ 公式 | 探测覆盖率 | 特点 |
| :--- | :--- | :---: | :--- |
| **线性探测法** | $d_i = 0, 1, 2, \dots, m-1$ | **100%**（覆盖全表） | 实现最简单，但聚集严重 |
| **平方探测法** | $d_i = 0^2, 1^2, -1^2, 2^2, -2^2, \dots$ | **至少 50%** | 减轻聚集；若 $m = 4j+3$ 且为素数则覆盖全表 |
| **双散列法** | $d_i = i \times hash_2(key)$ | 取决于 $hash_2$ | 若 $hash_2(key)$ 与 $m$ 互质则覆盖全表 |
| **伪随机序列法** | 人为设定的随机序列 | 取决于序列设计 | 可定制，但实现复杂 |

**关于覆盖率**：平方探测**至少**能探测到表中一半的位置；如果表长 $m$ 是可以写成 $4j+3$ 的素数（如 7、11、19、23），平方探测能覆盖**所有**位置。双散列法中，若取 $m$ 为素数且 $hash_2(key) = m - (key \bmod m)$，则 $hash_2(key)$ 与 $m$ 必然互质，探测也能覆盖全表。

```c
typedef enum { EMPTY = 0, OCCUPIED = 1, DELETED = 2 } SlotState;

typedef struct {
    int key;
    int value;
    SlotState state;       // EMPTY / OCCUPIED / DELETED
} Slot;

typedef struct {
    Slot* slots;
    int size;
    int count;             // OCCUPIED 的数量
    int deleted;           // DELETED 的数量
} OAHashTable;

// 二次探测：d_i = i^2
int Probe(OAHashTable* ht, int key, int i) {
    return (HashFunc(ht, key) + i * i) % ht->size;
}
```

注意槽位有**三种状态**而不是两种——`DELETED` 是开放定址法必须单独设立的第三种状态，原因见下一小节。

#### 惰性删除

```c
Status OADelete(OAHashTable* ht, int key) {
    for (int i = 0; i < ht->size; i++) {
        int pos = Probe(ht, key, i);
        if (ht->slots[pos].state == EMPTY) return ERROR;  // 探测到空位 = 不存在
        if (ht->slots[pos].state == OCCUPIED && ht->slots[pos].key == key) {
            ht->slots[pos].state = DELETED;               // 惰性删除：只标记，不清空
            ht->count--;
            ht->deleted++;
            return OK;
        }
    }
    return ERROR;
}
```

**为什么必须惰性删除**：查找的终止条件是"遇到 EMPTY"。假设要删的关键字位于某条探测链的中间，如果把它物理清空成 EMPTY，那么**排在它后面的所有同义词都会永久失联**——查找走到这个空位就提前宣告失败，明明还在表里的元素再也找不到了。所以删除只能把状态改成 `DELETED`，让探测链保持连通。

代价是 `DELETED` 槽位会一直占用探测路径。当它积累过多时，查找效率会明显下降，需要定期**扩容重哈希**来做一次整理（把所有 `DELETED` 槽真正清掉、把存活元素重新安置）。

> **注意**：这就是"**用查找效率换删除正确性**"。开放定址法的删除只做标记而不真正腾空位置，这一点在任何实现里都不能省。

插入时也要照顾这条链：

```c
Status OAInsert(OAHashTable* ht, int key, int value) {
    if (ht->count >= ht->size) return ERROR;    // 表满
    int firstDeleted = -1;
    for (int i = 0; i < ht->size; i++) {
        int pos = Probe(ht, key, i);
        if (ht->slots[pos].state == OCCUPIED) {
            if (ht->slots[pos].key == key) {    // 已存在的 key：更新值
                ht->slots[pos].value = value;
                return ERROR;
            }
        } else if (ht->slots[pos].state == DELETED) {
            if (firstDeleted == -1) firstDeleted = pos;  // 记住第一个 DELETED
        } else {                                         // EMPTY
            int insertPos = (firstDeleted != -1) ? firstDeleted : pos;
            if (firstDeleted != -1) ht->deleted--;
            ht->slots[insertPos].key = key;
            ht->slots[insertPos].value = value;
            ht->slots[insertPos].state = OCCUPIED;
            ht->count++;
            return OK;
        }
    }
    // 一路探测都没有 EMPTY，就回退复用第一个 DELETED 槽
    if (firstDeleted != -1) {
        ht->slots[firstDeleted].key = key;
        ht->slots[firstDeleted].value = value;
        ht->slots[firstDeleted].state = OCCUPIED;
        ht->count++;
        ht->deleted--;
        return OK;
    }
    return ERROR;
}
```

插入遇到 `DELETED` 时先**记下第一个**并继续往后探：如果后面还有 EMPTY，优先插到 EMPTY（保持探测链的连续性）；只有整条链都探完仍找不到 EMPTY，才回退复用那个 `DELETED` 槽。

> **例 12（线性探测的构造与 ASL）**
> 设散列表长 $m = 16$，散列函数 $H(key) = key \% 13$，采用线性探测法处理冲突。依次插入 {19, 14, 23, 1, 68, 20, 84, 27, 55, 11, 70, 79}。① 画出最终散列表；② 求 $ASL_{\text{成功}}$ 与 $ASL_{\text{失败}}$；③ 删除 20 之后，再求 $ASL_{\text{成功}}$。

**思路**：逐个模拟探测——$H(key)$ 处已被占用时依次后移（线性探测 $d_i = 0, 1, 2, \dots$），找到第一个空位落座；查找长度就是探测次数。

**解**：① 逐元素追踪探测路径：

| key | $H(key)$ | 探测序列 | 最终位置 | 查找长度 |
| :--- | :---: | :--- | :---: | :---: |
| 19 | 6 | 6 | 6 | 1 |
| 14 | 1 | 1 | 1 | 1 |
| 23 | 10 | 10 | 10 | 1 |
| 1 | 1 | 1 → 2 | 2 | 2 |
| 68 | 3 | 3 | 3 | 1 |
| 20 | 7 | 7 | 7 | 1 |
| 84 | 6 | 6 → 7 → 8 | 8 | 3 |
| 27 | 1 | 1 → 2 → 3 → 4 | 4 | 4 |
| 55 | 3 | 3 → 4 → 5 | 5 | 3 |
| 11 | 11 | 11 | 11 | 1 |
| 70 | 5 | 5 → 6 → 7 → 8 → 9 | 9 | 5 |
| 79 | 1 | 1 → 2 → … → 12 | 12 | 12 |

最终散列表（位置 0~15）：

```
位置:  0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15
元素:  -  14   1  68  27  55  19  20  84  70  23  11  79   -   -   -
```

装填因子 $\alpha = \frac{12}{16} = 0.75$。

② 成功查找长度之和为 $1+1+1+2+1+1+3+4+3+1+5+12 = 35$，即 $ASL_{\text{成功}} = \frac{35}{12} \approx 2.92$。

失败查找要对 $H$ 的**每一个可能取值**（0~12 共 13 个，注意不是表长 16）统计探测到第一个空位的次数，依次为 1, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2，于是 $ASL_{\text{失败}} = \frac{1+13+12+11+10+9+8+7+6+5+4+3+2}{13} = \frac{91}{13} = 7$。

③ 删除 20（位置 7 标记为 `DELETED`，仍然参与探测）后，表中剩 11 个元素，成功查找长度之和变成 34，于是 $ASL_{\text{成功}} = \frac{34}{11} \approx 3.09$。

**评注**：有三处最容易错。**第一，失败长度的分母是散列函数值域的个数（13）而不是表长（16）**——因为"查找失败"是针对某个关键字而言的，而关键字的散列地址只会落在 $0 \sim 12$。**第二，删除只标记不清空**：位置 7 变成 `DELETED` 后，84 与 70、79 的探测路径都不能断，所以它们的查找长度不变，但表里元素少了一个，$ASL_{\text{成功}}$ 反而从 2.92 升到 3.09。**第三，79 的位置**：它的 $H = 1$，整条链 1~11 全被占满，必须一路探到 12，查找长度高达 12——这正是线性探测聚集现象的直观写照。

### 散列表性能分析

#### 装填因子

**装填因子**反映一个散列表"满"的程度，即 $\alpha = \frac{\text{表中记录数 } n}{\text{散列表长度 } m}$。$\alpha$ 越大，表越满，冲突越频繁，插入与查找的效率越低、ASL 越大。

#### 聚集现象

**聚集现象**（又称堆积）指的是：处理冲突的过程中，几个原本散列到**不同**地址的元素，却争夺**同一个后继**地址的现象。它是线性探测最典型的副作用——一旦某个位置被占，后面的位置就更容易被占，长此以往形成整片的连续占用区，任何散列到该区域的元素都要付出很长的探测代价。

三种冲突处理方式的平均成功查找长度（近似）：

| 冲突处理方式 | $ASL_{\text{成功}}$（近似） | 依赖因素 |
| :--- | :--- | :--- |
| 链地址法 | $1 + \frac{\alpha}{2}$ | 装填因子 $\alpha = n/m$ |
| 线性探测 | $\frac{1}{2}\left(1 + \frac{1}{1-\alpha}\right)$ | $\alpha$ + 聚集程度 |
| 平方探测（按随机探测模型近似） | $\frac{1}{\alpha}\ln\frac{1}{1-\alpha}$ | $\alpha$（聚集较轻） |

> **注意**：**装填因子 $\alpha$ 是散列表性能的总开关**。$\alpha$ 越大 → 表越满 → 冲突越多 → ASL 越高。工程上通常在 $\alpha > 0.75$ 时触发扩容。两种方法对 $\alpha$ 的敏感度差别很大：链地址法最宽容（链表不会满，$\alpha$ 甚至可以大于 1）；开放定址法最敏感——$\alpha$ 趋近 1 时，线性探测的 $ASL$ 公式里 $\frac{1}{1-\alpha}$ 会爆炸式增长，性能急剧恶化。

> **例 13（装填因子与三种方法的 ASL 对比）**
> 某散列表的装填因子 $\alpha = 0.75$，分别用链地址法、线性探测、平方探测处理冲突，估算各自的 $ASL_{\text{成功}}$。

**思路**：直接代入上面三种近似公式，比较不同冲突处理方法对 $\alpha$ 的敏感度。

**解**：

- 链地址法：$ASL \approx 1 + \frac{\alpha}{2} = 1 + 0.375 = 1.375$；
- 线性探测：$ASL \approx \frac{1}{2}\left(1 + \frac{1}{1-\alpha}\right) = \frac{1}{2}(1+4) = 2.5$；
- 平方探测：$ASL \approx \frac{1}{\alpha}\ln\frac{1}{1-\alpha} = \frac{1}{0.75}\ln 4 \approx 1.85$。

**评注**：同样是 $\alpha = 0.75$，线性探测的 ASL（2.5）几乎是链地址法（1.375）的两倍——**聚集让线性探测对装填因子最敏感**。三个公式的记忆抓手：链地址法最简单（$1 + \alpha/2$）；线性探测在 $\alpha \to 1$ 时趋于无穷；平方探测介于两者之间。另外要注意这些公式都是**平均意义下的估计**，例 12 中实测的 2.92 与线性探测公式的 2.5 同一量级但并不相等，差异来自具体关键字与具体表长。

#### 两种冲突处理方法的对比

| 对比维度 | 链地址法 | 开放定址法 |
| :--- | :--- | :--- |
| **冲突处理方式** | 用链表存放同义词 | 用探测序列寻找下一个空位 |
| **空间开销** | 需要额外的指针开销 | 无指针开销，但必须预留空槽 |
| **装填因子** | 可以大于 1（链表能无限延伸） | 必须小于等于 1（表满就无法插入） |
| **删除** | 物理删除（改链表指针） | **惰性删除**（标记为 DELETED） |
| **缓存友好度** | 较差（链表结点离散分布） | 较好（数组连续存放） |
| **扩容** | 所有元素重新哈希 | 所有元素重新哈希 |
| **典型应用** | Java `HashMap`、C++ `unordered_map` | Python `dict`（部分实现）、Redis `dict` |

> **注意**：两条最容易记混的点——**开放定址法的装填因子必然小于等于 1**（表满就真的插不进去了），链地址法可以大于 1；**开放定址法必须惰性删除**，链地址法可以物理删除。

## 小结

- **评价标准**：一切查找算法都用**平均查找长度 ASL**（$ASL = \sum P_i C_i$）衡量，且必须同时给出成功与失败两个值——失败查找通常还要多比较一次。
- **静态查找三兄弟**：顺序查找 $O(n)$ 但适用范围最广，哨兵优化省掉每轮的越界判断；折半查找 $O(\log n)$ 但**必须是有序顺序表**（链表不能随机访问）；分块查找 $O(\sqrt n)$，块长取 $\sqrt n$ 时两阶段开销最均衡，$ASL_{\min} = \sqrt n + 1$。
- **判定树是统一工具**：折半、BST、AVL 的效率分析都归结为"**查找长度 = 结点所在层数**"；折半判定树的高度 $\lceil \log_2(n+1) \rceil$ 就是成功查找的比较次数上限。
- **BST 的命门是退化**：新结点必为叶子，插入不改变已有结构；但有序序列插入会退化成单链表，$O(\log n)$ 掉到 $O(n)$——这就是自平衡结构存在的理由。
- **平衡的严格程度决定维护代价**：AVL 用平衡因子 $\pm 1$ 换最矮的树，插入最多转 1 次、删除最坏 $O(\log n)$ 次；红黑树用"最长路径不超过最短路径两倍"换常数次调整，因此**工程上更常用**。删除时 AVL 的 LL 判定必须用 $BF \ge 0$。
- **多路与散列解决的是两类瓶颈**：B/B+ 树把"磁盘块"变成结点，树高降到 $O(\log_m n)$，B+ 树还靠叶结点链表支持范围扫描；散列表用 $H(key)$ 直接算地址，理想 $O(1)$，但必须处理冲突——链地址法可物理删除、装填因子能超过 1，开放定址法**必须惰性删除**、装填因子不能超过 1。

#### 查找算法总览

把本章所有结构放到同一张表里，选型问题就变成了查表问题。

| 查找算法 | 数据结构 | $ASL_{\text{成功}}$ | 插入 | 删除 | 适用场景 |
| :--- | :--- | :--- | :---: | :---: | :--- |
| 顺序查找 | 顺序表 / 链表 | $O(n)$ | $O(1)$ | $O(n)$ | 小数据量、无序 |
| 折半查找 | 有序顺序表 | $O(\log n)$ | $O(n)$ | $O(n)$ | 静态有序表 |
| 分块查找 | 索引表 + 顺序表 | $O(\sqrt{n})$ | $O(1)$ | $O(1)$ | 动态变化的数据 |
| BST（未平衡） | 链式二叉树 | $O(h)$ | $O(h)$ | $O(h)$ | 动态查找、插入序列随机 |
| AVL 树 | 平衡二叉树 | $O(\log n)$ | $O(\log n)$ | $O(\log n)$ | 以查为主 |
| 红黑树 | 近似平衡二叉树 | $O(\log n)$ | $O(\log n)$ | $O(\log n)$ | **频繁增删** |
| B 树 | 多路平衡树 | $O(\log n)$ | $O(\log n)$ | $O(\log n)$ | 磁盘 I/O 场景 |
| 散列表 | 数组 + 链表 / 探测 | $O(1)$ | $O(1)$ | $O(1)$ | **等值查询**（不支持范围） |

**选型建议**：

- 数据量小、或者表本身无序 → **顺序查找**，$O(n)$ 但实现最省事；
- 静态有序表（建成后不再改）→ **折半查找**，$O(\log n)$ 且常数极小；
- 数据会变但变化不大 → **分块查找**，$O(\sqrt n)$ 换取块内插入的便利；
- 动态表、插入序列随机 → **BST**；数据可能有序到达 → **红黑树**；
- 以查为主、几乎不写 → **AVL 树**，树最矮、查得最快；
- 频繁插入删除 → **红黑树**，调整次数是常数级；
- 只需要等值查询、能接受冲突 → **散列表**（链地址法容错最好），$O(1)$ 最快；
- 需要排序、按名次取元素、范围查询 → **树形查找**，散列表做不到；
- 数据量超过内存、存在磁盘上 → **B+ 树**，用多路 + 叶链表把 I/O 次数压到最低。

> **注意**：最后一条边界要记住——**散列表只支持等值查询**。它把关键字打散成地址，"顺序"这一信息在散列过程中就丢掉了，因此范围查询与排序必须交给树形结构。
