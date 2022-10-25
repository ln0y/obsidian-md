---
aliases: []
tags: ['js/Generator','JavaScript','date/2022-03','year/2022','month/03']
date: 2022-03-02-Wednesday 11:12:36
update: 2022-03-02-Wednesday 11:19:28
---

## Generator 基本介绍

Generator（生成器）是 ES6 的新关键词，学习起来比较晦涩难懂，那么什么是 Generator 的函数呢？通俗来讲 Generator 是一个带星号的“函数”（它并不是真正的函数，下面的代码会为你验证），可以配合 yield 关键字来暂停或者执行函数。

```js
function* gen () {
  console.log("enter")
  let a = yield 1
  let b = yield (function () { return 2 })()
  return 3
}
var g = gen()           // 阻塞住，不会执行任何语句
console.log(g.next())
console.log(g.next())
console.log(g.next())
console.log(g.next())
// output:
// { value: 1, done: false }
// { value: 2, done: false }
// { value: 3, done: true }
// { value: undefined, done: true }
```

结合上面的代码，我们分析一下 Generator 函数的执行情况。Generator 中配合使用 yield 关键词可以控制函数执行的顺序，每当执行一次 next 方法，Generator 函数会执行到下一个存在 yield 关键词的位置。

总结下来，Generator 的执行有这几个关键点。

1. 调用 gen() 后，程序会阻塞住，不会执行任何语句。
2. 调用 g.next() 后，程序继续执行，直到遇到 yield 关键词时执行暂停。
3. 一直执行 next 方法，最后返回一个对象，其存在两个属性：value 和 done。

这就是 Generator 的基本内容，其中提到了 yield 这个关键词，下面我们就来看看它的基本情况。

## yield基本介绍

yield 同样也是 ES6 的新关键词，配合 Generator 执行以及暂停。yield 关键词最后返回一个迭代器对象，该对象有 value 和 done 两个属性，其中 done 属性代表返回值以及是否完成。yield 配合着 Generator，再同时使用 next 方法，可以主动控制 Generator 执行进度。

前面说 Generator 的时候，我举的是一个生成器函数的示例，下面我们看看多个 Generator 配合 yield 使用的情况，请看下面一段代码。

```js
function* gen1 () {
  yield 1
  yield* gen2()
  yield 4
}
function* gen2 () {
  yield 2
  yield 3
}
var g = gen1()
console.log(g.next())
console.log(g.next())
console.log(g.next())
console.log(g.next())
// output:
// { value: 1, done: false }
// { value: 2, done: false }
// { value: 3, done: false }
// { value: 4, done: false }
// {value: undefined, done: true}
```

从上面的代码中可以看出，使用 yield 关键词的话还可以配合着 Generator 函数嵌套使用，从而控制函数执行进度。这样对于 Generator 的使用，以及最终函数的执行进度都可以很好地控制，从而形成符合你设想的执行顺序。即便 Generator 函数相互嵌套，也能通过调用 next 方法来按照进度一步步执行。

## thunk 函数介绍

下面我带你看一下 thunk 函数，直接说概念可能会有些晦涩，我们通过一段代码来了解一下什么是 thunk 函数，就拿判断数据类型来举例，代码如下。

```js
let isString = (obj) => {
  return Object.prototype.toString.call(obj) === '[object String]'
}
let isFunction = (obj) => {
  return Object.prototype.toString.call(obj) === '[object Function]'
}
let isArray = (obj) => {
  return Object.prototype.toString.call(obj) === '[object Array]'
}
```

可以看到，其中出现了非常多重复的数据类型判断逻辑，平常业务开发中类似的重复逻辑的场景也同样会有很多。我们将它们做一下封装，如下所示。

```js
let isType = (type) => {
  return (obj) => {
    return Object.prototype.toString.call(obj) === `[object ${type}]`
  }
}
```

那么封装了之后我们可以这么来使用，从而来减少重复的逻辑代码，如下所示。

```js
let isString = isType('String')
let isArray = isType('Array')
isString("123")    // true
isArray([1, 2, 3])   // true
```

相应的 isString 和 isArray 是由 isType 方法生产出来的函数，通过上面的方式来改造代码，明显简洁了不少。像 isType 这样的函数我们称为 thunk 函数，它的基本思路都是接收一定的参数，会生产出定制化的函数，最后使用定制化的函数去完成想要实现的功能。

这样的函数在 JS 的编程过程中会遇到很多，尤其是你在阅读一些开源项目时，抽象度比较高的 JS 代码往往都会采用这样的方式。

## Generator 和 thunk 结合

下面我以文件操作的代码为例，看一下 Generator 和 thunk 的结合能够对异步操作产生什么样的效果。

```js
const readFileThunk = (filename) => {
  return (callback) => {
    fs.readFile(filename, callback)
  }
}
const gen = function* () {
  const data1 = yield readFileThunk('1.txt')
  console.log(data1.toString())
  const data2 = yield readFileThunk('2.txt')
  console.log(data2.toString)
}
let g = gen()
g.next().value((err, data1) => {
  g.next(data1).value((err, data2) => {
    g.next(data2)
  })
})
```

readFileThunk 就是一个 thunk 函数，上面的这种编程方式就让 Generator 和异步操作关联起来了。上面第三段代码执行起来嵌套的情况还算简单，如果任务多起来，就会产生很多层的嵌套，可读性不强，因此我们有必要把执行的代码封装优化一下，如下所示。

```js
function run (gen) {
  const next = (err, data) => {
    let res = gen.next(data)
    if (res.done) return
    res.value(next)
  }
  next()
}
run(g)
```

改造完之后，我们可以看到 run 函数和上面的执行效果其实是一样的。代码虽然只有几行，但其包含了递归的过程，解决了多层嵌套的问题，并且完成了异步操作的一次性的执行效果。这就是通过 thunk 函数完成异步操作的情况。

## Generator 和 Promise 结合

还是利用上面的输出文件的例子，对代码进行改造，如下所示。

```js
// 最后包装成 Promise 对象进行返回
const readFilePromise = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  }).then(res => res)
}
let g = gen()
// 这块和上面 thunk 的方式一样
const gen = function* () {
  const data1 = yield readFilePromise('1.txt')
  console.log(data1.toString())
  const data2 = yield readFilePromise('2.txt')
  console.log(data2.toString)
}
// 这块和上面 thunk 的方式一样
function run (gen) {
  const next = (err, data) => {
    let res = gen.next(data)
    if (res.done) return
    res.value.then(next)
  }
  next()
}
run(g)
```

从上面的代码可以看出，thunk 函数的方式和通过 Promise 方式执行效果本质上是一样的，只不过通过 Promise 的方式也可以配合 Generator 函数实现同样的异步操作。

## co 函数库

co 函数库是著名程序员 TJ 发布的一个小工具，用于处理 Generator 函数的自动执行。核心原理其实就是上面讲的通过和 thunk 函数以及 Promise 对象进行配合，包装成一个库。它使用起来非常简单，比如还是用上面那段代码，第三段代码就可以省略了，直接引用 co 函数，包装起来就可以使用了，代码如下。

```js
const co = require('co')
let g = gen()
co(g).then(res => {
  console.log(res)
})
```

这段代码比较简单，几行就完成了之前写的递归的那些操作。那么为什么 co 函数库可以自动执行 Generator 函数，它的处理原理是什么呢？

1. 因为 Generator 函数就是一个异步操作的容器，它需要一种自动执行机制，co 函数接受 Generator 函数作为参数，并最后返回一个 Promise 对象。
2. 在返回的 Promise 对象里面，co 先检查参数 gen 是否为 Generator 函数。如果是，就执行该函数；如果不是就返回，并将 Promise 对象的状态改为 resolved。
3. co 将 Generator 函数的内部指针对象的 next 方法，包装成 onFulfilled 函数。这主要是为了能够捕捉抛出的错误。
4. 关键的是 next 函数，它会反复调用自身。

关于 co 的内部原理，可以去 [co 的源码库](https://github.com/tj/co/blob/master/index.js)学习。
