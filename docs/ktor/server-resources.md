[//]: # (title: 类型安全路由)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Resources"/>
<var name="package_name" value="io.ktor.server.resources"/>
<var name="artifact_name" value="ktor-server-resources"/>

<tldr>
<p>
<b>所需依赖项</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="resource-routing"/>
<p>
    <b>代码示例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支持 Kotlin/Native，允许您在没有额外运行时或虚拟机的情况下运行服务器。">原生服务器</Links>支持</b>: ✅
</p>
</tldr>

<link-summary>Resources 插件允许您实现类型安全路由。</link-summary>

Ktor 提供了 [Resources](https://api.ktor.io/ktor-resources/io.ktor.resources/-resources/index.html) 插件，允许您实现类型安全[路由](server-routing.md)。为此，您需要创建一个作为类型化路由的类，然后使用 `@Resource` 关键字为该类添加注解。请注意，`@Resource` 注解具有由 kotlinx.serialization 库提供的 `@Serializable` 行为。

> Ktor 客户端提供了向服务器发起[类型化请求](client-resources.md)的能力。

## 添加依赖项 {id="add_dependencies"}

### 添加 kotlinx.serialization {id="add_serialization"}

鉴于[资源类](#resource_classes)应具有 `@Serializable` 行为，您需要按照 [设置 (Setup)](https://github.com/Kotlin/kotlinx.serialization#setup) 部分的说明添加 Kotlin 序列化插件。

### 添加 %plugin_name% 依赖项 {id="add_plugin_dependencies"}

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
    要将 <code>%plugin_name%</code> 插件<a href="#install">安装</a>到应用程序，请在指定的<Links href="/ktor/server-modules" summary="模块允许您通过对路由进行分组来构建应用程序结构。">模块</Links>中将其传递给 <code>install</code> 函数。
    下面的代码片段显示了如何安装 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函数调用内部。
    </li>
    <li>
        ... 在显式定义的 <code>module</code> 内部，该模块是 <code>Application</code> 类的扩展函数。
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

## 创建资源类 {id="resource_classes"}

<snippet id="resource_classes_server">

每个资源类都应带有 `@Resource` 注解。
下面，我们将查看几个资源类示例 —— 定义单个路径段、查询参数和路径参数等等。

### 资源 URL {id="resource_url"}

下面的示例显示了如何定义 `Articles` 类，该类指定了响应 `/articles` 路径的资源。

```kotlin
import io.ktor.resources.*

@Resource("/articles")
class Articles()
```

### 带查询参数的资源 {id="resource_query_param"}

下面的 `Articles` 类具有 `sort` 字符串属性，该属性充当[查询参数](server-requests.md#query_parameters)，并允许您定义一个响应带有 `sort` 查询参数的路径的资源：`/articles?sort=new`。

```kotlin
@Resource("/articles")
class Articles(val sort: String? = "new")
```

### 带嵌套类的资源 {id="resource_nested"}

您可以嵌套类以创建包含多个路径段的资源。请注意，在这种情况下，嵌套类应该具有一个外层类类型的属性。
下面的示例显示了一个响应 `/articles/new` 路径的资源。

```kotlin
@Resource("/articles")
class Articles() {
    @Resource("new")
    class New(val parent: Articles = Articles())
}
```

### 带路径参数的资源 {id="resource_path_param"}

下面的示例演示了如何添加[嵌套](#resource_nested)的 `{id}` 整数[路径参数](server-routing.md#path_parameter)，它匹配一个路径段并将其捕获为名为 `id` 的参数。

```kotlin
@Resource("/articles")
class Articles() {
    @Resource("{id}")
    class Id(val parent: Articles = Articles(), val id: Long)
}
```

例如，此资源可用于响应 `/articles/12`。

</snippet>

### 示例：用于 CRUD 操作的资源 {id="example_crud"}

让我们总结上面的示例，并为 CRUD 操作创建 `Articles` 资源。

```kotlin
@Resource("/articles")
class Articles(val sort: String? = "new") {
    @Resource("new")
    class New(val parent: Articles = Articles())

    @Resource("{id}")
    class Id(val parent: Articles = Articles(), val id: Long) {
        @Resource("edit")
        class Edit(val parent: Id)
    }
}
```

此资源可用于列出所有文章、发布新文章、编辑文章等。我们将在下一章中看到如何为此资源[定义路由处理程序](#define_route)。

> 您可以在此处找到完整示例：[resource-routing](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/resource-routing)。

## 定义路由处理程序 {id="define_route"}

要为类型化资源[定义路由处理程序](server-routing.md#define_route)，您需要将资源类传递给动词函数（`get`、`post`、`put` 等）。
例如，下面的路由处理程序响应 `/articles` 路径。

```kotlin
@Resource("/articles")
class Articles()

fun Application.module() {
    install(Resources)
    routing {
        get<Articles> { articles ->
            // 获取所有文章 ...
            call.respondText("List of articles: $articles")
        }
    }
}
```

下面的示例展示了如何为[示例：用于 CRUD 操作的资源](#example_crud)中创建的 `Articles` 资源定义路由处理程序。请注意，在路由处理程序内部，您可以将 `Article` 作为参数访问并获取其属性值。

```kotlin
fun Application.module() {
    install(Resources)
    routing {
        get<Articles> { article ->
            // 获取所有文章 ...
            call.respondText("List of articles sorted starting from ${article.sort}")
        }
        get<Articles.New> {
            // 显示带有创建新文章字段的页面 ...
            call.respondText("Create a new article")
        }
        post<Articles> {
            // 保存文章 ...
            call.respondText("An article is saved", status = HttpStatusCode.Created)
        }
        get<Articles.Id> { article ->
            // 显示 ID 为 ${article.id} 的文章 ...
            call.respondText("An article with id ${article.id}", status = HttpStatusCode.OK)
        }
        get<Articles.Id.Edit> { article ->
            // 显示带有编辑文章字段的页面 ...
            call.respondText("Edit an article with id ${article.parent.id}", status = HttpStatusCode.OK)
        }
        put<Articles.Id> { article ->
            // 更新文章 ...
            call.respondText("An article with id ${article.id} updated", status = HttpStatusCode.OK)
        }
        delete<Articles.Id> { article ->
            // 删除文章 ...
            call.respondText("An article with id ${article.id} deleted", status = HttpStatusCode.OK)
        }
    }
}
```

以下是处理每个端点请求的一些提示：

- `get<Articles>`

   此路由处理程序应该根据 `sort` 查询参数返回所有文章。
   例如，这可能是一个包含所有文章的 [HTML 页面](server-responses.md#html)或 [JSON 对象](server-responses.md#object)。

- `get<Articles.New>`

   此端点响应一个包含创建新文章字段的[表单](server-responses.md#html)。
- `post<Articles>`

   `post<Articles>` 端点应该接收使用表单发送的[参数](server-requests.md#form_parameters)。
   Ktor 还允许您使用 `ContentNegotiation` 插件将 JSON 数据作为[对象](server-requests.md#objects)接收。
- `get<Articles.Id>`

   此路由处理程序应该返回具有指定标识符的文章。
   这可能是一个显示文章的 [HTML 页面](server-responses.md#html)或带有文章数据的 [JSON 对象](server-responses.md#object)。
- `get<Articles.Id.Edit>`

  此端点响应一个包含编辑现有文章字段的[表单](server-responses.md#html)。
- `put<Articles.Id>`

   与 `post<Articles>` 端点类似，`put` 处理程序接收使用表单发送的[表单参数](server-requests.md#form_parameters)。
- `delete<Articles.Id>`

   此路由处理程序删除具有指定标识符的文章。

您可以在此处找到完整示例：[resource-routing](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/resource-routing)。

## 从资源构建链接 {id="resource_links"}

除了将资源定义用于路由外，它们还可用于构建链接。
这有时被称为*反向路由*。
如果您需要将这些链接添加到使用 [HTML DSL](server-html-dsl.md) 创建的 HTML 文档中，或者如果您需要生成[重定向响应](server-responses.md#redirect)，那么从资源构建链接可能会很有帮助。

`Resources` 插件使用重载的 [href](https://api.ktor.io/ktor-server-resources/io.ktor.server.resources/href.html) 方法扩展了 `Application`，该方法允许您从 `Resource` 生成链接。例如，下面的代码片段为[上面定义](#example_crud)的 `Edit` 资源创建了一个链接：

```kotlin
val link: String = href(Articles.Id.Edit(Articles.Id(id = 123)))
```

由于祖父级 `Articles` 资源定义了默认值为 `new` 的 `sort` 查询参数，因此 `link` 变量包含：

```
/articles/123/edit?sort=new
```

要生成指定主机和协议的 URL，您可以为 `href` 方法提供 `URLBuilder`。
也可以使用 `URLBuilder` 指定额外的查询参数，如本例所示：

```kotlin
val urlBuilder = URLBuilder(URLProtocol.HTTPS, "ktor.io", parameters = parametersOf("token", "123"))
href(Articles(sort = null), urlBuilder)
val link: String = urlBuilder.buildString()
```

随后 `link` 变量包含：

```
https://ktor.io/articles?token=123
```

### 示例 {id="example_build_links"}

下面的示例显示了如何将从资源构建的链接添加到 HTML 响应中：

```kotlin
get {
    call.respondHtml {
        body {
            this@module.apply {
                p {
                    val link: String = href(Articles())
                    a(link) { +"Get all articles" }
                }
                p {
                    val link: String = href(Articles.New())
                    a(link) { +"Create a new article" }
                }
                p {
                    val link: String = href(Articles.Id.Edit(Articles.Id(id = 123)))
                    a(link) { +"Edit an exising article" }
                }
                p {
                    val urlBuilder = URLBuilder(URLProtocol.HTTPS, "ktor.io", parameters = parametersOf("token", "123"))
                    href(Articles(sort = null), urlBuilder)
                    val link: String = urlBuilder.buildString()
                    i { a(link) { +link } }
                }
            }
        }
    }
}
```

您可以在此处找到完整示例：[resource-routing](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/resource-routing)。