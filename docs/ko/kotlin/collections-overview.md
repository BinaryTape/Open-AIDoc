[//]: # (title: 컬렉션 개요)

Kotlin 표준 라이브러리는 해결하려는 문제에서 유의미하고 일반적으로 다뤄지는 가변적인 개수(0개일 수도 있음)의 항목 그룹인 _컬렉션(collection)_을 관리하기 위한 종합적인 도구 모음을 제공합니다.

컬렉션은 대부분의 프로그래밍 언어에서 공통적인 개념이므로, 예를 들어 Java나 Python 컬렉션에 익숙하다면 이 소개 부분을 건너뛰고 세부 섹션으로 이동해도 좋습니다.

컬렉션은 대개 동일한 타입(및 그 하위 타입)의 여러 객체를 포함합니다. 컬렉션에 포함된 객체를 _요소(element)_ 또는 _아이템(item)_이라고 부릅니다. 예를 들어, 한 학과의 모든 학생은 그들의 평균 나이를 계산하는 데 사용할 수 있는 컬렉션을 형성합니다.

Kotlin에서는 다음과 같은 컬렉션 타입을 제공합니다.

* _List_는 인덱스(위치를 나타내는 정수)를 통해 요소에 접근할 수 있는 순서가 있는 컬렉션입니다. 요소는 리스트 내에서 두 번 이상 나타날 수 있습니다. 리스트의 한 예로 전화번호를 들 수 있습니다. 전화번호는 숫자의 그룹이며, 순서가 중요하고, 숫자가 반복될 수 있습니다.
* _Set_은 고유한(unique) 요소들의 컬렉션입니다. 중복이 없는 객체 그룹이라는 수학의 집합 개념을 반영합니다. 일반적으로 세트 요소의 순서는 중요하지 않습니다. 예를 들어 복권 번호는 세트를 형성합니다. 번호는 고유하며 순서는 중요하지 않습니다.
* _Map_(또는 _딕셔너리_)은 키-값(key-value) 쌍의 집합입니다. 키는 고유하며 각 키는 정확히 하나의 값에 매핑됩니다. 값은 중복될 수 있습니다. 맵은 직원의 ID와 직책처럼 객체 간의 논리적 연결을 저장하는 데 유용합니다.

Kotlin을 사용하면 컬렉션에 저장된 객체의 정확한 타입과 무관하게 컬렉션을 조작할 수 있습니다. 즉, `Int`나 사용자 정의 클래스를 다루는 것과 동일한 방식으로 `String` 리스트에 `String`을 추가할 수 있습니다.
따라서 Kotlin 표준 라이브러리는 모든 타입의 컬렉션을 생성하고, 채우고, 관리하기 위한 제네릭 인터페이스, 클래스 및 함수를 제공합니다.

컬렉션 인터페이스와 관련 함수들은 `kotlin.collections` 패키지에 있습니다. 그 내용을 전반적으로 살펴보겠습니다.

> 배열(Array)은 컬렉션 타입이 아닙니다. 자세한 내용은 [배열](arrays.md)을 참조하세요.
>
{style="note"}

## 컬렉션 타입 {id="collection-types"}

Kotlin 표준 라이브러리는 세트, 리스트, 맵과 같은 기본 컬렉션 타입에 대한 구현을 제공합니다.
각 컬렉션 타입은 한 쌍의 인터페이스로 표현됩니다.

* 컬렉션 요소에 접근하기 위한 연산을 제공하는 _읽기 전용(read-only)_ 인터페이스
* 요소를 추가, 제거 및 업데이트하는 쓰기 연산을 통해 해당 읽기 전용 인터페이스를 확장하는 _가변(mutable)_ 인터페이스

가변 컬렉션이라고 해서 반드시 [`var`](basic-syntax.md#variables)에 할당해야 하는 것은 아닙니다. `val`에 할당하더라도 가변 컬렉션을 통한 쓰기 작업은 여전히 가능합니다. 가변 컬렉션을 `val`에 할당할 때의 이점은 가변 컬렉션에 대한 참조가 수정되지 않도록 보호할 수 있다는 것입니다. 시간이 지나 코드가 커지고 복잡해질수록 참조가 의도치 않게 수정되는 것을 방지하는 것이 훨씬 더 중요해집니다. 더 안전하고 견고한 코드를 위해 가능한 한 `val`을 사용하세요. `val` 컬렉션에 재할당을 시도하면 컴파일 오류가 발생합니다.

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four")
    numbers.add("five")   // 가능합니다
    println(numbers)
    //numbers = mutableListOf("six", "seven")      // 컴파일 오류
//sampleEnd

}
```
{kotlin-runnable="true"}

읽기 전용 컬렉션 타입은 [공변(covariant)](generics.md#variance)합니다.
즉, `Rectangle` 클래스가 `Shape`를 상속받는 경우, `List<Shape>`가 필요한 모든 곳에 `List<Rectangle>`을 사용할 수 있습니다.
다시 말해 컬렉션 타입은 요소 타입과 동일한 서브타이핑 관계를 가집니다. 맵은 값 타입에 대해서는 공변하지만, 키 타입에 대해서는 공변하지 않습니다.

반면, 가변 컬렉션은 공변하지 않습니다. 공변할 경우 런타임 오류로 이어질 수 있기 때문입니다. 만약 `MutableList<Rectangle>`이 `MutableList<Shape>`의 하위 타입이라면, 다른 `Shape`의 하위 클래스(예: `Circle`)를 삽입할 수 있게 되어 `Rectangle` 타입 인수를 위반하게 됩니다.

아래는 Kotlin 컬렉션 인터페이스의 다이어그램입니다.

![컬렉션 인터페이스 계층 구조](collections-diagram.png){width="500"}

인터페이스와 그 구현체들을 살펴보겠습니다. `Collection`에 대해 알아보려면 아래 섹션을 읽어보세요. `List`, `Set`, `Map`에 대해 알아보려면 해당 섹션을 읽거나 Kotlin 디벨로퍼 애드버킷(Developer Advocate)인 Sebastian Aigner의 비디오를 시청할 수 있습니다.

<video src="https://www.youtube.com/v/F8jj7e-_jFA" title="Kotlin Collections Overview"/>

### Collection {id="collection"}

[`Collection<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-collection/index.html)는 컬렉션 계층 구조의 루트입니다. 이 인터페이스는 크기 조회, 항목 포함 여부 확인 등 읽기 전용 컬렉션의 공통 동작을 나타냅니다.
`Collection`은 요소를 순회하기 위한 연산을 정의하는 `Iterable<T>` 인터페이스를 상속합니다. 다양한 컬렉션 타입에 적용되는 함수의 파라미터로 `Collection`을 사용할 수 있습니다. 더 구체적인 사례의 경우 `Collection`의 하위 인터페이스인 [`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html) 및 [`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/index.html)을 사용하세요.

```kotlin
fun printAll(strings: Collection<String>) {
    for(s in strings) print("$s ")
    println()
}
    
fun main() {
    val stringList = listOf("one", "two", "one")
    printAll(stringList)
    
    val stringSet = setOf("one", "two", "three")
    printAll(stringSet)
}
```
{kotlin-runnable="true"}

[`MutableCollection<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-collection/index.html)는 `add` 및 `remove`와 같은 쓰기 연산이 포함된 `Collection`입니다.

```kotlin
fun List<String>.getShortWordsTo(shortWords: MutableList<String>, maxLength: Int) {
    this.filterTo(shortWords) { it.length <= maxLength }
    // 관사 제외
    val articles = setOf("a", "A", "an", "An", "the", "The")
    shortWords -= articles
}

fun main() {
    val words = "A long time ago in a galaxy far far away".split(" ")
    val shortWords = mutableListOf<String>()
    words.getShortWordsTo(shortWords, 3)
    println(shortWords)
}
```
{kotlin-runnable="true"}

### List {id="list"}

[`List<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html)는 지정된 순서로 요소를 저장하며, 인덱스를 통한 요소 접근을 제공합니다. 인덱스는 첫 번째 요소의 인덱스인 0부터 시작하여 `(list.size - 1)`인 `lastIndex`까지 이어집니다.

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    println("Number of elements: ${numbers.size}")
    println("Third element: ${numbers.get(2)}")
    println("Fourth element: ${numbers[3]}")
    println("Index of element \"two\" ${numbers.indexOf("two")}")
//sampleEnd
}
```
{kotlin-runnable="true"}

리스트 요소(null 포함)는 중복될 수 있습니다. 즉, 리스트에는 동일한 객체가 몇 개든 포함될 수 있으며, 단일 객체가 여러 번 나타날 수도 있습니다.
두 리스트는 크기가 같고 동일한 위치에 [구조적으로 동등한(structurally equal)](equality.md#structural-equality) 요소가 있는 경우 동등한 것으로 간주됩니다.

```kotlin
data class Person(var name: String, var age: Int)

fun main() {
//sampleStart
    val bob = Person("Bob", 31)
    val people = listOf(Person("Adam", 20), bob, bob)
    val people2 = listOf(Person("Adam", 20), Person("Bob", 31), bob)
    println(people == people2)
    bob.age = 32
    println(people == people2)
//sampleEnd
}
```
{kotlin-runnable="true"}

[`MutableList<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/index.html)는 특정 위치에 요소를 추가하거나 제거하는 등 리스트 전용 쓰기 연산이 포함된 `List`입니다.

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4)
    numbers.add(5)
    numbers.removeAt(1)
    numbers[0] = 0
    numbers.shuffle()
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

보시다시피 리스트는 어떤 면에서 배열과 매우 유사합니다.
하지만 한 가지 중요한 차이점이 있습니다. 배열의 크기는 초기화 시점에 정의되며 절대 변경되지 않습니다. 반면 리스트는 미리 정의된 크기가 없으며, 요소 추가, 업데이트, 제거와 같은 쓰기 연산의 결과로 리스트의 크기가 변경될 수 있습니다.

Kotlin에서 `MutableList`의 기본 구현체는 크기 조절이 가능한 배열로 생각할 수 있는 [`ArrayList`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-array-list/index.html)입니다.

### Set {id="set"}

[`Set<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/index.html)는 고유한 요소를 저장하며, 일반적으로 순서가 정의되지 않습니다. `null` 요소 또한 고유하므로 `Set`에는 단 하나의 `null`만 포함될 수 있습니다.
두 세트는 크기가 같고 한 세트의 각 요소에 대해 다른 세트에 동등한 요소가 있는 경우 동등합니다.

```kotlin
fun main() {
//sampleStart
    val numbers = setOf(1, 2, 3, 4)
    println("Number of elements: ${numbers.size}")
    if (numbers.contains(1)) println("1 is in the set")

    val numbersBackwards = setOf(4, 3, 2, 1)
    println("The sets are equal: ${numbers == numbersBackwards}")
//sampleEnd
}
```
{kotlin-runnable="true"}

[`MutableSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/index.html)은 `MutableCollection`의 쓰기 연산이 포함된 `Set`입니다.

`MutableSet`의 기본 구현체인 [`LinkedHashSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-linked-hash-set/index.html)은 요소가 삽입된 순서를 보존합니다.
따라서 `first()`나 `last()`와 같이 순서에 의존하는 함수는 이러한 세트에서 예측 가능한 결과를 반환합니다.

```kotlin
fun main() {
//sampleStart
    val numbers = setOf(1, 2, 3, 4)  // LinkedHashSet이 기본 구현체입니다
    val numbersBackwards = setOf(4, 3, 2, 1)
    
    println(numbers.first() == numbersBackwards.first())
    println(numbers.first() == numbersBackwards.last())
//sampleEnd
}
```
{kotlin-runnable="true"}

대체 구현체인 [`HashSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-hash-set/index.html)은 요소의 순서에 대해 아무것도 보장하지 않으므로, 이러한 함수를 호출하면 예측할 수 없는 결과가 반환됩니다. 하지만 `HashSet`은 동일한 수의 요소를 저장하는 데 더 적은 메모리를 사용합니다.

### Map {id="map"}

[`Map<K, V>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/index.html)는 `Collection` 인터페이스를 상속받지 않지만, 이 역시 Kotlin 컬렉션 타입의 하나입니다.
`Map`은 _키-값(key-value)_ 쌍(또는 _엔트리(entry)_)을 저장합니다. 키는 고유하지만 서로 다른 키가 동일한 값과 매핑될 수 있습니다.
`Map` 인터페이스는 키로 값에 접근하기, 키와 값 검색하기 등과 같은 전용 함수를 제공합니다.

```kotlin
fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key4" to 1)
    
    println("All keys: ${numbersMap.keys}")
    println("All values: ${numbersMap.values}")
    if ("key2" in numbersMap) println("Value by key \"key2\": ${numbersMap["key2"]}")    
    if (1 in numbersMap.values) println("The value 1 is in the map")
    if (numbersMap.containsValue(1)) println("The value 1 is in the map") // 이전과 동일합니다
//sampleEnd
}
```
{kotlin-runnable="true"}

동일한 쌍을 포함하는 두 맵은 쌍의 순서와 관계없이 동등합니다.

```kotlin
fun main() {
//sampleStart
    val numbersMap = mapOf("key1" to 1, "key2" to 2, "key3" to 3, "key4" to 1)    
    val anotherMap = mapOf("key2" to 2, "key1" to 1, "key4" to 1, "key3" to 3)
    
    println("The maps are equal: ${numbersMap == anotherMap}")
//sampleEnd
}
```
{kotlin-runnable="true"}

[`MutableMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/index.html)은 맵 쓰기 연산이 포함된 `Map`으로, 예를 들어 새 키-값 쌍을 추가하거나 지정된 키와 연결된 값을 업데이트할 수 있습니다.

```kotlin
fun main() {
//sampleStart
    val numbersMap = mutableMapOf("one" to 1, "two" to 2)
    numbersMap.put("three", 3)
    numbersMap["one"] = 11

    println(numbersMap)
//sampleEnd
}
```
{kotlin-runnable="true"}

`MutableMap`의 기본 구현체인 [`LinkedHashMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-linked-hash-map/index.html)은 맵을 순회할 때 요소가 삽입된 순서를 보존합니다.
반면, 대체 구현체인 [`HashMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-hash-map/index.html)은 요소의 순서에 대해 아무것도 보장하지 않습니다.

### ArrayDeque {id="arraydeque"}

[`ArrayDeque<T>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-array-deque/)는 큐의 시작과 끝 양쪽 모두에서 요소를 추가하거나 제거할 수 있는 양방향 큐(double-ended queue)의 구현체입니다.
따라서 Kotlin에서 `ArrayDeque`는 스택(Stack)과 큐(Queue) 데이터 구조의 역할을 모두 수행합니다. 내부적으로 `ArrayDeque`는 필요에 따라 크기가 자동으로 조절되는 가변 크기 배열을 사용하여 구현됩니다.

```kotlin
fun main() {
    val deque = ArrayDeque(listOf(1, 2, 3))

    deque.addFirst(0)
    deque.addLast(4)
    println(deque) // [0, 1, 2, 3, 4]

    println(deque.first()) // 0
    println(deque.last()) // 4

    deque.removeFirst()
    deque.removeLast()
    println(deque) // [1, 2, 3]
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.4"}