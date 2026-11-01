[//]: # (title: 调用日志记录)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="CallLogging"/>
<var name="package_name" value="io.ktor.server.plugins.calllogging"/>
<var name="artifact_name" value="ktor-server-call-logging"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.callLogging"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="logging"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支持 Kotlin/Native，允许您在无需额外运行时或虚拟机的情况下运行服务器。">Native 服务器</Links>支持</b>：✖️
</p>
</tldr>

Ktor 提供了使用 [SLF4J](http://www.slf4j.org/) 库记录应用程序事件的功能。您可以从 [Ktor Server 中的日志记录](server-logging.md)主题了解常规日志记录配置。

`%plugin_name%` 插件允许您记录传入的客户端请求。

## 添加依赖项 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，请将 <code>%artifact_name%</code> 工件添加到构建脚本中：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上面的代码片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor version catalog</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上面的代码片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor version catalog</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 安装 %plugin_name% {id="install_plugin"}

<p>
    要在应用程序中<a href="server-plugins.md#install">安装</a> <code>%plugin_name%</code> 插件，请将其传递给指定 <Links href="server-modules.md" summary="模块允许您通过对路由进行分组来构建应用程序结构。">模块</Links> 中的 <code>install</code> 函数。以下示例展示了如何安装 <code>%plugin_name%</code>：
</p>
<list>
    <li>
        在 <code>embeddedServer()</code> 函数调用中。
    </li>
    <li>
        在 <code>Application</code> 类上显式定义的 <code>module()</code> 扩展函数中。
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"/>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"/>
    </TabItem>
</Tabs>

## 配置日志记录设置 {id="configure"}

您可以通过多种方式配置 `%plugin_name%`：指定日志级别、根据指定条件过滤请求、自定义日志消息等。您可以在 [CallLoggingConfig](https://api.ktor.io/ktor-server-call-logging/io.ktor.server.plugins.calllogging/-call-logging-config/index.html) 中查看可用的配置设置。

### 设置日志级别 {id="logging_level"}

默认情况下，Ktor 使用 `Level.INFO` 日志级别。要更改该级别，请使用 `level` 属性：

```kotlin
install(CallLogging) {
    level = Level.INFO
}
```

### 过滤日志请求 {id="filter"}

`filter` 属性允许您添加过滤请求的条件。在以下示例中，只有对 `/api/v1` 发起的请求才会记录到日志中：

```kotlin
install(CallLogging) {
    filter { call ->
        call.request.path().startsWith("/api/v1")
    }
}
```

### 自定义日志消息格式 {id="format"}

通过使用 `format` 函数，您可以将与请求/响应相关的任何数据放入日志中。以下示例展示了如何为每个请求记录响应状态、请求 HTTP 方法以及 `User-Agent` 标头值。

```kotlin
install(CallLogging) {
    format { call ->
        val status = call.response.status()
        val httpMethod = call.request.httpMethod.value
        val userAgent = call.request.headers["User-Agent"]
        "Status: $status, HTTP method: $httpMethod, User agent: $userAgent"
    }
}
```

您可以在此处找到完整示例：[logging](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/logging)。

### 将调用参数放入 MDC {id="mdc"}

`%plugin_name%` 插件支持 MDC（Mapped Diagnostic Context，映射诊断上下文）。您可以使用 `mdc` 函数将指定名称的目标上下文值放入 MDC。例如，在以下代码片段中，`name` 查询参数被添加到 MDC：

```kotlin
install(CallLogging) {
    mdc("name-parameter") { call ->
        call.request.queryParameters["name"]
    }
}
```

您可以在 `ApplicationCall` 的生命周期内访问添加的值：

```kotlin
import org.slf4j.MDC
// ...
MDC.get("name-parameter")
```