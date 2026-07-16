[//]: # (title: Ktor Server 中的測試)

<show-structure for="chapter" depth="3"/>

<tldr>
<p>
<b>必要的相依性</b>：<code>io.ktor:ktor-server-test-host</code>、<code>org.jetbrains.kotlin:kotlin-test</code>
</p>
</tldr>

<link-summary>
了解如何使用特殊的測試引擎來測試您的伺服器應用程式。
</link-summary>

Ktor 提供了一個測試引擎，可以直接執行應用程式呼叫，而無需啟動真實的 Web 伺服器或繫結到通訊端 (sockets)。請求是在內部處理的，這使得測試與執行完整伺服器相比，速度更快且更可靠。

## 新增相依性 {id="add-dependencies"}

若要測試 Ktor 伺服器應用程式，請在您的建置指令碼中包含以下相依性：

* `ktor-server-test-host` 相依性提供了測試引擎：

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

* `kotlin-test` 相依性提供了一組用於執行斷言的公用函式：

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

> 對於 [Native 伺服器](server-native.md#add-dependencies) 測試，請將這些構件新增到 `nativeTest` 原始碼集。

## 測試概覽 {id="overview"}

您可以使用 [`testApplication {}`](https://api.ktor.io/ktor-server-test-host/io.ktor.server.testing/test-application.html) 函式和提供的 [HTTP 用戶端](client-create-and-configure.md) 來測試 Ktor 應用程式。典型的流程包含以下步驟：

1. 使用 `testApplication {}` [定義測試](#junit-test-class)。
2. [配置並執行測試執行個體](#configure-test-app)。
3. （選填）[配置 HTTP 用戶端](#configure-client)。
4. 使用用戶端向您的測試應用程式 [發送 HTTP 請求](#make-request) 並接收回應。
5. 使用來自 `kotlin.test` 的斷言來 [驗證回應](#assert)，包括狀態碼、標頭和主體內容。

以下範例測試了一個簡單的 Ktor 應用程式，該程式會以純文字回應 `GET /` 請求：

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

> 如需完整的程式碼範例，請參閱 [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main)。

## 設定 JUnit 測試類別 {id="junit-test-class"}

在為您的 Ktor 應用程式編寫測試之前，請建立一個測試檔案和一個 JUnit 測試類別。

<procedure>

1. 在您的專案中尋找或建立 `src/test/kotlin` 目錄。
2. 建立一個新的 Kotlin 檔案（例如 `ApplicationTest.kt`）。
3. 定義一個將包含測試的 Kotlin 類別：
    ```kotlin 
    class ApplicationTest {
        // 測試函式放在這裡
    }
    ```
4. 新增一個帶有 `@Test` 註解的測試函式。在測試內部，使用 `testApplication {}` 函式在測試環境中執行您的應用程式：
   ```kotlin 
    class ApplicationTest {
        @Test
        fun testRoot() = testApplication {
            // ...
        }
    }
    ```
</procedure>

`testApplication {}` 函式是 Ktor 伺服器測試的進入點。它會建立一個隔離的測試環境，在不啟動真實 Web 伺服器的情況下執行您的應用程式，並提供一個預先配置的 HTTP 用戶端用於發送請求和斷言回應。

在 `testApplication {}` 區塊內，您可以配置測試應用程式的行為，例如要載入哪些模組、要公開哪些路由、如何設定環境，或是要模擬哪些外部服務。

下一節將介紹可用的配置選項。

## 配置測試應用程式 {id="configure-test-app"}

配置測試應用程式時，您可以：

- [新增應用程式模組](#add-modules)
- [新增路由](#add-routing)
- [自訂環境](#environment)
- [模擬外部服務](#external-services)

> 預設情況下，配置的測試應用程式會在 [第一次用戶端呼叫](#make-request) 時啟動。
> 您也可以選擇呼叫 `startApplication()` 函式來手動啟動應用程式。
> 當您需要測試應用程式的 [生命週期事件](server-events.md#predefined-events) 時，這會非常有用。

### 新增應用程式模組 {id="add-modules"}

必須透過 [明確載入模組](#explicit-module-loading) 或 [配置環境](#configure-env) 將 [模組](server-modules.md) 載入到測試應用程式中。

#### 明確載入模組 {id="explicit-module-loading"}

若要手動將模組新增到測試應用程式，請使用 `application {}` 區塊：

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

        // 存取 application 屬性
        val app: Application = application

        // 斷言其為同一個執行個體
        assertSame(configuredApplication, app)
    }
}
```

#### 從配置文件載入模組 {id="configure-env"}

若要從配置文件載入模組，請使用 `environment {}` 區塊為您的測試指定配置文件：

```kotlin
@Test
fun testHello() = testApplication {
    environment {
        config = ApplicationConfig("application-custom.conf")
    }
}
```

當您需要在測試期間模擬不同環境或使用自訂配置設定時，此方法非常有用。

### 存取應用程式執行個體 {id="access-application"}

在 `application {}` 區塊內，您可以存取正在配置的 `Application` 執行個體：

```kotlin
testApplication {
    application {
        val app: Application = this
        // 在此處與應用程式執行個體互動
    }
}
```
此外，`testApplication` 作用域會公開 `application` 屬性，該屬性會傳回測試所使用的同一個 `Application` 執行個體。這允許您直接從測試程式碼中檢查或與應用程式互動。

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

        // 存取 application 屬性
        val app: Application = application

        // 斷言其為同一個執行個體
        assertSame(configuredApplication, app)
    }
}
```

> 在呼叫 `startApplication()` 或發出第一個用戶端請求之前存取 `application` 屬性會傳回 `Application` 執行個體，但它可能尚未啟動。
> 
{style="note"}

### 新增路由 {id="add-routing"}

您可以使用 `routing {}` 區塊將路由新增到測試應用程式。這種方法對於在不載入完整模組的情況下測試路由，或新增測試特定的端點非常有用。

以下範例新增了在測試中用於初始化使用者工作階段的 `/login-test` 端點：

```kotlin
fun testHello() = testApplication {
    routing {
        get("/login-test") {
            call.sessions.set(UserSession("xyzABC123","abc123"))
        }
    }
}
```
   
> 如需完整的測試範例，請參閱 [auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google)。

### 自訂環境 {id="environment"}

若要為您的測試應用程式配置自訂環境，請使用 `environment {}` 函式。

例如，若要從 `test/resources` 資料夾載入配置文件：

```kotlin
@Test
fun testHello() = testApplication {
    environment {
        config = ApplicationConfig("application-custom.conf")
    }
}
```

或者，您可以使用 [`MapApplicationConfig`](https://api.ktor.io/ktor-server-core/io.ktor.server.config/-map-application-config/index.html) 以程式化方式提供配置屬性。當您需要在應用程式啟動前存取應用程式配置時，這很有用。

```kotlin
@Test
fun testDevEnvironment() = testApplication {
    environment {
        config = MapApplicationConfig("ktor.environment" to "dev")
    }
}
```

### 模擬外部服務 {id="external-services"}

您可以使用 `externalServices {}` 函式模擬外部服務。在其區塊內，針對您要模擬的每個服務使用 `hosts() {}` 函式。在 `hosts() {}` 區塊中，您可以透過定義路由和安裝外掛程式來配置一個充當模擬服務的 `Application`。

以下範例模擬了來自 Google API 的 JSON 回應：

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

> 如需完整的測試範例，請參閱 [auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google)。

## 配置用戶端 {id="configure-client"}

`testApplication {}` 函式透過 `client` 屬性提供了一個已配置的 HTTP 用戶端。若要自訂用戶端並安裝額外的外掛程式，請使用 `createClient {}` 函式。

例如，您可以安裝 [`ContentNegotiation`](client-serialization.md) 外掛程式，以便在 `POST/PUT` 請求中 [發送 JSON 資料](#json-data) ：

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

## 發送請求 {id="make-request"}

使用配置好的用戶端來 [發送請求](client-requests.md) 並 [接收回應](client-responses.md)。

以下範例測試了處理 `POST` 請求的 `/customer` 端點：

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

> 如需完整的測試範例，請參閱 [json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/json-kotlinx)。

## 斷言結果 {id="assert"}

收到回應後，您可以使用來自 [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) 程式庫的斷言來驗證結果：

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

## 測試 POST/PUT 請求 {id="test-post-put"}

### 傳送表單資料 {id="form-data"}

要在測試請求中傳送表單資料，請使用 [`header()`](client-requests.md#headers) 和 [`setBody()`](client-requests.md#body) 函式設定 `Content-Type` 標頭和請求主體。

#### 鍵值對 {id="x-www-form-urlencoded"}

要在 POST 請求中傳送鍵值對表單參數，請將 `Content-Type` 標頭設定為 `application/x-www-form-urlencoded`，並使用 [`formUrlEncode()`](https://api.ktor.io/ktor-http/io.ktor.http/form-url-encode.html) 函式對參數進行編碼：

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

> 如需完整的程式碼範例，請參閱 [post-form-parameters](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/post-form-parameters)。

#### 多部分表單資料 (Multipart form data) {id="multipart-form-data"}

您可以使用 `multipart/form-data` 內容型別來建構多部分表單資料並測試檔案上傳：

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

> 如需完整的程式碼範例，請參閱 [upload-file](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/upload-file)。

### 傳送 JSON 資料 {id="json-data"}

若要在 `POST/PUT` 請求中序列化和反序列化 JSON 資料，請為新用戶端安裝 [`ContentNegotiation`](client-serialization.md) 外掛程式。

在請求內部，您可以使用 `contentType()` 函式指定 `Content-Type` 標頭，並使用 `setBody()` 函式指定請求主體。

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

> 如需完整範例，請參閱 [json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/json-kotlinx)。

## 在測試期間保留 Cookie {id="preserving-cookies"}

若要在請求之間保留 Cookie，請為新用戶端安裝 [`HttpCookies`](client-cookies.md) 外掛程式。

在以下範例中，由於保留了 Cookie，每次請求後重載次數都會增加：

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

> 如需完整範例，請參閱 [session-cookie-client](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-client)。

## 測試 HTTPS {id="https"}

若要測試 [HTTPS 端點](server-ssl.md)，請使用 [`URLBuilder.protocol`](client-requests.md#url) 屬性設定請求協定：

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

> 如需完整範例，請參閱 [ssl-engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-engine-main)。

## 測試 WebSockets {id="testing-ws"}

您可以使用 [`WebSockets`](client-websockets.topic) 用戶端外掛程式來測試 [WebSocket 對話](server-websockets.md)：

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

## 使用 HttpClient 進行端對端測試 {id="end-to-end"}

您可以使用 [Ktor HTTP 用戶端](client-create-and-configure.md) 對您的伺服器應用程式進行完整的端對端測試。

在下面的範例中，HTTP 用戶端向 `TestServer` 發送測試請求：

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

> 如需完整的端對端測試範例，請參閱 [embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server) 和 [e2e](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/e2e)。