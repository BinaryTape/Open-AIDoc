[//]: # (title: 널 안전성)

<no-index/>

Kotlin에서는 `null` 값을 가질 수 있습니다. Kotlin은 무언가 누락되었거나 아직 설정되지 않았을 때 `null` 값을 사용합니다.
이미 [컬렉션](kotlin-tour-collections.md#kotlin-tour-map-no-key) 장에서 맵(map)에 존재하지 않는 키로 키-값 쌍에 접근하려고 했을 때 Kotlin이 `null` 값을 반환하는 예시를 보았습니다. 이런 방식으로 `null` 값을 사용하는 것은 유용하지만, 코드가 이를 처리할 준비가 되어 있지 않다면 문제에 직면할 수 있습니다.

프로그램에서 `null` 값으로 인한 문제를 방지하기 위해 Kotlin은 **널 안전성(Null safety)**을 갖추고 있습니다. 널 안전성은 `null` 값과 관련된 잠재적인 문제들을 런타임(run time)이 아닌 컴파일 시점(compile time)에 감지합니다.

널 안전성은 다음과 같은 기능들의 조합입니다:

* 프로그램에서 `null` 값이 허용되는 경우를 명시적으로 선언합니다.
* `null` 값을 확인합니다.
* `null` 값을 포함할 수 있는 프로퍼티(property)나 함수에 안전한 호출(safe call)을 사용합니다.
* `null` 값이 감지되었을 때 수행할 작업을 선언합니다.

## null이 가능한 타입 (Nullable types)

Kotlin은 선언된 타입이 `null` 값을 가질 수 있도록 허용하는 **null이 가능한 타입(Nullable types)**을 지원합니다. 기본적으로 타입은 `null` 값을 허용하지 **않습니다**. null이 가능한 타입은 타입 선언 뒤에 `?`를 명시적으로 추가하여 선언합니다.

예를 들어:

```kotlin
fun main() {
    // neverNull은 String 타입입니다
    var neverNull: String = "This can't be null"

    // 컴파일러 에러 발생
    neverNull = null

    // nullable은 null이 가능한 String 타입입니다
    var nullable: String? = "You can keep a null here"

    // 이것은 허용됩니다
    nullable = null

    // 기본적으로 null 값은 허용되지 않습니다
    var inferredNonNull = "The compiler assumes non-nullable"

    // 컴파일러 에러 발생
    inferredNonNull = null

    // notNull은 null 값을 허용하지 않습니다
    fun strLength(notNull: String): Int {                 
        return notNull.length
    }

    println(strLength(neverNull)) // 18
    println(strLength(nullable))  // 컴파일러 에러 발생
}
```
{kotlin-runnable="true" validate="false" kotlin-min-compiler-version="1.3" id="kotlin-tour-nullable-type"}

> `length`는 [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/) 클래스의 프로퍼티로, 문자열 내의 문자 수를 포함합니다.
>
{style="tip"}

## null 값 확인

조건식 내에서 `null` 값의 존재 여부를 확인할 수 있습니다. 다음 예제에서 `describeString()` 함수는 `if` 문을 사용하여 `maybeString`이 `null`이 **아니고** `length`가 0보다 큰지 확인합니다.

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

## 안전한 호출 사용 (Safe calls)

`null` 값을 포함할 수 있는 객체의 프로퍼티에 안전하게 접근하려면 **안전한 호출 연산자(safe call operator)** `?.`를 사용하세요. 안전한 호출 연산자는 객체 또는 접근하려는 프로퍼티 중 하나라도 `null`인 경우 `null`을 반환합니다. 이는 코드에서 `null` 값이 에러를 유발하는 것을 방지하고 싶을 때 유용합니다.

다음 예제에서 `lengthString()` 함수는 안전한 호출을 사용하여 문자열의 길이나 `null`을 반환합니다.

```kotlin
fun lengthString(maybeString: String?): Int? = maybeString?.length

fun main() { 
    val nullString: String? = null
    println(lengthString(nullString))
    // null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-safe-call-property"}

> 안전한 호출은 체인(chain)으로 연결될 수 있어서, 객체의 어떤 프로퍼티라도 `null` 값을 포함하고 있다면 에러가 발생하지 않고 `null`이 반환됩니다. 예를 들어:
> 
> ```kotlin
>   person.company?.address?.country
> ```
>
{style="tip"}

안전한 호출 연산자는 확장 함수나 멤버 함수를 안전하게 호출하는 데에도 사용될 수 있습니다. 이 경우, 함수가 호출되기 전에 null 확인이 수행됩니다. 확인 결과 `null` 값이 감지되면 호출을 건너뛰고 `null`을 반환합니다.

다음 예제에서 `nullString`은 `null`이므로 [`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase.html) 호출은 건너뛰어지고 `null`이 반환됩니다.

```kotlin
fun main() {
    val nullString: String? = null
    println(nullString?.uppercase())
    // null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-safe-call-function"}

## 엘비스 연산자 사용 (Elvis operator)

**엘비스 연산자(Elvis operator)** `?:`를 사용하여 `null` 값이 감지되었을 때 반환할 기본값을 제공할 수 있습니다.

엘비스 연산자의 왼쪽에는 `null` 여부를 확인할 대상을 작성합니다.
엘비스 연산자의 오른쪽에는 `null` 값이 감지되었을 때 반환할 값을 작성합니다.

다음 예제에서 `nullString`은 `null`이므로 `length` 프로퍼티에 접근하는 안전한 호출은 `null` 값을 반환합니다. 그 결과, 엘비스 연산자는 `0`을 반환합니다.

```kotlin
fun main() {
    val nullString: String? = null
    println(nullString?.length ?: 0)
    // 0
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-elvis-operator"}

Kotlin의 널 안전성에 대한 더 자세한 정보는 [널 안전성](null-safety.md)을 참조하세요.

## 연습 문제 {completion-point="true"}

### 실습 {initial-collapse-state="collapsed" collapsible="true"}

회사의 직원 데이터베이스에 접근할 수 있게 해주는 `employeeById` 함수가 있습니다. 불행히도 이 함수는 `Employee?` 타입을 반환하므로 결과가 `null`일 수 있습니다. 여러분의 목표는 직원의 `id`가 주어졌을 때 해당 직원의 급여(salary)를 반환하거나, 직원이 데이터베이스에 없는 경우 `0`을 반환하는 함수를 작성하는 것입니다.

|---|---|
```kotlin
data class Employee (val name: String, var salary: Int)

fun employeeById(id: Int) = when(id) {
    1 -> Employee("Mary", 20)
    2 -> null
    3 -> Employee("John", 21)
    4 -> Employee("Ann", 23)
    else -> null
}

fun salaryById(id: Int) = // 코드를 여기에 작성하세요

fun main() {
    println((1..5).sumOf { id -> salaryById(id) })
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-null-safety-exercise"}

|---|---|
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="해답 예시" id="kotlin-tour-null-safety-solution"}

## 다음 단계는?

축하합니다! 이제 초급 투어를 완료하셨습니다. 중급 투어를 통해 Kotlin에 대한 이해도를 한 단계 더 높여보세요:

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-classes.md" mode="outline" icon="arrow-left" icon-position="left">이전 단계</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-extension-functions.md" mode="classic" icon="arrow-right" icon-position="right">Kotlin 중급 투어 시작하기</a>
  </li>
</list>