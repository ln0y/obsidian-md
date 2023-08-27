---
aliases: []
tags: ['infrastructure/bundler/Webpack', 'date/2023-03', 'year/2023', 'month/03']
date: 2023-03-16-星期四 15:04:58
update: 2023-08-27-星期日 17:00:15
---

[Sourcemap 协议](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.qz3o9nc69um5) 最初由 Google 设计并率先在 Closure Inspector 实现，它的主要作用就是将经过压缩、混淆、合并的产物代码还原回未打包的原始形态，帮助开发者在生产环境中精确定位问题发生的行列位置，例如：

![](_attachment/img/84468f1eda7a5bc04f0399e70a52a8fc_MD5.png)

在 Webpack 内部，这段生成 Sourcemap 映射数据的逻辑并不复杂，一句话总结：在 [processAssets](https://webpack.js.org/api/compilation-hooks/#processassets) 钩子遍历产物文件 `assets` 数组，调用 `webpack-sources` 提供的 `map` 方法，最终计算出 `asset` 与源码 `originSource` 之间的映射关系。

这个过程真正的难点在于 「如何计算映射关系」，因此本文会展开详细讲解 Sourcemap 映射结构与 VLQ 编码规则，以及 Webpack 提供的 `devtool` 配置项的详细用法。

## SourceMap 的属性

Sourcemap 最初版本生成的 `.map` 文件非常大，体积大概为编译产物的 10 倍；V2 之后引入 Base64 编码等算法，将之减少 20\% \~ 30\%；而最新版本 V3 又在 V2 基础上引入 VLQ 算法，体积进一步压缩了 50\%。

- 2009 年，google 介绍他的一个编译器 Cloure Compiler 时，也顺便推出了一个调试插件 Closure Inspector，可以方便调试编译后的代码，这个就是 sourcemap 的雏形

- 2010 年，Closure Compiler Source Map 2.0 中，共同制定了一些标准，已决定使用 base64 编码，但是生成的 map 文件要比现在大很多

- 2011 年，第三代出炉， Source Map Revision 3 Proposal，也就是我们现在用的 sourcemap 的版本，这也就是为什么我们上面 map 文件的 version=3 了，这一版对算法进行了优化，大大缩小了 map 文件的体积

正是因为有了第三代 [Source Map Revision 3 Proposal](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/view) 这个标准，不同的打包工具和浏览器才能使用 sourcemap，github 上的一个根据这个标准生成 sourcemap 的库 <https://github.com/mozilla/source-map>

这一系列进化造就了一个效率极高的 Sourcemap 体系，但伴随而来的则是较为复杂的 `mappings` 编码规则。V3 版本 Sourcemap 文件由三部分组成:

- 开发者编写的原始代码；
- 经过 Webpack 压缩、转化、合并后的产物，且产物中必须包含指向 Sourcemap 文件地址的 `//# sourceMappingURL=https://xxxx/bundle.js.map` 指令；
- 记录原始代码与经过工程化处理代码之间位置映射关系 Map 文件。

页面初始运行时只会加载编译构建产物，直到特定事件发生 —— 例如在 Chrome 打开 Devtool 面板时，才会根据 `//# sourceMappingURL` 内容自动加载 Map 文件，并按 Sourcemap 协议约定的映射规则将代码重构还原回原始形态，这既能保证终端用户的性能体验，又能帮助开发者快速还原现场，提升线上问题的定位与调试效率。

例如，在 Webpack 中设置 `devtool = 'source-map'` 即可同时打包出代码产物 `xxx.js` 文件与同名 `xxx.js.map` 文件，Map 文件通常为 JSON 格式，内容如：

```json
{
  "version": 3,
  "file": "entry1.js",
  "mappings": ";;;;;AAAA;AACA",
  "sources": [
    "webpack://webpack/./index.js"
  ],
  "sourcesContent": [
    "const name = 'tony'\nconsole.log(name)\n"
  ],
  "names": [],
  "sourceRoot": ""
}
```

各字段含义分别为：

- `version`： 指代 Sourcemap 版本，目前最新版本为 `3`；
- `names`：字符串数组，记录原始代码中出现的变量名；
- `file`：字符串，该 Sourcemap 文件对应的编译产物文件名；
- `sourcesContent`：字符串数组，原始代码的内容；
- `sourceRoot`：字符串，源文件根目录；
- `sources`：字符串数组，原始文件路径名，与 `sourcesContent` 内容一一对应；
- `mappings`：字符串数组，记录源码和编译后代码的位置信息的 base64 VLQ 字符串。

## SourceMap 映射结构

使用时，浏览器会按照 `mappings` 记录的数值关系，将产物代码映射回 `sourcesContent` 数组所记录的原始代码文件、行、列位置，这里面最复杂难懂的点就在于 `mappings` 字段的规则。

举个例子，对于下面的代码：

编译前：

```js
const name = 'tony'
console.log(name)
```

编译后

```js
console.log("tony");
//# sourceMappingURL=main.js.map
```

```json
{
  "version": 3,
  "file": "main.js",
  "mappings": "AACAA,QAAQC,IADK",
  "sources": [
    "webpack://webpack/./index.js"
  ],
  "sourcesContent": [
    "const name = 'tony'\nconsole.log(name)\n"
  ],
  "names": [
    "console",
    "log"
  ],
  "sourceRoot": ""
}
```

字段内容包含三层结构：

- 以 `;` 分割的 **行映射**，每一个 `;` 对应编译产物每一行到源码的映射，一个分号代表转换后源码的一行
- 以 `,` 分割的 **片段映射**，每一个 `,` 对应该行中每一个代码片段到源码的映射，一个逗号对应转换后源码的一个位置
- 英文字母，每一段由 1，4 或 5 块可变长度的字段组成，记录原始代码的位置信息

举一个简单的例子，当 `devtool = 'source-map'; mode = 'production'` 时，Webpack 生成的 `mappings` 字段为：

```
AACAA,QAAQC,IADK
```

没有分号，说明有一行代码（如果有分号，例如： `AACAA;QAAQC,IADM`，分号前 `AACAA` 是第一行，后面 `QAAQC,IADM` 是第二行）

第一行有两个逗号，说明这一行分为三段，`AACAA`、 `QAAQC` 和 `IADK`

分号跟逗号大家应该都没什么疑问，主要就是英文字母这一块的意义位置对应的原理

每一段最多有 5 个部分

- 第一部分，表示这个位置在（转换后的代码的）的第几列
- 第二部分，表示这个位置属于 sources 属性中的哪一个文件
- 第三部分，表示这个位置属于转换前代码的第几行
- 第四部分，表示这个位置属于转换前代码的第几列
- 第五部分，表示这个位置属于 names 属性中的哪一个变量

### 位置映射

假设现在有 a.js，内容为 feel the force，处理后为 b.js，内容为 the force feel，那么 mapping 应该是多少呢？

![](_attachment/img/335018064b363d80902262f5eb811bf8_MD5.svg)

上图可以看到，所谓映射，就是指一个字符从一个位置移动到了另一个位置，然后我们将这个位置的变换记录下来。就好比我们在家里打扫卫生，我们要把家具发生移动，同时我们要记住每个家具之前在什么位置，这样等我们打扫完了，就可以还原了。

我们把每个字符的位置移动都写成一种固定的格式，里面包含了之前的位置（输入位置）和移动之后的位置（输出位置），同时还包含输入文件名，为啥要包含输入文件名？因为我们可能把很多文件进行处理输出，如果不写文件名，可能不知道输入位置来自哪个文件。

### 字符串提取

对于字符来说，例如 f,e,e,l 四个字符，其实在处理的时候，是将它们作为一个整体移动的，因为处理是不会改变它们内部的顺序，因此我们可以把相关的字符组成组合进行存储：

![](_attachment/img/df43e78a566deddf767e29d1e246ca94_MD5.svg)

看看我们现在的存储结构，可以发现有 a.js 和 the 这种字符，我们可以把它们抽离出来放在数组里，然后用下标表示它们，这样可以减少 mapping 的大小：

![](_attachment/img/6f638912d31562f785e6d736c446ab10_MD5.svg)

sources 中存储的是所有的输入文件名，names 是所有提取的字符组合。需要表示的时候，用下标即可。

### 省去输出行号

很多时候，我们输出的文件都是一行，这样输出的行号就可以省略，因为都是 0，没必要写出来，我们可以把我们的存储单元再缩短一点：

![](_attachment/img/d21455ca6586165364af48fe6e15d4bf_MD5.svg)

### 使用相对位置

mapping 中的位置记录我们一直用的都是绝对位置，就是这个组合/字符在文件的第几行，第几列，如果文件特别大的话，那么行列就会很大，因此我们可以用相对位置记录行列信息：

![](_attachment/img/3ec96c32c45e4bff2fe8f4179d14702e_MD5.svg)

第一次记录的输入位置和输出位置是绝对的，往后的输入位置和输出位置都是相对上一次的位置移动了多少，例如 the 的输出位置为 (0,-10),因为 the 在 feel 的左边数 10 下才能到 the 的位置。

到现在为止，我们得到了一个简单的 mappings:

```
sources:['a.js']
names:['feel','the','force']
mappings:[10|0|0|0|0,-10|0|0|5|1,4|0|0|4|2]
```

但是我们看看真正的一个 source map:

```
"sources":["test.js"],
"names":["sayHello","name","console","log"],
"mappings":"AAAA,SAASA,SAASC,MACdC,QAAQC,IAAI,SAAUF"
```

我们发现很多 AABB 的，和我们竖线分割不一样啊， 这是咋回事呢？其实这是 VLQ 编码，专门用来解决竖线分割数字问题的，毕竟竖线看起来又 low 又浪费空间。

## VLQ 编码

[VLQ](https://en.wikipedia.org/wiki/Variable-length_quantity) 是一种将整数数值转换为 Base64 的编码算法，它先将任意大的整数转换为一系列六位字节码，再按 Base64 规则转换为一串可见字符。

我们之前用竖线分割数字，是为了用一个字符串可以存储多个数字，例如:`1|23|456|7`。但是这样每个|会占用一个字符，vlq 的思路则是对连续的数字做上某种标记：

![](_attachment/img/df3a122c9bc5aca8eaacd7d71afebda9_MD5.svg)

我们可以发现，这种标记只在数字不是结尾的部分才有，如果是 123，那么 1,2 都有标记，最后的 3 没有标记，没有标记也就意味着完结。

那么这种标记法的具体实现是什么呢？VLQ 使用六位比特存储一个编码分组，其中第一位表示是否连续的标志，最后一位表示正数/负数。中间只有 4 位，因此一个单元表示的范围为 `[-15,15]`，如果超过了就要用连续标识位了。

我们来看几个用 vlq 表示的数字就明白了：

![](_attachment/img/f479ced3d7e7774db31008443fbcf384_MD5.svg)

例如：数字 7 经过 VLQ 编码后，结果为 `001110`，其中：

- 第一位为连续标志位，标识后续分组是否为同一数字；
- 第六位表示该数字的正负符号，0 为正整数，1 为负整数；
- 中间第 2-5 为实际数值。

这样一个六位编码分组，就可以按照 Base64 的映射规则转换为 `ABC` 等可见字符，例如上述数字 7 编码结果 `001110`，等于十进制的 14，按 Base64 字码表可映射为字母 `O`。

![](_attachment/img/e01f30e940d4c3b36ae8579fda132d49_MD5.png)

上面就是利用 vlq 编码划分的结果，有一些需要注意的点：

1. 如果这个数字在 `[-15,15]` 内，一个单元就可以表示，例如上面的 7，只需要把 7 的二进制放入中间的四位就好。

2. 如果超过 `[-15,15]`，就要用多个单元表示，需要对数字的二进制进行划分，按照…5554 的规则划分。把最右边的 4 位放入第一个单元中，然后每 5 个放入一个新单元的右边。为啥第一个单元只放 4 位？因为第一个单元的最后一位是表示正负数的，其他单元的最后一位没必要表示正负了。

3. 如果是负数，我们求的是它正数的二进制，放还是按照之前的规则放，只是把第一个单元的最后一位改成 1 就好。

最后把划分号的 6 位变成 Base64 编码，因为 Base64 也是 6 位一单元，和这里一样。下面有一个 demo，将输入的内容变成字符码数组，然后用 vlq&base64 编码：

[source map原理分析&vlq](http://www.qiutianaimeili.com/html/_page/2019/05/source/base64vlq/example.html)(二维码)

例如，对于十进制 -17，其二进制为 `10001` \(取 17 的二进制\) 共 5 位，首先从后到前拆分为两组，后四位 `0001` 为第一组，连续标志位为 1，符号位为 1，结果为 `1,0001,1`；剩下的 `1` 分配到第二个 —— 也是最后一个分组，连续标志位为 0，结果为 `0,00001`。按 Base64 规则 `[100011, 000001]` 最终映射为 `jA`。

```
十进制     二进制               VLQ    Base64
  -17 => 1,0001 => 100011, 000001 =>     jA
```

同样的，对于更大的数字，例如 1200，其二进制为 `10010110000`，分组为 `[10, 01011, 0000]`，从后到前编码，第一个分组为 `1,0000,0`；第二个分组为 `1,01011`；最后一个分组为 `0,00010`。按 Base64 映射为 `grC`。

```
十进制            二进制                     VLQ    Base64
 1200 => 10;01011;0000 => 100000,101011,000010 =>    grC
```

结合 VLQ 编码规则，我们再来解读个例子，对于代码：

编译前：

```js
const name = 'tecvan'

console.log(name)
```

编译后：

```js
/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
var name = 'tecvan';
console.log(name);
/******/ })()
;
//# sourceMappingURL=main.js.map
```

编译生成 `mappings`：

```
;;;;;AAAA,IAAMA,IAAI,GAAG,QAAb;AAEAC,OAAO,CAACC,GAAR,CAAYF,IAAZ,E
```

按行、片段规则分割后，得出如下片段：

```js
[
  // 产物第 1-5 行内容为 Webpack 生成的 runtime，不需要记录映射关系
  '', '', '', '', '',
  // 产物第 6 行的映射信息
  ['AAAA', 'IAAMA', 'IAAI', 'GAAG', 'QAAb'],
  // 产物第 7 行的映射信息
  ['AAEAC', 'OAAO', 'CAACC', 'GAAR', 'CAAYF', 'IAAZ', 'E']
]
```

以第 6 行 `['AAAA', 'IAAMA', 'IAAI', 'GAAG', 'QAAb']` 为例：

- `AAAA` 解码结果为 `[000000, 000000, 000000, 000000]`，即产物第 6 行 **第** **0** **列** 映射到 `sources[0]` 文件的 **第** **0** **行**，**第** **0** **列**，实际对应 `var` 到 `const` 的位置映射；
- `IAAMA` 解码结果为 `[001000, 000000, 000000, 001100, 000000]`，即产物第 6 行第 4 列映射到 `sources[0]` 文件的 **第** **0** **行**，**第** **6** **列**，实际对应产物 `name` 到源码 `name` 的位置映射。

看到有些是 5 位，有些是 4 位，5 位的我们之前已经知道，输出列|输入文件名|输入行|输入列|字符组合，4 位则少了最后的字符组合，一般用来矫正位置

可以在 [这个网站](https://www.murzwin.com/base64vlq.html) 自己转换测试

其它片段以此类推，Webpack 生成 `.map` 文件时，只需要在 `webpack-sources` 中，按照这个编码规则计算好编译前后的代码映射关系即可。

## `devtool` 规则详解

Webpack 提供了两种设置 Sourcemap 的方式，一是通过 `devtool` 配置项设置 Sourcemap 规则短语；二是直接使用 `SourceMapDevToolPlugin` 或 `EvalSourceMapDevToolPlugin` 插件深度定制 Sourcemap 的生成逻辑。

[devtool](https://webpack.js.org/configuration/devtool/) 支持 25 种字符串枚举值，包括 `eval`、`source-map`、`eval-source-map` 等：

| devtool                                    | performance                                   | production | quality        | comment                                                                               |
| ------------------------------------------ | --------------------------------------------- | ---------- | -------------- | ------------------------------------------------------------------------------------- |
| (none)                                     | **build**: fastest <br/> **rebuild**: fastest | yes        | bundle         | Recommended choice for production builds with maximum performance.                    |
| **`eval`**                                 | **build**: fast <br/> **rebuild**: fastest    | no         | generated      | Recommended choice for development builds with maximum performance.                   |
| `eval-cheap-source-map`                    | **build**: ok <br/> **rebuild**: fast         | no         | transformed    | Tradeoff choice for development builds.                                               |
| `eval-cheap-module-source-map`             | **build**: slow <br/> **rebuild**: fast       | no         | original lines | Tradeoff choice for development builds.                                               |
| **`eval-source-map`**                      | **build**: slowest <br/> **rebuild**: ok      | no         | original       | Recommended choice for development builds with high quality SourceMaps.               |
| `cheap-source-map`                         | **build**: ok <br/> **rebuild**: slow         | no         | transformed    |                                                                                       |
| `cheap-module-source-map`                  | **build**: slow <br/> **rebuild**: slow       | no         | original lines |                                                                                       |
| **`source-map`**                           | **build**: slowest <br/> **rebuild**: slowest | yes        | original       | Recommended choice for production builds with high quality SourceMaps.                |
| `inline-cheap-source-map`                  | **build**: ok <br/> **rebuild**: slow         | no         | transformed    |                                                                                       |
| `inline-cheap-module-source-map`           | **build**: slow <br/> **rebuild**: slow       | no         | original lines |                                                                                       |
| `inline-source-map`                        | **build**: slowest <br/> **rebuild**: slowest | no         | original       | Possible choice when publishing a single file                                         |
| `eval-nosources-cheap-source-map`          | **build**: ok <br/> **rebuild**: fast         | no         | transformed    | source code not included                                                              |
| `eval-nosources-cheap-module-source-map`   | **build**: slow <br/> **rebuild**: fast       | no         | original lines | source code not included                                                              |
| `eval-nosources-source-map`                | **build**: slowest <br/> **rebuild**: ok      | no         | original       | source code not included                                                              |
| `inline-nosources-cheap-source-map`        | **build**: ok <br/> **rebuild**: slow         | no         | transformed    | source code not included                                                              |
| `inline-nosources-cheap-module-source-map` | **build**: slow <br/> **rebuild**: slow       | no         | original lines | source code not included                                                              |
| `inline-nosources-source-map`              | **build**: slowest <br/> **rebuild**: slowest | no         | original       | source code not included                                                              |
| `nosources-cheap-source-map`               | **build**: ok <br/> **rebuild**: slow         | no         | transformed    | source code not included                                                              |
| `nosources-cheap-module-source-map`        | **build**: slow <br/> **rebuild**: slow       | no         | original lines | source code not included                                                              |
| `nosources-source-map`                     | **build**: slowest <br/> **rebuild**: slowest | yes        | original       | source code not included                                                              |
| `hidden-nosources-cheap-source-map`        | **build**: ok <br/> **rebuild**: slow         | no         | transformed    | no reference, source code not included                                                |
| `hidden-nosources-cheap-module-source-map` | **build**: slow <br/> **rebuild**: slow       | no         | original lines | no reference, source code not included                                                |
| `hidden-nosources-source-map`              | **build**: slowest <br/> **rebuild**: slowest | yes        | original       | no reference, source code not included                                                |
| `hidden-cheap-source-map`                  | **build**: ok <br/> **rebuild**: slow         | no         | transformed    | no reference                                                                          |
| `hidden-cheap-module-source-map`           | **build**: slow <br/> **rebuild**: slow       | no         | original lines | no reference                                                                          |
| `hidden-source-map`                        | **build**: slowest <br/> **rebuild**: slowest | yes        | original       | no reference. Possible choice when using SourceMap only for error reporting purposes. |

> 提示：内容摘抄自 Webpack [官网](https://webpack.js.org/configuration/devtool/)。

分开来看都特别晦涩，但这些枚举值内在有一个潜规则：都是由 `inline`、`eval`、`source-map`、`nosources`、`hidden`、`cheap`、`module` 七种关键字组合而成，这些关键词各自代表一项 Sourcemap 规则，拆开来看：

1. **`eval` 关键字**：当 `devtool` 值包含 `eval` 时，生成的模块代码会被包裹进一段 `eval` 函数中，且模块的 Sourcemap 信息通过 `//# sourceURL` 直接挂载在模块代码内。例如：

```js
eval("var foo = 'bar'\n\n\n//# sourceURL=webpack:///./src/index.ts?")
```

`eval` 模式编译速度通常比较快，但产物中直接包含了 Sourcemap 信息，因此只推荐在开发环境中使用。

1. **`source-map` 关键字**：当 `devtool` 包含 `source-map` 时，Webpack 才会生成 Sourcemap 内容。例如，对于 `devtool = 'source-map'`，产物会额外生成 `.map` 文件，形如：

```json
{
  "version": 3,
  "sources": ["webpack:///./src/index.ts"],
  "names": ["console", "log"],
  "mappings": "AACAA,QAAQC,IADI",
  "file": "bundle.js",
  "sourcesContent": ["const foo = 'bar';\nconsole.log(foo);"],
  "sourceRoot": ""
}
```

实际上，除 `eval` 之外的其它枚举值都包含该字段。

1. **`cheap` 关键字**：当 `devtool` 包含 `cheap` 时，生成的 Sourcemap 内容会抛弃 **列** 维度的信息，这就意味着浏览器只能映射到代码行维度。例如 `devtool = 'cheap-source-map'` 时，产物：

```json
{
    "version": 3,
    "file": "bundle.js",
    "sources": [
        "webpack:///bundle.js"
    ],
    "sourcesContent": [
        "console.log(\"bar\");"
    ],
    // 带 cheap 效果：
    "mappings": "AAAA",
    // 不带 cheap 效果：
    // "mappings": "AACAA,QAAQC,IADI",
    "sourceRoot": ""
}
```

浏览器映射效果：

![](_attachment/img/bb11c5e7302cfc45c7258f36807105cc_MD5.png)

虽然 Sourcemap 提供的映射功能可精确定位到文件、行、列粒度，但有时在 **行** 级别已经足够帮助我们达到调试定位的目的，此时可选择使用 `cheap` 关键字，简化 Sourcemap 内容，减少 Sourcemap 文件体积。

1. **`module` 关键字**：`module` 关键字只在 `cheap` 场景下生效，例如 `cheap-module-source-map`、`eval-cheap-module-source-map`。当 `devtool` 包含 `cheap` 时，Webpack 根据 `module` 关键字判断按 loader 联调处理结果作为 source，还是按处理之前的代码作为 source。例如：

![](_attachment/img/7f7ae29e80876dfacdc0f1c5eaabf11a_MD5.png)

注意观察上例 `sourcesContent` 字段，左边 `devtool` 带 `module` 关键字，因此此处映射的，是包含 `class Person` 的最原始代码；而右边生成的 `sourcesContent` ，则是经过 babel-loader 编译处理的内容。

1. **`nosources` 关键字**：当 `devtool` 包含 `nosources` 时，生成的 Sourcemap 内容中不包含源码内容 —— 即 `sourcesContent` 字段。例如 `devtool = 'nosources-source-map'` 时，产物：

```json
{
  "version": 3,
  "sources": ["webpack:///./src/index.ts"],
  "names": ["console", "log"],
  "mappings": "AACAA,QAAQC,IADI",
  "file": "bundle.js",
  "sourceRoot": ""
}
```

虽然没有带上源码，但 `.map` 产物中还带有文件名、 `mappings` 字段、变量名等信息，依然能够帮助开发者定位到代码对应的原始位置，配合 `sentry` 等工具提供的源码映射功能，可在异地还原诸如错误堆栈之类的信息。

1. **`inline` 关键字**：当 `devtool` 包含 `inline` 时，Webpack 会将 Sourcemap 内容编码为 Base64 DataURL，直接追加到产物文件中。例如对于 `devtool = 'inline-source-map'`，产物：

```js
console.log("bar");
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOlsiY29uc29sZSIsImxvZyJdLCJtYXBwaW5ncyI6IkFBQ0FBLFFBQVFDLElBREkiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZm9vID0gJ2Jhcic7XG5jb25zb2xlLmxvZyhmb28pOyJdLCJzb3VyY2VSb290IjoiIn0=
```

`inline` 模式编译速度较慢，且产物体积非常大，只适合开发环境使用。

1. **`hidden` 关键字**：通常，产物中必须携带 `//# sourceMappingURL=` 指令，浏览器才能正确找到 Sourcemap 文件，当 `devtool` 包含 `hidden` 时，编译产物中不包含 `//# sourceMappingURL=` 指令。例如：

`devtool = 'hidden-source-map'`：

```js
/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!**********************!*\
 !*** ./src/index.ts ***!
 \**********************/
var Person = /** @class */ (function () {
}());

/******/ })();
```

`devtool = 'source-map'`：

```js
/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!**********************!*\
 !*** ./src/index.ts ***!
 \**********************/
var Person = /** @class */ (function () {
}());

/******/ })();
//# sourceMappingURL=bundle.js.map
```

两者区别仅在于编译产物最后一行的 `//# sourceMappingURL=` 指令，当你需要 Sourcemap 功能，又不希望浏览器 Devtool 工具自动加载时，可使用此选项。需要打开 Sourcemap 时，可在浏览器中手动加载：

![](_attachment/img/100e5b6e926f6e3746c9e0c8d611d5b9_MD5.gif)

总结一下，Webpack 的 `devtool` 值都是由以上七种关键字的一个或多个组成，虽然提供了 27 种候选项，但逻辑上都是由上述规则叠加而成，例如：

- `cheap-source-map`：代表 **不带列映射** 的 Sourcemap ；
- `eval-nosources-cheap-source-map`：代表 **以 `eval` 包裹模块代码** ，且 **`.map` 映射文件中不带源码**，且 **不带列映射** 的 Sourcemap。

其它选项以此类推。最后再总结一下：

- 对于开发环境，适合使用：
  - `eval`：速度极快，但只能看到原始文件结构，看不到打包前的代码内容；
  - `cheap-eval-source-map`：速度比较快，可以看到打包前的代码内容，但看不到 loader 处理之前的源码；
  - `cheap-module-eval-source-map`：速度比较快，可以看到 loader 处理之前的源码，不过定位不到列级别；
  - `eval-source-map`：初次编译较慢，但定位精度最高；
- 对于生产环境，则适合使用：
  - `source-map`：信息最完整，但安全性最低，外部用户可轻易获取到压缩、混淆之前的源码，慎重使用；
  - `hidden-source-map`：信息较完整，安全性较低，外部用户获取到 `.map` 文件地址时依然可以拿到源码；
  - `nosources-source-map`：源码信息缺失，但安全性较高，需要配合 Sentry 等工具实现完整的 Sourcemap 映射。

## 使用 `source-map` 插件

上面介绍的 `devtool` 配置项，本质上只是一种方便记忆、使用的规则缩写短语，Sourcemap 的底层处理逻辑实际由 `SourceMapDevToolPlugin` 与 `EvalSourceMapDevToolPlugin` 插件实现。

在 `devtool` 基础上，插件还提供了更多、更细粒度的配置项，用于满足更复杂的需求场景，包括：

- 使用 `test`、`include`、`exclude` 配置项过滤需要生成 Sourcemap 的 Bundle；
- 使用 `append`、`filename`、`moduleFilenameTemplate`、`publicPath` 配置项设定 Sourcemap 文件的文件名、URL 。

使用方法与其它插件无异，如：

```js
const webpack = require('webpack')
module.exports = {
  // ...
  devtool: false,
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      exclude: ['vendor.js'],
    }),
  ],
}
```

插件配置规则较简单，此处不赘述。

## 总结

综上，Sourcemap 是一种高效的位置映射算法，它将产物到源码之间的位置关系表达为 `mappings` 分层设计与 VLQ 编码，再通过 Chrome、Safari、VS Code、Sentry 等工具异地还原为接近开发状态的源码形式。

在 Webpack 中，通常只需要选择适当的 `devtool` 短语即可满足大多数场景需求，特殊情况下也可以直接使用 `SourceMapDevToolPlugin` 做更深度的定制化。

## 参考

[Source Maps under the hood – VLQ, Base64 and Yoda](https://learn.microsoft.com/zh-tw/archive/blogs/davidni/source-maps-under-the-hood-vlq-base64-and-yoda#comment-626)

[Source Map Revision 3 Proposal](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.1ce2c87bpj24)
