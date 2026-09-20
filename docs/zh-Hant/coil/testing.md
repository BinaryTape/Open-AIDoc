# 測試

要使用測試支援類別，請匯入擴充套件程式庫：

```kotlin
testImplementation("io.coil-kt.coil3:coil-test:3.6.3")
```

`coil-test` 包含 `FakeImageLoaderEngine`，可以將其新增至您的 `ImageLoader` 中，以攔截所有傳入的 `ImageRequest` 並傳回自訂的 `ImageResult`。這對於測試非常有用，因為它能使圖片載入變為同步（從主執行緒執行）且一致。透過使用 `FakeImageLoaderEngine`，`ImageLoader` 將避免所有通常用於載入圖片的記憶體快取、執行緒跳轉、磁碟/網路 I/O 擷取以及圖片解碼。以下是一個範例：

```kotlin
val engine = FakeImageLoaderEngine.Builder()
    .intercept("https://example.com/image.jpg", ColorImage(Color.Red.toArgb()))
    .intercept({ it is String && it.endsWith("test.png") }, ColorImage(Color.Green.toArgb()))
    .default(ColorImage(Color.Blue.toArgb()))
    .build()
val imageLoader = ImageLoader.Builder(context)
    .components { add(engine) }
    .build()
```

`ColorImage` 對於測試非常有用，因為它可以根據其寬度/高度繪製彩色方塊或以顏色填充畫布，且在所有平台皆受支援。

此策略與 [Paparazzi](https://github.com/cashapp/paparazzi) 搭配使用效果極佳，可在沒有實體裝置或模擬器的情況下進行 UI 螢幕截圖測試：

```kotlin
class PaparazziTest {
    @get:Rule
    val paparazzi = Paparazzi()

    @Before
    fun before() {
        val engine = FakeImageLoaderEngine.Builder()
            .intercept("https://example.com/image.jpg", ColorImage(Color.Red.toArgb()))
            .intercept({ it is String && it.endsWith("test.png") }, ColorImage(Color.Green.toArgb()))
            .default(ColorImage(Color.Blue.toArgb()))
            .build()
        val imageLoader = ImageLoader.Builder(paparazzi.context)
            .components { add(engine) }
            .build()
        SingletonImageLoader.setUnsafe(imageLoader)
    }

    @Test
    fun testContentComposeRed() {
        // 將顯示紅色方塊。
        paparazzi.snapshot {
            AsyncImage(
                model = "https://example.com/image.jpg",
                contentDescription = null,
            )
        }
    }

    @Test
    fun testContentComposeGreen() {
        // 將顯示綠色方塊。
        paparazzi.snapshot {
            AsyncImage(
                model = "https://www.example.com/test.png",
                contentDescription = null,
            )
        }
    }

    @Test
    fun testContentComposeBlue() {
        // 將顯示藍色方塊。
        paparazzi.snapshot {
            AsyncImage(
                model = "https://www.example.com/default.png",
                contentDescription = null,
            )
        }
    }
}