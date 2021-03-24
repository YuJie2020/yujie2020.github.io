---
layout: post
title: OpenStack中的Oslo.config笔记
description: OpenStack中的Oslo.config笔记
category: 技术
---

其实关于oslo.config的使用，在它代码库的oslo.config.cfg.py文件中有很详细的注释说明。但为了避免每次都去阅读一遍(而且有的用法确实不经常用)，还是有选择的做一下笔记，以便查询使用。这个笔记不是关于oslo.config方法的全集，因为有些东西我认为没必要记录的就略去了。

因为oslo.config用了iniparser和argparse，所以最好是对它们有一些理解和掌握。

术语：  
本篇对于英文中的`options`统一翻译成`配置项`

## 配置项支持的类型
strings, integers, floats, booleans, lists,
'multi strings' and 'key/value pairs' (dictionary)

## 配置项的定义

    def __init__(self, name, type=None, dest=None, short=None,
                 default=None, positional=False, metavar=None, help=None,
                 secret=False, required=False,
                 deprecated_name=None, deprecated_group=None,
                 deprecated_opts=None, sample_default=None):
        """Construct an Opt object.

        The only required parameter is the option's name. However, it is
        common to also supply a default and help string for all options.

        :param name: the option's name
        :param type: the option's type. Must be a callable object that
                     takes string and returns converted and validated value
        :param dest: the name of the corresponding ConfigOpts property
        :param short: a single character CLI option name
        :param default: the default value of the option
        :param positional: True if the option is a positional CLI argument
        :param metavar: the option argument to show in --help
        :param help: an explanation of how the option is used
        :param secret: true iff the value should be obfuscated in log output
        :param required: true iff a value must be supplied for this option
        :param deprecated_name: deprecated name option.  Acts like an alias
        :param deprecated_group: the group containing a deprecated alias
        :param deprecated_opts: array of DeprecatedOpt(s)
        :param sample_default: a default string for sample config files

## 如何在其他project中使用oslo.config
配置项操作涉及‘定义’和‘指定’，‘定义’是指说明系统可以使用哪些配置项，一般是在模块开头处进行定义和注册；‘指定’就是确认配置项实际的值，一般是在配置文件或命令行中指定，后出现/解析的值会覆盖前面的值。

只有通过`register_cli_opt`注册的配置项才能通过命令行指定。

这里需要考虑一种特殊情况，我们需要解析配置文件获取配置项的值，但配置文件的位置在哪？要通过命令行指定，因此默认情况下，oslo自己注册了两个命令行配置项`--config-file`和`--config-dir`，这样在程序运行时，就可以直接解析命令行中的配置文件路径，进而解析配置文件中的配置项的值。

在其他project中使用oslo.config的用法如下：

    from oslo.config import cfg

    opts = [
        cfg.StrOpt('bind_host', default='0.0.0.0'),
        cfg.IntOpt('bind_port', default=9292),
    ]

    CONF = cfg.CONF
    CONF.register_opts(opts)

    def start(server, app):
        server.start(app, CONF.bind_port, CONF.bind_host)
        
开始解析（配置文件和命令行）是通过`CONF(sys.argv[1:])`完成。

## 配置项定义的特殊用法
不做解释，直接看示例即可：

    opts = [
        cfg.StrOpt('state_path',
                   default=os.path.join(os.path.dirname(__file__), '../'),
                   help='Top-level directory for maintaining nova state.'),
        cfg.StrOpt('sqlite_db',
                   default='nova.sqlite',
                   help='File name for SQLite.'),
        cfg.StrOpt('sql_connection',
                   default='sqlite:///$state_path/$sqlite_db',
                   help='Connection string for SQL database.'),
        cfg.StrOpt('service_name', required=True),
        cfg.StrOpt('s3_store_access_key', secret=True),
    ]

## Sub-Parsers
其实Sub-Parsers是argparser中的概念，可以参见argparser的官方文档或我之前的[一篇博客](http://lingxiankong.github.io/blog/2014/01/14/command-line-parser/)做一些了解。oslo.config中使用`SubCommandOpt`实现Sub-Parsers。

    >>> def add_parsers(subparsers):
    ...     list_action = subparsers.add_parser('list')
    ...     list_action.add_argument('id')
    ...
    >>> conf = ConfigOpts()
    >>> conf.register_cli_opt(SubCommandOpt('action', handler=add_parsers))
    True
    >>> conf(args=['list', '10'])
    >>> conf.action.name, conf.action.id
    ('list', '10')
    
## 以Rally为例
rally最开始的使用仅限于命令行，现在在慢慢做成服务。也就是说，之前通过命令行使用时，每一次执行都会进行解析操作，效率是非常低的，所以现在在做成服务。

如果你自己用Python想写一个命令行程序，程序依赖于配置文件，程序提供多层次命令，你不用再费劲使用iniparser和argparser自己组装，oslo.config和rally无疑提供了一个很好的模板。

    from oslo.config import cfg
    CONF = cfg.CONF
    
    categories = {
        'deployment': deployment.DeploymentCommands,
        'info': info.InfoCommands,
        'show': show.ShowCommands,
        'task': task.TaskCommands,
        'use': use.UseCommands,
        'verify': verify.VerifyCommands
    }
    parser = lambda subparsers: _add_command_parsers(categories, subparsers)
category: 技术
                                     title='Command categories',
                                     help='Available categories',
                                     handler=parser)
                                     
category: 技术
    cfg.CONF(argv[1:], project='rally', version=version.version_string())
    
category: 技术
