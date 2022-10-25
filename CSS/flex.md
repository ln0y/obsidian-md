---
aliases: []
tags: ['CSS','date/2022-05','year/2022','month/05']
date: 2022-05-12-Thursday 14:44:56
update: 2022-05-12-Thursday 15:20:10
---

## 弹性盒的基本概念

Flexible Box Module，通常称为flexbox被设计为一维布局模型，并作为一种可以在界面中的项目之间提供空间分配和强大的堆砌功能的方法。

## flexbox的两个轴

使用flexbox是，我们需要考虑两个轴---主轴和交叉轴。主轴由`felx-direction`属性定义，交叉轴垂直于他。

### 主轴

主轴有`flex-direction`决定，flex items排列的方式。

### 交叉轴

交叉轴垂直于主轴运行，假如我们在flex-direction设置为row 或 row-reverse交叉轴垂直向下。

## 弹性容器

使用flexbox布局的文档区域称为**flex容器**。为了创建一个弹性容器，我们将区域容器的`display`属性值设置为`flex`或`inline-flex`。当我们这么做了，这个容器的元素直接变成flex items。与css中的所有属性一样，定义了一些初始值，因此在创建flex容器时，所有包含的flex项都将按照一下方式运行

- 项目显示在一行中（`flex-direction: row`）
- 项目不会从主轴的起始边缘开始。
- 项目不会从主维度上拉伸，但可以收缩
- 这些项目将拉伸填充交叉轴的大小
- `flex-basis: auto`
- `felx-wrap: nowrap`

### flex-direction 主轴

该属性设置弹性项目在弹性容器的分布方式。

| 值 | 描述 |
| --- | --- |
| row | 默认属性，一行中从左到右排列（可以多行） |
| row-reverse | 一行中从右到左排列(可以多行) |
| column | 从上至下排列 |
| column-reverse | 从下至上排列 |

### flex-wrap

设置flex item在一行内或者多行展示

| 值 | 描述 |
| --- | --- |
| nowrap | 默认值，在一行展示 |
| wrap | 多行展示 |
| wrap-reverse | 倒序，多行展示 |

### justify-content

决定了flex container中剩余空间与flex items之间的关系

| 值 | 描述 |
| --- | --- |
| flex-start | (默认)从起点开始顺序排列 |
| flex-end | 相对终点顺序排列 |
| space-evenly | 项目均匀分布，所有项目之间及项目与边框之间距离相等 |
| space-between | 项目均匀分布，第一个项在起点线，最后一项在终点线 |
| space-around | 项目均匀分布，第一个项目两侧有相同的留白空间，相邻项目之间的距离是两个项目之间留白的和 |

### align-items

定义项目在交叉轴上对齐的方式。

| 值 | 描述 |
| --- | --- |
| stretch | (默认)交叉轴方向拉伸显示 |
| flex-start | 项目按交叉轴起点线对齐 |
| flex-end | 项目按交叉轴终点线对 |
| center | 交叉轴方向项目中间对齐 |
| baseline | 交叉轴方向按第一行文字极鲜对齐 |

### align-content

属性定义了交叉轴方向的对齐方式及额外空间分配，类似于主轴`justify-content`的作用

| 值 | 描述 |
| --- | --- |
| stretch | (默认)拉伸显示 |
| flex-start | 从起点线开始顺序排列 |
| flex-end | 相对终点先顺序排列 |
| center | 剧种排列 |
| space-between | 项目均匀分布，第一个在起点线，最后一项在终点线 |
| space-around | 项目均匀分布，每个项目两侧都有相同的留白空间 |

## 应用于弹性项目的属性

为了更好的控制弹性项目，我们呢可以直接改变他们的一些属行，例如下面这三个属性：

- flex-grow
- flex-shrink
- flex-basis

### order

缺省情况下，flex item是按照在代码中出现的先后顺序排列的，然后order属性可以控制项目在容器中的先后顺序。

### flex-basis

`flex-direction`是根据他作为可用空间留下的空间来定义改项目的大小。这个属性的初始值是`auto`\---在这种情况下，浏览器会查看项目是否有大小。如果我们设置元素的width为100px，100px将用作flex-basis。
如果项目没有大小，则内容的大小作为弹性基础。 如果项目同时设置了width和flex-basis，flex-basis的优先级会更高。

### flex-grow

将改`flex-grow`属性设置为正整数，弹性项目可以根据主轴进行扩展。此时该项目将扩展并占据主轴剩余空间。
如果将所有的弹性项目设置`flex-grow: 1`，这些弹性项目将平分弹性容器的剩余空间。

<div style="display: flex; width: 500px; height: 100px;">
    <div style="height: 100px; width: 100px; background-color: khaki;">flex-grow：1</div>
    <div style="flex-grow: 3; width: 200px; background-color: pink;">flex-grow：3</div>
</div>

效果分析：flex-container的总宽度为500px， item1设置的宽度为100px grow为1，item2为200px grow为3，剩余空间为 200px，所以item1最终宽度为 `200 / (3 + 1) * 1 + 100 = 150px`，item2的宽度为`200 / (3 + 1) * 3 + 200 = 350`。 当然如果item1和item2没有设置width，则剩余空间的值则为总宽度减去item1和item2实际内容的宽度

### flex-shrink

`flex-grow`属性用于决定主轴剩余空间的分配，flex-shrink属性控制空间不足时，弹性项目缩小的比例

### flex

flex是 flex-grow flex-shrink flex-basis的简写。 可以使用一个，两个或三个值来制定flex属性。

**单值语法：** 值必须为以下其中之一：

- 一个无单位数：它会作为`flex: <number> 1 0`
- 一个有效的宽度(width)值：它会被当作`<flex-basis>`的值
- 关键字`none`,`auto`或`initial`。

| 值 | 等价于 |
| --- | --- |
| initial | 0 1 auto |
| auto | 1 1 auto |
| none | 0 0 auto |
| number | number 1 0 |

**双值语法：** 第一个值必须为一个无单位数，并且它会被作为`<flex-grow>`的值。第二个值必须为一下之一

- 一个无单位数：它会被当作`<flex-shrink>`的值。
- 一个有效的宽度值：它会被当作`<flex-basis>`的值。

**三值语法：**

- 第一个值必须为一个无单位数，并且他会被当作`<flex-grow>`的值
- 第二个值必须为无单位数，并且它会被当作`<flex-shrink>`的值
- 第三个值必须为一个有效的宽度值，并且他会被当作`<flex-basis>`的值

### align-self

定义项目的对齐方式，可以覆盖`align-items`属性，默认值为auto，表示继承父元素的align-items属性，如果没有父元素，则等同于stretch。

## flex 相关属性计算方法

这里主要是 flex-grow、flex-shrink，分别对应在空间有剩余时的分配、空间不足时的收缩

### flex-grow

剩余空间按 flex-grow 指定的值比例分配即可

举个例子，父容器的宽度为600，两个子项A(300, 1)、B(200, 2)，求具体宽度：

```text
剩余宽度为100

子项增长宽度A = 100 * 1/3 = 33.333, 则实际宽度 = 333.333
子项增长宽度B = 100 * 2/3 = 66.667, 则实际宽度 = 266.667
````

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
