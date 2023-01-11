---
aliases: []
tags: ['CSS', 'date/2023-01', 'year/2023', 'month/01']
date: 2023-01-10-星期二 15:42:33
update: 2023-01-11-星期三 16:47:27
---

Flexbox 的设计目的是在包含元素（Flex 容器）中沿着行或列分配元素（Flex 项目）和空间。而它的最大特性就是 Flex 项目可伸缩，也就是让 Flex 项目的宽度（或高度）可以自动填充 Flex 容器剩余空间或 Flex 项目适配 Flex 容器不足的空间。而这一切都依赖于 Flexbox 模块中的 `flex` 属性来完成。

一个 Flex 容器会按照各个 Flex 项目的扩展比率分配 Flex 容器剩余空间，也会按照收缩比率来收缩 Flex 项目，以免 Flex 项目溢出 Flex 容器。简单地说，**Flex 项目的大小由 Flexbox 布局算法调整，也只有这种布局才称得上是灵活性的布局。**

![[_attachment/img/78a350bc35e1f7326e68cace27989406_MD5.gif]]

这种灵活性的布局将会涉及 Flex 项目的计算，那么问题来了，Flexbox 布局中的 Flex 项目是如何计算的呢？它和扩展比率或收缩比率之间又存在些什么关系呢？

## Flexbox 中空间是如何分配的？

要分配空间，首先浏览器必须确定 **有多少空间可用** 。一般情况，浏览器会按照下面的过程来分配空间。

- **计算 Flex 容器内的可用空间** 。Flex 容器的可用空间指的是 Flex 容器的主轴尺寸（Main Size）减去其 **内距（`padding`）** 、 **边框宽度（`border-width`）** 、**间距（`gap`）** 和 **Flex 项目的外边距（`margin`）** 。

- **计算每个 Flex 项目的伸缩基础大小和假设的主尺寸** ，即使用 `flex-basis` 、`min-width` 、`min-inline-size` 、`width` 、 `inline-size` 或 Flex 项目内容大小（`min-content` 或 `max-content`）设定的大小。其中 `flex-basis` 是 Flex 项目所需的最小尺寸，假设的主尺寸是指应用伸缩因子之前 Flex 项目的尺寸。而且 Flex 项目的伸缩基础大小永远不会小于其内容的伸缩基础大小。

- **计算所有** **Flex** **项目的总假设主尺寸** 。

- **将所有 Flex 项目的假想主尺寸与 Flex 容器的可用空间进行比较** 。当所有 Flex 项目的假想主尺寸总和大于 Flex 容器可用空间时，将会使用 `flex-shrink` 属性值作为 Flex 项目的收缩因子（收缩比率）来收缩 Flex 项目；当所有 Flex 项目的假想主尺寸总和小于 Flex 容器可用空间时，将会使用 `flex-grow` 属性值作为 Flex 项目的扩展因子（扩展比率）来扩展 Flex 项目。

也就是说，使用 Flexbox 布局时，浏览器会使用伸缩因子（包括扩展因子和收缩因子）决定从每个 Flex 项目中增加（扩展因子）或减去（收缩因子） Flex 容器的剩余空间，并且浏览器在循环中完成每个 Flex 项目的计算。

> 剩余空间是指从 Flex 容器的内部宽度减去具有一定大小的 Flex 项目的总和、加上内距和间距值后剩下的部分。如果 Flex 项目设置了外距，还需要减去外距。

而且浏览器还会将确定的尺寸看作是 Flex 项目的已知尺寸。当一个 Flex 项目具有一定的尺寸时，它被认为是一个非弹性的 Flex 项目。没有明确尺寸的 Flex 项目则被认为是灵活的 Flex 项目。

## 先了解一些概念

Flex 项目的计算其实就是 **Flex 项目尺寸的计算** ，但在 CSS 中设置元素尺寸，主要由 **尺寸属性** 和 **尺寸属性值** 两部分来决定，只不过，这两部分所涉及到的内容比较多。

比如说，在 CSS 中给一个元素设置尺寸时，常会使用 `width` 、`height` 、`inline-size` 和 `block-size` ，也会使用 `min-width` 、`min-height` 、`min-inline-size` 、`min-block-size` 、`max-width` 、`max-height` 、`max-inline-size` 和 `max-block-size` 给元素限定一个尺寸。但要最终决定元素尺寸大小的是这些属性的值，比如：

- `auto`：设置值为 `auto` 时，容器的大小将会以容器上下文来计算。如果它是个块元素，等于父容器宽度，如果它是个内联元素，则等于元素内容的尺寸大小；不过给 `min-width`、`min-height`、`min-inline-size` 或 `min-block-size` 设置值为 `auto` 时，将会指定一个自动计算好的最小值 。

- `none`：如果取值为 `none` 时，元素盒子的大小是没有任何限制的。

- `<length-percentage>`：使用 `<length>` 或 `<percent>` 指定元素的大小。其中 `<length>` 是一个长度值，它可能是一个固定长度值，也可能是一个相对长度值，主要取决于其单位，比如 `px` 是一个固定值，`vw` 和 `rem` 又是一个相对值。`<percent>` 是一个百分比值，根据其父元素的宽度来解析百分比。

- `min-content`：如果指定了内联轴，那么 `min-content` 对应的大小则是内联大小，否则将表现为属性的初始值，即固有的最小宽度。

- `max-content`：如果指定了内联轴，那么 `max-content` 对应的大小则是内联大小，否则将表现为属性的初始值，即固有的首选宽度。

- `fit-content()`：如果显式指定了内联轴，使用 `fit-content()` 函数，可以用指定的参数替换可用空间，即 `min(max-content, max(min-content, <length-percentage>))`；否则将表现为属性的初始值。对于内在尺寸，`fit-content(<length>)` 表现长度值（`<length>`）。如果 `fit-content()` 使用了百分比值，`min-content` 作为最小内容，`max-content` 作为最大内容 。

而其中 `auto` 、`min-content` 、`max-content` 和 `fit-content()` 又被称为自动计算尺寸大小方式。

使用这些属性和值设定元素尺寸时，又根据使用的值不同，可以分为：

- **明确的尺寸**，指的是不需要执行布局就可以确定盒子的大小。也就是说，显式给容器设置一个固定值，或内容所占区域的大小，或一个容器块的初始大小，或通过其他计算方式得到的尺寸（比如 Flexbox 布局中的“拉伸和压缩（Strretch-fit）”）。

- **不确定的尺寸**，指的是一个未知的尺寸。换句话说，容器具备无限空间。

通俗一点来理解的话，明确的尺寸是知道容器的 `width`（或 `inline-size`）和 `height`（或 `block-size`）；不确定的尺寸是需要根据内容来计算的，所以要知道，不确定的尺寸需要先检查内容。

在 Flexbox 布局中，除了上述提到的方式可以指定 Flex 项目尺寸之外，Flexbox 模块中的 `flex-basis` 属性（`flex` 简写属性成员之一） 也可以用来设定 Flex 项目的大小。而且它还会受 `flex` 属性中的 `flex-grow` 和 `flex-shrink` ，以及 Flex 容器的可用空间、剩余空间和不足空间等因素影响。

Flexbox 布局中的 `flex-basis` 可用来指定 Flex 项目在 Flex 容器主轴方向的初始值。简单地说，除了 `auto` 和 `content`，`flex-basis` 都以与水平书写模式中 `width` 相同的方式解析（除了 `width` 值设置为 `auto`，`flex-basis` 设置为 `content`）。

当然，在 Flexbox 纵向布局（即 `flex-direction` 取值为 `column` 或 `column-reverse` 时），`flex-basis` 对应的值就和 `height` 相同。而且当书写模式改变时，相应的取值方式也会有所改变。用张图来简单描述一下：

![[_attachment/img/5f40260c050d4ccfd041f036b0e92b1a_MD5.png]]

## `flex` 的基础使用 (flex)

`flex` 是一个只能用于 Flex 项目的属性，它可以 **让 Flex 项目根据 Flex 容器的可用空间对自身做伸缩计算** ，它包含三个子属性：`flex-basis` 、`flex-grow` 和 `flex-shrink` 。

为了让大家更好地理解 `flex` 属性以及它的子属性，我们先从一个简单的 Flex 项目开始：

```html
<div class="container">
  <div class="item"><span>A</span>longlonglongword</div>
  <div class="item"><span>B</span>ook</div>
  <div class="item"><span>C</span>ountries in the east</div>
  <div class="item"><span>D</span>iscuss</div>
  <div class="item"><span>E</span>astern</div>
</div>
<style>
  .container {
    display: flex;
    inline-size: 1000px;
  }
</style>
```

![[_attachment/img/4c4d6d1b5c243032b85d6a019fcc8127_MD5.png]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/JjvWgar)

默认情况，浏览器对 Flex 项目计算结果如下：

![[_attachment/img/31ad5e52948b5ed089d4766ebe40cd12_MD5.png]]

我们在 Flex 容器上显式设置了 `inline-size` 值为 `1000px` ，在所有 Flex 项目上未显式设置任何与尺寸有关的属性（比如 `width` 、 `inline-size` 或 `flex-basis` 等），浏览器在计算如下：

- Flex 容器可用空间是 `1000px` ；

- 每一个 Flex 项目因未显式设置任何与尺寸有关的属性，浏览器视每一个 Flex 项目的尺寸即为其内容的最大尺寸（`max-content`），同时浏览器根据内容多少，可计算出其宽度的具体值是多少像素值。我们示例中每个 Flex 项目的宽度分别是 `237.56px` 、 `70.26px` 、 `243.30px` 、 `100.69px` 和 `100.11px` 。

这样就可以计算出 Flex 容器的剩余（或不足空间）： `1000px - 237.56px - 70.26px - 243.30px - 100.69px - 100.11px = 248.08px` 。如果计算出来值是正值的话，该值就是 Flex 容器的剩余空间，反之则是 Flex 容器的不足空间。

> 注意，在接下来的示例中，Flex 容器的宽度（可用空间）都是 `1000px` ，并且在 Flex 容器上未显式设置 `border` 、`padding` 和 `gap` 以及在 Flex 项目上未显式设置 `margin` 值。

在这个示例中，我们并没有在 Flex 项目设置 `flex` 属性的值，此时，浏览器在计算 Flex 项目时会视 Flex 项目的 `flex` 属性的值是其默认值，即 `flex: 0 1 auto` ，对应的就是：

- `flex-grow` 属性的初始值为 `0` ，表示 Flex 项目不扩展（即不瓜分 Flex 容器的剩余空间）；

- `flex-shrink` 属性的初始值为 `1` ，表示 Flex 项目会收缩（即 Flex 项目在原始尺寸上按比率减去 Flex 容器的不足空间）；

- `flex-basis` 属性的初始值为 `auto` ，表示 Flex 项目的基本尺寸是 Flex 项目的最大内容尺寸（即 `max-content`）。

示例中，所有 Flex 项目的假设主尺寸总和是 `751.92px`（即 `237.56 + 70.26 + 243.30 + 100.69 + 100.11 = 751.92`），该值小于 Flex 容器的可用空间 `1000px` 。结果就是所有 Flex 项目既不会扩展以填充 Flex 容器可用空间，也不会缩小以适应其中。

现在我们知道了， `flex` 属性是 `flex-grow` 、`flex-shrink` 和 `flex-basis` 三个属性的简写属性，但我们在使用的时候，`flex` 属性可以指定 **`1`** **个值** （单值语法）、**`2`** **个值** （双值语法）或 **`3`** **个值** (三值语法)。

`flex` 属性的单值语法时，其值必须为以下其中之一：

- 一个无单位的数值（`<number>`），比如 `flex: 1` ，这个时候它（即 `1`）会被当作 `flex-grow` 属性的值；

- 一个有效的长度值（`<length-percentage>` ），比如 `flex: 30vw` ，这个时候它（即 `30vw`）会被当作 `flex-basis` 属性的值；

- 关键词 `none` 、 `auto` 或 `initial` （即初始值）。

比如：

```css
.item {
  flex: 1;

  /* 等同于 */
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0%;
}

.item {
  flex: 30vw;

  /* 等同于 */
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 30vw;
}
```

`flex` 属性的双值语法，其第一个值必须为 **一个无单位的数值（`<number>`）** ，并且它会 **被当作** **`flex-grow`** **属性的值** ；第二个值必须为以下之一：

- 一个无单位的数值（`<number>`），它会被当作 `flex-shrink` 属性的值；

- 一个有效的长度值（`<length-percentage>`），它会被当作 `flex-basis` 属性的值。

比如：

```css
.item {
  flex: 1 2;

  /* 等同于 */
  flex-grow: 1;
  flex-shrink: 2;
  flex-basis: 0%;
}

.item {
  flex: 2 30vw;

  /* 等同于 */
  flex-grow: 2;
  flex-shrink: 1;
  flex-basis: 30vw;
}

.item {
  flex: 30vw 2;

  /* 等同于 */
  flex-grow: 2;
  flex-shrink: 1;
  flex-basis: 30vw;
}
```

`flex` 属性的三值语法：

- 第一个值必须是一个无单位的数值（`<number>`），并且它会被当作 `flex-grow` 属性的值；

- 第二个值必须是一个无单位的数值（`<number>`），并且它会被当作 `flex-shrink` 属性的值；

- 第三个值必须是一个有效的长度值（`<length-percentage>`），并且它会被当作 `flex-basis` 属性的值。

比如：

```css
.items {
  flex: 2 1 200px;

  /* 等同于 */
  flex-grow: 2;
  flex-shrink: 1;
  flex-basis: 200px;
}

.item {
  flex: 30vw 2 1;

  /* 等同于 */
  flex-grow: 2;
  flex-shrink: 1;
  flex-basis: 30vw;
}
```

另外， `flex` 属性的取值还可以是：

- `auto` ：Flex 项目会根据自身的 `width` （或 `inline-size`）和 `height` （或 `block-size`）来确定尺寸，但 Flex 项目会根据 Flex 容器剩余空间进行伸缩。其相当于 `flex: 1 1 auto` 。

```css
.item {
  flex: auto;

  /* 等同于 */
  flex-grow: 1; /* Flex 项目可以扩展到超过其 flex-basis */
  flex-shrink: 1; /* Flex 项目可以收缩到小于其 flex-basis */
  flex-basis: auto; /* Flex 项目为基本大小 auto，即 max-content */
}
```

![[_attachment/img/0ed03bc36a247ab137c9c7c732e2efd7_MD5.gif]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/eYrWOey)

简单地说，要使项目增长，同时允许大 Flex 项目比小 Flex 项目拥有更多空间，请使用 `flex:auto`。这也意味着 Flex 项目最终具有不同的大小，因为 Flex 项目之间共享的空间，将在每个 Flex 项目被设为最大内容大小（`max-content`）之后被均分。因此，较大的 Flex 项目会获得更多的空间。

Flexbox 布局中，很多开发者为了强制所有 Flex 项目的大小一致，并忽略内容的大小，即 **均分 Flex 容器可用空间（不是均分 Flex 容器剩余空间）** ，简单地说就是，**让所有 Flex 项目尺寸相等** ，习惯性使用 `flex: 1` ：

```css
.item {
  flex: 1;

  /* 等同于 */
  flex-grow: 1; /* Flex 项目可以增长到超过其 flex-basis */
  flex-shrink: 1; /* Flex 项目可以收缩到比它们的 flex-basis 小 */
  flex-basis: 0%; /* Flex 项目为基本大小 0 */
}
```

![[_attachment/img/947e516786fb69043553224fdd3b2aa8_MD5.gif]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/zYjwYxy)

**使用** **`flex: 1`** **表示所有 Flex 项目的大小都为零** ，因此，弹性容器中的所有空间均可供分配。由于所有 Flex 项目的 `flex-grow` 扩展因子均为 `1`，所以，它们可以平均增长并共享 Flex 容器空间。

这里有一个误区，**大多数开发者都误认为，只要在 Flex 项目上显式设置了** **`flex:1`** **，所有 Flex 项目的宽度（或高度）就相等。** 事实并非如此，比如上面示例，由于第一个 Flex 项目的内容就要比其他 Flex 项目略宽一点，即使在所有 Flex 项目设置了 `flex:1` ，也没有实现所有 Flex 项目等宽的效果：

![[_attachment/img/8dcf88474cb9f4d34d1a347a0673d794_MD5.png]]

如果要真的实现所有 Flex 项目宽度相等，除了在 Flex 项目上设置为 `flex:1` 之外，还需要显式设置 `min-width` 值为 `0` ([[#^386ac5|原因]])：

```css
.item {
  flex: 1;
  min-width: 0;
}
```

![[_attachment/img/c639377c12d24b7b118669aebc1f17a3_MD5.gif]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/WNJjNod)

- `initial` ： Flex 项目会根据自身的 `width` (或 `inline-size`)， 和 `height` （或 `block-size`）来确定尺寸，Flex 项目不会扩展，但会收缩来适应 Flex 容器。其相当于 `flex: 0 1 auto`。

```css
.item {
  flex: initial;

  /* 等同于 */
  flex-grow: 0;
  flex-shrink: 1;
  flex-basis: auto;
}
```

![[_attachment/img/55ac2caa2bb2eab3658a213001b6718d_MD5.gif]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/zYjwOWa)

- `none` ：Flex 项目会根据自身的 `width` （或 `inline-size`），和 `height` （或 `block-size`）来设置尺寸，它是完全非弹性的，即不会收缩，也不会扩展来适应 Flex 容器。其相当于 `flex: 0 0 auto`。

```css
.item {
  flex: none;

  /* 等同于 */
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: auto;
}
```

![[_attachment/img/907db9316e3759382dd661561f656082_MD5.gif]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/oNdWvJR)

- `<flex-grow>` ：定义 Flex 项目的 `flex-grow` 属性的值，取值为 `<number>`。

- `<flex-shrink>` ：定义 Flex 项目 `flex-shrink` 属性的值，取值为 `<number>` 。

- `<flex-basis>` ：定义 Flex 项目的 `flex-basis` 属性的值。若值为 `0` 时，则必须加上单位（`<length>` 或 `<percentage>`），比如 `0px` 或 `0%`，避免被视作伸缩性 `flex-grow` 或 `flex-shrink` 的值。

![[_attachment/img/b5bc44870594f94b91f87812eaefb3e0_MD5.gif]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/oNdWvVr)

在大多数情况下，在 Flex 项目上设置 `flex` 属性时，其常见值的效果有：

- `flex: 0 auto` 和 `flex: initial` ，这两个值与 `flex: 0 1 auto` 相同，也是 `flex` 的 **初始值** 。会根据 Flex 项目的 `width` (或 `inline-size`) ，和 `height` （或 `block-size`）属性值来决定 Flex 项目尺寸。当 Flex 容器有剩余空间时，Flex 项目并不会扩展填满整个 Flex 容器，但当 Flex 容器有不足空间时，Flex 项目会收缩到其最小值，即 `min-content` 。

- `flex: auto` 和 `flex: 1 1 auto` 相同。Flex 项目会根据 `width`（或 `inline-size`），和 `height`（或 `block-size`）来决定大小，但是完全可以扩展 Flex 容器剩余的空间。

- `flex: none` 和 `flex: 0 0 auto` 相同。 Flex 项目会根据 `width`（或 `inline-size`） ，和 `height` (或 `block-size`) 来决定大小，但是完全不可伸缩。

- `flex: <positive-number>`（正数）和 `flex: 1 0px` 相同。Flex 项目可伸缩，并将 `flex-basis` 值设置为 `0` （需要带有效的 `<length>` 或 `<percentage>` 单位），导致 Flex 项目会根据设置的比例因子来计算 Flex 容器的剩余空间。Flex 项目按比例扩展或收缩。

![[_attachment/img/f3f4b88e9d66c44e83c8e3a040326ee3_MD5.gif]]

> Demo 地址：[codepen.io/airen/full/…](https://codepen.io/airen/full/vYjmENe)

## flex 空间计算

为了能帮助大家更好地理解 `flex-grow` 、`flex-shrink` 和 `flex-basis` 的计算，我们通过下面这个简单的示例着手：

```html
<div class="container">
  <!-- Flex 项目 A -->
  <div class="item"><span>A</span>longlonglongword</div>
  <!-- Flex 项目 B -->
  <div class="item"><span>B</span>ook</div>
  <!-- Flex 项目 C -->
  <div class="item"><span>C</span>ountries in the east</div>
  <!-- Flex 项目 D -->
  <div class="item"><span>D</span>iscuss</div>
  <!-- Flex 项目 E -->
  <div class="item"><span>E</span>astern</div>
</div>
```

```css
.container {
  display: flex;
  inline-size: 1000px;
  font-size: 1.5rem;
}

.item span {
  font-size: 3rem;
}
```

示例中有一个 Flex 容器 `.container` ，它的宽度是 `1000px` （设置了 `inline-size`），并且这个 Flex 容器包含了 **五个 Flex 项目** ，我们分别以字母开头来对其命名，即 **A** 、**B** 、**C** 、 **D** 和 **E** 。

在代码中没有给任何 Flex 项目显式设置尺寸（`width` 、`inline-size` 或 `flex-basis` 等），所以它们的尺寸分别是由每个 Flex 项目所在内容的最大宽度（`max-content`）来决定的，不过它们会受文本相关属性值的影响，比如 `font-size` 、`font-family` （[字形的宽度或高度](https://en.wikipedia.org/wiki/Glyph)）、特定单词和文本的长度（比如长字符单词）、Flex 项目包含元素固有或指定的大小（比如示例中的 `span` 元素）：

- Flex 容器可用空间是 `1000px` ；
- Flex 项目 A 的宽度约是 `237.56px`；
- Flex 项目 B 的宽度约是 `70.26px`；
- Flex 项目 C 的宽度约是 `243.30px`；
- Flex 项目 D 的宽度约是 `100.69px` ；
- Flex 项目 E 的宽度约是 `100.11px` ；
- Flex 容器的剩余空间约是 `248.08px` 。

![[_attachment/img/31ad5e52948b5ed089d4766ebe40cd12_MD5.png]]

在此基础上，所有 Flex 项目的 `flex-basis` 都是初始值，即 `auto` ，`width` （或 `inline-size`）也是初始值 `auto` 。

> 注意，接下来的示例都以 `flex-direction` 为 `row` 展开，即只围绕着 Flex 项目的宽度计算为例！

### flex-grow 的计算

先来看 `flex-grow` 的计算。

首先，我们在所有 Flex 项目上显式设置 `flex` 的值为 `1` ：

```css
.item {
  flex: 1;
}
```

通过前面的内容我们可以得知，`flex:1` 相当于：

```css
.item {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0%;
}
```

由于所有 Flex 项目的内容宽度总和（`751.92px`）小于 Flex 容器宽度（`1000px`）。结果，浏览器使用 `flex-grow` 的值作为 Flex 项目的扩展因子，每个 Flex 项目按扩展因子的比率瓜分了 Flex 容器的剩余空间（`248.08px`）。 此示例中的每个 Flex 项目都有一个 `flex-grow` 值为 `1` 和一个 `flex-basis` 值为 `0` 。

在此基础上，浏览器会按下面这个公式循环遍历每一个 Flex 项目以确定其灵活性（**flexibility** ）：

![[_attachment/img/d85c07338e3a5ce55f7702f4d328e9a8_MD5.png]]

> **注意，这里所说的灵活性（Flexibility）指运用于 Flex 项目的一个弹性值，有可能是加上这个弹性值，也有可能是减去这个弹性值。即可增加或减少的一个弹性量** 。

这个“Flex 项目的灵活性（弹性量）” 并不是 Flex 项目的具体宽度，需要在该计算出来的值基础上，加上 Flex 项目的 `flex-basis` （或 `width` 或 `inline-size`）才是 Flex 项目的最终宽度值：

![[_attachment/img/d9d21a2f72910b36ff0163cd177db99b_MD5.png]]

浏览器会根据该公式循环遍历计算 Flex 项目的灵活性（弹性量）。先根据公式来计算 **Flex 项目** _**A**_ 的灵活性。

```
Flex 项目 A的灵活性 = (Flex 容器的剩余空间  ÷ 所有 Flex 项目扩展因子 flex-grow 值总和 × 当前 Flex 项目自身的扩展因子 flex-grow

Flex 项目 A 的灵活性 = （1000px ÷ 5) × 1 = 200px
```

> **需要注意的是，当 Flex 项目未显式设置** **`flex-basis`** **、** **`width`** **或** **`inline-size`** **属性值时，浏览器将以 Flex 项目的内容长度（**`max-content`**）视为 Flex 项目的基础尺寸，但 Flex 容器的剩余空间等于 Flex 容器的可用空间** 。

Flex 项目 A 具有 `200px` 的灵活性（弹性量）。接下来，将此灵活性值添加到 Flex 项目 A 的 `flex-basis` 值上，它的值是 `0` ，即：

```
Flex 项目 A 计算后的宽度（flex-basis） = 0 + 200px = 200px
```

按理说，根据计算 Flex 项目 A 的 `flex-basis` 值应该是 `200px` ，即它的宽度是 `200px` ，但由于其内容是一个长单词（"Alonglonglongword"），该词的最大内容长度大约是 `237.56px` 。浏览器没有将 Flex 项目 A 的大小设置为 `200px` ，而是将其宽度限制为 `237.56px` 的最小内容大小。

只有计算完 Flex 项目 A 之后，浏览器才会开始来计算 Flex 项目 B。减去 Flex 项目 A 计算出来的宽度值之后，Flex 容器的可用空间大约还有 `762.44px` ，分布在 Flex 项目 B、C、D 和 E 中。

按计算 Flex 项目 A 的方式来计算 Flex 项目 B 宽度：

```
Flex 项目 B 的灵活性 = (Flex 容器的剩余空间  ÷ 所有 Flex 项目扩展因子 flex-grow 值总和 × 当前 Flex 项目自身的扩展因子 flex-grow

Flex 项目 B 的灵活性 = （762.44px ÷ 4) × 1 = 190.61px

Flex 项目 B 计算后的宽度（flex-basis） = 0 + 190.61px = 190.61px
```

按同样的方式，可以计算出 Flex 项目 C 、 Flex 项目 D 和 Flex 项目 E 的宽度：

```
Flex 项目 C 计算后的宽度 = ((1000px - 237.56px - 190.61px) ÷ 3 ) × 1 + 0 = 190.61px

Flex 项目 D 计算后的宽度 = ((1000px - 237.56px - 190.61px - 190.61px) ÷ 2 ) × 1 + 0 = 190.61px

Flex 项目 E 计算后的宽度 =  ((1000px - 237.56px - 190.61px - 190.61px - 190.61px) ÷ 1 ) × 1 + 0 = 190.61px
```

![[_attachment/img/228cfef6b6c8030e480e2bff8ba56338_MD5.png]]

如果你使用的是 Firefox 浏览器，使用开发者调试工具，可以很清楚看到每个 Flex 项目的计算前后的几个重要参数，比如内容宽度 `flex-basis` （未显式设置都是 `0`）、每个 Flex 项目的弹性量（**Flexibility**）和每个 Flex 项目计算后的宽度：

![[_attachment/img/2d6daecb13c4afad8daab53a879f1bf0_MD5.gif]]

你可能认为，你已经知道 Flex 项目如何根据 `flex-grow` 来扩展 Flex 项目的尺寸（`width` 或 `inline-size`）了。如果你这么认为，那就太小看 Flex 项目计算了。上面仅仅是其中一种情况，即 `flex-grow:1` 和 `flex-basis: 0%` 且未在 Flex 项目上显式设置任何与尺寸有关的属性（比如 `width` 或 `inline-size` ）。

如果我们把前面示例中的 `flex:1` 更换成 `flex: 1 160px` ：

```css
.item {
  flex: 1 160px;

  /* 等同于 */
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 160px;
}
```

尝试着按照前面的计算公式来进行计算，需要注意的是，前面示例中我们未显式设置 `flex-basis` 的值，浏览器会视其为 `0%` ，此时浏览器将 Flex 容器的剩余空间计算为 `1000px` 。但我们这个示例中，显式设置了 `flex-basis` 的值为 `160px` ，那么对应的 Flex 容器的剩余空间就是 `200px` （即 `(1000px - 160px × 5) = 200px` )。

同样先计算 Flex 项目 A :

```
Flex 项目 A 的灵活性 = (Flex 容器的剩余空间  ÷ 所有 Flex 项目扩展因子 flex-grow 值总和 × 当前 Flex 项目自身的扩展因子 flex-grow

Flex 项目 A 的灵活性 = （200px ÷ 5) × 1 = 40px

Flex 项目 A 计算后的宽度（flex-basis） = 160px + 40px = 200px
```

同样的，因为 Flex 项目 A 的内容是一个长单词，它最终会以其内容的最小尺寸为准（即 `min-content`），大约是 `237.56px` 。接着浏览器将按同样的方式循环遍历每个 Flex 项目：

```
Flex 项目 B 计算后的宽度 = ((1000px - 237.56px) - 160px × 4) ÷ 4 × 1 + 160px = 190.61px

Flex 项目 C 计算后的宽度 = ((1000px - 237.56px - 190.61px) - 160px × 3) ÷ 3 × 1 + 160px = 190.61px

Flex 项目 D 计算后的宽度 =  ((1000px - 237.56px - 190.61px - 190.61px) - 160px × 2) ÷ 2 × 1 + 160px = 190.61px

Flex 项目 E 计算后的宽度 =  ((1000px - 237.56px - 190.61px - 190.61px - 190.61px) - 160px × 1) ÷ 1 × 1 + 160px = 190.61px
```

![[_attachment/img/4eed0f7d385e078ea4acc41a5a3dfe83_MD5.gif]]

> Demo 地址：[codepen.io/airen/full/…](https://codepen.io/airen/full/NWMjvym)

接着再来看另一个情景，给所有 Flex 项目显式设置 `flex:1` ，并且显式设置 `width` 或 `inline-size` 属性的值为 `160px` ：

```css
.item {
  flex: 1;
  width: 160px;

  /* flex 等同于 */
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0%;
}
```

通过前面的内容，我们可以知道，浏览器计算出来的 Flex 项目的 `flex-basis` 值将会是：

```
Flex 项目 A 的灵活性 = (Flex 容器的剩余空间  ÷ 所有 Flex 项目扩展因子 flex-grow 值总和 × 当前 Flex 项目自身的扩展因子 flex-grow

Flex 项目 A 的灵活性 = （1000px ÷ 5) × 1 = 200px

Flex 项目 A 计算后的宽度（flex-basis） = 0 + 200px = 200px

Flex 项目 B 计算后的宽度（flex-basis） = ((1000px - 200px）÷ 4) × 1 = 200px
Flex 项目 C 计算后的宽度（flex-basis） = ((1000px - 200px - 200px）÷ 3) × 1 = 200px
Flex 项目 D 计算后的宽度（flex-basis） = ((1000px - 200px - 200px - 200px）÷ 2) × 1 = 200px
Flex 项目 E 计算后的宽度（flex-basis） = ((1000px - 200px - 200px - 200px -200px）÷ 1) × 1 = 200px
```

这个示例中和前面只在 Flex 项目上显式设置 `flex:1` 有一点不同之处，那就是显式设置了 Flex 项目的宽度是 `160px` ，所以 Flex 项目 A 的 `flex-basis` 计算出来之后等于 `200px` ，它比 `160px` 大，这个时候浏览器将 `flex-basis` 计算后的值视为其宽度值。

![[_attachment/img/3f41b3a900f168100b78a8f0ee746992_MD5.gif]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/WNJjZao)

如果你将 `width:160px` 换成 `width: 260px` （它已经大于 Flex 项目 A 的 `min-content` 值）。你会发现，Flex 项目 A 的 `flex-basis` 计算出来之后是 `200px` ，但浏览器最终计算出来的 Flex 项目 A 宽度，最终以 Flex 项目 A 的内容的最小尺寸（`min-content` ）为准，大约 `237.52px` 。

![[_attachment/img/fb0c2792e6361fcafba469c0e2ca7114_MD5.png]]

这两个示例告诉我们，当 Flex 项目显式设置了 `flex:1` 和具体的 `width` 值时，如果浏览器计算出来的 `flex-basis` 大于 Flex 项目的最小内容尺寸（`min-content`） 时，将以 `flex-basis` 计算出来的值作为 Flex 项目的宽度；反之，如果计算出来的 `flex-basis` 小于 Flex 项目的最小内容尺寸（`min-content`）时，浏览器会把 Flex 项目的最小内容尺寸（`min-content`）作为 `flex-basis` 的最终值，也将其作为该 Flex 项目的宽度。

你可以尝试着将 `flex: 1 160px` 和 `width: 160px` ，或 `flex: 1 160px` 和 `width: 260px` 运用到示例中的 Flex 项目上：

```css
.item {
  flex: 1 160px;
  width: 160px;

  /* flex 属性等同于 */
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 160px;
}

/* 或 */
.item {
  flex: 1 160px;
  width: 260px;

  /* flex 属性等同于 */
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 160px;
}
```

最终它的效果和在 Flex 项目上设置 `flex:1` 和 `width: 160px` 是等同的，只是计算出来的弹性量不同，但最终计算出来的 `flex-basis` 是一样的，它们都忽略了 Flex 项目的 `width` 。

![[_attachment/img/afaf0e88fe7339276c1699cc99dfeda2_MD5.gif]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/XWqRVZd)

这几个示例从侧面也回答了刚才提到的一点，为什么 `flex:1` 并不能在所有的场景中，让 Flex 项目均分 Flex 容器的空间。就这一点而言，[W3C 规范也是有相应描述的](https://www.w3.org/TR/css-flexbox-1/)：

> By default, flex items won’t shrink below their minimum content size (the length of the longest word or fixed-size element). To change this, set the min-width or min-height property.

大致的意思就是说，**默认情况之下，Flex 项目（即设置了 `flex:1` ）在收缩的时候，其宽度也不会小于其最小内容尺寸（`min-content`）或固定尺寸元素。如果要改变这一点，需要在 Flex 项目上显示设置最小宽度 `min-width` (或 `min-inline-size`)， 或最小高度 `min-height`（或 `min-block-size`）的值，一般将其设置为 `0`** 。 ^386ac5

你可能已经发现了，前面的示例有一个共同的特性，那就是 `flex-basis` 的值为 `0` ，或者一个指定的长度值（`<length-perentage>`）。比如：

```css
.item {
  flex: 1;

  /* 等同于 */
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0%; /* 浏览器将 flex-basis 计算为 0% */
}

.item {
  flex: 1 160px;

  /* 等同于 */
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 160px; /* 显式指定 flex-basis 的值为 160px */
}
```

那么当 `flex-basis` 的值为 `auto` 的时候，Flex 项目又是如何计算的呢？

如果你在 Flex 项目显式设置了 `flex: auto` 时，相当于显式指定了 `flex-basis` 属性的值为 `auto` ，即：

```css
.item {
  flex: auto; /* 等同于 flex: 1 auto */

  /* 等同于 */
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: auto;
}
```

当 `flex-basis` 取值为 `auto` 时，它的表现形式有点类似于元素的 `width` 或 `inline-size` 显式设置了值为 `auto` ，它的大小会根据元素的上下文或内容最大长度来决定。

但在 Flexbox 布局中，Flex 项目的 `flex-basis` 值为 `auto` 时，它的大小由 Flex 项目的最大内容长度（即 `max-content`）来决定。这个时候，示例中的每个 Flex 项目对应的 `flex-basis` 相当于 `237.56px` 、`70.26px` 、`243.30px` 、`100.69px` 和 `100.11px` 。

将相应的变量套到 `flex-grow` 计算公式中：

```
Flex 项目 A 的灵活性 = (Flex 容器的剩余空间  ÷ 所有 Flex 项目扩展因子 flex-grow 值总和 × 当前 Flex 项目自身的扩展因子 flex-grow

Flex 项目 A 的灵活性 = (1000px - 237.52px - 70.26px - 243.30px - 100.69px - 100.11px) ÷ 5 × 1 = 49.62px

Flex 项目 A 计算后的宽度（flex-basis） = 237.56px + 49.62px = 287.18px

Flex 项目 B 计算后的宽度（flex-basis） = (1000px - 287.18px - 70.26px - 243.30px - 100.69px - 100.11px) ÷ 4 × 1 + 70.26px = 119.88px
Flex 项目 C 计算后的宽度（flex-basis） = (1000px - 287.18px - 119.88px - 243.30px - 100.69px - 100.11px) ÷ 3 × 1 + 243.30px = 292.92px
Flex 项目 D 计算后的宽度（flex-basis） = (1000px - 287.18px - 119.88px - 292.92px - 100.69px - 100.11px) ÷ 2 × 1 + 100.69px = 150.31px
Flex 项目 E 计算后的宽度（flex-basis） = (1000px - 287.18px - 119.88px - 292.92px - 150.31px - 100.11px) ÷ 1 × 1 + 100.11px = 149.73px
```

![[_attachment/img/499a73e0570cde03affcf5e5b19ebd9c_MD5.gif]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/XWqREWP)

但当 `flex-basis: auto` 碰到 Flex 项目显式设置了长度尺寸，比如 `width` 或 `inline-size` 时，此时的 `auto` 计算出来的值就是对应的 `width` 或 `inline-size` 的值：

```css
.item {
  flex: auto;
  width: 160px;

  /* 等同于 */
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: auto; /* 每个 Flex 项目的 flex-basis 初始值等于 width */
}
```

计算之后：

```
Flex 项目 A 的灵活性 = (Flex 容器的剩余空间  ÷ 所有 Flex 项目扩展因子 flex-grow 值总和 × 当前 Flex 项目自身的扩展因子 flex-grow

Flex 项目 A 的灵活性 = (1000px - 160px × 5) ÷ 5 × 1 = 40px

Flex 项目 A 计算后的宽度（flex-basis） = 160px + 40px = 200px

Flex 项目 B 计算后的宽度（flex-basis） = (1000px - 200px - 160px × 4) ÷ 4 × 1 + 160px = 200px
Flex 项目 C 计算后的宽度（flex-basis） = (1000px - 200px - 200px - 160px × 3) ÷ 3 × 1 + 160px = 200px
Flex 项目 D 计算后的宽度（flex-basis） = (1000px - 200px - 200px - 200px - 160px × 2) ÷ 2 × 1 + 160px = 200px
Flex 项目 E 计算后的宽度（flex-basis） = (1000px - 200px - 200px - 200px - 200px - 160px × 1) ÷ 1 × 1 + 160px = 200px
```

![[_attachment/img/29dd7ce08867946fbe48636215356e77_MD5.gif]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/poVPLQx)

其实 `flex-grow` 计算，还可以将上面的公式简化一下，但它有一个条件，即 **设置了** **`flex`** **属性的 Flex 项目同时显式设置了** **`width`** **或** **`inline-size`** **，以及** **`flex-basis`** **属性值为** **`auto`** **时，** 可以按下面这个简化公式计算每个 Flex 项目的尺寸：

![[_attachment/img/be38d5d6d8396116d0037b0d504f7213_MD5.png]]

前面所提到的 `flex-grow` 计算，都是基于 `flex` 简写属性展开的，它们的计算和单独只在 Flex 项目上显式设置一个 `flex-grow` 属性还是有所不同的。比如：

```css
.flex {
  flex: 1;

  /* 等同于 */
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0%; /* 浏览器计算值 */
}

.flex-grow {
  flex-grow: 1;

  /* 等同于 */
  flex-grow: 1;
  flex-shrink: 1; /* flex-shrink 的初始值为 1 */
  flex-basis: auto; /* flex-basis 的初始值为 auto */
}
```

**仅在 Flex 项目显式设置** **`flex-grow`** **一个属性时，它的计算方式类似于** **`flex: auto`** ：

![[_attachment/img/69cdebc74decbad4178c6259b4e05d26_MD5.gif]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/ZEoKoJY)

除此之外，可以根据需要给每个 Flex 项目的 `flex-grow` 属性设置不同的值。比如：

```css
.item {
  flex-grow: var(--flex-grow, 0);
}

.item:nth-child(1) {
  --flex-grow: 0;
}

.item:nth-child(2) {
  --flex-grow: 1;
}

.item:nth-child(3) {
  --flex-grow: 2;
}

.item:nth-child(4) {
  --flex-grow: 3;
}

.item:nth-child(5) {
  --flex-grow: 4;
}
```

Flex 项目的 `flex-grow` 设置不同的值时，表示每个 Flex 项目的扩展比率是不相同的，也就是说瓜分 Flex 容器剩余空间就不相等了。**`flex-grow`** **值越大，所占的比例就越大** 。我们分别来看，`flex-grow` 取值不同时，它的计算：

```
Flex 项目的 flex-grow 总和 =  (0 + 1 + 2 + 3 + 4) = 10
Flex 项目的灵活性 = (Flex 容器的剩余空间  ÷ 所有 Flex 项目扩展因子 flex-grow 值总和 × 当前 Flex 项目自身的扩展因子 flex-grow

// 案例1
// Flex 项目的 flex-basis: auto;

Flex 项目 A 的弹性值 = (1000px - 237.52px - 70.26px - 243.30px - 100.69px - 100.11px) ÷ (0 + 1 + 2 + 3 + 4) × 0 = 0px
Flex 项目 A 计算后的 flex-basis 值 = 237.52px + 0 = 237.52px

Flex 项目 B 的弹性值 = (1000px - 237.52px - 70.26px - 243.30px - 100.69px - 100.11px) ÷ (1 + 2 + 3 + 4) × 1 = 24.81px
Flex 项目 B 计算后的 flex-basis 值 = 70.26px + 24.81px = 95.07px

Flex 项目 C 的弹性值 = (1000px - 237.52px - 95.07px - 243.30px - 100.69px - 100.11px) ÷ (2 + 3 + 4) × 2  = 49.62px
Flex 项目 C 计算后的 flex-basis 值 = 243.30px + 49.62px = 292.92px

Flex 项目 D 的弹性值 = (1000px - 237.52px - 95.07px - 292.92px - 100.69px - 100.11px) ÷ (3 + 4) × 3 = 74.44px
Flex 项目 D 计算后的 flex-basis 值 = 100.69px + 74.44px = 175.13px

Flex 项目 E 的弹性值 = (1000px - 237.52px - 95.07px - 292.92px - 175.13px - 100.11px) ÷ 4 × 4  = 99.25px
Flex 项目 E 计算后的 flex-basis 值 = 100.11px + 99.25px = 199.36px

// 案例2
// Flex 项目的 flex-basis: auto; width: 160px

Flex 项目 A 的弹性值 = (1000px - 160px × 5) ÷ (0 + 1 + 2 + 3 + 4) × 0 = 0px
Flex 项目 A 计算后的 flex-basis 值 = 160px + 0 = 160px

Flex 项目 B 的弹性值 = (1000px - 160px - 160px × 4) ÷ (1 + 2 + 3 + 4) × 1 = 20px
Flex 项目 B 计算后的 flex-basis 值 = 160px + 20px = 180px

Flex 项目 C 的弹性值 = (1000px - 160px - 180px - 160px × 3) ÷ (2 + 3 + 4) × 2 = 40px
Flex 项目 C 计算后的 flex-basis 值 = 160px + 40px = 200px

Flex 项目 D 的弹性值 = (1000px - 160px - 180px - 200px - 160px × 2) ÷ (3 + 4) × 3 = 60px
Flex 项目 D 计算后的 flex-basis 值 = 160px + 60px = 220px

Flex 项目 E 的弹性值 = (1000px - 160px - 180px - 200px - 220px - 160px) ÷ 4 × 4 = 80px
Flex 项目 E 计算后的 flex-basis 值 = 160px + 80px = 240px

// 案例1和2对应的 Demo 地址： https://codepen.io/airen/full/GRdmdbw


// 案例3
// Flex 项目的 flex-basis: 0;

Flex 项目 A 的弹性值 = 1000 ÷ (0 + 1 + 2 + 3 + 4) × 0 = 0px
Flex 项目 A 计算后的 flex-basis 值 = 237.5px + 0 = 237.5px (Flex 项目 A 的 min-content)

Flex 项目 B 的弹性值 = (1000px - 237.5px) ÷ (1 + 2 + 3 + 4) × 1  = 76.25px
Flex 项目 B 计算后的 flex-basis 值 = 70.25px + 0 = 70.25px

Flex 项目 C 的弹性值 = (1000px - 237.5px - 76.25px) ÷ (2 + 3 + 4) × 2  = 152.5px
Flex 项目 C 计算后的 flex-basis 值 = 152.5px + 0 = 152.5px

Flex 项目 D 的弹性值 = (1000px - 237.5px - 76.25px - 152.5px) ÷ (3 + 4) × 3 = 228.75px
Flex 项目 D 计算后的 flex-basis 值 = 228.75px + 0 = 228.75px

Flex 项目 E 的弹性值 = (1000px - 237.5px - 76.25px - 152.5px - 228.75px) ÷ 4 × 4  = 305px
Flex 项目 E 计算后的 flex-basis 值 =  305px + 0 = 305px

// 案例4
// Flex 项目的 flex-basis: 0; width: 160px

Flex 项目 A 的弹性值 = 1000px ÷ (0 + 1 + 2 + 3 + 4) × 0 =0px
Flex 项目 A 计算后的 flex-basis 值 = 160px + 0 = 160px (Flex项目 A 不扩展，取其 width 值)

Flex 项目 B 的弹性值 = (1000px - 160px) ÷ (1 + 2 + 3 + 4) × 1  = 84px
Flex 项目 B 计算后的 flex-basis 值 = 84px + 0 = 84px

Flex 项目 C 的弹性值 = (1000px - 160px - 84px) ÷ (2 + 3 + 4) × 2 = 168px
Flex 项目 C 计算后的 flex-basis 值 = 168px + 0 = 168px

Flex 项目 D 的弹性值 = (1000px - 160px - 84px - 168px) ÷ (3 + 4) × 3  = 252px
Flex 项目 D 计算后的 flex-basis 值 = 252px + 0 = 252px

Flex 项目 E 的弹性值 = (1000px - 160px - 84px - 168px - 252px) ÷ 4 × 4  = 336px
Flex 项目 E 计算后的 flex-basis 值 = 336px + 0 = 336px

// 案例3 和 4 对应的 Demo 地址：https://codepen.io/airen/full/bGMRpZp


// 案例5
// 所有 Flex 项目的 flex-basis: 160px

Flex 项目 A 的弹性值 = (1000px - 160px × 5) ÷ (0 + 1 + 2 + 3 + 4) × 0 = 0px
Flex 项目 A 计算后的 flex-basis = 237.5px + 0 = 237.5px （不扩展，取其内容最小尺寸 min-content）

Flex 项目 B 的弹性值 = (1000px - 237.5px - 160px × 4) ÷ (1 + 2 + 3 + 4) × 1 = 12.25px
Flex 项目 B 计算后的 flex-basis 值 = 160px + 12.25px = 172.25px

Flex 项目 C 的弹性值 = (1000px - 237.5px - 172.25px - 160px × 3) ÷ (2 + 3 + 4) × 2 = 24.5px
Flex 项目 C 计算后的 flex-basis 值 = 160px + 24.5px = 184.5px

Flex 项目 D 的弹性值 = (1000px - 237.5px - 172.25px - 184.5px - 160 × 2) ÷ (3 + 4) × 3 = 36.75px
Flex 项目 D 计算后的 flex-basis 值 = 160px + 36.75px = 196.75px

Flex 项目 E 的弹性值 = (1000px - 237.5px - 172.25px - 184.5px - 196.75px - 160px) ÷ 4 × 4 = 49px
Flex 项目 E 计算后的 flex-basis 值 = 160px + 49px = 209px

// 案例6
// 所有 Flex 项目的 flex-basis: 160px; width: 160px
Flex 项目 A 的弹性值 = (1000px - 160px × 5) ÷ (0 + 1 + 2 + 3 + 4) × 0 = 0px
Flex 项目 A 计算后的 flex-basis = 160px + 0 = 160px （不扩展，取其 width 属性值）

Flex 项目 B 的弹性值 = (1000px - 160px - 160px × 4) ÷ (1 + 2 + 3 + 4) × 1 = 20px
Flex 项目 B 计算后的 flex-basis 值 = 160px + 20px = 180px

Flex 项目 C 的弹性值 = (1000px - 160px - 180px - 160px × 3) ÷ (2 + 3 + 4) × 2 = 40px
Flex 项目 C 计算后的 flex-basis 值 = 160px + 40px = 200px

Flex 项目 D 的弹性值 = (1000px - 160px - 180px - 200px - 160px × 2) ÷ (3 + 4) × 3 = 60px
Flex 项目 D 计算后的 flex-basis 值 = 160px + 60px = 220px

Flex 项目 E 的弹性值 = (1000px - 160px - 180px - 200px - 220px - 160px) ÷ 4 × 4 = 80px
Flex 项目 E 计算后的 flex-basis 值 = 160px + 80px = 240px

// 案例 5 和 6 的 Demo 地址： https://codepen.io/airen/full/GRdEqqp
```

在给 Flex 项目设置 `flex-grow` 属性的值时，除了像前面的示例展示的那样，设置一个 **正整数** 之外，还可以 **给** **`flex-grow`** **设置一个小数值** ，比如：

```css
// Demo 1:
.item {
  flex-grow: 0.1;

  /* 等同于 */
  flex-grow: 0.1;
  flex-shrink: 1;
  flex-basis: auto;
}

// Demo 2:
.item {
  flex-grow: var(--flex-grow, 0.1);
}

.item:nth-child(2) {
  --flex-grow: 0.2;
}

.item:nth-child(3) {
  --flex-grow: 0.3;
}

.item:nth-child(4) {
  --flex-grow: 0.4;
}

.item:nth-child(5) {
  --flex-grow: 0.5;
}
```

上面两个示例中，第一个示例中的所有 Flex 项目的 `flex-grow` 属性的值和是 `0.5`（即 `0.1 + 0.1 + 0.1 + 0.1 + 0.1 = 0.5` ），**它们（`flex-grow`** **）的总和小于** **`1`** ；第二个示例中的所有 Flex 项目的 `flex-grow` 属性的值和是 `1.5` （即 `0.1 + 0.2 + 0.3 + 0.4 + 0.5 = 1.5`），**它们（`flex-grow`）的总和大于** **`1`** 。

两者最大的差异就是 **所有 Flex 项目的** **`flex-grow`** **总和如果小于** **`1`** **，Flex 容器剩余空间还会有余留； `flex-grow`** **大于或等于**`1`**时，Flex 容器的剩余空间不会有余留** ：

![[_attachment/img/8dcf88474cb9f4d34d1a347a0673d794_MD5.png]]

可能有同学会问，`flex-grow` 取值为小数值时，它又是如何计算呢？

它的计算分两种情况，当所有 Flex 项目 `flex-grow` 值的和小于 `1` 时，将按照下面的公式来计算：

![[_attachment/img/3c3296df3728fc2ab1e0b6dbee3d1340_MD5.png]]

由于 Flex 容器的剩余空间分不完，所以不需要像前面的示例那样去循环遍历每一个 Flex 项目。简单地说，**当所有 Flex 项目的** **`flex-grow`** **属性值的总和小于等于** **`1`** **时， Flex 项目的灵活性（弹性值 Flexibility）会等于 Flex 容器的剩余空间乘以当前 Flex 项目自身的扩展因子** **`flex-grow`** **值**：

```
Flex 项目的 flex-grow 总和 =  (0.1 + 0.1 + 0.1 + 0.1 + 0.1) = 0.5 < 1
Flex 项目的灵活性 = (Flex 容器的剩余空间  × 当前 Flex 项目自身的扩展因子 flex-grow
Flex 容器的剩余空间 = 1000px - 237.52px - 70.26px - 243.30px - 100.69px - 100.11px = 248.12px

Flex 项目 A 的弹性值 = 248.12px × 0.1 = 24.81px
Flex 项目 A 计算后的 flex-basis 值 = 237.52px + 24.81px = 262.33px

Flex 项目 B 的弹性值 = 248.12px × 0.1 = 24.81px
Flex 项目 B 计算后的 flex-basis 值 = 70.26px + 24.81px = 95.07px

Flex 项目 C 的弹性值 = 248.12px × 0.1 = 24.81px
Flex 项目 C 计算后的 flex-basis 值 = 243.30px + 24.81px = 268.11px

Flex 项目 D 的弹性值 = 248.12px × 0.1 = 24.81px
Flex 项目 D 计算后的 flex-basis 值 = 100.69px + 24.81px = 125.5px

Flex 项目 E 的弹性值 =  248.12px × 0.1 = 24.81px
Flex 项目 E 计算后的 flex-basis 值 = 100.11px + 24.81px = 124.92px
```

![[_attachment/img/bac62351cfe20ab5f26c73f87b8b6798_MD5.gif]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/eYrRdLN)

将上面示例稍微调整一下，让它们的 `flex-grow` 值的总和等于 `1` ：

```css
.item {
  flex-grow: var(--flex-grow, 0);
}

.item:nth-child(2) {
  --flex-grow: 0.2;
}

.item:nth-child(3) {
  --flex-grow: 0.2;
}

.item:nth-child(4) {
  --flex-grow: 0.3;
}

.item:nth-child(5) {
  --flex-grow: 0.3;
}
```

它的计算和所有 Flex 项目的 `flex-grow` 值总和小于 `1` 的计算方式是一样的：

```
Flex 项目的 flex-grow 总和 =  (0 + 0.2 + 0.2 + 0.3 + 0.3) = 1
Flex 项目的灵活性 = (Flex 容器的剩余空间  × 当前 Flex 项目自身的扩展因子 flex-grow
Flex 容器的剩余空间 = 1000px - 237.52px - 70.26px - 243.30px - 100.69px - 100.11px = 248.12px

Flex 项目 A 的弹性值 = 248.12px × 0 = 0px
Flex 项目 A 计算后的 flex-basis 值 = 237.52px + 0px = 237.52px

Flex 项目 B 的弹性值 = 248.12px × 0.2 = 49.62px
Flex 项目 B 计算后的 flex-basis 值 = 70.26px + 49.62px = 119.88px

Flex 项目 C 的弹性值 = 248.12px × 0.2 = 49.62px
Flex 项目 C 计算后的 flex-basis 值 = 243.30px + 49.62px = 292.92px

Flex 项目 D 的弹性值 = 248.12px × 0.3 = 74.44px
Flex 项目 D 计算后的 flex-basis 值 = 100.69px + 74.44px = 175.13px

Flex 项目 E 的弹性值 =  248.12px × 0.3 = 74.44px
Flex 项目 E 计算后的 flex-basis 值 = 100.11px + 74.44px = 174.55px
```

![[_attachment/img/4c94f03e8a0298c45651b25e2e9c49ee_MD5.gif]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/oNdwBWK)

当然，`flex-grow` 取值小于 `1` 时，它们的总和也有可能会是大于 `1` 的，比如：

```css
.item {
  flex-grow: var(--flex-grow, 0.1);
}

.item:nth-child(2) {
  --flex-grow: 0.2;
}

.item:nth-child(3) {
  --flex-grow: 0.3;
}

.item:nth-child(4) {
  --flex-grow: 0.4;
}

.item:nth-child(5) {
  --flex-grow: 0.5;
}
```

当所有 Flex 项目的 `flex-grow` 属性值总和大于 `1` 时，对于 `flex-grow` 的计算就需要用到前面所说的循环遍历的方式来计算了：

```
Flex 项目的 flex-grow 总和 =  (0.1 + 0.2 + 0.3 + 0.4 + 0.5) = 1.5 > 1
Flex 项目的灵活性 = (Flex 容器的剩余空间  ÷ 所有 Flex 项目扩展因子 flex-grow 值总和 × 当前 Flex 项目自身的扩展因子 flex-grow

Flex 容器的剩余空间 = 1000px - 237.52px - 70.26px - 243.30px - 100.69px - 100.11px = 248.12px

Flex 项目 A 的弹性值 = (1000px - 237.52px - 70.26px - 243.30px - 100.69px - 100.11px) ÷ (0.1 + 0.2 + 0.3 + 0.4 + 0.5) × 0.1 = 16.54px
Flex 项目 A 计算后的 flex-basis 值 = 237.52px + 16.54px = 254.06px

Flex 项目 B 的弹性值 = (1000px - 254.06px - 70.26px - 243.30px - 100.69px - 100.11px) ÷ (0.2 + 0.3 + 0.4 + 0.5) × 0.2 = 33.08px
Flex 项目 B 计算后的 flex-basis 值 = 70.26px + 33.08px = 103.34px

Flex 项目 C 的弹性值 = (1000px - 254.06px - 103.34px - 243.30px - 100.69px - 100.11px) ÷ (0.3 + 0.4 + 0.5) × 0.3 = 49.63px
Flex 项目 C 计算后的 flex-basis 值 = 243.30px + 49.63px = 292.93px

Flex 项目 D 的弹性值 = (1000px - 254.06px - 103.34px - 292.93px - 100.69px - 100.11px) ÷ (0.4 + 0.5) × 0.4 = 66.16px
Flex 项目 D 计算后的 flex-basis 值 = 100.69px + 66.16px = 166.85px

Flex 项目 E 的弹性值 =  (1000px - 254.06px - 103.34px - 292.93px - 166.85px - 100.11px) ÷  0.5  × 0.5 = 82.71px
Flex 项目 E 计算后的 flex-basis 值 = 100.11px + 82.71px = 182.82px
```

![[_attachment/img/b091cb4e97362d2966d28996b718f019_MD5.gif]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/NWMgdza)

如此一来，Flexbox 布局中的 `flex-grow` 计算公式就分为两个部分：

![[_attachment/img/ab1b42940792ba30ccc5927ac3acd8d2_MD5.png]]

再次强制一下，**当所有 Flex 项目的** **`flex-grow`** **属性值总和小于** **`1`** **时，Flex 容器剩余空间是分不完的** :

![[_attachment/img/1858fdab32840e2123cece0d0f83c2af_MD5.png]]

#### 小结

有关于 Flex 项目中 `flex-grow` 计算。这里简单总结一下：

- 只有 Flex 容器有剩余空间，且 `flex-grow` 值不为 `0` 时，Flex 项目才会按照扩展因子（`flex-grow` 值）比率来分割 Flex 容器的剩余空间。
- 如果 Flex 容器中所有 Flex 项目的 `flex-grow` 值的总和小于 `1` 时，Flex 容器的剩余空间是分不完的（有留存），只有 `flex-grow` 值的总和大于或等于 `1` 时，Flex 容器的剩余空间才能全部分完。
- Flex 容器中的所有 Flex 项目的 `flex-grow` 值设置为 `1` ，并不能平均分配 Flex 容器的剩余空间，它和 Flex 项目自身的内容最小尺寸以及它的内部固定尺寸的元素有关。
- Flex 项目的 `flex-grow` 会给 Flex 项目的 `flex-basis` 值带来变化，但它也会受 `min-*` （比如 `min-width` 、 `min-inline-size` 、`min-height` 、`min-block-size`）和 `max-*` （比如 `max-width` 、`max-inline-size` 、`max-height` 和 `max-block-size` ）等属性的影响。

### flex-shrink 的计算

前面我们聊的都是 `flex-grow` 是如何计算的，接着我们来一起探计 `flex` 属性中的 `flex-shrink` 是如何计算的。

首先，`flex-shrink` 属性所起的作用和 `flex-grow` 刚好相反，**它是在 Flex 容器出现不足空间时（就是所有 Flex 项目的宽度总和大于 Flex 容器可用空间，Flex 项目溢出了 Flex 容器），让 Flex 项目根据自身的收缩因子** **`flex-shrink`** **来缩小尺寸** 。

还是拿前面的示例来举例，只不过，我们稍微把一些参数调整一下：

```html
<div class="container">
  <!-- Flex 项目 A -->
  <div class="item"><span>A</span>longlonglongword</div>
  <!-- Flex 项目 B -->
  <div class="item"><span>B</span>ook</div>
  <!-- Flex 项目 C -->
  <div class="item"><span>C</span>ountries in the east</div>
  <!-- Flex 项目 D -->
  <div class="item"><span>D</span>iscuss</div>
  <!-- Flex 项目 E -->
  <div class="item"><span>E</span>astern</div>
</div>
```

```css
.container {
  display: flex;
  inline-size: 1000px;
  font-size: 1.5rem;
}

.item {
  flex-basis: 300px; /* 也可以使用 width 或 inline-size 来替代 */

  /* 等同于 */
  flex-grow: 0; /* flex-grow 的初始值 */
  flex-shrink: 1; /* flex-shrink 的初始值 */
  flex-basis: 300px;
}

.item span {
  font-size: 3rem;
}
```

这个时候所有 Flex 项目的 `flex-basis` 值的总和 `1500px` （即 `300px × 5 = 1500px`）大于 Flex 容器的可用空间（它的 `inline-size` ）`1000px` 。按理说，Flex 项目是会溢出 Flex 容器的，但因为 Flex 项目的 `flex-shrink` 初始值是 `1` ，所以浏览器会根据 `flex-shrink` 值对 Flex 项目按照相应的收缩因子进行收缩，让 Flex 项目填充整个 Flex 容器（Flex 项目不会溢出 Flex 容器）：

![[_attachment/img/3cb11cab8a68d02151c89609c1717581_MD5.png]]

如果我们显式把 `flex-shrink` 属性的默认值 `1` 重置为 `0` 时，你将看到的浏览器不会对 Flex 项目进行收缩，此时 Flex 项目溢出了 Flex 容器，在这个示例中这个溢出部分大约会是 `500px` （即 `1500 - 1000px = 500px`），这个溢出部分也常称为 **Flex 容器不足空间** ：

![[_attachment/img/91a356a461ecd396cdad269fb56736ff_MD5.png]]

`flex-shrink` 的计算和 `flex-grow` 是相似的，不同的是 **`flex-grow`** **按扩展因子分配 Flex 容器的剩余空间，`flex-shrink` 按收缩因子分配 Flex 容器的不足空间** 。因此，`flex-shrink` 的计算，也可以像 `flex-grow` 一样：

![[_attachment/img/14b5cfa47a1b7dc3d3409705ec62d9bf_MD5.png]]

就这个示例而言，**Flex 容器的不足空间** 等于 `500px` :

```
Flex 容器不足空间 = Flex 容器可用空间 - 所有 Flex 项目的尺寸总和

Flex 容器不足空间 = 1000px - 300px × 5 = -500px
```

浏览器将会循环遍历去计算每个 Flex 项目的 **弹性量** ，即收缩值。先来看 Flex 项目 A:

```
Flex 项目的弹性量 = Flex 容器不足空间 ÷ 所有Flex 项目的收缩值（flex-shrink总和） × 当前 Flex 项目的收缩因子（flex-shrink值）
Flex 项目计算后的 flex-basis 值 = Flex 项目的弹性量 + Flex 项目当前的 flex-basis 值

Flex 项目 A 的弹性量 = -500px ÷ (1 + 1 + 1 + 1 + 1) × 1 = -100px
Flex 项目 A 计算后的 flex-basis 值 = -100px + 300px = 200px
```

根据公式计算出来 Flex 项目 A 的 `flex-basis` 值（其宽度）是 `200px` ，但这个示例中，因为其内容是一个长单词，它的最小内容长度（`min-content`）大约是 `237.52px` 。计算出来的值小于该值（`200px < 237.52px`），这个时候会取该 Flex 项目内容的最小长度值。

> **在 Flex 项目的计算中，不管是使用** **`flex-grow`** **还是** **`flex-shrink`** **对 Flex 项目进收缩扩展计算，计算出来的值不能比 Flex 项目的内容的最小长度（\*\***`min-content`\***\*）或内部固定元素的长度值还小** 。

因此，Flex 项目 A 计算之后的 `flex-basis` 值为 `237.52px` 。

接着，浏览器会按照同样的方式来计算 Flex 项目 B：

```
// 计算 Flex 项目B
Flex 容器的不足空间 = 1000px - 237.52px - (300px × 4) = -437.52px

Flex 项目 B 的弹性量 = -437.52px ÷ (1 + 1 + 1 + 1) × 1 = -109.38px
Flex 项目 B 计算后的 flex-basis 值 = -109.38px + 300px = 190.62px
```

依此类推，就可以计算出 Flex 项目 C、Flex 项目 D 和 Flex 项目 E 的 `flex-basis` 值：

```
Flex 容器不足空间 = Flex 容器可用空间 - 所有Flex项目的尺寸总和（flex-basis 总和）
Flex 项目的弹性量 = Flex 容器不足空间 ÷ 所有Flex项目的收缩值（flex-srhink总和）× 当前flex项目的flex-shrink
Flex 项目计算后的flex-basis 值 = Flex项目弹性 + Flex项目初设的flex-basis值

// 计算 Flex 项目 C

Flex 项目 C 的弹性量 = (1000px - 237.52px - 190.62px - (300px + 300px + 300px)) ÷ (1 + 1 + 1) × 1  = -109.38px
Flex 项目 C 计算后的 flex-basis 值 = -109.38px + 300px = 190.62px

// 计算 Flex 项目 D
Flex 项目 D 的弹性量 = (1000px - 237.52px - 190.62px - 190.62px - (300px + 300px)) ÷ (1 + 1) × 1  = -109.38px
Flex 项目 D 计算后的 flex-basis 值 = -109.38px + 300px = 190.62px

// 计算 Flex 项目 E
Flex 项目 E 的弹性值 = (1000px - 237.52px - 190.62px - 190.62px - 190.62px - 300px) ÷ 1 × 1  = -109.38px
Flex 项目 E 计算后的 flex-basis 值 = -109.38px + 300px = 190.62px
```

![[_attachment/img/2024792c42db9254a4c4be45465472bf_MD5.gif]]

> Demo 地址：[codepen.io/airen/full/…](https://codepen.io/airen/full/oNdwZoZ)

在 CSS 中给元素设置一个尺寸时，大多数开发者还是更喜欢使用 `width` (或 `inline-size`) ，和 `height`（或 `block-size`）属性，并不习惯使用 `flex-basis` 给 Flex 项目设置基础尺寸。在 Flex 项目中如果未显式设置 `flex-basis` 的值，浏览器将会采用其默认值 `auto` 作为 `flex-basis` 的值。比如：

```css
.container {
  display: flex;
  inline-size: 1000px;
}

.item {
  width: 300px; /* 或 inline-size: 300px */

  /* 等同于 */
  flex-grow: 0; /* flex-grow 初始值，不扩展 */
  flex-shrink: 1; /* flex-shrink 初始值，会收缩 */
  flex-basis: auto; /* flex-basis 初始值，未显式设置 width 或 inline-size 时，会是其 max-content */
}
```

这个示例的 Flex 项目的 `flex-shrink` 的计算和上一个示例（即 Flex 项目上显式设置 `flex-basis: 300px`）是一样的。这主要是因为：

> `flex-basis` 取值为 `auto` 时，且该 Flex 项目未显式设置 `width` 或 `inline-size` 属性值（非 `auto` ），那么浏览器将会把 Flex 项目的内容长度作为 `flex-basis` 的值；反之，有显式设置 `width` 或 `inline-size` 属性值（非 `auto`），那么浏览器会把 `width` 或 `inline-size` 属性值作为 `flex-basis` 的值。

![[_attachment/img/eae02fa67eb139bef5e298d0c1dcf6a7_MD5.gif]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/rNvwgKm)

不过有一点需要特别的注意，当你在 Flex 项目同时设置了 `width` （或 `inline-size`），且 `flex-basis` 值为 `0` （或任何一个非 `auto` 的值）时，那么 `flex-basis` 的值都会替代 `width` 或 `inline-size` 属性的值。比如下面这个示例：

```css
.container {
  display: flex;
  inline-size: 1000px;
}

.item {
  inline-size: 300px;
  flex-basis: 0%; /* flex-basis 替代了 inline-size */

  /* 等同于 */
  flex-grow: 0;
  flex-shrink: 1;
  flex-basis: 0%;
}
```

因为 `flex-basis` 属性值 `0%` 替代了 `inline-size` 属性的值作为 Flex 项目的基础尺寸，因为 `flex-basis` 值显式设置了为 `0%` ，这个时候浏览器会将 Flex 项目的内容最小尺寸，即 `min-content`， 作为 Flex 项目的基础尺寸。如此一来，Flex 项目就有可能不会溢出 Flex 容器了：

![[_attachment/img/6ae8086a174aeaf99f9d2e8fac9b9fff_MD5.gif]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/WNJOBBw)

如果大家在开发过程中，碰到在 Flex 项目上设置了 `width` ，`inline-size` 、`height` 或 `block-size` 无效时，就要先排查 Flex 项目的 `flex-basis` 是否设置了一个非 `auto` 的值，比如 `0` 。

至于其中原委，这里先不聊（后面专门介绍 `flex-basis` 课程中会有介绍）。我们接着来看 `flex-shrink` 。

前面聊 `flex-grow` 属性时，可以给其设置不同的值，浏览器在计算时，会根据不同的扩展比例来扩展 Flex 项目的尺寸。同样的，可以给 Flex 项目设置不同的 `flex-shrink` 值，浏览器在计算时会根据不同的收缩比例来收缩 Flex 项目的尺寸。比如：

```css
.item {
  flex-basis: 300px;
  flex-shrink: var(--flex-shrink, 0);
}

.item:nth-child(2) {
  --flex-shrink: 1;
}

.item:nth-child(3) {
  --flex-shrink: 2;
}

.item:nth-child(4) {
  --flex-shrink: 3;
}

.item:nth-child(5) {
  --flex-shrink: 4;
}
```

浏览器按照相应的收缩比例对 Flex 项目进行计算，其计算过程如下：

```
Flex 容器不足空间 = Flex 容器可用空间 - 所有Flex项目的尺寸总和（flex-basis 总和）
Flex 项目的弹性量 = Flex 容器不足空间 ÷ 所有Flex项目的收缩值（flex-srhink总和）× 当前flex项目的flex-shrink
Flex 项目计算后的flex-basis 值 = Flex项目弹性 + Flex项目初设的flex-basis值


Flex 项目 A 的弹性量 = (1000px - 300px - 300px - 300px - 300px - 300px) ÷ (0 + 1 + 2 + 3 + 4) × 0  = 0px
Flex 项目 A 计算后的 flex-basis 值 = 0 + 300px = 300px // 不收缩

Flex 项目 B 的弹性量 = (1000px - 300px - 300px - 300px - 300px - 300px) ÷ (1 + 2 + 3 + 4) × 1  = -50px
Flex 项目 B 计算后的 flex-basis 值 = -50px + 300px = 250px

Flex 项目 C 的弹性量 = (1000px - 300px - 250px - 300px - 300px - 300px) ÷ (2 + 3 + 4) × 2 = -100px
Flex 项目 C 计算后的 flex-basis 值 = -100px + 300px = 200px

Flex 项目 D 的弹性量 = (1000px - 300px - 250px - 200px - 300px - 300px) ÷ (3 + 4) × 3 = -150px
Flex 项目 D 计算后的 flex-basis 值 = -150px + 300px = 150px

Flex 项目 E 的弹性量 = (1000px - 300px - 250px - 200px - 150px - 300px) ÷ 4 × 4 = -200px
Flex 项目 E 计算后的 flex-basis 值 = -200px + 300px = 100px
```

![[_attachment/img/11f1174f1350236d665c6b3cd68d6f92_MD5.gif]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/RwygzZN)

我们多次提到过，浏览器对 Flex 项目尺寸的计算是一种 **循环遍历计算** 模式，因为浏览器无法一次性就知道，在计算 Flex 项目尺寸时就能把所有情况都预判到。比如下面这个示例（在上一个示例的基础上，将 Flex 项目 E 的文本内容“**Eastern**”调整得更长一些，比如“Elonglonglongword” ）。

![[_attachment/img/330435e65b605b504432687d5b7a9d23_MD5.png]]

```
Flex 容器不足空间 = Flex 容器可用空间 - 所有Flex项目的尺寸总和（flex-basis 总和）
Flex 项目的弹性量 = Flex 容器不足空间 ÷ 所有Flex项目的收缩值（flex-srhink总和）× 当前flex项目的flex-shrink
Flex 项目计算后的flex-basis 值 = Flex项目弹性 + Flex项目初设的flex-basis值


Flex 项目 A 的弹性量 = (1000px - 300px - 300px - 300px - 300px - 300px) ÷ (0 + 1 + 2 + 3 + 4) × 0  = 0px
Flex 项目 A 计算后的 flex-basis 值 = 0 + 300px = 300px // 不收缩

Flex 项目 B 的弹性量 = (1000px - 300px - 300px - 300px - 300px - 300px) ÷ (1 + 2 + 3 + 4) × 1  = -50px
Flex 项目 B 计算后的 flex-basis 值 = -50px + 300px = 250px

Flex 项目 C 的弹性量 = (1000px - 300px - 250px - 300px - 300px - 300px) ÷ (2 + 3 + 4) × 2 = -100px
Flex 项目 C 计算后的 flex-basis 值 = -100px + 300px = 200px

Flex 项目 D 的弹性量 = (1000px - 300px - 250px - 200px - 300px - 300px) ÷ (3 + 4) × 3 = -150px
Flex 项目 D 计算后的 flex-basis 值 = -150px + 300px = 150px

Flex 项目 E 的弹性量 = (1000px - 300px - 250px - 200px - 150px - 300px) ÷ 4 × 4 = -200px
Flex 项目 E 计算后的 flex-basis 值 = -200px + 300px = 100px
```

按照公式计算出来的 Flex 项目 E 的 `flex-basis` 尺寸是 `100px` ，它小于 Flex 项目 E 的内容最小尺寸（`min-content`），大约 `233.38px`。因为 Flex 项目收缩不会小于其最小内容尺寸（也就是不会小于 `233.38px` ）。这个时候 Flex 容器的不足空间也随之产生了变化：

- Flex 项目 A 的 `flex-shrink` 值等于 `0` ，它不做任何收缩，因此它的宽度就是 `flex-basis` 初设的值，即 `300px` 。
- Flex 项目 E 计算之后的 `flex-basis` 值小于 `min-content` ，因此，它的 `flex-basis` 的值是 `min-content` ，在该例中大约是 `233.38px`。

这样一来，Flex 容器的不足空间就是：

```
Flex 容器的不足空间 = 1000px - 300px - 233.38px - 300px - 300px - 300px = -433.38px
```

即，大约 `433.38px` 的不足空间再次按收缩因子的比例划分给 Flex 项目 B (`flex-shrink: 1`)、Flex 项目 C （`flex-shrink: 2`） 和 Flex 项目 D (`flex-shrink: 3`)。也就是说，Flex 项目 A 和 Flex 项目 E 不再参与第二次的计算了：

```
Flex 项目 B 的弹性量 = (1000px - 300px - 233.38px - 300px - 300px - 300px) ÷ (1 + 2 + 3) × 1 = -72.23px
Flex 项目 B 计算后的 flex-basis 值 = -72.23px + 300px = 227.77px

Flex 项目 C 的弹性量 = (1000px - 300px - 233.38px - 227.77px - 300px - 300px) ÷ (2 + 3) × 2 = -144.46px
Flex 项目 C 计算后的 flex-basis 值 = -144.46px + 300px = 155.54px

Flex 项目 D 的弹性量 = (1000px - 300px - 233.38px - 227.77px - 155.54px - 300px) ÷ 3 × 3 = -216.69px
Flex 项目 D 计算后的 flex-basis 值 = -216.69px + 300px = 83.31px
```

不幸的是，浏览器在进行第二轮计算的时候，又碰到了 Flex 项目 D 计算出来的 `flex-basis` 值 `83.31px` ，它也小于它内容的最小长度（`min-content`），大约 `100.69px` 。它也不能再做任何收缩。因此，浏览器需要再做第三轮计算，即 Flex 项目 B 和 Flex 项目 C 接着重新计算：

```
Flex 容器不足空间 = 1000px - 300px - 233.38px - 100.69px - 300px - 300px = -234.07px

Flex 项目 B 的弹性量 = (1000px - 300px - 233.38px - 100.69px - 300px - 300px) ÷ (1 + 2) × 1 = -78.02px
Flex 项目 B 计算后的 flex-basis 值 = -78.02px + 300px = 221.98px

Flex 项目 C 的弹性量 = (1000px - 300px - 233.38px - 100.69px - 221.98px - 300px) ÷ 2 × 2 = -156.05px
Flex 项目 C 计算后的 flex-basis 值 = -156.05px + 300px = 143.95px
```

如果计算出来的 Flex 项目 C 的 `flex-basis` 值还是小于其 `min-content` 的话，浏览器将会进行第四轮的计算，直到符合条件为止。所幸，我们这个示例第三轮计算就符合条件了。

![[_attachment/img/1de527504482ca1086e74d6e4e5ccb59_MD5.gif]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/qBYjeJq)

`flex-shrink` 的使用还有一点和 `flex-grow` 类似，也可以在 `flex-shrink` 设置小于 `1` 的正整数。比如：

```css
.container {
  display: flex;
  inline-size: 1000px;
}

.item {
  flex-shrink: 0.1;
}
```

计算公式也是类似的：

![[_attachment/img/5cba3a54efc7a8c1b8fbbcc4f4dd6893_MD5.png]]

```
Flex 项目的 flex-shrink 总和 =  (0.1 + 0.1 + 0.1 + 0.1 + 0.1) = 0.5 < 1
Flex 项目的灵活性 = (Flex 容器的不足空间  × 当前 Flex 项目自身的扩展因子 flex-shrink
Flex 容器的剩余空间 = 1000px - 300px - 300px - 300px - 300px - 300px = -500px

Flex 项目 A 的弹性值 = -500px × 0.1 = -50px
Flex 项目 A 计算后的 flex-basis 值 = -50px + 300px = 250px

Flex 项目 B 的弹性值 = -500px × 0.1 = -50px
Flex 项目 B 计算后的 flex-basis 值 = -50px + 300px = 250px

Flex 项目 C 的弹性值 = -500px × 0.1 = -50px
Flex 项目 C 计算后的 flex-basis 值 = -50px + 300px = 250px

Flex 项目 D 的弹性值 = -500px × 0.1 = -50px
Flex 项目 D 计算后的 flex-basis 值 = -50px + 300px = 250px

Flex 项目 E 的弹性值 =  -500px × 0.1 = -50px
Flex 项目 E 计算后的 flex-basis 值 = -50px + 300px = 250px
```

![[_attachment/img/db6d03bf681e59fc419756dde50de0f5_MD5.gif]]

> Demo 地址：[codepen.io/airen/full/…](https://codepen.io/airen/full/qBYXWQY)

如上图所示，当所有 Flex 项目的 `flex-shrink` 属性值的总和小于 `1` 时，Flex 容器的不足空间是分配不完的，Flex 项目依旧会溢出 Flex 容器。

如此一来，`flex-shrink` 的计算公式也分两种情景：

![[_attachment/img/7e207446ee895feb5dbfdf6564ec50f6_MD5.png]]

另外，就 `flex-shrink` 计算，当所有 Flex 项目的 `flex-shrink` 值的总和大于 `1` 时，还可以使用下面这个公式来计算:

![[_attachment/img/dd88edb114bc42fbfff02af620dc6e43_MD5.png]]

#### 小结

不知道大家在这些示例中有没有发现过，`flex-shrink` 和 `flex-grow` 在计算时所运用的公式和过程都几乎是一样的，不同之处就是：

- `flex-grow` 按比例分配 Flex 容器剩余空间，Flex 项目会按比例变大，但不会造成 Flex 项目溢出 Flex 容器（除非所有 Flex 项目自身的最小内容总和就大于 Flex 容器空间）。
- `flex-shrink` 按比例分配 Flex 容器不足空间，Flex 项目会按比例变小，但 Flex 项目仍然有可能溢出 Flex 容器。
- 当 `flex-grow` 属性值总和小于 `1` 时，Flex 容器的剩余空间分不完；同样的，当 `flex-shrink` 属性值总和小于 `1` 时，Flex 容器的不足空间分不完。

另外，`flex-shrink` 有一点和 `flex-grow` 完全不同，如果某个 Flex 项目按照 `flex-shrink` 计算出来的新宽度（`flex-basis`）趋向于 `0` 或小于 Flex 项目内容的最小长度（`min-content`）时，Flex 项目将会按照该元素的 `min-content` 或其内部固定宽度的元素尺寸设置 `flex-basis` 新的值，同时这个宽度将会转嫁到其他 Flex 项目，浏览器会按照相应的收缩因子重新对 Flex 项目进行计算，直到符合条件为止。

简单地说，**在 Flexbox 布局当中，`flex-shrink`** **会阻止 Flex 项目宽度缩小至** **`0`**。此时 Flex 项目会以 **`min-content`** **的大小进行计算**。这也是为什么在所有 Flex 项目显式设置 `flex:1` 不一定能让所有 Flex 项目宽度相等，或者说均分列的主要原因之一。

现在，基于前面课程提到的 Flex 容器的对齐属性、Flex 项目中的 `flex-shrink` 和 `flex-grow` 计算等知识，就可以很好地处理 Flex 容器的剩余空间和不足空间：

- **Flex 容器有剩余空间** （所有 Flex 项目的宽度总和小于 Flex 容器的宽度），如果设置了 `flex-grow` ，Flex 项目会根据扩展因子分配 Flex 容器剩余空间；在未设置 `flex-grow` 时，就看在 Flex 容器中是否设置了对齐方式，如果是，那么会按对齐方式分配 Flex 容器剩余空间，如果不是，Flex 容器剩余空间不变 。
- **Flex 容器有不足空间** （所有 Flex 项目的宽度总和大于 Flex 容器的宽度），如果设置了 `flex-shrink` 值为 `0` ，Flex 项目不会收缩，Flex 项目溢出 Flex 容器；如果未显式设置 `flex-shrink` 值，Flex 项目会平均分配 Flex 容器不足空间，Flex 项目会变窄（Flex 项目的 `flex-shrink` 的默认值为 `1` ），如果显式设置了 `flex-shrink` 的值为非 `0` 的不同值，那么 Flex 项目会按照不同的收缩因子分配 Flex 容器不足空间，Flex 项目同样会变窄。

具体的我们可以绘制一张这方面的流程图：

![[_attachment/img/7270d5800c5905a285782ea10ec5d127_MD5.png]]
