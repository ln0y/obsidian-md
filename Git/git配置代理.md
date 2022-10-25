---
aliases: []
tags: ['Git','date/2022-08','year/2022','month/08']
date: 2022-08-19-星期五 18:12:22
update: 2022-08-19-星期五 18:13:29
---

修改 `~/.ssh/` 下的 config

```txt
# HTTP代理
Host github.com
    User git
    ProxyCommand connect -H 127.0.0.1:64399 %h %p

# SOCKS5代理
Host github.com
    User git
    ProxyCommand connect -S 127.0.0.1:64399 %h %p

# github
Host github.com
HostName github.com
PreferredAuthentications publickey
IdentityFile ~/.ssh/github_id_rsa
```
