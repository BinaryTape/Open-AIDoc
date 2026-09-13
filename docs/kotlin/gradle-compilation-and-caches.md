[//]: # (title: Kotlin Gradle 插件中的编译与缓存)

在本页面中，您可以了解以下主题：
* [增量编译](#incremental-compilation)
* [Gradle 构建缓存支持](#gradle-build-cache-support)
* [Gradle 配置缓存支持](#gradle-configuration-cache-support)
* [Kotlin 守护进程及其在 Gradle 中的使用](#the-kotlin-daemon-and-how-to-use-it-with-gradle)
* [回退到之前的编译器](#rolling-back-to-the-previous-compiler)
* [定义 Kotlin 编译器执行策略](compiler-execution-strategy.md)
* [Kotlin 编译器回退策略](compiler-execution-strategy.md#fallback-strategy)
* [尝试最新的语言版本](#trying-the-latest-language-version)
* [构建报告](#build-reports)

## 增量编译 {id="incremental-compilation"}

Kotlin Gradle 插件支持增量编译，该功能对 Kotlin/JVM 和 Kotlin/JS 项目默认启用。
增量编译会跟踪构建之间类路径中文件的更改，从而仅编译受这些更改影响的文件。
此方法可与 [Gradle 构建缓存](#gradle-build-cache-support)配合使用，并支持[编译回避](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java_compile_avoidance)。

对于 Kotlin/JVM，增量编译依赖于类路径快照，
类路径快照捕获模块的 API 结构以确定何时需要重新编译。
为了优化整体流水线，Kotlin 编译器使用两种类型的类路径快照：

* **细粒度快照：** 包含关于类成员（如属性或函数）的详细信息。
当检测到成员级的更改时，Kotlin 编译器仅重新编译依赖于已修改成员的类。
为了保持性能，Kotlin Gradle 插件会为 Gradle 缓存中的 `.jar` 文件创建粗粒度快照。
* **粗粒度快照：** 仅包含类的 [ABI](https://en.wikipedia.org/wiki/Application_binary_interface) 哈希。
当 ABI 的一部分发生变化时，Kotlin 编译器会重新编译依赖于该更改类的所有类。
这对于更改频率较低的类（如外部库）非常有用。

> Kotlin/JS 项目使用基于历史文件的不同增量编译方法。 
>
{style="note"}

有几种方法可以禁用增量编译：

* 对于 Kotlin/JVM，设置 `kotlin.incremental=false`。
* 对于 Kotlin/JS 项目，设置 `kotlin.incremental.js=false`。
* 使用 `-Pkotlin.incremental=false` 或 `-Pkotlin.incremental.js=false` 作为命令行参数。

  该参数应添加到每个后续构建中。

当您禁用增量编译时，增量缓存将在构建后失效。第一次构建绝不是增量构建。

> 有时增量编译的问题会在故障发生几个轮次后才显现出来。请使用[构建报告](#build-reports)
> 来跟踪更改和编译的历史记录。这可以帮助您提供可复现的错误报告。
>
{style="tip"}

要了解有关我们当前增量编译方法的工作原理及其与之前方法的比较的更多信息，
请参阅我们的[博客文章](https://blog.jetbrains.com/kotlin/2022/07/a-new-approach-to-incremental-compilation-in-kotlin/)。

## Gradle 构建缓存支持 {id="gradle-build-cache-support"}

Kotlin 插件使用 [Gradle 构建缓存](https://docs.gradle.org/current/userguide/build_cache.html)，该缓存存储构建输出以便在未来的构建中重用。

要禁用所有 Kotlin 任务的缓存，请将系统属性 `kotlin.caching.enabled` 设置为 `false`
（使用参数 `-Dkotlin.caching.enabled=false` 运行构建）。

## Gradle 配置缓存支持 {id="gradle-configuration-cache-support"}

Kotlin 插件使用 [Gradle 配置缓存](https://docs.gradle.org/current/userguide/configuration_cache.html)，
通过为后续构建重用配置阶段的结果来加快构建过程。

请参阅 [Gradle 文档](https://docs.gradle.org/current/userguide/configuration_cache.html#config_cache:usage)
了解如何启用配置缓存。在您启用此功能后，Kotlin Gradle 插件会自动开始使用它。

## Kotlin 守护进程及其在 Gradle 中的使用 {id="the-kotlin-daemon-and-how-to-use-it-with-gradle"}

[Kotlin 守护进程](kotlin-daemon.md)：
* 与 Gradle 守护进程一起运行以编译项目。
* 当您使用 IntelliJ IDEA 内置构建系统编译项目时，与 Gradle 守护进程分开运行。

当其中一个 Kotlin 编译任务开始编译源码时，Kotlin 守护进程在 Gradle [执行阶段](https://docs.gradle.org/current/userguide/build_lifecycle.html#sec:build_phases)启动。
Kotlin 守护进程会随 Gradle 守护进程停止，或者在没有 Kotlin 编译的 2 小时空闲后停止。

Kotlin 守护进程使用与 Gradle 守护进程相同的 JDK。

### 设置 Kotlin 守护进程的 JVM 参数 {id="setting-kotlin-daemon-s-jvm-arguments"}

以下每种设置参数的方法都会覆盖其之前的方法：
* [Gradle 守护进程参数继承](#gradle-daemon-arguments-inheritance)
* [`kotlin.daemon.jvm.options` 系统属性](#kotlin-daemon-jvm-options-system-property)
* [`kotlin.daemon.jvmargs` 属性](#kotlin-daemon-jvmargs-property)
* [`kotlin` 扩展](#kotlin-extension)
* [特定任务定义](#specific-task-definition)

#### Gradle 守护进程参数继承 {id="gradle-daemon-arguments-inheritance"}

默认情况下，Kotlin 守护进程从 Gradle 守护进程继承一组特定的参数，但会使用直接为 Kotlin 守护进程指定的任何 JVM 参数覆盖它们。例如，如果您在 `gradle.properties` 文件中添加以下 JVM 参数：

```none
org.gradle.jvmargs=-Xmx1500m -Xms500m -XX:MaxMetaspaceSize=1g
```

这些参数随后会被添加到 Kotlin 守护进程的 JVM 参数中：

```none
-Xmx1500m -XX:ReservedCodeCacheSize=320m -XX:MaxMetaspaceSize=1g -XX:UseParallelGC -ea -XX:+UseCodeCacheFlushing -XX:+HeapDumpOnOutOfMemoryError -Djava.awt.headless=true -Djava.rmi.server.hostname=127.0.0.1 --add-exports=java.base/sun.nio.ch=ALL-UNNAMED
```

> 要了解有关 Kotlin 守护进程在使用 JVM 参数时的默认行为的更多信息，请参阅 [Kotlin 守护进程在使用 JVM 参数时的行为](#kotlin-daemon-s-behavior-with-jvm-arguments)。
>
{style="note"}

#### kotlin.daemon.jvm.options 系统属性 {id="kotlin-daemon-jvm-options-system-property"}

如果 Gradle 守护进程的 JVM 参数具有 `kotlin.daemon.jvm.options` 系统属性 —— 请在 `gradle.properties` 文件中使用它：

```none
org.gradle.jvmargs=-Dkotlin.daemon.jvm.options=-Xmx1500m,Xms500m
```

传递参数时，请遵循以下规则：
* **仅**在参数 `Xmx`、`XX:MaxMetaspaceSize` 和 `XX:ReservedCodeCacheSize` 之前使用减号 `-`。
* 使用逗号 (`,`) 分隔参数，且*不加*空格。空格之后的参数将用于 Gradle 守护进程，而不是 Kotlin 守护进程。

> 如果满足以下所有条件，Gradle 将忽略这些属性：
> * Gradle 正在使用 JDK 1.9 或更高版本。
> * Gradle 的版本在 7.0 到 7.1.1 之间（含）。
> * Gradle 正在编译 Kotlin DSL 脚本。
> * Kotlin 守护进程未运行。
>
> 要解决此问题，请将 Gradle 升级到 7.2（或更高版本）或使用 `kotlin.daemon.jvmargs` 属性 —— 参见下一节。
>
{style="warning"}

#### kotlin.daemon.jvmargs 属性 {id="kotlin-daemon-jvmargs-property"}

您可以在 `gradle.properties` 文件中添加 `kotlin.daemon.jvmargs` 属性：

```none
kotlin.daemon.jvmargs=-Xmx1500m -Xms500m
```

请注意，如果您不在此处或 Gradle 的 JVM 参数中指定 `ReservedCodeCacheSize` 参数，Kotlin Gradle 插件将应用默认值 `320m`：

```none
-Xmx1500m -XX:ReservedCodeCacheSize=320m -Xms500m
```

#### kotlin 扩展 {id="kotlin-extension"}

您可以在 `kotlin` 扩展中指定参数：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    kotlinDaemonJvmArgs = listOf("-Xmx486m", "-Xms256m", "-XX:+UseParallelGC")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    kotlinDaemonJvmArgs = ["-Xmx486m", "-Xms256m", "-XX:+UseParallelGC"]
}
```

</tab>
</tabs>

#### 特定任务定义 {id="specific-task-definition"}

您可以为特定任务指定参数：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType<CompileUsingKotlinDaemon>().configureEach {
    kotlinDaemonJvmArguments.set(listOf("-Xmx486m", "-Xms256m", "-XX:+UseParallelGC"))
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.withType(CompileUsingKotlinDaemon).configureEach { task ->
    task.kotlinDaemonJvmArguments = ["-Xmx1g", "-Xms512m"]
}
```

</tab>
</tabs>

> 在这种情况下，一个新的 Kotlin 守护进程实例可能会在任务执行时启动。详细了解 [Kotlin 守护进程在使用 JVM 参数时的行为](#kotlin-daemon-s-behavior-with-jvm-arguments)。
>
{style="note"}

### Kotlin 守护进程在使用 JVM 参数时的行为 {id="kotlin-daemon-s-behavior-with-jvm-arguments"}

在配置 Kotlin 守护进程的 JVM 参数时，请注意：

* 当不同的子项目或任务具有不同的 JVM 参数集时，预期会有多个 Kotlin 守护进程实例同时运行。
* 仅当 Gradle 运行相关的编译任务且现有的 Kotlin 守护进程不具有相同的 JVM 参数集时，才会启动新的 Kotlin 守护进程实例。
  假设您的项目有很多子项目。其中大多数需要为 Kotlin 守护进程提供一些堆内存，但有一个模块需要很多（尽管它很少被编译）。
  在这种情况下，您应该为该模块提供不同的 JVM 参数集，以便只有在开发者接触这个特定模块时，才会启动具有更大堆大小的 Kotlin 守护进程。
  > 如果您已经在运行一个具有足够堆大小来处理编译请求的 Kotlin 守护进程，即使其他请求的 JVM 参数不同，该守护进程也将被重用，而不是启动一个新的。
  >
  {style="note"}

如果未指定以下参数，Kotlin 守护进程将从 Gradle 守护进程继承它们：

* `-Xmx`
* `-XX:MaxMetaspaceSize`
* `-XX:ReservedCodeCacheSize`。如果未指定或继承，默认值为 `320m`。

Kotlin 守护进程具有以下默认 JVM 参数：
* `-XX:UseParallelGC`。仅当未指定其他垃圾回收器时才会应用此参数。
* `-ea`
* `-XX:+UseCodeCacheFlushing`
* `-Djava.awt.headless=true`
* `-D{java.servername.property}={localhostip}`
* `--add-exports=java.base/sun.nio.ch=ALL-UNNAMED`。此参数仅适用于 JDK 16 或更高版本。

> Kotlin 守护进程的默认 JVM 参数列表可能会因版本而异。您可以使用像 [VisualVM](https://visualvm.github.io/) 这样的工具来检查正在运行的 JVM 进程（如 Kotlin 守护进程）的实际设置。
>
{style="note"}

## 回退到之前的编译器 {id="rolling-back-to-the-previous-compiler"}

从 Kotlin 2.0.0 开始，默认使用 K2 编译器。

要从 Kotlin 2.0.0 开始使用之前的编译器，可以：

* 在您的 `build.gradle.kts` 文件中，[设置您的语言版本](gradle-compiler-options.md#example-of-setting-languageversion)为 `1.9`。

  或者
* 使用以下编译器选项：`-language-version 1.9`。

要了解有关 K2 编译器优势的更多信息，请参阅 [K2 编译器迁移指南](k2-compiler-migration-guide.md)。

## 尝试最新的语言版本 {id="trying-the-latest-language-version"}

从 Kotlin 2.0.0 开始，要尝试最新的语言版本，请在您的 `gradle.properties` 文件中设置 `kotlin.experimental.tryNext` 属性。当您使用此属性时，Kotlin Gradle 插件会将语言版本增加到比您 Kotlin 版本的默认值高一个级别的版本。例如，在 Kotlin 2.0.0 中，默认语言版本是 2.0，因此该属性会将语言版本配置为 2.1。

或者，您可以运行以下命令：

```shell
./gradlew assemble -Pkotlin.experimental.tryNext=true
``` 

在[构建报告](#build-reports)中，您可以找到用于编译每个任务的语言版本。

## 构建报告 {id="build-reports"}

构建报告包含不同编译阶段的持续时间以及编译无法增量的任何原因。
当编译时间太长或对于同一项目不同时，请使用构建报告来调查性能问题。

Kotlin 构建报告比 [Gradle 构建扫描](https://scans.gradle.com/)（其粒度单位为单个 Gradle 任务）能更高效地帮助您调查构建性能问题。

分析长时间运行编译的构建报告可以帮助您解决两种常见情况：
* 构建不是增量的。分析原因并修复潜在问题。
* 构建是增量的但耗时太长。尝试重新组织源文件 —— 拆分大文件、将单独的类保存在不同的文件中、重构大型类、在不同的文件中声明顶层函数等等。

构建报告还显示项目中使用的 Kotlin 版本。此外，从 Kotlin 1.9.0 开始，您可以在 [Gradle 构建扫描](https://scans.gradle.com/)中查看用于编译代码的编译器。

了解[如何阅读构建报告](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/#how_to_read_build_reports)以及 [JetBrains 如何使用构建报告](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/#how_we_use_build_reports_in_jetbrains)。

### 启用构建报告 {id="enabling-build-reports"}

要启用构建报告，请在 `gradle.properties` 中声明保存构建报告输出的位置：

```none
kotlin.build.report.output=file
```

输出可以使用以下值及其组合：

| 选项 | 描述 |
|---|---|
| `file` | 将构建报告以可读格式保存到本地文件。默认情况下，它是 `${project_folder}/build/reports/kotlin-build/${project_name}-timestamp.txt` |
| `single_file` | 将构建报告以对象格式保存到指定的本地文件。 |
| `build_scan` | 将构建报告保存到 [build scan](https://scans.gradle.com/) 的 `custom values` 部分。请注意，Gradle Enterprise 插件限制了自定义值的数量及其长度。在大项目中，某些值可能会丢失。 |
| `http` | 使用 HTTP(S) 发布构建报告。POST 方法以 JSON 格式发送指标。您可以在 [Kotlin 仓库](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-plugin/src/common/kotlin/org/jetbrains/kotlin/gradle/report/data/GradleCompileStatisticsData.kt)中查看所发送数据的当前版本。您可以在[这篇博客文章](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/#enable_build_reports)中找到 HTTP 端点的示例 |
| `json` | 将构建报告以 JSON 格式保存到本地文件。默认情况下，其名称为 `${project_folder}/build/reports/kotlin-build/${project_name}-build-<date-time>-<index>.json`。 |

以下是 `kotlin.build.report` 的可用选项列表：

```none
# 必填输出。允许任何组合
kotlin.build.report.output=file,single_file,http,build_scan,json

# 如果使用 single_file 输出，则为必填。放置报告的位置 
# 用来替代已弃用的 `kotlin.internal.single.build.metrics.file` 属性
kotlin.build.report.single_file=my/directory/path/some_filename

# 可选。基于文件或 JSON 报告的输出目录。默认：build/reports/kotlin-build/
kotlin.build.report.file.output_dir=kotlin-reports

# 可选。用于标记构建报告的标签（例如，调试参数）
kotlin.build.report.label=some_label
```

仅适用于 HTTP 的选项：

```none
# 必填。发布基于 HTTP(S) 的报告的位置
kotlin.build.report.http.url=http://127.0.0.1:8080

# 可选。如果 HTTP 端点需要身份验证，则提供用户名和密码
kotlin.build.report.http.user=someUser
kotlin.build.report.http.password=somePassword

# 可选。将构建的 Git 分支名称添加到构建报告中
kotlin.build.report.http.include_git_branch.name=true|false

# 可选。将编译器参数添加到构建报告中
# 如果项目包含许多模块，报告中的编译器参数可能会非常沉重且不太有帮助
kotlin.build.report.include_compiler_arguments=true|false
```

### 自定义值的限制 {id="limit-of-custom-values"}

为了收集构建扫描统计信息，Kotlin 构建报告使用了 [Gradle 的自定义值](https://docs.gradle.com/enterprise/tutorials/extending-build-scans/)。
您和不同的 Gradle 插件都可以向自定义值写入数据。自定义值的数量有限制。
请在 [Build scan 插件文档](https://docs.gradle.com/enterprise/gradle-plugin/#adding_custom_values)中查看当前最大的自定义值计数。

如果您有一个大型项目，此类自定义值的数量可能会非常多。如果该数量超过限制，您可能会在日志中看到以下消息：

```text
Maximum number of custom values (1,000) exceeded
```

要减少 Kotlin 插件生成的自定义值数量，您可以在 `gradle.properties` 中使用以下属性：

```none
kotlin.build.report.build_scan.custom_values_limit=500
```

### 关闭项目和系统属性的收集 {id="switching-off-collecting-project-and-system-properties"}

HTTP 构建统计日志可能包含一些项目和系统属性。这些属性可以改变构建行为，因此在构建统计中记录它们很有用。
这些属性可能会存储敏感数据，例如密码或项目的完整路径。

您可以通过在 `gradle.properties` 中添加 `kotlin.build.report.http.verbose_environment` 属性来禁用这些统计信息的收集。

> JetBrains 不会收集这些统计信息。您可以选择[存储报告的位置](#enabling-build-reports)。
> 
{style="note"}

## 下一步 {id="what-s-next"}

详细了解：
* [Gradle 基础知识与特性](https://docs.gradle.org/current/userguide/userguide.html)。
* [对 Gradle 插件变体的支持](gradle-plugin-variants.md)。
* [编译器执行策略](compiler-execution-strategy.md)