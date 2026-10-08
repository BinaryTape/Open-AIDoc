[//]: # (title: Lombok 编译器插件)
<primary-label ref="alpha"/>

Kotlin Lombok 编译器插件允许在同一个 Java/Kotlin 混合模块中，通过 Kotlin 代码生成并使用 Java 的 Lombok 声明。
如果你从另一个模块调用此类声明，则在编译该模块时不需要使用此插件。

Lombok 编译器插件不能替代 [Lombok](https://projectlombok.org/)，但它有助于 Lombok 在 Java/Kotlin 混合模块中工作。
因此，在使用此插件时，你仍需按照常规方式配置 Lombok。
详细了解 [如何配置 Lombok 编译器插件](#using-the-lombok-configuration-file)。

## 支持的注解 {id="supported-annotations"}

该插件支持以下注解：
* `@Getter`、`@Setter`
* `@Builder`、`@SuperBuilder`
* `@NoArgsConstructor`、`@RequiredArgsConstructor` 和 `@AllArgsConstructor`
* `@Data`
* `@With`
* `@Value`

我们正在持续改进此插件。要了解当前的详细状态，请访问 [Lombok 编译器插件的 README](https://github.com/JetBrains/kotlin/tree/master/plugins/lombok)。

目前，我们没有支持 `@Tolerate` 注解的计划。不过，如果你在 YouTrack 中为 [@Tolerate 问题](https://youtrack.jetbrains.com/issue/KT-53564/Kotlin-Lombok-Support-Tolerate) 投票，我们可以考虑这一点。

> 如果你在 Kotlin 代码中使用 Lombok 注解，Kotlin 编译器会忽略它们。
>
{style="note"}

## Gradle {id="gradle"}

在 `build.gradle(.kts)` 文件中应用 `kotlin-plugin-lombok` Gradle 插件：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("plugin.lombok") version "%kotlinVersion%"
    id("io.freefair.lombok") version "%lombokVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.plugin.lombok' version '%kotlinVersion%'
    id 'io.freefair.lombok' version '%lombokVersion%'
}
```

</tab>
</tabs>

请参阅此[包含 Lombok 编译器插件使用示例的测试项目](https://github.com/kotlin-hands-on/kotlin-lombok-examples/tree/master/kotlin_lombok_gradle/nokapt)。

### 使用 Lombok 配置文件 {id="using-the-lombok-configuration-file"}

如果你使用 [Lombok 配置文件](https://projectlombok.org/features/configuration) `lombok.config`，你需要设置文件路径以便插件能够找到它。
该路径必须相对于模块目录。
例如，将以下代码添加到你的 `build.gradle(.kts)` 文件中：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlinLombok {
    lombokConfigurationFile(file("lombok.config"))
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlinLombok {
    lombokConfigurationFile file("lombok.config")
}
```

</tab>
</tabs>

请参阅此[包含 Lombok 编译器插件和 `lombok.config` 使用示例的测试项目](https://github.com/kotlin-hands-on/kotlin-lombok-examples/tree/master/kotlin_lombok_gradle/withconfig)。

## Maven {id="maven"}

要使用 Lombok 编译器插件，请将插件 `lombok` 添加到 `compilerPlugins` 部分，并将依赖项 `kotlin-maven-lombok` 添加到 `dependencies` 部分。
如果你使用 [Lombok 配置文件](https://projectlombok.org/features/configuration) `lombok.config`，请在 `pluginOptions` 中为插件提供其路径。将以下几行添加到 `pom.xml` 文件中：

```xml
<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <configuration>
        <compilerPlugins>
            <plugin>lombok</plugin>
        </compilerPlugins>
        <pluginOptions>
            <option>lombok:config=${project.basedir}/lombok.config</option>
        </pluginOptions>
    </configuration>
    <dependencies>
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-lombok</artifactId>
            <version>${kotlin.version}</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.20</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>
</plugin>
```

请参阅此[包含 Lombok 编译器插件和 `lombok.config` 使用示例的测试项目](https://github.com/kotlin-hands-on/kotlin-lombok-examples/tree/master/kotlin_lombok_maven/nokapt)。

## 配合 kapt 使用 {id="using-with-kapt"}

默认情况下，[kapt](kapt.md) 编译器插件会运行所有注解处理器并禁用 javac 的注解处理。
要让 [Lombok](https://projectlombok.org/) 与 kapt 配合运行，请设置 kapt 以保持 javac 的注解处理器正常工作。

如果你使用 Gradle，请将该选项添加到 `build.gradle(.kts)` 文件中：

```groovy
kapt {
    keepJavacAnnotationProcessors = true
}
```

在 Maven 中，使用以下设置以配合 Java 编译器启动 Lombok：

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.5.1</version>
    <configuration>
        <source>1.8</source>
        <target>1.8</target>
        <annotationProcessorPaths>
            <annotationProcessorPath>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>${lombok.version}</version>
            </annotationProcessorPath>
        </annotationProcessorPaths>
    </configuration>
</plugin>    
```

如果注解处理器不依赖于 Lombok 生成的代码，则 Lombok 编译器插件可以与 [kapt](kapt.md) 正常配合工作。

查看以下 kapt 和 Lombok 编译器插件的使用示例测试项目：
* 使用 [Gradle](https://github.com/JetBrains/kotlin/tree/master/libraries/tools/kotlin-gradle-plugin-integration-tests/src/test/resources/testProject/lombokProject/yeskapt)。
* 使用 [Maven](https://github.com/kotlin-hands-on/kotlin-lombok-examples/tree/master/kotlin_lombok_maven/yeskapt)

## 命令行编译器 {id="command-line-compiler"}

Kotlin 编译器的二进制发行版中提供了 Lombok 编译器插件 JAR。你可以通过使用 `Xplugin` kotlinc 选项并提供其 JAR 文件路径来挂载该插件：

```bash
-Xplugin=$KOTLIN_HOME/lib/lombok-compiler-plugin.jar
```

如果你想使用 `lombok.config` 文件，请将 `<PATH_TO_CONFIG_FILE>` 替换为你的 `lombok.config` 路径：

```bash
# 插件选项格式为："-P plugin:<plugin id>:<key>=<value>"。
# 选项可以重复。

-P plugin:org.jetbrains.kotlin.lombok:config=<PATH_TO_CONFIG_FILE>
```
