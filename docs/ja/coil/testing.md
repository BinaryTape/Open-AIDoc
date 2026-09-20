# テスト

テストサポートクラスを使用するには、拡張ライブラリをインポートします：

```kotlin
testImplementation("io.coil-kt.coil3:coil-test:3.6.3")
```

`coil-test` には `FakeImageLoaderEngine` が含まれています。これを `ImageLoader` に追加することで、すべての受信 `ImageRequest` をインターセプトし、カスタムの `ImageResult` を返すことができます。これは、画像の読み込みを同期（メインスレッドから実行）かつ一貫性のあるものにできるため、テストにおいて有用です。`FakeImageLoaderEngine` を使用することで、`ImageLoader` は、通常の画像読み込みで行われるメモリキャッシュ、スレッドの切り替え（thread jumping）、ディスク/ネットワーク I/O フェッチ、および画像デコードなどの処理をすべて回避します。例を以下に示します：

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

`ColorImage` は、その幅や高さに応じて色付きのボックスを描画したり、キャンバスを単色で塗りつぶしたりすることができ、すべてのプラットフォームでサポートされているため、テストに便利です。

この戦略は、実機やエミュレータを使用せずに UI のスクリーンショットテストを行う [Paparazzi](https://github.com/cashapp/paparazzi) と組み合わせて使用するのに非常に適しています：

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
        // 赤いボックスが表示されます。
        paparazzi.snapshot {
            AsyncImage(
                model = "https://example.com/image.jpg",
                contentDescription = null,
            )
        }
    }

    @Test
    fun testContentComposeGreen() {
        // 緑のボックスが表示されます。
        paparazzi.snapshot {
            AsyncImage(
                model = "https://www.example.com/test.png",
                contentDescription = null,
            )
        }
    }

    @Test
    fun testContentComposeBlue() {
        // 青いボックスが表示されます。
        paparazzi.snapshot {
            AsyncImage(
                model = "https://www.example.com/default.png",
                contentDescription = null,
            )
        }
    }
}