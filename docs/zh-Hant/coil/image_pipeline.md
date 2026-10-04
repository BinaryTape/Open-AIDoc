# 擴充圖片管線

Android [開箱即用](https://developer.android.com/guide/topics/media/media-formats#image-formats)支援許多圖片格式，但也有許多格式不受支援（例如：GIF、SVG、MP4 等）。

幸運的是，[ImageLoader](image_loaders.md) 支援可插入式組件，可用於新增快取層、新資料型別、新擷取行為、新圖片編碼，或覆寫基礎的圖片載入行為。Coil 的圖片管線由五個主要部分組成，並依下列順序執行：[Interceptors](/coil/api/coil-core/coil3.intercept/-interceptor)、[Mappers](/coil/api/coil-core/coil3.map/-mapper)、[Keyers](/coil/api/coil-core/coil3.key/-keyer)、[Fetchers](/coil/api/coil-core/coil3.fetch/-fetcher) 以及 [Decoders](/coil/api/coil-core/coil3.decode/-decoder)。

自訂組件必須在透過 [ComponentRegistry](/coil/api/coil-core/coil3/-component-registry) 建構 `ImageLoader` 時加入：

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

Interceptor 允許你觀察、轉換、短路（short circuit）或重試發往 `ImageLoader` 圖片引擎的請求。例如，你可以像這樣新增自訂快取層：

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

Interceptor 是一項進階功能，讓你能使用自訂邏輯包裝 `ImageLoader` 的圖片管線。其設計很大程度上基於 [OkHttp 的 `Interceptor` 介面](https://lysine.dev/okhttp/interceptors/#interceptors)。

如需更多資訊，請參閱 [Interceptor](/coil/api/coil-core/coil3.intercept/-interceptor)。

## Mappers {id="mappers"}

Mapper 允許你新增對自訂資料型別的支援。舉例來說，假設我們從伺服器取得以下模型：

```kotlin
data class Item(
    val id: Int,
    val imageUrl: String,
    val price: Int,
    val weight: Double
)
```

我們可以撰寫一個自訂 Mapper 將其對應至其 URL，後續會在管線中進行處理：

```kotlin
class ItemMapper : Mapper<Item, String> {
    override fun map(data: Item, options: Options) = data.imageUrl
}
```

在建構 `ImageLoader` 時註冊它（見上文）後，我們就可以安全地載入 `Item`：

```kotlin
val request = ImageRequest.Builder(context)
    .data(item)
    .target(imageView)
    .build()
imageLoader.enqueue(request)
```

如需更多資訊，請參閱 [Mapper](/coil/api/coil-core/coil3.map/-mapper)。

## Keyers {id="keyers"}

Keyer 將資料轉換為快取索引鍵的一部分。當此請求的輸出寫入 `MemoryCache` 時，該值將用作 `MemoryCache.Key.key`。

如需更多資訊，請參閱 [Keyers](/coil/api/coil-core/coil3.key/-keyer)。

## Fetchers {id="fetchers"}

Fetcher 將資料（例如 URL、URI、File 等）轉換為 `ImageSource` 或 `Image`。它們通常將輸入資料轉換為可供 `Decoder` 使用的格式。使用此介面可新增對自訂擷取機制的支援（例如 Cronet、自訂 URI 配置等）。

如需更多資訊，請參閱 [Fetcher](/coil/api/coil-core/coil3.fetch/-fetcher)。

!!! Note
    如果你新增了使用自訂資料型別的 `Fetcher`，你也需要提供自訂的 `Keyer`，以確保使用該型別的請求結果可被記憶體快取。例如，`Fetcher.Factory<MyDataType>` 需要新增 `Keyer<MyDataType`。

## Decoders {id="decoders"}

Decoder 讀取 `ImageSource` 並傳回一個 `Image`。使用此介面可新增對自訂檔案格式的支援（例如 GIF、SVG、TIFF 等）。

如需更多資訊，請參閱 [Decoder](/coil/api/coil-core/coil3.decode/-decoder)。

## 自訂 ImageLoader 與 ImageRequest 屬性 {id="custom-imageloader-and-imagerequest-properties"}

Coil 支援透過 `ImageRequest` 與 `ImageLoader` 的 `Extras` 附加自訂資料。`Extras` 是一個透過 `Extras.Key` 引用的額外屬性 Map。

例如，假設我們想要為每個 `ImageRequest` 支援自訂逾時時間。我們可以像這樣為其新增自訂擴充函式：

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

// NOTE: Extras.Key instances should be declared statically as they're compared with instance equality.
private val timeoutKey = Extras.Key(default = Duration.INFINITE)
```

接著我們可以在註冊至 `ImageLoader` 的自訂 `Interceptor` 內讀取該屬性：

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

最後，我們可以在建立 `ImageRequest` 時設定該屬性：

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

- 我們可以透過我們定義的 `ImageLoader.Builder.timeout` 擴充函式設定預設逾時值。
- 我們可以透過我們定義的 `Options.timeout` 擴充函式在 `Mapper`、`Fetcher` 與 `Decoder` 內讀取逾時設定。

[Coil 本身也使用此模式](https://github.com/coil-kt/coil/blob/main/coil-gif/src/main/java/coil3/gif/imageRequests.kt)來為 `coil-gif` 中的 GIF 以及其他擴充程式庫支援自訂請求屬性。

## 鏈結組件 {id="chaining-components"}

Coil 圖片載入器組件的一個實用特性是它們可以在內部相互鏈結。例如，假設你需要執行網路請求以取得即將載入的圖片 URL。

首先，讓我們建立一個僅由我們的 Fetcher 處理的自訂資料型別：

```kotlin
data class PartialUrl(
    val baseUrl: String,
)
```

接著建立我們的自訂 `Fetcher`，它將取得圖片 URL 並委派給內部的網路 Fetcher：

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

        // Read the image URL.
        val imageUrl: String = readImageUrl(response.body)

        // This will delegate to the internal network fetcher.
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

最後，我們只需要在 `ComponentRegistry` 中註冊該 `Fetcher`，並將 `PartialUrl` 作為 `model`/`data` 傳入：

```kotlin
AsyncImage(
    model = PartialUrl("https://example.com/image.jpg"),
    contentDescription = null,
)
```

此模式同樣可套用於 `Mapper`、`Keyer` 和 `Decoder`。