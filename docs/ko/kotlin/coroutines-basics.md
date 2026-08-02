<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 코루틴 기초)

동시에 여러 작업을 수행하는 애플리케이션을 만들기 위해 코틀린은 동시성(concurrency)이라는 개념인 _코루틴(coroutines)_을 사용합니다. 코루틴은 명확하고 순차적인 스타일로 동시성 코드를 작성할 수 있게 해주는 중단 가능한 연산(suspendable computation)입니다. 코루틴은 다른 코루틴과 동시에 실행될 수 있으며, 잠재적으로 병렬(parallel)로 실행될 수도 있습니다.

JVM 및 Kotlin/Native에서 코루틴과 같은 모든 동시성 코드는 운영 체제에 의해 관리되는 _스레드(threads)_ 위에서 실행됩니다. 코루틴은 스레드를 블로킹(blocking)하는 대신 실행을 중단(suspend)할 수 있습니다. 이를 통해 한 코루틴이 데이터를 기다리는 동안 실행을 중단하면, 다른 코루틴이 동일한 스레드에서 실행될 수 있도록 하여 효율적인 리소스 활용을 보장합니다.

![병렬 및 동시성 스레드 비교](parallelism-and-concurrency.svg){width="700"}

코루틴과 스레드의 차이점에 대한 자세한 내용은 [코루틴과 JVM 스레드 비교](#comparing-coroutines-and-jvm-threads)를 참조하세요.

## 중단 함수 (Suspending functions)

코루틴의 가장 기본적인 빌딩 블록은 _중단 함수(suspending function)_입니다. 중단 함수는 코드의 구조에 영향을 주지 않으면서 실행 중인 작업을 일시 중지하고 나중에 재개할 수 있도록 해줍니다.

중단 함수를 선언하려면 `suspend` 키워드를 사용합니다:

```kotlin
suspend fun greet() {
    println("Hello world from a suspending function")
}
```

중단 함수는 다른 중단 함수 내에서만 호출할 수 있습니다. 코틀린 애플리케이션의 진입점(entry point)에서 중단 함수를 호출하려면 `main()` 함수에 `suspend` 키워드를 표시하세요:

```kotlin
suspend fun main() {
    showUserInfo()
}

suspend fun showUserInfo() {
    println("Loading user...")
    greet()
    println("User: John Smith")
}

suspend fun greet() {
    println("Hello world from a suspending function")
}
```
{kotlin-runnable="true"}

이 예제는 아직 동시성을 사용하지 않지만, 함수에 `suspend` 키워드를 표시함으로써 다른 중단 함수를 호출하고 그 내부에서 동시성 코드를 실행할 수 있게 됩니다.

`suspend` 키워드는 코틀린 언어의 핵심 기능이지만, 대부분의 코루틴 기능은 [`kotlinx.coroutines`](https://github.com/Kotlin/kotlinx.coroutines) 라이브러리를 통해 제공됩니다.

## 프로젝트에 kotlinx.coroutines 라이브러리 추가하기

프로젝트에 `kotlinx.coroutines` 라이브러리를 포함하려면 빌드 도구에 따라 해당 종속성 설정을 추가하세요:

<tabs group="build-tool">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts
repositories {
    mavenCentral()
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle
repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
}
```
</tab>

<tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<project>
    <dependencies>
        <dependency>
            <groupId>org.jetbrains.kotlinx</groupId>
            <artifactId>kotlinx-coroutines-core</artifactId>
            <version>%coroutinesVersion%</version>
        </dependency>
    </dependencies>
    ...
</project>
```

</tab>
</tabs>

## 첫 번째 코루틴 만들기

> 이 페이지의 예제들은 코루틴 빌더 함수인 `CoroutineScope.launch()` 및 `CoroutineScope.async()`와 함께 명시적인 `this` 표현식을 사용합니다.
> 이러한 코루틴 빌더들은 `CoroutineScope`에 대한 [확장 함수(extension functions)](extensions.md)이며, `this` 표현식은 수신 객체(receiver)로서 현재의 `CoroutineScope`를 가리킵니다.
>
> 실질적인 예제는 [코루틴 스코프에서 코루틴 빌더 추출하기](#extract-coroutine-builders-from-the-coroutine-scope)를 참조하세요.
>
{style="note"}

코틀린에서 코루틴을 만들려면 다음이 필요합니다:

* [중단 함수](#suspending-functions).
* 코루틴이 실행될 수 있는 [코루틴 스코프(coroutine scope)](#coroutine-scope-and-structured-concurrency) (예: `withContext()` 함수 내부).
* 코루틴을 시작하기 위한 `CoroutineScope.launch()`와 같은 [코루틴 빌더](#coroutine-builder-functions).
* 어떤 스레드를 사용할지 제어하는 [디스패처(dispatcher)](#coroutine-dispatchers).

멀티스레드 환경에서 여러 코루틴을 사용하는 예제를 살펴보겠습니다:

1. `kotlinx.coroutines` 라이브러리를 임포트합니다:

    ```kotlin
    import kotlinx.coroutines.*
    ```

2. 일시 중지 및 재개할 수 있는 함수에 `suspend` 키워드를 표시합니다:

    ```kotlin
    suspend fun greet() {
        println("The greet() on the thread: ${Thread.currentThread().name}")
    }
    
    suspend fun main() {}
    ```

    > 일부 프로젝트에서는 `main()` 함수를 `suspend`로 표시할 수 있지만, 기존 코드와 통합하거나 프레임워크를 사용할 때는 불가능할 수 있습니다.
    > 그런 경우에는 프레임워크 문서를 확인하여 중단 함수 호출을 지원하는지 확인하세요. 지원하지 않는다면 [`runBlocking()`](#runblocking)을 사용하여 현재 스레드를 블로킹하고 호출하세요.
    > 
    {style="note"}

3. 데이터 가져오기나 데이터베이스 쓰기 같은 중단 작업을 시뮬레이션하기 위해 [`delay()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/delay.html#) 함수를 추가합니다:

    ```kotlin
    suspend fun greet() {
        println("The greet() on the thread: ${Thread.currentThread().name}")
        delay(1000L)
    }
   ```

    <!-- > 밀리초를 사용하는 대신 `delay(1.seconds)`와 같이 기간을 표현하려면 코틀린 표준 라이브러리의 [`kotlin.time.Duration`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/-duration/)을 사용하세요.
    >
    {style="tip"} -->

4. 공유 스레드 풀에서 실행되는 멀티스레드 동시성 코드의 진입점을 정의하기 위해 [`withContext(Dispatchers.Default)`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-context.html#)를 사용합니다:

    ```kotlin
    suspend fun main() {
        withContext(Dispatchers.Default) {
            // 여기에 코루틴 빌더 추가
        }
    }
    ```

   > 중단 함수인 `withContext()`는 일반적으로 [문맥 전환(context switching)](coroutine-context-and-dispatchers.md#jumping-between-threads)에 사용되지만, 이 예제에서는 동시성 코드를 위한 비차단(non-blocking) 진입점을 정의하기도 합니다.
   > 멀티스레드 실행을 위해 공유 스레드 풀에서 코드를 실행하도록 [`Dispatchers.Default` 디스패처](#coroutine-dispatchers)를 사용합니다.
   > 기본적으로 이 풀은 런타임에 사용 가능한 CPU 코어 수만큼의 스레드를 사용하며, 최소 2개의 스레드를 가집니다.
   > 
   > `withContext()` 블록 내부에서 시작된 코루틴들은 동일한 코루틴 스코프를 공유하며, 이는 [구조화된 동시성(structured concurrency)](#coroutine-scope-and-structured-concurrency)을 보장합니다.
   > 
   {style="note"}

5. 코루틴을 시작하기 위해 [`CoroutineScope.launch()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html)와 같은 [코루틴 빌더 함수](#coroutine-builder-functions)를 사용합니다:

    ```kotlin
    suspend fun main() {
        withContext(Dispatchers.Default) { // this: CoroutineScope
            // CoroutineScope.launch()를 사용하여 스코프 내부에서 코루틴 시작
            this.launch { greet() }
            println("The withContext() on the thread: ${Thread.currentThread().name}")
        }
    }
    ```

6. 이 조각들을 결합하여 공유 스레드 풀에서 여러 코루틴을 동시에 실행합니다:

    ```kotlin
    // 코루틴 라이브러리 임포트
    import kotlinx.coroutines.*

    // 초 단위로 기간을 표현하기 위해 kotlin.time.Duration 임포트
    import kotlin.time.Duration.Companion.seconds

    // 중단 함수 정의
    suspend fun greet() {
        println("The greet() on the thread: ${Thread.currentThread().name}")
        // 1초 동안 중단하고 스레드를 해제함
        delay(1.seconds) 
        // 여기서 delay() 함수는 중단 API 호출을 시뮬레이션함
        // 네트워크 요청과 같은 중단 API 호출을 여기에 추가할 수 있음
    }

    suspend fun main() {
        // 이 블록 내부의 코드를 공유 스레드 풀에서 실행
        withContext(Dispatchers.Default) { // this: CoroutineScope
            this.launch() {
                greet()
            }
   
            // 또 다른 코루틴 시작
            this.launch() {
                println("The CoroutineScope.launch() on the thread: ${Thread.currentThread().name}")
                delay(1.seconds)
                // 여기서 delay 함수는 중단 API 호출을 시뮬레이션함
                // 네트워크 요청과 같은 중단 API 호출을 여기에 추가할 수 있음
            }
    
            println("The withContext() on the thread: ${Thread.currentThread().name}")
        }
    }
    ```
    {kotlin-runnable="true"}

예제를 여러 번 실행해 보세요. 운영 체제가 스레드 실행 시점을 결정하기 때문에, 프로그램을 실행할 때마다 출력 순서와 스레드 이름이 바뀔 수 있음을 알 수 있습니다.

> 추가 정보를 위해 코드 출력 시 스레드 이름 옆에 코루틴 이름을 표시할 수 있습니다.
> 이를 위해 빌드 도구나 IDE의 실행 구성에서 `-Dkotlinx.coroutines.debug` VM 옵션을 전달하세요.
>
> 자세한 내용은 [코루틴 디버깅](https://github.com/Kotlin/kotlinx.coroutines/blob/master/docs/topics/debugging.md)을 참조하세요.
>
{style="tip"}

## 코루틴 스코프와 구조화된 동시성

애플리케이션에서 많은 코루틴을 실행할 때는 이를 그룹으로 관리할 방법이 필요합니다. 코틀린 코루틴은 이러한 구조를 제공하기 위해 _구조화된 동시성(structured concurrency)_이라는 원칙에 의존합니다.

이 원칙에 따르면, 코루틴은 수명 주기(lifecycle)가 연결된 부모 및 자식 작업의 트리 계층 구조를 형성합니다. 코루틴의 수명 주기는 생성부터 완료, 실패 또는 취소까지의 상태 시퀀스입니다.

부모 코루틴은 자식 코루틴이 완료될 때까지 기다린 후에 종료됩니다. 만약 부모 코루틴이 실패하거나 취소되면, 모든 자식 코루틴도 재귀적으로 취소됩니다. 코루틴을 이런 방식으로 연결해 두면 취소와 오류 처리가 예측 가능하고 안전해집니다.

구조화된 동시성을 유지하기 위해, 새로운 코루틴은 수명 주기를 정의하고 관리하는 [`CoroutineScope`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/) 내에서만 시작될 수 있습니다. `CoroutineScope`는 디스패처와 기타 실행 속성을 정의하는 _코루틴 문맥(coroutine context)_을 포함합니다. 코루틴 내부에서 또 다른 코루틴을 시작하면, 그것은 자동으로 부모 스코프의 자식이 됩니다.

`CoroutineScope`에서 `CoroutineScope.launch()`와 같은 [코루틴 빌더 함수](#coroutine-builder-functions)를 호출하면 해당 스코프와 연결된 코루틴의 자식 코루틴이 시작됩니다. 빌더의 블록 내부에서 [수신 객체(receiver)](lambdas.md#function-literals-with-receiver)는 중첩된 `CoroutineScope`이므로, 거기서 시작하는 모든 코루틴은 그 자식이 됩니다.

### `coroutineScope()` 함수로 코루틴 스코프 만들기

현재 코루틴 문맥을 사용하여 새로운 코루틴 스코프를 만들려면 [`coroutineScope()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/coroutine-scope.html) 함수를 사용합니다. 이 함수는 코루틴 하위 트리의 루트 코루틴을 생성합니다. 이는 블록 내부에서 시작된 코루틴의 직접적인 부모이자, 그들이 시작한 모든 코루틴의 간접적인 부모가 됩니다. `coroutineScope()`는 중단 블록을 실행하고 해당 블록과 그 안에서 시작된 모든 코루틴이 완료될 때까지 기다립니다.

다음은 예제입니다:

```kotlin
// 초 단위로 기간을 표현하기 위해 kotlin.time.Duration 임포트
import kotlin.time.Duration.Companion.seconds

import kotlinx.coroutines.*

// 코루틴 문맥이 디스패처를 지정하지 않으면,
// CoroutineScope.launch()는 Dispatchers.Default를 사용함
//sampleStart
suspend fun main() {
    // 코루틴 하위 트리의 루트
    coroutineScope { // this: CoroutineScope
        this.launch {
            this.launch {
                delay(2.seconds)
                println("Child of the enclosing coroutine completed")
            }
            println("Child coroutine 1 completed")
        }
        this.launch {
            delay(1.seconds)
            println("Child coroutine 2 completed")
        }
    }
    // coroutineScope 내부의 모든 자식이 완료된 후에만 실행됨
    println("Coroutine scope completed")
}
//sampleEnd
```
{kotlin-runnable="true"}

이 예제에서는 [디스패처](#coroutine-dispatchers)가 지정되지 않았으므로, `coroutineScope()` 블록 내의 `CoroutineScope.launch()` 빌더 함수들은 현재 문맥을 상속합니다. 해당 문맥에 지정된 디스패처가 없다면, `CoroutineScope.launch()`는 공유 스레드 풀에서 실행되는 `Dispatchers.Default`를 사용합니다.

### 코루틴 스코프에서 코루틴 빌더 추출하기

경우에 따라 [`CoroutineScope.launch()`](#coroutinescope-launch)와 같은 코루틴 빌더 호출을 별도의 함수로 추출하고 싶을 수 있습니다.

다음 예제를 살펴보세요:

```kotlin
suspend fun main() {
    coroutineScope { // this: CoroutineScope
        // CoroutineScope가 수신 객체인 곳에서 CoroutineScope.launch()를 호출함
        this.launch { println("1") }
        this.launch { println("2") }
    } 
}
```

> 명시적인 `this` 표현식 없이 `launch`라고만 쓸 수도 있습니다. 이 예제들에서 명시적인 `this`를 사용하는 것은 이것이 `CoroutineScope`에 대한 확장 함수임을 강조하기 위함입니다.
>
> 코틀린에서 수신 객체가 있는 람다가 어떻게 작동하는지에 대한 자세한 내용은 [수신 객체가 지정된 함수 리터럴](lambdas.md#function-literals-with-receiver)을 참조하세요.
>
{style="tip"}

`coroutineScope()` 함수는 `CoroutineScope` 수신 객체를 가진 람다를 인자로 받습니다. 이 람다 내부에서 암시적 수신 객체는 `CoroutineScope`이므로, `CoroutineScope.launch()` 및 [`CoroutineScope.async()`](#coroutinescope-async)와 같은 빌더 함수들은 해당 수신 객체에 대한 [확장 함수](extensions.md#extension-functions)로 해석됩니다.

코루틴 빌더를 다른 함수로 추출하려면, 그 함수는 `CoroutineScope` 수신 객체를 선언해야 합니다. 그렇지 않으면 컴파일 오류가 발생합니다:

```kotlin
import kotlinx.coroutines.*
//sampleStart
suspend fun main() {
    coroutineScope {
        launchAll()
    }
}

fun CoroutineScope.launchAll() { // this: CoroutineScope
    // CoroutineScope에 대해 .launch()를 호출함
    this.launch { println("1") }
    this.launch { println("2") } 
}
//sampleEnd
/* -- CoroutineScope를 수신 객체로 선언하지 않고 launch를 호출하면 컴파일 오류가 발생함 --

fun launchAll() {
    // 컴파일 오류: this가 정의되지 않음
    this.launch { println("1") }
    this.launch { println("2") }
}
 */
```
{kotlin-runnable="true"}

이 예제에서 `launchAll()` 함수는 `suspend` 키워드가 필요하지 않습니다. 왜냐하면 단순히 현재 `CoroutineScope`에서 코루틴을 시작하고 즉시 반환되기 때문입니다. 반환하기 전에 실행을 일시 중지하고 재개해야 할 필요가 있는 경우에만 함수를 `suspend`로 표시하세요.

## 코루틴 빌더 함수

코루틴 빌더 함수는 실행할 코루틴을 정의하는 `suspend` [람다(lambda)](lambdas.md)를 받는 함수입니다. 다음은 몇 가지 예입니다:

* [`CoroutineScope.launch()`](#coroutinescope-launch)
* [`CoroutineScope.async()`](#coroutinescope-async)
* [`runBlocking()`](#runblocking)
* [`withContext()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-context.html)
* [`coroutineScope()`](#create-a-coroutine-scope-with-the-coroutinescope-function)

코루틴 빌더 함수가 실행되려면 `CoroutineScope`가 필요합니다. 이는 기존 스코프일 수도 있고, `coroutineScope()`, [`runBlocking()`](#runblocking), 또는 [`withContext()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-context.html#)와 같은 도우미 함수로 만든 스코프일 수도 있습니다. 각 빌더는 코루틴이 어떻게 시작되는지, 그리고 그 결과와 어떻게 상호작용하는지를 정의합니다.

### `CoroutineScope.launch()`

[`CoroutineScope.launch()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html#) 코루틴 빌더 함수는 `CoroutineScope`에 대한 확장 함수입니다. 이는 기존의 [코루틴 스코프](#coroutine-scope-and-structured-concurrency) 내에서 나머지 스코프를 블로킹하지 않고 새로운 코루틴을 시작합니다.

결과가 필요하지 않거나 기다리고 싶지 않을 때, 다른 작업과 병행하여 작업을 실행하려면 `CoroutineScope.launch()`를 사용하세요:

```kotlin
// 밀리초 단위로 기간을 표현하기 위해 kotlin.time.Duration 임포트
import kotlin.time.Duration.Companion.milliseconds

import kotlinx.coroutines.*

suspend fun main() {
    withContext(Dispatchers.Default) {
        performBackgroundWork()
    }
}

//sampleStart
suspend fun performBackgroundWork() = coroutineScope { // this: CoroutineScope
    // 스코프를 블로킹하지 않고 실행되는 코루틴을 시작함
    this.launch {
        // 백그라운드 작업을 시뮬레이션하기 위해 중단함
        delay(100.milliseconds)
        println("Sending notification in background")
    }

    // 이전 코루틴이 중단된 동안 메인 코루틴은 계속 진행됨
    println("Scope continues")
}
//sampleEnd
```
{kotlin-runnable="true"}

이 예제를 실행해 보면 `main()` 함수가 `CoroutineScope.launch()`에 의해 블로킹되지 않고, 코루틴이 백그라운드에서 작동하는 동안 다른 코드를 계속 실행하는 것을 볼 수 있습니다.

> `CoroutineScope.launch()` 함수는 [`Job`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/) 핸들을 반환합니다. 이 핸들을 사용하여 시작된 코루틴이 완료될 때까지 기다릴 수 있습니다. 자세한 내용은 [취소와 타임아웃](coroutines-cancellation.md#cancel-coroutines)을 참조하세요.
> 
{style="tip"}

### `CoroutineScope.async()`

[`CoroutineScope.async()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html) 코루틴 빌더 함수는 `CoroutineScope`에 대한 확장 함수입니다. 이는 기존의 [코루틴 스코프](#coroutine-scope-and-structured-concurrency) 내에서 동시성 연산을 시작하고, 최종적인 결과를 나타내는 [`Deferred`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-deferred/) 핸들을 반환합니다. 결과가 준비될 때까지 코드를 중단하려면 `.await()` 함수를 사용하세요:

```kotlin
// 밀리초 단위로 기간을 표현하기 위해 kotlin.time.Duration 임포트
import kotlin.time.Duration.Companion.milliseconds

import kotlinx.coroutines.*

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) { // this: CoroutineScope
    // 첫 번째 페이지 다운로드를 시작함
    val firstPage = this.async {
        delay(50.milliseconds)
        "First page"
    }

    // 두 번째 페이지를 병렬로 다운로드하기 시작함
    val secondPage = this.async {
        delay(100.milliseconds)
        "Second page"
    }

    // 두 결과가 모두 나올 때까지 기다린 후 비교함
    val pagesAreEqual = firstPage.await() == secondPage.await()
    println("Pages are equal: $pagesAreEqual")
}
//sampleEnd
```
{kotlin-runnable="true"}

### `runBlocking()`

[`runBlocking()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/run-blocking.html) 코루틴 빌더 함수는 코루틴 스코프를 생성하고 해당 스코프에서 시작된 코루틴들이 끝날 때까지 현재 [스레드](#comparing-coroutines-and-jvm-threads)를 블로킹합니다.

비중단(non-suspending) 코드에서 중단 코드를 호출해야 하는 다른 방법이 없을 때만 `runBlocking()`을 사용하세요:

```kotlin
import kotlin.time.Duration.Companion.milliseconds
import kotlinx.coroutines.*

// 변경할 수 없는 서드파티 인터페이스
interface Repository {
    fun readItem(): Int
}

object MyRepository : Repository {
    override fun readItem(): Int {
        // 중단 함수로 연결하는 브리지 역할
        return runBlocking {
            myReadItem()
        }
    }
}

suspend fun myReadItem(): Int {
    delay(100.milliseconds)
    return 4
}
```

## 코루틴 디스패처 (Coroutine dispatchers)

[_코루틴 디스패처_](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/#)는 코루틴이 실행에 어떤 스레드나 스레드 풀을 사용할지 제어합니다. 코루틴은 항상 단일 스레드에 묶여 있는 것은 아닙니다. 디스패처에 따라 한 스레드에서 중단되었다가 다른 스레드에서 재개될 수 있습니다. 이를 통해 모든 코루틴에 별도의 스레드를 할당하지 않고도 많은 코루틴을 동시에 실행할 수 있습니다.

> 코루틴이 서로 다른 스레드에서 중단되고 재개될 수 있다 하더라도, 코루틴이 중단되기 전에 작성된 값은 재개될 때 동일한 코루틴 내에서 여전히 사용 가능함이 보장됩니다.
>
{style="tip"}

디스패처는 [코루틴 스코프](#coroutine-scope-and-structured-concurrency)와 함께 작동하여 코루틴이 언제, 어디서 실행될지를 정의합니다. 코루틴 스코프가 코루틴의 수명 주기를 제어한다면, 디스패처는 실행에 사용되는 스레드를 제어합니다.

> 모든 코루틴에 대해 디스패처를 지정할 필요는 없습니다. 기본적으로 코루틴은 부모 스코프로부터 디스패처를 상속받습니다. 다른 컨텍스트에서 코루틴을 실행하고 싶을 때 디스패처를 지정할 수 있습니다.
> 
> 만약 코루틴 문맥에 디스패처가 포함되어 있지 않다면, 코루틴 빌더는 `Dispatchers.Default`를 사용합니다.
>
{style="note"}

`kotlinx.coroutines` 라이브러리에는 다양한 유스케이스를 위한 서로 다른 디스패처가 포함되어 있습니다. 예를 들어, [`Dispatchers.Default`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-default.html)는 메인 스레드와 분리되어 백그라운드에서 작업을 수행하며 공유 스레드 풀에서 코루틴을 실행합니다. 이는 데이터 처리와 같은 CPU 집약적인 작업에 이상적인 선택입니다.

`CoroutineScope.launch()`와 같은 코루틴 빌더에 디스패처를 지정하려면 인자로 전달하세요:

```kotlin
suspend fun runWithDispatcher() = coroutineScope { // this: CoroutineScope
    this.launch(Dispatchers.Default) {
        println("Running on ${Thread.currentThread().name}")
    }
}
```

또는 `withContext()` 블록을 사용하여 그 안의 모든 코드를 지정된 디스패처에서 실행할 수 있습니다:

```kotlin
// 밀리초 단위로 기간을 표현하기 위해 kotlin.time.Duration 임포트
import kotlin.time.Duration.Companion.milliseconds

import kotlinx.coroutines.*

//sampleStart
suspend fun main() = withContext(Dispatchers.Default) { // this: CoroutineScope
    println("Running withContext block on ${Thread.currentThread().name}")

    val one = this.async {
        println("First calculation starting on ${Thread.currentThread().name}")
        val sum = (1L..500_000L).sum()
        delay(200L)
        println("First calculation done on ${Thread.currentThread().name}")
        sum
    }

    val two = this.async {
        println("Second calculation starting on ${Thread.currentThread().name}")
        val sum = (500_001L..1_000_000L).sum()
        println("Second calculation done on ${Thread.currentThread().name}")
        sum
    }

    // 두 계산을 모두 기다린 후 결과를 출력함
    println("Combined total: ${one.await() + two.await()}")
}
//sampleEnd
```
{kotlin-runnable="true"}

[`Dispatchers.IO`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-i-o.html) 및 [`Dispatchers.Main`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-main.html)과 같은 다른 디스패처를 포함하여 코루틴 디스패처와 그 용도에 대해 자세히 알아보려면 [코루틴 문맥과 디스패처](coroutine-context-and-dispatchers.md)를 참조하세요.

## 코루틴과 JVM 스레드 비교

코루틴은 JVM의 스레드처럼 코드를 동시적으로 실행하는 중단 가능한 연산이지만, 내부적으로는 다르게 작동합니다.

_스레드_는 운영 체제에 의해 관리됩니다. 스레드는 여러 CPU 코어에서 병렬로 작업을 실행할 수 있으며 JVM에서 동시성에 대한 표준적인 접근 방식을 나타냅니다. 스레드를 생성할 때 운영 체제는 해당 스택을 위해 메모리를 할당하고 커널을 사용하여 스레드 간 전환을 수행합니다. 이로 인해 스레드는 강력하지만 리소스를 많이 소모합니다. 각 스레드는 일반적으로 수 메가바이트의 메모리가 필요하며, 보통 JVM은 한 번에 수천 개의 스레드만 처리할 수 있습니다.

반면에 코루틴은 특정 스레드에 바인딩되지 않습니다. 코루틴은 한 스레드에서 중단되고 다른 스레드에서 재개될 수 있으므로, 많은 코루틴이 동일한 스레드 풀을 공유할 수 있습니다. 코루틴이 중단될 때 스레드는 블로킹되지 않으며 다른 작업을 실행할 수 있는 자유로운 상태로 유지됩니다. 이로 인해 코루틴은 스레드보다 훨씬 가벼우며, 시스템 리소스를 고갈시키지 않고도 한 프로세스에서 수백만 개의 코루틴을 실행할 수 있게 해줍니다.

![코루틴과 스레드 비교](coroutines-and-threads.svg){width="700"}

50,000개의 코루틴이 각각 5초를 기다린 후 마침표(`.`)를 출력하는 예제를 살펴보겠습니다:

```kotlin
import kotlin.time.Duration.Companion.seconds
import kotlinx.coroutines.*

suspend fun main() {
    withContext(Dispatchers.Default) {
        // 각각 5초를 기다린 후 마침표를 출력하는 50,000개의 코루틴 실행
        printPeriods()
    }
}

//sampleStart
suspend fun printPeriods() = coroutineScope { // this: CoroutineScope
    // 각각 5초를 기다린 후 마침표를 출력하는 50,000개의 코루틴 실행
    repeat(50_000) {
        this.launch {
            delay(5.seconds)
            print(".")
        }
    }
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

이제 JVM 스레드를 사용한 동일한 예제를 살펴보겠습니다:

```kotlin
import kotlin.concurrent.thread

fun main() {
    repeat(50_000) {
        thread {
            Thread.sleep(5000L)
            print(".")
        }
    }
}
```
{kotlin-runnable="true" validate="false"}

이 버전은 각 스레드가 고유한 메모리 스택을 필요로 하기 때문에 훨씬 더 많은 메모리를 사용합니다. 50,000개의 스레드의 경우 최대 100GB가 필요할 수 있는 반면, 동일한 수의 코루틴의 경우 약 500MB에 불과합니다.

사용 중인 운영 체제, JDK 버전 및 설정에 따라 JVM 스레드 버전은 메모리 부족(out-of-memory) 오류를 발생시키거나 너무 많은 스레드가 한 번에 실행되는 것을 방지하기 위해 스레드 생성을 늦출 수 있습니다.

## 다음 단계

* [중단 함수 구성하기](composing-suspending-functions.md)에서 중단 함수를 결합하는 방법에 대해 더 알아보세요.
* [취소와 타임아웃](coroutines-cancellation.md)에서 코루틴을 취소하고 타임아웃을 처리하는 방법을 배우세요.
* [코루틴 문맥과 디스패처](coroutine-context-and-dispatchers.md)에서 코루틴 실행과 스레드 관리에 대해 더 깊이 알아보세요.
* [비동기 플로우](coroutines-flow.md)에서 비동기적으로 계산된 여러 값을 반환하는 방법을 배우세요.