[//]: # (title: 탭 탐색 및 키보드 포커스)
<web-summary>데스크톱용 Compose Multiplatform에서 Tab 키를 사용하여 컴포넌트 사이를 탐색하는 방법을 알아봅니다.</web-summary>

데스크톱용 Compose Multiplatform에서는 다음 컴포넌트로 이동하는 단축키인 <shortcut>Tab</shortcut>과 이전 컴포넌트로 이동하는 <shortcut>Shift+Tab</shortcut>을 사용하여 컴포넌트 간 탐색을 설정할 수 있습니다.

> 이 가이드의 예제들은 실행 가능한 데스크톱 앱입니다. 직접 사용해보려면 다음과 같이 하세요:
> 1. [Kotlin Multiplatform IDE 플러그인](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform) 또는 [온라인 마법사](https://kmp.jetbrains.com/?android=true&desktop=true&includeTests=false)를 사용하여 Compose Multiplatform 프로젝트를 생성합니다.
> 2. 데스크톱 진입점(entry-point) 파일을 엽니다. 예를 들어 `desktopApp/src/main/kotlin/com/example/my_desktop_app/main.kt`입니다.
> 3. 해당 파일의 내용을 제공된 예제 코드로 바꿉니다.
>
{style="note" id="desktop-snippets-intro"}

## 기본 탭 탐색 {id="default-tab-navigation"}

기본적으로 탭 탐색을 통해 사용자는 포커스 가능한 컴포넌트 사이를 나타나는 순서대로 이동할 수 있습니다. 이 기능은 기본적으로 활성화되어 있으며 추가 코드가 필요하지 않습니다.

포커스 가능한 컴포넌트에는 구현 시 `clickable()`, `selectable()`, `toggleable()` 또는 `focusable()` 수정자(modifier)를 사용하는 모든 컴포넌트가 포함됩니다. 예를 들어 텍스트 필드, 버튼, 슬라이더, 탐색 항목, null이 아닌 콜백을 가진 선택 컨트롤, `Card()`, `Surface()`, `ListItem()`의 `onClick` 오버로드가 있습니다.

다음은 사용자가 표준 단축키를 사용하여 5개의 텍스트 필드 사이를 이동할 수 있는 창입니다:

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

<img src="compose-desktop-tab-navigation-default.animated.gif" alt="기본 탭 순서" width="450" preview-src="compose-desktop-tab-navigation-default.png"/>

## 커스텀 포커스 가능 컴포넌트 {id="custom-focusable-components"}

기본적으로 포커스할 수 없는 컴포넌트를 탭 순서에 포함하려면 `focusable()` 수정자를 적용합니다.

컴포넌트가 포커스를 받을 때의 모양을 변경하려면 `focusable()` 수정자에 `MutableInteractionSource`를 전달하고, `collectIsFocusedAsState()`로 포커스 상태를 읽은 다음, 해당 상태를 사용하여 컴포넌트의 스타일(다른 배경색, 테두리 또는 기타 강조 표시 등)을 변경합니다. 컴포넌트가 키보드 입력에 반응하도록 하려면 `onKeyEvent()` 수정자로 키 이벤트를 처리합니다.

다음 예제는 `Box()` 컴포저블을 버튼과 유사한 컴포넌트로 변환합니다. 포커스를 받으면 상자가 강조 표시되고, <shortcut>Enter</shortcut> 또는 <shortcut>Space</shortcut>를 누르면 관련 동작이 트리거됩니다:

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

<img src="compose-desktop-tab-navigation-custom-focusable.animated.gif" alt="커스텀 포커스 가능 컴포넌트" width="450" preview-src="compose-desktop-tab-navigation-custom-focusable.png"/>

## 커스텀 탭 순서 {id="custom-tab-order"}

컴포넌트가 나타나는 순서와 다른 순서로 포커스를 이동하려면 두 가지 수정자를 함께 사용합니다:

* `focusRequester()`는 `FocusRequester` 핸들을 포커스 가능한 컴포넌트에 연결합니다. 컴포넌트가 [기본적으로 포커스 가능하지 않은 경우](#custom-focusable-components), `focusRequester()` 뒤에 `focusable()` 수정자를 적용합니다.
* `focusProperties()`는 탭 순서에서 `next` 및 `previous` 요소를 설정합니다. 이는 <shortcut>Tab</shortcut> 또는 <shortcut>Shift+Tab</shortcut>을 눌렀을 때 포커스되는 `FocusRequester` 핸들을 가진 컴포넌트입니다.

다음 예제는 5개의 텍스트 필드 각각에 대해 `FocusRequester`를 생성하고 기본 탭 순서를 반대로 변경합니다:

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
                                // 기본 순서를 반대로 변경:
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

<img src="compose-desktop-tab-navigation-custom-order.animated.gif" alt="커스텀 탭 순서" width="450" preview-src="compose-desktop-tab-navigation-custom-order.png"/>

## 코드에서 포커스 이동하기 {id="moving-focus-from-code"}

사용자 상호작용 없이 컴포넌트에 포커스를 맞추려면 `focusRequester()` 수정자를 사용하여 포커스 가능한 컴포넌트에 `FocusRequester`를 연결하고 `FocusRequester.requestFocus()`를 호출합니다. 컴포넌트가 [기본적으로 포커스 가능하지 않은 경우](#custom-focusable-components), `focusable()` 수정자는 `focusRequester()` 뒤에 적용해야 합니다.

다음 예제에서는 버튼을 통해 포커스를 텍스트 필드로 이동했다가 다시 버튼 자신으로 이동합니다:

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

<img src="compose-desktop-tab-navigation-move-focus-from-code.animated.gif" alt="코드에서 포커스 이동" width="450" preview-src="compose-desktop-tab-navigation-move-focus-from-code.png"/>

### 컴포넌트가 나타날 때 포커스 맞추기 {id="focusing-a-component-when-it-appears"}

양식(form)이나 대화상자(dialog)에서는 일반적으로 첫 번째 입력 필드에 즉시 포커스를 맞춰 사용자가 마우스를 잡지 않고도 바로 입력을 시작할 수 있게 합니다. 이러한 경우에는 컴포넌트가 컴포지션(composition)에 진입한 후 한 번 실행되는 `LaunchedEffect(Unit)` 블록에서 포커스를 요청합니다.

다음 예제에서는 창이 열리자마자 첫 번째 텍스트 필드에 포커스가 맞춰집니다:

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

<img src="compose-desktop-tab-navigation-focus-on-appearance.animated.gif" alt="나타날 때 텍스트 필드에 포커스" width="450" preview-src="compose-desktop-tab-navigation-focus-on-appearance.png"/>

## 여러 줄 텍스트 필드에서 포커스 이동하기 {id="moving-focus-from-multiline-text-fields"}

여러 줄(multiline) 텍스트 필드에서는 <shortcut>Tab</shortcut>을 누르면 포커스가 다음 컴포넌트로 이동하는 대신 탭 문자가 삽입됩니다:

```kotlin
Column {
    repeat(5) {
        TextField(
            state = rememberTextFieldState("Hello, World!"),
            // MultiLine은 lineLimits의 기본값입니다
            lineLimits = TextFieldLineLimits.MultiLine(),
            modifier = Modifier.padding(8.dp)
        )
    }
}
```

이는 알려진 이슈인 [CMP-5822](https://youtrack.jetbrains.com/issue/CMP-5822)입니다. 기본 동작인 여러 줄을 허용하는 모든 텍스트 필드에 영향을 미칩니다. 해결 방법(workaround)으로, `onPreviewKeyEvent` 수정자를 사용하여 <shortcut>Tab</shortcut> 키를 가로채고 `LocalFocusManager`의 `FocusManager`를 사용하여 포커스를 이동할 수 있습니다:

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

## 다음 단계 {id="what-s-next"}

* [키보드 이벤트](compose-desktop-keyboard.md) 처리에 대해 자세히 알아보세요.
* [다양한 플랫폼에서의 접근성 지원](compose-desktop-accessibility.md)에 대해 알아보세요.
* [다른 데스크톱 컴포넌트](compose-desktop-components.md)에 관한 튜토리얼을 살펴보세요.