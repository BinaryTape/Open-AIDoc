[//]: # (title: 在 Ktor Server 中进行测试)

<show-structure for="chapter" depth="3"/>

<tldr>
<p>
<b>所需依赖项</b>：<code>io.ktor:ktor-server-test-host</code>、<code>org.jetbrains.kotlin:kotlin-test</code>
</p>
</tldr>

<link-summary>
了解如何使用特殊的测试引擎来测试您的服务器应用程序。
</link-summary>

Ktor 提供了一个测试引擎，可以直接运行应用程序调用，而无需启动真实的 Web 服务器或绑定到套接字。请求在内部处理，这使得测试与运行完整服务器相比更快、更可靠。

## 添加依赖项 {id="add-dependencies"}

要测试 Ktor 服务器应用程序，请在构建脚本中包含以下依赖项：

* `ktor-server-test-host` 依赖项提供了测试引擎：

   <var name="artifact_name" value="ktor-server-test-host"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               testImplementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               testImplementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"></code-block>
       </TabItem>
   </Tabs>

* `kotlin-test` 依赖项提供了一组用于执行断言的工具函数：

  <var name="group_id" value="org.jetbrains.kotlin"/>
  <var name="artifact_name" value="kotlin-test"/>
  <var name="version" value="kotlin_version"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              testImplementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"></code-block>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              testImplementation &quot;%group_id%:%artifact_name%:$%version%&quot;"></code-block>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;%group_id%&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%&lt;/artifactId&gt;&#10;                  &lt;version&gt;${%version%}&lt;/version&gt;&#10;              &lt;/dependency&gt;"></code-block>
      </TabItem>
  </Tabs>

> 对于 [Native 服务器](server-native.md#add-dependencies)测试，请将这些构件添加到 `nativeTest` 源集中。

## 测试概览 {id="overview"}

您可以使用 [`testApplication {}`](https://api.ktor.io/ktor-server-test-host/io.ktor.server.testing/test-application.html) 函数和提供的 [HTTP 客户端](client-create-and-configure.md)来测试 Ktor 应用程序。典型的工作流程包括以下步骤：

1. 使用 `testApplication {}` [定义测试](#junit-test-class)。
2. [配置并运行应用程序的测试实例](#configure-test-app)。
3. （可选）[配置 HTTP 客户端](#configure-client)。
4. 使用客户端向您的测试应用程序[发起 HTTP 请求](#make-request)并接收响应。
5. 使用来自 `kotlin.test` 的断言[验证响应](#assert)，包括状态码、标头和主体内容。

以下示例测试了一个简单的 Ktor 应用程序，该程序以纯文本响应 `GET /` 请求：

<Tabs>
<TabItem title="ApplicationTest.kt">

```kotlin
package com.example

import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.testing.*
import kotlin.test.*

class ApplicationTest {
    @Test
    fun testRoot() = testApplication {
        application {
            module()
        }
        val response = client.get("/")
        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals("Hello, world!", response.bodyAsText())
    }
}

```

</TabItem>

<TabItem title="Application.kt">

```kotlin
package com.example

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)

fun Application.module() {
    routing {
        get("/") {
            call.respondText("Hello, world!")
        }
    }
}

```

</TabItem>
</Tabs>

> 有关完整的代码示例，请参阅 [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main)。

## 设置 JUnit 测试类 {id="junit-test-class"}

在为您的 Ktor 应用程序编写测试之前，请创建一个测试文件和一个 JUnit 测试类。

<procedure>

1. 在您的项目中找到或创建 `src/test/kotlin` 目录。
2. 创建一个新的 Kotlin 文件（例如 `ApplicationTest.kt`）。
3. 定义一个将包含您的测试的 Kotlin 类：
    ```kotlin 
    class ApplicationTest {
        // 测试函数放在这里
    }
    ```
4. 添加一个带有 `@Test` 注解的测试函数。在测试内部，使用 `testApplication {}` 函数在测试环境中运行您的应用程序：
   ```kotlin 
    class ApplicationTest {
        @Test
        fun testRoot() = testApplication {
            // ...
        }
    }
    ```
</procedure>

`testApplication {}` 函数是 Ktor 中服务器端测试的入口点。它会创建一个隔离的测试环境，在不启动真实 Web 服务器的情况下运行您的应用程序，并提供一个预配置的 HTTP 客户端用于发起请求和断言响应。

在 `testApplication {}` 代码块内，您可以配置测试应用程序的行为，例如要加载哪些模块、要公开哪些路由、环境如何设置，或者要模拟哪些外部服务。

下一节将介绍可用的配置选项。

## 配置测试应用程序 {id="configure-test-app"}

在配置测试应用程序时，您可以：

- [添加应用程序模块](#add-modules)
- [添加路由](#add-routing)
- [自定义环境](#environment)
- [模拟外部服务](#external-services)

> 默认情况下，配置的测试应用程序会在[第一次客户端调用](#make-request)时启动。
> 或者，您可以调用 `startApplication()` 函数手动启动应用程序。
> 如果您需要测试应用程序的[生命周期事件](server-events.md#predefined-events)，这可能会很有用。

### 添加应用程序模块 {id="add-modules"}

必须通过[显式加载它们](#explicit-module-loading)或[配置环境](#configure-env)来将[模块](server-modules.md)加载到测试应用程序中。

#### 显式模块加载 {id="explicit-module-loading"}

要手动将模块添加到测试应用程序，请使用 `application {}` 代码块：

```kotlin
package com.example

import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.application.Application
import io.ktor.server.testing.*
import kotlin.test.*

class ApplicationTest {
    @Test
    fun testModule1() = testApplication {
        application {
            module1()
            module2()
        }
        val response = client.get("/module1")
        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals("Hello from 'module1'!", response.bodyAsText())
    }

    @Test
    fun testAccessApplicationInstance() = testApplication {
        lateinit var configuredApplication: Application

        application {
            configuredApplication = this
        }

        startApplication()

        // 访问 application 属性
        val app: Application = application

        // 断言它是同一个实例
        assertSame(configuredApplication, app)
    }
}
```

#### 从配置文件加载模块 {id="configure-env"}

要从配置文件加载模块，请使用 `environment {}` 代码块为您的测试指定配置文件：

```kotlin
@Test
fun testHello() = testApplication {
    environment {
        config = ApplicationConfig("application-custom.conf")
    }
}
```

当您需要在测试期间模仿不同的环境或使用自定义配置设置时，此方法非常有用。

### 访问应用程序实例 {id="access-application"}

在 `application {}` 代码块内，您可以访问正在配置的 `Application` 实例：

```kotlin
testApplication {
    application {
        val app: Application = this
        // 在此处与应用程序实例进行交互
    }
}
```
此外，`testApplication` 作用域公开了 `application` 属性，该属性返回测试所使用的相同 `Application` 实例。这允许您直接从测试代码中检查或与应用程序交互。

```kotlin
package com.example

import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.application.Application
import io.ktor.server.testing.*
import kotlin.test.*

class ApplicationTest {
    @Test
    fun testModule1() = testApplication {
        application {
            module1()
            module2()
        }
        val response = client.get("/module1")
        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals("Hello from 'module1'!", response.bodyAsText())
    }

    @Test
    fun testAccessApplicationInstance() = testApplication {
        lateinit var configuredApplication: Application

        application {
            configuredApplication = this
        }

        startApplication()

        // 访问 application 属性
        val app: Application = application

        // 断言它是同一个实例
        assertSame(configuredApplication, app)
    }
}
```

> 在调用 `startApplication()` 或发起第一次客户端请求之前访问 `application` 属性会返回 `Application` 实例，但它可能尚未启动。
> 
{style="note"}

### 添加路由 {id="add-routing"}

您可以使用 `routing {}` 代码块向测试应用程序添加路由。这种方法对于在不加载完整模块的情况下测试路由，或者添加测试专用端点非常有用。

以下示例添加了用于在测试中初始化用户会话的 `/login-test` 端点：

```kotlin
fun testHello() = testApplication {
    routing {
        get("/login-test") {
            call.sessions.set(UserSession("xyzABC123","abc123"))
        }
    }
}
```
   
> 有关完整的测试示例，请参阅 [auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google)。

### 自定义环境 {id="environment"}

要为您的测试应用程序配置自定义环境，请使用 `environment {}` 函数。

例如，从 `test/resources` 文件夹加载配置文件：

```kotlin
@Test
fun testHello() = testApplication {
    environment {
        config = ApplicationConfig("application-custom.conf")
    }
}
```

或者，您可以使用 [`MapApplicationConfig`](https://api.ktor.io/ktor-server-core/io.ktor.server.config/-map-application-config/index.html) 以编程方式提供配置属性。这在您需要在应用程序启动前访问应用程序配置时非常有用。

```kotlin
@Test
fun testDevEnvironment() = testApplication {
    environment {
        config = MapApplicationConfig("ktor.environment" to "dev")
    }
}
```

### 模拟外部服务 {id="external-services"}

您可以使用 `externalServices {}` 函数模拟外部服务。在其代码块内，为您要模拟的每个服务使用 `hosts() {}` 函数。在 `hosts() {}` 代码块内，您可以通过定义路由和安装插件来配置充当模拟服务的 `Application`。

以下示例模拟了来自 Google API 的 JSON 响应：

```kotlin
@Test
fun testHello() = testApplication {
    externalServices {
        hosts("https://www.googleapis.com") {
            install(io.ktor.server.plugins.contentnegotiation.ContentNegotiation) {
                json()
            }
            routing {
                get("oauth2/v2/userinfo") {
                    call.respond(UserInfo("1", "JetBrains", "", ""))
                }
            }
        }
    }
}
```

> 有关完整的测试示例，请参阅 [auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google)。

## 配置客户端 {id="configure-client"}

`testApplication {}` 函数通过 `client` 属性提供了一个已配置的 HTTP 客户端。 
要自定义客户端并安装其他插件，请使用 `createClient {}` 函数。

例如，您可以安装 [`ContentNegotiation`](client-serialization.md) 插件，以便在 `POST/PUT` 请求中[发送 JSON 数据](#json-data)：

```kotlin
@Test
fun testPostCustomer() = testApplication {
    application {
        main()
    }
    client = createClient {
        install(ContentNegotiation) {
            json()
        }
    }
}
```

## 发起请求 {id="make-request"}

使用配置的客户端来[发起请求](client-requests.md)并[接收响应](client-responses.md)。

以下示例测试了处理 `POST` 请求的 `/customer` 端点：

```kotlin
@Test
fun testPostCustomer() = testApplication {
    application {
        main()
    }
    client = createClient {
        install(ContentNegotiation) {
            json()
        }
    }
    val response = client.post("/customer") {
        contentType(ContentType.Application.Json)
        setBody(Customer(3, "Jet", "Brains"))
    }
}
```

> 有关完整的测试示例，请参阅 [json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/json-kotlinx)。

## 验证结果 {id="assert"}

收到响应后，您可以使用 [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) 库中的断言来验证结果：

```kotlin
@Test
fun testPostCustomer() = testApplication {
    application {
        main()
    }
    client = createClient {
        install(ContentNegotiation) {
            json()
        }
    }
    val response = client.post("/customer") {
        contentType(ContentType.Application.Json)
        setBody(Customer(3, "Jet", "Brains"))
    }
    assertEquals("Customer stored correctly", response.bodyAsText())
    assertEquals(HttpStatusCode.Created, response.status)
}
```

## 测试 POST/PUT 请求 {id="test-post-put"}

### 发送表单数据 {id="form-data"}

要在测试请求中发送表单数据，请使用 [`header()`](client-requests.md#headers) 和 [`setBody()`](client-requests.md#body) 函数设置 `Content-Type` 标头和请求主体。

#### 键/值对 {id="x-www-form-urlencoded"}

要在 POST 请求中发送键/值表单参数，请将 `Content-Type` 标头设置为 `application/x-www-form-urlencoded`，并使用 [`formUrlEncode()`](https://api.ktor.io/ktor-http/io.ktor.http/form-url-encode.html) 函数对参数进行编码：

<Tabs>
<TabItem title="ApplicationTest.kt">

```kotlin
package formparameters

import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlin.test.*

class ApplicationTest {
    @Test
    fun testPost() = testApplication {
        application {
            main()
        }
        val response = client.post("/signup") {
            header(HttpHeaders.ContentType, ContentType.Application.FormUrlEncoded.toString())
            setBody(listOf("username" to "JetBrains", "email" to "example@jetbrains.com", "password" to "foobar", "confirmation" to "foobar").formUrlEncode())
        }
        assertEquals("The 'JetBrains' account is created", response.bodyAsText())
    }
}

```

</TabItem>

<TabItem title="Application.kt">

```kotlin
import io.ktor.server.application.*
import io.ktor.server.html.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.html.*

fun Application.main() {
    routing {
        post("/signup") {
            val formParameters = call.receiveParameters()
            val username = formParameters["username"].toString()
            call.respondText("The '$username' account is created")
        }
    }
}
```

</TabItem>
</Tabs>

> 有关完整代码示例，请参阅 [post-form-parameters](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/post-form-parameters)。

#### 多部分表单数据 {id="multipart-form-data"}

您可以使用 `multipart/form-data` 内容类型来构建多部分表单数据并测试文件上传：

<Tabs>
<TabItem title="ApplicationTest.kt">

```kotlin
package uploadfile

import io.ktor.client.request.*
import io.ktor.client.request.forms.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import org.junit.*
import java.io.*
import kotlin.test.*
import kotlin.test.Test

class ApplicationTest {
    @Test
    fun testUpload() = testApplication {
        application {
            main()
        }
        val boundary = "WebAppBoundary"
        val response = client.post("/upload") {
            setBody(
                MultiPartFormDataContent(
                    formData {
                        append("description", "Ktor logo")
                        append("image", File("ktor_logo.png").readBytes().toString(), Headers.build {
                            append(HttpHeaders.ContentType, "image/png")
                            append(HttpHeaders.ContentDisposition, "filename=\"ktor_logo.png\"")
                        })
                    },
                    boundary,
                    ContentType.MultiPart.FormData.withParameter("boundary", boundary)
                )
            )
        }
        assertEquals("Ktor logo is uploaded to 'uploads/ktor_logo.png'", response.bodyAsText(Charsets.UTF_8))
    }

    @After
    fun deleteUploadedFile() {
        File("uploads/ktor_logo.png").delete()
    }
}

```

</TabItem>

<TabItem title="Application.kt">

```kotlin
package uploadfile

import io.ktor.server.application.*
import io.ktor.http.content.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.util.cio.*
import io.ktor.utils.io.*
import java.io.File

fun Application.main() {
    routing {
        post("/upload") {
            var fileDescription = ""
            var fileName = ""
            val multipartData = call.receiveMultipart(formFieldLimit = 1024 * 1024 * 100)

            multipartData.forEachPart { part ->
                when (part) {
                    is PartData.FormItem -> {
                        fileDescription = part.value
                    }

                    is PartData.FileItem -> {
                        fileName = part.originalFileName as String
                        val file = File("uploads/$fileName")
                        part.provider().copyAndClose(file.writeChannel())
                    }

                    else -> {}
                }
                part.dispose()
            }

            call.respondText("$fileDescription is uploaded to 'uploads/$fileName'")
        }
    }
}

```

</TabItem>
</Tabs>

> 有关完整代码示例，请参阅 [upload-file](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/upload-file)。

### 发送 JSON 数据 {id="json-data"}

要在 `POST/PUT` 请求中序列化与反序列化 JSON 数据，请在新的客户端中安装 [`ContentNegotiation`](client-serialization.md) 插件。

在请求内部，您可以使用 `contentType()` 函数指定 `Content-Type` 标头，并使用 `setBody()` 函数指定请求主体。

<Tabs>
<TabItem title="ApplicationTest.kt">

```kotlin
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.testing.*
import kotlin.test.*

class CustomerTests {
    @Test
    fun testPostCustomer() = testApplication {
        application {
            main()
        }
        client = createClient {
            install(ContentNegotiation) {
                json()
            }
        }
        val response = client.post("/customer") {
            contentType(ContentType.Application.Json)
            setBody(Customer(3, "Jet", "Brains"))
        }
        assertEquals("Customer stored correctly", response.bodyAsText())
        assertEquals(HttpStatusCode.Created, response.status)
    }
}
```

</TabItem>

<TabItem title="Application.kt">

```kotlin
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import io.ktor.server.util.getValue

@Serializable
data class Customer(val id: Int, val firstName: String, val lastName: String)

    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
        })
    }

        post("/customer") {
            val customer = call.receive<Customer>()
            customerStorage.add(customer)
            call.respondText("Customer stored correctly", status = HttpStatusCode.Created)
        }
    }
```

</TabItem>
</Tabs>

> 有关完整示例，请参阅 [json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/json-kotlinx)。

## 在测试期间保留 Cookie {id="preserving-cookies"}

要在请求之间保留 Cookie，请在新的客户端中安装 [`HttpCookies`](client-cookies.md) 插件。

在以下示例中，由于保留了 Cookie，重载次数在每次请求后都会增加：

<Tabs>
<TabItem title="ApplicationTest.kt">

```kotlin
package cookieclient

import io.ktor.client.plugins.cookies.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.server.testing.*
import kotlin.test.*

class ApplicationTest {
    @Test
    fun testRequests() = testApplication {
        application {
            main()
        }
        val client = createClient {
            install(HttpCookies)
        }

        val loginResponse = client.get("/login")
        val response1 = client.get("/user")
        assertEquals("Session ID is 123abc. Reload count is 1.", response1.bodyAsText())
        val response2 = client.get("/user")
        assertEquals("Session ID is 123abc. Reload count is 2.", response2.bodyAsText())
        val response3 = client.get("/user")
        assertEquals("Session ID is 123abc. Reload count is 3.", response3.bodyAsText())
        val logoutResponse = client.get("/logout")
        assertEquals("Session doesn't exist or is expired.", logoutResponse.bodyAsText())
    }
}

```

</TabItem>

<TabItem title="Application.kt">

```kotlin
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.sessions.*
import io.ktor.util.*
import kotlinx.serialization.Serializable

@Serializable
data class UserSession(val id: String, val count: Int)

fun Application.main() {
    install(Sessions) {
        val secretEncryptKey = hex("00112233445566778899aabbccddeeff")
        val secretSignKey = hex("6819b57a326945c1968f45236589")
        cookie<UserSession>("user_session") {
            cookie.path = "/"
            cookie.maxAgeInSeconds = 10
            transform(SessionTransportTransformerEncrypt(secretEncryptKey, secretSignKey))
        }
    }
    routing {
        get("/login") {
            call.sessions.set(UserSession(id = "123abc", count = 0))
            call.respondRedirect("/user")
        }

        get("/user") {
            val userSession = call.sessions.get<UserSession>()
            if (userSession != null) {
                call.sessions.set(userSession.copy(count = userSession.count + 1))
                call.respondText("Session ID is ${userSession.id}. Reload count is ${userSession.count}.")
            } else {
                call.respondText("Session doesn't exist or is expired.")
            }
        }

```

</TabItem>
</Tabs>

> 有关完整示例，请参阅 [session-cookie-client](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-client)。

## 测试 HTTPS {id="https"}

要测试 [HTTPS 端点](server-ssl.md)，请使用 [`URLBuilder.protocol`](client-requests.md#url) 属性设置请求协议：

```kotlin
package com.example

import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlin.test.*

class ApplicationTest {
    @Test
    fun testRoot() = testApplication {
        application {
            module()
        }
        val response = client.get("/") {
            url {
                protocol = URLProtocol.HTTPS
            }
        }
        assertEquals("Hello, world!", response.bodyAsText())
    }
}

```

> 有关完整示例，请参阅 [ssl-engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-engine-main)。

## 测试 WebSockets {id="testing-ws"}

您可以通过使用 [`WebSockets`](client-websockets.topic) 客户端插件来测试 [WebSocket 会话](server-websockets.md)：

```kotlin
package com.example

import io.ktor.client.plugins.websocket.*
import io.ktor.websocket.*
import io.ktor.server.testing.*
import kotlin.test.*

class ModuleTest {
    @Test
    fun testConversation() {
        testApplication {
            application {
                module()
            }
            val client = createClient {
                install(WebSockets)
            }

            client.webSocket("/echo") {
                val greetingText = (incoming.receive() as? Frame.Text)?.readText() ?: ""
                assertEquals("Please enter your name", greetingText)

                send(Frame.Text("JetBrains"))
                val responseText = (incoming.receive() as Frame.Text).readText()
                assertEquals("Hi, JetBrains!", responseText)
            }
        }
    }
}
```

## 使用 HttpClient 进行端到端测试 {id="end-to-end"}

您可以使用 [Ktor HTTP 客户端](client-create-and-configure.md)对服务器应用程序进行完整的端到端测试。

在下面的示例中，HTTP 客户端向 `TestServer` 发起测试请求：

```kotlin
import e2e.TestServer
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Test

class EmbeddedServerTest: TestServer() {
    @Test
    fun rootRouteRespondsWithHelloWorldString(): Unit = runBlocking {
        val response: String = HttpClient().get("http://localhost:8080/").body()
        assertEquals("Hello, world!", response)
    }
}
```

> 有关完整的端到端测试示例，请参阅 [embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server) 和 [e2e](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/e2e)。