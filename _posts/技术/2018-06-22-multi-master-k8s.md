---
layout: post
title: 使用 kubeadm 搭建 multi-master k8s 集群总结
category: 技术
---

写这篇博客的初衷是因为我们准备部署 Magnum 服务，毕竟现在三大公有云都有了 k8s-as-a-service 服务，新西兰虽小，但还是有想尝鲜的客户。而且有了 k8s 集群，后续就可以尝试基于容器提供一些 PaaS 的服务。Magnum 应该是 OpenStack 社区相对后期的一个项目了，现在听说的也只有 CERN 有过大规模部署，坑深坑浅没人知道。更让我们后背发凉的是， 虽然 Magnum 在特性上支持，但 CERN 并没有使用 multi-master 方式创建过 k8s 集群。单节点在生产环境，特别是对公有云的客户来说是不能接受的。

在使用 Magnum 创建多 master k8s 集群屡次失败后，我们有理由相信，Magnum 对多 master 部署的支持基本处于代码写完未验证的状态。于是，为了给 Magnum 多 master 特性修复做个参照，同时也为了练习练习 Ansible，我准备在我之前的单 master  k8s ansible 脚本基础之上添加多 master 支持。

这篇文章不是讲 ansible 脚本怎么写，也不是讲多 master k8s 集群的实现原理，关于这两个网上有大把的资料可供参考。我的 ansible 脚本是基于 openstack 使用 kubeadm 搭建多 master 集群，所以会有跟 openstack 的交互以及在 openstack 环境下一些特有的操作，比如直接在 octavia 创建 load balancer 作为多 master 的统一入口，而这一部分恰恰是 k8s 官方文档缺失的(或者认为不在它的 scope 里)

- 目前的 k8s 官方使用 kubeadm 安装多 master 集群的文档不够完善，新手照着做肯定会遇到各种问题，所以看完 k8s 的文档还是要多 google 一下，并且如果可能的话，可以帮着 k8s 社区完善一下该文档。
- 注意在 openstack 中给虚拟机(的 port)添加安全组规则，允许各个服务之间互通。
- 我是直接使用 openstack 环境中的 octavia 服务创建 load balancer，因为初始化第一个 master 时就要用到 load balancer 的 VIP。没有 octavia 的话，就只能自己在一个虚拟机里安装 haproxy 等软件。
- 先添加第一个 master 作为 load balancer 的 member，等所有 master 初始化都结束后，再添加其他 master 到 lb。
- 要修改每个 master 虚拟机的 `/etc/hosts` 文件确保相互之间能通过主机名互通。后续有了 cloud DNS 服务这一步可以省略。
- 为了 ansible 脚本的可重入，会先执行 `kubeadm reset`，最好在初始化证书之前做这件事儿。因为 `kubeadm reset` 会删除证书目录。
- 测试环境下，etcd 集群和 master 集群可以共用证书。etcd 服务参数 `--name` 一定得是本地主机名。
- 要等 etcd 集群正常(使用 `etcdctl endpoint health` 看到所有节点healthy)之后，再执行 `kubeadm init` 命令。
- 记录第一个 master 的 `kubeadm init` 命令返回中的 join 字符串即可。最好把 join 字符串保存在某个文件中，方便 ansible 执行完后手动添加 node。

最后，我的 ansible 脚本在[这里](https://github.com/lingxiankong/kubernetes_study/tree/master/installation/ansible/version_4)。