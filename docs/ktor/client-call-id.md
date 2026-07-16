[//]: # (title: 在 Ktor Client 中跟踪请求)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<var name="artifact_name" value="ktor-client-call-id"/>
<var name="package_name" value="io.ktor.client.plugins.callid"/>
<var name="plugin_name" value="CallId"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-call-id"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
%plugin_name% 客户端插件允许您使用唯一的调用 ID 来跟踪客户端请求。
</link-summary>

%plugin_name% 插件允许您使用唯一的调用 ID 端到端地跟踪客户端请求。这在微服务架构中特别有用，可以持续跟踪调用，无论请求经过多少个服务。

调用作用域在其余程上下文中可能已经包含一个调用 ID。默认情况下，该插件使用当前上下文检索调用 ID，并使用 `HttpHeaders.XRequestId` 标头将其添加到特定调用的上下文中。

此外，如果作用域没有调用 ID，您可以[配置插件](#configure)以生成并应用新的调用 ID。

> 在服务器上，Ktor 提供了 [CallId](server-call-id.md) 插件来跟踪客户端请求。

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
    要将 <code>%plugin_name%</code> 插件<a href="#install">安装</a>到应用程序中，请将其传递给指定 <Links href="/ktor/server-modules" summary="模块允许您通过对路由进行分组来构建应用程序结构。">模块</Links> 中的 <code>install</code> 函数。
    下面的代码片段显示了如何安装 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函数调用内部。
    </li>
    <li>
        ... 在显式定义的 <code>module</code> 内部，它是 <code>Application</code> 类的扩展函数。
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

## 配置 %plugin_name% {id="configure"}

%plugin_name% 插件配置由 [CallIdConfig](https://api.ktor.io/ktor-client-call-id/io.ktor.client.plugins.callid/-call-id-config/index.html) 类提供，允许您生成调用 ID 并将其添加到调用上下文中。

### 生成调用 ID

通过以下方式之一为特定请求生成调用 ID：

* `useCoroutineContext` 属性（默认启用）添加了一个生成器，该生成器使用当前 `CoroutineContext` 来检索调用 ID。要禁用此功能，请将 `useCoroutineContext` 设置为 `false`：

 ```kotlin
 install(CallId) {
     useCoroutineContext = false
 }
 ```

> 在 Ktor 服务器中，使用 [CallId 插件](server-call-id.md) 将调用 ID 添加到 `CoroutineContext`。

* `generate()` 函数允许您为传出请求生成调用 ID。如果无法生成调用 ID，它将返回 `null`。

 ```kotlin
 install(CallId) {
     generate { "call-id-client-2" }
 }
 ```

您可以使用多种方法生成调用 ID。在这种情况下，将应用第一个非 null 的值。

### 添加调用 ID

检索到调用 ID 后，您可以使用以下选项将其添加到请求中：

* `intercept()` 函数允许您使用 `CallIdInterceptor` 将调用 ID 添加到请求中。

 ```kotlin
 install(ClientCallId) {
     intercept { request, callId ->
         request.header(HttpHeaders.XRequestId, callId)
     }
 }
 ```

* `addToHeader()` 函数将调用 ID 添加到指定的标头。它接受一个标头作为参数，默认为 `HttpHeaders.XRequestId`。

 ```kotlin
 install(CallId) {
     addToHeader(HttpHeaders.XRequestId)
 }
 ```

## 示例

在以下示例中，Ktor 客户端的 `%plugin_name%` 插件被配置为生成一个新的调用 ID 并将其添加到标头：

 ```kotlin
 val client = HttpClient(CIO) {
     install(CallId) {
         generate { "call-id-client" }
         addToHeader(HttpHeaders.XRequestId)
     }
 }
 ```

该插件使用协程上下文获取调用 ID，并利用 `generate()` 函数生成一个新的 ID。随后，通过 `addToHeader()` 函数将第一个非 null 的调用 ID 应用于请求标头。

在 Ktor 服务器中，可以通过 [服务器端 CallId 插件](server-call-id.md) 的 [retrieve](server-call-id.md#retrieve) 函数从标头中检索调用 ID。

 ```kotlin
 install(CallId) {
     retrieveFromHeader(HttpHeaders.XRequestId)
 }
 ```

通过这种方式，Ktor 服务器将检索请求中指定标头的 ID，并将其应用于调用的 `callId` 属性。

有关完整示例，请参阅 [client-call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-call-id)