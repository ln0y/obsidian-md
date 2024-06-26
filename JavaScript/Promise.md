---
aliases: []
tags: ['js/Promise', 'JavaScript', 'date/2022-03', 'year/2022', 'month/03']
date: 2023-02-13-星期一 13:46:47
update: 2023-10-16-星期一 23:51:00
---

## Promise 的基本介绍

如果一定要解释 Promise 到底是什么，简单来说它就是一个容器，里面保存着某个未来才会结束的事件（通常是异步操作）的结果。从语法上说，Promise 是一个对象，从它可以获取异步操作的消息。

Promise 提供统一的 API，各种异步操作都可以用同样的方法进行处理。我们来简单看一下 Promise 实现的链式调用代码，如下所示。

```js
function read(url) {
  return new Promise((resolve, reject) => {
    fs.readFile(url, 'utf8', (err, data) => {
      if (err) reject(err)
      resolve(data)
    })
  })
}
read(A)
  .then(data => {
    return read(B)
  })
  .then(data => {
    return read(C)
  })
  .then(data => {
    return read(D)
  })
  .catch(reason => {
    console.log(reason)
  })
```

结合上面的代码，我们一起来分析一下 Promise 内部的状态流转情况，Promise  对象在被创建出来时是待定的状态，它让你能够把异步操作返回最终的成功值或者失败原因，和相应的处理程序关联起来。

一般  Promise  在执行过程中，必然会处于以下几种状态之一。

1. 待定（pending）：初始状态，既没有被完成，也没有被拒绝。
2. 已完成（fulfilled）：操作成功完成。
3. 已拒绝（rejected）：操作失败。

待定状态的 Promise 对象执行的话，最后要么会通过一个值完成，要么会通过一个原因被拒绝。当其中一种情况发生时，我们用 Promise 的 then 方法排列起来的相关处理程序就会被调用。因为最后  Promise.prototype.then 和  Promise.prototype.catch  方法返回的是一个 Promise， 所以它们可以继续被链式调用。

关于 Promise 的状态流转情况，有一点值得注意的是，**内部状态改变之后不可逆**，你需要在编程过程中加以注意。文字描述比较晦涩，我们直接通过一张图就能很清晰地看出 Promise 内部状态流转的情况，如下所示。

![](_attachment/img/Cgp9HWAvhIyAH1WgAAES_06spV4639.png)

从上图可以看出，我们最开始创建一个新的 Promise 返回给 p1 ，然后开始执行，状态是 pending，当执行 resolve 之后状态就切换为 fulfilled，执行 reject 之后就变为 rejected 的状态。

关于 Promise 的状态切换如果你想深入研究，可以学习一下“有限状态机”这个知识点。日常中比较常见的状态机有很多，比如马路上的红绿灯。

## Promise 如何解决回调地狱

首先，请你再回想一下什么是回调地狱，回调地狱有两个主要的问题：

1. 多层嵌套的问题；
2. 每种任务的处理结果存在两种可能性（成功或失败），那么需要在每种任务执行结束后分别处理这两种可能性。

这两种问题在“回调函数时代”尤为突出，Promise 的诞生就是为了解决这两个问题。Promise 利用了三大技术手段来解决回调地狱：回调函数延迟绑定、返回值穿透、错误冒泡。

```js
let readFilePromise = filename => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}
readFilePromise('1.json').then(data => {
  return readFilePromise('2.json')
})
```

从上面的代码中可以看到，回调函数不是直接声明的，而是通过后面的 then 方法传入的，即延迟传入，这就是回调函数延迟绑定。接下来我们针对上面的代码做一下微调，如下所示。

```js
let x = readFilePromise('1.json').then(data => {
  return readFilePromise('2.json') //这是返回的Promise
})
x.then(/* 内部逻辑省略 */)
```

我们根据 then 中回调函数的传入值创建不同类型的 Promise，然后把返回的 Promise 穿透到外层，以供后续的调用。这里的 x 指的就是内部返回的 Promise，然后在 x 后面可以依次完成链式调用。这便是返回值穿透的效果，这两种技术一起作用便可以将深层的嵌套回调写成下面的形式。

```js
readFilePromise('1.json')
  .then(data => {
    return readFilePromise('2.json')
  })
  .then(data => {
    return readFilePromise('3.json')
  })
  .then(data => {
    return readFilePromise('4.json')
  })
```

这样就显得清爽了许多，更重要的是，它更符合人的线性思维模式，开发体验也更好，两种技术结合产生了链式调用的效果。

这样解决了多层嵌套的问题，那另外一个问题，即每次任务执行结束后分别处理成功和失败的情况怎么解决的呢？Promise 采用了错误冒泡的方式。其实很容易理解，我们来看看效果。

```js
readFilePromise('1.json')
  .then(data => {
    return readFilePromise('2.json')
  })
  .then(data => {
    return readFilePromise('3.json')
  })
  .then(data => {
    return readFilePromise('4.json')
  })
  .catch(err => {
    // xxx
  })
```

这样前面产生的错误会一直向后传递，被 catch 接收到，就不用频繁地检查错误了。从上面的这些代码中可以看到，Promise 解决效果也比较明显：实现链式调用，解决多层嵌套问题；实现错误冒泡后一站式处理，解决每次任务中判断错误、增加代码混乱度的问题。

## Promise 中的 then 第二个参数和 catch 有什么区别？

首页我们先要区分几个概念，第一，reject 是用来抛出异常的，catch 是用来处理异常的；第二：reject 是 Promise 的方法，而 then 和 catch 是 Promise 实例的方法（Promise.prototype.then 和 Promise.prototype.catch）。

### 1\. 区别

主要区别就是，如果在 then 的第一个函数里抛出了异常，后面的 catch 能捕获到，而 then 的第二个函数捕获不到。

catch 只是一个语法糖而己 还是通过 then 来处理的，大概如下所示

```js
Promise.prototype.catch = function (fn) {
  return this.then(null, fn)
}
```

then 的第二个参数和 catch 捕获错误信息的时候会就近原则，如果是 promise 内部报错，reject 抛出错误后，then 的第二个参数和 catch 方法都存在的情况下，只有 then 的第二个参数能捕获到，如果 then 的第二个参数不存在，则 catch 方法会捕获到。

```js
const promise = new Promise((resolve, rejected) => {
  throw new Error('test')
})

//此时只有then的第二个参数可以捕获到错误信息
promise
  .then(
    res => {
      //
    },
    err => {
      console.log(err)
    }
  )
  .catch(err1 => {
    console.log(err1)
  })

//此时catch方法可以捕获到错误信息
promise
  .then(res => {
    //
  })
  .catch(err1 => {
    console.log(err1)
  })

//此时只有then的第二个参数可以捕获到Promise内部抛出的错误信息
promise
  .then(
    res => {
      throw new Error('hello')
    },
    err => {
      console.log(err)
    }
  )
  .catch(err1 => {
    console.log(err1)
  })

//此时只有then的第二个参数可以捕获到Promise内部抛出的错误信息
promise.then(
  res => {
    throw new Error('hello')
  },
  err => {
    console.log(err)
  }
)

//此时catch可以捕获到Promise内部抛出的错误信息
promise
  .then(res => {
    throw new Error('hello')
  })
  .catch(err1 => {
    console.log(err1)
  })
```

### 2\. 两个捕获方法的比较

```js
// bad
promise.then(
  function (data) {
    // success
  },
  function (err) {
    // error
  }
)

// good
promise
  .then(function (data) {
    //cb
    // success
  })
  .catch(function (err) {
    // error
  })
```

上面代码中，第二种写法要好于第一种写法，理由是第二种写法可以捕获前面 then 方法执行中的错误，也更接近同步的写法（try/catch）。因此，建议总是使用 catch 方法，而不使用 then 方法的第二个参数。

## Promise 的静态方法

### all 方法

**语法：** Promise.all（iterable）

**参数：** 一个可迭代对象，如 Array。

**描述：** 此方法对于汇总多个 promise 的结果很有用，在 ES6 中可以将多个 Promise.all 异步请求并行操作，返回结果一般有下面两种情况。

1. 当所有结果成功返回时按照请求顺序返回成功。
2. 当其中有一个失败方法时，则进入失败方法。

我们来看下业务的场景，对于下面这个业务场景页面的加载，将多个请求合并到一起，用 all 来实现可能效果会更好，请看代码片段。

```js
//1.获取轮播数据列表
function getBannerList() {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve('轮播数据')
    }, 300)
  })
}
//2.获取店铺列表
function getStoreList() {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve('店铺数据')
    }, 500)
  })
}
//3.获取分类列表
function getCategoryList() {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve('分类数据')
    }, 700)
  })
}
function initLoad() {
  Promise.all([getBannerList(), getStoreList(), getCategoryList()])
    .then(res => {
      console.log(res)
    })
    .catch(err => {
      console.log(err)
    })
}
initLoad()
```

从上面代码中可以看出，在一个页面中需要加载获取轮播列表、获取店铺列表、获取分类列表这三个操作，页面需要同时发出请求进行页面渲染，这样用 Promise.all 来实现，看起来更清晰、一目了然。

### allSettled 方法

Promise.allSettled 的语法及参数跟 Promise.all 类似，其参数接受一个 Promise 的数组，返回一个新的 Promise。唯一的不同在于，执行完之后不会失败，也就是说当 Promise.allSettled 全部处理完成后，我们可以拿到每个 Promise 的状态，而不管其是否处理成功。

我们来看一下用 allSettled 实现的一段代码。

```js
const resolved = Promise.resolve(2)
const rejected = Promise.reject(-1)
const allSettledPromise = Promise.allSettled([resolved, rejected])
allSettledPromise.then(function (results) {
  console.log(results)
})
// 返回结果：
// [
//    { status: 'fulfilled', value: 2 },
//    { status: 'rejected', reason: -1 }
// ]
```

从上面代码中可以看到，Promise.allSettled 最后返回的是一个数组，记录传进来的参数中每个 Promise 的返回值，这就是和 all 方法不太一样的地方。你也可以根据 all 方法提供的业务场景的代码进行改造，其实也能知道多个请求发出去之后，Promise 最后返回的是每个参数的最终状态。

### any 方法

**语法：** Promise.any（iterable）

**参数：** iterable 可迭代的对象，例如 Array。

**描述：** any 方法返回一个 Promise，只要参数 Promise 实例有一个变成 fulfilled 状态，最后 any 返回的实例就会变成 fulfilled 状态；如果所有参数 Promise 实例都变成 rejected 状态，包装实例就会变成 rejected 状态。

还是对上面 allSettled 这段代码进行改造，我们来看下改造完的代码和执行结果。

```js
const resolved = Promise.resolve(2)
const rejected = Promise.reject(-1)
const anyPromise = Promise.any([resolved, rejected])
anyPromise.then(function (results) {
  console.log(results)
})
// 返回结果：
// 2
```

从改造后的代码中可以看出，只要其中一个 Promise 变成 fulfilled 状态，那么 any 最后就返回这个 Promise。由于上面 resolved 这个 Promise 已经是 resolve 的了，故最后返回结果为 2。

### race 方法

**语法：** Promise.race（iterable）

**参数：** iterable 可迭代的对象，例如 Array。

**描述：** race 方法返回一个 Promise，只要参数的 Promise 之中有一个实例率先改变状态，则 race 方法的返回状态就跟着改变。那个率先改变的 Promise 实例的返回值，就传递给 race 方法的回调函数。

我们来看一下这个业务场景，对于图片的加载，特别适合用 race 方法来解决，将图片请求和超时判断放到一起，用 race 来实现图片的超时判断。请看代码片段。

```js
//请求某个图片资源
function requestImg() {
  var p = new Promise(function (resolve, reject) {
    var img = new Image()
    img.onload = function () {
      resolve(img)
    }
    img.src = 'http://www.baidu.com/img/flexible/logo/pc/result.png'
  })
  return p
}
//延时函数，用于给请求计时
function timeout() {
  var p = new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject('图片请求超时')
    }, 5000)
  })
  return p
}
Promise.race([requestImg(), timeout()])
  .then(function (results) {
    console.log(results)
  })
  .catch(function (reason) {
    console.log(reason)
  })
```

从上面的代码中可以看出，采用 Promise 的方式来判断图片是否加载成功，也是针对 Promise.race 方法的一个比较好的业务场景。

### 总结

| Promise 方法 |                     简单总结                     |
| :----------: | :----------------------------------------------: |
|     all      |           primose所有返回结果为成功才返回           |
|  allSettled  | primose不论返回结果是否成功，都返回每个参数执行状态 |
|     any      |   primose中只要有一个成功，就返回该成功的执行结果   |
|     race     |       返回最先执行完成的primose的执行结果       |
