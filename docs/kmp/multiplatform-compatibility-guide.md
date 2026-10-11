[//]: # (title: Kotlin Multiplatform 兼容性指南)

<show-structure depth="1"/>

本指南总结了使用 Kotlin Multiplatform 开发项目时可能会遇到的[不兼容变更](https://kotlinlang.org/docs/kotlin-evolution-principles.html#incompatible-changes)。

> 有关 Compose Multiplatform 的信息，
> 请参阅 [Compose Multiplatform 最新变化](https://kotlinlang.org/docs/multiplatform/whats-new-compose.html)
> 以及 [Kotlin 与 Jetpack 兼容性](compose-compatibility-and-versioning.md)页面。
> 
{style="note"}

当前 Kotlin 稳定版为 %kotlinVersion%。请结合项目中使用的 Kotlin 版本，留意特定变更的弃用周期，例如：

* 从 Kotlin 1.7.0 升级到 Kotlin 1.9.0 时，请检查在 [Kotlin 1.9.0](#kotlin-1-9-0-1-9-25) 和 [Kotlin 1.7.0−1.8.22](#kotlin-1-7-0-1-8-22) 中生效的不兼容变更。
* 从 Kotlin 1.9.0 升级到 Kotlin 2.0.0 时，请检查在 [Kotlin 2.0.0](#kotlin-2-0-0-and-later) 和 [Kotlin 1.9.0−1.9.25](#kotlin-1-9-0-1-9-25) 中生效的不兼容变更。 

## 版本兼容性 {id="version-compatibility"}

配置项目时，请检查特定版本的 Kotlin Multiplatform Gradle 插件（与项目中的 Kotlin 版本相同）与 Gradle、Xcode 和 Android Gradle 插件版本的兼容性：

| Kotlin Multiplatform 插件版本 | Gradle                                | Android Gradle 插件                               | Xcode   |
|-------------------------------------|---------------------------------------|-----------------------------------------------------|---------|
| 2.4.20–2.4.21                              | %minGradleVersion%–%maxGradleVersion% | %minAndroidGradleVersion%–%maxAndroidGradleVersion% | %xcode% |
| 2.4.0–2.4.10                        | 7.6.3–9.5.0                           | 8.5.2–9.1.0                                         | 26.4    |
| 2.3.20–2.3.21                       | 7.6.3–9.3.0                           | 8.2.2–9.0.0                                         | 26.0    |
| 2.3.10                              | 7.6.3–9.0.0                           | 8.2.2–9.0.0                                         | 26.0    |
| 2.3.0                               | 7.6.3–9.0.0                           | 8.2.2–8.13.0                                        | 26.0    |
| 2.2.21                              | 7.6.3–8.14                            | 7.3.1–8.11.1                                        | 26.0    |
| 2.2.20                              | 7.6.3–8.14                            | 7.3.1–8.11.1                                        | 16.4    |
| 2.2.0–2.2.10                        | 7.6.3–8.14                            | 7.3.1–8.10.0                                        | 16.3    |
| 2.1.21                              | 7.6.3–8.12.1                          | 7.3.1–8.7.2                                         | 16.3    |
| 2.1.20                              | 7.6.3–8.11                            | 7.4.2–8.7.2                                         | 16.0    |
| 2.1.0–2.1.10                        | 7.6.3–8.10*                           | 7.4.2–8.7.2                                         | 16.0    |
| 2.0.21                              | 7.5–8.8*                              | 7.4.2–8.5                                           | 16.0    |
| 2.0.20                              | 7.5–8.8*                              | 7.4.2–8.5                                           | 15.3    |
| 2.0.0                               | 7.5–8.5                               | 7.4.2–8.3                                           | 15.3    |
| 1.9.20                              | 7.5–8.1.1                             | 7.4.2–8.2                                           | 15.0    |

> *Kotlin 2.0.20–2.0.21 和 Kotlin 2.1.0–2.1.10 完全兼容最高至 8.6 的 Gradle 版本。
> Gradle 8.7–8.10 版本也受支持，仅有一个例外：如果您使用 Kotlin Multiplatform Gradle 插件，
> 可能会在 JVM 目标中调用 `withJava()` 函数的多平台项目中看到弃用警告。
> 欲了解更多信息，请参阅[默认创建的 Java 源集](#java-source-sets-created-by-default)。
>
{style="warning"}

## Kotlin 2.0.0 及更高版本 {id="kotlin-2-0-0-and-later"}

本节涵盖弃用周期结束并在 Kotlin 2.0.0−%kotlinVersion% 中生效的不兼容变更。

<a id="android-target-rename"></a>
### 迁移至 Google 的 Android 目标插件 {id="migrate-to-google-s-plugin-for-android-targets"}

**有哪些变更？**

在 Kotlin 2.3.0 之前，我们通过 `com.android.application` 和 `com.android.library` 插件提供对 Android 目标的支持。
这是在 Google 的 Android 团队针对 Kotlin Multiplatform 开发专用插件期间的临时解决方案。

最初，我们使用 `android` 代码块，但后来过渡到了 `androidTarget` 代码块，以便为新插件保留 `android` 这一名称。

现在，Android 团队已经推出了 [`com.android.kotlin.multiplatform.library` 插件](https://developer.android.com/kotlin/multiplatform/plugin)，您可以将其与最初的 `android` 代码块搭配使用。

Kotlin 2.3.0 在多平台项目中使用 `androidTarget` 名称时引入了弃用警告。如果您需要更多时间迁移到 `android` 代码块，请使用带有 AGP 8.x 的 Kotlin 2.3.10，在该版本中不会出现此警告。

**现在的最佳做法是什么？**

迁移到新的 `com.android.kotlin.multiplatform.library` 插件。将所有出现的 `androidTarget` 代码块重命名为 `android`。
有关如何迁移的详细说明，请参阅 Google 的[迁移指南](https://developer.android.com/kotlin/multiplatform/plugin#migrate)。

**变更何时生效？**

以下是 Kotlin Multiplatform Gradle 插件的弃用周期：

* 1.9.0：在多平台项目中使用 `android` 名称时引入弃用警告
* 2.1.0：将此警告提升为错误
* 2.2.0：从 Kotlin Multiplatform Gradle 插件中移除 `android` 目标 DSL
* 2.3.0：新的 Android 插件可用；在多平台项目中使用 `androidTarget` 名称时引入弃用警告。
* 2.3.10：撤销在多平台项目中使用 `androidTarget` 名称时的弃用警告。

### 弃用 Bitcode 嵌入 {id="deprecated-bitcode-embedding"}

**有哪些变更？**

Xcode 14 弃用了 Bitcode 嵌入，Xcode 15 则针对所有 Apple 目标完全移除了该功能。相应地，用于框架配置的 `embedBitcode` 形参，以及命令行实参 `-Xembed-bitcode` 和 `-Xembed-bitcode-marker` 在 Kotlin 中已被弃用。

**现在的最佳做法是什么？**

如果您仍在使用早期版本的 Xcode，但希望升级到 Kotlin 2.0.20 或更高版本，请在 Xcode 项目中禁用 Bitcode 嵌入。

**变更何时生效？**

以下是计划的弃用周期：

* 2.0.20：Kotlin/Native 编译器不再支持 Bitcode 嵌入
* 2.1.0：Kotlin Multiplatform Gradle 插件中的 `embedBitcode` DSL 被弃用并显示警告
* 2.2.0：警告提升为错误
* 2.3.0：移除 `embedBitcode` DSL 

<a id="java-source-set-created-by-default"></a>
### 默认创建 Java 源集 {id="java-source-sets-created-by-default"}

**有哪些变更？**

为了使 Kotlin Multiplatform 与 Gradle 即将推出的变更保持一致，我们正在逐步淘汰 `withJava()` 函数。`withJava()` 函数曾通过创建必需的 Java 源集来实现与 Gradle Java 插件的集成。从 Kotlin 2.1.20 开始，这些 Java 源集将默认创建。

**现在的最佳做法是什么？**

此前，您必须显式使用 `withJava()` 函数来创建 `src/jvmMain/java` 和 `src/jvmTest/java` 源集：

```kotlin
kotlin {
    jvm {
        withJava()
    }
}
``` 

从 Kotlin 2.1.20 开始，您可以从构建脚本中移除 `withJava()` 函数。

此外，Gradle 现在仅在存在 Java 源文件时才运行 Java 编译任务，这会触发此前未运行过的 JVM 验证诊断。如果您在 `KotlinJvmCompile` 任务中或在 `compilerOptions` 内部显式配置了不兼容的 JVM 目标，该诊断将报错失败。有关确保 JVM 目标兼容性的指导，请参阅[检查相关编译任务的 JVM 目标兼容性](https://kotlinlang.org/docs/gradle-configure-project.html#check-for-jvm-target-compatibility-of-related-compile-tasks)。

如果您的项目使用高于 8.7 的 Gradle 版本，且不依赖 Gradle Java 插件（例如 [Java](https://docs.gradle.org/current/userguide/java_plugin.html)、[Java Library](https://docs.gradle.org/current/userguide/java_library_plugin.html) 或 [Application](https://docs.gradle.org/current/userguide/application_plugin.html)），也不依赖于对 Gradle Java 插件存在依赖项的第三方 Gradle 插件，则可以移除 `withJava()` 函数。

如果您的项目使用了 [Application](https://docs.gradle.org/current/userguide/application_plugin.html) Gradle Java 插件，我们建议迁移到[新的实验性功能 DSL](https://kotlinlang.org/docs/whatsnew2120.html#kotlin-multiplatform-new-dsl-to-replace-gradle-s-application-plugin)。从 Gradle 8.7 开始，Application 插件将不再适用于 Kotlin Multiplatform Gradle 插件。

如果您想在多平台项目中同时使用 Kotlin Multiplatform Gradle 插件和其他用于 Java 的 Gradle 插件，请参阅[弃用与 Kotlin Multiplatform Gradle 插件和 Java 插件的兼容性](multiplatform-compatibility-guide.md#deprecated-compatibility-with-kotlin-multiplatform-gradle-plugin-and-gradle-java-plugins)。

如果您在高于 8.7 的 Gradle 版本中将 [Java 测试夹具 (Java test fixtures)](https://docs.gradle.org/current/userguide/java_testing.html#sec:java_test_fixtures) Gradle 插件与 Kotlin 2.1.20 一起使用，该插件将无法正常工作。请改为升级到已解决此问题的 [Kotlin 2.1.21](https://kotlinlang.org/docs/releases.html#release-details)。

如果您遇到任何问题，请在我们的[问题跟踪器](https://kotl.in/issue)中报告，或在我们的[公开 Slack 频道](https://kotlinlang.slack.com/archives/C19FD9681)中寻求帮助。

**变更何时生效？**

以下是计划的弃用周期：

* Gradle >8.6：在使用 `withJava()` 函数的多平台项目中，针对任何较早版本的 Kotlin 引入弃用警告。
* Gradle 9.0：将此警告提升为错误。
* 2.1.20：在任何版本的 Gradle 中使用 `withJava()` 函数时引入弃用警告。

<a id="declaring-multiple-targets"></a>
### 声明多个相似目标 {id="declaring-several-similar-targets"}

**有哪些变更？**

我们不建议在单个 Gradle 项目中声明多个相似目标。例如：

```kotlin
kotlin {
    jvm("jvmKtor")
    jvm("jvmOkHttp") // 不推荐，会产生弃用警告
}
```

一个常见的用例是将两段相关的代码放在一起。例如，您可能希望在 `:shared` Gradle 项目中同时使用 `jvm("jvmKtor")` 和 `jvm("jvmOkHttp")`，以便分别使用 Ktor 或 OkHttp 库实现网络功能：

```kotlin
// shared/build.gradle.kts:
kotlin {
    jvm("jvmKtor") {
        attributes.attribute(/* ... */)
    }
    jvm("jvmOkHttp") {
        attributes.attribute(/* ... */)
    }

    sourceSets {
        val commonMain by getting
        val commonJvmMain by sourceSets.creating {
            dependsOn(commonMain)
            dependencies {
                // 共享依赖项
            }
        }
        val jvmKtorMain by getting {
            dependsOn(commonJvmMain)
            dependencies {
                // Ktor 依赖项
            }
        }
        val jvmOkHttpMain by getting {
            dependsOn(commonJvmMain)
            dependencies {
                // OkHttp 依赖项
            }
        }
    }
}
```

这种实现方式带来了相当复杂的配置：

* 您必须在 `:shared` 端和每个使用者端都设置 Gradle 属性。否则，Gradle 将无法在此类项目中解析依赖项，因为在没有额外信息的情况下，无法确定使用者应接收基于 Ktor 还是基于 OkHttp 的实现。
* 您必须手动设置 `commonJvmMain` 源集。
* 该配置涉及大量底层的 Gradle 和 Kotlin Gradle 插件抽象与 API。

**现在的最佳做法是什么？**

配置之所以复杂，是因为基于 Ktor 和基于 OkHttp 的实现位于*同一个 Gradle 项目中*。在许多情况下，可以将这些部分提取到独立的 Gradle 项目中。此类重构的大致步骤如下：

1. 将原项目中的两个重复目标替换为单个目标。如果这些目标之间存在共享源集，请将其源代码和配置移至新创建目标的默认源集中：

    ```kotlin
    // shared/build.gradle.kts:
    kotlin {
        jvm()
        
        sourceSets {
            jvmMain {
                // 将 jvmCommonMain 的配置复制到此处
            }
        }
    }
    ```

2. 添加两个新的 Gradle 项目，通常通过在 `settings.gradle.kts` 文件中调用 `include` 来实现。例如：

    ```kotlin
    include(":okhttp-impl")
    include(":ktor-impl")
    ```

3. 配置每个新的 Gradle 项目：

    * 大多数情况下，您不需要应用 `kotlin("multiplatform")` 插件，因为这些项目仅编译为单个目标。在此示例中，您可以应用 `kotlin("jvm")`。
    * 将原目标特定源集的内容移动到其各自的项目中，例如从 `jvmKtorMain` 移动到 `ktor-impl/src`。
    * 复制源集的配置：依赖项、编译器选项等。
    * 添加从新 Gradle 项目到原项目的依赖项。

    ```kotlin
    // ktor-impl/build.gradle.kts:
    plugins {
        kotlin("jvm")
    }
    
    dependencies {
        project(":shared") // 添加对原项目的依赖
        // 将 jvmKtorMain 的依赖项复制到此处
    }
    
    kotlin {
        compilerOptions {
            // 将 jvmKtorMain 的编译器选项复制到此处
        }
    }
    ```

虽然这种方法在初始设置时需要做更多工作，但它不使用 Gradle 和 Kotlin Gradle 插件的任何底层实体，使得生成的构建更容易使用和维护。

> 遗憾的是，我们无法为每种情况都提供详细的迁移步骤。如果上述说明不适用于您的情况，请在 [YouTrack 问题](https://youtrack.jetbrains.com/issue/KT-59316)中描述您的用例。
>
{style="tip"}

**变更何时生效？**

以下是计划的弃用周期：

* 1.9.20：在多平台项目中使用多个相似目标时引入弃用警告
* 2.1.0：在此类情况下报错（Kotlin/JS 目标除外；要详细了解此例外情况，请参阅 [YouTrack 中的问题](https://youtrack.jetbrains.com/issue/KT-47038/KJS-MPP-Split-JS-target-into-JsBrowser-and-JsNode)）

<a id="deprecate-pre-hmpp-dependencies"></a>
### 弃用对以旧版模式发布的多平台库的支持 {id="deprecated-support-of-multiplatform-libraries-published-in-legacy-mode"}

**有哪些变更？**

此前，我们已经在多平台项目中[弃用了旧版模式](#deprecated-gradle-properties-for-hierarchical-structure-support)，以阻止发布“旧版”二进制文件，并鼓励您将项目迁移到[层次结构](multiplatform-hierarchy.md)。

为了继续从生态系统中逐步淘汰“旧版”二进制文件，从 Kotlin 1.9.0 开始，也不建议使用旧版库。如果您的项目使用了对旧版库的依赖项，将会看到以下警告：

```none
The dependency group:artifact:1.0 was published in the legacy mode. Support for such dependencies will be removed in the future
```

**现在的最佳做法是什么？**

*如果您是多平台库的使用者*，大多数库已经迁移到了“层次结构”模式，因此您只需更新库版本即可。详情请参阅各库的相关文档。

如果该库尚不支持非旧版二进制文件，您可以联系维护人员并向其告知此兼容性问题。

*如果您是库作者*，请将 Kotlin Gradle 插件更新到最新版本，并确保已修复[已弃用的 Gradle 属性](#deprecated-gradle-properties-for-hierarchical-structure-support)。

Kotlin 团队非常乐意协助生态系统的迁移，因此如果您遇到任何问题，请随时在 [YouTrack 中创建问题](https://kotl.in/issue)。

**变更何时生效？**

以下是计划的弃用周期：

* 1.9.0：针对旧版库的依赖项引入弃用警告
* 2.0.0：将针对旧版库依赖项的警告提升为错误
* &gt;2.0.0：移除对旧版库依赖项的支持；使用此类依赖项可能导致构建失败

<a id="deprecate-hmpp-properties"></a>
### 弃用用于层次结构支持的 Gradle 属性 {id="deprecated-gradle-properties-for-hierarchical-structure-support"}

**有哪些变更？**

在演进过程中，Kotlin 逐步引入了对多平台项目中[层次结构](multiplatform-hierarchy.md)的支持，即允许在通用源集 `commonMain` 与任何特定平台源集（例如 `jvmMain`）之间建立中间源集。

在过渡期内，当工具链尚未足够稳定时，官方引入了几个 Gradle 属性，允许精细化地选择开启（opt-in）或退出（opt-out）。

自 Kotlin 1.6.20 起，分层项目结构支持已默认启用。然而，保留这些属性是为了在遇到阻塞性问题时可以选择退出。在处理了所有反馈之后，我们现在开始彻底淘汰这些属性。

以下属性现已被弃用：

* `kotlin.internal.mpp.hierarchicalStructureByDefault`
* `kotlin.mpp.enableCompatibilityMetadataVariant`
* `kotlin.mpp.hierarchicalStructureSupport`
* `kotlin.mpp.enableGranularSourceSetsMetadata`
* `kotlin.native.enableDependencyPropagation`

**现在的最佳做法是什么？**

* 从 `gradle.properties` 和 `local.properties` 文件中移除这些属性。
* 避免在 Gradle 构建脚本或 Gradle 插件中以编程方式设置它们。
* 如果构建中使用的某些第三方 Gradle 插件设置了已弃用的属性，请要求插件维护者不要设置这些属性。

由于自 Kotlin 1.6.20 以来 Kotlin 工具链的默认行为就不包含此类属性，因此我们预计不会产生任何严重影响。重新构建项目后，大多数结果都将立即可见。

如果您是库作者并希望确保万无一失，请检查使用者是否可以正常使用您的库。

**变更何时生效？**

以下是计划的弃用周期：

* 1.8.20：使用已弃用的 Gradle 属性时报告警告
* 1.9.20：将此警告提升为错误
* 2.0.0：移除已弃用的属性；Kotlin Gradle 插件将忽略它们的使用

如果移除这些属性后极少数情况下遇到了问题，请在 [YouTrack 中创建问题](https://kotl.in/issue)。

<a id="target-presets-deprecation"></a>
### 弃用目标预设 (Target Presets) API {id="deprecated-target-presets-api"}

**有哪些变更？**

在极早期的开发阶段，Kotlin Multiplatform 引入了用于处理所谓*目标预设 (target presets)* 的 API。每个目标预设本质上代表了 Kotlin Multiplatform 目标的工厂。事实证明该 API 在很大程度上是多余的，因为像 `jvm()` 或 `iosSimulatorArm64()` 这样的 DSL 函数不仅能覆盖相同的用例，而且更加直观和简洁。

为了减少混淆并提供更清晰的指南，Kotlin Gradle 插件的公共 API 中现已弃用所有与预设相关的 API。这包括：

* `org.jetbrains.kotlin.gradle.dsl.KotlinMultiplatformExtension` 中的 `presets` 属性
* `org.jetbrains.kotlin.gradle.plugin.KotlinTargetPreset` 接口及其所有继承者
* `fromPreset` 重载

**现在的最佳做法是什么？**

改用相应的 [Kotlin 目标](multiplatform-dsl-reference.md#targets)，例如：

<table>
    
<tr>
<td>变更前</td>
        <td>变更后</td>
</tr>

    
<tr>
<td>
<code-block lang="kotlin" code="kotlin {&#10;    targets {&#10;        fromPreset(presets.iosArm64, 'ios')&#10;    }&#10;}"/>
</td>
<td>
<code-block lang="kotlin" code="kotlin {&#10;    iosArm64()&#10;}"/>
</td>
</tr>

</table>

**变更何时生效？**

以下是计划的弃用周期：

* 1.9.20：对任何预设相关 API 的使用报告警告
* 2.0.0：将此警告提升为错误
* 2.2.0：从 Kotlin Gradle 插件的公共 API 中移除与预设相关的 API；仍在使用它的源代码将失败并报错“unresolved reference”，而二进制文件（例如 Gradle 插件）可能会发生链接错误，除非针对最新版本的 Kotlin Gradle 插件重新编译

<a id="target-shortcuts-deprecation"></a>
### 弃用 Apple 目标快捷函数 {id="deprecated-apple-target-shortcuts"}

**有哪些变更？**

我们正在弃用 Kotlin Multiplatform DSL 中的 `ios()`、`watchos()` 和 `tvos()` 目标快捷函数。它们原本设计用于部分创建 Apple 目标的源集层次结构。然而事实证明它们难以扩展，有时还会造成混淆。

例如，`ios()` 快捷函数同时创建了 `iosArm64` 和 `iosX64` 目标，但未包含在基于 Apple M 芯片的宿主机上工作所必需的 `iosSimulatorArm64` 目标。然而，更改此快捷方式很难实现，并且可能会在现有用户项目中引起问题。

**现在的最佳做法是什么？**

Kotlin Gradle 插件现在提供了内置的层次结构模板。从 Kotlin 1.9.20 开始，它已默认启用，并包含针对常见用例的预定义中间源集。

您应该指定目标列表，而不是使用快捷函数，然后插件会根据此列表自动设置中间源集。

例如，如果您的项目中有 `iosArm64` 和 `iosSimulatorArm64` 目标，插件将自动创建 `iosMain` 和 `iosTest` 中间源集。如果您有 `iosArm64` 和 `macosArm64` 目标，则会创建 `appleMain` 和 `appleTest` 源集。

欲了解更多信息，请参阅[层次结构项目结构](multiplatform-hierarchy.md)

**变更何时生效？**

以下是计划的弃用周期：

* 1.9.20：使用 `ios()`、`watchos()` 和 `tvos()` 目标快捷函数时报告警告；改用默认启用的层次结构模板
* 2.1.0：使用目标快捷函数时报告错误
* 2.2.0：从 Kotlin Multiplatform Gradle 插件中移除目标快捷 DSL

### Kotlin 升级后 iOS 框架版本不正确 {id="incorrect-version-of-ios-framework-after-kotlin-upgrade"}

**问题是什么？**

在使用直接集成时，Kotlin 代码中的更改可能不会反映在 Xcode 中的 iOS 应用中。直接集成是通过 `embedAndSignAppleFrameworkForXcode` 任务设置的，该任务将多平台项目中的 iOS 框架连接到 Xcode 中的 iOS 应用。

当您在多平台项目中将 Kotlin 版本从 1.9.2x 升级到 2.0.0（或从 2.0.0 降级到 1.9.2x），然后修改 Kotlin 文件并尝试构建应用时，可能会发生这种情况：Xcode 可能会错误地使用先前版本的 iOS 框架。因此，所做的更改在 Xcode 中的 iOS 应用中将不可见。

**变通方案是什么？**

1. 在 Xcode 中，使用 **Product** | **Clean Build Folder** 清理构建目录。
2. 在终端中运行以下命令：

   ```none
   ./gradlew clean
   ```

3. 重新构建应用，以确保使用新版本的 iOS 框架。

**此问题何时修复？**

我们计划在 Kotlin 2.0.10 中修复此问题。您可以在[参与 Kotlin 抢先体验计划 (EAP)](https://kotlinlang.org/docs/eap.html) 部分中查看 Kotlin 2.0.10 的预览版本是否已发布。

欲了解更多信息，请参阅 [YouTrack 中的相应问题](https://youtrack.jetbrains.com/issue/KT-68257)。

## Kotlin 1.9.0−1.9.25 {id="kotlin-1-9-0-1-9-25"}

本节涵盖弃用周期结束并在 Kotlin 1.9.0−1.9.25 中生效的不兼容变更。

<a id="compilation-source-deprecation"></a>
### 移除了将 Kotlin 源集直接添加到 Kotlin 编译的 API {initial-collapse-state="collapsed" collapsible="true" id="removed-api-for-adding-kotlin-source-sets-directly-to-the-kotlin-compilation"}

**有哪些变更？**

对 `KotlinCompilation.source` 的访问已被移除。如下所示的代码将不再受支持：

```kotlin
kotlin {
    jvm()
    js()
    iosArm64()
    iosSimulatorArm64()
    
    sourceSets {
        val commonMain by getting
        val myCustomIntermediateSourceSet by creating {
            dependsOn(commonMain)
        }
        
        targets["jvm"].compilations["main"].source(myCustomIntermediateSourceSet)
    }
}
```

**现在的最佳做法是什么？**

要替换 `KotlinCompilation.source(someSourceSet)`，请使用 `.srcDir()` 函数直接将源代码添加到相应的源集中。或者，您也可以通过从 `KotlinCompilation` 的默认源集添加指向 `someSourceSet` 的 `dependsOn` 关系来创建新源集。您还可以使用[源集约定 (source set conventions)](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.dsl/-kotlin-multiplatform-source-set-conventions/) 直接引用源集，这对 IDE 非常友好且被认为是最稳健的做法。最后，您也可以使用适用于所有情况的 `KotlinCompilation.defaultSourceSet.dependsOn(someSourceSet)`。

您可以通过以下方式之一修改上述代码：

```kotlin
kotlin {
    jvm()
    js()
    iosArm64()
    iosSimulatorArm64()

    sourceSets {
        val myCustomIntermediateSourceSet by creating {
            // 需要使用 .get() 函数访问 commonMain 源集
            dependsOn(commonMain.get())
        }

        // 方式 1：直接将源代码添加到相应的源集中：
        commonMain {
            kotlin.srcDir(layout.projectDirectory.dir("src/commonMain/my-custom-kotlin"))
        }

        // 方式 2：使用默认 Kotlin Multiplatform 目标为其 main 和 test 
        // 源集提供的约定：
        jvmMain {
            dependsOn(myCustomIntermediateSourceSet)
        }

        // 方式 3：更通用的解决方案。如果您的构建脚本需要更高级的做法，
        // 可以使用此选项：
        targets["jvm"].compilations["main"].defaultSourceSet.dependsOn(myCustomIntermediateSourceSet)
    }
}
```

**变更何时生效？**

以下是弃用周期：

* 1.9.0：在使用 `KotlinCompilation.source` 时引入弃用警告
* 1.9.20：将此警告提升为错误
* 2.3.0：从 Kotlin Gradle 插件中移除 `KotlinCompilation.source`，尝试使用它会在构建脚本编译期间导致“unresolved reference”错误

<a id="kotlin-js-plugin-deprecation"></a>
### 从 `kotlin-js` Gradle 插件迁移到 `kotlin-multiplatform` Gradle 插件 {initial-collapse-state="collapsed" collapsible="true" id="migration-from-kotlin-js-gradle-plugin-to-kotlin-multiplatform-gradle-plugin"}

**有哪些变更？**

从 Kotlin 1.9.0 开始，`kotlin-js` Gradle 插件已被弃用。基本上，它重复了带有 `js()` 目标的 `kotlin-multiplatform` 插件的功能，并在底层共享相同的实现。这种重叠造成了困惑，并增加了 Kotlin 团队的维护负担。我们鼓励您改用带有 `js()` 目标的 `kotlin-multiplatform` Gradle 插件。

**现在的最佳做法是什么？**

1. 从项目中移除 `kotlin-js` Gradle 插件；如果您使用的是 `pluginManagement {}` 块，请在 `settings.gradle.kts` 文件中应用 `kotlin-multiplatform`：

   <Tabs>
   <TabItem title="kotlin-js">

   ```kotlin
   // settings.gradle.kts:
   pluginManagement {
       plugins {
           // 移除以下行：
           kotlin("js") version "1.9.0"
       }
       
       repositories {
           // ...
       }
   }
   ```

   </TabItem>
   <TabItem title="kotlin-multiplatform">

   ```kotlin
   // settings.gradle.kts:
   pluginManagement {
       plugins {
           // 改为添加以下行：
           kotlin("multiplatform") version "1.9.0"
       }
       
       repositories {
           // ...
       }
   }
   ```

   </TabItem>
   </Tabs>

   如果您使用了其他应用插件的方式，请参阅 [Gradle 文档](https://docs.gradle.org/current/userguide/plugins.html)获取迁移说明。

2. 将源文件从相同目录下的 `main` 和 `test` 文件夹移动到 `jsMain` 和 `jsTest` 文件夹。
3. 调整依赖项声明：

   * 建议使用 `sourceSets {}` 代码块并配置各个源集的依赖项，使用 `jsMain {}` 配置生产依赖项，使用 `jsTest {}` 配置测试依赖项。
     详见[添加依赖项](multiplatform-add-dependencies.md)。
   * 但是，如果您想在顶级代码块中声明依赖项，请将声明从 `api("group:artifact:1.0")` 更改为 `add("jsMainApi", "group:artifact:1.0")` 等。

     > 在这种情况下，请确保顶级 `dependencies {}` 代码块位于 `kotlin {}` 代码块**之后**。否则会收到“Configuration not found”错误。
     >
     {style="note"}

   您可以通过以下方式之一修改 `build.gradle.kts` 文件中的代码：

   <Tabs>
   <TabItem title="kotlin-js">

   ```kotlin
   // build.gradle.kts:
   plugins {
       kotlin("js") version "1.9.0"
   }
   
   dependencies {
       testImplementation(kotlin("test"))
       implementation("org.jetbrains.kotlinx:kotlinx-html:0.8.0")
   }
   
   kotlin {
       js {
           // ...
       }
   }
   ```

   </TabItem>
   <TabItem title="kotlin-multiplatform">

   ```kotlin
   // build.gradle.kts:
   plugins {
       kotlin("multiplatform") version "1.9.0"
   }
   
   kotlin {
       js {
           // ...
       }
       
       // 方式 1：在 sourceSets {} 代码块中声明依赖项：
       sourceSets {
           val jsMain by getting {
               dependencies {
                   // 此处不需要 js 前缀，直接从顶级代码块复制粘贴即可
                   implementation("org.jetbrains.kotlinx:kotlinx-html:0.8.0")
               }
          }
       }
   }
   
   dependencies {
       // 方式 2：向依赖项声明中添加 js 前缀：
       add("jsTestImplementation", kotlin("test"))
   }
   ```

   </TabItem>
   </Tabs>

4. 在大多数情况下，Kotlin Gradle 插件在 `kotlin {}` 代码块内提供的 DSL 保持不变。但是，如果您之前通过名称引用低级 Gradle 实体（如任务和配置），现在需要对其进行调整，通常是添加 `js` 前缀。例如，您可以在 `jsBrowserTest` 名称下找到 `browserTest` 任务。

**变更何时生效？**

以下是 `kotlin-js` Gradle 插件的弃用周期：

* 1.9.0：使用 `kotlin-js` 插件时产生弃用警告
* 2.4.0：[将警告提升为错误](https://youtrack.jetbrains.com/issue/KT-59305)

<a id="jvmWithJava-preset-deprecation"></a>
### 弃用 `jvmWithJava` 预设 {initial-collapse-state="collapsed" collapsible="true" id="deprecated-jvmwithjava-preset"}

**有哪些变更？**

`targetPresets.jvmWithJava` 已弃用，不建议使用。

**现在的最佳做法是什么？**

改用 `jvm { withJava() }` 目标。请注意，切换到 `jvm { withJava() }` 后，您需要调整包含 `.java` 源文件的源目录路径。

例如，如果您使用默认名称为“jvm”的 `jvm` 目标：

| 变更前          | 变更后                |
|-----------------|--------------------|
| `src/main/java` | `src/jvmMain/java` |
| `src/test/java` | `src/jvmTest/java` |

**变更何时生效？**

以下是计划的弃用周期：

* 1.3.40：在使用 `targetPresets.jvmWithJava` 时引入警告
* 1.9.20：将此警告提升为错误
* &gt;1.9.20：移除 `targetPresets.jvmWithJava` API；尝试使用会导致构建脚本编译失败

> 尽管整个 `targetPresets` API 已被弃用，但 `jvmWithJava` 预设具有不同的弃用时间线。
>
{style="note"}

<a id="android-sourceset-layout-v1-deprecation"></a>
### 弃用旧版 Android 源集布局 {initial-collapse-state="collapsed" collapsible="true" id="deprecated-legacy-android-source-set-layout"}

**有哪些变更？**

自 Kotlin 1.9.0 起，默认使用[新的 Android 源集布局](multiplatform-android-layout.md)。对旧版布局的支持已被弃用，使用 `kotlin.mpp.androidSourceSetLayoutVersion` Gradle 属性现在会触发弃用诊断。

**变更何时生效？**

以下是弃用周期：

* <=1.9.0：在使用 `kotlin.mpp.androidSourceSetLayoutVersion=1` 时报告警告；可以通过 `kotlin.mpp.androidSourceSetLayoutVersion1.nowarn=true` Gradle 属性抑制该警告
* 1.9.20：将此警告提升为错误；该错误**无法**被抑制
* 2.4.0：移除对旧版 Android 源集布局的支持，并[移除 `kotlin.mpp.androidSourceSetLayoutVersion=1` Gradle 属性](https://youtrack.jetbrains.com/issue/KT-82265)

<a id="common-sourceset-with-dependson-deprecation"></a>
### 弃用带自定义 `dependsOn` 的 `commonMain` 和 `commonTest` {initial-collapse-state="collapsed" collapsible="true" id="deprecated-commonmain-and-commontest-with-custom-dependson"}

**有哪些变更？**

`commonMain` 和 `commonTest` 源集通常分别代表 `main` 和 `test` 源集层次结构的根。但是，以前可以通过手动配置这些源集的 `dependsOn` 关系来覆盖这一设定。

维护此类配置需要额外的精力和对多平台构建内部机制的了解。此外，它还会降低代码的可读性和可重用性，因为您需要阅读特定的构建脚本才能确认 `commonMain` 是否为 `main` 源集层次结构的根。

因此，现在弃用了在 `commonMain` 和 `commonTest` 上访问 `dependsOn`。

**现在的最佳做法是什么？**

假设您需要将使用 `commonMain.dependsOn(customCommonMain)` 的 `customCommonMain` 源集迁移到 1.9.20。在大多数情况下，`customCommonMain` 与 `commonMain` 参与相同的编译，因此您可以将 `customCommonMain` 合并到 `commonMain` 中：

1. 将 `customCommonMain` 的源代码复制到 `commonMain` 中。
2. 将 `customCommonMain` 的所有依赖项添加到 `commonMain`。
3. 将 `customCommonMain` 的所有编译器选项设置添加到 `commonMain`。

在极少数情况下，`customCommonMain` 参与的编译可能比 `commonMain` 更多。这种配置需要对构建脚本进行额外的底层配置。如果您不确定这是否符合您的用例，那么极大概率不是。

如果确实属于您的情况，可以通过将 `customCommonMain` 的源代码和设置移动到 `commonMain`（反之亦然）来“交换”这两个源集。

**变更何时生效？**

以下是计划的弃用周期：

* 1.9.0：在 `commonMain` 中使用 `dependsOn` 时报告警告
* &gt;=1.9.20：在 `commonMain` 或 `commonTest` 中使用 `dependsOn` 时报告错误

### 前向声明的新处理方式 {initial-collapse-state="collapsed" collapsible="true" id="new-approach-to-forward-declarations"}

**有哪些变更？**

JetBrains 团队对 Kotlin 中的前向声明机制进行了重构，以使其行为更加可预测：

* 只能使用 `cnames` 或 `objcnames` 包导入前向声明。
* 需要显式在相应 C 和 Objective-C 前向声明之间进行转换。

**现在的最佳做法是什么？**

* 假设有一个声明了 `cstructName` 前向声明的 C 库 `library.package`。
  此前，可以直接使用 `import library.package.cstructName` 从库中导入它。
  现在，只能为此使用特殊的前向声明包：`import cnames.structs.cstructName`。
  对于 `objcnames` 也是如此。

* 考虑两个 objcinterop 库：一个使用 `objcnames.protocols.ForwardDeclaredProtocolProtocol`，另一个包含实际定义：

  ```ObjC
  // 第一个 objcinterop 库
  #import <Foundation/Foundation.h>
  
  @protocol ForwardDeclaredProtocol;
  
  NSString* consumeProtocol(id<ForwardDeclaredProtocol> s) {
      return [NSString stringWithUTF8String:"Protocol"];
  }
  ```

  ```ObjC
  // 第二个 objcinterop 库
  // 头文件：
  #import <Foundation/Foundation.h>
  @protocol ForwardDeclaredProtocol
  @end
  // 实现：
  @interface ForwardDeclaredProtocolImpl : NSObject <ForwardDeclaredProtocol>
  @end

  id<ForwardDeclaredProtocol> produceProtocol() {
      return [ForwardDeclaredProtocolImpl new];
  }
  ```

  此前，可以在它们之间无缝传递对象。现在，对于前向声明需要使用显式的 `as` 转换：

  ```kotlin
  // Kotlin 代码：
  fun test() {
      consumeProtocol(produceProtocol() as objcnames.protocols.ForwardDeclaredProtocolProtocol)
  }
  ```

  > 只能从对应的真实类转换为 `objcnames.protocols.ForwardDeclaredProtocolProtocol`。
  > 否则，将会报错。
  >
  {style="note"}

**变更何时生效？**

从 Kotlin 1.9.20 开始，必须在相应的 C 和 Objective-C 前向声明之间显式进行转换。此外，现在只能通过使用特殊包来导入前向声明。

## Kotlin 1.7.0−1.8.22 {id="kotlin-1-7-0-1-8-22"}

本节涵盖弃用周期结束并在 Kotlin 1.7.0−1.8.22 中生效的不兼容变更。

<a id="deprecated-compatibility-with-kmp-gradle-plugin-and-gradle-java-plugins"></a>
### 弃用 Kotlin Multiplatform Gradle 插件与 Gradle Java 插件的兼容性 {initial-collapse-state="collapsed" collapsible="true" id="deprecated-compatibility-with-kotlin-multiplatform-gradle-plugin-and-gradle-java-plugins"}

**有哪些变更？**

由于 Kotlin Multiplatform Gradle 插件与 Gradle 插件 [Java](https://docs.gradle.org/current/userguide/java_plugin.html)、[Java Library](https://docs.gradle.org/current/userguide/java_library_plugin.html) 以及 [Application](https://docs.gradle.org/current/userguide/application_plugin.html) 之间存在兼容性问题，当您在同一项目中应用这些插件时，现在会出现弃用警告。当多平台项目中的另一个 Gradle 插件应用了 Gradle Java 插件时，也会出现此警告。例如，[Spring Boot Gradle 插件](https://docs.spring.io/spring-boot/gradle-plugin/index.html)会自动应用 Application 插件。

我们添加此弃用警告是因为 Kotlin Multiplatform 的项目模型与 Gradle 的 Java 生态系统插件之间存在根本性的兼容性问题。Gradle 的 Java 生态系统插件目前没有考虑到其他插件可能：

* 也会以不同于 Java 生态系统插件的方式为 JVM 目标进行发布或编译。
* 在同一个项目中拥有两个不同的 JVM 目标，例如 JVM 和 Android。
* 具有复杂的多平台项目结构，可能包含多个非 JVM 目标。

遗憾的是，Gradle 目前没有提供任何 API 来解决这些问题。

我们此前在 Kotlin Multiplatform 中使用了一些变通方案来协助集成 Java 生态系统插件。然而，这些变通方案从未真正解决兼容性问题，且从 Gradle 8.8 发布开始，这些变通方案已不再可行。欲了解更多信息，请参阅我们的 [YouTrack 问题](https://youtrack.jetbrains.com/issue/KT-66542/Gradle-JVM-target-with-withJava-produces-a-deprecation-warning)。

虽然我们尚不确切知道如何解决此兼容性问题，但我们致力于在 Kotlin Multiplatform 项目中继续以某种形式支持 Java 源码编译。至少，我们将支持 Java 源码的编译，以及在您的多平台项目中使用 Gradle 的 [`java-base`](https://docs.gradle.org/current/javadoc/org/gradle/api/plugins/JavaBasePlugin.html) 插件。

**现在的最佳做法是什么？**

如果您在多平台项目中看到此弃用警告，我们建议您：
1. 确定项目中是否确实需要 Gradle Java 插件。如果不需要，请考虑将其移除。
2. 检查 Gradle Java 插件是否仅用于单个任务。如果是，您也许可以毫不费力地移除该插件。例如，如果该任务使用 Gradle Java 插件创建 Javadoc JAR 文件，您可以改为手动定义 Javadoc 任务。

否则，如果您希望在多平台项目中同时使用 Kotlin Multiplatform Gradle 插件和这些用于 Java 的 Gradle 插件，我们建议您：

1. 在 Gradle 项目中创建一个独立的子项目。
2. 在该独立的子项目中应用 Gradle Java 插件。
3. 在该独立的子项目中添加对父级多平台项目的依赖项。

> 该独立子项目**绝不能**是多平台项目，并且只能用于设置对多平台项目的依赖项。
>
{style="warning"}

例如，您有一个名为 `my-main-project` 的多平台项目，并且想要使用 [Java Library](https://docs.gradle.org/current/userguide/java_library_plugin.html) Gradle 插件。

创建子项目（假设命名为 `subproject-A`）后，父项目的结构应如下所示：

```text
.
├── build.gradle
├── settings.gradle.kts
├── subproject-A
    └── build.gradle.kts
    └── src
        └── Main.java
```

在子项目的 `build.gradle.kts` 文件的 `plugins {}` 块中应用 Java Library 插件：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    id("java-library")
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
plugins {
    id('java-library')
}
```

</TabItem>
</Tabs>

在子项目的 `build.gradle.kts` 文件中，添加对父级多平台项目的依赖项：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    implementation(project(":my-main-project")) // 父级多平台项目的名称
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
dependencies {
    implementation project(':my-main-project') // 父级多平台项目的名称
}
```

</TabItem>
</Tabs>

现在您的父项目已配置为可以与这两个插件一起工作。

### 自动生成目标的新处理方式 {initial-collapse-state="collapsed" collapsible="true" id="new-approach-to-auto-generated-targets"}

**有哪些变更？**

由 Gradle 自动生成的目标访问器在 `kotlin.targets {}` 代码块内不再可用。请改用 `findByName("targetName")` 方法。

请注意，此类访问器在 `kotlin.targets` 属性上仍然可用，例如 `kotlin.targets.linuxX64`。

**现在的最佳做法是什么？**

<table>
    
<tr>
<td>变更前</td>
        <td>变更后</td>
</tr>

    
<tr>
<td>
<code-block lang="kotlin" code="kotlin {&#10;    targets {&#10;        configure(['windows',&#10;            'linux']) {&#10;        }&#10;    }&#10;}"/>
</td>
<td>
<code-block lang="kotlin" code="kotlin {&#10;    targets {&#10;        configure([findByName('windows'),&#10;            findByName('linux')]) {&#10;        }&#10;    }&#10;}"/>
</td>
</tr>

</table>

**变更何时生效？**

在 Kotlin 1.7.20 中，在 `kotlin.targets {}` 代码块中使用目标访问器时会引入错误。

欲了解更多信息，请参阅 [YouTrack 中的相应问题](https://youtrack.jetbrains.com/issue/KT-47047)。

### Gradle 编译任务输入和输出的变更 {initial-collapse-state="collapsed" collapsible="true" id="changes-in-gradle-input-and-output-compile-tasks"}

**有哪些变更？**

Kotlin 编译任务不再继承具有 `sourceCompatibility` 和 `targetCompatibility` 输入的 Gradle `AbstractCompile` 任务，这使得它们在 Kotlin 用户的脚本中不再可用。

编译任务中的其他重大变更：

**现在的最佳做法是什么？**

| 变更前                                                              | 变更后                                                                                                            |
|---------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| `SourceTask.stableSources` 输入不再可用。        | 改用 `sources` 输入。此外，`setSource()` 方法仍然可用。                          |
| 移除了 `sourceFilesExtensions` 输入。                      | 编译任务仍然实现 `PatternFilterable` 接口。使用其方法来筛选 Kotlin 源代码。 |
| 弃用了 `Gradle destinationDir: File` 输出。            | 改用 `destinationDirectory: DirectoryProperty` 输出。                                              |
| 弃用了 `KotlinCompile` 任务的 `classpath` 属性。 | 所有编译任务现在都使用 `libraries` 输入来获取编译所需的库列表。              |

**变更何时生效？**

在 Kotlin 1.7.20 中，上述输入不可用，输出被替换，且 `classpath` 属性被弃用。

欲了解更多信息，请参阅 [YouTrack 中的相应问题](https://youtrack.jetbrains.com/issue/KT-32805)。

### 针对编译依赖项的新配置名称 {initial-collapse-state="collapsed" collapsible="true" id="new-configuration-names-for-dependencies-on-the-compilation"}

**有哪些变更？**

Kotlin Multiplatform Gradle 插件创建的编译配置获得了新名称。

多平台项目中的一个目标具有两个默认编译：`main` 和 `test`。这些编译中的每一个都有自己的默认源集，例如 `jvmMain` 和 `jvmTest`。此前，测试编译及其默认源集的配置名称是相同的，当带有平台特定特性的配置被包含在另一个配置中时，这可能会导致名称冲突并引发问题。

现在，编译配置具有额外的 `Compilation` 后缀，而使用硬编码旧配置名称的项目和插件将不再能编译。

针对对应源集的依赖项配置名称保持不变。

**现在的最佳做法是什么？**

<table>
    
<tr>
<td></td>
        <td>变更前</td>
        <td>变更后</td>
</tr>

    
<tr>
<td rowspan="2"><code>jvmMain</code> 编译的依赖项</td>
<td>
<code-block lang="kotlin" code="jvm&lt;Scope&gt;"/>
</td>
<td>
<code-block lang="kotlin" code="jvmCompilation&lt;Scope&gt;"/>
</td>
</tr>

    
<tr>
<td>
<code-block lang="kotlin" code="dependencies {&#10;    add(&quot;jvmImplementation&quot;,&#10;        &quot;foo.bar.baz:1.2.3&quot;)&#10;}"/>
</td>
<td>
<code-block lang="kotlin" code="dependencies {&#10;    add(&quot;jvmCompilationImplementation&quot;,&#10;        &quot;foo.bar.baz:1.2.3&quot;)&#10;}"/>
</td>
</tr>

    
<tr>
<td><code>jvmMain</code> 源集的依赖项</td>
<td colspan="2">
<code-block lang="kotlin" code="jvmMain&lt;Scope&gt;"/>
</td>
</tr>

    
<tr>
<td><code>jvmTest</code> 编译的依赖项</td>
<td>
<code-block lang="kotlin" code="jvmTest&lt;Scope&gt;"/>
</td>
<td>
<code-block lang="kotlin" code="jvmTestCompilation&lt;Scope&gt;"/>
</td>
</tr>

    
<tr>
<td><code>jvmTest</code> 源集的依赖项</td>
<td colspan="2">
<code-block lang="kotlin" code="jvmTest&lt;Scope&gt;"/>
</td>
</tr>

</table>

可用的作用域包括 `Api`、`Implementation`、`CompileOnly` 和 `RuntimeOnly`。

**变更何时生效？**

在 Kotlin 1.8.0 中，在硬编码字符串中使用旧配置名称时会引入错误。

欲了解更多信息，请参阅 [YouTrack 中的相应问题](https://youtrack.jetbrains.com/issue/KT-35916/)。