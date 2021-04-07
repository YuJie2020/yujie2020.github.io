---
layout: post
title: 数组和链表结构-相关算法
description: 抽出LeetCode题库中数组和链表结构相关的算法题目，再以相似类型的题目进行分类归纳总结题解。
category: 技术
---

## introduction 
抽出LeetCode题库中数组和链表结构相关的算法题目，再以相似类型的题目进行分类归纳总结题解。  
并非每道题目的解法都是它的最优写法，只是在尽量保证代码执行高效性的前提下，为了归纳总结便于记忆而给定的解法，故这里每道题的题解也都只列出了一种写法。

## Ⅰ Move Zeroes
使用**双指针**的思路，指针k（慢指针）用于替换元素，指针i（快指针）用于遍历序列。定义两个指针 slow 和 fast 分别为慢指针和快指针，其中慢指针表示处理出的数组的长度，快指针表示已经检查过的数组的长度，即 nums[fast] 表示待检查的第一个元素，nums[slow−1] 或 nums[slow] 为上一个应该被保留的元素所移动到的指定位置。

时间复杂度：O(n)	n - 序列长度  
空间复杂度：O(1)	没有创建新的序列，只需要常数空间存放若干变量

### 283. [Move Zeroes](https://leetcode-cn.com/problems/move-zeroes/) 移动零

给定一个数组 `nums`，编写一个函数将所有 `0` 移动到数组的末尾，同时保持非零元素的相对顺序。  
示例：  
输入：[0,1,0,3,12]  
输出：[1,3,12,0,0]

题解：

```java
class Solution {
    public void moveZeroes(int[] nums) {
        int k = 0; // nums数组中[0, ..., k)的元素均为非0元素
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] != 0) {
                if (i == k) { // 用于优化数组前几个元素都为非0的情况
                    k++;
                } else {
                    nums[k++] = nums[i];
                    nums[i] = 0;
                }
            }
        }
    }
}
```

tips：

- i是否等于k的判断要写在判断当前元素是否不为0之后，否则每次进入循环体i总等于k；
- 对于i不等于k的情况，就不需要交换i和k索引处元素，直接将k处元素赋值i处元素的值并将i处元素置0即可。

### 27. [Remove Element](https://leetcode-cn.com/problems/remove-element/) 移除元素

给你一个数组 `nums` 和一个值 `val`，你需要 **[原地](https://baike.baidu.com/item/原地算法)** 移除所有数值等于 `val` 的元素，并返回移除后数组的新长度。元素的顺序可以改变，你不需要考虑数组中超出新长度后面的元素。  
示例：  
输入：nums = [0,1,2,2,3,0,4,2], val = 2  
输出：5, nums = [0,1,4,0,3]

题解：

```java
class Solution {
    public int removeElement(int[] nums, int val) {
        int k = 0; // nums数组中[0, ..., k)的元素均为非val元素
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] != val) {
                if (k == i) { // 用于优化数组前几个元素都为非val的情况
                    k++;
                } else {
                    nums[k++] = nums[i];
                }
            }
        }
        return k;
    }
}
```

### 26. [Remove Duplicates from Sorted Array](https://leetcode-cn.com/problems/remove-duplicates-from-sorted-array/) 删除有序数组中的重复项

给你一个有序数组 `nums` ，请你**[ 原地](http://baike.baidu.com/item/原地算法)** 删除重复出现的元素，使每个元素只出现一次，返回删除后数组的新长度。不需要考虑数组中超出新长度后面的元素。  
示例：  
输入：nums = [0,0,1,1,1,2,2,3,3,4]
输出：5, nums = [0,1,2,3,4]

题解：

```java
class Solution {
    public int removeDuplicates(int[] nums) {
        int k = 0; // nums数组中[0, ..., k]的元素均为非重复元素
        for (int i = 1; i < nums.length; i++) {
            if (nums[k] != nums[i]) { // nums已按升序排列，双指针指向的元素值不同时k就需要递增
                if (i - k > 1) { // 用于优化数组前几个元素都不重复的情况，防止自身给自身赋值
                    nums[++k] = nums[i];
                } else {
                    k++;
                }
            }
        }
        return k + 1;
    }
}
```

tips：

- 这里思路需要转换一下，遍历从索引1开始。

### 80. [Remove Duplicates from Sorted Array II](https://leetcode-cn.com/problems/remove-duplicates-from-sorted-array-ii/) 删除有序数组中的重复项 II

给你一个有序数组 `nums` ，请你**[ 原地](http://baike.baidu.com/item/原地算法)** 删除重复出现的元素，使每个元素最多出现两次，返回删除后数组的新长度。不需要考虑数组中超出新长度后面的元素。  
示例：  
输入：nums = [0,0,1,1,1,1,2,3,3]  
输出：7, nums = [0,0,1,1,2,3,3]

思路：  
因为相同元素最多出现两次而非一次，所以需要检查上上个应该被保留的元素nums[slow−2] 是否和当前待检查元素 nums[fast] 相同。当且仅当 nums[slow - 2] = nums[fast] 时，当前待检查元素 nums[fast] 不应该被保留（因为此时必然有 nums[slow - 2] = nums[slow - 1] = nums[fast]）。

题解：

```java
class Solution {
    public int removeDuplicates(int[] nums) {
        if (nums.length <= 2) return nums.length;
        int k = 2; // nums数组中[0, ..., k)的元素中重复元素最多出现两次
        for (int i = 2; i < nums.length; i++) {
            if (nums[k - 2] != nums[i]){
                nums[k++] = nums[i];
            }
        }
        return k;
    }
}
```

tips：

- 这里思路需要转换一下，快慢指针都从索引2开始；
- 数组的前两个数必然可以被保留，因此对于长度不超过 2 的数组无需进行任何处理。