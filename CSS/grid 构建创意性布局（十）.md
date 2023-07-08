---
aliases: []
tags: ['CSS', 'date/2023-02', 'year/2023', 'month/02']
date: 2023-02-13-星期一 16:55:59
update: 2023-02-13-星期一 17:01:26
---

CSS 网格模块为 Web 布局提供了前所未有的可能性。我们可以用更少的元素（更简洁的 HTML 结构）构建更复杂的设计。相对而言，它要比 Flexbox 布局模块强很多。CSS 网格布局除了能轻易构建常见的 Web 布局之外，还可以实现很多有创意的响应式布局效果，让你对 Web 布局有一种焕然一新的感觉。

## 网格能构建哪些有创意性的 Web 布局？

![](_attachment/img/f6cfb9355f2a1b9587143e4bb8bfd8c6_MD5.png)

如上图所示，在 Web 中类似于杂志类排版的布局越来越多，以往要实现杂志报刊类 Web 布局是件痛苦的事情，即使能实现，也会让 HTML 结构变得臃肿复杂。现在我们只需要在 CSS 网格模块的基础上，再结合一些其他的 CSS 特性就可以实现。换句话说，实现类似杂志、报刊类的 Web 布局，你可能还会用到以下 CSS 特性：

- **多列布局**，可以将同一元素里内容自动分成多栏；
- **CSS Regions 和 Exclusions**，可以很好地解决文本围绕图片的效果，只是目前支持的浏览器非常的少；
- **CSS Shapes**，可以让内容在任何不规则的容器中流动，文本也可以围绕着任意不规则的图形排列；
- **CSS Clipping 和 Masking**，可以裁剪出不规则的图形或形状，也可以让元素按不规则形状展示；
- **CSS 书写模式和逻辑属性**，可以让文本竖排，也可以按不同的书写（阅读）方式排列；
- **首字下沉**，是杂志报刊类常见的一种效果，可以使用 `initial-letters` 轻易实现首字下沉的效果；
- **Web Fonts 和可变字体**，可以让文本更具艺术效果，视觉更具冲击性。

注意，在接下来介绍的报刊杂志类的 Web 布局案例，我们可能只会用到上面所列的部分技术，比如 **多列布局** 、**CSS 剪切（Clipping）和蒙板（Masking）** 以及 **CSS 书写模式** 等。

除了杂志类的 Web 布局之外，CSS 网格布局技术、 CSS 的 `clip-path` （剪切）和 `mask` （蒙板）等技术的结合，还可以实现类似海报、漫画类的 Web 布局：

![](_attachment/img/5eeeba07ec034c9aa157258520fe8a99_MD5.png)

除此之外，还可以让一些常规的 Web 布局在视觉上的效果与众不同。虽然视觉上变得更复杂了，但实现的过程却不见得更复杂，有些甚至变得更简单。比如下图中的卡片、图文层叠、混排等效果：

![](_attachment/img/e4ceacca8c916b7586ea13f537a874e2_MD5.png)

接下来，我们一起动手，写几个 Demo。希望大家能在下面这几个实战的案例进一步加强 CSS 网格布局的理解！

## 杂志报刊类布局

![](_attachment/img/a52e44a30db75c48415040eebd706070_MD5.png)

这是一个简化版的杂志类风格的 Web 布局效果。它有着几个明显的特征：

- 左侧英雄图（Hero）是不规则的；
- 标题背景是个平形四边形；
- 内容第一个段落首字母下沉；
- 标题和英雄图有部分重叠。

假设构建上图中的效果所需的 HTML 是：

```html
<body>
  <!-- 英雄图（Hero） -->
  <figure>
    <img
      src=""
      alt=""
    />
  </figure>

  <!-- 标题 -->
  <h1>标题</h1>

  <!-- 主内容 -->
  <div class="content-wrap">
    <div class="content"></div>
  </div>

  <!-- 引言 -->
  <blockquote></blockquote>

  <!-- 媒体链接 -->
  <ul>
    <li>
      <a href=""><svg></svg></a>
    </li>
  </ul>
</body>
```

HTML 结构简洁清晰。对于实现所需的布局效果也很简单。

假设设计师在设计图上就给 Web 上每个内容区域定义好网格的区域和位置等，如下图所示：

![](_attachment/img/7c213bd97f1f6472505de2485b7abcb9_MD5.png)

很明显，它就是一个两行八列（`2 x 8`）的网格。用 CSS 网格的 `grid-template-rows` 和 `grid-template-columns` 很容易就定义出这样的网格：

```css
body {
  display: grid;

  grid-template-columns: repeat(8, minmax(0, 1fr));
  grid-template-rows: auto minmax(0, 1fr);
  gap: 2rem;
}
```

![](_attachment/img/e87baf6302458c21e71954ec4fdd6d84_MD5.png)

从设计稿上，不难发现 Web 页同上的每个区域都被划分在指定的网格线围绕的区域内：

![](_attachment/img/72418241578bde494c7f1373d8c3e1b4_MD5.png)

你可能已经想到了。CSS 网格模块中的 `grid-area` 、`grid-row` 和 `grid-column` 可以很容易实现它：

```css
figure {
  grid-column: 1 / span 4;
  grid-row: 1 / span 2;
}

h1 {
  grid-row: 1;
  grid-column: 4 / 8;
  z-index: 2;
}

blockquote {
  grid-row: 2;
  grid-column: 5 / 7;
  justify-self: end;
}

.content-wrapper {
  grid-row: 2;
  grid-column: 7 / 9;
  min-height: 0;
}

ul {
  grid-column: 4 / span 3;
  grid-row: 2;
}
```

如果仅仅是实现内容区域在网格中的位置、大小等效果，上面的代码就足够了！而这个效果还需要额外处理一下才能达到。首先左侧英雄图（Hero），它并不是一个矩形图，它是一个多边形的图片。在 CSS 中，使用剪切（Clipping）特性 `clip-path` 就可以实现：

```css
figure {
  clip-path: polygon(0 0, 100% 0, 65% 100%, 0 100%);
}
```

![](_attachment/img/5411a7ee79a164c82f7db9e9483cbaf5_MD5.png)

标题背景（平形四边形）的效果，对于大家来说应该不会有任何难度了。这里为了避免文本也因 `transform` 的 `skewX()` 变形（扭曲），所以标题背景通过 `h1` 的伪元素 `::after` 来实现：

```css
h1::after {
  content: '';
  position: absolute;
  inset: 0;
  background-color: #fff;
  z-index: -1;
  transform: skewX(-20deg);
  border-radius: 5px;
  filter: drop-shadow(8px 8px 0 rgb(0 0 0 / 0.5));
}
```

最后一个效果就是主内容第一个段落的首字母下沉的效果。 CSS 中有一个属性可以直接实现首字下沉的排版效果，即 `initial-letter` ：

```css
.content p:first-child::first-letter {
  initial-letter: 3;
}
```

对于不支持 `initial-letter` 的浏览器，依旧可以使用浮动来实现首字下沉的效果。当然，你还可以通过 `@supports` 来做一个判断，最终使用哪种方案交由浏览器自己决定：

```css
@supports not (initial-letter: 3;) {
  .content p:first-child::first-letter {
    color: #000;
    float: left;
    font-size: 6em;
    margin: 0 0.2em 0 0;
  }
}

@supports (initial-letter: 3;) {
  .content p:first-child::first-letter {
    initial-letter: 3;
  }
}
```

最后再修饰一下，该居底部的居底部，该右对齐的右对齐。

```css
blockquote {
  justify-self: end;
}
ul {
  align-self: end;
}
```

一个简单的杂志类布局效果就完成了：

![](_attachment/img/a52e44a30db75c48415040eebd706070_MD5.png)

> Demo 地址：<https://codepen.io/airen/full/qBKpJRX>

上面这个效果只在宽屏的时候还不错，在窄屏下效果就差强人意了。不过不用担心，只需要通过 `@media` 稍加处理一下，就可以实现一个具有响应式杂志类排版效果：

```css
body {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto auto;
  grid-template-columns: 1rem 1fr 1rem;
  gap: 2rem;
}

figure {
  grid-row: 1 / -1;
  grid-column: 1 / -1;
}

h1 {
  grid-row: 1;
  grid-column: 2 / 3;
  z-index: 2;
}

blockquote {
  grid-column: 2 / 3;
  grid-row: 3 / 4;
  z-index: 2;
}

.content-wrapper {
  min-height: 0;
  grid-row: 2 / 3;
  grid-column: 2 / 3;
  z-index: 2;
}

ul {
  grid-row: 4 / 5;
  grid-column: 2 / 2;
  z-index: 2;
}

@media only screen and (min-width: 768px) {
  body {
    grid-template-columns: repeat(8, minmax(0, 1fr));
    grid-template-rows: auto minmax(0, 1fr);
  }

  h1 {
    grid-row: 1;
    grid-column: 4 / 8;
  }

  figure {
    grid-column: 1 / span 4;
    grid-row: 1 / span 2;
  }

  blockquote {
    grid-row: 2;
    grid-column: 5 / 7;
    justify-self: end;
  }

  .content-wrapper {
    grid-row: 2;
    grid-column: 7 / 9;
    min-height: 0;
  }

  ul {
    grid-column: 4 / span 3;
    grid-row: 2;

    align-self: end;
  }
}
```

![](_attachment/img/84c2e268e91222ce677de0c57f0ba36f_MD5.gif)

> Demo 地址：<https://codepen.io/airen/full/XWYVoMw>

**作业** ：使用 CSS 网格和媒体查询完成下图的布局效果：

![](_attachment/img/c6f84e7aaaf7d2215a0e40fae70811d6_MD5.png)

## 动漫和画报类布局

你可能会觉得杂志报刊类的 Web 布局没有太多的挑战性，那么接下来的动漫和画报类的布局，可能会更有意思一些。

![](_attachment/img/05a7352ec9fe376fedd0fd585d15cd49_MD5.png)

_漫画类布局效果_！

> 特别声明：该插图来自于 @Andy Clarke 的 《[Art Direction for the Web](https://stuffandnonsense.co.uk/artdirectionfortheweb/index.html)》一书

![](_attachment/img/a6981170a6d0ec2407dd6e636a861049_MD5.png)

_画报（海报）类布局效果_ ！

我们先来看漫画类的布局效果！

![](_attachment/img/c48d7eb9d4cb170f8d7cbbadcb7efa07_MD5.png)

这个故事中包括了六个元素（移动端只有五个元素）：

- 标题；
- 主内容；
- 摘要；
- 漫画图 1；
- 漫画图 2；
- 漫画图 3。

在两个断点下有不同的排版效果，比如浏览器视窗宽度小于 `1024px` 是平板和移动端中的布局效果（上图中左侧效果），大于 `1024px` 则是桌面端的布局效果（上图中右侧效果）。

先不考虑布局效果，根据漫画中的主要元素来编写所需的 HTML 结构，如果以内容先行的话，它的结构可能会像下面这样：

```html
<body>
  <h1>故事标题</h1>
  <aside>故事摘要</aside>
  <main>故事内容</main>
  <figure>
    <img
      src=""
      alt="漫画图1"
    />
  </figure>
  <figure>
    <img
      src=""
      alt="漫画图2"
    />
  </figure>
  <figure>
    <img
      src=""
      alt="漫画图3"
    />
  </figure>
</body>
```

我们将使用网格来构建所需要的布局效果。简单地说，我们需要在不同断点下构建不同的网格，如下图所示：

![](_attachment/img/190229c70b596028a37ddb8aaf099963_MD5.png)

正如上图所示，左侧是平板和移动端（断点小于 `1024px` ），即默认的列网格轨道数量和尺寸：

```css
body {
  display: grid;

  grid-template-columns: 1rem min-content minmax(0, 1fr) 1rem;
}
```

网格轨道的第一列和最后一列定义的尺寸是 `1rem` ，这是为了给页面留白，第二列设置 `min-content` 是为了让该列网格轨道尺寸和“漫画图 1”设置的尺寸相同，最后网格容器剩下的空间都给第三列。

浏览器视窗宽度大于 `1024px` 时，除了第一列和最后一列留白（即 `1rem` ）之外，将剩余下的网格容器空间分成五个等份。而且列与列之间有一定的间距，假设是 `10px` 。那么我们就可以使用 `@media` 重新调整 `body` 的 `grid-template-columns` 属性值，并且添加 `gap` 属性：

```css
@media only screen and (min-width: 1024px) {
  body {
    grid-template-columns: 1rem repeat(5, minmax(0, 1fr)) 1rem;
    column-gap: 10px;
  }
}
```

按同样的方式，使用 `grid-template-rows` 定义行网格轨道数量和尺寸：

```css
body {
  display: grid;

  grid-template-columns: 1rem min-content minmax(0, 1fr) 1rem;
  grid-template-rows: repeat(4, auto);
}

@media only screen and (min-width: 1024px) {
  body {
    grid-template-columns: 1rem repeat(5, minmax(0, 1fr)) 1rem;
    column-gap: 10px;
    grid-template-rows: repeat(3, auto);
  }
}
```

到这里，需要的网格就定义好了。浏览器客户端会根据定义好的网格创建网格线名称，我们就可以使用 `grid-row` 、`grid-column` 和 `grid-area` 根据网格线名称来放置网格项目。

由于这个网格在浏览器视窗断点不同时，定义的网格也不同，将会造成网格线的索引编号也不同。如果继续使用网格线索引号来放置网格项目的话，就需要在不同断点下调整网格线的名称。为了减少这种重复性的工作，在定义网格的时候，可以使用 `grid-template-areas` 给网格区域命名：

```css
body {
  display: grid;

  grid-template-columns: 1rem min-content minmax(0, 1fr) 1rem;
  grid-template-rows: repeat(4, auto);

  grid-template-areas:
    '.  fig-1   aside  .'
    '.  .       title  .'
    '.  banner  banner .'
    '.  .       main   .';
}

@media only screen and (min-width: 1024px) {
  body {
    grid-template-columns: 1rem repeat(5, minmax(0, 1fr)) 1rem;
    column-gap: 10px;
    grid-template-rows: repeat(3, auto);

    grid-template-areas:
      '.  .      aside  .       fig-2   fig-2   .'
      '.  title  title  banner  banner  banner  .'
      '.  fig-1  main   banner  banner  banner  .';
  }
}
```

漫画中每个部分对应一个网格区域名称：

- 标题 » `title`；
- 主内容 » `main`；
- 摘要 » `aside`；
- 漫画图 1 » `fig-1`；
- 漫画图 2 » `banner`；
- 漫画图 3 » `fig-2`。

如此一来，放置网格项目只需要使用已命名好的网格区域名称即可：

```css
.title {
  grid-area: title;
}

aside {
  grid-area: aside;
}

main {
  grid-area: main;
}

.banner {
  grid-area: banner;
}

.fig-1 {
  grid-area: fig-1;
}

.fig-2 {
  grid-area: fig-2;
}
```

这时候你看到布局越来越接近所期望的了：

![](_attachment/img/0b208ef11493a4fa1a4615b5116c9a94_MD5.png)

需要注意的是，“漫画图 3” 只在浏览器视窗宽度大于 `1024px` 中显示，因此为了让布局不因它打破，需要在小于 `1024px` 断点下将其隐藏：

```css
.fig-2 {
  display: none;
}

@media only screen and (min-width: 1024px) {
  .fig-2 {
    display: block;
  }
}
```

现在剩下的就是完善 Web 页面元素的其他样式了。最终你看到的效果如下：

![](_attachment/img/5b9af11b1ef689b2b7b15c06a017556d_MD5.gif)

> Demo 地址： <https://codepen.io/airen/full/QWxaYYj> （**特别声明：该插图来自于 @Andy Clarke 的《[Art Direction for the Web](https://stuffandnonsense.co.uk/artdirectionfortheweb/index.html)》一书** ！）

再来看另一个案例，即“画报类”布局效果：

![](_attachment/img/a6981170a6d0ec2407dd6e636a861049_MD5.png)

其实这个示例的布局是非常简单的。它和我们前面看到的“图片墙”、“九宫格”以及“交叉类”布局是非常相似的。简单地说，它就是一个多行多列的的网格，并且因部分网格项目放置同一个网格单元格，它们有相互重叠的效果。

![](_attachment/img/2fe327d4f52972cae49cebbd0886b160_MD5.png)

就上图而言，不规则的效果并不是因为网格产生，而是在不同的网格项目上使用了 `clip-path` 特性，裁剪出不同的多边形形状，并且在网格中堆叠在一起。最后实现类似画报（或海报）类的布局效果。

![](_attachment/img/43adcfa88b3ea3dcf9683642ab5f4a16_MD5.png)

有了这个基础，我们就可以开始动手实现画报类的布局了。

```html
<body>
  <figure>
    <img
      src=""
      alt=""
    />
  </figure>
  <!-- 省略其他的 figure -->
</body>
```

分别在不同的断点下定义网格：

```css
/* Mobile Layout */
body {
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: 200px;
  grid-auto-rows: 200px;
  row-gap: 1rem;
  grid-auto-flow: dense;
}

/* Tablet Layout */
@media only screen and (min-width: 768px) {
  body {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }
}

/* Desktop Layout*/
@media only screen and (min-width: 1024px) {
  body {
    grid-template-columns: 1.167fr 0.45fr 0.225fr 0.3fr 0.8fr;
    grid-template-rows: 0.44fr 0.1875fr 0.4fr 0.9fr 0.1875fr 0.44fr;
  }
}
```

在移动端（Mobile），网格项目是自动放置的，相当于它们的 `grid-column` 和 `grid-row` 值为 `auto` 。在网格布局中，如果网格项目是自动放置的话，它将根据自动放置算法来处理，我们不需要去额外做什么，但是为了避免网格洞现象出现，可以在网格容器上显式设置 `grid-auto-flow` 值为 `dense` 。

平板端（视窗断点大于 `768px` ，小于 `1024px` ），部分网格项目会合并行或列：

```css
@media only screen and (min-width: 768px) {
  figure:nth-of-type(2),
  figure:nth-of-type(5),
  figure:nth-of-type(10),
  figure:nth-of-type(12),
  figure:nth-of-type(16) {
    grid-row: auto / span 2;
  }

  figure:nth-of-type(16) {
    grid-column: 2;
  }

  figure:nth-of-type(4),
  figure:nth-of-type(8),
  figure:nth-of-type(11),
  figure:nth-of-type(15),
  figure:nth-of-type(19) {
    grid-column: auto / span 2;
  }
}
```

桌面端（视窗断点大于 `1024px`）和平板端是相似的，使用 `grid-row` 和 `grid-column` 指部分网格项目的位置。

```css
@media only screen and (min-width: 1024px) {
  figure:nth-of-type(1) {
    grid-column: 1 / 2;
    grid-row: 1 / 3;
  }

  figure:nth-of-type(2) {
    grid-column: 2 / 4;
    grid-row: 1 / 3;
  }

  figure:nth-of-type(3) {
    grid-column: 4 / 6;
    grid-row: 1 / 2;
  }

  figure:nth-of-type(4) {
    grid-column: 1 / 2;
    grid-row: 2 / 4;
  }

  figure:nth-of-type(5) {
    grid-column: 2 / 4;
    grid-row: 3 / 4;
  }

  figure:nth-of-type(6) {
    grid-column: 4 / 6;
    grid-row: 2 / 4;
  }

  figure:nth-of-type(7) {
    grid-column: 1 / 2;
    grid-row: 4 / 6;
  }

  figure:nth-of-type(8) {
    grid-column: 2 / 3;
    grid-row: 4 / 6;
  }

  figure:nth-of-type(9) {
    grid-column: 3 / 5;
    grid-row: 4 / 6;
  }

  figure:nth-of-type(10) {
    grid-column: 5 / 6;
    grid-row: 4 / 6;
  }

  figure:nth-of-type(11) {
    grid-column: 1 / 3;
    grid-row: 5 / 7;
  }

  figure:nth-of-type(12) {
    grid-row: 5 / 7;
    grid-column: 3 / 4;
  }

  figure:nth-of-type(13) {
    grid-column: 4 / 5;
    grid-row: 5 / 7;
  }

  figure:nth-of-type(14) {
    grid-column: 5 / 6;
    grid-row: 6 / 7;
  }

  figure:nth-of-type(15) {
    grid-column: 1 / 2;
    grid-row: 7 / 8;
  }

  figure:nth-of-type(16) {
    grid-row: 7 / 8;
    grid-column: 2 / 5;
  }

  figure:last-child {
    grid-column: 3 / 6;
    grid-row: 8 / 9;
  }

  figure:nth-of-type(19) {
    grid-column: auto;
  }
}
```

你现在看到的网格是这样的：

![](_attachment/img/7b4721491ad0170dd157a8fcba9450b1_MD5.gif)

根据需要，在网格项目上使用 `clip-path` 裁剪出不同（或相同）风格的多边形形状的效果：

```css
@media only screen and (min-width: 768px) {
  figure:nth-of-type(1),
  figure:nth-of-type(6),
  figure:nth-of-type(9),
  figure:nth-of-type(14),
  figure:nth-of-type(18) {
    clip-path: polygon(0 0, 100% 0, 100% 90%, 0 100%);
  }

  figure:nth-of-type(3),
  figure:nth-of-type(7),
  figure:nth-of-type(13),
  figure:nth-of-type(17),
  figure:nth-of-type(20) {
    clip-path: polygon(0 10%, 100% 0, 100% 100%, 0 100%);
  }
}

@media only screen and (min-width: 1024px) {
  figure:nth-of-type(1) {
    clip-path: polygon(0 0, 100% 0, 100% 66%, 0% 85%);
  }

  figure:nth-of-type(4) {
    clip-path: polygon(0 22%, 100% 4px, 100% 100%, 0% 100%);
  }

  figure:nth-of-type(8) {
    clip-path: polygon(0 20%, 100% 14px, 100% 59%, 0% 90%);
  }

  figure:nth-of-type(9) {
    clip-path: polygon(0 30%, 100% 4px, 100% 80%, 0% 60%);
  }

  figure:nth-of-type(11) {
    clip-path: polygon(0 10px, 100% 60%, 100% 100%, 0% 100%);
  }

  figure:nth-of-type(15) {
    clip-path: polygon(0 0, 100% 20%, 100% 100%, 0% 100%);
  }

  figure:nth-of-type(16) {
    clip-path: polygon(0 20%, 100% 0%, 100% 100%, 0% 100%);
  }

  figure:nth-of-type(18) {
    clip-path: polygon(0 0, 80% 0%, 100% 100%, 0% 100%);
  }

  figure:last-child {
    clip-path: polygon(20% 0, 100% 0%, 100% 100%, 0% 100%);
  }

  figure:nth-of-type(19) {
    clip-path: polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%);
  }
}
```

![](_attachment/img/e191d9888064d487237c2478e6e9526b_MD5.png)

剩余的就是往里面填画报图（或海报图）了。我在示例中填充的是一些随机图片。

![](_attachment/img/bcaf34023d6f1c72256f6aa8958e282a_MD5.gif)

> Demo 地址： <https://codepen.io/airen/full/NWzygOd>

**作业** ，使用 CSS 网格构建下图布局效果：

![](_attachment/img/d86ef210d16e4bfa0bd71bfbf2e4309c_MD5.png)

## 堆叠布局

![](_attachment/img/1c580b1981ca2b511913ac296d09db20_MD5.png)

> 上图来 Fork 自 [ @Morten Rand-Hendriksen 写的 Demo](https://codepen.io/mor10/full/oNBdamz)!

我们在介绍 CSS 网格模块理论知识的时候，就多次提到过，**使用 CSS 网格实现堆叠布局效果，要比其他的布局技术简单\*\*** 得\***\* 多** 。另外，堆叠的布局效果在 Web 中也随处可见，比如下图这种卡片组件：

![](_attachment/img/134ce62e606ca0ddef7e60dd668c2c8c_MD5.png)

> Demo 地址： <https://codepen.io/airen/full/MWvyGWp>

这是普通类的堆叠布局效果。

事实上，基于该原理，稍微发挥你的创意，同样是展示产品，可以有更好的创意。比如 [@Andy Barefoot](https://twitter.com/andybarefoot) 在 [他的个人网站](http://andybarefoot.com/) 和 [Codepen](https://codepen.io/andybarefoot) 上提供了很多有创意的响应式布局效果。

![](_attachment/img/43b45691a5cd7260df737d1486f0661b_MD5.png)

- ①：[Technical Product Grid](https://codepen.io/andybarefoot/full/eYzMoYv)；
- ②：[Responsive Product Grid with layered background](https://codepen.io/andybarefoot/full/wvKJweJ)；
- ③：[Grid of Thrones (Complete)](https://codepen.io/andybarefoot/full/YQwbbb)；
- ④：[CSS Grid Responsive Perspective layout](https://codepen.io/andybarefoot/full/GMyREX)；
- ⑤：[Responsive Stacked Cubes - CSS Grid](https://codepen.io/andybarefoot/full/ypPgod)；
- ⑥：[Tessellations eCommerce](https://codepen.io/andybarefoot/full/VwZjVma)；
- ⑦：[Isometric eCommerce CSS Grid](https://codepen.io/andybarefoot/full/PBPrex)；
- ⑧：[Skewed Responsive eCommerce CSS Grid](https://codepen.io/andybarefoot/full/XxqveV)；
- ⑨：[Responsive CSS Grid - Books](https://codepen.io/andybarefoot/full/oNjxYYG)。

这几个案例除了创意新颖之外，还有一个共同的特性，具有响应式网格布局：

![](_attachment/img/71da4d2c25951c0d8ff9dcf6ec03a99b_MD5.png)

接下来，我们以列表中的编号是 ② 和 ⑨ 为例，了解如何使用网格布局技术来实现具有响应式的堆叠效果：

![](_attachment/img/611424e2a37179db476587c8e15904c4_MD5.png)

除了具有响应式效果之外，它们还有一个共同的特征：不同层的叠加。另外，它们都采用了相似的 CSS 特性，比如 CSS 网格布局、自定义属性和媒体查询等。

它们所需的 HTML 结构：

```html
<!-- 编号 ② -->
<ul>
  <li>
    <img src="fashion1.png" />
    <div>
      <h2>The Ruched Air Blouse</h2>
      <p>$55</p>
    </div>
  </li>
  <!-- 省略其他 li -->
</ul>

<!-- 编号 ⑨ -->
<ul>
  <li>
    <img src="book.png" />
  </li>
  <!-- 省略其他 li -->
</ul>
```

我们将要实现的一个具有响应式布局的效果。同样遵循 **移动动先行原则** ，在移动端只有一列，因此使用自定义属性 `--columns` 来定义列数：

```css
/* Mobile */
:root {
  --columns: 1;
}

/* 定义网格，列数由 --columns 来决定 */
ul {
  display: grid;
  grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
}
```

注意，编号 ⑨ 案例的 `--columns` 的值为 `3` 。移动端（Mobile）下编号 ② 和 ⑨ 对应的网格如下图所示：

![](_attachment/img/cd67e7c5ce49abe7040db2dea83b6f2b_MD5.png)

使用 `@media` 在不同断点改变 `--columns` 的值，就可以在不同断点下得到不一样的网格：

```css
/* Case 1: Product (编号 ②) */
@media (min-width: 600px) {
  :root {
    --columns: 2;
  }
}

@media (min-width: 900px) {
  :root {
    --columns: 3;
  }
}

@media (min-width: 1200px) {
  :root {
    --columns: 4;
  }
}

@media (min-width: 1500px) {
  :root {
    --columns: 5;
  }
}

@media (min-width: 1800px) {
  :root {
    --columns: 6;
  }
}

/* Case 2: Book （编号⑨）*/
@media (min-width: 600px) {
  :root {
    --columns: 5;
  }
}

@media (min-width: 900px) {
  :root {
    --columns: 7;
  }
}

@media (min-width: 1200px) {
  :root {
    --columns: 9;
  }
}

@media (min-width: 1500px) {
  :root {
    --columns: 11;
  }
}

@media (min-width: 1800px) {
  :root {
    --columns: 13;
  }
}

@media (min-width: 2100px) {
  :root {
    --columns: 15;
  }
}
```

![](_attachment/img/e136c6368230f0aa4dc3a23874a7134c_MD5.png)

定义好网格之后只需要使用 `grid-*`（比如 `grid-column`、`grid-row` 或 `grid-area`）来明确放置网格项目：

```css
/* Case 2: Book 编号⑨ */
li {
  grid-column-end: span 2;
}

li:nth-child(2n) {
  grid-column-start: 2;
}

@media (min-width: 600px) {
  li:nth-child(2n) {
    grid-column-start: auto;
  }

  li:nth-child(4n-1) {
    grid-column-start: 2;
  }
}

@media (min-width: 900px) {
  li:nth-child(4n-1) {
    grid-column-start: auto;
  }

  li:nth-child(6n-2) {
    grid-column-start: 2;
  }
}

@media (min-width: 1200px) {
  li:nth-child(6n-2) {
    grid-column-start: auto;
  }

  li:nth-child(8n-3) {
    grid-column-start: 2;
  }
}

@media (min-width: 1500px) {
  li:nth-child(8n-3) {
    grid-column-start: auto;
  }

  li:nth-child(10n-4) {
    grid-column-start: 2;
  }
}

@media (min-width: 1800px) {
  li:nth-child(10n-4) {
    grid-column-start: auto;
  }

  li:nth-child(12n-5) {
    grid-column-start: 2;
  }
}

@media (min-width: 2100px) {
  li:nth-child(12n-5) {
    grid-column-start: auto;
  }

  li:nth-child(14n-6) {
    grid-column-start: 2;
  }
}
```

编号 ② 相对于 编号 ⑨ 要简单得多，它的网格项目是自动放置的，即 `grid-row` 、`grid-column` 的值为 `auto` 。

![](_attachment/img/3e0635c20d7ffba6a2cc191fb1b3515b_MD5.png)

如果只是要实现具有响应式的网格布局，那么到这里就结束了。但我们的示例还有另外一个特征，那就是多层堆叠在一起，构建出具有层次感的产品展示效果。

不难发现，这两个案例，每个 `li` （单个网格项目）都由四个层级堆叠在一起：

![](_attachment/img/fb4b67f49d407380b631719cb80bba26_MD5.png)

为了减少额外的 HTML 标签元素，这里使用了 CSS 的伪元素 `::before` 和 `::after` 来替代空的 HTML 标签元素。它们之间的层级关系如下：

![](_attachment/img/c27fab2411d745ba37715d502da5127c_MD5.png)

我们以编号 ⑨ 为例，因为编号 ② 比较简单（编号 ② 的 [单个 `li` 的堆叠效果](https://codepen.io/airen/full/RwgVOYb)）。

![](_attachment/img/d37a13ecb2dfa577028d254e209b2219_MD5.png)

实现这个效果关键点是在 `li::before` 和 `li::after` 层，因为 `li` 层是一个纯色，`img` 层就是一个图片元素。这里使用了 CSS 的圆锥渐变 `conic-gradient()` 来绘制 `li::before` 和 `li::after` 层：

```css
li {
  background-color: #eebc1f;
}

li::before {
  background: conic-gradient(#eebc1f 25%, #068d7e 0 50%, #eebc1f 0) 100% 100% / 180% 180%;
}

li::after {
  background: conic-gradient(#eebc1f 75%, #068d7e 0) 0 0 / 180% 180%;
}
```

![](_attachment/img/e9dc048abca4e374be56e86acaa00e0b_MD5.png)

注意，它们的大小都是 `1:1` 的，你可以使用 `aspect-ratio: 1` ，根据元素宽度实现一个正方形，并且放置 `45deg` 就能实现类似上图的效果。但这还是不够的，我们还需要使用 `clip-path` 对 `li::before` 和 `li::after` 做一些裁剪，不然会遮盖住产品图 `img` ：

```css
li::before {
  clip-path: polygon(0 0, 100% 0, 100% 20%, 20% 20%, 20% 100%, 0 100%);
}

li::after {
  clip-path: polygon(80% 20%, 100% 0, 100% 100%, 0% 100%, 20% 80%, 80% 80%);
}
```

![](_attachment/img/80c86e528ada4eebf5d6a94f524ce3e1_MD5.png)

将它们合成在一起就得到我们想要的效果：

![](_attachment/img/382fe75c74bb4e6557478e5178599fd6_MD5.gif)

> Demo 地址：<https://codepen.io/airen/full/vYNdrLL>

注意，不管是编号 ② 还是编号 ⑨ ，单个卡片的层级都是在同一个网格项目中子元素，所以层堆效果采用的还是绝对定位实现的。不过你可以考虑使用子网格来实现同等的效果。这里采用绝对定位实现 `z` 轴堆叠效果，是因为它们在同一个容器中，而容器的布局是由网格构成，不会因为容器位置受到影响。相对于子网格而言，要更简便，但也不失灵活性和适配性。

最终你将看到的效果如下：

**编号 ②** :

![](_attachment/img/a0783cd15c404e53f6c20c8369aa03d7_MD5.gif)

> Demo 地址：<https://codepen.io/airen/full/dyKddzV>

**编号 ⑨** ：

![](_attachment/img/286a7677903cb7853c51e5fc6fc403a4_MD5.gif)

> Demo 地址：<https://codepen.io/airen/full/wvXyyqR>

**作业** ，使用 CSS 网格布局技术实现下图时间轴效果：

![](_attachment/img/23f0eb0deb899e634e720537bfab19af_MD5.png)

## 剪贴簿布局（Scrapbook Layout）

![](_attachment/img/eca86c84f23ae09c2443170466962558_MD5.png)

上图中的效果是不是很像贴满标签的标签簿（或墙）：

![](_attachment/img/9d7514f30d557d8a349a5dced40a5e1c_MD5.png)

我把这种布局效果称之为 **剪贴簿布局（Scrapbook Layout）** ，不过这里不会花时间来阐述什么是“剪贴簿布局”。将会介绍实现类似剪贴簿布局效果的新的布局方式，这种新的布局方式也是基于网格布局的，只不过它被称为 **复合网格布局** 。

> 复合网格这个概念是由 @Andy Clarke 提出的。他在 2019 年的 **State of the browser** 大会分享《[Inspired by CSS Grid](https://2019.stateofthebrowser.com/speakers/andy-clarke/)》 主题中，谈到了如何将平面设计的想法应用到 Web 上以创建引人注目的布局，以及 CSS Grid 如何制作有创意的布局。其中一个原则是使用复合网格。你还可以在 @Andy Clarke 的《[Inspired Design Decisions: Pressing Matters](https://www.smashingmagazine.com/2019/07/inspired-design-decisions-pressing-matters/)》博文中进一步了解复合网格、模块化网格和窄列是如何改变你对 Web 布局的看法的。

在前面所涉及到的网格，大多数都是类似于我们熟知的标准网格，比如 `12` 列或 `24` 列网格，它们一般情况下具有相同的 **列宽** 和 **列间距。** 而 @Andy Clarke 所说的复合网格是 **由两个或多个网格分层创建的** ，类似于将五 列网格叠加到四列网格上的并列排列所产生的有节奏图案，并且比规则网格具有更多的动态布局可能性。

![](_attachment/img/c5820abf425e85b181cd16db95dc672d_MD5.png)

如果你仔细观察，你应该会注意到复合网格是如何将你的设计引向与 `12` 列对称列不同的方向的。如上图所示，通过在一个四列网格上叠加了一个五列的网格，将创建一个八列的网格，而且这复合网格的列轨道尺寸是 `4fr 1fr 3fr 2fr 2fr 3fr 1fr 4fr` ，即：

```css
.composite-grid {
  grid-template-columns: 4fr 1fr 3fr 2fr 2fr 3fr 1fr 4fr;
}
```

使用 `fr` 单位可以很好地将复合网格转换为 CSS 网格。你可能会说，多个网格叠加重新合成出来的新网格（也就是复合网格）和普通网格并没有两样呀。是的，这从心理学和技术角度来说，**尽管使用复合网格，也完全有可能构建一个非常普通的布局** 。比如 stuffandnonsense.co.uk 首页中的一部分：

![](_attachment/img/24c55856ae2cc235e12eed221ffb6b99_MD5.png)

采用的模式就是 `6 | 1 | 4 | 3 | 3 | 4 | 1 | 6` ，即：

```css
.grid {
  grid-template-columns: 6fr 1fr 4fr 3fr 3fr 4fr 1fr 6fr;
}
```

虽然它看上去和前面所介绍的网格没啥区别，但使用更有趣的网格可以激发创造力！正如 @Andy Clarke 的《[Inspired Design Decisions: Pressing Matters](https://www.smashingmagazine.com/2019/07/inspired-design-decisions-pressing-matters/)》文章中所说的一样，可以创建出更创意的 Web 布局。

![](_attachment/img/8bd5b0b0ea2328d6de9b129ee6723306_MD5.png)

虽然复合网格这想法在 Web 布局中很有创意，也能更好地创建出不是对称性的网格，但在生成新的网格轨道数量和尺寸，对于 Web 开发者来说是额外的成本。尤其是制作复杂的网格时，计算它们的过程更复杂，还有可能是个障碍。

幸运的是，[@Michelle Barker 在 Codepen 上提供了一个生成复合网格的小工具](https://codepen.io/michellebarker/full/zYOMYWv)，只需要输入不同网格的列数（每个网格最多 `10` 列），然后点击生成器按钮就可以将两个网格组合起来，生成一个复合网格。这个小工具会生成 `grid-template-columns` 属性所需要的值：

![](_attachment/img/8935fc0e157a6c58b63a8deca1526da6_MD5.gif)

> 复合网格生成器：<https://codepen.io/michellebarker/full/zYOMYWv>

你可能已经看到了，一个 `4` 列网格和一个 `6` 列网格合成，生成的复合网格的 `grid-template-columns` 值是 `2fr 1fr 1fr 2fr 2fr 1fr 1fr 2fr`。

另外，你可以借助 CSS 自定义属性，把你认为是常用的复合网格存为一个自定义属性，比如：

```css
:root {
  --grid-2-3: 2fr 1fr 1fr 2fr;
  --grid-2-5: 2fr 2fr 1fr 1fr 2fr 2fr;
  --grid-2-7: 2fr 2fr 2fr 1fr 1fr 2fr 2fr 2fr;
  --grid-2-9: 2fr 2fr 2fr 2fr 1fr 1fr 2fr 2fr 2fr 2fr;

  --grid-3-4: 3fr 1fr 2fr 2fr 1fr 3fr;
  --grid-3-5: 3fr 2fr 1fr 3fr 1fr 2fr 3fr;
  --grid-3-7: 3fr 3fr 1fr 2fr 3fr 2fr 1fr 3fr 3fr;
  --grid-3-8: 3fr 3fr 2fr 1fr 3fr 3fr 1fr 2fr 3fr 3fr;
  --grid-3-10: 3fr 3fr 3fr 1fr 2fr 3fr 3fr 2fr 1fr 3fr 3fr 3fr;

  --grid-4-5: 4fr 1fr 3fr 2fr 2fr 3fr 1fr 4fr;
  --grid-4-6: 2fr 1fr 1fr 2fr 2fr 1fr 1fr 2fr;
}
```

现在你对复合网格可能有了一个基础认识，接下来我们就使用复合网格来构建像下图这样的剪贴簿布局效果：

![](_attachment/img/99a82ca579ad7b3da3ddbc2c1efdd696_MD5.png)

> Demo 地址：<https://codepen.io/airen/full/poKLjBr>

在这个布局效果中，采用了 `5` 列网格与 `6` 网格的合成：

![](_attachment/img/27b31e247fb7d1099d39eb945684432b_MD5.png)

即：

```css
.grid {
  --grid-5-6: 5fr 1fr 4fr 2fr 3fr 3fr 2fr 4fr 1fr 5fr;
  display: grid;
  grid-template-columns: var(--grid-5-6);
}
```

从效果图中不难发现，相邻两图片之间有重叠，为了控制这个重叠部分的大小，可以使用 CSS 自定义属性来设置，比如 `--overlap` ：

![](_attachment/img/bd3073a10bc4e09f262a4db347efe66b_MD5.png)

就这个示例网格来说，网格列轨道数量和尺寸都定义好了，关键是行网格轨道的数量和尺寸。由于我们无法提前知道网格中的网格项目有多少，为此便于网格自行扩展。使用了 `grid-template-rows` 和 `grid-auto-rows` 来定义网格行轨道的尺寸：

```css
.grid {
  --grid-5-6: 5fr 1fr 4fr 2fr 3fr 3fr 2fr 4fr 1fr 5fr;
  --overlap: 6rem;
  --verticalPadding: 2rem;
  display: grid;
  grid-template-columns: var(--grid-5-6);
  grid-template-rows: auto 3rem;
  grid-auto-rows: minmax(var(--verticalPadding), auto) minmax(0, auto) minmax(
      var(--verticalPadding),
      auto
    ) var(--overlap);
}
```

另外，每一张图片都有一个简短的文字描述，在文字的上方和下方要有一定的空间，避免文字上下图片重叠或碰撞。这意味着在文字上方和下方添加一个网格行，示例中使用 `--verticalPadding` 来定义其大小。这样一来，你将得到像下面这样的一个网格：

![](_attachment/img/7ab5a1b12a580191bbc3db0ef666fbe6_MD5.png)

定义好网格之后，就可以使用 `grid-row` 、`grid-column` 或 `grid-area` 来放置网格项目了。在这个示例中，每个图片至少要跨越 `4` 行，顶部有重叠的图片需要越 `5` 行：

![](_attachment/img/1aa3ff1260c565628557290d8ec356cd_MD5.png)

注意，你可以根据自己设计的需要来调整跨越的行数。正如上图所示，图片对应的文字尽可能地放在离顶部和底部图片有一个行的网格轨道。

示例最终代码如下：

```css
.grid {
  --verticalPadding: 2rem;
  --overlap: 6rem;
  --grid-5-6: 5fr 1fr 4fr 2fr 3fr 3fr 2fr 4fr 1fr 5fr;
  display: grid;
  grid-template-columns: var(--grid-5-6);
  grid-template-rows: auto 3rem;
  grid-auto-rows: minmax(var(--verticalPadding), auto) minmax(0, auto) minmax(
      var(--verticalPadding),
      auto
    ) var(--overlap);
  gap: 1rem;
  align-items: center;
}

header {
  grid-column: 1 / -2;
  grid-row: 1 / span 2;
}

figure:nth-of-type(1) {
  grid-column: span 5 / -1;
}

figure:nth-of-type(2) {
  grid-column: 1 / span 7;
}

figure:nth-of-type(3) {
  grid-column: span 5 / -2;
}

figure:nth-of-type(4) {
  grid-column: 1 / span 6;
}

figure:nth-of-type(5) {
  grid-column: span 6 / -1;
}

figure:nth-of-type(6) {
  grid-column: 1 / span 7;
}

figure:nth-of-type(2n + 1) {
  grid-row-end: span 5;
}

figure:nth-of-type(2n) {
  grid-row-end: span 4;
}

figure:nth-of-type(1) {
  grid-row-start: 2;
}

figure:nth-of-type(2) {
  grid-row-start: 6;
}

figure:nth-of-type(3) {
  grid-row-start: 9;
}

figure:nth-of-type(4) {
  grid-row-start: 13;
}

figure:nth-of-type(5) {
  grid-row-start: 16;
}

figure:nth-of-type(6) {
  grid-row-start: 20;
}

p:first-of-type {
  grid-column: 3 / span 4;
  grid-row: 4;
}

p:nth-of-type(2) {
  grid-column: span 4 / -2;
  grid-row: 8;
}

p:nth-of-type(3) {
  grid-column: 2 / span 5;
  grid-row: 11;
}

p:nth-of-type(4) {
  grid-row: 14;
  grid-column: span 6 / -2;
}

p:nth-of-type(5) {
  grid-row: 18;
  grid-column: span 4 / -6;
}

p:last-of-type {
  grid-row: 22;
  grid-column: span 4 / -2;
}
```

![](_attachment/img/b2f963d7fac1de9c4457b8e2f54e55e9_MD5.gif)

> Demo 地址： <https://codepen.io/airen/full/poKLjBr>

## 小结

在这节中，我们主要介绍了如何使用 CSS 网格来构建一些具有创意性的 Web 布局，比如 **杂志报刊** 、**动漫（故事画）** 、**画报（海报）** 、**堆叠** 和 **剪贴簿布局** 等。文中提到的示例只是其中的一小部分，事实上，使用 CSS 网格布局技术，加上你的创意，可以构建出与众不同的 Web 布局。

如果你感兴趣的话，不妨发挥你的创意，然后立马动手使用 CSS 网格布局技术，构建出更有创意的 Web 布局！
