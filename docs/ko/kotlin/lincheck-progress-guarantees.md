[//]: # (title: 진행 보장)
[//]: # (description: Lincheck에서 알고리즘의 방해 자유(obstruction-freedom)를 확인하는 방법을 알아봅니다.)

많은 동시성 알고리즘은 대기 자유(wait-freedom), 잠금 자유(lock-freedom) 또는 방해 자유(obstruction-freedom)와 같은 [논블로킹 진행 보장(non-blocking progress guarantees)](https://en.wikipedia.org/wiki/Non-blocking_algorithm)을 제공합니다.

Lincheck은 방해 자유(obstruction-freedom)에 대한 검증만 지원합니다. 하지만 잠금 자유 및 대기 자유 알고리즘도 방해 자유에 해당하므로, 방해 자유 위반은 더 강력한 보장 조건들에 대한 위반이기도 합니다.

프로그램의 방해 자유 보장을 확인하려면 `checkObstructionFreedom` 옵션을 사용하세요.

```kotlin
@Test
fun modelCheckingTest() = ModelCheckingOptions()
   .checkObstructionFreedom()
   .check(this::class)
```

> `checkObstructionFreedom` 옵션은 [모델 체킹(model checking)](lincheck-testing-strategies.md#model-checking) 전략에서만 사용할 수 있습니다.
>
{style="warning"}

Lincheck은 다른 모든 스레드가 일시 중지되었을 때 스레드가 진행될 수 있는지 확인하여 방해 자유를 검증합니다. 스레드 실행이 [루프에 갇히면](lincheck-testing-strategies-options.md#stalled-execution-detection), Lincheck은 활성 잠금(active lock)을 보고합니다.

특정 함수가 의도적으로 블로킹되는 경우, 오탐을 방지하기 위해 [`@Operation(blocking = true)`](lincheck-operation-execution-options.md#blocking-operations)로 표시할 수 있습니다.

## 예제: `ConcurrentHashMap`의 방해 자유 테스트

이 예제에서는 `ConcurrentHashMap` 구조의 `put()` 함수를 테스트합니다.

1. `ConcurrentHashMapTest.kt` 파일을 생성합니다.
2. `ConcurrentHashMap` 구조에 대한 테스트 클래스를 생성하고 `put()` 함수를 선언합니다.

   ```kotlin
   class ConcurrentHashMapTest {
       private val map = ConcurrentHashMap<Int, Int>()

       @Operation
       fun put(key: Int, value: Int) = map.put(key, value)
   }
   ```

3. `checkObstructionFreedom()` 옵션이 활성화된 테스트 함수를 선언합니다.

    ```kotlin
    @Test
    fun modelCheckingTest() = ModelCheckingOptions()
        .checkObstructionFreedom()
        .threads(2)
        .actorsPerThread(1)
        .check(this::class)
   ```
   
   [`threads`](lincheck-testing-strategies-options.md#scenario-generation) 및 [`actorsPerThread`](lincheck-testing-strategies-options.md#scenario-generation) 옵션은 잠재적인 실행 시나리오의 수를 줄이는 데 사용됩니다. 이 옵션들은 테스트의 통과/실패 상태를 변경하지는 않지만, 테스트 시간을 크게 단축합니다. 

4. 테스트를 실행합니다. 다음과 같은 리포트와 함께 실패해야 합니다.

   ```text
   = The algorithm should be non-blocking, but an active lock is detected =
   | --------------------- |
   | Thread 1  | Thread 2  |
   | --------------------- |
   | put(1, 0) | put(1, 1) |
   | --------------------- |
   
   The following interleaving leads to the error:
   | -------------------------------------------------------------------------------------------------------------- |
   |                                          Thread 1                                          |     Thread 2      |
   | -------------------------------------------------------------------------------------------------------------- |
   | put(1, 0): <hung>                                                                          |                   |
   |   map.put(1, 0)                                                                            |                   |
   |     putVal(1, 0, false)                                                                    |                   |
   |       spread(1): 1                                                                         |                   |
   |       table ➜ null                                                                         |                   |
   |       loop(1 iterations) at ConcurrentHashMap.putVal(ConcurrentHashMap.java:1016)          |                   |
   |         <iteration 1>                                                                      |                   |
   |           initTable()                                                                      |                   |
   |             loop(1 iterations) at ConcurrentHashMap.initTable(ConcurrentHashMap.java:2293) |                   |
   |             table ➜ null                                                                   |                   |
   |             switch                                                                         |                   |
   |                                                                                            | put(1, 1): <hung> |
   | -------------------------------------------------------------------------------------------------------------- |
   ```

5. `put()` 함수 어노테이션에 `blocking = true` 옵션을 추가합니다.

   ```kotlin
   @Operation(blocking = true)
   fun put(key: Int, value: Int) = map.put(key, value)
   ```

6. 테스트를 다시 실행합니다. 성공적으로 통과해야 합니다.

## 예제: `ConcurrentSkipListMap`의 방해 자유 테스트

이 예제에서는 논블로킹 `ConcurrentSkipListMap` 구조의 `put()` 함수를 테스트합니다.

1. `ConcurrentSkipListMapTest.kt` 파일을 생성합니다.
2. `ConcurrentSkipListMap` 구조에 대한 테스트 클래스를 생성하고 `put()` 함수를 선언합니다.

    ```kotlin
    class ConcurrentSkipListMapTest {
        private val map = ConcurrentSkipListMap<Int, Int>()
   
        @Operation
        fun put(key: Int, value: Int) = map.put(key, value)
    }
    ```

3. `checkObstructionFreedom()` 옵션이 활성화된 테스트 함수를 선언합니다.

    ```kotlin
    @Test
    fun modelCheckingTest() = ModelCheckingOptions()
        .checkObstructionFreedom()
        .check(this::class)
    ```

4. 테스트를 실행합니다. 성공적으로 통과해야 합니다.

## 참고 항목

* [인자 생성 제약 조건 설정](lincheck-argument-generation-constraints.md)
* [연산 실행 설정](lincheck-operation-execution-options.md)
* [실행 결과 검증](lincheck-results-validation.md)