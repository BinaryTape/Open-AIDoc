[//]: # (title: メニューバー)
<web-summary>デスクトップ向け Compose Multiplatform で特定のウィンドウ用のメニューバーを作成する方法を学びます。</web-summary>

`MenuBar()` コンポーザブルを使用すると、特定のウィンドウ用のメニューバーを作成できます。`MenuBar()` は `Window()` コンポーザブルのスコープ内で利用可能なため、ウィンドウごとに独自のメニューバーを持たせることができます。

> このガイドのサンプルは実行可能なデスクトップアプリです。試すには:
> 1. [Kotlin Multiplatform IDE プラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)または[オンラインウィザード](https://kmp.jetbrains.com/?android=true&desktop=true&includeTests=false)を使用して Compose Multiplatform プロジェクトを作成します。
> 2. デスクトップのエントリポイントファイルを開きます（例: `desktopApp/src/main/kotlin/com/example/my_desktop_app/main.kt`）。
> 3. その内容を提示されているサンプルに置き換えます。
>
{style="note" id="desktop-snippets-intro"}

`MenuBar()` では以下のコンポーネントを使用できます。

* `Menu()` – メニューまたはサブメニュー
* `Item()` – クリック可能なメニュー項目
* `CheckboxItem()` – チェックボックス付きの項目
* `RadioButtonItem()` – ラジオボタン付きの項目
* `Separator()` – 項目のグループを区切る水平線

項目とメニューは `mnemonic` パラメータを受け取ります。これは <shortcut>Alt</shortcut> と一緒に押したときにメニューを開いたり項目をトリガーしたりする文字です。その文字がテキストに含まれている場合、最初に出現する文字に下線が引かれます。また、項目は `shortcut` パラメータも受け取ります。これはメニューを開いて辿ることなくアクションをトリガーする `KeyShortcut` です。

> `KeyShortcut` で `ctrl = true` を設定すると、macOS を含め、常に <shortcut>Ctrl</shortcut> にマッピングされます。macOS の標準ショートカットで <shortcut>⌘</shortcut> を使用する場合は、代わりに `meta = true` を設定してください。
>
{style="tip"}

メニューのコンテンツはコンポーザブルであるため、`MenuBar()` の中で条件分岐やループを使用して、どの項目が存在するかを決定できます。読み取っている状態（State）が変化すると、メニューが更新されます。次の例では、**Advanced settings** チェックボックスが選択されている間だけ **Settings** サブメニューが表示されます。

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

Windows および Linux では、メニューバーはウィンドウの一部になります。macOS では、ウィンドウがアクティブなときに画面上部のシステムメニューバーに表示されます。

## 次のステップ {id="what-s-next"}

* [システムトレイ](compose-desktop-tray.md)にアプリケーションアイコンやメニューを追加する方法を学びます。
* [その他のデスクトップコンポーネント](compose-desktop-components.md)に関するチュートリアルを確認してください。