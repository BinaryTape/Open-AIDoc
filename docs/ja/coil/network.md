# ネットワーク画像 (Network Images)

デフォルトでは、Coil 3.x にはネットワークから画像を読み込むためのサポートが含まれていません。これは、独自のネットワーキングソリューションを使用したいユーザーや、ネットワーク URL のサポートを必要としない（例: ディスクからのみ画像を読み込む）ユーザーに対して、肥大化したネットワーク依存関係を強制することを避けるためです。

ネットワークから画像を取得するためのサポートを追加するには、**以下のうちいずれか1つのみ**をインポートしてください:

```kotlin
implementation("io.coil-kt.coil3:coil-network-okhttp:3.6.3") // Android/JVM でのみ利用可能。
implementation("io.coil-kt.coil3:coil-network-ktor2:3.6.3")
implementation("io.coil-kt.coil3:coil-network-ktor3:3.6.3")
```

OkHttp を使用している場合は、これだけで完了です。インポートすると、`https://example.com/image.jpg` のようなネットワーク URL が自動的にサポートされます。Ktor を使用している場合は、各プラットフォームに対応するエンジンを追加する必要があります（下記参照）。

## Ktor ネットワークエンジン {id="ktor-network-engines"}

`coil-network-ktor2` または `coil-network-ktor3` に依存している場合は、（JavaScript を除く）各プラットフォーム向けの [Ktor エンジン](https://ktor.io/docs/client-engines.html) をインポートする必要があります。以下はクイックスタート用のエンジンセットです:

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

カスタムのネットワーキングライブラリを使用したい場合は、`io.coil-kt.coil3:coil-network-core` をインポートし、`NetworkClient` を実装した上で、そのカスタム `NetworkClient` を持つ `NetworkFetcher` を `ImageLoader` に登録できます。

## カスタム OkHttpClient の使用 {id="using-a-custom-okhttpclient"}

`io.coil-kt.coil3:coil-network-okhttp` を使用している場合、`ImageLoader` の作成時にカスタムの `OkHttpClient` を指定できます:

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
    すでにビルド済みの `OkHttpClient` がある場合は、[`newBuilder()`](https://lysine.dev/okhttp/5.x/okhttp/okhttp3/-ok-http-client/#customize-your-client-with-newbuilder) を使用して元のクライアントとリソースを共有する新しいクライアントをビルドしてください。

## Cache-Control のサポート {id="cache-control-support"}

デフォルトでは、Coil 3.x は `Cache-Control` ヘッダーを考慮せず、常にレスポンスをディスクキャッシュに保存します。

`io.coil-kt.coil3:coil-network-cache-control` には、`NetworkFetcher` がネットワークレスポンスの [`Cache-Control` ヘッダー](https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Cache-Control) を確実に考慮するようにする `CacheStrategy` の実装が含まれています。

`CacheControlCacheStrategy` を `NetworkFetcher` に渡し、そのカスタム `NetworkFetcher` を `ImageLoader` に登録します:

```kotlin
OkHttpNetworkFetcherFactory(
    cacheStrategy = { CacheControlCacheStrategy() },
)
```

!!! Note
    Android API レベル 25 以下をサポートするには、`coreLibraryDesugaring` を有効にする必要があります。有効にする手順については、[こちら](https://developer.android.com/studio/write/java8-support#library-desugaring)のドキュメントを参照してください。

#### ヘッダー (Headers) {id="headers"}

画像リクエストにヘッダーを追加するには、2つの方法のいずれかを使用できます。単一のリクエストに対してヘッダーを設定できます:

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

または、`ImageLoader` によって実行されるすべてのリクエストに対してヘッダーを設定する OkHttp の [`Interceptor`](https://lysine.dev/okhttp/interceptors/) を作成することもできます:

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
                        // このヘッダーはすべての画像リクエストに追加されます。
                        .addNetworkInterceptor(RequestHeaderInterceptor("Cache-Control", "no-cache"))
                        .build()
                },
            )
        )
    }
    .build()
```