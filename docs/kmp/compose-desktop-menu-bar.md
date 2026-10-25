[//]: # (title: 菜单栏)
<web-summary>了解如何使用 Compose Multiplatform for desktop 为特定窗口创建菜单栏。</web-summary>

你可以使用 `MenuBar()` 可组合项为特定窗口创建菜单栏。`MenuBar()` 在 `Window()` 可组合项的作用域中可用，因此每个窗口都可以拥有自己的菜单栏。

> 本指南中的示例均为可运行的桌面应用。要尝试运行：
> 1. 使用 [Kotlin Multiplatform IDE 插件](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)或[在线向导](https://kmp.jetbrains.com/?android=true&desktop=true&includeTests=false)创建一个 Compose Multiplatform 项目。
> 2. 打开桌面入口点文件。例如 `desktopApp/src/main/kotlin/com/example/my_desktop_app/main.kt`。
> 3. 将其内容替换为所提供的示例。
>
{style="note" id="desktop-snippets-intro"}

你可以在 `MenuBar()` 中使用以下组件：

* `Menu()` – 菜单或子菜单
* `Item()` – 可点击的菜单项
* `CheckboxItem()` – 带有复选框的菜单项
* `RadioButtonItem()` – 带有单选按钮的菜单项
* `Separator()` – 分隔各组菜单项的水平分割线

菜单项和菜单均接受一个 `mnemonic` 形参，这是一个与 <shortcut>Alt</shortcut> 同时按下时可打开菜单或触发该菜单项的字符。如果该字符出现在文本中，其首次出现的位置会带有下划线。
菜单项还接受一个 `shortcut` 形参 – 即无需在菜单中导航即可触发该操作的 `KeyShortcut`。

> 在 `KeyShortcut` 中设置 `ctrl = true` 将始终映射到 <shortcut>Ctrl</shortcut>（包括在 macOS 上）。
> 若要为 macOS 标准快捷键使用 <shortcut>⌘</shortcut>，请改为设置 `meta = true`。
>
{style="tip"}

菜单内容是可组合的，因此你可以在 `MenuBar()` 内部使用条件和循环来决定存在哪些菜单项。当它们读取的状态发生改变时，菜单也会相应更新。在以下示例中，仅当选中 **Advanced settings** 复选框时，**Settings** 子菜单才会存在：

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

<img src="compose-desktop-menu-bar.animated.gif" alt="Desktop menu bar" width="600" preview-src="compose-desktop-menu-bar.png"/>

在 Windows 和 Linux 上，菜单栏是窗口的一部分。在 macOS 上，当窗口处于活动状态时，它会显示在屏幕顶部的系统菜单栏中。

## 后续步骤 {id="what-s-next"}

* 了解如何向[系统托盘](compose-desktop-tray.md)添加应用程序图标和菜单。
* 探索有关[其他桌面组件](compose-desktop-components.md)的教程。