[//]: # (title: OpenAPI 명세 생성)

<show-structure for="chapter" depth="2"/>
<secondary-label ref="server-feature"/>

<var name="artifact_name" value="ktor-server-routing-openapi"/>
<var name="ktor_version_catalog_name" value="ktorLibs.server.routingOpenapi"/>
<var name="package_name" value="io.ktor.server.routing.openapi"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<p>
<b>코드 예제</b>:
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/openapi-spec-gen">
    openapi-spec-gen
</a>,
<a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/openapi-spec-gen-maven">
    openapi-spec-gen-maven
</a>
</p>
</tldr>

Ktor는 하나 이상의 문서 소스로부터 런타임에 OpenAPI 명세를 빌드할 수 있는 기능을 제공합니다.

이 기능은 다음을 통해 제공됩니다.
* OpenAPI 컴파일러 확장(Ktor Gradle 플러그인에 포함): 컴파일 타임에 라우팅 코드를 분석하고 런타임에 OpenAPI 메타데이터를 등록하는 Kotlin 코드를 생성합니다.
* 라우팅 어노테이션 런타임 API: 실행 중인 애플리케이션의 라우트에 OpenAPI 메타데이터를 직접 연결합니다.

둘 중 하나만 사용하거나 둘 다 함께 사용할 수 있으며, [OpenAPI](server-openapi.md) 및 [SwaggerUI](server-swagger-ui.md) 플러그인과 결합하여 대화형(interactive) API 문서를 제공할 수도 있습니다.

> OpenAPI Gradle 확장은 Kotlin 2.2.20을 필요로 합니다. 다른 버전을 사용할 경우 컴파일 오류가 발생할 수 있습니다.
>
{style="note"}

## 의존성 추가 {id="add-dependencies"}

* OpenAPI 메타데이터 생성을 활성화하려면 프로젝트에 Ktor 컴파일러 플러그인을 적용합니다.

  <Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin" id="add-ktor-plugin-gradle-kotlin">

    ```kotlin
    plugins {
        id("io.ktor.plugin") version "%ktor_version%"
    }
    ```

    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy" id="add-ktor-plugin-gradle-groovy">

    ```groovy
    plugins {
        id 'io.ktor.plugin' version "%ktor_version%"
    }
    ```

    </TabItem>
    <TabItem title="Maven" group-key="maven" id="add-ktor-plugin-maven">

    Gradle과 달리 Maven은 Ktor 컴파일러 플러그인에 대한 내장 통합을 제공하지 않습니다. OpenAPI 명세 생성을 활성화하려면 컴파일러 플러그인을 수동으로 구성해야 합니다.

    1. Ktor Maven 플러그인을 적용합니다(애플리케이션 실행 및 패키징에 필요함):
       ```xml
       <build>
           <plugins>
               <plugin>
                   <groupId>io.ktor</groupId>
                   <artifactId>ktor-maven-plugin</artifactId>
                   <version>%ktor_version%</version>
               </plugin>
           </plugins>
       </build>
       ```
    2. 컴파일러 플러그인은 JAR 파일 형태로 제공되어야 합니다. 자동으로 다운로드하여 안정적인 위치로 복사하도록 다음 구성을 추가합니다:

       ```xml
       <plugin>
           <groupId>org.apache.maven.plugins</groupId>
           <artifactId>maven-dependency-plugin</artifactId>
           <version>3.9.0</version>
           <executions>
               <execution>
                   <id>copy-ktor-compiler-plugin</id>
                   <phase>generate-sources</phase>
                   <goals>
                       <goal>copy</goal>
                   </goals>
                   <configuration>
                       <artifactItems>
                           <artifactItem>
                               <groupId>io.ktor</groupId>
                               <artifactId>ktor-compiler-plugin</artifactId>
                               <version>%ktor_version%</version>
                               <outputDirectory>${project.build.directory}/kotlin-plugins</outputDirectory>
                               <destFileName>ktor-compiler-plugin.jar</destFileName>
                           </artifactItem>
                       </artifactItems>
                   </configuration>
               </execution>
           </executions>
       </plugin>
       ```
  
    3. Kotlin 컴파일러를 구성합니다:

       ```xml
       <plugin>
           <groupId>org.jetbrains.kotlin</groupId>
           <artifactId>kotlin-maven-plugin</artifactId>
           <version>%kotlin_version%</version>

           <configuration>
               <jvmTarget>21</jvmTarget>

               <compilerPlugins>
                   <plugin>kotlinx-serialization</plugin>
               </compilerPlugins>

               <args>
                   <arg>-Xplugin=${project.build.directory}/kotlin-plugins/ktor-compiler-plugin.jar</arg>

                   <arg>-P</arg>
                   <arg>plugin:io.ktor.ktor-compiler-plugin:openApiEnabled=true</arg>

                   <arg>-P</arg>
                   <arg>plugin:io.ktor.ktor-compiler-plugin:openApiCodeInference=true</arg>

                   <arg>-P</arg>
                   <arg>plugin:io.ktor.ktor-compiler-plugin:openApiOnlyCommented=false</arg>
               </args>
           </configuration>

           <dependencies>
               <dependency>
                   <groupId>io.ktor</groupId>
                   <artifactId>ktor-compiler-plugin</artifactId>
                   <version>%ktor_version%</version>
               </dependency>
               <dependency>
                   <groupId>org.jetbrains.kotlin</groupId>
                   <artifactId>kotlin-maven-serialization</artifactId>
                   <version>${kotlin_version}</version>
               </dependency>
           </dependencies>
           <executions>
               <execution>
                   <id>compile</id>
                   <phase>compile</phase>
                   <goals>
                       <goal>compile</goal>
                   </goals>
               </execution>
               <execution>
                   <id>test-compile</id>
                   <phase>test-compile</phase>
                   <goals>
                       <goal>test-compile</goal>
                   </goals>
               </execution>
           </executions>
       </plugin>
       ```
  
   </TabItem>
  </Tabs>

* 런타임 라우트 어노테이션을 사용하려면 빌드 스크립트에 `%artifact_name%` 아티팩트를 추가합니다:

  <Tabs group="languages">
      <TabItem title="Gradle (Kotlin)" group-key="kotlin">
          <code-block lang="Kotlin" code="              implementation(%ktor_version_catalog_name%)"/>
          <note>
              위 코드 스니펫은 Ktor 의존성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">Ktor 버전 카탈로그</a>를 사용합니다.
          </note>
      </TabItem>
      <TabItem title="Gradle (Groovy)" group-key="groovy">
          <code-block lang="Groovy" code="              implementation %ktor_version_catalog_name%"/>
          <note>
              위 코드 스니펫은 Ktor 의존성을 지정하기 위해 <a href="server-dependencies.topic#using-version-catalog">Ktor 버전 카탈로그</a>를 사용합니다.
          </note>
      </TabItem>
      <TabItem title="Maven" group-key="maven">
          <code-block lang="XML" code="              &lt;dependency&gt;&#10;                  &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                  &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                  &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;              &lt;/dependency&gt;"/>
      </TabItem>
  </Tabs>

## OpenAPI 컴파일러 확장 구성 {id="configure-the-extension"}

OpenAPI 컴파일러 확장은 컴파일 타임에 라우팅 메타데이터를 수집하는 방식을 제어합니다.
이 확장이 최종 OpenAPI 문서 자체를 정의하는 것은 아닙니다.

컴파일 중에 플러그인은 라우팅 선언, 코드 패턴 및 주석에서 파생된 메타데이터를 등록하기 위해 OpenAPI 런타임 API를 사용하는 Kotlin 코드를 생성합니다.

API 제목, 버전, 서버, 보안 스키마, 상세 스키마와 같은 일반적인 OpenAPI 정보는 [명세가 생성될 때](#generate-and-serve-the-specification) 런타임에 제공됩니다.

컴파일러 플러그인 확장을 구성하려면 <Path>build.gradle.kts</Path> 파일의 `ktor` 확장 블록 내부에서 `openApi {}` 블록을 사용합니다:

```kotlin
ktor {
    openApi {
        enabled = true
        codeInferenceEnabled = true
        onlyCommented = false
    }
}
```

### 구성 옵션 {id="configuration-options"}

<deflist>
<def>
<title><code>enabled</code></title>
OpenAPI 라우트 어노테이션 코드 생성을 활성화하거나 비활성화합니다. 기본값은 <code>false</code>입니다.
</def>
<def>
<title><code>codeInferenceEnabled</code></title>
컴파일러가 라우팅 코드에서 OpenAPI 메타데이터를 추론할지 여부를 제어합니다. 기본값은 <code>true</code>입니다.
추론 결과가 올바르지 않거나 어노테이션을 사용하여 메타데이터를 명시적으로 정의하려는 경우 이 옵션을 비활성화하세요.
자세한 내용은 <a href="#code-inference">코드 추론 규칙</a>을 참조하세요.
</def>
<def>
<title><code>onlyCommented</code></title>
주석 어노테이션이 포함된 라우트로만 메타데이터 생성을 제한합니다. 기본값은 <code>false</code>이며, 이는 명시적으로 <code>@ignore</code>로 표시된 호출을 제외한 모든 라우팅 호출이 처리됨을 의미합니다.
</def>
</deflist>

### 라우팅 구조 분석 {id="routing-structure-analysis"}

Ktor 컴파일러 플러그인은 서버 라우팅 DSL을 분석하여 API의 구조적 형태를 결정합니다. 이 분석은 순수하게 라우트 선언만을 기반으로 수행되며 라우트 핸들러의 내용은 검사하지 않습니다.

라우팅 API 트리의 선택자(selector)로부터 다음 항목이 자동으로 추론됩니다:
- 병합된 경로 (예: `/api/v1/users/{id}`).
- HTTP 메서드 (`GET`, `POST` 등).
- 경로 파라미터.

```kotlin
routing {
    route("/api/v1") {
        get("/users") { }
        get("/users/{id}") { }
        post("/users") { }
    }
}
```

요청 파라미터, 본문, 응답은 라우트 람다 내부에서 처리되므로, 컴파일러는 라우팅 구조만으로 완전한 OpenAPI 설명을 추론할 수 없습니다. 생성되는 메타데이터를 더욱 풍부하게 만들기 위해 Ktor는 일반적인 요청 처리 패턴을 기반으로 하는 [어노테이션](#annotate-routes) 및 [자동 추론](#code-inference)을 지원합니다.

### 코드 추론 {id="code-inference"}

코드 추론이 활성화되면 컴파일러 플러그인은 일반적인 Ktor 사용 패턴을 인식하고 이에 상응하는 런타임 어노테이션을 자동으로 생성합니다.

다음 표는 지원되는 추론 규칙을 요약한 것입니다:

| 규칙 | 설명 | 입력 | 출력 (annotate 스코프 기준) |
|---|---|---|---|
| Request Body | `ContentNegotiation` 읽기 작업에서 요청 본문 스키마를 제공합니다 | `call.receive<T>()` | `requestBody { schema = jsonSchema<T>() }` |
| Response Body | `ContentNegotiation` 쓰기 작업에서 응답 본문 스키마를 제공합니다 | `call.respond<T>()` | `responses { HttpStatusCode.OK { schema = jsonSchema<T>() } }` |
| Response Headers | 응답에 대한 커스텀 헤더를 포함합니다 | `call.response.header("X-Foo", "Bar")` | `responses { HttpStatusCode.OK { headers { header("X-Foo", "Bar") } } }` |
| Path Parameters | 경로 파라미터 참조를 찾습니다 | `call.parameters["id"]` | `parameters { path("id") }` |
| Query Parameters | 쿼리 파라미터 참조를 찾습니다 | `call.queryParameters["name"]` | `parameters { query("name") }` |
| Request Headers | 요청 헤더 참조를 찾습니다 | `call.request.headers["X-Foo"]` | `parameters { header("X-Foo") }` |
| Resource API routes | Resources 라우팅 API에 대한 호출 구조를 추론합니다 | `call.get<List> { /**/ }; @Resource("/list") class List(val name: String)` | `parameters { query("name") }` |

추론은 가능한 경우 추출된 함수를 따라가며 일반적인 요청 및 응답 흐름에 대해 일관된 문서를 생성하려고 시도합니다.

#### 특정 엔드포인트의 추론 비활성화 {id="disable-inference-for-an-endpoint"}

특정 엔드포인트에 대해 추론이 잘못된 메타데이터를 생성하는 경우, `ignore` 마커를 추가하여 해당 엔드포인트를 제외할 수 있습니다:

```kotlin
// ignore!
get("/comments") {
    // ...
}
```

## 라우트 어노테이션 달기 {id="annotate-routes"}

명세를 풍부하게 만들기 위해 Ktor는 라우트에 어노테이션을 다는 두 가지 방법을 지원합니다:

- 컴파일러 플러그인이 분석하는 [주석 기반 어노테이션](#comment-annotations).
- `.describe {}` DSL을 사용하여 정의하는 [런타임 라우트 어노테이션](#runtime-route-annotations).

두 가지 방법 중 하나를 선택하거나 함께 조합하여 사용할 수 있습니다.

### 주석 기반 라우트 어노테이션 {id="comment-annotations"}

주석 기반 어노테이션은 코드에서 추론할 수 없는 메타데이터를 제공하며 기존 라우트와 원활하게 통합됩니다.

메타데이터는 줄의 시작 부분에 키워드를 배치하고 그 뒤에 콜론(`:`)과 값을 입력하여 정의합니다.

라우트 선언에 주석을 직접 연결할 수 있습니다:

```kotlin
/**
 * Get a single user by ID.
 *
 * Path: id [ULong] the ID of the user
 *
 * Responses:
 *   – 400 The ID parameter is malformatted or missing.
 *   – 404 The user for the given ID does not exist.
 *   – 200 [User] The user found with the given ID.
 */
get("/{id}") {
    val id = call.parameters["id"]?.toULongOrNull()
        ?: return@get call.respond(HttpStatusCode.BadRequest)
    val user = list.find { it.id == id }
        ?: return@get call.respond(HttpStatusCode.NotFound)
    call.respond(user)
}
```

#### 서식 규칙 {id="formatting-rules"}

- 키워드는 반드시 줄의 시작 부분에 있어야 합니다.
- 콜론(`:`)으로 키워드와 값을 구분합니다.
- 복수형 형태(예: `Tags`, `Responses`)를 사용하여 그룹화된 정의를 만들 수 있습니다.
- 단수형 형태(예: `Tag`, `Response`)도 지원됩니다.
- 최상위 글머리 기호(`-`)는 선택 사항이며 서식에만 영향을 줍니다.

다음 변형들은 모두 동일합니다:

```kotlin
/**
 * Tag: widgets
 * 
 * Tags:
 *   - widgets
 * 
 * - Tags:
 *  - widgets
 */
```

#### 지원되는 주석 필드 {id="supported-comment-fields"}

| 태그 | 형식 | 설명 |
|---|---|---|
| `Tag` | `Tag: name` | 엔드포인트를 특정 태그 아래로 그룹화합니다 |
| `Path` | `Path: [Type] name description` | 경로 파라미터 |
| `Query` | `Query: [Type] name description` | 쿼리 파라미터 |
| `Header` | `Header: [Type] name description` | 헤더 파라미터 |
| `Cookie` | `Cookie: [Type] name description` | 쿠키 파라미터 |
| `Body` | `Body: contentType [Type] description` | 요청 본문 |
| `Response` | `Response: code contentType [Type] description` | 응답 정의 |
| `Deprecated` | `Deprecated: reason` | 엔드포인트를 deprecated 상태로 표시합니다 |
| `Description` | `Description: text` | 확장 설명 |
| `Security` | `Security: scheme` | 보안 요구사항 |
| `ExternalDocs` | `ExternalDocs: href` | 외부 문서 링크 |

### 런타임 라우트 어노테이션 {id="runtime-route-annotations"}

<primary-label ref="experimental"/>

동적 라우팅, 인터셉터, 조건부 로직을 사용할 때처럼 컴파일 타임 분석이 충분하지 않은 경우, `.describe {}` 확장 함수를 사용하여 런타임에 라우트에 직접 OpenAPI 작업 메타데이터를 연결할 수 있습니다.

어노테이션이 달린 각 라우트는 생성된 OpenAPI 명세에서 단일 HTTP 작업(예: `GET /users`)을 나타내는 OpenAPI [Operation 객체](https://swagger.io/specification/#operation-object)를 정의합니다.
메타데이터는 런타임에 라우팅 트리에 연결되며, OpenAPI 및 Swagger UI 플러그인에 의해 소비됩니다.

`.describe {}` DSL은 OpenAPI 명세와 직접 매핑됩니다. 프로퍼티 이름과 구조는 파라미터, 요청 본문, 응답, 보안 요구사항, 서버, 콜백 및 명세 확장(`x-*`)을 포함하여 Operation 객체에 정의된 필드와 일치합니다.

런타임 라우트 어노테이션 API는 실험적(experimental) 기능이며 `@OptIn(ExperimentalKtorApi::class)`을 사용한 옵트인이 필요합니다:

```kotlin
                @OptIn(ExperimentalKtorApi::class)
                get("/users") {
                    val query = call.parameters["q"]
                    val result = if (query != null) {
                        list.filter {it.name.contains(query, ignoreCase = true)  }
                    } else {
                        list
                    }

                    call.respond(result)
                }.describe {
                    summary = "Get users"
                    description = "Retrieves a list of users."
                    parameters {
                        query("q") {
                            description = "An encoded query"
                            required = false
                        }
                    }
                    responses {
                        HttpStatusCode.OK {
                            description = "A list of users"
                            schema = jsonSchema<List<User>>()
                        }
                        HttpStatusCode.BadRequest {
                            description = "Invalid query"
                            ContentType.Text.Plain()
                        }
                    }
                }
```

> 사용 가능한 전체 필드 목록은 [OpenAPI 명세](https://swagger.io/specification/#operation-object)를 참조하세요.
>
{style="tip"}

런타임 어노테이션은 컴파일러가 생성한 메타데이터 및 주석 기반 메타데이터와 병합됩니다.
동일한 OpenAPI 필드가 여러 소스에 의해 정의된 경우, 런타임 어노테이션이 제공하는 값이 [우선순위](#metadata-precedence)를 갖습니다.

## OpenAPI 명세에서 라우트 숨기기 {id="hide-routes-from-the-openapi-specification"}

생성된 OpenAPI 문서에서 특정 라우트와 그 하위 항목을 제외하려면 `Route.hide()` 함수를 사용합니다:

```kotlin
@OptIn(ExperimentalKtorApi::class)
get("/routes") {
    // ....
}.hide()
```

이 기능은 [OpenAPI 명세 자체를 생성](#assemble-and-serve-the-specification)하는 데 사용되는 라우트를 비롯하여, 외부에 노출되지 않아야 하는 내부, 관리용 또는 진단용 엔드포인트에 유용합니다.

OpenAPI 및 Swagger UI 플러그인은 내부적으로 `.hide()`를 자동으로 호출하므로 해당 플러그인의 라우트는 결과 문서에서 제외됩니다.

## 스키마 추론 {id="schema-inference"}

Ktor는 OpenAPI 명세를 빌드할 때 요청 및 응답 타입에 대한 JSON 스키마를 자동으로 생성합니다. 기본적으로 데이터 클래스의 `kotlinx-serialization` 디스크립터를 사용하여 타입 참조로부터 스키마를 추론합니다. 이를 통해 대부분의 일반적인 데이터 모델을 추가 작업 없이 문서화할 수 있습니다.

### 어노테이션으로 스키마 커스터마이징 {id="customize-schemas-with-annotations"}

데이터 클래스에 [`@JsonSchema`](https://api.ktor.io/ktor-openapi-schema/io.ktor.openapi/-json-schema/index.html) 어노테이션을 추가하여 자동 생성된 JSON 스키마 필드를 오버라이드할 수 있습니다. 이를 통해 설명을 추가하거나, 프로퍼티를 필수로 표시하는 등의 작업을 수행할 수 있습니다:

```kotlin
@JsonSchema.Description("Represents a news article")
data class Article(
    val title: String,
    val content: String
)
```

### 리플렉션 기반 스키마 추론 사용 {id="use-reflection-based-schema-inference"}

`kotlinx-serialization` 대신 Jackson이나 Gson을 사용하는 프로젝트의 경우 리플렉션 기반 스키마 추론을 사용할 수 있습니다. 이를 사용하려면 OpenAPI 또는 SwaggerUI 플러그인의 `Routing` 소스에서 `schemaInference` 필드를 설정합니다:

```kotlin
openAPI("docs") {
    outputPath = "docs/routes"
    info = OpenApiInfo("Books API from routes", "1.0.0")
    source = OpenApiDocSource.Routing(
        contentType = ContentType.Application.Json,
        schemaInference = ReflectionJsonSchemaInference.Default,
    )
}
```

### 리플렉션 동작 커스터마이징 {id="customize-reflection-behavior"}

직접 지원되지 않는 어노테이션이나 네이밍 규칙을 처리하기 위해 커스텀 `SchemaReflectionAdapter`를 제공할 수 있습니다.

`SchemaReflectionAdapter`는 `ReflectionJsonSchemaInference`의 필드로, 프로퍼티 이름, 무시되는 필드 또는 널 허용 여부 규칙과 같은 기본 동작을 재정의할 수 있게 해줍니다.

예를 들어 Gson의 `@SerializedName` 어노테이션을 지원하도록 동작을 커스터마이징할 수 있습니다:

```kotlin
ReflectionJsonSchemaInference(object : SchemaReflectionAdapter {
    override fun getName(type: KType): String? {
        return (type.classifier as? KClass<*>)?.let {
            findAnnotations(SerializedName::class)?.value ?: it.simpleName
        }
    }
})
```

### 커스텀 스키마 제공 {id="custom-schemas"}

자동 스키마 추론이나 어노테이션만으로 충분하지 않은 경우, [`JsonSchema`](https://api.ktor.io/ktor-openapi-schema/io.ktor.openapi/-json-schema/index.html) 클래스를 사용하여 JSON 스키마를 수동으로 구성할 수 있습니다.

이를 통해 타입, 포맷, 중첩 구조, 또는 튜플 형태의 배열 정의를 위한 `prefixItems`와 같은 고급 구성을 포함하여 지원되는 모든 스키마 프로퍼티를 명시적으로 정의할 수 있습니다.

사용 가능한 전체 프로퍼티 목록은 [`JsonSchema` API 문서](https://api.ktor.io/ktor-openapi-schema/io.ktor.openapi/-json-schema/index.html)를 참조하세요.

## 명세 생성 및 제공 {id="generate-and-serve-the-specification"}

OpenAPI 명세는 컴파일러 플러그인에 의해 생성된 메타데이터와 런타임 라우트 어노테이션으로부터 런타임에 조립됩니다.

다음과 같은 방법으로 명세를 노출할 수 있습니다:

- [OpenAPI 문서를 수동으로 조립하여 제공](#assemble-and-serve-the-specification).
- [OpenAPI](server-openapi.md) 또는 [SwaggerUI](server-swagger-ui.md) 플러그인을 사용하여 명세와 대화형 문서를 함께 제공.

### 명세 조립 및 제공 {id="assemble-and-serve-the-specification"}

런타임에 완전한 OpenAPI 문서를 조립하려면 `OpenApiDoc` 인스턴스를 생성하고 명세에 포함할 라우트를 제공합니다.

문서는 라우팅 트리의 런타임 라우트 어노테이션과 컴파일러가 생성한 메타데이터로부터 조립됩니다. 결과로 반환되는 `OpenApiDoc` 인스턴스는 항상 애플리케이션의 현재 상태를 반영합니다.

일반적으로 라우트 핸들러 내에서 문서를 구성하고 이를 직접 응답으로 반환합니다:

```kotlin

        get("/docs.json") {
            val doc = OpenApiDoc(info = OpenApiInfo("My API", "1.0")) + call.application.routingRoot.descendants()
            call.respond(doc)
```

이 예제에서 OpenAPI 문서는 [`ContentNegotiation`](server-serialization.md) 플러그인을 사용하여 직렬화됩니다. 이는 JSON 직렬화기(예: `kotlinx.serialization`)가 설치되어 있다고 가정합니다.

추가적인 빌드나 생성 단계는 필요하지 않습니다. 라우트나 어노테이션의 변경 사항은 다음번에 명세를 요청할 때 자동으로 반영됩니다.

> 직렬화를 명시적으로 처리하거나 `ContentNegotiation`에 의존하지 않으려면 문서를 수동으로 인코딩하여 JSON으로 응답할 수 있습니다:
> 
> ```kotlin
> call.respondText(
>   Json.encodeToString(docs),
>   ContentType.Application.Json
> )
>```
>
{style="note"}

### 대화형 문서 제공 {id="serve-interactive-documentation"}

대화형 UI를 통해 OpenAPI 명세를 노출하려면 [OpenAPI](server-openapi.md) 및 [Swagger UI](server-swagger-ui.md) 플러그인을 사용하세요.

두 플러그인 모두 런타임에 명세를 조립하며 라우팅 트리에서 메타데이터를 직접 읽을 수 있습니다.
문서를 렌더링하는 방식에서 차이가 있습니다:
- OpenAPI 플러그인은 서버에서 문서를 렌더링하고 사전 생성된 HTML을 제공합니다.
- Swagger UI 플러그인은 OpenAPI 명세를 JSON 또는 YAML로 제공하고 Swagger UI를 사용하여 브라우저에서 UI를 렌더링합니다.

```kotlin
// OpenAPI UI 제공
openAPI("/openApi")

// Swagger UI 제공
swaggerUI("/swaggerUI") {
    info = OpenApiInfo("My API", "1.0")
    source = OpenApiDocSource.Routing(
        contentType = ContentType.Application.Json,
    )
}
```

### 메타데이터 우선순위 {id="metadata-precedence"}

최종 OpenAPI 명세는 여러 소스에서 제공된 메타데이터를 병합하여 런타임에 조립됩니다.

다음 소스들이 순서대로 적용됩니다:

1. 컴파일러가 생성한 메타데이터:
    - [라우팅 구조 분석](#routing-structure-analysis)
    - [코드 추론](#code-inference)
2. [주석 기반 라우트 어노테이션](#comment-annotations)
3. [런타임 라우트 어노테이션](#runtime-route-annotations)

동일한 OpenAPI 필드가 여러 소스에서 정의된 경우, 런타임 어노테이션이 제공하는 값이 주석 기반 어노테이션 및 컴파일러 생성 메타데이터보다 우선순위를 갖습니다.

명시적으로 오버라이드되지 않은 메타데이터는 보존되어 최종 문서로 병합됩니다.