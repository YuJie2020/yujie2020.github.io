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

### 15. [二进制中1的个数](https://leetcode-cn.com/problems/er-jin-zhi-zhong-1de-ge-shu-lcof/)

请实现一个函数，输入一个整数（以二进制串形式），输出该数二进制表示中 1 的个数。例如，把 9 表示成二进制是 1001，有 2 位是 1。因此，如果输入 9，则该函数输出 2。  
示例：  
输入：11111111111111111111111111111101（**有歧义，实际输入为 -3**）  
输出：31

思路：  
**常规常规数组题目，遍历，条件判断+数学（[位运算](https://yujie2020.github.io/2021-05-03-binary-digit-and-bitwise-operation.html)）**。题目输入的为带符号int范围的整数（题目有歧义，并非题目描述里的二进制串；且考虑有符号数，即不能使用遍历模2在除2的方式求每位的数），求解其补码二进制串中1的个数（当输入为负数时符号位1也需要考虑到结果中）。初始化一个用于进行位与运算的常数con=1，遍历32次（int类型的位数），每次循环体内 n & con 位与运算，每一次遍历后将con位运算左移1位（当前遍历的位为1，其他位都为0），当 n&con 不等于0则代表原数 n 当前位为1（即使原数n为负数，遍历到符号位位与运算的结果为10000000000000000000000000000000，其表示-2^31也不为0），即可求出原数二进制表示中 1 的个数。

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
**常规常规数组题目，遍历，条件判断+数学（[位运算](https://yujie2020.github.io/2021-05-03-binary-digit-and-bitwise-operation.html)）**。幂n为负数则将其转为正数并将底数x转为1/x。对于幂n考虑其二进制数，eg：当 n=18 时，其二进制数为 10010 = 2^4 + 2^1，又当 n = n1 + n2 时，有 x^n = x^(n1 + n2) = x^n1 * x^n2，故 x^18 = x^(2^4) * x^(2^1)，即对于幂的二进制数其第 i 位为 1 时，将结果result乘以 x^(2^i)， x^(2^i) 可以通过遍历存储到底数 x 中，x^(2^i) = x^2, x^4, x^6, x^8, ... （下一项总为上一项的平方，通过迭代 x *= x 实现）。遍历第一次即考虑幂n二进制的第0位，若为1则结果 resultx 乘以 x（第0位 x^(2^0) = x），将 x *= x（对下一位有效，x^(2^1)），再将n右移一位以判断下一位是否为1（**也可以除以2，但位运算的效率更高**），进行下一轮遍历考虑幂n二进制的第1位，……，当n为0时则结束遍历。  
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
**常规常规数组题目，遍历，条件判断**。判断false而不是true，多种条件满足才能判断true，但是只要有一个条件不满足就可以判断false。定义了四个flag对应四种字符，是否出现过数字：hasNum，是否出现过e：hasE，是否出现过正负号：hasSign，是否出现过点：hasDot。先处理数值字符串前的空格，index相应的后移。定义字符串索引index，遍历字符串，如果当前字符是数字：将hasNum置为true，index往后移动一直到非数字或遍历到末尾位置。如果当前字符ch是'e'或'E'：如果e已经出现过或者当前e之前没有出现过数字，返回fasle，否则令hasE = true，并且将其他3个flag全部置为false，因为要开始遍历e后面的新数字了；如果当前字符ch是+或-：如果已经出现过+或-或者已经出现过数字或者已经出现过'.'，返回flase，否则令hasSign = true；如果当前字符ch是'.'：如果已经出现过'.'或者已经出现过'e'或'E'，返回false，否则令hasDot = true；如果当前字符ch是' '：结束循环，因为可能是末尾的空格，但也可能是数值字符串中间的空格，在循环外继续处理，index不会与n相等，返回的就是false；如果当前字符ch是除了上面几种情况以外的其他字符，直接返回false。遍历结束后继续处理数值字符串后的空格，index相应的后移。如果当前索引index与字符串长度相等，说明输入字符串遍历到了末尾，但是还要满足hasNum为true才可以最终返回true，因为如果字符串里全是符号没有数字不满足题意，同时e后面没有数字也不满足题意。

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
- 空间复杂度：O(111111)

