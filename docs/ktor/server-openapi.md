[//]: # (title: OpenAPI)

<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-openapi"/>
<var name="package_name" value="io.ktor.server.plugins.openapi"/>
<var name="plugin_api_link" value="https://api.ktor.io/ktor-server-openapi/io.ktor.server.plugins.openapi/open-a-p-i.html"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="json-kotlinx-openapi"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支持 Kotlin/Native，允许您在没有额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>：✖️
</p>
</tldr>

<link-summary>
OpenAPI 插件允许您为项目生成 OpenAPI 文档。
</link-summary>

Ktor 允许您基于 OpenAPI 规范提供 OpenAPI 文档。

您可以通过以下方式之一提供 OpenAPI 规范：

* [提供现有的 YAML 或 JSON 文件](#static-openapi-file)。
* [使用 OpenAPI 编译器扩展和运行时 API 在运行时生成规范](#generate-runtime-openapi-metadata)。

在这两种情况下，OpenAPI 插件都会在服务器上组装规范，并将文档渲染为 HTML。

## 添加依赖项 {id="add_dependencies"}

* 提供 OpenAPI 文档需要在构建脚本中添加 `%artifact_name%` 构件：

  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"></code-block>
      </TabItem>
  </Tabs>

* （可选）如果您想自定义[代码生成器](https://github.com/swagger-api/swagger-codegen-generators)，请添加 `swagger-codegen-generators` 依赖项：

  <var name="group_id" value="io.swagger.codegen.v3"/>
  <var name="artifact_name" value="swagger-codegen-generators"/>
  <var name="version" value="swagger_codegen_version"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"></code-block>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"></code-block>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;%group_id%&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%&lt;/artifactId&gt;&#10;                  &lt;version&gt;${%version%}&lt;/version&gt;&#10;              &lt;/dependency&gt;"></code-block>
      </TabItem>
  </Tabs>

  您可以将 `$swagger_codegen_version` 替换为所需的 `swagger-codegen-generators` 构件版本，例如 `%swagger_codegen_version%`。

> 在 Ktor 3.4.0 中，`OpenAPI` 插件需要 `ktor-server-routing-openapi` 依赖项。
> 这并非有意的破坏性改动，并将在 Ktor 3.4.1 中得到修正。
> 如果您使用的是 Ktor 3.4.0，请手动添加该依赖项以避免运行时错误。
>
{style="warning"}

## 使用静态 OpenAPI 文件 {id="static-openapi-file"}

要从现有规范提供 OpenAPI 文档，请使用 [`openAPI()`](%plugin_api_link%) 函数并提供 OpenAPI 文档的路径。

以下示例在 `openapi` 路径处创建了一个 `GET` 端点，并根据提供的 OpenAPI 规范文件渲染 Swagger UI：

```kotlin
import io.ktor.server.plugins.openapi.*

// ...
routing {
    openAPI(path="openapi", swaggerFile = "openapi/documentation.yaml")
}
```

该插件首先在应用程序资源中查找规范。如果未找到，它将尝试使用 `java.io.File` 从文件系统中加载它。

## 生成运行时 OpenAPI 元数据

您可以不依赖静态文件，而是使用由 OpenAPI 编译器插件和路由注解生成的元数据，在运行时生成 OpenAPI 规范。

在此模式下，OpenAPI 插件直接从路由树组装规范：

```kotlin
 openAPI(path = "openapi") {
    info = OpenApiInfo("My API", "1.0")
    source = OpenApiDocSource.Routing {
        routingRoot.descendants()
    }
}
```

这样一来，您就可以在 `/openapi` 路径访问生成的 OpenAPI 文档，该文档反映了应用程序的当前状态。

> 有关 OpenAPI 编译器扩展和运行时 API 的更多信息，请参阅 [OpenAPI 规范生成](openapi-spec-generation.md)。
> 
{style="tip"}

## 配置 OpenAPI {id="configure-openapi"}

默认情况下，文档使用 `StaticHtml2Codegen` 渲染。您可以在 `openAPI {}` 代码块中自定义渲染器：

```kotlin
routing {
    openAPI(path="openapi", swaggerFile = "openapi/documentation.yaml") {
        codegen = StaticHtmlCodegen()
    }
}