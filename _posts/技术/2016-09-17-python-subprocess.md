---
layout:     post
title:      Python子进程
category: 技术
description: Python子进程
---

## 简介
提起Python的子进程，那么第一个想到的肯定是subprocess，官方文档参见<https://docs.python.org/2/library/subprocess.html>，有几点需要注意：

- args可以是string也可以是一个列表，推荐列表的形式，因为可以很好的处理特殊符号转换的问题，比如带空格的文件名。如果使用string并且包含参数，一般也会设置shell=True，官方不推荐shell=True的用法是担心潜在的安全问题。
- 简单的场景使用`subprocess.call`, `subprocess.check_call`, `subprocess.check_output`即可，它们本质上的实现是一样的。
- 复杂场景创建subprocess.Popen对象，调用对象的方法（比如communicate）。

但如果要在Python代码中想执行另一份Python代码（以创建新进程的方式），首先要解决的问题就是如何安全的执行Python代码？假如另一份Python代码是用户提供的，那么它可能是个死循环，可能会死锁，也可能会有内存泄露，如何避免你自己的程序不被这些因素影响？

## subprocess和resource
好在Python提供了另一个有用的库：[resource](https://docs.python.org/3/library/resource.html#resource.getrusage)，可以查询并设置进程可以使用的系统资源，[这里](https://pymotw.com/2/resource/)有一些简单的例子，可以根据你的实际情况来设置resource的那些常量。

有了subprocess和resource，就可以安全的执行用户程序了。首先subprocess创建新的进程，在新的进程代码中用resource限制进程能使用的资源。那可能会有人问一个问题：我怎么能要求用户在他们自己的程序中使用resource做限制呢？

答：这里就需要使用嵌套的方式来执行用户的程序。

好消息是，你不必重新写一套这样的代码，OpenStack中的oslo.concurrency库已经为你做好了一切，参见<https://github.com/openstack/oslo.concurrency>。你需要做的就是import然后调用execute函数。

## 示例
我这里有一个示例程序，假设`my_test.py`是用户提供的代码文件，我这里仅设置了对CPU时间、内存大小、打开文件数目和新建进程数目进行限制：

    import resource
    import shlex

    from oslo_concurrency import processutils
    from oslo_utils import units


    # Print some info of current process resource limit.
    for name, desc in [
        ('RLIMIT_CORE', 'core file size'),
        ('RLIMIT_CPU',  'CPU time'),
        ('RLIMIT_FSIZE', 'file size'),
        ('RLIMIT_DATA', 'heap size'),
        ('RLIMIT_STACK', 'stack size'),
        ('RLIMIT_RSS', 'resident set size'),
        ('RLIMIT_NPROC', 'number of processes'),
        ('RLIMIT_NOFILE', 'number of open files'),
        ('RLIMIT_MEMLOCK', 'lockable memory address'),
        ]:
        limit_num = getattr(resource, name)
        soft, hard = resource.getrlimit(limit_num)
        print 'Maximum %-25s (%-15s) : %20s %20s' % (desc, name, soft, hard)

    cmd = 'python /Users/konglingxian/my_test.py'
    prlimit = processutils.ProcessLimits(
        cpu_time=300,
        address_space=1 * units.Gi,
        number_files=10,
        number_processes=5,
    )

    stdout, stderr = processutils.execute(
        *(shlex.split(cmd)),
        check_exit_code=True,
        prlimit=prlimit
    )

    print stdout
    print stderr

## 陷阱
在同时使用oslo.service, eventlet和subprocess的过程中，我发现程序会在Popen对象的communicate方法处挂起，而上述的示例却运行良好。经过大量的搜索、实验以及阅读源代码，最终找到了问题原因。

问题的触发可以参考这个程序：<https://gist.github.com/neuroid/5d42760310f7af843150>  
问题的简单分析参见：<https://github.com/gevent/gevent/issues/452>

简单的说，如果主进程使用了oslo.service启动服务，而olso.service中会通过waitpid()接收当前进程组的所有子进程的返回码，正是这个操作导致Popen对象的communicate方法拿不到返回值而一直等待。

## 解决方法
解决方法其实也很简单（说着简单，但确实花了我很长时间研究），因为waitpid只会检索当前进程所在进程组的那些进程，对于其他进程组的进程没有影响，所以如果能把使用subprocess创建的子进程放进其他进程组，问题就迎刃而解了。在Linux中，setsid就是解决这个问题的。只需修改上述代码为：

    stdout, stderr = processutils.execute(
        *(shlex.split(cmd)),
        check_exit_code=True,
        prlimit=prlimit,
        preexec_fn=os.setsid
    )

## 参考链接
<https://pymotw.com/2/subprocess/#process-groups-sessions>