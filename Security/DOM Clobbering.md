---
aliases: []
tags: ['Security','date/2022-11','year/2022','month/11']
date: 2022-11-08-星期二 17:19:29
update: 2022-11-08-星期二 18:32:51
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
