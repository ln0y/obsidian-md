---
aliases: []
tags: ['MVVM/Vue', 'date/2023-10', 'year/2023', 'month/10']
date: 2023-10-16-星期一 15:55:31
update: 2023-10-16-星期一 15:58:46
---

## 前置知识

1. 了解 vue3 中采取了 `vnode`
2. 知道 `vnode` 不过就是一个 `js对象`
3. 知道 `vnode` 中有个 `children` 属性，它要么是字符串类型，要么是数组类型

知道了这些后，那么可以开始了，记住，在 `vue` 中的 `diff` 其实就是对比两个数组之间的差异并对差异进行相对正确高效的处理

## 要做什么

现在开始不要想什么 `diff` 啥的，就想着，你有两个数组，需要判断里面元素的差异，换做自己应该怎么做

想象一下，两数组对比，我们会发现以下几件事：

右端长

![image.png](_attachment/img/7f6501a11afdc0b623e0b69053bc92f9_MD5.png)

左端长

![image.png](_attachment/img/2144f534e0470b7f0087e6c7ad46d02b_MD5.png)

- 当旧的数组比新的长的时候

右端短

![image.png](_attachment/img/f10f9132b39bfd0f18ddab45d0fae336_MD5.png)

左端短

![image.png](_attachment/img/6c05a3b899155aa63c542bd413358523_MD5.png)

- 当新老长度相等，但是有一串差异区域时

![image.png](_attachment/img/e6cf564518ae570108d05bd7fd249690_MD5.png)

分析完情况后，我们来一一实现

## 左端对比

首先实现左端对比查找到第一个不同的节点

- 声明一个变量 i = 0
- 每次自增 1，直到找到一个不同节点，跳出循环，循环条件应该同时满足 `<=` 新 (c2)，旧 (c1) 的的最后一个元素的下标分别就是 `i <= c1.length - 1 && i <= c2.length - 1`
- 每次对比 `c1[i] === c2[i]`，相同就直接通过，不同那就跳出循环，然后 i 就相当于固定到了，从左往右的第一个不同点的位置

将这段逻辑带入到第一个图例中，就得到了

![image.png](_attachment/img/2790e5e148a96f623d1059009c130386_MD5.png)

理解这个情况后，再继续往下

## 右端对比

这个地方抽象理解，其实和左端对比是一样的，但是细致看的话，有差异

1. 数组的顺序都是从左到右，且两数组不一定相等，所以需要创建两个变量来模拟自身不同的 i
2. 两数组元素的对比顺序是从右往左
3. 其他操作和左端一样 理解这段逻辑，然后带入第二个图例可以知道

![image.png](_attachment/img/97c50b88755931e9e04f9267e76a0445_MD5.png)

## 结合左端和右端

比如：\[A,B,C,D,E,F\] 与 \[A,B,D,C,E,F\] 进行对比时，过程是怎么样的

1. 进入左端对比循环，i 被固定到下标为 2 处，退出循环
2. 进入右端对比循环，e1, e2 固定到了下标为 3 处，退出循环

![image.png](_attachment/img/13cb9d3c66ada41bfc1b8b9891202967_MD5.png)

具体代码：

```ts
function diff(c1: VNode[], c2: VNode[]) {
  let e1 = c1.length - 1
  let e2 = c2.length - 1
  let i = 0
  // left
  while (i <= e1 && i <= e2) {
    let n1 = c1[i]
    let n2 = c2[i]
    if (isSomeVNodeType(n1, n2)) {
      // 没有改变的元素直接生成到页面
    } else {
      break
    }
    i++
  }

  // right
  while (i <= e1 && i <= e2) {
    let n1 = c1[e1]
    let n2 = c2[e2]
    if (isSomeVNodeType(n1, n2)) {
      // 没改变的元素直接生成到页面
    } else {
      break
    }
    e1--
    e2--
  }
}

// VNode 是对象，通过两个属性值判断是否相同
function isSomeVNodeType(n1: VNode, n2: VNode) {
  return n1.type === n2.type && n1.key === n2.key
}
```

这样就完美的将对应位置下的相同元素和不同元素剥离了，这个时候就只会剩下相同位置上不同的元素了（大区间上的不同，区间里面有相同的，先不用管）

## 新的比老的长

通过双端对比后，可以知道，新的旧的的差异一定都在这个区间内，所以新的比老的长，也一定在这个区间里，这个时候就要考虑，满足这个区间的条件

1. 新的比老的长，说明 i 一定是大于 e1 的，而且小于 e2
2. 满足这个条件的时候就是新比旧长的时候

逻辑带入图 3 和图 4

右长
![image.png](_attachment/img/3d1863b1f6ddfd8dbc4b40dde89401af_MD5.png)

左长
![image.png](_attachment/img/ff6f54da8032c7433ea89456bafb3b23_MD5.png)

所以可以看出，我们想处理这个情况下的所有差异节点，条件就是 `i > e1 && i <= e2`，满足这个条件，然后进行循环，处理 `i 到 e2` 这个区间的所有节点

具体代码：

```js
if (i > e1 && i <= e2) {
  while (i <= e2) {
    // 新增 c2[i] 元素
    i++
  }
}
```

## 老的比新的长

当老的比新的长的时候，逻辑操作和新的类似，只不过一个是新建节点，一个是删除节点

1. 当新的里面没有某节点时，那就是需要删除该节点
2. 当老的比新的长的时候，满足条件 `i <= e1 && i > e2`

将逻辑带入图 5 图 6

右短

![image.png](_attachment/img/f0da6af253ea83d255bf3cf93234b121_MD5.png)

左短

![image.png](_attachment/img/881b0abfcc55de2de6f99eb92a28a848_MD5.png)

所以可以看出，想要处理这个条件下的所有差异节点，需要满足 `i > e2 && i <= e1`，循环处理 `i 到 e1` 之间的节点

具体代码：

```js
if (i <= e1 && i > e2) {
  // cab -> ab
  while (i <= e1) {
    // 删除 c1[i] 元素
    i++
  }
}
```

## 结合不同长度的两种情况

将两个逻辑代码重构并放在一起时

```js
if (i > e1) {
  if (i <= e2) {
    const nextPos = e2 + 1
    const anchor = nextPos >= l2 ? null : c2[nextPos].el
    while (i <= e2) {
      // 增加
      i++
    }
  }
} else if (i > e2) {
  while (i <= e1) {
    // 删除
    i++
  }
}
```

## 新老长度一样，但是有所不同

最后一种特殊情况就是，两者长度一样，但是中间有块差异区间，对差异区间进行分析

1. 当节点新旧都存在，但是位置不同，这样的节点需要做移动
2. 当节点在旧不在新，需要删除
3. 当节点在新不在旧，需要创建并插入

逻辑结合最后的图例

![image.png](_attachment/img/084170d4a5447baecb100f7748dbb63b_MD5.png)

处理方式：

1. 循环新数组，生成一个新数组节点的映射表
2. 循环旧数组的每个节点，查找到不在新数组中存在的节点，进行删除
3. 建立一个需要移动的元素的对应数组位置，长度为 `(e2 - e1 + 1)`，因为 `e1, e2` 都是表示下标，所以要 +1
4. 记录移动元素的数组，就比如对应新数组里的差异区间，\[C, B, E\]，对应成了数组里的 0，1，2 下标，然后下标对应的位置的值则是，对应元素在旧数组中的下表值，也就是记录位置

说的有点抽象，用图来理解吧

![image.png](_attachment/img/7371c979480d43c0af52df748785943f_MD5.png)

这样对应着看，具体代码实现

```js
// 建立新节点对应的映射表
const s1 = i
const s2 = i

const keyToNewIndexMap = new Map()
for (let i = s2; i <= e2; i++) {
  const newChild = c2[i]
  keyToNewIndexMap.set(newChild.key, i)
}
```

```js
// 建立新节点对应在旧节点中的位置，注意：此处初始化是给的0，所以0变成了有意义的，所以都+1了，和图上的数组表示是一致的
const newIndexToOldIndexMap = new Array(toBePatched)
for (let i = 0; i < toBePatched; i++) {
  newIndexToOldIndexMap[i] = 0
}
```

```js
let newIndex: null | number = null
let patched = 0
const toBePatched = e2 - s2 + 1
let moved = false
let maxNewIndex = 0

for (let i = s1; i <= e1; i++) {
  const preChild = c1[i]

  if (patched >= toBePatched) {
    hostRemove(preChild.el)
    continue
  }
  if (preChild.key) {
    newIndex = keyToNewIndexMap.get(preChild.key)
  } else {
    for (let j = s2; j <= e2; j++) {
      if (isSomeVNodeType(preChild, c2[j])) {
        newIndex = j
      }
    }
  }
  if (!newIndex) {
    // 删除节点 preChild
  } else {
    if (newIndex >= maxNewIndex) {
      maxNewIndex = newIndex
    } else {
      moved = true
    }
    // 处理差异节点
    patched++
  }
}
```

目前为止，生成新节点还没有实现，此时需要考虑一个问题就是，当邻居两个都没有改变的时候，不可能把他们分开处理吧，肯定是相当于一个整体，所以在查询新差异区间节点对应在旧区间节点的位置时（`newIndexToOldIndexMap`），如果是从小变大的值，那就是正常的左右，如果不是这样，就说明这个是其他位置的节点，所以我们需要在这个数组 `newIndexToOldIndexMap` 中查找到最长的连续的字串，循环区间，通过去对应在 `newIndexToOldIndexMap` 里面的值，如果为初始值，就说明新的里面存在这个节点，但是没有在旧的里面找到，所以进行创建，如果当前循环到的位置和取得值不同，那就说明需要移动

具体代码

```js
// 返回最长连续子串
const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap) || []
let sequenceIndex = increasingNewIndexSequence.length - 1
for (let j = toBePatched - 1; j >= 0; j--) {
  if (newIndexToOldIndexMap[j] === 0) {
    // 说明旧无，新有的节点
    // 新增节点
  } else if (moved) {
    // increasingNewIndexSequence 存储的是最长连续字串的下标，
    // 所以当 j 和 increasingNewIndexSequence对应位置（比如j是最后一个元素，那么对比的increasing...里面也是最后一个元素）的值相同时，
    // 就说明存在节点
    if (sequenceIndex < 0 || j !== increasingNewIndexSequence[sequenceIndex]) {
      // 有值且不相等的时候，就是需要移动了
      // 插入节点
    } else {
      // 相同的时候说明，位置和元素都是没问题的，不用处理，继续下一个
      sequenceIndex--
    }
  }
}
```

## 总结

1. 双端对比是为了确定两数组间的差异节点
2. key 对比是为了确定两个节点间是否是同一节点
3. 处理差异区间里的所有节点时只有三个操作，新增，插入，删除
4. 最后对需要移动的元素处理有点复杂，首先利用了 `Map` 构建映射表，来判断某节点在新旧中的关系，是新有还是旧有
5. 通过使用数据存储对应位置，对应节点在旧数组中存在的位置
