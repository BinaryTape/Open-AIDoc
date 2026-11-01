[//]: # (title: 단일 요소 조회)

Kotlin 컬렉션은 컬렉션에서 단일 요소를 조회할 수 있는 여러 함수를 제공합니다.
이 페이지에서 설명하는 함수는 리스트와 세트(set) 모두에 적용됩니다.

[리스트의 정의](collections-overview.md)에서 알 수 있듯이, 리스트는 순서가 있는 컬렉션입니다.
따라서 리스트의 모든 요소는 참조에 사용할 수 있는 고유한 위치를 갖습니다.
이 페이지에 설명된 함수 외에도, 리스트는 인덱스를 통해 요소를 조회하고 검색할 수 있는 더 다양한 방법을 제공합니다.
자세한 내용은 [리스트 전용 연산](list-operations.md)을 참조하세요.

반면 세트는 [정의](collections-overview.md)상 순서가 없는 컬렉션입니다.
하지만 Kotlin의 `Set`은 특정 순서로 요소를 저장합니다.
이는 삽입 순서(`LinkedHashSet`), 자연스러운 정렬 순서(`SortedSet`), 또는 다른 순서일 수 있습니다.
세트 요소의 순서를 알 수 없는 경우도 있습니다.
이러한 경우에도 요소들은 어쨌든 정렬되어 있으므로, 요소 위치에 의존하는 함수는 여전히 결과를 반환합니다.
그러나 사용된 `Set`의 구체적인 구현을 알지 못한다면 호출자 입장에서는 이러한 결과를 예측할 수 없습니다.

## 위치로 조회 {id="retrieve-by-position"}

특정 위치의 요소를 조회하려면 [`elementAt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/element-at.html) 함수가 있습니다.
정수를 인자로 넣어 호출하면 지정된 위치에 있는 컬렉션 요소를 반환합니다.
첫 번째 요소의 위치는 `0`이고, 마지막 요소의 위치는 `(size - 1)`입니다.
 
`elementAt()`은 인덱스를 통한 접근을 제공하지 않거나, 인덱스 접근을 제공하는지 정적으로 알 수 없는 컬렉션에 유용합니다.
`List`의 경우에는 [인덱스 접근 연산자](list-operations.md#retrieve-elements-by-index)(`get()` 또는 `[]`)를 사용하는 것이 더 관용적입니다.

```kotlin

fun main() {
//sampleStart
    val numbers = linkedSetOf("one", "two", "three", "four", "five")
    println(numbers.elementAt(3))    

    val numbersSortedSet = sortedSetOf("one", "two", "three", "four")
    println(numbersSortedSet.elementAt(0)) // 요소가 오름차순으로 저장됩니다
//sampleEnd
}
```
{kotlin-runnable="true"}

컬렉션의 첫 번째와 마지막 요소를 조회할 수 있는 유용한 별칭 함수도 있습니다: [`first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html)
및 [`last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html).

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")
    println(numbers.first())    
    println(numbers.last())    
//sampleEnd
}
```
{kotlin-runnable="true"}

존재하지 않는 위치의 요소를 조회할 때 발생하는 예외를 방지하려면 `elementAt()`의 안전한 변형 함수를 사용하세요:

* [`elementAtOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/element-at-or-null.html)은 지정된 위치가 컬렉션의 범위를 벗어나면 `null`을 반환합니다.
* [`elementAtOrElse()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/element-at-or-else.html)는 추가로 `Int` 인자를 컬렉션 요소 타입의 인스턴스로 매핑하는 람다 함수를 받습니다.
   범위를 벗어난 위치로 호출되면 `elementAtOrElse()`는 주어진 값에 대한 람다의 결과를 반환합니다.

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")
    println(numbers.elementAtOrNull(5))
    println(numbers.elementAtOrElse(5) { index -> "The value for index $index is undefined"})
//sampleEnd
}
```
{kotlin-runnable="true"}

## 조건으로 조회 {id="retrieve-by-condition"}

[`first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) 및 [`last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html) 함수를
사용하면 주어진 조건식(predicate)과 일치하는 요소를 컬렉션에서 검색할 수도 있습니다. 컬렉션 요소를
검사하는 조건식과 함께 `first()`를 호출하면 조건식이 `true`를 반환하는 첫 번째 요소를 얻을 수 있습니다.
반대로 조건식과 함께 호출된 `last()`는 일치하는 마지막 요소를 반환합니다. 

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five", "six")
    println(numbers.first { it.length > 3 })
    println(numbers.last { it.startsWith("f") })
//sampleEnd
}
```
{kotlin-runnable="true"}

조건식과 일치하는 요소가 없으면 두 함수 모두 예외를 던집니다.
이를 방지하려면 대신 [`firstOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-or-null.html)
및 [`lastOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last-or-null.html)을 사용하세요.
일치하는 요소를 찾지 못하면 `null`을 반환합니다.

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five", "six")
    println(numbers.firstOrNull { it.length > 6 })
//sampleEnd
}
```
{kotlin-runnable="true"}

이름이 상황에 더 적합하다면 별칭 함수를 사용할 수 있습니다:

* `firstOrNull()` 대신 [`find()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/find.html)
* `lastOrNull()` 대신 [`findLast()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/find-last.html)

```kotlin

fun main() {
//sampleStart
    val numbers = listOf(1, 2, 3, 4)
    println(numbers.find { it % 2 == 0 })
    println(numbers.findLast { it % 2 == 0 })
//sampleEnd
}
```
{kotlin-runnable="true"}

## 선택자로 조회 {id="retrieve-with-selector"}

요소를 조회하기 전에 컬렉션을 매핑해야 한다면 [`firstNotNullOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-not-null-of.html) 함수를 사용할 수 있습니다.
이 함수는 두 가지 동작을 결합합니다:
- 선택자(selector) 함수로 컬렉션을 매핑
- 결과에서 첫 번째 non-null 값을 반환

결과 컬렉션에 null이 아닌 요소가 없다면 `firstNotNullOf()`는 `NoSuchElementException`을 던집니다. 
이 경우 null을 반환하려면 대안 함수인 [`firstNotNullOfOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-not-null-of-or-null.html)을
사용하세요.

```kotlin
fun main() {
//sampleStart
    val list = listOf<Any>(0, "true", false)
    // 각 요소를 문자열로 변환하고 필요한 길이를 만족하는 첫 번째 요소를 반환합니다
    val longEnough = list.firstNotNullOf { item -> item.toString().takeIf { it.length >= 4 } }
    println(longEnough)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

## 임의의 요소 조회 {id="random-element"}

컬렉션에서 임의의 요소를 가져와야 한다면 [`random()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/random.html) 함수를 호출하세요.
인자 없이 호출하거나 난수 생성 소스로 [`Random`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.random/-random/index.html)
객체를 전달하여 호출할 수 있습니다.

```kotlin

fun main() {
//sampleStart
    val numbers = listOf(1, 2, 3, 4)
    println(numbers.random())
//sampleEnd
}
```
{kotlin-runnable="true"}

빈 컬렉션에서 `random()`은 예외를 던집니다. 대신 `null`을 받으려면 [`randomOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/random-or-null.html)을 사용하세요.

## 요소 존재 여부 확인 {id="check-element-existence"}

컬렉션에 요소가 존재하는지 확인하려면 [`contains()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/contains.html) 함수를 사용하세요.
함수 인자와 `equals()`가 성립하는 컬렉션 요소가 있으면 `true`를 반환합니다.
`contains()`는 `in` 키워드를 사용하여 연산자 형태로 호출할 수도 있습니다.

여러 인스턴스가 한 번에 존재하는지 확인하려면 해당 인스턴스들의 컬렉션을 인자로 전달하여 [`containsAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/contains-all.html)을
호출하세요.

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five", "six")
    println(numbers.contains("four"))
    println("zero" in numbers)
    
    println(numbers.containsAll(listOf("four", "two")))
    println(numbers.containsAll(listOf("one", "zero")))
//sampleEnd
}
```
{kotlin-runnable="true"}

또한, [`isEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-empty.html)
또는 [`isNotEmpty()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/is-not-empty.html)를 호출하여 컬렉션에 요소가 있는지 확인할 수 있습니다. 

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five", "six")
    println(numbers.isEmpty())
    println(numbers.isNotEmpty())
    
    val empty = emptyList<String>()
    println(empty.isEmpty())
    println(empty.isNotEmpty())
//sampleEnd
}
```
{kotlin-runnable="true"}