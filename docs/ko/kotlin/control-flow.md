[//]: # (title: 조건문과 반복문)

Kotlin은 프로그램의 흐름을 제어할 수 있는 유연한 도구를 제공합니다. `if`, `when`, 그리고 반복문을 사용하여 조건에 대한 명확하고 표현력 있는 로직을 정의할 수 있습니다.

## If 식 {id="if-expression"}

Kotlin에서 `if`를 사용하려면 괄호 `()` 안에 확인할 조건을 추가하고, 결과가 참일 때 실행할 동작을 중괄호 `{}` 안에 작성합니다. 추가적인 분기와 확인을 위해 `else`와 `else if`를 사용할 수 있습니다.

또한 `if`를 식으로 작성하여 반환된 값을 변수에 직접 할당할 수도 있습니다. 이 형태에서는 `else` 분기가 필수입니다. `if` 식은 다른 언어의 삼항 연산자(`condition ? then : else`)와 동일한 역할을 합니다.

예제:

```kotlin
fun main() {
    val heightAlice = 160
    val heightBob = 175

    //sampleStart
    var taller = heightAlice
    if (heightAlice < heightBob) taller = heightBob

    // else 분기 사용
    if (heightAlice > heightBob) {
        taller = heightAlice
    } else {
        taller = heightBob
    }

    // if를 식으로 사용
    taller = if (heightAlice > heightBob) heightAlice else heightBob

    // else if를 식으로 사용:
    val heightLimit = 150
    val heightOrLimit = if (heightLimit > heightAlice) heightLimit else if (heightAlice > heightBob) heightAlice else heightBob

    println("Taller height is $taller")
    // Taller height is 175
    println("Height or limit is $heightOrLimit")
    // Height or limit is 175
    //sampleEnd
}
```
{kotlin-runnable="true" id="if-else-if-kotlin"}

`if` 식의 각 분기는 블록이 될 수 있으며, 블록의 마지막 식의 값이 결과가 됩니다.

```kotlin
fun main() {
    //sampleStart
    val heightAlice = 160
    val heightBob = 175

    val taller = if (heightAlice > heightBob) {
        print("Choose Alice\n")
        heightAlice
    } else {
        print("Choose Bob\n")
        heightBob
    }

    println("Taller height is $taller")
    //sampleEnd
}
```
{kotlin-runnable="true" id="if-else-blocks-kotlin"}

## When 식과 문 {id="when-expressions-and-statements"}

`when`은 여러 가능한 값이나 조건에 따라 코드를 실행하는 조건식입니다. Java, C 등의 언어에 있는 `switch` 문과 유사합니다. `when`은 인자를 평가하고 한 분기의 조건이 충족될 때까지 각 분기를 순서대로 비교합니다. 예를 들면 다음과 같습니다.

```kotlin
fun main() {
    //sampleStart
    val userRole = "Editor"
    when (userRole) {
        "Viewer" -> print("User has read-only access")
        "Editor" -> print("User can edit content")
        else -> print("User role is not recognized")
    }
    // User can edit content
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-conditions-when-statement"}

`when`은 **식(expression)** 또는 **문(statement)**으로 사용할 수 있습니다. 식으로 사용되는 `when`은 코드의 뒷부분에서 사용할 수 있는 값을 반환합니다. 문으로 사용되는 `when`은 결과를 반환하지 않고 동작을 완료합니다.

<table>
   <tr>
       <td>식(Expression)</td>
       <td>문(Statement)</td>
   </tr>
   <tr>
<td>

```kotlin
// text 변수에 할당되는 
// 문자열을 반환합니다
val text = when (x) {
    1 -> "x == 1"
    2 -> "x == 2"
    else -> "x is neither 1 nor 2"
}
```

</td>
<td>

```kotlin
// 결과를 반환하지 않지만 
// 출력문을 실행합니다
when (x) {
    1 -> print("x == 1")
    2 -> print("x == 2")
    else -> print("x is neither 1 nor 2")
}
```

</td>
</tr>
</table>

둘째로, `when`은 대상(subject)과 함께 사용할 수도 있고 없이 사용할 수도 있습니다. 어느 쪽이든 동작 방식은 동일합니다. 대상을 사용하면 무엇을 검사하고 있는지 명확히 보여주므로 일반적으로 코드의 가독성과 유지보수성이 향상됩니다.

<table>
   <tr>
       <td>대상 <code>x</code>가 있는 경우</td>
       <td>대상이 없는 경우</td>
   </tr>
   <tr>
<td>

```kotlin
when(x) { ... }
```

</td>
<td>

```kotlin
when { ... }
```

</td>
</tr>
</table>

`when`을 어떻게 사용하는지에 따라 분기에서 가능한 모든 경우를 다루어야 하는지가 결정됩니다. 가능한 모든 경우를 다루는 것을 *망라적(exhaustive)*이라고 합니다.

### 문 (Statements) {id="statements"}

`when`을 문으로 사용하는 경우 모든 가능한 경우를 다룰 필요는 없습니다. 다음 예제에서는 일부 경우가 다루어지지 않아 어떤 분기도 실행되지 않지만, 오류는 발생하지 않습니다.

```kotlin
fun main() {
    //sampleStart
    val deliveryStatus = "OutForDelivery"
    when (deliveryStatus) {
        // 모든 경우가 다루어지지 않음
        "Pending" -> print("Your order is being prepared")
        "Shipped" -> print("Your order is on the way")
    }
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-when-statement"}

`if`와 마찬가지로 각 분기는 블록이 될 수 있으며, 그 값은 블록 내 마지막 식의 값이 됩니다.

### 식 (Expressions) {id="expressions"}

`when`을 식으로 사용하는 경우 가능한 모든 경우를 **반드시** 다루어야 합니다. 일치하는 첫 번째 분기의 값이 전체 식의 값이 됩니다. 모든 경우를 다루지 않으면 컴파일러 오류가 발생합니다.

`when` 식에 대상이 있는 경우 `else` 분기를 사용하여 가능한 모든 경우가 처리되도록 보장할 수 있지만, 필수는 아닙니다. 예를 들어 대상이 `Boolean`, [`enum` 클래스](enum-classes.md), [`sealed` 클래스](sealed-classes.md)이거나 이들의 널 허용(nullable) 대응 타입인 경우, `else` 분기 없이도 모든 경우를 다룰 수 있습니다.

```kotlin
import kotlin.random.Random
//sampleStart
enum class Bit {
    ZERO, ONE
}

fun getRandomBit(): Bit {
    return if (Random.nextBoolean()) Bit.ONE else Bit.ZERO
}

fun main() {
    val numericValue = when (getRandomBit()) {
        // 모든 경우가 다루어졌으므로 else 분기가 필요하지 않음
        Bit.ZERO -> 0
        Bit.ONE -> 1
    }

    println("Random bit as number: $numericValue")
    // Random bit as number: 0
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-when-expression-subject"}

> `when` 식을 단순화하고 중복을 줄이려면 문맥 인식 리졸루션(context-sensitive resolution, 현재 미리보기 제공) 기능을 사용해 보세요.
> 이 기능을 사용하면 예상되는 타입을 알고 있는 경우 `when` 식에서 enum 항목이나 sealed 클래스 멤버를 사용할 때 타입 이름을 생략할 수 있습니다.
> 
> 자세한 내용은 [문맥 인식 리졸루션 미리보기](whatsnew22.md#preview-of-context-sensitive-resolution) 또는 관련 [KEEP 제안서](https://github.com/Kotlin/KEEP/blob/improved-resolution-expected-type/proposals/context-sensitive-resolution.md)를 참고하세요.
> 
{style="tip"}

`when` 식에 대상이 **없는** 경우, `else` 분기가 **반드시** 있어야 하며 그렇지 않으면 컴파일러 오류가 발생합니다.
`else` 분기는 다른 어떤 분기 조건도 충족되지 않을 때 평가됩니다.

```kotlin
fun main() {
    //sampleStart
    val localFileSize = 1200
    val remoteFileSize = 1200

    val message = when {
        localFileSize > remoteFileSize -> "Local file is larger than remote file"
        localFileSize < remoteFileSize -> "Local file is smaller than remote file"
        else -> "Local and remote files are the same size"
    }

    println(message)
    // Local and remote files are the same size
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-when-no-subject"}

### when의 다른 활용 방법 {id="other-ways-to-use-when"}

`when` 식과 문은 코드를 단순화하고 여러 조건을 처리하며 타입 검사를 수행할 수 있는 다양한 방법을 제공합니다.

쉼표를 사용하여 여러 조건을 하나의 분기로 묶을 수 있습니다.

```kotlin
fun main() {
    val ticketPriority = "High"
    //sampleStart
    when (ticketPriority) {
        "Low", "Medium" -> print("Standard response time")
        else -> print("High-priority handling")
    }
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-when-multiple-cases"}

`true` 또는 `false`로 평가되는 식을 분기 조건으로 사용할 수 있습니다.

```kotlin
fun main() {
    val storedPin = "1234"
    val enteredPin = 1234
  
    //sampleStart
    when (enteredPin) {
        // 표현식
        storedPin.toInt() -> print("PIN is correct")
        else -> print("Incorrect PIN")
    }
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-when-branch-expression"}

`in` 또는 `!in` 키워드를 사용하여 값이 [범위](ranges.md)나 컬렉션에 포함되어 있는지 여부를 확인할 수 있습니다.

```kotlin
fun main() {
    val x = 7
    val validNumbers = setOf(15, 16, 17)

    //sampleStart
    when (x) {
        in 1..10 -> print("x is in the range")
        in validNumbers -> print("x is valid")
        !in 10..20 -> print("x is outside the range")
        else -> print("none of the above")
    }
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-when-ranges"}

`is` 또는 `!is` 키워드를 사용하여 값의 타입을 검사할 수 있습니다. [스마트 캐스트(smart casts)](typecasts.md#smart-casts) 덕분에 해당 타입의 멤버 함수와 프로퍼티에 직접 접근할 수 있습니다.

```kotlin
fun hasPrefix(input: Any): Boolean = when (input) {
    is String -> input.startsWith("ID-")
    else -> false
}

fun main() {
    val testInput = "ID-98345"
    println(hasPrefix(testInput))
    // true
}
```
{kotlin-runnable="true" id="kotlin-when-type-checks"}

전통적인 `if`-`else` `if` 체인 대신 `when`을 사용할 수 있습니다.
대상이 없으면 분기 조건은 단순한 불리언 식이 됩니다. 조건이 `true`인 첫 번째 분기가 실행됩니다.

```kotlin
fun Int.isOdd() = this % 2 != 0
fun Int.isEven() = this % 2 == 0

fun main() {
    //sampleStart
    val x = 5
    val y = 8

    when {
        x.isOdd() -> print("x is odd")
        y.isEven() -> print("y is even")
        else -> print("x+y is odd")
    }
    // x is odd
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-when-replace-if"}

마지막으로, 다음 구문을 사용하여 대상을 변수에 캡처할 수 있습니다.

```kotlin
fun main() {
    val message = when (val input = "yes") {
        "yes" -> "You said yes"
        "no" -> "You said no"
        else -> "Unrecognized input: $input"
    }

    println(message)
    // You said yes
}
```
{kotlin-runnable="true" id="kotlin-when-capture-subject"}

대상으로 도입된 변수의 스코프는 `when` 식 또는 문의 본문으로 제한됩니다.

### 가드 조건 {id="guard-conditions-in-when-expressions"}

가드 조건(Guard conditions)을 사용하면 `when` 식이나 문의 분기에 둘 이상의 조건을 포함할 수 있어 복잡한 제어 흐름을 더 명시적이고 간결하게 만들 수 있습니다. 가드 조건은 `when`에 대상이 있는 경우에 사용할 수 있습니다.

동일한 분기에서 기본 조건 뒤에 `if`로 구분하여 가드 조건을 배치합니다.

```kotlin
sealed interface Animal {
    data class Cat(val mouseHunter: Boolean) : Animal
    data class Dog(val breed: String) : Animal
}

fun feedDog() = println("Feeding a dog")
fun feedCat() = println("Feeding a cat")

//sampleStart
fun feedAnimal(animal: Animal) {
    when (animal) {
        // 기본 조건만 있는 분기
        // animal이 Dog일 때 feedDog() 호출
        is Animal.Dog -> feedDog()
        // 기본 조건과 가드 조건이 모두 있는 분기
        // animal이 Cat이고 mouseHunter가 아닐 때 feedCat() 호출
        is Animal.Cat if !animal.mouseHunter -> feedCat()
        // 위의 조건 중 어느 것도 일치하지 않으면 "Unknown animal" 출력
        else -> println("Unknown animal")
    }
}

fun main() {
    val animals = listOf(
        Animal.Dog("Beagle"),
        Animal.Cat(mouseHunter = false),
        Animal.Cat(mouseHunter = true)
    )

    animals.forEach { feedAnimal(it) }
    // Feeding a dog
    // Feeding a cat
    // Unknown animal
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.2" id="kotlin-when-guard-conditions"}

쉼표로 구분된 여러 조건이 있는 경우에는 가드 조건을 사용할 수 없습니다. 예를 들면 다음과 같습니다.

```kotlin
0, 1 -> print("x == 0 or x == 1")
```

단일 `when` 식 또는 문에서 가드 조건이 있는 분기와 없는 분기를 함께 사용할 수 있습니다.
가드 조건이 있는 분기의 코드는 기본 조건과 가드 조건이 모두 `true`로 평가될 때만 실행됩니다.
기본 조건이 일치하지 않으면 가드 조건은 평가되지 않습니다.

`when` 문은 모든 경우를 다룰 필요가 없으므로, `else` 분기가 없는 `when` 문에서 가드 조건을 사용할 때 어떤 조건도 일치하지 않으면 아무 코드도 실행되지 않습니다.

문과 달리 `when` 식은 모든 경우를 다루어야 합니다. `else` 분기 없이 `when` 식에서 가드 조건을 사용하는 경우, 런타임 오류를 방지하기 위해 컴파일러는 가능한 모든 경우를 처리하도록 요구합니다.

불리언 연산자 `&&` (AND) 또는 `||` (OR)를 사용하여 단일 분기 내에서 여러 가드 조건을 결합할 수 있습니다.
[혼란을 피하기 위해](coding-conventions.md#guard-conditions-in-when-expression) 불리언 식 주위에 괄호를 사용하세요.

```kotlin
when (animal) {
    is Animal.Cat if (!animal.mouseHunter && animal.hungry) -> feedCat()
}
```

가드 조건은 `else if`도 지원합니다.

```kotlin
when (animal) {
    // `animal`이 `Dog`인지 확인
    is Animal.Dog -> feedDog()
    // `animal`이 `Cat`이고 `mouseHunter`가 아닌지 확인하는 가드 조건
    is Animal.Cat if !animal.mouseHunter -> feedCat()
    // 위의 조건 중 일치하는 것이 없고 animal.eatsPlants가 true인 경우 giveLettuce() 호출
    else if animal.eatsPlants -> giveLettuce()
    // 위의 조건 중 일치하는 것이 없는 경우 "Unknown animal" 출력
    else -> println("Unknown animal")
}
```

### JVM에서의 바이트코드 생성 {id="bytecode-generation-on-the-jvm"}

JVM 21 이상을 대상으로 Kotlin 코드를 컴파일할 때, 컴파일러는 대상 조건을 충족하는 `when` 식에 대해 [`invokedynamic`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/invoke/package-summary.html) 인스트럭션을 생성합니다. 이를 통해 Java `switch` 문에서 생성되는 바이트코드와 유사하게 더 작은 크기의 바이트코드가 생성됩니다.

다음 조건이 모두 충족될 때 컴파일러는 [`SwitchBootstraps.typeSwitch()`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/runtime/SwitchBootstraps.html) 메서드와 함께 `invokedynamic`을 사용합니다.

* `else`를 제외한 모든 조건이 `is` 또는 `null` 검사일 때.
* `when` 식에 [가드 조건 (`if`)](#guard-conditions-in-when-expressions)이 포함되어 있지 않을 때.
* 변경 가능한 Kotlin 컬렉션(`MutableList`)이나 함수 타입(`kotlin.Function1`, `kotlin.Function2` 등)과 같이 직접 타입 검사를 할 수 없는 타입이 조건에 포함되어 있지 않을 때.
* `when` 식에 `else` 외에 2개 이상의 조건이 있을 때.
* 모든 분기가 `when` 식의 동일한 대상을 검사할 때.

예제:

```kotlin
open class Shape

class Circle : Shape()
class Rectangle : Shape()
class Triangle : Shape()

fun countCorners(shape: Shape) = when (shape) {
    is Circle -> 0
    is Rectangle -> 4
    is Triangle -> 3
    else -> -1
}
```

여기서 `when (shape)` 식은 바이트코드에서 여러 개의 `instanceof` 검사 대신 단일 `invokedynamic` 타입 스위치로 컴파일됩니다.

## For 반복문 {id="for-loops"}

`for` 반복문을 사용하여 [컬렉션](collections-overview.md), [배열](arrays.md) 또는 [범위](ranges.md)를 순회할 수 있습니다.

```kotlin
for (item in collection) print(item)
```

`for` 반복문의 본문은 중괄호 `{}`가 있는 블록이 될 수 있습니다.

```kotlin
fun main() {
    val shoppingList = listOf("Milk", "Bananas", "Bread")
    //sampleStart
    println("Things to buy:")
    for (item in shoppingList) {
        println("- $item")
    }
    // Things to buy:
    // - Milk
    // - Bananas
    // - Bread
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-for-loop"}

### 범위 {id="ranges"}

숫자 범위를 반복 순회하려면 `..` 및 `..<` 연산자가 포함된 [범위 식](ranges.md)을 사용합니다.

```kotlin
fun main() {
//sampleStart
    println("Range with an inclusive upper bound:")
    for (i in 1..6) {
        print(i)
    }
    // Range with an inclusive upper bound:
    // 123456
  
    println("\nRange with an exclusive upper bound:")
    for (i in 1..<6) {
        print(i)
    }
    // Range with an exclusive upper bound:
    // 12345
  
    println("\nReverse order in steps of 2:")
    for (i in 6 downTo 0 step 2) {
        print(i)
    }
    // Reverse order in steps of 2:
    // 6420
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-for-loop-range"}

### 배열 {id="arrays"}

인덱스를 사용하여 배열이나 리스트를 순회하려는 경우 `indices` 프로퍼티를 사용할 수 있습니다.

```kotlin
fun main() {
    val routineSteps = arrayOf("Wake up", "Brush teeth", "Make coffee")
    //sampleStart
    for (i in routineSteps.indices) {
        println(routineSteps[i])
    }
    // Wake up
    // Brush teeth
    // Make coffee
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-for-loop-array"}

또는 표준 라이브러리의 [`.withIndex()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/with-index.html) 함수를 사용할 수 있습니다.

```kotlin
fun main() {
    val routineSteps = arrayOf("Wake up", "Brush teeth", "Make coffee")
    //sampleStart
    for ((index, value) in routineSteps.withIndex()) {
        println("The step at $index is \"$value\"")
    }
    // The step at 0 is "Wake up"
    // The step at 1 is "Brush teeth"
    // The step at 2 is "Make coffee"
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-for-loop-array-index"}

### 이터레이터 {id="iterators"}

`for` 반복문은 [이터레이터(iterator)](iterators.md)를 제공하는 모든 대상을 순회합니다. 컬렉션은 기본적으로 이터레이터를 제공하는 반면, 범위와 배열은 인덱스 기반 반복문으로 컴파일됩니다.

`Iterator<>`를 반환하는 `iterator()`라는 멤버 함수나 확장 함수를 제공하여 고유한 이터레이터를 만들 수 있습니다. `iterator()` 함수에는 `next()` 함수와 `Boolean`을 반환하는 `hasNext()` 함수가 있어야 합니다.

클래스에 대한 고유한 이터레이터를 만드는 가장 쉬운 방법은 [`Iterable<T>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-iterable/) 인터페이스를 상속하고 이미 정의되어 있는 `iterator()`, `next()`, `hasNext()` 함수를 재정의(override)하는 것입니다. 예를 들면 다음과 같습니다.

```kotlin
class Booklet(val totalPages: Int) : Iterable<Int> {
    override fun iterator(): Iterator<Int> {
        return object : Iterator<Int> {
            var current = 1
            override fun hasNext() = current <= totalPages
            override fun next() = current++
        }
    }
}

fun main() {
    val booklet = Booklet(3)
    for (page in booklet) {
        println("Reading page $page")
    }
    // Reading page 1
    // Reading page 2
    // Reading page 3
}
```
{kotlin-runnable="true" id="kotlin-for-loop-inherit-iterator"}

> [인터페이스](interfaces.md)와 [상속](inheritance.md)에 대해 자세히 알아보세요.
> 
{style="tip"}

또는 처음부터 함수를 직접 만들 수도 있습니다. 이 경우 함수에 `operator` 키워드를 추가합니다.

```kotlin
//sampleStart
class Booklet(val totalPages: Int) {
    operator fun iterator(): Iterator<Int> {
        return object {
            var current = 1

            operator fun hasNext() = current <= totalPages
            operator fun next() = current++
        }.let {
            object : Iterator<Int> {
                override fun hasNext() = it.hasNext()
                override fun next() = it.next()
            }
        }
    }
}
//sampleEnd

fun main() {
    val booklet = Booklet(3)
    for (page in booklet) {
        println("Reading page $page")
    }
    // Reading page 1
    // Reading page 2
    // Reading page 3
}
```
{kotlin-runnable="true" id="kotlin-for-loop-iterator-from-scratch"}

## While 반복문 {id="while-loops"}

`while` 및 `do-while` 반복문은 조건이 충족되는 동안 본문의 코드를 지속적으로 실행합니다.
두 반복문의 차이점은 조건을 확인하는 시점입니다.

* `while`은 조건을 먼저 확인하고, 조건이 충족되면 본문의 코드를 실행한 후 다시 조건 확인으로 돌아갑니다.
* `do-while`은 본문의 코드를 먼저 실행한 후 조건을 확인합니다. 조건이 충족되면 반복문이 다시 실행됩니다. 따라서 `do-while`의 본문은 조건과 관계없이 최소 한 번은 실행됩니다.

`while` 반복문의 경우 확인할 조건을 괄호 `()` 안에 넣고 본문을 중괄호 `{}` 안에 작성합니다.

```kotlin
fun main() {
    var carsInGarage = 0
    val maxCapacity = 3
//sampleStart
    while (carsInGarage < maxCapacity) {
        println("Car entered. Cars now in garage: ${++carsInGarage}")
    }
    // Car entered. Cars now in garage: 1
    // Car entered. Cars now in garage: 2
    // Car entered. Cars now in garage: 3

    println("Garage is full!")
    // Garage is full!
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-while-loop"}

`do-while` 반복문의 경우 괄호 `()` 안의 검사할 조건보다 먼저 중괄호 `{}` 안에 본문을 작성합니다.

```kotlin
import kotlin.random.Random

fun main() {
    var roll: Int
//sampleStart
    do {
        roll = Random.nextInt(1, 7)
        println("Rolled a $roll")
    } while (roll != 6)
    // Rolled a 2
    // Rolled a 6
    
    println("Got a 6! Game over.")
    // Got a 6! Game over.
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-do-while-loop"}

## 반복문에서의 Break와 continue {id="break-and-continue-in-loops"}

Kotlin은 반복문에서 전통적인 `break` 및 `continue` 연산자를 지원합니다. [반환과 점프](returns.md)를 참고하세요.