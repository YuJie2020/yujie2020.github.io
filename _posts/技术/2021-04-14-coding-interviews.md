---
layout: post
title: 剑指 Offer
description: 剑指 Offer - 第 2 版
category: 技术
---

### introduction 
剑指 Offer - 第 2 版  
标星* 题目 代表使用了相关算法板块未涉及的 解法分类。

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

### 15. [二进制中1的个数](https://leetcode-cn.com/problems/er-jin-zhi-zhong-1de-ge-shu-lcof/)

请实现一个函数，输入一个整数（以二进制串形式），输出该数二进制表示中 1 的个数。例如，把 9 表示成二进制是 1001，有 2 位是 1。因此，如果输入 9，则该函数输出 2。  
示例：  
输入：11111111111111111111111111111101（**有歧义，实际输入为 -3**）  
输出：31

思路：  
**常规数组题目，遍历，条件判断+数学（[位运算](https://yujie2020.github.io/2021-05-03-binary-digit-and-bitwise-operation.html)）**。题目输入的为带符号int范围的整数（题目有歧义，并非题目描述里的二进制串；且考虑有符号数，即不能使用遍历模2在除2的方式求每位的数），求解其补码二进制串中1的个数（当输入为负数时符号位1也需要考虑到结果中）。初始化一个用于进行位与运算的常数con=1，遍历32次（int类型的位数），每次循环体内 n & con 位与运算，每一次遍历后将con位运算左移1位（当前遍历的位为1，其他位都为0），当 n&con 不等于0则代表原数 n 当前位为1（即使原数n为负数，遍历到符号位位与运算的结果为10000000000000000000000000000000，其表示-2^31也不为0），即可求出原数二进制表示中 1 的个数。

题解：

```java
class Solution {
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
}
```

tips：

- 调用库函数 java.lang.Integer类中的static int bitCount(int i) 方法，返回指定 int 值的二进制补码表示形式的 1 位的数量。当输入为负数时也满足题意；
- 时间复杂度：O(1)
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
- 使用 java.util.List<E> 类中的 <T> T[] toArray(T[] a) 方法，返回按适当顺序（从第一个元素到最后一个元素）包含列表中所有元素的数组。这里无需指定每行的大小，因为每个子区间的大小不同即二维数组的每行大小不同。对于每行均为泛型 int[]，满足参数要求；
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