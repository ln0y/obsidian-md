---
aliases: []
tags: ['infrastructure/bundler/Webpack', 'date/2023-03', 'year/2023', 'month/03']
date: 2023-03-08-星期三 17:12:31
update: 2023-03-08-星期三 17:24:27
---

如何扩展 Webpack？有两种主流方式，一是 Loader —— 主要负责将资源内容翻译成 Webpack 能够理解、处理的 JavaScript 代码；二是 Plugin —— 深度介入 Webpack 构建过程，**重塑** 构建逻辑。

相对而言，Loader 的职责更单一，入门成本相对较低。

接下来我将集中介绍“**如何开发一个 Loader**”。本文先从基础入手：

- Loader 的基本形态与输入输出；
- 如何使用 Loader Context 上下文接口，并结合一些知名开源项目展开介绍部分常用接口；
- 如何为 Loader 编写自动测试代码；
- 深入剖析 Loader 链式调用模型。

## 为什么需要 Loader？

为什么 Webpack 需要设计出 Loader 这一扩展方式？本质上是因为计算机世界中的文件资源格式实在太多，不可能一一穷举， 那何不将 "**解析**" 资源这部分任务开放出去，由第三方实现呢？Loader 正是为了将文件资源的“读”与“处理”逻辑解耦，Webpack 内部只需实现对标准 JavaScript 代码解析/处理能力，由第三方开发者以 Loader 方式补充对特定资源的解析逻辑。

> 提示：Webpack5 之后增加了 Parser 对象，事实上已经内置支持图片、JSON 等格式的内容，不过这并不影响我们对 Loader 这一概念的理解。

实现上，Loader 通常是一种 mapping 函数形式，接收原始代码内容，返回翻译结果，如：

```js
module.exports = function (source) {
  // 执行各种代码计算
  return modifySource
}
```

在 Webpack 进入构建阶段后，首先会通过 IO 接口读取文件内容，之后调用 [LoaderRunner](https://github.com/webpack/loader-runner) 并将文件内容以 `source` 参数形式传递到 Loader 数组，`source` 数据在 Loader 数组内可能会经过若干次形态转换，最终以标准 JavaScript 代码提交给 Webpack 主流程，以此实现内容翻译功能。

Loader 函数签名如下：

```js
module.exports = function (source, sourceMap?, data?) {
  return source
}
```

Loader 接收三个参数，分别为：

- `source`：资源输入，对于第一个执行的 Loader 为资源文件的内容；后续执行的 Loader 则为前一个 Loader 的执行结果，可能是字符串，也可能是代码的 AST 结构；
- `sourceMap`: 可选参数，代码的 [sourcemap](https://sourcemap.com/) 结构；
- `data`: 可选参数，其它需要在 Loader 链中传递的信息，比如 [posthtml/posthtml-loader](https://github.com/posthtml/posthtml-loader) 就会通过这个参数传递额外的 AST 对象。

其中 `source` 是最重要的参数，大多数 Loader 要做的事情就是将 `source` 转译为另一种形式的 `output` ，比如 [webpack-contrib/raw-loader](https://github.com/webpack-contrib/raw-loader) 的核心源码：

```js
//...
export default function rawLoader(source) {
  // ...
  const json = JSON.stringify(source)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')

  const esModule = typeof options.esModule !== 'undefined' ? options.esModule : true

  return `${esModule ? 'export default' : 'module.exports ='} ${json};`
}
```

这段代码的作用是将文本内容包裹成 JavaScript 模块，例如：

```js
// source
I am tony

// output
module.exports = "I am tony"
```

经过模块化包装之后，这段文本内容变成 Webpack 可以理解的 JavaScript，其它 Module 也就能引用、使用它了。

需要注意，Loader 中执行的各种资源内容转译操作通常都是 CPU 密集型 —— 这放在 JavaScript 单线程架构下可能导致性能问题；又或者异步 Loader 会挂起后续的加载器队列直到异步 Loader 触发回调，稍微不注意就可能导致整个加载器链条的执行时间过长。

为此，Webpack 默认会缓存 Loader 的执行结果直到资源或资源依赖发生变化，开发者需要对此有个基本的理解，必要时可以通过 `this.cachable` 显式声明不作缓存：

```js
module.exports = function (source) {
  this.cacheable(false)
  // ...
  return output
}
```

## Loader 简单示例

接下来我们尝试编写一个简单的 Loader Demo，理解如何开发、调试、使用自定义 Loader 组件。示例代码结构如下：

```js
loader-custom
├─ src
│  ├─ cjs.js
│  ├─ index.js
│  └─ options.json
├─ package.json
└─ babel.config.js
```

核心代码 `src/index.js` 内容如下：

```js
import { validate } from 'schema-utils'
import schema from './options.json'

export default function loader(source) {
  const { version, webpack } = this
  const options = this.getOptions()

  validate(schema, options, 'Loader')

  const newSource = `
  /**
   * Loader API Version: ${version}
   * Is this in "webpack mode": ${webpack}
   */
  /**
   * Original Source From Loader
   */
  ${source}`

  return newSource
}
```

> 提示：也可以在 Loader 代码中插入 `debugger` 语句，配合 [ndb](https://www.npmjs.com/package/ndb) 工具启动调试模式。

代码逻辑很简单，核心功能只是在原来 `source` 上拼接了一些文本，但该有的东西也都有了：

1. 通过 `this.getOptions` 接口获取 Loader 配置对象；
2. 使用 [schema-utils](https://www.npmjs.com/package/schema-utils) 的 `validate` 接口校验 Loader 配置是否符合预期，配置 Schema 定义在 `src/options.json` 文件；
3. 返回经过修改的内容。

开发完成后，可以通过 `module.rules` 测试该 Loader，如：

```js
const path = require('path')

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            // 传入示例 Loader 的绝对路径
            loader: path.resolve(__dirname, '../dist/index.js'),
          },
        ],
      },
    ],
  },
}
```

也可以将 `resolveLoader.modules` 配置指向到 Loader 所在目录，Webpack 会在该目录查找加载器，如：

```js
const path = require('path')

module.exports = {
  //...
  resolveLoader: {
    modules: ['node_modules', path.resolve(__dirname, 'loaders')],
  },
}
```

接下来，我们可以开始使用 Loader 上下文接口实现更丰富的功能。

## 使用上下文接口

> 提示：本节内容主要围绕 Webpack5 展开，Webpack4 稍有差异，不作单独解释。

除了作为内容转换器外，Loader 运行过程还可以通过一些 [上下文接口](https://webpack.js.org/api/loaders/#thisaddcontextdependency)，**有限制** 地影响 Webpack 编译过程，从而产生内容转换之外的副作用。上下文接口将在运行 Loader 时以 `this` 方式注入到 Loader 函数：

![](_attachment/img/8d229c42c9a7b99bdcfcef4799870d71_MD5.png)

Webpack 官网对 [Loader Context](https://webpack.js.org/api/loaders/#the-loader-context) 已经有比较详细的说明，这里简单介绍几个比较常用的接口：

- `fs`：Compilation 对象的 `inputFileSystem` 属性，我们可以通过这个对象获取更多资源文件的内容；
- `resource`：当前文件路径；
- `resourceQuery`：文件请求参数，例如 `import "./a?foo=bar"` 的 `resourceQuery` 值为 `?foo=bar`；
- `callback`：可用于返回多个结果；
- `getOptions`：用于获取当前 Loader 的配置对象；
- `async`：用于声明这是一个异步 Loader，开发者需要通过 `async` 接口返回的 `callback` 函数传递处理结果；
- `emitWarning`：添加警告；
- `emitError`：添加错误信息，注意这不会中断 Webpack 运行；
- `emitFile`：用于直接写出一个产物文件，例如 `file-loader` 依赖该接口写出 Chunk 之外的产物；
- `addDependency`：将 `dep` 文件添加为编译依赖，当 `dep` 文件内容发生变化时，会触发当前文件的重新构建；

下面我会抽取几个比较关键的接口，结合开源项目的用法展开讲解。

## 取消 Loader 缓存

需要注意，Loader 中执行的各种资源内容转译操作通常都是 CPU 密集型 —— 这放在 JavaScript 单线程架构下可能导致性能问题；又或者异步 Loader 会挂起后续的加载器队列直到异步 Loader 触发回调，稍微不注意就可能导致整个加载器链条的执行时间过长。

为此，Webpack 默认会缓存 Loader 的执行结果直到模块或模块所依赖的其它资源发生变化，我们也可以通过 `this.cacheable` 接口显式关闭缓存：

```js
module.exports = function (source) {
  this.cacheable(false)
  // ...
  return output
}
```

## 在 Loader 中返回多个结果

简单的 Loader 可直接 `return` 语句返回处理结果，复杂场景还可以通过 `callback` 接口返回更多信息，供下游 Loader 或者 Webpack 本身使用，例如在 [webpack-contrib/eslint-loader](https://github.com/webpack-contrib/eslint-loader) 中：

```js
export default function loader(content, map) {
  // ...
  linter.printOutput(linter.lint(content))
  this.callback(null, content, map)
}
```

通过 `this.callback(null, content, map)` 语句，同时返回转译后的内容与 sourcemap 内容。`callback` 的完整签名如下：

```js
this.callback(
    // 异常信息，Loader 正常运行时传递 null 值即可
    err: Error | null,
    // 转译结果
    content: string | Buffer,
    // 源码的 sourcemap 信息
    sourceMap?: SourceMap,
    // 任意需要在 Loader 间传递的值
    // 经常用来传递 ast 对象，避免重复解析
    data?: any
);
```

## 在 Loader 返回异步结果

涉及到异步或 CPU 密集操作时，Loader 中还可以以异步形式返回处理结果，例如 [webpack-contrib/less-loader](https://github.com/webpack-contrib/less-loader) 的核心逻辑：

```js
import less from 'less'

async function lessLoader(source) {
  // 1. 获取异步回调函数
  const callback = this.async()
  // ...

  let result

  try {
    // 2. 调用less 将模块内容转译为 css
    result = await (options.implementation || less).render(data, lessOptions)
  } catch (error) {
    // ...
  }

  const { css, imports } = result

  // ...

  // 3. 转译结束，返回结果
  callback(null, css, map)
}

export default lessLoader
```

在 less-loader 中，包含三个重要逻辑：

- 调用 `this.async` 获取异步回调函数，此时 Webpack 会将该 Loader 标记为异步加载器，会挂起当前执行队列直到 `callback` 被触发；
- 调用 `less` 库将 less 资源转译为标准 css；
- 调用异步回调 `callback` 返回处理结果。

`this.async` 返回的异步回调函数签名与上一节介绍的 `this.callback` 相同，此处不再赘述。

## 在 Loader 中直接写出文件

Loader Context 的 `emitFile` 接口可用于直接写出新的产物文件，例如在 `file-loader` 中：

```js
export default function loader(content) {
  const options = getOptions(this)

  validate(schema, options, {
    name: 'File Loader',
    baseDataPath: 'options',
  })
  // ...

  if (typeof options.emitFile === 'undefined' || options.emitFile) {
    // ...
    this.emitFile(outputPath, content, null, assetInfo)
  }

  const esModule = typeof options.esModule !== 'undefined' ? options.esModule : true

  return `${esModule ? 'export default' : 'module.exports ='} ${publicPath};`
}

export const raw = true
```

借助 `emitFile` 接口，我们能够在 Webpack 构建主流程之外提交更多产物，这有时候是必要的，除上面提到的 `file-loader` 外，`response-loader` 、`mermaid-loader` 等也依赖于 `emitFile` 实现构建功能。

## 在 Loader 中添加额外依赖

Loader Context 的 `addDependency` 接口用于添加额外的文件依赖，当这些依赖发生变化时，也会触发重新构建，例如在 `less-loader` 中包含这样一段代码：

```js
try {
  result = await (options.implementation || less).render(data, lessOptions)
} catch (error) {
  // ...
}

const { css, imports } = result

imports.forEach(item => {
  // ...
  this.addDependency(path.normalize(item))
})
```

代码中首先调用 `less` 库编译文件内容，之后遍历所有 `@import` 语句\(`result.imports` 数组\)，调用 `this.addDependency` 函数将 import 到的文件都注册为依赖，此后这些资源文件发生变化时都会触发重新编译。

为什么 `less-loader` 需要这么处理？因为 `less` 工具本身已经会递归所有 Less 文件树，一次性将所有 `.less` 文件打包在一起，例如在 `a.less` 中 `@import (less) './b.less'` ，a、b 文件会被 `less` 打包在一起。这里面的文件依赖对 Webpack 来说是无感知的，如果不用 `addDependency` 显式声明依赖，后续 `b.less` 文件的变化不会触发 `a.less` 重新构建，不符合预期啊。

所以，`addDependency` 接口适用于那些 Webpack 无法理解隐式文件依赖的场景。除上例 `less-loader`，`babel-loader` 也是一个特别经典的案例。在 `babel-loader` 内部会添加对 Babel 配置文件如 `.babelrc` 的依赖，当 `.babelrc` 内容发生变化时，也会触发 `babel-loader` 重新运行。

此外，Loader Context 还提供了下面几个与依赖处理相关的接口：

- `addContextDependency(directory: String)`：添加文件目录依赖，目录下内容变更时会触发文件变更；
- `addMissingDependency(file: String)`：用于添加文件依赖，效果与 `addDependency` 类似；
- `clearDependencies()`：清除所有文件依赖。

## 处理二进制资源

有时候我们期望以二进制方式读入资源文件，例如在 `file-loader`、`image-loader` 等场景中，此时只需要添加 `export const raw = true` 语句即可，如：

```js
export default function loader(source) {
  /* ... */
}

export const raw = true
```

之后，`loader` 函数中获取到的第一个参数 `source` 将会是 Buffer 对象形式的二进制内容。

## 在 Loader 中正确处理日志

Webpack 内置了一套 [infrastructureLogging](https://webpack.js.org/configuration/other-options/#infrastructurelogging) 接口，专门用于处理 Webpack 内部及各种第三方组件的日志需求，与 [log4js](https://github.com/log4js-node/log4js-node)、[winston](https://github.com/winstonjs/winston) 等日志工具类似，[infrastructureLogging](https://webpack.js.org/configuration/other-options/#infrastructurelogging) 也提供了根据日志分级筛选展示功能，从而将日志的写逻辑与输出逻辑解耦。

> 提示：作为对比，假如我们使用 `console.log` 等硬编码方式输出日志信息，用户无法过滤这部分输出，可能会造成较大打扰，体感很不好。

因此，在编写 Loader 时也应该尽可能复用 Webpack 内置的这套 Logging 规则，方法很简单，只需使用 Loader Context 的 [getLogger](https://v4.webpack.js.org/api/loaders/#logging) 接口，如：

```js
export default function loader(source) {
  const logger = this.getLogger('xxx-loader')
  // 使用适当的 logging 接口
  // 支持：verbose/log/info/warn/error
  logger.info('information')

  return source
}
```

`getLogger` 返回的 `logger` 对象支持 `verbose/log/info/warn/error` 五种级别的日志，最终用户可以通过 [infrastructureLogging.level](https://webpack.js.org/configuration/other-options/#level) 配置项筛选不同日志内容，例如：

```js
module.exports = {
  // ...
  infrastructureLogging: {
    level: 'warn',
  },
  // ...
}
```

## 在 Loader 中正确上报异常

Webpack Loader 中有多种上报异常信息的方式：

- 使用 `logger.error`，仅输出错误日志，不会打断编译流程，效果：

![](_attachment/img/990422d5e1f59e164b5ddad6f3cc6cd1_MD5.png)

- 使用 `this.emitError` 接口，同样不会打断编译流程，效果：

![](_attachment/img/cf5445f7d0450c2153a6dff6a77d4eb2_MD5.png)

与 `logger.error` 相比，`emitError` 不受 `infragstrustureLogging` 规则控制，必然会强干扰到最终用户；其次，`emitError` 会抛出异常的 Loader 文件、代码行、对应模块，更容易帮助定位问题。

- 使用 `this.callback` 接口提交错误信息，但注意导致当前模块编译失败，效果与直接使用 `throw` 相同，用法：

```js
export default function loader(source) {
  this.callback(new Error('发生了一些异常'))

  return source
}
```

之后，Webpack 会将 `callback` 传递过来的错误信息当做模块内容，打包进产物文件：

![](_attachment/img/89bc565cf03fe1e6638cc5a5b243504a_MD5.png)

总的来说，这些方式各自有适用场景，我个人会按如下规则择优选用：

- 一般应尽量使用 `logger.error`，减少对用户的打扰；
- 对于需要明确警示用户的错误，优先使用 `this.emitError`；
- 对于已经严重到不能继续往下编译的错误，使用 `callback` 。

## 为 Loader 编写单元测试

在 Loader 中编写单元测试收益非常高，一方面对开发者来说，不用重复手动测试各种特性；一方面对于最终用户来说，带有一定测试覆盖率的项目通常意味着更高、更稳定的质量。常规的 Webpack Loader 单元测试流程大致如下：

1. 创建在 Webpack 实例，并运行 Loader；
2. 获取 Loader 执行结果，比对、分析判断是否符合预期；
3. 判断执行过程中是否出错。

下面我们逐一展开讲解。

> 如何运行 Loader？

有两种办法，一是在 node 环境下运行调用 Webpack 接口，用代码而非命令行执行编译，很多框架都会采用这种方式，例如 vue-loader、stylus-loader、babel-loader 等，优点是运行效果最接近最终用户，缺点是运行效率相对较低（可以忽略）。

以 [posthtml/posthtml-loader](https://github.com/posthtml/posthtml-loader) 为例，它会在启动测试之前创建并运行 Webpack 实例：

```js
// posthtml-loader/test/helpers/compiler.js 文件
module.exports = function (fixture, config, options) {
  config = {
    /*...*/
  }

  options = Object.assign({ output: false }, options)

  // 创建 Webpack 实例
  const compiler = webpack(config)

  // 以 MemoryFS 方式输出构建结果，避免写磁盘
  if (!options.output) compiler.outputFileSystem = new MemoryFS()

  // 执行，并以 promise 方式返回结果
  return new Promise((resolve, reject) =>
    compiler.run((err, stats) => {
      if (err) reject(err)
      // 异步返回执行结果
      resolve(stats)
    })
  )
}
```

> 提示：上面的示例中用到 `compiler.outputFileSystem = new MemoryFS()` 语句将 Webpack 设定成输出到内存，能避免写盘操作，提升编译速度。

另外一种方法是编写一系列 mock 方法，搭建起一个模拟的 Webpack 运行环境，例如 [emaphp/underscore-template-loader](https://github.com/emaphp/underscore-template-loader) ，优点是运行速度更快，缺点是开发工作量大通用性低，了解即可。

> 如何校验 Loader 执行结果？

上例运行结束之后会以 `resolve(stats)` 方式返回执行结果，`stats` 对象中几乎包含了编译过程所有信息，包括：耗时、产物、模块、chunks、errors、warnings 等等，我们可以从 `stats` 对象中读取编译最终输出的产物，例如 `style-loader`：

```js
// style-loader/src/test/helpers/readAsset.js 文件
function readAsset(compiler, stats, assets) => {
  const usedFs = compiler.outputFileSystem
  const outputPath = stats.compilation.outputOptions.path
  const queryStringIdx = targetFile.indexOf('?')

  if (queryStringIdx >= 0) {
    // 解析出输出文件路径
    asset = asset.substr(0, queryStringIdx)
  }

  // 读文件内容
  return usedFs.readFileSync(path.join(outputPath, targetFile)).toString()
}
```

解释一下，这段代码首先计算 asset 输出的文件路径，之后调用 outputFileSystem 的 `readFile` 方法读取文件内容。

接下来，有两种分析内容的方法：

- 调用 Jest 的 `expect(xxx).toMatchSnapshot()` 断言，判断当前运行结果是否与之前的运行结果一致，从而确保多次修改的结果一致性，很多框架都大量用了这种方法；
- 解读资源内容，判断是否符合预期，例如 less-loader 的单元测试中会对同一份代码跑两次 less 编译，一次由 Webpack 执行，一次直接调用 `less` 库，之后分析两次运行结果是否相同。

对此有兴趣的同学，强烈建议看看 `less-loader` 的 test 目录。

> 如何判断执行过程是否触发异常？

最后，还需要判断编译过程是否出现异常，同样可以从 `stats` 对象解析：

```js
export default getErrors = stats => {
  const errors = stats.compilation.errors.sort()
  return errors.map(e => e.toString())
}
```

大多数情况下都希望编译没有错误，此时只要判断结果数组是否为空即可。某些情况下可能需要判断是否抛出特定异常，此时可以 `expect(xxx).toMatchSnapshot()` 断言，用快照对比更新前后的结果。

## 链式调用模型详解

举个例子，为了读取 `less` 文件，我们通常需要同时配置多个加载器：

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/i,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
    ],
  },
}
```

示例针对 `.less` 后缀的文件设定了 less、css、style 三个 Loader，Webpack 启动后会以一种所谓“链式调用”的方式按 `use` 数组顺序从后到前调用 Loader：

- 首先调用 `less-loader` 将 Less 代码转译为 CSS 代码；
- 将 `less-loader` 结果传入 `css-loader`，进一步将 CSS 内容包装成类似 `module.exports = "${css}"` 的 JavaScript 代码片段；
- 将 `css-loader` 结果传入 `style-loader`，在运行时调用 injectStyle 等函数，将内容注入到页面的 `<style>` 标签。

![](_attachment/img/fb13878962ebd5680a8a6f6e353ba367_MD5.png)

三个 Loader 分别完成内容转化工作的一部分，形成从右到左的执行链条。链式调用这种设计有两个好处，一是保持单个 Loader 的单一职责，一定程度上降低代码的复杂度；二是细粒度的功能能够被组装成复杂而灵活的处理链条，提升单个 Loader 的可复用性。

不过，这只是链式调用的一部分，这里面有两个问题：

- Loader 链条一旦启动之后，需要所有 Loader 都执行完毕才会结束，没有中断的机会 —— 除非显式抛出异常；
- 某些场景下并不需要关心资源的具体内容，但 Loader 需要在 source 内容被读取出来之后才会执行。

为了解决这两个问题，Webpack 在 Loader 基础上叠加了 `pitch` 的概念。

> Q: 什么是 `pitch`？

Webpack 允许在 Loader 函数上挂载名为 `pitch` 的函数，运行时 pitch 会比 Loader 本身更早执行，例如：

```js
const loader = function (source) {
  console.log('后执行')
  return source
}

loader.pitch = function (requestString) {
  console.log('先执行')
}

module.exports = loader
```

Pitch 函数的完整签名：

```js
function pitch(remainingRequest: string, previousRequest: string, data = {}): void {}
```

包含三个参数：

- `remainingRequest` : 当前 loader 之后的资源请求字符串；
- `previousRequest` : 在执行当前 loader 之前经历过的 loader 列表；
- `data` : 与 Loader 函数的 `data` 相同，用于传递需要在 Loader 传播的信息。

这些参数不复杂，但与 requestString 紧密相关，我们看个例子加深了解：

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/i,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
    ],
  },
}
```

`css-loader.pitch` 中拿到的参数依次为：

```js
// css-loader 之后的 loader 列表及资源路径
remainingRequest = less-loader!./xxx.less
// css-loader 之前的 loader 列表
previousRequest = style-loader
// 默认值
data = {}
```

> `pitch` 函数调度逻辑

Pitch 翻译成中文是 _抛、球场、力度、事物最高点_ 等，它背后折射的是一整套 Loader 被执行的生命周期概念。

实现上，Loader 链条执行过程分三个阶段：pitch、解析资源、执行，设计上与 DOM 的事件模型非常相似，pitch 对应到捕获阶段；执行对应到冒泡阶段；而两个阶段之间 Webpack 会执行资源内容的读取、解析操作，对应 DOM 事件模型的 AT_TARGET 阶段：

![](_attachment/img/c4af10c537ce3b589f9c304bbb521eb2_MD5.png)

`pitch` 阶段按配置顺序从左到右逐个执行 `loader.pitch` 函数\(如果有的话\)，开发者可以在 `pitch` 返回任意值中断后续的链路的执行：

![](_attachment/img/22e5a25e5b34c29b78c7ebdd008082e4_MD5.png)

那么为什么要设计 pitch 这一特性呢？

在分析了 style-loader、vue-loader、to-string-loader 等开源项目之后，我个人总结出两个字：**阻断**！

回顾一下前面提到过的 less 加载链条：

- `less-loader` ：将 less 规格的内容转换为标准 css；
- `css-loader` ：将 css 内容包裹为 JavaScript 模块；
- `style-loader` ：将 JavaScript 模块的导出结果以 `link` 、`style` 标签等方式挂载到 html 中，让 css 代码能够正确运行在浏览器上。

实际上， `style-loader` 只是负责让 CSS 在浏览器环境下跑起来，并不需要关心具体内容，很适合用 pitch 来处理，核心代码：

```js
// ...
// Loader 本身不作任何处理
const loaderApi = () => {}

// pitch 中根据参数拼接模块代码
loaderApi.pitch = function loader(remainingRequest) {
  //...

  switch (injectType) {
    case 'linkTag': {
      return `${
        esModule
          ? `...`
          : // 引入 runtime 模块
            `var api = require(${loaderUtils.stringifyRequest(
              this,
              `!${path.join(__dirname, 'runtime/injectStylesIntoLinkTag.js')}`
            )});
            // 引入 css 模块
            var content = require(${loaderUtils.stringifyRequest(
              this,
              `!!${remainingRequest}`
            )});

            content = content.__esModule ? content.default : content;`
      } // ...`
    }

    case 'lazyStyleTag':
    case 'lazySingletonStyleTag': {
      //...
    }

    case 'styleTag':
    case 'singletonStyleTag':
    default: {
      // ...
    }
  }
}

export default loaderApi
```

关键点：

- `loaderApi` 为空函数，不做任何处理；
- `loaderApi.pitch` 中拼接结果，导出的代码包含：
  - 引入运行时模块 `runtime/injectStylesIntoLinkTag.js`；
  - 复用 `remainingRequest` 参数，重新引入 css 文件。

运行后，关键结果大致如：

```js
var api = require('xxx/style-loader/lib/runtime/injectStylesIntoLinkTag.js')
var content = require('!!css-loader!less-loader!./xxx.less')
```

注意了，到这里 style-loader 的 pitch 函数返回这一段内容，后续的 Loader 就不会继续执行，当前调用链条中断了：

![](_attachment/img/992cfef3ab10c15d1d044df197f46bca_MD5.png)

之后，Webpack 继续解析、构建 style-loader 返回的结果，遇到 inline loader 语句：

```js
var content = require('!!css-loader!less-loader!./xxx.less')
```

所以从 Webpack 的角度看，对同一个文件实际调用了两次 loader 链，第一次在 style-loader 的 pitch 中断，第二次根据 inline loader 的内容跳过了 style-loader。

## 使用 `schema-utils`

Webpack，以及 Webpack 生态下的诸多 Loader、Plugin 基本上都会提供若干“**配置项**”，供用户调整组件的运行逻辑，这些组件内部通常都会使用 [schema-utils](https://www.npmjs.com/package/schema-utils) 工具库校验用户传入的配置是否满足要求。

因此，若我们开发的 Loader 需要对外暴露配置项，建议也尽量使用这一工具，基本用法：

1. 安装依赖：

```sh
yarn add -D schema-utils
```

2. 编写配置对象的 Schema 描述，例如：

```json
// options.json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "boolean"
    }
  },
  "required": ["name"],
  "additionalProperties": false
}
```

3. 在 Loader 中调用 `schema-utils` 校验配置对象：

```js
import { validate } from "schema-utils";
import schema from "./options.json";

// 调用 schema-utils 完成校验
export default function loader(source) {
  const options = this.getOptions();
  validate(schema, options);

  return source;
}

// Webpack5 之后还可以借助 Loader Context 的 `getOptions` 接口完成校验
export default function loader(source) {
  const options = this.getOptions(schema);

  return source;
}
```

之后，若用户传入不符合 Schema 描述的参数对象，会报类似下面这种错误提示：

![](_attachment/img/e6c36f2838dc03140fe32fc6edb3e48d_MD5.png)

`schema-utils` 的校验能力很强，能够完美支撑起 Webpack 生态下非常复杂的参数校验需求，但官方文档非常语焉不详，翻阅源码后发现，它底层主要依赖于 [ajv](https://ajv.js.org/guide/getting-started.html) ，这是一个应用广泛、功能强大且性能优异的校验工具：

![](_attachment/img/a87a3af2b490c94603ea87659acc7805_MD5.png)

> 提示：`ajv` 在对象校验、JSON 序列化/反序列化方面的性能表现非常突出，许多知名 [开源框架](https://www.npmjs.com/browse/depended/ajv) 如：ESLint、fast-json-stringify、middy、swagger、tailwind 等底层都依赖于 `ajv`，值得我们学习、复用到业务项目中。

`ajv` 功能非常完备，基本上已经覆盖了“使用 JSON 描述对象约束”的所有场景，我们不可能在一篇文章里介绍所有细节，所以我下面只摘要介绍一些比较重要的能力与实例，更多信息建议参考 [官网](https://ajv.js.org/guide/why-ajv.html)。

> `ajv` 数据描述格式基础知识：

`schema-utils` 内部使用 `ajv` 的 [JSON-Schema](https://ajv.js.org/json-schema.html) 模式实现参数校验，而 JSON-Schema 是一种以 JSON 格式描述数据结构的 [公共规范](https://json-schema.org/specification.html)，使用时至少需要提供 `type` 参数，如：

```json
{
  "type": "number"
}
```

`ajv` 默认支持七种基本数据类型。

- [number](https://ajv.js.org/json-schema.html#keywords-for-numbers)：数值型，支持整数、浮点数，支持如下校验规则：
  - `maximum`、`minimum`：属性值必须大于等于 `minimum` ，且小于等于 `maximum`；
  - `exclusiveMaximum`、`exclusiveMinimum`：属性值必须大于 `exclusiveMinimum` ，且小于 `exclusiveMinimum`；
  - `multipleOf`：属性值必须为 `multipleOf` 的整数倍，例如对于 `multipleOf = 5`，则 `10/20/5` 均符合预期，但 `8/9/1` 等不符合预期。
- `interger`：整数型，与 `number` 类似，也支持上面介绍的 `maximum` 等校验规则；
- [string](https://ajv.js.org/json-schema.html#keywords-for-strings)：字符串型，支持如下校验规则：
  - `maxLength`、`minLength`：限定字符串的最大长度、最小长度；
  - `pattern`：以正则表达式方式限定字符串内容；
  - `format`：声明字符串内容格式，`schema-utils` 底层调用了 `[ajv-formats](https://github.com/ajv-validator/ajv-formats)` 插件，开箱支持 `date/ipv4/regex/uuid` 等格式。
- `boolean`：bool 值；
- [array](https://ajv.js.org/json-schema.html#keywords-for-arrays)：数组型，支持如下校验属性：
  - `maxItems`、`minItems`：限定数组的最多、最少的元素数量；
  - `uniqueItems`：限定数组元素是否必须唯一，不可重复；
  - `items`：声明数组项的 Schema 描述，数组项内可复用 JSON-Schema 的任意规则，从而形成嵌套定义结构；
- `null`：空值，常用于复合 `type` 类型，如 `type = ['object', 'null']` 支持传入对象结构或 `null` 值；
- [object](https://ajv.js.org/json-schema.html#keywords-for-objects)：对象结构，这是一个比较负责的结构，支持如下校验属性：
  - `maxProperties` / `minProperties`：限定对象支持的最多、最少属性数量；
  - `required`：声明哪些属性不可为空，例如 `required = ['name', 'age']` 时，传入的值必须至少提供 `name/age` 属性；
  - `properties`：定义特定属性的 Schema 描述，与 `array` 的 `items` 属性类似，支持嵌套规则，例如：

```json
{
  "type": "object",
  "properties": {
    "foo": { "type": "string" },
    "bar": {
      "type": "number",
      "minimum": 2
    }
  }
}
```

- `patternProperties`：同样用于定义对象属性的 Schema，但属性名支持正则表达式形式，例如：

```json
{
  "type": "object",
  "patternProperties": {
    "^fo.*$": { "type": "string" },
    "^ba.*$": { "type": "number" }
  }
}
```

- `additionalProperties`：限定对象是否可以提供除 `properties`、`patternProperties` 之外的属性；

除此之外，Schema 节点还支持一些通用的规则字段，包括：

- `enum`：枚举数组，属性值必须完全等于\(Deep equal\) 这些值之一，例如：

```json
// JSON-Schema
{
  "type": "string",
  "enum": [
    "fanwenjie",
    "tecvan"
  ]
}

// 有效值：
"fanwenjie"/"tecvan"
// 无效值，如：
"foo bar" 等
```

- `const`：静态数值，属性值必须完全等于 `const` 定义，单独看 `const` 似乎作用不大，但配合 [$data](https://ajv.js.org/guide/combining-schemas.html#data-reference) 指令的 [JSON-Pointer](https://datatracker.ietf.org/doc/rfc6901/) 能力，可以实现关联相等的效果，例如：

```json
// JSON-Schema
{
  type: "object",
  properties: {
    foo: {type: "string"},
    bar: {const: {$data: "1/foo"}}
  }
}

// bar 必须等于 foo，如：
{
  "foo": "fanwenjie",
  "bar": "fanwenjie"
}
// 否则无效：
{
  "foo": "fanwenjie",
  "bar": "tecvan"
}
```

这些基础数据类型与校验规则奠定了 `ajv` 的基础校验能力，我们使用 `schema-utils` 时大部分时间都需要与之打交道，建议同学们多加学习掌握。

> 使用 `ajv` 复合条件指令

除上述介绍的基本类型与基础校验规则外，`ajv` 还提供了若干 [复合校验指令](https://ajv.js.org/json-schema.html#compound-keywords)：

- [not](https://ajv.js.org/json-schema.html#not)：数值必须不符合该条件，例如：`{type: "number", not: {minimum: 3}}` 时，传入数值必须小于 3；
- [anyof](https://ajv.js.org/json-schema.html#anyof)：数值必须满足 `anyof` 条件之一，这是一个非常实用的指令，例如在 `css-loader` 中：

```json
// css-loader/src/options.json
{
  "additionalProperties": false,
  "properties": {
    "url": {
      "description": "Enables/Disables 'url'/'image-set' functions handling (https://github.com/webpack-contrib/css-loader#url).",
      "anyOf": [
        {
          "type": "boolean"
        },
        {
          "instanceof": "Function"
        }
      ]
    }
    // more properties
  },
  "type": "object"
}
```

这意味着 `css-loader` 的 `url` 配置项只接受 Bool 或函数值。

- [oneOf](https://ajv.js.org/json-schema.html#oneof)：数值必须满足且只能满足 `oneOf` 条件之一，例如：

```json
{
  type: "number",
  oneOf: [{maximum: 3}, {type: "integer"}]
}
// 下述数值符合要求：
1.1、2.1、4、5 等

// 下述数值不符合要求：
3.5、2、1 等
```

数值要么是小于等于 3 的浮点数，要么是大于 3 的整数，不在此区间的数值如“3.5/2” 等均不符合要求。

- [allof](https://ajv.js.org/json-schema.html#allof)：数值必须满足 `allof` 指定的所有条件，例如：

```json
{
  type: "number",
  allOf: [{maximum: 3}, {type: "integer"}]
}
// 下述数值符合要求：
1、2、3 等

// 下述数值不符合要求：
1.1、4、5 等
```

这要求传入的数值必须小于 3，且必须为整型。

- `if/then/else`：这是一个稍显复杂的三元组复合条件，大致逻辑为：若传入的数值满足 `if` 条件，则必须同时满足 `then` 条件；若不满足 `if` 则必须同时满足 `else`，其中 `else` 可选。例如：

```json
{
  "type": "object",
  "if": { "properties": { "foo": { "minimum": 10 } } },
  "then": { "required": ["bar"] },
  "else": { "required": ["baz"] }
}
```

这意味着，若传入的 `foo` 属性值大于等于 10 时，则必须同时提供 `then` 所要求的 `bar` 属性；否则必须同时提供 `else` 所要求的 `baz` 属性。

总结一下，Webpack 官方选择 `ajv` 作用配置参数的校验工具，并将其二次封装为 `schema-utils` 库，供 Webpack 生态下的诸多 Loader、Plugin 使用。

而上面介绍的基础类型、类型校验、复合校验规则等内容是 `ajv` 非常基础且重要的知识点，三者协作组成 `ajv` 校验 `schema` 的框架结构，除此之外还有许多增强 Schema 表述能力的增强指令，包括：`$data`、`$ref`、`definitions` 等，篇幅关系这里不一一列举。同学们也可以参考 Webpack 官方编写的 [Schema 文件](https://github1s.com/webpack/webpack/blob/HEAD/schemas/WebpackOptions.json)，学习各种校验规则的写法。

## 使用 `loader-utils`

在 Webpack5 之前，[loader-utils](https://github.com/webpack/loader-utils) 是一个非常重要的 Loader 开发辅助工具，为开发者提供了诸如 `getOptions/getCurrentRequest/parseQuery` 等核心接口，这些接口被诸多 Loader 广泛使用，到 Webpack5 之后干脆将这部分能力迁移到 Loader Context，致使 `loader-utils` 被大幅裁减简化。

被裁减后的 `loader-utils` 仅保留了四个接口：

- `urlToRequest`：用于将模块路径转换为文件路径的工具函数；
- `isUrlRequest`：用于判定字符串是否为模块请求路径；
- `getHashDigest`：用于计算内容 Hash 值；
- `interpolateName`：用于拼接文件名的模板工具；

翻阅大量 Loader 源码后发现，前三个接口使用率极低，实用性不大，因此本文直接跳过，仅侧重介绍 `interpolateName` 接口。

> 使用 `interpolateName` 拼接文件名

Webpack 支持以类似 `[path]/[name]-[hash].js` 方式设定 `output.filename` 即输出文件的命名，这一层规则通常不需要关注，但在编写类似 [webpack-contrib/file-loader](https://github.com/webpack-contrib/file-loader) 这种自行输出产物文件的 Loader 时，需要由开发者自行处理产物路径逻辑。

此时可以使用 `loader-utils` 提供的 `interpolateName` 方法在 Loader 中以类似 Webpack 的 `output.filename` 规则拼接资源路径及名称，例如：

```js
// file-loader/src/index.js
import { interpolateName } from 'loader-utils'

export default function loader(content) {
  const context = options.context || this.rootContext
  const name = options.name || '[contenthash].[ext]'

  // 拼接最终输出的名称
  const url = interpolateName(this, name, {
    context,
    content,
    regExp: options.regExp,
  })

  let outputPath = url
  // ...

  let publicPath = `__webpack_public_path__ + ${JSON.stringify(outputPath)}`
  // ...

  if (typeof options.emitFile === 'undefined' || options.emitFile) {
    // ...

    // 提交、写出文件
    this.emitFile(outputPath, content, null, assetInfo)
  }
  // ...

  const esModule = typeof options.esModule !== 'undefined' ? options.esModule : true

  // 返回模块化内容
  return `${esModule ? 'export default' : 'module.exports ='} ${publicPath};`
}

export const raw = true
```

代码的核心逻辑：

1. 根据 Loader 配置，调用 `interpolateName` 方法拼接目标文件的完整路径；
2. 调用上下文 `this.emitFile` 接口，写出文件；
3. 返回 `module.exports = ${publicPath}` ，其它模块可以引用到该文件路径。

> 提示：除 `file-loader` 外，`css-loader`、`eslint-loader` 都有用到该接口，感兴趣的同学请自行前往查阅源码。

`interpolateName` 功能稍弱于 Webpack 的 [Template String](https://webpack.js.org/configuration/output/#template-strings) 规则，仅支持如下占位符：

- `[ext]`：原始资源文件的扩展名，如 `.js`；
- `[name]`：原始文件名；
- `[path]`：原始文件相对 `context` 参数的路径；
- `[hash]`：原始文件的内容 Hash 值，与 `output.file` 类似同样支持 `[hash:length]` 指定 Hash 字符串的长度；
- `[contenthash]`：作用、用法都与上述 `[hash]` 一模一样。

## 综合示例：Vue-loader

接下来，我们再结合 [vue-loader](https://vue-loader.vuejs.org/) 源码进一步学习 Loader 开发的进阶技巧。`vue-loader` 是一个综合性很强的示例，它借助 Webpack 与组件的一系列特性巧妙地解决了：如何区分 Vue SFC 不同代码块，并复用其它 Loader 处理不同区块的内容？

先从结构说起，`vue-loader` 内部实际上包含了三个组件：

- `lib/index.js` 定义的 Normal Loader，负责将 Vue SFC 不同区块转化为 JavaScript `import` 语句，具体逻辑下面细讲；
- `lib/loaders/pitcher.js` 定义的 Pitch Loader，负责遍历的 `rules` 数组，拼接出完整的行内引用路径；
- `lib/plugin.js` 定义的插件，负责初始化编译环境，如复制原始 `rules` 配置等；

三者协作共同完成对 SFC 的处理，使用时需要用户同时注册 Normal Loader 和 Plugin，如：

```js
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  module: {
    rules: [
      {
        test: /.vue$/,
        use: [{ loader: 'vue-loader' }],
      },
    ],
  },
  plugins: [new VueLoaderPlugin()],
}
```

`vue-loader` 运行过程大致上可以划分为两个阶段：

1. 预处理阶段：动态修改 Webpack 配置，注入 `vue-loader` 专用的一系列 `module.rules`；
2. 内容处理阶段：Normal Loader 配合 Pitch Loader 完成文件内容转译。

### 预处理阶段

`vue-loader` 插件会在 `apply` 函数中动态修改 Webpack 配置，核心代码如下：

```js
class VueLoaderPlugin {
  apply(compiler) {
    // ...

    const rules = compiler.options.module.rules
    // ...

    const clonedRules = rules
      .filter(r => r !== rawVueRules)
      .map(rawRule => cloneRule(rawRule, refs))

    // ...

    // global pitcher (responsible for injecting template compiler loader & CSS
    // post loader)
    const pitcher = {
      loader: require.resolve('./loaders/pitcher'),
      resourceQuery: query => {
        if (!query) {
          return false
        }
        const parsed = qs.parse(query.slice(1))
        return parsed.vue != null
      },
      // ...
    }

    // replace original rules
    compiler.options.module.rules = [pitcher, ...clonedRules, ...rules]
  }
}

function cloneRule(rawRule, refs) {
  // ...
}

module.exports = VueLoaderPlugin
```

拆开来看，插件主要完成两个任务：

1. 初始化并注册 Pitch Loader：代码第 16 行，定义 pitcher 对象，指定 loader 路径为 `require.resolve('./loaders/pitcher')` ，并将 pitcher 注入到 `rules` 数组首位。

这种动态注入的好处是用户不用关注 —— 不去看源码根本不知道还有一个 pitcher loader，而且能保证 pitcher 能在其他 rule 之前执行，确保运行顺序。

2. 复制 `rules` 配置：代码第 8 行遍历 `compiler.options.module.rules` 数组，也就是用户提供的 Webpack 配置中的 `module.rules` 项，对每个 rule 执行 `cloneRule` 方法复制规则对象。

之后，将 Webpack 配置修改为 `[pitcher, …clonedRules, …rules]` 。感受一下实际效果，例如：

```js
module.exports = {
  module: {
    rules: [
      {
        test: /.vue$/i,
        use: [{ loader: 'vue-loader' }],
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.js$/i,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', { targets: 'defaults' }]],
          },
        },
      },
    ],
  },
  plugins: [new VueLoaderPlugin(), new MiniCssExtractPlugin({ filename: '[name].css' })],
}
```

这里定义了三个 rule，分别对应 vue、js、css 文件。经过 plugin 转换之后的结果大概为：

```js
module.exports = {
  module: {
    rules: [
      {
        loader: '/node_modules/vue-loader/lib/loaders/pitcher.js',
        resourceQuery: () => {},
        options: {},
      },
      {
        resource: () => {},
        resourceQuery: () => {},
        use: [
          {
            loader: '/node_modules/mini-css-extract-plugin/dist/loader.js',
          },
          { loader: 'css-loader' },
        ],
      },
      {
        resource: () => {},
        resourceQuery: () => {},
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env', { targets: 'defaults' }]],
            },
            ident: 'clonedRuleSet-2[0].rules[0].use',
          },
        ],
      },
      {
        test: /\.vue$/i,
        use: [{ loader: 'vue-loader', options: {}, ident: 'vue-loader-options' }],
      },
      {
        test: /\.css$/i,
        use: [
          {
            loader: '/node_modules/mini-css-extract-plugin/dist/loader.js',
          },
          { loader: 'css-loader' },
        ],
      },
      {
        test: /\.vue$/i,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env', { targets: 'defaults' }]],
            },
            ident: 'clonedRuleSet-2[0].rules[0].use',
          },
        ],
      },
    ],
  },
}
```

转换之后生成 6 个 rule，按定义的顺序分别为：

1. 针对 `xx.vue&vue` 格式路径生效的规则，只用了 `vue-loader` 的 Pitch 作为 Loader；
2. 被复制的 CSS 处理规则，`use` 数组与开发者定义的规则相同；
3. 被复制的 JS 处理规则，`use` 数组也跟开发者定义的规则相同；
4. 开发者定义的 `vue-loader` 规则，内容及配置都不变；
5. 开发者定义的 css 规则，用到 `css-loader`、`mini-css-extract-plugin loader`；
6. 开发者定义的 js 规则，用到 `babel-loader`。

可以看到，第 2、3 项是从开发者提供的配置中复制过来的，内容相似，只是 `cloneRule` 在复制过程会给这些规则重新定义 `resourceQuery` 函数：

```js
function cloneRule(rawRule, refs) {
  const rules = ruleSetCompiler.compileRules(
    `clonedRuleSet-${++uid}`,
    [
      {
        rules: [rawRule],
      },
    ],
    refs
  )

  const conditions = rules[0].rules
    .map(rule => rule.conditions)
    // shallow flat
    .reduce((prev, next) => prev.concat(next), [])

  // ...

  const res = Object.assign({}, rawRule, {
    resource: resources => {
      currentResource = resources
      return true
    },
    resourceQuery: query => {
      if (!query) {
        return false
      }
      const parsed = qs.parse(query.slice(1))
      if (parsed.vue == null) {
        return false
      }
      if (!conditions) {
        return false
      }
      // 用import路径的lang参数测试是否适用于当前rule
      const fakeResourcePath = `${currentResource}.${parsed.lang}`
      for (const condition of conditions) {
        // add support for resourceQuery
        const request = condition.property === 'resourceQuery' ? query : fakeResourcePath
        if (condition && !condition.fn(request)) {
          return false
        }
      }
      return true
    },
  })
  // ...

  return res
}
```

`cloneRule` 内部定义的 `resourceQuery` 函数对应 [module.rules.resourceQuery](https://webpack.js.org/configuration/module/#ruleresourcequery) 配置项，与我们经常用的 `test` 差不多，都用于判断资源路径是否适用这个 rule。这里 `resourceQuery` 核心逻辑就是取出路径中的 lang 参数，伪造一个以 `lang` 结尾的路径，传入 rule 的 condition 中测试路径名对该 rule 是否生效，例如下面这种会命中 `/\.js$/i` 规则：

```js
import script from './index.vue?vue&type=script&lang=js&'
```

`vue-loader` 正是基于这一规则，为不同内容块 \(css/js/template\) 匹配、复用用户所提供的 rule 设置。

### 内容处理阶段

插件处理完配置，webpack 运行起来之后，Vue SFC 文件会被多次传入不同的 Loader，经历多次中间形态变换之后才产出最终的 js 结果，大致上可以分为如下步骤：

1. 路径命中 `/\.vue$/i` 规则，调用 `vue-loader` 生成中间结果 A；
2. 结果 A 命中 `xx.vue?vue` 规则，调用 `vue-loader` Pitch Loader 生成中间结果 B；
3. 结果 B 命中具体 Loader，直接调用 Loader 做处理。

过程大致为：

![](_attachment/img/23613f6d151cdc25ffac44f92942a38c_MD5.png)

举个转换过程的例子：

```js
// 原始代码
import xx from './index.vue'
// 第一步，命中 vue-loader，转换为：
import {
  render,
  staticRenderFns,
} from './index.vue?vue&type=template&id=2964abc9&scoped=true&'
import script from './index.vue?vue&type=script&lang=js&'
export * from './index.vue?vue&type=script&lang=js&'
import style0 from './index.vue?vue&type=style&index=0&id=2964abc9&scoped=true&lang=css&'

// 第二步，命中 pitcher，转换为：
export * from '-!../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../node_modules/vue-loader/lib/index.js??vue-loader-options!./index.vue?vue&type=template&id=2964abc9&scoped=true&'
import mod from '-!../../node_modules/babel-loader/lib/index.js??clonedRuleSet-2[0].rules[0].use!../../node_modules/vue-loader/lib/index.js??vue-loader-options!./index.vue?vue&type=script&lang=js&'
export default mod
export * from '-!../../node_modules/babel-loader/lib/index.js??clonedRuleSet-2[0].rules[0].use!../../node_modules/vue-loader/lib/index.js??vue-loader-options!./index.vue?vue&type=script&lang=js&'
export * from '-!../../node_modules/mini-css-extract-plugin/dist/loader.js!../../node_modules/css-loader/dist/cjs.js!../../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../../node_modules/vue-loader/lib/index.js??vue-loader-options!./index.vue?vue&type=style&index=0&id=2964abc9&scoped=true&lang=css&'

// 第三步，根据行内路径规则按序调用loader
```

每一步的细节，请继续往下看。

> 第一次执行 vue-loader

在运行阶段，根据配置规则， Webpack 首先将原始的 SFC 内容传入 `vue-loader`，例如对于下面的代码：

```html
// main.js import xx from 'index.vue'; // index.vue 代码
<template>
  <div class="root">hello world</div>
</template>

<script>
  export default {
    data() {},
    mounted() {
      console.log('hello world')
    },
  }
</script>

<style scoped>
  .root {
    font-size: 12px;
  }
</style>
```

此时 **第一次** 执行 vue-loader ，执行如下逻辑：

1. 调用 `@vue/component-compiler-utils` 包的 parse 函数，将 SFC 文本解析为 AST 对象；
2. 遍历 AST 对象属性，转换为特殊的引用路径；
3. 返回转换结果。

对于上述 `index.vue` 内容，转换结果为：

```js
import { render, staticRenderFns } from "./index.vue?vue&type=template&id=2964abc9&scoped=true&"
import script from "./index.vue?vue&type=script&lang=js&"
export * from "./index.vue?vue&type=script&lang=js&"
import style0 from "./index.vue?vue&type=style&index=0&id=2964abc9&scoped=true&lang=css&"


/* normalize component */
import normalizer from "!../../node_modules/vue-loader/lib/runtime/componentNormalizer.js"
var component = normalizer(
  script,
  render,
  staticRenderFns,
  false,
  null,
  "2964abc9",
  null

)

...
export default component.exports
```

注意，这里并没有真的处理 block 里面的内容，而是简单地针对不同类型的内容块生成 import 语句：

- Script：`"./index.vue?vue&type=script&lang=js&"`
- Template: `"./index.vue?vue&type=template&id=2964abc9&scoped=true&"`
- Style: `"./index.vue?vue&type=style&index=0&id=2964abc9&scoped=true&lang=css&"`

这些路径都对应原始的 `.vue` 路径基础上增加了 `vue` 标志符及 type、lang 等参数。

> 执行 Pitch Loader

如前所述，`vue-loader` 插件会在预处理阶段插入带 `resourceQuery` 函数的 Pitch Loader：

```js
const pitcher = {
  loader: require.resolve('./loaders/pitcher'),
  resourceQuery: query => {
    if (!query) {
      return false
    }
    const parsed = qs.parse(query.slice(1))
    return parsed.vue != null
  },
}
```

其中， `resourceQuery` 函数命中 `xx.vue?vue` 格式的路径，也就是说上面 `vue-loader` 转换后的 import 路径会被 Pitch Loader 命中，做进一步处理。Pitch Loader 的逻辑比较简单，做的事情也只是转换 import 路径：

```js
const qs = require('querystring')
...

const dedupeESLintLoader = loaders => {...}

const shouldIgnoreCustomBlock = loaders => {...}

// 正常的loader阶段，直接返回结果
module.exports = code => code

module.exports.pitch = function (remainingRequest) {
  const options = loaderUtils.getOptions(this)
  const { cacheDirectory, cacheIdentifier } = options
  // 关注点1： 通过解析 resourceQuery 获取loader参数
  const query = qs.parse(this.resourceQuery.slice(1))

  let loaders = this.loaders

  // if this is a language block request, eslint-loader may get matched
  // multiple times
  if (query.type) {
    // if this is an inline block, since the whole file itself is being linted,
    // remove eslint-loader to avoid duplicate linting.
    if (/\.vue$/.test(this.resourcePath)) {
      loaders = loaders.filter(l => !isESLintLoader(l))
    } else {
      // This is a src import. Just make sure there's not more than 1 instance
      // of eslint present.
      loaders = dedupeESLintLoader(loaders)
    }
  }

  // remove self
  loaders = loaders.filter(isPitcher)

  // do not inject if user uses null-loader to void the type (#1239)
  if (loaders.some(isNullLoader)) {
    return
  }

  const genRequest = loaders => {
    ...
  }

  // Inject style-post-loader before css-loader for scoped CSS and trimming
  if (query.type === `style`) {
    const cssLoaderIndex = loaders.findIndex(isCSSLoader)
    if (cssLoaderIndex > -1) {
      ...
      return query.module
        ? `export { default } from  ${request}; export * from ${request}`
        : `export * from ${request}`
    }
  }

  // for templates: inject the template compiler & optional cache
  if (query.type === `template`) {
    .​..
    // console.log(request)
    // the template compiler uses esm exports
    return `export * from ${request}`
  }

  // if a custom block has no other matching loader other than vue-loader itself
  // or cache-loader, we should ignore it
  if (query.type === `custom` && shouldIgnoreCustomBlock(loaders)) {
    return ``
  }

  const request = genRequest(loaders)
  return `import mod from ${request}; export default mod; export * from ${request}`
}
```

核心功能是遍历用户定义的 rule 数组，拼接出完整的行内引用路径，例如：

```js
// 开发代码：
import xx from 'index.vue'
// 第一步，通过vue-loader转换成带参数的路径
import script from './index.vue?vue&type=script&lang=js&'
// 第二步，在 pitcher 中解读loader数组的配置，并将路径转换成完整的行内路径格式
import mod from '-!../../node_modules/babel-loader/lib/index.js??clonedRuleSet-2[0].rules[0].use!../../node_modules/vue-loader/lib/index.js??vue-loader-options!./index.vue?vue&type=script&lang=js&'
```

> 第二次执行 vue-loader

通过上面 `vue-loader` -> Pitch Loader 处理后，会得到一个新的行内路径，例如：

```js
import mod from '-!../../node_modules/babel-loader/lib/index.js??clonedRuleSet-2[0].rules[0].use!../../node_modules/vue-loader/lib/index.js??vue-loader-options!./index.vue?vue&type=script&lang=js&'
```

以这个 import 语句为例，之后 Webpack 会按照下述逻辑运行：

- 调用 `vue-loader` 处理 `index.js` 文件；
- 调用 `babel-loader` 处理上一步返回的内容。

这就给了 `vue-loader` 第二次执行的机会，再回过头来看看 `vue-loader` 的代码：

```js
module.exports = function (source) {
  // ...

  const {
    target,
    request,
    minimize,
    sourceMap,
    rootContext,
    resourcePath,
    resourceQuery = '',
  } = loaderContext
  // ...

  const descriptor = parse({
    source,
    compiler: options.compiler || loadTemplateCompiler(loaderContext),
    filename,
    sourceRoot,
    needMap: sourceMap,
  })

  // if the query has a type field, this is a language block request
  // e.g. foo.vue?type=template&id=xxxxx
  // and we will return early
  if (incomingQuery.type) {
    return selectBlock(
      descriptor,
      loaderContext,
      incomingQuery,
      !!options.appendExtension
    )
  }
  //...
  return code
}

module.exports.VueLoaderPlugin = plugin
```

第二次运行时由于路径已经带上了 `type` 参数，会命中上面第 26 行的判断语句，进入 `selectBlock` 函数，这个函数的逻辑很简单：

```js
module.exports = function selectBlock(descriptor, loaderContext, query, appendExtension) {
  // template
  if (query.type === `template`) {
    if (appendExtension) {
      loaderContext.resourcePath += '.' + (descriptor.template.lang || 'html')
    }
    loaderContext.callback(null, descriptor.template.content, descriptor.template.map)
    return
  }

  // script
  if (query.type === `script`) {
    if (appendExtension) {
      loaderContext.resourcePath += '.' + (descriptor.script.lang || 'js')
    }
    loaderContext.callback(null, descriptor.script.content, descriptor.script.map)
    return
  }

  // styles
  if (query.type === `style` && query.index != null) {
    const style = descriptor.styles[query.index]
    if (appendExtension) {
      loaderContext.resourcePath += '.' + (style.lang || 'css')
    }
    loaderContext.callback(null, style.content, style.map)
    return
  }

  // custom
  if (query.type === 'custom' && query.index != null) {
    const block = descriptor.customBlocks[query.index]
    loaderContext.callback(null, block.content, block.map)
    return
  }
}
```

至此，就可以完成从 Vue SFC 文件中抽取特定 Block 内容，并复用用户定义的其它 Loader 加载这些 Block。

### 小结

综上，我们可以将 `vue-loader` 的核心逻辑总结为：

1. 首先给原始文件路径增加不同的参数，后续配合 `resourceQuery` 参数就可以分开处理这些内容，这样的实现相比于一次性处理，逻辑更清晰简洁，更容易理解；
2. 经过 Normal Loader、Pitch Loader 两个阶段后，SFC 内容会被转化为 `import xxx from '!-babel-loader!vue-loader?xxx'` 格式的引用路径，以此复用用户配置。

## 总结

Loader 主要负责将资源内容转换为 Webpack 能够理解的 JavaScript 代码形式，开发时我们可以借助 [Loader Context](https://webpack.js.org/api/loaders/#the-loader-context) 提供的丰富接口实现各种各样的诉求。此外，也需要结合 Loader 的链式调用模型，尽可能设计出复用性更强，更简洁的资源加载器。

本文主要介绍如何使用 `schema-utils` 与 `loader-utils` 工具实现更多 Loader 进阶特性，并进一步剖析 `vue-loader` 源码，讲解如何构建一个成熟的 Webpack Loader 组件。我们可以总结一些常用的开发方法论，包括：

- Loader 主要负责将资源内容转译为 Webpack 能够理解、处理的标准 JavaScript 形式，所以通常需要做 Loader 内通过 `return`/`this.callback` 方式返回翻译结果；
- Loader Context 提供了许多实用接口，我们可以借助这些接口读取上下文信息，或改变 Webpack 运行状态\(相当于产生 Side Effect，例如通过 `emitFile` 接口\)；
- 假若我们开发的 Loader 需要对外提供配置选项，建议使用 `schema-utils` 校验配置参数是否合法；
- 假若 Loader 需要生成额外的资源文件，建议使用 `loader-utils` 拼接产物路径；
- 执行时，Webpack 会按照 `use` 定义的顺序从前到后执行 Pitch Loader，从后到前执行 Normal Loader，我们可以将一些预处理逻辑放在 Pitch 中\(如 `vue-loader`\)；
- 等等。

最后，建议你同步翻阅一些知名 Loader 的源码\(如：css-loader/babel-loader/file-loader 等\)，结合这两篇文章介绍的知识点与方法论，透彻理解 Webpack Loader 的开发方式。
