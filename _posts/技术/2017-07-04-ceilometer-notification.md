---
layout: post
title: Ceilometer/Aodh操作notification简介
description: Ceilometer/Aodh操作notification简介
category: 技术
---

更新历史：

- 2017.10.06，更新一些命令

OpenStack 大多数项目中都依赖消息队列（默认是 RabbitMQ ）在服务内部传递消息，同时，大多数关键项目（Nova、Cinder、Glance 等）也会将用户操作资源的动作以及资源的状态变化这些信息发送到消息队列，这些消息被称为 notification。任何对 notification 感兴趣的服务或组件都可以在消息队列上监听特定的 topic（默认是‘notifications’），从而获取这些 notification 并进行处理。OpenStack 官方推荐的获取 notification 的角色是 Ceilometer，其子项目 Panko 实现了对 notification 的查询，Aodh 中也实现了基于 notification 的监控告警。当然，很多其他项目不想依赖 Ceilometer，都在自己的代码库中实现了对消息队列的监听和处理，虽然有些重复造轮子的意思，但很多项目觉得与安装部署维护另一个服务所花费的时间精力相比，可能自己写代码来的更加方便快捷。比如 Mistral 中就实现了基于 notification 的工作流触发，而 [Monasca](http://monasca.io/) 更是直接取代 Ceilometer 自成一派。这也是因为 Ceilometer 项目前几年做的比较差，性能不好，所以几乎没人在生产环境使用，它本身的部署率低也就导致对它有潜在依赖需求的项目不得不寻求别的方案来替代它。

> 所以，你可以认为 Ceilometer 的作用仅仅是数据收集和转换，Gnocchi 提供数据存储，Panko 提供事件查询，Aodh 提供基于事件告警和通知。

但即便如此，我们（Catalyst Cloud）还是把Ceilometer部署到了生产环境以提供计费数据来源，但并不对外提供 API，这样就把一些潜在问题在内部消化了。

这篇博客仅关注 Ceilometer 中的 notification 相关功能和流程，所有分析都基于 Pike(2017) 版本，并会不定期更新。同时，与过往不同的是，我会在这篇博客中贴一些代码，因为我发现隔一段时间回头看之前的文章时，没有代码的支撑感觉看的很虚。

Ceilometer 中核心服务有两个：

1. polling agent - 通过主动查询的方式获取sample，比如直接调用 OpenStack 相关服务的 client 或者其他第三方组件的 API. 这种方式的缺点是会对其他服务造成额外负载，Ceilometer 开发者文档中已经不推荐在生产环境中使用。
2. notification agent - 通过监听消息队列获取 OpenStack 各个服务组件发送的 notification.

本篇博客就从notification agent说起。

## 监听 notification

监听 notification 的前提是得有服务确实会向 RabbitMQ 中发送 notification，否则监听没有任何意义。比如 Nova 可以通过如下配置开启虚拟机状态发生变更时发送 notification 的[功能](https://docs.openstack.org/nova/latest/notifications.html)：

```ini
[notifications]
notify_on_state_change=vm_and_task_state
[oslo_messaging_notifications]
driver=messagingv2
topics=notifications
```

简单来说，Nova 会把 notification 发送到 RabbitMQ 中名为“notifications”的 topic 中去，那么 Ceilometer 中的 notification agent 自然就要配置监听这个 topic（oslo_messaging_notifications的配置与上述保持一致即可）。

oslo.messaging 中有几个概念我总是混淆，还是写下来供需要的时候查阅：

- target，包含了 exchange/topic 的信息
- listener

    * 多个listener可以在同一个 target 上监听，但只有一个listener能够处理消息。
    * 如果创建 listener 的时候指定了 pool，那么每一个 pool 也会收到一份消息的拷贝，此时消息就能同时被不同的 listener 监听。
    * listener对外暴露 endpoint，每个 endpoint 中定义了对应消息优先级的方法（比如 info(), error()等）来处理不同优先级的消息。
    * endpoint 中还可以定义NotificationFilter过滤消息。
    * 所有的 endpoint 处理完消息返回后，才会发送 ack。
    * 创建 listener 需要提供 transport、targets 和 endpoints

notification-agent 中监听消息队列的关键代码如下：

    urls = self.conf.notification.messaging_urls or [None]
    for url in urls:
        transport = messaging.get_transport(self.conf, url)
        listener = messaging.get_batch_notification_listener(
            transport, targets, endpoints)
        listener.start()

Ceilometer 会创建一个 listener，根据 setup.cfg 中`ceilometer.notification`的配置，会有很多 plugin 定义不同的 target 和 endpoint 处理 notification，基本都是将 notification 转化成 sample 并处理。Ceilometer 默认提供一个 EventsNotificationEndpoint 将 notification 根据配置转化成 event 并 publish。这里的`publish`并非就一定是往外发送，可以当做是处理的意思。

本文仅关注EventsNotificationEndpoint。

## notification 的处理

EventsNotificationEndpoint 拿到 notification 之后，先将其转换成 event，然后 publish，核心代码就如下几行：

```python
event = self.event_converter.to_event(notification)
if event is not None:
    with self.manager.publisher() as p:
        p(event)
```

将 notification 转化成 event 需要配置文件：`event_definitions.yaml`，匹配顺序从后往前，定义了 event 的 type、字段以及如何从 notification 中获取该字段。

publish event 需要配置文件：`event_pipeline.yaml`，event_pipeline.yaml 与 Ceilometer 传统的 pipeline.yaml 结构大致相同，pipeline.yaml是如下结构：

```json
{
  "sources": [
    {
      "name": source_1,
      "meters": ["meter_1", "meter_2"],
      "sinks": ["sink_1", "sink_2"]
    }
  ],
  "sinks": [
    {
      "name": sink_1,
      "transformers": [
        {
          "name": "Transformer_1",
          "parameters": {"p1": "value"}
        },
        {
          "name": "Transformer_2",
          "parameters": {"p1": "value"}
        },
      ],
      "publishers": ["publisher_1", "publisher_2"]
    },
  ]
}
```

而 event_pipeline.yaml 是如下结构，唯一的区别是将 meters 改成 events，并且不需要 transformer：
```json
{
  "sources": [
    {
      "name": source_1,
      "events": ["event_type1", "event_type2"],
      "sinks": ["sink_1", "sink_2"]
    }
  ],
  "sinks": [
    {
      "name": sink_1,
      "publishers": ["publisher_1", "publisher_2"]
    },
  ]
}
```

里面的 transformer 和 publisher 的名字都来自于 setup.cfg 。

在 Ceilometer 中，一个 pipeline 对象包含一个 source 和一个 sink，pipeline 的主要作用就是 publish 数据，对于 event pipeline，在 publish 数据前会判断该 event 是不是该 pipeline 感兴趣的，也就是说，**EventsNotificationEndpoint 并没有配合oslo.messaging 提供的 NotificationFilter 使用，而是先接收全部的 notification，然后在 pipeline 中实现过滤。**

## 基于 notification 的 alarm

Ceilometer 在拿到 event 后该如何 publish 呢？在 Ceilometer setup.cfg  文件中配置了如下几种方式：
```yaml
ceilometer.event.publisher =
    test = ceilometer.publisher.test:TestPublisher
    direct = ceilometer.publisher.direct:DirectPublisher
    notifier = ceilometer.publisher.messaging:EventNotifierPublisher
    kafka = ceilometer.publisher.kafka_broker:KafkaBrokerPublisher
    http = ceilometer.publisher.http:HttpPublisher
    gnocchi = ceilometer.publisher.direct:DirectPublisher
    database = ceilometer.publisher.direct:DirectPublisher
    file_alt = ceilometer.publisher.direct:DirectPublisher
    http_alt = ceilometer.publisher.direct:DirectPublisher
```

默认情况下，Ceilometer 只会将 event 存储在 Gnocchi 中以供后续查询，如果真是这样，那么故事也就在这个时候结束了。如果想要基于 notification 提供告警功能，就要在event_pipeline.yaml添加其他的 publisher，也就是`notifier` publisher。

notifier 做的事情很简单，创建oslo_messaging.Notifier对象把 event 重新发送到消息队列。既然又跟消息队列打交道，那么也就需要配置 topic：
```ini
[publisher_notifier]
event_topic=event
```

这里，‘event’是默认的 topic 名称。如果要配合 Aodh 使用，则需要在event_pipeline.yaml的 sink 中增加自定义 topic 的 notifier 类型的 publisher：`notifier://?topic=alarm.all`，同时要确保 Aodh 中正确配置：

```ini
[listener]
event_alarm_topic=alarm.all
```

至此，Ceilometer notification agent 的流程就结束了。对于 event 的接收以及如何基于 event 触发告警，就是 Aodh 的功能了。但其实回过头来看看，既然在 publisher 中已经可以拿到 event，如果已有的 publisher 不能满足需要，那么就可以提供一个自定义的 publisher 处理 event。但考虑最终用户使用的话，还是需要类似于 Aodh 的服务给用户提供基于不同类型的 event 定义自定义动作的能力。比如结合我最近在做的[Qinling](https://github.com/openstack/qinling)项目，就可以通过 Aodh 来定义如下场景：当用户向 Swift 上传 object 成功后，调用用户在 Qinling 创建的 function 下载并处理 object，然后将处理之后的新的 object 重新上传到 Swift。

## notification agent 的部署

看完上述的分析不难发现，其实 notification agent 的功能是自包含的。如果你仅仅需要获取 OpenStack 环境中的 notification 并做一些处理，那么你不需要部署 Ceilometer 中所有的服务，仅仅部署一个 notification agent 足矣，不需要自己从头写代码去跟消息队列打交道。我觉得这个方法是值得推荐的。

同时，notification agent 本身支持多实例部署，通过轮询的方式从RabbitMQ 中获取notification。

> 如果你想写代码在 OpenStack 环境中获取 notification，记得在创建 listener 时使用 pool 参数，否则你的代码会加入 notification agent 的轮询列表而不能获取所有的 notification。

当然，轮询的方式也会存在一些问题。比如在配置相同的情况下，没有一个 notification agent 能拿到某个类型的全部notification，在转化成 sample 时，就不适用某些 transformer。社区通过 [coordination](https://specs.openstack.org/openstack/ceilometer-specs/specs/kilo/notification-coordiation.html) 的方式解决了该问题。如果你只关注 event（而非 sample），则不必理会。

## Aodh简介

Aodh的逻辑很简单，但却分了4个组件：

- aodh-api
- aodh-listener，监听消息队列的‘alarm.all’ topic，也就是接收从 ceilometer notification-agent 发来的 event（消息的 payload 就是 event）并处理 event
- aodh-evaluator，循环根据用户定义的 alarm（排除‘event’类型） 判断是否应该触发告警，将结果再扔到消息队列中等待aodh-notifier的处理，默认 topic 是‘alarming’
- aodh-notifier，从消息队列接收 alarm（默认topic 也是‘alarming’），触发动作

跟 event 相关的组件是aodh-listener和aodh-notifier。

### aodh-listener

然名字叫 listener，但它收到 event 后的处理却会直接evaluate alarm。

```python
for id, alarm in six.iteritems(self._get_project_alarms(event.project)):
    self._evaluate_alarm(alarm, event)
```

listener 收到的 event 是类似如下格式：

```json
{
  u'event_type': u'objectstorage.object.upload',
  u'traits': [
    [
      u'service',
      1,
      u'ceilometermiddleware'
    ],
    [
      u'tenant_id',
      1,
      u'fd68d8c7b2c44cca9a165c7e049f7a7d'
    ],
    [
      u'object',
      1,
      u'stackrc'
    ],
    [
      u'container',
      1,
      u'lingxian'
    ],
    [
      u'project_id',
      1,
      u'fd68d8c7b2c44cca9a165c7e049f7a7d'
    ]
  ],
  u'message_signature': u'bcfb59e386d5375dbb7ded9910900a98536f168d377f52ae7ffd89159c0019f5',
  u'raw': {
    
  },
  u'generated': u'2017-10-03T10:02:38.305378',
  u'message_id': u'ac6ce4ae-546a-47cc-a0cb-ad1bae44ca61'
}
```

listener 会先将该 event 转换成比较易于读取的结构，特别是将 'traits' 转换成字典的形式。

aodh-listener 会根据 event 中的 project id 去 aodh 数据库中找这个 project 定义的 ‘event’ 类型的 alarm（alarm_type=event），如果该 project 没有定义过 alarm 则跳过处理这个 event，如果有 alarm 并且：

- alarm 中的event_type与 event 中的event_type相同
- alarm 的repeat_actions=true或没有被触发过
- event 中的数据满足 alarm 中定义的触发条件

则更新 alarm 的状态并且将 alarm 的信息发送到消息队列（默认 topic 是‘alarming’）：
```python
def notify(self, alarm, previous, reason, reason_data):
'''这里 alarm 是数据库对象，previous 是之前的状态，reason 是触发字符串，reason_data 是 {'type': 'event', 'event': event.obj}。这里event.obj 是原始的 event'''
    actions = getattr(alarm, models.Alarm.ALARM_ACTIONS_MAP[alarm.state])
    if not actions:
        LOG.debug('alarm %(alarm_id)s has no action configured '
                    'for state transition from %(previous)s to '
                    'state %(state)s, skipping the notification.',
                    {'alarm_id': alarm.alarm_id,
                    'previous': previous,
                    'state': alarm.state})
        return
    payload = {'actions': actions,
                'alarm_id': alarm.alarm_id,
                'alarm_name': alarm.name,
                'severity': alarm.severity,
                'previous': previous,
                'current': alarm.state,
                'reason': six.text_type(reason),
                'reason_data': reason_data}
    self.notifier.sample({}, 'alarm.update', payload)
```

### aodh-notifier

aodh-notifier 收到消息队列中的消息后，根据 alarm 中定义的 actions，调用各自的函数处理。

```python
@staticmethod
def _process_alarm(notifiers, data):
'''notifiers 是 aodh 中定义的所有 notifiers 的ExtensionManager，data 就是上面的 payload'''
    actions = data.get('actions')
    if not actions:
        LOG.error("Unable to notify for an alarm with no action")
        return
    for action in actions:
        AlarmEndpoint._handle_action(notifiers, action,
                                     data.get('alarm_id'),
                                     data.get('alarm_name'),
                                     data.get('severity'),
                                     data.get('previous'),
                                     data.get('current'),
                                     data.get('reason'),
                                     data.get('reason_data'))
```

目前 Aodh 支持的 actions：

```
aodh.notifier =
    log = aodh.notifier.log:LogAlarmNotifier
    test = aodh.notifier.test:TestAlarmNotifier
    http = aodh.notifier.rest:RestAlarmNotifier
    https = aodh.notifier.rest:RestAlarmNotifier
    trust+http = aodh.notifier.trust:TrustRestAlarmNotifier
    trust+https = aodh.notifier.trust:TrustRestAlarmNotifier
    zaqar = aodh.notifier.zaqar:ZaqarAlarmNotifier
    trust+zaqar = aodh.notifier.zaqar:TrustZaqarAlarmNotifier
```

## 实战

为了验证上述的理论，我临时搭建了一个环境，在一个主机上安装了如下几个服务：Keystone、Ceilometer notification-agent、Aodh、RabbitMQ、Mysql。同时，我写了几行代码来模拟向 RabbitMQ 发送 notification，如下（保存为 notifier.py）：

```python
from oslo_config import cfg
import oslo_messaging


def main():
    """Send notification to Ceilometer notification-agent.

    The configuration:
    [oslo_messaging_rabbit]
    rabbit_password = password
    """
    conf_file = '/etc/lingxian/lingxian.conf'
    publisher_id = "test.lingxian_host"
    project_id = 'b23a5e41d1af4c20974bf58b4dff8e5a'
    user_id = 'ceb61464a3d341ebabdf97d1d4b97099'

    conf = cfg.ConfigOpts()
    conf(None, project='lingxian', validate_default_values=False,
         default_config_files=[conf_file])
    transport = oslo_messaging.get_notification_transport(conf)
    notifier = oslo_messaging.Notifier(
        transport,
        publisher_id,
        driver='messagingv2',
        topics=['notifications']
    )

    notifier.info(
        {},
        event_type='compute.instance.create',
        payload={
            'tenant_id': project_id,
            'user_id': user_id,
            'instance_id': '123',
            'instance_type_id': 1,
            'instance_type': 'm1.flavor',
            'state': 'active'
        }
    )


if __name__ == '__main__':
    main()

```

notification-agent 使用默认配置，唯一修改的是在event_pipeline.yaml文件中publisher：`notifier://?topic=alarm.all`

Aodh 的部署需要安装配置db、 rabbitmq和 keystone credential，其他保持默认，不需要在 Keystone 中注册 Aodh 服务，使用 Aodh 命令行时指定 URL 即可。同时，这篇博客仅关注 notification，所以可以不用运行 aodh-evaluator 服务。

1. 在 Aodh 中创建 alarm

   `aodh --aodh-endpoint http://localhost:8000 alarm create --name test_alarm --type event --alarm-action log:// --repeat-actions true --event-type compute.instance.* --project-id b23a5e41d1af4c20974bf58b4dff8e5a`

   因为只是为了快速验证，我使用了 log action，所以要使用 admin 角色运行该命令。

2. 有了 alarm，剩下的只需向 rabbitmq 发送 notification，执行 `python notifier.py`

aodh-listener 的日志输出，可以看到经过 notification-agent 转换过后的 event 信息，同时可以看到该 event 匹配到了一个 alarm：

```
2017-07-06 12:37:46.562 7458 DEBUG aodh.event [-] Received 1 messages in batch. sample /home/ubuntu/aodh/aodh/event.py:48
2017-07-06 12:37:46.562 7458 DEBUG aodh.evaluator.event [-] Starting event alarm evaluation: #events = 1 evaluate_events /home/ubuntu/aodh/aodh/evaluator/event.py:165
2017-07-06 12:37:46.562 7458 DEBUG aodh.evaluator.event [-] Evaluating event: event = {u'event_type': u'compute.instance.create', u'traits': [[u'user_id', 1, u'ceb61464a3d341ebabdf97d1d4b97099'], [u'service', 1, u'test'], [u'resource_id', 1, u'123'], [u'tenant_id', 1, u'b23a5e41d1af4c20974bf58b4dff8e5a'], [u'instance_type_id', 2, 1], [u'state', 1, u'active'], [u'instance_id', 1, u'123'], [u'host', 1, u'lingxian_host'], [u'instance_type', 1, u'm1.flavor'], [u'project_id', 1, u'b23a5e41d1af4c20974bf58b4dff8e5a']], u'message_signature': u'ef7f31cdcbe74094a7c10100554ad3854ceaebdbaf6a75069cd9a84e19f1a131', u'raw': {}, u'generated': u'2017-07-06T12:37:46.527277', u'message_id': u'86619698-a492-4689-aaf4-e578456637b7'} evaluate_events /home/ubuntu/aodh/aodh/evaluator/event.py:167
2017-07-06 12:37:46.572 7458 DEBUG aodh.evaluator.event [-] Evaluating alarm (id=3f2c780f-8635-4723-810a-fb85cdefbc67) triggered by event (message_id=86619698-a492-4689-aaf4-e578456637b7). _evaluate_alarm /home/ubuntu/aodh/aodh/evaluator/event.py:222
2017-07-06 12:37:46.575 7458 INFO aodh.evaluator [-] alarm 3f2c780f-8635-4723-810a-fb85cdefbc67 transitioning to alarm because Event <id=86619698-a492-4689-aaf4-e578456637b7,event_type=compute.instance.create> hits the query <query=[]>.
2017-07-06 12:37:46.653 7458 DEBUG aodh.evaluator.event [-] Finished event alarm evaluation. evaluate_events /home/ubuntu/aodh/aodh/evaluator/event.py:184
```

aodh-notifier 的日志输出：

```
2017-07-06 12:37:46.654 7494 DEBUG aodh.notifier [-] Received 1 messages in batch. sample /home/ubuntu/aodh/aodh/notifier/__init__.py:97
2017-07-06 12:37:46.657 7494 DEBUG aodh.notifier [-] Notifying alarm 3f2c780f-8635-4723-810a-fb85cdefbc67 with action SplitResult(scheme=u'log', netloc=u'', path=u'', query='', fragment='') _handle_action /home/ubuntu/aodh/aodh/notifier/__init__.py:137
2017-07-06 12:37:46.658 7494 INFO aodh.notifier.log [-] Notifying alarm test_alarm 3f2c780f-8635-4723-810a-fb85cdefbc67 of low priority from insufficient data to alarm with action log: because Event <id=86619698-a492-4689-aaf4-e578456637b7,event_type=compute.instance.create> hits the query <query=[]>..
```