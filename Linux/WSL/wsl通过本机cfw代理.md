---
aliases: []
tags: ['Linux/WSL','date/2022-08','year/2022','month/08']
date: 2022-08-22-星期一 10:25:15
update: 2022-08-22-星期一 11:20:38
---

在 `~/.bashrc` 中增加（zsh 就是 .zshrc）

```bash
## 获取主机 IP
## 主机 IP 保存在 /etc/resolv.conf 中
export hostip=$(cat /etc/resolv.conf | grep -oP '(?<=nameserver\ ).*')

# 一直启动代理
export all_proxy="socks5://${hostip}:7890"
export https_proxy="http://${hostip}:7890"
export http_proxy="http://${hostip}:7890"

# 手动启动代理
# alias setss='export https_proxy="http://${hostip}:64399";export http_proxy="http://${hostip}:64399";export all_proxy="socks5://${hostip}:64399";'
# alias unsetss='unset all_proxy'
```

端口根据 clash 上的一样（默认是 7890，我这里改为 64399）

![[Pasted image 20220822103022.png |700]]

更新配置

```bash
source ~/.bashrc
```

测试

```bash
curl google.com
```

输出 html 代表代理成功

```bash
$ curl google.com
<HTML><HEAD><meta http-equiv="content-type" content="text/html;charset=utf-8">
<TITLE>301 Moved</TITLE></HEAD><BODY>
<H1>301 Moved</H1>
The document has moved
<A HREF="http://www.google.com/">here</A>.
</BODY></HTML>
```
