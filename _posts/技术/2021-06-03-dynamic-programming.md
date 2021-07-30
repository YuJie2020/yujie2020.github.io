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

定义**状态表达式**，初始化 base case，穷举每个状态进行状态转移（依据**状态转移方程**），对每个状态的结果求最值。

```java
// base case
dp[0][0][...] = base; // 状态表达式
// 穷举每个状态进行状态转移
for 状态1 in 状态1的所有取值：
    for 状态2 in 状态2的所有取值：
        for ...
            dp[状态1][状态2][...] = 求最值（选择1，选择2，...）  // 状态转移方程
```

大多数动态规划问题本质都是递归的问题，递归的过程中存在重叠子问题（即存在相同情况重复计算），也存在最优子结构（性质：针对求解的问题是求解一个最优化的问题，要求得整个问题的最优解只需求出所有子问题的最优解，即知道子问题的最优解就可以知道原问题的最优解；同时求子问题最优解的过程中还存在重叠子问题的形式）。对于重叠子问题，一可以采用记忆化搜索来解决（自顶向下的解决问题），二可以采用动态规划来解决（自底向上的解决问题，本质上和记忆化搜索是一样的）。  
对于动态规划问题，一般自顶向下的思考问题比自底向上容易，所以一般先自顶向下的思考问题，之后再使用自底向上的方法来进行实现。（**解决动态规划问题应该的思考顺序过程**）  
![](/images/2021-06-03-dynamic-programming/introduction.png)  
具体可以参照120题为例。

### 120. [Triangle](https://leetcode-cn.com/problems/triangle/) 三角形最小路径和

给定一个三角形 triangle ，找出自顶向下的最小路径和。每一步只能移动到下一行中相邻的结点上。相邻的结点 在这里指的是 下标 与 上一层结点下标 相同或者等于 上一层结点下标 + 1 的两个结点。也就是说，如果正位于当前行的下标 i ，那么下一步可以移动到下一行的下标 i 或 i + 1 。1 <= triangle.length <= 200。triangle[0].length == 1。triangle[i].length == triangle[i - 1].length + 1。-10^4 <= triangle\[i\]\[j\] <= 10^4。  
示例：  
输入：triangle = [[2],[3,4],[6,5,7],[4,1,8,3]]

```
   2
  3 4
 6 5 7
4 1 8 3
```

输出：11  
解释：自顶向下的最小路径和为 11（即，2 + 3 + 5 + 1 = 11）。

思路：  
存在重叠子问题的递归 -> 记忆化搜索（递归）-> 动态规划。先从自顶向下的角度分析问题，再使用自底向上的方式解决问题。

题解：

```java
// 递归，存在重叠子问题：超时（**递归只需要关注当前递归层级要解决的问题即可**）
/*class Solution {
    public int minimumTotal(List<List<Integer>> triangle) {
        return minimumTotal(triangle, 0, 0);
    }

    private int minimumTotal(List<List<Integer>> triangle, int i, int j) {
        if (i >= triangle.size() || j > i) return 0;
        return triangle.get(i).get(j) + Math.min(minimumTotal(triangle, i + 1, j), minimumTotal(triangle, i + 1, j + 1));
    }
}*/

// 记忆化搜索（递归），使用数组 memo 存储已求解过的位置
/*class Solution {
    public int minimumTotal(List<List<Integer>> triangle) {
        int row = triangle.size();
        int[] memo = new int[(row + row * row) / 2 + 1];
        Arrays.fill(memo, Integer.MAX_VALUE);
        return minimumTotal(triangle, 0, 0, memo);
    }

    private int minimumTotal(List<List<Integer>> triangle, int i, int j, int[] memo) {
        if (i >= triangle.size() || j > i) return 0; // 越界：返回 0（递归边界条件）
        int index = (i + i * i) / 2 + j + 1;
        if (memo[index] != Integer.MAX_VALUE) return memo[index];
        memo[index] = triangle.get(i).get(j) + Math.min(minimumTotal(triangle, i + 1, j, memo), minimumTotal(triangle, i + 1, j + 1, memo));
        return memo[index];
    }
}*/

// 动态规划（自底向上）：分析记忆化搜索（自顶向下）的过程可得，可以从最底部开始向上来计算结果
class Solution {
    public int minimumTotal(List<List<Integer>> triangle) {
        int[] dp = new int[triangle.size() + 1]; // 状态表达式（base case 即为 0）：某一行中第 i 个下标元素的最小路径和为 dp[i]
        for (int i = triangle.size() - 1; i >= 0; i--) {
            for (int j = 0; j <= i; j++) {
                dp[j] = triangle.get(i).get(j) + Math.min(dp[j], dp[j + 1]); // 状态转移方程
            }
        }
        return dp[0];
    }
}
```

tips：

- 时间复杂度：O(n^2)
- 空间复杂度：O(n)

### 64. [Minimum Path Sum](https://leetcode-cn.com/problems/minimum-path-sum/) 最小路径和

给定一个包含非负整数的 `m x n` 网格 `grid` ，请找出一条从左上角到右下角的路径，使得路径上的数字总和为最小。每次只能向下或者向右移动一步。1 <= m, n <= 200。0 <= grid\[i\]\[j\] <= 100。  
示例：  
输入：grid = [[1,3,1],[1,5,1],[4,2,1]]  
![](/images/2021-06-03-dynamic-programming/64.jpg)  
输出：7

题解：

```java
class Solution {
    public int minPathSum(int[][] grid) { // 将原矩阵作为状态表达式：grid[i][j] 处的最小路径和为 grid[i][j]
        for (int i = grid.length - 2; i >= 0; i--) { // base case
            grid[i][grid[0].length - 1] += grid[i + 1][grid[0].length - 1];
        }
        for (int i = grid[0].length -2; i >= 0; i--) { // base case
            grid[grid.length - 1][i] += grid[grid.length - 1][i + 1];
        }
        for (int i = grid.length - 2; i >= 0; i--) {
            for (int j = grid[0].length - 2; j >= 0; j--) {
                grid[i][j] += Math.min(grid[i + 1][j], grid[i][j + 1]); // 状态转移方程
            }
        }
        return grid[0][0];
    }
}
```

tips：

- 思路与120题相似。自底向上；
- 时间复杂度：O(mn)，每个元素会被遍历一次
- 空间复杂度：O(1)，使用原地算法，直接修改原矩阵

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

### 70. [Climbing Stairs](https://leetcode-cn.com/problems/climbing-stairs/) 爬楼梯

假设你正在爬楼梯。需要 *n* 阶你才能到达楼顶。每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？给定 *n* 是一个正整数。  
示例：  
输入：3  
输出：3

思路：  
动态规划+数学（斐波那契数列）。设跳上 n 级台阶有 f(n) 种跳法。在所有跳法中，青蛙的最后一步只有两种情况：跳上 1 级或 2 级台阶。当为 1 级台阶： 剩 n−1 个台阶，此情况共有 f(n−1) 种跳法；当为 2 级台阶： 剩 n−2 个台阶，此情况共有 f(n−2) 种跳法。f(n) 为以上两种情况之和，即 f(n)=f(n−1)+f(n−2) ，以上递推性质为斐波那契数列。故本题可转化为 求斐波那契数列第 n+1 项的值（青蛙跳台阶问题：f(0)=1 , f(1)=1 , f(2)=2；斐波那契数列问题： f(0)=0 , f(1)=1 , f(2)=1，前者序列为后者序列后移一位，故应求解斐波那契数列第 n+1 项的值）。

题解：

```java
class Solution {
    public int climbStairs(int n) {
        int preOne = 1, preTwo = 1;
        for (int i = 2; i <= n; i++) {
            int sum = preOne + preTwo;
            preOne = preTwo;
            preTwo = sum;
        }
        return preTwo;
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(1)

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
解释：12 = 4 + 4 + 4

思路：  
1) 图的广度优先遍历。将 0 ～ n 的值转化为一有向无权图（多叉树）中的节点，且相同值的节点唯一，对于任意节点其可以与其他节点相连接，连接的条件为两节点值的差为一完全平方数，并且总是由值较大的节点指向值较小的节点。  
![](/images/2021-06-03-dynamic-programming/279_1.png)  
对于和为 n 的完全平方数的最少数量即：图中从值为 n 的节点到达值为 0 的节点的最短路径（任意两连通节点的差值总为一完全平方数）。  
![](/images/2021-06-03-dynamic-programming/279_2.jpg)  
2) 动态规划。状态表达式：dp[i] 表示最少需要多少个数的平方和来表示整数 i ，这些数必然落在区间 [1, sqrt(n)] 。枚举这些数，假设当前枚举到 j，则还需要取若干数的平方，构成 i−j^2 。此时该子问题和原问题类似，只是规模变小了，这符合了动态规划的要求，于是可以得到状态转移方程：  
*dp*[*i*] = 1 + min*dp*[*i* - *j*^2]，其中 *j* ∈ [1, *sqtr(i)*]  
dp[0] = 0 为 base case，实际上无法表示数字 0，只是为了保证状态转移过程中遇到 j 恰为 sqtr(i) 的情况合法。同时计算 dp[i] 时所需要用到的状态仅有 dp[i-j^2]，**其必然小于 i （和为 i 的平方和数 dp[i] 前面已计算得到结果）**，因此只需要从小到大地枚举 i 来计算 dp[i] 即可。

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

### 322. [Coin Change](https://leetcode-cn.com/problems/coin-change/) 零钱兑换

给你一个整数数组 coins ，表示不同面额的硬币；以及一个整数 amount ，表示总金额。计算并返回可以凑成总金额所需的 最少的硬币个数 。如果没有任何一种硬币组合能组成总金额，返回 -1 。你可以认为每种硬币的数量是无限的。1 <= coins.length <= 12。0 <= amount <= 10^4。  
示例：  
输入：coins = [1, 2, 5], amount = 11ㅤ|ㅤcoins = [2], amount = 3  
输出：3ㅤ|ㅤ-1  
解释：11 = 5 + 5 + 1ㅤ|ㅤ没有任何一种硬币组合能组成总金额

思路：  
思路与279题相似。自底向上，考虑金额为 i 的情况，之会使用到之前小于 i 的已考虑过的情况。对每一总金额，减去所有可能的硬币币值，再取凑成减去后的剩余总金额的最少硬币数的最小值即可。  
所需硬币的最少个数 curMin，对于每个金额的情况初始化值为 amount + 1（存在面值为1的硬币时，最多也只需要 amount 个）。当一种情况无效时（即没有任何一种硬币组合能组成总金额 i，则 dp[i] = amount + 1）；当考虑之后总金额大于 i 的情况，一种 coin 情况使用到之前无效的 dp[i]，其 curMin 只会还是比 amount 大，当使用另一种 coin 情况其 curMin 会比 amount 小，自然会淘汰无效的情况。

题解：

```java
class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1]; // 状态表达式：凑成总金额 i 所需的最少的硬币个数为 dp[i]
        for (int i = 1; i <= amount; i++) { // base case: dp[0] = 0
            int curMin = amount + 1; // 所需硬币的最少个数
            for (int coin : coins) {
                if (i - coin < 0) continue; // 面额为负则跳过此次循环
                curMin = Math.min(curMin, dp[i - coin]);
            }
            dp[i] = curMin + 1; // 状态转移方程
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}
```

tips：

- 时间复杂度：O(nk)，n 为面额数，k 为总金额
- 空间复杂度：O(k)