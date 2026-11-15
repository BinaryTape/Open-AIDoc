# Compose

[Compose UI](https://www.jetbrains.com/compose-multiplatform/) のサポートを追加するには、拡張ライブラリをインポートします。

```kotlin
implementation("io.coil-kt.coil3:coil-compose:3.6.3")
```

次に、`AsyncImage` コンポーザブルを使用して画像を読み込み、表示します。

```kotlin
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
)
```

`model` には、`ImageRequest.data` の値または `ImageRequest` 自体を指定できます。`contentDescription` は、アクセシビリティサービスがこの画像が何を表しているかを説明するために使用するテキストを設定します。

## AsyncImage {id="asyncimage"}

`AsyncImage` は、画像リクエストを非同期で実行し、結果を描画するコンポーザブルです。標準の `Image` コンポーザブルと同じ引数をサポートしているほか、`placeholder`/`error`/`fallback` ペインターや `onLoading`/`onSuccess`/`onError` コールバックの設定もサポートしています。以下は、画像を円形に切り抜き（circle crop）、クロスフェードを適用し、プレースホルダーを設定して読み込む例です。

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

**この関数を使用するケース:**

ほとんどのケースで `AsyncImage` の使用を推奨します。コンポーザブルの制約（constraints）と指定された `ContentScale` に基づいて、画像を読み込むべき適切なサイズを正しく決定します。

## rememberAsyncImagePainter {id="rememberasyncimagepainter"}

内部的には、`AsyncImage` と `SubcomposeAsyncImage` は `model` を読み込むために `rememberAsyncImagePainter` を使用しています。コンポーザブルではなく `Painter` が必要な場合は、`rememberAsyncImagePainter` を使用して画像を読み込むことができます。

```kotlin
val painter = rememberAsyncImagePainter("https://example.com/image.jpg")
```

`rememberAsyncImagePainter` は `AsyncImage` や `SubcomposeAsyncImage` よりも柔軟ですが、いくつかの欠点があります（後述）。

**この関数を使用するケース:**

コンポーザブルの代わりに `Painter` が必要な場合や、`AsyncImagePainter.state` を監視してそれに基づいて異なるコンポーザブルを描画する必要がある場合、または `AsyncImagePainter.restart` を使用して画像リクエストを手動で再開する必要がある場合に役立ちます。

この関数の主な欠点は、画面上で画像が読み込まれるサイズを検出せず、常に元の寸法で画像を読み込む点です。これを解決するために、カスタムの `SizeResolver` を渡すか、（`AsyncImage` が内部で使用している）`rememberConstraintsSizeResolver` を使用できます。例:

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

もう 1 つの欠点は、`rememberAsyncImagePainter` を使用する場合、たとえ画像がメモリキャッシュに存在し最初のフレームで描画されるとしても、初回のコンポジション（composition）では `AsyncImagePainter.state` が常に `AsyncImagePainter.State.Empty` になることです。

## SubcomposeAsyncImage {id="subcomposeasyncimage"}

`SubcomposeAsyncImage` は `AsyncImage` のバリアント（派生版）であり、`Painter` を使用する代わりにサブコンポジション（subcomposition）を使用して `AsyncImagePainter` の状態に対するスロット API を提供します。以下に例を示します。

```kotlin
SubcomposeAsyncImage(
    model = "https://example.com/image.jpg",
    loading = {
        CircularProgressIndicator()
    },
    contentDescription = stringResource(R.string.description),
)
```

さらに、`content` 引数と現在の状態を描画する `SubcomposeAsyncImageContent` を使用して、より複雑なロジックを実装することもできます。

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
    サブコンポジションは通常のコンポジションよりも低速であるため、このコンポーザブルは UI のパフォーマンスが重要となる部分（例: `LazyList`）には適さない場合があります。

**この関数を使用するケース:**

`AsyncImagePainter.state` を監視する必要がある場合は、サブコンポジションを使用しないため、通常はこの関数の代わりに `rememberAsyncImagePainter` を使用することをお勧めします。

具体的には、この関数は `AsyncImagePainter.state` を監視する必要があり、かつ `rememberAsyncImagePainter` のように初回コンポジションおよび初回フレームで `Empty` になってほしくない場合にのみ有用です。`SubcomposeAsyncImage` はサブコンポジションを使用して画像の制約を取得するため、`AsyncImagePainter.state` が即座に最新の状態になります。

## Observing AsyncImagePainter.state {id="observing-asyncimagepainter-state"}

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
        // Show some error UI.
    }
}
```

## Transitions {id="transitions"}

`ImageRequest.Builder.crossfade` を使用して、組み込みのクロスフェードトランジションを有効にできます。

```kotlin
AsyncImage(
    model = ImageRequest.Builder(LocalContext.current)
        .data("https://example.com/image.jpg")
        .crossfade(true)
        .build(),
    contentDescription = null,
)
```

カスタムの [`Transition`](/coil/api/coil-core/coil3.transition/-transition) は、`View` の参照を必要とするため、`AsyncImage`、`SubcomposeAsyncImage`、`rememberAsyncImagePainter` では動作しません。`CrossfadeTransition` は内部的な特別なサポートがあるため動作します。

とはいえ、`AsyncImagePainter.state` を監視することで、Compose でカスタムトランジションを作成することは可能です。

```kotlin
val painter = rememberAsyncImagePainter("https://example.com/image.jpg")

val state = painter.state.collectAsState().value
if (state is AsyncImagePainter.State.Success && state.result.dataSource != DataSource.MEMORY_CACHE) {
    // Perform the transition animation.
}

Image(
    painter = painter,
    contentDescription = stringResource(R.string.description),
)
```

完全な `AnimatedContent` の例については、[Compose AnimatedContent](/coil/recipes#compose-animatedcontent) を参照してください。

## Previews {id="previews"}

`AsyncImage`/`rememberAsyncImagePainter`/`SubcomposeAsyncImage` に対する Android Studio のプレビューの挙動は、`LocalAsyncImagePreviewHandler` によって制御されます。デフォルトでは、プレビュー環境内で通常どおりリクエストを実行しようとします。プレビュー環境ではネットワークアクセスが無効になっているため、ネットワーク URL の読み込みは常に失敗します。

プレビューの挙動は次のようにオーバーライドできます。

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

これは、同じプレビュー環境で実行される [AndroidX の Compose Preview Screenshot Testing ライブラリ](https://developer.android.com/studio/preview/compose-screenshot-testing) にも役立ちます。

## Compose Multiplatform Resources {id="compose-multiplatform-resources"}

Coil は、`model` パラメータとして `Res.getUri` を使用することで、[Compose Multiplatform Resources](https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-multiplatform-resources.html) の読み込みをサポートしています。例:

```kotlin
AsyncImage(
    model = Res.getUri("drawable/sample.jpg"),
    contentDescription = null,
)
```

!!! Note
    `Res.drawable.image` などのコンパイル時に安全な参照（compile-safe references）は Coil ではサポートされていません。代わりに `Res.getUri("drawable/image")` を使用する必要があります。最新情報は [この Issue を確認してください](https://github.com/coil-kt/coil/issues/2812)。