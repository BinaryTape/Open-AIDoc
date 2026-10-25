[//]: # (title: 系统托盘与通知)
<web-summary>了解如何在 Compose Multiplatform 桌面端中向系统托盘添加应用程序图标并发送系统通知。</web-summary>

在 Compose Multiplatform 桌面端中，你可以向系统托盘添加应用程序图标并通过它发送系统通知。

> 本指南中的示例均为可运行的桌面应用程序。如需试运行：
> 1. 使用 [Kotlin Multiplatform IDE 插件](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform) 或[在线向导](https://kmp.jetbrains.com/?android=true&desktop=true&includeTests=false)创建一个 Compose Multiplatform 项目。
> 2. 打开桌面端入口点文件。例如：`desktopApp/src/main/kotlin/com/example/my_desktop_app/main.kt`。
> 3. 将其内容替换为所提供的示例。
>
{style="note" id="desktop-snippets-intro"}

## 系统托盘 {id="system-tray"}

使用 `Tray()` 可组合项向系统托盘添加应用程序图标。`Tray()` 可以在 `application()` 函数的作用域内使用，因此可以与应用程序窗口一起调用，也可以单独调用。

`Tray()` 可组合项包含以下形参：

* `icon` – 绘制托盘图标的 `Painter`。
* `menu` – 托盘菜单的内容。在 Windows 上通过右键点击打开菜单，在 macOS 上则通过左键点击打开。如果不添加任何项，菜单将不会显示。
* `state` – 用于发送通知的 `TrayState`。
* `tooltip` – 当用户悬停在图标上时显示的工具提示。
* `onAction` – 点击图标触发的操作：在 Windows 上为双击，在 macOS 上为右键点击。

以下示例在托盘中创建了一个包含三个菜单项的应用程序图标：
* **Increment value** 更改窗口中显示的状态。
* **Send notification** 发送一条系统通知。
* **Exit** 关闭应用程序。

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

并非每个桌面环境都支持系统托盘。如果平台不支持托盘，`Tray()` 会向标准错误流输出错误，而不是抛出异常。在应用程序中显示与托盘相关的选项之前，请先检查 `isTraySupported` 属性。

### 无窗口托盘 {id="tray-without-a-window"}

应用程序不需要窗口也可以拥有托盘图标。如果仅调用 `Tray()` 函数，应用程序将完全在系统托盘中运行：

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

由于没有可关闭的窗口，应当从菜单项中调用 `exitApplication()`。

## 通知 {id="notifications"}

如需发送系统通知，可以使用 `rememberNotification()` 创建通知并将其传递给 `TrayState.sendNotification()`，正如[系统托盘示例](#系统托盘)中所示。通知通过传递给 `Tray()` 可组合项的 `TrayState` 进行传递。如果该状态未附加到托盘，通知将会丢失。

通知由标题、消息和类型组成，其中类型定义了通知的图标和声音。可用的类型包括 `None`（默认选项）、`Info`、`Warning` 和 `Error`。

用于图标和声音的具体资源取决于平台。

> 要在 macOS 上测试通知，必须对应用程序进行打包。否则，通知将不会显示。
>
{style="note"}

## 后续步骤 {id="what-s-next"}

* 了解如何向窗口添加[菜单栏](compose-desktop-menu-bar.md)。
* 浏览有关[其他桌面组件](compose-desktop-components.md)的教程。