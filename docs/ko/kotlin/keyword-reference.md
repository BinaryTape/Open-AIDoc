[//]: # (title: 키워드 및 연산자)

## 하드 키워드 {id="hard-keywords"}

다음 토큰들은 항상 키워드로 해석되며 식별자(identifier)로 사용할 수 없습니다.

 * `as`
     - [타입 캐스팅](typecasts.md#unsafe-cast-operator)에 사용됩니다.
     - [import의 별칭(alias)](packages.md#imports)을 지정합니다.
 * `as?`는 [안전한 타입 캐스팅](typecasts.md#unsafe-cast-operator)에 사용됩니다.
 * `break`는 [루프의 실행을 종료](returns.md)합니다.
 * `class`는 [클래스](classes.md)를 선언합니다.
 * `continue`는 [가장 안쪽 루프의 다음 단계로 진행](returns.md)합니다.
 * `do`는 [do/while 루프](control-flow.md#while-loops)(사후 조건 루프)를 시작합니다.
 * `else`는 조건이 false일 때 실행되는 [if 표현식](control-flow.md#if-expression)의 분기를 정의합니다.
 * `false`는 [Boolean 타입](booleans.md)의 'false' 값을 지정합니다.
 * `for`는 [for 루프](control-flow.md#for-loops)를 시작합니다.
 * `fun`은 [함수](functions.md)를 선언합니다.
 * `if`는 [if 표현식](control-flow.md#if-expression)을 시작합니다.
 * `in`
     - [for 루프](control-flow.md#for-loops)에서 순회할 객체를 지정합니다.
     - 값이 [범위](ranges.md), 컬렉션 또는 ['contains' 메서드를 정의하는](operator-overloading.md#in-operator) 다른 엔티티에 속해 있는지 확인하는 중위(infix) 연산자로 사용됩니다.
     - [when 표현식](control-flow.md#when-expressions-and-statements)에서도 동일한 목적으로 사용됩니다.
     - 타입 파라미터를 [반공변(contravariant)](generics.md#declaration-site-variance)으로 표시합니다.
 * `!in`
     - 값이 [범위](ranges.md), 컬렉션 또는 ['contains' 메서드를 정의하는](operator-overloading.md#in-operator) 다른 엔티티에 속하지 않는지 확인하는 연산자로 사용됩니다.
     - [when 표현식](control-flow.md#when-expressions-and-statements)에서도 동일한 목적으로 사용됩니다.
 * `interface`는 [인터페이스](interfaces.md)를 선언합니다.
 * `is`
     - [값에 특정 타입이 있는지 확인](typecasts.md#is-and-is-operators)합니다.
     - [when 표현식](control-flow.md#when-expressions-and-statements)에서도 동일한 목적으로 사용됩니다.
 * `!is`
     - [값이 특정 타입을 갖지 않는지 확인](typecasts.md#is-and-is-operators)합니다.
     - [when 표현식](control-flow.md#when-expressions-and-statements)에서도 동일한 목적으로 사용됩니다.
 * `null`은 어떤 객체도 가리키지 않는 객체 참조를 나타내는 상수입니다.
 * `object`는 [클래스와 해당 인스턴스를 동시에 선언](object-declarations.md)합니다.
 * `package`는 [현재 파일의 패키지](packages.md)를 지정합니다.
 * `return`은 [가장 가까운 둘러싼 함수나 익명 함수에서 반환](returns.md)합니다.
 * `super`
     - [메서드나 프로퍼티의 슈퍼클래스 구현을 참조](inheritance.md#calling-the-superclass-implementation)합니다.
     - [보조 생성자에서 슈퍼클래스 생성자를 호출](classes.md#inheritance)합니다.
 * `this`
     - [현재 수신 객체(receiver)](this-expressions.md)를 참조합니다.
     - [보조 생성자에서 같은 클래스의 다른 생성자를 호출](classes.md#constructors-and-initializer-blocks)합니다.
 * `throw`는 [예외를 던집니다](exceptions.md).
 * `true`는 [Boolean 타입](booleans.md)의 'true' 값을 지정합니다.
 * `try`는 [예외 처리 블록을 시작](exceptions.md)합니다.
 * `typealias`는 [타입 별칭(type alias)](type-aliases.md)을 선언합니다.
 * `typeof`는 향후 사용을 위해 예약되어 있습니다.
 * `val`은 읽기 전용 [프로퍼티](properties.md) 또는 [지역 변수](basic-syntax.md#variables)를 선언합니다.
 * `var`는 가변(mutable) [프로퍼티](properties.md) 또는 [지역 변수](basic-syntax.md#variables)를 선언합니다.
 * `when`은 [when 표현식](control-flow.md#when-expressions-and-statements)(주어진 분기 중 하나를 실행함)을 시작합니다.
 * `while`은 [while 루프](control-flow.md#while-loops)(사전 조건 루프)를 시작합니다.

## 소프트 키워드 {id="soft-keywords"}

다음 토큰들은 적용 가능한 컨텍스트에서 키워드로 작동하며, 다른 컨텍스트에서는 식별자로 사용할 수 있습니다.

 * `by`
     - [인터페이스 구현을 다른 객체에 위임](delegation.md)합니다.
     - [프로퍼티 접근자(accessor)의 구현을 다른 객체에 위임](delegated-properties.md)합니다.
 * `catch`는 [특정 예외 타입을 처리](exceptions.md)하는 블록을 시작합니다.
 * `constructor`는 [기본 또는 보조 생성자](classes.md#constructors-and-initializer-blocks)를 선언합니다.
 * `context`는 함수 및 프로퍼티에 대한 [컨텍스트 파라미터(context parameters)](context-parameters.md)를 선언합니다.
 * `delegate`는 [애너테이션 사용 지점 대상(use-site target)](annotations.md#annotation-use-site-targets)으로 사용됩니다.
 * `dynamic`은 Kotlin/JS 코드에서 [동적 타입(dynamic type)](dynamic-type.md)을 참조합니다.
 * `field`
     - [명시적 보조 필드(explicit backing field)](properties.md#explicit-backing-fields)를 선언합니다.
     - [애너테이션 사용 지점 대상](annotations.md#annotation-use-site-targets)으로 사용됩니다.
 * `file`은 [애너테이션 사용 지점 대상](annotations.md#annotation-use-site-targets)으로 사용됩니다.
 * `finally`는 [try 블록이 종료될 때 항상 실행되는 블록](exceptions.md)을 시작합니다.
 * `get`
     - [프로퍼티의 getter](properties.md)를 선언합니다.
     - [애너테이션 사용 지점 대상](annotations.md#annotation-use-site-targets)으로 사용됩니다.
 * `import`는 [다른 패키지의 선언을 현재 파일로 가져옵니다(import)](packages.md).
 * `init`은 [초기화 블록(initializer block)](classes.md#constructors-and-initializer-blocks)을 시작합니다.
 * `param`은 [애너테이션 사용 지점 대상](annotations.md#annotation-use-site-targets)으로 사용됩니다.
 * `property`는 [애너테이션 사용 지점 대상](annotations.md#annotation-use-site-targets)으로 사용됩니다.
 * `receiver`는 [애너테이션 사용 지점 대상](annotations.md#annotation-use-site-targets)으로 사용됩니다.
 * `set`
     - [프로퍼티의 setter](properties.md)를 선언합니다.
     - [애너테이션 사용 지점 대상](annotations.md#annotation-use-site-targets)으로 사용됩니다.
* `setparam`은 [애너테이션 사용 지점 대상](annotations.md#annotation-use-site-targets)으로 사용됩니다.
* `value`는 `class` 키워드와 함께 [인라인 클래스(inline class)](inline-classes.md)를 선언합니다.
* `where`는 [제네릭 타입 파라미터에 대한 제약 조건](generics.md#upper-bounds)을 지정합니다.

## 수식어 키워드 {id="modifier-keywords"}

다음 토큰들은 선언부의 수식어 목록에서 키워드로 작동하며, 다른 컨텍스트에서는 식별자로 사용할 수 있습니다.

 * `abstract`는 클래스 또는 멤버를 [추상(abstract)](classes.md#abstract-classes)으로 표시합니다.
 * `actual`은 [멀티플랫폼 프로젝트](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)에서 플랫폼별 구현을 나타냅니다.
 * `annotation`은 [애너테이션 클래스](annotations.md)를 선언합니다.
 * `companion`은 [동반 객체(companion object)](object-declarations.md#companion-objects)를 선언합니다.
 * `const`는 프로퍼티를 [컴파일 타임 상수](properties.md#compile-time-constants)로 표시합니다.
 * `crossinline`은 [인라인 함수로 전달된 람다에서 비지역 반환(non-local return)을 금지](inline-functions.md#returns)합니다.
 * `data`는 컴파일러에게 [클래스에 대한 표준 멤버(canonical members)를 생성하도록 지시](data-classes.md)합니다.
 * `enum`은 [열거형(enumeration)](enum-classes.md)을 선언합니다.
 * `expect`는 선언을 [플랫폼별(platform-specific)](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)로 표시하여 플랫폼 모듈의 구현을 기대합니다.
 * `external`은 선언이 Kotlin 외부에서 구현되었음을 나타냅니다([JNI](java-interop.md#using-jni-with-kotlin)를 통해 접근하거나 [JavaScript](js-interop.md#external-modifier)에서 접근 가능).
 * `final`은 [멤버 오버라이드를 금지](inheritance.md#overriding-methods)합니다.
 * `infix`는 [중위 표기법(infix notation)](functions.md#infix-notation)을 사용하여 함수를 호출할 수 있도록 허용합니다.
 * `inline`은 호출 지점에서 [함수와 해당 함수에 전달된 람다를 인라인하도록 컴파일러에 지시](inline-functions.md)합니다.
 * `inner`는 [중첩 클래스](nested-classes.md)에서 외부 클래스 인스턴스를 참조할 수 있도록 허용합니다.
 * `internal`은 선언을 [현재 모듈에서 볼 수 있도록(visible)](visibility-modifiers.md) 표시합니다.
 * `lateinit`은 [생성자 외부에서 non-nullable 프로퍼티를 초기화](properties.md#late-initialized-properties-and-variables)할 수 있도록 허용합니다.
 * `noinline`은 [인라인 함수로 전달된 람다의 인라인화를 끕니다](inline-functions.md#noinline).
 * `open`은 [클래스 서브클래싱 또는 멤버 오버라이드를 허용](classes.md#inheritance)합니다.
 * `operator`는 함수가 [연산자를 오버로딩하거나 규약(convention)을 구현](operator-overloading.md)함을 표시합니다.
 * `out`은 타입 파라미터를 [공변(covariant)](generics.md#declaration-site-variance)으로 표시합니다.
 * `override`는 멤버가 [슈퍼클래스 멤버의 오버라이드](inheritance.md#overriding-methods)임을 표시합니다.
 * `private`은 선언을 [현재 클래스 또는 파일에서만 볼 수 있도록](visibility-modifiers.md) 표시합니다.
 * `protected`는 선언을 [현재 클래스와 그 서브클래스에서 볼 수 있도록](visibility-modifiers.md) 표시합니다.
 * `public`은 선언을 [어디서나 볼 수 있도록](visibility-modifiers.md) 표시합니다.
 * `reified`는 인라인 함수의 타입 파라미터를 [런타임에 접근 가능](inline-functions.md#reified-type-parameters)하도록 표시합니다.
 * `sealed`는 [봉인된 클래스(sealed class)](sealed-classes.md)(서브클래싱이 제한된 클래스)를 선언합니다.
 * `suspend`는 함수 또는 람다를 일시 중단 가능함(suspending)으로 표시합니다([코루틴](coroutines-overview.md)으로 사용 가능).
 * `tailrec`은 함수를 [꼬리 재귀(tail-recursive)](functions.md#tail-recursive-functions)로 표시합니다(컴파일러가 재귀를 반복문으로 대체할 수 있도록 허용).
 * `vararg`는 [파라미터에 가변 개수의 인수를 전달](functions.md#variable-number-of-arguments-varargs)할 수 있도록 허용합니다.

## 특수 식별자 {id="special-identifiers"}

다음 식별자들은 특정 컨텍스트에서 컴파일러에 의해 정의되며, 다른 컨텍스트에서는 일반 식별자로 사용할 수 있습니다.

 * `field`는 프로퍼티 접근자 내부에서 [프로퍼티의 보조 필드(backing field)](properties.md#backing-fields)를 참조하는 데 사용됩니다.
 * `it`은 람다 내부에서 [파라미터를 암시적으로 참조](lambdas.md#it-implicit-name-of-a-single-parameter)하는 데 사용됩니다.

## 연산자 및 특수 기호 {id="operators-and-special-symbols"}

Kotlin은 다음 연산자와 특수 기호를 지원합니다.

 * `+`, `-`, `*`, `/`, `%` - 수학 연산자
     - `*`는 [vararg 파라미터에 배열을 전달](functions.md#variable-number-of-arguments-varargs)하는 데도 사용됩니다.
 * `=`
     - 대입 연산자.
     - [파라미터의 기본값](functions.md#parameters-with-default-values)을 지정하는 데 사용됩니다.
 * `+=`, `-=`, `*=`, `/=`, `%=` - [복합 대입 연산자(augmented assignment operators)](operator-overloading.md#augmented-assignments).
 * `++`, `--` - [증가 및 감소 연산자](operator-overloading.md#increments-and-decrements).
 * `&&`, `||`, `!` - 논리 'and', 'or', 'not' 연산자(비트 단위 연산의 경우 해당 [중위 함수](numbers.md#bitwise-operations)를 대신 사용).
 * `==`, `!=` - [동등성 연산자](operator-overloading.md#equality-and-inequality-operators)(원시 타입이 아닌 경우 `equals()` 호출로 변환됨).
 * `===`, `!==` - [참조 동일성 연산자](equality.md#referential-equality).
 * `<`, `>`, `<=`, `>=` - [비교 연산자](operator-overloading.md#comparison-operators)(원시 타입이 아닌 경우 `compareTo()` 호출로 변환됨).
 * `[`, `]` - [인덱스 접근 연산자](operator-overloading.md#indexed-access-operator)(`get` 및 `set` 호출로 변환됨).
 * `!!`는 [표현식이 null이 아님을 단언](null-safety.md#not-null-assertion-operator)합니다.
 * `?.`는 [안전한 호출(safe call)](null-safety.md#safe-call-operator)을 수행합니다(수신 객체가 null이 아닌 경우 메서드를 호출하거나 프로퍼티에 접근함).
 * `?:`는 왼쪽 값이 null인 경우 오른쪽 값을 취합니다([엘비스 연산자](null-safety.md#elvis-operator)).
 * `::`는 [멤버 참조](lambdas.md#function-references) 또는 [클래스 참조](reflection.md#obtain-a-runtime-class)를 생성합니다.
 * `.`
     - [중첩 클래스](nested-classes.md) 및 [enum 항목](enum-classes.md#working-with-enum-constants)을 포함하여 [멤버](classes.md)에 접근합니다.
     - [확장](extensions.md)을 정의하고 호출합니다.
     - 이름 및 [패키지](packages.md)를 한정(qualify)합니다.
     - [부동소수점 리터럴](numbers.md#floating-point-types)의 정수 부분과 소수 부분을 구분합니다.
 * `..`, `..<`는 [범위](ranges.md)를 생성합니다.
 * `:`는 선언에서 이름과 타입을 구분합니다.
 * `?`는 타입을 [nullable](null-safety.md#nullable-types-and-non-nullable-types)로 표시합니다.
 * `->`
     - [람다 표현식](lambdas.md#lambda-expression-syntax)의 파라미터와 본문을 구분합니다.
     - [함수 타입](lambdas.md#function-types)에서 파라미터와 반환 타입 선언을 구분합니다.
     - [when 표현식](control-flow.md#when-expressions-and-statements) 분기의 조건과 본문을 구분합니다.
 * `@`
     - [애너테이션](annotations.md#usage)을 도입합니다.
     - [루프 레이블](returns.md#break-and-continue-labels)을 도입하거나 참조합니다.
     - [람다 레이블](returns.md#return-to-labels)을 도입하거나 참조합니다.
     - [외부 스코프의 'this' 표현식](this-expressions.md#qualified-this)을 참조합니다.
     - [외부 슈퍼클래스](inheritance.md#calling-the-superclass-implementation)를 참조합니다.
 * `;`는 같은 줄에 있는 여러 문(statement)을 구분합니다.
 * `$`는 [문자열 템플릿](strings.md#string-templates)에서 변수나 표현식을 참조합니다.
 * `_`
     - [람다 표현식](lambdas.md#underscore-for-unused-variables)에서 사용되지 않는 파라미터를 대체합니다.
     - [구조 분해 선언](destructuring-declarations.md#underscore-for-unused-variables)에서 사용되지 않는 파라미터를 대체합니다.

연산자 우선순위는 Kotlin 문법의 [이 참조 문서](https://kotlinlang.org/grammar/#expressions)를 확인하세요.