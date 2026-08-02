[//]: # (title: Swagger UI)

<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-swagger"/>
<var name="package_name" value="io.ktor.server.plugins.swagger"/>
<var name="plugin_api_link" value="https://api.ktor.io/ktor-server-swagger/io.ktor.server.plugins.swagger/swagger-u-i.html"/>

<tldr>
<p>
<b>必需的依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="json-kotlinx-openapi"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支持 Kotlin/Native，允许您在没有额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>：✖️
</p>
</tldr>

<link-summary>
SwaggerUI 插件允许您为项目生成 Swagger UI。
</link-summary>

Ktor 允许您基于 OpenAPI 规范为项目生成并提供 Swagger UI。
借助 Swagger UI，您可以直接在浏览器中可视化您的 API 端点并与其交互。 

您可以通过以下方式之一提供 OpenAPI 规范：

* [提供现有的 YAML 或 JSON 文件](#static-openapi-file)。
* [使用 OpenAPI 编译器扩展和运行时 API 在运行时生成规范](#generate-runtime-openapi-metadata)。

## 添加依赖项 {id="add_dependencies"}

提供 Swagger UI 需要在构建脚本中添加 `%artifact_name%` 构件：

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

> 在 Ktor 3.4.0 中，`SwaggerUI` 插件需要 `ktor-server-routing-openapi` 依赖项。
> 这并非有意引入的破坏性变更，并将会在 Ktor 3.4.1 中修正。
> 如果您正在使用 Ktor 3.4.0，请手动添加该依赖项以避免运行时错误。
> 
{style="warning"}

## 使用静态 OpenAPI 文件 {id="static-openapi-file"}

要从现有的 OpenAPI 规范文件提供 Swagger UI，请使用 [`swaggerUI()`](%plugin_api_link%) 函数并指定文件位置。

以下示例在 `swagger` 路径处创建了一个 `GET` 端点，并根据提供的 OpenAPI 规范文件渲染 Swagger UI：

```kotlin
import io.ktor.server.plugins.swagger.*

// ...
routing {
    swaggerUI(path = "swagger", swaggerFile = "openapi/documentation.yaml")
}
```

该插件首先在应用程序资源中查找规范。如果未找到，它会尝试使用 `java.io.File` 从文件系统加载。

## 在运行时生成 OpenAPI 元数据

除了依赖静态文件外，您还可以使用 OpenAPI 编译器插件生成的元数据和路由注解在运行时生成 OpenAPI 规范：

```kotlin
swaggerUI("/swaggerUI") {
    info = OpenApiInfo("My API", "1.0")
    source = OpenApiDocSource.Routing(ContentType.Application.Json) {
        routingRoot.descendants()
    }
}
```

借助此功能，您可以在 `/swaggerUI` 路径处访问生成的 OpenAPI 文档，该文档反映了应用程序的当前状态。

> 有关 OpenAPI 编译器扩展和运行时 API 的更多信息，请参阅 [OpenAPI 规范生成](openapi-spec-generation.md)。
>
{style="tip"}

## 配置 Swagger UI

您可以在 `swaggerUI {}` 代码块中自定义 Swagger UI，例如通过指定自定义的 Swagger UI 版本：

```kotlin
routing {
    swaggerUI(path = "swagger", swaggerFile = "openapi/documentation.yaml") {
        version = "5.31.0"
    }
}
```

> OpenAPI 3.1.x 文档需要 Swagger UI 5.x，而 Swagger UI 4.x 仅支持 OpenAPI 3.0.x。
>
{style="note"}

## 配置 CORS {id="configure-cors"}

为了确保 Swagger UI 能够正确访问您的 API 端点，您需要先配置[跨源资源共享 (CORS)](server-cors.md)。

下面的示例应用了以下 CORS 配置：
* `anyHost` 允许来自任何主机的跨源请求。
* `allowHeader` 允许用于[内容协商](server-serialization.md)的 `Content-Type` 客户端标头。

```kotlin
install(CORS) {
    anyHost()
    allowHeader(HttpHeaders.ContentType)
}