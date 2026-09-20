# 網路圖片

預設情況下，Coil 3.x 不包含從網路載入圖片的支援。這是為了避免強加龐大的網路相依性給那些想要使用自訂網路解決方案，或不需要網路 URL 支援（例如：僅從磁碟載入圖片）的使用者。

若要增加從網路擷取圖片的支援，請**僅匯入以下其中之一**：

```kotlin
implementation("io.coil-kt.coil3:coil-network-okhttp:3.6.3") // 僅適用於 Android/JVM。
implementation("io.coil-kt.coil3:coil-network-ktor2:3.6.3")
implementation("io.coil-kt.coil3:coil-network-ktor3:3.6.3")
```

如果您使用 OkHttp，這樣就完成了。匯入後，將自動支援如 `https://example.com/image.jpg` 的網路 URL。如果您使用 Ktor，則需要為每個平台新增支援的引擎（見下文）。

## Ktor 網路引擎 {id="ktor-network-engines"}

如果您相依於 `coil-network-ktor2` 或 `coil-network-ktor3`，您需要為每個平台（Javascript 除外）匯入一個 [Ktor 引擎](https://ktor.io/docs/client-engines.html)。以下是快速入門的引擎集：

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

如果您想使用自訂網路程式庫，可以匯入 `io.coil-kt.coil3:coil-network-core`，實作 `NetworkClient`，並在您的 `ImageLoader` 中將 `NetworkFetcher` 與您的自訂 `NetworkClient` 一起註冊。

## 使用自訂 OkHttpClient {id="using-a-custom-okhttpclient"}

如果您使用 `io.coil-kt.coil3:coil-network-okhttp`，您可以在建立 `ImageLoader` 時指定自訂的 `OkHttpClient`：

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
    如果您已經有一個已建置的 `OkHttpClient`，請使用 [`newBuilder()`](https://square.github.io/okhttp/5.x/okhttp/okhttp3/-ok-http-client/#customize-your-client-with-newbuilder) 來建置一個與原始用戶端共享資源的新用戶端。

## Cache-Control 支援 {id="cache-control-support"}

預設情況下，Coil 3.x 不會遵循 `Cache-Control` 標頭，且一律將回應儲存到其磁碟快取中。

`io.coil-kt.coil3:coil-network-cache-control` 包含一個 `CacheStrategy` 實作，可確保 `NetworkFetcher` 遵循網路回應的 [`Cache-Control` 標頭](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)。

將 `CacheControlCacheStrategy` 傳遞給您的 `NetworkFetcher`，然後在您的 `ImageLoader` 中註冊該自訂 `NetworkFetcher`：

```kotlin
OkHttpNetworkFetcherFactory(
    cacheStrategy = { CacheControlCacheStrategy() },
)
```

!!! Note
    您需要啟用 `coreLibraryDesugaring` 以支援 Android API 層級 25 或以下版本。請按照[這裡](https://developer.android.com/studio/write/java8-support#library-desugaring)的文件進行啟用。

#### 標頭 {id="headers"}

可以透過兩種方式之一將標頭新增到您的圖片請求中。您可以為單一請求設定標頭：

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

或者您可以建立一個 OkHttp [`Interceptor`](https://square.github.io/okhttp/interceptors/)，為您的 `ImageLoader` 執行的每個請求設定標頭：

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
                        // 此標頭將會新增到每個圖片請求中。
                        .addNetworkInterceptor(RequestHeaderInterceptor("Cache-Control", "no-cache"))
                        .build()
                },
            )
        )
    }
    .build()