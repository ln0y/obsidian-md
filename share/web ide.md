---
aliases: []
tags: ['share', 'date/2024-05', 'year/2024', 'month/05']
date: 2024-05-27-星期一 14:33:30
update: 2024-05-28-星期二 18:28:28
---

|     产品      | code-server                                                                 | theia                                                                             | sumi                                                                    | Gitpod                                                                     |     |
| :---------: | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------- | --- |
|     官网      | <https://coder.com/>                                                        | <https://theia-ide.org/>                                                          | <https://opensumi.com/zh>                                               | <https://www.gitpod.io/>                                                   |     |
|     文档      | <https://coder.com/docs/code-server>                                        | <https://theia-ide.org/docs/>                                                     | <https://opensumi.com/zh/docs/integrate/overview>                       | <https://www.gitpod.io/docs/introduction>                                  |     |
|    是否开源     | Y                                                                           | Y                                                                                 | Y                                                                       | Y                                                                          |     |
|   Github    | <https://github.com/coder/code-server>                                      | <https://github.com/eclipse-theia/theia>                                          | <https://github.com/opensumi/core>                                      | <https://github.com/gitpod-io/gitpod>                                      |     |
|    Star     | ![GitHub Repo stars](https://img.shields.io/github/stars/coder/code-server) | ![GitHub Repo stars](https://img.shields.io/github/stars/eclipse-theia/theia)<br> | ![GitHub Repo stars](https://img.shields.io/github/stars/opensumi/core) | ![GitHub Repo stars](https://img.shields.io/github/stars/gitpod-io/gitpod) |     |
|    Issue    | ![](https://img.shields.io/github/issues/coder/code-server?color=0088ff)    | ![](https://img.shields.io/github/issues/eclipse-theia/theia?color=0088ff)        | ![](https://img.shields.io/github/issues/opensumi/core?color=0088ff)    | ![](https://img.shields.io/github/issues/gitpod-io/gitpod?color=0088ff)    |     |
| Multiplayer | N (Y for [coder](https://coder.com/blog/code-server-multiple-users))        |                                                                                   |                                                                         |                                                                            |     |
|  二次开发难度&接入  | 难                                                                           |                                                                                   |                                                                         |                                                                            |     |
|     优点      |                                                                             |                                                                                   |                                                                         |                                                                            |     |
|     缺点      |                                                                             |                                                                                   |                                                                         |                                                                            |     |

## code-server & coder

### 安装

要求：

- 一个运行 Linux 的服务器
- 1 GB 内存
- 2 核 CPU

#### install.sh

安装 `code-server` 的最简单方法是使用安装脚本。如果可能，安装脚本会尝试使用系统软件包管理器。

```sh
curl -fsSL https://code-server.dev/install.sh | sh
```

您可以通过加入以下一个或多个标记来修改安装过程：

- `--dry-run`：不运行安装过程的命令
- `--method`：选择安装方法
  - `--method=detect`：检测软件包管理器，但回退到 `--method=standalone`
  - `--method=standalone`：将独立发行版压缩包安装到 `~/.local`
- `--prefix=/usr/local`：在整个系统中安装独立的发布压缩包。
- `--version=X.X.X`：安装 `X.X.X` 版本，而非最新版本。
- `--help`：查看使用文档。
- `--edge`：安装最新的边缘版本（即预发布版本）

#### Standalone releases

在 [GitHub](https://github.com/coder/code-server/releases) 上发布每个版本的独立 `.tar.gz` 压缩包。这些压缩包捆绑了 node 二进制文件和 node 模块。

在 Linux 上，使用独立版本的唯一要求是 `glibc >= 2.28` 和 `glibcxx >= v3.4.21`（对于 macOS，没有最低系统要求）。

安装步骤：

1. 从 GitHub 下载适用于你的系统的最新发行版本
2. 解压发行版本
3. 执行 `./bin/code-server` 运行 `code-server`

您可以在 `$PATH` 中添加 `./bin/code-server`，这样就可以执行 `code-server`，而无需每次都提供完整路径。

以下是在 Linux 上安装和使用独立 `code-server` 版本的示例脚本：

```sh
mkdir -p ~/.local/lib ~/.local/bin
curl -fL https://github.com/coder/code-server/releases/download/v$VERSION/code-server-$VERSION-linux-amd64.tar.gz \
  | tar -C ~/.local/lib -xz
mv ~/.local/lib/code-server-$VERSION-linux-amd64 ~/.local/lib/code-server-$VERSION
ln -s ~/.local/lib/code-server-$VERSION/bin/code-server ~/.local/bin/code-server
PATH="~/.local/bin:$PATH"
code-server
# Now visit http://127.0.0.1:8080. Your password is in ~/.config/code-server/config.yaml
```

#### docker

```sh
# This will start a code-server container and expose it at http://127.0.0.1:8080.
# It will also mount your current directory into the container as `/home/coder/project`
# and forward your UID/GID so that all file system operations occur as your user outside
# the container.
#
# Your $HOME/.config is mounted at $HOME/.config within the container to ensure you can
# easily access/modify your code-server config in $HOME/.config/code-server/config.json
# outside the container.
mkdir -p ~/.config  # 创建一个配置目录，如果它还不存在的话

docker run -it --name code-server -p 127.0.0.1:8080:8080 \  # 使用Docker运行一个新容器，并命名为code-server
  -v "$HOME/.local:/home/coder/.local" \  # 将宿主机的$HOME/.local目录挂载到容器的/home/coder/.local
  -v "$HOME/.config:/home/coder/.config" \  # 将宿主机的$HOME/.config目录挂载到容器的/home/coder/.config
  -v "$PWD:/home/coder/project" \  # 将当前工作目录挂载到容器的/home/coder/project
  -u "$(id -u):$(id -g)" \  # 设置容器内的用户ID和组ID，使其与宿主机的当前用户相匹配
  -e "DOCKER_USER=$USER" \  # 设置环境变量DOCKER_USER为当前用户
  codercom/code-server:latest  # 指定要运行的Docker镜像
```

#### npm

如果通过 `npm` 安装 `code-server`，则需要安装额外的依赖项，以便构建 VS Code 使用的本地模块。

> [!warning]+ 警告
> 请勿使用 `yarn` 安装 `code-server`。与 `npm` 不同，它不尊重分布式应用程序的锁定文件。它会使用安装时可用的最新版本，而这可能不是特定代码服务器发布时使用的版本，并可能 [导致意外行为](https://github.com/coder/code-server/issues/4927)。

##### Nodejs

我们使用的 Node.js 主版本与 Code's remote 版本相同，目前为 `18.x`。VS Code 还列出了 [Node.js 的要求](https://github.com/microsoft/vscode/wiki/How-to-Contribute#prerequisites)。

##### Ubuntu, Debian

```bash
sudo apt-get install -y \
  build-essential \
  pkg-config \
  python3
npm config set python python3
```

继续 [安装](#npm%20安装)

##### Fedora, CentOS, RHEL

```bash
sudo yum groupinstall -y 'Development Tools'
sudo yum config-manager --set-enabled PowerTools # unnecessary on CentOS 7
sudo yum install -y python2
npm config set python python2
```

继续 [安装](#npm%20安装)

##### Windows

安装 `code-server` 需要 [VS Code 开发的所有先决条件](https://github.com/Microsoft/vscode/wiki/How-to-Contribute#prerequisites)。安装 C++ 编译器工具链时，建议使用 " Option 2: Visual Studio 2019"，以获得最佳效果。

##### npm 安装

接下来，用以下命令安装 `code-server`

```sh
npm install --global code-server
code-server
# Now visit http://127.0.0.1:8080. Your password is in ~/.config/code-server/config.yaml
```

#### Helm

### 安装过程

演示安装环境：

```
Linux Lin 5.15.146.1-microsoft-standard-WSL2 #1 SMP Thu Jan 11 04:09:03 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux
Ubuntu 22.04.4 LTS
```

使用 [install.sh](share/web%20ide.md#install.sh) 方法安装

![](_attachment/img/ccdf20517300afe21fb79d01fdb14922_MD5.png)

运行 `code-server` 启动

> 使用 `sudo systemctl start code-server@$USER` 不需要进程守护

![](_attachment/img/c52ad9372a6bdaee97bb9d9d82d0fcbe_MD5.png)

启动成功后访问 `http://127.0.0.1:8080/`

![](_attachment/img/8bb8e93ce6f5385e6bf4daf153ec8f8e_MD5.png)

访问密码在 `~/.config/code-server/config.yaml` 配置文件

![](_attachment/img/8d0e59d907855f0824c11ea4a32f2fc2_MD5.png)

输入密码后访问成功

![](_attachment/img/8dfc20cc67cfc80089fe86be153d2786_MD5.png)

安装中文插件

![](_attachment/img/fa9347240daf10208dceda9ddbd539b5_MD5.png)

打开项目

![](_attachment/img/b53e27b90ea37f03f0a6f9d20fa63e2a_MD5.png)

## theia

## sumi
