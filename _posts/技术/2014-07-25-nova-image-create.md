---
layout: post
title: Nova中的image-create示例
description: Nova中的image-create示例
category: 技术
---

之前在CSDN写博客时有过对image-create的[讲解](http://blog.csdn.net/lynn_kong/article/details/8722679)，这几天在解决问题时，有了一些操作，记录在此，以备后查。

code version: havana

## 非后端卷启动，导出镜像

    root@contrller:~# glance image-show test_vm
    +---------------------------------------+--------------------------------------+
    | Property                              | Value                                |
    +---------------------------------------+--------------------------------------+
    | Property 'base_image_ref'             | 60ede79d-1b79-408a-b749-d6db3eb59cda |
    | Property 'image_location'             | snapshot                             |
    | Property 'image_state'                | available                            |
    | Property 'image_type'                 | snapshot                             |
    | Property 'instance_type_ephemeral_gb' | 0                                    |
    | Property 'instance_type_flavorid'     | 2                                    |
    | Property 'instance_type_id'           | 9                                    |
    | Property 'instance_type_memory_mb'    | 2048                                 |
    | Property 'instance_type_name'         | m1.small                             |
    | Property 'instance_type_root_gb'      | 20                                   |
    | Property 'instance_type_rxtx_factor'  | 1                                    |
    | Property 'instance_type_swap'         | 0                                    |
    | Property 'instance_type_vcpus'        | 1                                    |
    | Property 'instance_uuid'              | 03014d2d-c370-464e-ac42-c11c64f4f7e9 |
    | Property 'os_type'                    | None                                 |
    | Property 'owner_id'                   | 45e6271fa2904be6b7fd97f43314e1d9     |
    | Property 'user_id'                    | 4b1ff1de0d0c41edb908a1ce5be375ca     |
    | checksum                              | 5a0d1668e745eebaf3883a1e00e0b072     |
    | container_format                      | bare                                 |
    | created_at                            | 2014-07-08T15:46:32                  |
    | deleted                               | False                                |
    | disk_format                           | qcow2                                |
    | id                                    | df8bb475-b3d6-4b36-8444-ac70c03d8799 |
    | is_public                             | False                                |
    | min_disk                              | 20                                   |
    | min_ram                               | 0                                    |
    | name                                  | test_vm                              |
    | owner                                 | 45e6271fa2904be6b7fd97f43314e1d9     |
    | protected                             | False                                |
    | size                                  | 13041664                             |
    | status                                | active                               |
    | updated_at                            | 2014-07-08T15:46:40                  |
    +---------------------------------------+--------------------------------------+

## 非后端卷+1个用户卷，导出镜像
其实这种情况跟没有用户卷的虚拟机导出镜像一致，用户卷被忽略。

    root@contrller:~# glance image-show test_vm_image
    +---------------------------------------+--------------------------------------+
    | Property                              | Value                                |
    +---------------------------------------+--------------------------------------+
    | Property 'base_image_ref'             | 60ede79d-1b79-408a-b749-d6db3eb59cda |
    | Property 'image_location'             | snapshot                             |
    | Property 'image_state'                | available                            |
    | Property 'image_type'                 | snapshot                             |
    | Property 'instance_type_ephemeral_gb' | 0                                    |
    | Property 'instance_type_flavorid'     | 2                                    |
    | Property 'instance_type_id'           | 9                                    |
    | Property 'instance_type_memory_mb'    | 2048                                 |
    | Property 'instance_type_name'         | m1.small                             |
    | Property 'instance_type_root_gb'      | 20                                   |
    | Property 'instance_type_rxtx_factor'  | 1                                    |
    | Property 'instance_type_swap'         | 0                                    |
    | Property 'instance_type_vcpus'        | 1                                    |
    | Property 'instance_uuid'              | 03014d2d-c370-464e-ac42-c11c64f4f7e9 |
    | Property 'os_type'                    | None                                 |
    | Property 'owner_id'                   | 45e6271fa2904be6b7fd97f43314e1d9     |
    | Property 'user_id'                    | 4b1ff1de0d0c41edb908a1ce5be375ca     |
    | checksum                              | 2b3e4118a3ad691e3686a6e18628b034     |
    | container_format                      | bare                                 |
    | created_at                            | 2014-07-08T19:53:10                  |
    | deleted                               | False                                |
    | disk_format                           | qcow2                                |
    | id                                    | 7a8c421d-0eea-4a93-a3b8-41ae751d9405 |
    | is_public                             | False                                |
    | min_disk                              | 20                                   |
    | min_ram                               | 0                                    |
    | name                                  | test_vm_image                        |
    | owner                                 | 45e6271fa2904be6b7fd97f43314e1d9     |
    | protected                             | False                                |
    | size                                  | 13041664                             |
    | status                                | active                               |
    | updated_at                            | 2014-07-08T19:53:18                  |
    +---------------------------------------+--------------------------------------+

## 后端卷启动，导出镜像
此时镜像的size是0，同时记录了通过cinder从volume创建的snapshot链接。   
使用Nova命令：

    root@contrller:~# nova image-show 7a75e9a8-a5a8-49f5-ada0-a658ab327e31
    +-------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
    | Property                      | Value                                                                                                                                                                                   |
    +-------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
    | status                        | ACTIVE                                                                                                                                                                                  |
    | updated                       | 2014-07-19T15:27:55Z                                                                                                                                                                    |
    | metadata block_device_mapping | [{u'virtual_name': None, u'no_device': None, u'device_name': u'/dev/vda', u'volume_size': 1, u'snapshot_id': u'2dba63ed-86f6-448d-964b-7c7663c78fda', u'delete_on_termination': False}] |
    | name                          | kong_1_image_2                                                                                                                                                                          |
    | created                       | 2014-07-19T15:27:55Z                                                                                                                                                                    |
    | minDisk                       | 0                                                                                                                                                                                       |
    | metadata root_device_name     | /dev/vda                                                                                                                                                                                |
    | progress                      | 100                                                                                                                                                                                     |
    | minRam                        | 0                                                                                                                                                                                       |
    | OS-EXT-IMG-SIZE:size          | 0                                                                                                                                                                                       |
    | id                            | 7a75e9a8-a5a8-49f5-ada0-a658ab327e31                                                                                                                                                    |
    +-------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

使用Glance命令：

    root@contrller:~# glance image-show 7a75e9a8-a5a8-49f5-ada0-a658ab327e31
    +---------------------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
    | Property                        | Value                                                                                                                                                                           |
    +---------------------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
    | Property 'block_device_mapping' | [{"virtual_name": null, "no_device": null, "device_name": "/dev/vda", "volume_size": 1, "snapshot_id": "2dba63ed-86f6-448d-964b-7c7663c78fda", "delete_on_termination": false}] |
    | Property 'root_device_name'     | /dev/vda                                                                                                                                                                        |
    | created_at                      | 2014-07-19T15:27:55                                                                                                                                                             |
    | deleted                         | False                                                                                                                                                                           |
    | id                              | 7a75e9a8-a5a8-49f5-ada0-a658ab327e31                                                                                                                                            |
    | is_public                       | False                                                                                                                                                                           |
    | min_disk                        | 0                                                                                                                                                                               |
    | min_ram                         | 0                                                                                                                                                                               |
    | name                            | kong_1_image_2                                                                                                                                                                  |
    | owner                           | 45e6271fa2904be6b7fd97f43314e1d9                                                                                                                                                |
    | protected                       | False                                                                                                                                                                           |
    | size                            | 0                                                                                                                                                                               |
    | status                          | active                                                                                                                                                                          |
    | updated_at                      | 2014-07-19T15:27:55                                                                                                                                                             |
    +---------------------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+