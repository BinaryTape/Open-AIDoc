[//]: # (title: 리다이렉트)

기본적으로 Ktor 클라이언트는 `Location` 헤더에 제공된 URL로 리다이렉트합니다. 필요한 경우 리다이렉션을 비활성화할 수 있습니다.

## 의존성 추가 {id="add_dependencies"}
`HttpRedirect`는 [ktor-client-core](client-dependencies.md) 아티팩트만 필요하며 별도의 특정 의존성이 필요하지 않습니다.

## 리다이렉트 비활성화 {id="disable"}

리다이렉션을 비활성화하려면 [클라이언트 설정 블록](client-create-and-configure.md#configure-client)에서 `followRedirects` 속성을 `false`로 설정하세요:

```kotlin
val client = HttpClient(CIO) {
    followRedirects = false
}
```
