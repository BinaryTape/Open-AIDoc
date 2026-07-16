<!--- TEST_NAME FlowGuideTest --> 
<contribute-url>https://github.com/Kotlin/kotlinx.coroutines/edit/master/docs/topics/</contribute-url>

[//]: # (title: 비동기 플로우(Asynchronous Flow))

일시 중단 함수(suspending function)는 비동기적으로 단일 값을 반환하지만, 비동기적으로 계산된 여러 값을 반환하려면 어떻게 해야 할까요? 여기서 Kotlin 플로우(Flow)가 등장합니다.

## 여러 값 나타내기

Kotlin에서 여러 값은 [컬렉션(collections)][collections]을 사용하여 나타낼 수 있습니다. 
예를 들어, 세 개의 숫자가 담긴 [List]를 반환하는 `simple` 함수를 만들고, [forEach]를 사용하여 모든 숫자를 출력할 수 있습니다.

```kotlin
fun simple(): `List<Int>` = listOf(1, 2, 3)
 
fun main() {
    simple().forEach { value -> println(value) } 
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-01.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-01.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드는 다음과 같이 출력합니다:

```text
1
2
3
```

<!--- TEST -->

### 시퀀스(Sequences)

만약 CPU를 많이 사용하는 블로킹 코드(각 계산에 100ms 소요)로 숫자를 계산한다면, [시퀀스(Sequence)][Sequence]를 사용하여 숫자를 나타낼 수 있습니다.

```kotlin
fun simple(): Sequence<Int> = sequence { // 시퀀스 빌더
    for (i in 1..3) {
        Thread.sleep(100) // 계산 중인 것처럼 가정
        yield(i) // 다음 값 생성
    }
}

fun main() {
    simple().forEach { value -> println(value) } 
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-02.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-02.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드는 동일한 숫자를 출력하지만, 각 숫자를 출력하기 전에 100ms를 대기합니다.

<!--- TEST 
1
2
3
-->

### 일시 중단 함수(Suspending functions)

하지만 이 계산은 코드를 실행하는 메인 스레드를 차단(block)합니다. 
이러한 값들이 비동기 코드에 의해 계산될 때는 `simple` 함수에 `suspend` 수식어를 붙여, 
스레드를 차단하지 않고 작업을 수행한 후 결과를 리스트로 반환할 수 있습니다.

```kotlin
import kotlinx.coroutines.*                 
                           
//sampleStart
suspend fun simple(): `List<Int>` {
    delay(1000) // 여기서 비동기적인 작업을 수행한다고 가정
    return listOf(1, 2, 3)
}

fun main() = runBlocking<Unit> {
    simple().forEach { value -> println(value) } 
}
//sampleEnd
```  
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-03.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-03.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드는 1초를 기다린 후 숫자를 출력합니다.

<!--- TEST 
1
2
3
-->

### 플로우(Flows)

`List<Int>` 결과 타입을 사용한다는 것은 모든 값을 한 번에 반환해야 함을 의미합니다. 
비동기적으로 계산되는 값의 스트림(stream)을 나타내기 위해, 동기적으로 계산된 값에 `Sequence<Int>` 타입을 사용하는 것처럼 [`Flow<Int>`][Flow] 타입을 사용할 수 있습니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart               
fun simple(): Flow<Int> = flow { // 플로우 빌더
    for (i in 1..3) {
        delay(100) // 여기서 유용한 작업을 한다고 가정
        emit(i) // 다음 값 방출
    }
}

fun main() = runBlocking<Unit> {
    // 메인 스레드가 차단되었는지 확인하기 위해 동시에 실행되는 코루틴 시작
    launch {
        for (k in 1..3) {
            println("I'm not blocked $k")
            delay(100)
        }
    }
    // 플로우 수집
    simple().collect { value -> println(value) } 
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-04.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-04.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드는 메인 스레드를 차단하지 않고 각 숫자를 출력하기 전에 100ms를 기다립니다. 
이는 메인 스레드에서 실행 중인 별도의 코루틴이 100ms마다 "I'm not blocked"를 출력함으로써 확인됩니다.

```text
I'm not blocked 1
1
I'm not blocked 2
2
I'm not blocked 3
3
```

<!--- TEST -->

이전 예제들과 비교하여 [Flow]를 사용한 코드의 차이점은 다음과 같습니다.

* [Flow] 타입의 빌더 함수는 [flow][_flow]입니다.
* `flow { ... }` 빌더 블록 내부의 코드는 일시 중단(suspend)될 수 있습니다.
* `simple` 함수는 더 이상 `suspend` 수식어를 가질 필요가 없습니다.
* 값은 [emit][FlowCollector.emit] 함수를 사용하여 플로우에서 *방출(emitted)*됩니다.
* 값은 [collect][collect] 함수를 사용하여 플로우에서 *수집(collected)*됩니다.

> `simple`의 `flow { ... }` 본문에서 [delay]를 `Thread.sleep`으로 바꾸면 이 경우 메인 스레드가 차단되는 것을 확인할 수 있습니다.
>
{style="note"}

## 플로우는 콜드(Cold) 스트림입니다

플로우는 시퀀스와 유사하게 *콜드(cold)* 스트림입니다. [flow][_flow] 빌더 내부의 코드는 플로우가 수집(collect)되기 전까지는 실행되지 않습니다. 다음 예제에서 이를 명확히 확인할 수 있습니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart      
fun simple(): Flow<Int> = flow { 
    println("Flow started")
    for (i in 1..3) {
        delay(100)
        emit(i)
    }
}

fun main() = runBlocking<Unit> {
    println("Calling simple function...")
    val flow = simple()
    println("Calling collect...")
    flow.collect { value -> println(value) } 
    println("Calling collect again...")
    flow.collect { value -> println(value) } 
}
//sampleEnd
```  
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-05.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-05.kt)에서 확인할 수 있습니다.
>
{style="note"}

출력 결과는 다음과 같습니다.

```text
Calling simple function...
Calling collect...
Flow started
1
2
3
Calling collect again...
Flow started
1
2
3
```

<!--- TEST -->
 
이것이 플로우를 반환하는 `simple` 함수가 `suspend` 수식어로 표시되지 않는 핵심적인 이유입니다.
`simple()` 호출 그 자체는 빠르게 반환되며 아무것도 기다리지 않습니다. 플로우는 수집될 때마다 새로 시작되며, 이것이 우리가 `collect`를 다시 호출할 때마다 "Flow started"를 보게 되는 이유입니다.

## 플로우 취소 기본 사항

플로우는 코루틴의 일반적인 협력적 취소(cooperative cancellation) 메커니즘을 따릅니다. 평소와 같이, 플로우 수집은 플로우가 취소 가능한 일시 중단 함수(예: [delay])에서 일시 중단되었을 때 취소될 수 있습니다.
다음 예제는 [withTimeoutOrNull] 블록에서 실행될 때 타임아웃이 발생하면 플로우가 어떻게 취소되고 코드 실행이 중단되는지 보여줍니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart           
fun simple(): Flow<Int> = flow { 
    for (i in 1..3) {
        delay(100)          
        println("Emitting $i")
        emit(i)
    }
}

fun main() = runBlocking<Unit> {
    withTimeoutOrNull(250) { // 250ms 후 타임아웃
        simple().collect { value -> println(value) } 
    }
    println("Done")
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-06.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-06.kt)에서 확인할 수 있습니다.
>
{style="note"}

`simple` 함수의 플로우에서 두 개의 숫자만 방출되는 방식과 그에 따른 출력 결과에 주목하세요.

```text
Emitting 1
1
Emitting 2
2
Done
```

<!--- TEST -->

더 자세한 내용은 [플로우 취소 검사](#flow-cancellation-checks) 섹션을 참조하세요.

## 플로우 빌더

이전 예제의 `flow { ... }` 빌더는 가장 기본적인 빌더입니다. 플로우를 선언할 수 있는 다른 빌더들도 있습니다.

* [flowOf] 빌더는 고정된 값 세트를 방출하는 플로우를 정의합니다.
* 다양한 컬렉션과 시퀀스는 `.asFlow()` 확장 함수를 사용하여 플로우로 변환할 수 있습니다.

예를 들어, 플로우에서 1부터 3까지의 숫자를 출력하는 코드는 다음과 같이 작성할 수 있습니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> {
//sampleStart
    // 정수 범위를 플로우로 변환
    (1..3).asFlow().collect { value -> println(value) }
//sampleEnd 
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-07.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-07.kt)에서 확인할 수 있습니다.
>
{style="note"}

<!--- TEST
1
2
3
-->

## 중간 플로우 연산자

컬렉션이나 시퀀스를 변환하는 것과 같은 방식으로 연산자를 사용하여 플로우를 변환할 수 있습니다. 
중간 연산자(Intermediate operators)는 업스트림(upstream) 플로우에 적용되어 다운스트림(downstream) 플로우를 반환합니다. 
이러한 연산자들은 플로우와 마찬가지로 콜드(cold) 연산자입니다. 이러한 연산자 호출 자체는 일시 중단 함수가 아닙니다. 
빠르게 작동하여 새로운 변환된 플로우의 정의를 반환합니다.

기본 연산자들은 [map]과 [filter]처럼 친숙한 이름을 가지고 있습니다. 
시퀀스와의 중요한 차이점은 이러한 연산자 내부의 코드 블록에서 일시 중단 함수를 호출할 수 있다는 점입니다.

예를 들어, 들어오는 요청의 플로우를 [map] 연산자를 사용하여 그 결과로 매핑할 수 있으며, 
이때 요청을 수행하는 작업이 일시 중단 함수로 구현된 오래 걸리는 비동기 작업이더라도 가능합니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart           
suspend fun performRequest(request: Int): String {
    delay(1000) // 오래 걸리는 비동기 작업을 흉내냄
    return "response $request"
}

fun main() = runBlocking<Unit> {
    (1..3).asFlow() // 요청 플로우
        .map { request -> performRequest(request) }
        .collect { response -> println(response) }
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-08.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-08.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드는 다음과 같이 세 줄을 출력하며, 각 줄은 이전 줄이 나타난 지 1초 후에 나타납니다.

```text                                                                    
response 1
response 2
response 3
```

<!--- TEST -->

### transform 연산자

플로우 변환 연산자 중 가장 일반적인 것은 [transform]이라고 불립니다. 
이것은 [map]이나 [filter]와 같은 간단한 변환을 흉내 낼 수도 있고, 더 복잡한 변환을 구현할 수도 있습니다. 
`transform` 연산자를 사용하면 임의의 값을 임의의 횟수만큼 [emit][FlowCollector.emit] 할 수 있습니다.

예를 들어, `transform`을 사용하여 오래 걸리는 비동기 요청을 수행하기 전에 문자열을 방출하고, 그 뒤에 응답을 방출할 수 있습니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

suspend fun performRequest(request: Int): String {
    delay(1000) // 오래 걸리는 비동기 작업을 흉내냄
    return "response $request"
}

fun main() = runBlocking<Unit> {
//sampleStart
    (1..3).asFlow() // 요청 플로우
        .transform { request ->
            emit("Making request $request") 
            emit(performRequest(request)) 
        }
        .collect { response -> println(response) }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-09.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-09.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드의 출력은 다음과 같습니다.

```text
Making request 1
response 1
Making request 2
response 2
Making request 3
response 3
```

<!--- TEST -->

### 크기 제한 연산자

[take]와 같은 크기 제한 중간 연산자는 해당 제한에 도달하면 플로우의 실행을 취소합니다. 
코루틴의 취소는 항상 예외를 던짐으로써 수행되므로, 취소 시 모든 자원 관리 함수(예: `try { ... } finally { ... }` 블록)가 정상적으로 작동합니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
fun numbers(): Flow<Int> = flow {
    try {                          
        emit(1)
        emit(2) 
        println("This line will not execute")
        emit(3)    
    } finally {
        println("Finally in numbers")
    }
}

fun main() = runBlocking<Unit> {
    numbers() 
        .take(2) // 처음 두 개만 가져옴
        .collect { value -> println(value) }
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-10.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-10.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드의 출력은 `numbers()` 함수의 `flow { ... }` 본문 실행이 두 번째 숫자를 방출한 후에 중단되었음을 명확히 보여줍니다.

```text       
1
2
Finally in numbers
```

<!--- TEST -->

## 터미널 플로우 연산자

플로우의 터미널 연산자(Terminal operators)는 플로우 수집을 시작하는 *일시 중단 함수*입니다.
[collect] 연산자가 가장 기본적인 것이지만, 작업을 더 쉽게 만들어주는 다른 터미널 연산자들도 있습니다.

* [toList] 및 [toSet]과 같은 다양한 컬렉션으로의 변환.
* [first] 값을 가져오거나 플로우가 [single] 값만 방출하는지 확인하는 연산자.
* [reduce] 및 [fold]를 사용하여 플로우를 단일 값으로 축소.

예를 들어:

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> {
//sampleStart         
    val sum = (1..5).asFlow()
        .map { it * it } // 1부터 5까지 숫자의 제곱                           
        .reduce { a, b -> a + b } // 합산 (터미널 연산자)
    println(sum)
//sampleEnd     
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-11.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-11.kt)에서 확인할 수 있습니다.
>
{style="note"}

단일 숫자를 출력합니다.

```text
55
```

<!--- TEST -->

## 플로우는 순차적입니다

플로우의 각 개별 수집은 여러 플로우에서 작동하는 특수 연산자가 사용되지 않는 한 순차적으로 수행됩니다. 
수집은 터미널 연산자를 호출하는 코루틴에서 직접 수행됩니다. 기본적으로 새로운 코루틴은 생성되지 않습니다. 
방출된 각 값은 업스트림에서 다운스트림으로 모든 중간 연산자에 의해 처리된 후 터미널 연산자에 전달됩니다.

짝수를 걸러내고 이를 문자열로 매핑하는 다음 예제를 확인해 보세요.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> {
//sampleStart         
    (1..5).asFlow()
        .filter {
            println("Filter $it")
            it % 2 == 0              
        }              
        .map { 
            println("Map $it")
            "string $it"
        }.collect { 
            println("Collect $it")
        }    
//sampleEnd                  
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-12.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-12.kt)에서 확인할 수 있습니다.
>
{style="note"}

출력 결과:

```text
Filter 1
Filter 2
Map 2
Collect string 2
Filter 3
Filter 4
Map 4
Collect string 4
Filter 5
```

<!--- TEST -->

## 플로우 컨텍스트(Flow context)

플로우의 수집은 항상 호출하는 코루틴의 컨텍스트에서 발생합니다. 예를 들어, `simple` 플로우가 있다면 
다음 코드는 `simple` 플로우의 구현 세부 사항과 관계없이 이 코드의 작성자가 지정한 컨텍스트에서 실행됩니다.

```kotlin
withContext(context) {
    simple().collect { value ->
        println(value) // 지정된 컨텍스트에서 실행됨
    }
}
```

<!--- CLEAR -->

플로우의 이러한 속성을 *컨텍스트 보존(context preservation)*이라고 합니다.

따라서 기본적으로 `flow { ... }` 빌더의 코드는 해당 플로우의 수집기(collector)가 제공하는 컨텍스트에서 실행됩니다. 
예를 들어, 호출된 스레드를 출력하고 세 개의 숫자를 방출하는 `simple` 함수의 구현을 고려해 보겠습니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun log(msg: String) = println("[${Thread.currentThread().name}] $msg")
           
//sampleStart
fun simple(): Flow<Int> = flow {
    log("Started simple flow")
    for (i in 1..3) {
        emit(i)
    }
}  

fun main() = runBlocking<Unit> {
    simple().collect { value -> log("Collected $value") } 
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-13.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-13.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드를 실행하면 다음과 같이 출력됩니다.

```text  
[main @coroutine#1] Started simple flow
[main @coroutine#1] Collected 1
[main @coroutine#1] Collected 2
[main @coroutine#1] Collected 3
```

<!--- TEST FLEXIBLE_THREAD -->

`simple().collect`가 메인 스레드에서 호출되었으므로 `simple` 플로우의 본문도 메인 스레드에서 호출됩니다. 
이것은 실행 컨텍스트에 신경 쓰지 않고 호출자를 차단하지 않는 빠른 실행 코드나 비동기 코드에 있어 완벽한 기본값입니다.

### withContext 사용 시 흔한 함정

그러나 오래 걸리는 CPU 집약적 코드는 [Dispatchers.Default] 컨텍스트에서 실행해야 할 수도 있고, 
UI 업데이트 코드는 [Dispatchers.Main] 컨텍스트에서 실행해야 할 수도 있습니다. 
보통 Kotlin 코루틴을 사용하는 코드에서는 컨텍스트를 바꾸기 위해 [withContext]를 사용하지만, 
`flow { ... }` 빌더의 코드는 컨텍스트 보존 속성을 지켜야 하며 다른 컨텍스트에서 [emit][FlowCollector.emit] 하는 것이 허용되지 않습니다.

다음 코드를 실행해 보세요.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
                      
//sampleStart
fun simple(): Flow<Int> = flow {
    // 플로우 빌더에서 CPU 집약적 코드의 컨텍스트를 바꾸는 잘못된 방법
    kotlinx.coroutines.withContext(Dispatchers.Default) {
        for (i in 1..3) {
            Thread.sleep(100) // CPU를 많이 사용하는 방식으로 계산한다고 가정
            emit(i) // 다음 값 방출
        }
    }
}

fun main() = runBlocking<Unit> {
    simple().collect { value -> println(value) } 
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-14.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-14.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드는 다음과 같은 예외를 발생시킵니다.

```text
Exception in thread "main" java.lang.IllegalStateException: Flow invariant is violated:
		Flow was collected in [CoroutineId(1), "coroutine#1":BlockingCoroutine{Active}@5511c7f8, BlockingEventLoop@2eac3323],
		but emission happened in [CoroutineId(1), "coroutine#1":DispatchedCoroutine{Active}@2dae0000, Dispatchers.Default].
		Please refer to 'flow' documentation or use 'flowOn' instead
	at ...
``` 

<!--- TEST EXCEPTION -->

### flowOn 연산자
   
위 예외는 플로우 방출의 컨텍스트를 변경하기 위해 사용해야 하는 [flowOn] 함수를 가리킵니다. 
플로우의 컨텍스트를 변경하는 올바른 방법은 아래 예제에 나와 있으며, 작동 방식을 보여주기 위해 해당 스레드의 이름도 함께 출력합니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun log(msg: String) = println("[${Thread.currentThread().name}] $msg")
           
//sampleStart
fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        Thread.sleep(100) // CPU를 많이 사용하는 방식으로 계산한다고 가정
        log("Emitting $i")
        emit(i) // 다음 값 방출
    }
}.flowOn(Dispatchers.Default) // 플로우 빌더에서 CPU 집약적 코드의 컨텍스트를 바꾸는 올바른 방법

fun main() = runBlocking<Unit> {
    simple().collect { value ->
        log("Collected $value") 
    } 
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-15.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-15.kt)에서 확인할 수 있습니다.
>
{style="note"}
  
`flow { ... }`가 백그라운드 스레드에서 작동하는 반면, 수집은 메인 스레드에서 발생하는 방식에 주목하세요.

```text
[DefaultDispatcher-worker-1 @coroutine#2] Emitting 1
[main @coroutine#1] Collected 1
[DefaultDispatcher-worker-1 @coroutine#2] Emitting 2
[main @coroutine#1] Collected 2
[DefaultDispatcher-worker-1 @coroutine#2] Emitting 3
[main @coroutine#1] Collected 3
```

<!--- TEST FLEXIBLE_THREAD -->

여기서 관찰할 수 있는 또 다른 점은 [flowOn] 연산자가 플로우의 기본 순차적 특성을 변경했다는 것입니다. 
이제 수집은 하나의 코루틴("coroutine#1")에서 발생하고 방출은 수집 코루틴과 동시에 다른 스레드에서 실행 중인 다른 코루틴("coroutine#2")에서 발생합니다. [flowOn] 연산자는 컨텍스트에서 [CoroutineDispatcher]를 변경해야 할 때 업스트림 플로우를 위해 다른 코루틴을 생성합니다.

## 버퍼링(Buffering)

플로우의 서로 다른 부분을 서로 다른 코루틴에서 실행하는 것은 특히 오래 걸리는 비동기 작업이 포함된 경우, 플로우를 수집하는 데 걸리는 전체 시간 관점에서 도움이 될 수 있습니다. 예를 들어, `simple` 플로우의 방출이 느려서 요소를 생성하는 데 100ms가 걸리고, 수집기도 느려서 요소를 처리하는 데 300ms가 걸리는 경우를 생각해 봅시다. 세 개의 숫자가 있는 이러한 플로우를 수집하는 데 얼마나 걸리는지 확인해 보겠습니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.system.*

//sampleStart
fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100) // 100ms 동안 비동기적으로 기다린다고 가정
        emit(i) // 다음 값 방출
    }
}

fun main() = runBlocking<Unit> { 
    val time = measureTimeMillis {
        simple().collect { value -> 
            delay(300) // 300ms 동안 처리한다고 가정
            println(value) 
        } 
    }   
    println("Collected in $time ms")
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-16.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-16.kt)에서 확인할 수 있습니다.
>
{style="note"}

전체 수집에 약 1200ms(숫자 3개, 각각 400ms)가 소요되는 다음과 같은 결과가 생성됩니다.

```text
1
2
3
Collected in 1220 ms
```

<!--- TEST ARBITRARY_TIME -->

플로우에 [buffer] 연산자를 사용하여 순차적으로 실행하는 대신 `simple` 플로우의 방출 코드를 수집 코드와 동시에 실행할 수 있습니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.system.*

fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100) // 100ms 동안 비동기적으로 기다린다고 가정
        emit(i) // 다음 값 방출
    }
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val time = measureTimeMillis {
        simple()
            .buffer() // 방출을 버퍼링하고 기다리지 않음
            .collect { value -> 
                delay(300) // 300ms 동안 처리한다고 가정
                println(value) 
            } 
    }   
    println("Collected in $time ms")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-17.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-17.kt)에서 확인할 수 있습니다.
>
{style="note"}

첫 번째 숫자를 위해 100ms만 기다리면 되고 그 후에는 각 숫자를 처리하는 데 300ms만 소비하면 되므로, 처리 파이프라인을 효과적으로 만들어 동일한 숫자를 더 빠르게 생성합니다. 이 방식으로는 실행에 약 1000ms가 소요됩니다.

```text
1
2
3
Collected in 1071 ms
```                    

<!--- TEST ARBITRARY_TIME -->

> [flowOn] 연산자는 [CoroutineDispatcher]를 변경해야 할 때 동일한 버퍼링 메커니즘을 사용하지만, 여기서는 실행 컨텍스트를 변경하지 않고 명시적으로 버퍼링을 요청했습니다.
>
{style="note"}

### Conflation (합산)

플로우가 작업의 중간 결과나 작업 상태 업데이트를 나타내는 경우, 각 값을 모두 처리할 필요 없이 가장 최근의 값만 처리하면 될 수도 있습니다. 이 경우 수집기가 너무 느려 처리할 수 없을 때 [conflate] 연산자를 사용하여 중간 값을 건너뛸 수 있습니다. 이전 예제를 기반으로 수정해 보겠습니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.system.*

fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100) // 100ms 동안 비동기적으로 기다린다고 가정
        emit(i) // 다음 값 방출
    }
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val time = measureTimeMillis {
        simple()
            .conflate() // 방출을 합산하고, 매번 처리하지 않음
            .collect { value -> 
                delay(300) // 300ms 동안 처리한다고 가정
                println(value) 
            } 
    }   
    println("Collected in $time ms")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-18.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-18.kt)에서 확인할 수 있습니다.
>
{style="note"}

첫 번째 숫자가 여전히 처리되는 동안 두 번째와 세 번째 숫자가 이미 생성되었으므로, 두 번째 숫자는 *합산(conflated)*되고 가장 최근의 숫자(세 번째)만 수집기에 전달된 것을 볼 수 있습니다.

```text
1
3
Collected in 758 ms
```             

<!--- TEST ARBITRARY_TIME -->

### 최신 값 처리

Conflation은 방출기와 수집기가 모두 느릴 때 처리를 가속화하는 한 가지 방법입니다. 이는 방출된 값을 버림으로써 수행됩니다. 다른 방법은 새로운 값이 방출될 때마다 느린 수집기를 취소하고 다시 시작하는 것입니다. `xxx` 연산자와 동일한 필수 로직을 수행하지만 새로운 값이 들어오면 해당 블록의 코드를 취소하는 `xxxLatest` 연산자 패밀리가 있습니다. 이전 예제에서 [conflate]를 [collectLatest]로 변경해 보겠습니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.system.*

fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100) // 100ms 동안 비동기적으로 기다린다고 가정
        emit(i) // 다음 값 방출
    }
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val time = measureTimeMillis {
        simple()
            .collectLatest { value -> // 최신 값에 대해 취소 및 재시작
                println("Collecting $value") 
                delay(300) // 300ms 동안 처리한다고 가정
                println("Done $value") 
            } 
    }   
    println("Collected in $time ms")
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-19.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-19.kt)에서 확인할 수 있습니다.
>
{style="note"}
 
[collectLatest]의 본문은 300ms가 걸리지만 새로운 값은 100ms마다 방출되므로, 블록이 모든 값에 대해 실행되지만 마지막 값에 대해서만 완료되는 것을 볼 수 있습니다.

```text 
Collecting 1
Collecting 2
Collecting 3
Done 3
Collected in 741 ms
``` 

<!--- TEST ARBITRARY_TIME -->

## 여러 플로우 합성하기

여러 플로우를 합성하는 방법은 매우 다양합니다.

### Zip

Kotlin 표준 라이브러리의 [Sequence.zip] 확장 함수와 마찬가지로, 플로우에는 두 플로우의 해당 값들을 결합하는 [zip] 연산자가 있습니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> { 
//sampleStart                                                                           
    val nums = (1..3).asFlow() // 숫자 1..3
    val strs = flowOf("one", "two", "three") // 문자열
    nums.zip(strs) { a, b -> "$a -> $b" } // 단일 문자열로 합성
        .collect { println(it) } // 수집 및 출력
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-20.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-20.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 예제는 다음과 같이 출력합니다.

```text
1 -> one
2 -> two
3 -> three
```
 
<!--- TEST -->

### Combine (결합)

플로우가 변수나 작업의 가장 최근 값을 나타낼 때([conflation(합산)](#conflation) 섹션 참조), 해당 플로우들의 가장 최근 값에 의존하는 계산을 수행하고 업스트림 플로우 중 하나라도 값을 방출할 때마다 이를 재계산해야 할 수도 있습니다. 이에 해당하는 연산자 패밀리를 [combine]이라고 합니다.

예를 들어, 이전 예제에서 숫자는 300ms마다 업데이트되지만 문자열은 400ms마다 업데이트되는 경우, [zip] 연산자를 사용하여 이를 지핑(zipping)하면 결과는 여전히 동일하지만 400ms마다 결과가 출력됩니다.

> 이 예제에서는 각 요소를 지연시키고 샘플 플로우를 방출하는 코드를 더 선언적이고 짧게 만들기 위해 [onEach] 중간 연산자를 사용합니다.
>
{style="note"}

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> { 
//sampleStart                                                                           
    val nums = (1..3).asFlow().onEach { delay(300) } // 300ms마다 숫자 1..3
    val strs = flowOf("one", "two", "three").onEach { delay(400) } // 400ms마다 문자열
    val startTime = System.currentTimeMillis() // 시작 시간 기억
    nums.zip(strs) { a, b -> "$a -> $b" } // "zip"으로 단일 문자열 합성
        .collect { value -> // 수집 및 출력
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-21.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-21.kt)에서 확인할 수 있습니다.
>
{style="note"}

<!--- TEST ARBITRARY_TIME
1 -> one at 437 ms from start
2 -> two at 837 ms from start
3 -> three at 1243 ms from start
-->

하지만 여기서 [zip] 대신 [combine] 연산자를 사용하면 다음과 같습니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking<Unit> { 
//sampleStart                                                                           
    val nums = (1..3).asFlow().onEach { delay(300) } // 300ms마다 숫자 1..3
    val strs = flowOf("one", "two", "three").onEach { delay(400) } // 400ms마다 문자열          
    val startTime = System.currentTimeMillis() // 시작 시간 기억
    nums.combine(strs) { a, b -> "$a -> $b" } // "combine"으로 단일 문자열 합성
        .collect { value -> // 수집 및 출력
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-22.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-22.kt)에서 확인할 수 있습니다.
>
{style="note"}

`nums` 또는 `strs` 플로우 중 하나에서 방출이 발생할 때마다 한 줄이 출력되는 상당히 다른 출력을 얻게 됩니다.

```text 
1 -> one at 452 ms from start
2 -> one at 651 ms from start
2 -> two at 854 ms from start
3 -> two at 952 ms from start
3 -> three at 1256 ms from start
```

<!--- TEST ARBITRARY_TIME -->

## 플로우 플래트닝(Flattening flows)

플로우는 비동기적으로 수신된 값의 시퀀스를 나타내므로, 각 값이 다른 값 시퀀스에 대한 요청을 트리거하는 상황에 처하기 쉽습니다. 예를 들어, 500ms 간격으로 두 개의 문자열 플로우를 반환하는 다음 함수가 있다고 가정해 보겠습니다.

```kotlin
fun requestFlow(i: Int): Flow<String> = flow {
    emit("$i: First") 
    delay(500) // 500ms 대기
    emit("$i: Second")    
}
```

<!--- CLEAR -->

이제 세 개의 정수 플로우가 있고 각 정수에 대해 다음과 같이 `requestFlow`를 호출한다면 어떨까요?

```kotlin
(1..3).asFlow().map { requestFlow(it) }
```

<!--- CLEAR -->

그러면 추가 처리를 위해 단일 플로우로 *플래트닝(flattened)*되어야 하는 플로우의 플로우(`Flow<Flow<String>>`)가 생깁니다. 컬렉션과 시퀀스에는 이를 위한 [flatten][Sequence.flatten]과 [flatMap][Sequence.flatMap] 연산자가 있습니다. 그러나 플로우의 비동기적 특성 때문에 다양한 플래트닝 *모드(modes)*가 요구되며, 이에 따라 플로우에는 플래트닝 연산자 패밀리가 존재합니다.

### flatMapConcat

플로우의 플로우를 이어 붙이는(Concatenation) 기능은 [flatMapConcat]과 [flattenConcat] 연산자에 의해 제공됩니다. 이들은 해당 시퀀스 연산자와 가장 직접적인 유사체입니다. 다음 예제에서 볼 수 있듯이, 이들은 다음 플로우를 수집하기 시작하기 전에 내부 플로우가 완료되기를 기다립니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun requestFlow(i: Int): Flow<String> = flow {
    emit("$i: First") 
    delay(500) // 500ms 대기
    emit("$i: Second")    
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val startTime = System.currentTimeMillis() // 시작 시간 기억
    (1..3).asFlow().onEach { delay(100) } // 100ms마다 숫자 방출
        .flatMapConcat { requestFlow(it) }                                                                           
        .collect { value -> // 수집 및 출력
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-23.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-23.kt)에서 확인할 수 있습니다.
>
{style="note"}

[flatMapConcat]의 순차적 특성이 출력에서 명확하게 나타납니다.

```text                      
1: First at 121 ms from start
1: Second at 622 ms from start
2: First at 727 ms from start
2: Second at 1227 ms from start
3: First at 1328 ms from start
3: Second at 1829 ms from start
```

<!--- TEST ARBITRARY_TIME -->

### flatMapMerge

또 다른 플래트닝 작업은 들어오는 모든 플로우를 동시에 수집하고 그 값들을 단일 플로우로 병합하여 값이 가능한 한 빨리 방출되도록 하는 것입니다. 
이는 [flatMapMerge]와 [flattenMerge] 연산자에 의해 구현됩니다. 이들은 모두 동시에 수집되는 병렬 플로우의 수를 제한하는 선택적 `concurrency` 파라미터를 허용합니다(기본값은 [DEFAULT_CONCURRENCY]와 같습니다).

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun requestFlow(i: Int): Flow<String> = flow {
    emit("$i: First") 
    delay(500) // 500ms 대기
    emit("$i: Second")    
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val startTime = System.currentTimeMillis() // 시작 시간 기억
    (1..3).asFlow().onEach { delay(100) } // 100ms마다 숫자
        .flatMapMerge { requestFlow(it) }                                                                           
        .collect { value -> // 수집 및 출력
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-24.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-24.kt)에서 확인할 수 있습니다.
>
{style="note"}

[flatMapMerge]의 동시성 특성이 명백합니다.

```text                      
1: First at 136 ms from start
2: First at 231 ms from start
3: First at 333 ms from start
1: Second at 639 ms from start
2: Second at 732 ms from start
3: Second at 833 ms from start
```                                               

<!--- TEST ARBITRARY_TIME -->

> [flatMapMerge]는 코드 블록(이 예제에서는 `{ requestFlow(it) }`)을 순차적으로 호출하지만 결과 플로우는 동시에 수집합니다. 이는 먼저 순차적으로 `map { requestFlow(it) }`를 수행한 후 결과에 [flattenMerge]를 호출하는 것과 동일합니다.
>
{style="note"}

### flatMapLatest   

["최신 값 처리"](#processing-the-latest-value) 섹션에서 설명한 [collectLatest] 연산자와 유사하게, 새로운 플로우가 방출되는 즉시 이전 플로우의 수집이 취소되는 "Latest" 플래트닝 모드가 있습니다. 이는 [flatMapLatest] 연산자에 의해 구현됩니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun requestFlow(i: Int): Flow<String> = flow {
    emit("$i: First") 
    delay(500) // 500ms 대기
    emit("$i: Second")    
}

fun main() = runBlocking<Unit> { 
//sampleStart
    val startTime = System.currentTimeMillis() // 시작 시간 기억
    (1..3).asFlow().onEach { delay(100) } // 100ms마다 숫자
        .flatMapLatest { requestFlow(it) }                                                                           
        .collect { value -> // 수집 및 출력
            println("$value at ${System.currentTimeMillis() - startTime} ms from start") 
        } 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-25.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-25.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 예제의 출력은 [flatMapLatest]가 어떻게 작동하는지 잘 보여줍니다.

```text                      
1: First at 142 ms from start
2: First at 322 ms from start
3: First at 425 ms from start
3: Second at 931 ms from start
```                                               

<!--- TEST ARBITRARY_TIME -->
  
> [flatMapLatest]는 새로운 값이 수신될 때 블록 내부의 모든 코드(이 예제에서는 `{ requestFlow(it) }`)를 취소합니다. 
> 이 특정 예제에서는 `requestFlow` 호출 자체가 빠르고 일시 중단되지 않으며 취소될 수 없기 때문에 차이가 없습니다. 그러나 `requestFlow`에서 `delay`와 같은 일시 중단 함수를 사용했다면 출력의 차이가 보였을 것입니다.
>
{style="note"}

## 플로우 예외

방출기(emitter)나 연산자 내부의 코드가 예외를 던지면 플로우 수집이 예외와 함께 종료될 수 있습니다. 이러한 예외를 처리하는 몇 가지 방법이 있습니다.

### 수집기의 try 및 catch

수집기는 Kotlin의 [`try/catch`][exceptions] 블록을 사용하여 예외를 처리할 수 있습니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        println("Emitting $i")
        emit(i) // 다음 값 방출
    }
}

fun main() = runBlocking<Unit> {
    try {
        simple().collect { value ->         
            println(value)
            check(value <= 1) { "Collected $value" }
        }
    } catch (e: Throwable) {
        println("Caught $e")
    } 
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-26.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-26.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 코드는 [collect] 터미널 연산자에서 발생하는 예외를 성공적으로 잡아내며, 보시다시피 그 이후로는 더 이상 값이 방출되지 않습니다.

```text 
Emitting 1
1
Emitting 2
2
Caught java.lang.IllegalStateException: Collected 2
```

<!--- TEST -->

### 모든 것이 잡힙니다

이전 예제는 실제로 방출기나 중간 또는 터미널 연산자에서 발생하는 모든 예외를 잡아냅니다. 
예를 들어, 방출된 값을 문자열로 [매핑][map]하되 해당 코드가 예외를 발생시키도록 코드를 변경해 보겠습니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
fun simple(): Flow<String> = 
    flow {
        for (i in 1..3) {
            println("Emitting $i")
            emit(i) // 다음 값 방출
        }
    }
    .map { value ->
        check(value <= 1) { "Crashed on $value" }                 
        "string $value"
    }

fun main() = runBlocking<Unit> {
    try {
        simple().collect { value -> println(value) }
    } catch (e: Throwable) {
        println("Caught $e")
    } 
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-27.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-27.kt)에서 확인할 수 있습니다.
>
{style="note"}

이 예외 역시 잡히고 수집이 중단됩니다.

```text 
Emitting 1
string 1
Emitting 2
Caught java.lang.IllegalStateException: Crashed on 2
```

<!--- TEST -->

## 예외 투명성

하지만 방출기의 코드가 자신의 예외 처리 동작을 어떻게 캡슐화할 수 있을까요?

플로우는 *예외에 투명(transparent to exceptions)*해야 하며, `flow { ... }` 빌더의 `try/catch` 블록 내부에서 값을 [emit][FlowCollector.emit] 하는 것은 예외 투명성을 위반하는 것입니다. 이는 예외를 던지는 수집기가 이전 예제에서처럼 항상 `try/catch`를 사용하여 예외를 잡을 수 있도록 보장합니다.

방출기는 이러한 예외 투명성을 보존하고 예외 처리의 캡슐화를 허용하는 [catch] 연산자를 사용할 수 있습니다. `catch` 연산자의 본문은 예외를 분석하고 어떤 예외가 잡혔는지에 따라 다르게 반응할 수 있습니다.

* `throw`를 사용하여 예외를 다시 던질 수 있습니다.
* [catch] 본문에서 [emit][FlowCollector.emit]을 사용하여 예외를 값 방출로 바꿀 수 있습니다.
* 예외를 무시하거나, 로그를 남기거나, 다른 코드에서 처리할 수 있습니다.

예를 들어, 예외를 잡았을 때 텍스트를 방출해 보겠습니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun simple(): Flow<String> = 
    flow {
        for (i in 1..3) {
            println("Emitting $i")
            emit(i) // 다음 값 방출
        }
    }
    .map { value ->
        check(value <= 1) { "Crashed on $value" }                 
        "string $value"
    }

fun main() = runBlocking<Unit> {
//sampleStart
    simple()
        .catch { e -> emit("Caught $e") } // 예외 발생 시 방출
        .collect { value -> println(value) }
//sampleEnd
}            
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-28.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-28.kt)에서 확인할 수 있습니다.
>
{style="note"} 
 
코드 주변에 `try/catch`가 더 이상 없음에도 예제의 출력은 동일합니다.

<!--- TEST  
Emitting 1
string 1
Emitting 2
Caught java.lang.IllegalStateException: Crashed on 2
-->

### 투명한 catch

[catch] 중간 연산자는 예외 투명성을 준수하여 업스트림 예외(`catch` 위의 모든 연산자에서 발생한 예외이며, 그 아래의 예외는 아님)만 잡아냅니다. 
만약 `collect { ... }`(`catch` 아래에 위치) 블록에서 예외를 던지면 이는 빠져나갑니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        println("Emitting $i")
        emit(i)
    }
}

fun main() = runBlocking<Unit> {
    simple()
        .catch { e -> println("Caught $e") } // 다운스트림 예외를 잡지 않음
        .collect { value ->
            check(value <= 1) { "Collected $value" }                 
            println(value) 
        }
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-29.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-29.kt)에서 확인할 수 있습니다.
>
{style="note"}
 
`catch` 연산자가 있음에도 불구하고 "Caught ..." 메시지는 출력되지 않습니다.

```text  
Emitting 1
1
Emitting 2
Exception in thread "main" java.lang.IllegalStateException: Collected 2
	at ...
```

<!--- TEST EXCEPTION -->

### 선언적으로 잡기

[collect] 연산자의 본문을 [onEach]로 옮기고 이를 `catch` 연산자 앞에 두면, 모든 예외를 처리하려는 욕구와 [catch] 연산자의 선언적 특성을 결합할 수 있습니다. 이 플로우의 수집은 파라미터가 없는 `collect()` 호출로 트리거되어야 합니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        println("Emitting $i")
        emit(i)
    }
}

fun main() = runBlocking<Unit> {
//sampleStart
    simple()
        .onEach { value ->
            check(value <= 1) { "Collected $value" }                 
            println(value) 
        }
        .catch { e -> println("Caught $e") }
        .collect()
//sampleEnd
}            
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-30.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-30.kt)에서 확인할 수 있습니다.
>
{style="note"} 
 
이제 "Caught ..." 메시지가 출력되는 것을 볼 수 있으며, `try/catch` 블록을 명시적으로 사용하지 않고도 모든 예외를 잡을 수 있습니다.

```text 
Emitting 1
1
Emitting 2
Caught java.lang.IllegalStateException: Collected 2
```

<!--- TEST EXCEPTION -->

## 플로우 완료

플로우 수집이 완료될 때(정상적으로든 예외적으로든) 어떤 동작을 실행해야 할 수도 있습니다. 
이미 눈치채셨겠지만, 이는 명령형 또는 선언형의 두 가지 방식으로 수행할 수 있습니다.

### 명령형 finally 블록

`try`/`catch` 외에도, 수집기는 `collect` 완료 시 동작을 실행하기 위해 `finally` 블록을 사용할 수 있습니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
fun simple(): Flow<Int> = (1..3).asFlow()

fun main() = runBlocking<Unit> {
    try {
        simple().collect { value -> println(value) }
    } finally {
        println("Done")
    }
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-31.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-31.kt)에서 확인할 수 있습니다.
>
{style="note"} 

이 코드는 `simple` 플로우에 의해 생성된 세 개의 숫자와 그 뒤에 이어지는 "Done" 문자열을 출력합니다.

```text
1
2
3
Done
```

<!--- TEST  -->

### 선언적 처리

선언적 접근 방식을 위해, 플로우에는 플로우가 완전히 수집되었을 때 호출되는 [onCompletion] 중간 연산자가 있습니다.

이전 예제는 [onCompletion] 연산자를 사용하여 다시 작성할 수 있으며 동일한 출력을 생성합니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun simple(): Flow<Int> = (1..3).asFlow()

fun main() = runBlocking<Unit> {
//sampleStart
    simple()
        .onCompletion { println("Done") }
        .collect { value -> println(value) }
//sampleEnd
}            
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-32.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-32.kt)에서 확인할 수 있습니다.
>
{style="note"} 

<!--- TEST 
1
2
3
Done
-->

[onCompletion]의 핵심적인 장점은 람다의 nullable `Throwable` 파라미터를 통해 플로우 수집이 정상적으로 완료되었는지 아니면 예외적으로 완료되었는지 판단할 수 있다는 점입니다. 다음 예제에서 `simple` 플로우는 숫자 1을 방출한 후 예외를 던집니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
fun simple(): Flow<Int> = flow {
    emit(1)
    throw RuntimeException()
}

fun main() = runBlocking<Unit> {
    simple()
        .onCompletion { cause -> if (cause != null) println("Flow completed exceptionally") }
        .catch { cause -> println("Caught exception") }
        .collect { value -> println(value) }
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-33.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-33.kt)에서 확인할 수 있습니다.
>
{style="note"}

예상대로 다음과 같이 출력됩니다.

```text
1
Flow completed exceptionally
Caught exception
```

<!--- TEST -->

[onCompletion] 연산자는 [catch]와 달리 예외를 처리하지 않습니다. 위의 예제 코드에서 볼 수 있듯이 예외는 여전히 다운스트림으로 흐릅니다. 이는 이후의 `onCompletion` 연산자들에게 전달되며 `catch` 연산자로 처리될 수 있습니다.

### 성공적인 완료

[catch] 연산자와의 또 다른 차이점은 [onCompletion]이 모든 예외를 보며, 업스트림 플로우가 성공적으로 완료되었을 때(취소나 실패 없이)만 `null` 예외를 받는다는 것입니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
fun simple(): Flow<Int> = (1..3).asFlow()

fun main() = runBlocking<Unit> {
    simple()
        .onCompletion { cause -> println("Flow completed with $cause") }
        .collect { value ->
            check(value <= 1) { "Collected $value" }                 
            println(value) 
        }
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-34.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-34.kt)에서 확인할 수 있습니다.
>
{style="note"}

다운스트림 예외로 인해 플로우가 중단되었기 때문에 완료 원인(cause)이 null이 아님을 알 수 있습니다.

```text 
1
Flow completed with java.lang.IllegalStateException: Collected 2
Exception in thread "main" java.lang.IllegalStateException: Collected 2
```

<!--- TEST EXCEPTION -->

## 명령형 대 선언형

이제 명령형과 선언형 두 가지 방식 모두에서 플로우를 수집하고 완료 및 예외를 처리하는 방법을 알게 되었습니다. 
여기서 자연스러운 질문은 어떤 접근 방식이 선호되며 그 이유는 무엇인가 하는 것입니다. 
라이브러리로서 우리는 특정 방식을 옹호하지 않으며, 두 옵션 모두 유효하고 본인의 선호도와 코드 스타일에 따라 선택해야 한다고 믿습니다.

## 플로우 런칭(Launching flow)

어떤 소스에서 오는 비동기 이벤트를 나타내기 위해 플로우를 사용하는 것은 쉽습니다. 
이 경우, 들어오는 이벤트에 대한 반응과 함께 코드 조각을 등록하고 이후 작업을 계속하는 `addEventListener` 함수와 유사한 기능이 필요합니다. [onEach] 연산자가 이 역할을 할 수 있습니다. 
하지만 `onEach`는 중간 연산자입니다. 플로우를 수집하기 위해서는 터미널 연산자도 필요합니다. 
그렇지 않으면 `onEach` 호출만으로는 아무런 효과가 없습니다.
 
`onEach` 뒤에 [collect] 터미널 연산자를 사용하면, 그 뒤의 코드는 플로우가 수집될 때까지 기다립니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart
// 이벤트 플로우를 흉내냄
fun events(): Flow<Int> = (1..3).asFlow().onEach { delay(100) }

fun main() = runBlocking<Unit> {
    events()
        .onEach { event -> println("Event: $event") }
        .collect() // <--- 플로우 수집이 끝날 때까지 대기
    println("Done")
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-35.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-35.kt)에서 확인할 수 있습니다.
>
{style="note"} 
  
보시다시피 다음과 같이 출력됩니다.

```text 
Event: 1
Event: 2
Event: 3
Done
```    

<!--- TEST -->
 
이때 [launchIn] 터미널 연산자가 유용합니다. `collect`를 `launchIn`으로 바꾸면 
별도의 코루틴에서 플로우 수집을 시작할 수 있으므로, 이후 코드의 실행이 즉시 계속됩니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// 이벤트 플로우를 흉내냄
fun events(): Flow<Int> = (1..3).asFlow().onEach { delay(100) }

//sampleStart
fun main() = runBlocking<Unit> {
    events()
        .onEach { event -> println("Event: $event") }
        .launchIn(this) // <--- 별도의 코루틴에서 플로우 실행
    println("Done")
}            
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-36.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-36.kt)에서 확인할 수 있습니다.
>
{style="note"} 
  
출력 결과:

```text          
Done
Event: 1
Event: 2
Event: 3
```    

<!--- TEST -->

`launchIn`에 필요한 파라미터는 플로우를 수집할 코루틴이 시작될 [CoroutineScope]를 지정해야 합니다. 
위의 예제에서 이 스코프는 [runBlocking] 코루틴 빌더에서 오며, 따라서 플로우가 실행되는 동안 
이 [runBlocking] 스코프는 자식 코루틴의 완료를 기다리고 메인 함수가 반환되어 예제가 종료되는 것을 막습니다.

실제 애플리케이션에서 스코프는 수명이 제한된 엔티티에서 올 것입니다. 해당 엔티티의 수명이 종료되는 즉시 해당 스코프가 취소되어 관련 플로우의 수집도 취소됩니다. 이런 방식으로 `onEach { ... }.launchIn(scope)` 쌍은 `addEventListener`처럼 작동합니다. 
하지만 취소와 구조화된 동시성(structured concurrency)이 그 목적을 달성해주므로, 
그에 대응하는 `removeEventListener` 함수는 필요하지 않습니다.

[launchIn]은 [Job]을 반환하며, 이는 전체 스코프를 취소하지 않고 해당 플로우 수집 코루틴만 [취소][Job.cancel]하거나 [대기(join)][Job.join]하는 데 사용될 수 있습니다.

### 플로우 취소 검사

편의를 위해, [flow][_flow] 빌더는 방출된 각 값에 대해 취소 여부를 확인하는 추가적인 [ensureActive] 검사를 수행합니다. 
이는 `flow { ... }`에서 방출하는 바쁜 루프(busy loop)가 취소 가능함을 의미합니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart           
fun foo(): Flow<Int> = flow { 
    for (i in 1..5) {
        println("Emitting $i") 
        emit(i) 
    }
}

fun main() = runBlocking<Unit> {
    foo().collect { value -> 
        if (value == 3) cancel()  
        println(value)
    } 
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-37.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-37.kt)에서 확인할 수 있습니다.
>
{style="note"}

숫자 3까지만 출력되고, 숫자 4를 방출하려고 시도한 후 [CancellationException]이 발생합니다.

```text 
Emitting 1
1
Emitting 2
2
Emitting 3
3
Emitting 4
Exception in thread "main" kotlinx.coroutines.JobCancellationException: BlockingCoroutine was cancelled; job="coroutine#1":BlockingCoroutine{Cancelled}@6d7b4f4c
```

<!--- TEST EXCEPTION -->

하지만 대부분의 다른 플로우 연산자들은 성능상의 이유로 자체적으로 추가적인 취소 검사를 수행하지 않습니다. 
예를 들어, [IntRange.asFlow] 확장을 사용하여 동일한 바쁜 루프를 작성하고 어디에서도 일시 중단하지 않으면 취소 검사가 이루어지지 않습니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart           
fun main() = runBlocking<Unit> {
    (1..5).asFlow().collect { value -> 
        if (value == 3) cancel()  
        println(value)
    } 
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-38.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-38.kt)에서 확인할 수 있습니다.
>
{style="note"}

1부터 5까지의 모든 숫자가 수집되고, `runBlocking`에서 반환되기 직전에만 취소가 감지됩니다.

```text
1
2
3
4
5
Exception in thread "main" kotlinx.coroutines.JobCancellationException: BlockingCoroutine was cancelled; job="coroutine#1":BlockingCoroutine{Cancelled}@3327bd23
```

<!--- TEST EXCEPTION -->

#### 바쁜 플로우를 취소 가능하게 만들기

코루틴으로 바쁜 루프를 실행하는 경우 취소 여부를 명시적으로 확인해야 합니다. 
`.onEach { currentCoroutineContext().ensureActive() }`를 추가할 수도 있지만, 
이를 위해 제공되는 바로 사용 가능한 [cancellable] 연산자가 있습니다.

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

//sampleStart           
fun main() = runBlocking<Unit> {
    (1..5).asFlow().cancellable().collect { value -> 
        if (value == 3) cancel()  
        println(value)
    } 
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
<!--- KNIT example-flow-39.kt -->
> 전체 코드는 [여기](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-flow-39.kt)에서 확인할 수 있습니다.
>
{style="note"}

`cancellable` 연산자를 사용하면 1부터 3까지의 숫자만 수집됩니다.

```text
1
2
3
Exception in thread "main" kotlinx.coroutines.JobCancellationException: BlockingCoroutine was cancelled; job="coroutine#1":BlockingCoroutine{Cancelled}@5ec0a365
```

<!--- TEST EXCEPTION -->

## 플로우와 리액티브 스트림(Reactive Streams)

[리액티브 스트림(Reactive Streams)](https://www.reactive-streams.org/)이나 RxJava, Project Reactor와 같은 리액티브 프레임워크에 익숙한 분들에게는 플로우의 설계가 매우 친숙해 보일 수 있습니다.

실제로 그 설계는 리액티브 스트림과 그 다양한 구현체들로부터 영감을 받았습니다. 하지만 플로우의 주된 목표는 가능한 한 단순한 설계를 유지하고, Kotlin 및 일시 중단(suspension) 친화적이며 구조화된 동시성을 존중하는 것입니다. 이러한 목표를 달성하는 것은 리액티브의 선구자들과 그들의 엄청난 노력이 없었다면 불가능했을 것입니다. 전체 이야기는 [Reactive Streams and Kotlin Flows](https://medium.com/@elizarov/reactive-streams-and-kotlin-flows-bfd12772cda4) 기사에서 읽어보실 수 있습니다.

비록 다르지만, 개념적으로 플로우는 리액티브 스트림*입니다*. 따라서 플로우를 리액티브(스펙 및 TCK 준수) Publisher로 변환하거나 그 반대로 변환하는 것이 가능합니다. 
이러한 컨버터는 `kotlinx.coroutines`에서 기본적으로 제공하며, 해당 리액티브 모듈(`kotlinx-coroutines-reactive`는 리액티브 스트림용, `kotlinx-coroutines-reactor`는 Project Reactor용, `kotlinx-coroutines-rx2`/`kotlinx-coroutines-rx3`는 RxJava2/RxJava3용)에서 찾을 수 있습니다. 
통합 모듈에는 `Flow`와의 상호 변환, Reactor의 `Context`와의 통합, 그리고 다양한 리액티브 엔티티와 작업하기 위한 일시 중단 친화적인 방법들이 포함되어 있습니다.
 
<!-- stdlib references -->

[collections]: https://kotlinlang.org/docs/reference/collections-overview.html 
[List]: https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/ 
[forEach]: https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/for-each.html
[Sequence]: https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/
[Sequence.zip]: https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/zip.html
[Sequence.flatten]: https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/flatten.html
[Sequence.flatMap]: https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/flat-map.html
[exceptions]: https://kotlinlang.org/docs/reference/exceptions.html

<!--- MODULE kotlinx-coroutines-core -->
<!--- INDEX kotlinx.coroutines -->

[delay]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/delay.html
[withTimeoutOrNull]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-timeout-or-null.html
[Dispatchers.Default]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-default.html
[Dispatchers.Main]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-main.html
[withContext]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-context.html
[CoroutineDispatcher]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-dispatcher/index.html
[CoroutineScope]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/index.html
[runBlocking]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/run-blocking.html
[Job]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/index.html
[Job.cancel]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/cancel.html
[Job.join]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/join.html
[ensureActive]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/ensure-active.html
[CancellationException]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-cancellation-exception/index.html

<!--- INDEX kotlinx.coroutines.flow -->

[Flow]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow/index.html
[_flow]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow.html
[FlowCollector.emit]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow-collector/emit.html
[collect]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/collect.html
[flowOf]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow-of.html
[map]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map.html
[filter]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/filter.html
[transform]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/transform.html
[take]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/take.html
[toList]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/to-list.html
[toSet]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/to-set.html
[first]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/first.html
[single]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/single.html
[reduce]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/reduce.html
[fold]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/fold.html
[flowOn]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow-on.html
[buffer]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/buffer.html
[conflate]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/conflate.html
[collectLatest]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/collect-latest.html
[zip]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/zip.html
[combine]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/combine.html
[onEach]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-each.html
[flatMapConcat]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flat-map-concat.html
[flattenConcat]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flatten-concat.html
[flatMapMerge]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flat-map-merge.html
[flattenMerge]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flatten-merge.html
[DEFAULT_CONCURRENCY]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-d-e-f-a-u-l-t_-c-o-n-c-u-r-r-e-n-c-y.html
[flatMapLatest]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flat-map-latest.html
[catch]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/catch.html
[onCompletion]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-completion.html
[launchIn]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/launch-in.html
[IntRange.asFlow]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/as-flow.html
[cancellable]: https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/cancellable.html

<!--- END -->