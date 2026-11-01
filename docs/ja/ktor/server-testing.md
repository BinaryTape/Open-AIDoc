[//]: # (title: Ktor Serverでのテスト)

<show-structure for="chapter" depth="3"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:ktor-server-test-host</code>, <code>org.jetbrains.kotlin:kotlin-test</code>
</p>
</tldr>

<link-summary>
特別なテストエンジンを使用してサーバーアプリケーションをテストする方法を学びます。
</link-summary>

Ktorは、実際のWebサーバーを起動したりソケットにバインドしたりすることなく、アプリケーション呼び出しを直接実行するテストエンジンを提供します。リクエストは内部で処理されるため、フルサーバーを実行する場合と比較して、テストがより高速かつ高信頼になります。

## 依存関係の追加 {id="add-dependencies"}

Ktorサーバーアプリケーションをテストするには、ビルドスクリプトに以下の依存関係を含めます。

* `ktor-server-test-host` 依存関係はテストエンジンを提供します:

   <var name="artifact_name" value="ktor-server-test-host"/>
   <Tabs group="languages">
       <TabItem title="Gradle (Kotlin)" group-key="kotlin">
           <code-block lang="Kotlin" code="               testImplementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
       </TabItem>
       <TabItem title="Gradle (Groovy)" group-key="groovy">
           <code-block lang="Groovy" code="               testImplementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
       </TabItem>
       <TabItem title="Maven" group-key="maven">
           <code-block lang="XML" code="               &lt;dependency&gt;&#10;                   &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                   &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                   &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;               &lt;/dependency&gt;"/>
       </TabItem>
   </Tabs>

* `kotlin-test` 依存関係はアサーションを実行するためのユーティリティ関数セットを提供します:

  <var name="group_id" value="org.jetbrains.kotlin"/>
  <var name="artifact_name" value="kotlin-test"/>
  <var name="version" value="kotlin_version"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              testImplementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"/>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              testImplementation &quot;%group_id%:%artifact_name%:$%version%&quot;"/>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;%group_id%&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%&lt;/artifactId&gt;&#10;                  &lt;version&gt;${%version%}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>

> [Nativeサーバー](server-native.md#add-dependencies)のテストでは、これらのアーティファクトを `nativeTest` ソースセットに追加してください。

## テストの概要 {id="overview"}

[`testApplication {}`](https://api.ktor.io/ktor-server-test-host/io.ktor.server.testing/test-application.html) 関数と提供されている [HTTPクライアント](client-create-and-configure.md) を使用して、Ktorアプリケーションをテストできます。典型的なワークフローには以下のステップが含まれます。

1. `testApplication {}` を使用して[テストを定義します](#junit-test-class)。
2. アプリケーションの[テストインスタンスを設定して実行します](#configure-test-app)。
3. 必要に応じて、[HTTPクライアントを設定します](#configure-client)。
4. クライアントを使用してテストアプリケーションへ[HTTPリクエストを送信し](#make-request)、レスポンスを受信します。
5. ステータスコード、ヘッダー、ボディコンテンツなどを含め、`kotlin.test` のアサーションを使用して[レスポンスを検証します](#assert)。

以下の例では、`GET /` リクエストに対してプレーンテキストで応答するシンプルなKtorアプリケーションをテストします。

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

> 完全なコード例については、[engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main) を参照してください。

## JUnitテストクラスのセットアップ {id="junit-test-class"}

Ktorアプリケーションのテストを作成する前に、テストファイルとJUnitテストクラスを作成します。

<procedure>

1. プロジェクト内の `src/test/kotlin` ディレクトリを見つけるか、作成します。
2. 新しいKotlinファイル（例: `ApplicationTest.kt`）を作成します。
3. テストを含むKotlinクラスを定義します:
    ```kotlin 
    class ApplicationTest {
        // ここにテスト関数を記述します
    }
    ```
4. `@Test` アノテーションが付いたテスト関数を追加します。テストの内部で `testApplication {}` 関数を使用して、テスト環境でアプリケーションを実行します:
   ```kotlin 
    class ApplicationTest {
        @Test
        fun testRoot() = testApplication {
            // ...
        }
    }
    ```
</procedure>

`testApplication {}` 関数は、Ktorでのサーバーテストのエントリポイントです。隔離されたテスト環境を作成し、実際のWebサーバーを起動せずにアプリケーションを実行し、リクエストの送信やレスポンスのアサーションを行うための事前設定されたHTTPクライアントを提供します。

`testApplication {}` ブロック内では、ロードするモジュール、公開するルート、環境のセットアップ方法、モックする外部サービスなど、テストアプリケーションがどのように動作するかを設定します。

次のセクションでは、利用可能な設定オプションについて説明します。

## テストアプリケーションの設定 {id="configure-test-app"}

テストアプリケーションを設定する際、以下のことが可能です。

- [アプリケーションモジュールの追加](#add-modules)
- [ルートの追加](#add-routing)
- [環境のカスタマイズ](#environment)
- [外部サービスのモック](#external-services)

> デフォルトでは、設定されたテストアプリケーションは[最初のクライアント呼び出し](#make-request)時に起動します。
> オプションとして、`startApplication()` 関数を呼び出して手動でアプリケーションを起動することもできます。
> これは、アプリケーションの[ライフサイクルイベント](server-events.md#predefined-events)をテストする必要がある場合に便利です。

### アプリケーションモジュールの追加 {id="add-modules"}

[モジュール](server-modules.md)は、[明示的にロードする](#explicit-module-loading)か、[環境を設定する](#configure-env)かのいずれかによって、テストアプリケーションにロードする必要があります。

#### 明示的なモジュールのロード {id="explicit-module-loading"}

テストアプリケーションに手動でモジュールを追加するには、`application {}` ブロックを使用します:

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

        // application プロパティにアクセス
        val app: Application = application

        // 同じインスタンスであることをアサート
        assertSame(configuredApplication, app)
    }
}
```

#### 設定ファイルからモジュールをロードする {id="configure-env"}

設定ファイルからモジュールをロードするには、`environment {}` ブロックを使用してテスト用の設定ファイルを指定します:

```kotlin
@Test
fun testHello() = testApplication {
    environment {
        config = ApplicationConfig(
            "application-custom.conf"
        )
    }
}
```

この方法は、テスト中にさまざまな環境を模倣したり、カスタム設定を使用したりする必要がある場合に便利です。

### アプリケーションインスタンスへのアクセス {id="access-application"}

`application {}` ブロック内では、設定中の `Application` インスタンスにアクセスできます:

```kotlin
testApplication {
    application {
        val app: Application = this
        // ここでアプリケーションインスタンスを操作します
    }
}
```
さらに、`testApplication` スコープは `application` プロパティを公開しており、これはテストで使用されているのと同じ `Application` インスタンスを返します。これにより、テストコードからアプリケーションを直接調査または操作できます。

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

        // application プロパティにアクセス
        val app: Application = application

        // 同じインスタンスであることをアサート
        assertSame(configuredApplication, app)
    }
}
```

> `startApplication()` を呼び出す前、または最初のクライアントリクエストを行う前に `application` プロパティにアクセスすると `Application` インスタンスが返されますが、まだ起動していない可能性があります。
> 
{style="note"}

### ルートの追加 {id="add-routing"}

`routing {}` ブロックを使用して、テストアプリケーションにルートを追加できます。このアプローチは、完全なモジュールをロードせずにルートをテストする場合や、テスト固有のエンドポイントを追加する場合に役立ちます。

以下の例では、テストでユーザーセッションを初期化するために使用される `/login-test` エンドポイントを追加します:

```kotlin
fun testHello() = testApplication {
    routing {
        get("/login-test") {
            val session = UserSession("xyzABC123", "abc123")
            call.sessions.set(session)
        }
    }
}
```
   
> 完全なテスト例については、[auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google) を参照してください。

### 環境のカスタマイズ {id="environment"}

テストアプリケーションにカスタム環境を設定するには、`environment {}` 関数を使用します。

例えば、`test/resources` フォルダから設定ファイルをロードするには:

```kotlin
@Test
fun testHello() = testApplication {
    environment {
        config = ApplicationConfig(
            "application-custom.conf"
        )
    }
}
```

あるいは、[`MapApplicationConfig`](https://api.ktor.io/ktor-server-core/io.ktor.server.config/-map-application-config/index.html) を使用してプログラムから設定プロパティを提供することもできます。これは、アプリケーションが起動する前にアプリケーション設定にアクセスする必要がある場合に役立ちます。

```kotlin
@Test
fun testDevEnvironment() = testApplication {
    environment {
        config = MapApplicationConfig("ktor.environment" to "dev")
    }
}
```

### 外部サービスのモック {id="external-services"}

`externalServices {}` 関数を使用して、外部サービスをシミュレートできます。そのブロック内で、モックしたい各サービスに対して `hosts() {}` 関数を使用します。`hosts() {}` ブロック内では、ルートを定義したりプラグインをインストールしたりすることで、モックサービスとして機能する `Application` を設定できます。

以下の例では、Google API からの JSON レスポンスをシミュレートします:

```kotlin
@Test
fun testHello() = testApplication {
    externalServices {
        hosts("https://www.googleapis.com") {
            install(
                io.ktor.server.plugins.contentnegotiation
                    .ContentNegotiation
            ) {
                json()
            }
            routing {
                get("oauth2/v2/userinfo") {
                    val info =
                        UserInfo("1", "JetBrains", "", "")
                    call.respond(info)
                }
            }
        }
    }
}
```

> 完全なテスト例については、[auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google) を参照してください。

## クライアントの設定 {id="configure-client"}

`testApplication {}` 関数は、`client` プロパティを通じて設定済みのHTTPクライアントを提供します。クライアントをカスタマイズして追加のプラグインをインストールするには、`createClient {}` 関数を使用します。

例えば、`POST/PUT` リクエストで[JSONデータを送信する](#json-data)ために、[`ContentNegotiation`](client-serialization.md) プラグインをインストールできます:

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

## リクエストの送信 {id="make-request"}

設定されたクライアントを使用して、[リクエストを送信](client-requests.md)し、[レスポンスを受信](client-responses.md)します。

以下の例では、`POST` リクエストを処理する `/customer` エンドポイントをテストします:

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

> 完全なテスト例については、[json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/json-kotlinx) を参照してください。

## 結果のアサーション {id="assert"}

レスポンスを受信した後、[`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) ライブラリのアサーションを使用して結果を検証できます:

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

## POST/PUTリクエストのテスト {id="test-post-put"}

### フォームデータの送信 {id="form-data"}

テストリクエストでフォームデータを送信するには、[`header()`](client-requests.md#headers) および [`setBody()`](client-requests.md#body) 関数を使用して `Content-Type` ヘッダーとリクエストボディを設定します。

#### キー/値ペア {id="x-www-form-urlencoded"}

POSTリクエストでキー/値のフォームパラメータを送信するには、`Content-Type` ヘッダーを `application/x-www-form-urlencoded` に設定し、[`formUrlEncode()`](https://api.ktor.io/ktor-http/io.ktor.http/form-url-encode.html) 関数を使用してパラメータをエンコードします:

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

> 完全なコード例については、[post-form-parameters](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/post-form-parameters) を参照してください。

#### マルチパートフォームデータ {id="multipart-form-data"}

`multipart/form-data` コンテンツタイプを使用してマルチパートフォームデータを構築し、ファイルのアップロードをテストできます:

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

> 完全なコード例については、[upload-file](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/upload-file) を参照してください。

### JSONデータの送信 {id="json-data"}

`POST/PUT` リクエストでJSONデータをシリアライズおよびデシリアライズするには、新しいクライアントに [`ContentNegotiation`](client-serialization.md) プラグインをインストールします。

リクエスト内では、`contentType()` 関数を使用して `Content-Type` ヘッダーを、`setBody()` 関数を使用してリクエストボディを指定できます。

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

> 完全な例については、[json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/json-kotlinx) を参照してください。

## テスト中のCookieの保持 {id="preserving-cookies"}

リクエスト間でCookieを保持するには、新しいクライアントに [`HttpCookies`](client-cookies.md) プラグインをインストールします。

以下の例では、Cookieが保持されるため、リクエストごとにリロード回数が増加します:

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
        val secretEncryptKey = "00112233445566778899aabbccddeeff".hexToByteArray()
        val secretSignKey = "6819b57a326945c1968f45236589".hexToByteArray()
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

> 完全な例については、[session-cookie-client](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-client) を参照してください。

## HTTPSのテスト {id="https"}

[HTTPSエンドポイント](server-ssl.md)をテストするには、[`URLBuilder.protocol`](client-requests.md#url) プロパティを使用してリクエストプロトコルを設定します:

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

> 完全な例については、[ssl-engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-engine-main) を参照してください。

## WebSocketのテスト {id="testing-ws"}

[`WebSockets`](client-websockets.topic) クライアントプラグインを使用して、[WebSocket通信](server-websockets.md)をテストできます:

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

## HttpClientを使用したエンドツーエンドテスト {id="end-to-end"}

[Ktor HTTPクライアント](client-create-and-configure.md)を使用して、サーバーアプリケーションの完全なエンドツーエンドテストを実行できます。

以下の例では、HTTPクライアントが `TestServer` に対してテストリクエストを行います:

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

> 完全なエンドツーエンドテストの例については、[embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server)
> および [e2e](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/e2e) を参照してください。