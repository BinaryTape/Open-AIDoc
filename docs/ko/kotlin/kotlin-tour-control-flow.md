[//]: # (title: 제어 흐름)

<no-index/>

다른 프로그래밍 언어와 마찬가지로, 코틀린은 특정 코드 조각이 참(`true`)으로 평가되는지에 따라 결정을 내릴 수 있습니다. 이러한 코드 조각을 **조건식(conditional expressions)**이라고 합니다. 또한 코틀린은 루프(loop)를 생성하고 반복할 수도 있습니다.

## 조건식

코틀린은 조건식을 확인하기 위해 `if`와 `when`을 제공합니다. 

> `if`와 `when` 중 하나를 선택해야 한다면, 다음과 같은 이유로 `when`을 사용하는 것을 권장합니다:
> 
> * 코드를 더 읽기 쉽게 만듭니다.
> * 다른 분기를 추가하기가 더 쉽습니다.
> * 코드의 실수를 줄여줍니다.
> 
{style="note"}

### If

`if`를 사용하려면 괄호 `()` 안에 조건식을 넣고, 결과가 참일 때 실행할 동작을 중괄호 `{}` 안에 넣습니다.

```kotlin
fun main() {
//sampleStart
    val d: Int
    val check = true

    if (check) {
        d = 1
    } else {
        d = 2
    }

    println(d)
    // 1
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-if"}

코틀린에는 `condition ? then : else`와 같은 삼항 연산자가 없습니다. 대신 `if`를 식(expression)으로 사용할 수 있습니다. 동작별로 코드가 한 줄만 있는 경우 중괄호 `{}`를 생략할 수 있습니다.

```kotlin
fun main() { 
//sampleStart
    val a = 1
    val b = 2

    println(if (a > b) a else b) // 값을 반환함: 2
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-if-expression"}

### When

여러 분기가 있는 조건식이 필요한 경우에는 `when`을 사용하세요.

`when` 사용 방법:

* 평가하려는 값을 괄호 `()` 안에 넣습니다.
* 분기들을 중괄호 `{}` 안에 넣습니다.
* 각 분기에서 `->`를 사용하여 조건 확인과 조건이 성공했을 때 실행할 동작을 구분합니다.

`when`은 문(statement) 또는 식(expression)으로 사용할 수 있습니다. **문(statement)**은 아무것도 반환하지 않고 대신 동작을 수행합니다.

다음은 `when`을 문으로 사용하는 예시입니다:

```kotlin
fun main() {
//sampleStart
    val obj = "Hello"

    when (obj) {
        // obj가 "1"과 같은지 확인
        "1" -> println("One")
        // obj가 "Hello"와 같은지 확인
        "Hello" -> println("Greeting")
        // 기본 문(Default statement)
        else -> println("Unknown")     
    }
    // Greeting
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-when-statement"}

> 모든 분기 조건은 그중 하나가 충족될 때까지 순차적으로 확인됩니다. 따라서 적합한 첫 번째 분기만 실행됩니다.
>
{style="note"}

**식(expression)**은 나중에 코드에서 사용할 수 있는 값을 반환합니다.

다음은 `when`을 식으로 사용하는 예시입니다. `when` 식의 결과가 변수에 즉시 할당되고, 나중에 `println()` 함수와 함께 사용됩니다.

```kotlin
fun main() {
//sampleStart    
    val obj = "Hello"    
    
    val result = when (obj) {
        // obj가 "1"이면 result를 "One"으로 설정
        "1" -> "One"
        // obj가 "Hello"이면 result를 "Greeting"으로 설정
        "Hello" -> "Greeting"
        // 이전의 어떤 조건도 충족되지 않으면 result를 "Unknown"으로 설정
        else -> "Unknown"
    }
    println(result)
    // Greeting
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-when-expression"}

지금까지 본 `when` 예제들에는 모두 `obj`라는 대상(subject)이 있었습니다. 하지만 `when`은 대상 없이도 사용할 수 있습니다.

다음 예제는 일련의 불리언(Boolean) 식을 확인하기 위해 대상 **없이** `when` 식을 사용합니다.

```kotlin
fun main() {
    val trafficLightState = "Red" // "Green", "Yellow", "Red" 중 하나가 될 수 있음

    val trafficAction = when {
        trafficLightState == "Green" -> "Go"
        trafficLightState == "Yellow" -> "Slow down"
        trafficLightState == "Red" -> "Stop"
        else -> "Malfunction"
    }

    println(trafficAction)
    // Stop
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-when-expression-boolean"}

하지만 `trafficLightState`를 대상으로 사용하여 동일한 코드를 작성할 수도 있습니다.

```kotlin
fun main() {
    val trafficLightState = "Red" // "Green", "Yellow", "Red" 중 하나가 될 수 있음

    val trafficAction = when (trafficLightState) {
        "Green" -> "Go"
        "Yellow" -> "Slow down"
        "Red" -> "Stop"
        else -> "Malfunction"
    }

    println(trafficAction)  
    // Stop
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-when-expression-boolean-subject"}

대상을 포함하여 `when`을 사용하면 코드를 더 읽기 쉽고 유지보수하기 좋게 만듭니다. `when` 식에 대상을 사용하면 코틀린이 가능한 모든 케이스가 다루어졌는지 확인하는 데에도 도움이 됩니다. 그렇지 않고 `when` 식에 대상을 사용하지 않는 경우에는 반드시 `else` 분기를 제공해야 합니다.

## 조건식 연습

### 연습 문제 1 {initial-collapse-state="collapsed" collapsible="true" id="conditional-expressions-exercise-1"}

두 개의 주사위를 던져 같은 숫자가 나오면 이기는 간단한 게임을 만드세요. 주사위 숫자가 일치하면 `You win :)`을 출력하고, 그렇지 않으면 `You lose :(`를 출력하도록 `if`를 사용하세요.

> 이 연습 문제에서는 임의의 `Int`를 제공하는 `Random.nextInt()` 함수를 사용할 수 있도록 패키지를 임포트합니다. 패키지 임포트에 대한 자세한 내용은 [패키지 및 임포트](packages.md)를 참조하세요.
>
{style="tip"}

<deflist collapsible="true">
    <def title="힌트">
        주사위 결과를 비교하려면 <a href="operator-overloading.md#equality-and-inequality-operators">동등 연산자</a>(<code>==</code>)를 사용하세요. 
    </def>
</deflist>

|---|---|
```kotlin
import kotlin.random.Random

fun main() {
    val firstResult = Random.nextInt(6)
    val secondResult = Random.nextInt(6)
    // 여기에 코드를 작성하세요
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-control-flow-conditional-exercise-1"}

|---|---|
```kotlin
import kotlin.random.Random

fun main() {
    val firstResult = Random.nextInt(6)
    val secondResult = Random.nextInt(6)
    if (firstResult == secondResult)
        println("You win :)")
    else
        println("You lose :(")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-control-flow-conditional-solution-1"}

### 연습 문제 2 {initial-collapse-state="collapsed" collapsible="true" id="conditional-expressions-exercise-2"}

`when` 식을 사용하여 게임 콘솔 버튼의 이름을 입력했을 때 그에 해당하는 동작을 출력하도록 다음 프로그램을 업데이트하세요.

| **버튼** | **동작**               |
|------------|------------------------|
| A          | Yes                    |
| B          | No                     |
| X          | Menu                   |
| Y          | Nothing                |
| 기타       | There is no such button |

|---|---|
```kotlin
fun main() {
    val button = "A"

    println(
        // 여기에 코드를 작성하세요
    )
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-control-flow-conditional-exercise-2"}

|---|---|
```kotlin
fun main() {
    val button = "A"
    
    println(
        when (button) {
            "A" -> "Yes"
            "B" -> "No"
            "X" -> "Menu"
            "Y" -> "Nothing"
            else -> "There is no such button"
        }
    )
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-control-flow-conditional-solution-2"}

## 범위 (Ranges)

루프에 대해 이야기하기 전에, 루프가 반복할 범위를 구성하는 방법을 알아두면 유용합니다.

코틀린에서 범위를 만드는 가장 일반적인 방법은 `..` 연산자를 사용하는 것입니다. 예를 들어, `1..4`는 `1, 2, 3, 4`와 같습니다.

끝 값을 포함하지 않는 범위를 선언하려면 `..<` 연산자를 사용하세요. 예를 들어, `1..<4`는 `1, 2, 3`과 같습니다.

역순으로 범위를 선언하려면 [`downTo`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.ranges/down-to.html)를 사용하세요. 예를 들어, `4 downTo 1`은 `4, 3, 2, 1`과 같습니다.

1이 아닌 단계로 증가하는 범위를 선언하려면 [`step`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.ranges/step.html)과 원하는 증가 값을 사용하세요. 예를 들어, `1..5 step 2`는 `1, 3, 5`와 같습니다.

`Char` 범위에 대해서도 동일하게 수행할 수 있습니다.

* `'a'..'d'`는 `'a', 'b', 'c', 'd'`와 같습니다.
* `'z' downTo 's' step 2`는 `'z', 'x', 'v', 't'`와 같습니다.

## 루프 (Loops)

프로그래밍에서 가장 일반적인 두 가지 루프 구조는 `for`와 `while`입니다. `for`는 일련의 값들을 반복하며 동작을 수행할 때 사용합니다. `while`은 특정 조건이 충족될 때까지 동작을 계속할 때 사용합니다.

### For

새롭게 배운 범위 지식을 활용하여 1부터 5까지의 숫자를 반복하며 매번 숫자를 출력하는 `for` 루프를 만들 수 있습니다.

괄호 `()` 안에 `in` 키워드와 함께 반복자(iterator)와 범위를 넣으세요. 완료하려는 동작은 중괄호 `{}` 안에 추가합니다.

```kotlin
fun main() {
//sampleStart
    for (number in 1..5) { 
        // number는 반복자이고 1..5는 범위임
        print(number)
    }
    // 12345
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-for-loop"}

컬렉션 또한 루프를 통해 반복할 수 있습니다.

```kotlin
fun main() { 
//sampleStart
    val cakes = listOf("carrot", "cheese", "chocolate")

    for (cake in cakes) {
        println("Yummy, it's a $cake cake!")
    }
    // Yummy, it's a carrot cake!
    // Yummy, it's a cheese cake!
    // Yummy, it's a chocolate cake!
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-for-collection-loop"}

### While

`while`은 두 가지 방식으로 사용할 수 있습니다.

  * 조건식이 참인 동안 코드 블록을 실행합니다. (`while`)
  * 코드 블록을 먼저 실행한 다음 조건식을 확인합니다. (`do-while`)

첫 번째 사용 사례(`while`):

* `while` 루프가 계속되기 위한 조건식을 괄호 `()` 안에 선언합니다.
* 완료하려는 동작을 중괄호 `{}` 안에 추가합니다.

> 다음 예제들은 `cakesEaten` 변수의 값을 증가시키기 위해 [증가 연산자](operator-overloading.md#increments-and-decrements) `++`를 사용합니다.
>
{style="tip"}

```kotlin
fun main() {
//sampleStart
    var cakesEaten = 0
    while (cakesEaten < 3) {
        println("Eat a cake")
        cakesEaten++
    }
    // Eat a cake
    // Eat a cake
    // Eat a cake
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-while-loop"}

두 번째 사용 사례(`do-while`):

* `while` 루프가 계속되기 위한 조건식을 괄호 `()` 안에 선언합니다.
* 완료하려는 동작을 `do` 키워드와 함께 중괄호 `{}` 안에 정의합니다.

```kotlin
fun main() {
//sampleStart
    var cakesEaten = 0
    var cakesBaked = 0
    while (cakesEaten < 3) {
        println("Eat a cake")
        cakesEaten++
    }
    do {
        println("Bake a cake")
        cakesBaked++
    } while (cakesBaked < cakesEaten)
    // Eat a cake
    // Eat a cake
    // Eat a cake
    // Bake a cake
    // Bake a cake
    // Bake a cake
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-while-do-loop"}

조건식과 루프에 대한 더 많은 정보와 예제는 [조건 및 루프](control-flow.md)를 참조하세요.

코틀린 제어 흐름의 기본을 익혔으니, 이제 직접 [함수](kotlin-tour-functions.md)를 작성하는 방법을 알아볼 차례입니다.

## 루프 연습 {completion-point="true"}

### 연습 문제 1 {initial-collapse-state="collapsed" collapsible="true" id="loops-exercise-1"}

8조각의 피자 한 판이 될 때까지 피자 조각을 세는 프로그램이 있습니다. 이 프로그램을 다음 두 가지 방식으로 리팩터링하세요.

* `while` 루프를 사용하세요.
* `do-while` 루프를 사용하세요.

|---|---|
```kotlin
fun main() {
    var pizzaSlices = 0
    // 여기서부터 리팩터링을 시작하세요
    pizzaSlices++
    println("There's only $pizzaSlices slice/s of pizza :(")
    pizzaSlices++
    println("There's only $pizzaSlices slice/s of pizza :(")
    pizzaSlices++
    println("There's only $pizzaSlices slice/s of pizza :(")
    pizzaSlices++
    println("There's only $pizzaSlices slice/s of pizza :(")
    pizzaSlices++
    println("There's only $pizzaSlices slice/s of pizza :(")
    pizzaSlices++
    println("There's only $pizzaSlices slice/s of pizza :(")
    pizzaSlices++
    println("There's only $pizzaSlices slice/s of pizza :(")
    pizzaSlices++
    // 여기서 리팩터링을 종료하세요
    println("There are $pizzaSlices slices of pizza. Hooray! We have a whole pizza! :D")
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-control-flow-loops-exercise-1"}

|---|---|
```kotlin
fun main() {
    var pizzaSlices = 0
    while ( pizzaSlices < 7 ) {
        pizzaSlices++
        println("There's only $pizzaSlices slice/s of pizza :(")
    }
    pizzaSlices++
    println("There are $pizzaSlices slices of pizza. Hooray! We have a whole pizza! :D")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안 1" id="kotlin-tour-control-flow-loops-exercise-1-solution-1"}

|---|---|
```kotlin
fun main() {
    var pizzaSlices = 0
    pizzaSlices++
    do {
        println("There's only $pizzaSlices slice/s of pizza :(")
        pizzaSlices++
    } while ( pizzaSlices < 8 )
    println("There are $pizzaSlices slices of pizza. Hooray! We have a whole pizza! :D")
}

```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안 2" id="kotlin-tour-control-flow-loops-exercise-1-solution-2"}

### 연습 문제 2 {initial-collapse-state="collapsed" collapsible="true" id="loops-exercise-2"}

[Fizz buzz](https://en.wikipedia.org/wiki/Fizz_buzz) 게임을 시뮬레이션하는 프로그램을 작성하세요. 여러분의 과제는 1부터 100까지 숫자를 순차적으로 출력하되, 3으로 나누어지는 숫자는 "fizz"라는 단어로, 5로 나누어지는 숫자는 "buzz"라는 단어로 바꾸는 것입니다. 3과 5 모두로 나누어지는 숫자는 "fizzbuzz"라는 단어로 바꾸어야 합니다.

<deflist collapsible="true">
    <def title="힌트 1">
        숫자를 세기 위해 <code>for</code> 루프를 사용하고, 각 단계에서 무엇을 출력할지 결정하기 위해 <code>when</code> 식을 사용하세요. 
    </def>
</deflist>

<deflist collapsible="true">
    <def title="힌트 2">
        나눗셈의 나머지를 반환하려면 나머지 연산자(<code>%</code>)를 사용하세요. 나머지가 0과 같은지 확인하려면 <a href="operator-overloading.md#equality-and-inequality-operators">동등 연산자</a>(<code>==</code>)를 사용하세요.
    </def>
</deflist>

|---|---|
```kotlin
fun main() {
    // 여기에 코드를 작성하세요
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-control-flow-loops-exercise-2"}

|---|---|
```kotlin
fun main() {
    for (number in 1..100) {
        println(
            when {
                number % 15 == 0 -> "fizzbuzz"
                number % 3 == 0 -> "fizz"
                number % 5 == 0 -> "buzz"
                else -> "$number"
            }
        )
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-control-flow-loops-solution-2"}

### 연습 문제 3 {initial-collapse-state="collapsed" collapsible="true" id="loops-exercise-3"}

단어 목록이 있습니다. `for`와 `if`를 사용하여 `l`로 시작하는 단어만 출력하세요.

<deflist collapsible="true">
    <def title="힌트">
        <code>String</code> 타입에 대해 <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/starts-with.html"> <code>.startsWith()</code>
        </a> 함수를 사용하세요. 
    </def>
</deflist>

|---|---|
```kotlin
fun main() {
    val words = listOf("dinosaur", "limousine", "magazine", "language")
    // 여기에 코드를 작성하세요
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-control-flow-loops-exercise-3"}

|---|---|
```kotlin
fun main() {
    val words = listOf("dinosaur", "limousine", "magazine", "language")
    for (w in words) {
        if (w.startsWith("l"))
            println(w)
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-control-flow-loops-solution-3"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-collections.md" mode="outline" icon="arrow-left" icon-position="left">이전 단계</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-functions.md" mode="classic" icon="arrow-right" icon-position="right">다음 단계</a>
  </li>
</list>