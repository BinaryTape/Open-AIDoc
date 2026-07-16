# 更新日誌

## [3.5.0-beta01] - 2026 年 5 月 4 日

- 移除 `iosX64` 與 `macosX64` 目標。([#3386](https://github.com/coil-kt/coil/pull/3386))
- 將 Android 的最低 SDK 版本提升至 23。([#3283](https://github.com/coil-kt/coil/pull/3283))
- 在 JS/WASM 上加入快速 WebP 大小擷取，以避免回退至完整的 Skia 解碼。([#3341](https://github.com/coil-kt/coil/pull/3341))
- 修正 `CacheStrategy` 實作無法重新整理已快取的失敗回應（例如過期的快取 `404` 回應）。([#3401](https://github.com/coil-kt/coil/pull/3401))
- 更新編譯 SDK 至 36。
- 更新 Kotlin 至 2.3.21。
- 更新 Compose 至 1.11.0-beta03。
- 更新 Okio 至 3.17.0。
- 更新 Skiko 至 0.144.5。
- 更新 `androidx.annotation` 至 1.10.0。

## [3.4.0] - 2026 年 2 月 24 日

- **新增**：加入 `ConcurrentRequestStrategy` 以支援為相同金鑰合併進行中的網路請求。([#2995](https://github.com/coil-kt/coil/pull/2995), [#3326](https://github.com/coil-kt/coil/pull/3326))
    - `DeDupeConcurrentRequestStrategy` 啟用了此行為，並讓等待者 (waiters) 等待進行中網路請求的結果。
        - 此行為目前為實驗性，且預設為停用。
        - 目前請求一律根據其 `diskCacheKey` 進行合併。
    - `OkHttpNetworkFetcherFactory`、`KtorNetworkFetcherFactory` 以及 `NetworkFetcher.Factory` 現在接受 `concurrentRequestStrategy`。
- **新增**：在 JS/WASM 上使用背景工作執行緒 (web worker) 解碼影像，以避免阻塞瀏覽器主執行緒。([#3305](https://github.com/coil-kt/coil/pull/3305))
- **新增**：為非 Compose 多平台構件新增對 Linux 原生目標 (`linuxX64` 與 `linuxArm64`) 的支援。([#3054](https://github.com/coil-kt/coil/pull/3054))
- **新增**：加入僅限 Compose 的 API 以改善後續請求之間的過渡。([#3141](https://github.com/coil-kt/coil/pull/3141), [#3175](https://github.com/coil-kt/coil/pull/3175))
    - `ImageRequest.Builder.useExistingImageAsPlaceholder` 在未設定占位符號時，支援從前一個影像進行淡入淡出。
    - `ImageRequest.Builder.preferEndFirstIntrinsicSize` 讓 `CrossfadePainter` 優先使用結束繪製器的原生大小。
- **新增**：在 `coil-gif` 中加入 `ImageLoader.Builder.repeatCount(Int)` 以設定全域動畫影像重複次數。([#3143](https://github.com/coil-kt/coil/pull/3143))
- **新增**：在 `coil-video` 中加入對優先使用內嵌影片縮圖的支援。([#3107](https://github.com/coil-kt/coil/pull/3107))
- **新增**：隨 `coil-core` 發佈 `coil-lint`，並加入 Lint 檢查以擷取 `ImageRequest.Builder` 區塊中意外的 `kotlin.error()` 呼叫。([#3304](https://github.com/coil-kt/coil/pull/3304))
- 將 Kotlin 語言版本設定為 2.1。([#3302](https://github.com/coil-kt/coil/pull/3302))
- 讓 `BitmapFetcher` 在通用程式碼中可用。([#3286](https://github.com/coil-kt/coil/pull/3286))
- 在 Android 上建立單例 `ImageLoader` 時使用 `applicationContext`。([#3246](https://github.com/coil-kt/coil/pull/3246))
- 預設快取符合條件的非 2xx HTTP 回應（例如 `404`），並停止快取不可快取的回應（例如 `500`）。([#3137](https://github.com/coil-kt/coil/pull/3137), [#3139](https://github.com/coil-kt/coil/pull/3139))
- 修正消耗 OkHttp 回應主體時潛在的資料競爭 (race condition)。([#3186](https://github.com/coil-kt/coil/pull/3186))
- 修正 `maxBitmapSize` 邊緣情況，以防止在 Android 上因影像過大導致崩潰。([#3259](https://github.com/coil-kt/coil/pull/3259))
- 更新 Kotlin 至 2.3.10。
- 更新 Compose 至 1.9.3。
- 更新 Okio 至 3.16.4。
- 更新 Skiko 至 0.9.22.2。
- 更新 `kotlinx-io-okio` 至 0.9.0。
- 更新 `androidx.core` 至 1.16.0。
- 更新 `androidx.lifecycle` 至 2.9.4。
- 更新 `androidx.exifinterface` 至 1.4.2。

## [3.3.0] - 2025 年 7 月 22 日

- **新增**：引入新的 API，在應用程式處於背景時限制 Android 上的 `MemoryCache.maxSize`。
    - 若設定了 `ImageLoader.Builder.memoryCacheMaxSizePercentWhileInBackground`，則應用程式處於背景時，`ImageLoader` 的記憶體快取將被限制在其最大大小的百分比內。此設定目前預設為停用。
    - 當應用程式切換至背景時，影像將從記憶體快取中被修剪以達到限制的最大大小，但記憶體快取對最近修剪影像的弱參照不受影響。這意味著如果影像目前在其他地方被引用（例如 `AsyncImage`、`ImageView` 等），它仍會存在於記憶體快取中。
    - 此 API 有助於減少背景記憶體使用量，防止應用程式過早被系統終止，並協助減輕使用者裝置的記憶體壓力。
- **新增**：為 `SvgDecoder` 加入 `Svg.Parser` 引數。
    - 若預設的 SVG 剖析器不符合需求，此功能支援使用自訂的 SVG 剖析器。
- 為 `SvgDecoder` 加入 `density` 引數，以支援提供自訂的密度倍數。
- 加入 `Uri.Builder` 以支援複製與修改 `Uri`。
- 加入 `ImageLoader.Builder.mainCoroutineContext` 以支援在測試中覆寫 Coil 使用的 `Dispatchers.main.immediate`。
- 修正 `CrossfadePainter.intrinsicSize` 在動畫結束時當 `start` 影像被取消參照時發生變化的問題。這與 `CrossfadeDrawable` 的行為保持一致。
- 修正 Java 無法存取 `ImageLoaders.executeBlocking` 的問題。
- 在 `coil-network-ktor3` 中使用 `kotlinx.io` 的 Okio 互操作模組。
- 更新 `kotlinx-datetime` 至 `0.7.1`。
    - 此版本包含僅影響 `coil-network-cache-control` 模組的二進制不相容變更。詳情請參閱[此處](https://github.com/Kotlin/kotlinx-datetime?tab=readme-ov-file#deprecation-of-instant)。
- 更新 Kotlin 至 2.2.0。
- 更新 Compose 至 1.8.2。
- 更新 Okio 至 3.15.0。
- 更新 Skiko 至 0.9.4.2。

## [3.2.0] - 2025 年 5 月 13 日

自 `3.1.0` 以來的變更：

- **重要**：由於 Compose `1.8.0` 的需求，`coil-compose` 與 `coil-compose-core` 現在需要 Java 11 位元組碼。關於如何啟用，請參閱[此處](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8-or-java-11)。
- 變更 `AsyncImagePreviewHandler` 的功能建構函式，使其傳回 `AsyncImagePainter.State.Success` 而非 `AsyncImagePainter.State.Loading`。
- 修正 `ConstraintsSizeResolver#size()` 中的取消問題。
- 修正使用 R8 組建時缺少 `PlatformContext` 的警告。
- 修正當傳回預設 `FakeImageLoaderEngine` 回應時，`FakeImageLoaderEngine` 未設定 `Transition.Factory.NONE` 的問題。
- 移除 `ColorImage` 的實驗性註解。
- 在 `CacheControlCacheStrategy` 中延遲剖析網路標頭。
- 重構 `CircleCropTransformation` 與 `RoundedCornersTransformation` 以共享通用程式碼。
- 若 `ExifOrientationStrategy` 不是 `RESPECT_PERFORMANCE`，則內部回退使用 `BitmapFactory`。
- 更新 Kotlin 至 2.1.20。
- 更新 Compose 至 1.8.0。
- 更新 Okio 至 3.11.0。
- 更新 Skiko 至 0.9.4。
- 更新協同程式至 1.10.2。
- 更新 `accompanist-drawablepainter` 至 0.37.3。

自 `3.2.0-rc02` 以來的變更：

- 若 `ExifOrientationStrategy` 不是 `RESPECT_PERFORMANCE`，則內部回退使用 `BitmapFactory`。
- 更新 Compose 至 1.8.0。
- 更新 `accompanist-drawablepainter` 至 0.37.3。

## [3.2.0-rc02] - 2025 年 4 月 26 日

- 修正非 JVM 目標上使用 `KtorNetworkFetcherFactory` (Ktor 3) 載入影像時，影像請求因 `ClosedByteChannelException` 而失敗的問題。

## [3.2.0-rc01] - 2025 年 4 月 24 日

- **重要**：由於 Compose `1.8.0` 的需求，`coil-compose` 與 `coil-compose-core` 現在需要 Java 11 位元組碼。關於如何啟用，請參閱[此處](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8-or-java-11)。
- 變更 `AsyncImagePreviewHandler` 的功能建構函式，使其傳回 `AsyncImagePainter.State.Success` 而非 `AsyncImagePainter.State.Loading`。
- 修正 `ConstraintsSizeResolver#size()` 中的取消問題。
- 修正使用 R8 組建時缺少 `PlatformContext` 的警告。
- 修正當傳回預設 `FakeImageLoaderEngine` 回應時，`FakeImageLoaderEngine` 未設定 `Transition.Factory.NONE` 的問題。
- 移除 `ColorImage` 的實驗性註解。
- 在 `CacheControlCacheStrategy` 中延遲剖析網路標頭。
- 重構 `CircleCropTransformation` 與 `RoundedCornersTransformation` 以共享通用程式碼。
- 在 `coil-network-ktor2` 與 `coil-network-ktor3` 中使用 `kotlinx.io` 的 Okio 互操作模組。
- 更新 Kotlin 至 2.1.20。
- 更新 Compose 至 1.8.0-rc01。
- 更新 Okio 至 3.11.0。
- 更新 Skiko 至 0.9.4。
- 更新協同程式至 1.10.2。

## [3.1.0] - 2025 年 2 月 4 日

- 提升 `AsyncImage` 效能。
    - 根據可組合項 (composable) 是被具現化還是被重複使用，執行階段效能提升了 25% 至 40%。記憶體分配也減少了 35% 至 48%。更多資訊請見[此處](https://github.com/coil-kt/coil/pull/2795)。
- 加入 `ColorImage` 並棄用 `FakeImage`。
    - `ColorImage` 對於在測試與預覽中傳回虛假值非常有用。它解決了與 `FakeImage` 相同的使用案例，但在 `coil-core` 中比在 `coil-test` 中更容易取得。
- 移除 `coil-compose-core` 對 `Dispatchers.Main.immedate` 的相依性。
    - 這也修正了 `AsyncImagePainter` 在 Paparazzi 與 Roborazzi 螢幕截圖測試中無法同步執行 `ImageRequest` 的問題。
- 加入對格式為 `data:[<mediatype>][;base64],<data>` 的 [資料 URI](https://www.ietf.org/rfc/rfc2397.txt) 的支援。
- 加入 `AnimatedImageDecoder.ENCODED_LOOP_COUNT` 以支援使用 GIF 元資料中編碼的重複次數。
- 為 `NetworkRequest` 加入 `Extras` 以支援自訂擴充。
- 加入 `DiskCache.Builder.cleanupCoroutineContext` 並棄用 `DiskCache.Builder.cleanupDispatcher`。
- 加入 `ImageLoader.Builder.imageDecoderEnabled` 以選擇性地在 API 29 及以上版本停用 `android.graphics.ImageDecoder`。
- 若 `ImageRequest` 的資料型別沒有註冊的 `Keyer`，則記錄一條警告。
- 將 `CrossfadePainter` 設為公開。
- 在所有多平台目標上支援 `Transformation`。
- 在 `CacheControlCacheStrategy` 中支援 0 作為 `Expires` 標頭值。
- 修正 `AsyncImage`/`SubcomposeAsyncImage`/`rememberAsyncImage` 在其 `ContentScale` 在 `None` 之間切換時不啟動新 `ImageRequest` 的問題。
- 更新 Kotlin 至 2.1.10。
    - 注意：若您使用 Kotlin 原生 (Kotlin native)，由於 [LLVM 更新](https://kotlinlang.org/docs/whatsnew21.html#llvm-update-from-11-1-0-to-16-0-0)，此版本要求使用 Kotlin 2.1.0 或更高版本進行編譯。
- 更新 Compose 至 1.7.3。
- 更新 `androidx.core` 至 1.15.0。

## [3.0.4] - 2024 年 11 月 25 日

- 修正向量可繪製資源在 Android Studio 預覽中無法渲染的問題。
- 修正大小超過 `maxBitmapSize` 的請求可能發生記憶體快取遺漏的問題。
- 修正 `FakeImage` 在 Android 上無法渲染的問題。
- 修正搭配 `AsyncImage`/`rememberAsyncImagePainter`/`SubcomposeAsyncImage` 使用時，當請求的 `Transformation` 變更時未啟動新影像請求的問題。
- 修正 `ScaleDrawable` 與 `CrossfadeDrawable` 不遵循色調 (tint) 狀態的問題。
- 允許 `ImageDecoder` 解碼部分影像來源。這與 `BitmapFactory` 的行為一致。
- 修正解碼後未呼叫 `Bitmap.prepareToDraw()` 的問題。
- `SvgDecoder` 對於非點陣化影像不應傳回 `isSampled = true`。
- 若立即主執行緒調度器不可用，則在 Compose 中回退至 `Dispatchers.Unconfined`。此功能僅用於預覽/測試環境。
- 更新 Ktor 2 至 `2.3.13`。

## [3.0.3] - 2024 年 11 月 14 日

- 修正根據 `ImageView` 的 `ScaleType` 設定 `ImageRequest.scale` 的問題。
- 修正 `DiskCache` 在刪除檔案後無法追蹤條目移除的邊緣情況。
- 記錄錯誤時將可拋出物件 (throwable) 傳遞給 `Logger`。
- 不要將 `kotlin-stdlib-jdk7` 與 `kotlin-stdlib-jdk8` 替換為 `kotlin-stdlib`。

## [3.0.2] - 2024 年 11 月 9 日

- 修正 Android 上使用自訂 `CacheStrategy` 呼叫 `OkHttpNetworkFetcherFactory` 時發生的崩潰。
- 修正 `CacheControlCacheStrategy` 計算快取條目存在時間錯誤的問題。
- 修正 `ImageRequest.bitmapConfig` 僅在 API >= 28 且為 `ARGB_8888` 或 `HARDWARE` 時才被遵循的情況。

## [3.0.1] - 2024 年 11 月 7 日

- 修正使用硬體位元圖支援的 `BitmapImage` 呼叫 `Image.toBitmap` 時發生的崩潰。
- 修正 `AsyncImageModelEqualityDelegate.Default` 對於非 `ImageRequest` 模型比較相等性錯誤的問題。

## [3.0.0] - 2024 年 11 月 4 日

Coil 3.0.0 是下一個主要版本，完整支援 [Compose Multiplatform](https://www.jetbrains.com/compose-multiplatform/)。

[關於 3.0.0 的完整改進清單與重要變更，請查看升級指南](/coil/migrating_to_coil3/)。

自 `3.0.0-rc02` 以來的變更：

- 移除剩餘的棄用方法。

## [3.0.0-rc02] - 2024 年 10 月 28 日

[關於 3.x 的完整改進清單與重要變更，請查看升級指南](/coil/migrating_to_coil3/)。自 `3.0.0-rc01` 以來的變更：

- 加入 `BlackholeDecoder`。這簡化了[僅限磁碟快取的預先載入](https://coil-kt.github.io/coil/faq/#how-do-i-preload-an-image)。
- 為 `ConstraintsSizeResolver` 與 `DrawScopeSizeResolver` 加入 `remember` 函式。
- 移除 `EqualityDelegate` 作為 `AsyncImage` 的參數。取而代之的是應透過 `LocalAsyncImageModelEqualityDelegate` 設定。
- 修正當父代可組合項使用 `IntrinsicSize` 時，`AsyncImage` 無法渲染的問題。
- 修正當 `AsyncImagePainter` 沒有子繪製器時，`AsyncImage` 填充可用限制的問題。
- 修正 `rememberAsyncImagePainter` 在觀察其狀態時因 `EqualityDelegate` 被忽略而無限重新組合的問題。
- 修正剖析包含特殊字元的 `File`/`Path` 路徑的問題。
- 修正 `VideoFrameDecoder` 搭配自訂 `FileSystem` 實作使用的問題。
- 更新 Ktor 至 `3.0.0`。
- 更新 `androidx.annotation` 至 `1.9.0`。

## [3.0.0-rc01] - 2024 年 10 月 8 日

[關於 3.x 的完整改進清單與重要變更，請查看升級指南](/coil/migrating_to_coil3/)。自 `3.0.0-alpha10` 以來的變更：

- **破壞性變更**：預設停用 `addLastModifiedToFileCacheKey` 並允許按請求設定。可使用相同旗標重新啟用該行為。
- **新增**：引入新的 `coil-network-cache-control` 構件，實作了 [`Cache-Control` 標頭](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) 支援。
- **新增**：為 `SvgDecoder.Factory` 加入 `scaleToDensity` 屬性。此屬性確保具有原生尺寸的 SVG 會乘以裝置密度（僅在 Android 上支援）。
- 將 `ExifOrientationPolicy` 重新命名為 `ExifOrientationStrategy`。
- 在獲取時從 `MemoryCache` 中移除不可共享的影像。
- 將 `ConstraintsSizeResolver` 設為公開。
- 穩定化 `setSingletonImageLoaderFactory`。
- 在 `coil-network-ktor3` 中恢復最佳化的 JVM I/O 函式。
- 將 `pdf` 加入 MIME 類型清單。
- 更新編譯 SDK 至 35。
- 更新 Kotlin 至 2.0.20。
- 更新 Okio 至 3.9.1。

## [3.0.0-alpha10] - 2024 年 8 月 7 日

- **破壞性變更**：將 `ImageLoader.Builder.networkObserverEnabled` 替換為 `NetworkFetcher` 的 `ConnectivityChecker` 介面。
    - 若要停用網路觀察程式，請將 `ConnectivityChecker.ONLINE` 傳遞給 `KtorNetworkFetcherFactory`/`OkHttpNetworkFetcherFactory` 的建構函式。
- **新增**：支援在所有平台上載入 [Compose Multiplatform 資源](https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-images-resources.html)。若要載入資源，請使用 `Res.getUri`：

```kotlin
AsyncImage(
    model = Res.getUri("drawable/image.jpg"),
    contentDescription = null,
)
```

- 為 `ImageLoader` 與 `ImageRequest` 加入 `maxBitmapSize` 屬性。
    - 此屬性預設為 4096x4096，並為分配的位元圖尺寸提供安全的上限。這有助於防止意外使用 `Size.ORIGINAL` 載入極大影像而導致記憶體耗盡 (OOM) 例外。
- 將 `ExifOrientationPolicy` 轉換為介面以支援自訂原則。
- 修正 `Uri` 對 Windows 檔案路徑的處理。
- 從 `Image` API 移除 `@ExperimentalCoilApi`。
- 更新 Kotlin 至 2.0.10。

## [3.0.0-alpha09] - 2024 年 7 月 23 日

- **破壞性變更**：將 `io.coil-kt.coil3:coil-network-ktor` 構件重新命名為 `io.coil-kt.coil3:coil-network-ktor2`，其依賴於 Ktor 2.x。此外，引入依賴於 Ktor 3.x 的 `io.coil-kt.coil3:coil-network-ktor3`。`wasmJs` 支援僅在 Ktor 3.x 中可用。
- **新增**：加入 `AsyncImagePainter.restart()` 以手動重新啟動影像請求。
- 從 `NetworkClient` 及相關類別移除 `@ExperimentalCoilApi`。
- 最佳化 `ImageRequest` 以避免不必要的 `Extras` 與 `Map` 分配。

## [2.7.0] - 2024 年 7 月 17 日

- 稍微最佳化內部協同程式的使用，以提升 `ImageLoader.execute`、`AsyncImage`、`SubcomposeAsyncImage` 與 `rememberAsyncImagePainter` 的效能。([#2205](https://github.com/coil-kt/coil/pull/2205))
- 修正分塊 (chunked) 回應導致的重複網路呼叫。([#2363](https://github.com/coil-kt/coil/pull/2363))
- 更新 Kotlin 至 2.0.0。
- 更新 Compose UI 至 1.6.8。
- 更新 Okio 至 3.9.0。

## [3.0.0-alpha08] - 2024 年 7 月 8 日

- **破壞性變更**：將 `ImageRequest` 與 `ImageLoader` 的 `dispatcher` 方法重新命名為 `coroutineContext`。例如，`ImageRequest.Builder.dispatcher` 現在改為 `ImageRequest.Builder.coroutineContext`。重命名是因為該方法現在接受任何 `CoroutineContext` 而不再要求是 `Dispatcher`。
- 修正：修正因資料競爭可能發生的 `IllegalStateException: Reading a state that was created after the snapshot was taken or in a snapshot that has not yet been applied`。
    - 注意：這重新引入了對 `Dispatchers.Main.immediate` 的軟相依性。因此，您應在 JVM 上重新加入對 [`kotlinx-coroutines-swing`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-swing/) 的相依性。若未匯入，則 `ImageRequest` 將不會立即發派，並且在設定 `ImageRequest.placeholder` 或從記憶體快取解析之前會有一格 (frame) 的延遲。

## [3.0.0-alpha07] - 2024 年 6 月 26 日

- **破壞性變更**：`AsyncImagePainter` 預設不再等待 `onDraw`，而是使用 `Size.ORIGINAL`。
    - 這修正了[與 Roborazzi/Paparazzi 的相容性問題](https://github.com/coil-kt/coil/issues/1910)並全面提升測試可靠性。
    - 若要恢復為等待 `onDraw`，請將 `DrawScopeSizeResolver` 設定為您的 `ImageRequest.sizeResolver`。
- **破壞性變更**：重構多平台 `Image` API。值得注意的是，`asCoilImage` 已重新命名為 `asImage`。
- **破壞性變更**：`AsyncImagePainter.state` 已變更為 `StateFlow<AsyncImagePainter.State>`。請使用 `collectAsState` 觀察其值。這提升了效能。
- **破壞性變更**：`AsyncImagePainter.imageLoader` 與 `AsyncImagePainter.request` 已合併為 `StateFlow<AsyncImagePainter.Inputs>`。請使用 `collectAsState` 觀察其值。這提升了效能。
- **破壞性變更**：移除對 `android.resource://example.package.name/drawable/image` URI 的支援，因為它會阻礙資源縮減最佳化。
    - 若您仍需此功能，可以[手動將 `ResourceUriMapper` 包含在您的元件登錄中](https://github.com/coil-kt/coil/blob/main/coil-core/src/androidInstrumentedTest/kotlin/coil3/map/ResourceUriMapper.kt)。
- **新增**：引入 `AsyncImagePreviewHandler` 以支援控制 `AsyncImagePainter` 的預覽渲染行為。
    - 使用 `LocalAsyncImagePreviewHandler` 覆寫預覽行為。
    - 作為此變更及其他 `coil-compose` 改進的一部分，`AsyncImagePainter` 現在預設嘗試執行 `ImageRequest`，而非預設顯示 `ImageRequest.placeholder`。[使用網路或檔案的請求預期在預覽環境中會失敗](https://developer.android.com/develop/ui/compose/tooling/previews#preview-limitations)，但 Android 資源應該可以運作。
- **新增**：支援按影格索引擷取影片影像。([#2183](https://github.com/coil-kt/coil/pull/2183))
- **新增**：支援將 `CoroutineContext` 傳遞給任何 `CoroutineDispatcher` 方法。([#2241](https://github.com/coil-kt/coil/pull/2241))。
- **新增**：在 JS 與 WASM JS 上支援弱參照記憶體快取。
- 在 Compose 中不發派至 `Dispatchers.Main.immediate`。副作用是，JVM 上不再需要匯入 [`kotlinx-coroutines-swing`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-swing/)。
- 在 Compose 中不呼叫 `async` 且不建立 disposable 以提升效能（感謝 @mlykotom！）。([#2205](https://github.com/coil-kt/coil/pull/2205))
- 修正將全域 `ImageLoader` extras 傳遞給 `Options` 的問題。([#2223](https://github.com/coil-kt/coil/pull/2223))
- 修正 `crossfade(false)` 在非 Android 目標上無效的問題。
- 修正 VP8X 特性旗標位元組偏移量 ([#2199](https://github.com/coil-kt/coil/pull/2199))。
- 將非 Android 目標上的 `SvgDecoder` 轉換為渲染至位元圖，而非在繪製時渲染影像。這提升了效能。
    - 此行為可使用 `SvgDecoder(renderToBitmap)` 進行控制。
- 將 `ScaleDrawable` 從 `coil-gif` 移至 `coil-core`。
- 更新 Kotlin 至 2.0.0。
- 更新 Compose 至 1.6.11。
- 更新 Okio 至 3.9.0。
- 更新 Skiko 至 0.8.4。
- [關於 3.x 的重要變更完整清單，請查看升級指南。](/coil/migrating_to_coil3/)

## [3.0.0-alpha06] - 2024 年 2 月 29 日

- 將 Skiko 降級至 0.7.93。
- [關於 3.x 的重要變更完整清單，請查看升級指南。](/coil/migrating_to_coil3/)

## [3.0.0-alpha05] - 2024 年 2 月 28 日

- **新增**：支援 `wasmJs` 目標。
- 建立 `DrawablePainter` 與 `DrawableImage` 以支援在非 Android 平台上繪製非位元圖支援的 `Image`。
    - `Image` API 為實驗性，且可能在 alpha 版本之間發生變更。
- 更新 `ContentPainterModifier` 以實作 `Modifier.Node`。
- 修正：在背景執行緒上延遲註冊元件回呼與網路觀察程式。這修正了通常會發生在主執行緒上的初始化緩慢問題。
- 修正：修正 `ImageLoader.Builder.placeholder/error/fallback` 未被 `ImageRequest` 使用的問題。
- 更新 Compose 至 1.6.0。
- 更新協同程式至 1.8.0。
- 更新 Okio 至 3.8.0。
- 更新 Skiko 至 0.7.94。
- [關於 3.x 的重要變更完整清單，請查看升級指南。](/coil/migrating_to_coil3/)

## [2.6.0] - 2024 年 2 月 23 日

- 讓 `rememberAsyncImagePainter`、`AsyncImage` 與 `SubcomposeAsyncImage` 成為[可重新啟動且可跳過](https://developer.android.com/jetpack/compose/performance/stability#functions)。這透過避免重新組合（除非可組合項的引數之一發生變更）來提升效能。
    - 為 `rememberAsyncImagePainter`、`AsyncImage` 與 `SubcomposeAsyncImage` 加入選用的 `modelEqualityDelegate` 引數，以控制 `model` 是否會觸發重新組合。
- 更新 `ContentPainterModifier` 以實作 `Modifier.Node`。
- 修正：在背景執行緒上延遲註冊元件回呼與網路觀察程式。這修正了通常會發生在主執行緒上的初始化緩慢問題。
- 修正：若 `ImageRequest.listener` 或 `ImageRequest.target` 變更，避免在 `rememberAsyncImagePainter`、`AsyncImage` 與 `SubcomposeAsyncImage` 中重新啟動新的影像請求。
- 修正：在 `AsyncImagePainter` 中不要觀察影像請求兩次。
- 更新 Kotlin 至 1.9.22。
- 更新 Compose 至 1.6.1。
- 更新 Okio 至 3.8.0。
- 更新 `androidx.collection` 至 1.4.0。
- 更新 `androidx.lifecycle` 至 2.7.0。

## [3.0.0-alpha04] - 2024 年 2 月 1 日

- **破壞性變更**：從 `OkHttpNetworkFetcherFactory` 與 `KtorNetworkFetcherFactory` 的公開 API 中移除 `Lazy`。
- 在 `OkHttpNetworkFetcherFactory` 中公開 `Call.Factory` 而非 `OkHttpClient`。
- 將 `NetworkResponseBody` 轉換為封裝 `ByteString`。
- 將 Compose 降級至 1.5.12。
- [關於重要變更的完整清單，請查看升級指南。](/coil/migrating_to_coil3/)

## [3.0.0-alpha03] - 2024 年 1 月 20 日

- **破壞性變更**：`coil-network` 已重新命名為 `coil-network-ktor`。此外，新增了依賴於 OkHttp 且不需要指定 Ktor 引擎的 `coil-network-okhttp` 構件。
    - 根據您匯入的構件，您可以使用 `KtorNetworkFetcherFactory` 或 `OkHttpNetworkFetcherFactory` 手動參照 `Fetcher.Factory`。
- 支援在 Apple 平台上載入 `NSUrl`。
- 為 `AsyncImage` 加入 `clipToBounds` 參數。
- [關於重要變更的完整清單，請查看升級指南。](/coil/migrating_to_coil3/)

## [3.0.0-alpha02] - 2024 年 1 月 10 日

- **破壞性變更**：`coil-gif`、`coil-network`、`coil-svg` 與 `coil-video` 的套件已更新，使其所有類別分別屬於 `coil.gif`、`coil.network`、`coil.svg` 與 `coil.video`。這有助於避免與其他構件的類別名稱衝突。
- **破壞性變更**：`ImageDecoderDecoder` 已重新命名為 `AnimatedImageDecoder`。
- **新增**：`coil-gif`、`coil-network`、`coil-svg` 與 `coil-video` 的元件現在會自動加入各個 `ImageLoader` 的 `ComponentRegistry` 中。
    - 需明確說明的是，與 `3.0.0-alpha01` 不同，**您不需要手動將 `NetworkFetcher.Factory()` 加入您的 `ComponentRegistry`**。只需匯入 `io.coil-kt.coil3:coil-network:[version]` 與 [Ktor 引擎](https://ktor.io/docs/http-client-engines.html#dependencies) 即可載入網路影像。
    - 手動將這些元件加入 `ComponentRegistry` 也是安全的。任何手動加入的元件優先權高於自動加入的元件。
    - 若有需要，可以使用 `ImageLoader.Builder.serviceLoaderEnabled(false)` 停用此行為。
- **新增**：在所有平台上支援 `coil-svg`。它在 Android 上由 [AndroidSVG](https://bigbadaboom.github.io/androidsvg/) 支援，在非 Android 平台上由 [SVGDOM](https://api.skia.org/classSkSVGDOM.html) 支援。
- Coil 現在在內部使用 Android 的 [`ImageDecoder`](https://developer.android.com/reference/android/graphics/ImageDecoder) API，在直接從檔案、資源或內容 URI 解碼時具有效能優勢。
- 修正：多個 `coil3.Uri` 剖析修正。
- [關於重要變更的完整清單，請查看升級指南。](/coil/migrating_to_coil3/)

## [3.0.0-alpha01] - 2023 年 12 月 30 日

- **新增**：[Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) 支援。Coil 現在是一個支援 Android、JVM、iOS、macOS 與 Javascript 的 Kotlin 多平台程式庫。
- Coil 的 Maven 座標已更新為 `io.coil-kt.coil3`，其匯入已更新為 `coil3`。這允許 Coil 3 與 Coil 2 並行執行而不會有二進位相容性問題。例如，`io.coil-kt:coil:[version]` 現在改為 `io.coil-kt.coil3:coil:[version]`。
- `coil-base` 與 `coil-compose-base` 構件分別重新命名為 `coil-core` 與 `coil-compose-core`，以符合協同程式、Ktor 與 AndroidX 使用的命名慣例。
- [關於重要變更的完整清單，請查看升級指南。](/coil/migrating_to_coil3/)

## [2.5.0] - 2023 年 10 月 30 日

- **新增**：在 `coil-video` 中加入 `MediaDataSourceFetcher.Factory` 以支援解碼 `MediaDataSource` 實作。([#1795](https://github.com/coil-kt/coil/pull/1795))
- 將 `SHIFT6m` 裝置加入硬體位元圖黑名單。([#1812](https://github.com/coil-kt/coil/pull/1812))
- 修正：防範傳回具有一個無界維度大小的繪製器。([#1826](https://github.com/coil-kt/coil/pull/1826))
- 修正：當快取標頭包含非 ASCII 字元時，`304 Not Modified` 後的磁碟快取載入失敗。([#1839](https://github.com/coil-kt/coil/pull/1839))
- 修正：`FakeImageEngine` 未更新攔截器鏈的請求。([#1905](https://github.com/coil-kt/coil/pull/1905))
- 更新編譯 SDK 至 34。
- 更新 Kotlin 至 1.9.10。
- 更新協同程式至 1.7.3。
- 更新 `accompanist-drawablepainter` 至 0.32.0。
- 更新 `androidx.annotation` 至 1.7.0。
- 更新 `androidx.compose.foundation` 至 1.5.4。
- 更新 `androidx.core` 至 1.12.0。
- 更新 `androidx.exifinterface:exifinterface` 至 1.3.6。
- 更新 `androidx.lifecycle` 至 2.6.2。
- 更新 `com.squareup.okhttp3` 至 4.12.0。
- 更新 `com.squareup.okio` 至 3.6.0。

## [2.4.0] - 2023 年 5 月 21 日

- 將 `DiskCache` 的 `get`/`edit` 重新命名為 `openSnapshot`/`openEditor`。
- 在 `AsyncImagePainter` 中不自動將 `ColorDrawable` 轉換為 `ColorPainter`。
- 使用 `@NonRestartableComposable` 註解簡單的 `AsyncImage` 多載。
- 修正：在 `ImageSource` 中延遲呼叫 `Context.cacheDir`。
- 修正：修正發佈 `coil-bom` 的問題。
- 修正：修正若停用硬體位元圖時，位元圖配置一律設為 `ARGB_8888` 的問題。
- 更新 Kotlin 至 1.8.21。
- 更新協同程式至 1.7.1。
- 更新 `accompanist-drawablepainter` 至 0.30.1。
- 更新 `androidx.compose.foundation` 至 1.4.3。
- 更新 `androidx.profileinstaller:profileinstaller` 至 1.3.1。
- 更新 `com.squareup.okhttp3` 至 4.11.0。

## [2.3.0] - 2023 年 3 月 25 日

- **新增**：引入新的 `coil-test` 構件，其中包含 `FakeImageLoaderEngine`。此類別對於寫死影像載入器回應非常有用，以確保測試中獲得一致且同步（來自主執行緒）的回應。詳情請見[此處](https://coil-kt.github.io/coil/testing)。
- **新增**：將 [baseline profiles](https://developer.android.com/topic/performance/baselineprofiles/overview) 加入 `coil-base`（`coil` 的子模組）與 `coil-compose-base`（`coil-compose` 的子模組）。
    - 這提升了 Coil 的執行階段效能，並應根據 Coil 在應用程式中的使用方式提供[更好的影格時序](https://github.com/coil-kt/coil/tree/main/coil-benchmark/benchmark_output.md)。
- 修正：修正剖析包含編碼資料的 `file://` URI。[#1601](https://github.com/coil-kt/coil/pull/1601)
- 修正：`DiskCache` 現在若被傳遞不存在的目錄，能正確計算其最大大小。[#1620](https://github.com/coil-kt/coil/pull/1620)
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

## [2.2.2] - 2022 年 10 月 1 日

- 確保影像載入器在註冊系統回呼之前已完全初始化。[#1465](https://github.com/coil-kt/coil/pull/1465)
- 在 API 30+ 的 `VideoFrameDecoder` 中設定偏好的位元圖配置以避免出現色帶。[#1487](https://github.com/coil-kt/coil/pull/1487)
- 修正 `FileUriMapper` 中剖析包含 `#` 的路徑。[#1466](https://github.com/coil-kt/coil/pull/1466)
- 修正從磁碟快取讀取具有非 ASCII 標頭的回應。[#1468](https://github.com/coil-kt/coil/pull/1468)
- 修正解碼資產 (asset) 子資料夾內的影片。[#1489](https://github.com/coil-kt/coil/pull/1489)
- 更新 `androidx.annotation` 至 1.5.0。

## [2.2.1] - 2022 年 9 月 8 日

- 修正：`RoundedCornersTransformation` 現在能正確縮放 `input` 位元圖。
- 移除對 `kotlin-parcelize` 外掛程式的相依性。
- 更新編譯 SDK 至 33。
- 將 `androidx.appcompat:appcompat-resources` 降級至 1.4.2 以解決 [#1423](https://github.com/coil-kt/coil/issues/1423) 的問題。

## [2.2.0] - 2022 年 8 月 16 日

- **新增**：為 `coil-video` 加入 `ImageRequest.videoFramePercent` 以支援將影片影格指定為影片總長度的百分比。
- **新增**：加入 `ExifOrientationPolicy` 以配置 `BitmapFactoryDecoder` 如何處理 EXIF 轉向資料。
- 修正：若傳遞具有未定義維度的大小，不要在 `RoundedCornersTransformation` 中拋出例外。
- 修正：將 GIF 的影格延遲讀取為兩個無符號位元組，而非一個有符號位元組。
- 更新 Kotlin 至 1.7.10。
- 更新協同程式至 1.6.4。
- 更新 Compose 至 1.2.1。
- 更新 OkHttp 至 4.10.0。
- 更新 Okio 至 3.2.0。
- 更新 `accompanist-drawablepainter` 至 0.25.1。
- 更新 `androidx.annotation` 至 1.4.0。
- 更新 `androidx.appcompat:appcompat-resources` 至 1.5.0。
- 更新 `androidx.core` 至 1.8.0。

## [2.1.0] - 2022 年 5 月 17 日

- **新增**：支援載入 `ByteArray`。([#1202](https://github.com/coil-kt/coil/pull/1202))
- **新增**：支援使用 `ImageRequest.Builder.css` 為 SVG 設定自訂 CSS 規則。([#1210](https://github.com/coil-kt/coil/pull/1210))
- 修正：將 `GenericViewTarget` 的私有方法轉換為受保護 (protected) 方法。([#1273](https://github.com/coil-kt/coil/pull/1273))
- 更新編譯 SDK 至 32。([#1268](https://github.com/coil-kt/coil/pull/1268))

## [2.0.0] - 2022 年 5 月 10 日

Coil 2.0.0 是程式庫的一個重大疊代版本，包含破壞性變更。關於如何升級，請查看[升級指南](/coil/migrating)。

- **新增**：在 `coil-compose` 中引入 `AsyncImage`。更多資訊請查看[文件](https://coil-kt.github.io/coil/compose/)。

```kotlin
// 從網路顯示影像。
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
)

// 從網路顯示影像，並包含占位符號、圓形剪裁與淡入淡出動畫。
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
    - 使用 `ImageLoader.Builder.diskCache` 與 `DiskCache.Builder` 配置磁碟快取。
    - 您不應將 OkHttp 的 `Cache` 與 Coil 2.0 一起使用。詳情請見[此處](/coil/migrating_to_coil2/#disk-cache)。
    - 仍支援 `Cache-Control` 與其他快取標頭——除了 `Vary` 標頭，因為快取僅檢查 URL 是否相符。此外，僅快取回應代碼在 [200..300) 範圍內的回應。
    - 升級至 2.0 時，現有的磁碟快取將被清除。
- 最低支援的 API 現在為 21。
- `ImageRequest` 的預設 `Scale` 現在為 `Scale.FIT`。
    - 此變更旨在使 `ImageRequest.scale` 與其他具有預設 `Scale` 的類別保持一致。
    - 具有 `ImageViewTarget` 的請求仍會自動偵測其 `Scale`。
- 重構影像管線類別：
    - `Mapper`、`Fetcher` 與 `Decoder` 已重構以提供更大的靈活性。
    - `Fetcher.key` 已替換為新的 `Keyer` 介面。`Keyer` 從輸入資料建立快取金鑰。
    - 加入 `ImageSource`，允許 `Decoder` 使用 Okio 的檔案系統 API 直接讀取 `File`。
- 重構 Jetpack Compose 整合：
    - `rememberImagePainter` 與 `ImagePainter` 已分別重新命名為 `rememberAsyncImagePainter` 與 `AsyncImagePainter`。
    - 棄用 `LocalImageLoader`。更多資訊請查看棄用訊息。
- 停用產生執行階段非 Null 斷言。
    - 若您使用 Java，將 null 作為加上非 Null 註解的引數傳遞給函式時，將不再立即拋出 `NullPointerException`。Kotlin 的編譯時期 Null 安全性可防止這種情況發生。
    - 此變更有助於縮小程式庫的大小。
- `Size` 現在由寬度與高度的兩個 `Dimension` 值組成。`Dimension` 可以是正像素值或 `Dimension.Undefined`。詳情請見[此處](/coil/migrating#size-refactor)。
- 已從程式庫中移除 `BitmapPool` 與 `PoolableViewTarget`。
- 已從程式庫中移除 `VideoFrameFileFetcher` 與 `VideoFrameUriFetcher`。請改用支援所有資料來源的 `VideoFrameDecoder`。
- 已從程式庫中移除 [`BlurTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/BlurTransformation.kt) 與 [`GrayscaleTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/GrayscaleTransformation.kt)。若您仍需使用它們，可以將其程式碼複製到您的專案中。
- 將 `Transition.transition` 變更為非暫停函式，因為不再需要暫停轉換直至完成。
- 加入 `GenericViewTarget`，處理通用的 `ViewTarget` 邏輯。
- 將 `bitmapFactoryMaxParallelism` 加入支援，用於限制進行中的 `BitmapFactory` 作業數量。此值預設為 4，可提升 UI 效能。
- 加入對 `interceptorDispatcher`、`fetcherDispatcher`、`decoderDispatcher` 與 `transformationDispatcher` 的支援。
- 加入 `ByteBuffer` 至預設支援的資料型別。
- `Disposable` 已重構並公開底層 `ImageRequest` 的工作 (job)。
- 重構 `MemoryCache` API。
- 若 `ImageRequest.fallback` 為 null，則現在會在 `Target` 上設定 `ImageRequest.error`。
- `Transformation.key` 已替換為 `Transformation.cacheKey`。
- 更新 Kotlin 至 1.6.10。
- 更新 Compose 至 1.1.1。
- 更新 OkHttp 至 4.9.3。
- 更新 Okio 至 3.0.0。

自 `2.0.0-rc03` 以來的變更：
- 將 `Dimension.Original` 轉換為 `Dimension.Undefined`。
    - 這稍微變更了非像素維度的語義，以修正尺寸系統中的一些邊緣情況（[範例](https://github.com/coil-kt/coil/issues/1246)）。
- 若 ContentScale 為 None，則以 `Size.ORIGINAL` 載入影像。
- 修正優先套用 `ImageView.load` 建構器引數而非最後套用的問題。
- 修正回應未修改時不合併 HTTP 標頭的問題。

## [2.0.0-rc03] - 2022 年 4 月 11 日

- 移除 `ScaleResolver` 介面。
- 將 `Size` 建構函式轉換為函式。
- 將 `Dimension.Pixels` 的 `toString` 變更為僅包含其像素值。
- 防範 `SystemCallbacks.onTrimMemory` 中罕見的崩潰。
- 更新協同程式至 1.6.1。

## [2.0.0-rc02] - 2022 年 3 月 20 日

- 將 `ImageRequest` 的預設大小還原為當前顯示器的大小，而非 `Size.ORIGINAL`。
- 修正 `DiskCache.Builder` 被標記為實驗性的問題。僅 `DiskCache` 的方法是實驗性的。
- 修正將影像載入具有一個維度為 `WRAP_CONTENT` 的 `ImageView` 時，會以原始大小載入影像而非適配有界維度的情況。
- 從 `MemoryCache.Key`、`MemoryCache.Value` 與 `Parameters.Entry` 中移除元件函式。

## [2.0.0-rc01] - 2022 年 3 月 2 日

自 `1.4.0` 以來的重大變更：

- 最低支援的 API 現在為 21。
- 重構 Jetpack Compose 整合。
    - `rememberImagePainter` 已重新命名為 `rememberAsyncImagePainter`。
    - 加入對 `AsyncImage` 與 `SubcomposeAsyncImage` 的支援。更多資訊請查看[文件](https://coil-kt.github.io/coil/compose/)。
    - 棄用 `LocalImageLoader`。更多資訊請查看棄用訊息。
- Coil 2.0 擁有自己的磁碟快取實作，不再依賴 OkHttp 進行磁碟快取。
    - 使用 `ImageLoader.Builder.diskCache` 與 `DiskCache.Builder` 配置磁碟快取。
    - 您 **不應** 將 OkHttp 的 `Cache` 與 Coil 2.0 一起使用，因為若在寫入時執行緒被中斷，快取可能會損毀。
    - 仍支援 `Cache-Control` 與其他快取標頭——除了 `Vary` 標頭，因為快取僅檢查 URL 是否相符。此外，僅快取回應代碼在 [200..300) 範圍內的回應。
    - 升級至 2.0 時，現有的磁碟快取將被清除。
- `ImageRequest` 的預設 `Scale` 現在為 `Scale.FIT`。
    - 此變更旨在使 `ImageRequest.scale` 與其他具有預設 `Scale` 的類別保持一致。
    - 具有 `ImageViewTarget` 的請求仍會自動偵測其 `Scale`。
- `ImageRequest` 的預設大小現在為 `Size.ORIGINAL`。
- 重構影像管線類別：
    - `Mapper`、`Fetcher` 與 `Decoder` 已重構以提供更大的靈活性。
    - `Fetcher.key` 已替換為新的 `Keyer` 介面。`Keyer` 從輸入資料建立快取金鑰。
    - 加入 `ImageSource`，允許 `Decoder` 使用 Okio 的檔案系統 API 直接讀取 `File`。
- 停用產生執行階段非 Null 斷言。
    - 若您使用 Java，將 null 作為加上非 Null 參數的引數傳遞給函式時，將不再立即拋出 `NullPointerException`。Kotlin 的編譯時期 Null 安全性可防止這種情況發生。
    - 此變更有助於縮小程式庫的大小。
- `Size` 現在由寬度與高度的兩個 `Dimension` 值組成。`Dimension` 可以是正像素值或 `Dimension.Original`。
- 已從程式庫中移除 `BitmapPool` 與 `PoolableViewTarget`。
- 已從程式庫中移除 `VideoFrameFileFetcher` 與 `VideoFrameUriFetcher`。請改用支援所有資料來源的 `VideoFrameDecoder`。
- 已從程式庫中移除 [`BlurTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/BlurTransformation.kt) 與 [`GrayscaleTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/GrayscaleTransformation.kt)。若您仍需使用它們，可以將其程式碼複製到您的專案中。
- 將 `Transition.transition` 變更為非暫停函式，因為不再需要暫停轉換直至完成。
- 加入 `bitmapFactoryMaxParallelism` 支援，用於限制進行中的 `BitmapFactory` 作業數量。此值預設為 4，可提升 UI 效能。
- 加入對 `interceptorDispatcher`、`fetcherDispatcher`、`decoderDispatcher` 與 `transformationDispatcher` 的支援。
- 加入 `GenericViewTarget`，處理通用的 `ViewTarget` 邏輯。
- 加入 `ByteBuffer` 至預設支援的資料型別。
- `Disposable` 已重構並公開底層 `ImageRequest` 的工作 (job)。
- 重構 `MemoryCache` API。
- 若 `ImageRequest.fallback` 為 null，則現在會在 `Target` 上設定 `ImageRequest.error`。
- `Transformation.key` 已替換為 `Transformation.cacheKey`。
- 更新 Kotlin 至 1.6.10。
- 更新 Compose 至 1.1.1。
- 更新 OkHttp 至 4.9.3。
- 更新 Okio 至 3.0.0。

自 `2.0.0-alpha09` 以來的變更：

- 移除 `-Xjvm-default=all` 編譯旗標。
- 修正若多個包含 must-revalidate/e-tag 的請求同時執行時，載入影像失敗的問題。
- 修正若 `<svg` 標籤後有換行字元時，`DecodeUtils.isSvg` 傳回 false 的問題。
- 使 `LocalImageLoader.provides` 棄用訊息更清晰。
- 更新 Compose 至 1.1.1。
- 更新 `accompanist-drawablepainter` 至 0.23.1。

## [2.0.0-alpha09] - 2022 年 2 月 16 日

- 修正 `AsyncImage` 建立無效限制的問題。([#1134](https://github.com/coil-kt/coil/pull/1134))
- 為 `AsyncImagePainter` 加入 `ContentScale` 引數。([#1144](https://github.com/coil-kt/coil/pull/1144))
    - 此引數應設為與 `Image` 上設定的相同值，以確保影像以正確的大小載入。
- 加入 `ScaleResolver` 以支援延遲解析 `ImageRequest` 的 `Scale`。([#1134](https://github.com/coil-kt/coil/pull/1134))
    - `ImageRequest.scale` 應由 `ImageRequest.scaleResolver.scale()` 替換。
- 更新 Compose 至 1.1.0。
- 更新 `accompanist-drawablepainter` 至 0.23.0。
- 更新 `androidx.lifecycle` 至 2.4.1。

## [2.0.0-alpha08] - 2022 年 2 月 7 日

- 更新 `DiskCache` 與 `ImageSource` 以使用 Okio 的 `FileSystem` API。([#1115](https://github.com/coil-kt/coil/pull/1115))

## [2.0.0-alpha07] - 2022 年 1 月 30 日

- 顯著提升 `AsyncImage` 效能，並將 `AsyncImage` 拆分為 `AsyncImage` 與 `SubcomposeAsyncImage`。([#1048](https://github.com/coil-kt/coil/pull/1048))
    - `SubcomposeAsyncImage` 提供 `loading`/`success`/`error`/`content` 插槽 API 並使用次組合 (subcomposition)，效能較差。
    - `AsyncImage` 提供 `placeholder`/`error`/`fallback` 引數來覆寫載入時或請求失敗時繪製的 `Painter`。`AsyncImage` 不使用次組合，效能遠優於 `SubcomposeAsyncImage`。
    - 從 `SubcomposeAsyncImage.content` 中移除 `AsyncImagePainter.State` 引數。如有需要，請使用 `painter.state`。
    - 為 `AsyncImage` 與 `SubcomposeAsyncImage` 同時加入 `onLoading`/`onSuccess`/`onError` 回呼。
- 棄用 `LocalImageLoader`。([#1101](https://github.com/coil-kt/coil/pull/1101))
- 加入對 `ImageRequest.tags` 的支援。([#1066](https://github.com/coil-kt/coil/pull/1066))
- 將 `DecodeUtils` 中的 `isGif`、`isWebP`、`isAnimatedWebP`、`isHeif` 與 `isAnimatedHeif` 移至 coil-gif。將 `isSvg` 加入 coil-svg。([#1117](https://github.com/coil-kt/coil/pull/1117))
- 將 `FetchResult` 與 `DecodeResult` 轉換為非資料類別。([#1114](https://github.com/coil-kt/coil/pull/1114))
- 移除未使用的 `DiskCache.Builder` context 引數。([#1099](https://github.com/coil-kt/coil/pull/1099))
- 修正原始大小位元圖資源的縮放問題。([#1072](https://github.com/coil-kt/coil/pull/1072))
- 修正 `ImageDecoderDecoder` 中關閉 `ImageDecoder` 失敗的問題。([#1109](https://github.com/coil-kt/coil/pull/1109))
- 修正將可繪製對象轉換為位元圖時縮放不正確的問題。([#1084](https://github.com/coil-kt/coil/pull/1084))
- 更新 Compose 至 1.1.0-rc03。
- 更新 `accompanist-drawablepainter` 至 0.22.1-rc。
- 更新 `androidx.appcompat:appcompat-resources` 至 1.4.1。

## [2.0.0-alpha06] - 2021 年 12 月 24 日

- 加入 `ImageSource.Metadata` 以支援從資產 (assets)、資源 (resources) 與內容 URI 解碼，而無需緩衝或暫存檔案。([#1060](https://github.com/coil-kt/coil/pull/1060))
- 延遲執行影像請求，直到 `AsyncImage` 具有正向限制。([#1028](https://github.com/coil-kt/coil/pull/1028))
- 修正當 `loading`、`success` 與 `error` 都設定時，`AsyncImage` 未使用 `DefaultContent` 的問題。([#1026](https://github.com/coil-kt/coil/pull/1026))
- 使用 androidx `LruCache` 取代平台 `LruCache`。([#1047](https://github.com/coil-kt/coil/pull/1047))
- 更新 Kotlin 至 1.6.10。
- 更新協同程式至 1.6.0。
- 更新 Compose 至 1.1.0-rc01。
- 更新 `accompanist-drawablepainter` 至 0.22.0-rc。
- 更新 `androidx.collection` 至 1.2.0。

## [2.0.0-alpha05] - 2021 年 11 月 28 日

- **重要**：重構 `Size` 以支援在任一維度使用影像的原始大小。
    - `Size` 現在由寬度與高度的兩個 `Dimension` 值組成。`Dimension` 可以是正像素值或 `Dimension.Original`。
    - 此變更是為了在一個維度為固定像素值時，更好地支援無界寬度/高度值（例如 `wrap_content`、`Constraints.Infinity`）。
- 修正：為 `AsyncImage` 支援檢查模式 (inspection mode)（預覽）。
- 修正：若 `imageLoader.memoryCache` 為 null，則 `SuccessResult.memoryCacheKey` 應始終為 `null`。
- 將 `ImageLoader`、`SizeResolver` 與 `ViewSizeResolver` 類建構函式的 `invoke` 函式轉換為頂層函式。
- 將 `CrossfadeDrawable` 的起始與結束可繪製對象設為公開 API。
- 變更 `ImageLoader` 的 placeholder/error/fallback 可繪製對象。
- 為 `SuccessResult` 的建構函式加入預設引數。
- 依賴 `androidx.collection` 而非 `androidx.collection-ktx`。
- 更新 OkHttp 至 4.9.3。

## [2.0.0-alpha04] - 2021 年 11 月 22 日

- **新增**：在 `coil-compose` 中加入 `AsyncImage`。
    - `AsyncImage` 是一個非同步執行 `ImageRequest` 並渲染結果的可組合項。
    - **`AsyncImage` 旨在為大多數使用案例取代 `rememberImagePainter`。**
    - 其 API 尚未最終定案，可能會在 2.0 正式版之前發生變更。
    - 它具有與 `Image` 類似的 API 並支援相同的引數：`Alignment`、`ContentScale`、`alpha`、`ColorFilter` 與 `FilterQuality`。
    - 它支援使用 `content`、`loading`、`success` 與 `error` 引數覆寫各個 `AsyncImagePainter` 狀態的繪製內容。
    - 它修正了 `rememberImagePainter` 在解析影像大小與比例方面的若干設計問題。
    - 使用範例：

```kotlin
// 僅繪製影像。
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null, // 若可能，請避免 `null` 並設定為在地化字串。
)

// 繪製包含圓形剪裁、淡入淡出的影像，並覆寫 `loading` 狀態。
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

// 繪製包含圓形剪裁、淡入淡出的影像，並覆寫所有狀態。
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
        AsyncImageContent() // 繪製影像。
    }
}
```

- **重要**：將 `ImagePainter` 重新命名為 `AsyncImagePainter`，並將 `rememberImagePainter` 重新命名為 `rememberAsyncImagePainter`。
    - 不再支援 `ExecuteCallback`。若要讓 `AsyncImagePainter` 跳過等待 `onDraw` 被呼叫，請改為設定 `ImageRequest.size(OriginalSize)`（或任何大小）。
    - 為 `rememberAsyncImagePainter` 加入選用的 `FilterQuality` 引數。
- 在 `DiskCache` 中使用協同程式進行清理作業，並加入 `DiskCache.Builder.cleanupDispatcher`。
- 修正使用 `ImageLoader.Builder.placeholder` 設定的占位符號在 Compose 預覽中的顯示問題。
- 使用 `@ReadOnlyComposable` 標記 `LocalImageLoader.current` 以產生更有效率的程式碼。
- 更新 Compose 至 1.1.0-beta03 並依賴 `compose.foundation` 而非 `compose.ui`。
- 更新 `androidx.appcompat-resources` 至 1.4.0。

## [2.0.0-alpha03] - 2021 年 11 月 12 日

- 加入在 Android 29+ 上載入音樂縮圖的功能。([#967](https://github.com/coil-kt/coil/pull/967))
- 修正：使用 `context.resources` 載入當前套件的資源。([#968](https://github.com/coil-kt/coil/pull/968))
- 修正：`clear` -> `dispose` 的取代運算式。([#970](https://github.com/coil-kt/coil/pull/970))
- 更新 Compose 至 1.0.5。
- 更新 `accompanist-drawablepainter` 至 0.20.2。
- 更新 Okio 至 3.0.0。
- 更新 `androidx.annotation` 至 1.3.0。
- 更新 `androidx.core` 至 1.7.0。
- 更新 `androidx.lifecycle` 至 2.4.0。
    - 移除對 `lifecycle-common-java8` 的相依性，因其已併入 `lifecycle-common`。

## [2.0.0-alpha02] - 2021 年 10 月 24 日

- 加入新的 `coil-bom` 構件，其中包含 [物料清單 (bill of materials)](https://docs.gradle.org/7.2/userguide/platforms.html#sub:bom_import)。
    - 匯入 `coil-bom` 允許您依賴其他 Coil 構件而無需指定版本。
- 修正使用 `ExecuteCallback.Immediate` 時影像載入失敗的問題。
- 更新 Okio 至 3.0.0-alpha.11。
    - 這也解決了與 Okio 3.0.0-alpha.11 的相容性問題。
- 更新 Kotlin 至 1.5.31。
- 更新 Compose 至 1.0.4。

## [2.0.0-alpha01] - 2021 年 10 月 11 日

Coil 2.0.0 是程式庫的下一個主要疊代版本，包含新功能、效能提升、API 改進與各種錯誤修正。在 2.0.0 穩定版發佈之前，此版本可能與未來的 alpha 版本在二進位/原始碼方面不相容。

- **重要**：最低支援的 API 現在為 21。
- **重要**：啟用 `-Xjvm-default=all`。
    - 這會產生 Java 8 預設方法，而非使用 Kotlin 的預設介面方法支援。更多資訊請查看[這篇部落格文章](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/)。
    - **您也需要在組建檔案中加入 `-Xjvm-default=all` 或 `-Xjvm-default=all-compatibility`。** 關於如何操作請參閱[此處](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8)。
- **重要**：Coil 現在擁有自己的磁碟快取實作，不再依賴 OkHttp 進行磁碟快取。
    - 此項變更是為了：
        - 在解碼影像時更好地支援執行緒中斷。這提升了影像請求快速連續啟動與停止時的效能。
        - 支援公開由 `File` 支援的 `ImageSource`。這避免了 Android API 需要 `File` 進行解碼（例如 `MediaMetadataRetriever`）時不必要的複製。
        - 支援直接從磁碟快取檔案讀取/寫入。
    - 使用 `ImageLoader.Builder.diskCache` 與 `DiskCache.Builder` 配置磁碟快取。
    - 您 **不應** 將 OkHttp 的 `Cache` 與 Coil 2.0 一起使用，因為若在寫入時中斷，快取可能會損毀。
    - 仍支援 `Cache-Control` 與其他快取標頭——除了 `Vary` 標頭，因為快取僅檢查 URL 是否相符。此外，僅快取回應代碼在 [200..300) 範圍內的回應。
    - 支援快取標頭的功能可透過 `ImageLoader.Builder.respectCacheHeaders` 啟用或停用。
    - 升級至 2.0 時，現有的磁碟快取將被清除並重新建置。
- **重要**：`ImageRequest` 的預設 `Scale` 現在為 `Scale.FIT`。
    - 此變更旨在使 `ImageRequest.scale` 與其他具有預設 `Scale` 的類別保持一致。
    - 具有 `ImageViewTarget` 的請求仍會自動偵測其比例。
- 影像管線類別的重大變更：
    - `Mapper`、`Fetcher` 與 `Decoder` 已重構以提供更大的靈活性。
    - `Fetcher.key` 已替換為新的 `Keyer` 介面。`Keyer` 從輸入資料建立快取金鑰。
    - 加入 `ImageSource`，允許 `Decoder` 直接解碼 `File`。
- 已從程式庫中移除 `BitmapPool` 與 `PoolableViewTarget`。位元圖池化被移除的原因如下：
    - 它在 <= API 23 上最有效，但在較新的 Android 版本中效能逐漸下降。
    - 移除位元圖池化允許 Coil 使用不可變位元圖，這具有效能優勢。
    - 管理位元圖池有執行階段開銷。
    - 位元圖池化對 Coil 的 API 造成了設計限制，因為它需要追蹤位元圖是否符合池化條件。移除位元圖池化允許 Coil 在更多地方公開結果 `Drawable`（例如 `Listener`、`Disposable`）。此外，這意味著 Coil 不必清除 `ImageView`，這曾導致一些[問題](https://github.com/coil-kt/coil/issues/650)。
    - 位元圖池化[容易出錯](https://github.com/coil-kt/coil/issues/546)。分配一個新的位元圖比嘗試重複使用一個可能仍在使用的位元圖要安全得多。
- `MemoryCache` 已重構以提供更大的靈活性。
- 停用產生執行階段非 Null 斷言。
    - 若您使用 Java，將 null 作為加上非 Null 註解的參數傳遞給函式時，將不再立即拋出 `NullPointerException`。若您使用 Kotlin，則基本上沒有變化。
    - 此變更有助於縮小程式庫的大小。
- 已從程式庫中移除 `VideoFrameFileFetcher` 與 `VideoFrameUriFetcher`。請改用支援所有資料來源的 `VideoFrameDecoder`。
- 加入對 `bitmapFactoryMaxParallelism` 支援，用於限制進行中的 `BitmapFactory` 作業數量。此值預設為 4，可提升 UI 效能。
- 加入對 `interceptorDispatcher`、`fetcherDispatcher`、`decoderDispatcher` 與 `transformationDispatcher` 的支援。
- `Disposable` 已重構並公開底層 `ImageRequest` 的工作 (job)。
- 將 `Transition.transition` 變更為非暫停函式，因為不再需要暫停轉換直至完成。
- 加入 `GenericViewTarget`，處理通用的 `ViewTarget` 邏輯。
- 已從程式庫中移除 [`BlurTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/BlurTransformation.kt) 與 [`GrayscaleTransformation`](https://github.com/coil-kt/coil/blob/845f39383f332428077c666e3567b954675ce248/coil-core/src/main/java/coil/transform/GrayscaleTransformation.kt)。
    - 若您仍需使用它們，可以將其程式碼複製到您的專案中。
- 若 `ImageRequest.fallback` 為 null，則現在會在 `Target` 上設定 `ImageRequest.error`。
- `Transformation.key` 已替換為 `Transformation.cacheKey`。
- `ImageRequest.Listener` 在 `onSuccess` 與 `onError` 中分別傳回 `SuccessResult`/`ErrorResult`。
- 加入 `ByteBuffer` 至預設支援的資料型別。
- 從多個類別中移除 `toString` 實作。
- 更新 OkHttp 至 4.9.2。
- 更新 Okio 至 3.0.0-alpha.10。

## [1.4.0] - 2021 年 10 月 6 日

- **新增**：為 `ImagePainter.State.Success` 與 `ImagePainter.State.Error` 加入 `ImageResult`。([#887](https://github.com/coil-kt/coil/pull/887))
    - 這是對 `ImagePainter.State.Success` 與 `ImagePainter.State.Error` 特徵的二進制不相容變更，但這些 API 被標記為實驗性的。
- 僅在 `View.isShown` 為 `true` 時執行 `CrossfadeTransition`。先前僅檢查 `View.isVisible`。([#898](https://github.com/coil-kt/coil/pull/898))
- 修正因四捨五入問題導致縮放倍數略小於 1 時，可能發生的記憶體快取遺漏。([#899](https://github.com/coil-kt/coil/pull/899))
- 將非內嵌的 `ComponentRegistry` 方法設為公開。([#925](https://github.com/coil-kt/coil/pull/925))
- 依賴 `accompanist-drawablepainter` 並移除 Coil 的自訂 `DrawablePainter` 實作。([#845](https://github.com/coil-kt/coil/pull/845))
- 移除對 Java 8 方法的使用以防止發生脫糖 (desugaring) 問題。([#924](https://github.com/coil-kt/coil/pull/924))
- 將 `ImagePainter.ExecuteCallback` 提升為穩定 API。([#927](https://github.com/coil-kt/coil/pull/927))
- 更新 compileSdk 至 31。
- 更新 Kotlin 至 1.5.30。
- 更新協同程式至 1.5.2。
- 更新 Compose 至 1.0.3。

## [1.3.2] - 2021 年 8 月 4 日

- `coil-compose` 現在依賴 `compose.ui` 而非 `compose.foundation`。
    - `compose.ui` 是一個較小的相依性，因其為 `compose.foundation` 的子集。
- 更新 Jetpack Compose 至 1.0.1。
- 更新 Kotlin 至 1.5.21。
- 更新協同程式至 1.5.1。
- 更新 `androidx.exifinterface:exifinterface` 至 1.3.3。

## [1.3.1] - 2021 年 7 月 28 日

- 更新 Jetpack Compose 至 `1.0.0`。熱烈祝賀 Compose 團隊發佈[穩定版本](https://android-developers.googleblog.com/2021/07/jetpack-compose-announcement.html)！
- 更新 `androidx.appcompat:appcompat-resources` 至 1.3.1。

## [1.3.0] - 2021 年 7 月 10 日

- **新增**：加入對 [Jetpack Compose](https://developer.android.com/jetpack/compose) 的支援。它基於 [Accompanist](https://github.com/google/accompanist/) 的 Coil 整合，但有多項變更。更多資訊請查看[文件](https://coil-kt.github.io/coil/compose/)。
- 加入 `allowConversionToBitmap` 以針對 `Transformation` 啟用/停用自動位元圖轉換。([#775](https://github.com/coil-kt/coil/pull/775))
- 為 `ImageDecoderDecoder` 與 `GifDecoder` 加入 `enforceMinimumFrameDelay`，以支援在 GIF 影格延遲低於臨界值時重寫該值。([#783](https://github.com/coil-kt/coil/pull/783))
    - 此功能預設為停用，但在未來的版本中將改為預設啟用。
- 加入對啟用/停用 `ImageLoader` 內部網路觀察程式的支援。([#741](https://github.com/coil-kt/coil/pull/741))
- 修正 `BitmapFactoryDecoder` 解碼位元圖的密度問題。([#776](https://github.com/coil-kt/coil/pull/776))
- 修正 Licensee 找不到 Coil 授權 URL 的問題。([#774](https://github.com/coil-kt/coil/pull/774))
- 更新 `androidx.core:core-ktx` 至 1.6.0。

## [1.2.2] - 2021 年 6 月 4 日

- 修正將具有共享狀態的可繪製對象轉換為位元圖時發生的資料競爭。([#771](https://github.com/coil-kt/coil/pull/771))
- 修正 `ImageLoader.Builder.fallback` 設定了 `error` 可繪製對象而非 `fallback` 可繪製對象的問題。
- 修正 `ResourceUriFetcher` 傳回錯誤資料來源的問題。([#770](https://github.com/coil-kt/coil/pull/770))
- 修正 API 26 與 27 上檢查無可用檔案描述符的邏輯。
- 修正對平台向量可繪製資源支援的錯誤版本檢查。([#751](https://github.com/coil-kt/coil/pull/751))
- 更新 Kotlin (1.5.10)。
- 更新協同程式 (1.5.0)。
- 更新 `androidx.appcompat:appcompat-resources` 至 1.3.0。
- 更新 `androidx.core:core-ktx` 至 1.5.0。

## [1.2.1] - 2021 年 4 月 27 日

- 修正 `VideoFrameUriFetcher` 嘗試處理 http/https URI 的問題。([#734](https://github.com/coil-kt/coil/pull/734))

## [1.2.0] - 2021 年 4 月 12 日

- **重要**：在 `SvgDecoder` 中使用 SVG 的檢視邊界 (view bounds) 來計算其長寬比。([#688](https://github.com/coil-kt/coil/pull/688))
    - 先前 `SvgDecoder` 使用 SVG 的 `width`/`height` 元素來決定長寬比，但這未正確遵循 SVG 規範。
    - 若要恢復舊有行為，請在建構 `SvgDecoder` 時設定 `useViewBoundsAsIntrinsicSize = false`。
- **新增**：加入 `VideoFrameDecoder` 以支援從任何來源解碼影片影格。([#689](https://github.com/coil-kt/coil/pull/689))
- **新增**：支援使用來源內容而非僅靠 MIME 類型來自動偵測 SVG。([#654](https://github.com/coil-kt/coil/pull/654))
- **新增**：支援使用 `ImageLoader.newBuilder()` 共享資源。([#653](https://github.com/coil-kt/coil/pull/653))
    - 重要地是，這支援在 `ImageLoader` 執行個體之間共享記憶體快取。
- **新增**：加入對使用 `AnimatedTransformation` 的動畫影像轉換的支援。([#659](https://github.com/coil-kt/coil/pull/659))
- **新增**：加入對動畫可繪製對象起始/結束回呼的支援。([#676](https://github.com/coil-kt/coil/pull/676))

---

- 修正剖析 HEIF/HEIC 檔案的 EXIF 資料。([#664](https://github.com/coil-kt/coil/pull/664))
- 修正停用位元圖池化時未使用 `EmptyBitmapPool` 實作的問題。([#638](https://github.com/coil-kt/coil/pull/638))
    - 若無此修正，位元圖池化雖仍能正確停用，但會使用較重的 `BitmapPool` 實作。
- 修正 `MovieDrawable.getOpacity` 錯誤傳回透明的情況。([#682](https://github.com/coil-kt/coil/pull/682))
- 防範預設暫存目錄不存在的情況。([#683](https://github.com/coil-kt/coil/pull/683))

---

- 使用 JVM IR 後端進行組建。([#670](https://github.com/coil-kt/coil/pull/670))
- 更新 Kotlin (1.4.32)。
- 更新協同程式 (1.4.3)。
- 更新 OkHttp (3.12.13)。
- 更新 `androidx.lifecycle:lifecycle-common-java8` 至 2.3.1。

## [1.1.1] - 2021 年 1 月 11 日

- 修正 `ViewSizeResolver.size` 因多次恢復協同程式而可能拋出 `IllegalStateException` 的問題。
- 修正 `HttpFetcher` 若從主執行緒呼叫會永久阻塞的問題。
    - 使用 `ImageRequest.dispatcher(Dispatchers.Main.immediate)` 強制在主執行緒執行的請求將失敗並拋出 `NetworkOnMainThreadException`，除非將 `ImageRequest.networkCachePolicy` 設定為 `CachePolicy.DISABLED` 或 `CachePolicy.WRITE_ONLY`。
- 若影片包含旋轉元資料，則旋轉來自 `VideoFrameFetcher` 的影片影格。
- 更新 Kotlin (1.4.21)。
- 更新協同程式 (1.4.2)。
- 更新 Okio (2.10.0)。
- 更新 `androidx.exifinterface:exifinterface` (1.3.2)。

## [1.1.0] - 2020 年 11 月 24 日

- **重要**：變更 `CENTER` 與 `MATRIX` 的 `ImageView` 縮放類型使其解析為 `OriginalSize`。([#587](https://github.com/coil-kt/coil/pull/587))
    - 此變更僅影響未明確指定請求大小時的隱式大小解析演算法。
    - 此變則是為了確保影像請求的視覺結果與 `ImageView.setImageResource`/`ImageView.setImageURI` 一致。若要恢復舊有行為，請在建構請求時設定 `ViewSizeResolver`。
- **重要**：若視圖的版面配置參數為 `WRAP_CONTENT`，則從 `ViewSizeResolver` 傳回顯示器大小。([#562](https://github.com/coil-kt/coil/pull/562))
    - 先前我們僅在視圖已完全佈置時才傳回顯示器大小。此變更使典型行為更一致且直觀。
- 加入控制 Alpha 預乘的功能。([#569](https://github.com/coil-kt/coil/pull/569))
- 在 `CrossfadeDrawable` 中支援優先使用精確的原生大小。([#585](https://github.com/coil-kt/coil/pull/585))
- 檢查包含版本的完整 GIF 標頭。([#564](https://github.com/coil-kt/coil/pull/564))
- 加入空位元圖池實作。([#561](https://github.com/coil-kt/coil/pull/561))
- 將 `EventListener.Factory` 變更為功能介面。([#575](https://github.com/coil-kt/coil/pull/575))
- 穩定化 `EventListener`。([#574](https://github.com/coil-kt/coil/pull/574))
- 為 `ImageRequest.Builder.placeholderMemoryCacheKey` 加入 `String` 多載。
- 為 `ViewSizeResolver` 建構函式加入 `@JvmOverloads`。
- 修正：變更 `CrossfadeDrawable` 中的起始/結束可繪製對象。([#572](https://github.com/coil-kt/coil/pull/572))
- 修正：修正 GIF 在第二次載入時不播放的問題。([#577](https://github.com/coil-kt/coil/pull/534))
- 更新 Kotlin (1.4.20) 並遷移至 `kotlin-parcelize` 外掛程式。
- 更新協同程式 (1.4.1)。

## [1.0.0] - 2020 年 10 月 22 日

自 `0.13.0` 以來的變更：
- 加入 `Context.imageLoader` 擴充函式。([#534](https://github.com/coil-kt/coil/pull/534))
- 加入 `ImageLoader.executeBlocking` 擴充函式。([#537](https://github.com/coil-kt/coil/pull/537))
- 若先前的單例影像載入器被替換，不要將其關閉。[#533](https://github.com/coil-kt/coil/pull/533)

自 `1.0.0-rc3` 以來的變更：
- 修正：防範遺失/無效的 ActivityManager。([#541](https://github.com/coil-kt/coil/pull/541))
- 修正：允許 OkHttp 快取失敗的回應。([#551](https://github.com/coil-kt/coil/pull/551))
- 更新 Kotlin 至 1.4.10。
- 更新 Okio 至 2.9.0。
- 更新 `androidx.exifinterface:exifinterface` 至 1.3.1。

## [1.0.0-rc3] - 2020 年 9 月 21 日

- 由於不穩定，撤銷使用 [`-Xjvm-default=all`](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/) 編譯旗標。
    - **這與之前的發佈候選版本相比，是原始碼相容但二進位不相容的變更。**
- 加入 `Context.imageLoader` 擴充函式。([#534](https://github.com/coil-kt/coil/pull/534))
- 加入 `ImageLoader.executeBlocking` 擴充函式。([#537](https://github.com/coil-kt/coil/pull/537))
- 若先前的單例影像載入器被替換，不要將其關閉。([#533](https://github.com/coil-kt/coil/pull/533))
- 更新 AndroidX 相依性：
    - `androidx.exifinterface:exifinterface` -> 1.3.0

## [1.0.0-rc2] - 2020 年 9 月 3 日

- **此版本要求 Kotlin 1.4.0 或以上版本。**
- 包含 [0.13.0](#0130---september-3-2020) 中的所有變更。
- 依賴基礎 Kotlin `stdlib` 而非 `stdlib-jdk8`。

## [0.13.0] - 2020 年 9 月 3 日

- **重要**：預設在主執行緒上啟動攔截器鏈。([#513](https://github.com/coil-kt/coil/pull/513))
    - 這在很大程度上恢復了 `0.11.0` 及以下版本的行為，即在主執行緒上同步檢查記憶體快取。
    - 若要恢復使用與 `0.12.0` 相同的行為，即在 `ImageRequest.dispatcher` 上檢查記憶體快取，請設定 `ImageLoader.Builder.launchInterceptorChainOnMainThread(false)`。
    - 詳情請見 [`launchInterceptorChainOnMainThread`](https://coil-kt.github.io/coil/api/coil-core/coil3/-image-loader/-builder/launch-interceptor-chain-on-main-thread/)。

---

- 修正：修正若請求在分離的 Fragment 中的 `ViewTarget` 上啟動時，可能發生的記憶體洩漏。([#518](https://github.com/coil-kt/coil/pull/518))
- 修正：使用 `ImageRequest.context` 載入資源 URI。([#517](https://github.com/coil-kt/coil/pull/517))
- 修正：修正可能導致後續請求無法儲存至磁碟快取的資料競爭。([#510](https://github.com/coil-kt/coil/pull/510))
- 修正：在 API 18 上使用 `blockCountLong` 與 `blockSizeLong`。

---

- 將 `ImageLoaderFactory` 設為功能介面。
- 加入 `ImageLoader.Builder.addLastModifiedToFileCacheKey`，允許您啟用/停用為從 `File` 載入的影像將最後修改時間戳記加入記憶體快取金鑰。

---

- 更新 Kotlin 至 1.4.0。
- 更新協同程式 至 1.3.9。
- 更新 Okio 至 2.8.0。

## [1.0.0-rc1] - 2020 年 8 月 18 日

- **此版本要求 Kotlin 1.4.0 或以上版本。**
- 更新 Kotlin 至 1.4.0 並啟用 [`-Xjvm-default=all`](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/)。
    - **[請參閱此處](https://coil-kt.github.io/coil/faq/#how-do-i-target-java-8)了解如何在您的組建檔案中啟用 `-Xjvm-default=all`。**
    - 這會為預設的 Kotlin 介面方法產生 Java 8 預設方法。
- 移除 0.12.0 中所有現有的棄用方法。
- 更新協同程式 至 1.3.9。

## [0.12.0] - 2020 年 8 月 18 日

- **破壞性變更**：`LoadRequest` 與 `GetRequest` 已被 `ImageRequest` 取代：
    - `ImageLoader.execute(LoadRequest)` -> `ImageLoader.enqueue(ImageRequest)`
    - `ImageLoader.execute(GetRequest)` -> `ImageLoader.execute(ImageRequest)`
    - `ImageRequest` 實作了 `equals`/`hashCode`。
- **破壞性變更**：多個類別被重命名或變更了套件：
    - `coil.request.RequestResult` -> `coil.request.ImageResult`
    - `coil.request.RequestDisposable` -> `coil.request.Disposable`
    - `coil.bitmappool.BitmapPool` -> `coil.bitmap.BitmapPool`
    - `coil.DefaultRequestOptions` -> `coil.request.DefaultRequestOptions`
- **破壞性變更**：[`SparseIntArraySet`](https://github.com/coil-kt/coil/blob/f52addd039f0195b66f93cb0f1cad59b0832f784/coil-core/src/main/java/coil/collection/SparseIntArraySet.kt) 已從公開 API 中移除。
- **破壞性變更**：`TransitionTarget` 不再實作 `ViewTarget`。
- **破壞性變更**：`ImageRequest.Listener.onSuccess` 的簽章已更改為傳回 `ImageResult.Metadata` 而非僅傳回 `DataSource`。
- **破壞性變更**：移除對 `LoadRequest.aliasKeys` 的支援。此 API 透過對記憶體快取的直接讀寫存取能得到更好的處理。

---

- **重要**：記憶體快取中的值不再同步解析（若從主執行緒呼叫）。
    - 此變更對於支援在背景調度器上執行 `Interceptor` 也是必要的。
    - 此變更也將更多工作移出主執行緒，提升了效能。
- **重要**：`Mappers` 現在在背景調度器上執行。副作用是，不再**自動**支援自動位元圖採樣。要達到相同的效果，請將前一個請求的 `MemoryCache.Key` 用作後續請求的 `placeholderMemoryCacheKey`。[點此查看範例](https://coil-kt.github.io/coil/recipes/#using-a-memory-cache-key-as-a-placeholder)。
    - `placeholderMemoryCacheKey` API 提供了更多的自由度，因為您可以將具有不同資料（例如大小影像的不同 URL）的兩個影像請求「連結」起來。
- **重要**：Coil 的 `ImageView` 擴充函式已從 `coil.api` 套件移至 `coil` 套件。
    - 使用尋找與替換來重構 `import coil.api.load` -> `import coil.load`。遺憾的是，無法使用 Kotlin 的 `ReplaceWith` 功能來替換匯入。
- **重要**：若可繪製對象不是相同的影像，請使用標準淡入淡出。
- **重要**：在 API 24+ 上優先使用不可變位元圖。
- **重要**：`MeasuredMapper` 已被棄用，取而代之的是新的 `Interceptor` 介面。關於如何將 `MeasuredMapper` 轉換為 `Interceptor` 的範例請見[此處](https://gist.github.com/colinrtwhite/90267704091467451e46b21b95154299)。
    - `Interceptor` 是一個限制少得多的 API，允許更廣泛的自訂邏輯。
- **重要**：`ImageRequest.data` 現在不為 null。若您在未設定資料的情況下建立 `ImageRequest`，它將傳回 `NullRequestData` 作為其資料。

---

- **新增**：加入對 `ImageLoader` 的 `MemoryCache` 直接讀寫存取的支援。詳情請見[文件](https://coil-kt.github.io/coil/getting_started/#memory-cache)。
- **新增**：加入對 `Interceptor` 的支援。詳情請見[文件](https://coil-kt.github.io/coil/image_pipeline/#interceptors)。Coil 的 `Interceptor` 設計深受 [OkHttp](https://github.com/square/okhttp) 的啟發！
- **新增**：加入使用 `ImageLoader.Builder.bitmapPoolingEnabled` 啟用/停用位元圖池化的功能。
    - 位元圖池化在 API 23 及以下版本最有效，但在 API 24 及以上版本仍可能有益（透過提前呼叫 `Bitmap.recycle`）。
- **新增**：支援解碼時的執行緒中斷。

---

- 修正 content-type 標頭中剖析多個片段的問題。
- 重構位元圖參照計數以使其更穩健。
- 修正 API < 19 裝置上的 WebP 解碼問題。
- 在 EventListener API 中公開 FetchResult 與 DecodeResult。

---

- 使用 SDK 30 編譯。
- 更新協同程式 至 1.3.8。
- 更新 OkHttp 至 3.12.12。
- 更新 Okio 至 2.7.0。
- 更新 AndroidX 相依性：
    - `androidx.appcompat:appcompat-resources` -> 1.2.0
    - `androidx.core:core-ktx` -> 1.3.1

## [0.11.0] - 2020 年 5 月 14 日

- **破壞性變更**：**此版本移除了所有現有的棄用函式。**
    - 這使得移除 Coil 的 `ContentProvider` 成為可能，使其在應用程式啟動時不執行任何程式碼。
- **破壞性變更**：將 `SparseIntArraySet.size` 轉換為 val。([#380](https://github.com/coil-kt/coil/pull/380))
- **破壞性變更**：將 `Parameters.count()` 移至擴充函式。([#403](https://github.com/coil-kt/coil/pull/403))
- **破壞性變更**：將 `BitmapPool.maxSize` 設為 Int。([#404](https://github.com/coil-kt/coil/pull/404))

---

- **重要**：讓 `ImageLoader.shutdown()` 成為選用（類似於 `OkHttpClient`）。([#385](https://github.com/coil-kt/coil/pull/385))

---

- 修正：修正 AGP 4.1 相容性。([#386](https://github.com/coil-kt/coil/pull/386))
- 修正：修正測量 GONE 視圖的問題。([#397](https://github.com/coil-kt/coil/pull/397))

---

- 將預設記憶體快取大小降至 20%。([#390](https://github.com/coil-kt/coil/pull/390))
    - 若要恢復現有行為，請在建立 `ImageLoader` 時設定 `ImageLoaderBuilder.availableMemoryPercentage(0.25)`。
- 更新協同程式 至 1.3.6。
- 更新 OkHttp 至 3.12.11。

## [0.10.1] - 2020 年 4 月 26 日

- 修正 API 23 及以下版本解碼大型 PNG 時發生的 OOM 問題。([#372](https://github.com/coil-kt/coil/pull/372))。
    - 這會停用 PNG 檔案的 EXIF 轉向解碼。PNG EXIF 轉向極少被使用，且讀取 PNG EXIF 資料（即使為空）需要將整個檔案緩衝至記憶體，這對效能不利。
- 對 `SparseIntArraySet` 進行細微的 Java 相容性改進。

---

- 更新 Okio 至 2.6.0。

## [0.10.0] - 2020 年 4 月 20 日

### 亮點

- **此版本棄用了大部分 DSL API，改為直接使用建構器 (builders)。** 以下是變更示例：

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

    - 若您使用 `io.coil-kt:coil` 構件，您可以呼叫 `Coil.execute(request)` 來使用單例 `ImageLoader` 執行請求。

- **`ImageLoader` 現在擁有一個弱參照記憶體快取**，用於在影像從強參照記憶體快取中逐出後追蹤其弱參照。
    - 這意指只要仍有強參照存在，影像就一律會從 `ImageLoader` 的記憶體快取中傳回。
    - 一般而言，這應會使記憶體快取更可預測並提高其命中率。
    - 此行為可透過 `ImageLoaderBuilder.trackWeakReferences` 啟用/停用。

- 加入新的構件 **`io.coil-kt:coil-video`**，用於從影片檔案中解碼特定影格。[在此閱讀更多](https://coil-kt.github.io/coil/videos/)。

- 加入新的 [EventListener](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/EventListener.kt) API 用於追蹤指標。

- 加入 [ImageLoaderFactory](https://github.com/coil-kt/coil/blob/main/coil/src/main/java/coil/ImageLoaderFactory.kt)，可由您的 `Application` 實作以簡化單例初始化。

---

### 完整版本說明

- **重要**：棄用 DSL 語法，改用建構器語法。([#267](https://github.com/coil-kt/coil/pull/267))
- **重要**：棄用 `Coil` 與 `ImageLoader` 擴充函式。([#322](https://github.com/coil-kt/coil/pull/322))
- **破壞性變更**：從 `ImageLoader.execute(GetRequest)` 傳回密封的 `RequestResult` 類型。([#349](https://github.com/coil-kt/coil/pull/349))
- **破壞性變更**：將 `ExperimentalCoil` 重新命名為 `ExperimentalCoilApi`。從 `@Experimental` 遷移至 `@RequiresOptIn`。([#306](https://github.com/coil-kt/coil/pull/306))
- **破壞性變更**：將 `CoilLogger` 替換為 `Logger` 介面。([#316](https://github.com/coil-kt/coil/pull/316))
- **破壞性變更**：將 destWidth/destHeight 重新命名為 dstWidth/dstHeight。([#275](https://github.com/coil-kt/coil/pull/275))
- **破壞性變更**：重新排列 `MovieDrawable` 的建構函式參數。([#272](https://github.com/coil-kt/coil/pull/272))
- **破壞性變更**：`Request.Listener` 的方法現在接收完整的 `Request` 物件，而非僅接收其資料。
- **破壞性變更**：`GetRequestBuilder` 現在在其建構函式中需要一個 `Context`。
- **破壞性變更**：`Request` 上的多個屬性現在可為 null。
- **行為變更**：預設在快取金鑰中包含參數值。([#319](https://github.com/coil-kt/coil/pull/319))
- **行為變更**：稍微調整 `Request.Listener.onStart()` 的時機，使其在 `Target.onStart()` 之後立即被呼叫。([#348](https://github.com/coil-kt/coil/pull/348))

---

- **新增**：加入 `WeakMemoryCache` 實作。([#295](https://github.com/coil-kt/coil/pull/295))
- **新增**：加入 `coil-video` 以支援解碼影片影格。([#122](https://github.com/coil-kt/coil/pull/122))
- **新增**：引入 [`EventListener`](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/EventListener.kt)。([#314](https://github.com/coil-kt/coil/pull/314))
- **新增**：引入 [`ImageLoaderFactory`](https://github.com/coil-kt/coil/blob/main/coil/src/main/java/coil/ImageLoaderFactory.kt)。([#311](https://github.com/coil-kt/coil/pull/311))
- **新增**：支援 Android 11 上的動畫 HEIF 影像序列。([#297](https://github.com/coil-kt/coil/pull/297))
- **新增**：改善 Java 相容性。([#262](https://github.com/coil-kt/coil/pull/262))
- **新增**：支援設定預設的 `CachePolicy`。([#307](https://github.com/coil-kt/coil/pull/307))
- **新增**：支援設定預設的 `Bitmap.Config`。([#342](https://github.com/coil-kt/coil/pull/342))
- **新增**：加入 `ImageLoader.invalidate(key)` 以清除單個記憶體快取項目。([#55](https://github.com/coil-kt/coil/pull/55))
- **新增**：加入偵錯日誌以解釋為何快取的影像未被重複使用。([#346](https://github.com/coil-kt/coil/pull/346))
- **新增**：支援 get 請求的 `error` 與 `fallback` 可繪製對象。

---

- 修正：修正當 Transformation 減少輸入位元圖大小時發生的記憶體快取遺漏。([#357](https://github.com/coil-kt/coil/pull/357))
- 修正：確保 `BlurTransformation` 中的半徑低於 RenderScript 的最大值。([#291](https://github.com/coil-kt/coil/pull/291))
- 修正：修正解碼高色彩深度影像的問題。([#358](https://github.com/coil-kt/coil/pull/358))
- 修正：在 Android 11 及以上版本停用 `ImageDecoderDecoder` 崩潰因應措施。([#298](https://github.com/coil-kt/coil/pull/298))
- 修正：修正 API 23 之前讀取 EXIF 資料失敗的問題。([#331](https://github.com/coil-kt/coil/pull/331))
- 修正：修正與 Android R SDK 的不相容問題。([#337](https://github.com/coil-kt/coil/pull/337))
- 修正：僅在 `ImageView` 具有相符的 `SizeResolver` 時才啟用非精確大小。([#344](https://github.com/coil-kt/coil/pull/344))
- 修正：允許快取的影像與請求的大小最多有一像素的落差。([#360](https://github.com/coil-kt/coil/pull/360))
- 修正：若視圖不可見，則跳過淡入淡出過渡。([#361](https://github.com/coil-kt/coil/pull/361))

---

- 棄用 `CoilContentProvider`。([#293](https://github.com/coil-kt/coil/pull/293))
- 使用 `@MainThread` 註解多個 `ImageLoader` 方法。
- 若生命週期目前已啟動，避免建立 `LifecycleCoroutineDispatcher`。([#356](https://github.com/coil-kt/coil/pull/356))
- 為 `OriginalSize.toString()` 使用完整套件名稱。
- 解碼軟體位元圖時進行預分配。([#354](https://github.com/coil-kt/coil/pull/354))

---

- 更新 Kotlin 至 1.3.72。
- 更新協同程式 至 1.3.5。
- 更新 OkHttp 至 3.12.10。
- 更新 Okio 至 2.5.0。
- 更新 AndroidX 相依性：
    - `androidx.exifinterface:exifinterface` -> 1.2.0

## [0.9.5] - 2020 年 2 月 6 日

- 修正：在檢查是否為硬體加速之前，確保視圖已附加。這修正了請求硬體位元圖時可能遺漏記憶體快取的情況。

---

- 更新 AndroidX 相依性：
    - `androidx.core:core-ktx` -> 1.2.0

## [0.9.4] - 2020 年 2 月 3 日

- 修正：在 `ImageDecoderDecoder` 中下採樣時保持長寬比。感謝 @zhanghai。

---

- 先前只要位元圖的配置大於或等於請求中指定的配置，就會從記憶體快取傳回位元圖。例如，若您請求一個 `ARGB_8888` 位元圖，系統可能會從記憶體快取中傳回一個 `RGBA_F16` 位元圖。現在，快取的配置與請求的配置必須相等。
- 將 `scale` 與 `durationMillis` 設為 `CrossfadeDrawable` 與 `CrossfadeTransition` 中的公開項。

## [0.9.3] - 2020 年 2 月 1 日

- 修正：平移 `ScaleDrawable` 內的子可繪製對象以確保其居中。
- 修正：修正 GIF 與 SVG 無法完全填充邊界的情況。

---

- 將 `HttpUrl.get()` 的呼叫延遲至背景執行緒。
- 改善 `BitmapFactory` 空位元圖錯誤訊息。
- 將 3 個裝置加入硬體位元圖黑名單。([#264](https://github.com/coil-kt/coil/pull/264))

---

- 更新 AndroidX 相依性：
    - `androidx.lifecycle:lifecycle-common-java8` -> 2.2.0

## [0.9.2] - 2020 年 1 月 19 日

- 修正：修正 API 19 之前解碼 GIF 的問題。感謝 @mario。
- 修正：修正點陣化的向量可繪製資源未被標記為已採樣的問題。
- 修正：若 Movie 維度 <= 0，則拋出例外。
- 修正：修正 `CrossfadeTransition` 在記憶體快取事件中未恢復的問題。
- 修正：若不允許，則防止將硬體位元圖傳回給所有目標方法。
- 修正：修正 `MovieDrawable` 未將自身定位於其邊界中心的問題。

---

- 從 `CrossfadeDrawable` 移除自動縮放。
- 將 `BitmapPool.trimMemory` 設為公開。
- 將 `AnimatedImageDrawable` 封裝在 `ScaleDrawable` 中以確保其填充邊界。
- 為 `RequestBuilder.setParameter` 加入 `@JvmOverloads`。
- 若未設定檢視方框，則將 SVG 的檢視方框設定為其大小。
- 將狀態與層級變更傳遞給 `CrossfadeDrawable` 子項。

---

- 更新 OkHttp 至 3.12.8。

## [0.9.1] - 2019 年 12 月 30 日

- 修正：修正呼叫 `LoadRequestBuilder.crossfade(false)` 時發生的崩潰。

## [0.9.0] - 2019 年 12 月 30 日

- **破壞性變更**：`Transformation.transform` 現在包含一個 `Size` 參數。這是為了支援根據 `Target` 大小更改輸出 `Bitmap` 大小的轉換作業。帶有轉換作業的請求現在也免於[影像採樣](https://coil-kt.github.io/coil/getting_started/#image-sampling)。
- **破壞性變更**：`Transformation` 現在適用於任何類型的 `Drawable`。先前若輸入的 `Drawable` 不是 `BitmapDrawable`，則會跳過 `Transformation`。現在，在套用 `Transformation` 之前，`Drawable` 會先渲染為 `Bitmap`。
- **破壞性變更**：向 `ImageLoader.load` 傳遞 `null` 資料現在被視為錯誤，並會呼叫 `Target.onError` 與 `Request.Listener.onError` 並帶有 `NullRequestDataException`。此變更是為了在資料為 `null` 時支援設定 `fallback` 可繪製對象。先前此類請求會被靜默忽略。
- **破壞性變更**：`RequestDisposable.isDisposed` 現在是一個 `val`。

---

- **新增**：支援自訂過渡。 [詳情請見此處](/coil/compose)。由於 API 尚在醞釀中，過渡功能被標記為實驗性。
- **新增**：加入 `RequestDisposable.await` 以支援在 `LoadRequest` 進行時暫停。
- **新增**：支援在請求資料為 null 時設定 `fallback` 可繪製對象。
- **新增**：加入 `Precision`。這使得輸出 `Drawable` 的大小精確，同時為支援縮放的目標（例如 `ImageViewTarget`）啟用縮放最佳化。詳情請見[其文件](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/size/Precision.kt)。
- **新增**：加入 `RequestBuilder.aliasKeys` 以支援比對多個快取金鑰。

---

- 修正：讓 `RequestDisposable` 具備執行緒安全性。
- 修正：`RoundedCornersTransformation` 現在先裁剪至目標大小，然後將角落圓角化。
- 修正：`CircleCropTransformation` 現在從中心裁剪。
- 修正：將多個裝置加入[硬體位元圖黑名單](https://github.com/coil-kt/coil/blob/main/coil-core/src/main/java/coil/memory/HardwareBitmapService.kt)。
- 修正：將可繪製對象轉換為位元圖時保持長寬比。
- 修正：修正 `Scale.FIT` 下可能發生的記憶體快取遺漏。
- 修正：確保 `Parameters` 的疊代順序是確定的。
- 修正：建立 `Parameters` 與 `ComponentRegistry` 時進行防禦性拷貝。
- 修正：確保 `RealBitmapPool` 的 `maxSize` >= 0。
- 修正：若 `CrossfadeDrawable` 未在動畫中或已完成，則顯示起始可繪製對象。
- 修正：調整 `CrossfadeDrawable` 以考慮具有未定義原生大小的子項。
- 修正：修正 `MovieDrawable` 縮放不正確的問題。

---

- 更新 Kotlin 至 1.3.61。
- 更新 Kotlin 協同程式 至 1.3.3。
- 更新 Okio 至 2.4.3。
- 更新 AndroidX 相依性：
    - `androidx.exifinterface:exifinterface` -> 1.1.0

## [0.8.0] - 2019 年 10 月 22 日

- **破壞性變更**：已移除 `SvgDrawable`。取而代之的是現在由 `SvgDecoder` 將 SVG 預先渲染為 `BitmapDrawable`s。這使得 SVG **在主執行緒上的渲染成本大幅降低**。此外，`SvgDecoder` 現在在其建構函式中需要一個 `Context`。
- **破壞性變更**：`SparseIntArraySet` 擴充函式已移至 `coil.extension` 套件。

---

- **新增**：支援設定個別請求的網路標頭。 [詳情請見此處](https://github.com/coil-kt/coil/pull/120)。
- **新增**：加入新的 `Parameters` API 以支援透過影像管線傳遞自訂資料。
- **新增**：在 `RoundedCornersTransformation` 中支援個別角落半徑。感謝 @khatv911。
- **新增**：加入 `ImageView.clear()` 以支援主動釋放資源。
- **新增**：支援從其他套件載入資源。
- **新增**：為 `ViewSizeResolver` 加入 `subtractPadding` 屬性，以啟用/停用測量時減去視圖的內邊距 (padding)。
- **新增**：改進 `HttpUrlFetcher` 的 MIME 類型偵測。
- **新增**：為 `MovieDrawable` 與 `CrossfadeDrawable` 加入 `Animatable2Compat` 支援。
- **新增**：加入 `RequestBuilder<*>.repeatCount` 以設定 GIF 的重複次數。
- **新增**：將位元圖池建立功能加入公開 API。
- **新增**：使用 `@MainThread` 註解 `Request.Listener` 方法。

---

- 修正：讓 `CoilContentProvider` 在測試中可見。
- 修正：在資源快取金鑰中包含深色模式。
- 修正：透過暫時將來源寫入磁碟來避開 `ImageDecoder` 原生崩潰。
- 修正：正確處理聯絡人顯示相片 URI。
- 修正：將色調 (tint) 傳遞給 `CrossfadeDrawable` 的子項。
- 修正：修正多個未關閉來源的案例。
- 修正：加入具有損壞或不完整硬體位元圖實作的裝置黑名單。

---

- 使用 SDK 29 編譯。
- 更新 Kotlin 協同程式 至 1.3.2。
- 更新 OkHttp 至 3.12.6。
- 更新 Okio 至 2.4.1。
- 將 `coil-base` 的 `appcompat-resources` 從 `compileOnly` 變更為 `implementation`。

## [0.7.0] - 2019 年 9 月 8 日
- **破壞性變更**：`ImageLoaderBuilder.okHttpClient(OkHttpClient.Builder.() -> Unit)` 現在變更為 `ImageLoaderBuilder.okHttpClient(() -> OkHttpClient)`。初始化器現在也會在背景執行緒上延遲呼叫。**若您設定了自訂的 `OkHttpClient`，您必須設定 `OkHttpClient.cache` 以啟用磁碟快取。** 若您未設定自訂的 `OkHttpClient`，Coil 會建立啟用了磁碟快取的預設 `OkHttpClient`。可以使用 `CoilUtils.createDefaultCache(context)` 建立預設的 Coil 快取。例如：

```kotlin
val imageLoader = ImageLoader(context) {
    okHttpClient {
        OkHttpClient.Builder()
            .cache(CoilUtils.createDefaultCache(context))
            .build()
    }
}
```

- **破壞性變更**：`Fetcher.key` 不再提供預設實作。
- **破壞性變更**：先前僅會呼叫第一個適用的 `Mapper`。現在將會呼叫所有適用的 `Mapper`。API 無變動。
- **破壞性變更**：細微的具名參數重新命名：`url` -> `uri`，`factory` -> `initializer`。

---

- **新增**：`coil-svg` 構件，具備支援自動解碼 SVG 的 `SvgDecoder`。由 [AndroidSVG](https://github.com/BigBadaboom/androidsvg) 提供技術支援。感謝 @rharter。
- **新增**：`load(String)` 與 `get(String)` 現在接受任何受支援的 Uri 方案。例如：您現在可以執行 `imageView.load("file:///path/to/file.jpg")`。
- **新增**：重構 `ImageLoader` 以使用 `Call.Factory` 取代 `OkHttpClient`。這允許使用 `ImageLoaderBuilder.okHttpClient { OkHttpClient() }` 延遲初始化網路資源。感謝 @ZacSweers。
- **新增**：`RequestBuilder.decoder` 用於明確設定請求的解碼器。
- **新增**：`ImageLoaderBuilder.allowHardware` 用於為 `ImageLoader` 預設啟用/停用硬體位元圖。
- **新增**：在 `ImageDecoderDecoder` 中支援軟體渲染。

---

- 修正：載入向量可繪製資源的多個錯誤。
- 修正：支援 `WRAP_CONTENT` 視圖維度。
- 修正：支援剖析長度超過 8192 位元組的 EXIF 資料。
- 修正：淡入淡出時不要拉伸具有不同長寬比的可繪製對象。
- 修正：防範網路觀察程式因例外而註冊失敗。
- 修正：修正 `MovieDrawable` 中的除以零錯誤。感謝 @R12rus。
- 修正：支援巢狀 Android 資產檔案。感謝 @JaCzekanski。
- 修正：防範在 Android O 與 O_MR1 上耗盡檔案描述符。
- 修正：停用記憶體快取時不發生崩潰。感謝 @hansenji。
- 修正：確保 `Target.cancel` 始終從主執行緒呼叫。

---

- 更新 Kotlin 至 1.3.50。
- 更新 Kotlin 協同程式 至 1.3.0。
- 更新 OkHttp 至 3.12.4。
- 更新 Okio 至 2.4.0。
- 更新 AndroidX 相依性至最新穩定版本：
    - `androidx.appcompat:appcompat` -> 1.1.0
    - `androidx.core:core-ktx` -> 1.1.0
    - `androidx.lifecycle:lifecycle-common-java8` -> 2.1.0
- 將 `appcompat` 替換為 `appcompat-resources` 作為選用的 `compileOnly` 相依性。`appcompat-resources` 是一個小得多的構件。

## [0.6.1] - 2019 年 8 月 16 日
- **新增**：為 `RequestBuilder` 加入 `transformations(List<Transformation>)`。
- 修正：為檔案 Uri 的快取金鑰加入最後修改日期。
- 修正：確保視圖維度評估為至少 1px。
- 修正：在影格之間清除 `MovieDrawable` 的畫布。
- 修正：正確開啟資產。

## [0.6.0] - 2019 年 8 月 12 日
- 初始版本。