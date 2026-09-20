[//]: # (title: 类型安全请求)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<var name="plugin_name" value="Resources"/>
<var name="artifact_name" value="ktor-client-resources"/>

<tldr>
<p>
<b>必需依赖项</b>：<code>io.ktor:%artifact_name%</code>
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

Ktor 提供了 `%plugin_name%` 插件，用于发出类型安全[客户端请求](client-requests.md)。
为此，您需要定义表示服务器端点的类，并使用 `@Resource` 关键字为其添加注解。

资源类使用 `kotlinx.serialization` 将其属性转换为路径参数和查询参数。

> 在服务器端，Ktor 提供了[类型安全路由](server-resources.md)。
>
{style="tip"}

## 添加依赖项 {id="add_dependencies"}

### 添加 kotlinx.serialization {id="add_serialization"}

`Resources` 插件依赖于 `kotlinx.serialization`。请按照 [`kotlinx.serialization` 设置指南](https://github.com/Kotlin/kotlinx.serialization#setup) 中的说明启用 Kotlin 序列化插件。

### 添加 %plugin_name% 依赖项 {id="add_plugin_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，请在构建脚本中添加 <code>%artifact_name%</code> 工件：
</p>
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
<tip>
    要详细了解 Ktor 客户端所需的工件，请参阅 <Links href="/ktor/client-dependencies" summary="了解如何向现有项目添加客户端依赖项。">添加客户端依赖项</Links>。
</tip>

## 安装 %plugin_name% {id="install_plugin"}

要安装 `%plugin_name%` 插件，请将其传递给[客户端配置块](client-create-and-configure.md#configure-client)内部的 `install` 函数：

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

每个资源类都应具有 `@Resource` 注解。
下面，我们将查看几个资源类的示例——定义单个路径段、查询参数和路径参数等。

### 资源 URL {id="resource_url"}

下面的示例演示了如何定义 `Articles` 类，该类指定了响应 `/articles` 路径的资源。

```kotlin
import io.ktor.resources.*

@Resource("/articles")
class Articles()
```

### 带有查询参数的资源 {id="resource_query_param"}

下面的 `Articles` 类具有 `sort` 字符串属性，该属性用作[查询参数](server-requests.md#query_parameters)，并允许您定义响应以下带有 `sort` 查询参数路径的资源：`/articles?sort=new`。

```kotlin
@Resource("/articles")
class Articles(val sort: String? = "new")
```

### 带有嵌套类的资源 {id="resource_nested"}

您可以嵌套类来创建包含多个路径段的资源。请注意，在这种情况下，嵌套类应该具有外层类类型的属性。
下面的示例演示了响应 `/articles/new` 路径的资源。

```kotlin
@Resource("/articles")
class Articles() {
    @Resource("new")
    class New(val parent: Articles = Articles())
}
```

### 带有路径参数的资源 {id="resource_path_param"}

下面的示例演示了如何添加[嵌套](#resource_nested)的 `{id}` 整数[路径参数](server-routing.md#path_parameter)，该参数匹配路径段并将其捕获为名为 `id` 的参数。

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

此资源可用于列出所有文章、发布新文章以及编辑现有文章。

下一节将展示如何使用此资源[发出类型安全请求](#make_requests)。

> 完整示例请参阅 [client-type-safe-requests](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-type-safe-requests)。
>
{style="tip"}

## 发出类型安全请求 {id="make_requests"}

要向类型化资源[发出请求](client-requests.md)，请将资源类实例传递给请求函数，例如 `request()`、`get()`、`post()` 或 `put()`。

下面的示例向 `/articles` 路径发出请求：

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

下面的示例向在[示例：用于 CRUD 操作的资源](#example_crud)中创建的 `Articles` 资源发出类型化请求。

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

> 在开发客户端插件或进行插桩时，您可以通过 `RESOURCE` 请求属性访问用于类型安全请求的资源实例：
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