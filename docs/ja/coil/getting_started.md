# はじめに

## Compose UI {id="compose-ui"}

一般的な Compose UI プロジェクトでは、以下をインポートします:

```kotlin
implementation("io.coil-kt.coil3:coil-compose:3.6.3")
implementation("io.coil-kt.coil3:coil-network-okhttp:3.6.3")
```

インポート後、`AsyncImage` を使用してネットワークから画像を読み込むことができます:

```kotlin
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
)
```

!!! Note
    OkHttp は Android とデスクトップ JVM をサポートしています。iOS や Web も対象とする共通ネットワークコードについては、[Ktor network engines](network.md#ktor-network-engines) を参照してください。

## Android Views {id="android-views"}

Compose UI の代わりに Android View を使用する場合は、以下をインポートします:

```kotlin
implementation("io.coil-kt.coil3:coil:3.6.3")
implementation("io.coil-kt.coil3:coil-network-okhttp:3.6.3")
```

インポート後、`ImageView.load` 拡張関数を使用してネットワークから画像を読み込むことができます:

```kotlin
imageView.load("https://example.com/image.jpg")
```

## シングルトン ImageLoader の設定 {id="configuring-the-singleton-imageloader"}

デフォルトで、Coil はシングルトンの `ImageLoader` を含んでいます。`ImageLoader` は、フェッチ、デコード、キャッシュを行い、結果を返すことで受信した `ImageRequest` を実行します。`ImageLoader` を設定する必要はありません。設定しない場合、Coil はデフォルト設定のシングルトン `ImageLoader` を作成します。

設定する方法はいくつかあります（**いずれか1つのみを選択してください**）:

- アプリのエントリーポイント付近（アプリのルート `@Composable`）で `setSingletonImageLoaderFactory` を呼び出します。**これは Compose Multiplatform アプリに最適です。**

```kotlin
setSingletonImageLoaderFactory { context ->
    ImageLoader.Builder(context)
        .crossfade(true)
        .build()
}
```

- Android の [`Application`](https://developer.android.com/reference/android/app/Application) で `SingletonImageLoader.Factory` を実装します。**これは Android アプリに最適です。**

```kotlin
class CustomApplication : Application(), SingletonImageLoader.Factory {
    override fun newImageLoader(context: Context): ImageLoader {
        return ImageLoader.Builder(context)
            .crossfade(true)
            .build()
    }
}
```

- アプリのエントリーポイント付近（例: Android の `Application.onCreate`）で `SingletonImageLoader.setSafe` を呼び出します。これが最も柔軟な方法です。

```kotlin
SingletonImageLoader.setSafe { context ->
    ImageLoader.Builder(context)
        .crossfade(true)
        .build()
}
```

!!! Note
    Coil に依存するライブラリを作成している場合は、シングルトンの `ImageLoader` を取得/設定すべきでは**ありません**。代わりに、`io.coil-kt.coil3:coil-core` に依存し、独自の `ImageLoader` を作成して手動で渡す必要があります。ライブラリ内でシングルトンの `ImageLoader` を設定すると、ライブラリを使用しているアプリが Coil も使用している場合に、そのアプリによって設定された `ImageLoader` を上書きしてしまう可能性があります。

## 画像 {id="images"}

マルチプラットフォームのレンダリングをサポートするため、Coil 3.x ではカスタムの `coil3.Image` クラスを使用します。これは Android の `Drawable` を置き換えるものですが、完全に相互運用可能です:

```kotlin
val drawable = image.asDrawable(resources)
val image = drawable.asImage()
```

また、Coil は `coil3.Bitmap` クラスを定義しています。これは Android では `android.graphics.Bitmap`、Android 以外のプラットフォームでは `org.jetbrains.skia.Bitmap` の型エイリアスです:

```kotlin
val bitmap = image.toBitmap()
val image = bitmap.asImage()
```

Compose UI の `Painter` クラスとも相互運用可能です。この拡張関数を使用するには `coil-compose-core` アーティファクトをインポートする必要があります:

```kotlin
val painter = image.asPainter(LocalPlatformContext.current)
```

!!! Note
    `Painter` はコンポジション内でのみレンダリングできるのに対し、`Image` は任意の `Canvas` 上でレンダリングできる必要があるため、`Painter` を `Image` に変換することはできません。

## アーティファクト {id="artifacts"}

Coil が `mavenCentral()` に公開している主なアーティファクトのリストは以下のとおりです:

* `io.coil-kt.coil3:coil`: `io.coil-kt.coil3:coil-core` に依存するデフォルトのアーティファクト。シングルトンの `ImageLoader` および関連する拡張関数を含みます。
* `io.coil-kt.coil3:coil-core`: シングルトンの `ImageLoader` および関連する拡張関数を**含まない**、`io.coil-kt.coil3:coil` のサブセット。
* `io.coil-kt.coil3:coil-compose`: `io.coil-kt.coil3:coil` と `io.coil-kt.coil3:coil-compose-core` に依存するデフォルトの [Compose UI](https://www.jetbrains.com/compose-multiplatform/) アーティファクト。シングルトンの `ImageLoader` を使用する `AsyncImage`、`rememberAsyncImagePainter`、`SubcomposeAsyncImage` のオーバーロードを含みます。
* `io.coil-kt.coil3:coil-compose-core`: シングルトンの `ImageLoader` に依存する関数を含まない、`io.coil-kt.coil3:coil-compose` のサブセット。
* `io.coil-kt.coil3:coil-network-okhttp`: [OkHttp](https://github.com/square/okhttp) を使用してネットワークから画像を取得するサポートを含みます。
* `io.coil-kt.coil3:coil-network-ktor2`: [Ktor 2](https://github.com/ktorio/ktor) を使用してネットワークから画像を取得するサポートを含みます。
* `io.coil-kt.coil3:coil-network-ktor3`: [Ktor 3](https://github.com/ktorio/ktor) を使用してネットワークから画像を取得するサポートを含みます。
* `io.coil-kt.coil3:coil-network-httpengine`: Android の [HttpEngine](https://developer.android.com/reference/android/net/http/HttpEngine) を使用してネットワークから画像を取得するサポートを含みます。Android API 34 以上が必要です。
* `io.coil-kt.coil3:coil-network-cache-control`: ネットワークから画像を取得する際に [`Cache-Control` ヘッダー](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) を尊重するサポートを含みます。
* `io.coil-kt.coil3:coil-gif`: GIF のデコードをサポートする2つの[デコーダー](/coil/api/coil-core/coil3.decode/-decoder)を含みます。詳細は [GIFs](gifs.md) を参照してください。
* `io.coil-kt.coil3:coil-svg`: SVG のデコードをサポートする[デコーダー](/coil/api/coil-core/coil3.decode/-decoder)を含みます。詳細は [SVGs](svgs.md) を参照してください。
* `io.coil-kt.coil3:coil-video`: [Android でサポートされている動画形式](https://developer.android.com/guide/topics/media/media-formats#video-codecs)からフレームをデコードするための[デコーダー](/coil/api/coil-core/coil3.decode/-decoder)を含みます。詳細は [videos](videos.md) を参照してください。
* `io.coil-kt.coil3:coil-test`: テストをサポートするクラスを含みます。詳細は [testing](testing.md) を参照してください。
* `io.coil-kt.coil3:coil-bom`: [Bill of Materials](https://docs.gradle.org/7.2/userguide/platforms.html#sub:bom_import)（BOM）を含みます。`coil-bom` をインポートすることで、バージョンを指定せずに他の Coil アーティファクトに依存できるようになります。