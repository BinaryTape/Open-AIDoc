[//]: # (title: Dokka Gradle 플러그인 v2로 마이그레이션)

> 이 문서는 DGPv1을 사용 중이며 DGPv2로 마이그레이션하려는 경우에만 해당됩니다. Dokka 2.1.0부터는 DGP v2가 기본적으로 활성화됩니다.
> Dokka 2.1.0 이상을 사용하고 있다면,
> 이 페이지를 건너뛰고 [Dokka Gradle 문서](dokka-gradle.md)로 바로 이동할 수 있습니다.
>
{style="note"}

Dokka Gradle 플러그인(DGP)은 Gradle로 빌드된 Kotlin 프로젝트의 종합적인 API 문서를 생성하는 도구입니다.

DGP는 Kotlin의 KDoc 주석과 Java의 Javadoc 주석을 원활하게 처리하여 정보를 추출하고 
[HTML 또는 Javadoc](#select-documentation-output-format) 형식의 구조화된 문서를 생성합니다.

Dokka Gradle 플러그인 v2 모드는 기본적으로 활성화되어 있으며 Gradle의 모범 사례를 따릅니다:

* Gradle 타입을 채택하여 성능이 향상되었습니다.
* 저수준의 태스크 기반 설정 대신 직관적인 최상위 DSL 구성을 사용하여 빌드 스크립트와 가독성을 단순화합니다.
* 문서 집계에 보다 선언적인 방식을 채택하여 멀티 프로젝트 문서를 더 쉽게 관리할 수 있습니다.
* 타입 세이프(type-safe)한 플러그인 구성을 사용하여 빌드 스크립트의 안정성과 유지보수성을 향상시킵니다.
* Gradle의 [구성 캐시(configuration cache)](https://docs.gradle.org/current/userguide/configuration_cache.html)와 
  [빌드 캐시(build cache)](https://docs.gradle.org/current/userguide/build_cache.html)를 완벽하게 지원하여 성능을 개선하고 빌드 작업을 단순화합니다.

DGP v1에서 v2 모드로의 변경 사항 및 마이그레이션에 대한 자세한 내용은 이 가이드를 참조하세요.

## 시작하기 전에 {id="before-you-start"}

마이그레이션을 시작하기 전에 다음 단계를 완료하세요.

### 지원 버전 확인 {id="verify-supported-versions"}

프로젝트가 최소 버전 요구 사항을 충족하는지 확인하세요:

| **도구**                                                                          | **버전**   |
|-----------------------------------------------------------------------------------|---------------|
| [Gradle](https://docs.gradle.org/current/userguide/upgrading_version_8.html)      | 7.6 이상 |
| [Android Gradle 플러그인](https://developer.android.com/build/agp-upgrade-assistant) | 7.0 이상 |
| [Kotlin Gradle 플러그인](https://kotlinlang.org/docs/gradle-configure-project.html) | 1.9 이상 |

### DGP v2 활성화 {id="enable-dgp-v2"}

프로젝트의 `build.gradle.kts` 파일에 있는 `plugins {}` 블록에서 Dokka 버전을 %dokkaVersion%으로 업데이트합니다:

```kotlin
plugins {
    kotlin("jvm") version "2.1.10"
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}
```

또는 [버전 카탈로그(version catalog)](https://docs.gradle.org/current/userguide/platforms.html#sub:version-catalog)를
사용하여 Dokka Gradle 플러그인 v2를 활성화할 수도 있습니다.

> 기본적으로 DGP v2는 HTML 형식으로 문서를 생성합니다. Javadoc 또는 HTML과 Javadoc 형식을 모두 생성하려면
> 적절한 플러그인을 추가하세요. 플러그인에 대한 자세한 내용은 [문서 출력 형식 선택](#select-documentation-output-format)을 참조하세요.
>
{style="tip"}

### 마이그레이션 헬퍼 활성화 {id="enable-migration-helpers"}

프로젝트의 `gradle.properties` 파일에서 다음 Gradle 프로퍼티를 설정하여 헬퍼와 함께 DGP v2를 활성화합니다:

```text
org.jetbrains.dokka.experimental.gradle.pluginMode=V2EnabledWithHelpers
```

> 프로젝트에 `gradle.properties` 파일이 없다면 프로젝트의 루트 디렉터리에 파일을 생성하세요.
>
{style="tip"}

이 프로퍼티는 마이그레이션 헬퍼와 함께 DGP v2 플러그인을 활성화합니다. 이 헬퍼는 빌드 스크립트가 DGP v2에서 더 이상 사용할 수 없는 
DGP v1의 태스크를 참조할 때 컴파일 오류가 발생하는 것을 방지합니다.

> 마이그레이션 헬퍼가 마이그레이션을 직접 수행해 주지는 않습니다. 새로운 API로 전환하는 동안 빌드 스크립트가 
> 깨지지 않도록 유지해 줄 뿐입니다.
>
{style="note"}

마이그레이션을 완료한 후에는 [마이그레이션 헬퍼를 비활성화](#set-the-opt-in-flag)하세요.

### Gradle과 프로젝트 동기화 {id="sync-your-project-with-gradle"}

DGP v2 및 마이그레이션 헬퍼를 활성화한 후, 
DGP v2가 올바르게 적용되도록 프로젝트를 Gradle과 동기화합니다:

* IntelliJ IDEA를 사용하는 경우, Gradle 툴 윈도우에서 **Reload All Gradle Projects** ![새로고침 버튼](gradle-reload-button.png){width=30}{type="joined"} 버튼을 클릭합니다.
* Android Studio를 사용하는 경우, **File** | **Sync Project with Gradle Files**를 선택합니다.

## 프로젝트 마이그레이션 {id="migrate-your-project"}

Dokka Gradle 플러그인을 v2로 업데이트한 후 프로젝트에 해당하는 마이그레이션 단계를 따르세요.

### 구성 옵션 조정 {id="adjust-configuration-options"}

DGP v2에서는 [Gradle 구성 옵션](dokka-gradle-configuration-options.md)에 몇 가지 변경 사항이 도입되었습니다. `build.gradle.kts` 파일에서 프로젝트 설정에 맞게 
구성 옵션을 조정하세요.

#### DGP v2의 최상위 DSL 구성 {id="top-level-dsl-configuration-in-dgp-v2"}

DGP v1의 구성 구문을 DGP v2의 최상위 `dokka {}` DSL 구성으로 교체합니다:

DGP v1에서의 구성:

```kotlin
tasks.withType<DokkaTask>().configureEach {
    suppressInheritedMembers.set(true)
    failOnWarning.set(true)
    dokkaSourceSets {
        named("main") {
            moduleName.set("Project Name")
            includes.from("README.md")
            sourceLink {
                localDirectory.set(file("src/main/kotlin"))
                remoteUrl.set(URL("https://example.com/src"))
                remoteLineSuffix.set("#L")
            }
        }
    }
}

tasks.dokkaHtml {
    pluginConfiguration<DokkaBase, DokkaBaseConfiguration> {
        customStyleSheets.set(listOf("styles.css"))
        customAssets.set(listOf("logo.png"))
        footerMessage.set("(c) Your Company")
    }
}
```

DGP v2에서의 구성:

Gradle의 Kotlin DSL은 타입 세이프 접근자(type-safe accessors)를 사용하기 때문에 `build.gradle.kts` 파일의 구문은 일반적인 `.kt` 파일(예: 커스텀 Gradle 플러그인에 사용되는 파일)과 다릅니다.

<tabs group="dokka-configuration">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
// build.gradle.kts

dokka {
    moduleName.set("Project Name")
    dokkaPublications.html {
        suppressInheritedMembers.set(true)
        failOnWarning.set(true)
    }
    dokkaSourceSets.main {
        includes.from("README.md")
        sourceLink {
            localDirectory.set(file("src/main/kotlin"))
            remoteUrl("https://example.com/src")
            remoteLineSuffix.set("#L")
        }
    }
    pluginsConfiguration.html {
        customStyleSheets.from("styles.css")
        customAssets.from("logo.png")
        footerMessage.set("(c) Your Company")
    }
}
```

</tab>
<tab title="Kotlin 커스텀 플러그인" group-key="kotlin custom">

```kotlin
// CustomPlugin.kt

import org.gradle.api.Plugin
import org.gradle.api.Project
import org.jetbrains.dokka.gradle.DokkaExtension
import org.jetbrains.dokka.gradle.engine.plugins.DokkaHtmlPluginParameters

abstract class CustomPlugin : Plugin<Project> {
    override fun apply(project: Project) {
        project.plugins.apply("org.jetbrains.dokka")

        project.extensions.configure(DokkaExtension::class.java) { dokka ->

            dokka.dokkaPublications.named("html") { publication ->
                publication.suppressInheritedMembers.set(true)
                publication.failOnWarning.set(true)
            }

            dokka.dokkaSourceSets.named("main") { dss ->
                dss.includes.from("README.md")
                dss.sourceLink {
                    it.localDirectory.set(project.file("src/main/kotlin"))
                    it.remoteUrl("https://example.com/src")
                    it.remoteLineSuffix.set("#L")
                }
            }

            dokka.pluginsConfiguration.named("html", DokkaHtmlPluginParameters::class.java) { html ->
                html.customStyleSheets.from("styles.css")
                html.customAssets.from("logo.png")
                html.footerMessage.set("(c) Your Company")
            }
        }
    }
}
```

</tab>
</tabs>

#### 가시성(Visibility) 설정 {id="visibility-settings"}

`documentedVisibilities` 프로퍼티를 `Visibility.PUBLIC`에서 `VisibilityModifier.Public`으로 변경합니다.

DGP v1에서의 구성:

```kotlin
import org.jetbrains.dokka.DokkaConfiguration.Visibility

// ...
documentedVisibilities.set(
    setOf(Visibility.PUBLIC)
) 
```

DGP v2에서의 구성:

```kotlin
import org.jetbrains.dokka.gradle.engine.parameters.VisibilityModifier

// ...
documentedVisibilities.set(
    setOf(VisibilityModifier.Public)
)

// 또는

documentedVisibilities(VisibilityModifier.Public)
```

추가로, 문서화할 가시성을 추가하려면 DGP v2의 [유틸리티 함수](https://github.com/Kotlin/dokka/blob/v2.3.0/dokka-runners/dokka-gradle-plugin/src/main/kotlin/engine/parameters/HasConfigurableVisibilityModifiers.kt#L14-L16)를 사용할 수 있습니다:

```kotlin
fun documentedVisibilities(vararg visibilities: VisibilityModifier): Unit =
    documentedVisibilities.set(visibilities.asList()) 
```

#### 소스 링크(Source links) {id="source-links"}

생성된 문서에서 원격 저장소의 해당 소스 코드로 이동할 수 있도록 소스 링크를 구성합니다. 
이 구성에는 `dokkaSourceSets.main{}` 블록을 사용합니다.

DGP v1에서의 구성:

```kotlin
tasks.withType<DokkaTask>().configureEach {
    dokkaSourceSets {
        named("main") {
            sourceLink {
                localDirectory.set(file("src/main/kotlin"))
                remoteUrl.set(URL("https://github.com/your-repo"))
                remoteLineSuffix.set("#L")
            }
        }
    }
}
```

DGP v2에서의 구성:

Gradle의 Kotlin DSL은 타입 세이프 접근자를 사용하기 때문에 `build.gradle.kts` 파일의 구문은 일반적인 `.kt` 파일(예: 커스텀 Gradle 플러그인에 사용되는 파일)과 다릅니다.

<tabs group="dokka-configuration">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
// build.gradle.kts

dokka {
    dokkaSourceSets.main {
        sourceLink {
            localDirectory.set(file("src/main/kotlin"))
            remoteUrl("https://github.com/your-repo")
            remoteLineSuffix.set("#L")
        }
    }
}
```

</tab>
<tab title="Kotlin 커스텀 플러그인" group-key="kotlin custom">

```kotlin
// CustomPlugin.kt

import org.gradle.api.Plugin
import org.gradle.api.Project
import org.jetbrains.dokka.gradle.DokkaExtension

abstract class CustomPlugin : Plugin<Project> {
    override fun apply(project: Project) {
        project.plugins.apply("org.jetbrains.dokka")
        project.extensions.configure(DokkaExtension::class.java) { dokka ->
            dokka.dokkaSourceSets.named("main") { dss ->
                dss.includes.from("README.md")
                dss.sourceLink {
                    it.localDirectory.set(project.file("src/main/kotlin"))
                    it.remoteUrl("https://example.com/src")
                    it.remoteLineSuffix.set("#L")
                }
            }
        }
    }
}
```

</tab>
</tabs>

소스 링크 구성이 [변경](https://docs.gradle.org/current/userguide/upgrading_version_8.html#deprecated_invalid_url_decoding)되었으므로,
원격 URL을 지정할 때 `URL` 대신 `URI` 클래스를 사용하세요.

DGP v1에서의 구성:

```kotlin
remoteUrl.set(URL("https://github.com/your-repo"))
```

DGP v2에서의 구성:

```kotlin
remoteUrl.set(URI("https://github.com/your-repo"))

// 또는

remoteUrl("https://github.com/your-repo")
```

또한 DGP v2에는 URL을 설정할 수 있는 두 가지 [유틸리티 함수](https://github.com/Kotlin/dokka/blob/220922378e6c68eb148fda2ec80528a1b81478c9/dokka-runners/dokka-gradle-plugin/src/main/kotlin/engine/parameters/DokkaSourceLinkSpec.kt#L82-L96)가
있습니다:

```kotlin
fun remoteUrl(@Language("http-url-reference") value: String): Unit =
    remoteUrl.set(URI(value))

// 그리고

fun remoteUrl(value: Provider<String>): Unit =
    remoteUrl.set(value.map(::URI))
```

#### 외부 문서 링크(External documentation links) {id="external-documentation-links"}

`register()` 메서드를 사용하여 각 링크를 정의하고 외부 문서 링크를 등록합니다.
`externalDocumentationLinks` API는 Gradle DSL 규칙에 맞추어 이 메서드를 사용합니다.

DGP v1에서의 구성:

```kotlin
tasks.dokkaHtml {
    dokkaSourceSets {
        configureEach {
            externalDocumentationLink {
                url = URL("https://example.com/docs/")
                packageListUrl = File("/path/to/package-list").toURI().toURL()
            }
        }
    }
}
```

DGP v2에서의 구성:

```kotlin
dokka {
    dokkaSourceSets.configureEach {
        externalDocumentationLinks.register("example-docs") {
            url("https://example.com/docs/")
            packageListUrl("https://example.com/docs/package-list")
        }
    }
}
```

#### 커스텀 애셋(Custom assets) {id="custom-assets"}

리스트(`var List<File>`) 대신 파일 컬렉션[(`FileCollection`)](https://docs.gradle.org/8.10/userguide/lazy_configuration.html#working_with_files_in_lazy_properties)과 함께 [`customAssets`](dokka-html.md#customize-assets) 프로퍼티를 사용하세요.

DGP v1에서의 구성:

```kotlin
customAssets = listOf(file("example.png"), file("example2.png"))
```

DGP v2에서의 구성:

```kotlin
customAssets.from("example.png", "example2.png")
```

#### 출력 디렉터리(Output directory) {id="output-directory"}

생성된 Dokka 문서의 출력 디렉터리를 지정하려면 `dokka {}` 블록을 사용합니다.

DGP v1에서의 구성:

```kotlin
tasks.dokkaHtml {
    outputDirectory.set(layout.buildDirectory.dir("dokkaDir"))
}
```

DGP v2에서의 구성:

```kotlin
dokka {
    dokkaPublications.html {
        outputDirectory.set(layout.buildDirectory.dir("dokkaDir"))
    }
}
```

#### 추가 파일의 출력 디렉터리 {id="output-directory-for-additional-files"}

단일 모듈 및 멀티 모듈 프로젝트 모두에서 `dokka {}` 블록 내에 출력 디렉터리를 지정하고 추가 파일을 포함할 수 있습니다.

DGP v2에서는 단일 모듈 및 멀티 모듈 프로젝트에 대한 구성이 통일되었습니다. 
`dokkaHtml` 및 `dokkaHtmlMultiModule` 태스크를 별도로 구성하는 대신, `dokka {}` 블록 내의 `dokkaPublications.html {}`에서 설정을 지정합니다.

멀티 모듈 프로젝트의 경우 루트 프로젝트의 구성에서 출력 디렉터리를 설정하고 추가 파일(예: `README.md`)을 포함합니다.

DGP v1에서의 구성:

```kotlin
tasks.dokkaHtmlMultiModule {
    outputDirectory.set(rootDir.resolve("docs/api/0.x"))
    includes.from(project.layout.projectDirectory.file("README.md"))
}
```

DGP v2에서의 구성:

Gradle의 Kotlin DSL은 타입 세이프 접근자를 사용하기 때문에 `build.gradle.kts` 파일의 구문은 일반적인 `.kt` 파일(예: 커스텀 Gradle 플러그인에 사용되는 파일)과 다릅니다.

<tabs group="dokka-configuration">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
// build.gradle.kts

dokka {
    dokkaPublications.html {
        outputDirectory.set(rootDir.resolve("docs/api/0.x"))
        includes.from(project.layout.projectDirectory.file("README.md"))
    }
}
```

</tab>
<tab title="Kotlin 커스텀 플러그인" group-key="kotlin custom">

```kotlin
// CustomPlugin.kt

import org.gradle.api.Plugin
import org.gradle.api.Project
import org.jetbrains.dokka.gradle.DokkaExtension

abstract class CustomPlugin : Plugin<Project> {
    override fun apply(project: Project) {
        project.plugins.apply("org.jetbrains.dokka")
        project.extensions.configure(DokkaExtension::class.java) { dokka ->
            dokka.dokkaPublications.named("html") { html ->
                html.outputDirectory.set(project.rootDir.resolve("docs/api/0.x"))
                html.includes.from(project.layout.projectDirectory.file("README.md"))
            }
        }
    }
}
```

</tab>
</tabs>

### Dokka 플러그인 구성 {id="configure-dokka-plugins"}

내장된 Dokka 플러그인을 JSON으로 구성하는 방식은 지원 중단(deprecated)되었으며, 타입 세이프 DSL 방식으로 대체되었습니다. 이 변경을 통해 Gradle의 증분 빌드 시스템과의 호환성이 향상되고 태스크 입력 추적이 개선되었습니다.

DGP v1에서의 구성:

DGP v1에서는 Dokka 플러그인을 JSON을 사용하여 수동으로 구성했습니다. 이 접근 방식은 Gradle의 최신 상태(up-to-date) 검사를 위한 [태스크 입력 등록](https://docs.gradle.org/current/userguide/incremental_build.html)에 문제를 일으켰습니다.

다음은 [Dokka Versioning 플러그인](https://kotl.in/dokka-versioning-plugin)에 대한 더 이상 사용되지 않는 JSON 기반 구성의 예입니다:

```kotlin
tasks.dokkaHtmlMultiModule {
    pluginsMapConfiguration.set(
        mapOf(
            "org.jetbrains.dokka.versioning.VersioningPlugin" to """
                { "version": "1.2", "olderVersionsDir": "$projectDir/dokka-docs" }
                """.trimIndent()
        )
    )
}
```

DGP v2에서의 구성:

DGP v2에서는 Dokka 플러그인을 타입 세이프 DSL을 사용하여 구성합니다. 타입 세이프한 방식으로 Dokka 플러그인을 구성하려면 `pluginsConfiguration{}` 블록을 사용합니다:

```kotlin
dokka {
    pluginsConfiguration {
        versioning {
            version.set("1.2")
            olderVersionsDir.set(projectDir.resolve("dokka-docs"))
        }
    }
}
```

DGP v2 구성의 예는
[Dokka의 versioning 플러그인 예제](https://github.com/Kotlin/dokka/tree/master/examples/gradle-v2/versioning-multimodule-example)를 참조하세요.

DGP v2에서는 [커스텀 플러그인 구성](https://github.com/Kotlin/dokka/blob/ae3840edb4e4afd7b3e3768a5fddfe8ec0e08f31/examples/gradle-v2/custom-dokka-plugin-example/demo-library/build.gradle.kts)을 통해 기능을 확장할 수 있습니다.
커스텀 플러그인을 사용하면 문서 생성 프로세스에 추가적인 처리나 수정을 적용할 수 있습니다.

### 서브프로젝트 간 Dokka 구성 공유 {id="share-dokka-configuration-across-subprojects"}

DGP v2는 서브프로젝트 간에 구성을 공유하기 위해 `subprojects {}` 또는 `allprojects {}`를 사용하는 방식에서 벗어났습니다. 향후 Gradle 버전에서는 
이러한 방식을 사용할 경우 [오류가 발생](https://docs.gradle.org/current/userguide/isolated_projects.html)합니다.

멀티 모듈 프로젝트에서 [기존 컨벤션 플러그인을 사용하거나](#multi-module-projects-with-convention-plugins), 
또는 [컨벤션 플러그인을 사용하지 않고](#multi-module-projects-without-convention-plugins) Dokka 구성을 올바르게 공유하려면 아래 단계를 따르세요.

Dokka 구성을 공유한 후, 여러 서브프로젝트의 문서를 하나의 결과물로 집계할 수 있습니다. 자세한 내용은
[멀티 모듈 프로젝트의 문서 집계 업데이트](#update-documentation-aggregation-in-multi-module-projects)를 참조하세요.

> 멀티 모듈 프로젝트 예제는 [Dokka GitHub 저장소](https://github.com/Kotlin/dokka/tree/master/examples/gradle-v2/multimodule-example)를 참조하세요.
>
{style="tip"}

#### 컨벤션 플러그인이 없는 멀티 모듈 프로젝트 {id="multi-module-projects-without-convention-plugins"}

프로젝트에서 컨벤션 플러그인을 사용하지 않는 경우에도 각 서브프로젝트를 직접 구성하여 Dokka 구성을 공유할 수 있습니다. 
이 방식은 각 서브프로젝트의 `build.gradle.kts` 파일에 공유 구성을 수동으로 설정하는 것입니다. 이 접근 방식은 덜 중앙 집중적이지만, 
컨벤션 플러그인과 같은 추가 설정이 필요하지 않습니다.

반면 컨벤션 플러그인을 사용하고자 한다면 `buildSrc` 디렉터리에 컨벤션 플러그인을 만든 다음, 서브프로젝트에 해당 플러그인을 적용하여 
멀티 모듈 프로젝트에서 Dokka 구성을 공유할 수도 있습니다.

##### buildSrc 디렉터리 설정 {id="set-up-the-buildsrc-directory"}

1. 프로젝트 루트에 다음 두 파일이 포함된 `buildSrc` 디렉터리를 생성합니다:

   * `settings.gradle.kts`
   * `build.gradle.kts`

2. `buildSrc/settings.gradle.kts` 파일에 다음 코드 스니펫을 추가합니다:

   ```kotlin
   rootProject.name = "buildSrc"
   ```

3. `buildSrc/build.gradle.kts` 파일에 다음 코드 스니펫을 추가합니다:

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

`buildSrc` 디렉터리를 설정한 후:

1. [컨벤션 플러그인](https://docs.gradle.org/current/userguide/custom_plugins.html#sec:convention_plugins)을 둘 `buildSrc/src/main/kotlin/dokka-convention.gradle.kts` 파일을 생성합니다.
2. `dokka-convention.gradle.kts` 파일에 다음 스니펫을 추가합니다:

    ```kotlin
    plugins {
        id("org.jetbrains.dokka") 
    }

    dokka {
        // 공유 구성이 여기에 들어갑니다.
    }
    ```

   `dokka {}` 블록 내에 모든 서브프로젝트에 공통으로 적용될 공유 Dokka [구성](#adjust-configuration-options)을 추가해야 합니다.
   또한 Dokka 버전을 지정할 필요가 없습니다. 버전은 이미 `buildSrc/build.gradle.kts` 파일에 설정되어 있습니다.

##### 서브프로젝트에 컨벤션 플러그인 적용 {id="apply-the-convention-plugin-to-your-subprojects"}

각 서브프로젝트의 `build.gradle.kts` 파일에 추가하여 서브프로젝트 전체에 Dokka 컨벤션 플러그인을 적용합니다:

```kotlin
plugins {
    id("dokka-convention")
}
```

#### 컨벤션 플러그인이 있는 멀티 모듈 프로젝트 {id="multi-module-projects-with-convention-plugins"}

이미 컨벤션 플러그인을 사용하고 있다면, [Gradle 설명서](https://docs.gradle.org/current/userguide/custom_plugins.html#sec:convention_plugins)에 따라 전용 Dokka 컨벤션 플러그인을 생성합니다.

그런 다음 단계에 따라 [Dokka 컨벤션 플러그인을 설정](#set-up-the-dokka-convention-plugin)하고 
[서브프로젝트 전체에 적용](#apply-the-convention-plugin-to-your-subprojects)합니다.

### 멀티 모듈 프로젝트의 문서 집계 업데이트 {id="update-documentation-aggregation-in-multi-module-projects"}

Dokka는 여러 서브프로젝트의 문서를 단일 결과물 또는 발행물(publication)로 집계(aggregate)할 수 있습니다.

[앞서 설명한 대로](#apply-the-convention-plugin-to-your-subprojects), 문서를 집계하기 전에 문서화할 수 있는 모든 서브프로젝트에 Dokka 플러그인을 적용하세요.

DGP v2에서의 집계는 태스크 대신 `dependencies {}` 블록을 사용하며, 모든 `build.gradle.kts` 파일에 추가할 수 있습니다. 

DGP v1에서는 집계가 루트 프로젝트에서 암시적으로 생성되었습니다. DGP v2에서 이 동작을 재현하려면 
루트 프로젝트의 `build.gradle.kts` 파일에 `dependencies {}` 블록을 추가합니다.

DGP v1에서의 집계:

```kotlin
    tasks.dokkaHtmlMultiModule {
        // ...
    }
```

DGP v2에서의 집계:

```kotlin
dependencies {
    dokka(project(":some-subproject:"))
    dokka(project(":another-subproject:"))
}
```

### 집계된 문서의 디렉터리 변경 {id="change-directory-of-aggregated-documentation"}

DGP가 서브프로젝트를 집계할 때, 각 서브프로젝트는 집계된 문서 내에서 고유한 하위 디렉터리를 갖습니다.

DGP v2에서는 집계 메커니즘이 Gradle 규칙에 더 잘 맞도록 업데이트되었습니다. 
이제 DGP v2는 어떤 위치에서 문서를 집계하든 충돌을 방지하기 위해 
전체 서브프로젝트 디렉터리를 보존합니다.

DGP v1에서의 집계 디렉터리:

DGP v1에서는 집계된 문서가 축소된(collapsed) 디렉터리 구조에 배치되었습니다. 
예를 들어, `:turbo-lib`에 집계가 설정되어 있고 중첩된 서브프로젝트 `:turbo-lib:maths`가 있는 프로젝트의 경우, 
생성된 문서는 다음 위치에 배치되었습니다:

```text
turbo-lib/build/dokka/html/maths/
```

DGP v2에서의 집계 디렉터리:

DGP v2는 전체 프로젝트 구조를 유지하여 각 서브프로젝트가 고유한 디렉터리를 갖도록 보장합니다. 동일한 집계 문서가 
이제 다음과 같은 구조를 따릅니다:

```text
turbo-lib/build/dokka/html/turbo-lib/maths/
```

이 변경을 통해 이름이 같은 서브프로젝트 간의 충돌을 방지할 수 있습니다. 그러나 디렉터리 구조가 변경되었기 때문에 외부 링크가 
만료되어 `404` 오류가 발생할 수 있습니다.

#### DGP v1 디렉터리 동작으로 되돌리기 {id="revert-to-the-dgp-v1-directory-behavior"}

프로젝트가 DGP v1에서 사용된 디렉터리 구조에 의존하는 경우, 서브프로젝트 디렉터리를 수동으로 지정하여 이 동작을 되돌릴 수 있습니다.
각 서브프로젝트의 `build.gradle.kts` 파일에 다음 구성을 추가합니다:

```kotlin
// /turbo-lib/maths/build.gradle.kts

plugins {
    id("org.jetbrains.dokka")
}

dokka {
    // V1 구조와 일치하도록 서브프로젝트 디렉터리를 재정의합니다
    modulePath.set("maths")
}
```

### 업데이트된 태스크로 문서 생성 {id="generate-documentation-with-the-updated-task"}

DGP v2에서는 API 문서를 생성하는 Gradle 태스크의 이름이 변경되었습니다.

DGP v1에서의 태스크:

```text
./gradlew dokkaHtml

// 또는

./gradlew dokkaHtmlMultiModule
```

DGP v2에서의 태스크:

```text
./gradlew :dokkaGenerate
```

`dokkaGenerate` 태스크는 `build/dokka/` 디렉터리에 API 문서를 생성합니다.

DGP v2 버전에서는 `dokkaGenerate` 태스크 이름이 단일 모듈 및 멀티 모듈 프로젝트 모두에서 작동합니다. 서로 다른 태스크를 사용하여 
HTML, Javadoc, 또는 HTML과 Javadoc 둘 다로 출력을 생성할 수 있습니다. 자세한 내용은 [문서 출력 형식 선택](#select-documentation-output-format)을 참조하세요.

### 문서 출력 형식 선택 {id="select-documentation-output-format"}

> Javadoc 출력 형식은 [Alpha](https://kotlinlang.org/docs/components-stability.html#stability-levels-explained) 단계입니다.
> 사용할 때 버그가 발견되거나 마이그레이션 문제가 발생할 수 있습니다. Javadoc을 입력으로 받는 
> 도구와의 성공적인 연동은 보장되지 않습니다. 위험을 감수하고 사용하시기 바랍니다.
>
{style="warning"}

DGP v2의 기본 출력 형식은 HTML입니다. 하지만 API 문서를 HTML, Javadoc, 
또는 두 형식 모두로 동시에 생성하도록 선택할 수 있습니다:

1. 프로젝트의 `build.gradle.kts` 파일에 있는 `plugins {}` 블록에 해당하는 플러그인 `id`를 추가합니다:

   ```kotlin
   plugins {
       // HTML 문서를 생성합니다
       id("org.jetbrains.dokka") version "%dokkaVersion%"

       // Javadoc 문서를 생성합니다
       id("org.jetbrains.dokka-javadoc") version "%dokkaVersion%"

       // 두 플러그인 ID를 모두 유지하면 두 형식이 모두 생성됩니다
   }
   ```

2. 해당하는 Gradle 태스크를 실행합니다.

다음은 각 형식에 해당하는 플러그인 `id` 및 Gradle 태스크 목록입니다:

|             | **HTML**                       | **Javadoc**                         | **둘 다**                          |
|-------------|--------------------------------|-------------------------------------|-----------------------------------|
| 플러그인 `id` | `id("org.jetbrains.dokka")`    | `id("org.jetbrains.dokka-javadoc")` | HTML 및 Javadoc 플러그인 둘 다 사용 |
| Gradle 태스크 | `./gradlew :dokkaGeneratePublicationHtml` | `./gradlew :dokkaGeneratePublicationJavadoc`   | `./gradlew :dokkaGenerate`        |

> `dokkaGenerate` 태스크는 적용된 플러그인을 기반으로 사용 가능한 모든 형식의 문서를 생성합니다. 
> HTML과 Javadoc 플러그인이 모두 적용된 경우, `dokkaGeneratePublicationHtml` 태스크를 실행하여 HTML만 생성하거나 
> `dokkaGeneratePublicationJavadoc` 태스크를 실행하여 Javadoc만 생성하도록 선택할 수 있습니다.
> 
{style="tip"}

IntelliJ IDEA를 사용하는 경우 `dokkaGenerateHtml` Gradle 태스크가 표시될 수 있습니다.
이 태스크는 단순히 `dokkaGeneratePublicationHtml`의 별칭(alias)입니다. 두 태스크는 완전히 동일한 작업을 수행합니다.

### 지원 중단 및 제거 항목 처리 {id="address-deprecations-and-removals"}

* **출력 형식 지원:** DGP v2는 HTML 및 Javadoc 출력만 지원합니다. Markdown 및 Jekyll과 같은 실험적 형식은 더 이상 지원되지 않습니다.
* **컬렉터 태스크:** `DokkaCollectorTask`가 제거되었습니다. 이제 각 서브프로젝트에 대해 문서를 별도로 생성한 다음, 
  필요한 경우 [문서를 집계](#update-documentation-aggregation-in-multi-module-projects)해야 합니다.

## 마이그레이션 마무리 {id="finalize-your-migration"}

프로젝트 마이그레이션을 마친 후, 다음 단계를 수행하여 작업을 정리하고 성능을 향상시키세요.

### 옵트인(opt-in) 플래그 설정 {id="set-the-opt-in-flag"}

마이그레이션이 성공적으로 완료되면 프로젝트의 `gradle.properties` 파일에 헬퍼 없이 다음 옵트인 플래그를 설정합니다:

```text
org.jetbrains.dokka.experimental.gradle.pluginMode=V2Enabled
```

DGP v2에서 더 이상 사용할 수 없는 DGP v1의 Gradle 태스크에 대한 참조를 제거했다면, 
이와 관련된 컴파일 오류가 발생하지 않아야 합니다.

### 빌드 캐시 및 구성 캐시 활성화 {id="enable-build-cache-and-configuration-cache"}

DGP v2는 이제 Gradle 빌드 캐시 및 구성 캐시를 지원하여 빌드 성능을 향상시킵니다.

* 빌드 캐시를 활성화하려면 [Gradle 빌드 캐시 설명서](https://docs.gradle.org/current/userguide/build_cache.html#sec:build_cache_enable)의 지침을 따르세요.
* 구성 캐시를 활성화하려면 [Gradle 구성 캐시 설명서](https://docs.gradle.org/current/userguide/configuration_cache.html#config_cache:usage:enable)의 지침을 따르세요.

## 다음 단계 {id="what-s-next"}

* [더 많은 DGP v2 프로젝트 예제 살펴보기](https://github.com/Kotlin/dokka/tree/master/examples/gradle-v2).
* [Dokka 시작하기](dokka-get-started.md).
* [Dokka 플러그인에 대해 자세히 알아보기](dokka-plugins.md).