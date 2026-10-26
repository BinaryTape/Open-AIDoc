[//]: # (title: 툴팁 (Tooltips))

`TooltipArea` 컴포저블을 사용하면 어떤 컴포넌트에도 툴팁을 추가할 수 있습니다. `TooltipArea`는 `Box` 컴포넌트와 유사하며 툴팁을 표시할 수 있습니다.

> 이 가이드의 예제들은 실행 가능한 데스크톱 앱입니다. 직접 사용해보려면 다음과 같이 하세요:
> 1. [Kotlin Multiplatform IDE 플러그인](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform) 또는 [온라인 마법사](https://kmp.jetbrains.com/?android=true&desktop=true&includeTests=false)를 사용하여 Compose Multiplatform 프로젝트를 생성합니다.
> 2. 데스크톱 진입점 파일을 엽니다. 예를 들면 `desktopApp/src/main/kotlin/com/example/my_desktop_app/main.kt`입니다.
> 3. 해당 파일의 내용을 제공된 예제 코드로 바꿉니다.
>
{style="note" id="desktop-snippets-intro"}

`TooltipArea` 컴포저블은 다음과 같은 주요 매개변수를 가집니다:

* `tooltip`: 툴팁의 컴포저블 콘텐츠입니다.
* `tooltipPlacement`: 툴팁의 위치를 정의합니다. 기준 앵커(마우스 커서 또는 컴포넌트), 오프셋 및 정렬 방식을 지정할 수 있습니다.
* `delayMillis`: 툴팁이 표시되기까지 걸리는 시간(밀리초 단위)입니다. 기본값은 500ms입니다.

다음 예제는 각각 `TooltipArea`로 감싸진 버튼 목록을 포함하는 간단한 창을 만드는 방법을 보여줍니다. 버튼 위로 마우스 커서를 올리면 버튼의 이름이 적힌 툴팁이 나타납니다.
`jvmMain/kotlin`에 있는 `main.kt` 파일에 다음 코드를 추가하세요:

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
            // Wrap the button in TooltipArea
            TooltipArea(
                tooltip = {
                    // Composable tooltip content:
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
                delayMillis = 600, // In milliseconds
                tooltipPlacement = TooltipPlacement.CursorPoint(
                    alignment = Alignment.BottomEnd,
                    offset = if (index % 2 == 0) DpOffset(
                        (-16).dp,
                        0.dp
                    ) else DpOffset.Zero // Tooltip offset
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

## 다음 단계 {id="what-s-next"}

[기타 데스크톱 컴포넌트](https://github.com/JetBrains/compose-multiplatform/tree/master/tutorials#desktop)에 대한 튜토리얼을 살펴보세요.