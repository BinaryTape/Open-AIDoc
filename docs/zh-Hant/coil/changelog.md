# 變更日誌

## [3.6.3] - 2026 年 9 月 18 日 {id="3-6-3-september-18-2026"}

- 修正使用 Android Gradle Plugin 9.4.0 與 R8 時，因 Kotlin 模組名稱元資料中包含無效字元而導致建置失敗的問題。

## [3.6.2] - 2026 年 9 月 4 日 {id="3-6-2-september-4-2026"}

- 修正當等待中的請求被取消時，`DeDupeConcurrentRequestStrategy` 會掛起該索引鍵對應請求的問題。([#3566](https://github.com/coil-kt/coil/pull/3566))
- 修正使用 Compose Multiplatform 1.13 時出現的 JS/WASM 連結錯誤。([#3568](https://github.com/coil-kt/coil/pull/3568))

## [3.6.1] - 2026 年 9 月 1 日 {id="3-6-1-september-1-2026"}

- 修正啟用 ES 模組時 JS 建置失敗的問題。([#3558](https://github.com/coil-kt/coil/pull/3558))

## [3.6.0] - 2026 年 8 月 26 日 {id="3-6-0-august-26-2026"}

- **新增**：支援在 JS/WASM 上載入 `blob:` URL（物件 URL）。([#3504](https://github.com/coil-kt/coil/pull/3504))
- **新增**：新增 `ImageRequest.Builder.allowPartialImage` 與 `ImageLoader.Builder.allowPartialImage`，用於設定 Android 上的 `StaticImageDecoder` 是否接受不完整的圖片。此功能預設啟用，與先前的 Coil 版本行為一致。([#3494](https://github.com/coil-kt/coil/pull/3494))
- 修正 `AsyncImage` 在使用反向條件約束測量時發生崩潰的問題。([#3470](https://github.com/coil-kt/coil/pull/3470))
- 修正 Compose 的 `filterQuality` 未套用至以 Drawable 為底層的圖片（包括 GIF）的問題。([#3469](https://github.com/coil-kt/coil/pull/3469))
- 修正 JS/WASM 圖片解碼器的記憶體洩漏問題。([#3503](https://github.com/coil-kt/coil/pull/3503))
- 修正經 R8 9.0+ 最佳化的組建中，圖片無法使用 `GenericViewTarget` 算繪的問題。([#3518](https://github.com/coil-kt/coil/pull/3518))
- 在 JVM 上改用 `Runtime.maxMemory()` 來決定記憶體快取的最大容量，而非預設假設有 512 MB 的可用記憶體。([#3458](https://github.com/coil-kt/coil/pull/3458))
- 將 ProGuard 規則綑綁至非 Android 的 JVM 構件中。([#3476](https://github.com/coil-kt/coil/pull/3476))
- 更新 Android compile SDK 至 37。
- 更新 Kotlin 至 2.4.10。
- 更新 Compose 至 1.12.0。
- 更新 Okio 至 3.18.1。
- 更新 Skiko 至 0.150.1。
- 更新 `kotlinx-io-okio` 至 0.9.1。

## [3.5.0] - 2026 年 6 月 10 日 {id="3-5-0-june-10-2026"}

自 `3.4.0` 以來的變更：

- **重要**：移除 `iosX64` 與 `macosX64` 目標。([#3386](https://github.com/coil-kt/coil/pull/3386))
- **重要**：將 Android 的最低 SDK 版本提高至 23。([#3283](https://github.com/coil-kt/coil/pull/3283))
- **新增**：在 JS/WASM 上新增快速 WebP 尺寸提取功能，以避免回退到完整的 Skia 解碼。([#3341](https://github.com/coil-kt/coil/pull/3341))
- 移除 `ImageLoader.Builder.memoryCacheMaxSizePercentWhileInBackground` 上的實驗性註解。([#3439](https://github.com/coil-kt/coil/pull/3439))
- 修正 `CacheStrategy` 實作無法重新整理已快取的失敗回應（例如已過期的快取 `404` 回應）的問題。([#3401](https://github.com/coil-kt/coil/pull/3401))
- 在協同程式環境中改為尋找 `ContinuationInterceptor`，而非 `CoroutineDispatcher`。([#3415](https://github.com/coil-kt/coil/pull/3415))
- 更新 Android compile SDK 至 36。
- 更新 Kotlin 語言版本至 2.2。
- 更新 Kotlin 至 2.4.0。
- 更新 Compose 至 1.11.1。
- 更新 Okio 至 3.17.0。
- 更新 Skiko 至 0.144.6。
- 更新 `androidx.annotation` 至 1.10.0。

自 `3.5.0-beta01` 以來的變更：

- 移除 `ImageLoader.Builder.memoryCacheMaxSizePercentWhileInBackground` 上的實驗性註解。([#3439](https://github.com/coil-kt/coil/pull/3439))
- 在協同程式環境中改為尋找 `ContinuationInterceptor`，而非 `CoroutineDispatcher`。([#3415](https://github.com/coil-kt/coil/pull/3415))
- 更新 Kotlin 語言版本至 2.2。
- 更新 Kotlin 至 2.4.0。
- 更新 Compose 至 1.11.1。
- 更新 Skiko 至 0.144.6。

## [3.5.0-beta01] - 2026 年 5 月 4 日 {id="3-5-0-beta01-may-4-2026"}

- 移除 `iosX64` 與 `macosX64` 目標。([#3386](https://github.com/coil-kt/coil/pull/3386))
- 將 Android 最低 SDK 版本提高至 23。([#3283](https://github.com/coil-kt/coil/pull/3283))
- 在 JS/WASM 上新增快速 WebP 尺寸提取，以避免回退到完整的 Skia 解碼。([#3341](https://github.com/coil-kt/coil/pull/3341))
- 修正 `CacheStrategy` 實作無法重新整理已快取的失敗回應（例如已過期的快取 `404` 回應）的問題。([#3401](https://github.com/coil-kt/coil/pull/3401))
- 更新 compile SDK 至 36。
- 更新 Kotlin 至 2.3.21。
- 更新 Compose 至 1.11.0-beta03。
- 更新 Okio 至 3.17.0。
- 更新 Skiko 至 0.144.5。
- 更新 `androidx.annotation` 至 1.10.0。

## [3.4.0] - 2026 年 2 月 24 日 {id="3-4-0-february-24-2026"}

- **新增**：新增 `ConcurrentRequestStrategy`，支援將相同索引鍵的傳輸中網路請求合併。([#2995](https://github.com/coil-kt/coil/pull/2995), [#3326](https://github.com/coil-kt/coil/pull/3326))
    - `DeDupeConcurrentRequestStrategy` 啟用了此行為，並允許等待者等待進行中的網路請求結果。
        - 此行為屬於實驗性功能，目前預設為停用。
        - 目前請求一律根據其 `diskCacheKey` 進行合併。
    - `OkHttpNetworkFetcherFactory`、`KtorNetworkFetcherFactory` 與 `NetworkFetcher.Factory` 現已支援接收 `concurrentRequestStrategy`。
- **新增**：在 JS/WASM 上使用 Web Worker 解碼圖片，以避免阻塞瀏覽器主執行緒。([#3305](https://github.com/coil-kt/coil/pull/3305))
- **新增**：為非 Compose 的多平台構件新增對 Linux 原生目標（`linuxX64` 和 `linuxArm64`）的支援。([#3054](https://github.com/coil-kt/coil/pull/3054))
- **新增**：新增僅限 Compose 的 API，以改善後續請求之間的轉場效果。([#3141](https://github.com/coil-kt/coil/pull/3141), [#3175](https://github.com/coil-kt/coil/pull/3175))
    - `ImageRequest.Builder.useExistingImageAsPlaceholder` 支援在未設定占位符號時，從上一張圖片淡入淡出轉場。
    - `ImageRequest.Builder.preferEndFirstIntrinsicSize` 讓 `CrossfadePainter` 優先採用結束 Painter 的固有大小。
- **新增**：在 `coil-gif` 中新增 `ImageLoader.Builder.repeatCount(Int)`，用於設定全域動畫圖片重複播放次數。([#3143](https://github.com/coil-kt/coil/pull/3143))
- **新增**：在 `coil-video` 中新增優先使用內嵌影片縮圖的支援。([#3107](https://github.com/coil-kt/coil/pull/3107))
- **新增**：隨 `coil-core` 一併發布 `coil-lint`，並新增 Lint 檢查以捕獲在 `ImageRequest.Builder` 區塊中誤呼叫 `kotlin.error()` 的情況。([#3304](https://github.com/coil-kt/coil/pull/3304))
- 將 Kotlin 語言版本設定為 2.1。([#3302](https://github.com/coil-kt/coil/pull/3302))
- 讓 `BitmapFetcher` 在通用程式碼中可用。([#3286](https://github.com/coil-kt/coil/pull/3286))
- 在 Android 上建立單例 `ImageLoader` 時使用 `applicationContext`。([#3246](https://github.com/coil-kt/coil/pull/3246))
- 預設快取合格的非 2xx HTTP 回應（例如 `404`），並停止快取不可快取的回應（例如 `500`）。([#3137](https://github.com/coil-kt/coil/pull/3137), [#3139](https://github.com/coil-kt/coil/pull/3139))
- 修正讀取 OkHttp 回應內文時潛在的競爭條件。([#3186](https://github.com/coil-kt/coil/pull/3186))
- 修正 `maxBitmapSize` 邊緣情況，以防止在 Android 上因點陣圖尺寸過大而崩潰。([#3259](https://github.com/coil-kt/coil/pull/3259))
- 更新 Kotlin 至 2.3.10。
- 更新 Compose 至 1.9.3。
- 更新 Okio 至 3.16.4。
- 更新 Skiko 至 0.9.22.2。
- 更新 `kotlinx-io-okio` 至 0.9.0。
- 更新 `androidx.core` 至 1.16.0。
- 更新 `androidx.lifecycle` 至 2.9.4。
- 更新 `androidx.exifinterface` 至 1.4.2。

## [3.3.0] - 2025 年 7 月 22 日 {id="3-3-0-july-22-2025"}

- **新增**：引入新 API，可在 Android 應用程式處於背景時限制 `MemoryCache.maxSize`。
    - 若設定了 `ImageLoader.Builder.memoryCacheMaxSizePercentWhileInBackground`，則當應用程式進入背景時，`ImageLoader` 的記憶體快取將被限制為其最大容量的特定百分比。此設定目前預設停用。
    - 當應用程式進入背景時，圖片將從記憶體快取中被修剪以達到受限的最大容量，但記憶體快取中對最近修剪圖片的弱參照不受影響。這表示如果圖片目前在其他位置被引用（例如 `AsyncImage`、`ImageView` 等），它仍將保留在記憶體快取中。
    - 此 API 有助於減少背景記憶體使用量，防止應用程式過早被系統終止，並協助減輕使用者裝置的記憶體壓力。
- **新增**：為 `SvgDecoder` 新增 `Svg.Parser` 引數。
    - 若預設的 SVG 剖析器無法滿足需求，此功能允許使用自訂的 SVG 剖析器。
- 為 `SvgDecoder` 新增 `density` 引數，以支援提供自訂的密度倍數。
- 新增 `Uri.Builder` 以支援複製與修改 `Uri`。
- 新增 `ImageLoader.Builder.mainCoroutineContext`，以支援在測試中覆寫 Coil 所使用的 `Dispatchers.main.immediate`。
- 修正當動畫結束且取消參照 `start` 圖片時，`CrossfadePainter.intrinsicSize` 會變化的問題。這與 `CrossfadeDrawable` 的行為保持一致。
- 修正無法從 Java 存取 `ImageLoaders.executeBlocking` 的問題。
- 在 `coil-network-ktor3` 中使用 `kotlinx.io` 的 Okio 互通模組。
- 更新 `kotlinx-datetime` 至 `0.7.1`。
    - 此版本包含僅影響 `coil-network-cache-control` 模組的二進制不相容變更。詳情請參閱[此處](https://github.com/Kotlin/kotlinx-datetime?tab=readme-ov-file#deprecation-of-instant)。
- 更新 Kotlin 至 2.2.0。
- 更新 Compose 至 1.8.2。
- 更新 Okio 至 3.15.0。
- 更新 Skiko 至 0.9.4.2。

## [3.2.0] - 2025 年 5 月 13 日 {id="3-2-0-may-13-2025"}

自 `3.1.0` 以來的變更：

- **重要**：由於 Compose `1.8.0` 的需求，`coil-compose` 與 `coil-compose-core` 現在需要 Java 11 位元組碼。啟用方式請參閱[此處](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8-or-java-11)。
- 修改 `AsyncImagePreviewHandler` 的函式建構函式，使其傳回 `AsyncImagePainter.State.Success` 而非 `AsyncImagePainter.State.Loading`。
- 修正 `ConstraintsSizeResolver#size()` 中的取消問題。
- 修正使用 R8 建置時缺少 `PlatformContext` 的警告。
- 修正傳回預設 `FakeImageLoaderEngine` 回應時，`FakeImageLoaderEngine` 未設定 `Transition.Factory.NONE` 的問題。
- 移除 `ColorImage` 上的實驗性註解。
- 在 `CacheControlCacheStrategy` 中延遲剖析網路標頭。
- 重構 `CircleCropTransformation` 與 `RoundedCornersTransformation` 以共用通用程式碼。
- 若 `ExifOrientationStrategy` 不是 `RESPECT_PERFORMANCE`，內部會回退為使用 `BitmapFactory`。
- 更新 Kotlin 至 2.1.20。
- 更新 Compose 至 1.8.0。
- 更新 Okio 至 3.11.0。
- 更新 Skiko 至 0.9.4。
- 更新 Coroutines 至 1.10.2。
- 更新 `accompanist-drawablepainter` 至 0.37.3。

自 `3.2.0-rc02` 以來的變更：

- 若 `ExifOrientationStrategy` 不是 `RESPECT_PERFORMANCE`，內部會回退為使用 `BitmapFactory`。
- 更新 Compose 至 1.8.0。
- 更新 `accompanist-drawablepainter` 至 0.37.3。

## [3.2.0-rc02] - 2025 年 4 月 26 日 {id="3-2-0-rc02-april-26-2025"}

- 修正非 JVM 目標上使用 `KtorNetworkFetcherFactory` (Ktor 3) 載入圖片時，圖片請求因 `ClosedByteChannelException` 失敗的問題。

## [3.2.0-rc01] - 2025 年 4 月 24 日 {id="3-2-0-rc01-april-24-2025"}

- **重要**：由於 Compose `1.8.0` 的需求，`coil-compose` 與 `coil-compose-core` 現在需要 Java 11 位元組碼。啟用方式請參閱[此處](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8-or-java-11)。
- 修改 `AsyncImagePreviewHandler` 的函式建構函式，使其傳回 `AsyncImagePainter.State.Success` 而非 `AsyncImagePainter.State.Loading`。
- 修正 `ConstraintsSizeResolver#size()` 中的取消問題。
- 修正使用 R8 建置時缺少 `PlatformContext` 的警告。
- 修正傳回預設 `FakeImageLoaderEngine` 回應時，`FakeImageLoaderEngine` 未設定 `Transition.Factory.NONE` 的問題。
- 移除 `ColorImage` 上的實驗性註解。
- 在 `CacheControlCacheStrategy` 中延遲剖析網路標頭。
- 重構 `CircleCropTransformation` 與 `RoundedCornersTransformation` 以共用通用程式碼。
- 在 `coil-network-ktor2` 與 `coil-network-ktor3` 中使用 `kotlinx.io` 的 Okio 互通模組。
- 更新 Kotlin 至 2.1.20。
- 更新 Compose 至 1.8.0-rc01。
- 更新 Okio 至 3.11.0。
- 更新 Skiko 至 0.9.4。
- 更新 Coroutines 至 1.10.2。

## [3.1.0] - 2025 年 2 月 4 日 {id="3-1-0-february-4-2025"}

- 提升 `AsyncImage` 效能。
    - 根據可組合項是具現化還是重複使用，執行階段效能提升了 25% 至 40%。記憶體配置也減少了 35% 至 48%。詳情請見[此處](https://github.com/coil-kt/coil/pull/2795)。
- 新增 `ColorImage` 並棄用 `FakeImage`。
    - `ColorImage` 適用於在測試與預覽中傳回虛擬值。它解決了與 `FakeImage` 相同的使用案例，但在 `coil-core` 中更容易存取，而不需要引入 `coil-test`。
- 移除 `coil-compose-core` 對 `Dispatchers.Main.immedate` 的依賴。
    - 這同時修正了在 Paparazzi 和 Roborazzi 螢幕截圖測試中，`AsyncImagePainter` 無法同步執行 `ImageRequest` 的問題。
- 新增對格式為 `data:[<mediatype>][;base64],<data>` 的 [資料 URI (data URIs)](https://www.ietf.org/rfc/rfc2397.txt) 的支援。
- 新增 `AnimatedImageDecoder.ENCODED_LOOP_COUNT`，支援使用 GIF 元資料中編碼的重複次數。
- 為 `NetworkRequest` 新增 `Extras` 以支援自訂擴充功能。
- 新增 `DiskCache.Builder.cleanupCoroutineContext` 並棄用 `DiskCache.Builder.cleanupDispatcher`。
- 新增 `ImageLoader.Builder.imageDecoderEnabled`，可選擇在 API 29 及以上版本中停用 `android.graphics.ImageDecoder`。
- 若 `ImageRequest` 的資料型別未註冊 `Keyer`，則記錄一則警告。
- 將 `CrossfadePainter` 設為公開 API。
- 在所有多平台目標上支援 `Transformation`。
- 在 `CacheControlCacheStrategy` 中支援將 0 作為 `Expires` 標頭值。
- 修正當 `AsyncImage`/`SubcomposeAsyncImage`/`rememberAsyncImage` 的 `ContentScale` 變更為 `None` 或從 `None` 變更時，不會啟動新 `ImageRequest` 的問題。
- 更新 Kotlin 至 2.1.10。
    - 注意：若你使用 Kotlin Native，由於 [LLVM 更新](https://kotlinlang.org/docs/whatsnew21.html#llvm-update-from-11-1-0-to-16-0-0)，此版本要求使用 Kotlin 2.1.0 或更高版本進行編譯。
- 更新 Compose 至 1.7.3。
- 更新 `androidx.core` 至 1.15.0。

## [3.0.4] - 2024 年 11 月 25 日 {id="3-0-4-november-25-2024"}

- 修正向量 Drawable 在 Android Studio 預覽中無法算繪的問題。
- 修正尺寸超過 `maxBitmapSize` 的請求可能發生記憶體快取未命中的問題。
- 修正 `FakeImage` 在 Android 上無法算繪的問題。
- 修正當與 `AsyncImage`/`rememberAsyncImagePainter`/`SubcomposeAsyncImage` 一起使用時，若請求的 `Transformation` 發生變更，不會重新啟動新圖片請求的問題。
- 修正 `ScaleDrawable` 與 `CrossfadeDrawable` 未遵循色調（tint）狀態的問題。
- 允許 `ImageDecoder` 解碼不完整的圖片來源。這與 `BitmapFactory` 中的行為一致。
- 修正解碼後未呼叫 `Bitmap.prepareToDraw()` 的問題。
- 對於非點陣化圖片，`SvgDecoder` 不應傳回 `isSampled = true`。
- 若在 Compose 中無法使用 immediate main dispatcher，則回退到 `Dispatchers.Unconfined`。此設定僅用於預覽／測試環境。
- 更新 Ktor 2 至 `2.3.13`。

## [3.0.3] - 2024 年 11 月 14 日 {id="3-0-3-november-14-2024"}

- 修正依據 `ImageView` 的 `ScaleType` 設定 `ImageRequest.scale` 的問題。
- 修正 `DiskCache` 在刪除檔案後未能追蹤條目移除的邊緣情況。
- 記錄錯誤時將 throwable 傳遞給 `Logger`。
- 不再使用 `kotlin-stdlib` 取代 `kotlin-stdlib-jdk7` 與 `kotlin-stdlib-jdk8`。

## [3.0.2] - 2024 年 11 月 9 日 {id="3-0-2-november-9-2024"}

- 修正 Android 上使用自訂 `CacheStrategy` 呼叫 `OkHttpNetworkFetcherFactory` 時發生的崩潰。
- 修正 `CacheControlCacheStrategy` 計算快取條目有效期限不正確的問題。
- 修正僅在 API >= 28 且為 `ARGB_8888` 或 `HARDWARE` 時才會遵循 `ImageRequest.bitmapConfig` 的問題。

## [3.0.1] - 2024 年 11 月 7 日 {id="3-0-1-november-7-2024"}

- 修正使用硬體點陣圖支援的 `BitmapImage` 呼叫 `Image.toBitmap` 時發生的崩潰。
- 修正 `AsyncImageModelEqualityDelegate.Default` 對非 `ImageRequest` 模型進行相等性比較不正確的問題。

## [3.0.0] - 2024 年 11 月 4 日 {id="3-0-0-november-4-2024"}

Coil 3.0.0 是 Coil 的下一個主要版本，完整支援 [Compose Multiplatform](https://www.jetbrains.com/compose-multiplatform/)。

[如需 3.0.0 中改進與重要變更的完整清單，請參閱升級指南](https://coil-kt.github.io/coil/upgrading_to_coil3/)。

自 `3.0.0-rc02` 以來的變更：

- 移除剩餘已棄用的方法。

## [3.0.0-rc02] - 2024 年 10 月 28 日 {id="3-0-0-rc02-october-28-2024"}

[如需 3.x 中改進與重要變更的完整清單，請參閱升級指南](https://coil-kt.github.io/coil/upgrading_to_coil3/)。自 `3.0.0-rc01` 以來的變更：

- 新增 `BlackholeDecoder`。這簡化了[僅限磁碟快取的預先載入](https://coil-kt.github.io/coil/faq/#how-do-i-preload-an-image)。
- 為 `ConstraintsSizeResolver` 與 `DrawScopeSizeResolver` 新增 `remember` 函式。
- 移除 `AsyncImage` 的 `EqualityDelegate` 參數。改為應透過 `LocalAsyncImageModelEqualityDelegate` 進行設定。
- 修正當父可組合項使用 `IntrinsicSize` 時，`AsyncImage` 無法算繪的問題。
- 修正當 `AsyncImagePainter` 沒有子 Painter 時，`AsyncImage` 會填滿可用條件約束的問題。
- 修正因 `EqualityDelegate` 被忽略，導致觀察其狀態時 `rememberAsyncImagePainter` 無限重新組合的問題。
- 修正剖析含有特殊字元的 `File`/`Path` 路徑的問題。
- 修正將自訂 `FileSystem` 實作與 `VideoFrameDecoder` 搭配使用的問題。
- 更新 Ktor 至 `3.0.0`。
- 更新 `androidx.annotation` 至 `1.9.0`。

## [3.0.0-rc01] - 2024 年 10 月 8 日 {id="3-0-0-rc01-october-8-2024"}

[如需 3.x 中改進與重要變更的完整清單，請參閱升級指南](https://coil-kt.github.io/coil/upgrading_to_coil3/)。自 `3.0.0-alpha10` 以來的變更：

- **破壞性變更**：預設停用 `addLastModifiedToFileCacheKey`，並允許為個別請求進行設定。可以使用相同的旗標重新啟用此行為。
- **新增**：引入新的 `coil-network-cache-control` 構件，實作了對 [`Cache-Control` 標頭](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) 的支援。
- **新增**：為 `SvgDecoder.Factory` 新增 `scaleToDensity` 屬性。此屬性確保具有固有維度的 SVG 會乘上裝置密度（僅在 Android 上支援）。
- 將 `ExifOrientationPolicy` 重新命名為 `ExifOrientationStrategy`。
- 在取得時從 `MemoryCache` 中移除無法共用的圖片。
- 將 `ConstraintsSizeResolver` 設為公開 API。
- 穩定 `setSingletonImageLoaderFactory`。
- 在 `coil-network-ktor3` 中還原最佳化的 JVM I/O 函式。
- 將 `pdf` 新增至 MIME 類型清單。
- 更新 compile SDK 至 35。
- 更新 Kotlin 至 2.0.20。
- 更新 Okio 至 3.9.1。

## [3.0.0-alpha10] - 2024 年 8 月 7 日 {id="3-0-0-alpha10-august-7-2024"}

- **破壞性變更**：將 `ImageLoader.Builder.networkObserverEnabled` 替換為 `NetworkFetcher` 的 `ConnectivityChecker` 介面。
    - 若要停用網路觀察程式，請將 `ConnectivityChecker.ONLINE` 傳遞給 `KtorNetworkFetcherFactory`/`OkHttpNetworkFetcherFactory` 的建構函式。
- **新增**：支援在所有平台上載入 [Compose Multiplatform 資源](https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-images-resources.html)。若要載入資源，請使用 `Res.getUri`：

```kotlin
AsyncImage(
    model = Res.getUri("drawable/image.jpg"),
    contentDescription = null,
)
```

- 為 `ImageLoader` 與 `ImageRequest` 新增 `maxBitmapSize` 屬性。
    - 此屬性預設為 4096x4096，為所配置的點陣圖尺寸提供安全的上限。這有助於防止因使用 `Size.ORIGINAL` 意外載入極大圖片而導致記憶體不足例外狀況（OOM）。
- 將 `ExifOrientationPolicy` 轉換為介面，以支援自訂原則。
- 修正 `Uri` 對 Windows 檔案路徑的處理。
- 從 `Image` API 中移除 `@ExperimentalCoilApi`。
- 更新 Kotlin 至 2.0.10。

## [3.0.0-alpha09] - 2024 年 7 月 23 日 {id="3-0-0-alpha09-july-23-2024"}

- **破壞性變更**：將 `io.coil-kt.coil3:coil-network-ktor` 構件重新命名為依賴 Ktor 2.x 的 `io.coil-kt.coil3:coil-network-ktor2`。此外，引入依賴 Ktor 3.x 的 `io.coil-kt.coil3:coil-network-ktor3`。`wasmJs` 僅在 Ktor 3.x 中受支援。
- **新增**：新增 `AsyncImagePainter.restart()` 以手動重新啟動圖片請求。
- 從 `NetworkClient` 及相關類別中移除 `@ExperimentalCoilApi`。
- 最佳化 `ImageRequest` 以避免不必要的 `Extras` 與 `Map` 配置。

## [2.7.0] - 2024 年 7 月 17 日 {id="2-7-0-july-17-2024"}

- 稍微最佳化內部協同程式的使用，以提升 `ImageLoader.execute`、`AsyncImage`、`SubcomposeAsyncImage` 及 `rememberAsyncImagePainter` 的效能。([#2205](https://github.com/coil-kt/coil/pull/2205))
- 修正分塊回應（chunked responses）發生重複網路呼叫的問題。([#2363](https://github.com/coil-kt/coil/pull/2363))
- 更新 Kotlin 至 2.0.0。
- 更新 Compose UI 至 1.6.8。
- 更新 Okio 至 3.9.0。

## [3.0.0-alpha08] - 2024 年 7 月 8 日 {id="3-0-0-alpha08-july-8-2024"}

- **破壞性變更**：將 `ImageRequest` 與 `ImageLoader` 的 `dispatcher` 方法重新命名為 `coroutineContext`。例如，`ImageRequest.Builder.dispatcher` 現為 `ImageRequest.Builder.coroutineContext`。此重新命名是因為該方法現在可接受任何 `CoroutineContext`，不再僅限於 `Dispatcher`。
- 修正：修正可能因競爭條件引起的 `IllegalStateException: Reading a state that was created after the snapshot was taken or in a snapshot that has not yet been applied` 錯誤。
    - 注意：這重新引入了對 `Dispatchers.Main.immediate` 的軟相依性。因此，你應在 JVM 上重新加入對 [`kotlinx-coroutines-swing`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-swing/) 的相依性。若未匯入，`ImageRequest` 將不會立即派發，並且在設定 `ImageRequest.placeholder` 或從記憶體快取解析時會有一畫格的延遲。

## [3.0.0-alpha07] - 2024 年 6 月 26 日 {id="3-0-0-alpha07-june-26-2024"}

- **破壞性變更**：`AsyncImagePainter` 預設不再等待 `onDraw`，而是改為使用 `Size.ORIGINAL`。
    - 這修正了[與 Roborazzi/Paparazzi 的相容性問題](https://github.com/coil-kt/coil/issues/1910)，並整體提升了測試可靠性。
    - 若要還原為等待 `onDraw` 的行為，請將 `DrawScopeSizeResolver` 設定為你的 `ImageRequest.sizeResolver`。
- **破壞性變更**：重構多平台 `Image` API。值得注意的是，`asCoilImage` 已重新命名為 `asImage`。
- **破壞性變更**：`AsyncImagePainter.state` 已變更為 `StateFlow<AsyncImagePainter.State>`。請使用 `collectAsState` 觀察其值。這有助於提升效能。
- **破壞性變更**：`AsyncImagePainter.imageLoader` 與 `AsyncImagePainter.request` 已合併為 `StateFlow<AsyncImagePainter.Inputs>`。請使用 `collectAsState` 觀察其值。這有助於提升效能。
- **破壞性變更**：移除對 `android.resource://example.package.name/drawable/image` URI 的支援，因為它會阻礙資源縮減（resource shrinking）最佳化。
    - 若你仍需要此功能，可以[在組件註冊表中手動包含 `ResourceUriMapper`](https://github.com/coil-kt/coil/blob/main/coil-core/src/androidInstrumentedTest/kotlin/coil3/map/ResourceUriMapper.kt)。
- **新增**：引入 `AsyncImagePreviewHandler` 以支援控制 `AsyncImagePainter` 的預覽算繪行為。
    - 使用 `LocalAsyncImagePreviewHandler` 來覆寫預覽行為。
    - 作為此變更及其他 `coil-compose` 改進的一部分，`AsyncImagePainter` 現在預設會嘗試執行 `ImageRequest`，而非預設顯示 `ImageRequest.placeholder`。在預覽環境中，[使用網路或檔案的請求預期會失敗](https://developer.android.com/develop/ui/compose/tooling/previews#preview-limitations)，但 Android 資源應可正常運作。
- **新增**：支援依畫格索引提取影片圖片。([#2183](https://github.com/coil-kt/coil/pull/2183))
- **新增**：支援將 `CoroutineContext` 傳遞給任何 `CoroutineDispatcher` 方法。([#2241](https://github.com/coil-kt/coil/pull/2241))。
- **新增**：在 JS 與 WASM JS 上支援弱參照記憶體快取。
- 在 Compose 中不再派發至 `Dispatchers.Main.immediate`。作為附帶效果，JVM 上不再需要匯入 [`kotlinx-coroutines-swing`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-swing/)。
- 在 Compose 中不呼叫 `async` 且不建立 disposable，以提高效能（感謝 @mlykotom！）。([#2205](https://github.com/coil-kt/coil/pull/2205))
- 修正將全域 `ImageLoader` extras 傳遞給 `Options` 的問題。([#2223](https://github.com/coil-kt/coil/pull/2223))
- 修正 `crossfade(false)` 在非 Android 目標上無法運作的問題。
- 修正 VP8X 功能旗標位元組偏移量。([#2199](https://github.com/coil-kt/coil/pull/2199))
- 將非 Android 目標上的 `SvgDecoder` 改為算繪至點陣圖，而非在繪製時算繪圖片。這提升了效能。
    - 此行為可使用 `SvgDecoder(renderToBitmap)` 進行控制。
- 將 `ScaleDrawable` 從 `coil-gif` 移至 `coil-core`。
- 更新 Kotlin 至 2.0.0。
- 更新 Compose 至 1.6.11。
- 更新 Okio 至 3.9.0。
- 更新 Skiko 至 0.8.4。
- [如需 3.x 中重要變更的完整清單，請參閱升級指南。](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [3.0.0-alpha06] - 2024 年 2 月 29 日 {id="3-0-0-alpha06-february-29-2024"}

- 將 Skiko 降級至 0.7.93。
- [如需 3.x 中重要變更的完整清單，請參閱升級指南。](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [3.0.0-alpha05] - 2024 年 2 月 28 日 {id="3-0-0-alpha05-february-28-2024"}

- **新增**：支援 `wasmJs` 目標。
- 建立 `DrawablePainter` 與 `DrawableImage`，以支援在非 Android 平台上繪製非以 `Bitmap` 為底層的 `Image`。
    - `Image` API 仍屬實驗性，在 alpha 版本之間可能會有所變動。
- 更新 `ContentPainterModifier` 以實作 `Modifier.Node`。
- 修正：在背景執行緒上延遲註冊組件回呼與網路觀察程式。這修正了通常會在主執行緒上發生的初始化緩慢問題。
- 修正：修正 `ImageRequest` 未採用 `ImageLoader.Builder.placeholder/error/fallback` 的問題。
- 更新 Compose 至 1.6.0。
- 更新 Coroutines 至 1.8.0。
- 更新 Okio 至 3.8.0。
- 更新 Skiko 至 0.7.94。
- [如需 3.x 中重要變更的完整清單，請參閱升級指南。](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [2.6.0] - 2024 年 2 月 23 日 {id="2-6-0-february-23-2024"}

- 讓 `rememberAsyncImagePainter`、`AsyncImage` 與 `SubcomposeAsyncImage` 具備[可重新啟動與可略過（restartable and skippable）](https://developer.android.com/jetpack/compose/performance/stability#functions)特性。這避免了在可組合項引數未變更時進行重新組合，從而提升效能。
    - 為 `rememberAsyncImagePainter`、`AsyncImage` 及 `SubcomposeAsyncImage` 新增選用的 `modelEqualityDelegate` 引數，以控制 `model` 是否會觸發重新組合。
- 更新 `ContentPainterModifier` 以實作 `Modifier.Node`。
- 修正：在背景執行緒上延遲註冊組件回呼與網路觀察程式。這修正了通常會在主執行緒上發生的初始化緩慢問題。
- 修正：若 `ImageRequest.listener` 或 `ImageRequest.target` 發生變更，避免在 `rememberAsyncImagePainter`、`AsyncImage` 及 `SubcomposeAsyncImage` 中重新啟動新圖片請求。
- 修正：避免在 `AsyncImagePainter` 中重複觀察圖片請求兩次。
- 更新 Kotlin 至 1.9.22。
- 更新 Compose 至 1.6.1。
- 更新 Okio 至 3.8.0。
- 更新 `androidx.collection` 至 1.4.0。
- 更新 `androidx.lifecycle` 至 2.7.0。

## [3.0.0-alpha04] - 2024 年 2 月 1 日 {id="3-0-0-alpha04-february-1-2024"}

- **破壞性變更**：從 `OkHttpNetworkFetcherFactory` 與 `KtorNetworkFetcherFactory` 的公開 API 中移除 `Lazy`。
- 在 `OkHttpNetworkFetcherFactory` 中公開 `Call.Factory` 而非 `OkHttpClient`。
- 將 `NetworkResponseBody` 改為封裝 `ByteString`。
- 將 Compose 降級至 1.5.12。
- [如需重要變更的完整清單，請參閱升級指南。](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [3.0.0-alpha03] - 2024 年 1 月 20 日 {id="3-0-0-alpha03-january-20-2024"}

- **破壞性變更**：`coil-network` 已重新命名為 `coil-network-ktor`。此外，新增了依賴 OkHttp 且不需要指定 Ktor 引擎的 `coil-network-okhttp` 構件。
    - 依據你匯入的構件，你可以使用 `KtorNetworkFetcherFactory` 或 `OkHttpNetworkFetcherFactory` 手動參照 `Fetcher.Factory`。
- 支援在 Apple 平台上載入 `NSUrl`。
- 為 `AsyncImage` 新增 `clipToBounds` 參數。
- [如需重要變更的完整清單，請參閱升級指南。](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [3.0.0-alpha02] - 2024 年 1 月 10 日 {id="3-0-0-alpha02-january-10-2024"}

- **破壞性變更**：更新了 `coil-gif`、`coil-network`、`coil-svg` 與 `coil-video` 的套件，使其所有類別分別屬於 `coil.gif`、`coil.network`、`coil.svg` 及 `coil.video`。這有助於避免與其他構件發生類別名稱衝突。
- **破壞性變更**：`ImageDecoderDecoder` 已重新命名為 `AnimatedImageDecoder`。
- **新增**：`coil-gif`、`coil-network`、`coil-svg` 與 `coil-video` 的組件現在會自動新增至每個 `ImageLoader` 的 `ComponentRegistry` 中。
    - 明確來說，與 `3.0.0-alpha01` 不同，**你不再需要手動將 `NetworkFetcher.Factory()` 新增至你的 `ComponentRegistry`**。只需匯入 `io.coil-kt.coil3:coil-network:[version]` 與 [Ktor 引擎](https://ktor.io/docs/http-client-engines.html#dependencies) 即可載入網路圖片。
    - 手動將這些組件新增至 `ComponentRegistry` 也是安全的。任何手動新增的組件其優先順序皆高於自動新增的組件。
    - 若有需要，可以使用 `ImageLoader.Builder.serviceLoaderEnabled(false)` 停用此行為。
- **新增**：在所有平台上支援 `coil-svg`。在 Android 上以 [AndroidSVG](https://bigbadaboom.github.io/androidsvg/) 為後盾，在非 Android 平台上則以 [SVGDOM](https://api.skia.org/classSkSVGDOM.html) 為後盾。
- Coil 現在在內部使用 Android 的 [`ImageDecoder`](https://developer.android.com/reference/android/graphics/ImageDecoder) API，當直接從檔案、資源或內容 URI 解碼時具有效能優勢。
- 修正：多項 `coil3.Uri` 剖析問題修正。
- [如需重要變更的完整清單，請參閱升級指南。](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [3.0.0-alpha01] - 2023 年 12 月 30 日 {id="3-0-0-alpha01-december-30-2023"}

- **新增**：支援 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)。Coil 現在是一個支援 Android、JVM、iOS、macOS 與 JavaScript 的 Kotlin Multiplatform 程式庫。
- Coil 的 Maven 座標已更新為 `io.coil-kt.coil3`，且其匯入已更新為 `coil3`。這允許 Coil 3 與 Coil 2 並存，而不會產生二進制相容性問題。例如，`io.coil-kt:coil:[version]` 現已變更為 `io.coil-kt.coil3:coil:[version]`。
- `coil-base` 與 `coil-compose-base` 構件分別重新命名為 `coil-core` 與 `coil-compose-core`，以符合 Coroutines、Ktor 與 AndroidX 使用的命名慣例。
- [如需重要變更的完整清單，請參閱升級指南。](https://coil-kt.github.io/coil/upgrading_to_coil3/)

## [2.5.0] - 2023 年 10 月 30 日 {id="2-5-0-october-30-2023"}

- **新增**：新增 `MediaDataSourceFetcher.Factory` 以支援在 `coil-video` 中解碼 `MediaDataSource` 實作。([#1795](https://github.com/coil-kt/coil/pull/1795))
- 將 `SHIFT6m` 裝置新增至硬體點陣圖黑名單中。([#1812](https://github.com/coil-kt/coil/pull/1812))
- 修正：防範傳回單一維度未受限大小的 Painter。([#1826](https://github.com/coil-kt/coil/pull/1826))
- 修正：當快取的標頭包含非 ASCII 字元時，在 `304 Not Modified` 後磁碟快取載入失敗的問題。([#1839](https://github.com/coil-kt/coil/pull/1839))
- 修正：`FakeImageEngine` 未更新攔截器鏈請求的問題。([#1905](https://github.com/coil-kt/coil/pull/1905))
- 更新 compile SDK 至 34。
- 更新 Kotlin 至 1.9.10。
- 更新 Coroutines 至 1.7.3。
- 更新 `accompanist-drawablepainter` 至 0.32.0。
- 更新 `androidx.annotation` 至 1.7.0。
- 更新 `androidx.compose.foundation` 至 1.5.4。
- 更新 `androidx.core` 至 1.12.0。
- 更新 `androidx.exifinterface:exifinterface` 至 1.3.6。
- 更新 `androidx.lifecycle` 至 2.6.2。
- 更新 `com.squareup.okhttp3` 至 4.12.0。
- 更新 `com.squareup.okio` 至 3.6.0。

## [2.4.0] - 2023 年 5 月 21 日 {id="2-4-0-may-21-2023"}

- 將 `DiskCache` 的 `get`/`edit` 重新命名為 `openSnapshot`/`openEditor`。
- 在 `AsyncImagePainter` 中不再自動將 `ColorDrawable` 轉換為 `ColorPainter`。
- 為簡單的 `AsyncImage` 多載加上 `@NonRestartableComposable` 註解。
- 修正：在 `ImageSource` 中延遲呼叫 `Context.cacheDir`。
- 修正：修正發布 `coil-bom` 的問題。
- 修正：修正若停用硬體點陣圖時，一律將點陣圖組態設為 `ARGB_8888` 的問題。
- 更新 Kotlin 至 1.8.21。
- 更新 Coroutines 至 1.7.1。
- 更新 `accompanist-drawablepainter` 至 0.30.1。
- 更新 `androidx.compose.foundation` 至 1.4.3。
- 更新 `androidx.profileinstaller:profileinstaller` 至 1.3.1。
- 更新 `com.squareup.okhttp3` 至 4.11.0。

## [2.3.0] - 2023 年 3 月 25 日 {id="2-3-0-march-25-2023"}

- **新增**：引入新的 `coil-test` 構件，其中包含 `FakeImageLoaderEngine`。此類別可用於寫死圖片載入器回應，以確保在測試中獲得一致且同步（來自主執行緒）的回應。詳情請見[此處](https://coil-kt.github.io/coil/testing)。
- **新增**：為 `coil-base`（`coil` 的子模組）與 `coil-compose-base`（`coil-compose` 的子模組）新增 [基準設定檔 (baseline profiles)](https://developer.android.com/topic/performance/baselineprofiles/overview)。
    - 這提升了 Coil 的執行階段效能，並應根據 Coil 在應用程式中的使用方式提供[更好的畫格時間表現](https://github.com/coil-kt/coil/tree/main/coil-benchmark/benchmark_output.md)。
- 修正：修正剖析包含編碼資料的 `file://` URI 的問題。[#1601](https://github.com/coil-kt/coil/pull/1601)
- 修正：若傳入不存在的目錄，`DiskCache` 現在能正確計算其最大容量。[#1620](https://github.com/coil-kt/coil/pull/1620)
- 將 `Coil.reset` 設為公開 API。[#1506](https://github.com/coil-kt/coil/pull/1506)
- 啟用 Java 預設方法產生。[#1491](https://github.com/coil-kt/coil/pull/1491)
- 更新 Kotlin 至 1.8.10。
- 更新 `accompanist-drawablepainter` 至 0.30.0。
- 更新 `androidx.annotation` 至 1.6.0。
- 更新 `androidx.appcompat:appcompat-resources` 至 1.6.1。
- 更新 `androidx.compose.foundation` 至 1.4.0。
- 更新 `androidx.core` 至 1.9.0。
- 更新 `androidx.exifinterface:exifinterface` 至 1.3.6。
- 更新 `androidx.lifecycle` 至 2.6.1。
- 更新 `okio` 至 3.3.0。

## [2.2.2] - 2022 年 10 月 1 日 {id="2-2-2-october-1-2022"}

- 確保圖片載入器在註冊其系統回呼之前已完全初始化。[#1465](https://github.com/coil-kt/coil/pull/1465)
- 在 API 30+ 上的 `VideoFrameDecoder` 中設定偏好的點陣圖組態以避免色階斷層。[#1487](https://github.com/coil-kt/coil/pull/1487)
- 修正 `FileUriMapper` 中剖析包含 `#` 的路徑問題。[#1466](https://github.com/coil-kt/coil/pull/1466)
- 修正從磁碟快取讀取包含非 ASCII 標頭的回應問題。[#1468](https://github.com/coil-kt/coil/pull/1468)
- 修正解碼位於 asset 子資料夾內的影片問題。[#1489](https://github.com/coil-kt/coil/pull/1489)
- 更新 `androidx.annotation` 至 1.5.0。

## [2.2.1] - 2022 年 9 月 8 日 {id="2-2-1-september-8-2022"}

- 修正：`RoundedCornersTransformation` 現在能正確縮放 `input` 點陣圖。
- 移除對 `kotlin-parcelize` 外掛程式的依賴。
- 更新 compile SDK 至 33。
- 將 `androidx.appcompat:appcompat-resources` 降級至 1.4.2 以規避 [#1423](https://github.com/coil-kt/coil/issues/1423)。

## [2.2.0] - 2022 年 8 月 16 日 {id="2-2-0-august-16-2022"}

- **新增**：在 `coil-video` 中新增 `ImageRequest.videoFramePercent`，支援將影片畫格指定為影片總時長的百分比。
- **新增**：新增 `ExifOrientationPolicy` 以設定 `BitmapFactoryDecoder` 如何處理 EXIF 方向資料。
- 修正：傳入未定義維度的大小給 `RoundedCornersTransformation` 時不再擲出例外狀況。
- 修正：將 GIF 的畫格延遲讀取為兩個無正負號位元組，而非一個有正負號位元組。
- 更新 Kotlin 至 1.7.10。
- 更新 Coroutines 至 1.6.4。
- 更新 Compose 至 1.2.1。
- 更新 OkHttp 至 4.10.0。
- 更新 Okio 至 3.2.0。
- 更新 `accompanist-drawablepainter` 至 0.25.1。
- 更新 `androidx.annotation` 至 1.4.0。
- 更新 `androidx.appcompat:appcompat-resources` 至 1.5.0。
- 更新 `androidx.core` 至 1.8.0。

## [2.1.0] - 2022 年 5 月 17 日 {id="2-1-0-may-17-2022"}

- **新增**：支援載入 `ByteArray`。([#1202](https://github.com/coil-kt/coil/pull/1202))
- **新增**：支援使用 `ImageRequest.Builder.css` 為 SVG 設定自訂 CSS 規則。([#1210](https://github.com/coil-kt/coil/pull/1210))
- 修正：將 `GenericViewTarget` 的 private 方法轉換為 protected。([#1273](https://github.com/coil-kt/coil/pull/1273))
- 更新 compile SDK 至 32。([#1268](https://github.com/coil-kt/coil/pull/1268))

## [2.0.0] - 2022 年 5 月 10 日 {id="2-0-0-may-10-2022"}

Coil 2.0.0 是此程式庫的重大迭代版本，包含破壞性變更。升級方法請參閱[升級指南](https://coil-kt.github.io/coil/upgrading/)。

- **新增**：在 `coil-compose` 中引入 `AsyncImage`。詳情請參閱[說明文件](https://coil-kt.github.io/coil/compose/)。

```kotlin
// 顯示網路圖片。
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
)

// 顯示網路圖片，並附帶占位符號、圓形裁剪和淡入淡出動畫。
AsyncImage(
    model = ImageRequest.Builder(LocalContext.current)
        .data("https://example.com/image.jpg")
        .crossfade(true)
        .build(),
    placeholder = painterResource(R.drawable.placeholder),
    contentDescription = stringResource(R.string.description),
    contentScale = ContentScale.Crop,
    modifier = Modifier.clip(CircleShape)
)
```

- **新增**：引入公開的 `DiskCache` API。
    - 使用 `ImageLoader.Builder.diskCache` 與 `DiskCache.Builder` 設定磁碟快取。
    - 在 Coil 2.0 中不應搭配使用 OkHttp 的 `Cache`。詳情請見[此處](https://coil-kt.github.io/coil/upgrading_to_coil2/#disk-cache)。
    - 仍支援 `Cache-Control` 及其他快取標頭——但 `Vary` 標頭除外，因為快取僅檢查 URL 是否相符。此外，僅快取回應碼在 [200..300) 範圍內的回應。
    - 升級至 2.0 時，現有的磁碟快取將被清除。
- 最低支援 API 現在為 21。
- `ImageRequest` 的預設 `Scale` 現為 `Scale.FIT`。
    - 進行此變更是為了讓 `ImageRequest.scale` 與其他具有預設 `Scale` 的類別保持一致。
    - 具有 `ImageViewTarget` 的請求仍會自動偵測其 `Scale`。
- 重構圖片管線（pipeline）類別：
    - `Mapper`、`Fetcher` 與 `Decoder` 經過重構以具備更高彈性。
    - `Fetcher.key` 已替換為新的 `Keyer` 介面。`Keyer` 負責從輸入資料建立快取索引鍵。
    - 新增 `ImageSource`，允許 `Decoder` 使用 Okio 的檔案系統 API 直接讀取 `File`。
- 重構 Jetpack Compose 整合：
    - `rememberImagePainter` 與 `ImagePainter` 分別重新命名為 `rememberAsyncImagePainter` 與 `AsyncImagePainter`。
    - 棄用 `LocalImageLoader`。詳情請參閱棄用訊息。
- 停用產生執行階段非空值判斷提示（not-null assertions）。
    - 若你使用 Java，將 null 作為非 null 註解的引數傳遞給函式時，將不再立即擲出 `NullPointerException`。Kotlin 的編譯期 null 安全性可防止這種情況發生。
    - 此變更縮減了程式庫的大小。
- `Size` 現在由其寬度與高度的兩個 `Dimension` 值組成。`Dimension` 可以是正像素值或 `Dimension.Undefined`。詳情請見[此處](https://coil-kt.github.io/coil/upgrading/#size-refactor)。
- 從程式庫中移除了 `BitmapPool` 與 `PoolableViewTarget`。
- 從程式庫中移除了 `VideoFrameFileFetcher` 與 `VideoFrameUriFetcher`。請改用支援所有資料來源的 `VideoFrameDecoder`。
- 從程式庫中移除了 [`BlurTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/BlurTransformation.kt) 與 [`GrayscaleTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/GrayscaleTransformation.kt)。若你有使用它們，可將其程式碼複製到專案中。
- 將 `Transition.transition` 改為非暫停函式，因為不再需要暫停轉場直到其完成。
- 新增對 `bitmapFactoryMaxParallelism` 的支援，用於限制進行中 `BitmapFactory` 操作的最大數量。此值預設為 4，可提升 UI 效能。
- 新增對 `interceptorDispatcher`、`fetcherDispatcher`、`decoderDispatcher` 與 `transformationDispatcher` 的支援。
- 新增 `GenericViewTarget`，用於處理常見的 `ViewTarget` 邏輯。
- 將 `ByteBuffer` 新增至預設支援的資料型別中。
- `Disposable` 已重構，並公開底層 `ImageRequest` 的 Job。
- 重構 `MemoryCache` API。
- 若 `ImageRequest.fallback` 為 null，現在會在 `Target` 上設定 `ImageRequest.error`。
- `Transformation.key` 替換為 `Transformation.cacheKey`。
- 更新 Kotlin 至 1.6.10。
- 更新 Compose 至 1.1.1。
- 更新 OkHttp 至 4.9.3。
- 更新 Okio 至 3.0.0。

自 `2.0.0-rc03` 以來的變更：
- 將 `Dimension.Original` 轉換為 `Dimension.Undefined`。
    - 這略微改變了非像素維度的語意，以修正大小系統中的某些邊緣情況（[範例](https://github.com/coil-kt/coil/issues/1246)）。
- 若 ContentScale 為 None，則使用 `Size.ORIGINAL` 載入圖片。
- 修正優先套用 `ImageView.load` builder 引數而非最後套用的問題。
- 修正回應未修改（not modified）時未合併 HTTP 標頭的問題。

## [2.0.0-rc03] - 2022 年 4 月 11 日 {id="2-0-0-rc03-april-11-2022"}

- 移除 `ScaleResolver` 介面。
- 將 `Size` 建構函式轉換為函式。
- 將 `Dimension.Pixels` 的 `toString` 改為僅顯示其像素值。
- 防範 `SystemCallbacks.onTrimMemory` 中罕見的崩潰。
- 更新 Coroutines 至 1.6.1。

## [2.0.0-rc02] - 2022 年 3 月 20 日 {id="2-0-0-rc02-march-20-2022"}

- 將 `ImageRequest` 的預設大小還原為目前螢幕的大小，而非 `Size.ORIGINAL`。
- 修正 `DiskCache.Builder` 被標記為實驗性的問題。僅 `DiskCache` 的方法屬於實驗性。
- 修正將圖片載入到其中一個維度為 `WRAP_CONTENT` 的 `ImageView` 時，會以原始大小載入圖片而非縮放以符合有界限維度的問題。
- 從 `MemoryCache.Key`、`MemoryCache.Value` 與 `Parameters.Entry` 中移除組件函式（component functions）。

## [2.0.0-rc01] - 2022 年 3 月 2 日 {id="2-0-0-rc01-march-2-2022"}

自 `1.4.0` 以來的重大變更：

- 最低支援 API 現在為 21。
- 重構 Jetpack Compose 整合。
    - `rememberImagePainter` 已重新命名為 `rememberAsyncImagePainter`。
    - 新增對 `AsyncImage` 與 `SubcomposeAsyncImage` 的支援。詳情請參閱[說明文件](https://coil-kt.github.io/coil/compose/)。
    - 棄用 `LocalImageLoader`。詳情請參閱棄用訊息。
- Coil 2.0 擁有自己的磁碟快取實作，不再依賴 OkHttp 進行磁碟快取。
    - 使用 `ImageLoader.Builder.diskCache` 與 `DiskCache.Builder` 設定磁碟快取。
    - 你**不應**在 Coil 2.0 中使用 OkHttp 的 `Cache`，因為若執行緒在寫入時被中斷，快取可能會損毀。
    - 仍支援 `Cache-Control` 及其他快取標頭——但 `Vary` 標頭除外，因為快取僅檢查 URL 是否相符。此外，僅快取回應碼在 [200..300) 範圍內的回應。
    - 升級至 2.0 時，現有的磁碟快取將被清除。
- `ImageRequest` 的預設 `Scale` 現為 `Scale.FIT`。
    - 進行此變更是為了讓 `ImageRequest.scale` 與其他具有預設 `Scale` 的類別保持一致。
    - 具有 `ImageViewTarget` 的請求仍會自動偵測其縮放比例。
- `ImageRequest` 的預設大小現為 `Size.ORIGINAL`。
- 重構圖片管線類別：
    - `Mapper`、`Fetcher` 與 `Decoder` 經過重構以具備更高彈性。
    - `Fetcher.key` 已替換為新的 `Keyer` 介面。`Keyer` 負責從輸入資料建立快取索引鍵。
    - 新增 `ImageSource`，允許 `Decoder` 直接使用 Okio 的檔案系統 API 讀取 `File`。
- 停用產生執行階段非空值判斷提示。
    - 若你使用 Java，將 null 作為非 null 註解的參數傳遞給函式時，將不再立即擲出 `NullPointerException`。Kotlin 的編譯期 null 安全性可防止這種情況發生。
    - 此變更縮減了程式庫的大小。
- `Size` 現在由其寬度與高度的兩個 `Dimension` 值組成。`Dimension` 可以是正像素值或 `Dimension.Original`。
- 從程式庫中移除了 `BitmapPool` 與 `PoolableViewTarget`。
- 從程式庫中移除了 `VideoFrameFileFetcher` 與 `VideoFrameUriFetcher`。請改用支援所有資料來源的 `VideoFrameDecoder`。
- 從程式庫中移除了 [`BlurTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/BlurTransformation.kt) 與 [`GrayscaleTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/GrayscaleTransformation.kt)。若你有使用它們，可將其程式碼複製到專案中。
- 將 `Transition.transition` 改為非暫停函式，因為不再需要暫停轉場直到其完成。
- 新增對 `bitmapFactoryMaxParallelism` 的支援，用於限制進行中 `BitmapFactory` 操作的最大數量。此值預設為 4，可提升 UI 效能。
- 新增對 `interceptorDispatcher`、`fetcherDispatcher`、`decoderDispatcher` 與 `transformationDispatcher` 的支援。
- 新增 `GenericViewTarget`，用於處理常見的 `ViewTarget` 邏輯。
- 將 `ByteBuffer` 新增至預設支援的資料型別中。
- `Disposable` 已重構，並公開底層 `ImageRequest` 的 Job。
- 重構 `MemoryCache` API。
- 若 `ImageRequest.fallback` 為 null，現在會在 `Target` 上設定 `ImageRequest.error`。
- `Transformation.key` 替換為 `Transformation.cacheKey`。
- 更新 Kotlin 至 1.6.10。
- 更新 Compose 至 1.1.1。
- 更新 OkHttp 至 4.9.3。
- 更新 Okio 至 3.0.0。

自 `2.0.0-alpha09` 以來的變更：

- 移除 `-Xjvm-default=all` 編譯器旗標。
- 修正當同時執行多個帶有 must-revalidate/e-tag 的請求時圖片載入失敗的問題。
- 修正當 `<svg` 標籤後有換行符號時，`DecodeUtils.isSvg` 傳回 false 的問題。
- 讓 `LocalImageLoader.provides` 的棄用訊息更加明確。
- 更新 Compose 至 1.1.1。
- 更新 `accompanist-drawablepainter` 至 0.23.1。

## [2.0.0-alpha09] - 2022 年 2 月 16 日 {id="2-0-0-alpha09-february-16-2022"}

- 修正 `AsyncImage` 建立無效條件約束的問題。([#1134](https://github.com/coil-kt/coil/pull/1134))
- 為 `AsyncImagePainter` 新增 `ContentScale` 引數。([#1144](https://github.com/coil-kt/coil/pull/1144))
    - 這應設定為與 `Image` 上設定的相同值，以確保圖片以正確的大小載入。
- 新增 `ScaleResolver` 以支援延遲解析 `ImageRequest` 的 `Scale`。([#1134](https://github.com/coil-kt/coil/pull/1134))
    - `ImageRequest.scale` 應由 `ImageRequest.scaleResolver.scale()` 取代。
- 更新 Compose 至 1.1.0。
- 更新 `accompanist-drawablepainter` 至 0.23.0。
- 更新 `androidx.lifecycle` 至 2.4.1。

## [2.0.0-alpha08] - 2022 年 2 月 7 日 {id="2-0-0-alpha08-february-7-2022"}

- 更新 `DiskCache` 與 `ImageSource` 以使用 Okio 的 `FileSystem` API。([#1115](https://github.com/coil-kt/coil/pull/1115))

## [2.0.0-alpha07] - 2022 年 1 月 30 日 {id="2-0-0-alpha07-january-30-2022"}

- 大幅提升 `AsyncImage` 效能，並將 `AsyncImage` 拆分為 `AsyncImage` 與 `SubcomposeAsyncImage`。([#1048](https://github.com/coil-kt/coil/pull/1048))
    - `SubcomposeAsyncImage` 提供 `loading`/`success`/`error`/`content` 插槽（slot）API，並使用效能較差的子組合（subcomposition）。
    - `AsyncImage` 提供 `placeholder`/`error`/`fallback` 引數，用於覆寫在載入中或請求失敗時繪製的 `Painter`。`AsyncImage` 不使用子組合，效能遠優於 `SubcomposeAsyncImage`。
    - 從 `SubcomposeAsyncImage.content` 中移除 `AsyncImagePainter.State` 引數。如有需要請使用 `painter.state`。
    - 為 `AsyncImage` 與 `SubcomposeAsyncImage` 新增 `onLoading`/`onSuccess`/`onError` 回呼。
- 棄用 `LocalImageLoader`。([#1101](https://github.com/coil-kt/coil/pull/1101))
- 新增對 `ImageRequest.tags` 的支援。([#1066](https://github.com/coil-kt/coil/pull/1066))
- 將 `DecodeUtils` 中的 `isGif`、`isWebP`、`isAnimatedWebP`、`isHeif` 與 `isAnimatedHeif` 移至 coil-gif。將 `isSvg` 新增至 coil-svg。([#1117](https://github.com/coil-kt/coil/pull/1117))
- 將 `FetchResult` 與 `DecodeResult` 轉換為非資料類別（non-data classes）。([#1114](https://github.com/coil-kt/coil/pull/1114))
- 移除未使用的 `DiskCache.Builder` context 引數。([#1099](https://github.com/coil-kt/coil/pull/1099))
- 修正具有原始大小的點陣圖資源縮放問題。([#1072](https://github.com/coil-kt/coil/pull/1072))
- 修正 `ImageDecoderDecoder` 中未關閉 `ImageDecoder` 的問題。([#1109](https://github.com/coil-kt/coil/pull/1109))
- 修正將 Drawable 轉換為點陣圖時縮放比例錯誤的問題。([#1084](https://github.com/coil-kt/coil/pull/1084))
- 更新 Compose 至 1.1.0-rc03。
- 更新 `accompanist-drawablepainter` 至 0.22.1-rc。
- 更新 `androidx.appcompat:appcompat-resources` 至 1.4.1。

## [2.0.0-alpha06] - 2021 年 12 月 24 日 {id="2-0-0-alpha06-december-24-2021"}

- 新增 `ImageSource.Metadata`，支援在不需緩衝或暫存檔的情況下，從 asset、resource 和內容 URI 進行解碼。([#1060](https://github.com/coil-kt/coil/pull/1060))
- 延遲執行圖片請求，直到 `AsyncImage` 具有正值的條件約束。([#1028](https://github.com/coil-kt/coil/pull/1028))
- 修正若同時設定了 `loading`、`success` 與 `error`，`AsyncImage` 使用 `DefaultContent` 的問題。([#1026](https://github.com/coil-kt/coil/pull/1026))
- 使用 AndroidX 的 `LruCache` 取代平台的 `LruCache`。([#1047](https://github.com/coil-kt/coil/pull/1047))
- 更新 Kotlin 至 1.6.10。
- 更新 Coroutines 至 1.6.0。
- 更新 Compose 至 1.1.0-rc01。
- 更新 `accompanist-drawablepainter` 至 0.22.0-rc。
- 更新 `androidx.collection` 至 1.2.0。

## [2.0.0-alpha05] - 2021 年 11 月 28 日 {id="2-0-0-alpha05-november-28-2021"}

- **重要**：重構 `Size` 以支援任一維度使用圖片的原始大小。
    - `Size` 現在由其寬度與高度的兩個 `Dimension` 值組成。`Dimension` 可以是正像素值或 `Dimension.Original`。
    - 進行此變更是為了在一個維度為固定像素值時，更好地支援未受限的寬度／高度值（例如 `wrap_content`、`Constraints.Infinity`）。
- 修正：支援 `AsyncImage` 的檢查模式（預覽）。
- 修正：若 `imageLoader.memoryCache` 為 null，`SuccessResult.memoryCacheKey` 應始終為 `null`。
- 將 `ImageLoader`、`SizeResolver` 與 `ViewSizeResolver` 類似建構函式的 `invoke` 函式轉換為頂層函式。
- 將 `CrossfadeDrawable` 的起始與結束 drawable 設為公開 API。
- 複製修改（Mutate）`ImageLoader` 的 placeholder/error/fallback drawables。
- 為 `SuccessResult` 的建構函式新增預設引數。
- 改為依賴 `androidx.collection` 而非 `androidx.collection-ktx`。
- 更新 OkHttp 至 4.9.3。

## [2.0.0-alpha04] - 2021 年 11 月 22 日 {id="2-0-0-alpha04-november-22-2021"}

- **新增**：在 `coil-compose` 中新增 `AsyncImage`。
    - `AsyncImage` 是一個非同步執行 `ImageRequest` 並算繪結果的可組合項。
    - **`AsyncImage` 旨在多數使用案例中取代 `rememberImagePainter`。**
    - 其 API 尚未定案，在 2.0 正式版發布前可能會有所變動。
    - 它具有與 `Image` 類似的 API，並支援相同的引數：`Alignment`、`ContentScale`、`alpha`、`ColorFilter` 與 `FilterQuality`。
    - 它支援使用 `content`、`loading`、`success` 與 `error` 引數覆寫針對每個 `AsyncImagePainter` 狀態所繪製的內容。
    - 它修正了 `rememberImagePainter` 在解析圖片大小和縮放比例時存在的許多設計問題。
    - 使用範例：

```kotlin
// 僅繪製圖片。
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null, // 儘量避免使用 `null`，建議設定為本地化字串。
)

// 繪製帶有圓形裁剪、淡入淡出的圖片，並覆寫 `loading` 狀態。
AsyncImage(
    model = ImageRequest.Builder(LocalContext.current)
        .data("https://example.com/image.jpg")
        .crossfade(true)
        .build(),
    contentDescription = null,
    modifier = Modifier
        .clip(CircleShape),
    loading = {
        CircularProgressIndicator()
    },
    contentScale = ContentScale.Crop
)

// 繪製帶有圓形裁剪、淡入淡出的圖片，並覆寫所有狀態。
AsyncImage(
    model = ImageRequest.Builder(LocalContext.current)
        .data("https://example.com/image.jpg")
        .crossfade(true)
        .build(),
    contentDescription = null,
    modifier = Modifier
        .clip(CircleShape),
    contentScale = ContentScale.Crop
) { state ->
    if (state is AsyncImagePainter.State.Loading) {
        CircularProgressIndicator()
    } else {
        AsyncImageContent() // 繪製圖片。
    }
}
```

- **重要**：將 `ImagePainter` 重新命名為 `AsyncImagePainter`，並將 `rememberImagePainter` 重新命名為 `rememberAsyncImagePainter`。
    - 不再支援 `ExecuteCallback`。若要讓 `AsyncImagePainter` 略過等待呼叫 `onDraw`，請改為設定 `ImageRequest.size(OriginalSize)`（或任何指定大小）。
    - 為 `rememberAsyncImagePainter` 新增選用的 `FilterQuality` 引數。
- 在 `DiskCache` 中使用協同程式執行清理操作，並新增 `DiskCache.Builder.cleanupDispatcher`。
- 修正使用 `ImageLoader.Builder.placeholder` 設定占位符號時的 Compose 預覽。
- 為 `LocalImageLoader.current` 標記 `@ReadOnlyComposable` 以產生更具效率的程式碼。
- 更新 Compose 至 1.1.0-beta03，並改為依賴 `compose.foundation` 而非 `compose.ui`。
- 更新 `androidx.appcompat-resources` 至 1.4.0。

## [2.0.0-alpha03] - 2021 年 11 月 12 日 {id="2-0-0-alpha03-november-12-2021"}

- 新增在 Android 29+ 上載入音樂縮圖的功能。([#967](https://github.com/coil-kt/coil/pull/967))
- 修正：使用 `context.resources` 載入目前套件的資源。([#968](https://github.com/coil-kt/coil/pull/968))
- 修正：`clear` -> `dispose` 的取代運算式。([#970](https://github.com/coil-kt/coil/pull/970))
- 更新 Compose 至 1.0.5。
- 更新 `accompanist-drawablepainter` 至 0.20.2。
- 更新 Okio 至 3.0.0。
- 更新 `androidx.annotation` 至 1.3.0。
- 更新 `androidx.core` 至 1.7.0。
- 更新 `androidx.lifecycle` 至 2.4.0。
    - 移除對 `lifecycle-common-java8` 的依賴，因為它已合併至 `lifecycle-common`。

## [2.0.0-alpha02] - 2021 年 10 月 24 日 {id="2-0-0-alpha02-october-24-2021"}

- 新增包含[軟體包清單 (Bill of Materials, BOM)](https://docs.gradle.org/7.2/userguide/platforms.html#sub:bom_import) 的新 `coil-bom` 構件。
    - 匯入 `coil-bom` 可讓你在依賴其他 Coil 構件時無需指定版本。
- 修正使用 `ExecuteCallback.Immediate` 時圖片載入失敗的問題。
- 更新 Okio 至 3.0.0-alpha.11。
    - 這同時解決了與 Okio 3.0.0-alpha.11 的相容性問題。
- 更新 Kotlin 至 1.5.31。
- 更新 Compose 至 1.0.4。

## [2.0.0-alpha01] - 2021 年 10 月 11 日 {id="2-0-0-alpha01-october-11-2021"}

Coil 2.0.0 是此程式庫的下一個重大迭代版本，具備新功能、效能改進、API 改進以及多項錯誤修正。在 2.0.0 穩定版發布之前，此版本可能與未來的 Alpha 版本存在二進制／原始碼層級的不相容。

- **重要**：最低支援 API 現在為 21。
- **重要**：啟用 `-Xjvm-default=all`。
    - 這將產生 Java 8 預設方法，而非使用 Kotlin 的預設介面方法支援。詳情請參閱[此部落格文章](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/)。
    - **你也需要在組建檔案中新增 `-Xjvm-default=all` 或 `-Xjvm-default=all-compatibility`。** 操作方法請參閱[此處](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8)。
- **重要**：Coil 現在擁有自己的磁碟快取實作，不再依賴 OkHttp 進行磁碟快取。
    - 進行此變更是為了：
        - 更好地支援解碼圖片時的執行緒中斷。這改善了當圖片請求快速連續啟動和停止時的效能。
        - 支援公開由 `File` 支援的 `ImageSource`。當 Android API 需要 `File` 來解碼時（例如 `MediaMetadataRetriever`），這可避免不必要的複製操作。
        - 支援直接讀取／寫入磁碟快取檔案。
    - 使用 `ImageLoader.Builder.diskCache` 與 `DiskCache.Builder` 設定磁碟快取。
    - 你**不應**在 Coil 2.0 中使用 OkHttp 的 `Cache`，因為若寫入時受到中斷，它可能會損毀。
    - 仍支援 `Cache-Control` 及其他快取標頭——但 `Vary` 標頭除外，因為快取僅檢查 URL 是否相符。此外，僅快取回應碼在 [200..300) 範圍內的回應。
    - 可使用 `ImageLoader.Builder.respectCacheHeaders` 啟用或停用對快取標頭的支援。
    - 升級至 2.0 時，現有的磁碟快取將被清除並重建。
- **重要**：`ImageRequest` 的預設 `Scale` 現為 `Scale.FIT`。
    - 進行此變更是為了讓 `ImageRequest.scale` 與其他具有預設 `Scale` 的類別保持一致。
    - 具有 `ImageViewTarget` 的請求仍會自動偵測其縮放比例。
- 圖片管線類別的重大變更：
    - `Mapper`、`Fetcher` 與 `Decoder` 經過重構以具備更高彈性。
    - `Fetcher.key` 已替換為新的 `Keyer` 介面。`Keyer` 負責從輸入資料建立快取索引鍵。
    - 新增 `ImageSource`，允許 `Decoder` 直接解碼 `File`。
- 從程式庫中移除了 `BitmapPool` 與 `PoolableViewTarget`。移除點陣圖池（Bitmap pooling）的原因如下：
    - 它在 <= API 23 上最為有效，但在較新的 Android 版本上效果逐漸降低。
    - 移除點陣圖池允許 Coil 使用不可變點陣圖，這具有效能優勢。
    - 管理點陣圖池會產生執行階段開銷。
    - 點陣圖池會對 Coil 的 API 產生設計限制，因為它需要追蹤點陣圖是否符合入池條件。移除點陣圖池允許 Coil 在更多位置公開產生的 `Drawable`（例如 `Listener`、`Disposable`）。此外，這意味著 Coil 不必清除 `ImageView`，後者過去曾引發一些[問題](https://github.com/coil-kt/coil/issues/650)。
    - 點陣圖池[容易出錯](https://github.com/coil-kt/coil/issues/546)。配置新的點陣圖遠比嘗試重複使用可能仍在使用的點陣圖要安全得多。
- `MemoryCache` 經過重構以具備更高彈性。
- 停用產生執行階段非空值判斷提示。
    - 若你使用 Java，將 null 作為非 null 註解的參數傳遞給函式時，將不再立即擲出 `NullPointerException`。若你使用 Kotlin，實質上沒有任何變更。
    - 此變更縮減了程式庫的大小。
- 從程式庫中移除了 `VideoFrameFileFetcher` 與 `VideoFrameUriFetcher`。請改用支援所有資料來源的 `VideoFrameDecoder`。
- 新增對 `bitmapFactoryMaxParallelism` 的支援，用於限制進行中 `BitmapFactory` 操作的最大數量。此值預設為 4，可提升 UI 效能。
- 新增對 `interceptorDispatcher`、`fetcherDispatcher`、`decoderDispatcher` 與 `transformationDispatcher` 的支援。
- `Disposable` 已重構，並公開底層 `ImageRequest` 的 Job。
- 將 `Transition.transition` 改為非暫停函式，因為不再需要暫停轉場直到其完成。
- 新增 `GenericViewTarget`，用於處理常見的 `ViewTarget` 邏輯。
- 從程式庫中移除了 [`BlurTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/BlurTransformation.kt) 與 [`GrayscaleTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/GrayscaleTransformation.kt)。
    - 若你有使用它們，可將其程式碼複製到專案中。
- 若 `ImageRequest.fallback` 為 null，現在會在 `Target` 上設定 `ImageRequest.error`。
- `Transformation.key` 替換為 `Transformation.cacheKey`。
- `ImageRequest.Listener` 在 `onSuccess` 與 `onError` 中分別傳回 `SuccessResult`/`ErrorResult`。
- 將 `ByteBuffer` 新增至預設支援的資料型別中。
- 從多個類別中移除 `toString` 實作。
- 更新 OkHttp 至 4.9.2。
- 更新 Okio 至 3.0.0-alpha.10。

## [1.4.0] - 2021 年 10 月 6 日 {id="1-4-0-october-6-2021"}

- **新增**：在 `ImagePainter.State.Success` 與 `ImagePainter.State.Error` 中新增 `ImageResult`。([#887](https://github.com/coil-kt/coil/pull/887))
    - 這對 `ImagePainter.State.Success` 與 `ImagePainter.State.Error` 的簽章而言屬於二進制不相容變更，但這些 API 原本就被標記為實驗性。
- 僅在 `View.isShown` 為 `true` 時才執行 `CrossfadeTransition`。先前僅檢查 `View.isVisible`。([#898](https://github.com/coil-kt/coil/pull/898))
- 修正因四捨五入問題導致縮放倍數略小於 1 時，潛在的記憶體快取未命中問題。([#899](https://github.com/coil-kt/coil/pull/899))
- 將非內嵌的 `ComponentRegistry` 方法設為公開。([#925](https://github.com/coil-kt/coil/pull/925))
- 改為依賴 `accompanist-drawablepainter`，並移除 Coil 自訂的 `DrawablePainter` 實作。([#845](https://github.com/coil-kt/coil/pull/845))
- 移除某個 Java 8 方法的使用，以防範脫糖（desugaring）問題。([#924](https://github.com/coil-kt/coil/pull/924))
- 將 `ImagePainter.ExecuteCallback` 提升為穩定 API。([#927](https://github.com/coil-kt/coil/pull/927))
- 更新 compileSdk 至 31。
- 更新 Kotlin 至 1.5.30。
- 更新 Coroutines 至 1.5.2。
- 更新 Compose 至 1.0.3。

## [1.3.2] - 2021 年 8 月 4 日 {id="1-3-2-august-4-2021"}

- `coil-compose` 現在依賴 `compose.ui` 而非 `compose.foundation`。
    - 由於 `compose.ui` 是 `compose.foundation` 的子集，因此其相依性體積更小。
- 更新 Jetpack Compose 至 1.0.1。
- 更新 Kotlin 至 1.5.21。
- 更新 Coroutines 至 1.5.1。
- 更新 `androidx.exifinterface:exifinterface` 至 1.3.3。

## [1.3.1] - 2021 年 7 月 28 日 {id="1-3-1-july-28-2021"}

- 更新 Jetpack Compose 至 `1.0.0`。熱烈祝賀 Compose 團隊推出[穩定版](https://android-developers.googleblog.com/2021/07/jetpack-compose-announcement.html)！
- 更新 `androidx.appcompat:appcompat-resources` 至 1.3.1。

## [1.3.0] - 2021 年 7 月 10 日 {id="1-3-0-july-10-2021"}

- **新增**：新增對 [Jetpack Compose](https://developer.android.com/jetpack/compose) 的支援。以 [Accompanist](https://github.com/google/accompanist/) 的 Coil 整合為基礎，但進行了許多修改。詳情請參閱[說明文件](https://coil-kt.github.io/coil/compose/)。
- 新增 `allowConversionToBitmap`，以啟用／停用針對 `Transformation` 的自動點陣圖轉換。([#775](https://github.com/coil-kt/coil/pull/775))
- 為 `ImageDecoderDecoder` 與 `GifDecoder` 新增 `enforceMinimumFrameDelay`，以支援在 GIF 畫格延遲低於閾值時重寫該延遲。([#783](https://github.com/coil-kt/coil/pull/783))
    - 此功能預設停用，但在未來版本中將預設啟用。
- 新增對啟用／停用 `ImageLoader` 內部網路觀察程式的支援。([#741](https://github.com/coil-kt/coil/pull/741))
- 修正 `BitmapFactoryDecoder` 解碼出的點陣圖密度。([#776](https://github.com/coil-kt/coil/pull/776))
- 修正 Licensee 找不到 Coil 授權 URL 的問題。([#774](https://github.com/coil-kt/coil/pull/774))
- 更新 `androidx.core:core-ktx` 至 1.6.0。

## [1.2.2] - 2021 年 6 月 4 日 {id="1-2-2-june-4-2021"}

- 修正將具有共用狀態的 Drawable 轉換為點陣圖時的競爭條件。([#771](https://github.com/coil-kt/coil/pull/771))
- 修正 `ImageLoader.Builder.fallback` 設定了 `error` drawable 而非 `fallback` drawable 的問題。
- 修正 `ResourceUriFetcher` 傳回不正確資料來源的問題。([#770](https://github.com/coil-kt/coil/pull/770))
- 修正 API 26 與 27 上無可用檔案描述符的日誌檢查。
- 修正平台向量 Drawable 支援的不正確版本檢查。([#751](https://github.com/coil-kt/coil/pull/751))
- 更新 Kotlin (1.5.10)。
- 更新 Coroutines (1.5.0)。
- 更新 `androidx.appcompat:appcompat-resources` 至 1.3.0。
- 更新 `androidx.core:core-ktx` 至 1.5.0。

## [1.2.1] - 2021 年 4 月 27 日 {id="1-2-1-april-27-2021"}

- 修正 `VideoFrameUriFetcher` 嘗試處理 http/https URI 的問題。([#734](https://github.com/coil-kt/coil/pull/734))

## [1.2.0] - 2021 年 4 月 12 日 {id="1-2-0-april-12-2021"}

- **重要**：在 `SvgDecoder` 中改用 SVG 的檢視邊界（view bounds）來計算其長寬比。([#688](https://github.com/coil-kt/coil/pull/688))
    - 先前 `SvgDecoder` 使用 SVG 的 `width`/`height` 元素來判斷其長寬比，但這並未正確遵循 SVG 規範。
    - 若要還原為舊行為，請在建構 `SvgDecoder` 時設定 `useViewBoundsAsIntrinsicSize = false`。
- **新增**：新增 `VideoFrameDecoder` 以支援從任何來源解碼影片畫格。([#689](https://github.com/coil-kt/coil/pull/689))
- **新增**：支援使用來源內容自動偵測 SVG，而非僅透過 MIME 類型判斷。([#654](https://github.com/coil-kt/coil/pull/654))
- **新增**：支援使用 `ImageLoader.newBuilder()` 共用資源。([#653](https://github.com/coil-kt/coil/pull/653))
    - 重要的是，這允許在各 `ImageLoader` 執行個體之間共用記憶體快取。
- **新增**：新增使用 `AnimatedTransformation` 對動畫圖片進行轉換的支援。([#659](https://github.com/coil-kt/coil/pull/659))
- **新增**：新增對動畫 Drawable 的開始／結束回呼支援。([#676](https://github.com/coil-kt/coil/pull/676))

---

- 修正剖析 HEIF/HEIC 檔案的 EXIF 資料問題。([#664](https://github.com/coil-kt/coil/pull/664))
- 修正若停用點陣圖池時未採用 `EmptyBitmapPool` 實作的問題。([#638](https://github.com/coil-kt/coil/pull/638))
    - 即使沒有此修正，點陣圖池仍會正常停用，但先前使用了較為重量級的 `BitmapPool` 實作。
- 修正 `MovieDrawable.getOpacity` 錯誤傳回透明的情況。([#682](https://github.com/coil-kt/coil/pull/682))
- 防範預設暫存目錄不存在的情況。([#683](https://github.com/coil-kt/coil/pull/683))

---

- 使用 JVM IR 後端進行組建。([#670](https://github.com/coil-kt/coil/pull/670))
- 更新 Kotlin (1.4.32)。
- 更新 Coroutines (1.4.3)。
- 更新 OkHttp (3.12.13)。
- 更新 `androidx.lifecycle:lifecycle-common-java8` 至 2.3.1。

## [1.1.1] - 2021 年 1 月 11 日 {id="1-1-1-january-11-2021"}

- 修正 `ViewSizeResolver.size` 因多次恢復（resume）協同程式而可能擲出 `IllegalStateException` 的情況。
- 修正從主執行緒呼叫時 `HttpFetcher` 會永久阻塞的問題。
    - 使用 `ImageRequest.dispatcher(Dispatchers.Main.immediate)` 強制在主執行緒上執行的請求將會失敗並擲出 `NetworkOnMainThreadException`，除非將 `ImageRequest.networkCachePolicy` 設定為 `CachePolicy.DISABLED` 或 `CachePolicy.WRITE_ONLY`。
- 若影片帶有旋轉元資料，則旋轉來自 `VideoFrameFetcher` 的影片畫格。
- 更新 Kotlin (1.4.21)。
- 更新 Coroutines (1.4.2)。
- 更新 Okio (2.10.0)。
- 更新 `androidx.exifinterface:exifinterface` (1.3.2)。

## [1.1.0] - 2020 年 11 月 24 日 {id="1-1-0-november-24-2020"}

- **重要**：將 `ImageView` 的 `CENTER` 與 `MATRIX` 縮放類型解析為 `OriginalSize`。([#587](https://github.com/coil-kt/coil/pull/587))
    - 此變更僅影響未明確指定請求大小時代碼的隱式大小解析演算法。
    - 進行此變更是為了確保圖片請求的視覺結果與 `ImageView.setImageResource`/`ImageView.setImageURI` 一致。若要還原為舊行為，請在建構請求時設定 `ViewSizeResolver`。
- **重要**：若 View 的版面配置參數為 `WRAP_CONTENT`，則從 `ViewSizeResolver` 傳回螢幕大小。([#562](https://github.com/coil-kt/coil/pull/562))
    - 先前我們僅在 View 完成完整版面配置後才傳回螢幕大小。此變更使一般行為更加一致且直覺。
- 新增控制 Alpha 預先相乘（pre-multiplication）的功能。([#569](https://github.com/coil-kt/coil/pull/569))
- 在 `CrossfadeDrawable` 中支援優先採用精確的固有大小。([#585](https://github.com/coil-kt/coil/pull/585))
- 檢查包含版本號在內的完整 GIF 標頭。([#564](https://github.com/coil-kt/coil/pull/564))
- 新增空的點陣圖池實作。([#561](https://github.com/coil-kt/coil/pull/561))
- 將 `EventListener.Factory` 轉換為函式介面。([#575](https://github.com/coil-kt/coil/pull/575))
- 穩定 `EventListener`。([#574](https://github.com/coil-kt/coil/pull/574))
- 為 `ImageRequest.Builder.placeholderMemoryCacheKey` 新增 `String` 多載。
- 為 `ViewSizeResolver` 建構函式新增 `@JvmOverloads`。
- 修正：在 `CrossfadeDrawable` 中複製修改（mutate）起始／結束 drawable。([#572](https://github.com/coil-kt/coil/pull/572))
- 修正：修正第二次載入時 GIF 無法播放的問題。([#577](https://github.com/coil-kt/coil/pull/534))
- 更新 Kotlin (1.4.20) 並遷移至 `kotlin-parcelize` 外掛程式。
- 更新 Coroutines (1.4.1)。

## [1.0.0] - 2020 年 10 月 22 日 {id="1-0-0-october-22-2020"}

自 `0.13.0` 以來的變更：
- 新增 `Context.imageLoader` 擴充函式。([#534](https://github.com/coil-kt/coil/pull/534))
- 新增 `ImageLoader.executeBlocking` 擴充函式。([#537](https://github.com/coil-kt/coil/pull/537))
- 被取代時不關閉先前的單例圖片載入器。([#533](https://github.com/coil-kt/coil/pull/533))

自 `1.0.0-rc3` 以來的變更：
- 修正：防範 ActivityManager 遺失／無效的情況。([#541](https://github.com/coil-kt/coil/pull/541))
- 修正：允許 OkHttp 快取失敗的回應。([#551](https://github.com/coil-kt/coil/pull/551))
- 更新 Kotlin 至 1.4.10。
- 更新 Okio 至 2.9.0。
- 更新 `androidx.exifinterface:exifinterface` 至 1.3.1。

## [1.0.0-rc3] - 2020 年 9 月 21 日 {id="1-0-0-rc3-september-21-2020"}

- 由於不穩定性，還原使用 [`-Xjvm-default=all`](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/) 編譯器旗標。
    - **相較於先前的 Release Candidate 版本，此變更在原始碼上相容，但在二進制層級不相容。**
- 新增 `Context.imageLoader` 擴充函式。([#534](https://github.com/coil-kt/coil/pull/534))
- 新增 `ImageLoader.executeBlocking` 擴充函式。([#537](https://github.com/coil-kt/coil/pull/537))
- 被取代時不關閉先前的單例圖片載入器。([#533](https://github.com/coil-kt/coil/pull/533))
- 更新 AndroidX 相依性：
    - `androidx.exifinterface:exifinterface` -> 1.3.0

## [1.0.0-rc2] - 2020 年 9 月 3 日 {id="1-0-0-rc2-september-3-2020"}

- **此版本需要 Kotlin 1.4.0 或更高版本。**
- 包含 [0.13.0](#0130-september-3-2020) 中的所有變更。
- 改為依賴基礎 Kotlin `stdlib` 而非 `stdlib-jdk8`。

## [0.13.0] - 2020 年 9 月 3 日 {id="0-13-0-september-3-2020"}

- **重要**：預設在主執行緒上啟動攔截器鏈。([#513](https://github.com/coil-kt/coil/pull/513))
    - 這在很大程度上還原了 `0.11.0` 及更低版本的行為，即在主執行緒上同步檢查記憶體快取。
    - 若要還原為 `0.12.0` 在 `ImageRequest.dispatcher` 上檢查記憶體快取的行為，請設定 `ImageLoader.Builder.launchInterceptorChainOnMainThread(false)`。
    - 詳情請參閱 [`launchInterceptorChainOnMainThread`](https://coil-kt.github.io/coil/api/coil-core/coil3/-image-loader/-builder/launch-interceptor-chain-on-main-thread/)。

---

- 修正：修正在已分離（detached）的 Fragment 中的 `ViewTarget` 上啟動請求時潛在的記憶體洩漏問題。([#518](https://github.com/coil-kt/coil/pull/518))
- 修正：使用 `ImageRequest.context` 載入資源 URI。([#517](https://github.com/coil-kt/coil/pull/517))
- 修正：修正可能導致後續請求未儲存至磁碟快取的競爭條件。([#510](https://github.com/coil-kt/coil/pull/510))
- 修正：在 API 18 上使用 `blockCountLong` 與 `blockSizeLong`。

---

- 將 `ImageLoaderFactory` 設為 fun interface。
- 新增 `ImageLoader.Builder.addLastModifiedToFileCacheKey`，允許你啟用／停用將從 `File` 載入圖片的最後修改時間戳記新增至記憶體快取索引鍵中。

---

- 更新 Kotlin 至 1.4.0。
- 更新 Coroutines 至 1.3.9。
- 更新 Okio 至 2.8.0。

## [1.0.0-rc1] - 2020 年 8 月 18 日 {id="1-0-0-rc1-august-18-2020"}

- **此版本需要 Kotlin 1.4.0 或更高版本。**
- 更新 Kotlin 至 1.4.0 並啟用 [`-Xjvm-default=all`](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/)。
    - **[請參閱此處](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8) 以了解如何在組建檔案中啟用 `-Xjvm-default=all`。**
    - 這會為 Kotlin 介面的預設方法產生 Java 8 預設方法。
- 移除 0.12.0 中所有現存的已棄用方法。
- 更新 Coroutines 至 1.3.9。

## [0.12.0] - 2020 年 8 月 18 日 {id="0-12-0-august-18-2020"}

- **破壞性變更**：`LoadRequest` 與 `GetRequest` 已被 `ImageRequest` 取代：
    - `ImageLoader.execute(LoadRequest)` -> `ImageLoader.enqueue(ImageRequest)`
    - `ImageLoader.execute(GetRequest)` -> `ImageLoader.execute(ImageRequest)`
    - `ImageRequest` 實作了 `equals`/`hashCode`。
- **破壞性變更**：多個類別重新命名及／或變更了所屬套件：
    - `coil.request.RequestResult` -> `coil.request.ImageResult`
    - `coil.request.RequestDisposable` -> `coil.request.Disposable`
    - `coil.bitmappool.BitmapPool` -> `coil.bitmap.BitmapPool`
    - `coil.DefaultRequestOptions` -> `coil.request.DefaultRequestOptions`
- **破壞性變更**：從公開 API 中移除了 [`SparseIntArraySet`](https://github.com/coil-kt/coil/blob/f52addd039f0195b66f93cb0f1cad59b0832f784/coil-core/src/main/java/coil/collection/SparseIntArraySet.kt)。
- **破壞性變更**：`TransitionTarget` 不再實作 `ViewTarget`。
- **破壞性變更**：`ImageRequest.Listener.onSuccess` 的簽章變更為傳回 `ImageResult.Metadata`，而非僅傳回 `DataSource`。
- **破壞性變更**：移除對 `LoadRequest.aliasKeys` 的支援。此 API 透過直接讀寫記憶體快取能得到更好的處理。

---

- **重要**：記憶體快取中的值不再同步解析（若從主執行緒呼叫）。
    - 進行此變更對於支援在背景調度器上執行 `Interceptor` 也是必要的。
    - 此變更同時將更多工作移出主執行緒，從而提升效能。
- **重要**：`Mapper` 現在在背景調度器上執行。作為附帶效果，不再**自動**支援點陣圖自動採樣。若要達到相同效果，請使用前一個請求的 `MemoryCache.Key` 作為後續請求的 `placeholderMemoryCacheKey`。[範例請參閱此處](https://coil-kt.github.io/coil/recipes#using-a-memory-cache-key-as-a-placeholder)。
    - `placeholderMemoryCacheKey` API 提供了更高的自由度，因為你可以「連結」帶有不同資料的兩個圖片請求（例如小圖／大圖的不同 URL）。
- **重要**：Coil 的 `ImageView` 擴充函式已從 `coil.api` 套件移至 `coil` 套件。
    - 請使用尋找與取代來重構 `import coil.api.load` -> `import coil.load`。很遺憾，無法使用 Kotlin 的 `ReplaceWith` 功能來取代匯入語句。
- **重要**：若 Drawable 不是同一張圖片，則使用標準淡入淡出。
- **重要**：在 API 24+ 上優先採用不可變點陣圖。
- **重要**：`MeasuredMapper` 已棄用，改用新的 `Interceptor` 介面。關於如何將 `MeasuredMapper` 轉換為 `Interceptor` 的範例，請參閱[此處](https://gist.github.com/colinrtwhite/90267704091467451e46b21b95154299)。
    - `Interceptor` 是一個限制較少的 API，允許更廣泛的自訂邏輯。
- **重要**：`ImageRequest.data` 現在為非 null。若建立 `ImageRequest` 時未設定其資料，它將傳回 `NullRequestData` 作為其資料。

---

- **新增**：新增對 `ImageLoader` 的 `MemoryCache` 進行直接讀寫存取的支援。詳情請參閱[說明文件](https://coil-kt.github.io/coil/getting_started/#memory-cache)。
- **新增**：新增對 `Interceptor` 的支援。詳情請參閱[說明文件](https://coil-kt.github.io/coil/image_pipeline/#interceptors)。Coil 的 `Interceptor` 設計深受 [OkHttp](https://github.com/square/okhttp) 的啟發！
- **新增**：新增使用 `ImageLoader.Builder.bitmapPoolingEnabled` 啟用／停用點陣圖池的功能。
    - 點陣圖池在 API 23 及以下版本中最為有效，但在 API 24 及以上版本中仍可能有所助益（透過主動呼叫 `Bitmap.recycle`）。
- **新增**：支援解碼時的執行緒中斷。

---

- 修正剖析 content-type 標頭中多個區段的問題。
- 重構點陣圖參照計數以更加健全。
- 修正 API < 19 裝置上的 WebP 解碼問題。
- 在 EventListener API 中公開 FetchResult 與 DecodeResult。

---

- 使用 SDK 30 進行編譯。
- 更新 Coroutines 至 1.3.8。
- 更新 OkHttp 至 3.12.12。
- 更新 Okio 至 2.7.0。
- 更新 AndroidX 相依性：
    - `androidx.appcompat:appcompat-resources` -> 1.2.0
    - `androidx.core:core-ktx` -> 1.3.1

## [0.11.0] - 2020 年 5 月 14 日 {id="0-11-0-may-14-2020"}

- **破壞性變更**：**此版本移除了所有現存的已棄用函式。**
    - 這允許移除 Coil 的 `ContentProvider`，使其在應用程式啟動時不執行任何程式碼。
- **破壞性變更**：將 `SparseIntArraySet.size` 轉換為 val。([#380](https://github.com/coil-kt/coil/pull/380))
- **破壞性變更**：將 `Parameters.count()` 移至擴充函式。([#403](https://github.com/coil-kt/coil/pull/403))
- **破壞性變更**：將 `BitmapPool.maxSize` 設為 Int。([#404](https://github.com/coil-kt/coil/pull/404))

---

- **重要**：使 `ImageLoader.shutdown()` 成為選用操作（類似於 `OkHttpClient`）。([#385](https://github.com/coil-kt/coil/pull/385))

---

- 修正：修正 AGP 4.1 相容性。([#386](https://github.com/coil-kt/coil/pull/386))
- 修正：修正測量 GONE 狀態 Views 的問題。([#397](https://github.com/coil-kt/coil/pull/397))

---

- 將預設記憶體快取大小降低至 20%。([#390](https://github.com/coil-kt/coil/pull/390))
    - 若要還原既有行為，請在建立 `ImageLoader` 時設定 `ImageLoaderBuilder.availableMemoryPercentage(0.25)`。
- 更新 Coroutines 至 1.3.6。
- 更新 OkHttp 至 3.12.11。

## [0.10.1] - 2020 年 4 月 26 日 {id="0-10-1-april-26-2020"}

- 修正 API 23 及以下版本中解碼大型 PNG 時發生的 OOM。([#372](https://github.com/coil-kt/coil/pull/372))。
    - 這停用了 PNG 檔案的 EXIF 方向解碼。PNG EXIF 方向極少使用，且讀取 PNG EXIF 資料（即使為空）需要將整個檔案緩衝到記憶體中，這對效能不利。
- 針對 `SparseIntArraySet` 進行微小的 Java 相容性改善。

---

- 更新 Okio 至 2.6.0。

## [0.10.0] - 2020 年 4 月 20 日 {id="0-10-0-april-20-2020"}

### 亮點 {id="highlights"}

- **此版本棄用了大部分的 DSL API，改為直接使用 Builder。** 變更樣貌如下：

    ```kotlin
    // 0.9.5 (舊版)
    val imageLoader = ImageLoader(context) {
        bitmapPoolPercentage(0.5)
        crossfade(true)
    }

    val disposable = imageLoader.load(context, "https://example.com/image.jpg") {
        target(imageView)
    }

    val drawable = imageLoader.get("https://example.com/image.jpg") {
        size(512, 512)
    }

    // 0.10.0 (新版)
    val imageLoader = ImageLoader.Builder(context)
        .bitmapPoolPercentage(0.5)
        .crossfade(true)
        .build()

    val request = LoadRequest.Builder(context)
        .data("https://example.com/image.jpg")
        .target(imageView)
        .build()
    val disposable = imageLoader.execute(request)

    val request = GetRequest.Builder(context)
        .data("https://example.com/image.jpg")
        .size(512, 512)
        .build()
    val drawable = imageLoader.execute(request).drawable
    ```

    - 若你使用 `io.coil-kt:coil` 構件，可以呼叫 `Coil.execute(request)` 使用單例 `ImageLoader` 來執行請求。

- **`ImageLoader` 現在擁有弱參照記憶體快取**，用於追蹤從強參照記憶體快取中逐出的圖片弱參照。
    - 這意味著只要對圖片仍存在強參照，該圖片就一律能從 `ImageLoader` 的記憶體快取中傳回。
    - 一般而言，這應能使記憶體快取更加可預測，並提升其命中率。
    - 此行為可透過 `ImageLoaderBuilder.trackWeakReferences` 啟用／停用。

- 新增構件 **`io.coil-kt:coil-video`**，用於從影片檔案中解碼特定畫格。[詳情請參閱此處](https://coil-kt.github.io/coil/videos/)。

- 新增用於追蹤指標的全新 [EventListener](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/EventListener.kt) API。

- 新增可由你的 `Application` 實作的 [ImageLoaderFactory](https://github.com/coil-kt/coil/blob/main/coil/src/main/java/coil/ImageLoaderFactory.kt)，以簡化單例初始化。

---

### 完整版本資訊 {id="full-release-notes"}

- **重要**：棄用 DSL 語法，改用 Builder 語法。([#267](https://github.com/coil-kt/coil/pull/267))
- **重要**：棄用 `Coil` 與 `ImageLoader` 擴充函式。([#322](https://github.com/coil-kt/coil/pull/322))
- **破壞性變更**：`ImageLoader.execute(GetRequest)` 改為傳回 sealed `RequestResult` 型別。([#349](https://github.com/coil-kt/coil/pull/349))
- **破壞性變更**：將 `ExperimentalCoil` 重新命名為 `ExperimentalCoilApi`。從 `@Experimental` 遷移至 `@RequiresOptIn`。([#306](https://github.com/coil-kt/coil/pull/306))
- **破壞性變更**：使用 `Logger` 介面取代 `CoilLogger`。([#316](https://github.com/coil-kt/coil/pull/316))
- **破壞性變更**：將 destWidth/destHeight 重新命名為 dstWidth/dstHeight。([#275](https://github.com/coil-kt/coil/pull/275))
- **破壞性變更**：重新編排 `MovieDrawable` 的建構函式參數。([#272](https://github.com/coil-kt/coil/pull/272))
- **破壞性變更**：`Request.Listener` 的方法現在接收完整的 `Request` 物件，而非僅接收其資料。
- **破壞性變更**：`GetRequestBuilder` 的建構函式現在需要傳入 `Context`。
- **破壞性變更**：`Request` 上的多個屬性現在變更為可為空（nullable）。
- **行為變更**：預設在快取索引鍵中包含參數值。([#319](https://github.com/coil-kt/coil/pull/319))
- **行為變更**：微調 `Request.Listener.onStart()` 的觸發時機，使其在 `Target.onStart()` 之後立即被呼叫。([#348](https://github.com/coil-kt/coil/pull/348))

---

- **新增**：新增 `WeakMemoryCache` 實作。([#295](https://github.com/coil-kt/coil/pull/295))
- **新增**：新增 `coil-video` 以支援解碼影片畫格。([#122](https://github.com/coil-kt/coil/pull/122))
- **新增**：引入 [`EventListener`](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/EventListener.kt)。([#314](https://github.com/coil-kt/coil/pull/314))
- **新增**：引入 [`ImageLoaderFactory`](https://github.com/coil-kt/coil/blob/main/coil/src/main/java/coil/ImageLoaderFactory.kt)。([#311](https://github.com/coil-kt/coil/pull/311))
- **新增**：在 Android 11 上支援動畫 HEIF 圖片序列。([#297](https://github.com/coil-kt/coil/pull/297))
- **新增**：改善 Java 相容性。([#262](https://github.com/coil-kt/coil/pull/262))
- **新增**：支援設定預設 `CachePolicy`。([#307](https://github.com/coil-kt/coil/pull/307))
- **新增**：支援設定預設 `Bitmap.Config`。([#342](https://github.com/coil-kt/coil/pull/342))
- **新增**：新增 `ImageLoader.invalidate(key)` 以清除單一記憶體快取項目。([#55](https://github.com/coil-kt/coil/pull/55))
- **新增**：新增偵錯記錄，說明未重複使用快取圖片的原因。([#346](https://github.com/coil-kt/coil/pull/346))
- **新增**：為 Get 請求支援 `error` 與 `fallback` drawable。

---

- 修正：修正在 Transformation 減少輸入點陣圖大小時記憶體快取未命中的問題。([#357](https://github.com/coil-kt/coil/pull/357))
- 修正：確保 BlurTransformation 中的半徑低於 RenderScript 的最大值。([#291](https://github.com/coil-kt/coil/pull/291))
- 修正：修正解碼高色彩深度圖片的問題。([#358](https://github.com/coil-kt/coil/pull/358))
- 修正：在 Android 11 及以上版本停用 `ImageDecoderDecoder` 的崩潰變通方案。([#298](https://github.com/coil-kt/coil/pull/298))
- 修正：修正 API 23 之前版本讀取 EXIF 資料失敗的問題。([#331](https://github.com/coil-kt/coil/pull/331))
- 修正：修正與 Android R SDK 的不相容問題。([#337](https://github.com/coil-kt/coil/pull/337))
- 修正：僅在 `ImageView` 具有相符的 `SizeResolver` 時才啟用非精確大小。([#344](https://github.com/coil-kt/coil/pull/344))
- 修正：允許快取圖片與請求大小最多有一像素的誤差。([#360](https://github.com/coil-kt/coil/pull/360))
- 修正：若 View 不可見則略過淡入淡出轉場。([#361](https://github.com/coil-kt/coil/pull/361))

---

- 棄用 `CoilContentProvider`。([#293](https://github.com/coil-kt/coil/pull/293))
- 為多個 `ImageLoader` 方法加上 `@MainThread` 註解。
- 若生命週期目前已處於啟動狀態，則避免建立 `LifecycleCoroutineDispatcher`。([#356](https://github.com/coil-kt/coil/pull/356))
- 在 `OriginalSize.toString()` 中使用完整套件名稱。
- 解碼軟體點陣圖時進行預先配置。([#354](https://github.com/coil-kt/coil/pull/354))

---

- 更新 Kotlin 至 1.3.72。
- 更新 Coroutines 至 1.3.5。
- 更新 OkHttp 至 3.12.10。
- 更新 Okio 至 2.5.0。
- 更新 AndroidX 相依性：
    - `androidx.exifinterface:exifinterface` -> 1.2.0

## [0.9.5] - 2020 年 2 月 6 日 {id="0-9-5-february-6-2020"}

- 修正：在檢查 View 是否啟用硬體加速前，先確保其已被連接（attached）。這修正了請求硬體點陣圖時可能遺漏記憶體快取的情況。

---

- 更新 AndroidX 相依性：
    - `androidx.core:core-ktx` -> 1.2.0

## [0.9.4] - 2020 年 2 月 3 日 {id="0-9-4-february-3-2020"}

- 修正：在 ImageDecoderDecoder 中降採樣時遵循長寬比。感謝 @zhanghai。

---

- 先前只要點陣圖的組態大於或等於請求中指定的組態，就會從記憶體快取中傳回。例如，若請求 `ARGB_8888` 點陣圖，記憶體快取可能會傳回 `RGBA_F16` 點陣圖。現在，快取的組態與請求的組態必須完全一致。
- 將 `CrossfadeDrawable` 與 `CrossfadeTransition` 中的 `scale` 和 `durationMillis` 設為公開。

## [0.9.3] - 2020 年 2 月 1 日 {id="0-9-3-february-1-2020"}

- 修正：平移 `ScaleDrawable` 內部的子 drawable 以確保其置中。
- 修正：修正 GIF 與 SVG 無法完全填滿邊界的問題。

---

- 將呼叫 `HttpUrl.get()` 延後至背景執行緒執行。
- 改進 BitmapFactory 點陣圖為空時的錯誤訊息。
- 將 3 款裝置新增至硬體點陣圖黑名單。([#264](https://github.com/coil-kt/coil/pull/264))

---

- 更新 AndroidX 相依性：
    - `androidx.lifecycle:lifecycle-common-java8` -> 2.2.0

## [0.9.2] - 2020 年 1 月 19 日 {id="0-9-2-january-19-2020"}

- 修正：修正 API 19 之前版本解碼 GIF 的問題。感謝 @mario。
- 修正：修正點陣化向量 Drawable 未被標記為已採樣的問題。
- 修正：若 Movie 維度 <= 0 則擲出例外狀況。
- 修正：修正記憶體快取事件未恢復 CrossfadeTransition 的問題。
- 修正：若不允許，防止向所有目標方法傳回硬體點陣圖。
- 修正：修正 MovieDrawable 未將自身定位於其邊界中心的問題。

---

- 從 CrossfadeDrawable 中移除自動縮放。
- 將 `BitmapPool.trimMemory` 設為公開。
- 將 AnimatedImageDrawable 包裝在 ScaleDrawable 中以確保其填滿邊界。
- 為 RequestBuilder.setParameter 新增 @JvmOverloads。
- 若未設定檢視方框（view box），則將 SVG 的檢視方框設定為其大小。
- 將狀態與層級變更傳遞給 CrossfadeDrawable 的子元件。

---

- 更新 OkHttp 至 3.12.8。

## [0.9.1] - 2019 年 12 月 30 日 {id="0-9-1-december-30-2019"}

- 修正：修正呼叫 `LoadRequestBuilder.crossfade(false)` 時發生的崩潰。

## [0.9.0] - 2019 年 12 月 30 日 {id="0-9-0-december-30-2019"}

- **破壞性變更**：`Transformation.transform` 現在包含一個 `Size` 參數。這是為了支援根據 `Target` 的大小變更輸出 `Bitmap` 大小的轉換。具有轉換的請求現在也可以免除[圖片採樣](https://coil-kt.github.io/coil/getting_started/#image-sampling)。
- **破壞性變更**：`Transformation` 現在可套用至任何類型的 `Drawable`。在此之前，若輸入的 `Drawable` 不是 `BitmapDrawable`，轉換將被略過。現在，在套用 `Transformation` 之前，`Drawable` 會先算繪至 `Bitmap`。
- **破壞性變更**：向 `ImageLoader.load` 傳遞 `null` 資料現在被視為錯誤，並以 `NullRequestDataException` 呼叫 `Target.onError` 與 `Request.Listener.onError`。進行此變更是為了支援在資料為 `null` 時設定 `fallback` drawable。先前該請求會被預設忽略。
- **破壞性變更**：`RequestDisposable.isDisposed` 現為 `val`。

---

- **新增**：支援自訂轉場。[詳情請參閱此處](https://coil-kt.github.io/coil/transitions/)。由於該 API 仍在醞釀中，轉場功能被標記為實驗性。
- **新增**：新增 `RequestDisposable.await` 以支援在 `LoadRequest` 進行時掛起等待。
- **新增**：支援在請求資料為 null 時設定 `fallback` drawable。
- **新增**：新增 `Precision`。這使輸出 `Drawable` 的大小保持精確，同時為支援縮放的目標（例如 `ImageViewTarget`）啟用縮放最佳化。詳情請參閱[其說明文件](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/size/Precision.kt)。
- **新增**：新增 `RequestBuilder.aliasKeys` 以支援比對多個快取索引鍵。

---

- 修正：使 RequestDisposable 具備執行緒安全性。
- 修正：`RoundedCornersTransformation` 現在先裁切為目標大小，然後進行圓角處理。
- 修正：`CircleCropTransformation` 現在從中心開始裁切。
- 修正：新增數款裝置至[硬體點陣圖黑名單](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/memory/HardwareBitmapService.kt)。
- 修正：將 Drawable 轉換為 Bitmap 時保留長寬比。
- 修正：修正使用 `Scale.FIT` 時可能發生的記憶體快取未命中問題。
- 修正：確保 Parameters 疊代順序具備確定性（deterministic）。
- 修正：建立 Parameters 與 ComponentRegistry 時進行防禦性複製。
- 修正：確保 RealBitmapPool 的 maxSize >= 0。
- 修正：若 CrossfadeDrawable 未在執行動畫或未完成，則顯示起始 drawable。
- 修正：調整 CrossfadeDrawable 以考量具有未定義固有大小的子元件。
- 修正：修正 `MovieDrawable` 未正確縮放的問題。

---

- 更新 Kotlin 至 1.3.61。
- 更新 Kotlin Coroutines 至 1.3.3。
- 更新 Okio 至 2.4.3。
- 更新 AndroidX 相依性：
    - `androidx.exifinterface:exifinterface` -> 1.1.0

## [0.8.0] - 2019 年 10 月 22 日 {id="0-8-0-october-22-2019"}

- **破壞性變更**：移除 `SvgDrawable`。改由 `SvgDecoder` 將 SVG 預先算繪為 `BitmapDrawable`。這使得 SVG **在主執行緒上的算繪開銷顯著降低**。此外，`SvgDecoder` 現在在其建構函式中需要傳入 `Context`。
- **破壞性變更**：`SparseIntArraySet` 擴充函式已移至 `coil.extension` 套件。

---

- **新增**：支援針對個別請求設定網路標頭。[詳情請參閱此處](https://github.com/coil-kt/coil/pull/120)。
- **新增**：新增全新的 `Parameters` API，支援透過圖片管線傳遞自訂資料。
- **新增**：支援在 RoundedCornersTransformation 中個別設定圓角半徑。感謝 @khatv911。
- **新增**：新增 `ImageView.clear()` 以支援主動釋放資源。
- **新增**：支援從其他套件載入資源。
- **新增**：為 ViewSizeResolver 新增 `subtractPadding` 屬性，用於啟用／停用在測量時扣除 View 的內距（padding）。
- **新增**：改善 HttpUrlFetcher 的 MIME 類型偵測。
- **新增**：為 MovieDrawable 與 CrossfadeDrawable 新增 Animatable2Compat 支援。
- **新增**：新增 `RequestBuilder<*>.repeatCount` 以設定 GIF 的重複播放次數。
- **新增**：將 BitmapPool 的建立加入至公開 API 中。
- **新增**：為 Request.Listener 方法加上 `@MainThread` 註解。

---

- 修正：使 CoilContentProvider 在測試中可見。
- 修正：在資源快取索引鍵中包含深色模式（night mode）。
- 修正：透過暫時將來源寫入磁碟，以規避 ImageDecoder 的原生崩潰問題。
- 修正：正確處理聯絡人顯示相片的 URI。
- 修正：將色調（tint）傳遞給 CrossfadeDrawable 的子元件。
- 修正：修正數處未關閉來源（source）的實例。
- 修正：新增具有損壞／不完整硬體點陣圖實作的裝置黑名單。

---

- 針對 SDK 29 進行編譯。
- 更新 Kotlin Coroutines 至 1.3.2。
- 更新 OkHttp 至 3.12.6。
- 更新 Okio 至 2.4.1。
- 將 `coil-base` 的 `appcompat-resources` 從 `compileOnly` 改為 `implementation`。

## [0.7.0] - 2019 年 9 月 8 日 {id="0-7-0-september-8-2019"}
- **破壞性變更**：`ImageLoaderBuilder.okHttpClient(OkHttpClient.Builder.() -> Unit)` 現已變更為 `ImageLoaderBuilder.okHttpClient(() -> OkHttpClient)`。初始設定式現在也會在背景執行緒上延遲呼叫。**若你設定了自訂的 `OkHttpClient`，你必須設定 `OkHttpClient.cache` 以啟用磁碟快取。** 若未設定自訂的 `OkHttpClient`，Coil 將建立已啟用磁碟快取的預設 `OkHttpClient`。可以使用 `CoilUtils.createDefaultCache(context)` 建立預設的 Coil 快取。例如：

```kotlin
val imageLoader = ImageLoader(context) {
    okHttpClient {
        OkHttpClient.Builder()
            .cache(CoilUtils.createDefaultCache(context))
            .build()
    }
}
```

- **破壞性變更**：`Fetcher.key` 不再具有預設實作。
- **破壞性變更**：先前僅會呼叫第一個適用的 `Mapper`。現在所有適用的 `Mapper` 都將被呼叫。無 API 變更。
- **破壞性變更**：微小的命名參數重新命名：`url` -> `uri`，`factory` -> `initializer`。

---

- **新增**：`coil-svg` 構件，包含支援自動解碼 SVG 的 `SvgDecoder`。由 [AndroidSVG](https://github.com/BigBadaboom/androidsvg) 提供技術支援。感謝 @rharter。
- **新增**：`load(String)` 與 `get(String)` 現在接受任何受支援的 Uri 配置（schemes）。例如現在可以執行 `imageView.load("file:///path/to/file.jpg")`。
- **新增**：重構 ImageLoader 以使用 `Call.Factory` 取代 `OkHttpClient`。這允許使用 `ImageLoaderBuilder.okHttpClient { OkHttpClient() }` 延遲初始化網路資源。感謝 @ZacSweers。
- **新增**：`RequestBuilder.decoder` 用於為請求明確設定解碼器。
- **新增**：`ImageLoaderBuilder.allowHardware` 用於為 ImageLoader 預設啟用／停用硬體點陣圖。
- **新增**：支援在 ImageDecoderDecoder 中進行軟體算繪。

---

- 修正：修正載入向量 Drawable 的多個錯誤。
- 修正：支援 WRAP_CONTENT 的 View 維度。
- 修正：支援剖析長度超過 8192 位元組的 EXIF 資料。
- 修正：淡入淡出轉場時不再拉伸長寬比不同的 Drawable。
- 修正：防範網路觀察程式因例外狀況而註冊失敗。
- 修正：修正 MovieDrawable 中的除以零錯誤。感謝 @R12rus。
- 修正：支援巢狀 Android asset 檔案。感謝 @JaCzekanski。
- 修正：防範在 Android O 與 O_MR1 上檔案描述符耗盡的情況。
- 修正：停用記憶體快取時不再發生崩潰。感謝 @hansenji。
- 修正：確保 `Target.cancel` 一律從主執行緒呼叫。

---

- 更新 Kotlin 至 1.3.50。
- 更新 Kotlin Coroutines 至 1.3.0。
- 更新 OkHttp 至 3.12.4。
- 更新 Okio 至 2.4.0。
- 更新 AndroidX 相依性至最新穩定版本：
    - `androidx.appcompat:appcompat` -> 1.1.0
    - `androidx.core:core-ktx` -> 1.1.0
    - `androidx.lifecycle:lifecycle-common-java8` -> 2.1.0
- 將 `appcompat` 替換為 `appcompat-resources` 作為選用的 `compileOnly` 相依性。`appcompat-resources` 是體積更小的構件。

## [0.6.1] - 2019 年 8 月 16 日 {id="0-6-1-august-16-2019"}
- 新增：為 RequestBuilder 新增 `transformations(List<Transformation>)`。
- 修正：將檔案 URI 的最後修改日期新增至快取索引鍵中。
- 修正：確保 View 的維度至少評估為 1px。
- 修正：在畫格之間清除 MovieDrawable 的畫布。
- 修正：正確開啟 assets。

## [0.6.0] - 2019 年 8 月 12 日 {id="0-6-0-august-12-2019"}
- 初始版本。