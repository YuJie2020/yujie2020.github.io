---
layout: post
title: OpenStack社区动态第十六期(0616-0701)
description: OpenStack社区动态第十六期(0616-0701)
category: 技术
---

## 业界动态
提起Symantec，大家都认为它是一个防病毒的公司，而正是这个防病毒的公司也跟云扯上了关系，看一下Symantec对于云安全的思考：  
<http://www.symantec.com/connect/blogs/building-symantec-s-cloud-platform-openstack>

2014.6.13，一个做数据库服务的公司，[Tesora](http://www.tesora.com/)，开源了自身产品Tesora Database Virtualization Engine，同时该DB是Trove的插件之一。当然，公司也要赚钱，在开源产品的同时，该公司会继续维护一个增值版本。  
<http://thevarguy.com/cloud-computing-services-and-business-solutions/061314/tesora-open-sources-openstack-cloud-database-storage>

2014.6.19，为了把握对OpenStack的生态系统不断增长的需求，红帽公司正在洽谈收购eNovance。将eNovance纳入旗下利用OpenStack提供全面的咨询服务产品，在赚钱方面处于更有利的地位。扩大了红帽在欧洲的立足之地。eNovance是一法国实施专业公司，目前是欧洲唯一一个OpenStack金牌会员。

华为凭借E9000融合架构刀片服务器，以及分布式存储、虚拟化等软件平台，成为国内唯一入选的一体机厂商。根据Gartner报告，一体机系统主要包括服务器、存储和网络基础架构，并集成有系统部署和应用管理软件。从2013年市场营收角度来看，2014年一体机市值将达60亿美元，实现50%以上的年度增长。业界普遍认为，一体机魔力四象限将有助于市场对一体机厂商整体实力和未来发展潜力的认识。

2014.6.18 ，MongoDB 2.6.2发布，新版本大大改进了查询功能。MongoDB是一个由C++语言编写的基于分布式文件存储的数据库，旨在为Web应用提供可扩展的高性能数据存储解决方案。它的特点是高性能、易部署、易使用，存储数据非常方便。

## 社区跟踪
### Common
还记得去年一群来自社区的开发者在5天时间写了一本书 OpenStack Operation Guide，社区又准备以同样的方式写一本关于架构设计指导的书，由VMware赞助，7.7-7.11号，敬请期待。
 
了解一下Hyper-V在Icehouse版本都做了些什么，在未来的Juno版本打算做些什么。  
<http://www.slideshare.net/kamesh001/open-stack-icehouse-microsoftupdate>

来自Rackspace工程师的私有云系列更新了，讲一讲OpenStack中的高级特性LBaaS：  
<http://openstackr.wordpress.com/2014/06/11/home-rackspace-private-cloud-openstack-lab-part-7-lbaas>

关于消息队列服务安全性的思考。  
<http://www.buildyourbestcloud.com/475/openstack-security-nugget-messaging>

Installing OpenStack Icehouse on Ubuntu 14.04 LTS in 10 Minutes  
<http://www.stackgeek.com/guides/gettingstarted.html>

关于marconi和传统AMQP的对比分析，以及marconi是否有必要向传统AMQP产品对齐的思考：  
<http://blog.flaper87.com/post/53a09586d987d23f49c777bf/>

OpenStack日志管理系列：  
<http://openstack.prov12n.com/openstack-lumberjack-part-1-rsyslog/>  
<http://openstack.prov12n.com/openstack-lumberjack-part-2-services-remote-logging/>  
<http://openstack.prov12n.com/openstack-lumberjack-part-3-logstash-and-kibana/>

来自eNovance的 How to benchmark your cloud infrastructure before getting into production 系列：  
<http://techs.enovance.com/6867/how-to-benchmark-your-cloud-infrastructure-before-getting-into-production-part-1>  
<http://techs.enovance.com/6909/how-to-benchmark-your-cloud-infrastructure-before-getting-into-production-part-2>

来自Ubuntu Server team的一个含金量比较高的性能测试，最终使用640台物理机创建了168,000个VM，中间经历了很多痛苦。比较讽刺的是，到后面，网络竟然还是使用了nova-network：  
<http://javacruft.wordpress.com/2014/06/18/168k-instances/>

### Nova
虚拟机被lock后能否做快照？大家不必关注这个问题该如何回答，而是社区对于这种问题是如何讨论的。  
<http://lists.openstack.org/pipermail/openstack-dev/2014-June/037853.html>

从Icehouse版本VMware ESX driver就已经废弃。来自VMware的工程师开始考虑如何升级到VM driver。  
<http://openstack.markmail.org/thread/3kr4vic2fs4l7vrt>

2014.6.25, Mirantis发布了Stackalytics 0.6版本，增加了[基金会会员统计](http://www.stackalytics.com/report/members)，[bug解决数统计](http://www.stackalytics.com/?metric=resolved-bugs)等特性。统计维度越来越细。

来自Clouwatt的cloud-init使用实例：  
<http://dev.cloudwatt.com/en/blog/how-to-automatically-launch-a-team-fortress-2-server-with-cloudinit.html>

OpenStack镜像如何使用Config Drive实现元数据注入，来自[@赵威-zw]()的[技术博客](http://blog.sina.com.cn/u/2509541670)。  
<http://blog.sina.com.cn/s/blog_959491260101m2dd.html#bsh-24-437924363>

### Neutron
在没有IP地址池的network中创建虚拟机？也许又是一个NFV使用场景：  
<http://www.gossamer-threads.com/lists/openstack/dev/38981>

2014.6.20，Stephen Balukoff (sbalukoff@bluebox.net) 提出Octavia项目，托管在stackforge上，作为Neutron LBaaS的driver之一。

### Ceilometer
如何对云平台下的Windows虚拟机做监控？来自[ECCP企业级云计算平台](http://eccp.zedata.cn)的博客：  
[Python实现Windows监控agent(上)](http://eccp.csdb.cn/blog/?p=248)  
[Python实现Windows监控agent(下)](http://eccp.csdb.cn/blog/?p=255)  
[Python调用系统API获取Windows监控状态](http://eccp.csdb.cn/blog/?p=481)

### Keystone
鉴于代码量过大，依赖过多，python-keystoneclient中的middleware将会从代码库中[分离出去](https://launchpad.net/keystonemiddleware)，原有代码后续只接受安全相关bug修复。这将会对各个发行版的打包、devstack安装等产生影响。