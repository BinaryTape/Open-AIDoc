[//]: # (title: 从命令行运行 KSP)

大多数项目通过 Gradle 插件使用 KSP，该插件会在编译期间自动运行 KSP。你也可以从命令行使用 KSP，但这通常仅用于集成其他构建系统、开发处理器、进行测试或调试。

由于 KSP 是一个 JVM 应用程序，请使用 `java` 命令从命令行启动 KSP。提供类路径和任何必要的实参：

```bash
java -cp <classpath> <mainclass> <options> <processor>
```

| 实参            | 描述                                     |
|---------------|----------------------------------------|
| `<classpath>` | KSP 运行时 JAR 文件及其依赖项的路径。                 |
| `<mainclass>` | 特定平台的 KSP 入口点之一。                       |
| `<options>`   | KSP 的命令行选项。                            |
| `<processor>` | 处理器 JAR 文件的路径。                         |

## 类路径

与 Gradle 插件不同，`java` 命令不会自动解析依赖项。你必须在类路径上提供 KSP 运行时 JAR 文件及其依赖项。

从 [KSP 发布页面](https://github.com/google/ksp/releases/tag/%kspVersion%) 下载 `artifacts.zip`。该压缩包包含所需的 KSP JAR 文件：

* `symbol-processing-aa-%kspVersion%.jar`

* `symbol-processing-common-deps-%kspVersion%.jar`

* `symbol-processing-api-%kspVersion%.jar`

你还必须包含来自 Maven 仓库的以下运行时依赖项：

* [`kotlin-stdlib-%kotlinVersion%.jar`](https://mvnrepository.com/artifact/org.jetbrains.kotlin/kotlin-stdlib)

* [`kotlinx-coroutines-core-jvm-%coroutinesVersion%.jar`](https://mvnrepository.com/artifact/org.jetbrains.kotlinx/kotlinx-coroutines-core-jvm)

## 主类

因为 KSP 是一个 JVM 应用程序，所以你必须指定要启动的主类。KSP 为每个受支持的平台提供了不同的入口点：

| 入口点             | 平台                                                     |
|-----------------|--------------------------------------------------------|
| `KSPJvmMain`    | Kotlin/JVM 和 Android                                   |
| `KSPJsMain`     | Kotlin/JS                                              |
| `KSPNativeMain` | Kotlin/Native 目标，例如 iOS、macOS、Linux 和 Windows。         |
| `KSPCommonMain` | Kotlin Multiplatform 项目中的公共编译 (Common compilations)。 |

使用 `java` 启动 KSP 时，请指定完整类名。例如：

```bash
java -cp <classpath> com.google.devtools.ksp.cmdline.KSPJvmMain <options> <processor>
```

以下示例使用 `KSPJvmMain` 为 JVM 目标运行 KSP：

```bash
java -cp \
symbol-processing-aa-%kspVersion%.jar:symbol-processing-common-deps-%kspVersion%.jar:symbol-processing-api-%kspVersion%.jar:kotlin-stdlib-2.3.20.jar:kotlinx-coroutines-core-jvm-1.10.2.jar \
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

## 选项

从命令行运行时，KSP 需要以下选项：

| 选项                            | 描述                                                                                                                              |
|-------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| `-language-version=<version>` | 项目中使用的 [Kotlin 语言版本](https://kotlinlang.org/docs/compiler-reference.html#language-version-version)。                          |
| `-api-version=<version>`      | [Kotlin API 版本](https://kotlinlang.org/docs/compiler-reference.html#api-version-version)。                                      |
| `-jvm-target=<version>`       | 目标 JVM 版本。                                                                                                                       |
| `-module-name=<name>`         | 模块名称。                                                                                                                           |
| `-source-roots=<paths>`       | 源码根目录。对于多个目录，请使用冒号分隔的列表。                                                                                                        |
| `-project-base-dir=<path>`    | 项目根目录。                                                                                                                          |
| `-output-base-dir=<path>`     | KSP 输出的基目录。                                                                                                                      |
| `-caches-dir=<path>`          | KSP 缓存的目录。                                                                                                                      |
| `-java-output-dir=<path>`     | 生成的 Java 文件的目录。                                                                                                                 |
| `-class-output-dir=<path>`    | 生成的类文件的目录。                                                                                                                      |
| `-kotlin-output-dir=<path>`   | 生成的 Kotlin 文件的目录。                                                                                                               |
| `-resource-output-dir=<path>` | 生成的资源的目录。                                                                                                                       |
| `<processor>`                 | 处理器类路径。                                                                                                                         |

### 其他有用选项

* `-libraries=<path>`：用于解析源文件所引用的依赖项的类路径。通常是模块的编译类路径。

* `-jdk-home=<path>`：JDK 主目录。当处理器解析 Java 符号并需要访问 Java 标准库时使用。

* `-friends=<path>`：当前模块的友元模块类路径。这通常是模块的友元类路径。有关详细信息，请参阅 [友元模块](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.tasks/-base-kotlin-compile/friend-paths.html)。

> KSP 还支持 `-Dksp.logging` JVM 系统属性，用于设置日志级别。有效值为 `error`、`warn` 或 `warning`、`info` 和 `debug`。默认值为 `warn`。KSP 会将不支持的值视为 `warn`。
>
{style="tip"}

要查看选项的完整列表，请运行以下命令：

```bash
java -cp <classpath> <mainclass> -h