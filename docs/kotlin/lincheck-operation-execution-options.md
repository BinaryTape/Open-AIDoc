[//]: # (title: 操作执行选项)
[//]: # (description: 了解 Lincheck 对于并发操作的执行选项。)

Lincheck 提供了一组选项，用于控制特定操作的执行方式，例如在单个线程上运行操作、仅执行一次操作、将操作标记为阻塞等。

在本文中，你将了解不同的执行选项以及如何设置它们。

## 单线程操作组

某些操作要求永远不要并发运行，例如单生产者单消费者队列中的操作。

要创建一个永远不会并行执行的操作组，请在声明操作时使用 `nonParallelGroup` 选项：

```kotlin
@Operation(nonParallelGroup = "consumers")
fun poll(): Int? = queue.poll()

@Operation(nonParallelGroup = "consumers")
fun peek(): Int? = queue.peek()

@Operation(nonParallelGroup = "producer")
fun offer(x: Int) = queue.offer(x)

@Operation
fun isEmpty(): Boolean = queue.isEmpty()
```

Lincheck 确保非并行组中的操作永远不会相互并行执行。然而，这些操作仍然可以与非并行组之外的操作并行运行：

```text
| --------------------- |
| Thread 1  | Thread 2  |
| --------------------- |
| poll()    | offer(0)  |
| peek()    | offer(0)  |
| poll()    | isEmpty() |
| poll()    | isEmpty() |
| isEmpty() | isEmpty() |
| --------------------- |
```

## 单次执行操作

使用 `runOnce` 选项可以使操作在每次测试调用中仅执行一次：

```kotlin
@Operation(runOnce = true)
fun foo() = struct.foo()

@Operation
fun buzz() = struct.buzz()
```

生成的方案示例：

```text
| ------------------- |
| Thread 1 | Thread 2 |
| ------------------- |
| buzz()   | foo()    |
| buzz()   | buzz()   |
| ------------------- |
```

## 阻塞操作

如果操作旨在阻塞执行，请使用 `blocking` 选项。如果测试检查[非阻塞保证](lincheck-progress-guarantees.md)，当执行在标记有 `blocking` 选项的操作上停滞时，Lincheck 不会使测试失败：

```kotlin
@Operation(blocking = true)
fun foo(): Int = struct.foo()
```

## 可取消操作

如果操作在[挂起时可以被取消](https://kotlinlang.org/docs/cancellation-and-timeouts.html#suspension-points-and-cancellation)，请使用 `cancellableOnSuspension` 选项：

```kotlin
@Operation(cancellableOnSuspension = true)
fun foo(): Int = struct.foo()
```

考虑以下通道测试：

```kotlin
@Param(name = "value", gen = IntGen::class, conf = "1:3")
class ChannelCancellableTest {
    private val ch = Channel<Int>()
    
    @Operation
    suspend fun send(@Param(name = "value") value: Int) = ch.send(value)
    
    @Operation(cancellableOnSuspension = true)
    suspend fun receive() = ch.receive()
  
  
    @Test
    fun test() = ModelCheckingOptions()
        .iterations(50)
        .invocationsPerIteration(1000)
        // 即使测试未失败也报告方案
        .logLevel(LoggingLevel.INFO)
        .check(this::class)
}
```

<table>
<tr><td><code>cancellableOnSuspension = false</code></td><td><code>cancellableOnSuspension = true</code></td></tr>
<tr>
<td>如果 <code>receive()</code> 被挂起，它在方案的其余部分将保持挂起状态：
<code-block lang="text">
| ----------------------------------- |
|      Thread 1    |      Thread 2    |
| ----------------------------------- |
| send(3)          | send(3) + cancel |
| receive()        | send(2) + cancel |
| receive()        | receive()        |
| receive()        | receive()        |
| send(1) + cancel | receive()        |
| ----------------------------------- |
</code-block>
</td>
<td>Lincheck 会探索 <code>receive()</code> 被挂起然后被取消的方案，这能更好地模拟实际的协程代码：
<code-block lang="text">
| --------------------------------------- |
|      Thread 1      |      Thread 2      |
| --------------------------------------- |
| send(3)            | send(3) + cancel   |
| receive() + cancel | send(2) + cancel   |
| receive() + cancel | receive()          |
| receive() + cancel | receive() + cancel |
| send(1) + cancel   | receive() + cancel |
| --------------------------------------- |
</code-block>
</td>
</tr>
</table>

### 即时取消

如果启用了 `cancellableOnSuspension` 并且操作应该支持[即时取消](https://kotlinlang.org/docs/cancellation-and-timeouts.html#handle-values-safely-when-canceling-coroutines)，你还可以将 `promptCancellation` 设置为 `true`：

```kotlin
@Operation(cancellableOnSuspension = true, promptCancellation = true)
fun foo(): Int = struct.foo()
```

考虑以下通道测试：

```kotlin
@Param(name = "value", gen = IntGen::class, conf = "1:3")
class PromptCancellationTest {
    private val ch = Channel<Int>()
    
    @Operation
    suspend fun send(@Param(name = "value") value: Int) = ch.send(value)
    
    @Operation(cancellableOnSuspension = true, promptCancellation = true)
    suspend fun receive() = ch.receive()
    
    @Test
    fun test() = ModelCheckingOptions()
        .iterations(50)
        .invocationsPerIteration(1000)
        // 即使测试未失败也报告方案
        .logLevel(LoggingLevel.INFO)
        .check(this::class)
}
```

<table>
<tr><td><code>promptCancellation = false</code></td><td><code>promptCancellation = true</code></td></tr>
<tr>
<td>Lincheck 只能在操作实际挂起<b>之后</b>尝试取消它。如果操作在 Lincheck 尝试取消之前已经恢复，则取消操作失败，操作将正常完成：
<code-block lang="text">
| --------------------------------------- |
|      Thread 1      |      Thread 2      |
| --------------------------------------- |
| send(2)            | send(2)            |
| send(2) + cancel   | receive() + cancel |
| receive() + cancel | receive()          |
| receive()          | send(3) + cancel   |
| send(2)            | receive()          |
| --------------------------------------- |
</code-block>
</td>
<td>Lincheck 即使在操作<b>已经恢复</b>但尚未有机会运行时，也可以将其取消。这模拟了实际生活中的行为，即协程可以在其恢复的瞬间与其实际处理结果的瞬间之间被取消：
<code-block lang="text">
| ---------------------------------------------- |
|      Thread 1      |         Thread 2          |
| ---------------------------------------------- |
| send(2)            | send(2)                   |
| send(2) + cancel   | receive() + cancel        |
| receive() + cancel | receive() + prompt_cancel |
| receive()          | send(3) + cancel          |
| send(2)            | receive()                 |
| ---------------------------------------------- |
</code-block>
</td>
</tr>
</table>

## 另请参阅

* [检查非阻塞进度保证](lincheck-progress-guarantees.md)
* [定义算法的顺序规范](lincheck-results-validation.md)