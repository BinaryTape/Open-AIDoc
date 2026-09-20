# 影片畫格

**此功能僅適用於 Android。**

若要新增影片畫格支援，請匯入擴充套件程式庫：

```kotlin
implementation("io.coil-kt.coil3:coil-video:3.6.3")
```

並在建構 `ImageLoader` 時將解碼器新增至您的組件登錄中：

```kotlin
val imageLoader = ImageLoader.Builder(context)
    .components {
        add(VideoFrameDecoder.Factory())
    }
    .build()
```

若要指定要從影片中擷取的畫格時間，請使用 `videoFrameMillis` 或 `videoFrameMicros`：

```kotlin
imageView.load("/path/to/video.mp4") {
    videoFrameMillis(1000)  // 擷取影片第 1 秒處的畫格
}
```

若要指定精確的畫格編號，請使用 `videoFrameIndex`（需要 API 層級 28）：

```kotlin
imageView.load("/path/to/video.mp4") {
    videoFrameIndex(1234)  // 擷取影片的第 1234 個畫格
}
```

若要根據影片總長度的百分比來選擇影片畫格，請使用 `videoFramePercent`：

```kotlin
imageView.load("/path/to/video.mp4") {
    videoFramePercent(0.5)  // 擷取影片播放期間中間點的畫格
}
```

如果未指定畫格位置，則會解碼影片的第一個畫格。

如果請求的檔名/URI 是以[有效的影片副檔名](https://developer.android.com/guide/topics/media/media-formats#video-formats)結尾，`ImageLoader` 將自動偵測任何影片並擷取其畫格。如果不是，您可以為該請求明確設定 `Decoder`：

```kotlin
imageView.load("/path/to/video") {
    decoderFactory { result, options, _ -> VideoFrameDecoder(result.source, options) }
}