---
aliases: []
tags: ['MVVM/React','date/2022-03','year/2022','month/03']
date: 2022-03-31-Thursday 22:02:28
update: 2022-04-02-Saturday 12:53:59
---

react的每次触发页面更新实际上分为两个阶段

_render : 主要负责进行vdom的diff计算_

commit phase: 主要负责将vdom diff的结果更新到实际的DOM上。

**当父组件重渲染的时候，其会默认递归的重渲染所有子组件**

```tsx
import { useState, useEffect } from "react"
function Parent () {
  const [count, setCount] = useState(0)
  const [name, setName] = useState("")

  useEffect(() => {
    setInterval(() => {
      setCount(x => x + 1)
    }, 1000)
  }, [])

  return (
    <>
      <input
        value={ name }
        onChange={ e => {
          setName(e.target.value)
        } }
      />
      <div>counter:{ count }</div>
      <Child name={ name } />
    </>
  )
}
function Child (props: { name: string }) {
  console.log("child render", props.name)
  return <div>name:{ props.name }</div>
}
```

React根本不关心你的props是否改变，就是简单粗暴的进行全局刷新。如果所有的组件的props都没发生变化， 即使React进行了全局计算，但是并没有产生任何的vdom的diff，在commmit阶段自然也不会发生任何的dom更新，你也感受不到 UI的更新，但是其仍然浪费了很多时间在render的计算过程

### 浅比较优化

React为了帮助解决上述性能问题，实际上提供了三个API用于性能优化 _shouldComponentUpdate: 如果在这个生命周期里返回false，就可以跳过后续该组件的render过程_

<iframe src="https://zh-hans.reactjs.org/docs/optimizing-performance.html#avoid-reconciliation"
  border="0"
  frameborder="0"
  height="650"
  width="100%"
  style="background-color:#fff"></iframe>

React.PureComponent （class）： 会对传入组件的props进行浅比较，如果浅比较相等，则跳过render过程，适用于Class Component *

React.memo（method）： 同上，适用于functional Component

- primtive是*immutable*的，而object一般是可以*mutable*的

- primitive比较是进行值比较，而对于object则进行引用比较

实际上React及hooks的很多的问题根源都来源于对象引用比较和对象深比较的结果的不一致性,即

**对象值不变的情况下, 对象引用变化会导致React组件的缓存失效，进而导致性能问题**

**对象值变化的的情况下，对象引用不变会导致的React组件的UI和数据的不一致性**

对于一般的MVVM框架，框架大多都负责帮忙处理ViewModel <=> View的一致性，即

当ViewModel发生变化时，View也能跟着一起刷新

当ViewModel不变的时候，View也保持不变

```tsx
import { useState, useEffect, memo } from "react"
function Parent () {
  const [count, setCount] = useState(0)
  const [name, setName] = useState("")

  useEffect(() => {
    setInterval(() => {
      setCount(x => x + 1)
    }, 1000)
  }, [])

  return (
    <>
      <input
        value={ name }
        onChange={ e => {
          setName(e.target.value)
        } }
      />
      <div>counter:{ count }</div>
      <Child name={ name } />
    </>
  )
}
const Child = memo((props: { name: string }) => {
  console.log("child render", props.name)
  return <div>name:{ props.name }</div>
})
```

如果我们的 props 只包含 primitive 类型(string、number)等，那么 React.memo 基本上就足够使用了，但是假如我们的 props 里包含了对象，就没那么简单了， 我们继续为我们的 Child 组件添加新的 Item props,这时候的 props 就变成了 object,问题 也随之而来，即使我们感觉我们的 object 并没有发生变化，但是子组件还是重渲染了。

```tsx
import { useState, useEffect, memo } from "react"

interface Item {
  text: string
  done: boolean
}

function Parent () {
  const [count, setCount] = useState(0)
  const [name, setName] = useState("")

  console.log("render Parent")
  const item = {
    text: name,
    done: false,
  }
  useEffect(() => {
    setInterval(() => {
      setCount(x => x + 1)
    }, 1000)
  }, [])

  return (
    <>
      <input
        value={ name }
        onChange={ e => {
          setName(e.target.value)
        } }
      />
      <div>counter:{ count }</div>
      <Child item={ item } />
    </>
  )
}
const Child = memo((props: { item: Item }) => {
  console.log("child render")
  const { item } = props

  return <div>name:{ item.text }</div>
})
```

这里的问题问题在于，React.memo 比较前后两次 props 是否相等使用的是浅比较,而 child 每次接受的都是一个新的 literal object, 而由于每个literal object的比较是引用比较，虽然他们的各个属性的值可能相等，但是其比较结果仍然为false，进一步导致浅比较返回 false，造成Child组件仍然被重渲染

解决方式有两种，

* 第一种自然是直接进行深比较而非浅比较
- 第二种则是保证在Item深比较结果相等的情况下，浅比较的结果也相等

<iframe src="https://zh-hans.reactjs.org/docs/react-api.html#reactmemo"
  border="0"
  frameborder="0"
  height="650"
  width="100%"
  style="background-color:#fff"></iframe>

```ts
const Child = memo((props: { item: Item }) => {
  console.log("child render")
  const { item } = props

  return <div>name:{ item.text }</div>
},
  (prev, next) => {
    // 使用深比较比较对象相等
    return deepEqual(prev, next)
  })
```

虽然这样能达到效果，但是深比较处理比较复杂的对象时仍然存在较大的性能开销甚至挂掉的风险（如处理循环引用），因此并不建议去使用深比较进行性能优化。

第二种方式则是需要保证如果对象的值相等，我们保证生成对象的引用相等， 这通常分为两种情况

如果对象本身是固定的常量,则可以通过 useRef 即可以保证每次访问的对象引用相等

<iframe src="https://zh-hans.reactjs.org/docs/hooks-reference.html#useref"
  border="0"
  frameborder="0"
  height="650"
  width="100%"
  style="background-color:#fff"></iframe>

```tsx
interface Item {
  text: string
  done: boolean
}

function Parent () {
  const [count, setCount] = useState(0)
  const [name, setName] = useState("")

  console.log("render Parent")
  const item = useRef({ // useRef
    text: name,
    done: false,
  })

  useEffect(() => {
    setInterval(() => {
      setCount(x => x + 1)
    }, 1000)
  }, [])

  return (
    <>
      <input
        value={ name }
        onChange={ e => {
          setName(e.target.value)
        } }
      />
      <div>counter:{ count }</div>
      <Child item={ item.current } /> // ref变量需要current访问
    </>
  )
}
const Child = memo((props: { item: Item }) => {
  console.log("child render")
  const { item } = props

  return <div>name:{ item.text }</div>
})
```

问题也很明显，假使我们的 name 改变了，我们的item仍然使用的是旧值并不会进行更新，导致我们的子组件也不会触发重渲染，导致了数据和UI的不一致性，这比重复渲染问题更糟糕。所以 useRef 只能用在常量上面。

那么我们怎么保证 name 不变的时候 item 和上次相等，name 改变的时候才和上次不等。useMemo!

useMemo 可以保证当其 dependency 不变时，依赖 dependency 生成的对象也不变

<iframe src="https://zh-hans.reactjs.org/docs/hooks-reference.html#usememo"
  border="0"
  frameborder="0"
  height="650"
  width="100%"
  style="background-color:#fff"></iframe>

```tsx
function Parent () {

  const [count, setCount] = useState(0)
  const [name, setName] = useState("")

  console.log("render Parent")
  const item = useMemo(
    () => ({
      text: name,
      done: false,
    }),
    [name] // dependency
  )

  useEffect(() => {
    setInterval(() => {
      setCount(x => x + 1)
    }, 1000)
  }, [])

  return (
    <>
      <input
        value={ name }
        onChange={ e => {
          setName(e.target.value)
        } }
      />
      <div>counter:{ count }</div>
      <Child item={ item } />
    </>
  )
}

const Child = memo((props: { item: Item }) => {

  console.log("child render")
  const { item } = props

  return <div>name:{ item.text }</div>
})

```

至此我们保证了 Parent 组件里 name 之外的 state 或者 props 变化不会重新生成新的 item，借此保证了 Child 组件不会 在 props 不变的时候重新渲染。

然而事情并未到此而止

下面继续扩展我们的应用，此时一个 Parent 里可能包含多个 Child

```tsx
interface Item {
  text: string
  done: boolean
  id?: string
}

function Parent () {
  const [name, setName] = useState("")
  const [items, setItems] = useState<Item[]>([])

  console.log("render Parent")
  const handleAdd = () => {
    setItems(items => {
      items.push({
        text: name,
        done: false,
        id: uuid(),
      })
      return items // 引用对象相同，react认为数据没有变化
    })
  }

  return (
    <>
      <input
        value={ name }
        onChange={ e => {
          setName(e.target.value)
        } }
      />
      <button onClick={ handleAdd }>+</button>
      { items.map(i => <Child key={ i.id } item={ i } />) }
    </>
  )
}
const Child = memo((props: { item: Item }) => {
  console.log("child render")
  const { item } = props

  return <div>name:{ item.text }</div>
})
```

当我们点击添加按钮的时候，我们发现下面的列表并没有刷新，等到下次输入的时候，列表才得以刷新。 问题的在于 useState 返回的 setState 的操作和 class 组件里的 setState 的操作意义明显不同了。

- class 的 setState: 不管你传入的是什么state，都会强制刷新当前组件
- hooks 的 setState: 如果前后两次的 state 引用相等，并不会刷新组件，因此需要用户进行保证当深比较结果不等的情况下，浅比较结果也不等，否则会造成视图和UI的不一致。

hooks 的这个变化意味着假使在组件里修改对象，也必须保证修改后的对象和之前的对象引用不等。

```ts
  const handleAdd = () => {
    setItems(items => {
      items.push({
        text: name,
        done: false,
        id: uuid(),
      })
      return [...items] // 返回一个新的引用，保证每次都生成新的items，这样才能保证组件的刷新
    })
  }
```

这实际要求我们不直接更新老的 state，而是保持老的 state 不变，生成一个新的 state，即 immutable 更新方式，而老的 state 保持不变意味着 state 应该是个 immutable object。 对于上面的 items 做 immutable 更新似乎并不复杂,但对于更加复杂的对象的 immutable 更新就没那么容易了

例如：

```js
const state = [{name: 'this is good', done: false, article: {
  title: 'this is a good blog',
  id: 5678
}},{name: 'this is good', done: false, article:{
  title: 'this is a good blog',
  id: 1234
}}]

state[0].artile的title = 'new article'

// 如果想要进行上述更新，则需要如下写法
const newState = [{
  {
    ...state[0],
    article: {
      ...state[0].article,
      title: 'new article'
    }
  },
  ...state
}]
```

我们发现相比直接的 mutable 的写法，immutable 的更新非常麻烦且难以理解。我们的代码里充斥着`...`操作，我们可称之为`spread hell`。这明显不是我们想要的。

我们的需求其实很简单

- 一来是需要改变状态
- 二来是需要改变后的状态和之前的状态非引用相等

一个答案呼之欲出，做深拷贝然后再做 mutable 修改不就可以了

深拷贝有两个明显的缺点就是拷贝的性能和对于循环引用的处理，然而即使有一些库支持了高性能的拷贝，仍然有个致命的缺陷对 reference equality 的破坏，导致 react 的整个缓存策略失效。

如果用深拷贝我们发现所有对象的 reference equality 都被破坏，这意味着所有 props 里包含上述对象的组件 即使对象里的属性没变化，也会触发无意义的重渲染,这很可能导致严重的性能问题。 这实际上意味着我们状态更新还有其他的需求，在 react 中更新状态的就几个需求 对于复杂的对象 oldState，在不存在循环引用的情况下，可将其视为一个属性树，如果我们希望改变某个节点的属性，并返回一个新的对象 newState，则要求

- 该节点及其组件节点的引用在新老 state 中不相等：保证 props 发生的组件 UI 状态能够刷新,即保持 model 和 view 的一致性
- 非该节点及其祖先节点的引用在新老 state 中保持引用相等：保证 props 不变进而保证 props 不变的组件不刷新，即保证组件的缓存不失效

很可惜 Javascript 并没有内置对这种 Immutable 数据的支持，更别提对 Immutable 数据更新的支持了，但是借助于一些第三方库如immer和immutablejs，可以简化我们处理immutable数据的更新。

<iframe src="https://immerjs.github.io/immer/zh-CN/"
  border="0"
  frameborder="0"
  height="650"
  width="100%"
  style="background-color:#fff"></iframe>

```js
import { produce } from 'immer';
 const handleAdd = () => {
    setItems(
      produce(items => {
        items.push({
          text: name,
          done: false,
          id: uuid()
        });
      })
    );
  };
```

他们都是通过structing shared的方式保证我们只更新了修改的子state的引用，不会去修改未更改子state的引用，保证整个组件树的缓存不会失效。

![](_attachment/img/6f903961cad9a7f2a0589ed76a193177_MD5.gif)
