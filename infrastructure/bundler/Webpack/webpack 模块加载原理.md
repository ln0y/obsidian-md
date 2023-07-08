---
aliases: []
tags: ['infrastructure/bundler/Webpack', 'date/2023-04', 'year/2023', 'month/04']
date: 2023-04-12-星期三 10:07:00
update: 2023-04-12-星期三 10:07:08
---

webpack 是一个模块打包器，在它看来，每一个文件都是一个模块。

无论你开发使用的是 CommonJS 规范还是 ES6 模块规范，打包后的文件都统一使用 webpack 自定义的模块规范来管理、加载模块。本文将从一个简单的示例开始，来讲解 webpack 模块加载原理。

## CommonJS 规范

假设现在有如下两个文件：

```js
// index.js
const test2 = require('./test2')

function test() {}

test()
test2()
```

```js
// test2.js
function test2() {}

module.exports = test2
```

以上两个文件使用 CommonJS 规范来导入导出文件，打包后的代码如下（已经删除了不必要的注释）：

```js
;(function (modules) {
  // webpackBootstrap
  // The module cache
  // 模块缓存对象
  var installedModules = {}

  // The require function
  // webpack 实现的 require() 函数
  function __webpack_require__(moduleId) {
    // Check if module is in cache
    // 如果模块已经加载过，直接返回缓存
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports
    }
    // Create a new module (and put it into the cache)
    // 创建一个新模块，并放入缓存
    var module = (installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {},
    })

    // Execute the module function
    // 执行模块函数
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__)

    // Flag the module as loaded
    // 将模块标识为已加载
    module.l = true

    // Return the exports of the module
    return module.exports
  }

  // expose the modules object (__webpack_modules__)
  // 将所有的模块挂载到 require() 函数上
  __webpack_require__.m = modules

  // expose the module cache
  // 将缓存对象挂载到 require() 函数上
  __webpack_require__.c = installedModules

  // define getter function for harmony exports
  __webpack_require__.d = function (exports, name, getter) {
    if (!__webpack_require__.o(exports, name)) {
      Object.defineProperty(exports, name, { enumerable: true, get: getter })
    }
  }

  // define __esModule on exports
  __webpack_require__.r = function (exports) {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
    }
    Object.defineProperty(exports, '__esModule', { value: true })
  }

  // create a fake namespace object
  // mode & 1: value is a module id, require it
  // mode & 2: merge all properties of value into the ns
  // mode & 4: return value when already ns object
  // mode & 8|1: behave like require
  __webpack_require__.t = function (value, mode) {
    if (mode & 1) value = __webpack_require__(value)
    if (mode & 8) return value
    if (mode & 4 && typeof value === 'object' && value && value.__esModule) return value
    var ns = Object.create(null)
    __webpack_require__.r(ns)
    Object.defineProperty(ns, 'default', { enumerable: true, value: value })
    if (mode & 2 && typeof value != 'string')
      for (var key in value)
        __webpack_require__.d(
          ns,
          key,
          function (key) {
            return value[key]
          }.bind(null, key)
        )
    return ns
  }

  // getDefaultExport function for compatibility with non-harmony modules
  __webpack_require__.n = function (module) {
    var getter =
      module && module.__esModule
        ? function getDefault() {
            return module['default']
          }
        : function getModuleExports() {
            return module
          }
    __webpack_require__.d(getter, 'a', getter)
    return getter
  }

  // Object.prototype.hasOwnProperty.call
  __webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property)
  }

  // __webpack_public_path__
  __webpack_require__.p = ''

  // Load entry module and return exports
  // 加载入口模块，并返回模块对象
  return __webpack_require__((__webpack_require__.s = './src/index.js'))
})({
  './src/index.js': function (module, exports, __webpack_require__) {
    eval(
      'const test2 = __webpack_require__(/*! ./test2 */ "./src/test2.js")\r\n\r\nfunction test() {}\r\n\r\ntest()\r\ntest2()\n\n//# sourceURL=webpack:///./src/index.js?'
    )
  },

  './src/test2.js': function (module, exports) {
    eval(
      'function test2() {}\r\n\r\nmodule.exports = test2\n\n//# sourceURL=webpack:///./src/test2.js?'
    )
  },
})
```

可以看到 webpack 实现的模块加载系统非常简单，仅仅只有一百行代码。

打包后的代码其实是一个立即执行函数，传入的参数是一个对象。这个对象以文件路径为 key，以文件内容为 value，它包含了所有打包后的模块。

```js
{
  "./src/index.js": (function(module, exports, __webpack_require__) {
    eval("const test2 = __webpack_require__(/*! ./test2 */ \"./src/test2.js\")\r\n\r\nfunction test() {}\r\n\r\ntest()\r\ntest2()\n\n//# sourceURL=webpack:///./src/index.js?");
  }),

  "./src/test2.js": (function(module, exports) {
    eval("function test2() {}\r\n\r\nmodule.exports = test2\n\n//# sourceURL=webpack:///./src/test2.js?");
  })
}
```

将这个立即函数化简一下，相当于：

```js
;(function (modules) {
  // ...
})({
  path1: function1,
  path2: function2,
})
```

再看一下这个立即函数做了什么：

1. 定义了一个模块缓存对象 `installedModules`，作用是缓存已经加载过的模块。
2. 定义了一个模块加载函数 `__webpack_require__()`。
3. … 省略一些其他代码。
4. 使用 `__webpack_require__()` 加载入口模块。

其中的核心就是 `__webpack_require__()` 函数，它接收的参数是 `moduleId`，其实就是文件路径。

它的执行过程如下：

1. 判断模块是否有缓存，如果有则返回缓存模块的 `export` 对象，即 `module.exports`。
2. 新建一个模块 `module`，并放入缓存。
3. 执行文件路径对应的模块函数。
4. 将这个新建的模块标识为已加载。
5. 执行完模块后，返回该模块的 `exports` 对象。

```js
// The require function
// webpack 实现的 require() 函数
function __webpack_require__(moduleId) {
  // Check if module is in cache
  // 如果模块已经加载过，直接返回缓存
  if (installedModules[moduleId]) {
    return installedModules[moduleId].exports
  }
  // Create a new module (and put it into the cache)
  // 创建一个新模块，并放入缓存
  var module = (installedModules[moduleId] = {
    i: moduleId,
    l: false,
    exports: {},
  })

  // Execute the module function
  // 执行模块函数
  modules[moduleId].call(module.exports, module, module.exports, __webpack_require__)

  // Flag the module as loaded
  // 将模块标识为已加载
  module.l = true

  // Return the exports of the module
  return module.exports
}
```

从上述代码可以看到，在执行模块函数时传入了三个参数，分别为 `module`、`module.exports`、`__webpack_require__`。

其中 `module`、`module.exports` 的作用和 CommonJS 中的 `module`、`module.exports` 的作用是一样的，而 `__webpack_require__` 相当于 CommonJS 中的 `require`。

在立即函数的最后，使用了 `__webpack_require__()` 加载入口模块。并传入了入口模块的路径 `./src/index.js`。

```js
__webpack_require__((__webpack_require__.s = './src/index.js'))
```

我们再来分析一下入口模块的内容。

```js
;(function (module, exports, __webpack_require__) {
  eval(
    'const test2 = __webpack_require__(/*! ./test2 */ "./src/test2.js")\r\n\r\nfunction test() {}\r\n\r\ntest()\r\ntest2()\n\n//# sourceURL=webpack:///./src/index.js?'
  )
})
```

入口模块函数的参数正好是刚才所说的那三个参数，而 eval 函数的内容美化一下后和下面内容一样：

```js
const test2 = __webpack_require__('./src/test2.js')
function test() {}
test()
test2()
//# sourceURL=webpack:///./src/index.js?
```

将打包后的模块代码和原模块的代码进行对比，可以发现仅有一个地方发生了变化，那就是 `require` 变成了 `__webpack_require__`。

再看一下 `test2.js` 的代码：

```js
function test2() {}
module.exports = test2
//# sourceURL=webpack:///./src/test2.js?
```

从刚才的分析可知，`__webpack_require__()` 加载模块后，会先执行模块对应的函数，然后返回该模块的 `exports` 对象。而 `test2.js` 的导出对象 `module.exports` 就是 `test2()` 函数。所以入口模块能通过 `__webpack_require__()` 引入 `test2()` 函数并执行。

到目前为止可以发现 webpack 自定义的模块规范完美适配 CommonJS 规范。

## ES6 module

将刚才用 CommonJS 规范编写的两个文件换成用 ES6 module 规范来写，再执行打包。

```js
// index.js
import test2 from './test2'

function test() {}

test()
test2()
```

```js
// test2.js
export default function test2() {}
```

使用 ES6 module 规范打包后的代码和使用 CommonJS 规范打包后的代码绝大部分都是一样的。

一样的地方是指 webpack 自定义模块规范的代码一样，唯一不同的是上面两个文件打包后的代码不同。

```js
{
 "./src/index.js":(function(module, __webpack_exports__, __webpack_require__) {
"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _test2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./test2 */ \"./src/test2.js\");\n\r\n\r\nfunction test() {}\r\n\r\ntest()\r\nObject(_test2__WEBPACK_IMPORTED_MODULE_0__[\"default\"])()\n\n//# sourceURL=webpack:///./src/index.js?");
}),

"./src/test2.js": (function(module, __webpack_exports__, __webpack_require__) {
"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return test2; });\nfunction test2() {}\n\n//# sourceURL=webpack:///./src/test2.js?");
})
}
```

可以看到传入的第二个参数是 `__webpack_exports__`，而 CommonJS 规范对应的第二个参数是 `exports`。将这两个模块代码的内容美化一下：

```js
// index.js
__webpack_require__.r(__webpack_exports__)
var _test2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__('./src/test2.js')
function test() {}
test()
Object(_test2__WEBPACK_IMPORTED_MODULE_0__['default'])()
//# sourceURL=webpack:///./src/index.js?
```

```js
// test2.js
__webpack_require__.r(__webpack_exports__)
__webpack_require__.d(__webpack_exports__, 'default', function () {
  return test2
})
function test2() {}
//# sourceURL=webpack:///./src/test2.js?
```

可以发现，在每个模块的开头都执行了一个 `__webpack_require__.r(__webpack_exports__)` 语句。并且 `test2.js` 还多了一个 `__webpack_require__.d()` 函数。

我们先来看看 `__webpack_require__.r()` 和 `__webpack_require__.d()` 是什么。

### webpack_require.d()

```js
// define getter function for harmony exports
__webpack_require__.d = function (exports, name, getter) {
  if (!__webpack_require__.o(exports, name)) {
    Object.defineProperty(exports, name, { enumerable: true, get: getter })
  }
}
```

原来 `__webpack_require__.d()` 是给 `__webpack_exports__` 定义导出变量用的。例如下面这行代码：

```js
__webpack_require__.d(__webpack_exports__, 'default', function () {
  return test2
})
```

它的作用相当于 `__webpack_exports__["default"] = test2`。这个 `"default"` 是因为你使用 `export default` 来导出函数，如果这样导出函数：

```js
export function test2() {}
```

它就会变成 `__webpack_require__.d(__webpack_exports__, "test2", function() { return test2; });`

### webpack_require.r()

```js
// define __esModule on exports
__webpack_require__.r = function (exports) {
  if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
  }
  Object.defineProperty(exports, '__esModule', { value: true })
}
```

`__webpack_require__.r()` 函数的作用是给 `__webpack_exports__` 添加一个 `__esModule` 为 `true` 的属性，表示这是一个 ES6 module。

**添加这个属性有什么用呢?**

主要是为了处理混合使用 ES6 module 和 CommonJS 的情况。

例如导出使用 CommonJS `module.export = test2` 导出函数，导入使用 ES6 module `import test2 from './test2`。

打包后的代码如下：

```js
// index.js
__webpack_require__.r(__webpack_exports__)
var _test2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__('./src/test2.js')
var _test2__WEBPACK_IMPORTED_MODULE_0___default = __webpack_require__.n(
  _test2__WEBPACK_IMPORTED_MODULE_0__
)
function test() {}
test()
_test2__WEBPACK_IMPORTED_MODULE_0___default()()
//# sourceURL=webpack:///./src/index.js?
```

```js
// test2.js
function test2() {}
module.exports = test2
//# sourceURL=webpack:///./src/test2.js?
```

从上述代码可以发现，又多了一个 `__webpack_require__.n()` 函数：

```js
__webpack_require__.n = function (module) {
  var getter =
    module && module.__esModule
      ? function getDefault() {
          return module['default']
        }
      : function getModuleExports() {
          return module
        }
  __webpack_require__.d(getter, 'a', getter)
  return getter
}
```

先来分析一下入口模块的处理逻辑：

1. 将 `__webpack_exports__` 导出对象标识为 ES6 module。
2. 加载 `test2.js` 模块，并将该模块的导出对象作为参数传入 `__webpack_require__.n()` 函数。
3. `__webpack_require__.n` 分析该 `export` 对象是否是 ES6 module，如果是则返回 `module['default']` 即 `export default` 对应的变量。如果不是 ES6 module 则直接返回 `export`。

## 按需加载

按需加载，也叫异步加载、动态导入，即只在有需要的时候才去下载相应的资源文件。

在 webpack 中可以使用 `import` 和 `require.ensure` 来引入需要动态导入的代码，例如下面这个示例：

```js
// index.js
function test() {}

test()
import('./test2')
```

```js
// test2.js
export default function test2() {}
```

其中使用 `import` 导入的 `test2.js` 文件在打包时会被单独打包成一个文件，而不是和 `index.js` 一起打包到 `bundle.js`。

![](_attachment/img/99e03d32cedfa7a166e4219ec2f0139e_MD5.webp)

这个 `0.bundle.js` 对应的代码就是动态导入的 `test2.js` 的代码。

接下来看看这两个打包文件的内容：

```js
// bundle.js
;(function (modules) {
  // webpackBootstrap
  // install a JSONP callback for chunk loading
  function webpackJsonpCallback(data) {
    var chunkIds = data[0]
    var moreModules = data[1]

    // add "moreModules" to the modules object,
    // then flag all "chunkIds" as loaded and fire callback
    var moduleId,
      chunkId,
      i = 0,
      resolves = []
    for (; i < chunkIds.length; i++) {
      chunkId = chunkIds[i]
      if (
        Object.prototype.hasOwnProperty.call(installedChunks, chunkId) &&
        installedChunks[chunkId]
      ) {
        resolves.push(installedChunks[chunkId][0])
      }
      installedChunks[chunkId] = 0
    }
    for (moduleId in moreModules) {
      if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
        modules[moduleId] = moreModules[moduleId]
      }
    }
    if (parentJsonpFunction) parentJsonpFunction(data)

    while (resolves.length) {
      resolves.shift()()
    }
  }

  // The module cache
  var installedModules = {}

  // object to store loaded and loading chunks
  // undefined = chunk not loaded, null = chunk preloaded/prefetched
  // Promise = chunk loading, 0 = chunk loaded
  var installedChunks = {
    main: 0,
  }

  // script path function
  function jsonpScriptSrc(chunkId) {
    return __webpack_require__.p + '' + chunkId + '.bundle.js'
  }

  // The require function
  function __webpack_require__(moduleId) {
    // Check if module is in cache
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports
    }
    // Create a new module (and put it into the cache)
    var module = (installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {},
    })

    // Execute the module function
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__)

    // Flag the module as loaded
    module.l = true

    // Return the exports of the module
    return module.exports
  }

  // This file contains only the entry chunk.
  // The chunk loading function for additional chunks
  __webpack_require__.e = function requireEnsure(chunkId) {
    var promises = []

    // JSONP chunk loading for javascript

    var installedChunkData = installedChunks[chunkId]
    if (installedChunkData !== 0) {
      // 0 means "already installed".

      // a Promise means "currently loading".
      if (installedChunkData) {
        promises.push(installedChunkData[2])
      } else {
        // setup Promise in chunk cache
        var promise = new Promise(function (resolve, reject) {
          installedChunkData = installedChunks[chunkId] = [resolve, reject]
        })
        promises.push((installedChunkData[2] = promise))

        // start chunk loading
        var script = document.createElement('script')
        var onScriptComplete

        script.charset = 'utf-8'
        script.timeout = 120
        if (__webpack_require__.nc) {
          script.setAttribute('nonce', __webpack_require__.nc)
        }
        script.src = jsonpScriptSrc(chunkId)

        // create error before stack unwound to get useful stacktrace later
        var error = new Error()
        onScriptComplete = function (event) {
          // avoid mem leaks in IE.
          script.onerror = script.onload = null
          clearTimeout(timeout)
          var chunk = installedChunks[chunkId]
          if (chunk !== 0) {
            if (chunk) {
              var errorType = event && (event.type === 'load' ? 'missing' : event.type)
              var realSrc = event && event.target && event.target.src
              error.message =
                'Loading chunk ' +
                chunkId +
                ' failed.\n(' +
                errorType +
                ': ' +
                realSrc +
                ')'
              error.name = 'ChunkLoadError'
              error.type = errorType
              error.request = realSrc
              chunk[1](error)
            }
            installedChunks[chunkId] = undefined
          }
        }
        var timeout = setTimeout(function () {
          onScriptComplete({ type: 'timeout', target: script })
        }, 120000)
        script.onerror = script.onload = onScriptComplete
        document.head.appendChild(script)
      }
    }
    return Promise.all(promises)
  }

  // expose the modules object (__webpack_modules__)
  __webpack_require__.m = modules

  // expose the module cache
  __webpack_require__.c = installedModules

  // define getter function for harmony exports
  __webpack_require__.d = function (exports, name, getter) {
    if (!__webpack_require__.o(exports, name)) {
      Object.defineProperty(exports, name, { enumerable: true, get: getter })
    }
  }

  // define __esModule on exports
  __webpack_require__.r = function (exports) {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
    }
    Object.defineProperty(exports, '__esModule', { value: true })
  }

  // create a fake namespace object
  // mode & 1: value is a module id, require it
  // mode & 2: merge all properties of value into the ns
  // mode & 4: return value when already ns object
  // mode & 8|1: behave like require
  __webpack_require__.t = function (value, mode) {
    if (mode & 1) value = __webpack_require__(value)
    if (mode & 8) return value
    if (mode & 4 && typeof value === 'object' && value && value.__esModule) return value
    var ns = Object.create(null)
    __webpack_require__.r(ns)
    Object.defineProperty(ns, 'default', { enumerable: true, value: value })
    if (mode & 2 && typeof value != 'string')
      for (var key in value)
        __webpack_require__.d(
          ns,
          key,
          function (key) {
            return value[key]
          }.bind(null, key)
        )
    return ns
  }

  // getDefaultExport function for compatibility with non-harmony modules
  __webpack_require__.n = function (module) {
    var getter =
      module && module.__esModule
        ? function getDefault() {
            return module['default']
          }
        : function getModuleExports() {
            return module
          }
    __webpack_require__.d(getter, 'a', getter)
    return getter
  }

  // Object.prototype.hasOwnProperty.call
  __webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property)
  }

  // __webpack_public_path__
  __webpack_require__.p = ''

  // on error function for async loading
  __webpack_require__.oe = function (err) {
    console.error(err)
    throw err
  }

  var jsonpArray = (window['webpackJsonp'] = window['webpackJsonp'] || [])
  var oldJsonpFunction = jsonpArray.push.bind(jsonpArray)
  jsonpArray.push = webpackJsonpCallback
  jsonpArray = jsonpArray.slice()
  for (var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i])
  var parentJsonpFunction = oldJsonpFunction

  // Load entry module and return exports
  return __webpack_require__((__webpack_require__.s = './src/index.js'))
})({
  './src/index.js': function (module, exports, __webpack_require__) {
    eval(
      'function test() {}\r\n\r\ntest()\r\n__webpack_require__.e(/*! import() */ 0).then(__webpack_require__.bind(null, /*! ./test2 */ "./src/test2.js"))\n\n//# sourceURL=webpack:///./src/index.js?'
    )
  },
})
```

```js
// 0.bundle.js
;(window['webpackJsonp'] = window['webpackJsonp'] || []).push([
  [0],
  {
    './src/test2.js': function (module, __webpack_exports__, __webpack_require__) {
      'use strict'
      eval(
        '__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return test2; });\nfunction test2() {}\n\n//# sourceURL=webpack:///./src/test2.js?'
      )
    },
  },
])
```

这次打包的代码量有点膨胀，`bundle.js` 代码居然有 200 行。我们来看看相比于同步加载的 webpack 模块规范，它有哪些不同：

1. 定义了一个对象 `installedChunks`，作用是缓存动态模块。
2. 定义了一个辅助函数 `jsonpScriptSrc()`，作用是根据模块 ID 生成 URL。
3. 定义了两个新的核心函数 `__webpack_require__.e()` 和 `webpackJsonpCallback()`。
4. 定义了一个全局变量 `window["webpackJsonp"] = []`，它的作用是存储需要动态导入的模块。
5. 重写 `window["webpackJsonp"]` 数组的 `push()` 方法为 `webpackJsonpCallback()`。也就是说 `window["webpackJsonp"].push()` 其实执行的是 `webpackJsonpCallback()`。

而从 `0.bundle.js` 文件可以发现，它正是使用 `window["webpackJsonp"].push()` 来放入动态模块的。动态模块数据项有两个值，第一个是 `[0]`，它是模块的 ID；第二个值是模块的路径名和模块内容。

然后我们再看一下打包后的入口模块的代码，经过美化后：

```js
function test() {}
test()
__webpack_require__.e(0).then(__webpack_require__.bind(null, './src/test2.js'))
//# sourceURL=webpack:///./src/index.js?
```

原来模块代码中的 `import('./test2')` 被翻译成了 `__webpack_require__.e(0).then(__webpack_require__.bind(null, "./src/test2.js"))`。

那 `__webpack_require__.e()` 的作用是什么呢？

### webpack_require.e()

```js
__webpack_require__.e = function requireEnsure(chunkId) {
  var promises = []
  // JSONP chunk loading for javascript
  var installedChunkData = installedChunks[chunkId]
  if (installedChunkData !== 0) {
    // 0 means "already installed".
    // a Promise means "currently loading".
    if (installedChunkData) {
      promises.push(installedChunkData[2])
    } else {
      // setup Promise in chunk cache
      var promise = new Promise(function (resolve, reject) {
        installedChunkData = installedChunks[chunkId] = [resolve, reject]
      })
      promises.push((installedChunkData[2] = promise))

      // start chunk loading
      var script = document.createElement('script')
      var onScriptComplete

      script.charset = 'utf-8'
      script.timeout = 120
      if (__webpack_require__.nc) {
        script.setAttribute('nonce', __webpack_require__.nc)
      }
      script.src = jsonpScriptSrc(chunkId)

      // create error before stack unwound to get useful stacktrace later
      var error = new Error()
      onScriptComplete = function (event) {
        // avoid mem leaks in IE.
        script.onerror = script.onload = null
        clearTimeout(timeout)
        var chunk = installedChunks[chunkId]
        if (chunk !== 0) {
          if (chunk) {
            var errorType = event && (event.type === 'load' ? 'missing' : event.type)
            var realSrc = event && event.target && event.target.src
            error.message =
              'Loading chunk ' +
              chunkId +
              ' failed.\n(' +
              errorType +
              ': ' +
              realSrc +
              ')'
            error.name = 'ChunkLoadError'
            error.type = errorType
            error.request = realSrc
            chunk[1](error)
          }
          installedChunks[chunkId] = undefined
        }
      }
      var timeout = setTimeout(function () {
        onScriptComplete({ type: 'timeout', target: script })
      }, 120000)
      script.onerror = script.onload = onScriptComplete
      document.head.appendChild(script)
    }
  }
  return Promise.all(promises)
}
```

它的处理逻辑如下：

1. 先查看该模块 ID 对应缓存的值是否为 0，0 代表已经加载成功了，第一次取值为 `undefined`。
2. 如果不为 0 并且不是 `undefined` 代表已经是加载中的状态。然后将这个加载中的 Promise 推入 `promises` 数组。
3. 如果不为 0 并且是 `undefined` 就新建一个 Promise，用于加载需要动态导入的模块。
4. 生成一个 `script` 标签，URL 使用 `jsonpScriptSrc(chunkId)` 生成，即需要动态导入模块的 URL。
5. 为这个 `script` 标签设置一个 2 分钟的超时时间，并设置一个 `onScriptComplete()` 函数，用于处理超时错误。
6. 然后添加到页面中 `document.head.appendChild(script)`，开始加载模块。
7. 返回 `promises` 数组。

当 JS 文件下载完成后，会自动执行文件内容。也就是说下载完 `0.bundle.js` 后，会执行 `window["webpackJsonp"].push()`。

由于 `window["webpackJsonp"].push()` 已被重置为 `webpackJsonpCallback()` 函数。所以这一操作就是执行 `webpackJsonpCallback()` ，接下来我们看看 `webpackJsonpCallback()`   做了哪些事情。

### webpackJsonpCallback()

对这个模块 ID 对应的 Promise 执行 `resolve()`，同时将缓存对象中的值置为 0，表示已经加载完成了。相比于 `__webpack_require__.e()`，这个函数还是挺好理解的。

### 小结

总的来说，动态导入的逻辑如下：

1. 重写 `window["webpackJsonp"].push()` 方法。
2. 入口模块使用 `__webpack_require__.e()` 下载动态资源。
3. 资源下载完成后执行 `window["webpackJsonp"].push()`，即 `webpackJsonpCallback()`。
4. 将资源标识为 0，代表已经加载完成。由于加载模块使用的是 Promise，所以要执行 `resolve()`。
5. 再看一下入口模块的加载代码 `__webpack_require__.e(0).then(__webpack_require__.bind(null, "./src/test2.js"))`，下载完成后执行 `then()` 方法，调用 `__webpack_require__()` 真正开始加载代码，`__webpack_require__()` 在上文已经讲解过，如果不了解，建议再阅读一遍。
