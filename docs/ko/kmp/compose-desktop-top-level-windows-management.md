[//]: # (title: 최상위 창 관리)

<web-summary>데스크톱용 Compose Multiplatform에서 최상위 창을 관리하는 방법을 알아봅니다. 창 생성 및 커스터마이징, 시스템 트레이에 숨기기, 대화 상자 사용법 등을 다룹니다.</web-summary>

데스크톱용 Compose Multiplatform은 창(window) 관리를 위한 다양한 기능을 제공합니다. 창을 트레이에 숨기거나, 드래그 가능하게 만들고, 콘텐츠에 맞게 크기를 조정하거나, 위치를 변경하는 등의 작업을 할 수 있습니다.

새로운 실험적 [창 및 대화 상자 API v2](#window-and-dialog-api-v2)도 참조하세요.

## 창 열기 및 닫기 {id="open-and-close-windows"}

`Window()` 함수를 사용하여 일반적인 창을 만들 수 있습니다. 이를 컴포저블 스코프에 넣으려면 `application` 진입점(entry point) 내에서 `Window()`를 사용하세요.

```kotlin
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application

fun main() = application {
    Window(onCloseRequest = ::exitApplication) {
        // 창의 콘텐츠
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="application { Window(onCloseRequest = ::exitApplication)"}

`Window()`는 컴포저블 함수이므로 속성을 선언적으로 변경할 수 있습니다. 예를 들어, 특정 제목으로 창을 연 다음 나중에 제목을 변경할 수 있습니다.

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

<img src="compose-window-properties.animated.gif" alt="창 속성: 제목 변경" preview-src="compose-window-properties.png" width="600"/>

### 조건 추가하기 {id="add-conditions"}

단순한 `if` 조건을 사용하여 창을 열고 닫을 수도 있습니다. 다음 코드 샘플에서는 작업을 완료한 후 애플리케이션 창이 자동으로 닫힙니다.

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
        // 무거운 작업 수행
        delay(2000) 
        isPerformingTask = false
    }
    if (isPerformingTask) {
        Window(
            onCloseRequest = ::exitApplication,
            title = "Window 1"
        )
        {
            Text("작업을 수행 중입니다. 잠시만 기다려 주세요!")
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

<img src="compose-window-condition.animated.gif" alt="조건부가 있는 창" preview-src="compose-window-condition.png" width="600"/>

### 닫을 때 확인 요청하기 {id="ask-for-confirmation-on-close"}

대화 상자를 표시하는 것과 같이 애플리케이션 종료 시 커스텀 로직을 사용하려는 경우, `onCloseRequest` 콜백을 사용하여 닫기 동작을 오버라이드할 수 있습니다.
다음 코드 샘플에서는 명령형 방식(`window.close()`) 대신 선언적 방식을 사용하며, 상태 변경(`isOpen = false`)에 반응하여 창을 닫습니다.

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
                    title = "저장하지 않고 닫으시겠습니까?"
                ) {
                    Button(
                        onClick = { isOpen = false }
                    ) {
                        Text("예")
                    }
                }
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Window(onCloseRequest = { isAskingToClose = true }"}

<img src="compose-window-ask-to-close.animated.gif" alt="확인 후 닫기" preview-src="compose-window-ask-to-close.png" width="600"/>

## 단일 창 애플리케이션 만들기 {id="create-a-single-window-application"}

하나의 최상위 창만 있는 간단한 애플리케이션의 경우, `Window()` 컴포저블이 포함된 전체 `application` 진입점이 필요하지 않습니다. `singleWindowApplication()` 함수가 이 두 가지를 하나의 호출로 래핑해 줍니다.

```kotlin
import androidx.compose.ui.window.singleWindowApplication

fun main() = singleWindowApplication {
    // 창의 콘텐츠
}
```

두 개 이상의 최상위 창이 필요하거나, 커스텀 닫기 로직을 사용하거나, 런타임에 창 속성을 변경해야 하는 경우에는 `application` 진입점에서 [`Window()` 컴포저블](#open-and-close-windows)을 사용하세요.

## 창 상태 관리하기 {id="manage-window-state"}

`WindowState` 클래스는 창 배치(placement), 현재 위치 및 크기를 관리합니다. 배치 속성을 사용하면 창이 화면에 배치되는 방식(플로팅, 최대화/최소화 또는 전체 화면)을 지정할 수 있습니다.
상태가 변경되면 자동으로 리컴포지션(recomposition)이 트리거됩니다. 창 상태를 변경하려면 콜백을 사용하거나 컴포저블에서 이를 관찰하세요.

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

    Window(onCloseRequest = ::exitApplication, state, title = "창 상태") {
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
                Text("전체 화면 여부(isFullscreen)")
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
                Text("최대화 여부(isMaximized)")
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                Checkbox(state.isMinimized, { state.isMinimized = !state.isMinimized })
                Text("최소화 여부(isMinimized)")
            }

            Text(
                "위치 ${state.position}",
                Modifier.clickable {
                    val position = state.position
                    if (position is WindowPosition.Absolute) {
                        state.position = position.copy(x = state.position.x + 10.dp)
                    }
                }
            )

            Text(
                "크기 ${state.size}",
                Modifier.clickable {
                    state.size = state.size.copy(width = state.size.width + 10.dp)
                }
            )
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="val state = rememberWindowState(placement = WindowPlacement.Maximized)"}

<img src="compose-window-minimize.animated.gif" alt="상태 변경하기" preview-src="compose-window-minimize.png" width="600"/>

### 콘텐츠에 맞게 창 크기 조정하기 {id="adapt-window-size-to-its-content"}

미리 치수를 지정하지 않고 콘텐츠에 따라 창 크기를 조정하려면 창의 한쪽 또는 양쪽 치수를 `Dp.Unspecified`로 설정하세요. Compose Multiplatform은 콘텐츠에 맞게 창의 초기 크기를 자동으로 조정합니다.

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
        title = "적응형 크기",
        resizable = false
    ) {
        Column(Modifier.background(Color(0xFFEEEEEE))) {
            Row {
                Text("레이블 1", Modifier.size(100.dp, 100.dp).padding(10.dp).background(Color.White))
                Text("레이블 2", Modifier.size(150.dp, 200.dp).padding(5.dp).background(Color.White))
                Text("레이블 3", Modifier.size(200.dp, 300.dp).padding(25.dp).background(Color.White))
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="state = rememberWindowState(width = Dp.Unspecified, height = Dp.Unspecified)"}

<img src="compose-window-adaptive-size.png" alt="적응형 창 크기" width="451"/>

### 상태 변경 관찰하기 {id="listen-to-state-changes"}

상태 변경에 반응하여 그 값을 애플리케이션의 비컴포저블(non-composable) 부분으로 전달해야 하는 경우(예: 데이터베이스에 기록), `snapshotFlow()` 함수를 사용할 수 있습니다. 이 함수는 컴포저블 상태의 현재 값을 캡처합니다.

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

## 다중 창 관리하기 {id="manage-multiple-windows"}

여러 개의 창을 관리하려면 애플리케이션 상태를 위한 별도의 클래스를 만들고 `mutableStateListOf`의 변경에 반응하여 창을 열거나 닫을 수 있습니다.

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
        Menu("파일") {
            Item("새 창", onClick = state.openNewWindow)
            Item("종료", onClick = state.exit)
        }
    }
}

private class MyApplicationState {
    val windows = mutableStateListOf<MyWindowState>()

    init {
        windows += MyWindowState("초기 창")
    }

    fun openNewWindow() {
        windows += MyWindowState("창 ${windows.size}")
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

<img src="compose-multiple-windows.animated.gif" alt="다중 창" preview-src="compose-multiple-windows.png" width="600"/>

더 복잡한 예제는 [Code Viewer](https://github.com/JetBrains/compose-multiplatform/tree/master/examples/codeviewer) 샘플을 참조하세요.

## 대화 상자 표시하기 {id="show-dialogs"}

`DialogWindow()` 컴포저블을 사용하여 자체 타이틀 바를 가진 별도의 OS 레벨 창을 표시할 수 있습니다. 이는 확인 요청, 파일 선택기 또는 사용자가 계속하기 전에 완료해야 하는 상호작용에 유용합니다.

실험적인 `modalityType` 파라미터를 사용하여 대화 상자가 다른 창과의 상호작용을 차단할지 여부를 제어할 수 있습니다. 다음 `DialogModalityType` 값 중 하나를 설정하세요.

* `Modeless`: 다른 어떤 창도 차단하지 않습니다.
* `DocumentModal`: 부모 최상위 창과 그에 연결된 다른 모든 창을 차단합니다(대화 상자 자체의 하위 창 제외).
* `ApplicationModal`: 동일한 애플리케이션의 다른 모든 창을 차단합니다.

> 현재 창 내부에 머무르는 오버레이 UI(드롭다운, 툴팁 및 커스텀 오버레이)의 경우, 멀티플랫폼 [Popup()](compose-popups.md) 컴포저블을 사용하세요.
>
{style="tip"}

다음 코드 샘플은 일반 창과 `ApplicationModal` 대화 상자를 결합한 예입니다.

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

// 실험적 modalityType 활성화
@OptIn(ExperimentalComposeUiApi::class)
fun main() = application {
    Window(
        onCloseRequest = ::exitApplication,
        title = "메인 창"
    ) {
        var isDialogOpen by remember { mutableStateOf(false) }

        Button(onClick = { isDialogOpen = true }) {
            Text(text = "대화 상자 열기")
        }

        if (isDialogOpen) {
            DialogWindow(
                onCloseRequest = { isDialogOpen = false },
                state = rememberDialogState(position = WindowPosition(Alignment.Center)),
                title = "대화 상자",
                modalityType = DialogModalityType.ApplicationModal
            ) {
                Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                    Text("이것은 대화 상자입니다.")
                }
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="if (isDialogOpen) { DialogWindow( ... ) }"}

## 시스템 트레이로 창 숨기기 {id="hide-windows-to-the-system-tray"}

기본적으로 창을 닫으면 애플리케이션이 종료됩니다. 창을 닫는 대신 시스템 트레이나 메뉴 바에 숨기려면, `onCloseRequest`를 가로채서 창의 가시성(visibility) 상태를 변경할 수 있습니다.

다음 예제에서는 창을 닫을 때 `isVisible`을 `false`로 설정하여 창을 숨기고 시스템 트레이 아이콘을 표시합니다. 트레이 아이콘을 클릭하면 창이 다시 나타납니다.

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
        // 앱을 종료하는 대신 창을 숨깁니다.
        onCloseRequest = { isVisible = false },
        visible = isVisible,
        title = "카운터",
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
            tooltip = "카운터",
            onAction = { isVisible = true },
            menu = {
                Item("종료", onClick = ::exitApplication)
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

<img src="compose-window-hide-tray.animated.gif" alt="닫는 대신 숨기기" preview-src="compose-window-hide-tray.png" width="600"/>

## 창 영역을 드래그 가능하게 만들기 {id="make-window-areas-draggable"}

장식되지 않은 창(undecorated window)에 커스텀 드래그 가능 타이틀 바를 추가하거나 창 전체를 드래그 가능하게 만들려면 `WindowDraggableArea()` 컴포저블을 사용할 수 있습니다.

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

`WindowDraggableArea()`는 `singleWindowApplication()`, `Window()`, `DialogWindow()` 컴포저블 내부에서만 사용할 수 있습니다. 다른 컴포저블 함수에서 이를 호출하려면 `WindowScope`를 리시버 스코프(receiver scope)로 사용하세요.

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

<img src="compose-window-draggable-area.animated.gif" alt="드래그 가능한 영역" preview-src="compose-window-draggable-area.png" width="600"/>

## 투명 창 만들기 {id="create-transparent-windows"}

투명한 창을 만들려면 `Window()` 함수에 `transparent=true`와 `undecorated=true`라는 두 개의 파라미터를 전달하세요. 투명한 창은 장식(decorate)할 수 없으므로 반드시 장식되지 않아야(undecorated) 합니다.

다음 코드 샘플은 컴포저블을 결합하여 모서리가 둥근 투명 창을 만드는 방법을 보여줍니다.

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
            title = "투명 창 예제",
            transparent = true, 
            // 투명 창은 반드시 undecorated여야 합니다.
            undecorated = true, 
        ) {
            Surface(
                modifier = Modifier.fillMaxSize().padding(5.dp).shadow(3.dp, RoundedCornerShape(20.dp)), 
                color = Color.Transparent,
                // 모서리가 둥근 창
                shape = RoundedCornerShape(20.dp) 
            ) {
                Text("Hello World!", color = Color.White)
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Modifier.fillMaxSize().padding(5.dp).shadow(3.dp, RoundedCornerShape(20.dp))"}

## Swing 컴포넌트 사용하기 {id="use-swing-components"}

데스크톱용 Compose Multiplatform은 내부적으로 Swing을 사용하므로, Swing을 직접 사용하여 창을 만들 수 있습니다.

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
            // 창의 콘텐츠
        }
        isVisible = true
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="SwingUtilities.invokeLater { ComposeWindow().apply {"}

`Window()` 컴포저블의 스코프를 사용할 수도 있습니다. 다음 코드 샘플에서 `window`는 `Window()` 내부에서 생성된 `ComposeWindow`입니다.

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

Swing으로 구현된 대화 상자를 사용해야 하는 경우, 이를 컴포저블 함수로 래핑할 수 있습니다.

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
                println("결과 $it")
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
        object : FileDialog(parent, "파일 선택", LOAD) {
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

## 창 및 대화 상자 API v2 {id="window-and-dialog-api-v2"}
<primary-label ref="Experimental"/>

Compose Multiplatform 1.12.0부터 새롭게 설계된 `WindowState` 및 `DialogState` 클래스를 `androidx.compose.ui.window.v2` 하위 패키지에서 사용할 수 있습니다.

v2 창 및 대화 상자 API는 상태 요청(requesting)과 창 관리자에 의해 실제로 적용된 상태를 관찰(observing)하는 것을 분리합니다. 또한 창이 커질 때 콘텐츠가 확장(예: `fillMaxSize()`와 같은 수정자 사용)되도록 하면서도 창 크기를 콘텐츠의 기본 크기에 맞추는 것과 같이 이전에는 불가능했던 시나리오를 가능하게 합니다. 자세한 내용은 [크기 지정](#specify-size)을 참조하세요.

v2 API는 이 페이지의 나머지 부분에서 설명한 기존 API와 함께 사용할 수 있으므로, 각 창을 원하는 속도에 맞춰 마이그레이션할 수 있습니다.

### 상태 지정 및 관찰 {id="specify-and-observe-state"}

v2 API는 원하는 상태를 지정하는 것과 실제 상태를 관찰하는 것을 명확하게 분리합니다.

창의 초기 상태를 지정하려면 `rememberWindowState()`에 provider를 전달하세요.

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

창이 생성된 후 상태 변경을 요청하려면 `WindowState`의 해당 메서드를 호출하세요. 정확한 크기와 위치를 직접 지정할 수 있습니다.

```kotlin
windowState.requestScreen { defaultScreen }
windowState.requestSize(DpSize(1024.dp, 768.dp))
windowState.requestPosition(DpOffset(100.dp, 100.dp))
```

상대적인 위치 지정이나 동적인 치수 계산을 위해서는 provider를 사용하세요.

```kotlin
windowState.requestBounds(
    WindowBoundsProvider(
        positionProvider = WindowPositionProvider.CenteredOnScreen,
        sizeProvider = WindowSizeProvider.Fixed(DpSize(1024.dp, 768.dp))
    )
)
```

요청을 적용하는 것은 비동기식입니다. 윈도잉 시스템이 요청된 상태를 조정할 수 있으며, 창을 이동하거나 크기를 조정할 때와 같이 실제 상태가 나중에 변경될 수도 있습니다. `WindowState.screenId` 및 `WindowState.bounds`를 통해 창의 실제 상태를 관찰하세요.

```kotlin
if (windowState.isInitialized) {
    Text("현재 화면: ${windowState.screenId}")
    Text("현재 경계(bounds): ${windowState.bounds}")
}
```

동일한 비동기 모델을 `DialogState` 및 `rememberDialogState()`를 통해 대화 상자에서도 사용할 수 있습니다.

### 화면 선택 {id="choose-a-screen"}

`rememberWindowState()`에 `initialScreenProvider`를 전달하거나 나중에 `WindowState.requestScreen()`을 호출하여 창이 나타날 화면을 요청할 수 있습니다. 창이 실제로 배치된 화면은 `WindowState.screenId`를 통해 관찰 가능합니다.

예를 들어, 사용 가능한 너비가 최소 `1024.dp` 이상인 화면에 창을 배치하도록 요청하고, 해당 화면이 없으면 기본 화면으로 돌아가도록 할 수 있습니다.

```kotlin
windowState.requestScreen {
    screens.firstOrNull { it.availableBounds.width >= 1024.dp }
        ?: defaultScreen
}
```

### 위치 지정 {id="specify-position"}

창 위치를 변경하려면 `rememberWindowState()`에 `initialBoundsProvider`를 전달하거나 나중에 `WindowState.requestBounds()`를 호출하세요. 창의 실제 경계(bounds)는 `WindowState.bounds`를 통해 관찰 가능합니다.

v2 API는 `WindowPositionProvider`를 사용하여 화면 및 부모 창의 지오메트리 정보를 가져옵니다.

표준 배치의 경우 내장된 속성을 사용할 수 있습니다.

* `Default`: 운영 체제의 표준 계단식(cascading) 동작을 적용합니다.
* `Current`: 창의 현재 위치를 유지합니다.
* `CenteredOnScreen`: 화면 중앙에 창을 배치합니다.
* `CenteredInParentWindow`: 부모 창 중앙에 창을 배치합니다.

더 세밀한 제어를 위해 위치 provider 함수를 사용하세요.

* `Absolute()`: 지정된 `x` 및 `y` 좌표에 창의 시작 모서리를 배치합니다.
* `AlignedToScreen()`: 화면을 기준으로 창을 정렬하며 선택적인 오프셋 파라미터를 포함합니다.
    ```kotlin
    WindowPositionProvider.AlignedToScreen(
        alignment = Alignment.Center,
        offset = DpOffset(x = 16.dp, y = 16.dp)
    )
    ```
* `AlignedToParentWindow()`: 창을 부모 창에 고정하며, 일반적으로 대화 상자에 유용합니다.
    ```kotlin
    WindowPositionProvider.AlignedToParentWindow(
        // 부모 창의 시작 모서리에 고정
        anchor = Alignment.TopStart,
        // 고정 지점을 기준으로 정렬 적용
        alignment = Alignment.Center
    )
    ```

### 크기 지정 {id="specify-size"}

크기 조정 또한 창 경계(bounds)의 일부이므로 동일한 `initialBoundsProvider`/`WindowState.requestBounds()` 메커니즘을 통해 구성됩니다.

v2 API는 `WindowSizeProvider`를 사용하여 화면 및 부모 창의 크기 정보를 가져오고, 창 콘텐츠의 고유 크기(intrinsic size)를 쿼리합니다.

일반적인 내장 옵션으로는 특정 창 크기를 위한 `Fixed()`와 표준 800×600 dp 크기를 위한 `Default`가 포함됩니다.

커스텀 크기 조정을 위해 `WindowSizeProvider()` 람다는 화면 메트릭에 접근할 수 있으며, 대화 상자의 경우 부모 창 메트릭에도 접근할 수 있습니다.

```kotlin
WindowSizeProvider {
    val height = parentWindowMetrics!!.bounds.height
    DpSize(300.dp, height)
}
```

v2 API는 자주 요청되는 시나리오 중 하나를 가능하게 합니다. 바로 사용자가 창을 더 크게 만들 때 콘텐츠가 창을 채우도록 허용하면서도 창 크기를 콘텐츠의 기본 크기에 맞추는 것입니다. `WindowSizeProvider.Unconstrained`는 콘텐츠의 크기를 계산하고 창 인셋(insets)을 추가한 후, 결과를 사용 가능한 화면 크기로 제한합니다. 크기 조정이 레이아웃과 분리되어 있으므로, 사용자가 창 크기를 조정하면 `fillMaxSize()`를 사용하는 콘텐츠가 여전히 창을 채우도록 확장됩니다.

```kotlin
WindowBoundsProvider(
    positionProvider = WindowPositionProvider.CenteredOnScreen,
    sizeProvider = WindowSizeProvider.Unconstrained
)
```

v2 버전의 `Window()` 및 `DialogWindow()` 컴포저블은 `minSize` 및 `maxSize` 파라미터를 허용합니다. 기본 창 관리자가 이를 지원하는 경우, 사용자는 이 경계를 벗어나 창 크기를 조정할 수 없습니다.

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

## 다음 단계 {id="what-s-next"}

[기타 데스크톱 컴포넌트](compose-desktop-components.md)에 관한 튜토리얼을 살펴보세요.