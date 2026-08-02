[//]: # (title: Swagger UI)

<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-swagger"/>
<var name="package_name" value="io.ktor.server.plugins.swagger"/>
<var name="plugin_api_link" value="https://api.ktor.io/ktor-server-swagger/io.ktor.server.plugins.swagger/swagger-u-i.html"/>

<tldr>
<p>
<b>必要相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="json-kotlinx-openapi"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor 支援 Kotlin/Native，可讓您在不使用額外執行時或虛擬機的情況下執行伺服器。">原生伺服器</Links> 支援</b>：✖️
</p>
</tldr>

<link-summary>
SwaggerUI 外掛程式可讓您為專案產生 Swagger UI。
</link-summary>

Ktor 讓您能根據 OpenAPI 規格為專案產生並提供 Swagger UI。
透過 Swagger UI，您可以直接從瀏覽器中將您的 API 端點可視化並進行互動。 

您可以透過以下任一方式提供 OpenAPI 規格：

* [提供現有的 YAML 或 JSON 檔案](#static-openapi-file)。
* [使用 OpenAPI 編譯器擴充套件與執行時 API 在執行時產生規格](#generate-runtime-openapi-metadata)。

## 新增相依性 {id="add_dependencies"}

提供 Swagger UI 需要在組建指令碼中新增 `%artifact_name%` 構件：

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

> 在 Ktor 3.4.0 中，`SwaggerUI` 外掛程式需要 `ktor-server-routing-openapi` 相依性。
> 這並非刻意的破壞性變更，並將在 Ktor 3.4.1 中修正。
> 如果您使用的是 Ktor 3.4.0，請手動新增該相依性以避免執行時錯誤。
> 
{style="warning"}

## 使用靜態 OpenAPI 檔案 {id="static-openapi-file"}

若要從現有的 OpenAPI 規格檔案提供 Swagger UI，請使用 [`swaggerUI()`](%plugin_api_link%) 函式並指定檔案位置。

以下範例在 `swagger` 路徑建立了一個 `GET` 端點，並從提供的 OpenAPI 規格檔案呈現 Swagger UI：

```kotlin
import io.ktor.server.plugins.swagger.*

// ...
routing {
    swaggerUI(path = "swagger", swaggerFile = "openapi/documentation.yaml")
}
```

外掛程式會先在應用程式資源中尋找規格。如果找不到，則會嘗試使用 `java.io.File` 從檔案系統載入。

## 在執行時產生 OpenAPI 元資料

除了依賴靜態檔案，您也可以使用由 OpenAPI 編譯器外掛程式產生的元資料和路由註解，在執行時產生 OpenAPI 規格：

```kotlin
swaggerUI("/swaggerUI") {
    info = OpenApiInfo("My API", "1.0")
    source = OpenApiDocSource.Routing(ContentType.Application.Json) {
        routingRoot.descendants()
    }
}
```

如此一來，您就可以在 `/swaggerUI` 路徑存取產生的 OpenAPI 文件，該文件會反映應用程式的當前狀態。

> 如需更多關於 OpenAPI 編譯器擴充套件與執行時 API 的資訊，請參閱 [OpenAPI 規格產生](openapi-spec-generation.md)。
>
{style="tip"}

## 配置 Swagger UI

您可以在 `swaggerUI {}` 區塊內自訂 Swagger UI，例如覆寫預設的 Swagger UI 版本：

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

## 配置 CORS {id="configure-cors"}

為了確保 Swagger UI 能夠正確存取您的 API 端點，您需要先配置[跨來源資源共用 (CORS)](server-cors.md)。

下方的範例套用了以下 CORS 配置：
* `anyHost` 啟用來自任何主機的跨來源要求。
* `allowHeader` 允許用於[內容交涉](server-serialization.md)的 `Content-Type` 用戶端標頭。

```kotlin
install(CORS) {
    anyHost()
    allowHeader(HttpHeaders.ContentType)
}