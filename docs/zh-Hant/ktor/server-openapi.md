[//]: # (title: OpenAPI)

<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-openapi"/>
<var name="package_name" value="io.ktor.server.plugins.openapi"/>
<var name="plugin_api_link" value="https://api.ktor.io/ktor-server-openapi/io.ktor.server.plugins.openapi/open-a-p-i.html"/>

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
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">原生伺服器</Links> 支援</b>：✖️
</p>
</tldr>

<link-summary>
OpenAPI 外掛程式允許您為專案產生 OpenAPI 文件。
</link-summary>

Ktor 允許您根據 OpenAPI 規格提供 OpenAPI 文件。

您可以使用以下其中一種方式提供 OpenAPI 規格：

* [提供現有的 YAML 或 JSON 檔案](#static-openapi-file)。
* [使用 OpenAPI 編譯器擴充套件與執行時 API 在執行時產生規格](#generate-runtime-openapi-metadata)。

在上述兩種情況下，OpenAPI 外掛程式都會在伺服器上組合規格，並將文件算繪為 HTML。

## 加入相依性 {id="add_dependencies"}

* 提供 OpenAPI 文件需要在建置指令碼中加入 `%artifact_name%` 構件：

  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>

* （選填）如果您想要自訂 [程式碼產生器](https://github.com/swagger-api/swagger-codegen-generators)，請加入 `swagger-codegen-generators` 相依性：

  <var name="group_id" value="io.swagger.codegen.v3"/>
  <var name="artifact_name" value="swagger-codegen-generators"/>
  <var name="version" value="swagger_codegen_version"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"/>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"/>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;%group_id%&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%&lt;/artifactId&gt;&#10;                  &lt;version&gt;${%version%}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>

  您可以將 `$swagger_codegen_version` 替換為所需的 `swagger-codegen-generators` 構件版本，例如 `%swagger_codegen_version%`。

> 在 Ktor 3.4.0 中，`OpenAPI` 外掛程式需要 `ktor-server-routing-openapi` 相依性。
> 這並非刻意的破壞性變更，將於 Ktor 3.4.1 中修正。
> 如果您正在使用 Ktor 3.4.0，請手動加入該相依性以避免執行時錯誤。
>
{style="warning"}

## 使用靜態 OpenAPI 檔案 {id="static-openapi-file"}

若要從現有規格提供 OpenAPI 文件，請使用 [`openAPI()`](%plugin_api_link%) 函式並提供 OpenAPI 文件的路徑。

以下範例在 `openapi` 路徑建立了一個 `GET` 端點，並從提供的 OpenAPI 規格檔案算繪 Swagger UI：

```kotlin
import io.ktor.server.plugins.openapi.*

// ...
routing {
    openAPI(path="openapi", swaggerFile = "openapi/documentation.yaml")
}
```

外掛程式會首先在應用程式資源中尋找規格。若未找到，則會嘗試使用 `java.io.File` 從檔案系統載入。

## 產生執行時 OpenAPI 元資料

您可以改為使用 OpenAPI 編譯器外掛程式與路由註解產生的元資料在執行時產生 OpenAPI 規格，而不必依賴靜態檔案。

在此模式下，OpenAPI 外掛程式會直接從路由樹組合規格：

```kotlin
 openAPI(path = "openapi") {
    info = OpenApiInfo("My API", "1.0")
    source = OpenApiDocSource.Routing {
        routingRoot.descendants()
    }
}
```

如此一來，您便可以在 `/openapi` 路徑存取產生的 OpenAPI 文件，該文件反映了應用程式的當前狀態。

> 如需更多關於 OpenAPI 編譯器擴充套件與執行時 API 的資訊，請參閱 [OpenAPI 規格產生](openapi-spec-generation.md)。
> 
{style="tip"}

## 設定 OpenAPI {id="configure-openapi"}

預設情況下，文件會使用 `StaticHtml2Codegen` 進行算繪。您可以在 `openAPI {}` 區塊中自訂算繪器：

> `StaticHtmlCodegen` 與 `StaticHtml2Codegen` 僅支援 OpenAPI 3.0.x 文件。將其用於 OpenAPI 3.1 文件可能會產生不完整或不正確的 HTML。對於 OpenAPI 3.1，請搭配 Swagger UI 5.x 使用 [`swaggerUI()`](server-swagger-ui.md) 函式。如果您需要繼續使用 OpenAPI 外掛程式的 HTML 算繪器，請將規格保持在 OpenAPI 3.0.3。
>
{style="note"}

```kotlin
routing {
    openAPI(path="openapi", swaggerFile = "openapi/documentation.yaml") {
        codegen = StaticHtmlCodegen()
    }
}