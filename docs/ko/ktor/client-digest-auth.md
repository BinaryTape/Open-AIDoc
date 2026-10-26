[//]: # (title: Ktor Client의 다이제스트 인증)

<tldr>
<p>
<b>필수 종속성</b>: <code>io.ktor:ktor-client-auth</code>
</p>
<var name="example_name" value="client-auth-digest"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

다이제스트 인증(Digest authentication) 방식에서는 사용자 이름과 비밀번호를 네트워크로 전송하기 전에 해시 함수를 적용합니다.

> 서버 측에서 Ktor는 다이제스트 인증을 처리하기 위한 [Authentication](server-digest-auth.md) 플러그인을 제공합니다.

## 종속성 추가 {id="add_dependencies"}

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
    Ktor 클라이언트에 필요한 아티팩트에 대한 자세한 내용은 <Links href="client-dependencies.md" summary="기존 프로젝트에 클라이언트 종속성을 추가하는 방법을 알아봅니다.">클라이언트 종속성 추가</Links>를 참조하세요.
</tip>

## 다이제스트 인증 흐름 {id="flow"}

다이제스트 인증 흐름은 다음과 같습니다:

1. 클라이언트가 서버 애플리케이션의 특정 리소스에 `Authorization` 헤더 없이 요청을 보냅니다.
2. 서버는 `401`(Unauthorized) 응답 상태로 클라이언트에 응답하며, `WWW-Authenticate` 응답 헤더를 사용하여 해당 라우트를 보호하는 데 다이제스트 인증 방식이 사용됨을 알리는 정보를 제공합니다. 일반적인 `WWW-Authenticate` 헤더는 다음과 같습니다:

   ```
   WWW-Authenticate: Digest
           realm="Access to the '/' path",
           nonce="e4549c0548886bc2",
           algorithm="MD5"
   ```
   {style="block"}

3. 일반적으로 클라이언트는 사용자가 자격 증명(credentials)을 입력할 수 있는 로그인 대화상자를 표시합니다. 그런 다음 클라이언트는 다음과 같은 `Authorization` 헤더를 포함하여 요청을 보냅니다:

   ```
   Authorization: Digest username="jetbrains",
           realm="Access to the '/' path",
           nonce="e4549c0548886bc2",
           uri="/",
           algorithm=MD5,
           response="6299988bb4f05c0d8ad44295873858cf"
   ```
   {style="block"}

   `response` 값은 다음과 같은 방식으로 생성됩니다:

   a. `HA1 = MD5(username:realm:password)`

   b. `HA2 = MD5(method:digestURI)`

   c. `response = MD5(HA1:nonce:HA2)`

4. 서버는 클라이언트가 보낸 자격 증명을 검증하고 요청된 콘텐츠로 응답합니다.

## 다이제스트 인증 구성 {id="configure"}

`Digest` 방식을 사용하여 `Authorization` 헤더에 사용자 자격 증명을 전송하려면 다음과 같이 `digest` 인증 제공자를 구성해야 합니다:

1. `install` 블록 내에서 [digest](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/digest.html) 함수를 호출합니다.
2. [DigestAuthCredentials](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/-digest-auth-credentials/index.html)를 사용하여 필요한 자격 증명을 제공하고, 이 객체를 [credentials](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/-digest-auth-config/credentials.html) 함수에 전달합니다.
3. 선택 사항으로, `realm` 속성을 사용하여 realm을 구성합니다.

```kotlin
val client = HttpClient(CIO) {
    install(Auth) {
        digest {
            credentials {
                DigestAuthCredentials(username = "jetbrains", password = "foobar")
            }
            realm = "Access to the '/' path"
        }
    }
}
```

> 전체 예제는 여기에서 확인할 수 있습니다: [client-auth-digest](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-auth-digest).