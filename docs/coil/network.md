# 网络图像

默认情况下，Coil 3.x 不包含从网络加载图像的支持。这是为了避免向希望使用自己的网络解决方案或不需要网络 URL 支持（例如：仅从磁盘加载图像）的用户强制施加大型网络依赖项。

要添加从网络获取图像的支持，请**仅导入以下其中一项**：

```kotlin
implementation("io.coil-kt.coil3:coil-network-okhttp:3.6.3") // 仅在 Android/JVM 上可用。
implementation("io.coil-kt.coil3:coil-network-ktor2:3.6.3")
implementation("io.coil-kt.coil3:coil-network-ktor3:3.6.3")
```

如果你使用 OkHttp，这就完成了。导入后，类似 `https://example.com/image.jpg` 的网络 URL 将会自动受到支持。如果你使用 Ktor，你需要为每个平台添加支持的引擎（见下文）。

## Ktor 网络引擎 {id="ktor-network-engines"}

如果你依赖于 `coil-network-ktor2` 或 `coil-network-ktor3`，你需要为每个平台（Javascript 除外）导入一个 [Ktor 引擎](https://ktor.io/docs/client-engines.html)。以下是一组快速入门引擎：

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

如果你想使用自定义网络库，可以导入 `io.coil-kt.coil3:coil-network-core`，实现 `NetworkClient`，并在 `ImageLoader` 中使用你的自定义 `NetworkClient` 注册 `NetworkFetcher`。

## 使用自定义 OkHttpClient {id="using-a-custom-okhttpclient"}

如果你使用 `io.coil-kt.coil3:coil-network-okhttp`，你可以在创建 `ImageLoader` 时指定一个自定义 `OkHttpClient`：

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
    如果你已经有一个构建好的 `OkHttpClient`，请使用 [`newBuilder()`](https://square.github.io/okhttp/5.x/okhttp/okhttp3/-ok-http-client/#customize-your-client-with-newbuilder) 来构建一个与原客户端共享资源的新客户端。

## Cache-Control 支持 {id="cache-control-support"}

默认情况下，Coil 3.x 不遵循 `Cache-Control` 标头，并且总是将响应保存到其磁盘缓存中。

`io.coil-kt.coil3:coil-network-cache-control` 包含一个 `CacheStrategy` 实现，可确保 `NetworkFetcher` 遵循网络响应的 [`Cache-Control` 标头](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)。

将 `CacheControlCacheStrategy` 传递给你的 `NetworkFetcher`，然后在 `ImageLoader` 中注册该自定义 `NetworkFetcher`：

```kotlin
OkHttpNetworkFetcherFactory(
    cacheStrategy = { CacheControlCacheStrategy() },
)
```

!!! Note
    你需要启用 `coreLibraryDesugaring` 以支持 Android API 级别 25 或更低版本。请按照[此处](https://developer.android.com/studio/write/java8-support#library-desugaring)的文档进行启用。

#### 标头 {id="headers"}

可以通过以下两种方式之一将标头添加到图像请求中。你可以为单个请求设置标头：

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

或者，你可以创建一个 OkHttp [`Interceptor`](https://square.github.io/okhttp/interceptors/)，为你的 `ImageLoader` 执行的每个请求设置标头：

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
                        // 此标头将被添加到每个图像请求中。
                        .addNetworkInterceptor(RequestHeaderInterceptor("Cache-Control", "no-cache"))
                        .build()
                },
            )
        )
    }
    .build()