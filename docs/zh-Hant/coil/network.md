# 網路圖片

預設情況下，Coil 3.x 不包含從網路載入圖片的支援。這是為了避免對想要使用自訂網路解決方案或不需要網路 URL 支援（例如僅從磁碟載入圖片）的使用者強加龐大的網路相依性。

若要新增從網路擷取圖片的支援，請**僅匯入以下其中一項**：

```kotlin
implementation("io.coil-kt.coil3:coil-network-okhttp:3.6.3") // 僅適用於 Android/JVM。
implementation("io.coil-kt.coil3:coil-network-ktor2:3.6.3")
implementation("io.coil-kt.coil3:coil-network-ktor3:3.6.3")
implementation("io.coil-kt.coil3:coil-network-httpengine:3.6.3") // 僅適用於 Android API 34+。
```

如果你使用 OkHttp 或 HttpEngine，這樣就完成了。匯入之後，便會自動支援像是 `https://example.com/image.jpg` 的網路 URL。如果你使用 Ktor，則需要為每個平台新增支援的引擎（請參閱下方內容）。

## Ktor 網路引擎 {id="ktor-network-engines"}

如果你依賴 `coil-network-ktor2` 或 `coil-network-ktor3`，你需要為每個平台（Javascript 除外）匯入一個 [Ktor 引擎](https://ktor.io/docs/client-engines.html)。以下是一組快速入門的引擎配置：

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

如果你想使用自訂網路程式庫，可以匯入 `io.coil-kt.coil3:coil-network-core`，實作 `NetworkClient`，並在你的 `ImageLoader` 中將自訂的 `NetworkClient` 註冊至 `NetworkFetcher`。

## 使用自訂的 OkHttpClient {id="using-a-custom-okhttpclient"}

如果你使用 `io.coil-kt.coil3:coil-network-okhttp`，可以在建立 `ImageLoader` 時指定自訂的 `OkHttpClient`：

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
    如果你已經建構了 `OkHttpClient`，請使用 [`newBuilder()`](https://lysine.dev/okhttp/5.x/okhttp/okhttp3/-ok-http-client/#customize-your-client-with-newbuilder) 來建置一個與原始用戶端共享資源的新用戶端。

## 在 ImageLoader 中使用 HttpEngine {id="using-httpengine-with-an-imageloader"}

若要在 Android API 34 及更新版本上使用 `HttpEngine`，請新增 `coil-network-httpengine` 並在你的 `ImageLoader` 中註冊其 fetcher：

```kotlin
import android.os.Build.VERSION.SDK_INT
import coil3.ImageLoader
import coil3.network.httpengine.HttpEngineNetworkFetcherFactory

val imageLoader = ImageLoader.Builder(context)
    .components {
        if (SDK_INT >= 34) {
            add(HttpEngineNetworkFetcherFactory())
        }
    }
    .build()
```

如果你沒有手動註冊網路 fetcher，Coil 的 service loader 將依序從 OkHttp、Ktor 3、Ktor 2 和 HttpEngine 中挑選第一個可用的網路用戶端。

## Cache-Control 支援 {id="cache-control-support"}

預設情況下，Coil 3.x 不會遵循 `Cache-Control` 標頭，且一律將回應儲存至其磁碟快取中。

`io.coil-kt.coil3:coil-network-cache-control` 包含一個 `CacheStrategy` 實作，可確保 `NetworkFetcher` 遵循網路回應的 [`Cache-Control` 標頭](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)。

將 `CacheControlCacheStrategy` 傳遞給你的 `NetworkFetcher`，然後在你的 `ImageLoader` 中註冊該自訂的 `NetworkFetcher`：

```kotlin
OkHttpNetworkFetcherFactory(
    cacheStrategy = { CacheControlCacheStrategy() },
)
```

!!! Note
    若要支援 Android API 等級 25 或以下版本，你需要啟用 `coreLibraryDesugaring`。請遵循[此處的文件](https://developer.android.com/studio/write/java8-support#library-desugaring)進行啟用。

#### 標頭 {id="headers"}

可以透過以下兩種方式之一將標頭新增至圖片請求中。你可以為單一請求設定標頭：

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

或者你可以建立一個 OkHttp [`Interceptor`](https://lysine.dev/okhttp/interceptors/)，為你的 `ImageLoader` 所執行的每個請求設定標頭：

```kotlin
class RequestHeaderInterceptor(
    private val name: String,
    private val value: String,
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request().newBuilder()
            .header(name, value)
            .build()
        return chain.proceed(request)
    }
}

val imageLoader = ImageLoader.Builder(context)
    .components {
        add(
            OkHttpNetworkFetcherFactory(
                callFactory = {
                    OkHttpClient.Builder()
                        .addNetworkInterceptor(RequestHeaderInterceptor("Cache-Control", "no-cache"))
                        .build()
                },
            )
        )
    }
    .build()
```