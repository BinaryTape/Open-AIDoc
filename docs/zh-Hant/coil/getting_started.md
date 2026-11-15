# 快速入門

## Compose UI {id="compose-ui"}

一個典型的 Compose UI 專案通常會需要匯入：

```kotlin
implementation("io.coil-kt.coil3:coil-compose:3.6.3")
implementation("io.coil-kt.coil3:coil-network-okhttp:3.6.3")
```

匯入之後，你可以使用 `AsyncImage` 從網路載入圖片：

```kotlin
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
)
```

!!! Note
    OkHttp 支援 Android 與桌面端 JVM。若共用的網路程式碼同時以 iOS 或 Web 為目標，請參閱 [Ktor 網路引擎](network.md#ktor-network-engines)。

## Android Views {id="android-views"}

如果你使用的是 Android View 而非 Compose UI，請匯入：

```kotlin
implementation("io.coil-kt.coil3:coil:3.6.3")
implementation("io.coil-kt.coil3:coil-network-okhttp:3.6.3")
```

匯入之後，你可以使用 `ImageView.load` 擴充函式從網路載入圖片：

```kotlin
imageView.load("https://example.com/image.jpg")
```

## 設定單例 ImageLoader {id="configuring-the-singleton-imageloader"}

預設情況下，Coil 包含一個單例 `ImageLoader`。`ImageLoader` 透過擷取、解碼、快取並傳回結果來執行傳入的 `ImageRequest`。你不需要特別設定你的 `ImageLoader`；如果沒有設定，Coil 將以預設設定建立單例 `ImageLoader`。

你可以透過多種方式進行設定（**請僅選擇其中一種**）：

- 在應用程式的進入點附近（應用程式的根 `@Composable`）呼叫 `setSingletonImageLoaderFactory`。**這最適合 Compose Multiplatform 應用程式。**

```kotlin
setSingletonImageLoaderFactory { context ->
    ImageLoader.Builder(context)
        .crossfade(true)
        .build()
}
```

- 在 Android 的 [`Application`](https://developer.android.com/reference/android/app/Application) 上實作 `SingletonImageLoader.Factory`。**這最適合 Android 應用程式。**

```kotlin
class CustomApplication : Application(), SingletonImageLoader.Factory {
    override fun newImageLoader(context: Context): ImageLoader {
        return ImageLoader.Builder(context)
            .crossfade(true)
            .build()
    }
}
```

- 在應用程式的進入點附近（例如 Android 中的 `Application.onCreate`）呼叫 `SingletonImageLoader.setSafe`。這是最具彈性的方式。

```kotlin
SingletonImageLoader.setSafe { context ->
    ImageLoader.Builder(context)
        .crossfade(true)
        .build()
}
```

!!! Note
    如果你正在編寫相依於 Coil 的程式庫，請**切勿**取得/設定單例 `ImageLoader`。相反地，你應該相依於 `io.coil-kt.coil3:coil-core`，建立專屬的 `ImageLoader` 並手動傳遞。若在程式庫中設定了單例 `ImageLoader`，當使用該程式庫的應用程式也使用了 Coil 時，可能會覆蓋掉該應用程式所設定的 `ImageLoader`。

## 圖片 {id="images"}

為了支援多平台算繪，Coil 3.x 使用了自訂的 `coil3.Image` 類別。它取代了 Android 的 `Drawable`，但與其完全互通：

```kotlin
val drawable = image.asDrawable(resources)
val image = drawable.asImage()
```

Coil 也定義了一個 `coil3.Bitmap` 類別，它是 Android 上 `android.graphics.Bitmap` 或非 Android 平台上 `org.jetbrains.skia.Bitmap` 的型別別名：

```kotlin
val bitmap = image.toBitmap()
val image = bitmap.asImage()
```

它也與 Compose UI 的 `Painter` 類別互通。此擴充函式需要匯入 `coil-compose-core` 構件：

```kotlin
val painter = image.asPainter(LocalPlatformContext.current)
```

!!! Note
    `Painter` 無法轉換為 `Image`，因為 Painter 只能在 Composition 內部算繪，而 `Image` 必須能夠在任何 `Canvas` 上算繪。

## 構件 {id="artifacts"}

以下是 Coil 發佈至 `mavenCentral()` 的主要構件清單：

* `io.coil-kt.coil3:coil`：預設構件，相依於 `io.coil-kt.coil3:coil-core`。包含單例 `ImageLoader` 及相關的擴充函式。
* `io.coil-kt.coil3:coil-core`：`io.coil-kt.coil3:coil` 的子集，**不包含**單例 `ImageLoader` 及相關的擴充函式。
* `io.coil-kt.coil3:coil-compose`：預設的 [Compose UI](https://www.jetbrains.com/compose-multiplatform/) 構件，相依於 `io.coil-kt.coil3:coil` 與 `io.coil-kt.coil3:coil-compose-core`。包含使用單例 `ImageLoader` 的 `AsyncImage`、`rememberAsyncImagePainter` 與 `SubcomposeAsyncImage` 的多載。
* `io.coil-kt.coil3:coil-compose-core`：`io.coil-kt.coil3:coil-compose` 的子集，不包含相依於單例 `ImageLoader` 的函式。
* `io.coil-kt.coil3:coil-network-okhttp`：包含使用 [OkHttp](https://github.com/square/okhttp) 從網路擷取圖片的支援。
* `io.coil-kt.coil3:coil-network-ktor2`：包含使用 [Ktor 2](https://github.com/ktorio/ktor) 從網路擷取圖片的支援。
* `io.coil-kt.coil3:coil-network-ktor3`：包含使用 [Ktor 3](https://github.com/ktorio/ktor) 從網路擷取圖片的支援。
* `io.coil-kt.coil3:coil-network-httpengine`：包含使用 Android 的 [HttpEngine](https://developer.android.com/reference/android/net/http/HttpEngine) 從網路擷取圖片的支援。需要 Android API >= 34。
* `io.coil-kt.coil3:coil-network-cache-control`：包含在從網路擷取圖片時遵循 [`Cache-Control` 標頭](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) 的支援。
* `io.coil-kt.coil3:coil-gif`：包含兩個[解碼器](/coil/api/coil-core/coil3.decode/-decoder)以支援 GIF 解碼。詳情請參閱 [GIF](gifs.md)。
* `io.coil-kt.coil3:coil-svg`：包含一個[解碼器](/coil/api/coil-core/coil3.decode/-decoder)以支援 SVG 解碼。詳情請參閱 [SVG](svgs.md)。
* `io.coil-kt.coil3:coil-video`：包含一個[解碼器](/coil/api/coil-core/coil3.decode/-decoder)以支援從[任何 Android 支援的影片格式](https://developer.android.com/guide/topics/media/media-formats#video-codecs)中解碼影格。詳情請參閱[影片](videos.md)。
* `io.coil-kt.coil3:coil-test`：包含支援測試的類別。詳情請參閱[測試](testing.md)。
* `io.coil-kt.coil3:coil-bom`：包含一個[物料清單 (Bill of Materials)](https://docs.gradle.org/7.2/userguide/platforms.html#sub:bom_import)。匯入 `coil-bom` 可讓你相依於其他 Coil 構件而無需指定版本。