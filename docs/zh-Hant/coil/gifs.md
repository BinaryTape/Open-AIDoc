# GIF

**此功能僅適用於 Android。**

與 Glide 不同，Coil 預設不支援 GIF。不過，Coil 提供了一個擴充程式庫來支援它們。

若要加入 GIF 支援，請匯入該擴充程式庫：

```kotlin
implementation("io.coil-kt.coil3:coil-gif:3.6.3")
```

就這樣！`ImageLoader` 會透過檔案標頭自動偵測任何 GIF 並正確解碼。

或者，您也可以在建構 `ImageLoader` 時，手動將解碼器加入到您的組建註冊表中：

```kotlin
val imageLoader = ImageLoader.Builder(context)
    .components {
        if (SDK_INT >= 28) {
            add(AnimatedImageDecoder.Factory())
        } else {
            add(GifDecoder.Factory())
        }
    }
    .build()
```

若要轉換 GIF 每個影格的像素資料，請參閱 [AnimatedTransformation](/coil/api/coil-gif/coil3.gif/-animated-transformation)。

!!! Note
    Coil 包含兩個獨立的解碼器來支援解碼 GIF。`GifDecoder` 支援所有 API 層級，但速度較慢。`AnimatedImageDecoder` 由 Android 的 [ImageDecoder](https://developer.android.com/reference/android/graphics/ImageDecoder) API 提供技術支援，該 API 僅在 API 28 及以上版本可用。`AnimatedImageDecoder` 比 `GifDecoder` 更快，且支援解碼動態 WebP 圖片與動態 HEIF 圖片序列。