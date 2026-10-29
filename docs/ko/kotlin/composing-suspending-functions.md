<!--- TEST_NAME ComposingGuideTest -->
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 일시 중단 함수 구성하기)

이 섹션에서는 일시 중단 함수(suspending functions)를 구성하는 다양한 접근 방식을 다룹니다.

## 기본적으로 순차적 {id="sequential-by-default"}

어딘가에 원격 서비스 호출이나 계산과 같은 유용한 작업을 수행하는 두 개의 일시 중단 함수가 정의되어 있다고 가정해 봅시다. 이 예제에서는 유용한 작업을 수행하는 것처럼 보이기 위해 각각 1초 동안 지연(delay)되도록 구현했습니다.

```kotlin
suspend fun doSomethingUsefulOne(): Int {
    delay(1000L) // 여기서 유용한 작업을 수행한다고 가정합니다.
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // 여기서도 유용한 작업을 수행한다고 가정합니다.
    return 29
}
```

만약 이 함수들이 _순차적으로_ 호출되어야 한다면(먼저 `doSomethingUsefulOne`을 실행한 _다음_ `doSomethingUsefulTwo`를 실행하고, 그 결과들의 합계를 계산해야 한다면) 어떻게 해야 할까요? 실제 상황에서는 첫 번째 함수의 결과를 바탕으로 두 번째 함수를 호출할지 여부를 결정하거나, 어떻게 호출할지 결정해야 할 때 이 방식을 사용합니다.

코루틴 내의 코드는 일반적인 코드와 마찬가지로 기본적으로 _순차적(sequential)_ 이기 때문에, 일반적인 순차적 호출 방식을 사용합니다. 다음 예제는 두 일시 중단 함수를 실행하는 데 걸리는 총 시간을 측정하여 이를 증명합니다.

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

fun main() = runBlocking<Unit> {
//sampleStart
    val time = measureTimeMillis {
        val one = doSomethingUsefulOne()
        val two = doSomethingUsefulTwo()
        println("The answer is ${one + two}")
    }
    println("Completed in $time ms")
//sampleEnd    
}

suspend fun doSomethingUsefulOne(): Int {
    delay(1000L) // 여기서 유용한 작업을 수행한다고 가정합니다.
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // 여기서도 유용한 작업을 수행한다고 가정합니다.
    return 29
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-compose-01.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-compose-01.kt)에서 확인할 수 있습니다.
>
{style="note"}

출력 결과는 다음과 같습니다.

```text
The answer is 42
Completed in 2017 ms
```

<!--- TEST ARBITRARY_TIME -->

## async를 이용한 동시 실행 {id="concurrent-using-async"}

만약 `doSomethingUsefulOne`과 `doSomethingUsefulTwo` 호출 사이에 의존성이 없고, 두 함수를 _동시(concurrently)_ 에 실행하여 더 빠르게 결과를 얻고 싶다면 어떻게 해야 할까요? 이때 [async]가 도움이 됩니다.

개념적으로 [async]는 [launch]와 비슷합니다. 이는 다른 모든 코루틴과 동시에 작동하는 경량 스레드인 별도의 코루틴을 시작합니다. 차이점은 `launch`가 [Job]을 반환하고 결과값을 가지지 않는 반면, `async`는 나중에 결과를 제공하겠다는 약속을 나타내는 경량 논블로킹 퓨처인 [Deferred]를 반환한다는 것입니다. `Deferred` 값에 `.await()`를 사용하여 최종 결과를 얻을 수 있으며, `Deferred` 또한 `Job`이므로 필요한 경우 취소할 수 있습니다.

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

fun main() = runBlocking<Unit> {
//sampleStart
    val time = measureTimeMillis {
        val one = async { doSomethingUsefulOne() }
        val two = async { doSomethingUsefulTwo() }
        println("The answer is ${one.await() + two.await()}")
    }
    println("Completed in $time ms")
//sampleEnd    
}

suspend fun doSomethingUsefulOne(): Int {
    delay(1000L) // 여기서 유용한 작업을 수행한다고 가정합니다.
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // 여기서도 유용한 작업을 수행한다고 가정합니다.
    return 29
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-compose-02.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-compose-02.kt)에서 확인할 수 있습니다.
>
{style="note"}

출력 결과는 다음과 같습니다.

```text
The answer is 42
Completed in 1017 ms
```

<!--- TEST ARBITRARY_TIME -->

두 코루틴이 동시에 실행되었기 때문에 시간이 절반으로 줄었습니다. 코루틴을 사용한 동시성은 항상 명시적이라는 점에 유의하세요.

## 지연 시작하는 async {id="lazily-started-async"}

선택적으로, [async]의 `start` 파라미터를 [CoroutineStart.LAZY]로 설정하여 지연 시작하도록 만들 수 있습니다. 이 모드에서는 [await][Deferred.await]를 통해 결과가 필요하거나, `Job`의 [start][Job.start] 함수가 호출될 때만 코루틴을 시작합니다. 다음 예제를 실행해 보세요.

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

fun main() = runBlocking<Unit> {
//sampleStart
    val time = measureTimeMillis {
        val one = async(start = CoroutineStart.LAZY) { doSomethingUsefulOne() }
        val two = async(start = CoroutineStart.LAZY) { doSomethingUsefulTwo() }
        // 어떤 계산 수행
        one.start() // 첫 번째 시작
        two.start() // 두 번째 시작
        println("The answer is ${one.await() + two.await()}")
    }
    println("Completed in $time ms")
//sampleEnd    
}

suspend fun doSomethingUsefulOne(): Int {
    delay(1000L) // 여기서 유용한 작업을 수행한다고 가정합니다.
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // 여기서도 유용한 작업을 수행한다고 가정합니다.
    return 29
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-compose-03.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-compose-03.kt)에서 확인할 수 있습니다.
>
{style="note"}

출력 결과는 다음과 같습니다.

```text
The answer is 42
Completed in 1017 ms
```

<!--- TEST ARBITRARY_TIME -->

여기서는 이전 예제처럼 두 코루틴이 즉시 실행되지 않고 정의만 되어 있으며, [start][Job.start]를 호출하여 정확히 언제 실행을 시작할지에 대한 제어권을 프로그래머가 갖습니다. 먼저 `one`을 시작하고, 그 다음 `two`를 시작한 후 각각의 코루틴이 완료되기를 기다립니다(await).

만약 개별 코루틴에 대해 [start][Job.start]를 먼저 호출하지 않고 `println`에서 [await][Deferred.await]를 호출하면, [await][Deferred.await]가 코루틴 실행을 시작하고 완료될 때까지 기다리므로 순차적으로 동작하게 됩니다. 이는 지연 실행(laziness)의 의도된 유스케이스가 아닙니다. `async(start = CoroutineStart.LAZY)`의 유스케이스는 값의 계산에 일시 중단 함수가 포함될 때 표준 [lazy](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/lazy.html) 함수를 대체하는 것입니다.

## async 스타일 함수 {id="async-style-functions"}

> async 함수를 사용하는 이 프로그래밍 스타일은 다른 프로그래밍 언어에서 인기 있는 스타일이기 때문에 설명을 위해 여기에 제공됩니다. 하지만 코틀린 코루틴에서 이 스타일을 사용하는 것은 아래 설명된 이유로 **강력히 권장되지 않습니다**.
>
{style="note"}

구조화된 동시성(structured concurrency)을 벗어나기 위해 [GlobalScope]를 사용하여 `doSomethingUsefulOne`과 `doSomethingUsefulTwo`를 _비동기적으로_ 호출하는 async 스타일 함수를 정의할 수 있습니다. 이러한 함수들은 비동기 계산을 시작할 뿐이며 결과를 얻기 위해 결과로 반환된 지연된(deferred) 값을 사용해야 한다는 점을 강조하기 위해 "...Async" 접미사를 붙여 이름을 짓습니다.

> [GlobalScope]는 사소하지 않은 방식으로 부작용을 일으킬 수 있는 섬세한 API이며, 그중 하나는 아래에서 설명됩니다. 따라서 `@OptIn(DelicateCoroutinesApi::class)`를 사용하여 `GlobalScope` 사용을 명시적으로 허용해야 합니다.
>
{style="note"}

```kotlin
// somethingUsefulOneAsync의 결과 타입은 Deferred<Int>입니다.
@OptIn(DelicateCoroutinesApi::class)
fun somethingUsefulOneAsync() = GlobalScope.async {
    doSomethingUsefulOne()
}

// somethingUsefulTwoAsync의 결과 타입은 Deferred<Int>입니다.
@OptIn(DelicateCoroutinesApi::class)
fun somethingUsefulTwoAsync() = GlobalScope.async {
    doSomethingUsefulTwo()
}
```

이러한 `xxxAsync` 함수들은 일시 중단 함수가 **아니라는** 점에 유의하세요. 이들은 어디서나 사용할 수 있습니다. 그러나 이들을 사용하는 것은 항상 호출하는 코드와 동시에 액션이 비동기적으로(여기서는 동시 실행을 의미함) 실행됨을 의미합니다.
 
다음 예제는 코루틴 외부에서의 사용법을 보여줍니다.

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

//sampleStart
// 이 예제에서 main의 오른쪽에 `runBlocking`이 없다는 점에 유의하세요.
fun main() {
    val time = measureTimeMillis {
        // 코루틴 외부에서 비동기 액션을 시작할 수 있습니다.
        val one = somethingUsefulOneAsync()
        val two = somethingUsefulTwoAsync()
        // 하지만 결과를 기다릴 때는 일시 중단 또는 블로킹이 포함되어야 합니다.
        // 여기서는 결과를 기다리는 동안 메인 스레드를 블록하기 위해 `runBlocking { ... }`을 사용합니다.
        runBlocking {
            println("The answer is ${one.await() + two.await()}")
        }
    }
    println("Completed in $time ms")
}
//sampleEnd

@OptIn(DelicateCoroutinesApi::class)
fun somethingUsefulOneAsync() = GlobalScope.async {
    doSomethingUsefulOne()
}

@OptIn(DelicateCoroutinesApi::class)
fun somethingUsefulTwoAsync() = GlobalScope.async {
    doSomethingUsefulTwo()
}

suspend fun doSomethingUsefulOne(): Int {
    delay(1000L) // 여기서 유용한 작업을 수행한다고 가정합니다.
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // 여기서도 유용한 작업을 수행한다고 가정합니다.
    return 29
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-compose-04.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-compose-04.kt)에서 확인할 수 있습니다.
>
{style="note"}

<!--- TEST ARBITRARY_TIME
The answer is 42
Completed in 1085 ms
-->

`val one = somethingUsefulOneAsync()` 라인과 `one.await()` 표현식 사이에 코드 로직 오류가 발생하여 프로그램이 예외를 던지고 수행 중이던 작업이 중단된다고 가정해 봅시다. 보통 글로벌 에러 핸들러가 이 예외를 잡아 로그를 남기고 개발자에게 보고할 수 있지만, 프로그램은 다른 작업을 계속 수행할 수 있습니다. 그러나 여기서는 작업을 시작한 프로그램은 중단되었음에도 불구하고 `somethingUsefulOneAsync`가 백그라운드에서 여전히 실행 중인 상태가 됩니다. 아래 섹션에서 보여주듯, 구조화된 동시성에서는 이러한 문제가 발생하지 않습니다.

## async를 이용한 구조화된 동시성 {id="structured-concurrency-with-async"}

[async를 이용한 동시 실행](#concurrent-using-async) 예제를 `doSomethingUsefulOne`과 `doSomethingUsefulTwo`를 동시에 실행하고 그 합계 결과를 반환하는 함수로 리팩토링해 보겠습니다. [async]는 [CoroutineScope]의 확장 함수이므로, [coroutineScope][_coroutineScope] 함수를 사용하여 필요한 스코프를 제공합니다.

```kotlin
suspend fun concurrentSum(): Int = coroutineScope {
    val one = async { doSomethingUsefulOne() }
    val two = async { doSomethingUsefulTwo() }
    one.await() + two.await()
}
```

이렇게 하면 `concurrentSum` 함수 내부 코드에서 문제가 발생하여 예외가 발생할 경우, 해당 스코프 내에서 실행된 모든 코루틴이 취소됩니다.

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

fun main() = runBlocking<Unit> {
//sampleStart
    val time = measureTimeMillis {
        println("The answer is ${concurrentSum()}")
    }
    println("Completed in $time ms")
//sampleEnd    
}

suspend fun concurrentSum(): Int = coroutineScope {
    val one = async { doSomethingUsefulOne() }
    val two = async { doSomethingUsefulTwo() }
    one.await() + two.await()
}

suspend fun doSomethingUsefulOne(): Int {
    delay(1000L) // 여기서 유용한 작업을 수행한다고 가정합니다.
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // 여기서도 유용한 작업을 수행한다고 가정합니다.
    return 29
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-compose-05.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-compose-05.kt)에서 확인할 수 있습니다.
>
{style="note"}

위의 `main` 함수 출력 결과를 통해 알 수 있듯이, 두 작업은 여전히 동시에 실행됩니다.

```text
The answer is 42
Completed in 1017 ms
```

<!--- TEST ARBITRARY_TIME -->

취소는 항상 코루틴 계층 구조를 통해 전파됩니다.

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
    try {
        failedConcurrentSum()
    } catch(e: ArithmeticException) {
        println("Computation failed with ArithmeticException")
    }
}

suspend fun failedConcurrentSum(): Int = coroutineScope {
    val one = async<Int> { 
        try {
            delay(Long.MAX_VALUE) // 매우 긴 계산을 에뮬레이션합니다.
            42
        } finally {
            println("First child was cancelled")
        }
    }
    val two = async<Int> { 
        println("Second child throws an exception")
        throw ArithmeticException()
    }
    one.await() + two.await()
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-compose-06.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-compose-06.kt)에서 확인할 수 있습니다.
>
{style="note"}

자식 중 하나(`two`)가 실패했을 때 첫 번째 `async`와 대기 중인 부모가 모두 어떻게 취소되는지 확인하세요.
```text
Second child throws an exception
First child was cancelled
Computation failed with ArithmeticException
```

<!--- TEST -->

<!--- MODULE kotlinx-coroutines-core -->
<!--- INDEX kotlinx.coroutines -->

[async]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html
[launch]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html
[Job]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/index.html
[Deferred]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-deferred/index.html
[CoroutineStart.LAZY]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-start/-l-a-z-y/index.html
[Deferred.await]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-deferred/await.html
[Job.start]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/start.html
[GlobalScope]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-global-scope/index.html
[CoroutineScope]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/index.html
[_coroutineScope]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/coroutine-scope.html

<!--- END -->