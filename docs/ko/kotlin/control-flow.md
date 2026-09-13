[//]: # (title: 조건문과 반복문)

코틀린은 프로그램의 흐름을 제어하기 위한 유연한 도구를 제공합니다. `if`, `when`, 그리고 반복문을 사용하여 조건에 대해 명확하고 표현력 있는 로직을 정의할 수 있습니다.

## If 식(If expression) {id="if-expression"}

코틀린에서 `if`를 사용하려면, 소괄호 `()` 안에 확인할 조건을 추가하고 중괄호 `{}` 안에 결과가 참일 때 실행할 동작을 추가합니다. 추가적인 분기와 확인을 위해 `else` 및 `else if`를 사용할 수 있습니다.

또한 `if`를 식(expression)으로 작성할 수도 있는데, 이를 통해 반환된 값을 변수에 직접 할당할 수 있습니다. 이 형태에서는 `else` 분기가 필수입니다. `if` 식은 다른 언어에 있는 삼항 연산자(`조건 ? 참 : 거짓`)와 동일한 목적으로 사용됩니다.

예를 들어:

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="if-else-if-kotlin"}

`if` 식의 각 분기는 블록이 될 수 있으며, 이 경우 마지막 식의 값이 결과값이 됩니다.

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="if-else-blocks-kotlin"}

## When 식 및 문(When expressions and statements) {id="when-expressions-and-statements"}

`when`은 여러 가능한 값이나 조건에 따라 코드를 실행하는 조건부 식입니다. 이는 Java, C 및 기타 언어의 `switch` 문과 유사합니다. `when`은 인자(argument)를 평가하고, 한 분기의 조건이 충족될 때까지 각 분기를 순서대로 비교합니다. 예를 들어:

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-conditions-when-statement"}

`when`은 **식(expression)** 또는 **문(statement)**으로 사용할 수 있습니다. 식으로서의 `when`은 나중에 코드에서 사용할 수 있는 값을 반환합니다. 문으로서의 `when`은 결과를 반환하지 않고 동작을 완료합니다.

<table>
   <tr>
       <td>식(Expression)</td>
       <td>문(Statement)</td>
   </tr>
   <tr>
<td>

```kotlin
// text 변수에 할당되는 
// 문자열을 반환합니다.
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
// print 문을 트리거합니다.
when (x) {
    1 -> print("x == 1")
    2 -> print("x == 2")
    else -> print("x is neither 1 nor 2")
}
```

</td>
</tr>
</table>

둘째로, `when`은 대상(subject)이 있거나 없이 사용할 수 있습니다. 동작 방식은 어느 쪽이든 동일합니다. 대상을 사용하면 무엇을 확인하고 있는지 명확하게 보여주기 때문에 일반적으로 코드를 더 읽기 쉽고 유지 관리하기 좋게 만듭니다.

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

`when`을 어떻게 사용하느냐에 따라 분기에서 가능한 모든 케이스를 처리해야 하는지 여부가 결정됩니다. 가능한 모든 케이스를 처리하는 것을 _망라적(exhaustive)_이라고 합니다.

### 문(Statements) {id="statements"}

`when`을 문으로 사용하는 경우, 가능한 모든 케이스를 처리할 필요는 없습니다. 다음 예제에서는 일부 케이스가 누락되어 어떤 분기도 트리거되지 않지만, 오류는 발생하지 않습니다.

```kotlin
fun main() {
    //sampleStart
    val deliveryStatus = "OutForDelivery"
    when (deliveryStatus) {
        // 모든 케이스가 처리되지 않음
        "Pending" -> print("Your order is being prepared")
        "Shipped" -> print("Your order is on the way")
    }
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-statement"}

`if`와 마찬가지로 각 분기는 블록이 될 수 있으며, 블록의 마지막 식의 값이 해당 분기의 값이 됩니다.

### 식(Expressions) {id="expressions"}

`when`을 식으로 사용하는 경우, **반드시** 가능한 모든 케이스를 처리해야 합니다. 처음으로 일치하는 분기의 값이 전체 식의 값이 됩니다. 모든 케이스를 처리하지 않으면 컴파일러가 오류를 발생시킵니다.

`when` 식에 대상이 있는 경우, `else` 분기를 사용하여 모든 케이스가 처리되도록 보장할 수 있지만 필수는 아닙니다. 예를 들어, 대상이 `Boolean`, [`enum` 클래스](enum-classes.md), [`sealed` 클래스](sealed-classes.md)이거나 이들의 nullable 대응 타입인 경우, `else` 분기 없이도 모든 케이스를 처리할 수 있습니다.

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
        // 모든 케이스가 처리되었으므로 else 분기가 필요하지 않음
        Bit.ZERO -> 0
        Bit.ONE -> 1
    }

    println("Random bit as number: $numericValue")
    // Random bit as number: 0
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-expression-subject"}

> `when` 식을 단순화하고 반복을 줄이려면 문맥 기반 해소(context-sensitive resolution, 현재 프리뷰 단계)를 시도해 보세요.
> 이 기능을 사용하면 예상 타입을 알 수 있는 경우 `when` 식에서 열거형(enum) 항목이나 봉인된(sealed) 클래스 멤버를 사용할 때 타입 이름을 생략할 수 있습니다.
> 
> 자세한 내용은 [문맥 기반 해소 프리뷰](whatsnew22.md#preview-of-context-sensitive-resolution) 또는 관련 [KEEP 제안서](https://github.com/Kotlin/KEEP/blob/improved-resolution-expected-type/proposals/context-sensitive-resolution.md)를 참조하세요.
> 
{style="tip"}

`when` 식에 대상이 **없는** 경우, 반드시 `else` 분기가 있어야 하며 그렇지 않으면 컴파일러 오류가 발생합니다. 다른 어떤 분기 조건도 만족하지 않을 때 `else` 분기가 평가됩니다.

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-no-subject"}

### when의 다른 활용 방법 {id="other-ways-to-use-when"}

`when` 식과 문은 코드를 단순화하고, 여러 조건을 처리하며, 타입 검사를 수행하는 다양한 방법을 제공합니다.

쉼표를 사용하여 여러 조건을 하나의 분기로 그룹화합니다.

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-multiple-cases"}

`true` 또는 `false`로 평가되는 식을 분기 조건으로 사용합니다.

```kotlin
fun main() {
    val storedPin = "1234"
    val enteredPin = 1234
  
    //sampleStart
    when (enteredPin) {
        // 식(Expression)
        storedPin.toInt() -> print("PIN is correct")
        else -> print("Incorrect PIN")
    }
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-branch-expression"}

`in` 또는 `!in` 키워드를 사용하여 값이 [범위(range)](ranges.md) 또는 컬렉션에 포함되는지 확인합니다.

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-ranges"}

`is` 또는 `!is` 키워드를 사용하여 값의 타입을 확인합니다. [스마트 캐스트(smart casts)](typecasts.md#smart-casts) 덕분에 타입의 멤버 함수와 프로퍼티에 직접 접근할 수 있습니다.

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-type-checks"}

전통적인 `if`-`else if` 체인 대신 `when`을 사용합니다.
대상이 없으면 분기 조건은 단순히 불리언 식입니다. 조건이 `true`인 첫 번째 분기가 실행됩니다.

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-replace-if"}

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-when-capture-subject"}

대상으로 도입된 변수의 범위는 `when` 식 또는 문의 본문으로 제한됩니다.

### 가드 조건(Guard conditions) {id="guard-conditions-in-when-expressions"}

가드 조건(Guard conditions)을 사용하면 `when` 식 또는 문의 분기에 둘 이상의 조건을 포함할 수 있어 복잡한 제어 흐름을 더 명확하고 간결하게 만들 수 있습니다. 가드 조건은 대상이 있는 `when`에서 사용할 수 있습니다.

동일한 분기에서 기본 조건 뒤에 `if`로 구분된 가드 조건을 배치합니다.

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

단일 `when` 식 또는 문에서 가드 조건이 있는 분기와 없는 분기를 혼합할 수 있습니다. 가드 조건이 있는 분기의 코드는 기본 조건과 가드 조건이 모두 `true`로 평가될 때만 실행됩니다. 기본 조건이 일치하지 않으면 가드 조건은 평가되지 않습니다.

`when` 문은 모든 케이스를 처리할 필요가 없으므로, `else` 분기가 없는 `when` 문에서 가드 조건을 사용할 때 일치하는 조건이 없으면 아무 코드도 실행되지 않습니다.

문과는 달리 `when` 식은 반드시 모든 케이스를 처리해야 합니다. `else` 분기가 없는 `when` 식에서 가드 조건을 사용하는 경우, 컴파일러는 런타임 오류를 방지하기 위해 가능한 모든 케이스를 처리하도록 요구합니다.

불리언 연산자 `&&`(AND) 또는 `||`(OR)를 사용하여 단일 분기 내에 여러 가드 조건을 결합할 수 있습니다. 혼란을 방지하기 위해 불리언 식 주위에 [괄호를 사용하세요](coding-conventions.md#guard-conditions-in-when-expression).

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
    // 위의 조건 중 어느 것도 일치하지 않고 animal.eatsPlants가 참이면 giveLettuce() 호출
    else if animal.eatsPlants -> giveLettuce()
    // 위의 조건 중 어느 것도 일치하지 않으면 "Unknown animal" 출력
    else -> println("Unknown animal")
}
```

### JVM에서의 바이트코드 생성 {id="bytecode-generation-on-the-jvm"}

JVM 21 이상을 대상으로 코틀린 코드를 컴파일할 때, 컴파일러는 적격한 `when` 식에 대해 [`invokedynamic`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/invoke/package-summary.html) 명령어를 생성합니다. 이를 통해 Java의 `switch` 문에서 생성되는 바이트코드와 유사하게 더 작은 바이트코드가 생성됩니다.

컴파일러는 다음 조건을 모두 만족할 때 [`SwitchBootstraps.typeSwitch()`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/runtime/SwitchBootstraps.html) 메서드와 함께 `invokedynamic`을 사용합니다.

* `else`를 제외한 모든 조건이 `is` 또는 `null` 검사입니다.
* `when` 식에 [가드 조건(`if`)](#guard-conditions-in-when-expressions)이 포함되어 있지 않습니다.
* 조건에 변경 가능한 코틀린 컬렉션(`MutableList`)이나 함수 타입(`kotlin.Function1`, `kotlin.Function2` 등)과 같이 직접 타입 검사를 수행할 수 없는 타입이 포함되어 있지 않습니다.
* `when` 식에 `else` 외에 최소 2개 이상의 조건이 있습니다.
* 모든 분기가 `when` 식의 동일한 대상을 검사합니다.

예를 들어:

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

여기서 `when (shape)` 식은 바이트코드에서 여러 번의 `instanceof` 검사를 수행하는 대신 단일 `invokedynamic` 타입 스위치(type switch)로 컴파일됩니다.

## For 반복문 {id="for-loops"}

[컬렉션](collections-overview.md), [배열](arrays.md), 또는 [범위](ranges.md)를 순회하려면 `for` 루프를 사용합니다.

```kotlin
for (item in collection) print(item)
```

`for` 루프의 본문은 중괄호 `{}`를 사용한 블록이 될 수 있습니다.

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-for-loop"}

### 범위(Ranges) {id="ranges"}

숫자 범위를 순회하려면 `..` 및 `..<` 연산자가 포함된 [범위 식(range expression)](ranges.md)을 사용합니다.

```kotlin
fun main() {
//sampleStart
    println("Closed-ended range:")
    for (i in 1..6) {
        print(i)
    }
    // Closed-ended range:
    // 123456
  
    println("\nOpen-ended range:")
    for (i in 1..<6) {
        print(i)
    }
    // Open-ended range:
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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-for-loop-range"}

### 배열(Arrays) {id="arrays"}

배열이나 리스트를 인덱스와 함께 순회하려면 `indices` 프로퍼티를 사용할 수 있습니다.

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-for-loop-array"}

또는 표준 라이브러리의 [`.withIndex()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/with-index.html) 함수를 사용할 수도 있습니다.

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-for-loop-array-index"}

### 반복자(Iterators) {id="iterators"}

`for` 루프는 [반복자(iterator)](iterators.md)를 제공하는 모든 대상을 순회합니다. 컬렉션은 기본적으로 반복자를 제공하는 반면, 범위와 배열은 인덱스 기반 루프로 컴파일됩니다.

`Iterator<>`를 반환하는 `iterator()`라는 멤버 함수 또는 확장 함수를 제공하여 고유한 반복자를 만들 수 있습니다. `iterator()` 함수는 `next()` 함수와 `Boolean`을 반환하는 `hasNext()` 함수를 가져야 합니다.

클래스에 대한 고유한 반복자를 만드는 가장 쉬운 방법은 [`Iterable<T>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-iterable/) 인터페이스를 상속받아 이미 정의된 `iterator()`, `next()`, `hasNext()` 함수를 오버라이드하는 것입니다. 예를 들어:

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-for-loop-inherit-iterator"}

> [인터페이스](interfaces.md)와 [상속](inheritance.md)에 대해 자세히 알아보세요.
> 
{style="tip"}

또는 함수를 처음부터 직접 만들 수도 있습니다. 이 경우 함수에 `operator` 키워드를 추가하세요.

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-for-loop-iterator-from-scratch"}

## While 반복문 {id="while-loops"}

`while` 및 `do-while` 루프는 조건이 충족되는 동안 본문의 코드를 계속해서 실행합니다. 두 루프의 차이점은 조건 확인 시점입니다.

* `while`은 조건을 먼저 확인하고, 조건이 충족되면 본문의 코드를 실행한 후 다시 조건 확인으로 돌아갑니다.
* `do-while`은 본문의 코드를 먼저 실행한 후 조건을 확인합니다. 조건이 충족되면 루프가 반복됩니다. 따라서 `do-while`의 본문은 조건과 관계없이 최소 한 번은 실행됩니다.

`while` 루프의 경우, 소괄호 `()` 안에 확인할 조건을 넣고 중괄호 `{}` 안에 본문을 넣습니다.

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-while-loop"}

`do-while` 루프의 경우, 소괄호 `()` 안의 조건을 확인하기 전에 먼저 중괄호 `{}` 안에 본문을 작성합니다.

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-do-while-loop"}

## 반복문에서의 break 및 continue {id="break-and-continue-in-loops"}

코틀린은 반복문에서 전통적인 `break` 및 `continue` 연산자를 지원합니다. [반환 및 점프](returns.md)를 참조하세요.