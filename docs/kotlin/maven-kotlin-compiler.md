[//]: # (title: 为 Maven 项目配置 Kotlin 编译器)

`kotlin-maven-plugin` 允许你为 Maven 项目配置 Kotlin 编译器。
你可以指定编译器选项、选择执行策略并启用增量编译。

## 指定编译器选项 {id="specify-compiler-options"}

你可以在 Kotlin Maven 插件节点的 `<configuration>` 部分中，以元素的形式为编译器指定附加选项和实参：

```xml
<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <extensions>true</extensions> <!-- 如果你想在构建中自动添加执行配置 -->
    <executions>...</executions>
    <configuration>
        <nowarn>true</nowarn> <!-- 禁用警告 -->
        <args>
            <arg>-Xjsr305=strict</arg> <!-- 启用 JSR-305 注解的严格模式 -->
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

支持以下属性：

### 特定于 JVM 的属性 {id="attributes-specific-to-jvm"}

| 名称 | 属性名称 | 说明 | 可选值 | 默认值 |
|---|---|---|---|---|
| `nowarn` | | 不生成警告 | true, false | false |
| `languageVersion` | `kotlin.compiler.languageVersion` | 提供与指定 Kotlin 版本的源代码兼容性 | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5"（实验性） | |
| `apiVersion` | `kotlin.compiler.apiVersion` | 仅允许使用指定版本捆绑库中的声明 | "2.0", "2.1", "2.2", "2.3", "2.4", "2.5"（实验性） | |
| `sourceDirs` | | 包含要编译的源文件的目录 | | 项目源根目录 |
| `compilerPlugins` | | 已启用的编译器插件 | | [] |
| `pluginOptions` | | 编译器插件的选项 | | [] |
| `args` | | 附加编译器实参 | | [] |
| `jvmTarget` | `kotlin.compiler.jvmTarget` | 生成的字节码的目标 JVM 版本。仅控制输出的字节码版本，不限制代码可以使用的 JDK API。 | "1.8", "9", "10", ..., "26" | "%defaultJvmTargetVersion%" |
| `jdkRelease` | `kotlin.compiler.jdkRelease` | 目标 JVM 版本。控制字节码版本并将可用的 API 限制为指定的 JDK 版本，防止误用较新的 API。等同于 Java 的 `--release` 编译器选项。 | "1.8", "9", "10", ..., "26" | |
| `jdkHome` | `kotlin.compiler.jdkHome` | 将指定位置的自定义 JDK 包含到类路径中，而不是使用默认的 `JAVA_HOME` | | |
| `jdkToolchain` | `kotlin.compiler.jdkToolchain` | 设置工具链中要使用的 JDK 版本。仅影响 Kotlin 编译 | | |
| `-Xadd-modules` | | （实验性）除初始模块外，解析指定的根模块。设置 `ALL-MODULE-PATH` 值以解析模块路径上的所有模块。 | 逗号分隔的模块名称，或通过 `<arg>` 传递的 `ALL-MODULE-PATH` | |

## 选择执行策略 {id="choose-execution-strategy"}

<snippet id="maven-configure-execution-strategy">

默认情况下，Maven 使用 Kotlin daemon 编译器执行策略。要切换到 "in process" 策略，请在 `pom.xml` 文件中设置以下属性：

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

## 下一步？ {id="what-s-next"}

[打包你的项目](maven-compile-package.md)