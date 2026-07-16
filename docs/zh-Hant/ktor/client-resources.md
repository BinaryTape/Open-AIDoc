[//]: # (title: 型別安全請求)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<var name="plugin_name" value="Resources"/>
<var name="artifact_name" value="ktor-client-resources"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-type-safe-requests"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
了解如何使用 Resources 外掛程式發送型別安全請求。
</link-summary>

Ktor 提供 `%plugin_name%` 外掛程式，讓您能夠實作型別安全[請求](client-requests.md)。為此，您需要建立一個描述伺服器可用資源的類別，然後使用 `@Resource` 關鍵字來註解該類別。請注意，`@Resource` 註解具有由 kotlinx.serialization 程式庫提供的 `@Serializable` 行為。

> Ktor 伺服器提供了實作[型別安全路由](server-resources.md)的功能。

## 新增相依性 {id="add_dependencies"}

### 新增 kotlinx.serialization {id="add_serialization"}

鑑於[資源類別](#resource_classes)應具備 `@Serializable` 行為，您需要按照 [Setup](https://github.com/Kotlin/kotlinx.serialization#setup) 章節中的說明新增 Kotlin 序列化外掛程式。

### 新增 %plugin_name% 相依性 {id="add_plugin_dependencies"}

<p>
    若要使用 <code>%plugin_name%</code>，您需要在建置指令碼中包含 <code>%artifact_name%</code> 構件：
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
<tip>
    若要進一步了解 Ktor 用戶端所需的構件，請參閱 <Links href="/ktor/client-dependencies" summary="了解如何向現有專案新增用戶端相依性。">新增用戶端相依性</Links>。
</tip>

## 安裝 %plugin_name% {id="install_plugin"}

若要安裝 `%plugin_name%`，請將其傳遞給[用戶端配置區塊](client-create-and-configure.md#configure-client)內的 `install` 函式：
```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.resources.*
//...
val client = HttpClient(CIO) {
    install(Resources)
}
```

## 建立資源類別 {id="resource_classes"}

每個資源類別都應具有 `@Resource` 註解。
下面我們將查看幾個資源類別的範例 —— 定義單一路徑區段、查詢與路徑參數等。

### 資源 URL {id="resource_url"}

下列範例示範如何定義 `Articles` 類別，該類別指定了回應 `/articles` 路徑的資源。

```kotlin
import io.ktor.resources.*

@Resource("/articles")
class Articles()
```

### 具備查詢參數的資源 {id="resource_query_param"}

下方的 `Articles` 類別具有 `sort` 字串屬性，該屬性充當[查詢參數](server-requests.md#query_parameters)，並允許您定義一個回應以下路徑且帶有 `sort` 查詢參數的資源：`/articles?sort=new`。

```kotlin
@Resource("/articles")
class Articles(val sort: String? = "new")
```

### 具備巢狀類別的資源 {id="resource_nested"}

您可以透過巢狀類別來建立包含多個路徑區段的資源。請注意，在此情況下，巢狀類別應具備一個型別為外部類別的屬性。
下方的範例顯示了回應 `/articles/new` 路徑的資源。

```kotlin
@Resource("/articles")
class Articles() {
    @Resource("new")
    class New(val parent: Articles = Articles())
}
```

### 具備路徑參數的資源 {id="resource_path_param"}

下列範例展示了如何新增[巢狀](#resource_nested)的 `{id}` 整數[路徑參數](server-routing.md#path_parameter)，該參數會配對路徑區段並將其擷取為名為 `id` 的參數。

```kotlin
@Resource("/articles")
class Articles() {
    @Resource("{id}")
    class Id(val parent: Articles = Articles(), val id: Long)
}
```

例如，此資源可用於回應 `/articles/12`。

### 範例：用於 CRUD 操作的資源 {id="example_crud"}

讓我們總結上述範例，並為 CRUD 操作建立 `Articles` 資源。

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

此資源可用於列出所有文章、發佈新文章、編輯文章等。我們將在下一節中介紹如何對此資源[發送型別安全請求](#make_requests)。

> 您可以在此處找到完整的範例：[client-type-safe-requests](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-type-safe-requests)。

## 發送型別安全請求 {id="make_requests"}

若要對具備型別的資源[發送請求](client-requests.md)，您需要將資源類別執行個體傳遞給請求函式（`request`、`get`、`post`、`put` 等）。例如，下方的範例展示了如何對 `/articles` 路徑發送請求。

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

下列範例展示了如何對 [範例：用於 CRUD 操作的資源](#example_crud) 中建立的 `Articles` 資源發送具備型別的請求。

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

[defaultRequest](client-default-request.md) 函式用於為所有請求指定預設 URL。

> 您可以在此處找到完整的範例：[client-type-safe-requests](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-type-safe-requests)。