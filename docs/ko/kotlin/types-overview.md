[//]: # (title: 타입 개요)

Kotlin에서는 모든 변수에 대해 멤버 함수와 프로퍼티를 호출할 수 있다는 점에서 모든 것이 객체입니다.
숫자, 문자, 불리언과 같은 일부 타입은 런타임에 원시 값(primitive value)으로 최적화된 내부 표현을 갖지만, Kotlin 코드에서는 일반 클래스처럼 보이고 동작합니다.

## 기본 타입 {id="basic-types"}

이 섹션에서는 Kotlin에서 사용되는 기본 타입을 설명합니다.

| **카테고리**                                              | **기본 타입**                      | **정의**                           |
|-----------------------------------------------------------|------------------------------------|------------------------------------|
| [정수](numbers.md#integer-types)                          | `Byte`, `Short`, `Int`, `Long`     | 정수(Whole numbers)                |
| [부호 없는 정수](unsigned-integer-types.md)                | `UByte`, `UShort`, `UInt`, `ULong` | 0 이상의 정수                      |
| [부동소수점 수](numbers.md#floating-point-types)          | `Float`, `Double`                  | 소수부가 있는 수                   |
| [불리언](booleans.md)                                     | `Boolean`                          | 논리값: `true` 및 `false`          |
| [문자](characters.md)                                     | `Char`                             | 단일 문자                          |
| [문자열](strings.md)                                      | `String`                           | 문자 시퀀스                        |
| [배열](arrays.md)                                         | `Array<T>`, 원시 타입 배열         | 고정된 크기의 값 시퀀스            |

> 기본적으로 모든 타입은 널 불가(non-nullable)입니다. `null` 값을 허용하려면 변수 타입 바로 뒤에 `?` 기호를 붙여 변수를 선언하세요. 예를 들어 `String?`과 같습니다. 자세한 내용은 [Null 안전성](null-safety.md#nullable-types-and-non-nullable-types)에서 확인할 수 있습니다.
> 
{style="note"}

`Nothing`, `Any`, `Unit`과 같은 다른 Kotlin 타입에 대해 알아보려면 Kotlin API 레퍼런스를 확인하세요.

* [`Any`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-any/) – Kotlin 클래스 계층 구조의 최상위 루트입니다.
* [`Nothing`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-nothing.html) – 아무런 값도 갖지 않는 타입입니다.
* [`Unit`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-unit/) – 오직 하나의 값(`Unit`)만을 갖는 타입입니다. 컴파일러는 블록 본문을 가지며 명시적 반환 타입이 없는 함수의 반환 타입으로 이 타입을 추론합니다. [Unit 반환 함수](functions.md#unit-returning-functions)를 참고하세요.

## 표기 불가능한 타입 (Non-denotable types) {id="non-denotable-types"}

Kotlin에는 표기 불가능한 타입(non-denotable types)도 있습니다. 이는 Kotlin 코드에서 직접 작성할 수 없는 타입입니다. 대신 컴파일러가 다른 언어와의 상호 운용성 등을 위해 내부적으로 사용합니다. Kotlin은 소스 구문이 허용하는 것보다 더 정밀한 타입 정보를 나타내기 위해 표기 불가능한 타입을 생성합니다.

표기 불가능한 타입을 직접 선언할 수는 없지만, 컴파일러 진단, IDE 툴팁 또는 추론된 타입 표시에서 이를 마주칠 수 있습니다. 표기 불가능한 타입에 대한 자세한 내용은 다음을 참고하세요.

* [플랫폼 타입](java-interop.md#null-safety-and-platform-types)
* [](typecasts.md#intersection-types)
* [](numbers.md#integer-literal-types)
* [](generics.md#captured-types)
* [Kotlin 언어 사양: 타입 시스템](https://kotlinlang.org/spec/type-system.html)

> [Kotlin에서 타입 검사 및 캐스트를 수행하는 방법 알아보기](typecasts.md).
>
{style="tip"}