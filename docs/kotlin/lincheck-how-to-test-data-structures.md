[//]: # (title: 如何测试数据结构)
[//]: # (description: 学习如何使用 Lincheck 测试并发数据结构：设置测试并了解测试过程的内部原理。)

Lincheck 为测试并发数据结构提供了一个声明式接口。您不需要描述如何执行测试，而是声明所有需要测试的操作，Lincheck 会生成并发执行方案，运行它们并分析结果。

让我们使用 Lincheck 测试这个 `Counter` 数据结构：

```kotlin
class Counter {
    var value = 0

    fun inc(): Int = ++value
    fun dec(): Int = --value
}
```

1. 创建一个测试类：

    ```kotlin
    class CounterTest {
    }
    ```

2. 创建一个存储该结构实例的类属性：

   ```kotlin
   private val c = Counter()
   ```

3. 将您想要测试的操作声明为成员函数，并为其添加 `@Operation` 注解：

    ```kotlin
    @Operation
    fun inc() = c.inc()
    
    @Operation
    fun dec() = c.dec()
    ```

    该注解告诉 Lincheck 在生成执行方案时应包含哪些方法。    

4. 使用 `ModelCheckingOptions()` 或 `StressOptions()` 声明一个测试函数作为成员函数。并为其添加 `@Test` 注解：

   ```kotlin
   @Test
   fun modelCheckingTest() = ModelCheckingOptions()
       .check(this::class)
   ```

   > 在[测试策略](lincheck-testing-strategies.md)文章中了解模型检查与压力测试之间的区别。
   >
   {style="tip"}

5. 运行测试。如果测试失败，Lincheck 会生成一份包含方案和导致错误行为的执行跟踪 (trace) 的错误报告：

    ```text
    = Invalid execution results =
    | -------------------- |
    | Thread 1  | Thread 2 |
    | -------------------- |
    | dec(): -1 | inc(): 1 |
    | -------------------- |
    ```

## 测试过程

在测试数据结构时，Lincheck 会生成一份执行方案列表，运行这些方案并分析结果。

考虑这个 `Counter` 数据结构：

![具有两个方法 `inc()` 和 `dec()` 的 `Counter` 数据结构图示](counter_structure.svg){width=150}

为了对其进行测试，Lincheck 会执行以下步骤：

1. 通过在不同线程中随机放置已声明的操作，生成随机执行方案列表：

   ![包含四个执行方案的图示。在每个方案中，操作以不同的顺序放置在两个线程中。](execution_scenarios.svg){width=400}

   您可以使用 Lincheck 提供的[配置选项](lincheck-testing-strategies-options.md#scenario-generation)来指定线程数量和每个线程的操作数量。

2. 使用指定的测试策略执行生成的方案：[模型检查或压力测试](lincheck-testing-strategies.md)。每个生成的方案都会执行多次，以检查不同的执行调度：

   ![包含四个执行调度的图示。所有调度都对应于同一个执行方案。在每个调度中，操作在不同的时间点相互中断。](execution_schedules.svg){width=400}

3. 根据正确性属性验证执行结果。默认情况下，该属性是[线性化](https://en.wikipedia.org/wiki/Linearizability)。

   ![验证过程图示。将一个执行调度的结果与按顺序执行相同操作的结果进行比较。](verification.svg){width=300}

   在此步骤中，如果提供了[验证函数](lincheck-results-validation.md)，Lincheck 还可以对结构进行验证。

## 示例：测试 Treiber 栈结构的实现

考虑这个 *错误* 的 [Treiber Stack](https://en.wikipedia.org/wiki/Treiber_stack) 实现：

```kotlin
import org.jetbrains.lincheck.*
import org.jetbrains.lincheck.annotations.*
import org.jetbrains.lincheck.strategy.managed.modelchecking.*
import java.util.concurrent.atomic.AtomicReference
import kotlin.test.*

class TreiberStack<E> {
    private val top = AtomicReference<Node<E>?>(null)

    fun push(item: E) {
        val newHead = Node(item)
        var oldHead: Node<E>?

        do {
            oldHead = top.get()
            newHead.next = oldHead
        } while (!top.compareAndSet(oldHead, newHead))
    }

    fun pop(): E? {
        val oldHead = top.get()

        if (oldHead == null) {
            return null
        }

        val newHead = oldHead.next
        top.compareAndSet(oldHead, newHead)

        // 错误：当 `pop()` 完成执行时，
        // 另一个线程可能已经弹出了这个项。
        return oldHead.item
    }

    private class Node<E>(
        val item: E,
        var next: Node<E>? = null
    )
}
```

您可以使用 Lincheck 测试此结构，以检查注入的错误如何影响程序的行为：

1. 创建一个测试结构：

    ```kotlin
   class TreiberStackTest {
       private val stack = TreiberStack<Int>()
  
       @Operation
       fun push(value: Int) = stack.push(value)
  
       @Operation
       fun pop(): Int? = stack.pop()
  
       @Test
       fun modelCheckingTest() = ModelCheckingOptions()
           .check(this::class)
   }
   ```

2. 运行测试。Lincheck 会生成一份错误报告，并提供导致错误行为的执行方案：

   ```text
   | ------------------------------ |
   |   Thread 1    |    Thread 2    |
   | ------------------------------ |
   | push(1): void |                |
   | ------------------------------ |
   | pop(): 1      | push(-1): void |
   | ------------------------------ |
   | pop(): -1     |                |
   | pop(): 1      |                |
   | ------------------------------ |
   ```

   该图示显示了操作在不同线程中的分布情况以及操作的返回值。Lincheck 还提供了导致错误结果的具体线程交错情况：

   ```text
   | ----------------------------------------------------- |
   |                  Thread 1                  | Thread 2 |
   | ----------------------------------------------------- |
   | push(1)                                    |          |
   | ----------------------------------------------------- |
   | pop(): 1                                   |          |
   |   stack.pop(): 1                           |          |
   |     top.get(): Node#1                      |          |
   |     switch                                 |          |
   |                                            | push(-1) |
   |     oldHead.getNext(): null                |          |
   |     top.compareAndSet(Node#1, null): false |          |
   |     oldHead.getItem(): 1                   |          |
   |   result: 1                                |          |
   | ----------------------------------------------------- |
   | pop(): -1                                  |          |
   | pop(): 1                                   |          |
   | ----------------------------------------------------- |
   ```

   由于该实现没有考虑到另一个线程可能会中断 `pop()` 函数，`pop()` 返回了两次 `1`，这本该是不可能的。

3. 修复数据结构。正确的实现会在返回结果之前将 `oldHead` 变量更新为最新值：

   ```kotlin
   fun pop(): E? {
       var oldHead: Node<E>?
       var newHead: Node<E>?
 
       do {
           oldHead = top.get()
           if (oldHead == null) return null
           newHead = oldHead.next
       } while (!top.compareAndSet(oldHead, newHead))
 
       return oldHead.item
   }
   ```

## 下一步

了解 Lincheck 中可用的[测试策略](lincheck-testing-strategies.md)。

## 相关内容

* [生成操作参数](lincheck-argument-generation-constraints.md)
* [配置操作执行选项](lincheck-operation-execution-options.md)
* [检查非阻塞进度保证](lincheck-progress-guarantees.md)
* [定义算法的顺序规范](lincheck-results-validation.md)