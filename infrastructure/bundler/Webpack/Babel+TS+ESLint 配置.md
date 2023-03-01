---
aliases: []
tags: ['infrastructure/bundler/Webpack', 'date/2023-03', 'year/2023', 'month/03']
date: 2023-03-01-星期三 16:47:49
update: 2023-03-01-星期三 16:55:48
---

## 使用 Babel

ECMAScript 6.0\(简称 ES6\) 版本补充了大量提升 JavaScript 开发效率的新特性，包括 `class` 关键字、块级作用域、ES Module 方案、代理与反射等，使得 JavaScript 可以真正被用于编写复杂的大型应用程序，但直到现在浏览器、Node 等 JavaScript 引擎都或多或少存在兼容性问题。为此，现代 Web 开发流程中通常会引入 Babel 等转译工具。

Babel 是一个开源 JavaScript 转编译器，它能将高版本 —— 如 ES6 代码等价转译为向后兼容，能直接在旧版 JavaScript 引擎运行的低版本代码，例如：

```js
// 使用 Babel 转译前
arr.map(item => item + 1)

// 转译后
arr.map(function (item) {
  return item + 1
})
```

示例中高版本的箭头函数语法经过 Babel 处理后被转译为低版本 `function` 语法，从而能在不支持箭头函数的 JavaScript 引擎中正确执行。借助 Babel 我们既可以始终使用最新版本 ECMAScript 语法编写 Web 应用，又能确保产物在各种环境下正常运行。

> 提示：Babel 还提供了一个在线版的 REPL 页面，读者可在 <https://babeljs.io/repl> 实时体验功能效果。

Webpack 场景下，只需使用 `babel-loader` 即可接入 Babel 转译功能：

1. 安装依赖

```bash
npm i -D @babel/core @babel/preset-env babel-loader
```

2. 添加模块处理规则

```js
module.exports = {
  /* ... */
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
      },
    ],
  },
}
```

示例中，`module` 属性用于声明模块处理规则，`module.rules` 子属性则用于定义针对什么类型的文件使用哪些 Loader 处理器，上例可解读为：

- `test: /\.js$/`：用于声明该规则的过滤条件，只有路径名命中该正则的文件才会应用这条规则，示例中的 `/\.js$/` 表示对所有 `.js` 后缀的文件生效
- `use`：用于声明这条规则的 Loader 处理器序列，所有命中该规则的文件都会被传入 Loader 序列做转译处理

3. 执行编译命令

```
npx webpack
```

接入后，可以使用 `.babelrc` 文件或 `rule.options` 属性配置 Babel 功能逻辑，例如：

```js
// 预先安装 @babel/preset-env
// npm i -D @babel/preset-env
module.exports = {
  /* ... */
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        ],
      },
    ],
  },
}
```

特别提一下，示例中的 `@babel/preset-env` 是一种 Babel 预设规则集 —— Preset，这种设计能按需将一系列复杂、数量庞大的配置、插件、Polyfill 等打包成一个单一的资源包，从而简化 Babel 的应用、学习成本。Preset 是 Babel 的主要应用方式之一，社区已经针对不同应用场景打包了各种 Preset 资源，例如：

- [`babel-preset-react`](https://www.npmjs.com/package/babel-preset-react)：包含 React 常用插件的规则集，支持 `preset-flow`、`syntax-jsx`、`transform-react-jsx` 等；
- [`@babel/preset-typescript`](https://babeljs.io/docs/en/babel-preset-typescript)：用于转译 TypeScript 代码的规则集
- [`@babel/preset-flow`](https://babeljs.io/docs/en/babel-preset-flow/)：用于转译 [Flow](https://flow.org/en/docs/getting-started/) 代码的规则集

> 提示：关于 Babel 的功能、用法、原理还有非常大的学习空间，感兴趣的同学可以前往阅读官方文档：<https://babeljs.io/docs/en/> ，这里点到为止，把注意力放回 Webpack + Babel 协作上。

## 使用 TypeScript

从 1999 年 ECMAScript 发布第二个版本到 2015 年发布 ES6 之间十余年时间内，JavaScript 语言本身并没有发生太大变化，语言本身许多老旧特性、不合理设计、功能缺失已经很难满足日益复杂的 Web 应用场景。为了解决这一问题，社区陆续推出了一些 JavaScript 超集方言，例如 TypeScript、CoffeeScript、Flow。

其中，TypeScript 借鉴 C# 语言，在 JavaScript 基础上提供了一系列类型约束特性，例如：

![[_attachment/img/eb91eba293a1b051c697006a3c6320c0_MD5.png]]

示例中，用一个数字类型的变量 `num` 减去字符串类型的变量 `str`，这在 TypeScript 的代码编译过程就能提前发现问题，而 JavaScript 环境下则需要到启动运行后才报错。这种类型检查特性虽然一定程度上损失了语言本身的灵活性，但能够让问题在编译阶段提前暴露，确保运行阶段的类型安全性，**特别适合用于构建多人协作的大型 JavaScript 项目**，也因此，时至今日 TypeScript 依然是一项应用广泛的 JavaScript 超集语言。

Webpack 有很多种接入 TypeScript 的方法，包括 `ts-loader`、`awesome-ts-loader`、 `babel-loader`。通常可使用 `ts-loader` 构建 TypeScript 代码：

1. 安装依赖

```bash
npm i -D typescript ts-loader
```

2. 配置 Webpack

```js
const path = require('path')

module.exports = {
  /* xxx */
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
}
```

- 使用 `module.rules` 声明对所有符合 `/\.ts$/` 正则 —— 即 `.ts` 结尾的文件应用 `ts-loader` 加载器
- 使用 `resolve.extensions` 声明自动解析 `.ts` 后缀文件，这意味着代码如 `import "./a.ts"` 可以忽略后缀声明，简化为 `import "./a"` 文件

3. 创建 `tsconfig.json` 配置文件，并补充 TypeScript 配置信息

```json
// tsconfig.json
{
  "compilerOptions": {
    "noImplicitAny": true,
    "moduleResolution": "node"
  }
}
```

4. 执行编译命令

```
npx webpack
```

注意，如果项目中已经使用 `babel-loader`，你也可以选择使用 [`@babel/preset-typescript`](https://babeljs.io/docs/en/babel-preset-typescript) 规则集，借助 `babel-loader` 完成 JavaScript 与 TypeScript 的转码工作：

1. 安装依赖

```
npm i -D @babel/preset-typescript
```

2. 配置 Webpack

```js
// 预先安装 @babel/preset-env
// npm i -D @babel/preset-env
module.exports = {
  /* ... */
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-typescript'],
            },
          },
        ],
      },
    ],
  },
}
```

不过，`@babel/preset-typescript` 只是简单完成代码转换，并未做类似 `ts-loader` 的类型检查工作，大家需要根据实际场景选择适当工具。

## 使用 ESLint

JavaScript 被设计成一种高度灵活的动态、弱类型脚本语言，这使得语言本身的上手成本极低，开发者只需要经过短暂学习就可以开始构建简单应用。但与其它编译语言相比，JavaScript 很难在编译过程发现语法、类型，或其它可能影响稳定性的错误，特别在多人协作的复杂项目下，语言本身的弱约束可能会开发效率与质量产生不小的影响，ESLint 的出现正是为了解决这一问题。

ESLint 是一种扩展性极佳的 JavaScript 代码风格检查工具，它能够自动识别违反风格规则的代码并予以修复，例如对于下面的示例：

源码:

```js
const foo ='foo';
let bar='bar';

console.log(foo,bar)
```

ESLint 修复后:

```js
const foo = 'foo'
const bar = 'bar'

console.log(foo, bar)
```

ESLint 配置：

```js
module.exports = {
 "extends": "standard"
}
```

ESLint 报错：

![[_attachment/img/111ad8c8892aeeff2633d1f0745a9c5f_MD5.png]]

这里先忽略 ESLint 配置的具体规则，样例源码存在诸多风格不统一的地方，例如 1、2 行以 `;` 结尾，而第 3 行没有 `;`；第一行变量以 `const` 声明，第二行变量以 `let` 声明，等等。ESLint 会找出这些风格不一致的地方，并予以告警，甚至自动修复，生成如上表右上角的代码。

Webpack 下，可以使用 `eslint-webpack-plugin` 接入 ESLint 工具，步骤：

1. 安装依赖

```bash
# 安装 webpack 依赖
yarn add -D webpack webpack-cli

# 安装 eslint
yarn add -D eslint eslint-webpack-plugin

# 简单起见，这里直接使用 standard 规范
yarn add -D eslint-config-standard eslint-plugin-promise eslint-plugin-import eslint-plugin-node eslint-plugin-n
```

2. 在项目根目录添加 `.eslintrc` 配置文件，内容：

```json
// .eslintrc
{
  "extends": "standard"
}
```

> 提示：关于 ESLint 配置项的更多信息，可参考：<https://eslint.org/docs/user-guide/configuring/>

3. 添加 `webpack.config.js` 配置文件，补充 `eslint-webpack-plugin` 配置：

```js
// webpack.config.js
const path = require('path')
const ESLintPlugin = require('eslint-webpack-plugin')

module.exports = {
  entry: './src/index',
  mode: 'development',
  devtool: false,
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  // 添加 eslint-webpack-plugin 插件实例
  plugins: [new ESLintPlugin()],
}
```

4. 执行编译命令

```
npx webpack
```

配置完毕后，就可以在 Webpack 编译过程实时看到代码风格错误提示：

![[_attachment/img/b194456fb1dfe94a52ba465e8b70bd9f_MD5.png]]

除常规 JavaScript 代码风格检查外，我们还可以使用适当的 ESLint 插件、配置集实现更丰富的检查、格式化功能，这里推荐几种使用率较高第三方扩展，建议读者跟进学习：

- [`eslint-config-airbnb`](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb)：Airbnb 提供的代码风格规则集，算得上 ESLint 生态第一个成名的规则集合
- [`eslint-config-standard`](https://github.com/standard/eslint-config-standard)：[Standard.js](https://standardjs.com/) 代码风格规则集，史上最便捷的统一代码风格的方式
- [`eslint-plugin-vue`](https://eslint.vuejs.org/)：实现对 Vue SFC 文件的代码风格检查
- [`eslint-plugin-react`](https://www.npmjs.com/package/eslint-plugin-react)：实现对 React 代码风格检查
- [`@typescript-eslint/eslint-plugin`](https://typescript-eslint.io/docs/development/architecture/packages/)：实现对 TypeScript 代码风格检查
- [`eslint-plugin-sonarjs`](https://github.com/SonarSource/eslint-plugin-sonarjs)：基于 `Sonar` 的代码质量检查工具，提供圈复杂度、代码重复率等检测功能

## 综合示例

最后，我们再串联上述三种工具，构建一套功能完备的 JavaScript 应用开发环境，步骤：

1. 安装基础依赖：

```bash
npm i -D webpack webpack-cli \
    # babel 依赖
    @babel/core @babel/cli @babel/preset-env babel-loader \
    # TypeScript 依赖
    typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin \
    @babel/preset-typescript \
    # ESLint 依赖
    eslint eslint-webpack-plugin
```

2. 创建 `webpack.config.js` 配置文件并输入：

```js
const path = require('path')
const ESLintPlugin = require('eslint-webpack-plugin')

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devtool: false,
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-typescript'] },
        },
      },
    ],
  },
  plugins: [new ESLintPlugin({ extensions: ['.js', '.ts'] })],
}
```

注意，此处使用 `@babel/preset-typescript` 插件转译 TypeScript 代码。

3. 创建 `.eslintrc` 文件并输入：

```json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": ["plugin:@typescript-eslint/recommended"]
}
```

之后只需执行 `npx webpack` 命令即可完成编译操作，例如：

`src/index.ts` 源码:

```js
const say = (statements: string) => {
 console.log(statements)
};

// @ts-ignore
say("Tecvan");
```
  
编译结果:

```js
/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!**********************!*\
 !*** ./src/index.ts ***!
 \**********************/
const say = statements => {
 console.log(statements);
}; // @ts-ignore


say("Tecvan");
/******/ })()
;
```

![[_attachment/img/0dc24f1034e5564294760310124eeb11_MD5.png]]

至此，我们就搭建了一个支持 Babel + TypeScript + ESLint 的开发环境，读者可在此基础上修改各项工具配置，定制适合自己项目的开发环境。
