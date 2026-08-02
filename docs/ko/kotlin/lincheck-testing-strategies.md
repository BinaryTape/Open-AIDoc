[//]: # (title: 테스트 전략)
[//]: # (description: Lincheck의 모델 검사와 스트레스 테스트의 차이점을 알아봅니다.)

Lincheck은 동시성 데이터 구조를 테스트하기 위해 모델 검사(model checking)와 스트레스 테스트(stress testing)라는 두 가지 전략을 제공합니다.

이 문서에서는 각 전략의 차이점과 테스트 전략을 선택할 때 고려해야 할 사항을 알아봅니다.

## 모델 검사 (Model checking)

모델 검사를 사용하면 Lincheck이 발생 가능한 스레드 인터리빙(interleaving)을 시뮬레이션하고, 잘못된 동작을 유발하는 경우를 보고합니다.

데이터 구조 테스트에 모델 검사를 사용하려면 `ModelCheckingOptions()`를 사용하여 테스트 함수를 선언하세요.

```kotlin
@Test
fun modelCheckingTest() = ModelCheckingOptions()
   .check(this::class)
```

모델 검사 전략을 사용할 때, Lincheck은 공유 메모리 액세스(`read` 및 `write`) 시점이나 락 획득 및 해제, `park`/`unpark`, `wait`/`notify`와 같은 동기화 시점에 명시적인 스레드 전환 명령을 삽입합니다.

스레드 전환을 제어함으로써 Lincheck은 다음과 같은 작업을 수행할 수 있습니다:

* 프로그램의 가능한 다양한 실행 스케줄을 결정론적으로 탐색합니다.
* 상세한 실행 트레이스(trace)를 제공합니다.

현재 모델 검사를 수행하려면 Lincheck이 실행에 대해 [순차적 일관성 메모리 모델(sequentially consistent memory model)](https://en.wikipedia.org/wiki/Sequential_consistency)을 가정해야 합니다. 이는 Lincheck이 완화된 [Java 메모리 모델](https://en.wikipedia.org/wiki/Java_memory_model) 하에서의 명령 재정렬(instruction reordering), 메모리 캐시 동작 및 기타 유사한 효과와 관련된 버그는 시뮬레이션하거나 찾아낼 수 없음을 의미합니다.

<!-- TODO: uncomment after the article is published
> 자세한 내용은 [모델 검사](lincheck-model-checking.md)를 참조하세요.
>
{style=”tip”}
-->

## 스트레스 테스트 (Stress testing)

스트레스 테스트를 사용하면 Lincheck은 오류를 발견할 가능성을 높이기 위해 각 시나리오를 여러 번 실행합니다.

스트레스 테스트를 사용하려면 `StressOptions()`를 사용하여 테스트 함수를 선언하세요.

```kotlin
@Test
fun stressTest() = StressOptions()
   .check(this::class)
```

모델 검사와 달리, Lincheck은 스레드 전환을 제어하거나 추적하지 않습니다. 이로 인해 스트레스 테스트는 더 빠르며 Lincheck이 메모리 모델에 대해 어떠한 가정도 할 필요가 없습니다.
하지만 스트레스 테스트는 테스트 결과를 재현할 수 없으며, Lincheck이 실행 트레이스를 제공할 수 없습니다.

## 전략 선택하기

전략을 선택할 때는 다음 사항을 고려하십시오:

<table style="both">
    <tr>
        <td></td>
        <td><b>모델 검사 (Model checking)</b></td>
        <td><b>스트레스 테스트 (Stress testing)</b></td>
    </tr>
    <tr>
        <td><b>속도</b></td>
        <td>더 느림.</td>
        <td>더 빠름.</td>
    </tr>
    <tr>
        <td><b>재현 가능성</b></td>
        <td>입력 데이터가 변경되지 않았다면 테스트는 정확히 동일한 결과를 반환합니다.</td>
        <td>실행할 때마다 스레드 스케줄이 변경될 수 있으므로 테스트 결과가 달라질 수 있습니다.</td>
    </tr>
    <tr>
        <td><b>가정</b></td>
        <td><list>
            <li>순차적 일관성 메모리 모델을 가정합니다.</li>
            <li>해당 모델 범위를 벗어나는 잘못된 동작으로 인한 버그는 놓칠 수 있습니다.</li>
        </list></td>
        <td><list>
            <li>메모리 모델에 대해 어떠한 가정도 하지 않습니다.</li>
            <li>근본적인 원인과 관계없이 모든 잘못된 동작을 포착할 가능성이 있습니다.</li>
        </list></td>
    </tr>
    <tr>
        <td><b>상세도</b></td>
        <td>동시성 시나리오와 잘못된 동작으로 이어진 실행 트레이스를 모두 보고합니다.</td>
        <td>동시성 시나리오만 보고합니다.</td>
    </tr>
    <tr>
        <td><b>표준 라이브러리 지원 범위</b></td>
        <td><list>
            <li>약한 참조(weak references)와 같은 일부 표준 라이브러리 기능의 동작은 시뮬레이션하지 않습니다.</li>
            <li>이러한 기능으로 인해 발생하는 버그는 놓칠 수 있습니다.</li>
        </list></td>
        <td>어떤 기능을 사용하더라도 그로 인해 발생하는 버그를 포착할 가능성이 있습니다.</td>
    </tr>
</table>

## 다음 단계

시나리오 생성을 커스터마이징하고, 중단된 실행 감지(stalled execution detection)를 활성화하며, 라이브러리에 대한 스레드 안전성 보장을 제공함으로써 [테스트 전략을 구성하는 방법](lincheck-testing-strategies-options.md)을 알아보세요.

## 참고 항목

* [연산 인자 생성](lincheck-argument-generation-constraints.md)
* [연산 실행 옵션 설정](lincheck-operation-execution-options.md)
* [논블로킹 진행 보장 확인](lincheck-progress-guarantees.md)
* [알고리즘의 순차적 명세 정의](lincheck-results-validation.md)