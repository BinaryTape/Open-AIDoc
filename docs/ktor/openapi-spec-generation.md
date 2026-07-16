[//]: # (title: OpenAPI 规范生成)

<show-structure for="chapter" depth="2"/>
<secondary-label ref="server-feature"/>

<var name="artifact_name" value="ktor-server-routing-openapi"/>
<var name="package_name" value="io.ktor.server.routing.openapi"/>

<tldr>
<p>
<b>必要依赖项</b>：<code>io.ktor:%artifact_name%</code>
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

该功能通过以下方式提供：
* **OpenAPI 编译器扩展**（包含在 Ktor Gradle 插件中）：在编译时分析路由代码，并生成在运行时注册 OpenAPI 元数据的 Kotlin 代码。
* **路由注解运行时 API**：在运行中的应用程序中将 OpenAPI 元数据直接附加到路由。

您可以单独使用其中之一，也可以两者结合使用，并配合 [OpenAPI](server-openapi.md) 和 [SwaggerUI](server-swagger-ui.md) 插件来提供交互式 API 文档。

> OpenAPI Gradle 扩展需要 Kotlin 2.2.20。使用其他版本可能会导致编译错误。
>
{style="note"}

## 添加依赖项

* 要启用 OpenAPI 元数据生成，请在您的项目中应用 Ktor 编译器插件。

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

    与 Gradle 不同，Maven 不提供对 Ktor 编译器插件的内置集成。要启用 OpenAPI 规范生成，您需要手动配置编译器插件。

    1. 应用 Ktor Maven 插件（运行和打包应用程序所需）：
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
    2. 编译器插件必须以 JAR 文件形式可用。添加以下配置以自动下载并将其复制到稳定的位置：

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

* 要使用运行时路由注解，请将 `%artifact_name%` 构件添加到您的构建脚本中：

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

## 配置 OpenAPI 编译器扩展 {id="configure-the-extension"}

OpenAPI 编译器扩展控制在编译时如何收集路由元数据。它本身并不定义最终的 OpenAPI 文档。

在编译期间，该插件会生成 Kotlin 代码，这些代码使用 OpenAPI 运行时 API 来注册从路由声明、代码模式和注释中派生出的元数据。

通用的 OpenAPI 信息——如 API 标题、版本、服务器、安全方案和详细架构——是在[生成规范时](#generate-and-serve-the-specification)于运行时提供的。

要配置编译器插件扩展，请在 <Path>build.gradle.kts</Path> 文件的 `ktor` 扩展内使用 `openApi {}` 块：

```kotlin
ktor {
    openApi {
        enabled = true
        codeInferenceEnabled = true
        onlyCommented = false
    }
}
```

### 配置选项

<deflist>
<def>
<title><code>enabled</code></title>
启用或禁用 OpenAPI 路由注解代码生成。默认为 <code>false</code>。
</def>
<def>
<title><code>codeInferenceEnabled</code></title>
控制编译器是否尝试从路由代码中推断 OpenAPI 元数据。默认为 <code>true</code>。如果推断产生的结果不正确，或者您更倾向于使用注解显式定义元数据，请禁用此选项。更多详情请参阅 <a href="#code-inference">代码推断规则</a>。
</def>
<def>
<title><code>onlyCommented</code></title>
将元数据生成限制为包含注释注解的路由。默认为 <code>false</code>，意味着除了显式标记为 <code>@ignore</code> 的调用外，所有路由调用都会被处理。
</def>
</deflist>

### 路由结构分析

Ktor 编译器插件会分析您的服务器路由 DSL 以确定 API 的结构形状。此分析仅基于路由声明，不会检查路由处理程序的内容。

以下内容会自动从路由 API 树的选择器中推断出来：
- 合并后的路径（例如 `/api/v1/users/{id}`）。
- HTTP 方法（如 `GET` 和 `POST`）。
- 路径参数。

```kotlin
routing {
    route("/api/v1") {
        get("/users") { }
        get("/users/{id}") { }
        post("/users") { }
    }
}
```

由于请求参数、请求体和响应是在路由 lambda 内部处理的，因此编译器无法仅凭路由结构推断出完整的 OpenAPI 描述。为了丰富生成的元数据，Ktor 支持基于常见请求处理模式的[注解](#annotate-routes)和[自动推断](#code-inference)。

### 代码推断

当启用代码推断时，编译器插件会识别常见的 Ktor 使用模式并自动生成等效的运行时注解。

下表总结了支持的推断规则：

| 规则 | 描述 | 输入 | 输出（来自注解作用域） |
|---------------------|----------------------------------------------------------------|----------------------------------------------------------------------------|--------------------------------------------------------------------------|
| 请求体 | 从 `ContentNegotiation` 读取操作中提供请求体架构 | `call.receive<T>()` | `requestBody { schema = jsonSchema<T>() }` |
| 响应体 | 从 `ContentNegotiation` 写入操作中提供响应体架构 | `call.respond<T>()` | `responses { HttpStatusCode.OK { schema = jsonSchema<T>() } }` |
| 响应头 | 包含响应的自定义标头 | `call.response.header("X-Foo", "Bar")` | `responses { HttpStatusCode.OK { headers { header("X-Foo", "Bar") } } }` |
| 路径参数 | 查找路径参数引用 | `call.parameters["id"]` | `parameters { path("id") }` |
| 查询参数 | 查找查询参数引用 | `call.queryParameters["name"]` | `parameters { query("name") }` |
| 请求头 | 查找请求头引用 | `call.request.headers["X-Foo"]` | `parameters { header("X-Foo") }` |
| Resource API 路由 | 推断 Resources 路由 API 的调用结构 | `call.get<List> { /**/ }; @Resource("/list") class List(val name: String)` | `parameters { query("name") }` |

推断会尽可能跟踪提取的函数，并尝试为典型的请求和响应流程生成一致的文档。

#### 为端点禁用推断

如果推断为特定端点生成了错误的元数据，您可以通过添加 `ignore` 标记来排除它：

```kotlin
// ignore!
get("/comments") {
    // ...
}
```

## 为路由添加注解 {id="annotate-routes"}

为了丰富规范内容，Ktor 支持两种路由注解方式：

- [基于注释的注解](#comment-annotations)，由编译器插件分析。
- [运行时路由注解](#runtime-route-annotations)，使用 `.describe {}` DSL 定义。

您可以采用其中任一方式，也可以将两者结合。

### 基于注释的路由注解 {id="comment-annotations"}

基于注释的注解提供了无法从代码中推断的元数据，并能与现有路由无缝集成。

元数据的定义方式是在行首放置一个关键字，后跟冒号（`:`）及其值。

您可以直接在路由声明上附加注释：

```kotlin
/**
 * 获取 ID 对应的单个用户。
 *
 * Path: id [ULong] 用户 ID
 *
 * Responses:
 *   – 400 ID 参数格式错误或缺失。
 *   – 404 给定 ID 对应的用户不存在。
 *   – 200 [User] 找到的给定 ID 对应的用户。
 */
get("/{id}") {
    val id = call.parameters["id"]?.toULongOrNull()
        ?: return@get call.respond(HttpStatusCode.BadRequest)
    val user = list.find { it.id == id }
        ?: return@get call.respond(HttpStatusCode.NotFound)
    call.respond(user)
}
```

#### 格式规则

- 关键字必须出现在行首。
- 冒号（`:`）将关键字与其值分隔开。
- 复数形式（例如 `Tags`、`Responses`）允许分组定义。
- 单数形式（例如 `Tag`、`Response`）同样受支持。
- 顶层项目符号（`-`）是可选的，仅影响格式设置。

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

#### 支持的注释字段

| 标签 | 格式 | 描述 |
|----------------|-------------------------------------------------|----------------------------------|
| `Tag` | `Tag: name` | 将端点归入某个标签组 |
| `Path` | `Path: [Type] name description` | 路径参数 |
| `Query` | `Query: [Type] name description` | 查询参数 |
| `Header` | `Header: [Type] name description` | 请求头参数 |
| `Cookie` | `Cookie: [Type] name description` | Cookie 参数 |
| `Body` | `Body: contentType [Type] description` | 请求体 |
| `Response` | `Response: code contentType [Type] description` | 响应定义 |
| `Deprecated` | `Deprecated: reason` | 将端点标记为已弃用 |
| `Description` | `Description: text` | 详细描述 |
| `Security` | `Security: scheme` | 安全要求 |
| `ExternalDocs` | `ExternalDocs: href` | 外部文档链接 |

### 运行时路由注解 {id="runtime-route-annotations"}

<primary-label ref="experimental"/>

在编译时分析不足的情况下，例如使用动态路由、拦截器或条件逻辑时，您可以使用 `.describe {}` 扩展函数在运行时将 OpenAPI 操作元数据直接附加到路由。

每个添加了注解的路由都定义了一个 OpenAPI [操作对象 (Operation object)](https://swagger.io/specification/#operation-object)，它代表生成的 OpenAPI 规范中的单个 HTTP 操作（例如 `GET /users`）。元数据在运行时附加到路由树，并由 OpenAPI 和 Swagger UI 插件使用。

`.describe {}` DSL 直接映射到 OpenAPI 规范。属性名称和结构与为操作对象定义的字段相对应，包括参数、请求体、响应、安全要求、服务器、回调和规范扩展（`x-*`）。

运行时路由注解 API 是实验性的，需要使用 `@OptIn(ExperimentalKtorApi::class)` 启用：

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
                    summary = "获取用户"
                    description = "检索用户列表。"
                    parameters {
                        query("q") {
                            description = "已编码的查询"
                            required = false
                        }
                    }
                    responses {
                        HttpStatusCode.OK {
                            description = "用户列表"
                            schema = jsonSchema<List<User>>()
                        }
                        HttpStatusCode.BadRequest {
                            description = "无效查询"
                            ContentType.Text.Plain()
                        }
                    }
                }
```

> 有关可用字段的完整列表，请参阅 [OpenAPI 规范](https://swagger.io/specification/#operation-object)。
>
{style="tip"}

运行时注解会与编译器生成的元数据以及基于注释的元数据合并。当同一个 OpenAPI 字段由多个来源定义时，运行时注解提供的值具有[最高优先级](#metadata-precedence)。

## 在 OpenAPI 规范中隐藏路由

要将某个路由及其子路由从生成的 OpenAPI 文档中排除，请使用 `Route.hide()` 函数：

```kotlin
@OptIn(ExperimentalKtorApi::class)
get("/routes") {
    // ....
}.hide()
```

这对于不应公开的内部、管理或诊断端点非常有用，包括用于[生成 OpenAPI 规范](#assemble-and-serve-the-specification)本身的路由。

OpenAPI 和 Swagger UI 插件会自动调用 `.hide()`，因此它们的路由会从生成的文档中排除。

## 架构推断

Ktor 在构建 OpenAPI 规范时会自动为请求和响应类型生成 JSON 架构。默认情况下，架构是从数据类上的 `kotlinx-serialization` 描述符通过类型引用推断出来的。这使得大多数常见数据模型无需额外工作即可被记录。

### 通过注解自定义架构

您可以通过在数据类中添加 [`@JsonSchema`](https://api.ktor.io/ktor-openapi-schema/io.ktor.openapi/-json-schema/index.html) 注解来覆盖自动生成的 JSON 架构字段。这允许您添加描述、将字段标记为必填等：

```kotlin
@JsonSchema.Description("表示一篇新闻文章")
data class Article(
    val title: String,
    val content: String
)
```

### 使用基于反射的架构推断

对于使用 Jackson 或 Gson 而非 `kotlinx-serialization` 的项目，您可以使用基于反射的架构推断。为此，请在 OpenAPI 或 SwaggerUI 插件的 `Routing` 源中设置 `schemaInference` 字段：

```kotlin
openAPI("docs") {
    outputPath = "docs/routes"
    info = OpenApiInfo("来自路由的 Books API", "1.0.0")
    source = OpenApiDocSource.Routing(
        contentType = ContentType.Application.Json,
        schemaInference = ReflectionJsonSchemaInference.Default,
    )
}
```

### 自定义反射行为

您可以提供一个自定义的 `SchemaReflectionAdapter` 来处理不被直接支持的注解或命名约定。

`SchemaReflectionAdapter` 是 `ReflectionJsonSchemaInference` 的一个字段，允许您覆盖默认行为，例如属性名称、忽略的字段或可为 null 性规则。

例如，您可以自定义行为以支持 Gson 的 `@SerializedName` 注解：

```kotlin
ReflectionJsonSchemaInference(object : SchemaReflectionAdapter {
    override fun getName(type: KType): String? {
        return (type.classifier as? `KClass<*>`)?.let {
            findAnnotations(SerializedName::class)?.value ?: it.simpleName
        }
    }
})
```

## 生成并提供规范

OpenAPI 规范在运行时根据运行时路由注解和编译器插件生成的元数据进行组装。

您可以通过以下方式公开规范：

- [手动组装并提供 OpenAPI 文档](#assemble-and-serve-the-specification)。
- 使用 [OpenAPI](server-openapi.md) 或 [SwaggerUI](server-swagger-ui.md) 插件来提供规范和交互式文档。

### 组装并提供规范

要在运行时组装完整的 OpenAPI 文档，请创建一个 `OpenApiDoc` 实例并提供应包含在规范中的路由。

文档是从编译器生成的元数据和路由树中的运行时路由注解组装而成的。生成的 `OpenApiDoc` 实例始终反映应用程序的当前状态。

您通常会在路由处理程序中构建文档并直接返回它：

```kotlin

        get("/docs.json") {
            val doc = OpenApiDoc(info = OpenApiInfo("My API", "1.0")) + call.application.routingRoot.descendants()
            call.respond(doc)
```

在此示例中，OpenAPI 文档使用 [`ContentNegotiation`](server-serialization.md) 插件进行序列化。这假定已安装 JSON 序列化程序（例如 `kotlinx.serialization`）。

无需额外的构建或生成步骤。路由或注解的更改将在下次请求规范时自动反映。

> 如果您想让序列化过程更加明确，或避免依赖 `ContentNegotiation`，您可以手动编码文档并响应 JSON：
> 
> ```kotlin
> call.respondText(
>   Json.encodeToString(docs),
>   ContentType.Application.Json
> )
>```
>
{style="note"}

### 提供交互式文档

要通过交互式 UI 公开 OpenAPI 规范，请使用 [OpenAPI](server-openapi.md) 和 [Swagger UI](server-swagger-ui.md) 插件。

这两个插件都在运行时组装规范，并能直接从路由树读取元数据。它们的区别在于文档的渲染方式：
- **OpenAPI 插件**在服务器上渲染文档并提供预生成的 HTML。
- **Swagger UI 插件**以 JSON 或 YAML 格式提供 OpenAPI 规范，并使用 Swagger UI 在浏览器中渲染 UI。

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

### 元数据优先级

最终的 OpenAPI 规范在运行时通过合并来自多个源的元数据来组装。

这些来源按以下顺序应用：

1. 编译器生成的元数据，包括：
    - [路由结构分析](#routing-structure-analysis)
    - [代码推断](#code-inference)
2. [基于注释的路由注解](#comment-annotations)
3. [运行时路由注解](#runtime-route-annotations)

当同一个 OpenAPI 字段由多个来源定义时，运行时注解提供的值优先级高于基于注释的注解和编译器生成的元数据。

未被显式覆盖的元数据将被保留并合并到最终文档中。