[//]: # (title: OpenAPI)

<primary-label ref="server-plugin"/>

<var name="artifact_name" value="ktor-server-openapi"/>
<var name="package_name" value="io.ktor.server.plugins.openapi"/>
<var name="plugin_api_link" value="https://api.ktor.io/ktor-server-openapi/io.ktor.server.plugins.openapi/open-a-p-i.html"/>

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
OpenAPI 플러그인을 사용하면 프로젝트에 대한 OpenAPI 문서를 생성할 수 있습니다.
</link-summary>

Ktor를 사용하면 OpenAPI 사양(specification)을 기반으로 OpenAPI 문서를 제공할 수 있습니다.

다음 방법 중 하나로 OpenAPI 사양을 제공할 수 있습니다:

* [기존 YAML 또는 JSON 파일 제공](#static-openapi-file).
* [OpenAPI 컴파일러 확장 및 런타임 API를 사용하여 런타임 시 사양 생성](#generate-runtime-openapi-metadata).

두 경우 모두, OpenAPI 플러그인은 서버에서 사양을 어셈블하고 문서를 HTML로 렌더링합니다.

## 의존성 추가 {id="add_dependencies"}

* OpenAPI 문서를 제공하려면 빌드 스크립트에 `%artifact_name%` 아티팩트를 추가해야 합니다.

  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"/>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"/>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>

* 필요한 경우, [코드 생성기(code generator)](https://github.com/swagger-api/swagger-codegen-generators)를 커스터마이징하려면 `swagger-codegen-generators` 의존성을 추가하세요.

  <var name="group_id" value="io.swagger.codegen.v3"/>
  <var name="artifact_name" value="swagger-codegen-generators"/>
  <var name="version" value="swagger_codegen_version"/>
  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(&quot;%group_id%:%artifact_name%:$%version%&quot;)"/>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation &quot;%group_id%:%artifact_name%:$%version%&quot;"/>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;%group_id%&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%&lt;/artifactId&gt;&#10;                  &lt;version&gt;${%version%}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>

  `$swagger_codegen_version`을 `swagger-codegen-generators` 아티팩트의 필요한 버전(예: `%swagger_codegen_version%`)으로 교체할 수 있습니다.

> Ktor 3.4.0에서 `OpenAPI` 플러그인은 `ktor-server-routing-openapi` 의존성을 필요로 합니다.
> 이는 의도된 브레이킹 체인지(breaking change)가 아니며 Ktor 3.4.1에서 수정될 예정입니다.
> 런타임 에러를 방지하려면 Ktor 3.4.0을 사용하는 경우 의존성을 수동으로 추가하세요.
>
{style="warning"}

## 정적 OpenAPI 파일 사용 {id="static-openapi-file"}

기존 사양에서 OpenAPI 문서를 제공하려면, OpenAPI 문서 경로를 인자로 받는 [`openAPI()`](%plugin_api_link%) 함수를 사용하세요.

다음 예제는 `openapi` 경로에 `GET` 엔드포인트를 생성하고 제공된 OpenAPI 사양 파일로부터 Swagger UI를 렌더링합니다.

```kotlin
import io.ktor.server.plugins.openapi.*

// ...
routing {
    openAPI(path="openapi", swaggerFile = "openapi/documentation.yaml")
}
```

플러그인은 먼저 애플리케이션 리소스(resources)에서 사양을 찾습니다. 찾지 못하면 `java.io.File`을 사용하여 파일 시스템에서 로드하려고 시도합니다.

## 런타임 OpenAPI 메타데이터 생성

정적 파일에 의존하는 대신, OpenAPI 컴파일러 플러그인과 라우트 어노테이션(route annotations)으로 생성된 메타데이터를 사용하여 런타임에 OpenAPI 사양을 생성할 수 있습니다.

이 모드에서 OpenAPI 플러그인은 라우팅 트리(routing tree)에서 직접 사양을 어셈블합니다.

```kotlin
 openAPI(path = "openapi") {
    info = OpenApiInfo("My API", "1.0")
    source = OpenApiDocSource.Routing {
        routingRoot.descendants()
    }
}
```

이를 통해 애플리케이션의 현재 상태를 반영하는 생성된 OpenAPI 문서를 `/openapi` 경로에서 액세스할 수 있습니다.

> OpenAPI 컴파일러 확장 및 런타임 API에 대한 자세한 내용은 [OpenAPI 사양 생성](openapi-spec-generation.md)을 참조하세요.
> 
{style="tip"}

## OpenAPI 구성 {id="configure-openapi"}

기본적으로 문서는 `StaticHtml2Codegen`을 사용하여 렌더링됩니다. `openAPI {}` 블록 내에서 렌더러를 커스터마이징할 수 있습니다.

> `StaticHtmlCodegen` 및 `StaticHtml2Codegen`은 OpenAPI 3.0.x 문서만 지원합니다. OpenAPI 3.1 문서와 함께 사용하면 불완전하거나 잘못된 HTML이 생성될 수 있습니다. OpenAPI 3.1의 경우 Swagger UI 5.x와 함께 [`swaggerUI()`](server-swagger-ui.md) 함수를 사용하세요. OpenAPI 플러그인의 HTML 렌더러를 계속 사용해야 하는 경우 사양을 OpenAPI 3.0.3으로 유지하세요.
>
{style="note"}

```kotlin
routing {
    openAPI(path="openapi", swaggerFile = "openapi/documentation.yaml") {
        codegen = StaticHtmlCodegen()
    }
}