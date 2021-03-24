---
layout: post
title: OpenStack中的扩展--以Nova为例
description: OpenStack中的扩展--以Nova为例
category: 技术
---

本篇是纯粹的技术贴，废话不多说。

OpenStack Version: Juno stable 2014.2

## 消息处理
这里说的消息处理，不光指处理消息请求，也处理消息响应。Nova中对消息的过滤配置，都在api-paste.ini中：  
![](/images/2014-10-02-nova-extensions/1.png)

图中如keystone一行中，就定义了消息处理的不同的filter，比如`compute_req_id`就是给收到的每条消息定义一个id号，标识消息的整个处理流程，也便于错误定位；再比如`ratelimit`限制了某个用户对某个资源操作的频率，防止对系统的恶意攻击；如果你要增加对消息的处理环节，很简单，找到比如`compute_req_id`这个filter的处理代码（也多看看其他filter），仿照写一份不是什么难事。

## 接口扩展
作为Restful API，Nova中定义了一些资源和资源对应的操作，例如server, consoles, ips, images等等。但Nova允许自定义资源、自定义资源（包括已有资源）的操作，以及扩展对资源的返回结果等。原有的资源及操作定义文件在nova.api.openstack.compute中，扩展文件都在nova.api.openstack.compute.contrib目录下（或其子目录下），使用时注意两点：

* 可以在contrib目录下新建子目录，将自己的自定义扩展放在该目录下，会被自动加载；
* 随着特性越来越多，原有的contrib目录下自带很多Nova扩展，但在实际使用中，并不是每一个都会用到，可以通过配置`osapi_compute_ext_list`只选择用到的扩展，而将有些比较鸡肋的扩展忽略掉；

## 增加API请求参数
其实不建议这么做。API文档中已经说明了消息请求参数和返回值，如果非要为了实现一些定制化的需求，也不是不可以，只是需要修改源码，并且要承担与upstream不一致的后果。因为比较害人，所以在此不详细说明，如果真有需求，对此感兴趣的童鞋可以私下找我讨论。

提示：对于创建虚拟机来说，注意`@wsgi.deserializers(xml=CreateDeserializer)`

## nova api/nova manager……
Nova中很多地方的扩展，其实是得益于python的动态语言特性。

	def import_class(import_str):
	    """Returns a class from a string including module and class."""
	    mod_str, _sep, class_str = import_str.rpartition('.')
	    __import__(mod_str)
	    try:
	        return getattr(sys.modules[mod_str], class_str)
	    except AttributeError:
	        raise ImportError('Class %s cannot be found (%s)' %
	                          (class_str,
	                           traceback.format_exception(*sys.exc_info())))

这里说的nova api的扩展呢，其实比较勉强，其实就是你自己定义Compute API的处理（也就是`/nova/api/openstack/compute/servers.py`中Controller类中的`self.compute_api`），比如你自己继承原有的compute api，然后增加一些处理。这种方式比较牵强，不推荐。

## nova scheduler
把nova-scheduler单独拿出来说的原因是未来调度器会独立出来（现在的Gantt项目），但迁移工作已经开始，现在nova中与scheduler通信已经不是直接的RPC了，而是通过一个中间层SchedulerClient做的转换（/nova/scheduler/client/），里面用到了动态加载。

另外，对于Nova中包含的Scheduler，也可以通过配置，扩展定制选择主机的方式。Operation Guide中有一个很棒的[例子](http://docs.openstack.org/openstack-ops/content/customize.html#nova_scheduler_example)。

## nova scheduler filter
当使用如下配置时，就涉及scheduler中的过滤器了：

	scheduler_driver = nova.scheduler.filter_scheduler.FilterScheduler

Juno版本，Nova中的scheduler filter介绍可以参考[这里](http://docs.openstack.org/trunk/config-reference/content/section_compute-scheduler.html)。

filter的扩展机制与下面要讲的ResourceTracker中的ResourceHandler扩展机制一样。

## nova hypervisor driver
同nova api一样，nova hypervisor driver也是通过动态加载的方式来确定。在nova的配置文件中`compute_driver`定义（比如`libvirt.LibvirtDriver`或`vmwareapi.VMwareVCDriver`）。

## hooks
如果你想在Nova的内部API处理前后增加一些额外处理，可以使用Nova提供的hooks机制。比如compute api中resize虚拟机的处理（其实目前能看到的也就是create/delete/instance-network-info接口，下面仅仅是举例）：

	from nova import hooks
	
	@hooks.add_hook("resize_hook")
	def resize(self, context, instance, a=1, b=2):

那么自定义操作怎么写？在你随Nova代码库一起发布的自定义代码包中，在安装脚本setup.py中，作如下定义：

	entry_points = {
	    'nova.hooks': [
	        'resize_hook=your_package.hooks:YourHookClass',
	    ]
	},

你的代码看起来应该是这样：

	class YourHookClass(object):
	
	    def pre(self, *args, **kwargs):
	        ....
	
	    def post(self, rv, *args, **kwargs):
	        ....

关于hooks，[这里](http://blog.oddbit.com/2014/09/27/integrating-custom-code-with-n)有一篇老外的博客可供参考。

## ResourceTracker
以下简称rt。rt作为OpenStack资源跟踪管理器，负责收集计算节点上的资源以及将资源情况通知nova-scheduler作为选择主机的依据。

说实话，rt现在的设计有些乱。

每个计算节点上有很多资源，在最开始时，虚拟机的调度和创建，只关心节点的cpu、内存、磁盘等资源。但是随着虚拟化管理越来越精细，特别是NFV场景下，我们需要更为精细化的资源控制。但众口难调，哪些资源需要刷新，哪些不需要刷新，大家难以达成一致。于是，社区就针对rt提供了扩展机制，意思是告诉大家，你关心啥资源，就自己写插件实现这个资源的管理。

rt中有一个`ext_resources_handler`（`/nova/compute/resources/`），采用stevedore库实现插件机制，默认只有一个vcpu处理类。关于对stevedore的简介可以参考我的[这篇](http://blog.csdn.net/lynn_kong/article/details/9704413)博客。在刷新资源的最后，调用ResourceHandler的write方法，将资源最新状态写到rt的Resources中，更新数据库。  
> 这里其实也是设计失败之处。自定义资源，必须在DB中的ComputeNode表新增资源属性。否则，即便加了resource extension，nova-scheduler还是无法获取到。所以，所谓的‘扩展’是个假扩展，无法完全解耦。

此外，资源上报时还会获取主机的metrics资源，与ResourceHandler不同的是，这个metrics资源的获取是采用extension机制。它的实现在/nova/compute/monitors/目录下，目前也只有一个ComputeDriverCPUMonitor实现。

在Kilo版本，Jaypipes提出一个blueprint解决resource tracker资源操作不一致的问题，有兴趣可以参见如下链接：  
<http://specs.openstack.org/openstack/nova-specs/specs/kilo/approved/resource-objects.html>

## 与Libvirt的交互
说白了，Nova从本质上来说就是在玩libvirt，与libvirt交互时，可能有这样的use case：虚拟化层想知道关于自己管理domain（也就是Nova instance）的信息，那么要么它需要调用Nova API查询，要么直接访问DB。但我想如果你是虚拟化层的SE，你不会想依赖任何第三方。于是我们可以用如下的方式：

> 该方式也是Juno版本中引入的新特性。design spec[在此](http://specs.openstack.org/openstack/nova-specs/specs/juno/implemented/libvirt-driver-domain-metadata.html)。

通过定义domain xml中的metadata元素，可以将虚拟机的名称、规格、创建时间、用户/租户、镜像或磁盘信息向虚拟化层直接暴露。这样，虚拟化层就不依赖于任何组件。