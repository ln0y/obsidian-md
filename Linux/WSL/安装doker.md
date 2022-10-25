---
aliases: []
tags: ['Linux/WSL', 'date/2022-08', 'year/2022', 'month/08']
date: 2022-08-14-星期日 21:24:44
update: 2022-09-19-星期一 10:11:34
---

## 安装

[官网安装方法](https://docs.docker.com/engine/install/ubuntu/)

先更新包

```shell
sudo apt-get update
```

创建 `install-docker.sh` 脚本，内容在下边：

```shell
# install docker
curl -fsSL get.docker.com -o get-docker.sh
sh get-docker.sh

if [ ! $(getent group docker) ];
then
    sudo groupadd docker;
else
    echo "docker user group already exists"
fi

sudo gpasswd -a $USER docker
sudo service docker restart

rm -rf get-docker.sh
```

执行脚本

```shell
sh install-docker.sh
```

查看 docker 是否安装成功

```shell
docker -v
```

## 启动 docker

```shell
sudo service docker start
```

查看 docker 是否启动

```shell
docker version
```

有 Server 信息代表启动成功

尝试拉取 nginx 镜像

```shell
docker pull nginx
```

拉取失败可以尝试添加 [[#docker 添加仓库镜像|镜像地址]]

查看镜像

```shell
docker images
```

创建容器

```shell
docker run -d -p 80:80 nginx
```

查看容器

```shell
docker ps
```

## docker 添加仓库镜像

### 修改配置文件

```shell
vi /etc/docker/daemon.json
```

#### 国内加速地址

1. [Docker](https://so.csdn.net/so/search?q=Docker&spm=1001.2101.3001.7020) 中国区官方镜像
   https://registry.docker-cn.com

2. 网易
   http://hub-mirror.c.163.com

3. ustc 
   https://docker.mirrors.ustc.edu.cn

4. 中国科技大学 to
   https://docker.mirrors.ustc.edu.cn

5. [Azure 中国镜像](https://github.com/Azure/container-service-for-azure-china/blob/master/aks/README.md#22-container-registry-proxy)
   https://dockerhub.azk8s.cn

6. [七牛云加速器](https://kirk-enterprise.github.io/hub-docs/#/user-guide/mirror)
   https://reg-mirror.qiniu.co

可以选择其中几个镜像地址，文件内容如下：

```json
{
  "registry-mirrors": [
    "https://registry.docker-cn.com",
    "https://dockerhub.azk8s.cn",
    "https://hub-mirror.c.163.com"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  }
}
```

### 重启 docker

```shell
sudo service docker restart
```

查看是否成功

```bash
docker info
```

## docker 遇到的问题

[(using WSL ubuntu app) system has not been booted with system as init system (PID 1). Can't operate](https://stackoverflow.com/questions/52604068/using-wsl-ubuntu-app-system-has-not-been-booted-with-system-as-init-system-pi)

### 遇到问题：Cannot connect to the Docker daemon

```shell
Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?
```

解决方法：

```shell
systemctl start docker
```

如果遇到问题：

### 遇到问题：System has not been booted with systemd as init system (PID 1)

```shell
System has not been booted with systemd as init system (PID 1). Can't operate.
```

输入如下命令

```shell
 ps -p 1 -o comm=
```

如果返回 init，则执行下面命令即可解决

### 遇到问题：Docker must be run as root

```shell
 service docker start
 * Docker must be run as root
```

使用 sudo 权限即可：

```
 sudo service docker start
 * Starting Docker: docker
```

将当前用户添加到 docker 用户组

**为了避免每次使用 docker 命令都需要加上 sudo 权限，可以将当前用户加入安装中自动创建的 docker 用户组 (可以参考官方文档)：**

```shell
sudo usermod -aG docker $USER
```

然后查看一下镜像，执行成功

```shell
docker images
```

### docker 命令报错，只能通过 sudo 命令执行

Got permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: Get "http://%2Fvar%2Frun%2Fdocker.sock/v1.24/version": dial unix /var/run/docker.sock: connect: permission denied

在用户权限下 docker 命令需要 sudo 否则出现以下问题

通过将用户添加到 docker 用户组可以将 sudo 去掉，命令如下

1. 添加 docker 用户组

```bash
sudo groupadd docker
```

2. 将登陆用户加入到 docker 用户组中

```bash
sudo gpasswd -a $USER docker
```

3. 更新用户组

```bash
newgrp docker
```

### iptables 功能报错

[https://www.ichenfu.com/2021/10/23/wsl2-ubuntu-dockerd-iptables-problem/](<WSL2 Ubuntu 21.04原生Docker无法运行的问题>)

> Ubuntu 从 20.10 开始，将默认的防火墙切换到了 `nftables` 实现，这个实现需要 5.8 版本及以上的内核，而微软在 WSL2 中提供的 5.4 版本的内核没有 `nftables`，所以导致 iptables 功能出错了。

解决方法也简单，直接把 `iptables` 实现切换回 `iptables-legacy` 就好了：

```bash
~]# sudo update-alternatives --config iptables
There are 2 choices for the alternative iptables (providing /usr/sbin/iptables).

  Selection    Path                       Priority   Status
------------------------------------------------------------
* 0            /usr/sbin/iptables-nft      20        auto mode
  1            /usr/sbin/iptables-legacy   10        manual mode
  2            /usr/sbin/iptables-nft      20        manual mode

Press <enter> to keep the current choice[*], or type selection number: 1
update-alternatives: using /usr/sbin/iptables-legacy to provide /usr/sbin/iptables (iptables) in manual mode
```
