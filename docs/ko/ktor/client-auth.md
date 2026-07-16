[//]: # (title: Ktor Client의 인증 및 인가)

<show-structure for="chapter" depth="2"/>
<primary-label ref="client-plugin"/>

<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:ktor-client-auth</code>
</p>
</tldr>

<link-summary>
Auth 플러그인은 클라이언트 애플리케이션의 인증 및 인가를 처리합니다.
</link-summary>

Ktor는 클라이언트 애플리케이션에서 인증(authentication) 및 인가(authorization)를 처리하기 위해 [`Auth`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth/-auth) 플러그인을 제공합니다.
전형적인 사용 시나리오에는 사용자 로그인 및 특정 리소스에 대한 접근 권한 획득 등이 포함됩니다.

> 서버 측에서 Ktor는 인증 및 인가 처리를 위해 [`Authentication`](server-auth.md) 플러그인을 제공합니다.
> 
{style="tip"}

## 지원되는 인증 유형 {id="supported"}

HTTP는 접근 제어 및 인증을 위한 [일반적인 프레임워크](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)를 제공합니다. Ktor 클라이언트를 사용하면 다음과 같은 HTTP 인증 스킴을 사용할 수 있습니다:

* [Basic](client-basic-auth.md) - `Base64` 인코딩을 사용하여 사용자 이름과 비밀번호를 제공합니다. HTTPS와 함께 사용하지 않는 한 일반적으로 권장되지 않습니다.
* [Digest](client-digest-auth.md) - 사용자 자격 증명(credentials)에 해시 함수를 적용하여 암호화된 형태로 통신하는 인증 방식입니다.
* [Bearer](client-bearer-auth.md) - 베어러 토큰(bearer tokens)이라고 불리는 보안 토큰을 사용하는 인증 스킴입니다. 예를 들어, Google, Facebook, X(구 Twitter) 등과 같은 외부 제공업체를 사용하여 애플리케이션 사용자를 인증하는 OAuth 흐름의 일부로 이 스킴을 사용할 수 있습니다.

## 의존성 추가 {id="add_dependencies"}

인증 기능을 활성화하려면 빌드 스크립트에 `ktor-client-auth` 아티팩트를 포함해야 합니다:

<var name="artifact_name" value="ktor-client-auth"/>
<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>
<tip>
    Ktor 클라이언트에 필요한 아티팩트에 대한 자세한 내용은 <Links href="/ktor/client-dependencies" summary="기존 프로젝트에 클라이언트 의존성을 추가하는 방법을 알아봅니다.">클라이언트 의존성 추가</Links>에서 확인할 수 있습니다.
</tip>

## Auth 설치 {id="install_plugin"}

`Auth` 플러그인을 설치하려면, [클라이언트 설정 블록](client-create-and-configure.md#configure-client) 내부의 `install()` 함수에 전달합니다:

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.auth.*
//...
val client = HttpClient(CIO) {
    install(Auth) {
        // 인증 설정
    }
}
```

## 인증 설정 {id="configure_authentication"}

### 인증 제공자 선택 {id="choose-provider"}

특정 인증 제공자([`basic`](client-basic-auth.md), [`digest`](client-digest-auth.md), 또는 [`bearer`](client-bearer-auth.md))를 사용하려면 `install {}` 블록 내부에서 해당 함수를 호출해야 합니다.

예를 들어, basic 인증을 설정하려면 [`basic {}`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/basic.html) 함수를 사용합니다:

```kotlin
install(Auth) {
    basic {
        // basic 인증 설정
    }
}
```

블록 내부에서 해당 제공자에 특화된 설정을 구성할 수 있습니다.

> 제공자별 상세 설정은 해당 주제를 참조하세요:
> * [Basic 인증](client-basic-auth.md)
> * [Digest 인증](client-digest-auth.md)
> * [Bearer 인증](client-bearer-auth.md)
> 
{style="tip"}

### 영역(realm) 설정 {id="realm"}

선택 사항으로, `realm` 속성을 사용하여 영역을 설정할 수 있습니다:

```kotlin
install(Auth) {
    basic {
        realm = "Access to the '/' path"
        // ...
    }
}
```

서로 다른 리소스에 접근하기 위해 다른 영역을 가진 여러 제공자를 생성할 수 있습니다:

```kotlin
install(Auth) {
    basic {
        realm = "Access to the '/' path"
        // ...
    }
    basic {
        realm = "Access to the '/admin' path"
        // ...
    }
}
```

이 경우, 클라이언트는 영역 정보가 포함된 `WWW-Authenticate` 응답 헤더를 기반으로 필요한 제공자를 선택합니다.

## 제공자 선택

서버가 `401 Unauthorized`를 반환하면, 클라이언트는 `WWW-Authenticate` 응답 헤더를 기반으로 인증 제공자를 선택합니다. 이 헤더는 서버가 수용하는 인증 스킴을 명시합니다.

클라이언트에 인증 제공자가 하나만 설치된 경우, `WWW-Authenticate` 헤더가 없거나 다른 스킴을 명시하더라도 `Auth` 플러그인은 서버가 `401 Unauthorized`를 반환할 때 항상 해당 제공자를 시도합니다.

클라이언트에 여러 인증 제공자가 설치된 경우, 클라이언트는 `WWW-Authenticate` 헤더를 기반으로 제공자를 선택합니다.

## 토큰 캐싱 및 캐시 제어 {id="token-caching"}

[Basic](client-basic-auth.md) 및 [Bearer](client-bearer-auth.md) 인증 제공자는 내부적인 자격 증명(credential) 또는 토큰 캐시를 유지합니다. 이 캐시를 통해 클라이언트는 매 요청마다 인증 데이터를 다시 로드하는 대신 이전에 로드된 데이터를 재사용할 수 있어, 자격 증명이 변경될 때의 제어권을 유지하면서도 성능을 향상시킬 수 있습니다.

### 인증 제공자 접근하기

클라이언트 세션 중에 인증 상태를 동적으로 업데이트해야 하는 경우, `authProvider` 확장 함수를 사용하여 특정 제공자에 접근할 수 있습니다:

```kotlin
val provider = client.authProvider<BearerAuthProvider>()
```

설치된 모든 제공자를 가져오려면 `authProviders` 속성을 사용합니다:

```kotlin
val providers = client.authProviders
```

이러한 유틸리티를 사용하면 프로그래밍 방식으로 제공자를 검사하거나 캐시된 토큰을 삭제할 수 있습니다.

### 캐시된 토큰 삭제하기

단일 제공자에 대해 캐시된 자격 증명을 삭제하려면 `.clearToken()` 함수를 사용합니다:

```kotlin
val provider = client.authProvider<BasicAuthProvider>()
provider?.clearToken()
``` 

캐시 삭제를 지원하는 모든 인증 제공자 전체에서 캐시된 토큰을 삭제하려면 `.clearAuthTokens()` 함수를 사용합니다:

```kotlin
client.clearAuthTokens()
```

캐시된 토큰 삭제는 일반적으로 다음과 같은 시나리오에서 사용됩니다:

* 사용자가 로그아웃할 때.
* 애플리케이션에 저장된 자격 증명이나 토큰이 변경될 때.
* 다음 요청 시 제공자가 인증 상태를 강제로 다시 로드하도록 해야 할 때.

다음은 사용자가 로그아웃할 때 캐시된 토큰을 삭제하는 예시입니다:

```kotlin
fun logout() {
    client.clearAuthTokens()
    storage.deleteCredentials()
}
```

### 캐싱 동작 제어하기

Basic 및 Bearer 인증 제공자 모두 `cacheTokens` 옵션을 사용하여 요청 간에 토큰이나 자격 증명을 캐시할지 여부를 제어할 수 있습니다.

예를 들어, 자격 증명이 동적으로 제공되는 경우 캐싱을 비활성화할 수 있습니다:

```kotlin
basic {
    cacheTokens = false   // 매 요청마다 자격 증명을 다시 로드함
    credentials {
        loadCurrentCredentials()
    }
}
```

토큰 캐싱 비활성화는 인증 데이터가 자주 변경되거나 가장 최신 상태를 반영해야 하는 경우에 특히 유용합니다.