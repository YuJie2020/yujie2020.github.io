---
layout: post
title: C语言中的数组和指针
description: C语言中的数组和指针
category: 技术
---

今天看《程序员面试宝典》时偶然看到讲数组和指针的存取效率，闲着无聊，就自己写了段小代码，简单分析一下C语言背后的汇编，可能很多人只注重C语言，但在实际应用当中，当出现问题时，有时候还是通过分析汇编代码能够解决问题。本文只是为初学者，大牛可以飘过~

C源代码如下：

	#include "stdafx.h"
	int main(int argc, char* argv[])
	{
	       char a=1;
	       char c[] = "1234567890";
	       char *p = "1234567890";
	       a = c[1];
	       a = p[1];
	       return 0;
	}
	
在VC6.0下查看汇编代码步骤：  
在main函数中靠前的部分随便一行F9设置断点->编译->F5
在调试界面中右键->Go to disassembly

Debug汇编代码（已加注释）：

	4:    #include "stdafx.h"
	5:
	6:    int main(int argc, char* argv[])
	7:    {
	00401010   push        ebp     
	00401011   mov         ebp,esp      ；保存栈帧
	00401013   sub         esp,54h        ；抬高栈顶
	00401016   push        ebx
	00401017   push        esi
	00401018   push        edi                     ；压入程序中用到的寄存器，以便恢复
	00401019   lea         edi,[ebp-54h]             
	0040101C   mov         ecx,15h
	00401021   mov         eax,0CCCCCCCCh
	00401026   rep stos    dword ptr [edi]    ；栈顶与栈帧之间的数据填充为0xcc，相当于汇编中的int 3，这是因为debug模式下把Stack上的变量都初始化为0xcc，检查未初始化的问题
	8:        char a=1;
	00401028   mov         byte ptr [ebp-4],1      ；ebp-4是为变量a分配的空间地址
	9:        char c[] = "1234567890";
	0040102C   mov         eax,[string "1234567890" (0042201c)]
	00401031   mov         dword ptr [ebp-10h],eax   ；“1234567890”是字符串常量，存储在地址0042201c处，ebp-10是为数组C分配的空间的首地址，空间大小从ebp-0x10到ebp-0x04，共12个字节。本句中先把“1234”这4个字节拷贝到数组C中
	00401034   mov         ecx,dword ptr [string "1234567890" 4 (00422020)]
	0040103A   mov         dword ptr [ebp-0Ch],ecx  ；作用同上，把“5678”这4个字节拷贝到数组C中
	0040103D   mov         dx,word ptr [string "1234567890" 8 (00422024)]
	00401044   mov         word ptr [ebp-8],dx   ；作用同上，把“90”这2个字节拷贝到C中
	00401048   mov         al,[string "1234567890" 0Ah (00422026)]
	0040104D   mov         byte ptr [ebp-6],al    ；这个大家都熟，不要忘了\0
	10:       char *p = "1234567890";
	00401050   mov         dword ptr [ebp-14h],offset string "1234567890" (0042201c) ；ebp-0x14是为指针p分配的空间地址，大小是4个字节，地址中的值是字符串“1234567890”的首地址
	11:       a = c[1];
	00401057   mov         cl,byte ptr [ebp-0Fh]  ；这里是重点，因为数组C在栈上连续存储，很容易根据ebp找到第其中一个字符的地址，并取值，赋给cl
	0040105A   mov         byte ptr [ebp-4],cl     ；完成赋值
	12:       a = p[1];
	0040105D   mov         edx,dword ptr [ebp-14h]  ；这里与上面就有区别，因为根据ebp只知道指针p的值，先得到p的值，即先得到一个指针
	00401060   mov         al,byte ptr [edx 1]    ；根据得到的指针间接的找到字符串中的一个字符
	00401063   mov         byte ptr [ebp-4],al
	13:       return 0;
	00401066   xor         eax,eax         ；eax清0，作为main函数的返回值
	14:   }
	00401068   pop         edi
	00401069   pop         esi
	0040106A   pop         ebx
	0040106B   mov         esp,ebp
	0040106D   pop         ebp     ；恢复ebp
	0040106E   ret
	
好了，可以看到，用数组访问元素，只需2步，而用指针时要3步。可见数组和指针并不相同，有时候大家都认为可以把数组的名称看成一个指针，这种想法有时候没错，但有时候却会出错。我再举一个简单的例子，而下面的这个例子可能是大家在开发过程中经常会碰到的问题。

在文件test.cpp中：

	#include "stdafx.h"
	#include "inc.h"
	extern char chTest[10];
	int main(int argc, char* argv[])
	{
	       printf("chTest=%s\n", chTest);
	       return 0;
	}
	
上面有个extern声明，表明chTest数组是在外部文件中定义过的。chTest定义在inc.h中：  
`char chTest[10]="123456789";`

上述的程序，经编译后，可以成功运行。但如果把红色的代码改成如下：  
`extern char *chTest;`

这时，程序在编译的时候就会通不过，提示的错误信息是：redefinition; different types of indirection，但这时候并没有错误出现在哪一行的说明，如果是在开发一个大型工程，那么就不容易定位问题出在哪个地方。造成上述错误的原因我想大家都明白了，就是因为当chTest作为一个指针被引用时，其元素访问的方式与数组是不同的，就算程序能编译通过，在运行时，也是会出现错误。
 
好了，上述的内容都是个人有感而发，是些简单零碎的东西，笑纳。如有哪些地方说的不合适，而望指正！