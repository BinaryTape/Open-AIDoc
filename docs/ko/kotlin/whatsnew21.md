)가 문자열 리터럴 내에서 처리되는 방식을 개선했습니다.
이 기능은 템플릿 엔진, JSON 스키마 또는 기타 데이터 형식과 같이 여러 개의 달러 기호가 필요한 컨텍스트에서 유용합니다.

Kotlin의 문자열 보간은 단일 달러 기호를 사용합니다.
그러나 금융 데이터나 템플릿 시스템에서 흔히 볼 수 있듯이 문자열 내에서 달러 기호를 그대로 사용하려면 `${'
'}`와 같은 우회 방법이 필요했습니다.
멀티 달러 보간 기능을 활성화하면 보간을 트리거하는 달러 기호의 개수를 구성할 수 있으며, 그보다 적은 개수의 달러 기호는 일반 문자열 리터럴로 처리됩니다.

다음은 멀티 달러 보간을 사용하여 자리표시자가 있는 JSON 스키마 멀티라인 문자열을 생성하는 예시입니다.

```kotlin
val `KClass<*>`.jsonSchema : String
    get() = $"""
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "$id": "https://example.com/product.schema.json",
      "$dynamicAnchor": "meta"
      "title": "${simpleName ?: qualifiedName ?: "unknown"}",
      "type": "object"
    }
    """
```

이 예시에서 시작 부분의 `$`는 보간을 트리거하기 위해 **두 개의 달러 기호**(`$`)가 필요함을 의미합니다.
따라서 `$schema`, `$id`, `$dynamicAnchor`가 보간 마커로 해석되는 것을 방지합니다.

이 접근 방식은 자리표시자 구문에 달러 기호를 사용하는 시스템과 함께 작업할 때 특히 유용합니다.

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

코드가 이미 단일 달러 기호를 사용하는 표준 문자열 보간을 사용하고 있다면 변경할 필요가 없습니다.
문자열에 리터럴 달러 기호가 필요할 때마다 `$`를 사용할 수 있습니다.

### API 확장을 위한 옵트인 요구 지원

Kotlin 2.1.0은 [`@SubclassOptInRequired`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-subclass-opt-in-required/) 어노테이션을 도입했습니다.
이 어노테이션을 통해 라이브러리 작성자는 사용자가 실험적인 인터페이스를 구현하거나 실험적인 클래스를 확장하기 전에 명시적인 옵트인(opt-in)을 요구할 수 있습니다.

이 기능은 라이브러리 API가 사용하기에는 충분히 안정적이지만 새로운 추상 함수와 함께 발전할 가능성이 있어, 상속 측면에서는 불안정할 수 있는 경우에 유용합니다.

API 요소에 옵트인 요구 사항을 추가하려면 어노테이션 클래스에 대한 참조와 함께 `@SubclassOptInRequired` 어노테이션을 사용하세요.

```kotlin
@RequiresOptIn(
level = RequiresOptIn.Level.WARNING,
message = "이 라이브러리의 인터페이스는 실험적입니다"
)
annotation class UnstableApi()

@SubclassOptInRequired(UnstableApi::class)
interface CoreLibraryApi
```

이 예시에서 `CoreLibraryApi` 인터페이스는 사용자가 이를 구현하기 전에 옵트인할 것을 요구합니다.
사용자는 다음과 같이 옵트인할 수 있습니다.

```kotlin
@OptIn(UnstableApi::class)
interface MyImplementation: CoreLibraryApi
```

> `@SubclassOptInRequired` 어노테이션을 사용하여 옵트인을 요구할 때, 이 요구 사항은 [내부 클래스나 중첩 클래스](nested-classes.md)로 전파되지 않습니다.
>
{style="note"}

사용자 API에서 `@SubclassOptInRequired` 어노테이션을 사용하는 실제 사례는 `kotlinx.coroutines` 라이브러리의 [`SharedFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/) 인터페이스를 확인하세요.

### 제네릭 타입을 가진 함수에 대한 오버로드 해소 개선

이전에는 어떤 함수 오버로드들이 제네릭 타입의 값 파라미터를 가지고 있고, 다른 오버로드들이 같은 위치에 함수 타입을 가지고 있는 경우, 해소(resolution) 동작이 때때로 일관되지 않을 수 있었습니다.

이로 인해 오버로드가 멤버 함수인지 확장 함수인지에 따라 동작이 달라지는 경우가 있었습니다. 예시는 다음과 같습니다.

```kotlin
class KeyValueStore<K, V> {
    fun store(key: K, value: V) {} // 1
    fun store(key: K, lazyValue: () -> V) {} // 2
}

fun <K, V> KeyValueStore<K, V>.storeExtension(key: K, value: V) {} // 1 
fun <K, V> KeyValueStore<K, V>.storeExtension(key: K, lazyValue: () -> V) {} // 2

fun test(kvs: KeyValueStore<String, Int>) {
    // 멤버 함수
    kvs.store("", 1)    // 1로 해소됨
    kvs.store("") { 1 } // 2로 해소됨

    // 확장 함수
    kvs.storeExtension("", 1)    // 1로 해소됨
    kvs.storeExtension("") { 1 } // 해소되지 않음
}
```

이 예시에서 `KeyValueStore` 클래스는 `store()` 함수에 대해 두 개의 오버로드를 가지고 있습니다. 하나는 제네릭 타입 `K`와 `V`를 가진 함수 파라미터를 가지고 있고, 다른 하나는 제네릭 타입 `V`를 반환하는 람다 함수를 가지고 있습니다. 마찬가지로 확장 함수 `storeExtension()`에 대해서도 두 개의 오버로드가 있습니다.

`store()` 함수가 람다 함수와 함께 호출되거나 람다 없이 호출될 때 컴파일러는 올바른 오버로드를 성공적으로 해소했습니다. 그러나 확장 함수 `storeExtension()`이 람다 함수와 함께 호출될 때, 컴파일러는 두 오버로드 모두 적용 가능한 것으로 잘못 간주하여 올바른 오버로드를 해소하지 못했습니다.

이 문제를 해결하기 위해 새로운 휴리스틱(heuristic)을 도입했습니다. 이를 통해 컴파일러는 다른 인자의 정보를 바탕으로 제네릭 타입의 함수 파라미터가 람다 함수를 수용할 수 없을 때 가능한 오버로드를 제외할 수 있습니다. 이 변경으로 멤버 함수와 확장 함수의 동작이 일관되게 되었으며, Kotlin 2.1.0에서 기본적으로 활성화됩니다.

### 봉인된 클래스를 사용하는 when 표현식의 완전성 검사 개선

이전 버전의 Kotlin에서 컴파일러는 `sealed class` 계층 구조의 모든 사례가 처리되었더라도 봉인된 상한(sealed upper bounds)을 가진 타입 파라미터에 대해 `when` 표현식에서 `else` 분기를 요구했습니다.
이 동작이 Kotlin 2.1.0에서 개선되었습니다.
이제 완전성(exhaustiveness) 검사가 더욱 강력해져 불필요한 `else` 분기를 제거할 수 있으며, 이를 통해 `when` 표현식을 더욱 깔끔하고 직관적으로 유지할 수 있습니다.

변경 사항을 보여주는 예시는 다음과 같습니다.

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

## Kotlin K2 컴파일러

Kotlin 2.1.0의 K2 컴파일러는 [컴파일러 검사](#extra-compiler-checks) 및 [경고](#global-warning-suppression) 작업 시 더 많은 유연성을 제공하며, [kapt 플러그인에 대한 지원 개선](#improved-k2-kapt-implementation)을 포함합니다.

### 추가 컴파일러 검사

Kotlin 2.1.0부터 K2 컴파일러에서 추가적인 검사를 활성화할 수 있습니다.
이러한 검사들은 선언, 표현식, 타입에 대한 추가 검사로, 일반적으로 컴파일에 필수적이지는 않지만 다음과 같은 경우를 검증하려는 경우 유용할 수 있습니다.

| 검사 유형 | 설명 |
|-------------------------------------------------------|------------------------------------------------------------------------------------------|
| `REDUNDANT_NULLABLE` | `Boolean?` 대신 `Boolean??`가 사용됨 |
| `PLATFORM_CLASS_MAPPED_TO_KOTLIN` | `kotlin.String` 대신 `java.lang.String`이 사용됨 |
| `ARRAY_EQUALITY_OPERATOR_CAN_BE_REPLACED_WITH_EQUALS` | `arrayOf("").contentEquals(arrayOf(""))` 대신 `arrayOf("") == arrayOf("")`가 사용됨 |
| `REDUNDANT_CALL_OF_CONVERSION_METHOD` | `42` 대신 `42.toInt()`가 사용됨 |
| `USELESS_CALL_ON_NOT_NULL` | `""` 대신 `"".orEmpty()`가 사용됨 |
| `REDUNDANT_SINGLE_EXPRESSION_STRING_TEMPLATE` | `string` 대신 `"$string"`이 사용됨 |
| `UNUSED_ANONYMOUS_PARAMETER` | 람다 표현식에서 파라미터가 전달되었지만 전혀 사용되지 않음 |
| `REDUNDANT_VISIBILITY_MODIFIER` | `class Klass` 대신 `public class Klass`가 사용됨 |
| `REDUNDANT_MODALITY_MODIFIER` | `class Klass` 대신 `final class Klass`가 사용됨 |
| `REDUNDANT_SETTER_PARAMETER_TYPE` | `set(value)` 대신 `set(value: Int)`가 사용됨 |
| `CAN_BE_VAL` | `var local = 0`이 정의되었지만 다시 할당되지 않음, `val local = 42`로 변경 가능 |
| `ASSIGNED_VALUE_IS_NEVER_READ` | `val local = 42`가 정의되었지만 이후 코드에서 사용되지 않음 |
| `UNUSED_VARIABLE` | `val local = 0`이 정의되었지만 코드에서 전혀 사용되지 않음 |
| `REDUNDANT_RETURN_UNIT_TYPE` | `fun foo() {}` 대신 `fun foo(): Unit {}`이 사용됨 |
| `UNREACHABLE_CODE` | 코드 문이 존재하지만 절대 실행될 수 없음 |

검사 결과가 참이면, 문제 해결 방법에 대한 제안과 함께 컴파일러 경고가 표시됩니다.

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

컴파일러 옵션을 정의하고 사용하는 방법에 대한 자세한 내용은 [Kotlin Gradle 플러그인의 컴파일러 옵션](gradle-compiler-options.md)을 참조하세요.

### 전역 경고 억제

2.1.0에서 Kotlin 컴파일러에 전역적으로 경고를 억제할 수 있는 기능이 추가되었습니다.

이제 명령줄에서 `-Xsuppress-warning=WARNING_NAME` 구문을 사용하거나 빌드 파일의 `compilerOptions {}` 블록에서 `freeCompilerArgs` 속성을 사용하여 프로젝트 전체에서 특정 경고를 억제할 수 있습니다.

예를 들어 프로젝트에 [추가 컴파일러 검사](#extra-compiler-checks)가 활성화되어 있지만 그중 하나를 억제하고 싶다면 다음과 같이 사용합니다.

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        extraWarnings.set(true)
        freeCompilerArgs.add("-Xsuppress-warning=CAN_BE_VAL")
    }
}
```

경고를 억제하고 싶지만 이름을 모르는 경우, 해당 요소를 선택하고 전구 아이콘을 클릭하거나 단축키(<shortcut>Cmd + Enter</shortcut>/<shortcut>Alt + Enter</shortcut>)를 사용하세요.

![Warning name intention](warning-name-intention.png){width=500}

새로운 컴파일러 옵션은 현재 [실험적(Experimental)](components-stability.md#stability-levels-explained) 단계입니다. 또한 다음 사항에 유의하세요.

* 오류(Error) 억제는 허용되지 않습니다.
* 알 수 없는 경고 이름을 전달하면 컴파일 오류가 발생합니다.
* 여러 경고를 한 번에 지정할 수 있습니다.
  
   <tabs>
   <tab title="Command line">

   ```bash
   kotlinc -Xsuppress-warning=NOTHING_TO_INLINE -Xsuppress-warning=NO_TAIL_CALLS_FOUND main.kt
   ```

   </tab>
   <tab title="Build file">

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

### 개선된 K2 kapt 구현

> K2 컴파일러용 kapt 플러그인(K2 kapt)은 [알파(Alpha)](components-stability.md#stability-levels-explained) 단계입니다.
> 언제든지 변경될 수 있습니다.
> 
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-71439/K2-kapt-feedback)을 통해 여러분의 피드백을 기다립니다.
>
{style="warning"}

현재 [kapt](kapt.md) 플러그인을 사용하는 프로젝트는 기본적으로 K1 컴파일러와 함께 작동하며, Kotlin 버전 1.9까지 지원합니다.

Kotlin 1.9.20에서 K2 컴파일러와 함께 작동하는 kapt 플러그인의 실험적 구현(K2 kapt)을 출시했습니다. 이제 기술 및 성능 문제를 완화하기 위해 K2 kapt의 내부 구현을 개선했습니다.

새로운 K2 kapt 구현은 새로운 기능을 도입하지는 않지만, 이전 K2 kapt 구현에 비해 성능이 크게 향상되었습니다. 또한 K2 kapt 플러그인의 동작이 이제 K1 kapt와 훨씬 더 가까워졌습니다.

새로운 K2 kapt 플러그인 구현을 사용하려면 이전 K2 kapt 플러그인을 활성화했던 것과 동일하게 활성화하면 됩니다. 프로젝트의 `gradle.properties` 파일에 다음 옵션을 추가하세요.

```kotlin
kapt.use.k2=true
```

향후 출시될 버전에서는 K1 kapt 대신 K2 kapt 구현이 기본적으로 활성화될 예정이므로, 더 이상 수동으로 활성화할 필요가 없게 됩니다.

새로운 구현이 안정화되기 전에 여러분의 [피드백](https://youtrack.jetbrains.com/issue/KT-71439/K2-kapt-feedback)을 보내주시면 큰 도움이 됩니다.

### 부호 없는 타입과 비원시 타입 간의 오버로드 충돌 해소

이번 릴리스에서는 이전 버전에서 부호 없는(unsigned) 타입과 비원시(non-primitive) 타입에 대해 함수가 오버로드되었을 때 발생할 수 있었던 오버로드 충돌 해소 문제를 해결했습니다.

#### 오버로드된 확장 함수

```kotlin
fun Any.doStuff() = "Any"
fun UByte.doStuff() = "UByte"

fun main() {
    val uByte: UByte = UByte.MIN_VALUE
    uByte.doStuff() // Kotlin 2.1.0 이전에는 오버로드 해소 모호성 발생
}
```

이전 버전에서 `uByte.doStuff()`를 호출하면 `Any`와 `UByte` 확장 함수가 모두 적용 가능하여 모호성이 발생했습니다.

#### 오버로드된 최상위 함수

```kotlin
fun doStuff(value: Any) = "Any"
fun doStuff(value: UByte) = "UByte"

fun main() {
    val uByte: UByte = UByte.MIN_VALUE
    doStuff(uByte) // Kotlin 2.1.0 이전에는 오버로드 해소 모호성 발생
}
```

마찬가지로 `doStuff(uByte)` 호출 시 컴파일러가 `Any` 버전과 `UByte` 버전 중 무엇을 사용할지 결정하지 못해 모호했습니다. 2.1.0부터는 컴파일러가 이러한 사례를 올바르게 처리하며, 더 구체적인 타입(이 경우 `UByte`)에 우선순위를 두어 모호성을 해소합니다.

## Kotlin/JVM

버전 2.1.0부터 컴파일러는 Java 23 바이트코드를 포함하는 클래스를 생성할 수 있습니다.

### JSpecify nullability 불일치 진단 심각도를 strict로 변경

Kotlin 2.1.0은 `org.jspecify.annotations`의 nullability 어노테이션에 대해 엄격한 처리를 강제하여, Java 상호운용성에 대한 타입 안전성을 개선합니다.

다음 nullability 어노테이션들이 영향을 받습니다.

* `org.jspecify.annotations.Nullable`
* `org.jspecify.annotations.NonNull`
* `org.jspecify.annotations.NullMarked`
* `org.jspecify.nullness`에 포함된 레거시 어노테이션 (JSpecify 0.2 및 이전 버전)

Kotlin 2.1.0부터 nullability 불일치는 기본적으로 경고(warning)에서 오류(error)로 격상됩니다. 이를 통해 `@NonNull` 및 `@Nullable`과 같은 어노테이션이 타입 검사 중에 강제 적용되어, 런타임에 예상치 못한 nullability 문제가 발생하는 것을 방지합니다.

`@NullMarked` 어노테이션 또한 해당 스코프 내의 모든 멤버의 nullability에 영향을 미치므로, 어노테이션이 지정된 Java 코드로 작업할 때 동작을 더 예측 가능하게 만듭니다.

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
    // Non-null 결과에 액세스하며, 허용됨
    sjc.foo().length

    // 결과가 nullable이므로 기본 strict 모드에서 오류 발생
    // 오류를 방지하려면 ?.length를 사용하세요.
    sjc.bar().length
}
```

이러한 어노테이션에 대한 진단 심각도를 수동으로 제어할 수 있습니다. `-Xnullability-annotations` 컴파일러 옵션을 사용하여 모드를 선택하세요.

* `ignore`: nullability 불일치를 무시합니다.
* `warning`: nullability 불일치에 대해 경고를 보고합니다.
* `strict`: nullability 불일치에 대해 오류를 보고합니다 (기본 모드).

자세한 내용은 [Nullability annotations](java-interop.md#nullability-annotations)를 참조하세요.

## Kotlin Multiplatform

Kotlin 2.1.0은 [Swift 내보내기 기본 지원](#basic-support-for-swift-export)을 도입하고, [어느 호스트에서든 Kotlin Multiplatform 라이브러리를 더 쉽게 게시](#ability-to-publish-kotlin-libraries-from-any-host)할 수 있도록 개선되었습니다. 또한 [컴파일러 옵션 구성을 위한 새로운 DSL](#new-gradle-dsl-for-compiler-options-in-multiplatform-projects-promoted-to-stable)을 안정화하고 [격리된 프로젝트(Isolated Projects) 기능의 미리보기](#preview-gradle-s-isolated-projects-in-kotlin-multiplatform)를 제공하는 등 Gradle 관련 개선 사항에 집중했습니다.

### 멀티플랫폼 프로젝트용 컴파일러 옵션의 새로운 Gradle DSL 안정화

Kotlin 2.0.0에서 [멀티플랫폼 프로젝트 전반의 컴파일러 옵션 구성을 단순화하기 위해 새로운 실험적 Gradle DSL을 도입](whatsnew20.md#new-gradle-dsl-for-compiler-options-in-multiplatform-projects)했습니다. Kotlin 2.1.0에서는 이 DSL이 안정화되었습니다.

이제 전체 프로젝트 구성은 세 개의 계층으로 나뉩니다. 가장 높은 레벨은 확장(extension) 레벨이고, 그다음은 타겟(target) 레벨, 가장 낮은 레벨은 컴파일 유닛(일반적으로 컴파일 태스크)입니다.

![Kotlin compiler options levels](compiler-options-levels.svg){width=700}

다양한 레벨과 레벨 간 컴파일러 옵션 구성 방법에 대해 자세히 알아보려면 [컴파일러 옵션](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#compiler-options)을 참조하세요.

### Kotlin Multiplatform에서 Gradle의 격리된 프로젝트 미리보기

> 이 기능은 [실험적(Experimental)](components-stability.md#stability-levels-explained)이며 현재 Gradle에서는 프리 알파(pre-Alpha) 상태입니다.
> Gradle 버전 8.10에서 평가 목적으로만 사용하세요. 이 기능은 언제든지 중단되거나 변경될 수 있습니다.
> 
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-57279/Support-Gradle-Project-Isolation-Feature-for-Kotlin-Multiplatform)을 통해 여러분의 피드백을 기다립니다.
> 옵트인이 필요합니다(자세한 내용은 아래 참조).
>
{style="warning"}

Kotlin 2.1.0에서는 멀티플랫폼 프로젝트에서 Gradle의 [격리된 프로젝트(Isolated Projects)](https://docs.gradle.org/current/userguide/isolated_projects.html) 기능을 미리 사용할 수 있습니다.

Gradle의 격리된 프로젝트 기능은 개별 Gradle 프로젝트의 구성을 서로 "격리"함으로써 빌드 성능을 향상시킵니다. 각 프로젝트의 빌드 로직은 다른 프로젝트의 가변 상태에 직접 액세스하는 것이 제한되어 병렬로 안전하게 실행될 수 있습니다. 이 기능을 지원하기 위해 Kotlin Gradle 플러그인 모델을 일부 변경했으며, 이번 미리보기 기간 동안 여러분의 경험을 듣고 싶습니다.

Kotlin Gradle 플러그인의 새로운 모델을 활성화하는 방법은 두 가지입니다.

* 옵션 1: **격리된 프로젝트 기능을 활성화하지 않고 호환성 테스트** –
  격리된 프로젝트 기능을 활성화하지 않고 Kotlin Gradle 플러그인의 새로운 모델과의 호환성을 확인하려면, 프로젝트의 `gradle.properties` 파일에 다음 Gradle 속성을 추가하세요.

  ```none
  # gradle.properties
  kotlin.kmp.isolated-projects.support=enable
  ```

* 옵션 2: **격리된 프로젝트 기능을 활성화하여 테스트** –
  Gradle에서 격리된 프로젝트 기능을 활성화하면 Kotlin Gradle 플러그인이 새로운 모델을 사용하도록 자동으로 구성됩니다. 격리된 프로젝트 기능을 활성화하려면 [시스템 속성을 설정](https://docs.gradle.org/current/userguide/isolated_projects.html#how_do_i_use_it)하세요. 이 경우 프로젝트에 Kotlin Gradle 플러그인용 Gradle 속성을 추가할 필요가 없습니다.

### Swift 내보내기 기본 지원

> 이 기능은 현재 개발 초기 단계에 있습니다. 언제든지 중단되거나 변경될 수 있습니다.
> 옵트인이 필요하며(자세한 내용은 아래 참조), 평가 목적으로만 사용해야 합니다.
> [YouTrack](https://kotl.in/issue)을 통해 여러분의 피드백을 기다립니다.
> 
{style="warning"}

버전 2.1.0은 Kotlin에서 Swift 내보내기(Swift export)를 지원하기 위한 첫 번째 단계를 밟아, Objective-C 헤더를 사용하지 않고 Kotlin 소스를 Swift 인터페이스로 직접 내보낼 수 있게 합니다. 이는 Apple 타겟을 위한 멀티플랫폼 개발을 더욱 쉽게 만들어 줄 것입니다.

현재 제공되는 기본 지원에는 다음 기능이 포함됩니다.

* Kotlin의 여러 Gradle 모듈을 Swift로 직접 내보내기.
* `moduleName` 속성으로 커스텀 Swift 모듈 이름 정의.
* `flattenPackage` 속성으로 패키지 구조에 대한 축소(collapse) 규칙 설정.

프로젝트에서 Swift 내보내기를 설정하기 위한 시작점으로 다음 빌드 파일을 사용할 수 있습니다.

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
        // 생성된 Swift 코드에서 패키지 접두사 제거
        flattenPackage = "com.example.sandbox"

        // 외부 모듈 내보내기
        export(project(":subproject")) {
            // 내보낸 모듈 이름
            moduleName = "Subproject"
            // 내보낸 종속성 축소 규칙
            flattenPackage = "com.subproject.library"
        }
    }
}
```

Swift 내보내기가 이미 설정된 [공식 샘플](https://github.com/Kotlin/swift-export-sample)을 클론할 수도 있습니다.

컴파일러는 필요한 모든 파일(`swiftmodule` 파일, 정적 `a` 라이브러리, 헤더 및 `modulemap` 파일 포함)을 자동으로 생성하고 앱의 빌드 디렉토리에 복사하며, 이를 Xcode에서 액세스할 수 있습니다.

#### Swift 내보내기 활성화 방법

이 기능은 현재 개발 초기 단계임을 유의하세요.

Swift 내보내기는 현재 iOS 프레임워크를 Xcode 프로젝트에 연결하기 위해 [직접 통합(direct integration)](https://kotlinlang.org/docs/multiplatform/multiplatform-direct-integration.html)을 사용하는 프로젝트에서 작동합니다. 이는 Android Studio 또는 [웹 위자드](https://kmp.jetbrains.com/)를 통해 생성된 Kotlin Multiplatform 프로젝트의 표준 구성입니다.

프로젝트에서 Swift 내보내기를 사용해 보려면:

1. `gradle.properties` 파일에 다음 Gradle 옵션을 추가하세요.

   ```none
   # gradle.properties
   kotlin.experimental.swift-export.enabled=true
   ```

2. Xcode에서 프로젝트 설정을 엽니다.
3. **Build Phases** 탭에서 `embedAndSignAppleFrameworkForXcode` 태스크가 포함된 **Run Script** 단계를 찾습니다.
4. 실행 스크립트 단계에서 `embedSwiftExportForXcode` 태스크를 사용하도록 스크립트를 조정합니다.

   ```bash
   ./gradlew :<Shared 모듈 이름>:embedSwiftExportForXcode
   ```

   ![Add the Swift export script](xcode-swift-export-run-script-phase.png){width=700}

#### Swift 내보내기에 대한 피드백 남기기

향후 Kotlin 릴리스에서 Swift 내보내기 지원을 확장하고 안정화할 계획입니다. [이 YouTrack 이슈](https://youtrack.jetbrains.com/issue/KT-64572)에 피드백을 남겨주세요.

### 어느 호스트에서든 Kotlin 라이브러리를 게시할 수 있는 기능

> 이 기능은 현재 [실험적(Experimental)](components-stability.md#stability-levels-explained) 단계입니다.
> 옵트인이 필요하며(자세한 내용은 아래 참조), 평가 목적으로만 사용해야 합니다.
> [YouTrack](https://youtrack.jetbrains.com/issue/KT-71290)을 통해 여러분의 피드백을 기다립니다.
>
{style="warning"}

Kotlin 컴파일러는 Kotlin 라이브러리 게시를 위해 `.klib` 아티팩트를 생성합니다. 이전에는 Mac 머신이 필요한 Apple 플랫폼 타겟을 제외하고 어느 호스트에서나 필요한 아티팩트를 얻을 수 있었습니다. 이로 인해 iOS, macOS, tvOS, watchOS 타겟을 대상으로 하는 Kotlin Multiplatform 프로젝트에 특별한 제약이 있었습니다.

Kotlin 2.1.0은 교차 컴파일(cross-compilation) 지원을 추가하여 이 제한을 해제합니다. 이제 [지원되는 모든 호스트](native-target-support.md#hosts)를 사용하여 `.klib` 아티팩트를 생성할 수 있으며, 이는 Kotlin 및 Kotlin Multiplatform 라이브러리의 게시 프로세스를 크게 단순화할 것입니다.

#### 어느 호스트에서든 라이브러리 게시 활성화 방법

프로젝트에서 교차 컴파일을 사용해 보려면 `gradle.properties` 파일에 다음 바이너리 옵션을 추가하세요.

```none
# gradle.properties
kotlin.native.enableKlibsCrossCompilation=true
```

이 기능은 현재 실험적이며 일부 제한 사항이 있습니다. 다음과 같은 경우에는 여전히 Mac 머신을 사용해야 합니다.

* 라이브러리에 [cinterop 종속성](native-c-interop.md)이 있는 경우.
* 프로젝트에 [CocoaPods 통합](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html)이 설정되어 있는 경우.
* Apple 타겟을 위한 [최종 바이너리](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html)를 빌드하거나 테스트해야 하는 경우.

#### 라이브러리 게시에 대한 피드백 남기기

향후 Kotlin 릴리스에서 이 기능을 안정화하고 라이브러리 게시를 더욱 개선할 계획입니다. 이슈 트래커인 [YouTrack](https://youtrack.jetbrains.com/issue/KT-71290)에 피드백을 남겨주세요.

자세한 내용은 [멀티플랫폼 라이브러리 게시](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-lib-setup.html)를 참조하세요.

### 비압축 klib 지원

Kotlin 2.1.0은 압축되지 않은(`.klib` 파일이 아닌) 아티팩트를 생성할 수 있게 합니다. 이를 통해 klib을 먼저 압축 해제하지 않고 직접 klib에 대한 종속성을 구성할 수 있는 옵션을 제공합니다.

이 변경 사항은 Kotlin/Wasm, Kotlin/JS, Kotlin/Native 프로젝트에서 컴파일 및 링킹 시간을 줄여 성능을 향상시킬 수 있습니다.

예를 들어, 1개의 링킹과 10개의 컴파일 태스크가 있는 프로젝트(9개의 단순화된 프로젝트에 의존하는 단일 네이티브 실행 바이너리를 빌드하는 프로젝트)에서 벤치마크 결과 전체 빌드 시간이 약 3% 향상되었습니다. 그러나 빌드 시간에 미치는 실제 영향은 서브프로젝트의 수와 각각의 크기에 따라 다릅니다.

#### 프로젝트 설정 방법

기본적으로 Kotlin 컴파일 및 링킹 태스크는 이제 새로운 비압축 아티팩트를 사용하도록 구성됩니다.

klib 해소를 위해 커스텀 빌드 로직을 설정했고 새로운 비압축 아티팩트를 사용하고 싶다면, Gradle 빌드 파일에서 선호하는 klib 패키징 해소 변형(variant)을 명시적으로 지정해야 합니다.

```kotlin
// build.gradle.kts
import org.jetbrains.kotlin.gradle.plugin.attributes.KlibPackaging
// ...
val resolvableConfiguration = configurations.resolvable("resolvable") {

    // 새로운 비압축 구성을 위해:
    attributes.attribute(KlibPackaging.ATTRIBUTE, project.objects.named(KlibPackaging.NON_PACKED))

    // 이전 압축 구성을 위해:
    attributes.attribute(KlibPackaging.ATTRIBUTE, project.objects.named(KlibPackaging.PACKED))
}
```

비압축 `.klib` 파일은 이전의 압축 파일이 있던 프로젝트의 빌드 디렉토리와 동일한 경로에 생성됩니다. 대신 압축된 klib은 이제 `build/libs` 디렉토리에 위치합니다.

속성이 지정되지 않으면 압축 변형이 사용됩니다. 사용 가능한 속성 및 변형 목록은 다음 콘솔 명령으로 확인할 수 있습니다.

```shell
./gradlew outgoingVariants
```

[YouTrack](https://kotl.in/issue)을 통해 이 기능에 대한 피드백을 기다립니다.

### 이전 `android` 타겟의 추가 지원 중단

Kotlin 2.1.0에서 이전 `android` 타겟 이름에 대한 지원 중단 경고가 오류로 격상되었습니다.

현재 Android를 타겟팅하는 Kotlin Multiplatform 프로젝트에서는 `androidTarget` 옵션을 사용할 것을 권장합니다. 이는 Google의 향후 Android/KMP 플러그인을 위해 `android`라는 이름을 비워두기 위해 필요한 일시적인 조치입니다.

새로운 플러그인이 제공되면 추가 마이그레이션 지침을 제공할 예정입니다. Google의 새로운 DSL은 Kotlin Multiplatform에서 Android 타겟 지원을 위해 선호되는 옵션이 될 것입니다.

자세한 내용은 [Kotlin Multiplatform 호환성 가이드](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#rename-of-android-target-to-androidtarget)를 참조하세요.

### 동일한 타입의 다중 타겟 선언 지원 중단

Kotlin 2.1.0 이전에는 멀티플랫폼 프로젝트에서 동일한 타입의 타겟을 여러 개 선언할 수 있었습니다. 그러나 이로 인해 타겟을 구분하고 공유 소스 세트를 효과적으로 지원하는 것이 어려웠습니다. 대부분의 경우 별도의 Gradle 프로젝트를 사용하는 것과 같은 더 간단한 설정이 더 잘 작동합니다. 자세한 가이드와 마이그레이션 예시는 Kotlin Multiplatform 호환성 가이드의 [여러 유사한 타겟 선언하기](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#declaring-several-similar-targets)를 참조하세요.

Kotlin 1.9.20에서는 멀티플랫폼 프로젝트에서 동일한 타입의 타겟을 여러 개 선언하면 지원 중단 경고가 발생했습니다. Kotlin 2.1.0부터 이 경고는 Kotlin/JS 타겟을 제외한 모든 타겟에 대해 오류가 됩니다. Kotlin/JS 타겟이 왜 제외되는지에 대해 자세히 알아보려면 [YouTrack의 이 이슈](https://youtrack.jetbrains.com/issue/KT-47038/KJS-MPP-Split-JS-target-into-JsBrowser-and-JsNode)를 확인하세요.

## Kotlin/Native

Kotlin 2.1.0은 [`iosArm64` 타겟 지원 업그레이드](#iosarm64-promoted-to-tier-1), [cinterop 캐싱 프로세스 개선](#changes-to-caching-in-cinterop) 및 기타 업데이트를 포함합니다.

### iosArm64 지원 수준 티어 1 승격

[Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/get-started.html) 개발에 필수적인 `iosArm64` 타겟이 티어 1(Tier 1)으로 승격되었습니다. 이는 Kotlin/Native 컴파일러에서 제공하는 최고 수준의 지원입니다.

즉, 이 타겟은 컴파일 및 실행이 가능하도록 CI 파이프라인에서 정기적으로 테스트됩니다. 또한 해당 타겟에 대해 컴파일러 출시 간의 소스 및 바이너리 호환성을 제공합니다.

타겟 티어에 대한 자세한 정보는 [Kotlin/Native 타겟 지원](native-target-support.md)을 참조하세요.

### LLVM 업데이트 (11.1.0에서 16.0.0으로)

Kotlin 2.1.0에서는 LLVM을 버전 11.1.0에서 16.0.0으로 업데이트했습니다. 새로운 버전에는 버그 수정 및 보안 업데이트가 포함되어 있습니다. 특정 경우에 컴파일러 최적화 및 더 빠른 컴파일을 제공하기도 합니다.

프로젝트에 Linux 타겟이 있는 경우, Kotlin/Native 컴파일러가 이제 모든 Linux 타겟에 대해 기본적으로 `lld` 링커를 사용한다는 점에 유의하세요.

이 업데이트는 코드에 영향을 주지 않아야 하지만, 이슈가 발생하면 [이슈 트래커](http://kotl.in/issue)에 보고해 주세요.

### cinterop 캐싱 변경 사항

Kotlin 2.1.0에서는 cinterop 캐싱 프로세스를 변경하고 있습니다. 더 이상 [`CacheableTask`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/CacheableTask.html) 어노테이션 타입을 가지지 않습니다. 새로운 권장 방식은 [`cacheIf`](https://docs.gradle.org/current/kotlin-dsl/gradle/org.gradle.api.tasks/-task-outputs/cache-if.html) 출력 타입을 사용하여 태스크 결과를 캐싱하는 것입니다.

이를 통해 [정의 파일(definition file)](native-definition-file.md)에 지정된 헤더 파일의 변경 사항을 `UP-TO-DATE` 검사가 감지하지 못해 빌드 시스템이 코드를 재컴파일하지 못하는 문제를 해결할 수 있습니다.

### mimalloc 메모리 할당자 지원 중단

Kotlin 1.9.0에서 새로운 메모리 할당자를 도입했고, Kotlin 1.9.20에서 기본적으로 활성화했습니다. 새로운 할당자는 가비지 컬렉션을 더 효율적으로 만들고 Kotlin/Native 메모리 관리자의 런타임 성능을 개선하도록 설계되었습니다.

새로운 메모리 할당자는 이전 기본 할당자인 [mimalloc](https://github.com/microsoft/mimalloc)을 대체했습니다. 이제 Kotlin/Native 컴파일러에서 mimalloc의 지원을 중단할 때가 되었습니다.

이제 빌드 스크립트에서 `-Xallocator=mimalloc` 컴파일러 옵션을 제거할 수 있습니다. 이슈가 발생하면 [이슈 트래커](http://kotl.in/issue)에 보고해 주세요.

Kotlin의 메모리 할당자 및 가비지 컬렉션에 대한 자세한 내용은 [Kotlin/Native 메모리 관리](native-memory-manager.md)를 참조하세요.

## Kotlin/Wasm

Kotlin/Wasm은 [증분 컴파일 지원](#support-for-incremental-compilation)과 함께 여러 업데이트를 받았습니다.

### 증분 컴파일 지원

이전에는 Kotlin 코드를 변경할 때마다 Kotlin/Wasm 툴체인이 전체 코드베이스를 재컴파일해야 했습니다.

2.1.0부터 Wasm 타겟에 대해 증분 컴파일(incremental compilation)이 지원됩니다. 개발 태스크에서 컴파일러는 이제 마지막 컴파일 이후 변경된 내용과 관련된 파일만 재컴파일하므로 컴파일 시간이 눈에 띄게 단축됩니다.

이 변경으로 현재 컴파일 속도가 두 배 향상되었으며, 향후 릴리스에서 더욱 개선할 계획입니다.

현재 설정에서 Wasm 타겟의 증분 컴파일은 기본적으로 비활성화되어 있습니다. 증분 컴파일을 활성화하려면 프로젝트의 `local.properties` 또는 `gradle.properties` 파일에 다음 라인을 추가하세요.

```none
# gradle.properties
kotlin.incremental.wasm=true
```

Kotlin/Wasm 증분 컴파일을 시도해 보시고 [피드백을 공유](https://youtrack.jetbrains.com/issue/KT-72158/Kotlin-Wasm-incremental-compilation-feedback)해 주세요. 여러분의 통찰력은 이 기능이 더 빨리 안정화되고 기본적으로 활성화되는 데 도움이 될 것입니다.

### 브라우저 API가 kotlinx-browser 독립 라이브러리로 이동

이전에는 웹 API 및 관련 타겟 유틸리티에 대한 선언이 Kotlin/Wasm 표준 라이브러리의 일부였습니다.

이번 릴리스에서 `org.w3c.*` 선언들이 Kotlin/Wasm 표준 라이브러리에서 새로운 [kotlinx-browser 라이브러리](https://github.com/kotlin/kotlinx-browser)로 이동되었습니다. 이 라이브러리에는 `org.khronos.webgl`, `kotlin.dom`, `kotlinx.browser`와 같은 다른 웹 관련 패키지도 포함되어 있습니다.

이러한 분리는 모듈성을 제공하여 Kotlin의 출시 주기와 별개로 웹 관련 API를 독립적으로 업데이트할 수 있게 합니다. 또한 Kotlin/Wasm 표준 라이브러리는 이제 모든 JavaScript 환경에서 사용 가능한 선언만 포함하게 됩니다.

이동된 패키지의 선언을 사용하려면 프로젝트의 빌드 구성 파일에 `kotlinx-browser` 종속성을 추가해야 합니다.

```kotlin
// build.gradle.kts
val wasmJsMain by getting {
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-browser:0.3")
    }
}
```

### Kotlin/Wasm 디버깅 경험 개선

이전에는 웹 브라우저에서 Kotlin/Wasm 코드를 디버깅할 때 디버깅 인터페이스에서 변수 값의 저수준 표현이 표시되는 경우가 있었습니다. 이로 인해 애플리케이션의 현재 상태를 추적하는 것이 어려울 때가 많았습니다.

![Kotlin/Wasm old debugger](wasm-old-debugger.png){width=700}

이 경험을 개선하기 위해 변수 뷰에 커스텀 포매터(custom formatter)가 추가되었습니다. 이 구현은 Firefox 및 Chromium 기반 브라우저에서 지원되는 [커스텀 포매터 API](https://firefox-source-docs.mozilla.org/devtools-user/custom_formatters/index.html)를 사용합니다.

이 변경을 통해 이제 변수 값을 더 사용자 친화적이고 이해하기 쉬운 방식으로 표시하고 찾을 수 있습니다.

![Kotlin/Wasm improved debugger](wasm-debugger-improved.png){width=700}

새로운 디버깅 경험을 사용해 보려면:

1. `wasmJs {}` 컴파일러 옵션에 다음 컴파일러 옵션을 추가하세요.

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

2. 브라우저에서 커스텀 포매터를 활성화하세요.

   * Chrome DevTools에서는 **Settings | Preferences | Console**을 통해 활성화할 수 있습니다.

     ![Enable custom formatters in Chrome](wasm-custom-formatters-chrome.png){width=700}

   * Firefox DevTools에서는 **Settings | Advanced settings**를 통해 활성화할 수 있습니다.

     ![Enable custom formatters in Firefox](wasm-custom-formatters-firefox.png){width=700}

### Kotlin/Wasm 바이너리 크기 감소

프로덕션 빌드에서 생성되는 Wasm 바이너리 크기가 최대 30%까지 감소하며 일부 성능 향상을 볼 수도 있습니다. 이는 `--closed-world`, `--type-ssa`, `--type-merging` Binaryen 옵션이 이제 모든 Kotlin/Wasm 프로젝트에서 사용하기에 안전한 것으로 간주되어 기본적으로 활성화되었기 때문입니다.

### Kotlin/Wasm의 JavaScript 배열 상호운용성 개선

Kotlin/Wasm의 표준 라이브러리는 JavaScript 배열을 위해 `JsArray<T>` 타입을 제공하지만, `JsArray<T>`를 Kotlin의 기본 `Array` 또는 `List` 타입으로 변환하는 직접적인 방법은 없었습니다.

이러한 간극 때문에 배열 변환을 위한 커스텀 함수를 만들어야 했고, Kotlin과 JavaScript 코드 간의 상호운용성이 복잡해졌습니다.

이번 릴리스에서는 `JsArray<T>`를 `Array<T>`로, 또는 그 반대로 자동 변환하는 어댑터 함수를 도입하여 배열 작업을 단순화했습니다.

다음은 제네릭 타입인 Kotlin `List<T>` 및 `Array<T>`와 JavaScript `JsArray<T>` 간의 변환 예시입니다.

```kotlin
val list: `List<JsString>` =
    listOf("Kotlin", "Wasm").map { it.toJsString() }

// .toJsArray()를 사용하여 List나 Array를 JsArray로 변환
val jsArray: JsArray<JsString> = list.toJsArray()

// .toArray()와 .toList()를 사용하여 다시 Kotlin 타입으로 변환 
val kotlinArray: `Array<JsString>` = jsArray.toArray()
val kotlinList: `List<JsString>` = jsArray.toList()
```

타입이 지정된 배열(예: `IntArray` 및 `Int32Array`)을 해당 Kotlin 배열로 변환하는 유사한 메서드도 사용할 수 있습니다. 자세한 정보 및 구현은 [`kotlinx-browser` 저장소]( https://github.com/Kotlin/kotlinx-browser/blob/dfbdceed314567983c98f1d66e8c2e10d99c5a55/src/wasmJsMain/kotlin/arrayCopy.kt)를 참조하세요.

다음은 타입이 지정된 배열인 Kotlin `IntArray`와 JavaScript `Int32Array` 간의 변환 예시입니다.

```kotlin
import org.khronos.webgl.*

    // ...

    val intArray: IntArray = intArrayOf(1, 2, 3)
    
    // .toInt32Array()를 사용하여 Kotlin IntArray를 JavaScript Int32Array로 변환
    val jsInt32Array: Int32Array = intArray.toInt32Array()
    
    // toIntArray()를 사용하여 JavaScript Int32Array를 다시 Kotlin IntArray로 변환
    val kotlinIntArray: IntArray = jsInt32Array.toIntArray()
```

### Kotlin/Wasm에서 JavaScript 예외 세부 정보 액세스 지원

이전에는 Kotlin/Wasm에서 JavaScript 예외가 발생했을 때 `JsException` 타입은 원래 JavaScript 오류의 세부 정보 없이 일반적인 메시지만 제공했습니다.

Kotlin 2.1.0부터 특정 컴파일러 옵션을 활성화하여 `JsException`에 원래 오류 메시지와 스택 트레이스를 포함하도록 구성할 수 있습니다. 이는 JavaScript에서 기인한 문제를 진단하는 데 더 많은 컨텍스트를 제공합니다.

이 동작은 특정 브라우저에서만 사용할 수 있는 `WebAssembly.JSTag` API에 의존합니다.

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

`-Xwasm-attach-js-exception` 옵션을 활성화하면 `JsException`은 JavaScript 오류의 구체적인 세부 정보를 제공합니다. 옵션이 없으면 `JsException`은 JavaScript 코드를 실행하는 중에 예외가 발생했다는 일반적인 메시지만 포함합니다.

### 기본 내보내기(default export) 지원 중단

이름이 지정된 내보내기(named export)로의 마이그레이션의 일환으로, 이전에는 JavaScript에서 Kotlin/Wasm 내보내기에 기본 가져오기(default import)를 사용할 때 콘솔에 오류가 출력되었습니다.

2.1.0에서는 이름이 지정된 내보내기를 완전히 지원하기 위해 기본 가져오기가 완전히 제거되었습니다.

JavaScript에서 Kotlin/Wasm 타겟을 위해 코딩할 때 이제 기본 가져오기 대신 해당하는 이름이 지정된 가져오기를 사용해야 합니다.

이 변경은 이름이 지정된 내보내기로 전환하기 위한 지원 중단 주기의 마지막 단계입니다.

**버전 2.0.0:** 기본 내보내기를 통한 엔티티 내보내기가 더 이상 지원되지 않는다는 경고 메시지가 콘솔에 출력되었습니다.

**버전 2.0.20:** 해당하는 이름이 지정된 가져오기를 사용할 것을 요구하는 오류가 발생했습니다.

**버전 2.1.0:** 기본 가져오기 사용이 완전히 제거되었습니다.

### 서브프로젝트별 Node.js 설정

`rootProject`에 대해 `NodeJsRootPlugin` 클래스의 속성을 정의하여 프로젝트의 Node.js 설정을 구성할 수 있습니다. 2.1.0에서는 새로운 클래스인 `NodeJsPlugin`을 사용하여 각 서브프로젝트에 대해 이러한 설정을 구성할 수 있습니다. 다음은 서브프로젝트에 대해 특정 Node.js 버전을 설정하는 방법을 보여주는 예시입니다.

```kotlin
// build.gradle.kts
project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
    project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().version = "22.0.0"
}
```

전체 프로젝트에 대해 이 새 클래스를 사용하려면 `allprojects {}` 블록에 동일한 코드를 추가하세요.

```kotlin
// build.gradle.kts
allprojects {
    project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
        project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().version = "사용할 Node.js 버전"
    }
}
```

Gradle 컨벤션 플러그인을 사용하여 특정 서브프로젝트 세트에 설정을 적용할 수도 있습니다.

## Kotlin/JS

### 속성에서 비식별자 문자 지원

이전의 Kotlin/JS는 백틱으로 감싸인 공백이 포함된 [테스트 메서드 이름](coding-conventions.md#names-for-test-methods)을 허용하지 않았습니다.

마찬가지로 하이픈이나 공백과 같이 Kotlin 식별자에서 허용되지 않는 문자가 포함된 JavaScript 객체 속성에 액세스하는 것이 불가능했습니다.

```kotlin
external interface Headers {
    var accept: String?

    // 하이픈으로 인해 유효하지 않은 Kotlin 식별자
    var `content-length`: String?
}

val headers: Headers = TODO("JS 라이브러리에서 제공하는 값")
val accept = headers.accept
// 속성 이름의 하이픈으로 인해 오류 발생
val length = headers.`content-length`
```

이 동작은 비식별자 문자를 사용하여 이러한 속성에 액세스할 수 있는 JavaScript 및 TypeScript와 달랐습니다.

Kotlin 2.1.0부터 이 기능이 기본적으로 활성화됩니다. 이제 Kotlin/JS에서 백틱(``)과 `@JsName` 어노테이션을 사용하여 비식별자 문자가 포함된 JavaScript 속성과 상호 작용하고 테스트 메서드 이름을 사용할 수 있습니다.

또한 `@JsName` 및 `@JsQualifier` 어노테이션을 사용하여 Kotlin 속성 이름을 JavaScript의 해당하는 이름에 매핑할 수 있습니다.

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
    // JavaScript에서 이는 Bar.property_example_HASH로 컴파일됨
    println(Bar.`property example`)
    // JavaScript에서 이는 fooNamespace["property example"]로 컴파일됨
    println(Foo.`property example`)
    // JavaScript에서 이는 Baz["property example"]로 컴파일됨
    println(Baz.`property example`)
}
```

### ES2015 화살표 함수 생성 지원

Kotlin 2.1.0의 Kotlin/JS는 익명 함수 대신 `(a, b) => expression`과 같은 ES2015 화살표 함수(arrow functions) 생성을 지원합니다.

화살표 함수를 사용하면 특히 실험적인 `-Xir-generate-inline-anonymous-functions` 모드를 사용할 때 프로젝트의 번들 크기를 줄일 수 있습니다. 또한 생성된 코드가 현대적인 JS와 더 잘 일치하게 됩니다.

이 기능은 ES2015를 타겟팅할 때 기본적으로 활성화됩니다. 또는 `-Xes-arrow-functions` 명령줄 인수를 사용하여 활성화할 수 있습니다.

[공식 문서](https://262.ecma-international.org/6.0/)에서 ES2015(ECMAScript 2015, ES6)에 대해 자세히 알아보세요.

## Gradle 개선 사항

Kotlin 2.1.0은 Gradle 7.6.3부터 8.6까지 완전히 호환됩니다. Gradle 버전 8.7부터 8.10도 지원되지만 한 가지 예외가 있습니다. Kotlin Multiplatform Gradle 플러그인을 사용하는 경우, JVM 타겟에서 `withJava()` 함수를 호출하는 멀티플랫폼 프로젝트에서 지원 중단 경고가 표시될 수 있습니다. 이 문제는 가능한 한 빨리 해결할 계획입니다.

자세한 내용은 [YouTrack의 관련 이슈](https://youtrack.jetbrains.com/issue/KT-66542)를 참조하세요.

최신 Gradle 릴리스까지 사용할 수 있지만, 이 경우 지원 중단 경고가 발생하거나 일부 새로운 Gradle 기능이 작동하지 않을 수 있음을 유의하세요.

### 최소 지원 AGP 버전 7.3.1로 상향

Kotlin 2.1.0부터 지원되는 최소 Android Gradle 플러그인 버전은 7.3.1입니다.

### 최소 지원 Gradle 버전 7.6.3으로 상향

Kotlin 2.1.0부터 지원되는 최소 Gradle 버전은 7.6.3입니다.

### Kotlin Gradle 플러그인 확장을 위한 새로운 API

Kotlin 2.1.0은 Kotlin Gradle 플러그인 구성을 위한 자체 플러그인을 더 쉽게 만들 수 있도록 새로운 API를 도입했습니다. 이 변경으로 `KotlinTopLevelExtension` 및 `KotlinTopLevelExtensionConfig` 인터페이스는 지원 중단되었으며, 플러그인 작성자를 위해 다음 인터페이스가 도입되었습니다.

| 이름 | 설명 |
|--------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `KotlinBaseExtension` | 전체 프로젝트에 대해 공통 Kotlin JVM, Android 및 Multiplatform 플러그인 옵션을 구성하기 위한 플러그인 DSL 확장 타입:<list><li>`org.jetbrains.kotlin.jvm`</li><li>`org.jetbrains.kotlin.android`</li><li>`org.jetbrains.kotlin.multiplatform`</li></list> |
| `KotlinJvmExtension` | 전체 프로젝트에 대해 Kotlin **JVM** 플러그인 옵션을 구성하기 위한 플러그인 DSL 확장 타입. |
| `KotlinAndroidExtension` | 전체 프로젝트에 대해 Kotlin **Android** 플러그인 옵션을 구성하기 위한 플러그인 DSL 확장 타입. |

예를 들어 JVM 및 Android 프로젝트 모두에 대해 컴파일러 옵션을 구성하려면 `KotlinBaseExtension`을 사용하세요.

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

이는 JVM 및 Android 프로젝트 모두에 대해 JVM 타겟을 17로 구성합니다.

JVM 프로젝트에 한해 컴파일러 옵션을 구성하려면 `KotlinJvmExtension`을 사용하세요.

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

이 예시도 마찬가지로 JVM 프로젝트에 대해 JVM 타겟을 17로 구성합니다. 또한 프로젝트 결과물이 Maven 저장소에 게시되도록 프로젝트의 Maven 발행물을 구성합니다.

`KotlinAndroidExtension`도 정확히 같은 방식으로 사용할 수 있습니다.

### Kotlin Gradle 플러그인 API에서 숨겨진 컴파일러 심볼

이전의 KGP는 런타임 종속성에 `org.jetbrains.kotlin:kotlin-compiler-embeddable`을 포함하여 내부 컴파일러 심볼이 빌드 스크립트 클래스패스에서 사용 가능하도록 했습니다. 이러한 심볼은 내부용으로만 의도된 것입니다.

Kotlin 2.1.0부터 KGP는 `org.jetbrains.kotlin:kotlin-compiler-embeddable` 클래스 파일의 하위 집합을 JAR 파일에 묶고 점진적으로 제거합니다. 이 변경은 호환성 문제를 방지하고 KGP 유지 관리를 단순화하기 위한 것입니다.

빌드 로직의 다른 부분(예: `kotlinter`와 같은 플러그인)이 KGP에 포함된 버전과 다른 버전의 `org.jetbrains.kotlin:kotlin-compiler-embeddable`에 의존하는 경우, 충돌 및 런타임 예외가 발생할 수 있습니다.

이러한 문제를 방지하기 위해 이제 KGP와 함께 빌드 클래스패스에 `org.jetbrains.kotlin:kotlin-compiler-embeddable`이 있는 경우 KGP가 경고를 표시합니다.

장기적인 해결책으로, `org.jetbrains.kotlin:kotlin-compiler-embeddable` 클래스를 사용하는 플러그인 작성자라면 격리된 클래스로더에서 실행할 것을 권장합니다. 예를 들어 클래스로더 또는 프로세스 격리가 포함된 [Gradle Workers API](https://docs.gradle.org/current/userguide/worker_api.html)를 사용하여 이를 달성할 수 있습니다.

#### Gradle Workers API 사용하기

이 예시는 Gradle 플러그인을 생성하는 프로젝트에서 Kotlin 컴파일러를 안전하게 사용하는 방법을 보여줍니다. 먼저 빌드 스크립트에 compile-only 종속성을 추가합니다. 이렇게 하면 컴파일 타임에만 심볼을 사용할 수 있습니다.

```kotlin
// build.gradle.kts
dependencies {
    compileOnly("org.jetbrains.kotlin:kotlin-compiler-embeddable:%kotlinVersion%")
}
```

다음으로 Kotlin 컴파일러 버전을 출력하는 Gradle work action을 정의합니다.

```kotlin
import org.gradle.workers.WorkAction
import org.gradle.workers.WorkParameters
import org.jetbrains.kotlin.config.KotlinCompilerVersion
abstract class ActionUsingKotlinCompiler : WorkAction<WorkParameters.None> {
    override fun execute() {
        println("Kotlin 컴파일러 버전: ${KotlinCompilerVersion.getVersion()}")
    }
}
```

이제 클래스로더 격리를 사용하여 이 액션을 워커 실행기에 제출하는 태스크를 생성합니다.

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

## Compose 컴파일러 업데이트

### 다중 안정성 구성 파일 지원

Compose 컴파일러는 여러 개의 안정성 구성 파일(stability configuration files)을 해석할 수 있지만, Compose 컴파일러 Gradle 플러그인의 `stabilityConfigurationFile` 옵션은 이전에는 단일 파일만 지정할 수 있었습니다. Kotlin 2.1.0에서 이 기능은 단일 모듈에 대해 여러 안정성 구성 파일을 사용할 수 있도록 재작업되었습니다.

* `stabilityConfigurationFile` 옵션은 지원 중단되었습니다.
* `ListProperty<RegularFile>` 타입을 가진 새로운 옵션 `stabilityConfigurationFiles`가 도입되었습니다.

새로운 옵션을 사용하여 여러 파일을 Compose 컴파일러에 전달하는 방법은 다음과 같습니다.

```kotlin
// build.gradle.kt
composeCompiler {
    stabilityConfigurationFiles.addAll(
        project.layout.projectDirectory.file("configuration-file1.conf"),
        project.layout.projectDirectory.file("configuration-file2.conf"),
    )
}
```

### 일시 중지 가능한 컴포지션

일시 중지 가능한 컴포지션(Pausable composition)은 컴파일러가 건너뛸 수 있는(skippable) 함수를 생성하는 방식을 변경하는 새로운 실험적 기능입니다. 이 기능을 활성화하면 런타임 중에 건너뛰는 지점에서 컴포지션을 일시 중단할 수 있어, 실행 시간이 긴 컴포지션 프로세스를 여러 프레임으로 나눌 수 있습니다. 일시 중지 가능한 컴포지션은 레이지 리스트(lazy lists) 및 기타 성능 집약적인 컴포넌트에서 콘텐츠 프리페칭(prefetching)을 위해 사용되며, 이를 통해 차단(blocking) 방식으로 실행될 때 발생할 수 있는 프레임 드랍을 방지합니다.

일시 중지 가능한 컴포지션을 사용해 보려면 Compose 컴파일러의 Gradle 구성에 다음 기능 플래그를 추가하세요.

```kotlin
// build.gradle.kts
composeCompiler {
    featureFlags = setOf(
        ComposeFeatureFlag.PausableComposition
    )
}
```

> 이 기능에 대한 런타임 지원은 `androidx.compose.runtime` 버전 1.8.0-alpha02에 추가되었습니다. 이전 런타임 버전과 함께 사용하면 기능 플래그가 적용되지 않습니다.
>
{style="note"}

### open 및 재정의된 @Composable 함수에 대한 변경 사항

가상(virtual) 함수(`open`, `abstract` 및 재정의된 함수)인 `@Composable` 함수는 더 이상 재시작 가능(restartable)할 수 없습니다. 재시작 가능한 그룹을 위한 코드 생성 기능이 상속과 함께 사용할 때 [올바르게 작동하지 않아](https://issuetracker.google.com/329477544) 런타임 크래시를 유발했습니다.

즉, 가상 함수는 재시작되거나 건너뛰어지지 않습니다. 가상 함수의 상태가 무효화될 때마다 런타임은 대신 부모 컴포저블을 재구성(recompose)하게 됩니다. 코드가 재구성에 민감한 경우 런타임 동작의 변화를 느낄 수 있습니다.

### 성능 개선

이전의 Compose 컴파일러는 `@Composable` 타입을 변환하기 위해 모듈의 IR 전체 복사본을 생성했습니다. 이 동작은 Compose와 관련 없는 요소를 복사할 때 메모리 소비를 증가시킬 뿐만 아니라, [특정 엣지 케이스](https://issuetracker.google.com/365066530)에서 다운스트림 컴파일러 플러그인을 망가뜨리기도 했습니다.

이 복사 작업이 제거되어 잠재적으로 더 빠른 컴파일 시간을 기대할 수 있습니다.

## 표준 라이브러리

### 표준 라이브러리 API의 지원 중단 심각도 변경

Kotlin 2.1.0에서는 여러 표준 라이브러리 API의 지원 중단 심각도 레벨을 경고(warning)에서 오류(error)로 격상합니다. 코드가 이러한 API에 의존하고 있다면 호환성을 유지하기 위해 업데이트해야 합니다. 주요 변경 사항은 다음과 같습니다.

* **Locale에 민감한 `Char` 및 `String`의 대소문자 변환 함수 지원 중단:**
  `Char.toLowerCase()`, `Char.toUpperCase()`, `String.toUpperCase()`, 및 `String.toLowerCase()`와 같은 함수는 이제 지원이 중단되었으며, 이를 사용하면 오류가 발생합니다. 이를 Locale과 무관한 함수 대안이나 다른 대소문자 변환 메커니즘으로 교체하세요. 기본 Locale을 계속 사용하고 싶다면 `String.toLowerCase()` 대신 Locale을 명시적으로 지정하는 `String.lowercase(Locale.getDefault())`를 사용하세요. Locale과 무관한 변환을 원한다면 기본적으로 invariant locale을 사용하는 `String.lowercase()`로 교체하세요.

* **Kotlin/Native 프리징(freezing) API 지원 중단:**
  이전에는 `@FreezingIsDeprecated` 어노테이션이 표시되었던 프리징 관련 선언을 사용하면 이제 오류가 발생합니다. 이 변경은 스레드 간에 객체를 공유하기 위해 프리징이 필요했던 Kotlin/Native의 레거시 메모리 관리자로부터의 전환을 반영합니다. 새로운 메모리 모델에서 프리징 관련 API로부터 마이그레이션하는 방법은 [Kotlin/Native 마이그레이션 가이드](native-migration-guide.md#update-your-code)를 참조하세요. 자세한 내용은 [프리징 지원 중단에 대한 공지](whatsnew1720.md#freezing)를 참조하세요.

* **`appendln()`이 `appendLine()`을 위해 지원 중단됨:**
  `StringBuilder.appendln()` 및 `Appendable.appendln()` 함수는 이제 지원이 중단되었으며, 사용 시 오류가 발생합니다. 대신 `StringBuilder.appendLine()` 또는 `Appendable.appendLine()` 함수를 사용하세요. `appendln()` 함수는 Kotlin/JVM에서 OS마다 기본값이 다른 `line.separator` 시스템 속성을 사용하기 때문에 지원이 중단되었습니다. Kotlin/JVM에서 이 속성은 Windows에서는 `\r
` (CR LF)이고 다른 시스템에서는 `
` (LF)입니다. 반면 `appendLine()` 함수는 플랫폼 전반에서 일관된 동작을 보장하기 위해 줄 구분 기호로 `
` (LF)을 일관되게 사용합니다.

이번 릴리스에서 영향을 받는 전체 API 목록은 [KT-71628](https://youtrack.jetbrains.com/issue/KT-71628) YouTrack 이슈를 참조하세요.

### java.nio.file.Path용 안정적인 파일 트리 탐색 확장

Kotlin 1.7.20에서 파일 트리를 탐색할 수 있는 `java.nio.file.Path` 클래스용 실험적 [확장 함수](extensions.md#extension-functions)를 도입했습니다. Kotlin 2.1.0에서 다음 파일 트리 탐색 확장들이 [안정화](components-stability.md#stability-levels-explained)되었습니다.

* `walk()`는 지정된 경로를 루트로 하는 파일 트리를 지연(lazy) 탐색합니다.
* `fileVisitor()`를 사용하면 `FileVisitor`를 별도로 생성할 수 있습니다. `FileVisitor`는 탐색 중에 디렉토리와 파일에서 수행할 작업을 지정합니다.
* `visitFileTree(fileVisitor: FileVisitor, ...)`는 내부적으로 `java.nio.file.Files.walkFileTree()` 함수를 사용하여 파일 트리를 탐색하며, 만나는 각 항목에 대해 지정된 `FileVisitor`를 호출합니다.
* `visitFileTree(..., builderAction: FileVisitorBuilder.() -> Unit)`는 제공된 `builderAction`으로 `FileVisitor`를 생성하고 `visitFileTree(fileVisitor, ...)` 함수를 호출합니다.
* `sealed interface FileVisitorBuilder`를 통해 커스텀 `FileVisitor` 구현을 정의할 수 있습니다.
* `enum class PathWalkOption`은 `Path.walk()` 함수를 위한 탐색 옵션을 제공합니다.

아래 예시는 이러한 파일 탐색 API를 사용하여 커스텀 `FileVisitor` 동작을 생성하는 방법을 보여줍니다. 이를 통해 파일 및 디렉토리를 방문할 때의 구체적인 작업을 정의할 수 있습니다.

예를 들어 `FileVisitor`를 명시적으로 생성하고 나중에 사용할 수 있습니다.

```kotlin
val cleanVisitor = fileVisitor {
    onPreVisitDirectory { directory, attributes ->
        // 자리표시자: 디렉토리 방문 시의 로직 추가
        FileVisitResult.CONTINUE
    }

    onVisitFile { file, attributes ->
        // 자리표시자: 파일 방문 시의 로직 추가
        FileVisitResult.CONTINUE
    }
}

// 자리표시자: 탐색 전 일반적인 설정을 위한 로직 추가
projectDirectory.visitFileTree(cleanVisitor)
```

`builderAction`으로 `FileVisitor`를 생성하고 즉시 탐색에 사용할 수도 있습니다.

```kotlin
projectDirectory.visitFileTree {
    // builderAction 정의:
    onPreVisitDirectory { directory, attributes ->
        // 디렉토리 방문 시의 일부 로직
        FileVisitResult.CONTINUE
    }

    onVisitFile { file, attributes ->
        // 파일 방문 시의 일부 로직
        FileVisitResult.CONTINUE
    }
}
```

또한 `walk()` 함수를 사용하여 지정된 경로를 루트로 하는 파일 트리를 탐색할 수 있습니다.

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

    // 루트 디렉토리 및 파일 설정
    val rootDirectory = createTempDirectory("Project")

    // A.kt 및 A.class 파일이 있는 src 디렉토리 생성
    rootDirectory.resolve("src").let { srcDirectory ->
        srcDirectory.createDirectory()
        srcDirectory.resolve("A.kt").createFile()
        srcDirectory.resolve("A.class").createFile()
    }

    // Project.jar 파일이 있는 build 디렉토리 생성
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
  
    // cleanVisitor로 파일 트리를 탐색하여 rootDirectory.visitFileTree(cleanVisitor) 정리 규칙 적용
    val directoryStructureAfterClean = rootDirectory.walk(PathWalkOption.INCLUDE_DIRECTORIES)
        .map { it.relativeTo(rootDirectory).toString() }
        .toList().sorted()
    println(directoryStructureAfterClean)
    // "[, src, src/A.kt]"
}
```

## 문서 업데이트

Kotlin 문서에 몇 가지 주목할 만한 변경 사항이 있었습니다.

### 언어 개념

* 개선된 [Null 안전성](null-safety.md) 페이지 – 코드에서 `null` 값을 안전하게 처리하는 방법을 알아보세요.
* 개선된 [객체 선언 및 표현식](object-declarations.md) 페이지 – 한 번에 클래스를 정의하고 인스턴스를 생성하는 방법을 알아보세요.
* 개선된 [When 표현식 및 문](control-flow.md#when-expressions-and-statements) 섹션 – `when` 조건문과 사용법을 알아보세요.
* 업데이트된 [Kotlin 로드맵](roadmap.md), [Kotlin 진화 원칙](kotlin-evolution-principles.md), 및 [Kotlin 언어 기능 및 제안](kotlin-language-features-and-proposals.md) 페이지 – Kotlin의 계획, 현재 진행 중인 개발 및 가이드 원칙에 대해 알아보세요.

### Compose 컴파일러

* [Compose 컴파일러 문서](compose-compiler-migration-guide.md)가 이제 컴파일러 및 플러그인 섹션으로 이동되었습니다 – Compose 컴파일러, 컴파일러 옵션 및 마이그레이션 단계에 대해 알아보세요.

### API 레퍼런스

* 새로운 [Kotlin Gradle 플러그인 API 레퍼런스](https://kotlinlang.org/api/kotlin-gradle-plugin) – Kotlin Gradle 플러그인 및 Compose 컴파일러 Gradle 플러그인에 대한 API 레퍼런스를 살펴보세요.

### 멀티플랫폼 개발

* 새로운 [멀티플랫폼용 Kotlin 라이브러리 빌드](https://kotlinlang.org/docs/api-guidelines-build-for-multiplatform.html) 페이지 – Kotlin Multiplatform을 위한 Kotlin 라이브러리 설계 방법을 알아보세요.
* 새로운 [Kotlin Multiplatform 시작하기](https://kotlinlang.org/docs/multiplatform/get-started.html) 페이지 – Kotlin Multiplatform의 핵심 개념, 종속성, 라이브러리 등을 알아보세요.
* 새로운 [iOS 통합](https://kotlinlang.org/docs/multiplatform/multiplatform-ios-integration-overview.html) 섹션 – Kotlin Multiplatform 공유 모듈을 iOS 앱에 통합하는 방법을 알아보세요.
* 새로운 [Kotlin/Native 정의 파일](native-definition-file.md) 페이지 – C 및 Objective-C 라이브러리를 사용하기 위해 정의 파일을 생성하는 방법을 알아보세요.
* [WASI 시작하기](wasm-wasi.md) – 다양한 WebAssembly 가상 머신에서 WASI를 사용하여 간단한 Kotlin/Wasm 애플리케이션을 실행하는 방법을 알아보세요.

### 도구

* [새로운 Dokka 마이그레이션 가이드](dokka-migration.md) – Dokka Gradle 플러그인 v2로 마이그레이션하는 방법을 알아보세요.

## Kotlin 2.1.0 호환성 가이드

Kotlin 2.1.0은 기능 릴리스이므로 언어의 이전 버전을 위해 작성된 코드와 호환되지 않는 변경 사항이 포함될 수 있습니다. 이러한 변경 사항의 상세 목록은 [Kotlin 2.1.0 호환성 가이드](compatibility-guide-21.md)에서 확인하세요.

## Kotlin 2.1.0 설치하기

IntelliJ IDEA 2023.3 및 Android Studio Iguana (2023.2.1) Canary 15부터 Kotlin 플러그인은 IDE에 포함된 번들 플러그인으로 배포됩니다. 즉, 더 이상 JetBrains Marketplace에서 플러그인을 설치할 수 없습니다.

새로운 Kotlin 버전으로 업데이트하려면 빌드 스크립트에서 [Kotlin 버전을 2.1.0으로 변경](releases.md#update-to-a-new-kotlin-version)하세요.