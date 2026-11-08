[//]: # (title: Dokka 插件)

> 本指南适用于 Dokka Gradle 插件 (DGP) v2 模式。DGP v1 模式已不再受支持。
> 如需从 v1 模式升级到 v2 模式，请遵循[迁移指南](dokka-migration.md)。
>
{style="note"}

Dokka 从底层构建起便具备易扩展和高度可定制的特性，这使得社区能够针对开箱即用未提供的缺失功能或非常特定的功能实现插件。

Dokka 插件的应用范围非常广泛，从支持其他编程语言源码到各种特殊的输出格式应有尽有。你可以添加对自定义 KDoc 标记或注解的支持，让 Dokka 懂得如何渲染 KDoc 描述中出现的不同 DSL，从视觉上重新设计 Dokka 页面以无缝集成到你公司的网站中，将其与其他工具集成，等等。

如果你想学习如何创建 Dokka 插件，请参阅[开发者指南](https://kotlin.github.io/dokka/%dokkaVersion%/developer_guide/introduction/)。

## 应用 Dokka 插件 {id="apply-dokka-plugins"}

Dokka 插件作为独立的构件发布，因此要应用 Dokka 插件，你只需将其添加为依赖项即可。此后，该插件会自动扩展 Dokka——无需采取进一步操作。

> 使用相同扩展点或以类似方式工作的插件可能会相互干扰。
> 这可能会导致视觉错误、普遍的未定义行为，甚至导致构建失败。不过，这应该不会引发并发问题，因为 Dokka 不会公开任何可变的数据结构或对象。
>
> 如果你注意到此类问题，建议检查应用了哪些插件以及它们的作用。
> 
{style="note"}

我们来看看如何将 [mathjax 插件](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/dokka-subprojects/plugin-mathjax)应用到你的项目中：

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

```kotlin
plugins {
    id("org.jetbrains.dokka") version "%dokkaVersion%"
}

dependencies {
    dokkaPlugin("org.jetbrains.dokka:mathjax-plugin")
}
```

> * 内置插件（如 HTML 和 Javadoc）始终会自动应用。你只需对其进行配置，无需声明对它们的依赖项。
>
> * 在为多模块项目（多项目构建）生成文档时，你需要在[子项目之间共享 Dokka 配置和插件](dokka-gradle.md#multi-project-configuration)。
> 
{style="note"}

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.dokka' version '%dokkaVersion%'
}

dependencies {
    dokkaPlugin 'org.jetbrains.dokka:mathjax-plugin'
}
```

> 在为[多项目](dokka-gradle.md#multi-project-configuration)构建生成文档时，你需要在[子项目之间共享 Dokka 配置](dokka-gradle.md#multi-project-configuration)。
>
{style="note"}

</tab>
<tab title="Maven" group-key="mvn">

```xml
<plugin>
    <groupId>org.jetbrains.dokka</groupId>
    <artifactId>dokka-maven-plugin</artifactId>
    ...
    <configuration>
        <dokkaPlugins>
            <plugin>
                <groupId>org.jetbrains.dokka</groupId>
                <artifactId>mathjax-plugin</artifactId>
                <version>%dokkaVersion%</version>
            </plugin>
        </dokkaPlugins>
    </configuration>
</plugin>
```

</tab>
<tab title="CLI" group-key="cli">

如果你使用的是带有[命令行选项](dokka-cli.md#run-with-command-line-options)的 [CLI](dokka-cli.md) 运行程序，应将 Dokka 插件作为 `.jar` 文件传递给 `-pluginsClasspath`：

```Shell
java -jar dokka-cli-%dokkaVersion%.jar \
     -pluginsClasspath "./dokka-base-%dokkaVersion%.jar;...;./mathjax-plugin-%dokkaVersion%.jar" \
     ...
```

如果你使用的是 [JSON 配置](dokka-cli.md#run-with-json-configuration)，Dokka 插件应在 `pluginsClasspath` 下指定。

```json
{
  ...
  "pluginsClasspath": [
    "./dokka-base-%dokkaVersion%.jar",
    "...",
    "./mathjax-plugin-%dokkaVersion%.jar"
  ],
  ...
}
```

</tab>
</tabs>

## 配置 Dokka 插件 {id="configure-dokka-plugins"}

Dokka 插件也可以拥有自己的配置选项。要查看有哪些可用选项，请查阅你所使用的插件的文档。

我们来看看如何配置内置的 HTML 插件：通过向资源中添加自定义图像（`customAssets` 选项）、自定义样式表（`customStyleSheets` 选项）以及修改页脚信息（`footerMessage` 选项）：

<tabs group="build-script">
<tab title="Gradle Kotlin DSL" group-key="kotlin">

要以类型安全的方式配置 Dokka 插件，请使用 `dokka.pluginsConfiguration {}` 代码块：

```kotlin
dokka {
    pluginsConfiguration.html {
        customAssets.from("logo.png")
        customStyleSheets.from("styles.css")
        footerMessage.set("(c) Your Company")
    }
}
```

有关 Dokka 插件配置的示例，请参阅 [Dokka 的版本控制插件](https://github.com/Kotlin/dokka/tree/master/examples/gradle-v2/versioning-multimodule-example)。

Dokka 允许你通过[配置自定义插件](https://github.com/Kotlin/dokka/blob/v2.3.0/examples/gradle-v2/custom-dokka-plugin-example/demo-library/build.gradle.kts)来扩展其功能并修改文档生成过程。

</tab>
<tab title="Gradle Groovy DSL" group-key="groovy">

```groovy
dokka {
    pluginsConfiguration {
        html {
            customAssets.from("logo.png")
            customStyleSheets.from("styles.css")
            footerMessage.set("(c) Your Company")
        }
    }
}
```

</tab>
<tab title="Maven" group-key="mvn">

```xml
<plugin>
    <groupId>org.jetbrains.dokka</groupId>
    <artifactId>dokka-maven-plugin</artifactId>
    ...
    <configuration>
        <pluginsConfiguration>
            <!-- 完全限定插件名称 -->
            <org.jetbrains.dokka.base.DokkaBase>
                <!-- 按名称指定的选项 -->
                <customAssets>
                    <asset>${project.basedir}/my-image.png</asset>
                </customAssets>
                <customStyleSheets>
                    <stylesheet>${project.basedir}/my-styles.css</stylesheet>
                </customStyleSheets>
                <footerMessage>(c) MyOrg 2022 Maven</footerMessage>
            </org.jetbrains.dokka.base.DokkaBase>
        </pluginsConfiguration>
    </configuration>
</plugin>
```

</tab>
<tab title="CLI" group-key="cli">

如果你使用的是带有[命令行选项](dokka-cli.md#run-with-command-line-options)的 [CLI](dokka-cli.md) 运行程序，请使用接受格式为 `fullyQualifiedPluginName=json` 的 JSON 配置的 `-pluginsConfiguration` 选项。

如果需要配置多个插件，可以传入由 `^^` 分隔的多个值。

```Bash
java -jar dokka-cli-%dokkaVersion%.jar \
     ...
     -pluginsConfiguration "org.jetbrains.dokka.base.DokkaBase={\"customAssets\": [\"my-image.png\"], \"customStyleSheets\": [\"my-styles.css\"], \"footerMessage\": \"(c) 2022 MyOrg CLI\"}"
```

如果你使用的是 [JSON 配置](dokka-cli.md#run-with-json-configuration)，存在一个类似的 `pluginsConfiguration` 数组，它在 `values` 中接受 JSON 配置。

```json
{
  "moduleName": "Dokka Example",
  "pluginsConfiguration": [
    {
      "fqPluginName": "org.jetbrains.dokka.base.DokkaBase",
      "serializationFormat": "JSON",
      "values": "{\"customAssets\": [\"my-image.png\"], \"customStyleSheets\": [\"my-styles.css\"], \"footerMessage\": \"(c) 2022 MyOrg\"}"
    }
  ]
}
```

</tab>
</tabs>

## 值得关注的插件 {id="notable-plugins"}

以下是一些你可能会觉得有用的 Dokka 插件：

| **名称**                                                                                                                           | **描述**                                                                                              |
|------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| [Android documentation plugin](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/dokka-subprojects/plugin-android-documentation) | 提升 Android 上的文档生成体验                                                             |
| [Versioning plugin](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/dokka-subprojects/plugin-versioning)                       | 添加版本选择器，并帮助组织应用程序/库不同版本的文档 |
| [MermaidJS HTML plugin](https://github.com/glureau/dokka-mermaid)                                                                  | 渲染 KDoc 中出现的 [MermaidJS](https://mermaid-js.github.io/mermaid/#/) 图表和可视化内容      |
| [Mathjax HTML plugin](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/dokka-subprojects/plugin-mathjax)                        | 美化排版 KDoc 中出现的数学公式                                                                     |
| [Kotlin as Java plugin](https://github.com/Kotlin/dokka/tree/%dokkaVersion%/dokka-subprojects/plugin-kotlin-as-java)               | 从 Java 的视角渲染 Kotlin 签名                                                    |
| [GFM plugin](https://github.com/Kotlin/dokka/tree/master/dokka-subprojects/plugin-gfm)                                                                                                                     | 增加以 GitHub 风格 Markdown 格式生成文档的功能                               |
| [Jekyll plugin](https://github.com/Kotlin/dokka/tree/master/dokka-subprojects/plugin-jekyll)                                                                                                                                                                                                           | 增加以 Jekyll 风格 Markdown 格式生成文档的功能                               |

如果你是 Dokka 插件的作者，并希望将你的插件添加到此列表中，请通过 [Slack](dokka-introduction.md#community) 或 [GitHub](https://github.com/Kotlin/dokka/) 与维护人员联系。