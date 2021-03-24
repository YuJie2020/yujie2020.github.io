---
layout: post
title: OpenStack社区动态第十九期(0826-0916)
description: OpenStack社区动态第十九期(0826-0916)
category: 技术
---

**写在前面**  
工作压力越来越大，每天疲于奔命，尽力的证明自己，但无奈个人力量太过单薄，才疏学浅，每天抱着改变世界的心投入工作，挣扎一天之后，看看周围还是云淡风轻，花开花落，于是又抱着明天继续改变的心，在回忆、梳理中慢慢入睡……

我没有目标，或者我认为我的目标就是做好当下，未来太遥远，看不清，也懒得看。过来人跟我说，往那边走吧，我略作迟疑，心想，他娘的反正我也不知道该走哪，一路都这么趟过来了，继续趟吧，走哪是哪，只要是路。人生就是这样，你可以后悔，但永远不能重新来过。

眼前有一个大水池，我打开进水口，在岸边盯着，看着水位慢慢上涨，心里突然有种莫名的欣喜。突然有一天我发现水位停滞了，甚至下降了，我开始惶恐。此时才发现，池的另一边，有人把出水口打开了，于是我跑过去拧上，回来接着憧憬。但不过多久又有人打开，如此循环往复……池子什么时候能满呢？我等着，等着看到哪怕一丝的曙光。

好久没见杭研所的鹅了，想起之前自己疲惫的时候，经常羡慕的看着它们的悠闲。但我知道，它们在水上平静，但在水下，却靠拼命的划水，让自己前行。

---

### Common
OpenStack环境搭建成功后，你修改过主机名么？是不是发现多了一些重复的服务，因为OpenStack并不会识别服务所在主机名的变更，目前的解决方法就是修改数据库。   
<http://thornelabs.net/2014/08/03/delete-duplicate-openstack-hypervisors-and-services.html>

Devstack使用代理的小技巧。  
<http://www.rushiagr.com/blog/2014/08/05/devstack-behind-proxy/>

各个组件如何生成默认的配置文件？  
<http://blog.mgagne.ca/generating-sample-config-files-in-openstack>

2014.8.26，在VMware2014大会召开之际，VMware推出OpenStack发行版本。说实话，VMware早晚会走这条路，求变嘛。    
<http://www.ctocio.com/ccnews/16367.html>

OpenStack监控告警。  
<http://www.subbu.org/blog/2013/10/monitoring-and-alerting-for-openstack>

2014.8.26，OpenStack TC接纳Manila成为官方孵化项目。关于Manila一些资料：  
<https://wiki.openstack.org/wiki/Manila>  
<http://netapp.github.io/openstack/2014/08/15/manila-devstack>  
<https://www.youtube.com/watch?v=fR-X7jbG5QM>

### Nova
老话题，如何配置实现live migration.   
<http://blog.zhaw.ch/icclab/setting-up-live-migration-in-openstack-icehouse>

### Neutron
通过Neutron的`allowed-address-pairs`扩展和Heat模板，在虚拟机中创建高可用的Load Balancers。  
<http://www.hastexo.com/blogs/syed/2014/08/05/orchestrating-highly-available-load-balancers-openstack-heat>

> allowed-address-pairs allows one to add additional IP/MAC address pairs on a port, so as to allow traffic that matches the specified values. (For more information, please have a look at this commit: https://review.openstack.org/#/c/38230/.)

Layer 3 High Availability，强烈推荐。  
<http://assafmuller.wordpress.com/2014/08/16/layer-3-high-availability/>

最近社区在讨论如何从nova-network平滑升级到Neutron，最大的需求来源是CERN，他们从D版本就开始部署大规模环境。听听社区是如何讨论的。  
<http://openstack.markmail.org/thread/gkfztigr764gvu2d#query:+page:1+mid:ilqpz3jwo3zsrd2h+state:results>

Mark McClain and Kyle Mestery在2014.8.21举行的LinuxCon/Cloud Open conference上做了一个关于Juno版本Neutron新功能的演讲，包括对IPv6的支持、DVR(Distributed Virtual Routing)，以及新特性作为incubator跟踪的方式。  
<http://www.enterprisenetworkingplanet.com/datacenter/openstack-neutron-set-for-new-updates-in-juno-release.html>

### Heat
Understand Heat Auto-Scaling.  
<http://trickycloud.wordpress.com/2014/08/08/understanding-openstack-heat-auto-scaling/>

Deploying TOSCA portable workloads in OpenStack using [Heat-Translator](https://github.com/stackforge/heat-translator).  
<http://thoughtsoncloud.com/2014/08/deploying-tosca-portable-workloads-openstack/>  
什么是TOSCA？Topology Orchestration Specification for Cloud Applications

How to profile Heat using OSprofile.  
<http://ahsalkeld.wordpress.com/2014/09/04/how-to-profile-heat-using-osprofile/>

### Ceilometer
Ceilometer前世今生，特别现在遇到的瓶颈以及解决方法、路标，来自前Ceilometer PTL。  
<https://julien.danjou.info/blog/2014/openstack-ceilometer-the-gnocchi-experiment>

### Glance
为Glance配置Swift后端存储。  
<http://thornelabs.net/2014/08/03/use-openstack-swift-as-a-backend-store-for-glance.html>

### Tempest
以一个core member的视角看QA Program后续如何发展。  
<http://blog.kortar.org/?p=4>