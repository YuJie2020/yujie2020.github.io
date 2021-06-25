---
layout: post
title: 回溯-相关算法
description: 抽出LeetCode题库中回溯相关的算法题目，再以相似类型的题目进行分类归纳总结题解。
category: 技术

---

## introduction 

抽出LeetCode题库中回溯相关的算法题目，再以相似类型的题目进行分类归纳总结题解。  
并非每道题目的解法都是它的最优写法，只是在尽量保证代码执行高效性的前提下，为了归纳总结便于记忆而给定的解法，故这里每道题的题解也都只列出了一种写法。

## Ⅰ One Dimensional Problem 一维问题

对于一维回溯问题：  
**回溯算法本质上就是在一个树形问题上做深度优先遍历，因此此类问题首先需要把问题转换为树形问题**，对于树形结构的同一层级中的节点即为结果中某一特定位置（同一位置）上的可能候选节点。与此同时，也一般涉及到**剪枝**操作，以去除不必要的深度搜索。

对于排列/组合问题：
1) 排列问题：**顺序有影响**（`[2, 2, 3]` 与 `[2, 3, 2]` 视为不同列表），需要记录哪些数字已经使用过，则需要使用 `isUsed` 数组。
2) 组合问题：**顺序无影响**（ `[2, 2, 3]` 与 `[2, 3, 2]` 视为相同列表），需要按照某种顺序来进行搜索，则需要使用 `start` 变量。

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

### 46. [Permutations](https://leetcode-cn.com/problems/permutations/) 全排列

给定一个不含重复数字的数组 `nums` ，返回其 所有可能的全排列。你可以 按任意顺序 返回答案。1 <= nums.length <= 6。nums 中的所有整数 互不相同。  
示例：  
输入：nums = [1,2,3]  
输出：[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]

思路：  
将结果定义到成员变量位置，递归参数中保存中间结果，定义一与数组等长的 boolean 类型数组表示原数组某一索引位置上的数当前是否被使用。  
![](/images/2021-06-23-backtracking/46.png)  
**回溯移除元素并非是当前方法将要执行完毕的最后一步移除元素**（即执行一次回溯，移除当前方法传入参数 cur 的最后一个元素）：对于**在当前方法（当前递归层级）内**，需要在再次递归调用前将参数 cur 拼接下一有效的数字，以传入递归调用函数，在递归调用函数执行完以后，需要在当前方法内将之前拼接的数字删除即回溯（因为之前为了再次递归调用，对于当前方法中的中间结果 cur 多了一位，**需要回溯到适用于当前递归层级的状态**，以为了下一次在同一位置进行拼接数字）；故此回溯是指对于当前递归层级拼接排列的一中间结果已确定，需要再拼接下一位置的数字，拼接下一位置的数字需要使用递归调用函数的方式，同时对于下一位置数字的可能由 for 循环决定（即有多种），为了在下一次执行循环体中正常的拼接对于排列某一特定位置（同一位置）的数字，需要在当前循环体执行完之前将当前循环体开始执行时以为了下次递归调用而拼接的数字删除。这也解释了当排列拼接到满足长度要求添加排列到结果集后结束方法 return 前不需要删除 cur 中的最后一个元素。

题解：

```java
class Solution {

    private List<List<Integer>> result;
    private boolean[] isUsed; // 某一索引上的数字当前是否被使用

    public List<List<Integer>> permute(int[] nums) {
        result = new ArrayList<>();
        isUsed = new boolean[nums.length];
        dfs(nums, 0, new ArrayList<Integer>());
        return result;
    }

    private void dfs(int[] nums, int len, List<Integer> cur) { // len 表示当前排列已拼接数字的长度，cur 表示当前排列拼接的中间结果
        if (len == nums.length) {
            result.add(new ArrayList<Integer>(cur)); // 拷贝（不能使用引用的方式）
            return;
        }
        for (int i = 0; i < nums.length; i++) {
            if (!isUsed[i]) { // 拼接当前未被使用的数字
                isUsed[i] = true;
                cur.add(nums[i]);
                dfs(nums, len + 1, cur);
                isUsed[i] = false; // 回溯前需要将isUsed[i]置为false，即未使用
                cur.remove(cur.size() - 1); // 回溯前需要将当前拼接的数字从中间结果中删除（不能使用remove(nums[i])，传入参数需要是索引）
            }
        }
    }
}
```

tips：

- 时间复杂度：O(n * n!)
- 空间复杂度：O(n)

### 47. [Permutations II](https://leetcode-cn.com/problems/permutations-ii/) 全排列 II

给定一个可包含重复数字的序列 `nums` ，按任意顺序 返回所有不重复的全排列。1 <= nums.length <= 8。  
示例：  
输入：nums = [1,1,2]  
输出：

```
[[1,1,2],
 [1,2,1],
 [2,1,1]]
```

思路：  
思路与46题相似。此题需要进行额外的剪枝操作。需要将数组 nums 先进性排序，以使得剪枝操作可行：当前待拼接数字 nums[i] 与上一**拼接完**的数字 nums[i-1] 相同时进行剪枝，故需要保证上一拼接完的数字为未使用（nums[i-1] 刚被回溯，即 isUsed[i-1] 为 false，表示一种排列结果中同一位置上不能出现同一数字；如果 isUsed[i-1] 为 true 则表示一种排列结果中有相邻的两位置上数字相同），同时 i 需要大于 0 以保证 nums[i-1] 有效。  
![](/images/2021-06-23-backtracking/47.jpg)

题解：

```java
class Solution {

    private List<List<Integer>> result;
    private boolean[] isUsed; // 某一索引上的数字当前是否被使用

    public List<List<Integer>> permuteUnique(int[] nums) {
        result = new ArrayList<>();
        isUsed = new boolean[nums.length];
        Arrays.sort(nums);
        dfs(nums, 0, new ArrayList<Integer>());
        return result;
    }

    private void dfs(int[] nums, int len, List<Integer> cur) { // len 表示当前排列已拼接数字的长度，cur 表示当前排列拼接的中间结果
        if (len == nums.length) {
            result.add(new ArrayList<Integer>(cur));
            return;
        }
        for (int i = 0; i < nums.length; i++) {
            if (isUsed[i] || i > 0 && nums[i] == nums[i - 1] && !isUsed[i - 1]) continue; // 剪枝：当前待拼接数字 nums[i] 与上一**拼接完**的数字 nums[i-1] 相同时进行剪枝
            isUsed[i] = true;
            cur.add(nums[i]);
            dfs(nums, len + 1, cur);
            isUsed[i] = false;
            cur.remove(cur.size() - 1);
        }
    }
}
```

tips：

- 时间复杂度：O(n * n!)
- 空间复杂度：O(n)

### 77. [Combinations](https://leetcode-cn.com/problems/combinations/) 组合

给定两个整数 *n* 和 *k*，返回 1 ... *n* 中所有可能的 *k* 个数的组合。  
示例：  
输入：n = 4, k = 2  
输出：

```
[
  [2,4],
  [3,4],
  [2,3],
  [1,2],
  [1,3],
  [1,4],
]
```

思路：  
思路与46题相似。因为是组合的情况，故每次拼接下一个数字时只能从比上一数字大的开始（为了更便于统计哪些数字已存在于排列中）。如图对于连接上的数字，相同则代表同一递归深度。  
![](/images/2021-06-23-backtracking/77_1.png)  
剪枝：对于当前递归层级，其已拼接好的组合中间结果为 cur ，长度为 cur.size() ，**对于下一特定（同一）位置待拼接的数字**，下一待拼接数字的有效范围为 [start, end] ，start 已确定，对于任意 i ∈ [start, end] ，为了使拼接数字 i 时，包括 i 在内整个 `1 ... n` 范围内还剩余 [i, n] 个元素，其长度为 n-i+1 ，需要大于等于当前排列还剩余的空位数 k-cur.size() ，即 n-i+1 >= k-cur.size() ，故可得 i <= n - (k - cur.size()) + 1 ，end = n - (k - cur.size()) + 1 。  
![](/images/2021-06-23-backtracking/77_2.png)

题解：

```java
class Solution {

    private List<List<Integer>> result;

    public List<List<Integer>> combine(int n, int k) {
        result = new ArrayList<>();
        dfs(n, k, 1, new ArrayList<Integer>());
        return result;
    }

    private void dfs(int n, int k, int start, List<Integer> cur) { // start 为当前递归层级组合的中间结果下一待拼接数字的起始值
        if (cur.size() == k) {
            result.add(new ArrayList<Integer>(cur));
            return;
        }
        for (int i = start; i <= n - (k - cur.size()) + 1; i++) { // 剪枝：对于i的范围进行了剪枝操作
            cur.add(i);
            dfs(n, k, i + 1, cur); // 起始值应为 i+1
            cur.remove(cur.size() - 1);
        }
    }
}
```

tips：

- 时间复杂度：O( C(k, n) )
- 空间复杂度：O(k)，由递归深度决定

### 39. [Combination Sum](https://leetcode-cn.com/problems/combination-sum/) 组合总和

给定一个无重复元素的数组 candidates 和一个目标数 target ，找出 candidates 中所有可以使数字和为 target 的组合。candidates 中的数字可以无限制重复被选取。所有数字（包括 target）都是正整数。解集不能包含重复的组合。1 <= candidates.length <= 30。candidate 中的每个元素都是独一无二的。   
示例：  
输入：candidates = [2,3,6,7], target = 7  
输出：

```
[
  [7],
  [2,2,3]
]
```

思路：  
思路与77题相似。对于 candidates = [2, 3, 6, 7], target = 7，以 target = 7 为根节点，每创建一个分支的时做减法，每一个箭头表示：从父亲节点的数值减去边上的数值，得到孩子节点的数值。边的值就是 candidate 数组的每个元素的值，减到 0 或者负数的时候停止，即节点 0 和负数节点成为叶子节点，所有从根节点到节点 0 的路径（只能从上往下，没有回路）就是题目要找的一个结果。  
去重：为了使路径（结果）不产生重复，每一次搜索的时候设置下一轮搜索的起点 start：从 candidates 数组中的第几个元素开始，即**对于树形结构的同一层级**，从第二个节点开始，都不能再搜索同一层节点已经使用过的 candidate 里的元素，故**对于每个节点其下一轮搜索的起点 start 都为对于当前节点其父节点拼接了 candidate 中的哪个元素**。  
剪枝：将候选数组 candidates 先进行排序，则按顺序对候选数组中的元素进行搜索时，如果 target 减去一个数得到负数，那么减去一个更大的数依然是负数。故在当前递归层级的节点中搜索下一节点时，当得到负数就跳出循环搜索整个方法结束（对于当前节点的下一轮搜索完毕）。  
![](/images/2021-06-23-backtracking/39.png)

题解：

```java
class Solution {

    private List<List<Integer>> result;

    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        result = new ArrayList<>();
        Arrays.sort(candidates);
        dfs(candidates, target, 0, new ArrayList<Integer>());
        return result;
    }

    private void dfs(int[] candidates, int target, int start, List<Integer> cur) { // start 表示搜索范围的起始值，cur 表示中间结果
        if (target == 0) {
            result.add(new ArrayList<Integer>(cur));
            return;
        }
        for (int i = start; i < candidates.length; i++) { // 对于当前递归层级（某一个节点）：进行下一轮搜索
            if (target - candidates[i] < 0) break; // 剪枝
            cur.add(candidates[i]);
            dfs(candidates, target - candidates[i], i, cur); // 父节点拼接了i，对于此节点的搜索起始即为i
            cur.remove(cur.size() - 1);
        }
    }
}
```

tips：

- 时间复杂度：O(S)，S 为所有可行解的长度之和
- 空间复杂度：O(target)，取决于递归的栈深度，在最差情况下需要递归 target 层

### 40. [Combination Sum II](https://leetcode-cn.com/problems/combination-sum-ii/) 组合总和 II

给定一个数组 candidates 和一个目标数 target ，找出 candidates 中所有可以使数字和为 target 的组合。candidates 中的每个数字在每个组合中只能使用一次。所有数字（包括目标数）都是正整数。解集不能包含重复的组合。  
示例：  
输入：candidates = [10,1,2,7,6,1,5], target = 8  
输出：

```
[
  [1, 7],
  [1, 2, 5],
  [2, 6],
  [1, 1, 6]
]
```

思路：  
思路与39题相似。虽然为组合问题，但是也使用到了 `isUsed` 数组：对于树结构同一层级的节点（即对于组合某一特定同一位置），在中间结果（父节点）确定的前提下，此位置若为上一已尝试拼接过的相同数字，则会使得组合中出现重复结果，故使用 isUsed 数组，保证上一拼接完的数字为未使用（candidates[i-1] 刚被回溯，即 isUsed[i-1] 为 false，表示一种组合结果中同一位置上不能出现同一数字；如果 isUsed[i-1] 为 true 则表示一种排列结果中有相邻的两位置上数字相同），同时 i 需要大于 0 以保证 candidates[i-1] 有效。候选数组中的每个元素不能重复使用，故对于当前递归层级中的节点下一搜索范围的起始应为 i + 1。

题解：

```java
class Solution {

    private List<List<Integer>> result;
    private boolean[] isUsed;

    public List<List<Integer>> combinationSum2(int[] candidates, int target) {
        result = new ArrayList<>();
        isUsed = new boolean[candidates.length];
        Arrays.sort(candidates);
        dfs(candidates, target, 0, new ArrayList<Integer>());
        return result;
    }

    private void dfs(int[] candidates, int target, int start, List<Integer> cur) {
        if (target == 0) {
            result.add(new ArrayList<Integer>(cur));
            return;
        }
        for (int i = start; i < candidates.length; i++) {
            if (i > 0 && candidates[i] == candidates[i - 1] && !isUsed[i - 1]) continue;
            if (target - candidates[i] < 0) break; // 剪枝
            isUsed[i] = true;
            cur.add(candidates[i]);
            dfs(candidates, target - candidates[i], i + 1, cur);
            isUsed[i] = false;
            cur.remove(cur.size() - 1);
        }
    }
}
```

tips：

- 时间复杂度：O(S)，S 为所有可行解的长度之和
- 空间复杂度：O(target)

### 78. [Subsets](https://leetcode-cn.com/problems/subsets/) 子集

给你一个整数数组 `nums` ，数组中的元素 互不相同。返回该数组所有可能的子集（幂集）。解集 不能 包含重复的子集。你可以按任意顺序返回解集。1 <= nums.length <= 10。nums 中的所有元素 互不相同  
示例：  
输入：nums = [1,2,3]  
输出：[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]

思路：  
思路与77题相似。添加组合到结果集合中无需再附加条件判断，在 start 等于候选数组 nums 的长度时代表已搜索到所有可能组合的末尾则直接返回结束方法。

题解：

```java
class Solution {

    private List<List<Integer>> result;

    public List<List<Integer>> subsets(int[] nums) {
        result = new ArrayList<>();
        dfs(nums, 0, new ArrayList<Integer>());
        return result;
    }

    private void dfs(int[] nums, int start, List<Integer> cur) { // start 为搜索范围的其实值
        result.add(new ArrayList<Integer>(cur));
        if (start == nums.length) return; // 递归边界条件
        for (int i = start; i < nums.length; i++) {
            cur.add(nums[i]);
            dfs(nums, i + 1, cur); // 起始值应为 i+1
            cur.remove(cur.size() - 1);
        }
    }
}
```

tips：

- 时间复杂度：O(2^n)
- 空间复杂度：O(n)

## Ⅱ 2-D Problem 二维问题

对于二维回溯问题，一般为二维矩阵的深度优先搜索问题，在一条路径行不通的情况下进行回溯，寻找其他可能的路径。

### 79. [Word Search](https://leetcode-cn.com/problems/word-search/) 单词搜索

给定一个 m x n 二维字符网格 board 和一个字符串单词 word 。如果 word 存在于网格中，返回 true ；否则，返回 false 。单词必须按照字母顺序，通过相邻的单元格内的字母构成，其中“相邻”单元格是那些水平相邻或垂直相邻的单元格。同一个单元格内的字母不允许被重复使用。m == board.length。n = board[i].length。1 <= m, n <= 6。1 <= word.length <= 15。board 和 word 仅由大小写英文字母组成。  
示例：  
输入：board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"  
![](/images/2021-06-23-backtracking/79.jpg)  
输出：true

思路：  
回溯，深度优先搜索。使用 ‘\0’ 标记当前已访问过的单元格，其不能再次被访问，但是回溯过程中需要再将其置为原来的值，递归深度优先搜索使用的 || 或的方式，当某一条路行不通时会一个一个的回溯寻找其他可能的路径，但是不会再走之前已经走过的路，因为之前走过的路已经返回 false ，只会去判断下一条路。

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

- 时间复杂度：O(3^K * MN)，K为字符串word的长度，M和N为矩阵的行数和列数，最差情况下，需要遍历矩阵中长度为 K 字符串的所有方案，时间复杂度为 O(3^K)，矩阵中共有 MN 个起点，时间复杂度为 O(MN)，故时间复杂度为O(3^K * MN)
- 空间复杂度：O(K)，搜索过程中的递归深度不超过 K

### 200. [Number of Islands](https://leetcode-cn.com/problems/number-of-islands/) 岛屿数量

给你一个由 '1'（陆地）和 '0'（水）组成的的二维网格，请你计算网格中岛屿的数量。岛屿总是被水包围，并且每座岛屿只能由水平方向和/或竖直方向上相邻的陆地连接形成。此外，你可以假设该网格的四条边均被水包围。m == grid.length。n == grid[i].length。1 <= m, n <= 300。   
示例：  
输入：grid = [  
ㅤ["1","1","1","1","0"],  
ㅤ["1","1","0","1","0"],  
ㅤ["1","1","0","0","0"],  
ㅤ["0","0","0","0","0"]  
]  
输出：1

思路：  
思路类似79题。回溯，深度优先搜索。

题解：

```java
class Solution {
    public int numIslands(char[][] grid) {
        int result = 0;
        for (int i = 0; i < grid.length; i++) {
            for (int j = 0; j < grid[0].length; j++) {
                if (grid[i][j] == '1') { // 未访问过的新岛屿陆地
                    result++;
                    dfs(grid, i, j);
                }
            }
        }
        return result;
    }

    private void dfs(char[][] grid, int i, int j) {
        if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] == '0') return; // 当前访问单元格越界或者为水域（也包括当前陆地单元格已访问过的情况）：递归边界条件
        grid[i][j] = '0'; // 将当前已访问的陆地单元格置为水域即 '0'，使得深度搜索的过程中不重复访问，同时对于每轮搜索的起点已访问过的岛屿陆地应跳过
        dfs(grid, i + 1, j); // 下上右左的顺序递归深度搜索下一单元格
        dfs(grid, i - 1, j);
        dfs(grid, i, j + 1);
        dfs(grid, i, j - 1);
    }
}

/*class Solution {
	
	private boolean[][] isVisited; // 定义一与二维网格大小相同的二维数组：表示某单元格是否被访问过
	private int result;
	
	public int numIslands(char[][] grid) {
		this.isVisited = new boolean[grid.length][grid[0].length];
		this.result = 0;
		for (int i = 0; i < grid.length; i++) {
			for (int j = 0; j < grid[0].length; j++) {
				if (isVisited[i][j]) continue;
				dfs(grid, i, j);
				if (grid[i][j] == '1') result++;
			}
		}
        return result;
	}
	
	private void dfs(char[][] grid, int i, int j) {
		if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] == '0' || isVisited[i][j]) return;
		isVisited[i][j] = true;
		dfs(grid, i + 1, j);
		dfs(grid, i - 1, j);
		dfs(grid, i, j + 1);
		dfs(grid, i, j - 1);
	}
}*/
```

tips：

- 时间复杂度：O(mn)，m 和 n 分别为二维网格的行数和列数
- 空间复杂度：O(mn)，在最坏情况下，整个二维网格均为陆地，深度优先搜索的深度达到 mn

### 130. [Surrounded Regions](https://leetcode-cn.com/problems/surrounded-regions/) 被围绕的区域

给你一个 `m x n` 的矩阵 `board` ，由若干字符 `'X'` 和 `'O'` ，找到所有被 `'X'` 围绕的区域，并将这些区域里所有的 `'O'` 用 `'X'` 填充。m == board.length。n == board[i].length。1 <= m, n <= 200。  
示例：  
输入：board = [["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]  
![](/images/2021-06-23-backtracking/130.jpg)  
输出：[["X","X","X","X"],["X","X","X","X"],["X","X","X","X"],["X","O","X","X"]]  
解释：被围绕的区间不会存在于边界上，换句话说，任何边界上的 'O' 都不会被填充为 'X'。 任何不在边界上，或不与边界上的 'O' 相连的 'O' 最终都会被填充为 'X'。如果两个元素在水平或垂直方向相邻，则称它们是“相连”的。

思路：  
思路与200相似。对于题目所叙述的被 'X' 围绕的区域都填充为 'O'：即不与边界上的 'O' 相连的 'O' 最终都会被填充为 'X'。以二维矩阵 board 边界上的 'O' 为起点进行深度优先搜索将与其相连的 'O' 都置为 '\0' （空字符 null）：同时也减少了重复搜索的过程（边界上相连的 'O' 下次不用再以起点进行搜索），当以边界上的 'O' 为起点进行的深度优先搜索结束后，将所有的 'O' 替换为 'X' 即为结果，同时还需将之前替换为 '/0' 的 'O' 还原。

题解：

```java
class Solution {
    public void solve(char[][] board) {
        for (int i = 0; i < board.length; i++) {
            for (int j = 0; j < board[0].length; j++) {
                if ((i == 0 || i == board.length - 1 || j == 0 || j == board[0].length - 1) && board[i][j] == 'O') dfs(board, i, j);
            }
        }
        for (int i = 0; i < board.length; i++) {
            for (int j = 0; j < board[0].length; j++) {
                board[i][j] = board[i][j] == '\0' ? 'O' : 'X';
            }
        }
    }

    private void dfs(char[][] board, int i, int j) {
        if (i < 0 || i >= board.length || j < 0 || j >= board[0].length || board[i][j] != 'O') return; // 当访问单元格越界或者与 'O' 不同（包括遇到'X'及当前单元格已访问过并标记为'\0'的情况）：递归边界条件
        board[i][j] = '\0'; // 将与二维矩阵 board 边界上的 'O' 相连的 'O' 置为空字符 '\0'
        dfs(board, i + 1, j);
        dfs(board, i - 1, j);
        dfs(board, i, j + 1);
        dfs(board, i, j - 1);
    }
}
```

tips：

- 时间复杂度：O(mn)，m 和 n 分别为矩阵的行数和列数，深度优先搜索过程中，每一个单元格至多被标记一次
- 空间复杂度：O(mn)