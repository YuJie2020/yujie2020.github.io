---
layout: post
title: OpenStack Horizon Profiling
description: 使用OpenStack Profiler查看Horizon性能数据
category: 技术
---

更新历史：

- 2017.01 初稿完成
- 2017.09 更新格式和高亮

从Ocata版本开始，Horizon在‘Developer’标签下新增了一个panel--‘OpenStack Profiler’，给开发者提供了一种方式查看Horizon页面加载时的API调用情况，如下图所示：  
![](/images/2017-01-30-horizon-profiling/1.png)

好处：

- 为分析Horizon页面性能问题提供一种直观的查看方式，很方便的知道当前页面的性能瓶颈在哪里；
- 为开发者提供了一种标准方式对比代码修改前后的性能优化效果；
- 对于Horizon社区来说，为gate添加Rally性能测试成为可能；

## 如何启用
本文假设你已经有了一个horizon开发环境，无论是通过devstack安装还是在virtualenv中手动启动horizon进程。要启用‘OpenStack Profiler’页面，你需要：

- 安装mongodb。Horizon会将API调用过程的数据都保存到mongodb中，mongodb可以安装在本机，也可以在本机能够访问的任意一台机器上。我选择的是后者，在我按照mongodb的[官方文档](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/#install-mongodb-community-edition)安装完成后，在本机远程连接mongodb总是失败。最后通过如下方式解决：

```console
$ sudo rm -f /var/lib/mongodb/mongod.lock
$ sudo service mongod status
(同时注释掉/etc/mongod.conf中bindIp)
```

- 配置Horizon。

```bash
cd horizon
cp openstack_dashboard/contrib/developer/enabled/_9001_developer.py openstack_dashboard/local/enabled/
cp openstack_dashboard/contrib/developer/enabled/_9030_profiler.py openstack_dashboard/local/enabled/
cp openstack_dashboard/contrib/developer/enabled/_9010_preview.py openstack_dashboard/local/enabled/
cp openstack_dashboard/local/local_settings.d/_9030_profiler_settings.py.example openstack_dashboard/local/local_settings.d/_9030_profiler_settings.py
```

  编辑`_9030_profiler_settings.py`，修改mongodb相关配置，我的配置如下：

```python
OPENSTACK_PROFILER.update({
    'enabled': True,
    'keys': ['SECRET_KEY'],
    'notifier_connection_string': 'mongodb://192.168.200.50:27017',
    'receiver_connection_string': 'mongodb://192.168.200.50:27017'
})
```

- 重启Horizon。登录Horizon，会发现页面的右上方会有一个’Profile‘下拉菜单，如下图:  

  ![](/images/2017-01-30-horizon-profiling/2.png)  
  如果要获取当前页面的API调用数据，点击’Profile Current Page‘会重新刷新页面，加载完成后，到’Developer‘下面的’OpenStack Profiler‘页面就会看到页面加载过程的详细数据。

---

## 参考连接

- <https://blueprints.launchpad.net/horizon/+spec/openstack-profiler-at-developer-dashboard>  
- <http://docs.openstack.org/developer/horizon/contributing.html#profiling-pages>  
- <http://docs.openstack.org/developer/horizon/topics/settings.html#openstack-profiler>