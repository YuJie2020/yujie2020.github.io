---
layout: post
title: Tempest Deep Dive
description: Tempest Deep Dive
category: 技术
---

更新历史：

- 2015.05 初稿完成
- 2017.09 针对当前版本（pike）更新

以前写过一篇简单介绍Tempest的[文章](http://lingxiankong.github.io/2014-03-12-tempest.html)，但当时偏重于讲解配置的生成，时至今日，当时生成配置文件的方式已不复存在，取而代之的是tox -egenconfig，可见社区果然是“变化太快”。

如果您知道啥是Tempest并且您是一个开发者，那么除了我这篇文章，您也可以仔细阅读Tempest的[开发者文档](http://docs.openstack.org/developer/tempest/)。

## 如何执行 tempest

- 创建测试工作目录，`tempest init workdir`，执行后，会在 workdir 目录下生成一些文件夹和文件
- 在 workdir 目录下的 etc 目录下，修改 tempest 配置文件`tempest.conf`，进入 workdir 目录（然后后面的命令就不用指定`--workspace`参数了）
- 可以先查看都有哪些测试用例，`tempest run --list-tests` 或者使用正则表达式：`tempest run --list-tests --regex ^octavia_tempest_plugin`
- 启动测试，`tempest run --serial --regex xxx/--whitelist-file <file>`，或者直接使用 testr 或任何基于 testr 的工具（比如 ostestr）。

## 如何写 tempest plugin

其实 tempest 官方文档对 plugin 的实现机制说的已经比较详细了，我这里仅做个总结。其实这里比较复杂的就是注册 service client，加载测试用例和注册配置项都比较直观。

- `tempest.config.service_client_config('qinling')`就是获取 qinling group 所有的配置项信息
- tempest 中 `register_service_clients` 会调用 plugin 的`get_service_clients`，完成 `plugin name -> [{client config1}, {client config2}]`的映射
- 真正完成 service client 的注册是在 `tempest.lib.services.clients.ServiceClients` 中，根据上一步的映射信息设置 ServiceClients 的属性。如果要在其他 tempest plugin 中使用 service client，就可以用`clientmanager.<name>.<client_name>()`，`service_version` 只是用来描述不同版本的 client，不会被引用到

## 弄懂 tempest 的关键
其实Tempest用例无非是一些特殊的“unit test”，各个测试用例间互不干扰，因此要读懂某一个用例的执行过程其实不难。但毕竟作为测试类，为了测试用例的执行，还是会有初始化的过程，所以，弄懂初始化的过程，掌握Tempest就易如反掌了。

对于Tempest来说，把基类`/tempest/test.py::BaseTestCase`读懂，就啥都明白了。类的注释说的也比较明白。

setUpClass 按顺序包含如下步骤（可被测试类覆写）：

- `skip_checks`：根据一些条件决定是否抛出skipException异常，以**阻止整个测试类的执行**，测试类一般都会覆写该函数。

- `setup_credentials`：初始化 client manager。每个测试类在用例执行过程中基本都会用到至少一个 service 的 client，client manager  就是管理各个 service client。这里有一个credentials provider的概念，credentials 作为 client manager 的初始化参数，提供鉴权信息，目前 credentials provider 有两种实现方式：

  DynamicCredentialProvider，**适用于并发测试场景，为每个测试类创建不同的租户**。要求`CONF.auth.use_dynamic_credentials`配置项为true或测试类的`force_tenant_isolation`属性为true，会自动到Keystone创建用户，并以该用户的身份执行用例。但能够创建用户的前提是有一个已知的admin用户，所以，其实还是会用到`[auth]`中`admin_username`、`admin_project_name`、`admin_password`等配置项。

  PreProvisionedCredentialProvider，**适用于并发测试场景，且不需要admin信息**。通过读取`CONF.auth.test_accounts_file`配置项指向的文件信息来获取用户信息。

  LegacyCredentialProvider，这个类就是从配置文件中读取静态用户信息，不推荐使用。

  client manager 其实就是 ServiceClients 的子类。

- `setup_clients`：基类中啥也没做，一般情况下测试类中会根据需要从client manager 拿自己需要的 client

- `resource_setup`：创建测试类可能使用的辅助资源（validation resources），比如keypair、security group、floating ip，这些都是为了自动登录虚拟机需要使用的。

tearDownClass 按顺序包含如下步骤（可被测试类覆写）：

- `resource_cleanup`：清理`resource_setup`阶段创建的资源。
- `clear_isolated_creds`：调用`credentials_provider`清理Tempest创建的租户资源和租户本身。

## 异常测试框架（待更新）
早期的Tempest用例中，除了正常测试用例之外，还有对应的异常测试用例，现在的Tempest用例中还是遗留有异常测试用例的痕迹，比如`tempest/api/compute/servers/test_instance_actions_negative.py`。而且，异常测试用例特别好写，千篇一律，给个异常参数，期望API抛出异常即可。这种没有技术含量的事情，社区天才的工程师们怎么能忍呢，所以，QA团队引入异常测试框架解决这个问题。

Tempest中异常测试用例可以参见`/tempest/api/compute/flavors/test_flavors_negative.py`，可以看到每个测试类除了继承自BaseTestCase外，还会继承NegativeAutoTest，并且有个类装饰器：SimpleNegativeAutoTest

读懂装饰器SimpleNegativeAutoTest代码需要理解python高级正则表达式用法，用到了re的“肯定前向断言”(?=pattern)和“否定后向断言”(?<!pattern)。对于FlavorsListWithDetailsNegativeTestJSON测试类来说，该装饰器的作用是：

* 取出类名字符串：FlavorsListWithDetailsNegativeTestJSON
* 先把字符串中的JSON和TEST字符串去除：FlavorsListWithDetailsNegative；
* 在字符串中大写字母且非首字母前加`_`符号：Flavors\_List\_With\_Details\_Negative
* 把字符串中的大写字母全部转换成小写：flavors\_list\_with\_details\_negative
* 字符串前添加`test_`：test\_flavors\_list\_with\_details\_negative
* 将这个最终的字符串，作为FlavorsListWithDetailsNegativeTestJSON测试类的一个方法名，并且指定方法的实现函数execute()

这个execute函数来自父类NegativeAutoTest，其作用是根据你的api-schena的定义，发送http请求，期望http error。

## 一些关键的配置项
Tempest配置项按照section划分：  
![](/images/2015-05-22-tempest-deep-dive/1.png)

identity section下的`uri`或`uri_v3`是必不可少的配置项，是Tempest与你的OpenStack环境连接的桥梁。
比如：uri=http://10.250.10.50:5000/v2.0

## 实战
我要在 DevStack 环境测试 octavia 的 tempest 用例。先按照上述讲解初始化 tempest 执行环境。

对配置文件进行修改，这里是以我的环境为例，请自行修改。
```ini
[auth]
create_isolated_networks = true
admin_username = admin
admin_project_name = admin
admin_password = password
admin_domain_name = default

[identity]
disable_ssl_certificate_validation = True
uri = http://10.0.19.48/identity
uri_v3 = http://10.0.19.48/identity/v3

[service_available]
neutron = true
glance = true
nova = true
load-balancer = true

[octavia_tempest]
catalog_type = load-balancer
vip_network_id = 1bc7cc02-d815-4b9a-87c5-144fe1d21d63
```

> 如果不是在DevStack环境中安装，安装某个python库时提示“error: command 'x86_64-linux-gnu-gcc' failed”，则先安装：apt-get install -y python-dev

在执行测试前，可以先验证自己的Tempest配置是否OK。  
`verify-tempest-config`  
这个脚本是随Tempest安装的，它会验证Tempest能否访问你环境上的Keystone，还会验证环境上各个服务与你的配置是否冲突，每个服务支持的extensions与你的配置是否冲突，服务支持的版本号与你的配置是否冲突等，保证你的Tempest配置基本正确。

执行测试：
```console
tempest run --regex ^octavia_tempest_plugin
```

## FAQ

### 问题：我的环境中没有安装Ironic，有些用例跑不过怎么办？
在`service_available` section下面配置：  
ironic = false

在`/tempest/api/compute/admin/test_baremetal_nodes.py`中：  
![](/images/2015-05-22-tempest-deep-dive/2.png)

### 问题：上面直接skip一个测试类有点太狠了，我只想skip涉及某个服务的某个测试用例
![](/images/2015-05-22-tempest-deep-dive/3.png)

这样，如果系统没有部署Cinder服务，该测试用例就会skip。

### 问题：我使用Tempest最新版测试老的OpenStack版本，可有些特性在老版本并不存在，怎么办？
在compute-feature-enabled section的`api_extensions`配置项中配置Nova服务支持的extensions。  
![](/images/2015-05-22-tempest-deep-dive/4.png)

可能你还会觉得直接skip一个测试类太狠，ok，也有函数级的skip方式：  
![](/images/2015-05-22-tempest-deep-dive/5.png)
