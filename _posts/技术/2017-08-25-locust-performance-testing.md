---
layout: post
title: 使用Locust进行API性能测试
description: 使用Locust进行API性能测试
category: 技术
---

之前为了测试 Ceilometer API 性能的时候就用过 locust，为什么用它呢？记得当时我有这么几个需求：

- 基于 Linux 命令行。我不用 Window 系统很多年了，而且为了偶尔几次性能测试也不值得去买一些软件的 License，所以像 SoapUI/Loadrunner 这类其实还不错工具就首先被排除了
- 支持 REST API
- 支持 https 的 insecure 设置
- 支持自定义 header

其实能满足要求的发送单个 API 的工具有很多，curl、httpie 等都挺好，但我就想要个工具，设置几个参数，运行，然后一段时间后给我个总结输出。但找来找去，甚至尝试了一些 Go 语言写的工具，要么不支持 https，要么不支持自定义 header，最后才找到 Locust，还是用程序员自己的方式解决自己的问题吧。

## 介绍
正如官方所说，[Locust](http://locust.io/)是一个 open source load testing tool，Define user behaviour with Python code，哈，一看是 Python 就对它有天然的好感。

Locust 的使用很简单也很方便，它提供了一个 python lib、一个命令行工具和一个 web UI，用户通过自己写 code 来定义测试用例，通过运行 locust cli 来执行测试，通过 web 界面查看测试结果。

对于程序员（特别是 Python 程序员）来讲，Locust另外一个优势就是，你不用去学不同工具为了定义测试用例而设计的不同的 DSL，直接写 code，通俗易懂。

## Locust 的使用
首先简单一个命令安装：
```bash
$ pip install locustio
```
如果只是简单的场景，这就够了，比较复杂的，可能还需要消息队列的支持。

然后就是写代码了。我这里有个例子，就是当时测试 Ceilometer API 的，可以作为例子解释一下，也供自己将来需要时能够快速上手：

```python
from locust import HttpLocust, TaskSet, task

class Query(TaskSet):
    @task()
    def get_samples(self):
        self.client.get("/v2/samples?q.field=meter&q.field=project_id&q.field=timestamp&q.field=timestamp&q.op=eq&q.op=eq&q.op=gt&q.op=lt&q.type=&q.type=&q.type=&q.type=&q.value=volume.size&q.value=b23a5e41d1af4c20974bf58b4dff8e5a&q.value=2017-07-11T00:00:00&q.value=2017-07-11T01:00:00", headers={'X-Auth-Token': '<snip>'}, verify=False)

        self.client.get("/v2/samples?q.field=meter&q.field=project_id&q.field=timestamp&q.field=timestamp&q.op=eq&q.op=eq&q.op=gt&q.op=lt&q.type=&q.type=&q.type=&q.type=&q.value=instance&q.value=e5bab53f56c14767bc44d2868ff317ae&q.value=2017-07-11T00:00:00&q.value=2017-07-11T01:00:00", headers={'X-Auth-Token': '<snip>'}, verify=False)

class CeilometerQuery(HttpLocust):
    task_set = Query
    host = 'https://api.nz-por-1.catalystcloud.io:8777'
    min_wait = 2000
    max_wait = 3000
```

- CeilometerQuery类的对象就代表 web 页面的一个用户或者一个API 的访问线程。属性中，min_wait, max_wait定义用户执行每个任务的间歇时间；task_set就是任务集的定义；host定义 API 服务地址
- TaskSet中可以定义多个 task，没有严格的执行顺序，只有一个定义执行次数的相对比例；TaskSet可以嵌套；可以定义`on_start`初始化方法；在TaskSet中的 client 就是一个类似于 [requests.Session](http://requests.readthedocs.io/en/latest/api/#requests.Session) 的对象，当然，更高级的用法是你自己定义 client

执行测试也很简单：`locust -f test_locust_ceilometer.py`，然后打开本地浏览器访问：[http://127.0.0.1:8089 ](http://127.0.0.1:8089/) 设置并发的用户总数和每秒创建的用户数，然后就能看到实时的测试数据。

看，是不是很简单！