[//]: # (title: 개요)
[//]: # (description: Lincheck은 JVM에서 동시성 코드를 테스트하기 위한 프레임워크입니다. Lincheck은 코드의 잠재적인 스레드 인터리빙을 탐색하여 잘못된 동작으로 이어지는 인터리빙을 찾습니다.)

Lincheck은 JVM에서 동시성 코드를 테스트하기 위한 프레임워크입니다. 테스트를 실행할 때 Lincheck은 프로그램의 잠재적인 스레드 인터리빙(thread interleaving)을 탐색하고 잘못된 동작으로 이어지는 인터리빙을 보고합니다.

> [Kotlin 멀티플랫폼(Kotlin Multiplatform)](https://kotlinlang.org/docs/multiplatform/get-started.html) 프로젝트에서 Lincheck은 JVM에서만 코드를 테스트하는 데 사용할 수 있습니다.
> 
{style="note"}

Lincheck의 동시성 테스트에서는 각 스레드에 대한 연산 목록과 예상되는 어설션(assertion)만 나열하면 됩니다. 나머지는 Lincheck이 처리합니다:

```kotlin
class CounterTest {
    @Test // 테스트 함수 선언
    fun test() = Lincheck.runConcurrentTest {
        var counter = 0

        // 동시에 카운터를 증가시킵니다
        val t1 = thread { counter++ }
        val t2 = thread { counter++ }

        // 스레드가 종료될 때까지 대기합니다
        t1.join()
        t2.join()

        // 두 증가 연산이 모두 적용되었는지 확인합니다
        assertEquals(2, counter)
    }
}
```

테스트가 실패하면 Lincheck은 오류를 유발한 스레드 인터리빙과 스레드 전환 지점을 제공합니다:

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

## Lincheck의 작동 원리

JVM이 동시성 코드를 실행할 때마다 스레드 간의 연산 실행 순서가 변경될 수 있습니다.
예를 들어, 한 연산이 다른 스레드의 연산에 의해 중단될 수 있습니다. 그 자체로는 오류가 아니지만, 코드에 동시성 버그가 있는 경우 오류로 이어질 수 있습니다.

![이 이미지는 프로그램의 실행 시나리오를 실행 스케줄과 비교합니다. 첫 번째 실행 스케줄에서는 연산이 하나씩 차례대로 수행됩니다. 두 번째 실행 스케줄에서는 첫 번째 연산이 두 번째 연산에 의해 중단됩니다.](scenario-vs-schedule.png){ width="700" }

> _실행 시나리오(execution scenario)_는 연산이 스레드에 어떻게 분산되는지와 각 스레드 내에서의 실행 순서를 정의합니다.
> 
> _실행 스케줄(execution schedule)_(또는 _스레드 인터리빙(thread interleaving)_)은 모든 스레드에 걸친 모든 연산의 실행 순서를 정의합니다.
>
{style="tip"}

Lincheck은 잘못된 동작으로 이어지는 실행 스케줄을 찾기 위해 두 가지 테스트 전략을 구현합니다:
* **모델 체킹(Model checking)**. Lincheck은 프로그램에 명시적인 스레드 전환 명령을 삽입하여 스케줄링을 제어합니다. 이러한 명령은 동기화 지점이나 공유 메모리 액세스 지점에 배치됩니다. 모델 체킹을 통해 Lincheck은 오류를 유발하는 정확한 실행 추적(execution trace)을 생성할 수 있습니다.
* **스트레스 테스트(Stress testing)**. 운영체제가 스케줄링을 제어합니다. Lincheck은 오류를 발견할 확률을 높이기 위해 각 시나리오를 여러 번 실행합니다.

## Lincheck 살펴보기

* [Lincheck 시작하기](lincheck-getting-started.md)에서 Lincheck의 기능을 단계별로 알아보세요.
* [테스트 전략](lincheck-how-to-test-data-structures.md) 문서에서 동시성 데이터 구조를 테스트하는 선언적 접근 방식에 대해 알아보세요.

## 추가 참고 자료

* Nikita Koval의 "How we test concurrent algorithms in Kotlin Coroutines": [Video](https://youtu.be/jZqkWfa11Js). KotlinConf 2023
* Maria Sokolova의 "Lincheck: Testing concurrency on the JVM" 워크숍: [Part 1](https://www.youtube.com/watch?v=YNtUK9GK4pA), [Part 2](https://www.youtube.com/watch?v=EW7mkAOErWw). Hydra 2021
* Nikita Koval 외 저, "Lincheck: A Practical Framework for Testing Concurrent Data Structures on JVM": [Paper](https://nikitakoval.org/publications/cav23-lincheck.pdf). 2023