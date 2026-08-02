[//]: # (title: 操作の実行オプション)
[//]: # (description: Lincheckにおける並行操作の実行オプションについて学びます。)

Lincheckは、特定の操作を単一のスレッドで実行する、操作を一度だけ実行する、操作をブロッキングとしてマークするなど、特定の操作がどのように実行されるかを制御するためのオプション群を提供します。

この記事では、さまざまな実行オプションとその設定方法について学びます。

## 単一スレッド操作グループ

シングルプロデューサー・シングルコンシューマーキューの操作など、特定の操作は決して並行に実行されないことが求められます。

並列に実行されない操作のグループを作成するには、操作を宣言する際に `nonParallelGroup` オプションを使用します。

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

Lincheckは、非並列グループ（non-parallel group）に属する操作が互いに並行して実行されないことを保証します。ただし、これらの操作は非並列グループ外の操作とは並行して実行される可能性があります。

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

## 一度だけ実行される操作

`runOnce` オプションを使用すると、テストの呼び出しごとに操作を一度だけ実行するように設定できます。

```kotlin
@Operation(runOnce = true)
fun foo() = struct.foo()

@Operation
fun buzz() = struct.buzz()
```

生成されるシナリオの例：

```text
| ------------------- |
| Thread 1 | Thread 2 |
| ------------------- |
| buzz()   | foo()    |
| buzz()   | buzz()   |
| ------------------- |
```

## ブロッキング操作

操作が実行をブロックすることを意図している場合は、`blocking` オプションを使用します。テストで[ノンブロッキングの保証](lincheck-progress-guarantees.md)をチェックしている場合、Lincheckは `blocking` オプションでマークされた操作で実行が停滞（stall）しても、テストを失敗させません。

```kotlin
@Operation(blocking = true)
fun foo(): Int = struct.foo()
```

## キャンセル可能な操作

操作が[中断時にキャンセル](https://kotlinlang.org/docs/cancellation-and-timeouts.html#suspension-points-and-cancellation)できる場合は、`cancellableOnSuspension` オプションを使用します。

```kotlin
@Operation(cancellableOnSuspension = true)
fun foo(): Int = struct.foo()
```

以下のチャネルのテストを考えてみましょう。

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
        // テストが失敗しなくてもシナリオを報告する
        .logLevel(LoggingLevel.INFO)
        .check(this::class)
}
```

<table>
<tr><td><code>cancellableOnSuspension = false</code></td><td><code>cancellableOnSuspension = true</code></td></tr>
<tr>
<td><code>receive()</code> が中断されると、そのシナリオの残りの間、中断されたままになります。
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
<td>Lincheckは <code>receive()</code> が中断された後にキャンセルされるシナリオを探索します。これにより、実世界のコルーチンコードをより適切にモデル化できます。
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

### 即時キャンセル

`cancellableOnSuspension` が有効で、かつその操作が[即時キャンセル (prompt cancellation)](https://kotlinlang.org/docs/cancellation-and-timeouts.html#handle-values-safely-when-canceling-coroutines)をサポートする必要がある場合は、`promptCancellation` を `true` に設定することもできます。

```kotlin
@Operation(cancellableOnSuspension = true, promptCancellation = true)
fun foo(): Int = struct.foo()
```

以下のチャネルのテストを考えてみましょう。

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
        // テストが失敗しなくてもシナリオを報告する
        .logLevel(LoggingLevel.INFO)
        .check(this::class)
}
```

<table>
<tr><td><code>promptCancellation = false</code></td><td><code>promptCancellation = true</code></td></tr>
<tr>
<td>Lincheckは、操作が実際に中断された<b>後</b>にのみ、キャンセルを試みることができます。キャンセルを試みる前に操作が再開（resume）された場合、キャンセルは失敗し、操作は通常通り完了します。
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
<td>Lincheckは、操作が<b>すでに再開されている</b>ものの、まだ実行される機会がなかった場合でも、操作をキャンセルできます。これは、コルーチンが再開された瞬間から実際に結果を処理する瞬間の間にキャンセルされる可能性があるという、実世界の動作をモデル化しています。
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

## 関連項目

* [ノンブロッキング進行保証のチェック](lincheck-progress-guarantees.md)
* [アルゴリズムの逐次仕様の定義](lincheck-results-validation.md)