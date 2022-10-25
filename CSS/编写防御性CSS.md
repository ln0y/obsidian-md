---
aliases: []
tags: ['CSS','date/2022-05','year/2022','month/05']
date: 2022-05-05-Thursday 17:36:46
update: 2022-05-05-Thursday 17:52:37
---

> 本文翻译自 Ahmad Shadeed 的 [Defensive CSS](https://ishadeed.com/article/defensive-css/)。

通常，我们希望用一些方法来避免 CSS 出现某些意料之外的样式问题。众所周知，网页上呈现的内容不完全是静态的，是可以发生变化的，因此这增加了 CSS 出现问题的可能性。本文介绍一系列防御性 CSS 的代码片段，帮助我们编写出更健壮的 CSS 代码。换句话说，减少因内容动态的变化引起样式上的问题。
- [ ] 1 保存图片

## flex 布局的换行

Flexbox 是 CSS 中经常使用的布局，在父元素中设置 `display: flex` 属性，子元素就会按顺序逐个排列。但是，当它们的空间不够用的时候，这些子元素默认情况下不会进换行。所有我们需要添加 `flex-wrap: wrap` 属性来改变这种行为。下面是一个比较典型的例子。我们有一组选项，它们应该挨着显示。

```
.options-list {    display: flex;}
```

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN37DvWueIGdJBAQfLuBiblCcH3rsbSic6Mb4SPjyLXceoOyrbmMNafP2pBBoCpkdbefTB3jSh4icOFC0Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

当元素的宽度变窄时，就会出现水平滚动条。

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN37DvWueIGdJBAQfLuBiblCcH6DYENiciasdhYibOIIU82z0UkA7GqdP8ib5RA0OhBfiark72liaxwaHRKRvg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

为了解决这个问题，我们需要允许自动换行。

```
.options-list {    display: flex;    flex-wrap: wrap;}
```

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN37DvWueIGdJBAQfLuBiblCcH1Xk4nhCdJLA0OnVHFibXTicoBjS6NWdVTIOuB7kxEOzbAfLSIouTCKIg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

在 flexbox 布局中，允许元素折行是一种很保险的做法，除非你的样式中允许出现滚动。换句话说，使用 `flex-wrap` 可以避免出现预期之外的布局表现（比如，上面例子中的滚动条）

## 空白间距

我们开发者需要考虑不同的内容长度。这意味着，空白间距应该添加到元素上，即使它看起来并不需要。

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN37DvWueIGdJBAQfLuBiblCcHsMzKxmfP29krQo1IWiaiaODkQenGlaiboaibxGgvuwOJZ2zicFzuzUbn38g/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

在这个例子中，在左边有一个标题，在右边有一个可操作的按钮。目前，它看起来效果还不错。但是让我们看看当标题变长时会发生什么。

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN37DvWueIGdJBAQfLuBiblCcHngqFFlXuWC00xbuCsia8ADjIJzsKz5KdPEbuwWpIl2iasdVBbaEjJaQQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

注意到了吗？文本和按钮之间离得太近了。您可能会考虑将文字折行，折行会在后面的内容中讨论，这里我们只关注间距的问题。

如果左侧的标题设置了间距和文本截断，就不会出现这样的问题了。

```
.section__title {  margin-right: 1rem;}
```

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN37DvWueIGdJBAQfLuBiblCcHPy9gnpAUDbztiauRtIb8pSNzVJAkza8u5s2xGtfJ6XT4SC7oE4VSYxA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

## 文本内容过长

在布局中，处理比较长的文字内容是很重要的。正如在前面所看到的，当标题太长时，它会被截断。虽然截断不是必选的，但对于某些 UI 来说，处理这种场景是很重要的。

对我来说，这需要有一种防御性的 CSS 方法。在 “问题” 真正发生之前解决它是一件很好的事情。

这是一份名单，现在看起来很完美。

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN37DvWueIGdJBAQfLuBiblCcHjwYicIgbia143go35yXCDHml0c1ssVlfP3dZVwufI6wXkVNX6tzjictTg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

然而，由于这些内容是用户生成，需要防止内容太长破坏掉页面布局。如下图所示：

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN37DvWueIGdJBAQfLuBiblCcHQJUbs9KunjdrXbpIhKkbMxWNic5y852h6En0R0NQb0QbLP6s8lgJdgA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

在这种布局中，设计的一致性非常重要。为了实现这一点，我们可以使用 `text-overflow` 和它的 “朋友们” 来截断文字。

```
.username {    white-space: nowrap;    overflow: hidden;    text-overflow: ellipsis;}
```

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN37DvWueIGdJBAQfLuBiblCcHgT0TxBGOCjMF64ANbUFfSw36tqAjuXSjMCw06iaYzxeeofInNwGjv4A/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

## 防止图像被拉伸或压缩

当我们无法控制网页上图像的宽高比时，最好提前考虑，并在用户上传与宽高比不一致的图像时提供解决方案。

在下面的示例中，我们有一个带有照片的卡片组件。看起来不错。

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN37DvWueIGdJBAQfLuBiblCcHGiaYq7HeTPxFQ2MN6TfKic5uaDzwlq2FzfDicw2pFbyRP989whFcJu4wQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

当用户上传不同大小的图像时，图像将被拉伸。这不好。看看图像是如何拉伸的！

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN37DvWueIGdJBAQfLuBiblCcHe1ibg06JCIxjZZlgII7ibstDTibzjUz4ImsoOxibeZmSFrALdYykHDc0Uw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

这个问题可以用 CSS 中的 `object-fit` 来解决。

```
.card__thumb {  object-fit: cover;}
```

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN37DvWueIGdJBAQfLuBiblCcHyxMTJc7ryGicupa4loSdMoZXUvicQAfRnkfJtSxSHbMFsYiaj3C3FIthg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

在项目上，我更喜欢将 `object-fit` 应用到所有图片中，以避免图片被意外的拉伸或压缩。

```
img {  object-fit: cover;}
```

## 取消滚动链接

当你打开一个弹框 (Modal) 并向下滚动到末尾时，如果继续向下滚动则会引起弹框下方的内容（通常是 body 元素）发生滚动。我们把这种现象称之为滚动链接 (scroll chaining)。

在过去，只能通过一些 hack 的方法来取消滚动链接效果；但现在，我们可以 CSS 的 `overscroll-behavior` 属性来优化滚动的效果。

在下图中，可以看到滚动链接的默认行为：

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN34D8Gib31ILHxXCYwclp56v6coKQlWVY2V0J5EdbbZMCVicz41c3ubR91xfjUJKNvcSu371SDsxtdjA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

为了避免滚动扩散到其他元素，我们可以将其添加到任何需要滚动的组件中（例如：聊天组件、移动菜单等）。这个属性只有在发生滚动的时候才会产生效果。

```
.modal__content {  overscroll-behavior-y: contain;  overflow-y: auto;}
```

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN34D8Gib31ILHxXCYwclp56v6EVPF0KiarFrmPicynFcicyMrHrhHzBoa5fsLhSibFDmhpKXACZHeLLNeag/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

## 自定义属性备用值

CSS 自定义属性 (变量) 被越来越多的用于网页设计中。为了避免破坏用户体验，我们需要做一些额外的处理，以防 CSS 自定义属性的值因某种原因为空。

特别是使用 JavaScript 设置 CSS 自定义属性的值时，要更加注意自定义属性的值无效的情况。比如下面的例子：

```
.message__bubble {  max-width: calc(100% - var(--actions-width));}
```

`calc()` 函数中使用了自定义属性 `--actions-width`，并且它的值由 JavaScript 代码提供。假如在某些情况下，Javascript 代码执行失败，那么 `max-width` 的值会被计算为 `none`。

为了避免发生这种问题，要用 `var()` 来设置一个备用值，当自定义属性的值无效时，这个备用值就会生效。

```
.message__bubble {  max-width: calc(100% - var(--actions-width, 70px));}
```

这样，如果自定义属性 `--actions-width` 未被定义，就会使用备用值 `70px`。这个方法用于自定义属性值可能会失败的场景，比如这个值来自于 JavaScript。在其它场景中，它并不是必须的。

## 使用固定的宽高

一常见的破坏布局的情形是，具有不同长度内容的元素使用了固定宽度或高度。

### 固定高度

我经常会碰到在一个具有固定高度的元素内部，它包含的内容大于它的高度，这会导致布局被破坏掉。例如下面这种情况。

```
.hero {  height: 350px;}
```

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN34D8Gib31ILHxXCYwclp56v6bYjvB147UtFc3QvOysIK3s3IWXgiaVCAGpJMm8uF4lJJ7xYOHQ5H3xA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

为了避免内容超出 `.hero`，我们需要使用 `min-height` 而不是 `height`。

```
.hero {  min-height: 350px;}
```

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN34D8Gib31ILHxXCYwclp56v6oeAScWbDeL3GAicQaIoBYJdRvjp6nOtZufJJ55HKWQsbBYUjjhhcj4Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

这样，当内容变得更大时，布局依旧不会被破坏掉。

### 固定宽度

也许你曾经碰到过 `button` 里的文字与左右边缘间隙很小，这可能是使用了固定宽度导致的。

```
.button {  width: 100px;}
```

如果按钮里面的文字长度超过 `100px`，它将靠近左右边缘。如果再长一些，文本就会超出了按钮。这种体验很差！

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN34D8Gib31ILHxXCYwclp56v6AnnmIuzuXJn0s9s8goI7BKdclc2VgRM0MybmTia1w9wrDRPJKyleTZw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

为了解决这个问题，可以将 `width` 替换为 `min-width`。

```
.button {  min-width: 100px;}
```

## 不要忘了 background-repeat

通常，当使用尺寸比较大的图片作为背景时，不要忘记检查一下页面在大屏幕上的展示效果。图片作为背景，在默认情况下，会被重复显示。

由于笔记本电脑的屏幕相对比较小，出现图片重复的概率较小。但在更大的屏幕上，元素的尺寸也随之变大，它的背景图片有可能会重复展示。

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN34D8Gib31ILHxXCYwclp56v6huG6txpibp34BVAJ6VnsQut8dErvbpFEE0GVcj2xJhIaL3jmvtbJo9Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

为了避免这种情况，我们需要设置 `background-repeat` 属性。

```
.hero {  background-image: url('..');  background-repeat: no-repeat;}
```

## 垂直方向的媒体查询

有时，在开发组件时，我们会调整浏览器的宽度，测试组建的样式是否符合预期。如果对浏览器的高度进行测试，可以发现另外一些有趣的问题。

比如下面的图中，是一个比较常见的例子。在左侧的侧边栏组件中包含了主导航和下方辅助导航。辅助导航会被固定放在侧边栏组件的底部。开发人员将 `position: sticky` 添加到了辅助导航，这样它就可以固定到了底部（吸底）。如下图所示，主导航和辅助导航看起来都很正常。

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN34D8Gib31ILHxXCYwclp56v606iczb7dBFoHSpgFs7sDsSY0goAJicbjGMjW1sbPb0AiaroGC3JHwWWOw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

然而，当浏览器的高度变小时，布局就会发生错乱。如下图所示，两个导航发生了重叠：

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN34D8Gib31ILHxXCYwclp56v6C4FLovdTdF5qmicAciaBGfoXaQiao8CTHicZCMEsYXr2THPSWW16ASMQiaw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

使用 CSS 垂直方向的媒体查询，可以避免此问题。

```
@media (min-height: 600px) {  .aside__secondary {    position: sticky;    bottom: 0;  }}
```

这样，只有当浏览器视窗的高度超过 600px 时，辅助导航才会产生吸底效果；其他情况下，辅助导航不会产生吸底效果，按原有的方式布局展示。这样就避免了辅助导航和上面的主导航发生重叠。

## 使用 Justify-Content: Space-Between

在 flex 容器中，可以使用 `justify-content` 将子元素彼此隔开。当子元素的数量固定时，布局看起来是没有问题的。但是，当子元素的个数增加或减少时，布局看起来会变得很奇怪。

看一下下面的例子：

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN34mpVgvvdejvGsbDq01z4lSPZNIP2LBt6MdcLNT3k5B4AHT4E5EBQU5Ekx2xBFHiaWAPKibKXFoVH6Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

在上图的 flex 容器中，有四个子元素，元素之间的距离并不是由 `gap` 或 `margin` 设置的，而是由 `justify-content: space-between` 作用产生的间距。

让我们来看一下，当元素的数量少于 4 个时，样式效果是什么样子的。

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN34mpVgvvdejvGsbDq01z4lSHxJ3a4GLCe3iaW92LnXSK2pP6vfHW6pkDjCPyibEQKX3XpDzRG9libtYg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

在一些场景下，这样的效果是不友好的，可以通过以下几种方式进行处理。

- `margin` 设置外边距

- flexbox 设置 `gap` 属性（需要注意浏览器的支持情况）

- `padding` 设置内边距

- 增加一个空元素来做占位

为了简单起见，我们这里用 `gap` 做一下示例：

```
.wrapper {  display: flex;  flex-wrap: wrap;  gap: 1rem;}
```

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN34mpVgvvdejvGsbDq01z4lS6QXQwjNAWHQMVicQqXR1ZGwODNsY2zewgp58picmBPLE5gCgthArBjvg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

## 图片上的文字

当在图片上展示文字的时候，要考虑如果图片加载失败了，文字的展示效果是什么样子的。

比如下面的例子：

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN34mpVgvvdejvGsbDq01z4lSiaK5yQsVT62ydB3lNowxeyFILSgianRdfFmEtR0UnsswuIRLp8Roiawgw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

在正常情况下，文字的效果看起来很好；但是当图片加载失败的时候，图片上面的文字效果会受到影响。如下图所示，由于图片加载失败，白色的字体和背景几乎融为一体，用户很难看清楚上面的文字。

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN34mpVgvvdejvGsbDq01z4lSsa2iakZlCfpa1pE87ibMicydKJMlybfk2139EF0YiarHI8Rwk4oT3wO2Ug/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

我们可以额外为 `<img>` 元素设置一个背景颜色来处理这个问题。只有当图片加载失败的时候，这个背景颜色才会生效。

```
.card__img {  background-color: grey;}
```

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN34mpVgvvdejvGsbDq01z4lSXOE2jBktnDOeIxHOzMjK1FdiaX5RFpvzhYMpk0ToMXpp7Qms2WOQ7SQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

## 要注意 CSS Grid 的固定值

假如，我们要在一个 grid 网格容器包含了 main 和 aside 区域，CSS 代码通常如下所示：

```
.wrapper {  display: grid;  grid-template-columns: 250px 1fr;  gap: 1rem;}
```

但是如果浏览器的视窗尺寸比较小，有可能因为缺少足够的空间导致样式出现问题。为了避免这种情况发生，通常会在 CSS grid 中使用媒体查询。

```
@media (min-width: 600px) {  .wrapper {    display: grid;    grid-template-columns: 250px 1fr;    gap: 1rem;  }}
```

## 在必要时显示滚动条

在内容比较长的情况下，可以通过设置 `overflow` 控制滚动条是否显示。但是这里更推荐将 `overflow` 的值设置为 `auto`。比如在下面的示例中 `overflow: scroll`：

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN34mpVgvvdejvGsbDq01z4lSqFEHa7S56Sl2Piba9vnLRicqzJNekC694ahpAPOHOkic3UN6QR87OGOkg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

当内容比较短的时候，滚动条也显示出来了。这种 UI 效果并不友好，在非必要情况下，滚动条不该展示给用户。

```
.element {  overflow-y: auto;}
```

`overflow-y: auto` 的效果是，只有在内容足够长的时候，滚动条才会展示出来。除此之外，其他情况并不展示滚动条。

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN34mpVgvvdejvGsbDq01z4lSjuZ9DIp0EsBx8Q5YCGHUoQbApw8JcMhx6Jykdibta2UFJf08wga7QIw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

## 滚动条的占用空间

关于滚动条的另外一个要注意的地方是 scrollbar gutter，也就是滚动条会占用元素的空间，导致渲染内容的区域变小。比如在前面提到的例子中，当内容变长出现了滚动条的时候，会引起布局发生变化，因为滚动条要占用布局元素的空间。

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/RqbfwXSnN34mpVgvvdejvGsbDq01z4lSzicHR2u2PeWyzl0Z5VfuS9nAWjkTX5Guq1fWre22RKVpODoPbFjOEoQ/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

仔细对比上图中前后的变化，不难发现滚动条导致白色的内容区变窄了。我们可以设置 `scrollbar-gutter` 属性来避免这个问题。

```
.element {  scrollbar-gutter: stable;}
```

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/RqbfwXSnN34mpVgvvdejvGsbDq01z4lSibWvoJJpXiam2XUiaWAgEw8cTMMffafV2tgy93No1kEDxK5ZGYGHXedcw/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

## CSS flexbox 内容的最小尺寸

如果在某个 flex item 中包含了文字或图片元素，并且这个元素的尺寸要比 item 自身的尺寸大，浏览器并不会对元素进行收缩。这个是 flexbox 的默认行为。请看下面的卡片示例：

```
.card {  display: flex;}
```

当这个卡片的标题比较长时，文字并不会发生折行。

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/RqbfwXSnN367n2py5WwiaJhQ1KSa5h2hfJ4ybOsKicOf7BNuiciaahbqozt9PjgY5Doiatic3oMbMWdobeibD6CRnicr0Q/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

即使使用了 `overflow-wrap: break-word`，也不会出现折行。

```
.card__title {  overflow-wrap: break-word;}
```

为了改变这一默认行为，需要为 flex item 设置 `min-width` 属性。由于 `min-width` 的默认值为 `auto`，所以文字发生了溢出。

```
.card__title {  overflow-wrap: break-word;  min-width: 0;}
```

使用 flex 列的折行也可以实现同样的效果，与此同时要设置 `min-height: 0`。

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/RqbfwXSnN367n2py5WwiaJhQ1KSa5h2hfXtrZmLDjnFa7pOTwDzQlpkbSpBPIYNw9HkuV0G5QnDS75XYq0YFN8g/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

## CSS grid 内容的最小尺寸

与 flexbox 类似，CSS grid 中的子元素内容的默认最小值为 `auto`。也就是说，如果元素的尺寸超过 grid item，同样会发生溢出样式。

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN367n2py5WwiaJhQ1KSa5h2hfZDv8hicRicDyUt4J55XAlDCcShQPhvbH0MqxibFGYBrpFQ6V1Q9icb5EYw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

在上图的示例中，内容区 (main) 包含了一个具有轮播功能的走马灯(carousel)。HTML 和 CSS 代码如下所示：

```
<div class="wrapper">  <main>    <section class="carousel"></section>  </main>  <aside></aside></div>
```

```
@media (min-width: 1020px) {  .wrapper {    display: grid;    grid-template-columns: 1fr 248px;    grid-gap: 40px;  }}.carousel {  display: flex;  overflow-x: auto;}
```

由于 carousel 是一个不会发生折行的 flex 容器，它的宽度超过了 main 区域，而 grid item 也会遵循这一点。因此，出现了水平滚动条。针对这个问题，有三种不同的解决方案。

- 使用 `minmax()` 函数

- 为 grid item 设置 `min-width` 属性

- 为 grid item 添加 `overflow: hidden`

做为一种防御性 CSS 机制，我选择了第一种，使用 `minmax()` 函数，代码如下所示。

```
@media (min-width: 1020px) {  .wrapper {    display: grid;    grid-template-columns: minmax(0, 1fr) 248px;    grid-gap: 40px;  }}
```

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN367n2py5WwiaJhQ1KSa5h2hfN2U7ialBQr4PToLpZRibu5LicUnPlzt4mblrBQquL9yNdtIkbTJXarPcA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

## auto-fit 与 auto-fill

当我们使用 CSS grid 的 `minmax()` 函数时，能够准确的使用 `auto-fit` 和 `auto-fill` 则尤为重要。如果使用错误，就会导致预期之外的结果。

如果剩余的可用空间的尺寸较大时，在 `minmax()` 函数中， `auto-fit` 会使 grid item 的宽度变大，并占满这些可用空间；而 `auto-fill` 将保留可用空间，grid item 的宽度保持不变。

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN367n2py5WwiaJhQ1KSa5h2hfvmHD4pQ8iaGcicngb04LGyIPaz7VJ9T58n8u9OSRU2HJiaZkyibRFSiapWA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

也就是说，使用 `auto-fit` 可能会导致 grid item 特别的宽，甚至超出了预期。比如，下面这种情况。

```
.wrapper {  display: grid;  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));  grid-gap: 1rem;}
```

如果只有一个 grid item 下使用了 `auto-fit`，这个 item 会填满整个容器。

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN367n2py5WwiaJhQ1KSa5h2hfqhokXribwGlcicKZUUmMdMbCcOMn4eAkLnsbJNmrynAXNSTAOQLfONIg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

在大部分场景里，这种展示结果并不是我们想要的，所以我认为在这里使用 `auto-fill` 会更合适。

```
.wrapper {  display: grid;  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));  grid-gap: 1rem;}
```

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN367n2py5WwiaJhQ1KSa5h2hf1AbwpcFLaYTPMxqEUt3IXIYZXI0DMiar368uFWzsw7QmyVdXGQdtSpw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

## 图片的最大宽度

一般来说，不要忘记为所有图像设置 `max-width: 100%`。这可以添加到您使用的 CSS 重置样式中（可阅读文章 「[一份自定义的 CSS Reset](http://mp.weixin.qq.com/s?__biz=MzA5NzUxNzQwMw==&mid=2247484083&idx=1&sn=3bf8c8de685169f3d8b97b7868620fea&chksm=909ee887a7e961916c9cf09b07db56795e331f93d7114fc5986d4bb3ff5f07674364bf4c2b31&scene=21#wechat_redirect)」了解CSS 重置样式）。

```
img {  max-width: 100%;  object-fit: cover;}
```

## CSS grid 使用 position: sticky

不知道大家是否尝试过，将 grid 容器中的子元素设置 `position: sticky`。在 grid item 上的默认行为是 stretch。因此在下面的例子中，aside 元素的高度与 main 区域的高度是一样的。

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/RqbfwXSnN367n2py5WwiaJhQ1KSa5h2hfJSbpcCfl9wU54w4XvIeEeTclIRsfx2QarJTVD8sQFl5JeMcg9hWshg/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

为了能够如我们期望的那样展示，在这里还需要设置 `align-self` 属性。

```
aside {  align-self: start;  position: sticky;  top: 1rem;}
```

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/RqbfwXSnN367n2py5WwiaJhQ1KSa5h2hfB8pvkXCK3R3FojQjIE7OAOnRT76hMNO0kgFoTk4y8nhJVNjCsur3Gw/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

## 并集选择器

对于同时作用到不同浏览器的样式，并不推荐使用并集选择器。比如，设置 input 中placeholder 的样式时，需要为每种浏览器使用对应的选择器。根据 w3c 的规定，我们如果在这种场景下使用了并集选择器，那么整个样式规则是不合法的。下面的代码是不推荐的。

```
/* Don't do this, please */input::-webkit-input-placeholder,input:-moz-placeholder {  color: #222;}
```

下面的代码是推荐的。

```
input::-webkit-input-placeholder {  color: #222;}input:-moz-placeholder {  color: #222;}
```
