---
aliases: []
tags: ['Security','CSRF','date/2022-11','year/2022','month/11']
date: 2022-11-21-星期一 15:31:55
update: 2022-12-21-星期三 15:44:23
---

# 背景

随着互联网的高速发展，信息安全问题已经成为企业最为关注的焦点之一，而前端又是引发企业安全问题的高危据点。在移动互联网时代，前端人员除了传统的 XSS、CSRF 等安全问题之外，又时常遭遇网络劫持、非法调用 Hybrid API 等新型安全问题。当然，浏览器自身也在不断在进化和发展，不断引入 CSP、Same-Site Cookies 等新技术来增强安全性，但是仍存在很多潜在的威胁，这需要前端技术人员不断进行“查漏补缺 "。

# CSRF 攻击

## CSRF 漏洞的发生

相比 XSS，CSRF 的名气似乎并不是那么大，很多人都认为 CSRF“不那么有破坏性 "。真的是这样吗？

接下来有请小明出场~~

### 小明的悲惨遭遇

这一天，小明同学百无聊赖地刷着 Gmail 邮件。大部分都是没营养的通知、验证码、聊天记录之类。但有一封邮件引起了小明的注意：

> 甩卖比特币，一个只要 998！！

聪明的小明当然知道这种肯定是骗子，但还是抱着好奇的态度点了进去（请勿模仿）。果然，这只是一个什么都没有的空白页面，小明失望的关闭了页面。一切似乎什么都没有发生……

在这平静的外表之下，黑客的攻击已然得手。小明的 Gmail 中，被偷偷设置了一个过滤规则，这个规则使得所有的邮件都会被自动转发到 haker@hackermail\.com。小明还在继续刷着邮件，殊不知他的邮件正在一封封地，如脱缰的野马一般地，持续不断地向着黑客的邮箱转发而去。

不久之后的一天，小明发现自己的域名已经被转让了。懵懂的小明以为是域名到期自己忘了续费，直到有一天，对方开出了 $650 的赎回价码，小明才开始觉得不太对劲。

小明仔细查了下域名的转让，对方是拥有自己的验证码的，而域名的验证码只存在于自己的邮箱里面。小明回想起那天奇怪的链接，打开后重新查看了“空白页 " 的源码：

```html
<form method="POST" action="https://mail.google.com/mail/h/ewt1jmuj4ddv/?v=prf" enctype="multipart/form-data">
    <input type="hidden" name="cf2_emc" value="true"/>
    <input type="hidden" name="cf2_email" value="hacker@hakermail.com"/>
    .....
    <input type="hidden" name="irf" value="on"/>
    <input type="hidden" name="nvp_bu_cftb" value="Create Filter"/>
</form>
<script>
    document.forms[0].submit()
</script>
```

> 这个页面只要打开，就会向 Gmail 发送一个 post 请求。请求中，执行了“Create Filter" 命令，将所有的邮件，转发到“hacker@hakermail\.com"。
>
> 小明由于刚刚就登陆了 Gmail，所以这个请求发送时，携带着小明的登录凭证（Cookie），Gmail 的后台接收到请求，验证了确实有小明的登录凭证，于是成功给小明配置了过滤器。
>
> 黑客可以查看小明的所有邮件，包括邮件里的域名验证码等隐私信息。拿到验证码之后，黑客就可以要求域名服务商把域名重置给自己。

小明很快打开 Gmail，找到了那条过滤器，将其删除。然而，已经泄露的邮件，已经被转让的域名，再也无法挽回了……

以上就是小明的悲惨遭遇。而“点开一个黑客的链接，所有邮件都被窃取 " 这种事情并不是杜撰的，此事件原型是 2007 年 Gmail 的 CSRF 漏洞：

<https://www.davidairey.com/google-gmail-security-hijack/>

当然，目前此漏洞已被 Gmail 修复，请使用 Gmail 的同学不要慌张。

### 什么是 CSRF

CSRF（Cross-site request forgery）跨站请求伪造：攻击者诱导受害者进入第三方网站，在第三方网站中，向被攻击网站发送跨站请求。利用受害者在被攻击网站已经获取的注册凭证，绕过后台的用户验证，达到冒充用户对被攻击的网站执行某项操作的目的。

一个典型的 CSRF 攻击有着如下的流程：

- 受害者登录 a.com，并保留了登录凭证（Cookie）。
- 攻击者引诱受害者访问了 b.com。
- b.com 向 a.com 发送了一个请求：a.com/act=xx。浏览器会默认携带 a.com 的 Cookie。
- a.com 接收到请求后，对请求进行验证，并确认是受害者的凭证，误以为是受害者自己发送的请求。
- a.com 以受害者的名义执行了 act=xx。
- 攻击完成，攻击者在受害者不知情的情况下，冒充受害者，让 a.com 执行了自己定义的操作。

### 几种常见的攻击类型

- GET 类型的 CSRF

GET 类型的 CSRF 利用非常简单，只需要一个 HTTP 请求，一般会这样利用：

```html
 <img src="http://bank.example/withdraw?amount=10000&for=hacker" >
```

在受害者访问含有这个 img 的页面后，浏览器会自动向 `http://bank.example/withdraw?account=xiaoming&amount=10000&for=hacker` 发出一次 HTTP 请求。bank.example 就会收到包含受害者登录信息的一次跨域请求。

- POST 类型的 CSRF

这种类型的 CSRF 利用起来通常使用的是一个自动提交的表单，如：

```html
 <form action="http://bank.example/withdraw" method=POST>
    <input type="hidden" name="account" value="xiaoming" />
    <input type="hidden" name="amount" value="10000" />
    <input type="hidden" name="for" value="hacker" />
</form>
<script> document.forms[0].submit(); </script>
```

访问该页面后，表单会自动提交，相当于模拟用户完成了一次 POST 操作。

POST 类型的攻击通常比 GET 要求更加严格一点，但仍并不复杂。任何个人网站、博客，被黑客上传页面的网站都有可能是发起攻击的来源，后端接口不能将安全寄托在仅允许 POST 上面。

- 链接类型的 CSRF

链接类型的 CSRF 并不常见，比起其他两种用户打开页面就中招的情况，这种需要用户点击链接才会触发。这种类型通常是在论坛中发布的图片中嵌入恶意链接，或者以广告的形式诱导用户中招，攻击者通常会以比较夸张的词语诱骗用户点击，例如：

```html
  <a href="http://test.com/csrf/withdraw.php?amount=1000&for=hacker" taget="_blank">
  重磅消息！！
  <a/>
```

由于之前用户登录了信任的网站 A，并且保存登录状态，只要用户主动访问上面的这个 PHP 页面，则表示攻击成功。

### CSRF 的特点

- 攻击一般发起在第三方网站，而不是被攻击的网站。被攻击的网站无法防止攻击发生。
- 攻击利用受害者在被攻击网站的登录凭证，冒充受害者提交操作；而不是直接窃取数据。
- 整个过程攻击者并不能获取到受害者的登录凭证，仅仅是“冒用 "。
- 跨站请求可以用各种方式：图片 URL、超链接、CORS、Form 提交等等。部分请求方式可以直接嵌入在第三方论坛、文章中，难以进行追踪。

CSRF 通常是跨域的，因为外域通常更容易被攻击者掌控。但是如果本域下有容易被利用的功能，比如可以发图和链接的论坛和评论区，攻击可以直接在本域下进行，而且这种攻击更加危险。

## 防护策略

CSRF 通常从第三方网站发起，被攻击的网站无法防止攻击发生，只能通过增强自己网站针对 CSRF 的防护能力来提升安全性。

上文中讲了 CSRF 的两个特点：

- CSRF（通常）发生在第三方域名。
- CSRF 攻击者不能获取到 Cookie 等信息，只是使用。

针对这两点，我们可以专门制定防护策略，如下：

- 阻止不明外域的访问
    - 同源检测
    - 浏览器同源策略
    - Samesite Cookie

- 提交时要求附加本域才能获取的信息
    - CSRF Token
    - 双重 Cookie 验证

以下我们对各种防护方法做详细说明：

### 同源检测

既然 CSRF 大多来自第三方网站，那么我们就直接禁止外域（或者不受信任的域名）对我们发起请求。

那么问题来了，我们如何判断请求是否来自外域呢？

在 HTTP 协议中，每一个异步请求都会携带两个 Header，用于标记来源域名：

- Origin Header
- Referer Header

这两个 Header 在浏览器发起请求时，大多数情况会自动带上，并且不能由前端自定义内容。

服务器可以通过解析这两个 Header 中的域名，确定请求的来源域。

#### 使用 Origin Header 确定来源域名

在部分与 CSRF 有关的请求中，请求的 Header 中会携带 Origin 字段。字段内包含请求的域名（不包含 path 及 query）。

如果 Origin 存在，那么直接使用 Origin 中的字段确认来源域名就可以。

但是 Origin 在以下两种情况下并不存在：

- **IE11 同源策略：** IE 11 不会在跨站 CORS 请求上添加 Origin 标头，Referer 头将仍然是唯一的标识。最根本原因是因为 IE 11 对同源的定义和其他浏览器有不同，有两个主要的区别，可以参考 [MDN Same-origin\_policy#IE\_Exceptions](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy#IE_Exceptions)
- **302 重定向：** 在 302 重定向之后 Origin 不包含在重定向的请求中，因为 Origin 可能会被认为是其他来源的敏感信息。对于 302 重定向的情况来说都是定向到新的服务器上的 URL，因此浏览器不想将 Origin 泄漏到新的服务器上。

#### 使用 Referer Header 确定来源域名

根据 HTTP 协议，在 HTTP 头中有一个字段叫 Referer，记录了该 HTTP 请求的来源地址。

对于 Ajax 请求，图片和 script 等资源请求，Referer 为发起请求的页面地址。对于页面跳转，Referer 为打开页面历史记录的前一个页面地址。因此我们使用 Referer 中链接的 Origin 部分可以得知请求的来源域名。

这种方法并非万无一失，Referer 的值是由浏览器提供的，虽然 HTTP 协议上有明确的要求，但是每个浏览器对于 Referer 的具体实现可能有差别，并不能保证浏览器自身没有安全漏洞。使用验证 Referer 值的方法，就是把安全性都依赖于第三方（即浏览器）来保障，从理论上来讲，这样并不是很安全。在部分情况下，攻击者可以隐藏，甚至修改自己请求的 Referer。

2014 年，W3C 的 Web 应用安全工作组发布了 Referrer Policy 草案，对浏览器该如何发送 Referer 做了详细的规定。截止现在新版浏览器大部分已经支持了这份草案，我们终于可以灵活地控制自己网站的 Referer 策略了。新版的 Referrer Policy 规定了五种 Referer 策略：No Referrer、No Referrer When Downgrade、Origin Only、Origin When Cross-origin、和 Unsafe URL。之前就存在的三种策略：never、default 和 always，在新标准里换了个名称。他们的对应关系如下：

| 策略名称                   | 属性值（新）                     | 属性值（旧） |
| -------------------------- | -------------------------------- | ------------ |
| No Referrer                | no-Referrer                      | never        |
| No Referrer When Downgrade | no-Referrer-when-downgrade       | default      |
| Origin Only                | (same or strict) origin          | origin       |
| Origin When Cross Origin   | (strict) origin-when-crossorigin | \-           |
| Unsafe URL                 | unsafe-url                       | always       |

根据上面的表格因此需要把 Referrer Policy 的策略设置成 same-origin，对于同源的链接和引用，会发送 Referer，referer 值为 Host 不带 Path；跨域访问则不携带 Referer。例如：`aaa.com` 引用 `bbb.com` 的资源，不会发送 Referer。

设置 Referrer Policy 的方法有三种：

1. 在 [[Content Security Policy|CSP]] 设置
2. 页面头部增加 [[meta标签#referrer|meta]] 标签
3. a 标签增加 referrerpolicy 属性

上面说的这些比较多，但我们可以知道一个问题：攻击者可以在自己的请求中隐藏 Referer。如果攻击者将自己的请求这样填写：

```html
 <img src="http://bank.example/withdraw?amount=10000&for=hacker" referrerpolicy="no-referrer">
```

那么这个请求发起的攻击将不携带 Referer。

另外在以下情况下 Referer 没有或者不可信：

1.IE6、7 下使用 window.location.href=url 进行界面的跳转，会丢失 Referer。

2.IE6、7 下使用 window.open，也会缺失 Referer。

3.HTTPS 页面跳转到 HTTP 页面，所有浏览器 Referer 都丢失。

4.点击 Flash 上到达另外一个网站的时候，Referer 的情况就比较杂乱，不太可信。

#### 无法确认来源域名情况

当 Origin 和 Referer 头文件不存在时该怎么办？如果 Origin 和 Referer 都不存在，建议直接进行阻止，特别是如果您没有使用随机 [[#CSRF Token]]（参考下方）作为第二次检查。

#### 如何阻止外域请求

通过 Header 的验证，我们可以知道发起请求的来源域名，这些来源域名可能是网站本域，或者子域名，或者有授权的第三方域名，又或者来自不可信的未知域名。

我们已经知道了请求域名是否是来自不可信的域名，我们直接阻止掉这些的请求，就能防御 CSRF 攻击了吗？

且慢！当一个请求是页面请求（比如网站的主页），而来源是搜索引擎的链接（例如百度的搜索结果），也会被当成疑似 CSRF 攻击。所以在判断的时候需要过滤掉页面请求情况，通常 Header 符合以下情况：

```
Accept: text/html
Method: GET
```

但相应的，页面请求就暴露在了 CSRF 的攻击范围之中。如果你的网站中，在页面的 GET 请求中对当前用户做了什么操作的话，防范就失效了。

例如，下面的页面请求：

```
GET https://example.com/addComment?comment=XXX&dest=orderId
```

注：这种严格来说并不一定存在 CSRF 攻击的风险，但仍然有很多网站经常把主文档 GET 请求挂上参数来实现产品功能，但是这样做对于自身来说是存在安全风险的。

另外，前面说过，CSRF 大多数情况下来自第三方域名，但并不能排除本域发起。如果攻击者有权限在本域发布评论（含链接、图片等，统称 UGC），那么它可以直接在本域发起攻击，这种情况下同源策略无法达到防护的作用。

综上所述：同源验证是一个相对简单的防范方法，能够防范绝大多数的 CSRF 攻击。但这并不是万无一失的，对于安全性要求较高，或者有较多用户输入内容的网站，我们就要对关键的接口做额外的防护措施。

### 浏览器同源策略（SOP）

**[[跨域#同源策略（SOP，Same-origin policy）|同源策略]] 限制了不同源之间如何进行资源交互，是用于隔离潜在恶意文件的重要安全机制。 是否同源由 URL 决定，URL 由协议、域名、端口和路径组成，如果两个 URL 的协议、域名和端口相同，则表示他们同源。**

浏览器出于安全原因，需要判断一个请求是否 [[跨域#^e8b9dc|跨源]]，这是浏览器的 **强制行为**。现代浏览器为了保障用户的安全，必须检查跨源请求是否安全。

![[15640407221503.png]]

#### 浏览器判断哪些请求会跨源？

浏览器加载了页面，也就是地址栏中 URL 所指向的 HTML 文档，这是该页面的第一个请求。请注意此时 **页面的源**。

所有剩下的请求，包括 `<script>`、`<style>` 标签加载脚本和样式，`<image>` 标签加载图片等外部资源，以及 POST 表单发送的请求，JS 脚本发送的请求等：只要请求的 URL，和页面 URL (地址栏中的 URL) 不满足同源关系，就是跨源请求。

另外要注意的是，跨源引入的 JS 脚本，该脚本向 **页面的源** 发送的请求，不算跨源；同源引入的 JS 脚本，也可以发送跨源请求。源是 (协议 域名 端口) 三元组，跟该请求来自哪个脚本无关。所以判断跨源，应该只比较请求的 URL 和页面的源。

#### 跨源请求会被阻止？

从上面的解释中可以知道，**跨源是件很普遍的事情。** 无论是加载外部资源，还是表单发送的 POST 请求，都不受任何限制。浏览器认为跨源加载资源和表单 POST 请求是合理的，因为离开它们就不会有多姿多彩的互联网，所以不会干涉它们。

浏览器 **只限制 JS 的跨源请求**，这被称为 **同源策略**，意即限制 JS 请求在同一个源下。浏览器认为 JS 发送的请求不安全，所以检查 JS 请求的跨源是否合法。而且，浏览器的同源策略 **不限制写操作和资源嵌入**，而是 **限制读操作**。请求能正常发送，但是对响应的读取被拦截。（[[跨域#简单请求|简单请求]] 与 [[跨域#非简单请求|非简单请求]]）

而且，JS 脚本中发送的请求，而不是为了载入 JS 脚本这个资源所发送的请求，因为上面说过加载外部资源是不受限制的，所以不要混淆了。

至于同源策略只限制 JS？当然不完全是，比如 `@font-face` 引入跨源字体，也要受同源策略影响。允许跨源字体和允许 JS 跨源请求的处理方式是一样的。另外，考虑一下 `crossorigin` 属性。

我们该关心的是，CSRF 正是处于跨源的情况下进行攻击的。因为有网络攻击的存在，浏览器才会作出如此多的限制，而不是故意为了恶心开发者。当然浏览器作出的努力远远不够，依旧难以防范 CSRF。

#### 浏览器怎么阻止跨源？

浏览器负责拦截响应，服务器决定阻止策略。所以，想要让浏览器支持 JS 请求跨源，必须得到服务器的支持。

需要特别注意的是，浏览器只是拦截了响应，跨源请求依旧发送出去了。服务器端可能受理了它。

更进一步说，跨源请求到达服务器，如果服务器选择拦截跨源请求，那么服务器会返回错误；如果服务器没有拦截跨源请求，而是选择接受请求并响应它，接下来 [[跨域#CORS|CORS]] 设置会随同响应返回给浏览器，浏览器会遵守服务器方的 CORS 设置，对跨源请求的响应选择接受或者抛弃。

多出来的 CORS 设置，是服务器方告知浏览器，如何处理跨源请求的设置。如果服务器没有 CORS 设置，浏览器采取默认行为，在跨源请求发送并得到响应后，抛弃响应。额外提醒：不要把 [[跨域#CORS|CORS]] 设置和 [[前端安全：XSS#Content Security Policy|CSP]] 设置搞混淆哦！

但是，所说的这个流程 **只涉及了 [[跨域#简单请求|简单请求]]**。对于 [[跨域#非简单请求|非简单请求]]，浏览器在发送跨源请求前，需要先通过一个额外的请求，提前得到服务器的 CORS 设置。此时，CORS 设置可以从一开始就阻止浏览器发送跨源请求的行为。如果服务器返回错误的 CORS 设置或者根本就没有 CORS 设置，那么，浏览器也不会发送跨源请求。

### CSRF Token

前面讲到 CSRF 的另一个特征是，攻击者无法直接窃取到用户的信息（Cookie，Header，网站内容等），CSRF 唯一能利用的只是用户的 cookie 而已。CSRF 攻击者并不需要得到用户更多的身份信息，甚至都不知道 cookie 中的内容是什么，就可以进行 CSRF 攻击了。

而 CSRF 攻击之所以能够成功，是因为服务器误把攻击者发送的请求当成了用户自己的请求。那么我们可以要求所有的用户请求都携带一个 CSRF 攻击者无法获取到的 Token。服务器通过校验请求是否携带正确的 Token，来把正常的请求和攻击的请求区分开，也可以防范 CSRF 的攻击。

#### 原理

CSRF Token 的防护策略分为三个步骤：

1.将 CSRF Token 输出到页面中

首先，用户打开页面的时候，服务器需要给这个用户生成一个 Token，该 Token 通过加密算法对数据进行加密，一般 Token 都包括随机字符串和时间戳的组合，显然在提交时 Token 不能再放在 Cookie 中了，否则又会被攻击者冒用。因此，为了安全起见 Token 最好还是存在服务器的 Session 中，之后在每次页面加载时，使用 JS 遍历整个 DOM 树，对于 DOM 中所有的 a 和 form 标签后加入 Token。这样可以解决大部分的请求，但是对于在页面加载之后动态生成的 HTML 代码，这种方法就没有作用，还需要程序员在编码时手动添加 Token。

2.页面提交的请求携带这个 Token

对于 GET 请求，Token 将附在请求地址之后，这样 URL 就变成 `http://url?csrftoken=tokenvalue`。 而对于 POST 请求来说，要在 form 的最后加上：

```html
 <input type="hidden" name="csrftoken" value="tokenvalue"/>
```

这样，就把 Token 以参数的形式加入请求了。

3.服务器验证 Token 是否正确

当用户从客户端得到了 Token，再次提交给服务器的时候，服务器需要判断 Token 的有效性，验证过程是先解密 Token，对比加密字符串以及时间戳，如果加密字符串一致且时间未过期，那么这个 Token 就是有效的。

这种方法要比之前检查 Referer 或者 Origin 要安全一些，Token 可以在产生并放于 Session 之中，然后在每次请求时把 Token 从 Session 中拿出，与请求中的 Token 进行比对，但这种方法的比较麻烦的在于如何把 Token 以参数的形式加入请求。

下面将以 Java 为例，介绍一些 CSRF Token 的服务端校验逻辑，代码如下：

```java
HttpServletRequest req = (HttpServletRequest)request;
HttpSession s = req.getSession();

// 从 session 中得到 csrftoken 属性
String sToken = (String)s.getAttribute(“csrftoken”);
if(sToken == null){
   // 产生新的 token 放入 session 中
   sToken = generateToken();
   s.setAttribute(“csrftoken”,sToken);
   chain.doFilter(request, response);
} else {
   // 从 HTTP 头中取得 csrftoken
   String xhrToken = req.getHeader(“csrftoken”);
   // 从请求参数中取得 csrftoken
   String pToken = req.getParameter(“csrftoken”);
   if(sToken != null && xhrToken != null && sToken.equals(xhrToken)){
       chain.doFilter(request, response);
   }else if(sToken != null && pToken != null && sToken.equals(pToken)){
       chain.doFilter(request, response);
   }else{
       request.getRequestDispatcher(“error.jsp”).forward(request,response);
   }
}
```

这个 Token 的值必须是随机生成的，这样它就不会被攻击者猜到，考虑利用 Java 应用程序的 java.security.SecureRandom 类来生成足够长的随机标记，替代生成算法包括使用 256 位 BASE64 编码哈希，选择这种生成算法的开发人员必须确保在散列数据中使用随机性和唯一性来生成随机标识。通常，开发人员只需为当前会话生成一次 Token。在初始生成此 Token 之后，该值将存储在会话中，并用于每个后续请求，直到会话过期。当最终用户发出请求时，服务器端必须验证请求中 Token 的存在性和有效性，与会话中找到的 Token 相比较。如果在请求中找不到 Token，或者提供的值与会话中的值不匹配，则应中止请求，应重置 Token 并将事件记录为正在进行的潜在 CSRF 攻击。

#### OAuth 中的 state 参数

在理解了 CSRF 和 CSRF token 后，甚至可以用相同的思路理解 [[鉴权方案#6. OAuth 2.0|OAuth]] 中的 [[鉴权方案#^72b420|state]] 参数。

state 参数是为了安全而设计的。为了理解 state 参数的作用，我们先简化 OAuth 登录的思路。

##### 简化理解 OAuth 登录流程

网上很多介绍 OAuth 的文章，会告诫我们一句话：OAuth 的作用是 **授权，不是认证**。什么意思呢？如果一个网站 A 支持 OAuth 登录账号，又意味着什么呢？

其实所谓的 OAuth 登录，是网站开发者们在把 OAuth 的 **授权当作认证使用** 了，偏离了 OAuth 的本意 (但不算错)。

有个网站 A，支持从 OAuth 服务器登录账号。网站 A 认为：

1. 所有 OAuth 服务器上的账号，都被网站 A 认为是自己的用户。(**这点很重要**，容易被忽视)
2. OAuth 服务器认证用户身份 (用户输入用户名和密码)。然后询问是否授权网站 A。得到了用户的同意。
3. 网站 A 被用户授权后，也就让网站 A 验证了用户身份 (因为用户在 OAuth 服务器上被成功认证了。不然无法授权)

第 2 点的认证用户，归根结底是为了授权。授权才是 OAuth 的目的。

当然，第 2 点是可以在 OAuth 登录流程前发生的。如果你提前登录 GitHub 账号，已经持有 GitHub 的身份凭证 (cookie)，那么在 OAuth 登录流程中就免去输入用户名和密码，直接通过 OAuth 服务器的认证。

一句话：如果你 (OAuth 账号持有者) 能授予本站权限，就能验证你是 OAuth 账号持有者，也就验证了你是本站用户的身份。

上面介绍的 OAuth 登录流程，还没有涉及 state 参数呢。别急，我们再来看第 3 点中授权这一步。用户要怎么通过 OAuth 服务器要授权网站 A 呢？当用户在 OAuth 服务器上通过认证后，OAuth 服务器是浏览器中的第一方。OAuth 服务器会使用 callback 回调地址，并且携带授权码，让用户的浏览器跳转回网站 A。用户的浏览器访问回调地址，是访问网站 A (第一方)，同时通过 URL 参数把授权码告诉了网站 A。这一步需要用户的浏览器参与，浏览器是 OAuth 服务器和网站 A 的桥梁，亲自把授权码告知网站 A。由于有回调跳转，此时地址栏中显示的就是网站 A 的地址。这是一个 GET 请求。至于 OAuth 服务器，才不会亲自告诉网站 A 授权码呢。

网站 A 的后端拿到了授权码，就可以自己向 OAuth 服务器申请 Access Token，被 OAuth 服务器授权。网站 A 再给用户颁发一个网站 A 的身份凭证。之后用户就有网站 A 的用户身份。

咦？怎么还是没看到 state 参数？没有看错。state 参数是为了提升安全而设计的。如果没有攻击者，state 参数就派不上用处了。但是现实很残酷，互联网上到处都是攻击者。现在，攻击者将要对 OAuth 登录发动 CSRF 攻击了。先让我们看看 CSRF 攻击者要从 OAuth 登录流程哪个环节下手。

##### 对 OAuth 的 CSRF 攻击：第一种

整个 OAuth 登录流程中，最不安全的就是那个 GET 请求了。哪个？用户的浏览器，向网站 A 发送授权码的那一步。这一步甚至直接把授权码暴露在地址栏中，虽然这个跳转时间很短，但是依旧有风险，所以授权码的有效时间也设计得很短。不过这一点和 CSRF 无关。本文不关心攻击者如何窃取用户的授权码，因为本文讲的是 CSRF。本文关心的是 CSRF 攻击者让用户使用攻击者的授权码！什么？用户使用攻击者的授权码？这又有什么用呢？也许我们可以构思第一种情况 (之后再讲第二种)：用户使用攻击者的授权码，登录了攻击者的账号，却误以为登录了自己的账号。然后上传了一张私密照片……嗯。

CSRF 是怎么做到的呢？因为这一步是 GET 请求，所以极易在网页中悄悄发送。说到[[跨域]]的时候，已经讲过， 浏览器是[[跨域#^2e704b|不检查]] `<image>` 等标签的跨源 GET 请求的。所以攻击者在恶意网站 B 上，放入这个 GET 请求， URL 参数包含了攻击者的授权码。然后诱导用户访问恶意网站 B。此时恶意网站 B 以第一方的身份， 向网站 A 发送 GET 请求，让用户浏览器登录了攻击者在网站 A 上的账号。这就是 CSRF 呀。 之后某天用户打开网站 A，却已经登录了，账号是攻击者的账号。

所以 OAuth 登录的错误到底在哪里呢？因为这个 GET 请求，就不是一个幂等请求。这个 GET 请求， 实现了账户登录。非幂等的 GET 请求是极易遭受攻击的。但是 OAuth 也很为难，因为回调跳转就 是要用 GET 请求打开 URL 的。所以，加入了一个 state 参数防止 CSRF。没错，此时 state 参数的 作用相当于 CSRF token。

> 幂等请求：**在程序中如果相同条件下多次请求对资源的影响表现一致则称请求为幂等请求**，对应的接口为幂等接口

##### state 参数的实现

就如同 CSRF token 的实现一样，后端必须先赋予未登录用户一个 session，该 session 是和随机生成的 state 参数关联的。只要请求持有的 session 和 state 满足关联，就认定是合法用户身份；否则当作 CSRF 攻击处理。

##### 对 OAuth 的 CSRF 攻击：第二种

这种攻击方式，比上一种更加隐蔽，而且危险性越高，因为攻击者甚至可以窃取用户账号！

用户已经在网站 A 上持有一个账号了。现在考虑绑定另一个 OAuth 账号。服务器后端是怎么实现绑定账号的呢？那就是调起另一个 OAuth 服务器的登录。如果网站 A 能被授权，说明用户账号和该 OAuth 服务器存在关联，也就是同一个人。所以服务器认定，该账户今后可以从此 OAuth 账号登录了。

问题出在哪呢？就是这个另外的 OAuth 登录流程，其中的 GET 请求依旧可以被 CSRF 利用。这个 GET 请求也不是幂等的，因为它不仅实现了 OAuth 登录，而且还实现了绑定账号的操作！仿造上一种攻击方式，攻击者又悄悄地让受害用户登录了自己的账号，此时，还将攻击者账号和受害者账号绑定在一起了。至此，攻击者就可以登录受害者的账号了。

知乎上的 [ThoughtWorks 中国](https://www.zhihu.com/question/19781476/answer/200400369) 有个详尽的回答，就是关于这种攻击方式的。

##### 深究 OAuth 流程设计

我知道还有很多人还一直在纠结为什么 OAuth 流程要这些步骤，觉得 OAuth 流程设计多此一举。因为我们已经从上文里获取到足够的基础知识了，所以我认为展开理解这部分内容也不难。我们从三个问题分析。

> OAuth 服务器不返回授权码，直接返回 Access Token 给浏览器，行不行？

不行。我知道有些人提这个问题，是认为浏览器获得 Access Token 再发送给网站 A，也能实现整个流程。前面已经解释过，OAuth 的真正作用是授权，不是认证。如果直接返回 Access Token，相当于让用户的浏览器也有可能持有权限。OAuth 严格限制授权给谁，这是它的本职工作。所以，不能泄漏 Access Token 给除网站 A 之外的任何组织。还有，Access Token 有效时间更长，这也就意味着使用有效时间更短的授权码更加安全。而且用户自己持有 Access Token，风险更高。

> OAuth 服务器自己直接发送 Access Token 给网站 A，行不行？

不行。我知道有些人提这个问题，是认为浏览器没必要参与发送授权码，直接让 OAuth 服务器和网站 A 通信不就行了？但请注意，网站 A 和浏览器可以处在某个集团的内网中，网站 A 不暴露任何回调地址给外部网络。所以，一个处于外网环境中的 OAuth 服务器，无法直接传递 Access Token 给内网环境中的网站 A。而是通过跳转告诉用户浏览器授权码；因为用户浏览器和网站 A 同处一个网络，所以用户浏览器能告诉网站 A 授权码。这样就实现了：内网环境中的网站 A 支持外网环境的 OAuth 登录。

既然我们已经认识到，Access Token 不可外泄的重要性。那么再看下一个问题。

> 用户可以自己拿授权码，换取 Access Token 吗？

做不到。用户和攻击者都做不到。上面已经说到，Access Token 只能给被授权的组织使用。所以 OAuth 流程设计者规定，使用授权码需要同时传递 client secret，这个 secret 是网站 A 在 OAuth 服务器上提前设置好的。除了网站 A，没有其他组织和个体持有 client secret，所以它们无法使用授权码换取 Access Token。这样一来，就限制了只能授权给网站 A。这也就顺便解释了为什么网站 A 在配置 OAuth 服务的时候，需要创建 client secret。

### 分布式校验

在大型网站中，使用 Session 存储 CSRF Token 会带来很大的压力。访问单台服务器 session 是同一个。但是现在的大型网站中，我们的服务器通常不止一台，可能是几十台甚至几百台之多，甚至多个机房都可能在不同的省份，用户发起的 HTTP 请求通常要经过像 Ngnix 之类的负载均衡器之后，再路由到具体的服务器上，由于 Session 默认存储在单机服务器内存中，因此在分布式环境下同一个用户发送的多次 HTTP 请求可能会先后落到不同的服务器上，导致后面发起的 HTTP 请求无法拿到之前的 HTTP 请求存储在服务器中的 Session 数据，从而使得 Session 机制在分布式环境下失效，因此在分布式集群中 CSRF Token 需要存储在 Redis 之类的公共存储空间。

由于使用 Session 存储，读取和验证 CSRF Token 会引起比较大的复杂度和性能问题，目前很多网站采用 Encrypted Token Pattern 方式。这种方法的 Token 是一个计算出来的结果，而非随机生成的字符串。这样在校验时无需再去读取存储的 Token，只用再次计算一次即可。

这种 Token 的值通常是使用 UserID、时间戳和随机数，通过加密的方法生成。这样既可以保证分布式服务的 Token 一致，又能保证 Token 不容易被破解。

在 token 解密成功之后，服务器可以访问解析值，Token 中包含的 UserID 和时间戳将会被拿来被验证有效性，将 UserID 与当前登录的 UserID 进行比较，并将时间戳与当前时间进行比较。

#### 总结

Token 是一个比较有效的 CSRF 防护方法，只要页面没有 XSS 漏洞泄露 Token，那么接口的 CSRF 攻击就无法成功。

但是此方法的实现比较复杂，需要给每一个页面都写入 Token（前端无法使用纯静态页面），每一个 Form 及 Ajax 请求都携带这个 Token，后端对每一个接口都进行校验，并保证页面 Token 及请求 Token 一致。这就使得这个防护策略不能在通用的拦截上统一拦截处理，而需要每一个页面和接口都添加对应的输出和校验。这种方法工作量巨大，且有可能遗漏。

> 验证码和密码其实也可以起到 CSRF Token 的作用哦，而且更安全。
>
> 为什么很多银行等网站会要求已经登录的用户在转账时再次输入密码，现在是不是有一定道理了？

### 双重 Cookie 验证

在会话中存储 CSRF Token 比较繁琐，而且不能在通用的拦截上统一处理所有的接口。

那么另一种防御措施是使用双重提交 Cookie。利用 CSRF 攻击不能获取到用户 Cookie 的特点，我们可以要求 Ajax 和表单请求携带一个 Cookie 中的值。

双重 Cookie 采用以下流程：

- 在用户访问网站页面时，向请求域名注入一个 Cookie，内容为随机字符串（例如 `csrfcookie=v8g9e4ksfhw`）。
- 在前端向后端发起请求时，取出 Cookie，并添加到 URL 的参数中（接上例 `POST https://www.a.com/comment?csrfcookie=v8g9e4ksfhw`）。
- 后端接口验证 Cookie 中的字段与 URL 参数中的字段是否一致，不一致则拒绝。

此方法相对于 CSRF Token 就简单了许多。可以直接通过前后端拦截的的方法自动化实现。后端校验也更加方便，只需进行请求中字段的对比，而不需要再进行查询和存储 Token。

当然，此方法并没有大规模应用，其在大型网站上的安全性还是没有 CSRF Token 高，原因我们举例进行说明。

由于任何跨域都会导致前端无法获取 Cookie 中的字段（包括子域名之间），于是发生了如下情况：

- 如果用户访问的网站为 `www.a.com`，而后端的 api 域名为 `api.a.com`。那么在 `www.a.com` 下，前端拿不到 `api.a.com` 的 Cookie，也就无法完成双重 Cookie 认证。
- 于是这个认证 Cookie 必须被种在 `a.com` 下，这样每个子域都可以访问。
- 任何一个子域都可以修改 `a.com` 下的 Cookie。
- 某个子域名存在漏洞被 XSS 攻击（例如 `upload.a.com`）。虽然这个子域下并没有什么值得窃取的信息。但攻击者修改了 `a.com` 下的 Cookie。
- 攻击者可以直接使用自己配置的 Cookie，对 XSS 中招的用户再向 `www.a.com` 下，发起 CSRF 攻击。

#### 总结

用双重 Cookie 防御 CSRF 的优点：

- 无需使用 Session，适用面更广，易于实施。
- Token 储存于客户端中，不会给服务器带来压力。
- 相对于 Token，实施成本更低，可以在前后端统一拦截校验，而不需要一个个接口和页面添加。

缺点：

- Cookie 中增加了额外的字段。
- 如果有其他漏洞（例如 XSS），攻击者可以注入 Cookie，那么该防御方式失效。
- 难以做到子域名的隔离。
- 为了确保 Cookie 传输安全，采用这种防御方式的最好确保用整站 HTTPS 的方式，如果还没切 HTTPS 的使用这种方式也会有风险。

### Samesite Cookie 属性

防止 CSRF 攻击的办法已经有上面的预防措施。为了从源头上解决这个问题，Google 起草了一份草案来改进 HTTP 协议，那就是为 Set-Cookie 响应头新增 [[Cookie#SameSite|Samesite]] 属性，它用来标明这个 Cookie 是个“同站 Cookie"，同站 Cookie 只能作为第一方 Cookie，不能作为第三方 Cookie，Samesite 有两个属性值，分别是 Strict 和 Lax，下面分别讲解：

#### Samesite=Strict

这种称为严格模式，表明这个 Cookie 在任何情况下都不可能作为第三方 Cookie，绝无例外。比如说 b.com 设置了如下 Cookie：

```
Set-Cookie: foo=1; Samesite=Strict
Set-Cookie: bar=2; Samesite=Lax
Set-Cookie: baz=3
```

我们在 a.com 下发起对 b.com 的任意请求，foo 这个 Cookie 都不会被包含在 Cookie 请求头中，但 bar 会。举个实际的例子就是，假如淘宝网站用来识别用户登录与否的 Cookie 被设置成了 Samesite=Strict，那么用户从百度搜索页面甚至天猫页面的链接点击进入淘宝后，淘宝都不会是登录状态，因为淘宝的服务器不会接受到那个 Cookie，其它网站发起的对淘宝的任意请求都不会带上那个 Cookie。

#### Samesite=Lax

这种称为宽松模式，比 Strict 放宽了点限制：假如这个请求是这种请求（改变了当前页面或者打开了新页面）且同时是个 GET 请求，则这个 Cookie 可以作为第三方 Cookie。比如说 b.com 设置了如下 Cookie：

```
Set-Cookie: foo=1; Samesite=Strict
Set-Cookie: bar=2; Samesite=Lax
Set-Cookie: baz=3
```

当用户从 a.com 点击链接进入 b.com 时，foo 这个 Cookie 不会被包含在 Cookie 请求头中，但 bar 和 baz 会，也就是说用户在不同网站之间通过链接跳转是不受影响了。但假如这个请求是从 a.com 发起的对 b.com 的异步请求，或者页面跳转是通过表单的 post 提交触发的，则 bar 也不会发送。

生成 Token 放到 Cookie 中并且设置 Cookie 的 Samesite，Java 代码如下：

```java
 private void addTokenCookieAndHeader(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        //生成token
        String sToken = this.generateToken();
        //手动添加Cookie实现支持“Samesite=strict”
        //Cookie添加双重验证
        String CookieSpec = String.format("%s=%s; Path=%s; HttpOnly; Samesite=Strict", this.determineCookieName(httpRequest), sToken, httpRequest.getRequestURI());
        httpResponse.addHeader("Set-Cookie", CookieSpec);
        httpResponse.setHeader(CSRF_TOKEN_NAME, token);
    }
```

#### 我们应该如何使用 SamesiteCookie

如果 SamesiteCookie 被设置为 Strict，浏览器在任何跨域请求中都不会携带 Cookie，新标签重新打开也不携带，所以说 CSRF 攻击基本没有机会。

但是跳转子域名或者是新标签重新打开刚登陆的网站，之前的 Cookie 都不会存在。尤其是有登录的网站，那么我们新打开一个标签进入，或者跳转到子域名的网站，都需要重新登录。对于用户来讲，可能体验不会很好。

如果 SamesiteCookie 被设置为 Lax，那么其他网站通过页面跳转过来的时候可以使用 Cookie，可以保障外域连接打开页面时用户的登录状态。但相应的，其安全性也比较低。

另外一个问题是 Samesite 的兼容性不是很好，现阶段除了从新版 Chrome 和 Firefox 支持以外，Safari 以及 iOS Safari 都还不支持，现阶段看来暂时还不能普及。

而且，SamesiteCookie 目前有一个致命的缺陷：不支持子域。例如，种在 topic.a.com 下的 Cookie，并不能使用 a.com 下种植的 SamesiteCookie。这就导致了当我们网站有多个子域名时，不能使用 SamesiteCookie 在主域名存储用户登录信息。每个子域名都需要用户重新登录一次。

总之，SamesiteCookie 是一个可能替代同源验证的方案，但目前还并不成熟，其应用场景有待观望。

## 防止网站被利用

前面所说的，都是被攻击的网站如何做好防护。而非防止攻击的发生，CSRF 的攻击可以来自：

- 攻击者自己的网站。
- 有文件上传漏洞的网站。
- 第三方论坛等用户内容。
- 被攻击网站自己的评论功能等。

对于来自黑客自己的网站，我们无法防护。但对其他情况，那么如何防止自己的网站被利用成为攻击的源头呢？

- 严格管理所有的上传接口，防止任何预期之外的上传内容（例如 HTML）。
- 添加 Header `X-Content-Type-Options: nosniff` 防止黑客上传 HTML 内容的资源（例如图片）被解析为网页。
- 对于用户上传的图片，进行转存或者校验。不要直接使用用户填写的图片链接。
- 当前用户打开其他用户填写的链接时，需告知风险（这也是很多论坛不允许直接在内容中发布外域链接的原因之一，不仅仅是为了用户留存，也有安全考虑）。

## CSRF 其他防范措施

对于一线的程序员同学，我们可以通过各种防护策略来防御 CSRF，对于 QA、SRE、安全负责人等同学，我们可以做哪些事情来提升安全性呢？

### CSRF 测试

CSRFTester 是一款 CSRF 漏洞的测试工具，CSRFTester 工具的测试原理大概是这样的，使用代理抓取我们在浏览器中访问过的所有的连接以及所有的表单等信息，通过在 CSRFTester 中修改相应的表单等信息，重新提交，相当于一次伪造客户端请求，如果修改后的测试请求成功被网站服务器接受，则说明存在 CSRF 漏洞，当然此款工具也可以被用来进行 CSRF 攻击。

CSRFTester 使用方法大致分下面几个步骤：

- 步骤 1：设置浏览器代理

CSRFTester 默认使用 Localhost 上的端口 8008 作为其代理，如果代理配置成功，CSRFTester 将为您的浏览器生成的所有后续 HTTP 请求生成调试消息。

- 步骤 2：使用合法账户访问网站开始测试

我们需要找到一个我们想要为 CSRF 测试的特定业务 Web 页面。找到此页面后，选择 CSRFTester 中的“开始录制 " 按钮并执行业务功能；完成后，点击 CSRFTester 中的“停止录制 " 按钮；正常情况下，该软件会全部遍历一遍当前页面的所有请求。

- 步骤 3：通过 CSRF 修改并伪造请求

之后，我们会发现软件上有一系列跑出来的记录请求，这些都是我们的浏览器在执行业务功能时生成的所有 GET 或者 POST 请求。通过选择列表中的某一行，我们现在可以修改用于执行业务功能的参数，可以通过点击对应的请求修改 query 和 form 的参数。当修改完所有我们希望诱导用户 form 最终的提交值，可以选择开始生成 HTML 报告。

- 步骤 4：拿到结果如有漏洞进行修复

首先必须选择“报告类型 "。报告类型决定了我们希望受害者浏览器如何提交先前记录的请求。目前有 5 种可能的报告：表单、iFrame、IMG、XHR 和链接。一旦选择了报告类型，我们可以选择在浏览器中启动新生成的报告，最后根据报告的情况进行对应的排查和修复。

### CSRF 监控

对于一个比较复杂的网站系统，某些项目、页面、接口漏掉了 CSRF 防护措施是很可能的。

一旦发生了 CSRF 攻击，我们如何及时的发现这些攻击呢？

CSRF 攻击有着比较明显的特征：

- 跨域请求。
- GET 类型请求 Header 的 MIME 类型大概率为图片，而实际返回 Header 的 MIME 类型为 Text、JSON、HTML。

我们可以在网站的代理层监控所有的接口请求，如果请求符合上面的特征，就可以认为请求有 CSRF 攻击嫌疑。我们可以提醒对应的页面和项目负责人，检查或者 Review 其 CSRF 防护策略。

## 个人用户 CSRF 安全的建议

经常上网的个人用户，可以采用以下方法来保护自己：

- 使用网页版邮件的浏览邮件或者新闻也会带来额外的风险，因为查看邮件或者新闻消息有可能导致恶意代码的攻击。
- 尽量不要打开可疑的链接，一定要打开时，使用不常用的浏览器。

## 总结

简单总结一下上文的防护策略：

- CSRF 自动防御策略：同源检测（Origin 和 Referer 验证）。
- CSRF 主动防御措施：Token 验证 或者 双重 Cookie 验证 以及配合 Samesite Cookie。
- 保证页面的幂等性，后端接口不要在 GET 页面中做用户操作。

为了更好的防御 CSRF，最佳实践应该是结合上面总结的防御措施方式中的优缺点来综合考虑，结合当前 Web 应用程序自身的情况做合适的选择，才能更好的预防 CSRF 的发生。

## 历史案例

### WordPress 的 CSRF 漏洞

2012 年 3 月份，WordPress 发现了一个 CSRF 漏洞，影响了 WordPress 3.3.1 版本，WordPress 是众所周知的博客平台，该漏洞可以允许攻击者修改某个 Post 的标题，添加管理权限用户以及操作用户账户，包括但不限于删除评论、修改头像等等。具体的列表如下:

- Add Admin/User
- Delete Admin/User
- Approve comment
- Unapprove comment
- Delete comment
- Change background image
- Insert custom header image
- Change site title
- Change administrator's email
- Change Wordpress Address
- Change Site Address

那么这个漏洞实际上就是攻击者引导用户先进入目标的 WordPress，然后点击其钓鱼站点上的某个按钮，该按钮实际上是表单提交按钮，其会触发表单的提交工作，添加某个具有管理员权限的用户，实现的码如下：

```html
<html>
<body onload="javascript:document.forms[0].submit()">
<H2>CSRF Exploit to add Administrator</H2>
<form method="POST" name="form0" action="http://<wordpress_ip>:80/wp-admin/user-new.php">
<input type="hidden" name="action" value="createuser"/>
<input type="hidden" name="_wpnonce_create-user" value="<sniffed_value>"/>
<input type="hidden" name="_wp_http_referer" value="%2Fwordpress%2Fwp-admin%2Fuser-new.php"/>
<input type="hidden" name="user_login" value="admin2"/>
<input type="hidden" name="email" value="admin2@admin.com"/>
<input type="hidden" name="first_name" value="admin2@admin.com"/>
<input type="hidden" name="last_name" value=""/>
<input type="hidden" name="url" value=""/>
<input type="hidden" name="pass1" value="password"/>
<input type="hidden" name="pass2" value="password"/>
<input type="hidden" name="role" value="administrator"/>
<input type="hidden" name="createuser" value="Add+New+User+"/>
</form>
</body>
</html>
```

### YouTube 的 CSRF 漏洞

2008 年，有安全研究人员发现，YouTube 上几乎所有用户可以操作的动作都存在 CSRF 漏洞。如果攻击者已经将视频添加到用户的“Favorites"，那么他就能将他自己添加到用户的“Friend" 或者“Family" 列表，以用户的身份发送任意的消息，将视频标记为不宜的，自动通过用户的联系人来共享一个视频。例如，要把视频添加到用户的“Favorites"，攻击者只需在任何站点上嵌入如下所示的 IMG 标签：

```html
<img src="http://youtube.com/watch_ajax?action_add_favorite_playlist=1&video_
id=[VIDEO ID]&playlist_id=&add_to_favorite=1&show=1&button=AddvideoasFavorite"/>
```

攻击者也许已经利用了该漏洞来提高视频的流行度。例如，将一个视频添加到足够多用户的“Favorites"，YouTube 就会把该视频作为“Top Favorites" 来显示。除提高一个视频的流行度之外，攻击者还可以导致用户在毫不知情的情况下将一个视频标记为“不宜的 "，从而导致 YouTube 删除该视频。

这些攻击还可能已被用于侵犯用户隐私。YouTube 允许用户只让朋友或亲属观看某些视频。这些攻击会导致攻击者将其添加为一个用户的“Friend" 或“Family" 列表，这样他们就能够访问所有原本只限于好友和亲属表中的用户观看的私人的视频。

攻击者还可以通过用户的所有联系人名单（“Friends"、“Family" 等等）来共享一个视频，“共享 " 就意味着发送一个视频的链接给他们，当然还可以选择附加消息。这条消息中的链接已经并不是真正意义上的视频链接，而是一个具有攻击性的网站链接，用户很有可能会点击这个链接，这便使得该种攻击能够进行病毒式的传播。

# 参考文献

- Mozilla wiki.[Security-Origin](https://wiki.mozilla.org/Security/Origin)
- Gmail Security Hijack Case.[Google-Gmail-Security-Hijack](https://www.davidairey.com/google-gmail-security-hijack/)
- Netsparker Blog.[Same-Site-Cookie-Attribute-Prevent-Cross-site-Request-Forgery](https://www.invicti.com/blog/web-security/same-site-cookie-attribute-prevent-cross-site-request-forgery/)
- MDN.[Same-origin\_policy#IE\_Exceptions](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy#IE_Exceptions)
- [JSONP劫持CORS跨源资源共享漏洞](https://www.freebuf.com/articles/web/207802.html)
- [浅谈跨域威胁与安全](https://www.freebuf.com/articles/web/208672.html)
- [从跨域与同源策略谈CSRF防御与绕过](https://www.cnblogs.com/lcxblogs/p/14453996.html)
- [CORS介绍及其漏洞检测](https://zhuanlan.zhihu.com/p/83099266)
