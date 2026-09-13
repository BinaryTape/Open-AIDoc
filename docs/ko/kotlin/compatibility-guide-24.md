[//]: # (title: Kotlin 2.4.x 호환성 가이드)

_[현대적인 언어 유지(Keeping the Language Modern)](kotlin-evolution-principles.md)_ 및 _[편안한 업데이트(Comfortable Updates)](kotlin-evolution-principles.md)_는 Kotlin 언어 설계의 기본 원칙 중 일부입니다. 전자는 언어의 발전을 방해하는 구조를 제거해야 함을 의미하며, 후자는 코드 마이그레이션을 가능한 한 원활하게 하기 위해 이러한 제거를 사전에 충분히 알려야 함을 의미합니다.

대부분의 언어 변경 사항은 업데이트 변경 로그나 컴파일러 경고와 같은 다른 채널을 통해 이미 발표되었지만, 이 문서는 Kotlin 2.3에서 Kotlin 2.4로의 마이그레이션을 위한 완전한 참조를 제공하기 위해 이를 모두 요약합니다. 이 문서에는 도구 관련 변경 사항에 대한 정보도 포함되어 있습니다.

## 기본 용어 {id="basic-terms"}

이 문서에서는 여러 종류의 호환성을 소개합니다.

- _소스(source)_: 소스 비호환 변경 사항은 이전에 문제없이(에러나 경고 없이) 컴파일되던 코드가 더 이상 컴파일되지 않게 합니다.
- _바이너리(binary)_: 두 바이너리 아티팩트를 서로 교체했을 때 로딩이나 링크 에러가 발생하지 않는 경우 이를 바이너리 호환이라고 합니다.
- _동작(behavioral)_: 변경 사항을 적용하기 전후에 동일한 프로그램이 다른 동작을 보이는 경우 이를 동작 비호환 변경 사항이라고 합니다.

이러한 정의는 순수 Kotlin에 대해서만 제공된다는 점을 기억하십시오. 다른 언어(예: Java)의 관점에서의 Kotlin 코드 호환성은 이 문서의 범위를 벗어납니다.

## 언어 (Language) {id="language"}

### -language-version=1.9 및 K1 컴파일러 지원 종료 {id="drop-support-for-language-version-1-9-and-the-k1-compiler"}

> **이슈**: [KT-80590](https://youtrack.jetbrains.com/issue/KT-80590)
>
> **컴포넌트**: 컴파일러
>
> **비호환 변경 유형**: 소스
>
> **요약**: Kotlin 2.4부터 컴파일러는 더 이상 [`-language-version=1.9`](compiler-reference.md#language-version-version)를 지원하지 않습니다. 결과적으로 K1 컴파일러는 더 이상 지원되지 않습니다.
>
> **지속 중단 사이클**:
>
> - 2.2.0: `-language-version`에 1.9 버전을 사용할 때 경고 보고
> - 2.4.0: 경고를 에러로 격상

### Java 타입에 대한 유연한 명시적 nullable 타입 인자 금지 {id="prohibit-flexible-explicit-nullable-type-arguments-for-java-types"}

> **이슈**: [KTLC-284](https://youtrack.jetbrains.com/issue/KTLC-284)
>
> **컴포넌트**: 핵심 언어
>
> **비호환 변경 유형**: 소스
>
> **요약**: 이전에는 Kotlin에서 Java API를 호출할 때, 컴파일러가 명시적으로 지정된 nullable 타입 인자를 유연한 타입(flexible type) 인자로 취급할 수 있었습니다. Kotlin 2.4.0은 더 이상 nullable 타입 인자에 대해 이 동작을 적용하지 않으므로, 타입 안전성을 깨뜨리거나 런타임에 실패할 수 있는 코드에 대해 컴파일러가 에러를 보고합니다.
>
> **지속 중단 사이클**:
>
> - 2.2.0: 유연한 타입으로 취급되는 명시적으로 지정된 nullable 타입 인자에 대해 경고 보고
> - 2.4.0: 경고를 에러로 격상

### 명백히 비호환인 타입에 대한 항상 false인 is 검사 금지 {id="prohibit-always-false-is-checks-for-definitely-incompatible-types"}

> **이슈**: [KTLC-365](https://youtrack.jetbrains.com/issue/KTLC-365)
>
> **컴포넌트**: 핵심 언어
>
> **비호환 변경 유형**: 소스
>
> **요약**: 컴파일러는 이제 검사되는 타입이 명백히 호환되지 않아 항상 false인 무의미한 `is` 검사를 방지합니다. 이는 비호환 타입이 포함된 다른 연산과 동작을 일관되게 유지하기 위함입니다.
>
> **지속 중단 사이클**:
>
> - 2.0.0: 명백히 비호환인 타입에 대한 `is` 검사에 대해 경고 보고
> - 2.4.0: 경고를 에러로 격상

### 인라인 함수에서 낮은 가시성을 가진 타입 및 선언 노출 금지 {id="prohibit-exposing-types-and-declarations-with-lower-visibility-in-inline-functions"}

> **이슈**: [KTLC-283](https://youtrack.jetbrains.com/issue/KTLC-283)
>
> **컴포넌트**: 핵심 언어
>
> **비호환 변경 유형**: 소스
>
> **요약**: 컴파일러는 이제 인라인 함수가 해당 인라인 함수 자체보다 낮은 가시성을 가진 타입 및 선언을 노출하는 것을 방지합니다.
>
> **지속 중단 사이클**:
>
> - 2.3.0: 인라인 함수에서 낮은 가시성을 가진 타입 및 선언 노출 시 경고 보고
> - 2.4.0: 경고를 에러로 격상

### 어노테이션의 기본 use-site target 선택 변경 {id="change-default-use-site-target-selection-for-annotations"}

> **이슈**: [KTLC-391](https://youtrack.jetbrains.com/issue/KTLC-391)
>
> **컴포넌트**: 핵심 언어
>
> **비호환 변경 유형**: 바이너리
>
> **요약**: Kotlin 2.4.0은 파라미터, 프로퍼티 및 필드에 어노테이션을 전파하기 위한 기본 규칙을 업데이트합니다. 이는 재컴파일 후 어노테이션 처리, 리플렉션 및 바이너리 메타데이터에 영향을 줄 수 있습니다. use-site target을 지정하지 않으면 컴파일러는 이제 `param`과 `property`가 적용 가능한 경우 이를 우선 사용하며, `property`가 적용되지 않는 경우에만 `field`를 사용합니다.
>
> `@Annotation` 대신 `@param:Annotation`과 같이 use-site target을 명시적으로 지정할 수 있습니다. 전체 프로젝트에 이전 기본 규칙을 사용하려면 빌드 파일에 `-Xannotation-default-target=first-only`를 추가하십시오.
>  
> **지속 중단 사이클**:
>
> - 2.2.0: 새로운 기본 규칙으로 인해 선택된 use-site target이 변경될 때 경고 보고
> - 2.4.0: 새로운 기본 규칙 활성화

### 접근 불가능한 타입에 대한 암시적 참조 금지 {id="forbid-implicit-references-to-inaccessible-types"}

> **이슈**: [KTLC-384](https://youtrack.jetbrains.com/issue/KTLC-384)
>
> **컴포넌트**: 핵심 언어
>
> **비호환 변경 유형**: 소스
>
> **요약**: 간접 의존성에서 접근 불가능한 타입을 암시적으로 참조하는 선언을 사용하는 경우 이제 에러가 발생합니다.
> 
> 마이그레이션하려면 접근 불가능한 타입을 선언하는 모듈에 대한 명시적 의존성을 추가하거나, 해당 타입을 노출하지 않도록 중간 API를 업데이트하십시오.
> 
> **지속 중단 사이클**:
>
> - 2.3.0: 접근 불가능한 타입에 대한 암시적 참조 시 경고 보고
> - 2.4.0: 경고를 에러로 격상

### Jakarta nullability 어노테이션 강제 적용 {id="enforce-jakarta-nullability-annotations"}

> **이슈**: [KTLC-285](https://youtrack.jetbrains.com/issue/KTLC-285)
>
> **컴포넌트**: 핵심 언어
>
> **비호환 변경 유형**: 소스
>
> **요약**: 컴파일러는 이제 [`jakarta.annotation.Nullable`](https://jakarta.ee/specifications/annotations/2.1/apidocs/jakarta.annotation/jakarta/annotation/nullable) 또는 [`jakarta.annotation.Nonnull`](https://jakarta.ee/specifications/annotations/2.1/apidocs/jakarta.annotation/jakarta/annotation/nonnull)을 사용하는 Java 선언에 대해 Kotlin에서 선언된 nullability를 강제 적용합니다. 이러한 어노테이션에 의해 nullable로 표시된 Java 선언을 non-null Kotlin 타입에 할당하면 컴파일러가 에러를 보고합니다.
>
> **지속 중단 사이클**:
>
> - 2.2.0: Jakarta nullability 어노테이션이 지정된 Java 선언의 nullability 불일치에 대해 경고 보고
> - 2.4.0: 경고를 에러로 격상

### 호출 가능 참조 한정자에서 잘못 위치한 타입 인자 보고 {id="report-misplaced-type-arguments-in-callable-reference-qualifiers"}

> **이슈**: [KTLC-388](https://youtrack.jetbrains.com/issue/KTLC-388)
>
> **컴포넌트**: 핵심 언어
>
> **비호환 변경 유형**: 소스
>
> **요약**: 컴파일러는 이제 호출 가능 참조(callable reference)의 좌측을 확인하고, 내부 클래스가 한정자(qualifier)의 잘못된 부분에 타입 인자를 포함하고 있는 경우 경고를 보고합니다.
> 
> 마이그레이션하려면 각 타입 인자가 이를 선언한 클래스에 속하도록 참조를 업데이트하십시오. 예를 들어, `Inner<String, Int>::toString` 대신 전체 타입인 `Outer<Int>.Inner<String>::toString`으로 작성하십시오.
>
> **지속 중단 사이클**:
>
> - 2.4.0: 호출 가능 참조의 좌측에 있는 타입 인자가 한정자의 다른 부분에 속하는 경우 경고 보고

### nullable 상한을 가진 reified 타입 파라미터의 클래스 리터럴에 대해 에러 보고 {id="report-errors-for-class-literals-from-reified-type-parameters-with-nullable-upper-bounds"}

> **이슈**: [KTLC-370](https://youtrack.jetbrains.com/issue/KTLC-370)
>
> **컴포넌트**: 핵심 언어
>
> **비호환 변경 유형**: 소스
>
> **요약**: 컴파일러는 이제 nullable 상한(upper bound)을 가진 reified 타입 파라미터에서 유래된 타입의 식에 `::class`를 사용할 때 에러를 보고합니다. 이러한 식에 `::class`를 사용하려면 명시적인 null 체크나 `!!` 연산자를 사용하여 값을 먼저 non-null로 만드십시오.
>
> **지속 중단 사이클**:
>
> - 2.3.0: nullable 상한을 가진 reified 타입 파라미터에서 유래된 타입의 식에 `::class` 사용 시 경고 보고
> - 2.4.0: 경고를 에러로 격상

### 익명 객체에서 선언 전 초기화 금지 {id="prohibit-initialization-before-declarations-in-anonymous-objects"}

> **이슈**: [KTLC-290](https://youtrack.jetbrains.com/issue/KTLC-290)
>
> **컴포넌트**: 핵심 언어
>
> **비호환 변경 유형**: 소스
>
> **요약**: Kotlin은 이제 익명 객체의 `init` 블록에서 프로퍼티를 선언하기 전에 초기화하는 경우 에러를 보고합니다.
> 
> **지속 중단 사이클**:
>
> - 2.2.20: 익명 객체의 `init` 블록에서 프로퍼티 선언 전 프로퍼티를 초기화할 때 경고 보고
> - 2.4.0: 경고를 에러로 격상

### 추상 클래스가 아닌 Java sealed 클래스를 사용한 when 표현식의 망라성 강제 {id="enforce-exhaustiveness-for-when-expressions-with-non-abstract-java-sealed-classes"}

> **이슈**: [KTLC-366](https://youtrack.jetbrains.com/issue/KTLC-366)
>
> **컴포넌트**: 핵심 언어
>
> **비호환 변경 유형**: 소스
>
> **요약**: Kotlin은 이제 망라성(exhaustiveness)을 더 엄격하게 체크하며, 추상 클래스가 아닌 Java sealed 클래스와 함께 `when` 표현식을 사용할 때 `else` 분기 또는 sealed 클래스 자체와 일치하는 분기를 요구합니다. 이전에는 Java sealed 클래스 자체가 직접 인스턴스화될 수 있음에도 불구하고 Kotlin이 이러한 `when` 표현식을 망라적인 것으로 취급할 수 있었습니다.
>
> **지속 중단 사이클**:
>
> - 2.3.0: 추상 클래스가 아닌 Java sealed 클래스를 사용한 비망라적 `when` 표현식에 대해 경고 보고
> - 2.4.0: 경고를 에러로 격상

### 너무 많은 파라미터를 가진 getValue() 및 setValue() 함수에 operator 수정자 금지 {id="prohibit-operator-modifier-on-getvalue-and-setvalue-functions-with-too-many-parameters"}

> **이슈**: [KTLC-289](https://youtrack.jetbrains.com/issue/KTLC-289)
>
> **컴포넌트**: 핵심 언어
>
> **비호환 변경 유형**: 소스
>
> **요약**: [`getValue()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.properties/-read-only-property/get-value.html) 또는 [`setValue()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.properties/-read-write-property/set-value.html) 함수를 `operator` 수정자로 표시할 때, 컴파일러는 이제 해당 함수들이 필요한 수의 값 파라미터를 가지고 있는지 확인합니다. `getValue()` 함수는 정확히 2개의 값 파라미터를 가져야 하며, `setValue()` 함수는 정확히 3개를 가져야 합니다. 마이그레이션하려면 `operator` 수정자를 제거하거나 함수 시그니처를 변경하십시오.
>
> **지속 중단 사이클**:
>
> - 2.2.20: 값 파라미터가 너무 많은 `operator` `getValue()` 및 `setValue()` 함수에 대해 경고 보고
> - 2.4.0: 경고를 에러로 격상

### 제네릭 호출에서 일치하지 않는 타입 인자 금지 {id="prohibit-inconsistent-type-arguments-in-generic-calls"}

> **이슈**: [KTLC-373](https://youtrack.jetbrains.com/issue/KTLC-373)
>
> **컴포넌트**: 핵심 언어
>
> **비호환 변경 유형**: 소스
>
> **요약**: 제네릭 호출에서 타입 인자를 지정할 때, 한 타입 인자가 다른 타입 인자에 의존하는 상한(upper-bound) 제약을 위반하면 컴파일러가 에러를 보고합니다. 타입 파라미터가 서로 의존하는 경우, 해당 제약 조건과 일치하는 타입 인자를 사용하십시오. 예를 들어, `Container<Alpha, BetaKey>()` 대신 `Container<Alpha, AlphaKey>()`를 사용하십시오.
>
> **지속 중단 사이클**:
>
> - 2.3.0: 제네릭 호출의 명시적 타입 인자가 타입 파라미터 간의 상한 제약을 위반할 때 경고 보고
> - 2.4.0: 경고를 에러로 격상

### javaClass 프로퍼티 참조 지원 중단 {id="deprecate-references-to-the-javaclass-property"}

> **이슈**: [KTLC-375](https://youtrack.jetbrains.com/issue/KTLC-375)
>
> **컴포넌트**: Kotlin/JVM
>
> **비호환 변경 유형**: 소스
>
> **요약**: Kotlin 2.4.0은 `::class.java`와의 혼동을 줄이기 위해 [`javaClass`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/java-class.html) 프로퍼티에 대한 프로퍼티 참조를 지원 중단합니다. 객체의 런타임 Java 클래스를 얻으려면 `.javaClass`를 사용하고, Java 클래스 참조를 얻으려면 `::class.java`를 사용하십시오.
>
> **지속 중단 사이클**:
>
> - 2.4.0: `javaClass` 프로퍼티에 대한 프로퍼티 참조 시 경고 보고

### opt-in이 필요한 암시적 enum 생성자 호출에 대해 에러 보고 {id="report-errors-for-implicit-enum-constructor-calls-that-require-opt-in"}

> **이슈**: [KTLC-359](https://youtrack.jetbrains.com/issue/KTLC-359)
>
> **컴포넌트**: 핵심 언어
>
> **비호환 변경 유형**: 소스
>
> **요약**: Kotlin은 이제 enum 엔트리가 opt-in이 필요한 enum 기본 생성자를 암시적으로 호출할 때 에러를 보고합니다. 마이그레이션하려면 enum 클래스 또는 생성자를 호출하는 각 enum 엔트리에 `@OptIn`을 추가하십시오.
>
> **지속 중단 사이클**:
>
> - 2.2.20: enum 엔트리가 opt-in이 필요한 enum 기본 생성자를 암시적으로 호출할 때 경고 보고
> - 2.4.0: 경고를 에러로 격상

### enum 엔트리에 inline 수정자 금지 {id="forbid-inline-modifier-on-enum-entries"}

> **이슈**: [KTLC-361](https://youtrack.jetbrains.com/issue/KTLC-361)
>
> **컴포넌트**: 핵심 언어
>
> **비호환 변경 유형**: 소스
>
> **요약**: Kotlin은 이제 enum 엔트리에 `inline` 수정자를 사용하는 경우 에러를 보고합니다.
>
> **지속 중단 사이클**:
>
> - 2.3.0: enum 엔트리에 `inline` 수정자 사용 시 경고 보고
> - 2.4.0: 경고를 에러로 격상

### 어노테이션 호출 및 파라미터 기본값 외부에서 배열 리터럴 금지 {id="prohibit-array-literals-outside-annotation-calls-and-parameter-defaults"}

> **이슈**: [KTLC-369](https://youtrack.jetbrains.com/issue/KTLC-369)
>
> **컴포넌트**: 핵심 언어
>
> **비호환 변경 유형**: 소스
>
> **요약**: 어노테이션 호출 및 어노테이션 파라미터의 기본값 외부에서 배열 리터럴을 사용하면 이제 에러가 발생합니다. 마이그레이션하려면 `arrayOf(...)`를 사용하십시오. 예를 들어, `Roles(["admin", "user"])` 대신 `Roles(arrayOf("admin", "user"))`를 사용하십시오.
> 
> **지속 중단 사이클**:
>
> - 2.3.0: 어노테이션 호출 및 어노테이션 파라미터의 기본값 외부에서 배열 리터럴 사용 시 경고 보고
> - 2.4.0: 경고를 에러로 격상

### CLI 컴파일러 모드에서 _root_ide_package_ 금지 {id="prohibit-rootidepackage-in-cli-compiler-mode"}

> **이슈**: [KTLC-378](https://youtrack.jetbrains.com/issue/KTLC-378)
>
> **컴포넌트**: 컴파일러
>
> **비호환 변경 유형**: 소스
>
> **요약**: CLI 컴파일러 모드에서 IDE 전용 `_root_ide_package_` 한정자를 사용하면 이제 에러가 발생합니다.
>
> **지속 중단 사이클**:
>
> - 2.3.20: CLI 컴파일러 모드에서 `_root_ide_package_` 참조 시 경고 보고
> - 2.4.0: 경고를 에러로 격상

### vararg 변환이 포함된 함수 참조의 동등성 수정 {id="correct-equality-for-function-references-with-vararg-conversions"}

> **이슈**: [KTLC-385](https://youtrack.jetbrains.com/issue/KTLC-385)
>
> **컴포넌트**: Kotlin/JVM
>
> **비호환 변경 유형**: 동작
>
> **요약**: Kotlin/JVM은 이제 서로 다른 변환이 적용된 함수 참조를 서로 다른 것으로 취급합니다. 이전에는 동일한 함수 참조가 다른 변환도 사용하는 경우 Kotlin/JVM이 동등성 체크 시 vararg 변환을 무시했습니다. 이로 인해 한쪽만 vararg 변환을 사용했음에도 `getDefault(::foo) == getDefaultAndVararg(::foo)`가 `true`를 반환할 수 있었습니다.
>
> **지속 중단 사이클**:
>
> - 2.4.0: 새로운 동작 도입

### 컴패니언 객체 접근에 대한 opt-in 강제 {id="enforce-opt-in-for-companion-object-access"}

> **이슈**: [KTLC-386](https://youtrack.jetbrains.com/issue/KTLC-386)
>
> **컴포넌트**: 핵심 언어
>
> **비호환 변경 유형**: 소스
>
> **요약**: Kotlin은 이제 클래스 이름 참조가 opt-in이 필요한 컴패니언 객체로 확인될 때 opt-in 에러를 보고합니다. 예를 들어, `C`가 opt-in 어노테이션이 표시된 컴패니언 객체로 확인된다면 `val p = C`는 opt-in을 요구합니다.
>
> **지속 중단 사이클**:
>
> - 2.3.20: 컴패니언 객체 접근 시 opt-in이 필요한 경우 경고 보고
> - 2.4.0: `ERROR` 레벨의 opt-in 요구 사항에 대해 경고를 에러로 격상

### 중첩된 제네릭 인자를 가진 상위 타입의 타입 불일치 보고 {id="report-type-mismatches-from-supertypes-with-nested-generic-arguments"}

> **이슈**: [KTLC-372](https://youtrack.jetbrains.com/issue/KTLC-372)
>
> **컴포넌트**: 핵심 언어
>
> **비호환 변경 유형**: 소스
>
> **요약**: Kotlin은 이제 중첩된 제네릭 인자를 가진 상위 타입(supertype)과 관련된 타입 불일치를 컴파일러가 감지하면 에러를 보고합니다. 이전에는 컴파일러가 이러한 불일치를 놓칠 수 있었으며, 이는 나중에 `ClassCastException`을 유발했습니다. 마이그레이션하려면 리시버의 제네릭 타입과 일치하는 타입 인자를 사용하거나, 컴파일러가 추론할 수 있도록 명시적 타입 인자를 제거하십시오.
>
> **지속 중단 사이클**:
>
> - 2.4.0: 중첩된 제네릭 인자를 가진 상위 타입과 관련된 타입 불일치에 대해 에러 보고

### 접근 불가능한 선언이 포함된 추론된 타입 금지 {id="prohibit-inferred-types-with-inaccessible-declarations"}

> **이슈**: [KTLC-363](https://youtrack.jetbrains.com/issue/KTLC-363)
>
> **컴포넌트**: 핵심 언어
>
> **비호환 변경 유형**: 소스
>
> **요약**: 현재 스코프에서 접근할 수 없는 선언을 포함하는 추론된 타입을 사용하면 이제 에러가 발생합니다.
>
> **지속 중단 사이클**:
>
> - 2.3.0: 추론된 타입에 현재 스코프에서 접근할 수 없는 선언이 포함된 경우 경고 보고
> - 2.4.0: 경고를 에러로 격상

## 표준 라이브러리 (Standard library) {id="standard-library"}

### kotlin.io.readLine() 함수 지원 중단 {id="deprecate-kotlin-io-readline-function"}

> **이슈**: [KTLC-394](https://youtrack.jetbrains.com/issue/KTLC-394)
>
> **컴포넌트**: kotlin-stdlib
>
> **비호환 변경 유형**: 소스
>
> **요약**: [`kotlin.io.readLine()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io/read-line.html) 함수가 지원 중단됩니다. `readLine()!!` 대신 [`readln()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io/readln.html) 함수를 사용하고, `readLine()` 대신 [`readlnOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io/readln-or-null.html) 함수를 사용하십시오.
>
> **지속 중단 사이클**:
>
> - 2.4.0: `kotlin.io.readLine()` 사용 시 경고 보고

### AbstractCoroutineContextKey 및 관련 API 지원 중단 {id="deprecate-abstractcoroutinecontextkey-and-related-apis"}

> **이슈**: [KT-84970](https://youtrack.jetbrains.com/issue/KT-84970)
>
> **컴포넌트**: kotlin-stdlib
>
> **비호환 변경 유형**: 소스
>
> **요약**: [`AbstractCoroutineContextKey`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/-abstract-coroutine-context-key/) 클래스와 관련 API는 Kotlin 1.3부터 실험적이었으며 오류가 발생하기 쉬운 것으로 판명되었습니다. 이러한 이유로 이 클래스와 관련 [`getPolymorphicElement()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/get-polymorphic-element.html) 및 [`minusPolymorphicKey()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines/minus-polymorphic-key.html) 함수가 지원 중단됩니다.
>
> **지속 중단 사이클**:
>
> - 2.4.0: 지원 중단된 API 사용 시 경고 보고

### 무한대 범위에 대한 Random.nextDouble() 계약 변경 {id="change-random-nextdouble-contract-for-infinite-bounds"}

> **이슈**: [KT-84368](https://youtrack.jetbrains.com/issue/KT-84368)
>
> **컴포넌트**: kotlin-stdlib
>
> **비호환 변경 유형**: 동작
>
> **요약**: [`Random.nextDouble(until)`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.random/-random/next-double.html)에 대해 문서화된 계약은 이제 `until` 범위가 유한(finite)할 것을 요구합니다. 유한한 범위를 사용하십시오.
>
> **지속 중단 사이클**:
>
> - 2.4.0: 새로운 동작 활성화

## 도구 (Tools) {id="tools"}

### 레거시 Kotlin/JS 컴파일러 타입 선택 API 지원 중단 {id="deprecate-legacy-kotlin-js-compiler-type-selection-apis"}

> **이슈**: [KT-64275](https://youtrack.jetbrains.com/issue/KT-64275), [KT-84753](https://youtrack.jetbrains.com/issue/KT-84753)
>
> **컴포넌트**: Gradle
>
> **비호환 변경 유형**: 소스
>
> **요약**: Kotlin 2.4.0은 레거시 Kotlin/JS 컴파일러 타입 선택과 관련된 지원 중단된 Gradle API를 제거합니다.
> 
> 또한, `KotlinJsCompilerType` enum 및 컴파일러 타입 파라미터를 포함하는 `KotlinProjectExtension.js()` 오버로드들이 지원 중단됩니다. 마이그레이션하려면 `js()` 타겟 선언에서 컴파일러 타입 인자를 제거하고 대신 `js {}` 블록을 사용하십시오.
>
> **지속 중단 사이클**:
>
> - 1.8.0: 레거시 Kotlin/JS 컴파일러 타입 상수 지원 중단
> - 2.4.0: 지원 중단된 레거시 컴파일러 타입 API를 제거하고, `KotlinJsCompilerType` 또는 컴파일러 타입 파라미터를 포함하는 `KotlinProjectExtension.js()` 오버로드 사용 시 경고 보고

### Kotlin Android 확장에서 sourceSets 지원 중단 {id="deprecate-sourcesets-in-the-kotlin-android-extension"}

> **이슈**: [KT-74451](https://youtrack.jetbrains.com/issue/KT-74451)
>
> **컴포넌트**: Gradle
>
> **비호환 변경 유형**: 소스
>
> **요약**: `KotlinAndroidProjectExtension`의 `sourceSets` 프로퍼티가 지원 중단됩니다. 마이그레이션하려면 Android Gradle 플러그인의 `android { sourceSets { ... } }` 블록을 통해 소스 세트를 구성하십시오.
>
> **지속 중단 사이클**:
>
> - 2.4.0: `KotlinAndroidProjectExtension`에서 `sourceSets` 접근 시 경고 보고

### Kotlin/Native Apple 프레임워크에 대한 consumable configuration 제거 {id="remove-consumable-configurations-for-kotlin-native-apple-frameworks"}

> **이슈**: [KT-74503](https://youtrack.jetbrains.com/issue/KT-74503), [KT-82230](https://youtrack.jetbrains.com/issue/KT-82230)
>
> **컴포넌트**: Gradle
>
> **비호환 변경 유형**: 소스
>
> **요약**: Kotlin 2.4.0은 Kotlin/Native Apple 프레임워크를 나가는 아티팩트(outgoing artifacts)로 노출하는 생성된 consumable Gradle configuration을 제거합니다.
>
> **지속 중단 사이클**:
>
> - 2.4.0: Kotlin/Native Apple 프레임워크에 대한 consumable configuration 제거

### Kotlin Gradle 플러그인에서 지원 중단된 태스크, 컴파일 및 DSL API 제거 {id="remove-deprecated-task-compilation-and-dsl-apis-from-the-kotlin-gradle-plugin"}

> **이슈**: [KT-85509](https://youtrack.jetbrains.com/issue/KT-85509)
>
> **컴포넌트**: Gradle
>
> **비호환 변경 유형**: 소스
>
> **요약**: Kotlin 2.4.0은 다음과 같이 지원 중단된 Kotlin Gradle 플러그인 API를 제거합니다.
>
> 컴파일 태스크 구성 API:
>   * `KotlinJvmCompile.parentKotlinOptions`
>   * `KotlinJvmCompile.moduleName`
>   * `KotlinJvmFactory.createKotlinJvmOptions()`
>   * `KotlinCompile` 및 `Kotlin2JsCompile` 태스크의 `BaseKotlinCompile.moduleName`
> 
> Kotlin 멀티플랫폼 계층 구조(hierarchy) 및 타겟 API:
>   * `DeprecatedKotlinTargetHierarchyDsl`
>   * `KotlinMultiplatformExtension.targetHierarchy`
>   * `KotlinTargetComponent.sourcesArtifacts`
>   * `KotlinTarget.sourceSets`
>   * `KotlinHierarchyBuilder.withoutCompilations()`
>   * `KotlinHierarchyBuilder.filterCompilations()`
>   * `KotlinHierarchyBuilder.withWasm()`
>   * `KotlinCompilation.defaultSourceSetName`
> 
> Kotlin 컴파일 태스크 API:
>   * `KotlinCompilation.compileKotlinTaskProvider`
>   * `KotlinCompilation.compileKotlinTask`
>
> Kotlin 의존성 핸들러 API:
>   * `KotlinDependencyHandler.enforcedPlatform()`
>   * `KotlinDependencyHandler.platform()`
> 기타 지원 중단된 태스크 및 확장 API:
>   * `KaptExtension.processors`
>   * `KotlinTest.excludes`
>   * `KotlinTest.fileResolver`
>   * `KotlinTest.execHandleFactory`
>   * `IncrementalSyncTask.destinationDir`
>
> 마이그레이션하려면 이러한 API 사용을 중단하고 지원 중단 진단에서 제안하는 대체 API를 사용하십시오.
>
> **지속 중단 사이클**:
>
> - 2.4.0: 지원 중단된 API 제거

### 명시적인 shrunk classpath snapshot 설정 지원 중단 {id="deprecate-explicit-shrunk-classpath-snapshot-configuration"}

> **이슈**: [KT-75837](https://youtrack.jetbrains.com/issue/KT-75837)
>
> **컴포넌트**: 빌드 도구 API 
>
> **비호환 변경 유형**: 소스
>
> **요약**: `ClasspathSnapshotBasedIncrementalCompilationApproachParameters`의 `shrunkClasspathSnapshot` 구성 파라미터가 지원 중단됩니다. shrunk classpath snapshot은 내부 증분 컴파일 캐시이므로, 이제 컴파일러가 증분 컴파일러 메타데이터 `workingDirectory` 아래에서 이를 자동으로 생성하고 관리합니다. 마이그레이션하려면 `shrunkClasspathSnapshot`에 값을 전달하는 대신 자동으로 관리되는 스냅샷 파일을 사용하십시오.
>
> **지속 중단 사이클**:
>
> - 2.4.0: `shrunkClasspathSnapshot` 사용 시 경고 보고

### 불필요한 ABI 검증 Gradle DSL 요소 제거 {id="remove-redundant-abi-validation-gradle-dsl-elements"}

> **이슈**: [KT-80685](https://youtrack.jetbrains.com/issue/KT-80685)
>
> **컴포넌트**: Gradle
>
> **비호환 변경 유형**: 소스
>
> **요약**: Kotlin 2.4.0은 [ABI 검증(ABI validation)](gradle-binary-compatibility-validation.md) Gradle DSL을 단순화하고 불필요한 구성 항목을 제거합니다. 마이그레이션하려면 `abiValidation { legacyDump { ... } }` 대신 `abiValidation {}`에서 직접 리포트 설정을 구성하고, `abiValidation { klib { enabled = ... } }`를 제거하며, `klib.keepUnsupportedTargets` 대신 `keepLocallyUnsupportedTargets`를 사용하십시오.
>
> **지속 중단 사이클**:
>
> - 2.4.0: 불필요한 ABI 검증 DSL 요소 제거

### 노후한 Compose 컴파일러 Gradle 플러그인 옵션 지원 중단 {id="deprecate-obsolete-compose-compiler-gradle-plugin-options"}

> **이슈**: [KT-85343](https://youtrack.jetbrains.com/issue/KT-85343)
>
> **컴포넌트**: Gradle
>
> **비호환 변경 유형**: 소스
>
> **요약**: Kotlin 2.4.0에서 다음과 같이 지원 중단된 Compose 컴파일러 Gradle 플러그인 옵션을 사용하면 이제 에러가 보고됩니다.
>
> * `generateFunctionKeyMetaClasses`
> * `enableIntrinsicRemember`
> * `enableNonSkippingGroupOptimization`
> * `enableStrongSkippingMode`
> * `stabilityConfigurationFile`
> * `ComposeFeatureFlag.StrongSkipping`
> * `ComposeFeatureFlag.IntrinsicRemember`
>
> 지원 중단된 기능 옵션 대신 `featureFlags`를 사용하고, `stabilityConfigurationFile` 대신 `stabilityConfigurationFiles`를 사용하십시오.
>
> **지속 중단 사이클**:
>
> - 2.0.20: `enableIntrinsicRemember`, `enableNonSkippingGroupOptimization`, `enableStrongSkippingMode`에 대해 경고 보고
> - 2.1.0: `stabilityConfigurationFile`에 대해 경고 보고
> - 2.4.0: 경고를 에러로 격상

### 노후한 Kotlin/Native Gradle 태스크 API에 대해 에러 보고 {id="report-errors-for-obsolete-kotlin-native-gradle-task-apis"}

> **이슈**: [KT-85510](https://youtrack.jetbrains.com/issue/KT-85510)
>
> **컴포넌트**: Gradle
>
> **비호환 변경 유형**: 소스
>
> **요약**: 다음과 같이 지원 중단된 Kotlin/Native Gradle 태스크 API를 사용하면 이제 에러가 보고됩니다.
>
> `AbstractKotlinNativeCompile` 프로퍼티:
>
> * `additionalCompilerOptions`
> * `languageSettings`
> * `progressiveMode`
>
> `KotlinNativeCompile` 프로퍼티:
>
> * `moduleName`
> * `konanDataDir`
> * `konanHome`
> * `languageVersion`
> * `apiVersion`
> * `enabledLanguageFeatures`
> * `optInAnnotationsInUse`
> * `additionalCompilerOptions`
>
> `CInteropProcess` 프로퍼티:
>
> * `outputFile`
> * `konanDataDir`
> * `konanHome`
> * `defFile`
>
> `KotlinNativeLink` 프로퍼티:
>
> * `languageSettings`
> * `additionalCompilerOptions`
> * `konanDataDir`
> * `konanHome`
>
> 또한, `KotlinNativeLink.compilation` 프로퍼티가 제거됩니다.
>
> **지속 중단 사이클**:
>
> - 2.4.0: 지원 중단된 Kotlin/Native Gradle 태스크 API에 대해 에러 보고, `KotlinNativeLink.compilation` 프로퍼티 제거

### 컴파일러 인자 값의 대소문자 불일치에 대해 경고 보고 {id="report-warnings-for-case-mismatches-in-compiler-argument-values"}

> **이슈**: [KT-86059](https://youtrack.jetbrains.com/issue/KT-86059)
>
> **컴포넌트**: 빌드 도구 API
>
> **비호환 변경 유형**: 소스
>
> **요약**: 고정된 값 세트를 허용하는 컴파일러 인자는 이전에 대소문자를 일관되지 않게 처리했습니다. 일부는 임의의 대소문자를 허용했지만, 다른 일부는 정확한 일치를 요구했습니다. [빌드 도구 API(Build tools API)](build-tools-api.md)는 이제 이러한 값에 대해 임의의 대소문자를 허용하지만, 예를 들어 `Case mismatch for -module-kind: expected 'commonjs', got 'CommonJS'`와 같은 경고를 보고합니다. 마이그레이션하려면 [컴파일러 참조(compiler reference)](compiler-reference.md)에 나열된 인자의 대소문자를 사용하십시오.
>
> **지속 중단 사이클**:
>
> - 2.4.20: 컴파일러 인자 값의 대소문자가 예상 값과 일치하지 않을 때 경고 보고