[//]: # (title: 컬렉션)

<no-index/>

프로그래밍을 할 때 나중에 처리하기 위해 데이터를 구조로 묶을 수 있으면 유용합니다. Kotlin은 바로 이러한 목적으로 컬렉션을 제공합니다.

Kotlin에는 항목을 그룹화하기 위한 다음과 같은 컬렉션이 있습니다.

| **컬렉션 타입** | **설명**                                                                 |
|---------------------|-------------------------------------------------------------------------|
| Lists               | 순서가 있는 항목들의 컬렉션                                            |
| Sets                | 중복되지 않는 고유한 항목들의 순서 없는 컬렉션                         |
| Maps                | 키가 고유하고 하나의 값에만 매핑되는 키-값 쌍의 집합                    |

각 컬렉션 타입은 가변(mutable)이거나 읽기 전용(read-only)일 수 있습니다.

## List {id="list"}

리스트(List)는 항목이 추가된 순서대로 저장하며, 중복 항목을 허용합니다.

읽기 전용 리스트([`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/))를 생성하려면 [`listOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/list-of.html) 함수를 사용합니다.

가변 리스트([`MutableList`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list.html))를 생성하려면 [`mutableListOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-list-of.html) 함수를 사용합니다.

리스트를 생성할 때 Kotlin은 저장된 항목의 타입을 추론할 수 있습니다. 타입을 명시적으로 선언하려면 리스트 선언 뒤에 꺾쇠괄호 `<>` 안에 타입을 추가하세요.

```kotlin
fun main() { 
//sampleStart
    // 읽기 전용 리스트
    val readOnlyShapes = listOf("triangle", "square", "circle")
    println(readOnlyShapes)
    // [triangle, square, circle]
    
    // 명시적 타입 선언이 있는 가변 리스트
    val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")
    println(shapes)
    // [triangle, square, circle]
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-lists-declaration"}

> 원치 않는 수정을 방지하기 위해 가변 리스트를 `List`에 할당하여 읽기 전용 뷰(view)를 만들 수 있습니다.
> 
> ```kotlin
>     val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")
>     val shapesLocked: List<String> = shapes
> ```
> 이를 **캐스팅(casting)**이라고도 합니다.
> 
{style="tip"}

리스트는 순서가 있으므로 리스트의 항목에 접근하려면 [인덱스 접근 연산자](operator-overloading.md#indexed-access-operator) `[]`를 사용합니다.

```kotlin
fun main() { 
//sampleStart
    val readOnlyShapes = listOf("triangle", "square", "circle")
    println("The first item in the list is: ${readOnlyShapes[0]}")
    // The first item in the list is: triangle
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-list-access"}

리스트의 첫 번째 또는 마지막 항목을 가져오려면 각각 [`.first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) 및 [`.last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html) 함수를 사용합니다.

```kotlin
fun main() { 
//sampleStart
    val readOnlyShapes = listOf("triangle", "square", "circle")
    println("The first item in the list is: ${readOnlyShapes.first()}")
    // The first item in the list is: triangle
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-list-first"}

> [`.first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) 및 [`.last()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/last.html) 함수는 **확장 함수(extension functions)**의 예입니다. 객체에서 확장 함수를 호출하려면 객체 뒤에 마침표 `.`를 붙이고 함수 이름을 작성합니다.
> 
> 확장 함수는 [중급 투어](kotlin-tour-intermediate-extension-functions.md#extension-functions)에서 자세히 다룹니다. 지금은 호출하는 방법만 알아두면 됩니다.
> 
{style="note"}

리스트의 항목 수를 가져오려면 [`.count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html) 함수를 사용합니다.

```kotlin
fun main() { 
//sampleStart
    val readOnlyShapes = listOf("triangle", "square", "circle")
    println("This list has ${readOnlyShapes.count()} items")
    // This list has 3 items
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-list-count"}

항목이 리스트에 있는지 확인하려면 [`in` 연산자](operator-overloading.md#in-operator)를 사용합니다.

```kotlin
fun main() {
//sampleStart
    val readOnlyShapes = listOf("triangle", "square", "circle")
    println("circle" in readOnlyShapes)
    // true
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-list-in"}

가변 리스트에서 항목을 추가하거나 제거하려면 각각 [`.add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-list/add.html) 및 [`.remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 함수를 사용합니다.

```kotlin
fun main() { 
//sampleStart
    val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")
    // 리스트에 "pentagon" 추가
    shapes.add("pentagon") 
    println(shapes)  
    // [triangle, square, circle, pentagon]

    // 리스트에서 첫 번째 "pentagon" 제거
    shapes.remove("pentagon") 
    println(shapes)  
    // [triangle, square, circle]
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-list-add-remove"}

## Set {id="set"}

리스트가 순서가 있고 중복 항목을 허용하는 반면, 세트(Set)는 **순서가 없으며(unordered)** **고유한(unique)** 항목만 저장합니다.

읽기 전용 세트([`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/))를 생성하려면 [`setOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/set-of.html) 함수를 사용합니다.

가변 세트([`MutableSet`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/))를 생성하려면 [`mutableSetOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-set-of.html) 함수를 사용합니다.

세트를 생성할 때 Kotlin은 저장된 항목의 타입을 추론할 수 있습니다. 타입을 명시적으로 선언하려면 세트 선언 뒤에 꺾쇠괄호 `<>` 안에 타입을 추가하세요.

```kotlin
fun main() {
//sampleStart
    // 읽기 전용 세트
    val readOnlyFruit = setOf("apple", "banana", "cherry", "cherry")
    // 명시적 타입 선언이 있는 가변 세트
    val fruit: MutableSet<String> = mutableSetOf("apple", "banana", "cherry", "cherry")
    
    println(readOnlyFruit)
    // [apple, banana, cherry]
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-sets-declaration"}

이전 예제에서 볼 수 있듯이 세트에는 고유한 요소만 포함되므로 중복된 `"cherry"` 항목은 제외됩니다.

> 원치 않는 수정을 방지하기 위해 가변 세트를 `Set`에 할당하여 읽기 전용 뷰를 만들 수 있습니다.
> 
> ```kotlin
>     val fruit: MutableSet<String> = mutableSetOf("apple", "banana", "cherry", "cherry")
>     val fruitLocked: Set<String> = fruit
> ```
>
{style="tip"}

> 세트는 **순서가 없으므로(unordered)** 특정 인덱스의 항목에 접근할 수 없습니다.
> 
{style="note"}

세트의 항목 수를 가져오려면 [`.count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html) 함수를 사용합니다.

```kotlin
fun main() { 
//sampleStart
    val readOnlyFruit = setOf("apple", "banana", "cherry", "cherry")
    println("This set has ${readOnlyFruit.count()} items")
    // This set has 3 items
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-set-count"}

항목이 세트에 있는지 확인하려면 [`in` 연산자](operator-overloading.md#in-operator)를 사용합니다.

```kotlin
fun main() {
//sampleStart
    val readOnlyFruit = setOf("apple", "banana", "cherry", "cherry")
    println("banana" in readOnlyFruit)
    // true
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-set-in"}

가변 세트에서 항목을 추가하거나 제거하려면 각각 [`.add()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-set/add.html) 및 [`.remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 함수를 사용합니다.

```kotlin
fun main() { 
//sampleStart
    val fruit: MutableSet<String> = mutableSetOf("apple", "banana", "cherry", "cherry")
    fruit.add("dragonfruit")    // 세트에 "dragonfruit" 추가
    println(fruit)              // [apple, banana, cherry, dragonfruit]
    
    fruit.remove("dragonfruit") // 세트에서 "dragonfruit" 제거
    println(fruit)              // [apple, banana, cherry]
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-set-add-remove"}

## Map {id="map"}

맵(Map)은 항목을 키-값 쌍(key-value pairs)으로 저장합니다. 키를 참조하여 값에 접근합니다. 맵은 음식점 메뉴판처럼 생각할 수 있습니다. 먹고 싶은 음식(키)을 찾아 가격(값)을 확인할 수 있습니다. 맵은 리스트처럼 숫자 인덱스를 사용하지 않고 값을 찾고 싶을 때 유용합니다.

> * Kotlin이 어떤 값을 가져오려는지 식별할 수 있도록 맵의 모든 키는 고유해야 합니다. 
> * 맵에서는 중복된 값을 가질 수 있습니다.
>
{style="note"}

읽기 전용 맵([`Map`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/))을 생성하려면 [`mapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-of.html) 함수를 사용합니다.

가변 맵([`MutableMap`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-mutable-map/))을 생성하려면 [`mutableMapOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/mutable-map-of.html) 함수를 사용합니다.

맵을 생성할 때 Kotlin은 저장된 항목의 타입을 추론할 수 있습니다. 타입을 명시적으로 선언하려면 맵 선언 뒤에 꺾쇠괄호 `<>` 안에 키와 값의 타입을 추가하세요. 예를 들어 `MutableMap<String, Int>`와 같이 작성합니다. 여기서 키는 `String` 타입이고 값은 `Int` 타입입니다.

맵을 생성하는 가장 쉬운 방법은 각 키와 관련 값 사이에 [`to`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/to.html)를 사용하는 것입니다.

```kotlin
fun main() {
//sampleStart
    // 읽기 전용 맵
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println(readOnlyJuiceMenu)
    // {apple=100, kiwi=190, orange=100}

    // 명시적 타입 선언이 있는 가변 맵
    val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println(juiceMenu)
    // {apple=100, kiwi=190, orange=100}
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-maps-declaration"}

> 원치 않는 수정을 방지하기 위해 가변 맵을 `Map`에 할당하여 읽기 전용 뷰를 만들 수 있습니다.
> 
> ```kotlin
>     val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
>     val juiceMenuLocked: Map<String, Int> = juiceMenu
> ```
>
{style="tip"}

맵의 값에 접근하려면 키와 함께 [인덱스 접근 연산자](operator-overloading.md#indexed-access-operator) `[]`를 사용합니다.

```kotlin
fun main() {
//sampleStart
    // 읽기 전용 맵
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println("The value of apple juice is: ${readOnlyJuiceMenu["apple"]}")
    // The value of apple juice is: 100
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-map-access"}

> 맵에 존재하지 않는 키로 키-값 쌍에 접근하려고 하면 `null` 값이 표시됩니다.
>
> ```kotlin
> fun main() {
> //sampleStart
>     // 읽기 전용 맵
>     val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
>     println("The value of pineapple juice is: ${readOnlyJuiceMenu["pineapple"]}")
>     // The value of pineapple juice is: null
> //sampleEnd
> }
> ```
> {kotlin-runnable="true" id="kotlin-tour-map-no-key" validate="false"}
> 
> 이 투어의 뒷부분인 [Null 안전성](kotlin-tour-null-safety.md) 챕터에서 null 값에 대해 설명합니다.
> 
{style="note"}

가변 맵에 항목을 추가할 때도 [인덱스 접근 연산자](operator-overloading.md#indexed-access-operator) `[]`를 사용할 수 있습니다.

```kotlin
fun main() {
//sampleStart
    val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    juiceMenu["coconut"] = 150 // 맵에 값이 150인 키 "coconut" 추가
    println(juiceMenu)
    // {apple=100, kiwi=190, orange=100, coconut=150}
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-map-add-item"}

가변 맵에서 항목을 제거하려면 [`.remove()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/remove.html) 함수를 사용합니다.

```kotlin
fun main() {
//sampleStart
    val juiceMenu: MutableMap<String, Int> = mutableMapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    juiceMenu.remove("orange")    // 맵에서 키 "orange" 제거
    println(juiceMenu)
    // {apple=100, kiwi=190}
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-map-put-remove"}

맵의 항목 수를 가져오려면 [`.count()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/count.html) 함수를 사용합니다.

```kotlin
fun main() {
//sampleStart
    // 읽기 전용 맵
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println("This map has ${readOnlyJuiceMenu.count()} key-value pairs")
    // This map has 3 key-value pairs
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-map-count"}

특정 키가 맵에 이미 포함되어 있는지 확인하려면 [`.containsKey()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/contains-key.html) 함수를 사용합니다.

```kotlin
fun main() {
//sampleStart
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println(readOnlyJuiceMenu.containsKey("kiwi"))
    // true
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-map-contains-keys"}

맵의 키 또는 값 컬렉션을 가져오려면 각각 [`keys`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/keys.html) 및 [`values`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/values.html) 프로퍼티를 사용합니다.

```kotlin
fun main() {
//sampleStart
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println(readOnlyJuiceMenu.keys)
    // [apple, kiwi, orange]
    println(readOnlyJuiceMenu.values)
    // [100, 190, 100]
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-map-keys-values"}

> [`keys`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/keys.html) 및 [`values`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/values.html)는 객체의 **프로퍼티(properties)**의 예입니다. 객체의 프로퍼티에 접근하려면 객체 뒤에 마침표 `.`를 붙이고 프로퍼티 이름을 작성합니다.
>
> 프로퍼티는 [클래스](kotlin-tour-classes.md) 챕터에서 더 자세히 설명합니다. 이 투어 단계에서는 프로퍼티에 접근하는 방법만 알아두면 됩니다.
>
{style="note"}

키 또는 값이 맵에 있는지 확인하려면 [`in` 연산자](operator-overloading.md#in-operator)를 사용합니다.

```kotlin
fun main() {
//sampleStart
    val readOnlyJuiceMenu = mapOf("apple" to 100, "kiwi" to 190, "orange" to 100)
    println("orange" in readOnlyJuiceMenu.keys)
    // true
    
    // 또는 keys 프로퍼티를 사용하지 않아도 됩니다
    println("orange" in readOnlyJuiceMenu)
    // true
    
    println(200 in readOnlyJuiceMenu.values)
    // false
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-map-in"}

컬렉션으로 할 수 있는 작업에 대한 자세한 내용은 [컬렉션](collections-overview.md)을 참조하세요.

이제 기본 타입과 컬렉션을 관리하는 방법을 알았으므로 프로그램에서 사용할 수 있는 [제어 흐름](kotlin-tour-control-flow.md)을 살펴볼 차례입니다.

## 연습 문제 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="두 리스트의 전체 항목 수 세기" id="collections-exercise-1">

"green" 숫자 리스트와 "red" 숫자 리스트가 있습니다. 전체 숫자가 몇 개인지 출력하도록 코드를 완성하세요.

```kotlin
// Keep these two lists as they are. Use them in main().
val greenNumbers = listOf(1, 4, 23)
val redNumbers = listOf(17, 2)

fun main() {
    // Write your code here
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/CollectionsExercise1Test.kt" validate="false" id="kotlin-tour-collections-exercise-1"}

```kotlin
val greenNumbers = listOf(1, 4, 23)
val redNumbers = listOf(17, 2)

fun main() {
    val totalCount = greenNumbers.count() + redNumbers.count()
    println(totalCount)
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/CollectionsExercise1Test.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution" id="kotlin-tour-collections-solution-1"}

</def>
<def title="요청된 프로토콜이 지원되는지 확인" id="collections-exercise-2">

서버에서 지원하는 프로토콜 세트가 있습니다. 사용자가 특정 프로토콜 사용을 요청했습니다. 요청된 프로토콜이 지원되는지 여부를 확인하도록 프로그램을 완성하세요(`isSupported`는 Boolean 값이어야 합니다).

```kotlin
fun main() {
    val SUPPORTED = setOf("HTTP", "HTTPS", "FTP")
    val requested = "smtp"
    val isSupported = TODO() // Replace the TODO() function
    println("Support for $requested: $isSupported")
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/CollectionsExercise2Test.kt" validate="false" id="kotlin-tour-collections-exercise-2"}

<deflist collapsible="true" id="kotlin-tour-collections-exercise-2-hint">
    <def title="힌트">
        요청된 프로토콜을 대문자로 확인해야 합니다. 이를 위해 <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase.html"><code>.uppercase()</code></a> 함수를 사용할 수 있습니다.
    </def>
</deflist>

```kotlin
fun main() {
    val SUPPORTED = setOf("HTTP", "HTTPS", "FTP")
    val requested = "smtp"
    val isSupported = requested.uppercase() in SUPPORTED
    println("Support for $requested: $isSupported")
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/CollectionsExercise2Test.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution" id="kotlin-tour-collections-solution-2"}

</def>
<def title="맵을 사용하여 숫자를 단어로 표현하기" id="collections-exercise-3">

1부터 3까지의 정수를 해당하는 영단어 표기와 연결하는 맵을 정의하세요. 이 맵을 사용하여 주어진 숫자를 영단어로 출력하세요.

```kotlin
// Replace the empty map. Keep the variable name as number2word.
val number2word: Map<Int, String> = emptyMap()

fun main() {
    val n = 2
    println("$n is spelled as '${number2word[n]}'")
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/CollectionsExercise3Test.kt" validate="false" id="kotlin-tour-collections-exercise-3"}

```kotlin
val number2word = mapOf(1 to "one", 2 to "two", 3 to "three")

fun main() {
    val n = 2
    println("$n is spelled as '${number2word[n]}'")
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/CollectionsExercise3Test.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="Example solution" id="kotlin-tour-collections-solution-3"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-basic-types.md" mode="outline" icon="arrow-left" icon-position="left">Previous step</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-control-flow.md" mode="classic" icon="arrow-right" icon-position="right">Next step</a>
  </li>
</list>