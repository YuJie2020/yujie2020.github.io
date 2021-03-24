---
layout: post
title: OpenStack Container Orchestration Service - Magnum 手记
category: 技术
---

## Magnum 简介
Magnum 是 OpenStack 社区在巴黎峰会（2014.11）后开始的一个新的专门针对Container的一个新项目，用来向用户提供容器服务。Magnum 项目曾经红极一时，发展迅猛，这一点其实从 Magnum 相对详细的开发者文档和提供 horizon plugin 以及 puppet module 就能看得出来，一般的小项目很少能提供这么多可用组件。但随着 OpenStack 社区的分化，以及容器功能从 Magnum 中剥离，Magnum 被限制在仅提供创建和维护 COE 的能力，而且随着容器社区的高歌猛进，很多 Magnum 的开发者（或者说 OpenStack 开发者）都去玩容器相关的项目（Docker，K8S 等）了，所以现在的 Magnum 项目发展极为缓慢。

magnum 是今年 catalyst cloud 要部署的第二个大服务（第一个是 octavia），所以项目前期开发 team 需要对 magnum 有一个大概了解，趟趟坑，对版本特性的稳定性做做评估，同时把之前跟客户交流收集的 feature 往 upstream 里面做。研究 magnum 的过程很痛苦，这篇博客只是做个记录，方便自己日后查看。

自从 container 管理的功能从 magnum 挪到 zun 之后，magnum 的架构和资源管理就很简单了。这一点其实 magnum 跟 qinling 很像，因为 magnum 现在的功能就是安装部署容器编排集群（本文以 k8s 为例），顺带一点简单的管理工作，比如扩容、缩容。而放眼望去，在 k8s 生态里，有不下10多个安装部署工具，而且易用性、稳定性可能比 magnum 还要好，那用户为什么要选 magnum 呢？答案还是牵扯到生态的问题，客户用了 openstack，自然顺理成章的想（或者被忽悠）从 openstack 要 k8s 集群，这是生态绑定，这不是必要的，但却是云厂商希望达到的目的。当然，如果用户愿意并且有能力、有人力去维护，那么完全可以自己申请几台 vm，然后用其他现成的工具手动安装 k8s。

Magnum 的架构很简单，包含两个组件：

- magnum-api，提供 RESTful API，可以横向扩展。
- magnum-conductor，目前**暂不支持多进程部署**

Magnum 依赖的其他 OpenStack 服务有：

- Heat
- Nova/Neutron/Glance，只是跟这几个服务做参数校验
- Cinder（可选），如果作为 volume driver 使用的话，为容器提供持久存储
- Ocatavia（可选），为 cluster 中的多个 master 节点提供负载均衡服务
- Kuryr（可选），提供容器网络
- Barbican（可选），为 cluster 提供 TLS 能力

## 资源对象
自从容器管理功能从 Magnum 移到 Zun 之后，Magnum 的资源管理就相当简单了，仅仅提供 COE(Container Orchestration Engine) 的管理功能。

1. ClusterTemplate，类似于 Nova 中虚拟机的 flavor，Nova 中是先创建 flavor，再根据 flavor 创建虚拟机，Magnum 是先创建 Template，再根据 Template 创建 Cluster。如果使用 Template 创建了 cluster，则 Template 不能被修改或删除。创建ClusterTemplate时指定的一些参数可以在创建 cluster 时被覆盖。创建 Template 要注意：

  * 指定的 image 要有`os_distro`属性
  * external-network，指的是 Neutron 的external network（也就是分配 floating IP 的那个 network，router:external属性为 True）
  * network-driver，指的是容器的网络，跟 Neutron 无直接关系，默认是 flannel
  * docker-storage-driver，指的是容器的存储 driver，默认是 devicemapper
  * volume-driver，指容器持久化存储的 driver，对于 k8s 默认的 driver 是 cinder
  * docker-volume-size，表示是否给 cluster node 创建一个用户卷，作为容器的持久存储
  * 可以定义是否创建监控堆栈，比如在 labels 中指定 `prometheus_monitoring=True`

2. Cluster，就是一个 COE 实例，比如一个 k8s 集群。操作 cluster 时需注意：

  * 与 Octavia 的实现方式不同，cluster 内的虚拟机以及网络等资源，对用户都是可见的，因此在使用时要提醒用户小心操作
  * Magnum 要依赖一个 discovery 服务来创建 cluster，默认是`https://discovery.etcd.io`
  * Magnum 提供 cluster 的扩容/减容操作

Magnum 也实现了遵循 DMTF CADF 的 notification，在资源操作时发送到消息队列。

创建 cluster 时，magnum 根据 template 的参数找到一个 driver，比如当 coe 是 kubernetes、cluster_distro 是 fedora-atomic 时（由 image 的 os_distro 属性指定），找到的 driver 就是 k8s_fedora_atomic_v1，后面的事情就是这个 driver 的。每个 driver 都会定义 TemplateDefinition，并从 TemplateDefinition 对象拿到 heat 模板路径、入参和环境文件，最后创建 stack。

magnum-conductor 在启动的时候，还会启动一个线程，负责跟踪 db 中处于中间态的 cluster 的状态。

## 如何制作 COE 的镜像
对于 k8s，可以从下列地址下载已经制作好的镜像，[Fedora Atomic](https://alt.fedoraproject.org/pub/alt/atomic/stable/Cloud-Images/x86_64/Images/) 和 [CoreOS](http://beta.release.core-os.net/amd64-usr/current/coreos_production_openstack_image.img.bz2)

## 命令行示例
```bash
os coe cluster template create k8s-cluster-template \
      --coe kubernetes \
      --image Fedora-Atomic-26-20170723.0.x86_64 \
      --keypair testkey \
      --external-network public \
      --dns-nameserver 8.8.8.8 \
      --flavor ds2G \
      --network-driver flannel \
      --floating-ip-disabled \
      --master-lb-enabled
os coe cluster create k8s-cluster --cluster-template k8s-cluster-template --node-count 1
```

如果是 k8s，magnum 提供命令获取配置信息，比如要登录 k8s 的 webui：
```bash
eval $(magnum cluster-config <cluster-name>)
kubectl proxy
```

magnum  还提供证书相关的操作从而为集群提供 TLS 能力，`ca-sign`，`ca-show`，`ca-rotate`

## 如何加快 k8s 的部署速度
因为我是在我们自己的 cloud 上创建 vm 安装 devstack，在嵌套虚拟化环境下，要在 magnum 中成功创建一个 cluster 费老劲了，各种失败，各种超时，这是不能忍受的。那怎么能加快 cluster 的创建并且提高成功的概率呢？

- 创建 cluster 时，可以指定 `--timeout 180` 延长等待时间
- 增加 cluster template 中的 `wait_condition_timeout` 参数的默认值，默认是6000s，可以改成 10800，3个小时。目前 magnum 中没有参数或配置项可以定制。
- 创建 cluster template 时，指定 `--floating-ip-disabled`
- 创建 cluster template 时，不指定 `--docker-volume-size`
- 不需要的情况，创建 cluster template 时，不指定 `--master-lb-enabled`
- 为了降低失败概率，建议延长 token 有效期，在 keystone 配置文件 `[token]` 下配置 `expiration = 86400`
- 如果使用 discovery 配置 etcd，尽量不使用 https，嵌套虚拟化下跟 https 通信测试需要 7s 左右，但貌似 etcd  在注册时只能容忍5s
- 因为这个 [bug](https://bugs.launchpad.net/magnum/+bug/1714880)，必须启动 tls，即创建 cluster template 时，不指定 `--tls-disabled`
- 在 vm 里面安装 k8s 时，依赖于 metadata 服务获取本地的 IP，比如 make_cert 阶段，所以要确保 metadata 服务正常