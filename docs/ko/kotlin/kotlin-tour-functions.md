[//]: # (title: 함수)

<no-index/>

Kotlin에서는 `fun` 키워드를 사용하여 자신만의 함수를 선언할 수 있습니다.

```kotlin
fun hello() {
    return println("Hello, world!")
}

fun main() {
    hello()
    // Hello, world!
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-function-demo"}

Kotlin의 함수 특징은 다음과 같습니다:

* 함수 파라미터는 소괄호 `()` 안에 작성합니다.
* 각 파라미터는 타입을 가져야 하며, 여러 파라미터는 쉼표 `,`로 구분합니다.
* 반환 타입은 함수의 소괄호 `()` 뒤에 콜론 `:`으로 구분하여 작성합니다.
* 함수의 본문은 중괄호 `{}` 안에 작성합니다.
* `return` 키워드는 함수를 종료하거나 값을 반환할 때 사용합니다.

> 함수가 유용한 값을 반환하지 않는 경우, 반환 타입과 `return` 키워드를 생략할 수 있습니다. 이에 대한 자세한 내용은 [반환값이 없는 함수](#functions-without-return) 섹션에서 확인하세요.
>
{style="note"}

다음 예제에서:

* `x`와 `y`는 함수의 파라미터입니다.
* `x`와 `y`는 `Int` 타입입니다.
* 함수의 반환 타입은 `Int`입니다.
* 함수가 호출되면 `x`와 `y`의 합을 반환합니다.

```kotlin
fun sum(x: Int, y: Int): Int {
    return x + y
}

fun main() {
    println(sum(1, 2))
    // 3
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-simple-function"}

> Kotlin의 [코딩 컨벤션](coding-conventions.md#function-names)에서는 함수 이름을 소문자로 시작하고 언더스코어(_) 없이 카멜 케이스(camel case)를 사용할 것을 권장합니다.
> 
{style="note"}

## 이름 붙은 인자 (Named arguments)

코드를 간결하게 만들기 위해 함수를 호출할 때 파라미터 이름을 생략할 수 있습니다. 하지만 파라미터 이름을 포함하면 코드를 더 읽기 쉽게 만들 수 있습니다. 이를 **이름 붙은 인자(named arguments)**라고 합니다. 파라미터 이름을 포함하는 경우, 파라미터의 순서를 자유롭게 작성할 수 있습니다.

> 다음 예제에서는 파라미터 값에 접근하고, 이를 `String` 타입으로 변환한 뒤, 출력을 위해 문자열로 결합하는 데 [문자열 템플릿](strings.md#string-templates)이 사용되었습니다.
> 
{style="tip"}

```kotlin
fun printMessageWithPrefix(message: String, prefix: String) {
    println("[$prefix] $message")
}

fun main() {
    // 파라미터 순서를 바꿔서 이름 붙은 인자 사용
    printMessageWithPrefix(prefix = "Log", message = "Hello")
    // [Log] Hello
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-named-arguments-function"}

## 기본 파라미터 값 (Default parameter values)

함수 파라미터에 기본값을 정의할 수 있습니다. 기본값이 있는 파라미터는 함수 호출 시 생략할 수 있습니다. 기본값을 선언하려면 타입 뒤에 대입 연산자 `=`를 사용합니다.

```kotlin
fun printMessageWithPrefix(message: String, prefix: String = "Info") {
    println("[$prefix] $message")
}

fun main() {
    // 두 파라미터를 모두 사용하여 함수 호출
    printMessageWithPrefix("Hello", "Log") 
    // [Log] Hello
    
    // message 파라미터만 사용하여 함수 호출
    printMessageWithPrefix("Hello")        
    // [Info] Hello
    
    printMessageWithPrefix(prefix = "Log", message = "Hello")
    // [Log] Hello
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-default-param-function"}

> 모든 파라미터를 생략하는 대신 기본값이 있는 특정 파라미터만 건너뛸 수 있습니다. 그러나 첫 번째 파라미터를 건너뛴 후에는 그 뒤의 모든 파라미터에 이름을 붙여야 합니다.
>
{style="note"}

## 반환값이 없는 함수

함수가 유용한 값을 반환하지 않는 경우 반환 타입은 `Unit`입니다. `Unit`은 `Unit`이라는 단 하나의 값만 가지는 타입입니다. 함수 본문에서 `Unit`이 반환된다고 명시적으로 선언할 필요는 없습니다. 즉, `return` 키워드를 사용하거나 반환 타입을 선언할 필요가 없습니다.

```kotlin
fun printMessage(message: String) {
    println(message)
    // `return Unit` 또는 `return`은 선택사항입니다.
}

fun main() {
    printMessage("Hello")
    // Hello
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-unit-function"}

## 단일 표현식 함수 (Single-expression functions)

코드를 더 간결하게 만들기 위해 단일 표현식 함수를 사용할 수 있습니다. 예를 들어, `sum()` 함수를 줄일 수 있습니다.

```kotlin
fun sum(x: Int, y: Int): Int {
    return x + y
}

fun main() {
    println(sum(1, 2))
    // 3
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-simple-function-before"}

중괄호 `{}`를 제거하고 대입 연산자 `=`를 사용하여 함수 본문을 선언할 수 있습니다. 대입 연산자 `=`를 사용하면 Kotlin이 타입을 추론하므로 반환 타입도 생략할 수 있습니다. 그러면 `sum()` 함수는 한 줄이 됩니다.

```kotlin
fun sum(x: Int, y: Int) = x + y

fun main() {
    println(sum(1, 2))
    // 3
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-simple-function-after"}

하지만 다른 개발자가 코드를 빠르게 이해할 수 있도록 대입 연산자 `=`를 사용할 때도 반환 타입을 명시적으로 정의하는 것이 좋습니다.

> 함수 본문을 선언하기 위해 중괄호 `{}`를 사용하는 경우, 반환 타입이 `Unit`이 아니라면 반드시 반환 타입을 선언해야 합니다.
> 
{style="note"}

## 함수의 조기 반환 (Early returns)

함수의 코드가 특정 시점 이후로 더 이상 실행되지 않도록 하려면 `return` 키워드를 사용합니다. 다음 예제는 `if`를 사용하여 조건식이 참인 경우 함수에서 조기에 반환합니다.

```kotlin
// 등록된 사용자 이름 목록
val registeredUsernames = mutableListOf("john_doe", "jane_smith")

// 등록된 이메일 목록
val registeredEmails = mutableListOf("john@example.com", "jane@example.com")

fun registerUser(username: String, email: String): String {
    // 사용자 이름이 이미 사용 중인 경우 조기 반환
    if (username in registeredUsernames) {
        return "Username already taken. Please choose a different username."
    }

    // 이메일이 이미 등록된 경우 조기 반환
    if (email in registeredEmails) {
        return "Email already registered. Please use a different email."
    }

    // 사용자 이름과 이메일이 사용 중이 아니면 등록 진행
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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-function-early-return"}

## 함수 연습 문제

### 연습 문제 1 {initial-collapse-state="collapsed" collapsible="true" id="functions-exercise-1"}

원의 반지름을 정수 형식으로 파라미터로 받아 그 원의 넓이를 출력하는 `circleArea`라는 함수를 작성하세요.

> 이 연습 문제에서는 `PI`를 통해 <math>π</math> 값에 접근할 수 있도록 패키지를 임포트합니다. 패키지 임포트에 대한 자세한 내용은 [패키지와 임포트](packages.md)를 참조하세요.
>
{style="tip"}

<deflist collapsible="true" id="kotlin-tour-functions-exercise-1-hint">
    <def title="힌트">
        원의 넓이를 구하는 공식은 <math>πr^2</math>이며, 여기서 <math>r</math>은 반지름입니다.
    </def>
</deflist>

|---|---|
```kotlin
import kotlin.math.PI

// 여기에 코드를 작성하세요

fun main() {
    println(circleArea(2))
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-functions-exercise-1"}

|---|---|
```kotlin
import kotlin.math.PI

fun circleArea(radius: Int): Double {
    return PI * radius * radius
}

fun main() {
    println(circleArea(2)) // 12.566370614359172
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-functions-solution-1"}

### 연습 문제 2 {initial-collapse-state="collapsed" collapsible="true" id="functions-exercise-2"}

이전 연습 문제의 `circleArea` 함수를 단일 표현식 함수로 다시 작성하세요.

|---|---|
```kotlin
import kotlin.math.PI

// 여기에 코드를 작성하세요

fun main() {
    println(circleArea(2))
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-functions-exercise-2"}

|---|---|
```kotlin
import kotlin.math.PI

fun circleArea(radius: Int): Double = PI * radius * radius

fun main() {
    println(circleArea(2)) // 12.566370614359172
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-functions-solution-2"}

### 연습 문제 3 {initial-collapse-state="collapsed" collapsible="true" id="functions-exercise-3"}

시간, 분, 초로 주어진 시간 간격을 초 단위로 변환하는 함수가 있습니다. 대부분의 경우 하나 또는 두 개의 파라미터만 전달하고 나머지는 0입니다. 기본 파라미터 값과 이름 붙은 인자를 사용하여 코드를 더 읽기 쉽게 함수와 호출 코드를 개선하세요.

|---|---|
```kotlin
fun intervalInSeconds(hours: Int, minutes: Int, seconds: Int) =
    ((hours * 60) + minutes) * 60 + seconds

fun main() {
    println(intervalInSeconds(1, 20, 15))
    println(intervalInSeconds(0, 1, 25))
    println(intervalInSeconds(2, 0, 0))
    println(intervalInSeconds(0, 10, 0))
    println(intervalInSeconds(1, 0, 1))
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-functions-exercise-3"}

|---|---|
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-functions-solution-3"}

## 람다 표현식 (Lambda expressions)

Kotlin에서는 람다 표현식을 사용하여 함수 코드를 더욱 간결하게 작성할 수 있습니다.

예를 들어, 다음과 같은 `uppercaseString()` 함수는:

```kotlin
fun uppercaseString(text: String): String {
    return text.uppercase()
}
fun main() {
    println(uppercaseString("hello"))
    // HELLO
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-function-before"}

람다 표현식으로도 작성할 수 있습니다:

```kotlin
fun main() {
    val upperCaseString = { text: String -> text.uppercase() }
    println(upperCaseString("hello"))
    // HELLO
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-variable"}

람다 표현식은 처음 보기에 이해하기 어려울 수 있으므로 자세히 살펴보겠습니다. 람다 표현식은 중괄호 `{}` 안에 작성됩니다.

람다 표현식 내부에는 다음을 작성합니다:

* 파라미터와 그 뒤에 오는 `->`.
* `->` 뒤에 오는 함수 본문.

이전 예제에서:

* `text`는 함수의 파라미터입니다.
* `text`는 `String` 타입입니다.
* 함수는 `text`에 대해 호출된 [`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase.html) 함수의 결과를 반환합니다.
* 전체 람다 표현식은 대입 연산자 `=`를 통해 `upperCaseString` 변수에 할당됩니다.
* 람다 표현식은 `upperCaseString` 변수를 함수처럼 사용하고 `"hello"` 문자열을 파라미터로 전달하여 호출됩니다.
* `println()` 함수가 결과를 출력합니다.

> 파라미터가 없는 람다를 선언하는 경우 `->`를 사용할 필요가 없습니다. 예를 들어:
> ```kotlin
> { println("Log message") }
> ```
>
{style="note"}

람다 표현식은 다음과 같은 여러 방식으로 사용될 수 있습니다:

* [람다 표현식을 다른 함수의 파라미터로 전달](#pass-to-another-function)
* [함수에서 람다 표현식 반환](#return-from-a-function)
* [람다 표현식을 단독으로 실행](#invoke-separately)

### 다른 함수로 전달

람다 표현식을 함수에 전달할 때 매우 유용한 예시는 컬렉션에서 [`.filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html) 함수를 사용하는 것입니다.

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-filter"}

`.filter()` 함수는 람다 표현식을 서술어(predicate)로 받아 리스트의 각 요소에 적용합니다. 함수는 서술어가 `true`를 반환하는 요소만 유지합니다.

* `{ x -> x > 0 }`은 요소가 양수이면 `true`를 반환합니다.
* `{ x -> x < 0 }`은 요소가 음수이면 `true`를 반환합니다.

이 예제는 람다 표현식을 함수에 전달하는 두 가지 방법을 보여줍니다:

* 양수의 경우, 예제는 `.filter()` 함수에 직접 람다 표현식을 추가합니다.
* 음수의 경우, 예제는 람다 표현식을 `isNegative` 변수에 할당합니다. 그런 다음 `isNegative` 변수를 `.filter()` 함수의 파라미터로 사용합니다. 이 경우 람다 표현식에서 함수 파라미터(`x`)의 타입을 지정해야 합니다.

> 람다 표현식이 함수의 유일한 파라미터인 경우, 함수의 소괄호 `()`를 생략할 수 있습니다.
> 
> ```kotlin
> val positives = numbers.filter { x -> x > 0 }
> ```
> 
> 이것은 [후행 람다](#trailing-lambdas)의 한 예이며, 이 장의 끝부분에서 더 자세히 다룹니다.
>
{style="note"}

또 다른 좋은 예시는 컬렉션의 아이템을 변환하기 위해 [`.map()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map.html) 함수를 사용하는 것입니다.

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-map"}

`.map()` 함수는 람다 표현식을 변환 함수로 사용합니다:

* `{ x -> x * 2 }`는 리스트의 각 요소를 가져와서 그 요소에 2를 곱한 값을 반환합니다.
* `{ x -> x * 3 }`은 리스트의 각 요소를 가져와서 그 요소에 3을 곱한 값을 반환합니다.

### 함수 타입 (Function types)

함수에서 람다 표현식을 반환하기 전에, 먼저 **함수 타입**을 이해해야 합니다.

이미 기본 타입에 대해 배웠지만 함수 자체도 타입을 가집니다. Kotlin의 타입 추론은 파라미터 타입을 통해 함수의 타입을 추론할 수 있습니다. 하지만 함수 타입을 명시적으로 지정해야 할 때가 있습니다. 컴파일러는 해당 함수에 무엇이 허용되고 허용되지 않는지 알기 위해 함수 타입이 필요합니다.

함수 타입의 구문은 다음과 같습니다:

* 각 파라미터의 타입은 소괄호 `()` 안에 쉼표 `,`로 구분하여 작성합니다.
* 반환 타입은 `->` 뒤에 작성합니다.

예: `(String) -> String` 또는 `(Int, Int) -> Int`.

`upperCaseString()`에 대해 함수 타입을 정의했을 때 람다 표현식은 다음과 같습니다:

```kotlin
val upperCaseString: (String) -> String = { text -> text.uppercase() }

fun main() {
    println(upperCaseString("hello"))
    // HELLO
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-function-type"}

람다 표현식에 파라미터가 없으면 소괄호 `()`를 비워둡니다. 예: `() -> Unit`

> 람다 표현식 내부에서 직접 타입을 선언하거나 함수 타입으로 선언해야 합니다. 그렇지 않으면 컴파일러가 람다 표현식의 타입을 알 수 없습니다.
> 
> 예를 들어, 다음 코드는 작동하지 않습니다:
> 
> `val upperCaseString = { str -> str.uppercase() }`
>
{style="note"}

### 함수에서 반환

람다 표현식은 함수에서 반환될 수 있습니다. 컴파일러가 반환된 람다 표현식의 타입을 이해할 수 있도록 함수 타입을 선언해야 합니다.

다음 예제에서 `toSeconds()` 함수는 항상 `Int` 타입의 파라미터를 받아 `Int` 값을 반환하는 람다 표현식을 반환하므로 함수 타입 `(Int) -> Int`를 가집니다.

이 예제는 `when` 표현식을 사용하여 `toSeconds()`가 호출될 때 어떤 람다 표현식이 반환될지 결정합니다.

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-return-from-function"}

### 단독 실행 (Invoke separately)

람다 표현식은 중괄호 `{}` 뒤에 소괄호 `()`를 추가하고 소괄호 안에 파라미터를 포함하여 단독으로 실행할 수 있습니다.

```kotlin
fun main() {
    //sampleStart
    println({ text: String -> text.uppercase() }("hello"))
    // HELLO
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-standalone"}

### 후행 람다 (Trailing lambdas)

이미 살펴보았듯이, 람다 표현식이 함수의 유일한 파라미터인 경우 함수의 소괄호 `()`를 생략할 수 있습니다. 람다 표현식이 함수의 마지막 파라미터로 전달되는 경우, 표현식을 함수의 소괄호 `()` 밖에 작성할 수 있습니다. 두 경우 모두 이러한 구문을 **후행 람다(trailing lambda)**라고 부릅니다.

예를 들어, [`.fold()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/fold.html) 함수는 초기값과 연산을 인자로 받습니다.

```kotlin
fun main() {
    //sampleStart
    // 초기값은 0입니다. 
    // 연산은 초기값과 리스트의 모든 아이템을 누적하여 합산합니다.
    println(listOf(1, 2, 3).fold(0, { x, item -> x + item })) // 6

    // 또는 후행 람다 형식으로 작성할 수 있습니다.
    println(listOf(1, 2, 3).fold(0) { x, item -> x + item })  // 6
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-trailing-lambda"}

람다 표현식에 대한 자세한 내용은 [람다 표현식 및 익명 함수](lambdas.md#lambda-expressions-and-anonymous-functions)를 참조하세요.

투어의 다음 단계는 Kotlin의 [클래스(classes)](kotlin-tour-classes.md)에 대해 배우는 것입니다.

## 람다 표현식 연습 문제 {completion-point="true"}

### 연습 문제 1 {initial-collapse-state="collapsed" collapsible="true" id="lambdas-exercise-1"}

웹 서비스에서 지원하는 액션 리스트, 모든 요청의 공통 접두사(prefix), 특정 리소스의 ID가 있습니다. ID가 5인 리소스에 대해 `title` 액션을 요청하려면 다음과 같은 URL을 만들어야 합니다: `https://example.com/book-info/5/title`. 람다 표현식을 사용하여 액션 리스트로부터 URL 리스트를 생성하세요.

|---|---|
```kotlin
fun main() {
    val actions = listOf("title", "year", "author")
    val prefix = "https://example.com/book-info"
    val id = 5
    val urls = // 여기에 코드를 작성하세요
    println(urls)
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambdas-exercise-1"}

|---|---|
```kotlin
fun main() {
    val actions = listOf("title", "year", "author")
    val prefix = "https://example.com/book-info"
    val id = 5
    val urls = actions.map { action -> "$prefix/$id/$action" }
    println(urls)
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-lambdas-solution-1"}

### 연습 문제 2 {initial-collapse-state="collapsed" collapsible="true" id="lambdas-exercise-2"}

`Int` 값과 액션(`() -> Unit` 타입의 함수)을 파라미터로 받아 해당 액션을 지정된 횟수만큼 반복하는 함수를 작성하세요. 그런 다음 이 함수를 사용하여 "Hello"를 5번 출력하세요.

|---|---|
```kotlin
fun repeatN(n: Int, action: () -> Unit) {
    // 여기에 코드를 작성하세요
}

fun main() {
    // 여기에 코드를 작성하세요
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambdas-exercise-2"}

|---|---|
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-lambdas-solution-2"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-control-flow.md" mode="outline" icon="arrow-left" icon-position="left">이전 단계</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-classes.md" mode="classic" icon="arrow-right" icon-position="right">다음 단계</a>
  </li>
</list>