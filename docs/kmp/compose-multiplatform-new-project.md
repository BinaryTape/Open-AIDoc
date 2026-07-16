[//]: # (title: 创建你自己的应用)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
    <p>本教程使用 IntelliJ IDEA，但你也可以在 Android Studio 中进行——这两个 IDE 共享相同的核心功能和 Kotlin Multiplatform 支持。</p>
    <br/>   
    <p>这是<strong>使用共享逻辑和 UI 创建 Compose 跨平台应用</strong>教程的最后一部分。在继续之前，请确保你已经完成了之前的步骤。</p>
    <p><img src="icon-1-done.svg" width="20" alt="第一步"/> <Links href="/kmp/compose-multiplatform-create-first-app" summary="本教程使用 IntelliJ IDEA，但你也可以在 Android Studio 中进行——这两个 IDE 共享相同的核心功能和 Kotlin Multiplatform 支持。这是使用共享逻辑和 UI 创建 Compose 跨平台应用教程的第一部分。创建你的 Compose 跨平台应用 探索可组合代码 修改项目 创建你自己的应用">创建你的 Compose 跨平台应用</Links><br/>
       <img src="icon-2-done.svg" width="20" alt="第二步"/> <Links href="/kmp/compose-multiplatform-explore-composables" summary="本教程使用 IntelliJ IDEA，但你也可以在 Android Studio 中进行——这两个 IDE 共享相同的核心功能和 Kotlin Multiplatform 支持。这是使用共享逻辑和 UI 创建 Compose 跨平台应用教程的第二部分。在继续之前，请确保你已经完成了之前的步骤。创建你的 Compose 跨平台应用 探索可组合代码 修改项目 创建你自己的应用">探索可组合项代码</Links><br/>
       <img src="icon-3-done.svg" width="20" alt="第三步"/> <Links href="/kmp/compose-multiplatform-modify-project" summary="本教程使用 IntelliJ IDEA，但你也可以在 Android Studio 中进行——这两个 IDE 共享相同的核心功能和 Kotlin Multiplatform 支持。这是使用共享逻辑和 UI 创建 Compose 跨平台应用教程的第三部分。在继续之前，请确保你已经完成了之前的步骤。创建你的 Compose 跨平台应用 探索可组合代码 修改项目 创建你自己的应用">修改项目</Links><br/>
       <img src="icon-4.svg" width="20" alt="第四步"/> <strong>创建你自己的应用</strong><br/>
    </p>
</tldr>

既然你已经探索并增强了由向导创建的示例项目，你就可以利用已经掌握的概念并引入一些新概念，从头开始创建自己的应用。

你将创建一个“本地时间应用”，用户可以在其中输入国家和城市，应用将显示该国家该城市的时间。Compose 跨平台应用的所有功能都将使用跨平台库在公共代码中实现。它将在下拉菜单中加载并显示图片，并将使用事件、样式、主题、修饰符和布局。

在每个阶段，你都可以在所有三个平台（iOS、Android 和桌面端）上运行应用，或者你可以专注于最适合你需求的特定平台。

> 你可以在我们的 [GitHub 仓库](https://github.com/kotlin-hands-on/get-started-with-cm/)中找到项目的最终状态。
>
{style="note"}

## 奠定基础

首先，实现一个新的 `App` 可组合项：

1. 在 `composeApp/src/commonMain/kotlin` 中，打开 `App.kt` 文件，并用以下 `App` 可组合项替换其中的代码：

    ```kotlin
    @Composable
    @Preview
    fun App() {
        MaterialTheme {
            var timeAtLocation by remember { mutableStateOf("No location selected") }
   
            Column(
                modifier = Modifier
                    .safeContentPadding()
                    .fillMaxSize(),
            ) {
                Text(timeAtLocation)
                Button(onClick = { timeAtLocation = "13:30" }) {
                    Text("Show Time At Location")
                }
            }
        }
    }
    ```

   * 布局是一个包含两个可组合项的列。第一个是 `Text` 可组合项，第二个是 `Button`。
   * 这两个可组合项通过一个共享状态（即 `timeAtLocation` 属性）相关联。`Text` 可组合项是该状态的观察者。
   * `Button` 可组合项使用 `onClick` 事件处理程序更改状态。

2. 在 Android 和 iOS 上运行应用：

   ![Android 和 iOS 上的新 Compose 跨平台应用](first-compose-project-on-android-ios-3.png){width=500}

   当你运行应用并点击按钮时，会显示硬编码的时间。

3. 使用 [Compose 实时重新加载 (Hot Reload)](compose-hot-reload.md) 在桌面端运行应用：
   1. 在 `composeApp/src/jvmMain/kotlin/main.kt` 文件中，点击装订区域中的 **Run** 图标。
   2. 选择 **Run 'composeApp [jvm]' with Compose Hot Reload**。
   ![从装订区域运行 Compose 实时重新加载 (Hot Reload)](compose-hot-reload-gutter-run.png){width=350 style="block"}

   应用可以运行，但窗口对于 UI 来说显然太大了：

   ![桌面端的新 Compose 跨平台应用](first-compose-project-on-desktop-3.png){width=400}

4. 为了修复这个问题，如下更新 `main.kt` 文件：

    ```kotlin
   fun main() = application {
       val state = rememberWindowState(
           size = DpSize(400.dp, 350.dp),
           position = WindowPosition(300.dp, 300.dp)
       )
       Window(
           title = "Local Time App", 
           onCloseRequest = ::exitApplication, 
           state = state,
           alwaysOnTop = true
       ) {
           App()
       }
   }
    ```

    在这里，你设置了窗口标题，并使用 `WindowState` 类型在屏幕上给出了窗口的初始大小和位置。

5. 按照 IDE 的指示导入缺失的依赖项。

6. 要查看应用自动更新，请保存任何修改过的文件（<shortcut>⌘ S</shortcut> / <shortcut>Ctrl+S</shortcut>）。它的外观应该会有所改善：

   ![桌面端 Compose 跨平台应用外观改进](first-compose-project-on-desktop-4.png){width=350}

   ![Compose 实时重新加载 (Hot Reload)](compose-hot-reload-resize.gif)

## 支持用户输入

现在让用户输入城市名称以查看该位置的时间。实现此目的最简单的方法是添加一个 `TextField` 可组合项：

1. 将 `commonMain/kotlin/compose.project.demo/App.kt` 中 `App()` 的当前实现替换为下面的代码：

    ```kotlin
    @Composable
    @Preview
    fun App() {
        MaterialTheme {
            var location by remember { mutableStateOf("Europe/Paris") }
            var timeAtLocation by remember { mutableStateOf("No location selected") }
    
            Column(
                modifier = Modifier
                    .safeContentPadding()
                    .fillMaxSize(),
            ) {
                Text(timeAtLocation)
                TextField(value = location, onValueChange = { location = it })
                Button(onClick = { timeAtLocation = "13:30" }) {
                    Text("Show Time At Location")
                }
            }
        }
    }
    ```

    新代码同时添加了 `TextField` 和 `location` 属性。当用户在文本字段中输入时，该属性的值会通过 `onValueChange` 事件处理程序逐步更新。

2. 按照 IDE 的指示导入缺失的依赖项。
3. 在你针对的每个平台上运行应用：

<Tabs>
    <TabItem id="mobile-user-input" title="Android 和 iOS">
        <img src="first-compose-project-on-android-ios-4.png" alt="Android 和 iOS 上 Compose 跨平台应用中的用户输入" width="500"/>
    </TabItem>
    <TabItem id="desktop-user-input" title="桌面端">
        <img src="first-compose-project-on-desktop-5.png" alt="桌面端 Compose 跨平台应用中的用户输入" width="350"/>
    </TabItem>
</Tabs>

## 计算时间

下一步是使用给定的输入来计算时间。为此，创建一个 `currentTimeAt()` 函数：

1. 返回 `App.kt` 文件并添加以下函数：

    ```kotlin
   fun currentTimeAt(location: String): String? {
        fun LocalTime.formatted() = "$hour:$minute:$second"

        return try {
            val time = Clock.System.now()
            val zone = TimeZone.of(location)
            val localTime = time.toLocalDateTime(zone).time
            "The time in $location is ${localTime.formatted()}"
        } catch (ex: IllegalTimeZoneException) {
            null
        }
    }
    ```

    此函数类似于你之前创建且不再需要的 `todaysDate()`。
    如果尚未将 [kotlinx-datetime](https://github.com/Kotlin/kotlinx-datetime) 库添加到项目中，请打开 `composeApp/build.gradle.kts` 文件，并将 `kotlinx-datetime` 依赖项添加到配置公共代码源集的片段中。
    为简单起见，你可以直接包含版本号，而不是将其添加到版本目录中：

    ```kotlin
    kotlin {
        // ...
        sourceSets {
            // ...
            commonMain.dependencies {
                // ...
                implementation("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%")
            }
        }
    }
    ```
   {initial-collapse-state="collapsed" collapsible="true" collapsed-title='implementation("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%")'}
   
2. 按照 IDE 的指示导入缺失的依赖项。
   确保从 `kotlin.time` 导入 `Clock` 类，而不是 `kotlinx.datetime`。
3. 调整你的 `App` 可组合项以调用 `currentTimeAt()`：

    ```kotlin
   @Composable
   @Preview
   fun App() {
   MaterialTheme { 
       var location by remember { mutableStateOf("Europe/Paris") }
       var timeAtLocation by remember { mutableStateOf("No location selected") }
   
       Column(
           modifier = Modifier
               .safeContentPadding()
               .fillMaxSize()
           ) {
               Text(timeAtLocation)
               TextField(value = location, onValueChange = { location = it })
               Button(onClick = { timeAtLocation = currentTimeAt(location) ?: "Invalid Location" }) {
                   Text("Show Time At Location")
               }
           }
       }
   }
    ```

4. 再次运行应用并输入有效的时区。
5. 点击按钮。你应该会看到正确的时间：

<Tabs>
    <TabItem id="mobile-time-display" title="Android 和 iOS">
        <img src="first-compose-project-on-android-ios-5.png" alt="Android 和 iOS 上 Compose 跨平台应用中的时间显示" width="500"/>
    </TabItem>
    <TabItem id="desktop-time-display" title="桌面端">
        <img src="first-compose-project-on-desktop-6.png" alt="桌面端 Compose 跨平台应用中的时间显示" width="350"/>
    </TabItem>
</Tabs>

## 改进样式

应用运行正常，但其外观存在问题。可组合项之间的间距可以更好，时间消息也可以渲染得更突出。

1. 为了解决这些问题，使用以下版本的 `App` 可组合项：

    ```kotlin
    @Composable
    @Preview
    fun App() {
        MaterialTheme {
            var location by remember { mutableStateOf("Europe/Paris") }
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
                    modifier = Modifier.fillMaxWidth().align(Alignment.CenterHorizontally)
                )
                TextField(
                    value = location,
                    onValueChange = { location = it },
                    modifier = Modifier.padding(top = 10.dp)
                )
                Button(
                    onClick = { timeAtLocation = currentTimeAt(location) ?: "Invalid Location" },
                    modifier = Modifier.padding(top = 10.dp)
                ) {
                    Text("Show Time")
                }
            }
        }
    }
    ```

    * `modifier` 参数在 `Column` 周围以及 `Button` 和 `TextField` 的顶部添加了内边距。
    * `Text` 可组合项填充可用的水平空间并居中其内容。
    * `style` 参数自定义了 `Text` 的外观。

2. 按照 IDE 的指示导入缺失的依赖项。
    对于 `Alignment`，请使用 `androidx.compose.ui` 版本。

3. 运行应用以查看外观是如何改进的：

<Tabs>
    <TabItem id="mobile-improved-style" title="Android 和 iOS">
        <img src="first-compose-project-on-android-ios-6.png" alt="Android 和 iOS 上 Compose 跨平台应用外观改进" width="500"/>
    </TabItem>
    <TabItem id="desktop-improved-style" title="桌面端">
        <img src="first-compose-project-on-desktop-7.png" alt="桌面端 Compose 跨平台应用外观改进" width="350"/>
    </TabItem>
</Tabs>

<!--
> 你可以在我们的 [GitHub 仓库](https://github.com/kotlin-hands-on/get-started-with-cm/tree/main/ComposeDemoStage2)中找到此阶段的项目状态。
>
{style="tip"}
-->

## 重构设计

应用运行正常，但容易受到拼写错误的影响。例如，如果用户输入 "Franse" 而不是 "France"，应用将无法处理该输入。最好是让用户从预定义的列表中选择国家。

1. 为此，请更改 `App` 可组合项中的设计：

    ```kotlin
    data class Country(val name: String, val zone: TimeZone)
    
    fun currentTimeAt(location: String, zone: TimeZone): String {
        fun LocalTime.formatted() = "$hour:$minute:$second"
    
        val time = Clock.System.now()
        val localTime = time.toLocalDateTime(zone).time
    
        return "The time in $location is ${localTime.formatted()}"
    }
    
    fun countries() = listOf(
        Country("Japan", TimeZone.of("Asia/Tokyo")),
        Country("France", TimeZone.of("Europe/Paris")),
        Country("Mexico", TimeZone.of("America/Mexico_City")),
        Country("Indonesia", TimeZone.of("Asia/Jakarta")),
        Country("Egypt", TimeZone.of("Africa/Cairo")),
    )
    
    @Composable
    @Preview
    fun App(countries: `List<Country>` = countries()) {
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
                    modifier = Modifier.fillMaxWidth().align(Alignment.CenterHorizontally)
                )
                Row(modifier = Modifier.padding(start = 20.dp, top = 10.dp)) {
                    DropdownMenu(
                        expanded = showCountries,
                        onDismissRequest = { showCountries = false }
                    ) {
                        countries().forEach { (name, zone) ->
                            DropdownMenuItem(
                                text = {   Text(name)},
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

   * 定义了一个 `Country` 类型，由名称和时区组成。
   * `currentTimeAt()` 函数将 `TimeZone` 作为其第二个参数。
   * `App` 现在需要一个国家列表作为参数。`countries()` 函数提供该列表。
   * `DropdownMenu` 取代了 `TextField`。`showCountries` 属性的值决定了 `DropdownMenu` 的可见性。每个国家都有一个 `DropdownMenuItem`。

2. 按照 IDE 的指示导入缺失的依赖项。
3. 运行应用以查看重新设计后的版本：

<Tabs>
    <TabItem id="mobile-country-list" title="Android 和 iOS">
        <img src="first-compose-project-on-android-ios-7.png" alt="Android 和 iOS 上 Compose 跨平台应用中的国家列表" width="500"/>
    </TabItem>
    <TabItem id="desktop-country-list" title="桌面端">
        <img src="first-compose-project-on-desktop-8.png" alt="桌面端 Compose 跨平台应用中的国家列表" width="350"/>
    </TabItem>
</Tabs>

<!--
> 你可以在我们的 [GitHub 仓库](https://github.com/kotlin-hands-on/get-started-with-cm/tree/main/ComposeDemoStage3)中找到此阶段的项目状态。
>
{style="tip"}
-->

> 你可以使用依赖注入框架（如 [Koin](https://insert-koin.io/)）来构建和注入位置表，从而进一步改进设计。如果数据存储在外部，你可以使用 [Ktor](https://ktor.io/docs/create-client.html) 库通过网络获取数据，或者使用 [SQLDelight](https://github.com/cashapp/sqldelight) 库从数据库获取数据。
>
{style="note"}

## 引入图片

国家名称列表可以运行，但视觉效果不佳。你可以通过用国旗图片替换名称来改进它。

Compose 跨平台提供了一个库，用于通过所有平台的公共代码访问资源。Kotlin Multiplatform 向导已经添加并配置了此库，因此你可以直接开始加载资源，而无需修改构建文件。

要在项目中支持图片，你需要下载图片文件，将它们存储在正确的目录中，并添加代码来加载和显示它们：

1. 从 [Flag CDN](https://flagcdn.com/) 下载国旗图片，以匹配你已经创建的国家列表。在本例中，分别是 [日本](https://flagcdn.com/w320/jp.png)、[法国](https://flagcdn.com/w320/fr.png)、[墨西哥](https://flagcdn.com/w320/mx.png)、[印度尼西亚](https://flagcdn.com/w320/id.png)和[埃及](https://flagcdn.com/w320/eg.png)。

2. 将图片移动到 `composeApp/src/commonMain/composeResources/drawable` 目录，以便相同的国旗在所有平台上都可用：

   ![Compose 跨平台资源项目结构](compose-resources-project-structure.png){width=300}

3. 构建或运行应用以生成带有新增资源访问器的 `Res` 类。

4. 更新 `commonMain/kotlin/.../App.kt` 文件中的代码以支持图片：

    ```kotlin
    import demo.composeapp.generated.resources.jp
    import demo.composeapp.generated.resources.mx
    import demo.composeapp.generated.resources.eg
    import demo.composeapp.generated.resources.fr
    import demo.composeapp.generated.resources.id
   
    data class Country(val name: String, val zone: TimeZone, val image: DrawableResource)

    fun currentTimeAt(location: String, zone: TimeZone): String {
        fun LocalTime.formatted() = "$hour:$minute:$second"

        val time = Clock.System.now()
        val localTime = time.toLocalDateTime(zone).time

        return "The time in $location is ${localTime.formatted()}"
    }

    val defaultCountries = listOf(
        Country("Japan", TimeZone.of("Asia/Tokyo"), Res.drawable.jp),
        Country("France", TimeZone.of("Europe/Paris"), Res.drawable.fr),
        Country("Mexico", TimeZone.of("America/Mexico_City"), Res.drawable.mx),
        Country("Indonesia", TimeZone.of("Asia/Jakarta"), Res.drawable.id),
        Country("Egypt", TimeZone.of("Africa/Cairo"), Res.drawable.eg)
    )

    @Composable
    @Preview
    fun App(countries: `List<Country>` = defaultCountries) {
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
                    modifier = Modifier.fillMaxWidth().align(Alignment.CenterHorizontally)
                )
                Row(modifier = Modifier.padding(start = 20.dp, top = 10.dp)) {
                    DropdownMenu(
                        expanded = showCountries,
                        onDismissRequest = { showCountries = false }
                    ) {
                        countries.forEach { (name, zone, image) ->
                            DropdownMenuItem(
                                text = { Row(verticalAlignment = Alignment.CenterVertically) {
                                    Image(
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
    {initial-collapse-state="collapsed" collapsible="true" collapsed-title="data class Country(val name: String, val zone: TimeZone, val image: DrawableResource)"}

    * `Country` 类型存储相关图片的路径。
    * 传递给 `App` 的国家列表包含这些路径。
    * `App` 在每个 `DropdownMenuItem` 中显示一个 `Image`，随后是一个带有国家名称的 `Text` 可组合项。
    * 每个 `Image` 都需要一个 `Painter` 对象来获取数据。

5. 按照 IDE 的指示导入缺失的依赖项。
6. 运行应用以查看新行为：

<Tabs>
    <TabItem id="mobile-flags" title="Android 和 iOS">
        <img src="first-compose-project-on-android-ios-8.png" alt="Android 和 iOS 上 Compose 跨平台应用中的国旗" width="500"/>
    </TabItem>
    <TabItem id="desktop-flags" title="桌面端">
        <img src="first-compose-project-on-desktop-9.png" alt="桌面端 Compose 跨平台应用中的国旗" width="350"/>
    </TabItem>
</Tabs>

> 你可以在我们的 [GitHub 仓库](https://github.com/kotlin-hands-on/get-started-with-cm/)中找到项目的最终状态。
>
{style="note"}

## 下一步

我们鼓励你进一步探索跨平台开发并尝试更多项目：

* [让你的 Android 应用实现跨平台](multiplatform-integrate-in-existing-app.md)
* [使用 Ktor 和 SQLDelight 创建跨平台应用](multiplatform-ktor-sqldelight.md)
* [在 iOS 和 Android 之间共享业务逻辑，同时保持 UI 原生](multiplatform-create-first-app.md)
* [使用 Kotlin/Wasm 创建 Compose 跨平台应用](https://kotlinlang.org/docs/wasm-get-started.html)
* [查看精选示例项目列表](multiplatform-samples.md)

加入社区：

* ![GitHub](git-hub.svg){width=25}{type="joined"} **Compose Multiplatform GitHub**：为[该仓库](https://github.com/JetBrains/compose-multiplatform)点赞并贡献代码
* ![Slack](slack.svg){width=25}{type="joined"} **Kotlin Slack**：获取[邀请](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)并加入 [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 频道
* ![Stack Overflow](stackoverflow.svg){width=25}{type="joined"} **Stack Overflow**：订阅 ["kotlin-multiplatform" 标签](https://stackoverflow.com/questions/tagged/kotlin-multiplatform)
* ![YouTube](youtube.svg){width=25}{type="joined"} **Kotlin YouTube 频道**：订阅并观看有关 [Kotlin Multiplatform](https://www.youtube.com/playlist?list=PLlFc5cFwUnmy_oVc9YQzjasSNoAk4hk_C) 的视频