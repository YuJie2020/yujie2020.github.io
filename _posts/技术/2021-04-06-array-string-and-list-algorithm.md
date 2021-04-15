---
layout: post
title: 数组和链表结构以及字符串-相关算法
description: 抽出LeetCode题库中数组和链表结构以及字符串相关的算法题目，再以相似类型的题目进行分类归纳总结题解。
category: 技术
---

## introduction 
抽出LeetCode题库中数组和链表结构以及字符串相关的算法题目，再以相似类型的题目进行分类归纳总结题解。  
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

### 88. [Merge Sorted Array](https://leetcode-cn.com/problems/merge-sorted-array/) 合并两个有序数组

给你两个有序整数数组 `nums1` 和 `nums2`，请你将 `nums2` 合并到 `nums1` 中*，*使 `nums1` 成为一个有序数组。初始化 nums1 和 nums2 的元素数量分别为 m 和 n 。你可以假设 nums1 的空间大小等于 m + n，这样它就有足够的空间保存来自 nums2 的元素。  
示例：  
输入：nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3  
输出：[1,2,2,3,5,6]

思路：  
逆向双指针。nums1 的后半部分是空的，可以直接覆盖而不会影响结果。因此可以指针设置为从后向前遍历，每次取两者之中的较大者放进 nums1 的最后面。

题解：

```java
class Solution {
    public void merge(int[] nums1, int m, int[] nums2, int n) {
        int i = m - 1; // 指向nums1数组的最后一个元素
        int j = n - 1; // 指向nums2数组的最后一个元素
        int tail = m + n - 1; // 指向合并后数组的最后一个元素
        while (j >= 0) nums1[tail--] = i >=0 && nums1[i] > nums2[j] ? nums1[i--] : nums2[j--];
    }
}
```

tips：

- 这里思路需要转换一下，指针都从末尾开始；
- i是否大于0判断要位于两指针元素大小比较的前面，防止空指针异常；
- i和j指针指向的位置即为nums1和nums2数组中下一个该“放置”的元素。
- 时间复杂度：O(m + n)
- 空间复杂度：O(1)

### 977. [Squares of a Sorted Array](https://leetcode-cn.com/problems/squares-of-a-sorted-array/) 有序数组的平方

给你一个按非递减顺序排序的整数数组 `nums`，返回每个数字的平方组成的新数组，要求也按非递减顺序排序。  
示例：  
输入：nums = [-7,-3,2,3,11]  
输出：[4,9,9,49,121]

题解：

```java
class Solution {
    public int[] sortedSquares(int[] nums) {
        int i = 0;
        int j = nums.length - 1;
        int[] nums2 = new int[nums.length];
        int tail = nums.length -1;
        while(tail >= 0) {
            int iVal = nums[i] * nums[i];
            int jVal = nums[j] * nums[j];
            if (iVal > jVal) {
                nums2[tail--] = iVal;
                i++;
            } else {
                nums2[tail--] = jVal;
                j--;
            }
        }
        return nums2;
    }
}
```

tips：

- 这道题使用了88题合并两个有序数组的思路；
- 数组的题目首先考虑尽量低的时间复杂度，然后考虑空间复杂度，不一定所有题目都要时间复杂度O(n)，空间复杂度O(1)。
- 时间复杂度：O(n)
- 空间复杂度：O(n)，需要存储答案数组，所以空间复杂度为O(n)。

### 167. [Two Sum II - Input array is sorted](https://leetcode-cn.com/problems/two-sum-ii-input-array-is-sorted/) 两数之和 II - 输入有序数组

给定一个已按照 升序排列  的整数数组 numbers ，请你从数组中找出两个数满足相加之和等于目标数 target 。函数应该以长度为 2 的整数数组的形式返回这两个数的下标值。numbers 的下标 从 1 开始计数，你可以假设每个输入只对应唯一的答案，而且你不可以重复使用相同的元素。  
示例：  
输入：numbers = [2,3,4], target = 6  
输出：[1,3]

思路：  
初始时两个指针分别指向第一个元素位置和最后一个元素的位置。如果两个元素之和等于目标值则发现了唯一解。如果两个元素之和小于目标值，则将左侧指针右移一位，因为最小的数与最大的数相加都小于目标值，如果左侧指针不向右移动，则当前这个第一个元素与任何其他小于最大数的数相加都会小于目标值，所以左侧指针需要右移；如果两个元素之和大于目标值，则将右侧指针左移一位，因为最小的数与最大的数相加都大于目标值，如果右侧指针不向左移动，则当前这个第二个元素与任何其他大于最小数的数相加都会大于目标值，所以右侧指针需要左移。  
![](/images/2021-04-06-array-string-and-list-algorithm/167.jpg)

题解：

```java
class Solution {
    public int[] twoSum(int[] numbers, int target) {
        for (int i = 0, j = numbers.length - 1; i < j;) {
            int sum = numbers[i] + numbers[j];
            if (sum == target) {
                return new int[] {i + 1, j + 1};
            } else if (sum > target) {
                j--;
            } else {
                i++;
            }
        }
        return new int[] {-1, -1}; // 防止编译报错
    }
}
```

### 11. [Container With Most Water](https://leetcode-cn.com/problems/container-with-most-water/) 盛最多水的容器

给你 n 个非负整数 a1，a2，...，an，每个数代表坐标中的一个点 (i, ai) 。在坐标内画 n 条垂直线，垂直线 i 的两个端点分别为 (i, ai) 和 (i, 0) 。找出其中的两条线，使得它们与 x 轴共同构成的容器可以容纳最多的水。  
示例：  
输入：[1,8,6,2,5,4,8,3,7]  
![](/images/2021-04-06-array-string-and-list-algorithm/11.jpg)  
输出：49  
解释：图中垂直线代表输入数组 [1,8,6,2,5,4,8,3,7]。在此情况下，容器能够容纳水（表示为蓝色部分）的最大值为 49。

思路：  
设每一状态下水槽面积为 S(i,j),(0 <= i < j < n)，由于水槽的实际高度由两板中的短板决定，则可得面积公式 S(i, j) = min(h[i], h[j]) × (j - i)。在每一个状态下，无论长板或短板收窄 1 格，都会导致水槽底边宽度 -1：若向内移动短板，水槽的短板 min(h[i], h[j]) 可能变大，因此水槽面积 S(i, j) 可能增大；若向内移动长板，水槽的短板 min(h[i], h[j]) 不变或变小，下个水槽的面积一定小于当前水槽面积。

题解：

```java
class Solution {
    public int maxArea(int[] height) {
        int ans = 0;
        for (int i = 0, j = height.length - 1; i < j;) {
            ans = Math.max(Math.min(height[i], height[j]) * (j - i), ans);
            if (height[i] < height[j]) {
                i++;
            } else {
                j--;
            }
        }
        return ans;
    }
}
```

tips：

- 此题与167题思路相同。

### 240. [Search a 2D Matrix II](https://leetcode-cn.com/problems/search-a-2d-matrix-ii/) 搜索二维矩阵 II

编写一个高效的算法来搜索 m x n 矩阵 matrix 中的一个目标值 target 。该矩阵具有以下特性：每行的元素从左到右升序排列。每列的元素从上到下升序排列。  
示例：  
输入：matrix = [[1,4,7,11,15],[2,5,8,12,19],[3,6,9,16,22],[10,13,14,17,24],[18,21,23,26,30]], target = 5  
![](/images/2021-04-06-array-string-and-list-algorithm/240.jpg)  
输出：true

题解：

```java
class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        int m = matrix.length;
        int n = matrix[0].length;
        for (int i = 0, j = n - 1; i < m && j >= 0;) {
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

- 此题与167题思路相同。
- 时间复杂度：O(m + n)
- 空间复杂度：O(1)

## Ⅱ Sort Colors

使用**快速排序**、**三路快排**的思路。

时间复杂度：O(n)	n - 序列长度  
空间复杂度：O(1)	没有创建新的序列，只需要常数空间存放若干变量

### 75. [Sort Colors](https://leetcode-cn.com/problems/sort-colors/) 颜色分类

给定一个包含红色、白色和蓝色，一共 `n` 个元素的数组，**[原地](https://baike.baidu.com/item/原地算法)**对它们进行排序，使得相同颜色的元素相邻，并按照红色、白色、蓝色顺序排列。使用整数 `0`、 `1` 和 `2` 分别表示红色、白色和蓝色。  
示例：  
输入：nums = [2,0,1]  
输出：[0,1,2]

思路：  
![](/images/2021-04-06-array-string-and-list-algorithm/75.png)

题解：

```java
class Solution {
    public void sortColors(int[] nums) {
        int zero = -1; // [0, ..., zero]的元素都为0
        int two = nums.length; // [two, ..., nums.length - 1]的元素都为2
        for (int i = 0; i < two; ) { // 索引i用于遍历
            if (nums[i] == 0) {
                nums[i++] = nums[++zero];
                nums[zero] = 0;
            } else if (nums[i] == 2) { // 这里i不能递增，因为和--two处元素交换，--two处的元素为一不确定的值（未检查的值）
                nums[i] = nums[--two];
                nums[two] = 2;
            } else { // nums[i] == 1
                i++;
            }
        }
    }
}
```

### 215. [Kth Largest Element in an Array](https://leetcode-cn.com/problems/kth-largest-element-in-an-array/) 数组中的第K个最大元素

在未排序的数组中找到第 k 个最大的元素。  
示例：  
输入：[3,2,3,1,2,4,5,5,6] 和 k = 4  
输出：4

思路：  
用快速排序来解决这个问题，先对原数组排序，再返回倒数第 k 个位置，这样平均时间复杂度是 O(nlogn)。每次经过「划分」操作后，一定可以确定一个元素的最终位置，即 x 的最终位置为 q，并且保证 a[l⋯q−1] 中的每个元素小于等于 a[q]，且 a[q] 小于等于 a[q+1⋯r] 中的每个元素。所以只要某次划分的 q 为倒数第 k 个下标的时候，就已经找到了答案。 只需关心这一点，至于 a[l⋯q−1] 和 a[q+1⋯r] 是否是有序的，不需要关心。改进快速排序算法：在分解的过程当中，对子数组进行划分，如果划分得到的 q 正好就是需要的下标，就直接返回 a[q]；否则，如果 q 比目标下标小，就递归右子区间，否则递归左子区间。这样就可以把原来递归两个区间变成只递归一个区间，提高了时间效率。  
![](/images/2021-04-06-array-string-and-list-algorithm/215.png)

题解：

```java
class Solution {

    Random random = new Random();

    public int findKthLargest(int[] nums, int k) {
        int index = nums.length - k; // 第k大元素的索引
        return randomPartition(nums, 0, nums.length - 1, index);
    }

    // 用于判别继续向左半部分还是右半部分划分（迭代），pivot中轴值在下一迭代部分中随机选取
    private int randomPartition(int[] nums, int left, int right, int index) {
        int pivotIndex = random.nextInt(right - left + 1) + left;
        swap(nums, pivotIndex, right); // 将pivot中值交换到数组末尾
        int result = partition(nums, left, right);
        if (result == index) return nums[result];
        return result > index ? randomPartition(nums, left, result - 1, index) : randomPartition(nums, result + 1, right, index);
    }

    // 划分的方法
    private int partition(int[] nums, int left, int right) {
        int pivot = nums[right]; // 中轴值（位于数组末尾）
        int i = left - 1; // [left, ..., i]的元素都小于pivot，[i + 1, ..., right]的元素都大于等于pivot
        for (int j = left; j < right; j++) {
            if (nums[j] < pivot) {
                swap(nums, ++i, j);
            }
        }
        swap(nums, i + 1, right); // 将中轴值归于正确的位置
        return i + 1; // 中轴值的索引
    }

    // 数组中索引i及索引j处的元素对调位置
    private void swap(int[] array, int i, int j) {
        int temp = array[j];
        array[j] = array[i];
        array[i] = temp;
    }
}
```

tips：

- 这里也用到了双指针的思想，指针i用于替换元素（慢指针），指针j用于遍历数组（快指针）。
- 时间复杂度：O(n)，快速排序的性能和「划分」出的子数组的长度密切相关。直观地理解如果每次规模为 n 的问题都划分成 1 和 n - 1，每次递归的时候又向 n−1 的集合中递归，这种情况是最坏的，时间代价是 O(n^2)。这里引入随机化来加速这个过程，它的时间代价的期望是 O(n)。（证明过程：《算法导论》9.2）
- 空间复杂度：O(logn)，递归使用栈空间的空间代价的期望为O(logn)。

### 324. [Wiggle Sort II](https://leetcode-cn.com/problems/wiggle-sort-ii/) 摆动排序 II

给你一个整数数组 nums，将它重新排列成 nums[0] < nums[1] > nums[2] < nums[3]... 的顺序。你可以假设所有输入数组都可以得到满足题目要求的结果。  
示例：  
输入：nums = [1,3,2,2,3,1]  
输出：[2,3,1,3,1,2]

思路：  
将数组从中间位置进行等分（如果数组长度为奇数则将中间的元素分到前子数组），然后将两个子数组进行穿插（第一部分子数组所有元素小于等于第二部分子数组元素）。定义较小的子数组为A，较大的子数组为B，如果nums中存在重复元素，正序穿插可能会造成nums[i] <= nums[i+1] >= nums[i+2] <= nums[i+3]...的情况。由于穿插之后，相邻元素必来自不同子数组，当A或B内部出现重复元素是不会出现上述穿插后相邻元素可能相等的情况。所以上述情况是因为数组A和数组B出现了相同元素，使用r来表示这一元素，如果A和B都存在r，那么r一定是A的最大值，B的最小值，这意味着r一定出现在A的尾部，B的头部。如果这一重复数字的个数较少则不会出现上述情况，只有当这一数字个数达到原数组元素总数的一半，才会在穿插后的出现在相邻位置。要解决这一情况需要使A的r和B的r在穿插后尽可能分开。于是将A和B子数组反序穿插。对于此问题，实际上并不需关心A和B内部的元素顺序，只需要满足A和B长度相同（或相差1），且A中的元素小于等于B中的元素，且r出现在A的头部和B的尾部（反序插入）即可。所以不需要进行排序，而只需要找到数组的中位数，且与中位数相等的值都位于其附近。而寻找中位数可以用快速选择算法（三路快排的思路）实现。  
![](/images/2021-04-06-array-string-and-list-algorithm/324.png)

题解：

```java
class Solution {

    Random random = new Random();

    public void wiggleSort(int[] nums) {
        int index = (nums.length - 1) / 2; // 数组中位数的的索引
        randomPartition(nums, 0, nums.length -1, index);
        int[] nums2 = new int[nums.length];
        for (int i = 0; i < nums.length; i++) {
            nums2[i] = nums[i];
        }
        for(int i = index, j = nums.length -1, t = 0; j > index; i--, j--) { // 将较小及较大的子数组进行反序穿插
            nums[t++] = nums2[i];
            nums[t++] = nums2[j];
        }
        if (nums.length % 2 == 1) nums[nums.length - 1] = nums2[0]; // 数组的长度为奇数时，将较小子数组的第一个元素补到nums数组末尾
    }

    // 用于判别继续向左半部分还是右半部分划分（迭代），pivot中轴值在下一迭代部分中随机选取
    private void randomPartition(int[] nums, int left, int right, int index) {
        int pivotIndex = random.nextInt(right - left + 1) + left;
        swap(nums, pivotIndex, right); // 将pivot中值交换到数组末尾
        int result = partition(nums, left, right);
        if (result == index) return;
        if (index < result) {
            randomPartition(nums, left, result - 1, index);
        } else {
            randomPartition(nums, result + 1, right, index);
        }
    }

    // 划分的方法
    private int partition(int[] nums, int left, int right) {
        int pivot = nums[right]; // 中轴值（位于数组末尾）
        int i = left - 1; // [left, ..., i]的元素都小于pivot
        int j = right; // [j, ..., right]的元素大于pivot，(i, ..., j)的元素都等于pivot
        for (int t = left; t < j;) { // 这里遍历的边界条件判断应为小于j
            if (nums[t] < pivot) {
                swap(nums, ++i, t++);
            } else if (nums[t] > pivot) {
                swap(nums, --j, t); // 这里t不能递增，因为和--j处元素交换，--j处的元素为一不确定的值（未检查的值）
            } else { // nums[t] == pivot
                t++;
            }
        }
        if (j <= right) swap(nums, j++, right); // 将中轴值归于正确的位置，和大于pivot部分的第一个元素交换，故这里j索引就需要后移
        return (i + j) / 2; // 中轴值的索引，取(i, ..., j)的中位索引
    }

    // 数组中索引i及索引j处的元素对调位置
    private void swap(int[] array, int i, int j) {
        int temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
```

tips：

- 这道题结合了75题及215题的思路；
- 将nums1拷贝到nums2时不能使用地址引用的方式，如果nums2指向的是nums的地址，nums2则会随着nums的变化而动态变化。
- 时间复杂度：O(n)，快速排序的性能和「划分」出的子数组的长度密切相关。直观地理解如果每次规模为 n 的问题都划分成 1 和 n - 1，每次递归的时候又向 n−1 的集合中递归，这种情况是最坏的，时间代价是 O(n^2)。这里引入随机化来加速这个过程，它的时间代价的期望是 O(n)。（证明过程：《算法导论》9.2）
- 空间复杂度：O(n)，需要存储两个子数组，所以空间复杂度为O(n)。

## Ⅲ Third Maximum Number

常规数组题目，遍历，条件判断，... 。

时间复杂度：O(n)	n - 序列长度  
空间复杂度：O(1)	没有创建新的序列，只需要常数空间存放若干变量

### 414. [Third Maximum Number](https://leetcode-cn.com/problems/third-maximum-number/) 第三大的数

给你一个非空数组，返回此数组中 **第三大的数** 。如果不存在，则返回数组中最大的数。  
示例：  
输入：[2, 2, 3, 1]  
输出：1

思路：  
条件判断的顺序，跳出循环。

题解：

```java
class Solution {

    public int thirdMax(int[] nums) {
        long m1 = Long.MIN_VALUE; // 第一大的数
        long m2 = Long.MIN_VALUE; // 第二大的数
        long m3 = Long.MIN_VALUE; // 第三大的数
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] == m1 || nums[i] == m2 || nums[i] == m3) continue; // 每次循环开始不能少了这句判断，continue表示结束本次循环，继续下一次的循环
            if (nums[i] > m1) {
                m3 = m2;
                m2 = m1;
                m1 = nums[i];
            } else if (nums[i] > m2) {
                m3 = m2;
                m2 = nums[i];
            } else if (nums[i] > m3) {
                m3 = nums[i];
            }
        }
        return m3 == Long.MIN_VALUE ? (int) m1 : (int) m3; // 这里使用强制类型转换，nums[i]的范围为int类型的范围，故不会溢出报错
    }
}
```

tips：

- 不能使用快速排序算法的思路，要求返回的是数组中第三大的数，不是第三大的元素；
- 题目要求-2^31 <= nums[i] <= 2^31 - 1（int类型的取值范围），故第一二三大的数初始值应取long类型的最小取值；
- 当数据类型不一样时，将会发生数据类型转换，此题比较运算及赋值运算发生了自动类型转换；
- 为防止第一二三大的数中出现重复值，每次循环的开始都需要先判断nums[i]是否等于这三个数中的任意一个。

## Ⅳ Valid Palindrome

使用**双指针**思路的字符串的相关题目。

时间复杂度：O(n)	n - 字符串 s 的长度  
空间复杂度：O(1)或者O(n)	需要新建长度为n的数组存储字符串转换成的字符数组时空间复杂度为O(n)。

### 125. [Valid Palindrome](https://leetcode-cn.com/problems/valid-palindrome/) 验证回文串

给定一个字符串，验证它是否是回文串，只考虑字母和数字字符，可以忽略字母的大小写。空字符串为有效的回文串。  
示例：  
输入："A man, a plan, a canal: Panama"  
输出：true

题解：

```java
class Solution {
    public boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;
            while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;
            if (left < right) {
                if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) return false;
                left++;
                right--;
            }
        }
        return true;
    }
}
```

tips：

- 对JDK API中java.lang.Character类及java.lang.String类的熟悉。

### 344. [Reverse String](https://leetcode-cn.com/problems/reverse-string/) 反转字符串

编写一个函数，其作用是将输入的字符串反转过来。输入字符串以字符数组 `char[]` 的形式给出。你必须[原地](https://baike.baidu.com/item/原地算法)修改输入数组。你可以假设数组中的所有字符都是 [ASCII](https://baike.baidu.com/item/ASCII) 码表中的可打印字符。  
示例：  
输入：["h","e","l","l","o"]  
输出：["o","l","l","e","h"]

题解：

```java
class Solution {
    public void reverseString(char[] s) {
        int left = 0, right = s.length - 1;
        while (left < right) swap(s, left++, right--);
    }

    private void swap(char[] array, int i, int j) {
        char temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
```

### 345. [Reverse Vowels of a String](https://leetcode-cn.com/problems/reverse-vowels-of-a-string/) 反转字符串中的元音字母

编写一个函数，以字符串作为输入，反转该字符串中的元音字母。  
示例：  
输入："leetcode"  
输出："leotcede"

题解：

```java
class Solution {
    public String reverseVowels(String s) {
        char[] sArray = s.toCharArray();
        int left = 0, right = sArray.length - 1;
        while (left < right) {
            while (left < right && !isVowel(sArray, left)) left++;
            while (left < right && !isVowel(sArray, right)) right--;
            if (left < right) swap(sArray, left++, right--);
        }
        return String.valueOf(sArray);
    }

    private void swap(char[] array, int i, int j) {
        char temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    private boolean isVowel(char[] array, int index) {
        if (array[index] == 'a' || array[index] == 'e' || array[index] == 'i' || array[index] == 'o' || array[index] == 'u' || array[index] == 'A' || array[index] == 'E' || array[index] == 'I' || array[index] == 'O' || array[index] == 'U') return true;
        return false;
    }
}
```

tips：

- 使用方法封装一部分功能(比如条件判断)很重要；
- char类型在运算的时候会被首先提升为int类型然后再计算；
- 对JDK API中java.lang.String类的熟悉。

### 680. [Valid Palindrome II](https://leetcode-cn.com/problems/valid-palindrome-ii/) 验证回文字符串 Ⅱ

给定一个非空字符串 `s`，最多删除一个字符。判断是否能成为回文字符串。字符串只包含从 a-z 的小写字母。  
示例：  
输入："abca"  
输出：true

题解：

```java
class Solution {
    public boolean validPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        left = isValidPalindrome(s, left, right);
        if (left == -1) {
            return true;
        } else {
            right = s.length() - 1 - left;
            if (isValidPalindrome(s, left + 1, right) == -1 || isValidPalindrome(s, left, right - 1) == -1) return true;
        }
        return false;
    }

    // 判断子字符串是否为回文串的方法
    private int isValidPalindrome(String s, int left, int right) {
        while (left < right) {
            if (s.charAt(left) == s.charAt(right)) {
                left++;
                right--;
            } else {
                return left; // 当前子串不是回文字符串时返回第一个不符合回文条件的left索引
            }
        }
        return -1; // 当前子串是回文字符串时返回-1
    }
}
```

tips：

- 使用方法封装一部分功能（比如条件判断）很重要，在此题中如果不将判断一个子串是否为回文串封装为一个方法，将其判断写在方法内部则会使代码逻辑冗赘。

### 541. [Reverse String II](https://leetcode-cn.com/problems/reverse-string-ii/) 反转字符串 II

给定一个字符串 `s` 和一个整数 `k`，你需要对从字符串开头算起的每隔 `2k` 个字符的前 `k` 个字符进行反转。如果剩余字符少于 k 个，则将剩余字符全部反转。如果剩余字符小于 2k 但大于或等于 k 个，则反转前 k 个字符，其余字符保持原样。  
示例：  
输入：s = "abcdefg", k = 2  
输出："bacdfeg"

题解：

```java
class Solution {
    public String reverseStr(String s, int k) {
        char[] sArray = s.toCharArray();
        int left = 0;
        int right = 0; // 初始化，防止写在循环内部导致重复定义
        while (left < sArray.length) {
            // 剩余字符少于k个将剩余字符全部反转，剩余字符大于或等于k个反转前k个字符
            right = sArray.length - left < k ? sArray.length - 1 : left + k - 1;
            swap(sArray, left, right);
            left += 2 * k;
        }
        return String.valueOf(sArray);
    }

    private void swap(char[] array, int left, int right) {
        while (left < right) {
            char temp = array[left];
            array[left++] = array[right];
            array[right--] = temp;
        }
    }
}
```

tips：

- 当然并非所有题目都要优先考虑将一部分功能（比如条件判断、数组元素交换等）用方法封装起来，相比680题，在此题中可以将条件判断、数组元素交换各封装为一个方法，但必要性不大，完全可以清晰地写在原方法中；
- 判断时只需要使用子串起始索引left就可以，不需要再附加终止索引right的判断。

### 557. [Reverse Words in a String III](https://leetcode-cn.com/problems/reverse-words-in-a-string-iii/) 反转字符串中的单词 III

给定一个字符串，你需要反转字符串中每个单词的字符顺序，同时仍保留空格和单词的初始顺序。在字符串中，每个单词由单个空格分隔，并且字符串中不会有任何额外的空格。  
示例：  
输入："Let's take LeetCode contest"  
输出："s'teL ekat edoCteeL tsetnoc"

题解：

```java
class Solution {
    public String reverseWords(String s) {
        char[] sArray = s.toCharArray();
        int left = 0;
        int right = 0; // 初始化，防止写在循环内部导致重复定义
        while (left < sArray.length) {
            right = left + 1;
            while (right < sArray.length && sArray[right] != ' ') right++;
            swap(sArray, left, right - 1);
            left = right + 1;
        }
        return new String(sArray); // 使用构造方法的方式
    }

    private void swap(char[] array, int left, int right) {
        while (left < right) {
            char temp = array[left];
            array[left++] = array[right];
            array[right--] = temp;
        }
    }
}
```

tips：

- 与541题思路相同；
- 对于数组来说，使用[]索引取值，就需要注意是否越界问题。