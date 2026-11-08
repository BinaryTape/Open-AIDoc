[//]: # (title: 컬렉션의 일부분 가져오기)

Kotlin 표준 라이브러리에는 컬렉션의 일부분을 가져오는 확장 함수들이 포함되어 있습니다.
이러한 함수들은 결과 컬렉션에 포함할 요소를 선택하는 다양한 방법을 제공합니다. 예를 들어 위치를 명시적으로 나열하거나 결과의 크기를 지정하는 등의 방법이 있습니다.

## Slice {id="slice"}

[`slice()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/slice.html)는 주어진 인덱스에 해당하는 컬렉션 요소들의 리스트를 반환합니다. 인덱스는 [범위(range)](ranges.md) 또는 정수 값의 컬렉션으로 전달할 수 있습니다.

```kotlin

fun main() {
//sampleStart    
    val numbers = listOf("one", "two", "three", "four", "five", "six")    
    println(numbers.slice(1..3))
    println(numbers.slice(0..4 step 2))
    println(numbers.slice(setOf(3, 5, 0)))    
//sampleEnd
}
```
{kotlin-runnable="true"}

## Take와 drop {id="take-and-drop"}

처음부터 지정된 개수의 요소를 가져오려면 [`take()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/take.html) 함수를 사용하세요.
마지막 요소들을 가져오려면 [`takeLast()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/take-last.html)를 사용합니다.
두 함수 모두 컬렉션 크기보다 큰 숫자로 호출하면 컬렉션 전체를 반환합니다.

처음 또는 마지막의 지정된 개수를 제외한 모든 요소를 가져오려면 각각 [`drop()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/drop.html)과 [`dropLast()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/drop-last.html) 함수를 호출하세요.

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five", "six")
    println(numbers.take(3))
    println(numbers.takeLast(3))
    println(numbers.drop(1))
    println(numbers.dropLast(5))
//sampleEnd
}
```
{kotlin-runnable="true"}

조건식(predicate)을 사용하여 가져오거나 버릴 요소의 개수를 정의할 수도 있습니다.
위에서 설명한 함수들과 유사한 네 가지 함수가 제공됩니다:

* [`takeWhile()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/take-while.html)은 조건식이 포함된 `take()`입니다. 조건식과 일치하지 않는 첫 번째 요소 직전까지의 요소들을 가져옵니다. 컬렉션의 첫 번째 요소가 조건식과 일치하지 않으면 빈 결과가 반환됩니다.
* [`takeLastWhile()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/take-last-while.html)은 `takeLast()`와 유사합니다. 컬렉션의 끝에서부터 조건식과 일치하는 요소 범위를 가져옵니다. 이 범위의 첫 번째 요소는 조건식과 일치하지 않는 마지막 요소의 바로 다음 요소입니다. 컬렉션의 마지막 요소가 조건식과 일치하지 않으면 빈 결과가 반환됩니다.
* [`dropWhile()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/drop-while.html)은 동일한 조건식을 사용할 때 `takeWhile()`과 반대로 동작합니다. 조건식과 일치하지 않는 첫 번째 요소부터 끝까지의 요소들을 반환합니다.
* [`dropLastWhile()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/drop-last-while.html)은 동일한 조건식을 사용할 때 `takeLastWhile()`과 반대로 동작합니다. 처음부터 조건식과 일치하지 않는 마지막 요소까지의 요소들을 반환합니다.

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five", "six")
    println(numbers.takeWhile { !it.startsWith('f') })
    println(numbers.takeLastWhile { it != "three" })
    println(numbers.dropWhile { it.length == 3 })
    println(numbers.dropLastWhile { it.contains('i') })
//sampleEnd
}
```
{kotlin-runnable="true"}

## Chunked {id="chunked"}

컬렉션을 주어진 크기의 묶음(청크)으로 나누려면 [`chunked()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/chunked.html) 함수를 사용하세요.
`chunked()`는 청크의 크기를 나타내는 단일 인자를 받아, 지정된 크기의 `List`들로 이루어진 `List`를 반환합니다.
첫 번째 청크는 첫 번째 요소부터 시작하여 `size`개의 요소를 포함하고, 두 번째 청크는 다음 `size`개의 요소를 포함하는 방식입니다. 마지막 청크는 크기가 더 작을 수 있습니다.

```kotlin

fun main() {
//sampleStart
    val numbers = (0..13).toList()
    println(numbers.chunked(3))
//sampleEnd
}
```
{kotlin-runnable="true"}

반환된 청크에 즉시 변환을 적용할 수도 있습니다.
이렇게 하려면 `chunked()`를 호출할 때 변환을 람다 함수로 제공하면 됩니다.
람다의 인자는 컬렉션의 한 청크입니다. `chunked()`를 변환 함수와 함께 호출할 때, 청크는 해당 람다 내에서 즉시 소비되어야 하는 수명이 짧은 `List`입니다.

```kotlin

fun main() {
//sampleStart
    val numbers = (0..13).toList() 
    println(numbers.chunked(3) { it.sum() })  // `it`은 원본 컬렉션의 청크입니다
//sampleEnd
}
```
{kotlin-runnable="true"}

## Windowed {id="windowed"}

주어진 크기의 컬렉션 요소들로 만들 수 있는 모든 범위를 가져올 수 있습니다.
이러한 범위를 가져오는 함수는 [`windowed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/windowed.html)입니다.
이 함수는 주어진 크기의 슬라이딩 윈도우(sliding window)를 통해 컬렉션을 바라보는 것과 같은 요소 범위 목록을 반환합니다.
`chunked()`와 달리 `windowed()`는 컬렉션의 *각* 요소부터 시작하는 요소 범위(_윈도우_)를 반환합니다.
모든 윈도우는 단일 `List`의 요소로 반환됩니다.

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")    
    println(numbers.windowed(3))
//sampleEnd
}
```
{kotlin-runnable="true"}

`windowed()`는 기본값을 가진 매개변수를 통해 더 높은 유연성을 제공합니다:

* `step`은 인접한 두 윈도우의 첫 번째 요소 간의 간격을 정의합니다. 기본값은 1이므로 결과에는 모든 요소부터 시작하는 윈도우가 포함됩니다. 단계를 2로 늘리면 홀수 번째 요소(첫 번째, 세 번째 등)부터 시작하는 윈도우만 반환됩니다.
* `partialWindows`는 컬렉션 끝부분의 요소로 시작하는 더 작은 크기의 윈도우를 포함할지 여부를 설정합니다. 예를 들어 요소 3개짜리 윈도우를 요청하는 경우, 마지막 두 요소로는 해당 크기의 윈도우를 만들 수 없습니다. 이 경우 `partialWindows`를 활성화하면 크기가 2와 1인 두 개의 리스트가 결과에 추가로 포함됩니다.

마지막으로, 반환된 범위에 즉시 변환을 적용할 수 있습니다.
이렇게 하려면 `windowed()`를 호출할 때 변환을 람다 함수로 제공하면 됩니다.

```kotlin

fun main() {
//sampleStart
    val numbers = (1..10).toList()
    println(numbers.windowed(3, step = 2, partialWindows = true))
    println(numbers.windowed(3) { it.sum() })
//sampleEnd
}
```
{kotlin-runnable="true"}

두 개 요소로 이루어진 윈도우를 만들기 위해 별도의 함수인 [`zipWithNext()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/zip-with-next.html)가 제공됩니다.
이 함수는 수신 객체 컬렉션의 인접한 요소 쌍을 생성합니다.
`zipWithNext()`는 컬렉션을 두 개씩 묶음으로 분할하는 것이 아닙니다. 마지막 요소를 제외한 _각_ 요소마다 `Pair`를 생성하므로, `[1, 2, 3, 4]`에 대한 결과는 `[[1, 2], [3, 4]]`가 아니라 `[[1, 2], [2, 3], [3, 4]]`가 됩니다.
`zipWithNext()` 역시 변환 함수와 함께 호출할 수 있으며, 이 변환 함수는 수신 객체 컬렉션의 두 요소를 인자로 받아야 합니다.

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")    
    println(numbers.zipWithNext())
    println(numbers.zipWithNext() { s1, s2 -> s1.length > s2.length})
//sampleEnd
}
```
{kotlin-runnable="true"}