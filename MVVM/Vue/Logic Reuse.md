---
aliases: ['vue 逻辑复用']
tags: ['MVVM/Vue','date/2022-04','year/2022','month/04']
date: 2022-04-05-Tuesday 18:06:37
update: 2022-04-05-Tuesday 20:26:27
---

## 为什么 composition api 的逻辑重用客观上比 mixin 更好

例如，我们要实现一个跟踪鼠标的位置的逻辑组件，这是一个相对独立的逻辑，而且，很有可能，您可能需要跨多个组件重用它

### Mixins

```html
<script src="https://unpkg.com/vue@next"></script>
<div id="app"></div>
<script>
  const { createApp } = Vue

  const MouseMixin = {
    data: () => ({ x: 0, y: 0 }),
    methods: {
      update (e) {
        this.x = e.pageX
        this.y = e.pageY
      }
    },
    mounted () {
      window.addEventListener('mousemove', this.update)
    },
    destroyed () {
      window.removeEventListener('mousemove', this.update)
    }
  }

  const App = {
    mixins: [MouseMixin],
    template: `{{x}} {{y}}`,
  }

  createApp(App).mount('#app')
</script>
```

看起来很好，能正常运行，但是现在问题出现在当你有一个以上的mixin时，每次注入不同的名字，用不了多久你就会有点搞不清是哪个属性是由哪个mixin注入的，它是从哪里来的？

比如：

```js
const App = {
  mixins: [MouseMixin, AnotherMixin],
  template: `{{x}} {{y}}`, // 缺少明确的入口，不知道是由哪个mixin引入的
}
```

mixin的另一个问题是，每当你提取一个 mixin 你不得不担心命名空间冲突，比如，当你把它提取出来时，你必须考虑我应该重命名这个update函数吗？因为如果另一个mixin也有update函数呢？或者，如果试图使用这个mixin的组件已经有update函数了呢？

比如：

```js
  const MouseMixin = {
    data: () => ({ x: 0, y: 0 }),
    methods: {
      update (e) {
        this.x = e.pageX
        this.y = e.pageY
      }
    },
    mounted () {
      window.addEventListener('mousemove', this.update)
    },
    destroyed () {
      window.removeEventListener('mousemove', this.update)
    }
  }

  const App = {
    mixins: [MouseMixin],
    template: `{{x}} {{y}}`,
    methods: {
      update () { // 会覆盖mixin中的update
        console.log('cover')
      }
    }
  }
```

mixins缺点：

- 变量和属性不明确是由哪个mixin引入的
- 需要担心命名空间冲突，属性有可能会被覆盖，同时处理多个mixin会带来很多额外的精神负担

这是一个众所周知的mixin的问题，在过去我们见过像React这样的框架他们基本上完全去除了mixin，但当时，他们并没有一个很好的替代品，所以他们想出的解决方案是一种叫做高阶组件的东西。

### HOC（高阶组件）

高阶组件意思是不把所有的东西都混在一起在这个消费组件中，而是你需要什么就注入什么通过props。

```js
const App = WithMouse({
  props: ['x', 'y'],
  template: `{{x}} {{y}}`,
})
```

我们如何实现这个WithMouse函数呢？

```html
<script src="https://unpkg.com/vue@next"></script>
<div id="app"></div>
<script>
  const { createApp, h } = Vue

  function WithMouse (Inner) {
    return {
      data: () => ({ x: 0, y: 0 }),
      methods: {
        update (e) {
          this.x = e.pageX
          this.y = e.pageY
        }
      },
      mounted () {
        window.addEventListener('mousemove', this.update)
      },
      destroyed () {
        window.removeEventListener('mousemove', this.update)
      },
      render () {
        return h(Inner, { x: this.x, y: this.y }) // 通过props注入
      }
    }
  }

  const App = WithMouse({
    props: ['x', 'y'],
    template: `{{x}} {{y}}`,
  })

  createApp(App).mount('#app')
</script>
```

WithMouse接收内部组件，它返回另一个组件，包裹了内部组件使用render函数，将它需要所需的数据x和y注入其中。

现在有了一些改善，从某种意义上说，我们不再需要担心关于命名空间冲突，因为这个包装组件现在有了自己的命名空间，你也不必担心这里的冲突。不过，这里的问题是它并不能真正解决根本问题，比如多个高阶组件相互包装。

```js
const App = WithFoo(WithAnother(WithMouse({
  props: ['x', 'y', 'foo', 'bar'],
  template: `{{x}} {{y}}`,
})))
```

最后你可能会得到很多其他的props，同样，现在还不清楚哪个属性来自哪个高阶组件，也有可能它们其中两个试着注入同样的props。

HOC缺点：

- 依旧不明确变量和属性是由哪个mixin引入的
- 有可能注入的props相同导致被覆盖

所以我们认识到，好吧，高阶组件也不是什么灵丹妙药，从那里开始，在React生态系统中有一种新的模式，它被称为 render props，在Vue生态系统中，我们有一个非常相似的例子称为作用域插槽（slot-scope）

### slot-scope（render props）

作用域插槽并没有把内部组件包起来，而只是定义一个组件通过封装的状态在通过slot props传递。

```html
<script src="https://unpkg.com/vue@next"></script>
<div id="app"></div>
<script>
  const { createApp, h } = Vue

  const Mouse = {
    data: () => ({ x: 0, y: 0 }),
    methods: {
      update (e) {
        this.x = e.pageX
        this.y = e.pageY
      }
    },
    mounted () {
      window.addEventListener('mousemove', this.update)
    },
    destroyed () {
      window.removeEventListener('mousemove', this.update)
    },
    template: `<slot :x="x" :y="y" />`, // 等价下面方式
    render () {
      return this.$slots.default && this.$slots.default({
        x: this.x,
        y: this.y
      })
    }
  }

  const App = {
    components: {
      Mouse
    },
    template: template: `
      <Mouse v-slot="{ x, y }">
        {{x}} {{y}}
      </Mouse>
    `,
  }

  createApp(App).mount('#app')
</script>

```

现在，这样做与高阶组件相比，如果我们有多种类型的组件可以很明显看出x和y是由Mouse注入的

```js
const App = {
  components: {
    Mouse
  },
  template: `
    <Mouse v-slot="{ x, y }">
      <Foo v-slot="{ foo }">
        {{x}} {{y}} {{foo}}
      </Foo>
    </Mouse>
  `,
}
```

所以我们现在很清楚是哪种属性由哪种工具组件注入，另外，如果你有命名空间冲突，在函数参数位置你可以在解构这些属性时对它重命名。

```js
const App = {
  components: {
    Mouse
  },
  template: `
    <Mouse v-slot="{ x, y }">
      <Foo v-slot="{ x: foo }"> // 属性重命名
        {{x}} {{y}} {{foo}}
      </Foo>
    </Mouse>
  `,
}
```

所以我们解决了两个主要问题，我们已经解决了注入来源不明的问题，还解决了命名空间冲突问题，这种方法的唯一缺点是我们正在创建多个额外组件实例，为了逻辑、提取和重用。如果我们能解决这个命名空间和注入源问题，同时，我们不必有额外的开销，向这些附加的组件实例 那就太理想了，因此，让我们尝试使用 composition API来实现这一点。

### composition （hook）

```html
<script src="https://unpkg.com/vue@next"></script>
<div id="app"></div>
<script>
  const { createApp, h, ref, onMounted, onUnmounted } = Vue

  function useMouse () {
    const x = ref(0)
    const y = ref(0)

    const update = (e) => {
      x.value = e.pageX
      y.value = e.pageY
    }

    onMounted(() => {
      window.addEventListener('mousemove', update)
    })
    onUnmounted(() => {
      window.removeEventListener('mousemove', update)
    })

    return {
      x, y
    }
  }

  const App = {
    setup () {
      const { x, y } = useMouse()
      return { x, y }
    },
    template: `
      {{x}} {{y}}
    `,
  }

  createApp(App).mount('#app')
</script>
```

composition api 解决了上述问题，并且没有额外的开销

```js
const App = {
  setup () {
    const { x, y } = useMouse()
    const { x: foo } = useAnotherFeature() // 明确了来源，并可以解决命名冲突
    return {
      x,
      y,
      foo,
    }
  },
  template: `
    {{x}} {{y}}
  `,
}
```

composition api的最后一个好处是在类型系统中更容易地类型推导。一切都只是函数调用，只要提供了正确的类型定义，在90%的情况下，一切都是可以自动通过类型推断出来的。
