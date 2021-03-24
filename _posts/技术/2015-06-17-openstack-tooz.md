---
layout: post
title: OpenStack中tooz介绍及实践
description: OpenStack中tooz介绍及实践
category: 技术
---

## 什么是tooz
啥是tooz，Google一把就出来。简单的说，tooz是一个python库，是一个实现分布式环境下成员管理、分布式锁、leader选举的**框架**。tooz最初是eNovance几个工程师编写的，关于tooz产生的背景可以阅读[这里](https://julien.danjou.info/blog/2014/python-distributed-membership-lock-with-tooz)。

> 自从接触了OpenStack，会发现“框架”这个词出现的频率太高，这年头啥都整个框架，抽象、封装，等你用习惯了，你才发现，其实你啥都不懂。

## 安装tooz
废话不说了，一些理论性的东西，还是建议正儿八经看文档。我喜欢demo，我喜欢实施。

安装tooz很简单，`pip install tooz`

## 安装zookeeper
从tooz的[开发者文档](http://docs.openstack.org/developer/tooz)可以看到，tooz目前支持很多[driver](http://docs.openstack.org/developer/tooz/drivers.html)，文档也基本是按照这些driver对tooz的支持程度来排序的。毫无疑问，作者推荐的、特性支持度最高的就是zookeeper了。

zookeeper也有很丰富的官方文档。这里仅仅备案我的安装过程。

wget http://apache.fayea.com/zookeeper/zookeeper-3.4.6/zookeeper-3.4.6.tar.gz （这里我使用的url对于你来说并不一定是速度最快的，建议到zookeeper官网看看它针对推荐的url）  
tar -xvf zookeeper-3.4.6.tar.gz   
cd zookeeper-3.4.6/  
mkdir -p /var/lib/zookeeper  
echo "1" > /var/lib/zookeeper/myid  
vi conf/zoo.cfg，输入如下内容：

	tickTime=2000  
	dataDir=/var/lib/zookeeper  
	clientPort=2181  
	server.1=127.0.0.1:2888:3888  

启动zookeeper服务：bin/zkServer.sh start  
连接zookeeper（Java方式）：bin/zkCli.sh -server 127.0.0.1:2181

ok，如果是一个干净的ubuntu系统，估计你会看到error，很有可能是因为没有安装Java。

在ubuntu上安装Java也比较简单，步骤如下：

	apt-get install -y python-software-properties
	add-apt-repository ppa:webupd8team/java
	apt-get update
	apt-get install -y oracle-java8-installer

再次连接zookeeper，看到类似如下输入说明成功：

    root@mistral:/opt/kong/zookeeper-3.4.6# bin/zkCli.sh -server 127.0.0.1:2181
    Connecting to 127.0.0.1:2181
    2015-06-17 11:26:13,165 [myid:] - INFO  [main:Environment@100] - Client environment:zookeeper.version=3.4.6-1569965, built on 02/20/2014 09:09 GMT
    2015-06-17 11:26:13,173 [myid:] - INFO  [main:Environment@100] - Client environment:host.name=<NA>
    2015-06-17 11:26:13,173 [myid:] - INFO  [main:Environment@100] - Client environment:java.version=1.8.0_45
    2015-06-17 11:26:13,176 [myid:] - INFO  [main:Environment@100] - Client environment:java.vendor=Oracle Corporation
    2015-06-17 11:26:13,177 [myid:] - INFO  [main:Environment@100] - Client environment:java.home=/usr/lib/jvm/java-8-oracle/jre
    2015-06-17 11:26:13,177 [myid:] - INFO  [main:Environment@100] - Client environment:java.class.path=/opt/kong/zookeeper-3.4.6/bin/../build/classes:/opt/kong/zookeeper-3.4.6/bin/../build/lib/*.jar:/opt/kong/zookeeper-3.4.6/bin/../lib/slf4j-log4j12-1.6.1.jar:/opt/kong/zookeeper-3.4.6/bin/../lib/slf4j-api-1.6.1.jar:/opt/kong/zookeeper-3.4.6/bin/../lib/netty-3.7.0.Final.jar:/opt/kong/zookeeper-3.4.6/bin/../lib/log4j-1.2.16.jar:/opt/kong/zookeeper-3.4.6/bin/../lib/jline-0.9.94.jar:/opt/kong/zookeeper-3.4.6/bin/../zookeeper-3.4.6.jar:/opt/kong/zookeeper-3.4.6/bin/../src/java/lib/*.jar:/opt/kong/zookeeper-3.4.6/bin/../conf:
    2015-06-17 11:26:13,178 [myid:] - INFO  [main:Environment@100] - Client environment:java.library.path=/usr/java/packages/lib/amd64:/usr/lib64:/lib64:/lib:/usr/lib
    2015-06-17 11:26:13,179 [myid:] - INFO  [main:Environment@100] - Client environment:java.io.tmpdir=/tmp
    2015-06-17 11:26:13,179 [myid:] - INFO  [main:Environment@100] - Client environment:java.compiler=<NA>
    2015-06-17 11:26:13,180 [myid:] - INFO  [main:Environment@100] - Client environment:os.name=Linux
    2015-06-17 11:26:13,180 [myid:] - INFO  [main:Environment@100] - Client environment:os.arch=amd64
    2015-06-17 11:26:13,181 [myid:] - INFO  [main:Environment@100] - Client environment:os.version=3.2.0-23-generic
    2015-06-17 11:26:13,181 [myid:] - INFO  [main:Environment@100] - Client environment:user.name=root
    2015-06-17 11:26:13,182 [myid:] - INFO  [main:Environment@100] - Client environment:user.home=/root
    2015-06-17 11:26:13,183 [myid:] - INFO  [main:Environment@100] - Client environment:user.dir=/opt/kong/zookeeper-3.4.6
    2015-06-17 11:26:13,184 [myid:] - INFO  [main:ZooKeeper@438] - Initiating client connection, connectString=127.0.0.1:2181 sessionTimeout=30000 watcher=org.apache.zookeeper.ZooKeeperMain$MyWatcher@3eb07fd3
    Welcome to ZooKeeper!
    2015-06-17 11:26:13,251 [myid:] - INFO  [main-SendThread(127.0.0.1:2181):ClientCnxn$SendThread@975] - Opening socket connection to server 127.0.0.1/127.0.0.1:2181. Will not attempt to authenticate using SASL (unknown error)
    JLine support is enabled
    2015-06-17 11:26:13,417 [myid:] - INFO  [main-SendThread(127.0.0.1:2181):ClientCnxn$SendThread@852] - Socket connection established to 127.0.0.1/127.0.0.1:2181, initiating session
    2015-06-17 11:26:13,438 [myid:] - INFO  [main-SendThread(127.0.0.1:2181):ClientCnxn$SendThread@1235] - Session establishment complete on server 127.0.0.1/127.0.0.1:2181, sessionid = 0x14e008e2880000c, negotiated timeout = 30000
    
    WATCHER::
    
    WatchedEvent state:SyncConnected type:None path:null
    [zk: 127.0.0.1:2181(CONNECTED) 0] 


## 程序如何访问zookeeper
tooz访问zookeeper也是通过程序的方式，但目前zookeeper官方仅支持Java和C的客户端，那作为Python程序员，咋整？其实，pypi上已经有支持zookeeper的python客户端了，叫[kazoo](https://pypi.python.org/pypi/kazoo)。

安装kazoo，pip install kazoo，其实如果安装tooz的话，kazoo会作为依赖被安装的。kazoo访问zookeeper也很简单：

	root@mistral:/vagrant/mistral_dev# python
	Python 2.7.3 (default, Dec 18 2014, 19:10:20) 
	[GCC 4.6.3] on linux2
	Type "help", "copyright", "credits" or "license" for more information.
	>>> from kazoo.client import KazooClient
	>>> zk = KazooClient(hosts='127.0.0.1:2181')
	>>> zk.start()
	>>> zk.stop()

不出错的话，就说明everything is ok.

> 需要注意的是，kazoo只是作为tooz中访问zookeeper的一个driver而已。

其实，pypi上还有一个library，叫[zake](https://pypi.python.org/pypi/zake)，主要用于对kazoo的mock，它提供与kazoo一致的模拟API，可用于UT，而且不需要你的环境上部署真实的zookeeper。

## 程序如何调用tooz
不知为何，我的环境中使用pip安装tooz后，setup.cfg中的entry_point并没有生效，所以我又用源码的方式安装了一遍。怎么判断是否生效呢？如下代码可以帮到你：

	>>> from pkg_resources import iter_entry_points
	>>> for object in iter_entry_points(group='tooz.backends', name=None):
	...     print object
	... 
	ipc = tooz.drivers.ipc:IPCDriver
	postgresql = tooz.drivers.pgsql:PostgresDriver
	kazoo = tooz.drivers.zookeeper:KazooDriver
	redis = tooz.drivers.redis:RedisDriver
	zake = tooz.drivers.zake:ZakeDriver
	file = tooz.drivers.file:FileDriver
	mysql = tooz.drivers.mysql:MySQLDriver
	memcached = tooz.drivers.memcached:MemcachedDriver

我们使用的就是kazoo。

通过程序调用tooz，要配合zookeeper提供的java命令行，才更加直观。

	>>> from tooz import coordination
	>>> coordinator = coordination.get_coordinator('kazoo://127.0.0.1:2181', b'host-1')
	>>> coordinator.start()

切换到zookeeper cli：

	bin/zkCli.sh -server 127.0.0.1:2181
	[zk: 127.0.0.1:2181(CONNECTED) 0] ls /
	[tooz, zookeeper]

看到了tooz节点。继续转到python下：

	>>> import six, uuid
	>>> group = six.binary_type(six.text_type(uuid.uuid4()).encode('ascii'))
	>>> print group
	c5bbb3fa-0395-4f83-8ad9-412e2f224175
	>>> request = coordinator.create_group(group)
	>>> request.get()

再切换到zookeeper cli：

	[zk: 127.0.0.1:2181(CONNECTED) 1] ls /tooz
	[c5bbb3fa-0395-4f83-8ad9-412e2f224175]

python：

	>>> request = coordinator.join_group(group)

zookeeper:

	[zk: 127.0.0.1:2181(CONNECTED) 2] ls /tooz/c5bbb3fa-0395-4f83-8ad9-412e2f224175
	[host-1]

python: 

	>>> coordinator.stop()

zookeeper:

	[zk: 127.0.0.1:2181(CONNECTED) 3] ls /tooz/c5bbb3fa-0395-4f83-8ad9-412e2f224175
	[]
	[zk: 127.0.0.1:2181(CONNECTED) 4] ls /tooz                                     
	[c5bbb3fa-0395-4f83-8ad9-412e2f224175]

## OpenStack目前如何使用tooz
看过上面我推荐的tooz的产生背景之后你会发现，其实这个blog的作者Julien就是Ceilometer项目的core member，那理所当然，tooz已经在Ceilometer中使用，主要用在alarm-evaluator服务。

Nova最近（2015.6.17）也有相关的讨论，主要是因为Nova中的service管理存在接口信息来源不一致的情况，并且service group的几个driver实现也不尽如人意，目前用的最多的还是db的方式，zookeeper的driver已经不work了。相关的几个链接：  
<https://blueprints.launchpad.net/nova/+spec/tooz-for-service-groups>  
<https://review.openstack.org/#/c/138607/>

## 参考链接
tooz开发者文档：<http://docs.openstack.org/developer/tooz/>  
kazoo文档：<https://kazoo.readthedocs.org/en/latest/>
