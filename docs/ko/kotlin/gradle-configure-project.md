[//]: # (title: Gradle 프로젝트 구성하기)

[Gradle](https://docs.gradle.org/current/userguide/userguide.html)을 사용하여 Kotlin 프로젝트를 빌드하려면, 빌드 스크립트 파일인 `build.gradle(.kts)`에 [Kotlin Gradle 플러그인을 추가](#apply-the-plugin)하고 [프로젝트 의존성을 구성](#configure-dependencies)해야 합니다.

> 빌드 스크립트의 내용에 대해 자세히 알아보려면 [빌드 스크립트 살펴보기](get-started-with-jvm-gradle-project.md#explore-the-build-script) 섹션을 참조하세요.
>
{style="note"}

## 플러그인 적용 {id="apply-the-plugin"}

Kotlin Gradle 플러그인을 적용하려면 Gradle 플러그인 DSL의 [`plugins{}` 블록](https://docs.gradle.org/current/userguide/plugins.html#sec:plugins_block)을 사용합니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    // `<...>` 부분을 타깃 환경에 맞는 플러그인 이름으로 바꿉니다.
    kotlin("<...>") version "%kotlinVersion%"
    // 예를 들어, 타깃 환경이 JVM인 경우:
    // kotlin("jvm") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    // `<...>` 부분을 타깃 환경에 맞는 플러그인 이름으로 바꿉니다.
    id 'org.jetbrains.kotlin.<...>' version '%kotlinVersion%'
    // 예를 들어, 타깃 환경이 JVM인 경우: 
    // id 'org.jetbrains.kotlin.jvm' version '%kotlinVersion%'
}
```

</tab>
</tabs>

> Kotlin Gradle 플러그인(KGP)과 Kotlin은 동일한 버전 번호를 공유합니다.
>
{style="note"}

프로젝트를 구성할 때 사용 가능한 Gradle 버전과의 Kotlin Gradle 플러그인(KGP) 호환성을 확인하세요. 다음 표에는 **완전히 지원되는** Gradle 및 AGP(Android Gradle 플러그인)의 최소 및 최대 버전이 나와 있습니다.

| KGP 버전      | Gradle 최소 및 최대 버전             | AGP 최소 및 최대 버전                               |
|---------------|---------------------------------------|-----------------------------------------------------|
| 2.4.20–2.4.21        | %minGradleVersion%–%maxGradleVersion% | %minAndroidGradleVersion%–%maxAndroidGradleVersion% |
| 2.4.0–2.4.10  | 7.6.3–9.5.0                           | 8.5.2–9.1.0                                         |
| 2.3.20–2.3.21 | 7.6.3–9.3.0                           | 8.2.2–9.0.0                                         |
| 2.3.10        | 7.6.3–9.0.0                           | 8.2.2–9.0.0                                         |
| 2.3.0         | 7.6.3–9.0.0                           | 8.2.2–8.13.0                                        |
| 2.2.20–2.2.21 | 7.6.3–8.14                            | 7.3.1–8.11.1                                        |
| 2.2.0–2.2.10  | 7.6.3–8.14                            | 7.3.1–8.10.0                                        |
| 2.1.20–2.1.21 | 7.6.3–8.12.1                          | 7.3.1–8.7.2                                         |
| 2.1.0–2.1.10  | 7.6.3–8.10*                           | 7.3.1–8.7.2                                         |
| 2.0.20–2.0.21 | 6.8.3–8.8*                            | 7.1.3–8.5                                           |
| 2.0.0         | 6.8.3–8.5                             | 7.1.3–8.3.1                                         |
| 1.9.20–1.9.25 | 6.8.3–8.1.1                           | 4.2.2–8.1.0                                         |

> *Kotlin 2.0.20–2.0.21 및 Kotlin 2.1.0–2.1.10은 최대 8.6 버전의 Gradle과 완벽히 호환됩니다.
> Gradle 버전 8.7–8.10도 지원되지만 한 가지 예외가 있습니다. Kotlin Multiplatform Gradle 플러그인을 사용하는 경우, JVM 타깃에서 `withJava()` 함수를 호출하는 멀티플랫폼 프로젝트에서 지원 중단(deprecation) 경고가 표시될 수 있습니다.
> 자세한 내용은 [기본적으로 생성되는 Java 소스 세트](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#java-source-sets-created-by-default)를 참조하세요.
>
{style="warning"}

최신 릴리스까지의 Gradle 및 AGP 버전을 사용할 수도 있지만, 이 경우 지원 중단 경고가 발생하거나 일부 새로운 기능이 작동하지 않을 수 있음을 유의하세요.

예를 들어, Kotlin Gradle 플러그인 및 `kotlin-multiplatform` 플러그인 %kotlinVersion%은 프로젝트 컴파일을 위해 최소 Gradle 버전으로 %minGradleVersion%을 요구합니다.

마찬가지로 완전히 지원되는 최대 버전은 %maxGradleVersion%입니다. 이 버전에는 지원 중단된 Gradle 메서드 및 프로퍼티가 없으며, 현재의 모든 Gradle 기능을 지원합니다.

### 이전 KGP 버전 {initial-collapse-state="collapsed" collapsible="true" id="earlier-kgp-versions"}

| KGP 버전      | Gradle 최소 및 최대 버전             | AGP 최소 및 최대 버전                               |
|---------------|---------------------------------------|-----------------------------------------------------|
| 1.9.0–1.9.10  | 6.8.3–7.6.0                           | 4.2.2–7.4.0                                         |
| 1.8.20–1.8.22 | 6.8.3–7.6.0                           | 4.1.3–7.4.0                                         |      
| 1.8.0–1.8.11  | 6.8.3–7.3.3                           | 4.1.3–7.2.1                                         |   
| 1.7.20–1.7.22 | 6.7.1–7.1.1                           | 3.6.4–7.0.4                                         |
| 1.7.0–1.7.10  | 6.7.1–7.0.2                           | 3.4.3–7.0.2                                         |
| 1.6.20–1.6.21 | 6.1.1–7.0.2                           | 3.4.3–7.0.2                                         |

### 프로젝트 내 Kotlin Gradle 플러그인 데이터 {id="kotlin-gradle-plugin-data-in-a-project"}

기본적으로 Kotlin Gradle 플러그인은 지속성이 필요한 프로젝트별 데이터를 프로젝트 루트의 `.kotlin` 디렉터리에 저장합니다.

> `.kotlin` 디렉터리를 버전 관리 시스템에 커밋하지 마세요.
> 예를 들어 Git을 사용하는 경우 프로젝트의 `.gitignore` 파일에 `.kotlin`을 추가하세요.
>
{style="warning"}

이 동작을 구성하기 위해 프로젝트의 `gradle.properties` 파일에 추가할 수 있는 프로퍼티는 다음과 같습니다.

| Gradle 프로퍼티                                     | 설명                                                                                                                                              |
|-----------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `kotlin.project.persistent.dir`                     | 프로젝트 수준 데이터가 저장되는 위치를 구성합니다. 기본값: `<project-root-directory>/.kotlin`                                                      |
| `kotlin.project.persistent.dir.gradle.disableWrite` | `.gradle` 디렉터리에 Kotlin 데이터 쓰기를 비활성화할지 여부를 제어합니다(이전 IDEA 버전과의 이전 버전 호환성을 위함). 기본값: false                |

## JVM 타깃 지정 {id="targeting-the-jvm"}

JVM을 타깃으로 지정하려면 Kotlin JVM 플러그인을 적용합니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("jvm") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.jvm" version "%kotlinVersion%"
}
```

</tab>
</tabs>

이 블록에서 `version`은 리터럴이어야 하며, 다른 빌드 스크립트로부터 적용할 수 없습니다.

### Kotlin 및 Java 소스 {id="kotlin-and-java-sources"}

Kotlin 소스와 Java 소스는 동일한 디렉터리에 저장할 수도 있고 서로 다른 디렉터리에 둘 수도 있습니다.

기본 컨벤션은 서로 다른 디렉터리를 사용하는 것입니다.

```text
project
    - src
        - main (root)
            - kotlin
            - java
```

> `src/*/kotlin` 디렉터리에는 Java `.java` 파일을 저장하지 마세요. `.java` 파일이 컴파일되지 않습니다.
> 
> 대신 `src/main/java`를 사용할 수 있습니다.
>
{style="warning"} 

기본 컨벤션을 사용하지 않는 경우 해당하는 `sourceSets` 프로퍼티를 업데이트해야 합니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
sourceSets.main {
    java.srcDirs("src/main/myJava", "src/main/myKotlin")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
sourceSets {
    main.kotlin.srcDirs += 'src/main/myKotlin'
    main.java.srcDirs += 'src/main/myJava'
}
```

</tab>
</tabs>

<!-- The following header is used in the Mari link service. If you wish to change it here, change the link there too -->

### 관련 컴파일 태스크의 JVM 타깃 호환성 확인 {id="check-for-jvm-target-compatibility-of-related-compile-tasks"}

빌드 모듈에는 다음과 같이 서로 연관된 컴파일 태스크가 있을 수 있습니다.
* `compileKotlin` 및 `compileJava`
* `compileTestKotlin` 및 `compileTestJava`

> `main` 및 `test` 소스 세트의 컴파일 태스크는 서로 연관되어 있지 않습니다.
>
{style="note"}

이와 같이 연관된 태스크에 대해 Kotlin Gradle 플러그인은 JVM 타깃 호환성을 확인합니다. `kotlin` 확장 또는 태스크의 [`jvmTarget` 속성](gradle-compiler-options.md#attributes-specific-to-jvm) 값과 `java` 확장 또는 태스크의 [`targetCompatibility`](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java-extension) 값이 서로 다르면 JVM 타깃 비호환성이 발생합니다. 예를 들어, `compileKotlin` 태스크에는 `jvmTarget=1.8`이 설정되어 있고 `compileJava` 태스크에는 `targetCompatibility=15`가 설정(또는 [상속](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java-extension))되어 있는 경우입니다.

`gradle.properties` 파일에서 `kotlin.jvm.target.validation.mode` 프로퍼티를 설정하여 프로젝트 전체에 대한 이 검사 동작을 구성할 수 있습니다.

* `error` – 플러그인이 빌드를 실패 처리합니다. Gradle 8.0 이상 프로젝트의 기본값입니다.
* `warning` – 플러그인이 경고 메시지를 출력합니다. Gradle 8.0 미만 프로젝트의 기본값입니다.
* `ignore` – 플러그인이 검사를 건너뛰고 아무런 메시지도 출력하지 않습니다.

`build.gradle(.kts)` 파일의 태스크 수준에서도 이를 구성할 수 있습니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinJvmCompile>().configureEach {
    jvmTargetValidationMode.set(org.jetbrains.kotlin.gradle.dsl.jvm.JvmTargetValidationMode.WARNING)
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinJvmCompile.class).configureEach {
    jvmTargetValidationMode = org.jetbrains.kotlin.gradle.dsl.jvm.JvmTargetValidationMode.WARNING
}
```

</tab>
</tabs>

JVM 타깃 비호환성을 방지하려면 [툴체인을 구성](#gradle-java-toolchains-support)하거나 JVM 버전을 수동으로 일치시키세요.

#### 타깃이 호환되지 않을 때 발생할 수 있는 문제 {initial-collapse-state="collapsed" collapsible="true" id="what-can-go-wrong-if-targets-are-incompatible"}

Kotlin 및 Java 소스 세트의 JVM 타깃을 수동으로 설정하는 방법에는 두 가지가 있습니다.
* [Java 툴체인 설정](#gradle-java-toolchains-support)을 통한 암시적 방법.
* `kotlin` 확장 또는 태스크의 `jvmTarget` 속성과 `java` 확장 또는 태스크의 `targetCompatibility`를 설정하는 명시적 방법.

JVM 타깃 비호환성은 다음과 같은 경우에 발생합니다.
* `jvmTarget`과 `targetCompatibility`의 값을 서로 다르게 명시적으로 설정한 경우.
* 기본 구성을 사용하고 있으며 사용 중인 JDK가 `1.8`이 아닌 경우.

빌드 스크립트에 Kotlin JVM 플러그인만 있고 JVM 타깃에 대한 추가 설정이 없는 기본 구성을 살펴보겠습니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("jvm") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.jvm" version "%kotlinVersion%"
}
```

</tab>
</tabs>

빌드 스크립트에 `jvmTarget` 값에 대한 명시적인 정보가 없는 경우 기본값은 `null`이며, 컴파일러는 이를 기본값인 `1.8`로 해석합니다. `targetCompatibility`는 현재 Gradle의 JDK 버전과 동일하며, 이는 곧 사용자의 JDK 버전과 같습니다([Java 툴체인 방식](gradle-configure-project.md#gradle-java-toolchains-support)을 사용하지 않는 한). 사용자의 JDK 버전이 `%jvmLTSVersionSupportedByKotlin%`이라고 가정할 때, 게시된 라이브러리 아티팩트는 JDK %jvmLTSVersionSupportedByKotlin%+와 [호환된다고 선언](https://docs.gradle.org/current/userguide/publishing_gradle_module_metadata.html)합니다(`org.gradle.jvm.version=%jvmLTSVersionSupportedByKotlin%`). 하지만 이는 잘못된 것입니다. 이 경우 바이트코드 버전이 `1.8`임에도 불구하고, 메인 프로젝트에서 이 라이브러리를 추가하려면 Java %jvmLTSVersionSupportedByKotlin%을 사용해야 합니다. 이 문제를 해결하려면 [툴체인을 구성](gradle-configure-project.md#gradle-java-toolchains-support)하세요.

### Gradle Java 툴체인 지원 {id="gradle-java-toolchains-support"}

> Android 사용자를 위한 주의사항: Gradle 툴체인 지원을 사용하려면 Android Gradle 플러그인(AGP) 버전 8.1.0-alpha09 이상을 사용하세요.
> 
> Gradle Java 툴체인 지원은 AGP 7.4.0부터 [사용 가능합니다](https://issuetracker.google.com/issues/194113162).
> 그러나 [이 이슈](https://issuetracker.google.com/issues/260059413)로 인해 AGP는 버전 8.1.0-alpha09 이전까지 `targetCompatibility`를 툴체인의 JDK와 같도록 설정하지 않았습니다.
> 8.1.0-alpha09 미만 버전을 사용하는 경우, `compileOptions`를 통해 `targetCompatibility`를 수동으로 구성해야 합니다.
> `<MAJOR_JDK_VERSION>` 플레이스홀더를 사용하려는 JDK 버전으로 바꾸세요.
>
> ```kotlin
> android {
>     compileOptions {
>         sourceCompatibility = <MAJOR_JDK_VERSION>
>         targetCompatibility = <MAJOR_JDK_VERSION>
>     }
> }
> ```
>
{style="warning"} 

Gradle 6.7에서는 [Java 툴체인 지원](https://docs.gradle.org/current/userguide/toolchains.html)이 도입되었습니다.
이 기능을 사용하면 다음과 같은 작업이 가능합니다.
* Gradle에서 사용하는 것과 다른 JDK 및 JRE를 사용하여 컴파일, 테스트 및 실행 파일을 실행할 수 있습니다.
* 아직 릴리스되지 않은 언어 버전으로 코드를 컴파일하고 테스트할 수 있습니다.

툴체인 지원을 통해 Gradle은 로컬 JDK를 자동 감지하고 빌드에 필요한 누락된 JDK를 설치할 수 있습니다. 이제 Gradle 자체는 어떤 JDK에서든 실행될 수 있으며, 주요 JDK 버전에 의존하는 태스크에 대해서도 [원격 빌드 캐시 기능](gradle-compilation-and-caches.md#gradle-build-cache-support)을 그대로 재사용할 수 있습니다.

Kotlin Gradle 플러그인은 Kotlin/JVM 컴파일 태스크에 대해 Java 툴체인을 지원합니다. JS 및 Native 태스크는 툴체인을 사용하지 않습니다. Kotlin 컴파일러는 항상 Gradle 데몬이 실행 중인 JDK에서 실행됩니다.
Java 툴체인은 다음 역할을 수행합니다.
* JVM 타깃에 사용할 수 있는 [`-jdk-home` 옵션](compiler-reference.md#jdk-home-path)을 설정합니다.
* 사용자가 `jvmTarget` 옵션을 명시적으로 설정하지 않은 경우 [`compilerOptions.jvmTarget`](gradle-compiler-options.md#attributes-specific-to-jvm)을 툴체인의 JDK 버전으로 설정합니다. 사용자가 툴체인을 구성하지 않은 경우 `jvmTarget` 필드는 기본값을 사용합니다. 자세한 내용은 [JVM 타깃 호환성 확인](#check-for-jvm-target-compatibility-of-related-compile-tasks)을 참조하세요.
* 모든 Java 컴파일, 테스트 및 javadoc 태스크에서 사용할 툴체인을 설정합니다.
* [`kapt` 워커](kapt.md#run-kapt-tasks-in-parallel)가 실행되는 JDK에 영향을 미칩니다.

툴체인을 설정하려면 다음 코드를 사용하세요. `<MAJOR_JDK_VERSION>` 플레이스홀더를 사용하려는 JDK 버전으로 바꿉니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvmToolchain {
        languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>))
    }
    // 또는 더 간단하게:
    jvmToolchain(<MAJOR_JDK_VERSION>)
    // 예:
    jvmToolchain(%jvmLTSVersionSupportedByKotlin%)
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvmToolchain {
        languageVersion = JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
    }
    // 또는 더 간단하게:
    jvmToolchain(<MAJOR_JDK_VERSION>)
    // 예:
    jvmToolchain(%jvmLTSVersionSupportedByKotlin%)
}
```

</tab>
</tabs>

`kotlin` 확장을 통해 툴체인을 설정하면 Java 컴파일 태스크의 툴체인도 함께 업데이트됩니다.

`java` 확장을 통해 툴체인을 설정할 수도 있으며, Kotlin 컴파일 태스크는 이를 사용합니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)) 
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
    }
}
```

</tab>
</tabs>

Gradle 8.0.2 이상을 사용하는 경우 [툴체인 리졸버 플러그인](https://docs.gradle.org/current/userguide/toolchains.html#sub:download_repositories)도 추가해야 합니다. 이 유형의 플러그인은 툴체인을 다운로드할 저장소를 관리합니다. 예를 들어 `settings.gradle(.kts)`에 다음 플러그인을 추가합니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version("%foojayResolver%")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.gradle.toolchains.foojay-resolver-convention' version '%foojayResolver%'
}
```

</tab>
</tabs>

`foojay-resolver-convention`의 버전이 사용 중인 Gradle 버전과 일치하는지 [Gradle 웹사이트](https://docs.gradle.org/current/userguide/toolchains.html#sub:download_repositories)에서 확인하세요.

> Gradle이 어떤 툴체인을 사용하는지 확인하려면 [로그 레벨 `--info`](https://docs.gradle.org/current/userguide/logging.html#sec:choosing_a_log_level)로 Gradle 빌드를 실행하고, 출력에서 `[KOTLIN] Kotlin compilation 'jdkHome' argument:`로 시작하는 문자열을 찾으세요. 콜론 뒤의 부분이 툴체인의 JDK 버전입니다.
>
{style="note"}

특정 태스크에 대해 원하는 JDK(로컬 JDK 포함)를 설정하려면 [Task DSL](#set-jdk-version-with-the-task-dsl)을 사용하세요.

자세한 내용은 [Kotlin 플러그인의 Gradle JVM 툴체인 지원](https://blog.jetbrains.com/kotlin/2021/11/gradle-jvm-toolchain-support-in-the-kotlin-plugin/)을 참조하세요.

### Task DSL로 JDK 버전 설정 {id="set-jdk-version-with-the-task-dsl"}

Task DSL을 사용하면 `UsesKotlinJavaToolchain` 인터페이스를 구현하는 모든 태스크에 대해 원하는 JDK 버전을 설정할 수 있습니다. 현재 이러한 태스크에는 `KotlinCompile` 및 `KaptTask`가 있습니다. Gradle이 주요 JDK 버전을 검색하도록 하려면 빌드 스크립트에서 `<MAJOR_JDK_VERSION>` 플레이스홀더를 바꿉니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
val service = project.extensions.getByType<JavaToolchainService>()
val customLauncher = service.launcherFor {
    languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>))
}
project.tasks.withType<UsesKotlinJavaToolchain>().configureEach {
    kotlinJavaToolchain.toolchain.use(customLauncher)
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
JavaToolchainService service = project.getExtensions().getByType(JavaToolchainService.class)
Provider<JavaLauncher> customLauncher = service.launcherFor {
    it.languageVersion = JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
}
tasks.withType(UsesKotlinJavaToolchain::class).configureEach { task ->
    task.kotlinJavaToolchain.toolchain.use(customLauncher)
}
```

</tab>
</tabs>

또는 로컬 JDK의 경로를 지정하고 플레이스홀더 `<LOCAL_JDK_VERSION>`을 해당 JDK 버전으로 바꿀 수도 있습니다.

```kotlin
tasks.withType<UsesKotlinJavaToolchain>().configureEach {
    kotlinJavaToolchain.jdk.use(
        "/path/to/local/jdk", // 사용자의 JDK 경로 입력
        JavaVersion.<LOCAL_JDK_VERSION> // 예: JavaVersion.17
    )
}
```

### 컴파일러 태스크 연결 (Associate compiler tasks) {id="associate-compiler-tasks"}

한 컴파일이 다른 컴파일의 컴파일된 출력물을 사용하도록 둘 사이에 관계를 설정하여 컴파일을 _연결(associate)_할 수 있습니다. 컴파일을 연결하면 둘 사이에 `internal` 가시성이 설정됩니다.

Kotlin 컴파일러는 기본적으로 각 타깃의 `test` 및 `main` 컴파일과 같이 일부 컴파일을 서로 연결합니다. 사용자 정의 컴파일 중 하나가 다른 컴파일에 연결되어 있음을 표현해야 하는 경우, 직접 연결된 컴파일을 생성할 수 있습니다.

소스 세트 간의 가시성을 추론할 수 있도록 IDE에서 연결된 컴파일을 지원하게 하려면 `build.gradle(.kts)`에 다음 코드를 추가하세요.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
val integrationTestCompilation = kotlin.target.compilations.create("integrationTest") {
    associateWith(kotlin.target.compilations.getByName("main"))
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
integrationTestCompilation {
    kotlin.target.compilations.create("integrationTest") {
        associateWith(kotlin.target.compilations.getByName("main"))
    }
}
```

</tab>
</tabs>

여기서 `integrationTest` 컴파일은 `main` 컴파일과 연결되어 기능 테스트에서 `internal` 객체에 접근할 수 있게 됩니다.

### Java 모듈(JPMS) 활성화 상태로 구성 {id="configure-with-java-modules-jpms-enabled"}

Kotlin Gradle 플러그인이 [Java 모듈](https://dev.java/learn/modules/)과 함께 동작하도록 하려면 빌드 스크립트에 다음 줄을 추가하고 `YOUR_MODULE_NAME`을 JPMS 모듈 참조(예: `org.company.module`)로 바꿉니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.named("compileJava", JavaCompile::class.java) {
    // Java/Kotlin 혼합 소스가 작동하는 데 필요한 컴파일된 Kotlin 클래스를 javac에 제공합니다.
    val mainOutput: FileCollection = sourceSets["main"].output
    options.compilerArgumentProviders.add(CommandLineArgumentProvider {
        listOf("--patch-module", "YOUR_MODULE_NAME=${mainOutput.asPath}")
    })
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.named("compileJava", JavaCompile.class) {
    // Java/Kotlin 혼합 소스가 작동하는 데 필요한 컴파일된 Kotlin 클래스를 javac에 제공합니다.
    FileCollection mainOutput = sourceSets["main"].output
    options.compilerArgumentProviders.add(new CommandLineArgumentProvider() {
        @Override
        Iterable<String> asArguments() {
            return ["--patch-module", "YOUR_MODULE_NAME=${mainOutput.asPath}"]
        }
    })
}
```

</tab>
</tabs>

> `module-info.java`는 평소와 같이 `src/main/java` 디렉터리에 넣습니다.
> 
> 모듈의 경우, "package is empty or does not exist" 빌드 실패를 방지하기 위해 Kotlin 파일의 패키지 이름이 `module-info.java`의 패키지 이름과 동일해야 합니다.
>
{style="note"}

다음에 대해 자세히 알아보기:
* [Java 모듈 시스템용 모듈 빌드](https://docs.gradle.org/current/userguide/java_library_plugin.html#sec:java_library_modular)
* [Java 모듈 시스템을 사용한 애플리케이션 빌드](https://docs.gradle.org/current/userguide/application_plugin.html#sec:application_modular)
* [Kotlin에서 "모듈"의 의미](visibility-modifiers.md#modules)

### 기타 세부 사항 {id="other-details"}

#### 컴파일 태스크에서 아티팩트 사용 비활성화 {id="disable-use-of-artifact-in-compilation-task"}

드문 경우지만 순환 의존성 오류로 인해 빌드 실패가 발생할 수 있습니다. 예를 들어, 한 컴파일이 다른 컴파일의 모든 내부 선언을 볼 수 있고 생성된 아티팩트가 두 컴파일 태스크의 출력에 모두 의존하는 여러 컴파일이 있는 경우입니다.

```none
FAILURE: Build failed with an exception.

What went wrong:
Circular dependency between the following tasks:
:lib:compileKotlinJvm
--- :lib:jvmJar
     \--- :lib:compileKotlinJvm (*)
(*) - details omitted (listed previously)
```

이러한 순환 의존성 오류를 해결하기 위해 `archivesTaskOutputAsFriendModule`이라는 Gradle 프로퍼티가 추가되었습니다. 이 프로퍼티는 컴파일 태스크에서 아티팩트 입력을 사용할지 여부를 제어하며, 그 결과로 태스크 의존성이 생성되는지 여부를 결정합니다.

기본적으로 이 프로퍼티는 태스크 의존성을 추적하기 위해 `true`로 설정되어 있습니다. 순환 의존성 오류가 발생하는 경우 컴파일 태스크에서 아티팩트 사용을 비활성화하여 태스크 의존성을 제거하고 순환 의존성 오류를 피할 수 있습니다.

컴파일 태스크에서 아티팩트 사용을 비활성화하려면 `gradle.properties` 파일에 다음을 추가하세요.

```kotlin
kotlin.build.archivesTaskOutputAsFriendModule=false
```

#### 지연(Lazy) Kotlin/JVM 태스크 생성 {id="lazy-kotlin-jvm-task-creation"}

Kotlin 1.8.20부터 Kotlin Gradle 플러그인은 모든 태스크를 등록(register)만 하고 드라이 런(dry run) 시에는 태스크를 구성하지 않습니다.

#### 컴파일 태스크의 destinationDirectory가 기본 위치가 아닌 경우 {id="non-default-location-of-compile-tasks-destinationdirectory"}

Kotlin/JVM `KotlinJvmCompile`/`KotlinCompile` 태스크의 `destinationDirectory` 위치를 재정의하는 경우 빌드 스크립트를 업데이트해야 합니다. JAR 파일의 `sourceSets.main.outputs`에 `sourceSets.main.kotlin.classesDirectories`를 명시적으로 추가해야 합니다.

```kotlin
tasks.jar(type: Jar) {
    from sourceSets.main.outputs
    from sourceSets.main.kotlin.classesDirectories
}
```

## 멀티플랫폼 타깃 지정 {id="targeting-multiple-platforms"}

[멀티플랫폼 프로젝트](https://kotlinlang.org/docs/multiplatform/get-started.html)라고 하는 [여러 플랫폼](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#targets)을 타깃으로 하는 프로젝트에는 `kotlin-multiplatform` 플러그인이 필요합니다.

>`kotlin-multiplatform` 플러그인은 Gradle %minGradleVersion% 이상에서 작동합니다.
>
{style="note"}

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</tab>
</tabs>

[다양한 플랫폼을 위한 Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/get-started.html) 및 [iOS 및 Android를 위한 Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/multiplatform-getting-started.html)에 대해 자세히 알아보세요.

## Android 타깃 지정 {id="targeting-android"}

Android 애플리케이션을 생성할 때는 Android Studio를 사용하는 것이 좋습니다. [Android Gradle 플러그인 사용 방법 알아보기](https://developer.android.com/studio/releases/gradle-plugin).

## 웹 타깃 지정 {id="targeting-the-web"}

Kotlin은 Kotlin Multiplatform을 통해 웹 개발을 위한 두 가지 접근 방식을 제공합니다.

* JavaScript 기반 (Kotlin/JS 컴파일러 사용)
* WebAssembly 기반 (Kotlin/Wasm 컴파일러 사용)

두 접근 방식 모두 Kotlin Multiplatform 플러그인을 사용하지만 서로 다른 유스케이스를 지원합니다. 아래 섹션에서는 Gradle 빌드에서 각 타깃을 구성하는 방법과 각 타깃을 언제 사용해야 하는지 설명합니다.

### JavaScript 타깃 지정 {id="targeting-javascript"}

다음이 목표인 경우 Kotlin/JS를 사용하세요.

* JavaScript/TypeScript 코드베이스와 비즈니스 로직 공유
* Kotlin으로 공유 불가능한 독립형 웹 앱 구축

자세한 내용은 [웹 개발](web-overview.md#kotlin-js)을 참조하세요.

JavaScript를 타깃으로 할 때는 `kotlin-multiplatform` 플러그인을 사용합니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</tab>
</tabs>

브라우저 또는 Node.js 환경에서 실행할지 여부를 지정하여 JavaScript 타깃을 구성합니다.

```kotlin
kotlin {
    js().browser {  // 또는 js().nodejs
        /* ... */
    }
}
```

> [JavaScript용 Gradle 구성에 대한 세부 사항](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#web-targets)을 확인하고 [Kotlin/JS 프로젝트 설정](js-project-setup.md)에 대해 자세히 알아보세요.
>
{style="note"}

### WebAssembly 타깃 지정 {id="targeting-webassembly"}

여러 플랫폼 간에 로직과 UI를 모두 공유하려면 Kotlin/Wasm을 사용하세요. 자세한 내용은 [웹 개발](web-overview.md#kotlin-wasm)을 참조하세요.

JavaScript와 마찬가지로 WebAssembly(Wasm)를 타깃으로 할 때도 `kotlin-multiplatform` 플러그인을 사용합니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</tab>
</tabs>

요구 사항에 따라 다음을 타깃으로 지정할 수 있습니다.

* **`wasmJs`**: 웹 브라우저 또는 Node.js에서 실행용
* **`wasmWasi`**: Wasmtime, WasmEdge 등 [WASI(WebAssembly System Interface)](https://wasi.dev/)를 지원하는 Wasm 환경에서 실행용

웹 브라우저 또는 Node.js용으로 `wasmJs` 타깃을 구성합니다.

```kotlin
kotlin {
    wasmJs {
        browser { // 또는 nodejs
            /* ... */
        }
    }
}
```

WASI 환경의 경우 Node.js 또는 Wasmtime으로 `wasmWasi` 타깃을 구성합니다.

```kotlin
kotlin {
    wasmWasi {
        nodejs { // 또는 wasmtime
            /* ... */
        }
    }
}
```

> [Wasm용 Gradle 구성에 대한 세부 사항 확인하기](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#web-targets).
>
{style="note"}

### 웹 타깃을 위한 Kotlin 및 Java 소스 {id="kotlin-and-java-sources-for-the-web-target"}

KGP는 Kotlin 파일에서만 동작하므로 프로젝트에 Java 파일이 포함되어 있는 경우 Kotlin 파일과 Java 파일을 분리해 두는 것이 좋습니다. 분리하여 저장하지 않는 경우 `sourceSets{}` 블록에 소스 폴더를 지정하세요.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets["main"].apply {
        kotlin.srcDir("src/main/myKotlin")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        main.kotlin.srcDirs += 'src/main/myKotlin'
    }
}
```

</tab>
</tabs>

## KotlinBasePlugin 인터페이스로 구성 작업 트리거 {id="triggering-configuration-actions-with-the-kotlinbaseplugin-interface"}

어떤 Kotlin Gradle 플러그인(JVM, JS, Multiplatform, Native 등)이 적용될 때마다 특정 구성 작업을 트리거하려면 모든 Kotlin 플러그인이 상속하는 `KotlinBasePlugin` 인터페이스를 사용하세요.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.plugin.KotlinBasePlugin

// ...

project.plugins.withType<KotlinBasePlugin>() {
    // 여기에 작업 구성
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.plugin.KotlinBasePlugin

// ...

project.plugins.withType(KotlinBasePlugin.class) {
    // 여기에 작업 구성
}
```

</tab>
</tabs>

## 의존성 구성 {id="configure-dependencies"}

라이브러리에 대한 의존성을 추가하려면 소스 세트 DSL의 `dependencies{}` 블록에서 필요한 [유형](#dependency-types)(예: `implementation`)의 의존성을 설정합니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation("com.example:my-library:1.0")
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        commonMain {
            dependencies {
                implementation 'com.example:my-library:1.0'
            }
        }
    }
}
```

</tab>
</tabs>

### 최상위 레벨에서 의존성 구성 {id="configure-dependencies-at-the-top-level"}
<primary-label ref="experimental-opt-in"/>

멀티플랫폼 프로젝트에서는 최상위 `dependencies {}` 블록을 사용하여 공통 의존성을 구성할 수 있습니다. 여기에 선언된 의존성은 `commonMain` 또는 `commonTest` 소스 세트에 추가된 것처럼 작동합니다.

최상위 `dependencies {}` 블록을 사용하려면 블록 앞에 `@OptIn(ExperimentalKotlinGradlePluginApi::class)` 어노테이션을 추가하여 옵트인해야 합니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    @OptIn(ExperimentalKotlinGradlePluginApi::class)
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    dependencies {
        implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
    }
}
```

</tab>
</tabs>

플랫폼별 의존성은 해당 타깃의 `sourceSets {}` 블록 내부에 추가합니다.

이 기능에 대한 피드백은 [YouTrack](https://youtrack.jetbrains.com/issue/KT-76446)에서 공유할 수 있습니다.

### 의존성 유형 {id="dependency-types"}

요구 사항에 따라 의존성 유형을 선택하세요.

<table>
    <tr>
        <th>유형</th>
        <th>설명</th>
        <th>사용 시기</th>
    </tr>
    <tr>
        <td><code>api</code></td>
        <td>컴파일과 런타임 모두에 사용되며, 라이브러리 사용자에게 노출(export)됩니다.</td>
        <td>의존성의 타입이 현재 모듈의 공개 API에 사용되는 경우 <code>api</code> 의존성을 사용합니다.
        </td>
    </tr>
    <tr>
        <td><code>implementation</code></td>
        <td>현재 모듈의 컴파일 및 런타임에 사용되지만, 해당 <code>implementation</code> 의존성을 가진 모듈에 의존하는 다른 모듈의 컴파일에는 노출되지 않습니다.</td>
        <td>
            <p>모듈의 내부 로직에 필요한 의존성에 사용합니다.</p>
            <p>모듈이 배포되지 않는 최종 애플리케이션인 경우 <code>api</code> 의존성 대신 <code>implementation</code> 의존성을 사용합니다.</p>
        </td>
    </tr>
    <tr>
        <td><code>compileOnly</code></td>
        <td>현재 모듈의 컴파일에 사용되며, 런타임이나 다른 모듈의 컴파일 중에는 사용할 수 없습니다.</td>
        <td>런타임에 서드파티 구현을 사용할 수 있는 API에 사용합니다.</td>
    </tr>
    <tr>
        <td><code>runtimeOnly</code></td>
        <td>런타임에 사용할 수 있지만 어떤 모듈의 컴파일 중에도 표시되지 않습니다.</td>
        <td></td>
    </tr>
</table>

### 표준 라이브러리(stdlib) 의존성 {id="dependency-on-the-standard-library"}

표준 라이브러리(`stdlib`)에 대한 의존성은 각 소스 세트에 자동으로 추가됩니다. 사용되는 표준 라이브러리의 버전은 Kotlin Gradle 플러그인의 버전과 동일합니다.

플랫폼별 소스 세트의 경우 라이브러리의 해당 플랫폼별 변형(variant)이 사용되며, 나머지에는 공통 표준 라이브러리가 추가됩니다. Kotlin Gradle 플러그인은 Gradle 빌드 스크립트의 `compilerOptions.jvmTarget` [컴파일러 옵션](gradle-compiler-options.md)에 따라 적절한 JVM 표준 라이브러리를 선택합니다.

표준 라이브러리 의존성을 명시적으로 선언하는 경우(예: 다른 버전이 필요한 경우), Kotlin Gradle 플러그인은 이를 재정의하거나 두 번째 표준 라이브러리를 추가하지 않습니다.

표준 라이브러리가 전혀 필요하지 않은 경우 `gradle.properties` 파일에 다음 Gradle 프로퍼티를 추가할 수 있습니다.

```none
kotlin.stdlib.default.dependency=false
```

#### 전이 의존성의 버전 일치(Alignment) {id="versions-alignment-of-transitive-dependencies"}

Kotlin 표준 라이브러리 버전 1.9.20부터 Gradle은 표준 라이브러리에 포함된 메타데이터를 사용하여 전이 의존성인 `kotlin-stdlib-jdk7` 및 `kotlin-stdlib-jdk8`의 버전을 자동으로 맞춥니다.

1.8.0부터 1.9.10 사이의 Kotlin 표준 라이브러리 버전에 대한 의존성을 추가하는 경우(예: `implementation("org.jetbrains.kotlin:kotlin-stdlib:1.8.0")`), Kotlin Gradle 플러그인은 전이 `kotlin-stdlib-jdk7` 및 `kotlin-stdlib-jdk8` 의존성에 대해 이 Kotlin 버전을 사용합니다. 이를 통해 서로 다른 표준 라이브러리 버전으로 인한 클래스 중복을 방지합니다. [`kotlin-stdlib-jdk7` 및 `kotlin-stdlib-jdk8`의 `kotlin-stdlib` 병합에 대해 자세히 알아보기](whatsnew18.md#updated-jvm-compilation-target).
`gradle.properties` 파일에서 `kotlin.stdlib.jdk.variants.version.alignment` Gradle 프로퍼티를 사용하여 이 동작을 비활성화할 수 있습니다.

```none
kotlin.stdlib.jdk.variants.version.alignment=false
```

##### 버전을 맞추는 다른 방법 {initial-collapse-state="collapsed" collapsible="true" id="other-ways-to-align-versions"}

* 버전 일치에 문제가 있는 경우 Kotlin [BOM](https://docs.gradle.org/current/userguide/platforms.html#sub:bom_import)을 통해 모든 버전을 맞출 수 있습니다. 빌드 스크립트에서 `kotlin-bom`에 대한 플랫폼 의존성을 선언하세요.

  <tabs group="build-script">
  <tab title="Kotlin" group-key="kotlin">

  ```kotlin
  implementation(platform("org.jetbrains.kotlin:kotlin-bom:%kotlinVersion%"))
  ```

  </tab>
  <tab title="Groovy" group-key="groovy">

  ```groovy
  implementation platform('org.jetbrains.kotlin:kotlin-bom:%kotlinVersion%')
  ```

  </tab>
  </tabs>

* 표준 라이브러리 버전에 대한 의존성을 직접 추가하지 않았지만, 서로 다른 이전 버전의 Kotlin 표준 라이브러리를 전이적으로 가져오는 두 개의 서로 다른 의존성이 있는 경우, 이러한 전이 라이브러리의 버전을 명시적으로 `%kotlinVersion%`으로 요구할 수 있습니다.

  <tabs group="build-script">
  <tab title="Kotlin" group-key="kotlin">

  ```kotlin
  dependencies {
      constraints {
          add("implementation", "org.jetbrains.kotlin:kotlin-stdlib-jdk7") {
              version {
                  require("%kotlinVersion%")
              }
          }
          add("implementation", "org.jetbrains.kotlin:kotlin-stdlib-jdk8") {
              version {
                  require("%kotlinVersion%")
              }
          }
      }
  }
  ```

  </tab>
  <tab title="Groovy" group-key="groovy">

  ```groovy
  dependencies {
      constraints {
          add("implementation", "org.jetbrains.kotlin:kotlin-stdlib-jdk7") {
              version {
                  require("%kotlinVersion%")
              }
          }
          add("implementation", "org.jetbrains.kotlin:kotlin-stdlib-jdk8") {
              version {
                  require("%kotlinVersion%")
              }
          }
      }
  }
  ```

  </tab>
  </tabs>
  
* Kotlin 표준 라이브러리 버전 `%kotlinVersion%`에 대한 의존성(`implementation("org.jetbrains.kotlin:kotlin-stdlib:%kotlinVersion%")`)을 추가하고 구버전(`1.8.0` 이전)의 Kotlin Gradle 플러그인을 사용하는 경우, 표준 라이브러리 버전과 일치하도록 Kotlin Gradle 플러그인을 업데이트하세요.

  
  <tabs group="build-script">
  <tab title="Kotlin" group-key="kotlin">

  ```kotlin
  plugins {
      // `<...>` 부분을 플러그인 이름으로 바꿉니다.
      kotlin("<...>") version "%kotlinVersion%"
  }
  ```

  </tab>
  <tab title="Groovy" group-key="groovy">

  ```groovy
  plugins {
      // `<...>` 부분을 플러그인 이름으로 바꿉니다.
      id "org.jetbrains.kotlin.<...>" version "%kotlinVersion%"
  }
  ```

  </tab>
  </tabs>

* `1.8.0` 이전 버전의 `kotlin-stdlib-jdk7`/`kotlin-stdlib-jdk8`을 사용하고(예: `implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk7:SOME_OLD_KOTLIN_VERSION")`), `kotlin-stdlib:1.8+`를 전이적으로 가져오는 의존성이 있는 경우, [`kotlin-stdlib-jdk<7/8>:SOME_OLD_KOTLIN_VERSION`을 `kotlin-stdlib-jdk*:%kotlinVersion%`으로 교체](whatsnew18.md#updated-jvm-compilation-target)하거나 해당 라이브러리에서 전이되는 `kotlin-stdlib:1.8+`를 [제외(exclude)](https://docs.gradle.org/current/userguide/dependency_downgrade_and_exclude.html#sec:excluding-transitive-deps)하세요.

  <tabs group="build-script">
  <tab title="Kotlin" group-key="kotlin">

  ```kotlin
  dependencies {
      implementation("com.example:lib:1.0") {
          exclude(group = "org.jetbrains.kotlin", module = "kotlin-stdlib")
      }
  }
  ```

  </tab>
  <tab title="Groovy" group-key="groovy">

  ```groovy
  dependencies {
      implementation("com.example:lib:1.0") {
          exclude group: "org.jetbrains.kotlin", module: "kotlin-stdlib"
      }
  }
  ```

  </tab>
  </tabs>

### 테스트 라이브러리 의존성 설정 {id="set-dependencies-on-test-libraries"}

[`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) API는 지원되는 모든 플랫폼에서 Kotlin 프로젝트를 테스트하는 데 사용할 수 있습니다.
Gradle 플러그인이 각 테스트 소스 세트에 해당하는 테스트 의존성을 유추할 수 있도록 `commonTest` 소스 세트에 `kotlin-test` 의존성을 추가하세요.

Kotlin/Native 타깃은 추가 테스트 의존성이 필요하지 않으며, `kotlin.test` API 구현이 기본 내장되어 있습니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test")) // 모든 플랫폼 의존성을 자동으로 가져옵니다.
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        commonTest {
            dependencies {
                implementation kotlin("test") // 모든 플랫폼 의존성을 자동으로 가져옵니다.
            }
        }
    }
}
```

</tab>
</tabs>

> Kotlin 모듈에 대한 의존성 축약형을 사용할 수 있습니다. 예를 들어 "org.jetbrains.kotlin:kotlin-test" 대신 kotlin("test")를 사용할 수 있습니다.
>
{style="note"}

공유 또는 플랫폼별 소스 세트에서도 `kotlin-test` 의존성을 사용할 수 있습니다.

#### kotlin-test의 JVM 변형 {id="jvm-variants-of-kotlin-test"}

Kotlin/JVM의 경우 Gradle은 기본적으로 JUnit 4를 사용합니다. 따라서 `kotlin("test")` 의존성은 JUnit 4용 변형인 `kotlin-test-junit`으로 확인(resolve)됩니다.

빌드 스크립트의 테스트 태스크에서 [`useJUnitPlatform()`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useJUnitPlatform) 또는 [`useTestNG()`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useTestNG)를 호출하여 JUnit 5 또는 TestNG를 선택할 수 있습니다.
다음 예시는 Kotlin Multiplatform 프로젝트를 위한 것입니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        testRuns["test"].executionTask.configure {
            useJUnitPlatform()
        }
    }
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test"))
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        testRuns["test"].executionTask.configure {
            useJUnitPlatform()
        }
    }
    sourceSets {
        commonTest {
            dependencies {
                implementation kotlin("test")
            }
        }
    }
}
```

</tab>
</tabs>

다음 예시는 JVM 프로젝트를 위한 것입니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    testImplementation(kotlin("test"))
}

tasks {
    test {
        useTestNG()
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    testImplementation 'org.jetbrains.kotlin:kotlin-test'
}

test {
    useTestNG()
}
```

</tab>
</tabs>

[JVM에서 JUnit을 사용하여 코드를 테스트하는 방법 알아보기](jvm-test-using-junit.md).

자동 JVM 변형 확인이 구성에 문제를 일으키는 경우가 있습니다. 이 경우 프로젝트의 `gradle.properties` 파일에 다음 줄을 추가하여 필요한 프레임워크를 명시적으로 지정하고 자동 확인을 비활성화할 수 있습니다.

```text
kotlin.test.infer.jvm.variant=false
```

빌드 스크립트에서 `kotlin("test")` 변형을 명시적으로 사용했으나 호환성 충돌로 프로젝트 빌드가 중단된 경우, [호환성 가이드의 해당 문제](compatibility-guide-15.md#do-not-mix-several-jvm-variants-of-kotlin-test-in-a-single-project)를 참조하세요.

### kotlinx 라이브러리 의존성 설정 {id="set-a-dependency-on-a-kotlinx-library"}

멀티플랫폼 라이브러리를 사용하고 공유 코드에 의존해야 하는 경우, 공유 소스 세트에 의존성을 한 번만 설정하세요. `kotlinx-coroutines-core` 또는 `ktor-client-core`와 같은 라이브러리의 기본 아티팩트 이름을 사용합니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        commonMain {
            dependencies {
                implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
            }
        }
    }
}
```

</tab>
</tabs>

플랫폼별 의존성을 위해 kotlinx 라이브러리가 필요한 경우에도 해당 플랫폼 소스 세트에서 라이브러리의 기본 아티팩트 이름을 사용할 수 있습니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        jvmMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        jvmMain {
            dependencies {
                implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
            }
        }
    }
}
```

</tab>
</tabs>

## 저장소(Repository) 선언 {id="declare-repositories"}

공개적으로 사용 가능한 저장소를 선언하여 오픈 소스 의존성을 사용할 수 있습니다. `repositories{}` 블록에 저장소 이름을 설정합니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
repositories {
    mavenCentral()
}
```
</tab>
<tab title="Groovy" group-key="groovy">

```groovy
repositories {
    mavenCentral()
}
```
</tab>
</tabs>

자주 사용되는 저장소로는 [Maven Central](https://central.sonatype.com/) 및 [Google의 Maven 저장소](https://maven.google.com/web/index.html)가 있습니다.

> Maven 프로젝트도 함께 작업하는 경우, Gradle 프로젝트와 Maven 프로젝트 간 전환 시 문제가 발생할 수 있으므로 `mavenLocal()`을 저장소로 추가하지 않는 것을 권장합니다. 반드시 `mavenLocal()` 저장소를 추가해야 하는 경우에는 `repositories{}` 블록의 마지막 저장소로 추가하세요. 자세한 내용은 [The case for mavenLocal()](https://docs.gradle.org/current/userguide/declaring_repositories.html#sec:case-for-maven-local)을 참조하세요.
> 
{style="warning"}

두 개 이상의 서브프로젝트에서 동일한 저장소를 선언해야 하는 경우, `settings.gradle(.kts)` 파일의 `dependencyResolutionManagement{}` 블록에서 저장소를 중앙 집중식으로 선언하세요.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}
```
</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}
```
</tab>
</tabs>

서브프로젝트에 선언된 저장소는 중앙 집중식으로 선언된 저장소보다 우선 적용됩니다. 이 동작을 제어하는 방법과 사용 가능한 옵션에 대한 자세한 내용은 [Gradle 공식 문서](https://docs.gradle.org/current/userguide/declaring_repositories.html#sub:centralized-repository-declaration)를 참조하세요.

## 생성된 소스 등록 {id="register-generated-sources"}
<primary-label ref="experimental-general"/>

IDE, 서드파티 플러그인 및 기타 도구가 생성된 코드와 일반 소스 파일을 구분할 수 있도록 생성된 소스를 등록하세요. 이렇게 하면 IDE와 같은 도구가 UI에서 생성된 코드를 다르게 강조 표시하고 프로젝트 가져오기(import) 시 생성 태스크를 트리거하는 데 도움이 됩니다. 생성된 소스를 등록하려면 [`KotlinSourceSet`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/) 인터페이스를 사용합니다.

Kotlin 파일이 포함된 디렉터리를 등록하려면 `build.gradle.kts` 파일에서 [`SourceDirectorySet`](https://docs.gradle.org/current/kotlin-dsl/gradle/org.gradle.api.file/-source-directory-set/index.html) 타입의 [`generatedKotlin`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/generated-kotlin.html) 프로퍼티를 사용합니다. 예를 들면 다음과 같습니다.

```kotlin
val generatorTask = project.tasks.register("generator") {
    val outputDirectory = project.layout.projectDirectory.dir("src/main/kotlinGen")
    outputs.dir(outputDirectory)
    doLast {
        outputDirectory.file("generated.kt").asFile.writeText(
            // language=kotlin
            """
            fun printHello() {
                println("hello")
            }
            """.trimIndent()
        )
    }
}

kotlin.sourceSets.getByName("main").generatedKotlin.srcDir(generatorTask)
```

이 예제에서는 출력 디렉터리가 `"src/main/kotlinGen"`인 새 태스크 `generator`를 생성합니다. 태스크가 실행되면 `doLast {}` 태스크 액션이 출력 디렉터리에 `generated.kt` 파일을 생성합니다. 마지막으로 이 예제는 태스크의 출력을 생성된 소스로 등록합니다.

Gradle 플러그인을 개발하는 경우 [`allKotlinSources`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/all-kotlin-sources.html) 프로퍼티를 사용하여 [`KotlinSourceSet.kotlin`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/kotlin.html) 및 `KotlinSourceSet.generatedKotlin` 프로퍼티에 등록된 모든 소스에 접근할 수 있습니다.

## 다음 단계 {id="what-s-next"}

다음에 대해 자세히 알아보기:
* [컴파일러 옵션 및 옵션 전달 방법](gradle-compiler-options.md)
* [증분 컴파일, 캐시 지원, 빌드 리포트 및 Kotlin 데몬](gradle-compilation-and-caches.md)
* [Gradle 기초 및 세부 사항](https://docs.gradle.org/current/userguide/userguide.html)
* [Gradle 플러그인 변형(Variant) 지원](gradle-plugin-variants.md)