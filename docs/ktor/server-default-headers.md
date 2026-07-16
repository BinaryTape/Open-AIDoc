[//]: # (title: 默认页眉)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-default-headers"/>
<var name="package_name" value="io.ktor.server.plugins.defaultheaders"/>
<var name="plugin_name" value="DefaultHeaders"/>
<var name="plugin_api_link" value="https://api.ktor.io/ktor-server-default-headers/io.ktor.server.plugins.defaultheaders/-default-headers.html"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支持 Kotlin/Native，允许您在没有额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links> 支持</b>：✅
</p>
</tldr>

[%plugin_name%](%plugin_api_link%) 插件会在每个响应中添加标准的 `Server` 和 `Date` 页眉。此外，您可以提供额外的默认页眉并重写 `Server` 页眉。

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
    要将 <code>%plugin_name%</code> 插件安装到应用程序，请将其传递给指定 <Links href="/ktor/server-modules" summary="模块允许您通过对路由进行分组来构建应用程序。">模块</Links> 中的 <code>install</code> 函数。
    下面的代码片段展示了如何安装 <code>%plugin_name%</code> ……
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
    <code>%plugin_name%</code> 插件也可以<a href="#install-route">安装到特定路由</a>。
    如果您需要为不同的应用程序资源使用不同的 <code>%plugin_name%</code> 配置，这可能会很有用。
</p>

## 配置 %plugin_name% {id="configure"}
### 添加额外页眉 {id="add"}
要自定义默认页眉列表，请通过使用 `header(name, value)` 函数将所需的页眉传递给 `install`。`name` 参数接受 `HttpHeaders` 值，例如：
```kotlin
    install(DefaultHeaders) {
        header(HttpHeaders.ETag, "7c876b7e")
    }
```
要添加自定义页眉，请将其名称作为字符串值传递：
```kotlin
    install(DefaultHeaders) {
        header("Custom-Header", "Some value")
    }
```

### 重写页眉 {id="override"}
要重写 `Server` 页眉，请使用相应的 `HttpHeaders` 值：
```kotlin
    install(DefaultHeaders) {
        header(HttpHeaders.Server, "Custom")
    }
```
请注意，出于性能原因，`Date` 页眉会被缓存，无法使用 `%plugin_name%` 进行重写。