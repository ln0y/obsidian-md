---
aliases: []
tags: ['JavaScript/functional_programming', 'date/2022-03', 'year/2022', 'month/03']
date: 2022-03-15-Tuesday 15:15:48
update: 2022-05-15-Sunday 18:40:47
---

## 函数组合的简单应用

纯函数是指：

> 一个函数如果输入参数确定，输出结果是唯一确定的，那么它就是纯函数。

同时，需要强调的是**纯函数不能修改外部变量，不能调用 Math.radom() 方法以及发送异步请求等**，因为这些操作都不具有确定性，可能会产生副作用。

纯函数是函数式编程中最基本的概念。另一个基本概念是——高阶函数：

> 高阶函数体现了“函数是第一等公民”，它是指这样的一类函数：该函数接受一个函数作为参数，返回另外一个函数。

来看一个例子：`filterLowerThan10`这个函数接受一个数组作为参数，它会挑选出数组中数值小于 10 的项目，所有符合条件的值都会构成新数组被返回：

```js
const filterLowerThan10 = array => {
  let result = []
  for (let i = 0, length = array.length; i < length; i++) {
    let currentValue = array[i]
    if (currentValue < 10) result.push(currentValue)
  }
  return result
}
```

另外一个需求，挑选出数组中非数值项目，所有符合条件的值都会构成新数组被返回，如下`filterNaN`函数：

```js
const filterNaN = array => {
  let result = []
  for (let i = 0, length = array.length; i < length; i++) {
    let currentValue = array[i]
    if (isNaN(currentValue)) result.push(currentValue)
  }
  return result
}
```

上面两个函数都是比较典型的纯函数，不够优雅的一点是 filterLowerThan10 和 filterNaN**都有遍历的逻辑，都存在了重复的 for 循环**。它们本质上都是遍历一个列表，并用给定的条件过滤列表。那么我们能否用函数式的思想，将遍历和筛选解耦呢？

好在 JavaScript 对函数式较为友好，我们使用 Filter 函数来完成，并进行一定程度的改造，如下代码：

```js
const lowerThan10 = value => value < 10
;[(12, 3, 4, 89)].filter(lowerThan10)
```

继续延伸我们的场景，如果输入比较复杂，想先过滤出小于 10 的项目，需要先保证数组中每一项都是 Number 类型，那么可以使用下面的代码：

```js
;[12, 'sd', null, undefined, {}, 23, 45, 3, 6]
  .filter(value => !isNaN(value) && value !== null)
  .filter(lowerThan10)
```

我们通过组合，实现了更多的场景。

### curry

继续思考上面的例子，filterLowerThan10 还是硬编码写死了 10 这个阈值，我们用 curry 化的思想将其改造，如下代码：

```js
const filterLowerNumber = number => {
  return array => {
    let result = []
    for (let i = 0, length = array.length; i < length; i++) {
      let currentValue = array[i]
      if (currentValue < number) result.push(currentValue)
    }
    return result
  }
}
const filterLowerThan10 = filterLowerNumber(10)
```

上面代码中我们提到了 curry 化这个概念，简单说明：

> curry 化，柯里化（currying），又译为卡瑞化或加里化，是把接受多个参数的函数变换成接受一个单一参数（最初函数的第一个参数）的函数，并且返回接受余下的参数且返回结果的新函数的技术。这个技术由克里斯托弗·斯特雷奇以逻辑学家哈斯凯尔·加里命名的。

curry 化的优势非常明显：

- 提高复用性
- 减少重复传递不必要的参数
- 动态根据上下文创建函数

其中动态根据上下文创建函数，也是一种**惰性求值**的体现。比如这段代码：

```js
const addEvent = (function () {
  if (window.addEventListener) {
    return function (type, element, handler, capture) {
      element.addEventListener(type, handler, capture)
    }
  } else if (window.attachEvent) {
    return function (type, element, fn) {
      element.attachEvent('on' + type, fn)
    }
  }
})()
```

这是一个典型兼容 IE9 浏览器事件 API 的例子，根据兼容性的嗅探，充分利用 curry 化思想，完成了需求。

那么我们如何编写一个通用化的 curry 函数呢？下面我给出一种方案：

```js
const curry = (fn, length) => {
  // 记录函数的行参个数
  length = length || fn.length
  return function (...args) {
    // 当参数未满时，递归调用
    if (args.length < length) {
      return curry(fn.bind(this, ...args), length - args.length)
    }
    // 参数已满，执行 fn 函数
    else {
      return fn.call(this, ...args)
    }
  }
}
```

如果不想使用 bind，另一种常规思路是**对每次调用时产生的参数进行存储**：

```js
const curry = fn =>
  (judge = (
    ...arg1 // judge暴露至全局
  ) =>
    // 判断参数是否已满
    arg1.length >= fn.length
      ? fn(...arg1) // 执行函数
      : (...arg2) => judge(...arg1, ...arg2)) // 将参数合并，继续递归调用

const currying = (fn, ...arg) =>
  arg.length >= fn.length ? fn(...arg) : (...args) => currying(fn, ...arg, ...args)
```

### uncurry

对应 curry 化，还有一种反 curry 化的概念：**反 curry 化在于扩大函数的适用性，使本来作为特定对象所拥有的功能函数可以被任意对象使用**。

有一个 UI 组件 Toast，如下代码简化为：

```js
function Toast(options) {
  this.message = ''
}
Toast.prototype = {
  showMessage: function () {
    console.log(this.message)
  },
}
```

这样的代码，使得 Toast 实例均可使用 ShowMessage 方法，使用方式如下：

```js
new Toast({ message: 'show me' }).showMessage()
```

如果脱离组件场景，我们不想实现 Toast 实例，而使用`Toast.prototype.showMessage`方法，预期通过反 curry 化实现，如下代码：

```js
// 反 curry 化通用函数
// 核心实现思想是：先取出要执行 fn 方法的对象，标记为 obj1，同时从 arguments 中删除，在调用 fn 时，将 fn 执行上下文环境改为 obj1
const unCurry =
  fn =>
  (...args) =>
    fn.call(...args)

const obj = {
  message: 'uncurry test',
}
const unCurryShowMessaage = unCurry(Toast.prototype.showMessage)
unCurryShowMessaage(obj) // Toast.prototype.showMessage.call(obj)
```

以上是正常函数实现 uncurry 的实现。我们也可以将 uncurry 挂载在函数原型上，如下代码：

```js
// 反 curry 化通用函数挂载在函数原型上
Function.prototype.unCurry =
  Function.prototype.unCurry ||
  function () {
    const self = this
    return function () {
      return Function.prototype.call.apply(self, arguments)
    }
  }
```

当然，我们可以借助 bind 实现：

```js
Function.prototype.unCurry = function () {
  return this.call.bind(this)
}
```

我们通过下面这个例子来理解：

```js
// 将 Array.prototype.push 反 curry 化，实现一个适用于对象的 push 方法
const push = Array.prototype.push.unCurry()
const test = { foo: 'tony' }
push(test, 'messi', 'ronaldo', 'neymar')
console.log(test)
// {0: "messi", 1: "ronaldo", 2: "neymar", foo: "tony", length: 3}
```

反 curry 化的核心思想就在于：**利用第三方对象和上下文环境，“强行改命，为我所用”**。

最后我们再看一个例子，我们将对象原型上的`toString`方法“为我所用”，实现了一个更普遍适用的类型检测函数。如下代码：

```js
// 利用反 curry 化，创建一个检测数据类型的函数 checkType
let checkType = uncurring(Object.prototype.toString)
checkType('foo') // [object String]
```
