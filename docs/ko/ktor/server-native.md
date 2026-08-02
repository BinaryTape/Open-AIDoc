[//]: # (title: Native 서버)

<tldr>
<var name="example_name" value="embedded-server-native"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
Ktor는 Kotlin/Native를 지원하며, 추가적인 런타임이나 가상 머신 없이 서버를 실행할 수 있게 해줍니다.
</link-summary>

Ktor는 [Kotlin/Native](https://kotlinlang.org/docs/native-overview.html)를 지원하며, 추가적인 런타임이나 가상 머신 없이 서버를 실행할 수 있게 해줍니다. 현재 Kotlin/Native에서 Ktor 서버를 실행하는 데는 다음과 같은 제한 사항이 있습니다:
* [서버는 `embeddedServer`를 사용하여 생성](server-create-and-configure.topic)해야 합니다.
* [CIO 엔진](server-engines.md)만 지원됩니다.
* 역방향 프록시(reverse proxy)가 없는 [HTTPS](server-ssl.md)는 지원되지 않습니다.

undefined

## 의존성 추가하기 {id="add-dependencies"}

Kotlin/Native 프로젝트에서 Ktor 서버를 사용하려면 최소 두 개의 의존성이 필요합니다:
* `ktor-server-core` (핵심 의존성)
* `ktor-server-cio` (CIO 엔진)

아래 코드 스니펫은 <Path>build.gradle.kts</Path> 파일의 `nativeMain` 소스 세트에 의존성을 추가하는 방법을 보여줍니다:

```kotlin
kotlin {
    sourceSets {
        nativeMain.dependencies {
            implementation("io.ktor:ktor-server-core:$ktor_version")
            implementation("io.ktor:ktor-server-cio:$ktor_version")
        }
    }
}
```

Native 서버를 [테스트](server-testing.md)하려면, `nativeTest` 소스 세트에 `ktor-server-test-host` 아티팩트를 추가하세요:

```kotlin
kotlin {
    sourceSets {
        nativeTest.dependencies {
            implementation(kotlin("test"))
            implementation("io.ktor:ktor-server-test-host:$ktor_version")
        }
    }
}
```

## 네이티브 타겟 구성하기 {id="native-target"}

필요한 네이티브 타겟을 지정하고 `binaries` 속성을 사용하여 [네이티브 바이너리를 선언](https://kotlinlang.org/docs/mpp-build-native-binaries.html)합니다:

```kotlin
kotlin {
    val hostOs = System.getProperty("os.name")
    val arch = System.getProperty("os.arch")
    val nativeTarget = when {
        hostOs == "Mac OS X" && arch == "x86_64" -> macosX64("native")
        hostOs == "Mac OS X" && arch == "aarch64" -> macosArm64("native")
        hostOs == "Linux" && (arch == "x86_64" || arch == "amd64") -> linuxX64("native")
        hostOs == "Linux" && arch == "aarch64" -> linuxArm64("native")
        hostOs.startsWith("Windows") -> mingwX64("native")
        // 기타 지원되는 타겟 목록: https://ktor.io/docs/server-native.html#targets
        else -> throw GradleException("Host OS is not supported in Kotlin/Native.")
    }

    nativeTarget.apply {
        binaries {
            executable {
                entryPoint = "main"
            }
        }
    }
}
```

> 전체 예제는 여기에서 확인할 수 있습니다: [embedded-server-native](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server-native).
>
{style="tip"}

## 서버 생성하기 {id="create-server"}

Gradle 빌드 스크립트를 구성한 후, 계속해서 [Ktor 서버를 생성](server-create-and-configure.topic)할 수 있습니다.