# 扩展图片流水线

Android [开箱即用](https://developer.android.com/guide/topics/media/media-formats#image-formats)支持多种图片格式，但也有很多格式不支持（例如 GIF、SVG、MP4 等）。

幸运的是，[ImageLoader](image_loaders.md) 支持可插拔组件，以添加新的缓存层、新的数据类型、新的获取行为、新的图片编码，或者覆盖基础的图片加载行为。Coil 的图片流水线由五个主要部分组成，并按以下顺序执行：[Interceptors](/coil/api/coil-core/coil3.intercept/-interceptor)、[Mappers](/coil/api/coil-core/coil3.map/-mapper)、[Keyers](/coil/api/coil-core/coil3.key/-keyer)、[Fetchers](/coil/api/coil-core/coil3.fetch/-fetcher) 和 [Decoders](/coil/api/coil-core/coil3.decode/-decoder)。

通过 [ComponentRegistry](/coil/api/coil-core/coil3/-component-registry) 构建 `ImageLoader` 时，必须将自定义组件添加到其中：

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

## Interceptors {id="interceptors"}

Interceptor 允许您观察、转换、短路或重试对 `ImageLoader` 图片引擎的请求。例如，您可以像这样添加自定义缓存层：

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

Interceptor 是一项高级功能，可让您使用自定义逻辑包装 `ImageLoader` 的图片流水线。其设计很大程度上基于 [OkHttp 的 `Interceptor` 接口](https://lysine.dev/okhttp/interceptors/#interceptors)。

有关更多信息，请参阅 [Interceptor](/coil/api/coil-core/coil3.intercept/-interceptor)。

## Mappers {id="mappers"}

Mapper 允许您添加对自定义数据类型的支持。例如，假设我们从服务器获取到以下模型：

```kotlin
data class Item(
    val id: Int,
    val imageUrl: String,
    val price: Int,
    val weight: Double
)
```

我们可以编写一个自定义 mapper 将其映射为其 URL，该 URL 将在流水线的后续流程中进行处理：

```kotlin
class ItemMapper : Mapper<Item, String> {
    override fun map(data: Item, options: Options) = data.imageUrl
}
```

在构建 `ImageLoader` 时注册它之后（见上文），我们就可以安全地加载 `Item`：

```kotlin
val request = ImageRequest.Builder(context)
    .data(item)
    .target(imageView)
    .build()
imageLoader.enqueue(request)
```

有关更多信息，请参阅 [Mapper](/coil/api/coil-core/coil3.map/-mapper)。

## Keyers {id="keyers"}

Keyer 将数据转换为缓存键的一部分。当/如果此请求的输出被写入 `MemoryCache` 时，该值将用作 `MemoryCache.Key.key`。

有关更多信息，请参阅 [Keyers](/coil/api/coil-core/coil3.key/-keyer)。

## Fetchers {id="fetchers"}

Fetcher 将数据（例如 URL、URI、File 等）转换为 `ImageSource` 或 `Image`。它们通常将输入数据转换为可供 `Decoder` 使用的格式。可以使用此接口添加对自定义获取机制（例如 Cronet、自定义 URI 架构等）的支持。

有关更多信息，请参阅 [Fetcher](/coil/api/coil-core/coil3.fetch/-fetcher)。

!!! Note
    如果您添加了使用自定义数据类型的 `Fetcher`，则还需要提供自定义 `Keyer`，以确保使用该类型的请求结果可以被内存缓存。例如，`Fetcher.Factory<MyDataType>` 需要添加一个 `Keyer<MyDataType>`。

## Decoders {id="decoders"}

Decoder 读取 `ImageSource` 并返回 `Image`。可以使用此接口添加对自定义文件格式（例如 GIF、SVG、TIFF 等）的支持。

有关更多信息，请参阅 [Decoder](/coil/api/coil-core/coil3.decode/-decoder)。

## 自定义 ImageLoader 和 ImageRequest 属性 {id="custom-imageloader-and-imagerequest-properties"}

Coil 支持通过 `Extras` 将自定义数据附加到 `ImageRequest` 和 `ImageLoader`。`Extras` 是一个额外属性的映射，通过 `Extras.Key` 进行引用。

例如，假设我们希望为每个 `ImageRequest` 支持自定义超时时间。我们可以像这样为其添加自定义扩展函数：

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

// 注意：Extras.Key 实例应静态声明，因为它们是通过实例相等性进行比较的。
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
- 我们可以通过定义的 `Options.timeout` 扩展函数在 `Mapper`、`Fetcher` 和 `Decoder` 中读取超时时间。

[Coil 自身也使用了这种模式](https://github.com/coil-kt/coil/blob/main/coil-gif/src/main/java/coil3/gif/imageRequests.kt)，在 `coil-gif` 以及其他扩展库中支持 GIF 的自定义请求属性。

## 串联组件 {id="chaining-components"}

Coil 图片加载器组件的一个有用特性是它们可以在内部进行串联。例如，假设您需要执行网络请求以获取要加载的图片 URL。

首先，让我们创建一个仅由我们的 fetcher 处理的自定义数据类型：

```kotlin
data class PartialUrl(
    val baseUrl: String,
)
```

然后，让我们创建自定义 `Fetcher`，它将获取图片 URL 并委托给内部的网络 fetcher：

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

        // 读取图片 URL。
        val imageUrl: String = readImageUrl(response.body)

        // 这将委托给内部网络 fetcher。
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

最后，我们只需在 `ComponentRegistry` 中注册该 `Fetcher`，并将 `PartialUrl` 作为我们的 `model`/`data` 传入即可：

```kotlin
AsyncImage(
    model = PartialUrl("https://example.com/image.jpg"),
    contentDescription = null,
)
```

该模式同样适用于 `Mapper`、`Keyer` 和 `Decoder`。