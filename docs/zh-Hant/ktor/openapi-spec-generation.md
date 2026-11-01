[//]: # (title: OpenAPI 規格產生)

<show-structure for="chapter" depth="2"/>
<secondary-label ref="server-feature"/>

<var name="artifact_name" value="ktor-server-routing-openapi"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.routingOpenapi"/>
<var name="package_name" value="io.ktor.server.routing.openapi"/>

<tldr>
<p>
<b>必要的相依性</b>: <code>io.ktor:%artifact_name%</code>
</p>
<p>
<b>程式碼範例</b>:
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/openapi-spec-gen">
    openapi-spec-gen
</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/openapi-spec-gen-maven">
    openapi-spec-gen-maven
</a>
</p>
</tldr>

Ktor 支援在執行時期從一個或多個文件來源建置 OpenAPI 規格。

此功能可透過以下方式使用：
* OpenAPI 編譯器擴充套件（包含在 Ktor Gradle 外掛程式中），在編譯期分析路由程式碼，並產生在執行時期註冊 OpenAPI 元資料的 Kotlin 程式碼。
* 路由註解執行時期 API，直接將 OpenAPI 元資料附加至執行中應用程式的路由上。

你可以使用其中一種或兩者兼具，並將它們與 [OpenAPI](server-openapi.md) 和 [SwaggerUI](server-swagger-ui.md) 外掛程式結合使用，以提供互動式 API 文件。

> OpenAPI Gradle 擴充套件需要 Kotlin 2.2.20。使用其他版本可能會導致編譯錯誤。
>
{style="note"}

## 新增相依性 {id="add-dependencies"}

* 若要啟用 OpenAPI 元資料產生功能，請將 Ktor 編譯器外掛程式套用至你的專案中。

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

    與 Gradle 不同，Maven 未針對 Ktor 編譯器外掛程式提供內建整合。若要啟用 OpenAPI 規格產生，你需要手動設定編譯器外掛程式。

    1. 套用 Ktor Maven 外掛程式（執行與封裝應用程式時所需）：
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
    2. 編譯器外掛程式必須以 JAR 檔案形式提供。新增以下設定以自動下載並將其複製到穩定位置：

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
  
    3. 設定 Kotlin 編譯器：

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

* 若要使用執行時期路由註解，請將 `%artifact_name%` 構件新增至你的建置指令碼中：

  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(%ktor_version_catalog_name%)"/>
          <note>
              上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
              Ktor version catalog</a> 來指定 Ktor 相依性。
          </note>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation %ktor_version_catalog_name%"/>
          <note>
              上述程式碼片段使用 <a href="server-dependencies.topic#using-version-catalog">
              Ktor version catalog</a> 來指定 Ktor 相依性。
          </note>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>

## 設定 OpenAPI 編譯器擴充套件 {id="configure-the-extension"}

OpenAPI 編譯器擴充套件控制如何在編譯期收集路由元資料。
它本身並不定義最終的 OpenAPI 文件。

在編譯期間，該外掛程式會產生 Kotlin 程式碼，這些程式碼利用 OpenAPI 執行時期 API 註冊從路由宣告、程式碼模式及註解中衍生出來的元資料。

一般的 OpenAPI 資訊（例如 API 標題、版本、伺服器、安全配置以及詳細的架構）是在執行時期[產生規格時](#generate-and-serve-the-specification)提供的。

若要設定編譯器外掛程式擴充套件，請在 <Path>build.gradle.kts</Path> 檔案中的 `ktor` 擴充套件內使用 `openApi {}` 區塊：

```kotlin
ktor {
    openApi {
        enabled = true
        codeInferenceEnabled = true
        onlyCommented = false
    }
}
```

### 設定選項 {id="configuration-options"}

<deflist>
<def>
<title><code>enabled</code></title>
啟用或停用 OpenAPI 路由註解程式碼產生。預設為 <code>false</code>。
</def>
<def>
<title><code>codeInferenceEnabled</code></title>
控制編譯器是否嘗試從路由程式碼推論 OpenAPI 元資料。預設為 <code>true</code>。
若推論產生了不正確的結果，或者你偏好使用註解明確定義元資料，請停用此選項。
如需更多詳細資訊，請參閱<a href="#code-inference">程式碼推論規則</a>。
</def>
<def>
<title><code>onlyCommented</code></title>
將元資料產生限制在包含註解（comment）標記的路由。預設為 <code>false</code>，這表示除了明確標記為 <code>@ignore</code> 的路由外，所有路由呼叫都會被處理。
</def>
</deflist>

### 路由結構分析 {id="routing-structure-analysis"}

Ktor 編譯器外掛程式會分析你的伺服器路由 DSL，以判斷 API 的結構外形。此分析僅基於路由宣告，不會檢查路由處理常式（route handlers）的內部內容。

以下內容會自動從路由 API 樹狀結構中的選擇器進行推論：
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

由於請求參數、主體與回應都是在路由 Lambda 運算式內部處理，編譯器無法僅從路由結構推論出完整的 OpenAPI 描述。為了豐富產生的元資料，Ktor 支援依據常見的請求處理模式進行[標註](#annotate-routes)和[自動推論](#code-inference)。

### 程式碼推論 {id="code-inference"}

啟用程式碼推論後，編譯器外掛程式能識別常見的 Ktor 使用模式，並自動產生等效的執行時期註解。

下表總結了支援的推論規則：

| 規則                | 說明                                                           | 輸入                                                                       | 輸出（來自 annotate 作用域）                                             |
|---------------------|----------------------------------------------------------------|----------------------------------------------------------------------------|--------------------------------------------------------------------------|
| Request Body        | 從 `ContentNegotiation` 讀取操作提供請求主體架構               | `call.receive<T>()`                                                        | `requestBody { schema = jsonSchema<T>() }`                               |
| Response Body       | 從 `ContentNegotiation` 寫入操作提供回應主體架構               | `call.respond<T>()`                                                        | `responses { HttpStatusCode.OK { schema = jsonSchema<T>() } }`           |
| Response Headers    | 包含自訂的回應標頭                                             | `call.response.header("X-Foo", "Bar")`                                     | `responses { HttpStatusCode.OK { headers { header("X-Foo", "Bar") } } }` |
| Path Parameters     | 尋找路徑參數參照                                               | `call.parameters["id"]`                                                    | `parameters { path("id") }`                                              |
| Query Parameters    | 尋找查詢參數參照                                               | `call.queryParameters["name"]`                                             | `parameters { query("name") }`                                           |
| Request Headers     | 尋找請求標頭參照                                               | `call.request.headers["X-Foo"]`                                            | `parameters { header("X-Foo") }`                                         |
| Resource API routes | 推論 Resources 路由 API 的呼叫結構                             | `call.get<List> { /**/ }; @Resource("/list") class List(val name: String)` | `parameters { query("name") }`                                           |

推論會盡可能跟隨已擷取（extracted）的函式，並嘗試針對典型的請求與回應流程產生一致的文件。

#### 為特定端點停用推論 {id="disable-inference-for-an-endpoint"}

如果推論為特定端點產生了不正確的元資料，你可以透過新增 `ignore` 標記來將其排除：

```kotlin
// ignore!
get("/comments") {
    // ...
}
```

## 為路由加上註解 {id="annotate-routes"}

為了豐富規格內容，Ktor 支援兩種為路由加上註解的方式：

- [基於註解（comment）的標記](#comment-annotations)，由編譯器外掛程式進行分析。
- [執行時期路由註解](#runtime-route-annotations)，使用 `.describe {}` DSL 進行定義。

你可以使用任一方法，或將兩者結合使用。

### 基於註解（comment）的路由標記 {id="comment-annotations"}

基於註解的標記可提供無法從程式碼推論的元資料，並能無縫整合至現有路由中。

元資料的定義方式為：在行首放置關鍵字，後接冒號（`:`）及其值。

你可以直接將註解附加至路由宣告：

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

#### 格式規則 {id="formatting-rules"}

- 關鍵字必須出現在行首。
- 冒號（`:`）用於分隔關鍵字與其值。
- 複數形式（例如 `Tags`、`Responses`）允許分組定義。
- 單數形式（例如 `Tag`、`Response`）亦受支援。
- 頂層項目符號（`-`）為選用，僅影響格式化。

以下變體均等效：

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

#### 支援的註解欄位 {id="supported-comment-fields"}

| 標籤           | 格式                                            | 說明                             |
|----------------|-------------------------------------------------|----------------------------------|
| `Tag`          | `Tag: name`                                     | 將端點歸類在標籤下               |
| `Path`         | `Path: [Type] name description`                 | 路徑參數                         |
| `Query`        | `Query: [Type] name description`                | 查詢參數                         |
| `Header`       | `Header: [Type] name description`               | 標頭參數                         |
| `Cookie`       | `Cookie: [Type] name description`               | Cookie 參數                      |
| `Body`         | `Body: contentType [Type] description`          | 請求主體                         |
| `Response`     | `Response: code contentType [Type] description` | 回應定義                         |
| `Deprecated`   | `Deprecated: reason`                            | 將端點標記為已棄用               |
| `Description`  | `Description: text`                             | 詳細說明                         |
| `Security`     | `Security: scheme`                              | 安全需求                         |
| `ExternalDocs` | `ExternalDocs: href`                            | 外部文件連結                     |

### 執行時期路由註解 {id="runtime-route-annotations"}

<primary-label ref="experimental"/>

在編譯期分析不足的情況下（例如使用動態路由、攔截器或條件邏輯時），你可以使用 `.describe {}` 擴充函式在執行時期直接將 OpenAPI 操作元資料附加到路由上。

每個加上註解的路由都定義了一個 OpenAPI [Operation 物件](https://swagger.io/specification/#operation-object)，它在產生的 OpenAPI 規格中代表單個 HTTP 操作（例如 `GET /users`）。
這些元資料會在執行時期附加到路由樹狀結構中，並供 OpenAPI 和 Swagger UI 外掛程式使用。

`.describe {}` DSL 直接對應到 OpenAPI 規格。屬性名稱與結構與 Operation 物件定義的欄位一致，包括參數、請求主體、回應、安全需求、伺服器、回呼（callback）以及規格擴充套件（`x-*`）。

執行時期路由註解 API 屬於實驗功能，需要使用 `@OptIn(ExperimentalKtorApi::class)` 宣告加入：

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

> 如需可用欄位的完整清單，請參閱 [OpenAPI 規格](https://swagger.io/specification/#operation-object)。
>
{style="tip"}

執行時期註解會與編譯器產生及基於註解（comment）的元資料合併。
當多個來源定義了相同的 OpenAPI 欄位時，執行時期註解提供的值具有[最高優先級](#metadata-precedence)。

## 在 OpenAPI 規格中隱藏路由 {id="hide-routes-from-the-openapi-specification"}

若要從產生的 OpenAPI 文件中排除某個路由及其子路由，請使用 `Route.hide()` 函式：

```kotlin
@OptIn(ExperimentalKtorApi::class)
get("/routes") {
    // ....
}.hide()
```

這對於不應公開的內部、管理或診斷端點非常有用，包括用於[產生 OpenAPI 規格](#assemble-and-serve-the-specification)本身的路由。

OpenAPI 與 Swagger UI 外掛程式會自動呼叫 `.hide()`，因此其路由會自動從產生的文件中排除。

## 架構推論 {id="schema-inference"}

在建置 OpenAPI 規格時，Ktor 會自動為請求與回應型別產生 JSON 架構。預設情況下，架構是透過資料類別（data class）上的 `kotlinx-serialization` 描述元從型別參照推論而來。這讓大多數常見的資料模型無需額外設定即可完成文件化。

### 使用註解自訂架構 {id="customize-schemas-with-annotations"}

你可以透過在資料類別中新增 [`@JsonSchema`](https://api.ktor.io/ktor-openapi-schema/io.ktor.openapi/-json-schema/index.html) 註解，來覆寫自動產生的 JSON 架構欄位。這讓你可以新增描述、將屬性標記為必填等：

```kotlin
@JsonSchema.Description("Represents a news article")
data class Article(
    val title: String,
    val content: String
)
```

### 使用基於反射的架構推論 {id="use-reflection-based-schema-inference"}

對於使用 Jackson 或 Gson 代替 `kotlinx-serialization` 的專案，可以使用基於反射的架構推論。若要這麼做，請在 OpenAPI 或 SwaggerUI 外掛程式的 `Routing` 來源中設定 `schemaInference` 欄位：

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

### 自訂反射行為 {id="customize-reflection-behavior"}

你可以提供自訂的 `SchemaReflectionAdapter` 來處理未直接支援的註解或命名慣例。

`SchemaReflectionAdapter` 是 `ReflectionJsonSchemaInference` 的一個欄位，它允許你覆寫預設行為，例如屬性名稱、忽略的欄位或可 null 性規則。

例如，你可以自訂行為以支援 Gson 的 `@SerializedName` 註解：

```kotlin
ReflectionJsonSchemaInference(object : SchemaReflectionAdapter {
    override fun getName(type: KType): String? {
        return (type.classifier as? KClass<*>)?.let {
            findAnnotations(SerializedName::class)?.value ?: it.simpleName
        }
    }
})
```

### 提供自訂架構 {id="custom-schemas"}

如果自動架構推論或註解不足以滿足需求，你可以使用 [`JsonSchema`](https://api.ktor.io/ktor-openapi-schema/io.ktor.openapi/-json-schema/index.html) 類別手動建構 JSON 架構。

這讓你可以明確定義所有支援的架構屬性，例如型別、格式、巢狀結構，或是用於類元組陣列定義的高階結構（如 `prefixItems`）。

如需可用屬性的完整清單，請參閱 [`JsonSchema` API 文件](https://api.ktor.io/ktor-openapi-schema/io.ktor.openapi/-json-schema/index.html)。

## 產生並提供規格 {id="generate-and-serve-the-specification"}

OpenAPI 規格是在執行時期透過執行時期路由註解以及編譯器外掛程式產生的元資料組合而成。

你可以透過以下方式公開規格：

- [手動組合並提供 OpenAPI 文件](#assemble-and-serve-the-specification)。
- 使用 [OpenAPI](server-openapi.md) 或 [SwaggerUI](server-swagger-ui.md) 外掛程式提供規格及互動式文件。

### 組合並提供規格 {id="assemble-and-serve-the-specification"}

若要在執行時期組合完整的 OpenAPI 文件，請建立一個 `OpenApiDoc` 執行個體，並提供應包含在規格中的路由。

該文件由編譯器產生的元資料以及來自路由樹狀結構的執行時期路由註解組合而成。產生的 `OpenApiDoc` 執行個體將始終反映應用程式的當前狀態。

通常你會在路由處理常式中建構該文件並直接回應：

```kotlin

        get("/docs.json") {
            val doc = OpenApiDoc(info = OpenApiInfo("My API", "1.0")) + call.application.routingRoot.descendants()
            call.respond(doc)
```

在此範例中，OpenAPI 文件使用 [`ContentNegotiation`](server-serialization.md) 外掛程式進行序列化。這假定已安裝了 JSON 序列化程式（例如 `kotlinx.serialization`）。

無需額外的建置或產生步驟。對路由或註解的變更將在下一次請求規格時自動反映。

> 如果你希望使序列化明確化，或避免依賴 `ContentNegotiation`，可以手動對文件進行編碼並傳回 JSON：
> 
> ```kotlin
> call.respondText(
>   Json.encodeToString(docs),
>   ContentType.Application.Json
> )
>```
>
{style="note"}

### 提供互動式文件 {id="serve-interactive-documentation"}

若要透過互動式 UI 公開 OpenAPI 規格，請使用 [OpenAPI](server-openapi.md) 和 [Swagger UI](server-swagger-ui.md) 外掛程式。

這兩個外掛程式均在執行時期組合規格，並可直接從路由樹狀結構讀取元資料。
它們的差別在於文件的呈現方式：
- OpenAPI 外掛程式在伺服器端轉譯文件，並提供預先產生的 HTML。
- Swagger UI 外掛程式以 JSON 或 YAML 格式提供 OpenAPI 規格，並在瀏覽器中使用 Swagger UI 轉譯 UI。

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

### 元資料優先順序 {id="metadata-precedence"}

最終的 OpenAPI 規格是在執行時期透過合併來自多個來源的元資料組合而成。

各來源依下列順序依序套用：

1. 編譯器產生的元資料，包括：
    - [路由結構分析](#routing-structure-analysis)
    - [程式碼推論](#code-inference)
2. [基於註解（comment）的路由標記](#comment-annotations)
3. [執行時期路由註解](#runtime-route-annotations)

當多個來源定義了相同的 OpenAPI 欄位時，執行時期註解所提供的值優先於基於註解的標記和編譯器產生的元資料。

未被明確覆寫的元資料將被保留並合併到最終文件中。