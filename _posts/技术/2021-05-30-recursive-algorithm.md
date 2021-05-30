---
layout: post
title: 递归-相关算法
description: 抽出LeetCode题库中递归相关的算法题目，再以相似类型的题目进行分类归纳总结题解。
category: 技术

---

## introduction 

抽出LeetCode题库中递归相关的算法题目，再以相似类型的题目进行分类归纳总结题解。  
并非每道题目的解法都是它的最优写法，只是在尽量保证代码执行高效性的前提下，为了归纳总结便于记忆而给定的解法，故这里每道题的题解也都只列出了一种写法。

递归：由递归模型建模，**递归模型由递归函数与递归边界条件（递归结束条件）组成**，边界条件即不再调用递归函数而直接返回某值。  
**递归不要进入到递归中看其执行流程（压栈与返回值），而是利用明确的定义来实现算法逻辑**。

## Ⅰ Linked List 链表

使用递归解法的链表题目。一般链表题目都需要使用指针或者更新某节点的成员变量（next），使用递归或者迭代两种解法都可以解题：迭代实现思路简单，但是细节问题多；而**递归实现则比较简洁**。递归操作链表并不高效，和迭代解法相比，虽然时间复杂度都是 O(n)，但是迭代解法的空间复杂度是 O(1)，而递归解法需要堆栈，空间复杂度是 O(N)。

### 21. [Merge Two Sorted Lists](https://leetcode-cn.com/problems/merge-two-sorted-lists/) 合并两个有序链表

将两个升序链表合并为一个新的 **升序** 链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。  
示例：  
输入：l1 = [1,2,4], l2 = [1,3,4]  
![](/images/2021-05-30-recursive-algorithm/21-title.png)  
输出：[1,1,2,3,4,4]

思路：  
1）迭代：由递归模型建模，递归模型由递归函数与递归边界条件（递归结束条件）组成，边界条件即不再调用递归函数而直接返回某值。此题在回溯过程中拼接了结果链表。  
递归模型：  
递归函数merge：两个链表头部值较小的一个节点与剩下元素的 merge 操作结果拼接。  
递归边界条件：当 l1 或 l2 为空（传递进来的节点为空），直接返回另一不为空的节点。  
![](/images/2021-05-30-recursive-algorithm/21-answer.png)  
2）迭代：使用cur指针将 l1 和 l2 链表值更小的头节点添加到结果中，当一个节点被添加到结果中之后将对应链表中的节点向后移一位。

题解：

```java
/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
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
        ListNode dummyHead = new ListNode(); // 虚拟头节点，用于返回结果链表的头节点和便于添加元素
        ListNode cur = dummyHead;
        while (l1 != null && l2 != null) { // l1 与 l2 其中总有一个先遍历结束
            if (l1.val < l2.val) {
                cur.next = l1;
                l1 = l1.next;
            } else {
                cur.next = l2;
                l2 = l2.next;
            }
            cur = cur.next;
        }
        cur.next = l1 == null ? l2 : l1; // 还有一个原链表未遍历完，直接将结果链表末尾指针指向未遍历完的链表即可
        return dummyHead.next;
    }
}*/
```

tips：

- 对于迭代，方法传入的参数 l1 与 l2 链表的头节点，在返回值的时候用不到，故可以直接将头节点 l1 和 l2 当作遍历两个升序链表的指针；
- 时间复杂度：O(m+n)，递归；O(m+n)，迭代；无论递归还是迭代，执行次数都不会超过两链表长度之和
- 空间复杂度：O(m+n)，递归；O(1)，迭代

### 206. [Reverse Linked List](https://leetcode-cn.com/problems/reverse-linked-list/) 反转链表

给你单链表的头节点 `head` ，请你反转链表，并返回反转后的链表。链表中节点的数目范围是 [0, 5000]。  
示例：  
输入：head = [1,2,3,4,5]  
输出：[5,4,3,2,1]

思路：  
迭代：使用指针指向链表的当前节点及其前一节点和后一节点，反转链表cur,next=pre;，后移三个指针完成遍历。  
递归：递归到原链表的最后一个节点时返回原链表最后一个节点（递归的结束条件），回溯过程中进行链表的反转。

题解：

```java
/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
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
        ListNode pre = null; // 当前节点的前一节点指针
        ListNode cur = head; // 当前节点的指针
        while (cur != null) { // 当前节点cur指针不为空时再求其next指针
            ListNode next = cur.next; // 当前节点的下一节点指针
            cur.next = pre; // 反转
            pre = cur; // pre指针后移
            cur = next; // 当前节点cur指针后移
        }
        return pre; // 迭代结束cur指针指向原链表最后一个节点的下一个null引用，而pre指针则为原链表中最后一个节点
    }
}*/
```

tips：

- 时间复杂度：O(n)，迭代；O(n)，递归
- 空间复杂度：O(1)，迭代；O(n)，递归，使用栈空间，递归深度达到 n 层
