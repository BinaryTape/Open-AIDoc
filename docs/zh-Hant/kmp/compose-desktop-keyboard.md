[//]: # (title: 鍵盤事件)

在適用於桌面的 Compose Multiplatform 中，你可以透過在兩種不同的作用域中設定事件處理常式來管理鍵盤事件：

* 基於焦點元素的事件處理常式。
* 視窗作用域中的事件處理常式。

> 本指南中的範例皆為可執行的桌面應用程式。若要嘗試其中一個範例：
> 1. 使用 [Kotlin Multiplatform IDE 外掛程式](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)或[線上精靈](https://kmp.jetbrains.com/?android=true&desktop=true&includeTests=false)建立 Compose Multiplatform 專案。
> 2. 開啟桌面入口點檔案。例如：`desktopApp/src/main/kotlin/com/example/my_desktop_app/main.kt`。
> 3. 將其內容取代為所提供的範例。
>
{style="note" id="desktop-snippets-intro"}

## 焦點組建中的事件 {id="events-in-a-focused-component"}

這種方法意味著按下鍵盤上的按鍵會觸發目前處於焦點之組建的事件處理常式。

典型的案例是為 `TextField` 等活動控制項定義鍵盤處理常式。若要在按鍵事件觸發預設操作之前攔截該事件，你可以同時使用 `onKeyEvent` 與 `onPreviewKeyEvent` 修飾詞。使用 `onKeyEvent` 修飾詞可以處理單次按鍵，而 `onPreviewKeyEvent` 則更適合用於定義快速鍵。

以下範例示範了 `TextField` 的互動，根據按住 <shortcut>Ctrl</shortcut> 時所按下的按鍵來執行不同的操作。請將此程式碼新增至 `sharedUI/src/jvmMain/kotlin` 中的 `main.kt` 檔案：

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

## 視窗作用域中的事件 {id="events-in-a-window-scope"}

若要定義在當前視窗中始終處於活動狀態的鍵盤事件處理常式，可以使用 `Window`、`singleWindowApplication` 和 `Dialog` 函式所提供的 `onPreviewKeyEvent` 與 `onKeyEvent` 參數。它們的差異在於事件未被取用（consumed）時的調度方式：`onPreviewKeyEvent` 會將事件分派給其第一個子項，而 `onKeyEvent` 則會將事件分派給 composable 的父項。通常，`onPreviewKeyEvent` 是攔截事件的偏好選擇，因為它甚至可以實作全螢幕範圍的鍵盤快速鍵。

以下範例示範了視窗互動，例如透過按下 `Escape` 關閉彈出式對話方塊，以及透過按下 <shortcut>Ctrl+Shift+C</shortcut> 快速鍵來變更視窗內容。請將此程式碼新增至 `sharedUI/src/jvmMain/kotlin` 中的 `main.kt` 檔案：

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

## 後續步驟 {id="what-s-next"}

* 請參閱 [API 參考](https://developer.android.com/reference/kotlin/androidx/compose/ui/input/key/package-summary#keyinputfilter)以獲取詳細資訊。
* 探索有關[其他桌面組建](https://github.com/JetBrains/compose-multiplatform/tree/master/tutorials#desktop)的教學。