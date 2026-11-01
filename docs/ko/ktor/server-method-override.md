[//]: # (title: XHttpMethodOverride)

<primary-label ref="server-plugin"/>

<var name="plugin_name" value="XHttpMethodOverride"/>
<var name="package_name" value="io.ktor.server.plugins.methodoverride"/>
<var name="artifact_name" value="ktor-server-method-override"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.methodOverride"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="json-kotlinx-method-override"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor는 Kotlin/Native를 지원하며 추가 런타임이나 가상 머신 없이 서버를 실행할 수 있습니다.">Native 서버</Links> 지원</b>: ✅
</p>
</tldr>

<link-summary>
%plugin_name%은(는) X-HTTP-Method-Override 헤더 내에 HTTP 메서드를 터널링하는 기능을 제공합니다.
</link-summary>

[%plugin_name%](https://api.ktor.io/ktor-server-method-override/io.ktor.server.plugins.methodoverride/-x-http-method-override.html) 플러그인은 `X-HTTP-Method-Override` 헤더 내에 HTTP 메서드(verb)를 터널링하는 기능을 제공합니다.
이 기능은 서버 API가 여러 HTTP 메서드(`GET`, `PUT`, `POST`, `DELETE` 등)를 처리하지만, 클라이언트가 특정 제약으로 인해 제한된 메서드 세트(예: `GET` 및 `POST`)만 사용할 수 있는 경우 유용합니다.
예를 들어 클라이언트가 `X-Http-Method-Override` 헤더를 `DELETE`로 설정하여 요청을 보내면, Ktor는 `delete` [라우트 핸들러](server-routing.md#define_route)를 사용하여 해당 요청을 처리합니다.

## 의존성 추가 {id="add_dependencies"}

<p>
    <code>%plugin_name%</code>을(를) 사용하려면 빌드 스크립트에 <code>%artifact_name%</code> 아티팩트를 추가하세요:
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(%ktor_version_catalog_name%)"/>
        <note>
            위 코드 스니펫은 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 버전 카탈로그</a>를 사용하여 Ktor 의존성을 지정합니다.
        </note>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation %ktor_version_catalog_name%"/>
        <note>
            위 코드 스니펫은 <a href="server-dependencies.topic#using-version-catalog">
            Ktor 버전 카탈로그</a>를 사용하여 Ktor 의존성을 지정합니다.
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
    다음 예제는 <code>%plugin_name%</code>을(를) 설치하는 방법을 보여줍니다:
</p>
<list>
    <li>
        <code>embeddedServer()</code> 함수 호출 내부.
    </li>
    <li>
        <code>Application</code> 클래스에 명시적으로 정의된 <code>module()</code> 확장 함수 내부.
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

## %plugin_name% 구성 {id="configure"}

기본적으로 `%plugin_name%`은(는) `X-Http-Method-Override` 헤더를 확인하여 요청을 처리해야 하는 라우트를 결정합니다.
`headerName` 프로퍼티를 사용하여 헤더 이름을 커스텀할 수 있습니다.

## 예제 {id="example"}

아래의 HTTP 요청은 `X-Http-Method-Override` 헤더가 `DELETE`로 설정된 `POST` 메서드를 사용합니다:

```http request
POST http://0.0.0.0:8080/customer/3
X-Http-Method-Override: DELETE

```

`delete` [라우트 핸들러](server-routing.md#define_route)를 사용하여 이러한 요청을 처리하려면 `%plugin_name%`을(를) 설치해야 합니다:

```kotlin
package com.example

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.methodoverride.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import io.ktor.server.util.getValue

@Serializable
data class Customer(val id: Int, val firstName: String, val lastName: String)

fun Application.main() {
    val customerStorage = mutableListOf<Customer>()
    customerStorage.addAll(
        arrayOf(
            Customer(1, "Jane", "Smith"),
            Customer(2, "John", "Smith"),
            Customer(3, "Jet", "Brains")
        )
    )

    install(XHttpMethodOverride)
    install(ContentNegotiation) {
        json(Json)
    }
    routing {
        get("/customer/{id}") {
            val id: Int by call.parameters
            val customer: Customer = customerStorage.find { it.id == id }!!
            call.respond(customer)
        }

        delete("/customer/{id}") {
            val id: Int by call.parameters
            customerStorage.removeIf { it.id == id }
            call.respondText("Customer is removed", status = HttpStatusCode.NoContent)
        }
    }
}

```

전체 예제는 여기에서 확인할 수 있습니다: [json-kotlinx-method-override](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/json-kotlinx-method-override).