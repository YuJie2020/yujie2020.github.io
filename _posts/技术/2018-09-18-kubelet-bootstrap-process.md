---
layout: post
title: Kubernetes - kubelet bootstrap 流程
category: 技术
---

更新历史：

- 2018.09.18，初稿完成
- 2018.10.13，增加 kubeadm 的方法

很长时间没写东西了。离家在外两个人带娃很忙，在家空闲的时间基本都用来陪娃了，在加上前段时间在备考 CKA，时间上更是抠抠缩缩。业内人士都知道 CKA 是 Kubernetes(下面简称 k8s) 社区认证的管理员证书，我作为早期参与 openstack(下面简称 os) 的社区开发人员，openstack 的证书都没怎么关心过，现在为啥要考这个 CKA 呢？其实原因很简单，就是想对 k8s 多一些了解。我从2013年开始以开发人员的角色接触 os，当时年轻气盛，精力无限，一上来就是边阅读源码边安装试用，碰到问题都是通过读代码解决，从 os 内部的实现机制入手然后再从外往内看使用场景以及 os 的各种优势。时过境迁，人年龄大了，接触的东西多了，不能什么新事物和新技术一上来就是啃代码，没了年轻的资本，才不得不采取更为稳妥也更科学的学习方式，**从外到内，先会用，然后再了解其原理机制，必要时才去定制**。那怎么才算是会用呢，或者怎么才能向别人证明你会用呢？答案自然就是考证了。我见过有很多人是为了考证而考证，特别是那些急于找工作的。但 CKA 对我而言其实更多的是一种鞭策，让自己心里有个小目标，同时能够以运维人员而非开发者的身份去系统的学习使用 k8s。

说回到 CKA，考试时长三个小时，在自己的电脑上开摄像头和共享屏幕，远程监考。考前考官会要求你出示 ID，转动电脑，检查周边环境。考试期间，没有特殊理由头部不能离开屏幕，要让考官全程能够清楚的看到你的答题状态。我这人平时有个习惯，思考问题的时候会不自觉手托下巴，会把嘴挡住，中间就被考官提醒过两次。考题其实并不难，答案基本都能在官方文档上找到，所以要对文档熟悉。考试时长三个小时，共24道题，主要是考动手操作能力。我其实在将近两个小时的时候就做完了23道，剩下的一道关于kubelet bootstrap的，我确实生疏，但所幸时间充裕，我就慢慢悠悠的研究了一个小时，最后按时做完。最终我的得分是96%。我不确定那道题我是否拿到了满分，但考完后心里一直念叨，于是趁热打铁，重新梳理了一下kubelet bootstrap的流程，本文讲解其原理和记录实验过程。

![](/images/2018-09-18-kubelet-bootstrap-process/cka_lingxian.png)

首先，什么是kubelet bootstrap？在安装 k8s worker node 时，基本上 worker 的初始状态仅仅是安装了 docker 和 kubelet，worker 需要一种机制跟 master 通信。但网络通信的基本假设是通信双方谁也不信任谁。所以，kubelet bootstrap要以自动化的方式解决如下几个问题：

- 在只知道  api server IP 地址的情况下，worker node 如何获取 api server 的 CA 证书？
- 如何让 api server 信任 worker？因为在 api server 信任 worker 之前，worker 没有途径拿到自己的证书，有点鸡生蛋蛋生鸡的感觉

本文的实验目的就是将一个新的 worker node(主机名为 test-node) 添加到已有的 k8s 集群中。

> 其实，使用 kubeadm 工具完成这个工作就是简单的一行命令，kubeadm 会自动完成很多工作。但 CKA 考试场景中涉及很多定制，并且为了更好的了解kubelet bootstrap的流程，本文不考虑使用 kubeadm

## 什么是 bootstrap token

要让 api server 信任 worker，worker 得需要先过 master 认证鉴权这一关。k8s 以插件化的方式支持很多种认证方式，比如 token 文件，x509证书，service account 等等，其中就包含一个名为“Bootstrap Token Authentication”的认证方式，基本上 k8s 的默认安装就默认支持这种认证方式。这种方式最初就是设计用来给添加 worker node 用的。使用 Bootstrap Token Authentication 时，只需告诉 kubelet 一个特殊的 token，kubelet 自然就能通过 api server 的认证。所以，首先得保证 k8s 中定义了这个 token：
```shell
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: bootstrap-token-abcdef
  namespace: kube-system
type: bootstrap.kubernetes.io/token
stringData:
  description: "The bootstrap token for testing."
  token-id: abcdef
  token-secret: 0123456789abcdef
  expiration: 2019-09-16T00:00:00Z
  usage-bootstrap-authentication: "true"
  usage-bootstrap-signing: "true"
  auth-extra-groups: system:bootstrappers:test-nodes
EOF
```

在上面的 token 定义中，需要注意：

- token 的 name 必须是 `bootstrap-token-<token-id>` 的格式
- token 的 type 必须是 `bootstrap.kubernetes.io/token`
- token 的 token-id 和 token-secret 分别是6位和16位数字和字母的组合
- `auth-extra-groups` 定义了 token 代表的用户所属的额外的 group，而默认 group 名为 `system:bootstrappers`
- 这种类型 token 代表的用户名为 `system:bootstrap:<token-id>`，在本文中就是 `system:bootstrap:abcdef`

## 如何生成 kubelet 证书

有了 token，kubelet 就能通过 api server 的认证，连接建立，至此是不是万事大吉了。NO!

也许你已经注意到了，上面的 token 定义有 `expiration` 字段，表示这个 token 是有有效期的，过了有效期，token 失效，kubelet 就无法使用 token 跟 api server 通信，所以这个 token 只能作为 kubelet 初始化时跟 api server 的临时通信，而并非持久方案。

kubelet 最终还是需要使用证书跟 api server 通信，证书从何而来？如果让 k8s 的安装人员为每一个 worker node 生成并维护一份证书，工作量太大太繁琐，这也是设计 bootstrap token 要解决的问题之一，即：kubelet 使用低权限的 bootstrap token 跟 api server 建立连接后，要能够自动向 api server 申请自己的证书，并且 api server 要能够自动审批证书。

是的，很多人都会想到，k8s 支持 cert sign API。在 k8s 的证书认证中，要么由管理员手动为用户生成证书，要么是使用更为服务化的方式，由需要证书的用户自己向 k8s 申请，k8s 管理员只需在后台审批即可。但手动的为每一个用户审批，并没有带来很大的便利性，所以 k8s 还支持自动审批，只不过目前自动审批仅仅针对 kubelet。下面我们就模拟一个用户手动发送 csr，让 k8s 自动审批。

首先生成一个名为 vip 的用户证书，该证书需要管理员审批，下面的操作都是以 k8s admin 用户身份执行:

```shell
name=vip
group=newlands
cat <<EOF | cfssl genkey - | cfssljson -bare $name
{
  "hosts": [],
  "CN": "$name",
  "key": {
    "algo": "ecdsa",
    "size": 256
  },
  "names": [
    {
      "C": "NZ",
      "ST": "Wellington",
      "L": "Wellington",
      "O": "$group",
      "OU": "Test"
    }
  ]
}
EOF
# 创建 csr
cat <<EOF | kubectl apply -f -
apiVersion: certificates.k8s.io/v1beta1
kind: CertificateSigningRequest
metadata:
  name: $name
spec:
  groups:
    - $group
  request: $(cat ${name}.csr | base64 | tr -d '\n')
  usages:
    - key encipherment
    - digital signature
    - client auth
EOF
# 管理员手动审批
kubectl get csr $name -o json | jq -r '.status.certificate' | base64 -d > $name.crt
```

我们的目的是让 vip 用户发起的 csr 能够被自动审批。所以首先得允许 vip 用户访问 csr api，使用 kubeadm 安装 k8s 时已经默认创建了该 clusterrole，我们要做的就是给 vip 用户赋予这个 clusterrole：

```shell
$ kubectl describe clusterrole system:node-bootstrapper
Name:         system:node-bootstrapper
Labels:       kubernetes.io/bootstrapping=rbac-defaults
Annotations:  rbac.authorization.kubernetes.io/autoupdate=true
PolicyRule:
  Resources                                       Non-Resource URLs  Resource Names  Verbs
  ---------                                       -----------------  --------------  -----
  certificatesigningrequests.certificates.k8s.io  []                 []              [create get list watch]
root@lingxiantest-k8s-master [~]
$ kubectl create clusterrolebinding csr-vip --clusterrole system:node-bootstrapper --user vip
clusterrolebinding.rbac.authorization.k8s.io/csr-vip created
```

其次，我们需要给 vip 用户另一个特殊的 clusterrole，这个 clusterrole 在使用 kubeadm 安装 k8s 时也已经被自动创建：

```shell
$ kubectl describe clusterrole system:certificates.k8s.io:certificatesigningrequests:nodeclient
Name:         system:certificates.k8s.io:certificatesigningrequests:nodeclient
Labels:       kubernetes.io/bootstrapping=rbac-defaults
Annotations:  rbac.authorization.kubernetes.io/autoupdate=true
PolicyRule:
  Resources                                                  Non-Resource URLs  Resource Names  Verbs
  ---------                                                  -----------------  --------------  -----
  certificatesigningrequests.certificates.k8s.io/nodeclient  []                 []              [create]
$ kubectl create clusterrolebinding \
  nodeclient-vip \
  --clusterrole system:certificates.k8s.io:certificatesigningrequests:nodeclient \
  --user vip
```

然后我们**以 vip 用户身份**执行如下命令(与上文类似)，注意因为自动审批目前只针对 kubelet，所以 vip 申请的 csr 用户名必须是 `system:node:<name>` 的形式，group 必须是 `system:nodes`，并且 `usages` 也必须是命令中所示：

```shell
name=system:node:test-node
group=system:nodes
cat <<EOF | cfssl genkey - | cfssljson -bare $name
{
  "hosts": [],
  "CN": "$name",
  "key": {
    "algo": "ecdsa",
    "size": 256
  },
  "names": [
    {
      "C": "NZ",
      "ST": "Wellington",
      "L": "Wellington",
      "O": "$group",
      "OU": "Test"
    }
  ]
}
EOF
cat <<EOF | kubectl apply -f -
apiVersion: certificates.k8s.io/v1beta1
kind: CertificateSigningRequest
metadata:
  name: $name
spec:
  groups:
    - $group
  request: $(cat ${name}.csr | base64 | tr -d '\n')
  usages:
    - key encipherment
    - digital signature
    - client auth
EOF
```

然后查看 csr，可以看到 csr 的状态已经是 `Approved,Issued`，实验结束：

```shell
$ kubectl get csr
NAME                    AGE       REQUESTOR   CONDITION
system:node:test-node   3s        vip         Approved,Issued
```

由上述实验可以得知，为了让 bootstrap token 所代表的用户(username：`system:bootstrap:<token-id>`，group：`system:bootstrappers`)申请的 csr 能够被自动审批，必须要给该用户或组赋予两个 clusterrole：`certificatesigningrequests.certificates.k8s.io/nodeclient` 和 `system:node-bootstrapper`：

```shell
kubectl create clusterrolebinding nodeclient-test-node \
  --clusterrole system:certificates.k8s.io:certificatesigningrequests:nodeclient \
  --user system:bootstrap:abcdef
kubectl create clusterrolebinding csr-test-node \
  --clusterrole system:node-bootstrapper \
  --user system:bootstrap:abcdef
```

## bootstrap token 后处理

通过上述讲解我们知道，bootstrap token 是 kubelet 引导的关键，如果其他人知道了 bootstrap token 那就意味着可以访问 k8s 的某些资源，所以要么给 bootstrap token 设定一个很短的有效期，要么 kubelet 引导结束后就手动删除，防止 bootstrap token 被再次使用。

## kubelet 客户端证书 renewal

现在，kubelet 有了自己跟 api server 通信的证书，剩下的一个任务就是处理证书过期的问题。既然证书的生成都是自动化的，如果证书的 renew 需要手动那就太 low 了，所以跟生成证书的原理相似，k8s 也提供一个 clusterrole 可以赋予 kubelet 用户或组让 renew 证书的请求也能够被自动审批：

```shell
$ kubectl describe clusterrole system:certificates.k8s.io:certificatesigningrequests:selfnodeclient
Name:         system:certificates.k8s.io:certificatesigningrequests:selfnodeclient
Labels:       kubernetes.io/bootstrapping=rbac-defaults
Annotations:  rbac.authorization.kubernetes.io/autoupdate=true
PolicyRule:
  Resources                                                      Non-Resource URLs  Resource Names  Verbs
  ---------                                                      -----------------  --------------  -----
  certificatesigningrequests.certificates.k8s.io/selfnodeclient  []                 []              [create]
```

但这个 clusterrole 可不是赋予 bootstrap token 所代表的用户了，而是使用 bootstrap token 所获取到的证书所代表的用户。在 k8s 中，其用户名是 `system:node:<node-name>` 的形式，group 是`system:nodes`，所以就需要：

```shell
kubectl create clusterrolebinding nodeclient-cert-renewal \
  --clusterrole system:certificates.k8s.io:certificatesigningrequests:selfnodeclient \
  --user system:node:test-node
```

在执行上面的命令前，你可以先检查一下相应的 clusterrolebinding 是否已经创建了：

```shell
kubectl get clusterrolebindings -o json | jq -r '.items[] | select(.subjects // [] | .[] | [.kind,.name] == ["Group","system:nodes"]) | .metadata.name'
```

如果是使用 kubeadm 安装的 k8s cluster，你会看到上面的命令返回 `kubeadm:node-autoapprove-certificate-rotation`，继续查看这个 clusterrolebinding，你会发现正是我们想要的：

```shell
$ kubectl describe clusterrolebinding kubeadm:node-autoapprove-certificate-rotation
Name:         kubeadm:node-autoapprove-certificate-rotation
Labels:       <none>
Annotations:  <none>
Role:
  Kind:  ClusterRole
  Name:  system:certificates.k8s.io:certificatesigningrequests:selfnodeclient
Subjects:
  Kind   Name          Namespace
  ----   ----          ---------
  Group  system:nodes
```

## 引导 kubelet

有了上述背景知识，在一个新的 worker node 上配置 kubelet service 就比较简单了。先总结一下我们都创建了什么东西：

1. 创建了 bootstrap token
2. 给 bootstrap token 代表的用户 `system:bootstrap:abcdef` 赋予 clusterole `certificatesigningrequests.certificates.k8s.io/nodeclient` 和 `system:node-bootstrapper`，让该用户可以访问 csr API 以及自动审批其创建的 csr
3. 给新的 work node 代表的用户 `system:node:test-node` 赋予 clusterrole `system:certificates.k8s.io:certificatesigningrequests:selfnodeclient`，让它发送的证书 renew 的请求能被自动审批

接下来，需要生成 bootstrap 配置文件，这里假设我们已经知道 api server 的地址以及 ca 证书(关于如何获取这些信息后续会补充)，你可以在 master node 执行如下命令生成 bootstrap-kubeconfig 文件并拷贝到 test-node 上：

```shell
kubectl config set-cluster k8s --server https://10.0.0.11:6443 --certificate-authority=/etc/kubernetes/pki/ca.crt --embed-certs=true --kubeconfig=/var/lib/kubelet/bootstrap-kubeconfig
kubectl config set-credentials test-node --token=abcdef.0123456789abcdef --kubeconfig=/var/lib/kubelet/bootstrap-kubeconfig
kubectl config set-context test-node-bootstrap --cluster k8s --user test-node --kubeconfig=/var/lib/kubelet/bootstrap-kubeconfig
kubectl config use-context test-node-bootstrap --kubeconfig=/var/lib/kubelet/bootstrap-kubeconfig
```

配置 kubelet systemd 配置文件，需要指定 `--kubeconfig` 以存放 bootstrap token 获取的证书信息，kubelet 会动态创建该文件，而证书文件本身默认存放在 `/var/lib/kubelet/pki` 目录下，可以指定 `--cert-dir` 自定义证书路径：

```shell
cat <<EOF > /etc/systemd/system/kubelet.service
[Unit]
Description=Kubernetes Kubelet
Documentation=https://github.com/kubernetes/kubernetes
After=docker.service
Requires=docker.service

[Service]
ExecStart=/usr/bin/kubelet \\
  --bootstrap-kubeconfig=/var/lib/kubelet/bootstrap-kubeconfig \\
  --kubeconfig=/var/lib/kubelet/kubeconfig \\
  --network-plugin=cni \\
  --rotate-certificates=true \\
  --register-node=true \\
  --v=2
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

重启 kubelet 服务：

```shell
systemctl daemon-reload; systemctl restart kubelet
```

待 kubelet 服务启动后，你可以在 worker node 上 `/var/lib/kubelet/pki` 目录下看到生成的证书，并且 kubelet 自动生成了 `/var/lib/kubelet/kubeconfig` 文件。

```shell
$ ll /var/lib/kubelet/pki
total 12
-rw------- 1 root root 1114 Sep 17 13:38 kubelet-client-2018-09-17-13-38-33.pem
lrwxrwxrwx 1 root root   59 Sep 17 13:38 kubelet-client-current.pem -> /var/lib/kubelet/pki/kubelet-client-2018-09-17-13-38-33.pem
-rw-r--r-- 1 root root 2193 Sep 15 08:48 kubelet.crt
-rw------- 1 root root 1675 Sep 15 08:48 kubelet.key
$ ll /var/lib/kubelet/kubeconfig
-rw------- 1 root root 1850 Sep 17 13:38 /var/lib/kubelet/kubeconfig
```

查看证书信息，仅关注 CN 和 O 字段信息，与之前的讲解一致：

```shell
$ openssl x509 -noout -text -in /var/lib/kubelet/pki/kubelet-client-current.pem
        Subject: O=system:nodes, CN=system:node:test-node
```

使用 kubectl 查看 node 信息可以看到该 node 状态已经 ready：

```shell
$ kubectl get node
NAME                      STATUS    ROLES     AGE       VERSION
lingxiantest-k8s-master   Ready     master    6d        v1.11.1
lingxiantest-k8s-node1    Ready     <none>    6d        v1.11.1
test-node                 Ready     <none>    3m        v1.11.1
```

## 总结

总结一下 kubelet 的 bootstrap 流程：

![](/images/2018-09-18-kubelet-bootstrap-process/bootstrap-process.png)

## 如果使用 kubeadm

上面的所有步骤都是假设 kubeadm 不可用，而且 CKA 的考试也不会让你用 kubeadm。但如果是你自己的环境，那么使用 kubeadm 引导一个新的 kubelet 节点是最简单的，因为 kubeadm 会自动帮你干很多事儿。

1. 在 master node 生成一个新的 token

   因为 bootstrap token 有效期默认是24小时，所以当你考虑向 cluster 中新增 node 时，原来创建的 token 可能早已过期，你需要创建一个新的 bootstrap token。

   ```shell
   $ kubeadm token list
   TOKEN                     TTL         EXPIRES                USAGES                   DESCRIPTION   EXTRA GROUPS
   ebpxef.6059low577z0imyv   <invalid>   2018-09-30T05:45:38Z   authentication,signing   <none>        system:bootstrappers:kubeadm:default-node-token
   $ kubeadm token create
   mfa708.ppxrbz1g945jj2un
   ```

2. 在新 worker node 上：

   ```
   kubeadm join --discovery-token-unsafe-skip-ca-verification --token mfa708.ppxrbz1g945jj2un 10.0.0.18:6443
   ```

   这里我为了省事儿，没有去验证 master 的 CA 公钥。命令执行后，你就会看到一个新的 node 已经加入 k8s cluster，是不是很简单？

## 参考文档

- [k8s 官网](https://kubernetes.io/docs/reference/command-line-tools-reference/kubelet-tls-bootstrapping/)
- 这位朋友的两篇博客都讲得不错，[文章一](https://mritd.me/2018/01/07/kubernetes-tls-bootstrapping-note/)， [文章二](https://mritd.me/2018/08/28/kubernetes-tls-bootstrapping-with-bootstrap-token/)