# 升級至 Coil 3.x

Coil 3 是 Coil 的下一個主要版本，帶來了許多重大改進：

- 完全支援 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)，包含所有主要目標（Android、iOS、JVM、JS 和 [WASM](https://coil-kt.github.io/coil/sample/)）。
- 支援多個網路程式庫（Ktor 與 OkHttp）。或者，若你只需要載入本機／靜態檔案，也可以在不引入網路相依性的情況下使用 Coil。
- 改進 Compose `@Preview` 轉譯，並透過 `LocalAsyncImagePreviewHandler` 支援自訂預覽行為。
- 重要錯誤修正（包含需要破壞既有行為的變更，詳述於下方）。

本文件提供了從 Coil 2 到 Coil 3 的主要變更概要，並醒目提示所有破壞性或重要變更。本文件並未涵蓋每一個二進制不相容的變更或微小的行為變更。

範例專案請參閱 [Compose Multiplatform 範例](https://github.com/coil-kt/coil/tree/main/samples/compose)。

## Maven 座標與套件名稱 {id="maven-coordinates-and-package-name"}

Coil 的 Maven 座標已從 `io.coil-kt` 更新為 `io.coil-kt.coil3`，其套件名稱也從 `coil` 更新為 `coil3`。這讓 Coil 3 可以與 Coil 2 並存執行，而不會產生二進制相容性問題。例如，`io.coil-kt:coil:2.7.0` 現在變更為 `io.coil-kt.coil3:coil:3.0.0`。

`coil-base` 和 `coil-compose-base` 構件分別重新命名為 `coil-core` 和 `coil-compose-core`，以符合 Coroutines、Ktor 與 AndroidX 所使用的命名慣例。

## 網路圖片 {id="network-images"}

**`coil-core` 預設不再支援從網路載入圖片。**[你必須新增 Coil 網路構件之一的相依性。詳情請參閱此處。](network.md)。做此變更是為了讓使用者能採用不同的網路程式庫，或在應用程式不需要網路相依性時將其排除。

此外，預設不再遵循快取控制標頭 (cache control headers)。詳情請參閱[此處](network.md)。

## 多平台 {id="multiplatform"}

Coil 3 現在是一個支援 Android、JVM、iOS、macOS、JavaScript 和 WASM 的 Kotlin Multiplatform 程式庫。

在 Android 上，Coil 使用標準圖形類別來轉譯圖片。在非 Android 平台上，Coil 使用 [Skiko](https://github.com/JetBrains/skiko) 來轉譯圖片。Skiko 是一組包裝了 Google 所開發之 [Skia](https://github.com/google/skia) 圖形引擎的 Kotlin 繫結。

作為與 Android SDK 解耦的一部分，進行了許多 API 變更。值得注意的有：

- `Drawable` 已被自訂的 `Image` 介面取代。在 Android 上，使用 `Drawable.asImage()` 與 `Image.asDrawable(resources)` 在類別之間進行轉換。在非 Android 平台上，請使用 `Bitmap.asImage()` 與 `Image.toBitmap()`。
- Android 的 `android.net.Uri` 類別用法已由多平台的 `coil3.Uri` 類別取代。任何傳遞 `android.net.Uri` 作為 `ImageRequest.data` 的呼叫點均不受影響。依賴接收 `android.net.Uri` 的自訂 `Fetcher` 則需要更新為使用 `coil3.Uri`。
- `Context` 的用法已由 `PlatformContext` 取代。`PlatformContext` 在 Android 上是 `Context` 的型別別名，在非 Android 平台上則可透過 `PlatformContext.INSTANCE` 存取。在 Compose Multiplatform 中，請使用 `LocalPlatformContext.current` 取得參考。
- `Coil` 類別已重新命名為 `SingletonImageLoader`。
- 如果你在自訂的 Android `Application` 類別中實作了 `ImageLoaderFactory`，則需要改為實作 `SingletonImageLoader.Factory` 來替換 `ImageLoaderFactory`。一旦實作了 `SingletonImageLoader.Factory`，如有需要便可覆寫 `newImageLoader()`。

`coil-svg` 構件在多平台上受到支援，但 `coil-gif` 與 `coil-video` 構件由於依賴特定的 Android 解碼器和程式庫，目前仍僅限 Android 使用。

## Compose {id="compose"}

`coil-compose` 構件的 API 大致保持不變。你可以繼續像在 Coil 2 中一樣使用 `AsyncImage`、`SubcomposeAsyncImage` 和 `rememberAsyncImagePainter`。此外，這些方法已更新為[可重新啟動與可略過 (restartable and skippable)](https://developer.android.com/jetpack/compose/performance/stability)，這將有助於提升其效能。

- `AsyncImagePainter.state` 現在是一個 `StateFlow`。應使用 `val state = painter.state.collectAsState()` 來觀察它。
- `AsyncImagePainter` 的預設 `SizeResolver` 不再等待第一次 `onDraw` 呼叫來取得畫布大小。取而代之的是，`AsyncImagePainter` 預設為 `Size.ORIGINAL`。
- Compose 的 `modelEqualityDelegate` 委派現在是透過 CompositionLocal `LocalAsyncImageModelEqualityDelegate` 設定，而不是作為 `AsyncImage`／`SubcomposeAsyncImage`／`rememberAsyncImagePainter` 的參數。

## 一般變更 {id="general"}

其他重要的行為變更包括：

- 第一方 `Fetcher` 與 `Decoder`（例如 `NetworkFetcher.Factory`、`SvgDecoder` 等）現在會透過 service loader 自動新增至每個新的 `ImageLoader`。可以使用 `ImageLoader.Builder.serviceLoaderEnabled(false)` 停用此行為。
- 移除了對 `android.resource://example.package.name/drawable/image` URI 的支援，因為這會阻礙資源縮減（resource shrinking）最佳化。建議直接傳入 `R.drawable.image` 的值。傳入資源 ID 而非資源名稱依然可行：`android.resource://example.package.name/12345678`。如果你仍然需要此功能，可以[在你的組件註冊表（component registry）中手動包含 `ResourceUriMapper`](https://github.com/coil-kt/coil/blob/da7d872e340430014dbc5136e35eb62f9b17662e/coil-core/src/androidInstrumentedTest/kotlin/coil3/map/ResourceUriMapper.kt)。
- 檔案的最後寫入時間戳記預設不再新增至其快取金鑰中。這是為了避免在主執行緒上讀取磁碟（即使時間非常短暫）。可以透過 `ImageRequest.Builder.addLastModifiedToFileCacheKey(true)` 或 `ImageLoader.Builder.addLastModifiedToFileCacheKey(true)` 重新啟用此功能。
- 輸出圖片的尺寸現在強制限制小於 4096x4096，以防止意外發生 OOM（記憶體不足）。這可以透過 `ImageLoader/ImageRequest.Builder.maxBitmapSize` 進行設定。若要停用此行為，請將 `maxBitmapSize` 設為 `Size.ORIGINAL`。
- Coil 2 的 `Parameters` API 已由 `Extras` 取代。`Extras` 不需要字串金鑰，而是依賴同一性相等（identity equality）。`Extras` 不支援修改記憶體快取金鑰。如果你的 extra 會影響記憶體快取金鑰，請改用 `ImageRequest.memoryCacheKeyExtra`。
- 許多 `ImageRequest.Builder` 函式已移為擴充函式，以便更輕鬆地支援多平台。