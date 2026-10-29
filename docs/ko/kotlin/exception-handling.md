<!--- TEST_NAME ExceptionsGuideTest -->
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 코루틴 예외 처리)

이 섹션은 예외 처리와 예외 발생 시의 취소에 대해 다룹니다.
이미 알고 있듯이, 취소된 코루틴은 중단 지점(suspension points)에서 [CancellationException]을 던지며, 이는 코루틴 메커니즘에 의해 무시됩니다. 여기서는 취소 중에 예외가 발생하거나, 동일한 코루틴의 여러 자식 코루틴들이 예외를 던질 때 어떤 일이 발생하는지 살펴봅니다.

## 예외 전파 (Exception propagation) {id="exception-propagation"}

코루틴 빌더는 두 가지 형태가 있습니다: 예외를 자동으로 전파하는 것([launch])과 사용자에게 노출하는 것([async] 및 [produce])입니다.
이러한 빌더들이 다른 코루틴의 자식(child)이 아닌 *루트(root)* 코루틴을 생성하는 데 사용될 때, 전자의 빌더들은 Java의 `Thread.uncaughtExceptionHandler`와 유사하게 예외를 **잡지 않은(uncaught)** 예외로 처리하는 반면, 후자의 빌더들은 사용자가 최종 예외를 소비(예: [await][Deferred.await] 또는 [receive][ReceiveChannel.receive]를 통해)하는 것에 의존합니다. ([produce]와 [receive][ReceiveChannel.receive]는 [Channels](https://github.com/Kotlin/kotlinx.coroutines/blob/master/docs/channels.md) 섹션에서 다룹니다).

이는 [GlobalScope]를 사용하여 루트 코루틴을 생성하는 간단한 예제로 확인할 수 있습니다:

> [GlobalScope]는 복잡한 방식으로 역효과를 낼 수 있는 섬세한 API입니다. 전체 애플리케이션에 대한 루트 코루틴을 만드는 것은 `GlobalScope`를 사용하는 드문 정당한 사례 중 하나이므로, `@OptIn(DelicateCoroutinesApi::class)`를 사용하여 명시적으로 `GlobalScope` 사용을 선택해야 합니다.
>
{style="note"}

```kotlin
import kotlinx.coroutines.*

//sampleStart
@OptIn(DelicateCoroutinesApi::class)
fun main() = runBlocking {
    val job = GlobalScope.launch { // launch를 사용한 루트 코루틴
        println("Throwing exception from launch")
        throw IndexOutOfBoundsException() // Thread.defaultUncaughtExceptionHandler에 의해 콘솔에 출력됨
    }
    job.join()
    println("Joined failed job")
    val deferred = GlobalScope.async { // async를 사용한 루트 코루틴
        println("Throwing exception from async")
        throw ArithmeticException() // 아무것도 출력되지 않음, 사용자가 await를 호출하기를 기다림
    }
    try {
        deferred.await()
        println("Unreached")
    } catch (e: ArithmeticException) {
        println("Caught ArithmeticException")
    }
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-exceptions-01.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-exceptions-01.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드의 출력 결과는 다음과 같습니다 ([debug](https://github.com/Kotlin/kotlinx.coroutines/blob/master/docs/coroutine-context-and-dispatchers.md#debugging-coroutines-and-threads) 모드 기준):

```text
Throwing exception from launch
Exception in thread "DefaultDispatcher-worker-1 @coroutine#2" java.lang.IndexOutOfBoundsException
Joined failed job
Throwing exception from async
Caught ArithmeticException
```

<!--- TEST EXCEPTION-->

## CoroutineExceptionHandler {id="coroutineexceptionhandler"}

**잡지 않은(uncaught)** 예외를 콘솔에 출력하는 기본 동작을 사용자 정의할 수 있습니다.
*루트* 코루틴의 [CoroutineExceptionHandler] 컨텍스트 요소는 이 루트 코루틴과 모든 자식 코루틴에 대한 일반적인 `catch` 블록으로 사용될 수 있으며, 여기서 사용자 정의 예외 처리가 가능합니다.
이는 [`Thread.uncaughtExceptionHandler`](https://docs.oracle.com/javase/8/docs/api/java/lang/Thread.html#setUncaughtExceptionHandler-java.lang.Thread.UncaughtExceptionHandler-)와 유사합니다.
`CoroutineExceptionHandler`에서 예외로부터 복구할 수는 없습니다. 핸들러가 호출될 때 코루틴은 이미 해당 예외와 함께 완료된 상태입니다. 일반적으로 핸들러는 예외를 로깅하거나, 어떤 종류의 오류 메시지를 표시하거나, 애플리케이션을 종료 또는 재시작하는 데 사용됩니다.

`CoroutineExceptionHandler`는 다른 방법으로 처리되지 않은 **잡지 않은(uncaught)** 예외에 대해서만 호출됩니다.
특히, 모든 *자식* 코루틴(다른 [Job]의 컨텍스트에서 생성된 코루틴)은 예외 처리를 부모 코루틴에 위임하고, 부모 코루틴은 다시 부모에게 위임하는 식으로 루트까지 올라가므로, 자식 코루틴의 컨텍스트에 설치된 `CoroutineExceptionHandler`는 절대 사용되지 않습니다.
또한, [async] 빌더는 항상 모든 예외를 잡아 결과 [Deferred] 객체에 나타내므로, `async` 빌더의 `CoroutineExceptionHandler` 역시 효과가 없습니다.

> 슈퍼비전(supervision) 스코프에서 실행되는 코루틴은 부모로 예외를 전파하지 않으며 이 규칙에서 제외됩니다. 이 문서의 뒷부분인 [슈퍼비전](#supervision) 섹션에서 자세한 내용을 다룹니다.
>
{style="note"}  

```kotlin
import kotlinx.coroutines.*

@OptIn(DelicateCoroutinesApi::class)
fun main() = runBlocking {
//sampleStart
    val handler = CoroutineExceptionHandler { _, exception -> 
        println("CoroutineExceptionHandler got $exception") 
    }
    val job = GlobalScope.launch(handler) { // GlobalScope에서 실행되는 루트 코루틴
        throw AssertionError()
    }
    val deferred = GlobalScope.async(handler) { // 이 또한 루트이지만, launch 대신 async 사용
        throw ArithmeticException() // 아무것도 출력되지 않음, 사용자가 deferred.await()을 호출하기를 기다림
    }
    joinAll(job, deferred)
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-exceptions-02.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-exceptions-02.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드의 출력 결과는 다음과 같습니다:

```text
CoroutineExceptionHandler got java.lang.AssertionError
```

<!--- TEST-->

## 취소와 예외 (Cancellation and exceptions) {id="cancellation-and-exceptions"}

취소는 예외와 밀접한 관련이 있습니다. 코루틴은 내부적으로 취소를 위해 `CancellationException`을 사용하며, 이러한 예외는 모든 핸들러에 의해 무시되므로 `catch` 블록을 통해 얻을 수 있는 추가적인 디버그 정보의 소스로만 사용되어야 합니다.
[Job.cancel]을 사용하여 코루틴을 취소하면 종료되지만, 부모는 취소하지 않습니다.

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
//sampleStart
    val job = launch {
        val child = launch {
            try {
                delay(Long.MAX_VALUE)
            } finally {
                println("Child is cancelled")
            }
        }
        yield()
        println("Cancelling child")
        child.cancel()
        child.join()
        yield()
        println("Parent is not cancelled")
    }
    job.join()
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-exceptions-03.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-exceptions-03.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드의 출력 결과는 다음과 같습니다:

```text
Cancelling child
Child is cancelled
Parent is not cancelled
```

<!--- TEST-->

코루틴이 `CancellationException` 이외의 예외를 만나면 해당 예외로 부모를 취소합니다.
이 동작은 재정의할 수 없으며, [구조화된 동시성(structured concurrency)](https://github.com/Kotlin/kotlinx.coroutines/blob/master/docs/composing-suspending-functions.md#structured-concurrency-with-async)을 위한 안정적인 코루틴 계층 구조를 제공하는 데 사용됩니다.
[CoroutineExceptionHandler] 구현은 자식 코루틴에 사용되지 않습니다.

> 이 예제들에서 [CoroutineExceptionHandler]는 항상 [GlobalScope]에서 생성된 코루틴에 설치됩니다. 메인 [runBlocking]의 스코프에서 실행되는 코루틴에 예외 핸들러를 설치하는 것은 의미가 없습니다. 메인 코루틴은 핸들러가 설치되어 있더라도 자식 코루틴이 예외로 완료되면 항상 취소되기 때문입니다.
>
{style="note"}

원래 발생한 예외는 모든 자식 코루틴이 종료된 후에만 부모에 의해 처리되며, 이는 다음 예제를 통해 확인할 수 있습니다.

```kotlin
import kotlinx.coroutines.*

@OptIn(DelicateCoroutinesApi::class)
fun main() = runBlocking {
//sampleStart
    val handler = CoroutineExceptionHandler { _, exception -> 
        println("CoroutineExceptionHandler got $exception") 
    }
    val job = GlobalScope.launch(handler) {
        launch { // 첫 번째 자식
            try {
                delay(Long.MAX_VALUE)
            } finally {
                withContext(NonCancellable) {
                    println("Children are cancelled, but exception is not handled until all children terminate")
                    delay(100)
                    println("The first child finished its non cancellable block")
                }
            }
        }
        launch { // 두 번째 자식
            delay(10)
            println("Second child throws an exception")
            throw ArithmeticException()
        }
    }
    job.join()
//sampleEnd 
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-exceptions-04.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-exceptions-04.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드의 출력 결과는 다음과 같습니다:

```text
Second child throws an exception
Children are cancelled, but exception is not handled until all children terminate
The first child finished its non cancellable block
CoroutineExceptionHandler got java.lang.ArithmeticException
```

<!--- TEST-->

## 예외 통합 (Exceptions aggregation) {id="exceptions-aggregation"}

코루틴의 여러 자식이 예외로 실패할 때 일반적인 규칙은 "첫 번째 예외가 우선한다"는 것입니다. 따라서 첫 번째 예외가 처리됩니다.
첫 번째 예외 이후에 발생하는 모든 추가 예외는 첫 번째 예외의 억제된(suppressed) 예외로 첨부됩니다.

<!--- INCLUDE
import kotlinx.coroutines.exceptions.*
-->

```kotlin
import kotlinx.coroutines.*
import java.io.*

@OptIn(DelicateCoroutinesApi::class)
fun main() = runBlocking {
    val handler = CoroutineExceptionHandler { _, exception ->
        println("CoroutineExceptionHandler got $exception with suppressed ${exception.suppressed.contentToString()}")
    }
    val job = GlobalScope.launch(handler) {
        launch {
            try {
                delay(Long.MAX_VALUE) // 다른 형제가 IOException으로 실패하면 취소됨
            } finally {
                throw ArithmeticException() // 두 번째 예외
            }
        }
        launch {
            delay(100)
            throw IOException() // 첫 번째 예외
        }
        delay(Long.MAX_VALUE)
    }
    job.join()  
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-exceptions-05.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-exceptions-05.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드의 출력 결과는 다음과 같습니다:

```text
CoroutineExceptionHandler got java.io.IOException with suppressed [java.lang.ArithmeticException]
```

<!--- TEST-->

> 이 메커니즘은 현재 Java 버전 1.7 이상에서만 작동합니다.
> JS 및 Native의 제한 사항은 일시적이며 향후 해결될 예정입니다.
>
{style="note"}

취소 예외(Cancellation exceptions)는 투명하며 기본적으로 래핑이 해제(unwrapped)됩니다:

```kotlin
import kotlinx.coroutines.*
import java.io.*

@OptIn(DelicateCoroutinesApi::class)
fun main() = runBlocking {
//sampleStart
    val handler = CoroutineExceptionHandler { _, exception ->
        println("CoroutineExceptionHandler got $exception")
    }
    val job = GlobalScope.launch(handler) {
        val innerJob = launch { // 이 스택의 모든 코루틴이 취소됨
            launch {
                launch {
                    throw IOException() // 원래의 예외
                }
            }
        }
        try {
            innerJob.join()
        } catch (e: CancellationException) {
            println("Rethrowing CancellationException with original cause")
            throw e // 취소 예외가 다시 던져지지만, 원래의 IOException이 핸들러로 전달됨
        }
    }
    job.join()
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-exceptions-06.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-exceptions-06.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드의 출력 결과는 다음과 같습니다:

```text
Rethrowing CancellationException with original cause
CoroutineExceptionHandler got java.io.IOException
```

<!--- TEST-->

## 슈퍼비전 (Supervision) {id="supervision"}

앞서 공부했듯이, 취소는 코루틴의 전체 계층 구조를 통해 전파되는 양방향 관계입니다. 이제 단방향 취소가 필요한 경우를 살펴보겠습니다.

이러한 요구 사항의 좋은 예는 자신의 스코프 내에 Job이 정의된 UI 구성 요소입니다. UI의 자식 태스크 중 하나라도 실패했다고 해서 전체 UI 구성 요소를 취소(사실상 중단)할 필요는 없지만, UI 구성 요소가 파괴되면(그리고 해당 Job이 취소되면) 결과가 더 이상 필요하지 않으므로 모든 자식 Job을 취소해야 합니다.

또 다른 예는 여러 자식 Job을 생성하고 실행을 *감독(supervise)* 하며, 실패를 추적하고 실패한 것만 다시 시작해야 하는 서버 프로세스입니다.

### 슈퍼비전 Job (Supervision job) {id="supervision-job"}

이러한 목적으로 [SupervisorJob][SupervisorJob()]을 사용할 수 있습니다.
이는 일반적인 [Job][Job()]과 유사하지만, 취소가 아래 방향으로만 전파된다는 점이 다릅니다. 이는 다음 예제를 통해 쉽게 확인할 수 있습니다:

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
//sampleStart
    val supervisor = SupervisorJob()
    with(CoroutineScope(coroutineContext + supervisor)) {
        // 첫 번째 자식 실행 -- 이 예제에서는 예외가 무시됨 (실제로는 이렇게 하지 마세요!)
        val firstChild = launch(CoroutineExceptionHandler { _, _ ->  }) {
            println("The first child is failing")
            throw AssertionError("The first child is cancelled")
        }
        // 두 번째 자식 실행
        val secondChild = launch {
            firstChild.join()
            // 첫 번째 자식의 취소가 두 번째 자식으로 전파되지 않음
            println("The first child is cancelled: ${firstChild.isCancelled}, but the second one is still active")
            try {
                delay(Long.MAX_VALUE)
            } finally {
                // 하지만 supervisor의 취소는 전파됨
                println("The second child is cancelled because the supervisor was cancelled")
            }
        }
        // 첫 번째 자식이 실패하고 완료될 때까지 대기
        firstChild.join()
        println("Cancelling the supervisor")
        supervisor.cancel()
        secondChild.join()
    }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-supervision-01.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-supervision-01.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드의 출력 결과는 다음과 같습니다:

```text
The first child is failing
The first child is cancelled: true, but the second one is still active
Cancelling the supervisor
The second child is cancelled because the supervisor was cancelled
```

<!--- TEST-->

### 슈퍼비전 스코프 (Supervision scope) {id="supervision-scope"}

*범위가 지정된(scoped)* 동시성을 위해 [coroutineScope][_coroutineScope] 대신 [supervisorScope][_supervisorScope]를 사용할 수 있습니다. 이는 취소를 한 방향으로만 전파하며, 자기 자신이 실패했을 때만 모든 자식을 취소합니다. 또한 [coroutineScope][_coroutineScope]와 마찬가지로 완료되기 전에 모든 자식을 기다립니다.

```kotlin
import kotlin.coroutines.*
import kotlinx.coroutines.*

fun main() = runBlocking {
//sampleStart
    try {
        supervisorScope {
            val child = launch {
                try {
                    println("The child is sleeping")
                    delay(Long.MAX_VALUE)
                } finally {
                    println("The child is cancelled")
                }
            }
            // yield를 사용하여 자식이 실행되고 출력할 기회를 줌
            yield()
            println("Throwing an exception from the scope")
            throw AssertionError()
        }
    } catch(e: AssertionError) {
        println("Caught an assertion error")
    }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-supervision-02.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-supervision-02.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드의 출력 결과는 다음과 같습니다:

```text
The child is sleeping
Throwing an exception from the scope
The child is cancelled
Caught an assertion error
```

<!--- TEST-->

#### 슈퍼비전하의 코루틴 내 예외 (Exceptions in supervised coroutines) {id="exceptions-in-supervised-coroutines"}

일반 Job과 Supervisor Job의 또 다른 중요한 차이점은 예외 처리 방식입니다.
모든 자식 코루틴은 예외 처리 메커니즘을 통해 스스로 예외를 처리해야 합니다.
이 차이는 자식의 실패가 부모로 전파되지 않는다는 사실에서 비롯됩니다.
즉, [supervisorScope][_supervisorScope] 내에서 직접 실행된 코루틴은 루트 코루틴과 동일한 방식으로 스코프에 설치된 [CoroutineExceptionHandler]를 사용합니다.
(자세한 내용은 [CoroutineExceptionHandler](#coroutineexceptionhandler) 섹션을 참조하세요).

```kotlin
import kotlin.coroutines.*
import kotlinx.coroutines.*

fun main() = runBlocking {
//sampleStart
    val handler = CoroutineExceptionHandler { _, exception -> 
        println("CoroutineExceptionHandler got $exception") 
    }
    supervisorScope {
        val child = launch(handler) {
            println("The child throws an exception")
            throw AssertionError()
        }
        println("The scope is completing")
    }
    println("The scope is completed")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-supervision-03.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-supervision-03.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드의 출력 결과는 다음과 같습니다:

```text
The scope is completing
The child throws an exception
CoroutineExceptionHandler got java.lang.AssertionError
The scope is completed
```

<!--- TEST-->

<!--- MODULE kotlinx-coroutines-core -->
<!--- INDEX kotlinx.coroutines -->

[CancellationException]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-cancellation-exception/index.html
[launch]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html
[async]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html
[Deferred.await]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-deferred/await.html
[GlobalScope]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-global-scope/index.html
[CoroutineExceptionHandler]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-exception-handler/index.html
[Job]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/index.html
[Deferred]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-deferred/index.html
[Job.cancel]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/cancel.html
[runBlocking]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/run-blocking.html
[SupervisorJob()]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-supervisor-job.html
[Job()]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job.html
[_coroutineScope]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/coroutine-scope.html
[_supervisorScope]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/supervisor-scope.html

<!--- INDEX kotlinx.coroutines.channels -->

[produce]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/produce.html
[ReceiveChannel.receive]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-receive-channel/receive.html

<!--- END -->