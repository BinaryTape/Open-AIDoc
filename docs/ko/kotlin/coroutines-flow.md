<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 플로우(Flows))

플로우는 비동기적으로 생성될 수 있는 순차적인 값의 스트림을 나타냅니다.
단일 값을 반환하는 중단 함수(suspending function)와 달리, 플로우를 사용하면 시간에 따라 여러 개의 순차적인 값을 처리할 수 있습니다.

플로우를 사용하여 데이터를 점진적으로 로드하고, 이벤트 스트림에 반응하며, 구독 스타일의 API를 모델링하는 _플로우 파이프라인(flow pipelines)_을 만들 수 있습니다.

플로우 파이프라인은 다음과 같은 역할들을 포함하는 일련의 작업 순서입니다:

* **이미터(Emitter)**: 값을 생성합니다.
* **중간 연산자(Intermediate operators, 선택 사항)**: 플로우에서 값을 소비하고, 해당 값에 연산을 적용한 후 다른 플로우를 반환합니다.
* **수집기(Collector)**: 플로우에서 값을 소비합니다.

다음은 이러한 파이프라인 역할이 어떻게 함께 작동하는지 보여주는 간단한 예제입니다:

```kotlin
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun main() {
    // 이미터(Emitter)가 값을 생성합니다
    flowOf(0x4B, 0x6F, 0x74, 0x6C, 0x69, 0x6E)
        // 중간 연산자가 값을 소비하고,
        // 연산을 적용한 뒤 다른 플로우를 반환합니다
        .map { value -> value.toChar() }
        // 수집기(Collector)가 변환된 값을 소비합니다
        .collect { updatedValue ->
            println("Say '$updatedValue'!")
        }
}
//sampleEnd
```
{kotlin-runnable="true"}

플로우에서 값은 이미터에서 수집기 방향으로, 즉 *업스트림(upstream)*에서 *다운스트림(downstream)*으로 이동합니다.
중간 연산자는 업스트림 플로우를 수집하고, 해당 값에 연산을 적용한 다음, 새로운 다운스트림 플로우를 반환합니다.
이 다운스트림 플로우는 다음 수집기를 위한 업스트림 플로우가 될 수 있습니다.

![플로우의 구성 요소: 이미터, 중간 연산자 (선택 사항), 수집기. 값은 업스트림에서 다운스트림으로 이동합니다.](flow-upstream-downstream.svg){width=700}

Kotlin은 다음과 같은 플로우 유형을 제공합니다:

* [**콜드 플로우(Cold flows)**](#cold-flows)는 수집(collect)될 때 값을 생성하기 시작합니다. 각 수집기마다 플로우의 새롭고 독립적인 실행이 트리거됩니다.
* [**핫 플로우(Hot flows)**](#hot-flows)는 수집기와 무관하게 값을 방출하며, 모든 수집기와 동일한 값의 스트림을 공유합니다.

> Kotlin 플로우를 테스트하려면 [Turbine 라이브러리](https://github.com/cashapp/turbine)를 사용할 수 있습니다.
> 이 라이브러리는 완료 및 실패 사례를 포함하여 유닛 테스트에서 플로우 방출을 수집하고 검증(assert)하는 작업을 단순화해 줍니다.
> 
{style="tip"}

## 콜드 플로우 (Cold flows)

[시퀀스(sequences)](sequences.md)와 마찬가지로, 콜드 플로우는 지연(lazy) 방식입니다.

콜드 플로우 빌더의 코드 블록은 수집기가 이를 수집할 때까지 실행되지 않습니다.
각각의 새로운 수집기는 플로우의 새로운 실행을 시작합니다.

### 콜드 플로우 생성하기

콜드 플로우를 만들려면 [`flow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow.html) 빌더 함수를 사용하세요.
블록 내부에서 [`emit()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow-collector/emit.html) 함수를 사용하여 수집기에게 값을 방출합니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
fun main() {
    // 플로우를 생성합니다
    val pageFlow = flow {
        for (page in 1..3) {
            println("Loading page $page...")

            // 각 페이지가 로드될 때마다 방출합니다
            emit("Page $page")
        }
    }
    println("Creating a cold flow doesn't run it!")
}
//sampleEnd
```
{kotlin-runnable="true"}

이 예제에서 `flow()` 빌더 함수는 [`Flow<T>`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow/)를 반환하지만, 해당 블록을 실행하기 시작하지는 않습니다.
콜드 플로우는 요리 레시피와 같습니다. 값을 생성하는 방법은 정의하지만, 실제로 값을 생성하기 시작하는 것은 [수집할 때](#collect-a-cold-flow)뿐입니다.

다음 함수들을 사용하여 콜드 플로우를 생성할 수도 있습니다:

* [`flowOf()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow-of.html): 제공된 값들로부터 플로우를 생성합니다.
* [`.asFlow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/as-flow.html): 범위(range)와 같은 기존의 반복 가능한(iterable) 객체를 플로우로 변환합니다.

예시는 다음과 같습니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() {
    // 제공된 값들로 플로우 생성
    val predefinedPageFlow = flowOf("Page 1", "Page 2", "Page 3")
    // 범위(range)로부터 플로우 생성
    val generatedPageFlow = (1..3).asFlow()
}
```

### 콜드 플로우 수집하기

콜드 플로우를 수집하려면 [`collect()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/collect.html) 함수를 사용하세요. 이 함수는 업스트림 플로우로부터 방출을 트리거합니다.
`collect()`에 람다를 전달하면, 방출되는 각 값을 해당 람다에서 받게 됩니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default) {
        val pageFlow = flow {
            for (page in 1..3) {
                println("Loading page $page...")
                emit("Page $page")
            }
        }
        // 방출된 각 페이지를 받는 람다와 함께 플로우를 수집합니다
        pageFlow.collect { page ->
            println("Processing $page...")
            delay(100.milliseconds)
            println("Done processing $page.")
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

`collect()`를 호출할 때마다 콜드 플로우는 처음부터 전체가 다시 실행됩니다.
여러 수집기가 동일한 콜드 플로우를 수집하는 경우, 각 수집기는 자신만의 독립적인 수집 과정을 트리거합니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
suspend fun main() {
    val pageFlow = flow {
        // 현재 코루틴의 이름을 읽습니다
        val coroutineName = currentCoroutineContext()[CoroutineName]?.name

        println("Starting emissions in $coroutineName")
        for (page in 1..3) {
            println("Loading page $page in $coroutineName")
            emit("Page $page")
        }
        println("Done emitting in $coroutineName")
    }

    withContext(Dispatchers.Default) {
        // 각 페이지를 천천히 처리하는 수집기를 실행합니다
        launch(CoroutineName("a slow coroutine")) {
            pageFlow.collect {
                println("Processing $it slowly")
                delay(100.milliseconds)
                println("Done processing $it slowly")
            }
        }

        // 각 페이지를 빠르게 처리하는 수집기를 실행합니다
        launch(CoroutineName("a fast coroutine")) {
            pageFlow.collect {
                println("Processing $it quickly")
                delay(10.milliseconds)
                println("Done processing $it quickly")
            }
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

이 예제에서 [`CoroutineName`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-name/)은 각 코루틴에 이름을 추가합니다.
`CoroutineName`은 [디버깅](coroutine-context-and-dispatchers.md#naming-coroutines-for-debugging)에 사용할 수 있습니다. 여기서는 어떤 수집기가 각 수집 과정을 실행하는지 보여주는 데 도움이 됩니다.

### 중간 플로우 연산자

중간 연산자는 업스트림 플로우에 연산을 적용하고 새로운 다운스트림 플로우를 반환합니다.
이들은 콜드 방식이므로, 업스트림 플로우가 핫 플로우일 때조차도 반환된 플로우가 수집되기 전까지는 값을 처리하지 않습니다.

[kotlinx.coroutines](https://github.com/Kotlin/kotlinx.coroutines) 라이브러리는 플로우 변환 및 처리를 위한 [광범위한 중간 플로우 연산자](coroutines-flow-operators.md)를 제공합니다.
기본 제공 연산자가 제공하지 않는 동작이 필요할 때는 직접 커스텀 연산자를 정의할 수도 있습니다.

다음은 방출된 각 값에 변환을 적용하는 단순화된 커스텀 [`.map()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map.html) 연산자의 예제입니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
// 기본 .map() 연산자의 단순화된 커스텀 구현
fun <T, R> Flow<T>.myMap(transform: suspend (value: T) -> R): Flow<R> = flow {
    // 업스트림 플로우로부터 값을 수집합니다
    this@myMap.collect { value ->
        // 수집된 각 값을 변환하고 결과를 방출합니다
        emit(transform(value))
    }
}

suspend fun main() {
    // 플로우를 생성하고, 커스텀 map 연산자를 적용한 뒤, 변환된 값을 수집합니다
    flowOf(1, 2, 3).myMap { 2 * it }.collect {
        println("Collecting $it")
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

#### 플로우 빌더 내부에서 중단 함수 호출하기

시퀀스와 달리, `flow()` 빌더 함수 내부에서는 중단 함수를 호출할 수 있습니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun loadPage(): Int {
    delay(100)
    return 3
}

suspend fun main() {
    flow {
        emit(loadPage())
    }.collect {
        println(it)
        // 3
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

하지만, `flow()` 빌더 함수는 실행되는 코루틴 컨텍스트와 동일한 컨텍스트에서 값을 방출해야 합니다.
블록 내에서 `emit()`을 호출하는 다른 코루틴을 시작할 수 없으며, `withContext()`를 사용하여 코루틴 컨텍스트를 변경할 수도 없습니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun main() {
    // 예외가 발생하며 실패합니다!
    flow {
        // withContext()로 코루틴 컨텍스트를 변경함
        withContext(Dispatchers.IO) {
            emit('a')
        }
    }.collect { 
        println("This never prints")
    }
}
//sampleEnd
```
{kotlin-runnable="true" validate="false"}

이 제한은 `flow()` 빌더 함수에 적용됩니다.

업스트림 플로우가 다른 코루틴 컨텍스트에서 실행되어야 한다면, [`.flowOn()` 연산자를 사용하여 변경](#change-the-coroutine-context-of-a-cold-flow-with-flowon)할 수 있습니다.

또는, [`channelFlow()`](#emit-values-concurrently-with-channelflow)를 사용하여 여러 코루틴에서 값을 방출할 수 있습니다.

#### `.flowOn()`으로 콜드 플로우의 코루틴 컨텍스트 변경하기

기본적으로 콜드 플로우는 수집기와 동일한 코루틴 컨텍스트에서 실행됩니다.

플로우를 다른 코루틴 컨텍스트에서 실행하고 싶다면, [`.flowOn()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow-on.html) 연산자를 사용하세요.
이 연산자는 *컨텍스트 보존(context-preserving)* 방식입니다.
다운스트림 플로우는 호출자의 컨텍스트에 유지하면서 업스트림 플로우의 코루틴 컨텍스트만 변경합니다.

다음은 한 코루틴 컨텍스트에서 값을 방출하고 다른 컨텍스트에서 이를 수집하는 콜드 플로우의 예제입니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default + CoroutineName("downstream")) {
        flow {
            val coroutineName = currentCoroutineContext()[CoroutineName]?.name

            // .flowOn()으로 적용된 코루틴 컨텍스트에서 방출합니다
            println("Emitting '1' in $coroutineName")
            // Emitting '1' in upstream
            emit(1)

        // 업스트림 플로우의 코루틴 컨텍스트를 변경합니다
        }.flowOn(Dispatchers.IO + CoroutineName("upstream"))
            .collect {
            val coroutineName = currentCoroutineContext()[CoroutineName]?.name

            // 호출자의 코루틴 컨텍스트에서 수집합니다
            println("Collecting '$it' in $coroutineName")
            // Collecting '1' in downstream
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

### 플로우의 예외 처리

이미터와 수집기 모두 예외를 던질 수 있습니다.

플로우 수집 중에 예외를 처리하지 않으면, 예외는 수집기에서 업스트림으로 전파되어 `collect()` 함수의 호출자에게 던져집니다.

예를 들어, `collect()` 함수를 `try-catch` 블록으로 감싸서 이러한 예외를 처리할 수 있습니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

class MyFlowException(message: String) : Exception(message)

//sampleStart
suspend fun main() {
    val myFlow = flow {
        try {
            // emit() 함수는 collect()에 전달된 람다를 호출합니다
            emit('a')
        } catch (e: MyFlowException) {
            println("Collector threw $e")

            // 다운스트림 예외를 다시 던집니다
            throw e
        }
    }
    // 플로우 수집을 try-catch로 감쌉니다
    try {
        myFlow.collect {
            // collect() 람다에서 예외를 던집니다
            throw MyFlowException("Can't process '$it'!")
        }
    } catch (e: MyFlowException) {
        println("Flow collection failed with $e")
        // 호출자에게 예외를 다시 던집니다
        throw e
    }
}
//sampleEnd
```
{kotlin-runnable="true" validate="false"}

이 예제에서 수집기는 `emit()` 함수로부터 값을 받을 때 예외를 던집니다.
`flow()` 빌더 함수는 이 다운스트림 예외를 포착합니다.

플로우 빌더 함수 내부에서 수집기에 의해 발생한 예외를 포착한 경우, 이를 다시 던져야(rethrow) 합니다.
이렇게 해야 예외 투명성(exception transparency)이 유지되어 `collect()` 호출자가 예외를 처리할 수 있게 됩니다.

#### `.catch()` 연산자를 사용하여 업스트림 예외 처리하기

예외가 수집기에 도달하기 전에 처리하려면 [`.catch()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/catch.html) 연산자를 사용하세요.

`.catch()` 연산자를 사용하면 업스트림 플로우의 예외를 처리할 수 있습니다. 예를 들어 `emit()` 함수를 사용하여 다운스트림으로 대체(fallback) 값을 방출할 수 있습니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
suspend fun main() {
    flow {
        emit("a")
        emit("b")

        // 업스트림 플로우에서 예외를 던집니다
        throw UnsupportedOperationException(
            "I am tired of listing letters"
        )
    }.catch { upstreamException ->
        println("Upstream completed with $upstreamException!")

        // 다운스트림으로 대체 값을 방출합니다
        emit("Upstream terminated with an exception!")
    }.collect {
        println("Got '$it'")
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

이 예제에서 업스트림 플로우는 예외를 던지기 전에 값을 방출합니다.
`.catch()` 연산자는 예외를 처리하고 대체 값으로 `"Upstream terminated with an exception!"`을 방출합니다.

정상적인 작동 중에 플로우에서 일부 예외가 발생할 것으로 예상되는 경우, `.catch()`에서 복구 가능한 예외를 처리하고 예상치 못한 예외는 다시 던지세요.

다음은 플로우가 데이터를 로드하고 진행 상황을 보고하는 예제입니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
sealed interface LoadingState {
    sealed interface Terminal: LoadingState
    object Started: LoadingState
    data class Percentage(val percents: Int): LoadingState
    object Failed: Terminal
    object Done: Terminal
}

fun loadBlob(url: String) = flow {
    emit(LoadingState.Started)

    val failureChancePerStep = 1 - java.lang.Math.pow(0.99, 10.0)

    repeat(10) { step ->
        if (Random.nextDouble() < failureChancePerStep)
            throw IOException("Failed to load!")
        emit(LoadingState.Percentage((step + 1) * 10))
        delay(10.milliseconds)
    }
    emit(LoadingState.Done)
}.catch { e ->
    println("Loading data failed with $e")
    if (e is IOException) {
        // 예상된 예외를 처리합니다
        emit(LoadingState.Failed)
    } else {
        // 예상치 못한 예외는 다시 던져서 collect()가 해당 예외와 함께 실패하도록 합니다
        throw e
    }
}

suspend fun main() {
    loadBlob("https://example.com/").collect {
        println("Got '$it'")
    }
}
//sampleEnd
```
{kotlin-runnable="true" validate="false"}

이 예제에서 로딩 중에 예상된 예외가 발생하면 `.catch()` 연산자가 `emit()` 함수를 사용하여 대체 상태를 방출합니다.
예상치 못한 예외의 경우 `.catch()` 연산자 내에서 다시 던집니다.
이렇게 하면 `collect()` 함수의 호출자가 플로우에서 처리하지 않은 예외를 받을 수 있습니다.

`.catch()` 연산자는 수집기에서 발생한 예외는 처리하지 않습니다.
`collect()`에 전달된 람다가 예외를 던지는 경우, `collect()` 함수 주변을 `try-catch` 블록으로 감싸서 처리하세요:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

suspend fun main() {
    val myFlow = flow {
        for (char in listOf('a', 'o', '5', 'c')) {
            try {
                emit(char)
            } catch (e: IllegalArgumentException) {
                println("Collector doesn't support character '$char': $e")

                // 다운스트림 예외를 다시 던집니다
                throw e
            }
        }
    }.catch { e ->
        // 예외가 다운스트림에서 발생했기 때문에 실행되지 않습니다
        println("Upstream threw an exception: $e")
    }

    try {
        myFlow.collect {
            require(!it.isDigit()) { "Digits are not allowed!" }
        }
    } catch (e: IllegalArgumentException) {
        // collect() 람다에서 발생한 예외를 처리합니다
        println("Flow collection failed with $e")
    }
}
```
{kotlin-runnable="true"}

`collect()` 람다는 `.catch()` 이후에 실행되므로, `.catch()`를 사용하여 거기서 발생한 예외를 처리할 수 없습니다.
방출된 각 값에 대해 실행되는 코드에서 발생하는 예외를 `.catch()`로 처리하려면, 해당 코드를 `.catch()` 이전의 [.onEach()](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-each.html)에 두세요.

`.onEach()` 연산자는 각 값이 다운스트림으로 방출되기 전에 람다를 실행합니다.
`.catch()`가 `.onEach()`의 예외를 처리하면 플로우가 완료되고 다음 값을 방출하지 않습니다.

예시는 다음과 같습니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds

suspend fun main() {
    flowOf('a', 'o', '5', 'c')
        // 각 값이 다운스트림으로 방출되기 전에 실행됩니다
        .onEach {
            require(!it.isDigit()) { "Digits are not allowed!" }
            println("Got '$it'")
        }
        .catch { e ->
            println("Caught an exception: $e")
        }
        .collect()
}
```
{kotlin-runnable="true"}

이 예제에서 `.onEach()` 연산자는 `.catch()`보다 업스트림에서 실행되므로, `'5'`에 대해 `require()` 체크가 실패할 때 `.catch()` 연산자가 예외를 처리하게 됩니다.

#### 예외 발생 후 업스트림 플로우 재시작하기

연결이 끊긴 네트워크 요청과 같이 일부 작업은 일시적으로 실패할 수 있습니다.
이러한 경우 [`.retry()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/retry.html) 연산자를 사용하여 예외 발생 후 업스트림 플로우를 재시작할 수 있습니다.

`.retry()` 연산자는 예외를 수신하고 람다가 `true`를 반환할 때 지정된 재시도 횟수까지 수집을 재시작합니다.
예를 들어 `.retry(3)`은 첫 번째 실패 후 최대 세 번까지 업스트림 플로우를 재시도합니다.

람다가 `false`를 반환하면 `.retry()`는 재시도를 중단하고 예외를 다시 던집니다.

> 재시도 로직을 더 세밀하게 제어하려면 [`.retryWhen()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/retry-when.html) 연산자를 사용하세요.
> `.retry()`와 마찬가지로 예외를 받지만, 현재 시도 횟수도 함께 받으며 재시도 전에 값을 방출할 수도 있습니다.
>
{style="note"}

다음은 `IOException` 발생 후 최대 세 번까지 로딩을 재시도하는 예제입니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds

//sampleStart
sealed interface LoadingState {
    sealed interface Terminal: LoadingState
    object Started: LoadingState
    data class Percentage(val percents: Int): LoadingState
    object Failed: Terminal
    object Done: Terminal
}

fun loadBlob(url: String) = flow {
    emit(LoadingState.Started)

    val failureChancePerStep = 1 - java.lang.Math.pow(0.99, 10.0)

    repeat(10) { step ->
        if (Random.nextDouble() < failureChancePerStep)
            throw IOException("Failed to load!")
        emit(LoadingState.Percentage((step + 1) * 10))
        delay(10.milliseconds)
    }
    emit(LoadingState.Done)
}.retry(3) { e ->
    if (e is IOException) {
        // 이는 예상된 오류입니다
        // 재시도 전 1초간 대기합니다
        delay(1.seconds)
        true
    } else {
        // 재시도를 중단하고 예상치 못한 예외는 다시 던집니다
        false
    }
}

suspend fun main() {
    loadBlob("https://example.org/").collect {
        println("Got $it")
    }
}
//sampleEnd
```
{kotlin-runnable="true" validate="false"}

### 플로우 취소

플로우 취소는 요청 타임아웃 등 결과가 더 이상 필요하지 않을 때 수집을 중단합니다.

플로우 수집은 `collect()` 함수를 호출하는 코루틴에 연결되어 있습니다.
해당 코루틴이 취소되면 수집이 중단되고 업스트림 플로우도 함께 취소됩니다.

플로우 수집을 취소하려면 수집 중인 코루틴의 `Job`에서 `cancel()` 함수를 호출하세요:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
val myFlow = flow {
    var i = 0
    try {
        while (true) {
            println("Emitting $i")
            emit(i)
            println("Emitted $i")
            ++i
            delay(10.milliseconds)
        }
    } catch (e: Throwable) {
        println("Upstream finished with $e")
        throw e
    }
}

suspend fun main() {
    coroutineScope {
        val job = launch {
            try {
                myFlow.collect {
                    println("Processing $it")
                    delay(5.milliseconds)
                }
            } catch (e: Throwable) {
                println("Collection finished with $e")
                throw e
            }
        }
        delay(100.milliseconds)

        // 플로우를 수집하는 코루틴을 취소합니다
        job.cancel()
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

수집기 코루틴이 활성 상태를 유지하는 동안에도 수집기가 업스트림 플로우를 취소할 수 있습니다.
이렇게 하려면 수집기에서 `CancellationException`을 던지면 됩니다.

[`.take()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/take.html) 연산자는 정해진 개수의 값을 받은 후 수집을 중단하기 위해 이 동작을 사용합니다.
예를 들어 `.take(3)`은 업스트림 플로우에서 처음 세 개의 값만 수집한 다음 플로우를 취소합니다.

다음은 `.take()` 연산자의 단순화된 버전을 사용하는 예제입니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
// 기본 .take() 연산자의 단순화된 버전 정의
fun <T> Flow<T>.myTake(count: Int): Flow<T> = flow {
    require(count > 0)
    val cancellationException = CancellationException()
    var elementsRemaining = count
    try {
        this@myTake.collect {
            emit(it)
            --elementsRemaining
            if (elementsRemaining == 0) {
                // 요청된 수만큼의 값을 받은 후 업스트림 플로우를 취소합니다
                throw cancellationException
            }
        }
    } catch (e: Throwable) {
        if (e === cancellationException) {
            // 업스트림 플로우를 취소하기 위해 사용된 CancellationException을 처리합니다
            // .myTake()에서 설정한 수만큼의 값을 받은 후 플로우를 완료합니다
        } else {
            // 예상치 못한 예외는 다시 던집니다
            throw e
        }
    }
}

suspend fun main() {
    (0..1000).asFlow().myTake(3).collect {
        println("Got $it")
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

이 예제에서 `.myTake()` 함수는 요청된 모든 값이 방출될 때까지 업스트림 플로우의 값을 방출합니다.
그 후 `CancellationException`을 던져 업스트림 플로우를 취소합니다.

### `channelFlow()`로 값을 동시에 방출하기

`flow()` 빌더 함수는 하나의 코루틴에서 값을 방출하는 플로우에 대해 간단하고 효율적입니다.
동일한 플로우에 여러 코루틴에서 동시에 값을 방출하고 싶다면 [`channelFlow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/channel-flow.html) 빌더 함수를 사용하세요.
여러 소스에서 데이터를 로드하는 등 결과를 점진적으로 보고하는 병렬 작업에 유용합니다.

`channelFlow()` 빌더 함수는 여러 코루틴에서 값을 보내기 위해 [채널(channel)](channels.md)을 사용하는 콜드 플로우를 생성합니다.
빌더 내부에서는 `emit()` 함수 대신 [`send()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-send-channel/send.html) 함수를 사용하여 값을 생성합니다.

다음은 `channelFlow()`를 사용하여 두 개의 플로우를 동시에 수집하고, [`.merge()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/merge.html) 연산자의 단순화된 버전으로 그 값들을 다시 방출하는 예제입니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
// 기본 .merge() 연산자의 단순화된 버전 정의
fun <T> Flow<T>.myMerge(other: Flow<T>): Flow<T> = channelFlow {
    // 여기서는 CoroutineScope와 SendChannel을 리시버(receiver)로 사용할 수 있습니다
    // 리시버 플로우를 수집하는 코루틴을 실행합니다
    launch {
        // 리시버 플로우를 수집합니다
        this@myMerge.collect {
            send(it)
        }
    }
    launch {
        // 다른 플로우를 수집하는 코루틴을 실행합니다
        other.collect {
            // SendChannel.send를 호출합니다
            send(it)
        }
    }
}

suspend fun main() {
    val flow1 = (0..3).asFlow().onEach { delay(20.milliseconds) }
    val flow2 = (6..9).asFlow().onEach { delay(50.milliseconds) }
    flow1.myMerge(flow2).collect { println(it) }
}
//sampleEnd
```
{kotlin-runnable="true"}

`channelFlow()` 빌더 함수는 버퍼링된 채널을 사용하므로, 생산자가 버퍼가 가득 찰 때까지 수집기보다 앞서서 값을 보낼 수 있게 합니다.
기본적으로 버퍼는 최대 64개의 값을 보유할 수 있습니다.
버퍼가 가득 차면 생산자는 버퍼에 여유 공간이 생길 때까지 중단(suspend)됩니다.

[`.buffer()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/buffer.html) 연산자로 버퍼 용량을 변경할 수 있습니다.
예를 들어 `.buffer(12)`는 생산자가 수집기보다 최대 12개까지 앞서서 값을 보낼 수 있게 하며, `.buffer(0)`은 버퍼를 제거하여 수집기가 받을 수 있을 때만 각 값이 전송되도록 합니다.

예시는 다음과 같습니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
suspend fun main() {
    val oneHundredNumbers = channelFlow {
        repeat(100) {
            println("Sending $it")
            send(it)
        }
    }

    // 기본 버퍼 용량을 사용합니다
    oneHundredNumbers.collect {
        println("Processing $it")
        delay(10.milliseconds)
    }
  
    // 버퍼를 제거하여 전송과 처리가 처음부터 교차로 일어나게 합니다
    oneHundredNumbers.buffer(0).collect {
        println("Processing $it")
        delay(10.milliseconds)
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

이 예제에서 `oneHundredNumbers` 플로우는 기본 버퍼 용량을 사용하는 반면, `oneHundredNumbers.buffer(0)` 플로우는 버퍼가 없습니다.

기본 버퍼 용량을 사용하는 경우, 생산자는 버퍼가 가득 찰 때까지 값을 빠르게 보냅니다.
그 후에는 `send()`가 버퍼 공간이 생길 때까지 중단되므로 `Sending`과 `Processing` 메시지가 교차로 나타나기 시작합니다.

`.buffer(0)`을 사용하면 각 `send()` 호출이 수집기가 값을 받을 수 있을 때까지 기다리므로, `Sending`과 `Processing`이 처음부터 교차로 일어납니다.

## 핫 플로우 (Hot flows)

핫 플로우는 수집기와 무관하게 독립적으로 값을 방출하는 공유 스트림입니다.
활성화된 수집기가 없더라도 계속해서 값을 방출하며, 여러 수집기가 새로운 실행을 시작하는 대신 이미 활성화된 스트림에서 동일한 방출 내용을 공유하여 수집할 수 있습니다.

핫 플로우의 수집기는 *구독자(subscriber)*라고 불립니다.

채팅 메시지 수신, 사용자 액션 또는 UI 상태 변경과 같이 애플리케이션의 여러 부분이 동일한 업데이트 스트림에 반응해야 할 때 핫 플로우를 사용할 수 있습니다.

Kotlin은 두 가지 핫 플로우 유형을 제공합니다:

* [`SharedFlow`](#create-a-sharedflow)는 여러 구독자에게 값을 브로드캐스트합니다. 메시지나 알림과 같이 시간이 지남에 따라 발생하는 이벤트를 브로드캐스트해야 할 때 사용하세요.
* [`StateFlow`](#create-a-stateflow)는 항상 최신 상태 값을 보유하는 특수한 `SharedFlow`입니다. UI 상태와 같이 시간이 지남에 따라 변화하는 상태를 표현해야 할 때 사용하세요.

### `SharedFlow` 생성하기

[`SharedFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/)는 시간에 따라 방출되는 값을 구독자들에게 브로드캐스트하는 핫 플로우입니다.

[`MutableSharedFlow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-mutable-shared-flow.html) 함수를 사용하여 `SharedFlow`를 만들 수 있습니다.

`MutableSharedFlow`는 값을 방출하기 위한 함수들을 노출합니다. 만약 이를 직접 노출하면 클래스 외부의 코드에서도 플로우에 값을 방출할 수 있게 됩니다.

이를 방지하려면 가변(mutable) 플로우를 비공개 [백킹 프로퍼티(backing property)](properties.md#backing-properties)에 저장하고, [`.asSharedFlow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/as-shared-flow.html) 함수를 사용하여 읽기 전용 `SharedFlow`를 노출하세요.
구독자에게 값을 방출하려면 `MutableSharedFlow`에서 `emit()` 함수를 사용합니다:

```kotlin
data class Message(
    val senderId: Int,
    val time: Instant,
    val text: String,
)

class Chatroom {
    // SharedFlow를 비공개 백킹 프로퍼티에 저장합니다
    private val _messages = MutableSharedFlow<Message>()

    // 구독자에게 읽기 전용 SharedFlow를 노출합니다
    val messages: SharedFlow<Message>
        get() = _messages.asSharedFlow()

    suspend fun sendMessageToEveryone(message: Message) {
        // 구독자들에게 메시지를 방출합니다
        _messages.emit(message)
    }
}
```

콜드 플로우와 마찬가지로 `collect()` 함수를 사용하여 `SharedFlow`로부터 값을 수집할 수 있습니다.

또한 `SharedFlow`가 이미 방출된 값을 새로운 구독자에게 즉시 다시 전달(replay)하도록 구성할 수도 있습니다. 리플레이 캐시는 정해진 수의 이전 방출을 저장하는 작은 히스토리 버퍼처럼 작동합니다.

새로운 구독자가 받을 이전 방출 횟수를 설정하려면 `MutableSharedFlow()`의 `replay` 파라미터를 사용하세요:

```kotlin
// 새로운 구독자가 구독 시 받을 이미 방출된 메시지 수 설정
const val MESSAGES_TO_REMEMBER = 10

class Chatroom {
    private val _messages = MutableSharedFlow<Message>(

        // 새로운 구독자에게 마지막으로 방출된 메시지 수를 설정된 만큼 리플레이합니다
        replay = MESSAGES_TO_REMEMBER
    )

    val messages: SharedFlow<Message>
        get() = _messages.asSharedFlow()

    suspend fun sendMessageToEveryone(message: Message) {
        // 메시지 플로우의 구독자들에게 메시지를 방출합니다 
        _messages.emit(message)
    }
}
```

핫 플로우 수집은 그 자체로 완료되지 않으므로, 더 이상 필요하지 않을 때는 [수집 코루틴을 취소](#cancel-hot-flows)해야 합니다.

> 핫 플로우에는 close 또는 cancel 작업이 없습니다.
> 수집을 취소하면 해당 구독자만 수집을 중단합니다.
> 새로운 방출을 중단하려면 핫 플로우의 값을 생성하는 코루틴이나 스코프를 취소하세요.
>
{style="note"}

`SharedFlow`를 사용하여 활성 구독자에게 새 메시지를 보내고 나중에 참여하는 구독자에게 최근 메시지를 리플레이하는 채팅방 모델 예제를 살펴보겠습니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.random.*
import java.io.IOException
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.*

data class Message(
    val senderId: Int,
    val time: Instant,
    val text: String,
)

// 새로운 구독자가 구독 시 받을 이미 방출된 메시지 수 설정
const val MESSAGES_TO_REMEMBER = 10

class Chatroom {
    // SharedFlow를 비공개 백킹 프로퍼티에 저장합니다
    private val _messages = MutableSharedFlow<Message>(

        // 새로운 구독자에게 마지막으로 방출된 메시지 수를 설정된 만큼 리플레이합니다
        replay = MESSAGES_TO_REMEMBER
    )

    // 구독자들에게 읽기 전용 SharedFlow를 노출합니다
    val messages: SharedFlow<Message>
        get() = _messages.asSharedFlow()

    // 구독자들에게 메시지를 방출합니다
    suspend fun sendMessageToEveryone(message: Message) {
        _messages.emit(message)
    }
}

suspend fun main() {
    val nUsers = 3
    val chatroom = Chatroom()
    withContext(Dispatchers.Default) {
        // 각 사용자에 대해 메시지 리더(reader)를 시작합니다
        val messageReaders = List(nUsers) { userId ->
            // 메시지가 방출되기 전에 수집을 시작합니다
            launch(start = CoroutineStart.UNDISPATCHED) {
                chatroom.messages.collect { message ->
                    println("User $userId received $message")
                }
            }
        }
        // 각 사용자로부터 인사를 보냅니다
        repeat(nUsers) { userId ->
            chatroom.sendMessageToEveryone(
                Message(
                    userId,
                    Clock.System.now(),
                    "Hello from $userId!"
                )
            )
        }
        // 사람들이 충분히 채팅할 시간을 주기 위해 지연시킵니다
        delay(100.milliseconds)
        // SharedFlow 수집은 저절로 끝나지 않으므로 리더들을 취소합니다
        messageReaders.forEach { it.cancel() }
    }

}
```
{kotlin-runnable="true"}

이 예제에서 [`CoroutineStart.UNDISPATCHED`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-start/-u-n-d-i-s-p-a-t-c-h-e-d/)는 각 수집 코루틴을 즉시 시작합니다.

이를 통해 각 코루틴이 `collect()`에 도달하여 `messages`를 구독하고, `sendMessageToEveryone()`이 메시지를 방출하기 전에 중단(suspend) 상태가 되도록 보장합니다. 만약 이 방식이 아니라면, 수집 코루틴이 늦게 시작되어 리플레이 캐시가 너무 작을 경우 초기 방출을 놓칠 수도 있습니다.

#### 명시적 백킹 필드를 사용하여 핫 플로우 노출하기
<primary-label ref="experimental-opt-in"/>

[명시적 백킹 필드(explicit backing fields)](whatsnew23.md#explicit-backing-fields)를 사용하면 클래스 내부에 가변 백킹 필드를 유지하면서 읽기 전용 `SharedFlow`를 노출할 수 있습니다.

명시적 백킹 필드는 `field` 선언에서 구현 유형을 정의합니다.
클래스 내부에서 컴파일러는 프로퍼티를 백킹 필드 유형으로 스마트 캐스트하므로, 별도의 비공개 백킹 프로퍼티 없이도 `emit()` 함수를 호출할 수 있습니다.

> 명시적 백킹 필드는 `.asSharedFlow()`가 제공하는 읽기 전용 래퍼를 생성하지 않습니다.
> 노출된 플로우의 다운캐스팅(downcasting)이 우려되지 않는 경우에만 이 패턴을 사용하세요.
> 
{style="warning"}

예시는 다음과 같습니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Clock
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.ExperimentalTime
import kotlin.time.Instant
        
data class Message(
    val senderId: Int,
    val time: Instant,
    val text: String,
)

const val MESSAGES_TO_REMEMBER = 10

//sampleStart
class Chatroom {
    // 가변 백킹 필드를 가진 읽기 전용 SharedFlow를 노출합니다
    val messages: SharedFlow<Message>
        field = MutableSharedFlow<Message>(
            replay = MESSAGES_TO_REMEMBER
        )

    suspend fun sendMessageToEveryone(message: Message) {
        // Chatroom 내부에서는 가변 백킹 필드를 통해 방출합니다
        messages.emit(message)
    }
}
//sampleEnd

suspend fun main() {
    val nUsers = 3
    val chatroom = Chatroom()

    withContext(Dispatchers.Default) {
        val messageReaders = List(nUsers) { userId ->
            launch(start = CoroutineStart.UNDISPATCHED) {
                chatroom.messages.collect { message ->
                    println("User $userId received $message")
                }
            }
        }

        repeat(nUsers) { userId ->
            chatroom.sendMessageToEveryone(
                Message(
                    senderId = userId,
                    time = Clock.System.now(),
                    text = "Hello from $userId!"
                )
            )
        }

        delay(100.milliseconds)
        messageReaders.forEach { it.cancel() }
    }
}
```
{kotlin-runnable="true"}

### `StateFlow` 생성하기

[`StateFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-state-flow/)는 단일 상태 값을 저장하고, 해당 값이 새로운 값으로 교체될 때 업데이트를 방출하는 핫 플로우입니다.
새로운 구독자는 수집을 시작하자마자 현재 값을 즉시 받게 되며, 이후 상태가 업데이트될 때마다 새로운 값을 받습니다.

로딩 진행률, UI 상태 또는 객체의 상태와 같이 시간에 따라 변화하는 상태를 나타낼 때 `StateFlow`를 사용할 수 있습니다.

`StateFlow`를 만들려면 초기 값과 함께 [`MutableStateFlow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-mutable-state-flow.html) 함수를 사용하세요:

```kotlin
// 초기 값으로 LoadingState.Started를 가진 MutableStateFlow를 생성합니다
val result = MutableStateFlow<LoadingState>(LoadingState.Started)
```

현재 상태를 설정하려면 [`value`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-mutable-state-flow/value.html) 프로퍼티를 사용하세요:

```kotlin
fun loadBlob(url: String): StateFlow<LoadingState> {
    val result = MutableStateFlow<LoadingState>(LoadingState.Started)

    DownloadManager.startLoading(
        url,
        onPercentageLoaded = { percentage ->
            // 현재 상태를 최신 진행률로 교체합니다
            result.value = LoadingState.Percentage(percentage)
        },
        onCompletion = {
            // 현재 상태를 완료 상태로 교체합니다
            result.value = LoadingState.Done
        },
        onFailure = {
            // 현재 상태를 실패 상태로 교체합니다
            result.value = LoadingState.Failed
        }
    )
}
```

> `value`를 설정하는 것은 스레드로부터 안전하며 현재 상태를 교체하지만, 이전 값을 기반으로 `value`를 업데이트하는 것은 원자적(atomic)이지 않습니다.
> 새 상태가 이전 상태에 의존할 때는 대신 `.update()`를 사용하세요.
>
{style="note"}

`MutableSharedFlow`와 마찬가지로, `MutableStateFlow`는 업데이트를 방출하기 위한 API를 노출합니다. 만약 이를 직접 노출하면, 이를 받는 어떤 코드에서든 `MutableStateFlow`로 다운캐스트하여 상태를 업데이트할 수 있게 됩니다.

이를 방지하려면 [`.asStateFlow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/as-state-flow.html) 함수를 사용하여 가변 플로우를 읽기 전용 `StateFlow`로 노출하세요:

```kotlin
fun loadBlob(url: String): StateFlow<LoadingState> {
    val result = MutableStateFlow<LoadingState>(LoadingState.Started)

    DownloadManager.startLoading(
        url,
        onPercentageLoaded = { percentage ->
            result.value = LoadingState.Percentage(percentage)
        },
        onCompletion = {
            result.value = LoadingState.Done
        },
        onFailure = {
            result.value = LoadingState.Failed
        }
    )

    // 로딩 상태를 읽기 전용 StateFlow로 노출합니다
    return result.asStateFlow()
}
```

다음은 콜백 기반 API로부터 로딩 진행률을 보고하기 위해 `StateFlow`를 사용하는 예제입니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds
import kotlin.io.encoding.*
import java.io.IOException
import kotlin.random.Random

//sampleStart
sealed interface LoadingState {
    sealed interface Terminal: LoadingState
    object Started: LoadingState
    data class Percentage(val percents: Int): LoadingState
    object Failed: Terminal
    object Done: Terminal
}

fun loadBlob(url: String): StateFlow<LoadingState> {
    // 초기 로딩 상태를 가진 가변 StateFlow를 생성합니다
    val result = MutableStateFlow<LoadingState>(LoadingState.Started)
    DownloadManager.startLoading(
        url,
        onPercentageLoaded = { percentage ->
            // 현재 상태를 최신 진행률로 교체합니다
            result.value = LoadingState.Percentage(percentage)
        },
        onCompletion = {
            // 현재 상태를 완료 상태로 교체합니다
            result.value = LoadingState.Done
        },
        onFailure = {
            // 현재 상태를 실패 상태로 교체합니다
            result.value = LoadingState.Failed
        }
    )
    // 로딩 상태를 읽기 전용 StateFlow로 노출합니다
    return result.asStateFlow()
}

// 데이터를 비동기적으로 다운로드하는 콜백 기반 API 정의
object DownloadManager {
    // url 로딩을 비동기적으로 시작합니다
    fun startLoading(
        url: String,
        onPercentageLoaded: (Int) -> Unit,
        onCompletion: () -> Unit,
        onFailure: (Throwable) -> Unit
    ) {
        // 예제를 독립적으로 유지하기 위해 설명 목적으로만 GlobalScope를 사용합니다
        GlobalScope.launch {
            val failureChancePerStep = 1 - java.lang.Math.pow(0.99, 10.0)

            repeat(10) { step ->
                if (Random.nextDouble() < failureChancePerStep) {
                    onFailure(IOException("Failed to load!"))
                    return@launch
                }
                onPercentageLoaded((step + 1) * 10)
                delay(10.milliseconds)
            }
            onCompletion()
        }
    }
}

suspend fun main() {
    loadBlob("https://example.com/").onEach { state ->
        when (state) {
            is LoadingState.Started -> {
                // 진행 업데이트를 대기합니다
            }
            is LoadingState.Percentage ->
                println("Loaded ${state.percents}...")
            is LoadingState.Failed ->
                println("Loading failed.")
            is LoadingState.Done ->
                println("Finished loading!")
        }
    }.takeWhile { it !is LoadingState.Terminal }.collect()
}
//sampleEnd
```
{kotlin-runnable="true"}

> 이 예제는 콜백 기반 API를 짧게 유지하기 위해 [`GlobalScope`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-global-scope/)를 사용했습니다.
> 실제 애플리케이션에서는 작업을 시작하는 함수(이 예제의 `startLoading()`)에 `CoroutineScope`를 전달하고 해당 스코프에서 코루틴을 시작하여, 호출자가 더 이상 작업이 필요 없을 때 이를 취소할 수 있도록 하세요.
>
{style="note"}

`StateFlow`는 핫 플로우이므로 수집이 저절로 완료되지 않습니다. 이 예제에서는 `.takeWhile()` 연산자를 사용하여 로딩이 종료 상태(terminal state)에 도달했을 때 수집을 중단합니다.

`StateFlow`는 새 값이 현재 값과 다를 때만 업데이트를 방출합니다.

> `StateFlow`에 가변(mutable) 객체를 저장하지 마세요.
> 객체 자체를 수정하는 것은 현재 값을 교체하는 것이 아니므로 수집기가 업데이트를 받지 못합니다.
> 
{style="warning"}

현재 상태로부터 새 상태를 계산하여 `StateFlow`를 업데이트할 수도 있습니다. 이러한 업데이트에는 [`.update()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/update.html) 함수를 사용하세요. `.update()` 함수는 값을 원자적으로 업데이트하며, 이는 여러 코루틴이 동일한 `MutableStateFlow`를 업데이트할 때 유용합니다.

> 만약 단순히 공유된 값을 업데이트하기만 하면 되고 시간에 따른 상태 변화를 관찰할 필요가 없다면, [`AtomicInt`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/-atomic-int/) 또는 [`AtomicReference`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/-atomic-reference/)와 같은 Kotlin Atomics API를 사용하세요.
>
{style="note"}

다음은 '좋아요' 수가 `StateFlow`에 저장되고, 각 새로운 상태가 이전 상태로부터 계산되는 예제입니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds
import kotlin.io.encoding.*
import java.io.IOException
import kotlin.random.Random

//sampleStart
class Post(val id: Long) {
    // 현재 좋아요 수를 StateFlow로 저장합니다
    private val _numberOfLikes = MutableStateFlow<Int>(
        // 초기 좋아요 수 설정
        0
    )

    // 현재 좋아요 수를 읽기 전용 StateFlow로 노출합니다
    val numberOfLikes: StateFlow<Int>
        get() = _numberOfLikes.asStateFlow()

    // 좋아요 추가
    fun like() {
        // 동시 호출 및 멀티스레드 호출에 대해 원자적으로 좋아요 수를 증가시킵니다
        _numberOfLikes.update { it + 1 }
    }
}

suspend fun drawUpdatedNumberOfLikes(likes: Int) {
    // 최신 좋아요 수를 표시합니다
    println("${Clock.System.now()}: the number of likes is $likes")
}

suspend fun main() {
    withContext(Dispatchers.Default) {
        val post = Post(15)
        val notifyingJob = launch {
            post.numberOfLikes.collect {
                drawUpdatedNumberOfLikes(it)
            }
        }
        // 게시물에 좋아요를 누르는 사용자를 시뮬레이션합니다
        coroutineScope {
            repeat(10) {
                launch {
                    delay(Random.nextInt(100).milliseconds)
                    post.like()
                }
            }
        }
        // 모든 시뮬레이션 사용자가 완료된 후 수집을 취소합니다
        notifyingJob.cancelAndJoin()
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

이 예제에서 `.update()` 함수는 좋아요 수를 원자적으로 증가시킵니다. 이는 여러 코루틴이 동시에 `like()` 함수를 호출할 때 업데이트가 누락되는 것을 방지합니다.

#### `StateFlow`에 누적된 상태 저장하기

때로는 구독자가 최신 방출 값뿐만 아니라 모든 이전 방출의 결과물(accumulated result)을 받기를 원할 수 있습니다.

예를 들어, 채팅방은 메시지 기록 전체를 단일 상태 값으로 유지할 수 있습니다. 새로운 사용자가 채팅방에 참여하면 먼저 현재 메시지 기록을 받습니다. 그런 다음 새 메시지가 도착할 때마다 계속해서 업데이트를 받습니다.

`StateFlow`를 사용하여 이러한 동작을 모델링할 수 있습니다.

이를 위해 각 채팅 메시지를 `SharedFlow<Message>`를 통해 별도의 이벤트로 브로드캐스트하는 대신, `StateFlow<List<Message>>`를 사용하여 전체 메시지 기록을 현재 값으로 저장하세요:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds
import kotlin.io.encoding.*
import java.io.IOException
import kotlin.random.Random

//sampleStart
data class Message(
    val senderId: Int,
    val time: Instant,
    val text: String,
)

class Chatroom {
    // 전체 메시지 기록을 저장합니다
    private val _messageHistory = MutableStateFlow<List<Message>>(emptyList())

    // 현재 메시지 기록을 읽기 전용 StateFlow로 노출합니다
    val messageHistory: StateFlow<List<Message>>
        get() = _messageHistory.asStateFlow()

    // messageHistory 플로우의 모든 구독자에게 메시지를 보냅니다
    suspend fun sendMessageToEveryone(message: Message) {
        // 새 메시지를 현재 기록에 원자적으로 추가합니다
        _messageHistory.update {
            it + message
        }
    }
}

suspend fun main() {
    val nUsers = 3
    val chatroom = Chatroom()
    withContext(Dispatchers.Default) {
        // 각 사용자에 대해 메시지 리더를 시작합니다
        val messageReaders = List(nUsers) { userId ->
            launch(start = CoroutineStart.UNDISPATCHED) {
                chatroom.messageHistory.collect { currentHistory ->
                    println("User $userId sees the history as $currentHistory")
                }
            }
        }
        // 각 사용자로부터 인사를 보냅니다
        repeat(nUsers) { userId ->
            chatroom.sendMessageToEveryone(
                Message(
                    userId,
                    Clock.System.now(),
                    "Hello from $userId!"
                )
            )
        }
        // 사용자들이 업데이트를 받을 충분한 시간을 주기 위해 지연시킵니다
        delay(100.milliseconds)
        // StateFlow 수집은 저절로 끝나지 않으므로 리더들을 취소합니다
        messageReaders.forEach { it.cancel() }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

이 예제에서 `messageHistory`는 이전 메시지의 전체 목록을 현재 상태로 저장합니다. 새로운 메시지가 전송되면 `.update()` 함수가 이전 기록에서 새 목록을 만들고 새 메시지를 원자적으로 추가합니다.

> 불변(immutable) 컬렉션을 업데이트할 때 매번 새 컬렉션을 생성하는 방식은 컬렉션이 커짐에 따라 더 많은 시간이 걸릴 수 있습니다. [실험적(Experimental)](components-stability.md#stability-levels-explained) [`kotlinx.collections.immutable`](https://github.com/Kotlin/kotlinx.collections.immutable) 라이브러리를 사용하여 영속적(persistent) 컬렉션을 만들면 불변 컬렉션 업데이트를 더 효율적으로 처리할 수 있습니다.
>
{style="tip"}

`messageHistory`는 `StateFlow`이므로, 구독자는 수집을 시작할 때 현재 메시지 기록을 받습니다. 그 후 메시지가 전송될 때마다 채팅 기록이 변경된 새 목록을 받게 됩니다.

### 콜드 플로우를 핫 플로우로 변환하기

콜드 플로우는 각 수집기마다 업스트림 작업을 별도로 실행합니다. 여러 구독자가 동일한 업스트림 수집의 방출 내용을 필요로 할 때, 콜드 플로우를 핫 플로우로 변환하여 해당 수집을 구독자들과 공유할 수 있습니다.

다음의 단순화된 `.shareIn()` 버전은 콜드 플로우를 한 번 수집하여 그 값을 `MutableSharedFlow`에 방출하고 이를 읽기 전용 `SharedFlow`로 노출함으로써 이 아이디어를 보여줍니다:

```kotlin
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.*

fun <T> Flow<T>.simpleShareIn(scope: CoroutineScope): SharedFlow<T> {
    val sharedFlow = MutableSharedFlow<T>()
    scope.launch {
        this@simpleShareIn.collect {
            sharedFlow.emit(it)
        }
    }
    return sharedFlow.asSharedFlow()
}

suspend fun main() { 
    
}
```

이 예제에서 `simpleShareIn()`은 제공된 스코프에서 새로운 코루틴을 시작합니다. 업스트림 플로우로부터 수집을 중단하려면, 수집 코루틴을 실행 중인 [스코프를 취소](#cancel-hot-flows)하세요.

업스트림 플로우에서 예외가 발생하면 이 수집 코루틴은 실패합니다. 수집 코루틴이 실패하기 전에 [업스트림 예외를 처리](#handle-exceptions-in-hot-flows)할 수 있도록 플로우를 공유하기 전에 `.catch()` 또는 `.retry()`와 같은 연산자를 사용하세요.

기본으로 제공되는 [`.shareIn()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/share-in.html) 함수는 사용자가 직접 `MutableSharedFlow`를 만들 필요 없이 이 패턴을 제공합니다. 또한 업스트림 수집이 시작되고 중단되는 시점과 새로운 구독자가 받을 이전 방출 횟수를 제어하는 옵션도 제공합니다.

기본 제공 `.shareIn()` 함수를 사용하려면 다음 인자들을 제공하세요:

* 업스트림 플로우가 수집되는 코루틴 스코프.
* 업스트림 수집의 시작과 중단 시점을 제어하는 [`SharingStarted`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-sharing-started/) 전략.
   예를 들어, [`SharingStarted.Eagerly`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-sharing-started/-companion/-eagerly.html)는 첫 구독자가 수집을 시작하기 전이라도 제공된 스코프에서 즉시 업스트림 수집을 시작합니다.
* 새로운 구독자가 받을 이전 방출 횟수를 제어하는 선택 사항인 `replay` 값.

`.shareIn()` 함수는 제공된 코루틴 스코프에서 업스트림 플로우를 수집하고 그 방출 내용을 구독자들에게 브로드캐스트합니다.

다음은 `.shareIn()`이 콜드 플로우를 핫 플로우로 변환하여 직렬화된 채팅 메시지를 여러 구독자와 공유하는 예제입니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds
import kotlin.io.encoding.*
import java.io.IOException
import kotlin.random.Random

//sampleStart
data class Message(
    val senderId: Int,
    val time: Instant,
    val text: String,
)

class Chatroom {
    // 메시지 플로우를 저장합니다
    private val _messages = MutableSharedFlow<Message>()

    // 방출된 메시지를 읽기 전용 SharedFlow로 노출합니다
    // 새로운 구독자는 이미 방출된 메시지를 받지 않습니다
    val messages: SharedFlow<Message>
        get() = _messages.asSharedFlow()
  
    // messages 플로우의 모든 구독자에게 메시지를 보냅니다
    suspend fun sendMessageToEveryone(message: Message) {
        _messages.emit(message)
    }
}

suspend fun main() {
    val nUsers = 3
    val chatroom = Chatroom()
    withContext(Dispatchers.Default) {
        // 현재 실행 중인 코루틴의 자식 스코프를 생성합니다
        val derivedFlowsScope = CoroutineScope(
            currentCoroutineContext() + Job(currentCoroutineContext()[Job])
        )
        // 구독자들 간에 직렬화된 메시지를 공유합니다
        val serializedMessages: SharedFlow<String> =
            chatroom
                .messages
                .map {
                    // 공유 플로우를 위해 각 메시지를 한 번만 직렬화합니다
                    "senderId: ${it.senderId}, time: ${it.time}, text: " +
                        Base64.Default.encode(it.text.encodeToByteArray())
                }
                .shareIn(
                    // 이 스코프에서 공유 코루틴을 시작합니다.
                    // .map()을 포함한 업스트림 플로우가 해당 코루틴에서 실행됩니다
                    derivedFlowsScope,

                    // 첫 번째 구독자가 나타나기 전에 업스트림 플로우 수집을 즉시 시작합니다
                    SharingStarted.Eagerly,

                    // 새로운 구독자에게 이전 직렬화 메시지를 리플레이하지 않습니다
                    replay = 0,
                )

        // 각 사용자에 대해 메시지 리더를 시작합니다
        val messageReaders = List(nUsers) { userId ->
            launch(start = CoroutineStart.UNDISPATCHED) {
                serializedMessages.collect { serializedMessage ->
                    println("User $userId observes the message $serializedMessage")
                }
            }
        }
        // 각 사용자로부터 인사를 보냅니다
        repeat(nUsers) { userId ->
            chatroom.sendMessageToEveryone(
                Message(
                    userId,
                    Clock.System.now(),
                    "Hello from $userId!"
                )
            )
        }
        // 사용자들이 업데이트를 받을 충분한 시간을 주기 위해 지연시킵니다
        delay(100.milliseconds)
        // SharedFlow 수집은 저절로 끝나지 않으므로 리더들을 취소합니다
        messageReaders.forEach { it.cancel() }
        // 파생된 핫 플로우를 실행하는 스코프를 취소합니다
        derivedFlowsScope.cancel()
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

이 예제에서 [`.map()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map.html) 연산자는 각 메시지를 직렬화하는 콜드 플로우를 생성합니다. `.shareIn()` 함수가 없다면 각 수집기는 해당 직렬화를 별도로 실행하게 됩니다. `.shareIn()` 함수는 하나의 업스트림 수집을 공유하므로, 각 메시지는 한 번만 직렬화된 다음 모든 구독자에게 공유됩니다.

`SharingStarted.Eagerly`는 업스트림 수집을 즉시 시작하므로, 파생된 핫 플로우는 `.shareIn()`이 호출되자마자 `chatroom.messages` 수집을 시작합니다.

마찬가지로, 콜드 플로우를 `StateFlow`로 변환하려면 [`.stateIn()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/state-in.html) 함수를 사용하세요.

`.shareIn()`과 달리, `StateFlow`는 항상 현재 값을 가져야 하므로 `.stateIn()`은 초기 값을 요구합니다.

예를 들면 다음과 같습니다:

```kotlin
val lastUpdateFlow: StateFlow<Instant?> =
    chatroom
        .messageHistory
        .map { currentHistory -> currentHistory.lastOrNull()?.time }
        .stateIn(
            // 이 스코프에서 공유 코루틴을 시작합니다
            // .map()을 포함한 업스트림 플로우가 해당 코루틴에서 실행됩니다
            derivedFlowsScope,

            // 첫 구독자가 나타날 때 수집을 시작하고
            // 마지막 구독자가 사라질 때 중단합니다
            SharingStarted.WhileSubscribed(),
            // 첫 업스트림 방출 전의 초기 상태를 설정합니다
            null,
        )
```

### 핫 플로우 취소

핫 플로우는 구독자가 취소되어도 멈추지 않습니다.

핫 플로우를 수집하는 코루틴을 취소하면 해당 구독자만 취소됩니다. 핫 플로우는 여전히 다른 구독자에게 값을 방출할 수 있으며, 해당 값을 생성하는 코루틴도 계속 실행될 수 있습니다.

핫 플로우 자체에는 취소 작업이 없습니다. 핫 플로우를 취소하려면 해당 플로우에 값을 생성하는 코루틴이나 스코프를 취소하세요.

`.shareIn()` 또는 `.stateIn()` 확장 함수로 생성된 핫 플로우는 공유 코루틴이 취소될 때까지 업스트림 플로우를 계속 수집합니다. 업스트림 플로우 수집을 중단하려면 공유 코루틴을 실행하는 스코프를 취소하세요.

> [`SharingStarted.WhileSubscribed()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-sharing-started/-companion/-while-subscribed.html)를 사용하여 구독자가 없을 때 자동으로 업스트림 수집을 중단할 수도 있습니다.
> 
{style="tip"}

다음은 `.stateIn()`에 전달된 스코프를 취소하여 파생된 핫 플로우가 새로운 값을 수집하는 것을 중단하는 예제입니다:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.*
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds
import kotlin.io.encoding.*
import java.io.IOException
import kotlin.random.Random

data class Message(
    val senderId: Int,
    val time: Instant,
    val text: String,
)

class Chatroom {
    // 메시지 기록을 저장합니다
    private val _messageHistory = MutableStateFlow<List<Message>>(emptyList())

    // 현재 메시지 기록을 읽기 전용 StateFlow로 노출합니다
    val messageHistory: StateFlow<List<Message>>
        get() = _messageHistory.asStateFlow()

    // messageHistory 플로우의 모든 구독자에게 메시지를 보냅니다
    suspend fun sendMessageToEveryone(message: Message) {
        _messageHistory.update {
            it + message
        }
    }
}

//sampleStart
suspend fun main() {
    val chatroom = Chatroom()
    withContext(Dispatchers.Default) {
        // 현재 실행 중인 코루틴의 자식 스코프를 생성합니다
        val derivedFlowsScope = CoroutineScope(
            currentCoroutineContext() + Job(currentCoroutineContext()[Job])
        )
        val totalMessages = chatroom.messageHistory
            .map { currentHistory ->
                currentHistory.size
            }.onEach {
                println("There are currently $it messages")
            }.stateIn(
                // 이 스코프에서 공유 코루틴을 시작합니다
                derivedFlowsScope
            )
        // messageHistory 업데이트
        chatroom.sendMessageToEveryone(
            Message(0, Clock.System.now(), "We are shutting down soon!")
        )
        delay(100.milliseconds)
        // 파생된 핫 플로우를 실행하는 스코프를 취소합니다
        derivedFlowsScope.cancel()
        // messageHistory를 업데이트하지만, totalMessages는 더 이상 업데이트를 받지 않습니다
        chatroom.sendMessageToEveryone(
            Message(0, Clock.System.now(), "We have shut down.")
        )
        println("Last collected history size: ${totalMessages.value}")
        println("Actual history size: ${chatroom.messageHistory.value.size}")
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

이 예제에서 `derivedFlowsScope.cancel()` 함수를 호출하면 `totalMessages`는 `messageHistory`로부터 업데이트 수집을 중단합니다.

`sendMessageToEveryone()` 함수는 이를 호출한 코루틴이 취소되지 않았으므로 여전히 `messageHistory`를 업데이트합니다. 결과적으로 `totalMessages.value`는 마지막으로 수집된 크기를 유지하는 반면, `chatroom.messageHistory.value.size`는 실제 메시지 수를 보여줍니다.

### 핫 플로우의 예외 처리

[콜드 플로우](#handle-exceptions-in-flows)에서는 `.catch()`와 같은 연산자를 사용하여 먼저 처리하지 않는 한, 업스트림 예외가 `collect()` 호출자에게 전파됩니다.

핫 플로우는 생산자로부터 구독자에게 예외를 전파하지 않습니다. `MutableSharedFlow`에 방출하거나 `MutableStateFlow`를 업데이트하는 코드에서 예외가 발생하면, 해당 코드를 실행하는 코루틴에서 이를 처리하세요. 구독자가 수집 중에 예외를 던지면, 수집 코루틴에서 이를 처리하세요.

`.shareIn()` 또는 `.stateIn()` 확장 함수로 생성된 핫 플로우는 공유 코루틴에서 업스트림 플로우를 수집합니다. 만약 업스트림 플로우가 예외를 던지면, 그 예외는 공유 코루틴을 취소합니다:

```kotlin
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.*

//sampleStart
suspend fun main() {
    withContext(Dispatchers.Default) {
        launch {
            flow<Int> {
                error("An upstream failure")
            }.stateIn(
                this@launch
            )
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true" validate="false"}

실패 후 [업스트림 수집을 재시작](#restart-the-upstream-flow-after-an-exception)할 수 있습니다. 그렇게 하려면 `.shareIn()` 또는 `.stateIn()` 앞에 `.retry()` 연산자를 배치하세요:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
suspend fun main() {
    coroutineScope {
        launch {
            var currentAttempt = 0

            val stateFlow = flow {
                delay(10.milliseconds)

                if (currentAttempt++ < 5) {
                    println("An error happened!")
                    error("An upstream failure")
                } else {
                    println("Success.")
                    emit(10)
                }
            }
                // 복구 가능한 실패 후 업스트림 플로우를 재시작합니다
                .retry(retries = 5)
                .stateIn(
                    // 이 스코프에서 공유 코루틴을 시작합니다
                    this@launch
                )

            stateFlow.collect {
                println("Observed $it")

                // 수집과 공유 코루틴을 취소합니다
                this@launch.cancel()
            }
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true"}

이 예제에서 플로우는 값을 방출하기 전까지 다섯 번 실패합니다. `.retry()`가 `.stateIn()`보다 앞에 실행되므로, 실패가 공유 코루틴에 도달하기 전에 각 업스트림 실패를 처리합니다.

업스트림 플로우가 `10`을 방출한 후, 수집 코루틴은 값을 받고 자기 자신을 취소합니다. 이 코루틴은 공유 코루틴의 부모이기도 하므로, 파생된 핫 플로우도 중단됩니다.