# GIF

**この機能は Android でのみ利用可能です。**

Glide とは異なり、GIF はデフォルトではサポートされていません。しかし、Coil にはそれらをサポートするための拡張ライブラリがあります。

GIF サポートを追加するには、拡張ライブラリをインポートします：

```kotlin
implementation("io.coil-kt.coil3:coil-gif:3.6.3")
```

これで完了です！`ImageLoader` はファイルヘッダーを使用して GIF を自動的に検出し、正しくデコードします。

必要に応じて、`ImageLoader` を構築する際にデコーダーをコンポーネントレジストリ（component registry）に手動で追加することもできます：

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

GIF の各フレームのピクセルデータを変換するには、[AnimatedTransformation](/coil/api/coil-gif/coil3.gif/-animated-transformation) を参照してください。

!!! Note
    Coil には GIF のデコードをサポートするために 2 つの個別のデコーダーが含まれています。`GifDecoder` はすべての API レベルをサポートしていますが、低速です。`AnimatedImageDecoder` は Android の [ImageDecoder](https://developer.android.com/reference/android/graphics/ImageDecoder) API（API 28 以上でのみ利用可能）を使用しています。`AnimatedImageDecoder` は `GifDecoder` よりも高速で、アニメーション WebP 画像やアニメーション HEIF 画像シーケンスのデコードもサポートしています。