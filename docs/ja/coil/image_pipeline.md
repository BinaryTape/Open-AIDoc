# イメージパイプラインの拡張

Androidは多くの[画像形式](https://developer.android.com/guide/topics/media/media-formats#image-formats)を標準でサポートしていますが、サポートしていない形式（GIF、SVG、MP4など）も多く存在します。

幸いなことに、[ImageLoader](image_loaders.md)は、新しいキャッシュレイヤー、新しいデータ型、新しいフェッチ動作、新しい画像エンコーディングを追加したり、ベースの画像読み込み動作を上書きしたりするためのプラグイン可能なコンポーネントをサポートしています。Coilのイメージパイプラインは、主に5つのパーツで構成されており、[Interceptors](/coil/api/coil-core/coil3.intercept/-interceptor)、[Mappers](/coil/api/coil-core/coil3.map/-mapper)、[Keyers](/coil/api/coil-core/coil3.key/-keyer)、[Fetchers](/coil/api/coil-core/coil3.fetch/-fetcher)、[Decoders](/coil/api/coil-core/coil3.decode/-decoder)の順に実行されます。

カスタムコンポーネントは、`ImageLoader`を構築する際に、その[ComponentRegistry](/coil/api/coil-core/coil3/-component-registry)を通じて追加する必要があります。

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

## Interceptors

Interceptor（インターセプター）を使用すると、`ImageLoader`の画像エンジンのリクエストを監視、変換、ショートサーキット（処理の打ち切り）、またはリトライできます。たとえば、次のようにカスタムキャッシュレイヤーを追加できます。

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

Interceptorは、`ImageLoader`のイメージパイプラインをカスタムロジックでラップできる高度な機能です。その設計は、[OkHttpの`Interceptor`インターフェース](https://square.github.io/okhttp/interceptors/#interceptors)に強く基づいています。

詳細については、[Interceptor](/coil/api/coil-core/coil3.intercept/-interceptor)を参照してください。

## Mappers

Mapper（マッパー）を使用すると、カスタムデータ型のサポートを追加できます。たとえば、サーバーから次のようなモデルを取得するとします。

```kotlin
data class Item(
    val id: Int,
    val imageUrl: String,
    val price: Int,
    val weight: Double
)
```

これをURLにマッピングするカスタムマッパーを作成できます。このURLは、パイプラインの後半で処理されます。

```kotlin
class ItemMapper : Mapper<Item, String> {
    override fun map(data: Item, options: Options) = data.imageUrl
}
```

`ImageLoader`の構築時に登録（上記参照）すると、`Item`を安全にロードできるようになります。

```kotlin
val request = ImageRequest.Builder(context)
    .data(item)
    .target(imageView)
    .build()
imageLoader.enqueue(request)
```

詳細については、[Mapper](/coil/api/coil-core/coil3.map/-mapper)を参照してください。

## Keyers

Keyer（キーヤー）は、データをキャッシュキーの一部に変換します。この値は、リクエストの出力が`MemoryCache`に書き込まれる際に`MemoryCache.Key.key`として使用されます。

詳細については、[Keyers](/coil/api/coil-core/coil3.key/-keyer)を参照してください。

## Fetchers

Fetcher（フェッチャー）は、データ（URL、URI、Fileなど）を`ImageSource`または`Image`に変換します。通常、入力データを`Decoder`で処理可能な形式に変換します。このインターフェースを使用して、カスタムフェッチメカニズム（Cronet、カスタムURIスキームなど）のサポートを追加します。

詳細については、[Fetcher](/coil/api/coil-core/coil3.fetch/-fetcher)を参照してください。

!!! Note
    カスタムデータ型を使用する`Fetcher`を追加する場合は、その結果をメモリキャッシュ可能にするために、カスタムの`Keyer`も提供する必要があります。たとえば、`Fetcher.Factory<MyDataType>`には`Keyer<MyDataType>`を追加する必要があります。

## Decoders

Decoder（デコーダー）は、`ImageSource`を読み取り、`Image`を返します。このインターフェースを使用して、カスタムファイル形式（GIF、SVG、TIFFなど）のサポートを追加します。

詳細については、[Decoder](/coil/api/coil-core/coil3.decode/-decoder)を参照してください。

## Custom ImageLoader and ImageRequest properties

Coilは、`Extras`を通じて`ImageRequest`や`ImageLoader`にカスタムデータを添付することをサポートしています。`Extras`は、`Extras.Key`を介して参照される拡張プロパティのマップです。

たとえば、各`ImageRequest`にカスタムタイムアウトをサポートしたい場合、次のようにカスタム拡張関数を追加できます。

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

// 注: Extras.Key インスタンスはインスタンスの同一性で比較されるため、静的に宣言する必要があります。
private val timeoutKey = Extras.Key(default = Duration.INFINITE)
```

その後、`ImageLoader`に登録するカスタム`Interceptor`内でこのプロパティを読み取ることができます。

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

最後に、`ImageRequest`を作成するときにプロパティを設定できます。

```kotlin
AsyncImage(
    model = ImageRequest.Builder(LocalPlatformContext.current)
        .data("https://example.com/image.jpg")
        .timeout(10.seconds)
        .build(),
    contentDescription = null,
)
```

さらに：

- 定義した`ImageLoader.Builder.timeout`拡張関数を介して、デフォルトのタイムアウト値を設定できます。
- 定義した`Options.timeout`拡張関数を介して、`Mapper`、`Fetcher`、`Decoder`内でタイムアウトを読み取ることができます。

[Coil自体もこのパターンを使用](https://github.com/coil-kt/coil/blob/main/coil-gif/src/main/java/coil3/gif/imageRequests.kt)しており、`coil-gif`やその他の拡張ライブラリにおいて、GIF用のカスタムリクエストプロパティなどをサポートしています。

## Chaining components

Coilのイメージローダーコンポーネントの便利な特性は、内部的にチェイン（連結）できることです。たとえば、読み込む画像URLを取得するためにネットワークリクエストを実行する必要があるとします。

まず、フェッチャーのみが処理するカスタムデータ型を作成します。

```kotlin
data class PartialUrl(
    val baseUrl: String,
)
```

次に、画像URLを取得し、内部のネットワークフェッチャーに委譲するカスタム`Fetcher`を作成します。

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

        // 画像URLを読み取る
        val imageUrl: String = readImageUrl(response.body)

        // 内部のネットワークフェッチャーに委譲する
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

最後に、`ComponentRegistry`に`Fetcher`を登録し、`model`/`data`として`PartialUrl`を渡すだけです。

```kotlin
AsyncImage(
    model = PartialUrl("https://example.com/image.jpg"),
    contentDescription = null,
)
```

このパターンは、`Mapper`、`Keyer`、`Decoder`にも同様に適用できます。