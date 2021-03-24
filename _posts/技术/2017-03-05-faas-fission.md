---
layout: post
title: Fission（FaaS）介绍
description: 来自Planform9的开源项目
category: 技术
---

> 这篇博客需要你懂Kubernetes和Docker

之前就一直关注FaaS，简单分析过[AWS Lambda][]和其他几个FaaS项目。我最初关注FaaS是因为我想在Mistral（OpenStack项目）中引入执行自定义代码的能力，来增强Mistral的可用性。AWS Lambda是Amazon在2016年对外发布的项目，发布之后就一直是serverless领域的标杆，后来的的FaaS项目基本都是参照AWS Lambda设计和实现。

恰逢我在学习Golang语言，就一点一点的把[iron-functions][]的代码啃完了，发现iron.io对于开源FaaS还是不太有诚意，至少从他开源的这部分代码看，跟他们的商业软件还是差的很远，他们开源也许仅仅是为了吸引更多的注意力而已，毕竟他们仅靠FaaS活着。时间进入2017年，Planform9也对外开源了一个项目：[fission][]，是基于Kubernetes平台实现的FaaS。又恰逢我在阅读Kubernetes的文档，而且fission也是Go语言实现，所以我就又读了一下它的源代码。作为一个新项目，fission的实现还是比较简单，但代码看着却比[iron-functions][]清爽许多。所以还是秉承做笔记的态度，介绍一下fission的架构和实现。

目前只能从fission的代码库中找到一点相关的文档，我也是读完代码才做出如下总结。

## Fission Services的部署

fission基于Kubernetes平台，它的安装很简单，就是使用kubectl命令创建一系列fission管理资源，所有的资源都创建在名为`fission`的namespace中（而通过fission创建的资源都在`fission-function`命名空间中）。在代码库中有fission-bundle文件夹，根据 Dockerfile 创建出 fission service 的 docker image，就可以容器化部署 fission 了。在 fission 容器中，通过 import fission 的 github repo 来获取 fission 的代码从而启动各个服务进程。

其中包含4个service：

- etcd

- controller，是fission对外提供管理API的组件。除了用户创建function时需要存储代码文件之外，其他的操作都只在etcd中存储数据结构。

- router，fission通过router这一个独立的service来实现真正FaaS，router实现了根据用户的http请求运行code的能力。 router 是类似于 AWS 中的 API Gateway 的作用。

  router会与controller和poolmgr打交道，会监听 controller 中triggers的更新，动态的更新web service的route定义。router内部以缓存的形式维护了一个从function到一个url的映射，这样对于调用过的function，router会很快的拿到返回值。
  
  当用户第一次发送 HTTP 请求调用一个 function 时，消息的接受者是router，router 会调用 poolmgr API 获取function 对应的 service URL

- poolmgr，维护environment与Kubernetes中deployment的映射关系。poolmgr与controller和kubernetes打交道，同时对外（主要是对router）提供API。

  对于用户创建的environment，poolmgr中有循环的线程自动在kubernetes中根据env的镜像创建包含三副本pod的deployment，每个pod中有两个container，一个使用env的镜像创建，另一个是fission中的辅助container，镜像是fission/fetcher。两个container共享一个volume。因为env是定义基础镜像，而一个env可能会关联许多function，所以需要fetcher根据具体的function在通用的container里运行不同的code。

  poolmgr会维护几个映射缓存：function到service，function到environment，environment到pool(也就是deployment)。

  poolmgr还会定期清理“不活跃”的deployment，比如env被删了。还会定期删除不活跃的pod，让kubernetes自动创建新的、干净的pod供其他function使用。

  poolmgr提供的API只有两个，一个是根据function获取对应的service url，另一个是类似心跳API帮助维护缓存。因为router里也维护有function到service url的缓存，所以当function被调用时，router会通知poolmgr更新一下对应service对象的时间，避免被误删。

所以，在fission中，不同的function可能对应同一个environment，这个environment对应kubernetes中的一个deployment，deployment中有一些pod，每一个pod会服务于某一个function。为了快速响应，一个function被调用后，pod并不会立即被清理。如果某个function长时间没有被调用，它对应的pod就会被自动清理掉。

通过命令查看安装完后fission命名空间的服务：

```shell
$ kubectl --namespace fission get services
NAME         CLUSTER-IP   EXTERNAL-IP   PORT(S)        AGE
controller   10.0.0.99    <nodes>       80:31313/TCP   11d
etcd         10.0.0.229   <none>        2379/TCP       11d
poolmgr      10.0.0.83    <none>        80/TCP         11d
router       10.0.0.63    <nodes>       80:31314/TCP   11d
$ kubectl --namespace fission get deployments
NAME          DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
controller    1         1         1            1           11d
etcd          1         1         1            1           11d
kubewatcher   1         1         1            1           11d
poolmgr       1         1         1            1           11d
router        1         1         1            1           11d
```

> 下面的命令行基本都是在'fission' namespace下工作，我是后来才知可以设置默认的namespace，这样就不用在每个命令里都指定了，方法如下。
```shell
export CONTEXT=$(kubectl config view | awk '/current-context/ {print $2}')
kubectl config set-context $CONTEXT --namespace=fission
kubectl config view | grep namespace:
```

## Fission Resources

fission中的对象也很简单，包括：

- environment，定义一个镜像，目前仅支持dockerhub
- function，定义基于env的代码
- httpTrigger，定义http请求到function的映射
- watch，定义kubernetes事件与function的映射，让用户有机会监听kubernetes本身的事件。

## Call Functions

FaaS的主要功能，其实就是一个http调用，运行用户定义的函数，拿到返回结果。所以对于fission来说，核心的代码逻辑就是根据用户的HTTP请求，找到一个container运行用户自定义的代码，这部分功能由router服务实现。这里有几个映射关系需要理清楚：

- function与service url。router服务需要快速的根据function获取一个url，调用并返回给用户结果。
- env与deployment。poolmgr需要快速根据env中定义的镜像获取一个可用的container来运行用户的代码。

router服务启动时，就会根据系统所有的trigger建立web service路由信息（当然，也会定期更新）。用户发送http请求，router服务通过映射关系找到与哪个function关联，进而试图找到function对应的service url（这里的service其实就是kubernetes的service）：

- 如果router的缓存中找到了function对应的service url，那么router会直接将请求消息转发到该url，并代理消息的返回。相当于是kubernetes内部一个pod访问另一个pod的service。
- 如果缓存中没有，router就会调用poolmgr的API获取这个url，poolmgr会根据function找到它的env对应的deployment，进而找到一个空闲的pod，打上label。pod里有两个container，那个fetcher会从controller获取function的代码。最终返回pod的地址。

## 如何初始化Function Pod

默认情况，deployment创建好之后，里面的pod都是generic的，只有两个container而已。

当function被调用时，poolmgr获取到空闲的、可用的pod，就会向pod发送一个HTTP请求，请求参数中包含function的代码获取地址和要创建的代码文件名（默认是user），该请求由fetcher container处理，将代码下载到共享路径。

然后向pod发送第二个HTTP请求，该请求由function container处理（在制作镜像时，需要做前置工作），（以python为例）加载code的main函数（但不调用），这里使用了imp.load_source方法加载代码module。

最终返回pod的IP地址。

## 实战

根据fission的文档，使用fission一系列简单的命令行操作如下（这里我已经创建了一系列资源）：

    $ export FISSION_URL=http://$(minikube ip):31313
    There is a newer version of minikube available (v0.17.1).  Download it here:
    https://github.com/kubernetes/minikube/releases/tag/v0.17.1
    To disable this notification, run the following:
    minikube config set WantUpdateNotification false
    $ export FISSION_ROUTER=$(minikube ip):31314
    $ fission env list
    NAME   UID                                  IMAGE
    nodejs ee5985c7-5d2d-4d35-9b1a-602a3d8e854f fission/node-env
    $ fission function list
    NAME  UID                                  ENV
    hello 37f2a34c-8117-4bf7-82e3-1a6a4e95ff63 nodejs
    $ fission route list
    NAME                                 METHOD URL    FUNCTION_NAME FUNCTION_UID
    59b49c66-ea93-4136-8f43-c09fd02ce3c2 GET    /hello hello
    $ curl http://$FISSION_ROUTER/hello
    Hello, world!

根据之前的讲解，此时，kubernetes在fission-function namespace中应该有对应于nodejs的deployment：

    $ kubectl --namespace fission-function get deployments
    NAME                                                   DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
    nodejs-ee5985c7-5d2d-4d35-9b1a-602a3d8e854f-fcihuenw   3         3         3            3           7d
    $ kubectl --namespace fission-function get pods
    NAME                                                              READY     STATUS    RESTARTS   AGE
    nodejs-ee5985c7-5d2d-4d35-9b1a-602a3d8e854f-fcihuenw-499673w052   2/2       Running   0          7d
    nodejs-ee5985c7-5d2d-4d35-9b1a-602a3d8e854f-fcihuenw-499677hdps   2/2       Running   0          7d
    nodejs-ee5985c7-5d2d-4d35-9b1a-602a3d8e854f-fcihuenw-49967c818k   2/2       Running   0          5m
    $ kubectl --namespace fission-function describe pod nodejs-ee5985c7-5d2d-4d35-9b1a-602a3d8e854f-fcihuenw-49967c818k
    Name:   nodejs-ee5985c7-5d2d-4d35-9b1a-602a3d8e854f-fcihuenw-49967c818k
    Namespace:  fission-function
    Node:   minikube/192.168.99.100
    Start Time: Wed, 08 Mar 2017 23:44:32 +1300
    Labels:   environmentName=nodejs
        environmentUid=ee5985c7-5d2d-4d35-9b1a-602a3d8e854f
        pod-template-hash=499675883
        poolmgrInstanceId=m7ihOOHO
    Status:   Running
    IP:   172.17.0.14
    Controllers:  ReplicaSet/nodejs-ee5985c7-5d2d-4d35-9b1a-602a3d8e854f-fcihuenw-499675883
    Containers:
      nodejs:
        Container ID: docker://5a405f4466ad9a5e6b3293681e190a513852dd5c3973705c4f9e760919dd933f
        Image:    fission/node-env
        Image ID:   docker://sha256:2f8ec792709163ce836372fa00762cf16cd78cfdc6023982d7d44d8b06b0d709
        Port:
        State:    Running
          Started:    Wed, 08 Mar 2017 23:44:33 +1300
        Ready:    True
        Restart Count:  0
        Volume Mounts:
          /userfunc from userfunc (rw)
          /var/run/secrets/kubernetes.io/serviceaccount from default-token-qd3jh (ro)
        Environment Variables:  <none>
      fetcher:
        Container ID: docker://d32139bd0c8b5b6e44a0e16c004a926477cc6046f1e6231c49c9165d5ca29b3f
        Image:    fission/fetcher
        Image ID:   docker://sha256:1e18417250a23c44e6ee1ea23a31a15833df996b882010b4bf63c4c78d306781
        Port:
        Command:
          /fetcher
          /userfunc
        State:    Running
          Started:    Wed, 08 Mar 2017 23:44:33 +1300
        Ready:    True
        Restart Count:  0
        Volume Mounts:
          /userfunc from userfunc (rw)
          /var/run/secrets/kubernetes.io/serviceaccount from default-token-qd3jh (ro)
        Environment Variables:  <none>
    Conditions:
      Type    Status
      Initialized   True
      Ready   True
      PodScheduled  True
    Volumes:
      userfunc:
        Type: EmptyDir (a temporary directory that shares a pod's lifetime)
        Medium:
      default-token-qd3jh:
        Type: Secret (a volume populated by a Secret)
        SecretName: default-token-qd3jh
    QoS Class:  BestEffort
    Tolerations:  <none>
    Events:
      FirstSeen LastSeen  Count From      SubObjectPath     Type    Reason    Message
      --------- --------  ----- ----      -------------     --------  ------    -------
      10m   10m   1 {default-scheduler }          Normal    Scheduled Successfully assigned nodejs-ee5985c7-5d2d-4d35-9b1a-602a3d8e854f-fcihuenw-49967c818k to minikube
      10m   10m   1 {kubelet minikube}  spec.containers{nodejs}   Normal    Pulled    Container image "fission/node-env" already present on machine
      10m   10m   1 {kubelet minikube}  spec.containers{nodejs}   Normal    Created   Created container with docker id 5a405f4466ad; Security:[seccomp=unconfined]
      10m   10m   1 {kubelet minikube}  spec.containers{nodejs}   Normal    Started   Started container with docker id 5a405f4466ad
      10m   10m   1 {kubelet minikube}  spec.containers{fetcher}  Normal    Pulled    Container image "fission/fetcher" already present on machine
      10m   10m   1 {kubelet minikube}  spec.containers{fetcher}  Normal    Created   Created container with docker id d32139bd0c8b; Security:[seccomp=unconfined]
      10m   10m   1 {kubelet minikube}  spec.containers{fetcher}  Normal    Started   Started container with docker id d32139bd0c8b

因为是通过minikube安装的kubernetes，所以可以通过`minikube ssh`登录到kubernetes的controller node上使用docker命令验证这一切，留着当作业吧 :)

## 开发

如果要对fission做代码修改，该如何测试呢？

因为fission的安装是使用一个名为fission-bundle的image，通过kubectl命令部署在kubernetes上的，所以，修改完代码后，需要重新制作image上传到一个registry（docker-hub或私有），然后更新kubernetes中的pod的image即可。过程如下：

    # 将经过修改的fission工程拷贝到$GOPATH/src/github.com/fission/fission目录下
    rm -rf $GOPATH/src/github.com/fission/fission
    cp -a <fission_code_dir> $GOPATH/src/github.com/fission/fission
    cd $GOPATH/src/github.com/fission/fission
    # 确保你的系统安装了glide。这里我在运行glide install时碰到了一个问题，
    # ‘[ERROR] Update failed for gopkg.in/yaml.v2: Unable to get repository’
    # 所以先执行了下面的第一个命令
    git config --global http.sslVerify true
    glide install
    # 成功执行后，会在当前目录下生成一个vendor目录，里面包含了项目所有的依赖
    cd fission-bundle
    # 生成fission-bundle可执行程序
    ./build.sh
    # 制作image
    docker build -t fission-bundle .
    docker tag fission-bundle lingxiankong/fission-bundle:v0.1
    # 上传image，因为我使用的是docker hub，所以先登录
    docker login
    docker push lingxiankong/fission-bundle:v0.1

因为部署fission在Kubernetes中创建的是Deployment，所以服务的更新就极其简单。因为这里我只修改了controller服务的代码，所以仅升级controller即可。升级过程如下：

    $ kubectl --namespace fission get deployments
    NAME          DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
    controller    1         1         1            1           12d
    etcd          1         1         1            1           12d
    kubewatcher   1         1         1            1           12d
    poolmgr       1         1         1            1           12d
    router        1         1         1            1           12d
    $ kubectl --namespace fission set image deployment/controller controller=lingxiankong/fission-bundle:v0.1
    deployment "controller" image updated
    $ kubectl --namespace fission rollout status deployment/controller
    Waiting for rollout to finish: 0 of 1 updated replicas are available...
    deployment "controller" successfully rolled out
    $ kubectl --namespace fission get deployments
    NAME          DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
    controller    1         1         1            1           12d
    etcd          1         1         1            1           12d
    kubewatcher   1         1         1            1           12d
    poolmgr       1         1         1            1           12d
    router        1         1         1            1           12d
    $ kubectl --namespace fission get rs
    NAME                     DESIRED   CURRENT   READY     AGE
    controller-1637203237    0         0         0         12d
    controller-708033449     1         1         1         1m
    etcd-2122244727          1         1         1         12d
    kubewatcher-2300228496   1         1         1         12d
    poolmgr-3531518326       1         1         1         12d
    router-2621354073        1         1         1         12d
    $ kubectl --namespace fission describe deployment controller
    Name:     controller
    Namespace:    fission
    CreationTimestamp:  Sat, 25 Feb 2017 22:12:19 +1300
    Labels:     svc=controller
    Selector:   svc=controller
    Replicas:   1 updated | 1 total | 1 available | 0 unavailable
    StrategyType:   RollingUpdate
    MinReadySeconds:  0
    RollingUpdateStrategy:  1 max unavailable, 1 max surge
    Conditions:
      Type    Status  Reason
      ----    ------  ------
      Available   True  MinimumReplicasAvailable
    OldReplicaSets: <none>
    NewReplicaSet:  controller-708033449 (1/1 replicas created)
    Events:
      FirstSeen LastSeen  Count From        SubObjectPath Type    Reason      Message
      --------- --------  ----- ----        ------------- --------  ------      -------
      2m    2m    1 {deployment-controller }      Normal    ScalingReplicaSet Scaled up replica set controller-708033449 to 1
      2m    2m    1 {deployment-controller }      Normal    ScalingReplicaSet Scaled down replica set controller-1637203237 to 0
    $ kubectl --namespace fission rollout history deployment/controller
    deployments "controller"
    REVISION  CHANGE-CAUSE
    1   <none>
    2   <none>

升级结束，你可以验证修改的代码了。顺便说一句，Kubernetes提供的auto-update太他妈方便了！关于Kubernetes中的Deployment的update，可以参见[这里](https://kubernetes.io/docs/user-guide/deployments/#updating-a-deployment)

## 但是…

上面的过程还是比较复杂，不能每次修改代码都要做这么多操作，太麻烦。看看python的调试，代码改完、替换、重启服务，一气呵成。于是就有了如下方法：

- 生成fission-bundle还是有必要的
- 有了fission-bundle后，替换container中的文件，重启服务即可

过程如下：

    $ kubectl --namespace fission get pods
    NAME                           READY     STATUS    RESTARTS   AGE
    controller-708033449-tt7zj     1/1       Running   0          2h
    etcd-2122244727-p4q7m          1/1       Running   0          12d
    kubewatcher-2300228496-zvqk6   1/1       Running   0          12d
    poolmgr-3531518326-tl95w       1/1       Running   1          12d
    router-2621354073-dnv6r        1/1       Running   2          12d
    $ kubectl --namespace fission cp ~/workdir/test/fission-bundle controller-708033449-tt7zj:/
    $ kubectl --namespace fission exec controller-708033449-tt7zj -it -- /bin/sh
    / # chmod +x fission-bundle
    # 或者
    $ kubectl --namespace fission exec controller-708033449-tt7zj chmod +x fission-bundle
    # 登录kubernetes node，重启container
    $ minikube ssh
    $ docker ps | grep lingxiankong/fission-bundle:v0.1
    2e5bb80b212e  lingxiankong/fission-bundle:v0.1  "/fission-bundle --co"  2 hours ago  Up 2 hours  k8s_controller.250d2e0b_controller-708033449-tt7zj_fission_2ec6ddc8-052d-11e7-8089-080027626135_6315d2ef
    $ docker stop 2e5bb80b212e; docker start 2e5bb80b212e
    2e5bb80b212e
    2e5bb80b212e

[fission]: https://github.com/fission/fission
[AWS Lambda]: http://lingxiankong.github.io/blog/2016/10/30/aws-lambda/
[iron-functions]: https://github.com/iron-io/functions