---
layout: post
title: linux下使用expect示例
description: linux下使用expect示例
category: 技术
---

expect是一种自动交互语言，能实现在shell脚本中为scp和ssh等自动输入密码自动登录，它本身是由 Tcl 语言实现的，所以下面脚本中的语法可以参考 Tcl 语言。一个例子：
    
    #!/usr/bin/expect -f  
    set ip [lindex $argv 0 ]     //接收第一个参数,并设置IP  
    set password [lindex $argv 1 ]   //接收第二个参数,并设置密码  
    set timeout 10                   //设置超时时间  
    spawn ssh root@$ip       //发送ssh请滶  
    expect {                 //返回信息匹配  
        "*yes/no" { send "yes\r"; exp_continue}  //第一次ssh连接会提示yes/no,继续  
        "*password:" { send "$password\r" }      //出现密码提示,发送密码  
    }  
    interact          //交互模式,用户会停留在远程服务器上面.  

运行结果：

    root@ubuntu:/home/zhangy# ./test.exp 192.168.1.130 admin  
    spawn ssh root@192.168.1.130  
    Last login: Fri Sep  7 10:47:43 2012 from 192.168.1.142  
    [root@linux ~]#  

我工作中用到的一个比较简单的场景，自动登录远程主机并自动输入`su -`的密码：
```
#!/usr/bin/expect -f
dict set nodemapping por-bill1 my-por-bill1.os.co.nz
dict set nodemapping por-bill2 my-por-bill2.os.co.nz
dict set nodemapping por-bill3 my-por-bill3.os.co.nz

dict set passmapping por-bill1 pass1
dict set passmapping por-bill2 pass2
dict set passmapping por-bill3 pass3

set nodename [lindex $argv 0 ]
set password [dict get $passmapping $nodename]
set nodefullname [dict get $nodemapping $nodename]

spawn ssh $nodefullname
expect {
    "*yes/no" { send "yes\r"; exp_continue}
    "*password*" { send "$password\r" }
}
interact
```