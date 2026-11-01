[//]: # (title: Hello world)

<no-index/>

다음은 "Hello, world!"를 출력하는 간단한 프로그램입니다:

```kotlin
fun main() {
    println("Hello, world!")
    // Hello, world!
}
```
{kotlin-runnable="true" id="hello-world-kotlin"}

Kotlin에서는 다음과 같습니다:

* `fun`은 함수를 선언하는 데 사용됩니다.
* `main()` 함수는 프로그램이 시작되는 진입점입니다.
* 함수의 본문은 중괄호 `{}` 안에 작성합니다.
* [`println()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/println.html) 및 [`print()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/print.html) 함수는 전달받은 인자를 표준 출력으로 출력합니다.

함수는 특정 작업을 수행하는 일련의 명령 집합입니다. 함수를 한 번 만들어 두면 해당 작업을 수행해야 할 때마다 명령을 처음부터 다시 작성할 필요 없이 언제든지 재사용할 수 있습니다. 함수에 대해서는 이후 장에서 더 자세히 다룹니다. 그때까지 모든 예제는 `main()` 함수를 사용합니다.

## 변수 {id="variables"}

모든 프로그램은 데이터를 저장할 수 있어야 하며, 변수가 바로 그 역할을 해줍니다. Kotlin에서는 다음과 같이 선언할 수 있습니다:

* `val`을 사용한 읽기 전용 변수
* `var`을 사용한 가변(mutable) 변수

> 읽기 전용 변수는 한 번 값을 할당하고 나면 변경할 수 없습니다.
>
{style="note"}

값을 할당할 때는 대입 연산자 `=`를 사용합니다.

예시:

```kotlin
fun main() { 
//sampleStart
    val popcorn = 5    // 팝콘 5상자가 있습니다.
    val hotdog = 7     // 핫도그 7개가 있습니다.
    var customers = 10 // 대기 줄에 손님 10명이 있습니다.
    
    // 손님 몇 명이 줄에서 빠져나갑니다.
    customers = 8
    println(customers)
    // 8
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-variables"}

> 변수는 프로그램의 시작 부분에서 `main()` 함수 외부에 선언할 수도 있습니다. 이렇게 선언된 변수를 **최상위(top level)**에 선언되었다고 합니다.
> 
{style="tip"}

`customers`는 가변 변수이므로 선언 후에도 값을 다시 할당할 수 있습니다.

> 기본적으로 모든 변수를 읽기 전용(`val`)으로 선언하는 것을 권장합니다. 가변 변수(`var`)는 꼭 필요한 경우에만 사용하세요. 그렇게 하면 변경되어서는 안 되는 값이 실수로 변경될 가능성을 줄일 수 있습니다.
> 
{style="note"}

## 문자열 템플릿 {id="string-templates"}

변수의 내용을 표준 출력으로 출력하는 방법을 알아두면 유용합니다. 이는 **문자열 템플릿(string templates)**을 통해 할 수 있습니다. 템플릿 표현식을 사용하면 변수나 다른 객체에 저장된 데이터에 접근하여 문자열로 변환할 수 있습니다. 문자열 값은 큰따옴표 `"`로 감싸인 일련의 문자 시퀀스입니다. 템플릿 표현식은 항상 달러 기호 `$`로 시작합니다.

템플릿 표현식 내에서 코드 조각을 계산(평가)하려면 달러 기호 `$` 뒤에 중괄호 `{}`를 두고 그 안에 코드를 넣습니다.

예시:

```kotlin
fun main() { 
//sampleStart
    val customers = 10
    println("There are $customers customers")
    // There are 10 customers
    
    println("There are ${customers + 1} customers")
    // There are 11 customers
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-string-templates"}

자세한 내용은 [문자열 템플릿](strings.md#string-templates)을 참조하세요.

변수에 대해 어떠한 타입도 선언되지 않은 것을 확인할 수 있습니다. 이는 Kotlin이 직접 타입을 `Int`로 추론했기 때문입니다. 이 투어의 [다음 장](kotlin-tour-basic-types.md)에서 Kotlin의 다양한 기본 타입과 이를 선언하는 방법을 설명합니다.

## 연습 문제 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true">
<def title="문자열 템플릿을 사용하여 문장 출력하기" id="hello-world-exercise-1">

프로그램이 표준 출력으로 `"Mary is 20 years old"`를 출력하도록 코드를 완성하세요:

```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    // 여기에 코드를 작성하세요
}
```
{validate="false" kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/HelloWorldTest.kt" id="kotlin-tour-hello-world-exercise"}

```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    println("$name is $age years old")
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/HelloWorldTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-hello-world-solution"}

</def>
</deflist>

<seealso></seealso>

<list id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-basic-types.md" mode="classic" icon="arrow-right" icon-position="right">다음 단계</a>
  </li>
</list>