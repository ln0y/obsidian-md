---
aliases: []
tags: ['Git','date/2023-02','year/2023','month/02']
date: 2023-02-13-星期一 14:31:49
update: 2023-02-13-星期一 14:32:15
---

```sh
#!/bin/sh

git filter-branch --env-filter '

# 之前的邮箱
OLD_EMAIL="xxx"
# 修改后的用户名
CORRECT_NAME="xxx"
# 修改后的邮箱
CORRECT_EMAIL="xxx"

if [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
fi
if [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
fi
' --tag-name-filter cat -- --branches --tags
```
