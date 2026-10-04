[//]: # (title: 完全共享代码：时区选择器应用)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

本教程重点介绍如何在各平台之间尽可能多地共享代码：
UI 在通用代码中使用 Compose Multiplatform 实现，
功能则基于多平台库。
如需查看仅共享逻辑而保留原生 UI 的示例，请参阅[原生 UI：REST API 请求的共享逻辑](multiplatform-upgrade-app.md)。

你将创建一个应用程序，用户可以在其中选择一个国家以查看该国首都的时间。
该应用将在下拉菜单中加载并显示图像，并使用包含事件、样式、主题和修饰符（modifier）的典型 Compose 布局。

要从向导生成的项目实现最终效果，你将：

1. [实现基本的 Compose UI 布局](#implement-the-basic-layout)
2. [体验 Compose Hot Reload](#use-compose-hot-reload-to-quickly-iterate-on-the-ui)
3. [添加用于时间计算的多平台库依赖项](#add-the-kotlinx-datetime-dependency)
4. 组合应用：
   * [支持用户输入](#support-user-input)
   * [添加并导入图像资源](#introduce-images)

由于代码几乎完全共享，本教程有助于同时为所有受支持的平台创建演示应用程序。
但也正因如此，你可以自由挑选自己感兴趣的平台。

> 项目的最终状态可在我们的 [GitHub 仓库](https://github.com/kotlin-hands-on/get-started-with-cm/)中找到。
>
{style="tip"}
<!-- TODO the project will be a bit different, but can be synced later -->

## 创建项目 {id="create-a-project"}

在安装了 IDE 和 Kotlin Multiplatform IDE 插件后，
创建一个新的 Compose Multiplatform 项目：

1. 在 IntelliJ IDEA 中，选择 **File | New | Project**。
2. 在左侧面板中，选择 **Kotlin Multiplatform**。
3. 在 **New Project** 窗口中指定以下字段：

    * **Name**：ComposeDemo
    * **Project ID**（用作包名）：compose.project.demo

4. 选择 **Android**、**iOS**、**Desktop** 和 **Web** 目标。
   确保为 iOS 和 web 勾选了 **Share UI** 选项。
5. 指定完所有字段和目标后，点击 **Create**。

   ![创建 Compose Multiplatform 项目](create-compose-multiplatform-project.png){width=800}

首次导入需要几分钟时间。
完成后，确保所有预检已成功完成（**View | Tool Windows | Project Environment Preflight Checks**）。

## 实现基本布局 {id="implement-the-basic-layout"}

生成的 Compose Multiplatform 项目由平台专用的应用模块和一个共享的 UI 模块组织而成。
每个应用程序模块都定义了一个入口点，用于调用共享的 `App()` 可组合项。

> 要了解共享的 UI 代码如何在不同平台上附加到系统入口点，
> 请参阅[原生应用程序入口点](compose-multiplatform-entry-points.md)。
>
{style="tip"}

在本教程中，通用 UI 代码中的所有功能更改都会无缝传播到各个应用中，
但你也会看到一些使平台设置生效所需的必要改动。

首先，在通用的 `App()` 可组合项中实现基本布局：

1. 在 `shared/src/commonMain/kotlin` 中，打开 `compose.project.demo/App.kt` 文件并将 `App()` 可组合项替换为新实现：

    ```kotlin
    // @Composable 标记可组合函数：
    // 在 Compose 中用于发出 UI 元素的函数
    @Composable
    @Preview
    fun App() {
        MaterialTheme {
            var timeAtLocation by remember { mutableStateOf("No location selected") }
   
            // 将 UI 声明为一个列（Column），
            // 在按钮上方容纳一个文本标签
            Column(
                // 基本布局改进，确保 Column() 
                // 填满所有可用空间且不与系统栏重叠
                modifier = Modifier
                    .safeContentPadding()
                    .fillMaxSize(),
            ) {
                // 声明一个观察 timeAtLocation 状态的 Text()
                Text(timeAtLocation)
                // 声明一个同样观察 timeAtLocation 状态的 Button()，
                // 但目前仅显示硬编码的时间
                Button(onClick = { timeAtLocation = "13:30" }) {
                    Text("Show Time At Location")
                }
            }
        }
    }
    ```
   
    > `remember` API 实现了 Compose 特定的状态管理。
    > 状态对象包装在 `remember()` 调用中，以便构建一次状态并在多次重组（composition）之间保留它。
    > 当状态的值发生变化时，任何观察它的可组合项都会被重新调用并重新绘制。
    > 这称为一次_重组（recomposition）_。
    >
    > 如需深入了解，请参阅 Jetpack Compose 文档中的[状态管理](https://developer.android.com/develop/ui/compose/state)。  
   
2. 在 Android 和 iOS 上运行应用程序：

   ![Android 和 iOS 上的新 Compose Multiplatform 应用](first-compose-project-on-android-ios-3.png){width=500}

   运行应用程序并点击按钮时，应用会显示硬编码的时间 —— 13:30。

3. 通过启动 **desktopApp [hot] 🔥** 运行配置，在桌面平台上使用 [Compose Hot Reload](compose-hot-reload.md) 运行应用程序。
   应用可以正常运行，但窗口与 UI 看起来不太协调：

   ![桌面上的新 Compose Multiplatform 应用](first-compose-project-on-desktop-3.png){width=400}

   得益于 Compose Hot Reload，你无需完全重启应用即可修复此问题。

### 使用 Compose Hot Reload 快速迭代 UI {id="use-compose-hot-reload-to-quickly-iterate-on-the-ui"}

你可以修复桌面端 UI 并验证修复结果，而无需重启应用：

1. 如下所示更新 `desktopApp/src/` 目录下的 `main.kt` 文件：

    ```kotlin
    fun main() = application {
        // 设置屏幕上窗口的
        // 初始大小和位置
        val state = rememberWindowState(
            size = DpSize(400.dp, 350.dp),
            position = WindowPosition(300.dp, 300.dp)
        )
        // 设置应用程序窗口的标题，
        // 并使用上方初始化的窗口状态
        Window(
            title = "Local Time App", 
            onCloseRequest = ::exitApplication, 
            state = state,
            // 确保窗口始终置顶，
            // 使调试和 UI 迭代更轻松
            alwaysOnTop = true
        ) {
            App()
        }
    }
    ```

2. 按照 IDE 的建议导入缺失的符号。
   对于 `rememberWindowState()` 函数，选择 `androidx.compose.ui.window` 版本。

3. 保存修改后的文件（<shortcut>⌘ S</shortcut> / <shortcut>Ctrl+S</shortcut>），即可看到应用自动更新。
   窗口应当会自动调整：

   ![Compose Hot Reload](compose-hot-reload-resize.gif)

## 添加 `kotlinx-datetime` 依赖项 {id="add-the-kotlinx-datetime-dependency"}

要处理时区和时间计算，你将结合使用 [`kotlin.time`](https://kotlinlang.org/docs/time-measurement.html) 类与多平台 [`kotlinx-datetime`](https://github.com/Kotlin/kotlinx-datetime) 库。

虽然 `kotlin.time` 作为标准库的一部分始终可用，
但 `kotlinx-datetime` 需要配置为显式依赖项。
它是一个多平台库，并且你仅在通用代码中使用它。
因此，你只需指定一次该依赖项即可，[仅 Web 平台需要额外配置](#add-the-kotlinx-datetime-dependency-for-the-web-app)。

请遵循[库的仓库](https://github.com/Kotlin/kotlinx-datetime#gradle)中的说明：

1. 打开 `gradle/libs.versions.toml` 文件并将 `kotlinx-datetime` 依赖项添加到[版本目录](https://docs.gradle.org/current/userguide/version_catalogs.html)中：

    ```toml
    [versions]
    kotlinx-datetime = "%dateTimeVersion%"

    [libraries]
    kotlinx-datetime = { module = "org.jetbrains.kotlinx:kotlinx-datetime", version.ref = "kotlinx-datetime" }
    ```

2. 打开 `shared/build.gradle.kts` 文件，并在 `commonMain` 源集配置中添加对版本目录条目的引用：

    ```kotlin
    kotlin {
        // ... 
        sourceSets {
            commonMain.dependencies {
                // ...
                implementation(libs.kotlinx.datetime)
            } 
        }
    }
    ```

3. 双击 **Shift 键**，然后查找并执行 **Sync Project with Gradle Files** 命令。

现在你可以在通用代码中使用 `kotlinx-datetime` API 了。
对于 Web 目标，你需要绕过 JavaScript 和 Wasm/JS 中时区支持的限制，
详见[下文小节](#add-the-kotlinx-datetime-dependency-for-the-web-app)。

> 有关如何管理多平台依赖项的更多通用信息，
> 请参阅[添加多平台库的依赖项](multiplatform-add-dependencies.md)。
>
{style="tip"}

### 为 Web 应用添加 `kotlinx-datetime` 依赖项 {id="add-the-kotlinx-datetime-dependency-for-the-web-app"}

对于 Web 目标，时区支持还需要 [`js-joda`](https://js-joda.github.io/js-joda/) npm 软件包：

1. 在 `webApp/build.gradle.kts` 文件中添加对该软件包的引用：

    ```kotlin
    kotlin {
        // ...
        sourceSets {
            // ...
            webMain.dependencies {
                implementation(npm("@js-joda/timezone", "%js-joda-timezone%"))
            }
        }
    }
    
    ```

   将该依赖项添加到 `webMain` 源集可使该库对 `wasmJs` 和 `js` 两个目标均可用。

2. 双击 **Shift 键**，然后查找并执行 **Sync Project with Gradle Files** 命令。

3. 在 **Terminal** 工具窗口中，运行以下命令以使用最新的依赖项版本更新 `yarn.lock` 文件：

    ```shell
    ./gradlew kotlinUpgradeYarnLock kotlinWasmUpgradeYarnLock
    ```

4. 在 `webApp/src/webMain/kotlin/.../main.kt` 文件中，使用 `@JsModule` 注解导入 `js-joda` npm 软件包。
   将 `main()` 函数替换为以下代码：

    ```kotlin
    import kotlin.js.ExperimentalWasmJsInterop
    import kotlin.js.JsModule

    @OptIn(ExperimentalWasmJsInterop::class)
    @JsModule("@js-joda/timezone")
    external object JsJodaTimeZoneModule
    
    private val jsJodaTz = JsJodaTimeZoneModule
    
    @OptIn(ExperimentalComposeUiApi::class)
    fun main() {
        ComposeViewport {
            App()
        }
    }
    ```
   {initial-collapse-state="collapsed" collapsible="true" collapsed-title='@JsModule("@js-joda/timezone")'}

> 将项目提交到版本控制时，请包含在 `kotlin-js-store` 目录下生成的 `yarn.lock` 文件。
> 保持同步的 `yarn.lock` 可确保任何构建该项目的人都使用相同版本的 JavaScript 依赖项。
>
{style="note"}

## 支持用户输入 {id="support-user-input"}

为简单起见，这里不会实现用于指定和验证时区的复杂逻辑。
该应用将提供几个国家供用户选择，并显示所选国家首都的时间：

1. 在 `shared/src/commonMain/kotlin` 中，打开 `compose.project.demo/App.kt` 文件，
   并在 `App()` 可组合项上方添加一个用于容纳国家信息的数据类：

    ```kotlin
    // 本示例中时区的简化表示
    data class Country(val name: String, val zone: TimeZone)
    
    // 硬编码受支持的国家列表
    // 及其关联的特定时区
    fun defaultCountries() = listOf(
        Country("Japan", TimeZone.of("Asia/Tokyo")),
        Country("France", TimeZone.of("Europe/Paris")),
        Country("Mexico", TimeZone.of("America/Mexico_City")),
        Country("Indonesia", TimeZone.of("Asia/Jakarta")),
        Country("Egypt", TimeZone.of("Africa/Cairo")),
    )
    ```

2. 在同一个 `App.kt` 文件中，添加一个用于计算指定时区本地时间的 `currentTimeAt()` 函数。
   为了将时间显示为 `HH:MM:SS`，该函数使用 `kotlinx-datetime` 的[格式构建器（format builder）](https://github.com/Kotlin/kotlinx-datetime#working-with-other-string-formats)来描述格式，
   将每个组成部分补零为两位数字：

    ```kotlin
    // 接收一个 TimeZone 形参来计算时间
    fun currentTimeAt(location: String, zone: TimeZone): String {
        // 描述时间格式：小时、分钟和秒，
        // 各补零至两位数并用冒号分隔
        val timeFormat = LocalTime.Format {
            hour()
            char(':')
            minute()
            char(':')
            second()
        }

        val time = Clock.System.now()
        val localTime = time.toLocalDateTime(zone).time

        return "The time in $location is ${localTime.format(timeFormat)}"
    }
    ```

3. 更新 `App()` 可组合项以使用新添加的功能：
   将国家列表显示为下拉菜单，并通过计算得出时间，而非硬编码。
   将整个 `App()` 函数替换为以下内容：

    ```kotlin
    // 现在需要一个要在下拉菜单中显示的国家列表
    @Composable
    @Preview
    fun App(countries: List<Country> = defaultCountries()) {
      MaterialTheme {
          var showCountries by remember { mutableStateOf(false) }
          var timeAtLocation by remember { mutableStateOf("No location selected") }
    
    
          // 可组合项接收 .padding() 修饰符，以便在控件之间
          // 及控件周围添加间距
          Column(
              modifier = Modifier
                  .padding(20.dp)
                  .safeContentPadding()
                  .fillMaxSize(),
          ) {
              Text(
                  timeAtLocation,
                  style = TextStyle(fontSize = 20.sp),
                  textAlign = TextAlign.Center,
                  modifier = Modifier.fillMaxWidth().align(Alignment.CenterHorizontally),
              )
              Row(modifier = Modifier.padding(start = 20.dp, top = 10.dp)) {
                  DropdownMenu(
                      // 使用 remembered 值来控制
                      // 下拉菜单的可见性
                      expanded = showCountries,
                      onDismissRequest = { showCountries = false }
                  ) {
                      // 为每个国家创建一个下拉菜单项
                      countries.forEach { (name, zone) ->
                          DropdownMenuItem(
                              text = { Text(name) },
                              onClick = {
                                  timeAtLocation = currentTimeAt(name, zone)
                                  showCountries = false
                              }
                          )
                      }
                  }
              }
    
              Button(modifier = Modifier.padding(start = 20.dp, top = 10.dp),
                  onClick = { showCountries = !showCountries }) {
                  Text("Select Location")
              }
          }
      }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="countries.forEach { (name, zone) ->"}
   
4. 按照 IDE 的建议导入缺失的符号：
   * 导入 `Row()` 时，选择 `@Composable` 版本。
   * 导入 `Clock` 时，选择 `kotlin.time` 包中的版本。

运行应用程序以查看重新设计后的版本：

<Tabs>
    <TabItem id="mobile-country-list" title="Android and iOS">
        <img src="first-compose-project-on-android-ios-7.png" alt="The country list in the Compose Multiplatform app on Android and iOS" width="500"/>
    </TabItem>
    <TabItem id="desktop-country-list" title="Desktop">
        <img src="first-compose-project-on-desktop-8.png" alt="The country list in the Compose Multiplatform app on desktop" width="350"/>
    </TabItem>
   <TabItem id="web-country-list" title="Web">
        <img src="first-compose-project-on-web-6.png" alt="The country list in the Compose Multiplatform app on the web" width="500"/>
    </TabItem>
</Tabs>

> 有关创建新模拟器或在实体设备上运行应用的详细信息，请参阅[构建并运行 Kotlin Multiplatform 应用程序](build-and-run-kmp.md)。
>
{style="note"}

## 引入图像 {id="introduce-images"}

为了更好地展示不同的国家，可以在下拉菜单的国家名称旁添加国旗图像。

为此，请将图像放置在正确的目录中，
然后添加代码来加载并显示它们：

1. 从 [Flag CDN](https://flagcdn.com/) 下载国旗图像，以匹配你已创建的国家列表。
   在当前示例中，它们分别是 [日本](https://flagcdn.com/w320/jp.png)、[法国](https://flagcdn.com/w320/fr.png)、[墨西哥](https://flagcdn.com/w320/mx.png)、[印度尼西亚](https://flagcdn.com/w320/id.png)
   和 [埃及](https://flagcdn.com/w320/eg.png)。

2. 将图像移动到 `shared/src/commonMain/composeResources/drawable` 目录，以便在所有平台上都可以使用相同的国旗：

   ![Compose Multiplatform 资源项目结构](compose-resources-project-structure.png){width=300}

3. 确保图像名称与上面显示的完全一致：Compose Multiplatform 会基于文件名生成访问器。

4. 更新 UI 代码以使用这些图像。
   将 `commonMain/kotlin/.../App.kt` 文件中的全部代码替换为以下内容：

    ```kotlin
    package compose.project.demo

    import androidx.compose.foundation.Image
    import androidx.compose.foundation.layout.Column
    import androidx.compose.foundation.layout.Row
    import androidx.compose.foundation.layout.fillMaxSize
    import androidx.compose.foundation.layout.fillMaxWidth
    import androidx.compose.foundation.layout.padding
    import androidx.compose.foundation.layout.safeContentPadding
    import androidx.compose.foundation.layout.size
    import androidx.compose.material3.Button
    import androidx.compose.material3.DropdownMenu
    import androidx.compose.material3.DropdownMenuItem
    import androidx.compose.material3.MaterialTheme
    import androidx.compose.material3.Text
    import androidx.compose.runtime.*
    import androidx.compose.ui.Alignment
    import androidx.compose.ui.Modifier
    import androidx.compose.ui.text.TextStyle
    import androidx.compose.ui.text.style.TextAlign
    import androidx.compose.ui.tooling.preview.Preview
    import androidx.compose.ui.unit.dp
    import androidx.compose.ui.unit.sp
    import kotlinx.datetime.LocalTime
    import kotlinx.datetime.TimeZone
    import kotlinx.datetime.format
    import kotlinx.datetime.format.char
    import kotlinx.datetime.toLocalDateTime
    import kotlin.time.Clock
    import composedemo.shared.generated.resources.Res
    import composedemo.shared.generated.resources.eg
    import composedemo.shared.generated.resources.fr
    import composedemo.shared.generated.resources.id
    import composedemo.shared.generated.resources.jp
    import composedemo.shared.generated.resources.mx
    import org.jetbrains.compose.resources.DrawableResource
    import org.jetbrains.compose.resources.painterResource
    
    // 该类型现在还包含对国旗图像的引用
    data class Country(val name: String, val zone: TimeZone, val image: DrawableResource)

    fun currentTimeAt(location: String, zone: TimeZone): String {
        val timeFormat = LocalTime.Format {
            hour()
            char(':')
            minute()
            char(':')
            second()
        }

        val time = Clock.System.now()
        val localTime = time.toLocalDateTime(zone).time

        return "The time in $location is ${localTime.format(timeFormat)}"
    }

    // 使用导入的 Compose Multiplatform 资源初始化列表
    // 并将其返回
    fun defaultCountries() = listOf(
        Country("Japan", TimeZone.of("Asia/Tokyo"), Res.drawable.jp),
        Country("France", TimeZone.of("Europe/Paris"), Res.drawable.fr),
        Country("Mexico", TimeZone.of("America/Mexico_City"), Res.drawable.mx),
        Country("Indonesia", TimeZone.of("Asia/Jakarta"), Res.drawable.id),
        Country("Egypt", TimeZone.of("Africa/Cairo"), Res.drawable.eg)
    )

    @Composable
    @Preview
    fun App(countries: List<Country> = defaultCountries()) {
        MaterialTheme {
            var showCountries by remember { mutableStateOf(false) }
            var timeAtLocation by remember { mutableStateOf("No location selected") }

            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .safeContentPadding()
                    .fillMaxSize(),
            ) {
                Text(
                    timeAtLocation,
                    style = TextStyle(fontSize = 20.sp),
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth().align(Alignment.CenterHorizontally),
                )
                Row(modifier = Modifier.padding(start = 20.dp, top = 10.dp)) {
                    DropdownMenu(
                        expanded = showCountries,
                        onDismissRequest = { showCountries = false }
                    ) {
                        countries.forEach { (name, zone, image) ->
                            // 每个国家在 'DropdownMenuItem' 中显示为
                            // 一个国旗（'Image()'）和一个名称（'Text()'）
                            DropdownMenuItem(
                                text = { Row(verticalAlignment = Alignment.CenterVertically) {
                                    Image(
                                        // 'painterResource()' 提供 'Image()'
                                        // 所需的 Painter 对象
                                        painterResource(image),
                                        modifier = Modifier.size(50.dp).padding(end = 10.dp),
                                        contentDescription = "$name flag"
                                    )
                                    Text(name)
                                } },
                                onClick = {
                                    timeAtLocation = currentTimeAt(name, zone)
                                    showCountries = false
                                }
                            )
                        }
                    }
                }

                Button(modifier = Modifier.padding(start = 20.dp, top = 10.dp),
                    onClick = { showCountries = !showCountries }) {
                    Text("Select Location")
                }
            }
        }
    }
    ```
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="import composedemo.shared.generated.resources.Res"}

5. 运行应用程序以查看新效果：

<Tabs>
    <TabItem id="mobile-flags" title="Android and iOS">
        <img src="first-compose-project-on-android-ios-8.png" alt="The country flags in the Compose Multiplatform app on Android and iOS" width="500"/>
    </TabItem>
    <TabItem id="desktop-flags" title="Desktop">
        <img src="first-compose-project-on-desktop-9.png" alt="The country flags in the Compose Multiplatform app on desktop" width="350"/>
    </TabItem>
   <TabItem id="web-flags" title="Web">
        <img src="first-compose-project-on-web-7.png" alt="The country flags in the Compose Multiplatform app on the web" width="500"/>
    </TabItem>
</Tabs>

> 你可以在我们的 [GitHub 仓库](https://github.com/kotlin-hands-on/get-started-with-cm/)中找到该项目的最终状态。
>
{style="note"}

## 后续步骤 {id="what-s-next"}

本教程涵盖了多平台项目的基本构建块。
若要深入了解具体内容：
* **Kotlin Multiplatform**
  * 参阅[另一篇教程](multiplatform-upgrade-app.md)，其中应用程序 UI 为原生，仅共享业务逻辑。 
  * 深入了解 [Kotlin Multiplatform 提供的代码共享机制](multiplatform-share-on-platforms.md)。 
  * 了解 [Kotlin Multiplatform 项目结构背后的原理](multiplatform-discover-project.md)。
  * 有关如何管理多平台依赖项的更多信息，请参阅[添加多平台库的依赖项](multiplatform-add-dependencies.md)。
* **Compose Multiplatform**
  * 了解 [Compose 布局基础](compose-layout.md)以及[使用 Compose 修饰符](compose-layout-modifiers.md)。
  * 了解 [Compose 中多平台资源的可能性与挑战](compose-multiplatform-resources.md)。
* **进阶项目教程**
  * [使用 Ktor 和 SQLDelight 共享数据和网络逻辑](multiplatform-ktor-sqldelight.md)。
  * [将高阶 Android 应用迁移到 KMP](migrate-from-android.md)。
* 查阅[精选多平台示例项目列表](multiplatform-samples.md)。

加入社区：

* ![Slack](slack.svg){width=25}{type="joined"} **Kotlin Slack**：获取帮助并参与有关 KMP 和 Compose Multiplatform 的讨论。
  申请[邀请](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)并加入
  [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU)
  和 [#compose](https://kotlinlang.slack.com/archives/CJLTWPH7S) 频道。
* ![GitHub](git-hub.svg){width=25}{type="joined"} **Compose Multiplatform GitHub**：Star [本仓库](https://github.com/JetBrains/compose-multiplatform)并做出贡献。
* ![Stack Overflow](stackoverflow.svg){width=25}{type="joined"} **Stack Overflow**：关注
  ["kotlin-multiplatform" 标签](https://stackoverflow.com/questions/tagged/kotlin-multiplatform)。
* ![YouTube](youtube.svg){width=25}{type="joined"} **Kotlin YouTube 频道**：订阅并观看关于 [Kotlin Multiplatform](https://www.youtube.com/playlist?list=PLlFc5cFwUnmy_oVc9YQzjasSNoAk4hk_C) 的视频。