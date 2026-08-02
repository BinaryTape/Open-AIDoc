[//]: # (title: 테스트 전략 구성하기)
[//]: # (description: 모델 검사 및 스트레스 테스트를 위해 Lincheck에서 제공하는 다양한 옵션에 대해 알아봅니다.)

Lincheck은 시나리오 생성, 정지된 실행(stalled execution) 감지, 검증 등을 포함하여 테스트 전략을 위한 다양한 구성 옵션을 지원합니다.

## 옵션 활성화 방법

테스트 전략에 옵션을 활성화하려면 전략 클래스에서 해당 옵션을 설정하십시오.

```kotlin
@Test
fun modelCheckingTest() = ModelCheckingOptions()
    .iterations(100) // 생성된 시나리오 수 지정
    .check(this::class)
```

## 시나리오 최소화

기본적으로 Lincheck은 테스트의 동작을 변경하지 않는 연산을 제거하여 실패한 시나리오를 최소화하려고 시도합니다.

실패한 전체 시나리오를 보려면 `minimizeFailedScenario` 옵션을 `false`로 설정하십시오.

<compare first-title="Full" second-title="Minimized">
<code-block lang="text">
| ------------------------- |
|    Thread 1    | Thread 2 |
| --------------------------|
| inc(): 1       |          |
| get(): 1       |          |
| get(): 1       |          |
| --------------------------|
| inc(): 4 [0,1] | inc(): 2 |
| get(): 4 [1,1] | inc(): 4 |
| get(): 4 [2,1] | get(): 4 |
| --------------------------|
| get(): 4       |          |
| get(): 4       |          |
| get(): 4       |          |
| --------------------------|
</code-block>
<code-block lang="text">
| ------------------- |
| Thread 1 | Thread 2 |
| ------------------- |
| inc(): 1 | inc(): 1 |
| ------------------- |
</code-block>
</compare>

## 시나리오 생성

| 옵션 | 기본값 | 설명 |
|---------------------------|---------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| `iterations`              | `100`         | 생성된 동시성 시나리오의 수입니다. |
| `invocationsPerIteration` | `10_000`      | 각 동시성 시나리오에 대한 호출 횟수입니다. |
| `threads`                 | `2`           | 각 시나리오의 스레드 수입니다. |
| `actorsBefore`            | `5`           | 시나리오의 병렬 섹션 이전에 호출되는 연산의 수입니다. |
| `actorsPerThread`         | `5`           | 시나리오의 병렬 섹션에서 각 스레드에 포함된 연산의 수입니다. |
| `actorsAfter`             | `5`           | 시나리오의 병렬 섹션 이후에 호출되는 연산의 수입니다. |
| `customScenarios`         | –             | [사용자 정의 동시성 시나리오](#사용자-정의-시나리오-정의하기) 목록입니다. 사용자 정의 시나리오는 무작위로 생성된 시나리오보다 먼저 실행됩니다. |

### 사용자 정의 시나리오 정의하기

Lincheck은 사용자 정의 시나리오를 정의하기 위해 [도메인 특화 언어(DSL)](https://kotlinlang.org/docs/type-safe-builders.html)를 사용합니다.

```kotlin
@Test
fun test() = StressOptions()
    .customScenarios {
        initial {
            actor(SomeClass1::foo)
        }
        parallel {
            thread {
                actor(SomeClass1::buzz, 1)
                actor(SomeClass1::buzz, 2)
            }
            thread {
                actor(SomeClass1::buzz, 3)
            }
        }
        post {
            actor(SomeClass1::foo)
        }
    }
    .check(this::class)
```

각 시나리오는 세 가지 선택적 섹션으로 구성됩니다.

* `initial` – 병렬 파트 이전에 실행되는 연산들입니다.
* `parallel` – 스레드 정의입니다. 스레드는 `thread` 블록을 사용하여 정의됩니다. 병렬 섹션은 여러 개의 `thread` 블록을 포함할 수 있습니다.
* `post` – 병렬 파트 이후에 실행되는 연산들입니다.

연산은 `actor(function, arg1, arg2, ...)` 함수를 사용하여 정의됩니다. 단일 블록 내의 연산은 순차적으로 실행됩니다.

## 정지된 실행 감지

<table>
<tr><td>옵션</td><td>기본값</td><td>설명</td></tr>
<tr>
    <td><code>timeoutMs</code></td>
    <td><code>3000</code></td>
    <td>Lincheck이 정지된 실행(stalled execution)을 보고하기까지의 호출 타임아웃(밀리초 단위)입니다.</td></tr>
<tr>
    <td><code>loopBound</code></td>
    <td><code>50</code></td>
    <td>Lincheck이 정지된 실행을 보고하기까지의 루프 반복 횟수입니다.<br/>
        Lincheck이 긴 루프에 대해 정지된 실행을 잘못 보고하는 경우 <code>loopBound</code> 값을 늘리십시오.<br/><br/>
        이 옵션은 <a href="lincheck-testing-strategies.md#model-checking">모델 검사(model checking)</a>에만 적용할 수 있습니다.</td></tr>
<tr>
    <td><code>recursionBound</code></td>
    <td><code>20</code></td>
    <td>Lincheck이 정지된 실행을 보고하기까지의 재귀 호출 횟수입니다.<br/>
        <code>loopIterationsBeforeThreadSwitch</code> 값은 <code>loopBound</code>보다 작아야 합니다.<br/><br/>
        이 옵션은 <a href="lincheck-testing-strategies.md#model-checking">모델 검사(model checking)</a>에만 적용할 수 있습니다.</td></tr>
</table>

## 루프에서의 스레드 전환

<table><tr><td>옵션</td><td>기본값</td><td>설명</td></tr>
<tr>
    <td><code>loopIterationsBeforeThreadSwitch</code></td>
    <td><code>10</code></td>
    <td>다른 스레드로 전환을 시도하기 전에 스레드가 수행할 수 있는 루프 반복 횟수입니다.<br/>
        <code>loopIterationsBeforeThreadSwitch</code> 값은 
        <a href="#정지된-실행-감지"><code>loopBound</code></a>보다 작아야 합니다.<br/><br/>
        이 옵션은 <a href="lincheck-testing-strategies.md#model-checking">모델 검사(model checking)</a>에만 적용할 수 있습니다.</td></tr>
</table>

## 검증

<table>
<tr><td>옵션</td><td>기본값</td><td>설명</td></tr>
<tr>
    <td><code>verifierClass</code></td>
    <td><code>LinearizabilityVerifier</code></td>
    <td><a href="lincheck-results-validation.md#verification-models">검증 프로세스</a> 중에 사용되는 검증기(verifier) 클래스입니다:
        <list>
            <li><code>LinearizabilityVerifier</code></li>
            <li><code>SerializabilityVerifier</code></li>
            <li><code>QuiescentConsistencyVerifier</code></li>
        </list></td></tr>
<tr>
    <td><code>sequentialSpecification</code></td>
    <td>테스트 대상 데이터 구조와 동일함.</td>
    <td>테스트 대상 데이터 구조의 순차 버전입니다. 이 구조는 <a href="lincheck-results-validation.md">검증 프로세스</a> 중에 사용됩니다.</td>
</tr>
</table>

## 진행 보장

<table><tr><td>옵션</td><td>기본값</td><td>설명</td></tr>
<tr>
    <td><code>checkObstructionFreedom</code></td>
    <td><code>false</code></td>
    <td>데이터 구조 연산의 <a href="lincheck-progress-guarantees.md">장애 자유(obstruction-freedom) 보장</a>을 검증하려면 이 옵션을 <code>true</code>로 설정하십시오.<br/><br/>
        이 옵션은 <a href="lincheck-testing-strategies.md#model-checking">모델 검사(model checking)</a>에만 적용할 수 있습니다.</td></tr>
</table>

## 라이브러리 분석

<table>
<tr><td>옵션</td><td>기본값</td><td>설명</td></tr>
<tr>
    <td><code>stdLibAnalysisEnabled</code></td>
    <td><code>false</code></td>
    <td>기본적으로 Lincheck은 표준 라이브러리의 연산들이 스레드 안전(thread-safe)하다고 간주하여 그 동작을 검증하지 않습니다. 표준 라이브러리 함수/클래스의 분석을 활성화하려면 이 옵션을 <code>true</code>로 설정하십시오.<br/><br/>
        이 옵션은 <a href="lincheck-testing-strategies.md#model-checking">모델 검사(model checking)</a>에만 적용할 수 있습니다.</td></tr>
<tr>
    <td><code>addGuarantee</code></td>
    <td>–</td>
    <td><code>addGuarantee</code> 옵션을 사용하여 스레드 안전하거나 분석과 무관한 메서드에 대한 <a href="#보장-정의하기">보장을 정의</a>하여 모델 검사에서 제외하십시오.<br/><br/>
        이 옵션은 <a href="lincheck-testing-strategies.md#model-checking">모델 검사(model checking)</a>에만 적용할 수 있습니다.</td></tr>
</table>

### 보장 정의하기

보장을 정의하려면 빌더 체인을 사용하십시오: 클래스를 선택하고, 메서드를 선택한 다음, 보장 유형을 선택합니다.

```kotlin
@Test
fun modelCheckingTest() = ModelCheckingOptions()
        .addGuarantee(
            forClasses("java.util.concurrent.ConcurrentHashMap")
                .allMethods()
                .treatAsAtomic()
        )
        .check(this::class)
```

1. `forClasses` 오버로드 중 하나를 사용하여 클래스를 선택합니다.

   * `forClasses(vararg fullClassNames: String)` — 전체 이름이 `fullClassNames` 문자열에 있는 클래스와 매칭됩니다.
   * `forClasses(vararg classes: KClass<*>)` — 참조를 통해 클래스와 매칭됩니다.
   * `forClasses(classPredicate: (fullClassName: String) -> Boolean)` — 전체 클래스 이름에 대한 조건자(predicate)를 사용하여 클래스와 매칭됩니다.

2. 보장을 적용할 메서드를 선택합니다.

   * `methods(methodNames: String)` – 이름이 `methodNames` 문자열에 있는 메서드와 매칭됩니다.
   * `methods(methodPredicate: (methodName: String) -> Boolean)` – 조건자를 사용하여 메서드와 매칭됩니다.
   * `allMethods()` – 선택한 클래스의 모든 메서드와 매칭됩니다.

3. 보장 유형을 선택합니다.

   * `treatAsAtomic()` — 각 메서드를 원자적(atomic) 연산으로 취급합니다. Lincheck은 메서드 호출 내부에 전환 지점(switch points)을 삽입하지 않지만, 호출 전후에는 추가할 수 있습니다.

     스레드 안전한 것으로 알려진 메서드에 `treatAsAtomic()`을 사용하십시오.
   * `ignore()` — 분석에서 메서드를 제외합니다. Lincheck은 메서드 호출 내부, 이전 또는 이후에 전환 지점을 삽입하지 않습니다.

     > 메서드가 내부적으로 동기화 프리미티브(예: `synchronized` 블록)를 사용하는 경우, 메서드를 무시하면 Lincheck에서 데드락(deadlock)이 발생할 수 있습니다.
     >
     {style="warning"}

     로깅이나 디버깅 유틸리티와 같이 분석과 무관한 메서드에 `ignore()`를 사용하십시오.

## 다음 단계

Lincheck의 실행 시나리오에서 사용되는 연산들에 대한 [인자 생성 구성 방법](lincheck-argument-generation-constraints.md)을 알아보세요.

## 참고 항목

* [연산 실행 옵션 구성하기](lincheck-operation-execution-options.md)
* [넌블로킹 진행 보장 확인하기](lincheck-progress-guarantees.md)
* [알고리즘의 순차 명세 정의하기](lincheck-results-validation.md)