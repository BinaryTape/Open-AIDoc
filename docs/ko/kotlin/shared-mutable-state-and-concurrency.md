<!--- TEST_NAME SharedStateGuideTest -->
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 공유 가변 상태와 동시성)

코루틴은 [Dispatchers.Default]와 같은 멀티스레드 디스패처를 사용하여 병렬로 실행될 수 있습니다. 이는 일반적인 병렬 처리의 모든 문제들을 야기합니다. 주요 문제는 **공유 가변 상태(shared mutable state)**에 대한 접근 동기화입니다. 코루틴 세계에서 이 문제에 대한 몇몇 해결책은 멀티스레드 세계의 해결책과 비슷하지만, 다른 것들은 독특합니다.

## 문제 {id="the-problem"}

100개의 코루틴이 동일한 동작을 1,000번씩 수행하도록 해봅시다. 나중에 비교하기 위해 완료 시간도 측정하겠습니다:

```kotlin
suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 실행할 코루틴의 수
    val k = 1000 // 각 코루틴이 동작을 반복하는 횟수
    val time = measureTimeMillis {
        coroutineScope { // 코루틴을 위한 스코프 
            repeat(n) {
                launch {
                    repeat(k) { action() }
                }
            }
        }
    }
    println("Completed ${n * k} actions in $time ms")    
}
```

멀티스레드 [Dispatchers.Default]를 사용하여 공유 가변 변수를 증가시키는 아주 간단한 동작부터 시작합니다.

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*    

suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 실행할 코루틴의 수
    val k = 1000 // 각 코루틴이 동작을 반복하는 횟수
    val time = measureTimeMillis {
        coroutineScope { // 코루틴을 위한 스코프 
            repeat(n) {
                launch {
                    repeat(k) { action() }
                }
            }
        }
    }
    println("Completed ${n * k} actions in $time ms")    
}

//sampleStart
var counter = 0

fun main() = runBlocking {
    withContext(Dispatchers.Default) {
        massiveRun {
            counter++
        }
    }
    println("Counter = $counter")
}
//sampleEnd    
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-sync-01.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-sync-01.kt)에서 확인할 수 있습니다.
>
{style="note"}

<!--- TEST LINES_START
Completed 100000 actions in
Counter =
-->

마지막에 무엇이 출력될까요? "Counter = 100000"이 출력될 가능성은 매우 희박합니다. 왜냐하면 100개의 코루틴이 아무런 동기화 없이 여러 스레드에서 동시에 `counter`를 증가시키기 때문입니다.

## Volatile은 도움이 되지 않습니다 {id="volatiles-are-of-no-help"}

변수를 `volatile`로 만들면 동시성 문제가 해결된다는 흔한 오해가 있습니다. 한번 시도해 봅시다:

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 실행할 코루틴의 수
    val k = 1000 // 각 코루틴이 동작을 반복하는 횟수
    val time = measureTimeMillis {
        coroutineScope { // 코루틴을 위한 스코프 
            repeat(n) {
                launch {
                    repeat(k) { action() }
                }
            }
        }
    }
    println("Completed ${n * k} actions in $time ms")    
}

//sampleStart
@Volatile // 코틀린에서 `volatile`은 어노테이션입니다 
var counter = 0

fun main() = runBlocking {
    withContext(Dispatchers.Default) {
        massiveRun {
            counter++
        }
    }
    println("Counter = $counter")
}
//sampleEnd    
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-sync-02.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-sync-02.kt)에서 확인할 수 있습니다.
>
{style="note"}

<!--- TEST LINES_START
Completed 100000 actions in
Counter =
-->

이 코드는 더 느리게 작동하지만, 여전히 마지막에 항상 "Counter = 100000"을 얻지는 못합니다. `volatile` 변수는 해당 변수에 대한 선형화 가능한(linearizable, "원자적"임을 의미하는 기술 용어) 읽기와 쓰기를 보장하지만, 더 큰 작업(우리의 경우 증가 연산)에 대한 원자성은 제공하지 않기 때문입니다.

## 스레드 안전한 데이터 구조 {id="thread-safe-data-structures"}

스레드와 코루틴 모두에서 작동하는 일반적인 해결책은 공유 상태에 대해 수행해야 하는 관련 연산에 필요한 모든 동기화를 제공하는 스레드 안전한(thread-safe, 즉 동기화된, 선형화 가능한, 또는 원자적인) 데이터 구조를 사용하는 것입니다. 
단순한 카운터의 경우 원자적 연산인 `incrementAndGet`을 가진 `AtomicInteger` 클래스를 사용할 수 있습니다:

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import java.util.concurrent.atomic.*
import kotlin.system.*

suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 실행할 코루틴의 수
    val k = 1000 // 각 코루틴이 동작을 반복하는 횟수
    val time = measureTimeMillis {
        coroutineScope { // 코루틴을 위한 스코프 
            repeat(n) {
                launch {
                    repeat(k) { action() }
                }
            }
        }
    }
    println("Completed ${n * k} actions in $time ms")    
}

//sampleStart
val counter = AtomicInteger()

fun main() = runBlocking {
    withContext(Dispatchers.Default) {
        massiveRun {
            counter.incrementAndGet()
        }
    }
    println("Counter = $counter")
}
//sampleEnd    
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-sync-03.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-sync-03.kt)에서 확인할 수 있습니다.
>
{style="note"}

<!--- TEST ARBITRARY_TIME
Completed 100000 actions in xxx ms
Counter = 100000
-->

이것은 이 특정 문제에 대해 가장 빠른 해결책입니다. 일반적인 카운터, 컬렉션, 큐 및 기타 표준 데이터 구조와 그에 대한 기본 연산에서 잘 작동합니다. 하지만 복잡한 상태나 준비된 스레드 안전 구현이 없는 복잡한 연산으로 확장하기는 쉽지 않습니다.

## 세밀한 스레드 한정 {id="thread-confinement-fine-grained"}

_스레드 한정(Thread confinement)_은 특정 공유 상태에 대한 모든 접근을 단일 스레드로 제한하는 방식입니다. 주로 모든 UI 상태가 단일 이벤트 배포/애플리케이션 스레드로 제한되는 UI 애플리케이션에서 사용됩니다. 코루틴에서는 단일 스레드 컨텍스트를 사용하여 이를 쉽게 적용할 수 있습니다. 

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 실행할 코루틴의 수
    val k = 1000 // 각 코루틴이 동작을 반복하는 횟수
    val time = measureTimeMillis {
        coroutineScope { // 코루틴을 위한 스코프 
            repeat(n) {
                launch {
                    repeat(k) { action() }
                }
            }
        }
    }
    println("Completed ${n * k} actions in $time ms")    
}

//sampleStart
val counterContext = newSingleThreadContext("CounterContext")
var counter = 0

fun main() = runBlocking {
    withContext(Dispatchers.Default) {
        massiveRun {
            // 각 증가 연산을 단일 스레드 컨텍스트로 한정합니다.
            withContext(counterContext) {
                counter++
            }
        }
    }
    println("Counter = $counter")
}
//sampleEnd      
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-sync-04.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-sync-04.kt)에서 확인할 수 있습니다.
>
{style="note"}

<!--- TEST ARBITRARY_TIME
Completed 100000 actions in xxx ms
Counter = 100000
-->

이 코드는 매우 느리게 작동합니다. 왜냐하면 _세밀한(fine-grained)_ 스레드 한정을 수행하기 때문입니다. 개별 증가 연산마다 [withContext(counterContext)][withContext] 블록을 사용하여 멀티스레드 [Dispatchers.Default] 컨텍스트에서 단일 스레드 컨텍스트로 전환합니다.

## 굵은 단위의 스레드 한정 {id="thread-confinement-coarse-grained"}

실무에서 스레드 한정은 큰 단위로 수행됩니다. 예를 들어 상태를 업데이트하는 비즈니스 로직의 큰 조각들이 단일 스레드에 한정됩니다. 다음 예제는 처음부터 각 코루틴을 단일 스레드 컨텍스트에서 실행하여 이와 같이 동작하게 합니다.

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlin.system.*

suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 실행할 코루틴의 수
    val k = 1000 // 각 코루틴이 동작을 반복하는 횟수
    val time = measureTimeMillis {
        coroutineScope { // 코루틴을 위한 스코프 
            repeat(n) {
                launch {
                    repeat(k) { action() }
                }
            }
        }
    }
    println("Completed ${n * k} actions in $time ms")    
}

//sampleStart
val counterContext = newSingleThreadContext("CounterContext")
var counter = 0

fun main() = runBlocking {
    // 모든 것을 단일 스레드 컨텍스트로 한정합니다.
    withContext(counterContext) {
        massiveRun {
            counter++
        }
    }
    println("Counter = $counter")
}
//sampleEnd     
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-sync-05.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-sync-05.kt)에서 확인할 수 있습니다.
>
{style="note"}

<!--- TEST ARBITRARY_TIME
Completed 100000 actions in xxx ms
Counter = 100000
-->

이제 훨씬 더 빠르게 작동하고 올바른 결과를 생성합니다.

## 상호 배제 {id="mutual-exclusion"}

이 문제에 대한 상호 배제(Mutual exclusion) 해결책은 공유 상태의 모든 수정을 절대 동시에 실행되지 않는 **임계 구역(critical section)**으로 보호하는 것입니다. 블로킹 세계에서는 보통 이를 위해 `synchronized`나 `ReentrantLock`을 사용합니다. 코루틴의 대안은 [Mutex]라고 불립니다. 이는 임계 구역을 구분하기 위해 [lock][Mutex.lock]과 [unlock][Mutex.unlock] 함수를 가집니다. 핵심적인 차이점은 `Mutex.lock()`이 일시 중단 함수라는 것입니다. 이는 스레드를 차단(block)하지 않습니다.

`mutex.lock(); try { ... } finally { mutex.unlock() }` 패턴을 편리하게 표현해 주는 [withLock] 확장 함수도 있습니다:

<!--- CLEAR -->

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.sync.*
import kotlin.system.*

suspend fun massiveRun(action: suspend () -> Unit) {
    val n = 100  // 실행할 코루틴의 수
    val k = 1000 // 각 코루틴이 동작을 반복하는 횟수
    val time = measureTimeMillis {
        coroutineScope { // 코루틴을 위한 스코프 
            repeat(n) {
                launch {
                    repeat(k) { action() }
                }
            }
        }
    }
    println("Completed ${n * k} actions in $time ms")    
}

//sampleStart
val mutex = Mutex()
var counter = 0

fun main() = runBlocking {
    withContext(Dispatchers.Default) {
        massiveRun {
            // 각 증가 연산을 잠금(lock)으로 보호합니다.
            mutex.withLock {
                counter++
            }
        }
    }
    println("Counter = $counter")
}
//sampleEnd    
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-sync-06.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-sync-06.kt)에서 확인할 수 있습니다.
>
{style="note"}

<!--- TEST ARBITRARY_TIME
Completed 100000 actions in xxx ms
Counter = 100000
-->

이 예제의 잠금은 세밀하기(fine-grained) 때문에 그만큼의 비용을 치릅니다. 하지만 공유 상태를 주기적으로 수정해야 하지만 이 상태가 한정될 수 있는 자연스러운 스레드가 없는 일부 상황에서는 좋은 선택이 될 수 있습니다.

<!--- MODULE kotlinx-coroutines-core -->
<!--- INDEX kotlinx.coroutines -->

[Dispatchers.Default]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-default.html
[withContext]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-context.html

<!--- INDEX kotlinx.coroutines.sync -->

[Mutex]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.sync/-mutex/index.html
[Mutex.lock]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.sync/-mutex/lock.html
[Mutex.unlock]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.sync/-mutex/unlock.html
[withLock]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.sync/with-lock.html

<!--- END -->