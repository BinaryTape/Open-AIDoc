[//]: # (title: Java와의 비교)

## Kotlin에서 해결된 Java의 일부 문제점 {id="some-java-issues-addressed-in-kotlin"}

Kotlin은 Java가 겪고 있는 여러 문제점을 해결합니다:

* null 참조는 [타입 시스템에 의해 제어됩니다](null-safety.md).
* [원시 타입(Raw type)이 없습니다](java-interop.md#java-generics-in-kotlin).
* Kotlin의 배열은 [무공변(Invariant)입니다](arrays.md).
* Java의 SAM 변환과 달리 Kotlin에는 적절한 [함수 타입](lambdas.md#function-types)이 있습니다.
* 와일드카드 없는 [사용 지점 변성(Use-site variance)](generics.md#use-site-variance-type-projections)
* Kotlin에는 검사 [예외](exceptions.md)가 없습니다.
* [읽기 전용 컬렉션과 가변 컬렉션을 위한 별도의 인터페이스](collections-overview.md)
* Kotlin은 [`Enum.values()`를 대체하는 성능이 뛰어나고 편리한 기능](enum-classes.md#find-enum-constants)을 제공합니다.

## Java에는 있고 Kotlin에는 없는 것 {id="what-java-has-that-kotlin-does-not"}

* [검사 예외(Checked exceptions)](exceptions.md)
* 클래스가 아닌 [기본 타입(Primitive types)](types-overview.md). 바이트코드에서는 가능한 경우 기본 타입을 사용하지만, 코드에서 명시적으로 제공되지는 않습니다.
* [정적 멤버(Static members)](classes.md)는 [동반 객체(Companion objects)](object-declarations.md#companion-objects), [최상위 함수](functions.md), [확장 함수](extensions.md#extension-functions) 또는 [@JvmStatic](java-to-kotlin-interop.md#static-methods)으로 대체됩니다.
* [와일드카드 타입](generics.md)은 [선언 지점 변성(Declaration-site variance)](generics.md#declaration-site-variance) 및 [타입 프로젝션(Type projections)](generics.md#type-projections)으로 대체됩니다.
* [삼항 연산자 `a ? b : c`](control-flow.md#if-expression)는 [if 식](control-flow.md#if-expression)으로 대체됩니다. 
* [레코드(Records)](https://openjdk.org/jeps/395)
* package-private [가시성 제한자](visibility-modifiers.md)

> Kotlin에는 패턴 매칭이 없지만, [Kotlin의 스마트 캐스트](typecasts.md#smart-casts)는 
> [Java의 패턴 매칭](https://openjdk.org/projects/amber/design-notes/patterns/pattern-matching-for-java)과 유사한 기능을 제공합니다.
>
> 자세한 내용은 [공식 Kotlin by JetBrains 채널의 영상](https://www.youtube.com/watch?v=yJDoa42X-wQ)에서 확인하세요.
>
{style="note"}

## Kotlin에는 있고 Java에는 없는 것 {id="what-kotlin-has-that-java-does-not"}

* [람다 식](lambdas.md) + [인라인 함수](inline-functions.md) = 성능이 뛰어난 커스텀 제어 구조
* [확장 함수](extensions.md)
* [널 안전성(Null-safety)](null-safety.md)
* [문자열 템플릿](strings.md)
* [프로퍼티](properties.md)
* [기본 생성자(Primary constructors)](classes.md)
* [일급 위임(First-class delegation)](delegation.md)
* [변수 및 프로퍼티 타입에 대한 타입 추론](types-overview.md) (**Java 10**: [지역 변수 타입 추론(Local-Variable Type Inference)](https://openjdk.org/jeps/286))
* [싱글톤](object-declarations.md)
* [선언 지점 변성 및 타입 프로젝션](generics.md)
* [범위 식(Range expressions)](ranges.md)
* [연산자 오버로딩](operator-overloading.md)
* [동반 객체(Companion objects)](classes.md#companion-objects)
* [데이터 클래스(Data classes)](data-classes.md)
* [코루틴(Coroutines)](coroutines-overview.md)
* [최상위 함수](functions.md)
* [기본값을 가진 매개변수](functions.md#parameters-with-default-values)
* [이름 있는 매개변수(Named parameters)](functions.md#named-arguments)
* [중위 함수(Infix functions)](functions.md#infix-notation)
* [expect 및 actual 선언](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)
* [명시적 API 모드(Explicit API mode)](whatsnew14.md#explicit-api-mode-for-library-authors) 및 [향상된 API 노출 범위 제어](opt-in-requirements.md)

> Java에는 스마트 캐스트가 없지만, [패턴 매칭](https://openjdk.org/projects/amber/design-notes/patterns/pattern-matching-for-java)은
> [Kotlin의 스마트 캐스트](typecasts.md#smart-casts)와 유사한 기능을 제공합니다.
>
> 자세한 내용은 [공식 Kotlin by JetBrains 채널의 영상](https://www.youtube.com/watch?v=yJDoa42X-wQ)에서 확인하세요.
>
{style="note"}

## 다음 단계 {id="what-s-next"}

다음 방법을 알아보세요:
* [Java와 Kotlin에서 문자열을 사용한 일반적인 작업](java-to-kotlin-idioms-strings.md) 수행하기
* [Java와 Kotlin에서 컬렉션을 사용한 일반적인 작업](java-to-kotlin-collections-guide.md) 수행하기
* [Java와 Kotlin에서 null 가능성 다루기](java-to-kotlin-nullability-guide.md)