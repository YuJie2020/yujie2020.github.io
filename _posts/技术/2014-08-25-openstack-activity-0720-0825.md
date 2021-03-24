---
layout: post
title: OpenStack社区动态第十八期(0720-0825)
description: OpenStack社区动态第十八期(0720-0825)
category: 技术
---

因为工作的原因，这一期的动态憋了好久，但还是憋出来了。确实需要耗费大量的时间和精力去阅读和理解，一方面是给自己做笔记，另一方面也算了为了提高因为的阅读吧。

## 业界动态
Oracle发布了[Oracle VM 3.3](http://public-yum.oracle.com/beta)，包含OpenStack软件包的技术预览版，继承了Oracle数据库。其虚拟化技术基于Xen。基于Oracle虚拟化平台，guestOS可以支持Oracle Linux, Oracle Solaris, and Windows 

由几个来自VMware前员工开发了一个OpenStack云管理平台--Platform9，管理已有的基础设施，control plane as a service，这里有一个描述，比较有意思： 

>The company’s software works like this: once you sign up for the service, you install “agents” on any existing hardware you want to contribute to your cloud. The agent enables the Platform9 service, which is hosted on Platform9′s servers, to discover that hardware so an administrator can add it to the cloud. Any KVM-based VMs running on that hardware will then be detected, as will spare capacity available for starting new VMs.  All of this can be managed from a single Horizon-like interface.

2014.8.14，SUSE发布基于OpenStack Icehouse版本的SUSE Cloud 4，支持Ceph存储架构。

2014上半年最受欢迎的开源云项目集合。  
<http://code.csdn.net/news/2821339>

## 社区跟踪
### Common
非代码开发者在社区举步维艰么？   
<https://dronopenstack.wordpress.com/2014/07/10/the-place-of-a-non-developer-in-the-openstack-community> 

对OpenStack CI了解的人实在是太少了，大家都觉得对CI失败的修复是别人的事儿。相反，我个人非常钦佩懂CI的人。  
<https://dague.net/2014/07/22/openstack-failures/>

把一个大的patch分割成几个小的patch，是每一个参与社区review的core reviewer都希望看到的，而对于代码提交者，有什么技巧呢？  
<https://dague.net/2014/07/24/splitting-up-git-commits/>

OpenStack Architecture Design Guide  
<http://docs.openstack.org/arch-design/content/>

社区的doc组正在写一个[OpenStack Networking Guide](https://github.com/openstack/openstack-manuals/tree/master/doc/networking-guide)，“which is intended to create a resource for those who may not have a deep networking background but now find themselves enmeshed in OpenStack”，懂网络但不懂OpenStack，懂OpenStack但不懂网络的童鞋们有福了。

How to Migrate a Linux VM from AWS to Mirantis OpenStack Express  
<http://www.mirantis.com/openstack-portal/external-news/migrate-linux-vm-aws-mirantis-openstack-express/> 

如何通过VirtualBox制作OpenStack中使用的镜像？来自Mirantis。  
<http://www.mirantis.com/openstack-portal/express-openstack-portal/quickly-create-openstack-image/> 

OpenStack Icehouse Installation - Multi Node  
<https://github.com/ChaimaGhribi/OpenStack-Icehouse-Installation/blob/master/OpenStack-Icehouse-Installation.rst>

能想象在Ubuntu下的图形化界面安装OpenStack么？  
<http://astokes.org/ubuntu-openstack-installer-upcoming-ui-enhancements>

An introduction about stevedore, if you farmiliar with it, you will understand Ceilometer and Neutron extensions mechanism deeply.  
<http://amalagon.github.io/blog/2014/07/25/notes-on-stevedore/>

2014.8.8, OpenStack 2014.1.2 released.  
<https://wiki.openstack.org/wiki/ReleaseNotes/2014.1.2>

OpenStack术语，OpenStack新手可以看看。  
<http://thoughtsoncloud.com/2014/08/openstack-terms-definitions-resources/>

如何在CentOS6 (因为作者发现在Ubuntu 14.04 or CentOS 7上制作出来的镜像无法在 RHEL/CentOS 6上使用，经验之谈啊！) 上制作基于 Windows Server 2012 的 qcow2 格式的镜像。  
<http://doc.cloudgear.io/?p=9536>

### Nova
当计算节点宕机之后，如何清理数据库中残留的虚拟机数据？  
<http://blog.arxcruz.net/deleting-openstack-instances-directly-from-database>

编程访问Amazon EC2 API with OpenStack。  
<http://www.rushiagr.com/blog/2014/08/09/amazon-ec2-api-with-openstack-developer-quick-start/>

OpenStack and NUMA placement.  
<http://thoughtsoncloud.com/2014/08/openstack-numa-placement/>

### Neutron
Neutron的PTL发的Neutron贡献入门贴。  
<http://www.siliconloons.com/how-to-effectively-contribute-to-an-open-source-project-such-as-openstack-neutron/>

又是来自Mirantis的技术贴(个人感觉应该是精华帖)，Improving DHCP Performance In OpenStack。  
<http://www.mirantis.com/blog/improving-dhcp-performance-openstack/>

Ultimate OpenStack IceHouse Guide with IPV6-ready  
<https://gist.github.com/xdongp/6224c9e83700a81c275d>

让我们关注Neutron安全组性能的优化，来自Huawei和RedHat的合作。  
<http://www.ajo.es/post/95269040924/neutron-security-group-rules-for-devices-rpc-rewrite>

### Keystone
Juno版本中关于安全的增强。  
<https://blog-nkinder.rhcloud.com/?p=111>

### Glance
关于创建镜像的用法：  
<http://www.mirantis.com/blog/advanced-examples-openstack-image-service-glance-usage/>

### Ceilometer
如何对Ceilometer进行性能调优？  
<http://blog.zhaw.ch/icclab/profiling-the-ceilometer-api-to-identify-performance-bottlenecks/>