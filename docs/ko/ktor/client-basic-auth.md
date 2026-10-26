[//]: # (title: Ktor Client의 기본 인증)

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:ktor-client-auth</code>
</p>
<var name="example_name" value="client-auth-basic"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

기본 [인증 방식(authentication scheme)](client-auth.md)은 사용자를 로그인하는 데 사용할 수 있습니다. 이 방식에서는 사용자 자격 증명이 Base64로 인코딩된 사용자 이름/비밀번호 쌍으로 전송됩니다. 

> 서버 측에서 Ktor는 기본 인증을 처리하기 위한 [Authentication](server-basic-auth.md) 플러그인을 제공합니다.

## 의존성 추가 {id="add_dependencies"}

인증을 활성화하려면 빌드 스크립트에 `ktor-client-auth` 아티팩트를 포함합니다:

<var name="artifact_name" value="ktor-client-auth"/>
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
    Ktor 클라이언트에 필요한 아티팩트에 대한 자세한 내용은 <Links href="client-dependencies.md" summary="기존 프로젝트에 클라이언트 의존성을 추가하는 방법을 알아봅니다.">클라이언트 의존성 추가</Links>를 참조하세요.
</tip>

## 기본 인증 흐름 {id="flow"}

기본 인증 흐름은 다음과 같습니다:

1. 클라이언트가 `Authorization` 헤더 없이 서버 애플리케이션의 보호된 리소스에 요청을 보냅니다.
2. 서버는 `401 Unauthorized` 응답 상태로 응답하며, 기본 인증이 필요함을 나타내기 위해 `WWW-Authenticate` 응답 헤더를 사용합니다. 일반적인 `WWW-Authenticate` 헤더는 다음과 같습니다:

   ```
   WWW-Authenticate: Basic realm="Access to the '/' path", charset="UTF-8"
   ```
   {style="block"}

   Ktor 클라이언트는 [`sendWithoutRequest()` 함수](#configure)를 사용하여 `WWW-Authenticate` 헤더를 기다리지 않고 선제적으로(preemptively) 자격 증명을 보낼 수 있습니다.

3. 클라이언트는 일반적으로 사용자에게 자격 증명을 입력하도록 요청합니다. 그런 다음 Base64로 인코딩된 사용자 이름과 비밀번호 쌍이 포함된 `Authorization` 헤더와 함께 요청을 보냅니다. 예를 들면 다음과 같습니다:

   ```
   Authorization: Basic amV0YnJhaW5zOmZvb2Jhcg
   ```
   {style="block"}

4. 서버는 클라이언트가 보낸 자격 증명을 검증하고 요청된 콘텐츠로 응답합니다.

## 기본 인증 구성 {id="configure"}

`Basic` 방식을 사용하여 `Authorization` 헤더에 사용자 자격 증명을 전송하려면 `basic` 인증 공급자(authentication provider)를 구성해야 합니다:

1. `install(Auth)` 블록 내에서 [`basic`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/basic.html) 함수를 호출합니다.
2. [`BasicAuthCredentials`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/-basic-auth-credentials/index.html)를 사용하여 필요한 자격 증명을 제공하고 이 객체를 [`credentials`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/-basic-auth-config/credentials.html) 함수에 전달합니다.
3. `realm` 프로퍼티를 사용하여 영역(realm)을 구성합니다.

   ```kotlin
   val client = HttpClient(CIO) {
       install(Auth) {
           basic {
               credentials {
                   BasicAuthCredentials(username = "jetbrains", password = "foobar")
               }
               realm = "Access to the '/' path"
           }
       }
   }
   ```

4. (선택 사항) 요청 매개변수를 확인하고 초기 요청에 자격 증명을 첨부할지 여부를 결정하는 `sendWithoutRequest` 함수를 사용하여 선제적 인증을 활성화합니다.

   ```kotlin
   install(Auth) {
       basic {
           // ...
           sendWithoutRequest { request ->
               request.url.host == "0.0.0.0"
           }
       }
   }
   ```
5. (선택 사항) 자격 증명 캐싱을 비활성화합니다. 기본적으로 `credentials {}` 공급자가 반환한 자격 증명은 여러 요청에 걸쳐 재사용하기 위해 캐시됩니다. `cacheTokens` 옵션을 사용하여 캐싱을 비활성화할 수 있습니다:

    ```kotlin
    basic {
        cacheTokens = false   // 모든 요청마다 자격 증명을 다시 로드합니다
        // ...
    }
    ```
    캐싱 비활성화는 클라이언트 세션 중에 자격 증명이 변경될 수 있거나 저장된 최신 상태를 반영해야 할 때 유용합니다.

    > 프로그래밍 방식으로 캐시된 자격 증명을 지우는 방법에 대한 자세한 내용은 일반적인 [토큰 캐싱 및 캐시 제어(Token caching and cache control)](client-auth.md#token-caching) 섹션을 참조하세요.

> Ktor Client의 기본 인증에 대한 전체 예제는 [client-auth-basic](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-auth-basic)을 참조하세요.