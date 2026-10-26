[//]: # (title: Swing 互操作性)

在这里，你将了解如何在 Compose Multiplatform 应用程序中使用 Swing 组件，反之亦然；了解这种互操作性的局限性与优势，以及何时应该或不应该采用这种方法。

Compose Multiplatform 与 Swing 之间的互操作性旨在帮助你：
* 简化并平稳推进 Swing 应用程序向 Compose Multiplatform 的迁移过程。
* 在没有可用的 Compose 对应组件时，使用 Swing 组件增强 Compose Multiplatform 应用程序。

在很多情况下，直接在 Compose Multiplatform 中实现缺失的组件（并将其贡献给社区），要比在 Compose Multiplatform 应用程序中使用 Swing 组件更有效。

> 本指南中的示例均为可运行的桌面应用程序。如需试用：
> 1. 使用 [Kotlin Multiplatform IDE 插件](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform) 或 [在线向导](https://kmp.jetbrains.com/?android=true&desktop=true&includeTests=false) 创建一个 Compose Multiplatform 项目。
> 2. 打开桌面端入口点文件。例如 `desktopApp/src/main/kotlin/com/example/my_desktop_app/main.kt`。
> 3. 将其内容替换为所提供的示例代码。
>
{style="note" id="desktop-snippets-intro"}

## Swing 互操作用例与局限性 {id="swing-interop-use-cases-and-limitations"}

### Swing 应用中的 Compose Multiplatform 组件 {id="compose-multiplatform-component-in-a-swing-app"}

第一种用例是将 Compose Multiplatform 组件添加到 Swing 应用程序中。
你可以使用 `ComposePanel` Swing 组件来呈现应用程序的 Compose Multiplatform 部分。
从 Swing 的角度来看，`ComposePanel` 就是另一个普通的 Swing 组件，并会对其进行相应的处理。

请注意，所有 Compose Multiplatform 组件（包括弹出窗口、工具提示和上下文菜单）都在 Swing 的 `ComposePanel` 内呈现，并在其内部进行定位和调整大小。
因此，建议考虑将这些组件替换为基于 Swing 的实现，或者尝试两项新的实验性功能：

[离屏渲染（Off-screen rendering）](#experimental-off-screen-rendering)
: 允许直接在 Swing 组件上呈现 Compose 面板。

[为弹出窗口、对话框和下拉菜单提供独立的平台视图](#experimental-separate-views-for-popups)
: 弹出窗口不再受限于初始可组合画布或应用程序窗口。

以下是使用 `ComposePanel` 的几种场景：
* 在应用程序中嵌入动画对象或由动画对象组成的整个面板（例如，表情符号选择器或带有事件动画回应的工具栏）。
* 在应用程序中实现交互式呈现区域（如图形或信息图表），使用 Compose Multiplatform 可以更轻松、便捷地完成这一工作。
* 在应用程序中集成复杂的呈现区域（甚至可能带有动画效果），这在 Compose Multiplatform 中更为简单。
* 替换基于 Swing 的应用程序中复杂的用户界面部分，因为 Compose Multiplatform 提供了便捷的组件布局系统，以及丰富的内置组件和快速创建自定义组件的选项。

### Compose Multiplatform 应用中的 Swing 组件 {id="swing-component-in-a-compose-multiplatform-app"}

另一种用例是当你需要使用某个在 Swing 中存在但在 Compose Multiplatform 中没有对应物的组件。
如果从头开始创建新的实现过于耗时，可以尝试使用 `SwingPanel`。`SwingPanel` 函数作为一个包装器，负责管理放置在 Compose Multiplatform 组件之上的 Swing 组件的大小、位置和呈现。

请注意，`SwingPanel` 内的 Swing 组件将始终分层位于 Compose Multiplatform 组件之上，
因此放置在 `SwingPanel` 下方的任何内容都会被该 Swing 组件裁剪掉。为了避免裁剪和重叠问题，
可以尝试[实验性互操作混合（experimental interop blending）](#experimental-interop-blending)。如果仍然存在渲染错误的风险，
你可以相应地重新设计 UI，或者避免使用 `SwingPanel` 并尝试自己实现缺失的组件，为技术生态做出贡献。

以下是使用 `SwingPanel` 的场景：
* 你的应用程序不需要弹出窗口、工具提示或上下文菜单，或者至少它们不在你的 `SwingPanel` 内部。
* `SwingPanel` 保持在固定位置。在这种情况下，可以降低 Swing 组件位置变化时出现画面失真和瑕疵的风险。
不过，该条件并非强制性的，应根据具体情况进行测试。
  
Compose Multiplatform 和 Swing 可以双向组合，从而实现灵活的 UI 设计。你可以将 `SwingPanel` 放在 `ComposePanel` 内部，
而该 `ComposePanel` 还可以再嵌套在另一个 `SwingPanel` 内部。
但在使用此类嵌套组合之前，请充分考虑潜在的渲染瑕疵问题。
有关代码示例，请参阅[嵌套 `SwingPanel` 和 `ComposePanel` 的布局](#layout-with-nested-swing-and-compose-multiplatform-components)。

## 在 Swing 应用程序中使用 Compose Multiplatform {id="use-compose-multiplatform-in-a-swing-application"}

`ComposePanel` 允许你在基于 Swing 的应用程序中使用 Compose Multiplatform 构建 UI。
将 `ComposePanel` 实例添加到 Swing 布局中，并在 `setContent` 中定义组合（Composition）：

```kotlin
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.Button
import androidx.compose.material.Surface
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.awt.ComposePanel
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import java.awt.BorderLayout
import java.awt.Dimension
import javax.swing.JButton
import javax.swing.JFrame
import javax.swing.SwingUtilities
import javax.swing.WindowConstants

val northClicks = mutableStateOf(0)
val westClicks = mutableStateOf(0)
val eastClicks = mutableStateOf(0)

fun main() = SwingUtilities.invokeLater {
    val window = JFrame()

    // 创建 ComposePanel
    val composePanel = ComposePanel()
    window.defaultCloseOperation = WindowConstants.EXIT_ON_CLOSE
    window.title = "SwingComposeWindow"

    window.contentPane.add(actionButton("NORTH", action = { northClicks.value++ }), BorderLayout.NORTH)
    window.contentPane.add(actionButton("WEST", action = { westClicks.value++ }), BorderLayout.WEST)
    window.contentPane.add(actionButton("EAST", action = { eastClicks.value++ }), BorderLayout.EAST)
    window.contentPane.add(
        actionButton(
            text = "SOUTH/REMOVE COMPOSE",
            action = {
                window.contentPane.remove(composePanel)
            }
        ),
        BorderLayout.SOUTH
    )

    // 将 ComposePanel 添加到 JFrame
    window.contentPane.add(composePanel, BorderLayout.CENTER)

    // 设置内容
    composePanel.setContent {
        ComposeContent()
    }

    window.setSize(800, 600)
    window.isVisible = true
}

fun actionButton(text: String, action: () -> Unit): JButton {
    val button = JButton(text)
    button.toolTipText = "Tooltip for $text button."
    button.preferredSize = Dimension(100, 100)
    button.addActionListener { action() }
    return button
}

@Composable
fun ComposeContent() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Row {
            Counter("West", westClicks)
            Spacer(modifier = Modifier.width(25.dp))
            Counter("North", northClicks)
            Spacer(modifier = Modifier.width(25.dp))
            Counter("East", eastClicks)
        }
    }
}

@Composable
fun Counter(text: String, counter: MutableState<Int>) {
    Surface(
        modifier = Modifier.size(130.dp, 130.dp),
        color = Color(180, 180, 180),
        shape = RoundedCornerShape(4.dp)
    ) {
        Column {
            Box(
                modifier = Modifier.height(30.dp).fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                Text(text = "${text}Clicks: ${counter.value}")
            }
            Spacer(modifier = Modifier.height(25.dp))
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Button(onClick = { counter.value++ }) {
                    Text(text = text, color = Color.White)
                }
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="composePanel.setContent { ComposeContent() }"}

<img src="compose-desktop-swing-composepanel.animated.gif" alt="IntegrationWithSwing" preview-src="compose-desktop-swing-composepanel.png" width="799"/>

### 实验性离屏渲染 {id="experimental-off-screen-rendering"}

一种实验性模式允许直接在 Swing 组件上呈现 `ComposePanel`。
这样可以防止在显示、隐藏或调整 `ComposePanel` 大小时出现过渡渲染问题。
它还可以在组合 Swing 组件和 Compose 面板时实现正确的层叠：Swing 组件可以显示在 `ComposePanel` 之上或下方。
然而，与默认的 Skia 渲染相比，这可能会带来性能损失，并且该损失会随着面板尺寸的增大而增加。

此模式仅影响 `ComposePanel` 组件。
目前，`ComposeWindow` 或 `ComposeDialog` 还没有相应的设置。

> 离屏渲染属于[实验性功能](supported-platforms.md#compose-multiplatform-ui-framework-stability-levels)，
> 应仅用于评估目的。
>
{style="warning"}

要为特定的 `ComposePanel` 启用离屏渲染，请在创建时传入 `RenderSettings.SwingGraphics` 值：

```kotlin
val composePanel = ComposePanel(renderSettings = RenderSettings.SwingGraphics)
```

要为项目中的每个 `ComposePanel` 默认启用离屏渲染，请使用 `compose.swing.render.on.graphics` 特性标志：

* 在启动时将该标志指定为命令行 JVM 参数：

    ```shell
    -Dcompose.swing.render.on.graphics=true
    ```
* 或者在入口点将其作为实参传递给 `System.setProperty()` 函数：

    ```kotlin
    fun main() {
        System.setProperty("compose.swing.render.on.graphics", "true")
        ...
    }
    ```

### 为弹出窗口提供独立视图（实验性） {id="experimental-separate-views-for-popups"}

弹出元素（如工具提示和下拉菜单）不受初始可组合画布或应用程序窗口的限制，这一点有时非常重要。例如，当可组合视图未占据全屏但需要弹出一个提示对话框时。

> 为弹出窗口创建独立视图或窗口属于[实验性功能](supported-platforms.md#compose-multiplatform-ui-framework-stability-levels)。需要选择启用（Opt-in，详见下文），
> 且仅应将其用于评估目的。
>
{style="warning"}

要在桌面端为弹出窗口创建独立视图或窗口，请设置 `compose.layers.type` 系统属性。支持的值包括：
* `WINDOW` 将 `Popup` 和 `Dialog` 组件创建为独立的无装饰窗口。
* `COMPONENT` 将 `Popup` 或 `Dialog` 创建为同一窗口内的独立 Swing 组件。请注意，该设置需要启用离屏渲染（参见[实验性离屏渲染](#experimental-off-screen-rendering)部分），且离屏渲染仅对 `ComposePanel` 组件生效，对全窗口应用程序无效。

请注意，弹出窗口和对话框仍然无法在其自身边界之外绘制任何内容（例如最顶层容器的阴影）。

以下是使用 `COMPONENT` 属性的代码示例：

```kotlin
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.awt.ComposePanel
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import javax.swing.JFrame
import javax.swing.JLayeredPane
import javax.swing.SwingUtilities
import javax.swing.WindowConstants

@OptIn(ExperimentalComposeUiApi::class)
fun main() = SwingUtilities.invokeLater {
    System.setProperty("compose.swing.render.on.graphics", "true")
    System.setProperty("compose.layers.type", "COMPONENT")

    val window = JFrame()
    window.defaultCloseOperation = WindowConstants.EXIT_ON_CLOSE

    val contentPane = JLayeredPane()
    contentPane.layout = null

    val composePanel = ComposePanel()
    composePanel.setBounds(200, 200, 200, 200)
    composePanel.setContent {
        ComposeContent()
    }
    
    // 对话框使用全窗口
    composePanel.windowContainer = contentPane
    contentPane.add(composePanel)

    window.contentPane.add(contentPane)
    window.setSize(800, 600)
    window.isVisible = true
}

@Composable
fun ComposeContent() {
    Box(Modifier.fillMaxSize().background(Color.Green)) {
        Dialog(onDismissRequest = {}) {
            Box(Modifier.size(100.dp).background(Color.Yellow))
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="@OptIn(ExperimentalComposeUiApi::class) fun main()"}

## 在 Compose Multiplatform 应用程序中使用 Swing {id="use-swing-in-a-compose-multiplatform-application"}

`SwingPanel` 允许你在 Compose Multiplatform 应用程序中使用 Swing 构建 UI。
使用 `SwingPanel` 的 `factory` 形参来创建 Swing 的 `JPanel`：

```kotlin
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.size
import androidx.compose.material.Button
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.awt.SwingPanel
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.singleWindowApplication
import java.awt.Component
import javax.swing.BoxLayout
import javax.swing.JButton
import javax.swing.JPanel

fun main() = singleWindowApplication(title = "SwingPanel") {
    val counter = remember { mutableStateOf(0) }

    val inc: () -> Unit = { counter.value++ }
    val dec: () -> Unit = { counter.value-- }

    Box(
        modifier = Modifier.fillMaxWidth().height(60.dp).padding(top = 20.dp),
        contentAlignment = Alignment.Center
    ) {
        Text("Counter: ${counter.value}")
    }

    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier.padding(top = 80.dp, bottom = 20.dp)
        ) {
            Button("1. Compose Button: increment", inc)
            Spacer(modifier = Modifier.height(20.dp))

            SwingPanel(
                background = Color.LightGray,
                modifier = Modifier.size(270.dp, 90.dp),
                factory = {
                    JPanel().apply {
                        layout = BoxLayout(this, BoxLayout.Y_AXIS)
                        add(actionButton("1. Swing Button: decrement", dec))
                        add(actionButton("2. Swing Button: decrement", dec))
                        add(actionButton("3. Swing Button: decrement", dec))
                    }
                }
            )

            Spacer(modifier = Modifier.height(20.dp))
            Button("2. Compose Button: increment", inc)
        }
    }
}

@Composable
fun Button(text: String = "", action: (() -> Unit)? = null) {
    Button(
        modifier = Modifier.size(270.dp, 30.dp),
        onClick = { action?.invoke() }
    ) {
        Text(text)
    }
}

fun actionButton(
    text: String,
    action: () -> Unit
): JButton {
    val button = JButton(text)
    button.alignmentX = Component.CENTER_ALIGNMENT
    button.addActionListener { action() }

    return button
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="factory = { JPanel().apply { layout = BoxLayout(this, BoxLayout.Y_AXIS)"}

<img src="compose-desktop-swingpanel.animated.gif" alt="SwingPanel" preview-src="compose-desktop-swingpanel.png" width="600"/>

### 在 Compose 状态改变时更新 Swing 组件 {id="update-swing-components-when-compose-state-changes"}

为了使 Swing 组件保持最新状态，可以提供一个 `update: (T) -> Unit` 回调，每当可组合状态发生变化或布局膨胀（inflate）时都会调用该回调。
以下代码示例演示了如何在可组合状态更改时更新 `SwingPanel` 内的 Swing 组件：

```kotlin
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.width
import androidx.compose.material.Button
import androidx.compose.material.Text
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.awt.SwingPanel
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.application
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.rememberWindowState
import java.awt.BorderLayout
import javax.swing.JPanel
import javax.swing.JLabel

val swingLabel = JLabel()

fun main() = application {
    Window(
        onCloseRequest = ::exitApplication,
        state = rememberWindowState(width = 400.dp, height = 200.dp),
        title = "SwingLabel"
    ) {
        val clicks = remember { mutableStateOf(0) }
        Column(
            modifier = Modifier.fillMaxSize().padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            SwingPanel(
                modifier = Modifier.fillMaxWidth().height(40.dp),
                factory = {
                    JPanel().apply {
                        add(swingLabel, BorderLayout.CENTER)
                    }
                },
                update = {
                    swingLabel.text = "SwingLabel clicks: ${clicks.value}"
                }
            )
            Spacer(modifier = Modifier.height(40.dp))
            Row (
                modifier = Modifier.height(40.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Button(onClick = { clicks.value++ }) {
                    Text(text = "Increment")
                }
                Spacer(modifier = Modifier.width(20.dp))
                Button(onClick = { clicks.value-- }) {
                    Text(text = "Decrement")
                }
            }
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="factory = { JPanel().apply { add(swingLabel, BorderLayout.CENTER)} }, update = {"}

<img src="compose-desktop-swinglabel.animated.gif" alt="SwingLabel" preview-src="compose-desktop-swinglabel.png" width="600"/>

### 实验性互操作混合 {id="experimental-interop-blending"}

默认情况下，使用 `SwingPanel` 包装器实现的互操作视图是矩形的，位于前景中，并且覆盖在任何 Compose Multiplatform 组件之上。为了使弹出元素更易于使用，我们引入了对互操作混合的实验性支持。

> 互操作混合属于[实验性功能](supported-platforms.md#compose-multiplatform-ui-framework-stability-levels)，
> 应仅用于评估目的。
>
{style="warning"}

要启用此实验性功能，请将 `compose.interop.blending` 系统属性设置为 `true`。
该属性必须在应用程序执行任何 Compose 代码之前启用，
因此请通过 `-Dcompose.interop.blending=true` 命令行 JVM 参数设置它，或在入口点使用 `System.setProperty()`：

```kotlin
fun main() {
    System.setProperty("compose.interop.blending", "true")
    ...
}
```

启用互操作混合后，你可以在以下用例中使用 Swing：

* **裁剪（Clipping）**。你不再受限于矩形形状：`clip` 和 `shadow` 修饰符可以与 `SwingPanel` 正常协同工作。
* **重叠（Overlapping）**。可以在 `SwingPanel` 之上绘制任何 Compose Multiplatform 内容，并照常与之进行交互。

有关详细信息和已知限制，请参阅 [GitHub 上的说明](https://github.com/JetBrains/compose-multiplatform-core/pull/915)。

## 嵌套 Swing 和 Compose Multiplatform 组件的布局 {id="layout-with-nested-swing-and-compose-multiplatform-components"}

借助互操作性，你可以双向组合 Swing 和 Compose Multiplatform：将 Swing 组件添加到 Compose Multiplatform 应用程序中，以及将 Compose Multiplatform 组件添加到 Swing 应用程序中。如果你希望嵌套多个组件并自由组合这两种方案，系统也支持此场景。

以下代码示例演示了如何将 `SwingPanel` 添加到 `ComposePanel` 中，而该 `ComposePanel` 本身又位于另一个 `SwingPanel` 内，从而构建出 Swing-Compose Multiplatform-Swing 的嵌套结构：

```kotlin
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.runtime.*
import androidx.compose.ui.awt.*
import androidx.compose.ui.*
import androidx.compose.ui.draw.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.window.*
import androidx.compose.ui.unit.*
import java.awt.BorderLayout
import java.awt.Dimension
import java.awt.Insets
import javax.swing.*
import javax.swing.border.EmptyBorder

val Gray = java.awt.Color(64, 64, 64)
val DarkGray = java.awt.Color(32, 32, 32)
val LightGray = java.awt.Color(210, 210, 210)

data class Item(
    val text: String,
    val icon: ImageVector,
    val color: Color,
    val state: MutableState<Boolean> = mutableStateOf(false)
)
val panelItemsList = listOf(
    Item(text = "Person", icon = Icons.Filled.Person, color = Color(10, 232, 162)),
    Item(text = "Favorite", icon = Icons.Filled.Favorite, color = Color(150, 232, 150)),
    Item(text = "Search", icon = Icons.Filled.Search, color = Color(232, 10, 162)),
    Item(text = "Settings", icon = Icons.Filled.Settings, color = Color(232, 162, 10)),
    Item(text = "Close", icon = Icons.Filled.Close, color = Color(232, 100, 100))
)
val itemSize = 50.dp

fun java.awt.Color.toCompose(): Color {
    return Color(red, green, blue)
}

fun main() = application {
    Window(
        onCloseRequest = ::exitApplication,
        state = rememberWindowState(width = 500.dp, height = 500.dp),
        title = "Layout"
    ) {
        Column(
            modifier = Modifier.fillMaxSize().background(color = Gray.toCompose()).padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = "Compose Area", color = LightGray.toCompose())
            Spacer(modifier = Modifier.height(40.dp))
            SwingPanel(
                background = DarkGray.toCompose(),
                modifier = Modifier.fillMaxSize(),
                factory = {
                    ComposePanel().apply {
                        setContent {
                            Box {
                                SwingPanel(
                                    modifier = Modifier.fillMaxSize(),
                                    factory = { SwingComponent() }
                                )
                                Box (
                                    modifier = Modifier.align(Alignment.TopStart)
                                        .padding(start = 20.dp, top = 80.dp)
                                        .background(color = DarkGray.toCompose())
                                ) {
                                    SwingPanel(
                                        modifier = Modifier.size(itemSize * panelItemsList.size, itemSize),
                                        factory = {
                                            ComposePanel().apply {
                                                setContent {
                                                    ComposeOverlay()
                                                }
                                            }
                                        }
                                    )
                                }
                            }
                        }
                    }
                }
            )
        }
    }
}

fun SwingComponent() : JPanel {
    return JPanel().apply {
        background = DarkGray
        border = EmptyBorder(20, 20, 20, 20)
        layout = BorderLayout()
        add(
            JLabel("TextArea Swing Component").apply {
                foreground = LightGray
                verticalAlignment = SwingConstants.NORTH
                horizontalAlignment = SwingConstants.CENTER
                preferredSize = Dimension(40, 160)
            },
            BorderLayout.NORTH
        )
        add(
            JTextArea().apply {
                background = LightGray
                lineWrap = true
                wrapStyleWord = true
                margin = Insets(10, 10, 10, 10)
                text = "The five boxing wizards jump quickly. " +
                "Crazy Fredrick bought many very exquisite opal jewels. " +
                "Pack my box with five dozen liquor jugs.\n" +
                "Cozy sphinx waves quart jug of bad milk. " +
                "The jay, pig, fox, zebra and my wolves quack!"
            },
            BorderLayout.CENTER
        )
    }
}

@Composable
fun ComposeOverlay() {
    Box(
        modifier = Modifier.fillMaxSize().
            background(color = DarkGray.toCompose()),
        contentAlignment = Alignment.Center
    ) {
        Row(
            modifier = Modifier.background(
                shape = RoundedCornerShape(4.dp),
                color = Color.DarkGray.copy(alpha = 0.5f)
            )
        ) {
            for (item in panelItemsList) {
                SelectableItem(
                    text = item.text,
                    icon = item.icon,
                    color = item.color,
                    selected = item.state
                )
            }
        }
    }
}

@Composable
fun SelectableItem(
    text: String,
    icon: ImageVector,
    color: Color,
    selected: MutableState<Boolean>
) {
    Box(
        modifier = Modifier.size(itemSize)
            .clickable { selected.value = !selected.value },
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier.alpha(if (selected.value) 1.0f else 0.5f),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(modifier = Modifier.size(32.dp), imageVector = icon, contentDescription = null, tint = color)
            Text(text = text, color = Color.White, fontSize = 10.sp)
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="fun SwingComponent() : JPanel { return JPanel().apply {"}

<img src="compose-desktop-swing-layout.animated.gif" alt="Swing layout" preview-src="compose-desktop-swing-layout.png" width="600"/>

## 后续步骤 {id="what-s-next"}

浏览关于[其他桌面端特有组件](https://github.com/JetBrains/compose-multiplatform/tree/master/tutorials#desktop)的教程。