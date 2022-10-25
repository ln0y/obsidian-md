---
aliases: []
tags: ['js/async','JavaScript','date/2022-03','year/2022','month/03']
date: 2022-03-02-Wednesday 11:20:43
update: 2022-03-02-Wednesday 11:39:02
---

## async/await 介绍

JS 的异步编程从最开始的回调函数的方式，演化到使用 Promise 对象，再到 Generator+co 函数的方式，每次都有一些改变，但又让人觉得不彻底，都需要理解底层运行机制。

而 async/await 被称为 JS 中异步终极解决方案，它既能够像 co+Generator 一样用同步的方式来书写异步代码，又得到底层的语法支持，无须借助任何第三方库。

接下来，我们就从原理的角度来看看 async/await 这个语法糖背后到底做了哪些优化和改进，使得我们用起来会更加方便。还是按照上面 Generator 和 Promise 结合的例子，使用 async/await 语法糖来进行改造，请看改造后的代码。

```js
// readFilePromise 依旧返回 Promise 对象
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
// 这里把 Generator的 * 换成 async，把 yield 换成 await
const gen = async function () {
  const data1 = await readFilePromise('1.txt')
  console.log(data1.toString())
  const data2 = await readFilePromise('2.txt')
  console.log(data2.toString)
}
```

从上面的代码中可以看到，虽然简单地将 Generator 的 * 号换成了 async，把 yield 换成了 await，但其实 async 的内部做了不少工作。我们根据 async 的原理详细拆解一下，看看它到底做了哪些工作。

总结下来，async 函数对 Generator 函数的改进，主要体现在以下三点。

1. 内置执行器：Generator 函数的执行必须靠执行器，因为不能一次性执行完成，所以之后才有了开源的 co 函数库。但是，async 函数和正常的函数一样执行，也不用 co 函数库，也不用使用 next 方法，而 async 函数自带执行器，会自动执行。
2. 适用性更好：co 函数库有条件约束，yield 命令后面只能是 Thunk 函数或 Promise 对象，但是 async 函数的 await 关键词后面，可以不受约束。
3. 可读性更好：async 和 await，比起使用 * 号和 yield，语义更清晰明了。

说了这么多优点，我们还是通过一段简单的代码来看下 async 返回的结果，是不是使用起来更方便，请看下面的代码。

```js
async function func() {
  return 100
}
console.log(func())
// Promise {<fulfilled>: 100}
```

从执行的结果可以看出，async 函数 func 最后返回的结果直接是 Promise 对象，比较方便让开发者继续往后处理。而之前 Generator 并不会自动执行，需要通过 next 方法控制，最后返回的也并不是 Promise 对象，而是需要通过 co 函数库来实现最后返回 Promise 对象。

这样看来，ES7 加入的 async/await 的确解决了之前的问题，使开发者在编程过程中更容易理解，语法更清晰，并且也不用再单独引用 co 函数库了。因此用 async/await 写出的代码也更加优雅，相比于之前的 Promise 和 co+Generator 的方式更容易理解。
