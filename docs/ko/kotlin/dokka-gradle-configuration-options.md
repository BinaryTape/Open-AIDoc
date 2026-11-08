[//]: # (title: Dokka Gradle 설정 옵션)

Dokka는 사용자와 독자의 경험을 맞춤 설정할 수 있는 다양한 구성 옵션을 제공합니다.

아래는 각 설정 섹션에 대한 자세한 설명과 몇 가지 예제입니다. 
[모든 설정 옵션](#complete-configuration)이 적용된 예제도
확인할 수 있습니다.

단일 프로젝트 및 멀티프로젝트 빌드에 설정 블록을 적용하는 방법에 대한 자세한 내용은
[설정 예제](dokka-gradle.md#configuration-examples)를 참조하세요.

### 일반 설정 {id="general-configuration"}

일반적인 Dokka Gradle 플러그인 설정 예제는 다음과 같습니다. 

* 최상위 수준의 `dokka {}` DSL 설정을 사용합니다.
* DGP에서는 `dokkaPublications{}` 블록에서 Dokka 배포(publication) 구성을 선언합니다.
* 기본 배포는 [`html`](dokka-html.md) 및 [`javadoc`](dokka-javadoc.md)입니다.

* Gradle의 Kotlin DSL은 타입 안전한 접근자(type-safe accessors)를 사용하므로, `build.gradle.kts` 파일의 문법은 일반 `.kt` 파일(Kotlin 커스텀 플러그인에 사용되는 파일 등)과 다릅니다.

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
plugins {
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}

dokka {
    dokkaPublications.html {
        moduleName.set(project.name)
        moduleVersion.set(project.version.toString())
        // HTML 문서의 표준 출력 디렉터리
        outputDirectory.set(layout.buildDirectory.dir("dokka/html"))
        failOnWarning.set(false)
        suppressInheritedMembers.set(false)
        suppressObviousFunctions.set(true)
        offlineMode.set(false)
        includes.from("packages.md", "extra.md")
        
        // 추가 파일용 출력 디렉터리
        // 출력 디렉터리를 변경하고 추가 파일을 포함하려는 경우 
        // 표준 블록 대신 이 블록을 사용합니다.
        outputDirectory.set(rootDir.resolve("docs/api/0.x"))
        
        // 여러 파일을 추가하려면 fileTree를 사용합니다.
        includes.from(
            fileTree("docs") {
                include("**/*.md")
            }
        )
    }
}
```

파일 작업에 대한 자세한 내용은 [Gradle 문서](https://docs.gradle.org/current/userguide/working_with_files.html#sec:file_trees)를 참조하세요.

</tab>
<tab title="Kotlin custom plugin" group-key="kotlin custom">

```kotlin
// CustomPlugin.kt

import org.gradle.api.Plugin
import org.gradle.api.Project
import org.jetbrains.dokka.gradle.DokkaExtension

abstract class CustomPlugin : Plugin<Project> {
    override fun apply(project: Project) {
        project.plugins.apply("org.jetbrains.dokka")

        project.extensions.configure(DokkaExtension::class.java) { dokka ->
            
            dokka.moduleName.set(project.name)
            dokka.moduleVersion.set(project.version.toString())

            dokka.dokkaPublications.named("html") { publication ->
                // HTML 문서의 표준 출력 디렉터리
                publication.outputDirectory.set(project.layout.buildDirectory.dir("dokka/html"))
                publication.failOnWarning.set(true)
                publication.suppressInheritedMembers.set(true)
                publication.offlineMode.set(false)
                publication.suppressObviousFunctions.set(true)
                publication.includes.from("packages.md", "extra.md")

                // 추가 파일용 출력 디렉터리
                // 출력 디렉터리를 변경하고 추가 파일을 포함하려는 경우 
                // 표준 블록 대신 이 블록을 사용합니다.
                html.outputDirectory.set(project.rootDir.resolve("docs/api/0.x"))
            }
        }
    }
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.dokka' version '%dokkaVersion%'
}

dokka {
    dokkaPublications {
        html {
            // 일반 모듈 정보 설정
            moduleName.set(project.name)
            moduleVersion.set(project.version.toString())

            // HTML 문서의 표준 출력 디렉터리
            outputDirectory.set(layout.buildDirectory.dir("dokka/html"))

            // 핵심 Dokka 옵션
            failOnWarning.set(false)
            suppressInheritedMembers.set(false)
            suppressObviousFunctions.set(true)
            offlineMode.set(false)
            includes.from(files("packages.md", "extra.md"))

            // 추가 파일용 출력 디렉터리
            // 출력 디렉터리를 변경하고 추가 파일을 포함하려는 경우 
            // 표준 블록 대신 이 블록을 사용합니다.
            outputDirectory.set(file("$rootDir/docs/api/0.x"))
        }
    }
}
```

</tab>
</tabs>

<deflist collapsible="true">
    <def title="moduleName">
        <p>
           프로젝트 문서의 표시 이름입니다. 목차, 내비게이션, 헤더 및 로그 메시지에 나타납니다.
           멀티프로젝트 빌드에서는 통합 문서에서 각 서브프로젝트의 <code>moduleName</code>이
           해당 섹션의 제목으로 사용됩니다.
        </p>
        <p>기본값: Gradle 프로젝트 이름</p>
    </def>
    <def title="moduleVersion">
        <p>
            생성된 문서에 표시되는 서브프로젝트 버전입니다.
            단일 프로젝트 빌드에서는 프로젝트 버전으로 사용됩니다.
            멀티프로젝트 빌드에서는 문서를 통합할 때 각 서브프로젝트의 <code>moduleVersion</code>이
            사용됩니다.
        </p>
        <p>기본값: Gradle 프로젝트 버전</p>
    </def>
    <def title="outputDirectory">
        <p>생성된 문서가 저장되는 디렉터리입니다.</p>
        <p>이 설정은 <code>dokkaGenerate</code> 태스크로 생성되는 모든 문서 포맷(HTML, Javadoc 등)에 적용됩니다.</p>
        <p>기본값: <code>build/dokka/html</code></p>
        <p><b>추가 파일용 출력 디렉터리</b></p>
        <p>단일 프로젝트 및 멀티프로젝트 빌드 모두에서 출력 디렉터리를 지정하고 추가 파일을 포함할 수 있습니다.
           멀티프로젝트 빌드의 경우,
           루트 프로젝트의 설정에서 출력 디렉터리를 지정하고 추가 파일을 포함하세요.
        </p>
    </def>
    <def title="failOnWarning">
        <p>
            문서 생성 중 경고가 발생했을 때 Dokka가 빌드를 실패 처리할지 여부를 결정합니다.
            이 프로세스는 먼저 모든 오류와 경고가 출력될 때까지 대기합니다.
        </p>
        <p>이 설정은 <code>reportUndocumented</code>와 함께 사용하기 좋습니다.</p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="suppressInheritedMembers">
        <p>해당 클래스에서 명시적으로 오버라이드되지 않은 상속된 멤버를 생략할지 여부입니다.</p>
        <p>
            참고: 
            이 설정은 <code>equals</code>, <code>hashCode</code>, <code>toString</code>과 같은 함수를 생략하지만,
            <code>dataClass.componentN</code> 및 <code>dataClass.copy</code>와 같은 합성 함수(synthetic function)는
            생략하지 않습니다. 이를 생략하려면 <code>suppressObviousFunctions</code>를 사용하세요.
        </p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="suppressObviousFunctions">
        <p>자명한(obvious) 함수를 생략할지 여부입니다.</p>
        <p>
            다음과 같은 경우 함수가 자명한 것으로 간주됩니다:</p>
            <list>
                <li>
                    <code>kotlin.Any</code>, <code>Kotlin.Enum</code>, <code>java.lang.Object</code> 또는
                    <code>java.lang.Enum</code>에서 상속된 경우 (예: <code>equals</code>, <code>hashCode</code>, <code>toString</code>).
                </li>
                <li>
                    컴파일러에 의해 생성된 합성 함수(synthetic function)이며 문서가 없는 경우 (예: <code>dataClass.componentN</code>, <code>dataClass.copy</code>).
                </li>
            </list>
        <p>기본값: <code>true</code></p>
    </def>
    <def title="offlineMode">
        <p>네트워크를 통해 원격 파일과 링크를 확인할지(resolve) 여부입니다.</p>
        <p>
            여기에는 외부 문서로의 링크 생성에 사용되는 package-list가 포함됩니다.
            예를 들어, 이를 통해 문서 내에서 표준 라이브러리의 클래스를 클릭할 수 있게 됩니다.
        </p>
        <p>
            이 값을 <code>true</code>로 설정하면 특정 상황에서 빌드 시간을 크게 단축할 수 있지만,
            사용자 경험이 저하될 수도 있습니다. 예를 들어 표준 라이브러리를 포함하여 의존성의 클래스 및 멤버 링크가
            확인되지 않을 수 있습니다.
        </p>
        <p>참고: 다운로드한 파일을 로컬에 캐시하고 Dokka에 로컬 경로로 제공할 수 있습니다.
           <code>&lt;a href="#external-documentation-links-configuration"&gt;externalDocumentationLinks&lt;/a&gt;</code> 섹션을 참조하세요.</p>
        <p>기본값: <code>false</code></p>
    </def>
     <def title="includes">
        <p>
            <a href="dokka-module-and-package-docs.md">서브프로젝트 및 패키지 문서</a>를 포함하는 Markdown 파일
            목록입니다. Markdown 파일은 <a href="dokka-module-and-package-docs.md#file-format">필수 형식</a>과
            일치해야 합니다.
        </p>
        <p>지정된 파일의 내용은 파싱되어 서브프로젝트 및 패키지 설명으로 문서에 임베드됩니다.</p>
        <p>
            실제 형태와 사용 방법의 예시는 <a href="https://github.com/Kotlin/dokka/blob/master/examples/gradle-v2/basic-gradle-example/build.gradle.kts">Dokka Gradle 예제</a>를
            참조하세요.
        </p>
    </def>
</deflist>

### 소스 세트 설정 {id="source-set-configuration"}

Dokka에서는 [Kotlin 소스 세트](https://kotlinlang.org/docs/multiplatform-discover-project.html#source-sets)에
대한 몇 가지 옵션을 구성할 수 있습니다:

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
import org.jetbrains.dokka.gradle.engine.parameters.VisibilityModifier

dokka {
    // ..
    // 일반 설정 섹션
    // ..

    // 소스 세트 설정
    dokkaSourceSets {
        // 예시: 'linux' 소스 세트 전용 설정
        named("linux") {
            dependentSourceSets{named("native")}
            sourceRoots.from(file("linux/src"))
        }

        configureEach {
            suppress.set(false)
            displayName.set(name)
            documentedVisibilities.set(setOf(VisibilityModifier.Public)) // 또는 documentedVisibilities(VisibilityModifier.Public)
            reportUndocumented.set(false)
            skipEmptyPackages.set(true)
            skipDeprecated.set(false)
            suppressGeneratedFiles.set(true)
            jdkVersion.set(8)
            languageVersion.set("1.7")
            apiVersion.set("1.7")
            sourceRoots.from(file("src"))
            classpath.from(file("libs/dependency.jar"))
            samples.from("samples/Basic.kt", "samples/Advanced.kt")
           
            sourceLink {
                // 소스 링크 섹션
            }
            perPackageOption {
                // 패키지 옵션 섹션
            }
            externalDocumentationLinks {
                // 외부 문서 링크 섹션
            }
        }
    }
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
import org.jetbrains.dokka.gradle.engine.parameters.VisibilityModifier

dokka {
    // ..
    // 일반 설정 섹션
    // ..

    dokkaSourceSets {
        // 예시: 'linux' 소스 세트 전용 설정
        named("linux") {
            dependentSourceSets { named("native") }
            sourceRoots.from(file("linux/src"))
        }

        configureEach {
            suppress.set(false)
            displayName.set(name)
            documentedVisibilities.set([VisibilityModifier.Public] as Set) // 또는 documentedVisibilities(VisibilityModifier.Public)
            reportUndocumented.set(false)
            skipEmptyPackages.set(true)
            skipDeprecated.set(false)
            suppressGeneratedFiles.set(true)
            jdkVersion.set(8)
            languageVersion.set("1.7")
            apiVersion.set("1.7")
            sourceRoots.from(file("src"))
            classpath.from(file("libs/dependency.jar"))
            samples.from("samples/Basic.kt", "samples/Advanced.kt")

            sourceLink {
                // 소스 링크 섹션
            }
            perPackageOption {
                // 패키지 옵션 섹션
            }
            externalDocumentationLinks {
                // 외부 문서 링크 섹션
            }
        }
    }
}
```

</tab>
</tabs>

<deflist collapsible="true">
    <def title="suppress">
        <p>문서 생성 시 이 소스 세트를 건너뛸지 여부입니다.</p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="displayName">
        <p>이 소스 세트를 참조하는 데 사용되는 표시 이름입니다.</p>
        <p>
            이 이름은 외부적으로(예: 문서 독자에게 표시되는 소스 세트 이름)뿐만 아니라
            내부적으로도(예: <code>reportUndocumented</code>의 로깅 메시지) 사용됩니다.
        </p>
        <p>기본적으로 이 값은 Kotlin Gradle 플러그인에서 제공하는 정보로부터 추론됩니다.</p>
    </def>
    <def title="documentedVisibilities">
        <p>생성된 문서에 Dokka가 포함할 가시성 수정자(visibility modifier)를 정의합니다.</p>
        <p>
            <code>protected</code>, <code>internal</code>, <code>private</code> 선언을 문서화하거나,
            <code>public</code> 선언을 제외하고 내부 API만 문서화하려는 경우에 사용합니다.
        </p>
        <p>
            또한 Dokka의 
            <a href="https://github.com/Kotlin/dokka/blob/v2.3.0/dokka-runners/dokka-gradle-plugin/src/main/kotlin/engine/parameters/HasConfigurableVisibilityModifiers.kt"><code>documentedVisibilities()</code> 함수</a>를 
            사용하여 문서화할 가시성을 추가할 수 있습니다.
        </p>
        <p>이 설정은 각 개별 패키지별로도 구성할 수 있습니다.</p>
        <p>기본값: <code>VisibilityModifier.Public</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            <code>documentedVisibilities</code> 및 기타 필터에 의해 필터링된 후, KDoc이 없는 공개된 미문서화 선언에 대해
            경고를 출력할지 여부입니다.
        </p>
        <p>이 설정은 <code>failOnWarning</code>과 함께 사용하기 좋습니다.</p>
        <p>이 설정은 각 개별 패키지별로도 구성할 수 있습니다.</p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="skipEmptyPackages">
        <p>
            다양한 필터가 적용된 후 표시 가능한 선언이 남아 있지 않은 패키지를
            건너뛸지 여부입니다.
        </p>
        <p>
            예를 들어 <code>skipDeprecated</code>가 <code>true</code>로 설정되어 있고 패키지에
            사용 중단된(deprecated) 선언만 포함되어 있는 경우, 해당 패키지는 비어 있는 것으로 간주됩니다.
        </p>
        <p>기본값: <code>true</code></p>
    </def>
    <def title="skipDeprecated">
        <p><code>@Deprecated</code> 어노테이션이 지정된 선언을 문서화할지 여부입니다.</p>
        <p>이 설정은 각 개별 패키지별로도 구성할 수 있습니다.</p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="suppressGeneratedFiles">
        <p>생성된 파일을 문서화할지 여부입니다.</p>
        <p>
            생성된 파일은 <code>{project}/{buildDir}/generated</code> 디렉터리 아래에 위치할 것으로 예상됩니다.
        </p>
        <p>
            <code>true</code>로 설정하면 해당 디렉터리의 모든 파일이 <code>suppressedFiles</code> 옵션에
            실질적으로 추가되므로 수동으로 구성할 수 있습니다.
        </p>
        <p>기본값: <code>true</code></p>
    </def>
    <def title="suppressAnnotatedWith">
        <p>문서 생성을 생략할 대상 어노테이션의 완전 정규화된 이름(FQN) 세트입니다.</p>
        <p>
            이 어노테이션 중 하나라도 지정된 선언은 생성된 문서에서 제외됩니다.
        </p>
    </def>
    <def title="jdkVersion">
        <p>Java 타입에 대한 외부 문서 링크를 생성할 때 사용할 JDK 버전입니다.</p>
        <p>
            예를 들어 특정 public 선언 시그니처에서 <code>java.util.UUID</code>를 사용하고
            이 옵션이 <code>8</code>로 설정된 경우, Dokka는 이에 대해
            <a href="https://docs.oracle.com/javase/8/docs/api/java/util/UUID.html">JDK 8 Javadoc</a>으로 연결되는 외부 문서 링크를 생성합니다.
        </p>
        <p>기본값: `8`</p>
    </def>
    <def title="languageVersion">
        <p>
            분석 및 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> 환경을
            설정하는 데 사용되는 <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin 언어 버전</a>입니다.
        </p>
        <p>기본적으로 Dokka의 내장 컴파일러에서 사용할 수 있는 최신 언어 버전이 사용됩니다.</p>
    </def>
    <def title="apiVersion">
        <p>
            분석 및 <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> 환경을
            설정하는 데 사용되는 <a href="https://kotlinlang.org/docs/compatibility-modes.html">Kotlin API 버전</a>입니다.
        </p>
        <p>기본적으로 <code>languageVersion</code>으로부터 추론됩니다.</p>
    </def>
    <def title="sourceRoots">
        <p>
            분석 및 문서화할 소스 코드 루트입니다.
            허용되는 입력은 디렉터리와 개별 <code>.kt</code> 및 <code>.java</code> 파일입니다.
        </p>
        <p>기본적으로 소스 루트는 Kotlin Gradle 플러그인에서 제공하는 정보로부터 추론됩니다.</p>
    </def>
    <def title="classpath">
        <p>분석 및 인터랙티브 샘플을 위한 클래스패스입니다.</p>
        <p>의존성에서 가져온 일부 타입이 자동으로 확인되지 않거나 인식되지 않는 경우에 유용합니다.</p>
        <p>이 옵션은 <code>.jar</code>와 <code>.klib</code> 파일을 모두 허용합니다.</p>
        <p>기본적으로 클래스패스는 Kotlin Gradle 플러그인에서 제공하는 정보로부터 추론됩니다.</p>
    </def>
    <def title="samples">
        <p>
            <a href="https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier">@sample</a> KDoc 태그를 통해
            참조되는 샘플 함수가 포함된 디렉터리 또는 파일 목록입니다.
        </p>
    </def>
</deflist>

### 소스 링크 설정 {id="source-link-configuration"}

독자가 원격 리포지토리에서 각 선언의 소스를 찾을 수 있도록 소스 링크를 구성합니다.
이 설정에는 `dokkaSourceSets.main {}` 블록을 사용합니다.

`sourceLinks {}` 구성 블록을 사용하면 특정 줄 번호가 포함된 `remoteUrl`로 이어지는
`source` 링크를 각 시그니처에 추가할 수 있습니다.
줄 번호는 `remoteLineSuffix`를 설정하여 구성할 수 있습니다.

예시는 `kotlinx.coroutines`의
[`count()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/count.html)
함수 문서를 참조하세요.

Gradle의 Kotlin DSL은 타입 안전한 접근자를 사용하므로, `build.gradle.kts` 파일의 문법은 일반 `.kt` 파일(커스텀 Gradle 플러그인에 사용되는 파일 등)과 다릅니다:

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
<tab title="Kotlin custom plugin" group-key="kotlin custom">

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
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
dokka {
    dokkaSourceSets {
        main {
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

<deflist collapsible="true">
    <def title="localDirectory">
        <p>
            로컬 소스 디렉터리의 경로입니다. 이 경로는 현재 프로젝트의 루트에
            상대적이어야 합니다.
        </p>
    </def>
    <def title="remoteUrl">
        <p>
            GitHub, GitLab, Bitbucket 또는 소스 파일에 대한 고유한 URL을 제공하는 호스팅 서비스 등,
            문서 독자가 접근할 수 있는 소스 코드 호스팅 서비스의 URL입니다.
            이 URL은 선언의 소스 코드 링크를 생성하는 데 사용됩니다.
        </p>
    </def>
    <def title="remoteLineSuffix">
        <p>
            소스 코드 줄 번호를 URL에 덧붙이는 데 사용되는 접미사입니다. 독자가 파일뿐만 아니라
            선언의 특정 줄 번호로 직접 이동할 수 있도록 도와줍니다.
        </p>
        <p>
            줄 번호 자체는 지정된 접미사 뒤에 추가됩니다. 예를 들어,
            이 옵션이 <code>#L</code>로 설정되고 줄 번호가 10인 경우 생성되는 URL 접미사는
            <code>#L10</code>이 됩니다.
        </p>
        <p>
            주요 서비스에서 사용되는 접미사:</p>
            <list>
                <li>GitHub: <code>#L</code></li>
                <li>GitLab: <code>#L</code></li>
                <li>Bitbucket: <code>#lines-</code></li>
            </list>
        <p>기본값: <code>#L</code></p>
    </def>
</deflist>

### 패키지 옵션 {id="package-options"}

`perPackageOption` 구성 블록을 사용하면 `matchingRegex`와 일치하는 특정 패키지에 대해 일부 옵션을 설정할 수 있습니다:

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
import org.jetbrains.dokka.gradle.engine.parameters.VisibilityModifier

dokka {
    dokkaPublications.html {
        dokkaSourceSets.configureEach {
            perPackageOption {
                matchingRegex.set(".*api.*")
                suppress.set(false)
                skipDeprecated.set(false)
                reportUndocumented.set(false)
                documentedVisibilities.set(setOf(VisibilityModifier.Public)) // 또는 documentedVisibilities(VisibilityModifier.Public)
            }
        }
    }
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
import org.jetbrains.dokka.gradle.engine.parameters.VisibilityModifier

dokka {
    dokkaPublications {
        html {
            dokkaSourceSets.configureEach {
                perPackageOption {
                    matchingRegex.set(".*api.*")
                    suppress.set(false)
                    skipDeprecated.set(false)
                    reportUndocumented.set(false)
                    documentedVisibilities.set([VisibilityModifier.Public] as Set)
                }
            }
        }
    }
}
```

</tab>
</tabs>

<deflist collapsible="true">
    <def title="matchingRegex">
        <p>패키지를 매칭하는 데 사용되는 정규식입니다.</p>
        <p>기본값: <code>.&#42;</code></p>
    </def>
    <def title="suppress">
        <p>문서 생성 시 이 패키지를 건너뛸지 여부입니다.</p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="skipDeprecated">
        <p><code>@Deprecated</code> 어노테이션이 지정된 선언을 문서화할지 여부입니다.</p>
        <p>소스 세트 수준에서도 구성할 수 있습니다.</p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="reportUndocumented">
        <p>
            <code>documentedVisibilities</code> 및 기타 필터에 의해 필터링된 후, KDoc이 없는 공개된 미문서화 선언에 대해
            경고를 출력할지 여부입니다.
        </p>
        <p>이 설정은 <code>failOnWarning</code>과 함께 사용하기 좋습니다.</p>
        <p>소스 세트 수준에서도 구성할 수 있습니다.</p>
        <p>기본값: <code>false</code></p>
    </def>
    <def title="documentedVisibilities">
        <p>생성된 문서에 Dokka가 포함할 가시성 수정자를 정의합니다.</p>
        <p>
            이 패키지 내에서 <code>protected</code>, <code>internal</code>, <code>private</code> 선언을
            문서화하려는 경우나, <code>public</code> 선언을 제외하고 내부 API만 문서화하려는 경우에
            사용합니다.
        </p>
        <p>
            또한 Dokka의 
            <a href="https://github.com/Kotlin/dokka/blob/v2.0.0/dokka-runners/dokka-gradle-plugin/src/main/kotlin/engine/parameters/HasConfigurableVisibilityModifiers.kt#L14-L16"><code>documentedVisibilities()</code> 함수</a>를 
            사용하여 문서화할 가시성을 추가할 수 있습니다.
        </p>
        <p>소스 세트 수준에서도 구성할 수 있습니다.</p>
        <p>기본값: <code>VisibilityModifier.Public</code></p>
    </def>
</deflist>

### 외부 문서 링크 설정 {id="external-documentation-links-configuration"}

`externalDocumentationLinks {}`
블록을 사용하면 의존성의 외부에 호스팅된 문서로 연결되는 링크를
생성할 수 있습니다.

예를 들어, `kotlinx.serialization`의 타입을 사용하는 경우 기본적으로는 해결되지 않은 타입처럼 문서에서 클릭할 수 없습니다. 하지만 `kotlinx.serialization`의 API 레퍼런스 문서는 Dokka로 빌드되어 [kotlinlang.org에 게시](https://kotlinlang.org/api/kotlinx.serialization/)되므로, 이에 대한 외부 문서 링크를 구성할 수 있습니다. 이를 통해 Dokka는 해당 라이브러리의 타입에 대한 링크를 생성하여 성공적으로 확인하고 클릭할 수 있도록 만듭니다.

기본적으로 Kotlin 표준 라이브러리, JDK, Android SDK, AndroidX에 대한 외부 문서 링크가 구성되어 있습니다.

각 링크를 정의하려면 `register()` 메서드를 사용하여 외부 문서 링크를 등록합니다.
`externalDocumentationLinks` API는 Gradle DSL 규칙에 맞춰 이 메서드를 사용합니다:

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

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

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
dokka {
    dokkaSourceSets.configureEach {
        externalDocumentationLinks.register("example-docs") {
            url.set(new URI("https://example.com/docs/"))
            packageListUrl.set(new URI("https://example.com/docs/package-list"))
        }
    }
}
```

</tab>
</tabs>

<deflist collapsible="true">
    <def title="url">
        <p>링크할 문서의 루트 URL입니다. <b>반드시</b> 끝에 슬래시를 포함해야 합니다.</p>
        <p>
            Dokka는 제공된 URL에서 <code>package-list</code>를 자동으로 찾아 
            선언들을 서로 연결하기 위해 최선을 다합니다.
        </p>
        <p>
            자동 확인에 실패하거나 로컬에 캐시된 파일을 대신 사용하려는 경우, 
            <code>packageListUrl</code> 옵션을 설정하는 것을 고려하세요.
        </p>
    </def>
    <def title="packageListUrl">
        <p>
            <code>package-list</code>의 정확한 위치입니다. Dokka가 자동으로 확인하는 것에
            의존하는 대신 사용할 수 있는 대안입니다.
        </p>
        <p>
            패키지 목록에는 서브프로젝트 및 패키지 이름과 같은 문서 및 프로젝트 자체에 대한
            정보가 포함되어 있습니다.
        </p>
        <p>네트워크 호출을 방지하기 위해 로컬에 캐시된 파일일 수도 있습니다.</p>
    </def>
</deflist>

### 전체 설정 예시 {id="complete-configuration"}

아래에서 가능한 모든 구성 옵션이 동시에 적용된 전체 예제를 확인할 수 있습니다:

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
import org.jetbrains.dokka.gradle.engine.parameters.VisibilityModifier

plugins {
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}

dokka {
    dokkaPublications.html {
        moduleName.set(project.name)
        moduleVersion.set(project.version.toString())
        outputDirectory.set(layout.buildDirectory.dir("dokka/html"))
        failOnWarning.set(false)
        suppressInheritedMembers.set(false)
        suppressObviousFunctions.set(true)
        offlineMode.set(false)
        includes.from("packages.md", "extra.md")
   }

    dokkaSourceSets {
        // 예시: 'linux' 소스 세트 전용 설정
        named("linux") {
            dependentSourceSets{named("native")}
            sourceRoots.from(file("linux/src"))
        }

        configureEach {
            suppress.set(false)
            displayName.set(name)
            documentedVisibilities.set(setOf(VisibilityModifier.Public)) // 또는 documentedVisibilities(VisibilityModifier.Public)
            reportUndocumented.set(false)
            skipEmptyPackages.set(true)
            skipDeprecated.set(false)
            suppressGeneratedFiles.set(true)
            jdkVersion.set(8)
            languageVersion.set("1.7")
            apiVersion.set("1.7")
            sourceRoots.from(file("src"))
            classpath.from(file("libs/dependency.jar"))
            samples.from("samples/Basic.kt", "samples/Advanced.kt")

            sourceLink {
                localDirectory.set(file("src/main/kotlin"))
                remoteUrl("https://example.com/src")
                remoteLineSuffix.set("#L")
            }

            externalDocumentationLinks {
                url = URL("https://example.com/docs/")
                packageListUrl = File("/path/to/package-list").toURI().toURL()
            }

            perPackageOption {
                matchingRegex.set(".*api.*")
                suppress.set(false)
                skipDeprecated.set(false)
                reportUndocumented.set(false)
                documentedVisibilities.set(
                    setOf(
                        VisibilityModifier.Public,
                        VisibilityModifier.Private,
                        VisibilityModifier.Protected,
                        VisibilityModifier.Internal,
                        VisibilityModifier.Package
                    )
                )
            }
        }
    }
}
```

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
import org.jetbrains.dokka.gradle.engine.parameters.VisibilityModifier

plugins {
    id 'org.jetbrains.dokka' version '%dokkaVersion%'
}

dokka {
    dokkaPublications {
        html {
            moduleName.set(project.name)
            moduleVersion.set(project.version.toString())
            outputDirectory.set(layout.buildDirectory.dir("dokka/html"))
            failOnWarning.set(false)
            suppressInheritedMembers.set(false)
            suppressObviousFunctions.set(true)
            offlineMode.set(false)
            includes.from("packages.md", "extra.md")
        }
    }

    dokkaSourceSets {
        // 예시: 'linux' 소스 세트 전용 설정
        named("linux") {
            dependentSourceSets { named("native") }
            sourceRoots.from(file("linux/src"))
        }

        configureEach {
            suppress.set(false)
            displayName.set(name)
            documentedVisibilities.set([VisibilityModifier.Public] as Set)
            reportUndocumented.set(false)
            skipEmptyPackages.set(true)
            skipDeprecated.set(false)
            suppressGeneratedFiles.set(true)
            jdkVersion.set(8)
            languageVersion.set("1.7")
            apiVersion.set("1.7")
            sourceRoots.from(file("src"))
            classpath.from(file("libs/dependency.jar"))
            samples.from("samples/Basic.kt", "samples/Advanced.kt")

            sourceLink {
                localDirectory.set(file("src/main/kotlin"))
                remoteUrl.set(new URI("https://example.com/src"))
                remoteLineSuffix.set("#L")
            }

            externalDocumentationLinks {
                url.set(new URI("https://example.com/docs/"))
                packageListUrl.set(new File("/path/to/package-list").toURI().toURL())
            }

            perPackageOption {
                matchingRegex.set(".*api.*")
                suppress.set(false)
                skipDeprecated.set(false)
                reportUndocumented.set(false)
                documentedVisibilities.set([
                        VisibilityModifier.Public,
                        VisibilityModifier.Private,
                        VisibilityModifier.Protected,
                        VisibilityModifier.Internal,
                        VisibilityModifier.Package
                ] as Set)
            }
        }
    }
}
```

</tab>
</tabs>