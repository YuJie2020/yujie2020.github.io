---
layout: post
title: DevOps--在本地执行远程命令
description: 为了赶时髦，我也使用了DevOps这个词儿
category: 技术
---

## ssh
在本地使用 `ssh $RemoteNode <cmd>` 可以在执行远程机器上的命令，例如 `ssh user@node ls /local` 会执行远程机器上的 ls /local 命令，如果想在远程机器上连续执行多条命令，可以用单引号或者双引号将这些命令括起来。
 
如果想在本地启动远程机器上的命令后就返回，可以这样：  
 `ssh user@node "/local/x.sh  >/dev/null  2>&1"`

## pssh
> PSSH provides parallel versions of OpenSSH and related tools. Included are pssh, pscp, prsync, pnuke, and pslurp. The project includes psshlib which can be used within custom applications. The source code is written in Python.

[PSSH][]下载地址：<https://parallel-ssh.googlecode.com/files/pssh-2.3.1.tar.gz>  
使用python编写，使用setup.py正常安装。

[PSSH][]总是通过清单文件指定主机，其中的每行采用 [user@]host[:port] 形式。其主要功能是在多个主机上并行地运行命令。  
`# pssh -P -h /home/server.txt hostname`  
在默认情况下，每个命令实例的输出出现在 stdout 中，输出划分为每个主机一段。但是，可以指定一个目录来捕捉每个实例的输出。例如，如果运行前面的命令并添加 `--outdir=/opt/output/`，那么会把每个主机的命令输出捕捉到/opt/output/ 中单独的文件中

pssh可以生成最多 32 个进程，并行地连接各个节点。如果远程命令在 60 秒内没有完成，连接会终止。如果命令需要更多处理时间，可以使用 -t 设置更长的到期时间。（parallel-scp 和 parallel-rsync 没有默认的到期时间，但是可以用 -t 指定到期时间。）

pssh的参数解释：  
-h 执行命令的远程主机列表  
-l 远程机器的用户名  
-P 执行时输出执行信息  
-p 一次最大允许多少连接  
-o 输出内容重定向到一个文件  
-e 执行错误重定向到一个文件  
-t 设置命令执行的超时时间  
-A 提示输入密码并且把密码传递给ssh  
-O 设置ssh参数的具体配置，参照ssh_config配置文件  
-x 传递多个SSH 命令，多个命令用空格分开，用引号括起来  
-X 同-x 但是一次只能传递一个命令  
-i 显示标准输出和标准错误在每台host执行完毕后  

顺带说一下其他tools：  
pscp--把文件或者目录并行地复制到多个主机上  
`# pscp -h /home/server.txt /home/old_file /opt/new_file`  
`# pscp --recursive -h /home/server.txt /srv/old_dir /opt`  

pslurp--把文件或者目录并行地从多个远程主机复制到中心主机上  
`# pslurp --recursive -h /home/server.txt -L /srv/test/ /srv llll`  
`-L`指定在本地创建子目录的位置  
`llll`为拷贝到本地后的目录名

pnuke--并行地在多个远程主机上杀死进程  

prsync--使用rsync协议从本地计算机同步到远程主机

## Fabric
[fabric][]是一个python命令行工具，通过ssh来部署应用或者完成常规运维任务，安装后，通过fab命令指定fabfile.py文件（当然可以指定为其他文件）中的任务函数。[fabric][]的牛逼之处在于**它能很灵活的为不同的任务配置不同的执行机**，这是ssh或pssh很难自动做到的。网上有很多现成的[fabric][]的教程，我这里就不细讲。列一些我认为比较重要或比较有特色的特性。  
> 安装fabric需要：fabric paramiko pycrypto ecdsa。  
> 据说Instagram就使用Fabric管理上百台服务器的应用部署。详情参见：  
<http://instagram-engineering.tumblr.com/post/13649370142/what-powers-instagram-hundreds-of-instances-dozens-of>

* 支持IPv6主机网络
* 支持任务的并发执行（`--pool-size --parallel`，默认是线性执行），支持不同的任务在不同的主机上执行（`fab mytask:hosts="host1;host2"`--优先级最高或`@hosts('host1', 'host2')`--优先级次高），支持有些任务并行执行、某些任务线性执行。
* 支持主机角色（env.roledefs），也就是定义一组主机，可以嵌套。支持执行任务时从角色中排除主机
* 支持动态指定主机，`execute`
* 主机连接的自管理，即在任务执行后自动关闭连接，仅限于使用fab命令行时
* 同时提供了命令行和编程接口

指定主机的几种方式：  

    fab -H host1,host2 func
    fab func:hosts="host1;host2"
    fab -R role1 -x host2,host5 func
    fab func:roles=role1,exclude_hosts="host2;host5"
    env.hosts=['host1', 'host2']
    @hosts('host1', 'host2'), roles同理

使用execute可以不必在命令行中指定多个task，如下，migrate和update是两个task

    from fabric.api import run, roles, execute
    def deploy():
        execute(migrate)
        execute(update)

同时，execute可以接受hosts参数，这样可以**动态确定hosts**，这对自动化意义重大，一个例子：

    from fabric.api import run, execute, task
    # For example, code talking to an HTTP API, or a database, or ...
    from mylib import external_datastore
    # This is the actual algorithm involved. It does not care about host
    # lists at all.
    def do_work():
        run("something interesting on a host")
    # This is the user-facing task invoked on the command line.
    @task
    def deploy(lookup_param):
        # This is the magic you don't get with @hosts or @roles.
        # Even lazy-loading roles require you to declare available roles
        # beforehand. Here, the sky is the limit.
        host_list = external_datastore.query(lookup_param)
        # Put this dynamically generated host list together with the work to be
        # done.
        execute(do_work, hosts=host_list)

命令行中执行：fab deploy:db

execute为编程使用Fabric提供了便利，但要注意调用连接的关闭接口（`from fabric.network import disconnect_all`）。可以从`fabric/main.py`中找到其他注意事项。 

快速执行任务(以run的方式，类似于Ansible的ad-hoc方式)：`fab -H system1,system2,system3 -- uname -a` 

命令行的使用 ：  
<http://docs.fabfile.org/en/1.8/usage/fab.html>

## Ansible
(2014.11.25)  
Ansible是这几个工具中我最后才开始了解的。看了网上大家的评论，有一个哥们的总结让我决定学习一下这个工具。文章中写道：

* 充分利用现有设施。使用 Ansible 无需安装服务端和客户端，只要 SSH 即可。这意味着，任何一台装有 Ansible 的机器都可以成为强大的管理端。这种去中心化的思路显得更为灵活。可能有人会担心 SSH 的效率，Ansible 的并行执行及加速模式或许可以打消你的顾虑。
* 使用简单，快速上手相当容易。我在用 Puppet 之前，就没少花时间钻研它。想想吧，我们使用这类自动化管理工具不就是想把自己从重复的、复杂的事情中解放出来么？为了简化一件事，而沉入另一件复杂的事，是不是有些不划算？从我的体验来看，Ansible 上手十分快，用 Ad-Hoc 可以应付简单的管理任务，麻烦点的也可以定义 Playbook 文件来搞定。
* 采用人类易读的格式。Ansible 的主机定义文件使用 INI 格式，支持分组，能够指定模式；此外也能动态生成，这对管理云主机应当很有用。而 Playbook 则是 YAML 格式， 我觉得它比 Puppet 的 DSL 要易读易写多了。
* 能够使用你熟悉的语言来编写模块。虽然 Ansible 是使用 Python 开发的，但它不会将你限制到某种具体的编程语言，Bash、Python、Perl、Ruby 等等都可以，你擅长什么就用什么。
* 榜样的力量是无穷的。Fedora、Rackspace、Evernote 都在使用Ansible。

文章链接：<https://linuxtoy.org/archives/hands-on-with-ansible.html>

我的理解，Ansible与Fabric一样，都是基于ssh（确切的说是基于paramiko），而且都是Python实现，支持主机角色/分组，但Ansible的Playbook乍看起来，不像使用Fabric自定义Python函数那样顺畅，还是有很多语法。

Ansible的精髓在与它有丰富的模块可以使用。

一个例子热热身：

	# deploy-blog-simple.yml
	---
	- hosts: local  # hosts中指定
	  remote_user: kong  # 如果和当前用户一样，则无需指定
	  tasks:
	    - name: check out django_blog
	      git: dest=~/demos/django_selfblog repo=https://github.com/the5fire/django_selfblog
	           update=yes
	    - name: make virtualenv
	      shell: 'virtualenv ~/demos'
	    - name: install requirements
	      pip: requirements=~/demos/django_selfblog/requirements.txt
	           virtualenv=~/demos
	    - name: init database
	      shell: . ./bin/activate && cd django_selfblog/selfblog && ./init_database.sh chdir=~/demos
	    - name: run manage.py
	      shell: . ./bin/activate && cd django_selfblog/selfblog &&  ./run.sh chdir=~/demos

更多的例子参见[这里](https://github.com/ansible/ansible-examples)。

[fabric]: http://docs.fabfile.org/
[PSSH]: https://code.google.com/p/parallel-ssh/