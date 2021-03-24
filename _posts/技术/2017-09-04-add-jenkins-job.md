---
layout: post
title: 如何为 OpenStack Project 创建 Gate Job
description: 如何为 OpenStack Project 创建 Gate Job
category: 技术
---

更新历史：

- 2017.09，初稿完成
- 2018.02，更新 zuul3 介绍

写这篇博客的起因是我要为自己的项目（Qinling）在 OpenStack 社区 CI 里增加 devstack gate job，也就是跑功能测试，这样后续的代码修改以及新增特性时自己心里也有底气，功能测试本来就是为了保障代码质量。

以前挺怵 openstack infra 这套东西的，但当硬着头皮研究完之后，发现这坨东西的设计思路还是挺有价值的，毕竟 openstack 曾经的风风火火，能够支撑起这么多项目的正常运转，openstack infra team 功不可没，他们在实践中摸索出的这套基础框架，好好学学，走到哪里都是一个牛逼的运维。这就是开源的魅力。

## 相关组件

- Gerrit

  这个想必参与过 OpenStack 社区贡献的人都知道，一个代码 review 系统，用惯了这个，对 Github 那一套简直是不能忍。Gerrit 安装有 git，会定期往 Github 上 push 最新的代码。

  Gerritbot 会监听 Gerrit 的 event stream，往 IRC 推送消息。同时有另外一个项目Jeepyb，当一个 patch 与 bug 或 bp 相关联时，Jeepyb会负责更新Launchpad（当然Jeepyb做的事不止这一个）；同时还有一个Gerrit 插件its-storyboard，与Storyboard打交道。

- Zuul

  这个是 openstack 社区专门为 openstack 开发的，因为传统的 Jenkins 不能满足 openstack 如此多的项目需求，Zuul 解决了并行运行测试以及高并发下 patch 合入冲突的问题。比如在传统方式下，两个开发人员同时向 repo 中提交了代码，他们各自的代码都没问题，但两份代码有冲突，如果用传统的 CI 系统，先执行第一份代码的测试，合入，然后测试第二份代码，这样一个一个的测试、合入导致效率低下。所以 zuul 设计了 `gate` pipeline，默认情况下，被 approved 的 patch （但还没有 merge）都在一个队列中，运行 gate 测试时，一个 patch 会假设它前面的所有 patch 都已经 merge，这样避免了 regression，如果测试失败，zuul 才会重新对这个 patch 单独测试。

  Zuul 也监听来自 Gerrit 的 event stream，与自己的 pipelines （在`zuul/layout.yaml`定义）匹配，如果匹配到 pipeline，就根据相应 project 对该 pipeline 的定义，生成 Jenkins job 配置并运行，然后监听来自 Jenkins 的运行结果。

- Jenkins Job Builder

  因为 OpenStack 的 project 数目太多，为每一个 project 去配置和维护独立的 Jenkins 配置文件过于繁琐和重复劳动，所以社区开发了Jenkins Job Builder来自动从配置文件（`jenkins/jobs/`）中生成 Jenkins 配置。最终，`projects.yaml`文件中会引用job-group或job-template的定义。

- Nodepool

  为 OpenStack CI 系统提供虚拟机池，devstack gate 就是从 Nodepool 拿虚拟机。一个虚拟机就是一个 Jenkins slave 节点。

- Devstack Gate

  这个就是负责跑集成测试用例的。会有一个 Jenkins job 负责安装 devstack，并根据每个项目的定义跑 tempest。Devstack Gate 的相关脚本有单独的 [repo](https://github.com/openstack-infra/devstack-gate) 维护。理解 Devstack Gate 的难点在于理解里面一些环境变量的意义，要好好读读 devstack-gate repo 中的`devstack-vm-gate-wrap.sh`

- Devstack

  Devstack Gate会安装 devstack。关于 devstack 介绍请参见[官方文档](https://docs.openstack.org/devstack/latest/)， devstack 的安装也支持插件机制，一般新的项目的repo里都会实现 [devstack plugin](https://docs.openstack.org/devstack/latest/plugins.html)，自己决定如何实现服务安装、服务启动等。所以，要添加功能测试 job，自然要先实现 devstack plugin

- Tempest

  功能测试就是由 tempest 实现。 Tempest 也支持插件机制，目前除了核心的那几个 projects 的测试用例在 tempest 中维护，其他项目也都是自己维护自己的 tempest test cases，要么有单独的 repo，要么在自己的 repo 中有单独的 folder，而且 tempest 提供了脚本可以很方便的自动生成 plugin 的框架，你只需要根据需求在此基础上修改即可。在 Jenkins devstack gate job 中一般都会自定义跑 tempest 用例。

## CI 流程
那么，当一个开发者在本地开发完代码，执行 git review 后都发生了什么？

下图是一张来自2014年的流程图，可能有些地方已经发生了变化，但不影响理解 OpenStack CI 的大致流程。

![](/images/2017-09-04-add-jenkins-job/gerrit_process.png)

当开发者向一个 project 提交一个 patch 后(已经针对新的 zuul 版本做了修正)：

1. Gerrit 发出 event(patchset-created) 给所有注册 event stream 的组件，Zuul 就是其中之一
2. Zuul 根据`project-config/zuul.d/pipelines.yaml`文件中不同 pipeline 的 trigger 定义来匹配 pipeline(比如得到 check、gate、tag、experimental 等)
3. 匹配到 pipeline 后(比如是 check)，根据`project-config/zuul.d/projects.yaml`文件中对应 project 的 check 定义（在 template 中引用的模板是在 `openstack-zuul-jobs/zuul.d/project-templates.yaml` 中定义，模板里可能也有 check 定义），同时 `openstack-zuul-jobs/zuul.d/jobs.yaml` 和 `project-config/zuul.d/jobs.yaml` 以及 `zuul-jobs/zuul.yaml` 中也 都有一些定义好的通用的 job，比如 openstack-tox-cover
4. 每个 job 基本就是调用 ansible 运行 playbook

## 如何为 Qinling 添加 devstack gate
理解了上述的流程，实际中为一个项目增加一个 gate job 就很简单了。如下是我对 Qinling 所做的大致更改。

- 首先，是在 Zuul 和 JJB 中增加新的 job 定义。为了不影响现有的代码合入流程，刚开始我把该 job 放在experimental类别里，可以在 patch 中手动触发(check experimental)该 job来做调试，patch [在此](https://review.openstack.org/#/c/499567/)
- 按照 job 的定义，在 Qinling repo 里实现`pre_test_hook`、`post_test_hook`脚本（两者都是可选的）以及 devstack plugin。一般情况下，`pre_test_hook`是为了对项目依赖的其他项目做一些配置，`post_test_hook`里就是跑 tempest 用例。
- 实现 tempest plugin

具体可以参见项目源码。

## Zuul 更新
在 2017 年，openstack社区的工程师重新写了 Zuul，使其更通用，架构更灵活，并且提供了比较详细的[官方文档](https://docs.openstack.org/infra/zuul/user/concepts.html)，在其文档中也基本介绍了 Zuul 在 openstack review 系统中的位置和功能，以及相关的概念、流程介绍。

Zuul 定义了 pipeline，而不同的 openstack projects 与不同的 pipeline 关联，zuul 仍然监听来自 gerrit 的 event(当然，zuul 也提供了 driver 机制可以监听 github 等事件源)。

> Pipeline associates jobs for a given project with triggering and reporting events.

比如 check 和 gate pipeline，注意 manager 的区别，因为 gate 假定要 merge 的 patch 之间是有依赖的：
```yaml
- pipeline:
    name: check
    manager: independent
    ...
- pipeline:
    name: gate
    manager: dependent
```

pipeline 中 job 的内容就是 ansible playbook。因为 job 之间有继承关系，所以 playbook 的执行顺序是：

- parent pre-run playbook
- child pre-run playbook
- child playbook
- child post-run playbook
- parent post-run playbook

之前提到过 gate pipeline 的设计，zuul 能够并行运行测试而且能降低合入 patch 时冲突的概率，同时新的 zuul 版本支持跨 project 的测试，zuul [文档](https://docs.openstack.org/infra/zuul/user/gating.html#testing-in-parallel)里有详细的介绍。

zuul 配置文件查找路径，zuul.yaml 或 zuul.d 目录，然后`.zuul.yaml`或`.zuul.d`目录
