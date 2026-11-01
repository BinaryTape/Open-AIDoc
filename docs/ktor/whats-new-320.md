[//]: # (title: Ktor 3.2.0 的最新变化)

<show-structure for="chapter,procedure" depth="2"/>

_[发布日期：2025 年 6 月 12 日](releases.md#release-details)_

以下是此功能版本的主要亮点：

* [Version Catalog](#published-version-catalog)
* [依赖注入](#dependency-injection)
* [一流的 HTMX 支持](#htmx-integration)
* [可挂起模块函数](#suspendable-module-functions)

## Ktor Server {id="ktor-server"}

### 可挂起模块函数 {id="suspendable-module-functions"}

从 Ktor 3.2.0 开始，[应用程序模块](server-modules.md)支持挂起函数。

> 随着挂起模块支持的引入，开发模式下的自动重载不再适用于阻塞函数引用。有关更多信息，请参阅[开发模式自动重载回归](#regression)。
>
{style="warning"}

此前，在 Ktor 模块内添加异步函数需要使用 `runBlocking` 代码块，这可能会在创建服务器时导致死锁：

```kotlin
fun Application.installEvents() {
    val kubernetesConnection = runBlocking {
        connect(property<KubernetesConfig>("app.events"))
    }
}
```

现在你可以使用 `suspend` 关键字，从而允许在应用程序启动时执行异步代码：

```kotlin
suspend fun Application.installEvents() {
    val kubernetesConnection = connect(property<KubernetesConfig>("app.events"))
}
```

#### 并发模块加载 {id="concurrent-module-loading"}

你还可以通过添加 `ktor.application.startup = concurrent` Gradle 属性来启用并发模块加载。
它会独立启动所有应用程序模块，因此当一个模块挂起时，其他模块不会被阻塞。
这支持非顺序加载以实现依赖注入，并且在某些情况下可以加快加载速度。

有关更多信息，请参阅[并发模块](server-modules.md#concurrent-modules)。

### 配置文件反序列化 {id="configuration-file-deserialization"}

Ktor 3.2.0 在 `Application` 类上引入了新的 `.property()` 扩展，从而支持类型化配置加载。现在你可以将结构化配置部分直接反序列化为 Kotlin 数据类。

此功能简化了访问配置值的方式，并在处理嵌套或分组设置时显著减少模板代码。

考虑以下 **application.yaml** 文件：

```yaml
database:
   url: "$DATABASE_URL:jdbc:postgresql://localhost:5432/postgres"
   username: "$DATABASE_USER:ktor_admin"
   password: "$DATABASE_PASSWORD:ktor123!"
```

此前，你必须分别检索每个配置值。借助新的 `.property()` 扩展，你可以一次性加载整个配置部分：

<compare>
<code-block lang="kotlin" code="data class DatabaseConfig(&#10;    val url: String,&#10;    val username: String,&#10;    val password: String? = null,&#10;)&#10;&#10;fun Application.module() {&#10;  val databaseConfig = DatabaseConfig(&#10;    url = environment.config.property(&quot;database.url&quot;).getString(),&#10;    username = environment.config.property(&quot;database.username&quot;).getString(),&#10;    password = environment.config.property(&quot;database.password&quot;).getString(),&#10;  )&#10;  // use configuration&#10;}"/>
<code-block lang="kotlin" code="@Serializable &#10;data class DatabaseConfig(&#10;    val url: String,&#10;    val username: String,&#10;    val password: String? = null,&#10;)&#10;&#10;fun Application.module() {&#10;  val databaseConfig: DatabaseConfig = property(&quot;database&quot;)&#10;  // use configuration&#10;}"/>
</compare>

此功能同时支持 HOCON 和 YAML 配置格式，并使用 `kotlinx.serialization` 进行反序列化。

### `ApplicationTestBuilder` 具备可配置的 `client` {id="applicationtestbuilder-has-a-configurable-client"}

从 Ktor 3.2.0 开始，`ApplicationTestBuilder` 类中的 `client` 属性变更为可变的（mutable）。此前该属性为只读。
这一变更允许你配置自己的测试客户端，并在可以使用 `ApplicationTestBuilder` 类的任何地方复用它。例如，你可以从扩展函数中访问该客户端：

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

    // 提取为扩展函数的可复用测试步骤
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

### 依赖注入 {id="dependency-injection"}

Ktor 3.2.0 引入了依赖注入（DI）支持，使得直接从配置文件和应用程序代码中管理与装配依赖项变得更加轻松。新的 DI 插件简化了依赖项解析，支持异步加载，提供自动清理功能，并能与测试无缝集成。

<var name="artifact_name" value="ktor-server-di" />
<var name="ktor_version_catalog_name" value="ktorLibs.server.di"/>

要使用 DI，请在构建脚本中引入 `%artifact_name%` 构件：

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            上述代码片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            上述代码片段使用 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 版本目录</a> 来指定 Ktor 依赖项。
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

#### 基本依赖项注册 {id="basic-dependency-registration"}

你可以使用 lambda、函数引用或构造函数引用来注册依赖项：

```kotlin
dependencies {
  // 基于 Lambda
  provide<GreetingService> { GreetingServiceImpl() }

  // 函数引用
  provide<GreetingService>(::GreetingServiceImpl)
  provide(BankServiceImpl::class)
  provide(::createBankTeller)

  // 将 lambda 注册为依赖项
  provide<() -> GreetingService> { { GreetingServiceImpl() } }
}
```

#### 基于配置的依赖项注册 {id="configuration-based-dependency-registration"}

你可以在配置文件中使用类路径引用以声明方式配置依赖项。这同时支持函数引用和类引用：

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

形参会通过 `@Property` 和 `@Named` 等注解自动解析。

#### 依赖项解析与注入 {id="dependency-resolution-and-injection"}

##### 解析依赖项 {id="resolving-dependencies"}

要解析依赖项，可以使用属性委托或直接解析：

```kotlin
// 使用属性委托
val service: GreetingService by dependencies

// 直接解析
val service = dependencies.resolve<GreetingService>()
```

##### 异步依赖项解析 {id="asynchronous-dependency-resolution"}

为了支持异步加载，可以使用挂起函数：

```kotlin
suspend fun Application.installEvents() {
  val kubernetesConnection = dependencies.resolve() // 挂起直到提供该依赖
}

suspend fun Application.loadEventsConnection() {
  dependencies.provide {
    connect(property<KubernetesConfig>("app.events"))
  }
}
```

DI 插件会自动挂起 `resolve()` 调用，直到所有依赖项准备就绪。

##### 注入到应用程序模块 {id="injecting-into-application-modules"}

你可以通过指定模块形参，将依赖项直接注入到应用程序模块中。Ktor 将从 DI 容器中解析它们：

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

使用 `@Named` 注入特定键名的依赖项：

```kotlin
fun Application.userRepository(@Named("mongo") database: Database) {
    // 使用名为 "mongo" 的依赖项
}
```

##### 属性与配置注入 {id="property-and-configuration-injection"}

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

这简化了结构化配置的处理，并支持基本类型的自动解析。

有关更多信息和高级用法，请参阅[依赖注入](server-dependency-injection.md)。

### 在 `testApplication` 中访问应用程序实例 {id="access-the-application-instance-in-testapplication"}

现在你可以使用 `ApplicationTestBuilder.application` 属性，直接从 `testApplication {}` 代码块中访问正在运行的 `Application` 实例。

此前，`Application` 实例仅在嵌套的 `application {}` 配置块内可用，这导致在测试后续步骤中引用该应用程序变得十分困难。新的 `application` 属性会在配置和启动后公开同一个实例。

以下示例使用 `application` 属性断言插件已安装：

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

作为支持挂起函数的副作用，阻塞函数引用（`Application::myModule`）在类型转换期间现在会被包装到匿名内部类中。这会导致自动重载失效，因为函数名称不再保留为稳定的引用。

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

## Ktor Client {id="ktor-client"}

### `SaveBodyPlugin` 和 `HttpRequestBuilder.skipSavingBody()` 已弃用 {id="savebodyplugin-and-httprequestbuilder-skipsavingbody-are-deprecated"}

在 Ktor 3.2.0 之前，`SaveBodyPlugin` 默认安装。它会将整个响应体缓存到内存中，以便多次访问。为避免保存响应体，必须显式禁用该插件。

从 Ktor 3.2.0 开始，`SaveBodyPlugin` 已被弃用，并由一个新的内部插件取代，该插件会自动为所有非流式请求保存响应体。这改善了资源管理并简化了 HTTP 响应的生命周期。

`HttpRequestBuilder.skipSavingBody()` 也已被弃用。如果你需要在不缓存响应体的情况下处理响应，请改用流式方法。

<compare first-title="变更前" second-title="变更后">

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

这种方法会直接对响应进行流式传输，从而防止响应体被保存在内存中。

### `.wrapWithContent()` 和 `.wrap()` 扩展函数已弃用 {id="the-wrapwithcontent-and-wrap-extension-functions-are-deprecated"}

在 Ktor 3.2.0 中，[`.wrapWithContent()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.observer/wrap-with-content.html) 和 [`.wrap()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.observer/wrap.html) 扩展函数已被弃用，推荐使用新的 `.replaceResponse()` 函数。

`.wrapWithContent()` 和 `.wrap()` 函数会将原始响应体替换为只能读取一次的 `ByteReadChannel`。如果直接传递同一个通道实例，而不是传递一个返回新通道的函数，多次读取响应体就会失败。这可能会破坏访问响应体的不同插件之间的兼容性，因为第一个读取它的插件会消耗掉响应体：

```kotlin
// 将响应体替换为从 rawContent 一次性解码的通道
val decodedBody = decode(response.rawContent)
val decodedResponse = call.wrapWithContent(decodedBody).response

// 第一次调用返回响应体
decodedResponse.bodyAsText()

// 后续调用返回空字符串
decodedResponse.bodyAsText() 
```

为避免此问题，请改用 `.replaceResponse()` 函数。它接受一个在每次访问时返回新通道的 lambda，从而确保与其他插件安全集成：

```kotlin
// 每次访问时将响应体替换为新的解码通道
call.replaceResponse {
    decode(response.rawContent)
}
```

### 访问已解析的 IP 地址 {id="access-resolved-ip-address"}

现在可以在 `io.ktor.network.sockets.InetSocketAddress` 实例上使用新的 `.resolveAddress()` 函数。该函数允许你获取关联主机的原始已解析 IP 地址：

```kotlin
val address = InetSocketAddress("sample-proxy-server", 1080)
val rawAddress = address.resolveAddress()
```

它将已解析的 IP 地址作为 `ByteArray` 返回，如果无法解析该地址，则返回 `null`。
返回的 `ByteArray` 大小取决于 IP 版本：对于 IPv4 地址包含 4 个字节，对于 IPv6 地址包含 16 个字节。
在 JS 和 Wasm 平台上，`.resolveAddress()` 将始终返回 `null`。

### 清除 HTTP 缓存 {id="http-cache-clearing"}

现在可以使用 [`CacheStorage`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache.storage/-cache-storage/index.html) 上的新方法，在需要时清除缓存的 HTTP 响应。

- `.removeAll(url)` 移除与指定 URL 匹配的所有缓存条目。
- `.remove(url, varyKeys)` 移除与给定 URL 和 `Vary` 键匹配的特定缓存条目。

这些方法让你对缓存失效以及如何管理过期或特定的缓存响应拥有更多控制权。

## 共享 {id="shared"}

### HTMX 集成 {id="htmx-integration"}

Ktor 3.2.0 引入了对 [HTMX](https://htmx.org/) 的实验性支持，这是一个现代 JavaScript 库，可通过 `hx-get` 和 `hx-swap` 等 HTML 特性实现动态交互。Ktor 的 HTMX 集成提供了：

- 感知 HTMX 的路由，用于根据请求头处理 HTMX 请求。
- HTML DSL 扩展，用于在 Kotlin 中生成 HTMX 特性。
- HTMX 标头常量和值，以消除字符串文字。

Ktor 对 HTMX 的支持通过三个实验性模块提供：

| 模块 | 描述 |
|--------------------|--------------------------------------------|
| `ktor-htmx` | 核心定义和请求头常量 |
| `ktor-htmx-html` | 与 Kotlin HTML DSL 的集成 |
| `ktor-server-htmx` | 对 HTMX 专用请求的路由支持 |

所有 API 均标有 `@ExperimentalKtorApi`，需要通过 `@OptIn(ExperimentalKtorApi::class)` 选择启用。
有关更多信息，请参阅 [HTMX 集成](htmx-integration.md)。

### Unix 域套接字 {id="unix-domain-sockets"}

在 3.2.0 中，你可以配置 Ktor 客户端连接到 Unix 域套接字，并配置 Ktor 服务器侦听此类套接字。
目前，Unix 域套接字仅在 CIO 引擎中受支持。

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

你也可以在[默认请求](client-default-request.md#unix-domain-sockets)中使用 Unix 域套接字。

### 用于构建标头和形参的新 `.appendAll()` 重载 {id="new-appendall-overloads-for-building-headers-and-parameters"}

[`StringValuesBuilder.appendAll()`](https://api.ktor.io/ktor-utils/io.ktor.util/append-all.html) 函数新增了接受 `Map` 或 `vararg Pair` 的重载。这允许你在单次调用中追加多个值，从而简化了标头、URL 参数以及其他基于 `StringValues` 的集合的构建。

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

## 基础架构 {id="infrastructure"}

### 已发布的 Version Catalog {id="published-version-catalog"}

在此版本中，你现在可以使用官方[发布的版本目录](server-dependencies.topic#using-version-catalog)从单一来源管理所有 Ktor 依赖项。这消除了在依赖项中手动声明 Ktor 版本的需要。

要将目录添加到你的项目中，请在 **settings.gradle.kts** 中配置 Gradle 的版本目录，然后在模块的 **build.gradle.kts** 文件中引用它：

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

## Gradle 插件 {id="gradle-plugin"}

### 启用开发模式 {id="enabling-development-mode"}

Ktor 3.2.0 简化了启用开发模式的操作。此前，启用开发模式需要在 `application` 块中进行显式配置。现在，你可以使用 `ktor.development` 属性以动态或显式方式启用它：

* 根据项目属性动态启用开发模式：
  ```kotlin
    ktor {
        development = project.ext.has("development")
    }
  ```
* 显式将开发模式设置为 true：

    ```kotlin
    ktor {
        development = true
    }
    ```

默认情况下，如果定义了 Gradle 项目属性或系统属性 `io.ktor.development`，`ktor.development` 的值会自动从其中进行解析。这使你可以直接使用 Gradle CLI 标志启用开发模式：

```bash
./gradlew run -Pio.ktor.development=true
```