[//]: # (title: 在 Ktor Client 中跟踪请求)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<var name="artifact_name" value="ktor-client-call-id"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.callId"/>
<var name="package_name" value="io.ktor.client.plugins.callid"/>
<var name="plugin_name" value="CallId"/>

<tldr>
<p>
<b>必需依赖项</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-call-id"/>
<p>
    <b>代码示例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
%plugin_name% 客户端插件允许你使用唯一的调用 ID 来跟踪客户端请求。
</link-summary>

%plugin_name% 插件允许你通过使用唯一的调用 ID 来端到端跟踪客户端请求。这在微服务架构中尤为有用，无论请求经过多少个服务，都可以对调用保持跟踪。

调用作用域的协程上下文中可能已经包含了一个调用 ID。默认情况下，该插件使用当前上下文来检索调用 ID，并使用 `HttpHeaders.XRequestId` 标头将其添加到具体调用的上下文中。

此外，如果作用域未附带调用 ID，你可以[配置该插件](#configure)以生成并应用新的调用 ID。

> 在服务器端，Ktor 提供了 [CallId](server-call-id.md) 插件用于跟踪客户端请求。

## 添加依赖项 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，请将 <code>%artifact_name%</code> 工件添加到构建脚本中：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 安装 %plugin_name% {id="install_plugin"}

<p>
    要将 <code>%plugin_name%</code> 插件<a href="server-plugins.md#install">安装</a>到应用程序中，
    请将其传递给指定<Links href="server-modules.md" summary="模块允许你通过对路由进行分组来构建应用程序结构。">模块</Links>中的 <code>install</code> 函数。
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

由 [CallIdConfig](https://api.ktor.io/ktor-client-call-id/io.ktor.client.plugins.callid/-call-id-config/index.html) 类提供的 %plugin_name% 插件配置，允许你生成调用 ID 并将其添加到调用上下文中。

### 生成调用 ID {id="generate-a-call-id"}

可以通过以下方式之一为特定请求生成调用 ID：

* `useCoroutineContext` 属性（默认启用）会添加一个使用当前 `CoroutineContext` 检索调用 ID 的生成器。要禁用此功能，请将 `useCoroutineContext` 设置为 `false`：

 ```kotlin
 install(CallId) {
     useCoroutineContext = false
 }
 ```

> 在 Ktor 服务器中，使用 [CallId 插件](server-call-id.md)将调用 ID 添加到 `CoroutineContext` 中。

* `generate()` 函数允许你为传出请求生成调用 ID。如果生成调用 ID 失败，它将返回 `null`。

 ```kotlin
 install(CallId) {
     generate { "call-id-client-2" }
 }
 ```

你可以使用多种方式来生成调用 ID。这样，第一个非 null 值将被应用。

### 添加调用 ID {id="add-a-call-id"}

检索到调用 ID 后，你可以使用以下选项将其添加到请求中：

* `intercept()` 函数允许你使用 `CallIdInterceptor` 将调用 ID 添加到请求中。

 ```kotlin
 install(ClientCallId) {
     intercept { request, callId ->
         request.header(HttpHeaders.XRequestId, callId)
     }
 }
 ```

* `addToHeader()` 函数将调用 ID 添加到指定的标头中。它接受一个标头作为形参，默认值为 `HttpHeaders.XRequestId`。

 ```kotlin
 install(CallId) {
     addToHeader(HttpHeaders.XRequestId)
 }
 ```

## 示例 {id="example"}

在以下示例中，Ktor 客户端的 `%plugin_name%` 插件配置为生成新的调用 ID 并将其添加到标头：

 ```kotlin
 val client = HttpClient(CIO) {
     install(CallId) {
         generate { "call-id-client" }
         addToHeader(HttpHeaders.XRequestId)
     }
 }
 ```

该插件使用协程上下文获取调用 ID，并利用 `generate()` 函数生成新的调用 ID。然后通过 `addToHeader()` 函数将第一个非 null 的调用 ID 应用到请求标头中。

在 Ktor 服务器中，随后可以使用[服务器端的 CallId 插件](server-call-id.md)中的 [retrieve](server-call-id.md#retrieve) 函数从标头中检索调用 ID。

 ```kotlin
 install(CallId) {
     retrieveFromHeader(HttpHeaders.XRequestId)
 }
 ```

通过这种方式，Ktor 服务器检索请求指定标头的 ID，并将其应用到调用的 `callId` 属性中。

有关完整示例，请参阅 [client-call-id](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-call-id)