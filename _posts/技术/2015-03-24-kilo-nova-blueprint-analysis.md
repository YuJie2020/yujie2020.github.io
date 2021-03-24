---
layout: post
title: Kilo版本Nova的特性分析
description: Kilo版本Nova的特性分析
category: 技术
---

![](/images/2015-03-24-kilo-nova-blueprint-analysis/4.png)

总结：  

* 各个厂商对Nova社区的参与依然如火如荼，积极将自身虚拟化产品作为driver与Nova对接。其中VMware、Hypver-V两家的积极性最高，不断弥补自身产品与社区KVM特性的差距，向A类driver看齐；  
* Nova社区开始关注NFV特性，引领开源云计算向电信领域拓展；
* 随着OpenStack大规模部署，调度瓶颈开始凸显，社区已经启动新的项目Gantt，逐步将nova-scheduler剥离；
* 社区已经找到版本间兼容的新的方式：microversion，特性扩展更加严格；
* 随着Nova代码规模的上涨，社区开始有意识的进行内部重构，优化代码逻辑

详细分析：  
![](/images/2015-03-24-kilo-nova-blueprint-analysis/1.png)  
![](/images/2015-03-24-kilo-nova-blueprint-analysis/2.png)  
![](/images/2015-03-24-kilo-nova-blueprint-analysis/3.png)  
