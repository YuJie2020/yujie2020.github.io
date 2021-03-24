---
layout: post
title: OpenStack + K8S 环境集成测试
category: 技术
---

更新历史：

- 2018.02，初稿完成
- 2018.02，添加对 persistent volume 的测试过程以及与 keystone 的集成，修改文件名
- 2018.03，添加 ingress controller 测试说明

## 测试目的

- 验证 k8s 上 LoadBalancer 类型 service 的创建和使用，使用 openstack 作为 cloud provider
- 验证 k8s 上 persistent volume 的创建和使用，使用 openstack 作为 cloud provider
- 验证 k8s 如何与 octavia 服务交互
- 验证 k8s 如何与 cinder 服务交互
- 验证 k8s 如何与 keystone 集成
- 摸索如何在 ubuntu 16.04上启用嵌套虚拟化搭建 devstack
- 练习使用 ansible

## 软件版本
- Host OS: Ubuntu 16.04
- openstack 版本: stable/queens
- kubernetes 版本：v1.9.3

## 测试过程
### 嵌套虚拟化
为什么要用嵌套虚拟化呢？我手头上有一台内存 16G 的 ubuntu 16.04，首先我得搭建一套包含 octavia 服务的 devstack 环境，然后在devstack 里创建两个虚拟机，搭建 k8s 集群。如果不使用嵌套虚拟化，在 devstack 上的 VM 里性能就会很差，动不动就卡死，无法达到测试目的。所以我要解决的第一个问题就是如何启用嵌套虚拟化。

首先查看系统是否支持 nested virtualization：
```shell
egrep -c '(svm|vmx)' /proc/cpuinfo
8
```
如果返回0，则说明不支持，就不要往下看了，洗洗睡吧。如果支持的话，就准备创建 vm 吧。那怎么创建 vm 才能让 vm 使用 host 的 cpu 特性呢？因为我经常使用 vagrant + virtualbox，于是就查找文档，发现 virtualbox 压根就不支持 nested virtualization。退而求其次，那就直接使用 libvirt 吧。网上有很多文章介绍如何使用 virt-install 或者 virt-manager 创建 host-passthrough cpu 特性的 vm，但可能是我对 libvirt 的相关工具不熟，挣扎了一些时间无果，这里仅仅记录一下我的捣鼓过程，如果有熟悉的朋友可以留言赐教。
```shell
# 首先安装相关的工具包
sudo apt-get install -y qemu-kvm libvirt-bin virtinst bridge-utils cpu-checker libosinfo-bin libguestfs-tools virt-top
# 安装完可以在 check 一下
$ kvm-ok
INFO: /dev/kvm exists
KVM acceleration can be used
# 查看网桥
sudo virsh net-list --all
# 如果显示 default 是 inactive，
virsh net-start default
# 创建 vm，这个命令没问题，但到最后发现登陆不进系统，因为不知道 ubuntu 用户的密码。于是我又尝试直接使用 iso，手动执行操作系统安装过程，因为能自定义密码嘛，我能够在 virt-manager 里看到操作系统的安装过程，但系统安装完后重启后总是卡住……
virt-install --virt-type=kvm \
    --os-type linux \
    --name=devstack \
    --ram=8192 \
    --vcpus=4 \
    --network network=default,model=virtio \
    --disk path=/var/lib/libvirt/images/devstack.img,size=20,bus=virtio,format=qcow2 \
    --location 'http://jp.archive.ubuntu.com/ubuntu/dists/xenial/main/installer-amd64/' \
    --os-variant=ubuntu16.04 \
    --hvm \
    --graphics none \
    --console pty,target_type=serial \
    --extra-args "console=ttyS0,115200n8 serial"
# 正常情况下，如果 vm 创建成功，就可以编辑 vm 的定义，修改 cpu 的 host-passthrough 属性
virsh edit devstack
# 删除 vm
virsh destroy devstack && virsh undefine devstack --remove-all-storage
```

上一条路没走通，继续 google，结果发现其实 vagrant 支持 [libvirt provider](https://github.com/vagrant-libvirt/vagrant-libvirt)(真是越来越喜欢 provider 这个概念了)，并且在定义 vm 时可以设置使用嵌套虚拟化。
```shell
# 安装 libvirt provider
vagrant plugin install vagrant-libvirt
# 在 Vagrant 文件中定义
Vagrant.configure("2") do |config|
  config.vm.box = "generic/ubuntu1604"
  config.vm.provider :libvirt do |libvirt|
    libvirt.nested = true
    libvirt.cpu_mode = "host-passthrough"
    libvirt.memory = 8192
    libvirt.cpus = 4
  end
end
# 启动 vm
vagrant up --provider=libvirt
```

### 搭建 devstack
有了干净的 vm，安装 devstack 应该不是什么难事儿，但中间我还是碰到了一些问题(可能跟使用 libvirt 的 ubuntu 镜像有关系)，这里把过程记录一下：
```shell
# 首先要设置ipv6的一些特性，否则 neutron 创建ipv6网络时会出错
$ cat /etc/sysctl.conf
net.ipv6.conf.all.disable_ipv6 = 0
net.ipv6.conf.default.disable_ipv6 = 0
net.ipv6.conf.lo.disable_ipv6 = 0
$ sysctl -p
# clone devstack repo
$ git clone https://git.openstack.org/openstack-dev/devstack
$ sudo mkdir -p /opt/stack && sudo chown -R vagrant.vagrant /opt/stack && cd ~/devstack
# 然后到了 neutron 为 demo 用户创建网络资源时又会出错，解决方法还是重启服务，但不像 glance-api，devstack 在执行过程中没有给我们重启 neutron 服务的机会，所以这里要改 devstack 的脚本，改完再重新执行 stack.sh
$ git diff lib/neutron_plugins/services/l3
diff --git a/lib/neutron_plugins/services/l3 b/lib/neutron_plugins/services/l3
index 41a467d..3192624 100644
--- a/lib/neutron_plugins/services/l3
+++ b/lib/neutron_plugins/services/l3
@@ -158,6 +158,7 @@ function _neutron_get_ext_gw_interface {
 }

 function create_neutron_initial_network {
+    sudo systemctl restart devstack@q-svc.service
     local project_id
     project_id=$(openstack project list | grep " demo " | get_field 1)
     die_if_not_set $LINENO project_id "Failure retrieving project_id for demo"
# 执行 stack.sh
curl -sS https://gist.githubusercontent.com/LingxianKong/3728526c8df9ecba0106f713fbe50c38/raw/0efb8c9c3fd989210e674ad4de609f7b75033153/k8s_openstack.ini -o ~/devstack/local.conf
sed -i "/HOST_IP=/d"  ~/devstack/local.conf
sed -i "/MULTI_HOST/d"  ~/devstack/local.conf
./stack.sh
# 执行过程中我就总碰到 glance-api 服务没响应，这时再开一个窗口重启 glance-api 服务，devstack 就能继续执行：
sudo systemctl restart devstack@g-api.service
```

### 安装 k8s
现在有了一个 openstack 环境，接下了为 demo 用户创建一些资源，为安装 k8s 做准备：
```shell
cat << EOF >> ~/.bashrc
alias source_adm="cd ~/devstack; source openrc admin admin; cd -"
alias source_demo="cd ~/devstack; source openrc demo demo; cd -"
alias source_altdemo="cd ~/devstack; source openrc alt_demo alt_demo; cd -"
alias os="openstack"
alias ll='ls -l'
EOF

cat << EOF > pre.sh
set -e
pushd /home/vagrant/devstack
# 创建一个新的 flavor
source openrc admin admin
openstack flavor create --id 6 --ram 2048 --disk 7 --vcpus 1 --public k8s
# 创建 keypair 和设置必要的安全组规则
source openrc demo demo
ssh-keygen -t rsa -b 4096 -N "" -f ~/.ssh/id_rsa
openstack keypair create --public-key ~/.ssh/id_rsa.pub testkey
openstack security group rule create --proto icmp default
openstack security group rule create --protocol tcp --dst-port 22 default
# 注册 ubuntu 16.04 镜像
source openrc admin admin
curl -SO http://cloud-images.ubuntu.com/xenial/current/xenial-server-cloudimg-amd64-disk1.img
glance image-create --name ubuntu-xenial \
            --visibility public \
            --container-format bare \
            --disk-format qcow2 \
            --file xenial-server-cloudimg-amd64-disk1.img
rm -f xenial-server-cloudimg-amd64-disk1.img
popd
EOF

$ bash pre.sh
```

资源准备就绪，接下来安装 k8s，我还是使用 kubeadm 工具。但这次与以前不同，在运行 `kubeadm init` 时要用配置文件的方式，因为不能通过命令行指定 cloud provider 参数。另外，还要对 cloud provider 做一些配置，所以我修改了之前安装 k8s 的 ansible 脚本，新增了针对 openstack 作为 cloud provider 的[新版本](https://github.com/LingxianKong/kubernetes_study/tree/master/installation/ansible/version_3)，并调试通过。

```bash
git clone https://github.com/LingxianKong/kubernetes_study.git
pushd ~/kubernetes_study/installation/ansible/version_3/
sudo pip install ansible shade
pushd ~/devstack && source openrc demo demo && popd
image=$(openstack image list --name ubuntu-xenial -c ID -f value)
network=$(openstack network list --name private -c ID -f value)
subnet_id=$(openstack subnet list --network private -c ID -f value)
auth_url=$(export | grep OS_AUTH_URL | awk -F '"' '{print $2}')
pushd ~/devstack && source openrc admin admin && popd
user_id=$(openstack user show demo -c id -f value)
tenant_id=$(openstack project show demo -c id -f value)
# 我这里直接把变量写死
cat << EOF > roles/kube_master/defaults/main.yml
auth_url: $auth_url
user_id: $user_id
password: password
tenant_id: $tenant_id
region: RegionOne
subnet_id: $subnet_id
EOF
cp roles/kube_master/defaults/main.yml roles/kube_node/defaults/main.yml

pushd ~/devstack && source openrc demo demo && popd
ansible-playbook site.yml -e "rebuild=false flavor=6 image=$image network=$network key_name=testkey private_key=/home/vagrant/.ssh/id_rsa node_prefix=test"
popd
```

### 验证 Service

默认安装完 k8s，demo 用户已经有两个虚拟机，并且都绑定了 floatingip：

```shell
$ nova list
+--------------------------------------+---------------------+--------+------------+-------------+---------------------------------------------------------------------+
| ID                                   | Name                | Status | Task State | Power State | Networks                                                            |
+--------------------------------------+---------------------+--------+------------+-------------+---------------------------------------------------------------------+
| 0a361306-3fe8-49ee-a01c-df3f83214d9b | lingxian-k8s-master | ACTIVE | -          | Running     | private=10.0.0.6, fde4:e5dd:724e:0:f816:3eff:fed6:2607, 172.24.4.12 |
| d4d6b3b9-e37d-4510-b2f2-d8781eaf296c | lingxian-k8s-node1  | ACTIVE | -          | Running     | private=10.0.0.10, fde4:e5dd:724e:0:f816:3eff:fe12:5bd1, 172.24.4.8 |
+--------------------------------------+---------------------+--------+------------+-------------+---------------------------------------------------------------------+
```

因为之前已经设置好了安全组规则，所以可以直接登录 master 节点：

```shell
devstack$ ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -i /home/vagrant/.ssh/id_rsa ubuntu@172.24.4.12
ubuntu@lingxian-k8s-master:~# export PS1='\[\033[1;34m\]k8stest\[\033[00m\]\\$ '
# 看一眼 openstack 的配置
k8stest$ cat /etc/kubernetes/cloud-config
[Global]
auth-url=http://192.168.121.15/identity/v3/
user-id=3fd32295751a41aca601021eba681a29
password=password
tenant-id=84ce53873abe4d22a6f2491879e76048
region=RegionOne
[LoadBalancer]
use-octavia=yes
subnet-id=1740cd57-62ab-4f7f-a853-2038561060d1
create-monitor=no
[BlockStorage]
bs-version=v2
# 看一眼system pod 是否都正常
k8stest$ kprompt
kube-prompt v1.0.3 (rev-ba1a338)
>>> get pod --all-namespaces
NAMESPACE     NAME                                          READY     STATUS    RESTARTS   AGE
kube-system   calico-etcd-2pvw7                             1/1       Running   0          11h
kube-system   calico-kube-controllers-d554689d5-2d6vh       1/1       Running   0          11h
kube-system   calico-node-6pqbg                             2/2       Running   0          11h
kube-system   calico-node-fgc7d                             2/2       Running   0          11h
kube-system   etcd-lingxian-k8s-master                      1/1       Running   0          11h
kube-system   kube-apiserver-lingxian-k8s-master            1/1       Running   0          11h
kube-system   kube-controller-manager-lingxian-k8s-master   1/1       Running   0          11h
kube-system   kube-dns-6f4fd4bdf-w2888                      3/3       Running   0          11h
kube-system   kube-proxy-dkbnj                              1/1       Running   0          11h
kube-system   kube-proxy-zp7jk                              1/1       Running   0          11h
kube-system   kube-scheduler-lingxian-k8s-master            1/1       Running   0          11h
# 创建 service
>>> run mytest --image=lingxiankong/alpine-test --labels="name=test"
deployment "mytest" created
>>> expose deployment mytest --type="LoadBalancer" --port 8080
service "mytest" exposed
>>> get services
NAME         TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
kubernetes   ClusterIP      10.96.0.1       <none>        443/TCP          11h
mytest       LoadBalancer   10.111.153.27   172.24.4.9    8080:31320/TCP   1m
```

service 创建成功。到 openstack 环境里看看 k8s 都创建了哪些资源。

```shell
$ source_demo
# 首先，k8s 在 demo 租户里创建了 lb，对外暴露的 port 是8080，也就是 k8s service 的 port
$ os loadbalancer list
+--------------------------------------+----------------------------------+----------------------------------+-------------+---------------------+----------+
| id                                   | name                             | project_id                       | vip_address | provisioning_status | provider |
+--------------------------------------+----------------------------------+----------------------------------+-------------+---------------------+----------+
| 25e9a638-f172-4a78-ae6c-62b1fe397d05 | a1310ac8d181b11e8a40ffa163ed6260 | 84ce53873abe4d22a6f2491879e76048 | 10.0.0.9    | ACTIVE              | octavia  |
+--------------------------------------+----------------------------------+----------------------------------+-------------+---------------------+----------+
$ os loadbalancer listener list
+--------------------------------------+--------------------------------------+---------------------------------------------+----------------------------------+----------+---------------+----------------+
| id                                   | default_pool_id                      | name                                        | project_id                       | protocol | protocol_port | admin_state_up |
+--------------------------------------+--------------------------------------+---------------------------------------------+----------------------------------+----------+---------------+----------------+
| 878c59a6-4ae6-4c5c-976b-d4720e908836 | 3ba4afaa-ed4f-4351-a586-5341a6954801 | listener_a1310ac8d181b11e8a40ffa163ed6260_0 | 84ce53873abe4d22a6f2491879e76048 | TCP      |          8080 | True           |
+--------------------------------------+--------------------------------------+---------------------------------------------+----------------------------------+----------+---------------+----------------+
$ os loadbalancer pool list
+--------------------------------------+-----------------------------------------+----------------------------------+---------------------+----------+--------------+----------------+
| id                                   | name                                    | project_id                       | provisioning_status | protocol | lb_algorithm | admin_state_up |
+--------------------------------------+-----------------------------------------+----------------------------------+---------------------+----------+--------------+----------------+
| 3ba4afaa-ed4f-4351-a586-5341a6954801 | pool_a1310ac8d181b11e8a40ffa163ed6260_0 | 84ce53873abe4d22a6f2491879e76048 | ACTIVE              | TCP      | ROUND_ROBIN  | True           |
+--------------------------------------+-----------------------------------------+----------------------------------+---------------------+----------+--------------+----------------+
# lb 的 member 是 node 节点，port 就是 k8s 为 node 节点创建的 NodePort 31320
$ os loadbalancer member list 3ba4afaa-ed4f-4351-a586-5341a6954801
+--------------------------------------+------+----------------------------------+---------------------+-----------+---------------+------------------+--------+
| id                                   | name | project_id                       | provisioning_status | address   | protocol_port | operating_status | weight |
+--------------------------------------+------+----------------------------------+---------------------+-----------+---------------+------------------+--------+
| c543804b-acb9-43c9-9258-4b028650f534 |      | 84ce53873abe4d22a6f2491879e76048 | ACTIVE              | 10.0.0.10 |         31320 | NO_MONITOR       |      1 |
+--------------------------------------+------+----------------------------------+---------------------+-----------+---------------+------------------+--------+
# 其次，k8s 自动为 vip 绑定了 floatingip，方便用户从 openstack 外部访问
$ neutron floatingip-list
+--------------------------------------+------------------+---------------------+--------------------------------------+
| id                                   | fixed_ip_address | floating_ip_address | port_id                              |
+--------------------------------------+------------------+---------------------+--------------------------------------+
| caf39874-b44c-4e05-9b7d-d07b1dcfff3e | 10.0.0.9         | 172.24.4.9          | bc4b5499-907a-4e01-b024-3e12d7b5edaf |
+--------------------------------------+------------------+---------------------+--------------------------------------+
# 尝试访问 service
$ curl http://172.24.4.9:8080
^C
```

不能访问 service！我的第一个反应是怀疑安全组规则没有设置好，梳理了一下数据包路径，唯一可疑的就是 k8s node 节点上的 31320 端口。找到 node 节点的 port 并查看安全组规则：

```shell
$ neutron port-list -c id -- --device-id d4d6b3b9-e37d-4510-b2f2-d8781eaf296c
+--------------------------------------+
| id                                   |
+--------------------------------------+
| a81de271-b424-45e4-ae7e-1a73724ee9e3 |
+--------------------------------------+
$ neutron port-show a81de271-b424-45e4-ae7e-1a73724ee9e3 -c security_groups
+-----------------+--------------------------------------+
| Field           | Value                                |
+-----------------+--------------------------------------+
| security_groups | bb5969cb-40a6-43a5-aeae-4968e50f77c8 |
+-----------------+--------------------------------------+
$ neutron security-group-show bb5969cb-40a6-43a5-aeae-4968e50f77c8
```

为了节省篇幅我就不贴具体的安全组规则了，但确实没看到有规则允许 31320 端口的数据通过，这是 k8s 的问题么？带着问题阅读了 k8s 的代码，发现 k8s 的 openstack cloud provider 提供了一个配置项 `manage-security-groups`，当配置为 true 时才会设置必要的安全组规则。于是修改配置，重启 controller-manager 服务，再次创建 service，发现 service 一直处于 pending 状态，查看 controller-manager 服务日志，创建 lb 的过程一直卡在 `error occurred finding security group…` 处，在经过代码走读，最终发现了代码 bug，原来是 k8s 要为 vip port 创建一个新的安全组规则时一个逻辑判断错误。可喜的是，k8s 社区在几天前刚刚修复了这个 bug，可悲的是，目前尚没有可用的 k8s 版本可用，只能期待 v1.10.0版本发布。

> 在 Magnum 中，默认会为所有的 node 节点创建安全组规则，允许 k8s 保留的 nodeport 范围(默认是30000-32767)的数据包通过，也算是一种解决方案。

在研究 lb 类型的 service 时，突然被问到一个问题，因为 octavia 会为每一个 lb 类型的 service 创建两个 VM(master/slave)和一个 floating ip，这对于用户来说有些 overkill 了，因为一个 lb 的费用并不便宜，毕竟占用了两个 VM 的钱，能不能复用一个 lb，而为每个 service 创建 listener 呢？最初乍听到这个问题，我自己也懵了，答不上来。但稍微细想一下，因为 service 是 k8s 的用户创建的，可能不同的用户开发了不同的 web 应用，都对外暴露80端口，如果复用 lb，他们得到的地址就一样了。

之前在团队内部为了解释 lb 类型的 service 实现，曾画过一张图可以便于理解：
![](/images/2018-02-23-openstack-k8s-integration/loadbalancer-type-service-octavia.png)

k8s 文档中还有一种访问 service 的方式：Ingress，通过 Ingress 用户可以实现使用 nginx 等开源的反向代理负载均衡器实现对外暴露服务，其实就是把传统的方式在 k8s 中做了抽象，而且这种方式比 LB 类型的 service 更强大(比如支持 URL mapping, TLS termination，7层负载均衡等高级特性)，在 GKE 中，使用 ingress 也是推荐的[方式](https://cloud.google.com/kubernetes-engine/docs/tutorials/http-balancer)，于是我也试验了一把使用 ingress controller 的方式访问 service。

### 验证 Ingress Controller

> 使用 ingress controller 与本篇要讲的与 openstack 集成没有关系，只是顺带稍作记录。

使用 ingress 会涉及三个组件：

- 反向代理负载均衡器(比如老牌的 nginx)，也是真正干活的。可以创建deployment通过 service 暴露，也可以作为 deamonset 部署到每个 node 使用 host 网络(`hostNetwork: true`)。使用 deployment 的方式可以实现ingress 服务的高可用，使用 daemonset 的方式可以直接通过 node 的 ip 访问，各有千秋
- Ingress Controller服务，负责watch service 的 CRUD，生成/更新负载均衡器的配置
- 设置Ingress规则，用户设置转发规则

我测试使用的就是 nginx ingress controller，[这里](https://github.com/LingxianKong/kubernetes_study/blob/master/test/ingress_test_setup_nginx.sh)是安装脚本，里面有安装测试步骤说明。在实际使用时，所有的配置操作都由用户自己完成，不需要k8s 集群服务的 provider(云厂商) 介入。换言之，使用 nginx ingress controller，用户仅需要创建一个 lb 类型的 service 就可以为不同的内部 service 配置公网访问地址，这比与 ocavia 集成的 lb 类型的 service 要经济便捷的多，而且功能上更加强大，将来肯定是主流的使用方式。

### 验证 Persistent Volume

k8s 为了方便用户使用后端存储，提供了 Dynamic Provisioning 功能，即管理员创建好默认的 StorageClass，如果用户创建 pvc 时不指定 `storageClassName`，则 k8s 使用默认的 StorageClass 创建 pv 并绑定到用户的 pvc，测试过程如下：

```bash
# 管理员为 k8s 集群创建默认的StorageClass，使用 cinder provider
cat <<EOF | kubectl create -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: cinder-standard
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
    kubernetes.io/description: "Use OpenStack Cinder as default storage backend"
  labels:
    kubernetes.io/cluster-service: "true"
    addonmanager.kubernetes.io/mode: EnsureExists
provisioner: kubernetes.io/cinder
reclaimPolicy: Delete
parameters:
  type: lvmdriver-1
  availability: nova 
  fstype: ext4
EOF

# 然后用户申请 pvc，用户不需要指定 storageClassName
cat <<EOF | kubectl create -f -
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: cinder-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
EOF

$ kubectl get pvc
NAME         STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS      AGE
cinder-pvc   Bound     pvc-f15b9966-1a88-11e8-8159-fa163efef722   1Gi        RWO            cinder-standard   8s

# 到 openstack 里验证 volume
$ cinder list
+--------------------------------------+-----------+-------------------------------------------------------------+------+-------------+----------+-------------+
| ID                                   | Status    | Name                                                        | Size | Volume Type | Bootable | Attached to |
+--------------------------------------+-----------+-------------------------------------------------------------+------+-------------+----------+-------------+
| 2c91341f-cdb5-4f84-9f2f-8be18ada69da | available | kubernetes-dynamic-pvc-f15b9966-1a88-11e8-8159-fa163efef722 | 1    | lvmdriver-1 | false    |             |
+--------------------------------------+-----------+-------------------------------------------------------------+------+-------------+----------+-------------+

# 用户创建 pod，挂载 pvc
cat << EOF | kubectl create -f -
kind: Pod
apiVersion: v1
metadata:
  name: pod-cinder
spec:
  volumes:
    - name: cinder-storage
      persistentVolumeClaim:
       claimName: cinder-pvc
  containers:
    - name: cinder-storage-container
      image: lingxiankong/alpine-test
      ports:
        - containerPort: 8080
          name: "http-server"
      volumeMounts:
        - mountPath: "/data"
          name: cinder-storage
EOF

# 再看一眼 cinder 里 volume 的状态，volume 已经挂载到 pod 所在的 node 节点了
$ cinder list
+--------------------------------------+--------+-------------------------------------------------------------+------+-------------+----------+--------------------------------------+
| ID                                   | Status | Name                                                        | Size | Volume Type | Bootable | Attached to                          |
+--------------------------------------+--------+-------------------------------------------------------------+------+-------------+----------+--------------------------------------+
| 2c91341f-cdb5-4f84-9f2f-8be18ada69da | in-use | kubernetes-dynamic-pvc-f15b9966-1a88-11e8-8159-fa163efef722 | 1    | lvmdriver-1 | false    | d4d6b3b9-e37d-4510-b2f2-d8781eaf296c |
+--------------------------------------+--------+-------------------------------------------------------------+------+-------------+----------+--------------------------------------+
# 登录 pod 看看目录在不在，尝试创建一个文件
$ kubectl exec pod-cinder -it -- bash
bash-4.4# ls /data
lost+found
bash-4.4# echo 'Hello, k8s!' > /data/hello.txt
bash-4.4# ls /data
hello.txt   lost+found
# 登录到 node 节点，可以看到 k8s 已经自动初始化好 volume 的文件系统，进入挂载的 volume，验证文件是否存在
$ ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -i /home/vagrant/.ssh/id_rsa ubuntu@172.24.4.7
$ sudo lsblk
NAME   MAJ:MIN RM SIZE RO TYPE MOUNTPOINT
vda    253:0    0   7G  0 disk
└─vda1 253:1    0   7G  0 part /
vdb    253:16   0   1G  0 disk /var/lib/kubelet/pods/67a8d9e6-1a8a-11e8-8159-fa163efef722/volumes/kubernetes.io~cinder/pvc-f15b9966-1a88-11e8-8159-fa163efef722
$ sudo ls -l /var/lib/kubelet/pods/67a8d9e6-1a8a-11e8-8159-fa163efef722/volumes/kubernetes.io~cinder/pvc-f15b9966-1a88-11e8-8159-fa163efef722
total 20
-rw-r--r-- 1 root root    12 Feb 26 00:21 hello.txt
drwx------ 2 root root 16384 Feb 26 00:17 lost+found
$ sudo cat /var/lib/kubelet/pods/67a8d9e6-1a8a-11e8-8159-fa163efef722/volumes/kubernetes.io~cinder/pvc-f15b9966-1a88-11e8-8159-fa163efef722/hello.txt
Hello, k8s!
```

### 验证 k8s 与 Keystone 的集成

k8s 默认是没有用户管理的概念的，即 k8s 中没有存储用户的信息，要么依赖 k8s 配置的静态文件、token、证书等形式，要么依赖于第三方认证服务，既然我们将 k8s 与 openstack 集成，那自然就用 keystone 服务为 k8s 集群提供 authentication and authorization，其实就是满足两点：

1. kubectl 或对 api server 请求中能够提供openstack 的用户信息(比如 token)；
2. k8s api server 要能够对 token 向 keystone 请求认证，或者用户在 keystone 中信息，进而对用户操作进行鉴权

#### kubectl

从 kubectl 1.8之后，默认就支持与 keystone 的集成，所以 kubectl 的问题不大，几个命令就搞定了：

```bash
# 普通用户通过执行如下命令使用自己 keystone 的身份
kubectl config set-credentials openstackuser --auth-provider=openstack
kubectl config set-context --cluster=kubernetes --user=openstackuser openstackuser@kubernetes
kubectl config use-context openstackuser@kubernetes
# 如果想回到 admin，把 context 切换回去即可
kubectl config use-context kubernetes-admin@kubernetes
```

然后就可以 source 你的 rc 文件，使用 kubectl 命令时，kubectl 会到 keystone 获取 token，然后携带 token 向 api server 发请求。一个 rc 文件模板(因为 kubectl 可能只支持老版本的环境变量，所以尽可能提供足够多的环境变量信息，比如 kubectl 不支持 `OS_PROJECT_NAME` 变量)：

```bash
export OS_AUTH_URL="http://10.0.19.138/identity/v3"
export OS_PROJECT_NAME="demo"
export OS_TENANT_NAME="demo"
export OS_USERNAME="demo"
export OS_PASSWORD="password"
export OS_REGION_NAME="RegionOne"
export OS_DOMAIN_NAME="default"
export OS_IDENTITY_API_VERSION="3"
```

当然，你可以先获取你在 openstack 中的 token，然后直接指定 token 发送请求：

```bash
# 使用 kubectl
kubectl get pod --token=$token
# 使用 http
http --verify=no GET https://10.0.19.122:6443/api/v1/namespaces/default/pods Authorization:"Bearer $token"
```

#### api-server

k8s api server 可以使用 [Webhook Token Authentication](https://kubernetes.io/docs/admin/authentication/#webhook-token-authentication) 校验 bearer token。这需要管理员部署一个独立的服务响应 api server 的请求，验证 token 后返回验证结果，在 api server 参数中指定 `--authentication-token-webhook-config-file=<webhook-config>` 与该服务通信。我已经创建了一个 docker image 用于启动一个这样的代理服务：`lingxiankong/k8s-keystone-auth:0.0.1`，在 k8s master 节点上：

```bash
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
      image: lingxiankong/k8s-keystone-auth:0.0.3
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
        - http://192.168.121.145/identity/v3
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

sed -i '/image:/ i \ \ \ \ - --authentication-token-webhook-config-file=/etc/kubernetes/pki/webhookconfig.yaml' /etc/kubernetes/manifests/kube-apiserver.yaml
```

等待 api server 服务重启成功后就可以尝试跟 k8s 交互：

```bash
kubectl config use-context openstackuser@kubernetes
source openrc
$ kubectl get pods
Error from server (Forbidden): pods is forbidden: User "demo" cannot list pods in the namespace "default"
```

因为我们只配置了 authentication，并没有 authorization，所以默认还是使用 k8s 的 RBAC，为了测试，我们只需为用户创建 rolebinding：

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
  name: read-pods
  namespace: default
subjects:
- kind: User
  name: demo
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
EOF

$ kubectl get pods
No resources found.
```

当然，生产环境中不可能为每一个用户都创建 rolebinding，更合适的做法是使用 project id 作为 group，管理员为 group 配置 rolebinding，这样租户内的用户都具有访问权限。

除了 RBAC 的鉴权方式，authorization 也支持插件化，可以配置 `--authorization-mode=Webhook` 由第三方进行鉴权。使用场景是：用户的配置管理以 keystone 为准，openstack 管理员为用户配置一些访问 k8s 专用的 role，比如 k8s-member，k8s-viewer，k8s-editor 等，在 authentication 后可以得到用户的 role，接着由 k8s-keystone-auth 服务进行鉴权。

## 遇到的坑

- 推荐使用 vagrant libvirt provider 使用嵌套虚拟化，别费劲研究 virt-install 那些参数了
- 在 devstack 环境创建 k8s 节点时，虚拟机名称要满足 k8s 的命名规范，不能包含下划线，否则 kubelet 服务会启动失败
- ansible 的 template 中的变量命名不能包含中划线，否则会解析失败
- 安装 devstack 和使用 ansible 过程中的坑就更多了，精华都在我的 github 里
- k8s repo 中的 openstack cloud provider，可能真正用的人并不多，否则我碰到的那些 bug 不至于刚刚才被修复。但好在至少还有人在修复，也省去了我们许多麻烦，看，这就是我一直说的开源的好处，有 bug 不怕，怕的是有 bug 没人 fix，如果什么 bug 都需要自己公司出人出力，那使用开源的优势就不复存在了
- kubectl 不支持 `OS_PROJECT_NAME` 环境变量
