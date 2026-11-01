[//]: # (title: 요청 검증)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="RequestValidation"/>
<var name="package_name" value="io.ktor.server.plugins.requestvalidation"/>
<var name="artifact_name" value="ktor-server-request-validation"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.requestValidation"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="request-validation"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor는 Kotlin/Native를 지원하며 추가 런타임이나 가상 머신 없이 서버를 실행할 수 있습니다.">네이티브 서버</Links> 지원</b>: ✅
</p>
</tldr>

<link-summary>
%plugin_name%은 들어오는 요청의 본문(body)을 검증하는 기능을 제공합니다.
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-request-validation/io.ktor.server.plugins.requestvalidation/-request-validation.html) 플러그인은 들어오는 요청의 본문(body)을 검증하는 기능을 제공합니다. [직렬 변환기(serializer)](server-serialization.md#configure_serializer)가 구성된 `ContentNegotiation` 플러그인이 설치되어 있다면, 가공되지 않은 원시 요청 본문(raw request body)이나 지정된 요청 객체의 프로퍼티를 검증할 수 있습니다. 요청 본문 검증에 실패하면 플러그인은 `RequestValidationException`을 발생시키며, 이는 [StatusPages](server-status-pages.md) 플러그인을 사용하여 처리할 수 있습니다.

## 의존성 추가 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code>을 사용하려면 빌드 스크립트에 <code>%artifact_name%</code> 아티팩트를 추가하세요:
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            위 코드 스니펫은 Ktor 의존성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 버전 카탈로그</a>를 사용합니다.
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            위 코드 스니펫은 Ktor 의존성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 버전 카탈로그</a>를 사용합니다.
        </note>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>

## %plugin_name% 설치 {id="install_plugin"}

<p>
    애플리케이션에 <code>%plugin_name%</code> 플러그인을 <a href="server-plugins.md#install">설치</a>하려면,
    지정된 <Links href="server-modules.md" summary="모듈을 사용하면 라우트를 그룹화하여 애플리케이션을 구조화할 수 있습니다.">모듈</Links>의 <code>install</code> 함수에 전달하세요.
    다음 예제는 <code>%plugin_name%</code>을 설치하는 방법을 보여줍니다:
</p>
<list>
    <li>
        <code>embeddedServer()</code> 함수 호출 내에서 설치.
    </li>
    <li>
        <code>Application</code> 클래스에 명시적으로 정의된 <code>module()</code> 확장 함수 내에서 설치.
    </li>
</list>
<Tabs>
    <TabItem title="embeddedServer">
        <code-block lang="kotlin" code="            import io.ktor.server.engine.*&#10;            import io.ktor.server.netty.*&#10;            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;&#10;            fun main() {&#10;                embeddedServer(Netty, port = 8080) {&#10;                    install(%plugin_name%)&#10;                    // ...&#10;                }.start(wait = true)&#10;            }"/>
    </TabItem>
    <TabItem title="module">
        <code-block lang="kotlin" code="            import io.ktor.server.application.*&#10;            import %package_name%.*&#10;            // ...&#10;            fun Application.module() {&#10;                install(%plugin_name%)&#10;                // ...&#10;            }"/>
    </TabItem>
</Tabs>
<p>
    <code>%plugin_name%</code> 플러그인은 <a href="server-plugins.md#install-route">특정 라우트에 설치</a>할 수도 있습니다.
    이는 애플리케이션의 서로 다른 리소스에 대해 다른 <code>%plugin_name%</code> 설정이 필요한 경우 유용할 수 있습니다.
</p>

## %plugin_name% 구성 {id="configure"}

`%plugin_name%` 구성은 주로 세 단계로 진행됩니다:

1. [본문 내용 수신](#receive-body)
2. [검증 함수 구성](#validation-function)
3. [검증 예외 처리](#validation-exception)

### 1. 본문 수신 {id="receive-body"}

`%plugin_name%` 플러그인은 타입 매개변수와 함께 **[receive](server-requests.md#body_contents)** 함수를 호출할 때 요청 본문을 검증합니다. 예를 들어, 아래 코드 스니펫은 본문을 `String` 값으로 수신하는 방법을 보여줍니다:

```kotlin
routing {
    post("/text") {
        val body = call.receive<String>()
        call.respond(body)
    }
}
```

### 2. 검증 함수 구성 {id="validation-function"}

요청 본문을 검증하려면 `validate` 함수를 사용하세요. 
이 함수는 성공 또는 실패 검증 결과를 나타내는 `ValidationResult` 객체를 반환합니다.
실패한 결과의 경우 **[RequestValidationException](#validation-exception)**이 발생합니다.

`validate` 함수에는 두 가지 오버로드가 있어 두 가지 방식으로 요청 본문을 검증할 수 있습니다:

- 첫 번째 `validate` 오버로드는 요청 본문에 지정된 타입의 객체로 접근할 수 있게 해줍니다.
   아래 예제는 `String` 값을 나타내는 요청 본문을 검증하는 방법을 보여줍니다:
   ```kotlin
   install(RequestValidation) {
       validate<String> { bodyText ->
           if (!bodyText.startsWith("Hello"))
               ValidationResult.Invalid("Body text should start with 'Hello'")
           else ValidationResult.Valid
       }
   }
   ```

   특정 [직렬 변환기](server-serialization.md#configure_serializer)로 구성된 `ContentNegotiation` 플러그인이 설치되어 있다면 객체 프로퍼티를 검증할 수 있습니다. 자세한 내용은 [예제: 객체 프로퍼티 검증](#example-object)을 참고하세요.

- 두 번째 `validate` 오버로드는 `ValidatorBuilder`를 받아 사용자 정의 검증 규칙을 제공할 수 있도록 합니다. 
   자세한 내용은 [예제: 바이트 배열 검증](#example-byte-array)을 참고하세요.

### 3. 검증 예외 처리 {id="validation-exception"}

요청 검증에 실패하면 `%plugin_name%`은 `RequestValidationException`을 발생시킵니다.
이 예외를 통해 요청 본문에 접근하고 해당 요청에 대한 모든 검증 실패 이유를 가져올 수 있습니다.

다음과 같이 [StatusPages](server-status-pages.md) 플러그인을 사용하여 `RequestValidationException`을 처리할 수 있습니다:

```kotlin
install(StatusPages) {
    exception<RequestValidationException> { call, cause ->
        call.respond(HttpStatusCode.BadRequest, cause.reasons.joinToString())
    }
}
```

전체 예제는 여기에서 확인할 수 있습니다: [request-validation](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/request-validation).

## 예제: 객체 프로퍼티 검증 {id="example-object"}

이 예제에서는 `%plugin_name%` 플러그인을 사용하여 객체 프로퍼티를 검증하는 방법을 살펴보겠습니다.
서버가 다음과 같은 JSON 데이터와 함께 `POST` 요청을 수신한다고 가정해 봅니다:

```HTTP
POST http://0.0.0.0:8080/json
Content-Type: application/json

{
  "id": -1,
  "firstName": "Jet",
  "lastName": "Brains"
}
```

`id` 프로퍼티에 대한 검증을 추가하려면 다음 단계를 따르세요:

1. 위의 JSON 객체를 설명하는 `Customer` 데이터 클래스를 생성합니다:
   ```kotlin
   @Serializable
   data class Customer(val id: Int, val firstName: String, val lastName: String)
   ```

2. [JSON 직렬 변환기](server-serialization.md#register_json)와 함께 `ContentNegotiation` 플러그인을 설치합니다:
   ```kotlin
   install(ContentNegotiation) {
       json()
   }
   ```

3. 서버 측에서 다음과 같이 `Customer` 객체를 수신합니다:
   ```kotlin
   post("/json") {
       val customer = call.receive<Customer>()
       call.respond(customer)
   }
   ```
4. `%plugin_name%` 플러그인 설정에서 `id` 프로퍼티가 지정된 범위에 속하는지 확인하는 검증을 추가합니다:
   ```kotlin
   install(RequestValidation) {
       validate<Customer> { customer ->
           if (customer.id <= 0)
               ValidationResult.Invalid("A customer ID should be greater than 0")
           else ValidationResult.Valid
       }
   }
   ```
   
   이 경우, `id` 값이 `0` 이하이면 `%plugin_name%`이 **[RequestValidationException](#validation-exception)**을 발생시킵니다.

## 예제: 바이트 배열 검증 {id="example-byte-array"}

이 예제에서는 바이트 배열로 수신된 요청 본문을 검증하는 방법을 살펴보겠습니다.
서버가 다음과 같은 텍스트 데이터와 함께 `POST` 요청을 수신한다고 가정해 봅니다:

```HTTP
POST http://localhost:8080/array
Content-Type: text/plain

-1
```

데이터를 바이트 배열로 수신하고 검증하려면 다음 단계를 수행하세요:

1. 서버 측에서 다음과 같이 데이터를 수신합니다:
   ```kotlin
   post("/array") {
       val body = call.receive<ByteArray>()
       call.respond(String(body))
   }
   ```
2. 수신된 데이터를 검증하기 위해, `ValidatorBuilder`를 인수로 받아 사용자 정의 검증 규칙을 제공할 수 있는 두 번째 `validate` [함수 오버로드](#validation-function)를 사용합니다:
   ```kotlin
   install(RequestValidation) {
       validate {
           filter { body ->
               body is ByteArray
           }
           validation { body ->
               check(body is ByteArray)
               val intValue = String(body).toInt()
               if (intValue <= 0)
                   ValidationResult.Invalid("A value should be greater than 0")
               else ValidationResult.Valid
           }
       }
   }
   ```