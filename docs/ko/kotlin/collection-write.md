[//]: # (title: 컬렉션 쓰기 작업)

[가변 컬렉션(Mutable collection)](collections-overview.md#collection-types)은 요소를 추가하거나 제거하는 등 컬렉션의 내용을 변경하는 작업을 지원합니다.
이 페이지에서는 `MutableCollection`의 모든 구현체에서 사용할 수 있는 쓰기 작업에 대해 설명합니다.
`List` 및 `Map`에서 사용할 수 있는 보다 구체적인 작업은 각각 [List 전용 작업](list-operations.md)과 [Map 전용 작업](map-operations.md)을 참조하세요.

## 요소 추가하기 {id="adding-elements"}

리스트나 세트에 단일 요소를 추가하려면 [`add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/add.html) 함수를 사용합니다. 지정된 객체는 컬렉션의 맨 끝에 추가됩니다.

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4)
    numbers.add(5)
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

[`addAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/add-all.html)은 인자 객체의 모든 요소를 리스트나 세트에 추가합니다. 인자는 `Iterable`, `Sequence` 또는 `Array`가 될 수 있습니다.
수신 객체와 인자의 타입은 다를 수 있으며, 예를 들어 `Set`의 모든 항목을 `List`에 추가할 수 있습니다.

리스트에서 호출할 경우, `addAll()`은 인자에 들어 있는 순서 그대로 새 요소를 추가합니다.
첫 번째 인자로 요소의 위치(인덱스)를 지정하여 `addAll()`을 호출할 수도 있습니다.
인자 컬렉션의 첫 번째 요소가 이 위치에 삽입됩니다.
인자 컬렉션의 나머지 요소들이 그 뒤를 따르며, 기존 수신 객체의 요소들은 뒤로 밀려납니다.

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 5, 6)
    numbers.addAll(arrayOf(7, 8))
    println(numbers)
    numbers.addAll(2, setOf(3, 4))
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

[`plus` 연산자](collection-plus-minus.md)의 인플레이스(in-place) 버전인 [`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html) (`+=`)을 사용하여 요소를 추가할 수도 있습니다.
가변 컬렉션에 적용할 경우, `+=`는 두 번째 피연산자(단일 요소 또는 다른 컬렉션)를 컬렉션 끝에 추가합니다.

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two")
    numbers += "three"
    println(numbers)
    numbers += listOf("four", "five")    
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

## 요소 제거하기 {id="removing-elements"}

가변 컬렉션에서 요소를 제거하려면 [`remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 함수를 사용합니다.
`remove()`는 요소 값을 받아 해당 값과 일치하는 첫 번째 요소를 제거합니다.

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4, 3)
    numbers.remove(3)                    // 첫 번째 `3`을 제거합니다.
    println(numbers)
    numbers.remove(5)                    // 아무것도 제거하지 않습니다.
    println(numbers)
//sampleEnd
}
```
{kotlin-runnable="true"}

여러 요소를 한 번에 제거하기 위한 함수들도 제공됩니다:

* [`removeAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove-all.html)은 인자로 전달된 컬렉션에 존재하는 모든 요소를 제거합니다.
   또는 조건식(predicate)을 인자로 호출할 수도 있으며, 이 경우 조건식이 `true`를 반환하는 모든 요소를 제거합니다.
* [`retainAll()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/retain-all.html)은 `removeAll()`의 반대입니다. 인자로 전달된 컬렉션에 포함된 요소를 제외한 모든 요소를 제거합니다.
   조건식과 함께 사용하면 조건식과 일치하는 요소만 남깁니다.
* [`clear()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/clear.html)는 리스트의 모든 요소를 제거하여 빈 상태로 만듭니다.

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf(1, 2, 3, 4)
    println(numbers)
    numbers.retainAll { it >= 3 }
    println(numbers)
    numbers.clear()
    println(numbers)

    val numbersSet = mutableSetOf("one", "two", "three", "four")
    numbersSet.removeAll(setOf("one", "two"))
    println(numbersSet)
//sampleEnd
}
```
{kotlin-runnable="true"}

컬렉션에서 요소를 제거하는 또 다른 방법은 [`minus`](collection-plus-minus.md)의 인플레이스 버전인 [`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html) (`-=`) 연산자를 사용하는 것입니다.
두 번째 인자는 요소 타입의 단일 인스턴스이거나 다른 컬렉션일 수 있습니다.
우변에 단일 요소가 있는 경우, `-=`는 해당 요소와 일치하는 _첫 번째_ 요소를 제거합니다.
반면 컬렉션인 경우에는 해당 컬렉션에 속한 요소의 _모든_ 인스턴스를 제거합니다.
예를 들어 리스트에 중복 요소가 있는 경우 모두 한 번에 제거됩니다.
두 번째 피연산자에는 컬렉션에 존재하지 않는 요소가 포함될 수 있습니다. 이러한 요소는 연산 수행에 영향을 미치지 않습니다.

```kotlin

fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "three", "four")
    numbers -= "three"
    println(numbers)
    numbers -= listOf("four", "five")    
    //numbers -= listOf("four")    // 위와 동일하게 동작합니다.
    println(numbers)    
//sampleEnd
}
```
{kotlin-runnable="true"}

## 요소 업데이트하기 {id="updating-elements"}

리스트와 맵은 요소를 업데이트하는 작업도 제공합니다.
이에 대한 설명은 [List 전용 작업](list-operations.md) 및 [Map 전용 작업](map-operations.md)에 나와 있습니다.
세트의 경우, 업데이트 작업은 실질적으로 요소를 제거한 뒤 다른 요소를 추가하는 것과 같으므로 의미가 없습니다.