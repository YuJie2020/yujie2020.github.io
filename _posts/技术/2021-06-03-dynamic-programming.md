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

### 91. [Decode Ways](https://leetcode-cn.com/problems/decode-ways/) 解码方法

一条包含字母 A-Z 的消息通过以下映射进行了编码：  
'A' -> "1"  
'B' -> "2"  
...  
'Z' -> "26"  
要解码已编码的消息，所有数字必须基于上述映射的方法，反向映射回字母（可能有多种方法）。例如，"11106" 可以映射为：  
"AAJF" ，将消息分组为 (1 1 10 6)  
"KJF" ，将消息分组为 (11 10 6)  
注意，消息不能分组为  (1 11 06) ，因为 "06" 不能映射为 "F" ，这是由于 "6" 和 "06" 在映射中并不等价。  
给你一个只含数字的 非空 字符串 s ，请计算并返回解码方法的总数 。  
题目数据保证答案肯定是一个32 位的整数。  
示例：  
输入：s = "12"ㅤ|ㅤs = "226"  
输出：2ㅤ|ㅤ3

思路：  
思路与120题相似。树形结构问题，并且存在重叠子问题，使用记忆化搜索（递归）的方法，子串都为从某位置到原字符串末尾的形式，某一子串的解码方法总数 = 除去第一个字符的子串解码方法总数 + 除去前两个字符的子串解码方法总数。

```
       1212
      /    \
    212    12
   /   \
  12    2
...
```

动态规划：自底向上。观察后，总为两数相加（类似斐波纳契数列），故可以使用两个变量来记录这两个数，降低时间复杂度。

题解：

```java
// 记忆化递归 tc: O(n^2) sc: O(n)
/*class Solution {

    public int numDecodings(String s) {
        return numDecodings(s, 0, new int[s.length()]);
    }

    private int numDecodings(String s, int index, int[] memo) { // 子串都为从 index 到原始字符串末尾的形式
        if (index == memo.length) return 1; // s 为空，到达末尾，也算一种编码方式
        if (memo[index] != 0) return memo[index];
        if (s.charAt(0) == '0') return 0; // 0 开头的子串 s 无效
        if (index == memo.length - 1) return 1; // 只有一种编码方式
        int result = numDecodings(s.substring(1), index + 1, memo);
        if ((s.charAt(0) - '0') * 10 + s.charAt(1) - '0' < 27) result += numDecodings(s.substring(2), index + 2, memo); // 两位数编码有效
        memo[index] = result;
        return result;
    }
}*/

// 动态规划 tc: O(n) sc: O(n)
/*class Solution {
    public int numDecodings(String s) {
        if (s.charAt(0) == '0') return 0;
        int[] dp = new int[s.length() + 1]; // 状态表达式：dp[i] 表示子串 s[i, end] 的编码方式总数
        dp[dp.length - 1] = 1; // base case，全取也算一种有效编码
        dp[dp.length - 2] = s.charAt(dp.length - 2) == '0' ? 0 : 1;
        for (int i = dp.length - 3; i >= 0; i--) {
            if (s.charAt(i) == '0') {
                dp[i] = 0;
                continue;
            }
            dp[i] = dp[i + 1];
            if ((s.charAt(i) - '0') * 10 + s.charAt(i + 1) - '0' < 27) dp[i] += dp[i + 2]; // 状态转移方程
        }
        return dp[0];
    }
}*/

// 动态规划（优化，降维） tc: O(n) sc: O(1)
class Solution {
    public int numDecodings(String s) {
        int pre = s.charAt(s.length() - 1) == '0' ? 0 : 1;
        int next = 1;
        int sum = pre; // 初始化为 pre：当 s 为一位数时算法执行有效
        for (int i = s.length() - 2; i >= 0; i--) {
            if (s.charAt(i) == '0') {
                sum = 0;
                next = pre;
                pre = sum;
                continue;
            }
            sum = pre;
            if ((s.charAt(i) - '0') * 10 + s.charAt(i + 1) - '0' < 27) sum += next;
            next = pre;
            pre = sum;
        }
        return sum;
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(1)

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

### 63. [Unique Paths II](https://leetcode-cn.com/problems/unique-paths-ii/) 不同路径 II

一个机器人位于一个 m x n 网格的左上角 （起始点在下图中标记为 “Start” ）。机器人每次只能向下或者向右移动一步。机器人试图达到网格的右下角（在下图中标记为 “Finish”）。现在考虑网格中有障碍物。那么从左上角到右下角将会有多少条不同的路径？网格中的障碍物和空位置分别用 1 和 0 来表示。m = obstacleGrid.length，n = obstacleGrid[i].length，1 <= m, n <= 100。  
示例：  
输入：obstacleGrid = [[0,0,0],[0,1,0],[0,0,0]]  
![](/images/2021-06-03-dynamic-programming/63.jpg)  
输出：2

题解：

```java
class Solution {
    public int uniquePathsWithObstacles(int[][] obstacleGrid) {
        int[][] dp = new int[obstacleGrid.length][obstacleGrid[0].length]; // 状态表达式：从起始点到 [i][j] 位置的路径数为 dp[i][j]
        boolean flag = true;
        // base case
        for (int i = 0; i < obstacleGrid[0].length; i++) {
            if (flag && obstacleGrid[0][i] == 0) dp[0][i] = 1;
            else {
                flag = false;
                dp[0][i] = 0;
            }
        }
        flag = true;
        for (int i = 0; i < obstacleGrid.length; i++) {
            if (flag && obstacleGrid[i][0] == 0) dp[i][0] = 1;
            else {
                flag = false;
                dp[i][0] = 0;
            }
        }
        // 状态转移方程
        for (int i = 1; i < obstacleGrid.length; i++) {
            for (int j = 1; j < obstacleGrid[0].length; j++) {
                if (obstacleGrid[i][j] == 1) {
                    dp[i][j] = 0;
                    continue;
                }
                dp[i][j] = dp[i - 1][j] + dp[i][j - 1]; // 从起始点到达当前位置的路径数 = 其上的路径数 + 其左的路径数
            }
        }
        return dp[obstacleGrid.length - 1][obstacleGrid[0].length - 1];
    }
}
```

tips：

- 思路思路与64题相似；
- 时间复杂度：O(mn)
- 空间复杂度：O(mn)

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
1) 【记忆化BFS】图的广度优先遍历。将 0 ～ n 的值转化为一有向无权图（多叉树）中的节点，且相同值的节点唯一，对于任意节点其可以与其他节点相连接，连接的条件为两节点值的差为一完全平方数，并且总是由值较大的节点指向值较小的节点。  
![](/images/2021-06-03-dynamic-programming/279_1.png)  
对于和为 n 的完全平方数的最少数量即：图中从值为 n 的节点到达值为 0 的节点的最短路径（任意两连通节点的差值总为一完全平方数）。  
![](/images/2021-06-03-dynamic-programming/279_2.jpg)  
2) 动态规划。状态表达式：dp[i] 表示最少需要多少个数的平方和来表示整数 i ，这些数必然落在区间 [1, sqrt(n)] 。枚举这些数，假设当前枚举到 j，则还需要取若干数的平方，构成 i−j^2 。此时该子问题和原问题类似，只是规模变小了，这符合了动态规划的要求，于是可以得到状态转移方程：  
*dp*[*i*] = 1 + min*dp*[*i* - *j*^2]，其中 *j* ∈ [1, *sqtr(i)*]  
dp[0] = 0 为 base case，实际上无法表示数字 0，只是为了保证状态转移过程中遇到 j 恰为 sqtr(i) 的情况合法。同时计算 dp[i] 时所需要用到的状态仅有 dp[i-j^2]，**其必然小于 i （和为 i 的平方和数 dp[i] 前面已计算得到结果）**，因此只需要从小到大地枚举 i 来计算 dp[i] 即可。

题解：

```java
// 广度优先遍历：记忆化BFS
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

### 343. [Integer Break](https://leetcode-cn.com/problems/integer-break/) 整数拆分

给定一个正整数 *n*，将其拆分为至少两个正整数的和，并使这些整数的乘积最大化。 返回你可以获得的最大乘积。  
示例：  
输入：3ㅤ|ㅤ6  
输出：2ㅤ|ㅤ9  
解释：2 = 1 * 2ㅤ|ㅤ9 = 3 * 3

思路：  
思路与279题相似。dp[i - j] 小于 dp[i]，故 dp[i - j] 一定已经计算过了。对于一个整数i，其最大乘积可能为被减数与剩余数两数直接相乘 (i - j) * j，也可能为剩余数的拆分最大乘积与被减数相乘 dp[i - j] * j，即 dp[i - j] 有可能小于 (i-j)，eg：n = 6。

题解：

```java
class Solution {
    public int integerBreak(int n) {
        int[] dp = new int[n + 1]; // 状态表达式：整数i拆分可获得的最大乘积为dp[i]
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j < i; j++) {
                dp[i] = Math.max(dp[i] > (i - j) * j ? dp[i] : (i - j) * j, dp[i - j] * j); // 状态转移方程
            }
        }
        return dp[n];
    }
}
```

tips：

- 时间复杂度：O(n^2)
- 空间复杂度：O(n)

### 198. [House Robber](https://leetcode-cn.com/problems/house-robber/) 打家劫舍

你是一个专业的小偷，计划偷窃沿街的房屋。每间房内都藏有一定的现金，影响你偷窃的唯一制约因素就是相邻的房屋装有相互连通的防盗系统，如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警。给定一个代表每个房屋存放金额的非负整数数组，计算你 不触动警报装置的情况下 ，一夜之内能够偷窃到的最高金额。1 <= nums.length <= 100。0 <= nums[i] <= 400。  
示例：  
输入：[1,2,3,1]  
输出：4

思路：  
动态规划。状态转移方程为从第3号房屋开始判断，对于打劫到第 i 间房屋，其最大可获得金额为两种情况：  
1) 打劫当前房屋的金额 + 打劫前一号房屋可获得的最大金额  
2) 不打劫当前房屋，即打劫上一号房屋可获得的最大金额

题解：

```java
class Solution { // 求解数组中不相邻元素的最大和
    public int rob(int[] nums) {
        if (nums.length == 1) return nums[0];
        if (nums.length == 2) return Math.max(nums[0], nums[1]); // 动态规划条件判断前提
        int[] dp = new int[nums.length]; // 状态表达式：打劫到第i号房屋可以获得的最高金额为dp[i]
        dp[0] = nums[0];
        dp[1] = Math.max(nums[0], nums[1]); // base case
        for (int i = 2; i < nums.length; i++) dp[i] = Math.max(nums[i] + dp[i - 2], dp[i - 1]); // 状态转移方程
        return dp[nums.length - 1];
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(n)

### 213. [House Robber II](https://leetcode-cn.com/problems/house-robber-ii/) 打家劫舍 II

你是一个专业的小偷，计划偷窃沿街的房屋，每间房内都藏有一定的现金。这个地方所有的房屋都 围成一圈 ，这意味着第一个房屋和最后一个房屋是紧挨着的。同时，相邻的房屋装有相互连通的防盗系统，如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警。给定一个代表每个房屋存放金额的非负整数数组，计算你 在不触动警报装置的情况下 ，今晚能够偷窃到的最高金额。1 <= nums.length <= 100。0 <= nums[i] <= 1000。  
示例：  
输入：nums = [2,3,2]  
输出：3  
解释：不能先偷窃 1 号房屋（金额 = 2），然后偷窃 3 号房屋（金额 = 2）, 因为他们是相邻的。

题解：

```java
class Solution { // 对于 0 ~ n 号房屋，考虑 0 ~ n - 1 和 1 ~ n 的情况
    public int rob(int[] nums) {
        if (nums.length == 1) return nums[0];
        if (nums.length == 2) return Math.max(nums[0], nums[1]);
        if (nums.length == 3) return Math.max(nums[0] > nums[1] ? nums[0] : nums[1], nums[2]);
        return Math.max(solve(nums, 2), solve(nums, 3));
    }

    private int solve(int[] nums, int start) {
        int[] dp = new int[nums.length]; // 状态表达式：打劫到第i号房屋可以获得的最高金额为dp[i]
        if (start == 2) {
            dp[0] = nums[0];
            dp[1] = Math.max(nums[0], nums[1]); // base case
        } else {
            dp[1] = nums[1];
            dp[2] = Math.max(nums[1], nums[2]); // base case
        }
        int end = start == 2 ? nums.length - 1 : nums.length;
        for (int i = start; i < end; i++) dp[i] = Math.max(nums[i] + dp[i - 2], dp[i - 1]); // 状态转移方程
        return dp[end - 1];
    }
}
```

tips：

- 思路与198题相似。
- 时间复杂度：O(n)
- 空间复杂度：O(n)

### 337. [House Robber III](https://leetcode-cn.com/problems/house-robber-iii/) 打家劫舍 III

小偷又发现了一个新的可行窃的地区。这个地区只有一个入口，我们称之为 root 。除了 root 之外，每栋房子有且只有一个“父“房子与之相连。一番侦察之后，聪明的小偷意识到“这个地方的所有房屋的排列类似于一棵二叉树”。 如果 两个直接相连的房子在同一天晚上被打劫 ，房屋将自动报警。给定二叉树的 root 。返回 在不触动警报的情况下 ，小偷能够盗取的最高金额。0 <= Node.val <= 10^4。  
示例：  
输入：root = [3,4,5,1,3,null,1]  
![](/images/2021-06-03-dynamic-programming/337.jpg)  
输出：9

思路：  
动态规划【两种状态转移】。二叉树上的每个节点都有选中和不选中两种状态，在不同时选中有父子关系的节点下，二叉树的最大节点值和。  
当前节点被选中时，其左/右子节点都不能被选中，故当前子树的最大节点值和 = 左/右子节点都不被选中的最大节点值和相加；  
当前节点不被选中时，其左/右子节点都可以选中或者不选中，故当前子树的最大节点值和 = 左节点选中/不选中下最大节点值和的较大值 + 右节点选中/不选中下最大节点值和的较大值。  
后序遍历二叉树，对每个节点定义长度为2的数组存储上述的选中 & 不选中当前节点子树的最大节点值和。

题解：

```java
/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */
class Solution {
    public int rob(TreeNode root) {
        int[] result = postorderTraversal(root);
        return Math.max(result[0], result[1]);
    }

    private int[] postorderTraversal(TreeNode node) {
        if (node == null) return new int[] {0, 0}; // 递归边界条件
        int[] left = postorderTraversal(node.left);
        int[] right = postorderTraversal(node.right);
        int[] root = new int[2]; // root[0] 代表打劫当前节点下该子树的最高盗取金额；root[1] 代表不打劫当前节点下该子树的最高盗取金额
        root[0] = node.val + left[1] + right[1];
        root[1] = Math.max(left[0], left[1]) + Math.max(right[0], right[1]);
        return root;
    }
}
```

tips：

- 自底向上的动态规划类似二叉树的后序遍历；
- 时间复杂度：O(n)
- 空间复杂度：O(n)，递归调用时栈的最大深度。

### 309. [Best Time to Buy and Sell Stock with Cooldown](https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/) 最佳买卖股票时机含冷冻期

给定一个整数数组prices，其中第  prices[i] 表示第 i 天的股票价格 。设计一个算法计算出最大利润。在满足以下约束条件下，你可以尽可能地完成更多的交易（多次买卖一支股票）：卖出股票后，你无法在第二天买入股票 (即冷冻期为 1 天)。注意：你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。  
示例：  
输入：prices = [1,2,3,0,2]  
输出：3  
解释：对应的交易状态为 [买入, 卖出, 冷冻期, 买入, 卖出]

思路：  
动态规划【三种状态转移】，思路类似337题；也使用了定义状态机的思路：  
![](/images/2021-06-03-dynamic-programming/309.png)  
hold：成为hold状态，有两条路线，hold下rest继续hold & rest下buy成为hold。其最大收益为 Math.max(上一hold, 上一rest减去当前买入价)；  
sold：成为sold状态，只有从hold状态售出一条路线。其最大收益为 上一hold加上当前售出价；  
rest：成为rest状态，有两条路线，rest下继续rest & sold后rest成为rest。其最大收益为 Math.max(上一rest, 上一sold)。  
hold的base case初始化为-∞：为了使第一天可以买入、第一天不能卖出（使状态格无效）。

题解：

```java
class Solution {
    public int maxProfit(int[] prices) {
        int hold = Integer.MIN_VALUE, sold = 0, rest = 0;
        for (int price : prices) {
            int preSold = sold;
            sold = hold + price;
            hold = Math.max(hold, rest - price);
            rest = Math.max(preSold, rest);
        }
        return Math.max(rest, sold);
    }
}
```

tips：

- 类似91题，在空间复杂度上也进行了降维；
- 时间复杂度：O(n)
- 空间复杂度：O(1)

### 416. [Partition Equal Subset Sum](https://leetcode-cn.com/problems/partition-equal-subset-sum/) 分割等和子集

给你一个 只包含正整数 的 非空 数组 nums 。请你判断是否可以将这个数组分割成两个子集，使得两个子集的元素和相等。  
示例：  
输入：nums = [1,5,11,5]ㅤ|ㅤnums = [1,2,3,5]  
输出：trueㅤ|ㅤfalse  
解释：数组可以分割成 [1, 5, 5] 和 [11]ㅤ|ㅤ数组不能分割成两个元素和相等的子集

思路：  
01背包问题。在 n 个物品中选出一定物品，（完全）填满 sum/2 的背包。降维类似补充题2。  
状态转移：F(i, j) = F(i - 1, j) || F(i - 1, j - nums[i])

题解：

```java
class Solution {
    public boolean canPartition(int[] nums) {
        int sum = 0;
        for (int num : nums) sum += num;
        if ((sum & 1) == 1) return false; // 奇数
        sum >>= 1;
        boolean[] dp = new boolean[sum + 1];
        for (int i = 0; i <= sum; i++) dp[i] = nums[0] == i;
        for (int i = 1; i < nums.length; i++) {
            for (int j = sum; j >= nums[i]; j--) dp[j] = dp[j] || dp[j - nums[i]];
        }
        return dp[sum];
    }
}
```

tips：

- 时间复杂度：O(n * sum)
- 空间复杂度：O(sum)

### 补充题1. Division of numbers 数的划分

将整数 n 分成 k 份，且每份不能为空，任意两种分法不能相同（不考虑顺序）。问有多少种不同的分法。6 < n < 200，1 < k < 7。  
示例：  
输入：n = 7, k = 3  
输出：4  
解释：1, 1, 5; 1, 5, 1; 5, 1, 1 被视为相同的分法。

思路：  
对于将整数 i 分成为 j 份的分法数 dp\[i\]\[j\]：先拿出 j 个数将 j 份分别填为 1，此时整数 i 还剩余 i - j，对于剩余的数，可以将其全部分到一份当中（dp\[i - j\]\[1\]），也可以分到两份当中（dp\[i - j\]\[2\]），...，还可以分到 j 份当中（dp\[i - j\]\[j\]），且每一种分法都是不同的，故这些情况的总和即为 dp\[i\]\[j\]，即  
dp\[i\]\[j\] = dp\[i - j\]\[1\] + dp\[i - j\]\[2\] + ... + dp\[i - j\]\[j\] 。  
对于 dp\[i - 1\]\[j - 1\]，又有  
dp\[i - 1\]\[j - 1\] = dp\[(i - 1) - (j - 1)\]\[1\] + dp\[(i - 1) - (j - 1)\]\[2\] + ... + dp\[(i - 1) - (j - 1)\]\[j - 1\]  
= dp\[i - j\]\[1\] + dp\[i - j\]\[2\] + ... + dp\[i - j\]\[j - 1\]  
可得状态转移方程为 dp\[i\]\[j\] = dp\[i - 1\]\[j - 1\] + dp\[i - j]\[j\] 。

题解：

```java
class Solution {
    public int divideNumber(int n, int k) {
        int[][] dp = new int[n + 1][k + 1]; // 状态表达式：整数i分成为j份的分法数为dp[i][j]
        dp[0][0] = 1; // base case
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= k; j++) {
                if (i < j) continue; // 划分的份数不能超过给定的整数
                dp[i][j] = dp[i - 1][j - 1] + dp[i - j][j]; // 状态转移方程
            }
        }
        return dp[n][k];
    }
}
```

tips：

- 时间复杂度：O(nk)
- 空间复杂度：O(1)

### 补充题2. 01-knapsack 01-背包

经典 0-1 背包问题。

题解：

```java
class Solution {
	// tc: O(nc) sc: O(nc)
    /*public static int knapsack01(int[] w, int v[], int c) {
        int[][] dp = new int[w.length][c + 1];
        for (int i = 0; i <= c; i++) dp[0][i] = i >= w[0] ? v[0] : 0;
        for (int i = 1; i < w.length; i++) {
            for (int j = 0; j <= c; j++) {
                dp[i][j] = dp[i - 1][j];
                if (j >= w[i]) dp[i][j] = Math.max(dp[i][j], v[i] + dp[i - 1][j - w[i]]);
            }
        }
        return dp[w.length - 1][c];
    }*/

    // 降维 tc: O(nc) sc: O(2c) 使用两行的dp数组，dp[0]行只处理偶数i/dp[1]行只处理奇数i
    /*public static int knapsack01(int[] w, int v[], int c) {
        int[][] dp = new int[2][c + 1];
        for (int i = 0; i <= c; i++) dp[0][i] = i >= w[0] ? v[0] : 0;
        for (int i = 1; i < w.length; i++) {
            for (int j = 0; j <= c; j++) {
                dp[i % 2][j] = dp[(i - 1) % 2][j];
                if (j >= w[i]) dp[i % 2][j] = Math.max(dp[i % 2][j], v[i] + dp[(i - 1) % 2][j - w[i]]);
            }
        }
        return dp[(w.length - 1) % 2][c];
    }*/

    // 降维 tc: O(nc) sc: O(c) 使用一行的dp数组，对于每行从右边开始向左计算（只使用上一行上面及左边的元素）
    public static int knapsack01(int[] w, int v[], int c) {
        int[] dp = new int[c + 1];
        for (int i = 0; i <= c; i++) dp[i] = i >= w[0] ? v[0] : 0;
        for (int i = 1; i < w.length; i++) {
            for (int j = c; j >= w[i]; j--) {
                dp[j] = Math.max(dp[j], v[i] + dp[j - w[i]]);
            } // 优化：容量容不下当前物品i无需再向前计算，行更新时直接等于上面的值
        }
        return dp[c];
    }
}
```

tips：

- 时间复杂度：O(nc)
- 空间复杂度：O(c)













