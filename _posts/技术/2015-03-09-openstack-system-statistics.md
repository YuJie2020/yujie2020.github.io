---
layout: post
title: Nova中的系统状态分析
description: Nova中的系统状态分析
category: 技术
---

写此文的目的：

转眼间OpenStack已经发展到了K，马上L版本开发周期也要开始了。记得我最早接触OpenStack是从E版本，时间过去了2年多，OpenStack社区仍然如火如荼，OpenStack玩家，特别是重量级玩家越来越多，通过每次OpenStack峰会的报道、社区的user survey以及圈里的分享，我们发现OpenStack的生产环境部署也越来越多，但是相信很多企业，很多人，在使用OpenStack的过程中仍然很痛苦。安装部署困难，系统复杂性，过于灵活的架构，眼花缭乱的配置项，特别是系统搭建好以后，运行过程中各种各样的错误等等，足以让一个充满热情的人望而却步。关于安装部署，目前已有有很多开源工具在做，像TripleO、Fuel、RDO以及一些像Ansible、Puppet、Chef等更native的工具，已经极大程度的降低了安装OpenStack的门槛，我就不再过多阐述。而关于运行期间如何排错，如何掌握系统的运行状态，在不了解系统实现原理的情况下，也会令人一筹莫展。当然，已经有很多发行版中包含了这部分功能。

本文的目的不是指导读者写一个新的类似的工具，而是分析为了配合这些工具，可以使用到的OpenStack自身能力。当然，系统的监控运维是一个大的话题，我能力和视野有限，喷不了那么多（没有真正用过的东西，我也不愿意喷），像主机的CPU监控、进程监控、网络流量监控、存储监控这些，也不在本文的范畴内。

OK，言归正传，说说本文要讲啥。OpenStack有很多模块，但其中最为核心的当然是Nova，所以本文就以Nova为例，来看一下如何通过Nova提供的能力来获取系统运行期间的状态。我把这些状态分为两类，一类是系统整体情况一览（系统状态），而是虚拟机相关的状态信息（虚拟机状态）。当然，以我一贯的风格，你会看到更多的OpenStack实现原理。

Nova版本：Kilo

## 系统状态
Nova提供这么几个资源状态的查询。

### Service
Nova中的service有两类，一类是所谓的control service，一类就是compute service。要想获取Nova的service详细信息，必须要启用os-extended-services扩展。

service的详细信息主要包括如下几项：  
binary, host, zone, status, state  
其中： 
binary，可以理解为service的名称，类似于nova-compute；  
host是service所在的主机名称；  
zone是service所属的AZ，其实就是service所在的主机所属的aggregate，只是aggregate的概念不对外呈现，所以用户看到的是AZ。其实，在Nova内部，AZ是AG的metadata而已。  

    zone的确定，涉及到两个配置项，对于非计算节点，zone的名称依赖于配置项internal_service_availability_zone（默认是internal）；
    对于计算节点，如果不属于任何AG，或者所属的AG没有AZ的metadata信息，默认的zone依赖于配置项default_availability_zone（默认是nova）。

status是服务disable属性的体现，该属性可以直接通过API修改;  
state是服务真实的状态，是通过servicegroup api获取。每个服务在启动时会加入servicegroup，以db后端为例，会在服务中启动定时器，更新service表中的`report_count`的值，同时也会刷新更新时间，后续会根据这个更新时间确定服务的死活；

当然，查询service信息也支持过滤条件，比如：  
1、查询某个host相关的service；  
2、按binary名称查询service；  

**知道了service的信息后，就至少能够获取到Nova各个服务的运行状态，从而判断系统是否健康。**

### Host
其实Nova中没有host这个独立的资源（数据库对象），但是Nova却有针对host的API操作，其实，在内部实现中，就是通过前面的service信息，间接组装返回host信息。

**即：你可以获取系统中所有的主机信息，其中包括：主机名称、主机上的服务、主机所属的AZ**。

### Hypervisor
hypervisor的概念在OpenStack中其实不好理解。在使用KVM的环境中，hypervisor通常是就是只nova-compute进程所在的主机；而在类VMware环境中（之所以说类VMware，是因为华为也有一款虚拟化产品FusionCompute也是类似的架构），hypervisor是指nova-compute进程下的一个'node'，对应于一个vCenter集群。换句话说，你可以把一个hypervisor看成一个nova-compute下的一个node，KVM的情况是一个特例而已。一个hypervisor，是创建虚拟机能够调度到的最小单元。

Nova中对于hypervisor的查询情况支持较为丰富。

1、查询所有的hypervisor概要信息。包含一个id和一个hypervisor host name，如果启用了os-hypervisor-status extension，还会返回hypervisor所属的nova-compute服务状态。  
2、查询所有的hypervisor详细信息。除了包含上述信息外，还包含每个hypervisor的资源使用信息。如果启用os-extended-hypervisors extension，还会包含hypervisor所属的nova-compute所在主机的IP地址。  
3、查询所有hypervisor所使用的系统资源总量。即，系统计算资源使用量的一个总览。  
4、模糊查询某些hypervisor的概要信息。  
5、查询单个hypervisor资源使用的详细信息。  
6、模糊查询某些hypervisor上的虚拟机信息，包含虚拟机的ID和名称。

**可见，Nova中的hypervisor给管理员提供了较为丰富系统计算资源使用情况的查询接口，通过对hypervisor使用情况的了解，管理员可以更有效的进行系统监控，并且为系统维护（扩容、减容、动态资源调整等）提供依据。**

### 租户视角的系统状态
上面的几个资源，默认都是管理员有权限查询，普通租户是看不到的。那么作为租户，能够对系统使用状态有一个什么样的了解呢？

#### 租户的资源配额
租户可以查询自己的资源配额限制和使用情况，管理员（admin）可以查询普通租户的资源配额使用情况（os-used-limits-for-admin extension）。参见[这里](http://developer.openstack.org/api-ref-compute-v2.html#compute_limits), [这里](http://developer.openstack.org/api-ref-compute-v2-ext.html#ext-limits)和[这里](http://developer.openstack.org/api-ref-compute-v2-ext.html#ext-compute_limits_admins)。

如下是租户查到的自己的资源配额限制和使用情况（片段）：

    {
        "limits": {
            "absolute": {
                "maxImageMeta": 128,
                "maxPersonality": 5,
                "maxPersonalitySize": 10240,
                "maxSecurityGroupRules": 20,
                "maxSecurityGroups": 10,
                "maxServerMeta": 128,
                "maxTotalCores": 20,
                "maxTotalFloatingIps": 10,
                "maxTotalInstances": 10,
                "maxTotalKeypairs": 100,
                "maxTotalRAMSize": 51200,
                "maxServerGroups": 10,
                "maxServerGroupMembers": 10,
                "totalCoresUsed": 0,
                "totalInstancesUsed": 0,
                "totalRAMUsed": 0,
                "totalSecurityGroupsUsed": 0,
                "totalFloatingIpsUsed": 0,
                "totalServerGroupsUsed": 
    ...

#### 租户的资源使用量
管理员可以查询所有租户对计算资源的使用量，也可以查询某个租户的计算资源使用量（包括每个虚拟机计算资源使用信息），参见[这里](http://developer.openstack.org/api-ref-compute-v2-ext.html#ext-os-simple-tenant-usage)。 

示例1，管理员查询租户对计算资源的使用量：

    {
        "tenant_usages": [
            {
                "start": "2012-10-08T21:10:44.587336",
                "stop": "2012-10-08T22:10:44.587336",
                "tenant_id": "openstack",
                "total_hours": 1.0,
                "total_local_gb_usage": 1.0,
                "total_memory_mb_usage": 512.0,
                "total_vcpus_usage": 1.0
            }
        ]
    }
    
示例2，查询某个租户的计算资源使用量：

    {
        "tenant_usage": {
            "server_usages": [
                {
                    "ended_at": null,
                    "flavor": "m1.tiny",
                    "hours": 1.0,
                    "instance_id": "1f1deceb-17b5-4c04-84c7-e0d4499c8fe0",
                    "local_gb": 1,
                    "memory_mb": 512,
                    "name": "new-server-test",
                    "started_at": "2012-10-08T20:10:44.541277",
                    "state": "active",
                    "tenant_id": "openstack",
                    "uptime": 3600,
                    "vcpus": 1
                }
            ],
            "start": "2012-10-08T20:10:44.587336",
            "stop": "2012-10-08T21:10:44.587336",
            "tenant_id": "openstack",
            "total_hours": 1.0,
            "total_local_gb_usage": 1.0,
            "total_memory_mb_usage": 512.0,
            "total_vcpus_usage": 1.0
        }
    }

## 虚拟机状态
说到底，作为IaaS，OpenStack玩的还是虚拟机，因为各种资源（存储、网络）都是为了更好的使用虚拟机服务。所以对虚拟机状态的掌握就显得格外重要。

### 虚拟机操作事件通知
用户对虚拟机的每个操作（开始和结束），都会通过消息队列向外部发送通知，外部系统可以通过接收通知，了解系统的运行过程。使用通知的另外一个好处，就是可以与Nova解耦，作为外部系统的数据源，实现系统的监控分析。Ceilometer、StackTach和Monasca都用到了Nova的通知作为自己的数据源。

    与此同时，虚拟机state或task_state发生变化时，也会向外部发送通知。
    前提是配置项notify_on_state_change要配置为vm_state或vm_and_task_state。
    
    另外，Nova中除了上述说的操作事件通知外，还有一种审计通知，即在一段时间内的系统资源状态，
    相关的配置项instance_usage_audit_period，目前Nova中只有event_type类型为compute.instance.exists一种审计通知，
    这种通知可以让你对一段周期内系统中存在的虚拟机有一个全局的了解。

### 虚拟机操作事件记录
Nova中的虚拟机每个操作（启动、停止、暂停、恢复等等），都会在db中保存相关的操作记录，给用户提供查询。利用这个功能，**用户对自己的虚拟机整个生命周期的过程和状态都会了如指掌**，便于用户的管理。参见[这里](http://developer.openstack.org/api-ref-compute-v2-ext.html#ext-os-instance-actions)。示例如下：

    {
        "instanceActions": [
            {
                "action": "resize",
                "instance_uuid": "b48316c5-71e8-45e4-9884-6c78055b9b13",
                "message": "",
                "project_id": "842",
                "request_id": "req-25517360-b757-47d3-be45-0e8d2a01b36a",
                "start_time": "2012-12-05 01:00:00.000000",
                "user_id": "789"
            },
            {
                "action": "reboot",
                "instance_uuid": "b48316c5-71e8-45e4-9884-6c78055b9b13",
                "message": "",
                "project_id": "147",
                "request_id": "req-3293a3f1-b44c-4609-b8d2-d81b105636b8",
                "start_time": "2012-12-05 00:00:00.000000",
                "user_id": "789"
            }
        ]
    }

在内部实现中，nova-api层会记录action开始的记录，在nova-compute层，则会添加event开始和结束的信息，action和event根据request id（一次消息请求的标识）关联。

### 虚拟机错误信息记录
因为OpenStack的安装部署复杂性，或者操作过程对环境、配置等要求比较苛刻，稍不注意，就有可能发生错误。一旦发生错误，除了从日志中获取错误信息外，还有什么比较方便、快捷的方式能够迅速定位错误呢？

在API层发生错误，用户会立即看到错误码和错误信息。但如果是在conductor，scheduler或compute层发生错误呢？

OpenStack智慧的社区开发者们已经为我们提供了这种能力。其实还是利用DB和通知机制来实现。

* 先说通知，虚拟机操作异常时，一般都会发送error通知，通知中包含异常的函数名称、异常时函数的参数以及异常信息。
* 再说db，虚拟机操作异常时，无论是在conductor, scheduler还是compute层，除了会发送通知外，还会记录异常信息到数据库（`instance_faults`表），当查询虚拟机信息时，会返回虚拟机的异常信息。

### 虚拟机诊断信息
租户可以查询虚拟机使用过程中的一些统计信息，比如虚拟机磁盘的读写情况、网络的IO情况等，对于KVM来讲，这些信息都是通过libvirt接口获取。

API示例参见[这里](http://developer.openstack.org/api-ref-compute-v2-ext.html#ext-diagnostics)。返回消息示例：

    {
        "vnet0_tx_errors": 0,
        "vda_errors": -1,
        "vda_read": 4447232,
        "vda_write": 4347904,
        "vnet0_tx_packets": 1259,
        "vda_write_req": 3523,
        "memory-actual": 524288,
        "cpu0_time": 195230000000,
        "vnet0_tx": 364840,
        "vnet0_rx_drop": 0,
        "vnet0_rx_packets": 1423,
        "vnet0_rx_errors": 0,
        "memory": 524288,
        "memory-rss": 243188,
        "vda_read_req": 291,
        "vnet0_rx": 363725,
        "vnet0_tx_drop": 0
    }

## 参考链接
<https://wiki.openstack.org/wiki/SystemUsageData>   
<https://wiki.openstack.org/wiki/NotificationEventExamples>  
<https://github.com/rackerlabs/yagi>  
<http://www.stacktach.com/>