# Compose

若要加入對 [Compose UI](https://www.jetbrains.com/compose-multiplatform/) 的支援，請匯入擴充程式庫：

```kotlin
implementation("io.coil-kt.coil3:coil-compose:3.6.3")
```

接著使用 `AsyncImage` 可組合函式 (composable) 來載入並顯示圖片：

```kotlin
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
)
```

`model` 可以是 `ImageRequest.data` 的值，也可以是 `ImageRequest` 本身。`contentDescription` 則用於設定無障礙服務所使用的文字，以描述該圖片所代表的內容。

## AsyncImage {id="asyncimage"}

`AsyncImage` 是一個以非同步方式執行圖片請求並算繪結果的可組合函式。它支援與標準 `Image` 可組合函式相同的引數，此外還支援設定 `placeholder`/`error`/`fallback` 繪製器 (painters) 以及 `onLoading`/`onSuccess`/`onError` 回呼。以下是一個載入圖片並套用圓形裁剪、淡入淡出動畫，並設定占位圖的範例：

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

在大多數情況下建議優先使用 `AsyncImage`。它能根據可組合函式的條件約束以及所提供的 `ContentScale`，正確決定圖片應載入的尺寸。

## rememberAsyncImagePainter {id="rememberasyncimagepainter"}

在內部實作中，`AsyncImage` 與 `SubcomposeAsyncImage` 都是使用 `rememberAsyncImagePainter` 來載入 `model`。如果你需要的是 `Painter` 而非可組合函式，可以使用 `rememberAsyncImagePainter` 來載入圖片：

```kotlin
val painter = rememberAsyncImagePainter("https://example.com/image.jpg")
```

`rememberAsyncImagePainter` 比 `AsyncImage` 和 `SubcomposeAsyncImage` 更加靈活，但也有一些缺點（見下文）。

**何時使用此函式：**

適用於需要 `Painter` 而非可組合函式的情況——或者你需要觀察 `AsyncImagePainter.state` 並據此繪製不同的可組合函式——又或者你需要使用 `AsyncImagePainter.restart` 手動重新啟動圖片請求時。

此函式的主要缺點在於它不會偵測圖片在螢幕上載入時的尺寸，而一律以圖片原始尺寸進行載入。你可以傳入自訂的 `SizeResolver`，或是使用 `rememberConstraintsSizeResolver`（這也是 `AsyncImage` 內部使用的方式）來解決此問題。範例：

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

另一個缺點是，使用 `rememberAsyncImagePainter` 時，在首次組合 (composition) 中 `AsyncImagePainter.state` 永遠為 `AsyncImagePainter.State.Empty`——即使該圖片已存在於記憶體快取中且會在第一影格繪製也是如此。

## SubcomposeAsyncImage {id="subcomposeasyncimage"}

`SubcomposeAsyncImage` 是 `AsyncImage` 的一種變體，它使用子組合 (subcomposition) 為 `AsyncImagePainter` 的各個狀態提供插槽 API (slot API)，而不是使用 `Painter`。範例如下：

```kotlin
SubcomposeAsyncImage(
    model = "https://example.com/image.jpg",
    loading = {
        CircularProgressIndicator()
    },
    contentDescription = stringResource(R.string.description),
)
```

此外，你還可以透過其 `content` 引數與 `SubcomposeAsyncImageContent`（用來算繪目前狀態）實現更複雜的邏輯：

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
    子組合 (subcomposition) 的速度比一般組合慢，因此這個可組合函式可能不適合用於 UI 中極度注重效能的部分（例如 `LazyList`）。

**何時使用此函式：**

如果需要觀察 `AsyncImagePainter.state`，通常建議優先使用 `rememberAsyncImagePainter` 而非此函式，因為前者不會使用子組合。

具體來說，只有當你需要觀察 `AsyncImagePainter.state`，而且無法接受像 `rememberAsyncImagePainter` 那樣在首次組合與第一影格中呈現 `Empty` 狀態時，此函式才有用處。`SubcomposeAsyncImage` 利用子組合來取得圖片的條件約束，因此其 `AsyncImagePainter.state` 可以立即更新為最新狀態。

## 觀察 AsyncImagePainter.state {id="observing-asyncimagepainter-state"}

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
        // 顯示錯誤 UI。
    }
}
```

## 轉場效果 (Transitions) {id="transitions"}

你可以使用 `ImageRequest.Builder.crossfade` 來啟用內建的淡入淡出轉場效果：

```kotlin
AsyncImage(
    model = ImageRequest.Builder(LocalContext.current)
        .data("https://example.com/image.jpg")
        .crossfade(true)
        .build(),
    contentDescription = null,
)
```

自訂的 [`Transition`](/coil/api/coil-core/coil3.transition/-transition) 無法與 `AsyncImage`、`SubcomposeAsyncImage` 或 `rememberAsyncImagePainter` 搭配使用，因為它們需要 `View` 參照。`CrossfadeTransition` 能運作是因為內部有特殊支援。

話雖如此，在 Compose 中仍可透過觀察 `AsyncImagePainter.state` 來建立自訂轉場：

```kotlin
val painter = rememberAsyncImagePainter("https://example.com/image.jpg")

val state = painter.state.collectAsState().value
if (state is AsyncImagePainter.State.Success && state.result.dataSource != DataSource.MEMORY_CACHE) {
    // 執行轉場動畫。
}

Image(
    painter = painter,
    contentDescription = stringResource(R.string.description),
)
```

如需完整的 `AnimatedContent` 範例，請參閱 [Compose AnimatedContent](/coil/recipes#compose-animatedcontent)。

## 預覽 (Previews) {id="previews"}

`AsyncImage`／`rememberAsyncImagePainter`／`SubcomposeAsyncImage` 在 Android Studio 中的預覽行為是由 `LocalAsyncImagePreviewHandler` 控制。預設情況下，它會嘗試在預覽環境中照常執行請求。然而預覽環境中已停用網路連線，因此網路 URL 一律會失敗。

你可以像這樣覆寫預覽行為：

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

這對於在相同預覽環境中執行的 [AndroidX Compose Preview 螢幕截圖測試程式庫](https://developer.android.com/studio/preview/compose-screenshot-testing) 也非常實用。

## Compose Multiplatform Resources {id="compose-multiplatform-resources"}

Coil 支援透過將 `Res.getUri` 作為 `model` 參數來載入 [Compose Multiplatform Resources](https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-multiplatform-resources.html)。範例：

```kotlin
AsyncImage(
    model = Res.getUri("drawable/sample.jpg"),
    contentDescription = null,
)
```

!!! Note
    Coil 不支援 `Res.drawable.image` 以及其他編譯期型別安全的參照。你必須改用 `Res.getUri("drawable/image")`。[追蹤此 Issue 以取得最新動態](https://github.com/coil-kt/coil/issues/2812)。