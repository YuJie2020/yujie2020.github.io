---
layout: post
title: 递归-相关算法
description: 抽出LeetCode题库中递归相关的算法题目，再以相似类型的题目进行分类归纳总结题解。
category: 技术

---

## introduction 

抽出LeetCode题库中递归相关的算法题目，再以相似类型的题目进行分类归纳总结题解。  
并非每道题目的解法都是它的最优写法，只是在尽量保证代码执行高效性的前提下，为了归纳总结便于记忆而给定的解法，故这里每道题的题解也都只列出了一种写法。

递归是一个反复调用自身的过程，这就说明它每一级/层的功能都是一样的，**因此只需要关注一级/层递归的解决过程即可**。**递归不要进入到递归中看其执行流程（压栈与返回值），而是利用明确的定义来实现算法逻辑**。

递归：由递归模型建模，**递归模型由递归函数与递归边界条件（递归结束条件）组成**。递归函数则由在这一层的递归中应该完成什么任务和返回值（即应该给上一层递归返回什么值）组成；边界条件即不再调用递归函数而直接返回某值所需的条件。  

## Ⅰ Linked List 链表

使用递归解法的链表题目。一般链表题目都需要使用指针或者更新某节点的成员变量（next），使用递归或者迭代两种解法都可以解题：迭代实现思路简单，但是细节问题多；而**递归实现则比较简洁**。递归操作链表并不高效，和迭代解法相比，虽然时间复杂度都是 O(n)，但是迭代解法的空间复杂度是 O(1)，而递归解法需要堆栈，空间复杂度是 O(N)。

### 21. [Merge Two Sorted Lists](https://leetcode-cn.com/problems/merge-two-sorted-lists/) 合并两个有序链表

将两个升序链表合并为一个新的 升序 链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。  
示例：  
输入：l1 = [1,2,4], l2 = [1,3,4]  
![](/images/2021-05-30-recursive-algorithm/21-title.png)  
输出：[1,1,2,3,4,4]

思路：  
1）递归：由递归模型建模，递归模型由递归函数与递归边界条件（递归结束条件）组成，边界条件即不再调用递归函数而直接返回某值。此题在回溯过程中拼接了结果链表。  
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

### 24. [Swap Nodes in Pairs](https://leetcode-cn.com/problems/swap-nodes-in-pairs/) 两两交换链表中的节点

给定一个链表，两两交换其中相邻的节点，并返回交换后的链表。你不能只是单纯的改变节点内部的值，而是需要实际的进行节点交换。链表中节点的数目在范围 [0, 100] 内。  
示例：  
输入：head = [1,2,3,4,5]  
输出：[2,1,4,3,5]

思路：  
1）递归：  
递归函数：node1.next = swap(node2.next)。给上一层递归的值应该是已经交换完成后的子链表；对于本级递归，这个链表也即三个节点：head、head.next、已处理完的链表部分，而本级递归的任务就是交换这3个节点中的前两个节点。  
递归边界条件：链表中没有节点，或者链表中只有一个节点，此时无法进行交换。  
![](/images/2021-05-30-recursive-algorithm/24.png)  
2）迭代：维护4个指针，pre指针指向需要相邻两两交换的节点的前一节点，node1和node2指针指向两需要对调的节点，next指针指向两需要对调的节点的下一节点。

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
    public ListNode swapPairs(ListNode head) { // 在回溯过程中两两反转链表
        if (head == null || head.next == null) return head; // 递归结束条件，第一次返回的为原链表最后一个节点（链表长度为奇数）或链表末尾的null（链表长度为偶数）
        ListNode node2 = head.next; // 对调前：head总为node1节点，其下一节点则为node2节点
        head.next = swapPairs(node2.next); // 将node1节点的下一节点更新为两两反转节点的后继节点
        node2.next = head; // 将node2节点的下一节点更新为node1节点
        return node2; // 返回值总为当前两两反转节点的头节点（node2位置被对调到node1的位置，为下一待两两反转节点的后继结点）
    }
}

// 迭代
/*class Solution {
    public ListNode swapPairs(ListNode head) {
        ListNode dummyHead = new ListNode();
        dummyHead.next = head;
        ListNode pre = dummyHead; // 前驱指针：指向需要相邻两两交换的节点的前一节点
        while (pre.next != null && pre.next.next != null) { // pre指针一定不为空
            ListNode node1 = pre.next;
            ListNode node2 = node1.next;
            ListNode next = node2.next; // 后继指针：两需要对调的节点的下一节点
            node2.next = node1;
            node1.next = next;
            pre.next = node2;
            pre = node1; // 更新pre指针
        }
        return dummyHead.next;
    }
}*/
```

tips：

- 思路与206题相似（迭代/递归）；
- 时间复杂度：O(n)
- 空间复杂度：O(n)，递归；O(1)，迭代

### 19. [Remove Nth Node From End of List](https://leetcode-cn.com/problems/remove-nth-node-from-end-of-list/) 删除链表的倒数第 N 个结点

给你一个链表，删除链表的倒数第 n 个结点，并且返回链表的头结点。使用一趟扫描实现。  
示例：  
输入：head = [1,2,3,4,5], n = 2  
输出：[1,2,3,5]

思路：  
1）双指针，滑动窗口：迭代。定义pre指针为需删除节点的前一节点，end指针为链表的末尾null，pre指针与end指针间的距离为n+1，故可以将pre指针和end指针都初始化为虚拟头节点dummyHead，先向右平移n+1位将end指针与pre指针的距离固定到n+1，之后同时平移pre指针和end指针直到end指针指向链表末尾null（滑动窗口），则代表找到需删除节点的前一节点pre的正确位置，删除其下一节点。  
![](/images/2021-05-30-recursive-algorithm/19.png)  
2）递归：  
递归函数：  
执行任务：当前层递归参数的next为上一层递归的返回值；  
返回值：当前层递归的返回值为当前层递归参数的下一节点或当前层递归参数。  
递归边界条件：当递归参数head为空即到达链表末尾时。

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

// 双指针，滑动窗口：迭代
class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode dummyHead = new ListNode();
        dummyHead.next = head;
        ListNode pre = dummyHead, end = dummyHead;
        for (int i = 0; i < n + 1; i++) end = end.next;
        while (end != null) {
            pre = pre.next;
            end = end.next;
        }
        pre.next = pre.next.next;
        return dummyHead.next;
    }
}

// 递归
/*class Solution {
    int count = 0; // 成员变量
    public ListNode removeNthFromEnd(ListNode head, int n) { // 回溯的过程中拼接链表，只是在倒数第n个位置时舍去了原链表中本应拼接的下一节点而拼接了后一个节点
        if (head == null) return null; 
        head.next = removeNthFromEnd(head.next, n);
        return ++count == n ? head.next : head;
    }
}*/
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(1)，双指针，滑动窗口：迭代；O(n)，递归