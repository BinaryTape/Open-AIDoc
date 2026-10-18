[//]: # (title: 服务器插件)

<show-structure for="chapter" depth="2"/>

<link-summary>
插件提供通用功能性，例如序列化、内容编码、压缩等。
</link-summary>

Ktor 中典型的请求/响应流水线如下所示：

![Request Response Pipeline](request-response-pipeline.png){width="600"}

服务器接收请求并通过请求流水线对其进行处理。Ktor 将请求路由到相应的处理程序，由您的应用程序逻辑对其进行处理。然后，响应在发送到客户端之前会经过响应流水线。

## 通过插件添加功能 {id="add_functionality"}

许多应用程序都需要独立于应用程序逻辑的功能性。这包括身份验证、序列化和内容编码、压缩、标头、Cookie 等。在 Ktor 中，此类功能性由*插件*提供。

插件可以拦截请求和响应处理的不同阶段。因此，它们可以应用在请求/响应流水线的不同节点上：

![Plugin pipeline](plugin-pipeline.png){width="600"}

插件运行的具体阶段取决于该插件本身以及它所使用的钩子或流水线阶段。通常，请求的处理流程如下：

* 路由机制确定应由哪个处理程序来处理该请求。
* 在移交给处理程序之前，请求会由一个或多个插件进行处理。
* 处理程序使用应用程序逻辑生成响应。
* 在响应发送到客户端之前，响应会由一个或多个插件进行处理。

## 路由本身也是插件 {id="routing"}

插件旨在提供最大的灵活性，并可存在于请求/响应流水线的任何环节中。在 Ktor 中，`routing` 本身就是作为一个插件实现的：

![Routing as a Plugin](plugin-pipeline-routing.png){width="600"}

## 添加插件依赖项 {id="dependency"}

大多数插件都需要单独的依赖项。例如，[`CORS`](server-cors.md) 插件需要在构建脚本中包含 `ktor-server-cors` 构件：

<var name="artifact_name" value="ktor-server-cors"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

> 有关可用插件的完整列表，请参阅 [Ktor 项目生成器](https://start.ktor.io/settings)。有关特定插件所需的依赖项，请参阅相应的插件文档。
> 
{style="tip"}

## 安装插件 {id="install"}

插件通常在服务器初始化阶段使用 `install()` 函数进行配置。根据您[创建服务器](server-create-and-configure.topic)的方式，您可以在 `embeddedServer()` 函数内部或在[应用程序模块](server-modules.md)中安装插件：

<Tabs>
<TabItem title="embeddedServer()">

```kotlin
import io.ktor.server.application.*
import io.ktor.server.plugins.cors.*
import io.ktor.server.plugins.compression.*
// ...
fun main() {
    embeddedServer(Netty, port = 8080) {
        install(CORS)
        install(Compression)
        // ...
    }.start(wait = true)
}
```

</TabItem>
<TabItem title="Application.module()">

```kotlin
import io.ktor.server.application.*
import io.ktor.server.plugins.cors.*
import io.ktor.server.plugins.compression.*
// ...
fun Application.module() {
    install(CORS)
    install(Compression)
    // ...
}
```

</TabItem>
</Tabs>

在安装插件时，您可以通过向 `install()` 函数传递配置块来配置插件。

例如，在安装 [`Sessions` 插件](server-sessions.md)时，您可以通过指定会话类型和 Cookie 名称来配置基于 Cookie 的会话：

```kotlin
install(Sessions) {
    cookie<MyCookie>("MY_COOKIE")
} 
```

### 将插件安装到特定路由 {id="install-route"}

在 Ktor 中，您不仅可以全局安装插件，还可以将它们安装在特定的[路由](server-routing.md)上。当不同资源需要不同的插件配置时，这非常有用。

例如，以下代码演示了在 `/index` 路由上安装 [`CachingHeader` 插件](server-caching-headers.md)，并配置其添加缓存标头：

```kotlin
route("/index") {
    install(CachingHeaders) {
        options { call, content -> CachingOptions(CacheControl.MaxAge(maxAgeSeconds = 1800)) }
    }
    get {
        call.respondText("Index page")
    }
}
```

当在多个层级安装相同的插件时，Ktor 会应用以下规则：

* 安装到特定路由的插件配置会覆盖相应的[全局插件配置](#install)。
* 如果同一路由被多次定义且包含同一插件的多次安装，则路由会合并该路由上的安装。以最后一次安装为准。

在以下示例中，对 `/index/a` 和 `/index/b` 的调用都仅由第二个 `CachingHeaders` 安装处理：
   
 ```kotlin
 routing {
     route("index") {
         install(CachingHeaders) { /* First configuration */ }
         get("a") {
             // ...
         }
     }
     route("index") {
         install(CachingHeaders) { /* Second configuration */ }
         get("b") {
             // ...
         }
     }
 }
 ```
 {initial-collapse-state="collapsed" collapsed-title="install(CachingHeaders) { // First configuration }"}

## 默认、可用和自定义插件 {id="default_available_custom"}

Ktor 默认不安装应用程序插件。请安装能提供应用程序所需功能性的插件。

Ktor 提供了丰富的插件。您可以在 [Ktor 项目生成器](https://start.ktor.io/settings)中找到可用插件的完整列表。

您还可以创建自己的[自定义插件](server-custom-plugins.md)，以封装可在应用程序内重用或与其他应用程序共享的功能性。