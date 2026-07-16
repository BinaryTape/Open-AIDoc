[//]: # (title: Kotlin 1.5.x 호환성 가이드)

_[언어의 현대성 유지](kotlin-evolution-principles.md)_ 및 _[편안한 업데이트](kotlin-evolution-principles.md)_는 코틀린 언어 설계의 기본 원칙 중 하나입니다. 전자는 언어의 진화를 방해하는 구조를 제거해야 함을 의미하며, 후자는 코드 마이그레이션을 가능한 한 원활하게 만들기 위해 이러한 제거 작업이 사전에 충분히 전달되어야 함을 의미합니다.

대부분의 언어 변경 사항은 업데이트 변경 로그나 컴파일러 경고와 같은 다른 채널을 통해 이미 발표되었지만, 이 문서는 이를 모두 요약하여 코틀린 1.4에서 코틀린 1.5로의 마이그레이션을 위한 완전한 참조를 제공합니다.

## 기본 용어

이 문서에서는 여러 종류의 호환성을 소개합니다:

- _소스(source)_: 소스 수준에서 호환되지 않는 변경은 이전에 정상적으로 컴파일되던(에러나 경고 없이) 코드가 더 이상 컴파일되지 않음을 의미합니다.
- _바이너리(binary)_: 두 바이너리 아티팩트가 서로 교체되었을 때 로딩 또는 연결(linkage) 에러가 발생하지 않는다면 바이너리 호환이 가능하다고 합니다.
- _동작(behavioral)_: 변경을 적용하기 전후에 동일한 프로그램이 서로 다른 동작을 나타내는 경우, 동작 수준에서 호환되지 않는 변경이라고 합니다.

이러한 정의는 순수 코틀린에 대해서만 적용된다는 점에 유의하세요. 다른 언어(예: Java)의 관점에서 본 코틀린 코드의 호환성은 이 문서의 범위를 벗어납니다.

## 언어 및 표준 라이브러리(stdlib)

### 시그니처 폴리모픽 호출에서 스프레드 연산자 사용 금지

> **이슈**: [KT-35226](https://youtrack.jetbrains.com/issue/KT-35226)
>
> **컴포넌트**: 코어 언어
>
> **호환되지 않는 변경 유형**: 소스
>
> **요약**: 코틀린 1.5에서는 시그니처 폴리모픽(signature-polymorphic) 호출에 스프레드 연산자(*)를 사용하는 것이 금지됩니다.
>
> **지원 중단 주기**:
>
> - 1.5 미만: 호출 지점에서 문제가 되는 연산자에 대해 경고를 도입합니다.
> - 1.5 이상: 이 경고를 에러로 격상합니다.
>  `-XXLanguage:-ProhibitSpreadOnSignaturePolymorphicCall`을 사용하여 일시적으로 1.5 이전의 동작으로 되돌릴 수 있습니다.

### 해당 클래스에서 보이지 않는 추상 멤버(internal/package-private)를 포함하는 비추상 클래스 금지

> **이슈**: [KT-27825](https://youtrack.jetbrains.com/issue/KT-27825)
>
> **컴포넌트**: 코어 언어
>
> **호환되지 않는 변경 유형**: 소스
>
> **요약**: 코틀린 1.5에서는 해당 클래스에서 보이지 않는(internal/package-private) 추상 멤버를 포함하는 비추상(non-abstract) 클래스를 금지합니다.
>
> **지원 중단 주기**:
>
> - 1.5 미만: 문제가 되는 클래스에 대해 경고를 도입합니다.
> - 1.5 이상: 이 경고를 에러로 격상합니다.
>  `-XXLanguage:-ProhibitInvisibleAbstractMethodsInSuperclasses`를 사용하여 일시적으로 1.5 이전의 동작으로 되돌릴 수 있습니다.

### JVM에서 실체화되지 않은 타입 파라미터를 기반으로 한 배열을 실체화된 타입 인자로 사용하는 것 금지

> **이슈**: [KT-31227](https://youtrack.jetbrains.com/issue/KT-31227)
>
> **컴포넌트**: 코어 언어
>
> **호환되지 않는 변경 유형**: 소스
>
> **요약**: 코틀린 1.5에서는 JVM에서 실체화되지 않은(non-reified) 타입 파라미터를 기반으로 한 배열을 실체화된(reified) 타입 인자로 사용하는 것을 금지합니다.
>
> **지원 중단 주기**:
>
> - 1.5 미만: 문제가 되는 호출에 대해 경고를 도입합니다.
> - 1.5 이상: 이 경고를 에러로 격상합니다.
>  `-XXLanguage:-ProhibitNonReifiedArraysAsReifiedTypeArguments`를 사용하여 일시적으로 1.5 이전의 동작으로 되돌릴 수 있습니다.

### 기본 생성자로 위임하지 않는 열거형 클래스의 보조 생성자 금지

> **이슈**: [KT-35870](https://youtrack.jetbrains.com/issue/KT-35870)
>
> **컴포넌트**: 코어 언어
>
> **호환되지 않는 변경 유형**: 소스
>
> **요약**: 코틀린 1.5에서는 기본 생성자로 위임(delegate)하지 않는 열거형(enum) 클래스의 보조 생성자 사용을 금지합니다.
>
> **지원 중단 주기**:
>
> - 1.5 미만: 문제가 되는 생성자에 대해 경고를 도입합니다.
> - 1.5 이상: 이 경고를 에러로 격상합니다.
>  `-XXLanguage:-RequiredPrimaryConstructorDelegationCallInEnums`를 사용하여 일시적으로 1.5 이전의 동작으로 되돌릴 수 있습니다.

### private 인라인 함수에서 익명 타입 노출 금지

> **이슈**: [KT-33917](https://youtrack.jetbrains.com/issue/KT-33917)
>
> **컴포넌트**: 코어 언어
>
> **호환되지 않는 변경 유형**: 소스
>
> **요약**: 코틀린 1.5에서는 private 인라인 함수로부터 익명 타입(anonymous types)을 노출하는 것을 금지합니다.
>
> **지원 중단 주기**:
>
> - 1.5 미만: 문제가 되는 생성자에 대해 경고를 도입합니다.
> - 1.5 이상: 이 경고를 에러로 격상합니다.
>  `-XXLanguage:-ApproximateAnonymousReturnTypesInPrivateInlineFunctions`를 사용하여 일시적으로 1.5 이전의 동작으로 되돌릴 수 있습니다.

### SAM 변환 인자 뒤에 스프레드되지 않은 배열을 전달하는 것 금지

> **이슈**: [KT-35224](https://youtrack.jetbrains.com/issue/KT-35224)
>
> **컴포넌트**: 코어 언어
>
> **호환되지 않는 변경 유형**: 소스
>
> **요약**: 코틀린 1.5에서는 SAM 변환(SAM-conversion)이 적용되는 인자 뒤에 스프레드되지 않은(non-spread) 배열을 전달하는 것을 금지합니다.
>
> **지원 중단 주기**:
>
> - 1.3.70: 문제가 되는 호출에 대해 경고를 도입합니다.
> - 1.5 이상: 이 경고를 에러로 격상합니다.
>  `-XXLanguage:-ProhibitVarargAsArrayAfterSamArgument`를 사용하여 일시적으로 1.5 이전의 동작으로 되돌릴 수 있습니다.

### 언더스코어로 명명된 catch 블록 파라미터에 대한 특수 시맨틱 지원

> **이슈**: [KT-31567](https://youtrack.jetbrains.com/issue/KT-31567)
>
> **컴포넌트**: 코어 언어
>
> **호환되지 않는 변경 유형**: 소스
>
> **요약**: 코틀린 1.5에서는 catch 블록에서 예외 파라미터 이름을 생략하기 위해 사용된 언더스코어 기호(`_`)를 참조하는 것을 금지합니다.
>
> **지원 중단 주기**:
>
> - 1.4.20: 문제가 되는 참조에 대해 경고를 도입합니다.
> - 1.5 이상: 이 경고를 에러로 격상합니다.
>  `-XXLanguage:-ForbidReferencingToUnderscoreNamedParameterOfCatchBlock`을 사용하여 일시적으로 1.5 이전의 동작으로 되돌릴 수 있습니다.

### SAM 변환 구현 전략을 익명 클래스 기반에서 invokedynamic으로 변경

> **이슈**: [KT-44912](https://youtrack.jetbrains.com/issue/KT-44912)
>
> **컴포넌트**: Kotlin/JVM
>
> **호환되지 않는 변경 유형**: 동작
>
> **요약**: 코틀린 1.5부터 SAM(단일 추상 메서드) 변환의 구현 전략이 익명 클래스 생성에서 `invokedynamic` JVM 명령어를 사용하는 방식으로 변경됩니다.
>
> **지원 중단 주기**:
>
> - 1.5: SAM 변환의 구현 전략을 변경합니다.
>  `-Xsam-conversions=class`를 사용하여 이전의 구현 방식으로 되돌릴 수 있습니다.

### JVM IR 기반 백엔드 관련 성능 문제

> **이슈**: [KT-48233](https://youtrack.jetbrains.com/issue/KT-48233)
>
> **컴포넌트**: Kotlin/JVM
>
> **호환되지 않는 변경 유형**: 동작
>
> **요약**: 코틀린 1.5는 Kotlin/JVM 컴파일러에 대해 기본적으로 [IR 기반 백엔드](https://blog.jetbrains.com/kotlin/2021/02/the-jvm-backend-is-in-beta-let-s-make-it-stable-together/)를 사용합니다. 이전 버전의 언어 버전에서는 여전히 이전 백엔드가 기본으로 사용됩니다.
>
> 코틀린 1.5에서 새로운 컴파일러를 사용할 때 일부 성능 저하 이슈가 발생할 수 있습니다. 현재 이러한 사례들을 해결하기 위해 작업 중입니다.
>
> **지원 중단 주기**:
>
> - 1.5 미만: 기본적으로 이전 JVM 백엔드가 사용됩니다.
> - 1.5 이상: 기본적으로 IR 기반 백엔드가 사용됩니다. 코틀린 1.5에서 이전 백엔드를 사용해야 하는 경우, 프로젝트 설정 파일에 다음 줄을 추가하여 일시적으로 1.5 이전의 동작으로 되돌릴 수 있습니다:
>
> Gradle에서:
>
> <tabs>
>
> ```kotlin
> tasks.withType<org.jetbrains.kotlin.gradle.dsl.KotlinJvmCompile> {
>   kotlinOptions.useOldBackend = true
> }
> ```
>
> ```groovy
> tasks.withType(org.jetbrains.kotlin.gradle.dsl.KotlinJvmCompile) {
>   kotlinOptions.useOldBackend = true
> }
> ```
>
> </tabs>
>
> Maven에서:
>
> ```xml
> <configuration>
>     <args>
>         <arg>-Xuse-old-backend</arg>
 >     </args>
> </configuration>
> ```
>
> 이 플래그에 대한 지원은 향후 릴리스 중 하나에서 제거될 예정입니다.

### JVM IR 기반 백엔드의 새로운 필드 정렬 방식

> **이슈**: [KT-46378](https://youtrack.jetbrains.com/issue/KT-46378)
>
> **컴포넌트**: Kotlin/JVM
>
> **호환되지 않는 변경 유형**: 동작
>
> **요약**: 1.5 버전부터 코틀린은 JVM 바이트코드를 다르게 정렬하는 [IR 기반 백엔드](https://blog.jetbrains.com/kotlin/2021/02/the-jvm-backend-is-in-beta-let-s-make-it-stable-together/)를 사용합니다. 이전 백엔드와 반대로, 생성자에서 선언된 필드를 본문에서 선언된 필드보다 먼저 생성합니다. 이러한 새로운 정렬 방식은 Java 직렬화와 같이 필드 순서에 의존하는 직렬화 프레임워크를 사용하는 프로그램의 동작을 변화시킬 수 있습니다.
>
> **지원 중단 주기**:
>
> - 1.5 미만: 기본적으로 이전 JVM 백엔드가 사용됩니다. 이 백엔드는 본문에서 선언된 필드를 생성자에서 선언된 필드보다 먼저 정렬합니다.
> - 1.5 이상: 기본적으로 새로운 IR 기반 백엔드가 사용됩니다. 생성자에서 선언된 필드가 본문에서 선언된 필드보다 먼저 생성됩니다. 해결 방법으로 코틀린 1.5에서 일시적으로 이전 백엔드로 전환할 수 있습니다. 이를 위해 프로젝트 설정 파일에 다음 내용을 추가하십시오:
>
> Gradle에서:
>
> <tabs>
>
> ```kotlin
> tasks.withType<org.jetbrains.kotlin.gradle.dsl.KotlinJvmCompile> {
>   kotlinOptions.useOldBackend = true
> }
> ```
>
> ```groovy
> tasks.withType(org.jetbrains.kotlin.gradle.dsl.KotlinJvmCompile) {
>   kotlinOptions.useOldBackend = true
> }
> ```
>
> </tabs>
>
> Maven에서:
>
> ```xml
> <configuration>
>     <args>
>         <arg>-Xuse-old-backend</arg>
> >     </args>
> </configuration>
> ```
>
> 이 플래그에 대한 지원은 향후 릴리스 중 하나에서 제거될 예정입니다.

### 델리게이트 표현식에 제네릭 호출이 있는 위임된 속성에 대해 널 가능성 단언 생성

> **이슈**: [KT-44304](https://youtrack.jetbrains.com/issue/KT-44304)
>
> **컴포넌트**: Kotlin/JVM
>
> **호환되지 않는 변경 유형**: 동작
>
> **요약**: 코틀린 1.5부터 코틀린 컴파일러는 델리게이트 표현식에 제네릭 호출이 포함된 위임된 속성(delegated properties)에 대해 널 가능성 단언(nullability assertions)을 생성합니다.
>
> **지원 중단 주기**:
>
> - 1.5: 위임된 속성에 대해 널 가능성 단언을 생성합니다(자세한 내용은 이슈 참조).
>  `-Xuse-old-backend` 또는 `-language-version 1.4`를 사용하여 일시적으로 1.5 이전의 동작으로 되돌릴 수 있습니다.

### @OnlyInputTypes 어노테이션이 붙은 타입 파라미터 호출에 대한 경고를 에러로 전환

> **이슈**: [KT-45861](https://youtrack.jetbrains.com/issue/KT-45861)
>
> **컴포넌트**: 코어 언어
>
> **호환되지 않는 변경 유형**: 소스
>
> **요약**: 코틀린 1.5에서는 타입 안전성을 높이기 위해 무의미한 인자를 사용하는 `contains`, `indexOf`, `assertEquals`와 같은 호출을 금지합니다.
>
> **지원 중단 주기**:
>
> - 1.4.0: 문제가 되는 생성자에 대해 경고를 도입합니다.
> - 1.5 이상: 이 경고를 에러로 격상합니다.
>  `-XXLanguage:-StrictOnlyInputTypesChecks`를 사용하여 일시적으로 1.5 이전의 동작으로 되돌릴 수 있습니다.

### 이름 붙은 가변 인자 호출 시 올바른 인자 실행 순서 사용

> **이슈**: [KT-17691](https://youtrack.jetbrains.com/issue/KT-17691)
>
> **컴포넌트**: Kotlin/JVM
>
> **호환되지 않는 변경 유형**: 동작
>
> **요약**: 코틀린 1.5에서는 이름 붙은 가변 인자(named vararg)를 사용한 호출에서 인자 실행 순서가 변경됩니다.
>
> **지원 중단 주기**:
>
> - 1.5 미만: 문제가 되는 생성자에 대해 경고를 도입합니다.
> - 1.5 이상: 이 경고를 에러로 격상합니다.
>  `-XXLanguage:-UseCorrectExecutionOrderForVarargArguments`를 사용하여 일시적으로 1.5 이전의 동작으로 되돌릴 수 있습니다.

### 연산자 함수 호출에서 파라미터의 기본값 사용

> **이슈**: [KT-42064](https://youtrack.jetbrains.com/issue/KT-42064)
>
> **컴포넌트**: Kotlin/JVM
>
> **호환되지 않는 변경 유형**: 동작
>
> **요약**: 코틀린 1.5에서는 연산자(operator) 호출 시 파라미터의 기본값(default value)을 사용합니다.
>
> **지원 중단 주기**:
>
> - 1.5 미만: 이전 동작이 유지됩니다(자세한 내용은 이슈 참조).
> - 1.5 이상: 동작이 변경됩니다.
>  `-XXLanguage:-JvmIrEnabledByDefault`를 사용하여 일시적으로 1.5 이전의 동작으로 되돌릴 수 있습니다.

### 정방향 진행이 비어 있는 경우 for 루프에서 빈 역방향 진행 생성

> **이슈**: [KT-42533](https://youtrack.jetbrains.com/issue/KT-42533)
>
> **컴포넌트**: Kotlin/JVM
>
> **호환되지 않는 변경 유형**: 동작
>
> **요약**: 코틀린 1.5에서는 정방향 진행(regular progression)이 비어 있는 경우 for 루프에서 빈 역방향 진행(reversed progression)을 생성합니다.
>
> **지원 중단 주기**:
>
> - 1.5 미만: 이전 동작이 유지됩니다(자세한 내용은 이슈 참조).
> - 1.5 이상: 동작이 변경됩니다.
>  `-XXLanguage:-JvmIrEnabledByDefault`를 사용하여 일시적으로 1.5 이전의 동작으로 되돌릴 수 있습니다.

### Char를 코드로, Char를 숫자로 변환하는 방식 정리

> **이슈**: [KT-23451](https://youtrack.jetbrains.com/issue/KT-23451)
>
> **컴포넌트**: kotlin-stdlib
>
> **호환되지 않는 변경 유형**: 소스
>
> **요약**: 코틀린 1.5부터 Char를 숫자 타입으로 변환하는 기능이 지원 중단(deprecated)됩니다.
>
> **지원 중단 주기**:
>
> - 1.5: `Char.toInt()/toShort()/toLong()/toByte()/toDouble()/toFloat()` 및 `Long.toChar()`와 같은 역방향 함수를 지원 중단하고 대체제를 제안합니다.

### kotlin.text 함수에서 일관성 없는 대소문자 무시 문자 비교

> **이슈**: [KT-45496](https://youtrack.jetbrains.com/issue/KT-45496)
>
> **컴포넌트**: kotlin-stdlib
>
> **호환되지 않는 변경 유형**: 동작
>
> **요약**: 코틀린 1.5부터 `Char.equals`의 대소문자 무시(case-insensitive) 비교 방식이 개선됩니다. 먼저 문자의 대문자 변형이 같은지 비교한 다음, 문자 자체가 아닌 해당 대문자 변형의 소문자 변형이 같은지 비교합니다.
>
> **지원 중단 주기**:
>
> - 1.5 미만: 이전 동작이 유지됩니다(자세한 내용은 이슈 참조).
> - 1.5: `Char.equals` 함수의 동작이 변경됩니다.

### 기본 로케일 민감 대소문자 변환 API 제거

> **이슈**: [KT-43023](https://youtrack.jetbrains.com/issue/KT-43023)
>
> **컴포넌트**: kotlin-stdlib
>
> **호환되지 않는 변경 유형**: 소스
>
> **요약**: 코틀린 1.5부터 `String.toUpperCase()`와 같은 기본 로케일 민감(locale-sensitive) 대소문자 변환 함수가 지원 중단됩니다.
>
> **지원 중단 주기**:
>
> - 1.5: 기본 로케일을 사용하는 대소문자 변환 함수를 지원 중단하고(자세한 내용은 이슈 참조) 대체제를 제안합니다.

### 컬렉션 min 및 max 함수의 반환 타입을 단계적으로 null 불가능하게 변경

> **이슈**: [KT-38854](https://youtrack.jetbrains.com/issue/KT-38854)
>
> **컴포넌트**: kotlin-stdlib (JVM)
>
> **호환되지 않는 변경 유형**: 소스
>
> **요약**: 컬렉션 `min` 및 `max` 함수의 반환 타입이 1.6에서 null 불가능(non-nullable)하게 변경됩니다.
>
> **지원 중단 주기**:
>
> - 1.4: 동의어로 `...OrNull` 함수를 도입하고 해당 API를 지원 중단합니다(자세한 내용은 이슈 참조).
> - 1.5.0: 해당 API의 지원 중단 수준을 에러(error)로 격상합니다.
> - 1.6 이상: 해당 API를 null 불가능한 반환 타입으로 다시 도입합니다.

### 부동 소수점 타입의 Short 및 Byte 변환 지원 중단 수준 격상

> **이슈**: [KT-30360](https://youtrack.jetbrains.com/issue/KT-30360)
>
> **컴포넌트**: kotlin-stdlib (JVM)
>
> **호환되지 않는 변경 유형**: 소스
>
> **요약**: 코틀린 1.4에서 `WARNING` 수준으로 지원 중단되었던 부동 소수점 타입의 `Short` 및 `Byte` 변환이 코틀린 1.5.0부터는 에러를 발생시킵니다.
>
> **지원 중단 주기**:
>
> - 1.4: `Double.toShort()/toByte()` 및 `Float.toShort()/toByte()`를 지원 중단하고 대체제를 제안합니다.
> - 1.5.0: 지원 중단 수준을 에러로 격상합니다.

## 도구

### 단일 프로젝트에서 여러 JVM 변체의 kotlin-test를 혼용하지 마십시오.

> **이슈**: [KT-40225](https://youtrack.jetbrains.com/issue/KT-40225)
>
> **컴포넌트**: Gradle
>
> **호환되지 않는 변경 유형**: 동작
>
> **요약**: 트랜지티브 디펜던시(transitive dependency)에 의해 다른 테스트 프레임워크를 위한 서로 배타적인 여러 `kotlin-test` 변체가 프로젝트에 포함될 수 있었습니다. 1.5.0부터 Gradle은 서로 배타적인 여러 `kotlin-test` 변체를 허용하지 않습니다.
>
> **지원 중단 주기**:
>
> - 1.5 미만: 서로 배타적인 여러 `kotlin-test` 변체를 프로젝트에 포함하는 것이 허용되었습니다.
> - 1.5 이상: 동작이 변경되었습니다.
> Gradle에서 "Cannot select module with conflict on capability..."와 같은 예외를 던집니다. 가능한 해결 방법:
>    * 트랜지티브 디펜던시가 가져오는 것과 동일한 `kotlin-test` 변체 및 해당 테스트 프레임워크를 사용합니다.
>    * `kotlin-test` 변체를 트랜지티브하게 가져오지 않는 다른 버전의 의존성을 찾아 사용하려는 테스트 프레임워크를 사용할 수 있도록 합니다.
>    * 사용하려는 테스트 프레임워크와 동일한 다른 `kotlin-test` 변체를 가져오는 다른 버전의 의존성을 찾습니다.
>    * 트랜지티브하게 포함된 테스트 프레임워크를 제외(exclude)합니다. 다음은 JUnit 4를 제외하는 예시입니다:
>      ```groovy
>      configurations { 
>          testImplementation.get().exclude("org.jetbrains.kotlin", "kotlin-test-junit")
>      }
>      ```
>      테스트 프레임워크를 제외한 후 애플리케이션을 테스트하십시오. 작동하지 않는 경우 제외 설정을 롤백하고, 라이브러리와 동일한 테스트 프레임워크를 사용한 후 본인의 테스트 프레임워크를 제외하십시오.