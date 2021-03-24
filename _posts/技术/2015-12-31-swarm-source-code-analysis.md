---
layout: post
title: Swarm源码分析(未完待续)
description: Swarm源码分析
category: 技术
---

> 本文适合Go语言和Swarm的初学者

在我之前的一篇[博客](http://lingxiankong.github.io/blog/2015/12/20/docker-swarm-in-mac/)中，我在本地mac机器上搭建了swarm。前两天刚刚看完了Go的基础教程，所以，我就顺着swarm搭建的步骤，来尝试阅读swarm的源码。

因为我搭建swarm集群时使用的是swarm的docker镜像，所以就从swarm中的dockerfile文件开始吧。

## swarm dockerfile
swarm的dockerfile很简单，只有十几行。在镜像中安装了swarm，暴漏2375端口，容器入口命令为swarm。

也就是说，我使用`docker run --rm swarm create`命令获取token时，实际上在swarm容器里运行的是`swarm create`命令。同样，执行`docker run -d swarm join --addr=192.168.33.12:2375 token://a3ec81af8d0d0690fcaf2ac95042f771`，等同于在容器里执行`swarm join...`命令，但注意，此时，容器是以deamon方式运行，容器中应该有后台服务在跑。

由此推测，swarm肯定有命令行解析程序。

## swarm命令行
Go程序的入口函数是main，刚好swarm主目录下就有main.go文件，里面就有main函数。main函数很简单：

	func main() {
		cli.Run()
	}

swarm使用了github上的<https://github.com/codegangsta/cli>项目，其实就是类似于Python中的argparse模块，提供命令行解析功能。有兴趣的可以阅读该项目的readme。

swarm定义了两个命令行参数，debug和log-level，无关痛痒。同时提供了4个命令，create, list, manage, join，这四个命令我在创建swarm集群时都用到了。

## swarm join
在使用docker hub提供的token机制做服务发现时（虽然没有成功），我用的第一个命令就是join，将本节点加入swarm集群，命令见上。

join支持4个参数：

	{
		Name:      "join",
		ShortName: "j",
		Usage:     "join a docker cluster",
		Flags:     []cli.Flag{flJoinAdvertise, flHeartBeat, flTTL, flDiscoveryOpt},
		Action:    join,
	},

参数定义在cli/flags.go中，分别表示本机docker engine的服务地址、心跳值、TTL和服务发现的参数（就是token://XXX字符串）。用这几个参数调用discovery包种的New和Register方法。

## discovery register
接着找到discovery包种的New方法，发现读取了一个map类型的全局变量discoveries，其值是Discovery类型，但在discovery.go文件中却没有找到对discoveries的赋值，隐隐约约觉得，swarm官网所谓的可插拔的discovery backends，估计就是在各自的包中往discoveries中注册内容。

于是，直接到discovery/token/token.go中找init，果不其然：

	func init() {
		Init()
	}
	
	// Init is exported
	func Init() {
		discovery.Register("token", &Discovery{})
	}

对于token机制的服务发现来说，节点的注册就是往`https://discovery.hub.docker.com/v1/clusters/<token>?ttl=180`的URL发送了POST请求，请求的body体是命令行中的addr值。

我之前使用token方式之所以失败，就是因为国内对discovery.hub.docker.com域名的访问受限导致。

同时，应该注意，join命令不会退出，而是在一个死循环中，每隔一段时间（心跳间隔），都会做一次注册的动作，以此保证自身对swarm manager的可见性。

当然，除了docker hub token的方式，swarm还提供了很多服务发现的plugin，在官网上有很好的介绍，其代码结构与token.go类似。

> 如果是node或file的方式，不需要在各个agent节点上执行join命令。相应的，它们也没有Register方法。

## swarm manage
manage是swarm最为重要的管理命令。一旦swarm manage命令在Swarm节点上被触发，则说明用户开始管理Docker集群了。manage命令的参数也比较多，我就不一一细说。主要的参数是容器[放置策略](https://docs.docker.com/swarm/scheduler/strategy/)、[过滤器](https://docs.docker.com/swarm/scheduler/filter/)、支持[HA](https://docs.docker.com/swarm/multi-manager-setup/)的参数、安全访问TLS等。

在manage函数中，依次创建discovery、strategy、filters、scheduler（使用strategy、filter）、cluster（使用discovery, scheduler）对象，最终创建API服务，监听API请求。

其中，**创建cluster对象时，同时启动了docker主机的刷新线程。一个线程定时查询集群中的增删主机，轮询时间由heartbeat参数决定，另一个线程根据查询的结果维护内存中的所有docker主机信息。cluster对象中维护了engines列表，即各个docker主机的信息**。

	discoveryCh, errCh := cluster.discovery.Watch(nil)
	go cluster.monitorDiscovery(discoveryCh, errCh)

manage命令会启动HTTP server，接收API请求。swarm目前对外提供的API定义都在api/primary.go中：

	var routes = map[string]map[string]handler{
		"HEAD": {
			"/containers/{name:.*}/archive": proxyContainer,
		},
		"GET": {
			"/_ping":                          ping,
			"/events":                         getEvents,
			"/info":                           getInfo,
			"/version":                        getVersion,
			"/images/json":                    getImagesJSON,
			"/images/viz":                     notImplementedHandler,
			"/images/search":                  proxyRandom,
			"/images/get":                     getImages,
			"/images/{name:.*}/get":           proxyImageGet,
			"/images/{name:.*}/history":       proxyImage,
			"/images/{name:.*}/json":          proxyImage,
			"/containers/ps":                  getContainersJSON,
			"/containers/json":                getContainersJSON,
			"/containers/{name:.*}/archive":   proxyContainer,
			"/containers/{name:.*}/export":    proxyContainer,
			"/containers/{name:.*}/changes":   proxyContainer,
			"/containers/{name:.*}/json":      getContainerJSON,
			"/containers/{name:.*}/top":       proxyContainer,
			"/containers/{name:.*}/logs":      proxyContainer,
			"/containers/{name:.*}/stats":     proxyContainer,
			"/containers/{name:.*}/attach/ws": proxyHijack,
			"/exec/{execid:.*}/json":          proxyContainer,
			"/networks":                       getNetworks,
			"/networks/{networkid:.*}":        proxyNetwork,
			"/volumes":                        getVolumes,
			"/volumes/{volumename:.*}":        proxyVolume,
		},
		"POST": {
			"/auth":                               proxyRandom,
			"/commit":                             postCommit,
			"/build":                              postBuild,
			"/images/create":                      postImagesCreate,
			"/images/load":                        postImagesLoad,
			"/images/{name:.*}/push":              proxyImagePush,
			"/images/{name:.*}/tag":               postTagImage,
			"/containers/create":                  postContainersCreate,
			"/containers/{name:.*}/kill":          proxyContainerAndForceRefresh,
			"/containers/{name:.*}/pause":         proxyContainerAndForceRefresh,
			"/containers/{name:.*}/unpause":       proxyContainerAndForceRefresh,
			"/containers/{name:.*}/rename":        postRenameContainer,
			"/containers/{name:.*}/restart":       proxyContainerAndForceRefresh,
			"/containers/{name:.*}/start":         proxyContainerAndForceRefresh,
			"/containers/{name:.*}/stop":          proxyContainerAndForceRefresh,
			"/containers/{name:.*}/wait":          proxyContainerAndForceRefresh,
			"/containers/{name:.*}/resize":        proxyContainer,
			"/containers/{name:.*}/attach":        proxyHijack,
			"/containers/{name:.*}/copy":          proxyContainer,
			"/containers/{name:.*}/exec":          postContainersExec,
			"/exec/{execid:.*}/start":             postExecStart,
			"/exec/{execid:.*}/resize":            proxyContainer,
			"/networks/create":                    postNetworksCreate,
			"/networks/{networkid:.*}/connect":    proxyNetworkContainerOperation,
			"/networks/{networkid:.*}/disconnect": proxyNetworkContainerOperation,
			"/volumes/create":                     postVolumesCreate,
		},
		"PUT": {
			"/containers/{name:.*}/archive": proxyContainer,
		},
		"DELETE": {
			"/containers/{name:.*}":    deleteContainers,
			"/images/{name:.*}":        deleteImages,
			"/networks/{networkid:.*}": deleteNetworks,
			"/volumes/{name:.*}":       deleteVolumes,
		},
	}

## 创建container
就跟在openstack中创建虚拟机一样，跟踪一下swarm中创建container的流程，几乎就可以了解swarm中全部的运行机制了。但读完创建容器的代码，发现相比openstack，swarm中的逻辑还是比较简单，可能还是个新项目，并且在生产环境中使用的还不多，并没有考虑openstack中早已碰到的并发效率等问题，而且调度模块也不像openstack那样是一个独立的服务。但如果真的是弄成独立的服务了，又会失去轻量的优势。

根据上面的URL路由，创建虚拟机由postContainersCreate函数处理，并最终走到cluster对象的createContainer方法处理。

容器名称唯一性判断、生成SwarmID、选取docker主机等操作都是在scheduler的锁中进行，然后调用engine对象的Create方法创建容器，最后在锁中删除cluster对象pendingContainers中对应的中间态容器。

选取docker主机时，新建了一个列表对象nodes，其实是跟engines对应，基本信息都是从engines而来，但会考虑所有正在创建中的容器（计算可用的cpu和memory）。