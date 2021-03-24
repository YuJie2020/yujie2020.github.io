---
layout: post
title: Kuryr 介绍 - 使用篇 - baremetal use case
category: 技术
---

更新历史：

1. 2018.02.07 初稿完成
2. 2018.03.12 更新对 kuryr 现状的理解

## 前言

突然关注 Kuryr 是因为我正好在研究 k8s 集群如何跟 openstack 环境通信，我的 qinling 项目也有容器跟虚拟机的通信需求。k8s 现在是热门不假，但毕竟我们还在做 openstack 的生意，自然就会碰到虚拟机和容器的混合部署。直接在 openstack 集群部署 k8s 不现实，那样会对资源管理和运维带来很大不便。所以最直观的部署方式就是 k8s 和 openstack 是相互独立的集群，各自管理各自的资源，当然，更高级一点就是 k8s 跑在 openstack 的 vm 里，彼此是上下层的关系，利用 neutron 的网络做 overlay。但对于处于架构转型的用户来说，一个很现实的需求就是在业务从虚拟机向容器架构的迁移过程中，需要 container 和 vm 之间相互通信来实现过渡期的业务。再者就是对于像 qinling 这样的服务，底层依赖 container 实现，对用户透明，但用户希望自己的 function 里能够访问部署在自己 vm 里的服务，既然来自同一个云的服务，如果再让用户给 vm 绑定一个 floating ip 才能搞定就有些耍流氓了。

openstack 里的 kuryr 项目就是实现 container 和 vm 通信的服务。现在想想这个项目的起源其实挺感慨，当年 openstack 如日中天的时候，华为在以色列招聘了几个“高端专家”来巩固在 openstack 社区贡献的投入力量，这几位专家来了之后先后在 openstack 社区创立了几个项目，Karbor，Dragonflow，Kuryr，Fuxi 等，当时 docker 好像才刚刚出来没多久，况且 openstack 正在一路高歌猛进，并没有多少人会关注 container 和 vm 之间的联系，所以这些项目在当时的华为并没有得到多少重视，也没有予以足够的投入力量，更别说研发落地，就一直处于半死不活的状态。时过境迁，可能现在华为早已不 care 这些项目了，核心贡献者估计都换了一茬又一茬，时至今日，我才发现这些项目在当时其实也算是“高瞻远瞩”吧，只是没赶上天时地利人和。

无论如何，现在来看，kuryr 项目在一些特定场景下还是有实际的使用价值的。截止目前，kuryr team 主要由来自 redhat 的工程师组成，redhat 在 openshift 中提供了 kuryr-k8s 与 openstack 的集成。

## Kuryr 介绍

kuryr 项目创立的时候，k8s 还处于婴幼儿期，所以当时 kuryr 主要面向 docker 网络，而现在针对 k8s 的 kuryr-kubernetes 项目反而更加活跃。本文直接忽略 kuryr-libnetwork，主要介绍使用 kuryr-kubernetes。

kuryr-k8s 并不是一个单独的服务，而是在 k8s 中提供了两个组件，目的是接管 k8s 中的 pod  的网络，后续又加入了对 service/endpoint 的支持。但 kuryr 是利用 neutron 的能力为 pod 提供网络功能，这样 pod 才能与 vm 网络互通。所以，kuryr 的北向是 k8s api 接口，南向是 OpenStack Neutron。也正是因为 kuryr-k8s 接管了 pod 的网络，所以导致 kuryr-k8s 必须要随着 k8s 后续的网络特性演进，比如要实现 service，比如要支持 network policy，再比如 k8s 有了 ingress，既然 kuryr-k8s 有自己的 service 实现，那么就要想想如何实现 ingress controller(或者如何集成已有的 ingress controller)，感觉有点骑虎难下的意思。而且 kuryr-k8s 中的一些实现可能还与 k8s 自己的实现有冲突，比如如何处理好与 cloud provider 的关系。

kuryr 支持两种典型场景：

- 单独的 k8s 集群 和 openstack 环境，k8s node 与 nova compute node 二层互通，在每个 k8s node 上需要安装 neutron agent，实现 pod 与 vm 通信
  ![](/images/2018-02-07-kuryr-introduction-baremetal-usecase/baremetal.png)

- k8s 部署在 vm 中。即 openstack 环境中创建 vm，在 vm 中安装 k8s 集群，vm 中的 pod 与其他 vm 通信。典型的应用就是在 magnum 实现租户的 pod 能够访问自己的 vm。需要在 k8s vm 中安装kuryr-controller 和kuryr-cni，利用 neutron 的 trunk port 功能实现 vm 中的 pod 跟 openstack 环境中其他 vm 通信
  ![](/images/2018-02-07-kuryr-introduction-baremetal-usecase/nested_container.png)

本文关注场景一。并且本文是使用篇，不涉及任何的代码实现。

## 安装 devstack 环境
在 ubuntu 16.04上，推荐使用4G或以上内存：
```shell
sudo -s; cd ~
git clone https://git.openstack.org/openstack-dev/devstack
mkdir -p /opt/stack && cd /opt/stack
git clone https://git.openstack.org/openstack/kuryr-kubernetes
chown -R ubuntu.ubuntu /opt/stack
cd ~/devstack
curl -sS https://gist.githubusercontent.com/LingxianKong/42de380d1021f275e0d561e4b6505562/raw/57db591918f868d2e63b4ae28e713b78d150c3e9/kuryr_baremetal_devstack_local.conf -o local.conf
chown -R ubuntu.ubuntu ~/devstack
./stack.sh
```

## kuryr 功能验证
环境装好后，devstack 安装了一个 all in one (openstack+k8s) 的环境。先使用一下，创建一个 pod：
```shell
# kubectl get nodes
NAME                      STATUS    ROLES     AGE       VERSION
lingxian-kuryr-devstack   Ready     <none>    26m       v1.8.5
# kubectl run my-alpine --image=lingxiankong/alpine-test
deployment "my-alpine" created
# kubectl get po -o wide
NAME                         READY     STATUS    RESTARTS   AGE       IP          NODE
my-alpine-6898cf864b-98jbr   1/1       Running   0          1m        10.0.0.68   lingxian-kuryr-devstack
```

我们看到 pod 分配到了一个 ip 地址，到 neutron 看一看：
```shell
# os port list | grep 10.0.0.68
| 68371534-2456-4f4d-861d-8936ec6595cb | my-alpine-6898cf864b-98jbr                           | fa:16:3e:5c:46:1a | ip_address='10.0.0.68', subnet_id='b39fb1df-0ce6-4e68-8c1c-223dad2db008'                            | ACTIVE |
# os port show 68371534-2456-4f4d-861d-8936ec6595cb
+-----------------------+----------------------------------------------------------------------------+
| Field                 | Value                                                                      |
+-----------------------+----------------------------------------------------------------------------+
| admin_state_up        | UP                                                                         |
| allowed_address_pairs |                                                                            |
| binding_host_id       | lingxian-kuryr-devstack                                                    |
| binding_profile       |                                                                            |
| binding_vif_details   | datapath_type='system', ovs_hybrid_plug='True', port_filter='True'         |
| binding_vif_type      | ovs                                                                        |
| binding_vnic_type     | normal                                                                     |
| created_at            | 2018-02-05T11:24:58Z                                                       |
| data_plane_status     | None                                                                       |
| description           |                                                                            |
| device_id             | 316f5550-0a67-11e8-b991-fa163e69e812                                       |
| device_owner          | compute:kuryr                                                              |
| dns_assignment        | None                                                                       |
| dns_name              | None                                                                       |
| extra_dhcp_opts       |                                                                            |
| fixed_ips             | ip_address='10.0.0.68', subnet_id='b39fb1df-0ce6-4e68-8c1c-223dad2db008'   |
| id                    | 68371534-2456-4f4d-861d-8936ec6595cb                                       |
| ip_address            | None                                                                       |
| mac_address           | fa:16:3e:5c:46:1a                                                          |
| name                  | my-alpine-6898cf864b-98jbr                                                 |
| network_id            | 38178d9f-ecd5-4a93-90ea-fb4110d52bf1                                       |
| option_name           | None                                                                       |
| option_value          | None                                                                       |
| port_security_enabled | True                                                                       |
| project_id            | f4e3108ade324967945d87aa54c37203                                           |
| qos_policy_id         | None                                                                       |
| revision_number       | 5                                                                          |
| security_group_ids    | 01b53fa5-8766-4ea9-bd77-2f01bf9e206b, 6836f35e-d5e2-4b15-90ea-7c794b64d572 |
| status                | ACTIVE                                                                     |
| subnet_id             | None                                                                       |
| tags                  |                                                                            |
| trunk_details         | None                                                                       |
| updated_at            | 2018-02-05T11:25:29Z                                                       |
+-----------------------+----------------------------------------------------------------------------+
```
k8s 每创建一个 pod，kuryr 就会在 neutron 创建对应的 port，port 名称就是 pod 的名字。有人可能会问，创建 port 的那些参数，kuryr 是怎么确定的？答：写死的！是的，在 kuryr 的配置文件中可以看到：
```ini
[neutron_defaults]
external_svc_subnet = 02d9f978-e7d4-43e8-b662-89d4cfc30a68
ovs_bridge = br-int
service_subnet = 390c5da6-99c8-4783-b5bc-f4d96acc538c
pod_security_groups = 01b53fa5-8766-4ea9-bd77-2f01bf9e206b,6836f35e-d5e2-4b15-90ea-7c794b64d572
pod_subnet = b39fb1df-0ce6-4e68-8c1c-223dad2db008
project = f4e3108ade324967945d87aa54c37203
```
注意 `pod_subnet`、`pod_security_groups` 和 `project`，跟上面的 port 信息匹配。于是我们可以得出这样的结论：**在 k8s 中创建的 pod 对应的在 neutron 中的 port，都属于同一个 tenant 的同一个 subnet，有同样的安全组规则。**

接着看一下这个 tenant 是谁：
```shell
# os project list
+----------------------------------+--------------------+
| ID                               | Name               |
+----------------------------------+--------------------+
| 30fa6eb7643344008201bc6cb2cfbd98 | admin              |
| 3fbd01b626fb43d589b3a62906354e0e | invisible_to_admin |
| 51ba107b6dc64e6282d5e86c56db44cb | project_a          |
| 6afb9017a58049d5b9d4116ee7164705 | demo               |
| 80aad7d1581c479a8d1f2c8b9b06680e | project_b          |
| c15923efe39b45f48af65406bef6250e | service            |
| d0c62cfe0b374233b203b0fd6428b4e3 | alt_demo           |
| f4e3108ade324967945d87aa54c37203 | k8s                |
+----------------------------------+--------------------+
```
原来是 kuryr devstack plugin 自动创建的名为 k8s 租户。接下来我想验证 pod 与 vm 的通信，所以我想切换到 k8s 租户下的用户，获取创建 vm 需要的参数，但我发现 k8s 下并没有用户，那我使用其他租户怎么能够连通 k8s 租户的网络呢？我看了一眼环境中所有的 subnet：
```shell
# os subnet list
+--------------------------------------+---------------------+--------------------------------------+---------------------+
| ID                                   | Name                | Network                              | Subnet              |
+--------------------------------------+---------------------+--------------------------------------+---------------------+
| 02d9f978-e7d4-43e8-b662-89d4cfc30a68 | public-subnet       | 8a11cdf8-e397-46f7-9596-a74f9f990c36 | 172.24.4.0/24       |
| 11fc7aa5-f515-4ec0-8329-d6149c997878 | ipv6-private-subnet | f12f7af7-acb3-447e-9c4a-1926d4432b9d | fde6:3251:4818::/64 |
| 284913a0-5ceb-4682-bda5-2161e808d6bb | lb-mgmt-subnet      | a9fcb2c0-802d-4730-a521-9ecca3928770 | 192.168.0.0/24      |
| 390c5da6-99c8-4783-b5bc-f4d96acc538c | k8s-service-subnet  | 9ff54f19-c38f-4b39-bb5f-cee398607fbb | 10.0.0.128/26       |
| 4d40c7c3-5f2f-428f-b4f9-402bab6c189f | ipv6-public-subnet  | 8a11cdf8-e397-46f7-9596-a74f9f990c36 | 2001:db8::/64       |
| 9eeb9eba-7baf-494f-ba68-de37c1b45b55 | private-subnet      | f12f7af7-acb3-447e-9c4a-1926d4432b9d | 10.0.0.0/26         |
| b39fb1df-0ce6-4e68-8c1c-223dad2db008 | k8s-pod-subnet      | 38178d9f-ecd5-4a93-90ea-fb4110d52bf1 | 10.0.0.64/26        |
+--------------------------------------+---------------------+--------------------------------------+---------------------+
```
发现名为 `private-subnet` 的 subnet 跟 `k8s-pod-subnet` 属于同一网段，看着貌似能够通信，但 `private-subnet` 属于 demo 租户，先不分析，测试一下吧：
```shell
# source openrc demo demo
# # os subnet list
+--------------------------------------+---------------------+--------------------------------------+---------------------+
| ID                                   | Name                | Network                              | Subnet              |
+--------------------------------------+---------------------+--------------------------------------+---------------------+
| 11fc7aa5-f515-4ec0-8329-d6149c997878 | ipv6-private-subnet | f12f7af7-acb3-447e-9c4a-1926d4432b9d | fde6:3251:4818::/64 |
| 9eeb9eba-7baf-494f-ba68-de37c1b45b55 | private-subnet      | f12f7af7-acb3-447e-9c4a-1926d4432b9d | 10.0.0.0/26         |
+--------------------------------------+---------------------+--------------------------------------+---------------------+
# nova boot --flavor m1.tiny --image 26ab3636-eb8b-40db-a9df-e77741f0a04f --nic net-id=f12f7af7-acb3-447e-9c4a-1926d4432b9d test
# nova list
+--------------------------------------+------+--------+------------+-------------+--------------------------------------------------------+
| ID                                   | Name | Status | Task State | Power State | Networks                                               |
+--------------------------------------+------+--------+------------+-------------+--------------------------------------------------------+
| 0ca440a1-64d7-4a23-b77a-3a1298abac5c | test | ACTIVE | -          | Running     | private=fde6:3251:4818:0:f816:3eff:feae:16b5, 10.0.0.7 |
+--------------------------------------+------+--------+------------+-------------+--------------------------------------------------------+
# kubectl exec my-alpine-6898cf864b-98jbr -it -- bash
bash-4.4# ping 10.0.0.7 -c 4
PING 10.0.0.7 (10.0.0.7): 56 data bytes
64 bytes from 10.0.0.7: seq=0 ttl=63 time=1.611 ms
64 bytes from 10.0.0.7: seq=1 ttl=63 time=1.333 ms
64 bytes from 10.0.0.7: seq=2 ttl=63 time=1.085 ms
64 bytes from 10.0.0.7: seq=3 ttl=63 time=1.100 ms

--- 10.0.0.7 ping statistics ---
4 packets transmitted, 4 packets received, 0% packet loss
round-trip min/avg/max = 1.085/1.282/1.611 ms
```

为什么能 ping 通呢？两个不同租户的 vm，分别在不同的 subnet 上（当然两个 subnet 的 ip 段不重叠），能够相互通信，在 neutron 中只有一个可能，就是这**两个 subnet 连在同一个 router** 上：
```shell
# source openrc demo demo
# os router list
+--------------------------------------+---------+--------+-------+-------------+-------+----------------------------------+
| ID                                   | Name    | Status | State | Distributed | HA    | Project                          |
+--------------------------------------+---------+--------+-------+-------------+-------+----------------------------------+
| f01d89af-a8ef-4dda-926a-314190ff419b | router1 | ACTIVE | UP    | False       | False | 6afb9017a58049d5b9d4116ee7164705 |
+--------------------------------------+---------+--------+-------+-------------+-------+----------------------------------+
# neutron router-port-list f01d89af-a8ef-4dda-926a-314190ff419b
+--------------------------------------+------+----------------------------------+-------------------+------------------------------------------------------------------------------------------+
| id                                   | name | tenant_id                        | mac_address       | fixed_ips                                                                                |
+--------------------------------------+------+----------------------------------+-------------------+------------------------------------------------------------------------------------------+
| 018aafeb-aeb1-4a43-ba5b-c0862046247a |      | 6afb9017a58049d5b9d4116ee7164705 | fa:16:3e:a9:c0:e0 | {"subnet_id": "b39fb1df-0ce6-4e68-8c1c-223dad2db008", "ip_address": "10.0.0.126"}        |
| 2c0bd189-cd0f-456b-b1d1-241378c452c3 |      | 6afb9017a58049d5b9d4116ee7164705 | fa:16:3e:d6:f5:2b | {"subnet_id": "9eeb9eba-7baf-494f-ba68-de37c1b45b55", "ip_address": "10.0.0.1"}          |
| 45c6bdb9-944e-4c87-9264-61469bd96429 |      | 6afb9017a58049d5b9d4116ee7164705 | fa:16:3e:26:4d:e6 | {"subnet_id": "11fc7aa5-f515-4ec0-8329-d6149c997878", "ip_address": "fde6:3251:4818::1"} |
| 9787943e-bd94-4895-a867-6d1877b60453 |      | 6afb9017a58049d5b9d4116ee7164705 | fa:16:3e:f5:97:06 | {"subnet_id": "390c5da6-99c8-4783-b5bc-f4d96acc538c", "ip_address": "10.0.0.190"}        |
| b615549d-eac1-49a0-b9e0-d0ea19178702 |      |                                  | fa:16:3e:ab:c5:33 | {"subnet_id": "02d9f978-e7d4-43e8-b662-89d4cfc30a68", "ip_address": "172.24.4.2"}        |
|                                      |      |                                  |                   | {"subnet_id": "4d40c7c3-5f2f-428f-b4f9-402bab6c189f", "ip_address": "2001:db8::7"}       |
+---
```
原来 kuryr devstack 脚本将 demo 租户的 subnet 和 k8s 租户的 subnet 都关联到了 demo 租户的一个 router 上，实现了两个租户网络的互通。

从上面的实验可以看出，在 openstack 和 k8s 集群相互独立的环境里，kuryr 并不支持多租户场景。可能是因为 kuryr 默认并不感知 k8s 做不做用户认证，所以无法做假设。而且如何为不同的租户创建 subnet ，创建多大的 subnet，这些 subnet 的后续管理，都不太好设计。

能够说得通的场景是：k8s 的用户并不感知 kuryr，只关注自己的 pod 有没有分配到 IP 地址。如果用户对网络通信有要求，比如要求自己的 pod 跟某个 subnet 通信，可以要求管理员去配置必要的路由，当然，这个 subnet 不能与 router 上已有的 subnet 地址重叠。但同时，也就意味着其他用户的 pod 也能够与那个 subnet 通信。