---
aliases: []
tags: ['CSS','date/2022-11','year/2022','month/11']
date: 2022-11-16-星期三 15:19:32
update: 2022-11-16-星期三 15:35:20
---

介绍两个和滚动定位相关的 CSS 属性：[scroll-padding](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding)和 [scroll-margin](https://developer.mozilla.org/zh-CN/docs/Web/CSS/scroll-margin)

在平时开发中，经常会碰到需要快速定位的问题，比如常见的锚点定位

```html
<ul>
  <li><a href="#语法">语法</a></li>
  <li><a href="#示例">示例</a></li>
  ...
</ul>
<article>
    <h2 id="语法">语法</h2>
  <p>...</p>
  <h2 id="示例">示例</h2>
  <p>...</p>
  ...
</article>
```

这样，在点击a标签时会自动定位到与之相对应的内容上，如下

![](_attachment/img/008vxvgGgy1h7m3jb8aurg30xc0ocnpe.gif)

但是，这种通过锚点触发的定位默认是**紧贴滚动容器边缘**的，如果一些定位元素，比如`fixed`定位的头部，就会出现被遮挡的情况，如下

![](_attachment/img/008vxvgGgy1h7m3p015hpg30xc0ockjl.gif)

可以看到，“示例”这个标题由于紧贴顶部，导致被`sticky`定位的头部遮住了。

那么，如何让自动定位时让目标元素预留出足够大的“安全”间距呢？

## 一、一行 CSS解决

没错，看似有些麻烦的问题其实可以通过一行 CSS 解决，那就是 [scroll-margin](https://developer.mozilla.org/zh-CN/docs/Web/CSS/scroll-margin) ，下面是 MDN 的介绍

> `scroll-margin` 属性的值代表用于将盒元素拖拽到显示区域的拖拽滚动区域的起点。拖拽滚动区域由是由转换后边框大小的盒元素决定的，它会找到盒元素的矩形边界（在滚动的容器的坐标空间轴上），并添加指定的起点。

在上面这个例子中，可以直接给目标设置`scroll-margin`

```css
h2{
  scroll-margin: 6rem;
}
```

设置这个属性后，当自动滚动定位到`h2`时，会自动预留`6rm`的间隔（可以防止被头部遮挡），下面是演示（红框表示`6rem`的间隔）

![](_attachment/img/008vxvgGgy1h7m5vd8feeg30xc0ockjm.gif)

是不是非常简单，最终效果如下

![](_attachment/img/008vxvgGgy1h7m3jb8aurg30xc0ocnpe.gif)

其实，MDN官方已经采用了这种方式，经常看看 MDN，会发现有很多非常巧妙的实现，如下

![](_attachment/img/008vxvgGgy1h7m646x2gnj31420u00x9.jpg)

## 二、还有一个 scroll-padding

和`scroll-margin`比较类似的还有一个 [scroll-padding](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding)，功能都是一样的，只是作用对象不一样。

在前面的例子中可以看到，`scroll-margin`是直接设置**目前元素**上的，`scroll-padding`不一样，它需要设置在**滚动容器**上，比如

```css
html {
  scroll-padding: 6rem
}
```

这种方式也是可以达到相同的效果的

![](_attachment/img/008vxvgGgy1h7m7k1t4slj314c0u0wiz.jpg)

一般情况下，两种方式都可以自行选择，如果很清楚滚动容器是哪个，可以直接选择用`scroll-padding`，否则就用`scroll-margin`

## 三、其他滚动定位方式

除了锚点定位以外，还有其他一些方式可以触发滚动定位

### 1\. scrollIntoView

有时候，我们需要将指定元素滚动到视线范围之内，这时就需要用到这样一个`DOM`方法：[scrollIntoView](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/scrollIntoView)

```js
element.scrollIntoView();
```

这个定位和前面的锚点定位一样，默认也是紧贴滚动容器的，如果设置了`scroll-margin`或者`scroll-pading`，也可以实现在滚动定位时自动预留一定间距

![](_attachment/img/008vxvgGgy1h7m7uo2xu7g30xc0ocqv5.gif)

### 2\. focus 定位

在默认情况下，元素（比如`a`链接）在`focus`聚焦时都会自动滚动到视线范围之内。和上面几种情况一样，如果有`fixed`定位元素，有可能在`focus`时被遮挡的问题。

如果设置了`scroll-margin`或者`scroll-pading`，这样就**可以避免找不到焦点**的情况，确保一直都能看到焦点，下面是通过`tab`键聚焦的情况

![](_attachment/img/008vxvgGgy1h7m87t3bvhg30xc0oc4qr.gif)

### 3\. Scroll-snap

还有一种情况是滚动捕捉：[scroll-snap-type](https://developer.mozilla.org/zh-CN/docs/Web/CSS/scroll-snap-type)，这个属性可以让滚动时自动捕捉临界点。正常情况下，滚动临界点是紧贴滚动容器的，像这样

![](_attachment/img/008vxvgGgy1h7m8ga6flig30xc0h3tp0.gif)

如果希望预留一定的距离如何处理呢？还是这个`scroll-margin`，下面给第二个元素设置了一定的`scroll-margin`，效果如下

![](_attachment/img/008vxvgGgy1h7m8imujlmg30xc0h37nt.gif)

可以看到，在滚动到第2个元素时，提前预留了一定的距离，而且还可以设置负值，这样在滚动到第2个元素时，可以提前看到第3个的部分内容

![](_attachment/img/008vxvgGgy1h7m8m23jsfg30xc0h3njg.gif)

## 四、兼容性和总结

最后来看一下兼容性，一个体验增强属性，兼容性还不错（safari有些拉胯😭）

<iframe src="https://caniuse.com/mdn-css_properties_scroll-margin"
  border="0"
  frameborder="0"
  height="450"
  width="100%"></iframe>

不过，现在了解也不晚，下面来总结一下

1. 默认情况下自动滚动定位都是与滚动容器贴边的，有时候并不美好
2. `scroll-padding`和`scroll-margin`可以在自动滚动定位时预留指定的间距
3. `scroll-margin`作用对象是目标元素，`scroll-padding`作用对象是滚动容器
4. 滚动定位方式有锚点定位、`scrollIntoView`定位、`focus`定位、还有`Scroll-snap`定位
5. 体验增强属性，兼容性还不错，主要是`safari`拖后腿
