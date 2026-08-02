[//]: # (title: 작업 실행 옵션)
[//]: # (description: Lincheck의 동시성 작업을 위한 실행 옵션에 대해 알아봅니다.)

Lincheck은 작업을 단일 스레드에서 실행하거나, 작업을 단 한 번만 실행하거나, 작업을 블로킹(blocking)으로 표시하는 등 특정 작업이 실행되는 방식을 제어하는 일련의 옵션을 제공합니다.

이 문서에서는 다양한 실행 옵션과 설정 방법에 대해 알아봅니다.

## 단일 스레드 작업 그룹

단일 생산자 단일 소비자(single-producer single-consumer) 큐의 작업과 같이 특정 작업은 절대로 동시에 실행되지 않아야 할 때가 있습니다.

병렬로 실행되지 않는 작업 그룹을 만들려면 작업을 선언할 때 `nonParallelGroup` 옵션을 사용하세요.

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

Lincheck은 비병렬 그룹(non-parallel group)에 속한 작업들이 서로 병렬로 실행되지 않도록 보장합니다. 하지만 이러한 작업들은 비병렬 그룹 외부의 작업들과는 여전히 병렬로 실행될 수 있습니다.

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

## 단일 실행 작업

테스트 호출당 작업을 단 한 번만 실행하려면 `runOnce` 옵션을 사용하세요.

```kotlin
@Operation(runOnce = true)
fun foo() = struct.foo()

@Operation
fun buzz() = struct.buzz()
```

생성된 시나리오의 예시는 다음과 같습니다.

```text
| ------------------- |
| Thread 1 | Thread 2 |
| ------------------- |
| buzz()   | foo()    |
| buzz()   | buzz()   |
| ------------------- |
```

## 블로킹 작업

작업이 실행을 블로킹하도록 설계된 경우 `blocking` 옵션을 사용하세요. 테스트가 [논블로킹 보장(non-blocking guarantees)](lincheck-progress-guarantees.md)을 확인하는 경우, Lincheck은 `blocking` 옵션이 표시된 작업에서 실행이 정지되더라도 테스트를 실패로 처리하지 않습니다.

```kotlin
@Operation(blocking = true)
fun foo(): Int = struct.foo()
```

## 취소 가능한 작업

작업이 [중단될 때 취소](https://kotlinlang.org/docs/cancellation-and-timeouts.html#suspension-points-and-cancellation)될 수 있는 경우 `cancellableOnSuspension` 옵션을 사용하세요.

```kotlin
@Operation(cancellableOnSuspension = true)
fun foo(): Int = struct.foo()
```

다음 채널 테스트를 살펴보겠습니다.

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
        // 테스트가 실패하지 않더라도 시나리오를 보고합니다.
        .logLevel(LoggingLevel.INFO)
        .check(this::class)
}
```

<table>
<tr><td><code>cancellableOnSuspension = false</code></td><td><code>cancellableOnSuspension = true</code></td></tr>
<tr>
<td><code>receive()</code>가 중단되면, 나머지 시나리오 동안 중단된 상태를 유지합니다.
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
<td>Lincheck은 <code>receive()</code>가 중단되었다가 취소되는 시나리오를 탐색하며, 이는 실제 코루틴 코드를 더 잘 모델링합니다.
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

### 즉각적인 취소 (Prompt cancellation)

`cancellableOnSuspension`이 활성화되어 있고 해당 작업이 [즉각적인 취소(prompt cancellation)](https://kotlinlang.org/docs/cancellation-and-timeouts.html#handle-values-safely-when-canceling-coroutines)를 지원해야 하는 경우, `promptCancellation`을 `true`로 설정할 수도 있습니다.

```kotlin
@Operation(cancellableOnSuspension = true, promptCancellation = true)
fun foo(): Int = struct.foo()
```

다음 채널 테스트를 살펴보겠습니다.

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
        // 테스트가 실패하지 않더라도 시나리오를 보고합니다.
        .logLevel(LoggingLevel.INFO)
        .check(this::class)
}
```

<table>
<tr><td><code>promptCancellation = false</code></td><td><code>promptCancellation = true</code></td></tr>
<tr>
<td>Lincheck은 작업이 실제로 중단된 <b>이후</b>에만 취소를 시도할 수 있습니다. 만약 Lincheck이 취소를 시도하기 전에 작업이 재개되었다면, 취소는 실패하고 작업은 정상적으로 완료됩니다.
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
<td>Lincheck은 작업이 <b>이미 재개되었더라도</b> 아직 실행될 기회를 얻지 못했다면 작업을 취소할 수 있습니다. 이는 코루틴이 재개된 순간과 실제로 결과를 처리하는 순간 사이에 취소될 수 있는 실제 동작을 모델링합니다.
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

## 참고 항목

* [논블로킹 진행 보장 확인](lincheck-progress-guarantees.md)
* [알고리즘의 순차 명세 정의](lincheck-results-validation.md)