[//]: # (title: 널 안전성(Null safety))

<no-index/>

Kotlin에서는 `null` 값을 가질 수 있습니다. Kotlin은 무언가가 누락되었거나 아직 설정되지 않았을 때 `null` 값을 사용합니다.
이미 [컬렉션(Collections)](kotlin-tour-collections.md#kotlin-tour-map-no-key) 챕터에서 맵(map)에 존재하지 않는 키로 키-값 쌍에 접근하려고 했을 때 Kotlin이 `null` 값을 반환하는 예제를 보았습니다.
이러한 방식으로 `null` 값을 사용하는 것이 유용하긴 하지만, 코드가 이를 처리할 준비가 되어 있지 않다면 문제가 발생할 수 있습니다.

프로그램에서 `null` 값으로 인해 발생하는 문제를 방지하기 위해 Kotlin은 널 안전성(Null safety) 기능을 제공합니다. 널 안전성은 `null` 값과 관련된 잠재적인 문제를 런타임이 아닌 컴파일 타임에 감지합니다.

널 안전성은 다음과 같은 기능들을 제공합니다:

* 프로그램에서 `null` 값이 허용되는 시점을 명시적으로 선언할 수 있습니다.
* `null` 값을 검사할 수 있습니다.
* `null` 값을 포함할 수 있는 프로퍼티나 함수에 대해 안전한 호출(safe call)을 사용할 수 있습니다.
* `null` 값이 감지되었을 때 취할 동작을 선언할 수 있습니다.

## 널 가능 타입(Nullable types) {id="nullable-types"}

Kotlin은 선언된 타입이 `null` 값을 가질 수 있도록 허용하는 널 가능 타입(Nullable types)을 지원합니다. 기본적으로 타입은 `null` 값을 허용**하지 않습니다**. 널 가능 타입은 타입 선언 뒤에 `?`를 명시적으로 붙여서 선언합니다.

예를 들면 다음과 같습니다:

```kotlin
fun main() {
    // neverNull은 String 타입입니다
    var neverNull: String = "This can't be null"

    // 컴파일러 에러가 발생합니다
    neverNull = null

    // nullable은 널 가능 String 타입입니다
    var nullable: String? = "You can keep a null here"

    // 정상 동작합니다
    nullable = null

    // 기본적으로 null 값은 허용되지 않습니다
    var inferredNonNull = "The compiler assumes non-nullable"

    // 컴파일러 에러가 발생합니다
    inferredNonNull = null

    // notNull은 null 값을 허용하지 않습니다
    fun strLength(notNull: String): Int {                 
        return notNull.length
    }

    println(strLength(neverNull)) // 18
    println(strLength(nullable))  // 컴파일러 에러가 발생합니다
}
```
{kotlin-runnable="true" validate="false" kotlin-min-compiler-version="1.3" id="kotlin-tour-nullable-type"}

> `length`는 문자열 내의 문자 수를 포함하는 [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/) 클래스의 프로퍼티입니다.
>
{style="tip"}

## null 값 검사 {id="check-for-null-values"}

조건식을 사용하여 `null` 값의 존재 여부를 검사할 수 있습니다. 다음 예제에서 `describeString()` 함수는 `maybeString`이 `null`이 **아닌지**, 그리고 `length`가 0보다 큰지 검사하는 `if` 문을 포함하고 있습니다:

```kotlin
fun describeString(maybeString: String?): String {
    if (maybeString != null && maybeString.length > 0) {
        return "String of length ${maybeString.length}"
    } else {
        return "Empty or null string"
    }
}

fun main() {
    val nullString: String? = null
    println(describeString(nullString))
    // Empty or null string
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-check-nulls"}

## 안전 호출(Safe calls) 사용 {id="use-safe-calls"}

`null` 값을 포함할 수 있는 객체의 프로퍼티에 안전하게 접근하려면 안전 호출 연산자(safe call operator)인 `?.`를 사용하세요. 안전 호출 연산자는 객체 또는 접근하려는 프로퍼티 중 하나라도 `null`이면 `null`을 반환합니다. 이는 코드에서 `null` 값으로 인해 발생하는 오류를 방지하고자 할 때 유용합니다.

다음 예제에서 `lengthString()` 함수는 안전 호출을 사용하여 문자열의 길이나 `null`을 반환합니다:

```kotlin
fun lengthString(maybeString: String?): Int? = maybeString?.length

fun main() { 
    val nullString: String? = null
    println(lengthString(nullString))
    // null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-safe-call-property"}

> 안전 호출은 체이닝(연쇄 호출)이 가능하여, 객체의 어떤 프로퍼티라도 `null` 값을 포함하고 있다면 오류를 발생시키지 않고 `null`이 반환됩니다. 예를 들면 다음과 같습니다:
> 
> ```kotlin
>   person.company?.address?.country
> ```
>
{style="tip"}

안전 호출 연산자는 확장 함수나 멤버 함수를 안전하게 호출하는 데에도 사용할 수 있습니다. 이 경우 함수가 호출되기 전에 널 검사가 수행됩니다. 검사에서 `null` 값이 감지되면 함수 호출을 건너뛰고 `null`을 반환합니다.

다음 예제에서는 `nullString`이 `null`이므로 [`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase.html)의 호출을 건너뛰고 `null`이 반환됩니다:

```kotlin
fun main() {
    val nullString: String? = null
    println(nullString?.uppercase())
    // null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-safe-call-function"}

## 엘비스 연산자(Elvis operator) 사용 {id="use-elvis-operator"}

**엘비스 연산자(Elvis operator)** `?:`를 사용하면 `null` 값이 감지되었을 때 반환할 기본값을 지정할 수 있습니다.

엘비스 연산자의 왼쪽에는 `null` 값을 검사할 대상을 작성합니다.
엘비스 연산자의 오른쪽에는 `null` 값이 감지되었을 때 반환할 값을 작성합니다.

다음 예제에서 `nullString`은 `null`이므로 `length` 프로퍼티에 접근하는 안전 호출은 `null` 값을 반환합니다.
결과적으로 엘비스 연산자는 `0`을 반환합니다:

```kotlin
fun main() {
    val nullString: String? = null
    println(nullString?.length ?: 0)
    // 0
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-elvis-operator"}

Kotlin의 널 안전성에 대한 자세한 내용은 [널 안전성(Null safety)](null-safety.md)을 참조하세요.

## 연습문제 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true">
<def title="직원의 급여 계산하기">

회사의 직원 데이터베이스에 접근할 수 있는 `employeeById` 함수가 있습니다. 안타깝게도 이 함수는 `Employee?` 타입의 값을 반환하므로 결과가 `null`일 수 있습니다. 여러분의 목표는 직원의 `id`가 주어졌을 때 해당 직원의 급여를 반환하거나, 직원이 데이터베이스에 없을 경우 `0`을 반환하는 함수를 작성하는 것입니다.

```kotlin
data class Employee (val name: String, var salary: Int)

fun employeeById(id: Int) = when(id) {
    1 -> Employee("Mary", 20)
    2 -> null
    3 -> Employee("John", 21)
    4 -> Employee("Ann", 23)
    else -> null
}

fun salaryById(id: Int) = // 여기에 코드를 작성하세요

fun main() {
    println((1..5).sumOf { id -> salaryById(id) })
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-null-safety-exercise"}

```kotlin
data class Employee (val name: String, var salary: Int)

fun employeeById(id: Int) = when(id) {
    1 -> Employee("Mary", 20)
    2 -> null
    3 -> Employee("John", 21)
    4 -> Employee("Ann", 23)
    else -> null
}

fun salaryById(id: Int) = employeeById(id)?.salary ?: 0

fun main() {
    println((1..5).sumOf { id -> salaryById(id) })
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-null-safety-solution"}

</def>
</deflist>

## 다음 단계는? {id="what-s-next"}

축하합니다! 이제 초급 둘러보기를 완료했습니다. 중급 둘러보기를 통해 Kotlin에 대한 이해를 한 단계 더 높여보세요:

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-classes.md" mode="outline" icon="arrow-left" icon-position="left">이전 단계</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-extension-functions.md" mode="classic" icon="arrow-right" icon-position="right">중급 Kotlin 둘러보기 시작</a>
  </li>
</list>