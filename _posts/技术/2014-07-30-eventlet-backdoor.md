---
layout: post
title: OpenStack中如何获取程序运行时状态
description: OpenStack中如何获取程序运行时状态
category: 技术
---

## eventlet中的backdoor

OpenStack中编程模型中大量使用了GreenThread，使用eventlet库实现，关于eventlet可以参考官方文档。这里单独说一说backdoor的使用。

OpenStack每一个服务在创建时，都会根据backdoor_port配置项决定是否创建backdoor server，允许telnet到服务所在的节点进行调试，主要用于获取某个长时间运行的进程的状态。其原理是这样的：在程序的代码中，专门运行一个协程，这个协程一般不会被调度到，所以不会影响程序的正常运行。这个协程中跑了一个backdoor_server，比如下面的这行代码：

    eventlet.spawn(backdoor.backdoor_server,eventlet.listen(('localhost', 3000)), locals=backdoor_locals)

这里的backdoor_locals是一个字典，key是某个字符串，而value就是对应的方法，在OpenStack中(nova-compute服务)定义如下：

    backdoor_locals = {
        'exit': _dont_use_this,      # So we don't exit the entire process
        'quit': _dont_use_this,      # So we don't exit the entire process
        'fo': _find_objects,
        'pgt': _print_greenthreads,
        'pnt': _print_nativethreads,
    }
    
由于这个是协程，所以我们的backdoor_server完全有能力修改程序中的内存变量。当这个程序运行起来后，通过telnet的方法可以连上这个程序，然后可以通过执行backdoor_locals中指定的方法来控制我们程序的运行行为（比如修改某个内存中变量的值）。

来看一个简单的例子：

    from eventlet import backdoor
    import eventlet
     
    def _funca():
        print "abc"
        return "123"
     
    backdoor_locals = {'funca': _funca}
     
    eventlet.spawn(backdoor.backdoor_server, eventlet.listen(('localhost', 3000)),locals=backdoor_locals)
     
    while True:
        print "aaa"
        eventlet.sleep(1)
     
当这个程序运行后，在另一个终端上执行下面的命令就可以看到对应的结果：
     
    [root@ubuntu ~]# telnet 127.0.0.1 3000
    Trying 127.0.0.1...
    Connected to 127.0.0.1.
    Escape character is '^]'.
    Python 2.6.6 (r266:84292, Sep  4 2013, 07:46:00)
    [GCC 4.4.7 20120313 (Red Hat 4.4.7-3)] on linux2
    Type "help", "copyright", "credits" or "license" for more information.
    (InteractiveConsole)
    >>> funca()
    abc
    '123'
    >>>
    
再看一个修改内存变量，改变程序行为的例子，下面这个例子在backdoor命令中修改全局变量，从而改变主程序的判断条件：

    from eventlet import backdoor
    import eventlet

    _VAR = True
     
    def _change_var():
        global _VAR
        _VAR = False
        print "OK"
     
    backdoor_locals = {'func': _change_var}
     
    eventlet.spawn(backdoor.backdoor_server, eventlet.listen(('localhost', 12223)),locals=backdoor_locals)
     
    while _VAR:
        print "aaa"
        eventlet.sleep(1)    
        
运行程序：

    root@ubuntu:~# python /home/kong/backdoor_test.py
    aaa
    backdoor server listening on 127.0.0.1:12223
    aaa
    aaa 
    ... 

在另一个console内登录主机，telnet连接，并运行func函数：

    root@ubuntu:~# telnet 127.0.0.1 12223
    Trying 127.0.0.1...
    Connected to 127.0.0.1.
    Escape character is '^]'.
    Python 2.7.3 (default, Feb 27 2014, 19:58:35) 
    [GCC 4.6.3] on linux2
    Type "help", "copyright", "credits" or "license" for more information.
    (InteractiveConsole)
    >>> func()
    OK
    >>> Connection closed by foreign host.    
    
你会发现，运行完后，telnet自动断开了，是因为主程序退出，协程也就不存在了。

## Guru Meditation Reports
简称GMR，关于Guru Meditaion，wikipedia上有详细的[解释](http://en.wikipedia.org/wiki/Guru_Meditation)，大致意思就是系统宕机后的提示，比如windows系统出现致命问题后，大家看到的蓝屏。

为什么还需要GMR上呢？上面提到的backdoor有一些使用上的限制：

* 每个需要backdoor的服务都需要预留一个TCP端口号，管理员需要一一记录；
* 一旦服务重启，那么关键信息就会遗失；
* 最后，也是最重要的，每个服务开一个端口，对系统安全性是一种极大的考验，所以backdoor在生产环境基本不会被采用；

关于GMR，我还没有上手测试过，没有过多的发言权。可以参见官方文档和一些老外写的博客：  
<https://wiki.openstack.org/wiki/GuruMeditationReport>  
<http://docs.openstack.org/developer/nova/devref/gmr.html>  
<https://www.berrange.com/posts/2015/02/19/nova-and-its-use-of-olso-incubator-guru-meditation-reports/>
