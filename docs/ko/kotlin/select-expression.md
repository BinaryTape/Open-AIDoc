<!--- TEST_NAME SelectGuideTest --> 
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: Select 표현식 \(실험적\))

Select 표현식은 여러 중단 함수(suspending functions)를 동시에 기다리고, 그 중 가장 먼저 사용 가능해진 것을 선택(_select_)할 수 있게 해줍니다.

> Select 표현식은 `kotlinx.coroutines`의 실험적 기능입니다. 이 API는 `kotlinx.coroutines` 라이브러리의 향후 업데이트에서 변경될 수 있으며, 하위 호환성이 깨지는 변경 사항이 포함될 가능성이 있습니다.
>
{style="note"}

## 채널에서 선택하기 {id="selecting-from-channels"}

문자열을 생성하는 두 개의 생산자 `fizz`와 `buzz`가 있다고 가정해 보겠습니다. `fizz`는 500ms마다 "Fizz" 문자열을 생성합니다:

```kotlin
fun CoroutineScope.fizz() = produce<String> {
    while (true) { // 500ms마다 "Fizz"를 보냅니다.
        delay(500)
        send("Fizz")
    }
}
```

그리고 `buzz`는 1000ms마다 "Buzz!" 문자열을 생성합니다:

```kotlin
fun CoroutineScope.buzz() = produce<String> {
    while (true) { // 1000ms마다 "Buzz!"를 보냅니다.
        delay(1000)
        send("Buzz!")
    }
}
```

[receive][ReceiveChannel.receive] 중단 함수를 사용하면 한 채널 또는 다른 채널 중 _하나_로부터만 수신할 수 있습니다. 하지만 [select] 표현식을 사용하면 [onReceive][ReceiveChannel.onReceive] 절(clause)을 사용하여 _두 채널 모두_로부터 동시에 수신할 수 있습니다:

```kotlin
suspend fun selectFizzBuzz(fizz: ReceiveChannel<String>, buzz: ReceiveChannel<String>) {
    select<Unit> { // <Unit>은 이 select 표현식이 아무런 결과도 생성하지 않음을 의미합니다.
        fizz.onReceive { value ->  // 첫 번째 select 절입니다.
            println("fizz -> '$value'")
        }
        buzz.onReceive { value ->  // 두 번째 select 절입니다.
            println("buzz -> '$value'")
        }
    }
}
```

이 코드를 총 7번 실행해 보겠습니다:

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*
import kotlinx.coroutines.selects.*

fun CoroutineScope.fizz() = produce<String> {
    while (true) { // 500ms마다 "Fizz"를 보냅니다.
        delay(500)
        send("Fizz")
    }
}

fun CoroutineScope.buzz() = produce<String> {
    while (true) { // 1000ms마다 "Buzz!"를 보냅니다.
        delay(1000)
        send("Buzz!")
    }
}

suspend fun selectFizzBuzz(fizz: ReceiveChannel<String>, buzz: ReceiveChannel<String>) {
    select<Unit> { // <Unit>은 이 select 표현식이 아무런 결과도 생성하지 않음을 의미합니다.
        fizz.onReceive { value ->  // 첫 번째 select 절입니다.
            println("fizz -> '$value'")
        }
        buzz.onReceive { value ->  // 두 번째 select 절입니다.
            println("buzz -> '$value'")
        }
    }
}

fun main() = runBlocking<Unit> {
//sampleStart
    val fizz = fizz()
    val buzz = buzz()
    repeat(7) {
        selectFizzBuzz(fizz, buzz)
    }
    coroutineContext.cancelChildren() // fizz와 buzz 코루틴을 취소합니다.
//sampleEnd        
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-select-01.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-select-01.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드의 결과는 다음과 같습니다: 

```text
fizz -> 'Fizz'
buzz -> 'Buzz!'
fizz -> 'Fizz'
fizz -> 'Fizz'
buzz -> 'Buzz!'
fizz -> 'Fizz'
fizz -> 'Fizz'
```

<!--- TEST -->

## 종료(close) 시 선택하기 {id="selecting-on-close"}

채널이 닫혔을 때 `select`의 [onReceive][ReceiveChannel.onReceive] 절은 실패하며, 이로 인해 해당 `select`는 예외를 던집니다. 채널이 닫혔을 때 특정 동작을 수행하려면 [onReceiveCatching][ReceiveChannel.onReceiveCatching] 절을 사용할 수 있습니다. 다음 예제는 `select`가 선택된 절의 결과를 반환하는 표현식임을 보여줍니다:

```kotlin
suspend fun selectAorB(a: ReceiveChannel<String>, b: ReceiveChannel<String>): String =
    select<String> {
        a.onReceiveCatching { it ->
            val value = it.getOrNull()
            if (value != null) {
                "a -> '$value'"
            } else {
                "Channel 'a' is closed"
            }
        }
        b.onReceiveCatching { it ->
            val value = it.getOrNull()
            if (value != null) {
                "b -> '$value'"
            } else {
                "Channel 'b' is closed"
            }
        }
    }
```

"Hello"를 4번 생성하는 채널 `a`와 "World"를 4번 생성하는 채널 `b`를 사용하여 이를 테스트해 보겠습니다:

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*
import kotlinx.coroutines.selects.*

suspend fun selectAorB(a: ReceiveChannel<String>, b: ReceiveChannel<String>): String =
    select<String> {
        a.onReceiveCatching { it ->
            val value = it.getOrNull()
            if (value != null) {
                "a -> '$value'"
            } else {
                "Channel 'a' is closed"
            }
        }
        b.onReceiveCatching { it ->
            val value = it.getOrNull()
            if (value != null) {
                "b -> '$value'"
            } else {
                "Channel 'b' is closed"
            }
        }
    }
    
fun main() = runBlocking<Unit> {
//sampleStart
    val a = produce<String> {
        repeat(4) { send("Hello $it") }
    }
    val b = produce<String> {
        repeat(4) { send("World $it") }
    }
    repeat(8) { // 처음 8개의 결과를 출력합니다.
        println(selectAorB(a, b))
    }
    coroutineContext.cancelChildren()  
//sampleEnd      
}    
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-select-02.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-select-02.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드의 결과는 꽤 흥미로우므로 더 자세히 분석해 보겠습니다:

```text
a -> 'Hello 0'
a -> 'Hello 1'
b -> 'World 0'
a -> 'Hello 2'
a -> 'Hello 3'
b -> 'World 1'
Channel 'a' is closed
Channel 'a' is closed
```

<!--- TEST -->

여기서 몇 가지 관찰할 점이 있습니다.

첫째, `select`는 첫 번째 절에 **편향(biased)**되어 있습니다. 동시에 여러 절을 선택할 수 있는 경우, 그중 첫 번째 절이 선택됩니다. 여기서 두 채널은 계속해서 문자열을 생성하고 있으므로, `select`의 첫 번째 절인 `a` 채널이 우선권을 갖습니다. 하지만 버퍼가 없는 채널(unbuffered channel)을 사용하고 있기 때문에, `a`는 [send][SendChannel.send] 호출 시 가끔 중단(suspend)되며, 이때 `b`에게도 전송 기회가 주어집니다.

둘째, 채널이 이미 닫혀 있는 경우 [onReceiveCatching][ReceiveChannel.onReceiveCatching]이 즉시 선택됩니다.

## 전송 시 선택하기 {id="selecting-to-send"}

Select 표현식은 선택의 편향적인 특성과 결합하여 유용하게 사용할 수 있는 [onSend][SendChannel.onSend] 절을 가지고 있습니다.

기본 채널의 소비자가 속도를 따라오지 못할 때, 값을 `side` 채널로 보내는 정수 생산자 예제를 작성해 보겠습니다:

```kotlin
fun CoroutineScope.produceNumbers(side: SendChannel<Int>) = produce<Int> {
    for (num in 1..10) { // 1부터 10까지 10개의 숫자를 생성합니다.
        delay(100) // 100ms마다
        select<Unit> {
            onSend(num) {} // 기본 채널로 보냅니다.
            side.onSend(num) {} // 또는 side 채널로 보냅니다.     
        }
    }
}
```

소비자는 각 숫자를 처리하는 데 250ms가 걸리는 아주 느린 속도로 동작합니다:

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*
import kotlinx.coroutines.selects.*

fun CoroutineScope.produceNumbers(side: SendChannel<Int>) = produce<Int> {
    for (num in 1..10) { // 1부터 10까지 10개의 숫자를 생성합니다.
        delay(100) // 100ms마다
        select<Unit> {
            onSend(num) {} // 기본 채널로 보냅니다.
            side.onSend(num) {} // 또는 side 채널로 보냅니다.     
        }
    }
}

fun main() = runBlocking<Unit> {
//sampleStart
    val side = Channel<Int>() // side 채널을 할당합니다.
    launch { // side 채널을 위한 아주 빠른 소비자입니다.
        side.consumeEach { println("Side channel has $it") }
    }
    produceNumbers(side).consumeEach { 
        println("Consuming $it")
        delay(250) // 소비한 숫자를 제대로 처리하기 위해 서두르지 않고 지연시킵니다.
    }
    println("Done consuming")
    coroutineContext.cancelChildren()  
//sampleEnd      
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-select-03.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-select-03.kt)에서 확인할 수 있습니다.
>
{style="note"}
  
무슨 일이 일어나는지 확인해 보겠습니다:
 
```text
Consuming 1
Side channel has 2
Side channel has 3
Consuming 4
Side channel has 5
Side channel has 6
Consuming 7
Side channel has 8
Side channel has 9
Consuming 10
Done consuming
```

<!--- TEST -->

## Deferred 값 선택하기 {id="selecting-deferred-values"}

Deferred 값은 [onAwait][Deferred.onAwait] 절을 사용하여 선택할 수 있습니다. 무작위 지연 후에 Deferred 문자열 값을 반환하는 async 함수부터 시작해 보겠습니다:

```kotlin
fun CoroutineScope.asyncString(time: Int) = async {
    delay(time.toLong())
    "Waited for $time ms"
}
```

무작위 지연 시간을 가진 12개의 코루틴을 시작해 보겠습니다.

```kotlin
fun CoroutineScope.asyncStringsList(): List<Deferred<String>> {
    val random = Random(3)
    return List(12) { asyncString(random.nextInt(1000)) }
}
```

이제 메인 함수는 그중 첫 번째 작업이 완료될 때까지 기다리고, 여전히 활성 상태인 Deferred 값의 개수를 셉니다. 여기서 `select` 표현식이 Kotlin DSL이라는 점을 활용하여 임의의 코드로 절을 제공할 수 있다는 점에 주목하세요. 이 경우 Deferred 값 리스트를 순회하며 각 Deferred 값에 대해 `onAwait` 절을 제공합니다.

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.selects.*
import java.util.*
    
fun CoroutineScope.asyncString(time: Int) = async {
    delay(time.toLong())
    "Waited for $time ms"
}

fun CoroutineScope.asyncStringsList(): List<Deferred<String>> {
    val random = Random(3)
    return List(12) { asyncString(random.nextInt(1000)) }
}

fun main() = runBlocking<Unit> {
//sampleStart
    val list = asyncStringsList()
    val result = select<String> {
        list.withIndex().forEach { (index, deferred) ->
            deferred.onAwait { answer ->
                "Deferred $index produced answer '$answer'"
            }
        }
    }
    println(result)
    val countActive = list.count { it.isActive }
    println("$countActive coroutines are still active")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-select-04.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-select-04.kt)에서 확인할 수 있습니다.
>
{style="note"}

출력 결과는 다음과 같습니다:

```text
Deferred 4 produced answer 'Waited for 128 ms'
11 coroutines are still active
```

<!--- TEST -->

## Deferred 값 채널의 전환(Switch over) {id="switch-over-a-channel-of-deferred-values"}

Deferred 문자열 값의 채널을 소비하는 채널 생산자 함수를 작성해 보겠습니다. 이 함수는 수신된 각 Deferred 값을 기다리지만, 다음 Deferred 값이 오거나 채널이 닫힐 때까지만 기다립니다. 이 예제는 동일한 `select` 내에서 [onReceiveCatching][ReceiveChannel.onReceiveCatching]과 [onAwait][Deferred.onAwait] 절을 함께 사용합니다:

```kotlin
fun CoroutineScope.switchMapDeferreds(input: ReceiveChannel<Deferred<String>>) = produce<String> {
    var current = input.receive() // 처음 수신된 deferred 값으로 시작합니다.
    while (isActive) { // 취소되거나 닫힐 때까지 반복합니다.
        val next = select<Deferred<String>?> { // 이 select에서 다음 deferred 값을 반환하거나 null을 반환합니다.
            input.onReceiveCatching { update ->
                update.getOrNull()
            }
            current.onAwait { value ->
                send(value) // 현재 deferred가 생성한 값을 보냅니다.
                input.receiveCatching().getOrNull() // 그리고 입력 채널에서 다음 deferred를 가져옵니다.
            }
        }
        if (next == null) {
            println("Channel was closed")
            break // 루프를 빠져나갑니다.
        } else {
            current = next
        }
    }
}
```

이를 테스트하기 위해 지정된 시간 후에 지정된 문자열로 완료되는 간단한 async 함수를 사용하겠습니다:

```kotlin
fun CoroutineScope.asyncString(str: String, time: Long) = async {
    delay(time)
    str
}
```

메인 함수는 `switchMapDeferreds`의 결과를 출력하는 코루틴을 실행하고 몇 가지 테스트 데이터를 보냅니다:

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*
import kotlinx.coroutines.selects.*
    
fun CoroutineScope.switchMapDeferreds(input: ReceiveChannel<Deferred<String>>) = produce<String> {
    var current = input.receive() // 처음 수신된 deferred 값으로 시작합니다.
    while (isActive) { // 취소되거나 닫힐 때까지 반복합니다.
        val next = select<Deferred<String>?> { // 이 select에서 다음 deferred 값을 반환하거나 null을 반환합니다.
            input.onReceiveCatching { update ->
                update.getOrNull()
            }
            current.onAwait { value ->
                send(value) // 현재 deferred가 생성한 값을 보냅니다.
                input.receiveCatching().getOrNull() // 그리고 입력 채널에서 다음 deferred를 가져옵니다.
            }
        }
        if (next == null) {
            println("Channel was closed")
            break // 루프를 빠져나갑니다.
        } else {
            current = next
        }
    }
}

fun CoroutineScope.asyncString(str: String, time: Long) = async {
    delay(time)
    str
}

fun main() = runBlocking<Unit> {
//sampleStart
    val chan = Channel<Deferred<String>>() // 테스트를 위한 채널
    launch { // 출력을 담당하는 코루틴을 실행합니다.
        for (s in switchMapDeferreds(chan)) 
            println(s) // 수신된 각 문자열을 출력합니다.
    }
    chan.send(asyncString("BEGIN", 100))
    delay(200) // "BEGIN"이 생성되기에 충분한 시간입니다.
    chan.send(asyncString("Slow", 500))
    delay(100) // slow를 생성하기에 부족한 시간입니다.
    chan.send(asyncString("Replace", 100))
    delay(500) // 마지막 값을 보내기 전에 시간을 줍니다.
    chan.send(asyncString("END", 500))
    delay(1000) // 처리를 위한 시간을 줍니다.
    chan.close() // 채널을 닫습니다 ... 
    delay(500) // 작업이 마무리될 때까지 기다립니다.
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-select-05.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-select-05.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드의 결과는 다음과 같습니다:

```text
BEGIN
Replace
END
Channel was closed
```

<!--- TEST -->

<!--- MODULE kotlinx-coroutines-core -->
<!--- INDEX kotlinx.coroutines -->

[Deferred.onAwait]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-deferred/on-await.html

<!--- INDEX kotlinx.coroutines.channels -->

[ReceiveChannel.receive]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-receive-channel/receive.html
[ReceiveChannel.onReceive]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-receive-channel/on-receive.html
[ReceiveChannel.onReceiveCatching]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-receive-channel/on-receive-catching.html
[SendChannel.send]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-send-channel/send.html
[SendChannel.onSend]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-send-channel/on-send.html

<!--- INDEX kotlinx.coroutines.selects -->

[select]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.selects/select.html

<!--- END -->