---
layout: post
title: 链表结构-相关算法
description: 抽出LeetCode题库中链表结构相关的算法题目，再以相似类型的题目进行分类归纳总结题解。
category: 技术

---

## introduction 

抽出LeetCode题库中链表结构相关的算法题目，再以相似类型的题目进行分类归纳总结题解。  
并非每道题目的解法都是它的最优写法，只是在尽量保证代码执行高效性的前提下，为了归纳总结便于记忆而给定的解法，故这里每道题的题解也都只列出了一种写法。

## Ⅰ Pointers 指针

对于引用类型（eg：链表中的节点）：  
指针即代表一种引用（对象/引用类型的引用），**指向引用对象的地址值**，**用于操作指向（引用）对象的成员变量**。eg：ListNode removed = point.next; point.next = point.next.next;，removed 即为一指针：指向 point 的成员变量 next 也即 point 的下一节点（point 的下一节点对象的引用/地址）；而 point.next 并非指针，代表 point 对象的成员变量 next 也即 point 的下一节点，point.next = point.next.next 为将 point 对象的成员变量 next 更新为 point.next.next，即将 point 的下一节点更新为 point 的后一节点。

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

### 234. [Palindrome Linked List](https://leetcode-cn.com/problems/palindrome-linked-list/) 回文链表

请判断一个链表是否为回文链表。用 O(n) 时间复杂度和 O(1) 空间复杂度解决此题。  
示例：  
输入：1->2->1  
输出：true

思路：  
双指针。cur指针用于反转链表。

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

### 83. [Remove Duplicates from Sorted List](https://leetcode-cn.com/problems/remove-duplicates-from-sorted-list/) 删除排序链表中的重复元素

存在一个按升序排列的链表，给你这个链表的头节点 `head` ，请你删除所有重复的元素，使每个元素 只出现一次 。返回同样按升序排列的结果链表。  
示例：  
输入：head = [1,1,2,3,3]  
![](/images/2021-04-30-list-algorithm/83.jpg)  
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

## Ⅱ Insertion Method 插入法

使用插入法的相关链表题目，头插法属于插入法。

时间复杂度：O(n)  
空间复杂度：O(1)

### 92. [Reverse Linked List II](https://leetcode-cn.com/problems/reverse-linked-list-ii/) 反转链表 II

给你单链表的头指针 head 和两个整数 left 和 right ，其中 left <= right 。请你反转从位置 left 到位置 right 的链表节点，返回 反转后的链表 。  
示例：  
输入：head = [1,2,3,4,5], left = 2, right = 4  
![](/images/2021-04-30-list-algorithm/92.jpg)  
输出：[1,4,3,2,5]

思路：  
使用头插法（插入法）+哨兵的思路，迭代求解。此题guard指针相等于一个静态的哨兵。

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

### 86. [Partition List](https://leetcode-cn.com/problems/partition-list/) 分隔链表

给你一个链表的头节点 head 和一个特定值 x ，请你对链表进行分隔，使得所有 小于 x 的节点都出现在 大于或等于 x 的节点之前。你应当 保留 两个分区中每个节点的初始相对位置。  
示例：  
输入：head = [1,4,3,2,5,2], x = 3  
![](/images/2021-04-30-list-algorithm/86.jpg)  
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