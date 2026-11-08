[//]: # (title: Map 전용 연산)

[Map](collection-types.md#map)에서는 키와 값의 타입 모두 사용자가 정의합니다.
키 기반의 Map 엔트리 접근 방식을 통해 키로 값을 가져오는 것부터 키와 값을 개별적으로 필터링하는 것까지 다양한 Map 전용 처리 기능을 사용할 수 있습니다.
이 페이지에서는 표준 라이브러리에서 제공하는 Map 처리 함수들을 설명합니다.

## 키 및 값 조회 {id="retrieve-keys-and-values"}

Map에서 값을 가져오려면 [`get()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/get.html) 함수의 인자로 키를 전달해야 합니다.
단축 구문인 `[key]`도 지원됩니다. 지정한 키를 찾을 수 없는 경우 `null`을 반환합니다.
동작 방식이 약간 다른 [`getValue()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-value.html) 함수도 있습니다. 이 함수는 Map에서 키를 찾지 못하면 예외를 던집니다.
또한, 키가 없을 때의 동작을 처리할 수 있는 다음과 같은 추가 옵션도 제공됩니다.

* [`getOrElse()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-else.html): List에서와 동일하게 동작하며, 존재하지 않는 키에 대해서는 지정된 람다 함수가 반환하는 값을 반환합니다.
* [`getOrDefault()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-default.html): 키를 찾을 수 없을 때 지정된 기본값을 반환합니다.

null을 허용하는(nullable) 값을 가진 Map의 경우, 누락된 키와 `null` 값을 명시적으로 처리하는 다음 함수들을 대신 사용할 수 있습니다.

* `getOrElseIfNull()`: 키가 없거나 값이 `null`인 경우 지정된 기본값의 결과를 반환합니다.
* `getOrElseIfMissing()`: 키가 누락된 경우에만 지정된 기본값의 결과를 반환합니다.

다음은 이러한 함수들 간의 차이점을 보여주는 예제입니다.

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
//sampleStart
    val numbersMap = mapOf("one" to 1, "two" to 2, "three" to 3)
    println(numbersMap.get("one"))
    // 1

    println(numbersMap["one"])
    // 1

    println(numbersMap.getOrDefault("four", 10))
    // 10

    println(numbersMap["five"])
    // null
    
    val nullableMap = mapOf("one" to 1, "two" to null)
    println(nullableMap.getOrElseIfNull("two") { 0 })
    // 0

    println(nullableMap.getOrElseIfMissing("two") { 0 })
    // null

    // Map에 "six"가 없으므로 예외를 던집니다
    // numbersMap.getValue("six")

//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4"}

Map의 모든 키나 모든 값에 대해 연산을 수행하려면 각각 `keys`와 `values` 프로퍼티에서 이를 가져올 수 있습니다.
`keys`는 Map의 모든 키로 구성된 Set이며, `values`는 Map의 모든 값으로 구성된 컬렉션입니다.

```kotlin

fun main() {
//sampleStart
    val numbersMap = mapOf("one" to 1, "two" to 2, "three" to 3)
    println(numbersMap.keys)
    println(numbersMap.values)
//sampleEnd
}
```
{kotlin-runnable="true"}

## 필터 {id="filter"}

다른 컬렉션과 마찬가지로 [`filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html) 함수를 사용하여 Map을 [필터링](collection-filtering.md)할 수 있습니다.
Map에서 `filter()`를 호출할 때는 `Pair`를 인자로 받는 술어(predicate)를 전달합니다.
이를 통해 필터링 조건에서 키와 값을 모두 활용할 수 있습니다.

```kotlin

fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key11" to 11)
    val filteredMap = numbersMap.filter { (key, value) -> key.endsWith("1") && value > 10}
    println(filteredMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

또한 Map을 필터링하는 데 특화된 두 가지 방식이 있습니다. 바로 키를 기준으로 필터링하는 방식과 값을 기준으로 필터링하는 방식입니다.
각각에 해당하는 함수로 [`filterKeys()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-keys.html)와 [`filterValues()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter-values.html)가 제공됩니다.
두 함수 모두 주어진 조건과 일치하는 엔트리들로 구성된 새로운 Map을 반환합니다.
`filterKeys()`의 조건식은 요소의 키만 확인하고, `filterValues()`의 조건식은 값만 확인합니다.

```kotlin

fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key11" to 11)
    val filteredKeysMap = numbersMap.filterKeys { it.endsWith("1") }
    val filteredValuesMap = numbersMap.filterValues { it < 10 }

    println(filteredKeysMap)
    println(filteredValuesMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

## Plus 및 minus 연산자 {id="plus-and-minus-operators"}

요소에 대한 키 기반 접근 방식 때문에 [`plus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus.html) (`+`) 및 [`minus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus.html) (`-`) 연산자는 Map에서 다른 컬렉션과 다르게 동작합니다.
`plus`는 좌변의 `Map`과 우변의 `Pair` 또는 또 다른 `Map`이라는 두 피연산자의 요소를 모두 포함하는 `Map`을 반환합니다.
우변 피연산자에 좌변 `Map`에 이미 존재하는 키를 가진 엔트리가 포함되어 있다면, 결과 Map에는 우변의 엔트리가 포함됩니다.

```kotlin

fun main() {
//sampleStart
    val numbersMap = mapOf("one" to 1, "two" to 2, "three" to 3)
    println(numbersMap + Pair("four", 4))
    println(numbersMap + Pair("one", 10))
    println(numbersMap + mapOf("five" to 5, "one" to 11))
//sampleEnd
}
```
{kotlin-runnable="true"}

`minus`는 좌변의 `Map` 엔트리 중 우변 피연산자에 지정된 키를 가진 엔트리를 제외한 `Map`을 생성합니다.
따라서 우변 피연산자에는 단일 키가 오거나 List, Set 등의 키 컬렉션이 올 수 있습니다.

```kotlin

fun main() {
//sampleStart
    val numbersMap = mapOf("one" to 1, "two" to 2, "three" to 3)
    println(numbersMap - "one")
    println(numbersMap - listOf("two", "four"))
//sampleEnd
}
```
{kotlin-runnable="true"}

가변(mutable) Map에서 [`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html) (`+=`) 및 [`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html) (`-=`) 연산자를 사용하는 방법에 대한 자세한 내용은 아래의 [Map 쓰기 연산](#map-write-operations)을 참고하세요.

## Map 쓰기 연산 {id="map-write-operations"}

[가변(Mutable)](collections-overview.md#read-only-and-mutable-collections) Map은 Map 전용 쓰기 연산을 제공합니다.
이러한 연산을 사용하면 값에 대한 키 기반 접근을 통해 Map의 내용을 변경할 수 있습니다.

Map의 쓰기 연산을 정의하는 몇 가지 규칙이 있습니다.

* 값은 업데이트할 수 있습니다. 반면 키는 절대 변경되지 않습니다. 즉, 엔트리를 추가하면 해당 키는 불변입니다.
* 각 키에는 항상 단 하나의 값만 연결됩니다. 엔트리 전체를 추가하거나 제거할 수 있습니다.

아래는 가변 Map에서 사용할 수 있는 표준 라이브러리 쓰기 연산 함수에 대한 설명입니다.

### 엔트리 추가 및 업데이트 {id="add-and-update-entries"}

가변 Map에 새로운 키-값 쌍을 추가하려면 [`put()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/put.html)을 사용합니다.
새로운 엔트리가 `LinkedHashMap`(기본 Map 구현체)에 추가되면, Map을 순회할 때 가장 마지막에 나오도록 추가됩니다. 정렬된 Map의 경우 새 요소의 위치는 키의 순서에 따라 결정됩니다.

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2)
    numbersMap.put("three", 3)
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

한 번에 여러 엔트리를 추가하려면 [`putAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/put-all.html)을 사용합니다.
이 함수의 인자로는 `Map`이나 `Iterable`, `Sequence`, `Array` 같은 `Pair` 그룹이 올 수 있습니다.

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2, "three" to 3)
    numbersMap.putAll(setOf("four" to 4, "five" to 5))
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

`put()`과 `putAll()` 모두 주어진 키가 이미 Map에 존재하면 값을 덮어씁니다. 따라서 이 함수들을 사용하여 Map 엔트리의 값을 업데이트할 수 있습니다.

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2)
    val previousValue = numbersMap.put("one", 11)
    println("value associated with 'one', before: $previousValue, after: ${numbersMap["one"]}")
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

단축 연산자 형태를 사용하여 Map에 새 엔트리를 추가할 수도 있습니다. 두 가지 방법이 있습니다.

* [`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html) (`+=`) 연산자
* `set()`의 별칭인 `[]` 연산자

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2)
    numbersMap["three"] = 3     // numbersMap.put("three", 3)을 호출합니다
    numbersMap += mapOf("four" to 4, "five" to 5)
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

Map에 이미 존재하는 키로 호출하면, 연산자는 해당 엔트리의 값을 덮어씁니다.

#### 누락된 엔트리에 기본값 추가 {id="add-default-values-for-missing-entries"}

기존 값을 반환하거나, 사용할 수 있는 값이 없을 때 기본값을 추가하려면 [`.getOrPut()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/get-or-put.html) 확장 함수를 사용합니다.
키가 없거나 값이 `null`인 경우 `.getOrPut()`은 기본값을 저장하고 해당 값을 반환합니다.

null을 허용하는 값을 가진 Map의 경우, `.getOrPutIfNull()` 및 `.getOrPutIfMissing()` 함수를 사용하여 `null` 값을 처리하는 방식을 제어할 수 있습니다.

* `getOrPutIfNull()`: `getOrPut()`과 유사하게 동작하며, 키가 누락되었거나 값이 `null`인 경우 기본값을 사용합니다.
* `getOrPutIfMissing()`: 키가 누락된 경우에만 기본값을 사용합니다.

`getOrPutIfNull()` 및 `getOrPutIfMissing()` 함수는 [실험적(Experimental)](components-stability.md#stability-levels-explained) 기능입니다.
사용하려면 `@OptIn(ExperimentalStdlibApi::class)` 애너테이션을 적용해야 합니다.

다음은 예제입니다.

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
//sampleStart
    val mapForNull = mutableMapOf<String, Int?>("one" to null)
    val mapForMissing = mutableMapOf<String, Int?>("one" to null)

    // "one"이 null 값을 가지므로 값을 대체합니다
    mapForNull.getOrPutIfNull("one") { 1 }

    println(mapForNull)
    // {one=1}

    // "one"이 Map에 존재하므로 null 값을 유지합니다
    mapForMissing.getOrPutIfMissing("one") { 1 }

    println(mapForMissing)
    // {one=null}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4"}

### 엔트리 제거 {id="remove-entries"}

가변 Map에서 엔트리를 제거하려면 [`remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/remove.html) 함수를 사용합니다.
`remove()`를 호출할 때는 키만 전달하거나 키-값 쌍 전체를 전달할 수 있습니다.
키와 값을 모두 지정하는 경우, 해당 키를 가진 요소의 값이 두 번째 인자와 일치할 때만 제거됩니다.

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2, "three" to 3)
    numbersMap.remove("one")
    println(numbersMap)
    numbersMap.remove("three", 4)            // 아무것도 제거되지 않습니다
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

키나 값을 기준으로 가변 Map에서 엔트리를 제거할 수도 있습니다.
이를 수행하려면 Map의 `keys`나 `values`에 대해 엔트리의 키 또는 값을 전달하여 `remove()`를 호출합니다.
`values`에 대해 호출하는 경우, `remove()`는 주어진 값을 가진 첫 번째 엔트리만 제거합니다.

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2, "three" to 3, "threeAgain" to 3)
    numbersMap.keys.remove("one")
    println(numbersMap)
    numbersMap.values.remove(3)
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

가변 Map에서는 [`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html) (`-=`) 연산자도 사용할 수 있습니다.

```kotlin

fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2, "three" to 3)
    numbersMap -= "two"
    println(numbersMap)
    numbersMap -= "five"             // 아무것도 제거되지 않습니다
    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}