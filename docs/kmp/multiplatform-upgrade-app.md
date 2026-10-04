[//]: # (title: 原生 UI：REST API 请求的共享逻辑)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

本教程演示如何在通过原生代码实现独立 UI 的同时，共享特定业务逻辑的代码。
关于同时共享逻辑与 UI 的示例，请参阅[完全共享代码：时区选择器应用](compose-multiplatform-new-project.md)。

你将构建一个应用程序，该程序从 [Launch Library 2](https://lldev.thespacedevs.com/docs) REST API 检索最近一次成功的太空发射信息并显示结果。
网络请求和数据序列化代码将在 iOS 和 Android 之间共享。

要从 Kotlin Multiplatform IDE 向导创建的项目逐步达到最终结果，你将：

1. [配置公共依赖项和平台特定依赖项](#add-dependencies)
2. [设置 API 请求以及用于存储响应的数据模型](#set-up-api-requests)
3. 在原生 UI 中使用并显示数据：
   * [更新 Android UI](#update-native-android-ui) 
   * [更新 iOS UI](#update-native-ios-ui)。
     你可以尝试两种不同的库将 Kotlin 协程集成到 Swift 代码中。

> 项目的最终状态可在我们 GitHub 仓库的两个分支中获取，分别采用了不同的 iOS 协程解决方案：
> * [`main`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main) 分支包含 KMP-NativeCoroutines 实现，
> * [`main-skie`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main-skie) 分支包含 SKIE（Kotlin-Swift 互操作库）实现。
>
{style="tip"}

## 创建项目 {id="create-a-project"}

在安装好 IDE 和 Kotlin Multiplatform IDE 插件后，创建一个新的 Kotlin Multiplatform 项目：

1. 在 IntelliJ IDEA 中，选择 **File** | **New** | **Project**。
2. 在左侧面板中，选择 **Kotlin Multiplatform**。
3. 在 **New Project** 窗口中指定以下字段：

    * **Name**：GreetingKMP
    * **Project ID**（用作软件包名称）：com.jetbrains.greetingkmp

4. 选择 **Android** 和 **iOS** 目标。
   对于 iOS，选择 **Do not share UI** 选项以保持 UI 原生。
5. 点击 **Create**。

   ![创建 Kotlin Multiplatform 项目](create-first-multiplatform-app.png){width=700}

首次导入需要几分钟时间。
完成后，请确保所有预检均显示绿色通过（**View | Tool Windows | Projects Environment Preflight Checks**）。

## 查看项目结构 {id="examine-the-project-structure"}

在 IntelliJ IDEA 中，展开 `GreetingKMP` 文件夹。

该 Kotlin Multiplatform 项目包含以下模块：

* **androidApp** 是一个用于构建 Android 应用程序的 Kotlin 模块。它使用 Gradle 作为构建系统。
  **androidApp** 模块依赖 **sharedLogic** 模块，并将其作为常规 Android 库使用。
* **iosApp** 是用于构建 iOS 应用程序的 Xcode 项目。
* **sharedLogic** 是多平台模块，包含 Android 和 iOS 应用程序共享的逻辑。
* **sharedUI** 是包含使用 Compose Multiplatform 实现的 UI 代码的模块。
  在此项目中，**sharedUI** 仅供 Android 应用使用，但可以随时根据需要扩展到其他目标。
  在 Android 上，[Compose Multiplatform 调用可直接转换为 Jetpack Compose](compose-multiplatform-jetpack-libraries.md)，
  因此在此特定配置下没有开销。

除 **iosApp** 之外的每个模块都使用 Gradle 作为构建系统。
**iosApp** 模块使用 Xcode 构建，它会调用 Kotlin Gradle 构建，从 **sharedLogic** 模块创建一个 iOS 框架。
这是 Kotlin Multiplatform 中*直接 iOS 集成*的一个示例。

> 要详细了解针对 iOS 构建 Kotlin 的信息，请参阅 [iOS 集成方法](multiplatform-ios-integration-overview.md)。
> 
{style="tip"}

## 添加依赖项 {id="add-dependencies"}

你的项目需要以下多平台库：

* [`kotlinx-datetime`](https://github.com/Kotlin/kotlinx-datetime)，用于处理和格式化时间戳。
* [Ktor](https://ktor.io/)，一个用于通过 HTTP 发送和检索数据的框架。
* [`kotlinx.coroutines`](https://github.com/Kotlin/kotlinx.coroutines)，用于使用协程流异步处理网络调用。
* [`kotlinx.serialization`](https://github.com/Kotlin/kotlinx.serialization)，用于将 API 的 JSON 响应反序列化为 Kotlin 对象。

所有平台特定的代码均已包装在各库的平台构件中，
因此你无需亲自实现平台特定的调用。

原生 iOS UI 将需要一个额外的库，用于在 Swift 和 Kotlin 之间桥接异步代码。
此配置将在通用 API 准备就绪之后，在[更新原生 iOS UI](#update-native-ios-ui)部分中介绍。

### 更新 Gradle 版本目录 {id="update-the-gradle-version-catalog"}

将以下条目添加到 `gradle/libs.versions.toml` 中，然后同步 Gradle 文件，使这些引用在构建配置代码中可用：

```toml
[versions]
# ...
kotlinx-coroutines = "%coroutinesVersion%"
kotlinx-datetime = "%dateTimeVersion%"
ktor = "%ktorVersion%"

[libraries]
# ...
kotlinx-coroutines = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-core", version.ref = "kotlinx-coroutines" }
kotlinx-datetime = { module = "org.jetbrains.kotlinx:kotlinx-datetime", version.ref = "kotlinx-datetime" }
ktor-client-core = { module = "io.ktor:ktor-client-core", version.ref = "ktor" }
ktor-client-content-negotiation = { module = "io.ktor:ktor-client-content-negotiation", version.ref = "ktor" }
ktor-serialization-kotlinx-json = { module = "io.ktor:ktor-serialization-kotlinx-json", version.ref = "ktor" }
ktor-client-darwin = { module = "io.ktor:ktor-client-darwin", version.ref = "ktor" }
ktor-client-android = { module = "io.ktor:ktor-client-android", version.ref = "ktor" }

[plugins]
# ...
kotlinSerialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
```

### 将依赖项添加到对应的源集中 {id="add-dependencies-to-corresponding-source-sets"}

在 `sharedLogic/build.gradle.kts` 文件中将库引用添加到对应的源集中：

```kotlin
plugins {
    // ...
    alias(libs.plugins.kotlinSerialization)
}

kotlin {
    sourceSets {
        commonMain.dependencies {
            // ...
            // Kotlin Multiplatform Gradle 插件会自动添加
            // 针对协程和 datetime 的平台特定构件
            implementation(libs.kotlinx.coroutines)
            implementation(libs.kotlinx.datetime)
            // Ktor 主依赖项
            implementation(libs.ktor.client.core)
            // 允许 Ktor 使用特定格式进行序列化的依赖项
            implementation(libs.ktor.client.content-negotiation)
            implementation(libs.ktor.serialization.kotlinx.json)
        }
        androidMain.dependencies {
            // 提供适用于 Ktor 的 Android 引擎
            implementation(libs.ktor.client.android)
        }
        iosMain.dependencies {
            // 提供适用于 Ktor 的 Darwin 引擎
            implementation(libs.ktor.client.darwin)
        }
    }
}
```

同步 Gradle 文件：双击 **Shift 键**，然后查找并执行 **Sync Project with Gradle Files** 命令。

> 有关如何管理多平台依赖项的更多信息，
> 请参阅[添加多平台库依赖项](multiplatform-add-dependencies.md)。
>
{style="tip"}

## 设置 API 请求 {id="set-up-api-requests"}

你将使用 [Launch Library API](https://lldev.thespacedevs.com/docs) 检索数据，
具体是从 **/2.3.0/launches** 端点获取发射列表。

### 创建数据模型 {id="create-a-data-model"}

在 `sharedLogic/src/commonMain/.../greetingkmp` 目录下创建一个新的 `RocketLaunch.kt` 文件，
并添加一个用于存储来自 Launch Library API 的数据的数据类：

```kotlin
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// @Serializable 指示 kotlinx.serialization 插件
// 自动为该类生成默认序列化器
@Serializable
data class RocketLaunch(
    // @SerialName 重新定义字段名称，使属性名称在序列化格式中更具可读性
    @SerialName("id")
    val id: String,
    @SerialName("name")
    val missionName: String,
    @SerialName("net")
    val launchDateUTC: String,
    @SerialName("status")
    val status: LaunchStatus,
)

@Serializable
data class LaunchStatus(
    @SerialName("id")
    val id: Int,
    @SerialName("name")
    val name: String,
)

@Serializable
data class LaunchListResponse(
    @SerialName("results")
    val results: List<RocketLaunch>,
)
```

### 连接 HTTP 客户端 {id="connect-http-client"}

1. 在 `sharedLogic/src/commonMain/.../greetingkmp` 目录下创建一个新的 `RocketComponent` 类。
2. 添加 `httpClient` 属性，并使用它根据 HTTP GET 请求的结果构建最终字符串：

    ```kotlin
    import io.ktor.client.HttpClient
    import io.ktor.client.call.body
    import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
    import io.ktor.client.request.get
    import io.ktor.serialization.kotlinx.json.json
    import kotlinx.datetime.TimeZone
    import kotlinx.datetime.toLocalDateTime
    import kotlinx.serialization.json.Json
    import kotlin.time.Instant
    
    class RocketComponent {
        private val httpClient = HttpClient {
            // ContentNegotiation Ktor 插件与 JSON 序列化器
            // 对 GET 请求的结果进行反序列化
            install(ContentNegotiation) {
                json(Json {
                    // 生成更具可读性的 JSON
                    prettyPrint = true
                    // 允许非标准 JSON 输入，
                    // 例如不带引号的键和字符串值
                    isLenient = true
                    // 忽略模型中未声明的键
                    ignoreUnknownKeys = true
                })
            }
        }

        // 返回最近一次成功发射的日期字符串。
        // 标记为挂起函数，因为它调用了
        // 挂起函数 httpClient.get()
        private suspend fun getDateOfLastSuccessfulLaunch(): String {
            // 异步检索火箭发射信息
            val response: LaunchListResponse =
                httpClient.get("https://lldev.thespacedevs.com/2.3.0/launches/previous/?mode=list&limit=10&format=json").body()
            // 获取最近一次成功的发射。
            // 在响应中，发射按从最新到最旧排序，
            // 且成功的发射被标记为 'status.id' 为 3
            val lastSuccessLaunch = response.results.first { it.status.id == 3 }
            // 将发射时间戳转换为本地时间
            val date = Instant.parse(lastSuccessLaunch.launchDateUTC)
                .toLocalDateTime(TimeZone.currentSystemDefault())

            // 日期以 "MMMM D, YYYY" 格式显示，
            // 例如 "JULY 15, 2026"
            return "${date.month} ${date.day}, ${date.year}"
        }

        // 使用挂起函数 getDateOfLastSuccessfulLaunch()
        // 为 UI 构建最终字符串
        suspend fun launchPhrase(): String =
            try {
                "The last successful launch was on ${getDateOfLastSuccessfulLaunch()} 🚀"
            } catch (e: Exception) {
                println("Exception during getting the date of the last successful launch $e")
                "Error occurred"
            }
    }
    ```

   挂起函数只能从协程或其他挂起函数中调用。
   例如，`httpClient.get()` 是一个挂起函数，因为需要通过网络异步检索数据而不阻塞线程。
   由于 `getDateOfLastSuccessfulLaunch()` 函数调用了 `httpClient.get()`，因此它也用 `suspend` 关键字标记。

### 创建协程流 (Flow) {id="create-a-coroutine-flow"}

当你需要生成一系列值时，可以使用 [flow](https://kotlinlang.org/docs/flow.html) 来代替仅仅调用挂起函数。
Flow 可以在值生成时发射一系列值，而不像挂起函数那样只返回单个值。

1. 打开 `sharedLogic/src/commonMain/kotlin` 目录下的 `Greeting.kt` 文件。
2. 更新 `Greeting` 类中的 `greet()` 函数，使其返回字符串类型的 `Flow`，主要用于适应网络请求。
   在 `Flow` 中，使用 `RocketComponent` 属性发射发射日期：

    ```kotlin
    import kotlinx.coroutines.delay
    import kotlinx.coroutines.flow.Flow
    import kotlinx.coroutines.flow.flow
    import kotlin.random.Random
    import kotlin.time.Duration.Companion.seconds
    
    class Greeting {
        private val platform = getPlatform()
   
        // 存储最近一次成功发射的日期
        private val rocketComponent = RocketComponent()
        // 构建并逐个异步发射问候语字符串
        fun greet(): Flow<String> = flow {
            emit(if (Random.nextBoolean()) "Hi!" else "Hello!")
            delay(1.seconds)
            emit("Guess what this is! > ${platform.name.reversed()}")
            emit(rocketComponent.launchPhrase())
        }
    }
    ```

    `Flow` 是使用包装了可挂起代码块的 [`flow()`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow.html) 构建器函数创建的。

`greet()` 函数现在返回 `Flow<String>` 而非单个 `String`。
你的原生 UI 代码将导入 `Greeting` 类并收集 `greet()` 函数发射的字符串。

如下文各节所示，在原生 UI 中实现相应的更改。

## 更新原生 Android UI {id="update-native-android-ui"}

由于共享模块和 Android 应用程序都是用 Kotlin 编写的，因此在 Android 中使用共享代码非常直截了当。

### 引入视图模型 (ViewModel) {id="introduce-a-view-model"}

视图模型在 Android 开发中常用于在 [Android activity](https://developer.android.com/guide/components/activities/intro-activities) 的整个生命周期内管理 UI 相关的数据。
你的应用程序正变得越来越复杂，因此它也可以从视图模型中受益。
该视图模型将存储从 Launch Library API 接收到的数据，并将其提供给 UI。

在 `sharedUI/src/commonMain/.../greetingkmp` 目录下，创建一个继承自多平台 AndroidX 库中 `[ViewModel](https://developer.android.com/reference/kotlin/androidx/lifecycle/ViewModel)` 的新 `MainViewModel` 类，以使用 Android 的生命周期机制和配置跟踪：

```kotlin
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class MainViewModel: ViewModel() {
    // StateFlow 是一个保存单个当前状态值的 flow
    val greetingList: StateFlow<List<String>>
        // 显式支持字段在类外部是只读的，在内部是可变的
        field = MutableStateFlow<List<String>>(listOf())

    // 收集 Greeting().greet() 调用发射的所有字符串
    init {
        // 在此 ViewModel 拥有的协程中启动收集。
        // 它在保留 ViewModel 期间保持活动状态，
        // 并在清除 ViewModel 时自动取消。
        viewModelScope.launch {
            // 将每个新短语附加到 greetingList
            Greeting().greet().collect { phrase ->
                greetingList.update { list -> list + phrase }
            }
        }
    }
}
```

### 使用视图模型的 flow {id="use-the-view-model-s-flow"}

在 `sharedUI/src/commonMain/.../greetingkmp` 中，打开 `App.kt` 文件并替换先前的实现，以使用新实现的视图模型。

随着 flow 发射新值，组合项会进行更新以逐一显示问候短语：

```kotlin
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.compose.runtime.getValue
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.material3.HorizontalDivider
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.ui.unit.dp

@Composable
@Preview
fun App(mainViewModel: MainViewModel = viewModel()) {
    MaterialTheme {
        // 从 ViewModel 的 flow 中收集 greetingList 的值，
        // 并以感知生命周期的方式将其表示为可组合状态
        val greetings by mainViewModel.greetingList.collectAsStateWithLifecycle()

        // 将问候短语显示为一列，中间用分隔线分隔
        Column(
            modifier = Modifier
                .safeContentPadding()
                .fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            greetings.forEach { greeting ->
                Text(greeting)
                HorizontalDivider()
            }
        }
    }
}
```

### 添加网络访问权限 {id="add-internet-access-permission"}

为了允许 Android 应用程序访问互联网，请在 `androidApp/src/main/AndroidManifest.xml` 文件中添加以下权限：

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET"/>
    <!-- 清单的其余部分 -->
</manifest>
```

### 运行应用 {id="run-the-app"}

要查看最终结果，请运行你的 **androidApp** 运行配置。

> 有关创建新模拟器或在实体设备上运行应用的详细信息，请参阅[构建并运行 Kotlin Multiplatform 应用程序](build-and-run-kmp.md)。
>
{style="note"}

![Android 最终结果](multiplatform-mobile-upgrade-android.png){width=350}

## 更新原生 iOS UI {id="update-native-ios-ui"}

对于项目的 iOS 部分，你将像对 Android 应用所做的那样，使用视图模型模式将 UI 连接到 `sharedLogic` 模块。
该模块已在 `ContentView.swift` 文件中通过 `import SharedLogic` 声明导入。

iOS 应用的代码包含在 `iosApp/iosApp` 目录下：
`ContentView.swift` 包含大部分逻辑，而 `iOSApp.swift` 则包含应用程序的入口点。

### 引入 `ViewModel` {id="introduce-a-viewmodel"}

在 `iosApp/ContentView.swift` 文件中，为 `ContentView` 创建一个 `ViewModel` 类，负责为其准备和管理数据。
将整个文件替换为以下代码：

```swift
import SwiftUI
import SharedLogic

struct ContentView: View {
    // 将视图订阅到下面声明为 ObservableObject 的视图模型
    @ObservedObject private(set) var viewModel: ViewModel

    var body: some View {
        ListView(phrases: viewModel.greetings)
            // 使用 .task 修饰符调用 startObserving() 函数以支持并发
            .task { await self.viewModel.startObserving() }
    }
}

// ViewModel 声明为 ContentView 的扩展，因为它们紧密相连
extension ContentView {
    @MainActor
    class ViewModel: ObservableObject {
        // 此属性用于保存 ViewModel 的 flow 发射的问候短语
        @Published var greetings: [String] = []
        
        func startObserving() {
            // 具体实现取决于所选的 iOS 协程库（见下文）
        }
    }
}

struct ListView: View {
    let phrases: Array<String>

    var body: some View {
        List(phrases, id: \.self) {
            Text($0)
        }
    }
}
```

SwiftUI 将视图模型（`ContentView.ViewModel`）与视图（`ContentView`）连接在一起：

* `ContentView.ViewModel` 类被声明为 `ObservableObject`，这使其能够报告更改。
  `ContentView` 中 `viewModel` 属性的 `@ObservedObject` 包装器使视图订阅了这些更改。
* 带有 `@Published` 包装器的 `greetings` 属性发生更改时，会触发 SwiftUI 更新 `ContentView`。

现在你需要使用现有的某个可以在 Swift 中消费 Kotlin flow 的 KMP 库来实现 `startObserving()` 函数。

### 选择用于在 Swift 中消费 Kotlin flow 的库 {id="choose-a-library-for-consuming-kotlin-flows-in-swift"}

在本教程中，你可以使用 [SKIE](https://skie.touchlab.co/) 或 [KMP-NativeCoroutines](https://github.com/rickclephas/KMP-NativeCoroutines) 库来帮助你在 iOS 中处理 flow。
两者都是开源解决方案，支持 flow 的取消和泛型功能，而 Kotlin/Native 编译器默认尚不提供这些功能：

* KMP-NativeCoroutines 库通过生成必要的包装器，帮助你从 iOS 消费挂起函数和 flow。
  KMP-NativeCoroutines 支持 Swift 的 `async`/`await` 功能，以及 Combine 和 RxSwift。
  使用 KMP-NativeCoroutines 需要在 iOS 项目中添加 SwiftPM 或 CocoaPods 依赖项。
* SKIE 库增强了 Kotlin 编译器生成的 Objective-C API：SKIE 将 flow 转换为等同于 Swift `AsyncSequence` 的结构。SKIE 直接支持 Swift 的 `async`/`await`，没有线程限制，并具有自动双向取消功能（Combine 和 RxSwift 需要适配器）。SKIE 还提供了其他功能来从 Kotlin 生成对 Swift 友好的 API，包括将各种 Kotlin 类型桥接到 Swift 等效项。它也不需要在 iOS 项目中添加额外的依赖项。

  > 最新版本的 SKIE 可能不支持最新的稳定版 Kotlin。
  > 请查看[最新版本的更新日志](https://skie.touchlab.co/category/changelog)，
  > 了解应降级到哪个 Kotlin 版本。

### 选项 1. 配置 KMP-NativeCoroutines {initial-collapse-state="collapsed" collapsible="true" id="option-1-configure-kmp-nativecoroutines"}

更新构建脚本以包含 KMP-NativeCoroutines 依赖项：

1. 将 KMP-NativeCoroutines 版本和插件引用添加到 Gradle [版本目录](https://docs.gradle.org/current/userguide/version_catalogs.html)：

    ```toml
    [versions]
    kmpNativeCoroutines = "%kmpncVersion%"
    
    [plugins]
    kmpNativeCoroutines = { id = "com.rickclephas.kmp.nativecoroutines", version.ref = "kmpNativeCoroutines" }
    ```

2. 在项目的根 `build.gradle.kts` 文件中（**不是** `sharedLogic/build.gradle.kts` 文件），将 KMP-NativeCoroutines 插件添加到 `plugins {}` 代码块中：

    ```kotlin
    plugins {
        // ...
        alias(libs.plugins.kmpNativeCoroutines) apply false
    }
    ```

3. 在 `sharedLogic/build.gradle.kts` 文件中，将 KMP-NativeCoroutines 插件添加到 `plugins {}` 代码块中：

    ```kotlin
    plugins {
        // ...
        alias(libs.plugins.kmpNativeCoroutines)
    }
    ```

4. 在同一个 `sharedLogic/build.gradle.kts` 文件中，选择启用实验性的 `@ObjCName` 注解：

    ```kotlin
    kotlin {
        // ...
        sourceSets {
            all {
                languageSettings {
                    optIn("kotlin.experimental.ExperimentalObjCName")
                }
            }
            // ...
        }
    }
    ```

5. 双击 **Shift 键**，然后查找并执行 **Sync Project with Gradle Files** 命令。

#### 使用 KMP-NativeCoroutines 标记 flow {id="mark-the-flow-with-kmp-nativecoroutines"}

1. 打开 `sharedLogic/src/commonMain/kotlin` 目录下的 `Greeting.kt` 文件。
2. 为 `greet()` 函数添加 `@NativeCoroutines` 注解。
   这会让插件生成代码以支持在 iOS 上正确处理 flow：

   ```kotlin
    import com.rickclephas.kmp.nativecoroutines.NativeCoroutines
    
    class Greeting {
        // ...
       
        @NativeCoroutines
        fun greet(): Flow<String> = flow {
            // ...
        }
    }
    ```

#### 在 Xcode 中使用 SwiftPM 导入库

安装使用 `async/await` 机制所需的 KMP-NativeCoroutines Swift 软件包组件：

1. 转到 **File | Open Project in Xcode**。
2. 在 Xcode 的左侧菜单中，右键点击 `iosApp` 项目并选择 **Add Package Dependencies**。
3. 在搜索栏中输入软件包名称：

     ```none
    https://github.com/rickclephas/KMP-NativeCoroutines.git
    ```

   ![导入 KMP-NativeCoroutines](multiplatform-import-kmp-nativecoroutines.png){width=700}

4. 在 **Dependency Rule** 下拉菜单中，选择 **Exact Version** 项，并在相邻字段中输入 `%kmpncVersion%` 版本。
5. 点击 **Add Package** 按钮。Xcode 将从 GitHub 获取该软件包，并打开另一个窗口以选择软件包产品。
6. 如图所示将 **KMPNativeCoroutinesAsync** 和 **KMPNativeCoroutinesCore** 添加到你的应用中，然后点击 **Add Package**：

   ![添加 KMP-NativeCoroutines 软件包](multiplatform-add-package.png){width=500}
7. 返回 IntelliJ IDEA 并选择 **Tools | Swift Package Manager | Resolve Dependencies**。
   这会创建一个供 Kotlin Multiplatform 构建任务使用的 `Package.resolved` 锁定文件，
   可以将其提交到仓库中以保持 Swift 软件包版本的一致性。

#### 使用 KMP-NativeCoroutines 库消费 flow

1. 在 `iosApp/ContentView.swift` 中，更新 `startObserving()` 函数，使用来自 KMP-NativeCoroutines 的 `asyncSequence()` 函数来消费 flow：

    ```swift
    func startObserving() async {
        do {
            // 消费从 Kotlin 的 Greeting().greet() 发射的 flow
            let sequence = asyncSequence(for: Greeting().greet())
            for try await phrase in sequence {
                self.greetings.append(phrase)
            }
        } catch {
            print("Failed with error: \(error)")
        }
    }
    ```

   此处使用循环和 `await` 机制遍历 flow，并在 flow 每次发射值时更新 `greetings` 属性。

2. 确保 `ViewModel` 标有 `@MainActor` 注解：

    ```Swift
    // ...
    import KMPNativeCoroutinesAsync
    import KMPNativeCoroutinesCore
    
    // ...
    extension ContentView {
        // 确保 `ViewModel` 内的所有异步操作都在应用的主 UI 上下文中运行。
        // 这可以避免对 `@Published` 属性的更新未在 UI 中反映出来。
        @MainActor
        class ViewModel: ObservableObject {
            @Published var greetings: [String] = []
    
            func startObserving() async {
                do {
                    let sequence = asyncSequence(for: Greeting().greet())
                    for try await phrase in sequence {
                        self.greetings.append(phrase)
                    }
                } catch {
                    print("Failed with error: \(error)")
                }
            }
        }
    }
    ```

在构建项目之前，此处的 `@MainActor` 可能会产生未解析的引用错误，构建项目后将使 Kotlin 符号（特别是 `greet()`）与 iOS 项目依赖项保持同步。

> 如果遇到构建错误，请确保 Kotlin 与 KMP-NativeCoroutines 的版本兼容：
> Gradle 插件版本和 Swift 软件包版本都应根据[兼容性对照表](https://github.com/rickclephas/KMP-NativeCoroutines#compatibility)进行设置。
>
{style="warning"}

### 选项 2. 配置 SKIE {initial-collapse-state="collapsed" collapsible="true"}

要设置该库，请将 SKIE 版本和插件引用添加到 Gradle 版本目录中：

```toml
[versions]
skie = "%skieVersion%"

[plugins]
skie = { id = "co.touchlab.skie", version.ref = "skie" }
```

> SKIE 可能不支持最新的稳定版 Kotlin。
> 如果你的 Kotlin 版本过新，在 Gradle 同步期间会报告此问题，并列出你可以安全降级到的版本列表。
> 
{style="note"}

然后将其添加到 `sharedLogic/build.gradle.kts` 文件的插件列表中：

```kotlin
plugins {
    //...
    alias(libs.plugins.skie)
}
```

双击 **Shift 键**，然后查找并执行 **Sync Project with Gradle Files** 命令。

#### 使用 SKIE 消费 flow {id="consume-the-flow-using-skie"}

你将使用循环和 `await` 机制遍历 `Greeting().greet()` flow，并在 flow 每次发射值时更新 `greetings` 属性。

确保 `ViewModel` 标有 `@MainActor` 注解。
该注解确保 `ViewModel` 内的所有异步操作都在主线程上运行，以符合 Kotlin/Native 的要求：

```Swift
// ...
extension ContentView {
    @MainActor
    class ViewModel: ObservableObject {
        @Published var greetings: [String] = []

        func startObserving() async {
            for await phrase in Greeting().greet() {
                self.greetings.append(phrase)
            }
        }
    }
}
```

### 使用 ViewModel 并运行 iOS 应用 {id="consume-the-viewmodel-and-run-the-ios-app"}

在 `iosApp/iOSApp.swift` 中，更新应用的入口点：

```swift
import SwiftUI

@main
struct iOSApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView(viewModel: ContentView.ViewModel())
        }
    }
}
```

在 IntelliJ IDEA 中运行 **iosApp** 配置，以确保应用的逻辑已同步。

> 有关创建新模拟器或在实体设备上运行应用的详细信息，请参阅[构建并运行 Kotlin Multiplatform 应用程序](build-and-run-kmp.md)。
>
{style="note"}

![最终结果](multiplatform-mobile-upgrade-ios.png){width=350}

## 项目的最终状态 {id="final-state-of-the-project"}

你可以在我们 GitHub 仓库的两个分支中找到项目的最终状态，分别采用了不同的协程解决方案：
* [`main`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main) 分支包含 KMP-NativeCoroutines 实现，
* [`main-skie`](https://github.com/kotlin-hands-on/get-started-with-kmp/tree/main-skie) 分支包含 SKIE 实现。

## 可能出现的问题与解决方案 {id="possible-issues-and-solutions"}

### Xcode 报告调用共享框架的代码出错 {id="xcode-reports-errors-in-the-code-calling-the-shared-framework"}

如果你在 Xcode 中工作，Xcode 项目可能使用的是旧版框架。
要解决此问题，请返回 IntelliJ IDEA 或 Android Studio 并重新构建项目或启动 iOS 运行配置。

### Xcode 报告导入共享框架时出错 {id="xcode-reports-an-error-when-importing-the-shared-framework"}

如果你使用的是 Xcode，可能需要清除缓存的二进制文件：尝试通过在主菜单中选择 **Product | Clean Build Folder** 来重置环境。

## 后续步骤 {id="what-s-next"}

* 参阅[另一篇教程](compose-multiplatform-new-project.md)，其中 UI 代码也进行了共享。
* 要详细了解 Kotlin Multiplatform 支持的各种代码共享方式，请参阅[在平台之间共享代码](multiplatform-share-on-platforms.md)。
* 了解 [Kotlin Multiplatform 项目结构背后的原理](multiplatform-discover-project.md)。
* 有关如何管理多平台依赖项的更多信息，请参阅[添加多平台库依赖项](multiplatform-add-dependencies.md)。
* 了解 Kotlin Multiplatform 项目如何[与 iOS 应用集成](multiplatform-ios-integration-overview.md)。 
* 按照有关[网络与数据存储](multiplatform-ktor-sqldelight.md)的教程创建更复杂的 KMP 应用。
* [查看精选的多平台示例项目列表](multiplatform-samples.md)。
* 探索[挂起函数组合](https://kotlinlang.org/docs/coroutines-basics.html)的各种方法。

## 获取帮助 {id="get-help"}

* ![Slack](slack.svg){width=25}{type="joined"} **Kotlin Slack**：获取帮助并参与有关 KMP 和 Compose Multiplatform 的讨论。
  申请[邀请](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)并加入
  [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 频道。
* **Kotlin 问题跟踪器**：[报告新问题](https://youtrack.jetbrains.com/newIssue?project=KT)。