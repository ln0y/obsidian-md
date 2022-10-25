---
aliases: []
tags: ['CSS','date/2022-05','year/2022','month/05']
date: 2022-05-05-Thursday 17:31:32
update: 2022-05-05-Thursday 17:31:32
---

> 本文翻译自 Ahmad Shadeed 的 [Defensive CSS](https://ishadeed.com/article/defensive-css/)

通常，我们希望用一些方法来避免 CSS 出现某些意料之外的样式问题。众所周知，网页上呈现的内容不完全是静态的，是可以发生变化的，因此这增加了 CSS 出现问题的可能性。本文介绍一系列防御性 CSS 的代码片段，帮助我们编写出更健壮的 CSS 代码。换句话说，减少因内容动态的变化引起样式上的问题。

## flex 布局的换行

Flexbox 是 CSS 中经常使用的布局，在父元素中设置 `display: flex` 属性，子元素就会按顺序逐个排列。但是，当它们的空间不够用的时候，这些子元素默认情况下不会进换行。所有我们需要添加 `flex-wrap: wrap` 属性来改变这种行为。下面是一个比较典型的例子。我们有一组选项，它们应该挨着显示。

```css
.options-list {
    display: flex;
}
```

![图片](https://mmbiz.qpic.cn/mmbiz_png/RqbfwXSnN37DvWueIGdJBAQfLuBiblCcH3rsbSic6Mb4SPjyLXceoOyrbmMNafP2pBBoCpkdbefTB3jSh4icOFC0Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

当元素的宽度变窄时，就会出现水平滚动条。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

为了解决这个问题，我们需要允许自动换行。

```css
.options-list {
    display: flex;
    flex-wrap: wrap;
}
```

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

在 flexbox 布局中，允许元素折行是一种很保险的做法，除非你的样式中允许出现滚动。换句话说，使用 `flex-wrap` 可以避免出现预期之外的布局表现（比如，上面例子中的滚动条）

## 空白间距

我们开发者需要考虑不同的内容长度。这意味着，空白间距应该添加到元素上，即使它看起来并不需要。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

在这个例子中，在左边有一个标题，在右边有一个可操作的按钮。目前，它看起来效果还不错。但是让我们看看当标题变长时会发生什么。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

注意到了吗？文本和按钮之间离得太近了。您可能会考虑将文字折行，折行会在后面的内容中讨论，这里我们只关注间距的问题。

如果左侧的标题设置了间距和文本截断，就不会出现这样的问题了。

```
.section__title {  margin-right: 1rem;}
```

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

## 文本内容过长

在布局中，处理比较长的文字内容是很重要的。正如在前面所看到的，当标题太长时，它会被截断。虽然截断不是必选的，但对于某些 UI 来说，处理这种场景是很重要的。

对我来说，这需要有一种防御性的 CSS 方法。在 “问题” 真正发生之前解决它是一件很好的事情。

这是一份名单，现在看起来很完美。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

然而，由于这些内容是用户生成，需要防止内容太长破坏掉页面布局。如下图所示：

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

在这种布局中，设计的一致性非常重要。为了实现这一点，我们可以使用 `text-overflow` 和它的 “朋友们” 来截断文字。

```
.username {    white-space: nowrap;    overflow: hidden;    text-overflow: ellipsis;}
```

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

## 防止图像被拉伸或压缩

当我们无法控制网页上图像的宽高比时，最好提前考虑，并在用户上传与宽高比不一致的图像时提供解决方案。

在下面的示例中，我们有一个带有照片的卡片组件。看起来不错。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

当用户上传不同大小的图像时，图像将被拉伸。这不好。看看图像是如何拉伸的！

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

这个问题可以用 CSS 中的 `object-fit` 来解决。

```
.card__thumb {  object-fit: cover;}
```

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

在项目上，我更喜欢将 `object-fit` 应用到所有图片中，以避免图片被意外的拉伸或压缩。

```
img {  object-fit: cover;}
```

___
