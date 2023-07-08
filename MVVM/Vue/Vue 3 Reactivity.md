---
aliases: []
tags: ['MVVM/Vue','date/2022-03','year/2022','month/03']
date: 2022-03-27-Sunday 16:52:17
update: 2022-04-04-Monday 23:11:11
---

## Reactive

<iframe src="https://player.bilibili.com/player.html?aid=370337305&bvid=BV1SZ4y1x7a9&cid=180815908&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" width="100%" height="500"> </iframe>

首先看一个简单的Vue应用程序，一个简单的模板。

![](_attachment/img/Pasted image 20220327171232.png)

如果我们加载这个组件，然后我们的价格改变了，Vue知道怎么去更新这里的模板，以及那个会更新模版的计算机属性。所以问题是，Vue是怎么知道去更新所有的东西？特别是，Vue的响应式。因为这不是JavaScript通常的工作方式。

![](_attachment/img/Pasted image 20220327171317.png)

它没有更新，这里没有响应式。

我们需要提出问题，怎样存储总数的计算方式才能当价格或数量更新时, 让他再跑(计算)一次.

![](_attachment/img/Pasted image 20220327171952.png)

在一个匿名函数中计算我们的总数把它储存在effect(效果)里面。当我们想保存effect中的代码时, 我们需要调用track.然后调用effect来计算首次总数，之后在某个时刻我们将调用trigger来运行所有储存了的代码。

```js
let price = 5
let quantity = 2
let total = 0

// Set保证相同的值只存在一个
let dep = new Set() // 存储effects，

const effect = () => { total = price * quantity }
const track = () => { dep.add(effect) } // 为了跟踪依赖，将effect添加到Set中
const trigger = () => { dep.forEach(effect => effect()) } // 触发函数就会遍历存储了的每一个effect然后运行它们

track()
effect()

total // 10
quantity = 3
total // 10
trigger()
total // 15
```

通常，我们的对象会有多个属性，每个属性都需要自己的dep(依赖关系)，或者说effect的Set(集)那么，我们如何存储，或者说让每个属性拥有(自己的)依赖。

![](_attachment/img/Pasted image 20220327173445.png)

在这里你可以看到我们封装了价格和数量到一个产品对象中。每一个(属性)都需要自己的依赖dep其实就是一个effect集(Set)，这个effect集应该在值发生改变时重新运行，正如我们所看到的，它的类型是Set，Set中的每个值都只是一个我们需要执行的effect，就像我们这个计算总数的匿名函数，要把这些dep储存起来, 且方便我们以后再找到它们。

![](_attachment/img/Pasted image 20220327174134.png)

```js
const product = {
  price: 5,
  quantity: 2,
}
let total = 0

const effect = () => { total = product.price * product.quantity }

// Map用于把对象做为key值，存储对应的Set
const depsMap = new Map()

const track = (key) => {
  let dep = depsMap.get(key) // 要拿到这个特定属性的dep
  if (!dep) { // 没有dep，那我们就建立一个(dep)
    // Set保证唯一，如果它(effect)已经存在，它不会再添加新的effect
    depsMap.set(key, (dep = new Set()))
  }

  dep.add(effect)
}

const trigger = (key) => {
  // 触发函数将先获取这个键的dep，遍历运行所有搜集到的依赖（effect）
  let dep = depsMap.get(key)
  if (dep) {
    dep.forEach(effect => effect())
  }
}

track('quantity')
effect()

total // 10
product.quantity = 3
total // 10
trigger('quantity')
total // 15
```

但是如果我们有多个响应式对象呢？例如用户对象。

![](_attachment/img/Pasted image 20220327175436.png)

到目前为止，我们有一个depsMap，它储存了每个属性自己的依赖对象(属性到自己依赖对象的映射)然后每一个属性都拥有它们自己的, 可以重新运行effect的dep，我们这里需要其他对象，也许是一个Map，它的键以某种方式引用了我们的响应式对象。

```js
const product = {
  price: 5,
  quantity: 2,
}
let total = 0

const effect = () => { total = product.price * product.quantity }

// WeakMap方便engine更好的gc
const targetMap = new WeakMap() // WeakMap存储着每个响应式对象的依赖

const track = (target, key) => {
  let depsMap = targetMap.get(target) // 用响应式对象取出depsMap
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key) // 在这个响应式对象的depsMap中取出key对应的effectdep
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }

  dep.add(effect) // 添加新的effect
}

const trigger = (target, key) => {
  const depsMap = targetMap.get(target) // 获取响应式对象的depsMap
  if (!depsMap) return
  let dep = depsMap.get(key) // 获取对应key的depSet
  if (dep) {
    dep.forEach(effect => effect())
  }
}

track(product, 'quantity')
effect()

total // 10
product.quantity = 3
total // 10
trigger(product, 'quantity')
total // 15
```

![](_attachment/img/Pasted image 20220327181146.png)

targetMap存储了与每个“响应式对象属性”关联的依赖，depsMap存储了每个属性的依赖，并且dep是一个effects集(Set)的依赖，这些effect应该在值发生变化时重新运行

## Proxy & Reflect

我们仍在调用track和trigger来录下(保存)我们的effect和回放(触发)我们的effect，我们想我们的响应式引擎自动调用跟踪和触发，基本上来说, 在运行effect时，如果访问了product的属性，或者说是使用了get这正是我们想调用track去保存effect的时候，如果product的属性改变了, 或者说使用了SET这时我们正想调用trigger来运行那些保存了的effect，所以问题变成了，我们如何拦截这些GET和SET方法？

![](_attachment/img/Pasted image 20220404153110.png)

在Vue 2中，我们使用了ES5的Object.defineProperty()去拦截GET和SET。使用Vue 3，我们将使用ES6 Reflect和ES6 Proxy(代理)。

我们有三种办法可以访问对象的属性：

```js
let produce = { proce: 5, quantity: 2 }

// 1. 点运算符
produce.quantity

// 2. 中括号运算符
produce['quantity']

// 3. Reflect.get
Reflect.get(produce, 'quantity')
```

在Proxy里使用Reflect会有一个附加参数，称为接收器，它将传递到我们的Relect调用中，它保证了当我们的对象有继承自其它对象的值或函数时this指针能正确的指向使用(的对象)，这将避免一些我们在vue2中有的响应式警告。

```js
const proxied = new Proxy(product, {
  get (target, key, receiver) {
    console.log('get', key)
    return Reflect.get(target, key, receiver)
  }
})

console.log(proxied.quantity)
```

我们的代理还需要拦截set方法，set(方法)接收target、key、value和receiver。

```js
const proxied = new Proxy(product, {
  get (target, key, receiver) {
    console.log('get', key)
    return Reflect.get(target, key, receiver)
  },
  set (target, key, value, receiver) {
    console.log('set', key, value)
    return Reflect.set(target, key, value, receiver)
  }
})

console.log(proxied.quantity)
proxied.quantity = 4
```

让我们再封装一下这段代码让它长得更像[Vue3的源代码](https://github.com/vuejs/core/blob/245230e135152900189f13a4281302de45fdcfaa/packages/reactivity/src/reactive.ts#L181)

```js
function reactive (target) {
  const handle = {
    get (target, key, receiver) {
      console.log('get', key)
      return Reflect.get(target, key, receiver)
    },
    set (target, key, value, receiver) {
      console.log('set', key, value)
      return Reflect.set(target, key, value, receiver)
    }
  }
  return new Proxy(target, handle)
}

const proxied = reactive(product)

console.log(proxied.quantity)
proxied.quantity = 4
```

让我们回到原来的代码，为了调用track, 我们需要Proxy去监听get，Proxy去监听set去调用trigger

![](_attachment/img/Pasted image 20220404155330.png)

```js
function reactive (target) {
  const handle = {
    get (target, key, receiver) {
      const result = Reflect.get(target, key, receiver)
      track(target, key)
      console.log('get', key)
      return result
    },
    set (target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)
      if (oldValue !== value) { // 视频中错误的写成result，Reflect.set返回的是boolean
        trigger(target, key)
      }
      console.log('set', key, value)
      return result
    }
  }
  return new Proxy(target, handle)
}
```

![](_attachment/img/Pasted image 20220404160107.png)

完整代码：

```js
const targetMap = new WeakMap() // targetMap 存储每个对象在更新时应该重新运行的效果
function track (target, key) {
  // 我们需要确保正在跟踪此 effect。
  let depsMap = targetMap.get(target) // 获取此目标的当前 depsMap
  if (!depsMap) {
    // 没有Map。
    targetMap.set(target, (depsMap = new Map())) // 创建一个
  }
  let dep = depsMap.get(key) // 设置时获取当前需要运行的依赖（effect）
  if (!dep) {
    // 没有依赖（effect）
    depsMap.set(key, (dep = new Set())) // 创建一个新的Set
  }
  dep.add(effect) // 为依赖Map添加effect
}
function trigger (target, key) {
  const depsMap = targetMap.get(target) // 这个对象是否有任何具有依赖关系（effect）的属性
  if (!depsMap) {
    return
  }
  let dep = depsMap.get(key) // 如果有与此相关的依赖项（effect）
  if (dep) {
    dep.forEach((effect) => {
      // 全部运行依赖（effect）
      effect()
    })
  }
}

function reactive (target) {
  const handlers = {
    get (target, key, receiver) {
      let result = Reflect.get(target, key, receiver)
      track(target, key)
      return result
    },
    set (target, key, value, receiver) {
      let oldValue = target[key]
      let result = Reflect.set(target, key, value, receiver)
      if (result && oldValue != value) {
        trigger(target, key)
      }
      return result
    },
  }
  return new Proxy(target, handlers)
}

const product = reactive({
  price: 5,
  quantity: 2,
})

let total = 0

const effect = () => { total = product.price * product.quantity }

effect()

console.log(total) // 10
product.quantity = 4
console.log(total) // 20
```

## activeEffect & ref

在上面的代码，如果我们添加另一个get, 比如product.quantity，那我们现在的代码将会调用追踪函数它会去遍历targetMap, 还有(各种)依赖，以确保当前effect会被记录(保存)下来，但这不是我们想要的，我们只应该在effect里调用追踪函数。

![](_attachment/img/Pasted image 20220404170449.png)

所以我们需要改下我们的代码，为此，我们将引入一个activeEffect变量。它是现在正在运行中的effect，这也是Vue3解决这个问题的方法。

```js
const targetMap = new WeakMap()
function track (target, key) {
  if (activeEffect) { // 判断当前是否运行在effect中，effect外获取变量不会重新运行所有effect
    let depsMap = targetMap.get(target)
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key)
    if (!dep) {
      depsMap.set(key, (dep = new Set()))
    }
    dep.add(activeEffect)
  }
}
function trigger (target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  let dep = depsMap.get(key)
  if (dep) {
    dep.forEach((effect) => {
      effect()
    })
  }
}

function reactive (target) {
  const handlers = {
    get (target, key, receiver) {
      let result = Reflect.get(target, key, receiver)
      track(target, key)
      return result
    },
    set (target, key, value, receiver) {
      let oldValue = target[key]
      let result = Reflect.set(target, key, value, receiver)
      if (result && oldValue != value) {
        trigger(target, key)
      }
      return result
    },
  }
  return new Proxy(target, handlers)
}

// 正在运行的effect
let activeEffect = null
function effect (eff) {
  activeEffect = eff // 相当于flag
  activeEffect() // 调用effect函数，函数内用到的属性会被track
  activeEffect = null
}

const product = reactive({
  price: 5,
  quantity: 2,
})

let total = 0

// 运行一遍进行依赖搜集
effect(() => { total = product.price * product.quantity })

console.log(total) // 10
product.quantity = 4
console.log(total) // 20
console.log(product.quantity) // 4
```

然后看下面一个例子：

![](_attachment/img/Pasted image 20220404173101.png)

```js
const product = reactive({
  price: 5,
  quantity: 2,
})
let salePrice = 0 // 引入一个新的变量
let total = 0

effect(() => { total = salePrice * product.quantity })
effect(() => { salePrice = product.price * 0.9 })

console.log(total) // 0
product.price = 4
console.log(total) // 0
```

salePrice没有被追踪导致运行结果不正确。因为在这种情况下，当销售价格确定时，我需要重新计算总数。这是不可能的，因为salePrice并不是响应式的，那么我们该如何实现这个呢？

这是一个使用Ref的好地方，Ref接受一个值并返回一个响应的、可变的Ref对象，Ref对象只有一个“.value”属性它指向内部的值。但现在我们需要考虑如何定义Ref,这里有两种方法：

第一种：

```js
function ref (value) {
  return reactive({ value })
}
```

我们可以简单地使用reactive，Ref函数将接受一个初始值，我们只需将键value设置为初始值，在这个例子中，这是可行的，但Vue 3不是这样做的。

我们来看看它的解决方案，为了了解Vue 3如何实现Ref，我们需要了解对象访问器是什么，有时也称为计算属性，这不是指Vue里的计算属性，这是JavaScript计算属性。先看一个简单的例子。

```js
let user = {
  firstName: 'Gregg',
  lastName: 'Pollack',
  get fullName () {
    return `${this.firstName} ${this.lastName}`
  },
  set fullName (value) {
    [this.firstName, this.lastName] = value.split(' ')
  }
}

console.log(user.firstName, user.lastName) // 'Gregg' 'Pollack'
user.fullName = 'John Doe'
console.log(user.firstName, user.lastName) // 'John' 'Doe'
```

这就是在fullName中使用getter和setter的正确方法，现在，我们如何使用对象访问器来定义Ref？

首先，我们定义一个对象, 它有一个名为value的getter，这里调用我们的track函数追踪我们正在创建的对象，键是“value”, 然后返回原始值(传入值)，我们的setter接收一个新值，把新值赋值给原始值，然后调用trigger函数，然后我们就返回这个(r)对象。

```js
function ref (raw) {
  const r = {
    get value () {
      track(r, 'value')
      return raw
    },
    set value (newVal) {
      if (raw !== newVal) {
        raw = newVal
        trigger(r, 'value')
      }
    },
  }
  return r
}
```

如果你看看[Vue的源代码](https://github.com/vuejs/core/blob/245230e135152900189f13a4281302de45fdcfaa/packages/reactivity/src/ref.ts#L96)，你会发现Vue 3就是这样做的，当然了，它会更加的复杂一点，但这就是它的要旨(核心)。

```js
const product = reactive({
  price: 5,
  quantity: 2,
})
let salePrice = ref(0)
let total = 0

function ref (raw) {
  const r = {
    get value () {
      track(r, 'value')
      return raw
    },
    set value (newVal) {
      if (raw !== newVal) {
        raw = newVal
        trigger(r, 'value')
      }
    },
  }
  return r
}

effect(() => { total = salePrice.value * product.quantity })
effect(() => { salePrice.value = product.price * 0.9 })

console.log(total) // 9
product.price = 4
console.log(total) // 7.2
```

## Computed

如果你熟悉Vue 3的响应式API，你现在看着这些代码, 然后会这样想，为什么我这里的销售价格和总价不使用计算属性，没错我们看看用计算属性怎么做

```js
const salePrice = computed(() => product.price * 0.9)
const total = computed(() => salePrice.value * product.quantity)
```

那么我们又该如何定义computed，计算属性或计算值是响应式的，有点像Ref。

首先，我们将定义一个computed函数，它接收一个我们称之为getter的参数，因为它得到了一个值。

思考一下它的伪代码，我们要创建一个响应式引用，我们将其称为result。然后我们在effect中运行getter，因为我们需要监听响应值，然后把其(getter)赋值于result.value，最后我们将返回结果。

```js
const product = reactive({
  price: 5,
  quantity: 2,
})

function computed (getter) {
  let result = ref()
  effect(() => (result.value = getter()))
  return result
}

const salePrice = computed(() => product.price * 0.9)
const total = computed(() => salePrice.value * product.quantity)

console.log(total.value) // 9
product.price = 4
console.log(total.value) // 7.2
```

[vue3 computed源码](https://github.com/vuejs/core/blob/245230e135152900189f13a4281302de45fdcfaa/packages/reactivity/src/computed.ts#L26)

这很简单，我们简单的响应式代码已经有了超过Vue 2的响应式代码的优势，记住，因为在Vue 2中，我们在创造一个响应式对象之后无法再添加新的响应式属性。

```js
product.name = 'apple'

effect(() => {
  console.log(product.name) // apple, banana
})
// 在vue2中不会再次运行 effect 打印banana
product.name = 'banana'
```

因为在vue2中“name”不是响应式的，Get和Set钩子是被添加到各个属性下的，所以要增加新的属性，你还要做些其它事情, 就像这样

```js
Vue.set(product, 'name', 'banana')
```

这看起来一点也不优雅，但是，我们现在的代码使用了Proxy，这意味着我们可以添加新属性，然后它们会自动变成响应式，因此，对于Vue 3，因为我们使用基于Proxy的响应式，当我们有一个使用代理的响应式对象时，我们可以添加属性，这是没问题。

## code

最后贴一下全部代码

```js
const targetMap = new WeakMap() // targetMap 存储每个对象在更新时应该重新运行的效果

function track (target, key) {
  if (activeEffect) {
    // 我们需要确保正在跟踪此 effect。
    let depsMap = targetMap.get(target) // 获取此目标的当前 depsMap
    if (!depsMap) {
      // 没有Map。
      targetMap.set(target, (depsMap = new Map())) // 创建一个
    }
    let dep = depsMap.get(key) // 设置时获取当前需要运行的依赖（effect）
    if (!dep) {
      //没有依赖（effect）
      depsMap.set(key, (dep = new Set())) // 创建一个新的Set
    }
    dep.add(activeEffect) //为依赖Map添加effect
  }
}

function trigger (target, key) {
  const depsMap = targetMap.get(target) //这个对象是否有任何具有依赖关系（effect）的属性
  if (!depsMap) {
    return
  }
  let dep = depsMap.get(key) //如果有与此相关的依赖项（effect）
  if (dep) {
    dep.forEach((effect) => {
      //全部运行依赖（effect）
      effect()
    })
  }
}

function reactive (target) {
  const handlers = {
    get (target, key, receiver) {
      let result = Reflect.get(target, key, receiver)
      track(target, key)
      return result
    },
    set (target, key, value, receiver) {
      let oldValue = target[key]
      let result = Reflect.set(target, key, value, receiver)
      if (result && oldValue != value) {
        trigger(target, key)
      }
      return result
    },
  }
  return new Proxy(target, handlers)
}

let activeEffect = null
function effect (eff) {
  activeEffect = eff
  activeEffect()
  activeEffect = null
}

function ref (raw) {
  const r = {
    get value () {
      track(r, 'value')
      return raw
    },
    set value (newVal) {
      if (raw !== newVal) {
        raw = newVal
        trigger(r, 'value')
      }
    },
  }
  return r
}

function computed (getter) {
  let result = ref()
  effect(() => (result.value = getter()))
  return result
}

const product = reactive({
  price: 5,
  quantity: 2,
})

// let salePrice = ref(0)
// let total = 0

// effect(() => { total = salePrice.value * product.quantity })
// effect(() => { salePrice.value = product.price * 0.9 })

const salePrice = computed(() => product.price * 0.9)
const total = computed(() => salePrice.value * product.quantity)

console.log(total.value)
product.price = 4
console.log(total.value)

product.name = 'apple'

effect(() => {
  console.log(product.name)
})

product.name = 'banana'
```

### vue3 reactivity部分源码

https://github.com/vuejs/core/tree/main/packages/reactivity/src

部分文件说明：
- effects.ts：在这里，它定义了effect、track和trigger
- baseHandlers.ts：它定义了Proxy的处理程序, get和set，它们会调用track和trigger
- reactive.ts：这定义了我们的响应式语法，它创造了一个ES6 Proxy, 并使用我们的get和set代理处理程序
- ref.ts：它通过对象访问器定义了响应式引用，它会调用track和trigger
- computed.ts：它定义的“计算”和我们使用对象访问器定义的有点不同，但它使用了effect并且并也返回一个类似Ref的对象

![[vue3 reactivity]]
