[//]: # (title: CORS)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-cors"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.cors"/>
<var name="package_name" value="io.ktor.server.plugins.cors"/>
<var name="plugin_name" value="CORS"/>

<tldr>
<p>
<b>必需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="cors"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支持 Kotlin/Native，允许您在没有额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>：✅
</p>
</tldr>

如果您的服务器需要处理[跨源请求](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)，则需要安装并配置 [CORS](https://api.ktor.io/ktor-server-cors/io.ktor.server.plugins.cors.routing/-c-o-r-s.html) Ktor 插件。此插件允许您配置允许的主机、HTTP 方法、客户端设置的标头等。

## 添加依赖项 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，请将 <code>%artifact_name%</code> 工件添加到您的构建脚本中：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">Ktor 版本目录</a>来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">Ktor 版本目录</a>来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 安装 %plugin_name% {id="install_plugin"}

<p>
    要将 <code>%plugin_name%</code> 插件<a href="server-plugins.md#install">安装</a>到您的应用程序中，请将其传递给指定<Links href="server-modules.md" summary="模块允许您通过对路由进行分组来构建应用程序。">模块</Links>中的 <code>install</code> 函数。以下示例展示了如何安装 <code>%plugin_name%</code>：
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
<p>
    <code>%plugin_name%</code> 插件也可以<a href="server-plugins.md#install-route">安装到特定路由</a>。如果您需要为不同的应用程序资源配置不同的 <code>%plugin_name%</code> 配置，这会非常有用。
</p>

> 如果将 `CORS` 插件安装到特定路由，您需要向该路由添加 `options` [处理程序](server-routing.md#define_route)。这样 Ktor 才能正确响应 CORS 预检请求。

## 配置 CORS {id="configure"}

CORS 专属配置设置由 [CORSConfig](https://api.ktor.io/ktor-server-cors/io.ktor.server.plugins.cors/-c-o-r-s-config/index.html) 类公开。让我们来看看如何配置这些设置。

### 概述 {id="overview"}

假设您有一个侦听在 `8080` 端口上的服务器，其 `/customer` [路由](server-routing.md)响应 [JSON](server-serialization.md#send_data) 数据。以下代码段展示了在另一个端口上运行的客户端使用 Fetch API 发起请求，使该请求成为跨源请求的示例：

```javascript
function saveCustomer() {
    fetch('http://0.0.0.0:8080/customer',
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({id: 3, firstName: "Jet", lastName: "Brains"})
        })
        .then(response => response.text())
        .then(data => {
            console.log('Success:', data);
            alert(data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

```
{initial-collapse-state="collapsed" collapsed-title="
fetch('http://0.0.0.0:8080/customer')"}

为了在后端允许此类请求，您需要按如下方式配置 `CORS` 插件：

```kotlin
install(CORS) {
    allowHost("0.0.0.0:8081")
    allowHeader(HttpHeaders.ContentType)
}
```

您可以在此处找到完整示例：[cors](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/cors)。

### 主机 {id="hosts"}

要指定允许发起跨源请求的主机，请使用 `allowHost` 函数。除主机名外，您还可以指定端口号、子域列表或支持的 HTTP scheme。

```kotlin
install(CORS) {
    allowHost("client-host")
    allowHost("client-host:8081")
    allowHost("client-host", subDomains = listOf("en", "de", "es"))
    allowHost("client-host", schemes = listOf("http", "https"))
}
```

要允许来自任意主机的跨源请求，请使用 `anyHost` 函数。

```kotlin
install(CORS) {
    anyHost()
}
```

### HTTP 方法 {id="methods"}

默认情况下，`%plugin_name%` 插件允许 `GET`、`POST` 和 `HEAD` HTTP 方法。要添加其他方法，请使用 `allowMethod` 函数。

```kotlin
install(CORS) {
    allowMethod(HttpMethod.Options)
    allowMethod(HttpMethod.Put)
    allowMethod(HttpMethod.Patch)
    allowMethod(HttpMethod.Delete)
}
```

### 允许的标头 {id="headers"}

默认情况下，`%plugin_name%` 插件允许以下由 `Access-Control-Allow-Headers` 管理的客户端标头：

* `Accept`
* `Accept-Language`
* `Content-Language`

要允许其他标头，请使用 `allowHeader` 函数。

```kotlin
install(CORS) {
    allowHeader(HttpHeaders.ContentType)
    allowHeader(HttpHeaders.Authorization)
}
```

要允许自定义标头，请使用 `allowHeaders` 或 `allowHeadersPrefixed` 函数。例如，以下代码段展示了如何允许带有 `custom-` 前缀的标头。

```kotlin
install(CORS) {
    allowHeadersPrefixed("custom-")
}
```

> 请注意，对于非简单内容类型，`allowHeaders` 或 `allowHeadersPrefixed` 需要将 [allowNonSimpleContentTypes](https://api.ktor.io/ktor-server-cors/io.ktor.server.plugins.cors/-c-o-r-s-config/allow-non-simple-content-types.html) 属性设置为 `true`。

### 公开标头 {id="expose-headers"}

`Access-Control-Expose-Headers` 标头将指定的标头添加到浏览器中的 JavaScript 可以访问的允许列表中。
要配置此类标头，请使用 `exposeHeader` 函数。

```kotlin
install(CORS) {
    // ...
    exposeHeader("X-My-Custom-Header")
    exposeHeader("X-Another-Custom-Header")
}
```

### 凭据 {id="credentials"}

默认情况下，浏览器不会在跨源请求中发送凭据信息（例如 Cookie 或身份验证信息）。要允许传递此类信息，请使用 `allowCredentials` 属性将 `Access-Control-Allow-Credentials` 响应标头设置为 `true`。

```kotlin
install(CORS) {
    allowCredentials = true
}
```

### 其他设置 {id="misc"}

`%plugin_name%` 插件还允许您指定其他与 CORS 相关的设置。例如，您可以使用 `maxAgeInSeconds` 来指定预检请求的响应在不发送另一个预检请求的情况下可以缓存多长时间。

```kotlin
install(CORS) {
    maxAgeInSeconds = 3600
}
```

您可以参阅 [CORSConfig](https://api.ktor.io/ktor-server-cors/io.ktor.server.plugins.cors/-c-o-r-s-config/index.html) 了解详情并查看其他配置选项。