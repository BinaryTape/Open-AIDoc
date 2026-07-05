[//]: # (title: 라이브러리 제작자를 위한 하위 호환성 가이드라인)

라이브러리를 만드는 가장 일반적인 동기는 더 넓은 커뮤니티에 기능을 공개하는 것입니다.
이 커뮤니티는 단일 팀, 회사, 특정 산업 또는 기술 플랫폼일 수 있습니다.
모든 경우에 하위 호환성(backward compatibility)은 중요한 고려 사항입니다.
커뮤니티가 넓을수록 사용자가 누구인지, 그들이 어떤 제약 조건 하에서 작업하는지 알기 어렵기 때문에 하위 호환성은 더욱 중요해집니다.

하위 호환성은 단일 용어가 아니며 바이너리, 소스 및 동작 수준에서 정의될 수 있습니다.
이러한 유형에 대한 자세한 정보는 이 섹션에서 제공됩니다.

참고 사항:

* 소스 호환성을 깨뜨리지 않고 바이너리 호환성을 깨뜨릴 수도 있으며, 그 반대도 가능합니다.
* 소스 호환성을 보장하는 것은 바람직하지만 매우 어렵습니다. 라이브러리 제작자로서 여러분은 라이브러리 사용자가 함수나 타입을 호출하거나 인스턴스화할 수 있는 모든 가능한 방법을 고려해야 합니다.
소스 호환성은 일반적으로 약속이라기보다는 지향점(aspiration)에 가깝습니다.

이 섹션의 나머지 부분에서는 다양한 종류의 호환성을 보장하는 데 도움이 되는 작업과 도구에 대해 설명합니다.

## 호환성 유형 {initial-collapse-state="collapsed" collapsible="true"}

**바이너리 호환성(Binary compatibility)**은 라이브러리의 새 버전이 이전에 컴파일된 라이브러리 버전을 대체할 수 있음을 의미합니다.
이전 버전의 라이브러리를 대상으로 컴파일된 모든 소프트웨어가 계속해서 올바르게 작동해야 합니다.

> 바이너리 호환성에 대한 자세한 내용은 [바이너리 호환성 검증 도구(Binary compatibility validator)의 README](https://github.com/Kotlin/binary-compatibility-validator?tab=readme-ov-file#what-makes-an-incompatible-change-to-the-public-binary-api) 또는 [Evolving Java-based APIs](https://github.com/eclipse-platform/eclipse.platform/blob/master/docs/Evolving-Java-based-APIs-2.md) 문서에서 확인할 수 있습니다.
>
{style="tip"}

**소스 호환성(Source compatibility)**은 라이브러리를 사용하는 소스 코드를 수정하지 않고도 라이브러리의 새 버전이 이전 버전을 대체할 수 있음을 의미합니다. 하지만 이 클라이언트 코드를 컴파일한 결과물은 더 이상 라이브러리를 컴파일한 결과물과 호환되지 않을 수 있으므로, 호환성을 보장하려면 클라이언트 코드를 새 버전의 라이브러리에 대해 다시 빌드해야 합니다.

**동작 호환성(Behavioral compatibility)**은 라이브러리의 새 버전이 버그 수정을 제외하고는 기존 기능을 수정하지 않음을 의미합니다. 동일한 기능이 포함되며 동일한 시맨틱(semantics)을 갖습니다.

## Binary compatibility validator 사용

JetBrains는 API의 여러 버전 간에 바이너리 호환성을 보장하는 데 사용할 수 있는 [Binary compatibility validator](https://github.com/Kotlin/binary-compatibility-validator) 도구를 제공합니다.

이 도구는 Gradle 플러그인으로 구현되어 있으며, 빌드에 다음 두 가지 태스크를 추가합니다.

* `apiDump` 태스크는 API를 설명하는 사람이 읽을 수 있는 `.api` 파일을 생성합니다.
* `apiCheck` 태스크는 저장된 API 설명과 현재 빌드에서 컴파일된 클래스를 비교합니다.

`apiCheck` 태스크는 빌드 시 표준 Gradle `check` 태스크에 의해 호출됩니다.
호환성이 깨지면 빌드가 실패합니다. 이때 `apiDump` 태스크를 수동으로 실행하고 이전 버전과 새 버전 간의 차이점을 비교해야 합니다.
변경 사항이 만족스럽다면 VCS 내에 있는 기존 `.api` 파일을 업데이트할 수 있습니다.

이 검증 도구는 멀티플랫폼 라이브러리에서 생성된 [KLib 검증에 대한 실험적 지원](https://github.com/Kotlin/binary-compatibility-validator?tab=readme-ov-file#experimental-klib-abi-validation-support)을 포함하고 있습니다.

### Kotlin Gradle 플러그인의 바이너리 호환성 검증

<primary-label ref="experimental-general"/>

버전 2.2.0부터 Kotlin Gradle 플러그인은 바이너리 호환성 검증을 지원합니다. 자세한 내용은 [Kotlin Gradle 플러그인의 바이너리 호환성 검증](gradle-binary-compatibility-validation.md)을 참조하세요.

## 반환 타입을 명시적으로 지정

[Kotlin 코딩 가이드라인](coding-conventions.md#coding-conventions-for-libraries)에서 논의된 바와 같이, API 내에서는 항상 함수의 반환 타입과 프로퍼티 타입을 명시적으로 지정해야 합니다. [Explicit API 모드](api-guidelines-simplicity.md#use-explicit-api-mode)에 관한 섹션도 참조하세요.

라이브러리 제작자가 `JsonDeserializer`를 만들고, 편의를 위해 확장 함수를 사용하여 이를 `Int` 타입과 연결하는 다음 예제를 살펴보겠습니다.

```kotlin
class JsonDeserializer<T>(private val fromJson: (String) -> T) {
    fun deserialize(input: String): T {
        ...
    }
}

fun Int.defaultDeserializer() = JsonDeserializer { ... }
```

제작자가 이 구현을 `JsonOrXmlDeserializer`로 대체한다고 가정해 보겠습니다.

```kotlin
class JsonOrXmlDeserializer<T>(
    private val fromJson: (String) -> T,
    private val fromXML: (String) -> T
) {
    fun deserialize(input: String): T {
        ...
    }
}

fun Int.defaultDeserializer() = JsonOrXmlDeserializer({ ... }, { ... })
```

기존 기능은 XML 역직렬화 기능이 추가된 상태로 계속 작동할 것입니다. 그러나 이는 바이너리 호환성을 깨뜨립니다.

## 기존 API 함수에 인자 추가 피하기

공개 API에 기본값(default)이 없는 인자를 추가하면 사용자가 이전보다 호출 시 더 많은 정보를 제공해야 하므로 바이너리 및 소스 호환성이 모두 깨집니다. 하지만 [기본 인자(default arguments)](functions.md#parameters-with-default-values)를 추가하는 것조차 호환성을 깨뜨릴 수 있습니다.

예를 들어, `lib.kt`에 다음과 같은 함수가 있다고 가정해 보겠습니다.

```kotlin
fun fib() = … // 0을 반환
```

그리고 `client.kt`에 다음과 같은 함수가 있습니다.

```kotlin
fun main() {
    println(fib()) // 0을 출력
}
```
JVM에서 이 두 파일을 컴파일하면 `LibKt.class`와 `ClientKt.class` 결과물이 생성됩니다.

이제 피보나치 수열을 표현하도록 `fib` 함수를 다시 구현하고 컴파일하여, `fib(3)`은 2를 반환하고 `fib(4)`는 3을 반환하도록 한다고 가정해 보겠습니다.
기존 동작을 유지하기 위해 매개변수를 추가하되 기본값을 0으로 설정합니다.

```kotlin
fun fib(input: Int = 0) = … // 피보나치 항을 반환
```

이제 `lib.kt` 파일을 다시 컴파일해야 합니다. `client.kt` 파일은 다시 컴파일할 필요가 없으며, 관련 클래스 파일을 다음과 같이 호출할 수 있을 것으로 예상할 수 있습니다.

```shell
$ kotlin ClientKt.class
```

하지만 이를 시도하면 `NoSuchMethodError`가 발생합니다.

```text
Exception in thread "main" java.lang.NoSuchMethodError: 'int LibKt.fib()'
       at LibKt.main(fib.kt:2)
       at LibKt.main(fib.kt)
       …
```

이는 Kotlin/JVM 컴파일러에 의해 생성된 바이트코드에서 메서드의 시그니처(signature)가 변경되어 바이너리 호환성이 깨졌기 때문입니다.

그러나 소스 호환성은 유지됩니다. 두 파일을 모두 다시 컴파일하면 프로그램이 이전과 같이 실행됩니다.

### 바이너리 호환성 유지를 위해 오버로드 사용 {initial-collapse-state="collapsed" collapsible="true"}

공개된 API에 선택적 매개변수(optional parameters)를 추가할 때, [실험적(Experimental)](components-stability.md#stability-levels-explained) 기능인 [`@IntroducedAt`](java-to-kotlin-interop.md#overloads-generation) 애노테이션을 사용하여 바이너리 호환성을 유지할 수 있습니다.

새로운 선택적 매개변수가 도입된 버전을 명시하여 각 매개변수에 애노테이션을 추가하십시오. 예:

```kotlin
@OptIn(ExperimentalVersionOverloading::class)
fun fib(@IntroducedAt("1.1") input: Int = 0) = …
```

컴파일러는 이 정보를 사용하여 그에 대응하는 숨겨진 오버로드(hidden overloads)를 생성합니다.

JVM용 Kotlin 코드를 작성할 때, 기본 인자가 있는 함수에 [`@JvmOverloads`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-overloads/) 애노테이션을 사용하여 오버로드를 생성할 수도 있습니다.

> `@JvmOverloads` 애노테이션은 Kotlin 호출자에 대해 바이너리 호환성을 보장하지 않습니다. 대신 공개된 API를 변경할 때는 `@IntroducedAt` 애노테이션을 사용하거나 수동으로 오버로드를 추가하십시오.
>
{style="warning"}

기본 인자가 있는 단일 함수를 사용하는 대신 수동으로 오버로드를 만들 수도 있습니다. 예를 들어, `fib()` 함수가 `Int` 매개변수를 받도록 하려면 별도의 오버로드를 만드십시오.

```kotlin
fun fib() = … 
fun fib(input: Int) = …
```

## 반환 타입을 넓히거나 좁히는 것 피하기

API를 발전시킬 때 함수의 반환 타입을 넓히거나(widen) 좁히고(narrow) 싶은 경우가 흔히 발생합니다. 예를 들어, 차기 API 버전에서 반환 타입을 `List`에서 `Collection`으로, 또는 `Collection`에서 `List`로 변경하고 싶을 수 있습니다.

인덱싱 지원에 대한 사용자 요청을 충족하기 위해 타입을 `List`로 좁히고 싶을 수 있습니다. 반대로, 작업 중인 데이터에 자연스러운 순서가 없다는 것을 깨닫고 타입을 `Collection`으로 넓히고 싶을 수도 있습니다.

반환 타입을 넓히는 것이 왜 호환성을 깨뜨리는지는 이해하기 쉽습니다. 예를 들어, `List`를 `Collection`으로 변환하면 인덱싱을 사용하는 모든 코드가 깨집니다.

반대로 `Collection`에서 `List`로 반환 타입을 좁히는 것은 호환성을 유지할 것이라고 생각할 수 있습니다. 불행히도 소스 호환성은 유지되지만 바이너리 호환성은 깨집니다.

`Library.kt` 파일에 데모 함수가 있다고 가정해 보겠습니다.

```kotlin
public fun demo(): Number = 3
```

그리고 `Client.kt`에 이 함수를 사용하는 클라이언트가 있습니다.

```kotlin
fun main() {
    println(demo()) // 3을 출력
}
```

이제 `demo`의 반환 타입을 변경하고 `Library.kt`만 다시 컴파일하는 시나리오를 상상해 보십시오.

```kotlin
fun demo(): Int = 3
```

클라이언트를 다시 실행하면 (JVM에서) 다음과 같은 오류가 발생합니다.

```text
Exception in thread "main" java.lang.NoSuchMethodError: 'java.lang.Number Library.demo()'
        at ClientKt.main(call.kt:2)
        at ClientKt.main(call.kt)
        …
```

이는 `main` 메서드에서 생성된 바이트코드의 다음 명령 때문입니다.

```text
0: invokestatic  #12 // Method Library.demo:()Ljava/lang/Number;
```

JVM은 `Number`를 반환하는 `demo`라는 정적 메서드를 호출하려고 시도합니다. 그러나 이 메서드는 더 이상 존재하지 않으므로 바이너리 호환성이 깨진 것입니다.

## API에서 데이터 클래스 사용 피하기

일반적인 개발에서 데이터 클래스의 장점은 자동으로 생성되는 추가 함수들입니다. API 설계에서 이 장점은 약점이 됩니다.

예를 들어, API에서 다음과 같은 데이터 클래스를 사용한다고 가정해 보겠습니다.

```kotlin
data class User(
    val name: String,
    val email: String
)
```

나중에 `active`라는 프로퍼티를 추가하고 싶을 수 있습니다.

```kotlin
data class User(
    val name: String,
    val email: String,
    val active: Boolean = true
)
```

이는 두 가지 방식으로 바이너리 호환성을 깨뜨립니다. 첫째, 생성된 생성자의 시그니처가 달라집니다. 또한, 생성된 `copy` 메서드의 시그니처가 변경됩니다.

원래의 시그니처(Kotlin/JVM 기준)는 다음과 같습니다.

```text
public final User copy(java.lang.String, java.lang.String)
```

`active` 프로퍼티를 추가한 후의 시그니처는 다음과 같습니다.

```text
public final User copy(java.lang.String, java.lang.String, boolean)
```

생성자와 마찬가지로 이는 바이너리 호환성을 깨뜨립니다.

보조 생성자를 수동으로 작성하고 `copy` 메서드를 오버라이드하여 이러한 문제를 해결할 수는 있습니다. 하지만 여기에 들어가는 노력은 데이터 클래스를 사용하는 편의성을 상쇄합니다.

데이터 클래스의 또 다른 문제는 생성자 인자의 순서를 변경하면 구조 분해(destructuring)에 사용되는 생성된 `componentX` 메서드에 영향을 미친다는 점입니다. 바이너리 호환성을 깨뜨리지 않더라도 순서를 변경하면 동작 호환성이 반드시 깨집니다.

## 애노테이션 타겟 변경 피하기

애노테이션을 공개할 때는 라이브러리를 배포한 후 허용된 타겟(target)을 변경하지 마십시오. 타겟을 변경하면 사용자가 기존 코드를 다시 컴파일할 때 동일한 애노테이션이 적용되는 방식에 영향을 줄 수 있습니다.

예를 들어, 애노테이션이 `AnnotationTarget.FIELD`만 선언하는 경우, 프로퍼티에 지정된 한정되지 않은 애노테이션은 해당 프로퍼티의 뒷받침하는 필드(backing field)에 적용됩니다.

```kotlin
@Target(AnnotationTarget.FIELD)
annotation class Example

class User {
    @Example
    val name: String = ""
}
```

나중에 `AnnotationTarget.PROPERTY`를 추가하면, 동일한 애노테이션이 필드 대신 프로퍼티에 적용됩니다.

```kotlin
@Target(AnnotationTarget.PROPERTY, AnnotationTarget.FIELD)
annotation class Example

class User {
    @Example
    val name: String = ""
}
```

이는 [Kotlin 컴파일러가 `field` 타겟보다 `property` 타겟을 먼저 선택](annotations.md#defaults-when-no-use-site-targets-are-specified)하기 때문입니다. `field` 타겟은 `property`를 적용할 수 없는 경우에만 사용됩니다.

이는 특정 생성된 요소에 애노테이션이 있을 것으로 기대하는 도구나 프레임워크의 호환성을 깨뜨릴 수 있습니다.
특히, `property` 타겟은 Java에서 보이지 않습니다.
Java 리플렉션이나 Java 애노테이션 프로세서가 뒷받침하는 필드에서 애노테이션을 찾아야 하는 경우, 사용자는 다음과 같이 `field` 사용 지점 타겟(use-site target)을 명시적으로 지정해야 합니다.

```kotlin
class User {
    @field:Example
    val name: String = ""
}
```

## PublishedApi 애노테이션 사용 시 고려 사항

Kotlin은 인라인 함수가 라이브러리 API의 일부가 되는 것을 허용합니다. 이러한 함수에 대한 호출은 사용자가 작성한 클라이언트 코드에 인라인으로 삽입됩니다. 이는 호환성 문제를 유발할 수 있으므로, 이러한 함수는 공개 API가 아닌 선언을 호출할 수 없습니다.

인라인된 공개 함수에서 라이브러리의 내부 API를 호출해야 하는 경우, 해당 API에 [`@PublishedApi`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-published-api/) 애노테이션을 달아 호출할 수 있습니다. 이렇게 하면 해당 내부 선언에 대한 참조가 컴파일된 클라이언트 코드에 포함되므로 사실상 공개된 것과 같아집니다. 따라서 이를 변경할 때는 바이너리 호환성에 영향을 미칠 수 있으므로 공개 선언과 동일하게 취급해야 합니다.

## 실용적인 API 발전시키기

기존 선언을 제거하거나 변경하여 시간이 지남에 따라 라이브러리 API에 중대한 변경(breaking changes)을 가해야 하는 경우가 있습니다. 이 섹션에서는 이러한 경우를 실용적으로 처리하는 방법에 대해 논의합니다.

사용자가 라이브러리를 최신 버전으로 업그레이드할 때 프로젝트 소스 코드에서 라이브러리 API에 대한 확인되지 않은 참조(unresolved references)가 발생해서는 안 됩니다. 라이브러리의 공개 API에서 무언가를 즉시 제거하는 대신, 지원 중단 사이클(deprecation cycle)을 따라야 합니다. 이렇게 하면 사용자가 대안으로 마이그레이션할 시간을 줄 수 있습니다.

이전 선언에 [`@Deprecated`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-deprecated/) 애노테이션을 사용하여 대체되고 있음을 나타내십시오. 이 애노테이션의 매개변수는 지원 중단에 대한 중요한 세부 정보를 제공합니다.

* `message`에는 무엇이 변경되는지, 그리고 그 이유를 설명해야 합니다.
* 가능한 경우 `replaceWith` 매개변수를 사용하여 새 API로의 자동 마이그레이션을 제공해야 합니다.
* 지원 중단 수준(level)은 API를 점진적으로 중단하는 데 사용되어야 합니다. 자세한 내용은 [Kotlin 문서의 Deprecated 페이지](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-deprecated/)를 참조하세요.

일반적으로 지원 중단은 먼저 경고(warning)를 발생시키고, 그다음에는 에러(error)를 발생시키고, 마지막으로 선언을 숨겨야 합니다. 이 프로세스는 여러 마이너 릴리스에 걸쳐 진행되어야 하며, 사용자가 프로젝트에서 필요한 변경을 수행할 수 있는 시간을 제공해야 합니다. API 제거와 같은 중대한 변경은 메이저 릴리스에서만 발생해야 합니다. 라이브러리는 서로 다른 버저닝 및 지원 중단 전략을 채택할 수 있지만, 올바른 기대치를 설정하기 위해 이를 사용자에게 전달해야 합니다.

자세한 내용은 [Kotlin 진화 원칙(Kotlin Evolution principles) 문서](kotlin-evolution-principles.md#libraries) 또는 KotlinConf 2023에서 Leonid Startsev가 발표한 [Evolving your Kotlin API painlessly for clients 강연](https://www.youtube.com/watch?v=cCgXtpVPO-o&t=1468s)에서 확인할 수 있습니다.

## RequiresOptIn 메커니즘 사용

Kotlin 표준 라이브러리는 사용자가 API의 일부를 사용하기 전에 명시적인 동의를 요구하는 [옵트인(opt-in) 메커니즘](opt-in-requirements.md)을 제공합니다. 이는 그 자체가 [`@RequiresOptIn`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-requires-opt-in/)으로 애노테이션된 마커 애노테이션을 생성하는 것을 기반으로 합니다. 특히 라이브러리에 새로운 API를 도입할 때 소스 및 동작 호환성에 관한 기대치를 관리하기 위해 이 메커니즘을 사용해야 합니다.

이 메커니즘을 사용하기로 결정했다면 다음 모범 사례를 따르는 것이 좋습니다.

* 옵트인 메커니즘을 사용하여 API의 서로 다른 부분에 서로 다른 보증을 제공하십시오. 예를 들어 기능을 _Preview_, _Experimental_, _Delicate_ 등으로 표시할 수 있습니다. 각 카테고리는 문서와 [KDoc 주석](kotlin-doc.md)에서 적절한 경고 메시지와 함께 명확하게 설명되어야 합니다.
* 라이브러리에서 실험적(experimental) API를 사용하는 경우, 해당 애노테이션을 자체 사용자에게도 [전파(propagate)](opt-in-requirements.md#propagate-opt-in-requirements)하십시오. 이를 통해 사용자는 아직 진화 중인 의존성이 있음을 인지할 수 있습니다.
* 라이브러리의 기존 선언을 지원 중단하는 용도로 옵트인 메커니즘을 사용하지 마십시오. 대신 [실용적인 API 발전시키기](#실용적인-api-발전시키기) 섹션에서 설명한 대로 `@Deprecated`를 사용하십시오.

## 다음 단계

아직 확인하지 않았다면 다음 페이지를 확인해 보세요.

* [인지 복잡성 최소화](api-guidelines-minimizing-mental-complexity.md) 페이지에서 인지 복잡성을 최소화하기 위한 전략을 살펴보세요.
* 효과적인 문서화 관행에 대한 광범위한 개요는 [유익한 문서 작성](api-guidelines-informative-documentation.md)을 참조하세요.