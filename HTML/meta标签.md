---
aliases: []
tags: ['HTML','HTML/meta','date/2022-04','year/2022','month/04']
date: 2022-11-09-星期三 10:52:56
update: 2022-11-19-星期六 18:23:52
---

## meta 标签

`meta` 元素往往不会引起用户的注意，但是`meta`对整个网页有影响，会对网页能否被搜索引擎检索，和在搜索中的排名起着关键性的作用。

`meta`有个必须的属性`content`用于表示需要设置的项的值。

`meta`存在两个非必须的属性`http-equiv`和`name`, 用于表示要设置的项。

比如`<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">`,设置的项是 [[Content Security Policy|Content-Security-Policy]] 设置的值是`upgrade-insecure-requests`。

### scheme 属性

`scheme` 属性用于指定要用来翻译属性值的方案。此方案应该在由 `head` 标签的 `profile` 属性指定的概况文件中进行了定义。`html5`不支持该属性。

### http-equiv 属性

如果设置了 `http-equiv` 属性（http-equivalent的简写），`meta` 元素则是编译指令，提供的信息与类似命名的`HTTP header`相同，它可用于模拟 `HTTP header` 响应，通常可以用来控制缓存，刷新等操作。也就是说浏览器在请求服务器获取`html`的时候，服务器会将`html`中设置的`meta`放在响应头中返回给浏览器。常见的类型比如`content-type`, `expires`, `refresh`, `set-cookie`, `window-target`, `charset`， `pragma`等等。

#### content-type

比如：`<meta http-equiv="content-type" content="text/html charset=utf8">`可以用来声明文档类型、设字符集，目前`content-type`只能在html文档中使用。

这样设置浏览器的头信息就会包含:

```txt
content-type: text/html charset=utf8
```

#### expires

用于设置浏览器的过期时间, 其实就是响应头中的[[HTTP 缓存#Expires|expires]]属性。

```html
<meta http-equiv="expires" content="31 Dec 2021">
```

```txt
expires:31 Dec 2008
```

#### refresh

该种设定表示5秒自动刷新并且跳转到指定的网页。如果不设置url的值那么浏览器则刷新本网页。

```html
<meta http-equiv="refresh" content="5 url=http://www.zhiqianduan.com">
```

#### window-target

强制页面在当前窗口以独立页面显示, 可以防止别人在框架中调用自己的页面。

```html
<meta http-equiv="window-target" content="_top'>
```

#### pragma

禁止浏览器从本地计算机的缓存中访问页面的内容

```html
<meta http-equiv="pragma" content="no-cache">
```

#### cache-control

cache-control 用来控制缓存策略

```html
<meta http-equiv="cache-control" content="no-cache">
```

主要有以下属性值：

![[HTTP 缓存#^15680a]]

#### X-UA-Compatible

IE 渲染模式

```html
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
```

这个 meta 标签是用来设置浏览器的兼容性模式的，是 IE8 新加的一个属性，对于 < IE8 的浏览器是不识别的，也是 IE 内核特有的属性，其他内核浏览器不认识。

content 中的内容 `IE=edge,chrome=1`，其中 `IE=edge`告诉浏览器，以当前浏览器最高版本 IE 来进行渲染；`chrome=1`告诉浏览器，如果安装了 Google Chrome Frame插件（GCF），则保持 IE 外观的模式下，使用 chrome 内核进行渲染，这里注意，该插件支持 IE6 ~ IE9，不是 < IE8 的浏览器在网址前面加上 `gcf:` 即可，比如 `gcf:https://baidu.com`。

除此之外还有一个用于设置360浏览器渲染模式的设置，常用 `<meta name="renderer" content="webkit">` 来启用[[meta标签#360|360浏览器]]、QQ浏览器的极速模式（Chrome 内核），类似的还有一个 `<meta name="force-rendering" content="webkit"/>`，让其他双核浏览器切换为极速模式。

### name 属性

如果设置了 `name` 属性，`meta` 元素提供的是文档级别（document-level）的元数据，应用于整个页面。如通过在`content`中设置属性值`keywords`, `description`等属性设置SEO相关内容。 用法与`http-equiv`相同，`name`设置属性名，`content`设置属性值。

#### author

`author`用来标注网页的作者

```html
<meta name="author" content="aaa@mail.abc.com">
```

#### description

`description`用来告诉搜素引擎当前网页的主要内容，是关于网站的一段描述信息。用于告诉搜索引擎你网站的主要内容， 此内容可能被用作搜索引擎结果的一部分。

```html
<meta name="description" content="这是我的HTML">
```

#### keywords

`keywords`设置网页的关键字，来告诉浏览器关键字是什么。是一个经常被用到的名称。它为文档定义了一组关键字。某些搜索引擎在遇到这些关键字时，会用这些关键字对文档进行分类。在网络和 SEO 刚刚兴起的时候，这个标签是相当有用的，但是到如今，很多搜索引擎都已经不再用keywords标签作排名因素。我们在使用时应该避免关键词堆砌

```html
<meta name="keywords" content="Hello world">
```

#### generator

表示当前`html`是用什么工具编写生成的，并没有实际作用，一般是编辑器自动创建的。

```html
<meta name="generator" content="vscode">
```

#### revised

指定页面的最新版本

```html
<meta name="revised" content="V2，2015/10/1">
```

#### robots

robots 用于告诉网页爬虫如何索引网页

```html
<meta name="robots" content="all">
```

它有以下几种参数值：

- `all`：对索引编制或内容显示无任何限制, 该指令为默认值
- `noindex`: 告诉搜索引擎不要索引当前页, 等价于noindex，nofollow
- `index`: 告诉搜索引擎索引当前页
- `follow`: 即使页面没有被索引，爬虫也应该爬取页面上的所有链接
- `nofollow`: 告诉爬虫不要跟踪页面上的任何链接以及资源
- `noimageindex`: 告诉爬虫不要索引页面上的任何图片
- `none`: 相当于同时使用 noindex 和 nofollow
- `noarchive`: 不在搜索结果中显示缓存链接。如果您未指定此指令，搜索引擎可能会生成缓存网页，并且用户可能会通过搜索结果访问该网页。
- `nosnippet`: 不在搜索结果中显示该网页的文本摘要或视频预览
- `noarchive`: 在搜索结果中不保存当前页面的快照
- `noodp`: 不使用开放目录中的网页摘要描述。
- `noydir`: 不使用雅虎分类目录中的网页摘要。

最后两个可能不是很好理解，`noodp` 是 NO Open Directory Project 的缩写，`noydir` 是 NO Yahoo Directory 的缩写。他两是类似的，都是可以让大家录入网站、摘要，记录网站的信息，两个区别：前者是开放的，大家都可以维护，后者是提交之后审核生效，可以看这里。

有些网站会设置开放目录中的信息，导致搜索引擎展示开放目录中设置的信息，和网站的现有信息不匹配，通过 noodp、noydir 禁止搜索引擎使用开放目录上的信息，使用网站页面的现有信息。

#### viewport

viewport 是用户网页的可视区域。viewport 通常用于设置页面的视口, 这个属性常用于设计移动端网页。

一个常用的针对移动网页优化过的页面的 viewport meta 标签大致如下：

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

它主要有以下属性值：

- `width`：控制 viewport 的大小，可以指定的一个值，如 600，或者特殊的值，如 device-width 为设备的宽度
- `height`：和 width 相对应，指定高度
- `initial-scale`：初始缩放比例，也即是当页面第一次 load 的时候缩放比例
- `maximum-scale`：允许用户缩放到的最大比例
- `minimum-scale`：允许用户缩放到的最小比例
- `user-scalable`：用户是否可以手动缩放

#### subject

subject 是关于你的网站主题的简短描述

```html
<meta name="subject" content="你的网站主题">
```

#### rating

rating 基于网站内容给出一般的年龄分级，通常用于让浏览者知道内容是不是合适的。如果您希望对页面的受众适当性进行评分，请使该标记

```html
<meta name="rating" content="General">
```

它主要有以下属性值：

- general
- mature
- restricted
- adult
- 14 years
- safe for kids

#### referrer

referrer 允许由客户端指定资源的 URI 来自于哪一个请求地址，它告诉了服务器，用户在访问当前资源时是从哪过来的。此数据可用于分析、日志记录、优化缓存等。与HTTP请求中的referer字段相同。（注：Referer的正确拼写是Referrer，但是在写入标准时写错了，只好将错就错）

```html
<meta name="referrer" content="no-referrer">
```

它主要有以下属性值：

- `no-referrer`: 整个 referrer 会被移除。访问来源信息不随着请求一起发送。
- `no-referrer-when-downgrade`: （默认值） 在没有指定任何策略的情况下用户代理的默认行为。在同等安全级别的情况下，引用页面的地址会被发送(HTTPS->HTTPS)，但是在降级的情况下不会被发送 (HTTPS->HTTP)
- `origin`: 在任何情况下，仅发送文件的源作为引用地址
- `origin-when-cross-origin`: 对于同源的请求，会发送完整的URL作为引用地址，但是对于非同源请求仅发送文件的源
- `same-origin`: 对于同源的请求会发送引用地址，但是对于非同源请求则不发送引用地址信息
- `strict-origin`: 在同等安全级别的情况下，发送文件的源作为引用地址(HTTPS->HTTPS)，但是在降级的情况下不会发送 (HTTPS->HTTP)
- `strict-origin-when-cross-origin`: 对于同源的请求，会发送完整的URL作为引用地址；在同等安全级别的情况下，发送文件的源作为引用地址(HTTPS->HTTPS)；在降级的情况下不发送此信息 (HTTPS->HTTP)
- `unsafe-url`: 无论是同源请求还是非同源请求，都发送完整的 URL（移除参数信息之后）作为引用地址

#### copyright

copyright 用于标注版权信息

```html
<meta name="copyright" content="Liu Xing">
```

#### format-detection

当该 HTML 页面在手机上浏览时会进行自动识别

在 iPhone 上默认值是：

```html
<!-- 该标签用于指定是否将网页内容中的手机号码显示为拨号的超链接 -->
<meta name="format-detection" content="telephone=yes"/>
```

如果你不希望手机自动将网页中的电话号码显示为拨号的超链接，那么可以这样写：

```html
<!-- 不识别电话 -->
<meta name="format-detection" content="telephone=no"/>
<!-- 不识别email -->
<meta name="format-detection" content="email=no" />
<!-- 不识别地址 -->
<meta name="format-detection" content="address=no">
```

#### apple

- [apple-mobile-web-app-capable](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html#//apple_ref/doc/uid/TP40008193-SW3--)

```html
<meta name="apple-mobile-web-app-capable" content="yes">
```

网站开启对web app程序的支持，设置web应用程序是否以全屏模式运行。

- [apple-mobile-web-app-status-bar-style](https://developer.apple.com/library/safari/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html#//apple_ref/doc/uid/TP40008193-SW4)

```html
<meta name="apple-mobile-web-app-status-bar-style" content="black">
```

在web app应用下状态条（屏幕顶部条）的颜色；

默认值为 default （白色），可以定为 black （黑色）和 black-translucent （灰色半透明）。

- [apple-mobile-web-app-title](http://www.mobilexweb.com/blog/iphone-5-ios-6-html5-developers)

```html
<meta name="apple-mobile-web-app-title" content="page title">
```

设置web应用程序的显示标题。

- apple-mobile-web-app-orientations

```html
<meta name="apple-mobile-web-app-orientations" content="portrait-any">
```

可选值："portrait", "portrait-upside-down", "landscape-right", "landscape-left", "portrait-any"

- apple-touch-fullscreen

```html
<meta name="apple-touch-fullscreen" content="yes">
```

"添加到主屏幕“后，这meta的作用就是隐藏默认的苹果工具栏和菜单栏。content有两个值”yes”和”no”,当我们需要显示工具栏和菜单栏时，这个行meta就不用加了，默认就是显示。

- [apple-touch-icon](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html#//apple_ref/doc/uid/TP40002051-CH3-SW6)

```html
<!-- 这是link标签 -->
<link rel="apple-touch-icon" sizes="144x144" href="xxx.png">
```

iOS用rel="apple-touch-icon",android 用rel="apple-touch-icon-precomposed"。这样就能在用户把网页存为书签时，在手机HOME界面创建应用程序样式的图标。

- apple-touch-startup-image

```html
<!-- 这是link标签 -->
<link rel="apple-touch-startup-image" href="/path/to/launch.png">
```

启动屏幕图片

#### Google

- Android 设置主题色

```html
<meta name="theme-color" content="#E64545">
```

- Android 设置添加到主屏幕

```html
<meta name="mobile-web-app-capable" content="yes">
```

- Chrome 禁用翻译提示

```html
<meta name="google" content="notranslate">
```

#### IE

- 强制 IE 8/9/10 使用其最新的渲染引擎

```html
<meta http-equiv="x-ua-compatible" content="ie=edge">
```

- 通过 Skype Toolbar 浏览器扩展功能禁用自动检测和格式化可能的电话号码

```html
<meta name="skype_toolbar" content="skype_toolbar_parser_compatible">
```

- Windows 磁贴

```html
<meta name="msapplication-config" content="/browserconfig.xml">
```

最低要求的的 browserconfig.xml 配置：

```xml
<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square70x70logo src="small.png"/>
      <square150x150logo src="medium.png"/>
      <wide310x150logo src="wide.png"/>
      <square310x310logo src="large.png"/>
    </tile>
  </msapplication>
</browserconfig>
```

#### 360

- renderer

```html
<!-- 选择渲染引擎 -->
<meta name="renderer" content="webkit|ie-comp|ie-stand"
```

设置 360 浏览器的渲染引擎

#### UC

- screen-orientation

```html
<meta name="screen-orientation" content="landscape/portrait">
```

 在指定方向上锁定屏幕（锁定横 / 竖屏）

- full-screen

```html
<meta name="full-screen" content="yes">
```

全屏显示页面

- imagemode

```html
<meta name="imagemode" content="force">
```

即使在"文本模式"下，UC 浏览器也会显示图片

- browsermode

```html
<meta name="browsermode" content="application">
```

页面将以"应用模式"显示（全屏、禁止手势等）

- nightmode

```html
<meta name="nightmode" content="disable">
```

禁用 UC 浏览器的"夜间模式"

- layoutmode

```html
<meta name="layoutmode" content="fitscreen">
```

简化页面，减少数据传输

- wap-font-scale

```html
<meta name="wap-font-scale" content="no">
```

禁用的 UC 浏览器"当此页面中有较多文本时缩放字体"的功能

#### QQ

- x5-orientation

```html
<meta name="x5-orientation" content="landscape/portrait">
```

在指定方向上锁定屏幕（锁定横 / 竖屏）

- x5-fullscreen

```html
<meta name="x5-fullscreen" content="true">
```

全屏显示此页面

- x5-page-mode

```html
<meta name="x5-page-mode" content="app">
```

页面以"应用模式"显示
