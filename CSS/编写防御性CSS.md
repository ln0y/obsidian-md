---
aliases: []
tags: ['CSS', 'date/2022-05', 'year/2022', 'month/05']
date: 2022-11-09-星期三 10:52:56
update: 2023-01-06-星期五 18:20:34
---

> 本文翻译自 Ahmad Shadeed 的  [Defensive CSS](https://ishadeed.com/article/defensive-css/)。

通常，我们希望用一些方法来避免 CSS 出现某些意料之外的样式问题。众所周知，网页上呈现的内容不完全是静态的，是可以发生变化的，因此这增加了 CSS 出现问题的可能性。本文介绍一系列防御性 CSS 的代码片段，帮助我们编写出更健壮的 CSS 代码。换句话说，减少因内容动态的变化引起样式上的问题。

## flex 布局的换行

Flexbox 是 CSS 中经常使用的布局，在父元素中设置  `display: flex`  属性，子元素就会按顺序逐个排列。但是，当它们的空间不够用的时候，这些子元素默认情况下不会进换行。所有我们需要添加  `flex-wrap: wrap`  属性来改变这种行为。下面是一个比较典型的例子。我们有一组选项，它们应该挨着显示。

```css
.options-list {
  display: flex;
}
```

![](_attachment/img/31b7de1d758a362cee078e20fc3dc54f_MD5.png)

当元素的宽度变窄时，就会出现水平滚动条。

![](_attachment/img/7402fe0cc5361e5a285607f0285f7969_MD5.png)

为了解决这个问题，我们需要允许自动换行。

```css
.options-list {
  display: flex;
  flex-wrap: wrap;
}
```

![](_attachment/img/47145e5a3db010a594223274955e1aa3_MD5.png)

在 flexbox 布局中，允许元素折行是一种很保险的做法，除非你的样式中允许出现滚动。换句话说，使用  `flex-wrap`  可以避免出现预期之外的布局表现（比如，上面例子中的滚动条）

## 空白间距

我们开发者需要考虑不同的内容长度。这意味着，空白间距应该添加到元素上，即使它看起来并不需要。

![](_attachment/img/227fdd91086ab3d338b916a4a217c52c_MD5.png)

在这个例子中，在左边有一个标题，在右边有一个可操作的按钮。目前，它看起来效果还不错。但是让我们看看当标题变长时会发生什么。

![](_attachment/img/9a60f271c87a8999f36470e074d2700e_MD5.png)

注意到了吗？文本和按钮之间离得太近了。您可能会考虑将文字折行，折行会在后面的内容中讨论，这里我们只关注间距的问题。

如果左侧的标题设置了间距和文本截断，就不会出现这样的问题了。

```css
.section__title {
  margin-right: 1rem;
}
```

![](_attachment/img/0e3a6819265fa2f28376366ba10f75be_MD5.png)

## 文本内容过长

在布局中，处理比较长的文字内容是很重要的。正如在前面所看到的，当标题太长时，它会被截断。虽然截断不是必选的，但对于某些 UI 来说，处理这种场景是很重要的。

对我来说，这需要有一种防御性的 CSS 方法。在 “问题” 真正发生之前解决它是一件很好的事情。

这是一份名单，现在看起来很完美。

![](_attachment/img/b6bd7f77ffe0db7f0e8a79e679fd3e41_MD5.png)

然而，由于这些内容是用户生成，需要防止内容太长破坏掉页面布局。如下图所示：

![](_attachment/img/b68917e54bb1b638bc3e609a6dea94cb_MD5.png)

在这种布局中，设计的一致性非常重要。为了实现这一点，我们可以使用  `text-overflow`  和它的 “朋友们” 来截断文字。

```css
.username {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

![](_attachment/img/10a154383e0b6fdf7a78adb17f11b32a_MD5.png)

## 防止图像被拉伸或压缩

当我们无法控制网页上图像的宽高比时，最好提前考虑，并在用户上传与宽高比不一致的图像时提供解决方案。

在下面的示例中，我们有一个带有照片的卡片组件。看起来不错。

![](_attachment/img/d68b69724f92868319385e8057238ffb_MD5.png)

当用户上传不同大小的图像时，图像将被拉伸。这不好。看看图像是如何拉伸的！

![](_attachment/img/35ac1d6ebfec75e9d03881299592d026_MD5.png)

这个问题可以用 CSS 中的  `object-fit`  来解决。

```css
.card__thumb {
  object-fit: cover;
}
```

![](_attachment/img/73df22f56c79efee5568729d080bd06e_MD5.png)

在项目上，我更喜欢将  `object-fit`  应用到所有图片中，以避免图片被意外的拉伸或压缩。

```css
img {
  object-fit: cover;
}
```

## 取消滚动链接

当你打开一个弹框 (Modal) 并向下滚动到末尾时，如果继续向下滚动则会引起弹框下方的内容（通常是 body 元素）发生滚动。我们把这种现象称之为滚动链接 (scroll chaining)。

在过去，只能通过一些 hack 的方法来取消滚动链接效果；但现在，我们可以 CSS 的  `overscroll-behavior`  属性来优化滚动的效果。

在下图中，可以看到滚动链接的默认行为：

![](_attachment/img/8db84f8cd8a06a4d1cfab9945084860f_MD5.png)

为了避免滚动扩散到其他元素，我们可以将其添加到任何需要滚动的组件中（例如：聊天组件、移动菜单等）。这个属性只有在发生滚动的时候才会产生效果。

```css
.modal__content {
  overscroll-behavior-y: contain;
  overflow-y: auto;
}
```

![](_attachment/img/ffc08622ae28bc1c542bc7b6d73e8c15_MD5.png)

## 自定义属性备用值

CSS 自定义属性 (变量) 被越来越多的用于网页设计中。为了避免破坏用户体验，我们需要做一些额外的处理，以防 CSS 自定义属性的值因某种原因为空。

特别是使用 JavaScript 设置 CSS 自定义属性的值时，要更加注意自定义属性的值无效的情况。比如下面的例子：

```css
.message__bubble {
  max-width: calc(100% - var(--actions-width));
}
```

`calc()`  函数中使用了自定义属性  `--actions-width`，并且它的值由 JavaScript 代码提供。假如在某些情况下，Javascript 代码执行失败，那么  `max-width`  的值会被计算为  `none`。

为了避免发生这种问题，要用  `var()`  来设置一个备用值，当自定义属性的值无效时，这个备用值就会生效。

```css
.message__bubble {
  max-width: calc(100% - var(--actions-width, 70px));
}
```

这样，如果自定义属性  `--actions-width`  未被定义，就会使用备用值  `70px`。这个方法用于自定义属性值可能会失败的场景，比如这个值来自于 JavaScript。在其它场景中，它并不是必须的。

## 使用固定的宽高

一常见的破坏布局的情形是，具有不同长度内容的元素使用了固定宽度或高度。

### 固定高度

我经常会碰到在一个具有固定高度的元素内部，它包含的内容大于它的高度，这会导致布局被破坏掉。例如下面这种情况。

```css
.hero {
  height: 350px;
}
```

![](_attachment/img/616e7fbbda118a99f50cdbda3270826c_MD5.png)

为了避免内容超出  `.hero`，我们需要使用  `min-height`  而不是  `height`。

```css
.hero {
  min-height: 350px;
}
```

![](_attachment/img/054d4150eea641bfd039e670d85642b6_MD5.png)

这样，当内容变得更大时，布局依旧不会被破坏掉。

### 固定宽度

也许你曾经碰到过  `button`  里的文字与左右边缘间隙很小，这可能是使用了固定宽度导致的。

```css
.button {
  width: 100px;
}
```

如果按钮里面的文字长度超过  `100px`，它将靠近左右边缘。如果再长一些，文本就会超出了按钮。这种体验很差！

![](_attachment/img/8dc1e62105b994f5623c370a40e87942_MD5.png)

为了解决这个问题，可以将  `width`  替换为  `min-width`。

```css
.button {
  min-width: 100px;
}
```

## 不要忘了 background-repeat

通常，当使用尺寸比较大的图片作为背景时，不要忘记检查一下页面在大屏幕上的展示效果。图片作为背景，在默认情况下，会被重复显示。

由于笔记本电脑的屏幕相对比较小，出现图片重复的概率较小。但在更大的屏幕上，元素的尺寸也随之变大，它的背景图片有可能会重复展示。

![](_attachment/img/41d055d9874b6ec083ed6b6a3b011974_MD5.png)

为了避免这种情况，我们需要设置  `background-repeat`  属性。

```css
.hero {
  background-image: url('..');
  background-repeat: no-repeat;
}
```

## 垂直方向的媒体查询

有时，在开发组件时，我们会调整浏览器的宽度，测试组建的样式是否符合预期。如果对浏览器的高度进行测试，可以发现另外一些有趣的问题。

比如下面的图中，是一个比较常见的例子。在左侧的侧边栏组件中包含了主导航和下方辅助导航。辅助导航会被固定放在侧边栏组件的底部。开发人员将  `position: sticky`  添加到了辅助导航，这样它就可以固定到了底部（吸底）。如下图所示，主导航和辅助导航看起来都很正常。

![](_attachment/img/ab86c7c0154b7858c8802e784b0f26f1_MD5.png)

然而，当浏览器的高度变小时，布局就会发生错乱。如下图所示，两个导航发生了重叠：

![](_attachment/img/7efb9a40efacb0c5498f144e5fa0ffe4_MD5.png)

使用 CSS 垂直方向的媒体查询，可以避免此问题。

```css
@media (min-height: 600px) {
  .aside__secondary {
    position: sticky;
    bottom: 0;
  }
}
```

这样，只有当浏览器视窗的高度超过 600px 时，辅助导航才会产生吸底效果；其他情况下，辅助导航不会产生吸底效果，按原有的方式布局展示。这样就避免了辅助导航和上面的主导航发生重叠。

## 使用 Justify-Content: Space-Between

在 flex 容器中，可以使用  `justify-content`  将子元素彼此隔开。当子元素的数量固定时，布局看起来是没有问题的。但是，当子元素的个数增加或减少时，布局看起来会变得很奇怪。

看一下下面的例子：

![](_attachment/img/a867fbc5eca57c0d72e30ba688e5ec4e_MD5.png)

在上图的 flex 容器中，有四个子元素，元素之间的距离并不是由  `gap`  或  `margin`  设置的，而是由  `justify-content: space-between`  作用产生的间距。

让我们来看一下，当元素的数量少于 4 个时，样式效果是什么样子的。

![](_attachment/img/86bb46dafae13372aa17c9a4836207c5_MD5.png)

在一些场景下，这样的效果是不友好的，可以通过以下几种方式进行处理。

- `margin`  设置外边距

- flexbox 设置  `gap`  属性（需要注意浏览器的支持情况）

- `padding`  设置内边距

- 增加一个空元素来做占位

为了简单起见，我们这里用  `gap`  做一下示例：

```css
.wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
```

![](_attachment/img/02103f443948f57e13a9dfde7804174f_MD5.png)

## 图片上的文字

当在图片上展示文字的时候，要考虑如果图片加载失败了，文字的展示效果是什么样子的。

比如下面的例子：

![](_attachment/img/05ac5234c63d03246f0b61cf3dcf24f9_MD5.png)

在正常情况下，文字的效果看起来很好；但是当图片加载失败的时候，图片上面的文字效果会受到影响。如下图所示，由于图片加载失败，白色的字体和背景几乎融为一体，用户很难看清楚上面的文字。

![](_attachment/img/013c1f5011ec671054c029eb867bc4c8_MD5.png)

我们可以额外为  `<img>`  元素设置一个背景颜色来处理这个问题。只有当图片加载失败的时候，这个背景颜色才会生效。

```css
.card__img {
  background-color: grey;
}
```

![](_attachment/img/1948450ef77070280414b2060a222670_MD5.png)

## 要注意 CSS Grid 的固定值

假如，我们要在一个 grid 网格容器包含了 main 和 aside 区域，CSS 代码通常如下所示：

```css
.wrapper {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 1rem;
}
```

但是如果浏览器的视窗尺寸比较小，有可能因为缺少足够的空间导致样式出现问题。为了避免这种情况发生，通常会在 CSS grid 中使用媒体查询。

```css
@media (min-width: 600px) {
  .wrapper {
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 1rem;
  }
}
```

## 在必要时显示滚动条

在内容比较长的情况下，可以通过设置  `overflow`  控制滚动条是否显示。但是这里更推荐将  `overflow`  的值设置为  `auto`。比如在下面的示例中  `overflow: scroll`：

![](_attachment/img/8b21f95ac0d4308f00ddb663f925235a_MD5.png)

当内容比较短的时候，滚动条也显示出来了。这种 UI 效果并不友好，在非必要情况下，滚动条不该展示给用户。

```css
.element {
  overflow-y: auto;
}
```

`overflow-y: auto`  的效果是，只有在内容足够长的时候，滚动条才会展示出来。除此之外，其他情况并不展示滚动条。

![](_attachment/img/cfe0bd3e6ece634ba99d3b349cec832d_MD5.png)

## 滚动条的占用空间

关于滚动条的另外一个要注意的地方是 scrollbar gutter，也就是滚动条会占用元素的空间，导致渲染内容的区域变小。比如在前面提到的例子中，当内容变长出现了滚动条的时候，会引起布局发生变化，因为滚动条要占用布局元素的空间。

![](_attachment/img/d5279a030a50503b54c09144d46439a5_MD5.jpg)

仔细对比上图中前后的变化，不难发现滚动条导致白色的内容区变窄了。我们可以设置  `scrollbar-gutter`  属性来避免这个问题。

```css
.element {
  scrollbar-gutter: stable;
}
```

![](_attachment/img/5c5ed0cd2c91c22bae1bc40c027539e9_MD5.jpg)

## CSS flexbox 内容的最小尺寸

如果在某个 flex item 中包含了文字或图片元素，并且这个元素的尺寸要比 item 自身的尺寸大，浏览器并不会对元素进行收缩。这个是 flexbox 的默认行为。请看下面的卡片示例：

```css
.card {
  display: flex;
}
```

当这个卡片的标题比较长时，文字并不会发生折行。

![](_attachment/img/c63616f7124d81d404370ec5d5bbe3c6_MD5.jpg)

即使使用了  `overflow-wrap: break-word`，也不会出现折行。

```css
.card__title {
  overflow-wrap: break-word;
}
```

为了改变这一默认行为，需要为 flex item 设置  `min-width`  属性。由于  `min-width`  的默认值为  `auto`，所以文字发生了溢出。

```css
.card__title {
  overflow-wrap: break-word;
  min-width: 0;
}
```

使用 flex 列的折行也可以实现同样的效果，与此同时要设置  `min-height: 0`。

![](_attachment/img/33cbb754bff22de1c36284385007f7b5_MD5.jpg)

## CSS grid 内容的最小尺寸

与 flexbox 类似，CSS grid 中的子元素内容的默认最小值为  `auto`。也就是说，如果元素的尺寸超过 grid item，同样会发生溢出样式。

![](_attachment/img/0c6352f39d03cb1eba84a4a8f224d079_MD5.png)

在上图的示例中，内容区 (main) 包含了一个具有轮播功能的走马灯 (carousel)。HTML 和 CSS 代码如下所示：

```css
<div class="wrapper">  <main>    <section class="carousel"></section>  </main>  <aside></aside></div>
```

```css
@media (min-width: 1020px) {
  .wrapper {
    display: grid;
    grid-template-columns: 1fr 248px;
    grid-gap: 40px;
  }
}
.carousel {
  display: flex;
  overflow-x: auto;
}
```

由于 carousel 是一个不会发生折行的 flex 容器，它的宽度超过了 main 区域，而 grid item 也会遵循这一点。因此，出现了水平滚动条。针对这个问题，有三种不同的解决方案。

- 使用  `minmax()`  函数

- 为 grid item 设置  `min-width`  属性

- 为 grid item 添加  `overflow: hidden`

做为一种防御性 CSS 机制，我选择了第一种，使用  `minmax()`  函数，代码如下所示。

```css
@media (min-width: 1020px) {
  .wrapper {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 248px;
    grid-gap: 40px;
  }
}
```

![](_attachment/img/0328d4efc2013eef0d3119a46ec68e88_MD5.png)

## auto-fit 与 auto-fill

当我们使用 CSS grid 的  `minmax()`  函数时，能够准确的使用  `auto-fit`  和  `auto-fill`  则尤为重要。如果使用错误，就会导致预期之外的结果。

如果剩余的可用空间的尺寸较大时，在  `minmax()`  函数中， `auto-fit`  会使 grid item 的宽度变大，并占满这些可用空间；而  `auto-fill`  将保留可用空间，grid item 的宽度保持不变。

![](_attachment/img/ba5a6485dffef05fd98ece2f523a211f_MD5.png)

也就是说，使用  `auto-fit`  可能会导致 grid item 特别的宽，甚至超出了预期。比如，下面这种情况。

```css
.wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  grid-gap: 1rem;
}
```

如果只有一个 grid item 下使用了  `auto-fit`，这个 item 会填满整个容器。

![](_attachment/img/12594aa0714f37ed9e2d7c025a5545da_MD5.png)

在大部分场景里，这种展示结果并不是我们想要的，所以我认为在这里使用  `auto-fill`  会更合适。

```css
.wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-gap: 1rem;
}
```

![](_attachment/img/e84d992bb9094e4f82d8ed1046887f74_MD5.png)

## 图片的最大宽度

一般来说，不要忘记为所有图像设置  `max-width: 100%`。这可以添加到您使用的 CSS 重置样式中（可阅读文章 「[一份自定义的 CSS Reset](http://mp.weixin.qq.com/s?__biz=MzA5NzUxNzQwMw==&mid=2247484083&idx=1&sn=3bf8c8de685169f3d8b97b7868620fea&chksm=909ee887a7e961916c9cf09b07db56795e331f93d7114fc5986d4bb3ff5f07674364bf4c2b31&scene=21#wechat_redirect)」了解 CSS 重置样式）。

```css
img {
  max-width: 100%;
  object-fit: cover;
}
```

## CSS grid 使用 position: sticky

不知道大家是否尝试过，将 grid 容器中的子元素设置  `position: sticky`。在 grid item 上的默认行为是  stretch。因此在下面的例子中，aside 元素的高度与 main 区域的高度是一样的。

![](_attachment/img/c81e2de24ba8cd571d150c7d75ea34c8_MD5.jpg)

为了能够如我们期望的那样展示，在这里还需要设置  `align-self`  属性。

```css
aside {
  align-self: start;
  position: sticky;
  top: 1rem;
}
```

![](_attachment/img/5647717f97cf2f190834d04d8e1290ba_MD5.jpg)

## 并集选择器

对于同时作用到不同浏览器的样式，并不推荐使用并集选择器。比如，设置 input 中 placeholder 的样式时，需要为每种浏览器使用对应的选择器。根据 w3c 的规定，我们如果在这种场景下使用了并集选择器，那么整个样式规则是不合法的。下面的代码是不推荐的。

```css
/* Don't do this, please */
input::-webkit-input-placeholder,
input:-moz-placeholder {
  color: #222;
}
```

下面的代码是推荐的。

```css
input::-webkit-input-placeholder {
  color: #222;
}
input:-moz-placeholder {
  color: #222;
}
```
