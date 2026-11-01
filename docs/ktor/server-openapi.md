[//]: # (title: OpenAPI)

<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-openapi"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.openapi"/>
<var name="package_name" value="io.ktor.server.plugins.openapi"/>
<var name="plugin_api_link" value="https://api.ktor.io/ktor-server-openapi/io.ktor.server.plugins.openapi/open-a-p-i.html"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="json-kotlinx-openapi"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支持 Kotlin/Native，并允许你在没有额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>：✖️
</p>
</tldr>

<link-summary>
OpenAPI 插件允许你为项目生成 OpenAPI 文档。
</link-summary>

Ktor 允许你基于 OpenAPI 规范提供 OpenAPI 文档服务。

你可以通过以下方式之一提供 OpenAPI 规范：

* [提供现有的 YAML 或 JSON 文件](#static-openapi-file)。
* [使用 OpenAPI 编译器扩展和运行时 API 在运行时生成规范](#generate-runtime-openapi-metadata)。

在这两种情况下，OpenAPI 插件都会在服务器上装配规范，并将文档渲染为 HTML。

## 添加依赖项 {id="add_dependencies"}

* 提供 OpenAPI 文档服务需要在构建脚本中添加 `%artifact_name%` 构件：

  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(%ktor_version_catalog_name%)"/>
          <note>
              上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
              Ktor 版本目录</a>来指定 Ktor 依赖项。
          </note>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation %ktor_version_catalog_name%"/>
          <note>
              上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
              Ktor 版本目录</a>来指定 Ktor 依赖项。
          </note>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>

* （可选）如果你想自定义[代码生成器](https://github.com/swagger-api/swagger-codegen-generators)，请添加 `swagger-codegen-generators` 依赖项：

  <var name="group_id" value="io.swagger.codegen.v3"/>
  <var name="artifact_name" value="swagger-codegen-generators"/>
  <var name="version" value="swagger_codegen_version"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"/>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"/>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;%group_id%&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%&lt;/artifactId&gt;&#10;                  &lt;version&gt;${%version%}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>

  你可以将 `$swagger_codegen_version` 替换为所需版本的 `swagger-codegen-generators` 构件，例如 `%swagger_codegen_version%`。

## 使用静态 OpenAPI 文件 {id="static-openapi-file"}

要从现有规范提供 OpenAPI 文档服务，请使用 [`openAPI()`](%plugin_api_link%) 函数并传入 OpenAPI 文档的路径。

以下示例在 `openapi` 路径创建了一个 `GET` 端点，并从提供的 OpenAPI 规范文件渲染 Swagger UI：

```kotlin
import io.ktor.server.plugins.openapi.*

// ...
routing {
    openAPI(path="openapi", swaggerFile = "openapi/documentation.yaml")
}
```

插件首先会在应用程序资源中查找该规范。如果未找到，它会尝试使用 `java.io.File` 从文件系统中加载。

## 生成运行时 OpenAPI 元数据 {id="generate-runtime-openapi-metadata"}

除了依赖静态文件之外，你还可以使用 OpenAPI 编译器插件和路由注解生成的元数据，在运行时生成 OpenAPI 规范。

在这种模式下，OpenAPI 插件直接从路由树中装配规范：

```kotlin
 openAPI(path = "openapi") {
    info = OpenApiInfo("My API", "1.0")
    source = OpenApiDocSource.Routing {
        routingRoot.descendants()
    }
}
```

这样，你就可以在 `/openapi` 路径访问生成的 OpenAPI 文档，该文档反映了应用程序的当前状态。

> 有关 OpenAPI 编译器扩展和运行时 API 的更多信息，请参阅 [OpenAPI 规范生成](openapi-spec-generation.md)。
> 
{style="tip"}

## 配置 OpenAPI {id="configure-openapi"}

`openAPI {}` 配置块允许你配置生成的 OpenAPI 文档以及 Ktor 渲染文档的方式。

### 配置文档元数据 {id="configure-document-metadata"}

你可以直接在配置块中定义顶层 OpenAPI 元数据。

例如，使用 `info` 指定常规 API 信息，使用 `tag()` 定义标签及其描述：

```kotlin
openAPI("openapi") {
    info = OpenApiInfo("Books API from routes", "1.0.0")
    tag(
        name = "Books",
        description = "Operations on books"
    )
}
```

你还可以配置其他顶层 OpenAPI 属性，例如服务器、安全要求、可重用组件、外部文档和规范扩展。

> 有关可用选项的完整列表，请参阅 [`OpenAPIConfig`](https://api.ktor.io/ktor-server-openapi/io.ktor.server.plugins.openapi/-open-a-p-i-config/index.html)
> API 参考。
>
{style="tip"}

### 配置文档渲染器 {id="configure-the-document-renderer"}

默认情况下，文档使用 `StaticHtml2Codegen` 进行渲染。

若要使用不同的渲染器，请将其赋值给 `codegen` 属性：

```kotlin
routing {
    openAPI(path="openapi", swaggerFile = "openapi/documentation.yaml") {
        codegen = StaticHtmlCodegen()
    }
}
```

> `StaticHtmlCodegen` 和 `StaticHtml2Codegen` 仅支持 OpenAPI 3.0.x 文档。将它们用于 OpenAPI 3.1 文档可能会生成不完整或不正确的 HTML。对于 OpenAPI 3.1，请使用搭配 Swagger UI 5.x 的 [`swaggerUI()`](server-swagger-ui.md) 函数。如果需要继续使用 OpenAPI 插件的 HTML 渲染器，请将规范保持在 OpenAPI 3.0.3。
>
{style="note"}