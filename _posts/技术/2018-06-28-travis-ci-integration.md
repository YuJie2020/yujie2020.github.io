---
layout: post
title: Github 项目与 Travis CI 集成
category: 技术
---

![](/images/2018-06-28-travis-ci-integration/cover.png)

## 我的小需求

我在 github 上有个 repo，go 语言写的一个小程序，当时写这个程序的原因，一是练手，二是确实也想解决平时工作中的一个小痛点。使用 go 写是因为 go 语言写的程序编译后是一个不依赖于其他包或环境运行时的可执行文件，对使用者来说很方便，不必像 python 那样，首先得安装 python，又要做 `pip install xxx` 等一大堆工作，就算是用了 virtualenv 对环境没有太大的污染，但怎么说都没有一个独立的可执行程序来得方便。当然，还是有办法将 python 程序也弄成一个自包含的可执行文件，但太折腾。

写完了代码，需求就出来了：

- 因为 go 代码，所以commit 后首先要自动检测代码格式(也就是自动跑 `go fmt`)
- 自动生成可执行文件
- 自动 release。每次 commit 生成的可执行文件只是在 travis ci 上的临时文件，任务跑完就被删除了，其目的只是测试一下编译命令而已。但我希望当我给 repo 打 tag 时，能够自动将这个可执行文件上传到 github 的 release 页面供别人下载使用。这样每个 tag 就对应一个 release。

## golang 项目准备

我的项目地址在[这里](https://github.com/lingxiankong/openstackcli-go)。

虽然 CICD 能够实现自动编译，但真正的编译脚本还是需要你自己提供。虽然 go 语言提供了 `go build` 或 `go test` 等命令，但在一些复杂的任务中单纯的执行这些命令已经不能满足要求，此时就需要一些脚本作为胶水连接各个命令。写一个 bash 脚本固然可行，但 shell 脚本本身的可读性差，而且对于各个操作之间的依赖不好描述，不同的人写出来的脚本格式也不统一。在我接触到的大多数 go 语言项目中，大家基本都会用 Makefile 来解决编译问题。Makefile 对我来说其实比较陌生，感觉是 C 语言时代的产物，但对于 go 语言，Makefile 扮演了同样的角色，用相对标准的方式解决跨平台的编译任务。Makefile 本身就是用来描述依赖的，可读性非常好，而且与强大的 shell 结合在一起，基本可以实现任何想要的功能。Makefile 的上手也比较容易，基本读几篇博客就能写出一个功能简单的 Makefile。

所以，首先我为我的项目写了一个 Makefile，放在代码的根目录下，提供代码格式检测和生成可执行文件的功能。

## 什么是 Travis CI

有了 Makefile，剩下的问题就是如何自动触发调用 make 命令，在我脑海中第一个想到的就是 Travis CI。

我想到 Travis CI 并不是说我对它有多熟悉，相反，我从未用过 Travis CI，只是以前听过这个名字，知道是做 CICD 的，同样的工具还有一个叫 CircleCI，也未曾用过。

要知道什么是 Travis CI，首先要知道什么是持续集成。持续集成，Continuous Integration，简称CI，意思是，在一个项目中，任何人对代码库的任何改动，都会触发CI服务器自动对项目进行构建，自动运行测试，自动编译，甚至自动部署到测试环境。这样做的好处就是，随时发现问题，随时修复。因为修复问题的成本随着时间的推移而增长，越早发现，修复成本越低。

Travis CI 是在线托管的CI服务，用Travis来进行持续集成，不需要自己搭服务器，在网页上点几下就好，用起来更方便。最重要的是，Travis CI 对 Github 友好，这也是很多程序员喜欢 Travis CI 的理由。写完代码，提交，让 Traivs CI 跑自动化测试，或者 repo 收到 PR 时也会自动跑测试，repo owner 自然就根据测试结果决定是否 review，提高效率。

需要注意的是，[travis-ci.org](https://travis-ci.org) 是社区版，针对公开的 github repo 是免费的。而 [travis-ci.com](https://travis-ci.com/) 是企业版，收费的。一般的个人项目对构建并发性的要求不高，用免费的社区版足够了。

## 配置 Travis CI

Travis CI 上手很简单，就是在 github repo 中添加一个名为 `.travis.yml` 的配置文件就行，剩下的就是在 travis ci 的网页上配置一下，让 travis ci 能够访问你指定的 github repo。我的 `.travis.yml` 配置文件内容如下，我在文件中做了详细的解释：

```yaml
sudo: false # 使用容器进行编译，速度更快
dist: trusty # 编译的操作系统是 ubuntu trusty，目前还不支持 xenial 或更高版本
language: go # 表示 repo 是一个 go 项目
go: 1.10.x # 指定编译时的 go 版本号
git:
  submodules: false # 不运行 git submodules 命令
before_install: # 安装 makefile 需要的一些包，其实也可以放在 install 阶段，看个人喜好
- sudo apt-get update -qq
- sudo apt-get install -qq -y make
install: true # 跳过 install 阶段，因为我已经定义了 before_install。其实 go 项目是需要安装依赖的，只是我放到了下面的 make mycli 命令中做
script: make fmt && make mycli # 先检查格式，然后编译
deploy:
  provider: releases # 说明这个阶段要操作 repo 的 releases 页面
  api_key: # 你的 github 登录 token
    secure: <snippet>
  file: mycli # 可执行文件路径
  skip_cleanup: true # 因为我要上传可执行文件到 release，所以不能自动把这个文件清除
  on: # 只有打 tag 时才运行 deploy 阶段
    tags: true
```

关于每个字段的含义，在 travis ci 的文档中也都能找到答案。需要注意的是你的 github `api_key` 的配置，可能很多人在这里会停留一些时间，但其实  travis ci 已经提供了一个命令行工具可以自动生成一个 `.travis.yml` 文件，里面已经包含了经过加密的 `api_key`，因为毕竟这个文件也是要提交到 repo 根目录下的，如果是明文就会有安全问题。

在 Ubuntu 16.04 安装 travis CLI 和配置的步骤：
```bash
$ sudo apt install ruby ruby-dev
$ sudo gem install travis
$ git clone https://github.com/lingxiankong/openstackcli-go.git; cd openstackcli-go
$ travis setup releases --force
Detected repository as lingxiankong/openstackcli-go, is this correct? |yes| yes
Username: lingxiankong
Password for lingxiankong: *********
Two-factor authentication code for lingxiankong: ******
File to Upload: mycli
Deploy only from lingxiankong/openstackcli-go? |yes| yes
Encrypt API key? |yes| yes
```

一切就绪，测试一下。

## 测试

首先对代码做一些更改，然后提交并 push 到 github，登录到 travis ci 的个人页面，找到你的 repo，点击 `Settings`：
![](/images/2018-06-28-travis-ci-integration/1.png)

你会看到 travis ci 已经开始自动执行你在配置文件中定义的脚本了，运行结束后你会看到运行结果，还可以检查运行日志：
![](/images/2018-06-28-travis-ci-integration/2.png)

因为这个提交并不是打 tag，所以在日志的最后，你会看到：
![](/images/2018-06-28-travis-ci-integration/3.png)

然后，我们尝试给 repo 打一个标签并提交：
```bash
git tag -a v1.2.0 -m "openstack util go cli v1.2.0"
git push origin v1.2.0
```

再回到 travis ci 的个人页面，你会看到 travis ci 又开始执行新的 build，但这次的执行结果如下：
![](/images/2018-06-28-travis-ci-integration/4.png)

登录 github 进入 repo，进入 releases 页面，你会看到一个新的 release 信息：
![](/images/2018-06-28-travis-ci-integration/5.png)

至此，自动 release 工作完成。下一步就是通知感兴趣的人下载并试用这个程序：

```bash
curl -SOL $(curl -s https://api.github.com/repos/lingxiankong/openstackcli-go/releases/latest | grep browser_download_url | cut -d '"' -f 4); chmod u+x mycli; sudo mv mycli /usr/local/bin/
```
