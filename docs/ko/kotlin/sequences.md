[//]: # (title: 시퀀스 (Sequences))

Kotlin 표준 라이브러리에는 컬렉션과 함께 또 다른 타입인 _시퀀스(sequences)_([`Sequence<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/-sequence/index.html))가 포함되어 있습니다.
컬렉션과 달리 시퀀스는 요소를 직접 포함하지 않고, 이터레이션(반복 순회)하는 동안 요소를 생성합니다.
시퀀스는 [`Iterable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-iterable/index.html)과 동일한 함수들을 제공하지만, 다단계 컬렉션 처리에 대해 다른 접근 방식을 구현합니다.

`Iterable`의 처리가 여러 단계를 포함하는 경우 각 단계는 즉시(eagerly) 실행됩니다. 즉, 각 처리 단계가 완료된 후 그 결과인 중간 컬렉션을 반환하고, 다음 단계는 이 컬렉션을 기반으로 실행됩니다. 반면, 시퀀스의 다단계 처리는 가능한 한 지연(lazily) 실행됩니다. 즉, 전체 처리 체인의 결과가 실제로 요청될 때에만 실제 연산이 일어납니다.

연산의 실행 순서 또한 다릅니다. `Sequence`는 모든 처리 단계를 각 요소에 대해 하나씩 차례대로 수행합니다. 반대로 `Iterable`은 전체 컬렉션에 대해 각 단계를 완료한 후 다음 단계로 진행합니다.

따라서 시퀀스를 사용하면 중간 단계의 결과를 생성하는 과정을 피할 수 있어 전체 컬렉션 처리 체인의 성능을 향상시킬 수 있습니다. 그러나 시퀀스의 지연 특성으로 인해 약간의 오버헤드가 발생하며, 이는 작은 컬렉션을 처리하거나 단순한 연산을 수행할 때 유의미하게 작용할 수 있습니다. 그러므로 `Sequence`와 `Iterable`을 모두 고려하여 자신의 상황에 더 적합한 방식을 선택해야 합니다.

## 생성 {id="construct"}

### 요소로부터 생성 {id="from-elements"}

시퀀스를 생성하려면 요소를 인자로 나열하여 [`sequenceOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/sequence-of.html) 함수를 호출합니다.

```kotlin
val numbersSequence = sequenceOf("four", "three", "two", "one")
```

### Iterable로부터 생성 {id="from-an-iterable"}

이미 `Iterable` 객체(`List` 또는 `Set` 등)가 있다면, [`asSequence()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/as-sequence.html)를 호출하여 시퀀스를 생성할 수 있습니다.

```kotlin
val numbers = listOf("one", "two", "three", "four")
val numbersSequence = numbers.asSequence()

```

### 함수로부터 생성 {id="from-a-function"}

시퀀스를 생성하는 또 다른 방법은 요소를 계산하는 함수를 사용하여 빌드하는 것입니다.
함수를 기반으로 시퀀스를 빌드하려면 해당 함수를 인자로 넘겨 [`generateSequence()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/generate-sequence.html)를 호출합니다. 선택적으로 첫 번째 요소를 명시적 값이나 함수 호출의 결과로 지정할 수 있습니다.
제공된 함수가 `null`을 반환하면 시퀀스 생성이 중단됩니다. 따라서 아래 예제의 시퀀스는 무한 시퀀스입니다.

```kotlin

fun main() {
//sampleStart
    val oddNumbers = generateSequence(1) { it + 2 } // `it`은 이전 요소입니다
    println(oddNumbers.take(5).toList())
    //println(oddNumbers.count())     // 오류: 시퀀스가 무한합니다
//sampleEnd
}
```
{kotlin-runnable="true"}

`generateSequence()`로 유한 시퀀스를 생성하려면, 필요한 마지막 요소 이후에 `null`을 반환하는 함수를 제공하세요.

```kotlin

fun main() {
//sampleStart
    val oddNumbersLessThan10 = generateSequence(1) { if (it < 8) it + 2 else null }
    println(oddNumbersLessThan10.count())
//sampleEnd
}
```
{kotlin-runnable="true"}

### 청크(조각)로부터 생성 {id="from-chunks"}

마지막으로, 시퀀스 요소를 하나씩 또는 임의의 크기를 가진 청크 단위로 생성할 수 있는 함수인 [`sequence()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/sequence.html) 함수가 있습니다.
이 함수는 [`yield()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/-sequence-scope/yield.html) 및 [`yieldAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/-sequence-scope/yield-all.html) 함수 호출을 포함하는 람다 표현식을 인자로 받습니다.
이 함수들은 시퀀스 소비자에게 요소를 반환하고, 소비자가 다음 요소를 요청할 때까지 `sequence()`의 실행을 일시 중단(suspend)합니다. `yield()`는 단일 요소를 인자로 받으며, `yieldAll()`은 `Iterable` 객체, `Iterator`, 또는 또 다른 `Sequence`를 인자로 받을 수 있습니다. `yieldAll()`의 `Sequence` 인자는 무한할 수도 있습니다. 단, 이러한 호출은 반드시 마지막이어야 하며, 이후의 모든 호출은 실행되지 않습니다.

```kotlin

fun main() {
//sampleStart
    val oddNumbers = sequence {
        yield(1)
        yieldAll(listOf(3, 5))
        yieldAll(generateSequence(7) { it + 2 })
    }
    println(oddNumbers.take(5).toList())
//sampleEnd
}
```
{kotlin-runnable="true"}

## 시퀀스 연산 {id="sequence-operations"}

시퀀스 연산은 상태 요구사항에 따라 다음과 같은 그룹으로 분류할 수 있습니다:

* _무상태(Stateless)_ 연산은 상태를 필요로 하지 않으며 각 요소를 독립적으로 처리합니다. 예를 들어 [`map()`](collection-transformations.md#map)이나 [`filter()`](collection-filtering.md)가 있습니다.
   또한 무상태 연산은 요소를 처리하기 위해 적은 양의 고정된 상태만 필요로 할 수도 있습니다. 예를 들어 [`take()` 또는 `drop()`](collection-parts.md)이 있습니다.
* _유상태(Stateful)_ 연산은 상당한 양의 상태를 필요로 하며, 일반적으로 시퀀스의 요소 수에 비례합니다.

시퀀스 연산이 지연 생성되는 또 다른 시퀀스를 반환하는 경우, 이를 _중간(intermediate)_ 연산이라고 합니다.
그렇지 않은 연산은 _최종(terminal)_ 연산입니다. 최종 연산의 예로는 [`toList()`](constructing-collections.md#copy) 또는 [`sum()`](collection-aggregate.md)이 있습니다. 시퀀스 요소는 최종 연산을 통해서만 얻을 수 있습니다.

시퀀스는 여러 번 반복 순회할 수 있습니다. 그러나 일부 시퀀스 구현체는 한 번만 순회하도록 제한될 수 있으며, 이는 해당 문서에 명시되어 있습니다.

## 시퀀스 처리 예제 {id="sequence-processing-example"}

예제를 통해 `Iterable`과 `Sequence`의 차이점을 살펴보겠습니다.

### Iterable {id="iterable"}

단어 목록이 있다고 가정해 보겠습니다. 아래 코드는 3글자보다 긴 단어를 필터링하고, 해당 단어 중 처음 4개의 길이를 출력합니다.

```kotlin

fun main() {    
//sampleStart
    val words = "The quick brown fox jumps over the lazy dog".split(" ")
    val lengthsList = words.filter { println("filter: $it"); it.length > 3 }
        .map { println("length: ${it.length}"); it.length }
        .take(4)

    println("Lengths of first 4 words longer than 3 chars:")
    println(lengthsList)
//sampleEnd
}
```
{kotlin-runnable="true"}

이 코드를 실행하면 `filter()`와 `map()` 함수가 코드에 나타난 순서대로 실행되는 것을 확인할 수 있습니다. 먼저 모든 요소에 대해 `filter:`가 출력되고, 필터링 후 남은 요소들에 대해 `length:`가 출력된 다음, 마지막 두 줄의 결과가 출력됩니다.

리스트 처리는 다음과 같이 진행됩니다:

![리스트 처리](list-processing.svg)

### Sequence {id="sequence"}

이제 시퀀스를 사용하여 동일한 작업을 작성해 보겠습니다:

```kotlin

fun main() {
//sampleStart
    val words = "The quick brown fox jumps over the lazy dog".split(" ")
    // List를 Sequence로 변환
    val wordsSequence = words.asSequence()

    val lengthsSequence = wordsSequence.filter { println("filter: $it"); it.length > 3 }
        .map { println("length: ${it.length}"); it.length }
        .take(4)

    println("Lengths of first 4 words longer than 3 chars")
    // 최종 연산: 결과를 List로 획득
    println(lengthsSequence.toList())
//sampleEnd
}
```
{kotlin-runnable="true"}

이 코드의 출력 결과를 보면 `filter()`와 `map()` 함수가 결과 리스트를 생성할 때에만 호출된다는 것을 알 수 있습니다.
따라서 `"Lengths of.."`라는 텍스트 줄이 먼저 출력되고, 그 후에 시퀀스 처리가 시작됩니다.
필터링을 통과한 요소의 경우 다음 요소를 필터링하기 전에 맵(map) 연산이 먼저 실행된다는 점에 유의하세요.
결과 크기가 4에 도달하면 처리가 중단됩니다. 이는 `take(4)`가 반환할 수 있는 최대 크기이기 때문입니다.

시퀀스 처리는 다음과 같이 진행됩니다:

![시퀀스 처리](sequence-processing.svg) {width="700"}

이 예제에서는 요소를 지연 처리하고 4개의 항목을 찾은 후 처리를 중단하므로, 리스트 접근 방식을 사용하는 것에 비해 연산 횟수가 줄어듭니다.