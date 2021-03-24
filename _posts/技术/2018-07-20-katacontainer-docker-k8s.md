---
layout: post
title: Katacontainers 与 Docker 和 Kubernetes 的集成
category: 技术
---

更新历史：

- 2018.07 初稿完成
- 2018.10 更新与 K8S 集成的一些命令和输出

![](/images/2018-07-20-katacontainer-docker-k8s/kata_banner.png)

Katacontainer 是 OpenStack 基金会于 2017 KubeCon 峰会上正式发布，在2018年5月份 OpenStack 温哥华峰会上对外发布1.0版本，并且在那届峰会上还有好几个关于 katacontainer 的演讲。我对 KataContainers 的具体实现原理不清楚，只知道它是一个轻量虚拟机实现，可以无缝地与容器生态系统(实现 OCI 接口)进行集成。

katacontainer(包括 Google 的 gVisor)的主要优势是能够对接遗留系统以及提供比传统容器更好的安全性。我在本文后面的实验也可以证明，katacontainer 可以与传统的 runc 并存，为不同性质的应用负载提供了强大的灵活性。

本文不讲原理，而主要是实战。

## 安装 Kata

在 ubuntu 16.04上：

```shell
echo "deb http://download.opensuse.org/repositories/home:/katacontainers:/release/xUbuntu_$(lsb_release -rs)/ /" > /etc/apt/sources.list.d/kata-containers.list
curl -sL http://download.opensuse.org/repositories/home:/katacontainers:/release/xUbuntu_$(lsb_release -rs)/Release.key | sudo apt-key add -
apt-get update && apt-get -y install kata-runtime kata-proxy kata-shim
```

验证安装：

```shell
$ kata-runtime --version
kata-runtime  : 1.3.1
   commit   : 258eae0
   OCI specs: 1.0.1
```

如果你是在虚拟机里安装 kata，最好执行下面的命令检测是否成功安装。因为 kata 实际上会创建虚拟机，所以要求安装 kata 的主机开启 nested virtualization：

```shell
$ kata-runtime kata-check
```

## 与 Docker 集成

本文假设你已经安装了 docker。配置 docker，增加对 kata runtime 的支持。

```shell
dir=/etc/systemd/system/docker.service.d
file="$dir/kata-containers.conf"
mkdir -p "$dir"
test -e "$file" || echo -e "[Service]\nType=simple\nExecStart=\nExecStart=/usr/bin/dockerd -D --default-runtime runc" | sudo tee "$file"
grep -q "kata-runtime=" $file || sudo sed -i 's!^\(ExecStart=[^$].*$\)!\1 --add-runtime kata-runtime=/usr/bin/kata-runtime!g' "$file"
systemctl daemon-reload
systemctl restart docker
```

Docker 默认使用 runc 创建容器，可以使用 `--runtime` 指定使用其他的 runtime。下面我们创建两个容器，一个使用 kata runtime，另一个使用默认的 runc。创建完容器之后，我们可以查看一下 kata container 的一些信息。
```shell
$ docker run -d --name kata-test -p 8081:8080 --runtime kata-runtime lingxiankong/alpine-test
3e899cb1a6931e7c1cd83cd7dd837a2ba1726ded789f3bc1c3debdeb3fa37b43
$ curl http://localhost:8081
3e899cb1a693
$ docker run -d --name runc-test -p 8082:8080 lingxiankong/alpine-test
4a68584ffd580f8395f80505c22bd131c387a49b977584dcbb211b3942b37642
root@test-kata [~]
$ curl http://localhost:8082
4a68584ffd58
$ docker ps
CONTAINER ID        IMAGE                      COMMAND               CREATED             STATUS              PORTS                    NAMES
4a68584ffd58        lingxiankong/alpine-test   "python /server.py"   2 minutes ago       Up 2 minutes        0.0.0.0:8082->8080/tcp   runc-test
3e899cb1a693        lingxiankong/alpine-test   "python /server.py"   3 minutes ago       Up 3 minutes        0.0.0.0:8081->8080/tcp   kata-test
$ ps -ef | grep docker | grep runtime | grep -v dockerd
root     17587 14084  0 04:00 ?        00:00:00 docker-containerd-shim -namespace moby -workdir /var/lib/docker/containerd/daemon/io.containerd.runtime.v1.linux/moby/3e899cb1a6931e7c1cd83cd7dd837a2ba1726ded789f3bc1c3debdeb3fa37b43 -address /var/run/docker/containerd/docker-containerd.sock -containerd-binary /usr/bin/docker-containerd -runtime-root /var/run/docker/runtime-kata-runtime -debug
root     17795 14084  0 04:02 ?        00:00:00 docker-containerd-shim -namespace moby -workdir /var/lib/docker/containerd/daemon/io.containerd.runtime.v1.linux/moby/4a68584ffd580f8395f80505c22bd131c387a49b977584dcbb211b3942b37642 -address /var/run/docker/containerd/docker-containerd.sock -containerd-binary /usr/bin/docker-containerd -runtime-root /var/run/docker/runtime-runc -debug
$ kata-runtime list
ID                                                                 PID         STATUS      BUNDLE                                                                                                                               CREATED                          OWNER
3e899cb1a6931e7c1cd83cd7dd837a2ba1726ded789f3bc1c3debdeb3fa37b43   17668       running     /run/docker/containerd/daemon/io.containerd.runtime.v1.linux/moby/3e899cb1a6931e7c1cd83cd7dd837a2ba1726ded789f3bc1c3debdeb3fa37b43   2018-07-16T04:00:44.547122236Z   #0
$ ps -ef | grep qemu | grep -v 'grep'
root     17637 17587  0 04:00 ?        00:00:08 /usr/bin/qemu-lite-system-x86_64 -name sandbox-3e899cb1a6931e7c1cd83cd7dd837a2ba1726ded789f3bc1c3debdeb3fa37b43 -uuid aebc12d8-4364-42a3-87a7-10ea669a85c9 -machine pc,accel=kvm,kernel_irqchip,nvdimm -cpu host,pmu=off -qmp unix:/run/vc/sbs/3e899cb1a6931e7c1cd83cd7dd837a2ba1726ded789f3bc1c3debdeb3fa37b43/qmp.sock,server,nowait -m 2048M,slots=2,maxmem=9006M -device pci-bridge,bus=pci.0,id=pci-bridge-0,chassis_nr=1,shpc=on,addr=2 -device virtio-serial-pci,disable-modern=true,id=serial0 -device virtconsole,chardev=charconsole0,id=console0 -chardev socket,id=charconsole0,path=/run/vc/sbs/3e899cb1a6931e7c1cd83cd7dd837a2ba1726ded789f3bc1c3debdeb3fa37b43/console.sock,server,nowait -device nvdimm,id=nv0,memdev=mem0 -object memory-backend-file,id=mem0,mem-path=/usr/share/kata-containers/kata-containers-image_clearlinux_agent_7b458b1.img,size=536870912 -device virtio-scsi-pci,id=scsi0,disable-modern=true -device virtserialport,chardev=charch0,id=channel0,name=agent.channel.0 -chardev socket,id=charch0,path=/run/vc/sbs/3e899cb1a6931e7c1cd83cd7dd837a2ba1726ded789f3bc1c3debdeb3fa37b43/kata.sock,server,nowait -device virtio-9p-pci,disable-modern=true,fsdev=extra-9p-kataShared,mount_tag=kataShared -fsdev local,id=extra-9p-kataShared,path=/run/kata-containers/shared/sandboxes/3e899cb1a6931e7c1cd83cd7dd837a2ba1726ded789f3bc1c3debdeb3fa37b43,security_model=none -netdev tap,id=network-0,vhost=on,vhostfds=3:4:5:6:7:8:9:10,fds=11:12:13:14:15:16:17:18 -device driver=virtio-net-pci,netdev=network-0,mac=02:42:ac:11:00:02,disable-modern=true,mq=on,vectors=18 -rtc base=utc,driftfix=slew -global kvm-pit.lost_tick_policy=discard -vga none -no-user-config -nodefaults -nographic -daemonize -kernel /usr/share/kata-containers/vmlinuz-4.14.51.1-132.container -append tsc=reliable no_timer_check rcupdate.rcu_expedited=1 i8042.direct=1 i8042.dumbkbd=1 i8042.nopnp=1 i8042.noaux=1 noreplace-smp reboot=k console=hvc0 console=hvc1 iommu=off cryptomgr.notests net.ifnames=0 pci=lastbus=0 root=/dev/pmem0p1 rootflags=dax,data=ordered,errors=remount-ro rw rootfstype=ext4 quiet systemd.show_status=false panic=1 initcall_debug nr_cpus=8 ip=::::::3e899cb1a6931e7c1cd83cd7dd837a2ba1726ded789f3bc1c3debdeb3fa37b43::off:: init=/usr/lib/systemd/systemd systemd.unit=kata-containers.target systemd.mask=systemd-networkd.service systemd.mask=systemd-networkd.socket -smp 1,cores=1,threads=1,sockets=1,maxcpus=8
```

## 与 K8S 集成
![](/images/2018-07-20-katacontainer-docker-k8s/katacontainer_arch.png)

实际上，kata 不直接与 k8s 通信，因为对于 k8s 来说，它只跟实现了 CRI 接口的容器管理进程打交道，比如 docker-engine，rkt, containerd(使用 cri plugin) 或 CRI-O，而 kata 跟 runc 是同一个级别的进程。所以如果要与 k8s 集成，则需要安装 CRI-O 或 CRI-containerd 来支持 CRI 接口，本文使用 CRI-O。CRI-O 的 O 的意思是 OCI-compatible，即 CRI-O 是实现 CRI 接口来跑 OCI 容器的。

> [这里](https://www.katacoda.com/courses/kubernetes/getting-started-with-kubeadm-crio) 有关于如何使用 kubeadm 安装使用 CRI-O 的 k8s 集群的教程。而[kubernetes-the-hard-way](https://github.com/kelseyhightower/kubernetes-the-hard-way/blob/master/docs/09-bootstrapping-kubernetes-workers.md)中也是安装的crio

### 安装配置 CRI-O
```shell
# 安装 runc，因为后面我们不用 docker 跟 k8s 通信而是用 cri-o，但为了能够同时支持普通容器和 kata 容器，要单独安装 runc
curl -SLO https://github.com/opencontainers/runc/releases/download/v1.0.0-rc5/runc.amd64
chmod +x runc.amd64
mv runc.amd64 /usr/bin/runc
$ runc -version
runc version 1.0.0-rc5
spec: 1.0.0

# 安装 crictl CLI
curl -SLO https://github.com/kubernetes-sigs/cri-tools/releases/download/v1.12.0/crictl-v1.12.0-linux-amd64.tar.gz
sudo tar -xvf crictl-v1.12.0-linux-amd64.tar.gz -C /usr/local/bin/

# 编译安装 crio，假设你的机器上已经安装了golang
apt-get install -y libglib2.0-dev libseccomp-dev libgpgme11-dev libdevmapper-dev make git
go get -d github.com/kubernetes-sigs/cri-o; pushd $GOPATH/src/github.com/kubernetes-sigs/cri-o
make install.tools && make && make install && make install.config && popd
# 生成默认的配置文件在 /etc/crio/crio.conf

# 配置 crio systemd service
cat <<EOF > /etc/systemd/system/crio.service
[Unit]
Description=OCI-based implementation of Kubernetes Container Runtime Interface
Documentation=https://github.com/kubernetes-sigs/cri-o

[Service]
ExecStart=/usr/local/bin/crio --log-level info
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload; systemctl enable crio; systemctl start crio
export CONTAINER_RUNTIME_ENDPOINT=unix:///var/run/crio/crio.sock
$ crictl version
Version:  0.1.0
RuntimeName:  cri-o
RuntimeVersion:  1.12.0-dev
RuntimeApiVersion:  v1alpha1

# 配置 crio 使用 kata-runtime 作为默认的 untrusted workload
sed -i '/\[crio.runtime\]/ a manage_network_ns_lifecycle = true' /etc/crio/crio.conf
sed -i '/runtime_untrusted_workload =/c runtime_untrusted_workload = "/usr/bin/kata-runtime"' /etc/crio/crio.conf
sed -i '/default_workload_trust =/c default_workload_trust = "trusted"' /etc/crio/crio.conf
sed -i '/#registries =/c registries = ["docker.io"]' /etc/crio/crio.conf

# Build and install CNI plugin，但我们不准备使用默认的这些 CNI plugins，为了支持 Network Policy，我们后面会安装 Calico
sudo mkdir -p \
  /etc/cni/net.d \
  /opt/cni/bin
curl -SLO https://github.com/containernetworking/plugins/releases/download/v0.7.1/cni-plugins-amd64-v0.7.1.tgz
sudo tar -xvf cni-plugins-amd64-v0.7.1.tgz -C /opt/cni/bin/
add-apt-repository -y ppa:projectatomic/ppa && apt-get update && apt-get install -y skopeo-containers; systemctl restart crio
```

### 初始化 K8S 集群

安装 kubelet：
```shell
curl -sSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
add-apt-repository "deb http://apt.kubernetes.io/ kubernetes-xenial main"
apt update; apt install -y kubelet=1.11.1-00 kubectl=1.11.1-00 kubeadm=1.11.1-00
```

现在你已经在 host 上安装了 kubelet(但还没有开始安装整个 k8s 集群)，前几个步骤安装配置了runc和crio，接下来就需要告诉 kubelet 使用 crio (而不是 docker) 创建 pod 中的容器。
```shell
cat <<EOF > /etc/systemd/system/kubelet.service.d/0-crio.conf
[Service]
Environment="KUBELET_EXTRA_ARGS=--container-runtime=remote --runtime-request-timeout=15m --container-runtime-endpoint=unix:///var/run/crio/crio.sock"
EOF
systemctl daemon-reload; systemctl restart kubelet
```

初始化 k8s：
```shell
# kubeadm init 需要的配置文件
cat <<EOF > $HOME/kubeadm.conf
kind: MasterConfiguration
apiVersion: kubeadm.k8s.io/v1alpha2
cloudProvider: openstack
kubernetesVersion: 1.11.1
networking:
  podSubnet: "192.168.0.0/16"
nodeRegistration:
  criSocket: /var/run/crio/crio.sock
EOF

# 因为我的 k8s 依然是在 openstack 环境下安装，所以需要 cloud-provider 配置文件。这个跟 kata 没关系，你可以不使用，但需要删除上面的 cloudProvider 一行配置。
cat <<EOF > /etc/kubernetes/cloud-config
[Global]
auth-url=http://10.52.0.188/identity
user-id=90451993d86643a4a8ead6c67bf301ff
password=password
tenant-id=a8320c07d4b14875aabc40dc6a84f49a
region=RegionOne
[LoadBalancer]
use-octavia=yes
subnet-id=01b65374-f409-49d6-a23e-49f4db182add
create-monitor=no
[BlockStorage]
bs-version=v2
EOF

sed -i -E 's/(.*)KUBELET_KUBECONFIG_ARGS=(.*)$/\1KUBELET_KUBECONFIG_ARGS=--cloud-provider=openstack --cloud-config=\/etc\/kubernetes\/cloud-config \2/' /etc/systemd/system/kubelet.service.d/10-kubeadm.conf
systemctl daemon-reload; systemctl restart kubelet

sed -i '/net.ipv4.ip_forward/c net.ipv4.ip_forward=1' /etc/sysctl.conf
sysctl -p /etc/sysctl.conf
modprobe br_netfilter
kubeadm init --config $HOME/kubeadm.conf
```

`kubeadm init` 命令执行成功后，因为系统中没有配置 CNI plugin 所以你会发现 coredns pod 一直是 pending。下面安装 Calico，Calico 安装完后一定要重启 crio 和 kubelet 服务。此外，目前我们只有一个 master 节点，为了实验目的，我不打算再添加 worker 节点，我们只要允许 master 上可以创建 pod 就行：

```shell
mkdir -p $HOME/.kube; cp -i /etc/kubernetes/admin.conf $HOME/.kube/config; chown $(id -u):$(id -g) $HOME/.kube/config
kubectl taint nodes --all node-role.kubernetes.io/master-
kubectl apply -f https://docs.projectcalico.org/v3.1/getting-started/kubernetes/installation/hosted/rbac-kdd.yaml
kubectl apply -f https://docs.projectcalico.org/v3.1/getting-started/kubernetes/installation/hosted/kubernetes-datastore/calico-networking/1.7/calico.yaml
systemctl restart crio kubelet
```

等待一段时间，直到使用 kubectl 命令查看系统 pod 全部 running：

```shell
$ kubectl get po -n kube-system
NAME                                      READY     STATUS    RESTARTS   AGE
calico-node-rqp6g                         2/2       Running   0          1m
coredns-78fcdf6894-xrll6                  1/1       Running   0          3m
coredns-78fcdf6894-z8lcd                  1/1       Running   0          3m
etcd-kata-k8s-master                      1/1       Running   0          2m
kube-apiserver-kata-k8s-master            1/1       Running   0          2m
kube-controller-manager-kata-k8s-master   1/1       Running   0          3m
kube-proxy-xb5nb                          1/1       Running   0          3m
kube-scheduler-kata-k8s-master            1/1       Running   0          3m
```

可以使用 `crictl` 查看系统创建的容器，因为我们没有用 docker，所以不能用以前常用的 docker 命令了。虽然不能用 docker，但可以使用 `runc` 命令查看容器：

```shell
$ crictl ps
CONTAINER ID        IMAGE                                                                                                        CREATED              STATE               NAME                      ATTEMPT             POD ID
961bb398f3d4d       b3b94275d97cb24e34af9bb70e8582c312596eaa33716b98b46e0dffdab2f6a4                                             11 minutes ago       Running             coredns                   0                   62a610678f121
96a7f0588661b       quay.io/calico/cni@sha256:ed172c28bc193bb09bce6be6ed7dc6bfc85118d55e61d263cee8bbb0fd464a9d                   11 minutes ago       Running             install-cni               0                   b32d4ffdf0f67
c8922a48c5941       quay.io/calico/node@sha256:a35541153f7695b38afada46843c64a2c546548cd8c171f402621736c6cf3f0b                  11 minutes ago       Running             calico-node               0                   b32d4ffdf0f67
7ba37434e8acf       d5c25579d0ff8b97e6330a8c38e144a8516ce65f880623a8bb8019f20f54e428                                             13 minutes ago       Running             kube-proxy                0                   a70811efb4a48
d7b6ba9a11ee6       272b3a60cd68df630383440192659a313582d35d0d615b4fc0afad9650a8612d                                             13 minutes ago       Running             kube-scheduler            0                   e2bd432b5b5e8
c3e6430e73ea8       52096ee87d0e17bb9aec2d4e2be75d614370d9816f0c8f0d6b058ed274686c08                                             13 minutes ago       Running             kube-controller-manager   0                   94370aaba6023
29aac0335a291       816332bd9d1150597e693bfa47af7b4474be6a0d7bc7b33cefca2ae14c59e75c                                             14 minutes ago       Running             kube-apiserver            0                   da4d715e43565
2d8ce3b0b31fe       b8df3b177be232e6de335cd10df2b1c7fb1b3e8e62390e0f25b357b71e97d0fb                                             14 minutes ago       Running             etcd                      0                   bfdd34580c4a9

# 使用 runc 查看容器的输出比较多，这里我们仅关心 runc 看到的容器的个数，以便后续测试对比
$ runc list | wc -l
18
```

因为我们配置 cri 默认使用 runc 创建容器，所以使用 `kata-runtime` 命令应该看不到任何容器：

```shell
$ kata-runtime list
ID          PID         STATUS      BUNDLE      CREATED     OWNER
```

### 测试 pod 操作

为了创建 kata 容器，需要指定 pod 的 annotation： `io.kubernetes.cri-o.TrustedSandbox: "false"`，如果不定义这个 annotation 或配置为 true，则 crio 默认会使用 runc 创建。
```shell
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-kata
  labels:
    app: kata
spec:
  replicas: 2
  selector:
    matchLabels:
      app: kata
  template:
    metadata:
      labels:
        app: kata
      annotations:
        io.kubernetes.cri-o.TrustedSandbox: "false"
    spec:
      containers:
      - name: test-kata
        image: lingxiankong/alpine-test
        ports:
        - containerPort: 8080
---
kind: Service
apiVersion: v1
metadata:
  name: test-kata
spec:
  selector:
    app: kata
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
EOF

# 此时用 kata-runtime 命令可以看到有新容器创建
$ kata-runtime list
ID                                                                 PID         STATUS      BUNDLE                                                                                                                 CREATED                          OWNER
89cd8fe80ed0f1b2835130c56ded6b96f638b50831a481d9c5c0c2ac5b0501d8   26690       running     /run/containers/storage/overlay-containers/89cd8fe80ed0f1b2835130c56ded6b96f638b50831a481d9c5c0c2ac5b0501d8/userdata   2018-10-29T01:50:44.860764783Z   #0
dd66e5d71fdd3bcc0e34ae48694f8ae606118a05517099bd356569ab117ee74c   26928       running     /run/containers/storage/overlay-containers/dd66e5d71fdd3bcc0e34ae48694f8ae606118a05517099bd356569ab117ee74c/userdata   2018-10-29T01:50:51.012103334Z   #0
b24c04b1139bcb4b0c389a4a7962a1dc8f6db58d132cfde4cd8437881093f79f   26677       running     /run/containers/storage/overlay-containers/b24c04b1139bcb4b0c389a4a7962a1dc8f6db58d132cfde4cd8437881093f79f/userdata   2018-10-29T01:50:44.846337433Z   #0
51863e61498b383f4fe2e081252c0bfff6ff66954af368d500654f4b43d8809b   26818       running     /run/containers/storage/overlay-containers/51863e61498b383f4fe2e081252c0bfff6ff66954af368d500654f4b43d8809b/userdata   2018-10-29T01:50:47.861616301Z   #0

# 再次查看 runc 容器的个数，与之前相同，说明新创建的容器并没有使用 runc
$ runc list | wc -l
18

# 直接在 master 节点访问创建的 service，说明使用kata-runtime创建的pod网络是没问题的
$ SVC_IP=$(kubectl get service test-kata --no-headers | awk '{print $3}')
$ curl ${SVC_IP}
test-kata-b45ddf6b-78xvq
$ curl ${SVC_IP}
test-kata-b45ddf6b-dkgv5
```
### 测试 Network Policy

虽然现在已经能够调用 kata 创建 pod，但我最担心的还是 kata 跟网络或存储的集成。所以再测试一下安装 calico 后的 network policy 的功能。

默认情况下，系统中所有 pod 是互通的，所以我们先创建一个普通 pod(使用 runc)，在 pod 里面访问之前创建的 service：

```shell
$ kubectl run http-client --rm -it --restart=Never --image=lingxiankong/http-client /bin/sh
If you don't see a command prompt, try pressing enter.
/# http -b 10.102.46.239
test-kata-b45ddf6b-dkgv5
/# http -b 192.168.0.5:8080
test-kata-b45ddf6b-dkgv5
/# http -b 192.168.0.6:8080
test-kata-b45ddf6b-78xvq
```

其中 `192.168.0.5` 和 `192.168.0.6` 是之前创建的 deployment 中的两个 pod 的 IP 地址。这里虽然我们使用不同的 runtime 创建容器(http-client是runc创建，test-kata是kata-runtime创建)，但默认情况，网络是互通的。

创建 network policy 禁用 pod 之间的网络：

```shell
cat <<EOF | kubectl apply -f -
kind: NetworkPolicy
apiVersion: networking.k8s.io/v1
metadata:
  namespace: default
  name: default-deny
spec:
  podSelector: {}
  policyTypes:
  - Ingress
EOF
```

这时在 http-client pod 里已经不能访问 service 和 pod 了，说明 network policy 生效。再创建一个 network policy 允许 http-client pod 访问：

```shell
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-http-client
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: kata
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          run: http-client
EOF
```

然后你会发现 http-client pod 里又可以成功访问 service 和 pod 了，说明network policy功能也正常。

## 参考文档

- <https://github.com/kata-containers/documentation/blob/master/Developer-Guide.md>
- <https://github.com/kata-containers/documentation/blob/master/architecture.md>
- <https://github.com/kubernetes-incubator/cri-o/blob/master/tutorial.md>