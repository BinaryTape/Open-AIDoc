[//]: # (title: 키보드 이벤트)

데스크톱용 Compose Multiplatform에서는 두 가지 서로 다른 스코프에서 이벤트 핸들러를 설정하여 키보드 이벤트를 관리할 수 있습니다.

* 포커스된 요소를 기반으로 하는 이벤트 핸들러
* 윈도우 스코프의 이벤트 핸들러

> 이 가이드의 예제는 실행 가능한 데스크톱 앱입니다. 직접 실행해 보려면 다음 단계를 따르세요.
> 1. [Kotlin Multiplatform IDE 플러그인](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform) 또는 [온라인 마법사](https://kmp.jetbrains.com/?android=true&desktop=true&includeTests=false)를 사용하여 Compose Multiplatform 프로젝트를 생성합니다.
> 2. 데스크톱 진입점 파일(예: `desktopApp/src/main/kotlin/com/example/my_desktop_app/main.kt`)을 엽니다.
> 3. 해당 파일의 내용을 제공된 예제 코드로 바꿉니다.
>
{style="note" id="desktop-snippets-intro"}

## 포커스된 컴포넌트에서의 이벤트 {id="events-in-a-focused-component"}

이 방식은 키보드의 키를 누르면 현재 포커스된 컴포넌트의 이벤트 핸들러가 트리거됨을 의미합니다.

일반적인 시나리오는 `TextField`와 같은 활성 컨트롤에 대한 키보드 핸들러를 정의하는 것입니다. 키 이벤트가 기본 동작을 트리거하기 전에 가로채려면 `onKeyEvent` 및 `onPreviewKeyEvent` 수정자(modifier)를 모두 사용할 수 있습니다.
`onKeyEvent` 수정자로는 개별 키 입력을 처리할 수 있으며, 단축키를 정의할 때는 `onPreviewKeyEvent`를 사용하는 것이 좋습니다.

다음 예제는 <shortcut>Ctrl</shortcut> 키를 누른 상태에서 누르는 키에 따라 서로 다른 동작을 수행하는 `TextField` 상호작용을 보여줍니다.
이 코드를 `sharedUI/src/jvmMain/kotlin`에 있는 `main.kt` 파일에 추가하세요.

```kotlin
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.material.TextField
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.isCtrlPressed
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onPreviewKeyEvent
import androidx.compose.ui.input.key.type
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.window.singleWindowApplication

fun main() = singleWindowApplication (title = "Key events") {
    MaterialTheme {
        var consumedText by remember { mutableStateOf(0) }
        var text by remember { mutableStateOf("") }
        Column(Modifier.fillMaxSize(), Arrangement.spacedBy(5.dp)) {
            Text("Consumed text: $consumedText")
            TextField(
                value = text,
                onValueChange = { text = it },
                modifier = Modifier.onPreviewKeyEvent {
                    when {
                        (it.isCtrlPressed && it.key == Key.Minus && it.type == KeyEventType.KeyUp) -> {
                            consumedText -= text.length
                            text = ""
                            true
                        }
                        (it.isCtrlPressed && it.key == Key.Equals && it.type == KeyEventType.KeyUp) -> {
                            consumedText += text.length
                            text = ""
                            true
                        }
                        else -> false
                    }
                }
            )
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="modifier = Modifier.onPreviewKeyEvent { when"}

<img src="compose-desktop-key-focus.animated.gif" alt="Keyboard events in a focused component" width="600" preview-src="compose-desktop-key-focus.png"/>

## 윈도우 스코프에서의 이벤트 {id="events-in-a-window-scope"}

현재 윈도우 내에서 항상 활성화되는 키보드 이벤트 핸들러를 정의하려면 `Window`, `singleWindowApplication` 및 `Dialog` 함수에서 제공하는 `onPreviewKeyEvent` 및 `onKeyEvent` 매개변수를 사용하세요.
두 매개변수는 이벤트가 소비(consume)되지 않았을 때 전달(dispatch)되는 방식에서 차이가 있습니다. `onPreviewKeyEvent`는 이벤트를 첫 번째 자식으로 전달하고, `onKeyEvent`는 컴포저블의 부모로 이벤트를 전달합니다. 일반적으로 화면 전체 수준의 키보드 단축키까지 구현할 수 있는 `onPreviewKeyEvent`가 이벤트를 가로채는 데 더 선호됩니다.

다음 예제는 `Escape` 키를 눌러 팝업 대화상자를 닫거나, <shortcut>Ctrl+Shift+C</shortcut> 단축키를 눌러 윈도우 콘텐츠를 변경하는 등의 윈도우 상호작용을 보여줍니다.
이 코드를 `sharedUI/src/jvmMain/kotlin`에 있는 `main.kt` 파일에 추가하세요.

```kotlin
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.Button
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.isCtrlPressed
import androidx.compose.ui.input.key.isShiftPressed
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.type
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.DialogWindow
import androidx.compose.ui.window.singleWindowApplication

private var cleared by mutableStateOf(false)

fun main() = singleWindowApplication(
    title = "Keyboard events",
    onKeyEvent = {
        if (
            it.isCtrlPressed &&
            it.isShiftPressed &&
            it.key == Key.C &&
            it.type == KeyEventType.KeyDown
        ) {
            cleared = true
            true
        } else {
            false
        }
    }
) {
    MaterialTheme {
        if (cleared) {
            Text("The App was cleared!")
        } else {
            App()
        }
    }
}

@Composable
fun App() {
    var isDialogOpen by remember { mutableStateOf(false) }

    if (isDialogOpen) {
        DialogWindow(onCloseRequest = { isDialogOpen = false },
            title = "Dialog",
            onPreviewKeyEvent = {
                if (it.key == Key.Escape && it.type == KeyEventType.KeyDown) {
                    isDialogOpen = false
                    true
                } else {
                    false
                }
            }) {
            Text("Hello!")
        }
    }

    Column(Modifier.fillMaxSize(), Arrangement.spacedBy(5.dp)) {
        Button(
            modifier = Modifier.padding(4.dp),
            onClick = { isDialogOpen = true }
        ) {
            Text("Open dialog")
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="if (it.isCtrlPressed && it.isShiftPressed && it.key == Key.C && "}

<img src="compose-desktop-key-window.animated.gif" alt="Keyboard events in a window scope" width="600" preview-src="compose-desktop-key-window.png"/>

## 다음 단계 {id="what-s-next"}

* 자세한 내용은 [API 레퍼런스](https://developer.android.com/reference/kotlin/androidx/compose/ui/input/key/package-summary#keyinputfilter)를 참조하세요.
* [기타 데스크톱 컴포넌트](https://github.com/JetBrains/compose-multiplatform/tree/master/tutorials#desktop)에 대한 튜토리얼을 살펴보세요.