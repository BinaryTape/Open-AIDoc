[//]: # (title: Ktor サーバーのテスト)

<show-structure for="chapter" depth="3"/>

<tldr>
<p>
<b>必要な依存関係</b>: <code>io.ktor:ktor-server-test-host</code>, <code>org.jetbrains.kotlin:kotlin-test</code>
</p>
</tldr>

<link-summary>
特別なテストエンジンを使用してサーバーアプリケーションをテストする方法を学びます。
</link-summary>

Ktor は、実際の Web サーバーを起動したりソケットにバインドしたりすることなく、アプリケーションの呼び出しを直接実行するテストエンジンを提供します。リクエストは内部で処理されるため、フルサーバーを実行する場合と比較して、テストが高速かつ信頼性の高いものになります。

## 依存関係の追加 {id="add-dependencies"}

Ktor サーバーアプリケーションをテストするには、ビルドスクリプトに以下の依存関係を含めます。

* `ktor-server-test-host` 依存関係は、テストエンジンを提供します。

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

* `kotlin-test` 依存関係は、アサーションを実行するための一連のユーティリティ関数を提供します。

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

> [Native サーバー](server-native.md#add-dependencies)のテストでは、これらのアーティファクトを `nativeTest` ソースセットに追加してください。

## テストの概要 {id="overview"}

[`testApplication {}`](https://api.ktor.io/ktor-server-test-host/io.ktor.server.testing/test-application.html) 関数と、提供される [HTTP クライアント](client-create-and-configure.md)を使用して Ktor アプリケーションをテストできます。一般的なワークフローは以下のステップで構成されます。

1. `testApplication {}` を使用して[テストを定義](#junit-test-class)します。
2. アプリケーションの[テストインスタンスを設定して実行](#configure-test-app)します。
3. 必要に応じて [HTTP クライアントを設定](#configure-client)します。
4. クライアントを使用してテストアプリケーションに [HTTP リクエストを送信](#make-request)し、レスポンスを受け取ります。
5. ステータスコード、ヘッダー、ボディの内容など、`kotlin.test` のアサーションを使用して[レスポンスを検証](#assert)します。

以下の例は、`GET /` リクエストに対してプレーンテキストで応答するシンプルな Ktor アプリケーションをテストするものです。

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

## JUnit テストクラスのセットアップ {id="junit-test-class"}

Ktor アプリケーションのテストを作成する前に、テストファイルと JUnit テストクラスを作成します。

<procedure>

1. プロジェクト内の `src/test/kotlin` ディレクトリを探すか、作成します。
2. 新しい Kotlin ファイル（例：`ApplicationTest.kt`）を作成します。
3. テストを含む Kotlin クラスを定義します。
    ```kotlin 
    class ApplicationTest {
        // テスト関数をここに記述します
    }
    ```
4. `@Test` アノテーションを付けたテスト関数を追加します。テスト内では、`testApplication {}` 関数を使用してテスト環境でアプリケーションを実行します。
   ```kotlin 
    class ApplicationTest {
        @Test
        fun testRoot() = testApplication {
            // ...
        }
    }
    ```
</procedure>

`testApplication {}` 関数は、Ktor におけるサーバーテストのエントリポイントです。これは隔離されたテスト環境を作成し、実際の Web サーバーを起動せずにアプリケーションを実行し、リクエストの送信やレスポンスの検証を行うための事前設定済み HTTP クライアントを提供します。

`testApplication {}` ブロック内では、ロードするモジュール、公開するルート、環境のセットアップ、モック化する外部サービスなど、テストアプリケーションの動作を設定します。

次のセクションでは、利用可能な設定オプションについて説明します。

## テストアプリケーションの設定 {id="configure-test-app"}

テストアプリケーションの設定では、以下のことが可能です。

- [アプリケーションモジュールの追加](#add-modules)
- [ルートの追加](#add-routing)
- [環境のカスタマイズ](#environment)
- [外部サービスのモック](#external-services)

> デフォルトでは、設定されたテストアプリケーションは[最初のクライアント呼び出し](#make-request)時に開始されます。
> 必要に応じて、`startApplication()` 関数を呼び出してアプリケーションを手動で開始することもできます。
> これは、アプリケーションの[ライフサイクルイベント](server-events.md#predefined-events)をテストする必要がある場合に便利です。

### アプリケーションモジュールの追加 {id="add-modules"}

[モジュール](server-modules.md)は、[明示的にロードする](#explicit-module-loading)か、[環境を設定する](#configure-env)かのいずれかの方法でテストアプリケーションにロードする必要があります。

#### 明示的なモジュールのロード {id="explicit-module-loading"}

テストアプリケーションに手動でモジュールを追加するには、`application {}` ブロックを使用します。

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

        // application プロパティにアクセスします
        val app: Application = application

        // 同じインスタンスであることを確認します
        assertSame(configuredApplication, app)
    }
}
```

#### 設定ファイルからのモジュールのロード {id="configure-env"}

設定ファイルからモジュールをロードするには、`environment {}` ブロックを使用してテスト用の設定ファイルを指定します。

```kotlin
@Test
fun testHello() = testApplication {
    environment {
        config = ApplicationConfig("application-custom.conf")
    }
}
```

このメソッドは、異なる環境を模倣したり、テスト中にカスタム設定設定を使用したりする必要がある場合に便利です。

### アプリケーションインスタンスへのアクセス {id="access-application"}

`application {}` ブロック内では、設定中の `Application` インスタンスにアクセスできます。

```kotlin
testApplication {
    application {
        val app: Application = this
        // ここでアプリケーションインスタンスを操作します
    }
}
```
さらに、`testApplication` スコープは `application` プロパティを公開しており、テストで使用されるのと同じ `Application` インスタンスを返します。これにより、テストコードからアプリケーションを直接検査または操作できます。

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

        // application プロパティにアクセスします
        val app: Application = application

        // 同じインスタンスであることを確認します
        assertSame(configuredApplication, app)
    }
}
```

> `startApplication()` を呼び出す前、または最初のクライアントリクエストを作成する前に `application` プロパティにアクセスすると、`Application` インスタンスは返されますが、まだ開始されていない可能性があります。
> 
{style="note"}

### ルートの追加 {id="add-routing"}

`routing {}` ブロックを使用して、テストアプリケーションにルートを追加できます。この方法は、完全なモジュールをロードせずにルートをテストする場合や、テスト専用のエンドポイントを追加する場合に便利です。

以下の例では、テストでユーザーセッションを初期化するために使用される `/login-test` エンドポイントを追加しています。

```kotlin
fun testHello() = testApplication {
    routing {
        get("/login-test") {
            call.sessions.set(UserSession("xyzABC123","abc123"))
        }
    }
}
```
   
> 完全なテスト例については、[auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google) を参照してください。

### 環境のカスタマイズ {id="environment"}

テストアプリケーションにカスタム環境を設定するには、`environment {}` 関数を使用します。

例えば、`test/resources` フォルダから設定ファイルをロードする場合：

```kotlin
@Test
fun testHello() = testApplication {
    environment {
        config = ApplicationConfig("application-custom.conf")
    }
}
```

あるいは、[`MapApplicationConfig`](https://api.ktor.io/ktor-server-core/io.ktor.server.config/-map-application-config/index.html) を使用してプログラムで設定プロパティを提供することもできます。これは、アプリケーションが開始される前にアプリケーション設定にアクセスする必要がある場合に便利です。

```kotlin
@Test
fun testDevEnvironment() = testApplication {
    environment {
        config = MapApplicationConfig("ktor.environment" to "dev")
    }
}
```

### 外部サービスのモック {id="external-services"}

`externalServices {}` 関数を使用して外部サービスをシミュレートできます。そのブロック内で、モック化したい各サービスに対して `hosts() {}` 関数を使用します。`hosts() {}` ブロック内では、ルートを定義しプラグインをインストールすることで、モックサービスとして機能する `Application` を設定できます。

以下の例では、Google API からの JSON レスポンスをシミュレートしています。

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

> 完全なテスト例については、[auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google) を参照してください。

## クライアントの設定 {id="configure-client"}

`testApplication {}` 関数は、`client` プロパティを通じて設定済みの HTTP クライアントを提供します。クライアントをカスタマイズして追加のプラグインをインストールするには、`createClient {}` 関数を使用します。

例えば、`POST/PUT` リクエストで [JSON データを送信](#json-data)するために [`ContentNegotiation`](client-serialization.md) プラグインをインストールできます。

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

## リクエストの作成 {id="make-request"}

設定されたクライアントを使用して、[リクエストの作成](client-requests.md)と[レスポンスの受信](client-responses.md)を行います。

以下の例では、`POST` リクエストを処理する `/customer` エンドポイントをテストしています。

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

## 結果の検証 (Assert) {id="assert"}

レスポンスを受け取った後、[`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) ライブラリのアサーションを使用して結果を検証できます。

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

## POST/PUT リクエストのテスト {id="test-post-put"}

### フォームデータの送信 {id="form-data"}

テストリクエストでフォームデータを送信するには、[`header()`](client-requests.md#headers) 関数と [`setBody()`](client-requests.md#body) 関数を使用して `Content-Type` ヘッダーとリクエストボディを設定します。

#### キー/値ペア {id="x-www-form-urlencoded"}

POST リクエストでキー/値のフォームパラメータを送信するには、`Content-Type` ヘッダーを `application/x-www-form-urlencoded` に設定し、[`formUrlEncode()`](https://api.ktor.io/ktor-http/io.ktor.http/form-url-encode.html) 関数を使用してパラメータをエンコードします。

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

#### マルチパートフォームデータ (Multipart form data) {id="multipart-form-data"}

`multipart/form-data` コンテンツタイプを使用してマルチパートフォームデータを構築し、ファイルのアップロードをテストできます。

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

### JSON データの送信 {id="json-data"}

`POST/PUT` リクエストで JSON データをシリアライズおよびデシリアライズするには、新しいクライアントに [`ContentNegotiation`](client-serialization.md) プラグインをインストールします。

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

## テスト中のクッキーの保持 {id="preserving-cookies"}

リクエスト間でクッキーを保持するには、新しいクライアントに [`HttpCookies`](client-cookies.md) プラグインをインストールします。

以下の例では、クッキーが保持されるため、各リクエストの後にリロードカウントが増加します。

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

> 完全な例については、[session-cookie-client](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-client) を参照してください。

## HTTPS のテスト {id="https"}

[HTTPS エンドポイント](server-ssl.md)をテストするには、[`URLBuilder.protocol`](client-requests.md#url) プロパティを使用してリクエストプロトコルを設定します。

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

## WebSocket のテスト {id="testing-ws"}

[`WebSockets`](client-websockets.topic) クライアントプラグインを使用することで、[WebSocket の会話](server-websockets.md)をテストできます。

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

## HttpClient を使用したエンドツーエンドテスト {id="end-to-end"}

[Ktor HTTP クライアント](client-create-and-configure.md)を使用して、サーバーアプリケーションの完全なエンドツーエンドテストを実行できます。

以下の例では、HTTP クライアントが `TestServer` に対してテストリクエストを作成しています。

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

> 完全なエンドツーエンドテストの例については、[embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server) および [e2e](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/e2e) を参照してください。