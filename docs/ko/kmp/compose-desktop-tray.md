[//]: # (title: 트레이 및 알림)
<web-summary>데스크톱용 Compose Multiplatform에서 시스템 트레이에 애플리케이션 아이콘을 추가하고 시스템 알림을 보내는 방법을 알아봅니다.</web-summary>

데스크톱용 Compose Multiplatform에서는 시스템 트레이(system tray)에 애플리케이션 아이콘을 추가하고 이를 통해 시스템 알림(system notifications)을 보낼 수 있습니다.

## 시스템 트레이 {id="system-tray"}

`Tray()` 컴포저블을 사용하여 시스템 트레이에 애플리케이션 아이콘을 추가합니다. `Tray()`는 `application()` 함수의 스코프 내에서 사용할 수 있으므로, 애플리케이션 창 옆에 호출하거나 단독으로 호출할 수 있습니다.

`Tray()` 컴포저블은 다음과 같은 매개변수를 가집니다.

* `icon` – 트레이 아이콘을 그리는 `Painter`입니다.
* `menu` – 트레이 메뉴의 내용입니다. 윈도우(Windows)에서는 우클릭 시, macOS에서는 좌클릭 시 메뉴가 열립니다. 항목을 추가하지 않으면 메뉴가 나타나지 않습니다.
* `state` – 알림을 보내는 데 사용되는 `TrayState`입니다.
* `tooltip` – 사용자가 아이콘 위에 마우스를 올렸을 때 표시되는 힌트입니다.
* `onAction` – 아이콘을 클릭할 때 트리거되는 액션입니다. 윈도우에서는 더블 클릭, macOS에서는 우클릭 시 발생합니다.

다음 예제는 세 개의 메뉴 항목이 있는 트레이 애플리케이션 아이콘을 생성합니다. 
* **Increment value**는 창에 표시된 상태를 변경합니다.
* **Send notification**은 시스템 알림을 보냅니다.
* **Exit**은 애플리케이션을 종료합니다.

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

모든 데스크톱 환경에 시스템 트레이가 있는 것은 아닙니다. 플랫폼에서 트레이를 지원하지 않는 경우, `Tray()`는 예외를 발생시키는 대신 표준 오류 스트림에 오류를 출력합니다. 애플리케이션에서 트레이 관련 옵션을 표시하기 전에 `isTraySupported` 속성을 확인하세요.

### 창이 없는 트레이 {id="tray-without-a-window"}

애플리케이션에 트레이 아이콘을 만들기 위해 반드시 창(window)이 필요하지는 않습니다. `Tray()` 함수만 호출하면 애플리케이션이 시스템 트레이에서만 실행됩니다.

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

닫을 창이 없으므로, 메뉴 항목에서 `exitApplication()`을 호출해야 합니다.

## 알림 {id="notifications"}

시스템 알림을 보내려면 [시스템 트레이 예제](#system-tray)와 같이 `rememberNotification()`으로 알림을 생성하고 `TrayState.sendNotification()`에 전달합니다. 알림은 `Tray()` 컴포저블에 전달된 `TrayState`를 통해 전달됩니다. 상태(state)가 트레이에 연결되어 있지 않으면 알림이 유실됩니다.

알림은 제목(title), 메시지(message), 그리고 알림의 아이콘과 소리를 정의하는 유형(type)으로 구성됩니다. 사용 가능한 유형은 `None`(기본 옵션), `Info`, `Warning`, `Error`입니다.

아이콘과 소리에 사용되는 구체적인 에셋은 플랫폼에 따라 다릅니다.

> macOS에서 알림을 테스트하려면 앱을 패키징해야 합니다. 그렇지 않으면 알림이 표시되지 않습니다.
>
{style="note"}

## 다음 단계 {id="what-s-next"}

* 창에 [메뉴 바](compose-desktop-menu-bar.md)를 추가하는 방법을 알아보세요.
* [다른 데스크톱 컴포넌트](compose-desktop-components.md)에 대한 튜토리얼을 살펴보세요.