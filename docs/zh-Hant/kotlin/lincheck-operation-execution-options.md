[//]: # (title: 操作執行選項)
[//]: # (description: 了解 Lincheck 對於並行操作的執行選項。)

Lincheck 提供了一組選項來控制特定操作的執行方式，例如在單一執行緒上執行操作、僅執行操作一次、將操作標記為阻塞等等。

在本文中，您將了解不同的執行選項以及如何設定它們。

## 單執行緒操作群組

某些操作要求絕不並行執行，例如單一生產者單一消費者佇列中的操作。

若要建立一組絕不平行執行的操作，請在宣告操作時使用 `nonParallelGroup` 選項：

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

Lincheck 會確保非平行群組中的操作絕不相互平行執行。然而，這些操作仍可與非平行群組之外的操作平行執行：

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

## 單次使用操作

使用 `runOnce` 選項使該操作在每次測試叫用中僅執行一次：

```kotlin
@Operation(runOnce = true)
fun foo() = struct.foo()

@Operation
fun buzz() = struct.buzz()
```

產生的情境範例：

```text
| ------------------- |
| Thread 1 | Thread 2 |
| ------------------- |
| buzz()   | foo()    |
| buzz()   | buzz()   |
| ------------------- |
```

## 阻塞操作

如果操作旨在阻塞執行，請使用 `blocking` 選項。如果測試檢查的是[非阻塞保證](lincheck-progress-guarantees.md)，當執行在標記為 `blocking` 選項的操作上停滯時，Lincheck 不會使測試失敗：

```kotlin
@Operation(blocking = true)
fun foo(): Int = struct.foo()
```

## 可取消操作

如果操作可在[掛起（suspend）時被取消](https://kotlinlang.org/docs/cancellation-and-timeouts.html#suspension-points-and-cancellation)，請使用 `cancellableOnSuspension` 選項：

```kotlin
@Operation(cancellableOnSuspension = true)
fun foo(): Int = struct.foo()
```

考慮以下通道（channel）測試：

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
        // 即便測試沒有失敗也回報情境
        .logLevel(LoggingLevel.INFO)
        .check(this::class)
}
```

<table>
<tr><td><code>cancellableOnSuspension = false</code></td><td><code>cancellableOnSuspension = true</code></td></tr>
<tr>
<td>如果 <code>receive()</code> 被掛起，它會在該情境的剩餘部分保持掛起狀態：
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
<td>Lincheck 會探索 <code>receive()</code> 被掛起後接著被取消的情境，這能更好地模擬現實生活中的協同程式程式碼：
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

### 立即取消

如果啟用了 `cancellableOnSuspension` 且該操作應支援[立即取消](https://kotlinlang.org/docs/cancellation-and-timeouts.html#handle-values-safely-when-canceling-coroutines)，您還可以將 `promptCancellation` 設定為 `true`：

```kotlin
@Operation(cancellableOnSuspension = true, promptCancellation = true)
fun foo(): Int = struct.foo()
```

考慮以下通道測試：

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
        // 即便測試沒有失敗也回報情境
        .logLevel(LoggingLevel.INFO)
        .check(this::class)
}
```

<table>
<tr><td><code>promptCancellation = false</code></td><td><code>promptCancellation = true</code></td></tr>
<tr>
<td>Lincheck 只能在操作實際被掛起 **之後** 嘗試取消它。如果操作在 Lincheck 嘗試取消之前已恢復，則取消會失敗，且操作會正常完成：
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
<td>即使操作 **已經恢復** 但尚未有機會執行，Lincheck 仍可取消該操作。這模擬了現實生活中的行為：協同程式在恢復瞬間與實際處理結果的瞬間之間，是有可能被取消的：
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

## 延伸閱讀

* [檢查非阻塞進度保證](lincheck-progress-guarantees.md)
* [定義演算法的循序規格](lincheck-results-validation.md)