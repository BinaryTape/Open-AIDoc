[//]: # (title: OpenAPI 規格產生)

<show-structure for="chapter" depth="2"/>
<secondary-label ref="server-feature"/>

<var name="artifact_name" value="ktor-server-routing-openapi"/>
<var name="package_name" value="io.ktor.server.routing.openapi"/>

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:%artifact_name%</code>
</p>
<p>
<b>程式碼範例</b>：
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/openapi-spec-gen">
    openapi-spec-gen
</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/openapi-spec-gen-maven">
    openapi-spec-gen-maven
</a>
</p>
</tldr>

Ktor 支援在執行時從一個或多個文件來源建置 OpenAPI 規格。

此功能可透過以下方式使用：
* OpenAPI 編譯器擴充功能（包含在 Ktor Gradle 外掛程式中），它會在編譯時分析路由程式碼，並產生在執行時註冊 OpenAPI 元資料的 Kotlin 程式碼。
* 路由註解執行時 API，它會直接將 OpenAPI 元資料附加到執行中應用程式的路由。

您可以單獨使用其中一種或結合兩者，並將其與 [OpenAPI](server-openapi.md) 和 [SwaggerUI](server-swagger-ui.md) 外掛程式結合使用，以提供互動式 API 文件。

> OpenAPI Gradle 擴充功能需要 Kotlin 2.2.20。使用其他版本可能會導致編譯錯誤。
>
{style="note"}

## 新增相依性

* 要啟用 OpenAPI 元資料產生，請將 Ktor 編譯器外掛程式套用到您的專案。

  <Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin" id="add-ktor-plugin-gradle-kotlin">

    ```kotlin
    plugins {
        id("io.ktor.plugin") version "%ktor_version%"
    }
    ```

    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy" id="add-ktor-plugin-gradle-groovy">

    ```groovy
    plugins {
        id 'io.ktor.plugin' version "%ktor_version%"
    }
    ```

    </TabItem>
    <TabItem title="Maven" group-key="maven" id="add-ktor-plugin-maven">

    與 Gradle 不同，Maven 未提供 Ktor 編譯器外掛程式的內建整合。要啟用 OpenAPI 規格產生，您需要手動配置編譯器外掛程式。

    1. 套用 Ktor Maven 外掛程式（執行和封裝應用程式時必要）：
       ```xml
       <build>
           <plugins>
               <plugin>
                   <groupId>io.ktor</groupId>
                   <artifactId>ktor-maven-plugin</artifactId>
                   <version>%ktor_version%</version>
               </plugin>
           </plugins>
       </build>
       ```
    2. 編譯器外掛程式必須以 JAR 檔案形式提供。新增以下配置以自動下載並將其複製到穩定位置：

       ```xml
       <plugin>
           <groupId>org.apache.maven.plugins</groupId>
           <artifactId>maven-dependency-plugin</artifactId>
           <version>3.9.0</version>
           <executions>
               <execution>
                   <id>copy-ktor-compiler-plugin</id>
                   <phase>generate-sources</phase>
                   <goals>
                       <goal>copy</goal>
                   </goals>
                   <configuration>
                       <artifactItems>
                           <artifactItem>
                               <groupId>io.ktor</groupId>
                               <artifactId>ktor-compiler-plugin</artifactId>
                               <version>%ktor_version%</version>
                               <outputDirectory>${project.build.directory}/kotlin-plugins</outputDirectory>
                               <destFileName>ktor-compiler-plugin.jar</destFileName>
                           </artifactItem>
                       </artifactItems>
                   </configuration>
               </execution>
           </executions>
       </plugin>
       ```
  
    3. 配置 Kotlin 編譯器：

       ```xml
       <plugin>
           <groupId>org.jetbrains.kotlin</groupId>
           <artifactId>kotlin-maven-plugin</artifactId>
           <version>%kotlin_version%</version>

           <configuration>
               <jvmTarget>21</jvmTarget>

               <compilerPlugins>
                   <plugin>kotlinx-serialization</plugin>
               </compilerPlugins>

               <args>
                   <arg>-Xplugin=${project.build.directory}/kotlin-plugins/ktor-compiler-plugin.jar</arg>

                   <arg>-P</arg>
                   <arg>plugin:io.ktor.ktor-compiler-plugin:openApiEnabled=true</arg>

                   <arg>-P</arg>
                   <arg>plugin:io.ktor.ktor-compiler-plugin:openApiCodeInference=true</arg>

                   <arg>-P</arg>
                   <arg>plugin:io.ktor.ktor-compiler-plugin:openApiOnlyCommented=false</arg>
               </args>
           </configuration>

           <dependencies>
               <dependency>
                   <groupId>io.ktor</groupId>
                   <artifactId>ktor-compiler-plugin</artifactId>
                   <version>%ktor_version%</version>
               </dependency>
               <dependency>
                   <groupId>org.jetbrains.kotlin</groupId>
                   <artifactId>kotlin-maven-serialization</artifactId>
                   <version>${kotlin_version}</version>
               </dependency>
           </dependencies>
           <executions>
               <execution>
                   <id>compile</id>
                   <phase>compile</phase>
                   <goals>
                       <goal>compile</goal>
                   </goals>
               </execution>
               <execution>
                   <id>test-compile</id>
                   <phase>test-compile</phase>
                   <goals>
                       <goal>test-compile</goal>
                   </goals>
               </execution>
           </executions>
       </plugin>
       ```
  
   </TabItem>
  </Tabs>

* 要使用執行時路由註解，請將 `%artifact_name%` 構件新增到您的組建指令碼：

  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"></code-block>
      </TabItem>
  </Tabs>

## 配置 OpenAPI 編譯器擴充功能 {id="configure-the-extension"}

OpenAPI 編譯器擴充功能控制如何在編譯時收集路由元資料。它本身並不定義最終的 OpenAPI 文件。

在編譯期間，該外掛程式會產生 Kotlin 程式碼，該程式碼使用 OpenAPI 執行時 API 來註冊從路由宣告、程式碼模式和註解中衍生的元資料。

一般的 OpenAPI 資訊 —— 例如 API 標題、版本、伺服器、安全性配置和詳細架構 —— 會在[產生規格時](#generate-and-serve-the-specification)的執行時提供。

要配置編譯器外掛程式擴充功能，請在 <Path>build.gradle.kts</Path> 檔案的 `ktor` 擴充功能內使用 `openApi {}` 區塊：

```kotlin
ktor {
    openApi {
        enabled = true
        codeInferenceEnabled = true
        onlyCommented = false
    }
}
```

### 配置選項

<deflist>
<def>
<title><code>enabled</code></title>
啟用或停用 OpenAPI 路由註解程式碼產生。預設為 <code>false</code>。
</def>
<def>
<title><code>codeInferenceEnabled</code></title>
控制編譯器是否嘗試從路由程式碼推論 OpenAPI 元資料。預設為 <code>true</code>。如果推論產生不正確的結果，或者您偏好使用註解明確定義元資料，請停用此選項。如需更多詳細資訊，請參閱<a href="#code-inference">程式碼推論規則</a>。
</def>
<def>
<title><code>onlyCommented</code></title>
將元資料產生限制在包含註解註解的路由。預設為 <code>false</code>，這表示除了明確標記為 <code>@ignore</code> 的路由外，所有的路由呼叫都會被處理。
</def>
</deflist>

### 路由結構分析

Ktor 編譯器外掛程式會分析您的伺服器路由 DSL，以確定 API 的結構形狀。此分析僅基於路由宣告，不會檢查路由處理常式的內容。

以下內容會自動從路由 API 樹中的選擇器中推論：
- 合併後的路徑（例如 `/api/v1/users/{id}`）。
- HTTP 方法（例如 `GET` 和 `POST`）。
- 路徑參數。

```kotlin
routing {
    route("/api/v1") {
        get("/users") { }
        get("/users/{id}") { }
        post("/users") { }
    }
}
```

由於請求參數、主體和回應是在路由 Lambda 內部處理的，編譯器無法僅從路由結構推論出完整的 OpenAPI 描述。為了豐富產生的元資料，Ktor 支援基於常見請求處理模式的[註解](#annotate-routes)和[自動推論](#code-inference)。

### 程式碼推論

當啟用程式碼推論時，編譯器外掛程式會識別常見的 Ktor 使用模式，並自動產生等效的執行時註解。

下表總結了支援的推論規則：

| 規則 | 描述 | 輸入 | 輸出 (來自 annotate 作用域) |
|---------------------|----------------------------------------------------------------|----------------------------------------------------------------------------|--------------------------------------------------------------------------|
| 請求主體 (Request Body) | 從 `ContentNegotiation` 讀取提供請求主體架構 | `call.receive<T>()` | `requestBody { schema = jsonSchema<T>() }` |
| 回應主體 (Response Body) | 從 `ContentNegotiation` 寫入提供回應主體架構 | `call.respond<T>()` | `responses { HttpStatusCode.OK { schema = jsonSchema<T>() } }` |
| 回應標頭 (Response Headers) | 包含回應的自訂標頭 | `call.response.header("X-Foo", "Bar")` | `responses { HttpStatusCode.OK { headers { header("X-Foo", "Bar") } } }` |
| 路徑參數 (Path Parameters) | 尋找路徑參數參照 | `call.parameters["id"]` | `parameters { path("id") }` |
| 查詢參數 (Query Parameters) | 尋找查詢參數參照 | `call.queryParameters["name"]` | `parameters { query("name") }` |
| 請求標頭 (Request Headers) | 尋找請求標頭參照 | `call.request.headers["X-Foo"]` | `parameters { header("X-Foo") }` |
| Resource API 路由 | 為 Resources 路由 API 推論呼叫結構 | `call.get<List> { /**/ }; @Resource("/list") class List(val name: String)` | `parameters { query("name") }` |

推論會儘可能遵循提取的函式，並嘗試為典型的請求和回應流程產生一致的文件。

#### 停用特定端點的推論

如果推論為特定端點產生了不正確的元資料，您可以透過新增 `ignore` 標記來排除它：

```kotlin
// ignore!
get("/comments") {
    // ...
}
```

## 註解路由 {id="annotate-routes"}

為了豐富規格內容，Ktor 支援兩種註解路由的方式：

- [基於註解的註解](#comment-annotations)，由編譯器外掛程式分析。
- [執行時路由註解](#runtime-route-annotations)，使用 `.describe {}` DSL 定義。

您可以採用其中一種方法，或將兩者結合使用。

### 基於註解的路由註解 {id="comment-annotations"}

基於註解的註解提供了無法從程式碼推論的元資料，並能與現有路由無縫整合。

元資料的定義方式是在行首放置關鍵字，後跟冒號 (`:`) 及其值。

您可以直接將註解附加到路由宣告：

```kotlin
/**
 * Get a single user by ID.
 *
 * Path: id [ULong] the ID of the user
 *
 * Responses:
 *   – 400 The ID parameter is malformatted or missing.
 *   – 404 The user for the given ID does not exist.
 *   – 200 [User] The user found with the given ID.
 */
get("/{id}") {
    val id = call.parameters["id"]?.toULongOrNull()
        ?: return@get call.respond(HttpStatusCode.BadRequest)
    val user = list.find { it.id == id }
        ?: return@get call.respond(HttpStatusCode.NotFound)
    call.respond(user)
}
```

#### 格式化規則

- 關鍵字必須出現在行首。
- 冒號 (`:`) 用於分隔關鍵字及其值。
- 複數形式（例如 `Tags`、`Responses`）允許分組定義。
- 單數形式（例如 `Tag`、`Response`）也受支援。
- 頂層項目符號 (`-`) 是可選的，僅影響格式。

以下變體是等效的：

```kotlin
/**
 * Tag: widgets
 * 
 * Tags:
 *   - widgets
 * 
 * - Tags:
 *  - widgets
 */
```

#### 支援的註解欄位

| 標籤 | 格式 | 描述 |
|----------------|-------------------------------------------------|----------------------------------|
| `Tag` | `Tag: name` | 將端點歸類在一個標籤下 |
| `Path` | `Path: [Type] name description` | 路徑參數 |
| `Query` | `Query: [Type] name description` | 查詢參數 |
| `Header` | `Header: [Type] name description` | 標頭參數 |
| `Cookie` | `Cookie: [Type] name description` | Cookie 參數 |
| `Body` | `Body: contentType [Type] description` | 請求主體 |
| `Response` | `Response: code contentType [Type] description` | 回應定義 |
| `Deprecated` | `Deprecated: reason` | 將端點標記為已棄用 |
| `Description` | `Description: text` | 詳細描述 |
| `Security` | `Security: scheme` | 安全性需求 |
| `ExternalDocs` | `ExternalDocs: href` | 外部文件連結 |

### 執行時路由註解 {id="runtime-route-annotations"}

<primary-label ref="experimental"/>

在編譯時分析不足的情況下，例如使用動態路由、攔截器或條件邏輯時，您可以在執行時使用 `.describe {}` 擴充函式將 OpenAPI 操作元資料直接附加到路由。

每個加上註解的路由都定義了一個 OpenAPI [Operation 物件](https://swagger.io/specification/#operation-object)，它在產生的 OpenAPI 規格中代表單個 HTTP 操作（例如 `GET /users`）。元資料在執行時附加到路由樹，並由 OpenAPI 和 Swagger UI 外掛程式取用。

`.describe {}` DSL 直接對應到 OpenAPI 規格。屬性名稱和結構與為 Operation 物件定義的欄位一致，包括參數、請求主體、回應、安全性需求、伺服器、回呼和規格擴充 (`x-*`)。

執行時路由註解 API 是實驗性的，需要使用 `@OptIn(ExperimentalKtorApi::class)` 選擇加入：

```kotlin
                @OptIn(ExperimentalKtorApi::class)
                get("/users") {
                    val query = call.parameters["q"]
                    val result = if (query != null) {
                        list.filter {it.name.contains(query, ignoreCase = true)  }
                    } else {
                        list
                    }

                    call.respond(result)
                }.describe {
                    summary = "Get users"
                    description = "Retrieves a list of users."
                    parameters {
                        query("q") {
                            description = "An encoded query"
                            required = false
                        }
                    }
                    responses {
                        HttpStatusCode.OK {
                            description = "A list of users"
                            schema = jsonSchema<List<User>>()
                        }
                        HttpStatusCode.BadRequest {
                            description = "Invalid query"
                            ContentType.Text.Plain()
                        }
                    }
                }
```

> 如需可用欄位的完整列表，請參閱 [OpenAPI 規格](https://swagger.io/specification/#operation-object)。
>
{style="tip"}

執行時註解會與編譯器產生的元資料以及基於註解的元資料合併。當多個來源定義相同的 OpenAPI 欄位時，執行時註解提供的值具有[優先權](#metadata-precedence)。

## 在 OpenAPI 規格中隱藏路由

要將某個路由及其子路由從產生的 OpenAPI 文件中排除，請使用 `Route.hide()` 函式：

```kotlin
@OptIn(ExperimentalKtorApi::class)
get("/routes") {
    // ....
}.hide()
```

這對於不應發佈的內部、管理或診斷端點非常有用，包括用於[產生 OpenAPI 規格](#assemble-and-serve-the-specification)本身的路由。

OpenAPI 和 Swagger UI 外掛程式會自動呼叫 `.hide()`，因此它們的路由會從產生的文件中排除。

## 架構推論

Ktor 在建置 OpenAPI 規格時會自動為請求和回應型別產生 JSON 架構。預設情況下，架構是透過使用資料類別上的 `kotlinx-serialization` 描述符從型別參考中推論出來的。這使得大多數常見的資料模型無需額外努力即可被記錄。

### 使用註解自訂架構

您可以透過在資料類別中加入 [`@JsonSchema`](https://api.ktor.io/ktor-openapi-schema/io.ktor.openapi/-json-schema/index.html) 註解來覆寫自動產生的 JSON 架構欄位。這允許您新增描述、將欄位標記為必填等：

```kotlin
@JsonSchema.Description("Represents a news article")
data class Article(
    val title: String,
    val content: String
)
```

### 使用基於反射的架構推論

對於使用 Jackson 或 Gson 而非 `kotlinx-serialization` 的專案，您可以使用基於反射的架構推論。要執行此操作，請在 OpenAPI 或 SwaggerUI 外掛程式的 `Routing` 來源中設定 `schemaInference` 欄位：

```kotlin
openAPI("docs") {
    outputPath = "docs/routes"
    info = OpenApiInfo("Books API from routes", "1.0.0")
    source = OpenApiDocSource.Routing(
        contentType = ContentType.Application.Json,
        schemaInference = ReflectionJsonSchemaInference.Default,
    )
}
```

### 自訂反射行為

您可以提供自訂的 `SchemaReflectionAdapter` 來處理不直接支援的註解或命名慣例。

`SchemaReflectionAdapter` 是 `ReflectionJsonSchemaInference` 的一個欄位，它允許您覆寫預設行為，例如屬性名稱、被忽略的欄位或可 null 性規則。

例如，您可以自訂行為以支援 Gson 的 `@SerializedName` 註解：

```kotlin
ReflectionJsonSchemaInference(object : SchemaReflectionAdapter {
    override fun getName(type: KType): String? {
        return (type.classifier as? `KClass<*>`)?.let {
            findAnnotations(SerializedName::class)?.value ?: it.simpleName
        }
    }
})
```

## 產生並提供規格

OpenAPI 規格是在執行時根據執行時路由註解和編譯器外掛程式產生的元資料組合而成的。

您可以透過以下方式公開規格：

- [手動組合並提供 OpenAPI 文件](#assemble-and-serve-the-specification)。
- 使用 [OpenAPI](server-openapi.md) 或 [SwaggerUI](server-swagger-ui.md) 外掛程式來提供規格和互動式文件。

### 組合並提供規格

要在執行時組合完整的 OpenAPI 文件，請建立一個 `OpenApiDoc` 執行個體並提供應包含在規格中的路由。

該文件是根據路由樹中編譯器產生的元資料和執行時路由註解組合而成的。產生的 `OpenApiDoc` 執行個體始終反映應用程式的當前狀態。

您通常從路由處理常式建構文件並直接對其進行回應：

```kotlin

        get("/docs.json") {
            val doc = OpenApiDoc(info = OpenApiInfo("My API", "1.0")) + call.application.routingRoot.descendants()
            call.respond(doc)
```

在此範例中，OpenAPI 文件使用 [`ContentNegotiation`](server-serialization.md) 外掛程式進行序列化。這假設已安裝了 JSON 序列化器（例如 `kotlinx.serialization`）。

不需要額外的組建或產生步驟。下次請求規格時，對路由或註解的更改將自動反映出來。

> 如果您想使序列化更明確，或避免依賴 `ContentNegotiation`，您可以手動對文件進行編碼並回應 JSON：
> 
> ```kotlin
> call.respondText(
>   Json.encodeToString(docs),
>   ContentType.Application.Json
> )
>```
>
{style="note"}

### 提供互動式文件

要透過互動式 UI 公開 OpenAPI 規格，請使用 [OpenAPI](server-openapi.md) 和 [Swagger UI](server-swagger-ui.md) 外掛程式。

這兩個外掛程式都會在執行時組合規格，並可以直接從路由樹讀取元資料。它們在文件呈現方式上有所不同：
- OpenAPI 外掛程式在伺服器上呈現文件並提供預先產生的 HTML。
- Swagger UI 外掛程式以 JSON 或 YAML 形式提供 OpenAPI 規格，並使用 Swagger UI 在瀏覽器中呈現 UI。

```kotlin
// 提供 OpenAPI UI
openAPI("/openApi")

// 提供 Swagger UI
swaggerUI("/swaggerUI") {
    info = OpenApiInfo("My API", "1.0")
    source = OpenApiDocSource.Routing(
        contentType = ContentType.Application.Json,
    )
}
```

### 元資料優先順序

最終的 OpenAPI 規格是在執行時透過合併多個來源貢獻的元資料來組合的。

以下來源依序套用：

1. 編譯器產生的元資料，包括：
    - [路由結構分析](#routing-structure-analysis)
    - [程式碼推論](#code-inference)
2. [基於註解的路由註解](#comment-annotations)
3. [執行時路由註解](#runtime-route-annotations)

當同一個 OpenAPI 欄位由多個來源定義時，執行時註解提供的值優先於基於註解的註解和編譯器產生的元資料。

未被明確覆寫的元資料將被保留並合併到最終文件中。