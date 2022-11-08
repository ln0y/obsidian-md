---
aliases: []
tags: ['Security','date/2022-11','year/2022','month/11']
date: 2022-11-08-星期二 17:19:29
update: 2022-11-08-星期二 18:48:43
---

[原文](https://blog.huli.tw/2021/01/23/dom-clobbering/)

## 前言

在正式开始之前，先给大家一个趣味题目小试身手。

假设你有一段程式码，有一个按钮以及一段 script，如下所示：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>

<body>
  <button id="btn">click me</button>
  <script>
    // TODO: add click event listener to button
  </script>
</body>
</html>
```

现在请你尝试用「最短的程式码」，实作出「点下按钮时会跳出 alert(1)」这个功能。

举例来说，这样写可以达成目标：

```js
document.getElementById('btn')
  .addEventListener('click', () => {
    alert(1)
  })
```

那如果要讓程式碼最短，你的答案會是什麼？

大家可以在往下看以前先想一下這個問題，想好以後就讓我們正式開始吧！

防雷

.

.

.

.

.

.

.

.

.

.

.

.

.

## DOM 与 window 的量子纠缠

你知道 DOM 里面的东西，有可能影响到 window 吗？

这个行为是我几年前在脸书的前端社群无意间得知的，那就是你在 HTML 里面设定一个有 id 的元素之后，在 JS 里面就可以直接存取到它：

```html
<button id="btn">click me</button>  
<script>  
  console.log(window.btn) // <button id="btn">click me</button>  
</script>
```

然后因为 JS 的 scope，所以你就算直接用 btn 也可以，因为当前的 scope 找不到就会往上找，一路找到 window。

所以开头那题，答案是：

```js
btn.onclick = () => alert(1)
```

不需要 getElementById，也不需要 querySelector，只要直接用跟 id 同名的变数去拿，就可以拿得到。

而这个行为是有明确定义在 spec 上的，在 [7.3.3 Named access on the Window object](https://html.spec.whatwg.org/multipage/window-object.html#named-access-on-the-window-object)：

![[Pasted image 20221108184725.png|800]]

帮大家节录两个重点：

1. the value of the name content attribute for all embed, form, img, and object elements that have a non-empty name content attribute

2. the value of the id content attribute for all HTML elements that have a non-empty id content attribute

也就是说除了 id 可以直接用 window 存取到以外，embed, form, img 跟 object 这四个 tag 用 name 也可以存取到：

```html
<embed name="a"></embed>  
<form name="b"></form>  
<img name="c" />  
<object name="d"></object>
```

但是知道这个有什么用呢？有，理解这个规格之后，我们可以得出一个结论：

> 我们是有机会透过 HTML 元素来影响 JS 的

而这个手法用在攻击上，就是标题的 DOM Clobbering。之前是因为这个攻击才第一次听到 clobbering 这个单字的，去查一下发现在 CS 领域中有覆盖的意思，就是透过 DOM 把一些东西覆盖掉以达成攻击的手段。
