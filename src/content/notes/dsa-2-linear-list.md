---
title: 数据结构与算法-2 线性表
description: 线性表的逻辑定义与基本操作，顺序表与单链表、双链表、循环链表、静态链表的实现与代价对比。
category: 计算机科学
subject: 计算机科学
subfield: 数据结构与算法
topic: 线性表
difficulty: 基础
date: "2026-09-28"
tags: [数据结构与算法, 线性表, 顺序表, 单链表, 双链表, 循环链表, 静态链表]
draft: false
featured: false
---

## 线性表的定义与基本操作

线性表是最基本、最常用的一种线性结构：数据元素之间呈"一对一"关系，像一支排好的队伍，每个人只有一个"前面的人"和一个"后面的人"。本章要做的事情只有一件——**把同一个逻辑结构放进两种不同的存储方式，看操作代价如何随之改变**

### 线性表的定义

**线性表**（Linear List）是具有相同数据类型的 $n\;(n \ge 0)$ 个数据元素的**有限序列**，其中 $n$ 为线性表的长度，简称表长；当 $n = 0$ 时，线性表是一个**空表**。

![线性表示意](/notes-assets/dsa2-01-linear-list.jpg)

若用 L 命名线性表，则一般表示为：

$$
L = (a_{1}, a_{2}, \dots, a_{i}, a_{i+1}, \dots, a_{n})
$$

其中 $a_i$ 是线性表中第 $i$ 个元素的**位序**。这里有一条最容易踩的约定：**位序从 1 开始**，而数组下标从 0 开始，两者恒差 1。$a_1$ 是**表头**元素，$a_n$ 是**表尾**元素。

> **例 1（位序与下标）**：线性表 $L = (a_1, a_2, a_3, a_4, a_5)$，问：① 第 3 个元素是什么？它的位序和数组下标分别是多少？② 数组下标 4 对应哪个元素？

区分两个极易混淆的"编号"——位序从 1 开始，数组下标从 0 开始，恒有"位序 = 下标 + 1"：

① 第 3 个元素是 $a_3$，其位序为 3，若用数组存储则下标为 2；

② 下标 4 的元素位序为 5，即 $a_5$。

> **最容易错的地方**：位序与下标的 +1 差。所有基本操作的参数 $i$ 都是**位序**，代码内部一律用 `data[i-1]` 访问——务必在函数入口把好参数关。

### 线性表元素的性质

由"同类型、有限、序列"三个限定词，可以推出线性表元素的三条性质：

- 线性表中每个数据元素所占空间一样大（由"相同数据类型"保证）；
- 除第一个元素外，每一个元素有且仅有一个**直接前驱**；
- 除最后一个元素外，每一个元素有且仅有一个**直接后继**。

> **注意**：线性表是一种**逻辑结构**，它描述的是数据元素之间"一对一"的线性关系，与具体采用何种**物理存储结构**（顺序存储还是链式存储）无关。这句话是本章全部内容的出发点。

### 抽象数据类型与基本操作

线性表的抽象数据类型（Abstract Data Type, ADT）把"数据"与"操作"打包在一起定义：数据部分就是上文那 $n$ 个同类型元素构成的有限序列，操作部分则是一组固定接口。这组接口可以按"**创销增删改查**"六个字归纳——创建、销毁、插入、删除、修改、查找：

| 操作 | 函数原型 | 说明 |
| :--- | :--- | :--- |
| **初始化** | `InitList(&L)` | 构造一个空表 L 并分配内存空间 |
| **销毁** | `DestroyList(&L)` | 销毁线性表，并释放线性表 L 所占用的内存空间 |
| **插入** | `ListInsert(&L, i, e)` | 在表 L 中位序为 i 的位置插入指定元素 e |
| **删除** | `ListDelete(&L, i, &e)` | 删除表 L 中位序为 i 的元素，并用 e 返回删除元素的值 |
| **按值查找** | `LocateElem(L, e)` | 在表中查找具有给定关键字值的元素并返回位序 i |
| **按位查找** | `GetElem(L, i)` | 获取表中位序为 i 的元素的值 |
| **求表长** | `Length(L)` | 返回线性表 L 的当前长度 |
| **输出** | `PrintList(L)` | 按前后顺序输出线性表 L 的所有元素值 |
| **判空** | `Empty(L)` | 若 L 为空表，则返回 true，否则返回 false |

> **注意**：参数表中带 `&` 的操作（初始化、销毁、插入、删除）**可能修改表本身**；不带 `&` 的操作只读表。这条区别在链式存储里会变得更尖锐——链表甚至需要二级指针才能改到头指针。

## 顺序表

### 顺序表的定义与实现

#### 顺序表的定义与地址计算

**顺序表**（Sequence List）是用顺序存储方式实现的线性表：逻辑上相邻的元素在物理位置上也相邻。它是"数组思想"的封装，因此继承了数组**随机访问**的天赋，也继承了**插入删除要移动元素**的宿命。这一节解决"顺序表是什么、怎么建"两个问题：先给出定义与地址计算公式，再对比**静态分配**与**动态分配**两种实现——它们的核心差异只有一条：**容量能不能改**。

![顺序存储](/notes-assets/dsa2-02-sequential-storage.jpg)

设顺序表第一个元素的存放位置为 $LOC(L)$，则位序为 $i$ 的元素的存放位置为：

$$
LOC(L) + (i-1) \times \text{数据元素大小}
$$

在 C 语言中，`sizeof(ElemType)` 可以统计数据元素大小。这个公式正是顺序表**随机访问**为 $O(1)$ 的理论基础——知道首地址和元素大小，任何位置的地址都能直接算出，不需要沿链遍历。

> **例 2（存储地址计算）**：设顺序表首元素存放地址 $LOC(L) = 1000$，每个元素占 4 字节，求位序为 5 的元素 $a_5$ 的存放地址。

套用地址公式 $LOC(L) + (i-1) \times \text{元素大小}$，注意位序减 1 的含义是"前面有几个元素"：

$$
LOC(a_5) = 1000 + (5-1) \times 4 = 1000 + 16 = 1016
$$

评注：地址计算是"随机访问 $O(1)$"的量化表达——无论 $i$ 多大，计算都只需一次乘加运算。这也是顺序表与链表最重要的性能分野。

#### 静态分配实现

静态分配使用**静态数组**存放数据元素（`ElemType data[MAXSIZE]`），再用一个 `length` 变量追踪当前表长：

```c
typedef int ElementType;
#define MAXSIZE 1000
typedef struct {
    ElementType data[MAXSIZE];  // 静态数组存放数据元素
    int length;                 // 顺序表的当前长度
    int capacity;               // 容量（应等于 MAXSIZE）
} SeqList;
```

静态分配为所有元素分配连续存储空间，大小为 $Maxsize \times sizeof(ElemType)$。它的表长在编译期确定后**无法更改**——判满条件为 `length >= capacity`，一旦判满就无法再插入新元素。

#### 动态分配与扩容

动态分配改用**动态数组指针**（`ElemType *data`），通过 `malloc` 申请、`free` 释放，初始容量通常设为 **10**，扩容策略一般为扩到原来的 **2 倍**：

```c
typedef int ElementType;
typedef struct {
    ElementType *data;  // 指示动态分配数组的指针
    int length;         // 顺序表的当前长度
    int capacity;       // 顺序表的当前容量
} SeqList;
```

初始化动态顺序表：

```c
SeqList* InitList(void) {
    SeqList *L = (SeqList*)malloc(sizeof(SeqList));
    if (L == NULL) return NULL;
    L->length = 0;
    L->capacity = 10;  // 初始容量为 10
    L->data = (ElementType*)malloc(10 * sizeof(ElementType));
    if (L->data == NULL) {
        free(L);       // 数组分配失败，回滚结构体
        return NULL;
    }
    return L;
}
```

扩容操作（增加动态顺序表的容量）：

```c
Status ExpandCapacity(SeqList *L, int newCapacity) {
    if (L == NULL || L->data == NULL) return ERROR;
    if (newCapacity < 0) return ERROR;
    if (newCapacity <= L->capacity) return OK;  // 不需要扩容
    // 分配新空间
    ElementType *newData = (ElementType*)malloc(newCapacity * sizeof(ElementType));
    if (newData == NULL) return ERROR;  // 分配失败，不修改原表
    // 将原数据复制到新区域（时间开销大）
    for (int i = 0; i < L->length; i++)
        newData[i] = L->data[i];
    free(L->data);              // 释放原内存空间
    L->data = newData;
    L->capacity = newCapacity;  // 顺序表最大长度增加
    return OK;
}
```

动态分配的关键是**动态申请和释放内存空间**：C 语言用 `malloc` 申请、`free` 释放，`malloc` 返回的指针需要**强制转型**为所定义的数据元素类型指针；C++ 则用 `new` 申请、`delete` 释放。特别地，扩容失败时必须返回 `ERROR` 且**不修改原表**（`capacity`、`data`、`length` 全部保持不变）——这是"失败无副作用"原则在数据结构里的第一次体现。

标准库还提供了 `realloc`，用于把已分配的块调整到新的大小。它的语义与上面手工写的三步完全相同（申请新空间 → 复制数据 → 释放旧空间），差别只在"谁来写这段代码"：

```c
ElementType *newData = (ElementType*)realloc(L->data, newCapacity * sizeof(ElementType));
if (newData == NULL) return ERROR;  // 失败时不修改原表
L->data = newData;
L->capacity = newCapacity;
```

> **注意**：`realloc` 失败时返回 `NULL`，而**原指针仍然有效**——千万不要写成 `L->data = realloc(L->data, ...)`，那样一旦失败就会丢掉旧地址，造成内存泄漏。必须先用临时指针接住返回值，判空后再赋回。

![动态分配内存](/notes-assets/dsa2-03-dynamic-allocation.jpg)

静态分配与动态分配的核心差异：

| 特性 | 静态分配 | 动态分配 |
| :--- | :--- | :--- |
| **存储方式** | `data[MAXSIZE]` 静态数组 | `*data` 动态数组指针 |
| **容量** | 编译期确定，不可变 | 运行期可扩展 |
| **判满** | `length >= capacity` → 满 | 理论上永不满（自动扩容） |
| **销毁** | 只释放结构体 | **两层释放**：先 `free(data)` 再 `free(结构体)` |

#### 顺序表的特点与扩容代价

顺序表的特点可以概括为"两强两弱"：

**随机访问**：可以在 $O(1)$ 时间内找到第 $i$ 个元素（代码 `data[i-1]`，无论静态还是动态分配）。

**存储密度高**：每个结点只存储数据元素。存储密度 = 数据本身所占存储量 / 结点结构所占存储总量。

**增删不便**：需要移动大量元素。

**扩容不便**：即使采用动态分配，拓展长度的时间复杂度也较高。扩容本身的代价是 $O(n)$ 的复制操作，因此扩容策略值得推敲：如果每次只扩 1 个位置，插入 $n$ 个元素会触发 $O(n)$ 次扩容，总代价 $O(n^2)$；按 **×2 倍增**扩容，插入 $n$ 个元素只触发 $O(\log n)$ 次扩容，摊还到每次插入接近 $O(1)$——**用"偶尔的昂贵复制"换"平时的廉价插入"**。

### 顺序表的基本操作

这一节实现第 1 节定义的接口。**插入与删除**是重点，它们都要移动元素，且移动方向相反（后移与前移）；**查找**则体现顺序表的核心优势（按位 $O(1)$）。

#### 插入操作

```c
Status InsertAt(SeqList *L, int pos, ElementType x) {
    if (L == NULL) return ERROR;
    if (pos < 1 || pos > L->length + 1) return ERROR;  // 合法位置共 length+1 个
    if (L->length >= L->capacity) {
        // 动态版本：自动扩容（静态版本直接 return ERROR）
        if (ExpandCapacity(L, L->capacity * 2) == ERROR)
            return ERROR;
    }
    // 将第 pos 个元素及之后的元素从后往前依次后移
    for (int i = L->length; i >= pos; i--)
        L->data[i] = L->data[i - 1];
    L->data[pos - 1] = x;  // 在位置 pos 处放入新元素
    L->length++;           // 长度加 1
    return OK;
}
```

插入前需要检查三件事：指针非空、容量未满、插入位置合法（$1 \le pos \le length+1$）。移动元素必须**从后往前**——若从前往后，后面的元素会被前面元素的移动覆盖。

![顺序表的插入操作](/notes-assets/dsa2-04-seqlist-insert.jpg)

时间复杂度分析：

| 情况 | 条件 | 时间复杂度 |
| :--- | :--- | :---: |
| 最好 | 插入到表尾，无需移动元素 | $O(1)$ |
| 最坏 | 插入到表头，$n$ 个元素全部后移 | $O(n)$ |
| 平均 | 每个位置等概率 $p=\frac{1}{n+1}$，平均移动 $\frac{n}{2}$ 次 | $O(n)$ |

> **例 3（插入过程模拟）**：顺序表 $L = (12, 24, 36, 48)$，在位序 2 处插入元素 30，写出移动过程与结果。

位序 2 对应数组下标 1。先把下标 3、2、1 的元素依次后移到 4、3、2，再在下标 1 处写入 30——必须从后往前移动。

$$
(12, 24, 36, 48) \xrightarrow{\text{48 后移}} (12, 24, 36, 48, 48) \xrightarrow{\text{36 后移}} (12, 24, 36, 36, 48)
$$

$$
\xrightarrow{\text{24 后移}} (12, 24, 24, 36, 48) \xrightarrow{\text{写入 30}} (12, 30, 24, 36, 48)
$$

评注：本次共移动 3 个元素，与公式 $n - i + 1 = 4 - 2 + 1 = 3$ 一致——位序越靠前代价越大，最坏为 $O(n)$。"从后往前"是顺序表插入的铁律。

#### 删除操作

```c
Status DeleteAt(SeqList *L, int pos, ElementType *deleted) {
    if (L == NULL || deleted == NULL) return ERROR;
    if (pos < 1 || pos > L->length) return ERROR;  // 合法位置共 length 个
    *deleted = L->data[pos - 1];  // 先取出被删除元素的值
    // 将第 pos 个元素之后的元素依次前移
    for (int i = pos; i < L->length; i++)
        L->data[i - 1] = L->data[i];
    L->length--;  // 长度减 1
    return OK;
}
```

删除前需要检查：指针非空、`deleted` 输出指针非空（**先检查再取值**）、删除位置合法（$1 \le pos \le length$）。移动方向与插入相反——**从前往后**前移。

![顺序表的删除操作](/notes-assets/dsa2-05-seqlist-delete.jpg)

时间复杂度分析：

| 情况 | 条件 | 时间复杂度 |
| :--- | :--- | :---: |
| 最好 | 删除表尾元素，无需移动 | $O(1)$ |
| 最坏 | 删除表头元素，$n-1$ 个元素前移 | $O(n)$ |
| 平均 | 每个位置等概率，平均移动 $\frac{n-1}{2}$ 次 | $O(n)$ |

> **注意**：插入与删除的平均移动次数是同一个量级（插入有 $n+1$ 个可插位置、平均移动 $\frac{n}{2}$ 次；删除有 $n$ 个可删位置、平均移动 $\frac{n-1}{2}$ 次），结论同为 $O(n)$——这就是顺序表"增删不便"的量化来源。两者的精确值相差半个元素，但阶相同。

#### 按位查找

```c
Status GetElem(const SeqList *L, int pos, ElementType *out) {
    if (L == NULL || out == NULL) return ERROR;
    if (pos < 1 || pos > L->length) return ERROR;
    *out = L->data[pos - 1];  // 直接返回 data[pos-1]
    return OK;
}
```

按位查找的时间复杂度是 $T(n) = O(1)$——这是顺序表的**核心优势**，也是"随机访问"最直接的体现。

#### 按值查找

```c
int LocateElem(const SeqList *L, ElementType x) {
    if (L == NULL) return -1;
    for (int i = 0; i < L->length; i++)
        if (L->data[i] == x)
            return i + 1;  // 数组下标 i，返回位序 i+1
    return -1;             // 查找失败
}
```

按值查找需要逐个比较，其复杂度分析如下：

| 情况 | 条件 | 时间复杂度 |
| :--- | :--- | :---: |
| 最好 | 目标在表头 | $O(1)$ |
| 最坏 | 目标在表尾 | $O(n)$ |
| 平均 | 每个位置等概率 $\frac{1}{n}$，平均比较 $\frac{n+1}{2}$ 次 | $O(n)$ |

> **最容易混淆的一对数字**：按值查找平均比较 $\frac{n+1}{2}$ 次，插入／删除平均移动约 $\frac{n}{2}$ 次。前者是"比较次数"，后者是"移动次数"，不要互相套用。

#### 判空、判满、求表长与输出

```c
/* 判空 —— L == NULL 也视为空表 */
int IsEmpty(const SeqList *L) {
    return (L == NULL || L->length == 0) ? 1 : 0;
}

/* 判满 —— 动态扩容版本理论上永不满，始终返回 0 */
int IsFull(const SeqList *L) {
    return 0;
}

/* 求表长 */
int GetLength(const SeqList *L) {
    return (L == NULL) ? 0 : L->length;
}
```

> **注意**：静态版本的 `IsFull` 需要检查 `length >= capacity`；动态版本因为会自动扩容，判满始终返回 0。这一差异是两种实现方式的核心区别之一。

**求表长在顺序表里是 $O(1)$**——`length` 字段直接给出答案；而在链表里必须遍历，这是 $O(n)$。不要因为习惯了顺序表就把两者混为一谈。

```c
void PrintList(const SeqList *L) {
    if (L == NULL || L->length == 0) { puts(""); return; }
    printf("%d", L->data[0]);                // 先输出第一个（避免行末多余空格）
    for (int i = 1; i < L->length; i++)
        printf(" %d", L->data[i]);
    puts("");
}
```

#### 清空

```c
/* 仅将 length 置 0，不释放 data 内存，清空后可继续插入 */
void Clear(SeqList *L) {
    if (L != NULL) L->length = 0;
}
```

> **注意**：**清空不等于销毁**。`Clear` 只重置 `length`，保留 `data` 数组和 `capacity`，之后仍可继续插入；`DestroyList` 才是彻底释放所有内存。

#### 逆置

```c
/* 逆置（原地反转）：双指针 i 从头、j 从尾向中间靠拢，交换 data[i] 与 data[j] */
void Reverse(SeqList *L) {
    if (L == NULL) return;
    for (int i = 0, j = L->length - 1; i < j; i++, j--) {
        ElementType temp = L->data[i];
        L->data[i] = L->data[j];
        L->data[j] = temp;
    }
}
```

逆置的时间复杂度 $O(n)$、空间复杂度 $O(1)$（仅需一个临时变量）；逆置两次应当恢复原顺序，这一点可以用来验证实现是否正确。

#### 销毁

```c
/* 销毁（动态版本）：两层释放，先 data 数组，再结构体 */
void DestroyList(SeqList **pL) {
    if (pL == NULL || *pL == NULL) return;
    if ((*pL)->data != NULL)
        free((*pL)->data);  // 第一步：释放动态数组
    free(*pL);              // 第二步：释放结构体
    *pL = NULL;             // 第三步：置空指针（防野指针，支持重复销毁）
}
```

静态版本只需要释放结构体本身（内部数组是静态数组，不需要单独释放）。**置空指针**这一步防止野指针，并让重复销毁成为安全的空操作。

### 顺序表的进阶操作

这一节的操作有一个共同的思维：**用一次遍历加指针分工，替代"多次删除、每次移动"的低效循环**。具体套路是双指针覆盖法（批量删除）、双指针归并（有序合并）、三步反转法（循环移位）和去重。

#### 删除所有指定值：双指针覆盖法

```c
int RemoveAll(SeqList *L, ElementType x) {
    if (L == NULL) return 0;
    int j = 0;  // 慢指针：指向下一个保留位置
    for (int i = 0; i < L->length; i++) {
        if (L->data[i] != x)
            L->data[j++] = L->data[i];  // 不等于目标值则覆盖写入
    }
    int deleted = L->length - j;
    L->length = j;
    return deleted;  // 返回实际删除的元素个数
}
```

时间复杂度 $O(n)$，且保持剩余元素的相对顺序不变；比"逐元素删除（每次 $O(n)$ 移动）"的 $O(n^2)$ 高效一个数量级。

> **注意**：双指针覆盖法的思想——快指针 `i` 遍历原数组，慢指针 `j` 记录下一个保留位置；遇到要保留的元素就覆盖到 `j` 处，`j` 再前移。这是顺序表批量删除的标准解法。

> **例 4（双指针覆盖法演示）**：顺序表 $L = (3, 1, 3, 2, 3)$，删除所有值为 3 的元素，写出指针变化过程。

快指针 `i` 逐格扫描，慢指针 `j` 只在保留元素时前进；删除时不移动任何元素，只做覆盖。

| 步骤 | 遇到的元素 | 处理 | 数组状态与 j |
| :---: | :---: | :--- | :--- |
| 1 | 3 | 删除，跳过 | $(3, 1, 3, 2, 3)$，j = 0 |
| 2 | 1 | 保留，写入 | $(1, 1, 3, 2, 3)$，j = 1 |
| 3 | 3 | 删除，跳过 | j = 1 |
| 4 | 2 | 保留，写入 | $(1, 2, 3, 2, 3)$，j = 2 |
| 5 | 3 | 删除，跳过 | j = 2 |

最终 `length = 2`，表为 $(1, 2)$，共删除 3 个元素。

评注：全程只遍历一次，没有元素搬移——若用"边找边删"，每次删除都要后移剩余元素，最坏 $O(n^2)$。覆盖法是批量删除的统一套路，区间删除只是把判断条件换掉。

#### 区间删除

```c
int RemoveRange(SeqList *L, ElementType low, ElementType high) {
    if (L == NULL) return 0;
    if (low > high) return 0;  // 空区间，删除 0 个
    int j = 0;
    for (int i = 0; i < L->length; i++) {
        if (L->data[i] < low || L->data[i] > high)
            L->data[j++] = L->data[i];
    }
    int deleted = L->length - j;
    L->length = j;
    return deleted;
}
```

删除所有满足 $low \le data[i] \le high$ 的元素，同样使用覆盖法——与 `RemoveAll` 的唯一区别就是判断条件。

#### 有序合并：双指针归并

```c
Status MergeSortedList(const SeqList *A, const SeqList *B, SeqList *C) {
    if (A == NULL || B == NULL || C == NULL) return ERROR;
    if (A->length + B->length > C->capacity) return ERROR;
    int i = 0, j = 0, k = 0;
    // 双指针归并：每次取较小者
    while (i < A->length && j < B->length) {
        if (A->data[i] <= B->data[j])
            C->data[k++] = A->data[i++];
        else
            C->data[k++] = B->data[j++];
    }
    // 处理剩余元素
    while (i < A->length) C->data[k++] = A->data[i++];
    while (j < B->length) C->data[k++] = B->data[j++];
    C->length = k;
    return OK;
}
```

**前提**：两个顺序表 A、B 均已按非降序排列。时间复杂度 $O(|A| + |B|)$，使用 `<=` 保证稳定性。**关键约束**：若合并失败（如容量不足或指针为空），必须返回 `ERROR` 且**不修改 C 的任何内容**。

> **例 5（有序归并演示）**：$A = (1, 3, 5)$，$B = (2, 4, 6)$，归并到 C，写出比较过程。

三个指针分别指向 A、B、C；每轮取 A、B 当前元素中的较小者写入 C——取谁，谁前进。

$$
1 < 2 \Rightarrow C=(1); \quad 3 > 2 \Rightarrow C=(1,2); \quad 3 < 4 \Rightarrow C=(1,2,3)
$$

$$
5 > 4 \Rightarrow C=(1,2,3,4); \quad 5 < 6 \Rightarrow C=(1,2,3,4,5); \quad B \text{ 剩 } 6 \Rightarrow C=(1,2,3,4,5,6)
$$

评注：归并是"二路归并排序"的基础，也是后续有序表问题的万能零件。取等号时取 A 的元素保证稳定性；任一表取完后，把另一表的剩余元素整体续接即可。

#### 无序去重

保留首次出现：

```c
int UniqueKeepFirst(SeqList *L) {
    if (L == NULL) return 0;
    int k = 0;
    for (int i = 0; i < L->length; i++) {
        int isDup = 0;
        for (int j = 0; j < k; j++) {
            if (L->data[i] == L->data[j]) { isDup = 1; break; }
        }
        if (!isDup) L->data[k++] = L->data[i];
    }
    int deleted = L->length - k;
    L->length = k;
    return deleted;
}
```

时间复杂度 $O(n^2)$，空间复杂度 $O(1)$。

#### 有序去重

前提是表已排序：

```c
int UniqueSorted(SeqList *L) {
    if (L == NULL || L->length <= 1) return 0;
    int j = 1;
    for (int i = 1; i < L->length; i++) {
        if (L->data[i] != L->data[j - 1])
            L->data[j++] = L->data[i];
    }
    int deleted = L->length - j;
    L->length = j;
    return deleted;
}
```

时间复杂度 $O(n)$，只需与已保留的**最后一个元素**比较——因为有序表中重复元素必然相邻。

> **注意**：数据如果频繁需要去重，**先排序再去重**把 $O(n^2)$ 降成 $O(n \log n + n)$ 是一个值得考虑的优化策略。

#### 循环右移：三步反转法

循环右移 $k$ 位等价于循环右移 $k \bmod length$ 位（先取模，避免无效循环）。**三步反转法**的做法是：整体逆置 → 前 $k$ 个逆置 → 后 $n-k$ 个逆置。时间复杂度 $O(n)$、空间复杂度 $O(1)$，是处理循环移动的标准技巧。

> **例 6（三步反转法演示）**：$L = (1, 2, 3, 4, 5, 6)$，循环右移 2 位。

$k \bmod n = 2$，于是三步反转：

$$
\text{整体逆置：}(6, 5, 4, 3, 2, 1)
$$

$$
\text{前 2 个逆置：}(5, 6, 4, 3, 2, 1)
$$

$$
\text{后 4 个逆置：}(5, 6, 1, 2, 3, 4)
$$

验证：右移 2 位后，原本末尾的 $(5, 6)$ 应当出现在最前面。

评注：三步反转把"移动"转化为三次"逆置"，每次逆置都是 $O(n)$ 的双指针交换，总计 $O(n)$ 时间、$O(1)$ 空间。左移 $k$ 位同理，只是分组方式换成"前 $n-k$ 个"与"后 $k$ 个"。

#### 批量插入

```c
Status InsertRange(SeqList *L, int pos, const ElementType *arr, int count) {
    if (L == NULL || L->data == NULL) return ERROR;
    if (count < 0) return ERROR;
    if (count > 0 && arr == NULL) return ERROR;
    if (pos < 0 || pos > L->length) return ERROR;
    // 确保容量足够（循环扩容，每次翻倍）
    int need = L->length + count;
    while (L->capacity < need) {
        if (ExpandCapacity(L, L->capacity * 2) == ERROR)
            return ERROR;
    }
    // 后移元素（从后往前）
    for (int i = L->length - 1; i >= pos; i--)
        L->data[i + count] = L->data[i];
    // 复制新数据
    for (int i = 0; i < count; i++)
        L->data[pos + i] = arr[i];
    L->length += count;
    return OK;
}
```

批量插入的思路：先**整体后移 count 格**（依然从后往前），再一次性写入多个新元素——比逐个调用单点插入高效得多。注意 `pos` 在此函数里是**数组下标**语义（$0 \le pos \le length$），与位序语义要区分清楚。

## 单链表

**单链表**（Singly Linked List）是用链式存储方式实现的线性表：每个结点除数据外还存一个指向后继的指针，逻辑上相邻的元素在物理上可以天各一方。它与顺序表恰好互补——**插入删除高效**（改指针 $O(1)$），但**查找必须遍历**（$O(n)$）。这一节先回答"链表是什么、结点怎么定义、要不要头结点"三个问题，其中**头结点的取舍**是最重要的设计决策。

### 链式存储的优劣与结点定义

#### 链式存储的优劣

| 优点 | 缺点 |
| :--- | :--- |
| 不要求大片连续空间，改变容量方便 | 不可随机存取，需从头遍历 |
| 插入／删除不需要移动大量元素 | 需要额外空间存放指针 |

#### 结点定义

**单链表**是只具有一个指针域的链表。每个结点包含**数据域**（存储数据元素）和**指针域**（指向直接后继）：

```c
typedef int ElementType;
typedef struct LNode {
    ElementType data;        // 每个结点存放一个数据元素
    struct LNode *next;      // 指针指向下一个结点
} LNode, *LinkList;          // 将 LNode* 重命名为 LinkList
```

![单链表的结点](/notes-assets/dsa2-06-singly-node.jpg)

`LinkList` 与 `LNode*` 同为结构指针类型，本质上完全等价。习惯上用 `LinkList` 声明**头指针**变量，强调它是某个单链表的头指针，以提高程序可读性；用 `LNode*` 声明**普通结点**指针。

#### 不带头结点的实现

不带头结点时，空表就是 `L == NULL`（头指针为空），头插或删除第一个元素时都必须修改头指针：

```c
/* 不带头结点初始化 —— 空表就是 NULL */
void InitList(LinkList *pL) {
    if (pL != NULL) *pL = NULL;  // 防止"脏数据"
}
```

#### 带头结点的实现与取舍

带头结点时，**头结点不存储数据元素**，头指针始终指向头结点，空表时 `L->next == NULL`：

```c
/* 带头结点初始化 —— 分配头结点 */
LinkList InitList(void) {
    LNode *L = (LNode*)malloc(sizeof(LNode));  // 分配一个头结点
    if (L == NULL) return NULL;                // 内存不足，分配失败
    L->next = NULL;                            // 头结点之后暂无结点
    return L;
}
```

头结点的作用是让**空表和非空表得到统一处理**：头指针始终指向头结点，第一个数据结点的地址保存在头结点的指针域中，于是对第一个结点的操作与其他结点完全相同，不需要任何特殊分支。

带头结点与不带头结点的核心差异：

| 特性 | 不带头结点 | 带头结点 |
| :--- | :--- | :--- |
| **空表判定** | `L == NULL` | `L->next == NULL` |
| **首元素操作** | 需特殊处理（修改头指针） | 统一（前驱总是头结点） |
| **初始化** | 直接置 `L = NULL` | 分配头结点内存 |
| **销毁** | 释放所有结点 + 置 `L = NULL` | 释放所有结点（含头结点） |
| **代码复杂度** | 较高（需分情况处理） | 较低 |

![单链表的实现](/notes-assets/dsa2-07-singly-implementation.jpg)

> **取舍的结论**：工程实现中**优先选择带头结点**。代价是多一个结点的空间，收益是把"第一个结点"这个边界情形彻底消除——插入、删除、判空、销毁全都不再需要单独分支。这是一次典型的空间换代码简洁性：多花的空间是常数级的，省下的是每一处操作的边界判断，而边界判断正是链表代码最容易出错的地方。

### 单链表的基本操作

这一节实现单链表的增删查改。插入的核心铁律是**"先链接，后断开"**；删除的核心视角是**始终站在前驱结点上操作**。

#### 插入

> **插入原则**：先链接，后断开（先让新结点指向后继（`s->next = p->next`），再让前驱指向新结点（`p->next = s`）。）顺序反了会先切断链表，导致后继结点再也找不到。

带头结点的按位序插入：

```c
bool ListInsert(LinkList L, int i, ElementType e) {
    if (i < 1) return false;
    LNode *p = L;       // p 指向头结点（第 0 个结点，不存数据）
    int j = 0;
    while (p != NULL && j < i - 1) {  // 找到第 i-1 个结点
        p = p->next;
        j++;
    }
    if (p == NULL) return false;  // i 值不合法
    LNode *s = (LNode*)malloc(sizeof(LNode));
    s->data = e;
    s->next = p->next;   // ① 新结点指向后继
    p->next = s;         // ② 前驱指向新结点
    return true;
}
```

![带头结点单链表的按位序插入操作](/notes-assets/dsa2-08-head-node-insert-by-index.jpg)

时间复杂度分析：

| 情况 | 条件 | 时间复杂度 |
| :--- | :--- | :---: |
| 最好 | $i=1$，插在表头 | $O(1)$ |
| 最坏 | $i=n$，插在表尾 | $O(n)$ |
| 平均 | — | $O(n)$ |

不带头结点的按位序插入只需额外添加 $i=1$ 时的特殊处理：

```c
if (i == 1) {  // 特殊处理：插入到第一个位置
    LNode *s = (LNode*)malloc(sizeof(LNode));
    s->data = e;
    s->next = L;  // 新结点指向原来的第一个结点
    L = s;        // 头指针指向新结点
}
```

![不带头结点单链表的头插操作](/notes-assets/dsa2-09-nohead-head-insert.jpg)

这段对比正是头结点价值的直接证据：同样是在表头插入，不带头结点要多写一个分支，还要把修改后的头指针传回去。

#### 建立单链表：头插法与尾插法

按位序插入回答的是"已知一条表，往中间塞一个结点"；建表回答的是"从空表开始，把一批数据一个个挂上去"。两者用的是同一套改链动作，区别只在于**每次插在哪儿**：

**头插法**

每次把新结点插到头结点之后，因此链表中的次序与输入次序**相反**。它天然就是"逆序建表"，也正是就地逆置单链表所用的方法。

```c
/* 头插法建表：每次插到头结点之后，得到与输入次序相反的链表 */
LinkList List_HeadInsert(LinkList L) {
    LNode *s;
    ElementType x;
    L->next = NULL;              // 初始为空链表
    scanf("%d", &x);
    while (x != 9999) {          // 输入 9999 表示结束
        s = (LNode*)malloc(sizeof(LNode));
        s->data = x;
        s->next = L->next;       // 新结点插到头结点之后
        L->next = s;
        scanf("%d", &x);
    }
    return L;
}
```

**尾插法**

每次把新结点挂在表尾，次序与输入一致。为了不必每次都遍历到表尾，需要额外维护一个**尾指针** `r`。

```c
/* 尾插法建表：用尾指针 r 记录表尾，次序与输入一致 */
LinkList List_TailInsert(LinkList L) {
    LNode *s, *r = L;            // r 为表尾指针，初始指向头结点
    ElementType x;
    L->next = NULL;
    scanf("%d", &x);
    while (x != 9999) {
        s = (LNode*)malloc(sizeof(LNode));
        s->data = x;
        r->next = s;             // 新结点挂在表尾
        r = s;                   // 尾指针后移到新结点
        scanf("%d", &x);
    }
    r->next = NULL;              // 尾结点后继置空
    return L;
}
```

> **口诀**：**头插法建表得到逆序，尾插法建表保持原序**。头插法每次插在表头是 $O(1)$；尾插法借助尾指针，插在表尾同样是 $O(1)$。如果尾插法每次都从头遍历到表尾再插入，建一张 $n$ 个结点的表就要 $O(n^2)$——这个尾指针正是"空间换时间"的最小例子。

#### 指定结点的后插与前插

**后插操作**

在结点 `p` 之后插入新结点，复杂度 $O(1)$：

```c
bool InsertNextNode(LNode *p, ElementType e) {
    if (p == NULL) return false;
    LNode *s = (LNode*)malloc(sizeof(LNode));
    if (s == NULL) return false;  // 内存分配失败
    s->data = e;                  // 用结点 s 保存数据元素 e
    s->next = p->next;
    p->next = s;                  // 将结点 s 连到 p 之后
    return true;
}
```

![指定结点的后插操作](/notes-assets/dsa2-10-insert-next.jpg)

**前插操作**

在结点 `p` 之前插入需要一点技巧。单链表找前驱必须从头遍历，做不到 $O(1)$；但如果允许"改数据"，就能把"插在前面"变成"插在后面再交换数据"，俗称**偷梁换柱**：

```c
bool InsertPriorNode(LNode *p, ElementType e) {
    if (p == NULL) return false;
    LNode *s = (LNode*)malloc(sizeof(LNode));
    if (s == NULL) return false;
    s->next = p->next;
    p->next = s;          // 新结点 s 连到 p 之后
    s->data = p->data;    // 将 p 中元素复制到 s 中
    p->data = e;          // p 中元素覆盖为 e（"偷梁换柱"）
    return true;
}
```

![指定结点的前插操作](/notes-assets/dsa2-11-insert-prior.jpg)

> **例 7（"偷梁换柱"前插演示）**：p 指向值为 5 的结点（其后继值为 8），要求在其**前方**插入值为 7 的新结点，且时间复杂度为 $O(1)$。

单链表无法 $O(1)$ 找到前驱，于是"曲线救国"：新结点插到 p **之后**，再交换 p 与新结点的数据域——数据顺序对了，逻辑位置就对了。

第一步，把新结点 $s$ 插到 $p$ 之后：

$$
\text{新结点 } s \text{ 插到 } p \text{ 后：}\;\; \cdots \to 5 \to 8 \to \cdots \quad \Rightarrow \quad \cdots \to 5 \to \underbrace{?}_{s} \to 8 \to \cdots
$$

第二步，把 $s$ 的数据域复制成 5，再把 $p$ 的数据域覆盖为 7：

$$
s \text{ 的数据域复制 } 5 \text{，} p \text{ 的数据域覆盖为 } 7:\;\; \cdots \to 7 \to 5 \to 8 \to \cdots
$$

评注：前插 $O(1)$ 的本质是"**位置后插 + 数据交换**"——空间上插入在 p 之后，逻辑上却等效于插在 p 之前。这是链表技巧中"用数据搬家代替指针查找"的经典范例。

#### 按位序删除

带头结点的按位序删除：

```c
bool ListDelete(LinkList L, int i, ElementType *e) {
    if (i < 1) return false;
    LNode *p = L;
    int j = 0;
    while (p->next != NULL && j < i - 1) {  // 找到第 i-1 个结点
        p = p->next;
        j++;
    }
    if (p->next == NULL) return false;  // 第 i 个结点不存在
    LNode *q = p->next;                 // 令 q 指向被删除结点
    *e = q->data;                       // 用 e 返回被删除元素的值
    p->next = q->next;                  // 将 q 结点从链中"断开"
    free(q);                            // 释放被删除结点的存储空间
    return true;
}
```

![单链表的按位序删除操作](/notes-assets/dsa2-12-delete-by-index.jpg)

| 情况 | 时间复杂度 |
| :--- | :---: |
| 最好 | $O(1)$ |
| 最坏／平均 | $O(n)$ |

#### 删除指定结点

同样可以用"偷梁换柱"做到 $O(1)$：

```c
bool DeleteNode(LNode *p) {
    if (p == NULL || p->next == NULL) return false;
    LNode *q = p->next;           // 令 q 指向 p 的后继结点
    p->data = p->next->data;      // 和后继结点交换数据域
    p->next = q->next;            // 将 q 结点从链中"断开"
    free(q);                      // 释放后继结点的存储空间
    return true;
}
```

![指定结点的删除操作](/notes-assets/dsa2-13-delete-node.jpg)

> **注意**：这个方法有一个明确的局限——**不能删除表尾结点**。表尾结点的 `p->next == NULL`，取后继数据会直接空指针崩溃。删除表尾只能从表头开始遍历，找到表尾结点的前驱再删除，代价退化为 $O(n)$。因此说这类技巧时，必须带上"除表尾外"这个前提。

#### 按位查找与按值查找

```c
/* 按位查找 —— 从头结点（第 0 个）出发，循环 i 次找到第 i 个结点 */
LNode* GetElem(LinkList L, int i) {
    if (i < 0) return NULL;
    LNode *p = L;
    int j = 0;
    while (p != NULL && j < i) { p = p->next; j++; }
    return p;
}

/* 按值查找 —— 从第一个数据结点开始遍历，比较数据域 */
LNode* LocateElem(LinkList L, ElementType e) {
    LNode *p = L->next;
    while (p != NULL && p->data != e) p = p->next;
    return p;  // 找到返回结点指针，否则返回 NULL
}
```

两者的时间复杂度均为 $O(n)$——与顺序表按位查找的 $O(1)$ 形成鲜明对比。

#### 求表长与输出

```c
/* 求表长 —— 遍历计数 */
int Length(LinkList L) {
    int len = 0;
    LNode *p = L;
    while (p->next != NULL) { p = p->next; len++; }
    return len;
}

/* 输出链表 */
void PrintList(LinkList L) {
    if (L == NULL || L->next == NULL) { puts(""); return; }
    LNode *p = L->next;
    printf("%d", p->data);
    p = p->next;
    while (p != NULL) { printf(" %d", p->data); p = p->next; }
    puts("");
}
```

求表长必须遍历，因此是 $O(n)$——链表里没有 `length` 字段可用，这是"无随机访问"的直接后果。

#### 倒置

```c
/* 逐个头插 —— 将原链表元素依次头插到头结点之后 */
void Reverse(LinkList L) {
    LNode *p = L->next;   // p 指向第一个结点
    L->next = NULL;       // 断开头结点
    while (p != NULL) {
        LNode *q = p->next;  // 用指针 q 记录 p 的后继
        p->next = L->next;   // 把 p 指向的结点头插到 L 中
        L->next = p;
        p = q;               // p 与 q 的指向一致，继续处理下一个
    }
}
```

**逐个头插法**：把原链表的结点依次摘下并头插到头结点之后。时间复杂度 $O(n)$、空间复杂度 $O(1)$（原地逆置）。

#### 合并

```c
void MergeList(LinkList LA, LinkList LB) {
    LNode *pa = LA->next;   // pa 和 pb 分别指向 LA 和 LB 的第一个结点
    LNode *pb = LB->next;
    LA->next = NULL;        // 头结点与第一个结点断开
    LNode *r = LA;          // 尾指针 r，便于 O(1) 尾插
    /* 选择较小值的结点挂接 */
    while (pa != NULL && pb != NULL) {
        if (pa->data <= pb->data) { r->next = pa; r = pa; pa = pa->next; }
        else                      { r->next = pb; r = pb; pb = pb->next; }
    }
    if (pa != NULL) r->next = pa;  // 若 LA 未处理完
    if (pb != NULL) r->next = pb;  // 若 LB 未处理完
    free(LB);                      // 释放 LB 头结点空间
}
```

使用**双指针归并 + 尾指针**，时间复杂度 $O(|LA| + |LB|)$。注意合并后原链表的结点已被"挪用"到新链上，调用方的原链表头指针应当置空或释放，否则会留下一个指向已搬迁结点的悬空句柄。

#### 清空与销毁

```c
/* 清空 —— 释放所有数据结点，保留头结点 */
void Clear(LinkList L) {
    if (L == NULL) return;
    LNode *p = L->next;
    while (p != NULL) {
        LNode *q = p->next;
        free(p);
        p = q;
    }
    L->next = NULL;
}

/* 销毁 —— 清空 + 释放头结点 */
void DestroyList(LinkList *pL) {
    if (pL == NULL || *pL == NULL) return;
    Clear(*pL);      // 先清空所有数据结点
    free(*pL);       // 再释放头结点
    *pL = NULL;      // 置空（支持重复销毁）
}
```

单链表的优缺点与应用：

| 优点 | 缺点 |
| :--- | :--- |
| 内存开销较小 | 只能单向遍历 |
| 插入／删除操作高效（$O(1)$ 改链） | 存储密度比顺序表小 |
| 动态分配内存，改变容量方便 | 不可随机存取，查找需要 $O(n)$ |

**应用场景**：需要频繁在头部插入／删除的场景，例如栈的实现。

### 单链表的进阶操作

链表题目有一个共同的思维转变：顺序表靠"移动元素"调整次序，链表靠"重接指针"调整次序。下面这些操作覆盖了最常见的几种重接方式——有序插入、批量删除、快慢指针、奇偶拆分、合并去重，以及不带头结点时的特殊技巧。

#### 有序插入

```c
/* 前提：链表已按非降序排列。找到第一个大于 x 的结点，在其前驱后插入 */
Status InsertSorted(LinkList L, ElementType x) {
    if (L == NULL) return ERROR;
    LNode *s = (LNode*)malloc(sizeof(LNode));
    if (s == NULL) return ERROR;
    s->data = x;
    LNode *p = L;
    while (p->next != NULL && p->next->data < x)
        p = p->next;
    s->next = p->next;
    p->next = s;
    return OK;
}
```

> **例 8（有序插入演示）**：有序链表 $1 \to 3 \to 5$，插入值为 4 的结点。

从第一个数据结点开始，找"第一个数据域大于 4 的结点"，在其**前驱**之后插入——插入后 4 位于 3 与 5 之间，链表仍然有序。

$$
p \text{ 从 } 1 \to 3 \text{（} 3 < 4 \text{，继续）} \to 5 \text{（} 5 \ge 4 \text{，停）}
$$

$$
p \text{ 停在 } 3 \text{ 处：}\;\; 1 \to 3 \xrightarrow{\text{插入 } s(4)} 5 \quad \Rightarrow \quad 1 \to 3 \to 4 \to 5
$$

评注：循环条件写成 `p->next->data < x`，等于停在第一个**不小于** x 的结点的前驱上，这样插入后严格保序。找位置是 $O(n)$，改链是 $O(1)$。

#### 删除所有指定值与区间删除

```c
/* 删除所有指定值 —— 始终站在前驱 p 的视角，检查 p->next */
int RemoveAll(LinkList L, ElementType x) {
    if (L == NULL) return 0;
    int count = 0;
    LNode *p = L;
    while (p->next != NULL) {
        if (p->next->data == x) {
            LNode *q = p->next;
            p->next = q->next;  // 删除后 p 不移动（新的 p->next 也需检查）
            free(q);
            count++;
        } else {
            p = p->next;  // 不需要删除时才移动 p
        }
    }
    return count;
}

/* 区间删除 —— 删除所有满足 low ≤ 值 ≤ high 的结点 */
int RemoveRange(LinkList L, ElementType low, ElementType high) {
    if (L == NULL) return 0;
    if (low > high) return 0;
    int count = 0;
    LNode *p = L;
    while (p->next != NULL) {
        if (p->next->data >= low && p->next->data <= high) {
            LNode *q = p->next;
            p->next = q->next;
            free(q);
            count++;
        } else {
            p = p->next;
        }
    }
    return count;
}
```

> **注意**：与顺序表的覆盖法不同，链表删除始终需要站在**前驱结点**的视角（检查 `p->next`）。删除后 `p` **不移动**，因为新的 `p->next` 也需要检查——只有在一轮没有删除时，`p` 才前移一格。

#### 查找中间结点：快慢指针

```c
LNode* FindMiddle(LinkList L) {
    if (L == NULL || L->next == NULL) return NULL;
    LNode *slow = L->next;   // 慢指针每次走 1 步
    LNode *fast = L->next;   // 快指针每次走 2 步
    while (fast->next != NULL && fast->next->next != NULL) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;  // fast 到表尾时，slow 恰在中间
}
```

$O(n)$ 时间、$O(1)$ 空间。**快慢指针**是链表问题的经典技巧，判断链表是否有环用的也是同一思想。

> **例 9（快慢指针演示）**：链表 $1 \to 2 \to 3 \to 4 \to 5$，用快慢指针找中间结点。

`slow` 每次走 1 步、`fast` 每次走 2 步；当 `fast` 到达表尾（不能再走 2 步）时，`slow` 恰好在中间。

| 轮次 | fast 位置 | slow 位置 |
| :---: | :---: | :---: |
| 0 | 1 | 1 |
| 1 | 3 | 2 |
| 2 | 5（`fast->next == NULL`，停止） | 3 |

`slow` 指向结点 3，即中间结点。

评注：快指针速度是慢指针的 2 倍，快指针走完时慢指针恰好走了一半。若结点数为偶数，返回的是靠左还是靠右的中间结点取决于循环条件——本题的循环条件使偶数个时返回**偏左**的中间结点，实际使用时可结合需求调整。判环（环形链表检测）用同一思想：快慢指针相遇即有环。

#### 拆分奇偶位置

```c
/* 将原链表按位序奇偶拆分为两个链表（位序从 1 开始） */
void SplitOddEven(LinkList L, LinkList oddList, LinkList evenList) {
    LNode *p = L->next;
    int pos = 1;
    LNode *oddTail = oddList, *evenTail = evenList;
    while (p != NULL) {
        LNode *next = p->next;
        p->next = NULL;
        if (pos % 2 == 1) { oddTail->next = p;  oddTail = p; }
        else              { evenTail->next = p; evenTail = p; }
        p = next;
        pos++;
    }
}
```

先保存 `p->next`（存进 `next` 指针），再把 `p` 摘下来挂到对应链表的**尾指针**之后——"先保存后继，再摘结点"是链表拆分题的固定动作，漏掉第一步就会丢失后半条链。

#### 有序链表合并

```c
LinkList MergeSorted(LinkList LA, LinkList LB) {
    LinkList LC = InitList();
    LNode *pa = LA->next, *pb = LB->next;
    LNode *tail = LC;  // 尾指针，便于 O(1) 尾插
    while (pa != NULL && pb != NULL) {
        if (pa->data <= pb->data) { tail->next = pa; pa = pa->next; }
        else                      { tail->next = pb; pb = pb->next; }
        tail = tail->next;
    }
    tail->next = (pa != NULL) ? pa : pb;
    LA->next = NULL;  // 原链表结点已被挪用，置空防误操作
    LB->next = NULL;
    return LC;
}
```

与顺序表归并结构相同，区别在于链表归并只改指针、**不复制数据**——结点被整条"挪用"过来，因此原链表的头指针必须置空以防误操作。

#### 链表去重

```c
/* 对每个结点 p，在其后续链表中删除所有值相同的结点 */
int Deduplicate(LinkList L) {
    if (L == NULL || L->next == NULL) return 0;
    int count = 0;
    LNode *p = L->next;
    while (p != NULL) {
        LNode *q = p;
        while (q->next != NULL) {
            if (q->next->data == p->data) {
                LNode *tmp = q->next;
                q->next = tmp->next;
                free(tmp);
                count++;
            } else {
                q = q->next;
            }
        }
        p = p->next;
    }
    return count;
}
```

对每个结点 `p`，在它**之后的链**中删除所有值相同的结点（内层同样站在前驱 `q` 的视角）。时间复杂度 $O(n^2)$——无序链表去重没有顺序表有序版那种 $O(n)$ 的捷径。

#### 链表求交集

```c
/* 将 LA 和 LB 中都出现的元素放入 LC（保留首次出现，去重） */
Status Intersection(LinkList LA, LinkList LB, LinkList LC) {
    if (LA == NULL || LB == NULL || LC == NULL) return ERROR;
    Clear(LC);
    LNode *pa = LA->next;
    while (pa != NULL) {
        LNode *pb = LB->next;
        while (pb != NULL) {
            if (pa->data == pb->data) {
                // 检查是否已在 LC 中（避免重复）
                LNode *pc = LC->next;
                int found = 0;
                while (pc != NULL) {
                    if (pc->data == pa->data) { found = 1; break; }
                    pc = pc->next;
                }
                if (!found) {
                    LNode *s = (LNode*)malloc(sizeof(LNode));
                    s->data = pa->data;
                    s->next = LC->next;
                    LC->next = s;
                }
                break;
            }
            pb = pb->next;
        }
        pa = pa->next;
    }
    return OK;
}
```

三重遍历：对 LA 的每个结点，先在 LB 中查找；命中后再查 LC 去重，最后用头插法挂入。时间复杂度 $O(|LA| \times |LB| \times |LC|)$——只适合小规模数据。

#### 不带头结点时的特殊处理

不带头结点的链表里，头指针可能在操作中被修改，因此参数要用**二级指针**（`LinkList *pL`）；第一个位置上的增删永远需要特殊处理。有一个通用技巧可以消除这种特殊性：临时借一个哑结点。

```c
/* 逆置区间 [m, n] —— 临时哑结点技巧，统一边界处理 */
Status ReverseRange(LinkList *pL, int m, int n) {
    if (pL == NULL || *pL == NULL || m >= n || m < 1) return ERROR;
    LNode dummy;           // 临时哑结点，统一边界处理
    dummy.next = *pL;
    LNode *prev = &dummy;
    for (int i = 1; i < m; i++) {
        if (prev->next == NULL) return ERROR;
        prev = prev->next;
    }
    LNode *start = prev->next, *then = start->next;
    for (int i = 0; i < n - m; i++) {
        start->next = then->next;
        then->next = prev->next;
        prev->next = then;
        then = start->next;
    }
    *pL = dummy.next;
    return OK;
}
```

```c
/* 删除最小值结点 */
Status DeleteMin(LinkList *pL, ElementType *minVal) {
    if (pL == NULL || *pL == NULL || minVal == NULL) return ERROR;
    LNode *p = *pL, *minPrev = NULL, *minNode = p;
    while (p->next != NULL) {  // 扫描找最小值及其前驱
        if (p->next->data < minNode->data) { minPrev = p; minNode = p->next; }
        p = p->next;
    }
    *minVal = minNode->data;
    if (minPrev == NULL) *pL = minNode->next;  // 最小值在第一个位置
    else                 minPrev->next = minNode->next;
    free(minNode);
    return OK;
}
```

> **临时哑结点技巧**：当链表本身没有头结点、又希望所有位置一视同仁时，可以在栈上创建一个**临时哑结点**（`LNode dummy; dummy.next = *pL;`），让它的 `next` 指向原来的第一个结点；操作完成后执行 `*pL = dummy.next;` 把真实的头指针换回来。这相当于"借一个头结点，用完即还"，代价只是一次栈上分配。

## 双链表

双链表解决的问题是：单链表**找前驱必须从头遍历**。办法很直接——给每个结点再加一个指向前驱的指针。代价是每结点多一份指针空间，以及插入删除时要多维护两根指针。

### 结点定义与初始化

#### 结点定义

**双链表**是每个结点具有**两个指针**的链表（前驱指针 `prior` 加后继指针 `next`）：

```c
typedef struct DNode {
    ElementType data;             // 数据域
    struct DNode *prior, *next;   // 前驱指针，后继指针
} DNode, *DLinkList;
```

![双链表](/notes-assets/dsa2-14-doubly-list.jpg)

#### 初始化

```c
bool InitDLinkList(DLinkList *L) {
    *L = (DNode*)malloc(sizeof(DNode));  // 分配一个头结点
    if (*L == NULL) return false;        // 内存不足，分配失败
    (*L)->prior = NULL;                  // 头结点的前驱指针永远指向 NULL
    (*L)->next = NULL;                   // 头结点之后暂无结点
    return true;
}
```

注意**头结点的前驱指针恒为 NULL**（循环双链表除外）——这是双链表判空与边界判断的基准。

### 双链表的基础操作

#### 插入操作

```c
/* 在 p 结点之后插入 s 结点 —— 需同时维护 4 根指针 */
bool InsertNextDNode(DNode *p, DNode *s) {
    if (p == NULL || s == NULL) return false;
    s->next = p->next;      // ① 将结点 s 插入到结点 p 之后
    if (p->next != NULL)    // ② 如果 p 有后继结点，修改后继的 prior
        p->next->prior = s;
    s->prior = p;           // ③ s 的前驱指向 p
    p->next = s;            // ④ p 的后继指向 s
    return true;
}
```

![双链表的插入操作](/notes-assets/dsa2-15-doubly-insert.jpg)

> **例 10（双链表四指针维护）**：双链表中 `p` 指向结点 x（其后继为 y），将新结点 s 插入到 p 之后，写出指针修改顺序。

双链表插到 p 之后需要维护 **4 根指针**：s 的 next、y 的 prior、s 的 prior、p 的 next。关键是先让 s 与后继 y 建立联系，再改 p 这一侧——与单链表"先链接后断开"同理。

$$
s \to next = y \;\;(\text{即 } p \to next)
$$

$$
y \to prior = s \;\;(\text{仅当 } y \text{ 存在})
$$

$$
s \to prior = p
$$

$$
p \to next = s
$$

结果：$\cdots \leftrightarrow x \leftrightarrow s \leftrightarrow y \leftrightarrow \cdots$

评注：四步顺序不能乱——第 ①② 步必须在第 ④ 步之前完成，否则 `p->next` 被改写之后就找不到 y 了。如果 p 恰好是表尾结点（`p->next == NULL`），第 ② 步必须跳过。**改前驱之前先判空**是双链表操作的铁律。

#### 删除操作

```c
/* 删除 p 的后继结点 q */
bool DeleteNextDNode(DNode *p) {
    if (p == NULL) return false;
    DNode *q = p->next;           // 找到 p 的后继结点 q
    if (q == NULL) return false;  // p 没有后继
    p->next = q->next;
    if (q->next != NULL)          // q 结点不是最后一个结点
        q->next->prior = p;
    free(q);                      // 释放结点空间
    return true;
}
```

![双链表的删除操作](/notes-assets/dsa2-16-doubly-delete.jpg)

删除同样只需维护 2 根指针（p 的 next、q 的后继的 prior），并且**改前驱之前同样要判空**。

#### 双向遍历

遍历的两个方向：

- **前向遍历**：`while (p != NULL) p = p->next;`
- **后向遍历**：`while (p != NULL) p = p->prior;`

时间复杂度都是 $O(n)$。双链表的整体遍历代价与单链表相同，但它真正的价值在于**给定一个结点后，找它的前驱是 $O(1)$**——单链表在这一步要 $O(n)$。这正是双链表存在的意义。

#### 优缺点与应用

| 优点 | 缺点 |
| :--- | :--- |
| 可以双向遍历，操作更灵活 | 内存开销更大（每结点多存一个指针） |
| 给定结点可直接找到前驱 | 插入／删除需维护更多指针 |

**应用场景**：需要双向遍历的场景，例如双向队列、LRU 缓存。

## 循环单链表与循环双链表

循环链表解决的是"能否从任意结点出发遍历全表"的问题。做法是把链的末端接回起点：单链表让表尾的后继指向头结点，双链表再让头结点的前驱指向表尾，形成闭环。理解它只需记住一句话——**判空条件和遍历终止条件都要跟着改**。

### 循环单链表

**循环单链表**是表尾后继指针指向头结点的单链表——从任意结点出发都能遍历全表。

```c
bool InitList(LinkList *L) {
    *L = (LNode*)malloc(sizeof(LNode));  // 分配一个头结点
    if (*L == NULL) return false;        // 内存不足，分配失败
    (*L)->next = *L;                     // 头结点 next 指向头结点（自环）
    return true;
}
```

![循环单链表](/notes-assets/dsa2-17-circular-singly.jpg)

**判空条件变为 `L->next == L`**（头结点的 next 指向自己）。尾插操作时需要把表尾结点的后继指针指回头结点。循环单链表的头指针 L 还可以指向**表尾元素**——此时"在尾部插入／删除"能做成 $O(1)$。

> **注意**：遍历循环链表时，终止条件不能再用 `p == NULL`，必须改用 `p == L`（回到了头结点）——否则会陷入**死循环**。这是从单链表迁移到循环链表时最容易忘记的一处修改。

### 循环双链表

**循环双链表**是头结点的前驱指针指向表尾结点、表尾结点的后继指针指向头结点的双链表，形成**双向闭环**。

```c
bool InitDLinkList(DLinkList *L) {
    *L = (DNode*)malloc(sizeof(DNode));  // 分配一个头结点
    if (*L == NULL) return false;        // 内存不足，分配失败
    (*L)->next = *L;                     // 头结点的 next 指向头结点
    (*L)->prior = *L;                    // 头结点的 prior 指向头结点
    return true;
}
```

![循环双链表](/notes-assets/dsa2-18-circular-doubly.jpg)

循环双链表的**判空条件是 `L->next == L && L->prior == L`**。因为头尾互相指向，双链表插入／删除中的"改前驱先判空"可以省掉——任何一个位置的后继和前驱都必然存在，边界情形消失了。

### 优缺点与应用

| 优点 | 缺点 |
| :--- | :--- |
| 可从任意结点开始遍历整个链表 | 遍历时需避免死循环 |
| 适合循环轮询场景 | 实现相对复杂 |

**应用场景**：循环轮询调度，例如操作系统的时间片轮转、约瑟夫环问题。

## 静态链表

静态链表要回答的问题是：**在没有指针的环境里，怎么表达链式结构？**答案是用数组下标代替指针。它分配一整片连续内存空间，各结点集中安置，下一个结点的数组下标称为**游标**（cursor），充当"指针"的角色。约定 $0$ 号结点充当头结点，游标为 $-1$ 表示已经到达表尾。

![静态链表](/notes-assets/dsa2-19-static-list.jpg)

设起始地址为 $addr$，数据元素与游标各占 $4B$，则 $e_1$ 的地址为 $addr + 8$。地址的计算方式与顺序表一致，但访问路径仍然要沿游标一格一格"跳转"，因此**静态链表不能随机存取**——这正是它"用顺序存储实现链式逻辑"的代价。

```c
const int MaxSize = 10;  // 静态链表的最大长度
struct Node {
    ElementType data;     // 数据域
    int next;             // 游标域
} a[MaxSize];             // 将数组 a 作为静态链表
```

基本操作：

- **初始化**：将 $a[0]$ 的 `next` 设为 $-1$；
- **查找**：从头结点出发挨个往后遍历结点，时间复杂度 $O(n)$；
- **插入**（在位序 $i$ 插入）：先找到一个空结点存放数据，再找到位序 $i-1$ 的结点，令新结点的 `next` 等于**原 $i-1$ 号结点的 `next`**（即原来的第 $i$ 个结点），最后把 $i-1$ 号结点的 `next` 改成新结点的下标。

> **注意**：插入时新结点的 `next` 要指向"原来的下一个结点"，只有在表尾插入时才恰好是 $-1$。写实现时如果把新结点的 `next` 一律设为 $-1$，等于每插一次就在新结点处截断链表。

| 优点 | 缺点 |
| :--- | :--- |
| 插入／删除不需要大量移动元素 | 不能随机存取，只能从头开始查找 |
| 连续存储，无内存碎片 | 容量固定不可变 |

**适用场景**：不支持指针的低级语言；数据元素个数固定不变的场景，例如操作系统的**文件分配表 FAT**。

## 小结

- **线性表是逻辑结构**：$n$ 个同类型元素的有限序列，位序从 1 开始、数组下标从 0 开始，两者恒差 1。
- **顺序表用地址换速度**：地址公式 $LOC(L) + (i-1) \times \text{元素大小}$ 让它拿到 $O(1)$ 随机访问，代价是插入／删除平均要移动约 $\frac{n}{2}$ 个元素。
- **静态分配容量编译期固定，动态分配靠 `malloc` 与 `realloc` 扩容**；×2 倍增把 $n$ 次插入的总复制代价摊还到接近 $O(1)$。
- **头结点是链表最重要的设计取舍**：多花一个结点的空间，换掉所有"第一个结点"的边界分支，因此工程上优先带头结点。
- **链表的动作要领只有两条**：插入"先链接、后断开"，删除"站在前驱的视角"；指定结点的前插与删除可以用"偷梁换柱"做到 $O(1)$，但删除表尾是例外。
- **双链表买的是前驱**：整体遍历仍是 $O(n)$，但给定结点后找前驱变成 $O(1)$，代价是每结点多一个指针。
- **循环链表与静态链表只是变体**：前者把终止条件从 `p == NULL` 改成 `p == L`，后者用游标代替指针，二者都不改变"链表不能随机存取"这一点。

#### 顺序表与链表的对比与选型

顺序表把"位置"算出来，链表把"位置"存起来。前者擅长按下标取数，后者擅长就地增删。把两条路线按最关心的维度横向拉开，再叠加上"空间要求"这一条，得到下面这张完整对比表：

| 对比维度 | 静态顺序表 | 动态顺序表 | 带头结点单链表 | 不带头结点单链表 |
| :--- | :---: | :---: | :---: | :---: |
| **随机访问** | $O(1)$ | $O(1)$ | $O(n)$ | $O(n)$ |
| **插入／删除移动** | $O(n)$ 移动 | $O(n)$ 移动 | $O(1)$ 改链 | $O(1)$ 改链 |
| **插入／删除查找** | — | — | $O(n)$ 查找位置 | $O(n)$ 查找位置 |
| **存储密度** | 最高 | 高 | 较低 | 较低 |
| **空间要求** | 需大片连续空间 | 需大片连续空间 | 无需连续空间 | 无需连续空间 |
| **容量管理** | 固定 | 动态翻倍 | 动态 | 动态 |
| **空表判定** | `length == 0` | `length == 0` | `L->next == NULL` | `L == NULL` |
| **首元素操作** | 统一 | 统一 | 统一 | 需特殊处理 |
| **内存释放** | 单层 | 双层 | 逐结点 | 逐结点 |

这张表里有一处特别容易被忽略：链表的"$O(1)$ 改链"**成立的前提是已经拿到了要插入位置的前驱**。如果没有现成的结点指针，先花 $O(n)$ 找到位置，整个过程依然是 $O(n)$——所以准确的说法是"链表的增量操作是 $O(1)$，定位操作是 $O(n)$"。

> **选型建议**：
>
> - 数据量固定，且频繁按位置读取 → **静态顺序表**；
> - 数据量不定，且需要随机访问 → **动态顺序表**；
> - 频繁增删，且不需要随机访问 → **带头结点单链表**（统一处理边界，代码更简洁）；
> - 对空间极度敏感，且操作集中在尾部 → **不带头结点单链表**。
