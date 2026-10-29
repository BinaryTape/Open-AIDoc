<!--- TEST_NAME DispatcherGuideTest -->
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 코루틴 컨텍스트와 디스패처)

코루틴은 항상 Kotlin 표준 라이브러리에 정의된 [CoroutineContext](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.coroutines/-coroutine-context/) 타입의 값으로 표현되는 어떤 컨텍스트(context) 내에서 실행됩니다.

코루틴 컨텍스트는 다양한 요소들의 집합입니다. 주요 요소로는 이전에 살펴보았던 코루틴의 [Job]과 이번 섹션에서 다룰 디스패처(dispatcher)가 있습니다.

## 디스패처와 스레드 {id="dispatchers-and-threads"}

코루틴 컨텍스트에는 해당 코루틴이 실행될 때 사용할 스레드 또는 스레드들을 결정하는 *코루틴 디스패처*(참조 [CoroutineDispatcher])가 포함됩니다. 코루틴 디스패처는 코루틴 실행을 특정 스레드로 한정하거나, 스레드 풀로 전달하거나, 혹은 한정되지 않은(unconfined) 상태로 실행되게 할 수 있습니다.

[launch]나 [async]와 같은 모든 코루틴 빌더는 새로운 코루틴을 위한 디스패처나 다른 컨텍스트 요소들을 명시적으로 지정할 수 있는 [CoroutineContext](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.coroutines/-coroutine-context/) 파라미터를 선택적으로 받을 수 있습니다.

다음 예제를 시도해 보세요:

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
//sampleStart
    launch { // 부모의 컨텍스트인 메인 runBlocking 코루틴을 상속받음
        println("main runBlocking      : I'm working in thread ${Thread.currentThread().name}")
    }
    launch(Dispatchers.Unconfined) { // 한정되지 않음 -- 메인 스레드에서 동작함
        println("Unconfined            : I'm working in thread ${Thread.currentThread().name}")
    }
    launch(Dispatchers.Default) { // DefaultDispatcher로 디스패치됨
        println("Default               : I'm working in thread ${Thread.currentThread().name}")
    }
    launch(newSingleThreadContext("MyOwnThread")) { // 자체적인 새 스레드를 할당받음
        println("newSingleThreadContext: I'm working in thread ${Thread.currentThread().name}")
    }
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-01.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-01.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드는 다음과 같은 출력을 생성합니다 (순서는 다를 수 있습니다):

```text
Unconfined            : I'm working in thread main
Default               : I'm working in thread DefaultDispatcher-worker-1
newSingleThreadContext: I'm working in thread MyOwnThread
main runBlocking      : I'm working in thread main
```

<!--- TEST LINES_START_UNORDERED -->

`launch { ... }`를 파라미터 없이 사용하면, 실행된 [CoroutineScope]로부터 컨텍스트(따라서 디스패처까지)를 상속받습니다. 이 경우, `main` 스레드에서 실행되는 메인 `runBlocking` 코루틴의 컨텍스트를 상속받습니다.

[Dispatchers.Unconfined]는 `main` 스레드에서 실행되는 것처럼 보이는 특수한 디스패처이지만, 실제로는 나중에 설명할 다른 메커니즘입니다.

기본 디스패처(Default dispatcher)는 스코프 내에서 다른 디스패처가 명시적으로 지정되지 않았을 때 사용됩니다. 이는 [Dispatchers.Default]로 표현되며 공유된 백그라운드 스레드 풀을 사용합니다.

[newSingleThreadContext]는 코루틴이 실행될 새로운 스레드를 생성합니다. 전용 스레드는 매우 비싼 자원입니다. 실제 애플리케이션에서는 더 이상 필요하지 않을 때 [close][ExecutorCoroutineDispatcher.close] 함수를 사용하여 해제하거나, 최상위 변수에 저장하여 애플리케이션 전체에서 재사용해야 합니다.

## Unconfined vs confined 디스패처 {id="unconfined-vs-confined-dispatcher"}

[Dispatchers.Unconfined] 코루틴 디스패처는 호출한 스레드에서 코루틴을 시작하지만, 첫 번째 일시 중단점(suspension point)까지만 그렇게 합니다. 일시 중단 후에는 호출된 일시 중단 함수에 의해 완전히 결정된 스레드에서 코루틴을 재개합니다. Unconfined 디스패처는 CPU 시간을 소비하지 않거나 특정 스레드에 한정된 공유 데이터(예: UI)를 업데이트하지 않는 코루틴에 적합합니다.

반면, 기본적으로 디스패처는 외부 [CoroutineScope]로부터 상속됩니다. 특히 [runBlocking] 코루틴의 기본 디스패처는 호출한 스레드에 한정(confine)되므로, 이를 상속받으면 예측 가능한 FIFO 스케줄링을 통해 해당 스레드에 실행을 한정하는 효과가 있습니다.

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
//sampleStart
    launch(Dispatchers.Unconfined) { // 한정되지 않음 -- 메인 스레드에서 동작함
        println("Unconfined      : I'm working in thread ${Thread.currentThread().name}")
        delay(500)
        println("Unconfined      : After delay in thread ${Thread.currentThread().name}")
    }
    launch { // 부모의 컨텍스트인 메인 runBlocking 코루틴을 상속받음
        println("main runBlocking: I'm working in thread ${Thread.currentThread().name}")
        delay(1000)
        println("main runBlocking: After delay in thread ${Thread.currentThread().name}")
    }
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-02.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-02.kt)에서 확인할 수 있습니다.
>
{style="note"}

출력 결과:

```text
Unconfined      : I'm working in thread main
main runBlocking: I'm working in thread main
Unconfined      : After delay in thread kotlinx.coroutines.DefaultExecutor
main runBlocking: After delay in thread main
```

<!--- TEST LINES_START -->

따라서 `runBlocking {...}`으로부터 컨텍스트를 상속받은 코루틴은 `main` 스레드에서 계속 실행되는 반면, unconfined 코루틴은 [delay] 함수가 사용하는 기본 익스큐터(executor) 스레드에서 재개됩니다.

> Unconfined 디스패처는 코루틴의 연산을 즉시 수행해야 해서 나중에 실행하도록 디스패치하는 것이 필요하지 않거나 원치 않는 부수 효과를 발생시키는 특정 코너 케이스에서 도움이 될 수 있는 고급 메커니즘입니다. 일반적인 코드에서 Unconfined 디스패처를 사용해서는 안 됩니다.
>
{style="note"}

## 코루틴 및 스레드 디버깅 {id="debugging-coroutines-and-threads"}

코루틴은 한 스레드에서 일시 중단되고 다른 스레드에서 재개될 수 있습니다. 단일 스레드 디스패처를 사용하더라도 특별한 도구가 없다면 코루틴이 무엇을, 어디서, 언제 하고 있었는지 파악하기 어려울 수 있습니다.

### IDEA를 사용한 디버깅 {id="debugging-with-idea"}

Kotlin 플러그인의 코루틴 디버거(Coroutine Debugger)는 IntelliJ IDEA에서 코루틴 디버깅을 간소화해 줍니다.

> 디버깅은 `kotlinx-coroutines-core` 1.3.8 버전 이상에서 작동합니다.
>
{style="note"}

**Debug** 도구 창에는 **Coroutines** 탭이 있습니다. 이 탭에서 현재 실행 중인 코루틴과 일시 중단된 코루틴에 대한 정보를 모두 찾을 수 있습니다. 코루틴은 실행 중인 디스패처별로 그룹화됩니다.

![코루틴 디버깅](coroutine-idea-debugging-1.png){width=700}

코루틴 디버거를 사용하면 다음을 수행할 수 있습니다:
* 각 코루틴의 상태를 확인합니다.
* 실행 중인 코루틴과 일시 중단된 코루틴 모두에 대해 로컬 변수 및 캡처된 변수의 값을 확인합니다.
* 전체 코루틴 생성 스택과 코루틴 내부의 호출 스택을 확인합니다. 스택에는 변수 값이 포함된 모든 프레임이 포함되며, 이는 표준 디버깅 중에 손실될 수 있는 프레임들까지 포함합니다.
* 각 코루틴의 상태와 스택이 포함된 전체 보고서를 가져옵니다. 이를 얻으려면 **Coroutines** 탭 내부를 마우스 오른쪽 버튼으로 클릭한 다음 **Get Coroutines Dump**를 클릭합니다.

코루틴 디버깅을 시작하려면 중단점(breakpoint)을 설정하고 애플리케이션을 디버그 모드로 실행하기만 하면 됩니다.

코루틴 디버깅에 대해 더 자세히 알아보려면 [튜토리얼](https://kotlinlang.org/docs/tutorials/coroutines/debug-coroutines-with-idea.html)을 참조하세요.

### 로깅을 사용한 디버깅 {id="debugging-using-logging"}

코루틴 디버거 없이 스레드를 사용하는 애플리케이션을 디버깅하는 또 다른 방법은 각 로그 문에 스레드 이름을 출력하는 것입니다. 이 기능은 로깅 프레임워크에서 보편적으로 지원됩니다. 코루틴을 사용할 때 스레드 이름만으로는 충분한 컨텍스트를 제공하지 못할 수 있으므로, `kotlinx.coroutines`는 이를 쉽게 만들어주는 디버깅 기능을 포함하고 있습니다.

다음 코드를 `-Dkotlinx.coroutines.debug` JVM 옵션과 함께 실행해 보세요:

```kotlin
import kotlinx.coroutines.*

fun log(msg: String) = println("[${Thread.currentThread().name}] $msg")

fun main() = runBlocking<Unit> {
//sampleStart
    val a = async {
        log("I'm computing a piece of the answer")
        6
    }
    val b = async {
        log("I'm computing another piece of the answer")
        7
    }
    log("The answer is ${a.await() * b.await()}")
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-03.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-03.kt)에서 확인할 수 있습니다.
>
{style="note"}

세 개의 코루틴이 있습니다. `runBlocking` 내부의 메인 코루틴(#1)과 지연된 값(deferred values) `a`(#2) 및 `b`(#3)를 계산하는 두 코루틴입니다. 이들은 모두 `runBlocking` 컨텍스트 내에서 실행되며 메인 스레드에 한정되어 있습니다. 이 코드의 출력은 다음과 같습니다:

```text
[main @coroutine#2] I'm computing a piece of the answer
[main @coroutine#3] I'm computing another piece of the answer
[main @coroutine#1] The answer is 42
```

<!--- TEST FLEXIBLE_THREAD -->

`log` 함수는 대괄호 안에 스레드 이름을 출력하며, 디버깅 모드가 켜져 있을 때 현재 실행 중인 코루틴의 식별자가 스레드 이름 뒤에 추가된 것을 볼 수 있습니다. 이 식별자는 디버깅 모드일 때 생성되는 모든 코루틴에 순차적으로 할당됩니다.

> 디버깅 모드는 JVM이 `-ea` 옵션으로 실행될 때도 활성화됩니다. 디버깅 기능에 대한 자세한 내용은 [DEBUG_PROPERTY_NAME] 속성 문서를 참조하세요.
>
{style="note"}

## 스레드 간 전환 {id="jumping-between-threads"}

다음 코드를 `-Dkotlinx.coroutines.debug` JVM 옵션과 함께 실행해 보세요 ([디버깅](#debugging-coroutines-and-threads) 참조):

```kotlin
import kotlinx.coroutines.*

fun log(msg: String) = println("[${Thread.currentThread().name}] $msg")

fun main() {
    newSingleThreadContext("Ctx1").use { ctx1 ->
        newSingleThreadContext("Ctx2").use { ctx2 ->
            runBlocking(ctx1) {
                log("Started in ctx1")
                withContext(ctx2) {
                    log("Working in ctx2")
                }
                log("Back to ctx1")
            }
        }
    }
}
```
<!--- KNIT example-context-04.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-04.kt)에서 확인할 수 있습니다.
>
{style="note"}

위의 예제는 코루틴 사용의 새로운 기법들을 보여줍니다.

첫 번째 기법은 특정 컨텍스트와 함께 [runBlocking]을 사용하는 방법을 보여줍니다.
두 번째 기법은 [withContext] 호출을 포함합니다. 이는 현재 코루틴을 일시 중단하고 새로운 컨텍스트(기존 컨텍스트와 다를 경우)로 전환할 수 있습니다. 특히 다른 [CoroutineDispatcher]를 지정하면 추가적인 디스패치가 필요합니다. 즉, 블록이 새로운 디스패처에서 스케줄링되고, 완료되면 실행이 원래의 디스패처로 돌아갑니다.

결과적으로 위 코드의 출력은 다음과 같습니다:

```text
[Ctx1 @coroutine#1] Started in ctx1
[Ctx2 @coroutine#1] Working in ctx2
[Ctx1 @coroutine#1] Back to ctx1
```

<!--- TEST -->

위 예제는 [newSingleThreadContext]로 생성된 스레드 자원이 더 이상 필요하지 않을 때 적절히 해제하기 위해 Kotlin 표준 라이브러리의 `use` 함수를 사용합니다.

## 컨텍스트 내의 Job {id="job-in-the-context"}

코루틴의 [Job]은 컨텍스트의 일부이며, `coroutineContext[Job]` 표현식을 사용하여 컨텍스트에서 가져올 수 있습니다.

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
//sampleStart
    println("My job is ${coroutineContext[Job]}")
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-05.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-05.kt)에서 확인할 수 있습니다.
> 
{style="note"}

[디버그 모드](#debugging-coroutines-and-threads)에서는 다음과 같은 내용이 출력됩니다:

```
My job is "coroutine#1":BlockingCoroutine{Active}@6d311334
```

<!--- TEST lines.size == 1 && lines[0].startsWith("My job is \"coroutine#1\":BlockingCoroutine{Active}@") -->

참고로 [CoroutineScope]의 [isActive]는 `coroutineContext[Job]?.isActive == true`를 편리하게 사용하기 위한 단축 표현일 뿐입니다.

## 코루틴의 자식 {id="children-of-a-coroutine"}

다른 코루틴의 [CoroutineScope] 내에서 코루틴이 실행될 때, [CoroutineScope.coroutineContext]를 통해 컨텍스트를 상속받으며, 새로운 코루틴의 [Job]은 부모 코루틴 Job의 *자식(child)*이 됩니다. 부모 코루틴이 취소되면 모든 자식 코루틴들도 재귀적으로 취소됩니다.

하지만 이러한 부모-자식 관계는 다음 두 가지 방법 중 하나로 명시적으로 재정의할 수 있습니다:

1. 코루틴을 실행할 때 다른 스코프를 명시적으로 지정하면 (예: `GlobalScope.launch`), 부모 스코프의 `Job`을 상속받지 않습니다.
2. 새로운 코루틴의 컨텍스트로 다른 `Job` 객체를 전달하면 (아래 예제 참조), 부모 스코프의 `Job`을 재정의합니다.

두 경우 모두 실행된 코루틴은 자신이 실행된 스코프에 묶이지 않고 독립적으로 동작합니다.

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
//sampleStart
    // 어떤 종류의 들어오는 요청을 처리하기 위해 코루틴을 실행함
    val request = launch {
        // 두 개의 다른 Job을 생성함
        launch(Job()) { 
            println("job1: I run in my own Job and execute independently!")
            delay(1000)
            println("job1: I am not affected by cancellation of the request")
        }
        // 다른 하나는 부모 컨텍스트를 상속받음
        launch {
            delay(100)
            println("job2: I am a child of the request coroutine")
            delay(1000)
            println("job2: I will not execute this line if my parent request is cancelled")
        }
    }
    delay(500)
    request.cancel() // 요청 처리를 취소함
    println("main: Who has survived request cancellation?")
    delay(1000) // 무슨 일이 일어나는지 보기 위해 메인 스레드를 1초간 지연시킴
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-06.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-06.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드의 출력은 다음과 같습니다:

```text
job1: I run in my own Job and execute independently!
job2: I am a child of the request coroutine
main: Who has survived request cancellation?
job1: I am not affected by cancellation of the request
```

<!--- TEST -->

## 부모의 책임 {id="parental-responsibilities"}

부모 코루틴은 항상 모든 자식 코루틴이 완료될 때까지 기다립니다. 부모는 자신이 실행한 모든 자식을 명시적으로 추적할 필요가 없으며, 마지막에 자식들을 기다리기 위해 [Job.join]을 사용할 필요도 없습니다.

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
//sampleStart
    // 요청 처리를 위한 코루틴 실행
    val request = launch {
        repeat(3) { i -> // 몇 개의 자식 Job을 실행함
            launch  {
                delay((i + 1) * 200L) // 200ms, 400ms, 600ms의 가변 지연
                println("Coroutine $i is done")
            }
        }
        println("request: I'm done and I don't explicitly join my children that are still active")
    }
    request.join() // 모든 자식을 포함하여 요청이 완료될 때까지 기다림
    println("Now processing of the request is complete")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-07.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-07.kt)에서 확인할 수 있습니다.
>
{style="note"}

결과는 다음과 같습니다:

```text
request: I'm done and I don't explicitly join my children that are still active
Coroutine 0 is done
Coroutine 1 is done
Coroutine 2 is done
Now processing of the request is complete
```

<!--- TEST -->

## 디버깅을 위한 코루틴 명명 {id="naming-coroutines-for-debugging"}

자동으로 할당된 ID는 코루틴이 자주 로그를 남기고 동일한 코루틴에서 오는 로그 기록들을 연관시켜야 할 때 유용합니다. 하지만 코루틴이 특정 요청의 처리나 특정 백그라운드 작업을 수행하는 경우, 디버깅 목적을 위해 명시적으로 이름을 지정하는 것이 좋습니다. [CoroutineName] 컨텍스트 요소는 스레드 이름과 동일한 용도로 사용됩니다. [디버깅 모드](#debugging-coroutines-and-threads)가 켜져 있을 때 이 코루틴을 실행 중인 스레드 이름에 포함됩니다.

다음 예제는 이 개념을 보여줍니다:

```kotlin
import kotlinx.coroutines.*

fun log(msg: String) = println("[${Thread.currentThread().name}] $msg")

fun main() = runBlocking(CoroutineName("main")) {
//sampleStart
    log("Started main coroutine")
    // 두 개의 백그라운드 값 계산 실행
    val v1 = async(CoroutineName("v1coroutine")) {
        delay(500)
        log("Computing v1")
        6
    }
    val v2 = async(CoroutineName("v2coroutine")) {
        delay(1000)
        log("Computing v2")
        7
    }
    log("The answer for v1 * v2 = ${v1.await() * v2.await()}")
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-08.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-08.kt)에서 확인할 수 있습니다.
>
{style="note"}

`-Dkotlinx.coroutines.debug` JVM 옵션을 사용하여 생성된 출력은 다음과 유사합니다:

```text
[main @main#1] Started main coroutine
[main @v1coroutine#2] Computing v1
[main @v2coroutine#3] Computing v2
[main @main#1] The answer for v1 * v2 = 42
```

<!--- TEST FLEXIBLE_THREAD -->

## 컨텍스트 요소 결합하기 {id="combining-context-elements"}

때로는 코루틴 컨텍스트에 여러 요소를 정의해야 할 때가 있습니다. 이 경우 `+` 연산자를 사용할 수 있습니다. 예를 들어, 명시적으로 지정된 디스패처와 명시적으로 지정된 이름을 동시에 사용하여 코루틴을 실행할 수 있습니다:

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking<Unit> {
//sampleStart
    launch(Dispatchers.Default + CoroutineName("test")) {
        println("I'm working in thread ${Thread.currentThread().name}")
    }
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-09.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-09.kt)에서 확인할 수 있습니다.
>
{style="note"}

`-Dkotlinx.coroutines.debug` JVM 옵션을 사용한 이 코드의 출력은 다음과 같습니다:

```text
I'm working in thread DefaultDispatcher-worker-1 @test#2
```

<!--- TEST FLEXIBLE_THREAD -->

## 코루틴 스코프 {id="coroutine-scope"}

컨텍스트, 자식, Job에 대한 지식을 하나로 합쳐 봅시다. 애플리케이션에 생명주기(lifecycle)를 가진 객체가 있지만 그 객체가 코루틴은 아니라고 가정해 보겠습니다. 예를 들어, Android 애플리케이션을 작성 중이며, 데이터를 가져오고 업데이트하거나 애니메이션을 수행하는 등의 비동기 작업을 수행하기 위해 Android activity 컨텍스트에서 다양한 코루틴을 실행하고 있습니다. 이러한 코루틴들은 메모리 누수를 방지하기 위해 activity가 종료될 때 취소되어야 합니다.

물론 activity의 생명주기와 코루틴을 묶기 위해 컨텍스트와 Job을 수동으로 조작할 수도 있지만, `kotlinx.coroutines`는 이를 캡슐화한 추상화인 [CoroutineScope]를 제공합니다. 모든 코루틴 빌더가 CoroutineScope의 확장 함수로 선언되어 있으므로 이미 익숙하실 것입니다.

activity의 생명주기에 결합된 [CoroutineScope] 인스턴스를 생성하여 코루틴의 생명주기를 관리합니다. `CoroutineScope` 인스턴스는 [CoroutineScope()] 또는 [MainScope()] 팩토리 함수로 생성할 수 있습니다. 전자는 범용 스코프를 생성하고, 후자는 UI 애플리케이션을 위한 스코프를 생성하며 [Dispatchers.Main]을 기본 디스패처로 사용합니다:

```kotlin
class Activity {
    private val mainScope = MainScope()
    
    fun destroy() {
        mainScope.cancel()
    }
    // 계속해서 ...
```

이제 정의된 `mainScope`를 사용하여 이 `Activity` 스코프에서 코루틴을 실행할 수 있습니다. 데모를 위해 서로 다른 시간 동안 지연되는 10개의 코루틴을 실행해 보겠습니다:

```kotlin
    // Activity 클래스 계속
    fun doSomething() {
        // 데모를 위해 각각 다른 시간 동안 작동하는 10개의 코루틴 실행
        repeat(10) { i ->
            mainScope.launch {
                delay((i + 1) * 200L) // 200ms, 400ms 등 가변 지연
                println("Coroutine $i is done")
            }
        }
    }
} // Activity 클래스 끝
``` 

메인 함수에서 activity를 생성하고, 테스트용 `doSomething` 함수를 호출한 다음, 500ms 후에 activity를 종료합니다. 이는 `doSomething`에서 실행된 모든 코루틴을 취소합니다. activity가 종료된 후에는 조금 더 기다려도 더 이상 메시지가 출력되지 않는 것을 통해 이를 확인할 수 있습니다.

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*

class Activity {
    private val mainScope = CoroutineScope(Dispatchers.Default) // 테스트 목적으로 Default 사용
    
    fun destroy() {
        mainScope.cancel()
    }

    fun doSomething() {
        // 데모를 위해 각각 다른 시간 동안 작동하는 10개의 코루틴 실행
        repeat(10) { i ->
            mainScope.launch {
                delay((i + 1) * 200L) // 200ms, 400ms 등 가변 지연
                println("Coroutine $i is done")
            }
        }
    }
} // Activity 클래스 끝

fun main() = runBlocking<Unit> {
//sampleStart
    val activity = Activity()
    activity.doSomething() // 테스트 함수 실행
    println("Launched coroutines")
    delay(500L) // 0.5초간 지연
    println("Destroying activity!")
    activity.destroy() // 모든 코루틴 취소
    delay(1000) // 코루틴이 작동하지 않는지 시각적으로 확인
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-10.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-10.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 예제의 출력은 다음과 같습니다:

```text
Launched coroutines
Coroutine 0 is done
Coroutine 1 is done
Destroying activity!
```

<!--- TEST -->

보시다시피 처음 두 개의 코루틴만 메시지를 출력하고 나머지는 `Activity.destroy()`에서 [`mainScope.cancel()`][CoroutineScope.cancel]을 한 번 호출함으로써 모두 취소되었습니다.

> Android는 생명주기가 있는 모든 엔티티에 대해 코루틴 스코프를 공식적으로 지원합니다. [관련 문서](https://developer.android.com/topic/libraries/architecture/coroutines#lifecyclescope)를 참조하세요.
>
{style="note"}

### Thread-local 데이터 {id="thread-local-data"}

때로는 어떤 스레드 로컬(thread-local) 데이터를 코루틴에 전달하거나 코루틴 간에 전달할 수 있는 기능이 편리할 때가 있습니다. 하지만 코루틴은 특정 스레드에 묶여 있지 않기 때문에, 이를 수동으로 처리하려고 하면 상용구 코드(boilerplate)가 많이 발생할 수 있습니다.

[`ThreadLocal`](https://docs.oracle.com/javase/8/docs/api/java/lang/ThreadLocal.html)의 경우, [asContextElement] 확장 함수가 이를 해결해 줍니다. 이 함수는 지정된 `ThreadLocal` 값을 유지하고 코루틴이 컨텍스트를 전환할 때마다 이를 복원하는 추가적인 컨텍스트 요소를 생성합니다.

실제 작동 모습을 쉽게 보여줄 수 있습니다:

```kotlin
import kotlinx.coroutines.*

val threadLocal = ThreadLocal<String?>() // 스레드 로컬 변수 선언

fun main() = runBlocking<Unit> {
//sampleStart
    threadLocal.set("main")
    println("Pre-main, current thread: ${Thread.currentThread()}, thread local value: '${threadLocal.get()}'")
    val job = launch(Dispatchers.Default + threadLocal.asContextElement(value = "launch")) {
        println("Launch start, current thread: ${Thread.currentThread()}, thread local value: '${threadLocal.get()}'")
        yield()
        println("After yield, current thread: ${Thread.currentThread()}, thread local value: '${threadLocal.get()}'")
    }
    job.join()
    println("Post-main, current thread: ${Thread.currentThread()}, thread local value: '${threadLocal.get()}'")
//sampleEnd    
}
```  
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-context-11.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-context-11.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 예제에서는 [Dispatchers.Default]를 사용하여 백그라운드 스레드 풀에서 새로운 코루틴을 실행하므로 스레드 풀의 서로 다른 스레드에서 작동하지만, 코루틴이 어느 스레드에서 실행되든 상관없이 `threadLocal.asContextElement(value = "launch")`를 사용하여 지정한 스레드 로컬 변수 값을 여전히 유지합니다. 따라서 출력([디버그](#debugging-coroutines-and-threads) 포함)은 다음과 같습니다:

```text
Pre-main, current thread: Thread[main @coroutine#1,5,main], thread local value: 'main'
Launch start, current thread: Thread[DefaultDispatcher-worker-1 @coroutine#2,5,main], thread local value: 'launch'
After yield, current thread: Thread[DefaultDispatcher-worker-2 @coroutine#2,5,main], thread local value: 'launch'
Post-main, current thread: Thread[main @coroutine#1,5,main], thread local value: 'main'
```

<!--- TEST FLEXIBLE_THREAD -->

해당하는 컨텍스트 요소를 설정하는 것을 잊기 쉽습니다. 코루틴을 실행하는 스레드가 달라질 경우 코루틴에서 접근한 스레드 로컬 변수가 예상치 못한 값을 가질 수 있습니다. 이러한 상황을 방지하려면 [ensurePresent] 메서드를 사용하여 잘못된 사용에 대해 빠르게 실패(fail-fast)하도록 하는 것이 좋습니다.

`ThreadLocal`은 일급 지원을 받으며 `kotlinx.coroutines`가 제공하는 모든 기본 요소와 함께 사용할 수 있습니다. 그러나 한 가지 주요 제약이 있습니다. 스레드 로컬 값이 변경되었을 때 새로운 값이 코루틴 호출자에게 전파되지 않으며(컨텍스트 요소가 모든 `ThreadLocal` 객체 접근을 추적할 수 없기 때문), 업데이트된 값은 다음 일시 중단 시점에 손실됩니다. 코루틴에서 스레드 로컬 값을 업데이트하려면 [withContext]를 사용하세요. 자세한 내용은 [asContextElement]를 참조하십시오.

대안으로, `class Counter(var i: Int)`와 같은 가변 박스(mutable box)에 값을 저장하고, 이를 다시 스레드 로컬 변수에 저장할 수 있습니다. 하지만 이 경우에는 가변 박스에 대한 잠재적인 동시 수정을 동기화할 책임이 전적으로 사용자에게 있습니다.

로깅 MDC와의 통합, 트랜잭션 컨텍스트 또는 내부적으로 데이터 전달을 위해 스레드 로컬을 사용하는 다른 라이브러리와의 통합과 같은 고급 사용법은 구현해야 하는 [ThreadContextElement] 인터페이스 문서를 참조하십시오.

<!--- MODULE kotlinx-coroutines-core -->
<!--- INDEX kotlinx.coroutines -->

[Job]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/index.html
[CoroutineDispatcher]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-dispatcher/index.html
[launch]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html
[async]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html
[CoroutineScope]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/index.html
[Dispatchers.Unconfined]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-unconfined.html
[Dispatchers.Default]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-default.html
[newSingleThreadContext]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/new-single-thread-context.html
[ExecutorCoroutineDispatcher.close]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-executor-coroutine-dispatcher/close.html
[runBlocking]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/run-blocking.html
[delay]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/delay.html
[DEBUG_PROPERTY_NAME]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-d-e-b-u-g_-p-r-o-p-e-r-t-y_-n-a-m-e.html
[withContext]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-context.html
[isActive]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/is-active.html
[CoroutineScope.coroutineContext]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/coroutine-context.html
[Job.join]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/join.html
[CoroutineName]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-name/index.html
[CoroutineScope()]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope.html
[MainScope()]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-main-scope.html
[Dispatchers.Main]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-main.html
[CoroutineScope.cancel]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/cancel.html
[asContextElement]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/as-context-element.html
[ensurePresent]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/ensure-present.html
[ThreadContextElement]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-thread-context-element/index.html

<!--- END -->