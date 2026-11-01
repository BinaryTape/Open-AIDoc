[//]: # (title: HTML DSL)

<var name="artifact_name" value="ktor-server-html-builder"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.htmlBuilder"/>
<tldr>
<p>
<b>必要相依性</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="html"/>
<p>
    <b>程式碼範例</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支援 Kotlin/Native，可讓您在無需額外執行階段或虛擬機的情況下執行伺服器。">Native 伺服器</Links>支援</b>: ✅
</p>
</tldr>

HTML DSL 將 [kotlinx.html](https://github.com/Kotlin/kotlinx.html) 程式庫整合到 Ktor 中，可讓您以 HTML 區塊回應給用戶端。透過 HTML DSL，您可以使用 Kotlin 編寫純 HTML、將變數插入檢視中，甚至使用範本建置複雜的 HTML 版面配置。

## 新增相依性 {id="add_dependencies"}
HTML DSL 不需要[安裝](server-plugins.md#install)，但需要 `%artifact_name%` 構件。您可以按如下方式將其包含在組建指令碼中：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄</a>來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄</a>來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>
  

## 在回應中傳送 HTML {id="html_response"}
若要傳送 HTML 回應，請在所需的[路由](server-routing.md)中呼叫 [respondHtml](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/respond-html.html) 方法。
以下範例示範了 HTML DSL 範例以及傳送給用戶端的對應 HTML：

<Tabs>
<TabItem title="Kotlin">

```kotlin
import io.ktor.server.application.*
import io.ktor.server.html.*
import io.ktor.http.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.utils.io.*
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

以下範例示範如何回應一個用於收集使用者[憑據資訊](server-form-based-auth.md)的 HTML 表單：

<Tabs>
<TabItem title="Kotlin">

```kotlin
get("/login") {
    call.respondHtml {
        body {
            val urlEncoded = FormEncType
                .applicationXWwwFormUrlEncoded
            form(
                action = "/login",
                encType = urlEncoded,
                method = FormMethod.post
            ) {
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

如需完整範例，請參閱 [auth-form-html-dsl](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-html-dsl)。

> 若要進一步了解在伺服器端接收表單參數，請參閱[表單參數](server-requests.md#form_parameters)。
> 
> 若要進一步了解使用 kotlinx.html 產生 HTML，請參閱 [kotlinx.html wiki](https://github.com/Kotlin/kotlinx.html/wiki)。

## 傳送部分 HTML {id="html_fragments"}

除了產生完整的 HTML 文件之外，您還可以使用 `.respondHtmlPartial()` 函式回應 HTML 片段。

當傳回不需要完整 `<html>` 文件的部分標記時，HTML 片段非常有用，例如 HTMX 等程式庫所使用的動態更新。

<Tabs>
<TabItem title="Kotlin">

```kotlin
import io.ktor.server.application.*
import io.ktor.server.html.*
import io.ktor.http.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.utils.io.*
import kotlinx.html.*

fun Application.module() {
    routing {
        get("/fragment") {
            call.respondHtmlPartial(HttpStatusCode.Created) {
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

此函式的作用與 `.respondHtml()` 類似，但它只會呈現您在建置器中定義的內容，而不會加入根 HTML 元素。

## 範本 {id="templates"}

除了產生純 HTML 之外，Ktor 還提供了一個可用於建構複雜版面配置的範本引擎。您可以為 HTML 頁面的不同部分建立範本階層結構，例如整個頁面的根範本、頁首與頁尾的子範本等等。Ktor 公開了以下用於處理範本的 API：

1. 若要以根據指定範本建構的 HTML 進行回應，請呼叫 [respondHtmlTemplate](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/respond-html-template.html) 方法。
2. 若要建立範本，您需要實作 [Template](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/-template/index.html) 介面並覆寫提供 HTML 的 `Template.apply` 方法。
3. 在建立的範本類別內，您可以為不同的內容型別定義占位符號：
    * [Placeholder](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/-placeholder/index.html) 用於插入內容。[PlaceholderList](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/-placeholder-list/index.html) 可用於插入多次出現的內容（例如清單項目）。
    * [TemplatePlaceholder](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/-template-placeholder/index.html) 可用於插入子範本並建立巢狀版面配置。
    

### 範例 {id="example"}
讓我們透過[範例](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/html-templates)來看看如何使用範本建立階層式版面配置。假設我們有以下 HTML：
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
我們可以將此頁面的版面配置分為兩個部分：
* 用於頁首的根版面配置範本以及用於文章的子範本。
* 用於文章內容的子範本。

讓我們逐步實作這些版面配置：
  
1. 呼叫 `respondHtmlTemplate` 方法並傳入一個範本類別作為參數。在我們的例子中，這是應實作 `Template` 介面的 `LayoutTemplate` 類別：
   ```kotlin
   get("/") {
       call.respondHtmlTemplate(LayoutTemplate()) {
           // ...
       }
   }
   ```
   在該區塊內，我們將能夠存取範本並指定其屬性值。這些值將替換範本類別中指定的占位符號。我們將在下一步中建立 `LayoutTemplate` 並定義其屬性。
  
2. 根版面配置範本將如下所示：
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

   該類別公開了兩個屬性：
   * `header` 屬性指定插入到 `h1` 標籤內的內容。
   * `content` 屬性指定文章內容的子範本。

3. 子範本將如下所示：
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

   此範本公開了 `articleTitle`、`articleText` 和 `list` 屬性，它們的值將插入到 `article` 內。

4. 若要提供值清單作為範本，請建立以下新類別： 
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

   此範本使用 `PlaceholderList` 類別從提供的項目中產生無序清單 (`UL`)。
   它還將第一個項目包裹在 `<b>` 元素中以示強調。

5. 現在我們準備好傳送使用指定屬性值建構的 HTML：
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

您可以在此處找到完整範例：[html-templates](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/html-templates)。