# 네트워크 이미지

기본적으로 Coil 3.x는 네트워크에서 이미지를 로드하는 기능을 포함하지 않습니다. 이는 자신만의 네트워킹 솔루션을 사용하려 하거나 네트워크 URL 지원이 필요하지 않은(예: 디스크에서만 이미지를 로드하는 경우) 사용자에게 거대한 네트워킹 종속성을 강제하지 않기 위함입니다.

네트워크에서 이미지를 가져오는 기능을 추가하려면 **다음 중 하나만** 추가하십시오:

```kotlin
implementation("io.coil-kt.coil3:coil-network-okhttp:3.6.3") // Android/JVM에서만 사용 가능합니다.
implementation("io.coil-kt.coil3:coil-network-ktor2:3.6.3")
implementation("io.coil-kt.coil3:coil-network-ktor3:3.6.3")
```

OkHttp를 사용한다면 이것으로 충분합니다. 라이브러리를 추가하고 나면 `https://example.com/image.jpg`와 같은 네트워크 URL이 자동으로 지원됩니다. Ktor를 사용하는 경우 각 플랫폼에 맞는 엔진을 추가해야 합니다(아래 참조).

## Ktor 네트워크 엔진 {id="ktor-network-engines"}

`coil-network-ktor2` 또는 `coil-network-ktor3`에 의존하는 경우, Javascript를 제외한 각 플랫폼에 맞는 [Ktor 엔진](https://ktor.io/docs/client-engines.html)을 가져와야 합니다. 다음은 퀵스타트를 위한 엔진 구성입니다:

```kotlin
androidMain {
    dependencies {
        implementation("io.ktor:ktor-client-android:<ktor-version>")
    }
}
appleMain {
    dependencies {
        implementation("io.ktor:ktor-client-darwin:<ktor-version>")
    }
}
jvmMain {
    dependencies {
        implementation("io.ktor:ktor-client-java:<ktor-version>")
    }
}
```

커스텀 네트워킹 라이브러리를 사용하고 싶다면 `io.coil-kt.coil3:coil-network-core`를 추가하고, `NetworkClient`를 구현한 뒤, `ImageLoader`에서 커스텀 `NetworkClient`와 함께 `NetworkFetcher`를 등록하면 됩니다.

## 커스텀 OkHttpClient 사용하기 {id="using-a-custom-okhttpclient"}

`io.coil-kt.coil3:coil-network-okhttp`를 사용하는 경우 `ImageLoader`를 생성할 때 커스텀 `OkHttpClient`를 지정할 수 있습니다:

```kotlin
val imageLoader = ImageLoader.Builder(context)
    .components {
        add(
            OkHttpNetworkFetcherFactory(
                callFactory = {
                    OkHttpClient()
                }
            )
        )
    }
    .build()
```

!!! Note
    이미 빌드된 `OkHttpClient`가 있다면, [`newBuilder()`](https://square.github.io/okhttp/5.x/okhttp/okhttp3/-ok-http-client/#customize-your-client-with-newbuilder)를 사용하여 기존 클라이언트와 리소스를 공유하는 새 클라이언트를 빌드하십시오.

## Cache-Control 지원 {id="cache-control-support"}

기본적으로 Coil 3.x는 `Cache-Control` 헤더를 준수하지 않으며 항상 응답을 디스크 캐시에 저장합니다.

`io.coil-kt.coil3:coil-network-cache-control`에는 `NetworkFetcher`가 네트워크 응답의 [`Cache-Control` 헤더](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)를 준수하도록 보장하는 `CacheStrategy` 구현체가 포함되어 있습니다.

`CacheControlCacheStrategy`를 `NetworkFetcher`에 전달한 다음, `ImageLoader`에 커스텀 `NetworkFetcher`를 등록하십시오:

```kotlin
OkHttpNetworkFetcherFactory(
    cacheStrategy = { CacheControlCacheStrategy() },
)
```

!!! Note
    Android API 레벨 25 이하를 지원하려면 `coreLibraryDesugaring`을 활성화해야 합니다. 활성화 방법은 [여기](https://developer.android.com/studio/write/java8-support#library-desugaring)의 문서를 따르십시오.

#### 헤더(Headers) {id="headers"}

이미지 요청에 헤더를 추가하는 방법은 두 가지입니다. 단일 요청에 대해 헤더를 설정할 수 있습니다:

```kotlin
val headers = NetworkHeaders.Builder()
    .set("Cache-Control", "no-cache")
    .build()
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .httpHeaders(headers)
    .target(imageView)
    .build()
imageLoader.execute(request)
```

또는 `ImageLoader`가 실행하는 모든 요청에 대해 헤더를 설정하는 OkHttp [`Interceptor`](https://square.github.io/okhttp/interceptors/)를 생성할 수 있습니다:

```kotlin
class RequestHeaderInterceptor(
    private val name: String,
    private val value: String,
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val headers = Headers.Builder()
            .set("Cache-Control", "no-cache")
            .build()
        val request = chain.request().newBuilder()
            .headers(headers)
            .build()
        return chain.proceed(request)
    }
}

val imageLoader = ImageLoader.Builder(context)
    .components {
        add(
            OkHttpNetworkFetcher(
                callFactory = {
                    OkHttpClient.Builder()
                        // 이 헤더는 모든 이미지 요청에 추가됩니다.
                        .addNetworkInterceptor(RequestHeaderInterceptor("Cache-Control", "no-cache"))
                        .build()
                },
            )
        )
    }
    .build()