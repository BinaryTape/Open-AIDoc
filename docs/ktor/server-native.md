[//]: # (title: Native 服务器)

<tldr>
<var name="example_name" value="embedded-server-native"/>
<p>
    <b>代码示例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
Ktor 支持 Kotlin/Native，允许您在无需额外运行时或虚拟机的情况下运行服务器。
</link-summary>

Ktor 支持 [Kotlin/Native](https://kotlinlang.org/docs/native-overview.html)，允许您在无需额外运行时或虚拟机的情况下运行服务器。目前，在 Kotlin/Native 下运行 Ktor 服务器具有以下限制：
* [服务器应当使用](server-create-and-configure.topic) `embeddedServer` 创建
* 仅支持 [CIO 引擎](server-engines.md)
* 不支持在没有反向代理的情况下使用 [HTTPS](server-ssl.md)

> 在 Kotlin/Native 项目中使用 Ktor 需要[新内存管理器](https://kotlinlang.org/docs/native-memory-manager.html)，该管理器自 Kotlin 1.7.20 起默认启用。
>
{id="newmm-note" style="note"}

## 添加依赖项 {id="add-dependencies"}

Kotlin/Native 项目中的 Ktor 服务器至少需要两个依赖项：
* `ktor-server-core`（核心依赖项）
* `ktor-server-cio`（CIO 引擎）

以下代码段展示了如何在 <Path>build.gradle.kts</Path> 文件中为 `nativeMain` 源集添加依赖项：

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

要[测试](server-testing.md) Native 服务器，请将 `ktor-server-test-host` 工件添加到 `nativeTest` 源集中：

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

## 配置 Native 目标 {id="native-target"}

指定所需的 Native 目标并使用 `binaries` 属性[声明原生二进制文件](https://kotlinlang.org/docs/mpp-build-native-binaries.html)：

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
        // 其他受支持的目标列在此处：https://ktor.io/docs/server-native.html#targets
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

> 有关完整示例，请参阅 [embedded-server-native](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server-native)。
>
{style="tip"}

## 后续步骤 {id="create-server"}

配置好 Gradle 构建脚本后，您可以继续[创建 Ktor 服务器](server-create-and-configure.topic)。