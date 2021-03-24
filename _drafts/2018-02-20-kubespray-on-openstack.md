# 使用 Kubespray 在 OpenStack 环境搭建 k8s

安装 k8s 的方式有很多，在线的、离线的，官方的、非官方的，免费版、商业版，等等，但本文介绍的 kubespray 是 k8s 社区官方(其实仍在 incubation)推荐的可用于生产环境的安装工具，它之前的名字是 kargo，在它的 github repo 里面也声明自己是 Deploy a Production Ready Kubernetes Cluster。

kubespray 的几个优势：

- 使用 Ansible 安装
- 支持 HA 部署，比如 etcd 集群以及支持 api server 的 HA
- 比较贴心给出了大规模部署 k8s 集群的[建议](https://github.com/kubernetes-incubator/kubespray/blob/master/docs/large-deployments.md)
- 考虑了 k8s 集群的升级，其他很多工具都是一次性执行

## 部署过程
我的测试是在 devstack 环境里，kubespray 的执行机 OS 是 Ubuntu 16.04

在 inventory 中有一个特殊的 group 是 bastion，是跳板机，如果你不能直接跟 VM 互通，就需要设置跳板机，一般情况下不需要。

如果你配置了多个 node，在 openstack 环境中需要先手动配置 `allow_address_pairs`，参照[这里](https://github.com/kubernetes-incubator/kubespray/blob/master/docs/openstack.md)。

```bash

```

## 参考文档

- k8s 官方文档：<https://kubernetes.io/docs/getting-started-guides/kubespray/>
- kubespray 源码：<https://github.com/kubernetes-incubator/kubespray>
