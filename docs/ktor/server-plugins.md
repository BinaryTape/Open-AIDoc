[//]: # (title: 服务器插件)

<show-structure for="chapter" depth="2"/>

<link-summary>
插件提供常用功能，例如序列化、内容编码、压缩等。
</link-summary>

Ktor 中典型的请求/响应流水线如下所示：

![请求响应流水线](request-response-pipeline.png){width="600"}

它以请求开始，该请求被路由到特定的处理程序，由我们的应用程序逻辑处理，并最终得到响应。 

## 通过插件添加功能 {id="add_functionality"}

许多应用程序需要超出应用程序逻辑范围的通用功能。这些可能是序列化和内容编码、压缩、标头、Cookie 支持等。所有这些都在 Ktor 中通过我们所谓的**插件**提供。 

如果我们查看之前的流水线图，插件位于请求/响应与应用程序逻辑之间：

![插件流水线](plugin-pipeline.png){width="600"}

当请求进入时：

* 它通过路由机制被路由到正确的处理程序 
* 在移交给处理程序之前，它会经过一个或多个插件
* 处理程序（应用程序逻辑）处理该请求
* 在响应发送到客户端之前，它会经过一个或多个插件

## 路由是一个插件 {id="routing"}

插件的设计方式旨在提供最大的灵活性，并允许它们存在于请求/响应流水线的任何环节。
事实上，我们一直称之为 `routing` 的部分，本质上也不过是一个插件。 

![作为插件的路由](plugin-pipeline-routing.png){width="600"}

## 添加插件依赖项 {id="dependency"}
大多数插件需要特定的依赖项。例如，`CORS` 插件需要通过在构建脚本中添加 `ktor-server-cors` 构件：

<var name="artifact_name" value="ktor-server-cors"/>
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

## 安装插件 {id="install"}

插件通常在服务器初始化阶段使用 `install` 函数进行配置，该函数接受一个插件作为参数。根据您[创建服务器](server-create-and-configure.topic)的方式，您可以在 `embeddedServer` 调用中安装插件……

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

……或者在指定的[模块](server-modules.md)中安装：

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

除了拦截请求和响应外，插件还可以包含一个在这一步进行配置的可选配置部分。

例如，在安装 [Cookies](server-sessions.md#cookie) 时，我们可以设置某些参数，例如我们希望存储 Cookie 的位置或其名称：

```kotlin
install(Sessions) {
    cookie<MyCookie>("MY_COOKIE")
} 
```

### 为特定路由安装插件 {id="install-route"}

在 Ktor 中，您不仅可以全局安装插件，还可以为特定的[路由](server-routing.md)安装插件。如果您需要为不同的应用程序资源使用不同的插件配置，这会非常有用。例如，下面的[示例](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/caching-headers-routes)显示了如何为 `/index` 路由添加指定的[缓存标头](server-caching-headers.md)：

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

注意，以下规则适用于同一插件的多次安装：
* 安装到特定路由的插件配置会覆盖其[全局配置](#install)。
* 路由会合并同一路由的安装，且最后一次安装生效。例如，对于这样一个应用程序…… 
   
   ```kotlin
   routing {
       route("index") {
           install(CachingHeaders) { /* 第一次配置 */ }
           get("a") {
               // ...
           }
       }
       route("index") {
           install(CachingHeaders) { /* 第二次配置 */ }
           get("b") {
               // ...
           }
       }
   }
   ```
   {initial-collapse-state="collapsed" collapsed-title="install(CachingHeaders) { // 第一次配置 }"}
   
   ……对 `/index/a` 和 `/index/b` 的调用都仅由该插件的第二次安装处理。

## 默认、可用及自定义插件 {id="default_available_custom"}

默认情况下，Ktor 不会激活任何插件，因此需要您根据应用程序所需的功能自行安装插件。

不过，Ktor 确实提供了多种开箱即用的插件。您可以在 [Ktor 插件库](https://github.com/ktorio/ktor-plugin-registry/tree/main/plugins/server)中查看这些插件的完整列表。

此外，您还可以创建自己的[自定义插件](server-custom-plugins.md)。