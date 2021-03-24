---
layout: post
title: Qinling 中的函数资源限制
description: Qinling 中的函数资源限制
category: 技术
---

最近在 Qinling 项目中实现对 function 运行时做资源限制，主要是 cpu、内存和磁盘，后续还会考虑 package 大小、文件句柄、系统调用等资源限制。限制资源使用的原因很简单，因为底层是容器实现，function 都是跑在容器里，如果不做资源限制，任由用户自己在 function 里分配资源，那么不同用户的函数势必会相互影响，更严重的情况是恶意用户会利用一些手段突破容器的限制，威胁 hypervisor，进而威胁整个云环境。

FaaS 的标杆 AWS Lambda 对 function 的资源限制情况参见其文档：<http://docs.aws.amazon.com/lambda/latest/dg/limits.html>

因为 Qinling 使用了 k8s 作为默认的容器管理平台，所以本文主要讲如何在 k8s 以及 docker 下进行资源限制。

在 docker 中，默认情况下是不对容器做资源限制的，所以容器中的进程可以无限制的使用 cpu、分配内存。并且当你在容器中查看系统资源使用情况时，会发现显示的结果其实是整个宿主机的资源使用情况。所以，要观察容器的资源使用情况，就要用其他的工具或命令，比如 `systemd-cgtop`。

## 内存资源限制

### resource-consumer 镜像
在研究如何限制内存前，我会先看看如何能快速的分配内存。当然我可以自己写个简单的 python 脚本，不停的做占用内存的事情。但其实 k8s 社区已经提供了类似的镜像叫[resource-consumer](https://github.com/kubernetes/kubernetes/tree/master/test/images/resource-consumer)，创建容器时指定这个镜像，然后可以向容器发送 http 请求，就可以控制容器中的服务分配 cpu 或内存资源。利用这个镜像可以测试 k8s 中的 hpa 等功能。

为了测试镜像的可用性，我直接先起一个容器（不加资源限制），然后按照文档设置容器的内存为260M，使用 `systemd-cgtop` 查看，可以看到容器果然占用了 260M 的内存空间，证明该镜像是可用的：
```
curl --data "megabytes=260&durationSec=60" http://172.17.0.8:8080/ConsumeMem
```
![](/images/2017-11-29-qinling-resource-limit/1.jpeg)

为了测试内存资源限制，在 k8s 中创建 pod/deployment 时按照文档指定 resources，比如：
```yaml
spec:
  containers:
  - name: test-resource-limit
    image: gcr.io/google_containers/resource_consumer:beta
    imagePullPolicy: IfNotPresent
    resources:
      limits:
        memory: 512Mi
      requests:
        memory: 128Mi
```

k8s 的文档中有这么一句话：“If a Container exceeds its memory limit, it might be terminated. If it is restartable, the kubelet will restart it, as with any other type of runtime failure.”，我的测试目的是：如果在 Qinling 中一个恶意的 function 不停的分配内存，在指定内存限制的情况下，function 执行时会产生什么样的结果？按照文档的说法，function 对应的 container 应该会被 kill 掉，然后 k8s 会创建一个新的 container（pod id 不变），那么创建 function execution 就应该会超时。

带着疑问和猜测，根据上面的定义创建了一个 pod，然后发送请求让容器分配 130M 的内存。查看 pod 对应的 container，发现 container 占用的内存使用始终是 128M 左右：
```shell
 $ systemd-cgtop -p -d 3 | grep 7a7d1e2592dff127d162851013a
/docker/7a7d1e2592dff127d162851013a77a1f55a4d64b0af3336c95a374b23929ea68       6      -   127.3M        -        -
```
感觉是 resource-consumer 容器中对内存分配请求没有生效，这与之前的测试结果矛盾。不能突破内存限制，我就无法观察 k8s 的行为以及测试 Qinling 的 function。

### 自定义 python 脚本
于是，我就干脆放弃使用 resource-consumer 镜像，直接写了一段 python 代码，基于 python 镜像创建一个新的镜像，镜像的初始命令就是执行这个 python 脚本。代码如下：
```python
def main(*args, **kwargs):
    giant_string = ''
    while True:
        with open('/var/log/dpkg.log', 'r') as f:
            for line in f:
                giant_string+=line

if __name__ == '__main__':
    main()
```

我的 deployment 定义：
```yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: test-resource-limit
  labels:
    app: test
spec:
  replicas: 2
  selector:
    matchLabels:
      app: test
  template:
    metadata:
      labels:
        app: test
    spec:
      containers:
      - name: test-resource-limit
        image: 192.168.33.12:5000/python:mem_test
        imagePullPolicy: IfNotPresent
        resources:
          limits:
            memory: 10Mi
          requests:
            memory: 5Mi
        args: ["/usr/local/bin/python", "/mem_test.py"]
```

执行命令并观察：
```bash
kube-shell> kubectl create -f ~/workdir/test/k8s/yaml/deployment_resource_limit.yaml
deployment "test-resource-limit" created
kube-shell> kubectl get po
NAME                                   READY     STATUS    RESTARTS   AGE
test-resource-limit-3907595593-d93q3   1/1       Running   0          2s
test-resource-limit-3907595593-sn7xx   1/1       Running   0          2s
...
kube-shell> kubectl get po
NAME                                   READY     STATUS      RESTARTS   AGE
test-resource-limit-3907595593-d93q3   0/1       OOMKilled   1          54s
test-resource-limit-3907595593-sn7xx   1/1       Running     1          54s
kube-shell> kubectl describe po test-resource-limit-3907595593-d93q3
Name:   test-resource-limit-3907595593-d93q3
Namespace:  qinling
Node:   minikube/192.168.99.100
Start Time: Wed, 29 Nov 2017 22:36:57 +1300
Labels:   app=test
    pod-template-hash=3907595593
Status:   Running
IP:   172.17.0.2
Controllers:  ReplicaSet/test-resource-limit-3907595593
Containers:
  test-resource-limit:
    Container ID: docker://20b050b933cd8a322abd4d2923e7cd54ff2862136abc854a413e9f55b8138358
    Image:    192.168.33.12:5000/python:mem_test
    Image ID:   docker://sha256:48f5c083d582251272c37141ea04d1b35a6d55865ff73d1d259e39586ee6c61f
    Port:
    Args:
      /usr/local/bin/python
      /mem_test.py
    Limits:
      memory: 10Mi
    Requests:
      memory:   5Mi
    State:    Terminated
      Reason:   OOMKilled
      Exit Code:  137
      Started:    Wed, 29 Nov 2017 22:37:22 +1300
      Finished:   Wed, 29 Nov 2017 22:37:45 +1300
    Last State:   Terminated
      Reason:   OOMKilled
      Exit Code:  137
      Started:    Wed, 29 Nov 2017 22:36:59 +1300
      Finished:   Wed, 29 Nov 2017 22:37:21 +1300
    Ready:    False
    Restart Count:  1
    Volume Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from default-token-g4qhm (ro)
    Environment Variables:  <none>
Conditions:
  Type    Status
  Initialized   True
  Ready   False
  PodScheduled  True
Volumes:
  default-token-g4qhm:
    Type: Secret (a volume populated by a Secret)
    SecretName: default-token-g4qhm
QoS Class:  Burstable
Tolerations:  <none>
Events:
  FirstSeen LastSeen  Count From      SubObjectPath       Type    Reason    Message
  --------- --------  ----- ----      -------------       --------  ------    -------
  1m    1m    1 {default-scheduler }            Normal    Scheduled Successfully assigned test-resource-limit-3907595593-d93q3 to minikube
  59s   59s   1 {kubelet minikube}  spec.containers{test-resource-limit}  Normal    Pulling   pulling image "192.168.33.12:5000/python:mem_test"
  58s   58s   1 {kubelet minikube}  spec.containers{test-resource-limit}  Normal    Pulled    Successfully pulled image "192.168.33.12:5000/python:mem_test"
  58s   58s   1 {kubelet minikube}  spec.containers{test-resource-limit}  Normal    Created   Created container with docker id 6310cbacc189; Security:[seccomp=unconfined]
  58s   58s   1 {kubelet minikube}  spec.containers{test-resource-limit}  Normal    Started   Started container with docker id 6310cbacc189
  36s   36s   1 {kubelet minikube}  spec.containers{test-resource-limit}  Normal    Pulled    Container image "192.168.33.12:5000/python:mem_test" already present on machine
  36s   36s   1 {kubelet minikube}  spec.containers{test-resource-limit}  Normal    Created   Created container with docker id 20b050b933cd; Security:[seccomp=unconfined]
  35s   35s   1 {kubelet minikube}  spec.containers{test-resource-limit}  Normal    Started   Started container with docker id 20b050b933cd
  11s   11s   1 {kubelet minikube}  spec.containers{test-resource-limit}  Warning   BackOff   Back-off restarting failed docker container
  11s   11s   1 {kubelet minikube}            Warning   FailedSync  Error syncing pod, skipping: failed to "StartContainer" for "test-resource-limit" with CrashLoopBackOff: "Back-off 10s restarting failed container=test-resource-limit pod=test-resource-limit-3907595593-d93q3_qinling(d7cdd32b-d4e8-11e7-834f-080027f5d15d)"
kube-shell> kubectl get po
NAME                                   READY     STATUS      RESTARTS   AGE
test-resource-limit-3907595593-d93q3   0/1       OOMKilled   2          1m
test-resource-limit-3907595593-sn7xx   0/1       Error       1          1m
kube-shell> kubectl get po
NAME                                   READY     STATUS    RESTARTS   AGE
test-resource-limit-3907595593-d93q3   1/1       Running   3          1m
test-resource-limit-3907595593-sn7xx   1/1       Running   2          1m
```

可以看到，pod 中的 container 在不断的被 kill 和创建，我们也确实看到了久违的 OOMKilled 状态。

通过使用 `systemd-cgtop` 命令观察也确实看到容器的内存占用迅速上升，但到了 10M 左右就停止了，过了一会儿容器就消失了（被 kill 掉了）：
```bash
$ systemd-cgtop | grep 20b050b9
/docker/20b050b933cd8a322abd4d2923e7cd54ff2862136abc854a413e9f55b8138358       1      -     5.1M        -        -
$ systemd-cgtop | grep 20b050b9
/docker/20b050b933cd8a322abd4d2923e7cd54ff2862136abc854a413e9f55b8138358       1      -     7.8M        -        -
$ systemd-cgtop | grep 20b050b9
/docker/20b050b933cd8a322abd4d2923e7cd54ff2862136abc854a413e9f55b8138358       1      -     9.8M        -        -
$ systemd-cgtop | grep 20b050b9
/docker/20b050b933cd8a322abd4d2923e7cd54ff2862136abc854a413e9f55b8138358       1      -     9.8M        -        -
$ systemd-cgtop | grep 20b050b9
/docker/20b050b933cd8a322abd4d2923e7cd54ff2862136abc854a413e9f55b8138358       1      -     9.8M        -        -
$ systemd-cgtop | grep 20b050b9
/docker/20b050b933cd8a322abd4d2923e7cd54ff2862136abc854a413e9f55b8138358       1      -     9.9M        -        -
$ systemd-cgtop | grep 20b050b9
$ systemd-cgtop | grep 20b050b9
```

所以，k8s 果然如它所说，如果 container 一旦超出内存上限，就会被 kill 掉并在 pod 中重建。那为什么 resource-consumer 镜像会失效呢？我暂且把这个疑问放一边，先测试 Qinling。

### Qinling 测试
在 Qinling 中修改创建 deployment 时的定义，加上内存资源限制，创建同样的 function，然后执行 function：
```bash
root@qinling:/vagrant# openstack function create --code-type package --runtime $RUNTIME_ID --entry test_mem_limit.main --file /vagrant/functions/test_mem_limit.py --name test_mem_limit
+-------------+--------------------------------------+
| Field       | Value                                |
+-------------+--------------------------------------+
| id          | 92736230-c453-461d-8d32-f46ef8268ed1 |
| name        | test_mem_limit                       |
| description | None                                 |
| count       | 0                                    |
| code        | {u'source': u'package'}              |
| runtime_id  | 25c69db7-fe3f-49be-a301-ea88fec70445 |
| entry       | test_mem_limit.main                  |
| created_at  | 2017-11-29 02:19:04.137859           |
| updated_at  | None                                 |
+-------------+--------------------------------------+
root@qinling:/vagrant# FUNCTION_ID=92736230-c453-461d-8d32-f46ef8268ed1
root@qinling:/vagrant# openstack function execution create $FUNCTION_ID --sync
+-------------+--------------------------------------+
| Field       | Value                                |
+-------------+--------------------------------------+
| id          | ab9e197a-e3f8-4ad7-80b3-a3fda409cf9f |
| function_id | 92736230-c453-461d-8d32-f46ef8268ed1 |
| description | None                                 |
| input       | {}                                   |
| output      | {"duration": 8.94, "output": null}   |
| status      | success                              |
| sync        | True                                 |
| created_at  | 2017-11-29 02:19:35                  |
| updated_at  | 2017-11-29 02:19:46                  |
+-------------+--------------------------------------+
```

function 竟然在8秒后执行成功了？！

经过深入 debug，发现容器中执行 function 的子进程貌似执行到一半就被中断了，后面的日志也并没有打印出来。于是我猜测是不是子进程因为内存占用太多被 kill 掉了？查看子进程的退出码，-9，果然是。而在 resource-consumer 的文档中也说：Each http request creates new process，也是子进程。上面不生效的原因也极有可能是服务被 kill 掉，内存分配没有成功。

看来，如果是在子进程进行内存超分配，该子进程会被 kill，而不会影响整个 container。

知道了 container 中的行为，对应的修改 Qinling 的代码，让 Qinilng 优雅的处理内存超分配的情况，patch 在[这里](https://review.openstack.org/523677)，效果如下：
```bash
root@qinling:/vagrant# openstack function execution create $FUNCTION_ID --sync
+-------------+---------------------------------------------------------------------------------------------+
| Field       | Value                                                                                       |
+-------------+---------------------------------------------------------------------------------------------+
| id          | 647f4630-9d5e-4e10-b7a2-75d58b10e3aa                                                        |
| function_id | e9e10383-9edd-4d54-9648-b80b7260d5d5                                                        |
| description | None                                                                                        |
| input       | {}                                                                                          |
| output      | {"duration": 9.738, "output": "Function execution failed because of resource consumption."} |
| status      | failed                                                                                      |
| sync        | True                                                                                        |
| created_at  | 2017-11-29 03:12:36                                                                         |
| updated_at  | 2017-11-29 03:12:48                                                                         |
+-------------+---------------------------------------------------------------------------------------------+
```

其实，k8s 也提供了在 namespace 中统一定义资源限制的功能，这样就不用为不同的 pod/deployment 设置资源限制，通过创建 LimitRange 实现。

## CPU 资源限制

### 在 Qinling 中限制 cpu 使用
k8s 中对 cpu 资源的限制跟 docker 中有些不一样。docker 中限制 cpu 其实是相对的，是规定不同 container 之间使用 cpu 的比例，默认是1024，如果创建一个 container 指定 cpu 是512，表明该 container 对 cpu 的使用概率是其他 container 的一半。当然，如果系统中就一个 container，还是会使用系统中全部的 cpu 资源。

k8s 中的 cpu 就是实实在在的 cpu 资源，会直接影响 pod 的调度，如果限定了 cpu 是0.1，表明该 container 最多使用系统 cpu 资源的 10%。如果没有定义 cpu 限制，则会使用全部的 cpu 资源。在 qinling 中定义资源限制如下：
```yaml
resources:
  limits:
    cpu: "0.5"
    memory: 512Mi
  requests:
    cpu: "0.1"
    memory: 128Mi
```

定义一个 fibonacci 函数：
```python
def f(n):
    if n == 0: return 0
    elif n == 1: return 1
    else: return f(n-1)+f(n-2)


def subFib(startNumber, endNumber):
    n = 0
    cur = f(n)
    while cur <= endNumber:
        if startNumber <= cur:
            print cur
        n += 1
        cur = f(n)

def main(start=0, end=1000000, **kwargs):
    subFib(start, end)


if __name__ == '__main__':
    main()
```

在函数执行过程中查看 container 的资源占用，可以看到该 container 最多使用了50%的 cpu：
```
Control Group                                                                                 Tasks   %CPU   Memory  Input/s Output/s
/docker/f93c7062a36af5345496da0d5c981f59c5a95fe4043405199c5371f71a1d8e2c                      5       50.0   36.0M   -       -
```

### Lambda 的 cpu 资源限制
对于 cpu 密集型的 function，并发越高，需要的 cpu 资源越多，function 的响应就越慢。

但在 aws lambda 的 limit 中却并没有提及 cpu 资源，但在其 [product details](https://aws.amazon.com/lambda/details/) 页面中提到：

> You choose the amount of memory you want to allocate to your functions and AWS Lambda allocates proportional CPU power, network bandwidth, and disk I/O.

网上已经有人基于实际测试得出[结论](https://serverless.zone/my-accidental-3-5x-speed-increase-of-aws-lambda-functions-6d95351197f3)，你申请的 mem 资源越多，给你分配的 cpu 资源就越多。