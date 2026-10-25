[//]: # (title: 頂層視窗管理)

<web-summary>了解如何在 Compose Multiplatform 桌面版中管理頂層視窗：建立與自訂視窗、隱藏至系統匣，以及使用對話方塊。</web-summary>

Compose Multiplatform 桌面版提供了多種管理視窗的功能。你可以將視窗隱藏至系統匣、設定為可拖曳、隨內容調整大小、變更位置等。

另請參閱全新的實驗性 [視窗與對話方塊 API v2](#window-and-dialog-api-v2)。

> 本指南中的範例皆為可執行的桌面應用程式。若要嘗試執行：
> 1. 使用 [Kotlin Multiplatform IDE 外掛程式](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform) 或 [線上精靈](https://kmp.jetbrains.com/?android=true&desktop=true&includeTests=false) 建立 Compose Multiplatform 專案。
> 2. 開啟桌面版入口點檔案。例如 `desktopApp/src/main/kotlin/com/example/my_desktop_app/main.kt`。
> 3. 將其內容替換為提供的範例。
>
{style="note" id="desktop-snippets-intro"}

## 開啟與關閉視窗 {id="open-and-close-windows"}

你可以使用 `Window()` 函式來建立標準視窗。若要將其放置於可組合作用域中，請在 `application` 入口點內使用 `Window()`：

```kotlin
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application

fun main() = application {
    Window(onCloseRequest = ::exitApplication) {
        // 視窗內容
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="application { Window(onCloseRequest = ::exitApplication)"}

作為一個可組合函式，`Window()` 允許你以宣告式的方式變更其屬性。例如，你可以在開啟視窗時設定某個標題，稍後再變更該標題：

```kotlin
import androidx.compose.material.Button
import androidx.compose.material.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application

fun main() = application {
    var fileName by remember { mutableStateOf("Untitled") }

    Window(onCloseRequest = ::exitApplication, title = "$fileName - Editor") {
        Button(onClick = { fileName = "note.txt" }) {
            Text("Save")
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Window(onCloseRequest = ::exitApplication, title = "}

<img src="compose-window-properties.animated.gif" alt="視窗屬性：變更標題" preview-src="compose-window-properties.png" width="600"/>

### 新增條件 {id="add-conditions"}

你也可以使用簡單的 `if` 條件來開啟和關閉視窗。在以下程式碼範例中，應用程式視窗會在工作完成後自動關閉：

```kotlin
import androidx.compose.material.Text
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application
import kotlinx.coroutines.delay

fun main() = application {
    var isPerformingTask by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        // 執行耗時的工作
        delay(2000) 
        isPerformingTask = false
    }
    if (isPerformingTask) {
        Window(
            onCloseRequest = ::exitApplication,
            title = "Window 1"
        )
        {
            Text("Performing some tasks. Please wait!")
        }
    } else {
        Window(
            onCloseRequest = ::exitApplication,
            title = "Window 2"
        ) {
            Text("Hello, World!")
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="if (isPerformingTask) { Window(onCloseRequest = ::exitApplication,"}

<img src="compose-window-condition.animated.gif" alt="帶條件的視窗" preview-src="compose-window-condition.png" width="600"/>

### 關閉時請求確認 {id="ask-for-confirmation-on-close"}

如果你希望在應用程式結束時使用自訂邏輯（例如顯示對話方塊），可以使用 `onCloseRequest` 回呼來覆寫關閉動作。
在以下程式碼範例中，我們不採用命令式作法（`window.close()`），而是使用宣告式作法，透過回應狀態變更（`isOpen = false`）來關閉視窗。

```kotlin
import androidx.compose.material.Button
import androidx.compose.material.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.window.DialogWindow
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application

fun main() = application {
    var isOpen by remember { mutableStateOf(true) }
    var isAskingToClose by remember { mutableStateOf(false) }

    if (isOpen) {
        Window(
            onCloseRequest = { isAskingToClose = true },
            title = "Important document"
        ) {
            if (isAskingToClose) {
                DialogWindow(
                    onCloseRequest = { isAskingToClose = false },
                    title = "Close without saving?"
                ) {
                    Button(
                        onClick = { isOpen = false }
                    ) {
                        Text("Yes")
                    }
                }
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Window(onCloseRequest = { isAskingToClose = true }"}

<img src="compose-window-ask-to-close.animated.gif" alt="關閉時確認" preview-src="compose-window-ask-to-close.png" width="600"/>

## 建立單一視窗應用程式 {id="create-a-single-window-application"}

對於僅有一個頂層視窗的簡單應用程式，不需要使用完整的 `application` 入口點搭配 `Window()` 可組合項——`singleWindowApplication()` 函式將兩者包裝在單一呼叫中：

```kotlin
import androidx.compose.ui.window.singleWindowApplication

fun main() = singleWindowApplication {
    // 視窗內容
}
```

若要使用多個頂層視窗、自訂關閉邏輯，或在執行時期變更視窗屬性，請在 `application` 入口點中使用 [`Window()` 可組合項](#open-and-close-windows)。

## 管理視窗狀態 {id="manage-window-state"}

`WindowState` 類別保存了視窗的放置方式（placement）、目前位置以及大小。
placement 屬性允許你指定視窗在螢幕上的放置方式：浮動（floating）、最大化/最小化（maximized/minimized）或全螢幕（fullscreen）。
狀態的任何變更都會觸發自動重組。若要變更視窗狀態，可以使用回呼或在可組合函式中觀察它：

```kotlin
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.material.Checkbox
import androidx.compose.material.Text
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.WindowPlacement
import androidx.compose.ui.window.WindowPosition
import androidx.compose.ui.window.application
import androidx.compose.ui.window.rememberWindowState

fun main() = application {
    val state = rememberWindowState(placement = WindowPlacement.Maximized)

    Window(onCloseRequest = ::exitApplication, state, title = "Window state") {
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Checkbox(
                    state.placement == WindowPlacement.Fullscreen,
                    {
                        state.placement = if (it) {
                            WindowPlacement.Fullscreen
                        } else {
                            WindowPlacement.Floating
                        }
                    }
                )
                Text("isFullscreen")
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                Checkbox(
                    state.placement == WindowPlacement.Maximized,
                    {
                        state.placement = if (it) {
                            WindowPlacement.Maximized
                        } else {
                            WindowPlacement.Floating
                        }
                    }
                )
                Text("isMaximized")
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                Checkbox(state.isMinimized, { state.isMinimized = !state.isMinimized })
                Text("isMinimized")
            }

            Text(
                "Position ${state.position}",
                Modifier.clickable {
                    val position = state.position
                    if (position is WindowPosition.Absolute) {
                        state.position = position.copy(x = state.position.x + 10.dp)
                    }
                }
            )

            Text(
                "Size ${state.size}",
                Modifier.clickable {
                    state.size = state.size.copy(width = state.size.width + 10.dp)
                }
            )
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="val state = rememberWindowState(placement = WindowPlacement.Maximized)"}

<img src="compose-window-minimize.animated.gif" alt="變更狀態" preview-src="compose-window-minimize.png" width="600"/>

### 讓視窗大小配合其內容 {id="adapt-window-size-to-its-content"}

若要根據內容調整視窗大小而無需事先提供尺寸，可將視窗的一個或兩個維度設定為 `Dp.Unspecified`。Compose Multiplatform 會自動調整初始視窗大小以容納你的內容：

```kotlin
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.Text
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application
import androidx.compose.ui.window.rememberWindowState

fun main() = application {
    Window(
        onCloseRequest = ::exitApplication,
        state = rememberWindowState(width = Dp.Unspecified, height = Dp.Unspecified),
        title = "Adaptive size",
        resizable = false
    ) {
        Column(Modifier.background(Color(0xFFEEEEEE))) {
            Row {
                Text("label 1", Modifier.size(100.dp, 100.dp).padding(10.dp).background(Color.White))
                Text("label 2", Modifier.size(150.dp, 200.dp).padding(5.dp).background(Color.White))
                Text("label 3", Modifier.size(200.dp, 300.dp).padding(25.dp).background(Color.White))
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="state = rememberWindowState(width = Dp.Unspecified, height = Dp.Unspecified)"}

<img src="compose-window-adaptive-size.png" alt="自動調整視窗大小" width="451"/>

### 監聽狀態變更 {id="listen-to-state-changes"}

若要回應狀態變更並將值傳送至應用程式的非可組合部分（例如寫入資料庫），可以使用 `snapshotFlow()` 函式。此函式會擷取可組合狀態的目前值。

```kotlin
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.WindowPosition
import androidx.compose.ui.window.application
import androidx.compose.ui.window.rememberWindowState
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach

fun main() = application {
    val state = rememberWindowState()

    Window(onCloseRequest = ::exitApplication, state) {
        LaunchedEffect(state) {
            snapshotFlow { state.size }
                .onEach(::onWindowResize)
                .launchIn(this)

            snapshotFlow { state.position }
                .filter { it.isSpecified }
                .onEach(::onWindowRelocate)
                .launchIn(this)
        }
    }
}

private fun onWindowResize(size: DpSize) {
    println("onWindowResize $size")
}

private fun onWindowRelocate(position: WindowPosition) {
    println("onWindowRelocate $position")
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="LaunchedEffect(state) { snapshotFlow { state.size } .onEach(::onWindowResize)"}

## 管理多重視窗 {id="manage-multiple-windows"}

若要管理多個視窗，可以為應用程式狀態建立一個獨立類別，並根據 `mutableStateListOf` 的變更來開啟或關閉視窗：

```kotlin
import androidx.compose.runtime.Composable
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.remember
import androidx.compose.ui.window.MenuBar
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application

fun main() = application {
    val applicationState = remember { MyApplicationState() }

    for (window in applicationState.windows) {
        key(window) {
            MyWindow(window)
        }
    }
}

@Composable
private fun MyWindow(
    state: MyWindowState
) = Window(onCloseRequest = state::close, title = state.title) {
    MenuBar {
        Menu("File") {
            Item("New window", onClick = state.openNewWindow)
            Item("Exit", onClick = state.exit)
        }
    }
}

private class MyApplicationState {
    val windows = mutableStateListOf<MyWindowState>()

    init {
        windows += MyWindowState("Initial window")
    }

    fun openNewWindow() {
        windows += MyWindowState("Window ${windows.size}")
    }

    fun exit() {
        windows.clear()
    }

    private fun MyWindowState(
        title: String
    ) = MyWindowState(
        title,
        openNewWindow = ::openNewWindow,
        exit = ::exit,
        windows::remove
    )
}

private class MyWindowState(
    val title: String,
    val openNewWindow: () -> Unit,
    val exit: () -> Unit,
    private val close: (MyWindowState) -> Unit
) {
    fun close() = close(this)
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="MyApplicationState { val windows = mutableStateListOf<MyWindowState>()"}

<img src="compose-multiple-windows.animated.gif" alt="多重視窗" preview-src="compose-multiple-windows.png" width="600"/>

若需更複雜的範例，請參閱 [Code Viewer](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/codeviewer) 範例專案。

## 顯示對話方塊 {id="show-dialogs"}

你可以使用 `DialogWindow()` 可組合項來顯示一個具有獨立標題列的作業系統層級視窗。這對於確認對話方塊、檔案選擇器，或使用者在繼續之前必須完成的任何互動非常有用。

你可以使用實驗性的 `modalityType` 參數來控制對話方塊是否會阻擋與其他視窗的互動。將其設定為以下 `DialogModalityType` 值之一：

* `Modeless`：不會阻擋任何其他視窗。
* `DocumentModal`：阻擋父頂層視窗及附加在其上的任何其他視窗，但對話方塊本身的衍生視窗除外。
* `ApplicationModal`：阻擋同一應用程式中的所有其他視窗。

> 若要使用保留在目前視窗內的浮層 UI（下拉式功能表、工具提示以及自訂浮層），請使用多平台 [`Popup()`](compose-popups.md) 可組合項。
>
{style="tip"}

以下程式碼範例結合了標準視窗與 `ApplicationModal` 對話方塊：

```kotlin
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.Button
import androidx.compose.material.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.window.DialogWindow
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.WindowPosition
import androidx.compose.ui.window.application
import androidx.compose.ui.window.rememberDialogState
import androidx.compose.ui.window.DialogModalityType
import androidx.compose.ui.ExperimentalComposeUiApi

// 啟用實驗性的 modalityType
@OptIn(ExperimentalComposeUiApi::class)
fun main() = application {
    Window(
        onCloseRequest = ::exitApplication,
        title = "Main window"
    ) {
        var isDialogOpen by remember { mutableStateOf(false) }

        Button(onClick = { isDialogOpen = true }) {
            Text(text = "Open dialog")
        }

        if (isDialogOpen) {
            DialogWindow(
                onCloseRequest = { isDialogOpen = false },
                state = rememberDialogState(position = WindowPosition(Alignment.Center)),
                title = "Dialog",
                modalityType = DialogModalityType.ApplicationModal
            ) {
                Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                    Text("This is a dialog")
                }
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="if (isDialogOpen) { DialogWindow( ... ) }"}

## 將視窗隱藏至系統匣 {id="hide-windows-to-the-system-tray"}

預設情況下，關閉視窗會結束應用程式。若要改為將視窗隱藏至系統匣或選單列，可以攔截 `onCloseRequest` 來變更視窗的可見性狀態。

在以下範例中，關閉視窗會將 `isVisible` 設定為 `false`，進而隱藏視窗並顯示系統匣圖示。點擊系統匣圖示則會還原視窗。

```kotlin
import androidx.compose.material.Text
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.window.Tray
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application
import kotlinx.coroutines.delay

fun main() = application {
    var isVisible by remember { mutableStateOf(true) }

    Window(
        // 隱藏視窗而不是結束應用程式
        onCloseRequest = { isVisible = false },
        visible = isVisible,
        title = "Counter",
    ) {
        var counter by remember { mutableStateOf(0) }
        LaunchedEffect(Unit) {
            while (true) {
                counter++
                delay(1000)
            }
        }
        Text(counter.toString())
    }

    if (!isVisible) {
        Tray(
            TrayIcon,
            tooltip = "Counter",
            onAction = { isVisible = true },
            menu = {
                Item("Exit", onClick = ::exitApplication)
            },
        )
    }
}

object TrayIcon : Painter() {
    override val intrinsicSize = Size(256f, 256f)

    override fun DrawScope.onDraw() {
        drawOval(Color(0xFFFFA500))
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Window(onCloseRequest = { isVisible = false },"}

<img src="compose-window-hide-tray.animated.gif" alt="隱藏而不是關閉" preview-src="compose-window-hide-tray.png" width="600"/>

## 讓視窗區域可拖曳 {id="make-window-areas-draggable"}

若要在無邊框（undecorated）視窗中加入自訂的可拖曳標題列，或讓整個視窗皆可拖曳，可以使用 `WindowDraggableArea()` 可組合項：

```kotlin
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.window.WindowDraggableArea
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application

fun main() = application {
    Window(onCloseRequest = ::exitApplication, undecorated = true) {
        WindowDraggableArea {
            Box(Modifier.fillMaxWidth().height(48.dp).background(Color.DarkGray))
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="WindowDraggableArea { Box(Modifier.fillMaxWidth().height(48.dp).background(Color.DarkGray))}"}

`WindowDraggableArea()` 僅能在 `singleWindowApplication()`、`Window()` 和 `DialogWindow()` 可組合項內使用。若要在其他可組合函式中呼叫它，請使用 `WindowScope` 作為接收者作用域：

```kotlin
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.window.WindowDraggableArea
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.WindowScope
import androidx.compose.ui.window.application

fun main() = application {
    Window(onCloseRequest = ::exitApplication, undecorated = true) {
        AppWindowTitleBar()
    }
}

@Composable
private fun WindowScope.AppWindowTitleBar() = WindowDraggableArea {
    Box(Modifier.fillMaxWidth().height(48.dp).background(Color.DarkGray))
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="private fun WindowScope.AppWindowTitleBar() = WindowDraggableArea {"}

<img src="compose-window-draggable-area.animated.gif" alt="可拖曳區域" preview-src="compose-window-draggable-area.png" width="600"/>

## 建立透明視窗 {id="create-transparent-windows"}

若要建立透明視窗，請將兩個參數傳遞給 `Window()` 函式：`transparent=true` 與 `undecorated=true`。視窗必須是無邊框的（undecorated），因為透明視窗無法使用裝飾邊框。

以下程式碼範例示範如何結合可組合項來建立具有圓角的透明視窗：

```kotlin
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.Surface
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application
import androidx.compose.material.Text
import androidx.compose.runtime.*

fun main() = application {
    var isOpen by remember { mutableStateOf(true) }
    if (isOpen) {
        Window(
            onCloseRequest = { isOpen = false },
            title = "Transparent Window Example",
            transparent = true, 
            // 透明視窗必須為無邊框
            undecorated = true, 
        ) {
            Surface(
                modifier = Modifier.fillMaxSize().padding(5.dp).shadow(3.dp, RoundedCornerShape(20.dp)), 
                color = Color.Transparent,
                // 具有圓角的視窗
                shape = RoundedCornerShape(20.dp) 
            ) {
                Text("Hello World!", color = Color.White)
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Modifier.fillMaxSize().padding(5.dp).shadow(3.dp, RoundedCornerShape(20.dp))"}

## 使用 Swing 元件 {id="use-swing-components"}

Compose Multiplatform 桌面版在底層使用了 Swing，因此你也可以直接使用 Swing 建立視窗：

```kotlin
import androidx.compose.ui.awt.ComposeWindow
import java.awt.Dimension
import javax.swing.JFrame
import javax.swing.SwingUtilities

fun main() = SwingUtilities.invokeLater {
    ComposeWindow().apply {
        size = Dimension(300, 300)
        defaultCloseOperation = JFrame.DISPOSE_ON_CLOSE
        setContent {
            // 視窗內容
        }
        isVisible = true
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="SwingUtilities.invokeLater { ComposeWindow().apply {"}

你也可以使用 `Window()` 可組合項的作用域。在以下程式碼範例中，`window` 是在 `Window()` 內部建立的 `ComposeWindow`：

```kotlin
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.window.singleWindowApplication
import java.awt.datatransfer.DataFlavor
import java.awt.dnd.DnDConstants
import java.awt.dnd.DropTarget
import java.awt.dnd.DropTargetAdapter
import java.awt.dnd.DropTargetDropEvent

fun main() = singleWindowApplication {
    LaunchedEffect(Unit) {
        window.dropTarget = DropTarget().apply {
            addDropTargetListener(object : DropTargetAdapter() {
                override fun drop(event: DropTargetDropEvent) {
                    event.acceptDrop(DnDConstants.ACTION_COPY)
                    val fileName = event.transferable.getTransferData(DataFlavor.javaFileListFlavor)
                    println(fileName)
                }
            })
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="LaunchedEffect(Unit) { window.dropTarget = DropTarget().apply"}

如果你需要使用 Swing 實作的對話方塊，可以將其包裝為可組合函式：

```kotlin
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.window.AwtWindow
import androidx.compose.ui.window.application
import java.awt.FileDialog
import java.awt.Frame

fun main() = application {
    var isOpen by remember { mutableStateOf(true) }

    if (isOpen) {
        FileDialog(
            onCloseRequest = {
                isOpen = false
                println("Result $it")
            }
        )
    }
}

@Composable
private fun FileDialog(
    parent: Frame? = null,
    onCloseRequest: (result: String?) -> Unit
) = AwtWindow(
    create = {
        object : FileDialog(parent, "Choose a file", LOAD) {
            override fun setVisible(value: Boolean) {
                super.setVisible(value)
                if (value) {
                    onCloseRequest(file)
                }
            }
        }
    },
    dispose = FileDialog::dispose
)
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="@Composable private fun FileDialog( parent: Frame? = null, "}

## 視窗與對話方塊 API v2 {id="window-and-dialog-api-v2"}
<primary-label ref="Experimental"/>

從 Compose Multiplatform 1.12.0 開始，重新設計的 `WindowState` 與 `DialogState` 類別已在 `androidx.compose.ui.window.v2` 子套件中提供。

v2 版本的視窗與對話方塊 API 將「請求狀態」與「觀察視窗管理器實際套用的狀態」劃分開來。它還支援了以往無法實現的場景，例如：讓視窗配合內容的慣用大小，同時在視窗變大時仍允許內容展開（透過如 `fillMaxSize()` 等修飾符）。詳情請參閱[指定大小](#specify-size)。

v2 API 與本頁其餘部分介紹的現有 API 並存，因此你可以依照自己的步調遷移個別視窗。

### 指定與觀察狀態 {id="specify-and-observe-state"}

v2 API 明確區隔了指定預期狀態與觀察實際狀態。

若要指定視窗的初始狀態，請將提供者（provider）傳遞給 `rememberWindowState()`：

```kotlin
import androidx.compose.material.Text
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.application
import androidx.compose.ui.window.v2.Window
import androidx.compose.ui.window.v2.WindowBoundsProvider
import androidx.compose.ui.window.v2.WindowPositionProvider
import androidx.compose.ui.window.v2.WindowSizeProvider
import androidx.compose.ui.window.v2.rememberWindowState

@OptIn(ExperimentalComposeUiApi::class)
fun main() = application {
    val windowState = rememberWindowState(
        initialBoundsProvider = WindowBoundsProvider(
            positionProvider = WindowPositionProvider.CenteredOnScreen,
            sizeProvider = WindowSizeProvider.Fixed(DpSize(400.dp, 200.dp))
        )
    )

    Window(
        onCloseRequest = ::exitApplication,
        state = windowState,
    ) {
        Text("Hello, World!", fontSize = 48.sp)
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="val windowState = rememberWindowState(initialBoundsProvider = WindowBoundsProvider("}

若要在視窗建立後請求變更狀態，請呼叫 `WindowState` 上的對應方法。你可以直接指定確切的大小與位置：

```kotlin
windowState.requestScreen { defaultScreen }
windowState.requestSize(DpSize(1024.dp, 768.dp))
windowState.requestPosition(DpOffset(100.dp, 100.dp))
```

若要進行相對定位或動態計算尺寸，請使用提供者：

```kotlin
windowState.requestBounds(
    WindowBoundsProvider(
        positionProvider = WindowPositionProvider.CenteredOnScreen,
        sizeProvider = WindowSizeProvider.Fixed(DpSize(1024.dp, 768.dp))
    )
)
```

套用請求是非同步的。視窗系統可能會調整請求的狀態，而且實際狀態隨後也可能會改變（例如當你移動視窗或調整其大小時）。可透過 `WindowState.screenId` 和 `WindowState.bounds` 觀察視窗的實際狀態：

```kotlin
if (windowState.isInitialized) {
    Text("Current screen: ${windowState.screenId}")
    Text("Current bounds: ${windowState.bounds}")
}
```

相同的非同步模型也透過 `DialogState` 和 `rememberDialogState()` 提供給對話方塊使用。

### 選擇螢幕 {id="choose-a-screen"}

你可以透過傳遞 `initialScreenProvider` 給 `rememberWindowState()`，或稍後呼叫 `WindowState.requestScreen()`，來請求視窗應顯示在哪個螢幕上。視窗實際放置的螢幕可透過 `WindowState.screenId` 進行觀察。

例如，你可以請求將視窗放置在可用寬度至少為 `1024.dp` 的螢幕上，若無則回退（fallback）至預設螢幕：

```kotlin
windowState.requestScreen {
    screens.firstOrNull { it.availableBounds.width >= 1024.dp }
        ?: defaultScreen
}
```

### 指定位置 {id="specify-position"}

若要變更視窗位置，可以傳遞 `initialBoundsProvider` 給 `rememberWindowState()`，或稍後呼叫 `WindowState.requestBounds()`。視窗的實際邊界可透過 `WindowState.bounds` 進行觀察。

v2 API 使用 `WindowPositionProvider` 來取得螢幕與父視窗幾何形狀的資訊。

對於標準放置方式，你可以使用內建屬性：

* `Default` 套用作業系統的標準重疊顯示（cascading）行為。
* `Current` 維持視窗的目前位置。
* `CenteredOnScreen` 將視窗居中顯示於螢幕中。
* `CenteredInParentWindow` 將視窗居中顯示於其父視窗中。

若需要更多控制權，請使用位置提供者函式：

* `Absolute()` 將視窗的起始邊角放置於指定的 `x` 與 `y` 座標。
* `AlignedToScreen()` 相對於螢幕對齊視窗，並包含一個選用的 offset 參數。
    ```kotlin
    WindowPositionProvider.AlignedToScreen(
        alignment = Alignment.Center,
        offset = DpOffset(x = 16.dp, y = 16.dp)
    )
    ```
* `AlignedToParentWindow()` 將視窗錨定到父視窗，通常適用於對話方塊。
    ```kotlin
    WindowPositionProvider.AlignedToParentWindow(
        // 錨定到父視窗的起始邊角
        anchor = Alignment.TopStart,
        // 套用相對於錨點的對齊方式
        alignment = Alignment.Center
    )
    ```

### 指定大小 {id="specify-size"}

大小也是視窗邊界的一部分，因此也是透過相同的 `initialBoundsProvider`/`WindowState.requestBounds()` 機制來配置。

v2 API 使用 `WindowSizeProvider` 來取得螢幕與父視窗大小的資訊，以及查詢視窗內容的固有大小（intrinsic sizes）。

常見的內建選項包括用於特定視窗大小的 `Fixed()`，以及用於標準 800×600 dp 大小的 `Default`。

對於自訂大小，`WindowSizeProvider()` 的 Lambda 運算式可以存取螢幕度量資訊（screen metrics），若為對話方塊則還可以存取父視窗度量資訊：

```kotlin
WindowSizeProvider {
    val height = parentWindowMetrics!!.bounds.height
    DpSize(300.dp, height)
}
```

v2 API 支援了一種常見的需求場景：讓視窗調整為內容的慣用大小，同時在使用者將視窗拉大時，仍允許內容填滿視窗。`WindowSizeProvider.Unconstrained` 會計算內容的大小、加上視窗邊襯區（window insets），並將結果限制在可用螢幕大小以內。由於大小設定已與版面配置分離，因此使用 `fillMaxSize()` 的內容在使用者調整視窗大小時仍會展開填滿視窗。

```kotlin
WindowBoundsProvider(
    positionProvider = WindowPositionProvider.CenteredOnScreen,
    sizeProvider = WindowSizeProvider.Unconstrained
)
```

v2 版本的 `Window()` 與 `DialogWindow()` 可組合項接受 `minSize` 與 `maxSize` 參數。在底層視窗管理器支援的情況下，使用者將無法把視窗大小調整超過這些邊界：

```kotlin
DialogWindow(
    onCloseRequest = { showDialog = false },
    state = dialogState,
    minSize = DpSize(250.dp, 250.dp),
    maxSize = DpSize(500.dp, 500.dp)
) {
    // ...
}
```

## 接續閱讀 {id="what-s-next"}

探索關於[其他桌面元件](compose-desktop-components.md)的教學。