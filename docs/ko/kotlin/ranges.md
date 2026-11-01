[//]: # (title: 범위(Range)와 수열(Progression))

범위(Range)와 수열(Progression)은 Kotlin에서 값의 시퀀스를 정의하며, 범위 연산자, 순회(iteration), 커스텀 step 값, 등차수열 등을 지원합니다.

## 범위(Ranges) {id="range"}

Kotlin에서는 `kotlin.ranges` 패키지의 [`.rangeTo()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/range-to.html) 및 [`.rangeUntil()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/range-until.html) 함수를 사용하여 값의 범위를 쉽게 생성할 수 있습니다.

범위는 시작과 끝이 정의된 순서가 있는 값의 집합을 나타냅니다. 기본적으로 각 단계마다 1씩 증가합니다.
예를 들어, `1..4`는 숫자 1, 2, 3, 4를 나타냅니다.

다음과 같은 범위를 만들 수 있습니다.

* 상한값을 포함(inclusive)하려면 `..` 연산자와 함께 `.rangeTo()` 함수를 호출합니다. 이 경우 시작값과 끝값이 모두 포함됩니다.
* 상한값을 제외(exclusive)하려면 `..<` 연산자와 함께 `.rangeUntil()` 함수를 호출합니다. 이 경우 시작값은 포함되지만 끝값은 제외됩니다.

예시:

```kotlin
fun main() {
//sampleStart
    // 1과 4를 모두 포함
    println(4 in 1..4)
    // true
    
    // 1은 포함하고 4는 제외
    println(4 in 1..<4)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-rangeto-rangeuntil"}

범위는 `for` 루프에서 순회할 때 특히 유용합니다.

```kotlin
fun main() {
//sampleStart
    for (i in 1..4) print(i)
    // 1234
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-for-loop"}

역순으로 숫자를 순회하려면 `..` 대신 [`downTo`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/down-to.html) 함수를 사용하세요.

```kotlin
fun main() {
//sampleStart
    for (i in 4 downTo 1) print(i)
    // 4321
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-downto"}

또한 기본 증가값인 1 대신 [`step()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/step.html) 함수를 사용하여 커스텀 증감 폭(step)으로 숫자를 순회할 수도 있습니다.

```kotlin
fun main() {
//sampleStart
    for (i in 0..8 step 2) print(i)
    println()
    // 02468
    for (i in 0..<8 step 2) print(i)
    println()
    // 0246
    for (i in 8 downTo 0 step 2) print(i)
    // 86420
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-step"}

## 수열(Progressions) {id="progressions"}

`Int`, `Long`, `Char`와 같은 정수형 타입의 범위는 [등차수열(arithmetic progressions)](https://en.wikipedia.org/wiki/Arithmetic_progression)로 취급될 수 있습니다.
Kotlin에서 이러한 수열은 특수 타입으로 정의되어 있습니다: [`IntProgression`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/-int-progression/index.html), [`LongProgression`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/-long-progression/index.html), [`CharProgression`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/-char-progression/index.html).

수열에는 세 가지 필수 프로퍼티가 있습니다. 바로 `first` 요소, `last` 요소, 그리고 0이 아닌 `step`입니다.
첫 번째 요소는 `first`이며, 이후 요소들은 이전 요소에 `step`을 더한 값입니다.
양수 step을 가진 수열을 순회하는 것은 Java/JavaScript의 인덱스 기반 `for` 루프와 동일합니다.

```java
for (int i = first; i <= last; i += step) {
  // ...
}
```

범위를 순회하여 암시적으로 수열을 생성하는 경우, 해당 수열의 `first`와 `last` 요소는 범위의 양 끝점이 되며 `step`은 1이 됩니다.

```kotlin
fun main() {
//sampleStart
    for (i in 1..10) print(i)
    // 12345678910
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-progressions"}

커스텀 수열 step을 정의하려면 범위에 `step` 함수를 사용합니다.

```kotlin

fun main() {
//sampleStart
    for (i in 1..8 step 2) print(i)
    // 1357
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-progressions-step"}

수열의 `last` 요소는 다음과 같이 계산됩니다.
* 양수 step의 경우: `(last - first) % step == 0`을 만족하면서 끝값보다 크지 않은 최댓값입니다.
* 음수 step의 경우: `(last - first) % step == 0`을 만족하면서 끝값보다 작지 않은 최솟값입니다.

따라서 `last` 요소가 항상 지정된 끝값과 동일하지는 않습니다.

```kotlin

fun main() {
//sampleStart
    for (i in 1..9 step 3) print(i) // 마지막 요소는 7입니다.
    // 147
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-progressions-last"}

수열은 `Iterable<N>`(`N`은 각각 `Int`, `Long`, `Char`)을 구현하므로, `map`, `filter` 등 다양한 [컬렉션 함수](collection-operations.md)에서 활용할 수 있습니다.

```kotlin

fun main() {
//sampleStart
    println((1..10).filter { it % 2 == 0 })
    // [2, 4, 6, 8, 10]
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-ranges-progressions-filter"}