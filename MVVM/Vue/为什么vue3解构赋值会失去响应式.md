---
aliases: []
tags: ['MVVM/Vue', 'date/2023-10', 'year/2023', 'month/10']
date: 2023-10-13-星期五 18:26:52
update: 2023-10-13-星期五 18:27:19
---

## 前言

`vue3` 发布以来经历两年风头正盛，现在大有和 react 平分天下的势头，我们知道他是基于 proxy 实现响应式的能力， 解决了 `vue2` 所遗留下来的一些问题，同时也正由于 proxy 的特性，也提高了运行时的性能

凡事有利有弊， `proxy` 虽然无敌，但是他也有本身的局限，从而产生一些我认为的弊端（其实就是不符合 js 语言的自然书写方式，有的人觉得就是个特殊写法，他不属于弊端）

- 1、 原始值的响应式系统的实现导致必须将他包装为一个对象， 通过 `.value` 的方式访问
- 2、 ES6 解构，不能随意使用。会破坏他的响应式特性

好奇心驱使，研究琢磨了一下，为什么他会造成这两个弊端

## 原始值的响应式系统的实现

在理解原始值的响应式系统的实现，我们先来温习一下 proxy 的能力！

```js
const obj = {
  name: 'win',
}

const handler = {
  get: function (target, key) {
    console.log('get--', key)
    return Reflect.get(...arguments)
  },
  set: function (target, key, value) {
    console.log('set--', key, '=', value)
    return Reflect.set(...arguments)
  },
}

const data = new Proxy(obj, handler)
data.name = 'ten'
console.log(data.name, 'data.name22')
```

上述代码中，我们发现，proxy 的使用本身就是对于对象的拦截， 通过 `new Proxy` 的返回值，拦截了 obj 对象

如此一来，当你访问对象中的值的时候，他会触发 `get` 方法， 当你修改对象中的值的时候他会触发 `set` 方法

但是到了原始值的时候，他没有对象啊，咋办呢，`new proxy` 排不上用场了。

无奈之下，我们只能包装一下了，所以就有了使用 `.value` 访问了

我们来看看具体实现

```js
import { reactive } from './reactive'
import { trackEffects, triggerEffects } from './effect'

export const isObject = value => {
  return typeof value === 'object' && value !== null
}

// 将对象转化为响应式的
function toReactive(value) {
  return isObject(value) ? reactive(value) : value
}

class RefImpl {
  public _value
  public dep = new Set() // 依赖收集
  public __v_isRef = true // 是ref的标识
  // rawValue 传递进来的值
  constructor(public rawValue, public _shallow) {
    // 1、判断如果是对象 使用reactive将对象转为响应式的
    // 浅ref不需要再次代理
    this._value = _shallow ? rawValue : toReactive(rawValue)
  }
  get value() {
    // 取值的时候依赖收集
    trackEffects(this.dep)
    return this._value
  }
  set value(newVal) {
    if (newVal !== this.rawValue) {
      // 2、set的值不等于初始值 判断新值是否是对象 进行赋值
      this._value = this._shallow ? newVal : toReactive(newVal)
      // 赋值完 将初始值变为本次的
      this.rawValue = newVal
      triggerEffects(this.dep)
    }
  }
}
```

上述代码，就是对于原始值的包装，他被包装为一个对象，通过 `get value` 和 `set value` 方法来进行原始值的访问，从而导致必须有 `.value` 的操作 ，这其实也是个无奈的选择

`相当于两瓶毒药，你得选一瓶` 鱼与熊掌不可兼得

## 为什么 ES6 解构，不能随意使用会破坏他的响应式特性

第一个问题终于整明白了，那么我们来看看最重要的第二个问题，`为什么结构赋值，会破坏响应式特性`

### proxy 背景

在开始之前，我们先来讨论一下为什么要更改 `响应式方案`

vue2 基于**Object.defineProperty**  ，但是他有很多缺陷，比如  **无法监听数组基于下标的修改，不支持 Map、Set、WeakMap 和 WeakSet 等缺陷** ，

其实这些也也不耽误我们开发， vue2 到现在还是主流，

我的理解就是 `与时俱进`， `新一代的版本，一定要紧跟语言的特性，一定要符合新时代的书写风格`，虽然 `proxy` 相对于 Object.defineProperty 有很多进步， 但是也不是一点缺点都没有，你比如说 `不兼容IE`

天底下的事情，哪有完美的呢？

### 实现原理

在理解了背景之后，我们再来假模假式的温习一下 `proxy` 原理，虽然这个都被讲烂了。

```js
const obj = {
  count: 1,
}
const proxy = new Proxy(obj, {
  get(target, key, receiver) {
    console.log('这里是get')
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    console.log('这里是set')
    return Reflect.set(target, key, value, receiver)
  },
})

console.log(proxy)
console.log(proxy.count)
```

以上代码就是 Proxy 的具体使用方式，通过和 Reflect 的配合， 就能实现对于对象的拦截

如此依赖，就能实现响应式了，大家可以发现，这个 obj 的整个对象就被拦截了，但是你发现对象在嵌套深一层

比如：

```js
const obj = {
  count: 1,
  b: {
    c: 2,
  },
}

console.log(proxy.b)
console.log(proxy.b.c)
```

他就无法拦截了，我们必须要来个包装

```js
const obj = {
  a: {
    count: 1,
  },
}

function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      console.log('这里是get')
      // 判断如果是个对象在包装一次，实现深层嵌套的响应式
      if (typeof target[key] === 'object') {
        return reactive(target[key])
      }
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      console.log('这里是set')
      return Reflect.set(target, key, value, receiver)
    },
  })
}
const proxy = reactive(obj)
```

好了，原理搞完了，我们来正式研究一下

### 解构  `props`  对象，因为它会失去响应式

```js
const obj = {
  a: {
    count: 1,
  },
  b: 1,
}

//reactive 是上文中的reactive
const proxy = reactive(obj)
const { a, b } = proxy
console.log(a)
console.log(b)
console.log(a.count)
```

![image.png](_attachment/img/3476d70c4c0d9e80210d2a72ca713251_MD5.png)

上述代码中，我们发现， 解构赋值，b 不会触发响应式，`a如果你访问的时候`，会触发响应式

这是为什么呢？

别急我们一个个解释？

先来讨论为什么解构赋值，会丢失响应式呢？

我们知道解构赋值，区分原始类型的赋值，和引用类型的赋值，

`原始类型的赋值相当于按值传递`， `引用类型的值就相当于按引用传递`

就相当于

```js
// 假设a是个响应式对象
const a = { b: 1 }
// c 此时就是一个值跟当前的a 已经不沾边了
const c = a.b

// 你直接访问c就相当于直接访问这个值 也就绕过了 a 对象的get ，也就像原文中说的失去响应式
```

那为啥 `a` 具备响应式呢?

因为 `a` 是引用类型，我们还记得上述代码中的一个判断吗。如果他是个 `object` 那么就重新包装为响应式

正式由于当前特性，导致，如果是引用类型， 你再去访问其中的内容的时候并不会失去响应式

```js
// 假设a是个响应式对象
const a = { b: { c: 3 } }
// 当你访问a.b的时候就已经重新初始化响应式了，此时的c就已经是个代理的对象
const c = a.b

// 你直接访问c就相当于访问一个响应式对象，所以并不会失去响应式
```

以上就大致解释了为什么解构赋值，可能会失去响应式，我猜的文档中懒得解释其中缘由，索性就定了个规矩！
