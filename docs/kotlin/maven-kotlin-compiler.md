[//]: # (title: 为 Maven 项目配置 Kotlin 编译器)

`kotlin-maven-plugin` 允许你为 Maven 项目配置 Kotlin 编译器。
你可以指定编译器选项、选择执行策略并启用增量编译。

## 指定编译器选项 {id="specify-compiler-options"}

你可以将编译器的附加选项和参数指定为 Kotlin Maven 插件节点的 `<configuration>` 部分中的元素：

```xml
<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <extensions>true</extensions> <!-- 如果你想在构建中启用自动添加执行 -->
    <executions>...</executions>
    <configuration>
        <nowarn>true</nowarn> <!-- 禁用警告 -->
        <args>
            <arg>-Xjsr305=strict</arg> <!-- 为 JSR-305 注解启用严格模式 -->
            ...
        </args>
    </configuration>
</plugin>
```

许多选项也可以通过属性进行配置：

```xml
<project>
    <properties>
        <kotlin.compiler.languageVersion>%languageVersion%</kotlin.compiler.languageVersion>
    </properties>
</project>
```

支持以下属性：

### 特定于 JVM 的属性 {id="attributes-specific-to-jvm"}

| 名称 | 属性名称 | 说明 | 可选值 | 默认值 |
|---|---|---|---|---|
| `nowarn` | | 不生成警告 | true, false | false |
| `languageVersion` | `kotlin.compiler.languageVersion` | 提供与指定 Kotlin 版本的源代码兼容性 | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL) | |
| `apiVersion` | `kotlin.compiler.apiVersion` | 仅允许使用来自指定版本的随附库的声明 | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL) | |
| `sourceDirs` | | 包含要编译的源文件的目录 | | 项目源码根目录 |
| `compilerPlugins` | | 已启用的编译器插件 | | [] |
| `pluginOptions` | | 编译器插件选项 | | [] |
| `args` | | 附加编译器参数 | | [] |
| `jvmTarget` | `kotlin.compiler.jvmTarget` | 生成字节码的目标 JVM 版本。仅控制输出的字节码版本，不限制代码可以使用的 JDK API。 | "1.8", "9", "10", ..., "26" | "%defaultJvmTargetVersion%" |
| `jdkRelease` | `kotlin.compiler.jdkRelease` | 目标 JVM 版本。控制字节码版本并将可用 API 限制为指定的 JDK 版本，防止误用较新的 API。等同于 Java 的 `--release` 编译器选项。 | "1.8", "9", "10", ..., "26" | |
| `jdkHome` | `kotlin.compiler.jdkHome` | 将指定位置的自定义 JDK 包含到类路径中，而不是使用默认的 `JAVA_HOME` | | |
| `jdkToolchain` | `kotlin.compiler.jdkToolchain` | 设置从工具链中使用的 JDK 版本。仅影响 Kotlin 编译 | | |
| `-Xadd-modules` | | （实验性）除初始模块外，解析指定的根模块。设置 `ALL-MODULE-PATH` 值以解析模块路径上的所有模块。 | 逗号分隔的模块名称，或通过 `<arg>` 传递的 `ALL-MODULE-PATH` | |

请注意特定于 JVM 的选项之间是如何相互影响的：

* 如果你未显式设置 `jvmTarget`，Kotlin Maven 插件将使用 `jdkRelease` 的值；如果 `jdkRelease` 也未设置，则使用默认的 `%defaultJvmTargetVersion%` 版本。
* 编译器使用的 JDK 由 `jdkHome` 选项定义。如果你未显式设置 `jdkHome`，Kotlin Maven 插件会将工具链的 JDK 作为 `jdkHome` 传递给编译器。你可以在 `maven-toolchains-plugin` 或 `jdkToolchain` 选项中指定[工具链的 JDK](maven-configure-project.md#set-jdk-version)。显式的 `jdkHome` 值始终优先于工具链。
* `jdkHome` 选项和工具链均不会影响 `jvmTarget` 选项。

## 选择执行策略 {id="choose-execution-strategy"}

<snippet id="maven-configure-execution-strategy">

默认情况下，Maven 使用 Kotlin daemon 编译器执行策略。若要切换到 "in process" 策略，请在 `pom.xml` 文件中设置以下属性：

```xml
<properties>
    <kotlin.compiler.daemon>false</kotlin.compiler.daemon>
</properties>
```

</snippet>

有关不同策略的更多信息，请参阅[编译器执行策略](compiler-execution-strategy.md)。

## 启用增量编译 {id="enable-incremental-compilation"}

为了加快构建速度，你可以通过添加 `kotlin.compiler.incremental` 属性来启用增量编译：

```xml
<properties>
    <kotlin.compiler.incremental>true</kotlin.compiler.incremental>
</properties>
```

或者，使用 `-Dkotlin.compiler.incremental=true` 选项运行构建。

## 探索可用的目标和形参 {id="explore-available-goals-and-parameters"}

在 IDE 中，你可以从 `pom.xml` 文件中的 Kotlin Maven 插件声明导航到生成的插件描述符，其中包含有关可用目标及其形参的信息。

你也可以在命令行中使用标准的 Maven Help 插件来获取此信息。
在包含项目 `pom.xml` 文件的目录下运行：

```bash
mvn help:describe \
  -Dplugin=org.jetbrains.kotlin:kotlin-maven-plugin \
  -Ddetail=true
```

输出将列出每个可用目标以及有关其形参的详细信息。

若要获取特定目标的说明，请添加 `-Dgoal` 选项。例如，对于 `compile` 目标，运行：

```bash
mvn help:describe \
  -Dplugin=org.jetbrains.kotlin:kotlin-maven-plugin \
  -Ddetail=true \
  -Dgoal=compile
```

## 后续步骤 {id="what-s-next"}

[打包你的项目](maven-compile-package.md)