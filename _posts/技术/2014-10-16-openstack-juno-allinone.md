---
layout: post
title: OpenStack Juno 版本 All-in-one 离线安装指导
description: OpenStack Juno 版本 All-in-one 离线安装指导
category: 技术
---

ISO第一作者：刘胜  
支撑团队：华为OpenStack社区团队（西安）  
**更新日期：2014.10.28**

The English Version is [here](http://yizhaolingyan.net/?p=227)

----------

## 优点
* 基于Juno正式版本
* 主机操作系统基于Ubuntu 14.04 server版，与OpenStack兼容性高
* **离线安装**，特别适用于有网络限制的场景
* 集成Ubuntu和OpenStack的安装，傻瓜式安装配置，简单，高效
* 集成了简单的健康检查
* 同时支持虚拟部署和物理部署
* 现在只需一个网卡了
* 为了照顾小白用户，我们提供了创建网络、上传镜像并创建虚拟机的一键式脚本
* discovered by you……

## 缺点
* 我们还真没发现有啥缺点，期待大家的反馈！

## 使用前提
* 获取ISO，地址：<http://dl.vmall.com/c04z4ngxxc> (2014.10.23号更新)
* 获取网络信息规划
* 如果是物理安装，请获取预安装服务器的BMC IP地址；

> 当然，你也可以配置PXE服务器

## 定位
all in one ISO的定位就是一个简单、易用、高效的OpenStack安装工具。我们后续会开发出一些列工具支撑基于all in one ISO的高级部署模式。

## 安装和使用
其实安装过程没啥特别，怎么装Ubuntu就怎么装这个ISO。注意事项如下：

1、如果是虚拟安装，推荐内存4G、4CPU，硬盘30G（安装过程会创建一个10G的卷组），网卡选为virtio模式。  

2、该ISO会重新安装您的系统，不能选择系统安装的磁盘和分区。

3、安装完操作系统自动重启后会看到如下界面，表示正在安装OpenStack，用时跟具体的环境有关。  
![](/images/2014-10-16-openstack-juno-allinone/1.png)  
4、（optional）如果你受不了这个光秃秃的界面或者你有强迫症的话，你也可以按ALT+F2键登录（root/root），然后执行`tailf /opt/openstack/install.log`来观察openstack的安装进度。直到最后一步检查各服务是否正常，如果都OK，表示OpenStack已经安装成功  
![](/images/2014-10-16-openstack-juno-allinone/2.png)  
![](/images/2014-10-16-openstack-juno-allinone/3.png)  
5、（optional）all-in-one提供了一个创建网络、上传镜像并创建虚拟机的脚本，使用方式如下：  

    cd /opt/openstack/etc/ && /bin/bash createvm.sh {CIDR} 
    
其中CIDR是你规划的一个external网段(默认掩码24位)。比如你填写192.168.10.1，那么该脚本会创建一个子网是192.168.10.0/24的external net，后续可通过API修改
    
最终通过`nova list`命令可以看到一个虚拟机。

6、除了host登录信息（root/root）外，其他所有登录密码均为openstack。

7、（optional）安装后，host上的网络模型如下（需要有OpenStack网络基础）：  
![](/images/2014-10-16-openstack-juno-allinone/4.png)   
如果对Neutron不熟悉，那么您只要知道：  

* 安装成功后，eth0的网络信息被转移到系统内的br-ex接口上；
* 要保证给虚拟机分配的外网IP与您host所在网络互通，可能要有一些交换机的知识；

8、如果你不喜欢一键式脚本创建虚拟机，想自己一步一步学习命令的使用，恭喜你又找对地方了！请参考：  
<http://lingxiankong.github.io/blog/2014/05/12/huawei-allinone-operation-guide/>