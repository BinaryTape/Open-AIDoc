[//]: # (title: 结果验证与校验)
[//]: # (description: 了解 Lincheck 如何验证并发执行的结果。)

在执行为并发数据结构生成的场景后，Lincheck 会根据指定的验证模型（例如，线性一致性）验证结果，并可选地根据用户提供的校验函数检查数据结构的最终状态。

## 验证

在验证过程中，Lincheck 会尝试在并发场景中寻找操作的顺序执行，以实现与并发执行相同的结果：

![Lincheck 中验证过程的图表。Lincheck 将并发执行与不同的顺序执行进行比较。](verification-process.svg){width=700}

根据 [验证模型](#verification-models)，顺序执行可能会受到额外的限制。如果没有符合验证属性的顺序执行能产生观察到的结果，Lincheck 就会报告错误。

### 顺序规范

默认情况下，在验证过程中，Lincheck 会使用 _并发_ 数据结构的操作来构建顺序执行。

你可以指定一个具有匹配操作的顺序数据结构，以便：
* 确保并发数据结构提供与顺序数据结构相同的结果。

  通常，单线程实现比线程安全实现更简单，因此更容易验证其正确性（例如 `HashMap` 和 `ConcurrentHashMap`、`LinkedList` 和 `ConcurrentLinkedQueue`）。

  通过比较两个版本结构的执行结果，你可以确保复杂的并发结构在单线程环境下的行为与更简单的结构相似。

* 在单个测试中同时验证顺序正确性和并发安全性。

![Lincheck 验证过程的图表。Lincheck 将并发执行与不同的顺序执行进行比较。顺序执行使用指定的结构顺序版本的操作。](verification-process-seq.svg){width=700}

要指定数据结构的顺序版本：

1. 实现一个数据结构，其中包含由 Lincheck 测试的所有并发函数的顺序版本。
2. 使用 `sequentialSpecification()` 选项指定该数据结构：

   ```kotlin
   @Test
   fun stressTest() = StressOptions()
       .sequentialSpecification(SequentialStructure::class)
       .check(this::class)
   ```

以下是一个 Lincheck 测试示例，它使用单线程 `LinkedList` 作为 `ConcurrentLinkedQueue` 的顺序规范：

```kotlin
class ConcurrentLinkedQueueTest {
    private val s = ConcurrentLinkedQueue<Int>()

    @Operation
    fun add(value: Int) = s.add(value)

    @Operation
    fun poll(): Int? = s.poll()

    @Test
    fun stressTest() = StressOptions()
        .sequentialSpecification(SequentialQueue::class.java)
        .check(this::class)
}

class SequentialQueue {
    private val s = LinkedList<Int>()

    fun add(x: Int) = s.add(x)
    fun poll(): Int? = s.poll()
}
```

### 验证模型

默认情况下，Lincheck 会根据线性一致性模型验证并发执行的结果。要应用不同的验证模型，请使用 `verifierClass` 选项：

```kotlin
@Test
fun modelCheckingTest() = ModelCheckingOptions()
   .verifierClass(SerializabilityVerifier::class)
   .check(this::class)
```

Lincheck 提供了以下验证器类：

* `LinearizabilityVerifier` – 默认选项。如果存在一种顺序执行能够保持并发执行中各操作之间的 [“happens-before”](https://en.wikipedia.org/wiki/Happened-before) 关系，则并发执行是有效的。
* `QuiescentConsistencyVerifier` – 使用 _静态一致性_ 模型，其工作原理与线性一致性模型类似，但 “happens-before” 约束不适用于标记了 `@QuiescentConsistent` 注解的操作：

   ```kotlin
   @Operation
   @QuiescentConsistent
   fun someOperation() = { ... }
   ```

   > `QuiescentConsistencyVerifier` 不会跟踪实际的 [静态点 (quiescent points)](https://bura.brunel.ac.uk/bitstream/2438/9717/1/Fulltext.pdf)。验证器可能会遗漏跨越静态点边界发生的错误。
   >
   {style="note"}

* `SerializabilityVerifier` – 使用 _可串行化_ 模型。如果存在某种顺序执行（以任何顺序）能导致与并发执行相同的结果，无论 “happens-before” 约束如何，该并发执行都是有效的。它可以用于并发操作的相对顺序无关紧要的结构。

#### 比较可串行化与线性一致性

为了理解这两个模型之间的区别，请看一个数据结构如何实现可串行化但不可线性化：

1. 考虑以下数据结构：

   ```kotlin
   class ConcurrentQueue {
       private val elements: MutableList<Int> = ArrayList()

       fun put(x: Int) = synchronized(this) {
           elements += x
       }

       fun poll(): Int? = synchronized(this) {
           if (elements.isEmpty()) return null
           elements.shuffle()
           elements.removeAt(0)
       }
   }
   ```

   这个并发结构的行为是不正确的：它像典型的队列一样存储元素，但会随机返回它们。

2. 实现该队列的顺序版本，使其正确地存储和返回元素：

   ```kotlin
   class SequentialQueue {
       private val elements: MutableList<Int> = ArrayList()
  
       fun put(x: Int) {
           elements += x
       }
  
       fun poll(): Int? = if (elements.isEmpty()) null else elements.removeAt(0)
   }
   ```

3. 创建一个测试类并声明 `put()` 和 `poll()` 操作：

   ```kotlin
   @Param(name = "value", gen = IntGen::class, conf = "1:2")
   class ConcurrentQueueTest {
       private val q = ConcurrentQueue()
  
       @Operation
       fun put(@Param(name = "value") x: Int) = q.put(x)
  
       @Operation
       fun poll(): Int? = q.poll()
   }
   ```

4. 声明并运行一个可串行化测试：

   ```kotlin
   @Test
   fun serializabilityTest() = ModelCheckingOptions()
       .actorsBefore(0)
       .actorsAfter(0)
       .actorsPerThread(2)
       .threads(2)
       // 根据可串行化进行验证
       .verifier(SerializabilityVerifier::class.java)
       // 指定结构的顺序版本
       .sequentialSpecification(SequentialQueue::class.java)
       .check(this::class.java)
   ```

   该测试应当成功通过。

5. 声明并运行一个线性一致性测试：

   ```kotlin
   @Test
   fun linearizabilityTest() = ModelCheckingOptions()
       .actorsBefore(0)
       .actorsAfter(0)
       .actorsPerThread(2)
       .threads(2)
       // 显示完整的失败场景
       .minimizeFailedScenario(false)
       // 指定结构的顺序版本
       .sequentialSpecification(SequentialQueue::class.java)
       .check(this::class.java)
   ```

   该测试应当失败并显示以下报告：

   ```text
   | -------------------- |
   | Thread 1  | Thread 2 |
   | -------------------- |
   |           | put(2)   |
   |           | put(1)   |
   | put(3)    |          |
   | poll(): 1 |          |
   | -------------------- |
   ```

6. 分析结果。

   由于可串行化测试通过了，因此存在 `SequentialQueue` 操作的 _某种_ 顺序能够产生 `poll(): 1`，例如：

   ![一个双线程场景中操作的动画，这些操作被重新排序为单线程场景。线程 2 首先执行，有两个操作：`put(2)`，然后是 `put(1)`。线程 1 其次执行，有两个操作：`put(3)`，然后是 `poll(): 1`。单线程场景的操作顺序如下：`put(1)`、`put(2)`、`put(3)`、`poll(): 1`。因为 `put(1)` 现在是第一个操作，`poll()` 正确返回了值 `1`。](reorder.gif){width=500}

   然而，线性一致性进一步限制了操作顺序：如果操作 `A` 在并发执行中于操作 `B` 开始之前完成，那么在顺序执行中 `A` 必须在 `B` 之前执行。线性一致执行的示例如下所示：

   ![一个双线程场景中操作的动画，这些操作被重新排序为单线程场景。线程 1 首先执行，有两个操作：`put(1)`，然后是 `put(2)`。线程 2 其次执行，有两个操作：`poll(): 1`，然后是 `poll(): 2`。单线程场景的操作顺序如下：`put(1)`、`put(2)`、`poll(): 1`、`poll(): 2`。所有 `poll()` 操作均返回正确的值。](reorderLin.gif){width=500}

   由于 Lincheck 在验证期间无法重新排序 `put()` 操作，因此它无法找到符合线性一致性限制的顺序执行。这导致了测试失败。

## 校验

默认情况下，Lincheck 在执行生成的场景后不会校验并发数据结构的状态。要检查最终状态，请在测试类的校验函数上使用 `@Validate` 注解：

```kotlin
@Validate
fun validate() {
    // 检查数据结构的某些属性
    // 如果违反了不变量，则抛出异常
    check(size >= 0) { "Size must be non-negative, but was $size" }
}
```

校验函数应当：
* 不接收任何参数。
* 如果数据结构处于无效状态，则抛出异常。

## 下一步

* [配置实参生成约束](lincheck-argument-generation-constraints.md)
* [配置操作执行选项](lincheck-operation-execution-options.md)
* [检查非阻塞进度保证](lincheck-progress-guarantees.md)