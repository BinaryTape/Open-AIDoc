[//]: # (title: 클라이언트 플러그인)

<link-summary>
로깅, 직렬화, 인증과 같은 일반적인 기능을 추가하기 위해 클라이언트 플러그인을 사용하는 방법을 알아봅니다.
</link-summary>

많은 애플리케이션은 [로깅](client-logging.md), [직렬화](client-serialization.md), [인증](client-auth.md)과 같이 핵심 애플리케이션 로직의 일부가 아닌 공통 기능들을 필요로 합니다. Ktor에서 이러한 기능은 클라이언트 _플러그인(plugins)_에 의해 제공됩니다.

## 플러그인 의존성 추가 {id="plugin-dependency"}

일부 플러그인은 추가 [의존성](client-dependencies.md)이 필요합니다. 예를 들어, [로깅](client-logging.md) 플러그인을 사용하려면 빌드 스크립트에 `ktor-client-logging` 아티팩트를 추가해야 합니다:

<var name="artifact_name" value="ktor-client-logging"/>
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

각 플러그인의 문서에는 필요한 의존성이 명시되어 있습니다.

## 플러그인 설치 {id="install"}

플러그인을 설치하려면 [클라이언트 설정 블록](client-create-and-configure.md#configure-client) 내부의 `install()` 함수에 해당 플러그인을 전달합니다.

예를 들어, `Logging` 플러그인을 설치하는 방법은 다음과 같습니다:

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.logging.*

val client = HttpClient(CIO) {
    install(Logging)
}
```

### 플러그인 설치 또는 교체 {id="install_or_replace"}

경우에 따라 플러그인이 이미 설치되어 있을 수 있습니다. 예를 들어, 공유된 클라이언트 설정 코드에 의해 설치된 경우입니다. 이러한 경우에는 `installOrReplace()` 함수를 사용하여 설정을 교체할 수 있습니다:

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*

val client = HttpClient(CIO) {
    installOrReplace(ContentNegotiation) {
        // ...
    }
}
```

이 함수는 플러그인이 없는 경우 새로 설치하고, 이미 설치되어 있는 경우 기존 설정을 교체합니다.

## 플러그인 설정 {id="configure_plugin"}

대부분의 플러그인은 `install` 블록 내부에서 설정할 수 있는 옵션들을 제공합니다.

예를 들어, [`Logging`](client-logging.md) 플러그인을 사용하면 로거(logger), 로깅 레벨, 그리고 로그 메시지 필터링 조건을 지정할 수 있습니다:

```kotlin
package com.example

import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.logging.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.coroutines.runBlocking

fun main() {
    runBlocking {
        val client = HttpClient(CIO) {
            install(Logging) {
                logger = Logger.DEFAULT
                level = LogLevel.HEADERS
                filter { request ->
                    request.url.host.contains("ktor.io")
                }
                sanitizeHeader { header -> header == HttpHeaders.Authorization }
            }
        }

        val response1: HttpResponse = client.get("https://ktor.io/")
        val response2: HttpResponse = client.get("https://jetbrains.com/")
    }
}
```

## 커스텀 플러그인 만들기 {id="custom"}

기존 플러그인이 요구 사항을 충족하지 않는 경우, 자신만의 커스텀 클라이언트 플러그인을 만들 수 있습니다. 커스텀 플러그인을 사용하면 요청과 응답을 가로채고(intercept) 재사용 가능한 동작을 구현할 수 있습니다.

더 자세히 알아보려면 [커스텀 클라이언트 플러그인(Custom client plugins)](client-custom-plugins.md)을 참조하세요.