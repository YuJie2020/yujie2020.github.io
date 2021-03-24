---
layout: post
title: Proxy Protocol Demo of Nginx Ingress Controller in OpenStack Magnum Cluster
category: 技术
---

## Why Proxy Protocol

Proxy Protocol is usually used as a load balancing feature, in default configuration of most load balancers, instead of your backend servers seeing the original client requests, backend servers see requests as though they had originated from load balancers. This means that, by default, backend servers no longer receive client information such as IP address and port number. The loss of this information is a problem if, for example, you want to analyze traffic logs, or to adjust your application’s functionality based on GeoIP.

![](/images/2019-08-04-proxy-protocol-nginx-ingress-controller/1.png)

Proxy Protocol is an industry standard to pass client connection information through a load balancer on to the destination server. Turning on Proxy Protocol inserts a string formatted like this at the top of the request transmitted by the Load Balancer:

```
PROXY_STRING + single space + INET_PROTOCOL + single space + CLIENT_IP + single space + PROXY_IP + single space + CLIENT_PORT + single space + PROXY_PORT + "\r\n"
```

For example, a Proxy Protocol line for an IPv4 address would look like this:

```
PROXY TCP4 192.168.0.1 192.168.0.2 42300 443\r\n
```

![](/images/2019-08-04-proxy-protocol-nginx-ingress-controller/2.png)

## Why OpenStack Magnum

Magnum is an application programming interface service that aims to make container orchestration engines like Kubernetes accessible as first-class resources within OpenStack.

Magnum not only eases the actual integration with OpenStack but makes it possible for users to access and benefit from an environment that provides additional, supplemental features. For example, Magnum supports to install openstack cloud controller manager with appropriate configuration by just setting a cluster template label. As a result, the users could simply enable or disable the OpenStack service features by setting some Kubernetes resource properties.

In this demo, we set the Kubernetes Service annotation and Nginx controller configuration, in order to enable the Proxy protocol.

## Demo

https://youtu.be/aMWzCF-rufg