---
aliases: []
tags: ['ts/hello_world','TypeScript','date/2022-02','year/2022','month/02']
date: 2022-02-11-Friday 16:50:03
update: 2022-02-14-Monday 17:57:19
---

# TypeScript 简介

TypeScript 其实就是类型化的 JavaScript，它不仅支持 JavaScript 的所有特性，还在 JavaScript 的基础上添加了静态类型注解扩展。

这里我们举个例子来说明一下，比如 JavaScript 中虽然提供了原始数据类型 string、number，但是它无法检测我们是不是按照约定的类型对变量赋值，而 TypeScript 会对赋值及其他所有操作默认做静态类型检测。

因此，从某种意义上来说，**TypeScript 其实就是 JavaScript 的超集**，如下图所示：

![[_attachment/img/Snipaste_2022-02-11_18-01-50.png]]

在 TypeScript 中，我们不仅可以轻易复用 JavaScript 的代码、最新特性，还能使用可选的静态类型进行检查报错，使得编写的代码更健壮、更易于维护。比如在开发阶段，我们通过 TypeScript 代码转译器就能快速消除很多低级错误（如 type、类型等）。

 [官方文档地址](https://www.typescriptlang.org/docs/handbook/intro.html)

# IDE for TypeScript

## VS Code

优点：
- 在传统语法高亮、自动补全功能的基础上拓展了基于变量类型、函数定义，以及引入模块的智能补全；
- 支持在编辑器上直接运行和调试应用；
- 内置了 Git Comands，能大幅提升使用 Git 及其他 SCM 管理工具的协同开发效率；
- 基于 Electron 开发，具备超强的扩展性和定制性。

## Playground

官方也提供了一个在线开发 TypeScript 的云环境——Playground。

基于它，我们无须在本地安装环境，只需要一个浏览器即可随时学习和编写 TypeScript，同时还可以方便地选择 TypeScript 版本、配置 tsconfig，并对 TypeScript 实时静态类型检测、转译输出 JavaScript 和在线执行。

而且在体验上，它也一点儿不逊色于任何本地的 IDE，对于刚刚学习 TypeScript 的我们来说，算是一个不错的选择。

- [点击查看中文版地址](https://www.typescriptlang.org/zh/play)

- [点击查看英文版地址](https://www.typescriptlang.org/play)

## 安装 TypeScript

因为 VS Code 只集成了 TypeScript 语言服务，不包含转译器，所以我们还需要单独安装 TypeScript

```shell
npm i -g typescript
```

TypeScript 安装完成后，我们输入如下所示命令即可查看当前安装的 TypeScript 版本。

```shell
tsc -v
> Version 3.9.2
```

我们也可以通过安装在 Terminal 命令行中直接支持运行 TypeScript 代码（Node.js 侧代码）的 ts-node 来获得较好的开发体验。

通过 npm 全局安装 ts-node 的操作如下代码所示：

```shell
npm i -g ts-node
```

## 编写 Hello World

我们可以在练习目录下输入“tsc --init”命令快速创建一个 [[tsconfig.json]] 文件，或者在 VS Code 应用窗口新建一个空的 tsconfg.json**配置 TypeScript 的行为。**

```shell
tsc --init
```

为了让 TypeScript 的行为更加严格、简单易懂，降低学习的心理负担，这就要求我们在 [[tsconfig.json]] 中开启如下所示设置，该设置将决定了 VS Code 语言服务如何对当前应用下的 TypeScript 代码进行类型检测。

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": [
        "utils/*"
      ]
    },
    "target": "ESNext",
    "module": "ESNext",
    "lib": [
      "ESNext",
      "DOM",
      "ES2015",
    ],
    /* Strict Type-Checking Options */
    "strict": true, /* Enable all strict type-checking options. */
    "noImplicitAny": true, /* Raise error on expressions and declarations with an implied 'any' type. */
    "strictNullChecks": true, /* Enable strict null checks. */
    "strictFunctionTypes": true, /* Enable strict checking of function types. */
    "strictBindCallApply": true, /* Enable strict 'bind', 'call', and 'apply' methods on functions. */
    "strictPropertyInitialization": true, /* Enable strict checking of property initialization in classes. */
    "noImplicitThis": true, /* Raise error on 'this' expressions with an implied 'any' type. */
    "alwaysStrict": false, /* Parse in strict mode and emit "use strict" for each source file. */
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "moduleResolution": "node"
  }
}
```

然后，新建一个 HelloWorld.ts 文件：

```ts
function say(word: string) {
  console.log(word);
}
say('Hello, World');
```

.ts 文件创建完成后，我们就可以使用 tsc（TypeScript Compiler） 命令将 .ts 文件转译为 .js 文件。

**注意：指定转译的目标文件后，tsc 将忽略当前应用路径下的 [[tsconfig.json]] 配置，因此我们需要通过显式设定如下所示的参数，让 tsc 以严格模式检测并转译 TypeScript 代码。**

```shell
tsc HelloWorld.ts --strict --alwaysStrict false
```

同时，可以给 tsc 设定一个 watch 参数监听文件内容变更，实时进行类型检测和代码转译，如下代码所示：

```shell
tsc HelloWorld.ts --strict --alwaysStrict false --watch
```

也可以直接使用 ts-node 运行 HelloWorld.ts，如下代码所示：

```shell
ts-node HelloWorld.ts
> Hello, World
```
