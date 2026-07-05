[//]: # (title: 기본 타입)

<no-index/>

<tldr>
    <p><img src="icon-1-done.svg" width="20" alt="첫 번째 단계" /> <a href="kotlin-tour-hello-world.md">Hello world</a><br />
        <img src="icon-2.svg" width="20" alt="두 번째 단계" /> <strong>기본 타입</strong><br />
        <img src="icon-3-todo.svg" width="20" alt="세 번째 단계" /> <a href="kotlin-tour-collections.md">컬렉션</a><br />
        <img src="icon-4-todo.svg" width="20" alt="네 번째 단계" /> <a href="kotlin-tour-control-flow.md">제어 흐름</a><br />
        <img src="icon-5-todo.svg" width="20" alt="다섯 번째 단계" /> <a href="kotlin-tour-functions.md">함수</a><br />
        <img src="icon-6-todo.svg" width="20" alt="여섯 번째 단계" /> <a href="kotlin-tour-classes.md">클래스</a><br />
        <img src="icon-7-todo.svg" width="20" alt="마지막 단계" /> <a href="kotlin-tour-null-safety.md">널 안전성</a></p>
</tldr>

코틀린의 모든 변수와 데이터 구조에는 타입이 있습니다. 타입은 컴파일러에게 해당 변수나 데이터 구조로 무엇을 할 수 있는지, 즉 어떤 함수와 프로퍼티를 가지고 있는지 알려주기 때문에 중요합니다.

이전 장의 예제에서 코틀린은 `customers`가 [`Int`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int/) 타입임을 식별할 수 있었습니다. 타입을 **추론**하는 코틀린의 이러한 능력을 **타입 추론(type inference)**이라고 합니다. `customers`에 정수 값이 할당되었기 때문에, 코틀린은 `customers`가 숫자 타입인 `Int`를 가진다고 추론합니다. 그 결과, 컴파일러는 `customers`를 사용하여 산술 연산을 수행할 수 있다는 것을 알게 됩니다.

```kotlin
fun main() {
//sampleStart
    var customers = 10

    // 일부 고객이 대기열을 떠남
    customers = 8

    customers = customers + 3 // 덧셈 예시: 11
    customers += 7            // 덧셈 예시: 18
    customers -= 3            // 뺄셈 예시: 15
    customers *= 2            // 곱셈 예시: 30
    customers /= 3            // 나눗셈 예시: 10

    println(customers) // 10
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-basic-types-arithmetic"}

> `+=`, `-=`, `*=`, `/=`, `%=`는 복합 대입 연산자(augmented assignment operators)입니다. 자세한 내용은 [복합 대입(Augmented assignments)](operator-overloading.md#augmented-assignments)을 참조하세요.
> 
{style="tip"}

코틀린에는 다음과 같은 기본 타입들이 있습니다.

| **카테고리**                                              | **기본 타입**                    | **예시 코드**                                                  |
|-----------------------------------------------------------|------------------------------------|-------------------------------------------------------------------|
| [정수형 (Integers)](numbers.md#integer-types)                      | `Byte`, `Short`, `Int`, `Long`     | `val year: Int = 2020`<br/> `val amount: Long = 350_000_000`      |
| [부호 없는 정수형 (Unsigned integers)](unsigned-integer-types.md)            | `UByte`, `UShort`, `UInt`, `ULong` | `val score: UInt = 100u`                                          |
| [부동 소수점 수 (Floating-point numbers)](numbers.md#floating-point-types) | `Float`, `Double`                  | `val currentTemp: Float = 24.5f`<br/> `val price: Double = 19.99` |
| [불리언 (Booleans)](booleans.md)                                   | `Boolean`                          | `val isEnabled: Boolean = true`                                   |
| [문자 (Characters)](characters.md)                               | `Char`                             | `val separator: Char = ','`                                       |
| [문자열 (Strings)](strings.md)                                     | `String`                           | `val message: String = "Hello, world!"`                           |

기본 타입과 그 속성에 대한 자세한 내용은 [타입 개요(Types overview)](types-overview.md)를 참조하세요.

이러한 지식을 바탕으로 변수를 선언하고 나중에 초기화할 수 있습니다. 코틀린은 변수가 처음 읽히기 전에만 초기화된다면 이를 관리할 수 있습니다.

초기화하지 않고 변수를 선언하려면 `:`를 사용하여 타입을 지정하세요. 예를 들면 다음과 같습니다.

```kotlin
fun main() {
//sampleStart
    // 초기화 없이 변수 선언
    val d: Int
    // 변수 초기화
    d = 3

    // 타입을 명시적으로 지정하고 초기화한 변수
    val e: String = "hello"

    // 초기화되었으므로 변수를 읽을 수 있음
    println(d) // 3
    println(e) // hello
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-basic-types-initialization"}

변수를 읽기 전에 초기화하지 않으면 오류가 발생합니다.

```kotlin
fun main() {
//sampleStart
    // 초기화 없이 변수 선언
    val d: Int
    
    // 오류 발생
    println(d)
    // 변수 'd'는 반드시 초기화되어야 합니다.
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-basic-types-no-initialization" validate="false"}

이제 기본 타입을 선언하는 방법을 알았으니, [컬렉션(collections)](kotlin-tour-collections.md)에 대해 알아볼 차례입니다.

## 연습 문제

### 연습 문제 {initial-collapse-state="collapsed" collapsible="true"}

각 변수에 대해 올바른 타입을 명시적으로 선언하세요.

|---|---|
```kotlin
fun main() {
    val a: Int = 1000 
    val b = "log message"
    val c = 3.14
    val d = 100_000_000_000_000
    val e = false
    val f = '
'
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-basic-types-exercise"}

|---|---|
```kotlin
fun main() {
    val a: Int = 1000
    val b: String = "log message"
    val c: Double = 3.14
    val d: Long = 100_000_000_000_000
    val e: Boolean = false
    val f: Char = '
'
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="모범 답안" id="kotlin-tour-basic-types-solution"}

## 다음 단계

[컬렉션](kotlin-tour-collections.md)