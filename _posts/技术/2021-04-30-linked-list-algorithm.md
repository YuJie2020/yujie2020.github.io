---
layout: post
title: 链表结构-相关算法
description: 抽出LeetCode题库中链表结构相关的算法题目，再以相似类型的题目进行分类归纳总结题解。
category: 技术

---

## introduction 

抽出LeetCode题库中链表结构相关的算法题目，再以相似类型的题目进行分类归纳总结题解。  
并非每道题目的解法都是它的最优写法，只是在尽量保证代码执行高效性的前提下，为了归纳总结便于记忆而给定的解法，故这里每道题的题解也都只列出了一种写法。

对于链表相关题目，无论使用哪种思路解题，大都有会使用到 **虚拟头节点 dummyHead** 的思路，用于返回结果链表的头节点，以及在原链表需要删除的元素可能为头节点的情况下为了便于删除节点，或者便于在新结果链表中添加元素/节点。  
与此同时，链表相关题目都会使用到指针。

## Ⅰ Recursive 递归

递归是一个反复调用自身的过程，这就说明它每一级/层的功能都是一样的，**因此只需要关注一级/层递归的解决过程即可**。**递归不要进入到递归中看其执行流程（压栈与返回值），而是利用明确的定义来实现算法逻辑**。

递归：由递归模型建模，**递归模型由递归函数与递归边界条件（递归结束条件）组成**。递归函数则由在这一层的递归中应该完成什么任务和返回值（即应该给上一层递归返回什么值）组成；边界条件即不再调用递归函数而直接返回某值所需的条件。

需要注意**递归函数内调用递归函数的语句行**：及其将调用的递归函数的返回值用于什么表达式。对于此语句行后的执行逻辑：即为递归函数遇到递归边界后，不断回溯过程中执行的逻辑。同时对于此语句行前的执行逻辑：可以看作在准备进入下一递归层级前的准备操作。eg：参照 24 题。

使用递归解法的链表题目。一般链表题目都需要使用指针或者更新某节点的成员变量（next），使用递归或者迭代两种解法都可以解题：迭代实现思路简单，但是细节问题多；而**递归实现则比较简洁**。递归操作链表并不高效，和迭代解法相比，虽然时间复杂度都是 O(n)，但是迭代解法的空间复杂度是 O(1)，而递归解法需要堆栈，空间复杂度是 O(N)。

### 21. [Merge Two Sorted Lists](https://leetcode-cn.com/problems/merge-two-sorted-lists/) 合并两个有序链表

将两个升序链表合并为一个新的 升序 链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。  
示例：  
输入：l1 = [1,2,4], l2 = [1,3,4]  
![](/images/2021-04-30-linked-list-algorithm/21-title.png)  
输出：[1,1,2,3,4,4]

思路：  
1）递归：由递归模型建模，递归模型由递归函数与递归边界条件（递归结束条件）组成，边界条件即不再调用递归函数而直接返回某值。此题在回溯过程中拼接了结果链表。  
递归模型：  
递归函数merge：两个链表头部值较小的一个节点与剩下元素的 merge 操作结果拼接。  
递归边界条件：当 l1 或 l2 为空（传递进来的节点为空），直接返回另一不为空的节点。  
![](/images/2021-04-30-linked-list-algorithm/21-answer.png)  
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
迭代：使用指针指向链表的当前节点及其前一节点和后一节点，反转链表cur.next=pre;，后移三个指针完成遍历。  
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
![](/images/2021-04-30-linked-list-algorithm/24.png)  
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
![](/images/2021-04-30-linked-list-algorithm/19.png)  
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

## Ⅱ Pointers 指针

对于引用类型（eg：链表中的节点）：  
指针即代表一种引用（对象/引用类型的引用），**指向引用对象的地址值**，**用于操作指向（引用）对象的成员变量**。eg：ListNode removed = point.next; point.next = point.next.next;，removed 即为一指针：指向 point 的成员变量 next 也即 point 的下一节点（point 的下一节点对象的引用/地址）；而 point.next 并非指针，代表 point 对象的成员变量 next 也即 point 的下一节点，point.next = point.next.next 为将 point 对象的成员变量 next 更新为 point.next.next，即将 point 的下一节点更新为 point 的后一节点。

### 143. [Reorder List](https://leetcode-cn.com/problems/reorder-list/) 重排链表

给定一个单链表 L：L0→L1→…→Ln-1→Ln ，将其重新排列后变为： L0→Ln→L1→Ln-1→L2→Ln-2→… 。你不能只是单纯的改变节点内部的值，而是需要实际的进行节点交换。  
示例：  
输入：1->2->3->4->5  
输出：1->5->2->4->3

思路：  
双指针。**使用快慢指针寻找链表的中点**。将链表的后半部分反转，然后和前半部分进行分别各取一个节点逐一拼接。

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
class Solution {
    public void reorderList(ListNode head) {

        // 1) 使用快慢指针寻找链表的中点
        ListNode slow = head, fast = head.next;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        } // 退出循环后：当链表长度为奇数时slow指针位于链表中间节点，当链表长度为偶数时slow指针位于链表前半部分的末尾

        // 2) 将链表后半部分进行反转
        ListNode pre = null, cur = slow.next;
        slow.next = null; // 将链表前半部分末尾置空（与后半部分链表断开）
        while (cur != null) {
            ListNode next = cur.next;
            cur.next = pre;
            pre = cur;
            cur = next;
        } // 退出循环后pre指针即为后半部分反转链表的新头节点

        // 3) 将原链表的前半部分和反转后的后半部分分别各取一个节点逐一拼接在一起
        ListNode cur1 = head, cur2 = pre; // cur1和cur2指针分别指向原链表的前半部分和反转后的后半部分的当前遍历节点（初始值都为两个子链表的头节点）
        while (cur2 != null) {
            ListNode next = cur2.next; // 需要先保存原链表反转后的后半部分当前节点的下一节点
            cur2.next = cur1.next;
            cur1.next = cur2;
            cur1 = cur1.next.next;
            cur2 = next;
        }
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(1)

### 234. [Palindrome Linked List](https://leetcode-cn.com/problems/palindrome-linked-list/) 回文链表

请判断一个链表是否为回文链表。用 O(n) 时间复杂度和 O(1) 空间复杂度解决此题。  
示例：  
输入：1->2->1  
输出：true

思路：  
双指针。cur指针用于反转链表。**使用快慢指针寻找链表的中点**。将链表的前半部分反转，然后和后半部分进行比较。

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
class Solution {
    public boolean isPalindrome(ListNode head) {
        ListNode cur = head, pre = null; // cur指针用于反转链表（更新其成员变量next），pre指针总是指向cur指针指向节点的前一节点
        ListNode slow = head, fast = head; // 快慢指针，用于辅助cur和pre指针反转链表（仅引用地址，并未更新其成员变量next，即未进行链表操作）
        while (fast != null && fast.next != null) {
            cur = slow; // 更新cur指针指向slow（当前反转的节点）
            slow = slow.next; // 自更新，每次后移一位，**需要在反转操作前更新**（否则影响指针的正常后移）
            fast = fast.next.next; // 自更新，每次后移两位，**需要在反转操作前更新**（否则影响指针的正常后移）
            cur.next = pre; // 反转前半部分链表（是由cur指针操作的）
            pre = cur; // 更新pre指针指向当前反转的节点
        } // 退出循环后slow指针指向链表的中间节点（总是指向前半部分反转链表后的第一个节点，即后半未反转链表的第一个节点：因为slow和fast指针在每次循环中分别各自移动一位和两位），则pre指针总是指向前半部分反转链表的最后一个节点，fast指针指向链表的末尾节点（链表长度为奇数时）或末尾节点的next空引用（链表长度为偶数时）
        if (fast != null) slow = slow.next; // 链表的长度为奇数时将slow指针移向用于比较的后半部分链表的起始节点
        while (pre != null || slow != null) {
            if (pre.val != slow.val) return false;
            pre = pre.next;
            slow = slow.next;
        }
        return true; // 当传入的参数head=null或head.next=null也成立（不会进入上述循环）
    }
}
```

tips：

- 指针自更新移动（a=a.next; / a=a.next.next; ...）时需要注意当前自更新指针指向的节点在之前的程序执行中是否有其他指针指向此节点且已经改变了链表的顺序：防止空指针异常，且保证自更新指针的正常移动；
- 时间复杂度：O(n)
- 空间复杂度：O(1)

### 2. [Add Two Numbers](https://leetcode-cn.com/problems/add-two-numbers/) 两数相加

给你两个 非空 的链表，表示两个非负的整数。它们每位数字都是按照 逆序 的方式存储的，并且每个节点只能存储 一位 数字。请你将两个数相加，并以相同形式返回一个表示和的链表。你可以假设除了数字 0 之外，这两个数都不会以 0 开头。  
示例：  
输入：l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]  
输出：[8,9,9,9,0,0,0,1]

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
class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        boolean flag = false; // 用于标记当前位是否需要进位
        ListNode dummyHead = new ListNode(); // 虚拟头节点，用于返回结果链表的头节点
        ListNode cur = dummyHead; // 指针
        while (l1 != null || l2 != null) { // l1 与 l2 的长度不一的相同
            int ele1 = l1 == null ? 0 : l1.val; // 其中一个链表到达末尾则其位上的值为0
            int ele2 = l2 == null ? 0 : l2.val;
            int sum = flag ? ele1 + ele2 + 1 : ele1 + ele2;
            flag = sum >= 10 ? true : false; // 更新是否需要进位情况
            cur.next = new ListNode(sum % 10);  // 新建节点添加到结果链表的尾部
            cur = cur.next;
            l1 = l1 == null ? l1 : l1.next; // 防止空指针异常
            l2 = l2 == null ? l2 : l2.next;
        }
        if (flag) { // 原两链表最高位还需要进位则需再创建一个节点将其值置于1
            cur.next = new ListNode(1);
        }
        return dummyHead.next;
    }
}
```

tips：

- 模拟：数学+指针。模拟两个数手动相加的过程，使用指针将当前位的值创建的节点添加到结果；
- 时间复杂度：O(max(m,n))，m 和 n 分别为两个链表的长度
- 空间复杂度：O(1)，返回值不计入空间复杂度

### 445. [Add Two Numbers II](https://leetcode-cn.com/problems/add-two-numbers-ii/) 两数相加 II

给你两个 非空 链表来代表两个非负整数。数字最高位位于链表开始位置。它们的每个节点只存储一位数字。将这两数相加会返回一个新的链表。你可以假设除了数字 0 之外，这两个数字都不会以零开头。你不能对列表中的节点进行翻转。  
示例：  
输入：(7 -> 2 -> 4 -> 3) + (5 -> 6 -> 4)  
输出：7 -> 8 -> 0 -> 7

思路：  
模拟：思路与2题相似，链表中数的顺序与做加法的顺序是相反的，为了逆序处理所有数，把原链表所有数字压入栈中，再依次取出相加，模拟两个数手动相加的过程。结果链表的位数也需要与做加法的顺序相反：使用head指针保存当前位的值创建的节点并将其添加到结果链表的头部（head指针总是指向结果链表的头部）。

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
class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        Stack<Integer> stack1 = new Stack<>();
        Stack<Integer> stack2 = new Stack<>();
        while (l1 != null || l2 != null) {
            if (l1 != null) {
                stack1.push(l1.val);
                l1 = l1.next;
            }
            if (l2 != null) {
                stack2.push(l2.val);
                l2 = l2.next;
            }
        }
        ListNode head = null; // 指针
        boolean flag = false; // 用于标记当前位是否需要进位
        while (!stack1.empty() || !stack2.empty() || flag) { // 当最后一位需要进位时也进入循环
            int ele1 = stack1.empty() ? 0 : stack1.pop();
            int ele2 = stack2.empty() ? 0 : stack2.pop();
            int sum = flag ? ele1 + ele2 + 1 : ele1 + ele2;
            flag = sum >= 10 ? true : false;
            ListNode node = new ListNode(sum % 10);
            node.next = head; // 在结果链表的前面添加当前位新节点
            head = node; // 使用head保存（指向）当前位节点，也即结果链表的头节点
        }
        return head;
    }
}
```

tips：

- 对象（引用类型）的变量名仅代表了一个地址，当这个地址值还有引用，就不会在内存中消失（被垃圾回收）：**当变量名（局部变量的引用类型：对象）的作用域范围以外时此变量的地址还有被其他对象引用此对象就不会消失**。eg：此题中的node节点；
- 时间复杂度：O(max(m,n))，m 和 n 分别为两个链表的长度
- 空间复杂度：O(m+n)，取决于把链表内容放入栈中所用的空间，返回值不计入空间复杂度

### 83. [Remove Duplicates from Sorted List](https://leetcode-cn.com/problems/remove-duplicates-from-sorted-list/) 删除排序链表中的重复元素

存在一个按升序排列的链表，给你这个链表的头节点 `head` ，请你删除所有重复的元素，使每个元素 只出现一次 。返回同样按升序排列的结果链表。  
示例：  
输入：head = [1,1,2,3,3]  
![](/images/2021-04-30-linked-list-algorithm/83.jpg)  
输出：[1,2,3]

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

class Solution {
    public ListNode deleteDuplicates(ListNode head) {
        ListNode cur = head;
        while (cur != null && cur.next != null) { // 指针遍历到链表末尾（最后两个元素不同时）或者链表倒数第二个节点（最后两个元素可能相同可能不同）结束遍历
            if (cur.val == cur.next.val) { // 删除重复的元素
                cur.next = cur.next.next;
            } else cur = cur.next; // 相邻节点的值不同时才将cur指针后移
        }
        return head;
    }
}
```

tips：

- 指针。使用 cur 指针删除重复的元素；
- 时间复杂度：O(n)
- 空间复杂度：O(1)

### 82. [Remove Duplicates from Sorted List II](https://leetcode-cn.com/problems/remove-duplicates-from-sorted-list-ii/) 删除排序链表中的重复元素 II

存在一个按升序排列的链表，给你这个链表的头节点 head ，请你删除链表中所有存在数字重复情况的节点，只保留原始链表中 没有重复出现 的数字。返回同样按升序排列的结果链表。  
示例：  
输入：head = [1,1,1,2,3]  
输出：[2,3]

思路：  
思路与83题相似。使用双指针的思路，使用pre指针保存（指向）cur指针指向的节点的前一个节点，用于删除节点；cur指针用于遍历重复的元素（功能与83题相同）。

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
class Solution {
    public ListNode deleteDuplicates(ListNode head) {
        ListNode dummyHead = new ListNode();
        dummyHead.next = head; // 虚拟头节点，便于返回结果链表头节点（可能原链表的头节点即为重复值元素，即需要删除）
        ListNode pre = dummyHead, cur = head;
        boolean flag = false; // 标记链表遍历过程中是否出现重复的元素，当前cur节点值唯一为false，否则为true
        while (cur != null && cur.next != null) {
            if (cur.val == cur.next.val) { // 遍历值重复元素的过程
                cur.next = cur.next.next;
                flag = true; // 当前值cur.val出现重复元素标记为true
            } else if (flag) { // 值重复元素遍历到末尾
                pre.next = cur.next; // 将相同值的元素全部删除
                cur = cur.next; // 遍历下一个不同值的元素
                flag = false; // 删除重复元素后flag需要重新置false
            } else { // 代表当前cur节点的值与下一节点的值不同并且当前节点的值的元素唯一，则不需要删除当前元素，双指针后移即可
                pre = cur;
                cur = cur.next;
            }
        }
        if (flag) pre.next = cur.next; // 当原链表的末尾出现值重复的元素，cur.next会到达原链表末尾为null，则不会进入循环体，故还需要在遍历结束外再次检查
        return dummyHead.next;
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(1)

### 203. [Remove Linked List Elements](https://leetcode-cn.com/problems/remove-linked-list-elements/) 移除链表元素

给你一个链表的头节点 `head` 和一个整数 `val` ，请你删除链表中所有满足 `Node.val == val` 的节点，并返回 新的头节点。  
示例：  
输入：head = [1,2,6,3,4,5,6], val = 6  
输出：[1,2,3,4,5]

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
class Solution {
    public ListNode removeElements(ListNode head, int val) {
        ListNode dummyHead = new ListNode(); // 定义一虚拟头节点，用于返回结果链表的头节点，同时原链表头节点可能为需要删除的节点
        dummyHead.next = head;
        ListNode cur = dummyHead;
        while (cur.next != null) { // 无论原链表最后一个节点的值是否等于val，都会遍历到最后一个节点
            if (cur.next.val == val) {
                cur.next = cur.next.next;
            } else cur = cur.next; // 下一节点的值不等于val才将cur指针后移
        }
        return dummyHead.next;
    }
}
```

tips：

- 思路与83题相似，使用 cur 指针（有类似前一节点pre指针的功能）删除值等于val的元素；
- 时间复杂度：O(n)
- 空间复杂度：O(1)

### 61. [Rotate List](https://leetcode-cn.com/problems/rotate-list/) 旋转链表

给你一个链表的头节点 `head` ，旋转链表，将链表每个节点向右移动 `k` 个位置。链表中节点的数目在范围 [0, 500] 内。  
示例：  
输入：head = [0,1,2], k = 4  
![](/images/2021-04-30-linked-list-algorithm/61.jpg)  
输出：[2,0,1]

思路：  
将原链表倒数的第k个元素作为新链表的头节点，原链表的头节点拼接到原链表的尾部。统计链表长度len，则原链表中第 len - k % len 个节点即为链表应该被分割的位置。

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
class Solution {
    public ListNode rotateRight(ListNode head, int k) {
        if (head == null) return null;
        int len = 1; // 链表长度
        ListNode cur = head; // 用于统计链表的长度和查找链表分割的位置（指向待分割链表的前一节点）
        while (cur.next != null) {
            len++;
            cur = cur.next;
        }
        ListNode tail = cur; // tail指针指向原链表末尾节点
        cur = head; // 将cur指针重置指向头节点，用于查找链表分割的位置
        for (int i = 1; i < len - k % len; i++) cur = cur.next;
        tail.next = head; // 将原链表的尾节点拼接到原链表的头节点
        ListNode newHead = cur.next; // 新的头节点，需要置于原链表尾节点拼接完之后（因为链表分割位置可能在最后即旋转链表还为原链表）
        cur.next = null; // 将拼接后的新链表末尾置空
        return newHead;
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(1)

## Ⅲ Insertion Method 插入法

使用插入法的相关链表题目，头插法属于插入法。  
对于插入法，一般都会使用到 **哨兵**，用于删除节点。

时间复杂度：O(n)  
空间复杂度：O(1)

### 92. [Reverse Linked List II](https://leetcode-cn.com/problems/reverse-linked-list-ii/) 反转链表 II

给你单链表的头指针 head 和两个整数 left 和 right ，其中 left <= right 。请你反转从位置 left 到位置 right 的链表节点，返回 反转后的链表 。  
示例：  
输入：head = [1,2,3,4,5], left = 2, right = 4  
![](/images/2021-04-30-linked-list-algorithm/92.jpg)  
输出：[1,4,3,2,5]

思路：  
使用头插法（插入法）+哨兵的思路，迭代求解。此题guard指针相当于一个静态的哨兵。

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
class Solution {
    public ListNode reverseBetween(ListNode head, int left, int right) {
        ListNode dummyHead = new ListNode(0); // 定义一虚拟头节点用于返回反转链表的头节点（当left=1时反转后的链表头节点会变化），同时也便于元素插入（当left=1时）
        dummyHead.next = head;
        ListNode guard = dummyHead; // 守卫guard指针：指向部分反转链表起始位置的前一节点（第一个要反转的节点的前一节点）
        ListNode point = head; // point指针：指向部分反转链表的起始位置（第一个要反转的节点）
        for (int i = 0; i < left - 1; i++) { // 由left确定guard和point指针指向的节点（找到后即固定，guard和point指针在链表反转过程中不再变化）
            guard = guard.next;
            point = point.next;
        }
        for (int i = 0; i < right - left; i++) { // 头插法：将point节点后的元素删除然后添加到guard节点的后面（总为部分反转链表的起始位置）
            ListNode removed = point.next; // 被删除的point节点后的元素（指针-removed）
            point.next = point.next.next; // 将链表中point节点的下一节点**更新**为其后一个节点（成员变量-point.next，并非指针所以不是使用removed）
            removed.next = guard.next; // 将被删除的元素的下一节点更新为guard指针指向节点的下一节点（即将被删除的元素**总是**插入到部分反转链表的起始位置，所以不是更新为point）
            guard.next = removed; // 将guard指针的下一节点更新为被删除的元素
        }
        return dummyHead.next;
    }
}
```

tips：

- 指针即代表一种引用（对象/引用类型的引用），**指向引用对象的地址值**，**用于操作指向（引用）对象的成员变量**。eg：ListNode removed = point.next; point.next = point.next.next;，removed 即为一指针：指向 point 的成员变量 next 也即 point 的下一节点（point 的下一节点对象的引用/地址）；而 point.next 并非指针，代表 point 对象的成员变量 next 也即 point 的下一节点，point.next = point.next.next 为将 point 对象的成员变量 next 更新为 point.next.next，即将 point 的下一节点更新为 point 的后一节点。

### 25. [Reverse Nodes in k-Group](https://leetcode-cn.com/problems/reverse-nodes-in-k-group/) 反转链表 II

给你一个链表，每 k 个节点一组进行翻转，请你返回翻转后的链表。k 是一个正整数，它的值小于或等于链表的长度。如果节点总数不是 k 的整数倍，那么请将最后剩余的节点保持原有顺序。设计一个只使用常数额外空间的算法来解决此问题。不能只是单纯的改变节点内部的值，而是需要实际进行节点交换。  
示例：  
输入：head = [1,2,3,4,5], k = 3  
输出：[3,2,1,4,5]

思路：  
使用头插法（插入法）+哨兵的思路，迭代求解。此题pre指针相等于一个静态的哨兵。

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
class Solution {
    public ListNode reverseKGroup(ListNode head, int k) {
        ListNode dummyHead = new ListNode();
        dummyHead.next = head;
        ListNode pre = dummyHead, cur = head; // pre指针指向当前待反转子链表的前驱节点，cur指针指向当前需反转链表反转前的头节点
        int len = 0; // 链表长度
        while (head != null) { // 将头节点当作指针，遍历链表统计链表的长度
            len++;
            head = head.next;
        }
        head = dummyHead.next; // 将head头节点重新定义为链表的头节点
        for (int i = 0; i < len / k; i++) {
            for (int j = 0; j < k - 1; j++) {
                ListNode removed = cur.next; // 被删除的元素，也即需要插入的元素
                cur.next = cur.next.next;
                removed.next = pre.next; // 将被删除的元素的下一节点更新为pre指针指向节点的下一节点（即将被删除的元素**总是**插入到当前反转链表的起始位置）
                pre.next = removed;
            }
            pre = cur; // cur指针总是指向当前需反转链表反转前的头节点，故反转后其位于当前反转链表反转后的尾节点，即为下一待反转子链表的前驱节点
            cur = cur.next;
        }
        return dummyHead.next;
    }
}
```

tips：

- 思路与92题相似。

### 86. [Partition List](https://leetcode-cn.com/problems/partition-list/) 分隔链表

给你一个链表的头节点 head 和一个特定值 x ，请你对链表进行分隔，使得所有 小于 x 的节点都出现在 大于或等于 x 的节点之前。你应当 保留 两个分区中每个节点的初始相对位置。  
示例：  
输入：head = [1,4,3,2,5,2], x = 3  
![](/images/2021-04-30-linked-list-algorithm/86.jpg)  
输出：[1,2,2,4,3,5]

思路：  
原地：使用插入法+哨兵的思路，迭代求解。此题pre指针相当于一个动态的哨兵。  
模拟：使用两个虚拟头节点dummyHead维护两个链表，一个链表其中都为小于x的节点另一个链表都为大于等于x的节点。遍历完原链表后，只要将 small 链表尾节点指向 large 链表的头节点即能完成对链表的拼接。

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

// 原地解法
class Solution {
    public ListNode partition(ListNode head, int x) {
        ListNode dummyHead = new ListNode(x - 1); //  小于 x 的节点在前，故dummyHead节点的值需定义为小于x
        dummyHead.next = head;
        ListNode pre = dummyHead, cur = dummyHead;
        while (cur != null && cur.val < x) { // 1) 首先遍历链表找到第一个大于等于x的节点并将cur指针指向此节点，pre指针则指向cur指针前一节点（即当前最后一个小于x的节点）
            pre = cur;
            cur = cur.next;
        }
        while (cur != null && cur.next != null) { // 指针遍历到链表末尾（最后一个元素的值大于等于x时）或者链表倒数第二个节点（最后一个元素可能小于x可能大于等于x）结束遍历
            if (cur.next.val < x) { // 2) 之后从cur开始遍历，删除小于x的元素并将其插入到pre节点之后
                ListNode removed = cur.next;
                cur.next = cur.next.next;
                removed.next = pre.next; // 总是插入到哨兵pre的后面
                pre.next = removed;
                pre = pre.next; // 每次插入节点后pre指针需要向后移动（保证有序性，不更新则成为头插法）
            } else { // 下一节点的值大于等于x时才将cur指针后移，同时哨兵pre不能更新
                cur = cur.next;
            }
        }
        return dummyHead.next;
    }
}

// 模拟解法
/*class Solution {
    public ListNode partition(ListNode head, int x) {
        ListNode small = new ListNode(0);
        ListNode smallHead = small; // 前半部分链表的 dummyHead 指针
        ListNode large = new ListNode(0);
        ListNode largeHead = large; // 后半部分链表的 dummyHead 指针
        ListNode cur = head;
        while (cur != null) {
            if (cur.val < x) {
                small.next = cur;
                small = small.next;
            } else {
                large.next = cur;
                large = large.next;
            }
            cur = cur.next;
        }
        small.next = largeHead.next;
        large.next = null; // 不能少了词条语句：代表到达链表末尾，否则：Error - Found cycle in the ListNode
        return smallHead.next;
    }
}*/
```

tips：

- 思路与92题相似（这里的cur指针与92题point指针功能不同：92题point指针是静态的总是指向同一节点因为其后的一部分节点都需要插入，不需要条件判断，而此题cur指针是动态的因为并非cur指针其后的元素都可以插入，需要条件判断。**pre指针相当于一个动态的哨兵，而92题的guard指针相当于一个静态的哨兵**，此题的dummyHead指针功能与92题相同，用于头节点head为一大于等于x的元素以便于在head节点前插入元素的功能，也用于返回头节点），也结合了83题条件更新cur指针的思路。

### 328. [Odd Even Linked List](https://leetcode-cn.com/problems/odd-even-linked-list/) 奇偶链表

给定一个单链表，把所有的奇数节点和偶数节点分别排在一起。请注意，这里的奇数节点和偶数节点指的是节点编号的奇偶性，而不是节点的值的奇偶性。请尝试使用原地算法完成。你的算法的空间复杂度应为 O(1)，时间复杂度应为 O(nodes)，nodes 为节点总数。应当保持奇数节点和偶数节点的相对顺序。链表的第一个节点视为奇数节点，第二个节点视为偶数节点，以此类推。  
示例：  
输入：2->1->3->5->6->4->7->NULL  
输出：2->3->6->7->1->5->4->NULL

思路：  
原地：使用插入法+哨兵的思路，迭代求解。此题pre指针相当于一个动态的哨兵。  
模拟：维护两个链表，一个链表其中都为原链表奇数位置的节点另一个链表都为原链表偶数位置的节点。

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

 // 原地解法
class Solution {
    public ListNode oddEvenList(ListNode head) {
        if (head == null || head.next == null) return head; // 或运算，先判断head不为空才会继续判断head.next是否为空，故不会发生空指针异常
        ListNode pre = head, cur = head.next;
        // 从cur（第一个偶数位置节点）开始遍历，删除其后奇数位置的元素并将其插入到pre节点之后
        while (cur != null && cur.next != null) { // 指针遍历到链表末尾（链表长度为偶数时）或者链表倒数第二个节点（链表长度为奇数时）：cur指针总是在偶数位置
            ListNode removed = cur.next;
            cur.next = cur.next.next;
            removed.next = pre.next; // 总是插入到哨兵pre的后面
            pre.next = removed;
            pre = pre.next; // 每次插入节点后pre指针需要向后移动（保证有序性，不更新则成为头插法）
            cur = cur.next; // 这里的cur指针无需再判断条件而更新（移动），插入元素后cur指针指向的元素从偶数位移动到了奇数位置，cur指针后移一位即可
        }
        return head;
    }
}

// 模拟解法
/*class Solution {
    public ListNode oddEvenList(ListNode head) {
        if (head == null || head.next == null) return head;
        ListNode oddHead = head, evenHead = head.next;
        ListNode odd = head, even = head.next;
        ListNode cur = head.next.next;
        while (cur != null) {
            odd.next = cur;
            even.next = cur.next;
            odd = odd.next;
            even = even.next;
            if (cur.next == null) break; // 当链表长度为奇数时，防止空指针异常：cur指针总是在奇数位置
            cur = cur.next.next;
        }
        odd.next = evenHead;
        return oddHead;
    }
}*/
```

tips：

- 思路与86题相同。

### 147. [Insertion Sort List](https://leetcode-cn.com/problems/insertion-sort-list/) 对链表进行插入排序

对链表进行插入排序。从第一个元素开始，该链表可以被认为已经部分排序。每次迭代时，从输入数据中移除一个元素，并原地将其插入到已排好序的链表中。插入排序是迭代的，每次只移动一个元素，直到所有元素可以形成一个有序的输出列表。每次迭代中，插入排序只从输入数据中移除一个待排序的元素，找到它在序列中适当的位置，并将其插入。重复直到所有输入数据插入完为止。  
示例：  
输入：-1->5->3->4->0  
输出：-1->0->3->4->5

思路：  
插入法，插入排序。维护一个有序序列，初始时有序序列只有一个元素，每次将一个新的元素插入到有序序列中，将有序序列的长度增加 1，直到全部元素都加入到有序序列中。  
算法优化：当前需要插入元素的值大于等于有序链表的最后一个元素则后移cur指针跳出循环以判断下一个待插入元素。作用：也省去了 1）记录与更新有序序列的长度与当前查找次数的工作（当前查找次数应小于等于有序序列长度）；2）pre指针可能会达链表末尾（查找插入位置过程中还需判断pre != null）

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
class Solution {
    public ListNode insertionSortList(ListNode head) {
        ListNode dummyHead = new ListNode();
        dummyHead.next = head;
        ListNode cur = head; // 被删除元素（需插入元素）的前一元素的指针
        while (cur != null && cur.next != null) {
            ListNode removed = cur.next; // 被删除的元素，也即当前轮次需要插入的元素（需要在原链表先删除）
            int val = removed.val;
            if (val >= cur.val) { // **算法优化**：当前需要插入元素的值大于等于有序链表的最后一个元素则后移cur指针跳出循环以判断下一个待插入元素
                cur = cur.next;
                continue;
            } // 当前需要插入元素的值小于有序链表的最后一个元素则无需更新cur指针
            cur.next = cur.next.next;
            ListNode pre = dummyHead; // 指针：需要插入节点的前一节点（一个动态的哨兵，每次查找插入位置都需要重置为链表头节点）
            while (val > pre.next.val) pre = pre.next; // 查找插入位置
            removed.next = pre.next;
            pre.next = removed;
        }
        return dummyHead.next;
    }
}
```

tips：

- 时间复杂度：O(n^2)
- 空间复杂度：O(1)

## Ⅳ Merge Sort 归并排序

利用归并的思想，采用分治策略（将问题分成一些小的问题然后递归求解，而治的阶段则将分的阶段得到的各答案“修补”在一起，即分而治之）。分阶段为递归拆分子序列的过程（不进行任何排序操作），治阶段需要将两个已经有序的子序列合并成一个有序序列。编写递归函数，每一次都一分为二拆分序列的子区间，然后在方法栈弹出的时候，一步一步合并两个有序序列，最后完成排序工作。「合并两个有序序列」的步骤利用了序列的部分有序性。

### 23. [Merge k Sorted Lists](https://leetcode-cn.com/problems/merge-k-sorted-lists/) 合并K个升序链表

给你一个链表数组，每个链表都已经按升序排列。请你将所有链表合并到一个升序链表中，返回合并后的链表。k == lists.length，0 <= k <= 10^4。  
示例：  
输入：lists = [[1,4,5],[1,3,4],[2,6]]  
输出：[1,1,2,3,4,4,5,6]

思路：  
归并排序的思路。mergeTwoLists 方法用于治，与21题迭代方式相同，用于两个排序链表的合并。在 merge 方法中实现分，通过递归实现。分阶段为递归拆分子序列的过程（不进行任何排序操作），治阶段需要将两个已经有序的子序列合并成一个有序序列。  
![](/images/2021-04-30-linked-list-algorithm/23.png)

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
class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        if (lists.length == 0) return null;
        return merge(lists, 0, lists.length - 1);
    }
 
    private ListNode merge(ListNode[] lists, int left, int right) {
        if (left == right) return lists[left];
        if (left + 1 == right) return mergeTwoLists(lists[left], lists[right]);
        int mid = left + (right - left) / 2;
        ListNode l1 = merge(lists, left, mid);
        ListNode l2 = merge(lists, mid + 1, right);
        return mergeTwoLists(l1, l2);
    }

    private ListNode mergeTwoLists(ListNode l1, ListNode l2) {
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
}
```

tips：

- 时间复杂度：O(nklogk)
- 空间复杂度：O(logk)，递归会使用到 O(logk) 代价的栈空间

### 148. [Sort List](https://leetcode-cn.com/problems/sort-list/) 排序链表

给你链表的头结点 `head` ，请将其按 升序 排列并返回 排序后的链表。在 `O(n log n)` 时间复杂度和常数级空间复杂度下，对链表进行排序。  
示例：  
输入：head = [-1,5,3,4,0]  
输出：[-1,0,3,4,5]

思路：  
1）归并排序：mergeTwoLists 方法用于治，与21题迭代方式相同，用于两个排序链表的合并。在 sortList 方法中实现分，通过递归实现。分阶段为递归拆分子序列的过程（不进行任何排序操作，**使用快慢指针寻找链表的中点**），治阶段需要将两个已经有序的子序列合并成一个有序序列。  
2）迭代：模拟归并排序递归过程  
将链表拆分成子链表进行合并。定义 subLen 表示每次需要排序的子链表的长度（初始值为1）；每次将链表拆分成若干个长度为 subLen 的子链表（最后一个子链表的长度可以小于 subLen，最后一个子链表可能为合并用第一个或者第二个子链表），按照每两个子链表一组进行合并，合并后即可得到若干个长度为 subLen×2 的有序子链表（最后一个子链表的长度可以小于 subLen×2），合并两个子链表与21题迭代方式相同；每次当前分组情况全部排序合并完毕后，将 subLen 的值增大一倍，进行下一分组情况的排序，对更长的有序子链表进行合并操作，直到有序子链表的长度大于或等于链表长度 len，整个链表排序完毕。每个长度为 subLen 的子链表已经有序，合并两个长度为 subLen 的有序子链表，得到长度为 subLen×2 的子链表，一定也是有序的。

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

// 迭代解法：模拟归并排序递归过程 tc: O(nlogn) sc: O(1)
class Solution {
    public ListNode sortList(ListNode head) {
        int len = 0; // 链表长度
        ListNode node = head;
        while (node != null) {
            len++;
            node = node.next;
        }
        ListNode dummyHead = new ListNode();
        dummyHead.next = head;
        for (int subLen = 1; subLen < len; subLen <<= 1) {
            ListNode pre = dummyHead, cur = dummyHead.next;
            while (cur != null) {
                ListNode head1 = cur;
                for (int i = 1; i < subLen && cur.next != null; i++) cur = cur.next; // 合并用第一个子链表不会为空
                ListNode head2 = cur.next; // 合并用第二个子链表可能为空
                cur.next = null;
                cur = head2;
                for (int i = 1; i < subLen && cur != null && cur.next != null; i++) cur = cur.next; // 第二个子链表可能为空
                ListNode next = null;
                if (cur != null) {
                    next = cur.next;
                    cur.next = null;
                }
                ListNode merged = mergeTwoLists(head1, head2);
                pre.next = merged;
                while (pre.next != null) pre = pre.next;
                cur = next;
            }
        }
        return dummyHead.next;
    }

    private ListNode mergeTwoLists(ListNode l1, ListNode l2) { // 合并两个有序链表的方法
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
}

// 归并排序解法 tc: O(nlogn) sc: O(logn)
/*class Solution {
    public ListNode sortList(ListNode head) { // 在回溯的过程中不断合并两个有序链表
        if (head == null || head.next == null) return head; // 递归结束条件，head是否为空的判断条件用于当原链表为空时直接返回null
        ListNode slow = head, fast = head.next; // 使用快慢指针寻找链表的中点，快指针每次移动 2 步，慢指针每次移动 1 步，当快指针到达链表末尾时，慢指针指向的链表节点即为链表的中点
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        } // 退出循环后slow指针位于链表中位，后以中位为分界，将链表拆分成两个子链表
        ListNode mid = slow.next; // mid指向二分链表后半部分的头节点
        slow.next = null; // 将二分链表前半部分的末尾置空
        return mergeTwoLists(sortList(head), sortList(mid));
    }

    private ListNode mergeTwoLists(ListNode l1, ListNode l2) { // 合并两个有序链表的方法
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

- 时间复杂度：O(nlogn)
- 空间复杂度：O(logn)，归并排序；O(1)，迭代：模拟归并排序递归过程

## Ⅴ General - Linked List & Math 常规 - 链表和数学

常规链表题目。以及使用到指针的数学题。

### 141. [Linked List Cycle](https://leetcode-cn.com/problems/linked-list-cycle/) 环形链表

给定一个链表，判断链表中是否有环。如果链表中有某个节点，可以通过连续跟踪 next 指针再次到达，则链表中存在环。 为了表示给定链表中的环，我们使用整数 pos 来表示链表尾连接到链表中的位置（索引从 0 开始）。 如果 pos 是 -1，则在该链表中没有环。pos 不作为参数进行传递，仅仅是为了标识链表的实际情况。如果链表中存在环，则返回 true 。否则，返回 false 。使用 O(1)（即，常量）内存解决此问题。链表中节点的数目范围是 [0, 104]。  
示例：  
输入：head = [3,2,0,-4], pos = 1  
![](/images/2021-04-30-linked-list-algorithm/141-title.png)  
输出：true  
解释：链表中有一个环，其尾部连接到第二个节点。

思路：  
数学+双指针。定义快慢指针，其初始值都为链表头节点，快指针每次走两步，慢指针每次走一步，快慢指针同时移动，当快慢都走了 t 次后相遇则代表链表为环形链表（当链表为环形链表时，t 为环中节点个数的倍数时快慢指针就会相遇，故对环形链表其快慢指针总会相遇）。  
![](/images/2021-04-30-linked-list-algorithm/141-answer.png)

题解：

```java
/**
 * Definition for singly-linked list.
 * class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode(int x) {
 *         val = x;
 *         next = null;
 *     }
 * }
 */
public class Solution {
    public boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null) {
            if (fast.next == null) return false; // 遍历到链表末尾（非环形奇数长度链表）则返回false
            fast = fast.next.next;
            slow = slow.next;
            if (fast == slow) return true; // 比较两节点的地址值而不是比较两节点的值
        }
        return false; // 遍历到链表末尾（非环形偶数长度链表）则返回false
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(1)

### 142. [Linked List Cycle II](https://leetcode-cn.com/problems/linked-list-cycle-ii/) 环形链表 II

给定一个链表，返回链表开始入环的第一个节点。 如果链表无环，则返回 null。为了表示给定链表中的环，我们使用整数 pos 来表示链表尾连接到链表中的位置（索引从 0 开始）。 如果 pos 是 -1，则在该链表中没有环。pos 仅仅是用于标识环的情况，并不会作为参数传递到函数中。不允许修改给定的链表。使用 O(1) 空间解决此题。  
示例：  
输入：head = [3,2,0,-4], pos = 1  
![](/images/2021-04-30-linked-list-algorithm/142.png)  
输出：返回索引为 1 的链表节点  
解释：链表中有一个环，其尾部连接到第二个节点。

思路：  
数学+双指针。定义快慢指针，其初始值都为链表头节点，快指针每次走两步，慢指针每次走一步，快慢指针同时移动，当快慢都走了 t 次后相遇则代表链表为环形链表（当链表为环形链表时，t 为环中节点个数的倍数时快慢指针就会相遇，故对环形链表其快慢指针总会相遇）。  
当快慢指针第一次相遇后：设链表共有 a+b 个节点，其中链表头部到链表环入口 有 a 个节点（不计链表环入口节点）， 链表环 有 b 个节点（a 和 b 是未知数），设两指针分别走了 f，s 步，则 fast 指针走的步数是 slow 指针走的步数的 2 倍，即 f=2s，fast 比 slow 多走了 n 个环的长度，即 f=s+nb（双指针都走过 a 步，然后在环内绕圈直到重合，重合时 fast 比 slow 多走环的长度整数倍），将以上两式相减得 s=nb，故 f=2nb，即 fast 和 slow 指针分别走了 2n，n 个环的周长（n 为未知数，不同链表的情况不同）。  
将指针从链表头部一直向前走并统计步数 k，则所有走到链表环入口节点时的步数为 k=a+nb（先走 a 步到达链表环入口节点，之后每绕 1 圈环即 b 步都会再次到入口节点）。因为当前 slow 指针走过的步数为 nb 步，只要让 slow 指针再走 a 步停下来，就可以到环的入口。  
使用双指针法，构建一个指针，此指针和 slow 指针同时向前走 a 步后，两者在链表环入口节点重合。从链表头部 head 走到链表环入口节点需要 a 步，故将 fast 指针重复利用，将其重新定义为上述构建的指针：将 fast 指针重新指向链表头部节点 head。  
slow 指针的位置不变，将 fast 指针（重定义后的指针）和 slow 指针同时向前移动一步（此时 f=0，s=nb），当 fast 指针走到 f=a 步时，slow 指针走到 s=a+nb 步，此时两指针重合（即对于环链表，此两指针一定会相遇）并同时指向链表环入口，返回 slow 指针指向的节点。

题解：

```java
/**
 * Definition for singly-linked list.
 * class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode(int x) {
 *         val = x;
 *         next = null;
 *     }
 * }
 */
public class Solution {
    public ListNode detectCycle(ListNode head) {
        ListNode slow = head, fast = head; // 快慢指针
        while (fast != null) {
            if (fast.next == null) return null; // 遍历到链表末尾（非环形奇数长度链表）则返回null
            fast = fast.next.next;
            slow = slow.next;
            if (fast == slow) break;
        }
        if (fast == null) return null; // 遍历到链表末尾（非环形偶数长度链表）则返回null
        fast = head; // 链表为环形链表，将fast指针重置指向头节点
        while (fast != slow) {
            fast = fast.next;
            slow = slow.next;
        }
        return slow;
    }
}
```

tips：

- 时间复杂度：O(n)
- 空间复杂度：O(1)

### 160. [Intersection of Two Linked Lists](https://leetcode-cn.com/problems/intersection-of-two-linked-lists/) 相交链表

编写一个程序，找到两个单链表相交的起始节点。如果两个链表没有交点，返回 null。在返回结果后，两个链表仍须保持原有的结构。可假定整个链表结构中没有循环。程序需满足 O(n) 时间复杂度，且仅用 O(1) 内存。  
示例：  
输入：intersectVal = 8, listA = [4,1,8,4,5], listB = [5,0,1,8,4,5], skipA = 2, skipB = 3  
![](/images/2021-04-30-linked-list-algorithm/160-title.png)  
输出：Reference of the node with value = 8  
解释：相交节点的值为 8 。从各自的表头开始算起，链表 A 为 [4,1,8,4,5]，链表 B 为 [5,0,1,8,4,5]。在 A 中，相交节点前有 2 个节点；在 B 中，相交节点前有 3 个节点。

思路：  
设「第一个公共节点」为 node，「链表 headA」的节点数为 a，「链表 headB」的节点数为 b，「两链表的公共尾部」的节点数为 c，则有：头节点 headA 到 node 前，共有 a−c 个节点，头节点 headB 到 node 前，共有 b−c 个节点。构建两个节点指针 cur，cur2 分别指向两链表头节点 headA，headB，指针 cur 先遍历完链表 headA ，再开始遍历链表 headB，当走到 node 时，共走步数为 a+(b−c)，指针 cur2 先遍历完链表 headB ，再开始遍历链表 headA，当走到 node 时，共走步数为 b+(a−c)，此时指针 cur，cur2 重合（ a+(b−c) = b+(a−c) ），并有两种情况：若两链表有公共尾部 (即 c>0 ) ，指针 cur，cur2 同时指向「第一个公共节点」node；若两链表无公共尾部 (即 c=0 ) ，指针 cur，cur2 同时指向 null。返回 cur 指针指向的节点即可。  
![](/images/2021-04-30-linked-list-algorithm/160-answer.png)

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
            cur = cur != null ? cur.next : headB;
            cur2 = cur2 != null ? cur2.next : headA;
        }
        return cur;
    }
}
```

tips：

- 时间复杂度：O(a+b)，a和b分别为两链表的长度
- 空间复杂度：O(1)

### 237. [Delete Node in a Linked List](https://leetcode-cn.com/problems/delete-node-in-a-linked-list/) 删除链表中的节点

请编写一个函数，使其可以删除某个链表中给定的（非末尾）节点。传入函数的唯一参数为 要被删除的节点。链表至少包含两个节点。链表中所有节点的值都是唯一的。给定的节点为非末尾节点并且一定是链表中的一个有效节点。不要从你的函数中返回任何结果。  
示例：  
输入：head = [4,5,1,9], node = 5  
输出：[4,1,9]  
解释：给定你链表中值为 5 的第二个节点，那么在调用了你的函数之后，该链表应变为 4 -> 1 -> 9

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
    public void deleteNode(ListNode node) {
        node.val = node.next.val; // 将当前节点的值设置为下一节点的值
        node.next = node.next.next; // 删除下一节点
    }
}
```

tips：

- 时间复杂度：O(1)
- 空间复杂度：O(1)