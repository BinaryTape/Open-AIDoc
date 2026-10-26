[//]: # (title: Tab 導覽與鍵盤焦點)
<web-summary>了解如何在桌面版 Compose Multiplatform 中使用 Tab 鍵在組件之間進行導覽。</web-summary>

在桌面版 Compose Multiplatform 中，你可以使用 <shortcut>Tab</shortcut> 鍵盤快速鍵導覽至下一個組件，並使用 <shortcut>Shift+Tab</shortcut> 導覽至上一個組件。

> 本指南中的範例皆為可執行的桌面應用程式。若要嘗試執行：
> 1. 使用 [Kotlin Multiplatform IDE 外掛程式](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)或[線上精靈](https://kmp.jetbrains.com/?android=true&desktop=true&includeTests=false)建立 Compose Multiplatform 專案。
> 2. 開啟桌面端入口點檔案。例如：`desktopApp/src/main/kotlin/com/example/my_desktop_app/main.kt`。
> 3. 將其內容取代為所提供的範例。
>
{style="note" id="desktop-snippets-intro"}

## 預設 Tab 導覽 {id="default-tab-navigation"}

預設情況下，Tab 導覽允許使用者按照可取得焦點組件的出現順序在它們之間移動。此功能預設已啟用，不需要額外的程式碼。

可取得焦點的組件包含在其實作中使用了 `clickable()`、`selectable()`、`toggleable()` 或 `focusable()` 修飾符的任何元素。例如：文字欄位、按鈕、滑桿、導覽項目、具有非 null 回呼的選取控制項，以及 `Card()`、`Surface()` 和 `ListItem()` 的 `onClick` 多載。

以下視窗中，使用者可以使用標準快速鍵在五個文字欄位之間導覽：

```kotlin
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.input.TextFieldLineLimits
import androidx.compose.foundation.text.input.rememberTextFieldState
import androidx.compose.material3.TextField
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.WindowState
import androidx.compose.ui.window.application

fun main() = application {
    Window(
        onCloseRequest = ::exitApplication,
        state = WindowState(size = DpSize(350.dp, 500.dp))
    ) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(
                modifier = Modifier.padding(50.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                repeat(5) {
                    TextField(
                        state = rememberTextFieldState(),
                        lineLimits = TextFieldLineLimits.SingleLine
                    )
                }
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Column() { repeat(5) { TextField(state = rememberTextFieldState()"}

<img src="compose-desktop-tab-navigation-default.animated.gif" alt="預設 Tab 順序" width="450" preview-src="compose-desktop-tab-navigation-default.png"/>

## 自訂可取得焦點的組件 {id="custom-focusable-components"}

若要將預設無法取得焦點的組件納入 Tab 順序中，請套用 `focusable()` 修飾符。

若要在組件取得焦點時變更其外觀，請將 `MutableInteractionSource` 傳遞給 `focusable()` 修飾符，透過 `collectIsFocusedAsState()` 從中讀取焦點狀態，並使用該狀態變更組件的樣式：不同的背景、邊框或任何其他醒目提示。若要讓組件對鍵盤按鍵做出反應，請使用 `onKeyEvent()` 修飾符處理按鍵事件。

以下範例將 `Box()` 可組合項轉換為類似按鈕的組件。當獲得焦點時該 Box 會醒目提示，且按下 <shortcut>Enter</shortcut> 或 <shortcut>Space</shortcut> 會觸發相關操作：

```kotlin
import androidx.compose.foundation.background
import androidx.compose.foundation.focusable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.lerp
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onKeyEvent
import androidx.compose.ui.input.key.type
import androidx.compose.ui.input.pointer.PointerEventType
import androidx.compose.ui.input.pointer.onPointerEvent
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.WindowState
import androidx.compose.ui.window.application

fun main() = application {
    Window(
        onCloseRequest = ::exitApplication,
        state = WindowState(size = DpSize(350.dp, 450.dp))
    ) {
        MaterialTheme(
            colorScheme = MaterialTheme.colorScheme.copy(
                primary = Color(10, 132, 232),
                secondary = Color(150, 232, 150)
            )
        ) {
            var clicks by remember { mutableStateOf(0) }
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    modifier = Modifier.padding(40.dp),
                    verticalArrangement = Arrangement.spacedBy(20.dp)
                ) {
                    Text(text = "Clicks: $clicks")
                    repeat(5) { index ->
                        FocusableBox("Button ${index + 1}", onClick = { clicks++ })
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalComposeUiApi::class)
@Composable
fun FocusableBox(
    text: String = "",
    onClick: () -> Unit = {},
    size: DpSize = DpSize(200.dp, 35.dp)
) {
    var isKeyPressed by remember { mutableStateOf(false) }
    val interactionSource = remember { MutableInteractionSource() }
    val isFocused by interactionSource.collectIsFocusedAsState()
    val backgroundColor = when {
        isFocused && isKeyPressed -> lerp(MaterialTheme.colorScheme.secondary, Color(64, 64, 64), 0.3f)
        isFocused -> MaterialTheme.colorScheme.secondary
        else -> MaterialTheme.colorScheme.primary
    }
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(4.dp))
            .background(backgroundColor)
            .size(size)
            .onPointerEvent(PointerEventType.Press) { onClick() }
            .onKeyEvent {
                if (it.key == Key.Enter || it.key == Key.Spacebar) {
                    when (it.type) {
                        KeyEventType.KeyDown -> isKeyPressed = true
                        KeyEventType.KeyUp -> {
                            isKeyPressed = false
                            onClick()
                        }
                    }
                }
                false
            }
            .focusable(interactionSource = interactionSource),
        contentAlignment = Alignment.Center
    ) {
        Text(text = text, color = Color.White)
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Box(modifier = Modifier.focusable(interactionSource = interactionSource)"}

<img src="compose-desktop-tab-navigation-custom-focusable.animated.gif" alt="自訂可取得焦點的組件" width="450" preview-src="compose-desktop-tab-navigation-custom-focusable.png"/>

## 自訂 Tab 順序 {id="custom-tab-order"}

若要以不同於出現順序的方式移動焦點，請結合兩個修飾符：

* `focusRequester()` 會將 `FocusRequester` 控制代碼附加到可取得焦點的組件上。如果該組件[預設無法取得焦點](#custom-focusable-components)，請在 `focusRequester()` _之後_套用 `focusable()` 修飾符。
* `focusProperties()` 用於設定 Tab 順序中的 `next` 與 `previous` 元素：即按下 <shortcut>Tab</shortcut> 或 <shortcut>Shift+Tab</shortcut> 時會聚焦的帶有 `FocusRequester` 控制代碼的組件。

以下範例為五個文字欄位分別建立 `FocusRequester`，並將預設 Tab 順序反轉：

```kotlin
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.input.TextFieldLineLimits
import androidx.compose.foundation.text.input.rememberTextFieldState
import androidx.compose.material3.TextField
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusProperties
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.WindowState
import androidx.compose.ui.window.application

fun main() = application {
    Window(
        onCloseRequest = ::exitApplication,
        state = WindowState(size = DpSize(350.dp, 500.dp))
    ) {
        val focusRequesters = remember { List(5) { FocusRequester() } }
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(
                modifier = Modifier.padding(50.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                focusRequesters.forEachIndexed { index, focusRequester ->
                    TextField(
                        state = rememberTextFieldState(),
                        lineLimits = TextFieldLineLimits.SingleLine,
                        modifier = Modifier
                            .focusRequester(focusRequester)
                            .focusProperties {
                                // 反轉預設順序：
                                next = focusRequesters[(index - 1 + focusRequesters.size) % focusRequesters.size]
                                previous = focusRequesters[(index + 1) % focusRequesters.size]
                            }
                    )
                }
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Modifier.focusRequester(focusRequester).focusProperties { next ="}

<img src="compose-desktop-tab-navigation-custom-order.animated.gif" alt="自訂 Tab 順序" width="450" preview-src="compose-desktop-tab-navigation-custom-order.png"/>

## 透過程式碼移動焦點 {id="moving-focus-from-code"}

若要在沒有使用者互動的情況下讓組件取得焦點，請使用 `focusRequester()` 修飾符將 `FocusRequester` 附加至可取得焦點的組件，並呼叫 `FocusRequester.requestFocus()`。如果組件[預設無法取得焦點](#custom-focusable-components)，則應在 `focusRequester()` _之後_套用 `focusable()` 修飾符。

在以下範例中，按鈕會將焦點移至文字欄位，然後再移回自身：

```kotlin
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.input.TextFieldLineLimits
import androidx.compose.foundation.text.input.rememberTextFieldState
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.WindowState
import androidx.compose.ui.window.application

fun main() = application {
    Window(
        onCloseRequest = ::exitApplication,
        state = WindowState(size = DpSize(350.dp, 450.dp))
    ) {
        val buttonFocusRequester = remember { FocusRequester() }
        val textFieldFocusRequester = remember { FocusRequester() }
        var isTextFieldFocused by remember { mutableStateOf(false) }
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(
                modifier = Modifier.padding(50.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                Button(
                    onClick = {
                        isTextFieldFocused = !isTextFieldFocused
                        if (isTextFieldFocused) {
                            textFieldFocusRequester.requestFocus()
                        } else {
                            buttonFocusRequester.requestFocus()
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .focusRequester(buttonFocusRequester)
                ) {
                    Text(text = "Focus switcher")
                }
                TextField(
                    state = rememberTextFieldState(),
                    lineLimits = TextFieldLineLimits.SingleLine,
                    modifier = Modifier.focusRequester(textFieldFocusRequester)
                )
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Button(onClick = { textFieldFocusRequester.requestFocus()"}

<img src="compose-desktop-tab-navigation-move-focus-from-code.animated.gif" alt="透過程式碼移動焦點" width="450" preview-src="compose-desktop-tab-navigation-move-focus-from-code.png"/>

### 組件出現時聚焦 {id="focusing-a-component-when-it-appears"}

表單與對話方塊通常會立即聚焦在其第一個輸入欄位，讓使用者無需動用滑鼠即可開始鍵入。在此使用案例中，可以在 `LaunchedEffect(Unit)` 區塊內請求焦點，該區塊會在組件進入組合（composition）後執行一次。

在以下範例中，視窗一開啟就會聚焦在第一個文字欄位：

```kotlin
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.input.TextFieldLineLimits
import androidx.compose.foundation.text.input.rememberTextFieldState
import androidx.compose.material3.TextField
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.WindowState
import androidx.compose.ui.window.application

fun main() = application {
    Window(
        onCloseRequest = ::exitApplication,
        state = WindowState(size = DpSize(350.dp, 300.dp))
    ) {
        val focusRequester = remember { FocusRequester() }
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(
                modifier = Modifier.padding(50.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                TextField(
                    state = rememberTextFieldState(),
                    lineLimits = TextFieldLineLimits.SingleLine,
                    modifier = Modifier.focusRequester(focusRequester)
                )
                TextField(
                    state = rememberTextFieldState(),
                    lineLimits = TextFieldLineLimits.SingleLine
                )
            }
        }
        LaunchedEffect(Unit) {
            focusRequester.requestFocus()
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="LaunchedEffect(Unit) { focusRequester.requestFocus()"}

<img src="compose-desktop-tab-navigation-focus-on-appearance.animated.gif" alt="組件出現時聚焦文字欄位" width="450" preview-src="compose-desktop-tab-navigation-focus-on-appearance.png"/>

## 從多行文字欄位移動焦點 {id="moving-focus-from-multiline-text-fields"}

在多行文字欄位中，按下 <shortcut>Tab</shortcut> 會插入定位字元，而不是將焦點移至下一個組件：

```kotlin
Column {
    repeat(5) {
        TextField(
            state = rememberTextFieldState("Hello, World!"),
            // MultiLine is the default value of lineLimits
            lineLimits = TextFieldLineLimits.MultiLine(),
            modifier = Modifier.padding(8.dp)
        )
    }
}
```

這是一個已知的問題：[CMP-5822](https://youtrack.jetbrains.com/issue/CMP-5822)。它會影響任何接受多行的文字欄位（這也是預設行為）。作為因應措施，可以使用 `onPreviewKeyEvent` 修飾符攔截 <shortcut>Tab</shortcut> 鍵，並使用 `LocalFocusManager` 中的 `FocusManager` 來移動焦點：

```kotlin
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.input.TextFieldLineLimits
import androidx.compose.foundation.text.input.rememberTextFieldState
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.isShiftPressed
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onPreviewKeyEvent
import androidx.compose.ui.input.key.type
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.singleWindowApplication

fun main() = singleWindowApplication(title = "Multiline text fields") {
    Column {
        repeat(5) {
            TextField(
                state = rememberTextFieldState("Hello, World!"),
                lineLimits = TextFieldLineLimits.MultiLine(),
                modifier = Modifier.padding(8.dp).moveFocusOnTab()
            )
        }
    }
}

@Composable
fun Modifier.moveFocusOnTab(): Modifier {
    val focusManager = LocalFocusManager.current
    return onPreviewKeyEvent {
        if (it.type == KeyEventType.KeyDown && it.key == Key.Tab) {
            focusManager.moveFocus(
                if (it.isShiftPressed) FocusDirection.Previous else FocusDirection.Next
            )
            true
        } else {
            false
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="fun Modifier.moveFocusOnTab() { focusManager.moveFocus("}

## 後續步驟 {id="what-s-next"}

* 進一步了解處理[鍵盤事件](compose-desktop-keyboard.md)。
* 了解[不同平台上的協助工具支援](compose-desktop-accessibility.md)。
* 探索關於[其他桌面組件](compose-desktop-components.md)的教學。