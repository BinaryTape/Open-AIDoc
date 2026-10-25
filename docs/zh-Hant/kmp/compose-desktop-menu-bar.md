[//]: # (title: 選單列)
<web-summary>了解如何使用 Compose Multiplatform 桌面版為特定視窗建立選單列。</web-summary>

你可以使用 `MenuBar()` composable 為特定視窗建立選單列。`MenuBar()` 在 `Window()` composable 的作用域中可用，因此每個視窗都可以擁有自己的選單列。

> 本指南中的範例是可執行的桌面應用程式。若要嘗試執行：
> 1. 使用 [Kotlin Multiplatform IDE 外掛程式](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform) 或 [線上精靈](https://kmp.jetbrains.com/?android=true&desktop=true&includeTests=false) 建立 Compose Multiplatform 專案。
> 2. 開啟桌面入口點檔案。例如：`desktopApp/src/main/kotlin/com/example/my_desktop_app/main.kt`。
> 3. 將其內容替換為提供的範例。
>
{style="note" id="desktop-snippets-intro"}

你可以在 `MenuBar()` 中使用下列組建：

* `Menu()` – 選單或子選單
* `Item()` – 可點擊的選單項目
* `CheckboxItem()` – 帶有核取方塊的項目
* `RadioButtonItem()` – 帶有選項按鈕的項目
* `Separator()` – 分隔項目群組的水平線

項目與選單接受 `mnemonic` 參數，這是一個在與 <shortcut>Alt</shortcut> 一起按下時會開啟選單或觸發該項目的字元。若該字元出現在文字中，其首次出現處會加上底線。項目還接受 `shortcut` 參數 – 即一個無需導覽選單即可觸發操作的 `KeyShortcut`。

> 在 `KeyShortcut` 中設定 `ctrl = true` 一律會對應至 <shortcut>Ctrl</shortcut>，包括在 macOS 上。
> 若要將 <shortcut>⌘</shortcut> 用於標準 macOS 快速鍵，請改為設定 `meta = true`。
>
{style="tip"}

選單內容是可組合的（composable），因此你可以在 `MenuBar()` 內部使用條件式和迴圈來決定哪些項目存在。當它們讀取的狀態發生變更時，選單就會隨之更新。在以下範例中，**Settings** 子選單僅在選取 **Advanced settings** 核取方塊時才會存在：

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

<img src="compose-desktop-menu-bar.animated.gif" alt="桌面選單列" width="600" preview-src="compose-desktop-menu-bar.png"/>

在 Windows 與 Linux 上，選單列是視窗的一部分。在 macOS 上，當視窗處於現用狀態時，它會顯示在螢幕頂端的系統選單列中。

## 後續步驟 {id="what-s-next"}

* 了解如何將應用程式圖示與選單新增至[系統匣](compose-desktop-tray.md)。
* 探索有關[其他桌面組建](compose-desktop-components.md)的教學。