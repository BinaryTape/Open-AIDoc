[//]: # (title: トレイと通知)
<web-summary>デスクトップ向け Compose Multiplatform でシステムトレイにアプリケーションアイコンを追加し、システム通知を送信する方法について学びます。</web-summary>

デスクトップ向け Compose Multiplatform では、システムトレイにアプリケーションアイコンを追加し、そこからシステム通知を送信できます。

> このガイドの例は実行可能なデスクトップアプリです。試すには以下の手順を行ってください。
> 1. [Kotlin Multiplatform IDE プラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)または[オンラインウィザード](https://kmp.jetbrains.com/?android=true&desktop=true&includeTests=false)を使用して Compose Multiplatform プロジェクトを作成します。
> 2. デスクトップのエントリポイントファイル（例: `desktopApp/src/main/kotlin/com/example/my_desktop_app/main.kt`）を開きます。
> 3. その内容を提供されたサンプルコードに置き換えます。
>
{style="note" id="desktop-snippets-intro"}

## システムトレイ {id="system-tray"}

システムトレイにアプリケーションアイコンを追加するには、`Tray()` コンポーザブルを使用します。`Tray()` は `application()` 関数のスコープ内で利用可能なため、アプリケーションウィンドウと並べて呼び出すことも、単独で呼び出すこともできます。

`Tray()` コンポーザブルには以下のパラメータがあります。

* `icon` – トレイアイコンを描画する `Painter`。
* `menu` – トレイメニューの内容。メニューは Windows では右クリック、macOS では左クリックで開きます。項目を追加しない場合、メニューは表示されません。
* `state` – 通知の送信に使用される `TrayState`。
* `tooltip` – ユーザーがアイコンの上にマウスカーソルを置いたときに表示されるヒント。
* `onAction` – アイコンをクリックしたときにトリガーされるアクション。Windows ではダブルクリック、macOS では右クリックです。

以下の例では、トレイに3つのメニュー項目を持つアプリケーションアイコンを作成します。
* **Increment value** は、ウィンドウに表示される状態を変更します。
* **Send notification** は、システム通知を送信します。
* **Exit** は、アプリケーションを終了します。

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
            // ウィンドウのコンテンツ:
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

すべてのデスクトップ環境にシステムトレイがあるわけではありません。プラットフォームがトレイをサポートしていない場合、`Tray()` は例外をスローする代わりに標準エラー出力にエラーを出力します。アプリケーションでトレイ関連のオプションを表示する前に、`isTraySupported` プロパティを確認してください。

### ウィンドウなしのトレイ {id="tray-without-a-window"}

トレイアイコンを持つために、アプリケーションに必ずしもウィンドウが必要なわけではありません。`Tray()` 関数のみが呼び出された場合、アプリケーションは完全にシステムトレイ内だけで実行されます。

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

閉じるウィンドウが存在しないため、メニュー項目から `exitApplication()` を呼び出す必要があります。

## 通知 {id="notifications"}

システム通知を送信するには、[システムトレイの例](#system-tray)のように、`rememberNotification()` で通知を作成し、`TrayState.sendNotification()` に渡します。通知は `Tray()` コンポーザブルに渡された `TrayState` を介して配信されます。状態がトレイに関連付けられていない場合、通知は失われます。

通知は、タイトル、メッセージ、および通知のアイコンとサウンドを定義するタイプで構成されます。利用可能なタイプは、`None`（デフォルトオプション）、`Info`、`Warning`、`Error` です。

アイコンとサウンドに使用される特定のアセットは、プラットフォームによって異なります。

> macOS で通知をテストするには、アプリがパッケージ化されている必要があります。パッケージ化されていない場合、通知は表示されません。
>
{style="note"}

## 次のステップ {id="what-s-next"}

* ウィンドウに[メニューバー](compose-desktop-menu-bar.md)を追加する方法を学ぶ。
* [その他のデスクトップコンポーネント](compose-desktop-components.md)に関するチュートリアルを確認する。