---
layout: post
title: Nova中ISO虚拟机使用场景及验证笔记
description: Nova中ISO虚拟机使用场景及验证笔记
category: 技术
---

原作者：[kiwik](http://kiwik.github.io/)

---

1. 直接使用ISO镜像和没有ephemeral卷的规格创建虚拟机，创建成功，但是安装OS到写分区表的步骤失败，检测不到可用的disk device。  
2. 直接使用ISO镜像和有ephemeral卷的规格创建虚拟机，创建成功，安装OS成功，但是最后安装完成，OS提示弹出cdrom后重启，OpenStack没有弹出cdrom的接口，重启后，再次进入安装OS的界面。  
3. 直接使用ISO镜像和有ephemeral卷的规格创建虚拟机，创建成功，安装OS成功，然后通过nova image-create导出镜像成功，用这个镜像再次创建虚拟机，虚拟机启动后进入安装OS的界面。  
4. 通过qemu-img convert命令将iso格式的镜像转化成qcow2格式，通过此qcow2镜像创建虚拟机成功，但是虚拟机启动后进入安装OS的界面，安装过程中报错，cdrom内有不正确的cd(config_driver)，不能用于安装，检测和mount cd失败。  
5. 通过qemu-img convert命令将iso格式的镜像转化成qcow2格式，通过此qcow2镜像创建虚拟机成功，同时给这个虚拟机挂载一个cinder用户卷，但是虚拟机启动后进入安装OS的界面，安装过程中报错，cdrom内有不正确的cd(config_driver)，不能用于安装，检测和mount cd失败。  
6. 通过cinder的镜像创建卷接口，使用iso镜像创建一个启动卷，然后用这个卷启动虚拟机，虚拟机启动后停止在安装OS的界面。  
7. 直接使用ISO镜像和没有ephemeral卷的规格创建虚拟机，创建成功，然后给这个虚拟机挂载一个cinder用户卷，因为root device是IDE的cdrom设备，所以nova默认使用hda作为挂载路径，但是iso所在cdrom已经占用了hda，所以挂卷失败(bug)。  
8. 在创建ISO虚拟机的同时指定block_device挂载cinder用户卷到vdb，安装OS到vdb成功，然后卸载cinder用户卷，此卷因为不是bootable的，所以不能通过卷启动虚拟机，但是可以使用cinder的upload-to-image将用户卷上传到glance作为一个镜像，然后通过镜像创建虚拟机成功，无需再此安装OS，直接使用。  
