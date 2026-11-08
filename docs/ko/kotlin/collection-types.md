[//]: # (title: 컬렉션 타입)

Kotlin은 세 가지 주요 컬렉션 타입을 제공합니다: [List](#list), [Set](#set), [Map](#map).
데이터를 저장하고 접근해야 하는 방식에 따라 컬렉션 타입을 선택하세요.

## List {id="list"}

[`List<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html)는 요소를 지정된 순서로 저장하며 인덱스를 통한 요소 접근을 제공합니다. 인덱스는 0부터 시작하여 `(list.size - 1)`인 `lastIndex`에서 끝납니다. 리스트는 동일한 객체에 대한 여러 참조를 포함하여 중복 요소를 포함할 수 있습니다.

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    
    println("Number of elements: ${numbers.size}")
    // Number of elements: 4
    
    println("Third element: ${numbers.get(2)}")
    // Third element: three
    
    println("Fourth element: ${numbers[3]}")
    // Fourth element: four

    println("Index of element \"two\": ${numbers.indexOf("two")}")
    // Index of element "two": 1
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

> 인덱스를 통한 접근의 성능은 리스트 구현체에 따라 달라집니다. 리스트의 모든 요소를 처리할 때는 인덱스로 요소에 반복 접근하는 것보다 반복(iteration)을 사용하는 것이 좋습니다.
>
{style="tip"}

크기가 같고 동일한 위치에 [구조적으로 동등한](equality.md#structural-equality) 요소가 있는 두 리스트는 동등합니다:

```kotlin
data class Person(var name: String, var age: Int)

fun main() {
//sampleStart
    val bob = Person("Bob", 31)
    val people = listOf(Person("Adam", 20), bob, bob)
    val people2 = listOf(Person("Adam", 20), Person("Bob", 31), bob)
    
    println(people == people2)
    // true
    
    bob.age = 32
    println(people == people2)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

[`MutableList<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/index.html)는 리스트 전용 쓰기 작업이 포함된 `List`입니다. [배열](arrays.md)과 달리, 가변 리스트는 요소를 추가하거나 제거할 때 크기를 변경할 수 있습니다. 특정 위치의 요소를 교체할 수도 있습니다. 예를 들면 다음과 같습니다:

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4)
    // 리스트에 요소를 추가합니다
    numbers.add(5)
    // 인덱스 1의 요소를 제거합니다
    numbers.removeAt(1)
    // 인덱스 0의 요소를 교체합니다
    numbers[0] = 0
    
    numbers.shuffle()
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

`MutableList`의 기본 구현체는 [`ArrayList`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-array-list/index.html)입니다.

## Set {id="set"}

[`Set<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/index.html)은 고유한(unique) 요소를 저장합니다. `Set<T>` 인터페이스는 순회 순서를 보장하지 않습니다. 순서는 구현체에 따라 달라집니다. Set은 요소 타입이 널을 허용하고 구현체가 `null`을 지원하는 경우 최대 하나의 `null` 요소를 포함할 수 있습니다.

두 Set은 크기가 같고 한 Set의 각 요소와 동등한 요소가 다른 Set에도 존재하는 경우 동등합니다:

```kotlin
fun main() {
//sampleStart
    val numbers = setOf(1, 2, 3, 4)
    println("Number of elements: ${numbers.size}")
    // Number of elements: 4
    
    if (numbers.contains(1)) println("1 is in the set")
    // 1 is in the set

    val numbersBackwards = setOf(4, 3, 2, 1)
    println("The sets are equal: ${numbers == numbersBackwards}")
    // The sets are equal: true
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

[`MutableSet<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/index.html)은 `MutableCollection`의 쓰기 작업이 포함된 `Set`입니다.

[`LinkedHashSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-linked-hash-set/index.html)은 `MutableSet`의 기본 구현체입니다. 요소의 삽입 순서를 유지합니다. 따라서 `first()` 및 `last()`와 같은 순서 의존적 함수는 예측 가능한 결과를 반환합니다:

```kotlin
fun main() {
//sampleStart
    // LinkedHashSet이 기본 구현체입니다
    val numbers = setOf(1, 2, 3, 4)
    val numbersBackwards = setOf(4, 3, 2, 1)
    
    println(numbers.first() == numbersBackwards.first())
    // false
    
    println(numbers.first() == numbersBackwards.last())
    // true
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

예측 가능한 순회 순서가 필요하지 않다면, `LinkedHashSet`보다 적은 메모리를 사용하는 대안 구현체인 [`HashSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-hash-set/index.html)을 사용할 수 있습니다. `HashSet`은 순회 순서를 보장하지 않으므로, `first()`나 `last()`가 삽입 순서대로 요소를 반환한다고 보장할 수 없습니다.

## Map {id="map"}

[`Map<K, V>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/index.html)는 `Collection` 인터페이스를 상속하지 않지만, Kotlin 컬렉션 타입 중 하나입니다. `Map`은 _키-값(key-value)_ 쌍 또는 _엔트리(entry)_를 저장합니다. 키는 고유하지만, 서로 다른 키가 동일한 값과 매핑될 수 있습니다. `Map` 인터페이스는 키로 값에 접근하기, 키 및 값 검색 등과 같은 전용 함수들을 제공합니다.

```kotlin
fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key4" to 1)
    
    println("All keys: ${numbersMap.keys}")
    // All keys: [key1, key2, key3, key4]
    
    println("All values: ${numbersMap.values}")
    // All values: [1, 2, 3, 1]
    
    if ("key2" in numbersMap) println("Value by key \"key2\": ${numbersMap["key2"]}")
    // Value by key "key2": 2
    
    if (1 in numbersMap.values) println("The value 1 is in the map")
    // The value 1 is in the map
    
    // containsValue()를 사용하여 값을 확인하며, 이전 조건식과 동일합니다
    if (numbersMap.containsValue(1)) println("The value 1 is in the map")
    // The value 1 is in the map
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

Map은 키 타입이 널을 허용하고 구현체가 `null` 키를 지원하는 경우 최대 하나의 `null` 키를 포함할 수 있습니다. `null` 값 지원 여부 또한 값 타입과 구현체에 따라 달라집니다.

두 Map은 순서와 상관없이 동일한 키-값 쌍을 포함하고 있다면 동등합니다:

```kotlin
fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key4" to 1)    
    val anotherMap = mapOf("key2" to 2, "key1" to 1, "key4" to 1, "key3" to 3)
    
    println("The maps are equal: ${numbersMap == anotherMap}")
    // The maps are equal: true
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

[`MutableMap<K, V>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/index.html)는 맵 전용 쓰기 작업이 포함된 `Map`입니다. 예를 들어, 새 키-값 쌍을 추가하거나 주어진 키와 연결된 값을 업데이트할 수 있습니다:

```kotlin
fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2)
    numbersMap.put("three", 3)
    numbersMap["one"] = 11

    println(numbersMap)
    // {one=11, two=2, three=3}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

[`LinkedHashMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-linked-hash-map/index.html)은 `MutableMap`의 기본 구현체입니다. 엔트리를 삽입한 순서를 유지합니다. 반면, [`HashMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-hash-map/index.html)은 엔트리의 순서를 보장하지 않는 대안 구현체입니다.

## ArrayDeque {id="arraydeque"}

[`ArrayDeque<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-array-deque/)는 양방향 큐(double-ended queue, deque)의 구현체입니다. 덱의 앞이나 뒤 양쪽 모두에서 요소를 추가하거나 제거할 수 있습니다. 또한 `ArrayDeque`는 Kotlin에서 스택과 큐 자료구조의 역할을 모두 수행할 수 있습니다. `ArrayDeque`는 요소를 크기 조절이 가능한 배열(resizable array)에 저장합니다:

```kotlin
fun main() {
    val deque = ArrayDeque(listOf(1, 2, 3))

    deque.addFirst(0)
    deque.addLast(4)
    println(deque)
    // [0, 1, 2, 3, 4]

    println(deque.first())
    // 0
    
    println(deque.last())
    // 4

    deque.removeFirst()
    deque.removeLast()
    println(deque)
    // [1, 2, 3]
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.4"}