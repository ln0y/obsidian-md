---
aliases: []
tags: ['Security','date/2022-11','year/2022','month/11']
date: 2022-11-19-星期六 17:43:39
update: 2022-11-19-星期六 18:19:16
---

## 内容安全策略(Content Security Policy)是什么?

[内容安全策略(Content Security Policy)](https://www.w3.org/TR/CSP2/)简称`CSP`是由[W3C](https://www.w3.org/)小组定义的一项规范,其主要作用是提供一个额外的安全层,用于检测并削弱某些特定类型的攻击,包括跨站脚本 (XSS) 和数据注入攻击等.

目前内容安全策略(Content Security Policy)的规范一共有三个版本:

1. [Content Security Policy Level 1](https://www.w3.org/TR/CSP1/)
2. [Content Security Policy Level 2](https://www.w3.org/TR/CSP2/)
3. [Content Security Policy Level 3](https://www.w3.org/TR/CSP3/)

## CSP的作用

`CSP`被设计出来的目的就是为了**效防范内容注入攻击**,如XSS攻击等.

它通过让开发者对自己WEB应用声明一个外部资源加载的白名单,使得客户端在运行WEB应用时对外部资源的加载做出筛选和识别,只加载被允许的网站资源.对于不被允许的网站资源不予加载和执行.同时,还可以将WEB应用中出现的不被允许的资源链接和详情报告给我们指定的网址.如此,大大增强了WEB应用的安全性.使得攻击者即使发现了漏洞,也没法注入脚本,除非还控制了一台列入了白名单的服务器.

## 使用CSP

### CSP的选择

根据W3C的设计,`CSP`分为两种模式:

- 一种是`Content-Security-Policy`.

使用这种模式,将会直接阻止非法的外部资源加载,同时也可以选择是否配置将非法资源加载的链接和行为报告给我们指定的网址

- 另一种是`Content-Security-Policy-Report-Only`

使用这种模式时,客户端在遇到非法的外部资源加载时并不会阻止,而是正常加载.但是会将次加载行为和链接报告给我我指定的网址.所以使用此模式时,必须要使用`report-uri`策略配置报告非法资源加载情况的网址.

以上是`CSP`策略的两种模式,在实际使用中,我们可以根据自己的情况任意选择其中一种模式.

### CSP的使用方式

`CSP`的使用方式有两种:

- 一种是前端开发时直接在HTML页面中使用`<meta>`标签,如下:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self';">

<!-- or -->

<meta http-equiv="content-security-policy-report-only" content="default-src 'self';">
```

- 一种是后端开发或服务运维人员对页面的HTTP请求的响应配置`Content-Security-Policy`属性,如在NGINX服务器上配置如下

```nginx
add_header  Content-Security-Policy  "default-src 'self'";

# or

add_header  Content-Security-Policy-Report-Only  "default-src 'self'";
```

通过以上两种方式的任意一种即可启用`CSP`.

### CSP的配置

> 一个策略由一系列策略指令所组成，每个策略指令都描述了一个针对某个特定类型资源以及生效范围的策略。你的策略应当包含一个`default-src`策略指令，在其他资源类型没有符合自己的策略时应用该策略(有关完整列表查看[default-src](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Content-Security-Policy/default-src))。一个策略可以包含`default-src`或者`script-src`指令来防止内联脚本运行, 并杜绝`eval()`的使用。 一个策略也可包含一个`default-src`或 `style-src`指令去限制来自一个`<style>`元素或者style属性的內联样式。

**示例: 常见用例,来自[MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP):**

1. 一个网站管理者想要所有内容均来自站点的同一个源 (不包括其子域名)

```http
Content-Security-Policy: default-src 'self'
```

2. 一个网站管理者允许内容来自信任的域名及其子域名 (域名不必须与CSP设置所在的域名相同)

```http
Content-Security-Policy: default-src 'self' *.trusted.com
```

3. 一个网站管理者允许网页应用的用户在他们自己的内容中包含来自任何源的图片, 但是限制音频或视频需从信任的资源提供者(获得)，所有脚本必须从特定主机服务器获取可信的代码.

```http
Content-Security-Policy: default-src 'self'; img-src *; media-src media1.com media2.com; script-src userscripts.example.com
```

在这里，各种内容默认仅允许从文档所在的源获取, 但存在如下例外:

> - 图片可以从任何地方加载(注意 "\*" 通配符)。
> - 多媒体文件仅允许从 media1.com 和 media2.com 加载(不允许从这些站点的子域名)。
> - 可运行脚本仅允许来自于 userscripts.example.com。

4. 一个线上银行网站的管理者想要确保网站的所有内容都要通过SSL方式获取，以避免攻击者窃听用户发出的请求。

```http
Content-Security-Policy: default-src https://onlinebanking.jumbobank.com
```

该服务器仅允许通过HTTPS方式并仅从onlinebanking.jumbobank.com域名来访问文档。

5. 一个在线邮箱的管理者想要允许在邮件里包含HTML，同样图片允许从任何地方加载，但不允许JavaScript或者其他潜在的危险内容(从任意位置加载)。

```http
Content-Security-Policy: default-src 'self' *.mailsite.com; img-src *
```

注意这个示例并未指定`script-src`。在此CSP示例中，站点通过`default-src`指令的对其进行配置，这也同样意味着脚本文件仅允许从原始服务器获取

6. 违例报告样本

默认情况下，违规报告并不会发送。为启用发送违规报告，你需要指定`report-uri`策略指令，并提供至少一个URI地址去递交报告。这个地址可以是相对于当前网站的相对地址，也可以是一个绝对地址：

```http
Content-Security-Policy-Report-Only: default-src 'none'; style-src cdn.example.com; report-uri /_/csp-reports
```

报告格式如下:

```json
{
  "csp-report": {
    "document-uri": "http://example.com/signup.html",
    "referrer": "",
    "blocked-uri": "http://example.com/css/style.css",
    "violated-directive": "style-src cdn.example.com",
    "original-policy": "default-src 'none'; style-src cdn.example.com; report-uri /_/csp-reports"
  }
}
```

违例报告的语法:

> 作为报告的JSON对象报告包含了以下数据：
>
> - `document-uri`: 发生违规的文档的URI。
> - `referrer`: 违规发生处的文档引用（地址）。
> - `blocked-uri`: 被CSP阻止的资源URI。如果被阻止的URI来自不同的源而非文档URI，那么被阻止的资源URI会被删减，仅保留协议，主机和端口号。
> - `violated-directive`: 违反的策略名称。
> - `original-policy`: 在 Content-Security-Policy HTTP 头部中指明的原始策略。

### CSP的策略指令

- 常见策略类型

| 指令            | 版本 | 注释                                                                                                                                                                                                                                                                                              |
| --------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| default-src     | 1    | 大部分资源未定义时会读取这个配置，少数不会，比如：frame-ancestors，优先级低                                                                                                                                                                                                                       |
| script-src      | 1    | 定义有效的js资源                                                                                                                                                                                                                                                                                  |
| style-src       | 1    | 定义有效的css资源                                                                                                                                                                                                                                                                                 |
| img-src         | 1    | 定义有效的图片资源                                                                                                                                                                                                                                                                                |
| connect-src     | 1    | 加载XMLHttpRequest、WebSocket、fetch、`<a ping>`以及 EventSource资源，如果不被允许则返回400状态码                                                                                                                                                                                                 |
| font-src        | 1    | 定义有效的字体资源，通过@font-face加载                                                                                                                                                                                                                                                            |
| object-src      | 1    | 定义有效的插件资源，比如：`<object>`，`<embed>`或者`<applet>`                                                                                                                                                                                                                                     |
| media-src       | 1    | 定义有效的音频及视频资源，比如：`<audio>`，`<video>`等元素                                                                                                                                                                                                                                        |
| frame-src       | 1    | 定义有效的frame加载资源，在csp2中，frame-src被废弃，使用child-src；在csp3中，又被启用，与child-src同时存在，如果child-src不存在，frame-src也会起作用                                                                                                                                              |
| sandbox         | 1    | 允许iframe的sandbox属性，sandbox会采用同源策略，阻止弹窗、插件及脚本执行，可以通过不设置sandbox属性，而是通过allow-scripts、allow-popups、allow-modals、allow-orientation-lock、allow-pointer-lock、allow-presentation、allow-popups-to-escape-sandbox、allow-top-navigation来透给sandbox字段限制 |
| report-uri      | 1    | 向这个uri发送失败报告，也可以使用Content-Security-Policy-Report-Only来作为http header进行发送但不阻塞网络资源的解析，在csp3中report-uri被废弃，改用report-to指令                                                                                                                                  |
| child-src       | 2    | 定义web workers以及包含嵌套上下文的资源加载，比如`<frame>`以及`<iframe>`                                                                                                                                                                                                                          |
| form-action     | 2    | 定义有效的html标签`<form>`的action资源加载                                                                                                                                                                                                                                                        |
| frame-ancestors | 2    | 定义有效内嵌标签诸如`<frame>`、`<iframe>`、`<object>`、`<embd>`、`<applet>`资源加载，当值为'none'时，大致可以和X-Frame-Options: DENY相当                                                                                                                                                          |
| plugin-types    | 2    | 定义通过`<object>`及`<embd>`的MIME资源类型加载，对于`<applet>`则必须明确MIME为application/x-java-applet                                                                                                                                                                                           |
| base-uri        | 2    | 定义通过`<base>`的html标签中的src属性引用的url资源加载                                                                                                                                                                                                                                            |
| report-to       | 3    | 定义Report-To的http响应头字段                                                                                                                                                                                                                                                                     |
| worker-src      | 3    | 限制通过Worker、SharedWorker以及ServiceWorker的url资源加载                                                                                                                                                                                                                                        |
| manifest-src    | 3    | 限制manifests的url资源加载                                                                                                                                                                                                                                                                        |
| prefetch-src    | 3    | 定义预渲染及预加载请求的资源加载，比如通过`<link>`标签的rel="prefetch"或rel="prerender"属性                                                                                                                                                                                                       |
| navigate-to     | 3    | 限制document的任何方式跳转url，比如通过link跳转，或者window.location被执行，如果form-action被设置，则本规则会被替换，即对于form而言，form-action优先级更高                                                                                                                                        |


**想要了解策略的全部类型可以查看[这里](https://www.w3.org/TR/CSP2/#directives)**

- 策略值类型

| 值               | 版本 | 描述                                                                                        | 样例                                       |
| ---------------- | ---- | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| \*               | 1    | 未知，允许除了data、blob、filesystem、schemes之外的任何url资源加载                          | img-src \*                                 |
| 'none'           | 1    | 不允许加载任何的资源                                                                        | object-src 'none'                          |
| 'self'           | 1    | 只允许同源资源加载                                                                          | script-src 'self'                          |
| 'data:'          | 1    | 允许data格式的资源加载，比如：Base64图片编码                                                | img-src 'self' data:                       |
| xx.xxx.com       | 1    | 允许明确域名的资源加载                                                                      | img-src domain.example.com                 |
| \*.xxx.com       | 1    | 允许加载任何例如：example.com子域下的资源                                                   | img-src \*.example.com                     |
| https://xxx.com  | 1    | 仅允许https协议下域名的资源加载                                                             | img-src https://cdn.com                    |
| https:           | 1    | 允许加载https下任何域名的资源                                                               | img-src https:                             |
| 'unsafe-inline'  | 1    | 允许使用内联元素加载资源，诸如：级联样式、句柄方法、script内容标签以及javascript:URIs等     | script-src 'unsafe-inline'                 |
| 'unsafe-eval'    | 1    | 允许不安全的动态js代码执行                                                                  | script-src 'unsafe-eval'                   |
| 'sha256-'        | 2    | 允许内联script及css匹配hash值后的执行                                                       | script-src 'sha256-xyz...'                 |
| 'nonce-'         | 2    | 允许使用包含nonce属性的内联script及css执行，nonce应该是一个安全的任意值，并且不能被重复使用 | script-src 'nonce-r@nd0m'                  |
| 'strict-dynamic' | 3    | 允许加载非解析型脚本资源，比如：document.createElement('script')                            | script-src 'strict-dynamic'                |
| 'unsafe-hashes'  | 3    | 允许使用事件句柄的方式进行资源加载，但是不允许使用内联脚本及javascript:执行的方式           | script-src 'unsafe-hashes' 'sha256-abc...' |


#### script标签的nonce和hash值

nonce值：每次HTTP回应给出一个授权token，页面内嵌脚本必须有这个token，才会执行。

hash值：列出允许执行的脚本代码的Hash值，页面内嵌脚本的哈希值只有吻合的情况下，才能执行。

##### nonce

服务器发送网页的时候，告诉浏览器一个随机生成的token，thinkjs通过在base.js中设置header值实现。

```js
indexAction() {  
    this.header('Content-Security-Policy', "script-src 'nonce-EDNnf03nceIOfn39fn3e9h3sdfa'");  
}  
```

页面内嵌脚本，必须有这个token才能执行。

```html
<script nonce=EDNnf03nceIOfn39fn3e9h3sdfa>    
  // some code
</script> 
``` 

##### hash

服务器给出一个允许执行的代码的hash值。

```http
Content-Security-Policy: script-src 'sha256-qznLcsROx4GACP2dm0UCKCzCG-HiZ1guq6ZZDob_Tng='  
```

下面的代码就会允许执行，因为hash值相符。

```js
<script>alert('Hello, world.');</script>  
```

备注： 计算hash值的时候，script标签不算在内，除了script-src选项，nonce值和hash值还可以用在style-src选项，控制页面内嵌的样式表。

## 浏览器兼容性

<iframe src="https://caniuse.com/?search=Content%20Security%20Policy"
  border="0"
  frameborder="0"
  height="450"
  width="100%"></iframe>

**参考资料:**

- [MDN---CSP](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP)

- [W3C---Content Security Policy Level 2](https://www.w3.org/TR/CSP2/)
