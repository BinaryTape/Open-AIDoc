[//]: # (title: 状态页面)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="StatusPages"/>
<var name="package_name" value="io.ktor.server.plugins.statuspages"/>
<var name="artifact_name" value="ktor-server-status-pages"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.statusPages"/>

<tldr>
<p>
<b>必需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="status-pages"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支持 Kotlin/Native，允许您在没有额外运行时或虚拟机的情况下运行服务器。">Native 服务器</Links>支持</b>：✅
</p>
</tldr>

<link-summary>
%plugin_name% 允许 Ktor 应用程序根据抛出的异常或状态码对任何失败状态做出适当响应。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-status-pages/io.ktor.server.plugins.statuspages/-status-pages.html) 插件允许 Ktor 应用程序根据抛出的异常或状态码对任何失败状态做出适当[响应](server-responses.md)。

## 添加依赖项 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，请将 <code>%artifact_name%</code> 工件添加到构建脚本中：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a>来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a>来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 安装 %plugin_name% {id="install_plugin"}

<p>
    要将 <code>%plugin_name%</code> 插件<a href="server-plugins.md#install">安装</a>到应用程序中，请将其传递给指定<Links href="server-modules.md" summary="模块允许您通过对路由分组来组织应用程序结构。">模块</Links>中的 <code>install</code> 函数。
    以下示例展示了如何安装 <code>%plugin_name%</code>：
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

## 配置 %plugin_name% {id="configure"}

`%plugin_name%` 插件提供了三个主要的配置选项：

- [exceptions](#exceptions)：根据映射的异常类配置响应
- [status](#status)：针对状态码值配置响应
- [statusFile](#status-file)：从类路径配置基于文件的响应

### 异常 {id="exceptions"}

`exception` 处理程序允许您处理导致 `Throwable` 异常的调用。在最基础的情况下，可以为任何异常配置 `500` HTTP 状态码：

```kotlin
install(StatusPages) {
    exception<Throwable> { call, cause ->
        call.respondText(text = "500: $cause" , status = HttpStatusCode.InternalServerError)
    }
}
```

您还可以检查特定异常并返回所需的内容作为响应：

```kotlin
install(StatusPages) {
    exception<Throwable> { call, cause ->
        if(cause is AuthorizationException) {
            call.respondText(text = "403: $cause" , status = HttpStatusCode.Forbidden)
        } else {
            call.respondText(text = "500: $cause" , status = HttpStatusCode.InternalServerError)
        }
    }
}
```

### 状态码 {id="status"}

`status` 处理程序提供了根据状态码返回特定内容进行响应的功能。以下示例展示了当服务器上缺少资源（`404` 状态码）时如何对请求做出响应：

```kotlin
install(StatusPages) {
    status(HttpStatusCode.NotFound) { call, status ->
        call.respondText(text = "404: Page Not Found", status = status)
    }
}
```

### 状态文件 {id="status-file"}

`statusFile` 处理程序允许您根据状态码提供 HTML 页面响应。假设您的项目在 `resources` 文件夹中包含 `error401.html` 和 `error402.html` 两个 HTML 页面。在这种情况下，您可以像下面这样使用 `statusFile` 来处理 `401` 和 `402` 状态码：
```kotlin
install(StatusPages) {
    statusFile(HttpStatusCode.Unauthorized, HttpStatusCode.PaymentRequired, filePattern = "error#.html")
}
```

`statusFile` 处理程序会将已配置状态列表中的任何 `#` 字符替换为对应的状态码值。

> 您可以在此处找到完整示例：[status-pages](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/status-pages)。