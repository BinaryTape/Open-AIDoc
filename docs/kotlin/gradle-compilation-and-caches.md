[//]: # (title: Kotlin Gradle 插件中的编译与缓存)

在本页面中，你可以了解以下主题：
* [增量编译](#incremental-compilation)
* [Gradle 构建缓存支持](#gradle-build-cache-support)
* [Gradle 配置缓存支持](#gradle-configuration-cache-support)
* [Kotlin daemon 及其在 Gradle 中的使用方式](#the-kotlin-daemon-and-how-to-use-it-with-gradle)
* [回滚到先前的编译器](#rolling-back-to-the-previous-compiler)
* [定义 Kotlin 编译器执行策略](compiler-execution-strategy.md)
* [Kotlin 编译器回退策略](compiler-execution-strategy.md#fallback-strategy)
* [尝试最新的语言版本](#trying-the-latest-language-version)
* [构建报告](#build-reports)

## 增量编译 {id="incremental-compilation"}

Kotlin Gradle 插件支持增量编译，对于 Kotlin/JVM 和 Kotlin/JS 项目默认启用。
增量编译会跟踪两次构建之间类路径中文件的更改，从而仅编译受这些更改影响的文件。
该方法可与 [Gradle 的构建缓存](#gradle-build-cache-support)配合使用，并支持[避免编译](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java_compile_avoidance)。

对于 Kotlin/JVM，增量编译依赖于类路径快照，
它们捕获模块的 API 结构以确定何时需要重新编译。
为了优化整个流水线，Kotlin 编译器使用两种类型的类路径快照：

* **细粒度快照：** 包含有关类成员（例如属性或函数）的详细信息。
当检测到成员级别的更改时，Kotlin 编译器仅重新编译依赖于已修改成员的类。
为了保持性能，Kotlin Gradle 插件会为 Gradle 缓存中的 `.jar` 文件创建粗粒度快照。
* **粗粒度快照：** 仅包含类的 [ABI](https://en.wikipedia.org/wiki/Application_binary_interface) 哈希。
当 ABI 的某部分发生更改时，Kotlin 编译器会重新编译依赖于已更改类的所有类。
这对于不经常更改的类（例如外部库）非常有用。

> Kotlin/JS 项目使用基于历史文件的不同增量编译方法。 
>
{style="note"}

有几种禁用增量编译的方法：

* 针对 Kotlin/JVM 设置 `kotlin.incremental=false`。
* 针对 Kotlin/JS 项目设置 `kotlin.incremental.js=false`。
* 使用 `-Pkotlin.incremental=false` 或 `-Pkotlin.incremental.js=false` 作为命令行实参。

  该实参应添加到每个后续构建中。

禁用增量编译后，增量缓存会在构建后失效。首次构建始终不是增量的。

> 有时增量编译的问题会在失败发生数轮之后才显现出来。请使用[构建报告](#build-reports)来跟踪更改和编译的历史记录。这有助于你提供可复现的错误报告。
>
{style="tip"}

要详细了解我们当前的增量编译方法如何运作并与先前的方法进行对比，
请参阅我们的[博客文章](https://blog.jetbrains.com/kotlin/2022/07/a-new-approach-to-incremental-compilation-in-kotlin/)。

## Gradle 构建缓存支持 {id="gradle-build-cache-support"}

Kotlin 插件使用 [Gradle 构建缓存](https://docs.gradle.org/current/userguide/build_cache.html)，该缓存用于存储构建输出以便在将来的构建中复用。

如需为所有 Kotlin 任务禁用缓存，请将系统属性 `kotlin.caching.enabled` 设置为 `false`
（使用实参 `-Dkotlin.caching.enabled=false` 运行构建）。

## Gradle 配置缓存支持 {id="gradle-configuration-cache-support"}

Kotlin 插件使用 [Gradle 配置缓存](https://docs.gradle.org/current/userguide/configuration_cache.html)，
通过在后续构建中复用配置阶段的结果来加快构建过程。

请参阅 [Gradle 文档](https://docs.gradle.org/current/userguide/configuration_cache.html#config_cache:usage)了解如何启用配置缓存。启用此功能后，Kotlin Gradle 插件会自动开始使用它。

## Kotlin daemon 及其在 Gradle 中的使用方式 {id="the-kotlin-daemon-and-how-to-use-it-with-gradle"}

[Kotlin daemon](kotlin-daemon.md)：
* 与 Gradle daemon 一起运行来编译项目。
* 当你使用 IntelliJ IDEA 内置构建系统编译项目时，与 Gradle daemon 分开运行。

Kotlin daemon 在 Gradle [执行阶段](https://docs.gradle.org/current/userguide/build_lifecycle.html#sec:build_phases)启动，
此时某个 Kotlin 编译任务开始编译源代码。
Kotlin daemon 会在 Gradle daemon 停止时，或者在没有进行 Kotlin 编译且空闲两小时后停止。

Kotlin daemon 使用与 Gradle daemon 相同的 JDK。

### 设置 Kotlin daemon 的 JVM 实参 {id="setting-kotlin-daemon-s-jvm-arguments"}

以下每种设置实参的方式都会覆盖排在它前面的方式：
* [Gradle daemon 实参继承](#gradle-daemon-arguments-inheritance)
* [`kotlin.daemon.jvm.options` 系统属性](#kotlin-daemon-jvm-options-system-property)
* [`kotlin.daemon.jvmargs` 属性](#kotlin-daemon-jvmargs-property)
* [`kotlin` 扩展程序](#kotlin-extension)
* [特定任务定义](#specific-task-definition)

#### Gradle daemon 实参继承 {id="gradle-daemon-arguments-inheritance"}

默认情况下，Kotlin daemon 从 Gradle daemon 继承一组特定实参，但会使用直接为 Kotlin daemon 指定的任何 JVM 实参将其覆盖。例如，如果你在 `gradle.properties` 文件中添加以下 JVM 实参：

```none
org.gradle.jvmargs=-Xmx1500m -Xms500m -XX:MaxMetaspaceSize=1g
```

这些实参随后会被添加到 Kotlin daemon 的 JVM 实参中：

```none
-Xmx1500m -XX:ReservedCodeCacheSize=320m -XX:MaxMetaspaceSize=1g -XX:UseParallelGC -ea -XX:+UseCodeCacheFlushing -XX:+HeapDumpOnOutOfMemoryError -Djava.awt.headless=true -Djava.rmi.server.hostname=127.0.0.1 --add-exports=java.base/sun.nio.ch=ALL-UNNAMED
```

> 要详细了解 Kotlin daemon 在 JVM 实参方面的默认行为，请参阅 [Kotlin daemon 对 JVM 实参的行为](#kotlin-daemon-s-behavior-with-jvm-arguments)。
>
{style="note"}

#### kotlin.daemon.jvm.options 系统属性 {id="kotlin-daemon-jvm-options-system-property"}

如果 Gradle daemon 的 JVM 实参具有 `kotlin.daemon.jvm.options` 系统属性——请在 `gradle.properties` 文件中使用它：

```none
org.gradle.jvmargs=-Dkotlin.daemon.jvm.options=-Xmx1500m,Xms500m
```

传递实参时，请遵循以下规则：
* **仅**在实参 `Xmx`、`XX:MaxMetaspaceSize` 和 `XX:ReservedCodeCacheSize` 前使用减号 `-`。
* 使用逗号（`,`）分隔实参，且_不带_空格。空格后面的实参将用于 Gradle daemon，而不是 Kotlin daemon。

> 如果满足以下所有条件，Gradle 会忽略这些属性：
> * Gradle 使用 JDK 1.9 或更高版本。
> * Gradle 的版本在 7.0 到 7.1.1 之间（包含首尾）。
> * Gradle 正在编译 Kotlin DSL 脚本。
> * Kotlin daemon 未运行。
>
> 要解决此问题，请将 Gradle 升级到 7.2 版本（或更高版本），或者使用 `kotlin.daemon.jvmargs` 属性——请参阅下一节。
>
{style="warning"}

#### kotlin.daemon.jvmargs 属性 {id="kotlin-daemon-jvmargs-property"}

你可以在 `gradle.properties` 文件中添加 `kotlin.daemon.jvmargs` 属性：

```none
kotlin.daemon.jvmargs=-Xmx1500m -Xms500m
```

请注意，如果你没有在此处或 Gradle 的 JVM 实参中指定 `ReservedCodeCacheSize` 实参，Kotlin Gradle 插件会应用默认值 `320m`：

```none
-Xmx1500m -XX:ReservedCodeCacheSize=320m -Xms500m
```

#### kotlin 扩展程序 {id="kotlin-extension"}

你可以在 `kotlin` 扩展程序中指定实参：

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

你可以为特定任务指定实参：

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

> 在这种情况下，任务执行时可能会启动一个新的 Kotlin daemon 实例。详细了解 [Kotlin daemon 对 JVM 实参的行为](#kotlin-daemon-s-behavior-with-jvm-arguments)。
>
{style="note"}

### Kotlin daemon 对 JVM 实参的行为 {id="kotlin-daemon-s-behavior-with-jvm-arguments"}

在配置 Kotlin daemon 的 JVM 实参时，请注意：

* 当不同的子项目或任务具有不同的 JVM 实参集时，同时运行多个 Kotlin daemon 实例是预期之中的。
* 仅当 Gradle 运行相关的编译任务且现有的 Kotlin daemon 没有相同的 JVM 实参集时，才会启动新的 Kotlin daemon 实例。
  假设你的项目有很多子项目。其中大多数只需要为 Kotlin daemon 分配一定的堆内存，但有一个模块需要大量内存（尽管它很少被编译）。
  在这种情况下，你应该为该模块提供不同的 JVM 实参集，以便仅对修改此特定模块的开发者启动具有更大堆大小的 Kotlin daemon。
  > 如果你已经运行了一个具有足够堆大小来处理编译请求的 Kotlin daemon，
  > 即使其他请求的 JVM 实参不同，该 daemon 也会被复用，而不是启动新的 daemon。
  >
  {style="note"}

如果未指定以下实参，Kotlin daemon 将从 Gradle daemon 继承它们：

* `-Xmx`
* `-XX:MaxMetaspaceSize`
* `-XX:ReservedCodeCacheSize`。如果未指定也未继承，默认值为 `320m`。

Kotlin daemon 具有以下默认 JVM 实参：
* `-XX:UseParallelGC`。仅在未指定其他垃圾回收器时才会应用此实参。
* `-ea`
* `-XX:+UseCodeCacheFlushing`
* `-Djava.awt.headless=true`
* `-D{java.servername.property}={localhostip}`
* `--add-exports=java.base/sun.nio.ch=ALL-UNNAMED`。此实参仅适用于 JDK 16 或更高版本。

> Kotlin daemon 的默认 JVM 实参列表在不同版本之间可能会有所不同。你可以使用像 [VisualVM](https://visualvm.github.io/) 这样的工具来检查正在运行的 JVM 进程（如 Kotlin daemon）的实际设置。
>
{style="note"}

## 回滚到先前的编译器 {id="rolling-back-to-the-previous-compiler"}

从 Kotlin 2.0.0 开始，默认使用 K2 编译器。

要在 Kotlin 2.0.0–2.3.21 中使用先前的编译器，可以执行以下任一操作：

* 在你的 `build.gradle.kts` 文件中，[将语言版本设置](gradle-compiler-options.md#example-of-setting-languageversion)为 `1.9`。

  或者
* 使用以下编译器选项：`-language-version 1.9`。

从 Kotlin 2.4.0 开始，你将无法回滚到先前的编译器。

要详细了解 K2 编译器的优势，请参阅 [K2 编译器迁移指南](k2-compiler-migration-guide.md)。

## 尝试最新的语言版本 {id="trying-the-latest-language-version"}

从 Kotlin 2.0.0 开始，要尝试最新的语言版本，请在 `gradle.properties` 文件中设置 `kotlin.experimental.tryNext` 属性。
当你使用此属性时，Kotlin Gradle 插件会将语言版本递增为比你当前 Kotlin 版本的默认值高一个级别的值。
例如，在 Kotlin 2.0.0 中，默认语言版本为 2.0，因此该属性会配置语言版本 2.1。

或者，你也可以运行以下命令：

```shell
./gradlew assemble -Pkotlin.experimental.tryNext=true
``` 

在[构建报告](#build-reports)中，你可以找到用于编译每个任务的语言版本。

## 构建报告 {id="build-reports"}

构建报告包含不同编译阶段的持续时间以及编译无法进行增量编译的任何原因。
当编译时间过长或同一项目的编译时间存在差异时，请使用构建报告来调查性能问题。

相比以单个 Gradle 任务为粒度单位的 [Gradle build scans](https://scans.gradle.com/)，Kotlin 构建报告可以帮助你更高效地调查构建性能问题。

对于耗时较长的编译，分析构建报告通常可以帮助你解决两种常见情况：
* 构建不是增量的。分析原因并修复根本问题。
* 构建是增量的，但耗时过长。尝试重新组织源文件——拆分大文件、
  将单独的类保存在不同文件中、重构大型类、在不同文件中声明顶层函数等。

构建报告还会显示项目中使用的 Kotlin 版本。此外，从 Kotlin 1.9.0 开始，
你可以在 [Gradle build scans](https://scans.gradle.com/) 中查看用于编译代码的编译器。

了解[如何阅读构建报告](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/#how_to_read_build_reports)以及[JetBrains 如何使用构建报告](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/#how_we_use_build_reports_in_jetbrains)。

### 启用构建报告 {id="enabling-build-reports"}

要启用构建报告，请在 `gradle.properties` 中声明将构建报告输出保存在何处：

```none
kotlin.build.report.output=file
```

输出可使用以下值及其组合：

| 选项            | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `file`        | 以人类可读的格式将构建报告保存到本地文件。默认路径为 `${project_folder}/build/reports/kotlin-build/${project_name}-timestamp.txt`                                                                                                                                                                                                                                                                                                                                                                      |
| `single_file` | 以对象格式将构建报告保存到指定的本地文件。                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `build_scan`  | 将构建报告保存在 [build scan](https://scans.gradle.com/) 的 `custom values` 部分中。请注意，Gradle Enterprise 插件会限制自定义值的数量及其长度。在大型项目中，某些值可能会丢失。                                                                                                                                                                                                                                                                                      |
| `http`        | 使用 HTTP(S) 发送构建报告。POST 方法以 JSON 格式发送指标。你可以在 [Kotlin 仓库](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-plugin/src/common/kotlin/org/jetbrains/kotlin/gradle/report/data/GradleCompileStatisticsData.kt) 中查看所发送数据的当前版本。你可以在[这篇博客文章](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/#enable_build_reports)中找到 HTTP 端点的示例 |
| `json`        | 以 JSON 格式将构建报告保存到本地文件。默认路径为 `${project_folder}/build/reports/kotlin-build/${project_name}-build-<date-time>-<index>.json`。                                                                                                                                                                                                                                                                                                                                                         |

以下是 `kotlin.build.report` 的可用选项列表：

```none
# 必需的输出。允许任意组合
kotlin.build.report.output=file,single_file,http,build_scan,json

# 如果使用 single_file 输出则为必需。报告存放位置 
# 用于替代已弃用的 `kotlin.internal.single.build.metrics.file` 属性
kotlin.build.report.single_file=my/directory/path/some_filename

# 可选。基于文件或 JSON 的报告的输出目录。默认值：build/reports/kotlin-build/
kotlin.build.report.file.output_dir=kotlin-reports

# 可选。用于标记构建报告的标签（例如调试参数）
kotlin.build.report.label=some_label
```

仅适用于 HTTP 的选项：

```none
# 必需。基于 HTTP(S) 的报告的发送位置
kotlin.build.report.http.url=http://127.0.0.1:8080

# 可选。如果 HTTP 端点需要身份验证，填写用户名和密码
kotlin.build.report.http.user=someUser
kotlin.build.report.http.password=somePassword

# 可选。将构建的 Git 分支名称添加到构建报告中
kotlin.build.report.http.include_git_branch.name=true|false

# 可选。将编译器实参添加到构建报告中
# 如果项目包含许多模块，报告中的编译器实参可能会非常庞大且作用有限
kotlin.build.report.include_compiler_arguments=true|false
```

### 自定义值的限制 {id="limit-of-custom-values"}

为了收集 build scans 的统计信息，Kotlin 构建报告使用 [Gradle 的自定义值](https://docs.gradle.com/enterprise/tutorials/extending-build-scans/)。
你和不同的 Gradle 插件都可以将数据写入自定义值。自定义值的数量存在限制。
请参阅 [Build scan 插件文档](https://docs.gradle.com/enterprise/gradle-plugin/#adding_custom_values)中的当前最大自定义值计数。

如果你有一个大型项目，此类自定义值的数量可能会相当庞大。如果该数量超过限制，
你会在日志中看到以下消息：

```text
Maximum number of custom values (1,000) exceeded
```

要减少 Kotlin 插件生成的自定义值数量，可以在 `gradle.properties` 中使用以下属性：

```none
kotlin.build.report.build_scan.custom_values_limit=500
```

### 关闭项目和系统属性的收集 {id="switching-off-collecting-project-and-system-properties"}

HTTP 构建统计信息日志可能包含一些项目和系统属性。这些属性可以改变构建的行为，
因此在构建统计信息中记录它们很有用。
但这些属性可能存储敏感数据，例如密码或项目的完整路径。

你可以通过在 `gradle.properties` 中添加 `kotlin.build.report.http.verbose_environment` 属性来禁用这些统计信息的收集。

> JetBrains 不会收集这些统计信息。由你选择[存储报告的位置](#enabling-build-reports)。
> 
{style="note"}

## 下一步 {id="what-s-next"}

详细了解：
* [Gradle 基础知识与具体细节](https://docs.gradle.org/current/userguide/userguide.html)。
* [对 Gradle 插件变体的支持](gradle-plugin-variants.md)。
* [编译器执行策略](compiler-execution-strategy.md)。