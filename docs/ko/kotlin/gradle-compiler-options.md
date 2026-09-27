[//]: # (title: Kotlin Gradle 플러그인의 컴파일러 옵션)

Kotlin의 각 릴리스에는 지원되는 타겟(JVM, JavaScript 및 [지원되는 플랫폼](native-overview.md#target-platforms)용 네이티브 바이너리)을 위한 컴파일러가 포함되어 있습니다.

이 컴파일러들은 다음 환경에서 사용됩니다:
* IDE에서 Kotlin 프로젝트의 **Compile** 또는 **Run** 버튼을 클릭할 때.
* 콘솔이나 IDE에서 `gradle build`를 호출할 때의 Gradle.
* 콘솔이나 IDE에서 `mvn compile` 또는 `mvn test-compile`을 호출할 때의 Maven.

[커맨드 라인 컴파일러 사용하기](command-line.md) 튜토리얼의 설명에 따라 커맨드 라인에서 Kotlin 컴파일러를 수동으로 실행할 수도 있습니다.

## 옵션을 정의하는 방법 {id="how-to-define-options"}

Kotlin 컴파일러에는 컴파일 프로세스를 맞춤화하기 위한 여러 옵션이 있습니다. 

Gradle DSL을 사용하면 컴파일러 옵션을 포괄적으로 구성할 수 있습니다. 이는 [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#compiler-options) 및 [JVM/Android](#target-the-jvm) 프로젝트에서 사용할 수 있습니다.

Gradle DSL을 사용하면 빌드 스크립트 내에서 다음 세 가지 레벨로 컴파일러 옵션을 구성할 수 있습니다: 
* **[익스텐션 레벨(Extension level)](#extension-level)**: 모든 타겟 및 공유 소스 세트에 대해 `kotlin {}` 블록에서 설정합니다.
* **[타겟 레벨(Target level)](#target-level)**: 특정 타겟을 위한 블록에서 설정합니다.
* **[컴파일 단위 레벨(Compilation unit level)](#compilation-unit-level)**: 보통 특정 컴파일 태스크에서 설정합니다.

![Kotlin 컴파일러 옵션 레벨](compiler-options-levels.svg){width=700}

상위 레벨의 설정은 하위 레벨의 관례(기본값)로 사용됩니다:

* 익스텐션 레벨에서 설정된 컴파일러 옵션은 `commonMain`, `nativeMain`, `commonTest`와 같은 공유 소스 세트를 포함한 타겟 레벨 옵션의 기본값이 됩니다.
* 타겟 레벨에서 설정된 컴파일러 옵션은 `compileKotlinJvm` 및 `compileTestKotlinJvm` 태스크와 같은 컴파일 단위(태스크) 레벨 옵션의 기본값이 됩니다.

반대로, 하위 레벨에서 이루어진 구성은 상위 레벨의 관련 설정을 오버라이드합니다:

* 태스크 레벨 컴파일러 옵션은 타겟 또는 익스텐션 레벨의 관련 구성을 오버라이드합니다.
* 타겟 레벨 컴파일러 옵션은 익스텐션 레벨의 관련 구성을 오버라이드합니다.

컴파일에 어떤 레벨의 컴파일러 인자가 적용되는지 확인하려면 Gradle [로깅](https://docs.gradle.org/current/userguide/logging.html)의 `DEBUG` 레벨을 사용하세요.
JVM 및 JS/WASM 태스크의 경우 로그 내에서 `"Kotlin compiler args:"` 문자열을 검색하고, Native 태스크의 경우 `"Arguments ="` 문자열을 검색하세요.

> 서드파티 플러그인 작성자라면 오버라이드 문제를 피하기 위해 프로젝트 레벨에서 구성을 적용하는 것이 가장 좋습니다. 이를 위해 새로운 [Kotlin 플러그인 DSL 익스텐션 타입](whatsnew21.md#new-api-for-kotlin-gradle-plugin-extensions)을 사용할 수 있습니다. 이 구성을 문서에 명시적으로 기록하는 것을 권장합니다.
>
{style="tip"}

### 익스텐션 레벨 {id="extension-level"}

최상위 레벨의 `compilerOptions {}` 블록에서 모든 타겟 및 공유 소스 세트에 대한 공통 컴파일러 옵션을 구성할 수 있습니다:

```kotlin
kotlin {
    compilerOptions {
        optIn.add("kotlin.RequiresOptIn")
    }
}
```

### 타겟 레벨 {id="target-level"}

`target {}` 블록 내부의 `compilerOptions {}` 블록에서 JVM/Android 타겟에 대한 컴파일러 옵션을 구성할 수 있습니다:

```kotlin
kotlin {
    target {
        compilerOptions {
            optIn.add("kotlin.RequiresOptIn")
        }
    }
}
```

Kotlin 멀티플랫폼 프로젝트에서는 특정 타겟 내부에서 컴파일러 옵션을 구성할 수 있습니다. 예를 들어, `jvm { compilerOptions {}}`와 같습니다. 자세한 내용은 [멀티플랫폼 Gradle DSL 레퍼런스](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)를 참고하세요.

### 컴파일 단위 레벨 {id="compilation-unit-level"}

태스크 구성 내부의 `compilerOptions {}` 블록에서 특정 컴파일 단위 또는 태스크에 대한 컴파일러 옵션을 구성할 수 있습니다:

```kotlin
tasks.named<KotlinJvmCompile>("compileKotlin"){
    compilerOptions {
        optIn.add("kotlin.RequiresOptIn")
    }
}
```

`KotlinCompilation`을 통해 컴파일 단위 레벨에서 컴파일러 옵션에 액세스하고 구성할 수도 있습니다:

```kotlin
kotlin {
    target {
        val main by compilations.getting {
            compileTaskProvider.configure {
                compilerOptions {
                    optIn.add("kotlin.RequiresOptIn")
                }
            }
        }
    }
}
```

JVM/Android 및 [Kotlin 멀티플랫폼](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html) 이외의 타겟 플러그인을 구성하려면 해당 Kotlin 컴파일 태스크의 `compilerOptions {}` 속성을 사용하세요. 다음 예제는 Kotlin 및 Groovy DSL 모두에서 이 구성을 설정하는 방법을 보여줍니다:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.named("compileKotlin", org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask::class.java) {
    compilerOptions {
        apiVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_0)
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.named('compileKotlin', org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask.class) {
    compilerOptions {
        apiVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_0)
    }
}
```

</tab>
</tabs>

### `kotlinOptions {}`에서 `compilerOptions {}`로 마이그레이션 {initial-collapse-state="collapsed" collapsible="true" id="migrate-from-kotlinoptions-to-compileroptions"}

Kotlin 2.2.0 이전에는 `kotlinOptions {}` 블록을 사용하여 컴파일러 옵션을 구성할 수 있었습니다. `kotlinOptions {}` 블록은 Kotlin 2.0.0부터 지원 중단(deprecated)되었으므로, 이 섹션에서는 빌드 스크립트에서 대신 `compilerOptions {}` 블록을 사용하도록 마이그레이션하기 위한 가이드와 권장 사항을 제공합니다:

* [컴파일러 옵션 중앙화 및 타입 사용](#centralize-compiler-options-and-use-types)
* [`android.kotlinOptions`에서 마이그레이션](#migrate-away-from-android-kotlinoptions)
* [`freeCompilerArgs` 마이그레이션](#migrate-freecompilerargs)

#### 컴파일러 옵션 중앙화 및 타입 사용 {id="centralize-compiler-options-and-use-types"}

가능하면 [익스텐션 레벨](#extension-level)에서 컴파일러 옵션을 구성하고, 특정 태스크에 대해서는 [컴파일 단위 레벨](#compilation-unit-level)에서 오버라이드하세요.

`compilerOptions {}` 블록에서는 가공되지 않은 문자열(raw string)을 사용할 수 없으므로, 타입이 지정된 값(typed values)으로 변환해야 합니다. 예를 들어, 다음과 같은 코드가 있다면:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("jvm") version "%kotlinVersion%"
}

tasks.withType<KotlinCompile>().configureEach {
    kotlinOptions {
        jvmTarget = "%jvmLTSVersionSupportedByKotlin%"
        languageVersion = "%languageVersion%"
        apiVersion = "%apiVersion%"
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
plugins {
    id 'org.jetbrains.kotlin.jvm' version '%kotlinVersion%'
}

tasks.withType(KotlinCompile).configureEach {
    kotlinOptions {
        jvmTarget = '%jvmLTSVersionSupportedByKotlin%'
        languageVersion = '%languageVersion%'
        apiVersion = '%apiVersion%'
    }
}
```

</tab>
</tabs>

마이그레이션 후에는 다음과 같아야 합니다:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.dsl.KotlinVersion

plugins {
    kotlin("jvm") version "%kotlinVersion%"
}

kotlin {
    // Extension level
    compilerOptions {
        jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
        languageVersion = KotlinVersion.fromVersion("%languageVersion%")
        apiVersion = KotlinVersion.fromVersion("%apiVersion%")
    }
}

// Example of overriding at compilation unit level
tasks.named<KotlinJvmCompile>("compileKotlin"){
    compilerOptions {
        apiVersion = KotlinVersion.fromVersion("%apiVersion%")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.dsl.KotlinVersion

plugins {
    id 'org.jetbrains.kotlin.jvm' version '%kotlinVersion%'
}

kotlin {
  // Extension level
    compilerOptions {
        jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
        languageVersion = KotlinVersion.fromVersion("%languageVersion%")
        apiVersion = KotlinVersion.fromVersion("%apiVersion%")
    }
}

// Example of overriding at compilation unit level
tasks.named("compileKotlin", KotlinJvmCompile).configure {
    compilerOptions {
        apiVersion = KotlinVersion.fromVersion("%apiVersion%")
    }
}
```

</tab>
</tabs>

#### `android.kotlinOptions`에서 마이그레이션 {id="migrate-away-from-android-kotlinoptions"}

빌드 스크립트에서 이전에 `android.kotlinOptions`를 사용했다면, 익스텐션 레벨이나 타겟 레벨 중 하나에서 `kotlin.compilerOptions`를 사용하도록 마이그레이션하세요.

예를 들어, Android 프로젝트가 있는 경우:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    id("com.android.application")
    kotlin("android")
}

android {
    kotlinOptions {
        jvmTarget = "%jvmLTSVersionSupportedByKotlin%"
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    kotlinOptions {
        jvmTarget = '%jvmLTSVersionSupportedByKotlin%'
    }
}
```
</tab>
</tabs>

다음과 같이 업데이트하세요:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    id("com.android.application")
    kotlin("android")
}

kotlin {
    compilerOptions {
        jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

kotlin {
    compilerOptions {
        jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
    }
}
```

</tab>
</tabs>

그리고 Android 타겟이 포함된 Kotlin 멀티플랫폼 프로젝트의 예시는 다음과 같습니다:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform")
    id("com.android.application")
}

kotlin {
    androidTarget {
        compilations.all {
            kotlinOptions.jvmTarget = "%jvmLTSVersionSupportedByKotlin%"
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
plugins {
    id 'org.jetbrains.kotlin.multiplatform'
    id 'com.android.application'
}

kotlin {
    androidTarget {
        compilations.all {
            kotlinOptions {
                jvmTarget = '%jvmLTSVersionSupportedByKotlin%'
            }
        }
    }
}
```

</tab>
</tabs>

다음과 같이 업데이트하세요:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform")
    id("com.android.application")
}

kotlin {
    androidTarget {
        compilerOptions {
            jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
plugins {
    id 'org.jetbrains.kotlin.multiplatform'
    id 'com.android.application'
}

kotlin {
    androidTarget {
        compilerOptions {
            jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
        }
    }
}
```

</tab>
</tabs>

#### `freeCompilerArgs` 마이그레이션 {id="migrate-freecompilerargs"}

* 모든 `+=` 연산을 `add()` 또는 `addAll()` 함수로 교체하세요.
* `-opt-in` 컴파일러 옵션을 사용하는 경우, [KGP API 레퍼런스](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/)에서 전용 DSL을 사용할 수 있는지 확인하고 이를 대신 사용하세요.
* `-progressive` 컴파일러 옵션의 모든 사용을 전용 DSL인 `progressiveMode.set(true)`를 사용하도록 마이그레이션하세요.
* `-Xjvm-default` 컴파일러 옵션의 모든 사용을 [전용 DSL을 사용하도록](gradle-compiler-options.md#attributes-specific-to-jvm) `jvmDefault.set()`으로 마이그레이션하세요. 옵션에 대해 다음 매핑을 사용하세요:

  | 이전 | 이후 |
  |-----------------------------------|---------------------------------------------------|
  | `-Xjvm-default=all-compatibility` | `jvmDefault.set(JvmDefaultMode.ENABLE)`           |
  | `-Xjvm-default=all`               | `jvmDefault.set(JvmDefaultMode.NO_COMPATIBILITY)` | 
  | `-Xjvm-default=disable`           | `jvmDefault.set(JvmDefaultMode.DISABLE)`          |

예를 들어, 다음과 같은 코드가 있다면:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlinOptions {
    freeCompilerArgs += "-opt-in=kotlin.RequiresOptIn"
    freeCompilerArgs += listOf("-Xcontext-receivers", "-Xinline-classes", "-progressive", "-Xjvm-default=all")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
kotlinOptions {
    freeCompilerArgs += "-opt-in=kotlin.RequiresOptIn"
    freeCompilerArgs += ["-Xcontext-receivers", "-Xinline-classes", "-progressive", "-Xjvm-default=all"]
}
```

</tab>
</tabs>

다음과 같이 마이그레이션하세요:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    compilerOptions {
        optIn.add("kotlin.RequiresOptIn")
        freeCompilerArgs.addAll(listOf("-Xcontext-receivers", "-Xinline-classes"))
        progressiveMode.set(true)
        jvmDefault.set(JvmDefaultMode.NO_COMPATIBILITY)
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
kotlin {
    compilerOptions {
        optIn.add("kotlin.RequiresOptIn")
        freeCompilerArgs.addAll(["-Xcontext-receivers", "-Xinline-classes"])
        progressiveMode.set(true)
        jvmDefault.set(JvmDefaultMode.NO_COMPATIBILITY)
    }
}
```

</tab>
</tabs>

## JVM 타겟팅 {id="target-the-jvm"}

[앞서 설명한 대로](#how-to-define-options), JVM/Android 프로젝트에 대한 컴파일러 옵션을 익스텐션, 타겟 및 컴파일 단위 레벨(태스크)에서 정의할 수 있습니다.

기본 JVM 컴파일 태스크는 프로덕션 코드의 경우 `compileKotlin`, 테스트 코드의 경우 `compileTestKotlin`이라고 불립니다. 커스텀 소스 세트에 대한 태스크는 `compile<Name>Kotlin` 패턴에 따라 이름이 지정됩니다.

터미널에서 `gradlew tasks --all` 명령을 실행하고 `Other tasks` 그룹에서 `compile*Kotlin` 태스크 이름을 검색하여 Android 컴파일 태스크 목록을 확인할 수 있습니다.

주의해야 할 몇 가지 중요한 세부 사항은 다음과 같습니다:

* `kotlin.compilerOptions`는 프로젝트의 모든 Kotlin 컴파일 태스크를 구성합니다.
* `tasks.named<KotlinJvmCompile>("compileKotlin") { }` (또는 `tasks.withType<KotlinJvmCompile>().configureEach { }`) 접근 방식을 사용하여 `kotlin.compilerOptions` DSL에 의해 적용된 구성을 오버라이드할 수 있습니다.

## JavaScript 타겟팅 {id="target-javascript"}

JavaScript 컴파일 태스크는 프로덕션 코드의 경우 `compileKotlinJs`, 테스트 코드의 경우 `compileTestKotlinJs`, 커스텀 소스 세트의 경우 `compile<Name>KotlinJs`라고 불립니다.

단일 태스크를 구성하려면 해당 이름을 사용하세요:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

val compileKotlin: KotlinCompilationTask<*> by tasks

compileKotlin.compilerOptions.suppressWarnings.set(true)
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named('compileKotlin', KotlinCompilationTask) {
    compilerOptions {
        suppressWarnings = true
    }
}
```

</tab>
</tabs>

Gradle Kotlin DSL을 사용하는 경우 먼저 프로젝트의 `tasks`에서 태스크를 가져와야 합니다.

JS 타겟의 경우 `Kotlin2JsCompile` 타입을, 공통(common) 타겟의 경우 `KotlinCompileCommon` 타입을 사용하세요.

터미널에서 `gradlew tasks --all` 명령을 실행하고 `Other tasks` 그룹에서 `compile*KotlinJS` 태스크 이름을 검색하여 JavaScript 컴파일 태스크 목록을 확인할 수 있습니다.

## 모든 Kotlin 컴파일 태스크 {id="all-kotlin-compilation-tasks"}

프로젝트의 모든 Kotlin 컴파일 태스크를 구성할 수도 있습니다:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named<KotlinCompilationTask<*>>("compileKotlin").configure {
    compilerOptions { /*...*/ }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named('compileKotlin', KotlinCompilationTask) {
    compilerOptions { /*...*/ }
}
```

</tab>
</tabs>

## 모든 컴파일러 옵션 {id="all-compiler-options"}

다음은 Gradle 컴파일러 옵션의 전체 목록입니다:

### 공통 속성 {id="common-attributes"}

| 이름 | 설명 | 가능한 값 | 기본값 |
|---|---|---|---|
| `optIn` | [옵트인 컴파일러 인자](opt-in-requirements.md) 목록을 구성하기 위한 속성 | `listOf( /* opt-ins */ )` | `emptyList()` |
| `progressiveMode` | [프로그레시브 컴파일러 모드](whatsnew13.md#progressive-mode)를 활성화합니다. | `true`, `false` | `false` |
| `extraWarnings` | true인 경우 경고를 생성하는 [추가 선언, 표현식 및 타입 컴파일러 체크](whatsnew21.md#extra-compiler-checks)를 활성화합니다. | `true`, `false` | `false` |

### JVM 전용 속성 {id="attributes-specific-to-jvm"}

| 이름 | 설명 | 가능한 값 | 기본값 |
|---|---|---|---|
| `javaParameters` | 메서드 파라미터에 대한 Java 1.8 리플렉션용 메타데이터를 생성합니다. | | false |
| `jvmTarget` | 생성된 JVM 바이트코드의 타겟 버전입니다. | "1.8", "9", "10", ..., "25", "26". 또한 [컴파일러 옵션용 타입](#types-for-compiler-options)을 참고하세요. | "%defaultJvmTargetVersion%" |
| `noJdk` | 클래스패스에 Java 런타임을 자동으로 포함하지 않습니다. | | false |
| `jvmTargetValidationMode` | <list><li>Kotlin과 Java 간의 [JVM 타겟 호환성](gradle-configure-project.md#check-for-jvm-target-compatibility-of-related-compile-tasks) 유효성 검사</li><li>`KotlinCompile` 타입 태스크를 위한 속성입니다.</li></list> | `WARNING`, `ERROR`, `IGNORE` | `ERROR` |
| `jvmDefault` | 인터페이스에 선언된 함수가 JVM에서 디폴트 메서드로 컴파일되는 방식을 제어합니다. | `ENABLE`, `NO_COMPATIBILITY`, `DISABLE` | `ENABLE` |

### JVM 및 JavaScript 공통 속성 {id="attributes-common-to-jvm-and-javascript"}

| 이름 | 설명 | 가능한 값 | 기본값 |
|---|---|---|---|
| `allWarningsAsErrors` | 경고가 있는 경우 이를 에러로 보고합니다. | | false |
| `suppressWarnings` | 경고를 생성하지 않습니다. | | false |
| `verbose` | 상세 로깅 출력을 활성화합니다. [Gradle 디버그 로그 레벨이 활성화된](https://docs.gradle.org/current/userguide/logging.html) 경우에만 작동합니다. | | false |
| `freeCompilerArgs` | 추가 컴파일러 인자 목록입니다. 실험적인 `-X` 인자도 여기서 사용할 수 있습니다. [freeCompilerArgs를 통한 추가 인자 사용 예시](#example-of-additional-arguments-usage-via-freecompilerargs)를 참고하세요. | | [] |
| `apiVersion` | 코드에서 사용할 수 있는 Kotlin API를 제어합니다. 자세한 내용은 [`-api-version`](compiler-reference.md#api-version-version)을 참고하세요. | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL) | |
| `languageVersion` | 컴파일 중에 사용할 수 있는 Kotlin 언어 기능과 구문을 제어합니다. 자세한 내용은 [`-language-version`](compiler-reference.md#language-version-version)을 참고하세요. | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL) | |

> 향후 릴리스에서 `freeCompilerArgs` 속성을 지원 중단(deprecate)할 예정입니다. Kotlin Gradle DSL에 누락된 옵션이 있다면 [이슈를 제기](https://youtrack.jetbrains.com/newissue?project=kt)해 주세요.
>
{style="warning"}

#### freeCompilerArgs를 통한 추가 인자 사용 예시 {initial-collapse-state="collapsed" collapsible="true" id="example-of-additional-arguments-usage-via-freecompilerargs"}

추가 컴파일러 인자(실험적 인자 포함)를 제공하려면 `freeCompilerArgs` 속성을 사용하세요. 이 속성에 단일 인자 또는 인자 목록을 추가할 수 있습니다:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

kotlin {
    compilerOptions {
        // Specifies the version of the Kotlin API and the JVM target
        apiVersion.set(KotlinVersion.%gradleLanguageVersion%)
        jvmTarget.set(JvmTarget.JVM_1_8)
        
        // Single experimental argument
        freeCompilerArgs.add("-Xexport-kdoc")

        // Single additional argument
        freeCompilerArgs.add("-Xno-param-assertions")

        // List of arguments
        freeCompilerArgs.addAll(
            listOf(
                "-Xno-receiver-assertions",
                "-Xno-call-assertions"
            )
        ) 
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named('compileKotlin', KotlinCompilationTask) {
    compilerOptions {
        // Specifies the version of the Kotlin API and the JVM target
        apiVersion = KotlinVersion.%gradleLanguageVersion%
        jvmTarget = JvmTarget.JVM_1_8
        
        // Single experimental argument
        freeCompilerArgs.add("-Xexport-kdoc")
        
        // Single additional argument, can be a key-value pair
        freeCompilerArgs.add("-Xno-param-assertions")
        
        // List of arguments
        freeCompilerArgs.addAll(["-Xno-receiver-assertions", "-Xno-call-assertions"])
    }
}
```

</tab>
</tabs>

> `freeCompilerArgs` 속성은 [익스텐션](#extension-level), [타겟](#target-level) 및 [컴파일 단위(태스크)](#compilation-unit-level) 레벨에서 사용할 수 있습니다.
>
{style="tip"} 

#### languageVersion 설정 예시 {initial-collapse-state="collapsed" collapsible="true" id="example-of-setting-languageversion"}

언어 버전을 설정하려면 다음 구문을 사용하세요:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    compilerOptions {
        languageVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.%gradleLanguageVersion%)
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks
    .withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask.class)
    .configureEach {
        compilerOptions.languageVersion =
            org.jetbrains.kotlin.gradle.dsl.KotlinVersion.%gradleLanguageVersion%
    }
```

</tab>
</tabs>

또한 [컴파일러 옵션용 타입](#types-for-compiler-options)을 참고하세요.

### JavaScript 전용 속성 {id="attributes-specific-to-javascript"}

| 이름 | 설명 | 가능한 값 | 기본값 |
|---|---|---|---|
| `friendModulesDisabled` | 내부 선언 내보내기(export)를 비활성화합니다. | | `false` |
| `main` | 실행 시 `main` 함수가 호출되어야 하는지 지정합니다. | `JsMainFunctionExecutionMode.CALL`, `JsMainFunctionExecutionMode.NO_CALL` | `JsMainFunctionExecutionMode.CALL` |
| `moduleKind` | 컴파일러에 의해 생성되는 JS 모듈의 종류입니다. | `JsModuleKind.MODULE_AMD`, `JsModuleKind.MODULE_PLAIN`, `JsModuleKind.MODULE_ES`, `JsModuleKind.MODULE_COMMONJS`, `JsModuleKind.MODULE_UMD` | `null` |
| `sourceMap` | 소스 맵을 생성합니다. | | `false` |
| `sourceMapEmbedSources` | 소스 파일을 소스 맵에 포함합니다. | `JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_INLINING`, `JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_NEVER`, `JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_ALWAYS` | `null` |
| `sourceMapNamesPolicy` | Kotlin 코드에 선언한 변수 및 함수 이름을 소스 맵에 추가합니다. 동작에 대한 자세한 내용은 [컴파일러 레퍼런스](compiler-reference.md#source-map-names-policy-simple-names-fully-qualified-names-no)를 참고하세요. | `JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_FQ_NAMES`, `JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_SIMPLE_NAMES`, `JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_NO` | `null` |
| `sourceMapPrefix` | 소스 맵의 경로에 지정된 접두사를 추가합니다. | | `null` |
| `target` | 특정 ECMA 버전에 맞는 JS 파일을 생성합니다. | `"es5"`, `"es2015"`, `"es2020"` | `"es5"` |
| `useEsClasses` | 생성된 JavaScript 코드가 ES2015 클래스를 사용하도록 합니다. ES2015 및 ES2020 타겟 사용 시 기본적으로 활성화됩니다. | | `null` |

### 컴파일러 옵션용 타입 {id="types-for-compiler-options"}

일부 `compilerOptions`는 `String` 타입 대신 새로운 타입을 사용합니다:

| 옵션 | 타입 | 예시 |
|---|---|---|
| `jvmTarget` | [`JvmTarget`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JvmTarget.kt) | `compilerOptions.jvmTarget.set(JvmTarget.JVM_11)` |
| `apiVersion` 및 `languageVersion` | [`KotlinVersion`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/KotlinVersion.kt) | `compilerOptions.languageVersion.set(KotlinVersion.%gradleLanguageVersion%)` |
| `main` | [`JsMainFunctionExecutionMode`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsMainFunctionExecutionMode.kt) | `compilerOptions.main.set(JsMainFunctionExecutionMode.NO_CALL)` |
| `moduleKind` | [`JsModuleKind`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsModuleKind.kt) | `compilerOptions.moduleKind.set(JsModuleKind.MODULE_ES)` |
| `sourceMapEmbedSources` | [`JsSourceMapEmbedMode`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsSourceMapEmbedMode.kt) | `compilerOptions.sourceMapEmbedSources.set(JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_INLINING)` |
| `sourceMapNamesPolicy` | [`JsSourceMapNamesPolicy`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsSourceMapNamesPolicy.kt) | `compilerOptions.sourceMapNamesPolicy.set(JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_FQ_NAMES)` |

## 다음 단계는? {id="what-s-next"}

다음에 대해 자세히 알아보세요:
* [Kotlin 멀티플랫폼 DSL 레퍼런스](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html). 
* [증분 컴파일, 캐시 지원, 빌드 보고서 및 Kotlin 데몬](gradle-compilation-and-caches.md).
* [Gradle 기본 사항 및 세부 사항](https://docs.gradle.org/current/userguide/userguide.html).
* [Gradle 플러그인 변형 지원](gradle-plugin-variants.md).