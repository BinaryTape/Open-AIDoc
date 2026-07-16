[//]: # (title: 缓存标头)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="CachingHeaders"/>
<var name="package_name" value="io.ktor.server.plugins.cachingheaders"/>
<var name="artifact_name" value="ktor-server-caching-headers"/>

<tldr>
<p>
<b>必要依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="caching-headers"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支持 Kotlin/Native，允许您在没有额外运行时或虚拟机的条件下运行服务器。">Native 服务器</Links>支持</b>：✅
</p>
</tldr>

[CachingHeaders](https://api.ktor.io/ktor-server-caching-headers/io.ktor.server.plugins.cachingheaders/-caching-headers.html) 插件提供了配置用于 HTTP 缓存的 `Cache-Control` 和 `Expires` 标头的功能。您可以按以下方式[配置缓存](#configure)：
- 为特定内容类型配置不同的缓存策略，例如图像、CSS 和 JavaScript 文件等。
- 在不同级别指定缓存选项：在应用级别全局配置、在路由级别配置或为特定调用配置。

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
    要向应用<a href="#install">安装</a> <code>%plugin_name%</code> 插件，请在指定的 <Links href="/ktor/server-modules" summary="模块允许您通过对路由进行分组来构建应用程序结构。">模块</Links> 中将其传递给 <code>install</code> 函数。
    下方的代码片段展示了如何安装 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函数调用内部。
    </li>
    <li>
        ... 在显式定义的 <code>module</code>（它是 <code>Application</code> 类的扩展函数）内部。
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
    <code>%plugin_name%</code> 插件也可以 <a href="#install-route">安装到特定路由</a>。
    如果您需要为不同应用资源提供不同的 <code>%plugin_name%</code> 配置，这会非常有用。
</p>

安装 `%plugin_name%` 后，您可以为各种内容类型[配置](#configure)缓存设置。

## 配置缓存 {id="configure"}
要配置 `%plugin_name%` 插件，您需要定义 [options](https://api.ktor.io/ktor-server-caching-headers/io.ktor.server.plugins.cachingheaders/-caching-headers-config/options.html) 函数，以为给定的 `ApplicationCall` 和内容类型提供指定的缓存选项。来自 [caching-headers](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/caching-headers) 示例的代码片段展示了如何为纯文本和 HTML 添加带有 `max-age` 选项的 `Cache-Control` 标头：

```kotlin
fun Application.module() {
    routing {
        install(CachingHeaders) {
            options { call, content ->
                when (content.contentType?.withoutParameters()) {
                    ContentType.Text.Plain -> CachingOptions(CacheControl.MaxAge(maxAgeSeconds = 3600))
                    ContentType.Text.Html -> CachingOptions(CacheControl.MaxAge(maxAgeSeconds = 60))
                    else -> null
                }
            }
        }
    }
}
```

[CachingOptions](https://api.ktor.io/ktor-http/io.ktor.http.content/-caching-options/index.html) 对象接受 `Cache-Control` 和 `Expires` 标头值作为参数：

* `cacheControl` 参数接受一个 [CacheControl](https://api.ktor.io/ktor-http/io.ktor.http/-cache-control/index.html) 值。您可以使用 `CacheControl.MaxAge` 来指定 `max-age` 参数和相关设置，例如可见性、重新验证选项等。您可以使用 `CacheControl.NoCache`/`CacheControl.NoStore` 来禁用缓存。
* `expires` 参数允许您将 `Expires` 标头指定为 `GMTDate` 或 `ZonedDateTime` 值。

### 路由级别 {id="configure-route"}

您不仅可以全局安装插件，还可以将其安装到[特定路由](server-plugins.md#install-route)。例如，下方的示例展示了如何为 `/index` 路由添加指定的缓存标头：

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

### 调用级别 {id="configure-call"}

如果您需要更细粒度的缓存设置，可以使用 `ApplicationCall.caching` 属性在调用级别配置缓存选项。下方的示例展示了如何根据用户是否登录来配置缓存选项：

```kotlin
route("/profile") {
    get {
        val userLoggedIn = true
        if(userLoggedIn) {
            call.caching = CachingOptions(CacheControl.NoStore(CacheControl.Visibility.Private))
            call.respondText("Profile page")
        } else {
            call.caching = CachingOptions(CacheControl.MaxAge(maxAgeSeconds = 900))
            call.respondText("Login page")
        }
    }
}
```

> 对于用户登录，您可以使用 [Authentication](server-auth.md) 和 [Sessions](server-sessions.md) 插件。