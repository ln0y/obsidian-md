---
aliases: []
tags: ['MVVM/Vue', 'date/2023-10', 'year/2023', 'month/10']
date: 2023-10-12-星期四 20:56:01
update: 2023-10-12-星期四 20:57:13
---

Vuex 是一个专为 Vue 服务，用于管理页面数据状态、提供统一数据操作的生态系统。它集中于 MVC 模式中的 Model 层，规定所有的数据操作必须通过 `action - mutation - state change` 的流程来进行，再结合 Vue 的数据视图双向绑定特性来实现页面的展示更新。统一的页面状态管理以及操作处理，可以让复杂的组件交互变得简单清晰，同时可在调试模式下进行时光机般的倒退前进操作，查看数据改变过程，使 code debug 更加方便。

最近在开发的项目中用到了 Vuex 来管理整体页面状态，遇到了很多问题。决定研究下源码，在答疑解惑之外，能深入学习其实现原理。

先将问题抛出来，使学习和研究更有针对性：

1\. 使用 Vuex 只需执行 `Vue.use(Vuex)`，并在 Vue 的配置中传入一个 store 对象的示例，store 是如何实现注入的？

2\. state 内部是如何实现支持模块配置和模块嵌套的？

3\. 在执行 dispatch 触发 action（commit 同理）的时候，只需传入（type, payload），action 执行函数中第一个参数 store 从哪里获取的？

4\. 如何区分 state 是外部直接修改，还是通过 mutation 方法修改的？

5\. 调试时的“时空穿梭”功能是如何实现的？

> 注：本文对有 Vuex 有实际使用经验的同学帮助更大，能更清晰理解 Vuex 的工作流程和原理，使用起来更得心应手。初次接触的同学，可以先参考 Vuex[官方文档](http://vuex.vuejs.org/) 进行基础概念的学习。

## 一、框架核心流程

进行源码分析之前，先了解一下官方文档中提供的核心思想图，它也代表着整个 Vuex 框架的运行流程。

![vuex-core](_attachment/img/e8e5ea21634c063d44546194d5125a41_MD5.png)

vuex-core

如图示，Vuex 为 Vue Components 建立起了一个完整的生态圈，包括开发中的 API 调用一环。围绕这个生态圈，简要介绍一下各模块在核心流程中的主要功能：

- Vue Components：Vue 组件。HTML 页面上，负责接收用户操作等交互行为，执行 dispatch 方法触发对应 action 进行回应。
- dispatch：操作行为触发方法，是唯一能执行 action 的方法。
- actions：操作行为处理模块。负责处理 Vue Components 接收到的所有交互行为。包含同步/异步操作，支持多个同名方法，按照注册的顺序依次触发。向后台 API 请求的操作就在这个模块中进行，包括触发其他 action 以及提交 mutation 的操作。该模块提供了 Promise 的封装，以支持 action 的链式触发。
- commit：状态改变提交操作方法。对 mutation 进行提交，是唯一能执行 mutation 的方法。
- mutations：状态改变操作方法。是 Vuex 修改 state 的唯一推荐方法，其他修改方式在严格模式下将会报错。该方法只能进行同步操作，且方法名只能全局唯一。操作之中会有一些 hook 暴露出来，以进行 state 的监控等。
- state：页面状态管理容器对象。集中存储 Vue components 中 data 对象的零散数据，全局唯一，以进行统一的状态管理。页面显示所需的数据从该对象中进行读取，利用 Vue 的细粒度数据响应机制来进行高效的状态更新。
- getters：state 对象读取方法。图中没有单独列出该模块，应该被包含在了 render 中，Vue Components 通过该方法读取全局 state 对象。

> Vue 组件接收交互行为，调用 dispatch 方法触发 action 相关处理，若页面状态需要改变，则调用 commit 方法提交 mutation 修改 state，通过 getters 获取到 state 新值，重新渲染 Vue Components，界面随之更新。

## 二、目录结构介绍

打开 Vuex 项目，看下源码目录结构。

![dir_structure](_attachment/img/9efe067778b202ff4c0cda16c19e6aea_MD5.jpg)

dir_structure

Vuex 提供了非常强大的状态管理功能，源码代码量却不多，目录结构划分也很清晰。先大体介绍下各个目录文件的功能： \* module：提供 module 对象与 module 对象树的创建功能； \* plugins：提供开发辅助插件，如“时光穿梭”功能，state 修改的日志记录功能等； \* helpers.js：提供 action、mutations 以及 getters 的查找 API； \* index.js：是源码主入口文件，提供 store 的各 module 构建安装； \* mixin.js：提供了 store 在 Vue 实例上的装载注入； \* util.js：提供了工具方法如 find、deepCopy、forEachValue 以及 assert 等方法。

## 三、初始化装载与注入

了解大概的目录及对应功能后，下面开始进行源码分析。[index.js](https://github.com/vuejs/vuex/blob/dev/src/index.js) 中包含了所有的核心代码，从该文件入手进行分析。

### 3.1 装载实例

先看个简单的例子：

```js
/**
 *  store.js文件
 *  创建store对象，配置state、action、mutation以及getter
 *
 **/

import Vue from 'vue'
import Vuex from 'vuex'

// install Vuex框架
Vue.use(Vuex)

// 创建并导出store对象。为了方便，不配置任何参数
export default new Vuex.Store()
```

store.js 文件中，加载 Vuex 框架，创建并导出一个空配置的 store 对象实例。

```js
/**
 *  vue-index.js文件
 *
 *
 **/

import Vue from 'vue'
import App from './../pages/app.vue'
import store from './store.js'

new Vue({
  el: '#root',
  router,
  store,
  render: h => h(App),
})
```

然后在 index.js 中，正常初始化一个页面根级别的 Vue 组件，传入这个自定义的 store 对象。

如**问题 1**所述，以上实例除了 Vue 的初始化代码，只是多了一个 store 对象的传入。一起看下源码中的实现方式。

### 3.2 装载分析

index.js 文件代码执行开头，定义局部 Vue 变量，用于判断是否已经装载和减少全局作用域查找。

```js
let Vue
```

然后判断若处于浏览器环境下且加载过 Vue，则执行 install 方法。

```js
// auto install in dist mode
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}
```

install 方法将 Vuex 装载到 Vue 对象上，`Vue.use(Vuex)` 也是通过它执行，先看下 Vue.use 方法实现：

```ts
function (plugin: Function | Object) {
  /* istanbul ignore if */
  if (plugin.installed) {
    return
  }
  // additional parameters
  const args = toArray(arguments, 1)
  args.unshift(this)
  if (typeof plugin.install === 'function') {
    // 实际执行插件的install方法
    plugin.install.apply(plugin, args)
  } else {
    plugin.apply(null, args)
  }
  plugin.installed = true
  return this
}
```

若是首次加载，将局部 Vue 变量赋值为全局的 Vue 对象，并执行 applyMixin 方法，install 实现如下：

```ts
function install(_Vue) {
  if (Vue) {
    console.error('[vuex] already installed. Vue.use(Vuex) should be called only once.')
    return
  }
  Vue = _Vue
  applyMixin(Vue)
}
```

来看下 applyMixin 方法内部代码。如果是 2.x.x 以上版本，可以使用 hook 的形式进行注入，或使用封装并替换 Vue 对象原型的\_init 方法，实现注入。

```js
export default function (Vue) {
  const version = Number(Vue.version.split('.')[0])

  if (version >= 2) {
    const usesInit = Vue.config._lifecycleHooks.indexOf('init') > -1
    Vue.mixin(usesInit ? { init: vuexInit } : { beforeCreate: vuexInit })
  } else {
    // override init and inject vuex init procedure
    // for 1.x backwards compatibility.
    const _init = Vue.prototype._init
    Vue.prototype._init = function (options = {}) {
      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit
      _init.call(this, options)
    }
  }
```

具体实现：将初始化 Vue 根组件时传入的 store 设置到 this 对象的 $store属性上，子组件从其父组件引用$store 属性，层层嵌套进行设置。在任意组件中执行 `this.$store` 都能找到装载的那个 store 对象，vuexInit 方法实现如下：

```js
function vuexInit() {
  const options = this.$options
  // store injection
  if (options.store) {
    this.$store = options.store
  } else if (options.parent && options.parent.$store) {
    this.$store = options.parent.$store
  }
}
```

看个图例理解下 store 的传递。

页面 Vue 结构图：

![cart_vue_structure](_attachment/img/88460e0f5bd73e7762ad34276f158013_MD5.jpg)

cart_vue_structure

对应 store 流向：

![cart_vue_structure](_attachment/img/c088c7ab718ccf981c40023563b662ae_MD5.jpg)

cart_vue_structure

## 四、store 对象构造

上面对 Vuex 框架的装载以及注入自定义 store 对象进行分析，解决了**问题 1**。接下来详细分析 store 对象的内部功能和具体实现，来解答 **为什么 actions、getters、mutations 中能从 arguments\[0\] 中拿到 store 的相关数据?** 等问题。

store 对象实现逻辑比较复杂，先看下构造方法的整体逻辑流程来帮助后面的理解：

![cart_vue_structure](_attachment/img/1d092563fbdd77754e469fe2ad4b7d36_MD5.jpg)

cart_vue_structure

### 4.1 环境判断

开始分析 store 的构造函数，分小节逐函数逐行的分析其功能。

```js
constructor (options = {}) {
  assert(Vue, `must call Vue.use(Vuex) before creating a store instance.`)
  assert(typeof Promise !== 'undefined', `vuex requires a Promise polyfill in this browser.`)
```

在 store 构造函数中执行环境判断，以下都是 Vuex 工作的必要条件：

1\. 已经执行安装函数进行装载；

2\. 支持 Promise 语法。

assert 函数是一个简单的断言函数的实现，一行代码即可实现。

```js
function assert(condition, msg) {
  if (!condition) throw new Error(`[vuex] ${msg}`)
}
```

### 4.2 数据初始化、module 树构造

环境判断后，根据 new 构造传入的 options 或默认值，初始化内部数据。

```js
const { state = {}, plugins = [], strict = false } = options

// store internal state
this._committing = false // 是否在进行提交状态标识
this._actions = Object.create(null) // acitons操作对象
this._mutations = Object.create(null) // mutations操作对象
this._wrappedGetters = Object.create(null) // 封装后的getters集合对象
this._modules = new ModuleCollection(options) // Vuex支持store分模块传入，存储分析后的modules
this._modulesNamespaceMap = Object.create(null) // 模块命名空间map
this._subscribers = [] // 订阅函数集合，Vuex提供了subscribe功能
this._watcherVM = new Vue() // Vue组件用于watch监视变化
```

调用 `new Vuex.store(options)` 时传入的 options 对象，用于构造 ModuleCollection 类，下面看看其功能。

```js
constructor (rawRootModule) {
  // register root module (Vuex.Store options)
  this.root = new Module(rawRootModule, false)

  // register all nested modules
  if (rawRootModule.modules) {
    forEachValue(rawRootModule.modules, (rawModule, key) => {
      this.register([key], rawModule, false)
    })
  }
```

ModuleCollection 主要将传入的 options 对象整个构造为一个 module 对象，并循环调用 `this.register([key], rawModule, false)` 为其中的 modules 属性进行模块注册，使其都成为 module 对象，最后 options 对象被构造成一个完整的组件树。ModuleCollection 类还提供了 modules 的更替功能，详细实现可以查看源文件 [module-collection.js](https://github.com/vuejs/vuex/blob/dev/src/module/module-collection.js)。

### 4.3 dispatch 与 commit 设置

继续回到 store 的构造函数代码。

```js
// bind commit and dispatch to self
const store = this
const { dispatch, commit } = this

this.dispatch = function boundDispatch(type, payload) {
  return dispatch.call(store, type, payload)
}

this.commit = function boundCommit(type, payload, options) {
  return commit.call(store, type, payload, options)
}
```

封装替换原型中的 dispatch 和 commit 方法，将 this 指向当前 store 对象。dispatch 和 commit 方法具体实现如下：

```js
dispatch (_type, _payload) {
  // check object-style dispatch
  const {
      type,
      payload
  } = unifyObjectStyle(_type, _payload) // 配置参数处理

  // 当前type下所有action处理函数集合
  const entry = this._actions[type]
  if (!entry) {
    console.error(`[vuex] unknown action type: ${type}`)
    return
  }
  return entry.length > 1
      ? Promise.all(entry.map(handler => handler(payload)))
      : entry[0](payload)
}
```

前面提到，dispatch 的功能是触发并传递一些参数（payload）给对应 type 的 action。因为其支持 2 种调用方法，所以在 dispatch 中，先进行参数的适配处理，然后判断 action type 是否存在，若存在就逐个执行（注：上面代码中的 `this._actions[type]` 以及 下面的 `this._mutations[type]` 均是处理过的函数集合，具体内容留到后面进行分析）。

commit 方法和 dispatch 相比虽然都是触发 type，但是对应的处理却相对复杂，代码如下。

```js
commit (_type, _payload, _options) {
  // check object-style commit
  const {
      type,
      payload,
      options
  } = unifyObjectStyle(_type, _payload, _options)

  const mutation = { type, payload }
  const entry = this._mutations[type]
  if (!entry) {
    console.error(`[vuex] unknown mutation type: ${type}`)
    return
  }
  // 专用修改state方法，其他修改state方法均是非法修改
  this._withCommit(() => {
    entry.forEach(function commitIterator (handler) {
      handler(payload)
    })
  })

  // 订阅者函数遍历执行，传入当前的mutation对象和当前的state
  this._subscribers.forEach(sub => sub(mutation, this.state))

  if (options && options.silent) {
    console.warn(
        `[vuex] mutation type: ${type}. Silent option has been removed. ` +
        'Use the filter functionality in the vue-devtools'
    )
  }
}
```

该方法同样支持 2 种调用方法。先进行参数适配，判断触发 mutation type，利用\_withCommit 方法执行本次批量触发 mutation 处理函数，并传入 payload 参数。执行完成后，通知所有\_subscribers（订阅函数）本次操作的 mutation 对象以及当前的 state 状态，如果传入了已经移除的 silent 选项则进行提示警告。

### 4.4 state 修改方法

\_withCommit 是一个代理方法，所有触发 mutation 的进行 state 修改的操作都经过它，由此来统一管理监控 state 状态的修改。实现代码如下。

```js
_withCommit (fn) {
  // 保存之前的提交状态
  const committing = this._committing

  // 进行本次提交，若不设置为true，直接修改state，strict模式下，Vuex将会产生非法修改state的警告
  this._committing = true

  // 执行state的修改操作
  fn()

  // 修改完成，还原本次修改之前的状态
  this._committing = committing
}
```

缓存执行时的 committing 状态将当前状态设置为 true 后进行本次提交操作，待操作完毕后，将 committing 状态还原为之前的状态。

### 4.5 module 安装

绑定 dispatch 和 commit 方法之后，进行严格模式的设置，以及模块的安装（installModule）。由于占用资源较多影响页面性能，严格模式建议只在开发模式开启，上线后需要关闭。

```js
// strict mode
this.strict = strict

// init root module.
// this also recursively registers all sub-modules
// and collects all module getters inside this._wrappedGetters
installModule(this, state, [], this._modules.root)
```

#### 4.5.1 初始化 rootState

上述代码的备注中，提到 installModule 方法初始化组件树根组件、注册所有子组件，并将其中所有的 getters 存储到 this.\_wrappedGetters 属性中，让我们看看其中的代码实现。

```js
function installModule (store, rootState, path, module, hot) {
  const isRoot = !path.length
  const namespace = store._modules.getNamespace(path)

  // register in namespace map
  if (namespace) {
    store._modulesNamespaceMap[namespace] = module
  }

  // 非根组件设置 state 方法
  if (!isRoot && !hot) {
    const parentState = getNestedState(rootState, path.slice(0, -1))
    const moduleName = path[path.length - 1]
    store._withCommit(() => {
      Vue.set(parentState, moduleName, module.state)
    })
  }

  ······
```

判断是否是根目录，以及是否设置了命名空间，若存在则在 namespace 中进行 module 的存储，在不是根组件且不是 hot 条件的情况下，通过 getNestedState 方法拿到该 module 父级的 state，拿到其所在的 moduleName ，调用 `Vue.set(parentState, moduleName, module.state)` 方法将其 state 设置到父级 state 对象的 moduleName 属性中，由此实现该模块的 state 注册（首次执行这里，因为是根目录注册，所以并不会执行该条件中的方法）。getNestedState 方法代码很简单，分析 path 拿到 state，如下。

```js
function getNestedState(state, path) {
  return path.length ? path.reduce((state, key) => state[key], state) : state
}
```

#### 4.5.2 module 上下文环境设置

```js
const local = (module.context = makeLocalContext(store, namespace, path))
```

命名空间和根目录条件判断完毕后，接下来定义 local 变量和 module.context 的值，执行 makeLocalContext 方法，为该 module 设置局部的 dispatch、commit 方法以及 getters 和 state（由于 namespace 的存在需要做兼容处理）。

#### 4.5.3 mutations、actions 以及 getters 注册

定义 local 环境后，循环注册我们在 options 中配置的 action 以及 mutation 等。逐个分析各注册函数之前，先看下模块间的逻辑关系流程图：

![complete_flow](_attachment/img/733eeac8c47c9730ee901cb313f53bba_MD5.jpg)

complete_flow

下面分析代码逻辑：

```js
// 注册对应模块的mutation，供state修改使用
module.forEachMutation((mutation, key) => {
  const namespacedType = namespace + key
  registerMutation(store, namespacedType, mutation, local)
})

// 注册对应模块的action，供数据操作、提交mutation等异步操作使用
module.forEachAction((action, key) => {
  const namespacedType = namespace + key
  registerAction(store, namespacedType, action, local)
})

// 注册对应模块的getters，供state读取使用
module.forEachGetter((getter, key) => {
  const namespacedType = namespace + key
  registerGetter(store, namespacedType, getter, local)
})
```

registerMutation 方法中，获取 store 中的对应 mutation type 的处理函数集合，将新的处理函数 push 进去。这里将我们设置在 mutations type 上对应的 handler 进行了封装，给原函数传入了 state。在执行 `commit('xxx', payload)` 的时候，type 为 xxx 的 mutation 的所有 handler 都会接收到 state 以及 payload，这就是在 handler 里面拿到 state 的原因。

```js
function registerMutation(store, type, handler, local) {
  // 取出对应type的mutations-handler集合
  const entry = store._mutations[type] || (store._mutations[type] = [])
  // commit实际调用的不是我们传入的handler，而是经过封装的
  entry.push(function wrappedMutationHandler(payload) {
    // 调用handler并将state传入
    handler(local.state, payload)
  })
}
```

action 和 getter 的注册也是同理的，看一下代码（注：前面提到的 `this.actions` 以及 `this.mutations` 在此处进行设置）。

```js
function registerAction(store, type, handler, local) {
  // 取出对应type的actions-handler集合
  const entry = store._actions[type] || (store._actions[type] = [])
  // 存储新的封装过的action-handler
  entry.push(function wrappedActionHandler(payload, cb) {
    // 传入 state 等对象供我们原action-handler使用
    let res = handler(
      {
        dispatch: local.dispatch,
        commit: local.commit,
        getters: local.getters,
        state: local.state,
        rootGetters: store.getters,
        rootState: store.state,
      },
      payload,
      cb
    )
    // action需要支持promise进行链式调用，这里进行兼容处理
    if (!isPromise(res)) {
      res = Promise.resolve(res)
    }
    if (store._devtoolHook) {
      return res.catch(err => {
        store._devtoolHook.emit('vuex:error', err)
        throw err
      })
    } else {
      return res
    }
  })
}

function registerGetter(store, type, rawGetter, local) {
  // getters只允许存在一个处理函数，若重复需要报错
  if (store._wrappedGetters[type]) {
    console.error(`[vuex] duplicate getter key: ${type}`)
    return
  }

  // 存储封装过的getters处理函数
  store._wrappedGetters[type] = function wrappedGetter(store) {
    // 为原getters传入对应状态
    return rawGetter(
      local.state, // local state
      local.getters, // local getters
      store.state, // root state
      store.getters // root getters
    )
  }
}
```

action handler 比 mutation handler 以及 getter wrapper 多拿到 dispatch 和 commit 操作方法，因此 action 可以进行 dispatch action 和 commit mutation 操作。

#### 4.5.4 子 module 安装

注册完了根组件的 actions、mutations 以及 getters 后，递归调用自身，为子组件注册其 state，actions、mutations 以及 getters 等。

```js
module.forEachChild((child, key) => {
  installModule(store, rootState, path.concat(key), child, hot)
})
```

#### 4.5.5 实例结合

前面介绍了 dispatch 和 commit 方法以及 actions 等的实现，下面结合一个官方的 [购物车](https://github.com/vuejs/vuex/tree/dev/examples/shopping-cart) 实例中的部分代码来加深理解。

Vuex 配置代码：

```js
/
 *  store-index.js store配置文件
 *
 /

import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import cart from './modules/cart'
import products from './modules/products'
import createLogger from '../../../src/plugins/logger'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  actions,
  getters,
  modules: {
    cart,
    products
  },
  strict: debug,
  plugins: debug ? [createLogger()] : []
})

```

Vuex 组件 module 中各模块 state 配置代码部分：

```js
/**
 *  cart.js
 *
 **/

const state = {
  added: [],
  checkoutStatus: null,
}

/**
 *  products.js
 *
 **/

const state = {
  all: [],
}
```

加载上述配置后，页面 state 结构如下图：

![cart_state](_attachment/img/2e0c0c2e06109feb3c66b87d931231e6_MD5.jpg)

cart_state

state 中的属性配置都是按照 option 配置中 module path 的规则来进行的，下面看 action 的操作实例。

Vuecart 组件代码部分：

```js
/**
 *  Cart.vue 省略template代码，只看script部分
 *
 **/

export default {
  methods: {
    // 购物车中的购买按钮，点击后会触发结算。源码中会调用 dispatch方法
    checkout(products) {
      this.$store.dispatch('checkout', products)
    },
  },
}
```

Vuexcart.js 组件 action 配置代码部分：

```js
const actions = {
  checkout({ commit, state }, products) {
    const savedCartItems = [...state.added] // 存储添加到购物车的商品
    commit(types.CHECKOUT_REQUEST) // 设置提交结算状态
    shop.buyProducts(
      // 提交api请求，并传入成功与失败的cb-func
      products,
      () => commit(types.CHECKOUT_SUCCESS), // 请求返回成功则设置提交成功状态
      () => commit(types.CHECKOUT_FAILURE, { savedCartItems }) // 请求返回失败则设置提交失败状态
    )
  },
}
```

Vue 组件中点击购买执行当前 module 的 dispatch 方法，传入 type 值为 ‘checkout’，payload 值为 ‘products’，在源码中 dispatch 方法在所有注册过的 actions 中查找’checkout’的对应执行数组，取出循环执行。执行的是被封装过的被命名为 wrappedActionHandler 的方法，真正传入的 checkout 的执行函数在 wrappedActionHandler 这个方法中被执行，源码如下（注：前面贴过，这里再看一次）：

```js
function wrappedActionHandler(payload, cb) {
  let res = handler(
    {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store.getters,
      rootState: store.state,
    },
    payload,
    cb
  )
  if (!isPromise(res)) {
    res = Promise.resolve(res)
  }
  if (store._devtoolHook) {
    return res.catch(err => {
      store._devtoolHook.emit('vuex:error', err)
      throw err
    })
  } else {
    return res
  }
}
```

handler 在这里就是传入的 checkout 函数，其执行需要的 commit 以及 state 就是在这里被传入，payload 也传入了，在实例中对应接收的参数名为 products。commit 的执行也是同理的，实例中 checkout 还进行了一次 commit 操作，提交一次 type 值为 types.CHECKOUT_REQUEST 的修改，因为 mutation 名字是唯一的，这里进行了常量形式的调用，防止命名重复，执行跟源码分析中一致，调用 `function wrappedMutationHandler (payload) { handler(local.state, payload) }` 封装函数来实际调用配置的 mutation 方法。

看到完源码分析和上面的小实例，应该能理解 dispatch action 和 commit mutation 的工作原理了。接着看源码，看看 getters 是如何实现 state 实时访问的。

### 4.6 store.\_vm 组件设置

执行完各 module 的 install 后，执行 resetStoreVM 方法，进行 store 组件的初始化。

```js
// initialize the store vm, which is responsible for the reactivity
// (also registers _wrappedGetters as computed properties)
resetStoreVM(this, state)
```

综合前面的分析可以了解到，Vuex 其实构建的就是一个名为 store 的 vm 组件，所有配置的 state、actions、mutations 以及 getters 都是其组件的属性，所有的操作都是对这个 vm 组件进行的。

一起看下 resetStoreVM 方法的内部实现。

```js
function resetStoreVM(store, state) {
  const oldVm = store._vm // 缓存前vm组件

  // bind store public getters
  store.getters = {}
  const wrappedGetters = store._wrappedGetters
  const computed = {}

  // 循环所有处理过的getters，并新建computed对象进行存储，通过Object.defineProperty方法为getters对象建立属性，使得我们通过this.$store.getters.xxxgetter能够访问到该getters
  forEachValue(wrappedGetters, (fn, key) => {
    // use computed to leverage its lazy-caching mechanism
    computed[key] = () => fn(store)
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true, // for local getters
    })
  })

  // use a Vue instance to store the state tree
  // suppress warnings just in case the user has added
  // some funky global mixins
  const silent = Vue.config.silent

  // 暂时将Vue设为静默模式，避免报出用户加载的某些插件触发的警告
  Vue.config.silent = true
  // 设置新的storeVm，将当前初始化的state以及getters作为computed属性（刚刚遍历生成的）
  store._vm = new Vue({
    data: { state },
    computed,
  })

  // 恢复Vue的模式
  Vue.config.silent = silent

  // enable strict mode for new vm
  if (store.strict) {
    // 该方法对state执行$watch以禁止从mutation外部修改state
    enableStrictMode(store)
  }

  // 若不是初始化过程执行的该方法，将旧的组件state设置为null，强制更新所有监听者(watchers)，待更新生效，DOM更新完成后，执行vm组件的destroy方法进行销毁，减少内存的占用
  if (oldVm) {
    // dispatch changes in all subscribed watchers
    // to force getter re-evaluation.
    store._withCommit(() => {
      oldVm.state = null
    })
    Vue.nextTick(() => oldVm.$destroy())
  }
}
```

resetStoreVm 方法创建了当前 store 实例的\_vm 组件，至此 store 就创建完毕了。上面代码涉及到了严格模式的判断，看一下严格模式如何实现的。

```js
function enableStrictMode(store) {
  store._vm.$watch(
    'state',
    () => {
      assert(
        store._committing,
        `Do not mutate vuex store state outside mutation handlers.`
      )
    },
    { deep: true, sync: true }
  )
}
```

很简单的应用，监视 state 的变化，如果没有通过 `this._withCommit()` 方法进行 state 修改，则报错。

### 4.7 plugin 注入

最后执行 plugin 的植入。

```js
plugins.concat(devtoolPlugin).forEach(plugin => plugin(this))
```

devtoolPlugin 提供的功能有 3 个：

```js
// 1. 触发Vuex组件初始化的hook
devtoolHook.emit('vuex:init', store)

// 2. 提供“时空穿梭”功能，即state操作的前进和倒退
devtoolHook.on('vuex:travel-to-state', targetState => {
  store.replaceState(targetState)
})

// 3. mutation被执行时，触发hook，并提供被触发的mutation函数和当前的state状态
store.subscribe((mutation, state) => {
  devtoolHook.emit('vuex:mutation', mutation, state)
})
```

源码分析到这里，Vuex 框架的实现原理基本都已经分析完毕。

## 五、总结

最后我们回过来看文章开始提出的 5 个问题。

1. **问**：_使用 Vuex 只需执行 `Vue.use(Vuex)`，并在 Vue 的配置中传入一个 store 对象的示例，store 是如何实现注入的？_

> **答**：`Vue.use(Vuex)` 方法执行的是 install 方法，它实现了 Vue 实例对象的 init 方法封装和注入，使传入的 store 对象被设置到 Vue 上下文环境的 $store中。因此在Vue Component任意地方都能够通过`this.$store`访问到该 store。

1. **问**：_state 内部支持模块配置和模块嵌套，如何实现的？_

> **答**：在 store 构造方法中有 makeLocalContext 方法，所有 module 都会有一个 local context，根据配置时的 path 进行匹配。所以执行如 `dispatch('submitOrder', payload)` 这类 action 时，默认的拿到都是 module 的 local state，如果要访问最外层或者是其他 module 的 state，只能从 rootState 按照 path 路径逐步进行访问。

1. **问**：_在执行 dispatch 触发 action(commit 同理) 的时候，只需传入 (type, payload)，action 执行函数中第一个参数 store 从哪里获取的？_

> **答**：store 初始化时，所有配置的 action 和 mutation 以及 getters 均被封装过。在执行如 `dispatch('submitOrder', payload)` 的时候，actions 中 type 为 submitOrder 的所有处理方法都是被封装后的，其第一个参数为当前的 store 对象，所以能够获取到 `{ dispatch, commit, state, rootState }` 等数据。

1. **问**：_Vuex 如何区分 state 是外部直接修改，还是通过 mutation 方法修改的？_

> **答**：Vuex 中修改 state 的唯一渠道就是执行 `commit('xx', payload)` 方法，其底层通过执行 `this._withCommit(fn)` 设置\_committing 标志变量为 true，然后才能修改 state，修改完毕还需要还原\_committing 变量。外部修改虽然能够直接修改 state，但是并没有修改\_committing 标志位，所以只要 watch 一下 state，state change 时判断是否\_committing 值为 true，即可判断修改的合法性。

1. **问**：_调试时的”时空穿梭”功能是如何实现的？_

> **答**：devtoolPlugin 中提供了此功能。因为 dev 模式下所有的 state change 都会被记录下来，’时空穿梭’ 功能其实就是将当前的 state 替换为记录中某个时刻的 state 状态，利用 `store.replaceState(targetState)` 方法将执行 `this._vm.state = state` 实现。

源码中还有一些工具函数类似 registerModule、unregisterModule、hotUpdate、watch 以及 subscribe 等，如有兴趣可以打开源码看看，这里不再细述。

## 参考

- <https://tech.meituan.com/2017/04/27/vuex-code-analysis.html>
