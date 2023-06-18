---
aliases: []
tags: ['Linux/WSL','date/2022-08','year/2022','month/08']
date: 2022-08-22-星期一 10:25:15
update: 2023-06-18-星期日 15:06:01
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

![[_attachment/img/Pasted image 20220822103022.png|700]]

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

或者你可以直接把上述几行加入 ~/.bashrc (或者是 ~/.zshrc) 中, 也可以考虑像我一样单独写入一个脚本 ~/proxy.sh, 然后在 ~/.bashrc (~/.zshrc) 中添加一个命令 `. ~/proxy.sh`, 这样可以让 ~/.bashrc (~/.zshrc) 看起来更加简洁一点.

```sh
#!/bin/bash

HOST_IP=$(cat /etc/resolv.conf | grep nameserver | awk '{ print $2 }')
WSL_IP=$(hostname -I | awk '{print $1}')
PROXY_PORT=7890

PROXY_HTTP="http://${HOST_IP}:${PROXY_PORT}"
PROXY_SOCKS5="socks5://${HOST_IP}:${PROXY_PORT}"

set_proxy() {
  export http_proxy="${PROXY_HTTP}"
  export HTTP_PROXY="${PROXY_HTTP}"

  export https_proxy="${PROXY_HTTP}"
  export HTTPS_proxy="${PROXY_HTTP}"

  export ALL_PROXY="${PROXY_SOCKS5}"
  export all_proxy="${PROXY_SOCKS5}"

  git config --global http.proxy "${PROXY_HTTP}"
  git config --global https.proxy "${PROXY_HTTP}"

  # git ssh proxy
  sed -i "s/# ProxyCommand/ProxyCommand/" ~/.ssh/config
  sed -i -E "s/ProxyCommand nc -X connect -x [0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:[0-9]+ %h %p/ProxyCommand nc -X connect -x ${HOST_IP}:${PROXY_PORT} %h %p/" ~/.ssh/config
}

unset_proxy() {
  unset http_proxy
  unset HTTP_PROXY
  unset https_proxy
  unset HTTPS_PROXY
  unset ALL_PROXY
  unset all_proxy

  git config --global --unset http.proxy "${PROXY_HTTP}"
  git config --global --unset https.proxy "${PROXY_HTTP}"

  sed -i -E "s/ProxyCommand nc -X connect -x [0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:[0-9]+ %h %p/# ProxyCommand nc -X connect -x 0.0.0.0:0 %h %p/" ~/.ssh/config
}

test_proxy() {
  echo "Host ip:" "${HOST_IP}"
  echo "WSL ip:" "${WSL_IP}"
  echo "Current proxy:" "${https_proxy}"
}
```
