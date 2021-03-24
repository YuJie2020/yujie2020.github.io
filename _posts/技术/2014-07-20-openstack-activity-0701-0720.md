---
layout: post
title: OpenStack社区动态第十七期(0701-0720)
description: OpenStack社区动态第十七期(0701-0720)
category: 技术
---

## 业界动态
2014.6.30，IBM公司[宣布](http://www-03.ibm.com/press/us/en/pressrelease/44239.wss)：开放的云开发平台Bluemix正式上线。Bluemix运行在SoftLayer上面，基于 Cloud Foundry，拥有超过50项服务，客户和系统集成商等都可以在云计算环境中快速部署基于云的移动应用程序或web服务

参与OpenStack社区Neutron项目贡献的PLUMgrid成功完成1600万美元的B轮融资，并且吸引了瑞士电信(Swisscom)作为其客户。LUMgrid发布的OpenStack网络套件被吹捧为第一个面向OpenStack安全的网络产品。

继Mirantis与VMware, Canonical, and IBM建立合作伙伴关系之后，mirantis又与Oracle合作，在自己的OpenStack发行版中集成Oracle Linux and OracleVM。Oracle Linux能够同时支撑host OS和guest OS，而OracleVM与vSphere和KVM一样作为hypervisor。虽然Oracle有自己的OpenStack发行版，但它还是在积极将自己的产品同其他发行版集成。

## 社区跟踪
### Common
一个简单介绍云计算相关概念的文档：  
<http://www.alicosystems.com/Cloud%20White%20Paper%20V2.0.pdf>

OpenStack’s Future Depends on Embracing Amazon，作者的观点和视角还是有一定道理的，感兴趣的可以精读一下。 
<http://www.cloudscaling.com/blog/cloud-computing/openstack-aws/>

2014.6.25号，OpenStack Technical Committee Update (June 25)，主要重新审视了项目的孵化和集成要求，以及目前Glance mission变化的事情；还有选举的规则和defcore一些问题。  
<http://www.openstack.org/blog/2014/06/openstack-technical-committee-update-june-25>

Symantec针对其客户使用OpenStack的场景，开发了NoSQL as a service，[MagnetoDB](https://wiki.openstack.org/wiki/MagnetoDB)，并且已经将它与devstack[集成](https://github.com/stackforge/magnetodb/tree/master/contrib/devstack)。  
<http://www.symantec.com/connect/blogs/scaling-your-data-horizontally-openstack>

VMware NSX使用系列来了，Deploying OpenStack with KVM and VMware NSX ：  
<http://jreypo.wordpress.com/2014/04/29/deploying-openstack-with-kvm-and-vmware-nsx-part-1-nsx-overview-and-initial-setup/>  
<http://jreypo.wordpress.com/2014/05/06/deploying-openstack-with-kvm-and-vmware-nsx-part-2-configure-nsx-transport-and-logical-network-views/>  
<http://jreypo.wordpress.com/2014/05/07/deploying-openstack-with-kvm-and-vmware-nsx-part-3-kvm-hypervisor-and-gluster-storage-setup/>   
<http://jreypo.wordpress.com/2014/06/23/deploying-openstack-with-kvm-and-vmware-nsx-part-4-deploy-openstack-rdo-with-neutron-integrated-with-nsx> 

2014.7.1号，OpenStack技术委员会(TC)的[会议](http://www.openstack.org/blog/2014/07/openstack-technical-committee-update-july-1/)中，主要讨论了DefCore的适用范围(Powered by OpenStack)，同时也透漏了后续可能会为“OpenStack Compatible”也提供了一个能力集。而对于是否要定义“特定的代码”，需要听取社区的反馈意见。

OpenStack需不需要项目经理？这篇剖析了目前谁在真正影响OpenStack，是各个公司的项目经理们，因为他们控制了贡献者，文章还提倡为这些PM们提供交流的平台和机会。  
<http://robhirschfeld.com/2014/07/01/hidden-influencers/> 

2014.7.3，中文版的API快速参考完成，感谢中文[翻译团队](https://wiki.openstack.org/wiki/I18nTeam)。  
<http://docs.openstack.org/zh_CN/api/quick-start/content/index.html>

2014.7.17，社区宣布K版本代号：Kilo

2014.7.22 rally项目申请孵化。但社区有些人(目测主要是QA Team)觉得Rally的mission貌似跟QA/CI有些像，觉得集成进CI没问题，但作为一个单独的项目有些牵强。

如果你只有1台装了libvirt的物理机，你只懂OpenStack cli，你想用OpenStack API管理libvirt虚拟机，那么[dwarf](https://github.com/juergh/dwarf)可以完成这些工作，可以参考[这里](http://serverascode.com//2014/07/07/dwarf-openstack.html)简单了解。

### Nova
Managing VMware vCenter Resources with Mirantis OpenStack 5.0 — Part 1: Create the vSphere Cluster
<http://www.mirantis.com/blog/managing-vmware-vcenter-resources-mirantis-openstack-5-0-part-1-create-vsphere-cluster>

来自mirantis，谈OpenStack在企业级关键特性的缺失1：HA，读完你会发现，文章的结论是，想用HA么？买VMware的license吧。  
<http://www.mirantis.com/blog/missing-building-blocks-enterprise-openstack-part-1-high-availability/>

New Features in libvirt 1.2.6 & QEMU 2.1，我对虚拟化其实不太懂，libvirt是门学问啊(当然，还有docker)。   
<http://kashyapc.com/2014/07/06/live-disk-migration-with-libvirt-blockcopy/>

Nova在Juno版本有哪些新特性？NFV、升级、调度……先来看看前任PTL的总结，尝尝鲜。  
<http://redhatstackblog.redhat.com/2014/07/10/juno-preview-for-openstack-compute-nova/>

### Neutron
VMware在Juno版本中会增强对自家网络产品的支持，包括NSX以及VMWare vCenter DVS：  
VMware NSX-vSphere plugin: <https://review.openstack.org/102720>   
Neutron mechanism driver for VMWare vCenter DVS network creation:<https://review.openstack.org/#/c/101124/>  
VMware dvSwitch/vSphere API support for Neutron ML2: <https://review.openstack.org/#/c/100810/>

对于Neutron的bp提交截止日期(Spec Proposal Deadline)：7.10号  
bp合入截止日期(Spec Approval Deadline)： 7.20号

Juno版本中Neutron新增的重要特性之一就是[Group Based Policy Framework](https://blueprints.launchpad.net/neutron/+spec/group-based-policy-abstraction). 这里有篇文章[A Policy Driven Approach to Software Defined Networking](http://www.nuagenetworks.net/sdn-policy-architecture-sneddon/)做了简单的介绍，还有一个峰会的[视频](https://www.openstack.org/summit/openstack-summit-atlanta-2014/session-videos/presentation/demo-theater-nuage-common-network-policy-and-migration-to-openstack)。

Neutron中新增的neutron-external-sanity-checks讲解。  
<http://otherwiseguy.tumblr.com/post/89880974499/neutron-external-sanity-checks>

### Keystone
Importing OpenStack Keystone Users & Tenants into OpenLDAP  
<http://openstack.prov12n.com/importing-openstack-keystone-users-tenants-into-openldap>

### Ceilometer
使用Ceilometer监控硬件服务器。  
<http://blog.zhaw.ch/icclab/run-monitoring-physical-devices-on-devstack/> 