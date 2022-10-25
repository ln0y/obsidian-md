---
aliases: []
tags: ['Node.js','date/2022-03','year/2022','month/03']
date: 2022-03-03-Thursday 13:49:37
update: 2022-03-03-Thursday 14:00:13
---

## 基本语法

process.nextTick 的语法有两个参数：

> process.nextTick(callback[, ...args])

其中，第一个参数是 callback 回调函数，第二个参数是 args 调用 callback 时额外传的参数，是可选参数。

再来看下 process.nextTick 的运行逻辑：

1. process.nextTick 会将 callback 添加到“next tick queue”；
2. “next tick queue”会在当前 JavaScript stack 执行完成后，下一次 event loop 开始执行前按照 FIFO 出队；
3. 如果递归调用 process.nextTick 可能会导致一个无限循环，需要去适时终止递归。

可能你已经注意到 process.nextTick 其实是微任务，同时也是异步 API 的一部分。但是从技术上来说 process.nextTick 并不是事件循环（eventloop）的一部分，相反地，“next tick queue”将会在当前操作完成之后立即被处理，而不管当前处于事件循环的哪个阶段。

思考一下上面的逻辑，如果任何时刻你在一个给定的阶段调用 process.nextTick，则所有被传入 process.nextTick 的回调将在事件循环继续往下执行前被执行。这可能会导致一些很糟的情形，因为它允许用户递归调用 process.nextTick 来挂起 I/O 进程的进行，这会导致事件循环永远无法到达轮询阶段。

## 为什么使用 Process.nextTick()

那么为什么 process.nextTick 这样的 API 会被允许出现在 Node.js 中呢？一部分原因是设计理念，Node.js 中的 API 应该总是异步的，即使是那些不需要异步的地方。下面的代码片段展示了一个例子：

```js
function apiCall(arg, callback) {
  if (typeof arg !== 'string')
  return process.nextTick(callback, new TypeError('argument should be string'))
}
```

通过上面的代码检查参数，如果检查不通过，它将一个错误对象传给回调。Node.js API 最近进行了更新，其已经允许向 process.nextTick 中传递参数来作为回调函数的参数，而不必写嵌套函数。

我们所做的就是将一个错误传递给用户，但这只允许在用户代码被执行完毕后执行。使用 process.nextTick 我们可以保证 apicall() 的回调总是在用户代码被执行后，且在事件循环继续工作前被执行。为了达到这一点，JS 调用栈被允许展开，然后立即执行所提供的回调。该回调允许用户对 process.nextTick 进行递归调用，而不会达到 RangeError，即 V8 调用栈的最大值。

这种设计理念会导致一些潜在的问题，观察下面的代码片段：

```js
let bar
function someAsyncApiCall (callback) { callback() }
someAsyncApiCall(() => {
  console.log('bar', bar)   // undefined
})
bar = 1
```

用户定义函数 someAsyncApiCall() 有一个异步签名，但实际上它是同步执行的。当它被调用时，提供给 someAsyncApiCall() 的回调函数会在执行 someAsyncApiCall() 本身的同一个事件循环阶段被执行，因为 someAsyncApiCall() 实际上并未执行任何异步操作。结果就是，即使回调函数尝试引用变量 bar，但此时在作用域中并没有改变量。因为程序还没运行到对 bar 赋值的部分。

将回调放到 process.nextTick 中，程序依然可以执行完毕，且所有的变量、函数等都在执行回调之前被初始化，它还具有不会被事件循环打断的优点。以下是将上面的例子改用 process.nextTick 的代码：

```js
let bar
function someAsyncApiCall (callback) { callback() }
someAsyncApiCall(() => {
  console.log('bar', bar)   // undefined
})
bar = 1
```

通过这个例子，你就可以体会到 process.nextTick 的作用了。其实在日常的 Node.js 开发中，这样的情况也经常会遇见，那么我们看下 [[Node.js/EventEmitter]] 在 Node.js 的使用的一个例子。

因为 Node.js 直接有 event 模块，其实就是一个 EventEmitter，下面代码是在造函数中触发一个事件：

```js
const EventEmitter = require('events')
const util = require('util')

function MyEmitter () {
  EventEmitter.call(this)
  this.emit('event')
}
util.inherits(MyEmitter, EventEmitter)

const myEmitter = new MyEmitter()
myEmitter.on('event', () => {
  console.log('an event occurred!')
})
```

你无法在构造函数中立即触发一个事件，因为此时程序还未运行到将回调赋值给事件的那段代码。因此，在构造函数内部，你可以使用 process.nextTick 设置一个回调以在构造函数执行完毕后触发事件，下面的代码满足了我们的预期。

```js
const EventEmitter = require('events')
const util = require('util')

function MyEmitter () {
  EventEmitter.call(this)
  process.nextTick(() => {
    this.emit('event')
  })
}
util.inherits(MyEmitter, EventEmitter)

const myEmitter = new MyEmitter()
myEmitter.on('event', () => {
  console.log('an event occurred!')
})
```

通过上面的改造可以看出，使用 process.nextTick 就可以解决问题了，即使 event 事件还没进行绑定，但也可以让代码在前面进行触发，因为根据代码执行顺序，process.nextTick 是在每一次的事件循环最后执行的。因此这样写，代码也不会报错，同样又保持了代码的逻辑。
