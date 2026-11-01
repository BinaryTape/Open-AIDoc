[//]: # (title: Swagger UI)

<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-swagger"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.swagger"/>
<var name="package_name" value="io.ktor.server.plugins.swagger"/>
<var name="plugin_api_link" value="https://api.ktor.io/ktor-server-swagger/io.ktor.server.plugins.swagger/swagger-u-i.html"/>

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="json-kotlinx-openapi"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor 支援 Kotlin/Native，並允許你在不需要額外執行階段或虛擬機的情況下執行伺服器。">Native 伺服器</Links> 支援</b>：✖️
</p>
</tldr>

<link-summary>
SwaggerUI 外掛程式可讓您為專案產生 Swagger UI。
</link-summary>

Ktor 允許您根據 OpenAPI 規格為專案產生並提供 Swagger UI。
透過 Swagger UI，您可以直接從瀏覽器視覺化呈現並與您的 API 端點進行互動。

您可以透過以下任一方式提供 OpenAPI 規格：

* [提供現有的 YAML 或 JSON 檔案](#static-openapi-file)。
* [在執行時期使用 OpenAPI 編譯器擴充套件與執行時期 API 產生規格](#generate-runtime-openapi-metadata)。

## 新增相依性 {id="add_dependencies"}

提供 Swagger UI 需要在組建指令碼中新增 `%artifact_name%` 構件：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目錄</a> 來指定 Ktor 相依性。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## 使用靜態 OpenAPI 檔案 {id="static-openapi-file"}

若要從現有的 OpenAPI 規格檔案提供 Swagger UI，請使用 [`swaggerUI()`](%plugin_api_link%) 函式並指定檔案位置。

以下範例在 `swagger` 路徑建立一個 `GET` 端點，並從提供的 OpenAPI 規格檔案轉譯 Swagger UI：

```kotlin
import io.ktor.server.plugins.swagger.*

// ...
routing {
    swaggerUI(path = "swagger", swaggerFile = "openapi/documentation.yaml")
}
```

該外掛程式會先在應用程式資源中尋找該規格。如果找不到，它會嘗試使用 `java.io.File` 從檔案系統載入。

## 產生執行時期 OpenAPI 元資料 {id="generate-runtime-openapi-metadata"}

除了依賴靜態檔案之外，您也可以使用 OpenAPI 編譯器外掛程式與路由註解所產生的元資料，在執行時期產生 OpenAPI 規格：

```kotlin
swaggerUI("/swaggerUI") {
    info = OpenApiInfo("My API", "1.0")
    source = OpenApiDocSource.Routing(ContentType.Application.Json) {
        routingRoot.descendants()
    }
}
```

如此一來，您便可以在 `/swaggerUI` 路徑存取產生的 OpenAPI 文件，反映出應用程式的目前狀態。

> 有關 OpenAPI 編譯器擴充套件與執行時期 API 的更多資訊，請參閱 [OpenAPI 規格產生](openapi-spec-generation.md)。
>
{style="tip"}

## 設定 Swagger UI {id="configure-swagger-ui"}

`swaggerUI {}` 設定區塊可讓您設定 OpenAPI 文件並自訂 Swagger UI。

### 設定文件元資料 {id="configure-document-metadata"}

您可以直接在設定區塊中定義最上層的 OpenAPI 元資料。

例如，使用 `info` 來指定一般 API 資訊，並使用 `tag()` 來定義標籤及其說明：

```kotlin
swaggerUI("/swagger") {
    info = OpenApiInfo("Books API from routes", "1.0.0")
    tag(
        name = "Books",
        description = "Operations on books"
    )
}
```
您也可以設定其他最上層 OpenAPI 屬性，例如伺服器、安全性需求、可重用組建、外部文件以及規格擴充套件。

> 關於可用選項的完整清單，請參閱 [`SwaggerConfig`](https://api.ktor.io/ktor-server-swagger/io.ktor.server.plugins.swagger/-swagger-config/index.html) API 參考。
> 
{style="tip"}

### 設定 Swagger UI 版本 {id="configure-the-swagger-ui-version"}

預設情況下，Ktor 會使用預先定義的 Swagger UI 版本。若要使用其他版本，請設定 `version` 屬性：

```kotlin
routing {
    swaggerUI(path = "swagger", swaggerFile = "openapi/documentation.yaml") {
        version = "5.31.0"
    }
}
```

> OpenAPI 3.1.x 文件需要 Swagger UI 5.x，而 Swagger UI 4.x 僅支援 OpenAPI 3.0.x。
>
{style="note"}

## 設定 CORS {id="configure-cors"}

為確保 Swagger UI 可以正確存取您的 API 端點，您需要先設定[跨來源資源共用 (CORS)](server-cors.md)。

以下範例套用了下列 CORS 設定：
* `anyHost` 啟用來自任何主機的跨來源請求。
* `allowHeader` 允許用於[內容協商](server-serialization.md)的 `Content-Type` 用戶端標頭。

```kotlin
install(CORS) {
    anyHost()
    allowHeader(HttpHeaders.ContentType)
}
```