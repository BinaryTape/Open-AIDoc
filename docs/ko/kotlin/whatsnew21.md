[//]: # (title: Kotlin 2.1.0의 새로운 기능)

<web-summary>새로운 언어 기능, Kotlin Multiplatform, JVM, Native, JS, Wasm 업데이트 및 Gradle과 Maven용 빌드 도구 지원을 다루는 Kotlin 2.1.0 릴리스 노트를 확인해 보세요.</web-summary>

_[출시일: 2024년 11월 27일](releases.md#release-history)_

Kotlin 2.1.0이 출시되었습니다! 주요 하이라이트는 다음과 같습니다.

* **새로운 언어 기능 프리뷰**: [대상이 있는 `when`의 가드 조건(Guard conditions)](#guard-conditions-in-when-with-a-subject),
  [비지역(non-local) `break` 및 `continue`](#non-local-break-and-continue), [멀티 달러 문자열 보간법(multi-dollar string interpolation)](#multi-dollar-string-interpolation).
* **K2 컴파일러 업데이트**: [컴파일러 검사에 대한 유연성 향상](#extra-compiler-checks) 및 [kapt 구현 개선](#improved-k2-kapt-implementation).
* **Kotlin Multiplatform**: [Swift export 기본 지원](#basic-support-for-swift-export) 도입,
  [컴파일러 옵션을 위한 안정화된 Gradle DSL](#new-gradle-dsl-for-compiler-options-in-multiplatform-projects-promoted-to-stable) 등.
* **Kotlin/Native**: [`iosArm64` 지원 개선](#iosarm64-promoted-to-tier-1) 및 기타 업데이트.
* **Kotlin/Wasm**: [증분 컴파일(incremental compilation) 지원](#support-for-incremental-compilation)을 포함한 다수의 업데이트.
* **Gradle 지원**: [최신 버전의 Gradle 및 Android Gradle 플러그인과의 호환성 개선](#gradle-improvements),
  [Kotlin Gradle 플러그인 API 업데이트](#new-api-for-kotlin-gradle-plugin-extensions).
* **문서**: [Kotlin 문서의 대대적인 개선](#documentation-updates).

> Kotlin 릴리스 주기에 대한 자세한 정보는 [Kotlin 릴리스 프로세스](releases.md)를 참고하세요.
>
{style="tip"}

## IDE 지원 {id="ide-support"}

Kotlin 2.1.0을 지원하는 Kotlin 플러그인은 최신 IntelliJ IDEA 및 Android Studio에 기본 번들로 포함되어 있습니다.
IDE에서 Kotlin 플러그인을 별도로 업데이트할 필요가 없습니다.
빌드 스크립트에서 Kotlin 버전을 2.1.0으로 변경하기만 하면 됩니다.

자세한 내용은 [새 Kotlin 버전으로 업데이트](releases.md#update-to-a-new-kotlin-version)를 참고하세요.

## 언어 (Language) {id="language"}

K2 컴파일러가 포함된 Kotlin 2.0.0 릴리스 이후, JetBrains 팀은 새로운 기능을 통해 언어를 개선하는 데 집중하고 있습니다.
이번 릴리스에서는 몇 가지 새로운 언어 디자인 개선 사항을 선보이게 되었습니다.

이러한 기능들은 프리뷰(Preview)로 제공되며, 사용해 보신 후 피드백을 공유해 주시기를 권장합니다.

* [대상이 있는 `when`의 가드 조건](#guard-conditions-in-when-with-a-subject)
* [비지역 `break` 및 `continue`](#non-local-break-and-continue)
* [멀티 달러 보간법: 문자열 리터럴 내 `$` 처리 개선](#multi-dollar-string-interpolation)

> 모든 기능은 K2 모드가 활성화된 최신 IntelliJ IDEA 2024.3 버전에서 IDE 지원을 제공합니다.
>
> 자세한 내용은 [IntelliJ IDEA 2024.3 블로그 게시물](https://blog.jetbrains.com/idea/2024/11/intellij-idea-2024-3/)에서 확인하세요.
>
{style="tip"}

[Kotlin 언어 디자인 기능 및 제안서 전체 목록 보기](kotlin-language-features-and-proposals.md).

이번 릴리스에는 다음과 같은 언어 업데이트도 포함되어 있습니다.

* [](#support-for-requiring-opt-in-to-extend-apis)
* [](#improved-overload-resolution-for-functions-with-generic-types)
* [](#improved-exhaustiveness-checks-for-when-expressions-with-sealed-classes)

### 대상이 있는 when의 가드 조건 {id="guard-conditions-in-when-with-a-subject"}

> 이 기능은 [프리뷰 단계(In preview)](kotlin-evolution-principles.md#pre-stable-features)이며,
> 옵트인(opt-in)이 필요합니다(자세한 내용은 아래 참조).
> 
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-71140)을 통해 의견을 남겨주시면 감사하겠습니다.
>
{style="warning"}

2.1.0부터 대상(subject)이 있는 `when` 표현식 또는 문에서 가드 조건(guard condition)을 사용할 수 있습니다.

가드 조건을 사용하면 `when` 표현식의 분기(branch)에 둘 이상의 조건을 포함할 수 있어,
코드 구조를 평탄화(flatten)하는 동시에 복잡한 제어 흐름을 더욱 명확하고 간결하게 작성할 수 있습니다.

분기에 가드 조건을 추가하려면 기본 조건 뒤에 `if`로 구분하여 배치합니다.

```kotlin
sealed interface Animal {
    data class Cat(val mouseHunter: Boolean) : Animal {
        fun feedCat() {}
    }

    data class Dog(val breed: String) : Animal {
        fun feedDog() {}
    }
}

fun feedAnimal(animal: Animal) {
    when (animal) {
        // 기본 조건만 있는 분기. `animal`이 `Dog`일 때 `feedDog()`를 호출합니다.
        is Animal.Dog -> animal.feedDog()
        // 기본 조건과 가드 조건이 모두 있는 분기. `animal`이 `Cat`이고 `mouseHunter`가 아닐 때 `feedCat()`을 호출합니다.
        is Animal.Cat if !animal.mouseHunter -> animal.feedCat()
        // 위의 조건과 일치하는 것이 없을 때 "Unknown animal"을 출력합니다.
        else -> println("Unknown animal")
    }
}
```

단일 `when` 표현식 내에서 가드 조건이 있는 분기와 없는 분기를 함께 사용할 수 있습니다.
가드 조건이 있는 분기의 코드는 기본 조건과 가드 조건이 모두 `true`인 경우에만 실행됩니다.
기본 조건이 일치하지 않으면 가드 조건은 평가되지 않습니다.
또한 가드 조건은 `else if`를 지원합니다.

프로젝트에서 가드 조건을 활성화하려면 명령줄에서 다음 컴파일러 옵션을 사용하세요.

```bash
kotlinc -Xwhen-guards main.kt
```

또는 Gradle 빌드 파일의 `compilerOptions {}` 블록에 추가하세요.

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xwhen-guards")
    }
}
```

### 비지역 break 및 continue {id="non-local-break-and-continue"}

> 이 기능은 [프리뷰 단계](kotlin-evolution-principles.md#pre-stable-features)이며,
> 옵트인이 필요합니다(자세한 내용은 아래 참조).
> 
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-1436)을 통해 의견을 남겨주시면 감사하겠습니다.
>
{style="warning"}

Kotlin 2.1.0에는 오랫동안 기다려온 또 다른 기능인 비지역(non-local) `break` 및 `continue` 사용 기능의 프리뷰가 추가되었습니다.
이 기능은 인라인 함수의 스코프 내에서 사용할 수 있는 도구를 확장하고 프로젝트의 보일러플레이트 코드를 줄여줍니다.

이전에는 비지역 반환(non-local return)만 사용할 수 있었습니다.
이제 Kotlin은 비지역적인 `break` 및 `continue` [점프 표현식(jump expressions)](returns.md)도 지원합니다.
즉, 루프를 감싸고 있는 인라인 함수에 인수로 전달된 람다 내에서 이를 적용할 수 있습니다.

```kotlin
fun processList(elements: List<Int>): Boolean {
    for (element in elements) {
        val variable = element.nullableMethod() ?: run {
            log.warning("Element is null or invalid, continuing...")
            continue
        }
        if (variable == 0) return true // variable이 0이면 true를 반환합니다.
    }
    return false
}
```

프로젝트에서 이 기능을 사용해 보려면 명령줄에서 `-Xnon-local-break-continue` 컴파일러 옵션을 사용하세요.

```bash
kotlinc -Xnon-local-break-continue main.kt
```

또는 Gradle 빌드 파일의 `compilerOptions {}` 블록에 추가하세요.

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xnon-local-break-continue")
    }
}
```

향후 Kotlin 릴리스에서 이 기능을 안정화(Stable)할 계획입니다.
비지역 `break` 및 `continue`를 사용하는 동안 문제가 발생하면 [이슈 트래커](https://youtrack.jetbrains.com/issue/KT-1436)에 보고해 주세요.

### 멀티 달러 문자열 보간법 {id="multi-dollar-string-interpolation"}

> 이 기능은 [프리뷰 단계](kotlin-evolution-principles.md#pre-stable-features)이며,
> 옵트인이 필요합니다(자세한 내용은 아래 참조).
> 
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-2425)을 통해 의견을 남겨주시면 감사하겠습니다.
>
{style="warning"}

Kotlin 2.1.0에서는 멀티 달러(multi-dollar) 문자열 보간법을 지원하여 문자열 리터럴 내에서 달러 기호(`$`)를 처리하는 방식을 개선했습니다.
이 기능은 템플릿 엔진, JSON 스키마 또는 기타 데이터 형식과 같이 여러 개의 달러 기호가 필요한 환경에서 유용합니다.

Kotlin의 문자열 보간법은 단일 달러 기호를 사용합니다.
그러나 금융 데이터나 템플릿 시스템에서 흔히 볼 수 있는 리터럴 달러 기호를 문자열에서 사용하려면 `${'$'}`와 같은 우회 방법을 사용해야 했습니다.
멀티 달러 보간법 기능을 활성화하면 몇 개의 달러 기호로 보간을 트리거할지 구성할 수 있으며, 그보다 적은 수의 달러 기호는 일반 문자열 리터럴로 처리됩니다.

다음은 `$`를 사용하는 플레이스홀더가 포함된 JSON 스키마 여러 줄 문자열을 생성하는 예시입니다.

```kotlin
val KClass<*>.jsonSchema : String
    get() = $$"""
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "$id": "https://example.com/product.schema.json",
      "$dynamicAnchor": "meta"
      "title": "$${simpleName ?: qualifiedName ?: "unknown"}",
      "type": "object"
    }
    """
```

이 예제에서 맨 앞의 `$$`는 보간을 트리거하기 위해 **두 개의 달러 기호**(`$$`)가 필요함을 의미합니다.
따라서 `$schema`, `$id`, `$dynamicAnchor`가 보간 마커로 해석되지 않습니다.

이 접근 방식은 달러 기호를 플레이스홀더 구문으로 사용하는 시스템과 작업할 때 특히 유용합니다.

이 기능을 활성화하려면 명령줄에서 다음 컴파일러 옵션을 사용하세요.

```bash
kotlinc -Xmulti-dollar-interpolation main.kt
```

또는 Gradle 빌드 파일의 `compilerOptions {}` 블록을 업데이트하세요.

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xmulti-dollar-interpolation")
    }
}
```

기존 코드가 이미 단일 달러 기호를 사용하는 표준 문자열 보간법을 사용하고 있다면 변경할 필요가 없습니다.
문자열에 리터럴 달러 기호가 필요할 때 언제든지 `$$`를 사용할 수 있습니다.

### API 확장에 옵트인 요구 지원 {id="support-for-requiring-opt-in-to-extend-apis"}

Kotlin 2.1.0에서는 라이브러리 작성자가 사용자가 실험적 인터페이스를 구현하거나 실험적 클래스를 확장하기 전에 명시적인 옵트인을 요구할 수 있도록 하는 [`@SubclassOptInRequired`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-subclass-opt-in-required/) 애노테이션을 도입했습니다.

이 기능은 라이브러리 API가 사용하기에는 충분히 안정적이지만 새로운 추상 함수가 추가될 수 있어 상속 용도로는 불안정할 때 유용할 수 있습니다.

API 요소에 옵트인 요구 사항을 추가하려면 애노테이션 클래스에 대한 참조와 함께 `@SubclassOptInRequired` 애노테이션을 사용합니다.

```kotlin
@RequiresOptIn(
level = RequiresOptIn.Level.WARNING,
message = "Interfaces in this library are experimental"
)
annotation class UnstableApi()

@SubclassOptInRequired(UnstableApi::class)
interface CoreLibraryApi
```

이 예제에서 `CoreLibraryApi` 인터페이스는 사용자가 이를 구현하기 전에 옵트인할 것을 요구합니다.
사용자는 다음과 같이 옵트인할 수 있습니다.

```kotlin
@OptIn(UnstableApi::class)
interface MyImplementation: CoreLibraryApi
```

> `@SubclassOptInRequired` 애노테이션을 사용하여 옵트인을 요구할 때, 
> 이 요구 사항은 [내부(inner) 또는 중첩(nested) 클래스](nested-classes.md)로 전파되지 않습니다.
>
{style="note"}

API에서 `@SubclassOptInRequired` 애노테이션을 사용하는 실제 예는 `kotlinx.coroutines` 라이브러리의 [`SharedFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/) 인터페이스를 확인하세요.

### 제네릭 타입을 가진 함수의 오버로드 확인 개선 {id="improved-overload-resolution-for-functions-with-generic-types"}

이전에는 일부는 제네릭 타입의 값 매개변수를 가지고 있고 다른 일부는 동일한 위치에 함수 타입을 가지고 있는 다수의 오버로드 함수가 있을 때 확인(resolution) 동작이 일관되지 않은 경우가 있었습니다.

이로 인해 오버로드가 멤버 함수인지 확장 함수인지에 따라 동작이 달라졌습니다.
예를 들면 다음과 같습니다.

```kotlin
class KeyValueStore<K, V> {
    fun store(key: K, value: V) {} // 1
    fun store(key: K, lazyValue: () -> V) {} // 2
}

fun <K, V> KeyValueStore<K, V>.storeExtension(key: K, value: V) {} // 1 
fun <K, V> KeyValueStore<K, V>.storeExtension(key: K, lazyValue: () -> V) {} // 2

fun test(kvs: KeyValueStore<String, Int>) {
    // 멤버 함수
    kvs.store("", 1)    // 1로 확인됨
    kvs.store("") { 1 } // 2로 확인됨

    // 확장 함수
    kvs.storeExtension("", 1)    // 1로 확인됨
    kvs.storeExtension("") { 1 } // 확인되지 않음 (Doesn't resolve)
}
```

이 예제에서 `KeyValueStore` 클래스에는 `store()` 함수에 대한 두 개의 오버로드가 있으며,
한 오버로드는 제네릭 타입 `K`와 `V`를 가진 함수 매개변수를 가지고 있고,
다른 오버로드는 제네릭 타입 `V`를 반환하는 람다 함수를 가지고 있습니다.
마찬가지로 확장 함수인 `storeExtension()`에 대해서도 두 개의 오버로드가 있습니다.

람다 함수와 함께 또는 람다 함수 없이 `store()` 함수를 호출했을 때 컴파일러는 올바른 오버로드를 성공적으로 확인했습니다.
그러나 확장 함수 `storeExtension()`을 람다 함수와 함께 호출했을 때는 두 오버로드가 모두 적용 가능한 것으로 잘못 간주되어 올바른 오버로드를 확인하지 못했습니다.

이 문제를 해결하기 위해 다른 인수의 정보를 기반으로 제네릭 타입을 가진 함수 매개변수가 람다 함수를 수락할 수 없는 경우 컴파일러가 가능한 오버로드를 폐기할 수 있도록 하는 새로운 휴리스틱을 도입했습니다.
이 변경으로 멤버 함수와 확장 함수의 동작이 일관되게 되었으며, Kotlin 2.1.0에서 기본적으로 활성화됩니다.

### sealed 클래스가 포함된 when 표현식의 완전성 검사 개선 {id="improved-exhaustiveness-checks-for-when-expressions-with-sealed-classes"}

이전 버전의 Kotlin에서는 `sealed class` 계층 구조의 모든 케이스를 처리했더라도 봉인된 상위 바운드(sealed upper bound)를 가진 타입 매개변수에 대해 컴파일러가 `when` 표현식에 `else` 분기를 요구했습니다.
Kotlin 2.1.0에서는 이 동작이 해결 및 개선되어 완전성 검사(exhaustiveness check)가 더욱 강력해졌으며, 불필요한 `else` 분기를 제거하여 `when` 표현식을 더욱 깔끔하고 직관적으로 유지할 수 있게 되었습니다.

다음은 변경 사항을 보여주는 예시입니다.

```kotlin
sealed class Result
object Error: Result()
class Success(val value: String): Result()

fun <T : Result> render(result: T) = when (result) {
    Error -> "Error!"
    is Success -> result.value
    // else 분기가 필요하지 않음
}
```

## Kotlin K2 컴파일러 {id="kotlin-k2-compiler"}

Kotlin 2.1.0을 통해 이제 K2 컴파일러는 [컴파일러 검사](#extra-compiler-checks) 및 [경고](#global-warning-suppression) 작업 시 [더 많은 유연성](#extra-compiler-checks)을 제공하며, [kapt 플러그인에 대한 향상된 지원](#improved-k2-kapt-implementation)을 제공합니다.

### 추가 컴파일러 검사 {id="extra-compiler-checks"}

Kotlin 2.1.0부터 K2 컴파일러에서 추가 검사를 활성화할 수 있습니다.
이러한 검사는 컴파일에 결정적인 요소는 아니지만 다음과 같은 경우를 검증하려는 경우 유용하게 사용할 수 있는 추가 선언, 표현식 및 타입 검사입니다.

| 검사 유형                                            | 설명                                                                                     |
|-------------------------------------------------------|------------------------------------------------------------------------------------------|
| `REDUNDANT_NULLABLE`                                  | `Boolean?` 대신 `Boolean??` 사용                                                        |
| `PLATFORM_CLASS_MAPPED_TO_KOTLIN`                     | `kotlin.String` 대신 `java.lang.String` 사용                                            |
| `ARRAY_EQUALITY_OPERATOR_CAN_BE_REPLACED_WITH_EQUALS` | `arrayOf("").contentEquals(arrayOf(""))` 대신 `arrayOf("") == arrayOf("")` 사용          |
| `REDUNDANT_CALL_OF_CONVERSION_METHOD`                 | `42` 대신 `42.toInt()` 사용                                                             |
| `USELESS_CALL_ON_NOT_NULL`                            | `""` 대신 `"".orEmpty()` 사용                                                           |
| `REDUNDANT_SINGLE_EXPRESSION_STRING_TEMPLATE`         | `string` 대신 `"$string"` 사용                                                          |
| `UNUSED_ANONYMOUS_PARAMETER`                          | 람다 표현식에 매개변수가 전달되었지만 사용되지 않음                                       |
| `REDUNDANT_VISIBILITY_MODIFIER`                       | `class Klass` 대신 `public class Klass` 사용                                            |
| `REDUNDANT_MODALITY_MODIFIER`                         | `class Klass` 대신 `final class Klass` 사용                                             |
| `REDUNDANT_SETTER_PARAMETER_TYPE`                     | `set(value)` 대신 `set(value: Int)` 사용                                                |
| `CAN_BE_VAL`                                          | `var local = 0`이 정의되었으나 재할당되지 않음, `val local = 42`로 변경 가능              |
| `ASSIGNED_VALUE_IS_NEVER_READ`                        | `val local = 42`가 정의되었으나 이후 코드에서 사용되지 않음                               |
| `UNUSED_VARIABLE`                                     | `val local = 0`이 정의되었으나 코드에서 전혀 사용되지 않음                               |
| `REDUNDANT_RETURN_UNIT_TYPE`                          | `fun foo() {}` 대신 `fun foo(): Unit {}` 사용                                           |
| `UNREACHABLE_CODE`                                    | 코드 문(statement)이 존재하지만 절대 실행될 수 없음                                     |

검사 조건에 해당하면 문제를 해결하는 방법에 대한 제안과 함께 컴파일러 경고가 표시됩니다.

추가 검사는 기본적으로 비활성화되어 있습니다.
이를 활성화하려면 명령줄에서 `-Wextra` 컴파일러 옵션을 사용하거나 Gradle 빌드 파일의 `compilerOptions {}` 블록에 `extraWarnings`를 지정하세요.

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        extraWarnings.set(true)
    }
}
```

컴파일러 옵션을 정의하고 사용하는 방법에 대한 자세한 내용은 [Kotlin Gradle 플러그인의 컴파일러 옵션](gradle-compiler-options.md)을 참고하세요.

### 전역 경고 억제 (Global warning suppression) {id="global-warning-suppression"}

2.1.0에서 Kotlin 컴파일러에 요청이 많았던 기능인 경고를 전역적으로 억제하는 기능이 추가되었습니다.

이제 명령줄에서 `-Xsuppress-warning=WARNING_NAME` 구문을 사용하거나 빌드 파일의 `compilerOptions {}` 블록에 있는 `freeCompilerArgs` 속성을 사용하여 전체 프로젝트에서 특정 경고를 억제할 수 있습니다.

예를 들어 프로젝트에서 [추가 컴파일러 검사](#extra-compiler-checks)를 활성화했지만 그중 하나를 억제하려는 경우 다음과 같이 사용합니다.

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        extraWarnings.set(true)
        freeCompilerArgs.add("-Xsuppress-warning=CAN_BE_VAL")
    }
}
```

경고를 억제하고 싶지만 경고 이름을 모르는 경우 해당 요소를 선택하고 전구 아이콘을 클릭합니다(또는 <shortcut>Cmd + Enter</shortcut>/<shortcut>Alt + Enter</shortcut> 사용).

![경고 이름 인텐션](warning-name-intention.png){width=500}

새 컴파일러 옵션은 현재 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다.
다음 세부 사항도 유의하세요.

* 오류(Error) 억제는 허용되지 않습니다.
* 알 수 없는 경고 이름을 전달하면 컴파일 시 오류가 발생합니다.
* 여러 경고를 한 번에 지정할 수 있습니다.
  
   <tabs>
   <tab title="명령줄">

   ```bash
   kotlinc -Xsuppress-warning=NOTHING_TO_INLINE -Xsuppress-warning=NO_TAIL_CALLS_FOUND main.kt
   ```

   </tab>
   <tab title="빌드 파일">

   ```kotlin
   // build.gradle.kts
   kotlin {
       compilerOptions {
           freeCompilerArgs.addAll(
               listOf(
                   "-Xsuppress-warning=NOTHING_TO_INLINE",
                   "-Xsuppress-warning=NO_TAIL_CALLS_FOUND"
               )
           )
       }
   }
   ```

   </tab>
   </tabs>

### 개선된 K2 kapt 구현 {id="improved-k2-kapt-implementation"}

> K2 컴파일러용 kapt 플러그인(K2 kapt)은 [알파(Alpha)](components-stability.md#stability-levels-explained) 단계입니다.
> 언제든지 변경될 수 있습니다.
> 
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-71439/K2-kapt-feedback)을 통해 의견을 남겨주시면 감사하겠습니다.
>
{style="warning"}

현재 [kapt](kapt.md) 플러그인을 사용하는 프로젝트는 기본적으로 K1 컴파일러와 함께 작동하며, 최대 Kotlin 1.9 버전까지 지원합니다.

Kotlin 1.9.20에서는 K2 컴파일러를 사용한 kapt 플러그인의 실험적 구현(K2 kapt)을 출시했습니다.
이번에 기술적 문제와 성능 문제를 완화하기 위해 K2 kapt의 내부 구현을 개선했습니다.

새로운 K2 kapt 구현에는 새로운 기능이 추가되지 않았지만 이전 K2 kapt 구현에 비해 성능이 크게 향상되었습니다.
또한 K2 kapt 플러그인의 동작이 이제 K1 kapt의 동작에 훨씬 가까워졌습니다.

새로운 K2 kapt 플러그인 구현을 사용하려면 이전 K2 kapt 플러그인과 마찬가지로 활성화하면 됩니다.
프로젝트의 `gradle.properties` 파일에 다음 옵션을 추가하세요.

```kotlin
kapt.use.k2=true
```

향후 릴리스에서는 K1 kapt 대신 K2 kapt 구현이 기본적으로 활성화되므로 더 이상 수동으로 활성화할 필요가 없습니다.

새로운 구현이 안정화되기 전에 [피드백](https://youtrack.jetbrains.com/issue/KT-71439/K2-kapt-feedback)을 공유해 주시면 대단히 감사하겠습니다.

### 부호 없는 타입과 원시 타입이 아닌 타입 간의 오버로드 충돌 해결 {id="resolution-for-overload-conflicts-between-unsigned-and-non-primitive-types"}

이번 릴리스에서는 다음 예제와 같이 이전 버전에서 부호 없는 타입(unsigned type)과 원시 타입이 아닌 타입(non-primitive type)에 대해 함수가 오버로드되었을 때 발생할 수 있었던 오버로드 충돌 해결 문제를 다룹니다.

#### 오버로드된 확장 함수 {id="overloaded-extension-functions"}

```kotlin
fun Any.doStuff() = "Any"
fun UByte.doStuff() = "UByte"

fun main() {
    val uByte: UByte = UByte.MIN_VALUE
    uByte.doStuff() // Kotlin 2.1.0 이전에는 오버로드 확인 모호성(ambiguity) 발생
}
```

이전 버전에서는 `Any`와 `UByte` 확장이 모두 적용 가능했기 때문에 `uByte.doStuff()`를 호출하면 모호성이 발생했습니다.

#### 오버로드된 최상위 함수 {id="overloaded-top-level-functions"}

```kotlin
fun doStuff(value: Any) = "Any"
fun doStuff(value: UByte) = "UByte"

fun main() {
    val uByte: UByte = UByte.MIN_VALUE
    doStuff(uByte) // Kotlin 2.1.0 이전에는 오버로드 확인 모호성 발생
}
```

마찬가지로 컴파일러가 `Any` 버전을 사용할지 `UByte` 버전을 사용할지 결정할 수 없었기 때문에 `doStuff(uByte)` 호출이 모호했습니다.
2.1.0부터 컴파일러는 이러한 케이스를 올바르게 처리하여 더 구체적인 타입(이 경우 `UByte`)에 우선순위를 부여함으로써 모호성을 해결합니다.

## Kotlin/JVM {id="kotlin-jvm"}

2.1.0 버전부터 컴파일러는 Java 23 바이트코드를 포함하는 클래스를 생성할 수 있습니다.

### JSpecify null 허용 여부 불일치 진단 심각도를 strict로 변경 {id="change-of-jspecify-nullability-mismatch-diagnostics-severity-to-strict"}

Kotlin 2.1.0은 `org.jspecify.annotations`의 null 허용 여부(nullability) 애노테이션을 엄격하게 처리하여 Java 상호 운용성에 대한 타입 안전성을 향상합니다.

영향을 받는 null 허용 여부 애노테이션은 다음과 같습니다.

* `org.jspecify.annotations.Nullable`
* `org.jspecify.annotations.NonNull`
* `org.jspecify.annotations.NullMarked`
* `org.jspecify.nullness`의 레거시 애노테이션 (JSpecify 0.2 및 이전 버전)

Kotlin 2.1.0부터 null 허용 여부 불일치는 기본적으로 경고에서 오류로 상향 조정됩니다.
이를 통해 타입 검사 중에 `@NonNull` 및 `@Nullable`과 같은 애노테이션이 강력하게 적용되어 런타임에 예상치 못한 null 허용 여부 문제가 발생하는 것을 방지합니다.

`@NullMarked` 애노테이션은 해당 스코프 내의 모든 멤버의 null 허용 여부에도 영향을 미치므로, 애노테이션이 지정된 Java 코드로 작업할 때 동작을 보다 예측 가능하게 만듭니다.

새로운 기본 동작을 보여주는 예시는 다음과 같습니다.

```java
// Java
import org.jspecify.annotations.*;
public class SomeJavaClass {
    @NonNull
    public String foo() { //...
    }

    @Nullable
    public String bar() { //...
    }
}
```

```kotlin
// Kotlin
fun test(sjc: SomeJavaClass) {
    // null이 아닌 결과에 접근하며, 이는 허용됩니다.
    sjc.foo().length

    // 결과가 null일 수 있으므로 기본 strict 모드에서는 오류가 발생합니다.
    // 오류를 방지하려면 대신 ?.length를 사용하세요.
    sjc.bar().length
}
```

이러한 애노테이션에 대한 진단 심각도를 수동으로 제어할 수 있습니다.
그렇게 하려면 `-Xnullability-annotations` 컴파일러 옵션을 사용하여 모드를 선택하세요.

* `ignore`: null 허용 여부 불일치를 무시합니다.
* `warning`: null 허용 여부 불일치에 대해 경고를 보고합니다.
* `strict`: null 허용 여부 불일치에 대해 오류를 보고합니다(기본 모드).

자세한 내용은 [Null 허용 여부 애노테이션](java-interop.md#nullability-annotations)을 참고하세요.

## Kotlin Multiplatform {id="kotlin-multiplatform"}

Kotlin 2.1.0은 [Swift export에 대한 기본 지원](#basic-support-for-swift-export)을 도입하고 [Kotlin Multiplatform 라이브러리 게시를 더욱 쉽게](#ability-to-publish-kotlin-libraries-from-any-host) 만듭니다.
또한 [컴파일러 옵션 구성을 위한 새로운 DSL](#new-gradle-dsl-for-compiler-options-in-multiplatform-projects-promoted-to-stable)을 안정화하고 [격리된 프로젝트(Isolated Projects) 기능의 프리뷰](#preview-gradle-s-isolated-projects-in-kotlin-multiplatform)를 제공하는 등 Gradle 관련 개선 사항에 중점을 둡니다.

### 멀티플랫폼 프로젝트의 컴파일러 옵션을 위한 새로운 Gradle DSL이 Stable로 승격됨 {id="new-gradle-dsl-for-compiler-options-in-multiplatform-projects-promoted-to-stable"}

Kotlin 2.0.0에서는 멀티플랫폼 프로젝트 전반의 컴파일러 옵션 구성을 간소화하기 위해 [새로운 실험적 Gradle DSL을 도입](whatsnew20.md#new-gradle-dsl-for-compiler-options-in-multiplatform-projects)했습니다.
Kotlin 2.1.0에서는 이 DSL이 안정화(Stable) 단계로 승격되었습니다.

전체 프로젝트 구성은 이제 세 개의 레이어를 갖습니다. 가장 높은 레이어는 확장(extension) 레벨,
그다음은 타깃(target) 레벨, 가장 낮은 레이어는 컴파일 단위(일반적으로 컴파일 태스크)입니다.

![Kotlin 컴파일러 옵션 레벨](compiler-options-levels.svg){width=700}

다양한 레벨과 레벨 간에 컴파일러 옵션을 구성하는 방법에 대해 자세히 알아보려면 [컴파일러 옵션](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#compiler-options)을 참고하세요.

### Kotlin Multiplatform에서 Gradle의 Isolated Projects 프리뷰 {id="preview-gradle-s-isolated-projects-in-kotlin-multiplatform"}

> 이 기능은 [실험적(Experimental)](components-stability.md#stability-levels-explained)이며 현재 Gradle에서 프리 알파(pre-Alpha) 상태입니다.
> Gradle 버전 8.10에서만 평가 목적으로 사용하세요. 이 기능은 언제든지 중단되거나 변경될 수 있습니다.
> 
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-57279/Support-Gradle-Project-Isolation-Feature-for-Kotlin-Multiplatform)을 통해 의견을 남겨주시면 감사하겠습니다.
> 옵트인이 필요합니다(자세한 내용은 아래 참조).
>
{style="warning"}

Kotlin 2.1.0에서는 멀티플랫폼 프로젝트에서 Gradle의 [Isolated Projects](https://docs.gradle.org/current/userguide/isolated_projects.html) 기능을 미리 사용해 볼 수 있습니다.

Gradle의 Isolated Projects 기능은 개별 Gradle 프로젝트의 구성을 서로 "격리"하여 빌드 성능을 향상합니다.
각 프로젝트의 빌드 로직이 다른 프로젝트의 변경 가능한 상태(mutable state)에 직접 접근하지 못하도록 제한하여 안전하게 병렬로 실행할 수 있도록 합니다.
이 기능을 지원하기 위해 Kotlin Gradle 플러그인 모델을 일부 변경했으며, 이 프리뷰 단계에서 여러분의 경험에 대한 피드백을 기다리고 있습니다.

Kotlin Gradle 플러그인의 새 모델을 활성화하는 방법에는 두 가지가 있습니다.

* 옵션 1: **Isolated Projects를 활성화하지 않고 호환성 테스트** –
  Isolated Projects 기능을 활성화하지 않고 Kotlin Gradle 플러그인의 새 모델과의 호환성을 확인하려면 프로젝트의 `gradle.properties` 파일에 다음 Gradle 속성을 추가합니다.

  ```none
  # gradle.properties
  kotlin.kmp.isolated-projects.support=enable
  ```

* 옵션 2: **Isolated Projects를 활성화한 상태에서 테스트** –
  Gradle에서 Isolated Projects 기능을 활성화하면 Kotlin Gradle 플러그인이 새 모델을 사용하도록 자동으로 구성됩니다.
  Isolated Projects 기능을 활성화하려면 [시스템 속성을 설정](https://docs.gradle.org/current/userguide/isolated_projects.html#how_do_i_use_it)하세요.
  이 경우 프로젝트에 Kotlin Gradle 플러그인용 Gradle 속성을 추가할 필요가 없습니다.

### Swift export 기본 지원 {id="basic-support-for-swift-export"}

> 이 기능은 현재 개발 초기 단계에 있습니다. 언제든지 중단되거나 변경될 수 있습니다.
> 옵트인이 필요하며(자세한 내용은 아래 참조), 평가 목적으로만 사용해야 합니다.
> [YouTrack](https://kotl.in/issue)을 통해 의견을 남겨주시면 감사하겠습니다.
> 
{style="warning"}

2.1.0 버전은 Objective-C 헤더를 사용하지 않고 Kotlin 소스를 Swift 인터페이스로 직접 내보낼 수 있도록 하는 Swift export 지원의 첫 단계를 밟았습니다.
이를 통해 Apple 타깃용 멀티플랫폼 개발이 더욱 쉬워질 것입니다.

현재의 기본 지원에는 다음 기능이 포함됩니다.

* Kotlin에서 Swift로 직접 여러 Gradle 모듈 내보내기.
* `moduleName` 속성을 사용하여 커스텀 Swift 모듈 이름 정의.
* `flattenPackage` 속성을 사용하여 패키지 구조에 대한 축소(collapse) 규칙 설정.

Swift export 설정을 위한 시작점으로 프로젝트에서 다음 빌드 파일을 사용할 수 있습니다.

```kotlin
// build.gradle.kts 
kotlin {

    iosX64()
    iosArm64()
    iosSimulatorArm64()

    @OptIn(ExperimentalSwiftExportDsl::class)
    swiftExport {
        // 루트 모듈 이름
        moduleName = "Shared"

        // 축소 규칙
        // 생성된 Swift 코드에서 패키지 접두사를 제거합니다.
        flattenPackage = "com.example.sandbox"

        // 외부 모듈 내보내기
        export(project(":subproject")) {
            // 내보낸 모듈 이름
            moduleName = "Subproject"
            // 내보낸 의존성 축소 규칙
            flattenPackage = "com.subproject.library"
        }
    }
}
```

Swift export가 이미 설정되어 있는 [공개 샘플](https://github.com/Kotlin/swift-export-sample)을 클론하여 사용할 수도 있습니다.

컴파일러는 필요한 모든 파일(`swiftmodule` 파일, 정적 `a` 라이브러리, 헤더 및 `modulemap` 파일 포함)을 자동으로 생성하여 Xcode에서 접근할 수 있는 앱의 빌드 디렉터리에 복사합니다.

#### Swift export 활성화 방법 {id="how-to-enable-swift-export"}

이 기능은 현재 초기 개발 단계에 있음을 명심하세요.

Swift export는 현재 [직접 통합(direct integration)](https://kotlinlang.org/docs/multiplatform/multiplatform-direct-integration.html)을 사용하여 iOS 프레임워크를 Xcode 프로젝트에 연결하는 프로젝트에서 작동합니다.
이는 Android Studio에서 생성되었거나 [웹 마법사](https://kmp.jetbrains.com/)를 통해 생성된 Kotlin Multiplatform 프로젝트의 표준 구성입니다.

프로젝트에서 Swift export를 사용해 보려면 다음 단계를 따르세요.

1. `gradle.properties` 파일에 다음 Gradle 옵션을 추가합니다.

   ```none
   # gradle.properties
   kotlin.experimental.swift-export.enabled=true
   ```

2. Xcode에서 프로젝트 설정을 엽니다.
3. **Build Phases** 탭에서 `embedAndSignAppleFrameworkForXcode` 태스크가 포함된 **Run Script** 단계를 찾습니다.
4. Run Script 단계에서 스크립트를 수정하여 대신 `embedSwiftExportForXcode` 태스크를 실행하도록 변경합니다.

   ```bash
   ./gradlew :<Shared module name>:embedSwiftExportForXcode
   ```

   ![Swift export 스크립트 추가](xcode-swift-export-run-script-phase.png){width=700}

#### Swift export에 대한 피드백 남기기 {id="leave-feedback-on-swift-export"}

향후 Kotlin 릴리스에서 Swift export 지원을 확장하고 안정화할 계획입니다.
[이 YouTrack 이슈](https://youtrack.jetbrains.com/issue/KT-64572)에 피드백을 남겨주세요.

### 모든 호스트에서 Kotlin 라이브러리를 게시하는 기능 {id="ability-to-publish-kotlin-libraries-from-any-host"}

> 이 기능은 현재 [실험적(Experimental)](components-stability.md#stability-levels-explained)입니다.
> 옵트인이 필요하며(자세한 내용은 아래 참조), 평가 목적으로만 사용해야 합니다.
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-71290)을 통해 의견을 남겨주시면 감사하겠습니다.
>
{style="warning"}

Kotlin 컴파일러는 Kotlin 라이브러리 게시를 위해 `.klib` 아티팩트를 생성합니다.
이전에는 Mac 머신이 필요했던 Apple 플랫폼 타깃을 제외한 모든 호스트에서 필요한 아티팩트를 얻을 수 있었습니다.
이로 인해 iOS, macOS, tvOS 및 watchOS를 대상으로 하는 Kotlin Multiplatform 프로젝트에 특별한 제약이 있었습니다.

Kotlin 2.1.0은 크로스 컴파일 지원을 추가하여 이러한 제한을 해제했습니다.
이제 [지원되는 모든 호스트](native-target-support.md#hosts)를 사용하여 `.klib` 아티팩트를 생성할 수 있으며,
이를 통해 Kotlin 및 Kotlin Multiplatform 라이브러리의 게시 프로세스가 대폭 단순화됩니다.

#### 모든 호스트에서 라이브러리 게시를 활성화하는 방법 {id="how-to-enable-publishing-libraries-from-any-host"}

프로젝트에서 크로스 컴파일을 사용해 보려면 `gradle.properties` 파일에 다음 바이너리 옵션을 추가하세요.

```none
# gradle.properties
kotlin.native.enableKlibsCrossCompilation=true
```

이 기능은 현재 실험적 단계이며 몇 가지 제한 사항이 있습니다. 다음과 같은 경우에는 여전히 Mac 머신을 사용해야 합니다.

* 라이브러리에 [cinterop 의존성](native-c-interop.md)이 있는 경우.
* 프로젝트에 [CocoaPods 통합](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html)이 설정되어 있는 경우.
* Apple 타깃을 위한 [최종 바이너리](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html)를 빌드하거나 테스트해야 하는 경우.

#### 모든 호스트에서 라이브러리 게시에 대한 피드백 남기기 {id="leave-feedback-on-publishing-libraries-from-any-host"}

향후 Kotlin 릴리스에서 이 기능을 안정화하고 라이브러리 게시를 더욱 개선할 계획입니다.
이슈 트래커인 [YouTrack](https://youtrack.jetbrains.com/issue/KT-71290)에 피드백을 남겨주세요.

자세한 내용은 [멀티플랫폼 라이브러리 게시](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-lib-setup.html)를 참고하세요.

### 패킹되지 않은(non-packed) klib 지원 {id="support-for-non-packed-klibs"}

Kotlin 2.1.0에서는 패킹되지 않은(non-packed) `.klib` 파일 아티팩트를 생성할 수 있습니다.
이를 통해 klib을 먼저 압축 해제하지 않고 직접 의존성을 구성할 수 있는 옵션이 제공됩니다.

이 변경 사항은 성능을 향상시켜 Kotlin/Wasm, Kotlin/JS 및 Kotlin/Native 프로젝트의 컴파일 및 링킹 시간을 단축할 수도 있습니다.

예를 들어 당사의 벤치마크에 따르면 1개의 링킹 및 10개의 컴파일 태스크가 있는 프로젝트(9개의 단순화된 프로젝트에 의존하는 단일 네이티브 실행 바이너리를 빌드하는 프로젝트)에서 전체 빌드 시간이 약 3% 향상된 것으로 나타났습니다.
그러나 실제 빌드 시간에 미치는 영향은 하위 프로젝트의 수와 각 프로젝트의 크기에 따라 달라집니다.

#### 프로젝트 설정 방법 {id="how-to-set-up-your-project"}

기본적으로 Kotlin 컴파일 및 링킹 태스크는 이제 새로운 비패킹 아티팩트를 사용하도록 구성됩니다.

klib 확인을 위해 커스텀 빌드 로직을 설정했고 압축 해제된 새 아티팩트를 사용하려면 Gradle 빌드 파일에서 선호하는 klib 패키지 확인 방식을 명시적으로 지정해야 합니다.

```kotlin
// build.gradle.kts
import org.jetbrains.kotlin.gradle.plugin.attributes.KlibPackaging
// ...
val resolvableConfiguration = configurations.resolvable("resolvable") {

    // 새로운 비패킹 구성을 사용하는 경우:
    attributes.attribute(KlibPackaging.ATTRIBUTE, project.objects.named(KlibPackaging.NON_PACKED))

    // 이전 패킹된 구성을 사용하는 경우:
    attributes.attribute(KlibPackaging.ATTRIBUTE, project.objects.named(KlibPackaging.PACKED))
}
```

비패킹 `.klib` 파일은 이전에 패킹된 파일이 생성되었던 프로젝트 빌드 디렉터리와 동일한 경로에 생성됩니다.
반면, 패킹된 klib은 이제 `build/libs` 디렉터리에 위치합니다.

속성을 지정하지 않으면 패킹된 변형이 사용됩니다.
다음 콘솔 명령어로 사용 가능한 속성 및 변형 목록을 확인할 수 있습니다.

```shell
./gradlew outgoingVariants
```

이 기능에 대한 피드백을 [YouTrack](https://kotl.in/issue)에 남겨주시면 감사하겠습니다.

### 이전 `android` 타깃에 대한 추가 지원 중단 단계 {id="further-deprecation-of-old-android-target"}

Kotlin 2.1.0에서는 이전 `android` 타깃 이름에 대한 지원 중단 경고가 오류로 격상되었습니다.

현재 Android를 대상으로 하는 Kotlin Multiplatform 프로젝트에서는 `androidTarget` 옵션을 사용하는 것이 좋습니다.
이는 향후 출시될 Google의 Android/KMP 플러그인을 위해 `android`라는 이름을 비워두기 위한 임시 조치입니다.

새 플러그인이 제공되면 추가 마이그레이션 지침을 제공할 예정입니다.
Google의 새 DSL은 Kotlin Multiplatform에서 Android 타깃을 지원하기 위한 기본 옵션이 될 것입니다.

자세한 내용은 [Kotlin Multiplatform 호환성 가이드](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#rename-of-android-target-to-androidtarget)를 참고하세요.

### 동일한 타입의 타깃 여러 개 선언에 대한 지원 제거 {id="dropped-support-for-declaring-multiple-targets-of-the-same-type"}

Kotlin 2.1.0 이전에는 멀티플랫폼 프로젝트에서 동일한 유형의 대상을 여러 개 선언할 수 있었습니다.
그러나 이로 인해 대상 간을 구별하고 공유 소스 세트를 효과적으로 지원하기가 어려웠습니다.
대부분의 경우 별도의 Gradle 프로젝트를 사용하는 것과 같은 단순한 설정이 더 잘 작동합니다.
자세한 지침과 마이그레이션 방법 예시는 Kotlin Multiplatform 호환성 가이드의 [유사한 타깃 여러 개 선언하기](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#declaring-several-similar-targets)를 참고하세요.

Kotlin 1.9.20에서는 멀티플랫폼 프로젝트에서 동일한 유형의 타깃을 여러 개 선언할 경우 지원 중단 경고가 발생했습니다.
Kotlin 2.1.0에서는 Kotlin/JS 타깃을 제외한 모든 타깃에서 이 지원 중단 경고가 오류로 변경되었습니다.
Kotlin/JS 타깃이 예외인 이유에 대한 자세한 내용은 [YouTrack의 이 이슈](https://youtrack.jetbrains.com/issue/KT-47038/KJS-MPP-Split-JS-target-into-JsBrowser-and-JsNode)를 확인하세요.

## Kotlin/Native {id="kotlin-native"}

Kotlin 2.1.0에는 [`iosArm64` 타깃 지원 업그레이드](#iosarm64-promoted-to-tier-1),
[cinterop 캐싱 프로세스 개선](#changes-to-caching-in-cinterop) 및 기타 업데이트가 포함되어 있습니다.

### iosArm64가 Tier 1으로 승격됨 {id="iosarm64-promoted-to-tier-1"}

[Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/get-started.html) 개발에 매우 중요한 `iosArm64` 타깃이 Tier 1으로 승격되었습니다. 이는 Kotlin/Native 컴파일러에서 가장 높은 수준의 지원 단계입니다.

즉, 이 타깃은 컴파일 및 실행이 가능한지 확인하기 위해 CI 파이프라인에서 정기적으로 테스트됩니다.
또한 이 타깃에 대한 컴파일러 릴리스 간 소스 및 바이너리 호환성을 보장합니다.

타깃 티어에 대한 자세한 내용은 [Kotlin/Native 타깃 지원](native-target-support.md)을 참고하세요.

### LLVM 버전 11.1.0에서 16.0.0으로 업데이트 {id="llvm-update-from-11-1-0-to-16-0-0"}

Kotlin 2.1.0에서는 LLVM을 버전 11.1.0에서 16.0.0으로 업데이트했습니다.
새 버전에는 버그 수정 및 보안 업데이트가 포함되어 있습니다.
특정 상황에서는 컴파일러 최적화와 더 빠른 컴파일도 제공합니다.

프로젝트에 Linux 타깃이 있는 경우, Kotlin/Native 컴파일러가 이제 모든 Linux 타깃에 대해 기본적으로 `lld` 링커를 사용한다는 점에 유의하세요.

이 업데이트는 코드에 영향을 미치지 않아야 하지만, 문제가 발생하면 [이슈 트래커](http://kotl.in/issue)에 보고해 주세요.

### cinterop 캐싱 변경 사항 {id="changes-to-caching-in-cinterop"}

Kotlin 2.1.0에서는 cinterop 캐싱 프로세스를 변경합니다. 더 이상 [`CacheableTask`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/CacheableTask.html) 애노테이션 타입을 갖지 않습니다.
새롭게 권장되는 방식은 [`cacheIf`](https://docs.gradle.org/current/kotlin-dsl/gradle/org.gradle.api.tasks/-task-outputs/cache-if.html) 출력 타입을 사용하여 태스크 결과를 캐시하는 것입니다.

이를 통해 [정의 파일(definition file)](native-definition-file.md)에 지정된 헤더 파일의 변경 사항을 `UP-TO-DATE` 검사에서 감지하지 못해 빌드 시스템이 코드를 다시 컴파일하지 못하던 문제를 해결할 수 있습니다.

### mimalloc 메모리 할당자 지원 중단 {id="deprecation-of-the-mimalloc-memory-allocator"}

Kotlin 1.9.0에서는 새로운 메모리 할당자를 도입했고, Kotlin 1.9.20에서는 이를 기본값으로 활성화했습니다.
새 할당자는 가비지 컬렉션을 더욱 효율적으로 만들고 Kotlin/Native 메모리 관리자의 런타임 성능을 향상하도록 설계되었습니다.

새 메모리 할당자는 이전의 기본 할당자였던 [mimalloc](https://github.com/microsoft/mimalloc)을 대체했습니다.
이제 Kotlin/Native 컴파일러에서 mimalloc의 지원을 중단할 때가 되었습니다.

빌드 스크립트에서 `-Xallocator=mimalloc` 컴파일러 옵션을 제거해도 됩니다.
문제가 발생하면 [이슈 트래커](http://kotl.in/issue)에 보고해 주세요.

Kotlin의 메모리 할당자 및 가비지 컬렉션에 대한 자세한 내용은 [Kotlin/Native 메모리 관리](native-memory-manager.md)를 참고하세요.

## Kotlin/Wasm {id="kotlin-wasm"}

Kotlin/Wasm은 [증분 컴파일 지원](#support-for-incremental-compilation)과 함께 여러 업데이트를 받았습니다.

### 증분 컴파일 지원 {id="support-for-incremental-compilation"}

이전에는 Kotlin 코드에서 무언가를 변경하면 Kotlin/Wasm 툴체인이 전체 코드베이스를 다시 컴파일해야 했습니다.

2.1.0부터 Wasm 타깃에 대한 증분 컴파일(incremental compilation)이 지원됩니다.
개발 태스크에서 컴파일러는 이제 마지막 컴파일의 변경 사항과 관련된 파일만 다시 컴파일하므로 컴파일 시간이 눈에 띄게 단축됩니다.

이 변경으로 현재 컴파일 속도가 2배 빨라졌으며 향후 릴리스에서 더욱 개선할 계획입니다.

현재 설정에서 Wasm 타깃에 대한 증분 컴파일은 기본적으로 비활성화되어 있습니다.
증분 컴파일을 활성화하려면 프로젝트의 `local.properties` 또는 `gradle.properties` 파일에 다음 줄을 추가하세요.

```none
# gradle.properties
kotlin.incremental.wasm=true
```

Kotlin/Wasm 증분 컴파일을 사용해 보고 [피드백을 공유](https://youtrack.jetbrains.com/issue/KT-72158/Kotlin-Wasm-incremental-compilation-feedback)해 주세요.
여러분의 의견은 이 기능이 조기에 안정화되고 기본적으로 활성화되는 데 도움이 됩니다.

### 브라우저 API가 kotlinx-browser 독립형 라이브러리로 이동 {id="browser-apis-moved-to-the-kotlinx-browser-stand-alone-library"}

이전에는 웹 API 및 관련 타깃 유틸리티에 대한 선언이 Kotlin/Wasm 표준 라이브러리의 일부였습니다.

이번 릴리스에서는 `org.w3c.*` 선언이 Kotlin/Wasm 표준 라이브러리에서 새로운 [kotlinx-browser 라이브러리](https://github.com/kotlin/kotlinx-browser)로 이동되었습니다.
이 라이브러리에는 `org.khronos.webgl`, `kotlin.dom`, `kotlinx.browser`와 같은 다른 웹 관련 패키지도 포함되어 있습니다.

이러한 분리를 통해 모듈성이 제공되어 Kotlin의 릴리스 주기와 독립적으로 웹 관련 API를 업데이트할 수 있습니다.
또한 이제 Kotlin/Wasm 표준 라이브러리에는 모든 JavaScript 환경에서 사용할 수 있는 선언만 포함됩니다.

이동된 패키지의 선언을 사용하려면 프로젝트의 빌드 구성 파일에 `kotlinx-browser` 의존성을 추가해야 합니다.

```kotlin
// build.gradle.kts
val wasmJsMain by getting {
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-browser:0.3")
    }
}
```

### Kotlin/Wasm 디버깅 환경 개선 {id="improved-debugging-experience-for-kotlin-wasm"}

이전에는 웹 브라우저에서 Kotlin/Wasm 코드를 디버깅할 때 디버깅 인터페이스에서 변수 값이 저수준 형태로 표시되는 경우가 있었습니다.
이로 인해 애플리케이션의 현재 상태를 추적하기가 어려운 경우가 많았습니다.

![Kotlin/Wasm 이전 디버거](wasm-old-debugger.png){width=700}

이러한 경험을 개선하기 위해 변수 뷰에 커스텀 포맷터(custom formatter)가 추가되었습니다.
이 구현은 Firefox 및 Chromium 기반 브라우저와 같은 주요 브라우저에서 지원되는 [커스텀 포맷터 API](https://firefox-source-docs.mozilla.org/devtools-user/custom_formatters/index.html)를 사용합니다.

이 변경으로 이제 변수 값을 보다 사용자 친화적이고 이해하기 쉬운 방식으로 표시하고 찾을 수 있습니다.

![Kotlin/Wasm 개선된 디버거](wasm-debugger-improved.png){width=700}

새로운 디버깅 경험을 사용해 보려면:

1. `wasmJs {}` 컴파일러 옵션에 다음 컴파일러 옵션을 추가합니다.

   ```kotlin
   // build.gradle.kts
   kotlin {
       wasmJs {
           // ...
   
           compilerOptions {
               freeCompilerArgs.add("-Xwasm-debugger-custom-formatters")
           }
       }
   }
   ```

2. 브라우저에서 커스텀 포맷터를 활성화합니다.

   * Chrome 개발자 도구의 경우 **설정 | 환경설정 | 콘솔(Settings | Preferences | Console)**을 통해 활성화할 수 있습니다.

     ![Chrome에서 커스텀 포맷터 활성화](wasm-custom-formatters-chrome.png){width=700}

   * Firefox 개발자 도구의 경우 **설정 | 고급 설정(Settings | Advanced settings)**을 통해 활성화할 수 있습니다.

     ![Firefox에서 커스텀 포맷터 활성화](wasm-custom-formatters-firefox.png){width=700}

### Kotlin/Wasm 바이너리 크기 감소 {id="reduced-size-of-kotlin-wasm-binaries"}

프로덕션 빌드에서 생성되는 Wasm 바이너리의 크기가 최대 30%까지 줄어들며 약간의 성능 향상을 확인할 수도 있습니다.
이는 `--closed-world`, `--type-ssa`, `--type-merging` Binaryen 옵션이 이제 모든 Kotlin/Wasm 프로젝트에서 사용하기에 안전한 것으로 간주되어 기본적으로 활성화되기 때문입니다.

### Kotlin/Wasm의 JavaScript 배열 상호 운용성 개선 {id="improved-javascript-array-interoperability-in-kotlin-wasm"}

Kotlin/Wasm의 표준 라이브러리는 JavaScript 배열을 위한 `JsArray<T>` 타입을 제공하지만, `JsArray<T>`를 Kotlin의 기본 `Array` 또는 `List` 타입으로 변환하는 직접적인 메서드가 없었습니다.

이러한 공백으로 인해 배열 변환을 위한 커스텀 함수를 만들어야 했고, Kotlin과 JavaScript 코드 간의 상호 운용성이 복잡해졌습니다.

이번 릴리스에서는 `JsArray<T>`를 `Array<T>`로, 또는 그 반대로 자동 변환하여 배열 작업을 단순화하는 어댑터 함수를 도입했습니다.

다음은 제네릭 타입 간 변환의 예입니다(Kotlin `List<T>` 및 `Array<T>`를 JavaScript `JsArray<T>`로 변환).

```kotlin
val list: List<JsString> =
    listOf("Kotlin", "Wasm").map { it.toJsString() }

// .toJsArray()를 사용하여 List 또는 Array를 JsArray로 변환
val jsArray: JsArray<JsString> = list.toJsArray()

// .toArray() 및 .toList()를 사용하여 다시 Kotlin 타입으로 변환
val kotlinArray: Array<JsString> = jsArray.toArray()
val kotlinList: List<JsString> = jsArray.toList()
```

형식화된 배열(typed array)을 그에 상응하는 Kotlin 배열로 변환하는 유사한 메서드도 제공됩니다(예: `IntArray` 및 `Int32Array`). 자세한 정보 및 구현은 [`kotlinx-browser` 리포지토리]( https://github.com/Kotlin/kotlinx-browser/blob/dfbdceed314567983c98f1d66e8c2e10d99c5a55/src/wasmJsMain/kotlin/arrayCopy.kt)를 참고하세요.

다음은 형식화된 배열 간 변환의 예입니다(Kotlin `IntArray`를 JavaScript `Int32Array`로 변환).

```kotlin
import org.khronos.webgl.*

    // ...

    val intArray: IntArray = intArrayOf(1, 2, 3)
    
    // .toInt32Array()를 사용하여 Kotlin IntArray를 JavaScript Int32Array로 변환
    val jsInt32Array: Int32Array = intArray.toInt32Array()
    
    // toIntArray()를 사용하여 JavaScript Int32Array를 다시 Kotlin IntArray로 변환
    val kotlinIntArray: IntArray = jsInt32Array.toIntArray()
```

### Kotlin/Wasm에서 JavaScript 예외 세부 정보 접근 지원 {id="support-for-accessing-javascript-exception-details-in-kotlin-wasm"}

이전에는 Kotlin/Wasm에서 JavaScript 예외가 발생했을 때 `JsException` 타입이 원본 JavaScript 오류의 세부 정보 없이 일반적인 메시지만 제공했습니다.

Kotlin 2.1.0부터는 특정 컴파일러 옵션을 활성화하여 `JsException`에 원본 오류 메시지와 스택 트레이스를 포함하도록 구성할 수 있습니다.
이를 통해 JavaScript에서 발생하는 문제를 진단하는 데 도움이 되는 더 많은 컨텍스트를 제공합니다.

이 동작은 특정 브라우저에서만 사용할 수 있는 `WebAssembly.JSTag` API에 따라 달라집니다.

* **Chrome**: 버전 115부터 지원
* **Firefox**: 버전 129부터 지원
* **Safari**: 아직 지원되지 않음

기본적으로 비활성화되어 있는 이 기능을 활성화하려면 `build.gradle.kts` 파일에 다음 컴파일러 옵션을 추가하세요.

```kotlin
// build.gradle.kts
kotlin {
    wasmJs {
        compilerOptions {
            freeCompilerArgs.add("-Xwasm-attach-js-exception")
        }
    }
}
```

새로운 동작을 보여주는 예시는 다음과 같습니다.

```kotlin
external object JSON {
    fun <T: JsAny> parse(json: String): T
}

fun main() {
    try {
        JSON.parse("an invalid JSON")
    } catch (e: JsException) {
        println("Thrown value is: ${e.thrownValue}")
        // SyntaxError: Unexpected token 'a', "an invalid JSON" is not valid JSON

        println("Message: ${e.message}")
        // Message: Unexpected token 'a', "an invalid JSON" is not valid JSON

        println("Stacktrace:")
        // Stacktrace:

        // 전체 JavaScript 스택 트레이스 출력 
        e.printStackTrace()
    }
}
```

`-Xwasm-attach-js-exception` 옵션을 활성화하면 `JsException`이 JavaScript 오류의 구체적인 세부 정보를 제공합니다.
이 옵션이 없으면 `JsException`에는 JavaScript 코드를 실행하는 동안 예외가 발생했음을 알리는 일반 메시지만 포함됩니다.

### 기본 내보내기(default export) 지원 중단 {id="deprecation-of-default-exports"}

이름 지정 내보내기(named export)로 마이그레이션하는 과정의 일환으로, 이전에는 JavaScript에서 Kotlin/Wasm 내보내기에 대해 기본 가져오기(default import)를 사용할 때 콘솔에 오류가 출력되었습니다.

2.1.0에서는 명명된 내보내기를 완벽하게 지원하기 위해 기본 가져오기가 완전히 제거되었습니다.

이제 Kotlin/Wasm 타깃용 JavaScript로 코딩할 때 기본 가져오기 대신 해당하는 이름 지정 가져오기를 사용해야 합니다.

이 변경은 이름 지정 내보내기로 마이그레이션하기 위한 지원 중단 주기의 마지막 단계를 나타냅니다.

**버전 2.0.0:** 기본 내보내기를 통한 엔터티 내보내기가 더 이상 지원되지 않는다는 경고 메시지가 콘솔에 출력되었습니다.

**버전 2.0.20:** 해당 이름 지정 가져오기를 사용하도록 요청하는 오류가 발생했습니다.

**버전 2.1.0:** 기본 가져오기 사용이 완전히 제거되었습니다.

### 하위 프로젝트별 Node.js 설정 {id="subproject-specific-node-js-settings"}

`rootProject`에 대한 `NodeJsRootPlugin` 클래스의 속성을 정의하여 프로젝트의 Node.js 설정을 구성할 수 있습니다.
2.1.0에서는 새로운 클래스인 `NodeJsPlugin`을 사용하여 각 하위 프로젝트에 대해 이러한 설정을 구성할 수 있습니다.
하위 프로젝트에 특정 Node.js 버전을 설정하는 방법을 보여주는 예는 다음과 같습니다.

```kotlin
// build.gradle.kts
project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
    project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().version = "22.0.0"
}
```

전체 프로젝트에 새 클래스를 사용하려면 `allprojects {}` 블록에 동일한 코드를 추가합니다.

```kotlin
// build.gradle.kts
allprojects {
    project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
        project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().version = "your Node.js version"
    }
}
```

Gradle 컨벤션 플러그인을 사용하여 특정 하위 프로젝트 세트에 설정을 적용할 수도 있습니다.

## Kotlin/JS {id="kotlin-js"}

### 속성에서 식별자가 아닌 문자 지원 {id="support-for-non-identifier-characters-in-properties"}

Kotlin/JS에서는 이전에 백틱으로 묶인 공백이 포함된 [테스트 메서드 이름](coding-conventions.md#names-for-test-methods)을 사용할 수 없었습니다.

마찬가지로 하이픈이나 공백과 같이 Kotlin 식별자에서 허용되지 않는 문자가 포함된 JavaScript 객체 속성에 접근할 수 없었습니다.

```kotlin
external interface Headers {
    var accept: String?

    // 하이픈으로 인해 유효하지 않은 Kotlin 식별자
    var `content-length`: String?
}

val headers: Headers = TODO("value provided by a JS library")
val accept = headers.accept
// 속성 이름의 하이픈으로 인해 오류 발생
val length = headers.`content-length`
```

이 동작은 식별자가 아닌 문자를 사용하여 이러한 속성에 접근할 수 있는 JavaScript 및 TypeScript와 달랐습니다.

Kotlin 2.1.0부터 이 기능이 기본적으로 활성화됩니다.
이제 Kotlin/JS에서 백틱(``)과 `@JsName` 애노테이션을 사용하여 식별자가 아닌 문자가 포함된 JavaScript 속성과 상호 작용하고 테스트 메서드에 해당 이름을 사용할 수 있습니다.

또한 `@JsName` 및 `@JsQualifier` 애노테이션을 사용하여 Kotlin 속성 이름을 해당하는 JavaScript 속성 이름에 매핑할 수 있습니다.

```kotlin
object Bar {
    val `property example`: String = "bar"
}

@JsQualifier("fooNamespace")
external object Foo {
    val `property example`: String
}

@JsExport
object Baz {
    val `property example`: String = "bar"
}

fun main() {
    // JavaScript에서는 Bar.property_example_HASH로 컴파일됩니다.
    println(Bar.`property example`)
    // JavaScript에서는 fooNamespace["property example"]로 컴파일됩니다.
    println(Foo.`property example`)
    // JavaScript에서는 Baz["property example"]로 컴파일됩니다.
    println(Baz.`property example`)
}
```

### ES2015 화살표 함수 생성 지원 {id="support-for-generating-es2015-arrow-functions"}

Kotlin 2.1.0에서 Kotlin/JS는 익명 함수 대신 `(a, b) => expression`과 같은 ES2015 화살표 함수 생성을 지원합니다.

화살표 함수를 사용하면 특히 실험적인 `-Xir-generate-inline-anonymous-functions` 모드를 사용할 때 프로젝트의 번들 크기를 줄일 수 있습니다.
또한 생성된 코드가 최신 JS에 더 부합하게 됩니다.

이 기능은 ES2015를 타깃으로 할 때 기본적으로 활성화됩니다.
또는 `-Xes-arrow-functions` 명령줄 인수를 사용하여 활성화할 수 있습니다.

[공식 문서에서 ES2015(ECMAScript 2015, ES6)](https://262.ecma-international.org/6.0/)에 대해 자세히 알아보세요.

## Gradle 개선 사항 {id="gradle-improvements"}

Kotlin 2.1.0은 Gradle 7.6.3부터 8.6까지 완전히 호환됩니다.
단 한 가지 예외를 제외하고 Gradle 버전 8.7부터 8.10까지도 지원됩니다.
Kotlin Multiplatform Gradle 플러그인을 사용하는 경우, JVM 타깃에서 `withJava()` 함수를 호출하는 멀티플랫폼 프로젝트에서 지원 중단 경고가 표시될 수 있습니다.
가능한 한 빨리 이 문제를 해결할 계획입니다.

자세한 내용은 [YouTrack의 관련 이슈](https://youtrack.jetbrains.com/issue/KT-66542)를 참고하세요.

최신 Gradle 릴리스까지의 Gradle 버전도 사용할 수 있지만, 그럴 경우 지원 중단 경고가 발생하거나 일부 새로운 Gradle 기능이 작동하지 않을 수 있습니다.

### 최소 지원 AGP 버전 7.3.1로 상향 {id="minimum-supported-agp-version-bumped-to-7-3-1"}

Kotlin 2.1.0부터 지원되는 최소 Android Gradle 플러그인(AGP) 버전은 7.3.1입니다.

### 최소 지원 Gradle 버전 7.6.3으로 상향 {id="minimum-supported-gradle-version-bumped-to-7-6-3"}

Kotlin 2.1.0부터 지원되는 최소 Gradle 버전은 7.6.3입니다.

### Kotlin Gradle 플러그인 확장을 위한 새로운 API {id="new-api-for-kotlin-gradle-plugin-extensions"}

Kotlin 2.1.0에서는 Kotlin Gradle 플러그인을 구성하기 위한 자체 플러그인을 보다 쉽게 생성할 수 있도록 새로운 API를 도입했습니다.
이 변경으로 `KotlinTopLevelExtension` 및 `KotlinTopLevelExtensionConfig` 인터페이스가 지원 중단되고 플러그인 작성자를 위한 다음 인터페이스가 도입되었습니다.

| 이름                     | 설명                                                                                                                                                                                                                                                          |
|--------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `KotlinBaseExtension`    | 전체 프로젝트에 대한 일반 Kotlin JVM, Android 및 Multiplatform 플러그인 옵션을 구성하기 위한 플러그인 DSL 확장 타입:<list><li>`org.jetbrains.kotlin.jvm`</li><li>`org.jetbrains.kotlin.android`</li><li>`org.jetbrains.kotlin.multiplatform`</li></list> |
| `KotlinJvmExtension`     | 전체 프로젝트에 대한 Kotlin **JVM** 플러그인 옵션을 구성하기 위한 플러그인 DSL 확장 타입.                                                                                                                                                                    |
| `KotlinAndroidExtension` | 전체 프로젝트에 대한 Kotlin **Android** 플러그인 옵션을 구성하기 위한 플러그인 DSL 확장 타입.                                                                                                                                                                |

예를 들어 JVM 및 Android 프로젝트 모두에 대해 컴파일러 옵션을 구성하려면 `KotlinBaseExtension`을 사용합니다.

```kotlin
configure<KotlinBaseExtension> {
    if (this is HasConfigurableKotlinCompilerOptions<*>) {
        with(compilerOptions) {
            if (this is KotlinJvmCompilerOptions) {
                jvmTarget.set(JvmTarget.JVM_17)
            }
        }
    }
}
```

이렇게 하면 JVM 및 Android 프로젝트 모두에 대해 JVM 타깃이 17로 구성됩니다.

JVM 프로젝트 전용 컴파일러 옵션을 구성하려면 `KotlinJvmExtension`을 사용하세요.

```kotlin
configure<KotlinJvmExtension> {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_17)
    }

    target.mavenPublication {
        groupId = "com.example"
        artifactId = "example-project"
        version = "1.0-SNAPSHOT"
    }
}
```

이 예제는 마찬가지로 JVM 프로젝트에 대해 JVM 대상을 17로 구성합니다.
또한 출력이 Maven 리포지토리에 게시되도록 프로젝트에 대한 Maven 발행(publication)도 구성합니다.

`KotlinAndroidExtension`도 완전히 동일한 방식으로 사용할 수 있습니다.

### Kotlin Gradle 플러그인 API에서 컴파일러 심볼 숨김 처리 {id="compiler-symbols-hidden-from-the-kotlin-gradle-plugin-api"}

이전에는 KGP가 런타임 의존성에 `org.jetbrains.kotlin:kotlin-compiler-embeddable`을 포함하여 내부 컴파일러 심볼이 빌드 스크립트 클래스패스에서 노출되었습니다.
이러한 심볼은 내부 전용으로 의도된 것이었습니다.

Kotlin 2.1.0부터 KGP는 `org.jetbrains.kotlin:kotlin-compiler-embeddable` 클래스 파일의 하위 집합을 JAR 파일에 번들로 제공하며 이를 점진적으로 제거합니다.
이 변경 사항은 호환성 문제를 방지하고 KGP 유지 관리를 단순화하는 것을 목표로 합니다.

`kotlinter`와 같은 플러그인 등 빌드 로직의 다른 부분이 KGP와 번들된 버전과 다른 버전의 `org.jetbrains.kotlin:kotlin-compiler-embeddable`에 의존하는 경우 충돌 및 런타임 예외가 발생할 수 있습니다.

이러한 문제를 방지하기 위해 이제 KGP와 함께 빌드 클래스패스에 `org.jetbrains.kotlin:kotlin-compiler-embeddable`이 있는 경우 KGP가 경고를 표시합니다.

장기적인 해결책으로, `org.jetbrains.kotlin:kotlin-compiler-embeddable` 클래스를 사용하는 플러그인 작성자라면 격리된 클래스로더(isolated classloader)에서 실행하는 것이 좋습니다.
예를 들어 클래스로더 또는 프로세스 격리가 포함된 [Gradle Workers API](https://docs.gradle.org/current/userguide/worker_api.html)를 사용하여 이를 달성할 수 있습니다.

#### Gradle Workers API 사용 {id="using-the-gradle-workers-api"}

이 예제는 Gradle 플러그인을 생성하는 프로젝트에서 Kotlin 컴파일러를 안전하게 사용하는 방법을 보여줍니다.
먼저 빌드 스크립트에 컴파일 전용(compile-only) 의존성을 추가합니다.
이렇게 하면 컴파일 타임에만 심볼을 사용할 수 있습니다.

```kotlin
// build.gradle.kts
dependencies {
    compileOnly("org.jetbrains.kotlin:kotlin-compiler-embeddable:%kotlinVersion%")
}
```

다음으로 Kotlin 컴파일러 버전을 출력하는 Gradle 작업 액션(work action)을 정의합니다.

```kotlin
import org.gradle.workers.WorkAction
import org.gradle.workers.WorkParameters
import org.jetbrains.kotlin.config.KotlinCompilerVersion
abstract class ActionUsingKotlinCompiler : WorkAction<WorkParameters.None> {
    override fun execute() {
        println("Kotlin compiler version: ${KotlinCompilerVersion.getVersion()}")
    }
}
```

이제 클래스로더 격리를 사용하여 이 액션을 워커 실행자(worker executor)에 제출하는 태스크를 만듭니다.

```kotlin
import org.gradle.api.DefaultTask
import org.gradle.api.file.ConfigurableFileCollection
import org.gradle.api.tasks.Classpath
import org.gradle.api.tasks.TaskAction
import org.gradle.workers.WorkerExecutor
import javax.inject.Inject
abstract class TaskUsingKotlinCompiler: DefaultTask() {
    @get:Inject
    abstract val executor: WorkerExecutor

    @get:Classpath
    abstract val kotlinCompiler: ConfigurableFileCollection

    @TaskAction
    fun compile() {
        val workQueue = executor.classLoaderIsolation {
            classpath.from(kotlinCompiler)
        }
        workQueue.submit(ActionUsingKotlinCompiler::class.java) {}
    }
}
```

마지막으로 Gradle 플러그인에서 Kotlin 컴파일러 클래스패스를 구성합니다.

```kotlin
import org.gradle.api.Plugin
import org.gradle.api.Project
abstract class MyPlugin: Plugin<Project> {
    override fun apply(target: Project) {
        val myDependencyScope = target.configurations.create("myDependencyScope")
        target.dependencies.add(myDependencyScope.name, "$KOTLIN_COMPILER_EMBEDDABLE:$KOTLIN_COMPILER_VERSION")
        val myResolvableConfiguration = target.configurations.create("myResolvable") {
            extendsFrom(myDependencyScope)
        }
        target.tasks.register("myTask", TaskUsingKotlinCompiler::class.java) {
            kotlinCompiler.from(myResolvableConfiguration)
        }
    }

    companion object {
        const val KOTLIN_COMPILER_EMBEDDABLE = "org.jetbrains.kotlin:kotlin-compiler-embeddable"
        const val KOTLIN_COMPILER_VERSION = "%kotlinVersion%"
    }
}
```

## Compose 컴파일러 업데이트 {id="compose-compiler-updates"}

### 여러 안정성 구성 파일 지원 {id="support-for-multiple-stability-configuration-files"}

Compose 컴파일러는 여러 안정성 구성(stability configuration) 파일을 해석할 수 있지만, 이전에는 Compose Compiler Gradle 플러그인의 `stabilityConfigurationFile` 옵션으로 단일 파일만 지정할 수 있었습니다.
Kotlin 2.1.0에서는 단일 모듈에 여러 안정성 구성 파일을 사용할 수 있도록 이 기능이 재작업되었습니다.

* `stabilityConfigurationFile` 옵션은 지원 중단되었습니다.
* `ListProperty<RegularFile>` 타입의 새로운 옵션 `stabilityConfigurationFiles`가 추가되었습니다.

다음은 새 옵션을 사용하여 Compose 컴파일러에 여러 파일을 전달하는 방법입니다.

```kotlin
// build.gradle.kt
composeCompiler {
    stabilityConfigurationFiles.addAll(
        project.layout.projectDirectory.file("configuration-file1.conf"),
        project.layout.projectDirectory.file("configuration-file2.conf"),
    )
}
```

### 일시 정지 가능한 컴포지션 (Pausable composition) {id="pausable-composition"}

일시 정지 가능한 컴포지션(Pausable composition)은 컴파일러가 건너뛸 수 있는(skippable) 함수를 생성하는 방식을 변경하는 새로운 실험적 기능입니다.
이 기능이 활성화되면 런타임 중 건너뛰는 지점에서 컴포지션을 일시 중단할 수 있으므로 오래 걸리는 컴포지션 프로세스를 여러 프레임에 걸쳐 분할할 수 있습니다.
일시 정지 가능한 컴포지션은 지연 목록(lazy list) 및 기타 성능 집약적 컴포넌트에서 블로킹 방식으로 실행될 때 프레임 드롭을 유발할 수 있는 콘텐츠를 프리페칭(prefetching)하는 데 사용됩니다.

일시 정지 가능한 컴포지션을 사용해 보려면 Compose 컴파일러의 Gradle 구성에 다음 기능 플래그를 추가하세요.

```kotlin
// build.gradle.kts
composeCompiler {
    featureFlags = setOf(
        ComposeFeatureFlag.PausableComposition
    )
}
```

> 이 기능에 대한 런타임 지원은 `androidx.compose.runtime` 버전 1.8.0-alpha02에 추가되었습니다.
> 이전 런타임 버전과 함께 사용할 경우 기능 플래그가 아무런 효과가 없습니다.
>
{style="note"}

### open 및 재정의된 @Composable 함수 변경 사항 {id="changes-to-open-and-overridden-composable-functions"}

가상(virtual: open, abstract 및 재정의된) `@Composable` 함수는 더 이상 재시작 가능(restartable)할 수 없습니다.
재시작 가능한 그룹의 코드 생성은 상속과 함께 [올바르게 작동하지 않아](https://issuetracker.google.com/329477544) 런타임 충돌을 일으키는 호출을 생성하고 있었습니다.

즉, 가상 함수는 재시작되거나 건너뛰어지지 않습니다.
상태가 무효화될 때마다 런타임은 대신 부모 composable을 재구성(recompose)합니다.
코드가 재구성에 민감한 경우 런타임 동작의 변화를 느낄 수 있습니다.

### 성능 향상 {id="performance-improvements"}

Compose 컴파일러는 `@Composable` 타입을 변환하기 위해 모듈 IR의 전체 사본을 생성하곤 했습니다.
Compose와 관련 없는 요소를 복사할 때 메모리 소비가 증가하는 것 외에도 이 동작은 [특정 엣지 케이스](https://issuetracker.google.com/365066530)에서 다운스트림 컴파일러 플러그인을 중단시키기도 했습니다.

이 복사 작업이 제거되어 잠재적으로 컴파일 시간이 단축되었습니다.

## 표준 라이브러리 {id="standard-library"}

### 표준 라이브러리 API의 지원 중단 심각도 변경 {id="changes-to-the-deprecation-severity-of-standard-library-apis"}

Kotlin 2.1.0에서는 여러 표준 라이브러리 API의 지원 중단(deprecation) 심각도 수준을 경고(warning)에서 오류(error)로 상향 조정합니다.
코드가 이러한 API에 의존하는 경우 호환성을 유지하기 위해 업데이트해야 합니다.
가장 주목할 만한 변경 사항은 다음과 같습니다.

* **`Char` 및 `String`에 대한 로캘 구분 대소문자 변환 함수 지원 중단:**
  `Char.toLowerCase()`, `Char.toUpperCase()`, `String.toUpperCase()`,
  `String.toLowerCase()`와 같은 함수는 이제 사용이 중단되었으며 이를 사용하면 오류가 발생합니다.
  로캘에 구애받지 않는 대체 함수나 다른 대소문자 변환 메커니즘으로 대체하세요.
  기본 로캘을 계속 사용하려면 `String.toLowerCase()`와 같은 호출을 로캘을 명시적으로 지정하는 `String.lowercase(Locale.getDefault())`로 대체하세요.
  로캘과 무관한 변환의 경우 기본적으로 불변(invariant) 로캘을 사용하는 `String.lowercase()`로 대체하세요.

* **Kotlin/Native 동결(freezing) API 지원 중단:**
  이전에 `@FreezingIsDeprecated` 애노테이션으로 표시되었던 동결 관련 선언을 사용하면 이제 오류가 발생합니다.
  이 변경 사항은 스레드 간 객체 공유를 위해 객체를 동결해야 했던 Kotlin/Native의 레거시 메모리 관리자로부터의 전환을 반영합니다.
  새 메모리 모델에서 동결 관련 API로부터 마이그레이션하는 방법을 알아보려면 [Kotlin/Native 마이그레이션 가이드](native-migration-guide.md#update-your-code)를 참고하세요.
  자세한 내용은 [동결 지원 중단 발표](whatsnew1720.md#freezing)를 참고하세요.

* **`appendLine()`을 선호하여 `appendln()` 지원 중단:**
  `StringBuilder.appendln()` 및 `Appendable.appendln()` 함수는 이제 지원이 중단되었으며 이를 사용하면 오류가 발생합니다.
  대신 `StringBuilder.appendLine()` 또는 `Appendable.appendLine()` 함수를 사용하세요.
  `appendln()` 함수는 Kotlin/JVM에서 OS마다 기본값이 다른 `line.separator` 시스템 속성을 사용하기 때문에 지원이 중단되었습니다. Kotlin/JVM에서 이 속성은 Windows에서는 기본적으로 `\r\n`(CR LF)이고 다른 시스템에서는 `\n`(LF)입니다.
  반면 `appendLine()` 함수는 줄 구분 기호로 일관되게 `\n`(LF)을 사용하여 플랫폼 전반에 걸쳐 일관된 동작을 보장합니다.

이번 릴리스에서 영향을 받는 전체 API 목록은 [KT-71628](https://youtrack.jetbrains.com/issue/KT-71628) YouTrack 이슈를 참고하세요.

### java.nio.file.Path를 위한 안정적인 파일 트리 순회 확장 {id="stable-file-tree-traversal-extensions-for-java-nio-file-path"}

Kotlin 1.7.20에서는 파일 트리를 탐색할 수 있는 `java.nio.file.Path` 클래스용 실험적 [확장 함수](extensions.md#extension-functions)를 도입했습니다.
Kotlin 2.1.0에서는 다음과 같은 파일 트리 순회 확장이 이제 [안정화(Stable)](components-stability.md#stability-levels-explained)되었습니다.

* `walk()`는 지정된 경로를 루트로 하는 파일 트리를 지연(lazily) 순회합니다.
* `fileVisitor()`를 사용하면 `FileVisitor`를 별도로 생성할 수 있습니다.
  `FileVisitor`는 순회 중에 디렉터리와 파일에 대해 수행할 작업을 지정합니다.
* `visitFileTree(fileVisitor: FileVisitor, ...)`는 파일 트리를 순회하여 발견된 각 항목에서 지정된 `FileVisitor`를 호출하며, 내부적으로 `java.nio.file.Files.walkFileTree()` 함수를 사용합니다.
* `visitFileTree(..., builderAction: FileVisitorBuilder.() -> Unit)`는 제공된 `builderAction`을 사용하여 `FileVisitor`를 생성하고 `visitFileTree(fileVisitor, ...)` 함수를 호출합니다.
* `sealed interface FileVisitorBuilder`를 통해 커스텀 `FileVisitor` 구현을 정의할 수 있습니다.
* `enum class PathWalkOption`은 `Path.walk()` 함수를 위한 순회 옵션을 제공합니다.

아래 예제는 이러한 파일 순회 API를 사용하여 파일 및 디렉터리 방문에 대한 특정 작업을 정의할 수 있는 커스텀 `FileVisitor` 동작을 생성하는 방법을 보여줍니다.

예를 들어 `FileVisitor`를 명시적으로 생성하고 나중에 사용할 수 있습니다.

```kotlin
val cleanVisitor = fileVisitor {
    onPreVisitDirectory { directory, attributes ->
        // 플레이스홀더: 디렉터리 방문 시 로직 추가
        FileVisitResult.CONTINUE
    }

    onVisitFile { file, attributes ->
        // 플레이스홀더: 파일 방문 시 로직 추가
        FileVisitResult.CONTINUE
    }
}

// 플레이스홀더: 순회 전 일반적인 설정을 위한 로직을 여기에 추가
projectDirectory.visitFileTree(cleanVisitor)
```

`builderAction`을 사용하여 `FileVisitor`를 생성하고 순회에 즉시 사용할 수도 있습니다.

```kotlin
projectDirectory.visitFileTree {
    // builderAction 정의:
    onPreVisitDirectory { directory, attributes ->
        // 디렉터리 방문 시 일부 로직
        FileVisitResult.CONTINUE
    }

    onVisitFile { file, attributes ->
        // 파일 방문 시 일부 로직
        FileVisitResult.CONTINUE
    }
}
```

또한 `walk()` 함수를 사용하여 지정된 경로를 루트로 하는 파일 트리를 순회할 수 있습니다.

```kotlin
fun traverseFileTree() {
    val cleanVisitor = fileVisitor {
        onPreVisitDirectory { directory, _ ->
            if (directory.name == "build") {
                directory.toFile().deleteRecursively()
                FileVisitResult.SKIP_SUBTREE
            } else {
                FileVisitResult.CONTINUE
            }
        }

        // .class 확장자를 가진 파일 삭제
        onVisitFile { file, _ ->
            if (file.extension == "class") {
                file.deleteExisting()
            }
            FileVisitResult.CONTINUE
        }
    }

    // 루트 디렉터리 및 파일 설정
    val rootDirectory = createTempDirectory("Project")

    // A.kt 및 A.class 파일이 포함된 src 디렉터리 생성
    rootDirectory.resolve("src").let { srcDirectory ->
        srcDirectory.createDirectory()
        srcDirectory.resolve("A.kt").createFile()
        srcDirectory.resolve("A.class").createFile()
    }

    // Project.jar 파일이 포함된 build 디렉터리 생성
    rootDirectory.resolve("build").let { buildDirectory ->
        buildDirectory.createDirectory()
        buildDirectory.resolve("Project.jar").createFile()
    }

    // walk() 함수 사용:
    val directoryStructure = rootDirectory.walk(PathWalkOption.INCLUDE_DIRECTORIES)
        .map { it.relativeTo(rootDirectory).toString() }
        .toList().sorted()
    println(directoryStructure)
    // "[, build, build/Project.jar, src, src/A.class, src/A.kt]"
  
    // rootDirectory.visitFileTree(cleanVisitor) 정리 규칙을 적용하여 cleanVisitor로 파일 트리 순회
    val directoryStructureAfterClean = rootDirectory.walk(PathWalkOption.INCLUDE_DIRECTORIES)
        .map { it.relativeTo(rootDirectory).toString() }
        .toList().sorted()
    println(directoryStructureAfterClean)
    // "[, src, src/A.kt]"
}
```

## 문서 업데이트 {id="documentation-updates"}

Kotlin 문서에 몇 가지 주목할 만한 변경 사항이 있습니다.

### 언어 개념 {id="language-concepts"}

* 개선된 [Null 안전성](null-safety.md) 페이지 – 코드에서 `null` 값을 안전하게 처리하는 방법을 알아보세요.
* 개선된 [객체 선언 및 표현식](object-declarations.md) 페이지 – 단일 단계로 클래스를 정의하고 인스턴스를 생성하는 방법을 알아보세요.
* 개선된 [When 표현식 및 문](control-flow.md#when-expressions-and-statements) 섹션 – `when` 조건문과 이를 사용하는 방법을 알아보세요.
* 업데이트된 [Kotlin 로드맵](roadmap.md), [Kotlin 진화 원칙](kotlin-evolution-principles.md) 및 [Kotlin 언어 기능 및 제안서](kotlin-language-features-and-proposals.md) 페이지 – Kotlin의 향후 계획, 지속적인 개발 및 가이드 원칙에 대해 알아보세요.

### Compose 컴파일러 {id="compose-compiler"}

* 이제 컴파일러 및 플러그인 섹션에 위치한 [Compose 컴파일러 문서](compose-compiler-migration-guide.md) – Compose 컴파일러, 컴파일러 옵션 및 마이그레이션 단계에 대해 알아보세요.

### API 레퍼런스 {id="api-references"}

* 새로운 [Kotlin Gradle 플러그인 API 레퍼런스](https://kotlinlang.org/api/kotlin-gradle-plugin) – Kotlin Gradle 플러그인 및 Compose 컴파일러 Gradle 플러그인에 대한 API 레퍼런스를 살펴보세요.

### 멀티플랫폼 개발 {id="multiplatform-development"}

* 새로운 [멀티플랫폼용 Kotlin 라이브러리 구축](https://kotlinlang.org/docs/api-guidelines-build-for-multiplatform.html) 페이지 – Kotlin Multiplatform용 Kotlin 라이브러리를 설계하는 방법을 알아보세요.
* 새로운 [Kotlin Multiplatform 소개](https://kotlinlang.org/docs/multiplatform/get-started.html) 페이지 – Kotlin Multiplatform의 주요 개념, 의존성, 라이브러리 등에 대해 알아보세요.
* 새로운 [iOS 통합](https://kotlinlang.org/docs/multiplatform/multiplatform-ios-integration-overview.html) 섹션 – Kotlin Multiplatform 공유 모듈을 iOS 앱에 통합하는 방법을 알아보세요.
* 새로운 [Kotlin/Native 정의 파일](native-definition-file.md) 페이지 – C 및 Objective-C 라이브러리를 사용하기 위한 정의 파일을 만드는 방법을 알아보세요.
* [WASI 시작하기](wasm-wasi.md) – 다양한 WebAssembly 가상 머신에서 WASI를 사용하여 간단한 Kotlin/Wasm 애플리케이션을 실행하는 방법을 알아보세요.

### 도구 {id="tooling"}

* [새로운 Dokka 마이그레이션 가이드](dokka-migration.md) – Dokka Gradle 플러그인 v2로 마이그레이션하는 방법을 알아보세요.

## Kotlin 2.1.0 호환성 가이드 {id="compatibility-guide-for-kotlin-2-1-0"}

Kotlin 2.1.0은 기능 릴리스이므로 이전 버전의 언어로 작성된 코드와 호환되지 않는 변경 사항이 발생할 수 있습니다.
이러한 변경 사항의 자세한 목록은 [Kotlin 2.1.0 호환성 가이드](compatibility-guide-21.md)에서 확인하세요.

## Kotlin 2.1.0 설치 {id="install-kotlin-2-1-0"}

IntelliJ IDEA 2023.3 및 Android Studio Iguana (2023.2.1) Canary 15부터 Kotlin 플러그인은 IDE에 번들 플러그인으로 포함되어 배포됩니다. 즉, 더 이상 JetBrains Marketplace에서 플러그인을 설치할 수 없습니다.

새 Kotlin 버전으로 업데이트하려면 빌드 스크립트에서 [Kotlin 버전을 2.1.0으로 변경](releases.md#update-to-a-new-kotlin-version)하세요.