# ネットワーク画像

デフォルトでは、Coil 3.x はネットワークからの画像読み込みをサポートしていません。これは、独自のネットワーク・ソリューションを使用したいユーザーや、ネットワーク URL のサポートを必要としない（例：ディスクからの画像読み込みのみを行う）ユーザーに対して、大きなネットワーク依存関係を強制することを避けるためです。

ネットワークからの画像取得サポートを追加するには、**以下のうちいずれか1つのみ**をインポートしてください：

```kotlin
implementation("io.coil-kt.coil3:coil-network-okhttp:3.6.3") // Android/JVM でのみ利用可能。
implementation("io.coil-kt.coil3:coil-network-ktor2:3.6.3")
implementation("io.coil-kt.coil3:coil-network-ktor3:3.6.3")
```

OkHttp を使用する場合、設定は以上です。インポートすると、`https://example.com/image.jpg` のようなネットワーク URL が自動的にサポートされます。Ktor を使用する場合は、各プラットフォームに対応したエンジンを追加する必要があります（以下を参照）。

## Ktor ネットワークエンジン {id="ktor-network-engines"}

`coil-network-ktor2` または `coil-network-ktor3` に依存している場合は、プラットフォーム（Javascript を除く）ごとに [Ktor エンジン](https://ktor.io/docs/client-engines.html)をインポートする必要があります。以下はクイックスタート用のエンジンセットです：

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

カスタムのネットワーク・ライブラリを使用したい場合は、`io.coil-kt.coil3:coil-network-core` をインポートし、`NetworkClient` を実装し、`ImageLoader` でカスタム `NetworkClient` を使用して `NetworkFetcher` を登録してください。

## カスタム OkHttpClient の使用 {id="using-a-custom-okhttpclient"}

`io.coil-kt.coil3:coil-network-okhttp` を使用する場合、`ImageLoader` の作成時にカスタム `OkHttpClient` を指定できます：

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
    すでに構築済みの `OkHttpClient` がある場合は、[`newBuilder()`](https://square.github.io/okhttp/5.x/okhttp/okhttp3/-ok-http-client/#customize-your-client-with-newbuilder) を使用して、元のクライアントとリソースを共有する新しいクライアントを構築してください。

## Cache-Control のサポート {id="cache-control-support"}

デフォルトでは、Coil 3.x は `Cache-Control` ヘッダーを考慮せず、常に応答をディスクキャッシュに保存します。

`io.coil-kt.coil3:coil-network-cache-control` には、`NetworkFetcher` がネットワークレスポンスの [`Cache-Control` ヘッダー](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)を確実に尊重するようにする `CacheStrategy` 実装が含まれています。

`CacheControlCacheStrategy` を `NetworkFetcher` に渡し、そのカスタム `NetworkFetcher` を `ImageLoader` に登録します：

```kotlin
OkHttpNetworkFetcherFactory(
    cacheStrategy = { CacheControlCacheStrategy() },
)
```

!!! Note
    Android API レベル 25 以下をサポートするには、`coreLibraryDesugaring` を有効にする必要があります。[こちら](https://developer.android.com/studio/write/java8-support#library-desugaring)のドキュメントに従って有効にしてください。

#### ヘッダー {id="headers"}

画像リクエストへのヘッダーの追加は、2 つの方法のいずれかで行うことができます。単一のリクエストに対してヘッダーを設定できます：

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

または、`ImageLoader` によって実行されるすべてのリクエストに対してヘッダーを設定する OkHttp [`Interceptor`](https://square.github.io/okhttp/interceptors/) を作成することもできます：

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