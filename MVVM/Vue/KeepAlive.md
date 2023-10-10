---
aliases: []
tags: ['MVVM/Vue', 'date/2023-10', 'year/2023', 'month/10']
date: 2023-10-09-星期一 17:11:27
update: 2023-10-10-星期二 19:16:46
---

## keep-alive 组件是什么？

`<keep-alive>` 是 `Vue` 的内置组件，用来包裹组件，达到缓存组件实例的作用～

`Vue` 官方文档中提到：

- `<keep-alive>` 是一个抽象组件：它自身不会渲染一个 `DOM` 元素，也不会出现在组件的父组件链中。
- 当组件在 `<keep-alive>` 内被切换，它的 `activated` 和 `deactivated` 这两个生命周期钩子函数将会被对应执行。

## keep-alive 组件原理

### 匹配和过滤

- `include` - 字符串或正则表达式。只有名称匹配的组件会被缓存。
- `exclude` - 字符串或正则表达式。任何名称匹配的组件都不会被缓存。

![](_attachment/img/0993309ad9c817174e7c277e28c7ef23_MD5.png)

#### 初始化

- `created` 阶段会初始化两个变量，分别为 `cache` 和 `keys`。
- `mounted` 阶段会对 `include` 和 `exclude` 变量的值做监测。

```js
created () {
    this.cache = Object.create(null)
    this.keys = []
},
mounted () {
    this.$watch('include', val => {
        pruneCache(this, name => matches(val, name))
    })
    this.$watch('exclude', val => {
        pruneCache(this, name => !matches(val, name))
    })
}
```

可以看到，如果 `include` 或者 `exclude` 的值发生变化，就会触发 `pruneCache` 函数，不过筛选的条件需要根据 `matches` 函数的返回值来决定，所以我们先来看看它 👇。

#### 过滤条件

```ts
function matches(pattern: string | RegExp | Array<string>, name: string): boolean {
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1
  } else if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
  } else if (isRegExp(pattern)) {
    return pattern.test(name)
  }
  /* istanbul ignore next */
  return false
}
```

可以看到，`pattern` 可以有三种取值，分别为：

- `string`
- `RegExp`
- `Array<string>`

之后判断 `name` 是不是在 `pattern` 指定的值/范围内，最后再根据结果返回 `true` 或者 `false` 。

#### 缓存剔除

无论是 `include` 还是 `exclude`，他们的值都不是一成不变的，每当过滤条件改变，都需要从已有的缓存中「剔除」不符合条件的 `key`。

```ts
function pruneCache(keepAliveInstance: any, filter: Function) {
  const { cache, keys, _vnode } = keepAliveInstance
  for (const key in cache) {
    const cachedNode: ?VNode = cache[key]
    if (cachedNode) {
      const name: ?string = getComponentName(cachedNode.componentOptions)
      if (name && !filter(name)) {
        pruneCacheEntry(cache, key, keys, _vnode)
      }
    }
  }
}
```

可以看到这里又调用了 `pruneCacheEntry` 来「剔除」不符合缓存条件的 `key`👇

```ts
function pruneCacheEntry(
  cache: VNodeCache,
  key: string,
  keys: Array<string>,
  current?: VNode
) {
  const cached = cache[key]
  if (cached && (!current || cached.tag !== current.tag)) {
    cached.componentInstance.$destroy()
  }
  cache[key] = null
  remove(keys, key)
}
```

这里有个细节：

```js
// 如果当前的 vnode 为空，或者 cached 和 current 不是同一个节点
// 就把调用 $destroy 把 cached 销毁
if (cached && (!current || cached.tag !== current.tag)) {
  cached.componentInstance.$destroy()
}
```

#### 渲染时剔除

上面我们讨论的是过滤条件的变化情况，如果没变化呢？ 其实 `<keep-alive>` 组件也会在每次渲染的时候都过滤一次组件，保证缓存的组件都已经通过过滤条件 👇

```js
render () {
    ...
    if (
        // not included
        (include && (!name || !matches(include, name))) ||
        // excluded
        (exclude && name && matches(exclude, name))
      ) {
        return vnode
      }
    ...
}
```

### 缓存淘汰策略

除了上面说到的两个参数，`<keep-alive>` 组件还能传一个参数：`max`

![](_attachment/img/e3d22fae5d078d18e08f7917c6ef6283_MD5.png)

文档中提到一个实例销毁规则：缓存最近访问的实例，销毁缓存中最久没有被访问的实例。其实这是一种缓存淘汰策略 —— LRU 算法。

**更加详细的规则：**

- 在缓存上限达到之前，不考虑销毁实例
- 对于最新访问的数据，淘汰的优先级是最低的
- 对于最不常访问的数据，淘汰的优先级是最高的

这意味着我们需要两种数据结构来表达这个算法，其中一种数据结构来存储缓存，另外一种用来存储并表示缓存访问的新旧程度。

#### Vue 2.x 与 Vue 3.x 中实现的异同

Vue 2.x 用 `cache` 来存储缓存，用 `keys` 来存储缓存中访问的新旧程度，其中 `cache` 为对象，`keys` 为数组。

```ts
const { cache, keys } = this
const key: ?string =
  vnode.key == null
    ? // same constructor may get registered as different local components
      // so cid alone is not enough (#3269)
      componentOptions.Ctor.cid +
      (componentOptions.tag ? `::${componentOptions.tag}` : '')
    : vnode.key
if (cache[key]) {
  vnode.componentInstance = cache[key].componentInstance
  // make current key freshest
  remove(keys, key)
  keys.push(key)
} else {
  cache[key] = vnode
  keys.push(key)
  // prune oldest entry
  if (this.max && keys.length > parseInt(this.max)) {
    pruneCacheEntry(cache, keys[0], keys, this._vnode)
  }
}
```

然而， Vue 3.0 里中采用的依然是 LRU 算法，不过用到的 `cache` 和 `keys` 的作用跟 2.0 没有区别，但是数据结构却变了，其中：

- `cache` 是用 `Map` 创建的
- `keys` 使用 `Set` 创建的

```ts
const key = vnode.key == null ? comp : vnode.key
const cachedVNode = cache.get(key)

// clone vnode if it's reused because we are going to mutate it
if (vnode.el) {
  vnode = cloneVNode(vnode)
}
cache.set(key, vnode)

if (cachedVNode) {
  // copy over mounted state
  vnode.el = cachedVNode.el
  vnode.component = cachedVNode.component
  if (vnode.transition) {
    // recursively update transition hooks on subTree
    setTransitionHooks(vnode, vnode.transition!)
  }
  // avoid vnode being mounted as fresh
  vnode.shapeFlag |= ShapeFlags.COMPONENT_KEPT_ALIVE
  // make this key the freshest
  keys.delete(key)
  keys.add(key)
} else {
  keys.add(key)
  // prune oldest entry
  if (max && keys.size > parseInt(max as string, 10)) {
    pruneCacheEntry(keys.values().next().value)
  }
}
```

显然，在时间复杂度上 Vue 3.x 要更优，因为 `Set` 删除某个 `key` 只需要 ${O(1)}$ 的时间复杂度，而数组删除某个 `key` 却要耗费 ${O(n)}$ 时间复杂度。

## 扩展 —— 常见的 LRU 算法实现

LRU 算法在实现逻辑的同时，需要满足以下两点：

1. 删除、添加缓存的时间复杂度为 ${O(1)}$
2. 查找缓存的时间复杂度为 ${O(1)}$

其中双向循环链表可以满足条件 1，哈希表可以满足条件 2。基于此我们可以用哈希表 + 双向循环链表相结合的写法来实现 LRU 算法。以下是实现的代码，基于 LeetCode 上的一道题目：[LRU 缓存机制](https://leetcode-cn.com/problems/lru-cache/)，感兴趣的同学不妨看完之后在上面写写看。

## 哈希表 + 双向循环链表 实现 LRU 算法

```js
/**
 * @param {number} capacity
 */
const LRUCache = function (capacity) {
  this.map = new Map()
  this.doubleLinkList = new DoubleLinkList()
  this.maxCapacity = capacity
  this.currCapacity = 0
}

/**
 * @param {number} val
 * @param {string} key
 */
const Node = function (val, key) {
  this.val = val
  this.key = key
  this.next = null
  this.prev = null
}

const DoubleLinkList = function () {
  this.head = null
  this.tail = null
}

/**
 * @param {Node} node
 * 添加节点
 */
DoubleLinkList.prototype.addNode = function (node) {
  if (!this.head) {
    this.head = node
    this.tail = node
    this.head.next = this.tail
    this.head.prev = this.tail
    this.tail.next = this.head
    this.tail.prev = this.head
  } else {
    const next = this.head
    this.head = node
    this.head.next = next
    this.head.prev = this.tail
    this.tail.next = this.head
    next.prev = this.head
  }
}

/**
 * @param {Node} node
 * @return {void}
 * 删除双向链表中的节点
 */
DoubleLinkList.prototype.deleteNode = function (node) {
  const prev = node.prev
  const next = node.next
  prev.next = next
  next.prev = prev
  // 对头尾节点做特殊判断
  if (this.head === node) {
    this.head = next
  }
  if (this.tail === node) {
    this.tail = prev
  }
}

/**
 * @param {number} key
 * @return {number}
 */
LRUCache.prototype.get = function (key) {
  const { map, doubleLinkList } = this
  // 访问一个 key  的同时，先将它删除，然后再将它置于双向链表的顶部
  if (map.has(key)) {
    const node = map.get(key)
    doubleLinkList.deleteNode(node)
    doubleLinkList.addNode(node)
    return node.val
  }
  return -1
}

/**
 * @param {number} key
 * @param {number} value
 * @return {void}
 */
LRUCache.prototype.put = function (key, value) {
  const { map, doubleLinkList } = this
  // 如果已经存在这个 key 了
  // 那么只要改 key 对应的值
  // 然后将 key 对应的节点放到双向链表的头部即可
  if (map.has(key)) {
    // 先在 map 中找到他
    const node = map.get(key)
    // 然后将它删掉
    doubleLinkList.deleteNode(node)
    // 改掉值
    node.val = value
    // 之后加入到链表头部
    doubleLinkList.addNode(node)
    map.set(key, node)
  } else {
    const node = new Node(value, key)
    // 如果之前没有这个 key 且缓存已满
    if (this.currCapacity === this.maxCapacity) {
      // 先将尾巴节点删除
      map.delete(doubleLinkList.tail.key)
      doubleLinkList.deleteNode(doubleLinkList.tail)
      // 然后将新的 key 加入链表和 map
      doubleLinkList.addNode(node)
      map.set(key, node)
    } else {
      // 反之缓存没有满
      // 直接新的 key 加入链表和 map 即可
      doubleLinkList.addNode(node)
      map.set(key, node)
      // 缓存容量自增
      this.currCapacity++
    }
  }
}
```

## 参考资料

- [文档：keep-alive](https://cn.vuejs.org/guide/built-ins/keep-alive.html)
- [Vue 2.x 源码](https://github.com/vuejs/vue/blob/dev/src/core/components/keep-alive.js)
- [Vue 3.x 源码](https://github.com/vuejs/vue-next/blob/master/packages/runtime-core/src/components/KeepAlive.ts)
