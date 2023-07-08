---
aliases: []
tags: ['infrastructure/bundler/Webpack', 'date/2023-03', 'year/2023', 'month/03']
date: 2023-03-10-星期五 17:00:18
update: 2023-03-10-星期五 18:14:06
---

Webpack 对外提供了 Loader 与 Plugin 两种扩展方式，其中 Loader 职责比较单一，开发方法比较简单容易理解；Plugin 则功能强大，借助 Webpack 数量庞大的 Hook，我们几乎能改写 Webpack 所有特性，但也伴随着巨大的开发复杂度。

学习如何开发 Webpack 插件并不是一件简单的事情，力求足够全面地剖析如何开发一款成熟、稳定的插件。本文将聚焦在插件代码形态、插件架构、Hook 与上下文参数等内容，同时深入剖析若干常用插件的实现原理，帮你构建起关于 Webpack 插件开发的基本认知。

## 插件简介

从形态上看，插件通常是一个带有 `apply` 函数的类，如：

```js
class SomePlugin {
  apply(compiler) {}
}
```

Webpack 在启动时会调用插件对象的 `apply` 函数，并以参数方式传递核心对象 `compiler` ，以此为起点，插件内可以注册 `compiler` 对象及其子对象的钩子\([Hook](https://webpack.js.org/api/plugins/)\) 回调，例如：

```js
class SomePlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('SomePlugin', compilation => {
      compilation.addModule(/* ... */)
    })
  }
}
```

示例中的 `compiler` 为 Hook 挂载的对象；`thisCompilation` 为 Hook 名称；后面调用的 `tap` 为调用方式，支持 `tap/tapAsync/tapPromise` 等。

在 Webpack 运行过程中，随着构建流程的推进会触发各个钩子回调，并传入上下文参数\(例如上例回调函数中的 `compilation` 对象\)，插件可以通过调用上下文接口、修改上下文状态等方式「篡改」构建逻辑，从而将扩展代码「勾入」到 Webpack 构建流程中。

> 提示：网上不少资料将 Webpack 的插件架构归类为“事件/订阅”模式，我认为这种归纳有失偏颇。订阅模式是一种 **松散耦合结构**，发布器只是在特定时机发布事件消息，订阅者并不或者很少与事件源直接发生交互。

基于 Hook 这一设计，开发插件时我们需要重点关注两个问题：

1. 针对插件需求，我们应该使用什么钩子？
2. 选定钩子后，我怎么跟上下文参数交互？

> 什么时候会触发什么钩子：

Webpack5 暴露了多达 200+ 个 Hook，基本上覆盖了整个构建流程的所有环节 —— 这也就意味着通过编写插件，我们几乎可以改写 Webpack 的所有执行逻辑。问题是，我们在什么情况下该用什么钩子？这就需要了解 Webpack 内部几个核心对象，以及各对象下 Hook 的触发时机，例如：

- [Compiler](https://webpack.js.org/api/compiler-hooks/)：全局构建管理器，Webpack 启动后会首先创建 `compiler` 对象，负责管理配置信息、Loader、Plugin 等。从启动构建到结束，`compiler` 大致上会触发如下钩子：

![](_attachment/img/bc6a5e4a913853e318b1170f3fe5dba8_MD5.png)

- [Compilation](https://webpack.js.org/api/compilation-hooks/)：单次构建过程的管理器，负责遍历模块，执行编译操作；当 `watch = true` 时，每次文件变更触发重新编译，都会创建一个新的 `compilation` 对象；`compilation` 生命周期中主要触发如下钩子：

![](_attachment/img/a1493f235165c2dd5f2da379753fa45e_MD5.png)

- 此外，还有 [Module](https://webpack.js.org/api/normalmodulefactory-hooks/)、Resolver、[Parser](https://webpack.js.org/api/parser/)、Generator 等关键类型，也都相应暴露了许多 Hook。

由此可见，Webpack Hook 与构建流程强相关，使用时你结合上面流程图分析 Hook 对应的流程环节，以及这个环节主要完成了什么工作，可以借助 Hook 做出哪些修改，等等。

> 使用 Hook 上下文接口：

Webpack Hook 有两个重点，一是上面介绍的触发时机；二是触发时传递的上下文参数。例如：

- `compiler.hooks.compilation` ：
  - 时机：Webpack 刚启动完，创建出 `compilation` 对象后触发；
  - 参数：当前编译的 `compilation` 对象。
- `compiler.hooks.make`：
  - 时机：正式开始构建时触发；
  - 参数：同样是当前编译的 `compilation` 对象。
- `compilation.hooks.optimizeChunks` ：
  - 时机： `seal` 函数中，`chunk` 集合构建完毕后触发；
  - 参数：`chunks` 集合与 `chunkGroups` 集合。
- `compiler.hooks.done`：
  - 时机：编译完成后触发；
  - 参数： `stats` 对象，包含编译过程中的各类统计信息。

每个钩子传递的上下文参数不同，但主要包含如下几种类型\(以 Webpack5 为例\)：

- [complation](https://github1s.com/webpack/webpack/blob/HEAD/lib/Compilation.js) 对象：构建管理器，使用率非常高，主要提供了一系列与单次构建相关的接口，包括：
  - `addModule`：用于添加模块，例如 Module 遍历出依赖之后，就会调用该接口将新模块添加到构建需求中；
  - `addEntry`：添加新的入口模块，效果与直接定义 `entry` 配置相似；
  - `emitAsset`：用于添加产物文件，效果与 Loader Context 的 `emitAsset` 相同；
  - `getDependencyReference`：从给定模块返回对依赖项的引用，常用于计算模块引用关系；
  - 等等。
- [compiler](https://github1s.com/webpack/webpack/blob/HEAD/lib/Compiler.js) 对象：全局构建管理器，提供如下接口：
  - `createChildCompiler`：创建子 `compiler` 对象，子对象将继承原始 Compiler 对象的所有配置数据；
  - `createCompilation`：创建 `compilation` 对象，可以借此实现并行编译；
  - `close`：结束编译；
  - `getCache`：获取缓存接口，可借此复用 Webpack5 的缓存功能；
  - `getInfrastructureLogger`：获取 [日志对象](https://webpack.js.org/configuration/other-options/#infrastructurelogging)；
  - 等等。
- [module](https://github1s.com/webpack/webpack/blob/HEAD/lib/NormalModule.js) 对象：资源模块，有诸如 `NormalModule/RawModule/ContextModule` 等子类型，其中 `NormalModule` 使用频率较高，提供如下接口：
  - `identifier`：读取模块的唯一标识符；
  - `getCurrentLoader`：获取当前正在执行的 Loader 对象；
  - `originalSource`：读取模块原始内容；
  - `serialize/deserialize`：模块序列化与反序列化函数，用于实现持久化缓存，一般不需要调用；
  - `issuer`：模块的引用者；
  - `isEntryModule`：用于判断该模块是否为入口文件；
  - 等等。
- [chunk](https://github1s.com/webpack/webpack/blob/HEAD/lib/Chunk.js) 对象：模块封装容器，提供如下接口：
  - `addModule`：添加模块，之后该模块会与 Chunk 中其它模块一起打包，生成最终产物；
  - `removeModule`：删除模块；
  - `containsModule`：判断是否包含某个特定模块；
  - `size`：推断最终构建出的产物大小；
  - `hasRuntime`：判断 Chunk 中是否包含运行时代码；
  - `updateHash`：计算 Hash 值。
- [stats](https://webpack.js.org/api/stats/) 对象：构建过程收集到的统计信息，包括模块构建耗时、模块依赖关系、产物文件列表等。

> 提示：无论官网还是社区，我都没有找到完整介绍这些对象的，足够好、足够完备的文档，且 Webpack 本身还在不断升级迭代，许多内部对象的接口并不稳定，建议读者使用时直接翻阅相关版本源码。

篇幅关系，我们只对部分重要接口做了简单介绍，后面我还会讲解各种常用插件源码，展开介绍部分常见接口的使用方法。

总结一下，Webpack 的插件体系与平常所见的 `订阅/发布` 模式差别很大，是一种非常强耦合的设计，Hook 回调由 Webpack 决定何时，以何种方式执行；而在 Hook 回调内部可以通过调用上下文 API 、修改上下文状态等方式，对 Webpack 原定流程产生 Side Effect。

所以想熟练编写插件，需要深入理解常见 Hook 调用时机，以及各类上下文参数的用法，这方面没有太多学习资料，我建议直接翻阅相关开源插件源码，下面我会抽几个比较经典、逻辑简单、容易理解的插件，剖析如何灵活使用 Hook。

## 实例剖析：`imagemin-webpack-plugin`

> 学习如何遍历、修改最终产物文件

[imagemin-webpack-plugin](https://github1s.com/Klathmon/imagemin-webpack-plugin) 是一个用于实现图像压缩的插件，它会在 Webpack 完成前置的代码分析构建，提交\([emit](https://webpack.js.org/api/compiler-hooks/#emit)\) 产物时，找出所有图片资源并调用 [imagemin](https://github.com/imagemin/imagemin) 压缩图像。核心逻辑：

```js
export default class ImageminPlugin {
  constructor(options = {}) {
    // init options
  }

  apply(compiler) {
    // ...
    const onEmit = async (compilation, callback) => {
      // ...
      await Promise.all([
        ...this.optimizeWebpackImages(throttle, compilation),
        ...this.optimizeExternalImages(throttle),
      ])
    }

    compiler.hooks.emit.tapAsync(this.constructor.name, onEmit)
  }

  optimizeWebpackImages(throttle, compilation) {}

  optimizeExternalImages(throttle) {}
}
```

上述代码主要用到 `compiler.hooks.emit` 钩子，该钩子在 Webpack 完成代码构建与打包操作，准备将产物发送到输出目录之前执行，我们可以在此修改产物内容，如上例 `optimizeWebpackImages` 函数：

```js
export default class ImageminPlugin {
  optimizeWebpackImages(throttle, compilation) {
    const {
      // 用于判断是否对特定文件做图像压缩操作
      testFunction,
      // 缓存目录
      cacheFolder,
    } = this.options

    // 遍历 `assets` 产物数组
    return map(compilation.assets, (asset, filename) =>
      throttle(async () => {
        // 读取产物内容
        const assetSource = asset.source()
        if (testFunction(filename, assetSource)) {
          // 尝试从缓存中读取
          let optimizedImageBuffer = await getFromCacheIfPossible(
            cacheFolder,
            assetSource,
            () => {
              // 调用 `imagemin` 压缩图片
              return optimizeImage(assetSource, this.options)
            }
          )

          // 之后，使用优化版本替换原始文件
          compilation.assets[filename] = new RawSource(optimizedImageBuffer)
        }
      })
    )
  }
}
```

这里面的关键逻辑是：

1. 遍历 `compilation.assets` 产物列表，调用 `asset.source()` 方法读取产物内容；
2. 调用 `imagemin` 压缩图片；
3. 修改 `compilation.assets`，使用优化后的图片 `RawSource` 对象替换原始 `asset` 对象。

至此完成文件压缩操作。

> 提示：`Source` 是 Webpack 内代表资源内容的类，由 [webpack-source](https://github1s.com/webpack/webpack-sources/blob/HEAD/lib/index.js) 库实现，支持 `RawSource/ConcatSource` 等子类型，用于实现文件读写、合并、修改、Sourcemap 等操作。

## 实例剖析：`eslint-webpack-plugin`

> 学习如何提交错误日志

[eslint-webpack-plugin](https://github1s.com/webpack-contrib/eslint-webpack-plugin) 是一个基于 ESLint 实现的代码风格检查插件，它的实现比较巧妙，一是使用多个 Hook，在不同时间点执行 Lint 检查；二是复用 Webpack 内置的 `error/warn` 方法提交代码风格问题。核心逻辑：

```js
class ESLintWebpackPlugin {
  constructor(options = {}) {
    // ...
  }

  apply(compiler) {
    compiler.hooks.run.tapPromise(this.key, c => this.run(c, options, wanted, exclude))
  }

  async run(compiler, options, wanted, exclude) {
    compiler.hooks.compilation.tap(this.key, compilation => {
      ;({ lint, report, threads } = linter(this.key, options, compilation))

      const files = []

      // 单个模块成功编译后触发
      compilation.hooks.succeedModule.tap(this.key, ({ resource }) => {
        // 判断是否需要检查该文件
        if (
          isMatch(file, wanted, { dot: true }) &&
          !isMatch(file, exclude, { dot: true })
        ) {
          lint(file)
        }
      })

      // 所有模块构建完毕后触发
      compilation.hooks.finishModules.tap(this.key, () => {
        if (files.length > 0 && threads <= 1) {
          lint(files)
        }
      })

      // 等待检查结果
      compilation.hooks.additionalAssets.tapPromise(this.key, processResults)

      async function processResults() {}
    })
  }
}
```

代码用到如下 Hook：

- `compiler.hooks.compilation`：Compiler 环境初始化完毕，创建出 `compilation` 对象，准备开始执行构建前触发；
- `compilation.hooks.succeedModule`：Webpack 完成单个「模块」的读入、运行 Loader、AST 分析、依赖分析等操作后触发；
- `compilation.hooks.finishModules`：Webpack 完成「所有」模块的读入、运行 Loader、依赖分析等操作后触发；
- `compilation.hooks.additionalAssets`：构建、打包完毕后触发，通常用于为编译创建附加资产。

其中，比较重要的是借助 `compilation.hooks.succeedModule` 钩子，在每个模块处理完毕之后立即通过 `lint` 函数添加非阻塞代码检查任务，相比于过去的 [eslint-loader](https://www.npmjs.com/package/eslint-loader) 的阻塞式执行，这种方式能够提高 ESLint 的并发度，效率更高。

其次，借助 `compilation.hooks.additionalAssets` 钩子，在所有模块处理完毕后读取检查结果 —— 即 `processResults` 函数，核心代码：

```js
async function processResults() {
  const { errors, warnings } = await report()

  if (warnings && !options.failOnWarning) {
    compilation.warnings.push(warnings)
  } else if (warnings && options.failOnWarning) {
    compilation.errors.push(warnings)
  }

  if (errors && options.failOnError) {
    compilation.errors.push(errors)
  } else if (errors && !options.failOnError) {
    compilation.warnings.push(errors)
  }
}
```

代码读取 ESLint 执行结果\(`report` 函数\)，并使用 `compilation` 的 `errors` 与 `warnings` 数组提交错误/警告信息，这种方式只会输出错误信息，不会中断编译流程，运行效果如：

![](_attachment/img/7dccb6835c444126a8c6e5c53ae4c49b_MD5.png)

## 实例剖析：`DefinePlugin`

> 学习在插件中如何与 AST 结构交互

[DefinePlugin](https://github1s.com/webpack/webpack) 是 Webpack 官方实现的，用于构建时注入预定义常量的插件，先简单回顾一下 [用法](https://webpack.js.org/plugins/define-plugin/)，如：

```js
const { DefinePlugin } = require('webpack')

const baseConfig = {
  // ...
  plugins: [
    new DefinePlugin({
      PROD: true,
      VERSION: JSON.stringify('12.13.0'),
    }),
  ],
}
```

之后，Webpack 会帮我们替换掉代码中所有 `DefinePlugin` 声明的属性值，例如：

```js
// 源码：
console.log(PROD, VERSION)

// 构建结果：
console.log(true, '5fa3b9')
```

`DefinePlugin` 的 [底层实现](https://github1s.com/webpack/webpack/blob/HEAD/lib/DefinePlugin.js) 比较复杂，需要遍历 AST 找出变量名对应的代码位置之后再做替换，插件核心结构：

```js
class DefinePlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap(
      'DefinePlugin',
      (compilation, { normalModuleFactory }) => {
        const handler = parser => {
          // 递归处理 `DefinePlugin` 参数
          const walkDefinitions = (definitions, prefix) => {
            Object.keys(definitions).forEach(key => {
              const code = definitions[key]
              if (isObject /*...*/) {
                // 递归处理对象属性
                walkDefinitions(code, prefix + key + '.')
                applyObjectDefine(prefix + key, code)
                return
              }
              applyDefineKey(prefix, key)
              applyDefine(prefix + key, code)
            })
          }

          // 替换基本类型的表达式值
          const applyDefine = (key, code) => {
            if (!isTypeof) {
              // 借助 expression 钩子替换内容
              parser.hooks.expression.for(key).tap('DefinePlugin', expr => {
                /*...*/
              })
            }
            // 处理 `'typeof window': JSON.stringify('object'),` 场景
            parser.hooks.typeof.for(key).tap('DefinePlugin', expr => {
              /*...*/
            })
          }

          // 替换引用类型的表达式值
          const applyObjectDefine = (key, obj) => {
            // ...
            parser.hooks.expression.for(key).tap('DefinePlugin', expr => {
              /*...*/
            })
          }

          walkDefinitions(definitions, '')
        }

        // 监听 `parser` 钩子
        normalModuleFactory.hooks.parser
          .for('javascript/auto')
          .tap('DefinePlugin', handler)
        normalModuleFactory.hooks.parser
          .for('javascript/dynamic')
          .tap('DefinePlugin', handler)
        normalModuleFactory.hooks.parser
          .for('javascript/esm')
          .tap('DefinePlugin', handler)
      }
    )
  }
}
module.exports = DefinePlugin
```

> 提示：可能有同学注意到，上例代码中出现 `xxx.hooks.xxx.for(condition).tap` 形式的调用，这里的 `for` 函数可以理解为 Hook 的过滤条件，仅在满足 `condition` 时触发，后面章节会详细讲解。

核心逻辑：

1. 使用 `normalModuleFactory.hooks.parser` 钩子\(上例 48 行\)，在 Webpack 创建出代码解析器 `Parser` 对象后执行 `handler` 函数。注意，此时还没有执行代码转 AST 操作；
2. `walkDefinitions` 函数中递归遍历 `DefinePlugin` 参数对象，为每一个属性注册 `parser.hooks.expression` 钩子回调，该钩子会在 Webpack 遍历 AST 过程遇到表达式语句时触发；
3. 在 `parser.hooks.expression` 回调中创建新的 `Dependency` 对象，调用 [addPresentationalDependency](https://github1s.com/webpack/webpack/blob/HEAD/lib/Module.js#L494) 添加为模块依赖：

```js
const toConstantDependency = (parser, value, runtimeRequirements) => {
  return function constDependency(expr) {
    const dep = new ConstDependency(value, expr.range, runtimeRequirements);
    dep.loc = expr.loc;
    // 创建静态依赖对象，替换 loc 指定位置内容
    parser.state.module.addPresentationalDependency(dep);
    return true;
  };
};

const applyDefine = (key, code) => {
  parser.hooks.expression.for(key).tap("DefinePlugin", (expr) => {
    const strCode = toCode(/*...*/);
    if (/*...*/) {
      /*...*/
    } else {
      return toConstantDependency(parser, strCode)(expr);
    }
  });
};
```

之后，Webpack 会借助 Template 接口将上述 `Dependency` 打包进 Chunk 中，替换对应位置\(`loc`\) 代码：

![](_attachment/img/694ae7775ce1847aafe569863bd17ebf_MD5.png)

这是一个功能效果看起来简单，但实现特别复杂的例子，底层需要使用 `Parser` 钩子遍历 AST 结构，之后借助 `Dependency` 声明代码依赖，最后借助 Template 替换代码内容，过程中已经涉及到许多 Webpack 底层对象。

这正是学习开发 Webpack 插件的难点，有时候你不仅仅需要了解每一个 Hook 的时机与作用、如何与上下文参数交互，还需要了解 Webpack 底层许多类型的实现、作用、接口等等，才能写出符合预期的功能，而 Webpack 是一个极度复杂、庞大的工具，这些具体知识点太多太碎，几乎不可能一一枚举。不过，我们可以换一种方式，从更高更抽象的视角审视 Webpack 插件架构，从“道”的角度加深理解。

## 插件架构综述

前端社区里很多有名的框架都各自有一套插件架构，例如 axios、quill、vscode、webpack、vue、rollup 等等。插件架构灵活性高，扩展性强，但通常架构复杂度更高，学习曲线更陡峭。插件架构至少需要解决三个方面的问题：

- **接口**：需要提供一套逻辑接入方法，让开发者能够将代码插入特定环节，变更原始逻辑；
- **输入**：如何将上下文信息高效传导给插件；
- **输出**：插件内部通过何种方式影响整套运行体系。

针对这些问题，webpack 基于 [tapable](https://github.com/webpack/tapable) 实现了：

1. 编译过程的特定节点以钩子形式，通知插件此刻正在发生什么事情；
2. 通过 tapable 提供的回调机制，以参数方式传递上下文信息；
3. 在上下文参数对象中附带了很多存在 Side Effect 的交互接口，插件可以通过这些接口改变。

这一切都离不开 [[tapable]]，举例来说：

```js
class Compiler {
  // 在构造函数中，先初始化钩子对象
  constructor() {
    this.hooks = {
      thisCompilation: new SyncHook(['compilation', 'params']),
    }
  }

  compile() {
    // 特定时机触发特定钩子
    const compilation = new Compilation()
    this.hooks.thisCompilation.call(compilation)
  }
}
```

`Compiler` 类型内部定义了 `thisCompilation` 钩子，并在 `compilation` 创建完毕后发布事件消息，插件开发者就可以基于这个钩子获取到最新创建出的 `compilation` 对象：

```js
class SomePlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('SomePlugin', (compilation, params) => {
      // 上下文信息： compilation、params
    })
  }
}
```

钩子回调传递的 `compilation/params` 参数，就是 Webpack 希望传递给插件的上下文信息，也是插件能拿到的输入。不同钩子会传递不同的上下文对象，这一点在钩子被创建的时候就定下来了，比如：

```js
class Compiler {
  constructor() {
    this.hooks = {
      /** @type {SyncBailHook<Compilation>} */
      shouldEmit: new SyncBailHook(['compilation']),
      /** @type {AsyncSeriesHook<Stats>} */
      done: new AsyncSeriesHook(['stats']),
      /** @type {AsyncSeriesHook<>} */
      additionalPass: new AsyncSeriesHook([]),
      /** @type {AsyncSeriesHook<Compiler>} */
      beforeRun: new AsyncSeriesHook(['compiler']),
      /** @type {AsyncSeriesHook<Compiler>} */
      run: new AsyncSeriesHook(['compiler']),
      /** @type {AsyncSeriesHook<Compilation>} */
      emit: new AsyncSeriesHook(['compilation']),
      /** @type {AsyncSeriesHook<string, Buffer>} */
      assetEmitted: new AsyncSeriesHook(['file', 'content']),
      /** @type {AsyncSeriesHook<Compilation>} */
      afterEmit: new AsyncSeriesHook(['compilation']),
    }
  }
}
```

- `shouldEmit` 会被传入 `compilation` 参数；
- `done` 会被传入 `stats` 参数；
- ……

这一设计贯穿 Webpack 整个执行过程，几乎无处不在，我们可以借此介入 Webpack 的运行逻辑。

插件架构的灵魂就在于，框架自身只负责实现最关键的核心流程，其它具体功能都尽量交给具体插件实现，包括 Webpack 仓库内也会内置非常多插件\(如 `DefinePlugin/EntryPlugin` 等\)，这就为我们提供了非常充分的学习素材。因此，我的建议是：

1. 先透彻理解上述 Webpack 插件架构的设计逻辑，捋清楚 Webpack 主流程与 Hook 之间的关系；
2. 尝试用本文第一节提及的若干常见 Hook 与上下文参数对象编写一些示例，对这些钩子有一个感性认知；
3. 尝试分析一些常用但不是很复杂的插件源码，例如文中提到的 `eslint-webpack-plugin` 等，或者：`terser-webpack-plugin`、`stylelint-webpack-plugin` 等，从中学习一些编写插件的常见方法；
4. 最后，在实际开发时参考相关插件源码实现，带着问题与明确目标，逐行分析插件实现逻辑。

## 日志处理

与 Loader 相似，开发插件时我们也可以复用 Webpack 一系列日志基础设施，包括：

- 通过 `compilation.getLogger` 获取分级日志管理器；
- 使用 `compilation.errors/wraning` 处理异常信息。

下面我们逐一展开介绍。

> 使用分级日志基础设施

在 [[Loader 开发]] 中，我们已经详细介绍了 Webpack 内置的日志接口： [infrastructureLogging](https://webpack.js.org/configuration/other-options/#infrastructurelogging)，与 [log4js](https://github.com/log4js-node/log4js-node)、[winston](https://github.com/winstonjs/winston) 等日志工具类似，借助这一能力我们能实现日志分级筛选能力，适用于处理一些执行过程的日志信息。

开发插件时，我们也能使用这一接口管理日志输出，只是用法稍有不同，如：

```js
const PLUGIN_NAME = 'FooPlugin'

class FooPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      // 获取日志对象
      const logger = compilation.getLogger(PLUGIN_NAME)
      // 调用分级日志接口
      logger.log('Logging from FooPlugin')
      logger.error('Error from FooPlugin')
    })
  }
}

module.exports = FooPlugin
```

> 提示：此外，还可以通过 `compiler.getInfrastructureLogger` 获取日志对象。

上述代码需要调用 `compilation.getLogger` 获取日志对象 `logger`，`logger` 的用法与 Loader 场景相似，同样支持 `verbose/log/info/warn/error` 五种日志分级，此处不再赘述。

> 正确处理异常信息

在 Webpack 插件中，可以通过如下方式提交错误信息。

- 使用 `logger.error/warning` 接口，这种方法同样不会中断构建流程，且能够复用 Webpack 的分级日志体系，由最终用户决定是否输出对应等级日志。
- 借助 `compilation.errors/warnings` 数组，如：

```js
const PLUGIN_NAME = 'FooPlugin'

class FooPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      compilation.errors.push(new Error('Emit Error From FooPlugin'))
      compilation.warnings.push('Emit Warning From FooPlugin')
    })
  }
}

module.exports = FooPlugin
```

执行效果：

![](_attachment/img/9ffab477b6d04940572fdd29fb43b6b7_MD5.png)

这种方法仅记录异常日志，不影响构建流程，构建正常结束后 Webpack 还会将错误信息汇总到 [stats](https://webpack.js.org/api/stats/) 统计对象，方便后续二次处理，使用率极高。例如 [eslint-webpack-plugin](https://github1s.com/webpack-contrib/eslint-webpack-plugin) 就是通过这种方式输出 ESLint 检查出来的代码风格问题。

- 使用 Hook Callback，这种方式可将错误信息传递到 Hook 下一个流程，由 Hook 触发者根据错误内容决定后续处理措施\(中断、忽略、记录日志等\)，如 `imagemin-webpack-plugin` 中：

```js
export default class ImageminPlugin {
  apply(compiler) {
    const onEmit = async (compilation, callback) => {
      try {
        await Promise.all([
          ...this.optimizeWebpackImages(throttle, compilation),
          ...this.optimizeExternalImages(throttle),
        ])

        callback()
      } catch (err) {
        // if at any point we hit a snag, pass the error on to webpack
        callback(err)
      }
    }
    compiler.hooks.emit.tapAsync(this.constructor.name, onEmit)
  }
}
```

上例第 13 行，在 `catch` 块中通过 `callback` 函数传递错误信息。不过，并不是所有 Hook 都会传递 `callback` 函数，实际开发时建议参考相关用例。

- 直接抛出异常，如：

```js
const PLUGIN_NAME = 'FooPlugin'

class FooPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      throw new Error('Throw Error Directly')
    })
  }
}

module.exports = FooPlugin
```

这种方式会导致 Webpack 进程奔溃，多用于插件遇到严重错误，不得不提前中断构建工作的场景。

总的来说，这些方式各自有适用场景，我个人会按如下规则择优选用：

- 多数情况下使用 `compilation.errors/warnings`，柔和地抛出错误信息；
- 特殊场景，需要提前结束构建时，则直接抛出异常；
- 拿捏不准的时候，使用 `callback` 透传错误信息，交由上游调用者自行判断处理措施。

## 上报统计信息

有时候我们需要在插件中执行一些特别耗时的操作，例如：抽取 CSS 代码（如 [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)）、压缩图片（如 [image-minimizer-webpack-plugin](https://github.com/webpack-contrib/image-minimizer-webpack-plugin)）、代码混淆（如 [terser-webpack-plugin](https://github.com/webpack-contrib/terser-webpack-plugin)），这些操作会延长 Webpack 构建的整体耗时，更糟糕的是会阻塞构建主流程，最终用户会感觉到明显卡顿。

针对这种情况，我们可以在插件中上报一些统计信息，帮助用户理解插件的运行进度与性能情况，有两种上报方式：

- 使用 [ProgressPlugin](https://webpack.js.org/plugins/progress-plugin) 插件的 `reportProgress` 接口上报执行进度；
- 使用 [stats](https://webpack.js.org/api/stats/) 接口汇总插件运行的统计数据。

> 使用 `reportProgress` 接口

[ProgressPlugin](https://webpack.js.org/plugins/progress-plugin) 是 Webpack 内置用于展示构建进度的插件，有两种用法：

1. 简化版，执行构建命令时带上 `--progress` 参数，如：

```
npx webpack --progress
```

2. 也可以在 Webpack 配置文件中添加插件实例，如：

```js
const { ProgressPlugin } = require('webpack')

module.exports = {
  //...
  plugins: [
    new ProgressPlugin({
      activeModules: false,
      entries: true,
      handler(percentage, message, ...args) {
        // custom logic
      },
      //...
    }),
  ],
}
```

开发插件时，我们可以使用 `ProgressPlugin` 插件的 `Reporter` 方法提交自定义插件的运行进度，例如：

```js
const { ProgressPlugin } = require('webpack')
const PLUGIN_NAME = 'BlockPlugin'
const wait = misec => new Promise(r => setTimeout(r, misec))
const noop = () => ({})

class BlockPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      compilation.hooks.processAssets.tapAsync(PLUGIN_NAME, async (assets, callback) => {
        const reportProgress = ProgressPlugin.getReporter(compiler) || noop
        const len = 100
        for (let i = 0; i < len; i++) {
          await wait(50)
          reportProgress(i / 100, `Our plugin is working ${i}%`)
        }
        reportProgress(1, 'Done work!')
        await wait(1000)
        callback()
      })
    })
  }
}

module.exports = BlockPlugin
```

> 提示：示例代码已上传到小册 [仓库](https://github.com/Tecvan-fe/webpack-book-samples/blob/main/plugin-progress/package.json)。

示例中，最关键的代码在于第 12 行，即调用 `ProgressPlugin.getReporter` 方法获取 Reporter 函数，之后再用这个函数提交执行进度：

```js
const reportProgress = ProgressPlugin.getReporter(compiler) || noop
```

> 注意：若最终用户没有使用 `ProgressPlugin` 插件，则这个函数会返回 Undefined，所以需要增加 `|| noop` 兜底。

`reportProgress` 接受如下参数：

```js
reportProgress(percentage, ...args)
```

- `percentage`：当前执行进度百分比，但这个参数实际并不生效， `ProgressPlugin` 底层会根据当前处于那个 Hook 计算一个固定的 Progress 百分比值，在自定义插件中无法改变，所以目前来看这个参数值随便填就好；
- `…args`：任意数量字符串参数，这些字符串会被拼接到 Progress 输出的信息。

最终执行效果：

![](_attachment/img/7ad3a12757902229b413bbe3500f8bd1_MD5.gif)

> 通过 `stats` 添加统计信息

[stats](https://webpack.js.org/api/stats/) 是 Webpack 内置的数据统计机制，专门用于收集模块构建耗时、模块依赖关系、产物组成等过程信息，我们可以借此分析、优化应用构建性能（后面章节会展开细讲）。在开发插件时，我们可以借用 `stats` 机制，向用户输出插件各种维度的统计信息，例如：

```js
const PLUGIN_NAME = 'FooPlugin'

class FooPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      const statsMap = new Map()
      // buildModule 钩子将在开始处理模块时触发
      compilation.hooks.buildModule.tap(PLUGIN_NAME, module => {
        const ident = module.identifier()
        const startTime = Date.now()
        // 模拟复杂耗时操作
        // ...
        // ...
        const endTime = Date.now()
        // 记录处理耗时
        statsMap.set(ident, endTime - startTime)
      })

      compilation.hooks.statsFactory.tap(PLUGIN_NAME, factory => {
        factory.hooks.result.for('module').tap(PLUGIN_NAME, (module, context) => {
          const { identifier } = module
          const duration = statsMap.get(identifier)
          // 添加统计信息
          module.fooDuration = duration || 0
        })
      })
    })
  }
}

module.exports = FooPlugin
```

再次执行 Webpack 构建命令，将产出如下 `stats` 统计信息：

```json
{
  "hash": "0a17278b49620a86b126",
  "version": "5.73.0",
  // ...
  "modules": [
    {
      "type": "module",
      "identifier": "/Users/tecvan/studio/webpack-book-samples/target-sample/src/index.js",
      "fooDuration": 124
      /*...*/
    }
    /*...*/
    /*...*/
    /*...*/
  ],
  "assets": [
    /*...*/
  ],
  "chunks": [
    /*...*/
  ],
  "entrypoints": {
    /*...*/
  },
  "namedChunkGroups": {
    /*...*/
  },
  "errors": [
    /*...*/
  ]
}
```

这种方式有许多优点：

- 用户可以直接通过 `stats` 了解插件的运行情况，不需要重复学习其它方式；
- 支持按需执行，用户可通过 [stats](https://webpack.js.org/configuration/stats/) 配置项控制；
- 支持导出为 JSON 或其它文件格式，方便后续接入自动化分析流程。

因此，若明确插件将执行非常重的计算任务，需要消耗比较长的构建时间时，可以通过这种方式上报关键性能数据，帮助用户做好性能分析。

## 校验配置参数

在《[Loader 开发进阶](https://juejin.cn/book/7115598540721618944/section/7119035564862472233)》一文中，我们已经详细介绍了 [schema-utils](https://www.npmjs.com/package/schema-utils) 校验工具的使用方法，开发插件时也使用这一工具校验配置参数，例如：

```js
const { validate } = require('schema-utils')
const schema = {
  /*...*/
}

class FooPlugin {
  constructor(options) {
    validate(schema, options)
  }
}
```

详细用法可自行回顾《[Loader 开发进阶](https://juejin.cn/book/7115598540721618944/section/7119035564862472233)》章节，此处不再赘述。

## 搭建自动测试环境

为 Webpack Loader 编写单元测试收益非常高，一方面对开发者来说，不用重复搭建测试环境、编写测试 demo；一方面对于最终用户来说，带有一定测试覆盖率的项目通常意味着更高、更稳定的质量。插件测试用例开发有两个关键技术点：

1. 如何搭建自动运行 Webpack，并能够读取构建结果的测试环境？
2. 如何分析构建结果，确定插件逻辑符合预期？

> **搭建测试环境**

Webpack 虽然功能非常复杂，但本质上还是一个 Node 程序，所以我们可以使用一些 Node 测试工具搭建自动测试环境，例如 Jest、Karma 等。以 Jest 为例：

1. 安装依赖，考虑到我们即将用 ES6 编写测试用例，这里额外添加了 [babel-jest](https://jestjs.io/docs/getting-started#using-babel) 等包：

```
yarn add -D jest babel-jest @babel/core @babel/preset-env
```

2. 添加 Babel 配置，如：

```js
// babel.config.js
module.exports = {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
}
```

3. 添加 Jest 配置文件，如：

```js
// jest.config.js
module.exports = {
  testEnvironment: 'node',
}
```

到这里，基础环境设置完毕，我们可以开始编写测试用例了。首先需要在测试代码中运行 Webpack，方法很简单，如：

```js
import webpack from 'webpack'

webpack(config).run()
```

这部分逻辑比较通用，许多开源仓库都会将其提取为工具函数，类似于：

```js
import path from 'path'
import webpack from 'webpack'
import { merge } from 'webpack-merge'
import { createFsFromVolume, Volume } from 'memfs'

export function runCompile(options) {
  const opt = merge(
    {
      mode: 'development',
      devtool: false,
      // Mock 项目入口文件
      entry: path.join(__dirname, './enter.js'),
      output: { path: path.resolve(__dirname, '../dist') },
    },
    options
  )

  const compiler = webpack(opt)
  // 使用内存文件系统，节省磁盘 IO 开支
  compiler.outputFileSystem = createFsFromVolume(new Volume())

  return new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) {
        return reject(error)
      }
      return resolve({ stats, compiler })
    })
  })
}
```

有了测试所需的基础环境，以及运行 Webpack 实例的能力之后，我们可以正式开始编写测试用例了。

> **编写测试用例**

Webpack 插件测试的基本逻辑是：在测试框架中运行 Webpack，之后对比分析构建结果、状态等是否符合预期，对比的内容通常有：

- 分析 `compilation.error/warn` 数组是否包含或不包含特定错误、异常信息，通常用于判断 Webpack 是否运行成功；
- 分析构建产物，判断是否符合预期，例如：
  - `image-minimizer-webpack-plugin` 单测中会 [判断](https://github.com/webpack-contrib/image-minimizer-webpack-plugin/blob/master/test/ImageminPlugin.test.js) 最终产物图片有没有经过压缩；
  - `copy-webpack-plugn` 单测中会 [判断](https://github1s.com/webpack-contrib/copy-webpack-plugin/blob/HEAD/test/CopyPlugin.test.js) 文件有没有被复制到产物文件；
  - `mini-css-extract-plugin` 单测中会 [判断](https://github1s.com/webpack-contrib/mini-css-extract-plugin/blob/HEAD/test/TestCases.test.js) CSS 文件有没有被正确抽取出来。

沿着这个思路，我们构造一个简单的测试用例：

```js
import path from 'path'
import { promisify } from 'util'
import { runCompile } from './helpers'
import FooPlugin from '../src/FooPlugin'

describe('foo plugin', () => {
  it('should inject foo banner', async () => {
    const {
      stats: { compilation },
      compiler,
    } = await runCompile({
      plugins: [new FooPlugin()],
    })
    const { warnings, errors, assets } = compilation

    // 判断 warnings、errors 是否报出异常信息
    expect(warnings).toHaveLength(0)
    expect(errors).toHaveLength(0)

    const { path: outputPath } = compilation.options.output
    // 遍历 assets，判断经过插件处理后，产物内容是否符合预期
    await Promise.all(
      Object.keys(assets).map(async name => {
        const pathToEmitted = path.join(outputPath, name)
        const result = await promisify(compiler.outputFileSystem.readFile)(
          pathToEmitted,
          { encoding: 'UTF-8' }
        )
        expect(result.startsWith('// Inject By 范文杰')).toBeTruthy()
      })
    )
  })
})
```

示例中，17、18 行通过 `errors/warnings` 判断运行过程是否出现异常；25 行读入产物文件，之后判断内容是否满足要求。

## 总结

综上，Webpack 插件在代码形态上是一个带 `apply` 方法的对象，我们可以在 `apply` 函数中注册各式各样的 Hook 回调，监听对应事件，之后在回调中修改上下文状态，达到干预 Webpack 构建逻辑的效果。

由此可见，编写插件时大部分工作都围绕 Hook 展开，因此我们需要理解构建过程中的不同环节会触发什么 Hook、对应传递什么上下文参数、如何与上下文参数对象交互等，而学习这些知识最高效的方式，我认为是阅读、分析各种开源插件源码。例如文章中提及的：

- 从 `imagemin-webpack-plugin` 学习：如何借助 `assets` 数组修改最终产物内容；
- 从 `eslint-webpack-plugin` 学习：如何提交错误信息；
- 从 `DefinePlugin` 学习：如何与 AST 结构交互。

Webpack 插件可用性与健壮性层面的开发技巧，包括：

- 我们应该尽量复用 Webpack Infrastructure Logging 接口记录插件运行日志；
- 若插件运行耗时较大，应该通过 `reportProgress` 接口上报执行进度，供用户了解运行状态；
- 应该尽可能使用 `schema-utils` 工具校验插件参数，确保输入参数的合法性；
- 可以借助 Node 测试工具，如 Jest、Karma 等搭建插件自动测试环境，之后在测试框架中运行 Webpack，分析比对构建结果、状态\(产物文件、`warning/errors` 数组等\)，确定插件是否正常运行。

这些技巧与插件主功能无关，但有助于提升插件质量，还可以让用户更了解插件的运行状态、运行性能等，让插件本身更可靠，更容易被用户选择。
