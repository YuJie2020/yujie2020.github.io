---
layout: post
title: 剑指 Offer
description: 剑指 Offer - 第 2 版
category: 技术
---

## introduction 
剑指 Offer - 第 2 版  
标星* 题目 代表使用了相关算法板块未涉及的 解法分类。

## Ⅰ Array and String 数组及字符串

数组结构以及字符串相关的算法题目。

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

### 11. [旋转数组的最小数字*](https://leetcode-cn.com/problems/xuan-zhuan-shu-zu-de-zui-xiao-shu-zi-lcof/)

把一个数组最开始的若干个元素搬到数组的末尾，我们称之为数组的旋转。输入一个递增排序的数组的一个旋转，输出旋转数组的最小元素。  
示例：  
输入：[3,4,5,1,2]ㅤ|ㅤ[10,5,10,10,10]  
输出：1ㅤ|ㅤ5

思路：  
**二分查找**，思路类似33题。题目描述的旋转后的排序数组，二分查找过程中每次将数组一分为二后，其中一定有一部分是有序的，另一个部分可能是有序也能是部分有序。

题解：

```java
class Solution {
    public int minArray(int[] numbers) {
        int left = 0, right = numbers.length - 1;
        while (left < right) { // 查找旋转数组分界点右边的第一个元素：即为最小元素（**分界点两边的子数组都为升序**，并且左子数组中的值大于等于右子数组中的值）
            int mid = left + (right - left) / 2;
            if (numbers[mid] > numbers[right]) { // 右半部分无序：分界点存在于右半部分
                left = mid + 1; // 中轴值 numbers[mid] 大于最右端元素，故其一定不为最小元素，查找范围的左边界由 mid 加一（舍去 mid）
            } else if (numbers[mid] < numbers[right]) { // 右半部分有序：分界点存在于左半部分
                right = mid; // 中轴值 numbers[mid] 小于最右端元素，其可能为最小元素，故查找范围的右边界应包含 mid，eg：88567
            } else if (numbers[left] > numbers[mid]) { // numbers[mid] == numbers[right] 的情况，无法判断右半部分是否有序，当前半部分无序时（则右半部分一定有序也即有半部分的值全都相等）：分界点存在于左半部分
                right = mid;
            } else { // numbers[mid] == numbers[right] == numbers[right] 的情况：无法判断分界点存在于哪半部分（即无法判断哪半部分无序）
                right--;
            }
        } // 退出循环后 left == right
        return numbers[left];
    }
}
```

tips：

- 时间复杂度：O(logn)，当数组的元素都不相同时时间代价最优为O(logn)，所有元素都相同时时间代价最差为O(n)
- 空间复杂度：O(1)

### 13. [机器人的运动范围*](https://leetcode-cn.com/problems/ji-qi-ren-de-yun-dong-fan-wei-lcof/)

地上有一个m行n列的方格，从坐标 [0,0] 到坐标 [m-1,n-1] 。一个机器人从坐标 [0, 0] 的格子开始移动，它每次可以向左、右、上、下移动一格（不能移动到方格外），也不能进入行坐标和列坐标的数位之和大于k的格子。例如，当k为18时，机器人能够进入方格 [35, 37] ，因为3+5+3+7=18。但它不能进入方格 [35, 38]，因为3+5+3+8=19。请问该机器人能够到达多少个格子？1 <= n,m <= 100，0 <= k <= 20。  
示例：  
输入：m = 2, n = 3, k = 1  
输出：3

思路：  
**深度优先搜索，回溯，剪枝**。此题规定行列数不大于100，对于99以内的数， 设 x 的数位和为 s(x)，x+1 的数位和为 s(x+1)，当 (x + 1) % 10 = 0 时则 s(x+1) = s(x) - 8，例如 19, 20 的数位和分别为 10, 2；当 (x + 1) % 10 != 0 时则 s(x+1) = s(x) + 1，例如 18, 19 的数位和分别为 9, 10。深度优先搜索时仅通过向右和向下移动即可访问所有可达解：矩阵中满足数位和的解构成的几何形状形如多个等腰直角三角形，每个三角形的直角顶点位于 0, 10, 20, ... 等数位和突变的矩阵索引处，三角形内的解虽然都满足数位和要求，但由于机器人每步只能走一个单元格，而三角形间不一定是连通的，因此机器人不一定能到达，称之为不可达解。  
![](/images/2021-04-14-coding-interviews/13_1.png)  
同理可到达的解称为可达解，对于两三角形连通处，若某三角形内的解为可达解，则必与其左边或上边的三角形连通（即相交），即机器人必可从左边或上边走进此三角形。  
![](/images/2021-04-14-coding-interviews/13_2.png)  
深度优先搜索过程中：先朝一个方向搜到底，再回溯至上个节点，沿另一个方向搜索，以此类推。  
剪枝：在搜索中，遇到数位和超出目标值、此元素已访问，则立即返回。

题解：

```java
class Solution {

    int m; // 成员变量
    int n;
    int k;
    boolean[][] isVisited; // 记录当前单元格是否被访问的二维数组

    public int movingCount(int m, int n, int k) {
        this.m = m; // 初始化
        this.n = n;
        this.k = k;
        this.isVisited = new boolean[m][n];
        return dfs(0, 0, 0, 0);
    }

    private int dfs(int i, int j, int si, int sj) { // i 和 j 为当前递归层级访问单元格的索引，si 和 sj 为索引 i 和 j 的数位和
        if (i >= m || j >= n || si + sj > k || isVisited[i][j]) return 0; // 当前访问单元格越界或者数位和大于k或者已被访问则返回0：递归边界条件
        isVisited[i][j] = true; // 标记当前单元格为已访问
        return 1 + dfs(i + 1, j, (i + 1) % 10 == 0 ? si - 8 : si + 1, sj) + dfs(i, j + 1, si, (j + 1) % 10 == 0 ? sj - 8 : sj + 1); // 下右的顺序递归深度搜索下一单元格，返回 1 + 下方搜索的可达解总数 + 右方搜索的可达解总数
    }
}
```

tips：

- 时间复杂度：O(MN)，M和N为矩阵的行数和列数，最差情况下，机器人遍历矩阵所有单元格，此时时间复杂度为 O(MN)
- 空间复杂度：O(MN)

### 15. [二进制中1的个数](https://leetcode-cn.com/problems/er-jin-zhi-zhong-1de-ge-shu-lcof/)

请实现一个函数，输入一个整数（以二进制串形式），输出该数二进制表示中 1 的个数。例如，把 9 表示成二进制是 1001，有 2 位是 1。因此，如果输入 9，则该函数输出 2。  
示例：  
输入：11111111111111111111111111111101（**有歧义，实际输入为 -3**）  
输出：31

思路：  
**常规数组题目，遍历，条件判断+数学（[位运算](https://yujie2020.github.io/2021-05-03-binary-digit-and-bitwise-operation.html)）**。  
解法一：题目输入的为带符号int范围的整数（题目有歧义，并非题目描述里的二进制串；且考虑有符号数，即不能使用遍历模2在除2的方式求每位的数），求解其补码二进制串中1的个数（当输入为负数时符号位1也需要考虑到结果中）。初始化一个用于进行位与运算的常数con=1，遍历32次（int类型的位数），每次循环体内 n & con 位与运算，每一次遍历后将con位运算左移1位（当前遍历的位为1，其他位都为0），当 n&con 不等于0则代表原数 n 当前位为1（即使原数n为负数，遍历到符号位位与运算的结果为10000000000000000000000000000000，其表示-2^31也不为0），即可求出原数二进制表示中 1 的个数。  
解法二：对于 n & (n - 1) ，其运算结果恰为把 n 的二进制中最低位的 1 变为 0 之后的结果。只要每次执行这个操作，就会消除掉 n 的二进制中最后一个出现的 1。因此执行 n & (n - 1) 使得 n 变成 0 的操作次数，就是 n 的二进制中 1 的个数。对于负数也适用。  
![](/images/2021-04-14-coding-interviews/15.png)

题解：

```java
class Solution {
    // you need to treat n as an unsigned value
    public int hammingWeight(int n) {
        int result = 0;
        while (n != 0) {
            n &= n - 1;
            result++;
        }
        return result;
    }
}

/*class Solution {
    // you need to treat n as an unsigned value
    public int hammingWeight(int n) {
        int result = 0;
        int con = 1;
        for (int i = 0; i < 32; i++) {
            if ((n & con) != 0) result++; // != 的优先级高于 &
            con <<= 1;
        }
        return result;
        // return Integer.bitCount(n); // 库函数
    }
}*/
```

tips：

- 调用库函数 java.lang.Integer类中的static int bitCount(int i) 方法，返回指定 int 值的二进制补码表示形式的 1 位的数量。当输入为负数时也满足题意；
- 时间复杂度：O(32)，解法一；O(k)，k为整数n二进制中1的个数，解法二
- 空间复杂度：O(1)

### 16. [数值的整数次方](https://leetcode-cn.com/problems/shu-zhi-de-zheng-shu-ci-fang-lcof/)

实现 pow(*x*, *n*)，即计算 x 的 n 次幂函数（即，x^n）。不得使用库函数，同时不需要考虑大数问题。-2^31 <= n <= 2^31-1。  
示例：  
输入：x = 2.00000, n = -2  
输出：0.25000

思路：  
**常规数组题目，遍历，条件判断+数学（[位运算](https://yujie2020.github.io/2021-05-03-binary-digit-and-bitwise-operation.html)）**。幂n为负数则将其转为正数并将底数x转为1/x。对于幂n考虑其二进制数，eg：当 n=18 时，其二进制数为 10010 = 2^4 + 2^1，又当 n = n1 + n2 时，有 x^n = x^(n1 + n2) = x^n1 * x^n2，故 x^18 = x^(2^4) * x^(2^1)，即对于幂的二进制数其第 i 位为 1 时，将结果result乘以 x^(2^i)， x^(2^i) 可以通过遍历存储到底数 x 中，x^(2^i) = x^2, x^4, x^6, x^8, ... （下一项总为上一项的平方，通过迭代 x *= x 实现）。遍历第一次即考虑幂n二进制的第0位，若为1则结果 resultx 乘以 x（第0位 x^(2^0) = x），将 x *= x（对下一位有效，x^(2^1)），再将n右移一位以判断下一位是否为1（**也可以除以2，但位运算的效率更高**），进行下一轮遍历考虑幂n二进制的第1位，……，当n为0时则结束遍历。  
**递归**。当n等于返回1；当n为偶数结果为 (x^2)^(n/2) 即递归调用传入参数 x^2 和 n/2；当n为奇数返回 x * myPow(x, n - 1) ；当n小于0则返回 myPow(1/x, -n)。

题解：

```java
// 迭代+数学
class Solution {
    public double myPow(double x, int n) {
        double result = 1; // 结果的初始值
        if (n < 0) {
            x = 1 / x;
            if (n == -2147483648) {
                n++; // int范围为-2^31~2^31-1，-2^31转为正数会越界，将幂n减一
                result = x; // 幂n减一后结果的初始值应为x
            }
            n = -n;
        }
        while (n != 0) {
            if (n % 2 == 1) result *= x;
            x *= x; // 对下一位有效 x^(2^i)
            n >>= 1;
        }
        return result;
    }
}

// 递归
/*class Solution {
    public double myPow(double x, int n) {
        if (n == 0) { // 放在第一个判断，防止死循环（对2取模总为0）
            return 1;
        } else if (n % 2 == 0) {
            return myPow(x * x, n / 2);
        } else if (n % 2 == 1) {
            return x * myPow(x, n - 1);
        } else { // n < 0 将其转为正数
            x = 1 / x;
            return x * myPow(x, - n - 1); // int范围为-2^31~2^31-1，-2^31转为正数会越界，将幂n减一且结果乘以x
        }
    }
}*/
```

tips：

- 对于求一个整数的1/2（除以2）使用[右移位运算](https://yujie2020.github.io/2021-05-03-binary-digit-and-bitwise-operation.html)的效率更高；
- 将一个负整数x通过-x取正时，要考虑负数边界比正数边界大1，例如 int：-2^31~2^31-1；
- 时间复杂度：O(logn)，对于迭代方式需最多遍历31次，当取最大int整数n时也为logn级别
- 空间复杂度：O(1) 迭代；O(logn) 递归

### 20. [表示数值的字符串](https://leetcode-cn.com/problems/biao-shi-shu-zhi-de-zi-fu-chuan-lcof/)

请实现一个函数用来判断字符串是否表示数值（包括整数和小数）。数值（按顺序）可以分成以下几个部分：若干空格；一个 小数 或者 整数；（可选）一个 'e' 或 'E' ，后面跟着一个 整数；若干空格。小数（按顺序）可以分成以下几个部分：（可选）一个符号字符（'+' 或 '-'）；下述格式之一：至少一位数字，后面跟着一个点 '.'、至少一位数字，后面跟着一个点 '.' ，后面再跟着至少一位数字、一个点 '.' ，后面跟着至少一位数字。整数（按顺序）可以分成以下几个部分：（可选）一个符号字符（'+' 或 '-'）；至少一位数字。  
示例：  
输入："+100", "5e2", "-123", "3.1416", "-1E-16", "0123", "    .1  " | "12e", "1a3.14", "1.2.3", "+-5", "12e+5.4"  
输出：true | false

思路：  
**常规数组题目，遍历，条件判断**。判断false而不是true，多种条件满足才能判断true，但是只要有一个条件不满足就可以判断false。定义了四个flag对应四种字符，是否出现过数字：hasNum，是否出现过e：hasE，是否出现过正负号：hasSign，是否出现过点：hasDot。先处理数值字符串前的空格，index相应的后移。定义字符串索引index，遍历字符串，如果当前字符是数字：将hasNum置为true，index往后移动一直到非数字或遍历到末尾位置。如果当前字符ch是'e'或'E'：如果e已经出现过或者当前e之前没有出现过数字，返回fasle，否则令hasE = true，并且将其他3个flag全部置为false，因为要开始遍历e后面的新数字了；如果当前字符ch是+或-：如果已经出现过+或-或者已经出现过数字或者已经出现过'.'，返回flase，否则令hasSign = true；如果当前字符ch是'.'：如果已经出现过'.'或者已经出现过'e'或'E'，返回false，否则令hasDot = true；如果当前字符ch是' '：结束循环，因为可能是末尾的空格，但也可能是数值字符串中间的空格，在循环外继续处理，index不会与n相等，返回的就是false；如果当前字符ch是除了上面几种情况以外的其他字符，直接返回false。遍历结束后继续处理数值字符串后的空格，index相应的后移。如果当前索引index与字符串长度相等，说明输入字符串遍历到了末尾，但是还要满足hasNum为true才可以最终返回true，因为如果字符串里全是符号没有数字不满足题意，同时e后面没有数字也不满足题意。

题解：

```java
class Solution {
    public boolean isNumber(String s) {
        int len = s.length();
        int index = 0;
        boolean hasNum = false;
        boolean hasSign = false;
        boolean hasE = false;
        boolean hasDot = false;
        while (index < len && s.charAt(index) == ' ') index++;
        while (index < len) {
            while (index < len && s.charAt(index) >= '0' && s.charAt(index) <= '9') {
                index++;
                hasNum = true;
            }
            if (index == len) break; // 此处不能少了这个判断，否则在前一步判断数字时index已经到达len，继续判断后面非数字的情形会产生越界
            char ch = s.charAt(index);
            if (ch == 'e' || ch == 'E') {
                if (hasE || !hasNum) return false;
                hasE = true;
                hasNum = false;
                hasSign = false;
                hasDot = false;
            } else if (ch == '+' || ch == '-') {
                if (hasNum || hasDot || hasSign) return false;
                hasSign = true;
            } else if (ch == '.') {
                if (hasE || hasDot) return false;
                hasDot = true;
            } else if (ch == ' ') {
                break;
            } else return false;
            index++; // 继续判断下一位
        }
        while (index < len && s.charAt(index) == ' ') index++;
        return index == len && hasNum; // 不使用 if (index == len && hasNum) return true else return false 的形式
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(1)

### 21. [调整数组顺序使奇数位于偶数前面](https://leetcode-cn.com/problems/diao-zheng-shu-zu-shun-xu-shi-qi-shu-wei-yu-ou-shu-qian-mian-lcof/)

输入一个整数数组，实现一个函数来调整该数组中数字的顺序，使得所有奇数位于数组的前半部分，所有偶数位于数组的后半部分。  
示例：  
输入：nums = [1,2,3,4]  
输出：[1,3,2,4]，[3,1,2,4] 也是正确的答案之一。

思路：  
**双指针**。快慢指针：指针left（慢指针）用于替换元素，指针right（快指针）用于遍历序列。left和right都从数组的头部开始遍历，如果 right 遇到了奇数，将双指针位置的数字互换同时将 left++ right--，如果 right 没有遇到奇数，继续右移 right++，right遍历到末尾时结束。对撞指针：left指向数组头，right指向数组尾，left右移直到指向了偶数，right左移直到指向了奇数，交换left和right所指数字同时将 left++ right--，直到 left >= right 结束。

题解：

```java
// 快慢指针
class Solution {
    public int[] exchange(int[] nums) {
        int left = 0, right = 0;
        while (right < nums.length) {
            if (nums[right] % 2 == 1) {
                int temp = nums[left];
                nums[left] = nums[right];
                nums[right] = temp;
                left++;
            }
            right++;
        }
        return nums;
    }
}

// 对撞指针
/*class Solution {
    public int[] exchange(int[] nums) {
        int left = 0, right = nums.length - 1;
        while (left < right) {
            while (left < right && nums[left] % 2 == 1) left++;
            while (left < right && nums[right] % 2 == 0) right--;
            int temp = nums[left];
            nums[left] = nums[right];
            nums[right] = temp;
            left++;
            right--;
        }
        return nums;
    }
}*/
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(1)

### 29. [顺时针打印矩阵](https://leetcode-cn.com/problems/shun-shi-zhen-da-yin-ju-zhen-lcof/)

输入一个矩阵，按照从外向里以顺时针的顺序依次打印出每一个数字。0 <= matrix.length <= 100，0 <= matrix[i].length <= 100。  
示例：  
输入：matrix = [[1,2,3],[4,5,6],[7,8,9]]  
输出：[1,2,3,6,9,8,7,4,5]

思路：  
**常规数组题目，遍历，条件判断**。设定矩阵的左、右、上、下四个边界 l , r , t , b ，用于打印的结果数组 result。循环打印： “从左向右、从上向下、从右向左、从下向上” 四个方向循环，根据边界打印，将元素按顺序添加至数组 result 尾部，每次打印完一条边界将对应边界向内收缩1（代表已被打印，并判断是否打印完毕（边界是否相遇），若打印完毕则退出用于打印的循环。

题解：

```java
class Solution {
    public int[] spiralOrder(int[][] matrix) {
        if (matrix.length == 0) return new int[0];
        int l = 0, r = matrix[0].length - 1, t = 0, b = matrix.length - 1; // 矩阵matrix的左右上下边界索引
        int[] result = new int[(r + 1) * (b + 1)]; // 结果数组
        int index = 0; // 结果数组的索引
        while (true) {
            for (int i = l; i <= r; i++) result[index++] = matrix[t][i];
            if (++t > b) break;
            for (int i = t; i <= b; i++) result[index++] = matrix[i][r];
            if (l > --r) break;
            for (int i = r; i >= l; i--) result[index++] = matrix[b][i];
            if (t > --b) break;
            for (int i = b; i >= t; i--) result[index++] = matrix[i][l];
            if (++l > r) break;
        }
        return result;
    }
}
```

tips：

- 时间复杂度：O(mn)，m, n 分别为矩阵matrix的行数和列数
- 空间复杂度：O(1)

### 30. [包含min函数的栈](https://leetcode-cn.com/problems/bao-han-minhan-shu-de-zhan-lcof/)

定义栈的数据结构，请在该类型中实现一个能够得到栈的最小元素的 min 函数在该栈中，调用 min、push 及 pop 的时间复杂度都是 O(1)。  
示例：  
MinStack minStack = new MinStack();  
minStack.push(-2);  
minStack.push(0);  
minStack.push(-3);  
minStack.min();   --> 返回 -3.  
minStack.pop();  
minStack.top();      --> 返回 0.  
minStack.min();   --> 返回 -2.

思路：  
**数据结构及其设计**。使用链表来实现，每一个节点都会存储当前栈（**以当前节点为头节点的链表**）中的最小元素，所以当pop删除栈顶元素时，如果当前删除元素为最小元素，下一个栈顶元素节点获取最小元素时也不会包括上一个被删除的元素。

题解：

```java
class MinStack {

    Node head;

    /** initialize your data structure here. */
    public MinStack() {

    }
    
    public void push(int x) {
        if (head == null) {
            head = new Node(x, x);
        } else head = new Node(x, Math.min(x, head.minVal), head);
    }
    
    public void pop() {
        head = head.next;
    }
    
    public int top() {
        return head.val;
    }
    
    public int min() {
        return head.minVal;
    }
}

class Node {
    int val;
    int minVal;
    Node next;
    public Node(int val, int minVal) {
        this(val, minVal, null);
    }
    public Node(int val, int minVal, Node next) {
        this.val = val;
        this.minVal = minVal;
        this.next = next;
    }
}

/**
 * Your MinStack object will be instantiated and called as such:
 * MinStack obj = new MinStack();
 * obj.push(x);
 * obj.pop();
 * int param_3 = obj.top();
 * int param_4 = obj.min();
 */
```

tips：

- this关键字用来访问本类内容，用法有三种：在本类的成员方法中访问本类的成员变量；在本类的成员方法中访问本类的另一个成员方法；在本类的构造方法中访问本类的另一个构造方法。此题创建对象使用到了第三种用法；
- 时间复杂度：O(1)
- 空间复杂度：O(n)，其中 n 为总操作数。最坏情况下会连续插入 n 个元素，此时栈占用的空间为 O(n)

### 31. [栈的压入、弹出序列](https://leetcode-cn.com/problems/zhan-de-ya-ru-dan-chu-xu-lie-lcof/)

输入两个整数序列，第一个序列表示栈的压入顺序，请判断第二个序列是否为该栈的弹出顺序。假设压入栈的所有数字均不相等。pushed 是 popped 的排列。  
示例：  
输入：pushed = [1,2,3,4,5], popped = [4,5,3,2,1] | pushed = [2,1,0], popped = [1,2,0]  
输出：true | true

思路：  
**数据结构**。遍历 pushed 数组，使用一个 index 索引记录栈中下一个该弹出的元素在 popped 数组（栈的弹出顺序）中的索引，再使用一个栈存储每次遍历的当前元素。遍历 pushed 数组（栈的压入顺序），先将当前元素入栈，判断栈顶元素是否与 popped 数组中下一个该弹出的元素 popped[index] 相等，相等则弹出栈顶元素且同时将 index 索引后移，重复上述操作直到栈顶元素与 popped 数组中下一个该弹出的元素 popped[index] 不相等则进行下一轮循环，当遍历结束栈为空则表示 popped 序列为该栈的弹出顺序。  
栈的所有数字均不相等 ，因此在循环入栈中，每个元素出栈的位置的可能性是唯一的（若有重复数字，则具有多个可出栈的位置）。因此在遇到 “栈顶元素 == 弹出序列 popped 的下一个该弹出的元素” 就应立即执行出栈。

题解：

```java
class Solution {
    public boolean validateStackSequences(int[] pushed, int[] popped) {
        Stack<Integer> stack = new Stack<>();
        int index = 0; // 栈中下一个该弹出的元素在 popped 数组（栈的弹出顺序）中的索引
        for (int ele : pushed) {
            stack.push(ele);
            while (!stack.empty() && stack.peek() == popped[index]) {
                stack.pop();
                index++;
            }
        }
        return stack.empty();
    }
}
```

tips：

- 时间复杂度：O(n)，n 为 pushed 数组的长度，每个元素最多入栈与出栈一次
- 空间复杂度：O(n)，辅助栈 stack 最多同时存储 n 个元素

### 39. [数组中出现次数超过一半的数字](https://leetcode-cn.com/problems/shu-zu-zhong-chu-xian-ci-shu-chao-guo-yi-ban-de-shu-zi-lcof/)

数组中有一个数字出现的次数超过数组长度的一半，请找出这个数字。你可以假设数组是非空的，并且给定的数组总是存在多数元素。  
示例：  
输入：[1, 2, 3, 2, 2, 2, 5, 4, 2]  
输出：2

思路：  
**常规数组题目，遍历，条件判断**。使用摩尔投票（Moore vote）算法的思路。候选人(result)初始化为nums[0]，票数count初始化为1。遍历数组当遇到与result相同的数，则票数count++，否则票数count--。当票数count为0时需更换候选人为当前遍历的元素（使count=0的元素），并将票数count重置为1。遍历完数组后，result即为最终答案。  
投票法是遇到相同的则票数 + 1，遇到不同的则票数 - 1。且“多数元素”的个数 > n/2，其余元素的个数总和 <= n/2，因此 “多数元素”的个数 - 其余元素的个数总和 的结果 >= 1。相当于每个“多数元素”和其他元素两两相互抵消，抵消到最后肯定还剩余至少1个“多数元素”。

题解：

```java
class Solution {
    public int majorityElement(int[] nums) {
        int vote = 1;
        int result = nums[0];
        for (int i = 1; i < nums.length; i++) {
            if (result == nums[i]) {
                vote++;
            } else if (--vote == 0) {
                result = nums[i];
                vote = 1;
            }
        }
        return result;
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(1)

### 40. [最小的k个数](https://leetcode-cn.com/problems/zui-xiao-de-kge-shu-lcof/)

输入整数数组 `arr` ，找出其中最小的 `k` 个数。0 <= k <= arr.length <= 10000。  
示例：  
输入：arr = [3,2,1], k = 2  
输出：[1,2] 或者 [2,1]

思路：  
**快速排序 - 三路快排（分治算法）**。用快速排序的划分思路来解决这个问题，每次经过「划分」操作后，一定可以确定一个元素的最终位置，即 x 的最终位置为 q，并且保证 a[l⋯q−1] 中的每个元素小于等于 a[q]，且 a[q] 小于等于 a[q+1⋯r] 中的每个元素。所以只要某次划分的 q 为第 k-1 个下标的时候，就已经找到了答案。 只需关心这一点，至于 a[l⋯q−1] 和 a[q+1⋯r] 是否是有序的，不需要关心。改进快速排序算法：在分解的过程当中，对子数组进行划分，如果划分得到的 q 正好就是需要的下标，就直接返回 a[q]；否则，如果 q 比目标下标小，就递归右子区间，否则递归左子区间。这样就可以把原来递归两个区间变成只递归一个区间，提高了时间效率。  
![](/images/2021-04-14-coding-interviews/40.png)

题解：

```java
class Solution {
    public int[] getLeastNumbers(int[] arr, int k) {
        if (k == 0) return new int[0];
        int index = k - 1; // 第k小元素的索引
        randomPartition(arr, 0, arr.length - 1, index);
        return Arrays.copyOf(arr, k); // 最终结果即为改进快速排序后数组的前k个元素
    }

    // 用于判别继续向左半部分还是右半部分划分（迭代），pivot中轴值在下一迭代部分中随机选取
    private int randomPartition(int[] arr, int left, int right, int index) {
        int pivotIndex = new Random().nextInt(right - left + 1) + left;
        swap(arr, pivotIndex, right); // 将pivot中值交换到数组末尾
        int result = partition(arr, left, right);
        if (result == index) return arr[result];
        return result < index ? randomPartition(arr, result + 1, right, index) : randomPartition(arr, left, result - 1, index);
    }

    // 划分的方法
    private int partition(int[] arr, int left, int right) {
        int pivot = arr[right]; // 中轴值（位于数组末尾）
        int i = left - 1; // [left, ..., i]的元素都小于pivot，[i + 1, ..., right]的元素都大于等于pivot
        for (int j = left; j < right; j++) {
            if (arr[j] < pivot) {
                swap(arr, ++i, j);
            }
        }
        swap(arr, i + 1, right); // 将中轴值归于正确的位置
        return i + 1; // 中轴值的索引
    }

    // 数组中索引i及索引j处的元素对调位置
    private void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}
```

tips：

- 思路与215题相同；
- 这里也用到了双指针的思想，指针i用于替换元素（慢指针），指针j用于遍历数组（快指针）；
- 时间复杂度：O(n)，快速排序的性能和「划分」出的子数组的长度密切相关。直观地理解如果每次规模为 n 的问题都划分成 1 和 n - 1，每次递归的时候又向 n−1 的集合中递归，这种情况是最坏的，时间代价是 O(n^2)。这里引入随机化来加速这个过程，它的时间代价的期望是 O(n)。（证明过程：《算法导论》9.2）
- 空间复杂度：O(logn)，递归使用栈空间的空间代价的期望为O(logn)

### 41. [数据流中的中位数](https://leetcode-cn.com/problems/shu-ju-liu-zhong-de-zhong-wei-shu-lcof/)

如何得到一个数据流中的中位数？如果从数据流中读出奇数个数值，那么中位数就是所有数值排序之后位于中间的数值。如果从数据流中读出偶数个数值，那么中位数就是所有数值排序之后中间两个数的平均值。设计一个支持以下两种操作的数据结构：void addNum(int num) - 从数据流中添加一个整数到数据结构中；double findMedian() - 返回目前所有元素的中位数。  
示例：  
输入：["MedianFinder","addNum","addNum","findMedian","addNum","findMedian"]  
ㅤㅤㅤ[[],ㅤㅤㅤㅤ ㅤ ㅤ [1],ㅤ ㅤ ㅤ [2],ㅤㅤ ㅤ [],ㅤㅤㅤㅤㅤ [3],ㅤ ㅤ ㅤ []]  
输出：[null,ㅤㅤㅤ ㅤ ㅤ null,ㅤㅤㅤ null,ㅤㅤㅤ1.50000,ㅤㅤ null,ㅤㅤㅤ 2.00000]

思路：  
**数据结构及其设计**。建立一个 小顶堆 minHeap 和 大顶堆 maxHeap（使用java.util.PriorityQueue实现）各保存数据流（长度为 n）的一半元素：minHeap 保存较大的一半，长度为 n/2（n 为偶数）或 (n-1)/2（n为奇数）；maxHeap 保存较小的一半，长度为 n/2（n 为偶数）或 (n+1)/2（n为奇数）。当 n 为 偶数中位数为 maxHeap 的堆顶元素加 minHeap 的堆顶元素除以2，n 为 奇数则中位数为 maxHeap 的堆顶元素。  
从数据流中添加一个整数到数据结构时，对于大小堆元素数相等的情况，插入num 可能属于较大的一半(minHeap)，因此不能将 num 直接插入至 maxHeap。而应先将 num 先插入至 minHeap，再将 minHeap 堆顶元素插入至 maxHeap 。这样就可以始终保持 minHeap 保存较大一半，maxHeap 保存较小一半。对于大小堆元素数不相等的情况，同理。

题解：

```java
class MedianFinder {

    Queue<Integer> minHeap; // 小顶堆，用于存储数据流中的较大半部分，优先队列的头元素即为数据流的中间元素
    Queue<Integer> maxHeap; // 大顶堆，用于存储数据流中的较小半部分，优先队列的头元素即为数据流的中间元素

    /** initialize your data structure here. */
    public MedianFinder() {
        this.minHeap = new PriorityQueue<>();
        this.maxHeap = new PriorityQueue<>(new Comparator<Integer>() {
            @Override
            public int compare(Integer o1, Integer o2) { // 这里重写的方法为int compare(T o1, T o2) 比较用来排序的两个参数。参数应为范型 Integer 而不是 int
                return o2 - o1; // 降序
            }
        });
    }
    
    public void addNum(int num) {
        if (minHeap.size() == maxHeap.size()) { // 需要将新元素插入正确位置，且大顶堆元素数 + 1
            minHeap.add(num);
            maxHeap.add(minHeap.poll());
        } else { // 需要将新元素插入正确位置，且小顶堆元素数 + 1
            maxHeap.add(num);
            minHeap.add(maxHeap.poll());
        }
    }
    
    public double findMedian() {
        return minHeap.size() ==  maxHeap.size() ? (maxHeap.peek() + minHeap.peek()) * 0.5 : maxHeap.peek();
    }
}

/**
 * Your MedianFinder object will be instantiated and called as such:
 * MedianFinder obj = new MedianFinder();
 * obj.addNum(num);
 * double param_2 = obj.findMedian();
 */
```

tips：

- java.util.PriorityQueue类是一个基于优先级堆的无界优先级队列。优先级队列的元素按照其自然顺序进行排序，或者根据构造队列时提供的 Comparator 进行排序，具体取决于所使用的构造方法。优先级队列不允许使用 null 元素。依靠自然顺序的优先级队列还不允许插入不可比较的对象（可能导致 ClassCastException）。 此队列的头是按指定排序方式确定的最小元素。如果多个元素都是最小值，则头是其中一个元素（选择方法是任意的）。队列获取操作 poll、remove、peek 和 element 访问处于队列头的元素。此实现不是同步的，此实现为排队和出队方法（offer、poll、remove() 和 add）提供 O(log(n)) 时间，为 remove(Object) 和 contains(Object) 方法提供线性时间；为获取方法（peek、element 和 size）提供固定时间。此题使用PriorityQueue类来实现大、小顶堆的功能；
- 使用 PriorityQueue (Comparator<? super E> comparator) 创建具有默认初始容量的 PriorityQueue ，并根据指定的比较器对其元素进行排序。来实例化此优先级队列（JDK 1.8新特性）；
- 时间复杂度：O(1)，findMedian方法；O(logn)，addNum方法，堆的插入和弹出操作使用 O(logn) 时间
- 空间复杂度：O(n)

### 43. [1～n 整数中 1 出现的次数](https://leetcode-cn.com/problems/1nzheng-shu-zhong-1chu-xian-de-ci-shu-lcof/)

输入一个整数 n ，求1～n这 n 个整数的十进制表示中 1 出现的次数。1 <= n < 2^31。  
示例：  
输入：12  
输出：5  
解释：1～12这些整数中包含1 的数字有1、10、11和12，1一共出现了5次

思路：  
**常规数组题目，遍历，条件判断+数学（固定一位其他位的组合数及范围确定）**。将 1 ~ n 的个位、十位、百位、...的 1 出现次数（某位中 1 出现次数：固定 1 到某一位上，其它位在有效范围内的不同组合数也即不同的数值数）相加，即为 1 出现的总次数。设数字 n 是个 x 位数，记 n 的第 i 位为 ni，则可将 n 写为 nxnx-1⋯n2n1：称 ni 为 当前位，记为 cur；将 ni-1ni-2⋯n2n1 称为低位，记为 low；将 nxnx-1⋯ni+2ni+1  称为 高位，记为 high；将 10^i 称为位因子，记为 digit。  
某位中 1 出现次数的计算方法：  
1) 当 cur = 0 时：此位 1 的出现次数只由高位 high 决定：high * digit  
![](/images/2021-04-14-coding-interviews/43_1.png)  
2) 当 cur = 1 时：此位 1 的出现次数由高位 high 和低位 low 同时决定：high * digit + low + 1  
![](/images/2021-04-14-coding-interviews/43_2.png)  
3) 当 cur = 2,3,⋯,9 时：此位 1 的出现次数只由高位 high 决定：(high + 1) * digit  
![](/images/2021-04-14-coding-interviews/43_3.png)

题解：

```java
class Solution {
    public int countDigitOne(int n) {
        int result = 0;
        int high = n / 10, cur = n % 10, low = 0, digit = 1; // 高位、当前位、低位、位因子（10^i，从个位i=0开始）参数变量的初始化
        while (high != 0 || cur != 0) { // 高位和当前位都为0代表每位都遍历结束则退出循环
            if (cur == 0) {
                result += high * digit;
            } else if (cur == 1) {
                result += (high * digit + low + 1);
            } else result += (high + 1) * digit; // cur > 1 (2 ~ 9)
            // 更新下一轮的高位、当前位、低位、位因子参数变量（从个位到最高位的递推公式如下）
            low += cur * digit;
            cur = high % 10;
            high /= 10;
            digit *= 10;
        }
        return result;
    }
}
```

tips：

- 更新下一轮参数用到的当前轮参数需要在后面更新（更新优先级低），更新用不到的当前轮参数先更新（更新优先级高），以保证正确性（eg：low 参数在后面其他参数更新时用不到所以先更新，low 参数更新用到 cur 和 digit 参数所以 cur 和 digit 参数后更新，自更新的比如 high 和 digit 参数可以放到最后更新）；
- 时间复杂度：O(logn)，循环内的计算操作使用 )O(1) 时间，循环次数为数字 n 的位数，即 log10(n)，因此循环使用 O(logn) 时间
- 空间复杂度：O(1)

### 44. [数字序列中某一位的数字](https://leetcode-cn.com/problems/shu-zi-xu-lie-zhong-mou-yi-wei-de-shu-zi-lcof/)

数字以0123456789101112131415…的格式序列化到一个字符序列中。在这个序列中，第5位（从下标0开始计数）是5，第13位是1，第19位是4，等等。请写一个函数，求任意第n位对应的数字。0 <= n < 2^31。  
示例：  
输入：n = 11  
输出：0

思路：  
**常规数组题目，遍历，条件判断+数学（寻找递增格式化序列的规律）**。对于 n > 9，即从序列第10位（下标由0开始计数，则序列的第 n 位为序列中的第 n+1 个数）开始，计算时采用序列中的第几个数字的说法，故将 n++，定义变量 digit 表示位数（数字有几位数，1,2,3...），start 表示每 digit 位数的起始数字，count 表示 digit 位数的数字总数量。  
![](/images/2021-04-14-coding-interviews/44.png)  
求格式化序列任意第n位对应的数字：  
1) 确定第 n+1 个数所在 数字 的 位数 digit：循环执行 n 减去 一位数、两位数、... 的数字总数量 count ，直至 n≤count 时跳出，故结果在 digit 位数中且从数字 start 开始的序列的第 n 个数。  
2) 确定第 n+1 个数所在 数字 num：结果在从从数字 start 开始的第 (n−1)/digit 个 数字 中（start 为第 0 个数字）。  
3) 确定第 n+1 个数所在 数字 的 哪一位数：结果在 数字 num 的第 (n−1)%digit 位（数字 num 的首个数位为第 0 位）。

题解：

```java
class Solution {
    public int findNthDigit(int n) {
        if (n < 10) return n; // 当 n 为 0~9 时直接返回 n 的值
        n++;
        int digit = 1; // 位数的初始值，1位
        long start = 1; // 1 位数的起始数字
        long count = 10; // 1 位数的数字总数量，0~9
        while (n > count) {
            n -= count;
            digit++;
            start *= 10;
            count = 9 * start * digit;
        }
        long num = start + (n - 1) / digit;
        return Long.toString(num).charAt((n - 1) % digit) - '0';
    }
}
```

tips：

- 使用java.lang.Long类中的 static String toString(long i) 方法，返回表示指定 long 的 String 对象。 将结果所在数字转化为字符串，使用 charAt 方法得到所在位数的 0~9 的char字符，再将其减去字符 '0'，**字符char类型运算会提升为int类型**，结果即为结果的 int 类型；
- n < 2^31，序列的大小为一大数，需要考虑越界问题，start, count 及 num 需要使用 long 类型；
- 时间复杂度：O(logn) ，所求结果 result 对应数字 num 的位数 digit 最大为 O(logn)，第一步最多循环 O(logn) 次，第三步中**将 num 转化为字符串使用 O(logn) 时间**，因此总体为 O(logn) 
- 空间复杂度：O(logn)，**将数字 num 转化为字符串 str(num) ，占用 O(logn) 的额外空间**

### 45. [把数组排成最小的数](https://leetcode-cn.com/problems/ba-shu-zu-pai-cheng-zui-xiao-de-shu-lcof/)

输入一个非负整数数组，把数组里所有数字拼接起来排成一个数，打印能拼接出的所有数字中最小的一个。输出结果可能非常大，所以你需要返回一个字符串而不是整数。拼接起来的数字可能会有前导 0，最后结果不需要去掉前导 0 。  
示例：  
输入：[3,30,34,5,9]  
输出："3033459"

思路：  
**排序**。调用 java.lang.String 类中的 static String valueOf(int i) 方法，返回 int 参数的字符串表示形式，将 int 数组转换为字符串表示形式的字符串数组。调用库函数 java.util.Arrays 类中的  static \<T> void sort(T[] a, Comparator<? super T> c) 方法，根据指定比较器产生的顺序对指定对象数组进行排序。  
重写 Comparator 类中的 compare 方法（对两个字符串表示形式的数字进行大小比对）：拼接 (o1 + o2) 字符串后调用 java.lang.String 类中的 int compareTo(String anotherString) 方法，按字典顺序比较两个字符串，如果按字典顺序此 String 对象位于参数字符串之前，则比较结果为一个负整数。  
字典排序的定义：如果这两个字符串不同，那么它们要么在某个索引处的字符不同（该索引对二者均为有效索引），要么长度不同，或者同时具备这两种情况。如果它们在一个或多个索引位置上的字符不同，假设 k 是这类索引的最小值，则在位置 k 上具有较小值的那个字符串（使用 < 运算符确定），其字典顺序在其他字符串之前。在这种情况下，compareTo 返回这两个字符串在位置 k 处两个char 值的差，即值：this.charAt(k) - anotherString.charAt(k) ；如果没有字符不同的索引位置，则较短字符串的字典顺序在较长字符串之前。在这种情况下，compareTo 返回这两个字符串长度的差，即值：this.length() - anotherString.length() 。  
参数传入 (o2 + o1) 拼接后的字符串，当前者拼接方式字符串字典序小于后者拼接方式字符串字典序，则表示 o1 应 排在 o2 前面（字符串数组，o1 < o2）。  
字符串数组排序完毕遍历添加到结果中。

题解：

```java
class Solution {
    public String minNumber(int[] nums) {
        String[] strs = new String[nums.length];
        for (int i = 0; i < nums.length; i++) strs[i] = String.valueOf(nums[i]); 
        Arrays.sort(strs, new Comparator<String>() {
            @Override
            public int compare(String o1, String o2) {
                return (o1 + o2).compareTo(o2 + o1);
            }
        });
        StringBuilder result = new StringBuilder();
        for (String str : strs) result.append(str);
        return result.toString();
    }
}
```

tips：

- java.util.Arrays 类中的 static <T> void sort(T[] a, Comparator<? super T> c) 方法，根据指定比较器产生的顺序对指定对象数组进行排序。数组中的所有元素都必须是通过指定比较器可相互比较的（也就是说，对于数组中的任何 e1 和 e2 元素而言，c.compare(e1, e2) 不得抛出 ClassCastException）。保证此排序是稳定的：不会因调用 sort 方法而对相等的元素进行重新排序。此算法提供可保证的 n*log(n) 性能（快速排序）；
- 快速排序的一大优势就在于：排序过程中元素间总是两两比较（通用性更强）（将小于/大于中轴值 pivot 的元素位于两边），故通过 Comparable 或者 Comparator 接口实现 int compareTo(T o) 或者 int compare(T o1, T o2) 方法 来定义两个参数的大小比较规则；
- 时间复杂度：O(nlogn)
- 空间复杂度：O(n)

### 48. [最长不含重复字符的子字符串](https://leetcode-cn.com/problems/zui-chang-bu-han-zhong-fu-zi-fu-de-zi-zi-fu-chuan-lcof/)

请从字符串中找出一个最长的不包含重复字符的子字符串，计算该最长子字符串的长度。  
示例：  
输入："pwwkew"  
输出：3

思路：  
**滑动窗口**。定义两个指针left和right分别表示子数组（滑动窗口）的开始位置和结束位置。判断子串是否含有重复字符还需要使用额外的数据结构比如数组存储ASCII为数组索引值的字符在子串（滑动窗口）中出现的频率。此题是不满足要求移动左指针寻找新的满足要求的子数组。  
![](/images/2021-04-14-coding-interviews/48.png)

题解：

```java
class Solution {
    public int lengthOfLongestSubstring(String s) {
        int[] charFreq = new int[128]; // 存储ASCII为数组索引值的字符在子串（滑动窗口）中出现的频率
        int left = 0, right = -1; // nums[left, right]为滑动窗口
        int maxLen = 0;
        while (left < s.length()) {
            if (right + 1 < s.length() && charFreq[s.charAt(right + 1)] == 0) {
                charFreq[s.charAt(++right)]++;
            } else {
                charFreq[s.charAt(left++)]--;
            }
            maxLen = Math.max(maxLen, right - left + 1); // 当前子串（滑动窗口）一定不含有重复字符
        }
        return maxLen;
    }
}
```

tips：

- 对于数组来说需要注意是否越界问题，同理对于字符串来说，使用charAt()方法取值也需要注意是否越界的问题；
- char类型在运算的时候会被首先提升为int类型然后再计算，适用于算术运算、比较运算、赋值运算和数组的索引赋值，此题运用了数组的索引赋值；
- 判断时只需要使用子串起始索引left就可以，不需要再附加终止索引right的判断；
- 当字符串中出现较长的相同连续字符时left与right会交替的向前移动（滑动窗口）；
- 时间复杂度：O(n)
- 空间复杂度：O(∣Σ∣)，此题字符集为所有 ASCII 码在 [0,128) 内的字符，即∣Σ∣=128

### 50. [第一个只出现一次的字符](https://leetcode-cn.com/problems/di-yi-ge-zhi-chu-xian-yi-ci-de-zi-fu-lcof/)

在字符串 s 中找出第一个只出现一次的字符。如果没有，返回一个单空格。 s 只包含小写字母。  
示例：  
输入：s = "abaccdeff"  
输出：b

思路：  
**数据结构**。使用 java.util.LinkedHashMap<K,V> 类，Map 接口的哈希表和链接列表实现，具有可预知的迭代顺序。**此实现与 HashMap 的不同之处在于，后者维护着一个运行于所有条目的双重链接列表**。此链接列表定义了迭代顺序，该迭代顺序通常就是将键插入到映射中的顺序（插入顺序）。注意，如果**在映射中重新插入 键，则插入顺序不受影响**（如果在调用 m.put(k, v) 前 m.containsKey(k) 返回了 true，则调用时会将键 k 重新插入到映射 m 中），即插入相同的 key，会覆盖先前的 key : value，顺序还未原来的位置。  
map 集合的键使用 Character 类，表示字符串 s 中的字符，值使用 Boolean 类，当一个字符第一次插入且遍历结束仅插入过一次其值为 true。遍历字符串结束后再次遍历有序 map 集合寻找第一个 value 为true 的 key 返回。

题解：

```java
class Solution {
    public char firstUniqChar(String s) {
        Map<Character, Boolean> map = new LinkedHashMap<>();
        for (int i = 0; i < s.length(); i++) map.put(s.charAt(i), !map.containsKey(s.charAt(i)));
        for (Map.Entry<Character, Boolean> entry : map.entrySet()) {
            if (entry.getValue()) return entry.getKey();
        }
        return ' ';
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(1)，s 只包含小写字母，因此最多有 26 个不同字符，LinkedHashMap 存储需占用 O(26) = O(1) 的额外空间

### 51. [数组中的逆序对*](https://leetcode-cn.com/problems/shu-zu-zhong-de-ni-xu-dui-lcof/)

在数组中的两个数字，如果前面一个数字大于后面的数字，则这两个数字组成一个逆序对。输入一个数组，求出这个数组中的逆序对的总数。  
示例：  
输入：[7,5,6,4]  
输出：5

思路：  
**归并排序**。使用归并排序的算法思路，仅是在添加右半有序序列剩余的第一个元素到中转数组时更新结果（左半部分剩余几个元素就表示对于当前添加的右半部分元素的不同逆序对的个数）。合并两个有序子数组的过程中，利用数组的部分有序性，计算出一个数之前元素的逆序个数，所以排序的工作是必要的，在下一轮利用顺序关系加快逆序数的计算，也能避免重复计算。正确性验证：总是在原数组的某一子区间计算当前子区间的逆序对数，**子区间元素排序后其相对位置还是处于原数组原来的位置**（不影响后面的计算）。  
归并排序利用归并的思想，采用分治策略（将问题分成一些小的问题然后递归求解，而治的阶段则将分的阶段得到的各答案“修补”在一起，即分而治之）。分阶段为递归拆分子序列的过程（不进行任何排序操作），治阶段需要将两个已经有序的子序列合并成一个有序序列。

题解：

```java
class Solution {

    private int result;

    public int reversePairs(int[] nums) {
        result = 0;
        int[] tempArray = new int[nums.length];
        mergeSort(nums, 0, nums.length - 1, tempArray);
        return result;
    }

    // 分：递归拆分子序列 & 最后从栈顶开始治（将两个已经有序的子序列合并成一个有序序列）
    private void mergeSort(int[] nums, int left, int right, int[] tempArray) {
        if (left < right) {
            int mid = left + (right - left) / 2;
            mergeSort(nums, left, mid, tempArray); // 向左递归进行拆分
            mergeSort(nums, mid + 1, right, tempArray); // 向右递归进行拆分
            merge(nums, left, mid, right, tempArray); // 治：将两个已经有序的子序列合并成一个有序序列
        }
    }

    /**
     * 治：将两个已经有序的子序列合并成一个有序序列
     * @param array 排序的原始数组
     * @param left  左边有序序列的初始索引（最左端索引）
     * @param mid   中间索引
     * @param right 右边有序序列的最右端索引
     * @param tempArray  用于中转的数组
     */
    private void merge(int[] nums, int left, int mid, int right, int[] tempArray) {
        int i = left; // 左边有序序列的初始索引（最左端索引）
        int j = mid + 1; // 右边有序序列的初始索引（最左端索引）
        int index = 0; // 指向用于中转的数组temp的当前索引
        while (i <= mid && j <= right) { // 将左右两边的有序序列按照规则填充到中转数组，直到左右两边的有序序列有一边处理完毕
            if (nums[i] <= nums[j]) { // 左边有序序列的当前元素**小于等于**右边有序序列的当前元素则将左边有序序列的当前元素填充到中转数组
                tempArray[index++] = nums[i++];
            } else { // 右边有序序列的当前元素**小于**左边有序序列的当前元素则将右边有序序列的当前元素填充到中转数组，同时更新结果（结果增加左半部分剩余元素的个数）
                tempArray[index++] = nums[j++];
                result += mid - i + 1; // 左半部分剩余几个元素就表示对于当前添加的右半部分元素的不同逆序对的个数
            }
        }
        // 将有剩余数据的一边有序数组依次全部填充到中转数组（当右半部分有剩余元素时，左半部分数组已为空，故不需更新结果）
        while (i <= mid) tempArray[index++] = nums[i++];
        while (j <= right) tempArray[index++] = nums[j++];
        index = 0; // 中转数组的索引重新置0，用于将中转数组排序好的元素覆盖到原数组中的正确位置
        int indexNums = left; // 原数组的索引
        while (indexNums <= right) nums[indexNums++] = tempArray[index++]; // 将中转数组的元素拷贝到原数组中（并非拷贝所有）
    }
}
```

tips：

- 对于 int mid = (left + right) / 2; 的计算除了位运算，还可以使用 int mid = left + (right - left) / 2; 的形式，意义在于当 left 和 right 都特别大时，left + right 可能越界；
- 时间复杂度：O(nlogn)
- 空间复杂度：O(n)

### 53 - I. [在排序数组中查找数字](https://leetcode-cn.com/problems/zai-pai-xu-shu-zu-zhong-cha-zhao-shu-zi-lcof/)

统计一个数字在排序数组中出现的次数。  
示例：  
输入：nums = [5,7,7,8,8,10], target = 8  
输出：2

思路：  
**二分查找+数学（[位运算](https://yujie2020.github.io/2021-05-03-binary-digit-and-bitwise-operation.html)）**。**此题 while循环使用 left < right 的判断方式，则当退出循环时 left = right**，判断 nums[left] == target即找到。搜索过程中数组的中间元素mid使用位运算来求解，将位模式右移一位。求target在数组中的开始位置，mid中间数下取整，即mid = left + right >> 1，当while循环的最后一次执行中，保证left = mid（因target <= nums[mid]时right = mid，防止陷入死循环）；求target在数组中的结束位置，mid中间数上取整，即mid = left + right + 1 >> 1，当while循环的最后一次执行中，保证right = mid（因target >= nums[mid]时left = mid，防止陷入死循环）。

题解：

```java
class Solution {
    public int search(int[] nums, int target) {
        int len = nums.length;
        if (len == 0) return 0;
        int begin = -1, end = -1; // 数字 target 在排序数组中的起始和终止索引
        int left = 0, right = len - 1;
        while (left < right) {
            int mid = left + right >> 1;
            if (target <= nums[mid]) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }
        if (nums[left] != target) {
            return 0;
        } else {
            begin = left;
            right = len - 1; // 不再重新定义left = 0，使搜索范围缩小为target开始位置到数组末尾，提高程序执行效率
            while (left < right) {
                int mid = left + right + 1 >> 1;
                if (target >= nums[mid]) {
                    left = mid;
                } else {
                    right = mid - 1;
                }
            }
            end = left; // 即使target只出现了一次，进入此循环的有效数组范围任包括target开始位置，故可找到其结束位置=开始位置
            return end - begin + 1;
        }
    }
}
```

tips：

- 时间复杂度：O(logn)
- 空间复杂度：O(1)

### 53 - II. [0～n-1中缺失的数字](https://leetcode-cn.com/problems/que-shi-de-shu-zi-lcof/)

一个长度为n-1的递增排序数组中的所有数字都是唯一的，并且每个数字都在范围0～n-1之内。在范围0～n-1内的n个数字中有且只有一个数字不在该数组中，请找出这个数字。1 <= 数组长度 <= 10000。  
示例：  
输入：[0,1,3]  
输出：2

思路：  
**二分查找**。数组可以划分为两部分：左子数组 nums[i] = i，右子数组 nums[i] != i 。while循环使用 left < right 的判断方式，则当退出循环时 left = right，且一定为缺失数字所在的索引（mid == nums[mid] 时 right = mid）。当索引位于数组末尾时，缺失数字可能为当前索引也可能为当前索引加一（eg：数组 0,1,2,3 缺失数字为 4），故返回值需要判断。

题解：

```java
class Solution {
    public int missingNumber(int[] nums) {
        int left = 0, right = nums.length - 1;
        while (left < right) {
            int mid = left + right >> 1;
            if (mid == nums[mid]) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return nums[left] == left ? left + 1 : left;
    }
}
```

tips：

- 排序数组中的搜索问题，一般使用 二分查找 解决；
- 时间复杂度：O(logn)
- 空间复杂度：O(1)

### 56 - I. [数组中数字出现的次数](https://leetcode-cn.com/problems/shu-zu-zhong-shu-zi-chu-xian-de-ci-shu-lcof/)

一个整型数组 `nums` 里除两个数字之外，其他数字都出现了两次。请写程序找出这两个只出现一次的数字。要求时间复杂度是O(n)，空间复杂度是O(1)。  
示例：  
输入：nums = [4,1,4,6]  
输出：[1,6] 或 [6,1]

思路：  
**数学（[位运算](https://yujie2020.github.io/2021-05-03-binary-digit-and-bitwise-operation.html)）**。如果数组 nums 中只有一个出现一次的数字，其余数字均为出现两次的数字，则由[异或运算的性质](https://yujie2020.github.io/2021-05-03-binary-digit-and-bitwise-operation.html)，数组中全部元素的异或运算结果即为此出现一次的数字。
对于此题，设两个只出现一次的数字其中一个为 x（另一个为 y），由于 x != y，则 x 和 y 二进制至少有一位不同（即分别为 0 和 1 ），根据此位通过对数组中元素进行与运算可以将原数组 nums 拆分为两个子数组使得：两个只出现一次的数字在不同的子数组中同时原数组中相同的数字会被分到相同的子数组中（两个相同的数字的对应位都是相同的，所以一个被分到了某一组另一个必然被分到这一组；x 和 y 的此二进制位不同则不会被分到同一组）。遍历数组 nums，其中所有元素异或运算的结果为 excl = x⊕y；定义 util 为与运算用于分组的数，其初始值为1。寻找整数 x⊕y 任意一个为 1 的二进制位：将 excl 与 util 进行与运算，结果为 0 则将 util 左移一位，结果不为0时则找到此二进制位 util （二进制位只有一位为1其余都为0）。将 util 对原数组中元素进行与运算，此位为 0 的为一组，对此子数组全部元素的异或运算即可求得只出现一次的数字其中的一个 x，将 x 与原数组nums中所有元素异或运算的结果 excl 进行异或运算即可求得两个只出现一次的数字的另外一个 y。

题解：

```java
class Solution {
    public int[] singleNumbers(int[] nums) {
        int x = 0, excl = 0, util = 1; // x为两个只出现一次的数字中的一个；excl为数组nums中所有元素异或运算的结果；util为与运算用于分组的数
        for (int num : nums) excl ^= num;
        while ((excl & util) == 0) util <<= 1;
        for (int num : nums) {
            if ((num & util) == 0) x ^= num;
        }
        return new int[] {x, x ^ excl};
    }
}
```

tips：

- 思路与136题相似；
- 时间复杂度：O(n)
- 空间复杂度：O(1)

### 56 - II. [数组中数字出现的次数 II](https://leetcode-cn.com/problems/shu-zu-zhong-shu-zi-chu-xian-de-ci-shu-ii-lcof/)

在一个数组 `nums` 中除一个数字只出现一次之外，其他数字都出现了三次。请找出那个只出现一次的数字。1 <= nums[i] < 2^31。  
示例：  
输入：nums = [9,1,7,9,7,9,7]  
输出：1

思路：  
**数学（[位运算](https://yujie2020.github.io/2021-05-03-binary-digit-and-bitwise-operation.html)）**。考虑数字的二进制形式，对于出现三次的数字，各 二进制位 出现1或0的次数都是 3 的倍数。统计所有数字的各二进制位中 1 的出现次数，并对 3 求余，结果则为只出现一次的数字。  
![](/images/2021-04-14-coding-interviews/56.png)  
使用与运算和右移运算可统计一个数字各二进制位为1还是0，遍历数组中每一个数，定义长度为32的数组 oneFreq 记录所有数字的各二进制位 1 出现次数的总和。遍历 oneFreq 数组，对每一二进制位1出现的次数对 3 取模，将结果（1或0）对 result 进行或运算赋值给 result 对应二进制位（因为为或运算，所以对已有结果二进制位没有影响），左移 result 遍历求解。

题解：

```java
class Solution {
    public int singleNumber(int[] nums) {
        int[] oneFreq = new int[32];
        for (int num : nums) {
            for (int i = 0; i < 32; i++) {
                oneFreq[i] += num & 1;
                num >>= 1;
            }
        }
        int result = 0; // 结果的初始值为0
        for (int i = 0; i < 32; i++) {
            result <<= 1; // 需先执行左移运算，否则在最后一次循环内结果已经先生成但是又左移了一次导致答案错误（后执行左移运算：左移32次，错误；先执行左移运算：左移31次，正确，实际执行了32次，但是第一次result=0，左移还为0）
            result |= oneFreq[31 - i] % 3; // 从高位开始
        }
        return result;
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(1)

### 57 - I. [和为s的两个数字](https://leetcode-cn.com/problems/he-wei-sde-liang-ge-shu-zi-lcof/)

输入一个递增排序的数组和一个数字s，在数组中查找两个数，使得它们的和正好是s。如果有多对数字的和等于s，则输出任意一对即可。  
示例：  
输入：nums = [2,7,11,15], target = 9  
输出：[2,7] 或者 [7,2]

题解：

```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left < right) {
            int sum = nums[left] + nums[right];
            if (sum == target) {
                return new int[] {nums[left], nums[right]};
            } else if (sum < target) {
                left++;
            } else right--;
        }
        return null;
    }
}
```

tips：

- **双指针**。对撞指针的思路，与167题思路相同。
- 时间复杂度：O(n)
- 空间复杂度：O(1)

### 57 - II. [和为s的连续正数序列](https://leetcode-cn.com/problems/he-wei-sde-lian-xu-zheng-shu-xu-lie-lcof/)

输入一个正整数 target ，输出所有和为 target 的连续正整数序列（至少含有两个数）。序列内的数字由小到大排列，不同序列按照首个数字从小到大排列。  
示例：  
输入：target = 9  
输出：[[2,3,4],[4,5]]

思路：  
**滑动窗口**。使用两个指针 l 和 r 表示当前枚举到的以 l 为起点到 r 的区间，sum = (l + r) * (r - l + 1) / 2 表示 [l,r] 的区间和。sum<target 时，说明指针 r 还可以向右拓展使得 sum 增大，r++；sum>target 时，说明以 l 为起点不存在一个 r 使得 sum=target，此时要枚举下一个起点，l++；sum==target 时，即找到一连续子区间满足题意，保存当前结果，以 l 为起点的合法解最多只有一个，枚举下一个起点，l++。

题解：

```java
class Solution {
    public int[][] findContinuousSequence(int target) {
        List<int[]> result = new ArrayList<>();
        for (int l = 1, r = 2; l < r;) {
            int sum = (l + r) * (r - l + 1) / 2;
            if (sum == target) {
                int[] ele = new int[r - l + 1];
                for (int i = l; i <= r; i++) ele[i - l] = i;
                result.add(ele);
                l++; // 防止陷入死循环，需查找下一个结果，l++（以l开头的连续序列唯一）
            } else if (sum < target) {
                r++;
            } else { // 当满足最后一个区间（指针 r 移动到了 (target+1)/2 的位置）后，l++总会等于r而退出循环
                l++;
            }
        }
        return result.toArray(new int[result.size()][]);
    }
}
```

tips：

- 泛型E可以是数组；
- **二维数组每行的大小可以不同**；
- 使用 java.util.List\<E> 类中的 \<T> T[] toArray(T[] a) 方法，返回按适当顺序（从第一个元素到最后一个元素）包含列表中所有元素的数组。这里无需指定每行的大小，因为每个子区间的大小不同即二维数组的每行大小不同。对于每行均为泛型 int[]，满足参数要求；
- 时间复杂度：O(n)，两个指针移动均单调不减且最多移动 target/2 次
- 空间复杂度：O(1)

### 58 - I. [翻转单词顺序](https://leetcode-cn.com/problems/fan-zhuan-dan-ci-shun-xu-lcof/)

输入一个英文句子，翻转句子中单词的顺序，但单词内字符的顺序不变。为简单起见，标点符号和普通字母一样处理。无空格字符构成一个单词。输入字符串可以在前面或者后面包含多余的空格，但是反转后的字符不能包括。如果两个单词间有多余的空格，将反转后单词间的空格减少到只含一个。  
示例：  
输入："ㅤㅤㅤhelloㅤworld!  "  
输出："world! hello"

题解：

```java
class Solution {
    public String reverseWords(String s) {
        String[] words = s.trim().split("\\s+");
        StringBuilder result = new StringBuilder();
        for (int i = words.length - 1; i > 0; i--) result.append(words[i]).append(" ");
        result.append(words[0]);
        return result.toString();
    }
}
```

tips：

- **常规数组题目，遍历，条件判断**；
- 使用 java.lang.String 类中的 String trim() 方法，返回字符串的副本，忽略前导空白和尾部空白；
- 使用 java.lang.String 类中的 String[] split(String regex) 方法，根据给定正则表达式的匹配拆分此字符串。此处参数正则表达式传入 "\\\s+"，\s 代表空白字符：[ \t\n\x0B\f\r] ，\ 需要使用 \ 进行转义（某一些特定的字符在编程语言中被定义为特殊用途的字符，这些字符由于被定义为特殊用途，它们失去了原有的意义，为了使用这些符号，就需要定义它的转义字符串）；
- 时间复杂度：O(n)
- 空间复杂度：O(n)

### 58 - II. [左旋转字符串](https://leetcode-cn.com/problems/zuo-xuan-zhuan-zi-fu-chuan-lcof/)

字符串的左旋转操作是把字符串前面的若干个字符转移到字符串的尾部。请定义一个函数实现字符串左旋转操作的功能。  
示例：  
输入：s = "abcdefg", k = 2  
输出："cdefgab"

题解：

```java
class Solution {
    public String reverseLeftWords(String s, int n) {
        return s.substring(n) + s.substring(0, n);
    }
}
```

tips：

- java.lang.String 类中的 public String substring(int index) 方法：截取从参数位置一直到字符串末尾，返回新字符串；public String substring(int beginIndex, int endIndex) 方法：截取从begin开始，一直到end结束，中间的字符串（[beginIndex,endIndex)，包含左边，不包含有右边）；
- 时间复杂度：O(n)，字符串切片函数为线性时间复杂度
- 空间复杂度：O(n)

### 59 - I. [滑动窗口的最大值](https://leetcode-cn.com/problems/hua-dong-chuang-kou-de-zui-da-zhi-lcof/)

给定一个数组 `nums` 和滑动窗口的大小 `k`，请找出所有滑动窗口里的最大值。  
示例：  
输入：nums = [1,3,-1,-3,5,3,6,7], k = 3  
输出：[3,3,5,5,6,7]  
解释：  
滑动窗口的位置ㅤㅤㅤㅤㅤ最大值  
[1  3  -1] -3  5  3  6  7ㅤㅤㅤㅤ3  
 1 [3  -1  -3] 5  3  6  7ㅤㅤㅤㅤ3  
 1  3 [-1  -3  5] 3  6  7ㅤㅤㅤㅤ5  
 1  3  -1 [-3  5  3] 6  7ㅤㅤㅤㅤ5  
 1  3  -1  -3 [5  3  6] 7ㅤㅤㅤㅤ6  
 1  3  -1  -3  5 [3  6  7]ㅤㅤㅤㅤ7

思路：  
**数据结构**。有序双端队列（有序的也即为单调队列）的思路。遍历数组，**使用一个队列存储所有还没有被移除的下标（并非值）**。在队列中，这些下标按照从小到大的顺序被存储，并且它们在数组 nums 中对应的值是严格单调递减的。当滑动窗口向右移动时，需要把一个新的元素放入队列中。如果当前遍历的数（窗口移动时的新增元素）比队尾的值大，则需要不断弹出队尾值，直到队列重新满足从大到小的要求，再添加当前遍历的数（因为**之前**比当前遍历的数小的元素的值之后滑动窗口选取元素最大值的时候一定用不上）。刚开始遍历时，有一个形成窗口的过程，当窗口大小形成（遍历到第一个窗口的最后一个索引）后，每次移动时，判断队首的值的数组下标是否在滑动窗口中，如果在则需要弹出队首的值，当前窗口的最大值即为队首的数。  
![](/images/2021-04-14-coding-interviews/59.png)

题解：

```java
class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        if (k == 0) return new int[0];
        int[] result = new int[nums.length - k + 1];
        Deque<Integer> deque = new LinkedList<>();
        for (int i = 0; i < nums.length; i++) {
            while (deque.size() > 0 && nums[i] > nums[deque.getLast()]) deque.removeLast();
            deque.addLast(i);
            if (i - k + 1 >= 0) result[i - k + 1] = nums[deque.getFirst()];
            if (i - k + 1 >= deque.getFirst()) deque.removeFirst();
        }
        return result;
    }
}
```

tips：

- 对java.util.Queue\<E>接口类的熟悉；
- 时间复杂度：O(n)
- 空间复杂度： O(k)，新增最大长度为k的双端队列

### 59 - II. [队列的最大值](https://leetcode-cn.com/problems/dui-lie-de-zui-da-zhi-lcof/)

请定义一个队列并实现函数 max_value 得到队列里的最大值，要求函数max_value、push_back 和 pop_front 的均摊时间复杂度都是O(1)。若队列为空，pop_front 和 max_value 需要返回 -1。  
示例：  
输入：["MaxQueue","push_back","push_back","max_value","pop_front","max_value"]  
ㅤㅤㅤ[[],ㅤㅤㅤㅤㅤㅤ[1],ㅤㅤㅤㅤ[2],ㅤㅤㅤㅤㅤ[],ㅤㅤㅤㅤㅤ[],ㅤㅤㅤㅤㅤ[]]  
输出：[null,ㅤㅤㅤㅤㅤnull,ㅤㅤㅤ null, ㅤㅤㅤ ㅤ 2, ㅤ ㅤ ㅤ ㅤ1,ㅤㅤㅤㅤㅤ2]

思路：  
**数据结构及其设计**。首先构建一个普通队列 queue，实现入队 push_back() 和出队 pop_front() 操作。其次构建一个有序双端队列（有序的也即为单调队列）deque 来保存队列 queue 所有递减的元素，deque 随着入队和出队操作实时更新（保证队列 queue 最大元素始终对应 deque 的首元素）：当执行入队 push_back() 时，若入队一个比队列某些元素更大的数字 value，为了保持 deque 单调不增（若队列 queue 中存在两个 值相同的最大元素 ，此时 queue 和 deque 同时弹出一个最大元素，而 queue 中还有一个此最大元素，即采用单调递减将导致两队列中的元素不一致。eg：先执行 push(5), push(5), pop(5)，queue 为 [5] -> [5, 5] -> [5]，deque 为 [5] -> [5] -> []，再次执行 getMax()，返回值应为 5 而双端队列 deque 为单调递减时返回 -1 则错误，原因即为两队列中的元素不一致），需要将双端队列 deque 尾部所有小于 value 的元素 弹出；当执行出队 pop_front() 时，若出队的元素是最大元素，则 双端队列 deque 需要同时 将首元素出队 ，以保持队列 queue 和 双端队列 deque 的元素一致性。

题解：

```java
class MaxQueue {

    private Queue<Integer> queue;
    private Deque<Integer> deque;

    public MaxQueue() {
        queue = new LinkedList<>();
        deque = new LinkedList<>();
    }
    
    public int max_value() {
        return deque.isEmpty() ? -1 : deque.peekFirst();
    }
    
    public void push_back(int value) {
        while (!deque.isEmpty() && value > deque.peekLast()) deque.pollLast();
        deque.offerLast(value);
        queue.offer(value);
    }
    
    public int pop_front() {
        if (queue.isEmpty()) return -1;
        if (queue.peek().equals(deque.peekFirst())) deque.pollFirst();
        return queue.poll();
    }
}

/**
 * Your MaxQueue object will be instantiated and called as such:
 * MaxQueue obj = new MaxQueue();
 * int param_1 = obj.max_value();
 * obj.push_back(value);
 * int param_3 = obj.pop_front();
 */
```

tips：

- java.util.Queue\<E> 类中的 boolean offer(E e) 方法，将指定的元素插入此队列（如果立即可行且不会违反容量限制），当使用有容量限制的队列时，此方法通常要优于 add(E)，后者可能无法插入元素，而只是抛出一个异常；
- java.util.Queue\<E> 类中的 E peek() 方法，获取但不移除此队列的头，如果此队列为空则返回 null。E poll() 方法，获取并移除此队列的头，如果此队列为空，则返回 null；
- interface Deque\<E> extends Queue\<E> extends Collection\<E>，Deque 类中的 offerFirst 方法通常优于 addFirst(E) 方法，后者可能无法插入元素，而只是抛出一个异常。offerLast 方法通常优于 addLast(E) 方法，后者可能无法插入元素，而只是抛出一个异常。pollFirst 和 pollLast 方法在双端队列为空时都返回 null，而 removeFirst 和 removeLast 在双端队列为空时将抛出一个异常。peekFirst 和 peekLast 方法在双端队列为空时都返回 null，而 getFirst 和 getLast 在双端队列为空时将抛出一个异常；
- **两个对象都为 Integer 时使用 == 作比较将不会发生自动拆装箱，比较的为对象的地址值**。**两个都是包装类需使用 .equals() 方法比较**，故出队时两个队列首元素的比较需要使用 java.lang.Integer 类中的 boolean equals(Object obj) 方法，比较此对象与指定对象。当且仅当参数不为 null，并且是一个与该对象包含相同 int 值的 Integer 对象时，结果为 true。eg：Integer i1 = new Integer(1); Integer i2 = new Integer(1) ，i1 == i2 将返回false ，没有发生自动拆装箱。而一个是 int 类型，一个是包装类，则可以直接使用 == 进行比较，包装类自动拆箱为 int 类型，比较的是值，不会存在一个是基本类型一个是引用类型（包装类）不能比较的情况；
- 时间复杂度：O(1)，max_value(), push_back(), pop_front() 方法的均摊时间复杂度均为 O(1)
- 空间复杂度：O(n)，当元素个数为 n 时，最差情况下 deque 中保存 n 个元素

### 61. [扑克牌中的顺子](https://leetcode-cn.com/problems/bu-ke-pai-zhong-de-shun-zi-lcof/)

从扑克牌中随机抽5张牌，判断是不是一个顺子，即这5张牌是不是连续的。2～10为数字本身，A为1，J为11，Q为12，K为13，而大、小王为 0 ，可以看成任意数字。A 不能视为 14。数组的数取值为 [0, 13]。  
示例：  
输入：[0,0,1,2,5]  
输出：true

题解：

```java
class Solution {
    public boolean isStraight(int[] nums) {
        int[] poker = new int[14]; // 用于判断是否有重复的牌
        int max = 0, min = 13; // 数组中除0外最大值的初始值为0（为一数组可能出现的最小的值），除0外最小值的初始值需为13不能为0（为一数组可能出现的最大的值）
        for (int num : nums) {
            if (num == 0) continue; // 遇到大小王则直接跳过
            if (poker[num]++ == 1) return false; // 除大小王外有重复牌则直接返回false
            max = Math.max(max, num);
            min = Math.min(min, num);
        }
        return max - min < 5;
    }
}
```

tips：

- **常规数组题目，遍历，条件判断**；
- 时间复杂度：O(1)
- 空间复杂度：O(1)

### 63. [股票的最大利润](https://leetcode-cn.com/problems/gu-piao-de-zui-da-li-run-lcof/)

假设把某股票的价格按照时间先后顺序存储在数组中，请问买卖该股票一次可能获得的最大利润是多少？0 <= 数组长度 <= 10^5。  
示例：  
输入：[7,1,5,3,6,4]ㅤ|ㅤ[7,6,4,3,1]  
输出：5ㅤ|ㅤ0  
解释：在第 2 天（股票价格 = 1）的时候买入，在第 5 天（股票价格 = 6）的时候卖出，最大利润 = 6-1 = 5 。注意利润不能是 7-1 = 6, 因为卖出价格需要大于买入价格。ㅤ|ㅤ在这种情况下, 没有交易完成, 所以最大利润为 0。

题解：

```java
class Solution {
    public int maxProfit(int[] prices) {
        int result = 0;
        if (prices.length == 0) return result;
        int min = prices[0];
        for (int i = 1; i < prices.length; i++) {
            if (prices[i] < min) {
                min = prices[i];
            } else {
                result = Math.max(result, prices[i] - min);
            }
        }
        return result;
    }
}
```

tips：

- **常规数组题目，遍历，条件判断**。
- 时间复杂度：O(n)
- 空间复杂度：O(1)

### 64. [求1+2+…+n*](https://leetcode-cn.com/problems/qiu-12n-lcof/)

求 `1+2+...+n` ，要求不能使用乘除法、for、while、if、else、switch、case等关键字及条件判断语句（A?B:C）。  
示例：  
输入：n = 3  
输出：6

思路：  
**递归**。递归语句为 return n == 1 ? 1 : n + sumNums(n - 1); ，利用逻辑运算符与 && 的短路特性来替代条件判断语句（当 n=1 时终止递归）。

题解：

```java
class Solution {
    public int sumNums(int n) {
        boolean flag = n > 0 && (n += sumNums(n - 1)) > 0;
        return n;
    }
}
```

tips：

- 时间复杂度：O(n)，计算 n+(n−1)+...+2+1 需要开启 n 个递归函数
- 空间复杂度：O(n)，递归深度为 n，使用 O(n) 大小的额外空间

### 65. [不用加减乘除做加法](https://leetcode-cn.com/problems/bu-yong-jia-jian-cheng-chu-zuo-jia-fa-lcof/)

写一个函数，求两个整数之和，要求在函数体内不得使用 “+”、“-”、“*”、“/” 四则运算符号。a, b 均可能是负数或 0。  
示例：  
输入：a = 1, b = 1  
输出：2

思路：  
**数学（[位运算](https://yujie2020.github.io/2021-05-03-binary-digit-and-bitwise-operation.html)）**。通过位运算实现两数的加法。设两数字的二进制形式 a, b，其求和 s = a + b，以 x(i) 代表一个数 x 的二进制第 i 位，令无进位和为 n，进位为 c，则两数相加有以下四种情况：  
a(i)ㅤb(i)ㅤ无进位和n(i)ㅤ进位c(i+1)  
0ㅤㅤ0ㅤㅤㅤㅤ0ㅤㅤㅤㅤㅤ0  
0ㅤㅤ1ㅤㅤㅤㅤ1ㅤㅤㅤㅤㅤ0  
1ㅤㅤ0ㅤㅤㅤㅤ1ㅤㅤㅤㅤㅤ0  
1ㅤㅤ1ㅤㅤㅤㅤ0ㅤㅤㅤㅤㅤ1  
无进位和 与 异或运算 规律相同，进位 与 与运算 规律相同（需要左移一位），故无进位和 n = a⊕b，进位 c = a&b<<1，和 s = a + b = n + c，循环求解 n 和 c，直至 进位 c 等于0，此时和 s = n 返回结果。

题解：

```java
class Solution {
    public int sumNums(int n) {
        boolean flag = n > 0 && (n += sumNums(n - 1)) > 0;
        return n;
    }
}
```

tips：

- 对于负数也适用（使用补码计算）。在计算机系统中，数值一律用 补码 来表示和存储：加减法可以统一处理；
- 时间复杂度：O(1)，最差情况下（eg：a=-1, b=1 时）需循环 32 次使用 O(1) 时间，每轮中的常数次位操作使用 O(1) 时间
- 空间复杂度：O(1)

### 67. [把字符串转换成整数](https://leetcode-cn.com/problems/ba-zi-fu-chuan-zhuan-huan-cheng-zheng-shu-lcof/)

写一个函数 StrToInt，实现把字符串转换成整数这个功能。不能使用 atoi 或者其他类似的库函数。首先，该函数会根据需要丢弃无用的开头空格字符，直到寻找到第一个非空格的字符为止。当我们寻找到的第一个非空字符为正或者负号时，则将该符号与之后面尽可能多的连续数字组合起来，作为该整数的正负号；假如第一个非空字符是数字，则直接将其与之后连续的数字字符组合起来，形成整数。该字符串除了有效的整数部分之后也可能会存在多余的字符，这些字符可以被忽略，它们对于函数不应该造成影响。注意：假如该字符串中的第一个非空格字符不是一个有效整数字符、字符串为空或字符串仅包含空白字符时，则你的函数不需要进行转换。在任何情况下，若函数不能进行有效的转换时，请返回 0。假设环境只能存储 32 位大小的有符号整数，那么其数值范围为 [−2^31,  2^31 − 1]。如果数值超过这个范围，请返回  INT_MAX (2^31 − 1) 或 INT_MIN (−2^31) 。  
示例：  
输入："4193 with words"  
输出：4193

思路：  
**常规数组题目，遍历，条件判断**。先将遍历空格字符的循环独立写在最前；其次判断一个符号位（index最多加一次）；最后遍历有效数字部分，遇到首个非数字的字符时立即返回（即使字符串中无有效数字 signed\*result = 0），使用数字拼接和 ”此数字的 ASCII 码” 与 “ 0 的 ASCII 码” 相减的方式得到结果。越界处理（数值范围为 [-2^31, 2^31-1]）：result>2147483647/10 时执行拼接10\*result 越界；result=2147483647/10&&ch-'0'>7 时执行拼接10\*result+ch-'0' 越界。

题解：

```java
class Solution {
    public int strToInt(String str) {
        int len = str.length();
        if (len == 0) return 0;
        int signed = 1; // 数字的正负值
        int result = 0;
        int index = 0; // 用于1)在读取到有效数字前字符串的遍历、2)符号位的判断及3)有效数字的遍历（字符串str的索引）
        while (str.charAt(index) == ' ') if (++index == len) return 0; // 1)在读取到有效数字前字符串的遍历：在仅用于读取有效数字的遍历外（之前）
        if (str.charAt(index) == '-') signed = -1; // 2)符号位的判断
        if (str.charAt(index) == '-' || str.charAt(index) == '+') index++; // 上一步符号位为负时索引index并未++，或者读取到'+'，则索引index++
        for (int i = index; i < len; i++) { // 3)有效数字的遍历
            char ch = str.charAt(i);
            if (ch < '0' || ch > '9') break;
            if (result > 214748364 || result == 214748364 && ch - '0' > 7) return signed == 1 ? Integer.MAX_VALUE : Integer.MIN_VALUE;
            result = result * 10 + ch - '0';
        }
        return signed * result;
    }
}
```

tips：

- **可以将一个具有多种条件判断的迭代/遍历/循环拆分成多个功能独立（只判断某些条件）的（迭代/遍历/循环）部分**（一般需要将索引定义为单独的局部变量）。将字符串的整体遍历按功能拆开成多个独立的遍历部分，每个独立遍历部分实现单一的功能（判断）。并非总要将所有功能集成到一个循环（遍历）内；
- 时间复杂度：O(n)
- 空间复杂度：O(1)

## Ⅱ Linked List 链表

链表相关的算法题目。

对于链表相关题目，无论使用哪种思路解题，大都有会使用到 **虚拟头节点 dummyHead** 的思路，用于返回结果链表的头节点，以及在原链表需要删除的元素可能为头节点的情况下为了便于删除节点，或者便于在新结果链表中添加元素/节点。
与此同时，链表相关题目都会使用到指针。

### 6. [从尾到头打印链表](https://leetcode-cn.com/problems/cong-wei-dao-tou-da-yin-lian-biao-lcof/)

输入一个链表的头节点，从尾到头反过来返回每个节点的值（用数组返回）。0 <= 链表长度 <= 10000。  
示例：  
输入：head = [1,3,2]  
输出：[2,3,1]

题解：

```java
/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode(int x) { val = x; }
 * }
 */
class Solution {
    public int[] reversePrint(ListNode head) {
        ListNode cur = head; // 用于统计链表的长度
        int len = 0; // 链表长度
        while (cur != null) {
            len++;
            cur = cur.next;
        }
        int[] result = new int[len];
        for (int i = len - 1; i >= 0; i--) {
            result[i] = head.val;
            head = head.next;
        }
        return result;
    }
}
```

tips：

- **指针**。遍历链表使用cur指针统计链表的长度len，建立长度为链表长度len的数组，再次遍历链表，将链表节点的值倒序存储到数组中；
- 时间复杂度：O(n)
- 空间复杂度：O(1)

### 18. [删除链表的节点](https://leetcode-cn.com/problems/shan-chu-lian-biao-de-jie-dian-lcof/)

给定单向链表的头指针和一个要删除的节点的值，定义一个函数删除该节点。返回删除后的链表的头节点。题目保证链表中节点的值互不相同。  
示例：  
输入：head = [4,5,1,9], val = 5  
输出：[4,1,9]

题解：

```java
/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode(int x) { val = x; }
 * }
 */
class Solution {
    public ListNode deleteNode(ListNode head, int val) {
        ListNode dummyHead = new ListNode();
        dummyHead.next = head;
        ListNode cur = dummyHead;
        while (cur.next.val != val) cur = cur.next;
        cur.next = cur.next.next;
        return dummyHead.next;
    }
}
```

tips：

- **指针**。使用cur指针删除值为 val 的节点；
- 时间复杂度：O(n)
- 空间复杂度：O(1)

### 22. [链表中倒数第k个节点](https://leetcode-cn.com/problems/lian-biao-zhong-dao-shu-di-kge-jie-dian-lcof/)

输入一个链表，输出该链表中倒数第k个节点。本题从1开始计数，即链表的尾节点是倒数第1个节点。  
示例：  
输入：1->2->3->4->5，k = 2  
输出：4->5

题解：

```java
/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode(int x) { val = x; }
 * }
 */
class Solution {
    public ListNode getKthFromEnd(ListNode head, int k) {
        ListNode cur = head, end = head;
        for (int i = 0; i < k; i++) end = end.next;
        while (end != null) {
            cur = cur.next;
            end = end.next;
        }
        return cur;
    }
}
```

tips：

- **指针**。思路与19题相同；
- 时间复杂度：O(n)
- 空间复杂度：O(1)

### 24. [反转链表](https://leetcode-cn.com/problems/fan-zhuan-lian-biao-lcof/)

定义一个函数，输入一个链表的头节点，反转该链表并输出反转后链表的头节点。0 <= 节点个数 <= 5000。  
示例：  
输入：1->2->3->4->5->NULL  
输出：5->4->3->2->1->NULL

题解：

```java
/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode(int x) { val = x; }
 * }
 */

// 递归
class Solution {
    public ListNode reverseList(ListNode head) {
        if (head == null || head.next == null) return head; // head==null用于判断当原链表长度为0时返回null，head.next==null用于判断当原链表递归到最后一个节点（递归结束条件）
        ListNode newHead = reverseList(head.next); // 用于保存反转后链表的头节点，即原链表的最后一个节点（第一次回溯时返回的值）
        head.next.next = head; // 反转
        head.next = null; // 用于当递归回溯到原链表的头节点（也即反转链表的最后一个节点）时，其next应指向null，否则其next还指向原链表的next节点，会使得反转后的链表产生循环
        return newHead;
    }
}

// 迭代
/*class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode pre = null, cur = head;
        while (cur != null) {
            ListNode next = cur.next;
            cur.next = pre;
            pre = cur;
            cur = next;
        }
        return pre;
    }
}*/
```

tips：

- **递归**。思路与206题相同；
- 时间复杂度：O(n)，迭代；O(n)，递归
- 空间复杂度：O(1)，迭代；O(n)，递归，使用栈空间，递归深度达到 n 层

### 25. [合并两个排序的链表](https://leetcode-cn.com/problems/he-bing-liang-ge-pai-xu-de-lian-biao-lcof/)

输入两个递增排序的链表，合并这两个链表并使新链表中的节点仍然是递增排序的。  
示例：  
输入：1->2->4, 1->3->4  
输出：1->1->2->3->4->4

题解：

```java
/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode(int x) { val = x; }
 * }
 */

// 递归
class Solution {
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        if (l1 == null || l2 == null) return l1 == null ? l2 : l1; // 递归结束条件
        if (l1.val < l2.val) {
            l1.next = mergeTwoLists(l1.next, l2);
            return l1;
        } else {
            l2.next = mergeTwoLists(l1, l2.next);
            return l2;
        }
    }
}

// 迭代
/*class Solution {
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        ListNode dummyHead = new ListNode();
        ListNode cur = dummyHead;
        while (l1 != null && l2 != null) {
            if (l1.val < l2.val) {
                cur.next = l1;
                l1 = l1.next;
            } else {
                cur.next = l2;
                l2 = l2.next;
            }
            cur = cur.next;
        }
        cur.next = l1 == null ? l2 : l1;
        return dummyHead.next;
    }
}*/
```

tips：

- **递归**。思路与21题相同；
- 时间复杂度：O(m+n)，递归；O(m+n)，迭代；无论递归还是迭代，执行次数都不会超过两链表长度之和
- 空间复杂度：O(m+n)，递归；O(1)，迭代

### 35. [复杂链表的复制](https://leetcode-cn.com/problems/fu-za-lian-biao-de-fu-zhi-lcof/)

请实现 copyRandomList 函数，复制一个复杂链表。在复杂链表中，每个节点除了有一个 next 指针指向下一个节点，还有一个 random 指针指向链表中的任意节点或者 null。节点数目不超过 1000 且大于等于 0。  
示例：  
输入：head = [[7,null],[13,0],[11,4],[10,2],[1,0]]  
![](/images/2021-04-14-coding-interviews/35.png)  
输出：[[7,null],[13,0],[11,4],[10,2],[1,0]]

思路：  
**指针**。由原链表节点的值构建 原节点 1 -> 新节点 1 -> 原节点 2 -> 新节点 2 -> …… 的拼接链表（新节点即为复制的链表），在访问原节点的 random 指向节点的同时找到对应复制节点的 random 指向节点：访问原节点 cur 的随机指向节点 cur.random 时，对应复制节点 cur.next 的随机指向节点为 cur.random.next 。复制链表构建完成后还需要将拼接链表进行拆分。

题解：

```java
/*
// Definition for a Node.
class Node {
    int val;
    Node next;
    Node random;

    public Node(int val) {
        this.val = val;
        this.next = null;
        this.random = null;
    }
}
*/
class Solution {
    public Node copyRandomList(Node head) {
        if (head == null) return null;
        Node cur = head; // 指向原链表中的节点
        while (cur != null) {
            Node node = new Node(cur.val); // 由原链表节点的值复制节点
            node.next = cur.next;
            cur.next = node;
            cur = cur.next.next;
        }
        cur = head;
        while (cur != null) {
            if (cur.random != null) cur.next.random = cur.random.next; // 成员变量random可能为null
            cur = cur.next.next;
        }
        Node copyHead = head.next; // 复制链表的头节点
        cur = head;
        Node copyCur = head.next; // 指向复制链表中的节点
        while (copyCur.next != null) { // 拆分两个链表：复制原链表同时，原链表需要保持不变（即原链表的成员变量next不能改变）
            cur.next = cur.next.next;
            copyCur.next = copyCur.next.next;
            cur = cur.next;
            copyCur = copyCur.next;
        }
        cur.next = null; // 将原链表的末尾节点的next置空（原来指向复制链表的末尾节点）
        return copyHead;
    }
}
```

tips：

- 时间复杂度：O(n)，遍历了三次链表
- 空间复杂度：O(1)

### 52. [两个链表的第一个公共节点](https://leetcode-cn.com/problems/liang-ge-lian-biao-de-di-yi-ge-gong-gong-jie-dian-lcof/)

输入两个链表，找出它们的第一个公共节点。如果两个链表没有交点，返回 null。在返回结果后，两个链表仍须保持原有的结构。可假定整个链表结构中没有循环。程序尽量满足 O(n) 时间复杂度，且仅用 O(1) 内存。  
示例：  
输入：intersectVal = 8, listA = [4,1,8,4,5], listB = [5,0,1,8,4,5], skipA = 2, skipB = 3  
![](/images/2021-04-14-coding-interviews/52.png)  
输出：Reference of the node with value = 8  
解释：相交节点的值为 8 （如果两个列表相交则不能为 0）。从各自的表头开始算起，链表 A 为 [4,1,8,4,5]，链表 B 为 [5,0,1,8,4,5]。在 A 中，相交节点前有 2 个节点；在 B 中，相交节点前有 3 个节点。

题解：

```java
/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode(int x) {
 *         val = x;
 *         next = null;
 *     }
 * }
 */
public class Solution {
    public ListNode getIntersectionNode(ListNode headA, ListNode headB) {
        if (headA == null || headB == null) return null; // 优化
        ListNode cur = headA, cur2 = headB;
        while (cur != cur2) {
            cur = cur == null ? headB : cur.next;
            cur2 = cur2 == null ? headA : cur2.next;
        }
        return cur;
    }
}
```

tips：

- **常规链表题目+数学**。思路与160题相同；
- 时间复杂度：O(a+b)，a和b分别为两链表的长度
- 空间复杂度：O(1)

## Ⅲ Tree 树

树相关的算法题目。

### 7. [重建二叉树](https://leetcode-cn.com/problems/zhong-jian-er-cha-shu-lcof/)

输入某二叉树的前序遍历和中序遍历的结果，请重建该二叉树。假设输入的前序遍历和中序遍历的结果中都不含重复的数字。0 <= 节点个数 <= 5000。  
示例：  
输入：preorder = [3,9,20,15,7]，inorder = [9,3,15,20,7]  
输出：

```
    3
   / \
  9  20
    /  \
   15   7
```

思路：  
**由前序中序或后序遍历构造二叉树，使用分治算法，递归，归并排序的思想**。前序遍历数组的第 1 个数一定是当前递归子二叉树的根结点，于是可以在中序遍历中找这个根结点的索引，然后将“前序遍历数组”和“中序遍历数组”分为两个部分，就分别对应当前递归子二叉树的左子树和右子树，再分别递归便可实现要求。还使用到了查找表的思路。  
![](/images/2021-04-14-coding-interviews/7.png)

题解：

```java
/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode(int x) { val = x; }
 * }
 */
class Solution {

    int[] preorder; // 前序遍历的数组
    Map<Integer, Integer> indexMap; // 用于获取中序遍历数组中某值对应的索引

    public TreeNode buildTree(int[] preorder, int[] inorder) {
        this.preorder = preorder;
        indexMap = new HashMap<>();
        for (int i = 0; i < inorder.length; i++) indexMap.put(inorder[i], i);
        return buildTree(0, preorder.length - 1, 0, inorder.length - 1);
    }

    private TreeNode buildTree(int preLeft, int preRight, int inLeft, int inRight) { // 方法的重载
        if (preLeft > preRight || inLeft > inRight) return null; // 递归结束的条件
        TreeNode root = new TreeNode(preorder[preLeft]);
        int rootIndex = indexMap.get(preorder[preLeft]); // 每次递归得到的此次根节点的值及其在中序遍历数组中的索引
        root.left =  buildTree(preLeft + 1, preLeft + rootIndex - inLeft, inLeft, rootIndex - 1);
        root.right = buildTree(preLeft + rootIndex - inLeft + 1, preRight, rootIndex + 1, inRight);
        return root;
    }
}
```

tips：

- 时间复杂度：O(n)，其中 n 是树中的节点个数
- 空间复杂度：O(n)，需要使用 O(n) 的空间存储哈希表，以及 O(h)（其中 h 是树的高度）的空间表示递归时栈空间。这里 h < n，所以总空间复杂度为 O(n)

### 26. [树的子结构](https://leetcode-cn.com/problems/shu-de-zi-jie-gou-lcof/)

输入两棵二叉树A和B，判断B是不是A的子结构(约定空树不是任意一个树的子结构)。B是A的子结构， 即 A中有出现和B相同的结构和节点值。0 <= 节点个数 <= 10000。  
示例：  
输入：A = [3,4,5,1,2], B = [4,1]

```
给定的树 A:				给定的树 B：
     3						4
    / \					   /
   4   5				  1
  / \
 1   2
```

输出：true

思路：  
**深度优先搜索**。后序遍历&前序遍历。思路与572题相似。后序遍历 isSubStructure 中用于判断 A 中是否包含 B 这个子结构。前序遍历 isSameTree2 用于判断 A 子树是否和 B 为同根节点，同时 B 是 A 的子结构。

题解：

```java
/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode(int x) { val = x; }
 * }
 */
class Solution {
    public boolean isSubStructure(TreeNode A, TreeNode B) { // 递归：后序遍历
        if (A == null || B == null) return false; // 递归边界条件（B == null 仅用于当传入的 B 为空时则一定不为子结构直接返回 false）
        return isSubStructure(A.left, B) || isSubStructure(A.right, B) || isSameTree2(A, B); // 当其中一个条件判断为 true 时就不断回溯返回 true（剪枝）
    }

    private boolean isSameTree2(TreeNode A, TreeNode B) { // 递归：前序遍历（以相同的遍历方式访问两颗子树）
        if (B == null) return true; // 因为并非要求两子树相同（要求B为A的子结构），故当前访问的 B 中的节点为null时满足要求
        if (A == null || A.val != B.val) return false; // 相同位置处的 A 中节点为 null 但 B 中节点不为 null 或者 都不为空但是值不相等时，则表示 B 不是 A 的子结构
        if (!isSameTree2(A.left, B.left)) return false; // 当前两节点的左子节点满足要求需要继续递归检查下去
        return isSameTree2(A.right, B.right); // 访问右子节点
    } // 当其中一个条件判断为 false 时就不断回溯返回 false（剪枝）
}
```

tips：

- 时间复杂度：O(∣A∣×∣B∣)，∣A∣为二叉树 A 的节点数，∣B∣为二叉树∣B∣的节点数，对于每一个二叉树 A 上的节点，都需要做一次深度优先搜索来和 B 匹配，匹配一次的时间代价是 O(∣B∣)，则总的时间代价为 O(∣A∣×∣B∣)
- 空间复杂度：O(max(AHeight, BHeight))，AHeight 为二叉树 A 的高度，BHeight 为二叉树 B 的高度，任意时刻栈空间的最大使用代价是O(max(AHeight, BHeight))

### 27. [二叉树的镜像](https://leetcode-cn.com/problems/er-cha-shu-de-jing-xiang-lcof/)

请完成一个函数，输入一个二叉树，该函数输出它的镜像。0 <= 节点个数 <= 1000。  
示例：  
输入：root = [4,2,7,1,3,6,9]

```
     4
   /   \
  2     7
 / \   / \
1   3 6   9
```

输出：[4,7,2,9,6,3,1]

```
     4
   /   \
  7     2
 / \   / \
9   6 3   1
```

思路：  
**深度优先搜索**。递归：后序遍历。后序遍历树中的所有节点，所有节点都会被访问一次，回溯的过程中翻转二叉树。  
递归模型：  
递归函数：每一层的递归中访问到的节点将其左右子树（节点）进行翻转，返回值（即应该给上一层递归返回什么值）为当前翻转左右子树（节点）后的根节点；  
递归边界条件：遍历到null节点则直接返回null节点不再自身调用方法（递归）。

题解：

```java
/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode(int x) { val = x; }
 * }
 */
class Solution {
    public TreeNode mirrorTree(TreeNode root) {
        if (root == null) return null;
        TreeNode temp = root.left; // 指针：交换当前节点的两个子节点，需要使用临时变量保存首先被重定向的待交换节点
        root.left = mirrorTree(root.right);
        root.right = mirrorTree(temp);
        return root; // 返回当前翻转左右子树（节点）后的根（当前）节点
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(h)，h为二叉树的高度

### 28. [对称的二叉树](https://leetcode-cn.com/problems/dui-cheng-de-er-cha-shu-lcof/)

请实现一个函数，用来判断一棵二叉树是不是对称的。如果一棵二叉树和它的镜像一样，那么它是对称的。0 <= 节点个数 <= 1000。  
示例：  
输入：root = [1,2,2,3,4,4,3]

```
    1
   / \
  2   2
 / \ / \
3  4 4  3
```

输出：true

思路：  
**深度优先搜索**。思路与100题相似，将需要判断的二叉树复制一份，以相反的递归方式深度遍历两颗二叉树：对于原二叉树即为前序遍历（先访问当前节点再访问左子节点和右子节点），对于复制的二叉树即为先访问当前节点再访问右子节点和左子节点。对于对称二叉树，其在结构上对称，并且对称的节点具有相同的值。递归遍历过程中当前两节点满足要求需要继续递归检查下去，只有在某一个节点不符合要求时方法不断回溯返回 false。

题解：

```java
/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode(int x) { val = x; }
 * }
 */
class Solution {
    public boolean isSymmetric(TreeNode root) {
        return check(root, root);
    }

    private boolean check(TreeNode p, TreeNode q) { // 以相反的递归方式深度遍历两颗二叉树
        if (p == null && q == null) return true;
        if (p == null || q == null) return false; // 在结构上不对称
        if (p.val != q.val) return false;
        if (!check(p.left, q.right)) return false; // 当前两镜像对称节点的一对镜像对称子节点相等（满足要求）需要继续递归检查下去
        return check(p.right, q.left); // 访问另一对镜像对称子节点
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(n)

### 32 - I. [从上到下打印二叉树](https://leetcode-cn.com/problems/cong-shang-dao-xia-da-yin-er-cha-shu-lcof/)

从上到下打印出二叉树的每个节点，同一层的节点按照从左到右的顺序打印。  
示例：  
输入：[3,9,20,null,null,15,7]

```
    3
   / \
  9  20
    /  \
   15   7
```

输出：[3,9,20,15,7]

思路：  
**广度优先搜索**。利用队列数据结构（以保持访问过的结点的顺序，以便按这个顺序来访问这些结点的邻接结点）实现。

题解：

```java
/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode(int x) { val = x; }
 * }
 */
class Solution {
    public int[] levelOrder(TreeNode root) {
        if (root == null) return new int[0];
        List<Integer> result = new ArrayList<>();
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int count = queue.size(); // 当前层级节点的个数
            while (count != 0) {
                TreeNode node = queue.poll();
                result.add(node.val);
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
                count--;
            }
        }
        int[] resultArray = new int[result.size()];
        for (int i = 0; i < result.size(); i++) resultArray[i] = result.get(i);
        return resultArray;
    }
}
```

tips：

- 时间复杂度：O(n)，每个节点进队出队各一次，渐进时间复杂度为 O(n)
- 空间复杂度：O(n)

### 32 - II. [从上到下打印二叉树 II](https://leetcode-cn.com/problems/cong-shang-dao-xia-da-yin-er-cha-shu-ii-lcof/)

从上到下按层打印二叉树，同一层的节点按从左到右的顺序打印，每一层打印到一行。  
示例：  
输入：[3,9,20,null,null,15,7]  
输出：

```
[
  [3],
  [9,20],
  [15,7]
]
```

题解：

```java
/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode(int x) { val = x; }
 * }
 */
class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int count = queue.size();
            List<Integer> level = new ArrayList<>();
            while (count != 0) {
                TreeNode node = queue.poll();
                level.add(node.val);
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
                count--;
            }
            result.add(level);
        }
        return result;
    }
}
```

tips：

- **广度优先搜索**；
- 时间复杂度：O(n)，每个节点进队出队各一次，渐进时间复杂度为 O(n)
- 空间复杂度：O(n)

### 32 - III. [从上到下打印二叉树 III](https://leetcode-cn.com/problems/cong-shang-dao-xia-da-yin-er-cha-shu-iii-lcof/)

请实现一个函数按照之字形顺序打印二叉树，即第一行按照从左到右的顺序打印，第二层按照从右到左的顺序打印，第三行再按照从左到右的顺序打印，其他行以此类推。  
示例：  
输入：[3,9,20,null,null,15,7]  
输出：

```
[
  [3],
  [20,9],
  [15,7]
]
```

思路：  
**广度优先搜索**。使用 java.util.ArrayList 类中的 void add(int index, E element) 方法，将指定的元素插入此列表中的指定位置，向右移动当前位于该位置的元素（如果有）以及所有后续元素（将其索引加 1）。调用 add(0, node.val) 以在需要从右往左遍历的层级进行倒序插入。

题解：

```java
/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode(int x) { val = x; }
 * }
 */
class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;
        boolean isReverse = false; // 当前层级是否需要逆序（需要从右往左遍历的层级），初始值为 false
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int count = queue.size();
            List<Integer> level = new ArrayList<>();
            while (count != 0) {
                TreeNode node = queue.poll();
                if (isReverse) { // 需要从右往左遍历的层级进行倒序插入
                    level.add(0, node.val);
                } else {
                    level.add(node.val);
                }
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
                count--;
            }
            result.add(level);
            isReverse = !isReverse; // 将 isReverse 取反（下一层的遍历状态不同）
        }
        return result;
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(n)

### 33. [二叉搜索树的后序遍历序列](https://leetcode-cn.com/problems/er-cha-sou-suo-shu-de-hou-xu-bian-li-xu-lie-lcof/)

输入一个整数数组，判断该数组是不是某二叉搜索树的后序遍历结果。如果是则返回 `true`，否则返回 `false`。假设输入的数组的任意两个数字都互不相同。  
示例：  
输入：[1,3,2,6,5]

```
     5
    / \
   2   6
  / \
 1   3
```

输出：true

思路：  
**由前序中序或后序遍历构造二叉树，使用分治算法，递归，归并排序的思想**。思路类似1008题。后序遍历数组的倒数第 1 个数一定是当前递归子二叉树的根节点，又因为对于二叉搜索树，其左子树的所有节点一定比根节点小，其右子树的所有节点一定比根节点大，于是可以迭代找第一个比当前根节点的值大的节点的索引（划分左右子树），然后将后序遍历数组分为两个部分，前半部分为根节点的左子树，后半部分为根节点的右子树，分别递归判断根节点的左右子树是否满足二叉搜索树的条件。  
![](/images/2021-04-14-coding-interviews/33.png)  
对于当前子树（根节点）：也需要判断其是否满足二叉搜索树，即其左子树区间 [left, mid−1] 内的所有节点都应小于 postorder[right] ，而划分左右子树的步骤已经保证左子树区间的正确性，因此只需要判断右子树区间即可；右子树区间 [mid, right−1] 内的所有节点都应大于 postorder[right] ，继续迭代寻找，当遇到小于等于 postorder[right] 的节点记录其索引为 index，当 index == right 时右子树区间正确。  
每个递归层级的返回值即为 此树是否正确 && 此树的左子树是否正确 && 此树的右子树是否正确。

题解：

```java
class Solution {
    public boolean verifyPostorder(int[] postorder) {
        return check(postorder, 0, postorder.length - 1);
    }

    private boolean check(int[] postorder, int left, int right) { // left和right为当前递归层级检查子树的后序遍历序列区间的左右索引
        if (left >= right) return true; // 等于的情况：当前子树仅有一个元素（满足要求）；也可能存在大于的情况：当前子树为空（满足要求）
        int index = left; // 用于遍历当前子树的后序遍历序列区间的索引
        while (postorder[index] < postorder[right]) index++; // 查找第一个大于根节点的元素（当前子树的根节点即postorder[right]）
        int mid = index; // 第一个大于根节点元素的索引：右子树后序遍历序列的起始
        while (postorder[index] > postorder[right]) index++; // 查找第一个小于等于根节点的元素
        return index == right && check(postorder, left, mid - 1) && check(postorder, mid, right - 1); // 当有一颗子树不为二叉搜索树返回false后将不断回溯返回false（**逻辑运算符与 && 的短路特性**）
    }
}
```

tips：

- 迭代寻找第一大于/小于根节点的元素，无需再单独设置边界条件，因为其最后一个元素即为根节点；
- 时间复杂度：O(n^2)
- 空间复杂度：O(n)

### 34. [二叉树中和为某一值的路径](https://leetcode-cn.com/problems/er-cha-shu-zhong-he-wei-mou-yi-zhi-de-lu-jing-lcof/)

输入一棵二叉树和一个整数，打印出二叉树中节点值的和为输入整数的所有路径。从树的根节点开始往下一直到叶节点所经过的节点形成一条路径。  
示例：  
输入：

```
root：							target = 22
              5
             / \
            4   8
           /   / \
          11  13  4
         /  \    / \
        7    2  5   1
```

输出：

```
[
   [5,4,11,2],
   [5,8,4,5]
]
```

思路：  
**深度优先搜索**。递归：前序遍历。定义两个成员变量来保存结果和路径节点集合，递归访问每个节点的过程中动态更新路径节点集合 cur。  
递归模型：  
递归函数：每一层的递归中访问到的节点root判断其子树是否存在从当前节点 root 到叶子节点的路径满足其路径和为 targetSum（递归过程中动态更新：是否存在从当前节点的子节点到叶子的路径，满足其路径和为 targetSum - val）；  
递归边界条件：访问到null节点则直接结束方法。

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

    private List<List<Integer>> result; // 结果集合
    private List<Integer> cur; // 二叉树前序遍历过程中路径节点的集合

    public List<List<Integer>> pathSum(TreeNode root, int target) {
        this.result = new ArrayList<>(); // 成员变量的初始化
        this.cur = new ArrayList<>();
        path(root, target);
        return result;
    }

    private void path(TreeNode root, int target) {
        if (root == null) return;
        cur.add(root.val);
        if (root.left == null && root.right == null && root.val == target) result.add(new ArrayList<Integer>(cur)); // 当前递归层级访问到叶子节点且路径满足要求：**拷贝**当前遍历路径节点集合 cur 到结果集合中（无需执行return，方法访问两null子节点后，当前层级递归方法回溯前将前序遍历路径节点集合中的此叶子节点移除）
        path(root.left, target - root.val);
        path(root.right, target - root.val);
        cur.remove(cur.size() - 1); // 回溯前：需要在遍历过程中路径节点的集合中移除当前层级访问的节点
    }
}
```

tips：

- 时间复杂度：O(n)，对每个节点都访问一次
- 空间复杂度：O(h)，h为树的高度

### 36. [二叉搜索树与双向链表](https://leetcode-cn.com/problems/er-cha-sou-suo-shu-yu-shuang-xiang-lian-biao-lcof/)

输入一棵二叉搜索树，将该二叉搜索树转换成一个排序的循环双向链表。要求不能创建任何新的节点，只能调整树中节点指针的指向。就地完成转换操作。当转化完成以后，树中节点的左指针需要指向前驱，树中节点的右指针需要指向后继。还需要返回链表中的第一个节点的指针。  
示例：  
输入：  
![](/images/2021-04-14-coding-interviews/36_1.png)  
输出：  
![](/images/2021-04-14-coding-interviews/36_2.png)  
解释：链表中的每个节点都有一个前驱和后继指针。对于双向循环链表，第一个节点的前驱是最后一个节点，最后一个节点的后继是第一个节点。“head” 表示指向链表中有最小元素的节点。

思路：  
**深度优先搜索+指针**。递归：中序遍历。定义成员变量 pre 指针使其总是指向中序遍历过程中的前一节点，拼接链表时总是执行 pre.right = cur 及 cur.left = pre 。  
**原地**拼接链表的过程中，不会破坏原二叉树中还未拼接到链表节点的结构：因为对于中序遍历，二叉树中节点的访问顺序为自底向上，拼接当前节点到链表中时仅更新了其 left 指针 cur.left = pre ，**其左子树的所有节点已拼接到链表中不会再次被访问故不影响后续节点的拼接**（其后续待拼接的节点为其右子树，其 right 指针还为原来二叉树中的指向）。

题解：

```java
/*
// Definition for a Node.
class Node {
    public int val;
    public Node left;
    public Node right;

    public Node() {}

    public Node(int _val) {
        val = _val;
    }

    public Node(int _val,Node _left,Node _right) {
        val = _val;
        left = _left;
        right = _right;
    }
};
*/
class Solution {

    private Node pre; // 中序遍历上一节点的指针
    private Node head; // 指针，指向中序遍历的第一个节点：即链表的头节点

    public Node treeToDoublyList(Node root) {
        if (root == null) return root;
        inorder(root); // 中序遍历结束后 pre 指针指向中序遍历的最后一个元素
        pre.right = head; // 使链表产生循环
        head.left = pre;
        return head;
    }

    private void inorder(Node cur) { // cur 即为当前中序遍历节点
        if (cur == null) return; // 递归边界条件
        inorder(cur.left);
        if (pre != null) {
            pre.right = cur;
        } else head = cur; // pre 指针为null则为访问到中序遍历的第一个节点：使用head指针保存头节点
        cur.left = pre;
        pre = cur; // 链表拼接完当前节点后需要将 pre 指针更新为当前遍历节点
        inorder(cur.right);
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(h)，h为二叉树的高度

### 37. [序列化二叉树](https://leetcode-cn.com/problems/xu-lie-hua-er-cha-shu-lcof/)

请实现两个函数，分别用来序列化和反序列化二叉树。  
示例：  
输入：

```
    1
   / \
  2   3
     / \
    4   5
```

输出："[1,2,3,null,null,4,5]"

思路：  
**深度优先搜索**。递归：前序遍历。使用重载方法实现序列及反序列化方法。在序列/反序列化过程中，**将中间结果存储到递归函数（方法）的参数中**。序列化二叉树过程中需要将null节点也保存在序列化字符串中，`null,null` 用于标记缺少左、右子节点（即上一节点为叶子节点）。对于序列化，遇到空子树时序列化为 null，否则继续递归序列化；对于反序列化，如果遇到元素为 null 则当前节点某一子树为空树，回溯解析当前节点的另一子树。

题解：

```java
/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode(int x) { val = x; }
 * }
 */
public class Codec {

    // Encodes a tree to a single string.
    public String serialize(TreeNode root) {
        return serialize(root, new StringBuilder()).toString();
    }

    // Decodes your encoded data to tree.
    public TreeNode deserialize(String data) {
        return deserialize(new LinkedList<String>(Arrays.asList(data.split(",")))); // 将字符串分割转换为字符串数组再将其转换为List集合
    }

    private StringBuilder serialize(TreeNode root, StringBuilder sb) { // 序列化方法的重载，使用StringBuilder加快序列化字符串的拼接：前序遍历
        if (root == null) return sb.append("null").append(","); // 递归边界条件
        sb.append(root.val).append(",");
        serialize(root.left, sb);
        serialize(root.right, sb);
        return sb;
    }

    private TreeNode deserialize(List<String> ser) { // 反序列化方法的重载，使用List便于对序列化字符串进行访问操作：前序遍历（在回溯的过程中拼接节点）
        String cur = ser.remove(0); // 当前节点的值
        if (cur.equals("null")) return null; // 递归边界条件
        TreeNode root = new TreeNode(Integer.parseInt(cur));
        root.left = deserialize(ser);
        root.right = deserialize(ser);
        return root; // **返回当前已拼接好子树的根节点**
    }
}

// Your Codec object will be instantiated and called as such:
// Codec codec = new Codec();
// codec.deserialize(codec.serialize(root));
```

tips：

- 使用 java.util.Arrays 类中的 static <T> List<T> asList(T... a) 方法，返回一个受指定数组支持的固定大小的列表（参数a - 支持列表的数组）。 返回的为参数数组的列表视图，不能直接使用，需要传入集合（列表）实现类的构造函数中创建一个当前列表视图的集合（列表）对象；
- 时间复杂度：O(n)，在序列化和反序列化函数中只访问每个节点一次
- 空间复杂度：O(n)

### 54. [二叉搜索树的第k大节点](https://leetcode-cn.com/problems/er-cha-sou-suo-shu-de-di-kda-jie-dian-lcof/)

给定一棵二叉搜索树，请找出其中第k大的节点。1 ≤ k ≤ 二叉搜索树元素个数。  
示例：  
输入：root = [5,3,6,2,4,null,null,1], k = 3

```
       5
      / \
     3   6
    / \
   2   4
  /
 1
```

输出：4

思路：  
**深度优先搜索**。思路与230题相同。对于二叉搜索树BST，中序遍历为升序，对于中序遍历的变形（先访问右子节点，再访问根节点，最后访问左子节点）则为降序，第k大的节点即为变形中序遍历第k个元素。定义成员变量 count 记录变形中序遍历访问节点的次数，result 保存结果（当 count 等于 k 时记录结果）。

题解：

```java
/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode(int x) { val = x; }
 * }
 */
class Solution {

    int count = 0; // 记录中序遍历访问节点的次数
    int result = 0;

    public int kthLargest(TreeNode root, int k) {
        if (root == null || count >= k) return result; // 剪枝（第一次回溯后 count 可能大于 k）
        kthLargest(root.right, k);
        if (++count == k) {
            result = root.val;
        } else kthLargest(root.left, k);
        return result;
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(n)

### 55 - I. [二叉树的深度](https://leetcode-cn.com/problems/er-cha-shu-de-shen-du-lcof/)

输入一棵二叉树的根节点，求该树的深度。从根节点到叶节点依次经过的节点（含根、叶节点）形成树的一条路径，最长路径的长度为树的深度。  
示例：  
输入：[3,9,20,null,null,15,7]

```
    3
   / \
  9  20
    /  \
   15   7
```

输出：3

思路：  
**深度优先搜索**。递归：后序遍历。每个节点都会被访问一次。将 null 节点也看作为一颗子二叉树（递归结束条件），在回溯的过程中累加二叉树的深度。

题解：

```java
/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode(int x) { val = x; }
 * }
 */
class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0; // 递归的边界条件
        return Math.max(maxDepth(root.left), maxDepth(root.right)) + 1;
    }
}
```

tips：

- 时间复杂度：O(n)，每个节点在递归中只被遍历一次
- 空间复杂度：O(h)，h 为二叉树的高度。递归函数需要栈空间，而栈空间取决于递归的深度，故空间复杂度等价于二叉树的高度

### 55 - II. [平衡二叉树](https://leetcode-cn.com/problems/ping-heng-er-cha-shu-lcof/)

输入一棵二叉树的根节点，判断该树是不是平衡二叉树。如果某二叉树中任意节点的左右子树的深度相差不超过1，那么它就是一棵平衡二叉树。0 <= 树的结点个数 <= 10000。  
示例：  
输入：[3,9,20,null,null,15,7]  
输出：true

思路：  
**深度优先搜索**。思路与104相同，在成员变量位置定义 boolean 变量 flag 标记是否为一平衡二叉树。递归调用计算二叉树的最大深度方法，当二叉树中某一节点的左右子树高度差大于1时则将 flag 置为 false。

题解：

```java
/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode(int x) { val = x; }
 * }
 */
class Solution {

    private boolean flag; // 是否为一高度平衡的二叉树：每个节点的左右两个子树的高度差的绝对值不超过 1

    public boolean isBalanced(TreeNode root) {
        this.flag = true; // 初始化为 true
        countHeight(root);
        return this.flag;
    }

    private int countHeight(TreeNode root) {
        if (root == null) return 0; // 递归的边界条件
        int leftHeight = countHeight(root.left);
        int rightHeight = countHeight(root.right);
        if (Math.abs(leftHeight - rightHeight) > 1) this.flag = false;
        return Math.max(leftHeight, rightHeight) + 1; // 返回左右子树高度中最大的一支作为当前节点二叉树的高度
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(h)，h 为二叉树的高度

### 68 - I. [二叉搜索树的最近公共祖先](https://leetcode-cn.com/problems/er-cha-sou-suo-shu-de-zui-jin-gong-gong-zu-xian-lcof/)

给定一个二叉搜索树, 找到该树中两个指定节点的最近公共祖先。最近公共祖先的定义为：“对于有根树 T 的两个结点 p、q，最近公共祖先表示为一个结点 x，满足 x 是 p、q 的祖先且 x 的深度尽可能大（一个节点也可以是它自己的祖先）”。所有节点的值都是唯一的。p、q 为不同节点且均存在于给定的二叉搜索树中。  
示例：  
输入：root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8ㅤ|ㅤroot = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 4  
![](/images/2021-04-14-coding-interviews/68_1.png)  
输出：6ㅤ|ㅤ2

思路：  
**常规树题目，递归，数学**。题目保证有解，当p、q两节点都小于当前节点，则递归访问左子节点；当p、q两节点都大于当前节点，则递归访问右子节点；对与第三种情况即：p、q两节点中有一节点等于当前访问（p、q两节点中有一个为公共祖先）或者p、q两节点分别大于或小于当前访问节点（当前访问节点为公共祖先）。

题解：

```java
/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode(int x) { val = x; }
 * }
 */
class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (p.val < root.val && q.val < root.val) return lowestCommonAncestor(root.left, p, q);
        if (p.val > root.val && q.val > root.val) return lowestCommonAncestor(root.right, p, q);
        return root;
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(n)

### 68 - II. [二叉树的最近公共祖先](https://leetcode-cn.com/problems/er-cha-shu-de-zui-jin-gong-gong-zu-xian-lcof/)

给定一个二叉树, 找到该树中两个指定节点的最近公共祖先。最近公共祖先的定义为：“对于有根树 T 的两个结点 p、q，最近公共祖先表示为一个结点 x，满足 x 是 p、q 的祖先且 x 的深度尽可能大（一个节点也可以是它自己的祖先）”。所有节点的值都是唯一的。p、q 为不同节点且均存在于给定的二叉树中。  
示例：  
输入：root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1ㅤ|ㅤroot = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4  
![](/images/2021-04-14-coding-interviews/68_2.png)  
输出：3ㅤ|ㅤ5

思路：  
**深度优先搜索**。递归：前序遍历。若 root 是 p,q 的 最近公共祖先则只能为以下情况：p 和 q 在 root 的子树中，且分列 root 的 异侧（即分别在左、右子树中）；p=root ，且 q 在 root 的（左或右）子树中；q=root ，且 p 在 root 的（左或右）子树中。通过递归对二叉树进行前序遍历，当遇到节点 p 或 q 时返回，自底向上回溯，当节点 p,q 在节点 root 的异侧时，节点 root 即为最近公共祖先，则向上返回 root ；当节点 p,q 在节点 root 的同侧时，节点 root 的左/右子节点中等于 p或q 的即为最近公共祖先，则向上返回此 root 的左/右子节点。对于递归函数，五种情形如代码 1) - 5) 。

题解：

```java
/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode(int x) { val = x; }
 * }
 */
class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) { // 前序遍历：深度搜索递归找到p/q节点或未找到则不断回溯返回不再深度递归当前子树
        if (root == null || root == p || root == q) return root; // 当前递归层级访问节点为null节点或者p、q节点则直接返回：无需再深度搜索访问（递归边界条件）
        TreeNode left = lowestCommonAncestor(root.left, p, q); // 访问左子节点
        TreeNode right = lowestCommonAncestor(root.right, p, q); // 访问右子节点
        if (left == null || right == null) return left == null ? right : left; // 1) 当前root节点的子树（左/右都）不包含p/q节点返回null（还未搜索到p/q）；2) 在左/右子树已找到最近公共祖先（此子树中包含p和q节点，同时另一子树的返回结果只能为null）应继续返回此结果；// 3) 特定左/右子树的根节点（root.left/root.right）为特定p/q，且另一子树未搜索到另一p/q（即另一p/q在此特定左/右子树中），返回此特定p/q（即最近公共祖先为p/q中的一个，p和q为父子关系）；4) 在左/右子树中存在p/q节点，另一p/q节点还未找到
        return root; // 5) 当前root节点的左右子树分别包括p和q节点（left != null && right != null），则此root节点即为最近公共祖先
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(n)

## Ⅳ Backtraacking 回溯

回溯相关的算法题目。

### 12. [矩阵中的路径](https://leetcode-cn.com/problems/ju-zhen-zhong-de-lu-jing-lcof/)

给定一个 m x n 二维字符网格 board 和一个字符串单词 word 。如果 word 存在于网格中，返回 true ；否则，返回 false 。单词必须按照字母顺序，通过相邻的单元格内的字母构成，其中“相邻”单元格是那些水平相邻或垂直相邻的单元格。同一个单元格内的字母不允许被重复使用。1 <= board.length <= 200，1 <= board[i].length <= 200，board 和 word 仅由大小写英文字母组成。  
示例：  
输入：board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"  
![](/images/2021-04-14-coding-interviews/12.jpg)  
输出：true

思路：  
**二维回溯问题**。回溯，深度优先搜索。使用 '\0' 标记当前已访问过的单元格，其不能再次被访问，但是回溯过程中需要再将其置为原来的值，递归深度优先搜索使用的 || 或的方式，当某一条路行不通时会一个一个的回溯寻找其他可能的路径，但是不会再走之前已经走过的路，因为之前走过的路已经返回 false ，只会去判断下一条路。

题解：

```java
class Solution {
    public boolean exist(char[][] board, String word) {
        for (int i = 0; i < board.length; i++) {
            for (int j = 0; j < board[0].length; j++) {
                if (dfs(board, word.toCharArray(), i, j, 0)) return true; // 起点可以是矩阵中的任意位置（当前起点未找到需要继续寻找下一起点的可能性）
            }
        }
        return false;
    }

    private boolean dfs(char[][] board, char[] word, int i, int j, int k) { // i 和 j 为当前递归层级访问矩阵中单元格的索引，k 为当前在单词中匹配字母的索引
        if (i < 0 || i >= board.length || j < 0 || j >= board[0].length || board[i][j] != word[k]) return false; // 当前访问单元格越界或者与下一字母不匹配（也包括当前单元格已访问过的情况）：递归边界条件
        if (k == word.length - 1) return true; // 整个 word 中的字母匹配完毕，不断回溯返回 true（由或运算 || 的短路特性）
        board[i][j] = '\0'; // 将当前匹配的单元格置为空字符，表示已访问过（从开始的时候占据了这个位置，向四个方法寻找）
        boolean isFound = dfs(board, word, i + 1, j, k + 1) || dfs(board, word, i - 1, j, k + 1) ||
                          dfs(board, word, i, j + 1, k + 1) || dfs(board, word, i, j - 1, k + 1); // 下上右左的顺序递归深度搜索下一单元格
        board[i][j] = word[k]; // 回溯前需要将已访过的单元格置为原来的值（虽然当前单元格的值与word匹配，但是其四个方向继续搜索下去不与word匹配，则需要回溯，不使用此单元格）
        return isFound;
    }
}
```

tips：

- Java 中 '\0' 表示 char 类型的 null 字符，加了 \ 表示后面的 0 是一个转义字符，要作特殊处理，0 与原来的字符 0 的含义不再一样，当编译器遇到 \0 时会自动将 \0 转化为十进制 0 存储在字符中，十进制 0 对应的 ASCII 码中的字符即为 NULL （空字符）；
- 时间复杂度：O(3^K * MN)，K为字符串word的长度，M和N为矩阵的行数和列数，最差情况下，需要遍历矩阵中长度为 K 字符串的所有方案，时间复杂度为 O(3^K)，矩阵中共有 MN 个起点，时间复杂度为 O(MN)，故时间复杂度为O(3^K * MN)
- 空间复杂度：O(K)，搜索过程中的递归深度不超过 K

### 38. [字符串的排列](https://leetcode-cn.com/problems/zi-fu-chuan-de-pai-lie-lcof/)

输入一个字符串，打印出该字符串中字符的所有排列。你可以以任意顺序返回这个字符串数组，但里面不能有重复元素。1 <= s 的长度 <= 8。  
示例：  
输入："aba"  
输出：["aab","aba","baa"]

思路：  
**一维回溯问题**。回溯，深度优先搜索。思路与47题相似。进行额外的剪枝操作，需要将字符数组 str 先进性排序，以使得剪枝操作可行：当前待拼接字符 str[i] 与上一拼接完的数字 str[i-1] 相同时进行剪枝，故需要保证上一拼接完的数字为未使用（str[i-1] 刚被回溯，即 isUsed[i-1] 为 false，表示一种排列结果中同一位置上不能出现同一数字；如果 isUsed[i-1] 为 true 则表示一种排列结果中有相邻的两位置上数字相同），同时 i 需要大于 0 以保证 nums[i-1] 有效。此题结果集使用方法参数传递的方式。

题解：

```java
class Solution {
    public String[] permutation(String s) {
        char[] str = s.toCharArray();
        Arrays.sort(str);
        boolean[] isUsed = new boolean[str.length];
        List<String> result = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        dfs(str, isUsed, cur, result);
        return result.toArray(new String[result.size()]);
    }

    private void dfs(char[] str, boolean[] isUsed, StringBuilder cur, List<String> result) {
        if (cur.length() == str.length) {
            result.add(cur.toString());
            return; 
        }
        for (int i = 0; i < str.length; i++) {
            if (isUsed[i] || i > 0 && str[i] == str[i - 1] && !isUsed[i - 1]) continue;
            isUsed[i] = true;
            dfs(str, isUsed, cur.append(str[i]), result);
            isUsed[i] = false;
            cur.deleteCharAt(cur.length() - 1);
        }
    }
}
```

tips：

- 使用 StringBuilder 对象来记录中间拼接结果，故在回溯前需要删除当前循环体在此固定位置上刚拼接完的字符，使用 java.lang.StringBuilder 类中的 StringBuilder deleteCharAt(int index) 方法，移除此序列指定位置上的 char。 返回值还为此 StringBuilder 对象；
- 使用 java.util.Arrays 类中的 static void sort(char[] a) 方法，对指定的 char 型数组按数字升序进行排序；
- 时间复杂度：O(n * n!)
- 空间复杂度：O(n)

## Ⅴ Dynamic Programming 动态规划

动态规划相关的算法题目。

将大问题划分为小问题进行解决，从而一步步获取最优解的处理算法。动态规划算法与分治算法类似，其基本思想也是将待求解问题分解成若干个子问题，先求解子问题，然后从这些子问题的解得到原问题的解。  
**与分治算法不同的是，适合于用动态规划求解的问题，经分解得到子问题往往不是互相独立的 ( 即下一个子阶段的求解是建立在上一个子阶段的解的基础上，进行进一步的求解 )**。若用分治算法来解这类问题，则分解得到的子问题数目太多，有些子问题被重复计算了很多次。如果我们能够保存已解决的子问题的答案，而在需要时再找出已求得的答案，这样就可以避免大量的重复计算，节省时间。可以用一个表来记录所有已解的子问题的答案。不管该子问题以后是否被用到，只要它被计算过，就将其结果填入表中。这就是动态规划法的基本思路。

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

### 42. [连续子数组的最大和](https://leetcode-cn.com/problems/lian-xu-zi-shu-zu-de-zui-da-he-lcof/)

输入一个整型数组，数组中的一个或连续多个整数组成一个子数组。求所有子数组的和的最大值。要求时间复杂度为O(n)。  
示例：  
输入：nums = [-2,1,-3,4,-1,2,1,-5,4]  
输出：6  
解释：连续子数组 [4,-1,2,1] 的和最大，为 6

思路：  
**动态规划**。定义动态规划数组 dp[]，dp[i] 代表以元素 nums[i] 为结尾的连续子数组最大和（最大和数组 dp[i] 中必须包含元素 nums[i]：保证 dp[i] 递推到 dp[i+1] 的正确性，如果不包含 nums[i]，递推时则不满足连续子数组要求）。转移方程（若 dp[i−1]≤0，说明 dp[i - 1] 对 dp[i] 产生负贡献，即 dp[i-1] + nums[i] 还不如 nums[i] 本身大）：当 dp[i−1]>0 时执行 dp[i] = dp[i-1] + nums[i] ，当 dp[i−1]≤0 时执行 dp[i]=nums[i]。初始状态：dp[0] = nums[0]，即以 nums[0] 结尾的连续子数组最大和为 nums[0] 。返回值：返回 dp[] 数组中的最大值即代表全局最大值（所有子数组的和的最大值）。  
由于 dp[i] 只与 dp[i-1] 和 nums[i] 有关，故可以将原数组 nums 用作 dp[] 数组，即直接在原数组 nums 上修改。

题解：

```java
class Solution {
    public int maxSubArray(int[] nums) {
        int result = nums[0];
        for (int i = 1; i < nums.length; i++) {
            nums[i] += Math.max(nums[i - 1], 0); // 以上一元素结尾的子数组最大和nums[i - 1]为正才对以当前元素结尾的子数组最大和有贡献
            result = Math.max(result, nums[i]); // 以各个元素结尾的子数组最大和的最大值即为所有子数组的和的最大值
        }
        return result;
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(1)

### 62. [圆圈中最后剩下的数字](https://leetcode-cn.com/problems/yuan-quan-zhong-zui-hou-sheng-xia-de-shu-zi-lcof/)

0,1,···,n-1这n个数字排成一个圆圈，从数字0开始，每次从这个圆圈里删除第m个数字（删除后从下一个数字开始计数）。求出这个圆圈里剩下的最后一个数字。1 <= n <= 10^5，1 <= m <= 10^6。  
示例：  
输入：n = 5, m = 3  
输出：3  
解释：0、1、2、3、4这5个数字组成一个圆圈，从数字0开始每次删除第3个数字，则删除的前4个数字依次是2、0、4、1，因此最后剩下的数字是3。

思路：  
**数据结构 / 动态规划+数学**。  
1) 使用ArrayList\<Integer>模拟单向环形链表的解法：  
对于单纯使用链表（单向环形链表的实现）的情况，时间复杂度为O(nm)，超时。使用ArrayList\<Integer>模拟单向环形链表，时间复杂度则为O(n^2)（ArrayList 类 remove 方法的时间复杂度为O(n)），**单纯使用链表（单向环形链表的实现）即暴力解法**：每次找到需删除的数字，需要 O(m) 的时间复杂度，然后删除了 n-1 次（时间复杂度为O(nm)）；而对于集合模拟链表，可以直接找到下一个要删除的位置（O(1)）：假设当前删除的位置是 index（同时为下一轮计数的起始索引），则下一个删除的数字的位置应为 index + m - 1，由于计数到末尾会从头继续计数，所以需要再对集合大小取模，即为 (index + m − 1) % n。遍历 n 次将元素添加到集合形成初始圆圈，迭代 n-1 次每轮计数结束将元素总数（集合大小）n 减一，最终集合 0 索引位置元素即为圆圈里剩下的最后一个数字。  
2) 约瑟夫（Josephu）问题的动态规划解法（过程中使用了数学推导）：  
从最终只剩一个元素的索引反推（迭代）：上一轮index = (当前index + m) mod 上一轮剩余数字的个数。  
![](/images/2021-04-14-coding-interviews/62.png)

题解：

```java
// 单向环形链表（使用ArrayList<Integer>模拟）
class Solution {
    public int lastRemaining(int n, int m) {
        List<Integer> circleList = new ArrayList<>(n);
        for (int i = 0; i < n; i++) circleList.add(i);
        int beginOrRemove = 0; // 每轮次开始计数的起始索引，因由其计算得此轮次应删除元素的索引同时又为下一轮开始计数的起始索引，故使其进行自更新（当删除元素为当前轮次的最后一个元素(索引为n-1)时，下一轮开始计数的起始索引应为0而不是n-1(下一轮数组的最大索引为n-2)，但是下一轮(数组元素个数变为n-1)使用迭代公式更新应删除元素的索引时，其对n-1取模，起始索引就会自动更新为0，故当删除元素为当前轮次的最后一个元素时下一轮开始计数的起始索引使用n-1也正确）
        while (n > 1) { // n为每轮次的元素总数（ArrayLsit集合的大小）
            beginOrRemove = (beginOrRemove + m - 1) % n;
            circleList.remove(beginOrRemove);
            n--;
        }
        return circleList.get(0);
    }
}

// 数学解法
/*class Solution {
    public int lastRemaining(int n, int m) {
        int result = 0;
        for (int i = 2; i <= n; i++) result = (result + m) % i;
        return result;
    }
}*/
```

tips：

- 时间复杂度：O(n^2)，数据结构；O(n)，动态规划+数学
- 空间复杂度：O(n)，数据结构；O(1)，动态规划+数学

### 66. [构建乘积数组](https://leetcode-cn.com/problems/gou-jian-cheng-ji-shu-zu-lcof/)

给定一个数组 A[0,1,…,n-1]，请构建一个数组 B[0,1,…,n-1]，其中 B[i] 的值是数组 A 中除了下标 i 以外的元素的积, 即 B[i]=A[0]×A[1]×…×A[i-1]×A[i+1]×…×A[n-1]。不能使用除法。  
示例：  
输入：[1,2,3,4,5]  
输出：[120,60,40,30,24]

思路：  
**动态规划**。output[i] 表示的乘积 = 当前数 i 左边的乘积 * 当前数 i 右边的乘积。使用两次循环来分别求解左边的乘积和右边的乘积。

题解：

```java
class Solution {
    public int[] constructArr(int[] a) {
        int len = a.length; // len > 1
        int[] result = new int[len];
        int l = 1, r = 1; // l为当前索引左边元素的乘积，r为当前索引右边元素的乘积
        for (int i = 0; i < len; i++) { // result[i] = nums[0,...,i-1]中元素的乘积
            result[i] = l;
            l *= a[i];
        }
        for (int i = len - 1; i >= 0; i--) { // result[i] *= nums[i+1,...,end]中元素的乘积
            result[i] *= r; // 这里为 *=
            r *= a[i];
        }
        return result;
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(1)，输出数组不被视为额外空间