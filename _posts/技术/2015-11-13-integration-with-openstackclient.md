---
layout: post
title: python-mistralclient与python-openstackclient的集成
description: python-mistralclient与python-openstackclient的集成
category: 技术
---

更新：

- 2018.01，基于最新的 osc-lib 和 python-openstackclient

目标：将mistral CLI client与官方openstack client集成，bp 链接在[这里](https://blueprints.launchpad.net/mistral/+spec/mistral-osc-plugin)，review 在[这里](https://review.openstack.org/245034)。

## 还是需要 python-openstackclient

首先，openstack client是用[cliff](http://docs.openstack.org/developer/cliff/)实现，所以建议先熟读cliff的官方文档，知道cliff的实现机制，这样才能对openstack client的机制有了解，这是熟悉openstack client的基础。如果你不是为了实现 openstack 命令，可以跳过此文直接参考 cliff 给出的一个[示例](https://docs.openstack.org/cliff/latest/user/demoapp.html)照猫画虎即可。

cliff 中 App 初始化时，初始化参数 `command_manager=CommandManager('cliff.demo')` 告诉你，命令都在 setup.cfg 中的 `cliff.demo` 命名空间中定义。

从OSC 2.4.0版本以后，从openstack client又提取出一个叫osc-lib的可重用的库，新的plugin可以继承这个osc-lib来集成openstack命令，但是plugin的加载还是由openstack client来完成。从设计层次上讲，osc-lib继承自cliff，而openstack client和其他的extension其实是平级结构，都继承自osc-lib，只是由openstack client入口而已。

> 所以，你自己的 CLI 命令要生效，还需要依赖 python-openstackclient，因为 CLI 中的 openstack 命令是安装完 python-openstackclient 后才有。

## python-openstackclient 都做了什么

入口在 `openstackclient.shell:main`

OpenStackShell 类最终继承自 cliff 中的 App。python-openstackclient 的实现之所以复杂，是因为它除了扮演 CLI 总入口的责任外，还需要为其他 plugin 提供支持，承担一些公共事务（比如 keystone 鉴权），让 plugin 只需要关注自己的业务实现。

所以，当你在 CLI 下每次执行 openstack 命令时，python-openstackclient 都会动态的[加载](https://github.com/openstack/python-openstackclient/blob/cc47c075a067e3f4f3bb80dd933cdd4d483b8105/openstackclient/common/clientmanager.py#L131)系统中所有已注册的 plugin，根据约定好的规则，获取它们的名字，版本，命令行参数等，并把这些 plugin module 注册到 osc-lib 的 clientmanager.ClientManager 类中，属性名由 `API_NAME` 定义，属性的值是一个[描述符对象](https://lingxiankong.github.io/2014-03-28-python-descriptor.html)，被访问时会获取函数 `def make_client(instance)` 的返回值，其中的 instance 就是一个 clientmanager.ClientManager 实例。

在 `initialize_app` 函数执行时，命令行参数已经经过解析。此时，除了 OpenStackShell 初始化时 command_manager 参数指定的命名空间，在这里还有机会再注册其他命令。各个 openstack plugin 命令就是在此时注册。

在 `prepare_to_run_command` 函数中主要是实例化 clientmanager.ClientManager，如果 `command.auth_required = True` 则进行鉴权操作，因为大家在使用命令行时，同样的两个命令，传递的鉴权信息会不一样，因此必须在每个命令执行前进行鉴权。所以 ClientManager 对象保存了鉴权信息。

通过openstack client工程的setup.cfg可以看出，openstack client默认集成了Nova, Keystone, Glance, Neutron, Swift, Cinder这6个项目（在openstack.cli.base命名空间中），同时，从setup.cfg中也可以看到，openstack client有两个全局的命令，分别是openstack command list和openstack module list（在openstack.cli命名空间中），用以查询加载的模块和支持的命令列表。

最终，在command处理时，比如命令行：openstack compute agent list，会调用`self.app.client_manager.compute.agents.list`处理。还记得那个ClientManager类变量么？compute就是类变量之一，当访问clientmanager.compute时，就会调用openstackclient.compute.client提供的`make_client`方法，传入clientmanager对象。

## 你的 client 需要做什么

根据上述的过程，python-openstackclient 把该做的都做了，你只需要按照约定填空即可。

1. setup.cfg
   你需要定义：

   ```python
   openstack.cli.extension =
       runit = mycli.osc.plugin
   openstack.runit.v1 =
       runit_echo = mycli.echo:Echo
   ```

   让 python-openstackclient 找到你的 plugin 定义。

2. 在 `mycli/osc/plugin.py` 文件中，按照[这里](https://github.com/openstack/python-openstackclient/blob/cc47c075a067e3f4f3bb80dd933cdd4d483b8105/openstackclient/shell.py#L68)的代码流程定义一些变量。比如：

   - `API_NAME`，你的 plugin 名字，比如 runit
   - `API_VERSION_OPTION`，比如 `os_runit_version`
   - `DEFAULT_API_VERSION`，比如 1，这个变量最好定义，否则你的 command 不会生效。最终，根据字符串拼接会注册命名空间 `openstack.runit.v1` 下的 commands

3. 如果 runit 这个程序不是一个 openstack service client，就没有必要实现 `make_client` 方法。

4. 在 `mycli/echo.py` 文件中：

   ```python
   from osc_lib.command import command


   class Echo(command.Command):
       auth_required = False

       def get_parser(self, prog_name):
           parser = super(Echo, self).get_parser(prog_name)
           parser.add_argument(
               '-m', '--message', default='Hello, World!', help='Echo message.'
           )
           return parser

       def take_action(self, parsed_args):
           print(parsed_args.message)
   ```

5. 安装和试用。

   ```shell
   $ mkvirtualenv openstack
   $ cd ~/code/python-cliclient
   $ pip install -e .
   $ openstack runit echo
   Hello, World!
   ```


你可以在[这里](https://github.com/LingxianKong/python-cliclient)找到相关的示例代码。