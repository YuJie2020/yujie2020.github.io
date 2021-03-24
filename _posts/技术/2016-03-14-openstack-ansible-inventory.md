---
layout: post
title: OpenStack Ansible Inventory机制
description: OpenStack Ansible Inventory机制
category: 技术
---

openstack ansible所用到的主机文件(inventory)是动态生成的，关于openstack ansible inventory的机制可以参见[这里](http://docs.openstack.org/developer/openstack-ansible/developer-docs/inventory.html#developer-inventory)，该文档中也同时提到了ansible本身的dynamic inventory functionality。

如果需要加一个新的服务，使用openstack-ansible部署，首先碰到的问题是：我需要把该服务部署到哪个host上？服务需要部署到container上么？

假设需求如下：  
通过openstack ansible部署mistral服务，mistral服务包含三个服务进程，分别是mistral-api, mistral-engine, mistral-executor，想把这三个进程部署到独立的物理机上。

首先要有一个基本的用户配置文件，一个最简单的`openstack_user_config.yml`内容如下：

    identity_hosts:
      infra01:
        ip: 10.0.0.10
      infra02:
        ip: 10.0.0.11
      infra03:
        ip: 10.0.0.12
    cidr_networks:
      container: 172.29.236.0/22
    global_overrides:
      management_bridge: br-mgmt
      provider_networks:
        - network:
           group_binds:
             - all_containers
             - hosts
           type: "raw"
           container_bridge: "br-mgmt"
           container_interface: "eth1"
           container_type: "veth"
           ip_from_q: "container"
           is_container_address: true
           is_ssh_address: true

同时，与之对应的env.d目录下keystone.yml内容如下：

    component_skel:
      keystone:
        belongs_to:
          - keystone_all
    container_skel:
      keystone_container:
        belongs_to:
          - infra_containers
          - identity_containers
        contains:
          - keystone
        properties:
          service_name: keystone
          container_release: trusty
    physical_skel:
      identity_containers:
        belongs_to:
          - all_containers
      identity_hosts:
        belongs_to:
          - hosts

关于mistral，新增两个文件：

在env.d目录下新增mistral.yml，内容如下：

    component_skel:
      mistral_api:
        belongs_to:
          - mistral_all
      mistral_engine:
        belongs_to:
          - mistral_all
      mistral_executor:
        belongs_to:
          - mistral_all
    container_skel:
      mistral_service_container:
        belongs_to:
          - infra_containers
          - workflowengine_containers
        contains:
          - mistral_api
          - mistral_engine
          - mistral_executor
        properties:
          is_metal: true
          service_name: mistral
          container_release: trusty
    physical_skel:
      workflowengine_containers:
        belongs_to:
          - all_containers
      workflowengine_hosts:
        belongs_to:
          - hosts

在conf.d目录下新增mistral.yml，内容如下：

    workflowengine_hosts:
      infra04:
        ip: 10.0.0.13

在playbooks/inventory目录下运行：

    $ ./dynamic_inventory.py --config ../../etc/openstack_deploy/

会在`openstack_deploy`目录下生成两个新的文件：`openstack_hostnames_ips.yml`和`openstack_inventory.json`。请自行查看生成的文件内容。

openstack ansible提供了命令行查看inventory的信息，比如（在`etc/openstack_deploy/`目录下执行）：

    $ ../../scripts/inventory-manage.py -l
    +-------------------------------------+----------+------------------+---------------+----------------+------------------+--------------------+
    | container_name                      | is_metal | component        | physical_host | tunnel_address | ansible_ssh_host | container_types    |
    +-------------------------------------+----------+------------------+---------------+----------------+------------------+--------------------+
    | infra01                             | True     | None             | infra01       | None           | 10.0.0.10        | infra01_containers |
    | infra02                             | True     | None             | infra02       | None           | 10.0.0.11        | infra02_containers |
    | infra03                             | True     | None             | infra03       | None           | 10.0.0.12        | infra03_containers |
    | infra01_keystone_container-78c92f7e | None     | keystone         | infra01       | None           | 172.29.239.95    | None               |
    | infra02_keystone_container-18ed73e3 | None     | keystone         | infra02       | None           | 172.29.237.9     | None               |
    | infra03_keystone_container-a8c83914 | None     | keystone         | infra03       | None           | 172.29.237.248   | None               |
    | infra04                             | True     | mistral_executor | infra04       | None           | 10.0.0.13        | infra04_containers |
    +-------------------------------------+----------+------------------+---------------+----------------+------------------+--------------------+