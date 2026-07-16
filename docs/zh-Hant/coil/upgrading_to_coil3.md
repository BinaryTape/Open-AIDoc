# 升級至 Coil 3.x

Coil 3 是 Coil 的下一個主要版本，具有多項重大改進：

- 完整支援 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)，包括所有主要目標（Android、iOS、JVM、JS 和 [WASM](/coil/overview)）。
- 支援多個網路程式庫（Ktor 和 OkHttp）。或者，如果您只需要載入本機/靜態檔案，可以在沒有網路相依性的情況下使用 Coil。
- 改進了 Compose `@Preview` 渲染，並透過 `LocalAsyncImagePreviewHandler` 支援自訂預覽行為。
- 修復了需要破壞現有行為的重要錯誤（如下所述）。

本文件提供了從 Coil 2 到 Coil 3 主要變更的高階概覽，並醒目提示了任何破壞性或重要的變更。它並未涵蓋每個二進位不相容的變更或微小的行為變更。

在 Compose Multiplatform 專案中使用 Coil 3？請查看 [`samples`](https://github.com/coil-kt/coil/tree/3.x/samples/compose) 存儲庫以獲取範例。

## Maven 座標與套件名稱

Coil 的 Maven 座標已從 `io.coil-kt` 更新為 `io.coil-kt.coil3`，且其套件名稱已從 `coil` 更新為 `coil3`。這允許 Coil 3 與 Coil 2 並存執行，而不會產生二進位相容性問題。例如，`io.coil-kt:coil:2.7.0` 現在改為 `io.coil-kt.coil3:coil:3.0.0`。

`coil-base` 和 `coil-compose-base` 構件已分別重新命名為 `coil-core` 和 `coil-compose-core`，以符合 Coroutines、Ktor 和 AndroidX 所使用的命名慣例。

## 網路圖片

**`coil-core` 預設不再支援從網路載入圖片。** [您必須新增對 Coil 網路構件之一的相依性。請參閱此處了解更多資訊。](network.md)。進行此項更改是為了讓使用者可以使用不同的網路程式庫，或者如果他們的應用程式不需要網路，則可以避免網路相依性。

此外，預設不再遵循快取控制標頭。請參閱[此處](network.md)了解更多資訊。

## Multiplatform

Coil 3 現在是一個 Kotlin Multiplatform 程式庫，支援 Android、JVM、iOS、macOS、Javascript 和 WASM。

在 Android 上，Coil 使用標準圖形類別來渲染圖片。在非 Android 平台上，Coil 使用 [Skiko](https://github.com/JetBrains/skiko) 來渲染圖片。Skiko 是一組 Kotlin 繫結，用於封裝由 Google 開發的 [Skia](https://github.com/google/skia) 圖形引擎。

作為與 Android SDK 解耦的一部分，進行了許多 API 變更。值得注意的有：

- `Drawable` 被替換為自訂的 `Image` 介面。在 Android 上使用 `Drawable.asImage()` 和 `Image.asDrawable(resources)` 在類別之間進行轉換。在非 Android 平台上使用 `Bitmap.asImage()` 和 `Image.toBitmap()`。
- Android 的 `android.net.Uri` 類別的使用被替換為多平台的 `coil3.Uri` 類別。任何將 `android.net.Uri` 作為 `ImageRequest.data` 傳遞的呼叫點均不受影響。依賴接收 `android.net.Uri` 的自訂 `Fetcher` 將需要更新以使用 `coil3.Uri`。
- `Context` 的使用被替換為 `PlatformContext`。`PlatformContext` 是 Android 上 `Context` 的型別別名，在非 Android 平台上可以透過 `PlatformContext.INSTANCE` 存取。在 Compose Multiplatform 中使用 `LocalPlatformContext.current` 來取得參照。
- `Coil` 類別重新命名為 `SingletonImageLoader`。
- 如果您在自訂的 Android `Application` 類別中實作 `ImageLoaderFactory`，則需要改為實作 `SingletonImageLoader.Factory` 以作為 `ImageLoaderFactory` 的替代。一旦實作了 `SingletonImageLoader.Factory`，如果您需要或想要覆寫 `newImageLoader()`，您將能夠進行覆寫。

`coil-svg` 構件在多平台中受到支援，但 `coil-gif` 和 `coil-video` 構件（目前）仍僅限於 Android，因為它們依賴於特定的 Android 解碼器和程式庫。

## Compose

`coil-compose` 構件的 API 大部分保持不變。您可以繼續以與 Coil 2 相同的方式使用 `AsyncImage`、`SubcomposeAsyncImage` 和 `rememberAsyncImagePainter`。此外，這些方法已更新為[可重啟且可跳過](https://developer.android.com/jetpack/compose/performance/stability)，這應該會提高其效能。

- `AsyncImagePainter.state` 現在是一個 `StateFlow`。應使用 `val state = painter.state.collectAsState()` 進行觀察。
- `AsyncImagePainter` 的預設 `SizeResolver` 不再等待第一次 `onDraw` 呼叫來取得畫布大小。相反地，`AsyncImagePainter` 預設為 `Size.ORIGINAL`。
- Compose `modelEqualityDelegate` 委派現在透過 composition local `LocalAsyncImageModelEqualityDelegate` 設定，而不是作為 `AsyncImage` / `SubcomposeAsyncImage` / `rememberAsyncImagePainter` 的參數。

## 一般

其他重要的行為變更包括：

- 第一方 `Fetcher` 和 `Decoder`（例如 `NetworkFetcher.Factory`、`SvgDecoder` 等）現在透過服務載入器自動新增到每個新的 `ImageLoader` 中。此行為可以使用 `ImageLoader.Builder.serviceLoaderEnabled(false)` 停用。
- 移除對 `android.resource://example.package.name/drawable/image` URI 的支援，因為它會阻礙資源縮減最佳化。建議直接傳遞 `R.drawable.image` 的值。傳遞資源 ID 而不是資源名稱仍然有效：`android.resource://example.package.name/12345678`。如果您仍然需要其功能，可以[手動將 `ResourceUriMapper` 包含在您的組件註冊表中](https://github.com/coil-kt/coil/blob/da7d872e340430014dbc5136e35eb62f9b17662e/coil-core/src/androidInstrumentedTest/kotlin/coil3/map/ResourceUriMapper.kt)。
- 檔案的最後寫入時間戳記預設不再新增到其快取金鑰中。這是為了避免在主執行緒上讀取磁碟（即使時間非常短）。可以使用 `ImageRequest.Builder.addLastModifiedToFileCacheKey(true)` 或 `ImageLoader.Builder.addLastModifiedToFileCacheKey(true)` 重新啟用此功能。
- 現在強制輸出圖片尺寸小於 `4096x4096`，以防止意外的記憶體不足 (OOM)。這可以透過 `ImageLoader/ImageRequest.Builder.maxBitmapSize` 進行配置。要停用此行為，請將 `maxBitmapSize` 設定為 `Size.ORIGINAL`。
- Coil 2 的 `Parameters` API 已被 `Extras` 取代。`Extras` 不需要字串鍵，而是依賴身分相等性。`Extras` 不支援修改記憶體快取金鑰。相反地，如果您的 extra 會影響記憶體快取金鑰，請使用 `ImageRequest.memoryCacheKeyExtra`。
- 許多 `ImageRequest.Builder` 函式已改為擴充函式，以便更輕鬆地支援多平台。