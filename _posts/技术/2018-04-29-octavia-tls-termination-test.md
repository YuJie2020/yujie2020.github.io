---
layout: post
title: OpenStack Octavia 中 TLS termination 功能测试
category: 技术
---

## 什么是 TLS termination
关于 TLS termination 的具体实现原理可以自行 google，我自己也讲不清楚。但简单地说，TLS termination 通常用于负载均衡器中对 https 协议的处理。为什么要单单为 https 做处理呢？https相比与http多了安全支持，其中最关键的步骤就是建立server和client的SSL安全连接通道。HTTP使用 TCP 三次握手建立连接，客户端和服务器需要交换3个包，HTTPS除了 TCP 的三个包，还要加上 ssl 握手需要的9个包，所以一共是12个包。网上有人对 HTTP 建立连接做过测试，在该测试中是114毫秒；而HTTPS建立连接，需要耗费436毫秒，光ssl 部分就要花费322毫秒。如果在服务端处理 https，那么对于有高并发压力的服务端来说会不堪重负。在实际使用中，一般都会把服务端放在负载均衡器后面，所以很多现代四层/七层负载均衡器都提供了 SSL/TLS termination 的能力，将建立 https 连接最耗时的部分承接过来，让服务端专心做自己该做的事。

但最开始时服务端处理 SSL 是有限制的。根据HTTPS的工作原理，浏览器在访问一个HTTPS站点时，先与服务器建立SSL连接，建立连接的第一步就是请求服务器的证书。而服务器在发送证书的时候，是不知道浏览器访问的是哪个域名的，所以不能根据不同域名发送不同的证书，这样就导致一个 IP 只能对应一个服务端域名，这个限制从虚拟主机开始流行的时候就不能接受了。解决的方式有多种，比如使用通配符域名证书，或者有新的域名加入时重新生成证书，但都不够灵活，所以才出现了 SNI(Server Name Indication)，要求客户端连接到服务器建立SSL链接之前先发送要访问站点的域名（hostname），这样服务器根据这个域名返回一个合适的证书。

## Octavia 中对 TLS termination 的支持
octavia 作为 openstack 中的 loadbalancer as a service，自然也支持 TLS termination。在 octavia 中，TLS termination 是在创建 listener 资源时指定的，这样 listener 的 pool 中的服务只用提供 http 服务即可。

## 测试准备

- 部署 octavia 的同时还要部署 barbican。barbican 做证书管理，存储证书数据，octavia 要从 barbican 中读取证书。
- 准备服务端证书。因为 TLS termination 要求原本应该在服务端配置的证书，现在要配置在 loadbalancer 上，所以如论如何都要提供证书。证书一般包含三个文件，比如 server.crt，server.key，ca-chain.crt，前两个比较好理解，说就是证书和密钥，后面可以理解成 CA 证书或者是被 CA 信任的子 CA 的证书。如果使用自签名证书，那么 server.crt 和 ca-chain.crt 可以是同一个文件。同时，octavia 已经支持 SNI(Server Name Indication)，即可以在 loadbalancer 中配置多个服务端的证书，多个服务端对外使用同一个 vip 地址。
- 模拟 web server。可以创建一个虚拟机，在80提供 http 服务。其实更真实的测试场景是，在 vm 中使用类似于Nginx软件配置不同的`server_name`，在不同的主机域名提供不同的服务。但本文为了简单，没有在 vm 里做进一步配置。

我使用 devstack 部署 openstack，那么添加 barbican 的支持就很简单了：
```
enable_plugin barbican https://git.openstack.org/openstack/barbican
```

因为要测试 SNI，所以我准备了两份证书，如下是生成两份证书的脚本：
```bash
#!/bin/sh

DOMAIN1=www.server1.com
DOMAIN2=www.server2.com

echo "Create CA cert(self-signed) and key..."
CA_SUBJECT="/C=NZ/ST=Wellington/L=Wellington/O=Catalyst/OU=Lingxian/CN=CA"
openssl req -new -x509 -nodes -days 3650 -newkey rsa:2048 -keyout ca.key -out ca.crt -subj $CA_SUBJECT

openssl genrsa -des3 -out $DOMAIN1_encrypted.key 1024
openssl rsa -in $DOMAIN1_encrypted.key -out $DOMAIN1.key
openssl genrsa -des3 -out $DOMAIN2_encrypted.key 1024
openssl rsa -in $DOMAIN2_encrypted.key -out $DOMAIN2.key

echo "Create server certificate signing request..."
SUBJECT="/C=NZ/ST=Wellington/L=Wellington/O=Catalyst/OU=Lingxian/CN=$DOMAIN1"
openssl req -new -nodes -subj $SUBJECT -key $DOMAIN1.key -out $DOMAIN1.csr
SUBJECT="/C=NZ/ST=Wellington/L=Wellington/O=Catalyst/OU=Lingxian/CN=$DOMAIN2"
openssl req -new -nodes -subj $SUBJECT -key $DOMAIN2.key -out $DOMAIN2.csr

echo "Sign SSL certificate..."
openssl x509 -req -days 3650 -in $DOMAIN1.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out $DOMAIN1.crt
openssl x509 -req -days 3650 -in $DOMAIN2.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out $DOMAIN2.crt

echo "Succeed!"
```

执行脚本(中间会被要求输入6次密码，可以输入相同的内容，比如1234)后，在当前目录下应该能看到如下几个文件：
```bash
root@test:~# ll
-rw-r--r--  1 root root     1326 Apr 28 12:22 ca.crt
-rw-r--r--  1 root root     1704 Apr 28 12:22 ca.key
-rw-r--r--  1 root root     1038 Apr 28 12:22 www.server1.com.crt
-rw-r--r--  1 root root      672 Apr 28 12:22 www.server1.com.csr
-rw-r--r--  1 root root      891 Apr 28 12:22 www.server1.com.key
-rw-r--r--  1 root root     1038 Apr 28 12:22 www.server2.com.crt
-rw-r--r--  1 root root      672 Apr 28 12:22 www.server2.com.csr
-rw-r--r--  1 root root      887 Apr 28 12:22 www.server2.com.key
```

因为在 barbican 中创建 secret 时要求是 PKCS12 格式，所以将 server1 和 server2 的 cert/key/intermediates 文件合并：

```bash
openssl pkcs12 -export -inkey www.server1.com.key -in www.server1.com.crt -certfile ca.crt -passout pass: -out www.server1.com.p12
openssl pkcs12 -export -inkey www.server2.com.key -in www.server2.com.crt -certfile ca.crt -passout pass: -out www.server2.com.p12
```

最终的文件如下：

```bash
root@test:~# ll
-rw-r--r--  1 root root     1326 Apr 28 12:22 ca.crt
-rw-r--r--  1 root root     1704 Apr 28 12:22 ca.key
-rw-r--r--  1 root root     1038 Apr 28 12:22 www.server1.com.crt
-rw-r--r--  1 root root      672 Apr 28 12:22 www.server1.com.csr
-rw-r--r--  1 root root      891 Apr 28 12:22 www.server1.com.key
-rw-r--r--  1 root root     2725 Apr 28 12:23 www.server1.com.p12
-rw-r--r--  1 root root     1038 Apr 28 12:22 www.server2.com.crt
-rw-r--r--  1 root root      672 Apr 28 12:22 www.server2.com.csr
-rw-r--r--  1 root root      887 Apr 28 12:22 www.server2.com.key
-rw-r--r--  1 root root     2725 Apr 28 12:23 www.server2.com.p12
```

最后，我已经创建了一个虚拟机，同时在80和81两个端口提供 http 服务，测试：

```bash
root@test:~# os server list
WARNING: Failed to import plugin orchestration.
+--------------------------------------+--------+--------+------------------+--------------+---------+
| ID                                   | Name   | Status | Networks         | Image        | Flavor  |
+--------------------------------------+--------+--------+------------------+--------------+---------+
| 748eb0ae-543d-4a25-9b72-ee50a8f080f9 | server | ACTIVE | private=10.0.0.5 | cirros-0.3.4 | m1.tiny |
+--------------------------------------+--------+--------+------------------+--------------+---------+
root@test:~# ip netns exec $NAMESPACE curl http://10.0.0.5:80
Welcome to 10.0.0.5:80
root@test:~# ip netns exec $NAMESPACE curl http://10.0.0.5:81
Welcome to 10.0.0.5:81
```

## 测试过程

如下的命令都是在 devstack 环境中执行。

- admin 用户允许 demo 用户使用 barbican 服务(主要是存储证书)

```bash
source_adm
openstack role add --user demo --project demo creator
```

- 使用 demo 用户在 barbican 注册 web server 的证书。

```bash
source_demo
secret1_id=$(openstack secret store --name='lb_tls_secret_1' -t 'application/octet-stream' -e 'base64' --payload="$(base64 < www.server1.com.p12)" -f value -c "Secret href")
secret2_id=$(openstack secret store --name='lb_tls_secret_2' -t 'application/octet-stream' -e 'base64' --payload="$(base64 < www.server2.com.p12)" -f value -c "Secret href")
```

- demo 用户允许 octavia 服务用户访问 demo 用户在 barbican 的证书。

```bash
source_adm; octavia_user_id=$(os user show admin -f value -c id); echo $octavia_user_id; source_demo
openstack acl user add -u $octavia_user_id $secret1_id
openstack acl user add -u $octavia_user_id $secret2_id
```

- demo 用户创建 loadbalancer/listener/pool/member，注意创建 listener 时的参数

```bash
IP=10.0.0.5 # 虚拟机的 IP
subnetid=$(os subnet show private-subnet -f value -c id); echo $subnetid
lb_id=$(openstack loadbalancer create --name test_tls_termination --vip-subnet-id $subnetid -f value -c id); echo $lb_id
# 等待 loadbalancer 创建成功后继续执行以下命令
listener_id=$(openstack loadbalancer listener create $lb_id --name https_listener --protocol-port 443 --protocol TERMINATED_HTTPS --default-tls-container=$secret1_id --sni-container-refs $secret1_id $secret2_id -f value -c id); echo $listener_id
pool_id=$(openstack loadbalancer pool create --protocol HTTP --listener $listener_id --lb-algorithm ROUND_ROBIN -f value -c id); echo $pool_id
openstack loadbalancer member create --address ${IP} --subnet-id $subnetid --protocol-port 80 $pool_id
# 给 vip 分配 floating ip
public_network=$(os network show public -f value -c id)
fip=$(os floating ip create $public_network -f value -c floating_ip_address)
vip=$(lb show $lb_id -c vip_address -f value)
vip_port=$(os port list --fixed-ip ip-address=$vip -c ID -f value)
os floating ip set $fip --fixed-ip-address $vip --port $vip_port
echo "$fip www.server2.com" >> /etc/hosts
echo "$fip www.server1.com" >> /etc/hosts
```

- 测试以不同方式访问  loadbalancer

```bash
root@test:~# curl -k https://$fip
Welcome to 10.0.0.5:80
root@test:~# curl -k https://www.server1.com
Welcome to 10.0.0.5:80
root@test:~# curl --cacert ca.crt https://$fip
curl: (51) SSL: certificate subject name (www.server1.com) does not match target host name '172.24.4.8'
root@test:~# curl --cacert ca.crt https://www.server1.com
Welcome to 10.0.0.5:80
root@test:~# curl -k https://www.server2.com
Welcome to 10.0.0.5:80
root@test:~# curl --cacert ca.crt https://www.server2.com
Welcome to 10.0.0.5:80
```

同时能够使用 https://www.server1.com 和 https://www.server2.com 访问说明 SNI 生效。

## 赠送 - 测试 L7 policy

l7 policy的支持是 octavia 的另一个高级功能，也是市面上大多数七层负载均衡器提供的能力，因为在 OSI 协议中，七层协议是能够看到请求中更多的数据(比如请求 url 路径，请求的 hostname，请求的资源类型等)，所谓能力越大责任越大，七层负载均衡器自然要提供更为复杂的负载均衡能力。

在 https 类型的 listener 上要支持基于 hostname 的 l7 policy，SNI 是必选，没有 SNI 就不存在多个 hostname，那基于 hostname 过滤自然就无从谈起。

还记得我刚才创建的虚拟机不仅提供了80端口服务，还有81端口么？下面的测试要达到的目的是：当客户端访问 www.server1.com 时由80端口提供服务，访问 www.server2.com 时由81端口提供服务。接着执行命令：

```bash
# 在 lb 中创建共享的 pool，将81端口作为 member 加入
shared_pool_id=$(openstack loadbalancer pool create --name shared_pool --protocol HTTP --loadbalancer $lb_id --lb-algorithm ROUND_ROBIN -f value -c id)
openstack loadbalancer member create --address $IP --subnet-id $subnetid --protocol-port 81 $shared_pool_id
# 在 listener 设置 l7 policy
policyid=$(openstack loadbalancer l7policy create --action REDIRECT_TO_POOL --redirect-pool $shared_pool_id $listener_id -f value -c id)
openstack loadbalancer l7rule create --type HOST_NAME --compare-type EQUAL_TO --value www.server2.com $policyid
root@test:~# curl --cacert ca.crt https://www.server2.com
Welcome to 10.0.0.5:81
root@test:~# curl --cacert ca.crt https://www.server1.com
Welcome to 10.0.0.5:80
```

全文完!
