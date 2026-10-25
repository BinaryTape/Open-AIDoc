[//]: # (title: ツールチップ)

`TooltipArea` コンポーザブルを使用すると、任意のコンポーネントにツールチップを追加できます。`TooltipArea` は `Box` コンポーネントに似ており、ツールチップを表示できます。

> このガイドの例は実行可能なデスクトップアプリです。実際に試すには：
> 1. [Kotlin Multiplatform IDE プラグイン](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform) または [オンラインウィザード](https://kmp.jetbrains.com/?android=true&desktop=true&includeTests=false) を使用して、Compose Multiplatform プロジェクトを作成します。
> 2. デスクトップのエントリポイントファイルを開きます。例：`desktopApp/src/main/kotlin/com/example/my_desktop_app/main.kt`。
> 3. その内容を提供されているサンプルコードに置き換えます。
>
{style="note" id="desktop-snippets-intro"}

`TooltipArea` コンポーザブルには、主に以下のパラメータがあります。

* `tooltip`: ツールチップのコンポーザブルコンテンツ。
* `tooltipPlacement`: ツールチップの位置を定義します。アンカー（マウスカーソルまたはコンポーネント）、オフセット、配置を指定できます。
* `delayMillis`: ツールチップが表示されるまでの待機時間（ミリ秒単位）。デフォルト値は 500 ms です。

以下の例は、それぞれが `TooltipArea` でラップされたボタンのリストを含むシンプルなウィンドウを作成する方法を示しています。ボタンの上にカーソルを置くと、ボタンの名前が記載されたツールチップが表示されます。このコードを `jvmMain/kotlin` の `main.kt` ファイルに追加してください。

```kotlin
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.TooltipArea
import androidx.compose.foundation.TooltipPlacement
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.Button
import androidx.compose.material.Surface
import androidx.compose.material.Text
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.DpOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.WindowState
import androidx.compose.ui.window.singleWindowApplication

@OptIn(ExperimentalFoundationApi::class)
fun main() = singleWindowApplication(
    WindowState(width = 300.dp, height = 350.dp),
    title = "Tooltip Example"
) {
    val buttons = listOf("Button A", "Button B", "Button C", "Button D", "Button E", "Button F")
    Column(Modifier.fillMaxSize(), Arrangement.spacedBy(5.dp)) {
        buttons.forEachIndexed { index, name ->
            // ボタンを TooltipArea でラップ
            TooltipArea(
                tooltip = {
                    // ツールチップのコンポーザブルコンテンツ:
                    Surface(
                        modifier = Modifier.shadow(4.dp),
                        color = Color(255, 255, 210),
                        shape = RoundedCornerShape(4.dp)
                    ) {
                        Text(
                            text = "Tooltip for $name",
                            modifier = Modifier.padding(10.dp)
                        )
                    }
                },
                modifier = Modifier.padding(start = 40.dp),
                delayMillis = 600, // ミリ秒単位
                tooltipPlacement = TooltipPlacement.CursorPoint(
                    alignment = Alignment.BottomEnd,
                    offset = if (index % 2 == 0) DpOffset(
                        (-16).dp,
                        0.dp
                    ) else DpOffset.Zero // ツールチップのオフセット
                )
            ) {
                Button(onClick = {}) { Text(text = name) }
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="TooltipArea(tooltip = { Surface( "}

<img src="compose-desktop-tooltips.animated.gif" alt="Tooltips" width="288" preview-src="compose-desktop-tooltips.png"/>

## 次のステップ {id="what-s-next"}

[その他のデスクトップコンポーネント](https://github.com/JetBrains/compose-multiplatform/tree/master/tutorials#desktop)に関するチュートリアルも参照してください。