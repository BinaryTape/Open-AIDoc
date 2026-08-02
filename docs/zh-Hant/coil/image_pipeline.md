# 擴充圖片管線

Android [開箱即用](https://developer.android.com/guide/topics/media/media-formats#image-formats)地支援許多圖片格式，但也有許多它不支援的格式（例如：GIF、SVG、MP4 等）。

幸運的是，`ImageLoader` 支援可外掛的組建，以新增快取層、新的資料型別、新的擷取行為、新的圖片編碼，或者覆寫基礎圖片載入行為。Coil 的圖片管線由五個主要部分組成，並依以下順序執行：[Interceptor](/coil/api/coil-core/coil3.intercept/-interceptor)、[Mapper](/coil/api/coil-core/coil3.map/-mapper)、[Keyer](/coil/api/coil-core/coil3.key/-keyer)、[Fetcher](/coil/api/coil-core/coil3.fetch/-fetcher) 以及 [Decoder](/coil/api/coil-core/coil3.decode/-decoder)。

自訂組建在透過 [ComponentRegistry](/coil/api/coil-core/coil3/-component-registry) 建構 `ImageLoader` 時必須被加入：

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

Interceptor 允許您觀察、轉換、短路或重試對 `ImageLoader` 圖片引擎的請求。例如，您可以像這樣加入自訂快取層：

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

Interceptor 是一項進階功能，讓您能使用自訂邏輯封裝 `ImageLoader` 的圖片管線。其設計深受 [OkHttp 的 `Interceptor` 介面](https://square.github.io/okhttp/interceptors/#interceptors) 啟發。

請參閱 [Interceptor](/coil/api/coil-core/coil3.intercept/-interceptor) 以了解更多資訊。

## Mapper

Mapper 允許您新增對自訂資料型別的支援。例如，假設我們從伺服器取得此模型：

```kotlin
data class Item(
    val id: Int,
    val imageUrl: String,
    val price: Int,
    val weight: Double
)
```

我們可以撰寫一個自訂 Mapper 將其對應至其 URL，稍後將在管線中進行處理：

```kotlin
class ItemMapper : Mapper<Item, String> {
    override fun map(data: Item, options: Options) = data.imageUrl
}
```

在組建 `ImageLoader` 時註冊它之後（見上文），我們就可以安全地載入 `Item`：

```kotlin
val request = ImageRequest.Builder(context)
    .data(item)
    .target(imageView)
    .build()
imageLoader.enqueue(request)
```

請參閱 [Mapper](/coil/api/coil-core/coil3.map/-mapper) 以了解更多資訊。

## Keyer

Keyer 將資料轉換為快取金鑰的一部分。當此請求的輸出被寫入 `MemoryCache` 時，此值將用作 `MemoryCache.Key.key`。

請參閱 [Keyer](/coil/api/coil-core/coil3.key/-keyer) 以了解更多資訊。

## Fetcher

Fetcher 將資料（例如：URL、URI、File 等）轉換為 `ImageSource` 或 `Image`。它們通常將輸入資料轉換為隨後可由 `Decoder` 取用的格式。使用此介面可新增對自訂擷取機制（例如：Cronet、自訂 URI 配置等）的支援。

請參閱 [Fetcher](/coil/api/coil-core/coil3.fetch/-fetcher) 以了解更多資訊。

!!! Note
    如果您加入一個使用自訂資料型別的 `Fetcher`，您也需要提供一個自訂的 `Keyer`，以確保使用該型別的請求結果可被記憶體快取。例如，`Fetcher.Factory<MyDataType>` 將需要加入 `Keyer<MyDataType>`。

## Decoder

Decoder 讀取 `ImageSource` 並傳回 `Image`。使用此介面可新增對自訂檔案格式（例如：GIF、SVG、TIFF 等）的支援。

請參閱 [Decoder](/coil/api/coil-core/coil3.decode/-decoder) 以了解更多資訊。

## 自訂 ImageLoader 與 ImageRequest 屬性

Coil 支援透過 `Extras` 將自訂資料附加到 `ImageRequest` 和 `ImageLoader`。`Extras` 是一個額外屬性的 Map，透過 `Extras.Key` 進行參照。

例如，假設我們要為每個 `ImageRequest` 支援自訂逾時。我們可以為其新增自訂擴充函式，如下所示：

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

// 注意：Extras.Key 執行個體應以靜態方式宣告，因為它們是以執行個體相等性進行比較的。
private val timeoutKey = Extras.Key(default = Duration.INFINITE)
```

接著，我們可以在註冊於 `ImageLoader` 中的自訂 `Interceptor` 內讀取該屬性：

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

- 我們可以透過我們定義的 `ImageLoader.Builder.timeout` 擴充函式來設定預設逾時值。
- 我們可以透過我們定義的 `Options.timeout` 擴充函式，在 `Mapper`、`Fetcher` 和 `Decoder` 內部讀取逾時。

[Coil 本身也使用這種模式](https://github.com/coil-kt/coil/blob/main/coil-gif/src/main/java/coil3/gif/imageRequests.kt)，在 `coil-gif` 以及其他擴充程式庫中為 GIF 支援自訂請求屬性。

## 串聯組建

Coil 圖片載入器組建的一個實用特性是它們可以在內部串聯。例如，假設您需要執行網路請求以取得要載入的圖片 URL。

首先，讓我們建立一個僅由我們的 Fetcher 處理的自訂資料型別：

```kotlin
data class PartialUrl(
    val baseUrl: String,
)
```

接著，建立我們的自訂 `Fetcher`，它將取得圖片 URL 並委派給內部的網路 Fetcher：

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

        // 讀取圖片 URL。
        val imageUrl: String = readImageUrl(response.body)

        // 這將委派給內部的網路 Fetcher。
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

最後，我們只需要在 `ComponentRegistry` 中註冊該 `Fetcher`，並傳遞 `PartialUrl` 作為我們的 `model`/`data`：

```kotlin
AsyncImage(
    model = PartialUrl("https://example.com/image.jpg"),
    contentDescription = null,
)
```

這種模式同樣可以應用於 `Mapper`、`Keyer` 和 `Decoder`。