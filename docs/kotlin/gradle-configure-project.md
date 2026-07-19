[//]: # (title: 配置 Gradle 项目)

要使用 [Gradle](https://docs.gradle.org/current/userguide/userguide.html) 构建 Kotlin 项目，
您需要在构建脚本文件 `build.gradle(.kts)` 中将 [Kotlin Gradle 插件添加](#apply-the-plugin)到构建脚本中，
并在此处[配置项目的依赖项](#configure-dependencies)。

> 要了解有关构建脚本内容的更多信息，
> 请访问[探索构建脚本](get-started-with-jvm-gradle-project.md#explore-the-build-script)章节。
>
{style="note"}

## 应用插件

要应用 Kotlin Gradle 插件，请使用来自 Gradle 插件 DSL 的 [`plugins{}` 块](https://docs.gradle.org/current/userguide/plugins.html#sec:plugins_block)：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    // 将 `<...>` 替换为适用于您的目标环境的插件名称
    kotlin("<...>") version "%kotlinVersion%"
    // 例如，如果您的目标环境是 JVM：
    // kotlin("jvm") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    // 将 `<...>` 替换为适用于您的目标环境的插件名称
    id 'org.jetbrains.kotlin.<...>' version '%kotlinVersion%'
    // 例如，如果您的目标环境是 JVM： 
    // id 'org.jetbrains.kotlin.jvm' version '%kotlinVersion%'
}
```

</tab>
</tabs>

> Kotlin Gradle 插件 (KGP) 与 Kotlin 共享相同的版本号。
>
{style="note"}

配置项目时，请检查 Kotlin Gradle 插件 (KGP) 与可用 Gradle 版本的兼容性。
下表列出了 Gradle 和 Android Gradle 插件 (AGP) **完全支持**的最小和最大版本：

| KGP 版本      | Gradle 最小和最大版本                 | AGP 最小和最大版本                                  |
|---------------|---------------------------------------|-----------------------------------------------------|
| 2.4.0-2.4.10  | %minGradleVersion%–%maxGradleVersion% | %minAndroidGradleVersion%–%maxAndroidGradleVersion% |
| 2.3.20–2.3.21 | 7.6.3–9.3.0                           | 8.2.2–9.0.0                                         |
| 2.3.10        | 7.6.3–9.0.0                           | 8.2.2–9.0.0                                         |
| 2.3.0         | 7.6.3–9.0.0                           | 8.2.2–8.13.0                                        |
| 2.2.20–2.2.21 | 7.6.3–8.14                            | 7.3.1–8.11.1                                        |
| 2.2.0–2.2.10  | 7.6.3–8.14                            | 7.3.1–8.10.0                                        |
| 2.1.20–2.1.21 | 7.6.3–8.12.1                          | 7.3.1–8.7.2                                         |
| 2.1.0–2.1.10  | 7.6.3–8.10*                           | 7.3.1–8.7.2                                         |
| 2.0.20–2.0.21 | 6.8.3–8.8*                            | 7.1.3–8.5                                           |
| 2.0.0         | 6.8.3–8.5                             | 7.1.3–8.3.1                                         |
| 1.9.20–1.9.25 | 6.8.3–8.1.1                           | 4.2.2–8.1.0                                         |

> *Kotlin 2.0.20–2.0.21 和 Kotlin 2.1.0–2.1.10 与最高至 8.6 版本的 Gradle 完全兼容。
> 也支持 8.7–8.10 版本的 Gradle，但有一个例外：如果您使用 Kotlin 多平台 Gradle 插件，
> 您可能会在多平台项目调用 JVM 目标中的 `withJava()` 函数时看到弃用警告。
> 有关更多信息，请参阅 [默认创建的 Java 源集](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#java-source-sets-created-by-default)。
>
{style="warning"}

您也可以使用最高至最新发布的 Gradle 和 AGP 版本，但如果这样做，请记住您可能会遇到
弃用警告，或者某些新功能可能无法正常工作。

例如，Kotlin Gradle 插件和 `kotlin-multiplatform` 插件 %kotlinVersion% 要求项目的最小 Gradle
版本为 %minGradleVersion% 才能编译。

同样，完全支持的最大版本是 %maxGradleVersion%。它没有弃用的 Gradle
方法和属性，并支持所有当前的 Gradle 功能。

### 早期 KGP 版本 {initial-collapse-state="collapsed" collapsible="true"}

| KGP 版本      | Gradle 最小和最大版本        | AGP 最小和最大版本       |
|---------------|----------------------------|-------------------------|
| 1.9.0–1.9.10  | 6.8.3–7.6.0                | 4.2.2–7.4.0             |
| 1.8.20–1.8.22 | 6.8.3–7.6.0                | 4.1.3–7.4.0             |      
| 1.8.0–1.8.11  | 6.8.3–7.3.3                | 4.1.3–7.2.1             |   
| 1.7.20–1.7.22 | 6.7.1–7.1.1                | 3.6.4–7.0.4             |
| 1.7.0–1.7.10  | 6.7.1–7.0.2                | 3.4.3–7.0.2             |
| 1.6.20–1.6.21 | 6.1.1–7.0.2                | 3.4.3–7.0.2             |

### 项目中的 Kotlin Gradle 插件数据

默认情况下，Kotlin Gradle 插件将持久的项目特定数据存储在项目的根目录下的
`.kotlin` 目录中。

> 不要将 `.kotlin` 目录提交到版本控制。
> 例如，如果您使用的是 Git，请将 `.kotlin` 添加到项目的 `.gitignore` 文件中。
>
{style="warning"}

您可以将以下属性添加到项目的 `gradle.properties` 文件中来配置此行为：

| Gradle 属性                                         | 描述                                                                                                                                       |
|-----------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| `kotlin.project.persistent.dir`                     | 配置存储项目级数据的位置。默认值：`<project-root-directory>/.kotlin`                                      |
| `kotlin.project.persistent.dir.gradle.disableWrite` | 控制是否禁用将 Kotlin 数据写入 `.gradle` 目录（为了与旧版本 IDEA 向后兼容）。默认值：false |

## 以 JVM 为目标

要以 JVM 为目标，请应用 Kotlin JVM 插件。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("jvm") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.jvm" version "%kotlinVersion%"
}
```

</tab>
</tabs>

在此块中，`version` 应该是字面量，且不能从另一个构建脚本应用。

### Kotlin 和 Java 源码

Kotlin 源码和 Java 源码可以存储在同一个目录中，也可以放在不同的目录。

默认约定是使用不同的目录：

```text
project
    - src
        - main (root)
            - kotlin
            - java
```

> 不要将 Java `.java` 文件存储在 `src/*/kotlin` 目录中，因为 `.java` 文件将不会被编译。
> 
> 相反，您可以使用 `src/main/java`。
>
{style="warning"} 

如果您不使用默认约定，则应更新相应的 `sourceSets` 属性：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
sourceSets.main {
    java.srcDirs("src/main/myJava", "src/main/myKotlin")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
sourceSets {
    main.kotlin.srcDirs += 'src/main/myKotlin'
    main.java.srcDirs += 'src/main/myJava'
}
```

</tab>
</tabs>

<!-- 以下标题用于 Mari 链接服务。如果您希望在此处更改它，请同时更改该处的链接 -->

### 检查相关编译任务的 JVM 目标兼容性

在构建模块中，您可能会有相关的编译任务，例如：
* `compileKotlin` 和 `compileJava`
* `compileTestKotlin` 和 `compileTestJava`

> `main` 和 `test` 源集编译任务不相关。
>
{style="note"}

对于此类相关任务，Kotlin Gradle 插件会检查 JVM 目标兼容性。`kotlin` 扩展或任务中的 [`jvmTarget` 特性](gradle-compiler-options.md#attributes-specific-to-jvm)
与 `java` 扩展或任务中的 [`targetCompatibility`](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java-extension)
具有不同的值，会导致 JVM 目标不兼容。例如：
`compileKotlin` 任务具有 `jvmTarget=1.8`，而
`compileJava` 任务具有（或[继承](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java-extension)） `targetCompatibility=15`。

通过在 `gradle.properties` 文件中设置 `kotlin.jvm.target.validation.mode` 属性，为整个项目配置此检查的行为：

* `error` – 插件使构建失败；Gradle 8.0+ 项目的默认值。
* `warning` – 插件打印一条警告消息；低于 Gradle 8.0 项目的默认值。
* `ignore` – 插件跳过检查，不产生任何消息。

您也可以在 `build.gradle(.kts)` 文件中的任务级别进行配置：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinJvmCompile>().configureEach {
    jvmTargetValidationMode.set(org.jetbrains.kotlin.gradle.dsl.jvm.JvmTargetValidationMode.WARNING)
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinJvmCompile.class).configureEach {
    jvmTargetValidationMode = org.jetbrains.kotlin.gradle.dsl.jvm.JvmTargetValidationMode.WARNING)
}
```

</tab>
</tabs>

要避免 JVM 目标不兼容，请[配置工具链](#gradle-java-toolchains-support)或手动对齐 JVM 版本。

#### 如果目标不兼容会出现什么问题 {initial-collapse-state="collapsed" collapsible="true"}

有两种手动为 Kotlin 和 Java 源集设置 JVM 目标的方法：
* 通过[设置 Java 工具链](#gradle-java-toolchains-support)的隐式方式。
* 通过在 `kotlin` 扩展或任务中设置 `jvmTarget` 特性，并在 `java` 扩展或任务中设置 `targetCompatibility` 的显式方式。

在以下情况下会发生 JVM 目标不兼容：
* 显式设置了不同的 `jvmTarget` 和 `targetCompatibility` 值。
* 具有默认配置，且您的 JDK 不等于 `1.8`。

让我们考虑一个 JVM 目标的默认配置，即在构建脚本中只有 Kotlin JVM 插件且没有其他 JVM 目标设置的情况：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("jvm") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.jvm" version "%kotlinVersion%"
}
```

</tab>
</tabs>

当构建脚本中没有关于 `jvmTarget` 值的显式信息时，其默认值为 `null`，且编译器将其转换为默认值 `1.8`。`targetCompatibility` 等于当前 Gradle 的 JDK 版本，这等于您的 JDK 版本（除非您使用 [Java 工具链方案](gradle-configure-project.md#gradle-java-toolchains-support)）。假设您的 JDK 版本为 `%jvmLTSVersionSupportedByKotlin%`，您发布的库构件将[声明其自身兼容](https://docs.gradle.org/current/userguide/publishing_gradle_module_metadata.html) JDK %jvmLTSVersionSupportedByKotlin%+：`org.gradle.jvm.version=%jvmLTSVersionSupportedByKotlin%`，这是错误的。在这种情况下，即使字节码的版本是 `1.8`，您也必须在主项目中使用 Java %jvmLTSVersionSupportedByKotlin% 来添加此库。[配置工具链](gradle-configure-project.md#gradle-java-toolchains-support)以解决此问题。

### Gradle Java 工具链支持

> 给 Android 用户的警告。要使用 Gradle 工具链支持，请使用 Android Gradle 插件 (AGP) 8.1.0-alpha09 或更高版本。
> 
> Gradle Java 工具链支持仅从 AGP 7.4.0 开始[可用](https://issuetracker.google.com/issues/194113162)。
> 然而，由于[这个问题](https://issuetracker.google.com/issues/260059413)，AGP 在 8.1.0-alpha09 版本之前没有将 `targetCompatibility` 设置为等于工具链的 JDK。
> 如果您使用低于 8.1.0-alpha09 的版本，您需要通过 `compileOptions` 手动配置 `targetCompatibility`。将占位符 `<MAJOR_JDK_VERSION>` 替换为您想要使用的 JDK 版本：
>
> ```kotlin
> android {
>     compileOptions {
>         sourceCompatibility = <MAJOR_JDK_VERSION>
>         targetCompatibility = <MAJOR_JDK_VERSION>
>     }
> }
> ```
>
{style="warning"} 

Gradle 6.7 引入了 [Java 工具链支持](https://docs.gradle.org/current/userguide/toolchains.html)。
使用此功能，您可以：
* 使用与 Gradle 中不同的 JDK 和 JRE 来运行编译、测试和可执行文件。
* 使用尚未发布的语言版本编译和测试代码。

有了工具链支持，Gradle 可以自动检测本地 JDK 并安装 Gradle 构建所需的缺失 JDK。
现在 Gradle 本身可以运行在任何 JDK 上，并且仍然可以针对依赖于特定主要 JDK 版本的任务重用[远程构建缓存功能](gradle-compilation-and-caches.md#gradle-build-cache-support)。

Kotlin Gradle 插件支持 Kotlin/JVM 编译任务的 Java 工具链。JS 和 Native 任务不使用工具链。
Kotlin 编译器始终运行在 Gradle 守护进程运行的 JDK 上。
Java 工具链：
* 设置适用于 JVM 目标的 [`-jdk-home` 选项](compiler-reference.md#jdk-home-path)。
* 如果用户没有显式设置 `jvmTarget` 选项，则将 [`compilerOptions.jvmTarget`](gradle-compiler-options.md#attributes-specific-to-jvm) 设置为工具链的 JDK 版本。
  如果用户未配置工具链，则 `jvmTarget` 字段使用默认值。
  详细了解 [JVM 目标兼容性](#check-for-jvm-target-compatibility-of-related-compile-tasks)。
* 设置由任何 Java 编译、测试和 javadoc 任务使用的工具链。
* 影响 [`kapt` 工作线程](kapt.md#run-kapt-tasks-in-parallel)运行在哪个 JDK 上。

使用以下代码设置工具链。将占位符 `<MAJOR_JDK_VERSION>` 替换为您想要使用的 JDK 版本：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvmToolchain {
        languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>))
    }
    // 或者更简短：
    jvmToolchain(<MAJOR_JDK_VERSION>)
    // 例如：
    jvmToolchain(%jvmLTSVersionSupportedByKotlin%)
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvmToolchain {
        languageVersion = JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
    }
    // 或者更简短：
    jvmToolchain(<MAJOR_JDK_VERSION>)
    // 例如：
    jvmToolchain(%jvmLTSVersionSupportedByKotlin%)
}
```

</tab>
</tabs>

请注意，通过 `kotlin` 扩展设置工具链也会更新 Java 编译任务的工具链。

您可以通过 `java` 扩展设置工具链，Kotlin 编译任务将使用它：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)) 
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
    }
}
```

</tab>
</tabs>

如果您使用 Gradle 8.0.2 或更高版本，您还需要添加[工具链解析器插件](https://docs.gradle.org/current/userguide/toolchains.html#sub:download_repositories)。
此类插件管理从哪些仓库下载工具链。例如，在您的 `settings.gradle(.kts)` 中添加以下插件：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version("%foojayResolver%")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.gradle.toolchains.foojay-resolver-convention' version '%foojayResolver%'
}
```

</tab>
</tabs>

在 [Gradle 网站](https://docs.gradle.org/current/userguide/toolchains.html#sub:download_repositories)上检查 `foojay-resolver-convention` 的版本是否与您的 Gradle 版本对应。

> 要了解 Gradle 使用哪个工具链，请使用 [日志级别 `--info`](https://docs.gradle.org/current/userguide/logging.html#sec:choosing_a_log_level) 运行您的 Gradle 构建，
> 并在输出中找到以 `[KOTLIN] Kotlin compilation 'jdkHome' argument:` 开头的字符串。
> 冒号后的部分将是来自工具链的 JDK 版本。
>
{style="note"}

要为特定任务设置任何 JDK（甚至是本地的），请使用 [任务 DSL](#set-jdk-version-with-the-task-dsl)。

详细了解 [Kotlin 插件中的 Gradle JVM 工具链支持](https://blog.jetbrains.com/kotlin/2021/11/gradle-jvm-toolchain-support-in-the-kotlin-plugin/)。

### 使用任务 DSL 设置 JDK 版本

任务 DSL 允许为任何实现了 `UsesKotlinJavaToolchain` 接口的任务设置任何 JDK 版本。
目前，这些任务包括 `KotlinCompile` 和 `KaptTask`。
如果您希望 Gradle 搜索主要 JDK 版本，请在构建脚本中替换 `<MAJOR_JDK_VERSION>` 占位符：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
val service = project.extensions.getByType<JavaToolchainService>()
val customLauncher = service.launcherFor {
    languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>))
}
project.tasks.withType<UsesKotlinJavaToolchain>().configureEach {
    kotlinJavaToolchain.toolchain.use(customLauncher)
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
JavaToolchainService service = project.getExtensions().getByType(JavaToolchainService.class)
Provider<JavaLauncher> customLauncher = service.launcherFor {
    it.languageVersion = JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
}
tasks.withType(UsesKotlinJavaToolchain::class).configureEach { task ->
    task.kotlinJavaToolchain.toolchain.use(customLauncher)
}
```

</tab>
</tabs>

或者您可以指定本地 JDK 的路径并用此 JDK 版本替换占位符 `<LOCAL_JDK_VERSION>`：

```kotlin
tasks.withType<UsesKotlinJavaToolchain>().configureEach {
    kotlinJavaToolchain.jdk.use(
        "/path/to/local/jdk", // 填写您的 JDK 路径
        JavaVersion.<LOCAL_JDK_VERSION> // 例如，JavaVersion.17
    )
}
```

### 关联编译器任务

您可以通过在编译之间建立一种关系来_关联_编译，使得一个编译使用另一个编译的编译输出。关联编译会在它们之间建立 `internal` 可见性。

Kotlin 编译器默认关联了一些编译，例如每个目标的 `test` 和 `main` 编译。
如果您需要表达您的一个自定义编译与另一个编译相关联，请创建您自己的关联编译。

要使 IDE 支持关联编译以推断源集之间的可见性，请将以下代码添加到您的 `build.gradle(.kts)`：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
val integrationTestCompilation = kotlin.target.compilations.create("integrationTest") {
    associateWith(kotlin.target.compilations.getByName("main"))
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
integrationTestCompilation {
    kotlin.target.compilations.create("integrationTest") {
        associateWith(kotlin.target.compilations.getByName("main"))
    }
}
```

</tab>
</tabs>

在这里，`integrationTest` 编译与 `main` 编译关联，这使得可以从功能测试中访问 `internal` 对象。

### 在启用 Java 模块 (JPMS) 的情况下配置

要使 Kotlin Gradle 插件与 [Java 模块](https://www.oracle.com/corporate/features/understanding-java-9-modules.html)一起工作，
请在构建脚本中添加以下行，并将 `YOUR_MODULE_NAME` 替换为您的 JPMS 模块引用，例如 `org.company.module`：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">
        
```kotlin
// 如果您使用的 Gradle 版本低于 7.0，请添加以下三行
java {
    modularity.inferModulePath.set(true)
}

tasks.named("compileJava", JavaCompile::class.java) {
    options.compilerArgumentProviders.add(CommandLineArgumentProvider {
        // 将编译好的 Kotlin 类提供给 javac – 这是 Java/Kotlin 混合源码工作所必需的
        listOf("--patch-module", "YOUR_MODULE_NAME=${sourceSets["main"].output.asPath}")
    })
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// 如果您使用的 Gradle 版本低于 7.0，请添加以下三行
java {
    modularity.inferModulePath = true
}

tasks.named("compileJava", JavaCompile.class) {
    options.compilerArgumentProviders.add(new CommandLineArgumentProvider() {
        @Override
        Iterable<String> asArguments() {
            // 将编译好的 Kotlin 类提供给 javac – 这是 Java/Kotlin 混合源码工作所必需的
            return ["--patch-module", "YOUR_MODULE_NAME=${sourceSets["main"].output.asPath}"]
        }
    })
}
```

</tab>
</tabs>

> 像往常一样将 `module-info.java` 放入 `src/main/java` 目录。
> 
> 对于模块，Kotlin 文件中的包名应等于 `module-info.java` 中的包名，以避免“包为空或不存在”的构建失败。
>
{style="note"}

详细了解：
* [为 Java 模块系统构建模块](https://docs.gradle.org/current/userguide/java_library_plugin.html#sec:java_library_modular)
* [使用 Java 模块系统构建应用程序](https://docs.gradle.org/current/userguide/application_plugin.html#sec:application_modular)
* [Kotlin 中“模块”的含义](visibility-modifiers.md#modules)

### 其他详情

#### 在编译任务中禁用构件的使用

在一些极少数情况下，您可能会遇到由循环依赖错误引起的构建失败。例如，当您有多个编译，其中一个编译可以看到另一个编译的所有内部声明，且生成的构件依赖于这两个编译任务的输出时：

```none
FAILURE: Build failed with an exception.

What went wrong:
Circular dependency between the following tasks:
:lib:compileKotlinJvm
--- :lib:jvmJar
     \--- :lib:compileKotlinJvm (*)
(*) - details omitted (listed previously)
```

为了修复此循环依赖错误，我们添加了一个 Gradle 属性：`archivesTaskOutputAsFriendModule`。
此属性控制在编译任务中使用构件输入，并决定是否因此创建任务依赖关系。

默认情况下，此属性设置为 `true` 以跟踪任务依赖关系。如果您遇到循环依赖错误，
您可以在编译任务中禁用构件的使用，以移除任务依赖关系并避免循环依赖错误。

要在编译任务中禁用构件的使用，请在您的 `gradle.properties` 文件中添加以下内容：

```kotlin
kotlin.build.archivesTaskOutputAsFriendModule=false
```

#### 延迟 Kotlin/JVM 任务创建

从 Kotlin 1.8.20 开始，Kotlin Gradle 插件会注册所有任务，并且不会在预运行 (dry run) 时配置它们。

#### 编译任务 destinationDirectory 的非默认位置

如果您重写了 Kotlin/JVM `KotlinJvmCompile`/`KotlinCompile` 任务的 `destinationDirectory` 位置，
请更新您的构建脚本。您需要显式地将 `sourceSets.main.kotlin.classesDirectories` 添加到 JAR 文件中的 `sourceSets.main.outputs`：

```kotlin
tasks.jar(type: Jar) {
    from sourceSets.main.outputs
    from sourceSets.main.kotlin.classesDirectories
}
```

## 以多平台为目标

以[多个平台](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#targets)为目标的项目（称为[多平台项目](https://kotlinlang.org/docs/multiplatform/get-started.html)）需要 `kotlin-multiplatform` 插件。

> `kotlin-multiplatform` 插件适用于 Gradle %minGradleVersion% 或更高版本。
>
{style="note"}

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</tab>
</tabs>

详细了解[适用于不同平台的 Kotlin 多平台](https://kotlinlang.org/docs/multiplatform/get-started.html)以及[适用于 iOS 和 Android 的 Kotlin 多平台](https://kotlinlang.org/docs/multiplatform/multiplatform-getting-started.html)。

## 以 Android 为目标

建议使用 Android Studio 创建 Android 应用程序。[了解如何使用 Android Gradle 插件](https://developer.android.com/studio/releases/gradle-plugin)。

## 以 Web 为目标

Kotlin 通过 Kotlin 多平台为 Web 开发提供了两种方案：

* 基于 JavaScript（使用 Kotlin/JS 编译器）
* 基于 WebAssembly（使用 Kotlin/Wasm 编译器）

这两种方案都使用 Kotlin 多平台插件，但支持不同的用例。
下面的章节说明了如何在您的 Gradle 构建中配置每个目标以及何时使用它们。

### 以 JavaScript 为目标

如果您的目标是：

* 与 JavaScript/TypeScript 代码库共享业务逻辑
* 使用 Kotlin 构建不可共享的 Web 应用

有关更多信息，请参阅 [Web 开发](web-overview.md#kotlin-js)。

当以 JavaScript 为目标时，请使用 `kotlin-multiplatform` 插件：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</tab>
</tabs>

通过指定 JavaScript 目标应在浏览器还是 Node.js 环境中运行来配置它：

```kotlin
kotlin {
    js().browser {  // 或 js().nodejs
        /* ... */
    }
}
```

> 参阅[有关 JavaScript Gradle 配置的进一步详情](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#web-targets)并详细了解[设置 Kotlin/JS 项目](js-project-setup.md)。
>
{style="note"}

### 以 WebAssembly 为目标

如果您想跨多个平台共享逻辑和 UI，请使用 Kotlin/Wasm。有关更多信息，
请参阅 [Web 开发](web-overview.md#kotlin-wasm)。

与 JavaScript 一样，以 WebAssembly (Wasm) 为目标时请使用 `kotlin-multiplatform` 插件：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</tab>
</tabs>

根据您的要求，您可以以以下目标为目标：

* **`wasmJs`**：用于在浏览器或 Node.js 中运行
* **`wasmWasi`**：用于在支持 [WASI (WebAssembly 系统接口)](https://wasi.dev/) 的 Wasm 环境中运行，例如 Wasmtime、WasmEdge 等。

为 Web 浏览器或 Node.js 配置 `wasmJs` 目标：

```kotlin
kotlin {
    wasmJs {
        browser { // 或 nodejs
            /* ... */
        }
    }
}
```

对于 WASI 环境，请配置 `wasmWasi` 目标：

```kotlin
kotlin {
    wasmWasi {
        nodejs {
            /* ... */
        }
    }
}
```

> [参阅有关 Wasm Gradle 配置的进一步详情](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#web-targets)。
>
{style="note"}

### Web 目标的 Kotlin 和 Java 源码

KGP 仅适用于 Kotlin 文件，因此建议您将 Kotlin 和 Java 文件分开存放（如果项目中包含 Java 文件）。如果不分开存放，请在 `sourceSets{}` 块中指定源码文件夹：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets["main"].apply {
        kotlin.srcDir("src/main/myKotlin")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        main.kotlin.srcDirs += 'src/main/myKotlin'
    }
}
```

</tab>
</tabs>

## 使用 KotlinBasePlugin 接口触发配置操作

要在应用任何 Kotlin Gradle 插件（JVM、JS、多平台、Native 等）时触发某些配置操作，
请使用所有 Kotlin 插件都继承自的 `KotlinBasePlugin` 接口：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.plugin.KotlinBasePlugin

// ...

project.plugins.withType<KotlinBasePlugin>() {
    // 在此处配置您的操作
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.plugin.KotlinBasePlugin

// ...

project.plugins.withType(KotlinBasePlugin.class) {
    // 在此处配置您的操作
}
```

</tab>
</tabs>

## 配置依赖项

要添加对库的依赖项，请在源集 DSL 的 `dependencies{}` 块中设置所需[类型](#dependency-types)（例如 `implementation`）的依赖项。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation("com.example:my-library:1.0")
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        commonMain {
            dependencies {
                implementation 'com.example:my-library:1.0'
            }
        }
    }
}
```

</tab>
</tabs>

### 在顶级配置依赖项
<primary-label ref="experimental-opt-in"/>

您可以使用顶级 `dependencies {}` 块在多平台项目中配置通用依赖项。
此处声明的依赖项的行为就像它们被添加到 `commonMain` 或 `commonTest` 源集中一样。

要使用顶级 `dependencies {}` 块，请通过在块前添加 `@OptIn(ExperimentalKotlinGradlePluginApi::class)` 注解来启用：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    @OptIn(ExperimentalKotlinGradlePluginApi::class)
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    dependencies {
        implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
    }
}
```

</tab>
</tabs>

在相应目标的 `sourceSets {}` 块内部添加平台特定的依赖项。

您可以在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-76446) 上分享对此功能的反馈。

### 依赖项类型

根据您的要求选择依赖项类型。

<table>
    <tr>
        <th>类型</th>
        <th>描述</th>
        <th>何时使用</th>
    </tr>
    <tr>
        <td><code>api</code></td>
        <td>在编译期间和运行时都使用，并导出给库使用者。</td>
        <td>如果当前模块的公共 API 中使用了来自依赖项的任何类型，请使用 <code>api</code> 依赖项。
        </td>
    </tr>
    <tr>
        <td><code>implementation</code></td>
        <td>在当前模块的编译期间和运行时使用，但不会暴露给依赖于当前模块的其他模块的编译。</td>
        <td>
            <p>用于模块内部逻辑所需的依赖项。</p>
            <p>如果模块是不发布的端点应用程序，请使用 <code>implementation</code> 依赖项而不是 <code>api</code> 依赖项。</p>
        </td>
    </tr>
    <tr>
        <td><code>compileOnly</code></td>
        <td>用于当前模块的编译，但在运行时及其他模块的编译期间不可用。</td>
        <td>用于在运行时有第三方实现的 API。</td>
    </tr>
    <tr>
        <td><code>runtimeOnly</code></td>
        <td>在运行时可用，但在任何模块的编译期间均不可见。</td>
        <td></td>
    </tr>
</table>

### 对标准库的依赖

对标准库 (`stdlib`) 的依赖项会自动添加到每个源集中。所使用的
标准库版本与 Kotlin Gradle 插件的版本相同。

对于平台特定的源集，将使用相应的平台特定变体库，而其余部分则添加通用标准库。Kotlin Gradle 插件根据您 Gradle 构建脚本的 `compilerOptions.jvmTarget` [编译器选项](gradle-compiler-options.md)选择适当的 JVM 标准库。

如果您显式声明了标准库依赖项（例如，如果您需要不同的版本），Kotlin Gradle 插件将不会重写它或添加第二个标准库。

如果您根本不需要标准库，可以将以下 Gradle 属性添加到您的 `gradle.properties` 文件中：

```none
kotlin.stdlib.default.dependency=false
```

#### 传递依赖项的版本对齐

从 Kotlin 标准库 1.9.20 版本开始，Gradle 使用标准库中包含的元数据来自动对齐传递的 `kotlin-stdlib-jdk7` 和 `kotlin-stdlib-jdk8` 依赖项。

如果您为 1.8.0 – 1.9.10 之间的任何 Kotlin 标准库版本添加依赖项，例如： 
`implementation("org.jetbrains.kotlin:kotlin-stdlib:1.8.0")`，那么 Kotlin Gradle 插件会对传递的 `kotlin-stdlib-jdk7` 和 `kotlin-stdlib-jdk8` 依赖项使用此 Kotlin 版本。这避免了来自不同标准库版本的类重复。[详细了解将 `kotlin-stdlib-jdk7` 和 `kotlin-stdlib-jdk8` 合并到 `kotlin-stdlib` 中](whatsnew18.md#updated-jvm-compilation-target)。 
您可以通过在 `gradle.properties` 文件中设置 `kotlin.stdlib.jdk.variants.version.alignment` Gradle 属性来禁用此行为：

```none
kotlin.stdlib.jdk.variants.version.alignment=false
```

##### 其他对齐版本的方法 {initial-collapse-state="collapsed" collapsible="true"}

* 如果您在版本对齐方面遇到问题，可以通过 Kotlin [BOM](https://docs.gradle.org/current/userguide/platforms.html#sub:bom_import) 对齐所有版本。 
  在您的构建脚本中声明对 `kotlin-bom` 的平台依赖：

  <tabs group="build-script">
  <tab title="Kotlin" group-key="kotlin">

  ```kotlin
  implementation(platform("org.jetbrains.kotlin:kotlin-bom:%kotlinVersion%"))
  ```

  </tab>
  <tab title="Groovy" group-key="groovy">

  ```groovy
  implementation platform('org.jetbrains.kotlin:kotlin-bom:%kotlinVersion%')
  ```

  </tab>
  </tabs>

* If you don't add a dependency for a standard library version, but you have two different dependencies that transitively
  bring different old versions of the Kotlin standard library, then you can explicitly require `%kotlinVersion%`
  versions of these transitive libraries:

  <tabs group="build-script">
  <tab title="Kotlin" group-key="kotlin">

  ```kotlin
  dependencies {
      constraints {
          add("implementation", "org.jetbrains.kotlin:kotlin-stdlib-jdk7") {
              version {
                  require("%kotlinVersion%")
              }
          }
          add("implementation", "org.jetbrains.kotlin:kotlin-stdlib-jdk8") {
              version {
                  require("%kotlinVersion%")
              }
          }
      }
  }
  ```

  </tab>
  <tab title="Groovy" group-key="groovy">

  ```groovy
  dependencies {
      constraints {
          add("implementation", "org.jetbrains.kotlin:kotlin-stdlib-jdk7") {
              version {
                  require("%kotlinVersion%")
              }
          }
          add("implementation", "org.jetbrains.kotlin:kotlin-stdlib-jdk8") {
              version {
                  require("%kotlinVersion%")
              }
          }
      }
  }
  ```

  </tab>
  </tabs>
  
* 如果您添加了 Kotlin 标准库版本 `%kotlinVersion%` 的依赖项：`implementation("org.jetbrains.kotlin:kotlin-stdlib:%kotlinVersion%")`，
  以及旧版本（早于 `1.8.0`）的 Kotlin Gradle 插件，请更新 Kotlin Gradle 插件以匹配标准库版本：

  
  <tabs group="build-script">
  <tab title="Kotlin" group-key="kotlin">

  ```kotlin
  plugins {
      // 将 `<...>` 替换为插件名称
      kotlin("<...>") version "%kotlinVersion%"
  }
  ```

  </tab>
  <tab title="Groovy" group-key="groovy">

  ```groovy
  plugins {
      // 将 `<...>` 替换为插件名称
      id "org.jetbrains.kotlin.<...>" version "%kotlinVersion%"
  }
  ```

  </tab>
  </tabs>

* 如果您使用的是 `1.8.0` 之前的 `kotlin-stdlib-jdk7`/`kotlin-stdlib-jdk8` 版本，例如， 
  `implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk7:SOME_OLD_KOTLIN_VERSION")`，以及一个传递地引入 `kotlin-stdlib:1.8+` 的依赖项，请[将您的 `kotlin-stdlib-jdk<7/8>:SOME_OLD_KOTLIN_VERSION` 替换为 `kotlin-stdlib-jdk*:%kotlinVersion%`](whatsnew18.md#updated-jvm-compilation-target) 或从引入它的库中[排除](https://docs.gradle.org/current/userguide/dependency_downgrade_and_exclude.html#sec:excluding-transitive-deps)传递的 `kotlin-stdlib:1.8+`：

  <tabs group="build-script">
  <tab title="Kotlin" group-key="kotlin">

  ```kotlin
  dependencies {
      implementation("com.example:lib:1.0") {
          exclude(group = "org.jetbrains.kotlin", module = "kotlin-stdlib")
      }
  }
  ```

  </tab>
  <tab title="Groovy" group-key="groovy">

  ```groovy
  dependencies {
      implementation("com.example:lib:1.0") {
          exclude group: "org.jetbrains.kotlin", module: "kotlin-stdlib"
      }
  }
  ```

  </tab>
  </tabs>

### 设置测试库的依赖项

[`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) API 可用于在所有支持的平台上测试 Kotlin 项目。
将 `kotlin-test` 依赖项添加到 `commonTest` 源集中，以便 Gradle 插件可以为每个测试源集推断相应的测试依赖项。

Kotlin/Native 目标不需要额外的测试依赖项，且 `kotlin.test` API 实现是内置的。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test")) // 这会自动引入所有平台依赖项
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        commonTest {
            dependencies {
                implementation kotlin("test") // 这会自动引入所有平台依赖项
            }
        }
    }
}
```

</tab>
</tabs>

> 您可以使用对 Kotlin 模块的依赖简写，例如，使用 `kotlin("test")` 代表 "org.jetbrains.kotlin:kotlin-test"。
>
{style="note"}

您也可以在任何共享或平台特定的源集中使用 `kotlin-test` 依赖项。

#### kotlin-test 的 JVM 变体

对于 Kotlin/JVM，Gradle 默认使用 JUnit 4。因此，`kotlin("test")` 依赖项解析为 JUnit 4 的变体，即 `kotlin-test-junit`。

您可以通过在构建脚本的测试任务中调用 [`useJUnitPlatform()`]( https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useJUnitPlatform)
或 [`useTestNG()`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useTestNG) 来选择 JUnit 5 或 TestNG。
以下示例针对 Kotlin 多平台项目：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        testRuns["test"].executionTask.configure {
            useJUnitPlatform()
        }
    }
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test"))
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        testRuns["test"].executionTask.configure {
            useJUnitPlatform()
        }
    }
    sourceSets {
        commonTest {
            dependencies {
                implementation kotlin("test")
            }
        }
    }
}
```

</tab>
</tabs>

以下示例针对 JVM 项目：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    testImplementation(kotlin("test"))
}

tasks {
    test {
        useTestNG()
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    testImplementation 'org.jetbrains.kotlin:kotlin-test'
}

test {
    useTestNG()
}
```

</tab>
</tabs>

[了解如何在 JVM 上使用 JUnit 测试代码](jvm-test-using-junit.md)。

自动 JVM 变体解析有时会给您的配置带来问题。在这种情况下，您可以显式指定必要的框架，并通过在项目 `gradle.properties` 文件中添加此行来禁用自动解析：

```text
kotlin.test.infer.jvm.variant=false
```

如果您在构建脚本中显式使用了 `kotlin("test")` 的变体，且您的项目构建因兼容性冲突停止工作，
请参阅[兼容性指南中的此问题](compatibility-guide-15.md#do-not-mix-several-jvm-variants-of-kotlin-test-in-a-single-project)。

### 设置对 kotlinx 库的依赖项

如果您使用多平台库并需要依赖于共享代码，请在共享源集中仅设置一次依赖项。使用库的基础构件名称，例如 `kotlinx-coroutines-core` 或 `ktor-client-core`：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        commonMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        commonMain {
            dependencies {
                implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
            }
        }
    }
}
```

</tab>
</tabs>

如果您需要用于平台特定依赖项的 kotlinx 库，您仍然可以在相应的平台源集中使用库的基础构件名称：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        jvmMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        jvmMain {
            dependencies {
                implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%'
            }
        }
    }
}
```

</tab>
</tabs>

## 声明仓库

您可以声明一个公开可用的仓库以使用其开源依赖项。在 `repositories{}` 块中，设置仓库的名称：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
repositories {
    mavenCentral()
}
```
</tab>
<tab title="Groovy" group-key="groovy">

```groovy
repositories {
    mavenCentral()
}
```
</tab>
</tabs>

流行的仓库包括 [Maven Central](https://central.sonatype.com/) 和 [Google 的 Maven 仓库](https://maven.google.com/web/index.html)。

> 如果您也使用 Maven 项目，我们建议避免将 `mavenLocal()` 添加为仓库，因为您在 Gradle 和 Maven 项目之间切换时可能会遇到问题。如果您必须添加 `mavenLocal()` 仓库，请将其添加为 `repositories{}` 块中的最后一个仓库。更多信息请参阅 [mavenLocal() 的情况](https://docs.gradle.org/current/userguide/declaring_repositories.html#sec:case-for-maven-local)。
> 
{style="warning"}

如果您需要在多个子项目中声明相同的仓库，请在 `settings.gradle(.kts)` 文件的 `dependencyResolutionManagement{}` 块中集中声明这些仓库：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}
```
</tab>
<tab title="Groovy" group-key="groovy">

```kotlin
dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}
```
</tab>
</tabs>

子项目中声明的任何仓库都会重写集中声明的仓库。有关如何控制此行为以及有哪些可用选项的更多信息，请参阅 [Gradle 文档](https://docs.gradle.org/current/userguide/declaring_repositories.html#sub:centralized-repository-declaration)。

## 注册生成的源码
<primary-label ref="experimental-general"/>

注册生成的源码可以帮助 IDE、第三方插件和其他工具区分生成的代码和常规源码文件。
这有助于 IDE 等工具在 UI 中以不同方式高亮显示生成的代码，并在导入项目时触发生成任务。
使用 [`KotlinSourceSet`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/) 接口注册生成的源码。

要在 `build.gradle.kts` 文件中注册包含 Kotlin 文件的目录，请使用具有 [`SourceDirectorySet`](https://docs.gradle.org/current/kotlin-dsl/gradle/org.gradle.api.file/-source-directory-set/index.html) 类型的 [`generatedKotlin`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/generated-kotlin.html) 属性。例如：

```kotlin
val generatorTask = project.tasks.register("generator") {
    val outputDirectory = project.layout.projectDirectory.dir("src/main/kotlinGen")
    outputs.dir(outputDirectory)
    doLast {
        outputDirectory.file("generated.kt").asFile.writeText(
            // language=kotlin
            """
            fun printHello() {
                println("hello")
            }
            """.trimIndent()
        )
    }
}

kotlin.sourceSets.getByName("main").generatedKotlin.srcDir(generatorTask)
```

此示例创建了一个新的任务 `generator`，其输出目录为 `"src/main/kotlinGen"`。当任务运行时，
`doLast {}` 任务操作在输出目录中创建一个 `generated.kt` 文件。最后，该示例将任务的输出注册为生成的源码。

如果您正在开发 Gradle 插件，可以使用 [`allKotlinSources`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/all-kotlin-sources.html) 属性访问在 [`KotlinSourceSet.kotlin`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/kotlin.html) 和 
`KotlinSourceSet.generatedKotlin` 属性中注册的所有源码。

## 下一步是什么？

详细了解：
* [编译器选项及如何传递它们](gradle-compiler-options.md)。
* [增量编译、缓存支持、构建报告和 Kotlin 守护进程](gradle-compilation-and-caches.md)。
* [Gradle 基础知识和细节](https://docs.gradle.org/current/userguide/userguide.html)。
* [支持 Gradle 插件变体](gradle-plugin-variants.md)。