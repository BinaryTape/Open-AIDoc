[//]: # (title: 进度保证)
[//]: # (description: 了解如何在 Lincheck 中检查算法的无障碍性 (obstruction-freedom)。)

许多并发算法提供[非阻塞进度保证](https://en.wikipedia.org/wiki/Non-blocking_algorithm)，例如无等待性 (wait-freedom)、无锁性 (lock-freedom) 或无障碍性 (obstruction-freedom)。

Lincheck 仅支持验证无障碍性 (obstruction-freedom)。然而，由于无锁算法和无等待算法也是无障碍的，因此任何违反无障碍性的情况也意味着违反了那些更强的保证。

使用 `checkObstructionFreedom` 选项来验证程序的无障碍性保证：

```kotlin
@Test
fun modelCheckingTest() = ModelCheckingOptions()
   .checkObstructionFreedom()
   .check(this::class)
```

> `checkObstructionFreedom` 选项仅适用于 [模型检查 (model checking)](lincheck-testing-strategies.md#model-checking) 策略。
>
{style="warning"}

Lincheck 通过检查当所有其他线程都暂停时，某个线程是否可以继续执行来验证无障碍性。如果一个线程的执行[卡在循环中](lincheck-testing-strategies-options.md#stalled-execution-detection)，Lincheck 会报告一个活动锁。

如果某些函数是有意阻塞的，你可以使用 [`@Operation(blocking = true)`](lincheck-operation-execution-options.md#blocking-operations) 对其进行标记，以防止误报。

## 示例：测试 `ConcurrentHashMap` 的无障碍性

在此示例中，你将测试 `ConcurrentHashMap` 结构的 `put()` 函数。

1. 创建一个 `ConcurrentHashMapTest.kt` 文件。
2. 为 `ConcurrentHashMap` 结构创建一个测试类并声明 `put()` 函数：

   ```kotlin
   class ConcurrentHashMapTest {
       private val map = ConcurrentHashMap<Int, Int>()

       @Operation
       fun put(key: Int, value: Int) = map.put(key, value)
   }
   ```

3. 声明一个启用了 `checkObstructionFreedom()` 选项的测试函数：

    ```kotlin
    @Test
    fun modelCheckingTest() = ModelCheckingOptions()
        .checkObstructionFreedom()
        .threads(2)
        .actorsPerThread(1)
        .check(this::class)
   ```
   
   [`threads`](lincheck-testing-strategies-options.md#scenario-generation) 和 [`actorsPerThread`](lincheck-testing-strategies-options.md#scenario-generation) 选项用于减少潜在的执行场景数量。这些选项不会改变测试的通过/失败状态，但会显著缩短测试时间。

4. 运行测试。它应该失败并显示以下报告：

   ```text
   = The algorithm should be non-blocking, but an active lock is detected =
   | --------------------- |
   | Thread 1  | Thread 2  |
   | --------------------- |
   | put(1, 0) | put(1, 1) |
   | --------------------- |
   
   The following interleaving leads to the error:
   | -------------------------------------------------------------------------------------------------------------- |
   |                                          Thread 1                                          |     Thread 2      |
   | -------------------------------------------------------------------------------------------------------------- |
   | put(1, 0): <hung>                                                                          |                   |
   |   map.put(1, 0)                                                                            |                   |
   |     putVal(1, 0, false)                                                                    |                   |
   |       spread(1): 1                                                                         |                   |
   |       table ➜ null                                                                         |                   |
   |       loop(1 iterations) at ConcurrentHashMap.putVal(ConcurrentHashMap.java:1016)          |                   |
   |         <iteration 1>                                                                      |                   |
   |           initTable()                                                                      |                   |
   |             loop(1 iterations) at ConcurrentHashMap.initTable(ConcurrentHashMap.java:2293) |                   |
   |             table ➜ null                                                                   |                   |
   |             switch                                                                         |                   |
   |                                                                                            | put(1, 1): <hung> |
   | -------------------------------------------------------------------------------------------------------------- |
   ```

5. 在 `put()` 函数注解中添加 `blocking = true` 选项：

   ```kotlin
   @Operation(blocking = true)
   fun put(key: Int, value: Int) = map.put(key, value)
   ```

6. 重新运行测试。它应该会成功通过。

## 示例：测试 `ConcurrentSkipListMap` 的无障碍性

在此示例中，你将测试非阻塞 `ConcurrentSkipListMap` 结构的 `put()` 函数。

1. 创建一个 `ConcurrentSkipListMapTest.kt` 文件。
2. 为 `ConcurrentSkipListMap` 结构创建一个测试类并声明 `put()` 函数：

    ```kotlin
    class ConcurrentSkipListMapTest {
        private val map = ConcurrentSkipListMap<Int, Int>()
   
        @Operation
        fun put(key: Int, value: Int) = map.put(key, value)
    }
    ```

3. 声明一个启用了 `checkObstructionFreedom()` 选项的测试函数：

    ```kotlin
    @Test
    fun modelCheckingTest() = ModelCheckingOptions()
        .checkObstructionFreedom()
        .check(this::class)
    ```

4. 运行测试。它应该会成功通过。

## 另请参阅

* [配置实参生成约束](lincheck-argument-generation-constraints.md)
* [配置操作执行](lincheck-operation-execution-options.md)
* [验证执行结果](lincheck-results-validation.md)