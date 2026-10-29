<!--- TEST_NAME ChannelsGuideTest -->
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 채널 (Channels))

Deferred 값은 코루틴 사이에 단일 값을 전달하는 편리한 방법을 제공합니다.
채널(Channels)은 값의 스트림을 전달하는 방법을 제공합니다.

## 채널 기초 (Channel basics) {id="channel-basics"}

[Channel]은 개념적으로 `BlockingQueue`와 매우 유사합니다. 한 가지 주요 차이점은 블로킹 작업인 `put` 대신 중단 가능한(suspending) [send][SendChannel.send]가 있고, 블로킹 작업인 `take` 대신 중단 가능한 [receive][ReceiveChannel.receive]가 있다는 점입니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking {
//sampleStart
    val channel = Channel<Int>()
    launch {
        // 이것은 CPU 집약적인 계산이나 비동기 로직일 수 있습니다.
        // 여기서는 단순히 5개의 제곱수를 보냅니다.
        for (x in 1..5) channel.send(x * x)
    }
    // 여기서 수신된 5개의 정수를 출력합니다:
    repeat(5) { println(channel.receive()) }
    println("Done!")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-01.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-01.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드의 출력 결과는 다음과 같습니다:

```text
1
4
9
16
25
Done!
```

<!--- TEST -->

## 채널 닫기와 반복문 (Closing and iteration over channels) {id="closing-and-iteration-over-channels"}

큐와 달리 채널은 더 이상 요소가 오지 않음을 나타내기 위해 닫을(close) 수 있습니다.
수신 측에서는 채널에서 요소를 받기 위해 일반적인 `for` 루프를 사용하는 것이 편리합니다.

개념적으로 [close][SendChannel.close]는 채널에 특수한 종료 토큰을 보내는 것과 같습니다.
이 종료 토큰이 수신되는 즉시 반복이 멈추므로, 닫기 전에 이전에 보낸 모든 요소가 수신되었음이 보장됩니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking {
//sampleStart
    val channel = Channel<Int>()
    launch {
        for (x in 1..5) channel.send(x * x)
        channel.close() // 보내기가 완료됨을 알림
    }
    // 여기서 `for` 루프를 사용하여 수신된 값을 출력함 (채널이 닫힐 때까지)
    for (y in channel) println(y)
    println("Done!")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-02.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-02.kt)에서 확인할 수 있습니다.
>
{style="note"}

<!--- TEST 
1
4
9
16
25
Done!
-->

## 채널 생산자 구축하기 (Building channel producers) {id="building-channel-producers"}

코루틴이 일련의 요소를 생산하는 패턴은 꽤 일반적입니다.
이는 동시성 코드에서 자주 발견되는 _생산자-소비자(producer-consumer)_ 패턴의 일부입니다.
이러한 생산자를 채널을 매개변수로 받는 함수로 추상화할 수도 있지만, 이는 결과가 함수에서 반환되어야 한다는 일반적인 상식에 반합니다.

생산자 측에서 이를 올바르게 수행하기 쉽게 해주는 [produce]라는 편리한 코루틴 빌더가 있으며, 소비자 측에서 `for` 루프를 대체하는 [consumeEach]라는 확장 함수가 있습니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

//sampleStart
fun CoroutineScope.produceSquares(): ReceiveChannel<Int> = produce {
    for (x in 1..5) send(x * x)
}

fun main() = runBlocking {
    val squares = produceSquares()
    squares.consumeEach { println(it) }
    println("Done!")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-03.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-03.kt)에서 확인할 수 있습니다.
>
{style="note"}

<!--- TEST 
1
4
9
16
25
Done!
-->

## 파이프라인 (Pipelines) {id="pipelines"}

파이프라인은 한 코루틴이 (아마도 무한한) 값의 스트림을 생산하는 패턴입니다.

```kotlin
fun CoroutineScope.produceNumbers() = produce<Int> {
    var x = 1
    while (true) send(x++) // 1부터 시작하는 무한한 정수 스트림
}
```

그리고 다른 코루틴 또는 코루틴들이 해당 스트림을 소비하고, 어떤 처리를 수행하여 또 다른 결과를 만들어냅니다.
아래 예제에서는 숫자를 제곱할 뿐입니다.

```kotlin
fun CoroutineScope.square(numbers: ReceiveChannel<Int>): ReceiveChannel<Int> = produce {
    for (x in numbers) send(x * x)
}
```

메인 코드는 전체 파이프라인을 시작하고 연결합니다.

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking {
//sampleStart
    val numbers = produceNumbers() // 1부터 시작하는 정수를 생산함
    val squares = square(numbers) // 정수를 제곱함
    repeat(5) {
        println(squares.receive()) // 처음 5개를 출력함
    }
    println("Done!") // 완료
    coroutineContext.cancelChildren() // 자식 코루틴들을 취소함
//sampleEnd
}

fun CoroutineScope.produceNumbers() = produce<Int> {
    var x = 1
    while (true) send(x++) // 1부터 시작하는 무한한 정수 스트림
}

fun CoroutineScope.square(numbers: ReceiveChannel<Int>): ReceiveChannel<Int> = produce {
    for (x in numbers) send(x * x)
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-04.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-04.kt)에서 확인할 수 있습니다.
>
{style="note"}

<!--- TEST 
1
4
9
16
25
Done!
-->

> 코루틴을 생성하는 모든 함수는 [CoroutineScope]의 확장 함수로 정의되어 있어, 애플리케이션에 잔존하는 전역 코루틴이 없도록 [구조화된 동시성(structured concurrency)](composing-suspending-functions.md#structured-concurrency-with-async)에 의존할 수 있습니다.
>
{style="note"}

## 파이프라인으로 소수 구하기 (Prime numbers with pipeline) {id="prime-numbers-with-pipeline"}

코루틴 파이프라인을 사용하여 소수를 생성하는 예제로 파이프라인을 극한까지 활용해 보겠습니다. 먼저 숫자의 무한 시퀀스로 시작합니다.

```kotlin
fun CoroutineScope.numbersFrom(start: Int) = produce<Int> {
    var x = start
    while (true) send(x++) // start부터 시작하는 무한한 정수 스트림
}
```

다음 파이프라인 단계에서는 들어오는 숫자 스트림을 필터링하여 주어진 소수로 나누어떨어지는 모든 숫자를 제거합니다.

```kotlin
fun CoroutineScope.filter(numbers: ReceiveChannel<Int>, prime: Int) = produce<Int> {
    for (x in numbers) if (x % prime != 0) send(x)
}
```

이제 2부터 숫자 스트림을 시작하고, 현재 채널에서 소수를 가져오며, 발견된 각 소수에 대해 새로운 파이프라인 단계를 실행하여 파이프라인을 구축합니다.
 
```
numbersFrom(2) -> filter(2) -> filter(3) -> filter(5) -> filter(7) ... 
```
 
다음 예제는 메인 스레드의 컨텍스트에서 전체 파이프라인을 실행하여 처음 10개의 소수를 출력합니다. 모든 코루틴이 메인 [runBlocking] 코루틴의 스코프 내에서 시작되므로 시작한 모든 코루틴의 목록을 명시적으로 유지할 필요가 없습니다. 처음 10개의 소수를 출력한 후 [cancelChildren][kotlin.coroutines.CoroutineContext.cancelChildren] 확장 함수를 사용하여 모든 자식 코루틴을 취소합니다.

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking {
//sampleStart
    var cur = numbersFrom(2)
    repeat(10) {
        val prime = cur.receive()
        println(prime)
        cur = filter(cur, prime)
    }
    coroutineContext.cancelChildren() // 메인이 종료될 수 있도록 모든 자식을 취소함
//sampleEnd    
}

fun CoroutineScope.numbersFrom(start: Int) = produce<Int> {
    var x = start
    while (true) send(x++) // start부터 시작하는 무한한 정수 스트림
}

fun CoroutineScope.filter(numbers: ReceiveChannel<Int>, prime: Int) = produce<Int> {
    for (x in numbers) if (x % prime != 0) send(x)
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-05.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-05.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드의 출력 결과는 다음과 같습니다:

```text
2
3
5
7
11
13
17
19
23
29
```

<!--- TEST -->

표준 라이브러리의 [`iterator`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/iterator.html) 코루틴 빌더를 사용하여 동일한 파이프라인을 구축할 수 있습니다. `produce`를 `iterator`로, `send`를 `yield`로, `receive`를 `next`로, `ReceiveChannel`을 `Iterator`로 바꾸고 코루틴 스코프를 제거하면 됩니다. `runBlocking`도 필요하지 않습니다.
그러나 위에서 보여준 채널을 사용하는 파이프라인의 장점은 [Dispatchers.Default] 컨텍스트에서 실행할 경우 실제로 여러 CPU 코어를 사용할 수 있다는 점입니다.

어쨌든 이것은 소수를 찾는 매우 비실용적인 방법입니다. 실제로 파이프라인에는 다른 중단 호출(원격 서비스에 대한 비동기 호출 등)이 포함되며, 이러한 파이프라인은 완전 비동기인 `produce`와 달리 임의의 중단을 허용하지 않는 `sequence`/`iterator`를 사용하여 구축할 수 없습니다.
 
## 팬아웃 (Fan-out) {id="fan-out"}

여러 코루틴이 동일한 채널로부터 수신하여 작업을 분산할 수 있습니다.
정기적으로 정수를 생성하는(초당 10개) 생산자 코루틴부터 시작해 보겠습니다.

```kotlin
fun CoroutineScope.produceNumbers() = produce<Int> {
    var x = 1 // 1부터 시작
    while (true) {
        send(x++) // 다음 생성
        delay(100) // 0.1초 대기
    }
}
```

그다음 여러 개의 처리기 코루틴을 가질 수 있습니다. 이 예제에서는 단순히 자신의 id와 수신된 숫자를 출력합니다.

```kotlin
fun CoroutineScope.launchProcessor(id: Int, channel: ReceiveChannel<Int>) = launch {
    for (msg in channel) {
        println("Processor #$id received $msg")
    }    
}
```

이제 5개의 처리기를 실행하고 거의 1초 동안 작동하게 해보겠습니다. 어떤 일이 일어나는지 보십시오.

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking<Unit> {
//sampleStart
    val producer = produceNumbers()
    repeat(5) { launchProcessor(it, producer) }
    delay(950)
    producer.cancel() // 생산자 코루틴을 취소하여 모두 종료시킴
//sampleEnd
}

fun CoroutineScope.produceNumbers() = produce<Int> {
    var x = 1 // 1부터 시작
    while (true) {
        send(x++) // 다음 생성
        delay(100) // 0.1초 대기
    }
}

fun CoroutineScope.launchProcessor(id: Int, channel: ReceiveChannel<Int>) = launch {
    for (msg in channel) {
        println("Processor #$id received $msg")
    }    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-06.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-06.kt)에서 확인할 수 있습니다.
>
{style="note"}

출력은 다음과 유사할 것이며, 각 특정 정수를 수신하는 처리기 id는 다를 수 있습니다.

```text
Processor #2 received 1
Processor #4 received 2
Processor #0 received 3
Processor #1 received 4
Processor #3 received 5
Processor #2 received 6
Processor #4 received 7
Processor #0 received 8
Processor #1 received 9
Processor #3 received 10
```

<!--- TEST lines.size == 10 && lines.withIndex().all { (i, line) -> line.startsWith("Processor #") && line.endsWith(" received ${i + 1}") } -->

생산자 코루틴을 취소하면 채널이 닫히므로, 결국 처리기 코루틴들이 수행 중인 채널에 대한 반복문이 종료됩니다.

또한, `launchProcessor` 코드에서 팬아웃을 수행하기 위해 `for` 루프를 사용하여 채널을 명시적으로 반복하는 방식에 주목하십시오. `consumeEach`와 달리 이 `for` 루프 패턴은 여러 코루틴에서 사용하기에 완벽하게 안전합니다. 처리기 코루틴 중 하나가 실패하더라도 다른 코루틴들은 여전히 채널을 처리하고 있을 것이지만, `consumeEach`를 통해 작성된 처리기는 정상 또는 비정상 종료 시 항상 기저 채널을 소비(취소)합니다.

## 팬인 (Fan-in) {id="fan-in"}

여러 코루틴이 동일한 채널로 보낼 수 있습니다.
예를 들어, 문자열 채널이 있고 지정된 지연 시간마다 지정된 문자열을 이 채널에 반복적으로 보내는 중단 함수가 있다고 가정해 봅시다.

```kotlin
suspend fun sendString(channel: SendChannel<String>, s: String, time: Long) {
    while (true) {
        delay(time)
        channel.send(s)
    }
}
```

이제 문자열을 보내는 몇 개의 코루틴을 실행하면 어떻게 되는지 확인해 보겠습니다(이 예제에서는 메인 코루틴의 자식으로서 메인 스레드 컨텍스트에서 실행합니다).

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking {
//sampleStart
    val channel = Channel<String>()
    launch { sendString(channel, "foo", 200L) }
    launch { sendString(channel, "BAR!", 500L) }
    repeat(6) { // 처음 6개를 수신함
        println(channel.receive())
    }
    coroutineContext.cancelChildren() // 메인이 종료될 수 있도록 모든 자식을 취소함
//sampleEnd
}

suspend fun sendString(channel: SendChannel<String>, s: String, time: Long) {
    while (true) {
        delay(time)
        channel.send(s)
    }
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-07.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-07.kt)에서 확인할 수 있습니다.
>
{style="note"}

출력 결과는 다음과 같습니다:

```text
foo
foo
BAR!
foo
foo
BAR!
```

<!--- TEST -->

## 버퍼링된 채널 (Buffered channels) {id="buffered-channels"}

지금까지 보여준 채널들은 버퍼가 없었습니다. 버퍼가 없는 채널은 송신자와 수신자가 서로 만날 때(일명 랑데부, rendezvous) 요소를 전달합니다. 만약 `send`가 먼저 호출되면 `receive`가 호출될 때까지 중단되고, 만약 `receive`가 먼저 호출되면 `send`가 호출될 때까지 중단됩니다.

[Channel()] 팩토리 함수와 [produce] 빌더는 모두 _버퍼 크기_를 지정하기 위해 선택적인 `capacity` 매개변수를 받습니다. 버퍼는 송신자가 중단되기 전에 여러 요소를 보낼 수 있도록 허용하며, 이는 버퍼가 가득 찼을 때 블록되는 지정된 용량의 `BlockingQueue`와 유사합니다.

다음 코드의 동작을 살펴보십시오.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking<Unit> {
//sampleStart
    val channel = Channel<Int>(4) // 버퍼링된 채널 생성
    val sender = launch { // 송신자 코루틴 실행
        repeat(10) {
            println("Sending $it") // 각 요소를 보내기 전에 출력
            channel.send(it) // 버퍼가 가득 차면 중단됨
        }
    }
    // 아무것도 수신하지 않고... 그냥 기다림...
    delay(1000)
    sender.cancel() // 송신자 코루틴 취소
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-08.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-08.kt)에서 확인할 수 있습니다.
>
{style="note"}

용량이 _4_인 버퍼링된 채널을 사용하여 "Sending"을 _5_번 출력합니다.

```text
Sending 0
Sending 1
Sending 2
Sending 3
Sending 4
```

<!--- TEST -->

처음 4개의 요소는 버퍼에 추가되고, 송신자는 5번째 요소를 보내려고 할 때 중단됩니다.

## 채널은 공정합니다 (Channels are fair) {id="channels-are-fair"}

채널에 대한 송신 및 수신 작업은 여러 코루틴에서 호출된 순서에 대해 _공정(fair)_합니다. 이들은 선입선출(FIFO) 순서로 제공됩니다. 예를 들어, `receive`를 먼저 호출한 코루틴이 요소를 가져옵니다. 다음 예제에서는 "ping"과 "pong" 두 코루틴이 공유된 "table" 채널에서 "ball" 객체를 수신하고 있습니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

//sampleStart
data class Ball(var hits: Int)

fun main() = runBlocking {
    val table = Channel<Ball>() // 공유된 테이블
    launch { player("ping", table) }
    launch { player("pong", table) }
    table.send(Ball(0)) // 공을 서브함
    delay(1000) // 1초 대기
    coroutineContext.cancelChildren() // 게임 종료, 취소함
}

suspend fun player(name: String, table: Channel<Ball>) {
    for (ball in table) { // 루프에서 공을 받음
        ball.hits++
        println("$name $ball")
        delay(300) // 잠시 대기
        table.send(ball) // 공을 다시 보냄
    }
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-09.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-09.kt)에서 확인할 수 있습니다.
>
{style="note"}

"ping" 코루틴이 먼저 시작되었으므로 공을 먼저 수신하는 코루틴이 됩니다. "ping" 코루틴이 공을 테이블로 다시 보낸 후 즉시 다시 수신하려고 시도하더라도, "pong" 코루틴이 이미 기다리고 있었기 때문에 공은 "pong" 코루틴에 의해 수신됩니다.

```text
ping Ball(hits=1)
pong Ball(hits=2)
ping Ball(hits=3)
pong Ball(hits=4)
```

<!--- TEST -->

사용 중인 실행기(executor)의 특성에 따라 때때로 채널이 불공정해 보이는 실행 결과를 생성할 수 있다는 점에 유의하십시오. 자세한 내용은 [이 이슈](https://github.com/Kotlin/kotlinx.coroutines/issues/111)를 참조하십시오.

## 티커 채널 (Ticker channels) {id="ticker-channels"}

티커(Ticker) 채널은 마지막 소비 이후 지정된 지연 시간이 지날 때마다 `Unit`을 생성하는 특별한 랑데부 채널입니다.
단독으로는 무의미해 보일 수 있지만, 윈도잉(windowing) 및 기타 시간에 의존적인 처리를 수행하는 복잡한 시간 기반 [produce] 파이프라인과 연산자를 생성하는 데 유용한 구성 요소입니다.
티커 채널은 [select]에서 "틱(on tick)" 동작을 수행하는 데 사용할 수 있습니다.

이러한 채널을 만들려면 팩토리 메서드 [ticker]를 사용하십시오.
더 이상 요소가 필요하지 않음을 나타내려면 [ReceiveChannel.cancel] 메서드를 사용하십시오.

이제 실제로 어떻게 작동하는지 보겠습니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

//sampleStart
fun main() = runBlocking<Unit> {
    val tickerChannel = ticker(delayMillis = 200, initialDelayMillis = 0) // 티커 채널 생성
    var nextElement = withTimeoutOrNull(1) { tickerChannel.receive() }
    println("Initial element is available immediately: $nextElement") // 초기 지연 없음

    nextElement = withTimeoutOrNull(100) { tickerChannel.receive() } // 이후의 모든 요소는 200ms 지연됨
    println("Next element is not ready in 100 ms: $nextElement")

    nextElement = withTimeoutOrNull(120) { tickerChannel.receive() }
    println("Next element is ready in 200 ms: $nextElement")

    // 대규모 소비 지연을 에뮬레이트함
    println("Consumer pauses for 300ms")
    delay(300)
    // 다음 요소가 즉시 사용 가능함
    nextElement = withTimeoutOrNull(1) { tickerChannel.receive() }
    println("Next element is available immediately after large consumer delay: $nextElement")
    // `receive` 호출 사이의 일시 정지가 고려되어 다음 요소가 더 빨리 도착함
    nextElement = withTimeoutOrNull(120) { tickerChannel.receive() }
    println("Next element is ready in 100ms after consumer pause in 300ms: $nextElement")

    tickerChannel.cancel() // 더 이상 요소가 필요하지 않음을 알림
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-channel-10.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-channel-10.kt)에서 확인할 수 있습니다.
>
{style="note"}

다음 라인들이 출력됩니다:

```text
Initial element is available immediately: kotlin.Unit
Next element is not ready in 100 ms: null
Next element is ready in 200 ms: kotlin.Unit
Consumer pauses for 300ms
Next element is available immediately after large consumer delay: kotlin.Unit
Next element is ready in 100ms after consumer pause in 300ms: kotlin.Unit
```

<!--- TEST -->

[ticker]는 잠재적인 소비자 일시 정지를 인식하며, 기본적으로 일시 정지가 발생하면 다음에 생성될 요소의 지연 시간을 조정하여 요소 생산 속도를 고정된 속도로 유지하려고 시도합니다.
 
선택적으로, 요소 사이의 고정된 지연 시간을 유지하기 위해 [TickerMode.FIXED_DELAY]와 동일한 `mode` 매개변수를 지정할 수 있습니다.

<!--- MODULE kotlinx-coroutines-core -->
<!--- INDEX kotlinx.coroutines -->

[CoroutineScope]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/index.html
[runBlocking]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/run-blocking.html
[kotlin.coroutines.CoroutineContext.cancelChildren]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/cancel-children.html
[Dispatchers.Default]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-default.html

<!--- INDEX kotlinx.coroutines.channels -->

[Channel]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-channel/index.html
[SendChannel.send]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-send-channel/send.html
[ReceiveChannel.receive]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-receive-channel/receive.html
[SendChannel.close]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-send-channel/close.html
[produce]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/produce.html
[consumeEach]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/consume-each.html
[Channel()]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-channel.html
[ticker]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/ticker.html
[ReceiveChannel.cancel]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-receive-channel/cancel.html
[TickerMode.FIXED_DELAY]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-ticker-mode/-f-i-x-e-d_-d-e-l-a-y/index.html

<!--- INDEX kotlinx.coroutines.selects -->

[select]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.selects/select.html

<!--- END -->