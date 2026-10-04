[//]: # (title: Kotlin Gradle 插件中的编译器选项)

Kotlin 的每个版本都包含针对受支持目标的编译器：
JVM、JavaScript 以及针对[受支持平台](native-overview.md#target-platforms)的原生二进制文件。

以下工具会使用这些编译器：
* IDE：当你在 Kotlin 项目中点击 __Compile__ 或 __Run__ 按钮时。
* Gradle：当你在控制台或 IDE 中调用 `gradle build` 时。
* Maven：当你在控制台或 IDE 中调用 `mvn compile` 或 `mvn test-compile` 时。

你还可以按照[使用命令行编译器](command-line.md)教程中所述，从命令行手动运行 Kotlin 编译器。

## 如何定义选项 {id="how-to-define-options"}

Kotlin 编译器提供了许多用于定制编译过程的选项。

Gradle DSL 允许对编译器选项进行全面的配置。它适用于 [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#compiler-options) 和 [JVM/Android](#target-the-jvm) 项目。

通过 Gradle DSL，你可以在构建脚本中分三个级别配置编译器选项：
* **[扩展级别](#extension-level)**：在 `kotlin {}` 块中为所有目标和共享源集进行配置。
* **[目标级别](#target-level)**：在特定目标的块中进行配置。
* **[编译单元级别](#compilation-unit-level)**：通常在特定的编译任务中进行配置。

![Kotlin 编译器选项级别](compiler-options-levels.svg){width=700}

较高级别的设置会作为较低级别的惯例（默认值）：

* 在扩展级别设置的编译器选项是目标级别选项的默认值，包括像 `commonMain`、`nativeMain` 和 `commonTest` 这样的共享源集。
* 在目标级别设置的编译器选项是编译单元（任务）级别选项的默认值，比如 `compileKotlinJvm` 和 `compileTestKotlinJvm` 任务。

反过来，在较低级别进行的配置会覆盖较高级别的相关设置：

* 任务级别的编译器选项会覆盖目标级别或扩展级别的相关配置。
* 目标级别的编译器选项会覆盖扩展级别的相关配置。

要查明哪个级别的编译器实参应用到了编译中，请使用 Gradle [日志记录](https://docs.gradle.org/current/userguide/logging.html)的 `DEBUG` 级别。
对于 JVM 和 JS/WASM 任务，在日志中搜索 `"Kotlin compiler args:"` 字符串；对于 Native 任务，搜索 `"Arguments ="` 字符串。

> 如果你是第三方插件作者，最好在项目级别应用配置以避免覆盖问题。你可以为此使用新的 [Kotlin 插件 DSL 扩展类型](whatsnew21.md#new-api-for-kotlin-gradle-plugin-extensions)。建议你在自己的文档中明确记录此配置。
>
{style="tip"}

### 扩展级别 {id="extension-level"}

你可以在顶层的 `compilerOptions {}` 块中为所有目标和共享源集配置通用编译器选项：

```kotlin
kotlin {
    compilerOptions {
        optIn.add("kotlin.RequiresOptIn")
    }
}
```

### 目标级别 {id="target-level"}

你可以在 `target {}` 块内的 `compilerOptions {}` 块中为 JVM/Android 目标配置编译器选项：

```kotlin
kotlin {
    target {
        compilerOptions {
            optIn.add("kotlin.RequiresOptIn")
        }
    }
}
```

在 Kotlin Multiplatform 项目中，你可以在特定目标内部配置编译器选项。例如：`jvm { compilerOptions {}}`。有关更多信息，请参阅 [Multiplatform Gradle DSL 参考](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)。

### 编译单元级别 {id="compilation-unit-level"}

你可以在任务配置内的 `compilerOptions {}` 块中为特定编译单元或任务配置编译器选项：

```kotlin
tasks.named<KotlinJvmCompile>("compileKotlin"){
    compilerOptions {
        optIn.add("kotlin.RequiresOptIn")
    }
}
```

你还可以通过 `KotlinCompilation` 在编译单元级别访问和配置编译器选项：

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

如果你想要配置不同于 JVM/Android 和 [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html) 目标的插件，请使用对应 Kotlin 编译任务的 `compilerOptions {}` 属性。以下示例展示了如何在 Kotlin 和 Groovy DSL 中设置此配置：

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

在 Kotlin 2.2.0 之前，你可以使用 `kotlinOptions {}` 块配置编译器选项。由于 `kotlinOptions {}` 块自 Kotlin 2.0.0 起已弃用，本节提供了将构建脚本迁移为改用 `compilerOptions {}` 块的指南和建议：

* [集中管理编译器选项并使用类型](#centralize-compiler-options-and-use-types)
* [从 `android.kotlinOptions` 迁移](#migrate-away-from-android-kotlinoptions)
* [迁移 `freeCompilerArgs`](#migrate-freecompilerargs)

#### 集中管理编译器选项并使用类型 {id="centralize-compiler-options-and-use-types"}

尽可能在[扩展级别](#extension-level)配置编译器选项，并在[编译单元级别](#compilation-unit-level)针对特定任务进行覆盖。

你不能在 `compilerOptions {}` 块中使用原始字符串，因此需要将它们转换为类型化值。例如，如果原来是：

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

迁移后应为：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.dsl.KotlinVersion

plugins {
    kotlin("jvm") version "%kotlinVersion%"
}

kotlin {
    // 扩展级别
    compilerOptions {
        jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
        languageVersion = KotlinVersion.fromVersion("%languageVersion%")
        apiVersion = KotlinVersion.fromVersion("%apiVersion%")
    }
}

// 在编译单元级别进行覆盖的示例
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
  // 扩展级别
    compilerOptions {
        jvmTarget = JvmTarget.fromTarget("%jvmLTSVersionSupportedByKotlin%")
        languageVersion = KotlinVersion.fromVersion("%languageVersion%")
        apiVersion = KotlinVersion.fromVersion("%apiVersion%")
    }
}

// 在编译单元级别进行覆盖的示例
tasks.named("compileKotlin", KotlinJvmCompile).configure {
    compilerOptions {
        apiVersion = KotlinVersion.fromVersion("%apiVersion%")
    }
}
```

</tab>
</tabs>

#### 从 `android.kotlinOptions` 迁移 {id="migrate-away-from-android-kotlinoptions"}

如果你的构建脚本先前使用了 `android.kotlinOptions`，请迁移为改用 `kotlin.compilerOptions`（在扩展级别或目标级别）。

例如，如果你有一个 Android 项目：

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

又如，如果你有一个带有 Android 目标的 Kotlin Multiplatform 项目：

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
* 如果你使用了 `-opt-in` 编译器选项，请检查 [KGP API 参考](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/)中是否已有专用的 DSL，并改用该 DSL。
* 将所有使用 `-progressive` 编译器选项的地方迁移为使用专用 DSL：`progressiveMode.set(true)`。
* 将所有使用 `-Xjvm-default` 编译器选项的地方迁移为[使用专用 DSL](gradle-compiler-options.md#attributes-specific-to-jvm)：`jvmDefault.set()`。选项映射如下：

  | 迁移前                            | 迁移后                                            |
  |-----------------------------------|---------------------------------------------------|
  | `-Xjvm-default=all-compatibility` | `jvmDefault.set(JvmDefaultMode.ENABLE)`           |
  | `-Xjvm-default=all`               | `jvmDefault.set(JvmDefaultMode.NO_COMPATIBILITY)` | 
  | `-Xjvm-default=disable`           | `jvmDefault.set(JvmDefaultMode.DISABLE)`          |

例如，如果原来是：

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

迁移为：

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

[正如之前所说明的](#how-to-define-options)，你可以在扩展级别、目标级别和编译单元级别（任务）为 JVM/Android 项目定义编译器选项。

默认的 JVM 编译任务在生产代码中称为 `compileKotlin`，在测试代码中称为 `compileTestKotlin`。自定义源集的任务根据其 `compile<Name>Kotlin` 模式命名。

你可以在终端中运行 `gradlew tasks --all` 命令，并在 `Other tasks` 组中搜索 `compile*Kotlin` 任务名称，以查看 Android 编译任务列表。

需要注意的一些重要细节：

* `kotlin.compilerOptions` 会配置项目中的每个 Kotlin 编译任务。
* 你可以使用 `tasks.named<KotlinJvmCompile>("compileKotlin") { }`（或 `tasks.withType<KotlinJvmCompile>().configureEach { }`）方法覆盖由 `kotlin.compilerOptions` DSL 应用的配置。

## 针对 JavaScript {id="target-javascript"}

JavaScript 编译任务在生产代码中称为 `compileKotlinJs`，在测试代码中称为 `compileTestKotlinJs`，对于自定义源集则称为 `compile<Name>KotlinJs`。

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

请注意，在 Gradle Kotlin DSL 中，你应该首先从项目的 `tasks` 中获取该任务。

对于 JS 和 common 目标，请分别使用 `Kotlin2JsCompile` 和 `KotlinCompileCommon` 类型。

你可以在终端中运行 `gradlew tasks --all` 命令，并在 `Other tasks` 组中搜索 `compile*KotlinJS` 任务名称，以查看 JavaScript 编译任务列表。

## 所有 Kotlin 编译任务 {id="all-kotlin-compilation-tasks"}

还可以配置项目中的所有 Kotlin 编译任务：

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

| 名称 | 描述 | 可选值 | 默认值 |
|---|---|---|---|
| `optIn` | 用于配置[选择加入编译器实参](opt-in-requirements.md)列表的属性 | `listOf( /* opt-ins */ )` | `emptyList()` |
| `progressiveMode` | 启用[渐进式编译器模式](whatsnew13.md#progressive-mode) | `true`、`false` | `false` |
| `extraWarnings` | 启用[额外的声明、表达式和类型编译器检查](whatsnew21.md#extra-compiler-checks)，若为 true 则发出警告 | `true`、`false` | `false` |

### JVM 特有属性 {id="attributes-specific-to-jvm"}

| 名称 | 描述 | 可选值 | 默认值 |
|---|---|---|---|
| `javaParameters` | 为方法形参的 Java 1.8 反射生成元数据 | | false |
| `jvmTarget` | 生成的 JVM 字节码的目标版本 | "1.8"、"9"、"10"、...、"25"、"26"。另请参阅[编译器选项的类型](#types-for-compiler-options) | "%defaultJvmTargetVersion%" |
| `noJdk` | 不自动将 Java 运行时包含到类路径中 | | false |
| `jvmTargetValidationMode` | <list><li>Kotlin 与 Java 之间 [JVM 目标兼容性](gradle-configure-project.md#check-for-jvm-target-compatibility-of-related-compile-tasks)的验证</li><li>`KotlinCompile` 类型任务的属性。</li></list> | `WARNING`、`ERROR`、`IGNORE` | `ERROR` |
| `jvmDefault` | 控制在接口中声明的函数如何编译为 JVM 上的默认方法 | `ENABLE`、`NO_COMPATIBILITY`、`DISABLE` | `ENABLE` |
| `-Xadd-modules` | （实验性）除初始模块外，还解析指定的根模块。设置 `ALL-MODULE-PATH` 值以解析模块路径上的所有模块。 | 通过 [`freeCompilerArgs`](#example-of-additional-arguments-usage-via-freecompilerargs) 传递的逗号分隔模块名称或 `ALL-MODULE-PATH` | |

### JVM 和 JavaScript 通用属性 {id="attributes-common-to-jvm-and-javascript"}

| 名称 | 描述 | 可选值 | 默认值 |
|---|---|---|---|
| `allWarningsAsErrors` | 如果存在任何警告，则报告错误 | | false |
| `suppressWarnings` | 不生成警告 | | false |
| `verbose` | 启用详细日志输出。仅在[启用 Gradle 调试日志级别](https://docs.gradle.org/current/userguide/logging.html)时有效 | | false |
| `freeCompilerArgs` | 附加编译器实参的列表。也可以在此处使用实验性的 `-X` 实参。参见[通过 freeCompilerArgs 使用附加实参的示例](#example-of-additional-arguments-usage-via-freecompilerargs) | | [] |
| `apiVersion` | 控制你的代码可以使用哪些 Kotlin API。有关更多信息，请参阅 [`-api-version`](compiler-reference.md#api-version-version)。 | "2.0"、"2.1"、"2.2"、"2.3"、"2.4"、"2.5"（实验性） | |
| `languageVersion` | 控制编译期间可用的 Kotlin 语言功能和语法。有关更多信息，请参阅 [`-language-version`](compiler-reference.md#language-version-version)。 | "2.0"、"2.1"、"2.2"、"2.3"、"2.4"、"2.5"（实验性） | |

> 我们计划在未来版本中弃用 `freeCompilerArgs` 属性。如果你发现 Kotlin Gradle DSL 中缺少某些选项，请[提交问题](https://youtrack.jetbrains.com/newissue?project=kt)。
>
{style="warning"}

#### 通过 freeCompilerArgs 使用附加实参的示例 {initial-collapse-state="collapsed" collapsible="true" id="example-of-additional-arguments-usage-via-freecompilerargs"}

使用 `freeCompilerArgs` 属性来提供附加的（包括实验性的）编译器实参。
你可以向该属性添加单个实参或实参列表：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

kotlin {
    compilerOptions {
        // 指定 Kotlin API 的版本以及 JVM 目标
        apiVersion.set(KotlinVersion.%gradleLanguageVersion%)
        jvmTarget.set(JvmTarget.JVM_1_8)
        
        // 单个实验性实参
        freeCompilerArgs.add("-Xexport-kdoc")

        // 单个附加实参
        freeCompilerArgs.add("-Xno-param-assertions")

        // 在模块路径上解析附加的根模块
        freeCompilerArgs.add("-Xadd-modules=jdk.incubator.vector")

        // 实参列表
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
        // 指定 Kotlin API 的版本以及 JVM 目标
        apiVersion = KotlinVersion.%gradleLanguageVersion%
        jvmTarget = JvmTarget.JVM_1_8
        
        // 单个实验性实参
        freeCompilerArgs.add("-Xexport-kdoc")
        
        // 单个附加实参，可以是键值对
        freeCompilerArgs.add("-Xno-param-assertions")
        
        // 在模块路径上解析附加的根模块
        freeCompilerArgs.add("-Xadd-modules=jdk.incubator.vector")
        
        // 实参列表
        freeCompilerArgs.addAll(["-Xno-receiver-assertions", "-Xno-call-assertions"])
    }
}
```

</tab>
</tabs>

> `freeCompilerArgs` 属性在[扩展级别](#extension-level)、[目标级别](#target-level)和[编译单元（任务）级别](#compilation-unit-level)均可用。
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

| 名称 | 描述 | 可选值 | 默认值 |
|---|---|---|---|
| `friendModulesDisabled` | 禁用 internal 声明导出 | | `false` |
| `main` | 指定在执行时是否应调用 `main` 函数 | `JsMainFunctionExecutionMode.CALL`、`JsMainFunctionExecutionMode.NO_CALL` | `JsMainFunctionExecutionMode.CALL` |
| `moduleKind` | 编译器生成的 JS 模块类型 | `JsModuleKind.MODULE_AMD`、`JsModuleKind.MODULE_PLAIN`、`JsModuleKind.MODULE_ES`、`JsModuleKind.MODULE_COMMONJS`、`JsModuleKind.MODULE_UMD` | `null` |
| `sourceMap` | 生成源代码映射 | | `false` |
| `sourceMapEmbedSources` | 将源文件嵌入源代码映射中 | `JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_INLINING`、`JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_NEVER`、`JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_ALWAYS` | `null` |
| `sourceMapNamesPolicy` | 将你在 Kotlin 代码中声明的变量和函数名称添加到源代码映射中。有关此行为的详细信息，请参阅我们的[编译器参考](compiler-reference.md#source-map-names-policy-simple-names-fully-qualified-names-no) | `JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_FQ_NAMES`、`JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_SIMPLE_NAMES`、`JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_NO` | `null` |
| `sourceMapPrefix` | 为源代码映射中的路径添加指定前缀 | | `null` |
| `target` | 为特定 ECMA 版本生成 JS 文件 | `"es5"`、`"es2015"`、`"es2020"` | `"es5"` |
| `useEsClasses` | 让生成的 JavaScript 代码使用 ES2015 类。在使用 ES2015 和 ES2020 目标时默认启用 | | `null` |

### 编译器选项的类型 {id="types-for-compiler-options"}

部分 `compilerOptions` 使用了新类型来替代 `String` 类型：

| 选项 | 类型 | 示例 |
|---|---|---|
| `jvmTarget` | [`JvmTarget`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JvmTarget.kt) | `compilerOptions.jvmTarget.set(JvmTarget.JVM_11)` |
| `apiVersion` 和 `languageVersion` | [`KotlinVersion`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/KotlinVersion.kt) | `compilerOptions.languageVersion.set(KotlinVersion.%gradleLanguageVersion%)` |
| `main` | [`JsMainFunctionExecutionMode`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsMainFunctionExecutionMode.kt) | `compilerOptions.main.set(JsMainFunctionExecutionMode.NO_CALL)` |
| `moduleKind` | [`JsModuleKind`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsModuleKind.kt) | `compilerOptions.moduleKind.set(JsModuleKind.MODULE_ES)` |
| `sourceMapEmbedSources` | [`JsSourceMapEmbedMode`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsSourceMapEmbedMode.kt) | `compilerOptions.sourceMapEmbedSources.set(JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_INLINING)` |
| `sourceMapNamesPolicy` | [`JsSourceMapNamesPolicy`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsSourceMapNamesPolicy.kt) | `compilerOptions.sourceMapNamesPolicy.set(JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_FQ_NAMES)` |

## 下一步？ {id="what-s-next"}

详细了解：
* [Kotlin Multiplatform DSL 参考](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html)。
* [增量编译、缓存支持、构建报告与 Kotlin 守护进程](gradle-compilation-and-caches.md)。
* [Gradle 基础知识与详情](https://docs.gradle.org/current/userguide/userguide.html)。
* [对 Gradle 插件变体的支持](gradle-plugin-variants.md)。