---
aliases: []
tags: ['Network','date/2022-03','year/2022','month/03']
date: 2022-11-09-星期三 10:52:57
update: 2022-12-03-星期六 13:54:23
---

## Cookie 简介

HTTP 协议是无状态的，这意味着在同一个 TCP 连接中，先后发起的请求之间没有任何关系。这给服务端带来了挑战：用户在同一个网站中进行连续的操作，服务端无法知道这些操作来自哪里。

使用 HTTP Cookie 可以解决这个问题。当服务端将 HTTP 响应返回给客户端时，通过在响应头里面添加一个`Set-Cookie`信息，浏览器收到带`Set-Cookie`信息的响应后会将 Cookie 保存，在后面发送给该服务端的每个请求中，都会自动带上 Cookie 信息。服务端根据 Cookie 信息，就能取得客户端的数据信息。

由于 Cookie 信息是被浏览器识别并自动保存和发送的，因此在默认情况下，浏览器关闭之后它就会被自动删除。但我们也可以通过指定过期时间（Expires）或者有效期（Max-Age），来让 Cookie 获得更久的有效期。

需要注意的是，某个网站在设置了 Cookie 之后，所有符合条件（有效期、域名、路径、适用站点等）的请求都会被自动带上 Cookie。这带来了一个 Web 安全隐患：服务端只知道请求来自某个用户的浏览器，却不知道请求本身是否用户自愿发出的。

利用这一漏洞，攻击者可通过一些技术手段（图片地址、超链接等）欺骗用户的浏览器访问曾经认证过的网站，并利用用户的登录态进行一些操作，可能导致用户信息泄露、资产被转移、在不知情的情况下发送信息等，带来了恶劣的后果。这便是我们常说的 Web 安全问题之一：[[前端安全：CSRF|跨站请求伪造（CSRF）]]。

为了应对这种情况，我们可以校验 HTTP 请求头中的Referer字段，这个字段用以标明请求来源于哪个地址。但由于该字段可能会被篡改，因此只能作为辅助校验手段。

防范跨站请求伪造攻击的有效方法，就是避免依赖浏览器自动带上的 Cookie 信息。我们可以使用其他方式校验用户登录态，比如将用户登录态保存在浏览器缓存中，在发送请求的时候添加用于标识用户的参数值，现在大多数应用也是使用 Token 来进行用户标识。

除了 HTTP Cookie 之外，浏览器中 HTTP 缓存机制也同样依赖 HTTP 协议。

## Cookie 产生的背景

我们都知道，`HTTP 协议`是无状态的，服务器无法知道两个请求是否来自同一个浏览器，也不知道用户上一次做了什么，每次请求都是完全相互独立，这严重阻碍了`交互式 Web` 应用程序的实现。例子：

- 购物车：在典型的网上购物场景中，用户浏览了几个页面，买了一盒饼干和两瓶饮料。最后结帐时，由于 `HTTP` 的无状态性，不通过额外的手段，服务器并不知道用户到底买了什么。
- 登录状态：我们常用的“记住密码”功能，在以前如果不是用 `Cookie` 记住了登录凭据，想要实现该功能将会很复杂。

正是为了解决这些交互方面存在的痛点，`Cookie` 应运而生。

## Cookie 概述

> `Cookie`（ 也叫 `Web Cookie` 或`浏览器 Cookie` ）是服务器发送到用户浏览器并保存在本地的一小块数据，它会在浏览器下次向同一服务器再发起请求时被携带并发送到服务器上。

存储 `Cookie` 是浏览器提供的功能。`Cookie` 其实是存储在浏览器中的纯文本，浏览器的安装目录下会专门有一个 `Cookie` 文件夹来存放各个域下设置的 `Cookie`（非内存 `Cookie`）。

>新版chrome cookies会保存在 `%LocalAppData%\Google\Chrome\User Data\Default\Network\Cookies` 文件，是一个 SQLite 数据库文件

![[Pasted image 20221202112620.png]]

通常，它用于告知服务端两个请求是否来自同一浏览器，或者用来保存一些状态信息，`Cookie` 使基于无状态的 `HTTP` 协议记录稳定的状态信息成为了可能。常用的有以下方面：

- 对话（`session`）管理：保存登录、购物车等需要记录的信息。
- 简单的缓存：存储一些简单的业务数据，比如购物车等需要记录的信息。
- 个性化：保存用户的偏好，比如网页的字体大小、背景色等等。
- 追踪：记录和分析用户行为。

> `Cookie` 主要是用来存储状态的。

`Cookie` 曾一度用于客户端数据的存储，因当时并没有其它合适的存储办法而作为唯一的存储手段。现在来说，这样做虽然可行，但是并不推荐，因为 `Cookie` 的设计目标并不是这个，它:

- 容量很小（ 4KB ）
- 缺乏数据操作接口
- 影响性能

客户端储存应该更多的考虑使用 `localStorage` 、`sesseionStorage` 和 `IndexedDB`。

当然，浏览器可以设置不接受 `Cookie`，也可以设置不向服务器发送 `Cookie`。`window.navigator.cookieEnabled`属性返回一个布尔值，表示浏览器是否打开 `Cookie` 功能。

```js
window.navigator.cookieEnabled 
```

> 本文所有的讨论都是在浏览器的 `window.navigator.cookieEnabled` 为 true 的前提下进行的。

## Cookie 的工作流程

![[cookie工作流程.svg]]

## Cookie 的限制

### 格式限制

`Cookie` 只能存储纯文本格式，因为：

- 每条 `Cookie` 的大小有限制
- 为用户信息安全考虑，`Cookie` 中存储的是不可执行语句

### 大小和条数限制

由于 `Cookie` 是保存在客户端上的，所以浏览器加入了一些限制确保 `Cookie` 不会被恶意使用，同时不会占据太多磁盘空间，所以 `Cookie` 的数量和大小是有限的。

不同浏览器对 `Cookie` 数量和大小的限制，是不一样的。一般来说，单个域设置的 `Cookie` 不应超过 50个，每个 Cookie 的大小不能超过 4KB 。超过限制以后，`Cookie` 将被忽略，不会被设置。

> 每个特定域名下的cookie数量有限：
> IE6或IE6-(IE6以下版本)：最多20个cookie
> IE7或IE7+(IE7以上版本)：最多50个cookie
> FF:最多50个cookie
> Opera:最多30个cookie
> Chrome和safari没有硬性限制
>
> 其限制的原因，主要在于阻止 `Cookie` 的滥用，而且 `Cookie` 会被发送到服务器端，如果数量太大的话，会严重影响请求的性能。以上这两个限制条件，就是 `Cookie` 为什么会被浏览器自动删除的原因了。

### 域限制

不可跨域读取，`Cookie` 是被哪个域写入的，就只能被这个域及其子域读取。比如：

由 `test.com` 写入的 `Cookie` 可以被 `test.com` 和 `test.com/child` 读取，而不能被 `example.com` 读取。

### 路径限制

存储 `Cookie` 时会指定路径，该路径的子级可以读取该 `Cookie`，但是它的父级却读取不到——子可以读取父，但父不能拿到子，例如：

由 `test.com/parent/child` 存储下的 `Cookie`，可以被 `test.com/parent/child/child` 读取，但不能被 `test.com/parent` 读取。

> 一般会将 `Cookie` 存在根路径下，可以避免这种情况的发生。

### 时效限制

每个 `Cookie` 都有时效性，默认的有效期是会话级别（ `Seesion Cookie` ）：就是当浏览器关闭，那么 `Cookie` 立即销毁，但是我们也可以在存储的时候手动设置 `Cookie` 的过期时间，具体设置方法会在下文讲到。

## Cookie 的属性

| Name | Value | Domain | Path | Expires/Max-Age | Size | HTTPOnly | Secure | SameSite | SameParty | Partition Key | Priority |
| ---- | ----- | ------ | ---- | --------------- | ---- | -------- | ------ | -------- | --------- | ------------- | -------- |


### Name/Value

设置 `Cookie` 的名称及相对应的值，对于认证 `Cookie`，`Value` 值包括 `Web` 服务器所提供的访问令牌 。

### Domain

指定了可以访问该 `Cookie` 的 Web 站点或域。

`Cookie` 机制并未遵循严格的同源策略，允许一个子域可以设置或获取其父域的 `Cookie`。

当需要实现单点登录方案时，`Cookie` 的上述特性非常有用，然而也增加了 `Cookie` 受攻击的危险，比如攻击者可以借此发动会话定置攻击。因而，浏览器禁止在 `Domain` 属性中设置 .org、.com 等通用顶级域名、以及在国家及地区顶级域下注册的二级域名，以减小攻击发生的范围。

### Path

`Path` 标识指定了主机下的哪些路径可以接受 `Cookie`（该 URL 路径必须存在于请求 URL 中）。以字符 `%x2F ("/")` 作为路径分隔符，子路径也会被匹配。

### Expires/Max-Age

设置 `Cookie` 的生存期。有两种存储类型的 `Cookie` ：会话性与持久性。

`Expires` 属性指定一个具体的到期时间，到了这个指定的时间之后，浏览器就不再保留这个 `Cookie` ,它的值是 UTC 格式，可以使用 `Date.prototype.toUTCString()` 格式进行转换。

`Max-Age` 属性制定了从现在开始 `Cookie` 存在的秒数，比如 60 \* 60 \* 24 \* 365（即一年）。过了这个时间以后，浏览器就不再保留这个 `Cookie`

> 如果没有设置这两个选项，则会使用默认值。 `domain` 的默认值为设置该 `Cookie` 的网页所在的域名， `path` 默认值为设置该 `Cookie` 的网页所在的目录。

- `Expires` 属性缺省时，为会话性 `Cookie(Session Cookie)` ，仅保存在客户端内存中，并在用户关闭浏览器时失效。
- 持久性 `Cookie` 会保存在用户的硬盘中，直至生存期到或用户直接在网页中单击“注销”等按钮结束会话时才会失效。

> 当 `Cookie` 的过期时间被设定时，设定的日期和时间只与客户端相关，而不是服务端。

### Size

Cookie的大小

### HTTPOnly

这个选项用来设置 `Cookie` 是否能通过 `JavaScript` 去访问。默认情况下， `Cookie` 不会带 `HTTPOnly` 选项(即为空)，所以默认情况下，客户端是可以通过 `JavaScript` 代码去访问（包括读取、修改、删除等）这个 `Cookie` 的。当 `Cookie` 带 `HTTPOnly` 选项时，客户端则无法通过js代码去访问（包括读取、修改、删除等）这个 `Cookie` 。

用于防止客户端脚本通过 `document.cookie` 属性访问 `Cookie` ，有助于保护 `Cookie` 不被[[前端安全：XSS|跨站脚本攻击]]窃取或篡改。但是，`HTTPOnly` 的应用仍存在局限性，一些浏览器可以阻止客户端脚本对 `Cookie` 的读操作，但允许写操作；此外大多数浏览器仍允许通过 `XMLHTTP` 对象读取 `HTTP` 响应中的 `Set-Cookie` 头 。

> 在客户端是不能通过 `JAvaScript` 代码去设置一个 `httpOnly` 类型的 `Cookie` 的，这种类型的 `Cookie` 只能通过服务端来设置。

### Secure

指定是否使用 `HTTPS` 安全协议发送 `Cookie` 。

使用 `HTTPS` 安全协议，可以保护 `Cookie` 在浏览器和 `Web` 服务器间的传输过程中不被窃取和篡改。该方法也可用于 `Web` 站点的身份鉴别，即在 `HTTPS` 的连接建立阶段，浏览器会检查 `Web` 网站的 `SSL` 证书的有效性。

默认情况下，cookie不会带Secure选项(即为空)。所以默认情况下，不管是HTTPS协议还是HTTP协议的请求，cookie 都会被发送至服务端。但要注意一点，Secure选项只是限定了在安全情况下才可以传输给服务端，但并不代表你不能看到这个 cookie。

>如果想在客户端即网页中通过 js 去设置Secure类型的 cookie，必须保证网页是https协议的。在http协议的网页中是无法设置secure类型cookie的。

但是基于兼容性的原因（比如有些网站使用自签署的证书）在检测到 `SSL` 证书无效时，浏览器并不会立即终止用户的连接请求，而是显示安全风险信息，用户仍可以选择继续访问该站点。由于许多用户缺乏安全意识，因而仍可能连接到 `Pharming` 攻击所伪造的网站 。

> 如果当前协议是 HTTP，浏览器会自动忽略服务器发来的 Secure。

### SameSite

`Cookie` 允许服务器要求某个 `Cookie` 在跨站请求时不会被发送，（其中 `Site` 由可注册域定义），从而可以阻止[[前端安全：CSRF|跨站请求伪造攻击（`CSRF`）]]。

`SameSite cookies` 是相对较新的一个字段，所有主流浏览器都已经得到支持。下面是例子：

```
Set-Cookie: key=value; SameSite=Strict
```

`SameSite` 可以有下面三种值：

- **`None`** 浏览器会在同站请求、跨站请求下继续发送 `Cookies`，不区分大小写。
- **`Strict`** 浏览器将只在访问相同站点时发送 `Cookie`。（在原有 `Cookies` 的限制条件上的加强）。
- **`Lax`** 与 **`Strict`** 类似，但用户从外部站点导航至URL时（例如通过链接）除外。 在新版本浏览器中，为默认选项，`Same-site cookies` 将会为一些跨站子请求保留，如图片加载或者 `frames` 的调用，但只有当用户从外部站点导航到 `URL` 时才会发送。如 link 链接。

> 以前，如果 `SameSite` 属性没有设置，或者没有得到运行浏览器的支持，那么它的行为等同于 `None`，`Cookies` 会被包含在任何请求中——包括跨站请求。
>
> 大多数主流浏览器正在将 `SameSite` 的默认值迁移至 `Lax`。如果想要指定 `Cookies` 在同站、跨站请求都被发送，现在需要明确指定 `SameSite` 为 `None`。

### SameParty

![[Cookie SameParty]]

### Cookie prefixes

`Cookie` 机制的使得服务器无法确认 `Cookie` 是在安全来源上设置的，甚至无法确定 `Cookie` 最初是在哪里设置的。

子域上的易受攻击的应用程序可以使用 `Domain` 属性设置 `Cookie` ，从而可以访问所有其他子域上的该 `Cookie` 。会话定置攻击中可能会滥用此机制。

但是，作为 `深度防御措施`，可以使用 `Cookie` 前缀来断言有关 `Cookie` 的特定事实。有两个前缀可用：

- **`__Host-`**

    如果 `Cookie` 名称具有此前缀，则仅当它也用 `Secure` 属性标记，是从安全来源发送的，不包括 `Domain` 属性，并将 `Path` 属性设置为 `/` 时，它才在 `Set-Cookie` 标头中接受。这样，这些 `Cookie` 可以被视为 "`domain-locked`”。

- **`__Secure-`**

    如果 `Cookie` 名称具有此前缀，则仅当它也用 `Secure` 属性标记，是从安全来源发送的，它才在 `Set-Cookie` 标头中接受。该前缀限制要弱于 `__Host-` 前缀。

带有这些前缀点 `Cookie`， 如果不符合其限制的会被浏览器拒绝。请注意，这确保了如果子域要创建带有前缀的 `Cookie`，那么它将要么局限于该子域，要么被完全忽略。由于应用服务器仅在确定用户是否已通过身份验证或 CSRF 令牌正确时才检查特定的 `Cookie` 名称，因此，这有效地充当了针对会话劫持的防御措施。

`Cookie` 各个属性的兼容性如下图所示：

![Cookie属性的兼容性](https://segmentfault.com/img/bVbRFC3 "Cookie属性的兼容性")

## 6\. HTTP Cookie 和 document.cookie

### 6.1 HTTP Cookie

服务器如果希望在浏览器保存 `Cookie`，就要在 `HTTP` 回应的头信息里面，放置一个`Set-Cookie`字段。

![HTTP设置Cookie](https://segmentfault.com/img/bVbRFC9 "HTTP设置Cookie")

浏览器收到响应后通常会保存下 `Cookie`，之后对该服务器每一次请求中都通过 `Cookie` 请求头部将 `Cookie` 信息发送给服务器。另外，`Cookie` 的过期时间、域、路径、有效期、适用站点都可以根据需要来指定。

`HTTP` 回应可以包含多个 `Set-Cookie` 字段，即在浏览器生成多个 `Cookie`。下面是一个例子。

```
HTTP/1.0 200 OK
Content-type: text/html
Set-Cookie: yummy_cookie=choco
Set-Cookie: tasty_cookie=strawberry

[page content]
```

除了 `Cookie` 的值，`Set-Cookie`字段还可以附加 `Cookie` 的属性。

```
Set-Cookie: <cookie-name>=<cookie-value>; Expires=<date>
Set-Cookie: <cookie-name>=<cookie-value>; Max-Age=<non-zero-digit>
Set-Cookie: <cookie-name>=<cookie-value>; Domain=<domain-value>
Set-Cookie: <cookie-name>=<cookie-value>; Path=<path-value>
Set-Cookie: <cookie-name>=<cookie-value>; Secure
Set-Cookie: <cookie-name>=<cookie-value>; HttpOnly
```

一个 `Set-Cookie` 字段里面，可以同时包括多个属性，没有次序的要求。

> 如果服务器想改变一个早先设置的 `Cookie`，必须同时满足四个条件：`Cookie` 的 `key`、`domain`、`path` 和 `secure` 都匹配。否则，会创建一个新的 `Cookie`。

浏览器接收了响应头提供的 `Cookie` 之后，每一次访问该域时，都会携带该 `Cookie` 值：

![HTTP的请求头中携带Cookie](https://segmentfault.com/img/bVbRFDa "HTTP的请求头中携带Cookie")

`Cookie` 字段可以包含多个 Cookie，使用分号（`;`）分隔。

```
GET /sample_page.html HTTP/1.1
Host: www.example.org
Cookie: yummy_cookie=choco; tasty_cookie=strawberry
```

### 6.2 document.cookie

通过 `document.cookie` 属性可创建新的 `Cookie`，也可通过该属性访问非 HttpOnly 标记的 `Cookie`。

![Document获取Cookie](https://segmentfault.com/img/bVbRFDn "Document获取Cookie")

上图从 `document.cookie` 一次性读出多个 `Cookie`，它们之间使用分号分隔。必须手动还原，才能取出每一个 `Cookie` 的值。

写入的时候，`Cookie` 的值必须写成 `key=value` 的形式。注意，等号两边不能有空格。另外，写入 `Cookie` 的时候，必须对分号、逗号和空格进行转义（它们都不允许作为 `Cookie` 的值），这可以用 `encodeURIComponent` 方法达到。比如，我们要存储一个对象到 `Cookie`中，可以通过下面代码实现：

![document.cookie设置](https://segmentfault.com/img/bVbRFDp "document.cookie设置")

设置完成后，在浏览器查看：

![查看设置的Cookie](https://segmentfault.com/img/bVbRFDs "查看设置的Cookie")

那要怎么才能读取到这次设置的 `Cookie` 呢？方法如下：

![读取设置的cookie_people](https://segmentfault.com/img/bVbRFDu "读取设置的cookie_people")

读取到的结果如下：

![读取设置的cookie](https://segmentfault.com/img/bVbRFDz "读取设置的cookie")

> `document.cookie` 一次只能写入一个 `Cookie`，而且写入并不是覆盖，而是添加。

## 7\. Cookie 的安全隐患

> 信息被存在 `Cookie` 中时，需要明白 `Cookie` 的值时可以被访问，且可以被终端用户所修改的。根据应用程序的不同，可能需要使用服务器查找的不透明标识符，或者研究诸如 `JSON Web Tokens` 之类的替代身份验证/机密机制。
>
> 当机器处于不安全环境时，切记_不能_通过 `HTTP Cookie` 存储、传输敏感信息。

### 7.1 Cookie 捕获/重放

攻击者可以通过木马等恶意程序，或使用跨站脚本攻击等手段偷窃存放在用户硬盘或内存中的 `Cookie`。借助网络攻击手段，包括：

- 在不安全的局域网中被动地监听网络通信；
- 通过攻击网络用户的路由器，或通过搭建恶意的无线路由器等手法，控制路由基础设施，将网络流量重定向到攻击者控制的主机；
- 发动 `DNSPharming` (域欺骗)攻击，通过 `DNS 缓存中毒`、`DNS 应答欺骗`、或修改用户端的本地域名解析文件等方法攻击 `DNS` 系统，导致用户对合法网站的访问请求被重定向到恶意网站等等，同样可能窃取 `Cookie`。

对于捕获到的认证 `Cookie`，攻击者往往会猜测其中的访问令牌，试图获取会话ID、用户名与口令、用户角色、时间戳等敏感信息；或者直接重放该 `Cookie`，假冒受害者的身份发动攻击 。

### 7.2 恶意 Cookies

`Cookies` 是文本文件， 一般情况下认为它不会造成安全威胁。 但是，如果在 `Cookies` 中通过特殊标记语言，引入可执行代码，就很可能给用户造成严重的安全隐患。`HTML` 为区别普通文本和标记语言，用符号 `“<>”` 来指示 `HTML` 代码。 这些 `HTML` 代码或者定义 `Web` 网页格式，或者引入 `Web` 浏览器可执行代码段。 `Web` 服务 器可以使用 `Cookies` 信息创建动态网页。假使 `Cookies` 包含可执行恶意代码段，那么在显示合成有该 `Cookies` 的网页时，就会自动执行这段恶意代码。当然，恶意代码能否真正造成危害，还取决于 `Web` 站点的安全配置策略 。

### 7.3 会话定置

会话定置(`Session Fixation`)攻击是指，攻击者向受害者主机注入自己控制的认证 `Cookie` 等信息，使得受害者以攻击者的身份登录网站，从而窃取受害者的会话信息。

注入 `Cookie` 的方法包括：

- 使用跨站脚本或木马等恶意程序；
- 或伪造与合法网站同域的站点，并利用各种方法欺骗用户访问该仿冒网站，从而通过HTTP响应中的Set-Cookie头将攻击者拥有的该域Cookie发送给用户等。

### 7.4 CSRF 攻击

跨站请求伪造（`Cross-Site Request Forgery`，简称`CSRF`）是指：

攻击者可能利用网页中的恶意代码强迫受害者浏览器向被攻击的 `Web` 站点发送伪造的请求，篡夺受害者的认证 `Cookie` 等身份信息，从而假冒受害者对目标站点执行指定的操作。

Firefox、Opera 等浏览器使用单进程机制，多个窗口或标签使用同一个进程，共享 `Cookie` 等会话数据。IE 则混合使用单进程与多进程模式，一个窗口中的多个标签，以及使用 “CTRL+N” 或单击网页中的链接打开的新窗口使用同一进程，共享会话数据；只有直接运行IE可执行程序打开窗口时，才会创建新的进程。Chrome 虽然使用多进程机制，然而经测试发现，其不同的窗口或标签之间仍会共享会话数据，除非使用隐身访问方式。

因而，用户同时打开多个浏览器窗口或标签访问互联网资源时，就为 `CSRF` 攻击篡夺用户的会话 `Cookie` 创造了条件。另外，如果一个Web 站点提供持久化 `Cookie`，则 `CSRF` 攻击将更直接、更容易。

> 缓解 Cookie 攻击的方法如下：
>
> - 对用户输入进行过滤来阻止 XSS；
> - 任何敏感操作都需要确认；
> - 用于敏感信息的 Cookie 只能拥有较短的生命周期；

## 8\. 安全使用 Cookie

有两种方法可以确保 `Cookie` 被安全发送，并且不会被意外的参与者或脚本访问：`Secure` 属性和 `HttpOnly` 属性。

标记为 `Secure` 的 `Cookie` 只应通过被 `HTTPS` 协议加密过的请求发送给服务端，因此可以预防 `man-in-the-middle` 攻击者的攻击。但即便设置了 `Secure` 标记，敏感信息也不应该通过 `Cookie` 传输，因为 `Cookie` 有其固有的不安全性，`Secure` 标记也无法提供确实的安全保障, 例如，可以访问客户端硬盘的人可以读取它。

`JavaScript Document.cookie API` 无法访问带有 `HttpOnly` 属性的 `Cookie`；此类 `Cookie` 仅作用于服务器。例如，例如，持久化服务器端会话的 `Cookie` 不需要对 `JavaScript` 可用，而应具有 `HttpOnly` 属性。此预防措施有助于缓解跨站点脚本（`XSS`）攻击。

## 9\. Cookie 的替代方案

由于 `Cookie` 在使用上存在较多限制，近年来，随着技术的发展成熟，出现了几种可替代 `Cookie` 的方案，且已被大多数主流浏览器支持。

![Cookie的替代方案](https://segmentfault.com/img/bVbRFDI "Cookie的替代方案")

- **Web Storage、window.localStorage**

在浏览器中存储数据的另一种方法是 Web Storage API。`window.sessionStorage` 和 `window.localStorage` 属性与持续时间中的会话和永久 `Cookie` 相对应，但是存储限制比 `Cookie`大，并且永远不会发送到服务器。

- **IndexedDB**

可以使用 `IndexedDB API` 或基于它构建的库来存储更多结构化的数据。

- **Web SQL**

`Web SQL` 是一种利用数据库进行数据存储并利用 SQL 处理检索任务的 API。

___

> 欢迎大家来到我的「山头」，我是「前端三昧」的作者 _隐逸王_ —— 一个想要做山大王的男人！
>
> 愿和你一起领略前端三昧，发现前端之美！

___
