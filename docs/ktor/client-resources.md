[//]: # (title: 类型安全请求)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<var name="plugin_name" value="Resources"/>
<var name="artifact_name" value="ktor-client-resources"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.resources"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-type-safe-requests"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
了解如何使用 Resources 插件发出类型安全请求。
</link-summary>

Ktor 提供了 `%plugin_name%` 插件用于发出类型安全的[客户端请求](client-requests.md)。
为此，你需要定义代表服务器端点的类，并使用 `@Resource` 关键字对其进行注解。

资源类使用 `kotlinx.serialization` 将其属性转换为路径和查询参数。

> 在服务端，Ktor 提供了[类型安全路由](server-resources.md)。
>
{style="tip"}

## 添加依赖项 {id="add_dependencies"}

### 添加 kotlinx.serialization {id="add_serialization"}

`Resources` 插件依赖于 `kotlinx.serialization`。按照 [`kotlinx.serialization` 设置指南](https://github.com/Kotlin/kotlinx.serialization#setup)中的说明启用 Kotlin 序列化插件。

### 添加 %plugin_name% 依赖项 {id="add_plugin_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，请将 <code>%artifact_name%</code> 工件添加到构建脚本中：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a>指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a>指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>
<tip>
    要详细了解 Ktor 客户端所需的工件，请参阅<Links href="client-dependencies.md" summary="了解如何向现有项目添加客户端依赖项。">添加客户端依赖项</Links>。
</tip>

## 安装 %plugin_name% {id="install_plugin"}

要安装 `%plugin_name%` 插件，请在[客户端配置块](client-create-and-configure.md#configure-client)中将其传递给 `install` 函数：

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.resources.*
//...
val client = HttpClient(CIO) {
    install(Resources)
}
```

## 创建资源类 {id="resource_classes"}

每个资源类都应带有 `@Resource` 注解。
下面我们将介绍资源类的几个示例——包括定义单个路径段、查询参数和路径参数等。

### 资源 URL {id="resource_url"}

以下示例展示了如何定义 `Articles` 类，该类指定了响应 `/articles` 路径的资源。

```kotlin
import io.ktor.resources.*

@Resource("/articles")
class Articles()
```

### 带查询参数的资源 {id="resource_query_param"}

下面的 `Articles` 类具有字符串属性 `sort`，该属性充当[查询参数](server-requests.md#query_parameters)，允许你定义响应带有 `sort` 查询参数的路径 `/articles?sort=new` 的资源。

```kotlin
@Resource("/articles")
class Articles(val sort: String? = "new")
```

### 包含嵌套类的资源 {id="resource_nested"}

你可以嵌套类来创建包含多个路径段的资源。请注意，在这种情况下，嵌套类应该包含一个外层类类型的属性。
以下示例展示了响应 `/articles/new` 路径的资源。

```kotlin
@Resource("/articles")
class Articles() {
    @Resource("new")
    class New(val parent: Articles = Articles())
}
```

### 带路径参数的资源 {id="resource_path_param"}

以下示例演示了如何添加[嵌套](#resource_nested)的 `{id}` 整数[路径参数](server-routing.md#path_parameter)，该参数匹配路径段并将其捕获为名为 `id` 的参数。

```kotlin
@Resource("/articles")
class Articles() {
    @Resource("{id}")
    class Id(val parent: Articles = Articles(), val id: Long)
}
```

例如，此资源可用于响应 `/articles/12`。

### 示例：用于 CRUD 操作的资源 {id="example_crud"}

以下示例为 CRUD 操作创建了 `Articles` 资源：

```kotlin
@Resource("/articles")
class Articles() {
    @Resource("new")
    class New(val parent: Articles = Articles())

    @Resource("{id}")
    class Id(val parent: Articles = Articles(), val id: Long) {
        @Resource("edit")
        class Edit(val parent: Id)
    }
}
```

该资源可用于列出所有文章、发布新文章以及编辑现有文章。

下一节将展示如何使用此资源[发出类型安全请求](#make_requests)。

> 完整示例请参阅 [client-type-safe-requests](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-type-safe-requests)。
>
{style="tip"}

## 发送类型安全请求 {id="make_requests"}

要向类型化资源[发送请求](client-requests.md)，请将资源类的实例传递给请求函数，例如 `request()`、`get()`、`post()` 或 `put()`。

以下示例向 `/articles` 路径发送请求：

```kotlin
@Resource("/articles")
class Articles()

fun main() {
    runBlocking {
        val client = HttpClient(CIO) {
            install(Resources)
            // ...
        }
        val getAllArticles = client.get(Articles())
    }
}
```

以下示例向在[示例：用于 CRUD 操作的资源](#example_crud)中创建的 `Articles` 资源发送类型化请求。

```kotlin
fun main() {
    defaultServer(Application::module).start()
    runBlocking {
        val client = HttpClient(CIO) {
            install(Resources)
            defaultRequest {
                host = "0.0.0.0"
                port = 8080
                url { protocol = URLProtocol.HTTP }
            }
        }

        val getAllArticles = client.get(Articles())
        val newArticle = client.get(Articles.New())
        val postArticle = client.post(Articles()) { setBody("Article content") }
        val getArticle = client.get(Articles.Id(id = 12))
        val editArticlePage = client.get(Articles.Id.Edit(Articles.Id(id = 12)))
        val putArticle = client.put(Articles.Id(id = 12)) { setBody("New article content") }
        val deleteArticle = client.delete(Articles.Id(id = 12))
}
```

[`defaultRequest()`](client-default-request.md) 函数用于为所有请求指定默认 URL。

> 在开发客户端插件或监测工具时，可以通过 `RESOURCE` 请求属性访问用于类型安全请求的资源实例：
>  ```kotlin
>  onRequest { call, _ ->
>    val resource = call.attributes.getOrNull(RESOURCE)
>  }
>  ```
> 
{style="tip"}

> 完整示例请参阅 [client-type-safe-requests](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-type-safe-requests)。
>
{style="tip"}