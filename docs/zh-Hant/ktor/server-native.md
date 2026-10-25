[//]: # (title: Native 伺服器)

<tldr>
<var name="example_name" value="embedded-server-native"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
Ktor 支援 Kotlin/Native，並允許您在無需額外執行環境或虛擬機的情況下執行伺服器。
</link-summary>

Ktor 支援 [Kotlin/Native](https://kotlinlang.org/docs/native-overview.html)，並允許您在無需額外執行環境或虛擬機的情況下執行伺服器。目前，在 Kotlin/Native 下執行 Ktor 伺服器具備以下限制：
* [伺服器應使用](server-create-and-configure.topic) `embeddedServer` 建立
* 僅支援 [CIO 引擎](server-engines.md)
* 不支援未搭配反向代理的 [HTTPS](server-ssl.md)

> 在 Kotlin/Native 專案中使用 Ktor 需要
> [新的記憶體管理器](https://kotlinlang.org/docs/native-memory-manager.html)，該管理器從 Kotlin 1.7.20 開始預設啟用。
>
{id="newmm-note" style="note"}

## 新增相依性 {id="add-dependencies"}

在 Kotlin/Native 專案中的 Ktor 伺服器至少需要兩個相依性：
* `ktor-server-core`（核心相依性）
* `ktor-server-cio`（CIO 引擎）

以下程式碼片段展示了如何在 <Path>build.gradle.kts</Path> 檔案中將相依性新增至 `nativeMain` 原始碼集：

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

若要[測試](server-testing.md) Native 伺服器，請將 `ktor-server-test-host` 構件新增至 `nativeTest` 原始碼集：

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

## 設定原生目標 {id="native-target"}

指定所需的原生目標，並使用 `binaries` 屬性[宣告原生二進制檔](https://kotlinlang.org/docs/mpp-build-native-binaries.html)：

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
        // Other supported targets are listed here: https://ktor.io/docs/server-native.html#targets
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

> 如需完整範例，請參閱 [embedded-server-native](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server-native)。
>
{style="tip"}

## 後續步驟 {id="create-server"}

設定好 Gradle 建置指令碼後，您可以繼續[建立 Ktor 伺服器](server-create-and-configure.topic)。