---
layout: post
title: Calico bandwidth testing in k8s on openstack
category: 技术
---

## 测试目的

因为 catalyst cloud 马上要部署 magnum 服务，但 magnum 服务默认的网络插件是 flannel，但 flannel 目前仍不支持 network policy，这对于 production 上的客户来说有些不能接受，于是我们想给 magnum 增加 calico 的支持，但首先需要确认，用了 calico，pod 的网络性能不能太差。为了测试 pod 之间的带宽，于是才有了本篇博客，记录流程。

## 环境安装

openstack 环境直接用 catalyst cloud，跟原生 openstack 没啥大的区别。

k8s 集群的安装工具我使用 kubeadm，虽然市面上能见到很多开源的自动化部署 k8s 集群的工具，但本着学习的态度，我还是选择先全部手工操作，然后自己尝试自动化。已有的开源部署工具会考虑很多选项，对于简单需求来说略显笨重和复杂，也有排错成本。我自己自动化使用 ansible，其实也是刻意给自己创造学习的机会。我的 ansible 脚本在[这里](https://github.com/LingxianKong/kubernetes_study/tree/master/installation/ansible/version_1)。

ansible 创建的 k8s cluster 包含一个 master 两个 node，配置 master 可以当 node 使。calico 使用官方默认配置，但有两个关键配置选项的改动，参见 ansible 脚本。

一切就绪，开工。

```shell
mkvirtualenv test_k8s
pip install ansible shade
source openrc
ansible-playbook deploy_k8s.yml -e "rebuild=false"
```

如果成功的话，就可以登录 master 节点准备测试了。需要说明几点：

- 我的本地主机能够直接连通三个虚拟机私有网络，你的环境可能需要配置 floating ip，需要修改 ansible 脚本
- 你自己的环境上运行 ansible 脚本需要传递变量
- 你可以用 pause 和 debug module，以及 `--step --voberse` 对 ansible 脚本进行调试
- 我为了图省事儿， 默认使用 master 节点名称中就包含 master，node 节点名称包含 node，便于分组执行不同的命令
- 如果安装过程中出现任何错误，可以 `ansible-playbook deploy_k8s.yml -e "rebuild=true"` 重新跑 ansible
- 清理环境时，记得要手动删除 neutron port

ansible 脚本创建的虚拟机和 port：

```shell
lingxiankong@lingxiankong-pc [~]$ nova list --name lingxian
+--------------------------------------+---------------------------+--------+------------+-------------+----------------------+
| ID                                   | Name                      | Status | Task State | Power State | Networks             |
+--------------------------------------+---------------------------+--------+------------+-------------+----------------------+
| 0aa5a11f-87f5-4741-be86-6c1012d7adbe | lingxian-k8s-master       | ACTIVE | -          | Running     | network1=10.0.19.23  |
| 5f439d0a-2633-411f-99b2-7d7309f7c9e1 | lingxian-k8s-node1        | ACTIVE | -          | Running     | network1=10.0.19.91  |
| 9cd3a693-7ebd-497a-916a-c6acb2e6f51e | lingxian-k8s-node2        | ACTIVE | -          | Running     | network1=10.0.19.92  |
+--------------------------------------+---------------------------+--------+------------+-------------+----------------------+
lingxiankong@lingxiankong-pc [~]$ neutron port-list | grep lingxian
| 008ffcba-1e17-49ff-9559-dc04c73083ce | lingxian-k8s-node2               | fa:16:3e:8b:1a:ba | {"subnet_id": "9a7225a8-35d6-42af-994f-980f0092df48", "ip_address": "10.0.19.92"}  |
| 913cb318-ebb6-4b18-82dc-8574345be05a | lingxian-k8s-node1               | fa:16:3e:dd:54:d4 | {"subnet_id": "9a7225a8-35d6-42af-994f-980f0092df48", "ip_address": "10.0.19.91"}  |
| bdc5cfd5-5993-4056-b5ed-db9a06150698 | lingxian-k8s-master              | fa:16:3e:00:2e:1b | {"subnet_id": "9a7225a8-35d6-42af-994f-980f0092df48", "ip_address": "10.0.19.23"}  |
```

记得等所有的 nodes 都 ready：

```shell
root@lingxian-k8s-master:~# kubectl get nodes
NAME                  STATUS    ROLES     AGE       VERSION
lingxian-k8s-master   Ready     master    4m        v1.9.2
lingxian-k8s-node1    Ready     <none>    3m        v1.9.2
lingxian-k8s-node2    Ready     <none>    3m        v1.9.2
```

## 测试

1. 首先看一下两个虚拟机（k8s node）之间的带宽

   ```shell
   # 在 node1 节点启动 iperf 服务端
   root@lingxian-k8s-node1:~# iperf3 -s
   -----------------------------------------------------------
   Server listening on 5201
   # 在 node2 启动带宽测试，10.0.19.91 是 node1 节点的 IP 地址
   root@lingxian-k8s-node2:~# iperf3 -c 10.0.19.91
   Connecting to host 10.0.19.91, port 5201
   [  4] local 10.0.19.92 port 44810 connected to 10.0.19.91 port 5201
   [ ID] Interval           Transfer     Bandwidth       Retr  Cwnd
   [  4]   0.00-1.00   sec   729 MBytes  6.12 Gbits/sec  1704    450 KBytes
   [  4]   1.00-2.00   sec   769 MBytes  6.45 Gbits/sec  918    899 KBytes
   [  4]   2.00-3.00   sec   725 MBytes  6.08 Gbits/sec  1113    894 KBytes
   [  4]   3.00-4.00   sec   685 MBytes  5.75 Gbits/sec  396    850 KBytes
   [  4]   4.00-5.00   sec   716 MBytes  6.01 Gbits/sec   61   1.01 MBytes
   [  4]   5.00-6.00   sec   688 MBytes  5.77 Gbits/sec  466   1.04 MBytes
   [  4]   6.00-7.00   sec   804 MBytes  6.75 Gbits/sec   92   1.15 MBytes
   [  4]   7.00-8.00   sec   781 MBytes  6.55 Gbits/sec  552    810 KBytes
   [  4]   8.00-9.00   sec   788 MBytes  6.60 Gbits/sec  144    984 KBytes
   [  4]   9.00-10.00  sec   840 MBytes  7.05 Gbits/sec   69   1003 KBytes
   - - - - - - - - - - - - - - - - - - - - - - - - -
   [ ID] Interval           Transfer     Bandwidth       Retr
   [  4]   0.00-10.00  sec  7.35 GBytes  6.31 Gbits/sec  5515             sender
   [  4]   0.00-10.00  sec  7.35 GBytes  6.31 Gbits/sec                  receiver

   iperf Done.
   ```

2. pod 到虚拟机（k8s node）带宽测试

   ```shell
   # 在 node2 节点启动 iperf 服务端，因为经过试验，pod 有很大概率会落到 node1
   # 创建 pod，向 node2 节点发送带宽测试
   root@lingxian-k8s-master:~# kubectl get po -o wide
   NAME                             READY     STATUS    RESTARTS   AGE       IP               NODE
   iperf3-client-84597465b8-cpt2x   1/1       Running   0          6s        192.168.118.66   lingxian-k8s-node1
   # 如下命令创建 pod：
   root@lingxian-k8s-master:~# kubectl run iperf3-client --rm -it --image networkstatic/iperf3 -- -c 10.0.19.92
   If you don't see a command prompt, try pressing enter.
                                                         [  4]   1.00-2.00   sec   822 MBytes  6.90 Gbits/sec  223    860 KBytes
   [  4]   2.00-3.00   sec   844 MBytes  7.08 Gbits/sec  108    806 KBytes
   [  4]   3.00-4.00   sec   819 MBytes  6.87 Gbits/sec  863    779 KBytes
   [  4]   4.00-5.00   sec   795 MBytes  6.67 Gbits/sec  863    737 KBytes
   [  4]   5.00-6.00   sec   776 MBytes  6.51 Gbits/sec  357    776 KBytes
   [  4]   6.00-7.00   sec   756 MBytes  6.34 Gbits/sec  680    704 KBytes
   [  4]   7.00-8.00   sec   802 MBytes  6.73 Gbits/sec  231    684 KBytes
   [  4]   8.00-9.00   sec   794 MBytes  6.66 Gbits/sec  1109    788 KBytes
   [  4]   9.00-10.00  sec   825 MBytes  6.92 Gbits/sec  443    663 KBytes
   - - - - - - - - - - - - - - - - - - - - - - - - -
   [ ID] Interval           Transfer     Bandwidth       Retr
   [  4]   0.00-10.00  sec  7.81 GBytes  6.71 Gbits/sec  5997             sender
   [  4]   0.00-10.00  sec  7.81 GBytes  6.71 Gbits/sec                  receiver

   iperf Done.
   Session ended, resume using 'kubectl attach iperf3-client-84597465b8-cpt2x -c iperf3-client -i -t' command when the pod is running
   ```

   可以看到 pod 到 node 之间的带宽基本跟 node 到 node 无差别，因为环境的影响，有时候甚至能看到 pod 到 node 的带宽比 node 之间还要大。

3. pod 到 pod 的带宽测试

   ```shell
   # 创建两个 pod 分别启动 iperf 服务端和客户端，要确保两个 pod 在不同的 node
   root@lingxian-k8s-master:~# kubectl get po -o wide
   NAME                             READY     STATUS    RESTARTS   AGE       IP               NODE
   iperf3-client-7d85545786-dsvzp   1/1       Running   0          22s       192.168.94.194   lingxian-k8s-node2
   iperf3-server-5cf5696c6-cfpdg    1/1       Running   0          6m        192.168.118.67   lingxian-k8s-node1
   # iperf 服务端 pod 的创建：
   root@lingxian-k8s-master:~# kubectl run iperf3-server --rm -it --image networkstatic/iperf3 -- -s
   # iperf 客户端 pod，192.168.118.67 是服务端 pod 的 IP 地址：
   root@lingxian-k8s-master:~# kubectl run iperf3-client --rm -it --image networkstatic/iperf3 -- -c 192.168.118.67
   If you don't see a command prompt, try pressing enter.
                                                         [ ID] Interval           Transfer     Bandwidth       Retr  Cwnd
   [  4]   0.00-1.00   sec   743 MBytes  6.23 Gbits/sec  573    943 KBytes
   [  4]   1.00-2.00   sec   740 MBytes  6.21 Gbits/sec  136    829 KBytes
   [  4]   2.00-3.00   sec   730 MBytes  6.12 Gbits/sec   35   1.04 MBytes
   [  4]   3.00-4.00   sec   711 MBytes  5.97 Gbits/sec  105    930 KBytes
   [  4]   4.00-5.00   sec   692 MBytes  5.81 Gbits/sec  170   1.01 MBytes
   [  4]   5.00-6.00   sec   739 MBytes  6.20 Gbits/sec  133    993 KBytes
   [  4]   6.00-7.00   sec   721 MBytes  6.05 Gbits/sec   81    830 KBytes
   [  4]   7.00-8.00   sec   699 MBytes  5.86 Gbits/sec   28   1015 KBytes
   [  4]   8.00-9.00   sec   684 MBytes  5.73 Gbits/sec  136   1.10 MBytes
   [  4]   9.00-10.00  sec   752 MBytes  6.31 Gbits/sec  1014    881 KBytes
   - - - - - - - - - - - - - - - - - - - - - - - - -
   [ ID] Interval           Transfer     Bandwidth       Retr
   [  4]   0.00-10.00  sec  7.04 GBytes  6.05 Gbits/sec  2411             sender
   [  4]   0.00-10.00  sec  7.04 GBytes  6.05 Gbits/sec                  receiver

   iperf Done.
   Session ended, resume using 'kubectl attach iperf3-client-7d85545786-dsvzp -c iperf3-client -i -t' command when the pod is running
   ```

   结论：当禁用了 calico 的 IPIP encapsulation 后，pod 到 pod 之间的带宽与 node 到 node 也基本一致，没有明显的性能下降。

   你可以试着把我对 calico 的配置改动注释掉，你会发现带宽下降的厉害……