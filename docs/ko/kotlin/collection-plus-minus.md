[//]: # (title: Plus 및 minus 연산자)

Kotlin에서는 컬렉션에 대해 [`plus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus.html) (`+`) 및 [`minus`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus.html) (`-`) 연산자가 정의되어 있습니다.
이 연산자들은 첫 번째 피연산자로 컬렉션을 받으며, 두 번째 피연산자는 단일 요소 또는 또 다른 컬렉션이 될 수 있습니다.
반환 값은 새로운 읽기 전용 컬렉션입니다:

* `plus`의 결과에는 원본 컬렉션의 요소_와_ 두 번째 피연산자의 요소가 포함됩니다.
* `minus`의 결과에는 두 번째 피연산자의 요소를 _제외한_ 원본 컬렉션의 요소가 포함됩니다.
   피연산자가 단일 요소인 경우 `minus`는 해당 요소가 _처음_ 나타난 항목을 제거하며, 컬렉션인 경우 해당 컬렉션에 속한 요소의 _모든_ 일치 항목을 제거합니다.

```kotlin

fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")

    val plusList = numbers + "five"
    val minusList = numbers - listOf("three", "four")
    println(plusList)
    println(minusList)
//sampleEnd
}
```
{kotlin-runnable="true"}

맵(Map)에서의 `plus` 및 `minus` 연산자에 대한 자세한 내용은 [맵 관련 연산](map-operations.md)을 참조하세요.
컬렉션에는 [복합 대입 연산자(Augmented assignment operators)](operator-overloading.md#augmented-assignments)인 [`plusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/plus-assign.html) (`+=`) 및 [`minusAssign`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/minus-assign.html) (`-=`)도 정의되어 있습니다. 그러나 읽기 전용 컬렉션의 경우, 실제로는 `plus` 또는 `minus` 연산자를 사용한 뒤 그 결과를 동일한 변수에 다시 할당하려고 시도합니다. 따라서 읽기 전용 컬렉션에서는 `var`로 선언된 경우에만 이 연산자들을 사용할 수 있습니다.
가변(mutable) 컬렉션의 경우, 변수가 `val`로 선언되어 있더라도 컬렉션 자체를 직접 수정합니다. 자세한 내용은 [컬렉션 쓰기 작업](collection-write.md)을 참조하세요.