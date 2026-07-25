# Compose

[Compose UI](https://www.jetbrains.com/compose-multiplatform/) のサポートを追加するには、以下の拡張ライブラリをインポートします：

```kotlin
implementation("io.coil-kt.coil3:coil-compose:3.5.0")
```

次に、`AsyncImage` コンポーザブルを使用して画像を読み込み、表示します：

```kotlin
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
)
```

`model` には `ImageRequest.data` の値、または `ImageRequest` 自体を指定できます。`contentDescription` は、アクセシビリティサービスがこの画像が何を表しているかを説明するために使用するテキストを設定します。

## AsyncImage

`AsyncImage` は、画像リクエストを非同期に実行し、結果をレンダリングするコンポーザブルです。標準の `Image` コンポーザブルと同じ引数をサポートしているほか、`placeholder`/`error`/`fallback` の painter や、`onLoading`/`onSuccess`/`onError` コールバックの設定もサポートしています。以下は、画像を円形に切り抜き、クロスフェードを適用し、プレースホルダーを設定して読み込む例です：

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

**この関数をいつ使用するか:**

ほとんどの場合、`AsyncImage` の使用を推奨します。コンポーザブルの制約（constraints）と指定された `ContentScale` に基づいて、画像を読み込むべきサイズを正しく決定します。

## rememberAsyncImagePainter

内部的には、`AsyncImage` と `SubcomposeAsyncImage` は `rememberAsyncImagePainter` を使用して `model` を読み込みます。コンポーザブルではなく `Painter` が必要な場合は、`rememberAsyncImagePainter` を使用して画像を読み込むことができます：

```kotlin
val painter = rememberAsyncImagePainter("https://example.com/image.jpg")
```

`rememberAsyncImagePainter` は `AsyncImage` や `SubcomposeAsyncImage` よりも柔軟ですが、いくつか欠点があります（後述）。

**この関数をいつ使用するか:**

コンポーザブルではなく `Painter` が必要な場合や、`AsyncImagePainter.state` を監視してそれに基づいて別のコンポーザブルを描画する必要がある場合、または `AsyncImagePainter.restart` を使用して手動で画像リクエストを再開する必要がある場合に便利です。

この関数の主な欠点は、画像が画面上で表示されるサイズを検出せず、常に元のディメンション（寸法）で画像を読み込むことです。これを解決するには、カスタムの `SizeResolver` を渡すか、`rememberConstraintsSizeResolver`（`AsyncImage` が内部で使用しているもの）を使用します。例：

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

もう一つの欠点は、`rememberAsyncImagePainter` を使用する場合、たとえ画像がメモリキャッシュに存在し、最初のフレームで描画されるとしても、最初のコンポジション（composition）において `AsyncImagePainter.state` が常に `AsyncImagePainter.State.Empty` になることです。

## SubcomposeAsyncImage

`SubcomposeAsyncImage` は `AsyncImage` のバリエーションで、`Painter` を使用する代わりに、サブコンポジション（subcomposition）を使用して `AsyncImagePainter` の状態に応じたスロット API を提供します。例：

```kotlin
SubcomposeAsyncImage(
    model = "https://example.com/image.jpg",
    loading = {
        CircularProgressIndicator()
    },
    contentDescription = stringResource(R.string.description),
)
```

さらに、`content` 引数と、現在の状態をレンダリングする `SubcomposeAsyncImageContent` を使用して、より複雑なロジックを実装することもできます：

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
    サブコンポジションは通常のコンポジションよりも低速なため、このコンポーザブルは UI のパフォーマンスが重要な部分（例：`LazyList`）には適さない場合があります。

**この関数をいつ使用するか:**

サブコンポジションを使用しないため、`AsyncImagePainter.state` を監視する必要がある場合は、通常この関数の代わりに `rememberAsyncImagePainter` を使用することを推奨します。

具体的には、`AsyncImagePainter.state` を監視する必要があり、かつ `rememberAsyncImagePainter` のように最初のコンポジションや最初のフレームで状態を `Empty` にしたくない場合にのみ、この関数は有用です。`SubcomposeAsyncImage` はサブコンポジションを使用して画像の制約を取得するため、`AsyncImagePainter.state` は即座に最新の状態になります。

## AsyncImagePainter.state の監視

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
        // 何らかのエラー UI を表示する
    }
}
```

## 遷移 (Transitions)

`ImageRequest.Builder.crossfade` を使用して、組み込みのクロスフェード遷移（crossfade transition）を有効にできます：

```kotlin
AsyncImage(
    model = ImageRequest.Builder(LocalContext.current)
        .data("https://example.com/image.jpg")
        .crossfade(true)
        .build(),
    contentDescription = null,
)
```

カスタムの [`Transition`](/coil/api/coil-core/coil3.transition/-transition) は、`View` の参照を必要とするため、`AsyncImage`、`SubcomposeAsyncImage`、または `rememberAsyncImagePainter` では動作しません。`CrossfadeTransition` は内部的な特別なサポートにより動作します。

とはいえ、`AsyncImagePainter.state` を監視することで、Compose でカスタム遷移を作成することは可能です：

```kotlin
val painter = rememberAsyncImagePainter("https://example.com/image.jpg")

val state by painter.state.collectAsState()
if (state is AsyncImagePainter.State.Success && state.result.dataSource != DataSource.MEMORY_CACHE) {
    // 遷移アニメーションを実行する
}

Image(
    painter = painter,
    contentDescription = stringResource(R.string.description),
)
```

完全な `AnimatedContent` の例については、[Compose AnimatedContent](/coil/recipes#compose-animatedcontent) を参照してください。

## プレビュー (Previews)

`AsyncImage`/`rememberAsyncImagePainter`/`SubcomposeAsyncImage` の Android Studio プレビュー時の動作は、`LocalAsyncImagePreviewHandler` によって制御されます。デフォルトでは、プレビュー環境内でも通常通りリクエストの実行を試みます。プレビュー環境ではネットワークアクセスが無効になっているため、ネットワーク URL は常に失敗します。

プレビューの動作は以下のようにオーバーライドできます：

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

## Compose Multiplatform Resources

Coil は、`model` パラメータとして `Res.getUri` を使用することで、[Compose Multiplatform Resources](https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-multiplatform-resources.html) の読み込みをサポートしています。例：

```kotlin
AsyncImage(
    model = Res.getUri("drawable/sample.jpg"),
    contentDescription = null,
)
```

!!! Note
    `Res.drawable.image` やその他のコンパイルセーフな参照は、Coil ではサポートされていません。代わりに `Res.getUri("drawable/image")` を使用する必要があります。[更新情報については、この issue を確認してください](https://github.com/coil-kt/coil/issues/2812)。
