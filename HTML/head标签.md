---
aliases: []
tags: ['HTML','HTML/head','date/2022-04','year/2022','month/04']
date: 2022-04-11-Monday 14:46:33
update: 2022-04-11-Monday 15:37:20
---

## 1. head 标签

`head`标签与`html`标签，`body`标签一样是一个文档必须的元素。

`head`标签用于定于文档头部信息，它是所有头部元素的容器。`head`中的元素可以引用脚本、指示浏览器在哪里找到样式表、提供元信息等等。

文档的头部描述了文档的各种属性和信息，包括文档的标题、在 Web 中的位置以及和其他文档的关系等。绝大多数文档头部包含的数据都不会真正作为内容显示给读者。

下面这些标签可用在 `head` 部分：`base`, `link`, `meta`, `script`, `style`, 以及 `title`。

`注意:`应该把 `head` 标签放在文档的开始处，紧跟在 `html` 后面，并处于 `body` 标签或 `frameset` 标签之前。

## 2. title 标签

`title` 定义文档的标题，它是 `head` 部分中唯一必需的元素。浏览器会以特殊的方式来使用标题，设置的内容不会显示在页面中，通常把它放置在浏览器窗口的标题栏或状态栏上，如设置为空标题展示当前页面的地址信息。

当把文档加入用户的链接列表或者收藏夹或书签列表时，标题将成为该文档链接的默认名称。

### 1. dir 属性

规定元素中内容的文本方向`rtl`、`ltr`。

### 2. lang 属性

规定元素中内容的语言代码。

## 3. meta 标签

![[meta标签]]

## 4. base 标签

`base`标签定义了文档的基础`url`地址，在文档中所有的相对地址形式的`url`都是相对于这里定义的`url`而言的。为页面上的链接规定默认地址或目标。

```html
<base href="http://www.w3school.com.cn/i/" target="_blank" />
```

base标签包含的属性。

### 1. href

`href`是必选属性，指定了文档的基础`url`地址。例如，如果希望将文档的基础URL定义为`https：//www.abc.com`，则可以使用如下语句：`<base href="http://www.abc.com">`如果文档的超链接指向`welcom.html`,则它实际上指向的是如下`url`地址：`https://www.abc.com/welocme.html`。

### 2. target

定义了当文档中的`链接`点击后的打开方式`_blank`，`_self`，`_parrent`，`_top`。

## 5. link 标签

`link`用于引入外部样式表，在`html`的头部可以包含任意数量的`link`，`link`标签有以下常用属性。

```html
<link type="text/css" rel="stylesheet" href="github-markdown.css">
```

### 1. type

定义包含的文档类型，例如`text/css`

### 2. rel

定义`html`文档和所要包含资源之间的链接关系，可能的值有很多，最为常用的是`stylesheet`，用于包含一个固定首选样式的表单。

### 3. href

表示指向被包含资源的`url`地址。

## 6. style 标签

编写内部样式表的标签。

```html
<style>
    body {
        background: #f3f5f9;
    }
</style>
```

## 7. script 标签

![[script标签]]

## 8. bgsound（仅IE）

网站背景音乐。

```html
<bgsound src="music.mp4" autostart="true" loop="5">
```

### 1. src

表示背景音乐的`url`值。

### 2. autostart

是否自动播放`ture`自动播放，`false`不播放，默认为`false`。

### 3. loop

是否重复播放，值为数字或者`infinite`，表示重复具体次或无限次。
