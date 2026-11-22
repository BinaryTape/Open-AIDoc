[//]: # (title: 从命令行运行 KSP)

<web-summary>了解如何在不使用 Gradle 的 KSP 插件的情况下从命令行运行 KSP。</web-summary>

大多数项目通过 [Gradle 的 KSP 插件](https://central.sonatype.com/artifact/com.google.devtools.ksp/com.google.devtools.ksp.gradle.plugin)来使用 KSP，该插件会在编译期间自动运行 KSP。作为替代方案，你也可以从命令行运行 KSP。如果你需要将 KSP 与其他构建系统集成、开发处理器，或者测试和调试代码，这种方式会非常有用。

由于 KSP 是一个 JVM 应用程序，请使用 `java` 命令从命令行启动 KSP。提供类路径（classpath）以及任何必要的实参：

```bash
java -cp <classpath> <mainclass> <options> <processor>
```

| 实参 | 描述 |
|---------------|---------------------------------------------------------------------------|
| `<classpath>` | 指向 [KSP 运行时 JAR 文件](#classpath)及其依赖项的路径。 |
| `<mainclass>` | 平台专用的 KSP [入口点](#main-class)。 |
| `<options>` | KSP 的命令行[选项](#options)。 |
| `<processor>` | 指向处理器 JAR 的路径。 |

## 类路径 {id="classpath"}

与 Gradle 的 KSP 插件不同，`java` 命令不会自动解析依赖项。你必须在类路径中提供 KSP 运行时 JAR 文件及其依赖项。

从 GitHub 上的 [KSP 发布页面](https://github.com/google/ksp/releases/tag/%kspVersion%)下载 `artifacts.zip`。该归档文件包含所需的 KSP JAR 文件：

* `symbol-processing-aa-%kspVersion%.jar`
* `symbol-processing-common-deps-%kspVersion%.jar`
* `symbol-processing-api-%kspVersion%.jar`

你还必须从 Maven 仓库中包含以下运行时依赖项：

* [`kotlin-stdlib-%kotlinVersion%.jar`](https://mvnrepository.com/artifact/org.jetbrains.kotlin/kotlin-stdlib)
* [`kotlinx-coroutines-core-jvm-%coroutinesVersion%.jar`](https://mvnrepository.com/artifact/org.jetbrains.kotlinx/kotlinx-coroutines-core-jvm)

## 主类 {id="main-class"}

由于 KSP 是一个 JVM 应用程序，因此必须指定要启动的主类。KSP 为每个受支持的平台提供了不同的入口点：

| 入口点 | 平台 |
| ----------------- | --------------------------------------------------------------- |
| `KSPJvmMain` | Kotlin/JVM 与 Android |
| `KSPJsMain` | Kotlin/JS |
| `KSPNativeMain` | Kotlin/Native 目标，例如 iOS、macOS、Linux 与 Windows |
| `KSPCommonMain` | Kotlin Multiplatform 项目中的通用（Common）编译 |

使用 `java` 启动 KSP 时，请指定完全限定类名。例如：

```bash
java -cp <classpath> com.google.devtools.ksp.cmdline.KSPJvmMain <options> <processor>
```

以下示例使用 `KSPJvmMain` 为 JVM 目标运行 KSP：

```bash
java -cp \
symbol-processing-aa-%kspVersion%.jar:\
symbol-processing-common-deps-%kspVersion%.jar:\
symbol-processing-api-%kspVersion%.jar:\
kotlin-stdlib-%kotlinVersion%.jar:\
kotlinx-coroutines-core-jvm-%coroutinesVersion%.jar \
com.google.devtools.ksp.cmdline.KSPJvmMain \
-language-version=2.0 \
-api-version=2.0 \
-jvm-target=11 \
-module-name=main \
-source-roots=project_dir/src/kotlin/main \
-project-base-dir=project_dir/ \
-output-base-dir=project_dir/build/ \
-caches-dir=project_dir/build/caches/ \
-class-output-dir=project_dir/build/out/main/classes \
-kotlin-output-dir=project_dir/build/out/main/kotlin/ \
-java-output-dir=project_dir/build/out/main/java/ \
-resource-output-dir=project_dir/build/out/main/res/ \
path/to/processor.jar
```

## 选项 {id="options"}

`KSPJvmMain` 入口点需要以下选项：

| 选项 | 描述 |
|-------------------------------|------------------------------------------------------------------------------------------------|
| `-language-version=<version>` | 项目中使用的 [Kotlin 语言版本](compiler-reference.md#language-version-version)。 |
| `-api-version=<version>` | [Kotlin API 版本](compiler-reference.md#api-version-version)。 |
| `-jvm-target=<version>` | 目标 JVM 版本。 |
| `-module-name=<name>` | 模块名称。 |
| `-source-roots=<paths>` | 源代码根目录。多个目录之间使用冒号分隔。 |
| `-project-base-dir=<path>` | 项目根目录。 |
| `-output-base-dir=<path>` | KSP 输出的基础目录。 |
| `-caches-dir=<path>` | KSP 缓存目录。 |
| `-java-output-dir=<path>` | 生成的 Java 文件所在目录。 |
| `-class-output-dir=<path>` | 生成的 class 文件所在目录。 |
| `-kotlin-output-dir=<path>` | 生成的 Kotlin 文件所在目录。 |
| `-resource-output-dir=<path>` | 生成的资源所在目录。 |
| `<processor>` | 处理器类路径。 |

其他入口点使用不同的选项集。要查看特定入口点的完整选项列表，请运行以下命令：

```bash
java -cp <classpath> <mainclass> -h
```

### 其他选项 {id="other-options"}

* `-libraries=<path>`：用于解析源文件所引用依赖项的类路径。这通常是该模块的编译类路径。
* `-jdk-home=<path>`：JDK 主目录。当处理器解析 Java 符号并需要访问 Java 标准库时使用。
* `-friends=<path>`：当前模块的好友模块（friend modules）的类路径。有关更多信息，请参阅 Kotlin Gradle 插件 API 参考中的 [`friendPaths` 属性](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.tasks/-base-kotlin-compile/friend-paths.html)。

> 你还可以使用 `-Dksp.logging` JVM 系统属性来设置日志级别。有效值为 `error`、`warn`（或 `warning`）、`info` 和 `debug`。任何其他值都会被视为 `warn`。默认值为 `warn`。
>
{style="note"}

## 另请参阅 {id="see-also"}

* 了解[增量处理](ksp-incremental.md)的工作原理以及如何从命令行对其进行调试。
* 了解如何借助 Gradle [在 Kotlin Multiplatform 项目中使用 KSP](ksp-multiplatform.md)。