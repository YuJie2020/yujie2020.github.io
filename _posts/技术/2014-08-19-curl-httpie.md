---
layout: post
title: cURL和HTTPie
description: cURL和HTTPie
category: 技术
---

前两天在网上看到一个号称比cURL更牛逼的命令行工具[HTTPie][]，提供命令行交互方式来访问HTTP服务。其实我本人平常用cURL就比较少(因为喜欢GUI界面)，但还是经受不住好奇心的驱使，晚上回家连上VPN，在服务器上简单试了一下--HTTPie果然强大。

## cURL
先说cURL的基本使用方法，`curl -X METHOD -H HEADER -i`，后面的`-i`是表示显示返回消息的头部，如果你使用cURL访问OpenStack，那么这个选项在获取UUID类型的token时必不可少。

为了使用cURL访问OpenStack，我们先创建一个文件/opt/temp/auth.json，内容为：

    {
    	"auth": {
    		"identity": {
    			"methods": ["password"],
    			"password": {
    				"user": {
    					"id": "54cce50afba748889017143c7dda0bc9",
    					"password": "passwd"
    				}
    			}
    		},
    		"scope": {
    			"project": {
    				"domain": {
    					"name": "Default"
    				},
    				"name": "admin"
    			}
    		}
    	}
    }

熟悉OpenStack的童鞋可以看出来，这就是发送到Keystone V3获取租户token的请求消息体，我这里使用admin租户，用户id和password请根据你的实际环境修改。

有了请求消息体，我们使用cURL发送消息：

    curl -i -X POST -H "Content-Type: application/json" -d @/opt/temp/auth.json http://10.250.10.233:35357/v3/auth/tokens
    
这里-d后面表示请求消息体，如果消息体在文件中，那么使用@符号作为前缀对文件进行读取。返回如下：  
![](/images/2014-08-19-curl-httpie/1.png)  
再来查询一下环境中的虚拟机：  

    curl -i -X GET -H "Content-Type: application/json" -H "X-Auth-Token:0a9d6927b0b447e0a8f1dbdd98ebfd81" http://10.250.10.233:8774/v2/1239a5497568464b89688806afe11f7c/servers

![](/images/2014-08-19-curl-httpie/2.png)  

虽然消息正常返回，但看起来很乱，返回的json消息体也不方便阅读，如果想从返回消息体中获取一些信息是比较困难的。

下面该HTTPie上场了！

## HTTPie

先安装。`pip install httpie`。

> HTTPie基于python编写，内部使用了Requests和Pygments库。

HTTPie的用法要比cURL直观很多，没有那么多选项，基本上心里怎么想就怎么写，默认输入和输出都是json格式 (而cURL必须要指定`-H "Content-Type: application/json"`)，具体可查阅[HTTPie][]的文档。

同样是实现上面的获取token和查询虚拟机的功能，使用HTTPie的体验如下。  
我们仍然使用/opt/temp/auth.json文件作为请求消息体，命令如下：

    http POST http://10.250.10.233:35357/v3/auth/tokens @/opt/temp/auth.json
    http GET http://10.250.10.233:8774/v2/1239a5497568464b89688806afe11f7c/servers X-Auth-Token:df76d62a729f4544a9225f4a8d2bfa1a

直接上图：  
![](/images/2014-08-19-curl-httpie/3.png)  
![](/images/2014-08-19-curl-httpie/4.png)

看到了吧！HTTPie返回的消息体自动做了高亮和格式化！

但是如果PUT操作呢？消息体该如何写？其实也很简单，举个例子：  

    http PUT api.example.com/person/1 name=John age:=29 married:=false hobbies:='["http", "pies"]'

`name:=value`这种格式表示非string的值。

## 小结
这篇文章的目的是为了抛砖引玉，在实际使用中cURL和HTTPie都有很多高级用法，我这里仅仅是最简单的使用场景(但其实对于访问OpenStack来说，似乎足够了)。从实验结果上看，虽然HTTPie确实比cURL强大很多，但对于我个人而言，始终不喜欢命令行操作，可能有些人觉得我不够“极客”，但我确实觉得有些事情使用命令行效率太低。相比于cURL和HTTPie，chrome下的Postman才是我的最爱。

[HTTPie]: https://github.com/jakubroztocil/httpie
