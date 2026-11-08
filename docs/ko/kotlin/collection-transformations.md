[//]: # (title: 컬렉션 변환)

Kotlin 표준 라이브러리는 컬렉션의 *변환(transformation)*을 위한 다양한 확장 함수 세트를 제공합니다.
이러한 함수들은 주어진 변환 규칙에 따라 기존 컬렉션을 기반으로 새로운 컬렉션을 생성합니다.
이 페이지에서는 사용 가능한 컬렉션 변환 함수들에 대한 개요를 살펴봅니다.

## Map {id="map"}

*매핑(mapping)* 변환은 다른 컬렉션의 요소들에 함수를 적용한 결과를 바탕으로 컬렉션을 생성합니다.
기본 매핑 함수는 [`map()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map.html)입니다.
이 함수는 주어진 람다 함수를 각 요소에 순차적으로 적용하고, 람다의 반환 결과들로 구성된 리스트를 반환합니다.
결과의 순서는 원래 요소의 순서와 동일합니다.
요소의 인덱스를 추가 인수로 사용하는 변환을 적용하려면 [`mapIndexed()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-indexed.html)를 사용하세요.

```kotlin

fun main() {
//sampleStart
    val numbers = setOf(1, 2, 3)
    println(numbers.map { it * 3 })
    println(numbers.mapIndexed { idx, value -> value * idx })
//sampleEnd
}
```
{kotlin-runnable="true"}

변환 결과 특정 요소에서 `null`이 생성되는 경우, `map()` 대신 [`mapNotNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-not-null.html) 함수를 호출하거나 `mapIndexed()` 대신 [`mapIndexedNotNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-indexed-not-null.html)을 호출하여 결과 컬렉션에서 `null`을 필터링할 수 있습니다.

```kotlin

fun main() {
//sampleStart
    val numbers = setOf(1, 2, 3)
    println(numbers.mapNotNull { if ( it == 2) null else it * 3 })
    println(numbers.mapIndexedNotNull { idx, value -> if (idx == 0) null else value * idx })
//sampleEnd
}
```
{kotlin-runnable="true"}

맵(Map)을 변환할 때는 두 가지 옵션이 있습니다. 값(value)은 그대로 두고 키(key)만 변환하거나, 그 반대로 변환하는 것입니다.
키에 특정 변환을 적용하려면 [`mapKeys()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-keys.html)를 사용하고,
반대로 값을 변환하려면 [`mapValues()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-values.html)를 사용합니다.
두 함수 모두 맵 엔트리(map entry)를 인수로 받는 변환 함수를 사용하므로, 키와 값을 모두 활용하여 변환 작업을 수행할 수 있습니다.

```kotlin

fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key11" to 11)
    println(numbersMap.mapKeys { it.key.uppercase() })
    println(numbersMap.mapValues { it.value + it.key.length })
//sampleEnd
}
```
{kotlin-runnable="true"}

## Zip {id="zip"}

*Zipping* 변환은 두 컬렉션에서 동일한 위치에 있는 요소들로 쌍(pair)을 구성하는 것입니다.
Kotlin 표준 라이브러리에서는 [`zip()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/zip.html) 확장 함수를 통해 이를 수행합니다.

컬렉션이나 배열에서 다른 컬렉션(또는 배열)을 인수로 전달하여 `zip()`을 호출하면 `Pair` 객체들의 `List`가 반환됩니다. 수신 객체 컬렉션의 요소들이 이 쌍들의 첫 번째 요소가 됩니다.

두 컬렉션의 크기가 서로 다른 경우, `zip()`의 결과는 더 작은 크기에 맞춰지며 더 큰 컬렉션의 나머지 요소들은 결과에 포함되지 않습니다.

`zip()`은 중위 함수(infix) 형태인 `a zip b`로도 호출할 수 있습니다.

```kotlin

fun main() {
//sampleStart
    val colors = listOf("red", "brown", "grey")
    val animals = listOf("fox", "bear", "wolf")
    println(colors zip animals)

    val twoAnimals = listOf("fox", "bear")
    println(colors.zip(twoAnimals))
//sampleEnd
}
```
{kotlin-runnable="true"}

수신 객체 요소와 인수 요소를 두 개의 파라미터로 받는 변환 함수와 함께 `zip()`을 호출할 수도 있습니다. 이 경우 결과 `List`는 동일한 위치에 있는 수신 객체와 인수 요소 쌍에 변환 함수를 호출하여 얻은 반환 값들을 포함합니다.

```kotlin

fun main() {
//sampleStart
    val colors = listOf("red", "brown", "grey")
    val animals = listOf("fox", "bear", "wolf")
    
    println(colors.zip(animals) { color, animal -> "The ${animal.replaceFirstChar { it.uppercase() }} is $color"})
//sampleEnd
}
```
{kotlin-runnable="true"}

`Pair`로 이루어진 `List`가 있다면, 역변환인 *언지핑(unzipping)*을 통해 이 쌍들로부터 두 개의 리스트를 만들어낼 수 있습니다.

* 첫 번째 리스트는 원본 리스트에 있는 각 `Pair`의 첫 번째 요소들을 포함합니다.
* 두 번째 리스트는 두 번째 요소들을 포함합니다.

쌍으로 이루어진 리스트를 언지핑하려면 [`unzip()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/unzip.html)을 호출하세요.

```kotlin

fun main() {
//sampleStart
    val numberPairs = listOf("one" to 1, "two" to 2, "three" to 3, "four" to 4)
    println(numberPairs.unzip())
//sampleEnd
}
```
{kotlin-runnable="true"}

## Associate {id="associate"}

*연관(Association)* 변환을 사용하면 컬렉션 요소와 그에 연결된 특정 값을 기반으로 맵을 생성할 수 있습니다.
다양한 연관 유형에서 요소는 연관 맵의 키가 될 수도 있고 값이 될 수도 있습니다.

기본 연관 함수인 [`associateWith()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate-with.html)는 원본 컬렉션의 요소를 키로 사용하고, 주어진 변환 함수를 통해 요소로부터 값을 생성하는 `Map`을 만듭니다. 두 요소가 같다면 마지막 요소만 맵에 유지됩니다.

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    println(numbers.associateWith { it.length })
//sampleEnd
}
```
{kotlin-runnable="true"}

컬렉션 요소를 값으로 사용하는 맵을 생성하기 위해 [`associateBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate-by.html) 함수가 제공됩니다.
이 함수는 요소의 값을 기반으로 키를 반환하는 함수를 인수로 받습니다. 두 요소의 키가 동일하면 마지막 요소만 맵에 유지됩니다.

`associateBy()`는 값 변환 함수와 함께 호출할 수도 있습니다.

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")

    println(numbers.associateBy { it.first().uppercaseChar() })
    println(numbers.associateBy(keySelector = { it.first().uppercaseChar() }, valueTransform = { it.length }))
//sampleEnd
}
```
{kotlin-runnable="true"}

컬렉션 요소로부터 키와 값을 모두 생성하여 맵을 구성하는 또 다른 방법은 [`associate()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate.html) 함수를 사용하는 것입니다.
이 함수는 해당하는 맵 엔트리의 키와 값으로 이루어진 `Pair`를 반환하는 람다 함수를 인수로 받습니다.

`associate()`는 성능에 영향을 줄 수 있는 단명(short-living) `Pair` 객체를 생성한다는 점에 유의하세요.
따라서 `associate()`는 성능이 크게 중요하지 않거나 다른 옵션보다 더 적합한 경우에 사용해야 합니다.

후자의 예로는 하나의 요소로부터 키와 해당하는 값이 함께 생성되는 경우가 있습니다.

```kotlin

fun main() {
data class FullName (val firstName: String, val lastName: String)

fun parseFullName(fullName: String): FullName {
    val nameParts = fullName.split(" ")
    if (nameParts.size == 2) {
        return FullName(nameParts[0], nameParts[1])
    } else throw Exception("Wrong name format")
}

//sampleStart
    val names = listOf("Alice Adams", "Brian Brown", "Clara Campbell")
    println(names.associate { name -> parseFullName(name).let { it.lastName to it.firstName } })  
//sampleEnd
}
```
{kotlin-runnable="true"}

여기서는 먼저 요소에 변환 함수를 호출한 다음, 그 결과의 프로퍼티로부터 쌍을 생성합니다.

## Flatten {id="flatten"}

중첩된 컬렉션을 다룰 때 중첩 컬렉션의 요소에 평탄하게(flat) 접근할 수 있도록 돕는 표준 라이브러리 함수가 유용할 수 있습니다.

첫 번째 함수는 [`flatten()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/flatten.html)입니다.
컬렉션들의 컬렉션(예: `Set`들의 `List`)에서 이 함수를 호출할 수 있습니다.
이 함수는 중첩 컬렉션의 모든 요소를 담은 단일 `List`를 반환합니다.

```kotlin

fun main() {
//sampleStart
    val numberSets = listOf(setOf(1, 2, 3), setOf(4, 5, 6), setOf(1, 2))
    println(numberSets.flatten())
//sampleEnd
}
```
{kotlin-runnable="true"}

또 다른 함수인 [`flatMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/flat-map.html)은 중첩 컬렉션을 처리하는 유연한 방법을 제공합니다. 이 함수는 컬렉션 요소를 다른 컬렉션으로 매핑하는 함수를 인수로 받습니다.
그 결과로 `flatMap()`은 모든 요소에 대한 반환 값들을 하나의 단일 리스트로 반환합니다.
즉, `flatMap()`은 (컬렉션을 매핑 결과로 반환하는) `map()`과 `flatten()`을 연속으로 호출한 것과 같이 동작합니다.

```kotlin

data class StringContainer(val values: List<String>)

fun main() {
//sampleStart
    val containers = listOf(
        StringContainer(listOf("one", "two", "three")),
        StringContainer(listOf("four", "five", "six")),
        StringContainer(listOf("seven", "eight"))
    )
    println(containers.flatMap { it.values })
//sampleEnd
}

```
{kotlin-runnable="true"}

## 문자열 표현 {id="string-representation"}

컬렉션의 내용을 읽기 쉬운 형식으로 조회해야 하는 경우, 컬렉션을 문자열로 변환하는 함수인 [`joinToString()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/join-to-string.html)과 [`joinTo()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/join-to.html)를 사용하세요.

`joinToString()`은 제공된 인수들을 기반으로 컬렉션 요소로부터 단일 `String`을 생성합니다.
`joinTo()`도 동일한 작업을 수행하지만, 결과를 지정된 [`Appendable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-appendable/index.html) 객체에 덧붙입니다.

파라미터의 기본값을 사용하여 호출하면, 컬렉션에서 `toString()`을 호출한 것과 유사한 결과를 반환합니다.
즉, 쉼표와 공백으로 구분된 요소들의 문자열 표현으로 이루어진 `String`입니다.

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    
    println(numbers)         
    println(numbers.joinToString())
    
    val listString = StringBuffer("The list of numbers: ")
    numbers.joinTo(listString)
    println(listString)
//sampleEnd
}
```
{kotlin-runnable="true"}

사용자 정의 문자열 표현을 만들려면 함수의 인수 `separator`, `prefix`, `postfix`를 지정할 수 있습니다. 결과 문자열은 `prefix`로 시작하고 `postfix`로 끝납니다. `separator`는 마지막 요소를 제외한 각 요소 뒤에 붙습니다.

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")    
    println(numbers.joinToString(separator = " | ", prefix = "start: ", postfix = ": end"))
//sampleEnd
}
```
{kotlin-runnable="true"}

크기가 큰 컬렉션의 경우 결과에 포함될 요소의 개수인 `limit`을 지정할 수 있습니다.
컬렉션 크기가 `limit`을 초과하면 나머지 모든 요소는 `truncated` 인수의 단일 값으로 대체됩니다.

```kotlin

fun main() {
//sampleStart
    val numbers = (1..100).toList()
    println(numbers.joinToString(limit = 10, truncated = "<...>"))
//sampleEnd
}
```
{kotlin-runnable="true"}

마지막으로, 요소 자체의 표현 방식을 커스터마이즈하려면 `transform` 함수를 제공하면 됩니다.

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    println(numbers.joinToString { "Element: ${it.uppercase()}"})
//sampleEnd
}
```
{kotlin-runnable="true"}