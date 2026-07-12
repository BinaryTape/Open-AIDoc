# Compose

若要新增對 [Compose UI](https://www.jetbrains.com/compose-multiplatform/) 的支援，請匯入擴充程式庫：

```kotlin
implementation("io.coil-kt.coil3:coil-compose:3.5.0")
```

接著使用 `AsyncImage` 可組合項 (composable) 來載入並顯示圖片：

```kotlin
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
)
```

`model` 可以是 `ImageRequest.data` 的值，也可以是 `ImageRequest` 本身。`contentDescription` 設定無障礙服務使用的文字，用來描述此圖片所代表的內容。

## AsyncImage

`AsyncImage` 是一個非同步執行圖片請求並渲染結果的可組合項。它支援與標準 `Image` 可組合項相同的引數 (arguments)，此外還支援設定 `placeholder`/`error`/`fallback` painter 以及 `onLoading`/`onSuccess`/`onError` 回呼 (callbacks)。以下是載入具有圓形裁剪 (circle crop)、淡入淡出 (crossfade) 並設定佔位符 (placeholder) 的圖片範例：

```kotlin
AsyncImage(
    model = ImageRequest.Builder(LocalContext.current)
        .data("https://example.com/image.jpg")
        .crossfade(true)
        .build(),
    placeholder = painterResource(R.drawable.placeholder),
    contentDescription = stringResource(R.string.description),
    contentScale = ContentScale.Crop,
    modifier = Modifier.clip(CircleShape),
)
```

**何時使用此函式：**

在大多數情況下，建議優先使用 `AsyncImage`。它會根據可組合項的約束 (constraints) 和提供的 `ContentScale` 正確決定圖片載入的大小。

## rememberAsyncImagePainter

在內部，`AsyncImage` 和 `SubcomposeAsyncImage` 使用 `rememberAsyncImagePainter` 來載入 `model`。如果您需要的是 `Painter` 而不是可組合項，可以使用 `rememberAsyncImagePainter` 載入圖片：

```kotlin
val painter = rememberAsyncImagePainter("https://example.com/image.jpg")
```

`rememberAsyncImagePainter` 比 `AsyncImage` 和 `SubcomposeAsyncImage` 更靈活，但有幾個缺點（見下文）。

**何時使用此函式：**

當您需要 `Painter` 而不是可組合項時非常有用 — 或者如果您需要觀察 `AsyncImagePainter.state` 並根據其狀態繪製不同的可組合項 — 或是如果您需要使用 `AsyncImagePainter.restart` 手動重新啟動圖片請求。

此函式的主要缺點是它不會偵測圖片在螢幕上載入的大小，且一律以原始尺寸載入圖片。您可以傳遞自訂的 `SizeResolver` 或使用 `rememberConstraintsSizeResolver`（這是 `AsyncImage` 內部使用的機制）來解決此問題。範例：

```kotlin
val sizeResolver = rememberConstraintsSizeResolver()
val painter = rememberAsyncImagePainter(
    model = ImageRequest.Builder(LocalPlatformContext.current)
        .data("https://example.com/image.jpg")
        .size(sizeResolver)
        .build(),
)

Image(
    painter = painter,
    contentDescription = null,
    modifier = Modifier.then(sizeResolver),
)
```

另一個缺點是，使用 `rememberAsyncImagePainter` 時，對於首次組合 (composition)，`AsyncImagePainter.state` 將始終為 `AsyncImagePainter.State.Empty` — 即使圖片存在於記憶體快取 (memory cache) 中且會在第一幀 (first frame) 繪製。

## SubcomposeAsyncImage

`SubcomposeAsyncImage` 是 `AsyncImage` 的一個變體，它使用子組合 (subcomposition) 為 `AsyncImagePainter` 的狀態提供 slot API，而不是使用 `Painter`。以下是一個範例：

```kotlin
SubcomposeAsyncImage(
    model = "https://example.com/image.jpg",
    loading = {
        CircularProgressIndicator()
    },
    contentDescription = stringResource(R.string.description),
)
```

此外，您可以使用其 `content` 引數和 `SubcomposeAsyncImageContent`（用於渲染目前狀態）來實作更複雜的邏輯：

```kotlin
SubcomposeAsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = stringResource(R.string.description)
) {
    val state by painter.state.collectAsState()
    if (state is AsyncImagePainter.State.Success) {
        SubcomposeAsyncImageContent()
    } else {
        CircularProgressIndicator()
    }
}
```

!!! Note
    子組合比一般組合慢，因此此可組合項可能不適合 UI 中對效能要求極高的部分（例如：`LazyList`）。

**何時使用此函式：**

一般來說，如果您需要觀察 `AsyncImagePainter.state`，建議優先使用 `rememberAsyncImagePainter` 而不是此函式，因為它不使用子組合。

具體來說，只有在您需要觀察 `AsyncImagePainter.state`，且不能像使用 `rememberAsyncImagePainter` 那樣在首次組合和第一幀時狀態為 `Empty` 的情況下，此函式才有用。`SubcomposeAsyncImage` 使用子組合來獲取圖片的約束，因此其 `AsyncImagePainter.state` 會立即更新。

## 觀察 AsyncImagePainter.state

```kotlin
val painter = rememberAsyncImagePainter("https://example.com/image.jpg")
val state by painter.state.collectAsState()

when (state) {
    is AsyncImagePainter.State.Empty,
    is AsyncImagePainter.State.Loading -> {
        CircularProgressIndicator()
    }
    is AsyncImagePainter.State.Success -> {
        Image(
            painter = painter,
            contentDescription = stringResource(R.string.description)
        )
    }
    is AsyncImagePainter.State.Error -> {
        // 顯示某些錯誤 UI。
    }
}
```

## 轉換 (Transitions)

您可以使用 `ImageRequest.Builder.crossfade` 啟用內建的淡入淡出轉換 (crossfade transition)：

```kotlin
AsyncImage(
    model = ImageRequest.Builder(LocalContext.current)
        .data("https://example.com/image.jpg")
        .crossfade(true)
        .build(),
    contentDescription = null,
)
```

自訂的 [`Transition`](/coil/api/coil-core/coil3.transition/-transition) 無法與 `AsyncImage`、`SubcomposeAsyncImage` 或 `rememberAsyncImagePainter` 搭配使用，因為它們需要 `View` 參照。`CrossfadeTransition` 則是因為特殊的內部支援而可以運作。

話雖如此，仍可以透過觀察 `AsyncImagePainter.state` 在 Compose 中建立自訂轉換：

```kotlin
val painter = rememberAsyncImagePainter("https://example.com/image.jpg")

val state by painter.state.collectAsState()
if (state is AsyncImagePainter.State.Success && state.result.dataSource != DataSource.MEMORY_CACHE) {
    // 執行轉換動畫。
}

Image(
    painter = painter,
    contentDescription = stringResource(R.string.description),
)
```

請參閱 [Compose AnimatedContent](/coil/recipes/#compose-animatedcontent) 以獲取完整的 `AnimatedContent` 範例。

## 預覽 (Previews)

Android Studio 對於 `AsyncImage`/`rememberAsyncImagePainter`/`SubcomposeAsyncImage` 的預覽行為是由 `LocalAsyncImagePreviewHandler` 控制的。預設情況下，它會嘗試在預覽環境中正常執行請求。預覽環境中停用了網路存取，因此網路 URL 將始終失敗。

您可以像這樣覆寫預覽行為：

```kotlin
val previewHandler = AsyncImagePreviewHandler {
    ColorImage(Color.Red.toArgb())
}

CompositionLocalProvider(LocalAsyncImagePreviewHandler provides previewHandler) {
    AsyncImage(
        model = "https://example.com/image.jpg",
        contentDescription = null,
    )
}
```

這對於 [AndroidX 的 Compose Preview 螢幕截圖測試程式庫 (Screenshot Testing library)](https://developer.android.com/studio/preview/compose-screenshot-testing) 也很有用，它在相同的預覽環境中執行。

## Compose Multiplatform 資源 (Resources)

Coil 支援透過使用 `Res.getUri` 作為 `model` 參數來載入 [Compose Multiplatform 資源 (Resources)](https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-multiplatform-resources.html)。範例：

```kotlin
AsyncImage(
    model = Res.getUri("drawable/sample.jpg"),
    contentDescription = null,
)
```

!!! Note
    Coil 不支援 `Res.drawable.image` 和其他編譯安全參照。您必須改用 `Res.getUri("drawable/image")`。[請追蹤此問題以獲取最新動態](https://github.com/coil-kt/coil/issues/2812)。