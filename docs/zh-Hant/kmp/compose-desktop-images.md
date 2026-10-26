[//]: # (title: 影像與應用程式內圖示)
<web-summary>了解如何在 Compose Multiplatform 桌面版中顯示影像、從檔案系統或網路載入影像，並將其用作視窗和系統匣圖示。</web-summary>

Compose Multiplatform 桌面版就像其他平台一樣，從[多平台資源](compose-multiplatform-resources.md)程式庫載入影像。桌面應用程式還可以透過 JVM API 從檔案系統或網路讀取影像，並將影像用作視窗和系統匣圖示。

> 本指南中的範例都是可執行的桌面應用程式。若要嘗試執行其中一個：
> 1. 使用 [Kotlin Multiplatform IDE 外掛程式](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)或[線上精靈](https://kmp.jetbrains.com/?android=true&desktop=true&includeTests=false)建立 Compose Multiplatform 專案。
> 2. 開啟桌面入口點檔案。例如：`desktopApp/src/main/kotlin/com/example/my_desktop_app/main.kt`。
> 3. 將其內容取代為所提供的範例。
>
{style="note" id="desktop-snippets-intro"}

本頁的範例使用了 Kotlin 與 Compose Multiplatform 的標誌。這兩個標誌都作為 [Kotlin 品牌資產](https://kotlinlang.org/docs/kotlin-brand-assets.html#kotlin-logo)套件的一部分提供。

## 顯示來自資源的影像 {id="displaying-images-from-resources"}

若要顯示隨應用程式打包的影像，請[將其新增至專案的多平台資源中](compose-multiplatform-resources-setup.md)，並建置專案以產生資源存取器。透過將存取器傳遞給 `painterResource()` 來建立 `Painter` 執行個體，並將產生的 `Painter` 傳遞給 `Image()` 可組合項：

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

<img src="compose-desktop-images-resource.png" alt="來自多平台資源的影像" width="540"/>

`painterResource()` 支援點陣圖格式（如 `.png`、`.jpg`、`.bmp` 和 `.webp`），以及 Android XML 向量 drawable 格式。如需以 `ImageBitmap` 或 `ImageVector` 值的形式存取資源，以及使用圖示、字型與字串的詳細資訊，請參閱[在應用程式中使用多平台資源](compose-multiplatform-resources-usage.md)。

> 資源不一定要儲存在 common 原始碼集中。任何原始碼集或模組都可以使用自己的 `composeResources` 目錄，因此您可以將桌面應用程式專用的影像存放在桌面相關程式碼旁。
> 
> 若要使用在其他模組中宣告的資源，請將該模組產生的 `Res` 類別設為 [public](compose-multiplatform-resources-usage.md#customizing-accessor-class-generation)。
>
{style="tip"}

## 從檔案系統或網路載入影像 {id="loading-images-from-the-file-system-or-the-network"}

不屬於應用程式一部分的影像（由使用者選擇或在執行階段下載的檔案）不屬於資源。您可以使用任何 JVM API 讀取其位元組，並使用資源程式庫的下列函式之一進行解碼：

| 影像格式 | 解碼函式 | 結果 |
|--------------|--------------------------|---------------|
| 點陣圖 (Bitmap) | `decodeToImageBitmap()` | `ImageBitmap` |
| XML 向量 | `decodeToImageVector()` | `ImageVector` |
| SVG | `decodeToSvgPainter()` | `Painter` |

讀取檔案或網路回應會阻塞呼叫執行緒，因此請務必在 UI 執行緒之外執行這些操作。

以下範例宣告了一個 `AsyncImage()` 可組合項，它會在 `Dispatchers.IO` 上下文中載入影像，並在影像就緒時顯示：

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
                // 除了列印到主控台，您也可以記錄錯誤
                // 或顯示預留位置影像。
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

<img src="compose-desktop-images-async.png" alt="從檔案系統與網路載入的影像" width="420"/>

範例中的檔案路徑是相對於應用程式的工作目錄進行解析的。

> 與其手動載入遠端影像，您可以使用[專用的影像載入程式庫](compose-multiplatform-resources-usage.md#remote-files)。
>
{style="tip"}

## 設定視窗圖示 {id="setting-the-window-icon"}

若要將影像用作視窗圖示，請將 `Painter` 執行個體作為 `icon` 參數傳遞給 `Window()` 可組合項：

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

圖示的位置取決於作業系統：

* 在 Windows 和 Linux 上，它是視窗及其工作列項目的圖示。
* 在 macOS 上，應用程式圖示來自應用程式套件 (application bundle)。若要變更 Dock 中的圖示，請在[發行組態](compose-native-distribution.md#application-icon)中進行設定。

以下螢幕截圖顯示了 macOS 上的已打包應用程式。視窗顯示傳遞給 `icon` 參數的相同影像，而 Dock 圖示則來自發行組態中宣告的 `.icns` 檔案：

<img src="compose-desktop-images-window-icon.png" alt="已打包應用程式及其 Dock 圖示" width="426"/>

### 單一視窗應用程式圖示 {id="single-window-application-icon"}

`singleWindowApplication()` 函式會在組合 (composition) 之外求值其 `icon` 參數，此時 `painterResource()` 不可用。相對地，請改用 `Res.readBytes()` 讀取資源（該函式接收 `composeResources` 目錄內的檔案路徑），並將其解碼為 `BitmapPainter`：

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

## 設定系統匣圖示 {id="setting-the-tray-icon"}

若要將影像用作[系統匣](compose-desktop-tray.md)圖示，請將 `Painter` 執行個體作為 `icon` 參數傳遞給 `Tray()` 可組合項：

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

在 macOS 上，系統匣圖示會顯示在選單列中：

<img src="compose-desktop-images-tray-icon.png" alt="macOS 選單列中的系統匣圖示" width="430"/>

## 後續步驟 {id="what-s-next"}

* 進一步了解[多平台資源](compose-multiplatform-resources.md)以及[如何在通用程式碼中存取它們](compose-multiplatform-resources-usage.md)。
* 了解如何將應用程式圖示新增至[系統匣](compose-desktop-tray.md)。
* 了解如何使用平台專屬的應用程式圖示[建立原生發行版本](compose-native-distribution.md)。
* 探索關於[其他桌面元件](compose-desktop-components.md)的教學。