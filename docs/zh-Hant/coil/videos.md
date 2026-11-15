# 影片影格

**此功能僅適用於 Android。**

若要新增影片影格支援，請匯入擴充程式庫：

```kotlin
implementation("io.coil-kt.coil3:coil-video:3.6.3")
```

Coil 會透過其 service loader 自動註冊 `VideoFrameDecoder.Factory`。如果您已停用 service loading，請將該工廠新增至 `ImageLoader` 的元件註冊表中：

```kotlin
val imageLoader = ImageLoader.Builder(context)
    .components {
        add(VideoFrameDecoder.Factory())
    }
    .build()
```

解碼器會自動處理 MIME 類型開頭為 `video/` 的來源。Coil 可以從已識別的副檔名推論此 MIME 類型。如果來源缺少或具有不正確的 MIME 類型，請明確為該請求設定解碼器：

```kotlin
imageView.load("/path/to/video") {
    decoderFactory { result, options, _ -> VideoFrameDecoder(result.source, options) }
}
```

若要指定從影片中擷取影格的時間點，請使用 `videoFrameMillis` 或 `videoFrameMicros`：

```kotlin
imageView.load("/path/to/video.mp4") {
    videoFrameMillis(1000)  // 擷取影片第 1 秒的影格
}
```

若要指定精確的影格編號，請使用 `videoFrameIndex`（需要 API 級別 28）：

```kotlin
imageView.load("/path/to/video.mp4") {
    videoFrameIndex(1234)  // 擷取影片第 1234 個影格
}
```

若要根據影片總長度的百分比選取影片影格，請使用 `videoFramePercent`：

```kotlin
imageView.load("/path/to/video.mp4") {
    videoFramePercent(0.5)  // 擷取影片長度中間的影格
}
```

如果未指定影格位置，則會解碼影片的第一個影格。