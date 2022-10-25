---
aliases: []
tags: ['js/new','JavaScript','date/2022-02','year/2022','month/02']
date: 2022-02-26-Saturday 14:41:04
update: 2022-02-26-Saturday 15:06:35
---

## new 原理介绍

new 关键词的主要作用就是执行一个构造函数、返回一个实例对象，在 new 的过程中，根据构造函数的情况，来确定是否可以接受参数的传递。下面我们通过一段代码来看一个简单的 new 的例子。

```js
function Person () {
  this.name = 'Jack'
}
var p = new Person()
console.log(p.name)  // Jack
```

这段代码比较容易理解，从输出结果可以看出，p 是一个通过 person 这个构造函数生成的一个实例对象，这个应该很容易理解。那么 new 在这个生成实例的过程中到底进行了哪些步骤来实现呢？

1. 创建一个新对象；
2. 将构造函数的作用域赋给新对象（this 指向新对象）；
3. 执行构造函数中的代码（为这个新对象添加属性）；
4. 返回新对象。

那么问题来了，如果不用 new 这个关键词，结合上面的代码改造一下，去掉 new，会发生什么样的变化呢？

```js
function Person(){
  this.name = 'Jack'
}
var p = Person()
console.log(p) // undefined
console.log(name) // Jack
console.log(p.name) // 'name' of undefined
```

从上面的代码中可以看到，我们没有使用 new 这个关键词，返回的结果就是 undefined。其中由于 JavaScript 代码在默认情况下 this 的指向是 window，那么 name 的输出结果就为 Jack，这是一种不存在 new 关键词的情况。

那么当构造函数中有 return 一个对象的操作，结果又会是什么样子呢？

```js
function Person () {
  this.name = 'Jack'
  return { age: 18 }
}
var p = new Person()
console.log(p)  // {age: 18}
console.log(p.name) // undefined
console.log(p.age) // 18
```

通过这段代码又可以看出，当构造函数最后 return 出来的是一个和 this 无关的对象时，new 命令会直接返回这个新对象，而不是通过 new 执行步骤生成的 this 对象。

**但是这里要求构造函数必须是返回一个对象，如果返回的不是对象，那么还是会按照 new 的实现步骤，返回新生成的对象。** 接下来还是在上面这段代码的基础之上稍微改动一下。

```js
function Person () {
  this.name = 'Jack'
  return 'tom'
}
var p = new Person()
console.log(p)  // {name: 'Jack'}
console.log(p.name) // Jack
```

可以看出，当构造函数中 return 的不是一个对象时，那么它还是会根据 new 关键词的执行逻辑，生成一个新的对象（绑定了最新 this），最后返回出来。

>因此我们总结一下：new 关键词执行之后总是会返回一个对象，要么是实例对象，要么是 return 语句指定的对象。

## new 的实现

那么来看下在这过程中，new 被调用后大致做了哪几件事情。

1. 让实例可以访问到私有属性；
2. 让实例可以访问构造函数原型（constructor.prototype）所在原型链上的属性；
3. 构造函数返回的最后结果是引用数据类型。

![[JavaScript/byhand/new]]
