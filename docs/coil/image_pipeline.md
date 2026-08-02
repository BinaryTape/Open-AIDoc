# 扩展图像流水线

Android 开箱即用地支持许多 [图像格式](https://developer.android.com/guide/topics/media/media-formats#image-formats)，但也有许多格式不支持（例如 GIF、SVG、MP4 等）。

幸运的是，[ImageLoader](image_loaders.md) 支持可插拔组件，用于添加新的缓存层、新的数据类型、新的获取行为、新的图像编码，或者重写基础图像加载行为。Coil 的图像流水线由五个主要部分组成，按以下顺序执行：[Interceptor](/coil/api/coil-core/coil3.intercept/-interceptor) (拦截器)、[Mapper](/coil/api/coil-core/coil3.map/-mapper) (映射器)、[Keyer](/coil/api/coil-core/coil3.key/-keyer) (键提取器)、[Fetcher](/coil/api/coil-core/coil3.fetch/-fetcher) (获取器) 和 [Decoder](/coil/api/coil-core/coil3.decode/-decoder) (解码器)。

在构建 `ImageLoader` 时，必须通过其 [ComponentRegistry](/coil/api/coil-core/coil3/-component-registry) 添加自定义组件：

```kotlin
val imageLoader = ImageLoader.Builder(context)
    .components {
        add(CustomCacheInterceptor())
        add(ItemMapper())
        add(HttpUrlKeyer())
        add(CronetFetcher.Factory())
        add(GifDecoder.Factory())
    }
    .build()
```

## Interceptor

Interceptor 允许你观察、转换、短路或重试对 `ImageLoader` 图像引擎的请求。例如，你可以像这样添加一个自定义缓存层：

```kotlin
class CustomCacheInterceptor(
    private val context: Context,
    private val cache: LruCache<String, Image>,
) : Interceptor {

    override suspend fun intercept(chain: Interceptor.Chain): ImageResult {
        val value = cache.get(chain.request.data.toString())
        if (value != null) {
            return SuccessResult(
                image = value.bitmap.asImage(),
                request = chain.request,
                dataSource = DataSource.MEMORY_CACHE,
            )
        }
        return chain.proceed()
    }
}
```

Interceptor 是一项高级功能，让你能用自定义逻辑包装 `ImageLoader` 的图像流水线。其设计很大程度上基于 [OkHttp 的 `Interceptor` 接口](https://square.github.io/okhttp/interceptors/#interceptors)。

有关更多信息，请参阅 [Interceptor](/coil/api/coil-core/coil3.intercept/-interceptor)。

## Mapper

Mapper 允许你添加对自定义数据类型的支持。例如，假设我们从服务器获取到以下模型：

```kotlin
data class Item(
    val id: Int,
    val imageUrl: String,
    val price: Int,
    val weight: Double
)
```

我们可以编写一个自定义映射器将其映射到其 URL，该 URL 将在流水线的后续步骤中被处理：

```kotlin
class ItemMapper : Mapper<Item, String> {
    override fun map(data: Item, options: Options) = data.imageUrl
}
```

在构建 `ImageLoader` 时注册它（见上文）后，我们就可以安全地加载 `Item` 了：

```kotlin
val request = ImageRequest.Builder(context)
    .data(item)
    .target(imageView)
    .build()
imageLoader.enqueue(request)
```

有关更多信息，请参阅 [Mapper](/coil/api/coil-core/coil3.map/-mapper)。

## Keyer

Keyer 将数据转换为缓存键的一部分。当该请求的输出被写入 `MemoryCache` 时，此值将用作 `MemoryCache.Key.key`。

有关更多信息，请参阅 [Keyer](/coil/api/coil-core/coil3.key/-keyer)。

## Fetcher

Fetcher 将数据（例如 URL、URI、文件等）转换为 `ImageSource` 或 `Image`。它们通常将输入数据转换为随后可由 `Decoder` 使用的格式。使用此接口可添加对自定义获取机制的支持（例如 Cronet、自定义 URI 方案等）。

有关更多信息，请参阅 [Fetcher](/coil/api/coil-core/coil3.fetch/-fetcher)。

!!! Note
    如果你添加了一个使用自定义数据类型的 `Fetcher`，你还需要提供一个自定义的 `Keyer`，以确保使用该类型的请求结果可以被内存缓存。例如，`Fetcher.Factory<MyDataType>` 将需要添加一个 `Keyer<MyDataType>`。

## Decoder

Decoder 读取 `ImageSource` 并返回 `Image`。使用此接口可添加对自定义文件格式的支持（例如 GIF、SVG、TIFF 等）。

有关更多信息，请参阅 [Decoder](/coil/api/coil-core/coil3.decode/-decoder)。

## 自定义 ImageLoader 和 ImageRequest 属性

Coil 支持通过 `Extras` 向 `ImageRequest` 和 `ImageLoader` 附加自定义数据。`Extras` 是一个额外属性的映射，通过 `Extras.Key` 进行引用。

例如，假设我们想为每个 `ImageRequest` 支持自定义超时。我们可以为其添加自定义扩展函数，如下所示：

```kotlin
fun ImageRequest.Builder.timeout(timeout: Duration) = apply {
    extras[timeoutKey] = timeout
}

fun ImageLoader.Builder.timeout(timeout: Duration) = apply {
    extras[timeoutKey] = timeout
}

val ImageRequest.timeout: Duration
    get() = getExtra(timeoutKey)

val Options.timeout: Duration
    get() = getExtra(timeoutKey)

// 注意：Extras.Key 实例应声明为静态，因为它们是通过实例相等性进行比较的。
private val timeoutKey = Extras.Key(default = Duration.INFINITE)
```

然后，我们可以在注册到 `ImageLoader` 的自定义 `Interceptor` 中读取该属性：

```kotlin
class TimeoutInterceptor : Interceptor {
    override suspend fun intercept(chain: Interceptor.Chain): ImageResult {
        val timeout = chain.request.timeout
        if (timeout.isFinite()) {
            return withTimeout(timeout) {
                chain.proceed()
            }
        } else {
            return chain.proceed()
        }
    }
}
```

最后，我们可以在创建 `ImageRequest` 时设置该属性：

```kotlin
AsyncImage(
    model = ImageRequest.Builder(LocalPlatformContext.current)
        .data("https://example.com/image.jpg")
        .timeout(10.seconds)
        .build(),
    contentDescription = null,
)
```

此外：

- 我们可以通过定义的 `ImageLoader.Builder.timeout` 扩展函数设置默认超时值。
- 我们可以通过定义的 `Options.timeout` 扩展函数在 `Mapper`、`Fetcher` 和 `Decoder` 内部读取超时。

[Coil 自身也使用这种模式](https://github.com/coil-kt/coil/blob/main/coil-gif/src/main/java/coil3/gif/imageRequests.kt)，以为 `coil-gif` 中的 GIF 以及其他扩展库支持自定义请求属性。

## 链式调用组件

Coil 图像加载器组件的一个有用特性是它们可以在内部进行链式调用。例如，假设你需要执行网络请求以获取要加载的图像 URL。

首先，让我们创建一个仅由我们的获取器处理的自定义数据类型：

```kotlin
data class PartialUrl(
    val baseUrl: String,
)
```

然后，创建我们的自定义 `Fetcher`，它将获取图像 URL 并委托给内部的网络获取器：

```kotlin
class PartialUrlFetcher(
    private val callFactory: Call.Factory,
    private val partialUrl: PartialUrl,
    private val options: Options,
    private val imageLoader: ImageLoader,
) : Fetcher {

    override suspend fun fetch(): FetchResult? {
        val request = Request.Builder()
            .url(partialUrl.baseUrl)
            .build()
        val response = callFactory.newCall(request).await()

        // 读取图像 URL。
        val imageUrl: String = readImageUrl(response.body)

        // 这将委托给内部的网络获取器。
        val data = imageLoader.components.map(imageUrl, options)
        val output = imageLoader.components.newFetcher(data, options, imageLoader)
        val (fetcher) = checkNotNull(output) { "no supported fetcher" }
        return fetcher.fetch()
    }

    class Factory(
        private val callFactory: Call.Factory = OkHttpClient(),
    ) : Fetcher.Factory<PartialUrl> {
        override fun create(data: PartialUrl, options: Options, imageLoader: ImageLoader): Fetcher {
            return PartialUrlFetcher(callFactory, data, options, imageLoader)
        }
    }
}
```

最后，我们只需在 `ComponentRegistry` 中注册该 `Fetcher`，并将 `PartialUrl` 作为我们的 `model`/`data` 传入：

```kotlin
AsyncImage(
    model = PartialUrl("https://example.com/image.jpg"),
    contentDescription = null,
)
```

这种模式同样可以应用于 `Mapper`、`Keyer` 和 `Decoder`。