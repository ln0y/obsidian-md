---
aliases: []
tags: ['js/call','js/apply','js/bind','JavaScript','date/2022-02','year/2022','month/02']
date: 2022-02-26-Saturday 15:09:59
update: 2022-02-26-Saturday 17:23:24
---

## apply & call & bind 原理介绍

call、apply 和 bind 是挂在 Function 对象上的三个方法，调用这三个方法的必须是一个函数。

```js
func.call(thisArg, param1, param2, ...)
func.apply(thisArg, [param1,param2,...])
func.bind(thisArg, param1, param2, ...)
```

其中 func 是要调用的函数，thisArg 一般为 this 所指向的对象，后面的 param1、2 为函数 func 的多个参数，如果 func 不需要参数，则后面的 param1、2 可以不写。

这三个方法共有的、比较明显的作用就是，都可以改变函数 func 的 this 指向。call 和 apply 的区别在于，传参的写法不同：apply 的第 2 个参数为数组； call 则是从第 2 个至第 N 个都是给 func 的传参；而 bind 和这两个（call、apply）又不同，bind 虽然改变了 func 的 this 指向，但不是马上执行，而这两个（call、apply）是在改变了函数的 this 指向之后立马执行。

对应在程序中：A 对象有个 getName 的方法，B 对象也需要临时使用同样的方法，那么这时候我们是单独为 B 对象扩展一个方法，还是借用一下 A 对象的方法呢？当然是可以借用 A 对象的 getName 方法，既达到了目的，又节省重复定义，节约内存空间。

>注：如果对一个函数进行多次 bind， this 永远由第一次 bind 决定

```js
let a = {
  name: 'jack',
  getName: function (msg) {
    return msg + this.name
  }
}
let b = {
  name: 'lily'
}
console.log(a.getName('hello~'))  // hello~jack
console.log(a.getName.call(b, 'hi~'))  // hi~lily
console.log(a.getName.apply(b, ['hi~']))  // hi~lily
let name = a.getName.bind(b, 'hello~')
console.log(name())  // hello~lily
```

从上面的代码执行的结果中可以发现，使用这三种方式都可以达成我们想要的目标，即通过改变 this 的指向，让 b 对象可以直接使用 a 对象中的 getName 方法。从结果中可以看到，最后三个方法输出的都是和 lily 相关的打印结果，满足了我们的预期。

## 方法的应用场景

下面几种应用场景，你多加体会就可以发现它们的理念都是“借用”方法的思路。我们来看看都有哪些。

### 判断数据类型

用 [[数据类型#Object prototype toString|Object.prototype.toString 来判断类型]]是最合适的，借用它我们几乎可以判断所有类型的数据。

```js
function getType (obj) {
  let type = typeof obj
  if (type !== "object") {
    return type
  }
  return Object.prototype.toString.call(obj).replace(/^$/, '$1')
}

```

结合上面这段代码，以及在前面讲的 call 的方法的 “借用” 思路，那么判断数据类型就是借用了 Object 的原型链上的 toString 方法，最后返回用来判断传入的 obj 的字符串，来确定最后的数据类型。

### 类数组借用方法

类数组因为不是真正的数组，所有没有数组类型上自带的种种方法，所以我们就可以利用一些方法去借用数组的方法，比如借用数组的 push 方法，看下面的一段代码。

```js
var arrayLike = {
  0: 'java',
  1: 'script',
  length: 2
}
Array.prototype.push.call(arrayLike, 'jack', 'lily')
console.log(typeof arrayLike) // 'object'
console.log(arrayLike)
// {0: "java", 1: "script", 2: "jack", 3: "lily", length: 4}
```

从上面的代码可以看到，arrayLike 是一个对象，模拟数组的一个类数组。从数据类型上看，它是一个对象。从上面的代码中可以看出，用 typeof 来判断输出的是 'object'，它自身是不会有数组的 push 方法的，这里我们就用 call 的方法来借用 Array 原型链上的 push 方法，可以实现一个类数组的 push 方法，给 arrayLike 添加新的元素。

### 获取数组的最大 / 最小值

我们可以用 apply 来实现数组中判断最大 / 最小值，apply 直接传递数组作为调用方法的参数，也可以减少一步展开数组，可以直接使用 Math.max、Math.min 来获取数组的最大值 / 最小值，请看下面这段代码。

```js
let arr = [13, 6, 10, 11, 16]
const max = Math.max.apply(Math, arr)
const min = Math.min.apply(Math, arr)

console.log(max)  // 16
console.log(min)  // 6
```

### 继承

用new、call 共同实现了各种各样的[[继承#组合继承（前两种组合）|继承方式]]。

![[继承#组合继承（前两种组合）]]

## apply 和 call 的实现

由于 apply 和 call 基本原理是差不多的，只是参数存在区别。

![[Function.prototype.apply]]

![[Function.prototype.call]]

从上面的代码可以看出，实现 call 和 apply 的关键就在参数。其中显示了用 context 这个临时变量来指定上下文，然后还是通过执行 eval （可以用扩展运算符...代替）来执行 context.fn 这个函数，最后返回 result。

要注意这两个方法和 bind 的区别就在于，这两个方法是直接返回执行结果，而 bind 方法是返回一个函数，因此这里直接用 eval 执行得到结果。

## bind 的实现

结合上面两个方法的实现，bind 的实现思路基本和 apply 一样，但是在最后实现返回结果这里，bind 和 apply 有着比较大的差异，bind 不需要直接执行，因此不再需要用 eval ，而是需要通过返回一个函数的方式将结果返回，之后再通过执行这个结果，得到想要的执行效果。

![[Function.prototype.bind]]

从上面的代码中可以看到，实现 bind 的核心在于返回的时候需要返回一个函数，故这里的 fbound 需要返回，但是在返回的过程中原型链对象上的属性不能丢失。因此这里需要用Object.create 方法，将 this.prototype 上面的属性挂到 fbound 的原型上面，最后再返回 fbound。这样调用 bind 方法接收到函数的对象，再通过执行接收的函数，即可得到想要的结果。

## apply & call & bind 异同

| 方法/特征 |       call       |      apply       |      bind      |
|:---------:|:----------------:|:----------------:|:--------------:|
| 方法参数  |       多个       |     单个数组     |      多个      |
| 方法功能  | 函数调用改变this | 函数调用改变this |  函数调用改变  |
| 返回结果  |     直接执行     |     直接执行     | 返回待执行函数 |
| 底层实现  |     通过eval     |     通过eval     | 间接调用apply  |
