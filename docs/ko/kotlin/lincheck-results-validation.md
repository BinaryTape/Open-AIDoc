[//]: # (title: 결과 검증 및 유효성 검사)
[//]: # (description: Lincheck이 동시성 실행 결과를 검증하는 방법을 알아봅니다.)

동시성 데이터 구조에 대해 생성된 시나리오를 실행한 후, Lincheck은 지정된 검증 모델(예: 선형성(Linearizability))에 따라 결과를 검증하고, 선택적으로 사용자가 제공한 유효성 검사 함수를 통해 데이터 구조의 최종 상태를 확인합니다.

## 검증 (Verification)

검증 과정에서 Lincheck은 동시성 시나리오에서의 실행 결과와 동일한 결과를 내는 순차적 실행(sequential execution)을 찾으려고 시도합니다.

![Lincheck의 검증 과정 다이어그램. Lincheck은 동시성 실행을 여러 순차적 실행과 비교합니다.](verification-process.svg){width=700}

[검증 모델](#검증-모델)에 따라 순차적 실행에 추가적인 제약 조건이 있을 수 있습니다. 검증 속성과 일치하는 순차적 실행이 관찰된 결과와 동일한 결과를 낼 수 없는 경우, Lincheck은 오류를 보고합니다.

### 순차 사양 (Sequential specification)

기본적으로 검증 과정에서 Lincheck은 *동시성* 데이터 구조의 연산들을 사용하여 순차적 실행을 구성합니다.

다음과 같은 목적으로 연산이 일치하는 순차적 데이터 구조를 지정할 수 있습니다.
* 동시성 데이터 구조가 순차적 구조와 동일한 결과를 제공하는지 확인하기 위함입니다.

  일반적으로 단일 스레드 구현은 스레드 안전(thread-safe) 구현보다 단순하므로 정확성을 훨씬 더 쉽게 검증할 수 있습니다(예: `HashMap`과 `ConcurrentHashMap`, `LinkedList`와 `ConcurrentLinkedQueue`).

  두 버전의 구조에 대한 실행 결과를 비교함으로써, 더 복잡한 동시성 구조가 단일 스레드 환경에서 더 단순한 구조와 유사하게 동작하는지 확인할 수 있습니다.

* 단일 테스트에서 순차적 정확성과 동시성 안전성을 모두 확인하기 위함입니다.

![Lincheck의 검증 과정 다이어그램. Lincheck은 동시성 실행을 여러 순차적 실행과 비교합니다. 순차적 실행은 지정된 순차 버전 구조의 연산을 사용합니다.](verification-process-seq.svg){width=700}

데이터 구조의 순차적 버전을 지정하려면 다음을 수행하세요.

1. Lincheck에서 테스트하는 모든 동시성 함수와 대응하는 순차적 버전의 함수들을 갖춘 데이터 구조를 구현합니다.
2. `sequentialSpecification()` 옵션을 사용하여 해당 데이터 구조를 지정합니다.

   ```kotlin
   @Test
   fun stressTest() = StressOptions()
       .sequentialSpecification(SequentialStructure::class)
       .check(this::class)
   ```

단일 스레드 `LinkedList`를 `ConcurrentLinkedQueue`의 순차 사양으로 사용하는 Lincheck 테스트 예시입니다.

```kotlin
class ConcurrentLinkedQueueTest {
    private val s = ConcurrentLinkedQueue<Int>()

    @Operation
    fun add(value: Int) = s.add(value)

    @Operation
    fun poll(): Int? = s.poll()

    @Test
    fun stressTest() = StressOptions()
        .sequentialSpecification(SequentialQueue::class.java)
        .check(this::class)
}

class SequentialQueue {
    private val s = LinkedList<Int>()

    fun add(x: Int) = s.add(x)
    fun poll(): Int? = s.poll()
}
```

### 검증 모델 (Verification models)

기본적으로 Lincheck은 동시성 실행 결과를 선형성(Linearizability) 모델에 따라 검증합니다.
다른 검증 모델을 적용하려면 `verifierClass` 옵션을 사용하세요.

```kotlin
@Test
fun modelCheckingTest() = ModelCheckingOptions()
   .verifierClass(SerializabilityVerifier::class)
   .check(this::class)
```

Lincheck은 다음과 같은 검증기 클래스를 제공합니다.

* `LinearizabilityVerifier` – 기본 옵션입니다. 동시성 실행 중인 연산들 사이의 ["happens-before"](https://en.wikipedia.org/wiki/Happened-before) 관계를 유지하는 순차적 실행이 존재한다면 해당 동시성 실행은 유효합니다.
* `QuiescentConsistencyVerifier` – 정지 일관성 (Quiescent Consistency) 모델을 사용합니다. 선형성 모델과 유사하게 작동하지만, `@QuiescentConsistent` 어노테이션이 달린 연산에는 "happens-before" 제약 조건이 적용되지 않습니다.

   ```kotlin
   @Operation
   @QuiescentConsistent
   fun someOperation() = { ... }
   ```

   > `QuiescentConsistencyVerifier`는 실제 [정지 지점(quiescent points)](https://bura.brunel.ac.uk/bitstream/2438/9717/1/Fulltext.pdf)을 추적하지 않습니다. 
   > 이 검증기는 정지 지점의 경계에서 발생하는 버그를 놓칠 가능성이 있습니다.
   >
   {style="note"}

* `SerializabilityVerifier` – 직렬 가능성 (Serializability) 모델을 사용합니다. "happens-before" 제약 조건과 상관없이, 동시성 실행과 동일한 결과를 내는 *어떠한* 순차적 실행(어떤 순서로든)이라도 존재하면 유효한 것으로 간주합니다. 동시성 연산의 상대적 순서가 중요하지 않은 구조에 사용할 수 있습니다.

#### 직렬 가능성과 선형성 비교

두 모델의 차이점을 이해하기 위해, 데이터 구조가 직렬 가능하지만 선형적이지 않을 수 있는 경우를 살펴보겠습니다.

1. 다음과 같은 데이터 구조를 고려해 보세요.

   ```kotlin
   class ConcurrentQueue {
       private val elements: MutableList<Int> = ArrayList()

       fun put(x: Int) = synchronized(this) {
           elements += x
       }

       fun poll(): Int? = synchronized(this) {
           if (elements.isEmpty()) return null
           elements.shuffle()
           elements.removeAt(0)
       }
   }
   ```

   이 동시성 구조는 잘못 동작합니다. 일반적인 큐처럼 요소를 저장하지만, 반환할 때는 무작위로 반환합니다.

2. 요소를 올바르게 저장하고 반환하는 큐의 순차적 버전을 구현합니다.

   ```kotlin
   class SequentialQueue {
       private val elements: MutableList<Int> = ArrayList()
  
       fun put(x: Int) {
           elements += x
       }
  
       fun poll(): Int? = if (elements.isEmpty()) null else elements.removeAt(0)
   }
   ```

3. 테스트 클래스를 생성하고 `put()`과 `poll()` 연산을 선언합니다.

   ```kotlin
   @Param(name = "value", gen = IntGen::class, conf = "1:2")
   class ConcurrentQueueTest {
       private val q = ConcurrentQueue()
  
       @Operation
       fun put(@Param(name = "value") x: Int) = q.put(x)
  
       @Operation
       fun poll(): Int? = q.poll()
   }
   ```

4. 직렬 가능성 테스트를 선언하고 실행합니다.

   ```kotlin
   @Test
   fun serializabilityTest() = ModelCheckingOptions()
       .actorsBefore(0)
       .actorsAfter(0)
       .actorsPerThread(2)
       .threads(2)
       // 직렬 가능성에 대해 검증
       .verifier(SerializabilityVerifier::class.java)
       // 구조의 순차 버전 지정
       .sequentialSpecification(SequentialQueue::class.java)
       .check(this::class.java)
   ```

   이 테스트는 성공적으로 통과해야 합니다.

5. 선형성 테스트를 선언하고 실행합니다.

   ```kotlin
   @Test
   fun linearizabilityTest() = ModelCheckingOptions()
       .actorsBefore(0)
       .actorsAfter(0)
       .actorsPerThread(2)
       .threads(2)
       // 실패한 전체 시나리오 표시
       .minimizeFailedScenario(false)
       // 구조의 순차 버전 지정
       .sequentialSpecification(SequentialQueue::class.java)
       .check(this::class.java)
   ```

   테스트는 다음과 같은 보고와 함께 실패해야 합니다.

   ```text
   | -------------------- |
   | Thread 1  | Thread 2 |
   | -------------------- |
   |           | put(2)   |
   |           | put(1)   |
   | put(3)    |          |
   | poll(): 1 |          |
   | -------------------- |
   ```

6. 결과를 분석합니다.

   직렬 가능성 테스트가 통과했다는 것은 `poll(): 1` 결과를 내는 `SequentialQueue` 연산의 *어떤* 순차적 순서가 존재한다는 것을 의미합니다. 예를 들면 다음과 같습니다.

   ![두 스레드 시나리오의 연산들이 단일 스레드 시나리오로 재정렬되는 애니메이션. 스레드 2가 먼저 실행되며 `put(2)`, `put(1)` 두 연산을 가집니다. 스레드 1이 두 번째로 실행되며 `put(3)`, `poll(): 1` 두 연산을 가집니다. 단일 스레드 시나리오는 `put(1)`, `put(2)`, `put(3)`, `poll(): 1` 순서로 연산을 가집니다. `put(1)`이 이제 첫 번째 연산이므로 `poll()`은 값 `1`을 올바르게 반환합니다.](reorder.gif){width=500}

   하지만 선형성은 연산 순서를 더 엄격하게 제한합니다. 동시성 실행에서 연산 `A`가 연산 `B`가 시작되기 전에 끝났다면, 순차적 실행에서도 `A`는 반드시 `B`보다 먼저 실행되어야 합니다. 선형적인 실행의 예시는 다음과 같습니다.

   ![두 스레드 시나리오의 연산들이 단일 스레드 시나리오로 재정렬되는 애니메이션. 스레드 1이 먼저 실행되며 `put(1)`, `put(2)` 두 연산을 가집니다. 스레드 2가 두 번째로 실행되며 `poll(): 1`, `poll(): 2` 두 연산을 가집니다. 단일 스레드 시나리오는 `put(1)`, `put(2)`, `poll(): 1`, `poll(): 2` 순서로 연산을 가집니다. 모든 `poll()` 연산이 올바른 값을 반환합니다.](reorderLin.gif){width=500}

   Lincheck은 검증 중에 `put()` 연산의 순서를 재정렬할 수 없으므로(선형성 제약 조건 때문), 선형성 규칙을 준수하는 순차적 실행을 찾을 수 없습니다. 결과적으로 테스트가 실패하게 됩니다.

## 유효성 검사 (Validation)

기본적으로 Lincheck은 생성된 시나리오를 실행한 후 동시성 데이터 구조의 상태를 유효성 검사하지 않습니다. 최종 상태를 확인하려면 테스트 클래스의 유효성 검사 함수에 `@Validate` 어노테이션을 사용하세요.

```kotlin
@Validate
fun validate() {
    // 데이터 구조의 특정 속성 확인
    // 불변성(invariant)이 위반된 경우 예외 발생
    check(size >= 0) { "크기는 음수일 수 없지만, 현재 $size 입니다." }
}
```

유효성 검사 함수는 다음과 같아야 합니다.
* 인자를 받지 않아야 합니다.
* 데이터 구조가 유효하지 않은 상태인 경우 예외를 발생시켜야 합니다.

## 다음 단계

* [인자 생성 제약 조건 구성](lincheck-argument-generation-constraints.md)
* [연산 실행 구성 옵션](lincheck-operation-execution-options.md)
* [논블로킹 진행 보장 확인](lincheck-progress-guarantees.md)