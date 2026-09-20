# 開始使用

## Compose UI {id="compose-ui"}

一個典型的 Compose UI 專案會需要匯入：

```kotlin
implementation("io.coil-kt.coil3:coil-compose:3.6.3")
implementation("io.coil-kt.coil3:coil-network-okhttp:3.6.3")
```

匯入之後，您可以使用 `AsyncImage` 從網路載入圖片：

```kotlin
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
)
```

!!! Note
    如果您使用 Compose 多平台，則需要使用 Ktor 而非 OkHttp。請參閱[此處](network.md#ktor-network-engines)了解具體做法。

## Android Views {id="android-views"}

如果您使用 Android Views 而非 Compose UI，請匯入：

```kotlin
implementation("io.coil-kt.coil3:coil:3.6.3")
implementation("io.coil-kt.coil3:coil-network-okhttp:3.6.3")
```

匯入之後，您可以使用 `ImageView.load` 擴充函式從網路載入圖片：

```kotlin
imageView.load("https://example.com/image.jpg")
```

## 配置單例 ImageLoader {id="configuring-the-singleton-imageloader"}

預設情況下，Coil 包含一個單例 `ImageLoader`。`ImageLoader` 透過擷取、解碼、快取並傳回結果來執行傳入的 `ImageRequest`。您不需要配置 `ImageLoader`；如果您沒有配置，Coil 會使用預設配置建立單例 `ImageLoader`。

您可以透過多種方式進行配置（**僅選擇一種**）：

- 在應用程式的入口點（應用程式的根 `@Composable`）附近呼叫 `setSingletonImageLoaderFactory`。**這最適合 Compose 多平台應用程式。**

```kotlin
setSingletonImageLoaderFactory { context ->
    ImageLoader.Builder(context)
        .crossfade(true)
        .build()
}
```

- 在 Android 的 [`Application`](https://developer.android.com/reference/android/app/Application) 中實作 `SingletonImageLoader.Factory`。**這最適合 Android 應用程式。**

```kotlin
class CustomApplication : Application(), SingletonImageLoader.Factory {
    override fun newImageLoader(context: Context): ImageLoader {
        return ImageLoader.Builder(context)
            .crossfade(true)
            .build()
    }
}
```

- 在應用程式入口點（例如 Android 的 `Application.onCreate`）附近呼叫 `SingletonImageLoader.setSafe`。這是最靈活的方式。

```kotlin
SingletonImageLoader.setSafe { context ->
    ImageLoader.Builder(context)
        .crossfade(true)
        .build()
}
```

!!! Note
    如果您正在編寫依賴於 Coil 的程式庫，則**不應**取得或設定單例 `ImageLoader`。相反地，您應該依賴 `io.coil-kt.coil3:coil-core`，建立您自己的 `ImageLoader` 並手動傳遞。如果您在程式庫中設定了單例 `ImageLoader`，若使用您程式庫的應用程式也使用了 Coil，您可能會覆寫該應用程式設定的 `ImageLoader`。

## 圖片 {id="images"}

為了支援多平台渲染，Coil 3.x 使用自訂的 `coil3.Image` 類別。它取代了 Android 的 `Drawable`，但與其完全互通：

```kotlin
val drawable = image.asDrawable(resources)
val image = drawable.asImage()
```

Coil 還定義了 `coil3.Bitmap` 類別，它是 Android 上 `android.graphics.Bitmap` 或非 Android 平台上 `org.jetbrains.skia.Bitmap` 的型別別名：

```kotlin
val bitmap = image.toBitmap()
val image = bitmap.asImage()
```

它也與 Compose UI 的 `Painter` 類別互通。此擴充函式需要匯入 `coil-compose-core` 構件：

```kotlin
val painter = image.asPainter()
```

!!! Note
    `Painter` 無法轉換為 `Image`，因為 Painter 只能在組合 (composition) 內進行渲染，而 `Image` 必須能夠在任何 `Canvas` 上渲染。

## 構件 {id="artifacts"}

以下是 Coil 發佈到 `mavenCentral()` 的主要構件列表：

* `io.coil-kt.coil3:coil`：預設構件，依賴於 `io.coil-kt.coil3:coil-core`。包含單例 `ImageLoader` 和相關擴充函式。
* `io.coil-kt.coil3:coil-core`：`io.coil-kt.coil3:coil` 的子集，**不包含**單例 `ImageLoader` 和相關擴充函式。
* `io.coil-kt.coil3:coil-compose`：預設的 [Compose UI](https://www.jetbrains.com/compose-multiplatform/) 構件，依賴於 `io.coil-kt.coil3:coil` 和 `io.coil-kt.coil3:coil-compose-core`。包含使用單例 `ImageLoader` 的 `AsyncImage`、`rememberAsyncImagePainter` 和 `SubcomposeAsyncImage` 的多載。
* `io.coil-kt.coil3:coil-compose-core`：`io.coil-kt.coil3:coil-compose` 的子集，不包含依賴單例 `ImageLoader` 的函式。
* `io.coil-kt.coil3:coil-network-okhttp`：包含支援使用 [OkHttp](https://github.com/square/okhttp) 從網路擷取圖片的功能。
* `io.coil-kt.coil3:coil-network-ktor2`：包含支援使用 [Ktor 2](https://github.com/ktorio/ktor) 從網路擷取圖片的功能。
* `io.coil-kt.coil3:coil-network-ktor3`：包含支援使用 [Ktor 3](https://github.com/ktorio/ktor) 從網路擷取圖片的功能。
* `io.coil-kt.coil3:coil-network-cache-control`：包含支援在從網路擷取圖片時遵循 [`Cache-Control` 標頭](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) 的功能。
* `io.coil-kt.coil3:coil-gif`：包含兩個[解碼器](/coil/api/coil-core/coil3.decode/-decoder)以支援解碼 GIF。詳情請參閱 [GIFs](gifs.md)。
* `io.coil-kt.coil3:coil-svg`：包含一個[解碼器](/coil/api/coil-core/coil3.decode/-decoder)以支援解碼 SVG。詳情請參閱 [SVGs](svgs.md)。
* `io.coil-kt.coil3:coil-video`：包含一個[解碼器](/coil/api/coil-core/coil3.decode/-decoder)以支援從 [Android 支援的任何影片格式](https://developer.android.com/guide/topics/media/media-formats#video-codecs) 中解碼影格。詳情請參閱 [videos](videos.md)。
* `io.coil-kt.coil3:coil-test`：包含支援測試的類別。詳情請參閱[測試](testing.md)。
* `io.coil-kt.coil3:coil-bom`：包含 [BOM (物料清單)](https://docs.gradle.org/7.2/userguide/platforms.html#sub:bom_import)。匯入 `coil-bom` 讓您可以在不指定版本的情況下依賴其他 Coil 構件。