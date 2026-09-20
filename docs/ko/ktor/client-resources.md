[//]: # (title: 타입 세이프 요청)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<var name="plugin_name" value="Resources"/>
<var name="artifact_name" value="ktor-client-resources"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="client-type-safe-requests"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
Resources 플러그인을 사용하여 타입 세이프(type-safe)한 요청을 보내는 방법을 알아봅니다.
</link-summary>

Ktor는 타입 세이프한 [클라이언트 요청](client-requests.md)을 보낼 수 있도록 `%plugin_name%` 플러그인을 제공합니다.
이를 위해 서버 엔드포인트를 나타내는 클래스를 정의하고 `@Resource` 키워드로 어노테이션을 지정해야 합니다.

리소스 클래스는 프로퍼티를 경로 및 쿼리 파라미터로 변환하기 위해 `kotlinx.serialization`을 사용합니다.

> Ktor 서버는 [타입 세이프 라우팅](server-resources.md)을 제공합니다.
>
{style="tip"}

## 의존성 추가 {id="add_dependencies"}

### kotlinx.serialization 추가 {id="add_serialization"}

`Resources` 플러그인은 `kotlinx.serialization`을 기반으로 동작합니다. [`kotlinx.serialization` 설정 가이드](https://github.com/Kotlin/kotlinx.serialization#setup)에 설명된 대로 Kotlin serialization 플러그인을 활성화하세요.

### %plugin_name% 의존성 추가 {id="add_plugin_dependencies"}

<p>
    <code>%plugin_name%</code>을 사용하려면 빌드 스크립트에 <code>%artifact_name%</code> 아티팩트를 추가하세요:
</p>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"/>
    </TabItem>
</Tabs>
<tip>
    Ktor 클라이언트에 필요한 아티팩트에 대한 자세한 내용은 <Links href="/ktor/client-dependencies" summary="기존 프로젝트에 클라이언트 의존성을 추가하는 방법을 알아봅니다.">클라이언트 의존성 추가</Links>에서 확인할 수 있습니다.
</tip>

## %plugin_name% 설치 {id="install_plugin"}

`%plugin_name%` 플러그인을 설치하려면 [클라이언트 구성 블록](client-create-and-configure.md#configure-client)의 `install` 함수에 전달하세요:

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.resources.*
//...
val client = HttpClient(CIO) {
    install(Resources)
}
```

## 리소스 클래스 생성 {id="resource_classes"}

각 리소스 클래스에는 `@Resource` 어노테이션이 있어야 합니다. 
아래에서는 단일 경로 세그먼트, 쿼리 및 경로 파라미터 정의 등 리소스 클래스의 몇 가지 예를 살펴보겠습니다.

### 리소스 URL {id="resource_url"}

아래 예제는 `/articles` 경로에서 응답하는 리소스를 지정하는 `Articles` 클래스를 정의하는 방법을 보여줍니다. 

```kotlin
import io.ktor.resources.*

@Resource("/articles")
class Articles()
```

### 쿼리 파라미터가 있는 리소스 {id="resource_query_param"}

아래 `Articles` 클래스는 [쿼리 파라미터](server-requests.md#query_parameters) 역할을 하는 `sort` 문자열 프로퍼티를 가지고 있으며, `/articles?sort=new`와 같이 `sort` 쿼리 파라미터가 포함된 경로에 응답하는 리소스를 정의할 수 있게 해줍니다. 

```kotlin
@Resource("/articles")
class Articles(val sort: String? = "new")
```

### 중첩 클래스가 있는 리소스 {id="resource_nested"}

클래스를 중첩하여 여러 경로 세그먼트를 포함하는 리소스를 만들 수 있습니다. 이 경우 중첩된 클래스는 외부 클래스 타입을 가진 프로퍼티를 가져야 한다는 점에 유의하세요. 
아래 예제는 `/articles/new` 경로에서 응답하는 리소스를 보여줍니다.

```kotlin
@Resource("/articles")
class Articles() {
    @Resource("new")
    class New(val parent: Articles = Articles())
}
```

### 경로 파라미터가 있는 리소스 {id="resource_path_param"}

아래 예제는 경로 세그먼트와 일치하며 `id`라는 이름의 파라미터로 캡처되는 [중첩된](#resource_nested) `{id}` 정수 [경로 파라미터](server-routing.md#path_parameter)를 추가하는 방법을 보여줍니다.

```kotlin
@Resource("/articles")
class Articles() {
    @Resource("{id}")
    class Id(val parent: Articles = Articles(), val id: Long)
}
```

예를 들어, 이 리소스는 `/articles/12` 경로에 응답하는 데 사용될 수 있습니다.

### 예제: CRUD 작업을 위한 리소스 {id="example_crud"}

다음 예제는 CRUD 작업을 위한 `Articles` 리소스를 생성합니다:

```kotlin
@Resource("/articles")
class Articles() {
    @Resource("new")
    class New(val parent: Articles = Articles())

    @Resource("{id}")
    class Id(val parent: Articles = Articles(), val id: Long) {
        @Resource("edit")
        class Edit(val parent: Id)
    }
}
```

이 리소스는 모든 기사 목록 조회, 새 기사 게시, 기존 기사 수정에 사용할 수 있습니다.

다음 섹션에서는 이 리소스를 사용하여 [타입 세이프 요청을 보내는 방법](#make_requests)을 보여줍니다.

> 전체 예제는 여기에서 확인할 수 있습니다: [client-type-safe-requests](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-type-safe-requests).
>
{style="tip"}

## 타입 세이프 요청 보내기 {id="make_requests"}

타입이 지정된 리소스에 [요청을 보내려면](client-requests.md), `request()`, `get()`, `post()`, `put()`과 같은 요청 함수에 리소스 클래스 인스턴스를 전달하세요.

다음 예제는 `/articles` 경로로 요청을 보냅니다:

```kotlin
@Resource("/articles")
class Articles()

fun main() {
    runBlocking {
        val client = HttpClient(CIO) {
            install(Resources)
            // ...
        }
        val getAllArticles = client.get(Articles())
    }
}
```

다음 예제는 [예제: CRUD 작업을 위한 리소스](#example_crud)에서 생성한 `Articles` 리소스에 대해 타입 세이프 요청을 보냅니다. 

```kotlin
fun main() {
    defaultServer(Application::module).start()
    runBlocking {
        val client = HttpClient(CIO) {
            install(Resources)
            defaultRequest {
                host = "0.0.0.0"
                port = 8080
                url { protocol = URLProtocol.HTTP }
            }
        }

        val getAllArticles = client.get(Articles())
        val newArticle = client.get(Articles.New())
        val postArticle = client.post(Articles()) { setBody("Article content") }
        val getArticle = client.get(Articles.Id(id = 12))
        val editArticlePage = client.get(Articles.Id.Edit(Articles.Id(id = 12)))
        val putArticle = client.put(Articles.Id(id = 12)) { setBody("New article content") }
        val deleteArticle = client.delete(Articles.Id(id = 12))
}
```

[`defaultRequest()`](client-default-request.md) 함수는 모든 요청에 대한 기본 URL을 지정합니다.

> 클라이언트 플러그인 또는 계측(instrumentation)을 개발할 때, `RESOURCE` 요청 속성을 통해 타입 세이프 요청에 사용된 리소스 인스턴스에 접근할 수 있습니다:
>  ```kotlin
>  onRequest { call, _ ->
>    val resource = call.attributes.getOrNull(RESOURCE)
>  }
>  ```
> 
{style="tip"}

> 전체 예제는 여기에서 확인할 수 있습니다: [client-type-safe-requests](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-type-safe-requests).
>
{style="tip"}