---
layout: post
title: Linux中查看NUMA信息
description: Linux中查看NUMA信息
category: 技术
---

Nova在NFV场景下会提供NUMA相关高级特性，这里提供一个脚本查看计算节点的NUMA相关信息。

	#!/bin/bash
	
	function get_nr_processor()
	{
	    grep '^processor' /proc/cpuinfo | wc -l
	}
	
	function get_nr_socket()
	{
	    grep 'physical id' /proc/cpuinfo | awk -F: '{
	            print $2 | "sort -un"}' | wc -l
	}
	
	function get_nr_siblings()
	{
	    grep 'siblings' /proc/cpuinfo | awk -F: '{
	            print $2 | "sort -un"}'
	}
	
	function get_nr_cores_of_socket()
	{
	    grep 'cpu cores' /proc/cpuinfo | awk -F: '{
	            print $2 | "sort -un"}'
	}
	
	echo '===== CPU Topology Table ====='
	echo
	
	echo '+--------------+---------+-----------+'
	echo '| Processor ID | Core ID | Socket ID |'
	echo '+--------------+---------+-----------+'
	
	while read line; do
	    if [ -z "$line" ]; then
	        printf '| %-12s | %-7s | %-9s |\n' $p_id $c_id $s_id
	        echo '+--------------+---------+-----------+'
	        continue
	    fi
	
	    if echo "$line" | grep -q "^processor"; then
	        p_id=`echo "$line" | awk -F: '{print $2}' | tr -d ' '` 
	    fi
	
	    if echo "$line" | grep -q "^core id"; then
	        c_id=`echo "$line" | awk -F: '{print $2}' | tr -d ' '` 
	    fi
	
	    if echo "$line" | grep -q "^physical id"; then
	        s_id=`echo "$line" | awk -F: '{print $2}' | tr -d ' '` 
	    fi
	done < /proc/cpuinfo
	
	echo
	
	awk -F: '{ 
	    if ($1 ~ /processor/) {
	        gsub(/ /,"",$2);
	        p_id=$2;
	    } else if ($1 ~ /physical id/){
	        gsub(/ /,"",$2);
	        s_id=$2;
	        arr[s_id]=arr[s_id] " " p_id
	    }
	} 
	
	END{
	    for (i in arr) 
	        printf "Socket %s:%s\n", i, arr[i];
	}' /proc/cpuinfo
	
	echo
	echo '===== CPU Info Summary ====='
	echo
	
	nr_processor=`get_nr_processor`
	echo "Logical processors: $nr_processor"
	
	nr_socket=`get_nr_socket`
	echo "Physical socket: $nr_socket"
	
	nr_siblings=`get_nr_siblings`
	echo "Siblings in one socket: $nr_siblings"
	
	nr_cores=`get_nr_cores_of_socket`
	echo "Cores in one socket: $nr_cores"
	
	let nr_cores*=nr_socket
	echo "Cores in total: $nr_cores"
	
	if [ "$nr_cores" = "$nr_processor" ]; then
	    echo "Hyper-Threading: off"
	else
	    echo "Hyper-Threading: on"
	fi
	
	echo
	echo '===== END ====='

查询结果示例：

	===== CPU Topology Table =====
	
	+--------------+---------+-----------+
	| Processor ID | Core ID | Socket ID |
	+--------------+---------+-----------+
	| 0            | 0       | 1         |
	+--------------+---------+-----------+
	| 1            | 1       | 1         |
	+--------------+---------+-----------+
	| 2            | 9       | 1         |
	+--------------+---------+-----------+
	| 3            | 10      | 1         |
	+--------------+---------+-----------+
	| 4            | 0       | 0         |
	+--------------+---------+-----------+
	| 5            | 1       | 0         |
	+--------------+---------+-----------+
	| 6            | 9       | 0         |
	+--------------+---------+-----------+
	| 7            | 10      | 0         |
	+--------------+---------+-----------+
	| 8            | 0       | 1         |
	+--------------+---------+-----------+
	| 9            | 1       | 1         |
	+--------------+---------+-----------+
	| 10           | 9       | 1         |
	+--------------+---------+-----------+
	| 11           | 10      | 1         |
	+--------------+---------+-----------+
	| 12           | 0       | 0         |
	+--------------+---------+-----------+
	| 13           | 1       | 0         |
	+--------------+---------+-----------+
	| 14           | 9       | 0         |
	+--------------+---------+-----------+
	| 15           | 10      | 0         |
	+--------------+---------+-----------+
	
	Socket 0: 4 5 6 7 12 13 14 15
	Socket 1: 0 1 2 3 8 9 10 11
	
	===== CPU Info Summary =====
	
	Logical processors: 16
	Physical socket: 2
	Siblings in one socket:  8
	Cores in one socket:  4
	Cores in total: 8
	Hyper-Threading: on
	
	===== END =====	