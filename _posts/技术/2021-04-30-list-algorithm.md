---
layout: post
title: 链表结构-相关算法
description: 抽出LeetCode题库中链表结构相关的算法题目，再以相似类型的题目进行分类归纳总结题解。
category: 技术
---

## introduction 
抽出LeetCode题库中链表结构相关的算法题目，再以相似类型的题目进行分类归纳总结题解。  
并非每道题目的解法都是它的最优写法，只是在尽量保证代码执行高效性的前提下，为了归纳总结便于记忆而给定的解法，故这里每道题的题解也都只列出了一种写法。

## Ⅰ General - List 常规 - 链表
常规链表题目。

### 155. [Min Stack](https://leetcode-cn.com/problems/min-stack/) 最小栈

设计一个支持 `push` ，`pop` ，`top` 操作，并能在常数时间内检索到最小元素的栈。pop、top 和 getMin 操作总是在 非空栈 上调用。  
push(x) —— 将元素 x 推入栈中。  
pop() —— 删除栈顶的元素。  
top() —— 获取栈顶元素。  
getMin() —— 检索栈中的最小元素。  
示例：  
输入：["MinStack","push","push","push","getMin","pop","top","getMin"]  
[[],[-2],[0],[-3],[],[],[],[]]  
输出：[null,null,null,null,-3,null,0,-2]

思路：  
使用链表来实现，每一个节点都会存储当前栈（链表）中的最小元素，所以当pop删除栈顶元素时，如果当前删除元素为最小元素，下一个栈顶元素节点获取最小元素时也不会包括上一个被删除的元素。

题解：

```java
class MinStack {

    private Node head;

    /** initialize your data structure here. */
    public MinStack() {
        
    }
    
    public void push(int val) {
        if (head == null) {
            head = new Node(val, val);
        } else {
            head = new Node(val, Math.min(val, head.minVal), head);
        }
    }
    
    public void pop() {
        head = head.next;
    }
    
    public int top() {
        return head.val;
    }
    
    public int getMin() {
        return head.minVal;
    }

    private class Node {

        int val;
        int minVal;
        Node next;
        
        Node(int val, int minVal) {
            this(val, minVal, null);
        }

        Node(int val, int minVal, Node next) {
            this.val = val;
            this.minVal = minVal;
            this.next = next;
        }
    }
}

/**
 * Your MinStack object will be instantiated and called as such:
 * MinStack obj = new MinStack();
 * obj.push(val);
 * obj.pop();
 * int param_3 = obj.top();
 * int param_4 = obj.getMin();
 */
```

tips：

- this关键字用来访问本类内容，用法有三种：在本类的成员方法中访问本类的成员变量；在本类的成员方法中访问本类的另一个成员方法；在本类的构造方法中访问本类的另一个构造方法。此题创建对象使用到了第三种用法；
- 时间复杂度：O(1)；
- 空间复杂度：O(n)，其中 n 为总操作数。最坏情况下会连续插入 n 个元素，此时栈占用的空间为 O(n)。