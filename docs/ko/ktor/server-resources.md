[//]: # (title: 타입 안전한 라우팅)

<show-structure for="chapter" depth="2"/>
<primary-label ref="server-plugin"/>

<var name="plugin_name" value="Resources"/>
<var name="package_name" value="io.ktor.server.resources"/>
<var name="artifact_name" value="ktor-server-resources"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.resources"/>

<tldr>
<p>
<b>필요한 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="resource-routing"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="server-native.md" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">네이티브 서버</Links> 지원</b>: ✅
</p>
</tldr>

<link-summary>Resources 플러그인을 사용하면 타입 안전한 라우팅을 구현할 수 있습니다.</link-summary>

Ktor는 타입 안전한 [라우팅](server-routing.md)을 구현할 수 있도록 [Resources](https://api.ktor.io/ktor-resources/io.ktor.resources/-resources/index.html) 플러그인을 제공합니다. 이를 수행하려면 타입 지정된 라우트 역할을 할 클래스를 생성한 다음, `@Resource` 키워드를 사용하여 이 클래스에 어노테이션을 지정해야 합니다. `@Resource` 어노테이션은 kotlinx.serialization 라이브러리에서 제공하는 `@Serializable` 동작을 포함하고 있습니다.

> Ktor 클라이언트는 서버로 [타입 지정된 요청](client-resources.md)을 보낼 수 있는 기능을 제공합니다.

## 의존성 추가 {id="add_dependencies"}

### kotlinx.serialization 추가 {id="add_serialization"}

[리소스 클래스](#resource_classes)는 `@Serializable` 동작을 가져야 하므로, [설정(Setup)](https://github.com/Kotlin/kotlinx.serialization#setup) 섹션에 설명된 대로 Kotlin 직렬화 플러그인을 추가해야 합니다.

### %plugin_name% 의존성 추가 {id="add_plugin_dependencies"}

<p>
    <code>%plugin_name%</code>을(를) 사용하려면 빌드 스크립트에 <code>%artifact_name%</code> 아티팩트를 추가합니다:
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
    지정된 <Links href="server-modules.md" summary="Modules allow you to structure your application by grouping routes.">모듈</Links>의 <code>install</code> 함수에 전달하세요.
    다음 예제는 <code>%plugin_name%</code>을(를) 설치하는 방법을 보여줍니다:
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

## 리소스 클래스 생성 {id="resource_classes"}

<snippet id="resource_classes_server">

각 리소스 클래스에는 `@Resource` 어노테이션이 있어야 합니다.
아래에서는 단일 경로 세그먼트, 쿼리 및 경로 파라미터 정의 등 리소스 클래스의 몇 가지 예를 살펴보겠습니다.

### 리소스 URL {id="resource_url"}

아래 예제는 `/articles` 경로에 응답하는 리소스를 지정하는 `Articles` 클래스를 정의하는 방법을 보여줍니다.

```kotlin
import io.ktor.resources.*

@Resource("/articles")
class Articles()
```

### 쿼리 파라미터가 있는 리소스 {id="resource_query_param"}

아래의 `Articles` 클래스는 [쿼리 파라미터](server-requests.md#query_parameters) 역할을 하는 `sort` 문자열 프로퍼티를 가지며, 다음과 같이 `sort` 쿼리 파라미터가 포함된 경로에 응답하는 리소스를 정의할 수 있게 해줍니다: `/articles?sort=new`.

```kotlin
@Resource("/articles")
class Articles(val sort: String? = "new")
```

### 중첩 클래스가 있는 리소스 {id="resource_nested"}

클래스를 중첩하여 여러 경로 세그먼트를 포함하는 리소스를 생성할 수 있습니다. 이 경우 중첩된 클래스는 외부 클래스 타입의 프로퍼티를 가져야 합니다.
아래 예제는 `/articles/new` 경로에 응답하는 리소스를 보여줍니다.

```kotlin
@Resource("/articles")
class Articles() {
    @Resource("new")
    class New(val parent: Articles = Articles())
}
```

### 경로 파라미터가 있는 리소스 {id="resource_path_param"}

아래 예제는 경로 세그먼트와 매치되어 `id`라는 이름의 파라미터로 캡처하는 [중첩된](#resource_nested) 정수형 `{id}` [경로 파라미터](server-routing.md#path_parameter)를 추가하는 방법을 보여줍니다.

```kotlin
@Resource("/articles")
class Articles() {
    @Resource("{id}")
    class Id(val parent: Articles = Articles(), val id: Long)
}
```

예를 들어, 이 리소스는 `/articles/12`에 응답하는 데 사용할 수 있습니다.

</snippet>

### 예제: CRUD 작업을 위한 리소스 {id="example_crud"}

위의 예제들을 종합하여 CRUD 작업을 위한 `Articles` 리소스를 만들어 보겠습니다.

```kotlin
@Resource("/articles")
class Articles(val sort: String? = "new") {
    @Resource("new")
    class New(val parent: Articles = Articles())

    @Resource("{id}")
    class Id(val parent: Articles = Articles(), val id: Long) {
        @Resource("edit")
        class Edit(val parent: Id)
    }
}
```

이 리소스는 모든 기사 목록 조회, 새 기사 등록, 기사 수정 등에 사용할 수 있습니다. 다음 장에서는 이 리소스에 대한 [라우트 핸들러를 정의](#define_route)하는 방법을 살펴보겠습니다.

> 전체 예제는 여기에서 확인할 수 있습니다: [resource-routing](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/resource-routing).

## 라우트 핸들러 정의 {id="define_route"}

타입 지정된 리소스에 대해 [라우트 핸들러를 정의](server-routing.md#define_route)하려면 HTTP 동사 함수(`get`, `post`, `put` 등)에 리소스 클래스를 전달해야 합니다.
예를 들어 아래의 라우트 핸들러는 `/articles` 경로에 응답합니다.

```kotlin
@Resource("/articles")
class Articles()

fun Application.module() {
    install(Resources)
    routing {
        get<Articles> { articles ->
            // Get all articles ...
            call.respondText("List of articles: $articles")
        }
    }
}
```

아래 예제는 [예제: CRUD 작업을 위한 리소스](#example_crud)에서 생성한 `Articles` 리소스에 대한 라우트 핸들러를 정의하는 방법을 보여줍니다. 라우트 핸들러 내부에서 `Article`을 파라미터로 접근하여 해당 프로퍼티 값을 얻을 수 있습니다.

```kotlin
fun Application.module() {
    install(Resources)
    routing {
        get<Articles> { article ->
            // Get all articles ...
            call.respondText("List of articles sorted starting from ${article.sort}")
        }
        get<Articles.New> {
            // Show a page with fields for creating a new article ...
            call.respondText("Create a new article")
        }
        post<Articles> {
            // Save an article ...
            call.respondText("An article is saved", status = HttpStatusCode.Created)
        }
        get<Articles.Id> { article ->
            // Show an article with id ${article.id} ...
            call.respondText("An article with id ${article.id}", status = HttpStatusCode.OK)
        }
        get<Articles.Id.Edit> { article ->
            // Show a page with fields for editing an article ...
            call.respondText("Edit an article with id ${article.parent.id}", status = HttpStatusCode.OK)
        }
        put<Articles.Id> { article ->
            // Update an article ...
            call.respondText("An article with id ${article.id} updated", status = HttpStatusCode.OK)
        }
        delete<Articles.Id> { article ->
            // Delete an article ...
            call.respondText("An article with id ${article.id} deleted", status = HttpStatusCode.OK)
        }
    }
}
```

각 엔드포인트에 대한 요청 처리에 관한 몇 가지 팁은 다음과 같습니다:

- `get<Articles>`

   이 라우트 핸들러는 `sort` 쿼리 파라미터에 따라 정렬된 모든 기사를 반환하도록 되어 있습니다.
   예를 들어 모든 기사가 포함된 [HTML 페이지](server-responses.md#html) 또는 [JSON 객체](server-responses.md#object)일 수 있습니다.

- `get<Articles.New>`

   이 엔드포인트는 새 기사를 작성하기 위한 필드가 포함된 [웹 폼](server-responses.md#html)으로 응답합니다.
- `post<Articles>`

   `post<Articles>` 엔드포인트는 웹 폼을 통해 전송된 [파라미터](server-requests.md#form_parameters)를 수신하도록 되어 있습니다.
   Ktor에서는 `ContentNegotiation` 플러그인을 사용하여 JSON 데이터를 [객체](server-requests.md#objects)로 수신할 수도 있습니다.
- `get<Articles.Id>`

   이 라우트 핸들러는 지정된 식별자를 가진 기사를 반환하도록 되어 있습니다.
   기사를 보여주는 [HTML 페이지](server-responses.md#html)이거나 기사 데이터가 포함된 [JSON 객체](server-responses.md#object)일 수 있습니다.
- `get<Articles.Id.Edit>`

  이 엔드포인트는 기존 기사를 편집하기 위한 필드가 포함된 [웹 폼](server-responses.md#html)으로 응답합니다.
- `put<Articles.Id>`

   `post<Articles>` 엔드포인트와 유사하게, `put` 핸들러는 웹 폼을 통해 전송된 [폼 파라미터](server-requests.md#form_parameters)를 수신합니다.
- `delete<Articles.Id>`

   이 라우트 핸들러는 지정된 식별자를 가진 기사를 삭제합니다.

전체 예제는 여기에서 확인할 수 있습니다: [resource-routing](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/resource-routing).

## 리소스로부터 링크 생성 {id="resource_links"}

리소스 정의는 라우팅에 사용하는 것 외에도 링크를 생성하는 데 사용할 수 있습니다.
이를 종종 _역방향 라우팅(reverse routing)_이라고 부릅니다.
리소스로부터 링크를 생성하는 기능은 [HTML DSL](server-html-dsl.md)로 작성된 HTML 문서에 이러한 링크를 추가해야 하거나 [리디렉션 응답](server-responses.md#redirect)을 생성해야 할 때 유용할 수 있습니다.

`Resources` 플러그인은 오버로드된 [href](https://api.ktor.io/ktor-server-resources/io.ktor.server.resources/href.html) 메서드로 `Application`을 확장하여 `Resource`로부터 링크를 생성할 수 있도록 지원합니다. 예를 들어 아래의 코드 스니펫은 [위에서 정의한](#example_crud) `Edit` 리소스에 대한 링크를 생성합니다:

```kotlin
val link: String = href(Articles.Id.Edit(Articles.Id(id = 123)))
```

조부모 리소스인 `Articles`가 기본값 `new`를 갖는 `sort` 쿼리 파라미터를 정의하고 있으므로, `link` 변수에는 다음 내용이 포함됩니다:

```
/articles/123/edit?sort=new
```

호스트와 프로토콜이 지정된 URL을 생성하려면 `href` 메서드에 `URLBuilder`를 전달할 수 있습니다.
다음 예제에서 볼 수 있듯이 `URLBuilder`를 사용하여 추가 쿼리 파라미터를 지정할 수도 있습니다:

```kotlin
val urlBuilder = URLBuilder(URLProtocol.HTTPS, "ktor.io", parameters = parametersOf("token", "123"))
href(Articles(sort = null), urlBuilder)
val link: String = urlBuilder.buildString()
```

이후 `link` 변수에는 다음이 포함됩니다:

```
https://ktor.io/articles?token=123
```

### 예제 {id="example_build_links"}

아래 예제는 리소스로부터 생성된 링크를 HTML 응답에 추가하는 방법을 보여줍니다:

```kotlin
get {
    call.respondHtml {
        body {
            this@module.apply {
                p {
                    val link: String = href(Articles())
                    a(link) { +"Get all articles" }
                }
                p {
                    val link: String = href(Articles.New())
                    a(link) { +"Create a new article" }
                }
                p {
                    val link: String = href(Articles.Id.Edit(Articles.Id(id = 123)))
                    a(link) { +"Edit an exising article" }
                }
                p {
                    val urlBuilder = URLBuilder(URLProtocol.HTTPS, "ktor.io", parameters = parametersOf("token", "123"))
                    href(Articles(sort = null), urlBuilder)
                    val link: String = urlBuilder.buildString()
                    i { a(link) { +link } }
                }
            }
        }
    }
}
```

전체 예제는 여기에서 확인할 수 있습니다: [resource-routing](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/resource-routing).