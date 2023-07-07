---
aliases: []
tags: ['glob', 'regexp', 'date/2023-07', 'year/2023', 'month/07']
date: 2023-07-07-星期五 17:45:46
update: 2023-07-07-星期五 18:03:32
---

## 介绍

根据 [维基百科](<https://en.wikipedia.org/wiki/Glob_(programming)>) 的介绍，在计算机编程中 glob 模式表示带有通配符的路径名，例如在 bash 中查看文件列表：

```sh
$ls src/*.js
src/a.js src/b.js
```

它最初是贝尔实验室 Unix 系统上的一个名叫 glob 的命令（glob 是 global 的缩写），用于展开命令行中的通配符。后来系统提供了该功能的 C 语言库函数 `glob()`，知名的 shell 解释器就使用了该接口，shell 脚本和命令行中使用的 glob 模式匹配功能便源自于此。

## 基础语法

相比正则表达式大量的元字符，glob 模式中元字符极少，所以掌握起来也很快。glob 默认不匹配隐藏文件（以点 `.` 开头的文件或目录），下面是 glob 的语法：

| 通配符               | 描述                           | 示例      | 匹配                     | 不匹配              |
| -------------------- | ------------------------------ | --------- | ------------------------ | ------------------- |
| `*`                  | 匹配 0 个或多个字符，包含空串  | `Law*`    | `Law`, `Laws` 和 `Lawer` | `La`, `aw`          |
| `?`                  | 匹配 1 个字符                  | `?at`     | `cat`, `bat`             | `at`                |
| `[abc]`              | 匹配括号内字符集合中的单个字符 | `[cb]at`  | `cat`, `bat`             | `at`, `bcat`        |
| `[a-z]`              | 匹配括号内字符范围中的单个字符 | `[a-z]at` | `aat`, `bat`, `zat`      | `at`, `bcat`, `Bat` |
| `[^abc]` 或 `[!abc]` | 匹配括号内字符集合中的单个字符 | `[cb]at`  | `cat`, `bat`             | `at`, `bcat`        |
| `[^a-z]` 或 `[!a-z]` | 匹配括号内字符范围中的单个字符 | `[a-z]at` | `aat`, `bat`, `zat`      | `at`, `bcat`, `Bat` |

> 在 bash 命令行中 `[!abc]` 需要转义成 `[\!abc]`

## 扩展语法

除了基础语法外，bash 还支持 glob 的一些扩展语法，主要包含三种：

- Brace Expansion
- globstar
- extglob

三种扩展语法的定义和描述如下：

| 通配符            | 描述                                                                                    | 示例              | 匹配                               | 不匹配           |
| ----------------- | --------------------------------------------------------------------------------------- | ----------------- | ---------------------------------- | ---------------- |
| `{x, y, …}`       | Brace Expansion，展开花括号内容，支持展开嵌套括号                                       | `a.{png,jp{,e}g}` | `a.png`, `a.jpg`, `a.jpeg`         |                  |
| `**`              | globstar，匹配所有文件和任意层目录，如果 `**` 后面紧接着 `/` 则只匹配目录，不含隐藏目录 | `src/**`          | `src/a.js`, `src/b/a.js`, `src/b/` | `src/.hide/a.js` |
| `?(pattern-list)` | 匹配 0 次或 1 次给定的模式                                                              | `a.?(txt\|bin)`   | `a.`, `a.txt`, `a.bin`             | `a`              |
| `*(pattern-list)` | 匹配 0 次或多次给定的模式                                                               | `a.*(txt\|bin)`   | `a.`, `a.txt`, `a.bin`, `a.txtbin` | `a`              |
| `+(pattern-list)` | 匹配 1 次或多次给定的模式                                                               | `a.+(txt\|bin)`   | `a.txt`, `a.bin`, `a.txtbin`       | `a.`, `a`        |
| `@(pattern-list)` | 匹配给定的模式                                                                          | `a.@(txt\|bin)`   | `a.txt`, `a.bin`                   | `a.`, `a.txtbin` |
| `!(pattern-list)` | 匹配非给定的模式                                                                        | `a.!(txt\|bin)`   | `a.`, `a.txtbin`                   | `a.txt`, `a.bin` |

> pattern-list 是一组以 `|` 作为分隔符的模式集合，例如 `abc|a?c|ac*`

## 点号

如果文件或目录路径片段的第一个字符是点号（`.`），那么它将不匹配任何 glob，除非 glob 相应的路径片段的第一个字符也是 `.`。

例如，`a/.*/c` 匹配 `a/.b/c`，但是 `a/*/c` 不匹配，因为 `*` 第一个字符不是 `.`。

译注：点文件（dot file），名字以 `.` 开始，在 Unix 下是隐藏文件。即使使用 globstar 模式，`a/**/c` 也不会匹配 `a/.b/c`。

## 例子

`*` 匹配文件中 0 个或者多个字符，但是不会匹配路径中的分隔符，除非路径分隔符出现在末尾 例如下面的写法

```
// 匹配./style目录下所有的js文件
./style/*.js

// 匹配./style目录下所有的文件
./style/*.*

// 只要层级相同，可以匹配任意目录下的任意js文件 比如./style/a/b.js
./style/*/*.js
```

`**` 匹配文件路径中的 0 个或者多个层级的目录，需要单独出现，如果出现在末尾，也可匹配文件

```
// 匹配style目录及其所有子目录下的所有js文件，如能匹配
// ./style/a.js
// ./style/lib/res.js
// ./style/mudules/b/a.js
./style/**/*.js

// 匹配style目录下的所有目录和文件，比如能匹配
// ./style/a.js
// ./style/bb
// ./style/images/c.png
./style/**/*
```

`?` 匹配一个字符，不会匹配路径分隔符

```
// 能匹配文件名只有一个字符的js文件，如a.js, b.js ,但不能匹配文件名为2个字符及其以上的js的文件
?.js
```

`[…]` 由多个规则组成的数组，可以匹配数组中符合任意一个子项的文件，当子项中第一个字符为!或者^时，表示不匹配该规则

```
// 匹配style目录下的a0.js, a1.js, a2.js, a3.js
'./style/a[0-3].js'

// 除开node_modules目录之外，匹配项目根目录下的所有html文件
['./**/*.html', '!node_modules/**']
```

`{…}` 展开模式，根据里面的内容展开为多个规则，能匹配所有展开之后的规则 将上面的例子扩展一下，可以如下写

```
// 除开build,simple,images,node_modules目录，匹配根目录下所有的html与php文件
['./**/*.{html, php}', '!{build, simple, images, node_modules}/**']
```

`!(pattern|pattern|pattern)` 每一个规则用 pattern 表示，这里指排除符合这几个模式的所有文件

```
// 匹配排除文件名为一个字符的js文件，以及排除jquery.js之后的所有js文件
'./style/!(?|jquery).js'

// 排除build与node_modules目录，并排除其他目录下以下划线_开头的html与php文件，匹配其余的html与php文件
// 这种比较复杂的规则在实际开发中会常常用到，需要加深了解
['./**/!(_)*.{html, php}', '!{build, node_modules}/**']
```

`?(pattern|pattern|pattern)` 匹配括号中给定的任一模式 0 次或者 1 次

```
// 匹配style目录下的a.js, a2.js, b.js
// 不能组合
// 匹配0次或者1次
'./style/?(a|a2|b).js'
```

`@(pattern|pattern|pattern)` 匹配多个模式中的任一个

```
// 匹配style目录下的a.js, b.js, c.js
// 不能组合
// 匹配一次，不能为空，注意与?的区别
'./style/@(a|b|c).js'
```

`+(pattern|pattern|pattern)` 匹配括号中给定任一模式 1 次或者多次，这几个模式可以组合在一起匹配

```
// 可以匹配style目录下的a.js, a2.js, b.js
// 也可以匹配他们的组合 ab.js, aa2.js, a2b.js等
// 至少匹配一次，为空不匹配
'./style/+(a|a2|b).js'
```

`*(pattern|pattern|pattern)` 匹配括号中给定任一模式 0 次或者多次，这几个模式可以组合在一起匹配

```
// 可以匹配style目录下的a.js, b.js, c.js
// 也可以匹配他们的组合 ab.js, bc.js, ac.js
// 匹配0次或者多次
'./style/*(a|b|c).js'
```

几乎能用到的规则就都在上面了，在实际使用的时候，我们需要根据自己的实际情况来使用 只要掌握了 globs 模式。

## 与 regexp 的差异

glob 模式主要用于匹配文件路径，当然也可以用于匹配字符串，不过在匹配字符串的能力上比 regexp 要弱很多。由于 glob 模式和 regexp 存在相同的元字符，但是含义却不同，容易导致混淆，为了避免混淆，下面将 glob 模式转换成对应的 regexp 表示，以便区分他们的异同点。

| glob    | regexp  | 精确的 regexp     |
| ------- | ------- | ----------------- |
| `*`     | `.*`    | `^(?!\.)[^\/]*?$` |
| `?`     | `.`     | `^(?!\.)[^\/]$`   |
| `[a-z]` | `[a-z]` | `^[a-z]$`         |

> glob 匹配的是整个字符串，而 regexp 默认匹配的是子串，regexp 如果要匹配整个字符串需显式指定 `^` 和 `$`。正则表达式中的 `(?!\.)`，其表示不匹配隐藏文件

## 参考

- [https://en.wikipedia.org/wiki/Glob\_(programming)](<https://en.wikipedia.org/wiki/Glob_(programming)>)
- [https://www.gnu.org/software/bash/manual/html_node/Brace-Expansion.html#Brace-Expansion](https://www.gnu.org/software/bash/manual/html_node/Brace-Expansion.html#Brace-Expansion)
- [https://www.gnu.org/software/bash/manual/html_node/Pattern-Matching.html#Pattern-Matching](https://www.gnu.org/software/bash/manual/html_node/Pattern-Matching.html#Pattern-Matching)
