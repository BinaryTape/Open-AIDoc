[//]: # (title: 概览)
[//]: # (description: Lincheck 是一个用于在 JVM 上测试并发代码的框架。Lincheck 会探索代码中潜在的线程交织，以发现导致错误行为的情况。) 

Lincheck 是一个用于在 JVM 上测试并发代码的框架。在运行测试时，Lincheck 会探索程序中潜在的线程交织，并报告那些导致错误行为的情况。

> 在 [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/get-started.html) 项目中，您只能使用 Lincheck 测试 JVM 上的代码。
> 
{style="note"}

在 Lincheck 中编写并发测试只需列出每个线程的操作和预期的断言。剩下的工作由 Lincheck 处理：

```kotlin
class CounterTest {
    @Test // 测试函数声明
    fun test() = Lincheck.runConcurrentTest {
        var counter = 0

        // 并发递增计数器
        val t1 = thread { counter++ }
        val t2 = thread { counter++ }

        // 等待线程完成
        t1.join()
        t2.join()

        // 检查两次递增是否均已应用
        assertEquals(2, counter)
    }
}
```

如果测试失败，Lincheck 会提供导致错误的线程交织和线程切换点：

```text
| ------------------------------------------------------------------------------- |
|                   Main Thread                   |   Thread 1    |   Thread 2    |
| ------------------------------------------------------------------------------- |
| thread(block = Lambda#2): Thread#1              |               |               |
| thread(block = Lambda#3): Thread#2              |               |               |
| switch (reason: waiting for Thread 1 to finish) |               |               |
|                                                 |               | run()         |
|                                                 |               |   counter ➜ 0 |
|                                                 |               |   switch      |
|                                                 | run()         |               |
|                                                 |   counter ➜ 0 |               |
|                                                 |   counter = 1 |               |
|                                                 |               |   counter = 1 |
| Thread#1.join()                                 |               |               |
| Thread#2.join()                                 |               |               |
| counter.element ➜ 1                             |               |               |
| assertEquals(2, 1): threw AssertionFailedError  |               |               |
| ------------------------------------------------------------------------------- |
```

## Lincheck 的工作原理

每次 JVM 运行并发代码时，跨线程的操作执行顺序可能会发生变化。例如，一个操作可能会被另一个线程中的不同操作中断。这本身并不是错误，但如果代码中存在并发错误（bug），则可能会导致错误。

![该图片比较了程序的执行场景与执行调度。在第一个执行调度中，操作按顺序执行。在第二个执行调度中，第一个操作被第二个操作中断。](scenario-vs-schedule.png){ width="700" }

> _执行场景_ 定义了操作如何分布在各个线程中，以及每个线程内的执行顺序。
> 
> _执行调度_（也称为 _线程交织_）定义了所有线程中所有操作的执行顺序。
>
{style="tip"}

Lincheck 实现了两种测试策略来寻找导致错误行为的执行调度：
* **模型检查**。Lincheck 通过在程序中插入显式的线程切换指令来控制调度。这些指令被放置在同步点或共享内存访问处。模型检查使 Lincheck 能够生成导致错误的精确执行跟踪。
* **压力测试**。由操作系统控制调度。Lincheck 会多次执行每个场景，以增加发现错误的几率。

## 探索 Lincheck

* 在 [Lincheck 快速入门](lincheck-getting-started.md) 中逐步学习 Lincheck 功能。
* 在 Lincheck 中了解[测试并发数据结构的声明式方法](lincheck-how-to-test-data-structures.md)。

## 了解详情

* Nikita Koval 的 “我们如何在 Kotlin 协程中测试并发算法”：[视频](https://youtu.be/jZqkWfa11Js)。KotlinConf 2023
* Maria Sokolova 的 “Lincheck：在 JVM 上测试并发” 工作坊：[第一部分](https://www.youtube.com/watch?v=YNtUK9GK4pA)，[第二部分](https://www.youtube.com/watch?v=EW7mkAOErWw)。Hydra 2021
* Nikita Koval 等人的 “Lincheck：一个用于在 JVM 上测试并发数据结构的实用框架”：[论文](https://nikitakoval.org/publications/cav23-lincheck.pdf)。2023