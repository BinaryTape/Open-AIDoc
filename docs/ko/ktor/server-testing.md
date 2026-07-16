[//]: # (title: Ktor 서버 테스트)

<show-structure for="chapter" depth="3"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:ktor-server-test-host</code>, <code>org.jetbrains.kotlin:kotlin-test</code>
</p>
</tldr>

<link-summary>
특별한 테스트 엔진을 사용하여 서버 애플리케이션을 테스트하는 방법을 알아봅니다.
</link-summary>

Ktor는 실제 웹 서버를 시작하거나 소켓에 바인딩하지 않고 애플리케이션 호출을 직접 실행하는 테스트 엔진을 제공합니다. 요청이 내부적으로 처리되므로, 전체 서버를 실행하는 것보다 테스트가 더 빠르고 안정적입니다.

## 의존성 추가 {id="add-dependencies"}

Ktor 서버 애플리케이션을 테스트하려면 빌드 스크립트에 다음 의존성을 포함하세요:

* `ktor-server-test-host` 의존성은 테스트 엔진을 제공합니다:

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

* `kotlin-test` 의존성은 어설션(assertion)을 수행하기 위한 유틸리티 함수 세트를 제공합니다:

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

> [Native 서버](server-native.md#add-dependencies) 테스트의 경우, 이러한 아티팩트들을 `nativeTest` 소스 세트에 추가하세요.

## 테스트 개요 {id="overview"}

[`testApplication {}`](https://api.ktor.io/ktor-server-test-host/io.ktor.server.testing/test-application.html) 함수와 제공된 [HTTP 클라이언트](client-create-and-configure.md)를 사용하여 Ktor 애플리케이션을 테스트할 수 있습니다. 일반적인 워크플로우는 다음 단계로 구성됩니다:

1. `testApplication {}`을 사용하여 [테스트를 정의](#junit-test-class)합니다.
2. 애플리케이션의 [테스트 인스턴스를 구성하고 실행](#configure-test-app)합니다.
3. 선택적으로, [HTTP 클라이언트를 구성](#configure-client)합니다.
4. 클라이언트를 사용하여 테스트 애플리케이션에 [HTTP 요청을 보내고](#make-request) 응답을 받습니다.
5. 상태 코드, 헤더, 본문 내용 등을 포함하여 `kotlin.test`의 어설션을 사용해 [응답을 검증](#assert)합니다.

다음 예제는 `GET /` 요청에 대해 일반 텍스트로 응답하는 간단한 Ktor 애플리케이션을 테스트합니다:

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

> 전체 코드 예제는 [engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/engine-main)을 참조하세요.

## JUnit 테스트 클래스 설정 {id="junit-test-class"}

Ktor 애플리케이션에 대한 테스트를 작성하기 전에 테스트 파일과 JUnit 테스트 클래스를 생성하세요.

<procedure>

1. 프로젝트에서 `src/test/kotlin` 디렉토리를 찾거나 생성합니다.
2. 새 Kotlin 파일(예: `ApplicationTest.kt`)을 생성합니다.
3. 테스트를 포함할 Kotlin 클래스를 정의합니다:
    ```kotlin 
    class ApplicationTest {
        // 테스트 함수가 여기에 들어갑니다.
    }
    ```
4. `@Test` 어노테이션이 달린 테스트 함수를 추가합니다. 테스트 내부에서 `testApplication {}` 함수를 사용하여 테스트 환경에서 애플리케이션을 실행합니다:
   ```kotlin 
    class ApplicationTest {
        @Test
        fun testRoot() = testApplication {
            // ...
        }
    }
    ```
</procedure>

`testApplication {}` 함수는 Ktor 서버 테스트의 진입점입니다. 이 함수는 격리된 테스트 환경을 생성하고, 실제 웹 서버를 시작하지 않고 애플리케이션을 실행하며, 요청을 보내고 응답을 검증할 수 있도록 미리 구성된 HTTP 클라이언트를 제공합니다.

`testApplication {}` 블록 내부에서 로드할 모듈, 노출할 라우트, 환경 설정 방법 또는 모킹(mock)할 외부 서비스 등 테스트 애플리케이션이 어떻게 작동해야 하는지 구성합니다.

다음 섹션에서는 사용 가능한 구성 옵션에 대해 설명합니다.

## 테스트 애플리케이션 구성 {id="configure-test-app"}

테스트 애플리케이션을 구성할 때 다음 작업을 수행할 수 있습니다:

- [애플리케이션 모듈 추가](#add-modules)
- [라우트 추가](#add-routing)
- [환경 사용자 정의](#environment)
- [외부 서비스 모킹](#external-services)

> 기본적으로 구성된 테스트 애플리케이션은 [첫 번째 클라이언트 호출](#make-request) 시 시작됩니다.
> 선택적으로 `startApplication()` 함수를 호출하여 애플리케이션을 수동으로 시작할 수 있습니다.
> 이는 애플리케이션의 [수명 주기 이벤트](server-events.md#predefined-events)를 테스트해야 할 때 유용할 수 있습니다.

### 애플리케이션 모듈 추가 {id="add-modules"}

[모듈](server-modules.md)은 [명시적으로 로드](#explicit-module-loading)하거나 [환경을 구성](#configure-env)하여 테스트 애플리케이션에 로드해야 합니다.

#### 명시적 모듈 로딩 {id="explicit-module-loading"}

테스트 애플리케이션에 모듈을 수동으로 추가하려면 `application {}` 블록을 사용하세요:

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

        // application 프로퍼티에 접근
        val app: Application = application

        // 동일한 인스턴스인지 검증
        assertSame(configuredApplication, app)
    }
}
```

#### 설정 파일에서 모듈 로드 {id="configure-env"}

설정 파일에서 모듈을 로드하려면 `environment {}` 블록을 사용하여 테스트를 위한 설정 파일을 지정하세요:

```kotlin
@Test
fun testHello() = testApplication {
    environment {
        config = ApplicationConfig("application-custom.conf")
    }
}
```

이 방법은 테스트 중에 다양한 환경을 흉내 내거나 사용자 정의 구성 설정을 사용해야 할 때 유용합니다.

### 애플리케이션 인스턴스 접근 {id="access-application"}

`application {}` 블록 내부에서 구성 중인 `Application` 인스턴스에 접근할 수 있습니다:

```kotlin
testApplication {
    application {
        val app: Application = this
        // 여기서 애플리케이션 인스턴스와 상호작용
    }
}
```
또한 `testApplication` 스코프는 테스트에서 사용하는 것과 동일한 `Application` 인스턴스를 반환하는 `application` 프로퍼티를 노출합니다. 이를 통해 테스트 코드에서 직접 애플리케이션을 검사하거나 상호작용할 수 있습니다.

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

        // application 프로퍼티에 접근
        val app: Application = application

        // 동일한 인스턴스인지 검증
        assertSame(configuredApplication, app)
    }
}
```

> `startApplication()`을 호출하거나 첫 번째 클라이언트 요청을 하기 전에 `application` 프로퍼티에 접근하면 `Application` 인스턴스를 반환하지만, 아직 시작되지 않았을 수 있습니다.
> 
{style="note"}

### 라우트 추가 {id="add-routing"}

`routing {}` 블록을 사용하여 테스트 애플리케이션에 라우트를 추가할 수 있습니다. 이 방식은 전체 모듈을 로드하지 않고 라우트를 테스트하거나 테스트 전용 엔드포인트를 추가하는 데 유용합니다.

다음 예제는 테스트에서 사용자 세션을 초기화하는 데 사용되는 `/login-test` 엔드포인트를 추가합니다:

```kotlin
fun testHello() = testApplication {
    routing {
        get("/login-test") {
            call.sessions.set(UserSession("xyzABC123","abc123"))
        }
    }
}
```
   
> 전체 테스트 예제는 [auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google)을 참조하세요.

### 환경 사용자 정의 {id="environment"}

테스트 애플리케이션을 위한 사용자 정의 환경을 구성하려면 `environment {}` 함수를 사용하세요.

예를 들어, `test/resources` 폴더에서 설정 파일을 로드하려면 다음과 같이 합니다:

```kotlin
@Test
fun testHello() = testApplication {
    environment {
        config = ApplicationConfig("application-custom.conf")
    }
}
```

또는 [`MapApplicationConfig`](https://api.ktor.io/ktor-server-core/io.ktor.server.config/-map-application-config/index.html)를 사용하여 프로그래밍 방식으로 구성 속성을 제공할 수 있습니다. 이는 애플리케이션이 시작되기 전에 애플리케이션 구성에 접근해야 할 때 유용합니다.

```kotlin
@Test
fun testDevEnvironment() = testApplication {
    environment {
        config = MapApplicationConfig("ktor.environment" to "dev")
    }
}
```

### 외부 서비스 모킹 {id="external-services"}

`externalServices {}` 함수를 사용하여 외부 서비스를 시뮬레이션할 수 있습니다. 이 블록 내부에서 모킹하려는 각 서비스에 대해 `hosts() {}` 함수를 사용합니다. `hosts() {}` 블록 내에서 라우트를 정의하고 플러그인을 설치하여 모의 서비스 역할을 하는 `Application`을 구성할 수 있습니다.

다음 예제는 Google API의 JSON 응답을 시뮬레이션합니다:

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

> 전체 테스트 예제는 [auth-oauth-google](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-oauth-google)을 참조하세요.

## 클라이언트 구성 {id="configure-client"}

`testApplication {}` 함수는 `client` 프로퍼티를 통해 구성된 HTTP 클라이언트를 제공합니다. 
클라이언트를 사용자 정의하고 추가 플러그인을 설치하려면 `createClient {}` 함수를 사용하세요.

예를 들어, `POST/PUT` 요청에서 [JSON 데이터](#json-data)를 보내기 위해 [`ContentNegotiation`](client-serialization.md) 플러그인을 설치할 수 있습니다:

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

## 요청 수행 {id="make-request"}

구성된 클라이언트를 사용하여 [요청을 보내고](client-requests.md) [응답을 받습니다](client-responses.md).

다음 예제는 `POST` 요청을 처리하는 `/customer` 엔드포인트를 테스트합니다:

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

> 전체 테스트 예제는 [json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/json-kotlinx)를 참조하세요.

## 결과 검증 {id="assert"}

응답을 받은 후, [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) 라이브러리의 어설션을 사용하여 결과를 확인할 수 있습니다:

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

## POST/PUT 요청 테스트 {id="test-post-put"}

### 폼 데이터 전송 {id="form-data"}

테스트 요청에서 폼 데이터를 보내려면 [`header()`](client-requests.md#headers) 및 [`setBody()`](client-requests.md#body) 함수를 사용하여 `Content-Type` 헤더와 요청 본문을 설정합니다.

#### 키/값 쌍 {id="x-www-form-urlencoded"}

POST 요청에서 키/값 폼 파라미터를 보내려면 `Content-Type` 헤더를 `application/x-www-form-urlencoded`로 설정하고 [`formUrlEncode()`](https://api.ktor.io/ktor-http/io.ktor.http/form-url-encode.html) 함수를 사용하여 파라미터를 인코딩합니다:

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

> 전체 코드 예제는 [post-form-parameters](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/post-form-parameters)를 참조하세요.

#### 멀티파트 폼 데이터 {id="multipart-form-data"}

`multipart/form-data` 콘텐츠 타입을 사용하여 멀티파트 폼 데이터를 작성하고 파일 업로드를 테스트할 수 있습니다:

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

> 전체 코드 예제는 [upload-file](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/upload-file)을 참조하세요.

### JSON 데이터 전송 {id="json-data"}

`POST/PUT` 요청에서 JSON 데이터를 직렬화 및 역직렬화하려면 새 클라이언트에 [`ContentNegotiation`](client-serialization.md) 플러그인을 설치하세요.

요청 내부에서 `contentType()` 함수를 사용하여 `Content-Type` 헤더를 지정하고, `setBody()` 함수를 사용하여 요청 본문을 지정할 수 있습니다.

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

> 전체 예제는 [json-kotlinx](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/json-kotlinx)를 참조하세요.

## 테스트 중 쿠키 유지하기 {id="preserving-cookies"}

요청 간에 쿠키를 유지하려면 새 클라이언트에 [`HttpCookies`](client-cookies.md) 플러그인을 설치하세요.

다음 예제에서는 쿠키가 유지되므로 각 요청 후에 리로드 횟수가 증가합니다:

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

> 전체 예제는 [session-cookie-client](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/session-cookie-client)를 참조하세요.

## HTTPS 테스트 {id="https"}

[HTTPS 엔드포인트](server-ssl.md)를 테스트하려면 [`URLBuilder.protocol`](client-requests.md#url) 프로퍼티를 사용하여 요청 프로토콜을 설정하세요:

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

> 전체 예제는 [ssl-engine-main](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/ssl-engine-main)을 참조하세요.

## WebSocket 테스트 {id="testing-ws"}

[`WebSockets`](client-websockets.topic) 클라이언트 플러그인을 사용하여 [WebSocket 대화](server-websockets.md)를 테스트할 수 있습니다:

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

## HttpClient를 사용한 엔드투엔드(E2E) 테스트 {id="end-to-end"}

[Ktor HTTP 클라이언트](client-create-and-configure.md)를 사용하여 서버 애플리케이션의 완전한 엔드투엔드 테스트를 수행할 수 있습니다.

아래 예제에서 HTTP 클라이언트는 `TestServer`에 테스트 요청을 보냅니다:

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

> 완전한 엔드투엔드 테스트 예제는 [embedded-server](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/embedded-server) 및 [e2e](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/e2e)를 참조하세요.