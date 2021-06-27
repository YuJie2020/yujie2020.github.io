---
layout: post
title: 动态规划-相关算法
description: 抽出LeetCode题库中动态规划相关的算法题目，再以相似类型的题目进行分类归纳总结题解。
category: 技术

---

## introduction 

抽出LeetCode题库中动态规划相关的算法题目，再以相似类型的题目进行分类归纳总结题解。  
并非每道题目的解法都是它的最优写法，只是在尽量保证代码执行高效性的前提下，为了归纳总结便于记忆而给定的解法，故这里每道题的题解也都只列出了一种写法。

将大问题划分为小问题进行解决，从而一步步获取最优解的处理算法。动态规划算法与分治算法类似，其基本思想也是将待求解问题分解成若干个子问题，先求解子问题，然后从这些子问题的解得到原问题的解。  
**与分治算法不同的是，适合于用动态规划求解的问题，经分解得到子问题往往不是互相独立的 ( 即下一个子阶段的求解是建立在上一个子阶段的解的基础上，进行进一步的求解 )**。若用分治算法来解这类问题，则分解得到的子问题数目太多，有些子问题被重复计算了很多次。如果我们能够保存已解决的子问题的答案，而在需要时再找出已求得的答案，这样就可以避免大量的重复计算，节省时间。可以用一个表来记录所有已解的子问题的答案。不管该子问题以后是否被用到，只要它被计算过，就将其结果填入表中。这就是动态规划法的基本思路。

### 238. [Product of Array Except Self](https://leetcode-cn.com/problems/product-of-array-except-self/) 除自身以外数组的乘积

给你一个长度为 n 的整数数组 nums，其中 n > 1，返回输出数组 output ，其中 output[i] 等于 nums 中除 nums[i] 之外其余各元素的乘积。请不要使用除法，且在 O(*n*) 时间复杂度内完成此题。  
示例：  
输入：[1,2,3,4]  
输出：[24,12,8,6]

思路：  
output[i] 表示的乘积 = 当前数 i 左边的乘积 * 当前数 i 右边的乘积。使用两次循环来分别求解左边的乘积和右边的乘积。

题解：

```java
class Solution {
    public int[] productExceptSelf(int[] nums) {
        int len = nums.length; // len > 1
        int[] result = new int[len];
        int l = 1, r = 1; // l为当前索引（包含）左边元素的乘积，r为当前索引（包含）右边元素的乘积
        for (int i = 0; i < len; i++) { // result[i] = nums[0,...,i-1]中元素的乘积
            result[i] = l;
            l *= nums[i];
        }
        for (int i = len - 1; i >= 0; i--) { // result[i] *= nums[i+1,...,end]中元素的乘积
            result[i] *= r; // 这里为 *=
            r *= nums[i];
        }
        return result;
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(1)，输出数组不被视为额外空间

### 338. [Counting Bits](https://leetcode-cn.com/problems/counting-bits/) 比特位计数

给定一个非负整数 num。对于 0 ≤ i ≤ num 范围中的每个数字 i ，计算其二进制数中的 1 的数目并将它们作为数组返回。要求算法的空间复杂度为O(n)。要求在C++或任何其他语言中不使用任何内置函数（如 C++ 中的 __builtin_popcount）来执行此操作。  
示例：  
输入：5  
输出：[0,1,1,2,1,2]

思路：  
动态规划+位运算。  
n 为奇数时：奇数 n 二进制表示中 1 的个数一定比前面的偶数 n - 1 多一个 1，因为多的这个 1 就是 n 最低位的 1。  
eg：0 <-> 0，1 <-> 1；2 <-> 10，3 <-> 11。  
n 为偶数时：偶数 n 二进制表示中 1 的个数一定和其除以 2 之后的 n/2 一样多，因为 n 最低位为 0，除以 2 就是右移一位，即将最低位的 0 抹掉，所以 1 的个数是不变的。  
eg：2 <-> 10，4 <-> 100，8 <-> 1000；3 <-> 11，6 <-> 110，12 <-> 1100。  
对于 n = 0，其二进制中 1 的个数为 0，遍历数字 0~n，对于偶数 i 其 result[i] = result[i \>\> 1] + 0（状态转移方程）；对于奇数 i，其 result[i] = result[i - 1] + 1，而 result[i - 1] = result[(i - 1) \>\> 1] = result[i \>\> 1]，故 result[i] = result[i \>\> 1] + 1（状态转移方程）。将两种情况合二为一，对于奇数和偶数情况的状态转移方程仅第二部分不同，定义 i & 1，当 i 为偶数其结果为 0，为奇数其结果为 1。

题解：

```java
class Solution {
    public int[] countBits(int n) {
        int[] result = new int[n + 1]; // 整数 i 的二进制表示中的 1 的数目为 dp[i]
        for (int i = 0; i <= n; i++) {
            result[i] = result[i >> 1] + (i & 1); // 状态转移方程
        }
        return result;
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(1)

### 279. [Perfect Squares](https://leetcode-cn.com/problems/perfect-squares/) 完全平方数

给定正整数 n，找到若干个完全平方数（比如 1, 4, 9, 16, ...）使得它们的和等于 n。你需要让组成和的完全平方数的个数最少。给你一个整数 n ，返回和为 n 的完全平方数的 最少数量 。1 <= n <= 10^4。完全平方数 是一个整数，其值等于另一个整数的平方；换句话说，其值等于一个整数自乘的积。例如，1、4、9 和 16 都是完全平方数，而 3 和 11 不是。  
示例：  
输入：n = 12  
输出：3  
解释：12 = 4 + 4 + 4 279_1.png

思路：  
1) 图的广度优先遍历。将 0 ～ n 的值转化为一有向无权图（多叉树）中的节点，且相同值的节点唯一，对于任意节点其可以与其他节点相连接，连接的条件为两节点值的差为一完全平方数，并且总是由值较大的节点指向值较小的节点。  
![](/images/2021-06-03-dynamic-programming/279_1.png)  
对于和为 n 的完全平方数的最少数量即：图中从值为 n 的节点到达值为 0 的节点的最短路径（任意两连通节点的差值总为一完全平方数）。  
![](/images/2021-06-03-dynamic-programming/279_2.jpg)  
2) 动态规划。状态表达式：dp[i] 表示最少需要多少个数的平方和来表示整数 i ，这些数必然落在区间 [1, sqrt(n)] 。枚举这些数，假设当前枚举到 j，则还需要取若干数的平方，构成 i−j^2 。此时该子问题和原问题类似，只是规模变小了，这符合了动态规划的要求，于是可以得到状态转移方程：  
*dp*[*i*] = 1 + min*dp*[*i* - *j*^2]，其中 *j* ∈ [1, *sqtr(i)*]  
dp[0] = 0 为边界条件，实际上无法表示数字 0，只是为了保证状态转移过程中遇到 j 恰为 sqtr(i) 的情况合法。同时计算 dp[i] 时所需要用到的状态仅有 dp[i-j^2]，**其必然小于 i （和为 i 的平方和数 dp[i] 前面已计算得到结果）**，因此只需要从小到大地枚举 i 来计算 dp[i] 即可。

题解：

```java
// 广度优先遍历
/*class Solution {
    public int numSquares(int n) {
        Queue<Integer> queue = new LinkedList<>();
        queue.offer(n);
        boolean[] isVisited = new boolean[n + 1]; // 记录某一节点是否被访问过：图中不同数字的节点唯一，即不会出现两个值重复的节点；与此同时，在某条路径下较少的步数访问到了某个值的节点，在后面的步数中再次访问到此节点时此路径下最后到达0的步数一定比前者多，故需要舍去
        isVisited[n] = true; // 将值为 n 的节点置为已访问
        int result = 0; // 图中从 n 节点到达 0 节点的步数
        while (!queue.isEmpty()) {
            int count = queue.size(); // 当前层（步数）下的节点数：当前步数可以到达的数值节点
            result++;
            while (count != 0) {
                int cur = queue.poll();
                for (int i = 1; ; i++) { // 从 1、4、9... 开始：枚举当前节点可以到达的下一节点
                    int next = cur - i * i; // 下一节点的值
                    if (next < 0) break; // 小于 0 代表枚举结束
                    if (next == 0) return result; // 找到最短路径：方法直接返回
                    if (!isVisited[next]) {
                        queue.offer(next); // 将有效的下一节点（下一步可以到达的节点）存入队列
                        isVisited[next] = true; // 将此下一节点标记为已访问
                    }
                }
                count--;
            }
        }
        return result;
    }
}*/

// 动态规划
class Solution {
    public int numSquares(int n) {
        int[] dp = new int[n + 1]; // 状态表达式：和为整数 i 的完全平方数的最少数量为 dp[i]
        for (int i = 1; i < n + 1; i++) { // 从小到大枚举计算每一个整数的平方和最小个数（前面计算得到的结果后面可能会用到）
            int minStep = Integer.MAX_VALUE; // 所需完全平方数的最少数量，即 min{dp[i - j^2]}
            for (int j = 1; j * j <= i; j++) minStep = Math.min(minStep, dp[i - j * j]); // 求解 min{dp[i - j^2]}
            dp[i] = minStep + 1; // 状态转移方程
        }
        return dp[n];
    }
}
```

tips：

- 时间复杂度：O(n * sqrt(n))，由四平方和定理：任意一个正整数都可以被表示为至多四个正整数的平方和，三层循环中最外层最多循环四次，中间层循环最多n次，最内层循环至多 sqrt(n) 次，广度优先遍历；状态转移方程的时间复杂度为 O(sqrt(n))，共需要计算 n 个状态（数值），因此总时间复杂度为 O(n * sqrt(n))，动态规划
- 空间复杂度：O(n)