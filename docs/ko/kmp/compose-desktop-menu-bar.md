[//]: # (title: 메뉴 바)
<web-summary>데스크톱용 Compose Multiplatform을 사용하여 특정 창에 메뉴 바를 만드는 방법을 알아봅니다.</web-summary>

`MenuBar()` 컴포저블을 사용하면 특정 창을 위한 메뉴 바를 만들 수 있습니다. `MenuBar()`는 `Window()` 컴포저블의 스코프 내에서 사용할 수 있으므로 각 창마다 고유한 메뉴 바를 가질 수 있습니다.

> 이 가이드의 예제는 실행 가능한 데스크톱 앱입니다. 직접 실행해 보려면 다음 단계를 따르세요.
> 1. [Kotlin Multiplatform IDE 플러그인](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform) 또는 [온라인 마법사](https://kmp.jetbrains.com/?android=true&desktop=true&includeTests=false)를 사용하여 Compose Multiplatform 프로젝트를 생성합니다.
> 2. 데스크톱 진입점 파일을 엽니다. 예를 들면 `desktopApp/src/main/kotlin/com/example/my_desktop_app/main.kt`입니다.
> 3. 해당 파일의 내용을 제공된 예제 코드로 바꿉니다.
>
{style="note" id="desktop-snippets-intro"}

`MenuBar()`에서는 다음 컴포넌트들을 사용할 수 있습니다:

* `Menu()` – 메뉴 또는 서브메뉴
* `Item()` – 클릭 가능한 메뉴 아이템
* `CheckboxItem()` – 체크박스가 있는 아이템
* `RadioButtonItem()` – 라디오 버튼이 있는 아이템
* `Separator()` – 아이템 그룹을 구분하는 구분선

아이템과 메뉴는 `mnemonic`(니모닉) 파라미터를 받을 수 있습니다. 이 파라미터는 <shortcut>Alt</shortcut> 키와 함께 눌렀을 때 메뉴를 열거나 아이템을 실행하는 단일 문자입니다. 해당 문자가 텍스트에 포함되어 있으면 첫 번째로 나타나는 위치에 밑줄이 표시됩니다. 아이템은 메뉴를 거치지 않고 바로 동작을 실행할 수 있는 `KeyShortcut`인 `shortcut` 파라미터도 지원합니다.

> `KeyShortcut`에서 `ctrl = true`로 설정하면 macOS를 포함해 항상 <shortcut>Ctrl</shortcut>에 매핑됩니다. 
> macOS의 표준 단축키처럼 <shortcut>⌘</shortcut>를 사용하려면 `meta = true`로 설정하세요.
>
{style="tip"}

메뉴 콘텐츠는 컴포저블이므로 `MenuBar()` 내부에서 조건문과 반복문을 사용하여 어떤 아이템을 표시할지 결정할 수 있습니다. 참조하는 상태(state)가 변경되면 메뉴도 자동으로 업데이트됩니다. 다음 예제에서는 **Advanced settings** 체크박스가 선택된 상태에서만 **Settings** 서브메뉴가 나타납니다:

```kotlin
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyShortcut
import androidx.compose.ui.window.MenuBar
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application

fun main() = application {
    var action by remember { mutableStateOf("Last action: None") }
    var isOpen by remember { mutableStateOf(true) }

    if (isOpen) {
        var isSubmenuShowing by remember { mutableStateOf(false) }

        Window(onCloseRequest = { isOpen = false }) {
            MenuBar {
                Menu("File", mnemonic = 'F') {
                    Item("Copy", onClick = { action = "Last action: Copy" }, shortcut = KeyShortcut(Key.C, ctrl = true))
                    Item(
                        "Paste",
                        onClick = { action = "Last action: Paste" },
                        shortcut = KeyShortcut(Key.V, ctrl = true)
                    )
                }
                Menu("Actions", mnemonic = 'A') {
                    CheckboxItem(
                        "Advanced settings",
                        checked = isSubmenuShowing,
                        onCheckedChange = {
                            isSubmenuShowing = !isSubmenuShowing
                        }
                    )
                    if (isSubmenuShowing) {
                        Menu("Settings") {
                            Item("Setting 1", onClick = { action = "Last action: Setting 1" })
                            Item("Setting 2", onClick = { action = "Last action: Setting 2" })
                        }
                    }
                    Separator()
                    Item("About", icon = AboutIcon, onClick = { action = "Last action: About" })
                    Item("Exit", onClick = { isOpen = false }, shortcut = KeyShortcut(Key.Escape), mnemonic = 'E')
                }
            }

            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Text(text = action)
            }
        }
    }
}

object AboutIcon : Painter() {
    override val intrinsicSize = Size(256f, 256f)

    override fun DrawScope.onDraw() {
        drawOval(Color(0xFFFFA500))
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Window(MenuBar { Menu( "}

<img src="compose-desktop-menu-bar.animated.gif" alt="데스크톱 메뉴 바" width="600" preview-src="compose-desktop-menu-bar.png"/>

Windows 및 Linux에서는 메뉴 바가 창의 일부로 포함됩니다. macOS에서는 창이 활성화되었을 때 화면 상단의 시스템 메뉴 바에 표시됩니다.

## 다음 단계 {id="what-s-next"}

* [시스템 트레이](compose-desktop-tray.md)에 애플리케이션 아이콘과 메뉴를 추가하는 방법을 알아보세요.
* [기타 데스크톱 컴포넌트](compose-desktop-components.md)에 관한 튜토리얼을 살펴보세요.