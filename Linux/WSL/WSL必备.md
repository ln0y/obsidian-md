---
aliases: []
tags: ['Linux/WSL', 'date/2022-09', 'year/2022', 'month/09']
date: 2022-09-17-星期六 16:49:37
update: 2022-09-17-星期六 17:16:07
---

## 替换 apt 源

![[ubuntu镜像源]]

## 更新 apt

```shell
sudo apt update
sudo apt dist-upgrade
```

## 配置代理

![[wsl通过本机cfw代理]]

## 安装 zsh

https://github.com/ohmyzsh/ohmyzsh/wiki/Installing-ZSH#ubuntu-debian--derivatives-windows-10-wsl--native-linux-kernel-with-windows-10-build-1903

```shell
sudo apt install zsh
```

## 安装 ohmyzsh

https://github.com/ohmyzsh/ohmyzsh#basic-installation

| Method    | Command                                                                                           |
| --------- | ------------------------------------------------------------------------------------------------- |
| **curl**  | `sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"` |
| **wget**  | `sh -c "$(wget -O- https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"`   |
| **fetch** | `sh -c "$(fetch -o - https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"` |

## 安装 zsh 主题 p10k

https://github.com/romkatv/powerlevel10k#oh-my-zsh

1. Clone the repository:

```shell
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
```

Users in mainland China can use the official mirror on gitee.com for faster download.

中国大陆用户可以使用 gitee.com 上的官方镜像加速下载.

```shell
    git clone --depth=1 https://gitee.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
```

2. Set `ZSH_THEME="powerlevel10k/powerlevel10k"` in `~/.zshrc`.

## 安装 zsh 插件

```txt
plugins=(
  git
  pip
  npm
  yarn
  vscode
  sudo
  alias-finder
  minikube
  web-search
  zsh-autosuggestions
  zsh-syntax-highlighting
)
```

### zsh-autosuggestions

https://github.com/zsh-users/zsh-autosuggestions/blob/master/INSTALL.md#oh-my-zsh

1. Clone this repository into `$ZSH_CUSTOM/plugins` (by default `~/.oh-my-zsh/custom/plugins`)

```shell
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```

2. Add the plugin to the list of plugins for Oh My Zsh to load (inside `~/.zshrc`):

```shell
plugins=(
    # other plugins...
    zsh-autosuggestions
)
```

3. Start a new terminal session.

### zsh-syntax-highlighting

1. Clone this repository in oh-my-zsh's plugins directory:

```shell
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

2. Activate the plugin in `~/.zshrc`:

```shell
plugins=( [plugins...] zsh-syntax-highlighting)
```

3. Restart zsh (such as by opening a new instance of your terminal emulator).

## 开启 systemd

目前需要我们手动配置开启 systemd，即在 WSL 启动时执行 wsl-systemd 即可 [3](https://blog.csdn.net/qq_32114645/article/details/124548058#fn3)：

```shell
sudo vim /etc/wsl.conf
```

在这份配置文件中加上下面的配置：

```txt
[boot]
command="/usr/libexec/wsl-systemd"
```

最后重启 WSL2

## 开启 snap

```shell
echo 'export PATH=$PATH:/snap/bin\n' >> ~/.zshrc
echo 'export PATH=$PATH:/snap/bin\n' >> ~/.bashrc
```

## 限制 wsl 内存

![[限制wsl内存]]

## wsl 新增普通用户

root 下：

```shell
useradd -m [username] -s /bin/bash
vi /etc/sudoers
```

```txt
# User privilege specification
root        ALL=(ALL:ALL) ALL
[username]  ALL=(ALL:ALL) ALL
```

wsl 切换默认用户：

powershell 下

```shell
ubuntu2204 config --default-user [username]
```

## wsl 设置 root 密码

默认的 wsl 没有设置 root 密码，需要通过下面的命令来设置 root 密码：

```shell
sudo passwd root
```
