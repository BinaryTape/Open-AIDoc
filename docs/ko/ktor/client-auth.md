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

Ktor는 클라이언트 애플리케이션에서 인증 및 인가를 처리할 수 있도록 [`Auth`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth/-auth) 플러그인을 제공합니다.
일반적인 사용 시나리오로는 사용자 로그인 및 특정 리소스에 대한 접근 권한 획득 등이 있습니다.

> 서버에서는 Ktor가 인증 및 인가를 처리하기 위한 [`Authentication`](server-auth.md) 플러그인을 제공합니다.
> 
{style="tip"}

## 지원되는 인증 유형 {id="supported"}

HTTP는 접근 제어와 인증을 위한 [일반적인 프레임워크](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)를 제공합니다. Ktor 클라이언트에서는 다음과 같은 HTTP 인증 체계를 사용할 수 있습니다.

* [Basic](client-basic-auth.md) - 사용자 이름과 비밀번호를 제공하기 위해 `Base64` 인코딩을 사용합니다. HTTPS와 함께 사용하지 않는다면 일반적으로 권장되지 않습니다.
* [Digest](client-digest-auth.md) - 사용자 이름과 비밀번호에 해시 함수를 적용하여 암호화된 형태로 사용자 자격 증명(credentials)을 전송하는 인증 방식입니다.
* [Bearer](client-bearer-auth.md) - 베어러 토큰(bearer token)이라 불리는 보안 토큰을 사용하는 인증 체계입니다. 예를 들어, 이 체계를 OAuth 플로우의 일부로 사용하여 Google, Facebook, X와 같은 외부 공급자를 통해 애플리케이션 사용자를 인가할 수 있습니다.

## 의존성 추가 {id="add_dependencies"}

인증을 활성화하려면 빌드 스크립트에 `ktor-client-auth` 아티팩트를 포함합니다.

<var name="artifact_name" value="ktor-client-auth"/>
<var name="ktor_version_catalog_name" value="ktorLibs.client.auth"/>
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
<tip>
    Ktor 클라이언트에 필요한 아티팩트에 대한 자세한 내용은 <Links href="client-dependencies.md" summary="기존 프로젝트에 클라이언트 의존성을 추가하는 방법을 알아봅니다.">클라이언트 의존성 추가</Links>를 참고하세요.
</tip>

## Auth 설치 {id="install_plugin"}

`Auth` 플러그인을 설치하려면 [클라이언트 구성 블록](client-create-and-configure.md#configure-client) 내부의 `install()` 함수에 플러그인을 전달합니다.

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.auth.*
//...
val client = HttpClient(CIO) {
    install(Auth) {
        // 인증 구성
    }
}
```

## 인증 구성 {id="configure_authentication"}

### 인증 공급자 선택 {id="choose-provider"}

특정 인증 공급자([`basic`](client-basic-auth.md), [`digest`](client-digest-auth.md), 또는 [`bearer`](client-bearer-auth.md))를 사용하려면 `install {}` 블록 내부에서 해당 함수를 호출합니다.

예를 들어 기본 인증(Basic authentication)을 구성하려면 [`basic {}`](https://api.ktor.io/ktor-client-auth/io.ktor.client.plugins.auth.providers/basic.html) 함수를 사용합니다.

```kotlin
install(Auth) {
    basic {
        // 기본 인증 구성
    }
}
```

블록 내에서 해당 공급자에 특화된 설정을 구성할 수 있습니다.

> 공급자별 상세 설정은 해당 주제를 참고하세요.
> * [기본 인증 (Basic authentication)](client-basic-auth.md)
> * [다이제스트 인증 (Digest authentication)](client-digest-auth.md)
> * [베어러 인증 (Bearer authentication)](client-bearer-auth.md)
> 
{style="tip"}

### 영역(realm) 구성 {id="realm"}

선택 사항으로, `realm` 속성을 사용하여 영역을 구성할 수 있습니다.

```kotlin
install(Auth) {
    basic {
        realm = "Access to the '/' path"
        // ...
    }
}
```

서로 다른 리소스에 접근하기 위해 영역이 다른 여러 공급자를 생성할 수도 있습니다.

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

이 경우 클라이언트는 영역 정보가 포함된 `WWW-Authenticate` 응답 헤더를 기반으로 필요한 공급자를 선택합니다.

## 공급자 선택 {id="provider-selection"}

서버가 `401 Unauthorized`를 반환하면 클라이언트는 `WWW-Authenticate` 응답 헤더를 기반으로 인증 공급자를 선택합니다. 이 헤더는 서버가 허용하는 인증 체계를 지정합니다.

클라이언트에 설치된 인증 공급자가 하나뿐인 경우, `WWW-Authenticate` 헤더가 없거나 다른 체계를 지정하더라도 서버가 `401 Unauthorized`를 반환할 때 `Auth` 플러그인은 항상 해당 공급자를 시도합니다.

클라이언트에 여러 인증 공급자가 설치되어 있는 경우, 클라이언트는 `WWW-Authenticate` 헤더를 기반으로 공급자를 선택합니다.

## 토큰 캐싱 및 캐시 제어 {id="token-caching"}

[Basic](client-basic-auth.md) 및 [Bearer](client-bearer-auth.md) 인증 공급자는 내부적으로 자격 증명 또는 토큰 캐시를 유지합니다. 이 캐시를 통해 클라이언트는 매 요청마다 인증 데이터를 다시 로드하는 대신 이전에 로드된 인증 데이터를 재사용하여, 성능을 개선하는 동시에 자격 증명이 변경될 때 완벽하게 제어할 수 있습니다.

### 인증 공급자 접근 {id="accessing-authentication-providers"}

클라이언트 세션 중에 인증 상태를 동적으로 업데이트해야 하는 경우, `authProvider` 확장 함수를 사용하여 특정 공급자에 접근할 수 있습니다.

```kotlin
val provider = client.authProvider<BearerAuthProvider>()
```

설치된 모든 공급자를 가져오려면 `authProviders` 속성을 사용합니다.

```kotlin
val providers = client.authProviders
```

이러한 유틸리티를 사용하면 프로그래밍 방식으로 공급자를 검사하거나 캐시된 토큰을 지울 수 있습니다.

### 캐시된 토큰 지우기 {id="clearing-cached-tokens"}

단일 공급자의 캐시된 자격 증명을 지우려면 `.clearToken()` 함수를 사용합니다.

```kotlin
val provider = client.authProvider<BasicAuthProvider>()
provider?.clearToken()
``` 

캐시 삭제를 지원하는 모든 인증 공급자에서 캐시된 토큰을 지우려면 `.clearAuthTokens()` 함수를 사용합니다.

```kotlin
client.clearAuthTokens()
```

캐시된 토큰을 지우는 작업은 일반적으로 다음과 같은 시나리오에서 사용됩니다.

* 사용자가 로그아웃할 때.
* 애플리케이션에 저장된 자격 증명이나 토큰이 변경될 때.
* 다음 요청 시 공급자가 인증 상태를 강제로 다시 로드해야 할 때.

다음은 사용자가 로그아웃할 때 캐시된 토큰을 지우는 예시입니다.

```kotlin
fun logout() {
    client.clearAuthTokens()
    storage.deleteCredentials()
}
```

### 캐싱 동작 제어 {id="controlling-caching-behavior"}

Basic 및 Bearer 인증 공급자 모두 `cacheTokens` 옵션을 사용하여 요청 간에 토큰이나 자격 증명을 캐시할지 여부를 제어할 수 있습니다.

예를 들어, 자격 증명이 동적으로 제공되는 경우 캐싱을 비활성화할 수 있습니다.

```kotlin
basic {
    cacheTokens = false   // 모든 요청마다 자격 증명을 다시 로드합니다
    credentials {
        loadCurrentCredentials()
    }
}
```

토큰 캐싱 비활성화는 인증 데이터가 자주 변경되거나 최신 상태를 반드시 반영해야 할 때 특히 유용합니다.