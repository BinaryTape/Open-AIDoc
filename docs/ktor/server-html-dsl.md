[//]: # (title: HTML DSL)

<var name="artifact_name" value="ktor-server-html-builder"/>
<tldr>
<p>
<b>所需依赖项</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="html"/>
<p>
    <b>代码示例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">原生服务器</Links>支持</b>: ✅
</p>
</tldr>

HTML DSL 将 [kotlinx.html](https://github.com/Kotlin/kotlinx.html) 库集成到 Ktor 中，并允许您向客户端响应 HTML 块。通过 HTML DSL，您可以使用 Kotlin 编写纯 HTML，将变量插入视图，甚至可以使用模板构建复杂的 HTML 布局。

## 添加依赖项 {id="add_dependencies"}
HTML DSL 不需要[安装](server-plugins.md#install)，但需要 `%artifact_name%` 构件。您可以按照以下方式将其包含在构建脚本中：

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
  

## 发送 HTML 响应 {id="html_response"}
要发送 HTML 响应，请在所需的[路由](server-routing.md)中调用 [respondHtml](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/respond-html.html) 方法。
下面的示例展示了一个 HTML DSL 示例以及发送给客户端的对应 HTML：

<Tabs>
<TabItem title="Kotlin">

```kotlin
import io.ktor.server.application.*
import io.ktor.server.html.*
import io.ktor.http.*
import io.ktor.server.routing.*
import kotlinx.html.*

fun Application.module() {
    routing {
        get("/") {
            val name = "Ktor"
            call.respondHtml(HttpStatusCode.OK) {
                head {
                    title {
                        +name
                    }
                }
                body {
                    h1 {
                        +"Hello from $name!"
                    }
                }
            }
        }
    }
}
```

</TabItem>
<TabItem title="HTML">

```html
<html>
<head>
    <title>Ktor</title>
</head>
<body>
<h1>Hello from Ktor!</h1>
</body>
</html>
```

</TabItem>
</Tabs>

以下示例展示了如何响应用于从用户收集[凭据信息](server-form-based-auth.md)的 HTML 表单：

<Tabs>
<TabItem title="Kotlin">

```kotlin
get("/login") {
    call.respondHtml {
        body {
            form(action = "/login", encType = FormEncType.applicationXWwwFormUrlEncoded, method = FormMethod.post) {
                p {
                    +"Username:"
                    textInput(name = "username")
                }
                p {
                    +"Password:"
                    passwordInput(name = "password")
                }
                p {
                    submitInput() { value = "Login" }
                }
            }
        }
    }
}
```

</TabItem>
<TabItem title="HTML">

```html
<html>
<body>
<form action="/login" enctype="application/x-www-form-urlencoded" method="post">
    <p>Username:<input type="text" name="username"></p>
    <p>Password:<input type="password" name="password"></p>
    <p><input type="submit" value="Login"></p>
</form>
</body>
</html>
```

</TabItem>
</Tabs>

有关完整示例，请参阅 [auth-form-html-dsl](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-html-dsl)。

> 要了解更多关于在服务器端接收表单参数的信息，请参阅[表单参数](server-requests.md#form_parameters)。
> 
> 要了解更多关于使用 kotlinx.html 生成 HTML 的信息，请参阅 [kotlinx.html wiki](https://github.com/Kotlin/kotlinx.html/wiki)。

## 发送部分 HTML {id="html_fragments"}

除了生成完整的 HTML 文档外，您还可以使用 `.respondHtmlFragment()` 函数响应 HTML 代码片段。

当返回不需要完整 `<html>` 文档的部分标记（例如 HTMX 等库使用的动态更新）时，HTML 代码片段非常有用。

<Tabs>
<TabItem title="Kotlin">

```kotlin
import io.ktor.server.application.*
import io.ktor.server.html.*
import io.ktor.http.*
import io.ktor.server.routing.*
import kotlinx.html.*

fun Application.module() {
    routing {
        get("/fragment") {
            call.respondHtmlFragment(HttpStatusCode.Created) {
                div("fragment") {
                    span { +"Created!" }
                }
            }
        }
    }
}
```

</TabItem>
<TabItem title="HTML">

```html
<div class="fragment">
    <span>
        Created!
    </span>
</div>

```

</TabItem>
</Tabs>

该函数的工作方式与 `.respondHtml()` 类似，但它仅渲染您在构建器中定义的内容，而不会添加根 HTML 元素。

## 模板 {id="templates"}

除了生成纯 HTML 之外，Ktor 还提供了一个可用于构建复杂布局的模板引擎。您可以为 HTML 页面的不同部分创建模板层次结构，例如，整个页面的根模板、页眉和页脚的子模板等。Ktor 公开了以下用于处理模板的 API：

1. 要向客户端响应基于指定模板构建的 HTML，请调用 [respondHtmlTemplate](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/respond-html-template.html) 方法。
2. 要创建模板，您需要实现 [Template](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/-template/index.html) 接口并重写提供 HTML 的 `Template.apply` 方法。
3. 在创建的模板类中，您可以为不同的内容类型定义占位符：
    * [Placeholder](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/-placeholder/index.html) 用于插入内容。[PlaceholderList](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/-placeholder-list/index.html) 可用于插入多次出现的内容（例如列表项）。
    * [TemplatePlaceholder](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/-template-placeholder/index.html) 可用于插入子模板并创建嵌套布局。
    

### 示例 {id="example"}
让我们通过[示例](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/html-templates)来看看如何使用模板创建分层布局。假设我们有以下 HTML：
```html
<body>
<h1>Ktor</h1>
<article>
    <h2>Hello from Ktor!</h2>
    <p>Kotlin Framework for creating connected systems.</p>
    <ul>
       <li><b>One</b></li>
       <li>Two</li>
    </ul>
</article>
</body>
```
我们可以将此页面的布局分为两个部分：
* 用于页眉的根布局模板和用于文章的子模板。
* 用于文章内容的子模板。

让我们逐步实现这些布局：
  
1. 调用 `respondHtmlTemplate` 方法并将模板类作为参数传递。在我们的示例中，这就是应该实现 `Template` 接口的 `LayoutTemplate` 类：
   ```kotlin
   get("/") {
       call.respondHtmlTemplate(LayoutTemplate()) {
           // ...
       }
   }
   ```
   在该块内部，我们将能够访问模板并指定其属性值。这些值将替换模板类中指定的占位符。我们将在下一步中创建 `LayoutTemplate` 并定义其属性。
  
2. 根布局模板如下所示：
   ```kotlin
   class LayoutTemplate: Template<HTML> {
       val header = Placeholder<FlowContent>()
       val content = TemplatePlaceholder<ArticleTemplate>()
       override fun HTML.apply() {
           body {
               h1 {
                   insert(header)
               }
               insert(ArticleTemplate(), content)
           }
       }
   }
   ```

   该类公开了两个属性：
   * `header` 属性指定在 `h1` 标记内插入的内容。
   * `content` 属性指定文章内容的子模板。

3. 子模板如下所示：
   ```kotlin
   class ArticleTemplate : Template<FlowContent> {
       val articleTitle = Placeholder<FlowContent>()
       val articleText = Placeholder<FlowContent>()
       val list = TemplatePlaceholder<ListTemplate>()
       override fun FlowContent.apply() {
           article {
               h2 {
                   insert(articleTitle)
               }
               p {
                   insert(articleText)
               }
               insert(ListTemplate(), list)
           }
       }
   }
   ```

   此模板公开了 `articleTitle`、`articleText` 和 `list` 属性，它们的值将被插入到 `article` 内部。

4. 要提供值列表作为模板，请创建以下新类： 
   ```kotlin
   class ListTemplate : Template<FlowContent> {
       val item = PlaceholderList<UL, FlowContent>()
       override fun FlowContent.apply() {
           if (!item.isEmpty()) {
               ul {
                   each(item) {
                       li {
                           if (it.first) {
                               b {
                                   insert(it)
                               }
                           } else {
                               insert(it)
                           }
                       }
                   }
               }
           }
       }
   }
   ```

   此模板使用 `PlaceholderList` 类从提供的项生成无序列表 (`UL`)。
   它还将第一项包装在 `<b>` 元素中以进行强调。

5. 现在我们准备发送使用指定属性值构建的 HTML：
   ```kotlin
   get("/") {
       call.respondHtmlTemplate(LayoutTemplate()) {
           header {
               +"Ktor"
           }
           content {
               articleTitle {
                   +"Hello from Ktor!"
               }
               articleText {
                   +"Kotlin Framework for creating connected systems."
               }
               list {
                   item { +"One" }
                   item { +"Two" }
               }
           }
       }
   }
   ```

您可以在此处找到完整示例：[html-templates](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/html-templates)。