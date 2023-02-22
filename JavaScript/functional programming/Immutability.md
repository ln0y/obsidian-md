---
aliases: []
tags: ['JavaScript/functional_programming', 'date/2023-02', 'year/2023', 'month/02']
date: 2023-02-21-星期二 19:25:39
update: 2023-02-21-星期二 19:56:39
---

## 拷贝不是万能解药

用拷贝代替修改，是确保引用类型数据不可变性的一剂良药。

然而，拷贝并非一个万能的解法。拷贝意味着重复，而重复往往伴随着着冗余。

试想，如果某一个函数的入参是一个极为庞大的对象，比如说——某一个 PC Admin 在启动时拉取的 `MetaData` （应用元信息）可能多达数千个字段。

我们就假设总的字段数有 1000 个，一般来说，常规的状态变更也就只会调整其中一两个字段。

如果我们为此拷贝整个 MetaData，那么每次变更冗余的字段量就高达九百多条，**数据冗余率接近百分之百**。

又或者，我们面对的是一个状态变更相当密集的应用，比如说——某一个营销活动的 H5 小游戏。

用户看似不经意地在游戏页面上划拉几下子，背后可能伴随着几十上百个状态的变化，而这些变化往往需要在极为短暂的时间里完成、并且触发相应的渲染反馈。

这种情况下，数据的 **拷贝行为是非常高频的，** 每次拷贝都会多多少少伴随一些冗余数据。

**当数据规模大、数据拷贝行为频繁时，拷贝将会给我们的应用性能带来巨大的挑战。**

拷贝出来的冗余数据将盘踞大量的内存，挤占其它任务的生存 **空间**；此外，拷贝行为本身也是需要吃 CPU 的，持续而频繁的拷贝动作，无疑将拖慢应用程序的反应 **速度**。

因此，对于 **状态简单、逻辑轻量** 的应用来说，拷贝确实是一剂维持数据不可变性的良药。

但是对于 **数据规模巨大、数据变化频繁** 的应用来说，拷贝意味着一场性能灾难。

有没有什么办法，能够既保住拷贝的效果，又避开拷贝的弊端呢?

当然有啦！

我们接下来就将会从持久化数据结构开始，探讨“安全帽”的进阶玩法。

## 回顾 Immutable.js

首先我想要和大家讨论的，是“[immutable.js](https://immutable-js.com/)”这个东西。

我想许多同学、尤其是 React 开发者对它应该不会感到陌生。

Immutable 直译过来是“不可变的”，正如上文所说，ImmutableJS 是对“不可变值”这一思想的贯彻实践。它在 2014 年被 Facebook 团队推出，Facebook 给它的定位是“实现持久化数据结构的库”。

Immutable.js !== 持久化数据结构，但 Immutable.js 毫无疑问是持久化数据结构在前端领域影响最深远的一次实践。

对于许多人来说，正是 Immutable.js 带他们走入了函数式编程的世界。

还记得 2016 年前后，我圈最流行的事情似乎就是为各种 React 应用引入 Immutable.js，因为 React 不喜欢可变数据，而 Immutable.js 恰好实现了不可变数据。

具体如何做到的呢？我这里用 Immutable.js 写了一个 demo，大家可以简单感受一下：

```js
// 引入 immutable 库里的 Map 对象，它用于创建对象
import { Map } from 'immutable'

// 初始化一个对象 baseMap
const originData = Map({
  name: 'xiuyan',
  hobby: 'coding',
  age: 666,
})

// 使用 immutable 暴露的 Api 来修改 baseMap 的内容
const mutatedData = originData.set({
  age: 66.6,
})

// 我们会发现修改 baseMap 后将会返回一个新的对象，这个对象的引用和 baseMap 是不同的
console.log('originData === mutatedData', originData === mutatedData)
```

Immutable.js 提供了一系列的 Api，这些 Api 将帮助我们确保数据的不可变性。

从代码上来看，它省掉了我们手动拷贝的麻烦。

从效率上来说，它在底层应用了持久化数据结构，解决了暴力拷贝带来的各种问题。

那么持久化数据结构到底是何方神圣，它又凭什么能解决暴力拷贝带来的问题呢？

其实，我们在日常工作中，经常接触一个和它很像的东西，那就是 git commit。

## 应对变化的艺术——Git “快照”是如何工作的

想必大家多少都听说过，在创建 commit 时，git 会对整个项目的所有文件做一个“快照”。

但“快照”究竟是什么？

一些同学认为，所谓“快照”仅仅是对当前所有文件的一次拷贝而已。

这显然是经不起推敲的——若是每次 commit 都为当前文件创建一次完整的拷贝，那么纵使电脑有再大的存储空间，也顶不住咱维护一个 monorepo 呀。

事实上，“快照”记录的并不是文件的内容，而是文件的索引。

当 commit 发生时， git 会保存当前版本所有文件的索引。

对于那些没有发生变化的文件，git 保存他们原有的索引；对于那些已经发生变化的文件，git 会保存变化后的文件的索引。

假设一个项目中有 A、B 两个文件，其中 A 文件被修改了，而 B 文件保持不变。

我们将修改后的新的 A 文件的索引记为 A'（如下图）。

![[_attachment/img/bfd403859ba453a8f6f24621803ac29e_MD5.png]]

在变化发生后，A 和 A' 是共存的，变化前的那一次快照指向 A，变化后的这一次快照指向 A'。

而未被修改到的 B 文件，将会原封不动地呆在原地，被新版本的快照所复用，如下图所示：

![[_attachment/img/5fc7ed660dab44c52386eabbeaaaf476_MD5.png]]

也就是说，git 记录“变更”的粒度是文件级别的。

它会同时保有新老两份文件，不同的 version，指向不同的文件。

这里我们简单总结一下：

**快照的本质是对索引的记录。**

在生成快照的过程中，对于那些没有发生变化的文件，git 会沿用他们固有的索引。

对于那些已经发生变化的文件，变化前、变化后实际上对应着内存里的两个文件，也就相应地有新、老两个不同的索引，本次快照将会记录那个新文件对应的索引。

如果我们尝试给快照进行编号和记录，那么我们就能够通过这些编号定位到任何一个快照，也就可以定位到任何一个版本的项目文件全集。

我们之所以可以通过切换 git commit 来查看不同版本的文件，也正是因为 commit 中记录了快照的信息。

讲 git 讲到现在，只希望大家能记住一个核心的思想：

**Git 快照保存文件索引，而不会保存文件本身。**

**变化的文件将拥有新的存储空间 + 新的索引，不变的文件将永远呆在原地。**

这是 git 应对变化的艺术，也是持久化数据结构的核心思想。

## 理解“数据共享”：从“快照”到“安全帽”

和 git “快照”一样，持久化数据结构的精髓同样在于“**数据共享**”。

数据共享意味着将“变与不变”分离，确保只有变化的部分被处理，而不变的部分则将继续留在原地、被新的数据结构所复用。

不同的是，在 git 世界里，这个“变与不变”的区分是文件级别的；而在 Immutable.js 的世界里，这个“变与不变”可以细化到数组的某一个元素、对象的某一个字段。

举个例子：

假如我借助 Immutable.js 基于 A 对象创建出了 B 对象。

A 对象有 4 个字段：

```js
const dataA = Map({
  do: 'coding',
  age: 666,
  from: 'a',
  to: 'b',
})
```

B 对象在 A 对象的基础上修改了其中的某一个字段 (age)：

```js
// 使用 immutable 暴露的 Api 来修改 baseMap 的内容
const dataB = dataA.set({
  age: 66.6,
})
```

那么 Immutable.js 仅仅会创建变化的那部分（也就是创建一个新的 age 给 B)，并且为 B 对象生成一套指回 A 对象的指针，从而复用 A 对象中不变的那 3 个字段。

就像这样：

![[_attachment/img/31e8e8ac384fbc4bc7a0efdad8bf4b39_MD5.png]]

看上去很棒对不对？

那么 Immutable.js 是如何做到这一点的呢？

## 如何实现数据共享

为了达到这种“数据共享”的效果，持久化数据结构在底层依赖了一种经典的基础数据结构，那就是 [Trie(字典树）](https://zh.wikipedia.org/zh-hans/Trie)。

在 Trie 的加持下，我们存储一个对象的姿势可以是这样的：

![[_attachment/img/b9d668601e982fc678f05a36ac346870_MD5.png]]

当我们创建对象 B 的时候，我们可以只针对发生变化的 age 字段创建一条新的数据，并将对象 B 剩余的指针指回 A 去，，如下图：

![[_attachment/img/588c6bf8351a2df2b36f4506d9547d57_MD5.png]]

在图示中，B 显然已经区别于 A，是一个新的对象、具备一个新的索引。B 通过和 A 共享不变的那部分数据，成功地提升了管理数据的效率。

## 关于 Immutablility（不可变性） 的刻板印象

在许多团队的函数式编程题库里，“数据不可变性如何在前端业务中落地”都是一道高频考题。

遗憾的是，这道题目的答案多年来也几乎是“固定”的，八成左右的候选人的答案都有且仅有一个——Immutable.js/持久化数据结构。

如果是在 2016 年，这个答案确实足以成为问题的终点。

但在今天，很多时候面试官们会忍不住追问：Immutable.js/持久化数据结构是唯一的答案吗？

不少同学仍然会回答“是”，尽管这个“是”里夹带了那么些许的不确定，但它足以反映社区对 Immutability 的刻板印象。

这一节我希望大家学到的东西，就是如何对这个问题说“不”。

Immutable.js 对于前端函数式编程来说，有划时代的意义。许多同学正是通过它才了解到“不可变数据”、“持久化数据结构”等概念。

但它终究也只是实现 Immutability 的一种途径。在活跃的函数式社区中，优秀的 Immutability 实践还有很多——比如，Immer.js。

## Immer.js，一个傻瓜式的 Immutability 解决方案

[Immer.js](https://immerjs.github.io/immer/) 不需要操心深拷贝浅拷贝的事儿，更不需要背诵记忆 Immutable.js 定义的一大堆 API，你所需要做的，仅仅是在项目里轻轻地 Import 一个 produce（请看下文代码，解析在注释里）：

```js
import produce from 'immer'

// 这是我的源数据
const baseState = [
  {
    name: '修言',
    age: 99,
  },
  {
    name: '秀妍',
    age: 100,
  },
]

// 定义数据的写逻辑
const recipe = draft => {
  draft.push({ name: 'xiuyan', age: 101 })
  draft[1].age = 102
}

// 借助 produce，执行数据的写逻辑
const nextState = produce(baseState, recipe)
```

这个 API 里有几个要素：

- (base)state：源数据，是我们想要修改的目标数据
- recipe：一个函数，我们可以在其中描述数据的写逻辑
- draft：recipe 函数的默认入参，它是对源数据的代理，我们可以把想要应用在源数据的变更应用在 draft 上
- produce：入口函数，它负责把上述要素串起来。具体逻辑请看下文分解。

记住上述要素的基本特性，我们接下来要冲一波源码了 xdm！

## Immer.js 是如何工作的

Immer.js 实现 Immutability 的姿势非常有趣——它使用 Proxy，对目标对象的行为进行“元编程”。

### 回顾 Proxy

Proxy 是 ES6 中引入的一个概念。

> Proxy 对象用于创建一个对象的代理，从而实现基本操作的拦截和自定义（如属性查找、赋值、枚举、函数调用等）。 ——[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

Proxy 是 JS 语言中少有的“元编程”工具。

所谓“元编程”，指的是对编程语言进行再定义。

借助 ES6 暴露给我们的 Proxy 构造函数，我们可以创建一个 Proxy 实例，并借助这个实例对目标对象的一些行为进行再定义。

举个例子（解析在注释里）：

```js
// 定义一个 programmer 对象
const programmer = {
  name: 'xiuyan',
  age: 30,
}

// 定义这个对象的拦截逻辑
const proxyHandler = {
  // obj 是目标对象， key 是被访问的键名
  get(obj, key) {
    if (key === 'age') return 100
    return obj[key]
  },
}

// 借助 Proxy，将这个对象使用拦截逻辑包起来
const wrappedProgrammer = new Proxy(programmer, proxyHandler)

// 'xiuyan'
console.log(wrappedProgrammer.name)
// 100
console.log(wrappedProgrammer.age)
```

如这段代码所示， Proxy 接收两个参数，第一个参数是你需要处理的目标对象，第二个参数同样是一个对象，在这个对象里，描述了你希望对目标对象应用的拦截/代理行为。

在这个例子里，我借助 `proxyHandler` 拦截了目标对象（`programmer`）的 `getter` 方法，代理了 `programmer` 对象的访问行为。

每次访问 `wrappedProgrammer` 时，JS 不会执行 `programmer` 对象的默认行为（返回 `obj[key]`），而是会执行 `proxyHandler.get()` 方法所定义的行为：若访问的 key 是 `age`，则固定返回 100，否则返回 `obj[key]`。

（同理，我们也可以对目标对象的 `setter` 方法进行拦截，此处不再赘述）。

总结一下：借助 Proxy，我们可以给目标对象创建一个代理（拦截）层、拦截原生对象的某些默认行为，进而实现对目标行为的自定义。

那么 Proxy 是如何帮助 Immer.js 实现 Immutability 的呢？

### Produce 关键逻辑抽象

正如上文所说，使用 Immer.js，你只需要在项目里轻轻地 Import 一个名为 `produce` 的 API。

Immer.js 的一切奥秘都蕴含在 `produce` 里，包括其对 Proxy 的运用。

那么 `produce` 是如何工作的呢？

[Immer.js 的源代码](https://github.com/immutable-js/immutable-js/) 虽然简洁，但整个读完也是个力气活。这里我们只关注 `produce` 函数的核心逻辑，我将其提取为如下的极简版本（解析在注释里）：

```js
function produce(base, recipe) {
  // 预定义一个 copy 副本
  let copy
  // 定义 base 对象的 proxy handler
  const baseHandler = {
    set(obj, key, value) {
      // 先检查 copy 是否存在，如果不存在，创建 copy
      if (!copy) {
        copy = { ...base }
      }
      // 如果 copy 存在，修改 copy，而不是 base
      copy[key] = value
      return true
    },
  }

  // 被 proxy 包装后的 base 记为 draft
  const draft = new Proxy(base, baseHandler)
  // 将 draft 作为入参传入 recipe
  recipe(draft)
  // 返回一个被“冻结”的 copy，如果 copy 不存在，表示没有执行写操作，返回 base 即可
  // “冻结”是为了避免意外的修改发生，进一步保证数据的纯度
  return Object.freeze(copy || base)
}
```

接下来我尝试对这个超简易版的 producer 进行一系列的调用（解析在注释里）：

```js
// 这是我的源对象
const baseObj = {
  a: 1,
  b: {
    name: '修言',
  },
}

// 这是一个执行写操作的 recipe
const changeA = draft => {
  draft.a = 2
}

// 这是一个不执行写操作、只执行读操作的 recipe
const doNothing = draft => {
  console.log('doNothing function is called, and draft is', draft)
}

// 借助 produce，对源对象应用写操作，修改源对象里的 a 属性
const changedObjA = produce(baseObj, changeA)

// 借助 produce，对源对象应用读操作
const doNothingObj = produce(baseObj, doNothing)

// 顺序输出3个对象，确认写操作确实生效了
console.log(baseObj)
console.log(changedObjA)
console.log(doNothingObj)

// 【源对象】 和 【借助 produce 对源对象执行过读操作后的对象】 还是同一个对象吗？
// 答案为 true
console.log(baseObj === doNothingObj)
// 【源对象】 和 【借助 produce 对源对象执行过写操作后的对象】 还是同一个对象吗？
// 答案为 false
console.log(baseObj === changedObjA)
// 源对象里没有被执行写操作的 b 属性，在 produce 执行前后是否会发生变化？
// 输出为 true，说明不会发生变化
console.log(baseObj.b === changedObjA.b)
```

下图为上述代码的执行结果 `console` ：

![[_attachment/img/e8c9d88e3b3c6b94e573748e6a23750f_MD5.png]]

如果你想使用 `produce` 本体验证上述用例，你只需要在项目里引入 `produce` 后，注释掉我们自定义的 `produce` 即可。

`produce` 本体运行该测试用例的执行结果 `console` 如下：

![[_attachment/img/d99c1af1d9fe4606fa22bb98f3ca3a70_MD5.png]]

两边的输出完全一致，也就是说至少对这个基础用例来说，我们的极简版 `produce` 是可以复刻 `produce` 本体的表现的。

而 Immer.js 对 Proxy 的巧思，恰恰就藏在这个极简 `produce` 里。

## Produce 工作原理：将拷贝操作精准化

`produce` 可以像 Immutable.js 一样，精准打击那些需要执行写操作的数据。**将“变与不变”分离，确保只有变化的部分被处理，而不变的部分则将继续留在原地。**

但 `produce` 并没有像 Immutable.js 一样打数据结构的主意，而是将火力集中对准了“拷贝”这个动作。

它严格地控制了“拷贝”发生的时机：当且仅当写操作确实发生时，拷贝动作才会被执行。

在我们调用 `produce` 执行读操作前后，`baseObj` 和 `doNothingObj` 是严格相等的：

```js
// 这是我的源对象
const baseObj = {
  a: 1,
  b: {
    name: "修言"
  }
}

// 这是一个执行写操作的 recipe
const changeA = (draft) => {
  draft.a = 2
}


// 这是一个不执行写操作、只执行读操作的 recipe
const doNothing = (draft) => {
  console.log("doNothing function is called, and draft is", draft)
}

// 借助 produce，对源对象应用写操作，修改源对象里的 a 属性
const changedObjA = produce(baseObj, changeA)

// 借助 produce，对源对象应用读操作
const doNothingObj = produce(baseObj, doNothing)

// 顺序输出3个对象，确认写操作确实生效了
console.log(baseObj)
console.log(changedObjA)
console.log(doNothingObj)

// 【源对象】 和 【借助 produce 对源对象执行过读操作后的对象】 还是同一个对象吗？
// 答案为 true
console.log(baseObj === doNothingObj)
// 【源对象】 和 【借助 produce 对源对象执行过写操作后的对象】 还是同一个对象吗？
// 答案为 false
console.log(baseObj === changedObjA)
// 源对象里没有被执行写操作的 b 属性，在 produce 执行前后是否会发生变化？
// 输出为 true，说明不会发生变化
console.log(baseObj.b === changedObjA.b)
```

**只要写操作没执行，拷贝动作就不会发生**。

只有当写操作确实执行，也就是当我们试图修改 `baseObj` 的 `a` 属性时，`produce` 才会去执行拷贝动作：先浅拷贝一个 `baseObj` 的副本对象（`changedObjA`）出来，然后再修改 `changedObjA` 里的 `a`。

这一步对应的是 `produce` 函数对 `setter` 的代理逻辑：

```js
const baseHandler = {
  set(obj, key, value) {
    // 先检查 copy 是否存在，如果不存在，创建 copy
    if (!copy) {
      copy = { ...base }
    }
    // 如果 copy 存在，修改 copy，而不是 base
    copy[key] = value
    return true
  }
}
```

这样一来，`changedObjA` 和 `baseObj` 显然是两个不同的对象，**数据内容的变化和引用的变化同步发生了**，这 **符合我们对 Immutability 的预期**。

与此同时，`changedObjA.b` 和 `baseObj.b` 是严格相等的，说明两个引用不同的对象，仍然 **共享着那些没有实际被修改到的数据**。由此也就实现了数据共享，避免了暴力拷贝带来的各种问题。

`produce` 借助 Proxy，将拷贝动作发生的时机和 `setter` 函数的触发时机牢牢绑定，确保了拷贝动作的精确性。 而逐层的浅拷贝，则间接地实现了数据在新老对象间的共享。

## 拓展：“知其所止”的“逐层拷贝”

这里我想要给大家展开说明一下这个“逐层的”浅拷贝。

在我们的极简版 `produce` 里，着重突出了 `setter` 函数的写逻辑，也就是对“拷贝时机”的描述，淡化了其它执行层面的细节。

而在 Immer.js 中，完整版 `produce` 的浅拷贝其实是 **可递归** 的。

举例来说，在本文的案例中，`baseObj` 是一个嵌套对象，一共有两层（如下图红圈所示）：

![[_attachment/img/7e3cd76fc959056bf3adf02fe77602e0_MD5.png]]

外面的圈圈表示第一层，里面的圈圈表示第二层（也就是 `b` 属性指向的对象）。

**无论对象嵌套了多少层，每一层对于写操作的反应是一致的，都会表现为“修改时拷贝”。**

我继续用 `baseObj` 举个例子，这次我们来看 `b` 属性（它是一个对象）。

如果我对 `b` 属性执行了写操作，结果会是怎样的呢？

请看下面这段代码（注意看解析）：

```js
import produce from "immer";

// 这是一个执行引用类型写操作的 recipe
const changeB = (draft) => {
  draft.b.name = " 修个锤子"
}

// 借助 produce 调用 changeB
const changedObjB = produce(baseObj, changeB)
// 【源对象】 和 【借助 produce 对源对象执行过写操作后的对象】 还是同一个对象吗？
// 答案为 false
console.log(baseObj === changedObjB)
// 【b 属性】 和 【借助 produce 修改过的 b 属性】 还是同一个对象吗？
// 答案为 false
console.log(baseObj.b === changedObjB.b)
```

从结果上来看， 即便对于嵌套的对象来说，**数据内容的变化和引用的变化也能同步发生**。

这是因为 `produce` **不仅会拦截** `setter` **，也会拦截** `getter`。

通过对 `getter` 的拦截，`produce` 能够按需地对被访问到的属性进行“懒代理”：你访问得有多深，代理逻辑就能走多深；而所有被代理的属性，都会具备新的 `setter` 方法。

当写操作发生时，`setter` 方法就会被逐层触发，呈现“逐层浅拷贝”的效果。

**“逐层浅拷贝”是 Immer 实现数据共享的关键。**

假设我的对象嵌套层级为 10 层，而我对它的属性修改只会触达第 2 层，“逐层的浅拷贝”就能够帮我们确保拷贝只会进行到第 2 层。

“逐层的浅拷贝”如果递归到最后一层，就会变成深拷贝。

对于引用类型数据来说，“暴力拷贝”指的也就是深拷贝。

“暴力拷贝”之所以会带来大量的时间空间上的浪费，本质上是因为它在拷贝的过程中不能够“**知其所止**”。

而“逐层的浅拷贝”之所以能够实现数据共享，正是因为它借助 Proxy 做到了“**知其所止**”。

## 思考：“知其所止”的软件设计表达

无论是“精准拷贝”、“修改时拷贝”，还是“逐层拷贝”，其背后体现的都是同一个思想——“按需”。

“知其所止”的软件设计表达，就是“按需”。

对于 Immutable.js 来说，它通过构建一套原生 JS 无法支持的 Trie 数据结构，最终实现了树节点的按需创建。

对于 Immer.js 来说，它借助 Proxy 的 getter 函数实现了按需代理，借助 Proxy 的 setter 函数实现了对象属性的按需拷贝。

可见，想要实现高效的 Immutability，“按需变化”是一个不错的切入点。

## 总结： Immutability 的实践演进

现在请大家回顾一下：对于 JS 来说，Immutability 实践的直接目的是什么？

简单来说，是为了解决 **数据内容变化与数据引用变化不同步的问题**。

我拿到一个引用类型数据（`A`)，修改了其中的一个 `a` 属性，然后所有依赖 `A.a` 进行计算的函数逻辑全炸了，牵一发而动全身，这不是我们想要的结局。

我们希望一旦引用类型数据（`A`）的内容改变了，我们就能获取到一个新的引用，这个引用指向一套已经发生改变的数据（`A'`)， `A` 和 `A'` 应该是泾渭分明的。

暴力拷贝，可以做到“泾渭分明”，但是对于规模较大的数据来说，它太低效了。

于是，社区的 Immutability 解决方案百花齐放，Immer.js 和 Immutable.js 就是其中的佼佼者。

Immutable.js 底层是持久化数据结构，而 Immer.js 的底层是 Proxy 代理模式。

两者虽然在具体的工作原理上大相径庭，但最终指向的目的却是一致的：使数据的引用与数据内容的变化同步发生；并且在这个过程中，按需处理具体的变化点，提升不可变数据的执行效率。

## 推荐阅读

[ImmutableJS Source Code](https://github.com/immutable-js/immutable-js)

[Trie Datastructure in Javascript](https://learnersbucket.com/tutorials/data-structures/trie-data-structure-in-javascript/)

[10 Best JavaScript Trie Libraries](https://openbase.com/categories/js/best-javascript-trie-libraries)
