---
aliases: []
tags: ['HTML','date/2022-03','year/2022','month/03']
date: 2022-03-04-Friday 11:26:58
update: 2022-03-04-Friday 13:52:41
---

## HTML 与 DOM 有什么不同

我们知道`<p>`是 HTML 元素，但又常常将`<p>`这样一个元素称为 DOM 节点，那么 HTML 和 DOM 到底有什么不一样呢？

根据 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Document_Object_Model/Introduction?fileGuid=xxQTRXtVcqtHK6j8) 官方描述：文档对象模型（DOM）是 HTML 和 XML 文档的编程接口。

也就是说，DOM 是用来操作和描述 HTML 文档的接口。**如果说浏览器用 HTML 来描述网页的结构并渲染，那么使用 DOM 则可以获取网页的结构并进行操作**。一般来说，我们使用 JavaScript 来操作 DOM 接口，从而实现页面的动态变化，以及用户的交互操作。

在开发过程中，常常用对象的方式来描述某一类事物，用特定的结构集合来描述某些事物的集合。DOM 也一样，它将 HTML 文档解析成一个由 DOM 节点以及包含属性和方法的相关对象组成的结构集合。

## 操作 DOM

除了获取 DOM 结构以外，通过 HTML DOM 相关接口，我们还可以使用 JavaScript 来访问 DOM 树中的节点，也可以创建或删除节点。比如我们想删除一个元素的子列，可以这么操作：

```js
// 获取到 class 为 swiper-control 的第一个节点，这里得到我们的滚动控制面板
const controlPanel = document.getElementsByClassName("swiper-control")[0];
// 获取滚动控制面板的第一个子节点
const firstChild = controlPanel.firstElementChild;
// 删除滚动控制面板的子节点
controlPanel.removeChild(firstChild);
```

随着应用程序越来越复杂，DOM 操作越来越频繁，需要监听事件和在事件回调更新页面的 DOM 操作也越来越多，频繁的 DOM 操作会导致页面频繁地进行计算和渲染，导致不小的性能开销。于是虚拟 DOM 的想法便被人提出，并在许多框架中都有实现。

虚拟 DOM 其实是用来模拟真实 DOM 的中间产物，它的设计大致可分成 3 个过程：

1. 用 JavaScript 对象模拟 DOM 树，得到一棵虚拟 DOM 树；
2. 当页面数据变更时，生成新的虚拟 DOM 树，比较新旧两棵虚拟 DOM 树的差异；
3. 把差异应用到真正的 DOM 树上。
