[//]: # (title: OpenAPI)

<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-openapi"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.openapi"/>
<var name="package_name" value="io.ktor.server.plugins.openapi"/>
<var name="plugin_api_link" value="https://api.ktor.io/ktor-server-openapi/io.ktor.server.plugins.openapi/open-a-p-i.html"/>

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
    <b><Links href="server-native.md" summary="Ktor 支援 Kotlin/Native，並允許你在沒有額外執行環境或虛擬機的情況下執行伺服器。">原生伺服器</Links>支援</b>：✖️
</p>
</tldr>

<link-summary>
OpenAPI 外掛程式可讓你為專案產生 OpenAPI 文件。
</link-summary>

Ktor 允許你根據 OpenAPI 規格提供 OpenAPI 文件服務。

你可以透過以下其中一種方式提供 OpenAPI 規格：

* [提供現有的 YAML 或 JSON 檔案](#static-openapi-file)。
* [使用 OpenAPI 編譯器擴充套件與執行階段 API 於執行階段產生規格](#generate-runtime-openapi-metadata)。

在這兩種情況下，OpenAPI 外掛程式都會在伺服器端組裝規格並將文件呈現為 HTML。

## 新增相依性 {id="add_dependencies"}

* 提供 OpenAPI 文件服務需要在建置指令碼中新增 `%artifact_name%` 構件：

  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(%ktor_version_catalog_name%)"/>
          <note>
              上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
              Ktor 版本目錄</a> 來指定 Ktor 相依性。
          </note>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation %ktor_version_catalog_name%"/>
          <note>
              上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
              Ktor 版本目錄</a> 來指定 Ktor 相依性。
          </note>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>

* （選用）如果你想要自訂[程式碼產生器](https://github.com/swagger-api/swagger-codegen-generators)，請新增 `swagger-codegen-generators` 相依性：

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

  你可以將 `$swagger_codegen_version` 替換為所需的 `swagger-codegen-generators` 構件版本，例如 `%swagger_codegen_version%`。

## 使用靜態 OpenAPI 檔案 {id="static-openapi-file"}

若要從現有的規格提供 OpenAPI 文件服務，請使用 [`openAPI()`](%plugin_api_link%) 函式並指定 OpenAPI 文件的路徑。

以下範例在 `openapi` 路徑建立一個 `GET` 端點，並從提供的 OpenAPI 規格檔案呈現 Swagger UI：

```kotlin
import io.ktor.server.plugins.openapi.*

// ...
routing {
    openAPI(path="openapi", swaggerFile = "openapi/documentation.yaml")
}
```

此外掛程式會先在應用程式資源中尋找該規格。如果找不到，它會嘗試使用 `java.io.File` 從檔案系統載入。

## 於執行階段產生 OpenAPI 元資料 {id="generate-runtime-openapi-metadata"}

除了依賴靜態檔案之外，你還可以利用 OpenAPI 編譯器外掛程式所產生的元資料以及路由註解，在執行階段產生 OpenAPI 規格。

在此模式下，OpenAPI 外掛程式會直接從路由樹組裝規格：

```kotlin
 openAPI(path = "openapi") {
    info = OpenApiInfo("My API", "1.0")
    source = OpenApiDocSource.Routing {
        routingRoot.descendants()
    }
}
```

如此一來，你就可以在 `/openapi` 路徑存取產生的 OpenAPI 文件，該文件反映了應用程式的目前狀態。

> 有關 OpenAPI 編譯器擴充套件與執行階段 API 的詳細資訊，請參閱 [OpenAPI 規格產生](openapi-spec-generation.md)。
> 
{style="tip"}

## 設定 OpenAPI {id="configure-openapi"}

`openAPI {}` 配置區塊可讓你設定產生的 OpenAPI 文件以及 Ktor 呈現文件的方式。

### 設定文件元資料 {id="configure-document-metadata"}

你可以直接在配置區塊中定義頂層 OpenAPI 元資料。

例如，使用 `info` 指定一般 API 資訊，並使用 `tag()` 定義標籤及其說明：

```kotlin
openAPI("openapi") {
    info = OpenApiInfo("Books API from routes", "1.0.0")
    tag(
        name = "Books",
        description = "Operations on books"
    )
}
```

你也可以設定其他頂層 OpenAPI 屬性，例如伺服器、安全需求、可重複使用的組件、外部文件和規格擴充套件。

> 如需所有可用選項的完整清單，請參閱 [`OpenAPIConfig`](https://api.ktor.io/ktor-server-openapi/io.ktor.server.plugins.openapi/-open-a-p-i-config/index.html) API 參考。
>
{style="tip"}

### 設定文件呈現器 {id="configure-the-document-renderer"}

預設情況下，文件會使用 `StaticHtml2Codegen` 呈現。

若要使用不同的呈現器，請將其指派給 `codegen` 屬性：

```kotlin
routing {
    openAPI(path="openapi", swaggerFile = "openapi/documentation.yaml") {
        codegen = StaticHtmlCodegen()
    }
}
```

> `StaticHtmlCodegen` 與 `StaticHtml2Codegen` 僅支援 OpenAPI 3.0.x 文件。將其用於 OpenAPI 3.1 文件可能會產生不完整或不正確的 HTML。針對 OpenAPI 3.1，請使用 [`swaggerUI()`](server-swagger-ui.md) 函式搭配 Swagger UI 5.x。如果你需要繼續使用 OpenAPI 外掛程式的 HTML 呈現器，請將規格保持在 OpenAPI 3.0.3。
>
{style="note"}