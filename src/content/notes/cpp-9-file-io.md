---
title: C++程序设计基础-9 文件操作与重定向
description: 用文件流把数据写进磁盘再读回来，文本与二进制两种格式怎么选，以及 freopen 重定向为什么能生效。
category: 计算机科学
subject: 计算机科学
subfield: C++程序设计基础
topic: C++文件操作
difficulty: 基础
date: "2026-10-03"
tags: [C++, 文件操作, fstream, 文本文件, 二进制文件, 重定向, freopen]
draft: false
featured: false
---

## 文件操作与文本文件

到目前为止，程序处理的所有数据都是"用完即焚"的：键盘输入、内存计算、屏幕输出，程序一关闭就消失得无影无踪。需要长期保留的数据必须**持久化**（Persistence）到磁盘上——游戏存档、文档、日志都属于这一类，而 C++ 完成这件事的工具是**文件流**（File Stream）。

文件流几乎没有带来新语法，这是它最好上手的地方。`ifstream`/`ofstream` 与 `cin`/`cout` 出自同一套类体系，`ofs << x` 和 `cout << x` 的写法完全一样，变化的只是流连接的目标从屏幕、键盘换成了文件。

### 文件流基础

C++ 提供三个核心文件流类。它们与 `iostream` 里的 `cin`、`cout` 同源，因此接口风格一致，区别只在方向和默认行为：

| 类 | 全称 | 用途 | 默认模式 |
| :--- | :--- | :--- | :--- |
| `ofstream` | Output File Stream | **写**文件——将数据从程序输出到文件 | `ios::out` |
| `ifstream` | Input File Stream | **读**文件——从文件读取数据到程序 | `ios::in` |
| `fstream` | File Stream | **读写**文件——既可读也可写 | 需手动指定模式 |

#### 输出文件流 ofstream

`ofstream` 负责把程序里的数据写到文件，默认模式是 `ios::out`。它在文件流中的角色相当于 `cout`：`ofs << "姓名：张三"` 与 `cout << "姓名：张三"` 语法完全相同，只是数据流向的是文件而不是屏幕。

`ofstream` 打开一个已存在的文件时，原有内容会被清空——这是默认模式里截断语义的结果，所以在同一个路径上重复运行程序，看到的永远是最后一次写进去的内容。

#### 输入文件流 ifstream

`ifstream` 负责从文件读数据，默认模式是 `ios::in`，角色相当于 `cin`。凡是能在 `cin` 上用的读取方式——`>>`、`getline`、`get`——在 `ifs` 上同样可用。这正是文件读取容易上手的原因：真正需要新学的只有"打开"和"检查打开是否成功"两件事。

#### 读写文件流 fstream

`fstream` 同时具备读写能力，也因此**没有默认模式**。`fstream fs("data.txt");` 既不读也不写，必须显式给出 `ios::in`、`ios::out` 之类的标志位才能工作。只有需要在同一个文件上既读又写时才有必要用它，否则 `ifstream` 与 `ofstream` 更不容易出错。

> **注意**：三个类都由头文件 `<fstream>` 提供。文件操作的程序通常同时包含 `<iostream>` 与 `<fstream>`，少了后者，编译器会直接报 `ofstream` 未定义。

### 写文本文件

写文件是一条固定的五步流程：**包含头文件 → 创建输出流对象 → 打开文件 → 写入数据 → 关闭文件**。五步里只有第三步是文件操作独有的，第四步的写入语法与 `cout` 一模一样：

```cpp
#include <iostream>
#include <fstream>           // ① 包含头文件
using namespace std;

int main() {
    // ② 创建输出流对象
    ofstream ofs;

    // ③ 打开文件（指定路径和打开方式）
    ofs.open("student.txt", ios::out);

    // ④ 写入数据——语法和 cout 完全一样
    ofs << "姓名：张三" << endl;
    ofs << "性别：男" << endl;
    ofs << "年龄：18" << endl;

    // ⑤ 关闭文件
    ofs.close();

    cout << "文件写入完成" << endl;
    return 0;
}
```

程序运行后，当前目录下会生成 `student.txt`，内容为：

```
姓名：张三
性别：男
年龄：18
```

创建对象与打开文件也可以合并成一步，把文件名和模式直接交给构造函数：`ofstream ofs("student.txt", ios::out);`。

#### 打开方式与组合

打开方式由 `ios::` 前缀的标志位指定，需要多个条件时用 `|`（按位或）组合：

| 打开方式 | 含义 |
| :--- | :--- |
| `ios::in` | 以**读取**方式打开文件 |
| `ios::out` | 以**写入**方式打开文件 |
| `ios::ate` | 打开文件后，初始位置定位到**文件末尾** |
| `ios::app` | **追加**模式——所有写入操作在文件末尾追加，不会覆盖原有内容 |
| `ios::trunc` | 如果文件已存在，打开时**先清空**原内容（`ofstream` 的 `ios::out` 默认带上它） |
| `ios::binary` | 以**二进制**方式打开（见下文的二进制文件） |

最常见的几种组合：

```cpp
ofstream ofs1("file.txt", ios::out);                // 普通写入（覆盖原内容）
ofstream ofs2("file.txt", ios::app);                // 追加写入（保留原内容）
ofstream ofs3("file.txt", ios::out | ios::binary);  // 二进制写入
ifstream ifs("file.txt", ios::in);                  // 普通读取
```

> **易错点**：`ios::out` 与 `ios::app` 的差别不在"能不能写"，而在**从哪里写**。`ios::out` 会先清空原有内容、再从文件开头写；`ios::app` 把写入位置固定到文件末尾，原有内容全部保留、新内容追加在后面。想覆盖旧数据用 `out`，想保留历史记录用 `app`——写反了就是一次无声的数据丢失。

#### 显式关闭文件

**结论是：文件用完就调用 `close()`。** 流对象在析构时确实会自动关闭文件，但那一刻通常已经太晚——析构发生在对象生命周期结束的时候（多数场合是 `main` 返回），而读同一个文件的代码往往就在关闭之后的几行里。

`close()` 完成两件事：把流缓冲区里还没落盘的数据真正写进文件，并把文件句柄交还给操作系统。对紧随其后的读取来说，这两件事都是前提。

> **易错点**：文件明明存在却读不到数据，按顺序查三处：① 有没有检查 `is_open()`（文件不存在或路径拼错时，读取会静默失败）；② 写完有没有先 `close()` 就去读（缓冲区数据尚未写入磁盘）；③ 文件是否被其他程序占用。**先查 `is_open()`，再查路径拼写**，这两条覆盖了绝大多数情况。

### 读文本文件

读文件与写文件对称，同样是五步：包含头文件 → 创建输入流对象 → 打开文件 → **判断是否打开成功** → 读取数据。多出来的那一步是文件读取里最容易被跳过的一环，也是"程序不报错却没有输出"这类问题的根源：

```cpp
#include <iostream>
#include <fstream>
#include <string>
using namespace std;

int main() {
    ifstream ifs;
    ifs.open("student.txt", ios::in);

    // 关键步骤：判断文件是否成功打开
    if (!ifs.is_open()) {
        cout << "文件打开失败！" << endl;
        return 1;
    }

    // ──────────── 四种读取方式 ────────────

    // 方式一：逐词读取（>> 遇到空格/换行停止）
    // char buf[1024] = {0};
    // while (ifs >> buf) {
    //     cout << buf << endl;
    // }

    // 方式二：逐行读取（成员函数 getline）
    // char buf[1024] = {0};
    // while (ifs.getline(buf, sizeof(buf))) {
    //     cout << buf << endl;
    // }

    // 方式三：逐行读取（全局函数 getline，配合 C++ string——推荐）
    string buf;
    while (getline(ifs, buf)) {
        cout << buf << endl;
    }

    // 方式四：逐字符读取
    // char c;
    // while ((c = ifs.get()) != EOF) {
    //     cout << c;
    // }

    ifs.close();
    return 0;
}
```

#### 打开是否成功

`is_open()` 返回一个布尔值，文件被成功关联到流上时为 `true`。它检查的不是"文件里的数据对不对"，而是"这个文件到底有没有被打开"：文件不存在、路径写错、没有读取权限，都会让它返回 `false`，而后续的读取不会抛异常，只会安静地什么都不做。打开之后立刻判断，是文件读取的第一条纪律。

#### 四种读取方式

四种方式覆盖不同的数据形态，选择标准只有一条：**数据是不是以空白分隔的**。

| 方式 | 函数 | 适用场景 |
| :--- | :--- | :--- |
| `>>` 逐词 | `ifs >> buf` | 读取以空白分隔的单词或数字（遇到空格/换行停止） |
| `getline` 成员 | `ifs.getline(buf, size)` | C 风格字符数组，按行读取 |
| `getline` 全局 | `getline(ifs, str)` | **推荐**——配合 C++ `string`，读取一整行（含空格） |
| `get` 逐字符 | `ifs.get()` | 逐字符处理，返回 `EOF` 表示文件结束 |

要按行读、且行内可能含空格时，只有 `getline` 可用——`>>` 会在第一个空格处停下。四种方式都返回流对象或 `EOF`，因此可以**直接作为循环条件**：读取失败时条件自然为假，循环退出，不需要额外判断。

> **易错点**：不要用 `while (!ifs.eof())` 做读取循环。`eof()` 只有在**已经尝试读取并撞到文件末尾之后**才返回 `true`，它不会在即将到末尾时提前预警；如果文件最后一行有数据但没有换行符，这种写法会让最后一行被处理两次。把读取操作本身写进循环条件——`while (ifs >> data)` 或 `while (getline(ifs, str))`——才是可靠的写法。

> **例 1（学生成绩管理：读写文件综合）** 编写程序，将三名学生的姓名和成绩写入 `scores.txt`（每行格式：`姓名 成绩`），然后再从文件中读取数据，计算并输出平均分。

**思路**：分两步。第一步用 `ofstream` 写入三行数据，每行由"姓名 + 空格 + 成绩"组成；第二步用 `ifstream` 打开同一个文件，循环用 `ifs >> name >> score` 连续提取姓名和成绩——`>>` 会自动跳过空格与换行，正好适配这种以空白分隔的行内格式，读到文件末尾时循环条件为假，循环自然结束。平均分要用 `double` 计算，否则整数除法会把小数部分截掉。

**解**：

```cpp
#include <iostream>
#include <fstream>
#include <string>
using namespace std;

int main() {
    // ─── 第一步：写入文件 ───
    ofstream ofs("scores.txt", ios::out);
    ofs << "张三 85" << endl;
    ofs << "李四 92" << endl;
    ofs << "王五 78" << endl;
    ofs.close();

    // ─── 第二步：读取文件并计算平均分 ───
    ifstream ifs("scores.txt", ios::in);
    if (!ifs.is_open()) {
        cout << "文件打开失败！" << endl;
        return 1;
    }

    string name;
    int score;
    int sum = 0, count = 0;

    while (ifs >> name >> score) {       // 连续提取姓名（字符串）和成绩（整数）
        cout << name << "：" << score << "分" << endl;
        sum += score;
        count++;
    }
    ifs.close();

    cout << "平均分：" << (double)sum / count << endl;
    return 0;
}
```

程序输出：

```
张三：85分
李四：92分
王五：78分
平均分：85
```

**评注**：这个例子展示了文件操作最实用的模式——写用 `ofs <<`、读用 `ifs >>`，语法与 `cout`、`cin` 一一对应，所以文件操作的成本几乎全在"打开方式""状态检查"这些附加环节上。另外注意第一步结束时调用了 `ofs.close()`，第二步才读得到完整内容；本例用 `>>` 而不是 `getline`，是因为每行里的姓名与成绩本来就以空格分隔。

## 二进制文件

文本文件把数字当字符存：`123` 落盘是 `'1'`、`'2'`、`'3'` 三个字节。二进制文件则把内存中的字节序列原样搬进文件——`int a = 123;` 写下去就是 4 个字节的二进制表示。**结论先给出：需要人读、需要跨程序交换的用文本；需要精确还原内存结构、追求速度和体积的用二进制。** 二进制文件用记事本打开是乱码，但它读写更快、占用更小，适合结构体、图片、音频这类非文本数据。读写二进制靠 `write()` 与 `read()` 这对函数，参数都是"内存地址 + 字节数"。

### 二进制写文件

二进制写入用 `ostream::write()`，第一个参数是数据的内存起始地址，第二个是要写入的字节数：

```cpp
#include <iostream>
#include <fstream>
using namespace std;

class Person {
public:
    char m_name[64];         // 注意：二进制写入不能用 C++ string——那是动态长度的
    int m_age;
};

int main() {
    // 打开二进制输出流（ios::binary 不可省略）
    ofstream ofs("person.dat", ios::out | ios::binary);

    Person p = {"张三", 18};

    // write(数据的起始地址, 要写入的字节数)
    ofs.write((const char*)&p, sizeof(p));

    ofs.close();
    cout << "二进制文件写入完成" << endl;
    return 0;
}
```

`&p` 给出对象在内存中的起始地址，`sizeof(p)` 给出整个对象的字节数——`write()` 从那个地址往后取这么多字节，原样写进文件。写完以后，`person.dat` 里的内容就是 `Person` 对象在内存中的那一段字节。结构体的内存布局与成员对齐见 C++程序设计基础-7 结构体。

#### write 的地址转换

`write()` 的形参类型是 `const char*`：它只认字节，不认类型。所以传结构体地址时必须写成 `(const char*)&p`——`&p` 的类型是 `Person*`，编译器不会自动把它转成 `const char*`，这个强制转换是在告诉编译器"接下来按字节处理这块内存"。读回来时对称地用 `(char*)&p` 转回去。

#### 二进制模式不可省略

`ios::out | ios::binary` 里的 `ios::binary` 不是可有可无的修饰。在 Windows 下，文本模式会把写出的 `\n` 自动翻译成 `\r\n`，读入时再翻译回来——这对文本文件是贴心设计，对二进制数据却是**篡改**：一个值为 `0x0A` 的字节会被凭空多插进一个 `0x0D`，文件的长度和内容都不再等于内存里的那段字节。

#### 成员的定长要求

二进制写入还要求结构体的每个成员**长度固定**，所以上面的例子用 `char m_name[64]` 而不是 `string`。`string` 对象内部用指针管理堆上的字符数组，`write(&p, sizeof(p))` 写下去的只是那个指针的值，而不是字符串内容。

> **易错点**：结构体成员用了 `string`，二进制文件读回来必然是乱码——写进去的是指针地址，读回来时它指向的内存可能已经释放，或已经换成了别的数据。需要存字符串时改用定长字符数组（例如 `char name[64]`），或者把 `string` 的内容单独序列化后再写。

### 二进制读文件

`istream::read()` 与 `write()` 完全对称：第一个参数是接收数据的内存地址，第二个是要读取的字节数。

```cpp
#include <iostream>
#include <fstream>
using namespace std;

class Person {
public:
    char m_name[64];
    int m_age;
};

int main() {
    ifstream ifs("person.dat", ios::in | ios::binary);
    if (!ifs.is_open()) {
        cout << "文件打开失败！" << endl;
        return 1;
    }

    Person p;
    // read(读取到的数据存放地址, 要读取的字节数)
    ifs.read((char*)&p, sizeof(p));

    cout << "姓名：" << p.m_name << endl;
    cout << "年龄：" << p.m_age << endl;

    ifs.close();
    return 0;
}
```

程序输出：

```
姓名：张三
年龄：18
```

#### read 与 write 的对称

`write` 把内存搬到文件，`read` 把文件搬回内存，两者都只认"地址 + 字节数"，因此**字节数必须一致**：写的时候用 `sizeof(p)`，读的时候也要用 `sizeof(p)`。这里直接用 `sizeof(p)` 而不逐个成员去拼，正是为了让读写双方的布局假设完全相同——隐藏的前提只有一个：两侧的 `Person` 定义必须一模一样。

### 二进制与文本文件的对比

两种格式的全部差异都可以归结为**存的是字符还是字节**，其余差别都是这一条的推论：

| 维度 | 文本文件 | 二进制文件 |
| :--- | :--- | :--- |
| **可读性** | ✅ 人类可直接阅读（用记事本打开） | ❌ 人类不可读（乱码） |
| **写入方式** | `<<`（和 `cout` 语法一致） | `write(地址, 字节数)` |
| **读取方式** | `>>` / `getline`（和 `cin` 语法一致） | `read(地址, 字节数)` |
| **存储效率** | 较低（数字 123 占 3 字节） | 较高（数字 123 只占 4 字节的完整 `int`） |
| **适用场景** | 配置文件、日志、源代码 | 结构体序列化、图片、音频、存档数据 |

选择原则只有一句话：**需要人类直接阅读或编辑的用文本文件，需要高效存储、精确还原内存结构的用二进制文件。**

## 重定向

程序默认从键盘读、向屏幕写，但批量处理和算法竞赛的输入数据往往预先放在文件里，输出也要写进文件。**重定向**（Redirection）解决的就是这个问题：**不改动任何一行输入输出代码，直接让 `cin` 从文件读、让 `cout` 向文件写。**

它的价值在于省掉"替换全部输入输出"这件事。如果程序里有几十处 `cin`/`cout`，逐个换成 `ifs`/`ofs` 既枯燥又容易漏，而重定向只在程序开头加两行。

### freopen 重定向

`freopen` 是 C 标准库 `<cstdio>` 中的函数，作用是把一个已打开的流**重新关联**到另一个文件上。重定向 `stdin` 与 `stdout` 之后，程序里所有的 `cin`/`scanf`、`cout`/`printf` 都自动指向文件，而不是键盘与屏幕：

```cpp
#include <iostream>
#include <cstdio>         // freopen 需要此头文件
using namespace std;

int main() {
    // 将标准输入重定向到 input.txt
    freopen("input.txt", "r", stdin);
    // 将标准输出重定向到 output.txt
    freopen("output.txt", "w", stdout);

    // 下面的代码完全不用改——cin 自动从 input.txt 读取，cout 自动写入 output.txt
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;

    return 0;
}
```

#### 三个参数

`freopen` 的三个参数各司其职：

| 参数 | 含义 |
| :--- | :--- |
| 第一个 | 文件名 |
| 第二个 | 打开方式——`"r"` 只读、`"w"` 只写、`"a"` 追加 |
| 第三个 | 要重定向的流——`stdin`（标准输入）、`stdout`（标准输出）、`stderr`（标准错误） |

算法竞赛里最典型的用法是本地调试：把测试数据放进 `input.txt`，在程序开头加一行 `freopen("input.txt", "r", stdin);`，之后运行程序就不必每次手敲测试数据。

#### 条件编译开关

每次都手动注释、取消注释 `freopen` 既麻烦又容易遗忘，更稳的做法是用在线评测系统预定义的宏 `ONLINE_JUDGE` 做**条件编译**——只在本地启用重定向，提交后自动跳过：

```cpp
#include <iostream>
#include <cstdio>
using namespace std;

int main() {
    // 只在本地运行时重定向——提交到 OJ 时这三行自动消失
    #ifndef ONLINE_JUDGE
        freopen("input.txt", "r", stdin);
        freopen("output.txt", "w", stdout);
    #endif

    // 下面的业务代码完全不用动
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}
```

主流的 C++ 在线评测系统（洛谷、Codeforces、AcWing、POJ 等）在编译提交的代码时，都会自动定义宏 `ONLINE_JUDGE`。`#ifndef ONLINE_JUDGE` 的意思是"如果没有定义 `ONLINE_JUDGE`"：本地编译时这个宏不存在，`freopen` 生效；提交之后宏已经定义，`#ifndef` 到 `#endif` 之间的代码被预处理器**直接删除**，根本不会进入编译。这样提交前就不需要再改任何一行。

### 重定向的底层原理

重定向之所以能不碰业务代码，是因为标准流与文件流本来就是同一套类体系里的对象。

#### 流类的继承体系

```
ios_base
  └── ios
        ├── istream ── ifstream    文件输入流
        ├── ostream ── ofstream    文件输出流
        └── iostream ── fstream    文件输入输出流（iostream 由 istream 与 ostream 共同派生）

cin 是 istream 对象，cout 是 ostream 对象——它们与文件流共用同一套基类
```

`freopen` 做的事情，就是把 `stdin`/`stdout` 底层关联的文件描述符从键盘、屏幕换成你指定的文件。此后 `cin >>` 与 `cout <<` 的数据流向自动改变，而调用它们的代码一个字都不用改。

### 两种方案的选择

**结论：竞赛调试与批量处理用 `freopen`，工程代码用文件流对象。** 两者的取舍标准是"要不要精确控制每一个数据来源"：

| 方案 | 适用场景 | 优点 | 缺点 |
| :--- | :--- | :--- | :--- |
| **`freopen` 重定向** | 竞赛调试、批量处理——需要用文件替代全部输入输出 | 不改业务代码，仅在开头加两行 | 不灵活——所有 `cin`/`cout` 都被重定向，不能"部分从键盘、部分从文件" |
| **直接使用文件流** | 需要同时操作多个文件或文件与键盘混合输入 | 精确控制每个输入输出的数据源 | 需要区分 `cin` 和 `ifs`、`cout` 和 `ofs` |

> **易错点**：`freopen` 修改的是**全局状态**——重定向之后，程序里任何一处 `cin`/`cout` 都跟着改变，无法只让某几次输入改走文件。因此它适合"整体替换输入输出"的场景（本地调试、批量处理），不适合夹在主逻辑中间做局部读写。需要同时操作多个文件、或让文件与键盘混用时，改用 `ifstream`/`ofstream` 对象，数据源在代码里一目了然。

## 小结

1. 文件流是数据持久化的手段，`ofstream` 负责写、`ifstream` 负责读、`fstream` 二者兼具，它们与 `cin`/`cout` 同源，所以 `<<` 与 `>>` 的用法完全一致。
2. 写文件是"包含头文件 → 创建对象 → 打开 → 写入 → 关闭"五步，`ofstream` 默认的 `ios::out` 会清空原有内容，要保留旧数据必须改用 `ios::app`。
3. 读文件在打开之后必须检查 `is_open()`，否则文件不存在或路径写错时会静默失败；文件用完要 `close()`，缓冲区里的数据才会真正落盘。
4. 读取循环的条件应当直接写读取操作（`ifs >> x`、`getline(ifs, s)`），`eof()` 只在已经撞到文件末尾之后才为真，用它做条件会重复处理最后一行。
5. 二进制读写依靠 `write()`/`read()` 的"地址 + 字节数"，`ios::binary` 必须显式指定，结构体成员必须是定长类型——`string` 写进文件的只是指针。
6. 文本文件存字符、二进制文件存字节，需要人工阅读的选前者，需要精确还原内存结构的选后者。
7. `freopen` 把 `stdin`/`stdout` 重定向到文件而不必改业务代码，配合 `#ifndef ONLINE_JUDGE` 只在本地生效；它与文件流对象之间的取舍标准是"要不要精确控制每一个数据源"。
