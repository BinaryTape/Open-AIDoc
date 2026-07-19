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

##### 配置 kapt 注解处理

要配置注解处理模式，请在 `<configuration>` 代码块中设置 `<aptMode>` 选项：

* `stubs` – 仅生成注解处理所需的存根。
* `apt` – 仅运行注解处理。
* `stubsAndApt` – （默认）生成存根并运行注解处理。

例如：

```xml
<configuration>
   ...
   <aptMode>stubs</aptMode>
</configuration>
```

### 命令行

kapt 编译器插件在 Kotlin 编译器的二进制分发版中可用。

你可以通过使用 `-Xplugin` Kotlin 编译器选项提供其 JAR 文件的路径来附加该插件：

```bash
-Xplugin=$KOTLIN_HOME/lib/kotlin-annotation-processing.jar
```

以下是可用选项的列表：

* `sources`（*必填*）：生成文件的输出路径。
* `classes`（*必填*）：生成的类文件和资源的输出路径。
* `stubs`（*必填*）：存根文件的临时输出路径。
* `incrementalData`：二进制存根的输出路径。
* `apclasspath`（*可重复*）：注解处理器 JAR 的路径。为每个 JAR 传递一个 `apclasspath` 选项。
* `apoptions`：Base64 编码的注解处理器选项列表。有关更多信息，请参阅 [AP/javac 选项编码](#ap-javac-options-encoding)。
* `javacArguments`：Base64 编码的传递给 javac 的选项列表。有关更多信息，请参阅 [AP/javac 选项编码](#ap-javac-options-encoding)。
* `processors`：逗号分隔的注解处理器完全限定类名列表。如果指定了此项，kapt 将不会尝试在 `apclasspath` 中查找注解处理器。
* `verbose`：启用详细输出。
* `aptMode`（*必填*）
    * `stubs` – 仅生成注解处理所需的存根。
    * `apt` – 仅运行注解处理。
    * `stubsAndApt` – 生成存根并运行注解处理。
* `correctErrorTypes`：有关更多信息，请参阅 [不存在的类型修正](#non-existent-type-correction)。默认禁用。
* `dumpFileReadHistory`：转储每个文件在注解处理期间使用的类列表的输出路径。

插件选项格式为：`-P plugin:<plugin id>:<key>=<value>`。选项可以重复。

示例：

```bash
-P plugin:org.jetbrains.kotlin.kapt3:sources=build/kapt/sources
-P plugin:org.jetbrains.kotlin.kapt3:classes=build/kapt/classes
-P plugin:org.jetbrains.kotlin.kapt3:stubs=build/kapt/stubs

-P plugin:org.jetbrains.kotlin.kapt3:apclasspath=lib/ap.jar
-P plugin:org.jetbrains.kotlin.kapt3:apclasspath=lib/anotherAp.jar

-P plugin:org.jetbrains.kotlin.kapt3:correctErrorTypes=true
```

## 配置注解处理器

### 向注解处理器传递实参

在你的构建脚本文件 `build.gradle(.kts)` 中使用 `arguments {}` 代码块向注解处理器传递实参：

```kotlin
kapt {
    arguments {
        arg("key", "value")
    }
}
```

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

kapt 默认支持增量注解处理。

目前，只有在以下情况下，增量注解处理才能工作：

* 启用了[增量编译](gradle-compilation-and-caches.md#incremental-compilation)。
* 构建中使用的所有注解处理器都是增量式的。

要禁用增量注解处理，请在你的 `gradle.properties` 文件中添加这一行：

```none
kapt.incremental.apt=false
```

## 分析性能

### 衡量注解处理器的性能

要获取有关注解处理器执行情况的性能统计信息，请使用 `-Kapt-show-processor-timings` 插件选项。示例输出如下：

```text
Kapt Annotation Processing performance report:
com.example.processor.TestingProcessor: total: 133 ms, init: 36 ms, 2 round(s): 97 ms, 0 ms
com.example.processor.AnotherProcessor: total: 100 ms, init: 6 ms, 1 round(s): 93 ms
```

你可以使用插件选项 [`-Kapt-dump-processor-timings` (`org.jetbrains.kotlin.kapt3:dumpProcessorTimings`)](https://github.com/JetBrains/kotlin/pull/4280) 将此报告转储到文件中。以下命令将运行 kapt 并将统计信息转储到 `ap-perf-report.file` 文件中：

```bash
kotlinc -cp $MY_CLASSPATH \
-Xplugin=kotlin-annotation-processing-SNAPSHOT.jar -P \
plugin:org.jetbrains.kotlin.kapt3:aptMode=stubsAndApt,\
plugin:org.jetbrains.kotlin.kapt3:apclasspath=processor/build/libs/processor.jar,\
plugin:org.jetbrains.kotlin.kapt3:dumpProcessorTimings=ap-perf-report.file \
-Xplugin=$JAVA_HOME/lib/tools.jar \
-d cli-tests/out \
-no-jdk -no-reflect -no-stdlib -verbose \
sample/src/main/
```

### 统计生成的文件数量

`kapt` Gradle 插件可以报告每个注解处理器生成文件数量的统计信息。

这有助于跟踪构建中是否包含任何未使用的注解处理器。你可以使用生成的报告找到触发不必要注解处理器的模块，并更新这些模块以避免这种情况。

要启用统计报告：

1. 在你的 `build.gradle(.kts)` 中将 `showProcessorStats` 属性值设置为 `true`：

   ```kotlin
   // build.gradle.kts
   kapt {
       showProcessorStats = true
   }
   ```

2. 在你的 `gradle.properties` 中将 `kapt.verbose` Gradle 属性设置为 `true`：

   ```none
   # gradle.properties
   kapt.verbose=true
   ```

> 你也可以通过 [命令行选项 `verbose`](#cli) 来启用详细输出。
>
{style="note"}

统计信息以 `info` 级别出现在日志中。你可以看到 `Annotation processor stats:` 行，随后是每个注解处理器执行时间的统计信息。在这些行之后是 `Generated files report:` 行，随后是每个注解处理器生成文件数量的统计信息。例如：

```text
[INFO] Annotation processor stats:
[INFO] org.mapstruct.ap.MappingProcessor: total: 290 ms, init: 1 ms, 3 round(s): 289 ms, 0 ms, 0 ms
[INFO] Generated files report:
[INFO] org.mapstruct.ap.MappingProcessor: total sources: 2, sources per round: 2, 0, 0
```

## Java 编译器选项

kapt 使用 Java 编译器来运行注解处理器。
以下是向 javac 传递任意选项的方法：

```groovy
kapt {
    javacOptions {
        // 增加来自注解处理器的最大错误计数。
        // 默认为 100。
        option("-Xmaxerrs", 500)
    }
}
```

## 不存在的类型修正

某些注解处理器（如 `AutoFactory`）依赖于声明签名中的精确类型。
默认情况下，kapt 会将每个未知类型（包括生成的类的类型）替换为 `NonExistentClass`，但你可以更改此行为。在 `build.gradle(.kts)` 文件中添加该选项，以启用在存根中的错误类型推断：

```groovy
kapt {
    correctErrorTypes = true
}
```

## 生成 Kotlin 源码

kapt 可以生成 Kotlin 源码。只需将生成的 Kotlin 源码文件写入 `processingEnv.options["kapt.kotlin.generated"]` 指定的目录，这些文件将与主源码一起编译。

请注意，kapt 不支持对生成的 Kotlin 文件进行多轮处理。

## AP/Javac 选项编码

`apoptions` 和 `javacArguments` 命令行选项接受一个编码后的选项映射。
以下是你可以自行编码选项的方法：

```kotlin
fun encodeList(options: Map<String, String>): String {
    val os = ByteArrayOutputStream()
    val oos = ObjectOutputStream(os)

    oos.writeInt(options.size)
    for ((key, value) in options.entries) {
        oos.writeUTF(key)
        oos.writeUTF(value)
    }

    oos.flush()
    return Base64.getEncoder().encodeToString(os.toByteArray())
}
```

## 下一步

* [了解如何从 kapt 迁移到 KSP](ksp-kapt-migration.md)