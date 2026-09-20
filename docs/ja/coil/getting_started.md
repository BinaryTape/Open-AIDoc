# はじめに

## Compose UI {id="compose-ui"}

一般的なCompose UIプロジェクトでは、以下をインポートします：

```kotlin
implementation("io.coil-kt.coil3:coil-compose:3.6.3")
implementation("io.coil-kt.coil3:coil-network-okhttp:3.6.3")
```

これらをインポートすると、`AsyncImage`を使用してネットワークから画像を読み込むことができます：

```kotlin
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
)
```

!!! Note
    Compose Multiplatformを使用している場合は、OkHttpの代わりにKtorを使用する必要があります。その方法については、[こちら](network.md#ktor-network-engines)を参照してください。

## Android View {id="android-views"}

Compose UIの代わりにAndroid Viewを使用する場合は、以下をインポートします：

```kotlin
implementation("io.coil-kt.coil3:coil:3.6.3")
implementation("io.coil-kt.coil3:coil-network-okhttp:3.6.3")
```

これらをインポートすると、`ImageView.load`拡張関数を使用してネットワークから画像を読み込むことができます：

```kotlin
imageView.load("https://example.com/image.jpg")
```

## シングルトン ImageLoader の設定 {id="configuring-the-singleton-imageloader"}

デフォルトでは、Coilにはシングルトンの`ImageLoader`が含まれています。`ImageLoader`は、フェッチ、デコード、キャッシュ、および結果の返却を行うことで、入力された`ImageRequest`を実行します。`ImageLoader`を設定する必要はありません。設定しない場合、Coilはデフォルト設定でシングルトンの`ImageLoader`を作成します。

いくつかの方法で設定できます（**1つだけ選択してください**）：

- アプリのエントリポイント（アプリのルート`@Composable`）付近で`setSingletonImageLoaderFactory`を呼び出します。**これはCompose Multiplatformアプリに最適です。**

```kotlin
setSingletonImageLoaderFactory { context ->
    ImageLoader.Builder(context)
        .crossfade(true)
        .build()
}
```

- Androidの[`Application`](https://developer.android.com/reference/android/app/Application)で`SingletonImageLoader.Factory`を実装します。**これはAndroidアプリに最適です。**

```kotlin
class CustomApplication : Application(), SingletonImageLoader.Factory {
    override fun newImageLoader(context: Context): ImageLoader {
        return ImageLoader.Builder(context)
            .crossfade(true)
            .build()
    }
}
```

- アプリのエントリポイント（Androidの`Application.onCreate`など）付近で`SingletonImageLoader.setSafe`を呼び出します。これが最も柔軟な方法です。

```kotlin
SingletonImageLoader.setSafe { context ->
    ImageLoader.Builder(context)
        .crossfade(true)
        .build()
}
```

!!! Note
    Coilに依存するライブラリを作成している場合は、シングルトンの`ImageLoader`を取得または設定すべきではありません。代わりに、`io.coil-kt.coil3:coil-core`に依存させ、独自の`ImageLoader`を作成して手動で受け渡しを行う必要があります。ライブラリ内でシングルトンの`ImageLoader`を設定すると、そのライブラリを使用するアプリ側でもCoilを使用している場合、アプリ側で設定された`ImageLoader`を上書きしてしまう可能性があります。

## 画像 {id="images"}

マルチプラットフォームのレンダリングをサポートするため、Coil 3.xではカスタムの`coil3.Image`クラスを使用します。これはAndroidの`Drawable`を置き換えるものですが、完全に相互運用可能です：

```kotlin
val drawable = image.asDrawable(resources)
val image = drawable.asImage()
```

また、Coilは`coil3.Bitmap`クラスも定義しています。これは、Androidでは`android.graphics.Bitmap`の、非Androidプラットフォームでは`org.jetbrains.skia.Bitmap`の型エイリアス（type alias）です：

```kotlin
val bitmap = image.toBitmap()
val image = bitmap.asImage()
```

Compose UIの`Painter`クラスとも相互運用可能です。この拡張関数を使用するには、`coil-compose-core`アーティファクトをインポートする必要があります：

```kotlin
val painter = image.asPainter()
```

!!! Note
    `Painter`は`Image`に変換することはできません。これは、`Painter`はコンポジション（composition）内でのみレンダリング可能であるのに対し、`Image`は任意の`Canvas`でレンダリング可能である必要があるためです。

## アーティファクト {id="artifacts"}

Coilが`mavenCentral()`に公開している主なアーティファクトの一覧です：

* `io.coil-kt.coil3:coil`: `io.coil-kt.coil3:coil-core`に依存するデフォルトのアーティファクトです。シングルトンの`ImageLoader`と関連する拡張関数が含まれています。
* `io.coil-kt.coil3:coil-core`: シングルトンの`ImageLoader`および関連する拡張関数を**含まない**、`io.coil-kt.coil3:coil`のサブセットです。
* `io.coil-kt.coil3:coil-compose`: デフォルトの[Compose UI](https://www.jetbrains.com/compose-multiplatform/)アーティファクトで、`io.coil-kt.coil3:coil`および`io.coil-kt.coil3:coil-compose-core`に依存します。シングルトンの`ImageLoader`を使用する`AsyncImage`、`rememberAsyncImagePainter`、および`SubcomposeAsyncImage`のオーバーロードが含まれています。
* `io.coil-kt.coil3:coil-compose-core`: シングルトンの`ImageLoader`に依存する関数を含まない、`io.coil-kt.coil3:coil-compose`のサブセットです。
* `io.coil-kt.coil3:coil-network-okhttp`: [OkHttp](https://github.com/square/okhttp)を使用してネットワークから画像をフェッチするサポートが含まれています。
* `io.coil-kt.coil3:coil-network-ktor2`: [Ktor 2](https://github.com/ktorio/ktor)を使用してネットワークから画像をフェッチするサポートが含まれています。
* `io.coil-kt.coil3:coil-network-ktor3`: [Ktor 3](https://github.com/ktorio/ktor)を使用してネットワークから画像をフェッチするサポートが含まれています。
* `io.coil-kt.coil3:coil-network-cache-control`: ネットワークから画像をフェッチする際に、[`Cache-Control`ヘッダー](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)を尊重するサポートが含まれています。
* `io.coil-kt.coil3:coil-gif`: GIFのデコードをサポートする2つの[デコーダー](/coil/api/coil-core/coil3.decode/-decoder)が含まれています。詳細は[GIF](gifs.md)を参照してください。
* `io.coil-kt.coil3:coil-svg`: SVGのデコードをサポートする[デコーダー](/coil/api/coil-core/coil3.decode/-decoder)が含まれています。詳細は[SVG](svgs.md)を参照してください。
* `io.coil-kt.coil3:coil-video`: [Androidがサポートするすべてのビデオフォーマット](https://developer.android.com/guide/topics/media/media-formats#video-codecs)のフレームのデコードをサポートする[デコーダー](/coil/api/coil-core/coil3.decode/-decoder)が含まれています。詳細は[ビデオ](videos.md)を参照してください。
* `io.coil-kt.coil3:coil-test`: テストをサポートするクラスが含まれています。詳細は[テスト](testing.md)を参照してください。
* `io.coil-kt.coil3:coil-bom`: [BOM（Bill of Materials）](https://docs.gradle.org/7.2/userguide/platforms.html#sub:bom_import)が含まれています。`coil-bom`をインポートすることで、バージョンを指定せずに他のCoilアーティファクトに依存できるようになります。