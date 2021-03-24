---
layout: post
title: OpenSwan如何实现VPNaaS
description: OpenSwan如何实现VPNaaS
category: 技术
---

同样的事情我刚接触Neutron的时候也做过。其实你说Neutron的实现吧挺复杂的，但毕竟到最后还是要依靠底层的网络软件去实现具体的网络能力，所以如果让一个懂网络的人来看Neutron，视角肯定是自底向上。而对于我这种一开始是网络文盲的人，只有乖乖的从API入口开始，一直到底层的一系列网络命令，Neutron只是做了逻辑管理而已。VPNaaS也一样，底层常见的实现是OpenSwan和StrongSwan，两个都是开源实现，StrongSwan要比OpenSwan在能力上略胜一筹。因为我们的公有云里仍然使用OpenSwan（别问我为啥），但我们有迁移到StrongSwan的需求，迁移之前我需要做些调研，所以就有了本篇博客，在此做个记录，以供后续查阅。

> 阅读本篇博客要求你熟悉Neutron

## VPN Service Plugin
跟其他service plugin（比如l3）一样，需要在neutron.conf中增加配置（Neutron已经废弃在各个service自己的conf文件里配置service provider）：

    [service_providers]
    service_provider=VPN:openswan:neutron_vpnaas.services.vpn.service_drivers.ipsec.IPsecVPNDriver:default

部署VPNaaS是需要有一坨代码（plugin）运行在neutron api server上的，用来接收处理跟vpnaas资源相关的请求，操作db，并根据需要向部署在l3 node上的vpn agent进程发送RPC消息。同时，vpn plugin会利用Neutron的[回调机制](https://docs.openstack.org/developer/neutron/devref/callbacks.html)注册几个回调。比如，vpn功能实现在router上，那么通过neutron命令删除router之前就要先问一问vpnaas同不同意这个删除操作，因为一旦误删，就会影响vpn service的正常使用。

neutron api server启动之后，就是正常的rest api处理。vpnaas中有几个resource：ipsecpolicy，ikepolicy，vpnservice，ipsec_site_connection。前面3个的资源操作相对简单，就是与neutron db的增删改查，保存的信息都是为后续的vpn配置做准备。对ipsec_site_connection的操作才会真正发消息到vpn agent，由vpn agent负责执行一系列ipsec命令来建立、更新vpn连接。

## Create ipsec_site_connection
既然，创建ipsec_site_connection是创建vpn service的关键，那么我们就专门来看看这个操作具体是如何实现。

在neutron api server，vpn plugin对创建请求做了一系列校验后，在db中创建ipsec_site_connection资源。然后，向router关联的所有l3 agent（如果启用HA Router，可能会有多个l3 agent关联同一个router）发送RPC消息。调用方法是vpnservice_updated，参数就是router_id。

再来看vpn agent。vpn agent直接复用l3 agent的代码实现，所以**在部署vpn agent服务的节点，该服务也同时充当l3 agent的角色，不用单独再启动l3 agent**，如果使用`neutron agent-list`命令，你会发现所有的l3 agent的binary字段都是“neutron-vpn-agent”。vpn agent相关配置：

    [vpnagent]
    vpn_device_driver=neutron_vpnaas.services.vpn.device_drivers.ipsec.OpenSwanDriver
    # vpn_device_driver=neutron_vpnaas.services.vpn.device_drivers.strongswan_ipsec.StrongSwanDriver
    [ipsec]
    enable_detailed_logging=True
    [pluto]
    restart_check_config=True

理论上vpn agent支持同时配置多个driver（我还没有测试过如果同时配置了openswan和strongswan会是什么情况），正是初始化这些driver时，会创建consumer监听RPC调用。上述的vpnservice_updated，就是在这些driver中被处理：

- 在iptable nat表中为ipsec通信增加规则，`iptable -t nat -A POSTROUTING -s <local_cidr> -d <peer_cidr> -m policy --dir out --pol ipsec -j ACCEPT`
- 执行一系列命令创建ipsec进程（具体命令参考下一章节），一个vpnservice对应内部的一个Process对象
- 更新vpn service和vpn connections的状态

随后，driver还会处理已被删除的vpn service对应的process和对应不存在的router运行的process。

vpn agent初始化时也会针对router的操作注册几个回调。

vpn agent还支持ha router。当router发生主备倒换时，需要将slave router所在的vpn agent上的ipsec进程干掉。

## IPsec Process (VPN Service)
在代码中，一个process对象内维护了connection_status，记录每个connection的状态，只要有一个connection status是active，那么这个process（vpn service）状态就是active。

driver中会有定时任务（默认是1min）更新vpn service和connections的状态。

## OpenSwan实现
假设你已经通过Neutron的命令建立起了一个ipsec site connection，那么就可以抛开Neutron，通过自己修改ipsec的配置来调试vpn连接。如下操作是在l3 node上，你可以先修改`/var/lib/neutron/ipsec/$ROUTER_ID/etc/ipsce.conf`里你感兴趣的配置，然后运行如下一系列命令来重启ipsec connection以及ipsec process：

```
ROUTER_ID='e4b920f7-4c2e-4e22-aab4-179ac1a4b783'
IPSEC_CONN_ID='dbf5e9e6-04fb-423c-8ed6-72faec16c344'
PEER_IP='10.13.37.21'
SUBNET_1='192.168.3.0/24'
SUBNET_2='192.168.4.0/24'

# 查看ipsec进程状态
ip netns exec qrouter-$ROUTER_ID ipsec whack --ctlbase /var/lib/neutron/ipsec/$ROUTER_ID/var/run/pluto --status
# 删除跟connection相关联的SA
ip netns exec qrouter-$ROUTER_ID ipsec whack --ctlbase /var/lib/neutron/ipsec/$ROUTER_ID/var/run/pluto --name $IPSEC_CONN_ID/0x1 --terminate
# 停止pluto进程
ip netns exec qrouter-$ROUTER_ID ipsec whack --ctlbase /var/lib/neutron/ipsec/$ROUTER_ID/var/run/pluto --shutdown
# 重新启动pluto进程
ip netns exec qrouter-$ROUTER_ID ipsec pluto --ctlbase /var/lib/neutron/ipsec/$ROUTER_ID/var/run/pluto --ipsecdir /var/lib/neutron/ipsec/$ROUTER_ID/etc --use-netkey --uniqueids --nat_traversal --secretsfile /var/lib/neutron/ipsec/$ROUTER_ID/etc/ipsec.secrets --virtual_private "%v4:$SUBNET_1,%v4:$SUBNET_2" --perpeerlog --perpeerlogbase /var/lib/neutron/ipsec/$ROUTER_ID/log --debug-all
# 添加connection
ip netns exec qrouter-$ROUTER_ID ipsec addconn --ctlbase /var/lib/neutron/ipsec/$ROUTER_ID/var/run/pluto.ctl --defaultroutenexthop $PEER_IP --config /var/lib/neutron/ipsec/$ROUTER_ID/etc/ipsec.conf $IPSEC_CONN_ID
# discover public interfaces and start accepting messages from peers
ip netns exec qrouter-$ROUTER_ID ipsec whack --ctlbase /var/lib/neutron/ipsec/$ROUTER_ID/var/run/pluto --listen
# Finally, we are ready to get pluto to initiate negotiation for an IPsec SA (and implicitly, an ISAKMP SA)
ip netns exec qrouter-$ROUTER_ID ipsec whack --ctlbase /var/lib/neutron/ipsec/$ROUTER_ID/var/run/pluto --name $IPSEC_CONN_ID --asynchronous --initiate
```