[//]: # (title: DoubleReceive)

<primary-label ref="server-plugin"/>

<var name="plugin_name" value="DoubleReceive"/>
<var name="package_name" value="io.ktor.server.plugins.doublereceive"/>
<var name="artifact_name" value="ktor-server-double-receive"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="double-receive"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支持 Kotlin/Native，允许您在没有额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>：✅
</p>
</tldr>

[%plugin_name%](https://api.ktor.io/ktor-server-double-receive/io.ktor.server.plugins.doublereceive/-double-receive.html) 插件提供了多次[接收请求正文](server-requests.md#body_contents)的能力，而不会抛出 `RequestAlreadyConsumedException` 异常。
如果某个[插件](server-plugins.md)已经消耗了请求正文，导致您无法在路由处理程序中接收它，该功能会非常有用。
例如，您可以使用 `%plugin_name%` 通过 [CallLogging](server-call-logging.md) 插件记录请求正文，然后在 `post` [路由处理程序](server-routing.md#define_route)中再次接收正文。

> `%plugin_name%` 插件使用的是实验性 API，预计在未来的更新中会发生演进，并可能引入破坏性变更。
>
{type="note"}

## 添加依赖项 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，您需要在构建脚本中包含 <code>%artifact_name%</code> 构件：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>

## 安装 %plugin_name% {id="install_plugin"}

<p>
    要将 <code>%plugin_name%</code> 插件<a href="#install">安装</a>到应用程序，请将其传递给指定<Links href="/ktor/server-modules" summary="模块允许您通过对路由进行分组来构建应用程序。">模块</Links>中的 <code>install</code> 函数。
    以下代码段展示了如何安装 <code>%plugin_name%</code> ……
</p>
<list>
    <li>
        ……在 <code>embeddedServer</code> 函数调用中。
    </li>
    <li>
        ……在显式定义的 <code>module</code> 中，它是 <code>Application</code> 类的扩展函数。
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"></code-block>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"></code-block>
    </TabItem>
</Tabs>
<p>
    <code>%plugin_name%</code> 插件还可以<a href="#install-route">安装到特定路由</a>。
    如果您需要为不同的应用程序资源使用不同的 <code>%plugin_name%</code> 配置，这会非常有用。
</p>

安装 `%plugin_name%` 后，您可以多次[接收请求正文](server-requests.md#body_contents)，并且每次调用都会返回相同的实例。
例如，您可以使用 [CallLogging](server-call-logging.md) 插件启用请求正文的日志记录……

```kotlin
install(CallLogging) {
    level = Level.TRACE
    format { call ->
        runBlocking {
            "Body: ${call.receiveText()}"
        }
    }
}
```

……然后在路由处理程序中再次获取请求正文。

```kotlin
post("/") {
    val receivedText = call.receiveText()
    call.respondText("Text '$receivedText' is received")
}
```

您可以在此处找到完整的示例：[double-receive](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/double-receive)。

## 配置 %plugin_name% {id="configure"}
在默认配置下，`%plugin_name%` 支持将[请求正文](server-requests.md#body_contents)接收为以下类型：

- `ByteArray` 
- `String`
- `Parameters` 
- 由 `ContentNegotiation` 插件使用的[数据类](server-serialization.md#create_data_class)

默认情况下，`%plugin_name%` 不支持：

- 从同一个请求中接收不同的类型；
- 接收[流或通道](server-requests.md#raw)。

如果您不需要从同一个请求中接收不同类型，或者不需要接收流或通道，请将 `cacheRawRequest` 属性设置为 `false`：

```kotlin
install(DoubleReceive) {
    cacheRawRequest = false
}