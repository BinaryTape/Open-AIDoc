[//]: # (title: Ktor 3.2.0 最新变化)

<show-structure for="chapter,procedure" depth="2"/>

_[发布日期：2025 年 6 月 12 日](releases.md#release-details)_

以下是此功能版本的高亮特性：

* [版本编目](#published-version-catalog)
* [依赖注入](#dependency-injection)
* [一等 HTMX 支持](#htmx-integration)
* [可挂起模块函数](#suspendable-module-functions)

## Ktor Server

### 可挂起模块函数

从 Ktor 3.2.0 开始，[应用程序模块](server-modules.md)支持可挂起函数。

> 随着挂起模块支持的引入，开发模式中的自动重载不再适用于阻塞函数引用。要了解更多信息，请参阅[开发模式自动重载回归](#regression)。
>
{style="warning"}

以前，在 Ktor 模块内部添加异步函数需要 `runBlocking` 块，这可能会导致服务器创建时出现死锁：

```kotlin
fun Application.installEvents() {
    val kubernetesConnection = runBlocking {
        connect(property<KubernetesConfig>("app.events"))
    }
}
```

现在您可以使用 `suspend` 关键字，从而在应用程序启动时运行异步代码：

```kotlin
suspend fun Application.installEvents() {
    val kubernetesConnection = connect(property<KubernetesConfig>("app.events"))
}
```

#### 并发模块加载

您还可以通过添加 `ktor.application.startup = concurrent` Gradle 属性来选择启用并发模块加载。它会独立启动所有应用程序模块，因此当一个模块挂起时，其他模块不会被阻塞。这允许依赖注入进行非顺序加载，在某些情况下可以加快加载速度。

要了解更多信息，请参阅[并发模块](server-modules.md#concurrent-modules)。

### 配置文件反序列化

Ktor 3.2.0 引入了类型化配置加载，在 `Application` 类上新增了 `.property()` 扩展。您现在可以将结构化配置部分直接反序列化为 Kotlin 数据类。

此功能简化了访问配置值的方式，并在处理嵌套或分组设置时显著减少了模板代码。

考虑以下 **application.yaml** 文件：

```yaml
database:
   url: "$DATABASE_URL:jdbc:postgresql://localhost:5432/postgres"
   username: "$DATABASE_USER:ktor_admin"
   password: "$DATABASE_PASSWORD:ktor123!"
```

以前，您必须单独检索每个配置值。使用新的 `.property()` 扩展，您可以一次性加载整个配置部分：

<compare>
<code-block lang="kotlin" code="data class DatabaseConfig(&#10;    val url: String,&#10;    val username: String,&#10;    val password: String? = null,&#10;)&#10;&#10;fun Application.module() {&#10;  val databaseConfig = DatabaseConfig(&#10;    url = environment.config.property(&quot;database.url&quot;).getString(),&#10;    username = environment.config.property(&quot;database.username&quot;).getString(),&#10;    password = environment.config.property(&quot;database.password&quot;).getString(),&#10;  )&#10;  // use configuration&#10;}"></code-block>
<code-block lang="kotlin" code="@Serializable &#10;data class DatabaseConfig(&#10;    val url: String,&#10;    val username: String,&#10;    val password: String? = null,&#10;)&#10;&#10;fun Application.module() {&#10;  val databaseConfig: DatabaseConfig = property(&quot;database&quot;)&#10;  // use configuration&#10;}"></code-block>
</compare>

此功能同时支持 HOCON 和 YAML 配置格式，并使用 `kotlinx.serialization` 进行反序列化。

### `ApplicationTestBuilder` 拥有可配置的 `client`

从 Ktor 3.2.0 开始，`ApplicationTestBuilder` 类中的 `client` 属性是可变的。以前它是只读的。此更改允许您配置自己的测试客户端，并在可以使用 `ApplicationTestBuilder` 类的任何地方重用它。例如，您可以从扩展函数内部访问客户端：

```kotlin
@Test
fun testRouteAfterAuthorization() = testApplication {
    // 预配置客户端
    client = createClient {
        install(ContentNegotiation) {
            json()
        }
            
        defaultRequest { 
            contentType(ContentType.Application.Json)
        }
    }

    // 提取到扩展函数中的可重用测试步骤
    auth(token = AuthToken("swordfish"))

    val response = client.get("/route")
    assertEquals(OK, response.status)
}

private fun ApplicationTestBuilder.auth(token: AuthToken) {
    val response = client.post("/auth") {
        setBody(token)
    }
    assertEquals(OK, response.status)
}
```

### 依赖注入

Ktor 3.2.0 引入了依赖注入 (DI) 支持，使直接通过配置文件和应用程序代码管理和组装依赖项变得更加容易。新的 DI 插件简化了依赖解析，支持异步加载，提供自动清理，并与测试顺利集成。

<var name="artifact_name" value="ktor-server-di" />

要使用 DI，请在构建脚本中包含 `%artifact_name%` 构件：

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

#### 基础依赖注册

您可以使用 lambda、函数引用或构造函数引用来注册依赖项：

```kotlin
dependencies {
  // 基于 lambda
  provide<GreetingService> { GreetingServiceImpl() }

  // 函数引用
  provide<GreetingService>(::GreetingServiceImpl)
  provide(BankServiceImpl::class)
  provide(::createBankTeller)

  // 将 lambda 注册为依赖项
  provide<() -> GreetingService> { { GreetingServiceImpl() } }
}
```

#### 基于配置的依赖注册

您可以使用配置文件中的类路径引用声明式地配置依赖项。这支持函数和类引用：

```yaml
# application.yaml
ktor:
  application:
    dependencies:
      - com.example.RepositoriesKt.provideDatabase
      - com.example.UserRepository
database:
  connectionUrl: postgres://localhost:3037/admin
```

```kotlin
// Repositories.kt
fun provideDatabase(@Property("database.connectionUrl") connectionUrl: String): Database =
  PostgresDatabase(connectionUrl)

class UserRepository(val db: Database) {
  // 实现 
}
```

实参会通过 `@Property` 和 `@Named` 等注解自动解析。

#### 依赖解析与注入

##### 解析依赖项

要解析依赖项，您可以使用属性委托或直接解析：

```kotlin
// 使用属性委托
val service: GreetingService by dependencies

// 直接解析
val service = dependencies.resolve<GreetingService>()
```

##### 异步依赖解析

为了支持异步加载，您可以使用挂起函数：

```kotlin
suspend fun Application.installEvents() {
  val kubernetesConnection = dependencies.resolve() // 挂起直到提供
}

suspend fun Application.loadEventsConnection() {
  dependencies.provide {
    connect(property<KubernetesConfig>("app.events"))
  }
}
```

DI 插件将自动挂起 `resolve()` 调用，直到所有依赖项准备就绪。

##### 注入到应用程序模块

您可以通过指定模块形参直接将依赖项注入到应用程序模块中。Ktor 将从 DI 容器中解析它们：

```yaml
ktor:
  application:
    dependencies:
      - com.example.PrintStreamProviderKt
    modules:
      - com.example.LoggingKt.logging
```

```kotlin
fun Application.logging(printStreamProvider: () -> PrintStream) {
    dependencies {
        provide<Logger> { SimpleLogger(printStreamProvider()) }
    }
}
```

使用 `@Named` 注入特定键值的依赖项：

```kotlin
fun Application.userRepository(@Named("mongo") database: Database) {
    // 使用名为 "mongo" 的依赖项
}
```

##### 属性与配置注入

使用 `@Property` 直接注入配置值：

```yaml
connection:
  domain: api.example.com
  path: /v1
  protocol: https
```

```kotlin
val connection: Connection = application.property("connection")
```

这简化了处理结构化配置的工作，并支持基本类型的自动解析。

要了解更多信息和高级用法，请参阅[依赖注入](server-dependency-injection.md)。

### 在 `testApplication` 中访问应用程序实例

现在您可以使用 `ApplicationTestBuilder.application` 属性直接从 `testApplication {}` 块访问运行中的 `Application` 实例。

以前，`Application` 实例仅在嵌套的 `application {}` 配置块内可用，这使得以后在测试中引用应用程序变得困难。新的 `application` 属性在配置和启动后公开同一个实例。

以下示例使用 `application` 属性断言已安装插件：

```kotlin
@Test
fun testAccessApplicationInstance() = testApplication {
    // 配置应用程序
    application {
        install(CORS)
    }

    // 确保应用程序已启动
    startApplication()

    // 从测试中访问同一个 Application 实例
    val app: Application = application

    assertTrue(app.pluginOrNull(CORS) != null)
}
```

### 开发模式自动重载回归 {id="regression"}

作为支持挂起函数的副作用，阻塞函数引用 (`Application::myModule`) 现在在转换过程中被包装到匿名内部类中。这破坏了自动重载，因为函数名称不再作为稳定引用保留。

这意味着 `development` 模式下的自动重载仅适用于挂起函数模块和配置引用：

```kotlin
// 挂起函数引用
embeddedServer(Netty, port = 8080, module = Application::mySuspendModule)

// 配置引用
ktor {
    application {
        modules = [ com.example.ApplicationKt.mySuspendModule ]
    }
}
```

## Ktor Client

### `SaveBodyPlugin` 与 `HttpRequestBuilder.skipSavingBody()` 已弃用

在 Ktor 3.2.0 之前，`SaveBodyPlugin` 是默认安装的。它将整个响应体缓存到内存中，允许多次访问。为了避免保存响应体，必须显式禁用该插件。

从 Ktor 3.2.0 开始，`SaveBodyPlugin` 已弃用，并由一个新的内部插件取代，该插件会自动为所有非流式请求保存响应体。这改善了资源管理并简化了 HTTP 响应生命周期。

`HttpRequestBuilder.skipSavingBody()` 也已弃用。如果您需要处理响应而不缓存主体，请改用流式处理方法。

<compare first-title="Before" second-title="After">

```kotlin
val file = client.get("/some-file") {
    skipSavingBody()
}.bodyAsChannel()
saveFile(file)
```
```kotlin
client.prepareGet("/some-file").execute { response ->
    saveFile(response.bodyAsChannel())
}
```

</compare>

此方法直接流式传输响应，防止主体被保存在内存中。

### `.wrapWithContent()` 与 `.wrap()` 扩展函数已弃用

在 Ktor 3.2.0 中，[`.wrapWithContent()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.observer/wrap-with-content.html) 和 [`.wrap()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.observer/wrap.html) 扩展函数已弃用，取而代之的是新的 `.replaceResponse()` 函数。

`.wrapWithContent()` 和 `.wrap()` 函数用只能读取一次的 `ByteReadChannel` 替换原始响应体。如果直接传递同一个通道实例而不是返回新实例的函数，则多次读取主体会失败。这可能会破坏访问响应体的不同插件之间的兼容性，因为第一个读取它的插件会消耗掉主体：

```kotlin
// 用从 rawContent 解码一次的通道替换主体
val decodedBody = decode(response.rawContent)
val decodedResponse = call.wrapWithContent(decodedBody).response

// 第一次调用返回主体
decodedResponse.bodyAsText()

// 后续调用返回空字符串
decodedResponse.bodyAsText() 
```

要避免此问题，请改用 `.replaceResponse()` 函数。它接受一个在每次访问时返回新通道的 lambda，确保与其他插件安全集成：

```kotlin
// 每次访问时用一个新的解码通道替换主体
call.replaceResponse {
    decode(response.rawContent)
}
```

### 访问解析后的 IP 地址

您现在可以在 `io.ktor.network.sockets.InetSocketAddress` 实例上使用新的 `.resolveAddress()` 函数。此函数允许您获取关联主机的原始解析后的 IP 地址：

```kotlin
val address = InetSocketAddress("sample-proxy-server", 1080)
val rawAddress = address.resolveAddress()
```

它将解析后的 IP 地址作为 `ByteArray` 返回，如果无法解析地址则返回 `null`。返回的 `ByteArray` 的大小取决于 IP 版本：IPv4 地址包含 4 个字节，IPv6 地址包含 16 个字节。在 JS 和 Wasm 平台上，`.resolveAddress()` 将始终返回 `null`。

### 清除 HTTP 缓存

您现在可以在 [`CacheStorage`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache.storage/-cache-storage/index.html) 上使用新方法，根据需要清除缓存的 HTTP 响应。

- `.removeAll(url)` 移除与指定 URL 匹配的所有缓存条目。
- `.remove(url, varyKeys)` 移除与给定 URL 和 `Vary` 标头键匹配的特定缓存条目。

这些方法为您提供了对缓存失效以及如何管理过时或特定缓存响应的更多控制。

## 共享

### HTMX 集成

Ktor 3.2.0 引入了对 [HTMX](https://htmx.org/) 的实验性支持，HTMX 是一个现代 JavaScript 库，通过 `hx-get` 和 `hx-swap` 等 HTML 属性启用动态交互。Ktor 的 HTMX 集成提供：

- HTMX 感知型路由，用于根据标头处理 HTMX 请求。
- HTML DSL 扩展，用于在 Kotlin 中生成 HTMX 属性。
- HTMX 标头常量和值，以消除字符串字面量。

Ktor 的 HTMX 支持通过三个实验性模块提供：

| 模块 | 描述 |
|--------------------|--------------------------------------------|
| `ktor-htmx` | 核心定义和标头常量 |
| `ktor-htmx-html` | 与 Kotlin HTML DSL 的集成 |
| `ktor-server-htmx` | 对 HTMX 特定请求的路由支持 |

所有 API 都标有 `@ExperimentalKtorApi`，并需要通过 `@OptIn(ExperimentalKtorApi::class)` 启用。要了解更多信息，请参阅 [HTMX 集成](htmx-integration.md)。

### Unix 域套接字

在 3.2.0 中，您可以设置 Ktor 客户端连接到 Unix 域套接字，并设置 Ktor 服务器监听此类套接字。目前，Unix 域套接字仅在 CIO 引擎中受支持。

服务器配置示例：

```kotlin
val server = embeddedServer(CIO, configure = {
    unixConnector("/tmp/test-unix-socket-ktor.sock")
}) {
    routing {
        get("/") {
            call.respondText("Hello, Unix socket world!")
        }
    }
}
```

使用 Ktor 客户端连接到该套接字：

```kotlin
val client = HttpClient(CIO)

val response: HttpResponse = client.get("/") {
    unixSocket("/tmp/test-unix-socket-ktor.sock")
}
```

您还可以在[默认请求](client-default-request.md#unix-domain-sockets)中使用 Unix 域套接字。

### 用于构建标头和参数的新 `.appendAll()` 重载

[`StringValuesBuilder.appendAll()`](https://api.ktor.io/ktor-utils/io.ktor.util/append-all.html) 函数有了新的重载，可以接受 `Map` 或 `vararg Pair`。这允许您在单次调用中追加多个值，简化了标头、URL 参数和其他基于 `StringValues` 的集合的构造。

以下示例展示了如何使用这些新重载：

```kotlin
val headers = buildHeaders {
    // 使用 Map
    appendAll(mapOf("foo" to "bar", "baz" to "qux"))
    appendAll(mapOf("test" to listOf("1", "2", "3")))

    // 使用 vararg Pair
    appendAll("foo" to "bar", "baz" to "qux")
    appendAll("test" to listOf("1", "2", "3"))
}
```

## 基础架构

### 发布的版本编目

在此版本中，您现在可以使用官方的[发布的版本编目](server-dependencies.topic#using-version-catalog)从单一来源管理所有 Ktor 依赖项。这消除了在依赖项中手动声明 Ktor 版本的需要。

要将编目添加到您的项目中，请在 **settings.gradle.kts** 中配置 Gradle 的版本编目，然后在模块的 **build.gradle.kts** 文件中引用它：

<Tabs>
<TabItem title="settings.gradle.kts">

```kotlin
dependencyResolutionManagement {
    versionCatalogs {
        create("ktorLibs") {
            from("io.ktor:ktor-version-catalog:%ktor_version%")
        }
    }
}
```

</TabItem>
<TabItem title="build.gradle.kts">

```kotlin
dependencies {
    implementation(ktorLibs.client.core)
    implementation(ktorLibs.client.cio)
    // ...
}
```

</TabItem>
</Tabs>

## Gradle 插件

### 启用开发模式

Ktor 3.2.0 简化了启用开发模式的方式。以前，启用开发模式需要在 `application` 块中进行显式配置。现在，您可以使用 `ktor.development` 属性来启用它，无论是动态还是显式地：

* 根据项目属性动态启用开发模式。
  ```kotlin
    ktor {
        development = project.ext.has("development")
    }
  ```
* 显式将开发模式设置为 true。

    ```kotlin
    ktor {
        development = true
    }
    ```

默认情况下，如果定义了 Gradle 项目属性或系统属性 `io.ktor.development`，`ktor.development` 的值将自动从中解析。这允许您直接使用 Gradle CLI 标志启用开发模式：

```bash
./gradlew run -Pio.ktor.development=true