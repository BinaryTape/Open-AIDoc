[//]: # (title: 为 Maven 项目配置 Kotlin 编译器)

`kotlin-maven-plugin` 允许你为 Maven 项目配置 Kotlin 编译器。
你可以指定编译器选项、选择执行策略并启用增量编译。

## 指定编译器选项 {id="specify-compiler-options"}

你可以在 Kotlin Maven 插件节点的 `<configuration>` 部分中，以元素形式为编译器指定额外的选项与实参：

```xml
<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <extensions>true</extensions> <!-- 如果你想启用自动向构建添加执行配置 -->
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

许多选项也可以通过属性（properties）进行配置：

```xml
<project>
    <properties>
        <kotlin.compiler.languageVersion>%languageVersion%</kotlin.compiler.languageVersion>
    </properties>
</project>
```

支持以下特性：

### JVM 专属特性 {id="attributes-specific-to-jvm"}

| 名称 | 属性名称 | 描述 | 可选值 | 默认值 |
|---|---|---|---|---|
| `nowarn` | | 不生成警告 | true, false | false |
| `languageVersion` | `kotlin.compiler.languageVersion` | 提供与指定 Kotlin 版本的源代码兼容性 | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL) | |
| `apiVersion` | `kotlin.compiler.apiVersion` | 仅允许使用指定版本捆绑库中的声明 | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5" (EXPERIMENTAL) | |
| `sourceDirs` | | 包含待编译源文件的目录 | | 项目源根目录 |
| `compilerPlugins` | | 启用的编译器插件 | | [] |
| `pluginOptions` | | 编译器插件的选项 | | [] |
| `args` | | 额外的编译器实参 | | [] |
| `jvmTarget` | `kotlin.compiler.jvmTarget` | 生成字节码的目标 JVM 版本。仅控制输出的字节码版本，不限制你的代码可以使用哪些 JDK API。 | "1.8", "9", "10", ..., "26" | "%defaultJvmTargetVersion%" |
| `jdkRelease` | `kotlin.compiler.jdkRelease` | 目标 JVM 版本。控制字节码版本并将可用 API 限制为指定的 JDK 版本，防止误用较新的 API。相当于 Java 的 `--release` 编译器选项。 | "1.8", "9", "10", ..., "26" | |
| `jdkHome` | `kotlin.compiler.jdkHome` | 将指定位置的自定义 JDK 包含到类路径中，而不是使用默认的 `JAVA_HOME` | | |
| `jdkToolchain` | `kotlin.compiler.jdkToolchain` | 设置从工具链中使用的 JDK 版本。仅影响 Kotlin 编译 | | |
| `-Xadd-modules` | | （实验性）除初始模块外，解析指定的根模块。设置 `ALL-MODULE-PATH` 值以解析模块路径上的所有模块。 | 逗号分隔的模块名称或通过 `<arg>` 传递的 `ALL-MODULE-PATH` | |

## 选择执行策略 {id="choose-execution-strategy"}

<snippet id="maven-configure-execution-strategy">

默认情况下，Maven 使用 Kotlin 守护程序（daemon）编译器执行策略。若要切换到“进程内”（in process）策略，请在 `pom.xml` 文件中设置以下属性：

```xml
<properties>
    <kotlin.compiler.daemon>false</kotlin.compiler.daemon>
</properties>
```

</snippet>

有关不同策略的详细信息，请参阅[编译器执行策略](compiler-execution-strategy.md)。

## 启用增量编译 {id="enable-incremental-compilation"}

为了加快构建速度，你可以通过添加 `kotlin.compiler.incremental` 属性来启用增量编译：

```xml
<properties>
    <kotlin.compiler.incremental>true</kotlin.compiler.incremental>
</properties>
```

或者，在运行构建时附带 `-Dkotlin.compiler.incremental=true` 选项。

## 探索可用的目标和形参 {id="explore-available-goals-and-parameters"}

在 IDE 中，你可以从 `pom.xml` 文件中的 Kotlin Maven 插件声明导航到生成的插件描述符，其中包含有关可用目标（goal）及其形参的信息。

你也可以在命令行中使用标准的 Maven Help 插件来获取此信息。
在包含项目 `pom.xml` 文件的目录中运行：

```bash
mvn help:describe \
  -Dplugin=org.jetbrains.kotlin:kotlin-maven-plugin \
  -Ddetail=true
```

输出会列出每个可用的目标以及有关其形参的详细信息。

若要获取特定目标的描述，请添加 `-Dgoal` 选项。例如，对于 `compile` 目标，运行：

```bash
mvn help:describe \
  -Dplugin=org.jetbrains.kotlin:kotlin-maven-plugin \
  -Ddetail=true \
  -Dgoal=compile
```

## 下一步 {id="what-s-next"}

[打包你的项目](maven-compile-package.md)