---
aliases: []
tags:
  - Git
  - date/2023-11
  - year/2023
  - month/11
date: 2023-11-22-星期三 11:17:28
update: 2023-11-22-星期三 15:10:44
---

## gitflow

gitflow 的标准作业流程：

[图解git flow开发流程 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/198066289)

## 区别

标准的 gitflow 流程多一个 dev 分支，说白了这个分支就是用来开发使用的，也就是要开发新功能从 dev 检出，这个最规范的 gitflow 流程相对复杂一些，我们做一点简化，去掉了 dev 分之，默认新功能通过 master 检出

master 永远为最新的代码

新功能或者 bug 修复代码统一从 master 检出

## 规范

### branch

> 每个 repo 有且仅有以下的 branch 和 tag。

Branch: `master`、`feat`、`test`、`release`、`hotfix`

其中：

- `master` 受保护，不直接提交代码，所有的 上线文件 需要推送到此分支，发布至线上后需打 `tag`。
- `feat` 分支需要从 `master` 或 `release` 切出，然后开发完成后，提交合并请求到 `test` 分支进行提测。bug 修复在此分支中进行，修复完成后合并进 `test` 分支进行多轮测试。
- `test` 分支需要从 `feat` 切出，用来对项目中各个需求进行合并提测，需要提测才合并至此分支，用于保证测试环境的稳定，同时测试环境的自动构建也可以监听此分支。
- `release` 受保护，不直接提交代码，分支需要从 `test` 分支 `merge request`，用来进行灰度测试或预生产环境测试，预生产环境的自动构建也可以监听此分支，测试成功后，提交合并请求到 `master`。
- `hotfix` 分支通常用于修复线上 bug，需要 `master` 切出，待 bug 修复完成测试后合并至 `master`。

#### 命名规范

**新功能、迭代**

`feat-功能名称-xxx(名称拼音简写)-年月日`

**紧急 bug 修复**

`hotfix-bug 名称 or bug id-xxx(名称拼音简写)-年月日`

**转测**

`test-功能名称-xxx(名称拼音简写)-年月日`

**预生产、灰度**

`release-功能名称-xxx(名称拼音简写)-年月日`

**线上生产**

master

### tag

对应每个发布版本的上线 tag。tag 版本号与需求版本一致，命名 `dist_功能名称_版本号_日期`，如：`dist_1.0_20200426`、`dist_MVP_1.0_20200426`

## 开发流程

- 从 `master` 或 `release` 分支根据需求，检出分支 `feat-xxx-20231122`，即 `master --> feat-xxx-20231122`
- 开发完成后将开发分支（`feat`）检出分支 `test-xxx-20231122` 进行提测，即 `feat-xxx-20231122 --> test-xxx-20231122`。如果存在多个同时进行的 `feat` 分支需要一起提测可合并至同一个 `test` 分支进行提测。
- 测试中的 `bugfix` 在相应对的 `feat` 分支中进行，在进行下一轮测试前合并至 `test` 分支。
- 多轮测试重复 2、3 步，直至达成测试标准。
- 测试通过后，发起 `merge request`，待 `code review` 通过后，负责人 `merge` 代码，即 `test-xxx-20231122 --> release-xxx-20231122`

## 上线流程

- `release` 作为 `预生产环境`/`灰度环境` 同样受到保护，不能直接进行提交，需要进行 `merge request`，由负责人 `code review` 后进行 `merge`。
- 期间 `master` 可能存在 `hotfix` 可能会与当前 `release` 产生冲突或问题，还需将 `master` 合并至 `release` 进行后续流程。
- 确保所有研发分支都已经 `merge` 到 `release`。
- 使用 `release branch` 的代码进行测试，如果发现 bug，把对应的 `bugfix merge` 到 `test`，测试成功后在合并至 `release` 分支。
- 达到发版标准后，将 `release` 分支合并至 `master` 分支，并打上 `tag`。

## bugfix 流程

- `feat` 分支中的 bug，直接在 `feat-xxx` 分支修复。
- `release` 分支中的 bug，在对应的 `feat-xxx` 分支修复，合并进 `test-xxx` 分支进行修复，最后在 `merge` 回 `release` 分支。
- 修复线上 bug 通常从 `master` 分支检出分支 `hotfix-bugxxx-20231122`，待 bug 修复完成测试后，通常有 2 种发版情况：
  1. 跟版本发布就合并至 `release` 分支后续流程跟 `release` 走。
  2. 直接发布就提交合并请求到 `master` 分支，发布后需打 `tag`。

## Git 常用操作小技巧

<https://github.com/k88hudson/git-flight-rules/blob/master/README_zh-CN.md>
