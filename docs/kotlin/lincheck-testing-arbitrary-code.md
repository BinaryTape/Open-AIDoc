[//]: # (title: 测试任意代码)
[//]: # (description: 了解如何使用 Lincheck 的 `runConcurrentTest()` 函数测试任意并发代码。)

Lincheck 提供了一个 `runConcurrentTest()` 函数来测试任意并发代码。

`runConcurrentTest()` 函数会多次执行一段并发代码块，并使用模型检查来探索其潜在的执行调度。

要使用 Lincheck 测试并发代码：

1. 创建一个测试类：

   ```kotlin
   class NewConcurrentTest {
       // 测试
   }
   ```

2. 使用 `runConcurrentTest()` 创建一个作为成员函数的测试函数。

   ```kotlin
   @Test
   fun test() = runConcurrentTest(100_000) {
       // 并发代码
   }
   ```

> 该函数参数是可选的；它指定了要探索的执行调度数量。
> 默认值为 `10_000`。
>
{style="tip"}

3. 运行测试。如果测试失败，Lincheck 会生成一份包含导致错误行为的执行调度的报告。

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

## 示例：测试 `ConcurrentHashMap` 函数

考虑下面针对 `ConcurrentHashMap` 函数的测试：

```kotlin
import org.jetbrains.lincheck.*
import java.util.concurrent.*
import kotlin.concurrent.*
import kotlin.test.*

// 此测试演示了由两个线程以相反顺序
// 执行嵌套的 `computeIfAbsent` 调用所导致的死锁。
class ConcurrentHashMapDeadlock {
   @Test
   fun test() = Lincheck.runConcurrentTest {
       val map = ConcurrentHashMap<String, String>()
       // 在锁定 `key1` 的同时更新 `key2`。
       val thread1 = thread {
           map.computeIfAbsent("key1") {
               map.computeIfAbsent("key2") { "value2" }
               "value1"
           }
       }
       // 在锁定 `key2` 的同时更新 `key1`。
       val thread2 = thread {
           map.computeIfAbsent("key2") {
               map.computeIfAbsent("key1") { "value1" }
               "value2"
           }
       }
      
       // 等待两个线程完成。
       thread1.join()
       thread2.join()
   }
}
```

由于 Lincheck 找到了一个会导致死锁的执行调度，测试失败：

1. 线程 2 将 `key2` 映射到索引为 1 的桶，在此桶上加锁，并开始执行 `computeIfAbsent("key1")`。在线程 2 映射 `key1` 并锁定具有 `key1` 的桶**之前**，执行从线程 2 切换到了线程 1。
2. 线程 1 将 `key1` 映射到索引为 0 的桶，在此桶上加锁，并开始执行 `computeIfAbsent("key2")`。线程 1 将 `key2` 映射到索引为 1 的桶并尝试锁定该桶，但它已经被线程 2 锁定。执行从线程 1 切换回线程 2。
3. 线程 2 尝试锁定具有 `key1` 的桶，但它已经被线程 1 锁定。

两个线程都被锁定，因此执行遇到了死锁。

![失败测试的 Lincheck 报告截图。](concurrenthashmapdeadlock.png){thumbnail="true" width=700}

## 后续步骤

了解如何[使用 Lincheck 测试数据结构](lincheck-how-to-test-data-structures.md)。

<!-- TODO: uncomment after the articles are published
## 另请参阅

* [Lincheck 中的模型检查](lincheck-model-checking.md)
* [Kotlin Multiplatform 项目中的 Lincheck](lincheck-kmp.md)
-->