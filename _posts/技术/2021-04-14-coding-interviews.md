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
**常规数组题目，遍历，条件判断**。由于 nums 的数字范围均在 [0,n-1] 中， 此说明含义：数组元素的 索引 和 值 是 一对多 的关系，可以利用这一范围之外的数字，来表达「是否存在」的含义。遍历 nums 每遇到一个数 x（原数组中元素），就将 nums[x] 增加 n。由于 nums 中所有数均在 [0,n-1] 中，增加以后这些数必然大于等于 n。当遍历过程中遇到 nums[x]>=n 则说明此索引 x（原数组中元素）之前出现过，返回其值nums[i]。当遍历到某个位置时，其中的数可能已经被增加过，因此需要对 n 取模还原出它本来的值。

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

- **双指针**。思路与240题相同；
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

- **常规字符串题目，遍历，条件判断**；
- 时间复杂度：O(n)
- 空间复杂度：O(n)

### 09. [用两个栈实现队列](https://leetcode-cn.com/problems/yong-liang-ge-zhan-shi-xian-dui-lie-lcof/)

用两个栈实现一个队列。队列的声明如下，请实现它的两个函数 appendTail 和 deleteHead ，分别完成在队列尾部插入整数和在队列头部删除整数的功能。(若队列中没有元素，deleteHead 操作返回 -1 )  
示例：  
输入：["CQueue","appendTail","deleteHead","deleteHead"]  
ㅤㅤㅤ[[],ㅤㅤㅤㅤ[3],ㅤㅤ ㅤ ㅤ [],ㅤㅤㅤㅤㅤ []]  
输出：[null, ㅤ ㅤ null,ㅤㅤㅤ ㅤ 3,ㅤㅤㅤㅤㅤ -1]

思路：  
**数据结构及其设计**。定义两个栈为成员变量，stack1用于实现队列添加元素功能，satck2用于实现队列删除元素功能。当queue添加元素则将其入栈stack1，当queue删除元素：弹出stack2栈顶元素返回（stack2不为空）；将stack1中的所有元素弹出再入栈stack2直到stack1为空后弹出stack2栈顶元素返回（stack2为空，即可将当前queue未删除的元素翻转入栈，弹出即删除时自然为队列的先进先出）；返回-1（stack1和stack2都为空，表示queue已为空）。

题解：

```java
class CQueue {

    private Stack<Integer> stack1;
    private Stack<Integer> stack2;

    public CQueue() {
        stack1 = new Stack<>();
        stack2 = new Stack<>();
    }
    
    public void appendTail(int value) {
        stack1.push(value);
    }
    
    public int deleteHead() {
        if (!stack2.empty()) return stack2.pop();
        while (!stack1.empty()) {
            stack2.push(stack1.pop());
        }
        if (!stack2.empty()) return stack2.pop();
        return -1;
    }
}

/**
 * Your CQueue object will be instantiated and called as such:
 * CQueue obj = new CQueue();
 * obj.appendTail(value);
 * int param_2 = obj.deleteHead();
 */
```

tips：

- 时间复杂度：O(1)，每个元素只会「至多被插入和弹出 stack2 一次」，因此均摊下来每个元素被删除的时间复杂度仍为 O(1)
- 空间复杂度：O(n)

### 10- I. [斐波那契数列](https://leetcode-cn.com/problems/fei-bo-na-qi-shu-lie-lcof/)

写一个函数，输入 n ，求斐波那契（Fibonacci）数列的第 n 项（即 F(N)）。斐波那契数列的定义如下：F(0) = 0,   F(1) = 1,   F(N) = F(N - 1) + F(N - 2),   其中 N > 1。斐波那契数列由 0 和 1 开始，之后的斐波那契数就是由之前的两数相加而得出。答案需要取模 1e9+7（1000000007），如计算初始结果为：1000000008，请返回 1。0 <= n <= 100。  
示例：  
输入：n = 5  
输出：5

思路：  
**动态规划**。利用斐波那契数列性质 f(n) = f(n - 1) + f(n - 2) 来进行迭代求解。  
动态规划：将每次前两数之和存起来，便于下次直接使用。将 f(n - 1) 和 f(n - 2) 定义为局部变量 preOne 和 preTwo，迭代的一次求和后，下一个 preOne 则等于 preTwo，下一个 preTwo 则等于 sum。  
借助数组进行迭代求解：fibArray[i] = (fibArray[i - 1] + fibArray[i - 2])。  
递归：return fib(n - 1) + fib(n - 2); ，超时。  
递归优化（记忆化递归）：使用数组存储已求解过的值进行优化。

题解：

```java
// 动态规划求法 tc：O(n)    sc：O(1)
class Solution {
    public int fib(int n) {
        if (n < 2) return n;
        int preOne = 0, preTwo = 1;
        int sum = 0;
        for (int i = 2; i <= n; i++) {
            sum = (preOne + preTwo) % 1000000007;
            preOne = preTwo;
            preTwo = sum;
        }
        return sum;
    }
}

// 数组常规迭代求法 tc：O(n)    sc：O(n)
/*class Solution {
    public int fib(int n) {
        if (n < 2) return n;
        int[] fibArray = new int[n + 1];
        fibArray[0] = 0;
        fibArray[1] = 1;
        for (int i = 2; i <= n; i++) {
            fibArray[i] = (fibArray[i - 1] + fibArray[i - 2]) % 1000000007;
        }
        return fibArray[n];
    }
}*/

// 递归求法 tc：O(2^n)    sc：O(n)（超时，重复求解已求解过的值）
/*class Solution {public int fib(int n) {
    public int fib(int n) {
        if (n < 2) return n;
        return (fib(n - 1) + fib(n - 2)) % 1000000007;
    }
}*/

// 递归求法优化（记忆化递归） tc：O(n)    sc：O(max(n))
/*class Solution {
    int[] fibArray = new int[101];
    public int fib(int n) {
        if (n < 2) return n;
        if (fibArray[n] == 0) fibArray[n] = (fib(n - 2) + fib(n - 1)) % 1000000007;
        return fibArray[n];
    }
}*/
```

tips：

- 适合于用动态规划求解的问题，经分解得到子问题往往不是互相独立的 (即下一个子阶段的求解是建立在上一个子阶段的解的基础上，进行进一步的求解)；
- 时间复杂度：O(n)
- 空间复杂度：O(1) 动态规划；O(n) 迭代；O(max(n)) 记忆化递归

### 10- II. [青蛙跳台阶问题](https://leetcode-cn.com/problems/qing-wa-tiao-tai-jie-wen-ti-lcof/)

一只青蛙一次可以跳上1级台阶，也可以跳上2级台阶。求该青蛙跳上一个 n 级的台阶总共有多少种跳法。答案需要取模 1e9+7（1000000007），如计算初始结果为：1000000008，请返回 1。  
示例：  
输入：n = 2 ㅤ ㅤ | ㅤn = 0  
输出：2 (n = 2)ㅤ | ㅤ1 (n = 0)

思路：  
**动态规划+数学（斐波那契数列）**。设跳上 n 级台阶有 f(n) 种跳法。在所有跳法中，青蛙的最后一步只有两种情况：跳上 1 级或 2 级台阶。当为 1 级台阶： 剩 n−1 个台阶，此情况共有 f(n−1) 种跳法；当为 2 级台阶： 剩 n−2 个台阶，此情况共有 f(n−2) 种跳法。f(n) 为以上两种情况之和，即 f(n)=f(n−1)+f(n−2) ，以上递推性质为斐波那契数列。故本题可转化为 求斐波那契数列第 n+1 项的值（青蛙跳台阶问题：f(0)=1 , f(1)=1 , f(2)=2；斐波那契数列问题： f(0)=0 , f(1)=1 , f(2)=1，前者序列为后者序列后移一位，故应求解斐波那契数列第 n+1 项的值）。

题解：

```java
class Solution {
    public int numWays(int n) {
        int preOne = 0, preTwo = 1;
        int sum = 1; // n = 0时则返回1
        for (int i = 1; i <= n; i++) { // 多计算一个，sum计算的总为F(i+1)，迭代结束sum为斐波那契数列的第n+1项即F(n+1)
            sum = (preOne + preTwo) % 1000000007;
            preOne = preTwo;
            preTwo = sum;
        }
        return sum;
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(1)