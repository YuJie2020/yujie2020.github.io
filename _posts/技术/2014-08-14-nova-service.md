---
layout: post
title: Nova服务管理
description: Nova服务管理
category: 技术
---

## 服务的增删改查
在Nova中提供对Service资源的操作API，包括服务的查询、删除、更新。

查询操作使用如下(假设你已经拿到了keystone的token)：  
URL: http://{ip}:8774/v2/{tenant-id}/os-services(后面可以加过滤条件?binary=nova-compute或者?host=ubuntu)  
Accept: application/json  
Content-Type: application/json  
X-Auth-Token: {token}

在看返回消息体之前，先熟悉一下Service的数据库模型：

    id = Column(Integer, primary_key=True)
    host = Column(String(255))  # , ForeignKey('hosts.id'))
    binary = Column(String(255))
    topic = Column(String(255))
    report_count = Column(Integer, nullable=False, default=0)
    disabled = Column(Boolean, default=False)
    disabled_reason = Column(String(255))

返回消息体(省略了一些显示)：

    {
        "services": [
            {
                "status": "enabled",
                "binary": "nova-cert",
                "zone": "internal",
                "state": "up",
                "updated_at": "2014-08-14T04:22:43.000000",
                "host": "ubuntu",
                "disabled_reason": null,
                "id": 1
            },
            ……
        ]
    }

其中：  
zone是服务所在的主机所属的availability zone，会查询aggregates数据表(和关联表metadata, host)；  
status是服务disable属性的体现，该属性可以直接通过API修改;  
state是服务真实的状态，是通过servicegroup api获取。每个服务在启动时会加入servicegroup，以db后端为例，会在服务中启动定时器，更新service表中的`report_count`的值，同时也会刷新更新时间，后续会根据这个更新时间确定服务的死活； 

服务的删除会直接将db中的数据干掉。

服务的更新：  
/v2/​{tenant-id}​/os-services/enable  
/v2/​{tenant-id}​/os-services/disable  

    {
        "host": "host1",
        "binary": "nova-compute"
    }

/v2/​{tenant-id}​/os-services/disable-log-reason  

    {
        "host": "host1",
        "binary": "nova-compute",
        "disabled_reason": "test2"
    }

都是直接更改db，第3个API的好处在于让用户在关闭服务时提供定制化的信息以供其他人查询知晓。

## 服务状态对操作的影响
### create
创建虚拟机过程中会选择主机，如果系统的主机过滤器中包含ComputeFilter，那么就会同时检测主机服务的status和state。

### live migration
热迁移将虚拟机从源节点迁移到指定的目的节点。迁移前，会检查源节点服务和目的节点服务的state状态。

### rescue/rebuild/start/stop/suspend/resume
这些操作，默认会直接到虚拟机所在的主机上，不会检测服务状态。

### evacuate
疏散虚拟机时，为了确保源节点确实已经死了，会检测服务的state状态；  
同时，如果evacuate时没有指定目的主机，那么会走类似create vm的调度流程，就会检测节点服务的status and state。

### resize/code migration
resize虽然从功能上是“Use this function to convert an existing server to a different flavor, in essence, scaling the server up or down”，但内部实现其实是虚拟机冷迁移过程，所以，会有选择主机的过程，同create调度流程，会检测节点服务的status and state。
