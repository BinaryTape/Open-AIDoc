[//]: # (title: Kotlin Gradle 插件中的编译器选项)

每个 Kotlin 版本都包含适用于所支持目标的编译器：
JVM、JavaScript 以及针对[支持的平台](native-overview.md#target-platforms)的原生二进制文件。

这些编译器被以下工具使用：
* 当您在 IDE 中为 Kotlin 项目点击 **Compile**（编译）或 **Run**（运行）按钮时。
* Gradle，当您在控制台或 IDE 中调用 `gradle build` 时。
* Maven，当您在控制台或 IDE 中调用 `mvn compile` 或 `mvn test-compile` 时。

您也可以按照[使用命令行编译器](command-line.md)教程中的说明，从命令行手动运行 Kotlin 编译器。

## 如何定义选项 {id="how-to-define-options"}

Kotlin 编译器具有许多用于调整编译过程的选项。 

Gradle DSL 允许对编译器选项进行全面配置。它适用于 [Kotlin 多平台](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#compiler-options)和 [JVM/Android](#target-the-jvm) 项目。

通过 Gradle DSL，您可以在构建脚本中的三个层级配置编译器选项： 
* **[扩展层级](#extension-level)**：在 `kotlin {}` 块中为所有目标和共享源集配置。
* **[目标层级](#target-level)**：在特定目标的块中配置。
* **[编译单元层级](#compilation-unit-level)**：通常在特定的编译任务中配置。

![Kotlin 编译器选项层级](compiler-options-levels.svg){width=700}

较高级别的设置被用作较低级别的约定（默认值）：

* 在扩展层级设置的编译器选项是目标层级选项的默认值，包括 `commonMain`、`nativeMain` 和 `commonTest` 等共享源集。
* 在目标层级设置的编译器选项是编译单元（任务）层级选项的默认值，例如 `compileKotlinJvm` 和 `compileTestKotlinJvm` 任务。

反之，在较低层级进行的配置会覆盖较高级别的相关设置：

* 任务级编译器选项会覆盖目标或扩展层级的相关配置。
* 目标级编译器选项会覆盖扩展层级的相关配置。

要找出编译中应用了哪一级的编译器参数，请使用 Gradle [日志记录](https://docs.gradle.org/current/userguide/logging.html)的 `DEBUG` 级别。
对于 JVM 和 JS/WASM 任务，在日志中搜索 `"Kotlin compiler args:"` 字符串；对于原生任务，搜索 `"Arguments ="` 字符串。

> 如果您是第三方插件作者，最好在项目级别应用您的配置，以避免覆盖问题。您可以为此使用新的 [Kotlin 插件 DSL 扩展类型](whatsnew21.md#new-api-for-kotlin-gradle-plugin-extensions)。建议您在自己的一侧明确记录此配置。
>
{style="tip"}

### 扩展层级 {id="extension-level"}

您可以在顶层的 `compilerOptions {}` 块中为所有目标和共享源集配置通用编译器选项：

```kotlin
kotlin {
    compilerOptions {
        optIn.add("kotlin.RequiresOptIn")
    }
}
```

### 目标层级 {id="target-level"}

您可以在 `target {}` 块内的 `compilerOptions {}` 块中配置 JVM/Android 目标的编译器选项：

```kotlin
kotlin {
    target {
        compilerOptions {
            optIn.add("kotlin.RequiresOptIn")
        }
    }
}
```

在 Kotlin 多平台项目中，您可以在特定的目标内部配置编译器选项。例如：`jvm { compilerOptions {}}`。有关更多信息，请参阅[多平台 Gradle DSL 参考](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)。

### 编译单元层级 {id="compilation-unit-level"}

您可以在任务配置内的 `compilerOptions {}` 块中为特定的编译单元或任务配置编译器选项：

```kotlin
tasks.named<KotlinJvmCompile>("compileKotlin"){
    compilerOptions {
        optIn.add("kotlin.RequiresOptIn")
    }
}
```

您还可以通过 `KotlinCompilation` 在编译单元层级访问并配置编译器选项：

```kotlin
kotlin {
    target {
        val main by compilations.getting {
            compileTaskProvider.configure {
                compilerOptions {
                    optIn.add("kotlin.RequiresOptIn")
                }
            }
        }
    }
}
```

如果您想配置 JVM/Android 和 [Kotlin 多平台](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)之外的目标插件，请使用相应 Kotlin 编译任务的 `compilerOptions {}` 属性。以下示例显示了如何在 Kotlin 和 Groovy DSL 中进行此配置：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.named("compileKotlin", org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask::class.java) {
    compilerOptions {
        apiVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_0)
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.named('compileKotlin', org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask.class) {
    compilerOptions {
        apiVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_0)
    }
}
```

</tab>
</tabs>

### 从 `kotlinOptions {}` 迁移到 `compilerOptions {}` {initial-collapse-state="collapsed" collapsible="true" id="migrate-from-kotlinoptions-to-compileroptions"}

在 Kotlin 2.2.0 之前，您可以使用 `kotlinOptions {}` 块配置编译器选项。由于 `kotlinOptions {}` 块从 Kotlin 2.0.0 开始已弃用，本节为您提供指导和建议，帮助您将构建脚本迁移到使用 `compilerOptions {}` 块：

* [集中编译器选项并使用类型](#centralize-compiler-options-and-use-types)
* [从 `android.kotlinOptions` 迁离](#migrate-away-from-android-kotlinoptions)
* [迁移 `freeCompilerArgs`](#migrate-freecompilerargs)

#### 集中编译器选项并使用类型 {id="centralize-compiler-options-and-use-types"}

尽可能在[扩展层级](#extension-level)配置编译器选项，并在[编译单元层级](#compilation-unit-level)为特定任务覆盖它们。

您不能在 `compilerOptions {}` 块中使用原始字符串，因此请将它们转换为类型化值。例如，如果您有：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("jvm") version "%kotlinVersion%"
}

tasks.withType<KotlinCompile>().configureEach {
    kotlinOptions {
        jvmTarget = "%jvmLTSVersionSupportedByKotlin%"
        languageVersion = "%languageVersion%"
        apiVersion = "%apiVersion%"
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
plugins {
    id 'org.jetbrains.kotlin.jvm' version '%kotlinVersion%'
}

tasks.withType(KotlinCompile).configureEach {
    kotlinOptions {
        jvmTarget = '%jvmLTSVersionSupportedByKotlin%'
        languageVersion = '%languageVersion%'
        apiVersion = '%apiVersion%'
    }
}
```

</tab>
</tabs>

迁移后，代码应为：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.dsl.KotlinVersion

plugins {
    kotlin("jvm") version "%kotlinVersion%"
}

kotlin {
    // 扩展层级
    compilerOptions {
        jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
        languageVersion = KotlinVersion.fromVersion("%languageVersion%")
        apiVersion = KotlinVersion.fromVersion("%apiVersion%")
    }
}

// 在编译单元层级覆盖的示例
tasks.named<KotlinJvmCompile>("compileKotlin"){
    compilerOptions {
        apiVersion = KotlinVersion.fromVersion("%apiVersion%")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.dsl.KotlinVersion

plugins {
    id 'org.jetbrains.kotlin.jvm' version '%kotlinVersion%'
}

kotlin {
  // 扩展层级
    compilerOptions {
        jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
        languageVersion = KotlinVersion.fromVersion("%languageVersion%")
        apiVersion = KotlinVersion.fromVersion("%apiVersion%")
    }
}

// 在编译单元层级覆盖的示例
tasks.named("compileKotlin", KotlinJvmCompile).configure {
    compilerOptions {
        apiVersion = KotlinVersion.fromVersion("%apiVersion%")
    }
}
```

</tab>
</tabs>

#### 从 `android.kotlinOptions` 迁离 {id="migrate-away-from-android-kotlinoptions"}

如果您的构建脚本之前使用的是 `android.kotlinOptions`，请迁移到 `kotlin.compilerOptions`。可以在扩展层级或目标层级进行迁移。

例如，如果您有一个 Android 项目：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    id("com.android.application")
    kotlin("android")
}

android {
    kotlinOptions {
        jvmTarget = "%jvmLTSVersionSupportedByKotlin%"
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    kotlinOptions {
        jvmTarget = '%jvmLTSVersionSupportedByKotlin%'
    }
}
```
</tab>
</tabs>

将其更新为：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    id("com.android.application")
    kotlin("android")
}

kotlin {
    compilerOptions {
        jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

kotlin {
    compilerOptions {
        jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
    }
}
```

</tab>
</tabs>

又例如，如果您有一个带有 Android 目标的 Kotlin 多平台项目：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform")
    id("com.android.application")
}

kotlin {
    androidTarget {
        compilations.all {
            kotlinOptions.jvmTarget = "%jvmLTSVersionSupportedByKotlin%"
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
plugins {
    id 'org.jetbrains.kotlin.multiplatform'
    id 'com.android.application'
}

kotlin {
    androidTarget {
        compilations.all {
            kotlinOptions {
                jvmTarget = '%jvmLTSVersionSupportedByKotlin%'
            }
        }
    }
}
```

</tab>
</tabs>

将其更新为：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform")
    id("com.android.application")
}

kotlin {
    androidTarget {
        compilerOptions {
            jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
plugins {
    id 'org.jetbrains.kotlin.multiplatform'
    id 'com.android.application'
}

kotlin {
    androidTarget {
        compilerOptions {
            jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
        }
    }
}
```

</tab>
</tabs>

#### 迁移 `freeCompilerArgs` {id="migrate-freecompilerargs"}

* 将所有 `+=` 操作替换为 `add()` 或 `addAll()` 函数。
* 如果您使用 `-opt-in` 编译器选项，请检查 [KGP API 参考](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/)中是否已有专用的 DSL，并改用它。
* 将任何对 `-progressive` 编译器选项的使用迁移到专用 DSL：`progressiveMode.set(true)`。
* 将任何对 `-Xjvm-default` 编译器选项的使用迁移到[使用专用 DSL](gradle-compiler-options.md#attributes-specific-to-jvm)：`jvmDefault.set()`。使用以下选项映射：

  | 之前 | 之后 |
  |-----------------------------------|---------------------------------------------------|
  | `-Xjvm-default=all-compatibility` | `jvmDefault.set(JvmDefaultMode.ENABLE)`           |
  | `-Xjvm-default=all`               | `jvmDefault.set(JvmDefaultMode.NO_COMPATIBILITY)` | 
  | `-Xjvm-default=disable`           | `jvmDefault.set(JvmDefaultMode.DISABLE)`          |

例如，如果您有：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlinOptions {
    freeCompilerArgs += "-opt-in=kotlin.RequiresOptIn"
    freeCompilerArgs += listOf("-Xcontext-receivers", "-Xinline-classes", "-progressive", "-Xjvm-default=all")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
kotlinOptions {
    freeCompilerArgs += "-opt-in=kotlin.RequiresOptIn"
    freeCompilerArgs += ["-Xcontext-receivers", "-Xinline-classes", "-progressive", "-Xjvm-default=all"]
}
```

</tab>
</tabs>

迁移到：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    compilerOptions {
        optIn.add("kotlin.RequiresOptIn")
        freeCompilerArgs.addAll(listOf("-Xcontext-receivers", "-Xinline-classes"))
        progressiveMode.set(true)
        jvmDefault.set(JvmDefaultMode.NO_COMPATIBILITY)
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
kotlin {
    compilerOptions {
        optIn.add("kotlin.RequiresOptIn")
        freeCompilerArgs.addAll(["-Xcontext-receivers", "-Xinline-classes"])
        progressiveMode.set(true)
        jvmDefault.set(JvmDefaultMode.NO_COMPATIBILITY)
    }
}
```

</tab>
</tabs>

## 针对 JVM {id="target-the-jvm"}

[如前所述](#how-to-define-options)，您可以为 JVM/Android 项目在扩展、目标和编译单元层级（任务）定义编译器选项。

默认的 JVM 编译任务对于生产代码称为 `compileKotlin`，对于测试代码称为 `compileTestKotlin`。自定义源集的任务根据其 `compile<Name>Kotlin` 模式命名。

您可以通过在终端运行 `gradlew tasks --all` 命令并搜索 `Other tasks` 组中的 `compile*Kotlin` 任务名称，查看 Android 编译任务列表。

需要注意的一些重要细节：

* `kotlin.compilerOptions` 配置项目中的每个 Kotlin 编译任务。
* 您可以使用 `tasks.named<KotlinJvmCompile>("compileKotlin") { }`（或 `tasks.withType<KotlinJvmCompile>().configureEach { }`）方法覆盖由 `kotlin.compilerOptions` DSL 应用的配置。

## 针对 JavaScript {id="target-javascript"}

JavaScript 编译任务对于生产代码称为 `compileKotlinJs`，对于测试代码称为 `compileTestKotlinJs`，对于自定义源集称为 `compile<Name>KotlinJs`。

要配置单个任务，请使用其名称：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

val compileKotlin: KotlinCompilationTask<*> by tasks

compileKotlin.compilerOptions.suppressWarnings.set(true)
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named('compileKotlin', KotlinCompilationTask) {
    compilerOptions {
        suppressWarnings = true
    }
}
```

</tab>
</tabs>

请注意，对于 Gradle Kotlin DSL，您应该先从项目的 `tasks` 中获取该任务。

分别为 JS 和公共目标使用 `Kotlin2JsCompile` 和 `KotlinCompileCommon` 类型。

您可以通过在终端运行 `gradlew tasks --all` 命令并搜索 `Other tasks` 组中的 `compile*KotlinJS` 任务名称，查看 JavaScript 编译任务列表。

## 所有 Kotlin 编译任务 {id="all-kotlin-compilation-tasks"}

也可以配置项目中的所有 Kotlin 编译任务：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named<KotlinCompilationTask<*>>("compileKotlin").configure {
    compilerOptions { /*...*/ }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named('compileKotlin', KotlinCompilationTask) {
    compilerOptions { /*...*/ }
}
```

</tab>
</tabs>

## 所有编译器选项 {id="all-compiler-options"}

以下是 Gradle 编译器的完整选项列表：

### 通用属性 {id="common-attributes"}

| 名称 | 描述 | 可能的值 | 默认值 |
|-------------------|----------------------------------------------------------------------------------------------------------------------------------------|---------------------------|---------------|
| `optIn` | 用于配置[选择性加入编译器参数](opt-in-requirements.md)列表的属性 | `listOf( /* 选择性加入列表 */ )` | `emptyList()` |
| `progressiveMode` | 启用[编译器渐进模式](whatsnew13.md#progressive-mode) | `true`, `false` | `false` |
| `extraWarnings` | 启用[额外的声明、表达式和类型编译器检查](whatsnew21.md#extra-compiler-checks)，如果为 true 则会发出警告 | `true`, `false` | `false` |

### JVM 特有属性 {id="attributes-specific-to-jvm"}

| 名称 | 描述 | 可能的值 | 默认值 |
|---------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|-----------------------------|
| `javaParameters` | 为方法参数生成适用于 Java 1.8 反射的元数据 | | false |
| `jvmTarget` | 生成的 JVM 字节码的目标版本 | "1.8", "9", "10", ..., "25", 26"。另请参阅[编译器选项的类型](#types-for-compiler-options) | "%defaultJvmTargetVersion%" |
| `noJdk` | 不要自动将 Java 运行时包含到类路径中 | | false |
| `jvmTargetValidationMode` | <list><li>验证 Kotlin 和 Java 之间的 [JVM 目标兼容性](gradle-configure-project.md#check-for-jvm-target-compatibility-of-related-compile-tasks)</li><li>`KotlinCompile` 类型任务的一个属性。</li></list> | `WARNING`, `ERROR`, `IGNORE` | `ERROR` |
| `jvmDefault` | 控制如何将在接口中声明的函数编译为 JVM 上的默认方法 | `ENABLE`, `NO_COMPATIBILITY`, `DISABLE` | `ENABLE` |

### JVM 和 JavaScript 通用属性 {id="attributes-common-to-jvm-and-javascript"}

| 名称 | 描述 | 可能的值 | 默认值 |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------|---------------|
| `allWarningsAsErrors` | 如果有任何警告，则报告错误 | | false |
| `suppressWarnings` | 不生成警告 | | false |
| `verbose` | 启用详细日志记录输出。仅当[启用 Gradle 调试日志级别](https://docs.gradle.org/current/userguide/logging.html)时有效 | | false |
| `freeCompilerArgs` | 附加编译器参数列表。您也可以在这里使用实验性的 `-X` 参数。请参阅[示例](#example-of-additional-arguments-usage-via-freecompilerargs) | | [] |
| `apiVersion` | 控制您的代码可以使用哪些 Kotlin API。有关更多信息，请参阅 [`-api-version`](compiler-reference.md#api-version-version)。 | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL) | |
| `languageVersion` | 控制编译期间可用的 Kotlin 语言功能和语法。有关更多信息，请参阅 [`-language-version`](compiler-reference.md#language-version-version)。 | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL) | |

> 我们将在未来的版本中弃用 `freeCompilerArgs` 属性。如果您在 Kotlin Gradle DSL 中缺少某些选项，请[提交问题 (issue)](https://youtrack.jetbrains.com/newissue?project=kt)。
>
{style="warning"}

#### 通过 freeCompilerArgs 使用附加参数的示例 {initial-collapse-state="collapsed" collapsible="true" id="example-of-additional-arguments-usage-via-freecompilerargs"}

使用 `freeCompilerArgs` 属性提供附加（包括实验性）编译器参数。您可以向此属性添加单个参数或参数列表：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

kotlin {
    compilerOptions {
        // 指定 Kotlin API 的版本和 JVM 目标
        apiVersion.set(KotlinVersion.%gradleLanguageVersion%)
        jvmTarget.set(JvmTarget.JVM_1_8)
        
        // 单个实验性参数
        freeCompilerArgs.add("-Xexport-kdoc")

        // 单个附加参数
        freeCompilerArgs.add("-Xno-param-assertions")

        // 参数列表
        freeCompilerArgs.addAll(
            listOf(
                "-Xno-receiver-assertions",
                "-Xno-call-assertions"
            )
        ) 
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named('compileKotlin', KotlinCompilationTask) {
    compilerOptions {
        // 指定 Kotlin API 的版本和 JVM 目标
        apiVersion = KotlinVersion.%gradleLanguageVersion%
        jvmTarget = JvmTarget.JVM_1_8
        
        // 单个实验性参数
        freeCompilerArgs.add("-Xexport-kdoc")
        
        // 单个附加参数，可以是键值对
        freeCompilerArgs.add("-Xno-param-assertions")
        
        // 参数列表
        freeCompilerArgs.addAll(["-Xno-receiver-assertions", "-Xno-call-assertions"])
    }
}
```

</tab>
</tabs>

> `freeCompilerArgs` 属性在[扩展](#extension-level)、[目标](#target-level)和[编译单元（任务）](#compilation-unit-level)层级均可用。
>
{style="tip"} 

#### 设置 languageVersion 的示例 {initial-collapse-state="collapsed" collapsible="true" id="example-of-setting-languageversion"}

要设置语言版本，请使用以下语法：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    compilerOptions {
        languageVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.%gradleLanguageVersion%)
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks
    .withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask.class)
    .configureEach {
        compilerOptions.languageVersion =
            org.jetbrains.kotlin.gradle.dsl.KotlinVersion.%gradleLanguageVersion%
    }
```

</tab>
</tabs>

另请参阅[编译器选项的类型](#types-for-compiler-options)。

### JavaScript 特有属性 {id="attributes-specific-to-javascript"}

| 名称 | 描述 | 可能的值 | 默认值 |
|---|---|---|---|
| `friendModulesDisabled` | 禁用内部声明导出 | | `false` |
| `main` | 指定执行时是否应调用 `main` 函数 | `JsMainFunctionExecutionMode.CALL`, `JsMainFunctionExecutionMode.NO_CALL` | `JsMainFunctionExecutionMode.CALL` |
| `moduleKind` | 编译器生成的 JS 模块类型 | `JsModuleKind.MODULE_AMD`, `JsModuleKind.MODULE_PLAIN`, `JsModuleKind.MODULE_ES`, `JsModuleKind.MODULE_COMMONJS`, `JsModuleKind.MODULE_UMD` | `null` |
| `sourceMap` | 生成源代码映射 | | `false` |
| `sourceMapEmbedSources` | 将源文件嵌入到源代码映射中 | `JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_INLINING`, `JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_NEVER`, `JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_ALWAYS` | `null` |
| `sourceMapNamesPolicy` | 将您在 Kotlin 代码中声明的变量和函数名称添加到源代码映射中。有关行为的更多信息，请参阅我们的[编译器参考](compiler-reference.md#source-map-names-policy-simple-names-fully-qualified-names-no) | `JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_FQ_NAMES`, `JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_SIMPLE_NAMES`, `JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_NO` | `null` |
| `sourceMapPrefix` | 将指定的前缀添加到源代码映射中的路径 | | `null` |
| `target` | 为特定的 ECMA 版本生成 JS 文件 | `"es5"`, `"es2015"`, `"es2020"` | `"es5"` |
| `useEsClasses` | 让生成的 JavaScript 代码使用 ES2015 类。在使用 ES2015 和 ES2020 目标的情况下默认启用 | | `null` |

### 编译器选项的类型 {id="types-for-compiler-options"}

某些 `compilerOptions` 使用新类型而不是 `String` 类型：

| 选项 | 类型 | 示例 |
|------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| `jvmTarget` | [`JvmTarget`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JvmTarget.kt) | `compilerOptions.jvmTarget.set(JvmTarget.JVM_11)` |
| `apiVersion` 和 `languageVersion` | [`KotlinVersion`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/KotlinVersion.kt) | `compilerOptions.languageVersion.set(KotlinVersion.%gradleLanguageVersion%)` |
| `main` | [`JsMainFunctionExecutionMode`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsMainFunctionExecutionMode.kt) | `compilerOptions.main.set(JsMainFunctionExecutionMode.NO_CALL)` |
| `moduleKind` | [`JsModuleKind`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsModuleKind.kt) | `compilerOptions.moduleKind.set(JsModuleKind.MODULE_ES)` |
| `sourceMapEmbedSources` | [`JsSourceMapEmbedMode`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsSourceMapEmbedMode.kt) | `compilerOptions.sourceMapEmbedSources.set(JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_INLINING)` |
| `sourceMapNamesPolicy` | [`JsSourceMapNamesPolicy`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsSourceMapNamesPolicy.kt) | `compilerOptions.sourceMapNamesPolicy.set(JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_FQ_NAMES)` |

## 接下来的步骤 {id="what-s-next"}

详细了解：
* [Kotlin 多平台 DSL 参考](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)。
* [增量编译、缓存支持、构建报告和 Kotlin 守护进程](gradle-compilation-and-caches.md)。
* [Gradle 基础知识和细节](https://docs.gradle.org/current/userguide/userguide.html)。
* [对 Gradle 插件变体的支持](gradle-plugin-variants.md)。