[//]: # (title: 画像とアプリ内アイコン)
<web-summary>Compose Multiplatform for desktop で画像を表示する方法、ファイルシステムやネットワークから読み込む方法、およびウィンドウやトレイのアイコンとして使用する方法について学びます。</web-summary>

デスクトップ向けの Compose Multiplatform は、他のプラットフォームと同様に [マルチプラットフォームリソース](compose-multiplatform-resources.md) ライブラリから画像を読み込みます。また、デスクトップアプリケーションは、JVM API を使用してファイルシステムやネットワークから画像を読み込んだり、画像をウィンドウやトレイのアイコンとして使用したりすることもできます。

> このガイドの例は実行可能なデスクトップアプリです。試すには:
> 1. [Kotlin Multiplatform IDE プラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform) または [オンラインウィザード](https://kmp.jetbrains.com/?android=true&desktop=true&includeTests=false) を使用して Compose Multiplatform プロジェクトを作成します。
> 2. デスクトップのエントリポイントファイルを開きます。例: `desktopApp/src/main/kotlin/com/example/my_desktop_app/main.kt`。
> 3. その内容を提供されたサンプルコードで置き換えます。
>
{style="note" id="desktop-snippets-intro"}

このページの例では、Kotlin と Compose Multiplatform のロゴを使用しています。両方のロゴは [Kotlin Brand Assets](https://kotlinlang.org/docs/kotlin-brand-assets.html#kotlin-logo) パッケージの一部として利用可能です。

## リソースからの画像の表示 {id="displaying-images-from-resources"}

アプリケーションに同梱されている画像を表示するには、プロジェクトの [マルチプラットフォームリソースに追加](compose-multiplatform-resources-setup.md) し、プロジェクトをビルドしてリソースアクセサを生成します。そのアクセサを `painterResource()` に渡して `Painter` インスタンスを作成し、得られた `Painter` を `Image()` コンポーザブルに渡します:

```kotlin
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.WindowState
import androidx.compose.ui.window.application
import org.jetbrains.compose.resources.painterResource
import com.example.composeapp.generated.resources.Res
import com.example.composeapp.generated.resources.kotlin_logo

fun main() = application {
    Window(
        onCloseRequest = ::exitApplication,
        title = "Resource image",
        state = WindowState(size = DpSize(500.dp, 250.dp))
    ) {
        Image(
            painter = painterResource(Res.drawable.kotlin_logo),
            contentDescription = "Kotlin logo",
            modifier = Modifier.fillMaxSize().padding(24.dp)
        )
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Image(painter = painterResource(Res.drawable.kotlin_logo)"}

<img src="compose-desktop-images-resource.png" alt="An image from multiplatform resources" width="540"/>

`painterResource()` は、`.png`、`.jpg`、`.bmp`、`.webp` などのラスタライズされた画像形式や、Android XML ベクタードローアブル形式をサポートしています。リソースを `ImageBitmap` や `ImageVector` の値としてアクセスする方法や、アイコン、フォント、文字列の使用方法の詳細については、[アプリでのマルチプラットフォームリソースの使用](compose-multiplatform-resources-usage.md) を参照してください。

> リソースは必ずしも共通ソースセット（common source set）に配置する必要はありません。任意のソースセットやモジュールが独自の `composeResources` ディレクトリを使用できるため、デスクトップアプリケーション固有の画像をデスクトップ関連のコードの隣に配置できます。
> 
> 別のモジュールで宣言されたリソースを使用するには、そのモジュールで生成された `Res` クラスを [公開 (public)](compose-multiplatform-resources-usage.md#customizing-accessor-class-generation) にしてください。
>
{style="tip"}

## ファイルシステムやネットワークからの画像の読み込み {id="loading-images-from-the-file-system-or-the-network"}

アプリケーションの一部ではない画像（ユーザーによって選択されたファイルや実行時にダウンロードされたファイル）はリソースではありません。任意の JVM API を使用してそのバイト列を読み取り、リソースライブラリの以下のいずれかの関数を使ってデコードします:

| 画像形式     | デコード関数             | 結果          |
|--------------|--------------------------|---------------|
| ビットマップ | `decodeToImageBitmap()`  | `ImageBitmap` |
| XML ベクター | `decodeToImageVector()`  | `ImageVector` |
| SVG          | `decodeToSvgPainter()`   | `Painter`     |

ファイルやネットワークレスポンスの読み取りは呼び出し元のスレッドをブロックするため、これらの操作は常に UI スレッドの外で実行してください。

次の例では、`Dispatchers.IO` コンテキストで画像を読み込み、準備ができたらその画像を表示する `AsyncImage()` コンポーザブルを宣言しています:

```kotlin
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.painter.BitmapPainter
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.graphics.vector.rememberVectorPainter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.WindowState
import androidx.compose.ui.window.application
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.jetbrains.compose.resources.decodeToImageBitmap
import org.jetbrains.compose.resources.decodeToImageVector
import org.jetbrains.compose.resources.decodeToSvgPainter
import java.io.File
import java.io.IOException
import java.net.URI

fun main() = application {
    val density = LocalDensity.current
    Window(
        onCloseRequest = ::exitApplication,
        title = "Images from the file system and the network",
        state = WindowState(size = DpSize(380.dp, 480.dp))
    ) {
        Column(
            modifier = Modifier.fillMaxSize().padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("PNG from the file system")
            AsyncImage(
                load = { File("kotlin-logo.png").readBytes().decodeToImageBitmap() },
                painterFor = { remember { BitmapPainter(it) } },
                contentDescription = "Kotlin logo",
                modifier = Modifier.width(260.dp)
            )
            Text("XML vector from the file system")
            AsyncImage(
                load = { File("compose-logo.xml").readBytes().decodeToImageVector(density) },
                painterFor = { rememberVectorPainter(it) },
                contentDescription = "Compose Multiplatform logo",
                contentScale = ContentScale.FillWidth,
                modifier = Modifier.width(100.dp)
            )
            Text("SVG from the network")
            AsyncImage(
                load = { loadBytes(COMPOSE_LOGO_URL).decodeToSvgPainter(density) },
                painterFor = { it },
                contentDescription = "Compose Multiplatform logo",
                contentScale = ContentScale.FillWidth,
                modifier = Modifier.width(100.dp)
            )
        }
    }
}

private const val COMPOSE_LOGO_URL =
    "https://github.com/JetBrains/compose-multiplatform/raw/master/artwork/compose-logo.svg"

fun loadBytes(url: String): ByteArray =
    URI(url).toURL().openStream().use { it.readBytes() }

@Composable
fun <T> AsyncImage(
    load: suspend () -> T,
    painterFor: @Composable (T) -> Painter,
    contentDescription: String,
    modifier: Modifier = Modifier,
    contentScale: ContentScale = ContentScale.Fit
) {
    val image: T? by produceState<T?>(null) {
        value = withContext(Dispatchers.IO) {
            try {
                load()
            } catch (e: IOException) {
                // コンソールに出力する代わりに、エラーをログに記録するか、
                // プレースホルダー画像を表示することもできます。
                e.printStackTrace()
                null
            }
        }
    }

    if (image != null) {
        Image(
            painter = painterFor(image!!),
            contentDescription = contentDescription,
            contentScale = contentScale,
            modifier = modifier
        )
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="fun <T> AsyncImage(load: suspend () -> T, painterFor: @Composable (T) -> Painter"}

<img src="compose-desktop-images-async.png" alt="Images loaded from the file system and the network" width="420"/>

この例のファイルパスは、アプリケーションの作業ディレクトリを基準にして解決されます。

> リモート画像を手動で読み込む代わりに、[専用の画像読み込みライブラリ](compose-multiplatform-resources-usage.md#remote-files) を使用することもできます。
>
{style="tip"}

## ウィンドウアイコンの設定 {id="setting-the-window-icon"}

画像をウィンドウアイコンとして使用するには、`Window()` コンポーザブルの `icon` パラメータに `Painter` インスタンスを渡します:

```kotlin
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.paint
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.WindowState
import androidx.compose.ui.window.application
import org.jetbrains.compose.resources.painterResource
import com.example.composeapp.generated.resources.Res
import com.example.composeapp.generated.resources.compose_logo

fun main() = application {
    val icon = painterResource(Res.drawable.compose_logo)

    Window(
        onCloseRequest = ::exitApplication,
        title = "Window icon",
        icon = icon,
        state = WindowState(size = DpSize(400.dp, 300.dp))
    ) {
        Box(Modifier.fillMaxSize().paint(icon, contentScale = ContentScale.Fit))
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Window(icon = painterResource(Res.drawable.compose_logo)"}

アイコンの表示場所はオペレーティングシステムによって異なります:

* Windows および Linux では、ウィンドウおよびそのタスクバーエントリのアイコンになります。
* macOS では、アプリケーションアイコンはアプリケーションバンドルから取得されます。Dock のアイコンを変更するには、[配布設定](compose-native-distribution.md#application-icon) で設定してください。

以下のスクリーンショットは、macOS 上でパッケージ化されたアプリケーションを示しています。ウィンドウには `icon` パラメータに渡されたものと同じ画像が表示され、Dock アイコンには配布設定で宣言された `.icns` ファイルが使用されます:

<img src="compose-desktop-images-window-icon.png" alt="A packaged application and its Dock icon" width="426"/>

### 単一ウィンドウアプリケーションのアイコン {id="single-window-application-icon"}

`singleWindowApplication()` 関数は、`painterResource()` が利用できないコンポジションの外部で `icon` パラメータを評価します。代わりに、`composeResources` ディレクトリ内のファイルパスを受け取る `Res.readBytes()` を使用してリソースを読み込み、`BitmapPainter` にデコードします:

```kotlin
import androidx.compose.material.Text
import androidx.compose.ui.graphics.painter.BitmapPainter
import androidx.compose.ui.window.singleWindowApplication
import kotlinx.coroutines.runBlocking
import org.jetbrains.compose.resources.decodeToImageBitmap
import com.example.composeapp.generated.resources.Res

fun main() {
    val iconBytes = runBlocking { Res.readBytes("drawable/kotlin-logo.png") }
    val icon = BitmapPainter(iconBytes.decodeToImageBitmap())

    singleWindowApplication(icon = icon, title = "Single window icon") {
        Text("Hello, World!")
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="val icon = BitmapPainter(iconBytes.decodeToImageBitmap())"}

## トレイアイコンの設定 {id="setting-the-tray-icon"}

画像を [トレイ](compose-desktop-tray.md) アイコンとして使用するには、`Tray()` コンポーザブルの `icon` パラメータに `Painter` インスタンスを渡します:

```kotlin
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Tray
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.WindowState
import androidx.compose.ui.window.application
import com.example.composeapp.generated.resources.Res
import com.example.composeapp.generated.resources.compose_logo
import org.jetbrains.compose.resources.painterResource

fun main() = application {
  val icon = painterResource(Res.drawable.compose_logo)

  Tray(
    icon = icon,
    tooltip = "Compose Multiplatform",
    menu = {
      Item("Exit", onClick = ::exitApplication)
    }
  )

  Window(
    onCloseRequest = ::exitApplication,
    title = "Tray icon",
    icon = icon,
    state = WindowState(size = DpSize(400.dp, 300.dp))
  ) {
    Box(modifier = Modifier.fillMaxSize().padding(24.dp)) {
      Image(
        painter = icon,
        contentDescription = "Compose Multiplatform logo",
        modifier = Modifier.fillMaxSize()
      )
    }
  }
}
```

macOS では、トレイアイコンはメニューバーに表示されます:

<img src="compose-desktop-images-tray-icon.png" alt="A tray icon in the macOS menu bar" width="430"/>

## 次のステップ {id="what-s-next"}

* [マルチプラットフォームリソース](compose-multiplatform-resources.md) および共通コードから [それらにアクセスする方法](compose-multiplatform-resources-usage.md) についてさらに詳しく学びます。
* [システムトレイ](compose-desktop-tray.md) にアプリケーションアイコンを追加する方法について学びます。
* プラットフォーム固有のアプリケーションアイコンを含む [ネイティブディストリビューションを作成する](compose-native-distribution.md) 方法について学びます。
* [その他のデスクトップコンポーネント](compose-desktop-components.md) に関するチュートリアルを確認します。