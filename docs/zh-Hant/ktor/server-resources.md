[//]: # (title: 型別安全路由)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Resources"/>
<var name="package_name" value="io.ktor.server.resources"/>
<var name="artifact_name" value="ktor-server-resources"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="resource-routing"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支援 Kotlin/Native，可讓您在不使用額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器</Links> 支援</b>：✅
</p>
</tldr>

<link-summary>Resources 外掛程式可讓您實作型別安全路由。</link-summary>

Ktor 提供了 [Resources](https://api.ktor.io/ktor-resources/io.ktor.resources/-resources/index.html) 外掛程式，可讓您實作型別安全 [路由](server-routing.md)。要實現此功能，您需要建立一個作為型別化路由的類別，然後使用 `@Resource` 關鍵字為該類別加上註解。請注意，`@Resource` 註解具有由 kotlinx.serialization 函式庫提供的 `@Serializable` 行為。

> Ktor 用戶端提供了向伺服器發送 [型別化請求](client-resources.md) 的能力。

## 新增相依性 {id="add_dependencies"}

### 新增 kotlinx.serialization {id="add_serialization"}

鑑於 [資源類別](#resource_classes) 應具有 `@Serializable` 行為，您需要按照 [Setup](https://github.com/Kotlin/kotlinx.serialization#setup) 章節所述新增 Kotlin serialization 外掛程式。

### 新增 %plugin_name% 相依性 {id="add_plugin_dependencies"}

<p>
    要使用 <code>%plugin_name%</code>，您需要在建置指令碼中包含 <code>%artifact_name%</code> 構件：
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

## 安裝 %plugin_name% {id="install_plugin"}

<p>
    要將 <code>%plugin_name%</code> 外掛程式安裝至應用程式，請將其傳遞給指定 <Links href="/ktor/server-modules" summary="模組可讓您透過分組路由來組織應用程式結構。">模組</Links> 中的 <code>install</code> 函式。
    下方的程式碼片段顯示如何安裝 <code>%plugin_name%</code> ...
</p>
<list>
    <li>
        ... 在 <code>embeddedServer</code> 函式呼叫中。
    </li>
    <li>
        ... 在明確定義的 <code>module</code> 中，該模組是 <code>Application</code> 類別的擴充函式。
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

## 建立資源類別 {id="resource_classes"}

<snippet id="resource_classes_server">

每個資源類別都應具有 `@Resource` 註解。
下面，我們將查看幾個資源類別的範例 —— 定義單一路徑片段、查詢和路徑參數等。

### 資源 URL {id="resource_url"}

下方的範例顯示如何定義 `Articles` 類別，該類別指定一個在 `/articles` 路徑上回應的資源。

```kotlin
import io.ktor.resources.*

@Resource("/articles")
class Articles()
```

### 具有查詢參數的資源 {id="resource_query_param"}

下方的 `Articles` 類別具有 `sort` 字串屬性，其作為 [查詢參數](server-requests.md#query_parameters) 並允許您定義一個在具有 `sort` 查詢參數的以下路徑上回應的資源：`/articles?sort=new`。

```kotlin
@Resource("/articles")
class Articles(val sort: String? = "new")
```

### 具有巢狀類別的資源 {id="resource_nested"}

您可以巢狀類別以建立包含多個路徑片段的資源。請注意，在這種情況下，巢狀類別應具有一個外部類別型別的屬性。
下方的範例顯示一個在 `/articles/new` 路徑上回應的資源。

```kotlin
@Resource("/articles")
class Articles() {
    @Resource("new")
    class New(val parent: Articles = Articles())
}
```

### 具有路徑參數的資源 {id="resource_path_param"}

下方的範例示範如何新增 [巢狀](#resource_nested) 的 `{id}` 整數 [路徑參數](server-routing.md#path_parameter)，該參數會配對路徑片段並將其擷取為名為 `id` 的參數。

```kotlin
@Resource("/articles")
class Articles() {
    @Resource("{id}")
    class Id(val parent: Articles = Articles(), val id: Long)
}
```

舉例來說，此資源可用於在 `/articles/12` 上進行回應。

</snippet>

### 範例：用於 CRUD 操作的資源 {id="example_crud"}

讓我們總結上述範例，並為 CRUD 操作建立 `Articles` 資源。

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

此資源可用於列出所有文章、發布新文章、編輯文章等。我們將在下一章中了解如何為此資源 [定義路由處理常式](#define_route) 。

> 您可以在此處找到完整範例：[resource-routing](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/resource-routing)。

## 定義路由處理常式 {id="define_route"}

要為型別化資源 [定義路由處理常式](server-routing.md#define_route)，您需要將資源類別傳遞給動詞函式（`get`、`post`、`put` 等）。
例如，下方的路由處理常式在 `/articles` 路徑上回應。

```kotlin
@Resource("/articles")
class Articles()

fun Application.module() {
    install(Resources)
    routing {
        get<Articles> { articles ->
            // 取得所有文章 ...
            call.respondText("文章列表：$articles")
        }
    }
}
```

下方的範例顯示如何為在 [範例：用於 CRUD 操作的資源](#example_crud) 中建立的 `Articles` 資源定義路由處理常式。請注意，在路由處理常式內部，您可以將 `Article` 作為參數存取並取得其屬性值。

```kotlin
fun Application.module() {
    install(Resources)
    routing {
        get<Articles> { article ->
            // 取得所有文章 ...
            call.respondText("文章列表，排序方式：${article.sort}")
        }
        get<Articles.New> {
            // 顯示具有用於建立新文章之欄位的頁面 ...
            call.respondText("建立新文章")
        }
        post<Articles> {
            // 儲存文章 ...
            call.respondText("文章已儲存", status = HttpStatusCode.Created)
        }
        get<Articles.Id> { article ->
            // 顯示 ID 為 ${article.id} 的文章 ...
            call.respondText("ID 為 ${article.id} 的文章", status = HttpStatusCode.OK)
        }
        get<Articles.Id.Edit> { article ->
            // 顯示具有用於編輯文章之欄位的頁面 ...
            call.respondText("編輯 ID 為 ${article.parent.id} 的文章", status = HttpStatusCode.OK)
        }
        put<Articles.Id> { article ->
            // 更新文章 ...
            call.respondText("ID 為 ${article.id} 的文章已更新", status = HttpStatusCode.OK)
        }
        delete<Articles.Id> { article ->
            // 刪除文章 ...
            call.respondText("ID 為 ${article.id} 的文章已刪除", status = HttpStatusCode.OK)
        }
    }
}
```

以下是處理每個端點請求的一些提示：

- `get<Articles>`

   此路由處理常式應該根據 `sort` 查詢參數回傳所有文章。
   例如，這可能是包含所有文章的 [HTML 頁面](server-responses.md#html) 或 [JSON 物件](server-responses.md#object)。

- `get<Articles.New>`

   此端點會回應包含用於建立新文章之欄位的 [Web 表單](server-responses.md#html)。
- `post<Articles>`

   `post<Articles>` 端點應該接收使用 Web 表單傳送的 [參數](server-requests.md#form_parameters)。
   Ktor 還允許您使用 `ContentNegotiation` 外掛程式將 JSON 資料接收為 [物件](server-requests.md#objects)。
- `get<Articles.Id>`

   此路由處理常式應該回傳具有指定識別碼的文章。
   這可能是顯示文章的 [HTML 頁面](server-responses.md#html) 或包含文章資料的 [JSON 物件](server-responses.md#object)。
- `get<Articles.Id.Edit>`

  此端點會回應包含用於編輯現有文章之欄位的 [Web 表單](server-responses.md#html)。
- `put<Articles.Id>`

   與 `post<Articles>` 端點類似，`put` 處理常式接收使用 Web 表單傳送的 [表單參數](server-requests.md#form_parameters)。
- `delete<Articles.Id>`

   此路由處理常式會刪除具有指定識別碼的文章。

您可以在此處找到完整範例：[resource-routing](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/resource-routing)。

## 從資源建立連結 {id="resource_links"}

除了將資源定義用於路由之外，它們還可以用於建立連結。
這有時被稱為 *反向路由*（reverse routing）。
如果您需要將這些連結新增至使用 [HTML DSL](server-html-dsl.md) 建立的 HTML 文件，或者需要產生 [重新導向回應](server-responses.md#redirect)，則從資源建立連結可能會很有幫助。

`Resources` 外掛程式使用多載的 [href](https://api.ktor.io/ktor-server-resources/io.ktor.server.resources/href.html) 方法擴充了 `Application`，該方法可讓您從 `Resource` 產生連結。例如，下方的程式碼片段會為 [上述定義](#example_crud) 的 `Edit` 資源建立連結：

```kotlin
val link: String = href(Articles.Id.Edit(Articles.Id(id = 123)))
```

由於祖父級 `Articles` 資源定義了具有預設值 `new` 的 `sort` 查詢參數，因此 `link` 變數包含：

```
/articles/123/edit?sort=new
```

要產生指定主機和協定的 URL，您可以為 `href` 方法提供 `URLBuilder`。
還可以使用 `URLBuilder` 指定額外的查詢參數，如本範例所示：

```kotlin
val urlBuilder = URLBuilder(URLProtocol.HTTPS, "ktor.io", parameters = parametersOf("token", "123"))
href(Articles(sort = null), urlBuilder)
val link: String = urlBuilder.buildString()
```

隨後 `link` 變數包含：

```
https://ktor.io/articles?token=123
```

### 範例 {id="example_build_links"}

下方的範例顯示如何將從資源建立的連結新增至 HTML 回應中：

```kotlin
get {
    call.respondHtml {
        body {
            this@module.apply {
                p {
                    val link: String = href(Articles())
                    a(link) { +"取得所有文章" }
                }
                p {
                    val link: String = href(Articles.New())
                    a(link) { +"建立新文章" }
                }
                p {
                    val link: String = href(Articles.Id.Edit(Articles.Id(id = 123)))
                    a(link) { +"編輯現有文章" }
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

您可以在此處找到完整範例：[resource-routing](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/resource-routing)。