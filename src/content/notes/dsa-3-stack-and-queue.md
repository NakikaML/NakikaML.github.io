---
title: 数据结构与算法-3 栈和队列
description: 栈与队列用 LIFO 与 FIFO 两种秩序换来 O(1) 操作，从顺序栈、循环队列一路讲到单调栈与单调队列。
category: 计算机科学
subject: 计算机科学
subfield: 数据结构与算法
topic: 栈和队列
difficulty: 基础
date: "2026-09-28"
tags: [数据结构与算法, 栈, 队列, 循环队列, 单调栈, 单调队列, 卡特兰数, 表达式求值]
draft: false
featured: false
---

## 栈

栈与队列是同一副骨架上的两种**操作受限的线性表**：**栈**限制只有一端能进出，于是得到**后进先出**；**队列**限制一端进、另一端出，于是得到**先进先出**。两种秩序看起来简单，却撑起了表达式求值、递归与函数调用、图的广度优先遍历、任务调度等一大批算法；而在这两种结构上再加一条"维护单调性"的规则，就得到能解决"下一个更大元素""滑动窗口最值"的单调栈与单调队列。

本章的路线是：先讲清两种结构的抽象模型与基本操作，再逐个实现它们的四种存储形态（顺序栈、链栈、循环队列、链队列）以及共享栈、双端队列两个变体，最后落到应用——栈用在括号匹配、表达式求值与递归上，队列用在层次遍历与缓冲调度上，单调栈与单调队列则作为"只加一条规则就能把复杂度降到 $O(n)$"的范例收尾。

### 栈的概念与基本操作

#### 栈的基本概念

**栈**（Stack）：只允许在**一端**进行插入或删除操作的线性表。其中：

**栈顶**（top）：允许插入和删除的一端。

**栈底**（bottom）：不允许插入和删除的一端。

**空栈**：不含任何元素的栈。

因为插入与删除都发生在同一端，元素离开的次序必然是进入次序的逆序——这就是栈的核心特征：**后进先出**（Last In First Out, LIFO）。

![栈的结构](/notes-assets/dsa3-01-stack.jpg)

> **为什么"限制"反而有价值**：栈是"操作受限"的典型代表。限制带来两个结果：所有基本操作都在 $O(1)$ 内完成；操作顺序完全可预测，程序只需记住"最近一次压入的是什么"。括号嵌套、表达式求值的优先级、函数调用的返回地址，恰好都是"最近的先处理"，因此都能用栈表达。

#### 栈的基本操作

栈的操作沿用了线性表的"创、销、增、删、查、判"体系，只是**没有"改"**——栈顶是唯一入口，不允许修改中间元素：

| 操作 | 函数原型 | 说明 | 时间复杂度 |
| :--- | :--- | :--- | :--- |
| **初始化** | `InitStack(&S)` | 构造一个空栈 S，分配内存空间 | $O(1)$ |
| **销毁** | `DestroyStack(&S)` | 销毁并释放栈 S 所占用的内存空间 | $O(1)$ / $O(n)$ |
| **进栈** | `Push(&S, x)` | 若栈未满，将 x 加入，使之成为新栈顶 | $O(1)$ |
| **出栈** | `Pop(&S, &x)` | 若栈未空，弹出栈顶元素，并用 x 返回 | $O(1)$ |
| **读栈顶** | `GetTop(S, &x)` | 若栈未空，用 x 返回栈顶元素（不弹出） | $O(1)$ |
| **判空** | `StackEmpty(S)` | 栈为空返回 true，否则返回 false | $O(1)$ |

> **记忆口诀：创销增删查判**——`InitStack`（创）、`DestroyStack`（销）、`Push`（增）、`Pop`（删）、`GetTop`（查）、`StackEmpty`（判）。

#### 卡特兰数

$n$ 个**互不相同**的元素依次进栈，出栈元素不同排列的个数为

$$
\frac{1}{n+1} \mathrm{C}_{2n}^{n}
$$

这个公式称为**卡特兰数**（Catalan number）。它不是"有多少种排列"的答案（那是 $n!$），而是"其中有多少种排列能真正由栈产生"的答案。

> **例 1（卡特兰数）**：5 个不同元素进栈，出栈元素的不同排列共有多少种？

**思路**：直接套用卡特兰数公式，其中 $n = 5$。

**解**：

$$
\frac{1}{5+1} \mathrm{C}_{10}^{5} = \frac{1}{6} \times 252 = 42
$$

**评注**：卡特兰数不只为栈的出栈序列计数服务，它还出现在二叉搜索树的不同形态数、$n$ 对括号的合法匹配方案数、凸多边形三角剖分的方案数中。若 $n$ 很小，也可以用"逐个模拟 + 计数"来验证结论。

> **易错点**：出栈序列的个数**不是** $n!$。$n$ 个元素的任意全排列中，只有卡特兰数个排列是合法的；例如 3 个元素只有 $\frac{1}{4}\mathrm{C}_6^3 = 5$ 种合法出栈序列，而不是 $3! = 6$ 种。

### 顺序栈

顺序栈用一段连续内存（数组）存放元素，再用一个 `top` 指针标记栈顶。它的关键在于 `top` 的**语义约定**：约定不同，判空、判满、元素个数的公式就整体平移一位。

#### 顺序栈的定义

```c
const int MaxSize = 10;  // 定义栈中元素的最大个数
typedef struct {
    ElemType data[MaxSize];  // 静态数组存放栈中元素
    int top;                 // 栈顶指针
} SqStack;
```

`top` 有两种约定，它们决定了判空、判满与元素个数的表达方式：

| 约定 | 空栈 | 栈满 | 元素个数 |
| :--- | :--- | :--- | :--- |
| `top = -1` | `top == -1` | `top == MaxSize-1` | `top + 1` |
| `top = 0` | `top == 0` | `top == MaxSize` | `top` |

第一种约定（`top = -1` 表示空栈，`top` 永远指向真正的栈顶元素）最常用，本章后续代码都采用它。

#### 进栈与出栈

```c
void InitStack(SqStack &S) {
    S.top = -1;  // 初始化栈顶指针
}

bool StackEmpty(SqStack &S) {
    return S.top == -1;  // 栈顶指针为 -1 时栈空
}

bool Push(SqStack &S, ElemType x) {
    if (S.top == MaxSize - 1) return false;  // 栈满，报错
    S.top++;                // 指针先加 1
    S.data[S.top] = x;      // 新元素再入栈
    return true;
}

bool Pop(SqStack &S, ElemType &x) {
    if (S.top == -1) return false;  // 栈空，报错
    x = S.data[S.top];  // 栈顶元素先出栈
    S.top--;            // 栈顶指针再减 1
    return true;
}

bool GetTop(SqStack S, ElemType &x) {
    if (S.top == -1) return false;  // 栈空，报错
    x = S.data[S.top];  // x 记录栈顶元素，指针不动
    return true;
}
```

![顺序栈的进栈操作](/notes-assets/dsa3-02-stack-push.jpg)

进栈与出栈的次序是**对称**的：进栈是"**先动指针，后放数据**"，出栈是"**先取数据，后动指针**"。被弹出的元素并没有被真正清除，只是被逻辑上排除在栈外——下一次进栈会覆盖它。`GetTop` 与 `Pop` 的唯一区别就在**指针是否移动**：读栈顶不改变栈。

> **例 2（进栈过程演示）**：容量为 4 的顺序栈（约定 `top = -1`），依次执行 `Push(5)`、`Push(3)`、`Push(8)`，写出每一步的 `top` 值与栈中元素。

**思路**：`Push` 固定两步：先 `top++`，再写入 `data[top]`；每一步都要先检查栈满（`top == MaxSize-1`）。

**解**：

| 操作 | 执行后 top | 栈内容（栈底→栈顶） |
| :--- | :--- | :--- |
| 初始 | -1 | （空） |
| `Push(5)` | 0 | 5 |
| `Push(3)` | 1 | 5, 3 |
| `Push(8)` | 2 | 5, 3, 8 |

**评注**：注意与"先放数据、后动指针"的 `top = 0` 约定区分——不同约定下判空、判满、元素个数的公式全部平移一位，实现时必须自洽。本例约定下元素个数为 `top + 1`。

> **易错点**：顺序栈的 `MaxSize` 在编译期确定。若入栈前不检查栈满，会写越数组边界，属于未定义行为。需要不确定容量时，应改用动态扩容的顺序栈或链栈。

#### 共享栈

两个栈可以共享同一片数组空间，让两个栈底分别位于数组两端，栈顶相向而行、向中间生长：

```c
typedef struct {
    ElemType data[MaxSize];  // 静态数组存放栈中元素
    int top0, top1;          // 0 号栈、1 号栈的栈顶指针
} ShStack;
```

![共享栈](/notes-assets/dsa3-03-shared-stack.jpg)

- 0 号栈从下标 0 开始向右生长，初始 `top0 = -1`；
- 1 号栈从下标 `MaxSize-1` 开始向左生长，初始 `top1 = MaxSize`；
- **栈满条件：`top1 + 1 == top0`**，即两个栈顶相邻、中间再无空位。

> **易错点**：共享栈的"满"不是"某个栈满了"，而是**两个栈顶碰到一起**。相比两个独立数组，共享栈的空间利用率更高——一个栈空闲时，另一个可以使用更多空间。

### 链栈

#### 链栈的定义

**链栈**就是用链式存储实现的栈。因为栈只在栈顶一端操作，链栈**不需要头结点**，栈顶指针直接指向栈顶元素：

```c
typedef struct LinkNode {
    ElemType data;               // 数据域
    struct LinkNode *next;       // 指针域
} LinkNode, *LiStack;            // 栈类型定义
```

![链栈](/notes-assets/dsa3-04-linked-stack.jpg)

#### 进栈与出栈

把**链表头作为栈顶**是唯一合理的选择：

- 进栈相当于在链表头部做后插操作，即**头插法**，$O(1)$；
- 出栈相当于在链表头部做后删操作，即**头删法**，$O(1)$。

> **为什么不把链尾当栈顶**：若把链表尾作为栈顶，出栈时必须从头遍历找到它的前驱，单次操作退化为 $O(n)$。栈的链式实现之所以"天然高效"，正是因为它把操作端固定在了指针直达的那一端。

#### 顺序栈与链栈对比

| 对比维度 | 顺序栈 | 链栈 |
| :--- | :--- | :--- |
| **存储方式** | 连续数组 | 离散结点 + 指针 |
| **栈满判定** | `top == MaxSize-1` | 仅受系统内存限制 |
| **空间利用率** | 高（无指针开销） | 较低（每结点多存一个指针） |
| **扩容** | 静态不可扩 / 动态需拷贝 | 天然动态 |
| **入栈 / 出栈** | $O(1)$ | $O(1)$ |
| **内存碎片** | 无 | 有 |

> **选型口径**：容量固定、追求存储密度与随机访问，用顺序栈；容量不确定、需要动态增长，用链栈。

### 顺序栈的进阶操作

真实工程里的栈操作远不止进栈与出栈。这一节给出两类实用操作的完整实现：先看顺序栈，再看链栈。三类操作反复出现——**复制**（LIFO 天然反转顺序，复制要走两趟）、**反转**（双指针原地交换或借助辅助栈）、**过滤**（用辅助栈把符合条件的元素挑出来）。

以下代码沿用第 2 章的工程约定：`Status` 是返回状态类型（`OK` / `ERROR`），`ElementType` 是元素类型，`MAXSIZE` 是容量常量，`SeqStack` 是带 `top` 成员的顺序栈结构体。

#### 顺序栈的完整操作

```c
SeqStack* InitStack(void) {
    SeqStack* s = (SeqStack*)malloc(sizeof(SeqStack));
    s->top = -1;
    return s;
}

int IsEmpty(const SeqStack* S) {
    if (S == NULL) return 1;
    return (S->top == -1);
}

int IsFull(const SeqStack* S) {
    if (S == NULL) return 0;
    return (S->top >= MAXSIZE - 1);
}

int GetSize(const SeqStack* S) {
    if (S == NULL || S->top == -1) return 0;
    return S->top + 1;
}

void Clear(SeqStack* S) {
    if (S == NULL) return;
    S->top = -1;
}

void DestroyStack(SeqStack** pS) {
    if (pS == NULL || *pS == NULL) return;
    free(*pS);
    *pS = NULL;  // 置空防野指针，支持重复销毁
}

void PrintStack(const SeqStack* S) {   // 按栈底→栈顶打印
    if (S == NULL || S->top == -1) { puts("NULL"); return; }
    for (int i = 0; i <= S->top; i++) {
        if (i != 0) printf(" ");
        printf("%d", S->data[i]);
    }
    puts("");
}
```

#### 复制栈

**复制栈**最直接的做法是按下标搬运：

```c
Status CopyStack(const SeqStack* S, SeqStack* T) {
    if (S == NULL || T == NULL) return ERROR;
    Clear(T);
    for (int i = 0; i <= S->top; i++)
        Push(T, S->data[i]);
    return OK;
}
```

#### 原地反转

**原地反转**用与顺序表逆置完全相同的双指针技巧：`i` 从头、`j` 从尾向中间靠拢，交换二者，直到相遇。时间复杂度 $O(n)$，空间复杂度 $O(1)$（只需一个临时变量）。

```c
Status ReverseStack(SeqStack* S) {
    if (S == NULL) return ERROR;
    for (int i = 0, j = S->top; i < j; i++, j--) {
        int temp = S->data[i];
        S->data[i] = S->data[j];
        S->data[j] = temp;
    }
    return OK;
}

Status ReverseTop(SeqStack* S, int k) {   // 只反转栈顶 k 个元素
    if (S == NULL) return ERROR;
    if (k < 0 || k > S->top + 1) return ERROR;
    if (k == 0 || k == 1) return OK;
    for (int i = S->top - k + 1, j = S->top; i < j; i++, j--) {
        int temp = S->data[i];
        S->data[i] = S->data[j];
        S->data[j] = temp;
    }
    return OK;
}
```

> **两种反转思路的取舍**：**双指针法**直接交换元素、原地反转，$O(1)$ 额外空间；**辅助栈法**逐个弹出再压入另一栈、最后倒回，$O(n)$ 额外空间。对顺序存储的栈，双指针法总是更优；只有在链式存储、指针不便修改时才需要借助辅助结构。

#### 获取最小值

**获取最小值**若直接扫描全栈需要 $O(n)$：

```c
Status GetMin(const SeqStack* S, ElementType* min) {
    if (S == NULL || min == NULL) return ERROR;
    if (S->top == -1) return ERROR;
    *min = S->data[0];
    for (int i = 0; i <= S->top; i++)
        if (*min > S->data[i]) *min = S->data[i];
    return OK;
}
```

要做到 $O(1)$ 查询最小值，可以维护一个**辅助栈**同步记录当前最小值：每次 `Push(x)` 时同时把 $\min(x, \text{辅助栈栈顶})$ 压入辅助栈，`Pop` 时同步弹出。这样任意时刻辅助栈栈顶就是栈内最小值——用 $O(n)$ 的空间换来了 $O(1)$ 的查询。

#### 判断对称

**判断栈内元素是否对称**（即从栈底读到栈顶是否为回文）只需双指针向中间比对：

```c
Status IsSymmetric(const SeqStack* S) {
    if (S == NULL) return ERROR;
    if (S->top == -1 || S->top == 0) return OK;  // 空栈或单元素是对称的
    for (int i = 0, j = S->top; i < j; i++, j--)
        if (S->data[i] != S->data[j]) return ERROR;
    return OK;
}
```

#### 删除指定值

**删除栈中所有指定值**的经典做法是"两次转移"：第一次把保留的元素转移到辅助栈（顺序被反转），第二次再转移回来（顺序被恢复）。两次转移等于"一次过滤 + 一次还原"。

```c
Status DeleteElem(SeqStack* S, ElementType e) {
    if (S == NULL) return ERROR;
    SeqStack* tempS = InitStack();
    int out;
    int top = S->top;
    for (int i = 0; i <= top; i++) {
        Pop(S, &out);
        if (out != e) Push(tempS, out);  // 不等于目标值才保留
    }
    top = tempS->top;
    for (int i = 0; i <= top; i++) {     // 倒回 S，恢复原顺序
        Pop(tempS, &out);
        Push(S, out);
    }
    return OK;
}
```

#### 合并与去重

**合并两个栈**与**去重**同样借助辅助栈完成：

```c
Status MergeStack(const SeqStack* S1, const SeqStack* S2, SeqStack* S3) {
    if (S1 == NULL || S2 == NULL || S3 == NULL) return ERROR;
    if (S1->top + S2->top + 2 > MAXSIZE) return ERROR;  // 元素总数 (top+1)+(top+1)
    Clear(S3);
    for (int i = 0; i <= S1->top; i++) Push(S3, S1->data[i]);
    for (int i = 0; i <= S2->top; i++) Push(S3, S2->data[i]);
    return OK;
}

Status RemoveDuplicate(SeqStack* S) {   // 去重，保留首次出现
    if (S == NULL) return ERROR;
    SeqStack* tempS = InitStack();
    int top = S->top;
    for (int i = 0; i <= top; i++) {
        bool repeated = false;
        for (int j = 0; j <= tempS->top; j++)   // 在辅助栈中查找是否已出现过
            if (tempS->data[j] == S->data[i]) {
                repeated = true;
                break;
            }
        if (!repeated) Push(tempS, S->data[i]);
    }
    for (int i = 0; i <= tempS->top; i++)       // 把去重结果复制回 S
        S->data[i] = tempS->data[i];
    S->top = tempS->top;
    return OK;
}
```

去重的时间复杂度是 $O(n^2)$、空间复杂度 $O(n)$——元素无序，只能对每个元素逐一检查它是否已经出现过。

#### 出栈序列合法性验证

判断一个出栈序列是否可能由给定的入栈序列产生，最可靠的方法是**模拟**：依次把入栈序列的元素压栈，**每当栈顶等于下一个期望出栈的元素就立即弹出**（能弹就弹），处理完所有元素后若栈为空则序列合法。

```c
Status IsValidPopSeq(const int* push, const int* pop, int n) {
    if (push == NULL || pop == NULL) return ERROR;
    if (n <= 0) return ERROR;
    SeqStack* S = InitStack();
    int pushIdx = 0, popIdx = 0, out;
    for (int i = 0; i < n; i++) {
        Push(S, push[pushIdx++]);
        while (S->top != -1 && S->data[S->top] == pop[popIdx]) {
            Pop(S, &out);
            popIdx++;
        }
    }
    if (IsEmpty(S)) return OK;   // 全部元素都成功出栈 → 序列合法
    return ERROR;
}
```

> **例 3（出栈序列模拟验证）**：入栈序列为 $1, 2, 3, 4, 5$，判断出栈序列 $3, 2, 5, 4, 1$ 是否合法。

**思路**：用模拟法——依次入栈，每当栈顶等于下一个期望出栈元素就立即弹出，直到不再相等；全部处理完后栈为空则合法。

**解**：

| 步骤 | 入栈 | 栈内（底→顶） | 已出栈 |
| :--- | :--- | :--- | :--- |
| 1 | 1 | 1 | — |
| 2 | 2 | 1, 2 | — |
| 3 | 3 | 1, 2, 3 | — |
| 4 | — | 1, 2 | 3（栈顶 = 期望 3，弹出） |
| 5 | — | 1 | 3, 2（栈顶 = 期望 2，弹出） |
| 6 | 4 | 1, 4 | 3, 2 |
| 7 | 5 | 1, 4, 5 | 3, 2 |
| 8 | — | 1, 4 | 3, 2, 5（栈顶 = 期望 5，弹出） |
| 9 | — | 1 | 3, 2, 5, 4（栈顶 = 期望 4，弹出） |
| 10 | — | 空 | 3, 2, 5, 4, 1（弹出） |

全部元素成功出栈，序列**合法**。

**评注**：模拟法的要点是"**能弹就弹**"——每次入栈后把栈顶所有能匹配的元素一次性弹出。若最终栈非空，说明存在元素无法按期望顺序出栈，序列非法。这个方法也可以手算，比套公式更直观，而且适用于任意规模的输入。


### 链栈的进阶操作

#### 链栈的完整操作

链栈维护一个 `size` 成员，让求长度从 $O(n)$ 降为 $O(1)$，代价是结构体多占一个整型字段——又一次"空间换时间"。

```c
typedef struct StackNode {
    ElementType data;
    struct StackNode* next;
} StackNode;

typedef struct {
    StackNode* top;   // 栈顶指针
    int size;         // 当前元素个数（O(1) 查询）
} LinkStack;

LinkStack* InitStack(void) {
    LinkStack* L = (LinkStack*)malloc(sizeof(LinkStack));
    L->top = NULL;
    L->size = 0;
    return L;
}

int IsEmpty(const LinkStack* S) {
    if (S == NULL) return 1;
    return (S->top == NULL);
}

int GetSize(const LinkStack* S) {
    if (S == NULL || S->top == NULL) return 0;
    return S->size;
}

Status Push(LinkStack* S, ElementType x) {
    if (S == NULL) return ERROR;
    StackNode* newNode = (StackNode*)malloc(sizeof(StackNode));
    if (newNode == NULL) return ERROR;
    newNode->data = x;
    newNode->next = S->top;    // 头插法
    S->top = newNode;
    S->size++;
    return OK;
}

Status Pop(LinkStack* S, ElementType* x) {
    if (S == NULL || S->top == NULL) return ERROR;
    if (x == NULL) return ERROR;
    *x = S->top->data;
    StackNode* temp = S->top;
    S->top = temp->next;       // 头删法
    free(temp);
    S->size--;
    return OK;
}

void Clear(LinkStack* S) {
    if (S == NULL) return;
    StackNode* p = S->top;
    while (p != NULL) {
        StackNode* temp = p;
        p = p->next;
        free(temp);
    }
    S->top = NULL;
    S->size = 0;
}

void DestroyStack(LinkStack** pS) {
    if (pS == NULL || *pS == NULL) return;
    StackNode* p = (*pS)->top;
    while (p != NULL) {
        StackNode* temp = p;
        p = p->next;
        free(temp);
    }
    free(*pS);
    *pS = NULL;  // 置空防野指针
}
```

#### 链栈的复制与反转

链栈**不能**按下标直接复制或就地交换元素，必须借助结构的 LIFO 特性：

```c
Status CopyStack(const LinkStack* S, LinkStack* T) {
    if (S == NULL || T == NULL) return ERROR;
    Clear(T);
    StackNode* p = S->top;
    LinkStack* tempS = InitStack();
    while (p != NULL) { Push(tempS, p->data); p = p->next; }  // 第一趟：S → tempS（反转）
    p = tempS->top;
    while (p != NULL) { Push(T, p->data); p = p->next; }      // 第二趟：tempS → T（恢复原序）
    return OK;
}

Status ReverseStack(LinkStack* S) {
    if (S == NULL) return ERROR;
    if (S->size <= 1) return OK;
    LinkStack* tempS = InitStack();
    ElementType out;
    int n = S->size;
    for (int i = 0; i < n; i++) { Pop(S, &out); Push(tempS, out); }
    S->top = tempS->top;   // 直接转移指针，避免逐元素复制
    S->size = tempS->size;
    free(tempS);
    return OK;
}
```

> **为什么复制要走两趟**：栈的 LIFO 特性决定了"单次转移必然反转顺序"。要保留原顺序，只能反转两次——这是"栈不可随机访问"的直接后果，与顺序栈按下标复制形成鲜明对比。

#### 链栈的双指针与辅助结构

```c
Status GetMin(const LinkStack* S, ElementType* min) {
    if (S == NULL || S->top == NULL) return ERROR;
    if (min == NULL) return ERROR;
    StackNode* p = S->top;
    *min = p->data;
    while (p != NULL) {
        if (*min > p->data) *min = p->data;
        p = p->next;
    }
    return OK;
}

Status IsSymmetric(const LinkStack* S) {   // 前半部分入辅助栈，再与后半部分比对
    if (S == NULL) return ERROR;
    if (S->top == NULL || S->size == 1) return OK;
    LinkStack* tempS = InitStack();
    StackNode* p1 = S->top;
    int cnt = 1;
    while (cnt < (S->size) / 2 + 1) {      // 压入前半部分
        Push(tempS, p1->data);
        p1 = p1->next;
        cnt++;
    }
    if (S->size % 2 == 1) p1 = p1->next;   // 奇数个元素时跳过中间元素
    StackNode* p2 = tempS->top;            // 辅助栈顶是前半部分的反序
    while (p1 != NULL && p2 != NULL) {
        if (p1->data != p2->data) return ERROR;
        p1 = p1->next;
        p2 = p2->next;
    }
    return OK;
}
```

**删除所有指定值**在链式结构上可以用 `prev` / `curr` 双指针一趟完成，不必借助辅助栈：

```c
Status DeleteElem(LinkStack* S, ElementType e) {
    if (S == NULL) return ERROR;
    int delNum = 0;
    StackNode *p = S->top, *pre = NULL;
    while (p != NULL && p->data == e) {   // 先处理栈顶连续等于 e 的情况
        StackNode* temp = p;
        p = p->next;
        free(temp);
        delNum++;
    }
    S->top = p;
    while (p != NULL) {                   // 再处理其余结点
        if (p->data == e) {
            StackNode* temp = p;
            pre->next = p->next;
            p = p->next;
            delNum++;
        } else {
            pre = p;
            p = p->next;
        }
    }
    S->size -= delNum;
    return OK;
}
```

合并两个栈与去重的思路与顺序栈版本一致，都借助辅助栈过滤，这里不再重复。

#### 链栈的数组辅助法

链栈中直接改写结点指针来"局部反转"需要遍历链表；若只反转栈顶 $k$ 个元素，用数组中转更简洁：**弹出 $k$ 个 → 存进数组 → 按原序压回**。因为压回时数组第一个元素最先入栈，最终它会落在栈顶之下，顺序自然被反转。

```c
Status ReverseTop(LinkStack* S, int k) {
    if (S == NULL) return ERROR;
    if (k < 0 || k > S->size) return ERROR;
    if (k == 0 || k == 1) return OK;
    ElementType* arr = (ElementType*)malloc(k * sizeof(ElementType));
    if (arr == NULL) return ERROR;
    for (int i = 0; i < k; i++) Pop(S, &arr[i]);   // 弹出 k 个元素存入数组
    for (int i = 0; i < k; i++) Push(S, arr[i]);   // 按数组原序压回
    free(arr);
    return OK;
}

Status InterleaveStack(const LinkStack* S1, const LinkStack* S2, LinkStack* S3) {
    if (S1 == NULL || S2 == NULL || S3 == NULL) return ERROR;
    Clear(S3);
    StackNode* p1 = S1->top;
    StackNode* p2 = S2->top;
    while (p1 != NULL || p2 != NULL) {   // 两个栈交替出栈，直到都为空
        if (p1 != NULL) { Push(S3, p1->data); p1 = p1->next; }
        if (p2 != NULL) { Push(S3, p2->data); p2 = p2->next; }
    }
    return OK;
}

Status GetRangeSum(const LinkStack* S, int low, int high, int* sum) {
    if (S == NULL || sum == NULL) return ERROR;
    if (low < 1 || high < low || high > S->size) return ERROR;
    StackNode* p = S->top;
    int cnt = S->size;   // 从栈顶（位置 size）向栈底（位置 1）计数
    *sum = 0;
    while (p != NULL) {
        if (cnt >= low && cnt <= high) *sum += p->data;
        cnt--;
        p = p->next;
    }
    return OK;
}
```

例如 S1 = 1, 2, 3（栈顶→栈底）、S2 = 4, 5, 6，交替插入后 S3 = 1, 4, 2, 5, 3, 6。

## 队列

### 队列的概念与基本操作

#### 队列的基础概念

**队列**（Queue）：只允许在**一端**进行插入、在**另一端**进行删除的线性表。其中：

**队头**（front）：允许删除的一端。

**队尾**（rear）：允许插入的一端。

**空队列**：不含任何元素的队列。

队列的核心特征是**先进先出**（First In First Out, FIFO）——像排队买票，先到先服务。

![队列的结构](/notes-assets/dsa3-05-queue.jpg)

> **对偶结构**：栈限制一端、队列限制两端，两者是"操作受限线性表"的一对。这一对偶性使得许多为栈写的算法稍作修改就能用于队列，反之亦然——用栈与队列同时处理一列字符可以判回文，用两个队列可以模拟栈。

#### 队列的基本操作

| 操作 | 函数原型 | 说明 |
| :--- | :--- | :--- |
| **初始化** | `InitQueue(&Q)` | 构造一个空队列 Q，分配内存空间 |
| **销毁** | `DestroyQueue(&Q)` | 销毁并释放队列 Q 所占用的内存空间 |
| **入队** | `EnQueue(&Q, x)` | 若队列未满，将 x 加入，使之成为新的队尾 |
| **出队** | `DeQueue(&Q, &x)` | 若队列非空，删除队头元素，并用 x 返回 |
| **读队头** | `GetHead(Q, &x)` | 若队列非空，将队头元素赋值给 x |

#### 栈与队列的对比

| 对比维度 | 栈 | 队列 |
| :--- | :--- | :--- |
| **数据特征** | LIFO（后进先出） | FIFO（先进先出） |
| **操作位置** | 只在一端（栈顶）插入删除 | 一端插入（队尾）、一端删除（队头） |
| **基本操作** | Push / Pop / GetTop | EnQueue / DeQueue / GetHead |
| **典型应用** | 括号匹配、表达式求值、递归 | 广度优先遍历、层次遍历、先来先服务调度 |

两者都是**线性表**——元素之间呈一对一的线性关系，只是**操作受限**：栈限一端、队列限两端，都不允许从中间操作。

### 顺序队列

顺序队列用数组存放元素，并设 `front` 指向队头、`rear` 指向队尾的**下一个空位**：

```c
const int MaxSize = 10;
typedef struct {
    ElemType data[MaxSize];  // 用静态数组存放队列元素
    int front, rear;         // 队头指针和队尾指针
} SqQueue;

void InitQueue(SqQueue &Q) {
    Q.rear = Q.front = 0;    // 初始时两个指针都指向 0
}
```

![顺序队列的实现](/notes-assets/dsa3-06-sequential-queue.jpg)

入队就是在 `rear` 处写入元素再后移 `rear`，出队就是取出 `front` 处的元素再后移 `front`。先看这种"指针只加 1、不取模"的朴素写法——它正是下面要讨论的问题的源头：

```c
bool EnQueue(SqQueue &Q, ElemType x) {
    if (Q.rear == MaxSize) return false;  // rear 走到数组末端，就认为"队满"
    Q.data[Q.rear] = x;                   // 新元素插入队尾
    Q.rear++;                             // 队尾指针后移一位
    return true;
}

bool DeQueue(SqQueue &Q, ElemType &x) {
    if (Q.rear == Q.front) return false;  // front == rear 时队空
    x = Q.data[Q.front];
    Q.front++;
    return true;
}
```

#### 假溢出

如果 `rear` 只是简单地 `rear++` 而不取模，就会遇到顺序队列的经典陷阱：**当 `rear` 走到数组末端而 `front` 已经前移时，队列实际还有空位却无法再入队**。这就是**假溢出**。

> **例 4（假溢出演示）**：用长度 `MaxSize = 5` 的线性数组实现顺序队列，依次入队 $1, 2, 3, 4$，再出队 2 次。此时数组里还有空位吗？还能继续入队吗？

**思路**：跟踪 `front` 与 `rear` 的数值变化即可。判据是"指针有没有走到数组末端"，而不是"队列里还剩几个元素"。

**解**：

- 入队 $1,2,3,4$：占用 `data[0..3]`，此时 $front = 0$、$rear = 4$。
- 出队 2 次：$front = 2$、$rear = 4$，队内只剩 $3,4$ 两个元素。
- 此时 `data[0]`、`data[1]` 明明空着，但在不取模的线性数组里 `rear` 只能继续后移：再入队 5，$rear = 5$ 就越过了数组末端。在"牺牲一个单元"的判满约定下更早出问题——$rear = 4$ 时已经判满，连入队 5 都会被拒绝，而队列里只有 2 个元素。

假溢出的本质是"**物理末端 ≠ 逻辑末端**"。解决方案不是重置指针（那会破坏 FIFO 的语义），而是让下标**取模**：$rear = (rear + 1) \% MaxSize$，把数组首尾相接，物理末端绕回逻辑起点，被"浪费"的空位就重新可用。

### 循环队列

循环队列并不改变存储方式，只是把 `front`、`rear` 的移动规则从 `++` 改成"加 1 后对 `MaxSize` 取模"：

```c
Q.data[Q.rear] = x;
Q.rear = (Q.rear + 1) % MaxSize;   // 队尾指针加 1 取模
```

![循环队列](/notes-assets/dsa3-07-circular-queue.jpg)

从数组看它是线性的，从指针的移动看它是一个环。代价随之而来：当队列绕了一圈后，`front == rear` 既可能是"队空"，也可能是"队满"，两种状态撞在了一起。

#### 判空与判满的三种方案

| 策略 | 队空条件 | 队满条件 | 空间利用率 | 实现复杂度 |
| :--- | :--- | :--- | :--- | :--- |
| **预留空间（牺牲一个单元）** | `front == rear` | `(rear+1) % MaxSize == front` | $\frac{n-1}{n}$ | 简单 |
| **size 变量** | `size == 0` | `size == MaxSize` | 100% | 简单 |
| **tag 变量** | `front==rear && tag==0` | `front==rear && tag==1` | 100% | 较复杂 |

三种方案的区别在于"用什么信息区分空与满"：

**预留空间**：永远空出一个数组单元不存数据，于是队满时 `rear` 恰好停在 `front` 前一个位置，`front == rear` 就只剩下"队空"一种含义。代价是损失一个存储单元。

**size 变量**：额外维护队列长度。逻辑最直白，`GetSize` 也能在 $O(1)$ 内直接返回。

**tag 变量**：记录最近一次操作是删除（`tag = 0`）还是插入（`tag = 1`）。当 `front == rear` 时，若上一次是删除则队空、是插入则队满。适用于内存极度受限、连一个 `size` 都不想多占的场合，代价是判据稍绕。

> **怎么选**：预留空间最直观，适合作为理解循环队列的起点；`size` 变量逻辑最清晰、最不容易写错，是工程实现的首选；`tag` 变量只在极端受限时使用。

#### 循环队列的入队、出队与元素个数

```c
bool EnQueue(SqQueue &Q, ElemType x) {
    if ((Q.rear + 1) % MaxSize == Q.front) return false;  // 队满，报错
    Q.data[Q.rear] = x;
    Q.rear = (Q.rear + 1) % MaxSize;
    return true;
}

bool DeQueue(SqQueue &Q, ElemType &x) {
    if (Q.rear == Q.front) return false;  // 队空，报错
    x = Q.data[Q.front];
    Q.front = (Q.front + 1) % MaxSize;
    return true;
}

bool GetHead(SqQueue Q, ElemType &x) {
    if (Q.rear == Q.front) return false;  // 队空，报错
    x = Q.data[Q.front];                  // 只读，不移动指针
    return true;
}

int GetSize(SqQueue Q) {
    return (Q.rear + MaxSize - Q.front) % MaxSize;  // 队列元素个数
}
```

队长公式 $(rear - front + MaxSize) \% MaxSize$ 统一了"未绕环"与"已绕环"两种情况：加 `MaxSize` 再取模保证了结果非负。例如 $front = 8$、$rear = 2$、$MaxSize = 10$ 时，队列里确实有 4 个元素，而 $(2 - 8 + 10) \% 10 = 4$。

### 链队列

**链队列**用链式存储实现队列。最常见的版本**带头结点**：`front` 指向头结点，`rear` 指向队尾结点。

#### 链队列的定义与初始化

```c
typedef struct LinkNode {   // 链队列结点
    ElemType data;
    struct LinkNode *next;
} LinkNode;

typedef struct {            // 链式队列
    LinkNode *front, *rear; // 队头指针和队尾指针
} LinkQueue;

void InitQueue(LinkQueue &Q) {
    Q.front = Q.rear = (LinkNode*)malloc(sizeof(LinkNode));  // 建立头结点
    Q.front->next = NULL;
}
```

![链队列](/notes-assets/dsa3-08-linked-queue.jpg)

空队时 `front` 与 `rear` 都指向头结点，即 `Q.front == Q.rear`。

#### 入队与出队

```c
void EnQueue(LinkQueue &Q, ElemType x) {
    LinkNode *s = (LinkNode*)malloc(sizeof(LinkNode));
    s->data = x;
    s->next = NULL;
    Q.rear->next = s;  // 新结点插入到 rear 之后
    Q.rear = s;        // 修改队尾指针
}

bool DeQueue(LinkQueue &Q, ElemType &x) {
    if (Q.front == Q.rear) return false;  // 空队
    LinkNode *p = Q.front->next;
    x = p->data;                 // 用 x 返回队头元素
    Q.front->next = p->next;     // 修改头结点的 next 指针
    if (Q.rear == p)             // 最后一个结点出队，需修改 rear 指针
        Q.rear = Q.front;
    free(p);
    return true;
}
```

![链队列的入队操作](/notes-assets/dsa3-09-linked-queue-enqueue.jpg)

![链队列的出队操作](/notes-assets/dsa3-10-linked-queue-dequeue.jpg)

> **易错点**：链队列有两个关键边界，缺一不可。
>
> 1. **空队入队**：`front` 与 `rear` 都指向头结点，新结点插入后必须同时更新 `rear`，否则队尾指针会与实际队尾脱节。
> 2. **最后一个元素出队**：删除后 `rear` 会悬空，必须显式执行 `Q.rear = Q.front`。
>
> 忘记第二个边界是链队列最常见的缺陷——删除最后一个结点后，`rear` 仍然指向已被 `free` 的结点，成为**悬空指针**。

#### 循环队列与链队列对比

| 对比维度 | 循环顺序队列 | 链队列 |
| :--- | :--- | :--- |
| **队空判定** | `front == rear` | `front == rear`（都指向头结点） |
| **队满** | 有容量上限（预留空间或 size） | 仅受内存限制 |
| **入队 / 出队** | $O(1)$ | $O(1)$ |
| **随机访问** | 不支持 | 不支持 |
| **内存利用率** | 高（无指针开销） | 有指针开销（每结点一个指针） |
| **实现注意** | 取模运算、判满策略 | 空队入队、最后一元素出队 |
| **拼接操作** | $O(n)$（需逐元素复制） | $O(1)$（直接修改指针） |

### 双端队列与操作受限的线性表

**双端队列**（Deque, Double-Ended Queue）：允许从**两端插入、两端删除**的线性表。它比栈和队列都"自由"，但仍不允许从中间操作。

![双端队列](/notes-assets/dsa3-11-deque.jpg)

进一步限制插入或删除中的一端，就得到两个变体：

| 名称 | 允许插入的位置 | 允许删除的位置 |
| :--- | :--- | :--- |
| **输入受限的双端队列** | 只允许一端插入 | 两端都可以删除 |
| **输出受限的双端队列** | 两端都可以插入 | 只允许一端删除 |

记忆方法是看"受限的是哪一侧"：**输入受限**意味着"入口只有一个"，插入被限制在一端；**输出受限**意味着"出口只有一个"，删除被限制在一端。

![操作受限的线性表](/notes-assets/dsa3-12-restricted-linear-list.jpg)

#### 输出序列的合法性

给定输入序列，判断某个输出序列能否由某种受限结构产生，通用方法是**模拟**：按输入次序把元素放进结构，按输出次序试着取出来，模拟得通即合法。栈的合法性验证算法 `IsValidPopSeq` 正是这一思想的实现。

> **例 5（输出序列合法性）**：数据输入序列为 $1, 2, 3, 4$，判断下列输出序列能否产生：① 栈：$1, 2, 3, 4$；② 栈：$2, 4, 1, 3$；③ 输入受限的双端队列：$1, 4, 2, 3$；④ 输出受限的双端队列：$1, 4, 2, 3$。

**思路**：按输入次序逐个把元素加入结构，观察能否按目标次序取出。栈必须满足"后进先出"；双端队列按受限制的方向模拟两端的进出。

**解**：

① **合法**：边入边出即可——入 1、出 1；入 2、出 2；入 3、出 3；入 4、出 4。

② **非法**：要最先出 2，必须先入 1、2 再弹出 2，此时栈内剩 1；接着要出 4，必须继续入 3、4 再弹出 4，此时栈内（底→顶）是 1、3；现在期望出 1，但 1 压在 3 之下，只有先弹出 3 才能碰到 1——与目标序列矛盾。

③ **合法**：输入受限的双端队列（只允许一端插入，两端都能删除）。入 1，从另一端取出 1；再入 2、3、4，从插入端取出 4；剩下 $2,3$，从另一端取出 2，再取出 3——得到 $1, 4, 2, 3$。

④ **合法**：输出受限的双端队列（两端都能插入，只允许一端删除）。入 1，从删除端取出 1；再依次从插入端入 2、3，从另一插入端入 4，使队列内自删除端到另一端的顺序为 $4, 2, 3$；依次取出 4、2、3——得到 $1, 4, 2, 3$。

**评注**：对栈而言还有一条更快的判据：**任意元素之后，比它小的元素必须按降序出现**。② 中 2 之后的 1 与 3 相比 2 都更小，但 1 出现在 3 之前，不满足降序，因此非法。规模较小时直接模拟往往比套判据更稳妥。

### 队列的进阶操作

队列的进阶操作围绕两个要点展开：对循环队列，"**绕环遍历**"是一切查询与批量操作的基础；对链队列，"**指针操作**"让它拥有顺序队列不具备的 $O(1)$ 拼接能力。

#### 顺序队列：绕环遍历与生命周期

循环队列不能用 `i < rear` 这样的线性条件遍历——必须用 `i != rear` 配合取模回到环上：

```c
for (int i = Q->front; i != Q->rear; i = (i + 1) % MAXSIZE)
```

完整的生命周期操作如下：

```c
SqQueue* InitQueue(void) {
    SqQueue* Q = (SqQueue*)malloc(sizeof(SqQueue));
    Q->front = 0;
    Q->rear = 0;
    return Q;
}

int IsEmpty(const SqQueue* Q) {
    if (Q == NULL) return 1;
    return (Q->front == Q->rear);
}

int IsFull(const SqQueue* Q) {
    if (Q == NULL) return 0;
    return ((Q->rear + 1) % MAXSIZE == Q->front);
}

int GetSize(const SqQueue* Q) {
    if (Q == NULL) return 0;
    return (Q->rear - Q->front + MAXSIZE) % MAXSIZE;
}

void Clear(SqQueue* Q) {
    if (Q == NULL) return;
    Q->front = 0;
    Q->rear = 0;
}

void DestroyQueue(SqQueue** pQ) {
    if (pQ == NULL || *pQ == NULL) return;
    free(*pQ);
    *pQ = NULL;
}
```

#### 查询与统计

四个查询函数共用同一个骨架——绕环遍历：

```c
int LocateInQueue(const SqQueue* Q, ElementType x) {
    if (Q == NULL || IsEmpty(Q)) return 0;
    int idx = 1;
    for (int i = Q->front; i != Q->rear; i = (i + 1) % MAXSIZE) {
        if (Q->data[i] == x) return idx;
        idx++;
    }
    return 0;  // 未找到
}

Status GetMaxInQueue(const SqQueue* Q, ElementType* maxVal) {
    if (Q == NULL || maxVal == NULL) return ERROR;
    if (IsEmpty(Q)) return ERROR;
    *maxVal = Q->data[Q->front];
    for (int i = Q->front; i != Q->rear; i = (i + 1) % MAXSIZE)
        if ((*maxVal) < Q->data[i]) *maxVal = Q->data[i];
    return OK;
}

int CountInQueue(const SqQueue* Q, ElementType x) {
    if (Q == NULL || IsEmpty(Q)) return 0;
    int cnt = 0;
    for (int i = Q->front; i != Q->rear; i = (i + 1) % MAXSIZE)
        if (Q->data[i] == x) cnt++;
    return cnt;
}

Status SumQueue(const SqQueue* Q, long long* sum) {
    if (Q == NULL || sum == NULL) return ERROR;
    *sum = 0;
    if (IsEmpty(Q)) return OK;
    for (int i = Q->front; i != Q->rear; i = (i + 1) % MAXSIZE)
        *sum += Q->data[i];
    return OK;
}
```

#### 复制与合并

```c
Status CopyQueue(const SqQueue* Q, SqQueue* T) {
    if (Q == NULL || T == NULL) return ERROR;
    Clear(T);
    for (int i = Q->front; i != Q->rear; i = (i + 1) % MAXSIZE)
        EnQueue(T, Q->data[i]);
    return OK;
}

Status MergeQueue(SqQueue* Q1, SqQueue* Q2, SqQueue* Q3) {
    if (Q1 == NULL || Q2 == NULL || Q3 == NULL) return ERROR;
    if (GetSize(Q1) + GetSize(Q2) > MAXSIZE - 1) return ERROR;  // 预留一个单元
    Clear(Q3);
    int out;
    while (!IsEmpty(Q1)) { DeQueue(Q1, &out); EnQueue(Q3, out); }
    while (!IsEmpty(Q2)) { DeQueue(Q2, &out); EnQueue(Q3, out); }
    return OK;
}
```

合并会把两个源队列清空——出队后重新入队，元素自然拼接在 Q3 的末尾。

#### 批量删除

"出队检查，非目标重新入队"是队列上唯一的"原地过滤"手法：绕队列转一圈，每个元素出队一次，符合条件的重新入队，不符合的直接丢弃。

```c
Status RemoveAllX(SqQueue* Q, ElementType x) {
    if (Q == NULL) return ERROR;
    int oriRear = Q->rear;  // 记录原始队尾位置，作为遍历终点
    for (int i = Q->front; i != oriRear; i = (i + 1) % MAXSIZE) {
        int out;
        DeQueue(Q, &out);
        if (out != x) EnQueue(Q, out);  // 不等于 x 才重新入队
    }
    return OK;
}
```

> **例 10（批量删除演示）**：循环队列中元素为 $1, 2, 3, 2, 4$（队头→队尾），删除所有值为 2 的元素。

**思路**：绕队列转一圈，每个元素出队一次——等于 2 的直接丢弃，不等于 2 的重新入队。**循环边界必须用原始的 `rear`**，否则边出队边入队会让 `rear` 移动，导致死循环。

**解**：

| 出队元素 | 处理 | 队列（队头→队尾） |
| :--- | :--- | :--- |
| 1 | 保留，重新入队 | 2, 3, 2, 4, 1 |
| 2 | 删除 | 3, 2, 4, 1 |
| 3 | 保留，重新入队 | 2, 4, 1, 3 |
| 2 | 删除 | 4, 1, 3 |
| 4 | 保留，重新入队 | 1, 3, 4 |

最终队列为 $1, 3, 4$，共删除 2 个元素。

**评注**：边界写成 `i != oriRear`（记录下来的原始队尾）而不是 `i != Q->rear`（随时在变的队尾），是这类批量操作不死循环的关键。同样的骨架可以扩展成"删除满足任意条件的元素"。

#### 反转队列

**反转队列**比反转栈麻烦：栈的 LIFO 天然反转顺序，而队列"出队再入队"只会保持原序。要反转，必须先转成可随机访问的结构：

```c
Status ReverseQueue(SqQueue* Q) {
    if (Q == NULL) return ERROR;
    int* arr = (int*)malloc(MAXSIZE * sizeof(int));
    int k = 0;
    while (!IsEmpty(Q)) DeQueue(Q, &arr[k++]);            // 全部出队存入数组
    for (int i = k - 1; i >= 0; i--) EnQueue(Q, arr[i]);  // 逆序重新入队
    free(arr);
    return OK;
}
```

#### 链队列：$O(1)$ 拼接

这一版链队列**不带头结点**（判空条件是 `front == NULL`），与第 8 节的带头结点版本形成对照；带不带头结点只是约定不同，核心的边界处理思想一致。

```c
typedef struct QNode {
    ElementType data;
    struct QNode* next;
} QNode;

typedef struct {
    QNode* front;  // 队头指针
    QNode* rear;   // 队尾指针
    int size;      // 当前元素个数（O(1) 查询）
} LinkQueue;

LinkQueue* InitQueue(void) {
    LinkQueue* Q = (LinkQueue*)malloc(sizeof(LinkQueue));
    Q->front = NULL;
    Q->rear = NULL;
    Q->size = 0;
    return Q;
}

int IsEmpty(const LinkQueue* Q) {
    if (Q == NULL) return 1;
    return (Q->front == NULL);
}

int GetSize(const LinkQueue* Q) {
    if (Q == NULL) return 0;
    return Q->size;  // O(1)
}

Status EnQueue(LinkQueue* Q, ElementType x) {
    if (Q == NULL) return ERROR;
    QNode* p = (QNode*)malloc(sizeof(QNode));
    if (p == NULL) return ERROR;
    p->data = x;
    p->next = NULL;
    if (Q->rear == NULL) {      // 空队：新结点同时成为队头和队尾
        Q->front = p;
        Q->rear = p;
    } else {
        Q->rear->next = p;      // 链到队尾
        Q->rear = p;            // 更新队尾指针
    }
    Q->size++;
    return OK;
}

Status DeQueue(LinkQueue* Q, ElementType* x) {
    if (Q == NULL || x == NULL) return ERROR;
    if (Q->front == NULL) return ERROR;
    QNode* p = Q->front;
    *x = p->data;
    Q->front = p->next;
    if (Q->front == NULL)       // 最后一个元素出队 → 队列变空
        Q->rear = NULL;         // 必须显式重置 rear
    Q->size--;
    free(p);
    return OK;
}

void Clear(LinkQueue* Q) {
    if (Q == NULL || Q->front == NULL) return;
    QNode* p = Q->front;
    while (p != NULL) {
        QNode* temp = p;
        p = p->next;
        free(temp);
    }
    Q->front = NULL;
    Q->rear = NULL;
    Q->size = 0;
}

void DestroyQueue(LinkQueue** pQ) {
    if (pQ == NULL || *pQ == NULL) return;
    QNode* p = (*pQ)->front;
    while (p != NULL) {
        QNode* temp = p;
        p = p->next;
        free(temp);
    }
    free(*pQ);
    *pQ = NULL;
}
```

> **两个对称的边界**：不带头结点的链队列同样有两个必须显式处理的时刻——**空队入队**时 `front` 与 `rear` 都要指向新结点；**最后一个元素出队**后必须令 `Q->rear = NULL`。漏掉任何一个都会留下悬空指针。

#### 拼接两个队列

**拼接两个队列**只需修改两处指针，这是链队列相对顺序队列最重要的优势：

```c
Status ConcatQueue(LinkQueue* Q1, LinkQueue* Q2) {
    if (Q1 == NULL || Q2 == NULL) return ERROR;
    if (Q1 == Q2) return ERROR;              // 不能自己拼接自己
    if (IsEmpty(Q1) && IsEmpty(Q2)) return OK;
    if (IsEmpty(Q1) && !IsEmpty(Q2)) {
        Q1->front = Q2->front;               // 直接转移指针
        Q1->rear = Q2->rear;
        Q1->size = Q2->size;
        Q2->front = NULL; Q2->rear = NULL; Q2->size = 0;
    } else if (!IsEmpty(Q1) && IsEmpty(Q2)) {
        return OK;                           // Q2 为空，无需操作
    } else {
        Q1->rear->next = Q2->front;          // Q1 队尾接上 Q2 队头
        Q1->rear = Q2->rear;
        Q1->size += Q2->size;
        Q2->front = NULL; Q2->rear = NULL; Q2->size = 0;
    }
    return OK;
}
```

在顺序队列上做同样的事需要把 Q2 的元素逐个搬进 Q1（$O(n)$）；链队列只要 `Q1->rear->next = Q2->front; Q1->rear = Q2->rear;` 两句赋值。

#### 拆分、去重与排序

**按位置拆分**与**去重、排序**：

```c
Status SplitQueue(LinkQueue* Q, int k, LinkQueue* Q1, LinkQueue* Q2) {
    if (Q == NULL || Q1 == NULL || Q2 == NULL) return ERROR;
    if (k < 0 || k > Q->size) return ERROR;
    if (!IsEmpty(Q1) || !IsEmpty(Q2)) return ERROR;  // 目标队列需为空
    int out;
    for (int cnt = 1; !IsEmpty(Q); cnt++) {
        DeQueue(Q, &out);
        if (cnt <= k) EnQueue(Q1, out);
        else          EnQueue(Q2, out);
    }
    return OK;
}

Status RemoveDuplicates(LinkQueue* Q) {   // 用数组记录已出现的值
    if (Q == NULL) return ERROR;
    int* tempArray = (int*)malloc(Q->size * sizeof(int));
    QNode *p = Q->front, *pre = NULL;
    int cnt = 0;
    while (p != NULL) {
        bool repeated = false;
        for (int i = 0; i < cnt; i++)
            if (tempArray[i] == p->data) { repeated = true; break; }
        if (repeated) {
            QNode* temp = p;
            p = p->next;
            pre->next = p;     // 跳过重复结点
            free(temp);
        } else {
            tempArray[cnt++] = p->data;
            pre = p;
            p = p->next;
        }
    }
    Q->size = cnt;
    return OK;
}

Status SortQueue(LinkQueue* Q) {          // 数组中转 + 冒泡排序
    if (Q == NULL) return ERROR;
    int* tempArray = (int*)malloc(Q->size * sizeof(int));
    if (tempArray == NULL) return ERROR;
    int cnt = 0;
    while (!IsEmpty(Q)) {                 // 全部出队到数组
        int out;
        DeQueue(Q, &out);
        tempArray[cnt++] = out;
    }
    for (int i = 0; i < cnt; i++)         // 冒泡排序
        for (int j = cnt - 1; j > i; j--)
            if (tempArray[j] < tempArray[j - 1]) {
                int temp = tempArray[j];
                tempArray[j] = tempArray[j - 1];
                tempArray[j - 1] = temp;
            }
    for (int i = 0; i < cnt; i++)         // 按升序重新入队
        EnQueue(Q, tempArray[i]);
    free(tempArray);
    return OK;
}
```

> **"数组中转"是一个通用套路**：队列只能两端操作，无法像数组那样随机访问，所以凡是要排序、去重、反转这类需要任意位置访问的操作，都先把元素全部转到数组里处理，再按目标顺序重建队列。"结构限制 → 换一个能承接该操作的结构"是数据结构设计里最常见的手法之一。

## 栈与队列的应用

### 栈的应用：括号匹配

括号匹配的本质是 LIFO：**最后出现的左括号最先被匹配**。所以算法只有两句话：

- 遇到左括号就入栈；
- 每遇到一个右括号，就"消耗"一个左括号（出栈）并检查类型是否对应。

```c
bool bracketCheck(char str[], int length) {
    SqStack S;
    InitStack(S);                     // 初始化一个栈
    for (int i = 0; i < length; i++) {
        if (str[i] == '(' || str[i] == '[' || str[i] == '{') {
            Push(S, str[i]);          // 扫描到左括号入栈
        } else {
            if (StackEmpty(S))        // 扫描到右括号，且当前栈空
                return false;         // 匹配失败
            char topElem;
            Pop(S, topElem);          // 栈顶元素出栈
            if (str[i] == ')' && topElem != '(')
                return false;
            if (str[i] == ']' && topElem != '[')
                return false;
            if (str[i] == '}' && topElem != '{')
                return false;
        }
    }
    return StackEmpty(S);             // 检索完所有括号后，栈空才算匹配成功
}
```

失败的情形共有三种：右括号出现时栈已空（左括号不够）、右括号与栈顶左括号类型不符（交叉嵌套）、扫描结束后栈非空（左括号多余）。

> **例 6（括号匹配演示）**：判断字符串 `"([{}])"` 与 `"([)]"` 的括号是否匹配。

**思路**：扫描每个字符——左括号入栈；右括号与栈顶比较，不匹配或栈空即失败；扫描结束时栈必须为空。

**解**：

① `"([{}])"`：

| 扫描 | 操作 | 栈（底→顶） |
| :--- | :--- | :--- |
| `(` | 入栈 | ( |
| `[` | 入栈 | ( [ |
| `{` | 入栈 | ( [ { |
| `}` | 弹出 `{`，匹配 | ( [ |
| `]` | 弹出 `[`，匹配 | ( |
| `)` | 弹出 `(`，匹配 | 空 |

扫描结束栈空 → **匹配成功**。

② `"([)]"`：

| 扫描 | 操作 | 栈（底→顶） |
| :--- | :--- | :--- |
| `(` | 入栈 | ( |
| `[` | 入栈 | ( [ |
| `)` | 弹出 `[`，与 `)` 不匹配 → **失败** | — |

**评注**：同一套"遇左入栈、遇右匹配"的逻辑，可以直接搬到 HTML/XML 标签配对、编译器的语法检查（`{}` 配对）、Markdown 标记匹配等场景——需要处理的只是"什么样的符号算左、什么样的算右、哪些类型算匹配"。

### 栈的应用：表达式求值

表达式求值是栈最经典的应用：**中缀转后缀**（运算符栈）与**后缀求值**（操作数栈）两段算法组合起来，就能计算任意带括号的算术表达式。理解三种表达式与**二叉树遍历**的对应关系，是掌握这一节的钥匙。

#### 算术表达式的三种形式

算术表达式由三部分组成：**操作数**、**运算符**、**界限符**（括号），例如 `((15÷(7-(1+1)))×3)-(2+(1+1))`。按运算符相对操作数的位置，表达式有三种写法：

| 表达式类型 | 别名 | 运算符位置 | 对应的二叉树遍历 | 求值扫描方向 |
| :--- | :--- | :--- | :--- | :--- |
| **中缀表达式** | — | 操作数中间 | 中序遍历 | 需考虑优先级与括号 |
| **前缀表达式** | 波兰式（Polish Notation） | 操作数前面 | 前序遍历 | 从右往左 |
| **后缀表达式** | 逆波兰式（Reverse Polish Notation） | 操作数后面 | 后序遍历 | 从左往右 |

把中缀表达式画成一棵表达式二叉树（运算符作内部结点、操作数作叶结点），对它分别做前序、中序、后序遍历，就得到前缀、中缀、后缀三种形式。例如中缀表达式 `((15÷(7-(1+1)))×3)-(2+(1+1))` 对应的：

- 前缀表达式：`- × ÷ 15 - 7 + 1 1 3 + 2 + 1 1`
- 后缀表达式：`15 7 1 1 + - ÷ 3 × 2 1 1 + + -`

后缀（前缀）表达式最大的好处是**完全消除了括号与优先级**：只要机械地按固定方向扫描，就能求出结果。

#### 后缀表达式的求值

用栈求后缀表达式，规则只有两条：

1. 从左往右扫描；遇到**操作数**就压栈；
2. 遇到**运算符**就弹出两个栈顶元素做运算，再把结果压回栈顶。

手算时遵循"**左优先原则**"：只要左边的运算符能先算，就优先算左边的；每遇到一个运算符，就让它前面最近的两个操作数执行运算。

> **例 7（后缀表达式求值）**：计算后缀表达式 $15\;7\;1\;1\;+\;-\;\div\;3\;\times\;2\;1\;1\;+\;+\;-$。

**思路**：从左往右扫描，操作数压栈；遇到运算符弹出两个操作数运算，结果压回。**注意弹出顺序：先弹出的是右操作数。**

**解**：

| 扫描 | 操作 | 栈（底→顶） |
| :--- | :--- | :--- |
| 15, 7, 1, 1 | 操作数入栈 | 15, 7, 1, 1 |
| `+` | $1+1=2$ | 15, 7, 2 |
| `-` | $7-2=5$ | 15, 5 |
| `÷` | $15 \div 5 = 3$ | 3 |
| 3 | 入栈 | 3, 3 |
| `×` | $3 \times 3 = 9$ | 9 |
| 2, 1, 1 | 入栈 | 9, 2, 1, 1 |
| `+` | $1+1=2$ | 9, 2, 2 |
| `+` | $2+2=4$ | 9, 4 |
| `-` | $9-4=5$ | 5 |

结果：**5**。与原中缀表达式 $((15 \div (7-(1+1))) \times 3) - (2+(1+1))$ 直接计算的结果一致。

**评注**：弹出两个操作数时**先弹出的是右操作数**——减法和除法一旦把顺序颠倒，结果全错，这是这类题目最容易失手的地方。后缀表达式之所以能"机械化求值"，正是因为它把括号与优先级都编码进了操作数的排列顺序里。

#### 前缀表达式的求值

前缀表达式的运算方法与后缀完全相同，唯一区别是**从右往左扫描**（右优先原则），而且此时先弹出的是**左**操作数。

#### 中缀表达式转后缀表达式

转换过程只用一个栈，用来暂存"暂时还不能确定运算顺序"的运算符：

1. 从左到右处理各个元素；
2. 遇到**操作数**：直接加入后缀表达式；
3. 遇到**界限符**：左括号直接入栈；右括号则依次弹出栈内运算符并加入后缀表达式，直到弹出左括号为止（左括号不加入后缀表达式）；
4. 遇到**运算符**：依次弹出栈中优先级**高于或等于**当前运算符的所有运算符并加入后缀表达式，遇到左括号或栈空则停止，然后把当前运算符入栈；
5. 处理完所有字符后，把栈中剩余的运算符依次弹出并加入后缀表达式。

> **优先级规则的一句话版本**：**栈内优先级 ≥ 栈外优先级就出栈**。左括号在栈外优先级最高（直接入栈）、在栈内优先级最低（等右括号来收）；右括号触发"弹到左括号为止"。

> **例 8（中缀转后缀）**：将中缀表达式 $A + B \times (C - D) - E \div F$ 转换为后缀表达式。

**思路**：操作数直接输出；运算符与栈顶比较，栈内优先级 ≥ 栈外优先级则弹出；左括号直接入栈，右括号弹到左括号为止。

**解**：

| 扫描 | 操作 | 后缀表达式 | 运算符栈（底→顶） |
| :--- | :--- | :--- | :--- |
| A | 输出 | A | — |
| `+` | 入栈 | A | + |
| B | 输出 | A B | + |
| `×` | 栈顶 `+` 优先级低，入栈 | A B | + × |
| `(` | 直接入栈 | A B | + × ( |
| C | 输出 | A B C | + × ( |
| `-` | 入栈 | A B C | + × ( - |
| D | 输出 | A B C D | + × ( - |
| `)` | 弹出到 `(` 为止 | A B C D - | + × |
| `-` | 弹出 `×`（优先级高）、弹出 `+`（平级），再入栈 | A B C D - × + | - |
| E | 输出 | A B C D - × + E | - |
| `÷` | 栈顶 `-` 优先级低，入栈 | A B C D - × + E | - ÷ |
| F | 输出 | A B C D - × + E F | - ÷ |
| 结束 | 栈中全部弹出 | A B C D - × + E F ÷ - | — |

结果：**`A B C D - × + E F ÷ -`**。

**评注**：注意"**平级也弹出**"（第二个 `-` 把栈里的 `+` 也弹了出来）——只有这样，同级运算符才是从左到右结合的；而 `×` 因优先级高于 `+` 先被弹出，体现了"先乘除后加减"。

#### 中缀表达式的直接求值

中缀求值就是"**中缀转后缀**"与"**后缀求值**"两个算法的合并，用两个栈同时完成：

1. 初始化**操作数栈**与**运算符栈**；
2. 扫描到操作数，压入操作数栈；
3. 扫描到运算符，按"中缀转后缀"的同一套逻辑压入运算符栈——期间每弹出一个运算符，就从操作数栈弹出两个操作数执行运算，再把结果压回操作数栈。

### 栈的应用：递归与函数调用栈

**递归**是函数调用自身，它的运行机制天然依赖栈：每一次调用都在**函数调用栈**上压入一帧。理解"递归 = 栈"，是理解递归本质、也是把递归改写成迭代的理论基础。

#### 函数调用的栈需求

函数调用有三个特点：

- 最后被调用的函数最先执行结束（LIFO）；
- 调用时要保存现场，需要一块栈空间存放：**返回地址**、**实参**、**局部变量**；
- 返回时按相反顺序恢复现场。

#### 递归体与递归出口

递归算法把原始问题转换为**属性相同但规模更小**的问题，它由两部分组成：**递归体**（递归表达式）与**递归出口**（边界条件）。例如：

- 计算正整数的阶乘：$\text{fact}(n) = n \times \text{fact}(n-1)$（$n > 1$），出口 $\text{fact}(1) = 1$ 或 $\text{fact}(0) = 1$；
- 求斐波那契数列：$\text{fib}(n) = \text{fib}(n-1) + \text{fib}(n-2)$（$n > 1$），出口 $\text{fib}(1) = 1$、$\text{fib}(0) = 0$。

#### 递归工作栈

递归调用时使用的函数调用栈也叫**递归工作栈**：每进入一层递归，就把该层所需信息压入栈顶；每退出一层递归，就从栈顶弹出相应信息。用 C 写出来就是：

```c
int fact(int n) {
    if (n == 0 || n == 1) return 1;  // 递归出口
    return n * fact(n - 1);          // 递归体
}
```

![函数调用栈](/notes-assets/dsa3-13-call-stack.jpg)

> **例 9（递归调用栈演示）**：追踪 `fact(4)` 的递归过程与递归工作栈的变化。

**思路**：每进入一层递归压入一帧；`n` 未到达出口就继续压栈，到达出口后逐层弹出并计算。

**解**：

$$
\text{压栈（递推）}:\quad fact(4) \to fact(3) \to fact(2) \to fact(1)
$$

$$
\text{弹栈（回归）}:\quad fact(1) = 1 \Rightarrow fact(2) = 2 \times 1 = 2 \Rightarrow fact(3) = 3 \times 2 = 6 \Rightarrow fact(4) = 4 \times 6 = 24
$$

**评注**：递归的空间开销等于**递归深度**——每层调用占一帧，`fact(n)` 为 $O(n)$。这与"递归算法的空间复杂度看递归调用的深度"是同一个结论。

#### 递归的代价与陷阱

- **递归可以改写成迭代**：任何递归算法都能改写为非递归算法，方法就是手动维护一个栈来模拟函数调用栈。反过来，任何用栈模拟的过程也能用递归表达。
- **栈溢出风险**：递归深度过大时，函数调用栈会耗尽，必须改用"迭代 + 显式栈"。
- **重复计算陷阱**：斐波那契数列的朴素递归实现时间复杂度为 $O(2^n)$——同一子问题被反复求解。实际使用时应改为**记忆化递归**（$O(n)$）或直接迭代（$O(n)$ 时间、$O(1)$ 空间）。

> **易错点**：递归算法的空间复杂度**不是**数"用了几个变量"，而是看**递归深度**——每一层调用都要占一块栈空间。递归代码简洁，但空间代价可能高达 $O(n)$，规模很大时就要考虑改写为迭代。

### 栈的应用：进制转换

十进制整数转 $r$ 进制，做法是**反复除以 $r$ 取余数**：第一次得到的余数是**最低位**，最后一次得到的余数是**最高位**。而输出时必须先输出最高位——恰好是"后得到的先输出"，与栈的 LIFO 完全吻合：把每次的余数压栈，除完后依次弹栈输出即可。

```c
void ConvertBase(int n, int r) {   // 将十进制正整数 n 转为 r 进制并输出
    if (n == 0) { printf("0"); return; }
    SqStack S;
    InitStack(S);
    while (n > 0) {
        Push(S, n % r);   // 余数入栈：先得到的是低位
        n = n / r;
    }
    int digit;
    while (!StackEmpty(S)) {
        Pop(S, digit);    // 出栈：先弹出的是高位
        printf("%d", digit);
    }
}
```

例如 $n = 1348$、$r = 8$：依次得到的余数为 $4, 0, 5, 2$，弹栈输出 `2504`，即 $(1348)_{10} = (2504)_8$。

> **同一思想的其他用法**：把"逆序输出"的场合找出来，就能用栈替换数组。进制转换、链表逆序打印、字符串反转，本质上都是"先压后弹"。

### 队列的应用

队列的 FIFO 特性天然适合"**按到达顺序处理**"的场景：

1. **树的层次遍历**：从根结点开始逐层访问。队列保证"先被访问的结点，其孩子也先被处理"。
2. **图的广度优先遍历**（BFS）：从起点出发逐层扩散。队列保证"先被发现的顶点先被访问"。
3. **操作系统的先来先服务调度**（First Come First Service, FCFS）：多个进程争抢有限资源时，按请求到达的顺序排队，先到者先获得资源。
4. **打印数据缓冲区**：多台计算机共享一台打印机时，打印任务按提交顺序排队，逐个处理。

> **队列真正的作用是"解耦"**：打印缓冲区、消息队列、请求队列——这些场景中队列**缓存**了待处理的数据，使生产者与消费者能以不同的速率工作：生产者不必等待消费者处理完才继续生产，消费者也不必在数据到来前空转。这是队列在操作系统与网络编程中最重要的价值。

### 栈与队列的综合应用

栈和队列不是彼此孤立的结构：把两者组合起来，或者用一种结构去模拟另一种，往往能解决单靠一种结构难以处理的问题。

#### 用栈 + 队列判断回文

同时把字符**入队**（FIFO，正序）和**入栈**（LIFO，逆序），再逐元素比对：队列给出正序、栈给出逆序，两者全部相同就是回文——这是栈与队列对偶性最直接的用法。

```c
int IsPalindrome(const char* str) {
    if (str == NULL) return 1;
    int asciiArr[MAXSIZE], k = 0;
    // 预处理：忽略空格，统一转为小写，只保留字母和数字
    for (int i = 0; str[i]; i++) {
        if (str[i] == ' ') continue;
        if (str[i] >= 'A' && str[i] <= 'Z')
            asciiArr[k++] = (int)str[i] + 32;
        else if ((str[i] >= 'a' && str[i] <= 'z') ||
                 (str[i] >= '0' && str[i] <= '9'))
            asciiArr[k++] = (int)str[i];
    }
    SqQueue* Q = InitQueue();          // 同时入队（FIFO）和入栈（LIFO）
    int stack[MAXSIZE], stackTop = 0;
    for (int i = 0; i < k; i++) {
        EnQueue(Q, asciiArr[i]);
        stack[stackTop++] = asciiArr[i];
    }
    stackTop--;
    while (!IsEmpty(Q)) {              // 队列（正序）与栈（逆序）逐元素比较
        int out;
        DeQueue(Q, &out);
        if (stack[stackTop--] != out) return 0;
    }
    return 1;
}
```

预处理阶段忽略空格与标点、统一大小写，是回文判断的标准前置步骤；否则 `"A man, a plan"` 这类字符串会被误判。

#### 双队列模拟栈

用队列的 FIFO 行为模拟栈的 LIFO：`Push` 直接入队（$O(1)$）；`Pop` 时把前 $n-1$ 个元素转移到另一个队列，留在原队列的最后一个元素就是"栈顶"（$O(n)$）。

```c
typedef struct {
    LinkQueue* q1;
    LinkQueue* q2;
} MyStack;

MyStack* MyStackCreate(void) {
    LinkQueue* q1 = InitQueue();
    LinkQueue* q2 = InitQueue();
    if (q1 == NULL || q2 == NULL) return NULL;
    MyStack* S = (MyStack*)malloc(sizeof(MyStack));
    S->q1 = q1; S->q2 = q2;
    return S;
}

void MyStackPush(MyStack* obj, int x) {
    EnQueue(obj->q1, x);                      // O(1)：直接入队
}

int MyStackPop(MyStack* obj) {
    int out, size = GetSize(obj->q1);
    for (int i = 0; i < size - 1; i++) {      // 前 n-1 个元素转移到 q2
        DeQueue(obj->q1, &out);
        EnQueue(obj->q2, out);
    }
    DeQueue(obj->q1, &out);                   // 最后一个元素即"栈顶"
    LinkQueue* temp = obj->q1;                // 交换 q1、q2 角色，q1 保持非空
    obj->q1 = obj->q2;
    obj->q2 = temp;
    return out;
}

int MyStackTop(MyStack* obj) {
    int out;
    while (!IsEmpty(obj->q1)) {               // 全部转移到 q2
        DeQueue(obj->q1, &out);
        EnQueue(obj->q2, out);
    }
    int res = out;                            // 最后一个元素即栈顶
    while (!IsEmpty(obj->q2)) {               // 再恢复回 q1
        DeQueue(obj->q2, &out);
        EnQueue(obj->q1, out);
    }
    return res;
}

int MyStackEmpty(MyStack* obj) { return IsEmpty(obj->q1); }
```

#### 双栈模拟队列

反向的模拟——用两个栈模拟队列——则用"输入栈 + 输出栈"分离入队与出队，可以得到更好的复杂度：

| 操作 | 双队列模拟栈 | 双栈模拟队列 |
| :--- | :--- | :--- |
| Push / EnQueue | $O(1)$ | $O(1)$（均摊） |
| Pop / DeQueue | $O(n)$ | $O(1)$（均摊） |
| 核心思路 | 把 $n-1$ 个元素转移到另一个队列 | 输入栈与输出栈分离"入"和"出" |

> **两个方向并不对称**：FIFO 模拟 LIFO 的代价高（`Pop` 为 $O(n)$），LIFO 模拟 FIFO 的代价低（均摊 $O(1)$）。原因在于栈只能从一端取，而队列能把"最早进来的"一直留在队头等着被取。

#### 队列模拟约瑟夫环

$n$ 个人围成一圈，从 1 开始报数，每报到第 $m$ 个人就出列，然后从下一个人重新报数。用队列模拟十分自然：**前 $m-1$ 个人"出队再入队"回到队尾（相当于跳过），第 $m$ 个人直接出队（淘汰）**，直到队列为空。

```c
void Josephus(int n, int m, int result[]) {
    if (n <= 0 || m <= 0) return;
    SqQueue* Q = InitQueue();
    for (int i = 1; i <= n; i++) EnQueue(Q, i);
    int k = 0, cnt = 1;
    while (k != n) {
        if (cnt == m) {
            DeQueue(Q, &result[k++]);  // 第 m 个人出列
            cnt = 1;
        } else {
            int out;
            DeQueue(Q, &out);          // 被跳过的人重新入队
            EnQueue(Q, out);
            cnt++;
        }
    }
    free(Q);
}
```

> **例 11（约瑟夫环演示）**：$n = 5$ 人编号 $1 \sim 5$ 围成一圈，报数 $m = 3$，写出出列序列。

**思路**：队头的人"出队再入队"表示跳过，第 3 个人直接出队淘汰；`cnt` 从 1 数到 3 后归 1，循环往复直到队列空。

**解**：

| 轮次 | 队列（队头→队尾） | 动作 | 出列 |
| :--- | :--- | :--- | :--- |
| 1 | 1, 2, 3, 4, 5 | 1、2 回队尾；3 出列 | 3 |
| 2 | 4, 5, 1, 2 | 4、5 回队尾；1 出列 | 1 |
| 3 | 2, 4, 5 | 2、4 回队尾；5 出列 | 5 |
| 4 | 2, 4 | 2、4 回队尾；2 出列 | 2 |
| 5 | 4 | 4 出列 | 4 |

出列序列：**3, 1, 5, 2, 4**。

**评注**：第 4 轮要特别注意——队列里剩 $2, 4$ 两个人，报数要连续经过 2、4 之后才轮到第 3 个数，所以是 2 被淘汰而不是 4。"出队再入队"在逻辑上就是"数到的人移到队尾"，队列的环状复用完美映射了约瑟夫环的循环结构。该算法的时间复杂度为 $O(n \cdot m)$，空间复杂度为 $O(n)$。

#### 淘汰游戏（约瑟夫问题变体）

```c
int HotPotato(LinkQueue* Q, int num) {
    if (Q == NULL || IsEmpty(Q)) return -1;
    if (num < 1) return -1;
    while (GetSize(Q) > 1) {
        int out;
        for (int i = 0; i < num - 1; i++) {  // 前 num-1 人安全，回到队尾
            DeQueue(Q, &out);
            EnQueue(Q, out);
        }
        DeQueue(Q, &out);                    // 第 num 人被淘汰
    }
    int res;
    GetHead(Q, &res);                        // 最后一人即获胜者
    return res;
}
```

与约瑟夫环的区别：淘汰游戏直接在传入的队列上操作，不另建队列，也不记录完整出列序列，只返回最后的幸存者。

#### 队列逐行生成杨辉三角

杨辉三角的每一行都由上一行相邻两数之和（$a+b$）生成，行首行尾恒为 1。利用队列的 FIFO 特性，从队头取出相邻的两个元素相加，结果入队即成为新一行的元素：

```c
// PrintQueue 是按"队头→队尾"顺序打印队列的辅助函数
void PrintPascalTriangle(int n) {
    if (n < 1) return;
    LinkQueue* Q = InitQueue();
    EnQueue(Q, 1); PrintQueue(Q); Clear(Q);          // 第 1 行
    if (n >= 2) {
        EnQueue(Q, 1); EnQueue(Q, 1); PrintQueue(Q); // 第 2 行
    }
    for (int i = 3; i <= n; i++) {
        int cnt = 0, out;
        while (cnt != i - 2) {                       // 由上一行生成当前行
            DeQueue(Q, &out);
            EnQueue(Q, out + Q->front->data);        // a + b → 新元素
            cnt++;
        }
        EnQueue(Q, 1);                               // 行尾恒为 1
        PrintQueue(Q);
    }
}
```

**精妙之处**：`out + Q->front->data` 一行同时完成"取相邻元素"与"求和"——出队得到前一个元素，队头恰好就是它的后继，队列的**前瞻能力**（队头相邻元素可见）在这里被用到了极致。

#### 滑动窗口计数器

维护一个固定长度的时间窗口，每次 `Ping(t)` 时先移除所有过期的时间戳，再记录当前时间并返回窗口内的请求数：

```c
typedef struct {
    LinkQueue* queue;
} RecentCounter;

RecentCounter* RecentCounterCreate(void) {
    LinkQueue* Q = InitQueue();
    if (Q == NULL) return NULL;
    RecentCounter* obj = (RecentCounter*)malloc(sizeof(RecentCounter));
    obj->queue = Q;
    return obj;
}

int RecentCounterPing(RecentCounter* obj, int t) {
    if (obj == NULL || obj->queue == NULL) return -1;
    int timeLim = t - 3000;
    while (!IsEmpty(obj->queue) && obj->queue->front->data < timeLim) {
        int out;
        DeQueue(obj->queue, &out);   // 移除窗口外的旧请求
    }
    EnQueue(obj->queue, t);
    return GetSize(obj->queue);
}

void RecentCounterFree(RecentCounter* obj) {
    if (obj == NULL) return;
    DestroyQueue(&(obj->queue));
    free(obj);
}
```

关键在于题目保证 `Ping` 的调用时间 $t$ **严格递增**，因此队列中的时间戳天然有序，只需要从队头移除过期元素即可。每次操作均摊 $O(1)$——每个时间戳至多入队一次、出队一次。

## 单调栈与单调队列

### 单调栈

**单调栈**（Monotonic Stack）不是一种新结构，它只是在普通栈上加了一条规则：**入栈前，先把栈内所有破坏单调性的元素弹出**。这条规则让栈内元素保持单调，从而在 $O(n)$ 时间内解决一大类"找下一个更大／更小元素"的问题。

#### 核心思想与均摊复杂度

关键在于"**弹出即结算**"：当新元素到来时，栈内那些比它小的元素终于等到了它们的答案——**这个新元素就是它们右边第一个更大的元素**，于是可以立刻弹出并记录结果。

关于复杂度：虽然每个元素入栈时都跟着一个 `while` 循环，但**每个元素至多入栈一次、出栈一次**，整个循环体内层语句的总执行次数不超过 $2n$，因此总时间复杂度是 $O(n)$。这种"把内层循环的累计次数摊到每个元素头上"的分析方法叫**均摊分析**，后面学习 KMP、Manacher、并查集时还会反复遇到。

> **一句话理解**：普通栈只关心"谁在顶端"，单调栈关心"谁在等我"。栈内没被弹出的元素，都是"还没有等到答案"的元素。

#### 两种方向

| 方向 | 栈内单调性 | 解决的问题 | 弹出条件 |
| :--- | :--- | :--- | :--- |
| **单调递减栈** | 栈底→栈顶递减（栈顶最小） | 找**下一个更大**元素 | `nums[i] > nums[st.top()]` 时弹出栈顶 |
| **单调递增栈** | 栈底→栈顶递增（栈顶最大） | 找**下一个更小**元素 | `nums[i] < nums[st.top()]` 时弹出栈顶 |

**记忆口诀：递增栈找更小，递减栈找更大。** 反过来说也成立：栈内递增时，只有"比栈顶更小"的元素才会破坏单调性；栈内递减时，只有"比栈顶更大"的元素才会破坏单调性。

#### 下一个更大元素

**模板一：单调递减栈——找每个元素右边第一个比它大的元素**

```cpp
vector<int> nextGreater(const vector<int>& nums) {
    int n = nums.size();
    vector<int> ans(n, -1);        // 默认值：右边没有更大的元素
    stack<int> st;                 // 存下标（多数情况都需要下标）
    for (int i = 0; i < n; ++i) {
        while (!st.empty() && nums[i] > nums[st.top()]) {
            int prev = st.top();
            st.pop();
            ans[prev] = i - prev;  // 需要距离时返回距离，需要值时可返回 nums[i]
        }
        st.push(i);
    }
    return ans;                    // 栈中剩下的元素保持默认值
}
```

#### 下一个更小元素

**模板二：单调递增栈——找每个元素右边第一个比它小的元素**

```cpp
vector<int> nextSmaller(const vector<int>& nums) {
    int n = nums.size();
    vector<int> ans(n, -1);
    stack<int> st;
    for (int i = 0; i < n; ++i) {
        while (!st.empty() && nums[i] < nums[st.top()]) {  // 只有比较方向相反
            int prev = st.top();
            st.pop();
            ans[prev] = i - prev;
        }
        st.push(i);
    }
    return ans;
}
```

#### 左右两侧边界

**模板三：单调递增栈——同时确定左右两侧第一个更小的元素**

```cpp
int largestRectangleArea(const vector<int>& heights) {
    int n = heights.size();
    vector<int> left(n, -1), right(n, n);   // 左右第一个更小元素的下标
    stack<int> st;
    for (int i = 0; i < n; ++i) {           // 从左往右扫，确定左边界
        while (!st.empty() && heights[st.top()] >= heights[i]) st.pop();
        left[i] = st.empty() ? -1 : st.top();
        st.push(i);
    }
    st = stack<int>();                      // 清空后反向扫描，确定右边界
    for (int i = n - 1; i >= 0; --i) {
        while (!st.empty() && heights[st.top()] >= heights[i]) st.pop();
        right[i] = st.empty() ? n : st.top();
        st.push(i);
    }
    int best = 0;
    for (int i = 0; i < n; ++i)             // 以 heights[i] 为高的最大矩形
        best = max(best, heights[i] * (right[i] - left[i] - 1));
    return best;
}
```

两个方向都用 `>=` 弹出栈顶，保证左右边界取到的都是**严格更小**的元素，区间宽度才是 `right[i] - left[i] - 1`。

#### 例题：每日温度

> **例 12（单调栈找下一个更大元素）**：给定每日温度 `[73, 74, 75, 71, 69, 72, 76, 73]`，求每一天至少要等几天才会出现更高的温度。

**思路**：用单调递减栈（栈底→栈顶递减，栈内存下标）。遍历到下标 $i$ 时，只要栈顶温度小于当前温度，说明栈顶那一天"等到答案了"，弹出并结算距离 $i - prev$。

**解**：

| i | 温度 | 栈操作 | 结算 |
| :--- | :--- | :--- | :--- |
| 0 | 73 | 入栈 [0] | — |
| 1 | 74 | 74>73：弹 0，ans[0]=1；入栈 [1] | ans[0]=1 |
| 2 | 75 | 75>74：弹 1，ans[1]=1；入栈 [2] | ans[1]=1 |
| 3 | 71 | 入栈 [2,3] | — |
| 4 | 69 | 入栈 [2,3,4] | — |
| 5 | 72 | 72>69：弹 4，ans[4]=1；72>71：弹 3，ans[3]=2；入栈 [2,5] | ans[4]=1, ans[3]=2 |
| 6 | 76 | 76>72：弹 5，ans[5]=1；76>75：弹 2，ans[2]=4；入栈 [6] | ans[5]=1, ans[2]=4 |
| 7 | 73 | 入栈 [6,7] | — |

结果：`[1, 1, 4, 2, 1, 1, 0, 0]`——最后两天（下标 6、7）之后没有更高的温度，保持默认值 0。

**评注**：每个元素入栈、出栈各一次，总复杂度为均摊 $O(n)$。单调递减栈的栈顶是"最急需答案"的元素：新的温度一到来，所有比它小的栈顶元素一次性全部结算，这正是"弹出即结算"的含义。

#### 三种模式的适用场景

| 模式 | 解决的问题 | 代表问题 |
| :--- | :--- | :--- |
| **递减栈** | 找下一个更大元素 | LeetCode-739 每日温度 |
| **递增栈** | 找下一个更小元素 | LeetCode-1475 商品折扣后的最终价格 |
| **递增栈** | 同时确定左右边界 | LeetCode-84 柱状图中最大的矩形 |

> **易错点**：① **存下标而非值**——需要计算距离或回填原数组时必须存下标；② **弹出条件的方向**——找"下一个更大"用 `>`，找"下一个更小"用 `<`，写反结果完全不同；③ **等号的处理**——`>` 与 `>=` 取决于题目是否允许相等元素，读到"严格大于"时要格外小心；④ **遍历结束后栈中剩余的元素**——它们没有符合条件的答案，保持结果数组的初始默认值即可，通常不需要额外处理。
>
> **哨兵技巧**：在数组末尾补一个值极小（或极大）的"哨兵"元素，可以强制所有元素在遍历结束时被弹出，省去收尾处理。这是单调栈里最实用的编码技巧之一。

### 单调队列

**单调队列**（Monotonic Queue）把同一条规则搬到了队列上，并且多了一步：**入队时先弹出队尾所有破坏单调性的元素**，同时**从队头移除已经滑出窗口的元素**。它的典型场景是**滑动窗口内的最值查询**。

单调队列必须用**双端队列**（Deque）实现——队头队尾都要支持 $O(1)$ 的增删。与单调栈的区别在于"窗口"的形态：单调栈的窗口**向右无限延伸**（只进不出），单调队列的窗口**固定大小、左右滑动**（有进有出）。

#### 模板：滑动窗口最大值

```cpp
vector<int> maxSlidingWindow(const vector<int>& nums, int k) {
    int n = nums.size();
    vector<int> res;
    deque<int> dq;  // 存下标，维护队列内元素值单调递减

    for (int i = 0; i < n; ++i) {
        // ① 移除窗口外元素：队头下标 < i - k + 1 → 已滑出窗口
        while (!dq.empty() && dq.front() < i - k + 1)
            dq.pop_front();

        // ② 维护单调递减：弹出队尾所有值小于 nums[i] 的元素
        while (!dq.empty() && nums[dq.back()] < nums[i])
            dq.pop_back();

        // ③ 当前元素从队尾入队
        dq.push_back(i);

        // ④ 窗口形成后，队头即当前窗口最大值
        if (i >= k - 1)
            res.push_back(nums[dq.front()]);
    }
    return res;
}
```

四步各司其职：队头存放窗口最大值，队尾负责维护单调性。求滑动窗口**最小值**时，只需把步骤②的比较方向取反（`nums[dq.back()] > nums[i]`）。与单调栈同理，每个元素至多入队一次、出队一次，总复杂度为均摊 $O(n)$——而朴素做法每个窗口扫描一次是 $O(nk)$。

> **例 13（滑动窗口最大值演示）**：`nums = [1, 3, -1, -3, 5, 3, 6, 7]`，窗口大小 $k = 3$，求每个窗口的最大值。

**思路**：维护一个值单调递减的双端队列（存下标）：队头是当前窗口最大值；窗口滑动时先移除队头已过期的下标，再弹出队尾所有比新元素小的元素，最后把新下标放入队尾。

**解**：

| i | 元素 | 窗口 | 队列（存下标，值递减） | 最大值 |
| :--- | :--- | :--- | :--- | :--- |
| 0 | 1 | [1] | [0] | — |
| 1 | 3 | [1, 3] | 弹 0（3>1），[1] | — |
| 2 | -1 | [1, 3, -1] | [1, 2] | 3 |
| 3 | -3 | [3, -1, -3] | [1, 2, 3] | 3 |
| 4 | 5 | [-1, -3, 5] | 下标 1 已过期，队头移除；再弹 3、2；[4] | 5 |
| 5 | 3 | [-3, 5, 3] | [4, 5] | 5 |
| 6 | 6 | [5, 3, 6] | 弹 5、4；[6] | 6 |
| 7 | 7 | [3, 6, 7] | 弹 6；[7] | 7 |

结果：`[3, 3, 5, 5, 6, 7]`。

**评注**：每一步都只有两类清理——**过期的下标**（在队头，因为下标递增）和**永远不可能成为最大值的元素**（在队尾，因为后面有更大的）。两类清理合计让每个元素至多进出一次，因此整体是均摊 $O(n)$。前面提到的滑动窗口计数器本质上也是单调队列的简化版：它只需要移除过期元素，不需要在同一步维护单调性。

## 小结

- **栈**是只允许在一端插入删除的线性表，特征是 LIFO；$n$ 个不同元素的合法出栈序列共有 $\frac{1}{n+1}\mathrm{C}_{2n}^{n}$ 种，即卡特兰数。
- **顺序栈**的关键是 `top` 的约定：`top = -1` 表示空栈时，判空为 `top == -1`、判满为 `top == MaxSize-1`、元素个数为 `top + 1`；共享栈的两个栈顶相邻（`top1 + 1 == top0`）才算满。
- **链栈**把链表头当栈顶，进栈是头插、出栈是头删，二者都是 $O(1)$；把链尾当栈顶会让出栈退化为 $O(n)$。
- **队列**是一端进、另一端出的线性表，特征是 FIFO；顺序队列的**假溢出**来自"指针走到数组末端"，解决办法是取模，而不是重置指针。
- **循环队列**的判空判满有预留空间、`size` 变量、`tag` 变量三种方案，元素个数统一由 $(rear - front + MaxSize) \% MaxSize$ 给出。
- **链队列**有两个必查的边界：空队入队要同时更新 `front` 与 `rear`，最后一个元素出队后必须重置 `rear`；它的 $O(1)$ 拼接是相对顺序队列的核心优势。
- **栈用于**括号匹配、表达式求值、递归与进制转换，**队列用于**层次遍历、广度优先遍历、缓冲与调度；**单调栈**解决"下一个更大／更小"、**单调队列**解决"滑动窗口最值"，两者的均摊复杂度都是 $O(n)$，因为每个元素至多进出一次。

#### 单调栈与单调队列

| 对比维度 | 单调栈 | 单调队列 |
| :--- | :--- | :--- |
| **底层结构** | 普通栈（单端操作） | 双端队列 Deque（双端操作） |
| **核心规则** | 入栈时弹出破坏单调性的栈顶 | 入队时弹出破坏单调性的队尾，滑动时再弹出窗口外的队头 |
| **典型问题** | 找"下一个更大／更小"元素 | 滑动窗口内的最值 |
| **窗口特点** | 向右无限延伸（只进不出） | 固定大小、左右滑动（有进有出） |
| **代表问题** | LeetCode-739 每日温度、LeetCode-84 柱状图最大矩形 | LeetCode-239 滑动窗口最大值 |
| **时间复杂度** | $O(n)$（均摊） | $O(n)$（均摊） |
| **关键技巧** | 存下标、哨兵、注意等号方向 | 双端操作、先弹过期再维护单调性 |

选型决策可以归纳成三句话：

```
问题问"下一个更大／更小"        → 单调栈
问题问"滑动窗口内的最大／最小"   → 单调队列
问题问"任意区间最值"但没有"第一个"的限制 → 线段树 / 稀疏表等区间查询结构
```

> **共同的底层思想**：单调栈与单调队列都依赖"**每个元素至多进一次、出一次 → 均摊 $O(n)$**"这一条分析。真正值得记住的不是模板的形状，而是这种"把内层循环的代价摊到每个元素身上"的论证方式——它在 KMP、Manacher、并查集等算法中会反复出现。

#### 四种实现的终极对比

| 对比维度 | 顺序栈 | 链栈 | 循环队列 | 链队列 |
| :--- | :--- | :--- | :--- | :--- |
| **数据特征** | LIFO | LIFO | FIFO | FIFO |
| **操作入口** | 仅栈顶一端 | 仅栈顶一端 | 队头出、队尾入 | 队头出、队尾入 |
| **随机访问** | $O(1)$（可按下标） | $O(n)$（需遍历） | 不支持 | 不支持 |
| **插入 / 删除** | $O(1)$ | $O(1)$ | $O(1)$ | $O(1)$ |
| **存储密度** | 最高 | 较低（每结点多一个指针） | 最高 | 较低（每结点多一个指针） |
| **容量管理** | 固定（静态）／需拷贝扩容（动态） | 天然动态 | 固定（需预留空间或维护 size／tag） | 天然动态 |
| **判空** | `top == -1` | `top == NULL` | `front == rear` | `front == rear`（都指向头结点） |
| **判满** | `top == MaxSize-1` | 无（仅受内存限制） | `(rear+1)%MaxSize == front` | 无（仅受内存限制） |
| **内存释放** | 单层（静态）／双层（动态） | 逐结点释放 | 单层 | 逐结点释放 |
| **拼接操作** | $O(n)$（复制元素） | $O(n)$（复制元素） | $O(n)$（复制元素） | $O(1)$（指针操作） |
| **核心优势** | 随机访问 + 高存储密度 | 无容量限制 | 高存储密度 + 循环复用 | 无容量限制 + $O(1)$ 拼接 |

#### 选型建议

- 只需 LIFO 且容量固定 → **顺序栈**（随机访问、存储密度高）；
- 只需 LIFO 且容量不定 → **链栈**（没有栈满限制）；
- 只需 FIFO 且容量固定、追求性能 → **循环队列**（推荐用 `size` 变量判满）；
- 只需 FIFO 且需要频繁拼接 → **链队列**（拼接为 $O(1)$）；
- 需要两端操作 → **双端队列**；
- 需要回文或匹配检查 → **栈与队列结合**；
- 只有队列却要模拟 LIFO → **双队列模拟栈**（Push $O(1)$、Pop $O(n)$）；
- 只有栈却要模拟 FIFO → **双栈模拟队列**（均摊 $O(1)$）。

#### 时间复杂度速查

| 操作 | 顺序栈 | 链栈 | 循环队列 | 链队列 |
| :--- | :--- | :--- | :--- | :--- |
| Push / EnQueue | $O(1)$ | $O(1)$ | $O(1)$ | $O(1)$ |
| Pop / DeQueue | $O(1)$ | $O(1)$ | $O(1)$ | $O(1)$ |
| GetTop / GetHead | $O(1)$ | $O(1)$ | $O(1)$ | $O(1)$ |
| 判空 / 判满 | $O(1)$ | $O(1)$ | $O(1)$ | $O(1)$ |
| 获取大小 | $O(1)$ | $O(1)$（维护 size） | $O(1)$ | $O(1)$（维护 size） |
| 按值查找 | $O(n)$ | $O(n)$ | $O(n)$ | $O(n)$ |
| 反转 | $O(n)$，$O(1)$ 空间（双指针） | $O(n)$（转移法） | $O(n)$（需数组中转） | $O(n)$（需数组中转） |
| 拼接 | $O(n)$ | $O(n)$ | $O(n)$ | $O(1)$（指针操作） |
