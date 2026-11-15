# 擴充 Image Pipeline

Android 開箱即用支援許多[圖片格式](https://developer.android.com/guide/topics/media/media-formats#image-formats)，但也有許多格式不受支援（例如 GIF、SVG、MP4 等）。

幸運的是，[ImageLoader](image_loaders.md) 支援可插拔的組件，用以新增快取層、新的資料型別、新的擷取行為、新的圖片編碼，或覆寫基礎的圖片載入行為。Coil 的圖片管線由五個主要部分組成，並依以下順序執行：[Interceptors](/coil/api/coil-core/coil3.intercept/-interceptor)、[Mappers](/coil/api/coil-core/coil3.map/-mapper)、[Keyers](/coil/api/coil-core/coil3.key/-keyer)、[Fetchers](/coil/api/coil-core/coil3.fetch/-fetcher) 與 [Decoders](/coil/api/coil-core/coil3.decode/-decoder)。

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

攔截器允許您觀察、轉換、短路或重試對 `ImageLoader` 圖片引擎的請求。例如，您可以像這樣新增自訂快取層：

```kotlin
class CustomCacheInterceptor(
    private val context: Context,
    private val cache: LruCache<String, Image>,
) : Interceptor {

    override suspend fun intercept(chain: Interceptor.Chain): ImageResult {
        val value = cache.get(chain.request.data.toString())
        if (value != null) {
            return SuccessResult(
                image = value,
                request = chain.request,
                dataSource = DataSource.MEMORY_CACHE,
            )
        }
        return chain.proceed()
    }
}
```

Interceptors 是一項進階功能，讓您可以使用自訂邏輯包裝 `ImageLoader` 的圖片管線。其設計深受 [OkHttp 的 `Interceptor` 介面](https://lysine.dev/okhttp/interceptors/#interceptors)啟發。

請參閱 [Interceptor](/coil/api/coil-core/coil3.intercept/-interceptor) 以取得更多資訊。

## Mappers {id="mappers"}

Mappers 允許您新增對自訂資料型別的支援。舉例來說，假設我們從伺服器收到以下模型：

```kotlin
data class Item(
    val id: Int,
    val imageUrl: String,
    val price: Int,
    val weight: Double
)
```

我們可以撰寫自訂 mapper 將其對應至其 URL，稍後會在管線中處理該 URL：

```kotlin
class ItemMapper : Mapper<Item, String> {
    override fun map(data: Item, options: Options) = data.imageUrl
}
```

在建構我們的 `ImageLoader` 時註冊它之後（見上方），我們就可以安全地載入 `Item`：

```kotlin
val request = ImageRequest.Builder(context)
    .data(item)
    .target(imageView)
    .build()
imageLoader.enqueue(request)
```

請參閱 [Mapper](/coil/api/coil-core/coil3.map/-mapper) 以取得更多資訊。

## Keyers {id="keyers"}

Keyers 將資料轉換為快取鍵的一部分。當此請求的輸出寫入 `MemoryCache` 時，該值將用作 `MemoryCache.Key.key`。

請參閱 [Keyers](/coil/api/coil-core/coil3.key/-keyer) 以取得更多資訊。

## Fetchers {id="fetchers"}

Fetchers 將資料（例如 URL、URI、File 等）轉譯為 `ImageSource` 或 `Image`。它們通常將輸入資料轉換為可供 `Decoder` 取用的格式。使用此介面可新增對自訂擷取機制的支援（例如 Cronet、自訂 URI 配置等）。

請參閱 [Fetcher](/coil/api/coil-core/coil3.fetch/-fetcher) 以取得更多資訊。

!!! Note
    如果您新增了使用自訂資料型別的 `Fetcher`，您還需要提供自訂 `Keyer`，以確保使用該資料型別的請求結果可被記憶體快取。例如，`Fetcher.Factory<MyDataType>` 將需要加入 `Keyer<MyDataType`。

## Decoders {id="decoders"}

Decoders 讀取 `ImageSource` 並傳回 `Image`。使用此介面可新增對自訂檔案格式的支援（例如 GIF、SVG、TIFF 等）。

請參閱 [Decoder](/coil/api/coil-core/coil3.decode/-decoder) 以取得更多資訊。

## 自訂 ImageLoader 與 ImageRequest 屬性 {id="custom-imageloader-and-imagerequest-properties"}

Coil 支援透過其 `Extras` 將自訂資料附加到 `ImageRequest` 和 `ImageLoader`。`Extras` 是一個額外屬性的 map，透過 `Extras.Key` 進行參照。

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

然後我們可以在自訂的 `Interceptor` 中讀取該屬性，並將該攔截器註冊到我們的 `ImageLoader` 中：

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

- 我們可以透過定義的 `ImageLoader.Builder.timeout` 擴充函式來設定預設逾時值。
- 我們可以透過定義的 `Options.timeout` 擴充函式，在 `Mapper`、`Fetcher` 和 `Decoder` 內讀取逾時值。

[Coil 本身就採用了這種模式](https://github.com/coil-kt/coil/blob/main/coil-gif/src/main/java/coil3/gif/imageRequests.kt)，在 `coil-gif` 以及其他擴充程式庫中支援 GIF 的自訂請求屬性。

## 串接組件 {id="chaining-components"}

Coil 的圖片載入器組件有一個實用的特性，那就是它們可以在內部進行串接。例如，假設您需要執行網路請求以取得將要載入的圖片 URL。

首先，讓我們建立一個僅由我們的 fetcher 處理的自訂資料型別：

```kotlin
data class PartialUrl(
    val baseUrl: String,
)
```

接著，讓我們建立自訂的 `Fetcher`，用來取得圖片 URL 並委派給內部網路 fetcher：

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

最後，我們只需要在 `ComponentRegistry` 中註冊該 `Fetcher`，並將 `PartialUrl` 作為我們的 `model`/`data` 傳遞：

```kotlin
AsyncImage(
    model = PartialUrl("https://example.com/image.jpg"),
    contentDescription = null,
)
```

此模式同樣適用於 `Mapper`、`Keyer` 和 `Decoder`。