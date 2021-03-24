---
layout: post
title: 如何从零创建一个openstack project
description: 如何从零创建一个 openstack project
category: 技术
---

前段时间自己写了个 FaaS 项目（借鉴了 Fission 里的一些想法），因为目前为止 OpenStack 领域里还没有一个很好的替代品。仅有的一个 Picasso 自从repo 创建之后就再没有更新过，那个公司只是为了卖自己的 serverless 产品而已，所以搞开源做好事的动机不强。

这篇博客不是具体讲我的 project 怎么实现的，而是我完成基本的框架和功能之后，总结一下创建一个新的 project 都需要注意哪些方面，以备后用。

首先，openstack 官方给项目创建者提供了一个很详细的[文档](https://docs.openstack.org/infra/manual/creators.html)，基本我也是照着这个创建的 Qinling 项目。里面提到了一个工具 cookiecutter，运行它可以快速给你的 project 搭建一个 openstack 项目风格的空架子。剩下的就是你自己补充代码了。

- 当你的项目逻辑架构定了之后，首先是提供 CLI 启动服务，我一般把启动脚本放在cmd文件夹下，并在 setup.cfg 中注册。
- 在写代码时，引用到的 python lib，可以直接从[openstack global requirments文件](https://github.com/openstack/requirements/blob/master/global-requirements.txt)中拷贝到自己的 requirements.txt 中。
- 想好 API 框架用啥，我比较常用的是 Pecan+WSME
- 如果你的 project 有两个或以上的 components，就要创建 rpc 通信层，还有 context 该怎么传递。
- 数据库的 model 设计以及 sqlalchemy api 的实现，还有就是 db migration