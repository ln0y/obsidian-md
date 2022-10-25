---
aliases: []
tags: ['JavaScript','date/2022-10','year/2022','month/10']
date: 2022-10-24-星期一 17:35:59
update: 2022-10-25-星期二 15:28:52
---

## 什么是 `Symbol`

`Symbol` 作为原始数据类型的一种，表示独一无二的值，在之前，对象的键以字符串的形式存在，所以极易引发键名冲突问题，而 `Symbol` 的出现正是解决了这个痛点，它的使用方式也很简单。

## `Symbol` 的使用

创建一个 `Symbol` 与创建 `Object` 不同，只需要 `a = Symbol()` 即可

```js
let a = Symbol()
typeof a
```

使用时需要注意的是：**不可以使用 `new` 来搭配 `Symbol()` 构造实例**，因为其会抛出错误

```js
let a = new Symbol()
typeof a // Symbol is not a constructor
```

通常使用 `new` 来构造是想要得到一个包装对象，而 `Symbol` 不允许这么做，那么如果我们想要得到一个 `Symbol()` 的对象形式，可以使用 `Object()` 函数

```js
let a = Symbol()
let b = Object(a)
typeof b // object
```

介绍到这里，问题来了，`Symbol` 看起来都一样，我们怎么区分呢？我们需要传入一个字符串的参数用来描述 `Symbol()`

```js
let a = Symbol()
let b = Symbol()
```

上面看来 `a` 和 `b` 的值都是 `Symbol`，代码阅读上，两者没区分，那么我们调用 `Symbol()` 函数的时候传入字符串用来描述我们构建的 `Symbol()`

```js
let a = Symbol("a")
let b = Symbol("b")
```

## `Symbol` 的应用✌️

> `Symbol` 的应用其实利用了唯一性的特性。

### 作为对象的属性

大家有没有想过，如果我们在不了解一个对象的时候，想为其添加一个方法或者属性，又怕键名重复引起覆盖的问题，而这个时候我们就需要一个 **唯一** 性的键来解决这个问题，于是 `Symbol` 出场了，它可以作为对象的属性的键，并键名避免冲突。

```js
let a = Symbol()
let obj = {}
obj[a] = "hello world"
```

我在上面创建了一个 `symbol` 作为键的对象，其步骤如下

1. 创建一个 `Symbol`
2. 创建一个对象
3. 通过 `obj[]` 将 `Symbol` 作为对象的键

值得注意的是我们无法使用 `.` 来调用对象的 `Symbol` 属性，所以必须使用 `[]` 来访问 `Symbol` 属性

### 降低代码耦合

我们经常会遇到这种代码

```js
if (name === "猪痞恶霸") {
    console.log(1)
}
```

又或者

```js
switch (name) {
        case "猪痞恶霸"
        console.log(1)
        case "Ned"
        console.log(2)
}
```

在这两段段代码中作为判断控制语句的 `"猪痞恶霸"` 与 `"Ned"` 被称为魔术字符串，即 **与代码强耦合的字符串**，可以理解为：与我们的程序代码强制绑定在一起，然而这会导致一个问题，在条件判断复杂的情况下，我们想要更改我们的判断条件，就需要更改每一个判断控制，维护起来非常麻烦，所以我们可以换一种形式来解决字符串与代码强耦合。

```js
const judge = {
    name_1:"猪痞恶霸"
    name_2:"Ned"
}
switch (name) {
        case judge.name_1
        console.log(1)
        case judge.name_2
        console.log(2)
}
```

我们声明了一个存储判断条件字符串的对象，通过修改对象来自如地控制判断条件，当然本小节的主题是 `Symbol`，所以还能继续优化！

```js
const judge = {
    rectangle:Symbol("rectangle"),
    triangle:Symbol("triangle")
}
function getArea(model, size) {
    switch (model) {
        case judge.rectangle:
            return size.width * size.height
        case judge.triangle:
            return size.width * size.height / 2
    }
}
let area = getArea(judge.rectangle ,{width:100, height:200})
console.log(area)
```

为了更加直观地了解我们优化的过程，上面我创建了一个求面积的工具函数，利用 `Symbol` 的特性，我们使我们的条件判断更加精确，而如果是字符串形式，没有唯一的特点，可能会出现判断错误的情况。

### 全局共享 Symbol

如果我们想在不同的地方调用已经同一 `Symbol` 即全局共享的 `Symbol`，可以通过 `Symbol.for()` 方法，参数为创建时传入的描述字符串，该方法可以遍历 **全局注册表** 中的的 `Symbol`，当搜索到相同描述，那么会调用这个 `Symbol`，如果没有搜索到，就会创建一个新的 `Symbol`。

为了更好地理解，请看下面例子

```js
let a = Symbol.for("a")
let b = Symbol.for("a")
a === b // true
```

如上创建 `Symbol`

0. 首先通过 `Symbol.for()` 在全局注册表中寻找描述为 `a` 的 `Symbol`，而目前没有符合条件的 `Symbol`，所以创建了一个描述为 `a` 的 `Symbol`
1. 当声明 `b` 并使用 `Symbol.for()` 在全局注册表中寻找描述为 `a` 的 `Symbol`，找到并赋值
2. 比较 `a` 与 `b` 结果为 `true` 反映了 `Symbol.for()` 的作用

再来看看下面这段代码

```js
let a = Symbol("a")
let b = Symbol.for("a")
a === b // false
```

woc，结果竟然是 `false`，与上面的区别仅仅在于第一个 `Symbol` 的创建方式，带着惊讶的表情，来一步一步分析一下为什么会出现这样的结果

0. 使用 `Symbol("a")` 直接创建，所以该 `Symbol("a")` 不在全局注册表中
1. 使用 `Symbol.for("a")` 在全局注册表中寻找描述为 `a` 的 `Symbol`，并没有找到，所以在全局注册表中又创建了一个描述为 `a` 的新的 `Symbol`
2. 秉承 `Symbol` 创建的唯一特性，所以 `a` 与 `b` 创建的 `Symbol` 不同，结果为 `false`

问题又又又来了！我们如何去判断我们的 `Symbol` 是否在全局注册表中呢？

`Symbol.keyFor()` 帮我们解决了这个问题，他可以通过变量名查询该变量名对应的 `Symbol` 是否在全局注册表中

```js
let a = Symbol("a")
let b = Symbol.for("a")
Symbol.keyFor(a) // undefined
Symbol.keyFor(b) // 'a'
```

如果查询存在即返回该 `Symbol` 的描述，如果不存在则返回 `undefined`

以上通过使用 `Symbol.for()` 实现了 `Symbol` 全局共享，下面我们来看看 `Symbol` 的另一种应用

## 内置 `Symbol` 值又是什么❔

上面的 `Symbol` 使用是我们自定义的，而 JS 有内置了 `Symbol` 值，个人的理解为：由于唯一性特点，在对象内，作为一个唯一性的键并对应着一个方法，在对象调用某方法的时候会调用这个 `Symbol` 值对应的方法，并且我们还可以通过更改内置 `Symbol` 值对应的方法来达到更改外部方法作用的效果。

为了更好地理解上面这一大段话，咱们以 `Symbol.hasInstance` 作为例子来看看内置 `Symbol` 到底是个啥！

```js
class demo {
    static [Symbol.hasInstance](item) {
        return item === "猪痞恶霸"
    }
}
"猪痞恶霸" instanceof demo // true
```

`Symbol.hasInstance` 对应的外部方法是 `instanceof`，这个大家熟悉吧，经常用于判断类型。而在上面的代码片段中，我创建了一个 `demo` 类，并重写了 `Symbol.hasInstance`，所以其对应的 `instanceof` 行为也会发生改变，其内部的机制是这样的：当我们调用 `instanceof` 方法的时候，内部对应调用 `Symbol.hasInstance` 对应的方法即 `return item === " 猪痞恶霸"`

[阮一峰 ES6 Symbol](https://es6.ruanyifeng.com/#docs/symbol)

[MDN Symbol](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
