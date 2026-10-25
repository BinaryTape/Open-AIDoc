[//]: # (title: 工具提示)

你可以使用 `TooltipArea` 可组合项为任何组件添加工具提示。`TooltipArea` 与 `Box` 组件类似，可以显示工具提示。

> 本指南中的示例是可运行的桌面应用。若要尝试其中一个：
> 1. 使用 [Kotlin Multiplatform IDE 插件](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)或[在线向导](https://kmp.jetbrains.com/?android=true&desktop=true&includeTests=false)创建一个 Compose Multiplatform 项目。
> 2. 打开桌面入口点文件。例如：`desktopApp/src/main/kotlin/com/example/my_desktop_app/main.kt`。
> 3. 将其内容替换为所提供的示例。
>
{style="note" id="desktop-snippets-intro"}

`TooltipArea` 可组合项具有以下主要形参：

* `tooltip`，工具提示的可组合内容。
* `tooltipPlacement`，定义工具提示的位置。你可以指定锚点（鼠标光标或组件）、偏移量以及对齐方式。
* `delayMillis`，显示工具提示前的等待时间（以毫秒为单位）。默认值为 500 ms。

以下示例展示了如何创建一个简单的窗口，其中包含一系列包裹在 `TooltipArea` 中的按钮。当你将光标悬停在按钮上时，将出现带有该按钮名称的工具提示。
将此代码添加到 `jvmMain/kotlin` 目录下的 `main.kt` 文件中：

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
            // 将按钮包裹在 TooltipArea 中
            TooltipArea(
                tooltip = {
                    // 工具提示的可组合内容：
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
                delayMillis = 600, // 以毫秒为单位
                tooltipPlacement = TooltipPlacement.CursorPoint(
                    alignment = Alignment.BottomEnd,
                    offset = if (index % 2 == 0) DpOffset(
                        (-16).dp,
                        0.dp
                    ) else DpOffset.Zero // 工具提示偏移量
                )
            ) {
                Button(onClick = {}) { Text(text = name) }
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="TooltipArea(tooltip = { Surface( "}

<img src="compose-desktop-tooltips.animated.gif" alt="工具提示" width="288" preview-src="compose-desktop-tooltips.png"/>

## 后续步骤 {id="what-s-next"}

浏览有关[其他桌面组件](https://github.com/JetBrains/compose-multiplatform/tree/master/tutorials#desktop)的教程。