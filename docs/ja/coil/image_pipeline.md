# 画像パイプラインの拡張

Androidは標準で多くの[画像フォーマット](https://developer.android.com/guide/topics/media/media-formats#image-formats)をサポートしていますが、サポートしていないフォーマットも数多く存在します（例: GIF、SVG、MP4など）。

幸いなことに、[ImageLoader](image_loaders.md)はプラグ可能なコンポーネントをサポートしており、新しいキャッシュ層、新しいデータ型、新しいフェッチ動作、新しい画像エンコーディングの追加や、ベースとなる画像読み込み動作の上書きが可能です。Coilの画像パイプラインは、主に次の順序で実行される5つの部分で構成されています: [Interceptors](/coil/api/coil-core/coil3.intercept/-interceptor)、[Mappers](/coil/api/coil-core/coil3.map/-mapper)、[Keyers](/coil/api/coil-core/coil3.key/-keyer)、[Fetchers](/coil/api/coil-core/coil3.fetch/-fetcher)、[Decoders](/coil/api/coil-core/coil3.decode/-decoder)。

カスタムコンポーネントは、`ImageLoader`を構築する際に[ComponentRegistry](/coil/api/coil-core/coil3/-component-registry)を通じて追加する必要があります。

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

## Interceptor {id="interceptors"}

Interceptorを使用すると、`ImageLoader`の画像エンジンへのリクエストを監視（observe）、変換（transform）、ショートサーキット（short circuit）、または再試行（retry）できます。例えば、次のようにカスタムキャッシュ層を追加できます。

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

Interceptorは、`ImageLoader`の画像パイプラインをカスタムロジックでラップできる高度な機能です。その設計は[OkHttpの`Interceptor`インターフェース](https://lysine.dev/okhttp/interceptors/#interceptors)に大きく基づいています。

詳細については、[Interceptor](/coil/api/coil-core/coil3.intercept/-interceptor)を参照してください。

## Mapper {id="mappers"}

Mapperを使用すると、カスタムデータ型のサポートを追加できます。例えば、サーバーから次のようなモデルを取得するとします。

```kotlin
data class Item(
    val id: Int,
    val imageUrl: String,
    val price: Int,
    val weight: Double
)
```

パイプラインの後続で処理されるように、モデルをURLへとマッピングするカスタムMapperを作成できます。

```kotlin
class ItemMapper : Mapper<Item, String> {
    override fun map(data: Item, options: Options) = data.imageUrl
}
```

`ImageLoader`の構築時にこれを登録（上記参照）した後は、安全に`Item`を読み込むことができます。

```kotlin
val request = ImageRequest.Builder(context)
    .data(item)
    .target(imageView)
    .build()
imageLoader.enqueue(request)
```

詳細については、[Mapper](/coil/api/coil-core/coil3.map/-mapper)を参照してください。

## Keyer {id="keyers"}

Keyerはデータをキャッシュキーの一部に変換します。この値は、リクエストの出力結果が`MemoryCache`に書き込まれる際に`MemoryCache.Key.key`として使用されます。

詳細については、[Keyers](/coil/api/coil-core/coil3.key/-keyer)を参照してください。

## Fetcher {id="fetchers"}

Fetcherはデータ（例: URL、URI、Fileなど）を`ImageSource`または`Image`のいずれかに変換します。通常、入力データを`Decoder`で処理可能なフォーマットへと変換します。このインターフェースを使用して、カスタムのフェッチメカニズム（例: Cronet、カスタムURIスキームなど）のサポートを追加します。

詳細については、[Fetcher](/coil/api/coil-core/coil3.fetch/-fetcher)を参照してください。

!!! Note
    カスタムデータ型を使用する`Fetcher`を追加する場合、それを使用するリクエストの結果がメモリキャッシュ可能であることを保証するために、カスタム`Keyer`も提供する必要があります。例えば、`Fetcher.Factory<MyDataType>`を追加する場合、`Keyer<MyDataType>`も追加する必要があります。

## Decoder {id="decoders"}

Decoderは`ImageSource`を読み込み、`Image`を返します。このインターフェースを使用して、カスタムファイルフォーマット（例: GIF、SVG、TIFFなど）のサポートを追加します。

詳細については、[Decoder](/coil/api/coil-core/coil3.decode/-decoder)を参照してください。

## ImageLoaderとImageRequestのカスタムプロパティ {id="custom-imageloader-and-imagerequest-properties"}

Coilは、`Extras`を介して`ImageRequest`や`ImageLoader`にカスタムデータを付加することをサポートしています。`Extras`は、`Extras.Key`を介して参照される追加プロパティのマップです。

例えば、各`ImageRequest`でカスタムタイムアウトをサポートしたいとします。次のように拡張関数を追加できます。

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

// 注意: Extras.Keyインスタンスは参照等価性で比較されるため、静的（static）に宣言する必要があります。
private val timeoutKey = Extras.Key(default = Duration.INFINITE)
```

次に、`ImageLoader`に登録するカスタム`Interceptor`内でそのプロパティを読み取ることができます。

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

最後に、`ImageRequest`を作成する際にそのプロパティを設定できます。

```kotlin
AsyncImage(
    model = ImageRequest.Builder(LocalPlatformContext.current)
        .data("https://example.com/image.jpg")
        .timeout(10.seconds)
        .build(),
    contentDescription = null,
)
```

補足:

- 定義した`ImageLoader.Builder.timeout`拡張関数を介して、デフォルトのタイムアウト値を設定できます。
- 定義した`Options.timeout`拡張関数を介して、`Mapper`、`Fetcher`、`Decoder`の内部でタイムアウト値を読み取ることができます。

[Coil自体もこのパターンを使用して](https://github.com/coil-kt/coil/blob/main/coil-gif/src/main/java/coil3/gif/imageRequests.kt)、`coil-gif`でのGIF用のカスタムリクエストプロパティや、その他の拡張ライブラリをサポートしています。

## コンポーネントの連鎖（Chaining） {id="chaining-components"}

Coilの画像ローダーコンポーネントの便利な特徴として、内部で連鎖（チェーン）させることができる点が挙げられます。例えば、読み込む画像URLを取得するためにネットワークリクエストを実行する必要があるケースを考えます。

まず、作成するFetcherのみが処理するカスタムデータ型を作成します。

```kotlin
data class PartialUrl(
    val baseUrl: String,
)
```

次に、画像URLを取得して内部のネットワークFetcherに委譲するカスタム`Fetcher`を作成します。

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

        // 内部のネットワークFetcherに処理を委譲する。
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

最後に、`ComponentRegistry`にその`Fetcher`を登録し、`model`/`data`として`PartialUrl`を渡すだけです。

```kotlin
AsyncImage(
    model = PartialUrl("https://example.com/image.jpg"),
    contentDescription = null,
)
```

このパターンは、`Mapper`、`Keyer`、`Decoder`にも同様に適用できます。