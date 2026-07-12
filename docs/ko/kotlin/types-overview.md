[//]: # (title: 타입 개요)

Kotlin에서는 어떤 변수에서든 멤버 함수와 프로퍼티를 호출할 수 있다는 의미에서 모든 것이 객체(object)입니다.
숫자, 문자, 불리언과 같은 특정 타입은 런타임에 기본형(primitive values)으로 최적화된 내부 표현을 갖기도 하지만, 사용자에게는 일반 클래스와 동일하게 보이고 동작합니다.

이 섹션에서는 Kotlin에서 사용되는 기본 타입들을 설명합니다:

* [숫자(Numbers)](numbers.md) 및 [부호 없는 정수 타입(unsigned counterparts)](unsigned-integer-types.md)
* [불리언(Booleans)](booleans.md)
* [문자(Characters)](characters.md)
* [문자열(Strings)](strings.md)
* [배열(Arrays)](arrays.md)

`Nothing`, `Any`, `Unit`과 같은 다른 Kotlin 타입에 대해 알아보려면 Kotlin API 레퍼런스를 참고하세요:

* [`Any`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-any/)
* [`Nothing`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-nothing.html)
* [`Unit`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-unit/)

Kotlin에는 직접 표기할 수 없는 타입(non-denotable types)도 있습니다. 이들은 Kotlin 코드에 직접 작성할 수 없는 타입입니다. 대신 컴파일러가 타 언어와의 상호 운용성 등을 위해 내부적으로 사용합니다. Kotlin은 소스 구문이 허용하는 것보다 더 정밀한 타입 정보를 표현하기 위해 이러한 직접 표기할 수 없는 타입을 생성합니다.

이러한 직접 표기할 수 없는 타입을 직접 선언할 수는 없지만, 컴파일러 진단(diagnostics), IDE 툴팁 또는 추론된 타입 표시에서 마주칠 수 있습니다. 다음에서 직접 표기할 수 없는 타입에 대해 자세히 알아보세요:

* [플랫폼 타입(Platform types)](java-interop.md#null-safety-and-platform-types)
* [교차 타입(Intersection types)](typecasts.md#intersection-types)
* [정수 리터럴 타입(Integer literal types)](numbers.md#integer-literal-types)
* [캡처된 타입(Captured types)](generics.md#captured-types)
* [Kotlin 언어 사양: 타입 시스템(Kotlin language specification: Type system)](https://kotlinlang.org/spec/type-system.html)

> [Kotlin에서 타입 검사 및 캐스트를 수행하는 방법 알아보기](typecasts.md).
>
{style="tip"}