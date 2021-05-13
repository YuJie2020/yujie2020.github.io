---
layout: post
title: 剑指 Offer
description: 剑指 Offer - 第 2 版
category: 技术
---

### introduction 
剑指 Offer - 第 2 版

### 03. [数组中重复的数字](https://leetcode-cn.com/problems/shu-zu-zhong-zhong-fu-de-shu-zi-lcof/)

找出数组中重复的数字。在一个长度为 n 的数组 nums 里的所有数字都在 0～n-1 的范围内。数组中某些数字是重复的，但不知道有几个数字重复了，也不知道每个数字重复了几次。请找出数组中任意一个重复的数字。  
示例：  
输入：[2, 3, 1, 0, 2, 5, 3]  
输出：2 或 3

思路：  
常规数组题目，遍历，条件判断。由于 nums 的数字范围均在 [0,n-1] 中， 此说明含义：数组元素的 索引 和 值 是 一对多 的关系，可以利用这一范围之外的数字，来表达「是否存在」的含义。遍历 nums 每遇到一个数 x（原数组中元素），就将 nums[x] 增加 n。由于 nums 中所有数均在 [0,n-1] 中，增加以后这些数必然大于等于 n。当遍历过程中遇到 nums[x]>=n 则说明此索引 x（原数组中元素）之前出现过，返回其值nums[i]。当遍历到某个位置时，其中的数可能已经被增加过，因此需要对 n 取模还原出它本来的值。

题解：

```java
class Solution {
    public int findRepeatNumber(int[] nums) {
        int len = nums.length;
        for (int i = 0; i < len; i++) {
            int index = nums[i] % len;
            if (nums[index] >= len) return index;
            nums[index] += len;
        }
        return -1;
    }
}
```

tips：

- 思路与448题相同；
- 时间复杂度：O(n)
- 空间复杂度：O(1)

### 04. [二维数组中的查找](https://leetcode-cn.com/problems/er-wei-shu-zu-zhong-de-cha-zhao-lcof/)

在一个 n * m 的二维数组中，每一行都按照从左到右递增的顺序排序，每一列都按照从上到下递增的顺序排序。请完成一个高效的函数，输入这样的一个二维数组和一个整数，判断数组中是否含有该整数。0 <= n <= 1000，0 <= m <= 1000。  
示例：  
输入：  
[  
ㅤ[1,   4,  7, 11, 15],  
ㅤ[2,   5,  8, 12, 19],  
ㅤ[3,   6,  9, 16, 22],  
ㅤ[10, 13, 14, 17, 24],  
ㅤ[18, 21, 23, 26, 30]  
]ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ, target = 5 | target = 20  
输出：true | false

题解：

```java
class Solution {
    public boolean findNumberIn2DArray(int[][] matrix, int target) {
        int row = matrix.length;
        if (row == 0) return false;
        int col = matrix[0].length;
        for (int i = 0, j = col - 1; i < row && j >= 0;) {
            if (matrix[i][j] == target) {
                return true;
            } else if (matrix[i][j] < target) {
                i++;
            } else {
                j--;
            }
        }
        return false;
    }
}
```

tips：

- 双指针，思路与240题相同；
- 时间复杂度：O(m+n)
- 空间复杂度：O(1)

### 05. [替换空格](https://leetcode-cn.com/problems/ti-huan-kong-ge-lcof/)

请实现一个函数，把字符串 `s` 中的每个空格替换成"%20"。  
示例：  
输入：s = "We are happy."  
输出："We%20are%20happy."

题解：

```java
class Solution {
    public String replaceSpace(String s) {
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (ch == ' ') {
                result.append("%20");
            } else result.append(ch);
        }
        return result.toString();
        // return s.replace(" ", "%20"); // 库函数
    }
}
```

tips：

- 常规字符串题目，遍历，条件判断；
- 时间复杂度：O(n)
- 空间复杂度：O(n)