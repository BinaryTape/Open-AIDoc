[//]: # (title: 部分内容)

<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-partial-content"/>
<var name="package_name" value="io.ktor.server.plugins.partialcontent"/>
<var name="plugin_name" value="PartialContent"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<p>
<b>服务器示例</b>：
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/download-file">download-file</a>，
<b>客户端示例</b>：
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-download-file-range">client-download-file-range</a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支持 Kotlin/Native，并允许您在没有额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links> 支持</b>：✅
</p>
</tldr>

[%plugin_name%](https://api.ktor.io/ktor-server-partial-content/io.ktor.server.plugins.partialcontent/-partial-content.html) 插件添加了对处理 [HTTP 范围请求](https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests) 的支持，这些请求用于仅将 HTTP 消息的一部分发送回客户端。此插件对于流式传输内容或恢复部分下载非常有用。

`%plugin_name%` 具有以下限制：
- 仅适用于 `HEAD` 和 `GET` 请求，如果客户端尝试在其他方法中使用 `Range` 标头，则返回 `405 Method Not Allowed`。
- 仅适用于已定义 `Content-Length` 标头的响应。
- 在提供范围内容时禁用 [压缩](server-compression.md)。

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
    要将 <code>%plugin_name%</code> 插件 <a href="#install">安装</a> 到应用程序中，请将其传递给指定 <Links href="/ktor/server-modules" summary="模块允许您通过对路由进行分组来构建应用程序结构。">模块</Links> 中的 <code>install</code> 函数。
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
<p>
    <code>%plugin_name%</code> 插件也可以 <a href="#install-route">安装到特定路由</a>。
    如果您需要为不同的应用程序资源使用不同的 <code>%plugin_name%</code> 配置，这可能会很有用。
</p>

要了解如何使用 `%plugin_name%` 通过 HTTP 范围请求提供文件，请参阅 [文件](server-responses.md#file) 部分。