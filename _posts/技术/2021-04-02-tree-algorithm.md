---
layout: post
title: 树结构-相关算法
description: 抽出LeetCode以及牛客题库中树结构相关的算法题目，再以相似类型的题目进行分类归纳总结题解。
category: 技术
---

## introduction 
抽出LeetCode以及牛客题库中树结构相关的算法题目，再以相似类型的题目进行分类归纳总结题解。  
并非每道题目的解法都是它的最优写法，只是在尽量保证代码执行高效性的前提下，为了归纳总结便于记忆而给定的解法，故这里每道题的题解也都只列出了一种写法。

## Ⅰ Use Both Children and Return One 子节点用二返一
对于递归用函数：  

- **root must be used**
- **update ans, can use both children**
- **return value with only one child**
- **后序遍历**

时间复杂度：O(n)	n - 节点数  
空间复杂度：O(h)	h - 层数（递归调用栈可以达到 h 层的深度；最坏情况下，二叉树的高度等于二叉树中的节点个数）

### 124. [Binary Tree Maximum Path Sum](https://leetcode-cn.com/problems/binary-tree-maximum-path-sum/) 二叉树中的最大路径和

路径 被定义为一条从树中任意节点出发，沿父节点-子节点连接，达到任意节点的序列。同一个节点在一条路径序列中 至多出现一次 。该路径 至少包含一个 节点，且不一定经过根节点。  
路径和 是路径中各节点值的总和。  
给你一个二叉树的根节点 root ，返回其 最大路径和 。  
示例：  
![](/images/2021-04-02-tree-algorithm/124.jpg)  
输入：root = [-10,9,20,null,null,15,7]  
输出：42  
解释：最优路径是 15 -> 20 -> 7 ，路径和为 15 + 20 + 7 = 42

题解：

```java
class Solution {

    private int count; // 用于判断是否回溯到第一次执行的maxPathSum方法
    private int max = Integer.MIN_VALUE; // 记录maxPathSum

    public int maxPathSum(TreeNode root) {
        int temp = ++count;
        if (root == null) return 0;
        int left = Math.max(0, maxPathSum(root.left));
        int right = Math.max(0, maxPathSum(root.right));
        max =  Math.max(max, left + root.val + right);
        if (temp != 1) {
            return Math.max(left, right) + root.val; // 对于返回值，root（当前节点）一定会被使用；此返回值为使用根（当前）结点的最大路径和
        } else {
            return max;
        }
    }
}
```

tips：  
对于负数值的说明：

- 调用maxPathSum函数传入的参数为叶子节点时，且叶子节点为负数，返回值就为当前叶子节点的负数值；
- 当回溯到原来的调用位置时，就会与0进行比较，从而舍弃此条左/右边路（代表不选左/右节点）；
- 更新max值时就不一定是历史最大值与左+当前节点+右的值比较了，会舍弃负数值，变为历史最大值与当前节点或者左+当前节点或当前节点+右比较。

### 687. [Longest Univalue Path](https://leetcode-cn.com/problems/longest-univalue-path/) 最长同值路径

给定一个二叉树，找到最长的路径，这个路径中的每个节点具有相同值。 这条路径可以经过也可以不经过根节点。  
注意：两个节点之间的路径长度由它们之间的边数表示。  
示例：  
输入：

                  1
                 / \
                4   5
               / \   \
              4   4   5

输出：2

题解：

```java
class Solution {

    private int max; // 记录longestUnivaluePath

    public int longestUnivaluePath(TreeNode root) {
        if (root == null) return 0; // 最初根节点为null直接返回0，无需继续进行判断
        univaluePath(root);
        return max;
    }

    private int univaluePath(TreeNode root) {
        if (root == null) return 0;
        int left = univaluePath(root.left);
        int right = univaluePath(root.right);
        int tempLeft = 0;
        int tempRight = 0;
        if (root.left != null && root.val == root.left.val) tempLeft = ++left;
        if (root.right != null && root.val == root.right.val) tempRight = ++right;
        max = Math.max(max, tempLeft + tempRight);
        return Math.max(tempLeft, tempRight);
    }
}
```

### 543. [Diameter of Binary Tree](https://leetcode-cn.com/problems/diameter-of-binary-tree/) 二叉树的直径

给定一棵二叉树，你需要计算它的直径长度。一棵二叉树的直径长度是任意两个结点路径长度中的最大值。这条路径可能穿过也可能不穿过根结点。  
注意：两结点之间的路径长度是以它们之间边的数目表示。  
示例：  
输入：

              1
             / \
            2   3
           / \     
          4   5    

输出：3  
解释：它的长度是路径 [4,2,1,3] 或者 [5,2,1,3]。

题解：

```java
class Solution {

    private int max; // 记录diameterOfBinaryTree

    public int diameterOfBinaryTree(TreeNode root) {
        if (root == null) return 0;
        getDiameter(root);
        return max;
    }

    private int getDiameter(TreeNode root) {
        if (root == null) return 0;
        int left = getDiameter(root.left);
        int right = getDiameter(root.right);
        int leftTemp = 0;
        int rightTemp = 0;
        if (root.left != null) leftTemp = ++left;
        if (root.right != null) rightTemp = ++right;
        max = Math.max(max, leftTemp + rightTemp);
        return Math.max(leftTemp, rightTemp);
    }
}
```

## Ⅱ Construct Binary Tree from Preorder Inorder or Postorder Traversal 由前序中序或后序遍历构造二叉树

使用**分治算法，递归，归并排序**的思想：将一个复杂的问题分成两个或更多的相同或相似的子问题，再把子问题分成更小的子问题……，直到最后子问题可以简单的直接求解，原问题的解即子问题的解的合并（分而治之）。分治算法在每一层递归上都有三个步骤：分解，将原问题分解为若干个规模较小，相互独立，与原问题形式相同的子问题；解决，若子问题规模较小而容易被解决则直接解决，否则递归地解各个子问题；合并，将各个子问题的解合并为原问题的解。

时间复杂度：O(n)，其中 n 是树中的节点个数。  
空间复杂度：O(n)，需要使用 O(n) 的空间存储哈希表，以及 O(h)（其中 h 是树的高度）的空间表示递归时栈空间。这里 h < n，所以总空间复杂度为 O(n)。

### 105. [Construct Binary Tree from Preorder and Inorder Traversal](https://leetcode-cn.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/) 从前序与中序遍历序列构造二叉树

根据一棵树的前序遍历与中序遍历构造二叉树，可以假设树中没有重复的元素。  
示例：  
输入：preorder = [3,9,20,15,7]；inorder = [9,3,15,20,7]  
输出：

```
    3
   / \
  9  20
    /  \
   15   7
```

思路：  
前序遍历数组的第 1 个数一定是当前递归子二叉树的根结点，于是可以在中序遍历中找这个根结点的索引，然后将“前序遍历数组”和“中序遍历数组”分为两个部分，就分别对应当前递归子二叉树的左子树和右子树，再分别递归便可实现要求。还使用到了查找表的思路。  
![](/images/2021-04-02-tree-algorithm/105.png)

题解：

```java
class Solution {

    private int[] preorder; // 前序遍历的数组
    private Map<Integer,Integer> hashMap; // 用于获取中序遍历数组中某值对应的索引

    public TreeNode buildTree(int[] preorder, int[] inorder) {
        this.preorder = preorder;
        this.hashMap = new HashMap<>();
        for (int i = 0; i < inorder.length; i++) {
            hashMap.put(inorder[i], i);
        }
        return buildTree(0, preorder.length - 1, 0, hashMap.size() - 1);
    }

    private TreeNode buildTree(int preLeft, int preRight, int inLeft, int inRight) {
        if (preLeft > preRight || inLeft > inRight) return null; // 递归结束的条件
        int pivot = preorder[preLeft]; // 每次递归得到的此次根节点的值
        int pivotIndex = hashMap.get(pivot);
        TreeNode root = new TreeNode(pivot);
        root.left = buildTree(preLeft + 1, preLeft + pivotIndex - inLeft, inLeft, pivotIndex - 1);
        root.right = buildTree(preLeft + pivotIndex - inLeft + 1, preRight, pivotIndex + 1, inRight);
        return root;
    }
}
```

### 106. [Construct Binary Tree from Inorder and Postorder Traversal](https://leetcode-cn.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/) 从中序与后序遍历序列构造二叉树

根据一棵树的中序遍历与后序遍历构造二叉树，可以假设树中没有重复的元素。  
示例：  
输入：inorder = [9,3,15,20,7]；postorder = [9,15,7,20,3]    
输出：

```
    3
   / \
  9  20
    /  \
   15   7
```

思路：  
后序遍历数组的最后一个数一定是当前递归子二叉树的根结点，于是可以在中序遍历中找这个根结点的索引，然后将“前序遍历数组”和“中序遍历数组”分为两个部分，就分别对应当前递归子二叉树的左子树和右子树，再分别递归便可实现要求。还使用到了查找表的思路。  
![](/images/2021-04-02-tree-algorithm/106.jpg)

题解：

```java
class Solution {

    private int postorder[]; // 后续遍历的数组
    private Map<Integer, Integer> hashMap; // 用于获取中序遍历数组中某值对应的索引

    public TreeNode buildTree(int[] inorder, int[] postorder) {
        this.postorder = postorder;
        this.hashMap = new HashMap<>();
        for(int i = 0; i < inorder.length; i++) {
            hashMap.put(inorder[i], i);
        }
        return buildTree(0, postorder.length - 1, 0, hashMap.size() - 1);
    }

    public TreeNode buildTree(int postLeft, int postRight, int inLeft, int inRight) {
        if (postLeft > postRight || inLeft > inRight) return null; // 递归结束的条件
        int pivot = postorder[postRight]; // 每次递归得到的此次根节点的值
        int pivotIndex = hashMap.get(pivot);
        TreeNode root = new TreeNode(pivot);
        root.left = buildTree(postLeft, postLeft + pivotIndex - inLeft - 1, inLeft, pivotIndex - 1);
        root.right = buildTree(postLeft + pivotIndex - inLeft, postRight -1, pivotIndex + 1, inRight);
        return root;
    }
}
```

### 889. [Construct Binary Tree from Preorder and Postorder Traversal](https://leetcode-cn.com/problems/construct-binary-tree-from-preorder-and-postorder-traversal/) 根据前序和后序遍历构造二叉树

返回与给定的前序和后序遍历匹配的任何二叉树，可以假设树中没有重复的元素。  
示例：  
输入：pre = [1,2,4,5,3,6,7]；post = [4,5,2,6,7,3,1]  
输出：[1,2,3,4,5,6,7]

思路：  
前序遍历数组的第 1 个数和后序遍历数组的最后一个数一定是当前递归子二叉树的根结点，前序遍历数组的第 2 个数一定是当前递归子树根节点的左子节点，于是可以在后序遍历中找这个左子节点的索引，然后将“前序遍历数组”和“后序遍历数组”分为两个部分，就分别对应当前递归子二叉树的左子树和右子树，再分别递归便可实现要求。还使用到了查找表的思路。  
![](/images/2021-04-02-tree-algorithm/889.png)

题解：

```java
class Solution {

    private int preorder[]; // 前序遍历的数组
    private Map<Integer, Integer> hashMap; // 用于获取后序遍历数组中某值对应的索引

    public TreeNode constructFromPrePost(int[] pre, int[] post) {
        this.preorder = pre;
        this.hashMap = new HashMap<>();
        for (int i = 0; i < post.length; i++) {
            hashMap.put(post[i], i);
        }
        return constructFromPrePost(0, preorder.length - 1, 0, hashMap.size() - 1);
    }

    private TreeNode constructFromPrePost(int preLeft, int preRight, int postLeft, int postRight) {
        if (preLeft > preRight || postLeft > postRight) return null; // 左子节点或右子节点为空
        TreeNode root = new TreeNode(preorder[preLeft]); // 以每次递归得到的此次根节点的值创建当前子树的根节点
        if (preLeft == preRight || postLeft == postRight) { // 递归结束的条件
            root.left = null;
            root.right = null;
            return root;
        }
        int left = preorder[preLeft + 1]; // 每次递归得到的此次根节点的左子节点的值
        int leftIndex = hashMap.get(left); // 此次根节点的左子节点的值在后序遍历数组中的索引
        root.left = constructFromPrePost(preLeft + 1, preLeft + leftIndex - postLeft + 1, postLeft, leftIndex);
        root.right = constructFromPrePost(preLeft + leftIndex - postLeft + 2, preRight, leftIndex + 1, postRight - 1);
        return root;
    }
}
```

### 1008. [Construct Binary Search Tree from Preorder Traversal](https://leetcode-cn.com/problems/construct-binary-search-tree-from-preorder-traversal/) 前序遍历构造二叉搜索树

返回与给定前序遍历 preorder 相匹配的二叉搜索树的根结点。  
示例：  
输入：[8,5,1,7,10,12]  
输出：  
![](/images/2021-04-02-tree-algorithm/1008-title.png)

思路：  
前序遍历数组的第 1 个数一定是当前递归子二叉树的根结点，又因为对于二叉搜索树，其左子树的所有节点一定比根节点小，其右子树的所有节点一定比根节点大，于是可以迭代找第一个比当前根节点的值大的节点的索引，然后将“前序遍历数组分为两个部分，就分别对应当前递归子二叉树的左子树和右子树，再分别递归便可实现要求。  
![](/images/2021-04-02-tree-algorithm/1008-answer.jpg)

题解：

```java
class Solution {

    private int[] preorder; // 前序遍历的数组

    public TreeNode bstFromPreorder(int[] preorder) {
        this.preorder = preorder;
        return bstFromPreorder(0, preorder.length - 1);
    }

    private TreeNode bstFromPreorder(int start, int end) {
        if (start > end) return null; // 递归结束的条件
        TreeNode root = new TreeNode(preorder[start]);
        int div = start + 1; // 记录用于分隔当前递归子二叉树的左右子树的索引
        while (div <= end && preorder[div] < root.val) div++; // 用于分隔当前递归子二叉树的左右子树的索引不能超过当前递归子二叉树的范围end
        root.left = bstFromPreorder(start + 1, div - 1);
        root.right = bstFromPreorder(div, end);
        return root;
    }
}
```

tips：

- 时间复杂度：O(n^2)，因为递归用函数中有迭代的while循环
- 空间复杂度：O(n)

### 108. [Convert Sorted Array to Binary Search Tree](https://leetcode-cn.com/problems/convert-sorted-array-to-binary-search-tree/) 将有序数组转换为二叉搜索树

给你一个整数数组 nums ，其中元素已经按 升序 排列，请你将其转换为一棵 高度平衡 二叉搜索树。高度平衡 二叉树是一棵满足「每个节点的左右两个子树的高度差的绝对值不超过 1 」的二叉树。1 <= nums.length <= 10^4。nums 按 严格递增 顺序排列。  
示例：  
输入：nums = [-10,-3,0,5,9]  
输出：[0,-10,5,null,-3,null,9]  
![](/images/2021-04-02-tree-algorithm/108-title.jpg)

思路：  
分治算法，递归，归并排序的思路。高度平衡二叉树即平衡二叉树也叫平衡二叉搜索树（AVL树：保证查询效率较高），平衡二叉树的常用实现方法有红黑树、AVL、替罪羊树、Treap、伸展树等。  
![](/images/2021-04-02-tree-algorithm/108-answer.png)

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
    public TreeNode sortedArrayToBST(int[] nums) {
        return construct(nums, 0, nums.length - 1);
    }

    private TreeNode construct(int[] nums, int left, int right) {
        if (left > right) return null;
        int mid = left + (right - left) / 2;
        TreeNode root = new TreeNode(nums[mid]);
        root.left = construct(nums, left, mid - 1);
        root.right = construct(nums, mid + 1, right);
        return root;
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(logn)，递归栈的深度为O(logn)

## Ⅲ Depth First Search (Preorder Inorder or Postorder Traversal) 深度优先搜索（前序中序或后序遍历）

本质上为二叉树的前序、中序或后序遍历的相关题目。  
**对于树，深度优先搜索（DFS）即为树的 前序/中序/后续 遍历；广度优先搜索（BFS）即为树的 层序遍历（逐层从上到下扫描整棵树）**。

**深度优先搜索一般都使用递归的方式**。

递归是一个反复调用自身的过程，这就说明它每一级/层的功能都是一样的，**因此只需要关注一级/层递归的解决过程即可**。**递归不要进入到递归中看其执行流程（压栈与返回值），而是利用明确的定义来实现算法逻辑**。

递归：由递归模型建模，**递归模型由递归函数与递归边界条件（递归结束条件）组成**。递归函数则由在这一层的递归中应该完成什么任务和返回值（即应该给上一层递归返回什么值）组成；边界条件即不再调用递归函数而直接返回某值所需的条件。

使用递归的二叉树树题目。一般递归函数（方法）的参数都为一个二叉树中的节点，只需将关注点落在对于当前递归层级的参数节点需要实现什么功能，递归边界条件一般都为访问到null节点，故一般在方法回溯的过程（**对于二叉树为自底向上**）中不断累加中间计算结果，对于每一层级的递归函数（方法）只需关注对于当前层级遍历到的节点其子树的中间计算结果是什么。

### 144. [Binary Tree Preorder Traversal](https://leetcode-cn.com/problems/binary-tree-preorder-traversal/) 二叉树的前序遍历

给你二叉树的根节点 `root` ，返回它节点值的 前序 遍历。树中节点数目在范围 [0, 100] 内。通过迭代算法完成。  
示例：  
输入：root = [1,null,2,3]  
![](/images/2021-04-02-tree-algorithm/144.jpg)  
输出：[1,2,3]

思路：  
前序遍历：先输出父节点，再遍历左子树和右子树。  
迭代：模拟递归的过程。定义一个节点的特定操作类，对于任何一个节点的访问和输出操作都要定义到此类中，并且对于访问操作需要再定义三个相关操作对象按前序遍历的逆序存入栈中：每次从栈中弹出一个操作对象，进行节点的输出或者访问（模拟递归方法的调用）。  
递归：将返回结果定义到成员变量位置，对于递归方法，先输出节点信息，之后访问其左节点，再访问其右节点。递归边界条件为遇到叶子节点则只执行输出（左右子节点都为空）。

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

// 迭代
class Solution {
    public List<Integer> preorderTraversal(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        if (root == null) return result; // 二叉树的根节点为 null 则直接返回
        Stack<Command> stack = new Stack<>();
        stack.push(new Command(false, root));
        while (!stack.empty()) {
            Command command = stack.pop();
            if (command.task) { // 输出节点的信息
                result.add(command.node.val);
            } else { // 访问节点
                if (command.node.right != null) stack.push(new Command(false, command.node.right));
                if (command.node.left != null) stack.push(new Command(false, command.node.left));
                stack.push(new Command(true, command.node));
            }
        }
        return result;
    }
}

class Command { // 对于一个节点的特定操作类
    boolean task; // 指令属性：true 代表输出（保存）节点的信息，false 代表访问节点
    TreeNode node; // 作用节点属性：指令作用的节点
    Command(boolean task, TreeNode node) {
        this.task = task;
        this.node = node;
    }
}

// 递归
/*class Solution {

    List<Integer> result = new ArrayList<>(); // 成员变量

    public List<Integer> preorderTraversal(TreeNode root) {
        if (root != null) { // 避免二叉树的根节点为 null
            result.add(root.val);
            if (root.left != null) preorderTraversal(root.left);
            if (root.right != null) preorderTraversal(root.right);
        }
        return result;
    }
}*/
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(n)

### 94. [Binary Tree Inorder Traversal](https://leetcode-cn.com/problems/binary-tree-inorder-traversal/) 二叉树的中序遍历

给定一个二叉树的根节点 root ，返回它的 中序 遍历。树中节点数目在范围 [0, 100] 内。通过迭代算法完成。  
示例：  
输入：root = [1,null,2,3]  
输出：[1,3,2]

思路：  
中序遍历：先遍历左子树，再输出父节点，再遍历右子树。  
迭代：模拟递归的过程。定义一个节点的特定操作类，对于任何一个节点的访问和输出操作都要定义到此类中，并且对于访问操作需要再定义三个相关操作对象按中序遍历的逆序存入栈中：每次从栈中弹出一个操作对象，进行节点的输出或者访问（模拟递归方法的调用）。  
递归：将返回结果定义到成员变量位置，对于递归方法，先访问其左节点，之后输出节点信息，再访问其右节点。递归边界条件为遇到叶子节点则只执行输出（左右子节点都为空）。

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

// 迭代
class Solution {
    public List<Integer> inorderTraversal(TreeNode  root) {
        List<Integer> result = new ArrayList<>();
        if (root == null) return result; // 二叉树的根节点为 null 则直接返回
        Stack<Command> stack = new Stack<>();
        stack.push(new Command(false, root));
        while (!stack.empty()) {
            Command command = stack.pop();
            if (command.task) { // 输出节点的信息
                result.add(command.node.val);
            } else { // 访问节点
                if (command.node.right != null) stack.push(new Command(false, command.node.right));
                stack.push(new Command(true, command.node));
                if (command.node.left != null) stack.push(new Command(false, command.node.left));
            }
        }
        return result;
    }
}

class Command { // 对于一个节点的特定操作类
    boolean task; // 指令属性：true 代表输出（保存）节点属性，false 代表访问节点
    TreeNode node; // 作用节点属性：指令作用的节点
    Command(boolean task, TreeNode node) {
        this.task = task;
        this.node = node;
    }
}

// 递归
/*class Solution {

    List<Integer> result = new ArrayList<>(); // 成员变量

    public List<Integer> inorderTraversal(TreeNode root) {
        if (root != null) { // 避免二叉树的根节点为 null
            if (root.left != null) inorderTraversal(root.left);
            result.add(root.val);
            if (root.right != null) inorderTraversal(root.right);
        }
        return result;
    }
}*/
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(n)

### 145. [Binary Tree Postorder Traversal](https://leetcode-cn.com/problems/binary-tree-postorder-traversal/) 二叉树的后序遍历

给定一个二叉树，返回它的 后序 遍历。树中节点数目在范围 [0, 100] 内。通过迭代算法完成。  
示例：  
输入：root = [1,null,2,3]  
输出：[3,2,1]

思路：  
后序遍历：先遍历左子树，再遍历右子树，最后输出父节点。  
迭代：模拟递归的过程。定义一个节点的特定操作类，对于任何一个节点的访问和输出操作都要定义到此类中，并且对于访问操作需要再定义三个相关操作对象按后序遍历的逆序存入栈中：每次从栈中弹出一个操作对象，进行节点的输出或者访问（模拟递归方法的调用）。  
递归：将返回结果定义到成员变量位置，对于递归方法，先访问其左节点，之后访问其右节点，再输出节点信息。递归边界条件为遇到叶子节点则只执行输出（左右子节点都为空）。

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

// 迭代
class Solution {
    public List<Integer> postorderTraversal(TreeNode  root) {
        List<Integer> result = new ArrayList<>();
        if (root == null) return result; // 二叉树的根节点为 null 则直接返回
        Stack<Command> stack = new Stack<>();
        stack.push(new Command(false, root));
        while (!stack.empty()) {
            Command command = stack.pop();
            if (command.task) { // 输出节点的信息
                result.add(command.node.val);
            } else { // 访问节点
                stack.push(new Command(true, command.node));
                if (command.node.right != null) stack.push(new Command(false, command.node.right));
                if (command.node.left != null) stack.push(new Command(false, command.node.left));
            }
        }
        return result;
    }
}

class Command { // 对于一个节点的特性操作类
    boolean task; // 指令属性：true 代表输出（保存）节点信息，false 代表访问节点
    TreeNode node; // 作用节点属性：指令作用的节点
    Command(boolean task, TreeNode node) {
        this.task = task;
        this.node = node;
    }
}

// 递归
/*class Solution {

    List<Integer> result = new ArrayList<>(); // 成员变量

    public List<Integer> postorderTraversal(TreeNode root) {
        if (root != null) { // 避免二叉树的根节点为 null
            if (root.left != null) postorderTraversal(root.left);
            if (root.right != null) postorderTraversal(root.right);
            result.add(root.val);
        }
        return result;
    }
}*/
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(n)

### 98. [Validate Binary Search Tree](https://leetcode-cn.com/problems/validate-binary-search-tree/) 验证二叉搜索树

给定一个二叉树，判断其是否是一个有效的二叉搜索树。一个二叉搜索树具有如下特征：节点的左子树只包含小于当前节点的数；节点的右子树只包含大于当前节点的数；所有左子树和右子树自身必须也是二叉搜索树。  
示例：  
输入：[5,1,4,null,null,3,6]

```
    5
   / \
  1   4
     / \
    3   6
```

输出：false

思路：  
递归：中序遍历。对于二叉搜索树BST，中序遍历为升序。定义成员变量 pre 保存中序遍历的上一节点，在中序遍历的过程中进行比较，当当前遍历节点的值小于中序遍历上一节点的值时返回 false（对于整个程序，为 ture 即满足中序遍历的顺序时则继续判断，而一旦 为 false 即有一个节点不满足中序遍历的要求时则整个程序不断回溯返回 false）。  
迭代：中序遍历。对于整个程序，为 ture 即满足中序遍历的顺序时则继续判断，而一旦为 false 即有一个节点不满足中序遍历的要求时则返回 false 。

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

// 递归：中序遍历
class Solution {

    TreeNode pre = null; // 中序遍历的上一节点

    public boolean isValidBST(TreeNode root) {
        if (root == null) return true; // 左子节点或右子节点为空，应返回 true
        if (!isValidBST(root.left)) return false; // 不能直接使用 return isValidBST(root.left) 语句，因为在左节点满足要求时还需继续执行对当前节点是否满足要求的判断（左节点不满足要求就无需继续判断，整个程序不断回溯返回 false）
        if (pre != null && root.val <= pre.val) return false; // 关键判断（pre != null ：对于中序遍历第一个节点则跳过判断直接赋值；同理不能直接使用 return root.val > pre.val 语句，因为在当前节点满足要求时还需继续执行对其右子节点是否满足要求的判断；如果当前节点不满足要求则无需继续判断，整个程序不断回溯返回 false）
        pre = root; // 满足要求更新 pre 节点
        return isValidBST(root.right);
    }
}

// 迭代：中序遍历
/*class Solution {
    public boolean isValidBST(TreeNode root) {
        TreeNode pre = null;
        Stack<Command> stack = new Stack<>();
        stack.push(new Command(false, root));
        while (!stack.empty()) {
            Command command = stack.pop();
            if (command.task) {
                if (pre != null && command.node.val <= pre.val) return false; // 满足要求则还需继续判断（程序继续执行）
                pre = command.node;
            } else {
                if (command.node.right != null) stack.push(new Command(false, command.node.right));
                stack.push(new Command(true, command.node));
                if (command.node.left != null) stack.push(new Command(false, command.node.left));
            }
        }
        return true;
    }
}

class Command {
    boolean task;
    TreeNode node;
    Command(boolean task, TreeNode node) {
        this.task = task;
        this.node = node;
    }
}*/
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(n)

### 226. [Invert Binary Tree](https://leetcode-cn.com/problems/invert-binary-tree/) 翻转二叉树

翻转一棵二叉树。  
示例：  
输入：

```
     4
   /   \
  2     7
 / \   / \
1   3 6   9		
```

输出：

```
     4
   /   \
  7     2
 / \   / \
9   6 3   1
```

思路：  
递归：后序遍历。后序遍历树中的所有节点，所有节点都会被访问一次，回溯的过程中翻转二叉树。  
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
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return root; // 递归边界条件
        TreeNode temp = root.right; // 指针：交换当前节点的两个子节点，需要使用临时变量保存首先被重定向的待交换节点
        root.right = invertTree(root.left); // 当前节点的右子树（节点）指向其原来的左子树（节点）
        root.left = invertTree(temp); // 当前节点的左子树（节点）指向其原来的右子树（节点）
        return root; // 返回当前翻转左右子树（节点）后的根（当前）节点
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(h)，h为二叉树的高度

### 104. [Maximum Depth of Binary Tree](https://leetcode-cn.com/problems/maximum-depth-of-binary-tree/) 二叉树的最大深度

给定一个二叉树，找出其最大深度。二叉树的深度为根节点到最远叶子节点的最长路径上的节点数。叶子节点是指没有子节点的节点。  
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
递归：后序遍历。每个节点都会被访问一次。将 null 节点也看作为一颗子二叉树（递归结束条件），在回溯的过程中累加二叉树的深度。

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
    public int maxDepth(TreeNode root) {
        if (root == null) return 0; // 递归的边界条件
        return Math.max(maxDepth(root.left), maxDepth(root.right)) + 1;
    }
}
```

tips：

- 时间复杂度：O(n)，每个节点在递归中只被遍历一次
- 空间复杂度：O(h)，h 为二叉树的高度。递归函数需要栈空间，而栈空间取决于递归的深度，故空间复杂度等价于二叉树的高度

### 110. [Balanced Binary Tree](https://leetcode-cn.com/problems/balanced-binary-tree/) 平衡二叉树

给定一个二叉树，判断它是否是高度平衡的二叉树。本题中一棵高度平衡二叉树定义为：一个二叉树每个节点 的左右两个子树的高度差的绝对值不超过 1 。树中的节点数在范围 [0, 5000] 内。  
示例：  
输入：root = [1,2,2,3,3,null,null,4,4]  
![](/images/2021-04-02-tree-algorithm/110.jpg)  
输出：false

思路：  
思路与104相同，在成员变量位置定义 boolean 变量 flag 标记是否为一平衡二叉树。递归调用计算二叉树的最大深度方法，当二叉树中某一节点的左右子树高度差大于1时则将 flag 置为false。

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

    private boolean flag; // 是否为一高度平衡的二叉树：每个节点的左右两个子树的高度差的绝对值不超过 1

    public boolean isBalanced(TreeNode root) {
        this.flag = true; // 初始值为true
        countHeight(root);
        return this.flag;
    }

    private int countHeight(TreeNode root) { // 计算某一节点左右子树的高度
        if (root == null) return 0; // 递归的边界条件
        int leftHeight = countHeight(root.left);
        int rightHeight = countHeight(root.right);
        if (Math.abs(leftHeight - rightHeight) > 1) flag = false; // 当存在一个节点的左右子树高度高度差大于1则置为false
        return Math.max(leftHeight, rightHeight) + 1; // 返回左右子树高度中最大的一支作为当前节点二叉树的高度
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(h)，h 为二叉树的高度

### 100. [Same Tree](https://leetcode-cn.com/problems/same-tree/) 相同的树

给你两棵二叉树的根节点 `p` 和 `q` ，编写一个函数来检验这两棵树是否相同。如果两个树在结构上相同，并且节点具有相同的值，则认为它们是相同的。两棵树上的节点数目都在范围 [0, 100] 内。  
示例：  
输入：p = [1,2], q = [1,null,2]  
输出：false

思路：  
递归：前序遍历。思路与98题相似，以同样的递归方式深度（前序）遍历两颗二叉树，递归遍历过程中当前两节点满足要求需要继续递归检查下去，**只有在某一个节点不符合要求时方法不断回溯返回 false**。

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
    public boolean isSameTree(TreeNode p, TreeNode q) { // 以同样的递归方式深度（前序）遍历两颗二叉树
        if (p == null && q == null) return true; // 当前遍历的两节点都为空：符合要求
        if (p == null || q == null) return false; // 当前遍历的两节点其中一个节点为空另一个不为空：两颗二叉树不同（两颗二叉树p和q的结构就不同）
        if (p.val != q.val) return false; // 当前遍历的两节点值不相等：两颗二叉树不同
        if (!isSameTree(p.left, q.left)) return false; // 当前两节点的左子节点相等（满足要求）需要继续递归检查下去
        return isSameTree(p.right, q.right); // 访问右子节点
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(n)

### 572. [Subtree of Another Tree](https://leetcode-cn.com/problems/subtree-of-another-tree/) 另一个树的子树

给定两个非空二叉树 s 和 t，检验 s 中是否包含和 t 具有相同结构和节点值的子树。s 的一个子树包括 s 的一个节点和这个节点的所有子孙。s 也可以看做它自身的一棵子树。  
示例：  
输入：

```
给定的树 s：			给定的树 t：
     3					 4
    / \					/ \
   4   5			   1   2
  / \					
 1   2					
```

输出：true  
解释： t 与 s 的一个子树拥有相同的结构和节点值

思路：  
递归：后序遍历&前序遍历。前序遍历用于判断 root 中的某一子树是否和 subRoot 相同，思路与100题相同。后序遍历中用于判断 root 中是否包含和 subRoot 具有相同结构和节点值的子树。

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
    public boolean isSubtree(TreeNode root, TreeNode subRoot) { // 递归：后序遍历
        if (root == null) return false; // 递归边界条件
        return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot) || isSameTree(root, subRoot); // 当其中一个条件判断为true时就不断回溯返回true
    }

    private boolean isSameTree(TreeNode p, TreeNode q) { // 检验两棵树是否相同：前序遍历
        if (p == null && q == null) return true; // 当前遍历的两节点都为空：符合要求
        if (p == null || q == null) return false; // 两颗二叉树p和q的结构就不同
        if (p.val != q.val) return false; // 当前遍历的两节点值不相等：两颗二叉树不同
        if (!isSameTree(p.left, q.left)) return false; // 当前两节点的左子节点相等（满足要求）需要继续递归检查下去
        return isSameTree(p.right, q.right); // 访问右子节点
    }
}
```

tips：

- 时间复杂度：O(∣root∣×∣subRoot∣)，∣root∣为二叉树 root 的节点数，∣subRoot∣为二叉树∣subRoot∣的节点数，对于每一个二叉树 root 上的节点，都需要做一次深度优先搜索来和 subRoot 匹配，匹配一次的时间代价是 O(∣subRoot∣)，则总的时间代价为 O(∣root∣×∣subRoot∣)
- 空间复杂度：O(max(rootHeight,subRootHeight))，rootHeight为二叉树root的高度，subRootHeight为二叉树subRoot的高度，任意时刻栈空间的最大使用代价是O(max(rootHeight,subRootHeight))

### 101. [Symmetric Tree](https://leetcode-cn.com/problems/symmetric-tree/) 对称二叉树

给定一个二叉树，检查它是否是镜像对称的。运用递归和迭代两种方法解决这个问题。  
示例：  
输入：[1,2,2,3,4,4,3]

```
    1
   / \
  2   2
 / \ / \
3  4 4  3
```

输出：true

思路：  
1) 深度优先遍历：递归。思路与100题相似，**将需要判断的二叉树复制一份，以相反的递归方式深度遍历两颗二叉树**：对于原二叉树即为前序遍历（先访问当前节点再访问左子节点和右子节点），对于复制的二叉树即为先访问当前节点再访问右子节点和左子节点。对于对称二叉树，**其在结构上对称**，并且对称的节点具有相同的值。递归遍历过程中当前两节点满足要求需要继续递归检查下去，**只有在某一个节点不符合要求时方法不断回溯返回 false**。  
2) 广度优先遍历：迭代。层序遍历。

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

// 深度优先遍历：递归
class Solution {
    public boolean isSymmetric(TreeNode root) {
        return check(root, root);
    }

    private boolean check(TreeNode p, TreeNode q) { // 以相反的递归方式深度遍历两颗二叉树
        if (p == null && q == null) return true; // 当前遍历的两镜像对称节点都为空：符合要求
        if (p == null || q == null) return false; // 当前遍历的两镜像对称节点其中一个节点为空另一个不为空：两颗二叉树不对称
        if (p.val != q.val) return false; // 当前遍历的两镜像对称节点值不相等：两颗二叉树不对称
        if (!check(p.left, q.right)) return false; // 当前两镜像对称节点的一对镜像对称子节点相等（满足要求）需要继续递归检查下去
        return check(p.right, q.left); // 访问另一对镜像对称子节点
    }
}

// 广度优先遍历：迭代
/*class Solution {
    public boolean isSymmetric(TreeNode root) { // 按层级遍历，对于相同层级中的节点：访问顺序总是成对访问相同层级中的两结构对称的节点
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root); // 因为总是成对的访问同层级中的对称节点，故初始条件下需要添加两次根节点
        queue.offer(root);
        while (!queue.isEmpty()) { // 成对的访问同层级中的结构对称节点
            TreeNode p = queue.poll(); // 同层级中一对镜像对称节点之一
            TreeNode q = queue.poll(); // 同层级中一对镜像对称节点之一
            if (p == null && q == null) continue; // 都为 null 则符合条件（对称）跳出此次循环
            if (p == null || q == null || p.val != q.val) return false; // 当同层级中一对镜像对称节点其中一个为 null 另一个不为 null 时或者此两节点的值不相等：两颗二叉树不对称，直接返回 false
            queue.offer(p.left); // 成对的添加下一层级中的结构对称节点
            queue.offer(q.right);
            queue.offer(p.right);
            queue.offer(q.left);
        }
        return true;
    }
}*/
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(n)

### 530. [Minimum Absolute Difference in BST](https://leetcode-cn.com/problems/minimum-absolute-difference-in-bst/) 二叉搜索树的最小绝对差

给你一棵所有节点为非负值的二叉搜索树，请你计算树中任意两节点的差的绝对值的最小值。树中至少有 2 个节点。  
示例：  
输入：

```
   1
    \
     3
    /
   2
```

输出：1  
解释：最小绝对差为 1，其中 2 和 1 的差的绝对值为 1（或者 2 和 3）

思路：  
递归：中序遍历。对于二叉搜索树BST，中序遍历为升序。定义成员变量 pre 保存中序遍历的上一节点，以及 min 保存二叉搜索树中序遍历相邻两节点值的差，在中序遍历的过程中更新最小的树中任意两节点的差。

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

    TreeNode pre; // 中序遍历的上一节点
    int min = Integer.MAX_VALUE; // 记录二叉搜索树中序遍历（为升序）相邻两节点值的差

    public int getMinimumDifference(TreeNode root) {
        if (root != null) {
            if (root.left != null) getMinimumDifference(root.left);
            if (pre != null) min = Math.min(min, root.val - pre.val);
            pre = root;
            if (root.right != null) getMinimumDifference(root.right);
        }
        return min;
    }
}
```

tips：

- 思路与98题相似；
- 时间复杂度：O(n)，n 为二叉搜索树节点的个数。每个节点在中序遍历中都会被访问一次且只会被访问一次
- 空间复杂度：O(n)，递归函数的空间复杂度取决于递归的栈深度，而**栈深度在二叉搜索树为一条链的情况下会达到 O(n) 级别**

### 230. [Kth Smallest Element in a BST](https://leetcode-cn.com/problems/kth-smallest-element-in-a-bst/) 二叉搜索树中第K小的元素

给定一个二叉搜索树的根节点 `root` ，和一个整数 `k` ，请你设计一个算法查找其中第 `k` 个最小元素（从 1 开始计数）。树中的节点数为 n 。1 <= k <= n <= 10^4。  
示例：  
输入：root = [5,3,6,2,4,null,null,1], k = 3  
![](/images/2021-04-02-tree-algorithm/230.jpg)  
输出：3

思路：  
递归：中序遍历。对于二叉搜索树BST，中序遍历为升序，第k小的元素即为中序遍历第k个元素。定义成员变量 count 记录中序遍历访问节点的次数，result 保存结果（当 count 等于 k 时记录结果）。

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

    int count = 0; // 记录中序遍历访问节点的次数
    int result = 0;

    public int kthSmallest(TreeNode root, int k) {
        if (root == null || count >= k) return result; // 剪枝（第一次回溯后 count 可能大于 k）
        kthSmallest(root.left, k);
        if (++count == k) {
            result = root.val;
        } else kthSmallest(root.right, k);
        return result;
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(n)

### 173. [Binary Search Tree Iterator](https://leetcode-cn.com/problems/binary-search-tree-iterator/) 二叉搜索树迭代器

实现一个二叉搜索树迭代器类 BSTIterator ，表示一个按中序遍历二叉搜索树（BST）的迭代器： BSTIterator(TreeNode root) 初始化 BSTIterator 类的一个对象。BST 的根节点 root 会作为构造函数的一部分给出。指针应初始化为一个不存在于 BST 中的数字，且该数字小于 BST 中的任何元素；boolean hasNext() 如果向指针右侧遍历存在数字，则返回 true，否则返回 false ；int next() 将指针向右移动，然后返回指针处的数字。指针初始化为一个不存在于 BST 中的数字，所以对 next() 的首次调用将返回 BST 中的最小元素。你可以假设 next() 调用总是有效的，也就是说，当调用 next() 时，BST 的中序遍历中至少存在一个下一个数字。next() 和 hasNext() 操作均摊时间复杂度为 O(1) ，并使用 O(h) 内存。其中 h 是树的高度。  
示例：  
输入：["BSTIterator", "next", "next", "hasNext", "next", "hasNext", "next", "hasNext", "next", "hasNext"]  
[[[7, 3, 15, null, null, 9, 20]], [], [], [], [], [], [], [], [], []]  
![](/images/2021-04-02-tree-algorithm/173.png)  
输出：[null, 3, 7, true, 9, true, 15, true, 20, false]

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
class BSTIterator {

    private List<Integer> iter;
    private int order;

    public BSTIterator(TreeNode root) {
        this.iter = new ArrayList<>();
        this.order = 0;
        inorderTraversal(root);
    }
    
    public int next() {
        return iter.get(order++);
    }
    
    public boolean hasNext() {
        return order < iter.size();
    }

    private void inorderTraversal(TreeNode root) {
        if (root == null) return;
        inorderTraversal(root.left);
        iter.add(root.val);
        inorderTraversal(root.right);
    }
}

/**
 * Your BSTIterator object will be instantiated and called as such:
 * BSTIterator obj = new BSTIterator(root);
 * int param_1 = obj.next();
 * boolean param_2 = obj.hasNext();
 */
```

tips：

- 递归：中序遍历；
- 时间复杂度：O(1)，初始化需要 O(n) 的时间，随后每次调用只需要 O(1) 的时间
- 空间复杂度：O(n)，保存中序遍历的全部结果

## Ⅳ Broad First Search (Level Order Traversal) 广度优先搜索（层序遍历）

本质上为二叉树的层序遍历的相关题目。  
**对于树，深度优先搜索（DFS）即为树的 前序/中序/后续 遍历；广度优先搜索（BFS）即为树的 层序遍历（逐层从上到下扫描整棵树）**。

**广度优先搜索一般都借助队列数据结构并使用迭代的方式**。

### 102. [Binary Tree Level Order Traversal](https://leetcode-cn.com/problems/binary-tree-level-order-traversal/) 二叉树的层序遍历

给你一个二叉树，请你返回其按 层序遍历 得到的节点值。（即逐层地，从左到右访问所有节点）  
示例：  
输入：[3,9,20,null,null,15,7]

```
    3
   / \
  9  20
    /  \
   15   7
```

输出：

```
[
  [3],
  [9,20],
  [15,7]
]
```

思路：  
广度优先遍历，利用队列数据结构（以保持访问过的结点的顺序，以便按这个顺序来访问这些结点的邻接结点）实现。

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
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int count = queue.size(); // 当前层级的节点个数
            List<Integer> level = new ArrayList<>();
            while (count != 0) {
                TreeNode node = queue.poll();
                level.add(node.val);
                if (node.left != null) queue.offer(node.left); // 添加当前层级节点的邻接节点
                if (node.right != null) queue.offer(node.right); // 添加当前层级节点的邻接节点
                count--;
            }
            result.add(level);
        }
        return result;
    }
}
```

tips：

- 时间复杂度：O(n)，每个节点进队出队各一次，渐进时间复杂度为 O(n)
- 空间复杂度：O(n)

### 107. [Binary Tree Level Order Traversal II](https://leetcode-cn.com/problems/binary-tree-level-order-traversal-ii/) 二叉树的层序遍历 II

给定一个二叉树，返回其节点值自底向上的层序遍历。 （即按从叶子节点所在层到根节点所在的层，逐层从左向右遍历）  
示例：  
输入：[3,9,20,null,null,15,7]

```
    3
   / \
  9  20
    /  \
   15   7
```

输出：

```
[
  [15,7],
  [9,20],
  [3]
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
    public List<List<Integer>> levelOrderBottom(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int count = queue.size(); // 当前层级的节点个数
            List<Integer> level = new ArrayList<>();
            while (count != 0) {
                TreeNode node = queue.poll();
                level.add(node.val);
                if (node.left != null) queue.offer(node.left); // 添加当前层级节点的邻接节点
                if (node.right != null) queue.offer(node.right); // 添加当前层级节点的邻接节点
                count--;
            }
            result.add(0, level); // 总是将当前层级所有节点值的列表插入结果集合的头部
        }
        return result;
    }
}
```

tips：

- 思路与102题相同；
- 使用 java.util.ArrayList<E> 类中的  void add(int index, E element) 方法，将指定的元素插入此列表中的指定位置，向右移动当前位于该位置的元素（如果有）以及所有后续元素（将其索引加 1）。调用 add(0, level) 以进行倒序插入；
- 时间复杂度：O(n)
- 空间复杂度：O(n)

### 103. [Binary Tree Zigzag Level Order Traversal](https://leetcode-cn.com/problems/binary-tree-zigzag-level-order-traversal/) 二叉树的锯齿形层序遍历

给定一个二叉树，返回其节点值的锯齿形层序遍历。（即先从左往右，再从右往左进行下一层遍历，以此类推，层与层之间交替进行）  
示例：  
输入：[3,9,20,null,null,15,7]

```
    3
   / \
  9  20
    /  \
   15   7
```

输出：

```
[
  [3],
  [20,9],
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
    public List<List<Integer>> zigzagLevelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        boolean isReverse = false; // 当前层级是否需要逆序（需要从右往左遍历的层级），初始值为 false
        while (!queue.isEmpty()) {
            int count = queue.size(); // 当前层级的节点个数
            List<Integer> level = new ArrayList();
            while (count != 0) {
                TreeNode node = queue.poll();
                if (isReverse) { // 需要从右往左遍历的层级进行倒序插入
                    level.add(0, node.val);
                } else level.add(node.val);
                if (node.left != null) queue.offer(node.left); // 添加当前层级节点的邻接节点（总是按照从左往右的顺序添加）
                if (node.right != null) queue.offer(node.right); // 添加当前层级节点的邻接节点（总是按照从左往右的顺序添加）
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

- 思路与102题相同；
- 使用 java.util.ArrayList<E> 类中的  void add(int index, E element) 方法，将指定的元素插入此列表中的指定位置，向右移动当前位于该位置的元素（如果有）以及所有后续元素（将其索引加 1）。调用 add(0, node.val) 以在需要从右往左遍历的层级进行倒序插入；
- 时间复杂度：O(n)
- 空间复杂度：O(n)

### 637. [Average of Levels in Binary Tree](https://leetcode-cn.com/problems/average-of-levels-in-binary-tree/) 二叉树的层平均值

给定一个非空二叉树, 返回一个由每层节点平均值组成的数组。节点值的范围在32位有符号整数范围内。  
示例：  
输入：

```
    3
   / \
  9  20
    /  \
   15   7
```

输出：[3, 14.5, 11]

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
    public List<Double> averageOfLevels(TreeNode root) {
        List<Double> result = new ArrayList<>();
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            double levelSum = 0; // 当前层级所有节点的和（变量类型定义为 double）
            int size = queue.size(); // 当前层级的节点个数
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                levelSum += node.val;
                if (node.left != null) queue.offer(node.left); // 添加当前层级节点的邻接节点
                if (node.right != null) queue.offer(node.right); // 添加当前层级节点的邻接节点
            }
            result.add(levelSum / size);
        }
        return result;
    }
}
```

tips：

- 思路与102题相似；
- 时间复杂度：O(n)
- 空间复杂度：O(n)

### 111. [Minimum Depth of Binary Tree](https://leetcode-cn.com/problems/minimum-depth-of-binary-tree/) 二叉树的最小深度

给定一个二叉树，找出其最小深度。最小深度是从根节点到最近叶子节点的最短路径上的节点数量。叶子节点是指没有子节点的节点。树中节点数的范围在 [0, 105] 内。  
示例：  
输入：root = [3,9,20,null,null,15,7]ㅤ|ㅤroot = [2,null,3,null,4,null,5,null,6]  
![](/images/2021-04-02-tree-algorithm/111.jpg)  
输出：2ㅤ|ㅤ5

思路：  
1) 广度优先遍历：思路与102题相似。定义局部变量result记录当前层序遍历的深度，当遍历到叶子节点时则返回结果。  
2) 深度优先遍历：后序遍历（递归）。思路与104题相似，递归过程中计算以当前节点为根节点的子树的最小深度时：**当其左右某一子树为空时则应返回其中不为空子树的最小高度**（左右子树都为空时，返回的即为0+1，符合叶子节点的情形）。

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

// 广度优先遍历
class Solution {
    public int minDepth(TreeNode root) {
        if (root == null) return 0;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        int result = 1; // 二叉树的最小深度，初始值为1（深度的定义为从根节点到最近叶子节点的最短路径上的节点数量，根节点包括在路径的节点内）
        while (!queue.isEmpty()) {
            int count = queue.size(); // 当前层级的节点个数
            while (count != 0) {
                TreeNode node = queue.poll();
                if (node.left == null && node.right == null) return result; // 当前层级存在一节点为叶子节点，则返回当前的层级（二叉树的层级从1开始计数）
                if (node.left != null) queue.offer(node.left); // 添加当前层级**非叶子节点**的邻接节点
                if (node.right != null) queue.offer(node.right); // 添加当前层级**非叶子节点**的邻接节点
                count--;
            }
            result++; // 二叉树的层级加一：进行下一层的检索（是否有叶子节点）
        }
        return result;
    }
}

// 深度优先遍历：后序遍历
/*class Solution {
    public int minDepth(TreeNode root) {
        if (root == null) return 0; // 递归的边界条件
        int leftHeight = minDepth(root.left);
        int rightHeight = minDepth(root.right);
        if (leftHeight == 0) return rightHeight + 1; // 当前root节点的左子节点为空，则返回右子树的最小高度（右子节点可能为空）
        if (rightHeight == 0) return leftHeight + 1; // 当前root节点的右子节点为空，则返回左子树的最小高度（左子节点可能为空）
        return Math.min(leftHeight, rightHeight) + 1; // 左右子节点都不为空时，返回高度较小子树的高度
    }
}*/
```

tips：

- 时间复杂度：O(n)，每个节点在递归中只被遍历一次，但是所有节点都会被访问一次，深度优先遍历；每个节点最多进队出队各一次，但是并非所有节点都会被访问，遍历到第一个叶子节点方法提前结束，广度优先遍历
- 空间复杂度：O(h)，h 为二叉树的高度，深度优先遍历；O(n)，方法可以提前结束，广度优先遍历

### 429. [N-ary Tree Level Order Traversal](https://leetcode-cn.com/problems/n-ary-tree-level-order-traversal/) N 叉树的层序遍历

给定一个 N 叉树，返回其节点值的层序遍历。（即从左到右，逐层遍历）。树的序列化输入是用层序遍历，每组子节点都由 null 值分隔。树的节点总数在 [0, 10^4] 之间。  
示例：  
输入：root = [1,null,2,3,4,5,null,null,6,7,null,8,null,9,10,null,null,11,null,12,null,13,null,null,14]  
![](/images/2021-04-02-tree-algorithm/429.png)  
输出：[[1],[2,3,4,5],[6,7,8,9,10],[11,12,13],[14]]

题解：

```java
/*
// Definition for a Node.
class Node {
    public int val;
    public List<Node> children;

    public Node() {}

    public Node(int _val) {
        val = _val;
    }

    public Node(int _val, List<Node> _children) {
        val = _val;
        children = _children;
    }
};
*/

class Solution {
    public List<List<Integer>> levelOrder(Node root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;
        Queue<Node> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int count = queue.size(); // 当前层级的节点个数
            List<Integer> level = new ArrayList<>();
            while (count != 0) {
                Node node = queue.poll();
                level.add(node.val);
                if (node.children != null) queue.addAll(node.children); // 添加当前层级节点的邻接节点
                count--;
            }
            result.add(level);
        }
        return result;
    }
}
```

tips：

- 思路与102题相似；
- 使用 java.util.Queue<E> extends Collection<E> 类中的 boolean addAll(Collection<? extends E> c) 方法，将指定 collection 中的所有元素都添加到此 collection 中；
- 时间复杂度：O(n)
- 空间复杂度：O(n)

### 199. [Binary Tree Right Side View](https://leetcode-cn.com/problems/binary-tree-right-side-view/) 二叉树的右视图

给定一棵二叉树，想象自己站在它的右侧，按照从顶部到底部的顺序，返回从右侧所能看到的节点值。  
示例：  
输入：[1,2,3,null,5,null,4]

```
   1            <---
 /   \
2     3         <---
 \     \
  5     4       <---
```

输出：[1, 3, 4]

思路：  
1) 深度优先搜索：递归（前序遍历的变种：先输出父节点，再遍历右子树和左子树）。思路与144题递归方式相似。  
2) 广度优先搜索：思路与102题相似，同时使用到了指针。

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

// 深度优先搜索（DFS）
class Solution {

    List<Integer> result = new ArrayList<>(); // 成员变量

    public List<Integer> rightSideView(TreeNode root) {
        dfs(root, 0);
        return result;
    }

    private void dfs(TreeNode root, int level) { // 参数 level 为二叉树的层数，从 0 开始（**回溯以及递归过程中，对于参数 root 节点总是在二叉树的 level 层**）
        if (root != null) {
            if (result.size() == level) result.add(root.val); // 当 result.size() == level 成立时：第一次访问到 level 层的节点（回溯过程中，前者将大于后者），故只有第一次访问到某层级的节点（此层第一次访问到的节点也即此层最右侧的节点）才添加到结果中
            dfs(root.right, level + 1); // 右子节点的访问优先级高于左子节点
            dfs(root.left, level + 1);
        }
    } // 所有二叉树中的节点都会被遍历（访问）一次：最终方法会回溯到最终第一次调用处（即访问头节点处）
}

// 广度优先搜索（BFS）
/*class Solution {
    public List<Integer> rightSideView(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        if (root == null) return result;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int count = queue.size(); // 当前层级的节点个数
            TreeNode node = null; // 节点指针
            while (count != 0) {
                node = queue.poll();
                if (node.left != null) queue.offer(node.left); // 添加当前层级节点的邻接节点
                if (node.right != null) queue.offer(node.right); // 添加当前层级节点的邻接节点
                count--;
            } // 退出循环后 node 指针指向当前层级的最后一个节点（即从右侧能看到的节点）
            result.add(node.val);
        }
        return result;
    }
}*/
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(n)

### 116. [Populating Next Right Pointers in Each Node](https://leetcode-cn.com/problems/populating-next-right-pointers-in-each-node/) 填充每个节点的下一个右侧节点指针

给定一个 完美二叉树 ，其所有叶子节点都在同一层，每个父节点都有两个子节点。二叉树定义如下：  
struct Node {  
ㅤint val;  
ㅤNode *left;  
ㅤNode *right;  
ㅤNode *next;  
}  
填充它的每个 next 指针，让这个指针指向其下一个右侧节点。如果找不到下一个右侧节点，则将 next 指针设置为 NULL。初始状态下，所有 next 指针都被设置为 NULL。只能使用常量级额外空间。使用递归解题也符合要求，本题中递归程序占用的栈空间不算做额外的空间复杂度。树中节点的数量少于 4096。  
示例：  
输入：root = [1,2,3,4,5,6,7]  
![](/images/2021-04-02-tree-algorithm/116.png)  
输出：[1,#,2,3,#,4,5,6,7,#]  
解释：序列化的输出按层序遍历排列，同一层节点由 next 指针连接，'#' 标志着每一层的结束。

思路：  
1) 深度优先搜索：递归（前序遍历）。满二叉树（完美二叉树）：所有叶子节点都在同一层，每个父节点都有两个子节点。利用上一层级已建立的 next 指针建立下一层级的 next 指针。  
2) 广度优先搜索：思路与102题相似，同时使用到了指针。

题解：

```java
/*
// Definition for a Node.
class Node {
    public int val;
    public Node left;
    public Node right;
    public Node next;

    public Node() {}
    
    public Node(int _val) {
        val = _val;
    }

    public Node(int _val, Node _left, Node _right, Node _next) {
        val = _val;
        left = _left;
        right = _right;
        next = _next;
    }
};
*/

// 深度优先遍历：前序遍历
class Solution {
    public Node connect(Node root) {
        if (root == null || root.left == null) return root; // 递归到最后一层无需建立下一层级的 next 指针则直接退出方法
        root.left.next = root.right; // 连接当前节点的左子节点与右子节点
        if (root.next != null) root.right.next = root.next.left; // 利用当前root节点的 next 成员变量（即利用上一层级已建立的 next 指针）连接其右子节点与同层级的下一节点（层序遍历的下一节点）：**连接此层的节点时，root节点与其next节点相对上一层级为前一层级某节点的左子节点与右子节点**
        connect(root.left);
        connect(root.right);
        return root; // 在递归的过程中，返回值并未被使用，其作用仅为方法回溯到第一次调用方法（访问根节点）时返回原二叉树的根节点
    }
}

// 广度优先遍历
/*class Solution {
    public Node connect(Node root) {
        if (root == null) return root;
        Queue<Node> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int count = queue.size();
            Node pre = null, cur = null; // 指针
            while (count != 0) {
                cur = queue.poll();
                if (pre != null) pre.next = cur;
                if (cur.left != null) queue.offer(cur.left);
                if (cur.right != null) queue.offer(cur.right);
                pre = cur;
                count--;
            }
        }
        return root;
    }
}*/
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(n)

### 117. [Populating Next Right Pointers in Each Node II](https://leetcode-cn.com/problems/populating-next-right-pointers-in-each-node-ii/) 填充每个节点的下一个右侧节点指针 II

给定一个二叉树  
struct Node {  
ㅤint val;  
ㅤNode *left;  
ㅤNode *right;  
ㅤNode *next;  
}  
填充它的每个 next 指针，让这个指针指向其下一个右侧节点。如果找不到下一个右侧节点，则将 next 指针设置为 NULL。初始状态下，所有 next 指针都被设置为 NULL。只能使用常量级额外空间。使用递归解题也符合要求，本题中递归程序占用的栈空间不算做额外的空间复杂度。树中的节点数小于 6000。  
示例：  
输入：root = [1,2,3,4,5,null,7]  
![](/images/2021-04-02-tree-algorithm/117.png)  
输出：[1,#,2,3,#,4,5,7,#]  
解释：序列化输出按层序遍历顺序（由 next 指针连接），'#' 表示每层的末尾。

思路：  
1) 深度优先搜索：递归（前序遍历的变种：先输出父节点，再遍历右子树和左子树）。利用上一层级已建立的 next 指针建立下一层级的 next 指针。  
2) 广度优先搜索：思路与102题相似，同时使用到了指针。

题解：

```java
/*
// Definition for a Node.
class Node {
    public int val;
    public Node left;
    public Node right;
    public Node next;

    public Node() {}
    
    public Node(int _val) {
        val = _val;
    }

    public Node(int _val, Node _left, Node _right, Node _next) {
        val = _val;
        left = _left;
        right = _right;
        next = _next;
    }
};
*/

// 深度优先遍历
class Solution {
    public Node connect(Node root) { // 拼接当前节点子节点 next 指针的方法
        if (root == null) return root; // 当前节点为空则无需拼接其子节点的 next 指针
        if (root.left != null && root.right != null) root.left.next = root.right; // 左右子节点都不为空：先拼接左子节点的 next 指针
        if (root.left != null && root.right == null) root.left.next = searchNext(root.next); // 左子节点不为空右子节点为空：寻找下一 next 指针（查找当前节点的 next 指针的左右子节点，即利用上一层级已建立的 next 指针）
        if (root.right != null) root.right.next = searchNext(root.next); // 右子节点不为空（无论左子节点是否为空）：左子节点不为空则前面已拼接当前右子节点，右子节点还需要再拼接其 next 指针
        connect(root.right); // 需要优先访问右子节点：在给当前节点左右子节点的 next 指针赋值时，需要当前节点的所有 next 连接都是完备的
        connect(root.left);
        return root;
    }

    private Node searchNext(Node root) { // 寻找下一 next 指针
        if (root == null) return root; // 父节点的 next 指针不存在：待拼接 next 指针的节点已到其所在层级的末尾
        if (root.left != null) return root.left;
        if (root.right != null) return root.right;
        if (root.next != null) return searchNext(root.next); // 查找下一 next 节点是否存在左右子节点
        return null; // 左子节点右子节点以及next指针都为空：待拼接 next 指针的节点已到其所在层级的末尾
    }
}

// 广度优先遍历
/*class Solution {
    public Node connect(Node root) {
        if (root == null) return root;
        Queue<Node> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int count = queue.size();
            Node pre = null, cur = null; // 指针
            while (count != 0) {
                cur = queue.poll();
                if (pre != null) pre.next = cur;
                if (cur.left != null) queue.offer(cur.left);
                if (cur.right != null) queue.offer(cur.right);
                pre = cur;
                count--;
            }
        }
        return root;
    }
}*/
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(n)

### 279. [Perfect Squares](https://leetcode-cn.com/problems/perfect-squares/) 完全平方数

给定正整数 n，找到若干个完全平方数（比如 1, 4, 9, 16, ...）使得它们的和等于 n。你需要让组成和的完全平方数的个数最少。给你一个整数 n ，返回和为 n 的完全平方数的 最少数量 。1 <= n <= 10^4。完全平方数 是一个整数，其值等于另一个整数的平方；换句话说，其值等于一个整数自乘的积。例如，1、4、9 和 16 都是完全平方数，而 3 和 11 不是。  
示例：  
输入：n = 12  
输出：3  
解释：12 = 4 + 4 + 4

思路：  
1) 图的广度优先遍历。将 0 ～ n 的值转化为一有向无权图（多叉树）中的节点，且相同值的节点唯一，对于任意节点其可以与其他节点相连接，连接的条件为两节点值的差为一完全平方数，并且总是由值较大的节点指向值较小的节点。  
![](/images/2021-04-02-tree-algorithm/279_1.png)  
对于和为 n 的完全平方数的最少数量即：图中从值为 n 的节点到达值为 0 的节点的最短路径（任意两连通节点的差值总为一完全平方数）。  
![](/images/2021-04-02-tree-algorithm/279_2.jpg)  
2) 动态规划。状态表达式：dp[i] 表示最少需要多少个数的平方和来表示整数 i ，这些数必然落在区间 [1, sqrt(n)] 。枚举这些数，假设当前枚举到 j，则还需要取若干数的平方，构成 i−j^2 。此时该子问题和原问题类似，只是规模变小了，这符合了动态规划的要求，于是可以得到状态转移方程：  
*dp*[*i*] = 1 + min*dp*[*i* - *j*^2]，其中 *j* ∈ [1, *sqtr(i)*]  
dp[0] = 0 为边界条件，实际上无法表示数字 0，只是为了保证状态转移过程中遇到 j 恰为 sqtr(i) 的情况合法。同时计算 dp[i] 时所需要用到的状态仅有 dp[i-j^2]，**其必然小于 i （和为 i 的平方和数 dp[i] 前面已计算得到结果）**，因此只需要从小到大地枚举 i 来计算 dp[i] 即可。

题解：

```java
// 广度优先遍历
class Solution {
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
}

// 动态规划
/*class Solution {
    public int numSquares(int n) {
        int[] dp = new int[n + 1]; // 状态表达式：和为整数 i 的完全平方数的最少数量为 dp[i]
        for (int i = 1; i < n + 1; i++) { // 从小到大枚举计算每一个整数的平方和最小个数（前面计算得到的结果后面可能会用到）
            int minStep = Integer.MAX_VALUE; // 所需完全平方数的最少数量，即 min{dp[i - j^2]}
            for (int j = 1; j * j <= i; j++) minStep = Math.min(minStep, dp[i - j * j]); // 求解 min{dp[i - j^2]}
            dp[i] = minStep + 1; // 状态转移方程
        }
        return dp[n];
    }
}*/
```

tips：

- 时间复杂度：O(n * sqrt(n))，由四平方和定理：任意一个正整数都可以被表示为至多四个正整数的平方和，三层循环中最外层最多循环四次，中间层循环最多n次，最内层循环至多 sqrt(n) 次，广度优先遍历；状态转移方程的时间复杂度为 O(sqrt(n))，共需要计算 n 个状态（数值），因此总时间复杂度为 O(n * sqrt(n))，动态规划
- 空间复杂度：O(n)

### 127. Word Ladder 单词接龙

字典 wordList 中从单词 beginWord 和 endWord 的 转换序列 是一个按下述规格形成的序列：序列中第一个单词是 beginWord ；序列中最后一个单词是 endWord ；每次转换只能改变一个字母；转换过程中的中间单词必须是字典 wordList 中的单词。给你两个单词 beginWord 和 endWord 和一个字典 wordList ，找到从 beginWord 到 endWord 的 最短转换序列 中的 单词数目 。如果不存在这样的转换序列，返回 0。endWord.length == beginWord.length == wordList[i].length，beginWord、endWord 和 wordList[i] 由小写英文字母组成， beginWord != endWord，wordList 中的所有字符串 互不相同。  
示例：  
输入：beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]  
输出：5  
解释：一个最短转换序列是 "hit" -> "hot" -> "dot" -> "dog" -> "cog", 返回它的长度 5

思路：  
思路与279相似。图的广度优先遍历。将字典 wordList 中的单词转化为一有向无权图（多叉树）中的节点，且相同单词的节点唯一，对于任意节点其可以与其他节点相连接，连接的条件为两节点只相差一个字母（一条连接的路径代表一次有效的转换：每次转换只能改变一个字母），并且总是由算法执行过程中当前未被访问的节点指向已被访问的节点。  
![](/images/2021-04-02-tree-algorithm/127.png)  
对于从 beginWord 到 endWord 的最短转换序列中的单词数目即：图中从 beginWord 节点（不一定在创建的图中）到达 endWord 节点的最短路径上节点的数量。


题解：

```java
class Solution {
    public int ladderLength(String beginWord, String endWord, List<String> wordList) {
        Queue<String> queue = new LinkedList<>();
        queue.offer(beginWord);
        int len = wordList.size();
        boolean[] isVisited = new boolean[wordList.size()]; // 记录某一节点是否被访问过：图中不同单词的节点唯一
        int result = 1; // 最短转换序列中的单词数目，初始值为1（因为 beginWord 也算作最短转换序列中的单词）
        while (!queue.isEmpty()) {
            int count = queue.size();
            result++;
            while (count != 0) {
                String cur = queue.poll();
                for (int i = 0; i < len; i++) {
                    if (isVisited[i]) continue; // 优化：已被访问过的节点则跳过（再次访问到总步数只会增加）
                    String word = wordList.get(i);
                    int difCount = 0;
                    for (int j = 0; j < cur.length(); j++) {
                        if (cur.charAt(j) != word.charAt(j)) difCount++;
                    }
                    if (difCount == 1) { // 字典中单词 word 为一次有效的转换：只改变一个字母
                        if (word.equals(endWord)) return result;
                        queue.offer(word);
                        isVisited[i] = true;
                    }
                }
                count--;
            }
        }
        return 0;
    }
}
```

tips：

- 时间复杂度：O(n * l)，其中 n 为 wordList 的长度，l 为字典集合中单词的长度，每个单词最多入栈出栈一次
- 空间复杂度：O(n)

## Ⅴ Greedy Algorithm 贪心算法

贪心算法即在对问题进行求解时，在每一步选择中都采取最好或者最优(即最有利)的选择，从而希望能够导致结果是最好或者最优的算法。对于大部分题目结果为最优解，但也有个别题目的结果不一定是最优的结果（有时候会是最优解），但是都是相对近似（接近）最优解的结果。

### KY188. [Huffman Tree](https://www.nowcoder.com/practice/162753046d5f47c7aac01a5b2fcda155) 哈夫曼树

哈夫曼树，第一行输入一个数n，表示叶结点的个数。需要用这些叶结点生成哈夫曼树，根据哈夫曼树的概念，这些结点有权值，即weight，题目需要输出此哈夫曼树的带权路径长度（WPL）。  
示例：  
输入：  
ㅤㅤㅤ5  
ㅤㅤㅤ1 2 2 5 9  
输出：37

思路：  
将所有叶子节点的权添加到小顶堆中（使用java.util.PriorityQueue实现）：权最小的候选项（节点）放在堆的顶部，从堆中每次弹出两个权最小的节点组成组成一颗新的二叉树，并将当前二叉树的带权路径长度累加到结果中（每个新二叉树的带权路径长度是不断累加到最后形成的赫夫曼树的带权路径长度，而不是最后一步形成赫夫曼树时根节点的带权路径长度）。  
构造赫夫曼树的步骤：从小到大进行排序，将每一个数据都看作是一个节点，每个节点可以看成是一颗最简单的二叉树；取出根节点权值最小的两颗二叉树，组成一颗新的二叉树，该新的二叉树的根节点的权值是前面两颗二叉树根节点权值的和；再将这颗新的二叉树以根节点的权值大小再次排序，不断重复之前的步骤直到数列中所有的数据都被处理，就得到一颗赫夫曼树。  
给定n个权值作为n个叶子结点，构造一棵二叉树，若该树的带权路径长度(WPL)达到最小，称这样的二叉树为最优二叉树，也称为哈夫曼树。赫夫曼树是带权路径长度最短的树，权值较大的结点离根较近。  
若将树中结点赋给一个有着某种含义的数值，则这个数值称为该结点的权。结点的带权路径长度为：从根结点到该结点之间的路径长度与该结点的权的乘积。树的带权路径长度规定为所有叶子结点的带权路径长度之和，权值越大的结点离根结点越近的二叉树即最优二叉树（赫夫曼树）。

题解：

```java
import java.util.Scanner;
import java.util.PriorityQueue;

public class Main{
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        while (sc.hasNext()) {
            int nodeCount = sc.nextInt();
            int result = 0;
            PriorityQueue<Integer> heap = new PriorityQueue<>();
            for (int i = 0; i < nodeCount; i++) heap.offer(sc.nextInt());
            while (heap.size() > 1) {
                int sum = heap.poll() + heap.poll();
                result += sum;
                heap.offer(sum);
            }
            System.out.println(result);
        }
    }
}
```

tips：

- java.util.PriorityQueue类是一个基于优先级堆的无界优先级队列。优先级队列的元素按照其自然顺序进行排序，或者根据构造队列时提供的 Comparator 进行排序，具体取决于所使用的构造方法。优先级队列不允许使用 null 元素。依靠自然顺序的优先级队列还不允许插入不可比较的对象（可能导致 ClassCastException）。 此队列的头是按指定排序方式确定的最小元素。如果多个元素都是最小值，则头是其中一个元素（选择方法是任意的）。队列获取操作 poll、remove、peek 和 element 访问处于队列头的元素。此实现不是同步的，此实现为排队和出队方法（offer、poll、remove() 和 add）提供 O(log(n)) 时间，为 remove(Object) 和 contains(Object) 方法提供线性时间；为获取方法（peek、element 和 size）提供固定时间。此题使用PriorityQueue类来实现小顶堆的功能；
- 对PriorityQueue实现使用的offer及poll方法，都为接口 Queue中的方法，不使用add方法是由于offer方法通常要优于 add(E)，后者可能无法插入元素而只是抛出一个异常；
- 时间复杂度：O(nlogn)，使用O(n) 的时间统计每个叶子节点，然后将 n 个叶子节点权值添加到堆中，添加每个权值的时间为 O(logn)
- 空间复杂度：O(n)

## Ⅵ General - Tree & Recursive & Math 常规 - 树和递归以及数学

常规树结构题目，对于树结构的算法一般都会使用到递归。部分题目涉及到数学计算。

时间复杂度：O(h)，h 为树的高度  
空间复杂度：O(h)

### 450. [Delete Node in a BST](https://leetcode-cn.com/problems/delete-node-in-a-bst/) 删除二叉搜索树中的节点

给定一个二叉搜索树的根节点 root 和一个值 key，删除二叉搜索树中的 key 对应的节点，并保证二叉搜索树的性质不变。返回二叉搜索树（有可能被更新）的根节点的引用。一般删除节点可分为两个步骤：首先找到需要删除的节点；如果找到了，删除它。要求算法时间复杂度为 O(h)，h 为树的高度。  
示例：  
输入：root = [5,3,6,2,4,null,7]，key = 3

```
    5
   / \
  3   6
 / \   \
2   4   7
```

输出：[5,4,6,2,null,null,7]

```
    5
   / \
  4   6
 /     \
2       7
```

思路：  
递归：二叉搜索树节点的查找与删除。对于要删除的节点：1) 要删除的节点为叶子节点，直接删除；2) 要删除的节点左节点不为空但右节点为空，则直接将其左节点替换当前节点；3) 要删除的节点右节点不为空但左节点为空，则直接将其右节点替换当前节点；4) 要删除的节点左右子节点均不为空，查找右子树中值最小的节点（即要删除节点的中序后继节点，也即右子树中的最左节点），将此最左节点替换当前节点，并将最左节点从原位置删除。  
递归边界条件：未查找到直接返回 null，查找到直接返回对应的节点（暂时未查找到一直进行递归）。

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
    public TreeNode deleteNode(TreeNode root, int key) {
        if (root == null) return null; // 二叉搜索树中不存在 key 对应的节点，返回 null 不断回溯
        if (key < root.val) { // 查找
            root.left = deleteNode(root.left, key);
        } else if (key > root.val) { // 查找
            root.right = deleteNode(root.right, key);
        } else { // 当前节点即为要删除的节点
            if (root.left != null && root.right != null) { // 要删除的节点左右子节点都不为空
                TreeNode pre = root; // 当前要删除节点的中序后继节点（待删除）的父节点
                TreeNode cur = root.right; // 当前要删除节点的中序后继节点（待删除）
                while (cur.left != null) { // 查找当前要删除节点的中序后继节点（待删除）
                    pre = cur;
                    cur = cur.left;
                }
                // 1) 删除当前要删除节点的中序后继节点（两种情况：当前要删除节点的中序后继节点的左子节点为空右子节点不为空或者左右子节点都为空）
                if (pre == root) { // 当前要删除节点的中序后继节点（待删除）为其右子节点时
                    pre.right = cur.right;
                } else { // 当前要删除节点的中序后继节点（待删除）不为其右子节点时
                    pre.left = cur.right;
                }
                // 2) 删除当前要删除的节点
                root.val = cur.val;
            } else if (root.left != null) { // 要删除的节点左子节点不为空右子节点为空
                return root.left;
            } else { // 要删除的节点左子节点为空右子节点不为空或者左右子节点都为空（叶子节点）
                return root.right;
            }
        }
        return root; // 每种情况都需返回某一节点，对于暂时未查找到或者要删除的节点左右子节点都不为空（更改了root的值）的情况都返回当前递归层级传入的参数节点root
    }
}
```

### 701. [Insert into a Binary Search Tree](https://leetcode-cn.com/problems/insert-into-a-binary-search-tree/) 二叉搜索树中的插入操作

给定二叉搜索树（BST）的根节点和要插入树中的值，将值插入二叉搜索树。 返回插入后二叉搜索树的根节点。 输入数据保证 新值和原始二叉搜索树中的任意节点值都不同。可能存在多种有效的插入方式，只要树在插入后仍保持为二叉搜索树即可。 你可以返回 任意有效的结果 。给定的树上的节点数介于 0 和 10^4 之间。  
示例：  
输入：root = [4,2,7,1,3], val = 5  
输出：[4,2,7,1,3,5]  
![](/images/2021-04-02-tree-algorithm/701.jpg)

思路：  
递归：二叉搜索树节点的查找与插入。思路与450题相似，总是在二叉树的最后一层插入节点。

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
    public TreeNode insertIntoBST(TreeNode root, int val) {
        if (root == null) return new TreeNode(val);
        if (val < root.val) {
            root.left = insertIntoBST(root.left, val);
        } else { // val > root.val
            root.right = insertIntoBST(root.right, val);
        }
        return root;
    }
}
```

### 222. [Count Complete Tree Nodes](https://leetcode-cn.com/problems/count-complete-tree-nodes/) 完全二叉树的节点个数

给你一棵 完全二叉树 的根节点 root ，求出该树的节点个数。完全二叉树 的定义如下：在完全二叉树中，除了最底层节点可能没填满外，其余每层节点数都达到最大值，并且最下面一层的节点都集中在该层最左边的若干位置。若最底层为第 h 层，则该层包含 1~ 2^h 个节点。树中节点的数目范围是[0, 5 * 10^4]。要求时间复杂度小于O(n)。  
示例：  
输入：root = [1,2,3,4,5,6]  
![](/images/2021-04-02-tree-algorithm/222.jpg)  
输出：6

思路：  
递归：自顶向下（并非等同一般的二叉树前/中/后序遍历）+位运算。每次递归都能舍去当前递归子树的一半（使用数学公式计算其节点数），对于子树的另一半递归调用计算节点数。计算满二叉树的节点数时使用位运算简化2的n次方计算。  
递归模型：  
递归函数：每一层的递归中求解访问到的节点将作为根节点的子树节点数，返回值（即应该给上一层递归返回什么值）为当前根节点子树的节点数；  
递归边界条件：遍历到null节点则直接返回0不再自身调用方法（递归）。

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
    public int countNodes(TreeNode root) { // 求解当前递归层级遍历到的节点（树）的节点个数：自顶向下
        if (root == null) return 0; // 递归的边界条件
        int leftHeight = getHeight(root.left); // 左子树的高度
        int rightHeight = getHeight(root.right); // 右子树的高度
        if (leftHeight == rightHeight) { // 当前节点的左右子树高度相同：左子树为一满二叉树（节点个数为2^h - 1），加上当前节点为2^h（等于1<<h）个，对右子树进行递归统计节点数累加到当前节点为根节点的子树节点数
            return (1 << leftHeight) + countNodes(root.right);
        } else return (1 << rightHeight) + countNodes(root.left); // 当前节点的左右子树高度不同：右子树为一满二叉树，加上当前节点为2^h（等于1<<h）个，对左子树进行递归统计节点数累加到当前节点为根节点的子树节点数
    }

    private int getHeight(TreeNode root) { // 计算以root为根节点的二叉树的高度（从1开始计数）
        int height = 0;
        while (root != null) {
            height++;
            root = root.left; // 将参数root当作指针，因为二叉树为完全二叉树，其每一层级都左连续
        }
        return height;
    }
}
```

tips：

- 时间复杂度：O(log^2n)，也即O(h^2)，因为对于完全二叉树其高度h为logn，递归求解二叉树的节点数每次舍去当前递归子树的一半，故递归调用次数为O(h)，每次递归调用需要求解左右子树高度，其时间代价为O(h)，故总的时间复杂度为O(h^2)
- 空间复杂度：O(logn)