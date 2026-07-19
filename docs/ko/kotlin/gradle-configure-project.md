[//]: # (title: Gradle 프로젝트 구성하기)

[Gradle](https://docs.gradle.org/current/userguide/userguide.html)을 사용하여 Kotlin 프로젝트를 빌드하려면, 
빌드 스크립트 파일인 `build.gradle(.kts)`에 [Kotlin Gradle 플러그인을 추가](#플러그인-적용하기)하고 
해당 파일에서 [프로젝트의 의존성을 구성](#의존성-구성하기)해야 합니다.

> 빌드 스크립트의 내용에 대해 자세히 알아보려면,
> [빌드 스크립트 탐색하기](get-started-with-jvm-gradle-project.md#explore-the-build-script) 섹션을 방문하세요.
>
{style="note"}

## 플러그인 적용하기

Kotlin Gradle 플러그인을 적용하려면 Gradle 플러그인 DSL의 [`plugins{}` 블록](https://docs.gradle.org/current/userguide/plugins.html#sec:plugins_block)을 사용하세요:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    // <...>를 대상 환경에 적합한 플러그인 이름으로 교체하세요
    kotlin("<...>") version "%kotlinVersion%"
    // 예를 들어, 대상 환경이 JVM인 경우:
    // kotlin("jvm") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    // <...>를 대상 환경에 적합한 플러그인 이름으로 교체하세요
    id 'org.jetbrains.kotlin.<...>' version '%kotlinVersion%'
    // 예를 들어, 대상 환경이 JVM인 경우: 
    // id 'org.jetbrains.kotlin.jvm' version '%kotlinVersion%'
}
```

</tab>
</tabs>

> Kotlin Gradle 플러그인(KGP)과 Kotlin은 동일한 버전 번호를 공유합니다.
>
{style="note"}

프로젝트를 구성할 때, 사용 가능한 Gradle 버전과 Kotlin Gradle 플러그인(KGP)의 호환성을 확인하세요. 
다음 표는 Gradle 및 Android Gradle 플러그인(AGP)의 최소 및 최대 **전체 지원(fully supported)** 버전입니다:

| KGP 버전      | Gradle 최소 및 최대 버전               | AGP 최소 및 최대 버전                               |
|---------------|---------------------------------------|-----------------------------------------------------|
| 2.4.0-2.4.10  | %minGradleVersion%–%maxGradleVersion% | %minAndroidGradleVersion%–%maxAndroidGradleVersion% |
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

> *Kotlin 2.0.20–2.0.21 및 Kotlin 2.1.0–2.1.10은 Gradle 8.6까지 완전히 호환됩니다. 
> Gradle 버전 8.7–8.10도 지원되지만, 한 가지 예외가 있습니다. Kotlin 멀티플랫폼 Gradle 플러그인을 사용하는 경우, JVM 타겟에서 `withJava()` 함수를 호출하는 멀티플랫폼 프로젝트에서 지원 중단(deprecation) 경고가 표시될 수 있습니다. 
> 자세한 내용은 [기본으로 생성되는 Java 소스 세트](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#java-source-sets-created-by-default)를 참조하세요.
>
{style="warning"}

최신 릴리스까지의 Gradle 및 AGP 버전을 사용할 수도 있지만, 이 경우 지원 중단 경고가 발생하거나 일부 새로운 기능이 작동하지 않을 수 있음을 유념하세요.

예를 들어, Kotlin Gradle 플러그인 및 `kotlin-multiplatform` 플러그인 %kotlinVersion%은 프로젝트 컴파일을 위해 최소 %minGradleVersion% 버전의 Gradle이 필요합니다.

마찬가지로, 전체 지원되는 최대 버전은 %maxGradleVersion%입니다. 이 버전은 지원 중단된 Gradle 메서드 및 프로퍼티가 없으며 모든 최신 Gradle 기능을 지원합니다.

### 이전 KGP 버전 {initial-collapse-state="collapsed" collapsible="true"}

| KGP 버전      | Gradle 최소 및 최대 버전               | AGP 최소 및 최대 버전                               |
|---------------|---------------------------------------|-----------------------------------------------------|
| 1.9.0–1.9.10  | 6.8.3–7.6.0                           | 4.2.2–7.4.0                                         |
| 1.8.20–1.8.22 | 6.8.3–7.6.0                           | 4.1.3–7.4.0                                         |      
| 1.8.0–1.8.11  | 6.8.3–7.3.3                           | 4.1.3–7.2.1                                         |   
| 1.7.20–1.7.22 | 6.7.1–7.1.1                           | 3.6.4–7.0.4                                         |
| 1.7.0–1.7.10  | 6.7.1–7.0.2                           | 3.4.3–7.0.2                                         |
| 1.6.20–1.6.21 | 6.1.1–7.0.2                           | 3.4.3–7.0.2                                         |

### 프로젝트 내 Kotlin Gradle 플러그인 데이터

기본적으로 Kotlin Gradle 플러그인은 프로젝트별 영구 데이터를 프로젝트 루트의 `.kotlin` 디렉토리에 저장합니다.

> `.kotlin` 디렉토리를 버전 관리 시스템에 커밋하지 마세요.
> 예를 들어, Git을 사용하는 경우 프로젝트의 `.gitignore` 파일에 `.kotlin`을 추가하세요.
>
{style="warning"}

이 동작을 구성하기 위해 프로젝트의 `gradle.properties` 파일에 추가할 수 있는 프로퍼티들이 있습니다:

| Gradle 프로퍼티                                      | 설명                                                                                                                                       |
|-----------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `kotlin.project.persistent.dir`                     | 프로젝트 수준 데이터가 저장되는 위치를 구성합니다. 기본값: `<project-root-directory>/.kotlin`                                      |
| `kotlin.project.persistent.dir.gradle.disableWrite` | `.gradle` 디렉토리에 Kotlin 데이터를 쓰는 것을 비활성화할지 여부를 제어합니다(이전 IDEA 버전과의 하위 호환성을 위해). 기본값: false |

## JVM 타겟팅

JVM을 타겟으로 하려면 Kotlin JVM 플러그인을 적용하세요.

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

이 블록에서 `version`은 리터럴(literal)이어야 하며, 다른 빌드 스크립트에서 적용할 수 없습니다.

### Kotlin 및 Java 소스

Kotlin 소스와 Java 소스는 동일한 디렉토리에 저장하거나 서로 다른 디렉토리에 배치할 수 있습니다.

기본 규칙은 서로 다른 디렉토리를 사용하는 것입니다:

```text
project
    - src
        - main (root)
            - kotlin
            - java
```

> `src/*/kotlin` 디렉토리에 Java `.java` 파일을 저장하지 마세요. 해당 `.java` 파일들은 컴파일되지 않습니다.
> 
> 대신 `src/main/java`를 사용할 수 있습니다.
>
{style="warning"} 

기본 규칙을 사용하지 않는 경우 해당 `sourceSets` 프로퍼티를 업데이트해야 합니다:

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

### 관련 컴파일 태스크의 JVM 타겟 호환성 확인

빌드 모듈에는 다음과 같이 관련된 컴파일 태스크가 있을 수 있습니다:
* `compileKotlin` 및 `compileJava`
* `compileTestKotlin` 및 `compileTestJava`

> `main` 및 `test` 소스 세트 컴파일 태스크는 서로 관련이 없습니다.
>
{style="note"}

이와 같이 관련된 태스크의 경우, Kotlin Gradle 플러그인은 JVM 타겟 호환성을 확인합니다. `kotlin` 확장 또는 태스크의 [`jvmTarget` 속성](gradle-compiler-options.md#attributes-specific-to-jvm)과 `java` 확장 또는 태스크의 [`targetCompatibility`](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java-extension) 값이 다르면 JVM 타겟 비호환성이 발생합니다. 예를 들어:
`compileKotlin` 태스크는 `jvmTarget=1.8`이고,
`compileJava` 태스크는 `targetCompatibility=15`를 갖거나 [상속](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java-extension)받은 경우입니다.

`gradle.properties` 파일에서 `kotlin.jvm.target.validation.mode` 프로퍼티를 다음 중 하나로 설정하여 전체 프로젝트에 대한 이 확인 동작을 구성할 수 있습니다:

* `error` – 플러그인이 빌드를 실패시킵니다. Gradle 8.0 이상 프로젝트의 기본값입니다.
* `warning` – 플러그인이 경고 메시지를 출력합니다. Gradle 8.0 미만 프로젝트의 기본값입니다.
* `ignore` – 플러그인이 확인을 건너뛰고 메시지를 생성하지 않습니다.

`build.gradle(.kts)` 파일의 태스크 레벨에서 구성할 수도 있습니다:

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

JVM 타겟 비호환성을 피하려면 [툴체인을 구성](#gradle-java-툴체인-지원)하거나 JVM 버전을 수동으로 맞추세요.

#### 타겟이 호환되지 않을 때 발생할 수 있는 문제 {initial-collapse-state="collapsed" collapsible="true"}

Kotlin 및 Java 소스 세트에 대해 JVM 타겟을 수동으로 설정하는 방법은 두 가지가 있습니다:
* [Java 툴체인 설정](#gradle-java-툴체인-지원)을 통한 암시적 방법.
* `kotlin` 확장 또는 태스크의 `jvmTarget` 속성과 `java` 확장 또는 태스크의 `targetCompatibility`를 설정하는 명시적 방법.

다음과 같은 경우 JVM 타겟 비호환성이 발생합니다:
* `jvmTarget`과 `targetCompatibility`에 명시적으로 다른 값을 설정한 경우.
* 기본 구성을 사용 중이며 JDK가 `1.8`이 아닌 경우.

빌드 스크립트에 Kotlin JVM 플러그인만 있고 JVM 타겟에 대한 추가 설정이 없는 기본 구성을 예로 들어 보겠습니다:

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

빌드 스크립트에 `jvmTarget` 값에 대한 명시적인 정보가 없으면 기본값은 `null`이며, 컴파일러는 이를 기본값인 `1.8`로 해석합니다. `targetCompatibility`는 현재 Gradle의 JDK 버전과 같으며, 이는 사용자의 JDK 버전과 같습니다([Java 툴체인 방식](gradle-configure-project.md#gradle-java-toolchains-support)을 사용하지 않는 경우). 사용자의 JDK 버전이 `%jvmLTSVersionSupportedByKotlin%`이라고 가정하면, 게시된 라이브러리 아티팩트는 JDK %jvmLTSVersionSupportedByKotlin% 이상과 [호환된다고 선언](https://docs.gradle.org/current/userguide/publishing_gradle_module_metadata.html)하게 됩니다(`org.gradle.jvm.version=%jvmLTSVersionSupportedByKotlin%`). 이는 잘못된 것입니다. 이 경우 바이트코드 버전이 `1.8`이더라도 메인 프로젝트에서 이 라이브러리를 추가하려면 Java %jvmLTSVersionSupportedByKotlin%를 사용해야 합니다. 이 문제를 해결하려면 [툴체인을 구성](gradle-configure-project.md#gradle-java-toolchains-support)하세요.

### Gradle Java 툴체인 지원

> Android 사용자를 위한 주의 사항: Gradle 툴체인 지원을 사용하려면 Android Gradle 플러그인(AGP) 버전 8.1.0-alpha09 이상을 사용하세요. 
> 
> Gradle Java 툴체인 지원은 AGP 7.4.0부터 [사용 가능](https://issuetracker.google.com/issues/194113162)합니다.
> 그럼에도 불구하고, [이 이슈](https://issuetracker.google.com/issues/260059413) 때문에 AGP 버전 8.1.0-alpha09 이전까지는 `targetCompatibility`가 툴체인의 JDK와 동일하게 설정되지 않았습니다.
> 8.1.0-alpha09 미만 버전을 사용하는 경우 `compileOptions`를 통해 `targetCompatibility`를 수동으로 구성해야 합니다. `<MAJOR_JDK_VERSION>` 플레이스홀더를 사용하려는 JDK 버전으로 교체하세요:
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
이 기능을 사용하면 다음을 수행할 수 있습니다:
* Gradle을 실행하는 JDK/JRE와 다른 JDK/JRE를 사용하여 컴파일, 테스트 및 실행을 수행할 수 있습니다.
* 아직 릴리스되지 않은 언어 버전으로 코드를 컴파일하고 테스트할 수 있습니다.

툴체인 지원을 통해 Gradle은 로컬 JDK를 자동 감지하고 빌드에 필요한 누락된 JDK를 설치할 수 있습니다.
이제 Gradle 자체는 어떤 JDK에서든 실행될 수 있으며, 주요 JDK 버전에 의존하는 태스크에 대해 [원격 빌드 캐시 기능](gradle-compilation-and-caches.md#gradle-build-cache-support)을 계속 재사용할 수 있습니다.

Kotlin Gradle 플러그인은 Kotlin/JVM 컴파일 태스크에 대해 Java 툴체인을 지원합니다. JS 및 Native 태스크는 툴체인을 사용하지 않습니다.
Kotlin 컴파일러는 항상 Gradle 데몬이 실행 중인 JDK에서 실행됩니다.
Java 툴체인은 다음을 수행합니다:
* JVM 타겟에 사용할 수 있는 [`-jdk-home` 옵션](compiler-reference.md#jdk-home-path)을 설정합니다.
* 사용자가 `jvmTarget` 옵션을 명시적으로 설정하지 않은 경우, [`compilerOptions.jvmTarget`](gradle-compiler-options.md#attributes-specific-to-jvm)을 툴체인의 JDK 버전으로 설정합니다.
  사용자가 툴체인을 구성하지 않으면 `jvmTarget` 필드는 기본값을 사용합니다.
  [JVM 타겟 호환성](#관련-컴파일-태스크의-jvm-타겟-호환성-확인)에 대해 자세히 알아보세요.
* 모든 Java 컴파일, 테스트 및 javadoc 태스크에서 사용할 툴체인을 설정합니다.
* [`kapt` 워커](kapt.md#run-kapt-tasks-in-parallel)가 실행되는 JDK에 영향을 줍니다.

툴체인을 설정하려면 다음 코드를 사용하세요. `<MAJOR_JDK_VERSION>` 플레이스홀더를 사용하려는 JDK 버전으로 교체하세요:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvmToolchain {
        languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>))
    }
    // 또는 더 짧게:
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
    // 또는 더 짧게:
    jvmToolchain(<MAJOR_JDK_VERSION>)
    // 예:
    jvmToolchain(%jvmLTSVersionSupportedByKotlin%)
}
```

</tab>
</tabs>

`kotlin` 확장을 통해 툴체인을 설정하면 Java 컴파일 태스크의 툴체인도 업데이트된다는 점에 유의하세요.

`java` 확장을 통해 툴체인을 설정할 수도 있으며, Kotlin 컴파일 태스크는 이를 사용합니다:

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

Gradle 8.0.2 이상을 사용하는 경우 [툴체인 리졸버 플러그인](https://docs.gradle.org/current/userguide/toolchains.html#sub:download_repositories)도 추가해야 합니다.
이 유형의 플러그인은 어떤 레포지토리에서 툴체인을 다운로드할지 관리합니다. 예시로 `settings.gradle(.kts)`에 다음 플러그인을 추가하세요:

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

[Gradle 사이트](https://docs.gradle.org/current/userguide/toolchains.html#sub:download_repositories)에서 `foojay-resolver-convention`의 버전이 Gradle 버전과 일치하는지 확인하세요.

> Gradle이 어떤 툴체인을 사용하는지 확인하려면, Gradle 빌드를 [로그 레벨 `--info`](https://docs.gradle.org/current/userguide/logging.html#sec:choosing_a_log_level)로 실행하고 출력에서 `[KOTLIN] Kotlin compilation 'jdkHome' argument:`로 시작하는 문자열을 찾으세요.
> 콜론 뒤의 부분이 툴체인의 JDK 버전이 됩니다.
>
{style="note"}

특정 태스크에 대해 모든 JDK(로컬 포함)를 설정하려면 [태스크 DSL](#태스크-dsl로-jdk-버전-설정하기)을 사용하세요.

[Kotlin 플러그인의 Gradle JVM 툴체인 지원](https://blog.jetbrains.com/kotlin/2021/11/gradle-jvm-toolchain-support-in-the-kotlin-plugin/)에 대해 자세히 알아보세요.

### 태스크 DSL로 JDK 버전 설정하기

태스크 DSL을 사용하면 `UsesKotlinJavaToolchain` 인터페이스를 구현하는 모든 태스크에 대해 JDK 버전을 설정할 수 있습니다.
현재 이러한 태스크는 `KotlinCompile` 및 `KaptTask`입니다.
Gradle이 주요 JDK 버전을 검색하도록 하려면 빌드 스크립트에서 `<MAJOR_JDK_VERSION>` 플레이스홀더를 교체하세요:

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

또는 로컬 JDK 경로를 지정하고 `<LOCAL_JDK_VERSION>` 플레이스홀더를 해당 JDK 버전으로 교체할 수 있습니다:

```kotlin
tasks.withType<UsesKotlinJavaToolchain>().configureEach {
    kotlinJavaToolchain.jdk.use(
        "/path/to/local/jdk", // 사용자의 JDK 경로를 입력하세요
        JavaVersion.<LOCAL_JDK_VERSION> // 예: JavaVersion.17
    )
}
```

### 컴파일 태스크 연결(Associate)하기

컴파일 간에 한 컴파일이 다른 컴파일의 컴파일된 출력을 사용하도록 하는 관계를 설정하여 컴파일을 _연결(associate)_할 수 있습니다. 컴파일을 연결하면 그들 사이에 `internal` 가시성이 생성됩니다.

Kotlin 컴파일러는 각 타겟의 `test` 및 `main` 컴파일과 같이 일부 컴파일을 기본적으로 연결합니다.
사용자 정의 컴파일 중 하나가 다른 것과 연결되어야 함을 나타내야 하는 경우, 직접 연결된 컴파일을 만드세요.

IDE가 소스 세트 간의 가시성 추론을 위해 연결된 컴파일을 지원하도록 하려면 `build.gradle(.kts)`에 다음 코드를 추가하세요:

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

여기서 `integrationTest` 컴파일은 기능 테스트(functional test)에서 `internal` 객체에 접근할 수 있도록 `main` 컴파일과 연결됩니다.

### Java 모듈(JPMS)이 활성화된 상태로 구성하기

Kotlin Gradle 플러그인을 [Java 모듈](https://www.oracle.com/corporate/features/understanding-java-9-modules.html)과 함께 작동하게 하려면 빌드 스크립트에 다음 줄을 추가하고 `YOUR_MODULE_NAME`을 JPMS 모듈 참조(예: `org.company.module`)로 교체하세요:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">
        
```kotlin
// Gradle 7.0 미만 버전을 사용하는 경우 다음 세 줄을 추가하세요
java {
    modularity.inferModulePath.set(true)
}

tasks.named("compileJava", JavaCompile::class.java) {
    options.compilerArgumentProviders.add(CommandLineArgumentProvider {
        // javac에 컴파일된 Kotlin 클래스를 제공합니다. Java/Kotlin 혼합 소스가 작동하는 데 필요합니다.
        listOf("--patch-module", "YOUR_MODULE_NAME=${sourceSets["main"].output.asPath}")
    })
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// Gradle 7.0 미만 버전을 사용하는 경우 다음 세 줄을 추가하세요
java {
    modularity.inferModulePath = true
}

tasks.named("compileJava", JavaCompile.class) {
    options.compilerArgumentProviders.add(new CommandLineArgumentProvider() {
        @Override
        Iterable<String> asArguments() {
            // javac에 컴파일된 Kotlin 클래스를 제공합니다. Java/Kotlin 혼합 소스가 작동하는 데 필요합니다.
            return ["--patch-module", "YOUR_MODULE_NAME=${sourceSets["main"].output.asPath}"]
        }
    })
}
```

</tab>
</tabs>

> 평소와 같이 `module-info.java`를 `src/main/java` 디렉토리에 배치하세요.
> 
> 모듈의 경우, "패키지가 비어 있거나 존재하지 않음" 빌드 실패를 방지하기 위해 Kotlin 파일의 패키지 이름이 `module-info.java`의 패키지 이름과 동일해야 합니다.
>
{style="note"}

다음에 대해 자세히 알아보세요:
* [Java 모듈 시스템을 위한 모듈 빌드](https://docs.gradle.org/current/userguide/java_library_plugin.html#sec:java_library_modular)
* [Java 모듈 시스템을 사용한 애플리케이션 빌드](https://docs.gradle.org/current/userguide/application_plugin.html#sec:application_modular)
* [Kotlin에서 "모듈"이 의미하는 것](visibility-modifiers.md#modules)

### 기타 상세 사항

#### 컴파일 태스크에서 아티팩트 사용 비활성화

드문 경우지만 순환 의존성 오류로 인해 빌드 실패가 발생할 수 있습니다. 예를 들어, 한 컴파일이 다른 컴파일의 모든 내부 선언을 볼 수 있는 여러 컴파일이 있고 생성된 아티팩트가 두 컴파일 태스크의 출력에 모두 의존하는 경우입니다:

```none
FAILURE: Build failed with an exception.

What went wrong:
Circular dependency between the following tasks:
:lib:compileKotlinJvm
--- :lib:jvmJar
     \--- :lib:compileKotlinJvm (*)
(*) - details omitted (listed previously)
```

이 순환 의존성 오류를 해결하기 위해 `archivesTaskOutputAsFriendModule`이라는 Gradle 프로퍼티를 추가했습니다.
이 프로퍼티는 컴파일 태스크에서 아티팩트 입력의 사용을 제어하고 결과적으로 태스크 의존성이 생성되는지 여부를 결정합니다.

기본적으로 이 프로퍼티는 태스크 의존성을 추적하기 위해 `true`로 설정되어 있습니다. 순환 의존성 오류가 발생하면 컴파일 태스크에서 아티팩트 사용을 비활성화하여 태스크 의존성을 제거하고 오류를 피할 수 있습니다.

컴파일 태스크에서 아티팩트 사용을 비활성화하려면 `gradle.properties` 파일에 다음을 추가하세요:

```kotlin
kotlin.build.archivesTaskOutputAsFriendModule=false
```

#### 지연된(Lazy) Kotlin/JVM 태스크 생성

Kotlin 1.8.20부터 Kotlin Gradle 플러그인은 모든 태스크를 등록(register)하며 드라이 런(dry run) 시에는 태스크를 구성하지 않습니다.

#### 컴파일 태스크 destinationDirectory의 기본값이 아닌 위치

Kotlin/JVM `KotlinJvmCompile`/`KotlinCompile` 태스크의 `destinationDirectory` 위치를 오버라이드하는 경우 빌드 스크립트를 업데이트해야 합니다. JAR 파일에서 `sourceSets.main.outputs`에 `sourceSets.main.kotlin.classesDirectories`를 명시적으로 추가해야 합니다:

```kotlin
tasks.jar(type: Jar) {
    from sourceSets.main.outputs
    from sourceSets.main.kotlin.classesDirectories
}
```

## 멀티플랫폼 타겟팅

[멀티플랫폼 프로젝트](https://kotlinlang.org/docs/multiplatform/get-started.html)라고 불리는 [여러 플랫폼](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#targets)을 타겟으로 하는 프로젝트에는 `kotlin-multiplatform` 플러그인이 필요합니다.

> `kotlin-multiplatform` 플러그인은 Gradle %minGradleVersion% 이상에서 작동합니다.
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

[다양한 플랫폼을 위한 Kotlin 멀티플랫폼](https://kotlinlang.org/docs/multiplatform/get-started.html) 및 [iOS와 Android를 위한 Kotlin 멀티플랫폼](https://kotlinlang.org/docs/multiplatform/multiplatform-getting-started.html)에 대해 자세히 알아보세요.

## Android 타겟팅

Android 애플리케이션 제작에는 Android Studio 사용을 권장합니다. [Android Gradle 플러그인 사용 방법](https://developer.android.com/studio/releases/gradle-plugin)을 알아보세요.

## 웹 타겟팅

Kotlin은 Kotlin 멀티플랫폼을 통해 웹 개발을 위한 두 가지 접근 방식을 제공합니다:

* JavaScript 기반 (Kotlin/JS 컴파일러 사용)
* WebAssembly 기반 (Kotlin/Wasm 컴파일러 사용)

두 방식 모두 Kotlin 멀티플랫폼 플러그인을 사용하지만 서로 다른 사용 사례를 지원합니다.
아래 섹션에서는 Gradle 빌드에서 각 타겟을 구성하는 방법과 사용 시기를 설명합니다.

### JavaScript 타겟팅

다음이 목표인 경우 Kotlin/JS를 사용하세요:

* JavaScript/TypeScript 코드베이스와 비즈니스 로직 공유
* Kotlin으로 공유 불가능한 웹 앱 빌드

자세한 내용은 [웹 개발](web-overview.md#kotlin-js)을 참조하세요.

JavaScript를 타겟으로 할 때 `kotlin-multiplatform` 플러그인을 사용하세요:

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

브라우저 또는 Node.js 환경에서 실행되어야 하는지 지정하여 JavaScript 타겟을 구성하세요:

```kotlin
kotlin {
    js().browser {  // 또는 js().nodejs
        /* ... */
    }
}
```

> [JavaScript를 위한 Gradle 구성에 대한 추가 상세 정보](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#web-targets)를 확인하고 [Kotlin/JS 프로젝트 설정](js-project-setup.md)에 대해 자세히 알아보세요.
>
{style="note"}

### WebAssembly 타겟팅

여러 플랫폼에서 로직과 UI를 모두 공유하려면 Kotlin/Wasm을 사용하세요. 자세한 내용은 [웹 개발](web-overview.md#kotlin-wasm)을 참조하세요.

JavaScript와 마찬가지로 WebAssembly(Wasm)를 타겟으로 할 때 `kotlin-multiplatform` 플러그인을 사용합니다:

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

요구 사항에 따라 다음을 타겟으로 할 수 있습니다:

* **`wasmJs`**: 브라우저 또는 Node.js에서 실행용
* **`wasmWasi`**: Wasmtime, WasmEdge 등과 같이 [WASI (WebAssembly System Interface)](https://wasi.dev/)를 지원하는 Wasm 환경에서 실행용

웹 브라우저 또는 Node.js를 위한 `wasmJs` 타겟을 구성합니다:

```kotlin
kotlin {
    wasmJs {
        browser { // 또는 nodejs
            /* ... */
        }
    }
}
```

WASI 환경의 경우 `wasmWasi` 타겟을 구성합니다:

```kotlin
kotlin {
    wasmWasi {
        nodejs {
            /* ... */
        }
    }
}
```

> [Wasm을 위한 Gradle 구성에 대한 추가 상세 정보](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#web-targets)를 확인하세요.
>
{style="note"}

### 웹 타겟을 위한 Kotlin 및 Java 소스

KGP는 Kotlin 파일에서만 작동하므로, Kotlin 파일과 Java 파일을 별도로 분리하여 보관하는 것이 좋습니다(프로젝트에 Java 파일이 포함된 경우). 별도로 저장하지 않는 경우 `sourceSets{}` 블록에서 소스 폴더를 지정하세요:

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

## KotlinBasePlugin 인터페이스를 사용한 구성 작업 트리거

모든 Kotlin Gradle 플러그인(JVM, JS, 멀티플랫폼, Native 등)이 적용될 때마다 구성을 수행하려면 모든 Kotlin 플러그인이 상속받는 `KotlinBasePlugin` 인터페이스를 사용하세요:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.plugin.KotlinBasePlugin

// ...

project.plugins.withType<KotlinBasePlugin>() {
    // 여기에 구성을 작성하세요
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.plugin.KotlinBasePlugin

// ...

project.plugins.withType(KotlinBasePlugin.class) {
    // 여기에 구성을 작성하세요
}
```

</tab>
</tabs>

## 의존성 구성하기

라이브러리에 대한 의존성을 추가하려면 소스 세트 DSL의 `dependencies{}` 블록에서 필요한 [의존성 유형](#의존성-유형)(예: `implementation`)을 설정하세요.

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

### 최상위 레벨에서 의존성 구성하기
<primary-label ref="experimental-opt-in"/>

최상위 `dependencies {}` 블록을 사용하여 멀티플랫폼 프로젝트의 공통 의존성을 구성할 수 있습니다. 여기에 선언된 의존성은 `commonMain` 또는 `commonTest` 소스 세트에 추가된 것처럼 작동합니다.

최상위 `dependencies {}` 블록을 사용하려면 블록 앞에 `@OptIn(ExperimentalKotlinGradlePluginApi::class)` 어노테이션을 추가하여 옵트인(opt in)하세요:

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

해당 타겟의 `sourceSets {}` 블록 내부에 플랫폼별 의존성을 추가하세요.

이 기능에 대한 피드백은 [YouTrack](https://youtrack.jetbrains.com/issue/KT-76446)에서 공유할 수 있습니다.

### 의존성 유형

요구 사항에 따라 의존성 유형을 선택하세요.

<table>
    <tr>
        <th>유형</th>
        <th>설명</th>
        <th>사용 시기</th>
    </tr>
    <tr>
        <td><code>api</code></td>
        <td>컴파일과 런타임 모두에서 사용되며 라이브러리 사용자에게 노출됩니다.</td>
        <td>의존성의 타입이 현재 모듈의 공개 API에서 사용되는 경우 <code>api</code> 의존성을 사용하세요.
        </td>
    </tr>
    <tr>
        <td><code>implementation</code></td>
        <td>현재 모듈의 컴파일과 런타임에 사용되지만, 이 모듈에 의존하는 다른 모듈의 컴파일에는 노출되지 않습니다.</td>
        <td>
            <p>모듈의 내부 로직에 필요한 의존성에 사용하세요.</p>
            <p>모듈이 게시되지 않는 엔드포인트 애플리케이션인 경우 <code>api</code> 의존성 대신 <code>implementation</code> 의존성을 사용하세요.</p>
        </td>
    </tr>
    <tr>
        <td><code>compileOnly</code></td>
        <td>현재 모듈의 컴파일에 사용되며 런타임이나 다른 모듈의 컴파일 시에는 사용할 수 없습니다.</td>
        <td>런타임에 사용 가능한 서드파티 구현이 있는 API에 사용하세요.</td>
    </tr>
    <tr>
        <td><code>runtimeOnly</code></td>
        <td>런타임에는 사용할 수 있지만 모듈의 컴파일 시에는 보이지 않습니다.</td>
        <td></td>
    </tr>
</table>

### 표준 라이브러리 의존성

표준 라이브러리(`stdlib`)에 대한 의존성은 각 소스 세트에 자동으로 추가됩니다. 사용되는 표준 라이브러리의 버전은 Kotlin Gradle 플러그인의 버전과 동일합니다.

플랫폼별 소스 세트의 경우 해당 플랫폼별 라이브러리 변형이 사용되며, 나머지에는 공통 표준 라이브러리가 추가됩니다. Kotlin Gradle 플러그인은 Gradle 빌드 스크립트의 `compilerOptions.jvmTarget` [컴파일러 옵션](gradle-compiler-options.md)에 따라 적절한 JVM 표준 라이브러리를 선택합니다.

표준 라이브러리 의존성을 명시적으로 선언하면(예: 다른 버전이 필요한 경우), Kotlin Gradle 플러그인은 이를 오버라이드하거나 두 번째 표준 라이브러리를 추가하지 않습니다.

표준 라이브러리가 전혀 필요하지 않은 경우 `gradle.properties` 파일에 다음 Gradle 프로퍼티를 추가할 수 있습니다:

```none
kotlin.stdlib.default.dependency=false
```

#### 전이적 의존성의 버전 정렬(Alignment)

Kotlin 표준 라이브러리 버전 1.9.20부터 Gradle은 표준 라이브러리에 포함된 메타데이터를 사용하여 전이적(transitive) `kotlin-stdlib-jdk7` 및 `kotlin-stdlib-jdk8` 의존성을 자동으로 정렬합니다.

1.8.0 – 1.9.10 사이의 Kotlin 표준 라이브러리 버전(예: `implementation("org.jetbrains.kotlin:kotlin-stdlib:1.8.0")`)에 대한 의존성을 추가하면, Kotlin Gradle 플러그인은 전이적 `kotlin-stdlib-jdk7` 및 `kotlin-stdlib-jdk8` 의존성에 이 Kotlin 버전을 사용합니다. 이를 통해 서로 다른 표준 라이브러리 버전에서 발생하는 클래스 중복을 방지합니다. [`kotlin-stdlib-jdk7` 및 `kotlin-stdlib-jdk8`이 `kotlin-stdlib`으로 병합됨](whatsnew18.md#updated-jvm-compilation-target)에 대해 자세히 알아보세요. `gradle.properties` 파일에서 `kotlin.stdlib.jdk.variants.version.alignment` Gradle 프로퍼티를 사용하여 이 동작을 비활성화할 수 있습니다:

```none
kotlin.stdlib.jdk.variants.version.alignment=false
```

##### 버전을 정렬하는 다른 방법 {initial-collapse-state="collapsed" collapsible="true"}

* 버전 정렬에 문제가 있는 경우 Kotlin [BOM](https://docs.gradle.org/current/userguide/platforms.html#sub:bom_import)을 통해 모든 버전을 정렬할 수 있습니다. 빌드 스크립트에서 `kotlin-bom`에 대한 플랫폼 의존성을 선언하세요:

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

* 표준 라이브러리 버전에 대한 의존성을 직접 추가하지 않았지만, 서로 다른 이전 버전의 Kotlin 표준 라이브러리를 전이적으로 가져오는 두 개의 다른 의존성이 있는 경우, 이러한 전이적 라이브러리에 대해 `%kotlinVersion%` 버전을 명시적으로 요구할 수 있습니다:

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
  
* Kotlin 표준 라이브러리 버전 `%kotlinVersion%`(`implementation("org.jetbrains.kotlin:kotlin-stdlib:%kotlinVersion%")`)에 대한 의존성을 추가하고 이전 버전(`1.8.0` 미만)의 Kotlin Gradle 플러그인을 사용하는 경우, Kotlin Gradle 플러그인을 표준 라이브러리 버전과 일치하도록 업데이트하세요:

  
  <tabs group="build-script">
  <tab title="Kotlin" group-key="kotlin">

  ```kotlin
  plugins {
      // <...>를 플러그인 이름으로 교체하세요
      kotlin("<...>") version "%kotlinVersion%"
  }
  ```

  </tab>
  <tab title="Groovy" group-key="groovy">

  ```groovy
  plugins {
      // <...>를 플러그인 이름으로 교체하세요
      id "org.jetbrains.kotlin.<...>" version "%kotlinVersion%"
  }
  ```

  </tab>
  </tabs>

* `1.8.0` 이전 버전의 `kotlin-stdlib-jdk7`/`kotlin-stdlib-jdk8`(예: `implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk7:SOME_OLD_KOTLIN_VERSION")`)을 사용하고 `kotlin-stdlib:1.8+`를 전이적으로 가져오는 의존성이 있는 경우, [`kotlin-stdlib-jdk<7/8>:SOME_OLD_KOTLIN_VERSION`을 `kotlin-stdlib-jdk*:%kotlinVersion%`으로 교체](whatsnew18.md#updated-jvm-compilation-target)하거나 해당 라이브러리에서 전이적 `kotlin-stdlib:1.8+`를 [제외(exclude)](https://docs.gradle.org/current/userguide/dependency_downgrade_and_exclude.html#sec:excluding-transitive-deps)하세요:

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

### 테스트 라이브러리 의존성 설정

[`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) API는 지원되는 모든 플랫폼에서 Kotlin 프로젝트를 테스트하는 데 사용할 수 있습니다.
Gradle 플러그인이 각 테스트 소스 세트에 해당하는 테스트 의존성을 유추할 수 있도록 `commonTest` 소스 세트에 `kotlin-test` 의존성을 추가하세요.

Kotlin/Native 타겟은 추가 테스트 의존성이 필요하지 않으며 `kotlin.test` API 구현이 내장되어 있습니다.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test")) // 모든 플랫폼 의존성을 자동으로 가져옵니다
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
                implementation kotlin("test") // 모든 플랫폼 의존성을 자동으로 가져옵니다
            }
        }
    }
}
```

</tab>
</tabs>

> Kotlin 모듈에 대한 의존성에는 축약형을 사용할 수 있습니다. 예를 들어 "org.jetbrains.kotlin:kotlin-test" 대신 `kotlin("test")`를 사용할 수 있습니다.
>
{style="note"}

공유 소스 세트나 플랫폼별 소스 세트에서도 `kotlin-test` 의존성을 사용할 수 있습니다.

#### kotlin-test의 JVM 변형

Kotlin/JVM의 경우 Gradle은 기본적으로 JUnit 4를 사용합니다. 따라서 `kotlin("test")` 의존성은 JUnit 4용 변형인 `kotlin-test-junit`으로 해석됩니다.

빌드 스크립트의 테스트 태스크에서 [`useJUnitPlatform()`]( https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useJUnitPlatform) 또는 [`useTestNG()`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useTestNG)를 호출하여 JUnit 5 또는 TestNG를 선택할 수 있습니다.
다음 예시는 Kotlin 멀티플랫폼 프로젝트의 경우입니다:

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

다음 예시는 JVM 프로젝트의 경우입니다:

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

[JVM에서 JUnit을 사용하여 코드를 테스트하는 방법](jvm-test-using-junit.md)을 알아보세요.

자동 JVM 변형 확인이 구성에 문제를 일으킬 수 있습니다. 이 경우 명시적으로 필요한 프레임워크를 지정하고 프로젝트 `gradle.properties` 파일에 다음 줄을 추가하여 자동 확인을 비활성화할 수 있습니다:

```text
kotlin.test.infer.jvm.variant=false
```

빌드 스크립트에서 `kotlin("test")` 변형을 명시적으로 사용했는데 호환성 충돌로 프로젝트 빌드가 중단된 경우, [호환성 가이드의 이 이슈](compatibility-guide-15.md#do-not-mix-several-jvm-variants-of-kotlin-test-in-a-single-project)를 참조하세요.

### kotlinx 라이브러리에 대한 의존성 설정

멀티플랫폼 라이브러리를 사용하고 공유 코드에 의존해야 하는 경우, 공유 소스 세트에서 의존성을 한 번만 설정하세요. `kotlinx-coroutines-core` 또는 `ktor-client-core`와 같은 라이브러리의 기본 아티팩트 이름을 사용하세요:

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

플랫폼별 의존성을 위해 kotlinx 라이브러리가 필요한 경우에도 해당 플랫폼 소스 세트에서 라이브러리의 기본 아티팩트 이름을 사용할 수 있습니다:

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

## 레포지토리 선언

공개적으로 사용 가능한 레포지토리를 선언하여 해당 오픈 소스 의존성을 사용할 수 있습니다. `repositories{}` 블록에서 레포지토리 이름을 설정하세요:

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

인기 있는 레포지토리로는 [Maven Central](https://central.sonatype.com/)과 [Google의 Maven 레포지토리](https://maven.google.com/web/index.html)가 있습니다.

> Maven 프로젝트와도 작업하는 경우, Gradle과 Maven 프로젝트 사이를 전환할 때 문제가 발생할 수 있으므로 레포지토리로 `mavenLocal()`을 추가하지 않는 것이 좋습니다. `mavenLocal()` 레포지토리를 반드시 추가해야 한다면 `repositories{}` 블록의 마지막 레포지토리로 추가하세요. 자세한 내용은 [mavenLocal() 사용 사례](https://docs.gradle.org/current/userguide/declaring_repositories.html#sec:case-for-maven-local)를 참조하세요.
> 
{style="warning"}

둘 이상의 서브프로젝트에서 동일한 레포지토리를 선언해야 하는 경우, `settings.gradle(.kts)` 파일의 `dependencyResolutionManagement{}` 블록에서 레포지토리를 중앙에서 선언하세요:

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

```kotlin
dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}
```
</tab>
</tabs>

서브프로젝트에 선언된 레포지토리는 중앙에서 선언된 레포지토리를 오버라이드합니다. 이 동작을 제어하는 방법과 사용 가능한 옵션에 대한 자세한 내용은 [Gradle 문서](https://docs.gradle.org/current/userguide/declaring_repositories.html#sub:centralized-repository-declaration)를 참조하세요.

## 생성된 소스 등록하기
<primary-label ref="experimental-general"/>

IDE, 서브파티 플러그인 및 기타 도구가 생성된 코드와 일반 소스 파일을 구별할 수 있도록 생성된 소스를 등록하세요. 이는 IDE와 같은 도구가 UI에서 생성된 코드를 다르게 강조 표시하고 프로젝트를 가져올 때 생성 태스크를 트리거하는 데 도움이 됩니다. 생성된 소스를 등록하려면 [`KotlinSourceSet`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/) 인터페이스를 사용하세요.

Kotlin 파일이 포함된 디렉토리를 등록하려면 `build.gradle.kts` 파일에서 [`SourceDirectorySet`](https://docs.gradle.org/current/kotlin-dsl/gradle/org.gradle.api.file/-source-directory-set/index.html) 타입의 [`generatedKotlin`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/generated-kotlin.html) 프로퍼티를 사용하세요. 예를 들어:

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

이 예제는 출력 디렉토리가 `"src/main/kotlinGen"`인 새로운 태스크 `generator`를 생성합니다. 태스크가 실행되면 `doLast {}` 태스크 액션이 출력 디렉토리에 `generated.kt` 파일을 생성합니다. 마지막으로, 예제는 태스크의 출력을 생성된 소스로 등록합니다.

Gradle 플러그인을 개발하는 경우, [`allKotlinSources`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/all-kotlin-sources.html) 프로퍼티를 사용하여 [`KotlinSourceSet.kotlin`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/kotlin.html) 및 `KotlinSourceSet.generatedKotlin` 프로퍼티에 등록된 모든 소스에 액세스할 수 있습니다.

## 다음 단계는?

다음에 대해 자세히 알아보세요:
* [컴파일러 옵션 및 전달 방법](gradle-compiler-options.md).
* [증분 컴파일, 캐시 지원, 빌드 보고서 및 Kotlin 데몬](gradle-compilation-and-caches.md).
* [Gradle 기본 및 세부 사항](https://docs.gradle.org/current/userguide/userguide.html).
* [Gradle 플러그인 변형 지원](gradle-plugin-variants.md).