[//]: # (title: User agent)

<primary-label ref="client-plugin"/>

[UserAgent](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins/-user-agent) 플러그인은 모든 [요청](client-requests.md)에 `User-Agent` 헤더를 추가합니다.

## 의존성 추가 {id="add_dependencies"}

`UserAgent`는 [ktor-client-core](client-dependencies.md) 아티팩트만 필요하며 별도의 특정 의존성은 필요하지 않습니다.

## UserAgent 설치 및 설정 {id="install_plugin"}

`UserAgent`를 설치하려면 [클라이언트 설정 블록](client-create-and-configure.md#configure-client) 내의 `install` 함수에 전달하세요. 그런 다음 `agent` 속성을 사용하여 `User-Agent` 값을 지정합니다:

```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.*
// ...
val client = HttpClient(CIO) {
    install(UserAgent) {
        agent = "Ktor client"
    }
}
```

Ktor에서는 해당 함수를 사용하여 브라우저 또는 curl과 유사한 `User-Agent` 값을 추가할 수도 있습니다:

```kotlin
val client = HttpClient(CIO) {
    BrowserUserAgent()
    // ... 또는
    CurlUserAgent()
}
```
