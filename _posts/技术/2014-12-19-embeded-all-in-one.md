---
layout: post
title: 在华为Juno all-in-one中安装all-in-one
description: 在华为Juno all-in-one中安装all-in-one
category: 技术
---

之前团队对外推出了Juno all-in-one离线傻瓜式安装镜像和镜像的使用方法（传送门：[这里](http://lingxiankong.github.io/blog/2014/10/16/openstack-juno-allinone/)和[这里](http://lingxiankong.github.io/blog/2014/05/12/huawei-allinone-operation-guide/)）。相信很多基于Juno版本学习和开发的童鞋会有这样的需求：对很多东西尚不精通的你，对OpenStack代码一通修改，然后发现自己的环境凌乱了，多了iscsi链接，以及一些你自己暂时弄不明白的虚拟网络设备……。于是，你的第一个想法肯定是重装，反正ISO很方便。今天，孔老湿告诉你：**ISO是很方便，但是，还有更方便的方式**！

原理其实很简单，就是在你成功安装Juno后，创建虚拟机，然后再用all-in-one ISO启动虚拟机，将虚拟机数据再导出为镜像。以后，直接用镜像创建虚拟机即可，不用再等待ISO的安装了。

废话不多说，直接上图上真相。

Pre-requisite:  
你的all-in-one环境已经安装好（注意，最好是物理环境哦），各项功能都正常。

Steps:  
1、将ISO文件拷贝到你的环境上，注册为镜像  
![](/images/2014-12-19-embeded-all-in-one/1.png)

2、创建虚拟机需要用到的参数  
![](/images/2014-12-19-embeded-all-in-one/2.png)

3、创建虚拟机（flavor任意，虚拟机从cdrom启动，将系统默认安装在挂载的普通卷上，所以普通卷要预留足够的空间，我这里是9G，好像要大于5G即可，注意preserve参数），等待虚拟机创建成功。  
![](/images/2014-12-19-embeded-all-in-one/3.png)  

4、登录horizon，从控制台登录虚拟机，你会发现虚拟机已经开始自动安装系统了。  
![](/images/2014-12-19-embeded-all-in-one/4.png)

5、跟之前你安装all-in-one一样，等。系统安装完后，会自动重启准备安装OpenStack。但此时会卡在如下的步骤，因为你的用户盘上已经有了数据。但其实我们的目的达到了，现在，删除虚拟机，没错，删除虚拟机！  
![](/images/2014-12-19-embeded-all-in-one/5.png) 

	nova delete 655ef3e4-b875-4256-8f57-49e3a97ac948

6、看一下Cinder，有一个可用的普通卷（就是之前创建虚拟机时创建的卷），还记得上面有我们需要的数据么？为了能使用它创建新的虚拟机，还需要把这个卷导到Glance上才能使用。  
![](/images/2014-12-19-embeded-all-in-one/6.png) 

	cinder upload-to-image cdaf809a-9c75-4bd4-80db-c6505263aea8 all_in_one

7、等镜像上传完毕，你就可以使用这个镜像正常创建虚拟机了  

	root@openstack:~# glance image-list
	+--------------------------------------+----------------+-------------+------------------+------------+--------+
	| ID                                   | Name           | Disk Format | Container Format | Size       | Status |
	+--------------------------------------+----------------+-------------+------------------+------------+--------+
	| 7a34be83-64b5-4eb8-91ee-61586687e4f5 | all_in_one     | raw         | bare             | 9663676416 | active |
	| 74303284-f802-43fd-9990-16609a3da47a | all_in_one.iso | iso         | bare             | 764321792  | active |
	| 6957c450-6dc9-4f78-92e5-fcde904d981e | cirros         | qcow2       | bare             | 13147648   | active |
	+--------------------------------------+----------------+-------------+------------------+------------+--------+

	root@openstack:~# nova boot --flavor 3 --image 7a34be83-64b5-4eb8-91ee-61586687e4f5 --nic net-id=227a83c4-399e-4c4b-93d0-584ce5b8f52a all_in_one_test

8、故事还没有结束，进入新创建的虚拟机的控制台，是不是看到了熟悉的黑漆漆的安装界面。  
![](/images/2014-12-19-embeded-all-in-one/7.png)  

9、等待OpenStack安装完毕，现在你有了一个安装了juno all-in-one的虚拟机。总结一下，你还有什么？首先你有一个普通的cinder volume，但它上面的数据是可启动的，要把它转成镜像或赋予它可启动的属性才能使用，你可以把这个卷删除，因为你已经有了镜像；其次，你有一个镜像，你还可以使用它创建新的虚拟机，但你要等待OpenStack的安装过程。

那么，现在问题来了，如何跳过OpenStack安装过程而直接得到一个安装好all-in-one环境的虚拟机呢？留给你做作业吧。

----------

	