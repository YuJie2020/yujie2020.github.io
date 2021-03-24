---
layout: post
title: Heat中stack domain使用和配置
description: Heat中stack domain使用和配置
category: 技术
---

stack domain解决以下几个问题：

* 从虚拟机内部访问Heat服务时的身份认证。
* 用domain的方式实现，创建的用户对非管理员不可见
* 创建的用户的操作权限是被隔离的

配置的步骤如下：  
1、安装[python-openstackclient](https://pypi.python.org/pypi/python-openstackclient/0.3.1)，因为keystoneclient不支持V3 API，将来也不会支持，参考[这里的讨论](http://openstack.markmail.org/thread/72oj2b3mattwgj3i#query:+page:1+mid:ekirymxxcqdubku2+state:results)。  
2、创建domain  

    UVP:/home/kong # openstack --os-token 2012 --os-url=http://172.25.150.8:5000/v3 --os-identity-api-version=3 domain create heat --description "Owns users and projects created by heat"
    +-------------+------------------------------------------------------------------------------------+
    | Field       | Value                                                                              |
    +-------------+------------------------------------------------------------------------------------+
    | description | Owns users and projects created by heat                                            |
    | enabled     | True                                                                               |
    | id          | a660f3993095439d9abe9aa52ae3929e                                                   |
    | links       | {u'self': u'http://172.25.150.8:5000/v3/domains/a660f3993095439d9abe9aa52ae3929e'} |
    | name        | heat                                                                               |
    +-------------+------------------------------------------------------------------------------------+

3、创建domain管理员

    UVP:/home/kong # openstack --os-token 2012 --os-url=http://172.25.150.8:5000/v3 --os-identity-api-version=3 user create --password passwd --domain a660f3993095439d9abe9aa52ae3929e heat_domain_admin --description "Manages users and projects created by heat"
    +-------------+----------------------------------------------------------------------------------+
    | Field       | Value                                                                            |
    +-------------+----------------------------------------------------------------------------------+
    | description | Manages users and projects created by heat                                       |
    | domain_id   | a660f3993095439d9abe9aa52ae3929e                                                 |
    | enabled     | True                                                                             |
    | id          | c177ddec383d44d2879d3687fa7b0e4c                                                 |
    | links       | {u'self': u'http://172.25.150.8:5000/v3/users/c177ddec383d44d2879d3687fa7b0e4c'} |
    | name        | heat_domain_admin                                                                |
    +-------------+----------------------------------------------------------------------------------+
    UVP:/home/kong # openstack --os-token 2012 --os-url=http://172.25.150.8:5000/v3 --os-identity-api-version=3 role add --user c177ddec383d44d2879d3687fa7b0e4c --domain a660f3993095439d9abe9aa52ae3929e admin
    
4、创建角色

    UVP:/home/kong # keystone role-create --name heat_stack_user
    +----------+----------------------------------+
    | Property |              Value               |
    +----------+----------------------------------+
    |    id    | 5e40547550d840e5a31e973b45f9a022 |
    |   name   |         heat_stack_user          |
    +----------+----------------------------------+

4、在Heat中配置  

    stack_domain_admin = heat_domain_admin
    stack_domain_admin_password = passwd
    stack_user_domain = a660f3993095439d9abe9aa52ae3929e

这样，Heat在创建stack的资源时(比如waitconditionhandle)，会在`stack_domain_admin`内创建一个租户(与stack相关联，保存在stack的`stack_user_project_id`属性)，进而创建用户(保存在资源的`user_id`字段)，用户的角色由配置项`heat_stack_user_role`定义，默认值是`heat_stack_user`。

----------
参考文档：  
<http://hardysteven.blogspot.com/2014/04/heat-auth-model-updates-part-2-stack.html>