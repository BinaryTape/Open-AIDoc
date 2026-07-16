[//]: # (title: 创建跨平台移动应用程序)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="tutorial-client-kmp"/>
<p>
    <b>代码示例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/%ktor_version%/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
了解如何在 Kotlin Multiplatform Mobile 应用程序中使用 Ktor 客户端。
</link-summary>

Ktor HTTP 客户端可用于多平台项目。在本教程中，我们将创建一个简单的 Kotlin Multiplatform Mobile 应用程序，该程序发送请求并以纯 HTML 文本形式接收响应体。

## 前提条件 {id="prerequisites"}

首先，您需要通过在合适的操作系统上安装必要工具来搭建跨平台移动开发环境。可以从 [设置环境](https://kotlinlang.org/docs/multiplatform-mobile-setup.html) 章节了解如何操作。

> 您将需要一台装有 macOS 的 Mac 来完成本教程中的某些步骤，包括编写 iOS 特有代码和运行 iOS 应用程序。
>
{style="note"}

## 创建新项目 {id="new-project"}

要创建一个新项目，您可以使用 IntelliJ IDEA 中的 Kotlin Multiplatform 项目向导。它将创建一个基础的多平台项目，您可以根据需要扩展客户端和服务。

<procedure>

1. 启动 IntelliJ IDEA。
2. 在 IntelliJ IDEA 中，选择 **File | New | Project**。
3. 在左侧面板中，选择 **Kotlin Multiplatform**。
4. 在 **New Project** 窗口中指定以下字段：
    * **Name**：KmpKtor
    * **Group**：com.example.ktor
      ![Kotlin Multiplatform 向导设置](tutorial_client_kmp_create_project.png){ width="706" border-effect="rounded" style="block" }
5. 选择 **Android** 和 **iOS** 目标。
6. 对于 iOS，选择 **Do not share UI** 选项以保持原生 UI。
7. 点击 **Create** 按钮，等待 IDE 生成并导入项目。

</procedure>

## 配置构建脚本 {id="build-script"}

### 添加 Ktor 依赖项 {id="ktor-dependencies"}

要在项目中使用 Ktor HTTP 客户端，您需要至少添加两个依赖项：客户端依赖项和[引擎](client-engines.md)依赖项。

1. 打开
    <Path>gradle/libs.versions.toml</Path>
    文件并添加 Ktor 版本：
    
    ```kotlin
    [versions]
    ktor = "3.4.0"
    ```

2. 在同一个
    <Path>gradle/libs.versions.toml</Path>
    中定义 Ktor 客户端和引擎库：
    
    ```kotlin
    [libraries]
    ktor-client-core = { module = "io.ktor:ktor-client-core", version.ref = "ktor" }
    ktor-client-okhttp = { module = "io.ktor:ktor-client-okhttp", version.ref = "ktor" }
    ktor-client-darwin = { module = "io.ktor:ktor-client-darwin", version.ref = "ktor" }
    ```

3. 打开
    <Path>shared/build.gradle.kts</Path>
    文件并添加以下依赖项：
    
    ```kotlin
    sourceSets {
        commonMain.dependencies {
            implementation(libs.ktor.client.core)
        }
        androidMain.dependencies {
            implementation(libs.ktor.client.okhttp)
        }
        iosMain.dependencies {
            implementation(libs.ktor.client.darwin)
        }
    }
    ```
    
    - 将 `ktor-client-core` 添加到 `commonMain` 源集，以便在共享代码中启用 Ktor 客户端功能。
    - 在 `androidMain` 源集中，包含 `ktor-client-okhttp` 依赖项以便在 Android 上使用 `OkHttp` 引擎。此外，您也可以从[其他可用的 Android/JVM 引擎](client-engines.md#jvm-android)中进行选择。
    - 在 `iosMain` 源集中，添加 `ktor-client-darwin` 依赖项以便在 iOS 上使用 Darwin 引擎。

### 添加协程 {id="coroutines"}

要在 [Android 代码](#android-activity)中使用协程，您需要将 `kotlinx.coroutines` 添加到您的项目中：

1. 打开
   <Path>gradle/libs.versions.toml</Path>
   文件并指定协程版本和库：

    ```kotlin
    [versions]
    kotlinx-coroutines = "1.10.2"
    
    [libraries]
    kotlinx-coroutines-core = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-core", version.ref = "kotlinx-coroutines" }
    kotlinx-coroutines-android = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-android", version.ref = "kotlinx-coroutines" }
    ```

2. 打开
   <Path>shared/build.gradle.kts</Path>
   文件并将 `kotlinx-coroutines-core` 依赖项添加到 `commonMain` 源集：

    ```kotlin
    sourceSets {
        commonMain.dependencies {
            implementation(libs.ktor.client.core)
            implementation(libs.kotlinx.coroutines.core)
        }
    }
    ```

3. 然后，打开
   <Path>composeApp/build.gradle.kts</Path>
   文件并将 `kotlinx-coroutines-android` 依赖项添加到 `androidMain` 源集：

   ```kotlin
   sourceSets {
       androidMain.dependencies {
           // ...
           implementation(libs.kotlinx.coroutines.android)
       }
   }
   ```

4. 选择 **Build | Sync Project with Gradle Files** 来安装添加的依赖项。

## 更新您的应用程序 {id="code"}

### 共享代码 {id="shared-code"}

要更新 Android 和 iOS 之间的共享代码，请打开
<Path>shared/src/commonMain/kotlin/com/example/ktor/kmpktor/Greeting.kt</Path>
文件，并在 `Greeting` 类中添加以下代码：

```kotlin
package com.example.ktor.kmpktor

import io.ktor.client.HttpClient
import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText

class Greeting {
    private val client = HttpClient()

    suspend fun greet(): String {
        val response = client.get("https://ktor.io/docs/")
        return response.bodyAsText()
    }
}
```

- `HttpClient` 构造函数用于创建 HTTP 客户端。
- 挂起函数 `greet()` 发起一个[请求](client-requests.md)并以字符串值形式接收[响应](client-responses.md)体。

### Android 代码 {id="android-activity"}

打开
<Path>composeApp/src/androidMain/kotlin/com/example/ktor/kmpktor/App.kt</Path>
文件并按如下方式更新代码：

```kotlin
package com.example.ktor.kmpktor

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeContentPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import org.jetbrains.compose.ui.tooling.preview.Preview

@Composable
@Preview
fun App() {
    MaterialTheme {
        Column(
            modifier = Modifier
                .background(MaterialTheme.colorScheme.primaryContainer)
                .safeContentPadding()
                .fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            var text by remember { mutableStateOf("Loading") }
            LaunchedEffect(true) {
                text = try {
                    Greeting().greet()
                } catch (e: Exception) {
                    e.message ?: "error"
                }
            }
            GreetingView(text)
        }
    }
}

@Composable
fun GreetingView(text: String) {
    Text(text = text)
}

@Preview
@Composable
fun DefaultPreview() {
    MaterialTheme {
        GreetingView("Hello, Android!")
    }
}
```

`LaunchedEffect()` 启动一个与可组合项生命周期绑定的协程。在此协程中，调用共享的 `greet()` 函数，将其结果赋值给 `text`，并捕获并处理任何异常。

### iOS 代码 {id="ios-view"}

打开
<Path>iosApp/iosApp/ContentView.swift</Path>
文件并按以下方式更新代码：

```Swift
import SwiftUI
import Shared

struct ContentView: View {
    @StateObject private var viewModel = ViewModel()

    var body: some View {
        Text(viewModel.text)
    }
}

extension ContentView {
    @MainActor
    class ViewModel: ObservableObject {
        @Published var text = "Loading..."
        init() {
            Greeting().greet { greeting, error in
                if let greeting = greeting {
                    self.text = greeting
                } else {
                    self.text = error?.localizedDescription ?? "error"
                }
            }
        }
    }
}
```

在 iOS 上，挂起函数 `greet()` 以带有回调的函数形式提供。

## 在 Android 上启用互联网访问 {id="android-internet"}

最后一步是为 Android 应用程序启用互联网访问。
打开
<Path>composeApp/src/androidMain/AndroidManifest.xml</Path>
文件并使用 `&lt;uses-permission&gt;` 元素启用所需权限：

```xml
<manifest>
    <uses-permission android:name="android.permission.INTERNET" />
    <application>
        ...
    </application>
</manifest> 
```

## 在 Android 上运行您的应用程序 {id="run-android"}

1. 在 IntelliJ IDEA 的运行配置列表中选择 **composeApp**。
2. 在配置列表旁边选择一个 Android 虚拟设备，然后点击 **Run**。
   ![已选择带有 Pixel 8 API 设备的 composeApp](tutorial_client_kmp_run_android.png){width="381" style="block"}

   如果列表中没有设备，请创建一个[新的 Android 虚拟设备](https://developer.android.com/studio/run/managing-avds#createavd)。
3. 加载完成后，模拟器应将接收到的 HTML 文档显示为纯文本。
   ![Android 模拟器](tutorial_client_kmp_android.png){width="381" style="block"}

> 如果您的 Android 模拟器无法连接到互联网，请尝试进行冷启动。在 **Device Manager** 工具窗口中，点击停止设备旁边的 **⋮** (三个点)，然后从菜单中选择 **Cold Boot**。这通常有助于清除可能导致连接问题的损坏模拟器缓存。
>
{style="tip"}

## 在 iOS 上运行您的应用程序 {id="run-ios"}

1. 在 IntelliJ IDEA 的运行配置列表中选择 **iosApp**。
2. 在配置列表旁边选择一个 iOS 模拟设备，然后点击 **Run**。
   ![已选择带有 iPhone 16 设备的 iosApp](tutorial_client_kmp_run_ios.png){width="381" style="block"}

   如果列表中没有可用的 iOS 配置，请添加一个[新的运行配置](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-create-first-app.html#run-on-a-new-ios-simulated-device)。
3. 加载完成后，模拟器应将接收到的 HTML 文档显示为纯文本。
   ![iOS 模拟器](tutorial_client_kmp_ios.png){width="381" style="block"}