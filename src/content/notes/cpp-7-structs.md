---
title: C++程序设计基础-7 结构体
description: 用 struct 把类型不同的数据打包成自定义类型，并讲清结构体数组、指针与函数传参的取舍。
category: 计算机科学
subject: 计算机科学
subfield: C++程序设计基础
topic: C++结构体
difficulty: 基础
date: "2026-10-02"
tags: [C++, 结构体, 自定义类型, 结构体数组, 结构体指针, 值传递与地址传递, 排序]
draft: false
featured: false
---

## 结构体的基本知识

到目前为止，程序里每个变量都是"单打独斗"的：`int` 存一个整数，`double` 存一个小数，`char` 存一个字符。但现实中的数据往往是**聚合**在一起的——一个学生有姓名、年龄、成绩，一本图书有书名、作者、价格。为每个属性单独声明一个变量，这些变量会在代码里四处散落，它们之间的关联只存在于程序员的脑子里，改起来极易出错。**结构体**（Struct）正是把**不同类型**的数据打包成一个**自定义的复合数据类型**。

### 结构体的定义

定义一个结构体，等于**创造一个新类型**，而不是创建一个变量——这一条决定了它后面所有的行为。语法只有一条主线：`struct` 关键字、结构体名、一对花括号里的成员列表，最后跟一个**不能省的分号**。C++ 提供两种写法：C++ 原生风格，以及从 C 语言继承下来的 `typedef` 风格。

#### C++ 风格定义结构体

```cpp
struct 结构体名 {
    成员类型1 成员名1;
    成员类型2 成员名2;
    // ...
};                      // 注意：这里必须有分号！
```

例如，定义一个"学生"结构体：

```cpp
struct Student {
    string name;         // 姓名
    int age;             // 年龄
    double score;        // 成绩
};
```

四个要素各司其职：

| 要素 | 说明 |
| :--- | :--- |
| `struct` | 关键字，表示定义一个结构体类型 |
| `Student` | 结构体名（自定义标识符，建议用大驼峰命名） |
| `name`、`age`、`score` | 结构体的**成员**（Member），可以是任意类型——`int`、`double`、`string`、数组，甚至另一个结构体 |
| 末尾的 `;` | **必须写**，忘记分号是最常见的结构体语法错误 |

> **易错点**：末尾的分号为什么不能省？因为 C++ 允许在定义结构体的同时声明变量——`struct Student { ... } stu1, stu2;`，分号是这条语句的结束标记；即使不声明变量，编译器也需要它来确认定义已经结束。漏掉分号时，编译器会把下一行代码当作结构体定义的一部分，报出一串很难看懂的错误。

> **注意**：定义结构体只是创建了一个**新的数据类型**（就像 `int`、`double` 一样），此时还没有分配任何内存。只有用这个类型创建了具体的变量，内存才被分配。

#### typedef 与 C 风格定义

`typedef` 是 C 语言时代的遗产，作用是为已有类型**起一个别名**——别名就是新名字，类型本身不变：

```cpp
typedef 原类型 新别名;
```

```cpp
typedef unsigned int uint;       // 以后可以用 uint 代替 unsigned int
typedef int* intPtr;             // 以后可以用 intPtr 代替 int*

uint age = 25;                   // 等价于 unsigned int age = 25
intPtr p;                        // 等价于 int* p（但"类型+变量"的直觉更清晰）
```

`typedef` 最常见的用途是给结构体起别名，这个习惯是 C 语言逼出来的：C 中创建结构体变量必须写 `struct Student stu;`，`struct` 关键字不能省，于是 C 程序员用 `typedef struct { ... } Student;` 起个别名把它省掉。C++ 里没有这个麻烦——`struct Student { ... };` 定义之后，`Student` 本身就是可以直接使用的类型名，下面两段代码的效果完全相同：

```cpp
// C++ 原生风格（推荐——结构体名本身就是类型名）
struct Student {
    string name;
    int age;
};
Student s1;                  // C++ 中 struct 可以省略

// C 语言 typedef 风格（旧代码中常见——需要能看懂）
typedef struct {
    string name;
    int age;
} Student;                   // Student 是匿名结构体的别名
Student s2;                  // 使用效果相同，但定义方式不同
```

| 方式 | C 语言兼容 | 推荐度 |
| :--- | :--- | :--- |
| C++ 风格 `struct Student { ... };` | C 中必须写作 `struct Student` | **C++ 推荐** |
| C 风格 `typedef struct { ... } Student;` | ✅ | 阅读旧代码时需要看懂 |

> **注意**：写新代码时不必模仿 `typedef struct` 的写法——`Student` 本身已经是可用的类型名，再多包一层别名只会增加阅读成本。但这种写法至今大量出现在 OJ 题面与开源项目里，读懂它是一项必要的能力。

### 创建结构体变量

有了结构体类型，就可以创建变量。创建方式有三种，差别只在"什么时候把数据放进去"。下面这个程序把三种写法放在一起对照：

```cpp
#include <iostream>
#include <string>
using namespace std;

struct Student {
    string name;
    int age;
    double score;
};

int main() {
    // 方式 1：先声明，再逐个赋值
    Student stu1;
    stu1.name = "张三";
    stu1.age = 18;
    stu1.score = 95.5;

    // 方式 2：声明同时初始化（按成员顺序）
    Student stu2 = {"李四", 19, 88.0};

    // 方式 3：定义结构体时顺便创建变量（不常用）
    // struct Student { ... } stu3;

    cout << "姓名：" << stu1.name
         << " 年龄：" << stu1.age
         << " 成绩：" << stu1.score << endl;
    return 0;
}
```

#### 逐个赋值

先声明一个结构体变量，再用点运算符给每个成员单独赋值。它的优点是灵活：成员的值可以在程序运行过程中随时确定（例如从输入读入、由计算得出），不要求在写代码时就知道。代价是每个成员都要占一行。

#### 整体初始化

用一对花括号把成员的初始值按**定义时的成员顺序**一次写完：`Student stu2 = {"李四", 19, 88.0};`。花括号里的值按位置一一对应，所以顺序必须和结构体定义里一致，否则 `19` 会被塞进 `score`。数据在写代码时已经确定的话，这种写法最短，也最不容易出错。

#### 定义时创建变量

把变量名直接写在结构体定义的末尾：`struct Student { ... } stu3;`。这种方式很少使用——它把类型和某一次使用的变量绑在了一起，其它地方再想创建 `Student` 变量时就没有类型名可用了。理解它存在的意义更重要：正是这种写法，才要求结构体定义的末尾必须有分号。

| 方式 | 语法 | 适用场景 |
| :--- | :--- | :--- |
| 逐个赋值 | `Student s; s.name = "...";` | 数据来源于输入或计算，无法在定义时确定 |
| 整体初始化 | `Student s = {"...", 18, 95.5};` | 数据在写代码时就已知，最简洁 |
| 定义时创建 | `struct Student { ... } s;` | 很少使用（结构体和变量耦合在一起，不灵活） |

> **易错点**：C++ 中创建结构体变量时，`struct` 关键字**可以省略**——`Student stu1;` 和 `struct Student stu1;` 完全等价，后者是 C 语言的写法，本系列示例统一省略。

> **易错点**：同类型的结构体变量**可以直接赋值**——`stu2 = stu1;` 会把 `stu1` 的每个成员逐字节复制给 `stu2`，语法上和基本类型赋值完全一致。但这是**浅拷贝**：如果结构体里有指针成员，两个结构体的指针会指向同一块堆内存，析构时就可能重复释放。指针成员的复制规则在 C++程序设计基础-8 面向对象编程里展开。

### 成员访问与赋值

结构体的成员通过**点运算符** `.` 访问和修改。

#### 点运算符

点运算符的作用是"取出结构体变量的某个成员"，读起来就是汉语里的"的"：`stu.name` 念作"stu 的 name"。赋值和读取都靠它：

```cpp
#include <iostream>
#include <string>
using namespace std;

struct Student {
    string name;
    int age;
    double score;
};

int main() {
    Student stu;
    stu.name = "王五";        // 通过 . 赋值
    stu.age = 20;
    stu.score = 78.5;

    cout << stu.name << endl; // 通过 . 读取
    cout << stu.age << endl;

    stu.score = 82.0;          // 可以单独修改某个成员
    return 0;
}
```

#### 成员的读取与修改

点运算符左右两边一组合，就是一个**普通变量**：`stu.score` 的类型是 `double`，能读能写，用法和单独的 `double` 变量没有区别。所以修改结构体不需要整体重写——想改成绩只写 `stu.score = 82.0;`，其它成员原封不动。这也是结构体比"一堆散装变量"好用的地方：所有改动的入口都写着同一个变量名。

### 结构体嵌套

结构体的成员可以是另一个结构体，这就是**结构体嵌套**。它让"一个学生有地址、地址包含城市和街道"这样的包含关系在类型层面被表达出来，而不是只写在注释里。

#### 嵌套结构体成员

先定义好 `Address`，再把它当成普通成员类型写进 `Student` 里：

```cpp
#include <iostream>
#include <string>
using namespace std;

struct Address {
    string city;
    string street;
};

struct Student {
    string name;
    int age;
    Address addr;          // 嵌套另一个结构体
};

int main() {
    Student stu;
    stu.name = "张三";
    stu.age = 18;
    stu.addr.city = "温州";      // 多层点运算符访问嵌套成员
    stu.addr.street = "茶山街道";

    cout << stu.name << " 住在 "
         << stu.addr.city << stu.addr.street << endl;
    return 0;
}
```

#### 多层点运算符

嵌套成员的访问靠**多层点运算符**从左到右逐层深入：`stu.addr` 先取出 `Student` 里的那个 `Address` 结构体，再对它用一次 `.city` 取出城市名，合起来就是 `stu.addr.city`。有几层嵌套就写几个点，中间不能跳层——不存在 `stu.city` 这种写法。

## 结构体数组

单个结构体变量只能描述一个学生、一条图书信息。要表示"全班 40 个学生"或者一份书目清单，就需要**结构体数组**——数组的每个元素本身就是一个结构体。它没有引入新语法，只是把两件已经会的事叠起来用：先用下标取出元素，再用点运算符取出成员。

### 定义与初始化

定义一个结构体数组有两种方式。下面这个程序把两种方式并排写在一起，`arr1` 和 `arr2` 的内容完全一样：

```cpp
#include <iostream>
#include <string>
using namespace std;

struct Student {
    string name;
    int age;
    double score;
};

int main() {
    // 方式 1：创建数组后逐个赋值
    Student arr1[3];
    arr1[0] = {"张三", 18, 95.5};
    arr1[1] = {"李四", 19, 88.0};
    arr1[2] = {"王五", 20, 76.5};

    // 方式 2：定义时整体初始化（推荐）
    Student arr2[3] = {
        {"张三", 18, 95.5},
        {"李四", 19, 88.0},
        {"王五", 20, 76.5}
    };

    return 0;
}
```

#### 逐个元素赋值

先声明数组，再给每个元素单独赋值。单看 `arr1[0] = {"张三", 18, 95.5};` 这一行，它其实就是把整体初始化的写法用在了数组元素上。数据要等到运行期才能拿到时只能这么做，写起来啰嗦一些，但能配合循环和输入使用。

#### 整体初始化

在定义数组的同时用**嵌套花括号**一次写完：外层括号对应数组，每一组内层括号对应一个结构体元素。数据有几条、每条的各成员怎么对应，都被摆在眼前，读代码的人一眼就能数出有几个学生，因此是推荐写法。

### 遍历结构体数组

遍历的逻辑和普通数组完全一致，区别只在取到元素之后：元素本身是一个结构体，还要再用点运算符取出成员。

```cpp
#include <iostream>
#include <string>
using namespace std;

struct Student {
    string name;
    int age;
    double score;
};

int main() {
    Student arr[3] = {
        {"张三", 18, 95.5},
        {"李四", 19, 88.0},
        {"王五", 20, 76.5}
    };
    int len = sizeof(arr) / sizeof(arr[0]);

    for (int i = 0; i < len; i++) {
        cout << "姓名：" << arr[i].name
             << " 年龄：" << arr[i].age
             << " 成绩：" << arr[i].score << endl;
    }
    return 0;
}
```

程序输出：

```
姓名：张三 年龄：18 成绩：95.5
姓名：李四 年龄：19 成绩：88
姓名：王五 年龄：20 成绩：76.5
```

语法拆解：`arr[i]` 取出第 `i` 个元素（类型是 `Student`），`.name` 再访问这个结构体的 `name` 成员。整段逻辑和遍历一个 `int` 数组没有区别——只不过每个元素不是一个整数，而是一个复杂的结构体。

> **易错点**：结构体数组的数组名在表达式中会退化为**指向结构体的指针**（`Student*`）。因此 `arr[i]` 等价于 `*(arr + i)`，`arr[i].name` 等价于 `(arr + i)->name`；而 `sizeof(arr)` 给出的是整个数组的字节数（元素个数 × 每个结构体的大小），不是指针长度——`int len = sizeof(arr) / sizeof(arr[0]);` 正是利用了这一点。

## 结构体指针

结构体是自定义类型，自然也可以有指向它的指针。这一节回答三个问题：结构体指针怎么定义与初始化、怎么通过指针修改成员、怎么用指针遍历结构体数组。核心是一条语法糖——`->` 箭头运算符。

### 定义与初始化

`Student* p = &stu;` 就得到了指向 `stu` 的指针。访问 `p` 所指结构体的成员有两种等价写法，下面这段程序把两种都写了出来：

```cpp
#include <iostream>
#include <string>
using namespace std;

struct Student {
    string name;
    int age;
    double score;
};

int main() {
    Student stu = {"张三", 18, 95.5};

    // 定义结构体指针，指向 stu
    Student* p = &stu;

    // 通过指针访问成员——两种等价写法
    cout << "姓名：" << (*p).name << endl;    // 先解引用，再 . 访问
    cout << "姓名：" << p->name << endl;      // 用 -> 直接访问（推荐）

    return 0;
}
```

#### 解引用访问成员

`p` 是指向 `Student` 的指针，`*p` 就是它所指向的那个结构体，所以 `(*p).name` 的含义是"先解引用拿到整个结构体，再取它的 `name` 成员"。括号不能省：`*` 的优先级低于 `.`，写成 `*p.name` 会被解释成 `*(p.name)`，而指针本身没有 `name` 成员，直接报错。

#### 箭头运算符

`p->name` 与 `(*p).name` **完全等价**，`->` 把"解引用 + 成员访问"两步合并成一个运算符，既省掉了括号，也彻底消除了优先级写错的可能，所以实际代码里一律用 `->`。

> **易错点**：`.` 用于通过**变量名**访问成员（`stu.name`），`->` 用于通过**指针**访问成员（`p->name`），两者不能互换——`p.name` 和 `stu->name` 都是编译错误。该用哪个只看左边：左边是结构体变量就用点，左边是指针就用箭头。

### 通过指针修改成员

指针一旦指向某个结构体，就能改它里面的成员，改法和基本类型指针一模一样：

```cpp
#include <iostream>
#include <string>
using namespace std;

struct Student {
    string name;
    int age;
    double score;
};

int main() {
    Student stu = {"张三", 18, 95.5};
    Student* p = &stu;

    p->score = 100;              // 通过指针修改成绩（等价于 stu.score = 100）
    cout << stu.score << endl;   // 输出 100
    return 0;
}
```

这和对基本类型指针的操作本质相同——`*p = 20` 改的是 `p` 指向的那个 `int`，`p->score = 100` 改的是 `p` 指向的那个结构体里的 `score`。对结构体指针解引用，得到的是**整个结构体**，它的任意成员都可以读、可以写。

### 结构体指针与数组

结构体数组也能用指针遍历，而且写法比下标遍历更短：

```cpp
#include <iostream>
#include <string>
using namespace std;

struct Student {
    string name;
    int age;
    double score;
};

int main() {
    Student arr[3] = {
        {"张三", 18, 95.5},
        {"李四", 19, 88.0},
        {"王五", 20, 76.5}
    };
    int len = sizeof(arr) / sizeof(arr[0]);

    // 用指针遍历结构体数组
    for (Student* p = arr; p < arr + len; p++) {
        cout << p->name << " " << p->score << endl;
    }
    return 0;
}
```

#### 指针遍历数组

数组名 `arr` 在表达式中退化为指向首元素的 `Student*`，所以可以直接用 `Student* p = arr` 起手，配合 `p < arr + len` 控制边界，循环体里用 `p->成员` 取数据。整个循环没有任何下标运算。

#### 指针移动步长

每次 `p++` 都让指针移动到下一个结构体元素的起始地址——步长是**整个 `Student` 结构体的大小**（所有成员占用的字节数之和），由编译器按类型自动计算。这和 `int*` 的 `p++` 每次走 4 字节是同一套规则，只是这里跨过的是一整个结构体。

## 结构体与函数

结构体作为函数参数，和普通变量一样有**值传递**与**地址传递**两条路。这个选择在结构体上比在 `int` 上重要得多：结构体通常包含多个成员，可能占几十上百字节，而地址永远是 4 或 8 字节。这一节把三种写法（值传递、地址传递、`const` 地址传递）放在一起对比，并给出选择规则。

### 值传递

值传递把整个结构体**复制一份**传给函数：函数里的形参是一个副本，改它不影响外面的实参。语法上传递结构体和传递普通变量完全一样：

```cpp
#include <iostream>
#include <string>
using namespace std;

struct Student {
    string name;
    int age;
    double score;
};

// 值传递：函数内修改不影响外部
void printStudent(Student stu) {
    stu.age = 28;                          // 改的是副本
    cout << "函数内 姓名：" << stu.name
         << " 年龄：" << stu.age
         << " 成绩：" << stu.score << endl;
}

int main() {
    Student stu = {"张三", 18, 95.5};
    printStudent(stu);
    cout << "函数外 年龄：" << stu.age << endl;   // 仍然是 18
    return 0;
}
```

> **缺点**：如果结构体体积较大（成员多、包含数组或嵌套结构体），值传递会复制整个结构体，时间和内存开销都不小。

### 地址传递

地址传递只传结构体的**地址**（4 或 8 字节），不复制整份数据——省空间、省时间，而且能改到实参：

```cpp
#include <iostream>
#include <string>
using namespace std;

struct Student {
    string name;
    int age;
    double score;
};

// 地址传递：能修改实参，且不复制整个结构体
void modifyStudent(Student* stu) {
    stu->age = 28;                         // 通过 -> 修改实参的成员
    stu->score = 100;
}

int main() {
    Student stu = {"张三", 18, 95.5};
    modifyStudent(&stu);                   // 传入地址
    cout << "年龄：" << stu.age << endl;   // 28（已修改）
    cout << "成绩：" << stu.score << endl; // 100（已修改）
    return 0;
}
```

> **推荐**：结构体作为函数参数时**优先使用地址传递**——代价小、能力全。如果函数不需要修改实参，就加上 `const` 修饰（见下一节），既保住效率，又拿回值传递的安全性。

### const 修饰结构体指针

在指针参数前加 `const`，函数内部就只能读、不能改结构体的成员。这是 C++ 里最实用的"防误操作"模式：既享受地址传递的效率，又得到值传递的安全性。

```cpp
#include <iostream>
#include <string>
using namespace std;

struct Student {
    string name;
    int age;
    double score;
};

// const 修饰：只读——不能修改，但也不会复制整个结构体
void showStudent(const Student* stu) {
    cout << "姓名：" << stu->name
         << " 年龄：" << stu->age
         << " 成绩：" << stu->score << endl;

    // stu->age = 30;       // ❌ 错误！const 修饰后不可修改成员
}

int main() {
    Student stu = {"张三", 18, 95.5};
    showStudent(&stu);       // 传入地址，但函数内无法修改
    return 0;
}
```

三种方式的差别可以并排对照：

| 传递方式 | 能修改实参？ | 复制开销 | 安全性 | 推荐场景 |
| :--- | :---: | :---: | :---: | :--- |
| 值传递 `(Student stu)` | ❌ | 大（复制整个结构体） | ✅ 安全 | 结构体很小（只有 1～2 个成员） |
| 地址传递 `(Student* stu)` | ✅ | 小（仅 4/8 字节） | ⚠️ 可能误改 | 需要修改实参 |
| `const` 地址传递 `(const Student* stu)` | ❌ | 小（仅 4/8 字节） | ✅ 安全 | **推荐**：只读、体积大、不修改 |

> **易错点**：三种方式不要凭感觉选，按规则走——只读就传 `const Student*`，需要修改就传 `Student*`，只有成员很少（一两个小成员）时才用值传递。最要避免的是把一个大结构体按值传进去：复制 100 个成员和复制 4 字节的地址，性能差距是实打实的。

> **例 1（英雄排序）** 设计一个英雄结构体（姓名、年龄、性别），创建包含 5 名英雄的数组，通过冒泡排序按年龄升序排列，并打印排序结果。

**思路**：结构体之间不能直接用 `>` 比较——必须先指定按哪个成员排序，所以冒泡排序的比较条件写成 `arr[j].age > arr[j + 1].age`，交换的是整个结构体。排序要改动原数组，用地址传递；打印只读，用 `const` 指针。

**解**：

```cpp
#include <iostream>
#include <string>
using namespace std;

struct Hero {
    string name;
    int age;
    string gender;
};

// 按年龄冒泡排序（地址传递——直接修改原数组）
void bubbleSort(Hero arr[], int len) {
    for (int i = 0; i < len - 1; i++) {
        for (int j = 0; j < len - 1 - i; j++) {
            if (arr[j].age > arr[j + 1].age) {
                Hero temp = arr[j];           // 交换整个结构体
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}

// 打印英雄列表（const 指针——只读）
void printHeros(const Hero* arr, int len) {
    for (int i = 0; i < len; i++) {
        cout << arr[i].name << " "
             << arr[i].gender << " "
             << arr[i].age << "岁" << endl;
    }
}

int main() {
    Hero heros[5] = {
        {"刘备", 23, "男"},
        {"关羽", 22, "男"},
        {"张飞", 20, "男"},
        {"赵云", 21, "男"},
        {"貂蝉", 19, "女"}
    };
    int len = sizeof(heros) / sizeof(heros[0]);

    bubbleSort(heros, len);
    printHeros(heros, len);
    return 0;
}
```

程序输出：

```
貂蝉 女 19岁
张飞 男 20岁
赵云 男 21岁
关羽 男 22岁
刘备 男 23岁
```

**评注**：这个例子把本章的四个知识点串成了一条链——结构体定义、结构体数组、结构体指针（数组名 `arr` 作为函数参数退化为 `Hero*`）、结构体与函数（地址传递 + `const` 修饰）。`bubbleSort` 里交换的是**整个结构体**（`Hero temp = arr[j]`），写法和之前交换两个 `int` 完全一样，只是每个元素从 4 字节变成了几十字节。`printHeros` 用 `const Hero*` 是一种工程习惯——告诉调用者"放心把数据交给我，我不会改它"，这种"只读接口"是契约式编程的雏形。

### 结构体与 sort 排序

上一节的英雄排序用的是手写冒泡排序。实际开发中，标准库提供了更高效的 `sort()`（需要 `<algorithm>` 头文件），但 `sort()` 必须先知道两个结构体谁大谁小——结构体有多个成员，按哪个排？答案是为结构体定义一条**比较规则**，这是**运算符重载**的入门场景。

#### 定义比较规则

`sort()` 默认用 `<` 比较元素，只要让 `Student` 自己说明"小于"是什么意思，`sort()` 就能按指定成员排序。写法是在结构体里加一个成员函数 `operator<`：

```cpp
#include <iostream>
#include <string>
#include <algorithm>    // sort 函数
using namespace std;

struct Student {
    string name;
    int id;            // 学号
    double score;

    // 运算符重载：定义"小于"的意思——按成绩升序
    bool operator<(const Student& other) const {
        return score < other.score;
    }
};

int main() {
    Student arr[5] = {
        {"张三", 1001, 85.5},
        {"李四", 1002, 92.0},
        {"王五", 1003, 78.5},
        {"赵六", 1004, 88.0},
        {"孙七", 1005, 95.5}
    };
    int len = sizeof(arr) / sizeof(arr[0]);

    sort(arr, arr + len);              // 直接使用 sort！按 score 升序

    for (int i = 0; i < len; i++) {
        cout << arr[i].name << " "
             << arr[i].id << " "
             << arr[i].score << endl;
    }
    return 0;
}
```

程序输出（按成绩升序）：

```
王五 1003 78.5
张三 1001 85.5
赵六 1004 88
李四 1002 92
孙七 1005 95.5
```

现阶段可以把 `bool operator<(const Student& other) const` 当成一个固定签名来用：`other` 是参与比较的另一个结构体，函数体里写清"哪个成员小就算谁小"即可。签名里的 `const` 与 `&` 的用意，留到讲引用与运算符重载时再展开。

#### 更换排序成员

要换排序依据，只改 `operator<` 里的那一行：写成 `return id < other.id;` 就按学号升序；把 `<` 换成 `>` 就按成绩降序。`sort(arr, arr + len);` 这一句一个字都不用动——排序流程和比较规则被彻底分开了，这正是运算符重载的价值所在。

## 小结

1. 结构体把**类型不同**的数据打包成一个自定义复合类型；定义它只是创造类型、不分配内存，末尾的分号不能省。
2. C++ 中创建变量写 `Student stu;` 即可，既不需要 `struct` 也不需要 `typedef`；`typedef struct` 是 C 的习惯，读旧代码要能看懂，写新代码不必模仿。
3. 成员用点运算符访问，嵌套结构体用多层点运算符逐层深入；同类型结构体变量可以直接赋值，但那是**浅拷贝**，含指针成员时危险。
4. 结构体数组的每个元素是一个完整结构体，`arr[i].成员` 与普通数组的遍历逻辑一致，数组名在表达式中退化为指向结构体的指针。
5. `p->name` 与 `(*p).name` 完全等价，`->` 把解引用与成员访问合成一个运算符，同时免掉了括号和优先级问题。
6. 结构体传参的取舍是：只读用 `const Student*`，需要修改用 `Student*`，成员很少时才用值传递；大结构体按值传递会白白复制一份数据。
7. 手写冒泡排序按指定成员比较；交给 `sort()` 则要先为结构体定义"小于"的含义（`operator<`），换成员或换升降序只改这一处。
