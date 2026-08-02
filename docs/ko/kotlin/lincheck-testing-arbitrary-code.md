[//]: # (title: 임의의 코드 테스트하기)
[//]: # (description: Lincheck의 `runConcurrentTest()` 함수를 사용하여 임의의 동시성 코드를 테스트하는 방법을 알아봅니다.)

Lincheck은 임의의 동시성 코드를 테스트하기 위한 `runConcurrentTest()` 함수를 제공합니다.

`runConcurrentTest()` 함수는 동시성 코드 블록을 여러 번 실행하며 모델 검사(model checking)를 사용하여 잠재적인 실행 스케줄을 탐색합니다.

Lincheck으로 동시성 코드를 테스트하려면 다음 단계를 따르세요:

1. 테스트 클래스를 생성합니다:

   ```kotlin
   class NewConcurrentTest {
       // 테스트
   }
   ```

2. `runConcurrentTest()`를 사용하여 멤버 함수로 테스트 함수를 생성합니다.

   ```kotlin
   @Test
   fun test() = runConcurrentTest(100_000) {
       // 동시성 코드
   }
   ```

> 이 함수의 매개변수는 선택 사항입니다. 이는 탐색할 실행 스케줄의 수를 지정하며, 기본값은 `10_000`입니다.
>
{style="tip"}

3. 테스트를 실행합니다. 테스트가 실패하면 Lincheck은 잘못된 동작으로 이어지는 실행 스케줄이 포함된 보고서를 생성합니다.

  ```text
  | ------------------------------------------------------------------------------- |
  |                   Main Thread                   |   Thread 1    |   Thread 2    |
  | ------------------------------------------------------------------------------- |
  | thread(block = Lambda#2): Thread#1              |               |               |
  | thread(block = Lambda#3): Thread#2              |               |               |
  | switch (reason: waiting for Thread 1 to finish) |               |               |
  |                                                 |               | run()         |
  |                                                 |               |   counter ➜ 0 |
  |                                                 |               |   switch      |
  |                                                 | run()         |               |
  |                                                 |   counter ➜ 0 |               |
  |                                                 |   counter = 1 |               |
  |                                                 |               |   counter = 1 |
  | Thread#1.join()                                 |               |               |
  | Thread#2.join()                                 |               |               |
  | counter.element ➜ 1                             |               |               |
  | assertEquals(2, 1): threw AssertionFailedError  |               |               |
  | ------------------------------------------------------------------------------- |
  ```

## 예제: `ConcurrentHashMap` 함수 테스트

`ConcurrentHashMap` 함수에 대한 다음 테스트를 살펴보겠습니다:

```kotlin
import org.jetbrains.lincheck.*
import java.util.concurrent.*
import kotlin.concurrent.*
import kotlin.test.*

// 이 테스트는 두 스레드가 서로 반대 순서로 중첩된 `computeIfAbsent` 
// 호출을 수행할 때 발생하는 데드락(deadlock)을 보여줍니다.
class ConcurrentHashMapDeadlock {
   @Test
   fun test() = Lincheck.runConcurrentTest {
       val map = ConcurrentHashMap<String, String>()
       // `key1`을 잠근 상태에서 `key2`를 업데이트합니다.
       val thread1 = thread {
           map.computeIfAbsent("key1") {
               map.computeIfAbsent("key2") { "value2" }
               "value1"
           }
       }
       // `key2`를 잠근 상태에서 `key1`을 업데이트합니다.
       val thread2 = thread {
           map.computeIfAbsent("key2") {
               map.computeIfAbsent("key1") { "value1" }
               "value2"
           }
       }
      
       // 양쪽 스레드가 모두 완료될 때까지 기다립니다.
       thread1.join()
       thread2.join()
   }
}
```

Lincheck이 데드락으로 이어지는 실행 스케줄을 발견했기 때문에 테스트가 실패합니다:

1. 스레드 2는 `key2`를 인덱스 1의 버킷에 매핑하고, 이 버킷에 락을 건 다음 `computeIfAbsent("key1")` 실행을 시작합니다. 스레드 2가 `key1`을 매핑하고 `key1`이 있는 버킷을 잠그기 **전**에 실행이 스레드 2에서 스레드 1로 전환됩니다.
2. 스레드 1은 `key1`을 인덱스 0의 버킷에 매핑하고, 이 버킷에 락을 건 다음 `computeIfAbsent("key2")` 실행을 시작합니다. 스레드 1은 `key2`를 인덱스 1의 버킷에 매핑하고 해당 버킷을 잠그려 시도하지만, 이미 스레드 2에 의해 잠겨 있습니다. 실행이 스레드 1에서 스레드 2로 전환됩니다.
3. 스레드 2가 `key1`이 있는 버킷을 잠그려 시도하지만, 이미 스레드 1에 의해 잠겨 있습니다.

두 스레드 모두 잠겨 버렸으므로 실행 중에 데드락이 발생했습니다.

![실패한 테스트에 대한 Lincheck 보고서 스크린샷.](concurrenthashmapdeadlock.png){thumbnail="true" width=700}

## 다음 단계

[Lincheck을 사용하여 데이터 구조를 테스트하는 방법](lincheck-how-to-test-data-structures.md)을 알아보세요.

<!-- TODO: uncomment after the articles are published
## 관련 항목

* [Lincheck의 모델 검사](lincheck-model-checking.md)
* [Kotlin 멀티플랫폼 프로젝트에서의 Lincheck](lincheck-kmp.md)
-->