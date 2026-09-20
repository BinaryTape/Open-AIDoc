# SVGs

若要新增 SVG 支援，請匯入擴充套件程式庫：

```kotlin
implementation("io.coil-kt.coil3:coil-svg:3.6.3")
```

就這麼簡單！`ImageLoader` 將會自動地偵測並解碼任何 SVG。Coil 透過在檔案的前 1 KB 中尋找 `<svg ` 標記來偵測 SVG，這應該能涵蓋大多數情況。如果 SVG 未被自動偵測，你可以為該請求明確地設定 `Decoder`：

```kotlin
imageView.load("/path/to/svg") {
    decoderFactory { result, options, _ -> SvgDecoder(result.source, options) }
}
```

或者，你也可以在建構 `ImageLoader` 時，手動將解碼器新增至你的組建註冊表（component registry）中：

```kotlin
val imageLoader = ImageLoader.Builder(context)
    .components {
        add(SvgDecoder.Factory())
    }
    .build()