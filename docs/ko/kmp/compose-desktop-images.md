[//]: # (title: 이미지 및 인앱 아이콘)
<web-summary>데스크톱용 Compose Multiplatform에서 이미지를 표시하고, 파일 시스템이나 네트워크에서 이미지를 로드하며, 창 및 트레이 아이콘으로 사용하는 방법을 알아봅니다.</web-summary>

데스크톱용 Compose Multiplatform은 다른 플랫폼과 마찬가지로 [멀티플랫폼 리소스(multiplatform resources)](compose-multiplatform-resources.md) 라이브러리에서 이미지를 로드합니다. 또한 데스크톱 애플리케이션은 JVM API를 사용하여 파일 시스템이나 네트워크에서 이미지를 읽어올 수 있으며, 이미지를 창 및 트레이 아이콘으로 사용할 수도 있습니다.

> 이 가이드의 예제들은 실행 가능한 데스크톱 앱입니다. 직접 실행해 보려면 다음과 같이 하세요:
> 1. [Kotlin Multiplatform IDE 플러그인](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform) 또는 [온라인 위저드(online wizard)](https://kmp.jetbrains.com/?android=true&desktop=true&includeTests=false)를 사용하여 Compose Multiplatform 프로젝트를 생성합니다.
> 2. 데스크톱 진입점 파일을 엽니다. 예: `desktopApp/src/main/kotlin/com/example/my_desktop_app/main.kt`.
> 3. 해당 파일의 내용을 제공된 예제 코드로 바꿉니다.
>
{style="note" id="desktop-snippets-intro"}

이 페이지의 예제에서는 Kotlin 및 Compose Multiplatform 로고를 사용합니다. 두 로고 모두 [Kotlin Brand Assets](https://kotlinlang.org/docs/kotlin-brand-assets.html#kotlin-logo) 패키지의 일부로 제공됩니다.

## 리소스에서 이미지 표시하기 {id="displaying-images-from-resources"}

애플리케이션과 함께 패키징된 이미지를 표시하려면, 프로젝트의 [멀티플랫폼 리소스에 추가](compose-multiplatform-resources-setup.md)하고 프로젝트를 빌드하여 리소스 접근자(accessor)를 생성합니다. 접근자를 `painterResource()`에 전달하여 `Painter` 인스턴스를 생성한 다음, 생성된 `Painter`를 `Image()` 컴포저블에 전달합니다:

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

<img src="compose-desktop-images-resource.png" alt="멀티플랫폼 리소스의 이미지" width="540"/>

`painterResource()`는 `.png`, `.jpg`, `.bmp`, `.webp`와 같은 래스터화된 이미지 형식뿐만 아니라 Android XML 벡터 드로어블(vector drawable) 형식도 지원합니다. 리소스에 `ImageBitmap` 또는 `ImageVector` 값으로 접근하는 방법과 아이콘, 폰트, 문자열을 사용하는 방법에 대한 자세한 내용은 [앱에서 멀티플랫폼 리소스 사용하기](compose-multiplatform-resources-usage.md)를 참고하세요.

> 리소스를 반드시 common 소스 세트에 저장할 필요는 없습니다. 모든 소스 세트나 모듈은 자체 `composeResources` 디렉터리를 가질 수 있으므로 데스크톱 애플리케이션 전용 이미지를 데스크톱 관련 코드 옆에 저장할 수 있습니다.
> 
> 다른 모듈에 선언된 리소스를 사용하려면 해당 모듈의 생성된 `Res` 클래스를 [public](compose-multiplatform-resources-usage.md#customizing-accessor-class-generation)으로 설정하세요.
>
{style="tip"}

## 파일 시스템 또는 네트워크에서 이미지 로드하기 {id="loading-images-from-the-file-system-or-the-network"}

애플리케이션의 일부가 아닌 이미지(사용자가 선택한 파일이나 런타임에 다운로드한 파일)는 리소스가 아닙니다. 이러한 이미지는 임의의 JVM API를 사용하여 바이트 단위로 읽은 후, 리소스 라이브러리의 다음 함수 중 하나를 사용하여 디코딩합니다:

| 이미지 형식 | 디코딩 함수 | 결과 |
|--------------|--------------------------|---------------|
| 비트맵 (Bitmap) | `decodeToImageBitmap()` | `ImageBitmap` |
| XML 벡터 | `decodeToImageVector()` | `ImageVector` |
| SVG | `decodeToSvgPainter()` | `Painter` |

파일이나 네트워크 응답을 읽는 작업은 호출 스레드를 차단(block)하므로, 항상 UI 스레드 외부에서 이러한 작업을 수행해야 합니다.

다음 예제는 `Dispatchers.IO` 컨텍스트에서 이미지를 로드하고 준비가 되면 이미지를 표시하는 `AsyncImage()` 컴포저블을 선언합니다:

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
                // 콘솔에 출력하는 대신 오류를 로깅하거나
                // 플레이스홀더 이미지를 표시할 수 있습니다.
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

<img src="compose-desktop-images-async.png" alt="파일 시스템 및 네트워크에서 로드된 이미지" width="420"/>

예제의 파일 경로는 애플리케이션의 작업 디렉터리를 기준으로 확인(resolve)됩니다.

> 원격 이미지를 직접 로드하는 대신 [전용 이미지 로딩 라이브러리](compose-multiplatform-resources-usage.md#remote-files)를 사용할 수도 있습니다.
>
{style="tip"}

## 창 아이콘 설정하기 {id="setting-the-window-icon"}

이미지를 창 아이콘으로 사용하려면 `Painter` 인스턴스를 `Window()` 컴포저블의 `icon` 매개변수에 전달합니다:

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

아이콘이 표시되는 위치는 운영체제에 따라 다릅니다:

* Windows 및 Linux에서는 창과 해당 창의 작업 표시줄 항목에 표시되는 아이콘입니다.
* macOS의 경우 애플리케이션 아이콘은 애플리케이션 번들에서 가져옵니다. Dock의 아이콘을 변경하려면 [배포 설정](compose-native-distribution.md#application-icon)에서 설정해야 합니다.

다음 스크린샷은 macOS에서 패키징된 애플리케이션을 보여줍니다. 창에는 `icon` 매개변수로 전달된 것과 동일한 이미지가 표시되고, Dock 아이콘은 배포 설정에 선언된 `.icns` 파일에서 가져옵니다:

<img src="compose-desktop-images-window-icon.png" alt="패키징된 애플리케이션과 해당 Dock 아이콘" width="426"/>

### 단일 창 애플리케이션 아이콘 {id="single-window-application-icon"}

`singleWindowApplication()` 함수는 `painterResource()`를 사용할 수 없는 컴포지션(composition) 외부에서 `icon` 매개변수를 평가합니다. 대신 `composeResources` 디렉터리 내의 파일 경로를 받는 `Res.readBytes()`로 리소스를 읽어 `BitmapPainter`로 디코딩합니다:

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

## 트레이 아이콘 설정하기 {id="setting-the-tray-icon"}

이미지를 [트레이](compose-desktop-tray.md) 아이콘으로 사용하려면 `Painter` 인스턴스를 `Tray()` 컴포저블의 `icon` 매개변수에 전달합니다:

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

macOS에서는 트레이 아이콘이 메뉴 막대에 나타납니다:

<img src="compose-desktop-images-tray-icon.png" alt="macOS 메뉴 막대의 트레이 아이콘" width="430"/>

## 다음 단계 {id="what-s-next"}

* [멀티플랫폼 리소스](compose-multiplatform-resources.md) 및 공통 코드에서 [리소스에 접근하는 방법](compose-multiplatform-resources-usage.md)에 대해 자세히 알아보세요.
* [시스템 트레이](compose-desktop-tray.md)에 애플리케이션 아이콘을 추가하는 방법을 알아보세요.
* 플랫폼별 애플리케이션 아이콘을 사용하여 [네이티브 배포판을 생성](compose-native-distribution.md)하는 방법을 알아보세요.
* [기타 데스크톱 컴포넌트](compose-desktop-components.md)에 대한 튜토리얼을 살펴보세요.