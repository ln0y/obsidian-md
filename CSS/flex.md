---
aliases: ['flexbox']
tags: ['CSS', 'date/2022-05', 'year/2022', 'month/05']
date: 2022-11-09-星期三 10:52:56
update: 2023-01-07-星期六 18:13:07
---

自 2009 年 W3C 发布 **Flexible Box Layout Module** （WD 版本）至今已有十多年了，在近十年来，该模块得到了快速发展，现已成为最流行的 Web 布局技术之一。在 Web 开发者中，该模块也常称为 **Flexbox 布局** 。

Flexbox 是一种布局机制，它被设计为一维布局模型，并作为一种可以提供界面中项目之间的空间分配和强大功能的方法。正因如此，Flexbox 布局对于很多 Web 开发者而言，并不是容易的，甚至有很多困惑。

## Flexbox 布局简介

> **Flexbox 布局 是一种布局机制，用于在一个维度上为项目组设置布局！**

Flexbox 模块中的主要功能就是 Web 布局。Flexbox 布局可以明确地指明容器空间的分布方式、内容对齐和元素的视觉顺序。使用 Flexbox 布局，可以轻易地实现横向或纵向布局，还可以沿着一个轴布局，或折断成多行。可以说，**使用 Flexbox 布局可以轻易地构建你想要的任何布局**。

另外，使用 Flexbox 布局还可以让 Web 内容的渲染不再受 HTML 文档源码顺序的限制。然而，这只是视觉上的调整，Flexbox 模块中的相关属性并不会改变屏幕阅读器对内容的读取顺序。

和以往的 Web 布局技术相比，Flexbox 布局所涉及的概念更多、更复杂，如下图所示：

![[c30bdb31294e40f8a98768024de75e09_tplv-k3u1fbpfcp-zoom-1.png]]

看上去有很多东西，其实也没有大家想象的那么难。接下来的内容能很好地让你掌握 Flexbox 布局。

## 一些术语和概念

我想你对 Flexbox 布局有一定的了解，而且在互联网上有关于 Flexbox 布局的教程也是玲琅满目，为此我想从 Flexbox 布局相关的术语和概念开始，因为术语的统一更有助于我们后面更好地讨论和解决问题。

用下图来描述 Flexbox 中的术语：

![[573539dfa0a4447bba9e78a5f676bb63_tplv-k3u1fbpfcp-zoom-1.png]]

首先要理解的概念就是 **Flex** **容器** （也常称为 **Flexbox** **容器** ）。简单地说，HTML 上的大多数元素都可以是 Flex 容器，比如 `div` 、`ul` 、`main` 块元素，`span` 、`em` 这样的内联元素。只需要在 HTML 元素上显式设置 `display` 的值为 `flex` 或 `inline-flex` 即可。

> **注意，HTML 中的可替代元素是无法成为 Flex 容器的，比如 `img`、 `input`、 `select` 等元素！**

当一个元素变成了 Flex 容器之后，它的子元素，包括其伪元素 `::before` 、`::after` 和 文本节点 都将成为 **Flex 项目** 。

![[4b4d9872f994445d9a16ff66cae810bf_tplv-k3u1fbpfcp-zoom-1.png]]

有一点非常的重要，**在 Flexbox 布局中， Flex 容器和 Flex 项目之间的关系永远是父子关系。** 因此，Flex 项目也可以是它的子元素的 Flex 容器，即 显式地在 Flex 项目设置 `display` 属性值为 `flex` 或 `inline-flex` ，该 Flex 项目就成为一个 Flex 容器，而它的子元素就成为 Flex 项目。但它将是一个单独的 Flex 容器，它不会继承祖辈的 Flex 容器上的属性（Flexbox 属性）。

![[8afb306f1a4f4574a48dc584b542c898_tplv-k3u1fbpfcp-zoom-1.png]]

在 CSS 坐标系中，物理坐标系有 `x` 轴（水平轴）和 `y` 轴（垂直轴）之分，逻辑坐标系有内联轴（Inline Axis） 和块轴（Block Axis）之分。在 Flexbox 中，Flex 容器内也有两个轴，而且这两个轴只存在于 Flex 容器中，分别叫 **主轴** （Main Axis）和 **侧轴** （Cross Axis）。

Flexbox 中的主轴由 `flex-direction` 属性设置，默认情况下，主轴沿行方向（内联轴 Inline Axis）分布，如果该属性为 `column` ，则主轴沿列方向（块轴 Block Axis）分布：

![[68666475866b47989c495d453f057e52_tplv-k3u1fbpfcp-zoom-1.png]]

需要注意的是，Flexbox 布局中的主轴、主方向、侧轴和侧方向不是固定不变的，它们会随着 `writing-mode`（书写模式）和 `direction`（阅读方向）而改变。 也就是说，Flex 项目在 Flex 容器中的排列方向同时会受 `flex-direction` 属性和 CSS 的书写模式 `writing-mode` 或 阅读模式 `direction` 影响。

另外，在 Flexbox 布局中，不管是主轴还是侧轴，都有方向性。既然有方向，就有开始处（即起点）和结束处（即终点）之分。根据起点和终点之分，Flex 容器中的每根轴又有 **主轴起点** 、**主轴终点** 、**侧轴起点** 和 **侧轴终点** 之分。而且每根轴的起点和终点是由 `flex-direction` 和 `writing-mode` (或 `direction`) 来决定的。

![[d75744e3adb9450298eba491b5ee884e_tplv-k3u1fbpfcp-zoom-1.png]]

如果 `flex-direction` 为默认值 `row` 时，书写模式和阅读模式分别是：

- `ltr` （Left-To-Right），如英文，主轴起点在 Flex 容器左侧边缘，主轴的终点在 Flex 容器右侧边缘；

- `rtl` （Right-To-Left），如阿拉伯文，主轴起点在 Flex 容器右侧边缘，主轴的终点在 Flex 容器的左侧边缘。

在这两种情况下，侧轴的起点都在 Flex 容器的顶部，而终点都在 Flex 容器的底部，这主要是因为两种语言都是水平书写模式。

> 注意，Flex 容器两轴的起点和终端同样受 `flex-direction` 、`writing-mode` 或 `direction` 属性值的影响。

众所周之， CSS 中的每个元素都是一个容器，是容器它就有大小。Flexbox 布局中的 Flex 容器 和 Flex 项目同样是元素，它们也有大小。不同的是，对于 Flex 容器而言，它有 **主轴尺寸** （Main Size）和 **侧轴尺寸** （Cross Size）之分。它们的差别是：

- **主轴尺寸** 是指主轴起点到终点之间的距离；

- **侧轴尺寸** 是指侧轴起点到终点之间的距离 。

也就是说，主轴尺寸和侧轴尺寸可以用来决定一个 Flex 容器的大小。但它们并不完全等同于 Flex 容器的宽高（`width x height` ）。这是因为 `flex-direction` 和 `writing-mode` 或 `direction` 属性值不同时，用于描述 Flex 容器的物理属性 `width` 和 `height` 有可能会互换的。比如：

- 当 `flex-direction` 为 `row` ，且书写模式和阅读模式是 LTR 时，主轴的尺寸对应的就是 Flex 容器的宽度，侧轴的尺寸对应的则是 Flex 容器的高度；

- 当 `flex-direction` 为 `column` ，且书写模式和阅读模式是 LTR 时，主轴的尺寸对应的就是 Flex 容器的高度，侧轴的尺寸对应的则是 Flex 容器的宽度。

![[b07d9b08b3ca487a84ad054aa7bd8910_tplv-k3u1fbpfcp-zoom-1.png]]

另外，可以在 Flex 容器上显式使用 CSS 的物理属性 `width` 和 `height` ，或使用 CSS 的逻辑属性 `inline-size` 和 `block-size` 设置 Flex 容器主轴和侧轴的尺寸 ，也可以使用 `min-*` 和 `max-*` 对 Flex 容器主轴和侧轴的尺寸加以限制。

![[e30a06037a534a848bf479a502206567_tplv-k3u1fbpfcp-zoom-1.png]]

如果没有显式给 Flex 容器设置尺寸，则会根据所有 Flex 项目的大小来决定，或根据 Flex 容器的父容器来决定。

> **注意，如果需要显式设置 Flex 容器尺寸的话，使用逻辑属性** **`inline-size`** **或** **`block-size`** **更符合多语言的 Web 布局！**

现在，我们已经知道了， **`主轴尺寸 x 侧轴尺寸`** **可以决定一个 Flex 容器的大小。** 在一个 Flex 容器中可能会包含一个或多个 Flex 项目，且每个 Flex 项目也会有其自身的尺寸大小，这样一来，就有可能造成：

- 所有 Flex 项目宽度（或高度）小于 Flex 容器的宽度（或高度），Flex 容器就会有多余的空间没有被填充，那么这个多出来的空间常称为 **Flex 容器的剩余空间** （Positive Free Space）。

- 所有 Flex 项目宽度（或高度）大于 Flex 容器的宽度（或高度），Flex 项目将会溢出 Flex 容器，那么这个溢出的空间常称为 **Flex 容器的不足空间** （Negative Free Space），也称为 **负空间** 。

![[6d934f676b6a421cb451c42aa4f0432f_tplv-k3u1fbpfcp-zoom-1.png]]

Flexbox 布局中有一个强大的特性，当 Flex 容器有剩余空间时：

- 可以使用主轴的对齐方式 `justify-content` 来分配主尺寸的剩余空间；

- 可以使用侧轴的对齐方式 `align-content` 来分配侧尺寸的剩余空间。

也可以使用 `flex` 属性中的 `flex-grow` 按比例因子来扩展 Flex 项目的尺寸；当 Flex 容器是不足空间（Flex 项目溢出 Flex 容器），你可以使用 `flex` 属性中的 `flex-shrink` 按比例因子来对 Flex 项目进行收缩。这个计算在 Flexbox 布局中是复杂的，而且会涉及一定的数学计算。

## Flexbox 布局模块相关特性

Flexbox 布局模块除了概念多之外，就是可用于 Flexbox 布局的属性也多，这些属性分为两个部分，其中一部分用于 **Flex 容器** 上，另一部分用于 **Flex 项目** 上。

可用于 Flex 容器上的属性主要有：

![[584b5a15ed2b45bba8615773ca4291cc_tplv-k3u1fbpfcp-zoom-1.png]]

可用于 Flex 项目上的属性相比于 Flex 容器上要少一点，它主要有：

![[2d832f3e72844710b90bfb3f067cb0c7_tplv-k3u1fbpfcp-zoom-1.png]]

## 控制 Flex 项目的方向 (flex-direction)

在 Flex 容器中，即使你没有显式设置 `flex-direction` 属性的值，Flex 容器中的所有 Flex 项目也会显式为一行，因为 `flex-direction` 属性的初始值是 `row` 。如果你希望 Flex 项目在 Flex 容器中不是按行呈现，而是按列呈现，则可以将其设置为 `column` 或 `column-reverse` 。

| 值             | 描述                                     |
| -------------- | ---------------------------------------- |
| row            | 默认属性，一行中从左到右排列（可以多行） |
| row-reverse    | 一行中从右到左排列 (可以多行)            |
| column         | 从上至下排列                             |
| column-reverse | 从下至上排列                             |

![[4e355c20b12a47b89c7d100f04f7080a_tplv-k3u1fbpfcp-zoom-1.png]]

来看一个简单的示例：

```html
<div class="container">
  <div class="item">Flex项目1</div>
  <div class="item">Flex项目2</div>
  <div class="item">Flex项目3</div>
</div>
<style>
  .container {
    --direction: row;
    display: flex;
    flex-direction: var(--direction);
  }
</style>
```

> Demo 地址： <https://codepen.io/airen/full/MWGeyLw>

尝试改变 Demo 中 `flex-direction` 属性的值，你将看到的效果如下：

![[_attachment/img/da7843e2a96139e89725fbe75cae7018_MD5.png]]

前面我们说过，默认情况下，Flex 项目排成一行，这一行与书写模式（或阅读模式）的方向是相同的，比如上面示例，使用的是英文，它的阅读模式是 `ltr` ，Flex 项目紧挨着 Flex 容器左侧边缘（左对齐）。这意味着，如果我们使用的是阿拉伯语系，即书写模式是 `rtl` ，则 Flex 项目将紧挨着 Flex 容器的右侧边缘（右侧对齐）：

```html
<div class="container">
  <div class="item">Flex项目1</div>
  <div class="item">Flex项目2</div>
  <div class="item">Flex项目3</div>
</div>

<div
  class="container"
  dir="rtl"
>
  <div class="item">عنصر فليكس1</div>
  <div class="item">عنصر فليكس2</div>
  <div class="item">عنصر فليكس3</div>
</div>
<style>
  .container {
    --direction: row;
    display: flex;
    flex-direction: var(--direction);
  }
</style>
```

> Demo 地址：<https://codepen.io/airen/full/MWGeeLo>

![[_attachment/img/2038ffe4e3871e192bebbdfbb0544ab4_MD5.png]]

另外，CSS 的 `writing-mode` 属性的值也将影响 `flex-direction` 属性最终呈现的效果：

![[_attachment/img/da2a7d8714e3ea29f8135d8b9d840871_MD5.png]]

> Demo 地址：<https://codepen.io/airen/full/rNvLLgJ>

因此，默认情况下，Flex 项目的行为与文档的书写模式相关。大多数教程使用英语编写，或者采用另一种从左到右的水平书写模式编写。这样就可以很容易地假设弹性项目 **在左侧** 对齐并沿 **水平方向** 分布。

在实际的业务开发中，使用 Flexbox 布局时，`flex-direction` 是非常有用的，比如下图这个布局效果，红色虚线框中的 Flex 项目是按行排列，`flex-direction` 不需要显式设置，但黑色虚线框是按列排列，需要显式将 `flex-direction` 属性的值设置为 `column`。

![[_attachment/img/62e7c246c287b440eca972a16f08fb75_MD5.png|400]]

`flex-direction` 中的 `row` 和 `row-reverse` （或 `column` 和 `column-reverse`）可以让主轴的起点和终点（或侧轴的起点和终点）互换。它们在一些布局中也是非常有用的，比如像下图这样的效果，希望双数的卡片的缩略图靠右，单数的缩略图居左。我们只需要一行代码即可：

```css
.card:nth-child(2n) {
  flex-direction: row-reverse;
}
```

![[_attachment/img/62e7c246c287b440eca972a16f08fb75_MD5.png|400]]

> Demo 地址： <https://codepen.io/airen/full/oNdLzov>

不过，在使用 `flex-direction` 属性值 `row-reverse` 和 `column-reverse` 时，会对 Web 可访问性造成负面影响，因为该属性只是对 **视觉呈现** 进行重排，其对应的 HTML 文档的源码顺序是不受该属性影响的。

## Flex 项目换行 (flex-wrap)

默认情况之下，Flex 容器中的所有 Flex 项目沿着主轴方向依次排列（不会换行的或换列），即使是 Flex 项目溢出了 Flex 容器也是如此。这主要是因为 `flex-wrap` 属性的默认值为 `nowrap` ：

| 值           | 描述               |
| ------------ | ------------------ |
| nowrap       | 默认值，在一行展示 |
| wrap         | 多行展示           |
| wrap-reverse | 倒序，多行展示     |

![[_attachment/img/ed04c84ee005fc20585c2794257ab7b5_MD5.png]]

需要注意的是，如果 Flex 容器没有足够多的空间，Flex 项目在溢出之前，每一个 Flex 项目将会尽可能缩小到其最小内容（`min-content`）的尺寸。即 **Flex 项目一旦达到最小内容（`min-content`）大小， Flex 项目将开始溢出 Flex 容器** ！

![[_attachment/img/f43239febea7bfc43c6433952c762147_MD5.png]]

> Demo 地址： <https://codepen.io/airen/full/ZEoOpPV>

如果你希望避免这个现象，只需要在 Flex 容器上显式设置 `flex-wrap` 属性的值为 `wrap` ：

```css
.flex-container {
  flex-wrap: wrap;
}
```

> Demo 地址：<https://codepen.io/airen/full/XWqKNrL>

![[_attachment/img/093530341c606207ca76629a3d951137_MD5.png]]

Flex 容器在换行后会创建多个 **Flex 行** 。在空间分布方面，每一行就像一个新的 Flex 容器。因此，如果你要换行，则无法让第 2 行中的某些内容与它上面第 1 行中的某些内容对齐。这就是所谓的 Flex 容器是一维框（盒子）。你只可以在独立的轴上（主轴或侧轴）也就是一行或一列上对齐 Flex 项目，但不能像 CSS Grid 那样同时在两个轴上控制 Grid 项目。

为此，在使用 Flexbox 布局时，为了让你的布局更具灵活性（代码更健壮，具有一定的 [[编写防御性CSS|防御性]]），个人建议你在显式声明的 Flex 容器上同时加上 `flex-wrap` 的值为 `wrap` :

```css
/* 不具防御性的 CSS */
.flex-container {
  display: flex; /* 或 inline-flex */
}

/* 具有防御性的 CSS */
.flex-container {
  display: flex; /* 或 inline-flex */
  flex-wrap: wrap;
}
```

当然，如果你的布局不需要换行，那么 Flex 容器的 `flex-wrap` 采用默认值 `nowrap` 更理想。如下图所示：

![[_attachment/img/8b26e1671fa410aa74f8a990a59911ff_MD5.png]]

事实上它并不是我们所期望的效果，我们所期望的效果是下图这样的，布局需要换行，就需要显式的设置 `flex-wrap` 为 `wrap` 。

![[_attachment/img/ec9560093b53f1d8f0d5f12ddb9217a0_MD5.png]]

`flex-wrap` 属性除了取值为 `wrap` 会让 Flex 项目换行排列之外，其另一个属性 `wrap-reverse` 也会让 Flex 项目换行排列，只不过行的排列方向和 `wrap` 相反。假如你使用的语言是英文，即书写模式和阅读模式都是 `ltr` ，那么 `flex-wrap` 取值为 `wrap` 时，Flex 行的排列将会沿着 Flex 容器侧轴方向从开始处（Flex 容器顶部）向下排列；反之 `flex-wrap` 取值为 `wrap-reverse` 时， Flex 行的排列将会沿着 Flex 容器侧轴方向从终点处（Flex 容器底部）向上排列：

![[_attachment/img/a28b879e8017f83405f15425d844a4c2_MD5.png]]

`flex-wrap: wrap-reverse` 同样也受 `flex-direction` 属性取值的影响：

![[_attachment/img/50e048e6143987dc2d125068e1989835_MD5.png]]

> Demo 地址： <https://codepen.io/airen/full/KKRadzb>

还有一点需要特别的注意，**`flex-wrap: wrap`** **(或** **`flex-wrap: wrap-reverse`) 碰到了设置 `flex:1` 项目时，只有在 Flex 容器没有足够空间容纳 Flex 项目时（即，同一 Flex 行所有 Flex 项目最小内容宽度总和小于 Flex 容器宽度），才会让 Flex 项目换行（或列），另外使用** **`flex-wrap: wrap`** **要有一个心理预判，不然也有可能会让** **UI** **视觉上不美，但不会撑破布局（如上例所示）！** 选择总是痛苦的。

CSS 中有很多简写属性，简写属性可以包含多个子属性。 如果你在编写 CSS 的时候，需要同时显式设置 `flex-direction` 和 `flex-wrap` 属性时，那么可以使用它们的简写属性 **`flex-flow`** :

```css
.flex-container {
  display: flex;
  flex-flow: column wrap;
}

/* 等同于 */
.flex-container {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
}
```

我们在使用 `flex-flow` 属性时，**可以只显式设置一个值，也可以显式设置两个值：**

- `flex-flow` 只显式设置一个值，并且该值和 `flex-direction` 相匹配时， `flex-wrap` 会取值 `initial` ；

- `flex-flow` 只显式设置一个值，并且该值和 `flex-wrap` 相匹配时，`flex-direction` 会取值 `initial` ；

- `flex-flow` 显式设置两个值时， `flex-direction` 和 `flow-wrap` 没有先后顺序之分，即 `flex-flow: column wrap` 和 `flex-flow: wrap column` 所起作用是等同的。

来看具体代码：

```css
.flex-container {
  display: flex;
  flex-flow: column;

  /* flex-flow 等同于 */
  flex-direction: colmun;
  flex-wrap: initial;
}

.flex-container {
  display: flex;
  flex-flow: wrap;

  /* flex-flow 等同于 */
  flex-direction: initial;
  flex-wrap: wrap;
}

.flex-container {
  display: flex;
  flex-flow: column wrap;

  /* flex-flow 等同于 */
  flex-flow: wrap column;

  /* flex-flow 还等同于 */
  flex-direction: column;
  flex-wrap: wrap;
}
```

## Flex 项目排序 (order)

Web 页面是由多个 HTML 元素组建而成，HTML 文档中的元素是按照其在文档中出现的先后顺序决定的，比如下面这样的一个 HTML 文档：

```html
<body>
  <header></header>
  <main></main>
  <aside></aside>
  <footer></footer>
</body>
```

在没有任何 CSS 约束之下，它呈现的顺序将会是如下图所示：

![[_attachment/img/2f3b143537221d6a51315afe9f21b105_MD5.png]]

通过前面的内容我们知道了 Flexbox 布局中，我们可以在 Flex 容器上使用 `flex-direction` 属性的值 `row-reverse` 和 `column-reverse` 来改变主轴和侧轴上 Flex 项目的排列顺序。但不能单独改变某个 Flex 项目的顺序。如果仅是单独对某个（或某几个） Flex 项目重新排序的话，就需要使用可用于 Flex 项目上的 `order` 属性。

使用 `order` 属性可以为 Flex 容器中的项目重新排序。此属性可用于对 **有序组** 中的项目进行排序。项目按照 `flex-direction` 指定的方向排列，最小值在最前面。如果多个项目具有相同的值，它将与具有该值的其他项目一起显示（按其在源码文档的顺序排列）。

`order` 初始值是 `0` ，可以是正值，也可以是负值，属性值越大，越排在主轴的后面，反之越在主轴的前面。

![[_attachment/img/ae5571c132d5c314c9eec73a7ffe7e73_MD5.png]]

如上图所示。

- 第一组中所有 Flex 项目未显式设置 `order` 值（即默认值为 `0`），Flex 项目按照 HTML 文档的源码顺序沿着主轴排列 。

- 第二组中第二个 Flex 项目显式设置 `order` 的值为 `1`，这个时候该 Flex 项目会排列在最末尾 。

- 第三组中第四个 Flex 项目显式设置 `order` 的值为 `-1`，这个时候该 Flex 项目会排列在最前面 。

来看一个简单的示例：

```html
<div class="container">
  <div class="item">Flex Item1</div>
  <div class="item">Flex Item2</div>
  <div class="item">Flex Item3</div>
  <div class="item">Flex Item4</div>
  <div class="item">Flex Item5</div>
  <div class="item">Flex Item6</div>
</div>
```

```css
.container {
   display: flex:
   flex-wrap: wrap;
}

:root {
  --order: 0;
}

.item:nth-child(2) {
  order: -1;
}

.item:nth-child(3) {
  order: var(--order);
}

.item:nth-child(4) {
  order: 3;
}
```

> Demo 地址： <https://codepen.io/airen/full/ZEoORVY>

示例中我们显式指定了第二个 Flex 项目的 `order` 值为 `-1` ，第四个 Flex 项目的 `order` 值为 `3` ，并且动态调整第三个 Flex 项目的 `order` 值，你将看到的效果如下：

![[_attachment/img/6772f9e865b0340acd521c8be7d4de63_MD5.png]]

在 Flexbox 布局中，在 Flex 项目上使用 `order` 属性可以和在 Flex 容器上使用 `flex-direction` 的 `row-reverse` （或 `column-reverse` ）等同的效果：

![[_attachment/img/5e3f5b9078babb90707bf58c192e9415_MD5.png|400]]

`order` 属性也适用于页面级别的布局，比如下面这个示例：

```html
<!-- HTML -->
<header>Header Section</header>
<main>
  <article>Article Section</article>
  <nav>Nav Section</nav>
  <aside>Aside Section</aside>
</main>
<footer>Footer Section</footer>
```

其中 `<article>` 放在 `<nav>` 和 `<aside>` 前面，主要是为了内容为先。针对这样的 DOM 结构，如果我们希望 `<nav>` 在 `<article>` 左侧，`<aside>` 在 `<article>` 右侧时，`order` 属性就可以起关键性的作用：

```css
nav {
  order: -1;
}

main:hover nav {
  order: 1;
}

main:hover aside {
  order: -1;
}
```

> Demo 地址：<https://codepen.io/airen/full/MWGeBKa>

![[_attachment/img/081b644cfb14a224a8fac5d24bef0c09_MD5.png]]

需要注意的是，`order` 在使用时与 `flex-direction` 的值 `row-reverse` 和 `column-reverse` 存在相同的问题。它对 Web 可访问性是不友好的。请勿使用 `order`，因为你需要修复文档中的乱序问题。

## Flex 项目之间的间距 (gap)

以往在 CSS 中，常常使用 `margin` 属性来设置元素与元素之间的间距。在今天，Flexbox 布局中，你可以使用 `gap` 属性来设置元素与元素之间的间距。实质上，`gap` 是用来定义 **列与列** 或 **行与行** 之间的间距。

![[_attachment/img/955b2e82dc56d52959495f9e83bb58c8_MD5.png]]

`gap` 属性的使用非常的简单，只需要在 Flex 容器显式指定 `gap` 属性值即可：

```css
:root {
  --gap: 1rem;
  --columns: 5;
}

.container {
  gap: var(--gap);
}

.item {
  flex-basis: calc((100% - (var(--columns) - 1) * var(--gap)) / var(--columns));
}
```

> Demo 地址：<https://codepen.io/airen/full/LYmZJjo>

效果如下：

![[_attachment/img/7ec847f89c420a1c9ca14b103528d93d_MD5.png]]

`gap` 属性可接受一个值，也可以接受两个值，当只显式设置一个值时，那么第二个值和第一个值等同，如果显式设置两个值，第一个值是 `row-gap` 属性的值，第二个则是 `column-gap` 属性的值：

```css
.flex-container {
  gap: 10px;

  /* 等同于 */
  row-gap: 10px;
  column-gap: 10px;
}

.flex-container {
  gap: 10px 20px;

  /* 等同于 */
  row-gap: 10px;
  column-gap: 20px;
}
```

在上面我们介绍 Flexbox 术语和概念时提到过，`gap` 和 `margin` 虽然都可以设置元素与元素之间的间距，但它们之间有明显的差异：

![[_attachment/img/f65b5485b7d5dabef9ade14aa910eed1_MD5.png]]

`margin` 除了难以达到设计预期效果之外，它们使用的地方也略有差异：

- `gap` 运用在 Flex 容器上，但它无法给 Flex 项目设置不同的外间距；

- `margin` 运用在 Flex 项目上，可以给 Flex 项目设置不同的外间距。

另外，使用 `margin` 会让 Flex 项目与 Flex 容器之间有空白间距：

![[_attachment/img/8dfa63430ac9e56782bcdb6564232d20_MD5.png]]

在 `gap` 属性还没出现之前，往往都是使用 `margin` 来模拟 `gap` 属性的效果：

```html
<div class="container">
  <div
    class="flex__container flex__container--margin"
    data-gutter="margin"
  >
    <div class="flex__item">Flex Item 1</div>
    <div class="flex__item">Flex Item 2</div>
    <div class="flex__item">Flex Item 3</div>
    <div class="flex__item">Flex Item 4</div>
    <div class="flex__item">Flex Item 5</div>
    <div class="flex__item">Flex Item 1</div>
    <div class="flex__item">Flex Item 2</div>
    <div class="flex__item">Flex Item 3</div>
    <div class="flex__item">Flex Item 4</div>
    <div class="flex__item">Flex Item 5</div>
  </div>
</div>
<div class="container">
  <div
    class="flex__container flex__container--gap"
    data-gutter="gap"
  >
    <div class="flex__item">Flex Item 1</div>
    <div class="flex__item">Flex Item 2</div>
    <div class="flex__item">Flex Item 3</div>
    <div class="flex__item">Flex Item 4</div>
    <div class="flex__item">Flex Item 5</div>
    <div class="flex__item">Flex Item 1</div>
    <div class="flex__item">Flex Item 2</div>
    <div class="flex__item">Flex Item 3</div>
    <div class="flex__item">Flex Item 4</div>
    <div class="flex__item">Flex Item 5</div>
  </div>
</div>
```

```css
:root {
  --flexDirection: row;
  --flexWrap: wrap;
  --item-basis: 100px;
  --gap: 1rem;
  --columns: 5;
}

.container {
  width: calc(
    var(--item-basis) * var(--columns) + var(--gap) * (var(--columns) - 1) + 6px
  );
}

.flex__container {
  display: flex;
  flex-flow: var(--flexDirection) var(--flexWrap);
}

.flex__container--margin {
  margin: calc(-1 * var(--gap)) 0 0 calc(-1 * var(--gap));
}

.flex__container--margin > .flex__item {
  margin: var(--gap) 0 0 var(--gap);
}

.flex__container--gap {
  gap: var(--gap);
}

.flex__item {
  inline-size: var(--item-basis);
  aspect-ratio: 1;
}
```

> Demo 地址： <https://codepen.io/airen/full/wvjWERe>

效果如下：

![[_attachment/img/e1a10276be52bf06c972815cae242156_MD5.png]]

## Flex 对齐方式

Flexbox 布局中提供了多个用于对齐 Flex 项目以及 Flex 项目之间分配空间的属性。简单地说，这些属性能够在 Flex 容器的主轴和侧轴上对齐 Flex 项目，以及在 Flex 项目之间分配空间。

这些属性可以分为两组：**空间分配属性** 和 **对齐属性** 。用于分配 Flex 容器空间的属性主要有：

- `justify-content`：沿 Flex 容器的主轴分配 Flex 容器的剩余空间；

- `align-content`：沿 Flex 容器的侧轴分配 Flex 容器的剩余空间；

- `place-content`：它是 `justify-content` 和 `align-content` 的简写属性。

用于在 Flexbox 布局中对齐的属性如下：

- `align-self`：沿 Flex 容器侧轴对齐单个 Flex 项目；

- `align-items`：将所有 Flex 项目作为一个组，沿 Flex 容器侧轴对齐。

`justify-` 开头的属性主要用于 Flex 容器的主轴方向；`align-` 开头的属性主要用于 Flex 容器侧轴方向；`-items` 结尾的属性主要用于对齐 Flex 项目，`-self` 结尾的属性主要用于 Flex 项目的自对齐，`-content` 结尾的属性主要用于容器空间分配。

![[_attachment/img/f6c7204022fd7228b64f9bc6b8352639_MD5.png]]

只不过在做出正确的选择之前，你需要知道：

- 对齐方向（Flex 容器的主轴方向通常水平方向，否则也是内联轴方向；侧轴是垂直方向，否则也是块轴方向）；

- 你在布局要在对齐什么（所有 Flex 项目，单个 Flex 项目或者两者之间的内容）。

|                                | **主轴 (`justify-*`)** | **侧轴 (`align-*`)** |
| ------------------------------ | ---------------------- | -------------------- |
| **对齐 Flex 项目**( `*-items`) | ~~`justify-items`~~    | `align-items`        |
| **Flex 项目自对齐**( `*-self`) | ~~`justify-self`~~     | `align-self`         |
| 空间分配 ( `*-content`)        | `justify-content`      | `align-content`      |

需要提醒一下的是，Flex 容器的主轴和侧轴的方向是可以改变的，用于 Flex 容器上的 `flex-direction` ，CSS 的书写模式 `writing-mode` 属性，CSS 阅读模式 `dirction` 和 HTML 元素的 `dir` 属性都可以改变。另外，**在 Flexbox 布局中是没有** **`justify-self` 和 `justify-items` 属性的**，是用在 grid 布局中的 ！

> 这里提到的对齐相关的属性，最早是出于 Flexbox 布局模块的，但也可以用于 CSS Grid 布局中。因此，在后来 W3C 的 CSS 工作小组，将这些属性纳入到一个独立的功能模块中，即 **CSS Box Alignment Module** ，到目前为止该 [模块最新版本是 Level 3](https://www.w3.org/TR/css-align-3)。

在这里，你可以了解，在 Flexbox 布局中它们如何工作。

为了让接下来的示例尽量避免复杂化，在这里我们对示例做一定的约束：

- Flex 容器是尺寸是 `600px x 300px` 的矩形；

- 所有 Flex 项目的尺寸是 `88px x 88px`；

- Flex 项目之间未显式设置任何间距；

- 左侧（或上面）容器是一个单行布局，右侧（或下面）是一个多行布局；

- CSS 书写模式和阅读模式都是 `ltr` （Left-To-Right）。

```html
<div class="flex-container">
  <div class="item">1</div>
  <!-- 中间省略 两个 Item -->
  <div class="item">4</div>
</div>

<div class="flex-container">
  <div class="item">1</div>
  <!-- 中间省略 7个 Item -->
  <div class="item">8</div>
</div>
```

```css
.flex-container {
  display: flex;
  flex-wrap: wrap;
  inline-size: 400px;
  block-size: 300px;
}
.item {
  inline-size: 120px;
  block-size: 120px;
}
```

初始效果（在没有使用任何对齐方式）：

![[_attachment/img/3938415919505ef7770aa83cd2c56f1f_MD5.png]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/MWGezqJ)

请注意，Flex 项目彼此相邻。由于 Flexbox 是一个单维布局，因此 Flex 项目要么按行对齐，要么按列对齐（默认为行对齐）。并且 Flex 项目换行之后，也是在自己所在行的主轴方向上排列。

还有，默认情况下，Flex 项目 **在侧轴上会被拉伸伸展，** 因为 Flex 容器 `align-items` 属性的默认值为 `stretch` ，在我们的例子中，Flex 项目显式设置了固定的高度。让我们删除它，看看结果如何。

```css
.item {
  inline-size: 120px;
  block-size: initial;
}
```

![[_attachment/img/3a2ee86a69b0cb7f18aa77bfa22eb370_MD5.png]]

### 沿主轴分配空间 (justify-content)

在上面这个初始化示例中，Flex 项目在主轴上排成一行，而且主轴方向有一定的剩余空间。这是因为，所有 Flex 项目的宽度总和小于 Flex 容器宽度，无法完全填满 Flex 容器。由于 `justify-content` 的初始值为 `flex-start` ，所以你看到的效果是，“Flex 项目向主轴起点位置靠齐（即行上第一个 Flex 项目的起始位置和 Flex 容器主轴起点位置平齐），Flex 容器的剩余空间都位于结尾处（即行上最后 Flex 项目终点处与 Flex 容器主轴终点处之间的距离）”：

| 值            | 描述                                                                                   |
| ------------- | -------------------------------------------------------------------------------------- |
| flex-start    | (默认) 从起点开始顺序排列                                                              |
| flex-end      | 相对终点顺序排列                                                                       |
| space-evenly  | 项目均匀分布，所有项目之间及项目与边框之间距离相等                                     |
| space-between | 项目均匀分布，第一个项在起点线，最后一项在终点线                                       |
| space-around  | 项目均匀分布，第一个项目两侧有相同的留白空间，相邻项目之间的距离是两个项目之间留白的和 |

![[_attachment/img/f2016575f2dca43fc62e98bd21f0b3b4_MD5.png]]

也就是说，你可以改变 `justify-content` 的值，来改变 Flex 项目在 Flex 容器上的对齐方式，即 **调整 Flex 容器剩余空间的位置** 。比如，将 `justify-content` 的值设置为 `flex-end` 时，Flex 项目将在 Flex 容器主轴终点处对齐，Flex 容器的剩余空间将位于主轴的起始点。

```css
.flex-container {
  justify-content: flex-end;
}
```

![[_attachment/img/ba515f91a0f574290b917ef8d67e99fd_MD5.png]]

你也可以将 `justify-content` 属性设置为 `center` ，将 Flex 容器主轴（同行）上的剩余空间均分在 Flex 容器的两侧：

```css
.flex-container {
  justify-content: center;
}
```

![[_attachment/img/5f35738e81d367053a4c20dfbd19744c_MD5.png]]

其实，当 `justify-content` 取值为 `flex-start` 、`flex-end` 和 `center` 时，相当于：

- `flex-start` ：主轴起点对齐（`ltr` 模式是左对齐）；

- `flex-end` ：主轴终点对齐（`ltr` 模式是右对齐）；

- `center` ：主轴居中对齐。

因此，在 Flexbox 布局中，常常 **使用** **`justify-content: center`** **来实现水平居中的布局效果** 。

你也可以将 `justify-content` 属性设置为 `space-around` 、`space-between` 或 `space-evenly` ，在 Flex 项目之间分配 Flex 容器的剩余空间。

- `space-between` 会让行上第一个 Flex 项目的起始边缘与 Flex 容器主轴起点相吻合，行上最后一个 Flex 项目的结束边缘与 Flex 容器主轴终点相吻合，其它相邻 Flex 项目之间间距相等。当 Flex 容器中只有一个 Flex 项目时，其表现行为和 `flex-start` 等同。

- `space-around` 会让行上第一个 Flex 项目的起始边缘与 Flex 容器主轴起点间距，和行上最后一个 Flex 项目的结束边缘与 Flex 容器主轴终点间距相等，并且等于其他相邻两个 Flex 项目之间间距的二分之一。当 Flex 容器中只有一个 Flex 项目时，其表现行为和 `center` 等同。

- `space-evenly` 会让行上第一个 Flex 项目的起始边缘与 Flex 容器主轴起点间距，和最后一个 Flex 项目的结束边缘与 Flex 容器主轴终点间距相等，并且等于其他相邻两个 Flex 项目之间间距。当 Flex 容器中只有一个 Flex 项目时，其表现行为和 `center` 等同。

![[_attachment/img/e3c92ba239527ae2c6624a151ca966f6_MD5.png]]

> 注意，在 Flexbox 布局中，可以用于 `justify-content` 属性的值，除了上述提到的（`flex-start`、`flex-end` 、`center` 、`space-around` 、`space-between` 和 `space-evenly`）之外，还可以使用 `start` （等同于 `flex-start`）和 `end` （等同于 `flex-end`）。另外，CSS 的关键词 `inherit` 、`initial` 、`revert` 和 `unset` 也可以用于 `justify-content` 属性。

![[_attachment/img/7bddbff99832674656cadaf967889861_MD5.png]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/rNvMdEw)

如果 Flex 容器没有额外的剩余空间，或者说剩余空间为负值时， `justify-content` 属性的值表现形式和前面所述是有差异的：

- `flex-start` 会让 Flex 项目在 Flex 容器主轴终点处溢出 ；

- `flex-end` 会让 Flex 项目在 Flex 容器主轴起点处溢出；

- `center` 会让 Flex 项目在 Flex 容器两端溢出；

- `space-between` 和 `flex-start` 相同；

- `space-around` 和 `center` 相同；

- `space-evenly` 和 `center` 相同；

- `start` 和 `flex-start` 相同；

- `end` 和 `flex-end` 相同。

![[_attachment/img/fa0e3ca2345985b8451273873d466e8c_MD5.png]]

上面我们所探讨的是 `flex-direction` 为 `row` （默认值）时，使用 `justify-content` 可以用来控制 Flex 项目在行上的对齐方式和 Flex 容器剩余空间的分配。接下来，我们来看 `justify-content` 将作用于列的效果（即 `flex-direction` 属性值为 `column` 时，`justify-content` 的表现）。

```css
.flex-container {
  display: flex;
  flex-direction: column;
  justify-content: var(--justify-content, flex-start);
}
```

![[_attachment/img/e2db470c69076b455d9b6a4951164d3b_MD5.png]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/mdLrLQe)

事实上，不管 `flex-direction` 属性的值是什么，`justify-content` 属性 **只作用于 Flex 容器主轴上，它会让 Flex 项目在主轴上进行排列或分配主轴方向的 Flex 容器剩余空间** 。不过，当 `flex-direction` 属性取值为 `column` 或 `column-reverse` 时，需要在代码中使用 `height` 或 `block-size` 显式指定容器的高度，只有这样才能让 Flex 容器有一定的剩余空间。否则，Flex 容器不会有任何剩余空间可供分配。这主要是因为，CSS 在计算块容器（Flex 容器）高度（或块方向尺寸）时，默认以其内容或所有后代元素高度来计算。

### 沿侧轴分配空间 (align-content)

> **沿侧轴分配空间，又可以看作是 Flexbox 布局中多行（或多列）的对齐方式** ！

| 值            | 描述                                           |
| ------------- | ---------------------------------------------- |
| stretch       | (默认) 拉伸显示                                |
| flex-start    | 从起点线开始顺序排列                           |
| flex-end      | 相对终点先顺序排列                             |
| center        | 剧种排列                                       |
| space-between | 项目均匀分布，第一个在起点线，最后一项在终点线 |
| space-around  | 项目均匀分布，每个项目两侧都有相同的留白空间   |

在 Flexbox 布局中，当 Flex 容器没有足够多的空间来容纳 Flex 项目时，且 Flex 容器上显式设置了 `flex-wrap` 属性的值为 `wrap` （或 `wrap-reverse`），Flex 项目会换行排列：

![[_attachment/img/2a69827ea28cd50e9c26ba57212b7a7f_MD5.png]]

由于 `align-items` 属性的初始值为 `stretch` ，每个 Flex 项目在侧轴方向被拉伸，Flex 项目高度变高填充了 Flex 容器侧轴空间（即 Flex 容器的 `height` 或 `block-size`），并且每行的 Flex 项目高度是相等的。

我们从前面的课程中可以得知，当 Flex 项目换行排列时，每一行都有其自己独立的主轴方向（也称为 “弹性行”）:

![[_attachment/img/76320bff709bcc595130359fad8d47da_MD5.png]]

只不过，要是在 Flex 项目上显式设置了其高度（`height` 或 `block-size`）时，即使 `align-items` 的值为 `stretch` ，也不会拉伸 Flex 项目。这个时候弹性行（相邻两行）之间就会有额外的空间出来：

```css
.flex-container {
  display: flex;
  flex-wrap: wrap;
}

.item {
  inline-size: 88px;
  block-size: 88px;
}
```

![[_attachment/img/6da7b9022f52d0c87667fde3785a843e_MD5.png]]

这个时候，如果你想分配行与行之间的间距（Flex 容器侧轴方向的剩余空间），那就需要使用 `align-content` 属性。

Flexbox 布局中的 `align-content` 属性值和 `justify-content` 属性值相比多出了一个 `stretch` 值。这些值的表现行为和 `justify-content` 属性值相同，不同的是 **`align-content`** **用来分配 Flex 容器侧轴方向的剩余空间。**

![[_attachment/img/a69e05c87059bc380ab7991cb8d8c91f_MD5.png]]

> 注意，`align-content` 属性可接受的值有 `flex-start` 、`flex-end` 、`center` 、`space-around` 、`space-between` 、`space-evenly` 、`start` 、`end` 和 `strecth` 。

如果 Flex 项目未显式设置 `height` 或 `block-size` 时，改变 `align-content` 属性值时，Flex 项目的高度将会作出相应改变，即它的高度将会是 Flex 项目内容的最大高度：

![[_attachment/img/be69cdbdb9fb95b691f075cd39143346_MD5.png]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/RwyoVWW)

从上面的效果来看，你可以把 `align-content` 状态下侧轴中的整行（弹性行），当作是 `justify-content` 状态下单个 Flex 项目。

`align-content` 属性同样会受 `flex-direction` 属性值的影响：

![[_attachment/img/b0e5b60c0987d4c11c030fa30faf2d4e_MD5.png]]

> Demo 地址：[codepen.io/airen/full/…](https://codepen.io/airen/full/WNJReYz)

上面示例展示的都是 Flex 容器在侧轴方向有剩余空间的效果。当 Flex 容器中，所有行的尺寸之和大于 Flex 容器侧轴尺寸（即 **Flex 容器侧轴方向没有剩余空间** ）时，`align-content` 属性值表现行为：

- `flex-start` 会让 Flex 容器的行在侧轴结束点溢出；

- `flex-end` 会让 Flex 容器的行在侧轴起点溢出；

- `center` 会让 Flex 容器行在侧轴两端溢出；

- `stretch` 表现行为类似于 `flex-start`；

- `space-around` 表现行为类似于 `center`；

- `space-between` 表现行为类似于 `flex-start`；

- `space-evenly` 表现行为类似于 `center`。

![[_attachment/img/403b792232a7ed4178083cee38da1c97_MD5.png]]

在构建 Web 布局时，可以 **使用 `align-content` 实现多行垂直居中的布局** 。

> 需要注意的是，当 Flex 容器中只有一行 Flex 项目，那么 `align-content` 属性取值为 `sapce-around` 和 `space-evenly` 的效果等同于 `center`；`align-content` 属性取值为 `space-between` 的效果等同于 `flex-start` 和 `start` 。

在编码的时候，如果要同时设置 `justify-content` 和 `align-content` 两个属性的话，那么你可以使用它们的简写属性 `place-content` 。比如：

```css
.flex-container {
  justify-content: center;
  align-content: center;
}

/* 等同于 */
.flex-container {
  place-content: center;
}
```

`place-content` 属性可以接受一个值，也可以接受两个值：

- 如果只显式给 `place-content` 属性设置了一个值，则表示 `justify-content` 和 `align-content` 使用的是同一个值；

- 如果给 `place-content` 属性设置了两个值，则第一个值将作用于 `align-content` ，第二个值将作用于 `justify-content`。

```css
.flex-container {
  place-content: center;

  /* 等同于 */
  align-content: center;
  justify-content: center;
}

.flex-container {
  place-content: center space-around;

  /* 等同于 */
  align-content: center;
  justify-content: space-around;
}
```

这里有一个小技巧，在 Flexbox 布局中，你可以使用 `place-content: center` 构建一个 **水平垂直居中** 的布局效果：

```css
/* 水平垂直居中 */
.flex-container {
  display: flex;
  flex-wrap: wrap;
  place-content: center;
}
```

![[_attachment/img/3f8cdd49f1c535032e6eea570f897636_MD5.png]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/abGpzjG)

大家需要知道的是，**`align-content`** **只有当** **`flex-wrap`** **属性的值为非** **`nowrap`** **（即** **`wrap`** **或** **`wrap-reverse`** **）时才能生效** 。

![[_attachment/img/3ee48dd74087dd64a41383620b6a77f7_MD5.png]]

> Demo 地址：[codepen.io/airen/full/…](https://codepen.io/airen/full/RwyKPLr)

到这里，我们已经知道了：

- 在 Flex 容器上使用 `justify-content`，可以控制 Flex 项目在 Flex 容器的主轴方向的对齐方式，以及 Flex 容器主轴方向剩余空间的分配；

- 在 Flex 容器上使用 `align-content` 可以控制 Flex 行（即 `flex-wrap` 属性为非 `nowrap` 时 Flex 项目所在行）在 Flex 容器的侧轴方向的对齐方式，以及 Flex 容器侧轴方向剩余空间的分配。

> **最后再次提醒，`align-content` 属性只有在** **`flex-wrap`** **取值为** **`wrap`** **或** **`wrap-reverse`** **时才有效** ！

### 沿侧轴对齐 Flex 项目 (align-items & align-self)

> **沿侧轴对齐 Flex 项目，指的是 Flex 容器中单行（或单例）以及单个 Flex 项目的对齐方式** ！

构建 Web 布局时，总有不需要断行（只是单行）的状态，即 `flex-wrap` 属性的值为 `nowrap` 。此时，要控制 Flex 项目在 Flex 容器侧轴上的对齐方式，就不能使用 `align-content` 属性了，但你可以使用 `align-items` 或 `align-self` 来控制整行 Flex 项目，或单个 Flex 项目在侧轴上的对齐方式：

| 值         | 描述                           |
| ---------- | ------------------------------ |
| stretch    | (默认) 交叉轴方向拉伸显示      |
| flex-start | 项目按交叉轴起点线对齐         |
| flex-end   | 项目按交叉轴终点线对           |
| center     | 交叉轴方向项目中间对齐         |
| baseline   | 交叉轴方向按第一行文字极鲜对齐 |

- `align-items` 用于 Flex 容器上，控制 Flex 行（所有 Flex 项目所在行）在侧轴上对齐方式；

- `align-self` 用于 Flex 项目上，控制单个 Flex 项目在侧轴上对齐方式。

你可以使用 `flex-start` 、`center` 、`flex-end` 、`stretch` 、`baseline` 、`start` 和 `end` 中的任一值在侧轴方向对齐 Flex 项目：

```css
.flex-container {
  display: flex;
  align-items: center;
}
```

![[_attachment/img/15a21b038248c04f105843d86d9eff10_MD5.png]]

`align-items` 属性和 `justify-content` 一样，也会受 `flex-direction` 属性值的影响：

![[_attachment/img/b9e46f971b387ee174790de4bfd62ff7_MD5.png]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/jOxyWyb)

在 Flexbox 布局中，当 Flex 容器中只有一个 Flex 行（比如说，所有 Flex 项目都在同一行），那么这个 Flex 行的高度与 Flex 容器是等高的。

在 Flex 容器上使用 `align-items` 时，就相同于在整个 Flex 容器的侧轴上对齐 Flex 项目。这和前面课程所介绍的内容并不相矛盾，在介绍 `align-content` 属性时，我们有介绍过，即，**Flex 容器中的每一行都有自己的主轴方向和侧轴方向** ，而 `align-items` 属性的值，是用来控制 Flex 项目沿着侧轴方向对齐。言外之意，Flex 容器有多行时，`align-items` 属性可以用于 Flex 项目沿着侧轴方向对齐：

![[_attachment/img/347b2e99a782228c5a1106aff3da9795_MD5.png]]

默认情况下，Flex 项目在 Flex 容器中断行排列时，每一行的高度是均等的，比如上图中均分了 Flex 容器的高度。这个高度也是每个 Flex 行的初始高度。此时，使用 `align-items` 属性时，Flex 项目就会沿着所在行的 **侧轴** 方向排列。

![[_attachment/img/2d52382181022329e37aab4788f1c96e_MD5.png]]

使用 `flex-direction` 改变主轴和侧轴方向时，它们的表现形式是相同的，只不过当 `flex-direction` 属性的值是 `column` （或 `column-reverse`）时，`align-items` 属性取值为 `baseline` 时产生的结果与 `flex-start` 或 `start` 相同。

![[_attachment/img/99a448792298f2e336eda5be98fec031_MD5.png]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/eYrgxJy)

从示例的结果我们还可以发现，**当 Flex 容器有多行出现时，使用** **`align-items: center`** **无法让它们在 Flex 容器中垂直居中（只能在所在 Flex 行中垂直居中）** 。

现在我们知道了，使用 Flexbox 布局的时候，在 Flex 容器的侧轴方向，我们可以使用 `align-content` 和 `align-items` 来控制 Flex 项目的对齐方式和分配 Flex 容器侧轴的剩余空间。

这两个属性在一些特定条件之下表现出来的结果是相似的。比如，当 Flex 容器中仅有一行（即 Flex 容器有足够多的空间容纳所有 Flex 项目），且显式将 `flex-wrap` 属性值设置为 `wrap` 或 `wrap-reverse` 时，`align-content` 属性取值 `flex-start` 、`center` 、`stretch`、`flex-end` 、`start` 和 `end` 表现的结果将和 `align-items` 属性取值 `flex-start` 、`center` 、`stretch`、`flex-end` 、`start` 和 `end` 相同。

当然，`align-content` 和 `align-items` 也有着本质性的差异：

- `align-content` 属性必须要在 `flex-wrap` 属性值为 `wrap` 或 `wrap-reverse` 条件下才能正常工作；但 `align-items` 属性则不需要；

- `align-content` 属性除了可以让 Flex 项目所在行在 Flex 容器侧轴对齐之外，还可以用来分配 Flex 容器侧轴方向的剩余空间，比如 `space-around` 、`space-between` 和 `spac-evenly` 等属性；但 `align-items` 属性则只用于控制 Flex 项目在 Flex 行侧轴方向的对齐方式。

这里有一个小技巧，如果在 Flex 容器上，同时设置了 `align-content` 属性的值是非 `stretch` 值和 `align-items` 属性任一值，那么客户端会以 `align-content` 属性为主，而 `align-items` 属性则会被客户端忽略；如果在 Flex 容器上，同时设置了 `align-content` 属性值是 `stretch`(即默认值) 和显式设置了 `align-items` 属性任一值，那么客户端会以 `align-items` 属性为主，而 `align-content` 则会被客户端忽略。

```css
/* 以 align-items 属性的值为主 */
.flex-container {
  display: flex;
  flex-wrap: wrap;
  align-content: stretch; /* 被客户端忽略 */
  align-items: center;
}

/* 以 align-content 属性的值为主 */
.flex-container {
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  align-items: flex-end; /* 被客户端忽略 */
}

/* align-content 属性被视为无效 */
.flex-container {
  display: flex;
  align-content: center; /* 需要配合 flex-wrap 属性值为 wrap 或 wrap-reverse 一起使用*/
}
```

![[_attachment/img/8ffc42702181ab797c3f0fa8a96380b6_MD5.png]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/eYrgabP)

你可能已经发现了，不管是使用 `align-content` 还是 `align-items` 属性，都是用来控制整行的 Flex 项目（即 一组或多组 Flex 项目），却无法控制单个 Flex 项目。庆幸的是，在 Flexbox 布局中，可以在 Flex 项目上显式设置 `align-self` 属性，来控制单个 Flex 项目沿着 Flex 容器侧轴来对齐项目。

`align-self` 和用于 Flex 容器上的 `align-items` 属性非常相似，它在 `align-items` 属性值的基础上多了一个 `auto` 值，并且其默认值是 `auto` （`align-items` 属性的默认值是 `stretch` ）。

我们可以像下面这样使用 `align-self` ：

```css
.flex-container {
  display: flex;
}

.items:nth-child(3n) {
  align-self: var(--align-self, auto);
}
```

![[_attachment/img/1cff58fefabeb39c02d0abd491d870b2_MD5.png]]

> 注意，只有 `align-content` 和 `align-items` 两个属性取默认值 `stretch` 时，`align-self` 属性的 `auto` 和 `stretch` 效果才是等同的。

虽然 `align-self` 可以使单个 Flex 项目沿着 Flex 行的侧轴方向对齐，但当它碰到运用于 Flex 容器的 `align-content` 和 `align-items` 还是有一定差异的。

```css
.flex-container {
  display: flex;
  flex-wrap: var(--flex-wrap, nowrap);
  align-content: var(--align-content, stretch);
}

.item {
  align-self: var(--algin-self, auto);
}
```

![[_attachment/img/74e9b05ca90b8f41edbc5171f6d48a32_MD5.png]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/xxjgoWZ)

从上面的效果中不难发现，**当** **`align-self`** **碰上了** **`align-content`** **属性时，只有** **`align-content`** **属性值为** **`stretch`** **时，`align-self` 属性的值才有效。**

而 `align-items` 和 `align-self` 同时使用则不会像 `align-content` 属性这样，**只不过 Flex 项目的** **`align-self`** **属性取值为** **`auto`** **时，不会覆盖 Flex 容器上** **`align-items`** **属性值的效果** ：

```css
.flex-container {
  display: flex;
  align-items: var(--align-items, stretch);
}

.item {
  align-self: var(--align-self, stretch);
}
```

![[_attachment/img/def6160469c7100516b055122f820490_MD5.png]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/xxjgoWZ)

我们在实际生产时，在 Flexbox 中，不管是使用 `align-content` 、 `align-items` 还是 `justify-content` 时，总是不太好实现我们所期望的布局效果，但在 Flex 项目中使用 `align-self` 会让你变得容易很多，比如下面这个示例中的按钮居右显示：

![[_attachment/img/62e7c246c287b440eca972a16f08fb75_MD5.png|400]]

```html
<div class="card">
  <div class="card__thumb">
    <svg
      t="1662879804494"
      class="icon"
      viewBox="0 0 1445 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="5503"
      width="200"
      height="200"
    >
      <path
        d="M0.005421 131.312941V584.282353a30.117647 30.117647 0 0 0 49.995294 22.889412l271.661177-236.724706a60.235294 60.235294 0 0 1 77.101176 0l259.011765 207.209412 142.757647-142.757647a60.235294 60.235294 0 0 1 80.112941-4.216471l301.176471 240.941176a60.235294 60.235294 0 1 1-75.294118 93.967059l-259.011765-207.209412-142.757647 142.757648a60.235294 60.235294 0 0 1-80.112941 4.21647L361.417186 493.929412l-301.176471 262.625882a180.705882 180.705882 0 0 0-60.235294 136.131765A131.312941 131.312941 0 0 0 131.318362 1024h1183.021177A131.312941 131.312941 0 0 0 1445.65248 892.687059V131.312941A131.312941 131.312941 0 0 0 1314.339539 0H131.318362A131.312941 131.312941 0 0 0 0.005421 131.312941zM1114.358362 421.647059a144.564706 144.564706 0 1 1 144.564706-144.564706A144.564706 144.564706 0 0 1 1114.358362 421.647059z"
        fill="currentColor"
        p-id="5504"
      ></path>
    </svg>
  </div>
  <div class="card__content">
    <h3 class="title">
      <small>UX Design</small>
      Make it easier to search and filter
    </h3>
    <button>Read More</button>
  </div>
</div>
```

```css
.card {
  display: flex;
  gap: 1rem;
}

.card__thumb {
  min-inline-size: 200px;
  aspect-ratio: 4 / 3;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.25em;
}

h3 small {
  display: block;
}

.card__content button {
  align-items: center;
  justify-content: center;
  display: inline-flex;
  align-self: flex-end;
}
```

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/PoepOwp)

## Flex 项目上的 `margin`

> **在 Flexbox 布局中，Flex 容器上可以使用** **`align-items`** **和** **`align-self`** **在侧轴方向对齐和分配侧轴空间，但在主轴上不存在** **`justify-items`** **和** **`justify-self`** **。**

Flex 容器不存在 `justify-items` 和 `justify-self` ，主要是因为 Flex 项目在 Flex 容器的主轴上被当作一个组。因此，没有将单个 Flex 项目从该组中分离出来的概念，但它们却存在于 CSS Grid 布局中。`justify-self` 和 `justify-items` 属性作用于内联轴（Inline Axis），以沿该轴将网格区域内的项目对齐。由于 Flexbox 布局是将 Flex 项目视为一个组，因此，这些属性未在 Flexbox 上下文（FFC）中实现。

> 注意，有关于 `justify-self` 和 `justify-items` ，将会在后面的 CSS Grid 布局的课程中介绍。

- [ ] 1

虽然在 Flexbox 布局中，无法在 Flex 容器的主轴上，直接使用 `justify-self` 和 `justify-items` 将 Flex 项目从一个组中分离出来，但我们可以在 Flex 项目中使用 `margin: auto` 将 Flex 项目在 Flex 容器的主轴上进行分组。

![[_attachment/img/9f4e2729d9b89c1ec8b5dbdd30da7f2b_MD5.png]]

我们来看一个使用 `margin:auto` 对 Flex 项目分组的示例。

![[_attachment/img/4d5e491fe229701f6db3299be8934f10_MD5.png]]

```html
<header>
  <Logo />
  <nav />
  <UserProfile />
</header>
<style>
  header {
    display: flex;
    gap: var(--gap, 1rem);
    align-items: center;
  }
</style>
```

示例中的 `<Logo />` 、`<Nav />` 和 `<UserProfile />` 三个组件都是 Flex 项目：

![[_attachment/img/4d5e491fe229701f6db3299be8934f10_MD5.png]]

就这个示例而言，在 Flex 容器上 `<header>` 使用 `justify-content: space-between` 无法达到预期的效果：

![[_attachment/img/910297d5e0fef1d5b7f7d7c05a81c7e2_MD5.png]]

最为简单的方法，就是在 `<UserProfile />` 使用 `margin-left: auto` 或 `margin-inline-start: auto` ：

```css
.header {
  display: flex;
  gap: var(--gap, 1rem);
}

.section {
  margin-inline-start: auto;
}
```

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/qBYrVva)

需要注意的是，**在 Flex 项目上使用** **`margin: auto`，会致使 Flex 项目上的** **`align-self`** **属性失效**。

## Flexbox 中的溢出对齐 (safe)

使用 CSS 来构建 Web 布局时，有一个最大的目标，即 **保持 Web 页面的内容和元素对访问者（用户）是可见的** 。容器会根据其内容自动扩展到右侧或底部。当内容溢出时，容器变为可滚动的，用户可以滚动来访问“不可见的内容”。除非你在容器上使用 `overflow:hidden`，禁止容器因内容溢出出现滚动条的行为。

这是 CSS 最常见的一种设计，但在 Flexbox 布局中，却无法保证这一点。比如下面这个案例：

```html
<div class="container">
  <span>CSS</span>
  <span>is</span>
  <span>awesome!</span>
</div>
<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
```

`align-items` 将所有 Flex 项目（即 `span` 元素）沿着侧轴水平居中对齐。当 Flex 容器 `.container` 有足够空间时一切都完美，但如果容器没有足够多的空间来容纳 Flex 项目的内容时，就会出现“数据丢失”的情况：

![[_attachment/img/967989d4ae1135781347d983450313f1_MD5.png]]

由于 Flex 项目始终在 Flex 容器水平居中，Flex 项目宽度大于 Flex 容器宽度时，Flex 项目就会在左右两边溢出。问题是 **左侧的溢出区域超出了 Flex 容器视口的起始边缘，你不能滚动到该区域** 。在这种情况下，就需要使用到 **[CSS Box Alignment Module Level 3](https://drafts.csswg.org/css-align-3/#overflow-values)** （仍处于草案状态）定义 **安全对齐** 。

> “安全”对齐会在溢出情况下更改对齐模式，以避免数据丢失。

就是给对齐属性新增了 `safe` 和 `unsafe` 两个关键词：

- `safe` 关键字会将因为对齐方式导致溢出时，将设置的对齐模式切换到 `start` 对齐模式下，目的是避免“数据丢失”，其中部分项目超出对齐容器的边界并且无法滚动到。

- `unsafe`，即使会导致此类数据丢失，也会遵守对齐方式。

在上面的示例中，如果我们设置了 `align-items: safe center` （注意，`safe` 的 `center` 之间有一个空格），那么最终 Flex 项目对齐方式会切换到 `start` (或 `flex-start`) 模式，不会强制 Flex 项目居中对齐。

```css
.container {
  display: flex;
  flex-direction: column;
  align-items: safe center;
}
```

![[_attachment/img/291fbcdf5e5bad470b34dbd45fc57e34_MD5.png]]

如果你确实想要对齐（即使它会导致溢出），那么你可以指定 `align-items` 属性的值为 `unsafe center` 。然后，你已请求浏览器执行你选择的对齐方式，无论内容随后发生什么。

溢出对齐对于防止数据丢失是非常有益的，可惜的是，目前仅有 Firefox 浏览器 [支持该特性](https://caniuse.com/?search=CSS%20property%20safe%20unsafe)。不过，可以使用 `margin: auto` 来达到相似的效果。

![[_attachment/img/8d3345dd93c78da65537b332ed0495d2_MD5.png]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/KKRWZMO)

## 书写模式对 Flexbox 对齐方式的影响

通过前面内容的学习，我想大家对 Flex 项目中的对齐属性有了一定的了解：

- 可用于 Flex 容器的属性有 `justify-content` 、`align-content` 和 `align-items`；

- 可用于 Flex 项目的属性有 `align-self` 和 `margin: auto`；

- Flexbox 布局中的溢出对齐 `safe` 和 `unsafe` ；

- Flexbox 布局中没有 `justify-items` 和 `justify-self` 属性。

在 Flexbox 布局中，这些属性都会受到 `flex-direction` 属性的影响，其中 `justify-` 属性始终用于在主轴上对齐，`align-` 属性始终用于在侧轴上对齐。

但在 CSS 中，CSS 的书写模式 `writing-mode` 或阅读模式 `direction` （HTML 的 `dir`）也会影响 Web 布局，即 **Web 排版的方向** 。同样的，CSS 的 `writing-mode` 、`dirction` 和 HTML 的 `dir` 对 Flexbox 布局中对齐属性也会产生不同的结果。

![[_attachment/img/3e50fc87a41e6ac6b4b6a00f33db0c01_MD5.png]]

> Demo 地址： [codepen.io/airen/full/…](https://codepen.io/airen/full/BaxWYLN)

## 小结

在社区中也有很多小游戏，帮助我们用趣味性来理解这些属性在 Flexbox 布局中的使用。这里也简单构建一个小 [Demo](https://codepen.io/airen/full/NWMpyYd)，希望能更好地帮助大家理解上面的相关属性。

## 弹性容器

使用 flexbox 布局的文档区域称为 **flex 容器**。为了创建一个弹性容器，我们将区域容器的 `display` 属性值设置为 `flex` 或 `inline-flex`。当我们这么做了，这个容器的元素直接变成 flex items。与 css 中的所有属性一样，定义了一些初始值，因此在创建 flex 容器时，所有包含的 flex 项都将按照一下方式运行

- 项目显示在一行中（`flex-direction: row`）
- 项目不会从主轴的起始边缘开始。
- 项目不会从主维度上拉伸，但可以收缩
- 这些项目将拉伸填充交叉轴的大小
- `flex-basis: auto`
- `felx-wrap: nowrap`

### flex-basis

`flex-direction` 是根据他作为可用空间留下的空间来定义改项目的大小。这个属性的初始值是 `auto`\--- 在这种情况下，浏览器会查看项目是否有大小。如果我们设置元素的 width 为 100px，100px 将用作 flex-basis。

如果项目没有大小，则内容的大小作为弹性基础。 如果项目同时设置了 width 和 flex-basis，flex-basis 的优先级会更高。

### flex-grow

将改 `flex-grow` 属性设置为正整数，弹性项目可以根据主轴进行扩展。此时该项目将扩展并占据主轴剩余空间。

如果将所有的弹性项目设置 `flex-grow: 1`，这些弹性项目将平分弹性容器的剩余空间。

<div style="display: flex; width: 500px; height: 100px; color: #333;">
    <div style="height: 100px; width: 100px; background-color: khaki;">flex-grow：1</div>
    <div style="flex-grow: 3; width: 200px; background-color: pink;">flex-grow：3</div>
</div>

效果分析：flex-container 的总宽度为 500px， item1 设置的宽度为 100px grow 为 1，item2 为 200px grow 为 3，剩余空间为 200px，所以 item1 最终宽度为 `200 / (3 + 1) * 1 + 100 = 150px`，item2 的宽度为 `200 / (3 + 1) * 3 + 200 = 350`。 当然如果 item1 和 item2 没有设置 width，则剩余空间的值则为总宽度减去 item1 和 item2 实际内容的宽度

### flex-shrink

`flex-grow` 属性用于决定主轴剩余空间的分配，flex-shrink 属性控制空间不足时，弹性项目缩小的比例

### flex

flex 是 flex-grow flex-shrink flex-basis 的简写。 可以使用一个，两个或三个值来制定 flex 属性。

**单值语法：** 值必须为以下其中之一：

- 一个无单位数：它会作为 `flex: <number> 1 0`
- 一个有效的宽度 (width) 值：它会被当作 `<flex-basis>` 的值
- 关键字 `none`,`auto` 或 `initial`。

| 值      | 等价于     |
| ------- | ---------- |
| initial | 0 1 auto   |
| auto    | 1 1 auto   |
| none    | 0 0 auto   |
| number  | number 1 0 |

**双值语法：** 第一个值必须为一个无单位数，并且它会被作为 `<flex-grow>` 的值。第二个值必须为一下之一

- 一个无单位数：它会被当作 `<flex-shrink>` 的值。
- 一个有效的宽度值：它会被当作 `<flex-basis>` 的值。

**三值语法：**

- 第一个值必须为一个无单位数，并且他会被当作 `<flex-grow>` 的值
- 第二个值必须为无单位数，并且它会被当作 `<flex-shrink>` 的值
- 第三个值必须为一个有效的宽度值，并且他会被当作 `<flex-basis>` 的值

### align-self

定义项目的对齐方式，可以覆盖 `align-items` 属性，默认值为 auto，表示继承父元素的 align-items 属性，如果没有父元素，则等同于 stretch。

## flex 相关属性计算方法

这里主要是 flex-grow、flex-shrink，分别对应在空间有剩余时的分配、空间不足时的收缩

### flex-grow

剩余空间按 flex-grow 指定的值比例分配即可

举个例子，父容器的宽度为 600，两个子项 A(300, 1)、B(200, 2)，求具体宽度：

```text
剩余宽度为100

子项增长宽度A = 100 * 1/3 = 33.333, 则实际宽度 = 333.333
子项增长宽度B = 100 * 2/3 = 66.667, 则实际宽度 = 266.667
```

<div style="width:600px; height:80px; display:flex;">
  <div style="background-color: red; width:300px; flex-grow:1;">A</div>
  <div style="background-color: green; width:200px; flex-grow:2;">B</div>
</div>

### flex-shrink

```text
子项收缩宽度 = 子项收缩比例 * 溢出宽度
子项收缩比例 = (子项宽度 * 收缩系数) / 所有子项的(宽度 * 收缩系数)之和

*收缩系数指flex-shrink的值
```

举个例子，父容器的宽度为 600，两个子项 A(500, 2)、B(400, 1)，求具体宽度：

```text
溢出宽度为300

子项收缩比例A = (500 *2) / (500 × 2 + 400 × 1) ≈ 0.71
子项收缩比例B = (400* 1) / (500 × 2 + 400 × 1) ≈ 0.29

子项收缩宽度A = 300 * 0.71 = 213, 则实际宽度 = 287
子项收缩宽度B = 300 * 0.29 = 87, 则实际宽度 = 313

* 实际宽度略有出入，与收缩比例取整有关
```

关键在于收缩比例的计算，和 flex-grow 不一样

<div style="width:600px; height:80px; display:flex;">
  <div style="background-color: red; width:500px; flex-shrink:2;">A</div>
  <div style="background-color: green; width:400px; flex-shrink:1;">B</div>
</div>
