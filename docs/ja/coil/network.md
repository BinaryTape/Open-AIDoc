# ネットワーク画像

デフォルトでは、Coil 3.x にはネットワークから画像を読み込むためのサポートが含まれていません。これは、独自のネットワーキングソリューションを使用したいユーザーや、ネットワーク URL のサポートを必要としないユーザー（例: ディスクからのみ画像を読み込む場合）に対して、大きなネットワーク依存関係を強制することを避けるためです。

ネットワークから画像を取得するためのサポートを追加するには、**次のいずれか1つのみ**をインポートします：

```kotlin
implementation("io.coil-kt.coil3:coil-network-okhttp:3.6.3") // Android/JVM でのみ利用可能。
implementation("io.coil-kt.coil3:coil-network-ktor2:3.6.3")
implementation("io.coil-kt.coil3:coil-network-ktor3:3.6.3")
implementation("io.coil-kt.coil3:coil-network-httpengine:3.6.3") // Android API 34 以降でのみ利用可能。
```

OkHttp または HttpEngine を使用する場合、設定はこれだけです。インポートすると、`https://example.com/image.jpg` のようなネットワーク URL が自動的にサポートされます。Ktor を使用する場合は、各プラットフォームに対応するエンジンを追加する必要があります（下記参照）。

## Ktor ネットワークエンジン {id="ktor-network-engines"}

`coil-network-ktor2` または `coil-network-ktor3` に依存している場合は、プラットフォームごと（JavaScript を除く）に [Ktor エンジン](https://ktor.io/docs/client-engines.html) をインポートする必要があります。以下はクイックスタート用のエンジン設定例です：

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

カスタムのネットワークライブラリを使用したい場合は、`io.coil-kt.coil3:coil-network-core` をインポートし、`NetworkClient` を実装した上で、カスタムの `NetworkClient` を使用した `NetworkFetcher` を `ImageLoader` に登録できます。

## カスタム OkHttpClient の使用 {id="using-a-custom-okhttpclient"}

`io.coil-kt.coil3:coil-network-okhttp` を使用している場合、`ImageLoader` の作成時にカスタムの `OkHttpClient` を指定できます：

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
    すでにビルド済みの `OkHttpClient` がある場合は、[`newBuilder()`](https://lysine.dev/okhttp/5.x/okhttp/okhttp3/-ok-http-client/#customize-your-client-with-newbuilder) を使用して、元のクライアントとリソースを共有する新しいクライアントをビルドしてください。

## ImageLoader での HttpEngine の使用 {id="using-httpengine-with-an-imageloader"}

Android API 34 以降で `HttpEngine` を使用するには、`coil-network-httpengine` を追加し、そのフェッチャーを `ImageLoader` に登録します：

```kotlin
import android.os.Build.VERSION.SDK_INT
import coil3.ImageLoader
import coil3.network.httpengine.HttpEngineNetworkFetcherFactory

val imageLoader = ImageLoader.Builder(context)
    .components {
        if (SDK_INT >= 34) {
            add(HttpEngineNetworkFetcherFactory())
        }
    }
    .build()
```

ネットワークフェッチャーを手動で登録しない場合、Coil のサービスローダーは、OkHttp、Ktor 3、Ktor 2、HttpEngine の順で使用可能な最初のネットワーククライアントを選択します。

## Cache-Control のサポート {id="cache-control-support"}

デフォルトでは、Coil 3.x は `Cache-Control` ヘッダーを考慮せず、レスポンスを常にディスクキャッシュに保存します。

`io.coil-kt.coil3:coil-network-cache-control` には、`NetworkFetcher` がネットワークレスポンスの [`Cache-Control` ヘッダー](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) を確実に考慮するようにする `CacheStrategy` の実装が含まれています。

`CacheControlCacheStrategy` を `NetworkFetcher` に渡し、そのカスタム `NetworkFetcher` を `ImageLoader` に登録します：

```kotlin
OkHttpNetworkFetcherFactory(
    cacheStrategy = { CacheControlCacheStrategy() },
)
```

!!! Note
    Android API レベル 25 以下をサポートするには、`coreLibraryDesugaring` を有効にする必要があります。有効にするには、[こちら](https://developer.android.com/studio/write/java8-support#library-desugaring)のドキュメントに従ってください。

#### ヘッダー {id="headers"}

画像リクエストへのヘッダーの追加は、2つの方法のいずれかで行えます。単一のリクエストに対してヘッダーを設定できます：

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

または、`ImageLoader` によって実行されるすべてのリクエストにヘッダーを設定する OkHttp の [`Interceptor`](https://lysine.dev/okhttp/interceptors/) を作成することもできます：

```kotlin
class RequestHeaderInterceptor(
    private val name: String,
    private val value: String,
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request().newBuilder()
            .header(name, value)
            .build()
        return chain.proceed(request)
    }
}

val imageLoader = ImageLoader.Builder(context)
    .components {
        add(
            OkHttpNetworkFetcherFactory(
                callFactory = {
                    OkHttpClient.Builder()
                        .addNetworkInterceptor(RequestHeaderInterceptor("Cache-Control", "no-cache"))
                        .build()
                },
            )
        )
    }
    .build()
```