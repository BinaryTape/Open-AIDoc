# 画像パイプラインの拡張

Androidは標準で多くの[画像フォーマット](https://developer.android.com/guide/topics/media/media-formats#image-formats)をサポートしていますが、サポートしていないフォーマットも数多く存在します（例: GIF、SVG、MP4など）。

幸いなことに、[ImageLoader](image_loaders.md)はプラガブルなコンポーネントをサポートしており、新しいキャッシュレイヤー、新しいデータ型、新しいフェッチ動作、新しい画像エンコーディングの追加や、ベースとなる画像読み込み動作の上書きが可能です。Coilの画像パイプラインは主に5つのパートで構成され、以下の順序で実行されます: [Interceptors](/coil/api/coil-core/coil3.intercept/-interceptor)、[Mappers](/coil/api/coil-core/coil3.map/-mapper)、[Keyers](/coil/api/coil-core/coil3.key/-keyer)、[Fetchers](/coil/api/coil-core/coil3.fetch/-fetcher)、そして[Decoders](/coil/api/coil-core/coil3.decode/-decoder)。

カスタムコンポーネントは、`ImageLoader`の構築時にその[ComponentRegistry](/coil/api/coil-core/coil3/-component-registry)を通じて追加する必要があります:

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

Interceptorを使用すると、`ImageLoader`の画像エンジンへのリクエストを監視、変換、ショートサーキット（短絡）、またはリトライできます。たとえば、以下のようにカスタムキャッシュレイヤーを追加できます:

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

Interceptorは、`ImageLoader`の画像パイプラインをカスタムロジックでラップできる高度な機能です。その設計は[OkHttpの`Interceptor`インターフェース](https://lysine.dev/okhttp/interceptors/#interceptors)に大きく基づいています。

詳細については、[Interceptor](/coil/api/coil-core/coil3.intercept/-interceptor)を参照してください。

## Mappers {id="mappers"}

Mapperを使用すると、カスタムデータ型のサポートを追加できます。たとえば、サーバーから以下のようなモデルを取得するとします:

```kotlin
data class Item(
    val id: Int,
    val imageUrl: String,
    val price: Int,
    val weight: Double
)
```

これをパイプラインの後続で処理されるURLへとマッピングする、カスタムMapperを作成できます:

```kotlin
class ItemMapper : Mapper<Item, String> {
    override fun map(data: Item, options: Options) = data.imageUrl
}
```

`ImageLoader`の構築時にこれを登録（上記参照）した後は、安全に`Item`を読み込むことができます:

```kotlin
val request = ImageRequest.Builder(context)
    .data(item)
    .target(imageView)
    .build()
imageLoader.enqueue(request)
```

詳細については、[Mapper](/coil/api/coil-core/coil3.map/-mapper)を参照してください。

## Keyers {id="keyers"}

Keyerは、データをキャッシュキーの一部へと変換します。この値は、このリクエストの出力が`MemoryCache`に書き込まれる場合（書き込まれるタイミング）に`MemoryCache.Key.key`として使用されます。

詳細については、[Keyers](/coil/api/coil-core/coil3.key/-keyer)を参照してください。

## Fetchers {id="fetchers"}

Fetcherは、データ（例: URL、URI、Fileなど）を`ImageSource`または`Image`のいずれかに変換します。通常、入力データを`Decoder`で処理可能な形式に変換します。このインターフェースを使用して、カスタムのフェッチメカニズム（例: Cronet、カスタムURIスキームなど）のサポートを追加します。

詳細については、[Fetcher](/coil/api/coil-core/coil3.fetch/-fetcher)を参照してください。

!!! Note
    カスタムデータ型を使用する`Fetcher`を追加する場合、それを使用するリクエストの結果をメモリキャッシュ可能にするために、カスタム`Keyer`も提供する必要があります。たとえば、`Fetcher.Factory<MyDataType>`を追加する場合、`Keyer<MyDataType>`も追加する必要があります。

## Decoders {id="decoders"}

Decoderは`ImageSource`を読み取り、`Image`を返します。このインターフェースを使用して、カスタムファイルフォーマット（例: GIF、SVG、TIFFなど）のサポートを追加します。

詳細については、[Decoder](/coil/api/coil-core/coil3.decode/-decoder)を参照してください。

## ImageLoaderとImageRequestのカスタムプロパティ {id="custom-imageloader-and-imagerequest-properties"}

Coilは、`Extras`を介して`ImageRequest`や`ImageLoader`にカスタムデータを添付することをサポートしています。`Extras`は、`Extras.Key`を介して参照される追加プロパティのマップです。

たとえば、各`ImageRequest`に対してカスタムタイムアウトを設定できるようにしたいとします。その場合、以下のようにカスタム拡張関数を追加できます:

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

// NOTE: Extras.Keyのインスタンスはインスタンスの同一性（参照等価性）で比較されるため、静的に宣言する必要があります。
private val timeoutKey = Extras.Key(default = Duration.INFINITE)
```

その後、`ImageLoader`に登録するカスタム`Interceptor`の内部でこのプロパティを読み取ることができます:

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

最後に、`ImageRequest`の作成時にこのプロパティを設定できます:

```kotlin
AsyncImage(
    model = ImageRequest.Builder(LocalPlatformContext.current)
        .data("https://example.com/image.jpg")
        .timeout(10.seconds)
        .build(),
    contentDescription = null,
)
```

さらに:

- 定義した`ImageLoader.Builder.timeout`拡張関数を介して、デフォルトのタイムアウト値を設定できます。
- 定義した`Options.timeout`拡張関数を介して、`Mapper`、`Fetcher`、`Decoder`の内部でタイムアウトを読み取ることができます。

[Coil自身もこのパターンを使用して](https://github.com/coil-kt/coil/blob/main/coil-gif/src/main/java/coil3/gif/imageRequests.kt)、`coil-gif`でのGIFやその他の拡張ライブラリ用のカスタムリクエストプロパティをサポートしています。

## コンポーネントの連鎖（Chaining components） {id="chaining-components"}

Coilの画像ローダーコンポーネントの便利な特性として、内部で連鎖させることができる点が挙げられます。たとえば、読み込む画像URLを取得するためにネットワークリクエストを実行する必要がある場合を考えてみましょう。

まず、独自のFetcherのみが処理するカスタムデータ型を作成します:

```kotlin
data class PartialUrl(
    val baseUrl: String,
)
```

次に、画像URLを取得して内部のネットワークFetcherに委任するカスタム`Fetcher`を作成します:

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

        // 画像URLを読み取る。
        val imageUrl: String = readImageUrl(response.body)

        // これにより内部のネットワークFetcherに処理が委任される。
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

最後に、この`Fetcher`を`ComponentRegistry`に登録し、`model`/`data`として`PartialUrl`を渡すだけです:

```kotlin
AsyncImage(
    model = PartialUrl("https://example.com/image.jpg"),
    contentDescription = null,
)
```

このパターンは、`Mapper`、`Keyer`、および`Decoder`にも同様に適用できます。