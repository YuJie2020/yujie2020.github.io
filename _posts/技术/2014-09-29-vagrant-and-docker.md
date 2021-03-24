---
layout: post
title: 浅析vagrant和docker
description: 浅析vagrant和docker
category: 技术
---

什么是 vagrant ? Vagrant 是一个跨平台的虚拟机构建工具，能够通过 vagrantfile 描述虚拟机并将其部署到 hypervisor 上（VirtualBox, VMWare, AWS, etc）。

什么是 docker ? Docker 是一个 linux 上的 linux container 构建工具，能够通过 dockerfile 来定义一个 container ，并将其部署到任何运行 docker 的主机上。

Vagrant 和 docker 都能够通过一个配置描述文件来构造一个运行环境。

再来看 vagrant 和 docker 的一些差异：  
![](/images/2014-09-29-vagrant-docker/1.png)

docker其他的优势：

* 轻量级的隔离环境比虚拟机能够更方便和快捷地启动和停止；
* 可以在一个虚拟机中运行多个 container，从而节省开销；
* Docker 的 container 机制更适合一些持续集成/持续发布和微型 PaaS 场景。

正是因为两者相比差异颇多，具体用哪一个需要结合特定的使用场景，不能一概而论。但虚拟化爱好者似乎不愿意看到两个宝贝争的你死我活，于是一些人将两者的优势结合，想了一种同时使用两者的使用场景。一个典型场景如下（摘自[这里](https://medium.com/@_marcos_otero/docker-vs-vagrant-582135beb623)）：

* Install a Vagrant virtual machine in your computer containing the same OS you will have in your server ( normally Ubuntu Linux 12.04 LTS 64 bits). This means that you can program in any OS you want and still expect your program will run in your server.
* Install your Docker packages to create Docker containers inside your virtual machine created for Vagrant. This step is better if you can install them through an script.
* Inside your containers put your applications ( Nginx, Memcached, MongoDB, etc)
* Configure a shell script, Puppet or Chef script to install Docker and run your Docker containers each time Vagrant begins.
* Test your containers in your Vagrant VM inside your computer.
* Thanks to providers now you can take the same file ( your Vagrant file ) and just type vagrant up —provider=“provider” where the provider is your next host and Vagrant will take care of everything. For example, if you choose AWS then Vagrant will: Connect to your AMI in AWS, install the same OS you used in your computer, install Docker, launch your Docker containers and give you a ssh session.
* Test your containers in AWS and look that they behave exactly as you expect.

有人在KVM上的OpenStack以及Docker和LXC进行了基准测试，发现Docker的性能或者比KVM出众很多或者可以与KVM相媲美。测试结果让他认为今后传统的虚拟机将会被边缘化。尽管某些企业可能会使用Docker取代现有的虚拟化技术，但更可能出现的情况是像上面的场景一样，企业将会使用Docker来扩大现有的虚拟化规模。例如，企业可能会同时运行Docker和Vmware环境，或者在VMware 虚拟机内部署Docker容器来确保管理的一致性。企业对Docker的敏捷性感兴趣，但真正感兴趣的是压缩数据中心的规模并减少许可费用。所以，在单个虚拟机内可以运行10个Linux容器，如果你有10台虚拟机，那么现在就拥有了100个容器。

但Docker以及容器的健壮性是其缺陷，尤其是在异构企业环境中更是如此。Docker开销低以及存储占用空间少源于其并没有为所有被封装的应用提供操作系统副本。然而这使得Docker仅限于支持LXC的Linux实例，换句话说，如果你想使用Docker封装Windows应用，那只能说声抱歉了。传统的虚拟化还提供了一些引人注目的用例，比如LXC所不支持的实例，以及虚拟机需要使用与该物理主机上其他虚拟机完全不同的内核设置。所以说尽管Docker性能不错、易于使用而且在很大程度上是免费的，但并不适合所有用户。

看完了大概的特性差异对比，我们来实践一下两者的使用。这里我以使用OpenStack为例，因为每个参与OpenStack的开发者都需要一套开发环境devstack，那么对于开发环境的分发就可以基于vagrant或docker去实现。

## vagrant下安装devstack

### 安装vagrant
vagrant的几个概念：  
box： 基础镜像，类似于编程中的类；  
project：使用镜像创建出的VM，类似于基于类创建对象；  
同一个box可以被不同的project使用。

因为我们使用virtualBox作为vagrant的虚拟化实现工具（你也可以使用vmware），所以要先安装 virtualBox，参考文档见[这里](https://help.ubuntu.com/community/VirtualBox/Installation)和[这里](https://virtualbox.org/wiki/Linux_Downloads)。

    sudo sh -c "echo 'deb http://download.virtualbox.org/virtualbox/debian '$(lsb_release -cs)' contrib non-free' > /etc/apt/sources.list.d/virtualbox.list" && wget -q http://download.virtualbox.org/virtualbox/debian/oracle_vbox.asc -O- | sudo apt-key add - && sudo apt-get update && sudo apt-get install virtualbox-4.3 dkms

当然，你也可以直接下载virtualbox的deb包，使用如下跟vagrant一样的方式安装。

下载 ubuntu下的vagrant deb包（链接：<http://www.vagrantup.com/downloads>），放在某一目录下（比如`/var/kong/vagrant_1.6.5_x86_64.deb`）， 然后进行安装。   
![](/images/2014-09-29-vagrant-docker/2.png)

安装vagrant插件（可选）   
![](/images/2014-09-29-vagrant-docker/3.png)

### Vagrant的基本使用
同docker hub一样，vagrant也有box库：<http://www.vagrantbox.es/>

配置vagrant vm启动时运行脚本：  

	Vagrant.configure("2") do |config|
	  config.vm.box = "hashicorp/precise32"
	  config.vm.provision :shell, path: "bootstrap.sh"
	end

如果修改了Vagrantfile，对于正在运行的vm，可以使用vagrant reload --provision使配置生效。

配置虚拟机hostname：config.vm.hostname = "ubuntu"  
显示GUI窗口：在config.vm.provider中配置vb.gui = true

#### vagrant网络
[端口转发](https://docs.vagrantup.com/v2/networking/forwarded_ports.html)，如下是一个简单例子，后面的`auto_correct`是让vagrant自动修正冲突的port forwarding配置：  

	Vagrant.configure("2") do |config|
	  config.vm.box = "hashicorp/precise32"
	  config.vm.provision :shell, path: "bootstrap.sh"
	  config.vm.network :forwarded_port, host: 4567, guest: 80, auto_correct: true
	end

使用private network：  
1、使用DHCP

	Vagrant.configure("2") do |config|
	  config.vm.network "private_network", type: "dhcp"
	end

2、STATIC IP

	Vagrant.configure("2") do |config|
	  config.vm.network "private_network", ip: "192.168.50.4"
	end

使用[public network](https://docs.vagrantup.com/v2/networking/public_network.html)：  

> 注意，public network未来可能会被`:bridged`代替

1、使用DHCP：

	Vagrant.configure("2") do |config|
	  config.vm.network "public_network"
	end

2、使用static ip  
`config.vm.network "public_network", ip: "192.168.0.17"`

#### 多实例管理

	Vagrant.configure("2") do |config|
	  config.vm.provision "shell", inline: "echo Hello"
	
	  config.vm.define "web" do |web|
	    web.vm.box = "apache"
	  end
	
	  config.vm.define "db" do |db|
	    db.vm.box = "mysql"
	  end
	end

此时要登录某一台VM，`vagrant ssh <name>`，批量操作命令支持正则，`vagrant up /follower[0-9]/`

`primary: true`：指定主VM，用于如果命令显式指定VM name时。  
`autostart: false`：指定某台VM不自动随vagrant up启动。

#### SSH
使用`vagrant ssh-config`查看vagrant对ssh的配置。

    root@ubuntu:/opt/kong/vagrant/ubuntu01# vagrant ssh-config
    Host default
      HostName 127.0.0.1
      User vagrant
      Port 2200
      UserKnownHostsFile /dev/null
      StrictHostKeyChecking no
      PasswordAuthentication no
      IdentityFile /root/.vagrant.d/insecure_private_key
      IdentitiesOnly yes
      LogLevel FATAL

然后就可以直接ssh而不用vagrant ssh登录VM：

    ssh vagrant@127.0.0.1 -p 2200 -i /root/.vagrant.d/insecure_private_key

之前我一直尝试从远程主机ssh到vagrant虚拟机（并不是每个人都有权限登录到vagrant所在的host），但都失败了。于是我在网上看到这么一句解释：Since v1.2.3 Vagrant port forwarding by default binds with 127.0.0.1 so only local connections are allowed.

又经过一番搜索和尝试，终于找到一个方法，如下：  
1、在Vagrantfile文件中配置：`config.vm.network :forwarded_port, guest: 22, host: 2222, host_ip: "0.0.0.0", id: "ssh", auto_correct: true`  
2、把虚拟机的私钥文件复制到远程主机，配置ssh客户端（我的是xShell）使用私钥登录。

#### FAQ
1、我曾经遇到一个问题，重启了某个VM，但一直卡在下面的步骤：

    ==> default: Waiting for machine to boot. This may take a few minutes...
        default: SSH address: 127.0.0.1:2222
        default: SSH username: vagrant
        default: SSH auth method: private key
        default: Warning: Connection timeout. Retrying...
        default: Warning: Connection timeout. Retrying...
      
在stackoverflow上找到的答案是，虚拟机的启动需要键盘输入才能继续，执行：

    vboxmanage controlvm <虚拟机名称> keyboardputscancode 1c

### 安装ubuntu
在/var/vagrant目录下clone vagrant安装devstack的工程，链接：<https://git.openstack.org/openstack-dev/devstack-vagrant>

但这个工程需要设置一些东西，想了想，还是自己一步一步在vagrant虚拟机里安装devstack吧。

    root@ubuntu:/var/openstack# mkdir /var/vagrant/devstack
    root@ubuntu:/var/openstack# cd /var/vagrant/devstack
    root@ubuntu:/var/vagrant/devstack# vagrant init
    A `Vagrantfile` has been placed in this directory. You are now
    ready to `vagrant up` your first virtual environment! Please read
    the comments in the Vagrantfile as well as documentation on
    `vagrantup.com` for more information on using Vagrant.
    root@ubuntu:/var/vagrant/devstack# ll
    total 16
    drwxr-xr-x 2 root root 4096 Sep 30 09:33 ./
    drwxr-xr-x 4 root root 4096 Sep 30 09:33 ../
    -rw-r--r-- 1 root root 4814 Sep 30 09:33 Vagrantfile

下载ubuntu vagrant box，地址：<http://files.vagrantup.com/precise64.box>，下载precise64.box文件，放在某个目录下（我这里是/var/kong），其他box在[这里](http://www.vagrantbox.es/)可以找到。

    vagrant box add Ubuntu1204 /var/kong/precise64.box 

命令运行之后，可以在`~/.vagrant.d/boxes/`目录下看到新增的box(也可以通过vagrant box list确认)。之后，编辑/var/vagrant/devstack目录下的Vagrantfile：

    config.vm.box = "Ubuntu12.04x64"
    config.vm.network "private_network", ip: "192.168.33.10"
    config.vm.provider "virtualbox" do |vb|
      vb.customize ["modifyvm", :id, "--memory", "8192"]
      vb.customize ["modifyvm", :id, "--cpus", "2"]
    end

启动vagrant虚拟机。  
![](/images/2014-09-29-vagrant-docker/4.png)

> 当使用ubuntu 1404时，在挂载共享目录时失败，提示“Failed to mount folders in Linux guest. This is usually because the "vboxsf" file system is not available...”，在网上找到的解决方法是在Vagrantfile添加：config.vm.synced_folder ".", "/vagrant", type: "rsync"，但该方法只能保证挂载不出错，共享目录无法实现实时同步。暂时没有找到更好的方法，所以，最好还是老老实实使用ubuntu 1204吧, :(

> (2015.02.02更新)解决了！最好还是把vagrant更新一下，然后vagrant plugin install vagrant-vbguest  

> (2015.11.15更新)，妈的，上个命令在国内有时会因为网络问题而失败。在网上找到手动方式解决，原帖在[这里](http://segmentfault.com/a/1190000002645737)。首先根据你的virtualbox版本（vboxmanage --version），到http://download.virtualbox.org/virtualbox/上下载对应的VBoxGuestAdditions.iso文件，先将虚拟机停止（vagrant halt），使用virtualbox GUI给虚拟机添加光驱，挂载VBoxGuestAdditions.iso文件，启动虚拟机，在虚拟机里面执行`mount /dev/sr1 /media/cdrom`（这里因为我使用的是第二块CDROM设备，所以是sr1），然后`sh /media/cdrom/VBoxLinuxAdditions.run --nox11`。亲测可用。

虚拟机启动后，可以通过virtualBox命令验证：

    root@ubuntu:/var/vagrant/devstack# vboxmanage list runningvms
    "devstack_default_1412056881390_39322" {c3f2fecc-1316-4823-b870-659dccc4e251}

也可以查询更详细的信息(just snippet)：

    root@ubuntu:/var/vagrant/devstack# vboxmanage showvminfo c3f2fecc-1316-4823-b870-659dccc4e251
    Name:            devstack_default_1412056881390_39322
    Groups:          /
    Guest OS:        Ubuntu (64 bit)
    UUID:            c3f2fecc-1316-4823-b870-659dccc4e251
    Config file:     /root/VirtualBox VMs/devstack_default_1412056881390_39322/devstack_default_1412056881390_39322.vbox
    Snapshot folder: /root/VirtualBox VMs/devstack_default_1412056881390_39322/Snapshots
    Log folder:      /root/VirtualBox VMs/devstack_default_1412056881390_39322/Logs
    Hardware UUID:   c3f2fecc-1316-4823-b870-659dccc4e251
    Memory size:     8192MB
    Page Fusion:     off
    VRAM size:       8MB
    CPU exec cap:    100%
    HPET:            off
    Chipset:         piix3
    Firmware:        BIOS
    Number of CPUs:  2
    ......
    
> VirtualBox命令行工具vboxmanage的一些使用命令。  
> list vms，可以加-l参数显示详细信息。   
> 启动虚拟机：vboxmanage startvm "slackware"   
> 虚拟机其他action：vboxmanage controlvm "slackware" pause/resume/reset/poweroff/savestate   
> 修改虚拟机配置（<http://www.virtualbox.org/manual/ch08.html#vboxmanage-modifyvm>）。VBoxManage modifyvm "winxp" -memory "256MB" -acpi on -boot1 dvd -nic1 nat    
> 创建一个虚拟磁盘. vboxmanage createhd -filename "WinXP.vdi" -size 10000 –register   
> 将虚拟磁盘和虚拟机关联. vboxmanage modifyvm "winxp" -hda "WinXP.vdi"   
> 挂载光盘镜像 ISO. vboxmanage openmedium dvd /full/path/to/iso.iso   
> 将光盘镜像 ISO 和虚拟机关联. vboxmanage modifyvm "winxp" -dvd /full/path/to/iso.iso   
> 创建虚拟机. vboxmanage createvm -name "SUSE 10.2" -register  
> 删除虚拟机. vboxmanage unregistervm <id> --delete

通过vagrant ssh命令登录虚拟机，切换root账户， 查看系统挂载目录，新建文件，然后在宿主机上验证一下，最后，再确定一下网络是否OK。  
![](/images/2014-09-29-vagrant-docker/5.png)
 
查看宿主机上的/var/vagrant/devstack目录：  
![](/images/2014-09-29-vagrant-docker/6.png)

如果虚拟机在运行时修改了配置，可以通过`vagrant reload --provision`使用最新的配置重启虚拟机。

一个很牛逼的特性，vagrant share，参考[这里](http://docs.vagrantup.com/v2/getting-started/share.html)

> 其实，使用vagrant也并非就是完美的解决方案，在使用过程中还是有一些限制。例如，在服务器上启动vagrant虚拟机后，想在windows PC上ssh或winscp到该虚拟机，目前除了使用public ip外，没有好的办法。因为虚拟机的ssh端口转发默认是绑定在127.0.0.1上，而不是0.0.0.0，导致无法在服务器外连接虚拟机。

### 安装DevStack
有个虚拟机，虚拟机又能联网，那么安装devstack就是老话题了。  
参考我之前的[这篇](http://lingxiankong.github.io/blog/2014/05/10/vmware-workstation-devstack/)文章。

或者使用别人做好的box/Vagrantfile，这里有一个可以参考（我没试用过）：<https://github.com/patux/mydevstack>

### 如何共享
一个vagrant下的devstack虚拟机有了，如果只是自己用，那没有必要非要使用vagrant，直接用VirtualBox就行了。所以，分享、协作才是体现vagrant价值的真谛。如何分享呢？

首先想到的就是刚才提到的vagrant share，但大部分人还是希望在一个小团队中自由分发，而不是直接暴漏在公网上。其实，直接使用vagrant package命令就可以重新打包box：  
![](/images/2014-09-29-vagrant-docker/8.png)

## Docker下安装devstack
### 安装Docker
参考[这篇](https://docs.docker.com/installation/ubuntulinux/)文章。

docker中的基本概念：  
image：类似于vagrant中的box；  
container：类似于vagrant中的VM；

### Docker的基本使用
运行交互式的shell：`docker run -i -t --name test -h hostname ubuntu:14.04 /bin/bash`，退出可以使用CTRL-p+CTRL-q跳出容器或输入exit终止容器，或者在run时加--rm（与-d参数互斥），容器在终止后立刻删除。

开启一个长时间运行的工作进程：  

	# 开启一个非常有用的长时间工作进程
	CONTAINER_ID=$(sudo docker run -d ubuntu:14.04 /bin/sh -c "while true; do echo Hello world; sleep 1; done")
	# 到目前为止的收集的输出，可以加-f达到类似于tail -f的效果
	docker logs $CONTAINER_ID
	# 或者连接上容器实时查看
	docker attach $CONTAINER_ID --sig-proxy=false
  # --sig-proxy可以保证 Ctrl+D、Ctrl+C 不会退出
	# attach命令有时并不方便，当多个窗口同时attach到一个容器时，所有窗口都会同步显示，其中一个窗口因命令阻塞时，其他窗口也无法执行操作。连接容器也可以用nsenter工具。

查看container中的进程：`docker top $CONTAINER_ID`

docker ps 只列出运行态的容器  
docker ps -l 列出最近启动的容器  
docker ps -a 列出所有容器

容器的导出（文件）和（从文件）导入（镜像）：  
`docker export CONTAINER_ID > file.tar`  
`cat file.tar | docker import - kong/ubuntu:v1.0`  
容器的导出与镜像的导出很像，但容器快照文件将丢弃镜像所有的历史记录和元数据信息，而镜像文件会保存完整记录，体积也要大。此外，容器文件导入时可以重新指定镜像标签等元数据信息。

#### 镜像
创建镜像：  
1. `docker commit -m "update and install puppet" -a "author name" 9cf3b285b7e4 kong/ubuntu:v1`  
2. 编写[Dockerfile](http://docs.docker.com/reference/builder/)，在当前目录下使用`docker build -t="kong/ubuntu:v2" .`创建image，一个最简单的示例如下：

	FROM ubuntu:14.04
	MAINTAINER Kate Smith <ksmith@example.com>
	RUN apt-get update && apt-get install -y puppet puppetmaster
	EXPOSE 22
	CMD service puppetmaster start

> 需要注意，Dockerfile中每一个RUN都会进行一次commit，最多能有127次

Dockerfile创建镜像时会继承父镜像的开放端口，但不会继承启动命令。

镜像的导出和载入：  
`docker save -o ubuntu_14.04.tar ubuntu:14.04`  
`docker load --input ubuntu_14.04.tar`

#### docker网络
/etc/hosts, /etc/hostname, /etc/resolve.conf只能临时编辑，容器终止或重启后并不会被保存，也不会被docker commit提交。

绑定ports：`docker run -d -p 5000:5000 training/webapp python app.py`，在第一个5000前可以加本机的IP，同时可以指定协议（/udp）。使用-P（大写）时自动绑定，范围49153 to 65535。  

可以通过`docker port $CONTAINER_ID 5000`查询container port 5000绑定的external port和绑定的地址，docker ps也能查到。

[container link](http://docs.docker.com/userguide/dockerlinks/)，在源和接收容器间创建隧道，接收容器可以看到源容器指定的信息：  
`sudo docker run -d -P --name web --link db:db training/webapp python app.py`  
`--link name:alias`，Where name is the name of the container we're linking to and alias is an alias for the link name. 这样，在container web中会得到container db暴露的端口信息的环境变量。同时，web中的/etc/hosts增加db的记录，并且随着db IP的改变而自动变更。

#### docker存储
`docker run -d -P --name web -v /webapp training/webapp python app.py`，创建新卷；  
`docker run -d -P --name web -v /src/webapp:/opt/webapp training/webapp python app.py`，映射本地目录，注意这种方式Dockerfile不支持。  
`docker run -d -P --name web -v /src/webapp:/opt/webapp:ro training/webapp python app.py`，只读。

卷的共享参见[这里](http://docs.docker.com/userguide/dockervolumes/)。  
注意，要删除数据卷，需要在删除最后一个挂载该卷的容器时指定-v参数。

#### Dockerfile
<http://docs.docker.com/reference/builder/>

在dockerfile中只能出现一次CMD，CMD在build时会被忽略，只是在image创建容器时执行. CMD指定的命令可以被docker run传递的命令覆盖，而ENTRYPOINT会把docker run时容器名后面的所有内容都当成参数传递给其指定的命令（不会对命令覆盖）。所以，我的理解，ENTRYPOINT更像是将容器当做一个可执行命令，后面跟上命令参数。CMD可以为ENTRYPOINT提供参数，ENTRYPOINT本身也可以包含参数，但是你可以把那些可能需要变动的参数写到CMD里而把那些不需要变动的参数写到ENTRYPOINT里面。

ENV定义image build时用到的环境变量（可以用docker inspect查看），并且会作用于容器，可通过`docker run --env <key>=<value>`修改。

ADD功能比COPY强大，将context中的某个文件、context某个目录中的文件、URL文件、压缩包中的文件解压后拷贝到容器中目的文件或目录下。

### 安装Devstack
与vagrant一样，装完docker，首先想到的是到docker image repo（官方叫docker hub）找与devstack相关的image。直接到<https://registry.hub.docker.com>，搜索“devstack”（或者通过命令行`docker search devstack`也能搜索出来），有三个结果：  
![](/images/2014-09-29-vagrant-docker/7.png)  
看了下三个image的描述，感觉都不靠谱。

关于Docker与OpenStack快速部署，也可以参见[这篇](http://allthingsopen.com/2014/07/09/docker-all-the-things-openstack-keystone-and-ceilometer-automated-builds-on-docker-hub)博客，作者仅以Keystone和Ceilometer为例介绍了如何使用Docker快速部署OpenStack服务。
