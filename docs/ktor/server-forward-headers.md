[//]: # (title: Forwarded 标头)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-forwarded-header"/>
<var name="package_name" value="io.ktor.server.plugins.forwardedheaders"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="forwarded-header"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">原生服务器</Links> 支持</b>：✅
</p>
</tldr>

[ForwardedHeaders](https://api.ktor.io/ktor-server-forwarded-header/io.ktor.server.plugins.forwardedheaders/-forwarded-headers.html) 和 [XForwardedHeaders](https://api.ktor.io/ktor-server-forwarded-header/io.ktor.server.plugins.forwardedheaders/-x-forwarded-headers.html) 插件允许您在 Ktor 服务器位于反向代理之后时，通过处理反向代理标头来获取有关原始[请求](server-requests.md)的信息。这对于[日志](server-logging.md)记录很有用。

* `ForwardedHeaders` 处理 `Forwarded` 标头 ([RFC 7239](https://tools.ietf.org/html/rfc7239))
* `XForwardedHeaders` 处理以下 `X-Forwarded-` 标头：
   - `X-Forwarded-Host`/`X-Forwarded-Server` 
   - `X-Forwarded-For` 
   - `X-Forwarded-By`
   - `X-Forwarded-Proto`/`X-Forwarded-Protocol`
   - `X-Forwarded-SSL`/`Front-End-Https`

> 为了防止 `Forwarded` 标头被篡改，请仅在您的应用程序只接受反向代理连接时安装这些插件。
> 
{type="note"}

## 添加依赖项 {id="add_dependencies"}
要使用 `ForwardedHeaders`/`XForwardedHeaders` 插件，您需要在构建脚本中包含 `%artifact_name%` 构件：

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

## 安装插件 {id="install_plugin"}

<Tabs>
<TabItem title="ForwardedHeader">

<var name="plugin_name" value="ForwardedHeaders"/>
<p>
    要将 <code>%plugin_name%</code> 插件<a href="#install">安装</a>到应用，
    请将其传递给指定 <Links href="/ktor/server-modules" summary="Modules allow you to structure your application by grouping routes.">模块</Links> 中的 <code>install</code> 函数。
    以下代码片段展示了如何安装 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函数调用内部。
    </li>
    <li>
        ... 在显式定义的 <code>module</code> 内部，该模块是 <code>Application</code> 类的扩展函数。
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

</TabItem>

<TabItem title="XForwardedHeader">

<var name="plugin_name" value="XForwardedHeaders"/>
<p>
    要将 <code>%plugin_name%</code> 插件<a href="#install">安装</a>到应用，
    请将其传递给指定 <Links href="/ktor/server-modules" summary="Modules allow you to structure your application by grouping routes.">模块</Links> 中的 <code>install</code> 函数。
    以下代码片段展示了如何安装 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函数调用内部。
    </li>
    <li>
        ... 在显式定义的 <code>module</code> 内部，该模块是 <code>Application</code> 类的扩展函数。
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

</TabItem>
</Tabs>

安装 `ForwardedHeaders`/`XForwardedHeaders` 后，您可以使用 [call.request.origin](#request_info) 属性获取有关原始请求的信息。

## 获取请求信息 {id="request_info"}

### 代理请求信息 {id="proxy_request_info"}

要获取有关代理请求的信息，请在[路由处理程序](server-routing.md#define_route)中使用 [call.request.local](https://api.ktor.io/ktor-server-core/io.ktor.server.request/-application-request/local.html) 属性。
以下代码片段展示了如何获取有关代理地址和发出请求的主机的信息：

```kotlin
get("/hello") {
    val remoteHost = call.request.local.remoteHost
    val serverHost = call.request.local.serverHost
}
```

### 原始请求信息 {id="original-request-information"}

要读取有关原始请求的信息，请使用 [call.request.origin](https://api.ktor.io/ktor-server-core/io.ktor.server.plugins/origin.html) 属性：

```kotlin
get("/hello") {
    val originRemoteHost = call.request.origin.remoteHost
    val originServerHost = call.request.origin.serverHost
}
```

下表显示了 `call.request.origin` 公开的不同属性的值，具体取决于是否安装了 `ForwardedHeaders`/`XForwardedHeaders`。

![请求图示](forwarded-headers.png){width="706"}

| 属性 | 未安装 ForwardedHeaders | 已安装 ForwarderHeaders |
|------------------------|--------------------------|-----------------------|
| `origin.localHost`     | _web-server_             | _web-server_          |
| `origin.localPort`     | _8080_                   | _8080_                |
| `origin.serverHost`    | _web-server_             | _proxy_               |
| `origin.serverPort`    | _8080_                   | _80_                  |
| `origin.remoteHost`    | _proxy_                  | _client_              |
| `origin.remotePort`    | _32864_                  | _32864_               |

> 您可以在此处找到完整示例：[forwarded-header](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/forwarded-header)。

## 配置 ForwardedHeaders {id="configure"}

如果请求经过多个代理，您可能需要配置 `ForwardedHeaders`/`XForwardedHeaders`。
在这种情况下，`X-Forwarded-For` 包含每个连续代理的所有 IP 地址，例如：

```HTTP
X-Forwarded-For: <client>, <proxy1>, <proxy2>
```

默认情况下，`XForwardedHeader` 将 `X-Forward-For` 中的第一个条目分配给 `call.request.origin.remoteHost` 属性。
您还可以提供[选择 IP 地址](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forward-For#selecting_an_ip_address)的自定义逻辑。
[XForwardedHeadersConfig](https://api.ktor.io/ktor-server-forwarded-header/io.ktor.server.plugins.forwardedheaders/-x-forwarded-headers-config/index.html) 为此公开了以下 API：

- `useFirstProxy` 和 `useLastProxy` 分别允许您从 IP 地址列表中获取第一个或最后一个值。
- `skipLastProxies` 从右侧开始跳过指定数量的条目，并获取下一个条目。
   例如，如果 `proxiesCount` 参数等于 `3`，对于下方的标头，`origin.remoteHost` 将返回 `10.0.0.123`：
   ```HTTP
   X-Forwarded-For: 10.0.0.123, proxy-1, proxy-2, proxy-3
   ```
- `skipKnownProxies` 从列表中移除指定的条目并获取最后一个条目。
   例如，如果您将 `listOf("proxy-1", "proxy-3")` 传递给此函数，对于下方的标头，`origin.remoteHost` 将返回 `proxy-2`：
   ```HTTP
   X-Forwarded-For: 10.0.0.123, proxy-1, proxy-2, proxy-3
   ```
- `extractEdgeProxy` 允许您提供从 `X-Forward-*` 标头中提取值的自定义逻辑。