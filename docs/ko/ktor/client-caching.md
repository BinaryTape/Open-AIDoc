[//]: # (title: 캐싱)

<primary-label ref="client-plugin"/>

<tldr>
<var name="example_name" value="client-caching"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
HttpCache 플러그인을 사용하면 이전에 가져온 리소스를 인메모리 또는 영구 캐시에 저장할 수 있습니다.
</link-summary>

Ktor 클라이언트는 이전에 가져온 리소스를 메모리나 영구 스토리지에 캐싱하기 위한 [`HttpCache`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache/-http-cache/index.html) 플러그인을 제공합니다.

## 의존성 추가 {id="add_dependencies"}

`HttpCache` 플러그인은 [`ktor-client-core`](client-dependencies.md) 아티팩트에 포함되어 있으며 추가적인 의존성이 필요하지 않습니다.

## 인메모리 캐시 {id="memory_cache"}

인메모리 캐시를 활성화하려면 [클라이언트 구성 블록](client-create-and-configure.md#configure-client)에 `HttpCache`를 설치합니다:
```kotlin
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.cache.*
//...
val client = HttpClient(CIO) {
    install(HttpCache)
}
```

기본적으로 `HttpCache` 플러그인은 캐시된 응답을 메모리에 저장합니다.

예를 들어 `Cache-Control` 헤더가 설정된 리소스에 두 번 연속으로 [요청](client-requests.md)을 보내는 경우, 클라이언트는 리소스를 다시 요청하는 대신 캐시에서 두 번째 응답을 제공할 수 있습니다.

## 영구 캐시 {id="persistent_cache"}

[`CacheStorage`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache.storage/-cache-storage/index.html) 구현체를 구성하여 캐시된 응답을 영구적으로 저장할 수 있습니다.

Ktor는 캐시된 응답을 파일 시스템에 저장하는 [`FileStorage()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache.storage/-file-storage.html) 함수를 제공합니다. `FileStorage()`는 `kotlinx-io`를 사용하며 지원되는 모든 플랫폼에서 사용할 수 있습니다.

캐시 디렉터리에 대한 `Path`를 생성하여 `FileStorage()` 함수에 전달합니다. 그런 다음 `publicStorage()` 또는 `privateStorage()` 함수를 사용하여 스토리지를 구성합니다:

```kotlin
val client = HttpClient(CIO) {
    install(HttpCache) {
        publicStorage(FileStorage(Path("build/cache")))
    }
}
```

* 공유 캐시에 저장할 수 있는 응답에는 [`publicStorage()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache/-http-cache/-config/public-storage.html) 함수를 사용합니다.
* 프라이빗 캐시를 대상으로 하는 응답에는 [`privateStorage()`](https://api.ktor.io/ktor-client-core/io.ktor.client.plugins.cache/-http-cache/-config/private-storage.html) 함수를 사용합니다.

> 전체 예제는 [client-caching](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/client-caching)을 참조하세요.
>
{style="tip"}