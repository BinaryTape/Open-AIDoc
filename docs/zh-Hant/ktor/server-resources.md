[//]: # (title: 型別安全路由)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Resources"/>
<var name="package_name" value="io.ktor.server.resources"/>
<var name="artifact_name" value="ktor-server-resources"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.resources"/>

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="resource-routing"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支援 Kotlin/Native，可讓您在無需額外執行階段或虛擬機的情況下執行伺服器。">原生伺服器</Links> 支援</b>：✅
</p>
</tldr>

<link-summary>Resources 外掛程式可讓您實作型別安全路由。</link-summary>

Ktor 提供了 [Resources](https://api.ktor.io/ktor-resources/io.ktor.resources/-resources/index.html) 外掛程式，可讓您實作型別安全[路由](server-routing.md)。為此，您需要建立一個作為具型別路由的類別，並使用 `@Resource` 關鍵字註解該類別。請注意，`@Resource` 註解具有 kotlinx.serialization 程式庫提供的 `@Serializable` 行為。

> Ktor 用戶端提供了向伺服器發送[型別化請求](client-resources.md)的功能。

## 新增相依性 {id="add_dependencies"}

### 新增 kotlinx.serialization {id="add_serialization"}

鑑於[資源類別](#resource_classes)應具備 `@Serializable` 行為，您需要按照[設定 (Setup)](https://github.com/Kotlin/kotlinx.serialization#setup) 章節所述新增 Kotlin serialization 外掛程式。

### 新增 %plugin_name% 相依性 {id="add_plugin_dependencies"}

<p>
    若要使用 <code>%plugin_name%</code>，請將 <code>%artifact_name%</code> 產物新增至您的組建指令碼中：
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄 (version catalog)</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 安裝 %plugin_name% {id="install_plugin"}

<p>
    若要將 <code>%plugin_name%</code> 外掛程式<a href="server-plugins.md#install">安裝</a>至您的應用程式，
    請將其傳遞給指定<Links href="server-modules.md" summary="模組可讓您透過將路由分組來組織應用程式結構。">模組</Links>中的 <code>install</code> 函式。
    以下範例展示如何安裝 <code>%plugin_name%</code>：
</p>
<list>
    <li>
        在 <code>embeddedServer()</code> 函式呼叫中。
    </li>
    <li>
        在 <code>Application</code> 類別上明確定義的 <code>module()</code> 擴充方法中。
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"/>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"/>
    </TabItem>
</Tabs>

## 建立資源類別 {id="resource_classes"}

<snippet id="resource_classes_server">

每個資源類別都應具有 `@Resource` 註解。
下方我們將探討幾個資源類別的範例——定義單一路徑區段、查詢與路徑參數等等。

### 資源 URL {id="resource_url"}

以下範例展示如何定義 `Articles` 類別，該類別指定了回應 `/articles` 路徑的資源。

```kotlin
import io.ktor.resources.*

@Resource("/articles")
class Articles()
```

### 包含查詢參數的資源 {id="resource_query_param"}

下方的 `Articles` 類別具有一個 `sort` 字串屬性，該屬性充當[查詢參數](server-requests.md#query_parameters)，並允許您定義在帶有 `sort` 查詢參數的路徑 `/articles?sort=new` 上回應的資源。

```kotlin
@Resource("/articles")
class Articles(val sort: String? = "new")
```

### 包含巢狀類別的資源 {id="resource_nested"}

您可以巢狀定義類別，以建立包含多個路徑區段的資源。請注意，在這種情況下，巢狀類別應具有一個外層類別型別的屬性。
以下範例展示了一個在 `/articles/new` 路徑上回應的資源。

```kotlin
@Resource("/articles")
class Articles() {
    @Resource("new")
    class New(val parent: Articles = Articles())
}
```

### 包含路徑參數的資源 {id="resource_path_param"}

以下範例展示如何新增[巢狀](#resource_nested)的 `{id}` 整數[路徑參數](server-routing.md#path_parameter)，該參數會符合路徑區段並將其擷取為名為 `id` 的參數。

```kotlin
@Resource("/articles")
class Articles() {
    @Resource("{id}")
    class Id(val parent: Articles = Articles(), val id: Long)
}
```

舉例來說，此資源可用於回應 `/articles/12`。

</snippet>

### 範例：用於 CRUD 操作的資源 {id="example_crud"}

讓我們總結上述範例，並建立用於 CRUD 操作的 `Articles` 資源。

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

此資源可用於列出所有文章、發布新文章、編輯文章等。我們將在下一章介紹如何為此資源[定義路由處理常式](#define_route)。

> 您可以在此處找到完整範例：[resource-routing](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/resource-routing)。

## 定義路由處理常式 {id="define_route"}

若要為具型別的資源[定義路由處理常式](server-routing.md#define_route)，您需要將資源類別傳遞給動詞函式（`get`、`post`、`put` 等）。
例如，下方的路由處理常式會在 `/articles` 路徑上做出回應。

```kotlin
@Resource("/articles")
class Articles()

fun Application.module() {
    install(Resources)
    routing {
        get<Articles> { articles ->
            // 取得所有文章 ...
            call.respondText("List of articles: $articles")
        }
    }
}
```

以下範例展示如何為在[範例：用於 CRUD 操作的資源](#example_crud)中建立的 `Articles` 資源定義路由處理常式。請注意，在路由處理常式內部，您可以將 `Article` 作為參數存取並取得其屬性值。

```kotlin
fun Application.module() {
    install(Resources)
    routing {
        get<Articles> { article ->
            // 取得所有文章 ...
            call.respondText("List of articles sorted starting from ${article.sort}")
        }
        get<Articles.New> {
            // 顯示包含建立新文章欄位的頁面 ...
            call.respondText("Create a new article")
        }
        post<Articles> {
            // 儲存文章 ...
            call.respondText("An article is saved", status = HttpStatusCode.Created)
        }
        get<Articles.Id> { article ->
            // 顯示 ID 為 ${article.id} 的文章 ...
            call.respondText("An article with id ${article.id}", status = HttpStatusCode.OK)
        }
        get<Articles.Id.Edit> { article ->
            // 顯示包含編輯文章欄位的頁面 ...
            call.respondText("Edit an article with id ${article.parent.id}", status = HttpStatusCode.OK)
        }
        put<Articles.Id> { article ->
            // 更新文章 ...
            call.respondText("An article with id ${article.id} updated", status = HttpStatusCode.OK)
        }
        delete<Articles.Id> { article ->
            // 刪除文章 ...
            call.respondText("An article with id ${article.id} deleted", status = HttpStatusCode.OK)
        }
    }
}
```

以下是處理各個端點請求的一些訣竅：

- `get<Articles>`

   此路由處理常式應該要傳回根據 `sort` 查詢參數排序的所有文章。
   例如，這可以是包含所有文章的 [HTML 頁面](server-responses.md#html)或 [JSON 物件](server-responses.md#object)。

- `get<Articles.New>`

   此端點以包含用於建立新文章之欄位的 [Web 表單](server-responses.md#html)進行回應。
- `post<Articles>`

   `post<Articles>` 端點應該要接收使用 Web 表單傳送的[參數](server-requests.md#form_parameters)。
   Ktor 還允許您使用 `ContentNegotiation` 外掛程式將 JSON 資料作為[物件](server-requests.md#objects)接收。
- `get<Articles.Id>`

   此路由處理常式應該要傳回具有指定識別符號的文章。
   這可以是顯示文章的 [HTML 頁面](server-responses.md#html)或包含文章資料的 [JSON 物件](server-responses.md#object)。
- `get<Articles.Id.Edit>`

  此端點以包含用於編輯現有文章之欄位的 [Web 表單](server-responses.md#html)進行回應。
- `put<Articles.Id>`

   與 `post<Articles>` 端點類似，`put` 處理常式會接收使用 Web 表單傳送的[表單參數](server-requests.md#form_parameters)。
- `delete<Articles.Id>`

   此路由處理常式會刪除具有指定識別符號的文章。

您可以在此處找到完整範例：[resource-routing](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/resource-routing)。

## 從資源建立連結 {id="resource_links"}

除了將資源定義用於路由之外，它們還可用於建立連結。
這有時被稱為「反向路由」（_reverse routing_）。
如果您需要將這些連結新增至使用 [HTML DSL](server-html-dsl.md) 建立的 HTML 文件中，或者需要產生[重新導向回應](server-responses.md#redirect)，從資源建立連結會非常有用。

`Resources` 外掛程式使用多載的 [href](https://api.ktor.io/ktor-server-resources/io.ktor.server.resources/href.html) 方法擴充了 `Application`，允許您從 `Resource` 產生連結。例如，下方的程式碼片段為[上述定義](#example_crud)的 `Edit` 資源建立了一個連結：

```kotlin
val link: String = href(Articles.Id.Edit(Articles.Id(id = 123)))
```

由於祖父層級的 `Articles` 資源定義了預設值為 `new` 的 `sort` 查詢參數，因此 `link` 變數包含：

```
/articles/123/edit?sort=new
```

若要產生指定主機與通訊協定的 URL，您可以向 `href` 方法提供 `URLBuilder`。
也可以使用 `URLBuilder` 指定額外的查詢參數，如下列範例所示：

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

以下範例展示如何將從資源建立的連結新增至 HTML 回應中：

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

您可以在此處找到完整範例：[resource-routing](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/resource-routing)。