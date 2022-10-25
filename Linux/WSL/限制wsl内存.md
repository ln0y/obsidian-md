---
aliases: []
tags: ['Linux/WSL','date/2022-08','year/2022','month/08']
date: 2022-08-23-星期二 16:49:42
update: 2022-08-23-星期二 16:51:15
---

## wsl2 中 Vmmem 内存溢出问题解决

1. 按下 Windows + R 键，输入 `%UserProfile%` 并运行进入用户文件夹

2. 新建文件 .wslconfig ，然后记事本编辑

3. 填入以下内容并保存, memory 为系统内存上限，这里我限制最大 4gb，可根据自身电脑配置设置

```txt
[wsl2]
memory=4GB
swap=0
localhostForwarding=true
```

4. 然后启动 cmd 命令提示符，输入 wsl --shutdown 来关闭当前的子系统

5. Docker 会提示重启即可
