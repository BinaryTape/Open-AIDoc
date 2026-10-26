[//]: # (title: 系統匣與通知)
<web-summary>了解如何在 Compose Multiplatform 桌面版中將應用程式圖示新增至系統匣，並透過它發送系統通知。</web-summary>

在 Compose Multiplatform 桌面版中，您可以將應用程式圖示新增至系統匣，並透過它發送系統通知。

> 本指南中的範例皆為可執行的桌面應用程式。若要親自嘗試：
> 1. 使用 [Kotlin Multiplatform IDE 外掛程式](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)或[線上精靈](https://kmp.jetbrains.com/?android=true&desktop=true&includeTests=false)建立 Compose Multiplatform 專案。
> 2. 開啟桌面版入口點檔案。例如 `desktopApp/src/main/kotlin/com/example/my_desktop_app/main.kt`。
> 3. 將其內容替換為所提供的範例。
>
{style="note" id="desktop-snippets-intro"}

## 系統匣 {id="system-tray"}

使用 `Tray()` 可組合項將應用程式圖示新增至系統匣。`Tray()` 在 `application()` 函式的作用域中可用，因此可以在應用程式視窗旁邊呼叫，也可以單獨呼叫。

`Tray()` 可組合項具有以下參數：

* `icon` – 繪製系統匣圖示的 `Painter`。
* `menu` – 系統匣功能表的內容。此功能表在 Windows 上透過按一下右鍵開啟，在 macOS 上則透過按一下左鍵開啟。若未新增任何項目，則功能表不會顯示。
* `state` – 用於發送通知的 `TrayState`。
* `tooltip` – 當使用者將游標懸停在圖示上時顯示的提示。
* `onAction` – 點擊圖示時觸發的操作：在 Windows 上為按兩下，在 macOS 上為按一下右鍵。

以下範例在系統匣中建立一個具有三個功能表項目的應用程式圖示： 
* **Increment value** 會變更視窗中顯示的狀態。
* **Send notification** 會發送系統通知。
* **Exit** 會關閉應用程式。

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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.window.Tray
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application
import androidx.compose.ui.window.rememberNotification
import androidx.compose.ui.window.rememberTrayState

fun main() = application {
    var count by remember { mutableStateOf(0) }
    var isOpen by remember { mutableStateOf(true) }

    if (isOpen) {
        val trayState = rememberTrayState()
        val notification = rememberNotification("Notification", "Message from MyApp!")

        Tray(
            state = trayState,
            icon = TrayIcon,
            menu = {
                Item(
                    "Increment value",
                    onClick = {
                        count++
                    }
                )
                Item(
                    "Send notification",
                    onClick = {
                        trayState.sendNotification(notification)
                    }
                )
                Item(
                    "Exit",
                    onClick = {
                        isOpen = false
                    }
                )
            }
        )

        Window(
            onCloseRequest = {
                isOpen = false
            },
            icon = MyAppIcon
        ) {
            // Window content:
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Text(text = "Value: $count")
            }
        }
    }
}

object MyAppIcon : Painter() {
    override val intrinsicSize = Size(256f, 256f)

    override fun DrawScope.onDraw() {
        drawOval(Color.Green, Offset(size.width / 4, 0f), Size(size.width / 2f, size.height))
        drawOval(Color.Blue, Offset(0f, size.height / 4), Size(size.width, size.height / 2f))
        drawOval(Color.Red, Offset(size.width / 4, size.height / 4), Size(size.width / 2f, size.height / 2f))
    }
}

object TrayIcon : Painter() {
    override val intrinsicSize = Size(256f, 256f)

    override fun DrawScope.onDraw() {
        drawOval(Color(0xFFFFA500))
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Tray(state = trayState, icon = TrayIcon, menu = { Item( "}

<img src="compose-desktop-tray.animated.gif" alt="Tray menu and notification" width="600" preview-src="compose-desktop-tray.png"/>

並非每個桌面環境都有系統匣。若平台不支援系統匣，`Tray()` 會將錯誤輸出至標準錯誤串流，而非擲出例外。在應用程式中顯示與系統匣相關的選項之前，請先檢查 `isTraySupported` 屬性。

### 無視窗的系統匣 {id="tray-without-a-window"}

應用程式不需要視窗即可擁有系統匣圖示。若僅呼叫 `Tray()` 函式，應用程式將完全在系統匣中執行：

```kotlin
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.window.Tray
import androidx.compose.ui.window.application

fun main() = application {
    Tray(
        icon = TrayIcon,
        menu = {
            Item(
                "Exit",
                onClick = ::exitApplication
            )
        }
    )
}

object TrayIcon : Painter() {
    override val intrinsicSize = Size(256f, 256f)

    override fun DrawScope.onDraw() {
        drawOval(Color(0xFFFFA500))
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="Tray(icon = TrayIcon, menu = { Item( "}

因為沒有可關閉的視窗，所以應從功能表項目中呼叫 `exitApplication()`。

## 通知 {id="notifications"}

若要發送系統通知，請使用 `rememberNotification()` 建立通知，並傳遞給 `TrayState.sendNotification()`，如[系統匣範例](#system-tray)所示。通知會透過傳遞給 `Tray()` 可組合項的 `TrayState` 傳遞。若該狀態未附加至系統匣，通知將會遺失。

通知由標題、訊息與型別組成，其中型別定義了通知的圖示與音效。可用的型別有 `None`（預設選項）、`Info`、`Warning` 和 `Error`。

用於圖示和音效的具體資源取決於平台。

> 若要在 macOS 上測試通知，應用程式必須經過打包。否則將不會顯示通知。
>
{style="note"}

## 接續閱讀 {id="what-s-next"}

* 了解如何為視窗新增[功能表列](compose-desktop-menu-bar.md)。
* 探索有關[其他桌面組建](compose-desktop-components.md)的教學。