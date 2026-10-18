[//]: # (title: Hello world)

<no-index/>

다음은 "Hello, world!"를 출력하는 간단한 프로그램입니다:

```kotlin
fun main() {
    println("Hello, world!")
    // Hello, world!
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="hello-world-kotlin"}

Kotlin에서:

* `fun`은 함수를 선언할 때 사용됩니다.
* `main()` 함수는 프로그램이 시작되는 진입점입니다.
* 함수의 본문(body)은 중괄호 `{}` 안에 작성합니다.
* [`println()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/println.html) 및 [`print()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/print.html) 함수는 전달받은 인자를 표준 출력(standard output)으로 출력합니다.

함수는 특정 작업을 수행하는 일련의 명령어 집합입니다. 함수를 한 번 만들어 두면, 명령어를 매번 처음부터 다시 작성할 필요 없이 해당 작업이 필요할 때마다 언제든지 재사용할 수 있습니다. 함수에 대한 자세한 내용은 이후 몇 개의 챕터에서 다룹니다. 그때까지 모든 예제는 `main()` 함수를 사용합니다.

## 변수 (Variables) {id="variables"}

모든 프로그램은 데이터를 저장할 수 있어야 하며, 변수를 통해 이를 수행할 수 있습니다. Kotlin에서는 다음과 같이 변수를 선언할 수 있습니다:

* `val`을 사용한 읽기 전용 변수 (Read-only variables)
* `var`을 사용한 가변 변수 (Mutable variables)

> 읽기 전용 변수는 값을 한 번 할당하고 나면 변경할 수 없습니다.
>
{style="note"}

값을 할당할 때는 대입 연산자 `=`를 사용합니다.

예시:

```kotlin
fun main() { 
//sampleStart
    val popcorn = 5    // 팝콘이 5상자 있습니다
    val hotdog = 7     // 핫도그가 7개 있습니다
    var customers = 10 // 줄에 손님이 10명 있습니다
    
    // 일부 손님이 줄에서 나갑니다
    customers = 8
    println(customers)
    // 8
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-variables"}

> 변수는 프로그램 시작 부분에서 `main()` 함수 외부에 선언할 수도 있습니다. 이렇게 선언된 변수를 **최상위(top level)**에 선언되었다고 합니다.
> 
{style="tip"}

`customers`는 가변 변수이므로 선언 후에도 값을 다시 할당할 수 있습니다.

> 기본적으로 모든 변수를 읽기 전용(`val`)으로 선언하는 것을 권장합니다. 정말로 필요한 경우에만 가변 변수(`var`)를 사용하세요. 그렇게 하면 변경되지 말아야 할 값을 실수로 변경하는 일을 줄일 수 있습니다.
> 
{style="note"}

## 문자열 템플릿 (String templates) {id="string-templates"}

변수의 내용을 표준 출력으로 출력하는 방법을 알아두면 유용합니다. 이는 **문자열 템플릿(String templates)**을 통해 수행할 수 있습니다. 
템플릿 표현식을 사용하면 변수나 기타 객체에 저장된 데이터에 접근하여 문자열로 변환할 수 있습니다.
문자열 값은 큰따옴표 `"` 안에 들어가는 일련의 문자 시퀀스입니다. 템플릿 표현식은 항상 달러 기호 `$`로 시작합니다.

템플릿 표현식 내에서 코드 조각을 평가하려면 달러 기호 `$` 뒤의 중괄호 `{}` 안에 코드를 넣으세요.

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-string-templates"}

자세한 내용은 [문자열 템플릿](strings.md#string-templates)을 참고하세요.

변수에 어떠한 타입도 선언되지 않은 것을 볼 수 있습니다. Kotlin이 직접 타입을 `Int`로 추론했기 때문입니다. 이 둘러보기 가이드의 [다음 챕터](kotlin-tour-basic-types.md)에서 다양한 Kotlin 기본 타입과 선언 방법에 대해 설명합니다.

## 실습 {completion-point="true" id="practice"}

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
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-hello-world-exercise"}

```kotlin
fun main() {
    val name = "Mary"
    val age = 20
    println("$name is $age years old")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-hello-world-solution"}

</def>
</deflist>

<seealso></seealso>

<list id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-basic-types.md" mode="classic" icon="arrow-right" icon-position="right">다음 단계</a>
  </li>
</list>