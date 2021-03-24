---
layout: post
title: 基于Qinling和OpenStack的FaaS实验
description: 基于Qinling和OpenStack的FaaS实验
category: 技术
---

之前介绍过 openstack 中对 [notification](https://lingxiankong.github.io/2017-07-04-ceilometer-notification.html) 的处理，里面提及将 notification 与 Qinling 结合，可以实现类似于 AWS Lambda 与 S3结合的经典使用[场景](http://docs.aws.amazon.com/lambda/latest/dg/with-s3.html)，今天我就一步一步的将我的实验过程记录下来，以备后用。

本实验的大致流程如下：

- 用户在 qinling 创建 function，function 接收对象存储中的 container 和 object 作为参数，function 做的事情就是简单打印 object 的信息
- 用户在 aodh 中创建 alarm，当收到 swift发来的对象上传成功的通知时，执行用户定义的 qinling function
- 用户向 swift 中上传 object
- 当 object 上传成功后，用户的 function 被自动触发

## 环境准备
本实验是在一个 devstack 环境中完成，我使用的 local.conf 文件内容如下：
```ini
[[local|localrc]]
RECLONE=False

enable_plugin qinling https://github.com/openstack/qinling
enable_plugin ceilometer https://git.openstack.org/openstack/ceilometer.git
enable_plugin aodh https://git.openstack.org/openstack/aodh

LIBS_FROM_GIT+=python-qinlingclient
DATABASE_PASSWORD=password
ADMIN_PASSWORD=password
SERVICE_PASSWORD=password
SERVICE_TOKEN=password
RABBIT_PASSWORD=password
LOGFILE=$DEST/logs/stack.sh.log
VERBOSE=True
LOG_COLOR=False
SCREEN_LOGDIR=$DEST/logs
LOGFILE=$DEST/logs/stack.sh.log
LOGDAYS=1

ENABLED_SERVICES=rabbit,mysql,key

# Nova
ENABLED_SERVICES+=,n-api,n-cpu,n-cond,n-sch,n-novnc,n-cauth,n-api-meta,placement-api,placement-client

# Glance
ENABLED_SERVICES+=,g-api,g-reg

# Neutron
ENABLED_SERVICES+=,q-svc,q-dhcp,q-meta,q-agt,q-l3

# Ceilometer
CEILOMETER_BACKEND=gnocchi

# enable DVR
Q_PLUGIN=ml2
Q_ML2_TENANT_NETWORK_TYPE=vxlan
Q_DVR_MODE=dvr_snat

# Swift
ENABLED_SERVICES+=,swift
SWIFT_HASH=66a3d6b56c1f479c8b4e70ab5c2000f5
SWIFT_REPLICAS=1

IMAGE_URLS+=",http://download.cirros-cloud.net/0.3.4/cirros-0.3.4-x86_64-disk.img"
```
## 服务配置

### Swift

既然要接收 swift 的 notification，首先 swift 得支持对象上传成功后发送 notification，swift 默认没有这个能力，需要额外的 middleware 的支持。社区中有一个 [CeilometerMiddleware](https://github.com/openstack/ceilometermiddleware)，但该项目基本已停止更新，而且它的功能并不能满足实验需求。所以我对其中的 swift.py 文件做了少许改动，参见[这里](https://github.com/LingxianKong/qinling_utils/blob/master/swift_ceilometermiddleware.py)。

因为在 swift.py 中需要引入 swift 包中的模块，会有命名冲突导致引入失败，所以需要做如下操作：

```bash
rm -f /usr/local/lib/python2.7/dist-packages/ceilometermiddleware/swift.pyc
mv /usr/local/lib/python2.7/dist-packages/ceilometermiddleware/swift.py /usr/local/lib/python2.7/dist-packages/ceilometermiddleware/notify.py
```

使用我修改过的文件内容替换 `/usr/local/lib/python2.7/dist-packages/ceilometermiddleware/notify.py`，然后修改`/etc/swift/proxy-server.conf`，配置 ceilometer middleware：

```ini
[pipeline:main]
pipeline = ... ceilometer proxy-server

[filter:ceilometer]
topic = notifications
driver = messagingv2
url = rabbit://stackrabbit:password@10.0.19.65:5672/
control_exchange = swift
paste.filter_factory = ceilometermiddleware.notify:filter_factory
set log_level = DEBUG
```

重启 swift proxy 服务：

```bash
systemctl restart devstack@s-proxy.service
```

### Ceilometer

ceilometer 中的 notification agent 收到通知后，会先转换成 event，然后 publish 出去，所以要分别配置`event_definitions.yaml`和`event_pipeline.yaml`。

首先在`/etc/ceilometer/event_definitions.yaml`末尾添加如下定义：

```yaml
- event_type: objectstorage.object.upload
  traits: &objectstore_upload
    tenant_id:
      fields: payload.tenant_id
    container:
      fields: payload.container
    object:
      fields: payload.object
```

`/etc/ceilometer/event_pipeline.yaml` 的内容：

```yaml
---
sources:
    - name: event_source
      events:
          - "*"
      sinks:
          - event_sink
sinks:
    - name: event_sink
      transformers:
      publishers:
          - gnocchi://
          - notifier://?topic=alarm.all
```

为了让 ceilometer 支持 notifier，要在`/etc/ceilometer/ceilometer.conf`中配置：

```ini
[publisher_notifier]
event_topic=event
```

重启 notification agent 服务：

```bash
systemctl restart devstack@ceilometer-anotification.service
```

### Aodh

确保 aodh-listener 能够收到来自 ceilometer 的 event，在`/etc/aodh/aodh.conf`中配置：

```bash
[listener]
event_alarm_topic=alarm.all
```

因为需要 aodh 根据用户定义的 alarm 调用 qinling function，所以 aodh  中需要有调用 qinling 的 notifier，代码在[这里](https://github.com/LingxianKong/qinling_utils/blob/master/aodh_qinlingnotifier.py)，将代码拷贝到`/opt/stack/aodh/aodh/notifier/qinling.py`文件中，并在 aodh 的`setup.cfg`中配置：

```ini
aodh.notifier =
	...
    trust+qinling = aodh.notifier.qinling:TrustQinlingFunctionNotifier
```

重新部署 aodh 代码：

```
cd /opt/stack/aodh
pip install -e .
```

重启 aodh 相关服务：

```bash
systemctl restart devstack@aodh-*
systemctl restart apache2.service
```

## all-in-one
前面这么多手工步骤只是为了了解具体的修改细节，为了以后部署方便，我也写了一个简单的脚本：
```bash
rm -f /usr/local/lib/python2.7/dist-packages/ceilometermiddleware/swift.py* /usr/local/lib/python2.7/dist-packages/ceilometermiddleware/notify.py*
curl -s -S -L -o /usr/local/lib/python2.7/dist-packages/ceilometermiddleware/notify.py https://raw.githubusercontent.com/LingxianKong/qinling_utils/master/swift_ceilometermiddleware.py
sed -i '/driver = messaging/c driver = messagingv2' /etc/swift/proxy-server.conf
sed -i '/ceilometermiddleware/c paste.filter_factory = ceilometermiddleware.notify:filter_factory' /etc/swift/proxy-server.conf
systemctl restart devstack@s-proxy.service

cat <<EOF >> /etc/ceilometer/event_definitions.yaml
- event_type: objectstorage.object.upload
  traits: &objectstore_upload
    tenant_id:
      fields: payload.tenant_id
    container:
      fields: payload.container
    object:
      fields: payload.object
EOF
echo '          - notifier://?topic=alarm.all' >> /etc/ceilometer/event_pipeline.yaml
cat <<EOF >> /etc/ceilometer/ceilometer.conf
[publisher_notifier]
event_topic=event
EOF
systemctl restart devstack@ceilometer-anotification.service

cat <<EOF >> /etc/aodh/aodh.conf
[listener]
event_alarm_topic=alarm.all
EOF
curl -s -S -L -o /opt/stack/aodh/aodh/notifier/qinling.py https://raw.githubusercontent.com/LingxianKong/qinling_utils/master/aodh_qinlingnotifier.py
qinling_notifier='    trust+qinling = aodh.notifier.qinling:TrustQinlingFunctionNotifier'
sed -i "/trust+zaqar/ s/.*/&\n${qinling_notifier}/" /opt/stack/aodh/setup.cfg
pushd /opt/stack/aodh
pip install -e .
popd
systemctl restart devstack@aodh-*
systemctl restart apache2.service
```

## 实验步骤

配置好上述服务，具体的实验就很简单了。

```bash
# admin 租户创建 runtime
source openrc admin admin
openstack runtime create python openstackqinling/python-runtime

# demo 用户创建 function
cat <<EOF > ~/test_swift.py
import swiftclient
def stat_object(context, container, object):
    conn = swiftclient.Connection(
        session=context['os_session'],
        os_options={'region_name': 'RegionOne'},
    )
    obj_header = conn.head_object(container, object)
    return obj_header
EOF
openstack function create test_swift $RUNTIME_ID '{"source": "package"}' --entry test_swift.stat_object --file ~/test_swift.py

# demo 用户创建 alarm
aodh alarm create --name swift_alarm --type event --alarm-action trust+qinling://?function_id=$FUNCTION_ID --repeat-actions true --event-type objectstorage.object.*

# demo 用户上传 object
swift --os-auth-url http://10.0.19.65/identity/v3 --os-tenant-name demo --os-username demo --os-password password post lingxian
swift --os-auth-url http://10.0.19.65/identity/v3 --os-tenant-name demo --os-username demo --os-password password upload lingxian tox.ini
```

当 object 上传成功后，demo 用户可以使用 `openstack function execution list` 看到有一个新的 execution，并且可以看到 function 的输出：

```bash
$ openstack function execution list -f yaml
- Created_at: '2017-10-06 02:35:51'
  Description: null
  Function_id: 9be45c32-d12d-40df-97b8-5fbe12bd6f0d
  Id: a62ae49c-2e75-4f67-a850-cce4c34fce7f
  Input: '{"object": "tox.ini", "container": "lingxian"}'
  Output: '{"duration": 0.274, "output": {"content-length": "1783", "x-object-meta-mtime":
    "1506425620.843263", "accept-ranges": "bytes", "last-modified": "Fri, 06 Oct 2017
    02:35:45 GMT", "etag": "61e39be8895062f792989454a78f6b96", "x-timestamp": "1507257344.62552",
    "x-trans-id": "tx88ad4e9e0a3842068edfd-0059d6ec08", "date": "Fri, 06 Oct 2017
    02:35:52 GMT", "content-type": "application/octet-stream", "x-openstack-request-id":
    "tx88ad4e9e0a3842068edfd-0059d6ec08"}}'
  Status: success
  Sync: False
  Updated_at: '2017-10-06 02:35:52'
```

