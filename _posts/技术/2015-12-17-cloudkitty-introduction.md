---
layout: post
title: CloudKitty(Rating-as-a-Service)简介
description: CloudKitty(Rating-as-a-Service)简介
category: 技术
---

## 什么是CloudKitty及如何使用
CloudKitty wiki：[链接](https://wiki.openstack.org/wiki/CloudKitty)  
开发者文档：[链接](http://docs.openstack.org/developer/cloudkitty/installation.html)

温哥华峰会视频：[链接](https://www.youtube.com/watch?v=OevlC4JkxTA)  
巴黎峰会视频：[链接](https://www.youtube.com/watch?v=KlagCqTUPco)  
东京峰会视频(里面有我的身影！)：[链接](https://www.youtube.com/watch?v=hou187R_G_E)  

目前，除了rest api外，CloudKitty提供有Horizon插件、DevStack插件和client客户端。

根据CloudKitty提供的API，分析Objectif Libre公司那俩哥们在历届峰会中的演示视频，使用CloudKitty的业务流程大致如下：

* 管理员在hashmap module中创建service，比如'compute'，service名称并非是随意命名，CloudKitty中有几个默认services，见下。
* 继续在service下创建field，比如要对flavor计费，就创建名为'flavor'的field，这个flavor也并非随意命名，原因见下。
* 在field下创建mapping，即：哪种flavor如何收费。
* 普通租户创建虚拟机时，根据选中的flavor值，调用CloudKitty的`/rating/quote` rest api，给用户呈现这次创建怎么收费，实际并未扣费。
* 虚拟机创建成功，Ceilometer收集到该虚拟机的信息。
* CloudKitty在一个计费周期内从Ceilometer中查询该租户的虚拟机信息，根据其flavor的值以及管理员配置的收费策略计算费用并将收费信息持久化。
* 租户通过查询CloudKitty获取实时花费。

## CloudKitty架构
CloudKitty的架构比较简单，我就不画图了。其服务进程就两个，cloudkitty-api和cloudkitty-processor，两者通过RPC通信，cloudkitty-api会与Keystone交互进行认证，cloudkitty-processor会与Ceilometer组件交互获取资源使用信息。

### cloudkitty-api
CloudKitty对外提供的API文档参考[这里][2]。

使用CloudKitty前，可以先查询系统中加载的rating modules：

    GET /rating/modules

CloudKitty API进程启动时会加载``cloudkitty.rating.processors``命名空间的模块，系统默认有两个，hashmap和pyscripts。当然，你也可以写自己的计费模块，让CloudKitty动态加载。  

    cloudkitty.rating.processors =
        noop = cloudkitty.rating.noop:Noop
        hashmap = cloudkitty.rating.hash:HashMap
        pyscripts = cloudkitty.rating.pyscripts:PyScripts

这个API操作不访问DB，从内存中读取。

在加载模块的同时，动态增加模块提供的rest api端点以及模块需要的数据表。即：用户可访问`/rating/module_config/hashmap`或者`/rating/module_config/pyscripts`。

可以调用API重新加载系统的module（无需服务重启）、enable/disable module、修改module优先级（优先级体现module处理计费数据的顺序）。更新module时，除了会更新db外，还会给cloudkitty-processor发送异步消息。

CloudKitty只定义了三个数据表，`service_to_collector_mappings`、`modules_state`、`states`，发送到/collector的请求（包含/collector/mappings和/collector/states）就是直接查询、操作DB。

### cloudkitty-processor
除了cloudkitty-api进程外，还有一个cloudkitty-processor进程。

cloudkitty-processor进程的主要工作有两个：

* 接收API发来的RPC消息，比如更新module的状态或优先级。
* 启动循环任务，在每一个计费周期内，对每个计费租户的资源使用情况进行查询和计费。

> 如何判定要给一个租户计费？在Keystone中为租户添加名为‘rating’的角色，CloudKitty调用keystone client获取这些租户列表

在CloudKitty中，查询的执行者叫collector，默认支持的plugin有两个，ceilometer和meta，也是在setup.cfg中定义。

> meta collector其实有些类似于Neutron已经废弃的meta plugin，能够同时支持多个collector。但我大概扫了一眼meta collector的代码，还是有很多bug，应该还不能用。而且除了meta，CloudKitty目前也就支持一个ceilometer collector，所以，meta collector目前还没有什么意义。

ceilometer collector其实就是调用ceilometer client，查询某个meter在一段时间内的statistics（Ceilometer的API参考[这里][3]）。CloudKitty有个默认配置：

    cfg.ListOpt('services',
                default=['compute',
                         'image',
                         'volume',
                         'network.bw.in',
                         'network.bw.out',
                         'network.floating'],
                help='Services to monitor.'), ]

表示几个需要向Ceilometer查询的资源，而可计费的维度就来自这些资源的属性。如果你想增加一个计费维度来自其他资源，那么就需要新增一个资源，需要：

- 增加services配置项
- 编写函数，从Ceilometer获取该资源的计量信息
- 调用API设置该资源中某个属性如何计费

对于查询出来的结果，按照rating processor的优先级（priority），依次调用process方法处理。对于hashmap，就是在查询出的data中加上计费信息（`data['rating']['price']`），将最终的计费数据由storage backend（默认是sqlalchemy）写入`rated_data_frames`表中。

rating processor处理的数据结构类似下面的数据结构：

    [{
      'period': {'begin': XXX, 'end': XXX}, 
      'usage': {
          'compute': [{
              'desc': {'数据'}, 
              'vol': {'unit': XXX, 'qty': XXX}
          }]
      }
    }]

rating processor从db中加载的计费配置类似如下结构：

    {
      'compute': {
        'fields': {'flavor': {'mappings': {'group_name': {'m1.nano': {'type': 'flat', 'cost': 0.20}}}, 
                                           'thresholds': {}}},
        'mappings': {'group_name': {'m1.nano': {'type': 'flat', 'cost': 0.20}}}, 'thresholds': {}}
      }
    }

## CloudKitty版本计划
根据Christophe在东京峰会上的介绍，在M版本，CloudKitty会尝试与Gnocchi集成、优化存储后端以及丰富计费报告的呈现。

## 总结
CloudKitty是2015下半年才进入的OpenStack big tent，能进入big tent的原因其实就是因为目前OpenStack在计费方面还是一片空白，CloudKitty的出现只是填补了这个空白，并不是CloudKitty这个项目做的有多好。相反，我把CloudKitty的源码通读了一下，代码逻辑写的很混乱。我也进了CloudKitty的IRC频道，通过几天的观察，目前的参与者和代码提交都不多，主要还是Objectif Libre公司的Stéphane在维护。比较有趣的是，国内几家startup公司，像Kylin Cloud、Awcloud、EasyStack在该项目都有代码[提交][4]，估计都是在计费方面对CloudKitty有过调研。

从架构上讲，CloudKitty比较简单但也比较到位，利用stevedore尽可能的将各个功能模块都插件化（查询、计费等功能），但从实现上讲，还是存在以下几个问题：

- cloudkitty-processor缺乏高可用设计。cloudkitty-api就不说了，前置一个haproxy就能够解决问题。但cloudkitty-processor如果要支持HA，需要做不小的改动。
- cloudkitty-processor的计费实时性差，并且在OpenStack大规模部署环境下，计费数据可能不准确（目前仅仅是从代码分析猜测，未作容量测试）。cloudkitty-processor的处理是在一个大循环中串行进行，对于一个租户的处理涉及访问DB（处理每个租户都会重新加载rating processor，processor的初始化会从DB读取计费配置）、访问Ceilometer（这里以ceilometer collector为例，每个meter至少访问一次）、每个processor串行处理、storage backend写DB，如果计费的租户比较多，一个循环下来可能耗时较长，就要相应的需要增加计费周期，但这样做，又会导致计费存在严重的滞后性。
- 目前CloudKitty能计费的维度是基于Ceilometer中resource的metadata属性进行转换而来的（其实就是OpenStack各个组件中资源属性）。如果有些想计费的资源在Ceilometer中没有，就无法实现计费了。（可以通过新增collector + meta collector实现）
- 目前，无论对一个资源是否计费，cloudkitty-processor都会collect该资源的信息，存在优化空间。

当然，提到计费，我想无论是公有云或私有云公司，都倾向于自己做，而且计费对于实时性和精准度要求都比较高(特别是像青云那种秒级计费的更是如此)，目前CloudKitty所处的阶段仅仅是能够支撑演示和简单试用，离真正商用还有很长的路要走。

---

附：  
阿里云计费规则: <https://help.aliyun.com/knowledge_detail/5974991.html>  
ICCLab: <http://blog.zhaw.ch/icclab/dynamic-rating-charging-billing-for-cloud-a-micro-service-perspective/>

[1]: http://cloudkitty.readthedocs.org/en/latest/index.html
[2]: http://cloudkitty.readthedocs.org/en/latest/webapi/v1.html
[3]: http://docs.openstack.org/developer/ceilometer/webapi/v2.html
[4]: http://stackalytics.com/?project_type=openstack&metric=commits&module=cloudkitty-group&release=all