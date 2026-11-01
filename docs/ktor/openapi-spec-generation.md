[//]: # (title: OpenAPI 规范生成)

<show-structure for="chapter" depth="2"/>
<secondary-label ref="server-feature"/>

<var name="artifact_name" value="ktor-server-routing-openapi"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.routingOpenapi"/>
<var name="package_name" value="io.ktor.server.routing.openapi"/>

<tldr>
<p>
<b>必需依赖项</b>：<code>io.ktor:%artifact_name%</code>
</p>
<p>
<b>代码示例</b>：
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/openapi-spec-gen">
    openapi-spec-gen
</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/openapi-spec-gen-maven">
    openapi-spec-gen-maven
</a>
</p>
</tldr>

Ktor 支持在运行时从一个或多个文档源构建 OpenAPI 规范。

此功能可通过以下方式提供：
* OpenAPI 编译器扩展程序（包含在 Ktor Gradle 插件中），它在编译时分析路由代码，并生成在运行时注册 OpenAPI 元数据的 Kotlin 代码。
* 路由注解运行时 API，它在运行中的应用程序中直接将 OpenAPI 元数据附加到路由。

你可以使用其中之一或两者兼顾，并将其与 [OpenAPI](server-openapi.md) 和 [SwaggerUI](server-swagger-ui.md) 插件结合使用，以提供交互式 API 文档服务。

> OpenAPI Gradle 扩展程序需要 Kotlin 2.2.20。使用其他版本可能会导致编译错误。
>
{style="note"}

## 添加依赖项 {id="add-dependencies"}

* 要启用 OpenAPI 元数据生成，请将 Ktor 编译器插件应用于你的项目。

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

    与 Gradle 不同，Maven 未针对 Ktor 编译器插件提供内置集成。要启用 OpenAPI 规范生成，你需要手动配置编译器插件。

    1. 应用 Ktor Maven 插件（运行和打包应用程序所必需）：
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
    2. 编译器插件必须以 JAR 文件形式提供。添加以下配置以自动下载并将其复制到稳定位置：

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
  
    3. 配置 Kotlin 编译器：

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

* 要使用运行时路由注解，请将 `%artifact_name%` 工件添加到你的构建脚本中：

  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(%ktor_version_catalog_name%)"/>
          <note>
              上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">Ktor 版本目录</a>来指定 Ktor 依赖项。
          </note>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation %ktor_version_catalog_name%"/>
          <note>
              上述代码段使用 <a href="server-dependencies.topic#using-version-catalog">Ktor 版本目录</a>来指定 Ktor 依赖项。
          </note>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>

## 配置 OpenAPI 编译器扩展程序 {id="configure-the-extension"}

OpenAPI 编译器扩展程序控制如何在编译时收集路由元数据。它本身并不定义最终的 OpenAPI 文档。

在编译期间，该插件会生成使用 OpenAPI 运行时 API 注册元数据的 Kotlin 代码，这些元数据派生自路由声明、代码模式和注释。

常规 OpenAPI 信息（例如 API 标题、版本、服务器、安全方案以及详细模式）会在[生成规范时](#generate-and-serve-the-specification)在运行时提供。

要配置编译器插件扩展程序，请使用 <Path>build.gradle.kts</Path> 文件中 `ktor` 扩展内的 `openApi {}` 代码块：

```kotlin
ktor {
    openApi {
        enabled = true
        codeInferenceEnabled = true
        onlyCommented = false
    }
}
```

### 配置选项 {id="configuration-options"}

<deflist>
<def>
<title><code>enabled</code></title>
启用或禁用 OpenAPI 路由注解代码生成。默认值为 <code>false</code>。
</def>
<def>
<title><code>codeInferenceEnabled</code></title>
控制编译器是否尝试从路由代码推断 OpenAPI 元数据。默认值为 <code>true</code>。如果推断产生了不正确的结果，或者你倾向于使用注解显式定义元数据，请禁用此选项。有关更多详情，请参阅<a href="#code-inference">代码推断规则</a>。
</def>
<def>
<title><code>onlyCommented</code></title>
将元数据生成限制为包含注释注解的路由。默认值为 <code>false</code>，意味着除显式标记为 <code>@ignore</code> 的路由外，将处理所有路由调用。
</def>
</deflist>

### 路由结构分析 {id="routing-structure-analysis"}

Ktor 编译器插件会分析你的服务器路由 DSL，以确定 API 的结构形态。该分析仅基于路由声明，不会检查路由处理程序的内容。

以下内容会自动从路由 API 树中的选择器推断出来：
- 合并后的路径（例如 `/api/v1/users/{id}`）。
- HTTP 方法（例如 `GET` 和 `POST`）。
- 路径形参。

```kotlin
routing {
    route("/api/v1") {
        get("/users") { }
        get("/users/{id}") { }
        post("/users") { }
    }
}
```

由于请求形参、请求体和响应都是在路由 lambda 表达式内部处理的，因此编译器无法仅凭路由结构推断出完整的 OpenAPI 描述。为了丰富生成的元数据，Ktor 支持基于常见请求处理模式的[注解](#annotate-routes)和[自动推断](#code-inference)。

### 代码推断 {id="code-inference"}

启用代码推断后，编译器插件会识别常见的 Ktor 使用模式并自动生成等效的运行时注解。

下表总结了支持的推断规则：

| 规则 | 说明 | 输入 | 输出（来自 annotate 作用域） |
|---------------------|----------------------------------------------------------------|----------------------------------------------------------------------------|--------------------------------------------------------------------------|
| 请求体 (Request Body) | 从 `ContentNegotiation` 读取操作中提供请求体模式 (schema) | `call.receive<T>()` | `requestBody { schema = jsonSchema<T>() }` |
| 响应体 (Response Body) | 从 `ContentNegotiation` 写入操作中提供响应体模式 (schema) | `call.respond<T>()` | `responses { HttpStatusCode.OK { schema = jsonSchema<T>() } }` |
| 响应标头 (Response Headers) | 为响应包含自定义标头 | `call.response.header("X-Foo", "Bar")` | `responses { HttpStatusCode.OK { headers { header("X-Foo", "Bar") } } }` |
| 路径形参 (Path Parameters) | 查找路径形参引用 | `call.parameters["id"]` | `parameters { path("id") }` |
| 查询形参 (Query Parameters) | 查找查询形参引用 | `call.queryParameters["name"]` | `parameters { query("name") }` |
| 请求标头 (Request Headers) | 查找请求标头引用 | `call.request.headers["X-Foo"]` | `parameters { header("X-Foo") }` |
| Resource API 路由 (Resource API routes) | 推断 Resources 路由 API 的调用结构 | `call.get<List> { /**/ }; @Resource("/list") class List(val name: String)` | `parameters { query("name") }` |

推断会尽可能跟踪提取的函数，并尝试为典型的请求和响应流程生成一致的文档。

#### 禁用端点的推断 {id="disable-inference-for-an-endpoint"}

如果推断为特定端点生成了不正确的元数据，你可以通过添加 `ignore` 标记来排除它：

```kotlin
// ignore!
get("/comments") {
    // ...
}
```

## 注解路由 {id="annotate-routes"}

为了丰富规范内容，Ktor 支持两种注解路由的方式：

- 基于注释的注解（[Comment-based annotations](#comment-annotations)），由编译器插件进行分析。
- 运行时路由注解（[Runtime route annotations](#runtime-route-annotations)），使用 `.describe {}` DSL 定义。

你可以使用其中一种方法，也可以两者结合使用。

### 基于注释的路由注解 {id="comment-annotations"}

基于注释的注解提供了无法从代码中推断的元数据，并能与现有路由无缝集成。

元数据是通过在行首放置关键字，后跟冒号（`:`）及其值来定义的。

你可以将注释直接附加到路由声明上：

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

#### 格式设置规则 {id="formatting-rules"}

- 关键字必须出现在行首。
- 冒号（`:`）用于分隔关键字与其值。
- 复数形式（例如 `Tags`、`Responses`）允许分组定义。
- 同样支持单数形式（例如 `Tag`、`Response`）。
- 顶级项目符号（`-`）是可选的，仅影响格式设置。

以下变体是等效的：

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

#### 支持的注释字段 {id="supported-comment-fields"}

| 标记 | 格式 | 说明 |
|----------------|-------------------------------------------------|----------------------------------|
| `Tag` | `Tag: name` | 将端点归组到标签下 |
| `Path` | `Path: [Type] name description` | 路径形参 |
| `Query` | `Query: [Type] name description` | 查询形参 |
| `Header` | `Header: [Type] name description` | 请求头形参 |
| `Cookie` | `Cookie: [Type] name description` | Cookie 形参 |
| `Body` | `Body: contentType [Type] description` | 请求体 |
| `Response` | `Response: code contentType [Type] description` | 响应定义 |
| `Deprecated` | `Deprecated: reason` | 将端点标记为已弃用 |
| `Description` | `Description: text` | 扩展说明 |
| `Security` | `Security: scheme` | 安全要求 |
| `ExternalDocs` | `ExternalDocs: href` | 外部文档链接 |

### 运行时路由注解 {id="runtime-route-annotations"}

<primary-label ref="experimental"/>

如果编译时分析不够充分（例如使用动态路由、拦截器或条件逻辑时），可以使用 `.describe {}` 扩展函数在运行时将 OpenAPI 操作元数据直接附加到路由。

每个带有注解的路由都会定义一个 OpenAPI [Operation 对象 (Operation object)](https://swagger.io/specification/#operation-object)，该对象在生成的 OpenAPI 规范中表示单个 HTTP 操作（例如 `GET /users`）。元数据在运行时附加到路由树，并供 OpenAPI 和 Swagger UI 插件使用。

`.describe {}` DSL 直接映射到 OpenAPI 规范。属性名称和结构对应于为 Operation 对象定义的字段，包括形参、请求体、响应、安全要求、服务器、回调以及规范扩展（`x-*`）。

运行时路由注解 API 处于实验性阶段，需要使用 `@OptIn(ExperimentalKtorApi::class)` 进行选择加入：

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

> 有关可用字段的完整列表，请参阅 [OpenAPI 规范](https://swagger.io/specification/#operation-object)。
>
{style="tip"}

运行时注解会与编译器生成的元数据和基于注释的元数据合并。当同一 OpenAPI 字段由多个源定义时，运行时注解提供的值具有[最高优先级](#metadata-precedence)。

## 在 OpenAPI 规范中隐藏路由 {id="hide-routes-from-the-openapi-specification"}

要从生成的 OpenAPI 文档中排除某个路由及其子路由，请使用 `Route.hide()` 函数：

```kotlin
@OptIn(ExperimentalKtorApi::class)
get("/routes") {
    // ....
}.hide()
```

这对于不应公开发布的内部、管理或诊断端点非常有用，包括用于[生成 OpenAPI 规范](#assemble-and-serve-the-specification)本身的路由。

OpenAPI 和 Swagger UI 插件会自动调用 `.hide()`，因此它们的路由会被排除在生成的文档之外。

## 模式推断 {id="schema-inference"}

在构建 OpenAPI 规范时，Ktor 会自动为请求和响应类型生成 JSON 模式 (JSON schema)。默认情况下，模式是从数据类上使用 `kotlinx-serialization` 描述符的类型引用推断出来的。这样无需额外工作即可为大多数常见数据模型生成文档。

### 使用注解自定义模式 {id="customize-schemas-with-annotations"}

你可以通过向数据类添加 [`@JsonSchema`](https://api.ktor.io/ktor-openapi-schema/io.ktor.openapi/-json-schema/index.html) 注解来重写自动生成的 JSON 模式字段。这允许你添加说明、将属性标记为必需等：

```kotlin
@JsonSchema.Description("Represents a news article")
data class Article(
    val title: String,
    val content: String
)
```

### 使用基于反射的模式推断 {id="use-reflection-based-schema-inference"}

对于使用 Jackson 或 Gson 而非 `kotlinx-serialization` 的项目，你可以使用基于反射的模式推断。为此，请在 OpenAPI 或 SwaggerUI 插件的 `Routing` 源中设置 `schemaInference` 字段：

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

### 自定义反射行为 {id="customize-reflection-behavior"}

你可以提供自定义的 `SchemaReflectionAdapter` 来处理未直接支持的注解或命名约定。

`SchemaReflectionAdapter` 是 `ReflectionJsonSchemaInference` 的一个字段，它允许你重写默认行为，例如属性名称、忽略的字段或为 null 性规则。

例如，你可以自定义行为以支持 Gson 的 `@SerializedName` 注解：

```kotlin
ReflectionJsonSchemaInference(object : SchemaReflectionAdapter {
    override fun getName(type: KType): String? {
        return (type.classifier as? KClass<*>)?.let {
            findAnnotations(SerializedName::class)?.value ?: it.simpleName
        }
    }
})
```

### 提供自定义模式 {id="custom-schemas"}

如果自动模式推断或注解无法满足需求，可以使用 [`JsonSchema`](https://api.ktor.io/ktor-openapi-schema/io.ktor.openapi/-json-schema/index.html) 类手动构建 JSON 模式。

这允许你显式定义所有受支持的模式属性，例如类型、格式、嵌套结构，或诸如针对类元组数组定义的 `prefixItems` 等高级构造。

有关可用属性的完整列表，请参阅 [`JsonSchema` API 文档](https://api.ktor.io/ktor-openapi-schema/io.ktor.openapi/-json-schema/index.html)。

## 生成并提供规范服务 {id="generate-and-serve-the-specification"}

OpenAPI 规范是在运行时根据运行时路由注解和编译器插件生成的元数据组装而成的。

你可以通过以下方式公开该规范：

- [手动组装并提供 OpenAPI 文档服务](#assemble-and-serve-the-specification)。
- 使用 [OpenAPI](server-openapi.md) 或 [SwaggerUI](server-swagger-ui.md) 插件来提供规范和交互式文档服务。

### 组装并提供规范服务 {id="assemble-and-serve-the-specification"}

要在运行时组装完整的 OpenAPI 文档，请创建一个 `OpenApiDoc` 实例，并提供应包含在规范中的路由。

文档是根据编译器生成的元数据以及来自路由树的运行时路由注解组装的。生成的 `OpenApiDoc` 实例始终反映应用程序的当前状态。

通常，你可以在路由处理程序中构建文档并直接返回它：

```kotlin

        get("/docs.json") {
            val doc = OpenApiDoc(info = OpenApiInfo("My API", "1.0")) + call.application.routingRoot.descendants()
            call.respond(doc)
```

在此示例中，OpenAPI 文档使用 [`ContentNegotiation`](server-serialization.md) 插件进行序列化。这假设已安装 JSON 序列化器（例如 `kotlinx.serialization`）。

无需额外的构建或生成步骤。路由或注解的更改会在下次请求规范时自动反映出来。

> 如果你希望使序列化更加显式，或者避免依赖 `ContentNegotiation`，可以手动对文档进行编码并返回 JSON：
> 
> ```kotlin
> call.respondText(
>   Json.encodeToString(docs),
>   ContentType.Application.Json
> )
>```
>
{style="note"}

### 提供交互式文档服务 {id="serve-interactive-documentation"}

要通过交互式 UI 公开 OpenAPI 规范，请使用 [OpenAPI](server-openapi.md) 和 [Swagger UI](server-swagger-ui.md) 插件。

这两个插件都在运行时组装规范，并可以直接从路由树中读取元数据。它们在呈现文档的方式上有所不同：
- OpenAPI 插件在服务器上呈现文档，并提供预生成的 HTML 服务。
- Swagger UI 插件将 OpenAPI 规范作为 JSON 或 YAML 提供，并使用 Swagger UI 在浏览器中呈现 UI。

```kotlin
// Serves the OpenAPI UI
openAPI("/openApi")

// Serves the Swagger UI
swaggerUI("/swaggerUI") {
    info = OpenApiInfo("My API", "1.0")
    source = OpenApiDocSource.Routing(
        contentType = ContentType.Application.Json,
    )
}
```

### 元数据优先级 {id="metadata-precedence"}

最终的 OpenAPI 规范是在运行时通过合并来自多个源的元数据组装而成的。

按顺序应用以下来源：

1. 编译器生成的元数据，包括：
    - [路由结构分析](#routing-structure-analysis)
    - [代码推断](#code-inference)
2. [基于注释的路由注解](#comment-annotations)
3. [运行时路由注解](#runtime-route-annotations)

当同一 OpenAPI 字段由多个源定义时，运行时注解提供的值优先于基于注释的注解和编译器生成的元数据。

未显式重写的元数据将被保留并合并到最终文档中。