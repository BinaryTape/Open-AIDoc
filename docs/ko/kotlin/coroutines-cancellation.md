<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 취소 및 타임아웃)

취소(Cancellation)를 사용하면 코루틴이 완료되기 전에 중단을 요청할 수 있습니다.
사용자가 창을 닫거나 사용자 인터페이스에서 다른 곳으로 이동할 때와 같이, 코루틴이 여전히 실행 중이지만 더 이상 필요하지 않은 작업을 중단합니다.

취소를 사용하여 리소스를 조기에 해제하고, 코루틴이 폐기된(disposal) 이후의 객체에 접근하는 것을 방지할 수 있습니다.
또한 다음과 같이 반복적인 작업을 수행하는 장기 실행 코루틴을 중단하는 데에도 사용할 수 있습니다.

* 하트비트(heartbeat) 전송.
* 예약된 작업 실행.
* 시계 UI와 같이 최신 상태를 반영하도록 상태 업데이트.

취소는 코루틴의 생명 주기와 부모-자식 관계를 나타내는 [`Job`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/) 핸들을 통해 작동합니다.
`Job`을 사용하면 코루틴이 활성 상태인지 확인하고, [구조적 동시성(structured concurrency)](coroutines-basics.md#coroutine-scope-and-structured-concurrency)에 정의된 대로 해당 코루틴과 그 자식들을 취소할 수 있습니다.

## 코루틴 취소 {id="cancel-coroutines"}

코루틴은 해당 코루틴의 `Job` 핸들에서 [`cancel()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/cancel.html) 함수가 호출될 때 취소됩니다.
[`.launch()`](coroutines-basics.md#coroutinescope-launch)와 같은 [코루틴 빌더 함수](coroutines-basics.md#coroutine-builder-functions)는 `Job`을 반환합니다. [`.async()`](coroutines-basics.md#coroutinescope-async) 함수는 `Job`을 구현하고 동일한 취소 동작을 지원하는 [`Deferred`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-deferred/)를 반환합니다.

`cancel()` 함수를 수동으로 호출하거나, 부모 코루틴이 취소될 때 취소 전파(cancellation propagation)를 통해 자동으로 호출될 수 있습니다.

코루틴이 취소되면 다음에 취소 여부를 확인할 때 [`CancellationException`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-cancellation-exception/)을 던집니다.
`delay()` 함수와 같은 `kotlinx.coroutines` 라이브러리의 중단 함수들은 중단될 때 취소 여부를 확인합니다.

[`awaitCancellation()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/await-cancellation.html) 함수를 사용하여 코루틴이 취소될 때까지 코루틴을 중단할 수 있습니다.
이는 `delay(Duration.INFINITE)`를 호출하는 것과 동일합니다.

> 코루틴이 취소를 확인하는 방법과 시기에 대한 자세한 내용은 [중단점 및 취소](#suspension-points-and-cancellation)를 참조하세요.
>
{style="tip"}

다음은 코루틴을 수동으로 취소하는 방법의 예입니다.

```kotlin
import kotlinx.coroutines.*

suspend fun main() {
//sampleStart
withContext(Dispatchers.Default) {
    // 코루틴이 실행되기 시작했음을 알리는 신호로 사용됩니다.
    val childStarted = CompletableDeferred<Unit>()
    
    val childJob: Job = launch {
        println("The coroutine has started")

        // CompletableDeferred를 완료하여
        // 코루틴이 실행을 시작했음을 알립니다.
        childStarted.complete(Unit)
        try {
            // 무기한 중단됩니다.
            // 이 호출은 코루틴이 취소되지 않는 한 절대 반환되지 않습니다.
            awaitCancellation()
        } catch (e: CancellationException) {
            println("The coroutine was canceled: $e")
          
            // 취소 예외는 항상 다시 던지세요!
            throw e
        }
        println("This line will never be executed")
    }
  
    // 코루틴이 취소되기 전에 시작될 때까지 기다립니다.
    childStarted.await()

    // 코루틴을 취소합니다.
    // 그러면 awaitCancellation()이 CancellationException을 던집니다.
    childJob.cancel()
}
// withContext() 또는 coroutineScope()와 같은 코루틴 빌더는
// 자식 코루틴이 취소되더라도 모든 자식 코루틴이 완료될 때까지 기다립니다.
println("All coroutines have completed")
//sampleEnd
}
```
{kotlin-runnable="true" id="manual-cancellation-example"}

이 예제에서 [`CompletableDeferred`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-completable-deferred/)는 코루틴이 실행을 시작했다는 신호로 사용됩니다.
코루틴은 실행을 시작할 때 `complete()`를 호출하고, `await()`는 해당 `CompletableDeferred`가 완료된 후에야 반환됩니다.
코루틴을 취소하기 위해 이 확인 절차가 반드시 필요한 것은 아닙니다.
여기서는 코루틴이 취소되기 전에 시작되어 메시지를 출력하는 것을 보장하여 예제를 재현 가능하게 만들기 위해 포함되었습니다.

`Deferred`는 `Job`을 구현하므로, `async()` 코루틴 빌더 함수로 생성된 코루틴에 대해서도 취소는 동일하게 작동합니다.

```kotlin
val deferred = async { /* ... */ }
deferred.cancel()
```

> `CancellationException`을 캐치(catch)하면 취소 전파가 끊어질 수 있습니다.
> 만약 이를 캐치해야 한다면, 취소가 코루틴 계층 구조를 통해 올바르게 전파될 수 있도록 다시 던지(rethrow)세요.
>
> 자세한 내용은 [코루틴 예외 처리](exception-handling.md#cancellation-and-exceptions)를 참조하세요.
>
{style="warning"}

### 취소 전파 {id="cancellation-propagation"}

[구조적 동시성](coroutines-basics.md#coroutine-scope-and-structured-concurrency)은 코루틴을 취소하면 그 자식 코루틴들도 모두 취소되도록 보장합니다.
이는 부모 코루틴이 취소된 후에도 자식 코루틴이 작업을 계속하는 것을 방지합니다.

다음은 그 예입니다.

```kotlin
import kotlinx.coroutines.*

suspend fun main() {
    withContext(Dispatchers.Default) {
//sampleStart
// 자식 코루틴들이 실행되었음을 알리는 신호로 사용됩니다.
val childrenLaunched = CompletableDeferred<Unit>()

// 두 개의 자식 코루틴을 실행합니다.
val parentJob = launch {
    launch {
        println("Child coroutine 1 has started running")
        try {
            awaitCancellation()
        } finally {
            println("Child coroutine 1 has been canceled")
        }
    }
    launch {
        println("Child coroutine 2 has started running")
        try {
            awaitCancellation()
        } finally {
            println("Child coroutine 2 has been canceled")
        }
    }
    // CompletableDeferred를 완료하여
    // 자식 코루틴들이 실행되었음을 알립니다.
    childrenLaunched.complete(Unit)
}
// 부모 코루틴이 모든 자식 코루틴을 실행했다는
// 신호를 보낼 때까지 기다립니다.
childrenLaunched.await()

// 부모 코루틴을 취소하며, 이는 모든 자식 코루틴을 취소합니다.
parentJob.cancel()
//sampleEnd
    }
}
```
{kotlin-runnable="true" id="cancellation-propagation-example"}

이 예제에서 각 자식 코루틴은 [`finally` 블록](exceptions.md#the-finally-block)을 사용하므로 코루틴이 취소될 때 블록 내부의 코드가 실행됩니다.
여기서 `CompletableDeferred`는 자식 코루틴들이 취소되기 전에 실행(launched)되었음을 알리지만, 실행(running)을 시작했다는 것을 보장하지는 않습니다.
자식 코루틴들이 먼저 취소되면 아무것도 출력되지 않습니다.

## 코루틴이 취소에 반응하도록 만들기 {id="cancellation-is-cooperative"}

Kotlin에서 코루틴 취소는 *협력적(cooperative)*입니다.
코루틴은 [중단](#suspension-points-and-cancellation)하거나 [명시적으로 취소 여부를 확인](#check-for-cancellation-explicitly)함으로써 협력할 때만 취소에 반응합니다.

이 섹션에서는 [yield()](#the-yield-suspending-function) 함수 호출과 같은 [중단점(suspension points)](#suspension-points-and-cancellation)을 추가하여 코루틴이 취소에 반응하게 만드는 방법을 배울 수 있습니다.

### 중단점 및 취소 {id="suspension-points-and-cancellation"}

코루틴이 취소되면, 코드 내에서 중단될 수 있는 지점인 *중단점(suspension point)*에 도달할 때까지 계속 실행됩니다.
코루틴이 그 지점에서 중단되면, 중단 함수는 자신이 취소되었는지 확인합니다.
취소되었다면 코루틴은 중단되고 `CancellationException`을 던집니다.

`suspend` 함수를 호출하는 것은 중단점이지만, 항상 중단되는 것은 아닙니다.
예를 들어 `Deferred` 결과를 기다릴(awaiting) 때, 해당 `Deferred`가 아직 완료되지 않은 경우에만 코루틴이 중단됩니다.

다음은 일반적인 중단 함수들을 사용하여 코루틴이 취소되었을 때 확인하고 중단될 수 있도록 하는 예입니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.channels.Channel
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration

suspend fun main() {
//sampleStart
withContext(Dispatchers.Default) {
    val childJobs = listOf(
        launch {
            // 취소될 때까지 중단
            awaitCancellation()
        },
        launch {
            // 취소될 때까지 중단
            delay(Duration.INFINITE)
        },
        launch {
            val channel = Channel<Int>()
            // 절대 전송되지 않는 값을 기다리는 동안 중단
            channel.receive()
        },
        launch {
            val deferred = CompletableDeferred<Int>()
            // 절대 완료되지 않는 값을 기다리는 동안 중단
            deferred.await()
        },
        launch {
            val mutex = Mutex(locked = true)
            // 무기한 잠겨 있는 뮤텍스를 기다리는 동안 중단
            mutex.lock()
        }
    )
    
    // 자식 코루틴들이 시작되고 중단될 시간을 줍니다.
    delay(100.milliseconds)
    
    // 모든 자식 코루틴을 취소합니다.
    childJobs.forEach { it.cancel() }
}
println("All child jobs completed!")
//sampleEnd
}
```
{kotlin-runnable="true" id="suspension-points-example"}

> `kotlinx.coroutines` 라이브러리의 모든 중단 함수는 내부적으로 [`suspendCancellableCoroutine()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/suspend-cancellable-coroutine.html)을 사용하므로 취소에 협력합니다. 이 함수는 코루틴이 중단될 때 취소 여부를 확인합니다.
> 반면, [`suspendCoroutine()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/suspend-coroutine.html)을 사용하는 사용자 정의 중단 함수는 취소에 반응하지 않습니다.
>
{style="tip"}

### `yield()` 중단 함수 {id="the-yield-suspending-function"}

코루틴이 중단되지 않으면 해당 코루틴이 완료될 때까지 동일한 스레드에서 다른 코루틴이 실행될 수 없습니다.
결과적으로 중단되지 않는 코루틴들은 해당 스레드에서 순차적으로 실행됩니다.
또한 코루틴이 오랫동안 중단되지 않으면 취소되어도 중단되지 않습니다.

CPU 집약적인 계산이나 중단 없이 오랫동안 실행되는 다른 코드에서는 주기적으로 [`yield()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/yield.html) 함수를 호출하세요.
이 함수는 현재 스레드를 양보하고 다른 코루틴이 실행될 기회를 줍니다.
또한 코루틴이 정기적으로 취소 여부를 확인하도록 보장합니다. 코루틴이 취소되면 `yield()` 함수는 `CancellationException`을 던집니다.

![확인하지 않는 경우, ensureActive() 또는 isActive를 사용하는 경우, yield()를 사용하는 경우의 코루틴 취소 처리 비교](yield-and-cancellation.svg)

다음은 그 예입니다.

```kotlin
import kotlinx.coroutines.*

fun main() {
//sampleStart
// runBlocking은 현재 스레드를 사용하여 모든 코루틴을 실행합니다.
runBlocking {
    val coroutineCount = 5
    repeat(coroutineCount) { coroutineIndex ->
        launch {
            val id = coroutineIndex + 1
            repeat(5) { iterationIndex ->
                val iteration = iterationIndex + 1
                // 다른 코루틴들이 실행될 기회를 주기 위해 일시적으로 중단합니다.
                // 이것이 없으면 코루틴들은 순차적으로 실행됩니다.
                yield()
                // 코루틴 인덱스와 반복 인덱스를 출력합니다.
                println("$id * $iteration = ${id * iteration}")
            }
        }
    }
}
//sampleEnd
}
```
{kotlin-runnable="true" id="yield-example"}

이 예제에서 각 코루틴은 `yield()`를 사용하여 반복(iteration) 사이에 다른 코루틴이 실행될 수 있도록 합니다.

### 명시적으로 취소 확인 {id="check-for-cancellation-explicitly"}

명시적으로 취소 여부를 확인할 수 있으며, 이를 통해 장기 실행 코드가 중단 없이 취소에 반응할 수 있습니다.
중단되지 않는 장기 실행 코루틴은 완료될 때까지 동일한 스레드의 다른 코루틴이 실행되는 것을 방지할 수 있습니다.
사용 사례에 따라 이러한 동작이 의도된 것이 아니라면 대신 [`yield()`](#the-yield-suspending-function) 함수를 사용하세요.

API에 따라 확인 결과로 Boolean 값을 반환하거나 예외를 던집니다.

* [`isActive`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/is-active.html) 속성은 코루틴이 취소되었을 때 `false`를 반환합니다.
* [`ensureActive()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/ensure-active.html) 함수는 코루틴이 취소되었을 때 `CancellationException`을 던집니다.

### 코루틴 취소 시 블로킹 코드 인터럽트 {id="interrupt-blocking-code-when-coroutines-are-canceled"}

JVM에서는 `Thread.sleep()`이나 `BlockingQueue.take()`와 같은 일부 블로킹 함수가 현재 스레드를 차단할 수 있습니다.
이러한 블로킹 함수는 인터럽트(interrupt)될 수 있으며, 이는 함수를 조기에 중단시킵니다.
하지만 코루틴에서 이들을 호출할 때, 취소가 스레드를 인터럽트하지는 않습니다.

코루틴을 취소할 때 스레드를 인터럽트하려면 블로킹 코드를 [`runInterruptible()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/run-interruptible.html) 함수로 감싸세요.

```kotlin
import kotlinx.coroutines.*

suspend fun main() {
//sampleStart
withContext(Dispatchers.Default) {
    val childStarted = CompletableDeferred<Unit>()
    val childJob = launch {
        try {
            // 취소가 스레드 인터럽트를 트리거합니다.
            runInterruptible {
                childStarted.complete(Unit)
                try {
                    // 현재 스레드를 아주 오랫동안 차단합니다.
                    Thread.sleep(Long.MAX_VALUE)
                } catch (e: InterruptedException) {
                    println("Thread interrupted (Java): $e")
                    throw e
                }
            }
        } catch (e: CancellationException) {
            println("Coroutine canceled (Kotlin): $e")
            throw e
        }
    }
    childStarted.await()

    // 코루틴을 취소하고 Thread.sleep()을 실행 중인 스레드를 인터럽트합니다.
    childJob.cancel()
}
//sampleEnd
}
```
{kotlin-runnable="true" id="interrupt-cancellation-example"}

## 코루틴 취소 시 안전하게 값 처리하기 {id="handle-values-safely-when-canceling-coroutines"}

중단된 코루틴이 취소되면 값을 이미 사용할 수 있는 상태라도 값을 반환하는 대신 `CancellationException`과 함께 재개됩니다.
이러한 동작을 *즉각적인 취소(prompt cancellation)*라고 합니다.
이는 이미 닫힌 화면을 업데이트하는 것과 같이, 취소된 코루틴의 스코프에서 코드가 계속 실행되는 것을 방지합니다.

다음은 그 예입니다.

```kotlin
// UI 스레드를 사용하는 코루틴 스코프를 정의합니다.
class ScreenWithButtons(private val scope: CoroutineScope) {
    fun loadAndUpdateButtons(filename: String) {
        scope.launch {
            // withContext()는 블록에 진입하기 전과
            // 블록이 반환된 후에 취소 여부를 확인합니다.
            val buttonNames = withContext(Dispatchers.IO) {
                // 이는 취소에 반응하지 않는 블로킹 호출입니다.
                readLines(filename)
            }
            
            // updateUi()를 호출하는 것이 안전합니다.
            // 왜냐하면 코루틴이 취소되면 withContext()가 반환되지 않으며,
            // UI 스레드에서 실행되는 어떤 코드도 이 호출 전에 버튼을 폐기할 수 없기 때문입니다.
            updateUi(buttonNames)
        }
    }

    // 버튼에 접근하므로 UI 스레드에서만 이 함수를 호출하세요.
    // 버튼이 폐기된 후 호출되면 예외를 던집니다.
    private fun updateUi(buttonNames: List<String>) {
        // 지정된 이름으로 버튼을 업데이트하는 플레이스홀더 코드
    }

    // UI 스레드에서만 이 함수를 호출하세요.
    fun leaveScreen() {
        // 화면을 떠날 때 스코프를 취소합니다.
        // 더 이상 UI를 업데이트할 수 없습니다.
        scope.cancel()
    }
}

// UI 컨트롤러 코드
setHandler(Event.ScreenClosed) {
    // UI 스레드에서 실행됩니다.
    screenWithButtons.leaveScreen()
    buttons.dispose()
}
```

이 예제에서 `withContext(Dispatchers.IO)`는 취소에 협력하며, `withContext(Dispatchers.IO)`가 버튼 이름을 반환하기 전에 `leaveScreen()` 함수가 코루틴을 취소하면 `updateUi()`가 실행되는 것을 방지합니다.

즉각적인 취소는 값이 더 이상 유효하지 않을 때 사용하는 것을 방지해주지만, 중요한 값을 사용하는 중에 코드를 중단시켜 해당 값을 잃어버리게 만들 수도 있습니다.
이는 코루틴이 `AutoCloseable` 리소스와 같은 값을 받았지만, 이를 닫는 코드 부분에 도달하기 전에 취소되는 경우 발생할 수 있습니다.
이를 방지하려면 값을 받는 코루틴이 취소되더라도 정리가 보장되는 곳에 정리 로직을 두어야 합니다.

다음은 그 예입니다.

```kotlin
import java.nio.file.*
import java.nio.charset.*
import kotlinx.coroutines.*
import java.io.*

// UI 스레드에서 코루틴을 실행하는 스코프를 사용합니다.
class ScreenWithFileContents(private val scope: CoroutineScope) {
    fun displayFile(path: Path) {
        scope.launch {
            // finally 블록에서 닫을 수 있도록 reader를 변수에 저장합니다.
            var reader: BufferedReader? = null
            
            try {
                withContext(Dispatchers.IO) {
                    reader = Files.newBufferedReader(
                        path, Charset.forName("US-ASCII")
                    )
                }
                // withContext()가 완료된 후 저장된 reader를 사용합니다.
                updateUi(reader!!)
            } finally {
                // 코루틴이 취소되더라도 reader가 닫히도록 보장합니다.
                reader?.close()
            }
        }
    }

    private suspend fun updateUi(reader: BufferedReader) {
        // 파일 내용을 표시합니다.
        while (true) {
            val line = withContext(Dispatchers.IO) {
                reader.readLine()
            }
            if (line == null)
                break
            addOneLineToUi(line)
        }
    }

    private fun addOneLineToUi(line: String) {
        // UI에 한 줄을 추가하는 코드의 플레이스홀더
    }

    // UI 스레드에서만 호출 가능
    fun leaveScreen() {
        // 스코프를 취소하고 코루틴이 UI를 업데이트하는 것을 방지합니다.
        scope.cancel()
    }
}
```

이 예제에서는 `BufferedReader`를 변수에 저장하고 `finally` 블록에서 닫음으로써 코루틴이 취소되더라도 리소스가 해제되도록 보장합니다.

### 취소 불가능한 블록 실행 {id="run-non-cancelable-blocks"}

코루틴의 특정 부분에 취소가 영향을 미치지 않도록 방지할 수 있습니다.
그렇게 하려면 `withContext()` 코루틴 빌더 함수의 인자로 [`NonCancellable`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-non-cancellable/)을 전달하세요.

> `.launch()`나 `.async()`와 같은 다른 코루틴 빌더와 함께 `NonCancellable`을 사용하지 마세요. 부모-자식 관계를 끊어 구조적 동시성을 방해합니다.
>
{style="warning"}

`NonCancellable`은 중단 함수인 `close()`를 사용하여 리소스를 닫는 것과 같은 특정 작업이 코루틴이 완료되기 전에 취소되더라도 완료되도록 보장해야 할 때 유용합니다.

다음은 그 예입니다.

```kotlin
import kotlinx.coroutines.*
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
val serviceStarted = CompletableDeferred<Unit>()

fun startService() {
    println("Starting the service...")
    serviceStarted.complete(Unit)
}

suspend fun shutdownServiceAndWait() {
    println("Shutting down...")
    delay(100.milliseconds)
    println("Successfully shut down!")
}

suspend fun main() {
    withContext(Dispatchers.Default) {
        val childJob = launch {
            startService()
            try {
                awaitCancellation()
            } finally {
                withContext(NonCancellable) {
                    // withContext(NonCancellable)이 없으면,
                    // 코루틴이 취소되었기 때문에 이 함수가 완료되지 않습니다.
                    shutdownServiceAndWait()
                }
            }
        }
        serviceStarted.await()
        childJob.cancel()
    }
    println("Exiting the program")
}
//sampleEnd
```
{kotlin-runnable="true" id="noncancellable-blocks-example"}

## 타임아웃 {id="timeout"}

타임아웃(timeout)을 사용하면 지정된 시간이 지난 후 코루틴을 자동으로 취소할 수 있습니다.
너무 오래 걸리는 작업을 중단하는 데 사용할 수 있습니다.

예를 들어 서버에서 사진을 다운로드하는 요청이 타임아웃되면 다시 시도하거나 로컬 캐시를 사용하도록 전환할 수 있습니다.

타임아웃을 지정하려면 `Duration`과 함께 [`withTimeoutOrNull()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-timeout-or-null.html) 함수를 사용하세요.

```kotlin
import kotlinx.coroutines.*
import kotlin.time.Duration.Companion.milliseconds

//sampleStart
suspend fun slowOperation(): String {
    try {
        delay(300.milliseconds)
        return "A"
    } catch (e: CancellationException) {
        println("The slow operation has been canceled: $e")
        throw e
    }
}

suspend fun fastOperation(): String {
    try {
        delay(15.milliseconds)
        return "B"
    } catch (e: CancellationException) {
        println("The fast operation has been canceled: $e")
        throw e
    }
}

suspend fun main() {
    withContext(Dispatchers.Default) {
        val slow = withTimeoutOrNull(100.milliseconds) {
            slowOperation()
        }
        println("The slow operation finished with $slow")
        val fast = withTimeoutOrNull(100.milliseconds) {
            fastOperation()
        }
        println("The fast operation finished with $fast")
    }
}
//sampleEnd
```
{kotlin-runnable="true" id="timeout-example"}

타임아웃이 지정된 `Duration`을 초과하면 `withTimeoutOrNull()`은 `null`을 반환합니다.