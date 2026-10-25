[//]: # (title: トップレベルウィンドウの管理)

<web-summary>デスクトップ向けCompose Multiplatformでトップレベルウィンドウを管理する方法を学びます：ウィンドウの作成とカスタマイズ、システムトレイへの格納、ダイアログの使用。</web-summary>

デスクトップ向けCompose Multiplatformは、ウィンドウを管理するためのさまざまな機能を提供します。ウィンドウをトレイに格納したり、ドラッグ可能にしたり、サイズをコンテンツに適応させたり、位置を変更したりできます。

新しい実験的な[ウィンドウとダイアログのAPI v2](#window-and-dialog-api-v2)も参照してください。

> このガイドのサンプルは、実行可能なデスクトップアプリです。試すには以下の手順を行います：
> 1. [Kotlin Multiplatform IDEプラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)または[オンラインウィザード](https://kmp.jetbrains.com/?android=true&desktop=true&includeTests=false)を使用してCompose Multiplatformプロジェクトを作成します。
> 2. デスクトップのエントリポイントファイルを開きます。例えば、`desktopApp/src/main/kotlin/com/example/my_desktop_app/main.kt` です。
> 3. その内容を提供されているサンプルに置き換えます。
>
{style="note" id="desktop-snippets-intro"}

## ウィンドウを開く・閉じる {id="open-and-close-windows"}

通常のウィンドウを作成するには、`Window()` 関数を使用できます。これをコンポーザブルスコープに配置するには、`application` エントリポイント内で `Window()` を使用します：

```kotlin
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application

fun main() = application {
    Window(onCloseRequest = ::exitApplication) {
        // ウィンドウのコンテンツ
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="application { Window(onCloseRequest = ::exitApplication)"}

コンポーザブル関数として、`Window()` はそのプロパティを宣言的に変更できます。例えば、あるタイトルでウィンドウを開き、後からタイトルを変更することができます：

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

<img src="compose-window-properties.animated.gif" alt="Window properties: change title" preview-src="compose-window-properties.png" width="600"/>

### 条件を追加する {id="add-conditions"}

単純な `if` 条件を使用してウィンドウを開いたり閉じたりすることもできます。以下のコードサンプルでは、タスクが完了した後にアプリケーションウィンドウが自動的に閉じられます：

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
        // 時間のかかる処理を実行
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

<img src="compose-window-condition.animated.gif" alt="Windows with conditions" preview-src="compose-window-condition.png" width="600"/>

### 閉じる際の確認を求める {id="ask-for-confirmation-on-close"}

ダイアログを表示するなど、アプリケーション終了時にカスタムロジックを使用したい場合は、`onCloseRequest` コールバックを使用して閉じるアクションをオーバーライドできます。
以下のコードサンプルでは、命令的なアプローチ（`window.close()`）の代わりに宣言的なアプローチを使用し、状態の変更（`isOpen = false`）に応じてウィンドウを閉じます。

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

<img src="compose-window-ask-to-close.animated.gif" alt="Close with confirmation" preview-src="compose-window-ask-to-close.png" width="600"/>

## シングルウィンドウアプリケーションの作成 {id="create-a-single-window-application"}

トップレベルウィンドウが1つだけのシンプルなアプリケーションの場合、`Window()` コンポーザブルを含む完全な `application` エントリポイントは不要です。`singleWindowApplication()` 関数が両方を1つの呼び出しにラップします：

```kotlin
import androidx.compose.ui.window.singleWindowApplication

fun main() = singleWindowApplication {
    // ウィンドウのコンテンツ
}
```

複数のトップレベルウィンドウを使用する場合、カスタムの終了ロジックを実装する場合、または実行時にウィンドウ属性を変更する場合は、`application` エントリポイント内で [`Window()` コンポーザブル](#open-and-close-windows) を使用してください。

## ウィンドウの状態を管理する {id="manage-window-state"}

`WindowState` クラスは、ウィンドウの配置、現在の位置、およびサイズを保持します。
配置（placement）属性を使用すると、ウィンドウが画面上でどのように配置されるか（フローティング、最大化/最小化、または全画面表示）を指定できます。
状態が変更されると、自動的に再コンポジションがトリガーされます。ウィンドウの状態を変更するには、コールバックを使用するか、コンポーザブル内で状態を監視します：

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

<img src="compose-window-minimize.animated.gif" alt="Changing the state" preview-src="compose-window-minimize.png" width="600"/>

### ウィンドウのサイズをコンテンツに合わせる {id="adapt-window-size-to-its-content"}

事前に寸法を指定せずにコンテンツに基づいてウィンドウのサイズを設定するには、ウィンドウの寸法の片方または両方に `Dp.Unspecified` を設定します。
Compose Multiplatformは、コンテンツに合わせて初期ウィンドウサイズを自動的に調整します：

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

<img src="compose-window-adaptive-size.png" alt="Adaptive window size" width="451"/>

### 状態の変更を監視する {id="listen-to-state-changes"}

状態の変更に反応してアプリケーションの非コンポーザブル部分に値を渡す（例えば、データベースに書き込む）には、`snapshotFlow()` 関数を使用できます。
この関数はコンポーザブルの状態の現在の値をキャプチャします。

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

## 複数のウィンドウを管理する {id="manage-multiple-windows"}

複数のウィンドウを管理するには、アプリケーション状態用の独立したクラスを作成し、`mutableStateListOf` の変更に応じてウィンドウを開いたり閉じたりすることができます：

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

<img src="compose-multiple-windows.animated.gif" alt="Multiple windows" preview-src="compose-multiple-windows.png" width="600"/>

より複雑な例については、[Code Viewer](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/codeviewer) サンプルを参照してください。

## ダイアログを表示する {id="show-dialogs"}

`DialogWindow()` コンポーザブルを使用して、独自のタイトルバーを持つ独立したOSレベルのウィンドウを表示できます。
これは、確認、ファイルピッカー、またはユーザーが次に進む前に完了する必要があるあらゆるインタラクションに役立ちます。

実験的な `modalityType` パラメータを使用して、ダイアログが他のウィンドウとのインタラクションをブロックするかどうかを制御できます。
以下の `DialogModalityType` 値のいずれかに設定します：

* `Modeless`: 他のウィンドウを一切ブロックしません。
* `DocumentModal`: 親のトップレベルウィンドウと、それにアタッチされた他のすべてのウィンドウをブロックします（ダイアログ自身の子孫ウィンドウを除く）。
* `ApplicationModal`: 同じアプリケーション内の他のすべてのウィンドウをブロックします。

> 現在のウィンドウ内に留まるオーバーレイUI（ドロップダウン、ツールチップ、カスタムオーバーレイ）には、マルチプラットフォームの [Popup()](compose-popups.md) コンポーザブルを使用してください。
>
{style="tip"}

以下のコードサンプルは、通常のウィンドウと `ApplicationModal` ダイアログを組み合わせています：

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

// 実験的なmodalityTypeを有効化
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

## ウィンドウをシステムトレイに格納する {id="hide-windows-to-the-system-tray"}

デフォルトでは、ウィンドウを閉じるとアプリケーションが終了します。代わりにウィンドウをシステムトレイやメニューバーに隠すには、`onCloseRequest` をインターセプトしてウィンドウの可視性（visibility）状態を変更します。

以下の例では、ウィンドウを閉じると `isVisible` が `false` に設定され、ウィンドウが非表示になってシステムトレイアイコンが表示されます。
トレイアイコンをクリックするとウィンドウが復元されます。

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
        // アプリを終了する代わりにウィンドウを非表示にする
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

<img src="compose-window-hide-tray.animated.gif" alt="Hide instead of closing" preview-src="compose-window-hide-tray.png" width="600"/>

## ウィンドウ領域をドラッグ可能にする {id="make-window-areas-draggable"}

装飾のない（undecorated）ウィンドウにカスタムのドラッグ可能なタイトルバーを追加したり、ウィンドウ全体をドラッグ可能にしたりするには、`WindowDraggableArea()` コンポーザブルを使用できます：

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

`WindowDraggableArea()` は、`singleWindowApplication()`、`Window()`、および `DialogWindow()` コンポーザブル内でのみ使用できます。別のコンポーザブル関数内で呼び出すには、レシーバースコープとして `WindowScope` を使用してください：

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

<img src="compose-window-draggable-area.animated.gif" alt="Draggable area" preview-src="compose-window-draggable-area.png" width="600"/>

## 透過ウィンドウを作成する {id="create-transparent-windows"}

透過ウィンドウを作成するには、`Window()` 関数に `transparent=true` と `undecorated=true` の2つのパラメータを渡します。
透明なウィンドウを装飾することはできないため、ウィンドウは必ず undecorated である必要があります。

以下のコードサンプルは、コンポーザブルを組み合わせて角丸の透過ウィンドウを作成する方法を示しています：

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
            // 透過ウィンドウはundecoratedである必要があります
            undecorated = true, 
        ) {
            Surface(
                modifier = Modifier.fillMaxSize().padding(5.dp).shadow(3.dp, RoundedCornerShape(20.dp)), 
                color = Color.Transparent,
                // 角丸のウィンドウ
                shape = RoundedCornerShape(20.dp) 
            ) {
                Text("Hello World!", color = Color.White)
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Modifier.fillMaxSize().padding(5.dp).shadow(3.dp, RoundedCornerShape(20.dp))"}

## Swingコンポーネントを使用する {id="use-swing-components"}

デスクトップ向けCompose Multiplatformは内部でSwingを使用しているため、Swingを使用して直接ウィンドウを作成できます：

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
            // ウィンドウのコンテンツ
        }
        isVisible = true
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="SwingUtilities.invokeLater { ComposeWindow().apply {"}

`Window()` コンポーザブルのスコープを使用することもできます。以下のコードサンプルでは、`window` は `Window()` 内で作成された `ComposeWindow` です：

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

Swingで実装されたダイアログを使用する必要がある場合は、それをコンポーザブル関数にラップできます：

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

## ウィンドウとダイアログのAPI v2 {id="window-and-dialog-api-v2"}
<primary-label ref="Experimental"/>

Compose Multiplatform 1.12.0以降、再設計された `WindowState` および `DialogState` クラスが `androidx.compose.ui.window.v2` サブパッケージで利用可能になりました。

v2のウィンドウおよびダイアログAPIでは、状態を要求することと、ウィンドウマネージャによって実際に適用された状態を監視することが分離されています。
また、以前は不可能だったシナリオ（例えば、ウィンドウのサイズをコンテンツの推奨サイズに合わせつつ、ウィンドウがそれより大きくなった場合にはコンテンツを（`fillMaxSize()` などの修飾子を介して）拡張させるなど）も実現可能になります。
詳細は[サイズを指定する](#specify-size)を参照してください。

v2 APIは、このページの他の部分で説明されている既存のAPIと並行して提供されているため、個々のウィンドウを自分のペースで移行できます。

### 状態の指定と監視 {id="specify-and-observe-state"}

v2 APIは、望ましい状態の指定と実際の状態の監視を明示的に分離します。

ウィンドウの初期状態を指定するには、`rememberWindowState()` にプロバイダを渡します：

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

ウィンドウが作成された後に状態の変更を要求するには、`WindowState` の対応するメソッドを呼び出します。
正確なサイズと位置を直接指定できます：

```kotlin
windowState.requestScreen { defaultScreen }
windowState.requestSize(DpSize(1024.dp, 768.dp))
windowState.requestPosition(DpOffset(100.dp, 100.dp))
```

相対的な配置を行ったり、寸法を動的に計算したりするには、プロバイダを使用します：

```kotlin
windowState.requestBounds(
    WindowBoundsProvider(
        positionProvider = WindowPositionProvider.CenteredOnScreen,
        sizeProvider = WindowSizeProvider.Fixed(DpSize(1024.dp, 768.dp))
    )
)
```

リクエストの適用は非同期です。ウィンドウシステムが要求された状態を調整する場合があり、また、後でウィンドウを移動またはリサイズした際などに実際の状態が変化することもあります。
ウィンドウの実際の状態は、`WindowState.screenId` および `WindowState.bounds` を介して監視します：

```kotlin
if (windowState.isInitialized) {
    Text("Current screen: ${windowState.screenId}")
    Text("Current bounds: ${windowState.bounds}")
}
```

ダイアログに対しても、`DialogState` および `rememberDialogState()` を介して同様の非同期モデルが利用可能です。

### スクリーンを選択する {id="choose-a-screen"}

ウィンドウを表示するスクリーンを要求するには、`initialScreenProvider` を `rememberWindowState()` に渡すか、後から `WindowState.requestScreen()` を呼び出します。
ウィンドウが実際に配置されているスクリーンは、`WindowState.screenId` を介して監視できます。

例えば、利用可能な幅が `1024.dp` 以上あるスクリーンへの配置を要求し、見つからない場合はデフォルトのスクリーンにフォールバックすることができます：

```kotlin
windowState.requestScreen {
    screens.firstOrNull { it.availableBounds.width >= 1024.dp }
        ?: defaultScreen
}
```

### 位置を指定する {id="specify-position"}

ウィンドウの位置を変更するには、`initialBoundsProvider` を `rememberWindowState()` に渡すか、後から `WindowState.requestBounds()` を呼び出します。
ウィンドウの実際の境界は `WindowState.bounds` を介して監視できます。

v2 APIは、スクリーンおよび親ウィンドウのジオメトリに関する情報を取得するために `WindowPositionProvider` を使用します。

標準的な配置には、組み込みのプロパティを使用できます：

* `Default`: オペレーティングシステムの標準的なカスケード動作を適用します。
* `Current`: ウィンドウの現在の位置を維持します。
* `CenteredOnScreen`: スクリーンの中央にウィンドウを配置します。
* `CenteredInParentWindow`: 親ウィンドウの中央にウィンドウを配置します。

より詳細な制御を行うには、位置プロバイダ関数を使用します：

* `Absolute()`: ウィンドウの開始コーナーを指定された `x` および `y` 座標に配置します。
* `AlignedToScreen()`: スクリーンを基準にウィンドウを配置し、オプションのオフセットパラメータを含みます。
    ```kotlin
    WindowPositionProvider.AlignedToScreen(
        alignment = Alignment.Center,
        offset = DpOffset(x = 16.dp, y = 16.dp)
    )
    ```
* `AlignedToParentWindow()`: 親ウィンドウにウィンドウを固定（アンカー）します。主にダイアログに役立ちます。
    ```kotlin
    WindowPositionProvider.AlignedToParentWindow(
        // 親ウィンドウの開始コーナーに固定
        anchor = Alignment.TopStart,
        // アンカーポイントに対するアライメントを適用
        alignment = Alignment.Center
    )
    ```

### サイズを指定する {id="specify-size"}

サイズ設定もウィンドウ境界（bounds）の一部であるため、同じ `initialBoundsProvider` / `WindowState.requestBounds()` メカニズムを通じて設定されます。

v2 APIは、スクリーンおよび親ウィンドウのサイズに関する情報を取得したり、コンテンツの固有の（intrinsic）サイズを問い合わせたりするために `WindowSizeProvider` を使用します。

一般的な組み込みのオプションには、特定のウィンドウサイズを指定する `Fixed()` や、標準の 800×600 dp サイズを指定する `Default` があります。

カスタムのサイズ設定を行う場合、`WindowSizeProvider()` ラムダはスクリーンメトリクスにアクセスでき、ダイアログの場合は親ウィンドウのメトリクスにもアクセスできます：

```kotlin
WindowSizeProvider {
    val height = parentWindowMetrics!!.bounds.height
    DpSize(300.dp, height)
}
```

v2 APIは、要望の多かったシナリオを可能にします：
ウィンドウのサイズをコンテンツの推奨サイズに合わせつつ、ユーザーがウィンドウを大きくしたときにはコンテンツがウィンドウを満たすようにすることです。
`WindowSizeProvider.Unconstrained` はコンテンツのサイズを計算し、ウィンドウのインセットを加算した上で、結果を利用可能な画面サイズで制限します。
サイズ設定はレイアウトから切り離されているため、`fillMaxSize()` を使用するコンテンツでも、ユーザーがウィンドウをリサイズした場合には拡大してウィンドウ全体を満たします。

```kotlin
WindowBoundsProvider(
    positionProvider = WindowPositionProvider.CenteredOnScreen,
    sizeProvider = WindowSizeProvider.Unconstrained
)
```

v2バージョンの `Window()` および `DialogWindow()` コンポーザブルは、`minSize` および `maxSize` パラメータを受け入れます。
基礎となるウィンドウマネージャがサポートしている場合、ユーザーはこれらの境界を超えてウィンドウのサイズを変更することはできなくなります：

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

## 次のステップ {id="what-s-next"}

[その他のデスクトップコンポーネント](compose-desktop-components.md)に関するチュートリアルをご覧ください。