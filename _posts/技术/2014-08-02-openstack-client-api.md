---
layout: post
title: 如何开始使用OpenStack命令行和API
description: 如何开始使用OpenStack命令行和API
category: 技术
---

当你开始使用OpenStack，基本上都是从一个已搭建好的环境入手，别人(operator)会告诉你horizon登录的租户名、用户名和密码。  
![horizon登陆页](/images/2014-08-02-openstack-client-api/1.png)

但毕竟horizon不会封装OpenStack的所有特性，当你已经玩腻了页面上那些功能时，你想尝试更多更丰富的功能，那么恭喜你，你已经向中级玩家迈进了一步。中级玩家对OpenStack的使用基本上有[四种方式](http://docs.openstack.org/api/quick-start/content/)：

* OpenStack client
* cURL
* Rest API
* OpenStack SDK

我个人比较倾向于使用client和API，因为cURL的用法其实跟发送RestAPI相似，但cURL不太方便操作(因为我们普遍都喜欢在可视化页面点击按钮)；而SDK则更多是基于OpenStack做应用时会用到，这些人一般不会关注OpenStack的内部机制。

好，你费尽心机跟operator讲好话，跟他说：哥，求求你，让我登陆后台玩玩吧! 当operator吃完你送的冰激凌，抹了一下嘴角，然后潇洒的扔了一个IP给你，“拿去耍吧”。你反复背诵着节点登陆的用户名和密码(注意，这跟horizon登陆的用户名密码不是一个东西)，小心谨慎的进了让每个程序员都感到神秘的后台，然后，快速敲了一个命令并回车：

    [root@node-2 ~]# nova list
    ERROR: You must provide a username via either --os-username or env[OS_USERNAME]

shit! 怎么回事？!一个ERROR可能让你慌了神。你平复了一下心情，心想：一定是老子敲命令的姿势不对，再试一次，这次用其他命令：

    [root@node-2 ~]# keystone tenant-list
    Expecting an auth URL via either --os-auth-url or env[OS_AUTH_URL]
    
天呐! 呜呼一声，你已然跪了……眼角斜了斜operator，他匆忙的背影让你失去了打扰他的信心，又摸了摸兜里仅剩的1块硬币，准备打退堂鼓。

等等! 请看完我的blog，会让你起死回生的。

## 找到rc文件
找了半天资料，你可能已经知道你需要的就是一个文件，然后source一下。但文件的内容从哪里来？因为你到目前为止只知道horizon登录的用户名和密码。好，我现在告诉你：

第一步，登录horizon，进入下图所示的页面。  
![](/images/2014-08-02-openstack-client-api/2.png)

看到那个“下载OpenStack RC文件”的按钮了么？看到了么？看到了么？别光顾着点头了，还等啥？!  

打开下载的文件(这里举个例子，我以admin用户登录的)，对内容稍作修改(主要是最后那个password，改成你登录horizon的密码，其他内容不要改)：

    #!/bin/bash
    
    # With the addition of Keystone, to use an openstack cloud you should
    # authenticate against keystone, which returns a **Token** and **Service
    # Catalog**.  The catalog contains the endpoint for all services the
    # user/tenant has access to - including nova, glance, keystone, swift.
    #
    # *NOTE*: Using the 2.0 *auth api* does not mean that compute api is 2.0.  We
    # will use the 1.1 *compute api*
    export OS_AUTH_URL=http://119.81.159.110:5000/v2.0
    
    # With the addition of Keystone we have standardized on the term **tenant**
    # as the entity that owns the resources.
    export OS_TENANT_ID=6d0dff68ecd24215bd971a8d1935ba03
    export OS_TENANT_NAME="admin"
    
    # In addition to the owning entity (tenant), openstack stores the entity
    # performing the action as the **user**.
    export OS_USERNAME="admin"
    export OS_PASSWORD="tUWkuBpN"
    
好了，现在你可以登录后台，新建一个文件，然后把上面的内容复制进去，执行久违的source，然后再次运行命令：

    [root@node-2 ~]# vi ~/openrc
    [root@node-2 ~]# source ~/openrc 
    [root@node-2 ~]# nova list
    
    [root@node-2 ~]# keystone tenant-list
    +----------------------------------+----------+---------+
    |                id                |   name   | enabled |
    +----------------------------------+----------+---------+
    | 6d0dff68ecd24215bd971a8d1935ba03 |  admin   |   True  |
    | d1f2d43d358743eda4e37bfd489c1163 | services |   True  |
    +----------------------------------+----------+---------+
    [root@node-2 ~]# 

呵呵，别亲我？！别动我！！

## Rest API
虽然使用命令行已经很接近OpenStack的本质了，但别忘了，命令行毕竟也是一种封装，如果你想玩的再透一些，Rest API是个不错的选择，使用Rest API之后，OpenStack在你面前基本上就是裸奔了。

关于API的使用我不做过多说明，因为在我之前的blog和topic里面已经说过太多次了，看一看下面的截图，你自己再稍微google一下，就什么都明白了。  
![](/images/2014-08-02-openstack-client-api/3.png)




