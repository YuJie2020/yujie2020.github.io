---
layout: post
title: 回溯-相关算法
description: 抽出LeetCode题库中回溯相关的算法题目，再以相似类型的题目进行分类归纳总结题解。
category: 技术

---

## introduction 

抽出LeetCode题库中回溯相关的算法题目，再以相似类型的题目进行分类归纳总结题解。  
并非每道题目的解法都是它的最优写法，只是在尽量保证代码执行高效性的前提下，为了归纳总结便于记忆而给定的解法，故这里每道题的题解也都只列出了一种写法。

**回溯算法本质上就是在一个树形问题上做深度优先遍历，因此此类问题首先需要把问题转换为树形问题**。

### 17. [Letter Combinations of a Phone Number](https://leetcode-cn.com/problems/letter-combinations-of-a-phone-number/) 电话号码的字母组合

给定一个仅包含数字 2-9 的字符串，返回所有它能表示的字母组合。答案可以按 任意顺序 返回。给出数字到字母的映射如下（与电话按键相同）。注意 1 不对应任何字母。0 <= digits.length <= 4。digits[i] 是范围 ['2', '9'] 的一个数字。  
示例：  
输入：digits = "23"  
![](/images/2021-06-23-backtracking/17-title.png)  
输出：["ad","ae","af","bd","be","bf","cd","ce","cf"]

思路：  
使用回溯的思路。  
![](/images/2021-06-23-backtracking/17-answer.png)

题解：

```java
class Solution {

    String[] letterMap = new String[] {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
    List<String> result = new ArrayList<>();

    public List<String> letterCombinations(String digits) {
        if (digits.length() == 0) return result;
        findCombinations(digits, 0, "");
        return result;
    }

    private void findCombinations(String digits, int index, String cur) { // index 表示当前递归层级拼接的第几个字母，cur 用于保存中间结果
        if (index == digits.length()) { // 拼接了最后一个字母后index为digits长度减1，需要再次调用一次方法index为digits长度才添加到结果中
            result.add(cur);
            return;
        }
        String digitLetters = letterMap[digits.charAt(index) - '0'];
        for (int i = 0; i < digitLetters.length(); i++) findCombinations(digits, index + 1, cur + digitLetters.charAt(i));
    }
}
```

tips：

- 不能使用 StringBuilder 作为保存中间结果的方法参数，因为其为一个对象引用，整个方法在递归及回溯过程中为同一个 StringBuilder 对象，其中之前保存的结果会累加。而使用 String ，虽然其也为应用数据类型，但是在每次递归调用方法时传入的为一拼接字符串，故其指向了新对象（适用于当前递归层级的对象）；
- 时间复杂度：O(3^m * 4^n)，m 是输入中对应 3 个字母的数字个数，n 是输入中对应 4 个字母的数字个数，也可以表示为 O(2^N)，N为 digits 的长度
- 空间复杂度：O(N)

### 93. [Restore IP Addresses](https://leetcode-cn.com/problems/restore-ip-addresses/) 复原 IP 地址

给定一个只包含数字的字符串，用以表示一个 IP 地址，返回所有可能从 s 获得的 有效 IP 地址 。你可以按任何顺序返回答案。有效 IP 地址 正好由四个整数（每个整数位于 0 到 255 之间组成，且不能含有前导 0），整数之间用 '.' 分隔。0 <= s.length <= 3000。s 仅由数字组成。  
示例：  
输入：s = "25525511135"ㅤ|ㅤs = "010010"  
输出：["255.255.11.135","255.255.111.35"]ㅤ|ㅤ["0.10.0.10","0.100.1.0"]

思路：  
思路类似17题。对剩余字符串的长度大于需要整数的最大位数或者小于需要整数的最小位数时跳出当前循环（剪枝）。  
![](/images/2021-06-23-backtracking/93.png)

题解：

```java
class Solution {
    public List<String> restoreIpAddresses(String s) {
        List<String> result = new ArrayList<>();
        if (s.length() < 4 || s.length() > 12) return result;
        dfs(0, s, "", result);
        return result;
    }

    private void dfs(int times, String s, String ip, List<String> result) { // s 为剩余字符串，ip 为中间结果
        int len = s.length();
        if (times == 4 && len == 0) {
            result.add(ip);
            return;
        }
        for (int i = 1; i <= Math.min(3, s.charAt(0) == '0' ? 1 : len); i++) {
            String ele = s.substring(0, i);
            if (len - i > (3 - times) * 3 || len - i < 3 - times) continue; // 剪枝
            if (i == 3 && Integer.parseInt(ele) > 255) return;
            dfs(times + 1, s.substring(i), ip + (times == 0 ? "" : ".") + ele, result);
        }
    }
}
```

tips：

- 时间复杂度：O(3^4)
- 空间复杂度：O(1)