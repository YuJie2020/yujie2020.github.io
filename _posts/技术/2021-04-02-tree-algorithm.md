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

使用**分治法**的思想：将原问题拆解成若干个与原问题结构相同但规模更小的子问题，待子问题解决以后，原问题就得以解决。  
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
输入：输入：inorder = [9,3,15,20,7]；postorder = [9,15,7,20,3]    
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

## Ⅲ Greedy Algorithm 贪心算法

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