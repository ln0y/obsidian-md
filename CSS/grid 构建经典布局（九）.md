---
aliases: []
tags: ['CSS', 'date/2023-02', 'year/2023', 'month/02']
date: 2023-02-10-星期五 15:28:28
update: 2023-02-10-星期五 15:29:36
---

[[flex 构建经典布局（四）|前面]]和大家一起探讨了如何使用 CSS Flexbox 布局技术来构建 Web 中的经典布局，比如 **水平垂直居中** 、**均分列** 、**等高布局** 、**圣杯布局** 和 **九宫格** 等布局。在这一节中，同样以这十种经典 Web 布局为例，看看 CSS Grid 布局是如何实现的，它们有何区别。你可以把接下来的示例和前面示例对比，看看同样的布局，使用 CSS 的 Flexbox 和 Grid 技术有何差异。

> **如果你对 CSS Grid 布局中相关技术还不太熟悉，可以将页面拉到最底部，查看 CSS Grid 备忘图，从图中你可以快速获取到网格布局的关键技术** 。

## 水平垂直居中

在 CSS Flexbox 布局中，实现 Flex 项目在 Flex 容器中水平垂直居中的效果，我们一般在 [Flex 容器上设置 justify-content 和 align-items 的值为 center ](https://codepen.io/airen/full/rNvpYJW)，或者在 [Flex 项目上设置 margin 的值为 auto ](https://codepen.io/airen/full/JjvpjLy)（仅适用于只有一个 Flex 项目的场景）。

由于 Flexbox 布局是一种一维布局，Flex 容器或 Flex 项目的对齐属性最终都是用来控制 Flex 项目在 Flex 容器的主轴（Main Axis）和侧轴（Cross Axis）上的对齐。简单地说，都是用来控制 Flex 项目。但 CSS Grid 布局是一种二维布局，虽然运用于网格容器和网格项目的对齐属性与运用于 Flex 容器和 Flex 项目的对齐属性名称相同，但所起作用有着关键性的区别：

- 运用于网格轨道的对齐属性：`justify-content` 和 `algin-content` ，以及它们的简写属性 `place-content`；
- 运用于网格项目的对齐属性： `justify-items` 和 `align-items`，以及它们的简写属性 `place-items`、`justify-self` 和 `align-self` ，以及它们的简写属性 `place-self`。

需要注意的是，`place-items` （以及它的子属性 `justify-items` 和 `align-items`）作用于所有网格项目；`place-self` （以及它的子属性 `justify-self` 和 `align-self`）只作用于单个网格项目。

Web 布局中的水平垂直居中分为“**单个元素**”或“**多个元素**”在其父容器中水平垂直居中：

![[_attachment/img/13087d0de58d51a546d69abe0b3d0dc1_MD5.jpeg]]

在 CSS 网格布局中，单个元素和多个元素就分别对应着：

- **单个元素水平垂直居中：** 网格容器中只有一个网格项目，它可能是一个 `1 x 1` 的网格（一行一列）；
- **多个元素水平垂直居中**：网格容器中有多个网格项目，它是一个 `1 x N` 的网格（一列 `N` 行的风格）。

正因此，使用网格布局实现水平垂直居中的布局效果时，需要选择正确的模式，即 **你需要的是网格轨道还是网格项目的对齐** 。

我们先来看单个元素的水平垂直居中的布局：

```html
<div class="container">
  <div class="item">单个元素水平垂直居中</div>
</div>
```

当你将 `.container` 定义为一个网格，并且不显式定义行和列网格轨道数量和尺寸时，它默认就是一个 `1 x 1` 的网格：

```css
.container {
  display: grid; /* 或 inline-grid */
}
```

这个时候，`div.item` 元素既是行和列网格轨道，也是一个网格项目。

![[_attachment/img/ced566b82a96c4c8727900966959dde7_MD5.jpeg]]

有了这个认知，选择正确的对齐方式就会容易得多。比如，你可以让网格轨道都居中：

```css
.container {
  display: grid; /* 或 inline-grid */

  place-content: center;

  /* 等同于 */
  align-content: center; /* 网格轨道沿着块轴方向垂直居中  */
  justify-content: center; /* 网格轨道沿着内联轴方向水平居中 */
}
```

![[_attachment/img/cdb3489bcd92bce7723e213f4fa0a74f_MD5.gif]]

> Demo 地址： <https://codepen.io/airen/full/BaVZWje>

你也可以选择对齐方式来控制网格项目。CSS 网格布局中，控制网格项目对齐有两种方式：

- 运用于网格容器上的 `justify-items` 和 `align-items` ，它将作用于网格容器中所有网格项目上；
- 运用于单个网格项目的 `justify-self` 和 `align-self`。

正如上面示例所示，单个元素在容器中水平垂直居中，意味着整个网格容器中可能只有一个网格项目。因此你在网格容器 `.container` 设置 `justify-items` 和 `align-items` 值为 `center` ，可以实现水平垂直居中的效果：

```css
.container {
  display: grid; /* 或 inline-grid */

  place-items: center;

  /* 等同于 */
  align-items: center; /* 网格容器所有网格项目沿着块轴方向垂直居中 */
  justify-items: center; /* 网格容器所有网格项目沿着内联轴方向水平垂直居中 */
}
```

![[_attachment/img/6a3b82e8d8b4c7f8e3e38af7494ccef1_MD5.gif]]

> Demo 地址： <https://codepen.io/airen/full/wvXeJNM>

事实上，在网格容器上显式设置 `place-items` 的值为 `center` 时，相当于在所有网格项目上设置了 `place-self` 的值为 `center` 。也就是说，我们还可以像下面这样设置，实现网格项目 `.item` 在网格容器 `.container` 中水平垂直居中：

```css
.container {
  display: grid;
}

.item {
  place-self: center;

  /* 等同于 */
  align-self: center; /* 网格项目沿着块轴方向垂直居中 */
  justify-self: center; /* 网格项目沿着内联轴方向水平居中 */
}
```

![[_attachment/img/3141c9a0465d13c8f4f574b9365d25e0_MD5.gif]]

> Demo 地址： <https://codepen.io/airen/full/gOKRWOa>

通过前面课程的学习，我们知道，在网格项目上设置 `margin` 的值为 `auto` 时，也可以控制网格项目在内联轴和块轴方向的对齐方式：

![[_attachment/img/8f72c8f4e44bbc4998859668486472aa_MD5.jpeg]]

正如上图所示，当你将网格项目的 `margin` 属性的值设置为 `auto` 时，它就位于网格容器最中心的位置，即水平垂直居中的效果：

```css
.container {
  display: grid;
}

.item {
  margin: auto;

  /* 等同于 */
  margin-inline: auto; /* 网格项目沿着内联轴方向水平居中 */
  margin-block: auto; /* 网格项目沿着块轴方向垂直居中 */
}
```

![[_attachment/img/2421a24faf2f55530a842e8df23bfa03_MD5.gif]]

> Demo 地址：<https://codepen.io/airen/full/xxzrdOM>

上面几个 Demo 向大家展示了单个元素（网格项目）在网格容器中是如何实现水平垂直居中的。接下来，我们来看看多个元素（网格项目）在网格容器中如何实现水平垂直居中。我们在网格容器 `.container` 新增两个元素：

```html
<div class="container">
  <svg></svg>
  <h2>Title</h2>
  <p>Describe</p>
</div>
```

当网格容器中有多个元素（网格项目）时，它和单个元素（网格项目）有所不同，它会创建一个一列多行的网格，其中行数等同于网格项目的数量：

![[_attachment/img/193ae8e3103e4e31a3eae973496470b9_MD5.jpeg]]

就我们这个示例而言，当 `.container` 定义为一个网格，其中 `grid-template-rows` 和 `grid-template-columns` 属性都未显式设置任何值（取的是它们自己的默认值 `auto`），就创建了一个一列三行的网格。要让它们在网格容器中水平垂直居中，就需要通过控制网格轨道的对齐才能实现。

```css
.container {
  display: grid; /* 或 inline-grid */

  place-content: center;

  /* 等同于*/
  align-content: center; /* 网格轨道沿着块轴方向垂直居中 */
  justify-content: center; /* 网格轨道沿着内联轴方向水平居中 */
}
```

但你会发现，即使在网格容器 `.container` 显式设置 `place-content:center` ，可视觉效果上并未实现水平居中：

![[_attachment/img/63149fde5b2fe5bcc899cc8943779cc1_MD5.jpeg]]

虽然视觉效果不符合预期，但这并不代表着渲染错误。在 CSS 网格布局中，它的表现行为是正确的，使用浏览器调试工具查看，你会发现整个网格已经实现了水平垂直居中：

![[_attachment/img/3badfbd4dabc42d9131d4bf71910c52a_MD5.jpeg]]

造成这种现象的原因是，第二个网格项目（`<h2>`）内容长度大于其他两个网格项目，加上网格轨道尺寸是默认值 `auto` ，浏览器将会以 `auto` 的行为来计算网格轨道尺寸。因此，我们还需要给所有网格项目设置一个 `justify-items` 的值为 `center` ，告诉浏览器，所有网格项目在其所在网格区域中，沿着块轴方向水平居中：

```css
.container {
  display: grid;

  place-content: center;

  /* 等同于*/
  align-content: center; /* 网格轨道沿着块轴方向垂直居中 */
  justify-content: center; /* 网格轨道沿着内联轴方向水平居中 */

  justify-items: center; /* 所有网格项目在其所在区域中沿着块轴方向水平居中 */
}
```

![[_attachment/img/b29e5072f1f00bf3779eb9942362144c_MD5.gif]]

> Demo 地址：<https://codepen.io/airen/full/qBKjmVe>

注意，上面示例中的 `justify-items` 也可以使用 `justify-self` 或 `margin-inline` 来替代，只不过需要将它们用于网格项目：

```css
.container {
  display: grid;

  place-content: center;

  /* 等同于*/
  align-content: center; /* 网格轨道沿着块轴方向垂直居中 */
  justify-content: center; /* 网格轨道沿着内联轴方向水平居中 */

  justify-items: center; /* 所有网格项目在其所在区域中沿着块轴方向水平居中 */
}

/*  等同于 */
.container {
  display: grid;
  place-content: center;
}

/* 将所有网格项目沿着内联轴方向水平居中 */
.container > * {
  justify-self: center;
}

/* 也等同于 */
.container {
  display: grid;
  place-content: center;
}

/* 将所有网格项目沿着内联轴方向水平居中 */
.container > * {
  margin-inline: auto;
}
```

![[_attachment/img/402b33090a0727f14073af6bcb41afca_MD5.jpeg]]

> Demo 地址：<https://codepen.io/airen/full/RwJggvy>

对于多个元素在容器中水平垂直居中，要是你先想到把 `place-items` 或 `place-self` 设置为 `center` 的话，那说明你对 CSS 网格布局中的对齐方式理解的还不够透彻。在网格布局中，不管是 `place-items` 还是 `place-self`，都是 **用来控制网格项目在其所在网格区域（一个单元格是网格中最小网格区域）中**的**对齐方式** 。

也就是说，你像下面这样编写 CSS 代码是无法实现多个元素在容器中水平垂直居中的：

```css
.container {
  display: grid;
  place-items: center;
}

/* 或者 */
.container {
  display: grid;
}

.container > * {
  place-self: center;
}
```

![[_attachment/img/b4c6833291be2666affb6e8f0ab0faa1_MD5.jpeg]]

> Demo 地址： <https://codepen.io/airen/full/wvXeqqv>

综上所述，在网格布局中，不管是单个元素还是多个元素，在网格容器中水平垂直居中，我们只需要将：

- `place-content` 设置为 `center` ，保证网格轨道沿着块轴和内联轴方向居中对齐；
- `justify-items` 设置为 `center` ，保证网格项目能在其所在的网格区域中沿着内联轴方向水平居中。

即：

```css
.container {
  display: grid;
  place-content: center;
  justify-items: center;
}
```

![[_attachment/img/9a5b7f306646efcf30ff2daf3394ec0c_MD5.gif]]

> Demo 地址：<https://codepen.io/airen/full/YzvQxoo>

上面我们看到的示例都是 `grid-auto-flow` 为默认值 `row` 的情景，当你在实现一些布局效果时，不得不把 `grid-auto-flow` 设置为 `column` 。这个时候你需要相应地将 `justify-items` 属性换成 `align-items` ：

```css
.container {
  display: grid;
  grid-auto-flow: column;

  place-content: center;
  align-items: center;
}
```

![[_attachment/img/fee798b139812daec8a4b09387feff0d_MD5.gif]]

> Demo 地址： <https://codepen.io/airen/full/jOKwLzr>

**作业** ：请使用 CSS 网格实现下图布局效果，具体要求：

- 卡片能根据视窗宽度自动断行；
- 图片在卡片中水平垂直居中。

![[_attachment/img/20c07b0e1b21b5918463b010e3dbd0c6_MD5.png]]

## 等高布局

众所周知，使用 Flexbox 布局技术实现等高布局已经是很容易的一件事情了。只不过使用 Flexbox 布局只能让元素（Flex 项目）等高，但要让 Flex 项目中的其他元素也具备等高的视觉效果，它还是做不到的。比如下图，卡片自身等高，但相邻卡片中的“标题”、“描述内容” 和 “按钮”之类就无法等高：

![[_attachment/img/bebec06cf20fe5f33eca0a97b3cb67a4_MD5.jpeg]]

从上图中你会发现，每张卡片标题内容高度不一致，导致其他元素无法在同一水平线上对齐，这可能不是设计师所期望的一个效果。设计师可能更期待的效果如下图所示：

![[_attachment/img/6c04a95bc6bc50e661fd7f0b69e2e7e4_MD5.jpeg]]

虽然 Flexbox 布局技术灵活性很强大了，但它始终还是一种一维布局，无法控制元素两个维度的参数，所以要实现上图的效果，Flexbox 难免会心有余而力不足。不过，要是我们使用 CSS 网格和子网格技术的话，这一切又变得太容易了。

你可以借助 CSS 子网格的特性，让卡片中每一个元素同时在相同的两个维度中。这样一来，无论哪个元素的尺寸变化了，其他卡片相同元素的尺寸也会跟着调整：

![[_attachment/img/f4645a7d68f1bc769c5f6c982820ffe4_MD5.jpeg]]

除了让每张卡片自身高度相等之外，卡片中每个元素的高度也会相等。做到真正的等高效果，而且还不用给任何元素设置高度值。

下面代码就是实现上图中等高布局的关键代码：

```html
<ul class="cards">
  <li class="card">
    <span class="card__message">✨Pick Me!</span
    ><!-- 不是所有卡片都有该元素 -->
    <h3 class="card__title"><a href="">Card Title</a></h3>
    <p class="card__describe">Card Describe</p>
    <a
      href="#"
      class="card__button"
      >Read More</a
    >
    <span class="card__episode">11</span
    ><!-- 不是所有卡片都有该元素 -->
  </li>
</ul>
```

```css
.section {
  display: grid;
  justify-items: center;
  gap: 1rem;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100% - 2rem, 25ch), 1fr));
  gap: 1.5rem 2rem;
  margin-top: 8vh;
}

.card {
  display: inherit;
  grid-template-rows: subgrid;
  grid-row: span 7;
  row-gap: 0.5rem;
  grid-template-columns: 1.5rem 1fr 1.5rem;
  grid-template-areas:
    '. episode   .'
    '. message   .'
    '. title     .'
    '. describe  .'
    '. button    .'
    '. .         .'
    '. .         .';
  margin-top: 2rem;
}

.card__episode {
  grid-area: episode;
  justify-self: end;
}

.card__message {
  grid-area: message;
}

.card__title {
  grid-area: title;
}

.card__describe {
  grid-area: describe;
}

.card__button {
  grid-area: button;
  place-self: center;
}

.card::before,
.card::after {
  grid-area: 1 / 1 / -1 / -1;
}
```

示例中的 `.cards` 和 `.card` 都是网格，其中 `.card` 网格是 `.cards` 网格的子网格，它的 `grid-template-rows` 显式设置为 `subgrid` 值，将继承了父网格的行网格轨道参数。另外，为了更好地放置卡片中的相关元素（`.card` 网格中的网格项目），在 `.card` 上使用 `grid-template-areas` 给子网格中的网格区域命名。

![[_attachment/img/53c01af1a599a3e615b10f178531addd_MD5.jpeg]]

你在支持 CSS 子网格的现代浏览器中将看到的效果如下：

![[_attachment/img/be238c2604e3254aa2f3927eb7f6bfb5_MD5.gif]]

> Demo 地址： <https://codepen.io/airen/full/RwJgXpe>

即使是在不支持子网格的浏览器中，它的效果也不会太差，与 Flexbox 实现的效果等同。

![[_attachment/img/c7a64e341b635c6d416dd291ee60928d_MD5.jpeg]]

**作业** ：使用 CSS 网格构建下图的布局效果：

![[_attachment/img/0280b815d211725b69274d2ae89a371e_MD5.jpeg]]

## 均分列

我想你已经知道了，使用 Flexbox 布局时，在 Flex 项目上显式设置 `flex: 1` 和 `min-width: 0` 就可以实现均分列的布局效果。CSS 网格布局要实现相似的效果，也是很容易的，可以使用 `fr` 单位值来设置列网格轨道尺寸。只不过为了避免触发网格项目最小尺寸的缺陷，也需要像 Flexbox 布局中一样，在网格项目上显式设置 `min-width` 值为 `0` 。

除此之外，还可以将 `fr` 单位值与 `minmax()` 函数结合起来使用，你只需要将网格轨道尺寸设置为 `minmax(0, 1fr)`，也可以达到在网格项目上显式设置 `min-width` 为 `0` 的相同效果。比如下图这个效果：

![[_attachment/img/cad4e2694f1c950502f56518e46ac7c3_MD5.jpeg]]

使用 CSS 网格实现上图布局效果，你可能会使用一个像下面这样的 HTML 结构：

```html
<ul class="cards">
  <li class="card">
    <figure>
      <img
        src=""
        alt="缩略图"
      />
    </figure>
    <h3>Title</h3>
    <p>Describe</p>
  </li>
  <!-- 其他 Card -->
</ul>
<style>
  .cards {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
</style>
```

你将看到的效果如下：

![[_attachment/img/842ff7b6d8ad2b758db0aedb4c234022_MD5.gif]]

> Demo 地址： <https://codepen.io/airen/full/vYrJNLy>

我们将 `.cards` 的 `grid-template-columns` 属性的值设置为 `repeat(4, minmax(0, 1fr))` 。这样将会告诉浏览器，把 `.cards` 定义为一个四列一行的网格，而且每列的宽度是 `minmax(0, 1fr)` 。这里的 `minmax(0, 1fr)` 将会起到两个作用：

- 定义了网格轨道的尺寸是 `minmax(0, 1fr)` ，最小小到 `0` ，最大大到 `1fr` ，其中每一个 `fr` 相当于把网格容器的可用空间（除去所有列间距总和）均分成四份，每列拿了一个等份。
- `minmax(0, 1fr)` 等同于将 `1fr` 的默认 `min-width` 从 `min-content` （即 `auto`）重置为 `0` 。这样就允许网格轨道尺寸控制在 `0` 至 `1rf` 范围内（最小小到 `0` ，最大大到 `1fr`），从而创建保持相等的列。

![[_attachment/img/38eeb62a2e1f45e5fa469f9cb549b076_MD5.jpeg]]

但这种布局也是有缺陷的，当网格容器小到一定程度时，比如小于所有网格项目最小内容总和，网格项目就会溢出网格容器，或者会出现水平滚动条：

![[_attachment/img/9ade8c192c1d72aa96104029076ea8a0_MD5.jpeg]]

实际上，我们可以采用网格布局中的 RAM 布局技术，实现一个具有 **响应式的均分列** 的效果：

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100% - 2rem, 240px), 1fr));
}
```

![[_attachment/img/2a3c2c8e48382b7275c25191f95f080a_MD5.gif]]

> Demo 地址： <https://codepen.io/airen/full/JjZyGNO>

**作业** ：请使用 CSS 网格实现下图中等宽表格：

![[_attachment/img/feb15f5155585af1d496cd42104781e9_MD5.jpeg]]

## 圣杯布局

Web 网站开发最经典的设计之一被称为“**圣杯（Holy Grail）**”。它的最大特色就是包含了“页头”、“页脚”和三列，并且以内容先行为设计原则。

![[_attachment/img/2e2da25db9f2c2f696f892dfe4fb4a21_MD5.jpeg]]

随着 Web 布局技术不断演变，尤其是响应式 Web 设计（RWD: Responsive Web Design）理念的提出，被称为经典的“圣杯布局”在视窗的不同断点之下也随之调整，如上图所示。

另外，到现在为止，经典的“圣杯”布局所包含的内容并不总是都一样的，比如 Facebook、Medium 都在标准的“圣杯”(Holy Grail) 布局上做了一个变化，他们去掉了一个突出的页脚。

![[_attachment/img/21ecbf7eda9aaa73a60f9afac786cd38_MD5.jpeg]]

_facebook.com_

![[_attachment/img/3416aadc200ac7ee36bba5877f1357f5_MD5.jpeg]]

_medium.com_

我们在构建一个标准的圣杯布局时，它所需的 HTML 结构大致如下：

```html
<header>.header</header>
<!-- 内容先行 -->
<main>.main</main>
<nav>.nav</nav>
<aside>.sidebar</aside>
<footer>.footer</footer>
```

为了在视觉上使 `.main` 、`.nav` 和 `.sidebar` 位置符合要求，比如说在桌面端要求主内容 `.main` 列位于其他两列（`.nav` 和 `.sidebar`）中间。如果你使用的是 Flexbox 布局技术来构建圣杯布局，可以通过改变 Flex 项目的 `order` 属性的值来调整它们，比如：

```css
.main {
  order: 2;
}

.nav {
  order: 1;
}

.sidebar {
  order: 3;
}
```

> Flexbox 构建的圣杯布局 Demo: <https://codepen.io/airen/full/YzLeRZx>

但在一些终端上，Flexbox 技术实现起来就有不少的难度，比如要在同一 HTML 结构基础上实现平板端（Tablet）的“圣杯”布局效果，Flexbox 就不太可能了：

![[_attachment/img/f3b1771fd89e7ce782eba6f60e83124d_MD5.jpeg]]

Flexbox 是一种一维布局，要实现类似九宫格的布局，总是需要调整 HTML 结构的。但要是换成 CSS 网格布局技术的话，这一切都不再是问题。也就是说，使用 CSS 网格构建一个响应式的圣杯布局要比 Flexbox 技术容易得多。

除了 CSS 网格是一个二维布局之外，CSS 网格布局有着天然的优势， 那就是你 **可以使用** **`grid-row`** 、**`grid-column`** **和** **`grid-area`** **属性，按照网格线的名称或网格区域名称，将网格项目放置到任意你想要的位置上** 。

我们来看看，CSS 网格构建具有响应式的圣杯布局的过程和关键性的代码。

你只需要将圣杯布局的容器父元素定义为一个网格，就能达到响应式布局中 **移动端先行的原则** 。即：

```css
body {
  display: grid;
}
```

它将创建一个一列多行的网格，你就可以使用网格线的名称，将网格项目放置到相应的位置：

```css
.header {
  grid-row: 1;
}

.main {
  grid-row: 2;
}

.nav {
  grid-row: 3;
}

.sidebar {
  grid-row: 4;
}

.footer {
  grid-row: 5;
}
```

![[_attachment/img/247f7ebddb2aaadb2c469a8b72bdde65_MD5.jpeg]]

> 注意，就我们这个示例来说，实现移动端的布局效果时，不显式设置 `grid-row` 的值能达到同等的效果。

你可能已经发现了，默认情况之下，所有元素的高度都是相等的，这不是我们想要的效果。在网格布局中，只需要一行代码就可以用来调整它们的高度。即，使用 `grid-template-rows` 来指定行网格轨道的高度，比如：

```css
body {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto auto auto;
}
```

这样一来，页面的“页头（`.header`）”、“导航栏（`.nav`）”、“侧边栏（`.sidebar`）”和“页脚（`.footer`）” 都将以自身内容来撑高其高度。网格容器在块轴方向剩余的空间都将给主内容（`.main`）：

![[_attachment/img/562c76f6fa59820639cf1a4cfca54c93_MD5.jpeg]]

你还可以在网格容器上设置一个 `gap` 值，让行与行之间有一定的间距，让视觉上看起来更好看一些：

```css
body {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto auto auto;
  gap: 1.25rem;
}
```

移动端（浏览器视窗宽度小于 `768px`）的效果就出来了：

![[_attachment/img/e79a8389dcde97801c00dffed4f29617_MD5.jpeg]]

移动端的布局完成之后，我们就可以来调整平板端的布局了。从示意图中可以知道，平板端的圣杯布局是一个两列布局。它对应的是一个 `2 x 4` 的网格（两列四行）。网格布局中定义行和列的轨道数量以及它的尺寸是通过 `grid-template-rows` 和 `grid-template-columns` 两个属性来完成的。也就是说，我们需要在符合浏览器视窗断点条件下，调整 `body` 的 `grid-template-columns` 和 `grid-template-rows` 值：

```css
@media only screen and (min-width: 768px) {
  body {
    grid-template-columns: 220px 1fr;
    grid-template-rows: auto minmax(0, 1fr) auto auto;
  }
}
```

![[_attachment/img/109c308904ce536b0c4ac1c3a804641e_MD5.jpeg]]

示例中将 `grid-template-columns` 的值设置为 `220px  minmax(0, 1fr)` ，它将会告诉浏览器，网格第一列宽度是 `220px` ，第二列的宽度是 `0 ~ 1fr` ，即除去第一列宽度和列间距就是它的宽度了。这样做能实现第一列的宽度是一个固定尺寸，第二列的宽度能跟着浏览器视窗宽度自适应的调整。视窗宽度变大，它也能变宽，视窗宽度变小，它也随之变小。

正如上图所示，仅调整网格的 `grid-template-rows` 和 `grid-template-columns` 的值是无法达到平板端圣杯布局的效果，我们还需要使用 `grid-row` 、`grid-column` 或 `grid-area` 将网格项目按照圣杯布局的意图来放置到正确的位置：

```css
@media only screen and (min-width: 768px) {
  .header {
    grid-area: 1 / 1 / 2 / 3;

    /* 等同于 */
    grid-row: 1 / 2;
    grid-column: 1 / -1; /* 或 grid-column: 1 / 3 或 grid-column: 1 span 2*/
  }

  .nav {
    grid-area: 2 / 1 / 4 / 2;

    /* 等同于 */
    grid-row: 2 / 4;
    grid-column: 1 / 2;
  }

  .main {
    grid-area: 2 / 2 / 3 / 3;

    /* 等同于 */
    grid-row: 2 / 3;
    grid-column: 2 / 3;
  }

  .sidebar {
    grid-area: 3 / 2 / 4 / 3;

    /* 等同于 */
    grid-row: 3 / 4;
    grid-column: 2 / 3;
  }

  .footer {
    grid-area: 4 / 1 / 5 / 3;

    /* 等同于 */
    grid-row: 4 / 5;
    grid-column: 1 / -1; /* 或 grid-column: 1 / 3 或 grid-column: 1 / span2 */
  }
}
```

![[_attachment/img/6b4ae96435c91e49e92cc65ce7bed96e_MD5.jpeg]]

这样就有了下图的效果，调整浏览器视窗宽度，你可以看到平板端和移动端两个不同断点下，圣杯布局的差异：

![[_attachment/img/53ab690b25a3cf309b5fd4e5a6aee321_MD5.gif]]

按此思路，调整桌面端中 `grid-template-rows` 和 `grid-template-columns` 的值，并且重新放置网格项目即可。

```css
@media only screen and (min-width: 1024px) {
  body {
    grid-template-columns: 220px minmax(0, 1fr) 220px;
    grid-template-rows: auto minmax(0, 1fr) auto;
  }

  .header {
    grid-area: 1 / 1 / 2 / 4;
  }

  .nav {
    grid-area: 2 / 1 / 3 / 2;
  }

  .main {
    grid-area: 2 / 2 / 3 / 3;
  }

  .sidebar {
    grid-area: 2 / 3 / 3 / 4;
  }

  .footer {
    grid-area: 3 / 1 / 4 / 4;
  }
}
```

![[_attachment/img/b953a59d9695e9258e85b95539273a23_MD5.jpeg]]

这样就完了一个终级版的带有响应式的圣杯布局：

![[_attachment/img/fec16523acd3ecb7ae66954ef8ff54b8_MD5.gif]]

从代码中不难发现，由于不同断点下创建的网格不同，不得不调整每个网格项目的 `grid-area` 值。其实，在网格布局中，有更优的方案来解决。那就是在不同断点下调整网格容器的 `grid-template-areas` 的值（给网格区域显示命名），如此一来，只需要把网格项目的 `grid-area` 值指定为已命名的网格区域名称即可。按这种方案把上面代码优化一下：

```css
body {
  grid-template-areas:
    'header'
    'main'
    'nav'
    'sidebar'
    'footer';
}

.header {
  grid-area: header;
}

.main {
  grid-area: main;
}

.nav {
  grid-area: nav;
}

.sidebar {
  grid-area: sidebar;
}

.footer {
  grid-area: footer;
}

@media only screen and (min-width: 768px) {
  body {
    grid-template-areas:
      'header  header'
      'nav     main'
      'nav     sidebar'
      'footer  footer';
  }
}

@media only screen and (min-width: 1024px) {
  body {
    grid-template-areas:
      'header   header  header'
      'nav      main    sidebar'
      'footer   footer  footer';
  }
}
```

![[_attachment/img/5a9b26a668ceccfa9b469390a917b814_MD5.jpeg]]

最终构建一个具有响应式的圣杯布局所有代码如下所示：

```css
/* Mobile*/
body {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto auto auto;
  grid-template-areas:
    'header'
    'main'
    'nav'
    'sidebar'
    'footer';
  gap: 1.25rem;
}
.header {
  grid-area: header;
}

.main {
  grid-area: main;
}

.nav {
  grid-area: nav;
}

.sidebar {
  grid-area: sidebar;
}

.footer {
  grid-area: footer;
}

/* Tablet Layout*/
@media only screen and (min-width: 768px) {
  body {
    grid-template-columns: 220px 1fr;
    grid-template-rows: auto minmax(0, 1fr) auto auto;
    grid-template-areas:
      'header header'
      'nav    main'
      'nav    sidebar'
      'footer footer';
  }
}

/* Desktop Layout */
@media only screen and (min-width: 1024px) {
  body {
    grid-template-columns: 220px minmax(0, 1fr) 220px;
    grid-template-rows: auto minmax(0, 1fr) auto;
    grid-template-areas:
      'header  header  header'
      'nav     main    sidebar'
      'footer  footer  footer';
  }
}
```

现在你可以往每个网格项目中填充 Web 页面所需的内容。当然，你也可以根据设计稿的需求来调整网格轨道的尺寸，最终构建一个符合自己需求的响应式圣杯布局效果：

![[_attachment/img/f3d40071858a808cf66c00a28587ff60_MD5.gif]]

> Demo 地址：<https://codepen.io/airen/full/wvXqYjo>

**作业** ：使用网格布局，构建下图的布局效果，去掉页脚区域的圣杯布局：

![[_attachment/img/21ecbf7eda9aaa73a60f9afac786cd38_MD5.jpeg]]

## Sticky Footer 布局

![[_attachment/img/0033915258e34a7982654c9b9e8f7502_MD5.png]]

使用 CSS 网格来构建 Sticky Footer 布局效果是件很容易的事情。只需要构建一个三行的网格（网格列轨道数量根据实际需要调整），并且让中间的行网格轨道尺寸能根据容器高度自动调整。CSS 网格要做到这一点只需要将网格行轨道的尺寸定义为 `auto minmax(0, 1fr) auto` ：

```css
body {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 1rem;
}
```

![[_attachment/img/6d15b2ab2e55dd5c9a355f7138a4884c_MD5.gif]]

> Demo 地址：<https://codepen.io/airen/full/yLEorWV>

在 CSS 网格布局中，除了将 `grid-template-rows` 的值设置为 `auto minmax(0, 1fr) auto` 之外，还可以设置为 `min-content auto min-content` 达到相同的效果：

```css
body {
  display: grid;
  grid-template-rows: min-content auto min-content;
}
```

![[_attachment/img/59957751f2ed8aa6dbd3455e9dff9b1e_MD5.gif]]

> Demo 地址：<https://codepen.io/airen/full/NWzvVab>

你一定会感到好奇，这是为什么呢？

### 网格轨道 auto

在介绍[[grid 计算（三）|网格中的计算]]，只和大家探讨了网格轨道取值为 `%` 和 `fr` 时如何计算，并没有给大家介绍网格轨道取值为 `auto` 时，它是如何计算的。这里我们花一点时间来聊一下，当网格轨道取值为 `auto` 和 `fr` 时，它们有何区别？

CSS 中很多属性的值都可以设置为 `auto` ，不同属性取值为 `auto` 时计算值是不一样的。在这里我们只聊聊 `auto` 为长度属性和网格中的计算值。比如一个元素的 `width` 值取值为 `auto` 时，它的计算值是有所不同的：

- 如果元素是一个块元素，那么 `width` 取值为 `auto` 时，它的计算值和 `100%` 是相同的；
- 如果元素是一个内联元素，那么 `width` 取值为 `auto` 时，它的计算值就是元素内容的宽度，即 `max-content`；
- 如果元素是一个 Flex 项目，并且 Flex 项目的 `flex` 属性值为 `none` 时（Flex 项目不因扩展因子 `flex-grow` 变大，也不因收缩因子 `flex-shrink` 变小），那么 `flex-basis` 或 `width` 取值为 `auto` 时，它的计算值是 Flex 项目内容的宽度，即 `max-content`。

在网格布局中，定义网格轨道尺寸时也可以取值为 `auto` ，即可以将 `grid-template-rows` 和 `grid-template-columns` 属性值设置为 `auto` 。只不过，`auto` 值在网格中的计算更为复杂，它可以是：

- **作为最大值** ：将是以网格轨道的网格项目的最大内容为最终计算值，与 `max-content` 不同的是，它允许通过对齐属性来扩展网格轨道尺寸；
- **作为最小值** ：将是以网格轨道中的最大网格项目的最小尺寸为最终计算值，这主要由网格项目的 `min-width` 、`min-height` 或它们对应的逻辑属性 `min-inline-size` 或 `min-block-size` 指定。

简单地说，`grid-template-rows` 和 `grid-template-columns` 属性取值为 `auto` 时，意味着网格轨道占用可用空间来容纳内容。如果网格容器有剩余空间，那么 `auto` 是很“贪婪的”，它将占用容纳内容的空间加上它可以占用的最大剩余空间。比如下面这个示例：

```css
.container {
  display: grid;
  grid-template-columns: repeat(5, auto);
}
```

按照对 `auto` 的一般理解，当 `grid-template-columns` 在设置列网格轨道尺寸的值为 `auto` 时，每列的宽度应该是所在列中网格项目内容最多的尺寸。应该内容有多长，列网格轨道尺寸就有多大，相当于 `max-content` ：

![[_attachment/img/008640c4b2b0f0c757133f0ed1944650_MD5.jpeg]]

但事实上并非如此，最终表现却和 `repeat(5, 1fr)` 相似。它的计算过程大致像下面这样：

- ①：网格容器的可用空间大约是 `1152px`；
- ②：网格项目的内容最大宽度（`max-content`）计算值分别是 `16.83px` 、`17.74px` 、`764.77px` 、`19.42px` 和 `17.93px`；
- ③：网格容器剩余的空间大约是 `315.31px`；
- ④：将网格容器剩余的空间分成五个等份（有点类似于 Flex 项目都设置了 `flex-grow` 值为 `1` 的计算方式），每个等份相当于 `63.062px` （`315.31 ÷ 5 = 63.062`）；
- ⑤：每列网格轨道尺寸，在原有内容宽度（`max-content` 计算值）基础上分别增加分得的网格容器空间，这样每列列宽就分别是 `79.892px` 、`80.802px` 、`827.832px` 、`82.482px` 和 `80.991px`。

![[_attachment/img/0e11aa38bd9621ce3f459ddc77d8d46e_MD5.jpeg]]

另外，网格对齐属性对 `auto` 计算值也是有影响的，如下图所示：

![[_attachment/img/26a8d006a288603e38e50519fc46687a_MD5.gif]]

> Demo 地址： <https://codepen.io/airen/full/jOKGGjG>

注意，如果在网格项目上显式设置 `min-width` （ `min-inline-size`），或 `min-height` （ `min-block-size`），那么列（或行）的大小将是 `min-width` （`min-inline-size`），或 `min-height` （`min-block-size`）设置的最小值。

再来回忆一下网格中的 `1fr` 。`1fr` 的底层实现逻辑其实就是 `minmax(auto,1fr)` （`minmax()` 是用来设置网格轨道尺寸的一个 CSS 函数），意味着 `min=auto`（即 `min-width: min-content`），`max=1fr`。

结合起来对比：

- `auto` 则相当于 `minmax(auto, auto)` ，与 `minmax(min-content, max-content)` 相似；
- `1fr` 则相当于 `minmax(auto, 1fr)` 与 `minmax(min-content, 1fr)` 相似。

另外就是，当网格项目内容相同时，那么 `auto` 和 `1fr` 具有相同的效果，即 **平均占用网格容器可用空间** ：

![[_attachment/img/d3f35d1fc17d6eaab10332415dac55df_MD5.gif]]

这就是制作 Sticky Footer 布局时，为什么使用 `auto` 和 `minmax(0, 1f)` 能达到相同的效果。

![[_attachment/img/600db1372fa9473966240a199b0d4c6e_MD5.jpeg]]

你也可以将上图中的 `min-content` 替换成其他的长度值。相当于 `min-content` 是一个根据内容最小尺寸计算出来的一个长度值，它会占用网格容器一定的可用空间。如此一来，网格容器剩余的空间就会给 `auto` 或 `1fr` （也就是 `minmax(0, 1fr)` ）。所以它们最终的结果都是相似的。

不过需要注意的，当 `grid-template-columns` 和 `grid-template-rows` 中同时出现 `auto` 和 `fr` 时，那么 `fr` 将“赢得”网格容器剩余空间的战斗，而 `auto` 将失去了它的宽度值，缩小到其元素内容所需的空间。**剩下的网格空间被分成由** **`fr`** **单位定义的列或行，定义为** **`auto`** **的列或行不会获得更多的剩余空间** 。

```css
.container {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
}

/* 等同于 */
.container {
  display: grid;
  grid-template-rows: min-content auto min-content;
}
```

## 百分百无滚动布局

我们可以在 Sticky Footer 布局的基础上，快速演变出百分百无滚动的布局。比如：

- 一个多列布局，侧边栏固定，主内容可以随着浏览器视窗宽度自动调整，始终不会出现水平滚动条；
- 一个多行布局，页头和页层始终在页面中可见，当内容过多时出现垂直滚动条，比如 Modal 弹窗的布局。

先来看第一种布局，这种布局效果已是 Web 中常见的效果了，而且前面的圣杯布局也有类似的效果。CSS 网格布局中，实现侧边栏固定，主内容随着浏览器视窗宽度自适应的布局效果，只需要像下面这样定义网格列轨道即可：

```css
body {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) 220px;
}
```

或者：

```css
body {
  display: grid;
  grid-template-columns: 220px auto 220px;
}
```

它们得到的效果是相同的：

![[_attachment/img/2d58e5ec5dae9b948d945a6480c96be2_MD5.gif]]

> Demo 地址： <https://codepen.io/airen/full/LYrzeMe>

另一种布局效果拿移动端的页面布局为例：

![[_attachment/img/8b50e7e7116e4b05043c12eb874833d4_MD5.png]]

上图这种移动端页面是很常见的一种布局效果，页头和页脚是固定在页面顶端和底部，中间内容区域占用除页面和页脚之外剩下的空间，并且当内容超出时，会出现垂直滚动条。

以往 Web 开发者构建类似这种布局效果时，页头和页脚一般采用固定定位来实现。今天我们来看看如何使用 CSS 网格来实现。构建上图这种布局，你可能需要下面这样的 HTML 结构：

```html
<body>
  <header>固定在页面顶部</header>
  <main>主内容区域，内多过多时出现垂直滚动条</main>
  <footer>固定在页面底部</footer>
</body>
```

关键的 CSS 代码：

```css
html,
body {
  height: 100vh;
  overflow-y: hidden; /* 这个很重要 */
}

body {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  grid-template-areas:
    'header'
    'main'
    'footer';
  row-gap: 10px;
}

header {
  grid-area: header;
}

main {
  grid-area: main;
  overflow-y: auto; /* 这个很重要 */
}

footer {
  grid-area: footer;
}
```

![[_attachment/img/35cc125f3fb4e138843c97ca3282530d_MD5.gif]]

> Demo 地址： <https://codepen.io/airen/full/rNKGdLQ>

把示例中 `body` 的 `grid-template-rows` 值替换为 `min-content auto min-content` 将获得同样的效果：

```css
body {
  display: grid;
  grid-template-areas:
    'header'
    'main'
    'footer';
  row-gap: 10px;

  grid-template-rows: min-content auto min-content;
}
```

> Demo 地址： <https://codepen.io/airen/full/oNyGqEj>

**作业** ：使用 CSS 网格构建一个弹窗（Modal）布局效果：

- 整个弹窗在视窗中水平垂直居中；
- 弹窗主内容过多时，内容区域自动出现垂直滚动条。

![[_attachment/img/aab9fee2bb348d697ba68f1e05844490_MD5.jpeg]]

## 12 列网格布局

还没有原生 CSS 网格系统时，Web 开发者一般使用其他的布局技术来模拟一个网格系统，但不管使用哪种技术模拟出来的网格系统都不是真正的网格系统，因为它始终是一种一维的布局。只有原生的 CSS 网格技术才是真正的网格系统。所以说，使用原生 CSS 网格构建 12 列网格是水到渠成的事情，是再简单不过的一件事了。

我们可以使用 `repeat()` 函数和 CSS 网格的 `fr` 单位值，再加上 `gap` 属性，就可以构建一个适合于任何视窗大小的 12 列网格：

```css
.container {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: 2rem;
  padding-inline: 1rem;
}
```

![[_attachment/img/91c40a7e69ab88016b5fe4dea66099ed_MD5.jpeg]]

上图就是一个 12 列的网格，它的特征是：

- 每列的宽度是 `1fr` ，相当于网格容器可用空间（即网格容器空间减去所列间距与内距之后的空间）分成 `12` 等份，每列占一个等份；
- 列与列之间的间距是 `2rem`；
- 第一列起始边缘与容器起始边缘，最后一列结束边缘与容器结束边缘之间间距是 `1rem`。

有了这个基础，你就可以使用网格线的编号来放置网格项目了。不过我更喜欢使用 `span` 关键词，就能快速达到合并列的效果，比如：

```css
/* 合并 12 列*/
.item:nth-child(1) {
  grid-column: 1 / span 12;
}

/* 合并 3 列 */
.item:nth-child(2) {
  grid-column: 1 / span 3;
}

.item:nth-child(3) {
  grid-column: 4 / span 3;
}

.item:nth-child(4) {
  grid-column: 7 / span 3;
}

.item:nth-child(5) {
  grid-column: 10 / span 3;
}

/* 合并 4 列 */
.item:nth-child(6) {
  grid-column: 1 / span 4;
}

.item:nth-child(7) {
  grid-column: 5 / span 4;
}

.item:nth-child(8) {
  grid-column: 9 / span 4;
}

/* 合并 6 列 */
.item:nth-child(9) {
  grid-column: 1 / span 6;
}

.item:nth-child(10) {
  grid-column: 7 / span 6;
}

/* 合并 2 列 */
.item:nth-child(11) {
  grid-column: 1 / span 2;
}

/* 合并 8 列 */
.item:nth-child(12) {
  grid-column: 3 / span 8;
}

/* 合并 2 列 */
.item:nth-child(13) {
  grid-column: 11 / span 2;
}

/* 合并 12 列 */
.item:nth-child(14) {
  grid-column: 1 / span 12;
}
```

![[_attachment/img/a8b5c7a04de5dbe656077d926cc2a9f8_MD5.jpeg]]

> Demo 地址： <https://codepen.io/airen/full/dyKVmQp>

为了避免网格洞现象的出现，建议在网格容器 `.container` 上将 `grid-auto-flow` 属性的值设置为 `dense` 。

基于该 12 列网格，你可以更容易与设计师的网格系统相匹配，也能更好地基于设计师的网格系统来实现 Web 布局：

![[_attachment/img/3bc514eb3d2be604e8ab30e601938798_MD5.jpeg]]

来看一个简单的用例：

```css
body {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1rem 2rem;
  grid-auto-flow: dense;

  grid-template-areas:
    'header  header  header  header  header  header  header  header  header  header  header  header '
    'nav     nav     nav     nav     nav     nav     nav     nav     nav     nav     nav     nav '
    'main    main    main    main    main    main    main    main    main    main    main    main '
    'card1   card1   card1   card1   card1   card1   card1   card1   card1   card1   card1   card1'
    'card2   card2   card2   card2   card2   card2   card2   card2   card2   card2   card2   card2'
    'aside   aside   aside   aside   aside   aside   aside   aside   aside   aside   aside   aside'
    'ads     ads     ads     ads     ads     ads     ads     ads     ads     ads     ads     ads'
    'footer  footer  footer  footer  footer  footer  footer  footer  footer  footer  footer  footer';
  grid-template-rows: auto auto minmax(0, 1fr) auto auto auto auto auto;
  padding: 0 1rem;
}

header {
  grid-area: header;
}

nav {
  grid-area: nav;
}

main {
  grid-area: main;
}

aside {
  grid-area: aside;
}

section {
  grid-area: ads;
}

footer {
  grid-area: footer;
}

.card--1 {
  grid-area: card1;
}

.card--2 {
  grid-area: card2;
}

@media only screen and (min-width: 768px) {
  body {
    grid-template-areas:
      'header    header    header  header  header  header  header  header  header  header  header  header '
      'aside     aside     nav     nav     nav     nav     nav     nav     nav     nav     nav     nav '
      'aside     aside     main    main    main    main    main    main    main    main    main    main '
      'ads       ads       card1   card1   card1   card1   card1   card2   card2   card2   card2   card2'
      'footer    footer    footer  footer  footer  footer  footer  footer  footer  footer  footer  footer';
    grid-template-rows: auto auto minmax(0, 1fr) auto auto;
  }
}

@media only screen and (min-width: 1024px) {
  body {
    grid-template-areas:
      'header    header    header  header  header  header  header  header  header  header  header   header '
      'nav       nav       main    main    main    main    main    main    main    main    aside    aside '
      'nav       nav       card1   card1   card1   card1   card2   card2   card2   card2   ads      ads'
      'footer    footer    footer  footer  footer  footer  footer  footer  footer  footer  footer   footer';
    grid-template-rows: auto minmax(0, 1fr) auto auto;
  }
}
```

![[_attachment/img/3f12b8f042c33ba26d030de0abf6c41c_MD5.gif]]

> Demo 地址：<https://codepen.io/airen/full/gOKGzJq>

注意，示例中在不同断点下使用 `grid-template-areas` 来起到合并列的作用。

**作业** ：使用 CSS 网格技术，并且基于 12 列网格构建下图卡片布局效果：

![[_attachment/img/b5f11bac208e322f4f63115bc50ad49e_MD5.jpeg]]

## 九宫布局

![[_attachment/img/6569ba962d4e06a719591e14d1d56ffd_MD5.jpeg]]

虽然 Flexbox 布局技术很强大，但要实现像上图中部分九宫格的布局，还是需要调整 HTML 结构才可以。要是换成 CSS 网格技术的话，它一点难度都没有。

你可以使用 `grid-template-columns` 和 `grid-template-rows` 来创建一个三行三列的网格：

```css
.container {
  display: grid;
  grid-template-rows: repeat(3, minmax(0, 1fr));
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}
```

![[_attachment/img/c75ecc58011a0dbd120f5e0bdc586f58_MD5.jpeg]]

在这个基础上，只需要在网格项目上使用 `grid-area` （或 `grid-column` 或 `grid-row`）指定网格线名称，就能实现不同风格的九宫布局，比如：

```css
.container:nth-child(2) {
  gap: 2px;
  padding: 0;
}

.container:nth-child(2) .item {
  border-radius: 0;
}

.container:nth-child(3) .item:nth-child(1) {
  grid-area: 1 / 1 / 3 / 2;
}

.container:nth-child(3) .item:nth-child(2) {
  grid-area: 1 / 2 / 2 / 4;
}
```

![[_attachment/img/c27ee5c4ab78fa814082917842a8035c_MD5.jpeg]]

> Demo 地址：<https://codepen.io/airen/full/abKLKQR>

简单地说，基于九宫格原理，你只需要调整 `grid-template-columns` 和 `grid-template-rows` 的值，就可以得到任意宫格布局效果：

![[_attachment/img/5d261e604d87b1019bf90f0345825c34_MD5.jpeg]]

**作业** ：请使用 CSS 网格构建下图布局：

![[_attachment/img/a8249ed0a701cf1d5e1bf11ccdcc141f_MD5.jpeg]]

## 灵活弹性框

通过前面的示例学习，我们知道在 CSS 网格布局中，可以将 `grid-template-columns` 或 `grid-template-rows` 设置为 `auto minmax(0, 1fr)` 或 `min-content  auto`，就可以得到一个灵活的弹性框。即网格轨道对应的 `minmax(0, 1fr)` 或 `auto` 会根据网格容器的宽度或高度自适应：

![[_attachment/img/c63efd693b9a7de6e0f6c358abda6e10_MD5.gif]]

同时，我们也知道 Flexbox 布局中使用 `flex: 1` 也能让 Flex 项目根据 Flex 容器的空间自适应，但是 Flexobx 布局时，Flex 容器小到一定程度时，其他 Flex 项目会因空间不足而受到挤压（Flex 项目被收缩）：

![[_attachment/img/d3bb584cb2baa7be2f2cb5b27d344a1b_MD5.jpeg]]

为了达到所需效果，不得不将 Flex 项目的 `flex-shrink` 的值设置为 `0` ：

```css
.card__media,
.card__action {
  flex-shrink: 0;
}
```

或者采用更为理想的解决方案，在设置 `flex: 1` 的 Flex 项目显式设置 `min-width: 0` ：

```css
.card__title {
  flex: 1 1 0%;
  min-width: 0;
}
```

> Demo 地址： <https://codepen.io/airen/full/PoaJdwR>

而在 CSS 网格布局中，我们可以使用 `minmax(0, 1fr)` 来达到 Flexbox 布局中 `flex: 1` 同等的收缩或扩展的效果。这样做除了可以避免触发网格项目最小尺寸的缺陷之外，其他网格项目也不会因网格容器空间变小而被挤压变形。

先来看一个长文本截取的示例：

```html
<div class="target">
  <div class="target__title">
    <strong>Grid Layout:</strong> Text here is very very long that it might get truncate
    if this box get resized too small
  </div>
  <div class="target__emoji">🎃</div>
</div>
<style>
  .target {
    display: grid;
    grid-template-columns: minmax(0, 1fr) min-content; /* 或grid-template-columns: auto min-content; */
    align-items: center;
    gap: 1rem;
  }
  .target__title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
```

![[_attachment/img/f614a72598b3fdb633d09b550f6c7e8a_MD5.gif]]

> Demo 地址： <https://codepen.io/airen/full/poKWOgm>

注意，如果网格轨道 `grid-template-columns` 设置的值是 `auto min-content` 时，个人建议在 `.target__title` 上显式设置 `min-width` 的值为 `0` ，这是为了避免触发网格项目最小尺寸的缺陷。

再回过头来看上面 Flexbox 制作的卡片收缩的示例。使用 CSS 网格和子网格来替代原本的 Flexbox 布局方案：

```html
<div class="container">
  <div class="card">
    <figure class="avatar">
      <img
        src="avatar.jpg"
        alt=""
      />
    </figure>
    <h3 class="title">Long Title</h3>
    <div class="icon"><svg></svg></div>
  </div>
</div>
```

```css
.container {
  display: grid;
  grid-template-columns: min-content minmax(0, 1fr) min-content; /*  或 min-content auto min-content */
  gap: 1rem;
}

.card {
  grid-column: 1 / -1;

  display: inherit;
  grid-template-columns: subgrid;
  gap: 10px;
  align-items: center;
}

.title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
```

![[_attachment/img/492cf13e23a89a9382690192494317b1_MD5.gif]]

> Demo 地址：<https://codepen.io/airen/full/oNyGPww>

上面示例是长文截取的一个常见案例，CSS 处理这种场景已有很成熟的解决方案了。除此之外，还有对列表项截取的场景，如下图所示：

![[_attachment/img/2e7247114fa3d2c07a8274c733e8b7a8_MD5.jpeg]]

设计师期望的效果是，列表项（标题下的“徽标”列表）总是只显示一行，并且当“徽标”项过多时，在最末尾添加省略号指示器（`…`）。

就上图设计效果而言，不管是 CSS 的 Flexbox 还是 Grid 布局技术都存有一定的缺陷。

```html
<!-- 结构1 -->
<ul class="badges">
  <li>Fast food</li>
</ul>

<!-- 结构2 -->
<ul class="badges">
  <li><span>Fast food</span></li>
</ul>
```

```css
.badges {
  display: flex;
  gap: 0.5rem;
}

.flex .media:nth-of-type(1) .badges {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.flex .media:nth-of-type(2) li {
  min-width: 0;
}

.grid .media:nth-of-type(1) .badges,
.grid .media:nth-of-type(2) .badges {
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: auto;
  grid-auto-columns: auto;
}

.grid .media:nth-of-type(1) .badges {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.grid .media:nth-of-type(2) li {
  min-width: 0;
}

.badges span {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

![[_attachment/img/33b7510ce380ce6f16ca41ee08f2166a_MD5.jpeg]]

> Demo 地址：<https://codepen.io/airen/full/YzvEGaE>

正如你所看到的，Flexbox 和 Grid 技术实现的效果都不是设计师所期待的。这里每种技术方案分别有两种不同的效果，它们都和对应的 HTML 结构有着直接关系。第一种是“溢出容器的徽标被裁剪了”，它对应的是 “结构 1” 的 HTML：

```html
<ul class="badges">
  <li>Fast food</li>
</ul>
```

第二种是“每个徽标上都添加了指示器符号 `…` ”，它对应的是“结构 2”的 HTML:

```html
<!-- 结构2 -->
<ul class="badges">
  <li><span>Fast food</span></li>
</ul>
```

要实现所需的效果，我们需要稍微对 CSS 代码做一点改变。需要在 `li` 上定义为 Flexbox 或 网格容器：

```css
.flex.badges li {
  display: inline-flex;
}

.grid.badges li {
  display: inline-flex;
}
```

除此之外，还可以将 `li` 的 `display` 设置为 `inline-block` ，它与 `inline-flex` 和 `inline-grid` 起到相同的效果。

最后一个列表项后面添加省略号（`…`）指示器，还需要使用 `line-clamp` 或 `text-overflow` ：

```css
/* 方案一 */
.badges {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

/* 方案二 */
.badges {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
```

![[_attachment/img/ee158f9c7f4a0ef518e261455be2f75d_MD5.jpeg]]

> Demo 地址：<https://codepen.io/airen/full/dyKZObm>

## 宽高比布局

![[_attachment/img/38d43c0fdc66742d4afd79263bc3afbb_MD5.jpeg]]

按照宽高比的设计风格在 Web 页面中也很常见，但它一直受着技术实现的限制。虽然 CSS 的 `aspect-ratio` 得到大多主流浏览器的支持，但用于 Web 布局时，所受限制还是很大的。因为使用 `aspect-ratio` 总是会影响到元素盒子尺寸：

- 提供元素宽度，根据宽高比计算元素高度；
- 提供元素高度，根据宽高比计算元素宽度。

但 Flexbox 和 Grid 布局中，Flex 项目和 Grid 项目尺寸会受对齐属性的影响。也正因此，在 Flexbox 布局中，一般将 `flex-grow` 和 `aspect-ratio` 设置同等比例，从而实现宽高比的布局效果。

![[_attachment/img/a960abd70ef703e6ccc5f423a62256a4_MD5.jpeg]]

> Demo 地址： <https://codepen.io/airen/full/OJZvQop>

可在 CSS 网格布局中，实现宽高比例布局，它所面对的环境更为复杂。除了对齐属性会影响网格项目尺寸之外，合并网格单元、网格轨道尺寸、网格轨道之间间距等都会对网格项目尺寸有所影响。比如下面这个示例：

```html
<div class="container">
  <div class="item">4:3</div>
  <div class="item">4:3</div>
  <div class="item">4:3</div>
  <div class="item">4:3</div>
</div>
```

```css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(0, 1fr));
}

.item {
  aspect-ratio: 4 / 3;
}
```

![[_attachment/img/0f5a6e15a01d8832c3550d1f5bfd2349_MD5.gif]]

> Demo 地址： <https://codepen.io/airen/full/KKeyaKv>

如上图所示，当网格容器没有显式指定行网格轨道尺寸时，示例中的网格项目的宽高比都是 `4:3` ，布局效果还算是完美的。但是，只要设置了网格轨道尺寸，比如 `grid-auto-rows` 设置为 `200px` ，它小于计算出来的网格项目高度，这个时候网格项目虽然还保持着正常的宽高比，但会发现致命的问题，**网格项目重叠在一起** 。这样的效果不是我们所能接受的。

即使行网格轨道尺寸是 `auto` ，但网格项目总有不同的宽高比情况出现。你会发现，网格项目具有不同宽高比时，行网格轨道将会以最高的网格项目尺寸为计算值，这样网格项目之间就会有空白空间出现：

![[_attachment/img/8f5c417a9b6fef1e088cca592c61fdcd_MD5.jpeg]]

你可能会想到，像 Flexbox 布局那样，将每个网格项目计算宽高比例带上 `fr` 单位，当作网格轨道尺寸，比如：

```html
<div class="container">
  <div class="item">4:3</div>
  <div class="item">16:9</div>
  <div class="item">1:1</div>
</div>
```

```css
.container {
  grid-template-columns: 1.3333fr 1.7778fr 1fr;
}

.item:nth-child(1) {
  aspect-ratio: 4 / 3;
}

.item:nth-child(2) {
  aspect-ratio: 16 / 9;
}

.item:nth-child(3) {
  aspect-ratio: 1 / 1;
}
```

![[_attachment/img/43f1869f3b5a39d827806715a5fe6366_MD5.jpeg]]

看上去是不错，网格项目符合宽高比的布局。但网格不可能永远是一行多列的，它也会有多行，这才是我们更需要的网格。可是，当有多行出现，并且网格项目宽高比也不同时，网格又将会被打破：

![[_attachment/img/eeb6deb1d3c5d79994e064d5bb559dca_MD5.jpeg]]

当然，这是一种思路，只不过我们需要使用嵌套网格来构建，不同内部网格根据使用的网格数量和网格项目来重新定义列网格轨道尺寸。但 **需要保证每个内部网格只有一行** ：

```html
<div class="grid">
  <div class="subgrid">
    <div class="item">4:3</div>
    <div class="item">16:9</div>
    <div class="item">1:1</div>
  </div>

  <div class="subgrid">
    <div class="item">1:1</div>
    <div class="item">2:1</div>
    <div class="item">4:3</div>
    <div class="item">16:9</div>
  </div>
</div>
```

```css
.grid {
  display: grid;
  gap: 1rem;
  inline-size: 90vw;
}

.item {
  aspect-ratio: var(--ratio, 1);
}

.subgrid {
  display: inherit;
  gap: 1rem;
}

.subgrid:nth-child(1) {
  grid-template-columns: 1.333fr 1.778fr 1fr;
}

.subgrid:nth-child(2) {
  grid-template-columns: 1fr 2fr 1.333fr 1.778fr;
}
```

![[_attachment/img/eacbab2d43c70873ba523289204ebba8_MD5.jpeg]]

> Demo 地址： <https://codepen.io/airen/full/YzvEZNQ>

虽然这样可以构建带有宽高比网格项目的布局，但是每一次定义网格时，网格轨道都需要做两件事情：

- 要知道网格中有多少个网格项目，每个网格项目的宽高比 `aspect-ratio` 值；
- 根据每个网格项目的 `aspect-ratio` 值计算出网格列轨道尺寸。

你可能会想到使用 CSS 自定义属性来帮助计算网格轨道的 `fr` 单位值，但我要告诉大家的是，**在 CSS 中** **`fr`** **单位是无法和** **`calc()`** **函数一起使用的，所以无法使用自定义属性计算出** **`fr`** **单位值**。

还有其他情景，这里就不再一一阐述了。但不管使用哪种方案，要在网格布局中实现网格项目有自己的宽高比，而且又不打破网格布局的美感和优势，总是缺不了计算。既然如此，或许我们使用 CSS 自定义属性，可以帮助我们找到一个较为适合的解决方案，**允许我们创建任何宽高比的网格单元格** 。

首先要说的是，这个解决方案不能适用于所有场景，尤其是响应式布局中。这个方案必须要知道五个值：

- **网格容器的尺寸** ，最好是一个固定值或视窗单位值；
- **网格列轨道数量**；
- **网格列轨道之间的间距**；
- **单元格宽高比** ，你希望的网格单元格要的宽高比。

我们可以使用 CSS 自定义属性，将这几个需要的值保存起来：

```css
:root {
  --gridContainerWidth: 80vw; /* 网格容器尺寸 */
  --columns: 4; /* 网格列轨道数量 */
  --gap: 1rem; /* 网格列轨道之间间距 */
  --ratio: 1; /* 网格单元格宽高比 */
}
```

现在我们知道网格的列数，网格容器的尺寸了，可以使用 `grid-template-columns` 和 `1fr` 将网格分成 `--columns` 列：

```css
.container {
  inline-size: var(--gridContainerWidth);

  display: grid;
  grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
  gap: var(--gap);
}
```

只是这样定义我们的网格还是不够的，要实现每个网格单元格具有相同的宽高比例 `--ratio` 的话，需要使用 `grid-auto-rows` 来定义行网格轨道尺寸。这里为什么使用 `grid-auto-rows` ，而不使用 `grid-template-rows` 呢？主要原因是我们不知道网格会有多少行，所以使用 `grid-auto-rows` 来定义行网格轨道尺寸（隐式行网格轨道）。

最为关键是，`grid-auto-rows` 的值是多少？ 这也是这个方案中最为重要的一点。假设它的值也是一个 CSS 自定义属性，比如 **`--rowSize`** 。它的值是根据网格容器尺寸（`--gridContainerWidth`）、网格列轨道数量（`--columns`）和列间距（`--gap`）计算出来的：

```css
:root {
  --rowSize: calc(
    (var(--gridContainerWidth) - ((var(--columns) - 1) * var(--gap))) / var(--columns)
  );
}
```

> 注意，这里网格单元格宽高比是 `1:1` ，这样易于理解，后面会介绍别的比例！

创建网格所需的代码就会是：

```css
:root {
  --gridContainerWidth: 80vw; /* 网格容器尺寸 */
  --columns: 4; /* 网格列轨道数量 */
  --gap: 1rem; /* 网格列轨道之间间距 */
  --ratio: 1; /* 网格单元格宽高比 */

  /* 计算出网格行轨道尺寸 */
  --rowSize: calc(
    (var(--gridContainerWidth) - ((var(--columns) - 1) * var(--gap))) / var(--columns)
  );
}

/* 定义一个网格 */
.container {
  inline-size: var(--gridContainerWidth);

  display: grid;
  grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
  gap: var(--gap);

  grid-auto-rows: var(--rowSize);
}
```

你还可以在网格容器上设置 `grid-auto-flow: dense` ，避免网格洞现象的出现，在 `grid-auto-rows` 中的 `--rowSize` 和 `minamx()` 结合起来使用，这样一来，网格项目内容变高时，它也能变高（只有在列轨道尺寸是 `1fr` 才有效）：

```css
:root {
  --gridContainerWidth: 80vw; /* 网格容器尺寸 */
  --columns: 4; /* 网格列轨道数量 */
  --gap: 1rem; /* 网格列轨道之间间距 */
  --ratio: 1; /* 网格单元格宽高比 */

  /* 计算出网格行轨道尺寸 */
  --rowSize: calc(
    (var(--gridContainerWidth) - ((var(--columns) - 1) * var(--gap))) / var(--columns)
  );
}

/* 定义一个网格 */
.container {
  inline-size: var(--gridContainerWidth);

  display: grid;
  grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
  gap: var(--gap);

  grid-auto-rows: minmax(var(--rowSize), auto);
  grid-auto-flow: dense;
}
```

这样就创建了一个四列 `N` 行的网格，而且每个单元格的宽高比都是 `1 : 1` ：

![[_attachment/img/e0a309098da58487a57f6d35c1b62977_MD5.jpeg]]

根据需要，在网格项目上使用 `grid-area` （或 `grid-row` 和 `grid-column` ）放置网格项目，可以换作一个方式得到具有不同宽高比的网格项目：

```css
/* aspect-ratio: 1 / 1 */
.item:nth-child(1) {
  grid-row: span 2;
  grid-column: span 2;
}

/* aspect-ratio: 2 / 1 */
.item:nth-child(2) {
  grid-column: span 2;
}

/* aspect-ratio: 1 / 1 */
.item:nth-child(4) {
  grid-row: 2 / span 2;
  grid-column: 3 / span 2;
}
```

![[_attachment/img/c4f1bc980a8c9932a9d8e6e9a1780213_MD5.jpeg]]

> Demo 地址： <https://codepen.io/airen/full/XWYzRbM>

上面的示例网格单元格宽高比例都是 `1:1` ，但我们所需要的比例肯定不是这样，我们可能会有 `16:9` 、`4:3` 等等。在改变宽高比的同时，行网格轨道尺寸就会有变化，而且计算 `--rowSize` 时会比 `1:1` 宽高比时更复杂一点。但不用担心，使用 CSS 自定义属性，并不会额外增加多少难度。

上面示例中，定义了 `--ratio` ，并且它的值是 `1` 。现在需要将它拆分出两个部分，比如 `--ratioW` （宽）和 `--ratioH` （高），并且根据 `--ratioW` 和 `--ratioH` 计算出 `--ratio` ：

```css
:root {
  /* 假设宽高比是 16:9 */
  --ratioW: 16;
  --ratioH: 9;

  /* 计算出宽高比 */
  --ratio: calc(var(--ratioW) / var(--ratioH));

  /* 使用宽高比来计算乘法因子，计算行网格轨道需要使用 */
  --factor: calc(1 / var(--ratio)); /* 等同于 calc(var(--ratioH) / var(--ratioW)) */
}
```

根据计算出来的 `--factor` 再来计算 `--rowSize` ：

```css
:root {
  --rowSize: calc(
    ((var(--gridContainerWidth) - ((var(--columns) - 1) * var(--gap))) / var(--columns)) *
      var(--factor)
  );
}
```

将它们放到一起就是：

```css
:root {
  --gridContainerWidth: 80vw; /* 网格容器尺寸 */
  --columns: 4; /* 网格列轨道数量 */
  --gap: 1rem; /* 网格列轨道之间间距 */

  /* 假设宽高比是 16:9 */
  --ratioW: 16;
  --ratioH: 9;

  /* 计算出宽高比 */
  --ratio: calc(var(--ratioW) / var(--ratioH));

  /* 使用宽高比来计算乘法因子，计算行网格轨道需要使用 */
  --factor: calc(1 / var(--ratio)); /* 等同于 calc(var(--ratioH) / var(--ratioW)) */
  --rowSize: calc(
    ((var(--gridContainerWidth) - ((var(--columns) - 1) * var(--gap))) / var(--columns)) *
      var(--factor)
  );
}

/* 定义一个网格 */
.container {
  inline-size: var(--gridContainerWidth);

  display: grid;
  grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
  gap: var(--gap);

  grid-auto-rows: minmax(var(--rowSize), auto);
  grid-auto-flow: dense;
}
```

如此一来，每个网格单元格宽高比都是 `16:9` ：

![[_attachment/img/d81162053f0706e6ea959fa8441a11d3_MD5.jpeg]]

指定网格项目位置：

```css
.item:nth-child(1) {
  grid-row: span 2;
  grid-column: span 2;
}

.item:nth-child(2) {
  grid-column: span 2;
}

.item:nth-child(4) {
  grid-row: 2 / span 2;
  grid-column: 3 / span 2;
}
```

![[_attachment/img/3b45fb0f592ac86c6e99f7307b6cc7f8_MD5.jpeg]]

> Demo 地址： <https://codepen.io/airen/full/rNKYmvG>

如果你需要不同网格单元格宽高比时，只需要调整 `--ratioW` 和 `--ratioH` 的值，比如：

```css
.grid-1-1 {
  --ratioW: 1;
  --ratioH: 1;
}

.grid-16-9 {
  --ratioW: 16;
  --ratioH: 9;
}
```

如果你需要调整网格尺寸和网格轨道以及列间距之类，就需要调整 `--gridContainerWidth` 、`--columns` 和 `--gap` 。换句话说，你可以在 `--gridContainerWidth` 为 `100vw` 时，通过媒体查询来调整 `--columns` 、`--gap` ，甚至是 `--ratioW` 和 `--ratioH` 的值，这样就可以获得一个响应式宽高比的网格。比如：

```css
:root {
  --gap: 10px;
  --gridContainerWIDTH: calc(100vw - (2 * var(--gap)));
  --columns: 2;
  --ratioW: 16;
  --ratioH: 9;
}

@media only screen and (min-width: 60em) {
  :root {
    --gridContainerWidth: 60em;
    --gap: 20px;
    --columns: 4;
    --ratioW: 1;
    --ratioH: 1;
  }
}
```

构建带有宽高比的网格之后，只需要将内容填充进网格项目中就行了。

**作业** ，请使用 CSS 网格布局，构建下图这个布局效果：

![[_attachment/img/301cf45b3276b9f44f68209e0779e07e_MD5.jpeg]]

## 小结

这节介绍了如何使用 CSS 网格布局技术来实现 Web 中十种经典布局，它和[[grid 子网格构建布局（八）|前面的一篇文章]]所涉及到的案例基本是相似的。不同的是采用了两种现代布局方案来完成，大家可以对比看看，同样的布局效果，Flexbox 布局和 Grid 布局有何差异。这些差异有没有给你带来新的思路。

这节主要介绍的是 Web 中经典布局，但 CSS 网格还可以帮你创建很多有创造性布局，接下来就和大家一起探讨，CSS 网格布局如何构建具有创造性的复杂 Web 布局。

**CSS Grid CheatSheet （CSS 网格备忘图）** ，你可以点击查看大图：

![[_attachment/img/c9baba7e658ce1eecb0c2ffd2c19e3b7_MD5.jpeg]]
