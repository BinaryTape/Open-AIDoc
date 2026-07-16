[//]: # (title: AutoHeadResponse)

<var name="plugin_name" value="AutoHeadResponse"/>
<var name="artifact_name" value="ktor-server-auto-head-response"/>
<primary-label ref="server-plugin"/>

<tldr>
<p>
<b>必需的依赖项</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="autohead"/>
<p>
    <b>代码示例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">原生服务器</Links> 支持</b>: ✅
</p>
</tldr>

<link-summary>
%plugin_name% 能够为每一个定义了 GET 的路由自动响应 HEAD 请求。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-auto-head-response/io.ktor.server.plugins.autohead/-auto-head-response.html) 插件能够为每一个定义了 GET 的路由自动响应 `HEAD` 请求。如果您需要在获取实际内容之前以某种方式在客户端处理响应，可以使用 `%plugin_name%` 来避免创建单独的 [head](server-routing.md#define_route) 处理程序。例如，调用 [respondFile](server-responses.md#file) 函数会自动向响应添加 `Content-Length` 和 `Content-Type` 响应头，您可以在下载文件之前在客户端获取这些信息。

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

## 用法
为了利用此功能，我们需要在应用程序中安装 `AutoHeadResponse` 插件。

```kotlin
import io.ktor.server.application.*
import io.ktor.server.plugins.autohead.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.main() {
    install(AutoHeadResponse)
    routing {
        get("/home") {
            call.respondText("This is a response to a GET, but HEAD also works")
        }
    }
}
```

在我们的案例中，即使没有为该谓词进行显式定义，`/home` 路由现在也将响应 `HEAD` 请求。

需要注意的是，如果我们使用此插件，同一 `GET` 路由的自定义 `HEAD` 定义将被忽略。

## 选项
`%plugin_name%` 不提供任何额外的配置选项。