[//]: # (title: Swagger UI)

<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-swagger"/>
<var name="package_name" value="io.ktor.server.plugins.swagger"/>
<var name="plugin_api_link" value="https://api.ktor.io/ktor-server-swagger/io.ktor.server.plugins.swagger/swagger-u-i.html"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="json-kotlinx-openapi"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">Native 서버</Links> 지원</b>: ✖️
</p>
</tldr>

<link-summary>
SwaggerUI 플러그인을 사용하면 프로젝트를 위한 Swagger UI를 생성할 수 있습니다.
</link-summary>

Ktor를 사용하면 OpenAPI 명세를 기반으로 프로젝트의 Swagger UI를 생성하고 제공할 수 있습니다.
Swagger UI를 통해 브라우저에서 직접 API 엔드포인트를 시각화하고 상호작용할 수 있습니다. 

다음과 같은 방법 중 하나로 OpenAPI 명세를 제공할 수 있습니다:

* [기존 YAML 또는 JSON 파일 제공](#static-openapi-file).
* [OpenAPI 컴파일러 익스텐션 및 런타임 API를 사용하여 런타임에 명세 생성](#generate-runtime-openapi-metadata).

## 의존성 추가 {id="add_dependencies"}

Swagger UI를 제공하려면 빌드 스크립트에 `%artifact_name%` 아티팩트를 추가해야 합니다:

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

> Ktor 3.4.0에서 `SwaggerUI` 플러그인은 `ktor-server-routing-openapi` 의존성을 필요로 합니다.
> 이는 의도적인 하위 호환성 단절(breaking change)이 아니었으며 Ktor 3.4.1에서 수정될 예정입니다.
> 런타임 오류를 방지하려면 Ktor 3.4.0을 사용하는 경우 의존성을 수동으로 추가하십시오.
> 
{style="warning"}

## 정적 OpenAPI 파일 사용 {id="static-openapi-file"}

기존 OpenAPI 명세 파일에서 Swagger UI를 제공하려면 [`swaggerUI()`](%plugin_api_link%) 함수를 사용하고 파일 위치를 지정하십시오.

다음 예제는 `swagger` 경로에 `GET` 엔드포인트를 생성하고 제공된 OpenAPI 명세 파일로부터 Swagger UI를 렌더링합니다:

```kotlin
import io.ktor.server.plugins.swagger.*

// ...
routing {
    swaggerUI(path = "swagger", swaggerFile = "openapi/documentation.yaml")
}
```

플러그인은 먼저 애플리케이션 리소스에서 명세를 찾습니다. 찾지 못한 경우 `java.io.File`을 사용하여 파일 시스템에서 로드를 시도합니다.

## 런타임 OpenAPI 메타데이터 생성

정적 파일에 의존하는 대신, OpenAPI 컴파일러 플러그인과 라우트 어노테이션에 의해 생성된 메타데이터를 사용하여 런타임에 OpenAPI 명세를 생성할 수 있습니다:

```kotlin
swaggerUI("/swaggerUI") {
    info = OpenApiInfo("My API", "1.0")
    source = OpenApiDocSource.Routing(ContentType.Application.Json) {
        routingRoot.descendants()
    }
}
```

이를 통해 애플리케이션의 현재 상태를 반영하는 생성된 OpenAPI 문서를 `/swaggerUI` 경로에서 액세스할 수 있습니다.

> OpenAPI 컴파일러 익스텐션 및 런타임 API에 대한 자세한 내용은 [OpenAPI 명세 생성](openapi-spec-generation.md)을 참조하십시오.
>
{style="tip"}

## Swagger UI 구성

예를 들어 기본 Swagger UI 버전을 재정의하는 등 `swaggerUI {}` 블록 내에서 Swagger UI를 커스텀할 수 있습니다:

```kotlin
routing {
    swaggerUI(path = "swagger", swaggerFile = "openapi/documentation.yaml") {
        version = "5.31.0"
    }
}
```

> OpenAPI 3.1.x 문서에는 Swagger UI 5.x가 필요하며, Swagger UI 4.x는 OpenAPI 3.0.x만 지원합니다.
>
{style="note"}

## CORS 구성 {id="configure-cors"}

Swagger UI가 API 엔드포인트에 올바르게 액세스할 수 있도록 하려면 먼저 [교차 출처 리소스 공유(CORS)](server-cors.md)를 구성해야 합니다.

아래 예제는 다음 CORS 구성을 적용합니다:
* `anyHost`는 모든 호스트로부터의 교차 출처 요청을 허용합니다.
* `allowHeader`는 [콘텐츠 협상(content negotiation)](server-serialization.md)에 사용되는 `Content-Type` 클라이언트 헤더를 허용합니다.

```kotlin
install(CORS) {
    anyHost()
    allowHeader(HttpHeaders.ContentType)
}