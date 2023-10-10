---
aliases: []
tags: ['Network', 'date/2023-10', 'year/2023', 'month/10']
date: 2023-10-08-星期日 22:59:09
update: 2023-10-09-星期一 00:06:46
---

## 前言

WebSocket 是一种基于 TCP 协议的 [**全双工通信协议**](https://zh.wikipedia.org/zh-cn/%E9%9B%99%E5%B7%A5)，它允许客户端和服务器之间进行双向通信，而不需要像 HTTP 协议那样每次都发送请求和响应。WebSocket 协议的出现使得 Web 应用程序可以实现实时交互和即时通信等功能，这对于在线游戏、聊天室、股票行情等实时性要求高的应用场景非常重要。

## WebSocket 协议的基本概念

WebSocket 协议基于 TCP 协议实现，它提供了类似于 HTTP 协议的请求和响应机制，但协议头和数据格式不同于 HTTP。WebSocket 的请求头和响应头中包含了一些特殊的字段，比如 Upgrade、Connection、Sec-WebSocket-Key 等。WebSocket 协议通过一个固定的地址（`ws://` 或 `wss://`）建立连接，连接成功后客户端和服务器之间可以直接发送消息，不需要像 HTTP 协议那样每次都发送请求和响应。WebSocket 协议的连接可以保持长时间，而不需要像 HTTP 协议那样在每次请求和响应之间重新建立连接，这样可以大大减少网络传输的开销和延迟。

## WebSocket 协议的特点

WebSocket 协议具有以下特点：

- 实时性好：WebSocket 可以实现实时交互和即时通信，对于在线游戏、聊天室、股票行情等实时性要求高的应用场景非常重要。
- 双向通信：WebSocket 支持客户端和服务器之间的双向通信，客户端和服务器之间可以直接发送消息，不需要像 HTTP 协议那样每次都发送请求和响应。
- 长连接：WebSocket 的连接可以保持长时间，而不需要像 HTTP 协议那样在每次请求和响应之间重新建立连接。
- 与 HTTP 协议有着良好的兼容性：默认端口也是 80（ws） 和 443(wss，运行在 TLS 之上)，并且握手阶段采用 HTTP 协议；
- 较少的控制开销：连接创建后，ws 客户端、服务端进行数据交换时，协议控制的数据包头部较小，而 HTTP 协议每次通信都需要携带完整的头部；
- 可以发送文本，也可以发送二进制数据；
- 没有同源限制，客户端可以与任意服务器通信；
- 协议标识符是 ws（如果加密，则为 wss），服务器网址就是 URL；
- 支持扩展：ws 协议定义了扩展，用户可以扩展协议，或者实现自定义的子协议（比如支持自定义压缩算法等）；

## WebSocket 协议与 HTTP 协议的区别

虽然 WebSocket 协议是基于 HTTP 协议的，但是它与 HTTP 协议还存在以下区别：

| 区别           | WebSocket                                        | HTTP                                   |
| -------------- | ------------------------------------------------ | -------------------------------------- |
| 建立连接方式   | 使用固定地址建立连接                             | 使用 URL 建立连接                      |
| 协议头和数据   | 协议头和数据格式比较紧凑                         | 协议头和数据格式比较松散               |
| 数据传输方式   | 支持双向通信                                     | 支持单向请求和响应                     |
| 连接的生命周期 | 支持长连接保持通信                               | 每次请求响应之间断开连接               |
| 安全性         | 支持 SSL/TLS 协议进行加密                        | 只能使用 HTTPS 协议进行加密            |
| 应用场景       | 适用于实时交互、即时通信等实时性要求高的应用场景 | 适用于请求和响应的场景，比如网页浏览等 |

HTTP、WebSocket 等协议都是处于 OSI 模型的最高层：应用层。而 IP 协议工作在网络层，TCP 协议工作在传输层。

HTTP、WebSocket 等应用层协议，都是基于 TCP 协议来传输数据的，因此其连接和断开，都要遵循 TCP 协议中的三次握手和四次挥手 ，只是在连接之后发送的内容不同，或者是断开的时间不同。

## WebSocket 原理

### 如何建立连接

在 WebSocket 开始通信之前，通信双方需要先进行握手，`WebSocket 复用了 HTTP 的握手通道`，即客户端通过 HTTP 请求与 WebSocket 服务端协商升级协议。协议升级完成后，后续的数据交换则遵照 WebSocket 的协议。

`利用 HTTP 完成握手有什么好处呢？` 一是可以让 WebSocket 和 HTTP 基础设备兼容（运行在 80 端口 或 443 端口），二是可以复用 HTTP 的 Upgrade 机制，完成升级协议的协商过程。

看个具体的请求（在网上找了个 [在线测试](http://www.websocket-test.com/)）：

![req.png](_attachment/img/4efd582d6350101e405997026eebea0b_MD5.png)

图中有 `几个关键点`：

- 101 状态码，表示协议切换；
- Connection: Upgrade 表示要升级协议；
- Upgrade: websocket 表示要升级到 websocket 协议；
- Sec-WebSocket-Key：与服务端响应头部的 Sec-WebSocket-Accept 是配套的，提供基本的防护，比如恶意的连接，或者无意的连接；这里的“配套”指的是：Sec-WebSocket-Accept 是根据请求头部的 Sec-WebSocket-Key 计算而来，计算过程大致为基于 SHA1 算法得到摘要并转成 base64 字符串。

图中的请求已经完成握手并正常工作了：

![succ.png](_attachment/img/973c47440741bc7d477afb830701b731_MD5.png)

### 如何交换数据

具体的数据格式是怎么样的呢？WebSocket 的每条消息可能会被切分成多个数据帧（最小单位）。发送端会将消息切割成多个帧发送给接收端，接收端接收消息帧，并将关联的帧重新组装成完整的消息。

看一个来自 MDN 上的示例：

```txt
Client: FIN=1, opcode=0x1, msg="hello"
Server: (process complete message immediately) Hi.

Client: FIN=0, opcode=0x1, msg="and a"
Server: (listening, newmessage containing text started)

Client: FIN=0, opcode=0x0, msg="happy new"
Server: (listening, payload concatenated to previous message)

Client: FIN=1, opcode=0x0, msg="year!"
Server: (process complete message) Happy new year to you too!
```

在该示例中，客户端向服务器发送了两条消息，第一个消息在单个帧中发送，而第二个消息跨三个帧发送。当 WebSocket 的接收方收到一个数据帧时，会根据 FIN 字段值来判断是否收到消息的最后一个数据帧。利用 FIN 和 Opcode，我们就可以实现跨帧发送消息。

其中 Opcode 表示操作码，它的可能值有：

- 0x1，传输数据是文本；
- 0x2，传输数据是二进制数据；
- 0x0，表示该帧是一个延续帧（这意味着服务器应该将帧的数据连接到从该客户端接收到的最后一个帧）；
- 0x3-7：保留的操作代码，用于后续定义的非控制帧；
- 0x8：表示连接断开；
- 0x9：表示这是一个心跳请求（ping）；
- 0xA：表示这是一个心跳响应（pong）；
- 0xB-F：保留的操作代码，用于后续定义的控制帧；

具体的数据帧格式大概长下面这样（从左到右，单位是比特）：

```txt
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-------+-+-------------+-------------------------------+
|F|R|R|R| opcode|M| Payload len |    Extended payload length    |
|I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
|N|V|V|V|       |S|             |   (if payload len==126/127)   |
| |1|2|3|       |K|             |                               |
+-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
|     Extended payload length continued, if payload len == 127  |
+ - - - - - - - - - - - - - - - +-------------------------------+
|                               |Masking-key, if MASK set to 1  |
+-------------------------------+-------------------------------+
| Masking-key (continued)       |          Payload Data         |
+-------------------------------- - - - - - - - - - - - - - - - +
:                     Payload Data continued ...                :
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
|                     Payload Data continued ...                |
+---------------------------------------------------------------+
```

具体看下每一个字段：

- 首先我们先看第一个字节 (8 位)，第一个字节的最高位表示的是 FIN 标识，如果**FIN 为 1**表示这是**消息的最后一部分分片 (fragment)**,就是消息已经发送完毕了；如果**FIN 为 0**表示这**不是消息的最后一部分数据**，**后续还会有数据过来**。
- FIN 位后的 RSV1，RSV2，RSV3，各占一位，一般值都为 0，主要用于 WebSocket 协议的扩展，所以可以认为这三位都是 0
- 第一个字节剩下的**后四位**表示的是**操作码**，代表的是数据帧类型，比如文本类型、二进制类型等
- 再看第二个字节 (8 位)，第二个字节的**最高位**表示的是**Mask 位**，如果**Mask 位为 1**，表示这是**客户端发送过来的数据**，因为客户端发送的数据要进行掩码加密；如果**Mask 为 0**，表示这是**服务端发送的数据**。
- 第二个字节还剩下 7 位，表示的是**传输字节的长度**，其值为 0-127，根据值的不同，**存储数据长度的位置可能会向后扩展**。其规则为，如果这 7 位表示的值在 `[0-125]` 之间那么就不用向后扩展，第二个字节的后 7 位就足够存储，这个 7 位表示的值就是发送数据的长度；如果**这 7 位表示的值为 126**，表示客户端发送数据的字节长度在 (125,65535) 之间，此时需要 16 位两个字节来存储字节长度，所以**用第三和第四个字节来表示客户端发送数据的长度**；如果**这 7 位表示的值为 127**，表示客户端发送的数据的字节长度大于 65535，就要用 64 位，8 个字节才存储数据长度，即第三到第 10 个字节来存储，~~但是**这 8 个字节的前 4 个字节值必须为 0**，否则数据异常，连接必须关闭，所以**其实是用第六到第十个字节来存储数据的长度**。~~
- 根据以上规则，我们就可以知道真实数据的位置了，接下来我们就可以对真实数据进行解析了，如果第二个字节的第一位即**Mask 位值为 1**，那么表示客户端发送的数据，那么**真实数据之前就会有四个字节的掩码**。解码数据的时候，我们要使用到这个掩码，因为**掩码有 4 个字节**，所以解码的时候，我们要**遍历真实数据**，然后**依次与掩码进行异或运算**

### 如何维持连接

如果我们使用 WebSocket 进行通信，建立连接之后怎么判断连接正常没有断开或者服务是否可用呢？可以通过 `建立心跳机制`，所谓心跳机制，就是定时发送一个数据包，让对方知道自己在线且正常工作，确保通信有效。如果对方无法响应，便可以弃用旧连接，发起新的连接了。

需要重连的场景可能包括：网络问题或者机器故障导致连接断开、连接没断但不可用了或者连接对端的服务不可用了等等。

发送方 -> 接收方：ping。

接收方 -> 发送方：pong。

ping 、pong 的操作，对应的是 WebSocket 的两个控制帧，Opcode 分别是 0x9、0xA。比如说，WebSocket 服务端向客户端发送 ping：

```js
// ping
ws.ping()
// pong
ws.on('pong', () => {
  console.log('pong received')
})
```

客户端也可以发送：

```js
// 发送心跳包
ws.send('heart check')
// 接收响应
ws.onmessage = e => {
  const response = e.data
  if (response.message === 'connection alive') {
    // 重置计时器
  }
}
```

## WebSocket 实现

### weboscket 的流程

我们知道，http 是一问一答的模式，客户端向服务器发送 http 请求，服务器返回 http 响应。

这种模式对资源、数据的加载足够用，但是需要数据推送的场景就不合适了。

有同学说，http2 不是有 server push 么？

那只是推资源用的：

![](_attachment/img/c107928f018678cd65cab7c1640f36b1_MD5.png)

比如浏览器请求了 html，服务端可以连带把 css 一起推送给浏览器。浏览器可以决定接不接收。

对于即时通讯等实时性要求高的场景，就需要用 websocket 了。

websocket 严格来说和 http 没什么关系，是另外一种协议格式。但是需要一次从 http 到 websocekt 的切换过程。

![](_attachment/img/8724945a751179068cf57c7fa0b7ce6a_MD5.png)

切换过程详细来说是这样的：

请求的时候带上这几个 header：

```http
Connection: Upgrade
Upgrade: websocket
Sec-WebSocket-Key: Ia3dQjfWrAug/6qm7mTZOg==
```

前两个很容易理解，就是升级到 websocket 协议的意思。

第三个 header 是保证安全用的一个 key。

服务端返回这样的 header：

```http
HTTP/1.1 101 Switching Protocols
Connection: Upgrade
Upgrade: websocket
Sec-WebSocket-Accept: JkE58n3uIigYDMvC+KsBbGZsp1A=
```

和请求 header 类似，Sec-WebSocket-Accept 是对请求带过来的 Sec-WebSocket-Key 处理之后的结果。

加入这个 header 的校验是为了确定对方一定是有 WebSocket 能力的，不然万一建立了连接对方却一直没消息，那不就白等了么。

那 Sec-WebSocket-Key 经过什么处理能得到 Sec-WebSocket-Accept 呢？

我用 node 实现了一下，是这样的：

```js
const crypto = require('crypto')

function hashKey(key) {
  const sha1 = crypto.createHash('sha1')
  sha1.update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
  return sha1.digest('base64')
}
```

也就是用客户端传过来的 key，加上一个固定的字符串，经过 sha1 加密之后，转成 base64 的结果。

这个字符串 `258EAFA5-E914-47DA-95CA-C5AB0DC85B11` 是固定的，不信你搜搜看：

![](_attachment/img/67b297961b3600d456e198603b7a8e80_MD5.png)

随便找个有 websocket 的网站，比如知乎就有：

![](_attachment/img/d835a467809fed0f3823ea67af4a5b34_MD5.png)

过滤出 ws 类型的请求，看看这几个 header，是不是就是前面说的那些。

这个 `Sec-WebSocket-Key` 是 `wk60yiym2FEwCAMVZE3FgQ==`

![](_attachment/img/461cf9f23829dcc4cad6c381bd38d81d_MD5.png)

而响应的 `Sec-WebSocket-Accept` 是 `XRfPnS+8xl11QWZherej/dkHPHM=`

![](_attachment/img/ad6f97332fb249e356c5b001a3169515_MD5.png)

我们算算看：

![](_attachment/img/5f55dc6ec3f1c4354cca299aef8cb426_MD5.png)

是不是一毛一样！

这就是 websocket 升级协议时候的 `Sec-WebSocket-Key` 对应的 `Sec-WebSocket-Accept` 的计算过程。

这一步之后就换到 websocket 的协议了，那是一个全新的协议：

勾选 message 这一栏可以看到传输的消息，可以是文本、可以是二进制：

![](_attachment/img/42c9395aa5ba24e0f6c1cb279dbef2c6_MD5.png)

### 设计 WebSocket 协议

全新的协议？那具体是什么样的协议呢？

这样的：

![](_attachment/img/fe1b5959486c95e17494c96c4bb9bed1_MD5.png)

大家习惯的 http 协议是 key:value 的 header 带个 body 的：

![](_attachment/img/0e2cbb319712a636cdcb8ae3a79c720e_MD5.png)

它是文本协议，每个 header 都是容易理解的字符。

这样好懂是好懂，但是传输占的空间太大了。

而 websocket 是二进制协议，一个字节可以用来存储很多信息：

![](_attachment/img/1925f340b5299cb479048cd536928fe5_MD5.png)

比如协议的第一个字节，就存储了 FIN（结束标志）、opcode（内容类型是 binary 还是 text） 等信息。

第二个字节存储了 mask（是否有加密），payload（数据长度）。

仅仅两个字节，存储了多少信息呀！

这就是二进制协议比文本协议好的地方。

我们看到的 weboscket 的 message 的收发，其实底层都是拼成这样的格式。

![](_attachment/img/96cf90775409706e117dd34db379d02c_MD5.png)

只是浏览器帮我们解析了这种格式的协议数据。

这就是 weboscket 的全部流程了。

其实还是挺清晰的，一个切换协议的过程，然后是二进制的 weboscket 协议的收发。

那我们就用 Node.js 自己实现一个 websocket 服务器吧！

定义个 MyWebsocket 的 class：

```js
const { EventEmitter } = require('events')
const http = require('http')

class MyWebsocket extends EventEmitter {
  constructor(options) {
    super(options)

    const server = http.createServer() // 自己创建一个web server
    server.listen(options.port || 8080)

    server.on('upgrade', (req, socket) => {})
  }
}
```

继承 EventEmitter 是为了可以用 emit(发出) 发送一些事件，外界可以通过 on 监听这个事件来处理。

### 升级到 WebSocket 协议

我们在构造函数里创建了一个 http 服务，当**浏览器通过 new WebSocket() 创建 WebSocket 客户端**的时候，浏览器会自动发起协议升级请求触发 ungrade 事件发生，也就是收到了 Connection: upgrade 的 header 的时候，返回切换协议的 header。

返回的 header 前面已经见过了，就是要对 sec-websocket-key 做下处理。

```js
server.on('upgrade', (req, socket) => {
  // 处理协议升级请求
  this.socket = socket // 使用了传递的web server
  socket.setKeepAlive(true)

  // 构造响应头
  const resHeaders = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    'Sec-WebSocket-Accept: ' + hashKey(req.headers['sec-websocket-key']), // 对浏览器生成的key进行加密
    '',
    '',
  ].join('\r\n')
  socket.write(resHeaders) // 返回响应头部

  socket.on('data', data => {
    console.log(data)
  })
  socket.on('close', error => {
    this.emit('close')
  })
})
```

- Connection: Upgrade 表示**要升级协议**
- Upgrade: websocket 表示**要升级到 websocket 协议**
- Sec-WebSocket-version 表示**websocket 的版本**。
- Sec-WebSocket-Key 浏览器生成的一个字符串，**服务器端需要取出该字符串与 `258EAFA5-E914-47DA-95CA-C5AB0DC85B11` 拼接**，然后**通过 SHA1 算法计算出摘要**，并**转成 base64 字符串**，然后**作为 `Sec-WebSocket-Accept` 的值放到响应头部返回给客户端**，否则会连接失败。

我们拿到 socket，返回上面的 header，其中 key 做的处理就是前面聊过的算法：

```js
function hashKey(key) {
  const sha1 = crypto.createHash('sha1')
  sha1.update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
  return sha1.digest('base64')
}
```

就这么简单，就已经完成协议切换了。

不信我们试试看。

### 接收客户端发过来的数据

引入我们实现的 ws 服务器，跑起来：

```js
const MyWebSocket = require('./ws')
const ws = new MyWebSocket({ port: 8080 })

ws.on('data', data => {
  console.log('receive data:' + data)
})

ws.on('close', (code, reason) => {
  console.log('close:', code, reason)
})
```

![](_attachment/img/01c320494d9f3e19db333fc19e868d48_MD5.png)

然后新建这样一个 html：

```html
<!DOCTYPE html>
<html>
  <body>
    <script>
      const ws = new WebSocket('ws://localhost:8080')

      ws.onopen = function () {
        ws.send('发送数据')
        setTimeout(() => {
          ws.send('发送数据2')
        }, 3000)
      }

      ws.onmessage = function (evt) {
        console.log(evt)
      }

      ws.onclose = function () {}
    </script>
  </body>
</html>
```

用浏览器的 WebSocket api 建立连接，发送消息。

用 npx http-server . 起个静态服务。

然后浏览器访问这个 html：

这时打开 devtools 你就会发现协议切换成功了：

![](_attachment/img/1a050617bca38176fdb571a62a5dcaba_MD5.png)

这 3 个 header 还有 101 状态码都是我们返回的。

message 里也可以看到发送的消息：

![](_attachment/img/53492de0f89253808fb01a28eb11f07e_MD5.png)

再去服务端看看，也收到了这个消息：

![](_attachment/img/887b3c91f74b29645cff049c21b95cd9_MD5.png)

只不过是 Buffer 的，也就是二进制的。

接下来只要按照协议格式解析这个 Buffer，并且生成响应格式的协议数据 Buffer 返回就可以收发 websocket 数据了。

### 处理客户端发送过来的数据

这一部分还是比较麻烦的，我们一点点来看。

![](_attachment/img/9913c3ec86454107b3688ff7d294c5f1_MD5.png)

我们需要第一个字节的后四位，也就是 opcode。

这样写：

```js
const byte1 = bufferData.readUInt8(0) // 读取buffer数据的前8 bit并转换为十进制整数
let opcode = byte1 & 0x0f //截取第一个字节的后4位，即opcode码, 等价于 (byte1 & 15)
```

读取 8 位无符号整数的内容，也就是一个字节的内容。参数是偏移的字节，这里是 0。

通过位运算取出后四位，这就是 opcode 了。

然后再处理第二个字节：

![](_attachment/img/6b7c7a641af660444bcd82af6b09a686_MD5.png)

第一位是 mask 标志位，后 7 位是 payload 长度。

可以这样取：

```js
const byte2 = bufferData.readUInt8(1) // 从第一个字节开始读取8位，即读取数据帧第二个字节数据
const str2 = byte2.toString(2) // 将第二个字节转换为二进制的字符串形式
const MASK = str2[0] // 获取第二个字节的第一位，判断是否有掩码，客户端必须要有
let payloadLength = parseInt(str2.substring(1), 2) // 获取第二个字节除第一位掩码之后的字符串并转换为整数
```

还是用 buffer.readUInt8 读取一个字节的内容。

先转成二进制字符串，这时第一位就是 mask，然后再截取后 7 位的子串，parseInt 成数字，这就是 payload 长度了。

这样前两个字节的协议内容就解析完了。

有同学可能问了，后面咋还有俩 payload 长度呢？

![](_attachment/img/2404a47da4b3121d32cce3b982f497e6_MD5.png)

这是因为数据不一定有多长，可能需要 16 位存长度，可能需要 32 位。

于是 websocket 协议就规定了如果那个 7 位的内容不超过 125，那它就是 payload 长度。

如果 7 位的内容是 126，那就不用它了，用后面的 16 位的内容作为 payload 长度。

如果 7 位的内容是 127，也不用它了，用后面那个 64 位的内容作为 payload 长度。

其实还是容易理解的，就是 3 个 if else。

用代码写出来就是这样的：

```js
let payloadLength = parseInt(str2.substring(1), 2) // 获取第二个字节除第一位掩码之后的字符串并转换为整数

let curByteIndex = 2 // 偏移两个字节

if (payloadLength === 126) {
  // 说明125<数据长度<65535（16个位能描述的最大值，也就是16个1的时候)
  payloadLength = bufferData.readUInt16BE(2) // 就用第三个字节及第四个字节表示数据的长度
  curByteIndex += 2 // 偏移两个字节
} else if (payloadLength === 127) {
  // 说明数据长度已经大于65535，16个位也已经不足以描述数据长度了，就用第三到第十个字节这八个字节来描述数据长度
  payloadLength = bufferData.readBigUInt64BE(2) // 从第三个字节开始读取64位，即8个字节
  curByteIndex += 8 // 偏移八个字节
}
```

这里的 curByteIndex 是存储当前处理到第几个字节的。

如果是 126，那就从第 3 个字节开始，读取 2 个字节也就是 16 位的长度，用 buffer.readUInt16BE 方法。

如果是 127，那就从第 3 个字节开始，读取 8 个字节也就是 64 位的长度，用 buffer.readBigUInt64BE 方法。

![](_attachment/img/154a64419c848b9cf431769441290310_MD5.png)

这样就拿到了 payload 的长度，然后再用这个长度去截取内容就好了。

但在读取数据之前，还有个 mask 要处理，这个是用来给内容解密的：

![](_attachment/img/ada40d89f80900d8e62b3ce4bc67cbe0_MD5.png)

读 4 个字节，就是 mask key。

再后面的就可以根据 payload 长度读出来。

```js
let realData = null // 保存真实数据对应字符串形式

if (MASK) {
  // 如果存在MASK掩码，表示是客户端发送过来的数据，是加密过的数据，需要进行数据解码
  const maskKey = bufferData.slice(curByteIndex, curByteIndex + 4) //获取掩码数据, 其中前四个字节为掩码数据
  curByteIndex += 4 //指针前移到真实数据段
  const payloadData = bufferData.slice(curByteIndex, curByteIndex + payloadLength) // 获取真实数据对应的Buffer
  realData = handleMask(maskKey, payloadData) //解码真实数据
} else {
  realData = bufferData.slice(curByteIndex, curByteIndex + payloadLength)
}
```

然后用 mask key 来解密数据。

这个算法也是固定的，用每个字节的 mask key 和数据的每一位做按位异或就好了：

```js
function handleMask(maskBytes, data) {
  const payload = Buffer.alloc(data.length)
  for (let i = 0; i < data.length; i++) {
    payload[i] = maskBytes[i % 4] ^ data[i] // 掩码有4个字节依次与真实数据进行异或运算即可
  }
  return payload
}
```

这样，我们就拿到了最终的数据！

### 处理真实数据

但是传给处理程序之前，还要根据类型来处理下，因为内容分几种类型，也就是 opcode 有几种值：

```js
const OPCODES = {
  CONTINUE: 0,
  TEXT: 1, // 文本
  BINARY: 2, // 二进制
  CLOSE: 8,
  PING: 9,
  PONG: 10,
}
```

我们只处理文本和二进制就好了：

```js
function handleRealData(opcode, realDataBuffer) {
  switch (opcode) {
    case OPCODES.TEXT:
      this.emit('data', realDataBuffer.toString('utf8'))
      break
    case OPCODES.BINARY:
      this.emit('data', realDataBuffer)
      break
    default:
      this.emit('close')
      break
  }
}
```

文本就转成 utf-8 的字符串，二进制数据就直接用 buffer 的数据。

这样，处理程序里就能拿到解析后的数据。

我们来试一下：

之前我们已经能拿到 weboscket 协议内容的 buffer 了：

![](_attachment/img/9629345e4ef61f91e6c164866ef630d9_MD5.png)

而现在我们能正确解析出其中的数据：

![](_attachment/img/64e3abebb8f8ed30d71894bf465e7143_MD5.png)

至此，我们 websocket 协议的解析成功了！

这样的协议格式的数据叫做 frame，也就是帧：

![](_attachment/img/0b31684a57dc17f6ca7282a6afdfa1ba_MD5.png)

解析可以了，接下来我们再实现数据的发送。

### 服务端 WebSocket 发送数据

发送也是构造一样的 frame 格式。

定义这样一个 send 方法：

```js
function send(data) {
  let opcode
  let buffer
  if (Buffer.isBuffer(data)) {
    // 如果是二进制数据
    opcode = OPCODES.BINARY // 操作码设置为二进制类型
    buffer = data
  } else if (typeof data === 'string') {
    // 如果是字符串
    opcode = OPCODES.TEXT // 操作码设置为文本类型
    buffer = Buffer.from(data, 'utf8') // 将字符串转换为Buffer数据
  } else {
    console.error('暂不支持发送的数据类型')
  }
  this.doSend(opcode, buffer)
}

function doSend(opcode, bufferDatafer) {
  this.socket.write(encodeMessage(opcode, bufferDatafer))
}
```

### 编码数据

根据发送的是文本还是二进制数据来对内容作处理。

然后构造 websocket 的 frame：

```js
function encodeMessage(opcode, payload) {
  //payload.length < 126
  let bufferData = Buffer.alloc(payload.length + 2 + 0) // 服务器返回的数据不需要加密，直接加2个字节即可

  let byte1 = parseInt('10000000', 2) | opcode // 设置 FIN 为 1
  let byte2 = payload.length // MASK为0，直接赋值为length值即可

  bufferData.writeUInt8(byte1, 0) //从第0个字节开始写入8位，即将b1写入到第一个字节中
  bufferData.writeUInt8(byte2, 1) //读8―15bit，将字节长度写入到第二个字节中

  payload.copy(bufferData, 2) //复制数据,从2(第三)字节开始,将数据插入到第二个字节后面

  return bufferData
}
```

我们只处理数据长度小于 125 的情况。

第一个字节是 opcode，我们把第一位置 1 ，通过按位或的方式。

![](_attachment/img/6284bf44539643d79345677e187604c8_MD5.png)

服务端给客户端回消息不需要 mask，所以第二个字节就是 payload 长度。

分别把这前两个字节的数据写到 buffer 里，指定不同的 offset：

```js
bufferData.writeUInt8(byte1, 0)
bufferData.writeUInt8(byte2, 1)
```

之后把 payload 数据放在后面：

```js
payload.copy(bufferData, 2)
```

这样一个 websocket 的 frame 就构造完了。

我们试一下：

![](_attachment/img/4abf1293af645dc426bf2656952646a2_MD5.png)

收到客户端消息后，每两秒回一个消息。

![](_attachment/img/5c099924fbe3a057cf499a614148c417_MD5.gif)

收发消息都成功了！

就这样，我们自己实现了一个 websocket 服务器，实现了 websocket 协议的解析和生成！

### 完整代码

完整代码如下：

MyWebSocket:

```js
//ws.js
const { EventEmitter } = require('events')
const http = require('http')
const crypto = require('crypto')

function hashKey(key) {
  const sha1 = crypto.createHash('sha1')
  sha1.update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
  return sha1.digest('base64')
}

function handleMask(maskBytes, data) {
  const payload = Buffer.alloc(data.length)
  for (let i = 0; i < data.length; i++) {
    payload[i] = maskBytes[i % 4] ^ data[i] // 掩码有4个字节依次与真实数据进行异或运算即可
  }
  return payload
}

const OPCODES = {
  CONTINUE: 0,
  TEXT: 1, // 文本
  BINARY: 2, // 二进制
  CLOSE: 8,
  PING: 9,
  PONG: 10,
}

function encodeMessage(opcode, payload) {
  //payload.length < 126
  let bufferData = Buffer.alloc(payload.length + 2 + 0) // 服务器返回的数据不需要加密，直接加2个字节即可

  let byte1 = parseInt('10000000', 2) | opcode // 设置 FIN 为 1
  let byte2 = payload.length // MASK为0，直接赋值为length值即可

  bufferData.writeUInt8(byte1, 0) //从第0个字节开始写入8位，即将b1写入到第一个字节中
  bufferData.writeUInt8(byte2, 1) //读8―15bit，将字节长度写入到第二个字节中

  payload.copy(bufferData, 2) //复制数据,从2(第三)字节开始,将数据插入到第二个字节后面

  return bufferData
}

class MyWebsocket extends EventEmitter {
  constructor(options) {
    super(options)

    const server = http.createServer() // 自己创建一个web server
    server.listen(options.port || 8080)

    server.on('upgrade', (req, socket) => {
      // 处理协议升级请求
      this.socket = socket // 使用了传递的web server
      socket.setKeepAlive(true)

      // 构造响应头
      const resHeaders = [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        'Sec-WebSocket-Accept: ' + hashKey(req.headers['sec-websocket-key']), // 对浏览器生成的key进行加密
        '',
        '',
      ].join('\r\n')
      socket.write(resHeaders)

      socket.on('data', data => {
        this.processData(data)
        // console.log(data);
      })
      socket.on('close', error => {
        this.emit('close')
      })
    })
  }

  // 处理客户端发送过来的真实数据
  handleRealData(opcode, realDataBuffer) {
    switch (opcode) {
      case OPCODES.TEXT:
        this.emit('data', realDataBuffer.toString('utf8'))
        break
      case OPCODES.BINARY: //二进制文件直接交付
        this.emit('data', realDataBuffer)
        break
      default:
        this.emit('close')
        break
    }
  }

  processData(bufferData) {
    // 处理第一个字节
    const byte1 = bufferData.readUInt8(0) // 读取buffer数据的前8 bit并转换为十进制整数
    // 获取第一个字节的最高位，看是0还是1
    const str1 = byte1.toString(2) // 将第一个字节转换为二进制的字符串形式
    const FIN = str1[0]
    let opcode = byte1 & 0x0f //截取第一个字节的后4位，即opcode码, 等价于 (byte1 & 15)

    // 处理第二个字节
    const byte2 = bufferData.readUInt8(1) // 从第一个字节开始读取8位，即读取数据帧第二个字节数据
    const str2 = byte2.toString(2) // 将第二个字节转换为二进制的字符串形式
    const MASK = str2[0] // 获取第二个字节的第一位，判断是否有掩码，客户端必须要有

    let curByteIndex = 2 // 首先分析前两个字节

    let payloadLength = parseInt(str2.substring(1), 2) // 获取第二个字节除第一位掩码之后的字符串并转换为整数
    if (payloadLength === 126) {
      // 说明125<数据长度<65535（16个位能描述的最大值，也就是16个1的时候)
      payloadLength = bufferData.readUInt16BE(2) // 就用第三个字节及第四个字节表示数据的长度
      curByteIndex += 2 // 偏移两个字节
    } else if (payloadLength === 127) {
      // 说明数据长度已经大于65535，16个位也已经不足以描述数据长度了，就用第三到第十个字节这八个字节来描述数据长度
      payloadLength = bufferData.readBigUInt64BE(2) // 从第三个字节开始读取64位，即8个字节
      curByteIndex += 8 // 偏移八个字节
    }

    let realData = null // 保存真实数据对应字符串形式

    if (MASK) {
      // 如果存在MASK掩码，表示是客户端发送过来的数据，是加密过的数据，需要进行数据解码
      const maskKey = bufferData.slice(curByteIndex, curByteIndex + 4) //获取掩码数据, 其中前四个字节为掩码数据
      curByteIndex += 4 //指针前移到真实数据段
      const payloadData = bufferData.slice(curByteIndex, curByteIndex + payloadLength) // 获取真实数据对应的Buffer
      realData = handleMask(maskKey, payloadData) //解码真实数据
    }
    if (FIN) {
      // 如果第一个字节的第一位为1,表示是消息的最后一个分片，即全部消息结束了(发送的数据比较少，一次发送完成)
      this.handleRealData(opcode, realData) // 处理操作码
    }
  }

  // 根据发送数据的类型设置上对应的操作码，将数据转换为Buffer形式
  send(data) {
    let opcode
    let buffer
    if (Buffer.isBuffer(data)) {
      // 如果是二进制数据
      opcode = OPCODES.BINARY // 操作码设置为二进制类型
      buffer = data
    } else if (typeof data === 'string') {
      // 如果是字符串
      opcode = OPCODES.TEXT // 操作码设置为文本类型
      buffer = Buffer.from(data, 'utf8') // 将字符串转换为Buffer数据
    } else {
      console.error('暂不支持发送的数据类型')
    }
    this.doSend(opcode, buffer)
  }

  // 开始发送数据
  doSend(opcode, bufferDatafer) {
    this.socket.write(encodeMessage(opcode, bufferDatafer)) //编码后直接通过socket发送
  }
}

module.exports = MyWebsocket
```

Index：

```js
const MyWebSocket = require('./ws')
const ws = new MyWebSocket({ port: 8080 })

ws.on('data', data => {
  console.log('receive data:' + data)
  setInterval(() => {
    ws.send(data + ' ' + Date.now())
  }, 2000)
})

ws.on('close', (code, reason) => {
  console.log('close:', code, reason)
})
```

html:

```html
<!DOCTYPE html>
<html>
  <body>
    <script>
      const ws = new WebSocket('ws://localhost:8080')

      ws.onopen = function () {
        ws.send('发送数据')
        setTimeout(() => {
          ws.send('发送数据2')
        }, 3000)
      }

      ws.onmessage = function (evt) {
        console.log(evt)
      }

      ws.onclose = function () {}
    </script>
  </body>
</html>
```

### 总结

实时性较高的需求，我们会用 websocket 实现，比如即时通讯、游戏等场景。

websocket 和 http 没什么关系，但从 http 到 websocket 需要一次切换的过程。

这个切换过程除了要带 upgrade 的 header 外，还要带 sec-websocket-key，服务端根据这个 key 算出结果，通过 sec-websocket-accept 返回。响应是 101 Switching Protocols 的状态码。

这个计算过程比较固定，就是 key + 固定的字符串 通过 sha1 加密后再 base64 的结果。

加这个机制是为了确保对方一定是 websocket 服务器，而不是随意返回了个 101 状态码。

之后就是 websocket 协议了，这是个二进制协议，我们根据格式完成了 websocket 帧的解析和生成。

这样就是一个完整的 websocket 协议的实现了。

我们自己手写了一个 websocket 服务，有没有感觉对 websocket 的理解更深了呢？

## 参考

[WebSocket ｜概念、原理、用法及实践](https://juejin.cn/post/7086021621542027271)

[用 Node.js 手写 WebSocket 协议](https://juejin.cn/post/7197714333475979322)

[WebSocket 协议详解](https://juejin.cn/post/7223658394351026231)
