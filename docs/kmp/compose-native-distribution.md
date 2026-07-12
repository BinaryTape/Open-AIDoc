[//]: # (title: 原生分发)

在这里，您将学习原生分发：如何为所有受支持的系统创建安装程序和软件包，以及如何使用与分发相同的设置在本地运行应用程序。

阅读以下内容以了解以下主题的详细信息：

* [什么是 Compose Multiplatform Gradle 插件](#gradle-plugin)？
* [基本任务详情](#basic-tasks)（例如在本地运行应用程序）以及[高级任务](#minification-and-obfuscation)（如压缩和混淆）。
* [如何包含 JDK 模块](#including-jdk-modules)并处理 `ClassNotFoundException`。
* [如何指定分发属性](#specifying-distribution-properties)：软件包版本、JDK 版本、输出目录、启动器属性和元数据。
* [如何管理资源](#managing-resources)：使用资源库、JVM 资源加载或向打包后的应用程序添加文件。
* [如何自定义源集](#custom-source-sets)：使用 Gradle 源集、Kotlin JVM 目标或手动配置。
* [如何为每个操作系统指定应用程序图标](#application-icon)。
* [特定于平台的选项](#platform-specific-options)，例如 Linux 上的软件包维护者电子邮件和 macOS 上 Apple App Store 的应用类别。
* [特定于 macOS 的配置](#macos-specific-configuration)：签名、公证和 `Info.plist`。

## Gradle 插件

本指南主要侧重于使用 Compose Multiplatform Gradle 插件打包 Compose 应用程序。
`org.jetbrains.compose` 插件提供了用于基本打包、混淆和 macOS 代码签名的任务。

该插件简化了使用 `jpackage` 将应用程序打包成原生分发并在本地运行应用程序的过程。
可分发应用程序是自包含的、可安装的二进制文件，其中包含所有必要的 Java 运行时组件，无需在目标系统上安装 JDK。

为了减小软件包大小，Gradle 插件使用 [jlink](https://openjdk.org/jeps/282) 工具，该工具可确保在可分发软件包中仅捆绑必要的 Java 模块。
但是，您仍然必须配置 Gradle 插件以指定所需的模块。
有关更多信息，请参阅[包含 JDK 模块](#including-jdk-modules)部分。

作为替代方案，您可以使用 [Conveyor](https://www.hydraulic.software)，这是一款非 JetBrains 开发的外部工具。
Conveyor 支持在线更新、跨平台构建和各种其他功能，但对于非开源项目需要[许可证](https://hydraulic.software/pricing.html)。
有关更多信息，请参考 [Conveyor 文档](https://conveyor.hydraulic.dev/latest/tutorial/hare/jvm)。

## 基本任务

Compose Multiplatform Gradle 插件中的基本可配置单元是 `application`（不要与已弃用的 [Gradle application](https://docs.gradle.org/current/userguide/application_plugin.html) 插件混淆）。

`application` DSL 方法为一组最终二进制文件定义了共享配置，这意味着它允许您将一系列文件与 JDK 分发一起打包成各种格式的压缩二进制安装程序。

受支持的操作系统提供以下格式：

* **macOS**：`.dmg` (`TargetFormat.Dmg`)、`.pkg` (`TargetFormat.Pkg`)
* **Windows**：`.exe` (`TargetFormat.Exe`)、`.msi` (`TargetFormat.Msi`)
* **Linux**：`.deb` (`TargetFormat.Deb`)、`.rpm` (`TargetFormat.Rpm`)

以下是具有基本桌面配置的 `build.gradle.kts` 文件示例：

```kotlin
import org.jetbrains.compose.desktop.application.dsl.TargetFormat

plugins {
    kotlin("jvm")
    id("org.jetbrains.compose")
}

dependencies {
    implementation(compose.desktop.currentOs)
}

compose.desktop {
    application {
        mainClass = "example.MainKt"

        nativeDistributions {
            targetFormats(TargetFormat.Dmg, TargetFormat.Msi, TargetFormat.Exe)
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="compose.desktop { application { mainClass = "}

构建项目时，插件会创建以下任务：

<table>
    
<tr>
<td>Gradle 任务</td>
        <td>描述</td>
</tr>

    
<tr>
<td><code>package&lt;FormatName&gt;</code></td> 
        <td>将应用程序打包成相应的 <code>FormatName</code> 二进制文件。目前不支持跨平台编译 (Cross-compilation)，这意味着您只能使用相应的兼容操作系统来构建特定格式。
            例如，要构建 <code>.dmg</code> 二进制文件，必须在 macOS 上运行 <code>packageDmg</code> 任务。
            如果任何任务与当前操作系统不兼容，默认情况下会将其跳过。</td>
</tr>

    
<tr>
<td><code>packageDistributionForCurrentOS</code></td>
        <td>聚合应用程序的所有打包任务。这是一个<a href="https://docs.gradle.org/current/userguide/more_about_tasks.html#sec:task_categories">生命周期任务</a>。</td>
</tr>

    
<tr>
<td><code>packageUberJarForCurrentOS</code></td>
        <td>创建一个包含当前操作系统所有依赖项的单个 jar 文件。
        该任务要求将 <code>compose.desktop.currentOS</code> 用作 <code>compile</code>、<code>implementation</code> 或 <code>runtime</code> 依赖项。</td>
</tr>

    
<tr>
<td><code>run</code></td>
        <td>从 <code>mainClass</code> 中指定的入口点在本地运行应用程序。<code>run</code> 任务启动具有完整运行时的非打包 JVM 应用程序。
        与创建具有精简运行时的紧凑二进制镜像相比，这种方法更快且更容易调试。
        要运行最终的二进制镜像，请改用 <code>runDistributable</code> 任务。</td>
</tr>

    
<tr>
<td><code>createDistributable</code></td>
        <td>创建最终的应用程序镜像而不创建安装程序。</td>
</tr>

    
<tr>
<td><code>runDistributable</code></td>
        <td>运行预打包的应用程序镜像。</td>
</tr>

</table>

所有可用任务都列在 Gradle 工具窗口中。执行任务后，Gradle 会在 `${project.buildDir}/compose/binaries` 目录中生成输出二进制文件。

## 包含 JDK 模块

为了减小可分发文件的大小，Gradle 插件使用 [jlink](https://openjdk.org/jeps/282)，它有助于仅捆绑必要的 JDK 模块。

目前，Gradle 插件不会自动确定必要的 JDK 模块。虽然这不会导致编译问题，但在运行时未能提供必要的模块可能会导致 `ClassNotFoundException`。

如果在运行打包后的应用程序或 `runDistributable` 任务时遇到 `ClassNotFoundException`，您可以使用 `modules` DSL 方法包含额外的 JDK 模块：

```kotlin
compose.desktop {
    application {
        nativeDistributions {
            modules("java.sql")
            // 或者：includeAllModules = true
        }
    }
}
```

您可以手动指定所需的模块，或者运行 `suggestModules`。`suggestModules` 任务使用 [jdeps](https://docs.oracle.com/javase/9/tools/jdeps.htm) 静态分析工具来确定可能缺失的模块。
请注意，该工具的输出可能不完整或列出不必要的模块。

如果可分发文件的大小不是关键因素并且可以忽略，您可以选择通过使用 `includeAllModules` DSL 属性来包含所有运行时模块。

## 指定分发属性

### 软件包版本

原生分发软件包必须具有特定的软件包版本。
要指定软件包版本，您可以使用以下 DSL 属性，按优先级从高到低排列：

* `nativeDistributions.<os>.<packageFormat>PackageVersion` 为单个软件包格式指定版本。
* `nativeDistributions.<os>.packageVersion` 为单个目标操作系统指定版本。
* `nativeDistributions.packageVersion` 为所有软件包指定版本。

在 macOS 上，您还可以使用以下 DSL 属性指定构建版本，同样按优先级从高到低排列：

* `nativeDistributions.macOS.<packageFormat>PackageBuildVersion` 为单个软件包格式指定构建版本。
* `nativeDistributions.macOS.packageBuildVersion` 为所有 macOS 软件包指定构建版本。

如果您不指定构建版本，Gradle 会改用软件包版本。有关 macOS 上版本控制的更多信息，请参阅 [`CFBundleShortVersionString`](https://developer.apple.com/documentation/bundleresources/information_property_list/cfbundleshortversionstring) 和 [`CFBundleVersion`](https://developer.apple.com/documentation/bundleresources/information_property_list/cfbundleversion) 文档。

以下是按优先级顺序指定软件包版本的模板：

```kotlin
compose.desktop {
    application {
        nativeDistributions {
            // 所有软件包的版本
            packageVersion = "..." 
          
            macOS {
              // 所有 macOS 软件包的版本
              packageVersion = "..."
              // 仅限 dmg 软件包的版本
              dmgPackageVersion = "..." 
              // 仅限 pkg 软件包的版本
              pkgPackageVersion = "..." 
              
              // 所有 macOS 软件包的构建版本
              packageBuildVersion = "..."
              // 仅限 dmg 软件包的构建版本
              dmgPackageBuildVersion = "..." 
              // 仅限 pkg 软件包的构建版本
              pkgPackageBuildVersion = "..." 
            }
            windows {
              // 所有 Windows 软件包的版本
              packageVersion = "..."  
              // 仅限 msi 软件包的版本
              msiPackageVersion = "..."
              // 仅限 exe 软件包的版本
              exePackageVersion = "..." 
            }
            linux {
              // 所有 Linux 软件包的版本
              packageVersion = "..."
              // 仅限 deb 软件包的版本
              debPackageVersion = "..."
              // 仅限 rpm 软件包的版本
              rpmPackageVersion = "..."
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="compose.desktop { application { nativeDistributions { packageVersion ="}

定义软件包版本时，请遵循以下规则：

<table>
    
<tr>
<td>文件类型</td>
        <td>版本格式</td>
        <td>详情</td>
</tr>

    
<tr>
<td><code>dmg</code>, <code>pkg</code></td>
        <td><code>MAJOR[.MINOR][.PATCH]</code></td>
        <td>
            <ul>
                <li><code>MAJOR</code> 是非负整数</li>
                <li><code>MINOR</code> 是可选的非负整数</li>
                <li><code>PATCH</code> 是可选的非负整数</li>
            </ul>
        </td>
</tr>

    
<tr>
<td><code>msi</code>, <code>exe</code></td>
        <td><code>MAJOR.MINOR.BUILD</code></td>
        <td>
            <ul>
                <li><code>MAJOR</code> 是最大值为 255 的非负整数</li>
                <li><code>MINOR</code> 是最大值为 255 的非负整数</li>
                <li><code>BUILD</code> 是最大值为 65535 的非负整数</li>
            </ul>
        </td>
</tr>

    
<tr>
<td><code>deb</code></td>
        <td><code>[EPOCH:]UPSTREAM_VERSION[-DEBIAN_REVISION]</code></td>
        <td>
            <ul>
                <li><code>EPOCH</code> 是可选的非负整数</li>
                <li><code>UPSTREAM_VERSION</code>：
                    <ul>
                        <li>只能包含字母数字和 <code>.</code>、<code>+</code>、<code>-</code>、<code>~</code> 字符</li>
                        <li>必须以数字开头</li>
                    </ul>
                </li>
                <li><code>DEBIAN_REVISION</code>：
                    <ul>
                        <li>可选</li>
                        <li>只能包含字母数字和 <code>.</code>、<code>+</code>、<code>~</code> 字符</li>
                    </ul>
                </li>
            </ul>
            有关更多详细信息，请参阅 <a href="https://www.debian.org/doc/debian-policy/ch-controlfields.html#version">Debian 文档</a>。
        </td>
</tr>

    
<tr>
<td><code>rpm</code></td>
        <td>任意格式</td>
        <td>版本不得包含 <code>-</code>（连字符）字符。</td>
</tr>

</table>

### JDK 版本

该插件使用 `jpackage`，这需要不低于 [JDK 17](https://openjdk.java.net/projects/jdk/17/) 的 JDK 版本。
指定 JDK 版本时，请确保至少满足以下要求之一：

* `JAVA_HOME` 环境变量指向兼容的 JDK 版本。
* 通过 DSL 设置 `javaHome` 属性：

  ```kotlin
  compose.desktop {
      application {
          javaHome = System.getenv("JDK_17")
      }
  }
  ```

### 输出目录

要为原生分发使用自定义输出目录，请按如下所示配置 `outputBaseDir` 属性：

```kotlin
compose.desktop {
    application {
        nativeDistributions {
            outputBaseDir.set(project.layout.buildDirectory.dir("customOutputDir"))
        }
    }
}
```

### 启动器属性

要定制应用程序启动过程，您可以自定义以下属性：

<table>
  
<tr>
<td>属性</td>
    <td>描述</td>
</tr>

  
<tr>
<td><code>mainClass</code></td>
    <td>包含 <code>main</code> 方法的类的完全限定名称。</td>
</tr>

  
<tr>
<td><code>args</code></td>
    <td>应用程序 <code>main</code> 方法的参数。</td>
</tr>

  
<tr>
<td><code>jvmArgs</code></td>
    <td>应用程序 JVM 的参数。</td>
</tr>

</table>

以下是一个配置示例：

```kotlin
compose.desktop {
    application {
        mainClass = "MainKt"
        args += listOf("-customArgument")
        jvmArgs += listOf("-Xmx2G")
    }
}
```

### 元数据

在 `nativeDistributions` DSL 块中，您可以配置以下属性：

<table>
  
<tr>
<td>属性</td>
    <td>描述</td>
    <td>默认值</td>
</tr>

  
<tr>
<td><code>packageName</code></td>
    <td>应用程序名称。</td>
    <td>Gradle 项目的<a href="https://docs.gradle.org/current/javadoc/org/gradle/api/Project.html#getName--">名称</a></td>
</tr>

  
<tr>
<td><code>packageVersion</code></td>
    <td>应用程序版本。</td>
    <td>Gradle 项目的<a href="https://docs.gradle.org/current/javadoc/org/gradle/api/Project.html#getVersion--">版本</a></td>
</tr>

  
<tr>
<td><code>description</code></td>
    <td>应用程序描述。</td>
    <td>无</td>
</tr>

  
<tr>
<td><code>copyright</code></td>
    <td>应用程序版权信息。</td>
    <td>无</td>
</tr>

  
<tr>
<td><code>vendor</code></td>
    <td>应用程序厂商。</td>
    <td>无</td>
</tr>

  
<tr>
<td><code>licenseFile</code></td>
    <td>应用程序许可证文件。</td>
    <td>无</td>
</tr>

</table> 

以下是一个配置示例：

```kotlin
compose.desktop {
    application {
        nativeDistributions {
            packageName = "ExampleApp"
            packageVersion = "0.1-SNAPSHOT"
            description = "Compose Multiplatform App"
            copyright = "© 2024 My Name. All rights reserved."
            vendor = "Example vendor"
            licenseFile.set(project.file("LICENSE.txt"))
        }
    }
}
```

## 管理资源

要打包和加载资源，您可以使用 Compose Multiplatform 资源库、JVM 资源加载，或向打包后的应用程序添加文件。

### 资源库

为项目设置资源最直接的方法是使用资源库。
通过资源库，您可以在所有受支持平台的通用代码中访问资源。
详情请参阅[多平台资源](compose-multiplatform-resources.md)。

### JVM 资源加载

用于桌面的 Compose Multiplatform 在 JVM 平台上运行，这意味着您可以使用 `java.lang.Class` API 从 `.jar` 文件加载资源。您可以通过 [`Class::getResource`](https://docs.oracle.com/en/java/javase/15/docs/api/java.base/java/lang/Class.html#getResource(java.lang.String)) 或 [`Class::getResourceAsStream`](https://docs.oracle.com/en/java/javase/15/docs/api/java.base/java/lang/Class.html#getResourceAsStream(java.lang.String)) 访问 `src/main/resources` 目录中的文件。

### 向打包后的应用程序添加文件

在某些情况下，从 `.jar` 文件加载资源可能不太实际，例如，当您拥有特定于目标的资源，并且需要仅在 macOS 软件包中包含文件而在 Windows 软件包中不包含时。

在这种情况下，您可以配置 Gradle 插件在安装目录中包含额外的资源文件。
使用 DSL 指定根资源目录如下：

```kotlin
compose.desktop {
    application {
        mainClass = "MainKt"
        nativeDistributions {
            targetFormats(TargetFormat.Dmg, TargetFormat.Msi, TargetFormat.Deb)
            packageVersion = "1.0.0"

            appResourcesRootDir.set(project.layout.projectDirectory.dir("resources"))
        }
    }
}
```

在上面的示例中，根资源目录被定义为 `<PROJECT_DIR>/resources`。

Gradle 插件将按以下方式包含资源子目录中的文件：

1. **通用资源：**
位于 `<RESOURCES_ROOT_DIR>/common` 中的文件将包含在所有软件包中，无论目标操作系统或架构如何。

2. **特定于操作系统的资源：**
位于 `<RESOURCES_ROOT_DIR>/<OS_NAME>` 中的文件将仅包含在为特定操作系统构建的软件包中。`<OS_NAME>` 的有效值为：`windows`、`macos` 和 `linux`。

3. **特定于操作系统和架构的资源：**
位于 `<RESOURCES_ROOT_DIR>/<OS_NAME>-<ARCH_NAME>` 中的文件将仅包含在为特定操作系统和 CPU 架构组合构建的软件包中。`<ARCH_NAME>` 的有效值为：`x64` 和 `arm64`。
例如，`<RESOURCES_ROOT_DIR>/macos-arm64` 中的文件将仅包含在专为 Apple 芯片 Mac 准备的软件包中。

您可以使用 `compose.application.resources.dir` 系统属性访问包含的资源：

```kotlin
import java.io.File

val resourcesDir = File(System.getProperty("compose.application.resources.dir"))

fun main() {
    println(resourcesDir.resolve("resource.txt").readText())
}
```

## 自定义源集

如果您使用 `org.jetbrains.kotlin.jvm` 或 `org.jetbrains.kotlin.multiplatform` 插件，可以依赖默认配置：

* 使用 `org.jetbrains.kotlin.jvm` 的配置包含来自 `main` [源集](https://docs.gradle.org/current/userguide/java_plugin.html#source_sets)的内容。
* 使用 `org.jetbrains.kotlin.multiplatform` 的配置包含来自单个 [JVM 目标](multiplatform-dsl-reference.md#targets)的内容。
  如果您定义了多个 JVM 目标，则默认配置将被禁用。在这种情况下，您需要手动配置插件，或指定单个目标（见下文）。

如果默认配置含糊不清或不足，您可以通过几种方式自定义它：

使用 Gradle [源集](https://docs.gradle.org/current/userguide/java_plugin.html#source_sets)：

``` kotlin
plugins {
    kotlin("jvm")
    id("org.jetbrains.compose")
}
val customSourceSet = sourceSets.create("customSourceSet")
compose.desktop {
    application {
        from(customSourceSet)
    }
}
``` 

使用 Kotlin [JVM 目标](multiplatform-dsl-reference.md#targets)：

``` kotlin
plugins {
    kotlin("multiplatform")
    id("org.jetbrains.compose")
} 
kotlin {
    jvm("customJvmTarget") {}
}
compose.desktop {
    application {
        from(kotlin.targets["customJvmTarget"])
    }
}
```

手动配置：

* 使用 `disableDefaultConfiguration` 禁用默认设置。
* 使用 `fromFiles` 指定要包含的文件。
* 指定 `mainJar` 文件属性以指向包含主类的 `.jar` 文件。
* 使用 `dependsOn` 向所有插件任务添加任务依赖项。
``` kotlin
compose.desktop {
    application {
        disableDefaultConfiguration()
        fromFiles(project.fileTree("libs/") { include("**/*.jar") })
        mainJar.set(project.file("main.jar"))
        dependsOn("mainJarTask")
    }
}
```

## 应用程序图标

确保您的应用程序图标具有以下特定于操作系统的格式：

* macOS 使用 `.icns`
* Windows 使用 `.ico`
* Linux 使用 `.png`

```kotlin
compose.desktop {
    application {
        nativeDistributions {
            macOS {
                iconFile.set(project.file("icon.icns"))
            }
            windows {
                iconFile.set(project.file("icon.ico"))
            }
            linux {
                iconFile.set(project.file("icon.png"))
            }
        }
    }
}
```

## 特定于平台的选项

可以使用相应的 DSL 块配置特定于平台的设置：

``` kotlin
compose.desktop {
    application {
        nativeDistributions {
            macOS {
                // macOS 的选项
            }
            windows {
                // Windows 的选项
            }
            linux {
                // Linux 的选项
            }
        }
    }
}
```

下表描述了所有受支持的特定于平台的选项。**不建议**使用未记录的属性。

<table>
    
<tr>
<td>平台</td>
        <td>选项</td>
        <td width="500">描述</td>
</tr>

    
<tr>
<td rowspan="3">所有平台</td>
        <td><code>iconFile.set(File("PATH_TO_ICON"))</code></td>
        <td>指定应用程序特定平台图标的路径。有关详情，请参阅<a href="#application-icon">应用程序图标</a>部分。</td>
</tr>

    
<tr>
<td><code>packageVersion = "1.0.0"</code></td>
        <td>设置特定平台的软件包版本。有关详情，请参阅<a href="#package-version">软件包版本</a>部分。</td>
</tr>

    
<tr>
<td><code>installationPath = "PATH_TO_INST_DIR"</code></td>
        <td>指定默认安装目录的绝对或相对路径。
            在 Windows 上，您还可以使用 <code>dirChooser = true</code> 来允许在安装过程中自定义路径。</td>
</tr>

    
<tr>
<td rowspan="8">Linux</td>
        <td><code>packageName = "custom-package-name"</code></td>
        <td>覆盖默认应用程序名称。</td>
</tr>

    
<tr>
<td><code>debMaintainer = "maintainer@example.com"</code></td>
        <td>指定软件包维护者的电子邮件。</td>
</tr>

    
<tr>
<td><code>menuGroup = "my-example-menu-group"</code></td>
        <td>为应用程序定义菜单组。</td>
</tr>

    
<tr>
<td><code>appRelease = "1"</code></td>
        <td>设置 rpm 软件包的发布值或 deb 软件包的修订值。</td>
</tr>

    
<tr>
<td><code>appCategory = "CATEGORY"</code></td>
        <td>为 rpm 软件包分配组值或为 deb 软件包分配节值。</td>
</tr>

    
<tr>
<td><code>rpmLicenseType = "TYPE_OF_LICENSE"</code></td>
        <td>指示 rpm 软件包的许可证类型。</td>
</tr>

    
<tr>
<td><code>debPackageVersion = "DEB_VERSION"</code></td>
        <td>设置 deb 特定的软件包版本。有关详情，请参阅<a href="#package-version">软件包版本</a>部分。</td>
</tr>

    
<tr>
<td><code>rpmPackageVersion = "RPM_VERSION"</code></td>
        <td>设置 rpm 特定的软件包版本。有关详情，请参阅<a href="#package-version">软件包版本</a>部分。</td>
</tr>

    
<tr>
<td rowspan="15">macOS</td>
        <td><code>bundleID</code></td>
        <td>
            指定唯一的应用程序标识符，只能包含字母数字字符 
            (<code>A-Z</code>, <code>a-z</code>, <code>0-9</code>)、连字符 (<code>-</code>) 和 
            句点 (<code>.</code>)。建议使用反向 DNS 表示法 (<code>com.mycompany.myapp</code>)。
        </td>
</tr>

    
<tr>
<td><code>packageName</code></td>
        <td>应用程序的名称。</td>
</tr>

    
<tr>
<td><code>dockName</code></td>
        <td>
            在菜单栏、“关于 &lt;App&gt;”菜单项和程序坞中显示的应用程序名称。默认值为 <code>packageName</code>。
        </td>
</tr>

    
<tr>
<td><code>minimumSystemVersion</code></td>
        <td>
            运行应用程序所需的最低 macOS 版本。有关详情，请参阅
            <a href="https://developer.apple.com/documentation/bundleresources/information_property_list/lsminimumsystemversion">
                <code>LSMinimumSystemVersion</code></a>。
        </td>
</tr>

    
<tr>
<td><code>signing</code>, <code>notarization</code>, <code>provisioningProfile</code>, <code>runtimeProvisioningProfile</code></td>
        <td>
            请参阅
            <a href="https://github.com/JetBrains/compose-multiplatform/tree/master/tutorials/Signing_and_notarization_on_macOS">
               为 macOS 签名和公证分发版</a>教程。
        </td>
</tr>

    
<tr>
<td><code>appStore = true</code></td>
        <td>指定是否为 Apple App Store 构建并签名应用程序。需要至少 JDK 17。</td>
</tr>

    
<tr>
<td><code>appCategory</code></td>
        <td>
            Apple App Store 的应用类别。为 App Store 构建时，默认值为 
            <code>public.app-category.utilities</code>，否则为 <code>Unknown</code>。
            有关有效类别的列表，请参阅 
            <a href="https://developer.apple.com/documentation/bundleresources/information_property_list/lsapplicationcategorytype">
                <code>LSApplicationCategoryType</code>
            </a>。
        </td>
</tr>

    
<tr>
<td><code>entitlementsFile.set(File("PATH_ENT"))</code></td>
        <td>
            指定包含签名时使用的权利文件的路径。当您提供自定义文件时，请务必添加 Java 应用程序所需的权利。
            有关为 App Store 构建时使用的默认文件，请参阅 <a href="https://github.com/openjdk/jdk/blob/master/src/jdk.jpackage/macosx/classes/jdk/jpackage/internal/resources/sandbox.plist">sandbox.plist</a>。
            请注意，此默认文件可能会根据您的 JDK 版本而有所不同。如果未指定文件，插件将使用 <code>jpackage</code> 提供的默认权利。
            有关详情，请参阅 <a href="https://github.com/JetBrains/compose-multiplatform/tree/master/tutorials/Signing_and_notarization_on_macOS">为 macOS 签名和公证分发版</a>教程。
        </td>
</tr>

    
<tr>
<td><code>runtimeEntitlementsFile.set(File("PATH_R_ENT"))</code></td>
        <td>
            指定包含签名 JVM 运行时所使用的权利文件的路径。当您提供自定义文件时，请务必添加 Java 应用程序所需的权利。
            有关为 App Store 构建时使用的默认文件，请参阅 <a href="https://github.com/openjdk/jdk/blob/master/src/jdk.jpackage/macosx/classes/jdk/jpackage/internal/resources/sandbox.plist">sandbox.plist</a>。
            请注意，此默认文件可能会根据您的 JDK 版本而有所不同。如果未指定文件，插件将使用 <code>jpackage</code> 提供的默认权利。
            有关详情，请参阅 <a href="https://github.com/JetBrains/compose-multiplatform/tree/master/tutorials/Signing_and_notarization_on_macOS">为 macOS 签名和公证分发版</a>教程。
        </td>
</tr>

    
<tr>
<td><code>dmgPackageVersion = "DMG_VERSION"</code></td>
        <td>
            设置 DMG 特定的软件包版本。有关详情，请参阅<a href="#package-version">软件包版本</a>部分。
        </td>
</tr>

    
<tr>
<td><code>pkgPackageVersion = "PKG_VERSION"</code></td>
        <td>
            设置 PKG 特定的软件包版本。有关详情，请参阅<a href="#package-version">软件包版本</a>部分。
        </td>
</tr>

    
<tr>
<td><code>packageBuildVersion = "DMG_VERSION"</code></td>
        <td>
            设置软件包构建版本。有关详情，请参阅<a href="#package-version">软件包版本</a>部分。
        </td>
</tr>

    
<tr>
<td><code>dmgPackageBuildVersion = "DMG_VERSION"</code></td>
        <td>
            设置 DMG 特定的软件包构建版本。有关详情，请参阅<a href="#package-version">软件包版本</a>部分。
        </td>
</tr>

    
<tr>
<td><code>pkgPackageBuildVersion = "PKG_VERSION"</code></td>
        <td>
            设置 PKG 特定的软件包构建版本。有关详情，请参阅<a href="#package-version">软件包版本</a>部分。
        </td>
</tr>

    
<tr>
<td><code>infoPlist</code></td>
        <td>请参阅 <a href="#information-property-list-on-macos">macOS 上的 <code>Info.plist</code></a> 部分。</td>
</tr>

        
<tr>
<td rowspan="7">Windows</td>
            <td><code>console = true</code></td>
            <td>为应用程序添加控制台启动器。</td>
</tr>

        
<tr>
<td><code>dirChooser = true</code></td>
            <td>允许在安装过程中自定义安装路径。</td>
</tr>

        
<tr>
<td><code>perUserInstall = true</code></td>
            <td>允许按用户安装应用程序。</td>
</tr>

        
<tr>
<td><code>menuGroup = "start-menu-group"</code></td>
            <td>将应用程序添加到指定的“开始”菜单组。</td>
</tr>

        
<tr>
<td><code>upgradeUuid = "UUID"</code></td>
            <td>指定一个唯一 ID，当存在比已安装版本更新的版本时，允许用户通过安装程序更新应用程序。
            对于单个应用程序，该值必须保持不变。有关详情，请参阅 <a href="https://wixtoolset.org/documentation/manual/v3/howtos/general/generate_guids.html">如何生成 GUID</a>。</td>
</tr>

        
<tr>
<td><code>msiPackageVersion = "MSI_VERSION"</code></td>
            <td>设置 MSI 特定的软件包版本。有关详情，请参阅<a href="#package-version">软件包版本</a>部分。</td>
</tr>

        
<tr>
<td><code>exePackageVersion = "EXE_VERSION"</code></td>
            <td>设置 EXE 特定的软件包版本。有关详情，请参阅<a href="#package-version">软件包版本</a>部分。</td>
</tr>

</table>

## macOS 特定的配置

### macOS 上的签名和公证

现代 macOS 版本不允许用户执行从互联网下载的未经签名的应用程序。如果您尝试运行此类应用程序，您将遇到以下错误：“YourApp 已损坏，无法打开。您应该弹出磁盘镜像”。

要了解如何为您的应用程序签名和公证，请参阅我们的[教程](https://github.com/JetBrains/compose-multiplatform/blob/master/tutorials/Signing_and_notarization_on_macOS/README.md)。

### macOS 上的信息属性列表

虽然 DSL 支持基本的特定于平台的自定义，但仍可能存在超出所提供功能的情况。
如果您需要指定 DSL 中未体现的 `Info.plist` 值，您可以包含一段原始 XML 作为权宜之计。此 XML 将被附加到应用程序的 `Info.plist` 中。

#### 示例：深度链接

1. 在 `build.gradle.kts` 文件中定义自定义 URL 方案：

  ``` kotlin
  compose.desktop {
      application {
          mainClass = "MainKt"
          nativeDistributions {
              targetFormats(TargetFormat.Dmg)
              packageName = "Deep Linking Example App"
              macOS {
                  bundleID = "org.jetbrains.compose.examples.deeplinking"
                  infoPlist {
                      extraKeysRawXml = macExtraPlistKeys
                  }
              }
          }
      }
  }
  
  val macExtraPlistKeys: String
      get() = """
        <key>CFBundleURLTypes</key>
        <array>
          <dict>
            <key>CFBundleURLName</key>
            <string>Example deep link</string>
            <key>CFBundleURLSchemes</key>
            <array>
              <string>compose</string>
            </array>
          </dict>
        </array>
      """
  ```
  {initial-collapse-state="collapsed" collapsible="true" collapsed-title="infoPlist { extraKeysRawXml = macExtraPlistKeys"}

2. 使用 `java.awt.Desktop` 类在 `src/main/main.kt` 文件中设置 URI 处理程序：

  ``` kotlin 
  import androidx.compose.material.MaterialTheme
  import androidx.compose.material.Text
  import androidx.compose.runtime.getValue
  import androidx.compose.runtime.mutableStateOf
  import androidx.compose.runtime.setValue
  import androidx.compose.ui.window.singleWindowApplication
  import java.awt.Desktop
  
  fun main() {
      var text by mutableStateOf("Hello, World!")
  
      try {
          Desktop.getDesktop().setOpenURIHandler { event ->
              text = "Open URI: " + event.uri
          }
      } catch (e: UnsupportedOperationException) {
          println("setOpenURIHandler is unsupported")
      }
  
      singleWindowApplication {
          MaterialTheme {
              Text(text)
          }
      }
  }
  ```
  {initial-collapse-state="collapsed" collapsible="true" collapsed-title="Desktop.getDesktop().setOpenURIHandler { event ->"}

3. 执行 `runDistributable` 任务：`./gradlew runDistributable`。

结果，像 `compose://foo/bar` 这样的链接现在可以从浏览器重定向到您的应用程序。

## 压缩与混淆

Compose Multiplatform Gradle 插件包含对 [ProGuard](https://www.guardsquare.com/proguard) 的内置支持。
ProGuard 是一款用于代码压缩和混淆的[开源工具](https://github.com/Guardsquare/proguard)。

对于每个*默认*打包任务（不含 ProGuard），Gradle 插件都提供了一个对应的 *release* 任务（包含 ProGuard）：

<table>
  
<tr>
<td width="400">Gradle 任务</td>
    <td>描述</td>
</tr>

  
<tr>
<td>
        <p>默认：<code>createDistributable</code></p>
        <p>Release：<code>createReleaseDistributable</code></p>
    </td>
    <td>创建包含捆绑 JDK 和资源的应用程序镜像。</td>
</tr>

  
<tr>
<td>
        <p>默认：<code>runDistributable</code></p>
        <p>Release：<code>runReleaseDistributable</code></p>
    </td>
    <td>运行包含捆绑 JDK 和资源的应用程序镜像。</td>
</tr>

  
<tr>
<td>
        <p>默认：<code>run</code></p>
        <p>Release：<code>runRelease</code></p>
    </td>
    <td>使用 Gradle JDK 运行非打包的应用程序 <code>.jar</code>。</td>
</tr>

  
<tr>
<td>
        <p>默认：<code>package&lt;FORMAT_NAME&gt;</code></p>
        <p>Release：<code>packageRelease&lt;FORMAT_NAME&gt;</code></p>
    </td>
    <td>将应用程序镜像打包成 <code>&lt;FORMAT_NAME&gt;</code> 文件。</td>
</tr>

  
<tr>
<td>
        <p>默认：<code>packageDistributionForCurrentOS</code></p>
        <p>Release：<code>packageReleaseDistributionForCurrentOS</code></p>
    </td>
    <td>将应用程序镜像打包成与当前操作系统兼容的格式。</td>
</tr>

  
<tr>
<td>
        <p>默认：<code>packageUberJarForCurrentOS</code></p>
        <p>Release：<code>packageReleaseUberJarForCurrentOS</code></p>
    </td>
    <td>将应用程序镜像打包成一个 uber (fat) `.jar`。</td>
</tr>

  
<tr>
<td>
        <p>默认：<code>notarize&lt;FORMAT_NAME&gt;</code></p>
        <p>Release：<code>notarizeRelease&lt;FORMAT_NAME&gt;</code></p>
    </td>
    <td>上传 <code>&lt;FORMAT_NAME&gt;</code> 应用程序镜像以进行公证（仅限 macOS）。</td>
</tr>

  
<tr>
<td>
        <p>默认：<code>checkNotarizationStatus</code></p>
        <p>Release：<code>checkReleaseNotarizationStatus</code></p>
    </td>
    <td>检查公证是否成功（仅限 macOS）。</td>
</tr>

</table>

默认配置启用了一些预定义的 ProGuard 规则：

* 应用程序镜像已被压缩，这意味着未使用的类已被移除。
* `compose.desktop.application.mainClass` 被用作入口点。
* 包含了几条 `keep` 规则，以确保 Compose 运行时保持正常功能。

在大多数情况下，您不需要任何额外配置即可获得压缩后的应用程序。
但是，ProGuard 可能无法跟踪字节码中的某些用法，例如，当通过反射使用类时。
如果您遇到仅在 ProGuard 处理后出现的问题，您可能需要添加自定义规则。

您可以使用 Gradle DSL 在 `buildTypes.release.proguard` 块中配置 ProGuard，选项如下：

* `configurationFiles` 指定自定义 ProGuard 配置文件。
    ```kotlin
    compose.desktop {
        application {
            buildTypes.release.proguard {
                configurationFiles.from(project.file("compose-desktop.pro"))
            }
        }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title='configurationFiles.from(project.file("compose-desktop.pro"))'}

* `obfuscate` 启用代码混淆。混淆默认是禁用的。
    ```kotlin
    compose.desktop {
        application {
            buildTypes.release.proguard {
                obfuscate.set(true)
            }
        }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="obfuscate.set(true)"}

* `optimize` 控制 ProGuard 优化。优化默认是启用的。
    ```kotlin
    compose.desktop {
        application {
            buildTypes.release.proguard {
                optimize.set(false)
            }
        }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="optimize.set(false)"}

* `joinOutputJars` 生成单个 uber-JAR。默认情况下，ProGuard 会为每个输入 `.jar` 生成对应的 `.jar` 文件。
    ```kotlin
    compose.desktop {
        application {
            buildTypes.release.proguard {
                joinOutputJars.set(true)
            }
        }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="joinOutputJars.set(true)"}

[//]: # (TODO update version for stable release)

* `version` 设置特定的 ProGuard 版本。JDK 25 至少需要 ProGuard 7.8.0，这是从 Compose Multiplatform 1.12.0-beta01 开始的默认版本。如果您使用较早版本的 Compose Multiplatform 并且使用 JDK 25 进行构建，请将此属性显式设置为 `7.8.0`：
    ```kotlin
    compose.desktop {
        application {
            buildTypes.release.proguard {
                version.set("7.8.0")
            }
        }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title='version.set("7.8.0")'}

有关 ProGuard 规则和配置选项的完整列表，请参阅 Guardsquare 的 [ProGuard 手册](https://www.guardsquare.com/manual/configuration/usage)。

## 下一步

探索关于[桌面组件](https://github.com/JetBrains/compose-multiplatform/tree/master/tutorials#desktop)的教程。