---
aliases: []
tags: ['Git','date/2023-02','year/2023','month/02']
date: 2023-02-19-星期日 17:23:27
update: 2023-02-19-星期日 17:37:15
---

## 设置错误的远程库怎么办？

```sh
$ git remote -v
$ git remote set-url origin {{url}}
```

## Github Fork 的项目如何更新源项目更新？

```sh
$ git remote add upstream {{url}}
# 1
$ git fetch upstream
$ git merge upstream/master
# 或者 2
$ git pull upstream main
```

## 提交信息写错了怎么办？

```sh
$ git commit --amend --only
$ git commit --amend --only -m 'xxx'
```

## 提交时用了错误的用户名或邮箱？（单次）

```sh
$ git commit --amend --no-edit --author "name <email@xxx.com>"
```

或者

```sh
$ git config --global author.name name
$ git config --global author.email email@xxx.com
$ git commit --amend --reset-author --no-edit
```

## 最后一次提交不想要了？

如果已推送。

```sh
$ git reset HEAD^ --hard
$ git push --force-with-lease [remote] [branch]
```

如果还没推送。

```sh
$ git reset --soft HEAD@{1}
```

## 提交内容需要修改怎么办？比如提交了敏感信息

修改或删除，

```sh
# 编辑后 add
$ git add sensitive_file
# 或删除
$ git rm sensitive_file
# 或只从 git 里删，但保留在本地，记得在 .gitignore 里加上他
$ git rm --cached sensitive_file
```

然后，

```sh
$ git commit --amend --no-edit
$ git push --force-with-lease origin [branch]
```

## 在上一次提交的基础上增加改动？

```sh
$ git commit --amend
```

## 放弃本地未提交的修改？

```sh
# 删除所有 staged 改动
$ git reset --hard HEAD
# 删除所有未 staged 改动
$ git clean -fd
# 加 -x 参数可删除所有 ignored 的文件
$ git clean -fdx
```

## 不小心删除了分支怎么办？

```sh
# 找到被删 branch 的 hash 值
$ git reflog
$ git checkout -b xxx
$ git reset --hard {{hash}}
```

## 删除分支？

```sh
# 删除远程分支
$ git push origin --delete foo
# 删除本地分支
$ git branch -d foo
# 删除没有被合并的分支要用 -D
$ git branch -D foo
# 批量删除分支
$ git branch | grep 'fix/' | xargs git branch -d
```

## 在错误的分支上做了修改但未提交？

```sh
$ git stash
$ git checkout correct_branch
$ git stash pop
```

## 在错误的分支上做了修改同时已提交？（比如错误地提交到了主干）

```sh
# 新建分支
$ git branch xxx
# 删除 master 分支的最后一次 commit
$ git reset HEAD~ --hard
# 删除的 commit 会切换到 xxx 分支上
$ git checkout xxx
```

## 如何撤销一个之前的提交？

```sh
# 找到要撤销的 commit hash
$ git log 或 git reflog
# 回滚
$ git revert {{hash}}
```

## 如何撤销某一个文件的修改

checkout 才是撤销文件的最佳选择？

```sh
# 找到要文件修改的前一个 commit hash
$ git log 或 git reflog
# 回滚文件
$ git checkout {{hash}} path/to/file
```

## git 被我搞乱了，想要重新来过？

你可以这样，

```sh
$ cd ..
$ rm -rf fucking-repo-dir
$ git clone https://github.com/fucking-repo-dir.git
$ cd fucking-repo-dir
```

也可以这样，

```sh
$ git fetch origin
$ git checkout master
$ git reset --hard origin/master
```
