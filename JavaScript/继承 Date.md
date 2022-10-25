---
aliases: []
tags: ['JavaScript','date/2022-03','year/2022','month/03']
date: 2022-03-15-Tuesday 16:10:48
update: 2022-03-15-Tuesday 16:10:54
---

#### 继承 Date

[[继承#JS 实现继承的几种方式|几种继承方式]]**无法实现对 Date 对象的继承**。我们来进行测试：

[[继承#^d5270b|inherit]]

```js
function DateConstructor() {
    Date.apply(this, arguments)
    this.foo = 'bar'
}
inherit(DateConstructor, Date)
DateConstructor.prototype.getMyTime = function() {
    return this.getTime()
};

let date = new DateConstructor()
console.log(date.getMyTime())
```

将会得到报错：`Uncaught TypeError: this is not a Date object.`

究其原因，是因为 JavaScript 的日期对象只能通过 JavaScript Date 作为构造函数来实例化得到。因此 v8 引擎实现代码中就一定有所限制，如果发现调用 getTime() 方法的对象不是 Date 构造函数构造出来的实例，则抛出错误。

那么如何实现对 Date 的继承呢？

```js
function DateConstructor () {
  var dateObj = new (Function.prototype.bind.apply(Date, [Date].concat(Array.prototype.slice.call(arguments))))()
  Object.setPrototypeOf(dateObj, DateConstructor.prototype)
  dateObj.foo = 'bar'
  return dateObj
}
Object.setPrototypeOf(DateConstructor.prototype, Date.prototype)
DateConstructor.prototype.getMyTime = function getTime () {
  return this.getTime()
}
let date = new DateConstructor()
console.log(date.getMyTime())
```

我们来分析一下代码，调用构造函数 DateConstructor 返回的对象 dateObj 有：

```js
dateObj.__proto__ === DateConstructor.prototype
```

而我们通过：

```js
Object.setPrototypeOf(DateConstructor.prototype, Date.prototype)
```

实现了：

```js
DateConstructor.prototype.__proto__ === Date.prototype
```

所以连起来就是：

```js
date.__proto__.__proto__ === Date.prototype
```

继续分析，DateConstructor 构造函数里，返回的 dateObj 是一个真正的 Date 对象，因为：

```js
var dateObj = new (Function.prototype.bind.apply(Date, [Date].concat(Array.prototype.slice.call(arguments))))()var dateObj = new (Function.prototype.bind.apply(Date, [Date].concat(Array.prototype.slice.call(arguments))))()
```

它终归还是由 Date 构造函数实例化出来的，因此它有权调用 Date 原型上的方法，而不会被引擎限制。

整个实现过程通过**更改原型关系**，在构造函数里调用原生构造函数 Date，并返回其实例的方法，“欺骗了”浏览器。当然这样的做法比较取巧，其**副作用是更改了原型关系**，这样也会干扰浏览器某些优化操作。

那么有没有更加“体面”的方式呢？

其实随着 ES6 class 的推出，我们完全可以直接使用 extends 关键字了：

```js
class DateConstructor extends Date {
  constructor () {
    super()
    this.foo = 'bar'
  }
  getMyTime () {
    return this.getTime()
  }
}
let date = new DateConstructor()
```

上面的方法可以完美执行：

```js
date.getMyTime()
// 1558921640586
```

直接在支持 ES6 class 的浏览器中使用完全没有问题，可是我们项目大部分都是使用 Babel 进行编译。按照 Babel 编译 class 的方法，运行其产出后，仍然会得到报错“Uncaught TypeError: this is not a Date object.”，因此我们可以得知：Babel 并没有对继承 Date 进行特殊处理，无法做到兼容。
