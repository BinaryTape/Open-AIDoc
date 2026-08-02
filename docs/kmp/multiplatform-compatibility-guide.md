[//]: # (title: Kotlin Multiplatform 兼容性指南)

<show-structure depth="1"/>

本指南总结了在使用 Kotlin Multiplatform 开发项目时可能遇到的[不兼容变更](https://kotlinlang.org/docs/kotlin-evolution-principles.html#incompatible-changes)。

> 有关 Compose Multiplatform 的信息，请参阅 [Compose Multiplatform 最新变化](https://kotlinlang.org/docs/multiplatform/whats-new-compose.html)和 [Kotlin 与 Jetpack 兼容性](compose-compatibility-and-versioning.md)页面。
> 
{style="note"}

Kotlin 当前的稳定版本为 %kotlinVersion%。请注意特定变更相对于项目中使用的 Kotlin 版本的弃用周期，例如：

* 从 Kotlin 1.7.0 升级到 Kotlin 1.9.0 时，请检查 [Kotlin 1.9.0](#kotlin-1-9-0-1-9-25) 和 [Kotlin 1.7.0−1.8.22](#kotlin-1-7-0-1-8-22) 中生效的不兼容变更。
* 从 Kotlin 1.9.0 升级到 Kotlin 2.0.0 时，请检查 [Kotlin 2.0.0](#kotlin-2-0-0-and-later) 和 [Kotlin 1.9.0−1.9.25](#kotlin-1-9-0-1-9-25) 中生效的不兼容变更。 

## 版本兼容性

在配置项目时，请检查特定版本的 Kotlin Multiplatform Gradle 插件（与项目中的 Kotlin 版本相同）与 Gradle、Xcode 和 Android Gradle 插件版本的兼容性：

| Kotlin Multiplatform 插件版本 | Gradle                                | Android Gradle 插件                               | Xcode   |
|-------------------------------------|---------------------------------------|-----------------------------------------------------|---------|
| 2.4.0-2.4.10                        | %minGradleVersion%–%maxGradleVersion% | %minAndroidGradleVersion%–%maxAndroidGradleVersion% | %xcode% |
| 2.3.20–2.3.21                       | 7.6.3–9.3.0                           | 8.2.2–9.0.0                                         | 26.0    |
| 2.3.10                              | 7.6.3–9.0.0                           | 8.2.2–9.0.0                                         | 26.0    |
| 2.3.0                               | 7.6.3–9.0.0                           | 8.2.2–8.13.0                                        | 26.0    |
| 2.2.21                              | 7.6.3–8.14                            | 7.3.1–8.11.1                                        | 26.0    |
| 2.2.20                              | 7.6.3–8.14                            | 7.3.1–8.11.1                                        | 16.4    |
| 2.2.0–2.2.10                        | 7.6.3–8.14                            | 7.3.1–8.10.0                                        | 16.3    |
| 2.1.21                              | 7.6.3–8.12.1                          | 7.3.1–8.7.2                                         | 16.3    |
| 2.1.20                              | 7.6.3–8.11                            | 7.4.2–8.7.2                                         | 16.0    |
| 2.1.0–2.1.10                        | 7.6.3-8.10*                           | 7.4.2–8.7.2                                         | 16.0    |
| 2.0.21                              | 7.5-8.8*                              | 7.4.2–8.5                                           | 16.0    |
| 2.0.20                              | 7.5-8.8*                              | 7.4.2–8.5                                           | 15.3    |
| 2.0.0                               | 7.5-8.5                               | 7.4.2–8.3                                           | 15.3    |
| 1.9.20                              | 7.5-8.1.1                             | 7.4.2–8.2                                           | 15.0    |

> *Kotlin 2.0.20–2.0.21 和 Kotlin 2.1.0–2.1.10 与 8.6 以下版本的 Gradle 完全兼容。
> 同时支持 8.7–8.10 版本的 Gradle，但有一个例外：如果您使用 Kotlin Multiplatform Gradle 插件，在 JVM 目标中调用 `withJava()` 函数时，可能会在多平台项目中看到弃用警告。
> 有关更多信息，请参阅[默认创建的 Java 源集](#java-source-sets-created-by-default)。
>
{style="warning"}

## Kotlin 2.0.0 及更高版本

本节涵盖了结束弃用周期并在 Kotlin 2.0.0−%kotlinVersion% 中生效的不兼容变更。

### 迁移到 Google 适用于 Android 目标的插件

**发生了什么变化？**

在 Kotlin 2.3.0 之前，我们通过 `com.android.application` 和 `com.android.library` 插件提供对 Android 目标的支持。这是 Google Android 团队开发专门针对 Kotlin Multiplatform 的插件时的临时解决方案。

最初我们使用 `android` 块，但后来过渡到了 `androidTarget` 块，以便将 `android` 名称保留给新插件使用。

现在，Google 的 Android 团队已经推出了 [`com.android.kotlin.multiplatform.library` 插件](https://developer.android.com/kotlin/multiplatform/plugin)，您可以将其与原始的 `android` 块一起使用。

Kotlin 2.3.0 在 Kotlin Multiplatform 项目中使用 `androidTarget` 名称时会引入弃用警告。如果您需要更多时间迁移到 `android` 块，请使用搭配 AGP 8.x 的 Kotlin 2.3.10，此时不会出现该警告。

**现在的最佳做法是什么？**

迁移到新的 `com.android.kotlin.multiplatform.library` 插件。将所有出现的 `androidTarget` 块重命名为 `android`。有关如何迁移的详细说明，请参阅 Google 的[迁移指南](https://developer.android.com/kotlin/multiplatform/plugin#migrate)。

**这些变更何时生效？**

以下是 Kotlin Multiplatform Gradle 插件的弃用周期：

* 1.9.0：在 Kotlin Multiplatform 项目中使用 `android` 名称时引入弃用警告
* 2.1.0：将此警告提升为错误
* 2.2.0：从 Kotlin Multiplatform Gradle 插件中移除 `android` 目标 DSL
* 2.3.0：新的 Android 插件可用；在 Kotlin Multiplatform 项目中使用 `androidTarget` 名称时引入弃用警告。
* 2.3.10：还原在 Kotlin Multiplatform 项目中使用 `androidTarget` 名称时的弃用警告。

### 弃用 Bitcode 嵌入

**发生了什么变化？**

Bitcode 嵌入在 Xcode 14 中被弃用，并在 Xcode 15 中针对所有 Apple 目标被移除。相应地，框架配置的 `embedBitcode` 参数，以及 `-Xembed-bitcode` 和 `-Xembed-bitcode-marker` 命令行参数在 Kotlin 中也被弃用。

**现在的最佳做法是什么？**

如果您仍在使用早期版本的 Xcode，但希望升级到 Kotlin 2.0.20 或更高版本，请在 Xcode 项目中禁用 Bitcode 嵌入。

**这些变更何时生效？**

以下是计划的弃用周期：

* 2.0.20：Kotlin/Native 编译器不再支持 Bitcode 嵌入
* 2.1.0：`embedBitcode` DSL 在 Kotlin Multiplatform Gradle 插件中被弃用并发出警告
* 2.2.0：警告提升为错误
* 2.3.0：移除 `embedBitcode` DSL 

### 默认创建的 Java 源集

**发生了什么变化？**

为了使 Kotlin Multiplatform 与 Gradle 即将发生的变更保持一致，我们正在逐步淘汰 `withJava()` 函数。`withJava()` 函数通过创建必要的 Java 源集来启用与 Gradle Java 插件的集成。从 Kotlin 2.1.20 开始，这些 Java 源集将默认创建。

**现在的最佳做法是什么？**

以前，您必须显式使用 `withJava()` 函数来创建 `src/jvmMain/java` 和 `src/jvmTest/java` 源集：

```kotlin
kotlin {
    jvm {
        withJava()
    }
}
``` 

从 Kotlin 2.1.20 开始，您可以从构建脚本中移除 `withJava()` 函数。

此外，Gradle 现在仅在存在 Java 源代码时才运行 Java 编译任务，从而触发之前未曾运行的 JVM 验证诊断。如果您为 `KotlinJvmCompile` 任务或在 `compilerOptions` 内部显式配置了不兼容的 JVM 目标，该诊断将失败。有关确保 JVM 目标兼容性的指导，请参阅[检查相关编译任务的 JVM 目标兼容性](https://kotlinlang.org/docs/gradle-configure-project.html#check-for-jvm-target-compatibility-of-related-compile-tasks)。

如果您的项目使用高于 8.7 的 Gradle 版本，且不依赖于 Gradle Java 插件（如 [Java](https://docs.gradle.org/current/userguide/java_plugin.html)、[Java Library](https://docs.gradle.org/current/userguide/java_library_plugin.html) 或 [Application](https://docs.gradle.org/current/userguide/application_plugin.html)），或依赖于 Gradle Java 插件的第三方 Gradle 插件，您可以移除 `withJava()` 函数。

如果您的项目使用 [Application](https://docs.gradle.org/current/userguide/application_plugin.html) Gradle Java 插件，我们建议迁移到[新的实验性 DSL](https://kotlinlang.org/docs/whatsnew2120.html#kotlin-multiplatform-new-dsl-to-replace-gradle-s-application-plugin)。从 Gradle 8.7 开始，Application 插件将不再与 Kotlin Multiplatform Gradle 插件配合使用。

如果您想在多平台项目中同时使用 Kotlin Multiplatform Gradle 插件和其他 Java Gradle 插件，请参阅[弃用 Kotlin Multiplatform Gradle 插件与 Java 插件的兼容性](multiplatform-compatibility-guide.md#deprecated-compatibility-with-kotlin-multiplatform-gradle-plugin-and-gradle-java-plugins)。

如果您在 Kotlin 2.1.20 且 Gradle 版本高于 8.7 的情况下使用 [Java 测试装置 (test fixtures)](https://docs.gradle.org/current/userguide/java_testing.html#sec:java_test_fixtures) Gradle 插件，该插件将无法工作。请升级到已解决此问题的 [Kotlin 2.1.21](https://kotlinlang.org/docs/releases.html#release-details)。

如果您遇到任何问题，请在我们的 [问题跟踪器](https://kotl.in/issue) 中报告，或在我们的 [公开 Slack 频道](https://kotlinlang.slack.com/archives/C19FD9681) 中寻求帮助。

**这些变更何时生效？**

以下是计划的弃用周期：

* Gradle >8.6：在使用 `withJava()` 函数的多平台项目中，针对任何旧版本的 Kotlin 引入弃用警告。
* Gradle 9.0：将此警告提升为错误。
* 2.1.20：在搭配任何版本的 Gradle 使用 `withJava()` 函数时引入弃用警告。

### 声明多个相似的目标

**发生了什么变化？**

我们不建议在单个 Gradle 项目中声明多个相似的目标。例如：

```kotlin
kotlin {
    jvm("jvmKtor")
    jvm("jvmOkHttp") // 不推荐并会产生弃用警告
}
```

一种常见情况是将两段相关的代码放在一起。例如，您可能希望在 `:shared` Gradle 项目中使用 `jvm("jvmKtor")` 和 `jvm("jvmOkHttp")` 来分别使用 Ktor 或 OkHttp 库实现网络功能：

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

该实现带来了不小的配置复杂度：

* 您必须在 `:shared` 端和每个消费者端设置 Gradle 特性 (attributes)。否则，Gradle 无法解析此类项目中的依赖项，因为在没有额外信息的情况下，不清楚消费者应该接收基于 Ktor 的实现还是基于 OkHttp 的实现。
* 您必须手动设置 `commonJvmMain` 源集。
* 配置涉及大量低级别的 Gradle 和 Kotlin Gradle 插件抽象及 API。

**现在的最佳做法是什么？**

配置复杂是因为基于 Ktor 和基于 OkHttp 的实现都在*同一个 Gradle 项目中*。在许多情况下，可以将这些部分提取到不同的 Gradle 项目中。以下是此类重构的总体大纲：

1. 将原始项目中的两个重复目标替换为单个目标。如果您在这些目标之间有共享源集，请将其源代码和配置移动到新创建目标的默认源集中：

    ```kotlin
    // shared/build.gradle.kts:
    kotlin {
        jvm()
        
        sourceSets {
            jvmMain {
                // 在此处复制 jvmCommonMain 的配置
            }
        }
    }
    ```

2. 添加两个新的 Gradle 项目，通常通过在 `settings.gradle.kts` 文件中调用 `include` 来实现。例如：

    ```kotlin
    include(":okhttp-impl")
    include(":ktor-impl")
    ```

3. 配置每个新 Gradle 项目：

    * 您可能不需要应用 `kotlin("multiplatform")` 插件，因为这些项目仅编译为一个目标。在此示例中，您可以应用 `kotlin("jvm")`。
    * 将原始目标特定源集的内容移动到各自的项目中，例如，从 `jvmKtorMain` 移动到 `ktor-impl/src`。
    * 复制源集的配置：依赖项、编译器选项等。
    * 添加从新 Gradle 项目到原始项目的依赖项。

    ```kotlin
    // ktor-impl/build.gradle.kts:
    plugins {
        kotlin("jvm")
    }
    
    dependencies {
        project(":shared") // 添加对原始项目的依赖
        // 在此处复制 jvmKtorMain 的依赖项
    }
    
    kotlin {
        compilerOptions {
            // 在此处复制 jvmKtorMain 的编译器选项
        }
    }
    ```

虽然这种方法在初始设置上需要更多工作，但它不使用 Gradle 和 Kotlin Gradle 插件的任何低级实体，使得生成的构建更易于使用和维护。

> 遗憾的是，我们无法为每种情况提供详细的迁移步骤。如果上述说明对您不起作用，请在此 [YouTrack 问题](https://youtrack.jetbrains.com/issue/KT-59316) 中描述您的用例。
>
{style="tip"}

**这些变更何时生效？**

以下是计划的弃用周期：

* 1.9.20：在 Kotlin Multiplatform 项目中使用多个相似目标时引入弃用警告
* 2.1.0：在此类情况下报告错误，Kotlin/JS 目标除外；要了解有关此例外的更多信息，请参阅 [YouTrack 中的问题](https://youtrack.jetbrains.com/issue/KT-47038/KJS-MPP-Split-JS-target-into-JsBrowser-and-JsNode)

### 弃用对以旧版模式发布的多平台库的支持

**发生了什么变化？**

此前，我们已经在 Kotlin Multiplatform 项目中[弃用了旧版模式](#deprecated-gradle-properties-for-hierarchical-structure-support)，以阻止发布“旧版”二进制文件，并鼓励您将项目迁移到[层次结构](multiplatform-hierarchy.md)。

为了继续从生态系统中淘汰“旧版”二进制文件，从 Kotlin 1.9.0 开始，也不再建议使用旧版库。如果您的项目使用了对旧版库的依赖项，您将看到以下警告：

```none
The dependency group:artifact:1.0 was published in the legacy mode. Support for such dependencies will be removed in the future
```

**现在的最佳做法是什么？**

*如果您使用多平台库*，其中大多数库已经迁移到“层次结构”模式，因此您只需更新库版本即可。详情请参阅各库的文档。

如果该库尚未支持非旧版二进制文件，您可以联系维护者并告知其此兼容性问题。

*如果您是库作者*，请将 Kotlin Gradle 插件更新到最新版本，并确保您已修复[已弃用的 Gradle 属性](#deprecated-gradle-properties-for-hierarchical-structure-support)。

Kotlin 团队非常乐意帮助生态系统进行迁移，因此如果您遇到任何问题，请随时在 [YouTrack 中创建问题](https://kotl.in/issue)。

**这些变更何时生效？**

以下是计划的弃用周期：

* 1.9.0：对旧版库的依赖引入弃用警告
* 2.0.0：将对旧版库依赖的警告提升为错误
* &gt;2.0.0：移除对旧版库依赖的支持；使用此类依赖可能会导致构建失败

### 弃用用于支持层次结构的 Gradle 属性

**发生了什么变化？**

在演进过程中，Kotlin 逐渐在多平台项目中引入了对[层次结构](multiplatform-hierarchy.md)的支持，这种能力允许在公共源集 `commonMain` 和任何平台特定的源集（例如 `jvmMain`）之间建立中间源集。

在工具链还不够稳定的过渡期，引入了一些 Gradle 属性，允许进行精细的选择性开启 (opt-in) 和选择性关闭 (opt-out)。

自 Kotlin 1.6.20 起，层次结构项目结构支持已默认启用。然而，保留这些属性是为了在出现阻塞性问题时能够选择性关闭。在处理完所有反馈后，我们现在开始完全淘汰这些属性。

以下属性现已弃用：

* `kotlin.internal.mpp.hierarchicalStructureByDefault`
* `kotlin.mpp.enableCompatibilityMetadataVariant`
* `kotlin.mpp.hierarchicalStructureSupport`
* `kotlin.mpp.enableGranularSourceSetsMetadata`
* `kotlin.native.enableDependencyPropagation`

**现在的最佳做法是什么？**

* 从您的 `gradle.properties` 和 `local.properties` 文件中移除这些属性。
* 避免在 Gradle 构建脚本或 Gradle 插件中通过编程方式设置它们。
* 如果某些属性是由您构建中使用的第三方 Gradle 插件设置的，请要求插件维护者不要设置这些属性。

由于自 Kotlin 1.6.20 以来，Kotlin 工具链的默认行为已不再包含这些属性，因此我们预计不会产生任何严重影响。大多数影响在项目重新构建后会立即显现。

如果您是库作者并希望确保万无一失，请检查消费者是否可以正常使用您的库。

**这些变更何时生效？**

以下是计划的弃用周期：

* 1.8.20：使用弃用的 Gradle 属性时报告警告
* 1.9.20：将此警告提升为错误
* 2.0.0：移除弃用的属性；Kotlin Gradle 插件将忽略它们的使用

如果您在移除这些属性后遇到问题（虽然可能性很小），请在 [YouTrack 中创建问题](https://kotl.in/issue)。

### 弃用 target 预设 API

**发生了什么变化？**

在开发的极早期阶段，Kotlin Multiplatform 引入了用于处理所谓 *target 预设 (target presets)* 的 API。每个 target 预设本质上代表一个 Kotlin Multiplatform 目标的工厂。事实证明该 API 在很大程度上是多余的，因为像 `jvm()` 或 `iosSimulatorArm64()` 这样的 DSL 函数涵盖了相同的用例，且更加直接和简洁。

为了减少困惑并提供更清晰的指导，所有与预设相关的 API 现已在 Kotlin Gradle 插件的公共 API 中弃用。这包括：

* `org.jetbrains.kotlin.gradle.dsl.KotlinMultiplatformExtension` 中的 `presets` 属性
* `org.jetbrains.kotlin.gradle.plugin.KotlinTargetPreset` 接口及其所有继承者
* `fromPreset` 重载

**现在的最佳做法是什么？**

改用相应的 [Kotlin 目标](multiplatform-dsl-reference.md#targets)，例如：

<table>
    
<tr>
<td>之前</td>
        <td>现在</td>
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

**这些变更何时生效？**

以下是计划的弃用周期：

* 1.9.20：对任何预设相关 API 的使用报告警告
* 2.0.0：将此警告提升为错误
* 2.2.0：从 Kotlin Multiplatform Gradle 插件的公共 API 中移除预设相关 API；仍在使用它的源代码将失败并提示“未解析的引用 (unresolved reference)”错误，二进制文件（例如 Gradle 插件）除非针对最新版本的 Kotlin Gradle 插件重新编译，否则可能会因链接错误而失败

### 弃用 Apple 目标快捷方式

**发生了什么变化？**

我们正在弃用 Kotlin Multiplatform DSL 中的 `ios()`、`watchos()` 和 `tvos()` 目标快捷方式。它们的设计初衷是为 Apple 目标部分创建源集层次结构。然而，事实证明它们难以扩展，且有时令人困惑。

例如，`ios()` 快捷方式创建了 `iosArm64` 和 `iosX64` 目标，但不包括 `iosSimulatorArm64` 目标，而后者在 Apple M 芯片的主机上工作时是必需的。然而，更改此快捷方式很难实现，并且可能会在现有的用户项目中引起问题。

**现在的最佳做法是什么？**

Kotlin Gradle 插件现在提供了一个内置的层次结构模板。自 Kotlin 1.9.20 起，它已默认启用，并包含针对流行用例的预定义中间源集。

您应该指定目标列表，而不是使用快捷方式，然后插件会根据此列表自动设置中间源集。

例如，如果您的项目中有 `iosArm64` 和 `iosSimulatorArm64` 目标，插件会自动创建 `iosMain` 和 `iosTest` 中间源集。如果您有 `iosArm64` 和 `macosArm64` 目标，则会创建 `appleMain` 和 `appleTest` 源集。

有关更多信息，请参阅[层次结构项目结构](multiplatform-hierarchy.md)

**这些变更何时生效？**

以下是计划的弃用周期：

* 1.9.20：使用 `ios()`、`watchos()` 和 `tvos()` 目标快捷方式时报告警告；
  取而代之，默认的层次结构模板被启用
* 2.1.0：使用目标快捷方式时报告错误
* 2.2.0：从 Kotlin Multiplatform Gradle 插件中移除目标快捷方式 DSL

### Kotlin 升级后 iOS 框架版本不正确

**问题是什么？**

在使用直接集成时，Kotlin 代码的更改可能无法反映在 Xcode 的 iOS 应用中。直接集成是通过 `embedAndSignAppleFrameworkForXcode` 任务设置的，该任务将多平台项目中的 iOS 框架连接到 Xcode 中的 iOS 应用。

当您在多平台项目中将 Kotlin 版本从 1.9.2x 升级到 2.0.0（或将其从 2.0.0 降级到 1.9.2x）时，可能会发生这种情况。如果您随后更改了 Kotlin 文件并尝试构建应用，Xcode 可能会错误地使用先前版本的 iOS 框架。因此，更改在 Xcode 的 iOS 应用中将不可见。

**解决方法是什么？**

1. 在 Xcode 中，使用 **Product** | **Clean Build Folder** 清理构建目录。
2. 在终端中运行以下命令：

   ```none
   ./gradlew clean
   ```

3. 重新构建应用，以确保使用了新版本的 iOS 框架。

**此问题何时修复？**

我们计划在 Kotlin 2.0.10 中修复此问题。您可以在[参加 Kotlin 抢先体验计划](https://kotlinlang.org/docs/eap.html)章节中查看是否有 Kotlin 2.0.10 的预览版本可用。

有关更多信息，请参阅 [YouTrack 中的对应问题](https://youtrack.jetbrains.com/issue/KT-68257)。

## Kotlin 1.9.0−1.9.25

本节涵盖了结束弃用周期并在 Kotlin 1.9.0−1.9.25 中生效的不兼容变更。

### 移除了直接向 Kotlin 编译添加 Kotlin 源集的 API {initial-collapse-state="collapsed" collapsible="true"}

**发生了什么变化？**

移除了对 `KotlinCompilation.source` 的访问权限。不再支持如下代码：

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

要替换 `KotlinCompilation.source(someSourceSet)`，请使用 `.srcDir()` 函数直接将您的源代码添加到适当的源集中。或者，您可以通过添加从 `KotlinCompilation` 的默认源集到 `someSourceSet` 的 `dependsOn` 关系来创建一个新源集。您也可以直接使用 [源集约定](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.dsl/-kotlin-multiplatform-source-set-conventions/) 来引用源，这在 IDE 中更加友好，被认为是最稳健的方法。最后，您可以使用 `KotlinCompilation.defaultSourceSet.dependsOn(someSourceSet)`，这在所有情况下都有效。

您可以通过以下方式之一修改上述代码：

```kotlin
kotlin {
    jvm()
    js()
    iosArm64()
    iosSimulatorArm64()

    sourceSets {
        val myCustomIntermediateSourceSet by creating {
            // commonMain 源集需要使用 
            // .get() 函数访问
            dependsOn(commonMain.get())
        }

        // 选项 #1. 直接将您的源代码添加到适当的源
        // 集：
        commonMain {
            kotlin.srcDir(layout.projectDirectory.dir("src/commonMain/my-custom-kotlin"))
        }

        // 选项 #2. 使用默认 Kotlin Multiplatform 目标
        // 为其 main 和 test 源集提供的约定：
        jvmMain {
            dependsOn(myCustomIntermediateSourceSet)
        }

        // 选项 #3. 更通用的解决方案。如果您的构建脚本 
        // 需要更高级的方法，请使用此选项：
        targets["jvm"].compilations["main"].defaultSourceSet.dependsOn(myCustomIntermediateSourceSet)
    }
}
```

**这些变更何时生效？**

以下是弃用周期：

* 1.9.0：使用 `KotlinCompilation.source` 时引入弃用警告
* 1.9.20：将此警告提升为错误
* 2.3.0：从 Kotlin Gradle 插件中移除 `KotlinCompilation.source`，尝试使用它会导致在构建脚本编译期间出现“未解析的引用 (unresolved reference)”错误

### 从 `kotlin-js` Gradle 插件迁移到 `kotlin-multiplatform` Gradle 插件 {initial-collapse-state="collapsed" collapsible="true"}

**发生了什么变化？**

从 Kotlin 1.9.0 开始，`kotlin-js` Gradle 插件已被弃用。基本上，它重复了具有 `js()` 目标的 `kotlin-multiplatform` 插件的功能，并且底层共享相同的实现。这种重叠造成了困惑，并增加了 Kotlin 团队的维护负担。我们鼓励您迁移到具有 `js()` 目标的 `kotlin-multiplatform` Gradle 插件。

**现在的最佳做法是什么？**

1. 从项目中移除 `kotlin-js` Gradle 插件，如果您正在使用 `pluginManagement {}` 块，请在 `settings.gradle.kts` 文件中应用 `kotlin-multiplatform`：

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

   如果您使用不同的插件应用方式，请参阅 [Gradle 文档](https://docs.gradle.org/current/userguide/plugins.html) 获取迁移说明。

2. 将您的源文件从 `main` 和 `test` 文件夹移动到同一目录下的 `jsMain` 和 `jsTest` 文件夹中。
3. 调整依赖项声明：

   * 我们建议使用 `sourceSets {}` 块并配置相应源集的依赖项，`jsMain {}` 用于生产依赖项，`jsTest {}` 用于测试依赖项。详情请参阅[添加依赖项](multiplatform-add-dependencies.md)。
   * 但是，如果您想在顶级块中声明依赖项，请将声明从 `api("group:artifact:1.0")` 更改为 `add("jsMainApi", "group:artifact:1.0")` 等。

     > 在这种情况下，请确保顶级 `dependencies {}` 块位于 `kotlin {}` 块**之后**。否则，您将收到错误“未找到配置 (Configuration not found)”。
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
       
       // 选项 #1. 在 sourceSets {} 块中声明依赖项：
       sourceSets {
           val jsMain by getting {
               dependencies {
                   // 此处不需要 js 前缀，您可以直接从顶级块复制并粘贴
                   implementation("org.jetbrains.kotlinx:kotlinx-html:0.8.0")
               }
          }
       }
   }
   
   dependencies {
       // 选项 #2. 在依赖项声明中添加 js 前缀：
       add("jsTestImplementation", kotlin("test"))
   }
   ```

   </TabItem>
   </Tabs>

4. Kotlin Gradle 插件在 `kotlin {}` 块内提供的 DSL 在大多数情况下保持不变。但是，如果您是通过名称引用低级 Gradle 实体（如任务和配置），现在需要对其进行调整，通常是添加 `js` 前缀。例如，您可以在 `jsBrowserTest` 名称下找到 `browserTest` 任务。

**这些变更何时生效？**

以下是 `kotlin-js` Gradle 插件的弃用周期：

* 1.9.0：使用 `kotlin-js` 插件时产生弃用警告
* 2.4.0：[将此警告提升为错误](https://youtrack.jetbrains.com/issue/KT-59305)

### 弃用 `jvmWithJava` 预设 {initial-collapse-state="collapsed" collapsible="true"}

**发生了什么变化？**

`targetPresets.jvmWithJava` 已弃用，不建议使用。

**现在的最佳做法是什么？**

改为使用 `jvm { withJava() }` 目标。请注意，切换到 `jvm { withJava() }` 后，您需要调整带有 `.java` 源代码的源目录路径。

例如，如果您使用默认名称为“jvm”的 `jvm` 目标：

| 之前          | 现在                |
|-----------------|--------------------|
| `src/main/java` | `src/jvmMain/java` |
| `src/test/java` | `src/jvmTest/java` |

**这些变更何时生效？**

以下是计划的弃用周期：

* 1.3.40：使用 `targetPresets.jvmWithJava` 时引入警告
* 1.9.20：将此警告提升为错误
* &gt;1.9.20：移除 `targetPresets.jvmWithJava` API；尝试使用它会导致构建脚本编译失败

> 尽管整个 `targetPresets` API 都已弃用，但 `jvmWithJava` 预设具有不同的弃用时间表。
>
{style="note"}

### 弃用旧版 Android 源集布局 {initial-collapse-state="collapsed" collapsible="true"}

**发生了什么变化？**

自 Kotlin 1.9.0 起，默认使用 [新 Android 源集布局](multiplatform-android-layout.md)。对旧版布局的支持已弃用，使用 `kotlin.mpp.androidSourceSetLayoutVersion` Gradle 属性现在会触发弃用诊断。

**这些变更何时生效？**

以下是弃用周期：

* <=1.9.0：在使用 `kotlin.mpp.androidSourceSetLayoutVersion=1` 时报告警告；可以使用 `kotlin.mpp.androidSourceSetLayoutVersion1.nowarn=true` Gradle 属性来抑制该警告
* 1.9.20：将此警告提升为错误；该错误**无法**被抑制
* 2.4.0：移除对旧版 Android 源集布局的支持并 [移除 `kotlin.mpp.androidSourceSetLayoutVersion=1` Gradle 属性](https://youtrack.jetbrains.com/issue/KT-82265)

### 弃用带有自定义 `dependsOn` 的 `commonMain` 和 `commonTest` {initial-collapse-state="collapsed" collapsible="true"}

**发生了什么变化？**

`commonMain` 和 `commonTest` 源集通常分别代表 `main` 和 `test` 源集层次结构的根。然而，可以通过手动配置这些源集的 `dependsOn` 关系来覆盖这一点。

维护此类配置需要额外的努力，并需要了解多平台构建的内部机制符。此外，它还降低了代码的可读性和可重用性，因为您需要阅读特定的构建脚本才能确定 `commonMain` 是否是 `main` 源集层次结构的根。

因此，在 `commonMain` 和 `commonTest` 上访问 `dependsOn` 现已弃用。

**现在的最佳做法是什么？**

假设您需要将使用 `commonMain.dependsOn(customCommonMain)` 的 `customCommonMain` 源集迁移到 1.9.20。在大多数情况下，`customCommonMain` 参与的编译与 `commonMain` 相同，因此您可以将 `customCommonMain` 合并到 `commonMain` 中：

1. 将 `customCommonMain` 的源代码复制到 `commonMain` 中。
2. 将 `customCommonMain` 的所有依赖项添加到 `commonMain` 中。
3. 将 `customCommonMain` 的所有编译器选项设置添加到 `commonMain` 中。

在极少数情况下，`customCommonMain` 参与的编译可能比 `commonMain` 更多。此类配置需要对构建脚本进行额外的低级配置。如果您不确定这是否是您的用例，那么它很可能不是。

如果这确实是您的用例，请通过将 `customCommonMain` 的源代码和设置移动到 `commonMain`（反之亦然）来“交换”这两个源集。

**这些变更何时生效？**

以下是计划的弃用周期：

* 1.9.0：在 `commonMain` 中使用 `dependsOn` 时报告警告
* &gt;=1.9.20：在 `commonMain` 或 `commonTest` 中使用 `dependsOn` 时报告错误

### 前向声明的新方法 {initial-collapse-state="collapsed" collapsible="true"}

**发生了什么变化？**

JetBrains 团队改进了 Kotlin 中前向声明的处理方式，使其行为更具可预测性：

* 您只能使用 `cnames` 或 `objcnames` 软件包导入前向声明。
* 您需要显式地在相应的 C 和 Objective-C 前向声明之间进行转换 (cast)。

**现在的最佳做法是什么？**

* 假设有一个带有 `library.package` 的 C 库，它声明了一个 `cstructName` 前向声明。以前可以直接从库中导入它：`import library.package.cstructName`。现在，您只能为此使用特殊的前向声明软件包：`import cnames.structs.cstructName`。对于 `objcnames` 也是如此。

* 假设有两个 objcinterop 库：一个使用 `objcnames.protocols.ForwardDeclaredProtocolProtocol`，另一个具有实际定义：

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

  以前可以在它们之间无缝传输对象。现在，前向声明需要显式的 `as` 转换：

  ```kotlin
  // Kotlin 代码：
  fun test() {
      consumeProtocol(produceProtocol() as objcnames.protocols.ForwardDeclaredProtocolProtocol)
  }
  ```

  > 您只能从对应的真实类转换为 `objcnames.protocols.ForwardDeclaredProtocolProtocol`。否则会报错。
  >
  {style="note"}

**这些变更何时生效？**

从 Kotlin 1.9.20 开始，您需要显式地在相应的 C 和 Objective-C 前向声明之间进行转换。此外，现在只能通过使用特殊软件包来导入前向声明。

## Kotlin 1.7.0−1.8.22

本节涵盖了结束弃用周期并在 Kotlin 1.7.0−1.8.22 中生效的不兼容变更。

### 弃用 Kotlin Multiplatform Gradle 插件与 Gradle Java 插件的兼容性 {initial-collapse-state="collapsed" collapsible="true"}

**发生了什么变化？**

由于 Kotlin Multiplatform Gradle 插件与 Gradle 的 [Java](https://docs.gradle.org/current/userguide/java_plugin.html)、[Java Library](https://docs.gradle.org/current/userguide/java_library_plugin.html) 和 [Application](https://docs.gradle.org/current/userguide/application_plugin.html) 插件之间存在兼容性问题，现在当您在同一个项目中应用这些插件时会发出弃用警告。当多平台项目中的另一个 Gradle 插件应用了 Gradle Java 插件时，该警告也会出现。例如，[Spring Boot Gradle 插件](https://docs.spring.io/spring-boot/gradle-plugin/index.html) 会自动应用 Application 插件。

我们添加此弃用警告是因为 Kotlin Multiplatform 项目模型与 Gradle Java 生态系统插件之间存在根本性的兼容性问题。Gradle 的 Java 生态系统插件目前没有考虑到其他插件可能：

* 也会以与 Java 生态系统插件不同的方式为 JVM 目标进行发布或编译。
* 在同一个项目中有两个不同的 JVM 目标，例如 JVM 和 Android。
* 具有复杂的多平台项目结构，可能包含多个非 JVM 目标。

不幸的是，Gradle 目前没有提供任何 API 来解决这些问题。

我们此前在 Kotlin Multiplatform 中使用了一些权宜之计来帮助集成 Java 生态系统插件。然而，这些变通方法从未真正解决兼容性问题，且自 Gradle 8.8 发布以来，这些变通方法已不再可行。有关更多信息，请参阅我们的 [YouTrack 问题](https://youtrack.jetbrains.com/issue/KT-66542/Gradle-JVM-target-with-withJava-produces-a-deprecation-warning)。

虽然我们尚不确定如何解决此兼容性问题，但我们致力于在 Kotlin Multiplatform 项目中继续支持某种形式的 Java 源代码编译。至少我们将支持 Java 源代码的编译，并支持在您的多平台项目中使用 Gradle 的 [`java-base`](https://docs.gradle.org/current/javadoc/org/gradle/api/plugins/JavaBasePlugin.html) 插件。

**现在的最佳做法是什么？**

如果您在多平台项目中看到此弃用警告，我们建议您：
1. 确定您的项目中是否真的需要 Gradle Java 插件。如果不需要，请考虑将其移除。
2. 检查 Gradle Java 插件是否仅用于单个任务。如果是，您也许可以毫不费力地移除该插件。例如，如果该任务使用 Gradle Java 插件来创建 Javadoc JAR 文件，您可以改为手动定义 Javadoc 任务。

否则，如果您想在多平台项目中同时使用 Kotlin Multiplatform Gradle 插件和这些 Gradle Java 插件，我们建议您：

1. 在您的 Gradle 项目中创建一个单独的子项目。
2. 在该单独的子项目中，应用 Java Gradle 插件。
3. 在该单独的子项目中，添加对父级多平台项目的依赖。

> 该单独的子项目**不能**是多平台项目，且您只能使用它来建立对多平台项目的依赖。
>
{style="warning"}

例如，您有一个名为 `my-main-project` 的多平台项目，且您想使用 [Java Library](https://docs.gradle.org/current/userguide/java_library_plugin.html) Gradle 插件。

创建子项目（假设名为 `subproject-A`）后，您的父项目结构应如下所示：

```text
.
├── build.gradle
├── settings.gradle.kts
├── subproject-A
    └── build.gradle.kts
    └── src
        └── Main.java
```

在子项目的 `build.gradle.kts` 文件中，于 `plugins {}` 块内应用 Java Library 插件：

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

在子项目的 `build.gradle.kts` 文件中，添加对父级多平台项目的依赖：

<Tabs group="build-script">
<TabItem title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    implementation(project(":my-main-project")) // 您的父级多平台项目名称
}
```

</TabItem>
<TabItem title="Groovy" group-key="groovy">

```groovy
dependencies {
    implementation project(':my-main-project') // 您的父级多平台项目名称
}
```

</TabItem>
</Tabs>

您的父项目现在已设置为可同时使用这两个插件。

### 自动生成的目标的新方法 {initial-collapse-state="collapsed" collapsible="true"}

**发生了什么变化？**

由 Gradle 自动生成的目标访问器在 `kotlin.targets {}` 块内不再可用。请改用 `findByName("targetName")` 方法。

请注意，此类访问器在 `kotlin.targets {}` 情况下仍然可用，例如 `kotlin.targets.linuxX64`。

**现在的最佳做法是什么？**

<table>
    
<tr>
<td>之前</td>
        <td>现在</td>
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

**这些变更何时生效？**

在 Kotlin 1.7.20 中，在 `kotlin.targets {}` 块中使用目标访问器时会引入错误。

有关更多信息，请参阅 [YouTrack 中的对应问题](https://youtrack.jetbrains.com/issue/KT-47047)。

### Gradle 编译任务的输入与输出变化 {initial-collapse-state="collapsed" collapsible="true"}

**发生了什么变化？**

Kotlin 编译任务不再继承具有 `sourceCompatibility` 和 `targetCompatibility` 输入的 Gradle `AbstractCompile` 任务，这使得这些输入在 Kotlin 用户脚本中不可用。

编译任务中的其他破坏性变更：

**现在的最佳做法是什么？**

| 之前                                                              | 现在                                                                                                            |
|---------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| `SourceTask.stableSources` 输入不再可用。        | 请改用 `sources` 输入。此外，`setSource()` 方法仍然可用。                          |
| `sourceFilesExtensions` 输入已被移除。                      | 编译任务仍然实现 `PatternFilterable` 接口。使用其方法过滤 Kotlin 源代码。 |
| Gradle `destinationDir: File` 输出已弃用。            | 请改用 `destinationDirectory: DirectoryProperty` 输出。                                              |
| `KotlinCompile` 任务的 `classpath` 属性已弃用。 | 所有编译任务现在都使用 `libraries` 输入来获取编译所需的库列表。              |

**这些变更何时生效？**

在 Kotlin 1.7.20 中，输入不可用，输出被替换，且 `classpath` 属性被弃用。

有关更多信息，请参阅 [YouTrack 中的对应问题](https://youtrack.jetbrains.com/issue/KT-32805)。

### 编译依赖项的新配置名称 {initial-collapse-state="collapsed" collapsible="true"}

**发生了什么变化？**

由 Kotlin Multiplatform Gradle 插件创建的编译配置获得了新名称。

Kotlin Multiplatform 项目中的一个目标有两个默认编译：`main` 和 `test`。每个编译都有自己的默认源集，例如 `jvmMain` 和 `jvmTest`。以前，测试编译及其默认源集的配置名称相同，这可能会导致名称冲突，从而在包含标记有平台特定特性 (attributes) 的配置时产生问题。

现在，编译配置具有额外的 `Compilation` 后缀，而使用旧硬编码配置名称的项目和插件将无法再进行编译。

对应源集的依赖项配置名称保持不变。

**现在的最佳做法是什么？**

<table>
    
<tr>
<td></td>
        <td>之前</td>
        <td>现在</td>
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

可用作用域包括 `Api`、`Implementation`、`CompileOnly` 和 `RuntimeOnly`。

**这些变更何时生效？**

在 Kotlin 1.8.0 中，在硬编码字符串中使用旧配置名称时会引入错误。

有关更多信息，请参阅 [YouTrack 中的对应问题](https://youtrack.jetbrains.com/issue/KT-35916/)。