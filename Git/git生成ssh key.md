---
aliases: []
tags: ['Git', 'date/2022-08', 'year/2022', 'month/08']
date: 2022-08-19-星期五 15:35:11
update: 2023-03-10-星期五 11:14:34
---

## 配置用户名和密码

```shell
git config --global user.name "name"
git config --global user.email "email"
```

## 生成密钥

```shell
ssh-keygen -t rsa -C "上面的邮箱"

# Ed25519 算法
ssh-keygen -t ed25519 -C "your_email@example.com"
```

代码参数含义：

-t 指定密钥类型，默认是 rsa ，可以省略。

-C 设置注释文字，比如邮箱。

-f 指定密钥文件存储文件名。

```shell
[root@localhost ~]# ssh-keygen -t rsa       <== 建立密钥对，-t代表类型，有RSA和DSA两种
Generating public/private rsa key pair.
Enter file in which to save the key (/root/.ssh/id_rsa):   <==密钥文件默认存放位置，按Enter即可
Created directory '/root/.ssh'.
Enter passphrase (empty for no passphrase):     <== 输入密钥锁码，或直接按 Enter 留空
Enter same passphrase again:     <== 再输入一遍密钥锁码
Your identification has been saved in /root/.ssh/id_rsa.    <== 生成的私钥
Your public key has been saved in /root/.ssh/id_rsa.pub.    <== 生成的公钥
The key fingerprint is:
SHA256:K1qy928tkk1FUuzQtlZK+poeS67vIgPvHw9lQ+KNuZ4 root@localhost.localdomain
The key's randomart image is:
+---[RSA 2048]----+
|           +.    |
|          o * .  |
|        . .O +   |
|       . *. *    |
|        S =+     |
|    .    =...    |
|    .oo =+o+     |
|     ==o+B*o.    |
|    oo.=EXO.     |
+----[SHA256]-----+
```

## 添加公钥到 github\\gitlab

查看目录 `~/.ssh/` 下的 id_rsa.pub，将里面所有内容粘贴至 github、gitlab 新增 `sshkey` 配置处

## 生成多个 ssh key

```shell
ssh-keygen -t rsa -C 'xxxxx@email.com' -f ~/.ssh/github_id_rsa
```

```shell
ssh-keygen -t rsa -C 'xxxxx@email.com' -f ~/.ssh/gitee_id_rsa
```

在 ~/.ssh 目录下新建一个 config 文件，添加如下内容（其中 Host 和 HostName 填写 git 服务器的域名，IdentityFile 指定私钥的路径）

```config
# gitee
Host gitee.com
HostName gitee.com
PreferredAuthentications publickey
IdentityFile ~/.ssh/gitee_id_rsa

# github
Host github.com
HostName github.com
PreferredAuthentications publickey
IdentityFile ~/.ssh/github_id_rsa
```

<https://gist.github.com/alejandro-martin/aabe88cf15871121e076f66b65306610>

## 测试是否可以访问

```shell
$ ssh git@github.com

PTY allocation request failed on channel 0
Hi xxx! You've successfully authenticated, but GitHub does not provide shell access.
Connection to github.com closed.
```

## 存储密码

如果 ssh 方式用不了，clone http/https 模式由于一般用户进行 http 需要输入密码时间久了会提示重新输入很麻烦，我们可以设置保存密码账号到 credential 缓存起来，以后再也不用管了

### 方式 1

命令行输入

```shell
git config --global credential.helper store
```

### 方式 2

接改.gitconfig 配置 [credential] 下面内容就行了，

```txt
[user]
    name = xxx
    email = xxx
[credential]
    helper = store
```

输入一次密码就不会再要求输入，但是会生成一个.git-credentials 文件,里面记录了你的用户名和密码
