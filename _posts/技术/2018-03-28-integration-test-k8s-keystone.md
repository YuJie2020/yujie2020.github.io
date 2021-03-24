---
layout: post
title: Integration Test of Kubernetes and Keystone - 中文版
category: 技术
---

更新历史：

- 20180328，初稿完成
- 20180403，在我的优化鉴权配置的 [PR](https://github.com/kubernetes/cloud-provider-openstack/pull/79) merge 之后，修改部分内容，并增加录制视频

在[上一篇博客](https://lingxiankong.github.io/2018-02-23-openstack-k8s-integration.html)中介绍了 k8s 和 openstack 的集成，其中就包含与 keystone 的集成，这里新开一篇来专门记录测试过程，理论知识可以自行 google。

## 与 keystone 集成之前

### 认证

使用 kubeadm 安装完 k8s 后，一般都会在命令行使用 kubectl 与 k8s打交道。其实安装完 kubeadm，一般都会有一个默认的 admin 用户的配置文件，在 `~/.kube/config` 文件中，包含了 k8s cluster 的 ca 证书以及 admin 用户的 client 证书，换句话说，默认情况下，kubectl 使用证书的方式与 k8s 打交道，k8s 从证书中获取用户信息(比如用户名和用户所属的组)。而是用证书只是 k8s 支持的认证方式的其中一种，其他还有比如静态用户名密码文件，token， webhook 等。如果转换成 http 请求:

```bash
http --verify /etc/kubernetes/pki/ca.crt --cert /etc/kubernetes/pki/admin.crt --cert-key /etc/kubernetes/pki/admin.key GET https://10.0.19.122:6443/api/v1/namespaces/default/pods
```

其中证书文件内容就是 `~/.kube/config` 中的证书经过 base64 解密后的内容。如果查看 `admin.crt` 证书内容：

```bash
$ openssl x509 -noout -text -in /etc/kubernetes/pki/admin.crt
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number: 5138430866187550630 (0x474f5fa5f202ffa6)
    Signature Algorithm: sha256WithRSAEncryption
        Issuer: CN=kubernetes
        Validity
            Not Before: Mar 26 11:16:03 2018 GMT
            Not After : Mar 26 11:16:06 2019 GMT
        Subject: O=system:masters, CN=kubernetes-admin
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
...
```

其中 `O=system:masters, CN=kubernetes-admin` 说明用户名是 `kubernetes-admin`，group 名称是 `system:masters`

### 鉴权

用户经过认证后，接下来就是鉴权，即：该用户有没有权限做他想做的事儿(比如 list 所有的 pod)。kubeadm 安装完 k8s 就默认启用了 RBAC，因为管理员的权限较高所以默认就能够做任何操作。接下来我使用 k8s 的 ca 证书为一个新的用户(lingxian)生成证书：

```bash
# 先安装 go 和证书工具 cfssl
mkdir -p /opt/go
cat << 'EOF' >> ~/.bashrc
export GOROOT=/opt/go # go 的安装目录
export GOPATH=$HOME/go # GOPATH 目录用于存放src/bin/pkg，从1.8版本开始默认是~/go
export PATH=$PATH:$GOROOT/bin:$GOPATH/bin/
EOF
source ~/.bashrc && cd /opt && wget https://storage.googleapis.com/golang/go1.10.linux-amd64.tar.gz # 到https://golang.org/dl/查看版本
tar xvzf go1.10.linux-amd64.tar.gz && rm -f go1.10.linux-amd64.tar.gz
go get -u github.com/cloudflare/cfssl/cmd/...
# 为 lingxian 用户生成证书
cd /etc/kubernetes/pki
cat > ca-config.json <<EOF
{
  "signing": {
    "default": {
      "expiry": "87600h"
    },
    "profiles": {
      "kubernetes": {
        "usages": [
            "signing",
            "key encipherment",
            "server auth",
            "client auth"
        ],
        "expiry": "87600h"
      }
    }
  }
}
EOF
cat > lingxian-csr.json <<EOF
{
  "CN": "lingxian",
  "hosts": [],
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "CN",
      "ST": "Wellington",
      "L": "Wellington",
      "O": "catalyst",
      "OU": "System"
    }
  ]
}
EOF
cfssl gencert -ca=ca.crt -ca-key=ca.key -config=ca-config.json -profile=kubernetes lingxian-csr.json | cfssljson -bare lingxian
```

现在有了 lingxian 用户的证书，使用该证书通过 http 访问 k8s：

```bash
$ http --verify /etc/kubernetes/pki/ca.crt --cert /etc/kubernetes/pki/lingxian.pem --cert-key /etc/kubernetes/pki/lingxian-key.pem GET https://10.0.19.122:6443/api/v1/namespaces/default/pods
HTTP/1.1 403 Forbidden
Content-Length: 222
Content-Type: application/json
Date: Wed, 28 Mar 2018 03:02:21 GMT
X-Content-Type-Options: nosniff
{
    "apiVersion": "v1",
    "code": 403,
    "details": {
        "kind": "pods"
    },
    "kind": "Status",
    "message": "pods is forbidden: User \"lingxian\" cannot list pods in the namespace \"default\"",
    "metadata": {},
    "reason": "Forbidden",
    "status": "Failure"
}
```

 因为我没有在 k8s 中创建任何的 RBAC 规则，所以默认情况下，lingxian 用户虽然能通过认证，但没有任何操作权限。接下来，我在 k8s 中为 lingxian 设置权限：

```bash
cat << EOF | kubectl create -f -
---
kind: Role
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  namespace: default
  name: pod-reader
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "watch", "list"]
---
kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: read-pods-for-lingxian
  namespace: default
subjects:
  - kind: User
    name: lingxian
    apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
EOF
```

再发送 http 请求：

```bash
$ http --verify /etc/kubernetes/pki/ca.crt --cert /etc/kubernetes/pki/lingxian.pem --cert-key /etc/kubernetes/pki/lingxian-key.pem GET https://10.0.19.122:6443/api/v1/namespaces/default/pods
HTTP/1.1 200 OK
Content-Length: 133
Content-Type: application/json
Date: Wed, 28 Mar 2018 03:09:51 GMT

{
    "apiVersion": "v1",
    "items": [],
    "kind": "PodList",
    "metadata": {
        "resourceVersion": "170743",
        "selfLink": "/api/v1/namespaces/default/pods"
    }
}
```

总结一下：**使用证书认证时，k8s 中没有保存用户的任何信息，k8s 管理员需要给用户颁发证书，k8s 直接从证书中读取用户信息。同时，k8s 管理员需要为用户设置操作权限，确保正确的用户可以操作正确的资源**。

## 与 keystone 集成

之前的博客中也介绍过，在 k8s 与 openstack 集成的场景中，openstack 中的用户在 openstack cloud 中创建完 k8s，自然希望能够使用 keystone 进行认证和鉴权，而不是在 k8s 集群中再设置一遍。此时需要 openstack 管理员在 keystone 中创建几个 role，比如 k8s-admin, k8s-viewer, k8s-editor，只有 k8s-admin 可以创建 k8s 集群同时也是 k8s 集群的管理员(拥有 k8s 的 admin 证书)，而同一个 tenant 下 k8s-viewer 角色的用户只有读权限，而不能创建或更新资源。

### 在 openstack 环境中添加 role

首先，到 openstack 环境(默认的 devstack 环境)中创建 role 并赋予不同的用户：

```bash
source openrc admin admin
for role in "k8s-admin" "k8s-viewer" "k8s-editor"; do openstack role create $role; done
openstack role add --user demo --project demo k8s-viewer
openstack user create demo_editor --project demo --password password
openstack role add --user demo_editor --project demo k8s-editor
openstack user create demo_admin --project demo --password password
openstack role add --user demo_admin --project demo k8s-admin
```

### 部署keystone 认证鉴权服务

然后，到 k8s 环境中，部署 keystone 认证和鉴权服务，该服务是以系统 pod 的形式运行：

```bash
curl https://bootstrap.pypa.io/get-pip.py && python get-pip.py && rm -f get-pip.py
apt-get install -y build-essential python-dev python-setuptools libffi-dev libxslt1-dev libxml2-dev libyaml-dev libssl-dev zlib1g-dev
pip install python-openstackclient
cat << EOF > /etc/kubernetes/pki/webhookpolicy.json
[
  {
    "resource": {
      "verbs": ["get", "list", "watch"],
      "resources": ["pods"],
      "version": "*",
      "namespace": "default"
    },
    "match": [
      {
        "type": "role",
        "values": ["k8s-admin", "k8s-viewer", "k8s-editor"]
      },
      {
        "type": "project",
        "values": ["c1f7910086964990847dc6c8b128f63c"]
      }
    ]
  },
  {
    "resource": {
      "verbs": ["create", "update", "delete"],
      "resources": ["pods"],
      "version": "*",
      "namespace": "default"
    },
    "match": [
      {
        "type": "role",
        "values": ["k8s-admin", "k8s-editor"]
      },
      {
        "type": "project",
        "values": ["c1f7910086964990847dc6c8b128f63c"]
      }
    ]
  }
]
EOF
# 启动 k8s-keystone-auth 服务
cat << EOF > /etc/kubernetes/manifests/k8s-keystone-auth.yaml
---
apiVersion: v1
kind: Pod
metadata:
  annotations:
    scheduler.alpha.kubernetes.io/critical-pod: ""
  labels:
    component: k8s-keystone-auth
    tier: control-plane
  name: k8s-keystone-auth
  namespace: kube-system
spec:
  containers:
    - name: k8s-keystone-auth
      image: lingxiankong/k8s-keystone-auth:authorization-improved
      imagePullPolicy: Always
      args:
        - ./bin/k8s-keystone-auth
        - --tls-cert-file
        - /etc/kubernetes/pki/apiserver.crt
        - --tls-private-key-file
        - /etc/kubernetes/pki/apiserver.key
        - --keystone-policy-file
        - /etc/kubernetes/pki/webhookpolicy.json
        - --keystone-url
        - http://10.0.19.138/identity/v3
      volumeMounts:
        - mountPath: /etc/kubernetes/pki
          name: k8s-certs
          readOnly: true
        - mountPath: /etc/ssl/certs
          name: ca-certs
          readOnly: true
      resources:
        requests:
          cpu: 200m
      ports:
        - containerPort: 8443
          hostPort: 8443
          name: https
          protocol: TCP
  hostNetwork: true
  volumes:
  - hostPath:
      path: /etc/kubernetes/pki
      type: DirectoryOrCreate
    name: k8s-certs
  - hostPath:
      path: /etc/ssl/certs
      type: DirectoryOrCreate
    name: ca-certs
status: {}
EOF
# 保存用户 openstack 认证信息以备后用
cat << EOF > ~/openrc_admin
export OS_AUTH_URL="http://10.0.19.138/identity/v3"
export OS_PROJECT_NAME="admin"
export OS_TENANT_NAME="admin"
export OS_USERNAME="admin"
export OS_PASSWORD="password"
export OS_REGION_NAME="RegionOne"
export OS_DOMAIN_NAME="default"
export OS_IDENTITY_API_VERSION="3"
EOF
cat << EOF > ~/openrc_demoadmin
export OS_AUTH_URL="http://10.0.19.138/identity/v3"
export OS_PROJECT_NAME="demo"
export OS_TENANT_NAME="demo"
export OS_USERNAME="demo_admin"
export OS_PASSWORD="password"
export OS_REGION_NAME="RegionOne"
export OS_DOMAIN_NAME="default"
export OS_IDENTITY_API_VERSION="3"
EOF
cat << EOF > ~/openrc_demo
export OS_AUTH_URL="http://10.0.19.138/identity/v3"
export OS_PROJECT_NAME="demo"
export OS_TENANT_NAME="demo"
export OS_USERNAME="demo"
export OS_PASSWORD="password"
export OS_REGION_NAME="RegionOne"
export OS_DOMAIN_NAME="default"
export OS_IDENTITY_API_VERSION="3"
EOF
cat << EOF > ~/openrc_demoeditor
export OS_AUTH_URL="http://10.0.19.138/identity/v3"
export OS_PROJECT_NAME="demo"
export OS_TENANT_NAME="demo"
export OS_USERNAME="demo_editor"
export OS_PASSWORD="password"
export OS_REGION_NAME="RegionOne"
export OS_DOMAIN_NAME="default"
export OS_IDENTITY_API_VERSION="3"
EOF
cat << EOF > ~/openrc_alt_demo
export OS_AUTH_URL="http://10.0.19.138/identity/v3"
export OS_PROJECT_NAME="alt_demo"
export OS_TENANT_NAME="alt_demo"
export OS_USERNAME="alt_demo"
export OS_PASSWORD="password"
export OS_REGION_NAME="RegionOne"
export OS_DOMAIN_NAME="default"
export OS_IDENTITY_API_VERSION="3"
EOF
```

等待 k8s-keystone-auth 系统 pod 运行，在配置 k8s 之前，可以先测试一下该服务是否能正常工作：

```bash
source ~/openrc_demo
token=$(openstack token issue -f yaml -c id | awk '{print $2}')
# 测试 authentication
$ cat << EOF | curl -kvs -XPOST -d @- https://localhost:8443/webhook | python -mjson.tool
{
  "apiVersion": "authentication.k8s.io/v1beta1",
  "kind": "TokenReview",
  "metadata": {
    "creationTimestamp": null
  },
  "spec": {
    "token": "$token"
  }
}
EOF
# 返回的 response
{
    "apiVersion": "authentication.k8s.io/v1beta1",
    "kind": "TokenReview",
    "metadata": {
        "creationTimestamp": null
    },
    "spec": {
        "token": "..."
    },
    "status": {
        "authenticated": true,
        "user": {
            "extra": {
                "alpha.kubernetes.io/identity/project/id": [
                    "c1f7910086964990847dc6c8b128f63c"
                ],
                "alpha.kubernetes.io/identity/project/name": [
                    "demo"
                ],
                "alpha.kubernetes.io/identity/roles": [
                    "load-balancer_member",
                    "k8s-viewer",
                    "Member"
                ]
            },
            "groups": [
                "c1f7910086964990847dc6c8b128f63c"
            ],
            "uid": "7f5b4ef2d58745d49502822ae4d552d8",
            "username": "demo"
        }
    }
}
# 测试 authorization
$ cat << EOF | curl -kvs -XPOST -d @- https://localhost:8443/webhook | python -mjson.tool
{
  "apiVersion": "authorization.k8s.io/v1beta1",
  "kind": "SubjectAccessReview",
  "spec": {
    "resourceAttributes": {
      "namespace": "default",
      "verb": "get",
      "group": "",
      "resource": "pods"
    },
    "user": "demo",
    "group": ["c1f7910086964990847dc6c8b128f63c"],
    "extra": {
        "alpha.kubernetes.io/identity/project/id": ["c1f7910086964990847dc6c8b128f63c"],
        "alpha.kubernetes.io/identity/project/name": ["demo"],
        "alpha.kubernetes.io/identity/roles": ["load-balancer_member","Member","k8s-viewer"]
    }
  }
}
EOF
# 返回的 response
{
    "apiVersion": "authorization.k8s.io/v1beta1",
    "kind": "SubjectAccessReview",
    "status": {
        "allowed": true
    }
}
```

### 配置 k8s

配置 k8s 使用 webhook 的方式进行认证和鉴权：

```bash
cat << EOF > /etc/kubernetes/pki/webhookconfig.yaml
---
apiVersion: v1
kind: Config
preferences: {}
clusters:
  - cluster:
      insecure-skip-tls-verify: true
      server: https://localhost:8443/webhook
    name: webhook
users:
  - name: webhook
contexts:
  - context:
      cluster: webhook
      user: webhook
    name: webhook
current-context: webhook
EOF
sed -i "/authorization-mode/c \ \ \ \ - --authorization-mode=Node,Webhook,RBAC" /etc/kubernetes/manifests/kube-apiserver.yaml
sed -i '/image:/ i \ \ \ \ - --authentication-token-webhook-config-file=/etc/kubernetes/pki/webhookconfig.yaml' /etc/kubernetes/manifests/kube-apiserver.yaml
sed -i '/image:/ i \ \ \ \ - --authorization-webhook-config-file=/etc/kubernetes/pki/webhookconfig.yaml' /etc/kubernetes/manifests/kube-apiserver.yaml
# 配置 kubectl 使用 openstack credential
kubectl config set-credentials openstackuser --auth-provider=openstack
kubectl config set-context --cluster=kubernetes --user=openstackuser openstackuser@kubernetes --namespace=default
kubectl config use-context openstackuser@kubernetes
```

### 验证 openstack 用户操作

验证 demo 用户的操作，demo 用户可以查看资源，但不能创建资源：

```bash
source ~/openrc_demo
$ kubectl get pods
No resources found.
# 如果尝试创建 pod，根据之前设置的规则，会鉴权失败
cat << EOF > ~/test_pod.yaml
---
apiVersion: v1
kind: Pod
metadata:
  name: busybox-test
  namespace: default
  labels:
    tag: single-pod
spec:
  containers:
  - name: busybox
    image: busybox
    command:
      - sleep
      - "3600"
    imagePullPolicy: IfNotPresent
  restartPolicy: Never
EOF
$ kubectl create -f ~/test_pod.yaml
Error from server (Forbidden): error when creating "test_pod.yaml": pods is forbidden: User "demo" cannot create pods in the namespace "default"
```

验证 `demo_editor` 用户的操作，该用户可以创建 pod：

```bash
source ~/openrc_demoeditor
$ kubectl create -f ~/test_pod.yaml
pod "busybox-test" created
```

验证 `alt_demo` 用户不能访问 demo 租户的资源：

```bash
source ~/openrc_alt_demo
$ kubectl get pods
Error from server (Forbidden): pods is forbidden: User "alt_demo" cannot list pods in the namespace "default"
```

我已经录制了部署和测试的过程：

[![asciicast](https://asciinema.org/a/2dgnfMUjTSZktjzDRt25wO9Yb.png)](https://asciinema.org/a/2dgnfMUjTSZktjzDRt25wO9Yb?speed=2&cols=150&rows=35)

### 其他注意事项

- keystone 认证和鉴权服务的源代码只能满足 poc，还有很多需要优化的地方，比如性能和易用性
- 在生产环境中，应该有自动化的方式根据用户的配置决定在创建 k8s 集群时是否部署 keystone 认证鉴权服务
