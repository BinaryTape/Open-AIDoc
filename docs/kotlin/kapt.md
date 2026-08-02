[//]: # (title: kapt 编译器插件)

<tldr>

* 在以下情况下使用 **kapt**：
   * 你使用的是 Maven 项目。
   * 你使用的是 Gradle 项目，但所需的 Java 注解处理器尚不支持 KSP。[查看支持的库列表](ksp-overview.md#supported-libraries)。
* 在以下情况下使用 **[KSP](ksp-overview.md)**：
   * 你使用的是 Gradle 项目，且所需的 Java 注解处理器支持 KSP。
   * 你想要创建自己的注解处理器。

</tldr>

kapt 编译器插件允许你在 Kotlin 中使用现有的 Java 注解处理器，并同时支持 Maven 和 Gradle。
它从 Kotlin 源代码生成存根文件，然后在这些存根上运行 Java 注解处理器。

这使得在你的 Kotlin 项目中可以为 [MapStruct](https://mapstruct.org/) 和 [数据绑定](https://developer.android.com/topic/libraries/data-binding/index.html) 等库启用基于 Java 的注解处理。

> IntelliJ 构建系统不支持 kapt。要在 IntelliJ IDEA 中重新运行注解处理，请从 **Maven** 工具窗口启动构建。
>
{style="warning"}

## 设置插件

你可以为 [Gradle](#set-up-in-gradle)、[Maven](#set-up-in-maven) 配置 kapt 插件，或者在 [命令行](#cli) 中使用。

### Gradle {id="set-up-in-gradle"}

要在 Gradle 中使用 kapt，请按照以下步骤操作：

1. 在你的构建脚本文件 `build.gradle(.kts)` 中应用 `kapt` Gradle 插件：

   <tabs group="build-script">
   <tab title="Kotlin" group-key="kotlin">

   ```kotlin
   plugins {
       kotlin("kapt") version "%kotlinVersion%"
   }
   ```

   </tab>
   <tab title="Groovy" group-key="groovy">

   ```groovy
   plugins {
       id "org.jetbrains.kotlin.kapt" version "%kotlinVersion%"
   }
   ```

   </tab>
   </tabs>

2. 在 `dependencies {}` 代码块中使用 `kapt` 配置添加相应的依赖项：

   <tabs group="build-script">
   <tab title="Kotlin" group-key="kotlin">

   ```kotlin
   dependencies {
       kapt("groupId:artifactId:version")
   }
   ```

   </tab>
   <tab title="Groovy" group-key="groovy">

   ```groovy
   dependencies {
       kapt 'groupId:artifactId:version'
   }
   ```

   </tab>
   </tabs>

3. 如果你之前使用 [Android 支持](https://developer.android.com/build/annotation-processors) 来处理注解处理器，请将 `annotationProcessor` 配置的用法替换为 `kapt`。如果你的项目包含 Java 类，kapt 插件也会处理它们。

   如果你为 `androidTest` 或 `test` 源使用注解处理器，相应的 `kapt` 配置分别命名为 `kaptAndroidTest` 和 `kaptTest`。注意 `kaptAndroidTest` 和 `kaptTest` 继承自 `kapt`，因此你可以提供 `kapt` 依赖项，它将同时用于生产源码和测试。

### Maven {id="set-up-in-maven"}

你可以通过为 Kotlin Maven 插件启用 [`<extensions>` 选项](#automatic-configuration) 来简化配置，也可以通过 [手动配置](#manual-configuration) 来完全控制 kapt 的执行。

#### 自动配置

你可以通过为 Kotlin Maven 插件启用 `<extensions>` 选项来简化 kapt 配置。在这种情况下，你不需要手动设置带有目标 (goals) 或源目录的 kapt `<execution>` 部分。

要自动配置 kapt，请在你的 `pom.xml` 构建文件中为 `kotlin-maven-plugin` 将 `<extensions>` 选项设置为 `true`：

```xml
<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <extensions>true</extensions>
    <configuration>
        <annotationProcessorPaths>
            <!-- 在此处指定你的注解处理器 -->
            <annotationProcessorPath>
                <groupId>org.mapstruct</groupId>
                <artifactId>mapstruct-processor</artifactId>
                <version>1.6.3</version>
            </annotationProcessorPath>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

有关 `<extensions>` 选项的更多信息，请参阅[自动配置](maven-configure-project.md#automatic-configuration)。

#### 手动配置

要在你的 Kotlin Maven 项目中手动设置 kapt，请在 `compile` 执行之前添加来自 `kotlin-maven-plugin` 的 `kapt` 目标的执行：

```xml
<execution>
    <id>kapt</id>
    <goals>
        <goal>kapt</goal>
    </goals>
    <configuration>
        <sourceDirs>
            <sourceDir>src/main/kotlin</sourceDir>
            <sourceDir>src/main/java</sourceDir>
        </sourceDirs>
        <annotationProcessorPaths>
            <!-- 在此处指定你的注解处理器 -->
            <annotationProcessorPath>
                <groupId>org.mapstruct</groupId>
                <artifactId>mapstruct-processor</artifactId>
                <version>1.6.3</version>
            </annotationProcessorPath>
        </annotationProcessorPaths>
    </configuration>
</execution>
```

要配置注解处理模式，请在 `<configuration>` 代码块中设置 [`aptMode`](#annotation-processor-configuration) 选项。例如：

```xml
<configuration>
   ...
   <aptMode>stubs</aptMode>
</configuration>
```

### CLI

kapt 在 Kotlin 编译器的二进制分发版中作为一个独立的命令行工具可用。

要从命令行运行 kapt，请使用：

```bash
kapt <options> <source files>
```

例如：

```bash
kapt -Kapt-mode=stubsAndApt \
  -Kapt-sources=build/kapt/sources \
  -Kapt-classes=build/kapt/classes \
  -Kapt-stubs=build/kapt/stubs \
  -Kapt-classpath=lib/ap.jar \
  -Kapt-classpath=lib/anotherAp.jar \
  src/main/kotlin
```

* 参见 [kapt 特定编译器选项](#compiler-options) 的完整列表。
* 你也可以传递所有有效的 [Kotlin 编译器选项](compiler-reference.md)。运行 `kotlinc -help` 即可查看。

## 配置注解处理器

kapt 提供了控制注解处理器如何被发现、组织和执行的选项，包括管理处理器类路径、从共享配置继承处理器以及保持 javac 特有的处理器处于活跃状态。

有关更多配置选项，例如向注解处理器和 javac 传递选项，请参阅 [注解处理器配置](#annotation-processor-configuration)。

### 配置处理器类路径和发现

你可以禁用对未包含在 kapt 处理器路径中的注解处理器的发现。
这能有效地从编译类路径中排除不必要的注解处理器。

#### Gradle {id="classpath-discovery-gradle"}

Gradle 利用 [编译回避](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java_compile_avoidance) 在重新构建项目时跳过注解处理，从而缩短使用 kapt 的增量构建时间。特别是，在以下情况下会跳过注解处理：

* 项目的源文件未更改。
* 依赖项中的更改是 [ABI](https://en.wikipedia.org/wiki/Application_binary_interface) 兼容的。例如，只有函数体发生更改时。

然而，对于在编译类路径上发现的注解处理器，无法使用编译回避，因为即使处理器的 ABI 保持不变，其内部实现的更改也需要运行注解处理任务。

这就是为什么我们不建议使用来自编译类路径的注解处理器。要将这些处理器从 kapt 处理中排除，请在你的 `gradle.properties` 文件中添加 `kapt.include.compile.classpath` 属性：

```none
# gradle.properties
kapt.include.compile.classpath=false
```

当该选项设置为 `false` 时，未包含在处理器路径（即 `kapt*` 配置）中的注解处理器依赖项将从 kapt 处理中排除。

#### Maven {id="classpath-discovery-maven"}

要排除未包含在 kapt 处理器路径中的注解处理器，请在 kapt 插件的 `<execution>` 部分将 `includeCompileClasspath` 选项设置为 `false`：

```xml
<execution>
    <id>kapt</id>
    <goals>
        <goal>kapt</goal>
    </goals>
    <configuration>
        <includeCompileClasspath>false</includeCompileClasspath>
        <sourceDirs>...</sourceDirs>
        <annotationProcessorPaths>...</annotationProcessorPaths>
    </configuration>
</execution>
```

或者，你可以在 `pom.xml` 的 `<properties>` 部分使用 `kapt.include.compile.classpath` 属性：

```xml
<properties>
    <kapt.include.compile.classpath>false</kapt.include.compile.classpath>
</properties>
```

当该选项设置为 `false` 时，未包含在 `<annotationProcessorPaths>` 部分的注解处理器将从 kapt 处理中排除。

如果未设置 `includeCompileClasspath` 选项，且 kapt 在编译类路径上检测到了未在处理器路径中明确定义的注解处理器，你将看到一条弃用警告：

```none
[WARNING] Annotation processors discovery from compile classpath is deprecated.
Set 'kapt.include.compile.classpath=false' to disable discovery.
```

> 要查看未在 kapt 类路径上出现的注解处理器列表，请使用 `--info` 日志级别选项运行构建。
>
{style="tip"}

### 从超配置中继承注解处理器

你可以在一个单独的 Gradle 配置中定义一组通用的注解处理器作为超配置，并在子项目中专门针对 kapt 的配置进一步扩展它。

例如，对于使用 [MapStruct](https://mapstruct.org/) 的子项目，在你的 `build.gradle(.kts)` 文件中使用以下配置：

```kotlin
val commonAnnotationProcessors by configurations.creating
configurations.named("kapt") { extendsFrom(commonAnnotationProcessors) }

dependencies {
    implementation("org.mapstruct:mapstruct:1.6.3")
    commonAnnotationProcessors("org.mapstruct:mapstruct-processor:1.6.3")
}
```

在此示例中，`commonAnnotationProcessors` Gradle 配置是你希望在所有项目中使用的通用注解处理超配置。你使用 [`extendsFrom()`](https://docs.gradle.org/current/dsl/org.gradle.api.artifacts.Configuration.html#org.gradle.api.artifacts.Configuration:extendsFrom) 方法将 `commonAnnotationProcessors` 添加为超配置。kapt 识别到 `commonAnnotationProcessors` Gradle 配置对 MapStruct 注解处理器有依赖。因此，kapt 在其注解处理配置中包含了 MapStruct 注解处理器。

### 保留 Java 编译器的注解处理器

默认情况下，kapt 运行所有注解处理器并禁用 javac 的注解处理。
然而，你可能需要 javac 运行一些注解处理器，例如 [Lombok](https://projectlombok.org/)。

在 Gradle 构建文件中，使用选项 `keepJavacAnnotationProcessors`：

```groovy
kapt {
    keepJavacAnnotationProcessors = true
}
```

如果你使用 Maven，则需要显式配置该插件。
参见这个 [Lombok 编译器插件设置示例](lombok.md#using-with-kapt)。

## 优化 kapt 构建

kapt 提供了几种特定于 Gradle 的策略来减少注解处理时间，包括并行运行任务、利用构建缓存、缓存处理器类加载器以及使用增量注解处理。

有关影响构建行为的其他选项（如错误类型修正、存根元数据剥离和编译类路径扫描），请参阅 [行为选项](#behavioral-options)。

### 并行运行 kapt 任务

kapt 使用 [Gradle Worker API](https://docs.gradle.org/current/userguide/worker_api.html) 来运行注解处理任务。使用 Worker API 让 Gradle 能够并行运行来自单个项目的独立注解处理任务，在某些情况下，这会显著减少执行时间。

如果你在 Kotlin Gradle 插件中设置了[自定义 JDK 版本](gradle-configure-project.md#gradle-java-toolchains-support)，kapt 任务工作程序仅使用 [`processIsolation()`](https://docs.gradle.org/current/userguide/worker_api.html#step_3_change_the_isolation_mode) 模式。

如果你想为 kapt 工作进程提供额外的 JVM 实参，请使用 `KaptWithoutKotlincTask` 的输入 `kaptProcessJvmArgs`：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.internal.KaptWithoutKotlincTask>()
    .configureEach {
        kaptProcessJvmArgs.add("-Xmx512m")
    }
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.withType(org.jetbrains.kotlin.gradle.internal.KaptWithoutKotlincTask.class)
    .configureEach {
        kaptProcessJvmArgs.add('-Xmx512m')
    }
```

</tab>
</tabs>

### 安全使用 Gradle 构建缓存

kapt 注解处理任务[默认在 Gradle 中缓存](https://docs.gradle.org/current/userguide/build_cache_use_cases.html)。然而，注解处理器可以运行任意代码。这可能导致任务输入到输出的不必要转换，或者访问和修改 Gradle 无法跟踪的文件。

如果构建中使用的注解处理器无法被正确缓存，你可以禁用缓存以防止 kapt 任务出现误报的缓存命中。为此，请在构建脚本中使用 `useBuildCache` 属性：

```groovy
kapt {
    useBuildCache = false
}
```

### 为注解处理器的类加载器启用缓存

<primary-label ref="experimental-general"/>

如果你连续运行多个 Gradle 任务，为注解处理器的类加载器启用缓存有助于 kapt 运行得更快。

要启用此功能，请在你的 `gradle.properties` 文件中使用以下属性：

```none
# gradle.properties
#
# 任何正值都会启用缓存
# 使用与使用 kapt 的模块数量相同的值
kapt.classloaders.cache.size=5

# 禁用此项以使缓存工作
kapt.include.compile.classpath=false
```

如果你在注解处理器的缓存方面遇到任何问题，请为它们禁用缓存：

```none
# 指定注解处理器的全名以禁用它们的缓存
kapt.classloaders.cache.disableForProcessors=[annotation processors full names]
```

> 如果你遇到该功能的任何问题，我们非常感谢你在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-28901) 中提供反馈。
>
{style="note"}

### 使用增量注解处理

配合 Gradle 使用时，kapt 默认支持增量注解处理，以便仅重新处理更改的文件。

目前，仅在以下情况下，增量注解处理才能工作：

* 启用了[增量编译](gradle-compilation-and-caches.md#incremental-compilation)。
* 构建中使用的所有注解处理器都是增量式的。

要禁用增量注解处理，请在你的 `gradle.properties` 文件中添加这一行：

```none
kapt.incremental.apt=false
```

> 目前 Maven 或命令行尚不支持 kapt 的增量注解处理。
> 
{style="note"}

## 分析性能

kapt 提供了内置诊断功能，可帮助你了解注解处理性能，包括按处理器生成的执行时间报告和生成的文件计数，以识别未使用的处理器。

有关更多诊断选项，例如用于调试增量处理的文件读取历史记录和内存泄漏检测，请参阅 [诊断与统计选项](#diagnostics-and-statistics-options)。

### 衡量注解处理器的性能

要获取有关注解处理器执行情况的性能统计信息，请使用 [`showProcessorStats`](#diagnostics-and-statistics-options) 选项。示例输出如下：

```text
Kapt Annotation Processing performance report:
com.example.processor.TestingProcessor: total: 133 ms, init: 36 ms, 2 round(s): 97 ms, 0 ms
com.example.processor.AnotherProcessor: total: 100 ms, init: 6 ms, 1 round(s): 93 ms
```

你可以使用 [`dumpProcessorStats`](#diagnostics-and-statistics-options) 选项将此报告转储到文件中。例如，以下命令行命令运行 kapt 并将统计信息转储到 `ap-perf-report.file` 文件中：

```bash
kapt -Kapt-mode=stubsAndApt \
  -Kapt-classpath=processor/build/libs/processor.jar \
  -Kapt-dump-processor-stats=ap-perf-report.file \
  sample/src/main/
```

### 统计生成的文件数量

kapt 插件可以报告每个注解处理器生成文件数量的统计信息。

这有助于跟踪构建中是否包含任何未使用的注解处理器。你可以使用生成的报告找到触发不必要注解处理器的模块，并更新这些模块以避免这种情况。

要启用统计报告：

1. 在你的 Gradle 构建文件中，将 `showProcessorStats` 选项设置为 `true`：

   ```kotlin
   // build.gradle(.kts)
   kapt {
       showProcessorStats = true
   }
   ```

2. 在你的 `gradle.properties` 文件中，将 `verbose` 编译器选项设置为 `true`：

   ```
   # gradle.properties
   kapt.verbose=true
   ```

统计信息以 `info` 级别出现在日志中。你可以看到 `Annotation processor stats:` 行，随后是每个注解处理器执行时间的统计信息。在这些行之后是 `Generated files report:` 行，随后是每个注解处理器生成文件数量的统计信息。例如：

```text
[INFO] Annotation processor stats:
[INFO] org.mapstruct.ap.MappingProcessor: total: 290 ms, init: 1 ms, 3 round(s): 289 ms, 0 ms, 0 ms
[INFO] Generated files report:
[INFO] org.mapstruct.ap.MappingProcessor: total sources: 2, sources per round: 2, 0, 0
```

> 目前 Maven 或命令行尚不支持通过 `showProcessorStats` 和 `verbose` 编译器选项统计生成的文件数量。
>
{style="note"}

## 生成 Kotlin 源码

kapt 可以生成 Kotlin 源码。为此，请将生成的 Kotlin 源码文件写入由 `processingEnv.options["kapt.kotlin.generated"]` 指定的目录。这些 Kotlin 源码文件随后将与主源码一起编译。

> kapt 不支持对生成的 Kotlin 文件进行多轮注解处理。
> 
{style="note"}

## 编译器选项

### 注解处理器配置

<table>
    <tr>
        <td>选项</td>
        <td>描述</td>
        <td>如何设置</td>
    </tr>
    <tr>
        <td><code>aptMode</code></td>
        <td>
            控制 kapt 工作流阶段的执行：
            <list>
                <li><code>stubsAndApt</code> 生成存根并运行注解处理（默认）</li>
                <li><code>stubs</code> 仅从 Kotlin 生成 Java 存根</li>
                <li><code>apt</code> 仅运行注解处理器（假设存根已存在）</li>
            </list>
        </td>
        <td>
            <p><b>Gradle:</b> 无法直接设置；Gradle 将存根生成和 apt 作为独立任务运行</p>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<aptMode>stubsAndApt</aptMode>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-mode=stubsAndApt</code></p>
        </td>
    </tr>
    <tr>
        <td><code>classpath</code></td>
        <td>发现注解处理器的类路径条目。</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    dependencies {
                        kapt("com.example:processor:1.0")
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<annotationProcessorPaths>
    <annotationProcessorPath>...</annotationProcessorPath>
</annotationProcessorPaths>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-classpath=lib/my-processor.jar</code></p>
        </td>
    </tr>
    <tr>
        <td><code>processors</code></td>
        <td>要运行的处理器的完全限定类名（以逗号分隔），绕过发现机制。</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        annotationProcessor("com.example.MyProcessor")
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<annotationProcessors>
    <annotationProcessor>com.example.MyProcessor</annotationProcessor>
</annotationProcessors>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-processors=com.example.MyProcessor</code></p>
        </td>
    </tr>
    <tr>
        <td><code>apOption</code></td>
        <td>传递给注解处理器的键值对选项。</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        arguments {
                            arg("room.schemaLocation", "$projectDir/schemas")
                        }
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<annotationProcessorArgs>
    <annotationProcessorArg>room.schemaLocation=/schemas</annotationProcessorArg>
</annotationProcessorArgs>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-options:room.schemaLocation=/schemas</code></p>
        </td>
    </tr>
    <tr>
        <td><code>javacOption</code></td>
        <td>传递给 Java 编译器的键值对选项。</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        javacOptions {
                            option("-source", "11")
                        }
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<javacOptions>
    <javacOption>-source=11</javacOption>
</javacOptions>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-javac-option:-source=11</code></p>
        </td>
    </tr>
    <tr>
        <td><code>processIncrementally</code></td>
        <td>启用增量注解处理；仅重新处理受更改影响的文件。</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    # gradle.properties
                    kapt.incremental.apt=true
                </code-block>
            <p><b>Maven:</b> 目前不支持</p>
            <p><b>CLI:</b> 目前不支持</p>
        </td>
    </tr>
</table>

### 输出目录选项

<table>
    <tr>
        <td>选项</td>
        <td>描述</td>
        <td>如何设置</td>
    </tr>
    <tr>
        <td><code>sources</code></td>
        <td>注解处理器生成 <code>.java</code> 源码文件的目录。</td>
        <td>
            <p><b>Gradle:</b> 自动设置为 <code>build/generated/source/kapt/main</code></p>
            <p><b>Maven:</b> 自动设置为 <code>target/generated-sources/kapt/</code></p>
            <p><b>CLI:</b> <code>-Kapt-sources=build/kapt/sources</code></p>
        </td>
    </tr>
    <tr>
        <td><code>classes</code></td>
        <td>从生成的源码编译而来的 <code>.class</code> 文件的目录。</td>
        <td>
            <p><b>Gradle:</b> 自动管理</p>
            <p><b>Maven:</b> 自动管理</p>
            <p><b>CLI:</b> <code>-Kapt-classes=build/kapt/classes</code></p>
        </td>
    </tr>
    <tr>
        <td><code>stubs</code></td>
        <td>从 Kotlin 源码生成的 Java 存根文件的目录，用作注解处理器的输入。</td>
        <td>
            <p><b>Gradle:</b> 自动管理</p>
            <p><b>Maven:</b> 自动管理</p>
            <p><b>CLI:</b> <code>-Kapt-stubs=build/kapt/stubs</code></p>
        </td>
    </tr>
    <tr>
        <td><code>incrementalData</code></td>
        <td>存储增量构建的状态。</td>
        <td>
            <p><b>Gradle:</b> 自动管理</p>
            <p><b>Maven:</b> 目前不支持</p>
            <p><b>CLI:</b> 目前不支持</p>
        </td>
    </tr>
</table>

### 行为选项

<table>
    <tr>
        <td>选项</td>
        <td>描述</td>
        <td>如何设置</td>
    </tr>
    <tr>
        <td><code>correctErrorTypes</code></td>
        <td>
            默认情况下，kapt 会将每个未知类型（包括生成的类的类型）替换为 <code>NonExistentClass</code>。
            你可以启用存根中的错误类型推断，以将未解析的错误类型替换为来自生成的源码中的类型。
            <p>默认为 <code>false</code></p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        correctErrorTypes = true
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<correctErrorTypes>true</correctErrorTypes>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-correct-error-types=true</code></p>
        </td>
    </tr>
    <tr>
        <td><code>dumpDefaultParameterValues</code></td>
        <td>
            在生成的存根中将默认形参初始值设定项作为字段值包含在内。
            <p>默认为 <code>false</code></p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        dumpDefaultParameterValues = true
                    }
                </code-block>
            <p><b>Maven:</b> 不可用</p>
            <p><b>CLI:</b> <code>-Kapt-dump-default-parameter-values=true</code></p>
        </td>
    </tr>
    <tr>
        <td><code>mapDiagnosticLocations</code></td>
        <td>
            将存根文件中的错误消息映射回其原始的 Kotlin 源码位置。
            <p>默认为 <code>false</code></p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        mapDiagnosticLocations = true
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<mapDiagnosticLocations>true</mapDiagnosticLocations>
                    ]]>
                </code-block>
            <p><b>CLI:</b> <code>-Kapt-map-diagnostic-locations=true</code></p>
        </td>
    </tr>
    <tr>
        <td><code>strict</code></td>
        <td>
            将存根生成中的不兼容问题转换为错误而非警告。
            <p>默认为 <code>false</code></p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        strictMode = true
                    }
                </code-block>
            <p><b>Maven:</b> 不可用</p>
            <p><b>CLI:</b> <code>-Kapt-strict=true</code></p>
        </td>
    </tr>
    <tr>
        <td><code>stripMetadata</code></td>
        <td>
            从生成的存根中移除 <code>@kotlin.Metadata</code> 注解，从而减小存根大小并向处理器隐藏 Kotlin 特有的信息。
            <p>默认为 <code>false</code></p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        stripMetadata = true
                    }
                </code-block>
            <p><b>Maven:</b> 不可用</p>
            <p><b>CLI:</b> <code>-Kapt-strip-metadata=true</code></p>
        </td>
    </tr>
    <tr>
        <td><code>verbose</code></td>
        <td>
            启用详细的 kapt 日志记录。
            <p>默认为 <code>false</code></p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    # gradle.properties
                    kapt.verbose=true
                </code-block>
            <p><b>Maven:</b> 目前不支持</p>
            <p><b>CLI:</b> 目前不支持</p>
        </td>
    </tr>
    <tr>
        <td><code>infoAsWarnings</code></td>
        <td>
            将 info 级别的 kapt 消息提升为警告。
            <p>默认为 <code>false</code></p>
        </td>
        <td>
            <p><b>Gradle:</b> 无法直接设置</p>
            <p><b>Maven:</b> 目前不支持</p>
            <p><b>CLI:</b> 目前不支持</p>
        </td>
    </tr>
    <tr>
        <td><code>includeCompileClasspath</code></td>
        <td>
            扫描编译类路径以查找注解处理器。为了可复现性，建议将其设置为 <code>false</code>。
            <p>默认为 <code>true</code></p>
        </td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        includeCompileClasspath = false
                    }
                </code-block>
            <p><b>Maven:</b></p>
                <code-block lang="xml">
                    <![CDATA[
<includeCompileClasspath>false</includeCompileClasspath>
                    ]]>
                </code-block>
            <p><b>CLI:</b> 目前不支持</p>
        </td>
    </tr>
</table>

### 诊断与统计选项

<table>
    <tr>
        <td>选项</td>
        <td>描述</td>
        <td>如何设置</td>
    </tr>
    <tr>
        <td><code>showProcessorStats</code></td>
        <td>将每个处理器的执行时间打印到标准输出 (stdout)。</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        showProcessorStats = true
                    }
                </code-block>
            <p><b>Maven:</b> 不可用</p>
            <p><b>CLI:</b> <code>-Kapt-show-processor-stats=true</code></p>
        </td>
    </tr>
    <tr>
        <td><code>dumpProcessorStats</code></td>
        <td>将处理器时间统计信息写入文件。</td>
        <td>
            <p><b>Gradle:</b> 不可用</p>
            <p><b>Maven:</b> 不可用</p>
            <p><b>CLI:</b> <code>-Kapt-dump-processor-stats=build/kapt-stats.txt</code></p>
        </td>
    </tr>
    <tr>
        <td><code>dumpFileReadHistory</code></td>
        <td>将处理器读取的文件列表写入文件，对于调试增量注解处理器非常有用。</td>
        <td>
            <p><b>Gradle:</b> 不可用</p>
            <p><b>Maven:</b> 不可用</p>
            <p><b>CLI:</b> <code>-Kapt-dump-file-read-history=build/kapt-reads.txt</code></p>
        </td>
    </tr>
    <tr>
        <td><code>detectMemoryLeaks</code></td>
        <td>内存泄漏检测模式：<code>none</code>、<code>default</code> 或 <code>paranoid</code>。</td>
        <td>
            <p><b>Gradle:</b></p>
                <code-block lang="kotlin">
                    kapt {
                        detectMemoryLeaks = "paranoid"
                    }
                </code-block>
            <p><b>Maven:</b> 目前不支持</p>
            <p><b>CLI:</b> 目前不支持</p>
        </td>
    </tr>
</table>

## 下一步

* [配合 MapStruct 注解处理器使用 kapt](jvm-annotation-processors.md#use-kapt-with-java-annotation-processors)
* [了解如何从 kapt 迁移到 KSP](ksp-kapt-migration.md)