[//]: # (title: 建立跨平台行動應用程式)

<show-structure for="chapter" depth="2"/>

<tldr>
<var name="example_name" value="tutorial-client-kmp"/>
<p>
    <b>程式碼範例</b>：
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
</tldr>

<link-summary>
了解如何在 Kotlin Multiplatform Mobile 應用程式中使用 Ktor 用戶端。
</link-summary>

Ktor HTTP 用戶端可用於多平台專案中。在本教學中，我們將建立一個簡單的 Kotlin Multiplatform Mobile 應用程式，用於傳送請求並以純 HTML 文字形式接收回應主體。

## 前置準備 {id="prerequisites"}

首先，您需要透過在合適的作業系統上安裝必要的工具，來設定跨平台行動開發的環境。請參閱[設定環境](https://kotlinlang.org/docs/multiplatform-mobile-setup.html)章節了解操作方式。

> 您將需要一台搭載 macOS 的 Mac 來完成本教學中的特定步驟，包含撰寫 iOS 專用程式碼以及執行 iOS 應用程式。
>
{style="note"}

## 建立新專案 {id="new-project"}

若要建立新專案，您可以使用 IntelliJ IDEA 中的 Kotlin Multiplatform 專案精靈。它將建立一個基礎的多平台專案，後續您可以為其擴充用戶端與服務。

<procedure>

1. 啟動 IntelliJ IDEA。
2. 在 IntelliJ IDEA 中，選取 **File | New | Project**。
3. 在左側面板中，選取 **Kotlin Multiplatform**。
4. 在 **New Project** 視窗中指定以下欄位：
    * **Name**：KmpKtor
    * **Group**：org.example.ktor
      ![Kotlin Multiplatform 精靈設定](tutorial_client_kmp_create_project.png){ width="450" width="706" border-effect="rounded" style="block" }
5. 選取 **Gradle** 建構系統。
6. 選取 **Android** 與 **iOS** 目標。
7. 針對 iOS，選取 **Do not share UI** 選項以保留原生 UI。
8. 點擊 **Create** 按鈕，等待 IDE 產生並匯入專案。

</procedure>

## 設定建置指令碼 {id="build-script"}

### 新增 Ktor 相依性 {id="ktor-dependencies"}

若要在專案中使用 Ktor HTTP 用戶端，您至少需要新增兩個相依性：用戶端相依性與[引擎](client-engines.md)相依性。

1. 開啟 <Path>settings.gradle.kts</Path> 檔案並匯入 Ktor 版本目錄（version catalog）：

    ```kotlin
    dependencyResolutionManagement {
        versionCatalogs {
            create("ktorLibs").from("io.ktor:ktor-version-catalog:3.6.1")
        }
    }
    ```

2. 開啟 <Path>sharedLogic/build.gradle.kts</Path> 檔案，並將預設引擎相依性新增至 `commonMain` 原始碼集：
    
    ```kotlin
    sourceSets {
        commonMain.dependencies {
            api(ktorLibs.client.engineDefaults)
        }
    }
    ```

   對於每個目標平台，Ktor 會使用由 `ktor-client-engine-defaults` 提供的預設引擎。

### 新增協同程式 {id="coroutines"}

若要在 [Android 程式碼](#android-activity)中使用協同程式，您需要將 `kotlinx.coroutines` 新增至專案中：

1. 開啟 <Path>gradle/libs.versions.toml</Path> 檔案，並指定協同程式版本與程式庫：

    ```toml
    [versions]
    kotlinx-coroutines = "1.11.0"
    
    [libraries]
    kotlinx-coroutines-core = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-core", version.ref = "kotlinx-coroutines" }
    kotlinx-coroutines-android = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-android", version.ref = "kotlinx-coroutines" }
    ```

2. 開啟 <Path>sharedLogic/build.gradle.kts</Path> 檔案，並將 `kotlinx-coroutines-core` 相依性新增至 `commonMain` 原始碼集：

    ```kotlin
    sourceSets {
        commonMain.dependencies {
            api(ktorLibs.client.engineDefaults)
            implementation(libs.kotlinx.coroutines.core)
        }
    }
    ```

3. 接著，開啟 <Path>androidApp/build.gradle.kts</Path> 檔案，並將 `kotlinx-coroutines-android` 相依性新增至 `androidMain` 原始碼集：

   ```kotlin
   dependencies {
       implementation(libs.kotlinx.coroutines.android)
   }
   ```

4. 選取 **Build | Sync Project with Gradle Files** 以安裝新增的相依性。

## 更新應用程式 {id="code"}

### 共用程式碼 {id="shared-code"}

若要更新 Android 與 iOS 之間共用的程式碼，請開啟 <Path>sharedLogic/src/commonMain/kotlin/org/example/ktor/Greeting.kt</Path> 檔案，並將以下程式碼新增至 `Greeting` 類別：

```kotlin
package org.example.ktor

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

* `HttpClient()` 建構函式用於建立 HTTP 用戶端。
* suspend 函式 `greet()` 會發出[請求](client-requests.md)，並以字串值形式接收[回應](client-responses.md)的主體。

### Android 程式碼 {id="android-activity"}

開啟 <Path>sharedUI/src/commonMain/kotlin/org/example/ktor/App.kt</Path> 檔案，並依下列方式更新程式碼：

```kotlin
package org.example.ktor

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeContentPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview

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

`LaunchedEffect()` 會啟動一個與該可組合項（composable）生命週期綁定的協同程式。在此協同程式內，會呼叫共用的 `greet()` 函式，並將其結果指派給 `text`，同時擷取並處理任何例外狀況。

### iOS 程式碼 {id="ios-view"}

開啟 <Path>iosApp/iosApp/ContentView.swift</Path> 檔案，並依下列方式更新程式碼：

```Swift
import SharedLogic
import SwiftUI

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

在 iOS 上，`greet()` suspend 函式會以帶有回呼（callback）的函式形式提供。

## 在 Android 上啟用網際網路存取 {id="android-internet"}

最後一個步驟是為 Android 應用程式啟用網際網路存取權限。
開啟 <Path>androidApp/src/main/AndroidManifest.xml</Path> 檔案，並使用 `<uses-permission>` 元素啟用所需的權限：

```xml
<manifest>
    <uses-permission android:name="android.permission.INTERNET" />
    <application>
        ...
    </application>
</manifest> 
```

## 在 Android 上執行應用程式 {id="run-android"}

1. 在 IntelliJ IDEA 中，於執行配置清單中選取 **androidApp**。
2. 在配置清單旁選取一個 Android 虛擬裝置，然後點擊 **Run**。
   ![已選取 androidApp 與 Pixel 8 API 裝置](tutorial_client_kmp_run_android.png){width="381" style="block"}

   如果清單中沒有裝置，請建立一個[新的 Android 虛擬裝置](https://developer.android.com/studio/run/managing-avds#createavd)。
3. 載入完成後，模擬器應會將接收到的 HTML 文件顯示為純文字。
   ![Android 模擬器](tutorial_client_kmp_android.png){width="381" style="block"}

> 如果您的 Android 模擬器無法連線至網際網路，請嘗試執行冷開機（Cold Boot）。
> 在 **Device Manager** 工具視窗中，點擊已停止裝置旁的 **⋮**（三個點），並從選單中選取 **Cold Boot**。這通常有助於清除可能導致連線問題的已損毀模擬器快取。
>
{style="tip"}

## 在 iOS 上執行應用程式 {id="run-ios"}

1. 在 IntelliJ IDEA 中，於執行配置清單中選取 **iosApp**。
2. 在配置清單旁選取一個 iOS 模擬裝置，然後點擊 **Run**。
   ![已選取 iosApp 與 iPhone 16 裝置](tutorial_client_kmp_run_ios.png){width="381" style="block"}

   如果清單中沒有可用的 iOS 設定，請新增一個[新的執行配置](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-create-first-app.html#run-on-a-new-ios-simulated-device)。
3. 載入完成後，模擬器應會將接收到的 HTML 文件顯示為純文字。
   ![iOS 模擬器](tutorial_client_kmp_ios.png){width="381" style="block"}