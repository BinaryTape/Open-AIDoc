[//]: # (title: 데이터 구조 테스트 방법)
[//]: # (description: Lincheck을 사용하여 동시성 데이터 구조를 테스트하는 방법을 알아봅니다: 테스트를 설정하고 테스트 프로세스의 내부를 이해합니다.)

Lincheck은 동시성 데이터 구조 테스트를 위한 선언적 인터페이스를 제공합니다.
테스트 수행 방법을 설명하는 대신 테스트해야 할 모든 연산을 선언하면, Lincheck이 동시성 실행 시나리오를 생성하고 실행한 뒤 결과를 분석합니다.

Lincheck으로 다음 `Counter` 데이터 구조를 테스트해 보겠습니다:

```kotlin
class Counter {
    var value = 0

    fun inc(): Int = ++value
    fun dec(): Int = --value
}
```

1. 테스트 클래스를 생성합니다:

    ```kotlin
    class CounterTest {
    }
    ```

2. 데이터 구조의 인스턴스를 유지하는 클래스 프로퍼티를 생성합니다:

   ```kotlin
   private val c = Counter()
   ```

3. 테스트하려는 연산을 멤버 함수로 선언하고 `@Operation` 어노테이션을 추가합니다:

    ```kotlin
    @Operation
    fun inc() = c.inc()
    
    @Operation
    fun dec() = c.dec()
    ```

    이 어노테이션은 실행 시나리오를 생성할 때 포함할 메서드를 Lincheck에 알려줍니다.

4. `ModelCheckingOptions()` 또는 `StressOptions()`를 사용하여 테스트 함수를 멤버 함수로 선언합니다. `@Test` 어노테이션을 추가합니다:

   ```kotlin
   @Test
   fun modelCheckingTest() = ModelCheckingOptions()
       .check(this::class)
   ```

   > [테스트 전략](lincheck-testing-strategies.md) 문서에서 모델 검사(model checking)와 스트레스 테스트(stress testing)의 차이점에 대해 알아보세요.
   >
   {style=”tip”}

5. 테스트를 실행합니다. 실패할 경우, Lincheck은 잘못된 동작을 유발한 시나리오 및 실행 추적(execution trace) 정보가 포함된 오류 보고서를 생성합니다:

    ```text
    = Invalid execution results =
    | -------------------- |
    | Thread 1  | Thread 2 |
    | -------------------- |
    | dec(): -1 | inc(): 1 |
    | -------------------- |
    ```

## 테스트 프로세스

데이터 구조를 테스트할 때, Lincheck은 실행 시나리오 목록을 생성하고 실행한 뒤 결과를 분석합니다.

다음 `Counter` 데이터 구조를 예로 들어보겠습니다:

![`inc()`와 `dec()` 두 메서드가 있는 `Counter` 데이터 구조의 다이어그램](counter_structure.svg){width=150}

이를 테스트하기 위해 Lincheck은 다음 단계를 수행합니다:

1. 선언된 연산을 서로 다른 스레드에 무작위로 배치하여 무작위 실행 시나리오 목록을 생성합니다:

   ![네 가지 실행 시나리오의 다이어그램. 각 시나리오에서 연산은 두 스레드에 서로 다른 순서로 배치됩니다.](execution_scenarios.svg){width=400}

   Lincheck에서 제공하는 [설정 옵션](lincheck-testing-strategies-options.md#scenario-generation)을 사용하여 스레드 수와 스레드당 연산 수를 지정할 수 있습니다.

2. 지정된 테스트 전략([모델 검사 또는 스트레스 테스트](lincheck-testing-strategies.md))을 사용하여 생성된 시나리오를 실행합니다. 각 시나리오는 서로 다른 실행 스케줄을 조사하기 위해 여러 번 실행됩니다:

   ![네 가지 실행 스케줄의 다이어그램. 모든 스케줄은 단일 실행 시나리오에 해당합니다. 각 스케줄에서 연산은 서로 다른 시점에 서로를 중단(interrupt)시킵니다.](execution_schedules.svg){width=400}

3. 정확성 속성(correctness property)에 대해 실행 결과를 검증합니다. 기본값은 [선형화 가능성(linearizability)](https://en.wikipedia.org/wiki/Linearizability)입니다.

   ![검증 프로세스 다이어그램. 하나의 실행 스케줄 결과가 동일한 연산을 순차적으로 실행한 결과와 비교됩니다.](verification.svg){width=300}

   이 단계에서 [검증 함수](lincheck-results-validation.md)가 제공된 경우 Lincheck은 구조를 검증할 수도 있습니다.

## 예시: 트라이버 스택 구조 구현 테스트

[트라이버 스택(Treiber Stack)](https://en.wikipedia.org/wiki/Treiber_stack)의 _올바르지 않은_ 구현 예시를 살펴보겠습니다:

```kotlin
import org.jetbrains.lincheck.*
import org.jetbrains.lincheck.annotations.*
import org.jetbrains.lincheck.strategy.managed.modelchecking.*
import java.util.concurrent.atomic.AtomicReference
import kotlin.test.*

class TreiberStack<E> {
    private val top = AtomicReference<Node<E>?>(null)

    fun push(item: E) {
        val newHead = Node(item)
        var oldHead: Node<E>?

        do {
            oldHead = top.get()
            newHead.next = oldHead
        } while (!top.compareAndSet(oldHead, newHead))
    }

    fun pop(): E? {
        val oldHead = top.get()

        if (oldHead == null) {
            return null
        }

        val newHead = oldHead.next
        top.compareAndSet(oldHead, newHead)

        // Bug: by the time `pop()` finishes execution,
        // another thread might have already popped this item.
        return oldHead.item
    }

    private class Node<E>(
        val item: E,
        var next: Node<E>? = null
    )
}
```

이 구조를 Lincheck으로 테스트하여 주입된 버그가 프로그램 동작에 어떤 영향을 미치는지 확인할 수 있습니다:

1. 테스트 구조를 생성합니다:

    ```kotlin
   class TreiberStackTest {
       private val stack = TreiberStack<Int>()
  
       @Operation
       fun push(value: Int) = stack.push(value)
  
       @Operation
       fun pop(): Int? = stack.pop()
  
       @Test
       fun modelCheckingTest() = ModelCheckingOptions()
           .check(this::class)
   }
   ```

2. 테스트를 실행합니다. Lincheck은 오류 보고서를 생성하고 잘못된 동작을 유발하는 실행 시나리오를 제공합니다:

   ```text
   | ------------------------------ |
   |   Thread 1    |    Thread 2    |
   | ------------------------------ |
   | push(1): void |                |
   | ------------------------------ |
   | pop(): 1      | push(-1): void |
   | ------------------------------ |
   | pop(): -1     |                |
   | pop(): 1      |                |
   | ------------------------------ |
   ```

   이 다이어그램은 연산이 여러 스레드에 어떻게 배치되는지와 연산의 반환 값을 보여줍니다. Lincheck은 또한 잘못된 결과로 이어지는 특정 스레드 인터리빙(interleaving)을 제공합니다:

   ```text
   | ----------------------------------------------------- |
   |                  Thread 1                  | Thread 2 |
   | ----------------------------------------------------- |
   | push(1)                                    |          |
   | ----------------------------------------------------- |
   | pop(): 1                                   |          |
   |   stack.pop(): 1                           |          |
   |     top.get(): Node#1                      |          |
   |     switch                                 |          |
   |                                            | push(-1) |
   |     oldHead.getNext(): null                |          |
   |     top.compareAndSet(Node#1, null): false |          |
   |     oldHead.getItem(): 1                   |          |
   |   result: 1                                |          |
   | ----------------------------------------------------- |
   | pop(): -1                                  |          |
   | pop(): 1                                   |          |
   | ----------------------------------------------------- |
   ```

   이 구현은 다른 스레드가 `pop()` 함수를 중단시키는 상황을 고려하지 않았기 때문에, `pop()`이 `1`을 두 번 반환하며 이는 불가능해야 하는 상황입니다.

3. 데이터 구조를 수정합니다. 올바른 구현은 결과를 반환하기 전에 `oldHead` 변수를 최신 값으로 업데이트합니다:

   ```kotlin
   fun pop(): E? {
       var oldHead: Node<E>?
       var newHead: Node<E>?
 
       do {
           oldHead = top.get()
           if (oldHead == null) return null
           newHead = oldHead.next
       } while (!top.compareAndSet(oldHead, newHead))
 
       return oldHead.item
   }
   ```

## 다음 단계

Lincheck에서 사용 가능한 [테스트 전략](lincheck-testing-strategies.md)에 대해 알아보세요.

## 관련 정보

* [연산 인자 생성](lincheck-argument-generation-constraints.md)
* [연산 실행 옵션 설정](lincheck-operation-execution-options.md)
* [논블로킹 진행 보장 확인](lincheck-progress-guarantees.md)
* [알고리즘의 순차적 명세 정의](lincheck-results-validation.md)