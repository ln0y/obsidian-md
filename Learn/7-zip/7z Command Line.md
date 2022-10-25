---
aliases: []
tags: ['Learn/7-zip','date/2022-03','year/2022','month/03']
date: 2022-03-13-Sunday 16:22:57
update: 2022-03-13-Sunday 16:44:17
---

## 简介

7z，全称7-Zip， 是一款开源软件。是目前公认的压缩比例最大的压缩解压软件。
链接：[7z中文主页](https://sparanoid.com/lab/7z/)

## 安装和使用

Windows去[官网下载](https://sparanoid.com/lab/7z/download.html)安装包安装

linux使用命令安装：`sudo apt install p7zip-full`

**注:**

- p7zip、p7zip-full和p7zip-rar三个版本的区别：
- p7zip和p7zip-full之间的区别在于p7zip是较轻的版本，仅支持.7z，而完整版本支持更多7z压缩算法（用于音频文件等）。
- p7zip-rar软件包提供对7z的RAR文件的支持，在大多数情况下，安装p7zip-full应该足够了。

7z命令行的使用格式： `7z <command> [<switch>...] <base_archive_name> [<arguments>...]`
这里有两个参数是必须的，`command` 和`base_archive_name`,对应操作和生成的压缩文件(或解压文件)的路径
如果访问不到7z命令需要添加环境变量

## command(命令)

command即第一个参数：

| command | 说明                                   |
| ------- | -------------------------------------- |
| a       | 添加文件的压缩包，或者创建新的压缩包。 |
| d       | 从压缩包中删除文件。                   |
| e       | 从压缩包中提取。                       |
| t       | 测试压缩包的是否出错。                 |
| u       | 更新压缩包中的文件。                   |

## switch(命令对应的参数)

由于command很多，而其对应的switch也不尽相同。

### 常用的switch

| 名称 | 说明                                                                                                        | 简单例子(只展示参数部分)                     |
| ---- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| \-m  | 压缩方法，有：Zip、GZip、BZip2、7z、XZ..很多                                                                | `-mx5` `见补充`                              |
| \-t  | 压缩包格式,压缩时可以指定分卷压缩， 有\*, \#（单独打开一个分卷）, 7z, xz, split, zip, gzip, bzip2, tar, .... | `-t7z`                                       |
| \-p  | 设置密码                                                                                                    | `-p123456`                                   |
| \-r  | 递归子目录，有-r、-r-、-r0                                                                                  | `-r src\*.cpp src\*.h`只压缩cpp和h格式的文件 |

## 实例

## 1 压缩

测试文件夹的tree：

```plain
subdir
│  test.py
│
├─ab
│  │  forward.exe
│  │
│  └─sub2
│          ss.doc
│
├─av
│      live.py
│
└─new
        music.py
		
```

### 普通压缩

`7z a archive1.zip subdir\`
把subdir（包括subdir本身）进行压缩，生成文件archive1.zip

### 同时压缩多个目录

`7z a archive.zip subdir\av subdir\ab`
同时subdir\\av、subdir\\ab两个压缩到archive.zip下

### 筛选压缩

`7z a file.7z subdir\*.py`
使用的是简单的`*`作为通配符。此时file.7z里只有subdir和subdir内的`test.py`

### 指定密码压缩

`7z a file.7z subdir\* -p123456`
压缩subdir内的所有文件，并指定密码为123456.但是没有隐藏内部的文件名（7z是可以隐藏压缩文件内部的文件名的）

### 指定密码压缩--隐藏文件名版

`7z a file.7z subdir\* -p123456 -mhe`
和上一个版本的唯一区别是隐藏了压缩文件内部的文件名。

### 分卷压缩

`7z a file.7z subdir\* -v1K`
指定分卷大小为1K，还可以指定其他单位（M、G...）。大小写不敏感。

### 其他

如分卷压缩+指定密码等组合性的指令不做演示。可以根据参数的使用方法自由组合

## 2 解压

### 普通解压

`7z x file.7z`
解压到当前目录

### 解压到指定目录

`7z x file.7z -ofile/`
将file.7z解压到当前目录的file文件夹下（不存在是会自动创建）
使用-o解压到指定目录

### 解压特定文件

`7z x file.7z -ofile/ *.py -r`
解压以.py结尾的文件到file文件夹下，注意加上-r（递归目录）。

### 解压分卷

_前提：分卷是完整的_
`7z x file.7z.001`

**注意：**

> 分卷在同一目录下（使用这个命令是这样的，其他的不知道）
> 解压的是第一个分卷即xxx.001

### 解压带密码的压缩包

`7z x file.7z -p123456`
解压file.7z，密码为123456

### 跳过确认输入的参数

\-y：所有确认选项都默认为是（即不出现确认提示），重复文件时会覆盖
\-aos：跳过已存在的文件

## 3 删除

`7z d file.7z *.py -r`
删除file.7z内以.py结尾的文件，注意不要忘了 -r

`7z d file.7z *.py -r -p123456`
带密码版

## 4 更新

`7z u file.7z *.py`
添加.py结尾的文件到file.7z内

`7z u file.7z *.py -p123456`
带密码版

## 补充

**m参数的使用**

m即是压缩模式，这里展示一下7z的压缩模式，格式`-mxN` N=0~9.

上图：
![[Pasted image 20220313164026.png]]

以上6个级别分别对应着图形界面的：仅存储、极速压缩、快速压缩、标准压缩、最大压缩、极限压缩。

## 更多请看7z的帮助文档

![[Pasted image 20220313164302.png]]
