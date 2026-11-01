[//]: # (title: 함수)

<no-index/>

Kotlin에서는 `fun` 키워드를 사용하여 직접 함수를 선언할 수 있습니다.

```kotlin
fun hello() {
    return println("Hello, world!")
}

fun main() {
    hello()
    // Hello, world!
}
```
{kotlin-runnable="true" id="kotlin-tour-function-demo"}

Kotlin에서:

* 함수 매개변수는 괄호 `()` 안에 작성합니다.
* 각 매개변수에는 반드시 타입이 지정되어야 하며, 여러 개의 매개변수는 쉼표 `,`로 구분합니다.
* 반환 타입은 함수의 괄호 `()` 뒤에 콜론 `:`으로 구분하여 작성합니다.
* 함수의 본문은 중괄호 `{}` 안에 작성합니다.
* `return` 키워드는 함수를 종료하거나 함수에서 값을 반환할 때 사용합니다.

> 함수가 의미 있는 값을 반환하지 않는 경우, 반환 타입과 `return` 키워드를 생략할 수 있습니다. 자세한 내용은 [반환값이 없는 함수](#functions-without-return)에서 확인할 수 있습니다.
>
{style="note"}

다음 예제에서:

* `x`와 `y`는 함수의 매개변수입니다.
* `x`와 `y`의 타입은 `Int`입니다.
* 함수의 반환 타입은 `Int`입니다.
* 이 함수를 호출하면 `x`와 `y`의 합을 반환합니다.

```kotlin
fun sum(x: Int, y: Int): Int {
    return x + y
}

fun main() {
    println(sum(1, 2))
    // 3
}
```
{kotlin-runnable="true" id="kotlin-tour-simple-function"}

> [코딩 컨벤션](coding-conventions.md#function-names)에서는 함수 이름을 소문자로 시작하고 밑줄(underscore) 없이 카멜 케이스(camelCase)를 사용할 것을 권장합니다.
> 
{style="note"}

## 명명된 인자 {id="named-arguments"}

간결한 코드를 위해 함수를 호출할 때 매개변수 이름을 생략할 수 있습니다. 하지만 매개변수 이름을 명시하면 코드의 가독성이 높아집니다. 이를 **명명된 인자(named arguments)**를 사용한다고 합니다. 매개변수 이름을 명시하면 매개변수를 원하는 순서대로 작성할 수 있습니다.

> 다음 예제에서는 [문자열 템플릿](strings.md#string-templates)(`$`)을 사용하여 매개변수 값에 접근하고, 이를 `String` 타입으로 변환한 다음 출력용 문자열로 결합합니다.
> 
{style="tip"}

```kotlin
fun printMessageWithPrefix(message: String, prefix: String) {
    println("[$prefix] $message")
}

fun main() {
    // 매개변수 순서를 바꾸고 명명된 인자를 사용함
    printMessageWithPrefix(prefix = "Log", message = "Hello")
    // [Log] Hello
}
```
{kotlin-runnable="true" id="kotlin-tour-named-arguments-function"}

## 기본 매개변수 값 {id="default-parameter-values"}

함수 매개변수의 기본값을 정의할 수 있습니다. 기본값이 지정된 매개변수는 함수를 호출할 때 생략할 수 있습니다. 기본값을 선언하려면 타입 뒤에 대입 연산자 `=`를 사용합니다.

```kotlin
fun printMessageWithPrefix(message: String, prefix: String = "Info") {
    println("[$prefix] $message")
}

fun main() {
    // 두 매개변수를 모두 전달하여 함수 호출
    printMessageWithPrefix("Hello", "Log") 
    // [Log] Hello
    
    // message 매개변수만 전달하여 함수 호출
    printMessageWithPrefix("Hello")        
    // [Info] Hello
    
    printMessageWithPrefix(prefix = "Log", message = "Hello")
    // [Log] Hello
}
```
{kotlin-runnable="true" id="kotlin-tour-default-param-function"}

> 기본값이 있는 모든 매개변수를 생략하는 대신 특정 매개변수만 건너뛸 수도 있습니다. 하지만 첫 번째로 건너뛴 매개변수 이후의 모든 매개변수는 반드시 이름을 명시해야 합니다.
>
{style="note"}

## 반환값이 없는 함수 {id="functions-without-return"}

함수가 유용한 값을 반환하지 않는 경우, 반환 타입은 `Unit`이 됩니다. `Unit`은 단 하나의 값인 `Unit`만을 가지는 타입입니다. 함수 본문에서 `Unit`이 반환된다고 명시적으로 선언할 필요는 없습니다. 즉, `return` 키워드를 사용하거나 반환 타입을 선언하지 않아도 됩니다.

```kotlin
fun printMessage(message: String) {
    println(message)
    // `return Unit` 또는 `return`은 선택 사항입니다.
}

fun main() {
    printMessage("Hello")
    // Hello
}
```
{kotlin-runnable="true" id="kotlin-tour-unit-function"}

## 단일 표현식 함수 {id="single-expression-functions"}

코드를 더욱 간결하게 만들기 위해 단일 표현식 함수(single-expression functions)를 사용할 수 있습니다. 예를 들어, `sum()` 함수를 다음과 같이 축약할 수 있습니다.

```kotlin
fun sum(x: Int, y: Int): Int {
    return x + y
}

fun main() {
    println(sum(1, 2))
    // 3
}
```
{kotlin-runnable="true" id="kotlin-tour-simple-function-before"}

중괄호 `{}`를 제거하고 대입 연산자 `=`를 사용하여 함수 본문을 선언할 수 있습니다. 대입 연산자 `=`를 사용하면 Kotlin이 타입을 추론하므로 반환 타입 또한 생략할 수 있습니다. 그러면 `sum()` 함수를 한 줄로 작성할 수 있습니다.

```kotlin
fun sum(x: Int, y: Int) = x + y

fun main() {
    println(sum(1, 2))
    // 3
}
```
{kotlin-runnable="true" id="kotlin-tour-simple-function-after"}

하지만 다른 개발자가 코드를 빠르게 이해할 수 있도록 대입 연산자 `=`를 사용할 때도 반환 타입을 명시적으로 정의하는 것이 좋습니다.

> 중괄호 `{}`를 사용하여 함수 본문을 선언하는 경우에는 `Unit` 타입이 아닌 한 반환 타입을 반드시 선언해야 합니다.
> 
{style="note"}

## 함수에서의 조기 반환 {id="early-returns-in-functions"}

함수의 코드가 특정 지점을 넘어 계속 실행되는 것을 중단하려면 `return` 키워드를 사용합니다. 다음 예제에서는 `if`를 사용하여 조건식이 참인 경우 함수를 조기에 반환(early return)합니다.

```kotlin
// 등록된 사용자 이름 목록
val registeredUsernames = mutableListOf("john_doe", "jane_smith")

// 등록된 이메일 목록
val registeredEmails = mutableListOf("john@example.com", "jane@example.com")

fun registerUser(username: String, email: String): String {
    // 이미 사용 중인 사용자 이름인 경우 조기 반환
    if (username in registeredUsernames) {
        return "Username already taken. Please choose a different username."
    }

    // 이미 등록된 이메일인 경우 조기 반환
    if (email in registeredEmails) {
        return "Email already registered. Please use a different email."
    }

    // 사용자 이름과 이메일이 사용 중이지 않은 경우 등록 진행
    registeredUsernames.add(username)
    registeredEmails.add(email)

    return "User registered successfully: $username"
}

fun main() {
    println(registerUser("john_doe", "newjohn@example.com"))
    // Username already taken. Please choose a different username.
    println(registerUser("new_user", "newuser@example.com"))
    // User registered successfully: new_user
}
```
{kotlin-runnable="true" id="kotlin-tour-function-early-return"}

## 연습 문제: 함수 {id="practice-functions"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="원의 넓이 계산하기" id="functions-exercise-1">

원의 반지름을 정수형태로 매개변수로 받아 해당 원의 넓이를 출력하는 `circleArea`라는 함수를 작성하세요.

> 이 연습 문제에서는 `PI`를 통해 <math>π</math> 값에 접근하기 위해 패키지를 임포트합니다. 패키지 임포트에 대한 자세한 내용은 [패키지와 임포트](packages.md)를 참조하세요.
>
{style="tip"}

<deflist collapsible="true" id="kotlin-tour-functions-exercise-1-hint">
    <def title="힌트">
        원의 넓이를 구하는 공식은 <math>πr^2</math>이며, 여기서 <math>r</math>은 반지름입니다.
    </def>
</deflist>

```kotlin
import kotlin.math.PI

// 여기에 코드를 작성하세요

fun main() {
    println(circleArea(2))
}
```
{validate="false" kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/CircleAreaTest.kt" id="kotlin-tour-functions-exercise-1"}

```kotlin
import kotlin.math.PI

fun circleArea(radius: Int): Double {
    return PI * radius * radius
}

fun main() {
    println(circleArea(2)) // 12.566370614359172
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/CircleAreaTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-functions-solution-1"}

</def>
<def title="함수를 단일 표현식으로 다시 작성하기" id="functions-exercise-2">

이전 연습 문제의 `circleArea` 함수를 단일 표현식 함수로 다시 작성해 보세요.

```kotlin
import kotlin.math.PI

//sampleStart
// 여기에 코드를 작성하세요
//sampleEnd

fun main() {
    println(circleArea(2))
}
```
{validate="false" kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/CircleAreaTest.kt" folded-button="false" id="kotlin-tour-functions-exercise-2"}

```kotlin
import kotlin.math.PI

fun circleArea(radius: Int): Double = PI * radius * radius

fun main() {
    println(circleArea(2)) // 12.566370614359172
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/CircleAreaTest.kt" folded-button="false" initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-functions-solution-2"}

</def>
<def title="기본 매개변수와 명명된 인자를 사용하여 함수 리팩터링하기" id="functions-exercise-3">

시, 분, 초 단위로 주어진 시간 간격을 초 단위로 변환하는 함수가 있습니다. 대부분의 경우 하나 또는 두 개의 함수 매개변수만 전달하면 되며 나머지는 0입니다. 기본 매개변수 값과 명명된 인자를 사용하여 코드를 읽기 쉽도록 함수와 이를 호출하는 코드를 개선해 보세요.

```kotlin
// 이 함수를 리팩터링하세요: hours, minutes, seconds의 기본값을 0으로 지정하세요
fun intervalInSeconds(hours: Int, minutes: Int, seconds: Int) =
    ((hours * 60) + minutes) * 60 + seconds

fun main() {
    // 가능한 경우 명명된 인자를 사용하여 이러한 호출을 단순화하세요
    println(intervalInSeconds(1, 20, 15))
    println(intervalInSeconds(0, 1, 25))
    println(intervalInSeconds(2, 0, 0))
    println(intervalInSeconds(0, 10, 0))
    println(intervalInSeconds(1, 0, 1))
}
```
{validate="false" kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/IntervalInSecondsTest.kt" id="kotlin-tour-functions-exercise-3"}

```kotlin
fun intervalInSeconds(hours: Int = 0, minutes: Int = 0, seconds: Int = 0) =
    ((hours * 60) + minutes) * 60 + seconds

fun main() {
    println(intervalInSeconds(1, 20, 15))
    println(intervalInSeconds(minutes = 1, seconds = 25))
    println(intervalInSeconds(hours = 2))
    println(intervalInSeconds(minutes = 10))
    println(intervalInSeconds(hours = 1, seconds = 1))
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/IntervalInSecondsTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-functions-solution-3"}

</def>
</deflist>

## 람다 표현식 {id="lambda-expressions"}

Kotlin에서는 람다 표현식(lambda expressions)을 사용하여 함수를 훨씬 더 간결하게 작성할 수 있습니다.

예를 들어, 다음과 같은 `uppercaseString()` 함수가 있습니다.

```kotlin
fun uppercaseString(text: String): String {
    return text.uppercase()
}
fun main() {
    println(uppercaseString("hello"))
    // HELLO
}
```
{kotlin-runnable="true" id="kotlin-tour-lambda-function-before"}

이 함수는 다음과 같이 람다 표현식으로도 작성할 수 있습니다.

```kotlin
fun main() {
    val upperCaseString = { text: String -> text.uppercase() }
    println(upperCaseString("hello"))
    // HELLO
}
```
{kotlin-runnable="true" id="kotlin-tour-lambda-variable"}

람다 표현식은 언뜻 보기에 이해하기 어려울 수 있으므로 자세히 살펴보겠습니다. 람다 표현식은 중괄호 `{}` 안에 작성합니다.

람다 표현식 내부에는 다음을 작성합니다:

* 매개변수를 작성한 뒤 `->`를 붙입니다.
* `->` 뒤에 함수 본문을 작성합니다.

이전 예제에서:

* `text`는 함수의 매개변수입니다.
* `text`의 타입은 `String`입니다.
* 이 함수는 `text`에 대해 호출된 [`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase.html) 함수의 결과를 반환합니다.
* 전체 람다 표현식은 대입 연산자 `=`를 통해 `upperCaseString` 변수에 할당됩니다.
* 이 람다 표현식은 `upperCaseString` 변수를 함수처럼 사용하고 `"hello"` 문자열을 매개변수로 전달하여 호출합니다.
* `println()` 함수가 결과를 출력합니다.

> 매개변수가 없는 람다를 선언하는 경우에는 `->`를 사용할 필요가 없습니다. 예를 들면 다음과 같습니다:
> ```kotlin
> { println("Log message") }
> ```
>
{style="note"}

람다 표현식은 다양한 방식으로 활용할 수 있습니다:

* [람다 표현식을 다른 함수의 매개변수로 전달하기](#pass-to-another-function)
* [함수에서 람다 표현식 반환하기](#return-from-a-function)
* [람다 표현식 단독으로 호출하기](#invoke-separately)

### 다른 함수에 전달하기 {id="pass-to-another-function"}

람다 표현식을 함수에 전달하면 유용한 대표적인 예로 컬렉션의 [`.filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html) 함수를 들 수 있습니다.

```kotlin
fun main() {
    //sampleStart
    val numbers = listOf(1, -2, 3, -4, 5, -6)
    
    val positives = numbers.filter ({ x -> x > 0 })
    
    val isNegative = { x: Int -> x < 0 }
    val negatives = numbers.filter(isNegative)
    
    println(positives)
    // [1, 3, 5]
    println(negatives)
    // [-2, -4, -6]
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-lambda-filter"}

`.filter()` 함수는 람다 표현식을 조건식(predicate)으로 받아 리스트의 각 요소에 적용합니다. 이 함수는 조건식이 `true`를 반환하는 요소만 유지합니다.

* `{ x -> x > 0 }`은 요소가 양수이면 `true`를 반환합니다.
* `{ x -> x < 0 }`은 요소가 음수이면 `true`를 반환합니다.

이 예제는 람다 표현식을 함수에 전달하는 두 가지 방법을 보여줍니다:

* 양수의 경우, `.filter()` 함수 안에 람다 표현식을 직접 전달했습니다.
* 음수의 경우, 람다 표현식을 `isNegative` 변수에 할당했습니다. 그런 다음 `isNegative` 변수를 `.filter()` 함수의 매개변수로 사용했습니다. 이 경우 람다 표현식 내에서 함수 매개변수(`x`)의 타입을 명시해야 합니다.

> 람다 표현식이 유일한 함수 매개변수인 경우, 함수의 괄호 `()`를 생략할 수 있습니다.
> 
> ```kotlin
> val positives = numbers.filter { x -> x > 0 }
> ```
> 
> 이는 [후행 람다](#trailing-lambdas)의 한 예이며, 이 장의 마지막 부분에서 더 자세히 설명합니다.
>
{style="note"}

또 다른 좋은 예로는 컬렉션의 항목을 변환하는 [`.map()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map.html) 함수가 있습니다.

```kotlin
fun main() {
    //sampleStart
    val numbers = listOf(1, -2, 3, -4, 5, -6)
    val doubled = numbers.map { x -> x * 2 }
    
    val isTripled = { x: Int -> x * 3 }
    val tripled = numbers.map(isTripled)
    
    println(doubled)
    // [2, -4, 6, -8, 10, -12]
    println(tripled)
    // [3, -6, 9, -12, 15, -18]
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-lambda-map"}

`.map()` 함수는 변환 함수로 람다 표현식을 받습니다:

* `{ x -> x * 2 }`는 리스트의 각 요소를 가져와 해당 요소에 2를 곱한 값을 반환합니다.
* `{ x -> x * 3 }`은 리스트의 각 요소를 가져와 해당 요소에 3을 곱한 값을 반환합니다.

### 함수 타입 {id="function-types"}

함수에서 람다 표현식을 반환하기 전에 먼저 **함수 타입(function types)**을 이해해야 합니다.

이미 기본 타입에 대해서는 배웠지만, 함수 자체도 타입을 갖습니다. Kotlin의 타입 추론은 매개변수 타입으로부터 함수의 타입을 추론할 수 있습니다. 하지만 함수의 타입을 명시적으로 지정해야 하는 경우도 있습니다. 컴파일러는 해당 함수에 허용되는 것과 허용되지 않는 것을 파악하기 위해 함수 타입이 필요합니다.

함수 타입의 문법은 다음과 같습니다:

* 각 매개변수의 타입을 괄호 `()` 안에 쉼표 `,`로 구분하여 작성합니다.
* 반환 타입은 `->` 뒤에 작성합니다.

예: `(String) -> String` 또는 `(Int, Int) -> Int`.

`upperCaseString()`에 대한 함수 타입을 정의한 람다 표현식의 모습은 다음과 같습니다:

```kotlin
val upperCaseString: (String) -> String = { text -> text.uppercase() }

fun main() {
    println(upperCaseString("hello"))
    // HELLO
}
```
{kotlin-runnable="true" id="kotlin-tour-lambda-function-type"}

람다 표현식에 매개변수가 없는 경우 괄호 `()`는 비워둡니다. 예: `() -> Unit`

> 매개변수 타입과 반환 타입은 람다 표현식 내부 또는 함수 타입으로 반드시 선언해야 합니다. 그렇지 않으면 컴파일러가 람다 표현식의 타입을 알 수 없습니다.
> 
> 예를 들어 다음과 같은 코드는 동작하지 않습니다:
> 
> `val upperCaseString = { str -> str.uppercase() }`
>
{style="note"}

### 함수에서 반환하기 {id="return-from-a-function"}

람다 표현식은 함수에서 반환될 수 있습니다. 컴파일러가 반환되는 람다 표현식의 타입을 이해할 수 있도록 함수 타입을 선언해야 합니다.

다음 예제에서 `toSeconds()` 함수는 `Int` 타입의 매개변수를 받아 `Int` 값을 반환하는 람다 표현식을 항상 반환하므로 함수 타입이 `(Int) -> Int`가 됩니다.

이 예제에서는 `when` 표현식을 사용하여 `toSeconds()`가 호출될 때 반환될 람다 표현식을 결정합니다:

```kotlin
fun toSeconds(time: String): (Int) -> Int = when (time) {
    "hour" -> { value -> value * 60 * 60 }
    "minute" -> { value -> value * 60 }
    "second" -> { value -> value }
    else -> { value -> value }
}

fun main() {
    val timesInMinutes = listOf(2, 10, 15, 1)
    val min2sec = toSeconds("minute")
    val totalTimeInSeconds = timesInMinutes.map(min2sec).sum()
    println("Total time is $totalTimeInSeconds secs")
    // Total time is 1680 secs
}
```
{kotlin-runnable="true" id="kotlin-tour-lambda-return-from-function"}

### 단독으로 호출하기 {id="invoke-separately"}

람다 표현식은 중괄호 `{}` 뒤에 괄호 `()`를 추가하고 괄호 안에 필요한 매개변수를 넣어 단독으로 호출할 수 있습니다.

```kotlin
fun main() {
    //sampleStart
    println({ text: String -> text.uppercase() }("hello"))
    // HELLO
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-lambda-standalone"}

### 후행 람다 {id="trailing-lambdas"}

앞서 살펴본 바와 같이, 람다 표현식이 유일한 함수 매개변수인 경우 함수의 괄호 `()`를 생략할 수 있습니다. 함수 매개변수의 마지막 인자로 람다 표현식이 전달되는 경우에는 해당 표현식을 함수 괄호 `()` 바깥에 작성할 수 있습니다. 두 경우 모두 이 문법을 **후행 람다(trailing lambda)**라고 부릅니다.

예를 들어, [`.fold()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/fold.html) 함수는 초기값과 연산(operation)을 받습니다:

```kotlin
fun main() {
    //sampleStart
    // 초기값은 0입니다. 
    // 이 연산은 초기값에 리스트의 모든 항목을 누적하여 더합니다.
    println(listOf(1, 2, 3).fold(0, { x, item -> x + item })) // 6

    // 또는 후행 람다 형태로 작성할 수 있습니다
    println(listOf(1, 2, 3).fold(0) { x, item -> x + item })  // 6
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-trailing-lambda"}

람다 표현식에 대한 자세한 내용은 [람다 표현식과 익명 함수](lambdas.md#lambda-expressions-and-anonymous-functions)를 참조하세요.

투어의 다음 단계에서는 Kotlin의 [클래스](kotlin-tour-classes.md)에 대해 알아봅니다.

## 연습 문제: 람다 표현식 {completion-point="true" id="practice-lambda-expressions"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="람다 표현식을 사용하여 URL 목록 만들기" id="lambdas-exercise-1">

웹 서비스에서 지원하는 동작(action) 목록, 모든 요청에 대한 공통 접두사(prefix), 그리고 특정 리소스의 ID가 주어졌습니다.
ID가 5인 리소스에 대해 `title` 동작을 요청하려면 `https://example.com/book-info/5/title`과 같은 URL을 생성해야 합니다.
람다 표현식을 사용하여 동작 목록으로부터 URL 목록을 생성해 보세요.

```kotlin
fun buildUrls(actions: List<String>, prefix: String, id: Int): List<String> {
    return TODO() // 여기에 코드를 작성하세요
}

fun main() {
    val actions = listOf("title", "year", "author")
    val urls = buildUrls(actions, "https://example.com/book-info", 5)
    println(urls)
}
```
{validate="false" kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/LambdasExercise1Test.kt" id="kotlin-tour-lambdas-exercise-1"}

```kotlin
fun buildUrls(actions: List<String>, prefix: String, id: Int): List<String> {
    return actions.map { action -> "$prefix/$id/$action" }
}

fun main() {
    val actions = listOf("title", "year", "author")
    val urls = buildUrls(actions, "https://example.com/book-info", 5)
    println(urls)
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/LambdasExercise1Test.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-lambdas-solution-1"}

</def>
<def title="동작을 여러 번 반복하기" id="lambdas-exercise-2">

`Int` 값과 동작(타입이 `() -> Unit`인 함수)을 매개변수로 받아 지정된 횟수만큼 동작을 반복하는 함수를 작성하세요. 그런 다음 이 함수를 사용하여 "Hello"를 5번 출력해 보세요.

```kotlin
fun repeatN(n: Int, action: () -> Unit) {
    // 여기에 코드를 작성하세요
}

fun main() {
    // 여기에 코드를 작성하세요
}
```
{validate="false" kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/LambdasExercise2Test.kt" id="kotlin-tour-lambdas-exercise-2"}

```kotlin
fun repeatN(n: Int, action: () -> Unit) {
    for (i in 1..n) {
        action()
    }
}

fun main() {
    repeatN(5) {
        println("Hello")
    }
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/LambdasExercise2Test.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-lambdas-solution-2"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-control-flow.md" mode="outline" icon="arrow-left" icon-position="left">이전 단계</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-classes.md" mode="classic" icon="arrow-right" icon-position="right">다음 단계</a>
  </li>
</list>