[//]: # (title: AutoHeadResponse)

<var name="plugin_name" value="AutoHeadResponse"/>
<var name="artifact_name" value="ktor-server-auto-head-response"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.autoHeadResponse"/>
<primary-label ref="server-plugin"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="autohead"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支持 Kotlin/Native，允许您在无需额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>：✅
</p>
</tldr>

<link-summary>
%plugin_name% 提供了为每个已定义 GET 的路由自动响应 HEAD 请求的能力。
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-auto-head-response/io.ktor.server.plugins.autohead/-auto-head-response.html) 插件为我们提供了为每个已定义 `GET` 的路由自动响应 `HEAD` 请求的能力。如果您需要在客户端获取实际内容之前先以某种方式处理响应，可以使用 `%plugin_name%` 来避免创建单独的 [head](server-routing.md#define_route) 处理程序。例如，调用 [respondFile](server-responses.md#file) 函数会自动向响应添加 `Content-Length` 和 `Content-Type` 标头，您可以在客户端下载文件之前获取这些信息。

## 添加依赖项 {id="add_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，请将 <code>%artifact_name%</code> 构件添加到您的构建脚本中：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录 (version catalog)</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录 (version catalog)</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 用法 {id="usage"}
为了使用此功能性，我们需要在应用程序中安装 `AutoHeadResponse` 插件。

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

在我们的示例中，`/home` 路由现在即使没有显式定义该动词，也会响应 `HEAD` 请求。

需要注意的是，如果我们使用了此插件，同一 `GET` 路由的自定义 `HEAD` 定义将被忽略。

## 选项 {id="options"}
`%plugin_name%` 未提供任何额外的配置选项。