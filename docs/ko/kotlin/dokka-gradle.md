[//]: # (title: Gradle)

> 이 가이드는 Dokka Gradle 플러그인(DGP) v2 모드에 적용됩니다. 이전의 DGP v1 모드는 더 이상 지원되지 않습니다.
> v1에서 v2 모드로 업그레이드하려는 경우, [마이그레이션 가이드](dokka-migration.md)를 참고하세요.
>
{style="note"}

Gradle 기반 프로젝트의 문서를 생성하려면 [Dokka용 Gradle 플러그인](https://plugins.gradle.org/plugin/org.jetbrains.dokka)을 사용할 수 있습니다.

Dokka Gradle 플러그인(DGP)은 프로젝트를 위한 기본 자동 구성을 제공하며, 문서 생성을 위한 [Gradle 태스크](#문서-생성)를 포함하고, 출력을 커스터마이징할 수 있는 [구성 옵션](dokka-gradle-configuration-options.md)을 제공합니다.

[Gradle 예제 프로젝트](https://github.com/Kotlin/dokka/tree/2.0.0/examples/gradle-v2)에서 Dokka를 직접 실행해 보고 다양한 프로젝트에 맞게 구성하는 방법을 살펴볼 수 있습니다.

## 지원 버전 {id="supported-versions"}

프로젝트가 다음 최소 버전 요구 사항을 충족하는지 확인하세요:

| **도구**                                                                           | **버전**       |
|----------------------------------------------------------------------------------|--------------|
| [Gradle](https://docs.gradle.org/current/userguide/upgrading_version_8.html)     | 7.6 이상       |
| [Android Gradle 플러그인](https://developer.android.com/build/agp-upgrade-assistant) | 7.0 이상       |
| [Kotlin Gradle 플러그인](https://kotlinlang.org/docs/gradle-configure-project.html) | 1.9 이상       |

## Dokka 적용 {id="apply-dokka"}

Dokka Gradle 플러그인을 적용하는 권장 방법은 [plugins 블록](https://docs.gradle.org/current/userguide/plugins.html#sec:plugins_block)을 사용하는 것입니다. 프로젝트의 `build.gradle.kts` 파일에 있는 `plugins {}` 블록에 추가하세요:

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
plugins {
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.dokka' version '%dokkaVersion%'
}
```

</tab>
</tabs>

멀티 프로젝트 빌드(multi-project builds)를 문서화할 때는 문서화하려는 모든 서브프로젝트에 플러그인을 명시적으로 적용해야 합니다. 각 서브프로젝트에서 Dokka를 직접 구성하거나, 컨벤션 플러그인(convention plugin)을 사용하여 서브프로젝트 간에 Dokka 구성을 공유할 수 있습니다. 자세한 내용은 [단일 프로젝트](#단일-프로젝트-구성) 및 [멀티 프로젝트](#멀티-프로젝트-구성) 빌드 구성 방법을 참조하세요.

> * 내부적으로 Dokka는 [Kotlin Gradle 플러그인](https://kotlinlang.org/docs/gradle-configure-project.html#apply-the-plugin)을 사용하여 문서가 생성될 [소스 세트(source sets)](https://kotlinlang.org/docs/multiplatform-discover-project.html#source-sets)를 자동으로 구성합니다. 반드시 Kotlin Gradle 플러그인을 적용하거나 [소스 세트를 수동으로 구성](dokka-gradle-configuration-options.md#source-set-configuration)하세요.
>
> * [사전 컴파일된 스크립트 플러그인(precompiled script plugin)](https://docs.gradle.org/current/userguide/custom_plugins.html#sec:precompiled_plugins)에서 Dokka를 사용하는 경우, 제대로 작동하도록 [Kotlin Gradle 플러그인](https://kotlinlang.org/docs/gradle-configure-project.html#apply-the-plugin)을 의존성으로 추가하세요.
>
{style="tip"}

## 빌드 캐시 및 구성 캐시 활성화 {id="enable-build-cache-and-configuration-cache"}

DGP는 Gradle 빌드 캐시(build cache)와 구성 캐시(configuration cache)를 지원하여 빌드 성능을 향상시킵니다.

* 빌드 캐시를 활성화하려면 [Gradle 빌드 캐시 문서](https://docs.gradle.org/current/userguide/build_cache.html#sec:build_cache_enable)의 지침을 따르세요.
* 구성 캐시를 활성화하려면 [Gradle 구성 캐시 문서](https://docs.gradle.org/current/userguide/configuration_cache.html#config_cache:usage:enable)의 지침을 따르세요.

## 문서 생성 {id="generate-documentation"}

Dokka Gradle 플러그인에는 [HTML](dokka-html.md) 및 [Javadoc](dokka-javadoc.md) 출력 형식이 기본적으로 내장되어 있습니다.

다음 Gradle 태스크를 사용하여 문서를 생성하세요:

```shell
./gradlew :dokkaGenerate
```

`dokkaGenerate` Gradle 태스크의 주요 동작은 다음과 같습니다:

* 이 태스크는 [단일](#단일-프로젝트-구성) 및 [멀티 프로젝트](#멀티-프로젝트-구성) 빌드 모두에 대해 문서를 생성합니다.
* 기본적으로 문서 출력 형식은 HTML입니다. [적절한 플러그인을 추가](#문서-출력-형식-구성)하여 Javadoc을 생성하거나 HTML과 Javadoc 형식을 모두 생성할 수도 있습니다.
* 생성된 문서는 단일 및 멀티 프로젝트 빌드 모두에서 자동으로 `build/dokka/html` 디렉토리에 저장됩니다. [위치(`outputDirectory`)를 변경](dokka-gradle-configuration-options.md#general-configuration)할 수 있습니다.

### 문서 출력 형식 구성 {id="configure-documentation-output-format"}

> Javadoc 출력 형식은 [Alpha](https://kotlinlang.org/docs/components-stability.html#stability-levels-explained) 상태입니다. 사용 시 버그가 발생하거나 마이그레이션 문제가 있을 수 있습니다. Javadoc을 입력으로 받는 도구와의 성공적인 통합은 보장되지 않습니다. 사용 시 주의하시기 바랍니다.
>
{style="warning"}

API 문서를 HTML, Javadoc 또는 두 형식 동시에 생성하도록 선택할 수 있습니다.

1. 프로젝트의 `build.gradle.kts` 파일에 있는 `plugins {}` 블록에 해당 플러그인 `id`를 추가합니다:

   ```kotlin
   plugins {
       // HTML 문서 생성
       id("org.jetbrains.dokka") version "%dokkaVersion%"

       // Javadoc 문서 생성
       id("org.jetbrains.dokka-javadoc") version "%dokkaVersion%"

       // 두 플러그인 ID를 모두 유지하면 두 형식 모두 생성됩니다.
   }
   ```

2. 해당 Gradle 태스크를 실행합니다.

   다음은 각 형식에 해당하는 플러그인 `id` 및 Gradle 태스크 목록입니다:

   |             | **HTML**                                  | **Javadoc**                                  | **둘 다**                          |
   |-------------|-------------------------------------------|----------------------------------------------|-----------------------------------|
   | 플러그인 `id` | `id("org.jetbrains.dokka")`               | `id("org.jetbrains.dokka-javadoc")`          | HTML 및 Javadoc 플러그인 모두 사용 |
   | Gradle 태스크 | `./gradlew :dokkaGeneratePublicationHtml` | `./gradlew :dokkaGeneratePublicationJavadoc` | `./gradlew :dokkaGenerate`        |

    > * `dokkaGenerate` 태스크는 적용된 플러그인을 기반으로 사용 가능한 모든 형식의 문서를 생성합니다.
    > HTML과 Javadoc 플러그인이 모두 적용된 경우, `dokkaGeneratePublicationHtml` 태스크를 실행하여 HTML만 생성하거나, `dokkaGeneratePublicationJavadoc` 태스크를 실행하여 Javadoc만 생성하도록 선택할 수 있습니다.
    > 
    {style="tip"}

IntelliJ IDEA를 사용 중이라면 `dokkaGenerateHtml` Gradle 태스크가 보일 수 있습니다. 이 태스크는 단순히 `dokkaGeneratePublicationHtml`의 별칭(alias)입니다. 두 태스크는 완전히 동일한 작업을 수행합니다.

### 멀티 프로젝트 빌드에서 문서 출력 통합 {id="aggregate-documentation-output-in-multi-project-builds"}

Dokka는 여러 서브프로젝트의 문서를 하나의 출력물이나 퍼블리케이션(publication)으로 통합(aggregate)할 수 있습니다.

문서를 통합하기 전에 문서화하려는 [모든 서브프로젝트에 Dokka 플러그인을 적용](#서브프로젝트에-컨벤션-플러그인-적용)해야 합니다.

여러 서브프로젝트의 문서를 통합하려면 루트 프로젝트의 `build.gradle.kts` 파일에 `dependencies {}` 블록을 추가하세요:

```kotlin
dependencies {
    dokka(project(":childProjectA:"))
    dokka(project(":childProjectB:"))
}
```

다음과 같은 구조의 프로젝트가 있다고 가정해 보겠습니다:

```text
.
└── parentProject/
    ├── childProjectA/
    │   └── demo/
    │       └── ChildProjectAClass.kt
    └── childProjectB/
        └── demo/
            └── ChildProjectBClass.kt
```

생성된 문서는 다음과 같이 통합됩니다:

![dokkaHtmlMultiModule 태스크 출력 스크린샷](dokkaHtmlMultiModule-example.png){width=600}

자세한 내용은 [멀티 프로젝트 예제](https://github.com/Kotlin/dokka/tree/2.0.0/examples/gradle-v2/multimodule-example)를 참고하세요.

#### 통합 문서의 디렉토리 구조 {id="directory-of-aggregated-documentation"}

DGP가 서브프로젝트를 통합할 때, 각 서브프로젝트는 통합된 문서 내에 자신만의 하위 디렉토리를 갖습니다. DGP는 전체 프로젝트 구조를 유지함으로써 각 서브프로젝트가 고유한 디렉토리를 갖도록 보장합니다.

예를 들어, `:turbo-lib`에 통합 설정이 있고 중첩된 서브프로젝트 `:turbo-lib:maths`가 있는 프로젝트의 경우, 생성된 문서는 다음에 위치합니다:

```text
turbo-lib/build/dokka/html/turbo-lib/maths/
```

서브프로젝트 디렉토리를 수동으로 지정하여 이 동작을 변경할 수 있습니다. 각 서브프로젝트의 `build.gradle.kts` 파일에 다음 구성을 추가하세요:

```kotlin
// /turbo-lib/maths/build.gradle.kts

plugins {
    id("org.jetbrains.dokka")
}

dokka {
    // 서브프로젝트 디렉토리를 재정의합니다.
    modulePath.set("maths")
}
```

이 구성은 `:turbo-lib:maths` 모듈에 대해 생성된 문서가 `turbo-lib/build/dokka/html/maths/`에 생성되도록 변경합니다.

## javadoc.jar 빌드 {id="build-javadoc-jar"}

라이브러리를 저장소에 배포하려는 경우, 라이브러리의 API 참조 문서가 포함된 `javadoc.jar` 파일을 제공해야 할 수도 있습니다.

예를 들어, [Maven Central](https://central.sonatype.org/)에 배포하려면 프로젝트와 함께 `javadoc.jar`를 [반드시](https://central.sonatype.org/publish/requirements/) 제공해야 합니다. 하지만 모든 저장소에 이 규칙이 있는 것은 아닙니다.

Dokka용 Gradle 플러그인은 이를 수행하는 기능을 기본으로 제공하지 않지만, 사용자 정의 Gradle 태스크를 통해 달성할 수 있습니다. 하나는 [HTML](dokka-html.md) 형식의 문서를 생성하기 위한 것이고, 다른 하나는 [Javadoc](dokka-javadoc.md) 형식을 위한 것입니다:

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
// HTML 형식의 문서 생성
val dokkaHtmlJar by tasks.registering(Jar::class) {
    description = "A HTML Documentation JAR containing Dokka HTML"
    from(tasks.dokkaGeneratePublicationHtml.flatMap { it.outputDirectory })
    archiveClassifier.set("html-doc")
}

// Javadoc 형식의 문서 생성
val dokkaJavadocJar by tasks.registering(Jar::class) {
    description = "A Javadoc JAR containing Dokka Javadoc"
    from(tasks.dokkaGeneratePublicationJavadoc.flatMap { it.outputDirectory })
    archiveClassifier.set("javadoc")
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
// HTML 형식의 문서 생성
tasks.register('dokkaHtmlJar', Jar) {
    description = 'A HTML Documentation JAR containing Dokka HTML'
    from(tasks.named('dokkaGeneratePublicationHtml').flatMap { it.outputDirectory })
    archiveClassifier.set('html-doc')
}

// Javadoc 형식의 문서 생성
tasks.register('dokkaJavadocJar', Jar) {
    description = 'A Javadoc JAR containing Dokka Javadoc'
    from(tasks.named('dokkaGeneratePublicationJavadoc').flatMap { it.outputDirectory })
    archiveClassifier.set('javadoc')
}
```

</tab>
</tabs>

> 라이브러리를 Maven Central에 배포하는 경우, [javadoc.io](https://javadoc.io/)와 같은 서비스를 사용하여 별도의 설정 없이 라이브러리의 API 문서를 무료로 호스팅할 수 있습니다. 이 서비스는 `javadoc.jar`에서 문서 페이지를 직접 가져옵니다. [이 예제](https://javadoc.io/doc/com.trib3/server/latest/index.html)에서 볼 수 있듯이 HTML 형식과도 잘 작동합니다.
>
{style="tip"}

## 구성 예제 {id="configuration-examples"}

프로젝트 유형에 따라 Dokka를 적용하고 구성하는 방식이 약간씩 다릅니다. 하지만 [구성 옵션](dokka-gradle-configuration-options.md) 자체는 프로젝트 유형에 관계없이 동일합니다.

프로젝트 루트에 단일 `build.gradle.kts` 또는 `build.gradle` 파일이 있는 단순하고 평면적인 프로젝트의 경우, [단일 프로젝트 구성](#단일-프로젝트-구성)을 참조하세요.

서브프로젝트와 여러 개의 중첩된 `build.gradle.kts` 또는 `build.gradle` 파일이 있는 더 복잡한 빌드의 경우, [멀티 프로젝트 구성](#멀티-프로젝트-구성)을 참조하세요.

### 단일 프로젝트 구성 {id="single-project-configuration"}

단일 프로젝트 빌드는 일반적으로 프로젝트 루트에 `build.gradle.kts` 또는 `build.gradle` 파일이 하나만 있습니다. 단일 플랫폼이거나 멀티플랫폼일 수 있으며 일반적으로 다음과 같은 구조를 갖습니다:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

단일 플랫폼:

```text
.
├── build.gradle.kts
└── src/
    └── main/
        └── kotlin/
            └── HelloWorld.kt
```

멀티플랫폼:

```text
.
├── build.gradle.kts
└── src/
    ├── commonMain/
    │   └── kotlin/
    │       └── Common.kt
    ├── jvmMain/
    │   └── kotlin/
    │       └── JvmUtils.kt
    └── nativeMain/
        └── kotlin/
            └── NativeUtils.kt
```

</tab>
<tab title="Groovy" group-key="groovy">

단일 플랫폼:

```text
.
├── build.gradle
└── src/
    └── main/
        └── kotlin/
            └── HelloWorld.kt
```

멀티플랫폼:

```text
.
├── build.gradle
└── src/
    ├── commonMain/
    │   └── kotlin/
    │       └── Common.kt
    ├── jvmMain/
    │   └── kotlin/
    │       └── JvmUtils.kt
    └── nativeMain/
        └── kotlin/
            └── NativeUtils.kt
```

</tab>
</tabs>

루트 `build.gradle.kts` 파일에 Dokka Gradle 플러그인을 적용하고 최상위 `dokka {}` DSL을 사용하여 구성하세요:

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
plugins {
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}

dokka {
    dokkaPublications.html {
        moduleName.set("MyProject")
        outputDirectory.set(layout.buildDirectory.dir("documentation/html"))
        includes.from("README.md")
   }

    dokkaSourceSets.main {
        sourceLink {
            localDirectory.set(file("src/main/kotlin"))
            remoteUrl.set(URI("https://github.com/your-repo"))
            remoteLineSuffix.set("#L")
        }
    }
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

`./build.gradle` 내부:

```groovy
plugins {
    id 'org.jetbrains.dokka' version '%dokkaVersion%'
}

dokka {
    dokkaPublications {
        html {
            moduleName.set("MyProject")
            outputDirectory.set(layout.buildDirectory.dir("documentation/html"))
            includes.from("README.md")
        }
    }

    dokkaSourceSets {
        named("main") {
            sourceLink {
                localDirectory.set(file("src/main/kotlin"))
                remoteUrl.set(new URI("https://github.com/your-repo"))
                remoteLineSuffix.set("#L")
            }
        }
    }
}
```

</tab>
</tabs>

이 구성은 프로젝트에 Dokka를 적용하고, 문서 출력 디렉토리를 설정하며, 기본 소스 세트를 정의합니다. 동일한 `dokka {}` 블록 내에 사용자 정의 에셋(assets), 가시성 필터 또는 플러그인 구성을 추가하여 더 확장할 수 있습니다. 자세한 내용은 [구성 옵션](dokka-gradle-configuration-options.md)을 참조하세요.

### 멀티 프로젝트 구성 {id="multi-project-configuration"}

[멀티 프로젝트 빌드](https://docs.gradle.org/current/userguide/multi_project_builds.html)는 일반적으로 여러 개의 중첩된 `build.gradle.kts` 파일을 포함하며 다음과 유사한 구조를 갖습니다:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```text
.
├── build.gradle.kts
├── settings.gradle.kts
├── subproject-A/
│   ├── build.gradle.kts
│   └── src/
│       └── main/
│           └── kotlin/
│               └── HelloFromA.kt
└── subproject-B/
    ├── build.gradle.kts
    └── src/
        └── main/
            └── kotlin/
                └── HelloFromB.kt
```

</tab>
<tab title="Groovy" group-key="groovy">

```text
.
├── build.gradle
├── settings.gradle
├── subproject-A/
│   ├── build.gradle
│   └── src/
│       └── main/
│           └── kotlin/
│               └── HelloFromA.kt
└── subproject-B/
    ├── build.gradle
    └── src/
        └── main/
            └── kotlin/
                └── HelloFromB.kt
```

</tab>
</tabs>

단일 및 멀티 프로젝트 문서는 [최상위 `dokka {}` DSL을 사용한 동일한 구성 모델](#단일-프로젝트-구성)을 공유합니다.

멀티 프로젝트 빌드에서 Dokka를 구성하는 방법에는 두 가지가 있습니다:

* **[컨벤션 플러그인을 통한 공유 구성](#컨벤션-플러그인을-통한-공유-구성) (권장)**: 컨벤션 플러그인을 정의하고 이를 모든 서브프로젝트에 적용합니다. 이는 Dokka 설정을 중앙 집중화합니다.

* **[수동 구성](#수동-구성)**: 각 서브프로젝트에 Dokka 플러그인을 적용하고 동일한 `dokka {}` 블록을 반복합니다. 컨벤션 플러그인이 필요하지 않습니다.

서브프로젝트를 구성한 후, 여러 서브프로젝트의 문서를 하나의 출력으로 통합할 수 있습니다. 자세한 내용은 [멀티 프로젝트 빌드에서 문서 출력 통합](#멀티-프로젝트-빌드에서-문서-출력-통합)을 참조하세요.

> 멀티 프로젝트 예제는 [Dokka GitHub 저장소](https://github.com/Kotlin/dokka/tree/master/examples/gradle-v2/multimodule-example)를 참조하세요.
>
{style="tip"}

#### 컨벤션 플러그인을 통한 공유 구성 {id="shared-configuration-via-a-convention-plugin"}

컨벤션 플러그인을 설정하고 서브프로젝트에 적용하려면 다음 단계를 따르세요.

##### buildSrc 디렉토리 설정 {id="set-up-the-buildsrc-directory"}

1. 프로젝트 루트에 다음 두 파일을 포함하는 `buildSrc` 디렉토리를 생성합니다:

    * `settings.gradle.kts`
    * `build.gradle.kts`

2. `buildSrc/settings.gradle.kts` 파일에 다음 코드를 추가합니다:

   ```kotlin
   rootProject.name = "buildSrc"
   ```

3. `buildSrc/build.gradle.kts` 파일에 다음 코드를 추가합니다:

    ```kotlin
    plugins {
        `kotlin-dsl`
    }
    
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
    
    dependencies {
        implementation("org.jetbrains.dokka:dokka-gradle-plugin:%dokkaVersion%")
    }   
    ```

##### Dokka 컨벤션 플러그인 설정 {id="set-up-the-dokka-convention-plugin"}

`buildSrc` 디렉토리를 설정한 후, Dokka 컨벤션 플러그인을 설정합니다:

1. [컨벤션 플러그인](https://docs.gradle.org/current/userguide/custom_plugins.html#sec:convention_plugins)을 호스팅할 `buildSrc/src/main/kotlin/dokka-convention.gradle.kts` 파일을 생성합니다.
2. `dokka-convention.gradle.kts` 파일에 다음 코드를 추가합니다:

    ```kotlin
    plugins {
        id("org.jetbrains.dokka") 
    }

    dokka {
        // 공유 구성이 여기에 들어갑니다.
    }
    ```

   `dokka {}` 블록 내에 모든 서브프로젝트에 공통으로 적용될 공유 Dokka [구성](dokka-gradle-configuration-options.md)을 추가해야 합니다. 또한 Dokka 버전을 지정할 필요가 없습니다. 버전은 이미 `buildSrc/build.gradle.kts` 파일에 설정되어 있습니다.

##### 서브프로젝트에 컨벤션 플러그인 적용 {id="apply-the-convention-plugin-to-your-subprojects"}

각 서브프로젝트의 `build.gradle.kts` 파일에 Dokka 컨벤션 플러그인을 추가하여 적용합니다:

```kotlin
plugins {
    id("dokka-convention")
}
```

#### 수동 구성 {id="manual-configuration"}

프로젝트에서 컨벤션 플러그인을 사용하지 않는 경우, 각 서브프로젝트에 동일한 `dokka {}` 블록을 수동으로 복사하여 동일한 Dokka 구성 패턴을 재사용할 수 있습니다:

1. 모든 서브프로젝트의 `build.gradle.kts` 파일에 Dokka 플러그인을 적용합니다:

   ```kotlin
   plugins {
       id("org.jetbrains.dokka") version "%dokkaVersion%"
   }
   ```

2. 각 서브프로젝트의 `dokka {}` 블록에서 공유 구성을 선언합니다. 구성을 중앙 집중화하는 컨벤션 플러그인이 없으므로 서브프로젝트 간에 원하는 구성을 중복해서 작성합니다. 자세한 내용은 [구성 옵션](dokka-gradle-configuration-options.md)을 참조하세요.

#### 상위 프로젝트 구성 {id="parent-project-configuration"}

멀티 프로젝트 빌드에서는 전체 문서에 적용되는 설정을 루트 프로젝트에서 구성할 수 있습니다. 여기에는 출력 형식, 출력 디렉토리, 문서 서브프로젝트 이름 정의, 모든 서브프로젝트의 문서 통합 및 기타 [구성 옵션](dokka-gradle-configuration-options.md)이 포함될 수 있습니다:

```kotlin
plugins {
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}

dokka {
    // 전체 프로젝트에 대한 속성을 설정합니다.
    dokkaPublications.html {
        moduleName.set("My Project")
        outputDirectory.set(layout.buildDirectory.dir("docs/html"))
        includes.from("README.md")
    }

    dokkaSourceSets.configureEach {
        documentedVisibilities.set(setOf(VisibilityModifier.Public)) // 또는 documentedVisibilities(VisibilityModifier.Public)    
    }
}

// 서브프로젝트 문서를 통합합니다.
dependencies {
    dokka(project(":childProjectA"))
    dokka(project(":childProjectB"))
}
```

또한 각 서브프로젝트에 사용자 정의 구성이 필요한 경우 고유한 `dokka {}` 블록을 가질 수 있습니다. 다음 예제에서 서브프로젝트는 Dokka 플러그인을 적용하고, 사용자 정의 서브프로젝트 이름을 설정하며, `README.md` 파일의 추가 문서를 포함합니다:

```kotlin
// subproject/build.gradle.kts
plugins {
    id("org.jetbrains.dokka")
}

dokka {
    dokkaPublications.html {
        moduleName.set("Child Project A")
        includes.from("README.md")
    }
}
```
