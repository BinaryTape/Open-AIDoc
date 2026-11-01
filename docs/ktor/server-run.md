[//]: # (title: 运行)

<show-structure for="chapter" depth="2"/>

<link-summary>
了解如何运行 Ktor 服务端应用程序。
</link-summary>

运行 Ktor 服务端应用程序时，请注意以下要点：
* [创建服务器](server-create-and-configure.topic)的方式会影响你在运行[打包的 Ktor 应用程序](#package)时，能否通过传递命令行实参来覆盖服务器参数。
* 使用 [EngineMain](server-create-and-configure.topic#engine-main) 启动服务器时，Gradle/Maven 构建脚本应指定主类名称。
* 在 [servlet 容器](server-war.md)内运行应用程序需要特定的 servlet 配置。

在本主题中，我们将介绍这些配置要点，并向你展示如何在 IntelliJ IDEA 中运行 Ktor 应用程序以及如何将其作为打包的应用程序运行。

## 配置要点 {id="specifics"}

### 配置：代码 vs 配置文件 {id="code-vs-config"}

运行 Ktor 应用程序取决于你[创建服务器](server-create-and-configure.topic)的方式——`embeddedServer` 还是 `EngineMain`：
* 对于 `embeddedServer`，服务器参数（例如主机地址和端口）是在代码中配置的，因此在运行应用程序时无法更改这些参数。
* 对于 `EngineMain`，Ktor 会从使用 `HOCON` 或 `YAML` 格式的外部文件加载其配置。采用这种方式，你可以从命令行运行[打包的应用程序](#package)，并通过传递相应的[命令行实参](server-configuration-file.topic#command-line)来覆盖所需的服务器参数。

### 启动 EngineMain：Gradle 与 Maven 要点 {id="gradle-maven"}

如果使用 `EngineMain` 创建服务器，你需要指定用于通过所需[引擎](server-engines.md)启动服务器的 `main` 函数。
下面的[示例](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main)演示了用于运行带 Netty 引擎的服务器的 `main` 函数：

```kotlin
fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)
```

要在不于 `main` 函数内配置引擎的情况下使用 Gradle/Maven 运行 Ktor 服务器，你需要在构建脚本中指定主类名称，如下所示：

<Tabs group="languages" id="main-class-set-engine-main">
<TabItem title="Gradle (Kotlin)" group-key="kotlin">

```kotlin
application {
    mainClass.set("io.ktor.server.netty.EngineMain")
}
```

</TabItem>
<TabItem title="Gradle (Groovy)" group-key="groovy">

```groovy
mainClassName = "io.ktor.server.netty.EngineMain"
```

</TabItem>
<TabItem title="Maven" group-key="maven">

```xml
<properties>
    <main.class>io.ktor.server.netty.EngineMain</main.class>
</properties>
```

</TabItem>
</Tabs>

### WAR 要点 {id="war-specifics"}

Ktor 允许你直接在应用程序中通过所需的引擎（如 Netty、Jetty 或 Tomcat）[创建并启动服务器](server-create-and-configure.topic)。在这种情况下，你的应用程序拥有对引擎设置、连接和 SSL 选项的控制权。

与这种方式不同，servlet 容器应控制应用程序的生命周期和连接设置。Ktor 提供了一个特殊的 `ServletApplicationEngine` 引擎，可将对应用程序的控制权委托给 servlet 容器。你可以通过[配置 War 插件](server-war.md#configure-war)了解如何配置你的应用程序。

## 运行应用程序 {id="run"}
> 在开发过程中重启服务器可能会耗费一些时间。Ktor 允许你使用[自动重载](server-auto-reload.topic)来克服这一限制，该功能会在代码发生变化时重新加载应用程序类，并提供快速的反馈循环。

### 使用 Gradle/Maven 运行应用程序 {id="gradle-maven-run"}

要使用 Gradle 或 Maven 运行 Ktor 应用程序，请使用相应的插件：
* 适用于 Gradle 的 [Application](server-packaging.md) 插件。对于 [Native 服务器](server-native.md)，请使用 [Kotlin Multiplatform](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.multiplatform) 插件。
* 适用于 Maven 的 [Exec](https://www.mojohaus.org/exec-maven-plugin/) 插件。

> 要了解如何在 IntelliJ IDEA 中运行 Ktor 应用程序，请参阅 IntelliJ IDEA 文档中的[运行 Ktor 应用程序](https://www.jetbrains.com/help/idea/ktor.html#run_ktor_app)部分。

### 运行打包的应用程序 {id="package"}

在部署应用程序之前，你需要按[打包](server-deployment.md#packaging)部分中介绍的方式之一对其进行打包。
从生成的包中运行 Ktor 应用程序取决于包的类型，具体如下所示：
* 要运行打包在 fat JAR 中的 Ktor 服务器并覆盖已配置的端口，请执行以下命令：
   ```Bash
   java -jar sample-app.jar -port=8080
   ```
* 要运行使用 Gradle [Application](server-packaging.md) 插件打包的应用程序，请运行相应的可执行文件：

   <Tabs group="os">
   <TabItem title="Linux/macOS" group-key="unix">
   <code-block code="./ktor-sample"/>
   </TabItem>
   <TabItem title="Windows" group-key="windows">
   <code-block code="ktor-sample.bat"/>
   </TabItem>
   </Tabs>
  
* 要运行 servlet Ktor 应用程序，请使用 [Gretty](server-war.md#run) 插件的 `run` 任务。