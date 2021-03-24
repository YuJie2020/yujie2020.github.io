---
layout: post
title: linux里install命令和cp命令
description: 在看Heat代码目录时看到了install命令，不是很理解，google后，记下以便后续查看
category: 技术
---

install和cp类似，都可以将文件/目录拷贝到指定的地点。但是，install允许你控制目标文件的属性。install通常用于程序的makefile（在RPM的spec里面也经常用到），使用它来将程序拷贝到目标（安装）目录。

常用参数：
```bash
--backup[=CONTROL]：为每个已存在的目的地文件进行备份。 
-b：类似 --backup，但不接受任何参数。 
-d，--directory：所有参数都作为目录处理，而且会创建指定目录的所有主目录。 
-D：创建<目的地>前的所有主目录，然后将<来源>复制至 <目的地>；在第一种使用格式中有用。 
-g，--group=组：自行设定所属组，而不是进程目前的所属组。 
-m，--mode=模式：自行设定权限模式 (像chmod)，而不是rwxr-xr-x。 
-o，--owner=所有者：自行设定所有者 (只适用于超级用户)。 
-p，--preserve-timestamps：以<来源>文件的访问/修改时间作为相应的目的地文件的时间属性。 
-s，--strip：用strip命令删除symbol table，只适用于第一及第二种使用格式。 
-S，--suffix=后缀：自行指定备份文件的<后缀>
-t, --target-directory=目录 将源文件所有参数复制到指定目录
```

示例：
```bash
# 创建目录
install -d /usr/bin
# 将源文件复制到目标文件，后面的参数是文件
install source_file dest_file
# 将源文件复制到目标目录，后面的参数是目录，如果目录不存在，则会当做文件处理
install source_file dest_dir
# 将源文件复制到目标目录，后面的参数是目录，如果目录不存在，则命令失败
install source_file dest_dir/

# 复制文件，并设置文件权限，自动创建目标目录
@install -p -D -m 0755 targets /usr/bin/targets
# 相当于
@mkdir -p /usr/bin
@cp targets /usr/bin
@chmod 755 /usr/bin/targets
@touch /usr/bin/targets       <---- 更新文件时间戳
<----@前缀的意思是不在控制台输出结果。
```

install和cp完成同样的任务--拷贝文件，它们之间的区别主要如下：  

- 最重要的一点，如果目标文件存在，cp会先清空文件后往里写入新文件，而install则会先删除掉原先的文件然后写入新文件。这是因为往正在使用的文件中写入内容可能会导致一些问题，比如说写入正在执行的文件可能会失败，再比如说往已经在持续写入的文件句柄中写入新文件会产生错误的文件。而使用install先删除后写入（会生成新的文件句柄）的方式去安装就能避免这些问题了；
- install命令会恰当地处理文件权限的问题；
- install命令可以打印出更多更合适的debug信息，还会自动处理SElinux上下文的问题。