[//]: # (title: 建立您的 Compose Multiplatform 應用程式)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
    <p>本教學使用 IntelliJ IDEA，但您也可以在 Android Studio 中進行 —— 這兩個 IDE 共享相同的核心功能與 Kotlin Multiplatform 支援。</p>
    <br/>
    <p>這是<strong>使用共享邏輯與 UI 建立 Compose Multiplatform 應用程式</strong>教學的第一部分。</p>
    <p><img src="icon-1.svg" width="20" alt="第一步"/> <strong>建立您的 Compose Multiplatform 應用程式</strong><br/>
        <img src="icon-2-todo.svg" width="20" alt="第二步"/> 探索可組合程式碼 <br/>
        <img src="icon-3-todo.svg" width="20" alt="第三步"/> 修改專案 <br/>      
        <img src="icon-4-todo.svg" width="20" alt="第四步"/> 建立您自己的應用程式 <br/>
    </p>
</tldr>

在此，您將學習如何使用 IntelliJ IDEA 建立並執行您的第一個 Compose Multiplatform 應用程式。

透過 [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/) UI 架構，您可以將 Kotlin Multiplatform 的程式碼共享能力擴展到應用程式邏輯之外。您可以實作一次使用者介面，然後將其用於 Compose Multiplatform 支援的所有平台。

在本教學中，您將建置一個可在 Android、iOS、桌面與 Web 上執行的範例應用程式。為了建立使用者介面，您將使用 Compose Multiplatform 架構並學習其基礎知識：可組合函式（composable function）、主題、版面配置、事件與修飾符（modifier）。

本教學中需要注意的事項：
* 不需要具備 Compose Multiplatform、Android 或 iOS 的相關經驗。我們建議您在開始之前先熟悉 [Kotlin 基礎知識](https://kotlinlang.org/docs/getting-started.html)。
* 要完成本教學，您只需要 IntelliJ IDEA。它允許您嘗試 Android 和桌面平台的多平台開發。對於 iOS，您將需要一台安裝了 Xcode 的 macOS 電腦。這是 iOS 開發的一般限制。
* 如果您願意，可以只選擇您感興趣的特定平台，並忽略其他平台。

## 建立專案

1. 在[快速入門指南](quickstart.md)中，完成[設定您的 Kotlin Multiplatform 開發環境](quickstart.md#set-up-the-environment)的指示。
2. 在 IntelliJ IDEA 中，選取 **File** | **New** | **Project**。
3. 在左側面板中，選取 **Kotlin Multiplatform**。

    > 如果您沒有使用 Kotlin Multiplatform IDE 外掛程式，您可以使用 [KMP Web 精靈](https://kmp.jetbrains.com/?android=true&ios=true&iosui=compose&desktop=true&web=true&includeTests=true)產生相同的專案。
    >
    {style="note"}

4. 在 **New Project** 視窗中指定以下欄位：

    * **Name**: ComposeDemo
    * **Project ID**（作為套件名稱使用）：compose.project.demo

5. 選取 **Android**、**iOS**、**Desktop** 和 **Web** 目標。
    確保 iOS 和 Web 選取了 **Share UI** 選項。
6. 指定所有欄位與目標後，按一下 **Create**（Web 精靈中為 **Download**）。

   ![建立 Compose Multiplatform 專案](create-compose-multiplatform-project.png){width=800}

## 檢查專案結構

在 IntelliJ IDEA 中，導覽至 `ComposeDemo` 資料夾。
如果您在精靈中沒有選取 iOS，則不會有名稱為 "ios" 或 "apple" 開頭的資料夾。

> IDE 可能會自動建議將專案中的 Android Gradle 外掛程式升級至最新版本。
> 我們不建議升級，因為 Kotlin Multiplatform 與最新的 AGP 版本不相容
>（請參閱 [相容性表格](https://kotlinlang.org/docs/multiplatform-compatibility-guide.html#version-compatibility)）。
>
{style="note"}

該專案包含以下模組：

* **shared** 是一個 Kotlin Multiplatform 模組，包含 Android、桌面、iOS 和 Web 應用程式之間共享的邏輯 —— 即您用於所有平台的程式碼。它使用 [Gradle](https://kotlinlang.org/docs/gradle.html) 作為建置系統，協助您自動化建置過程。
* **androidApp** 是建置為 Android 應用程式的模組。
* **iosApp** 是一個 Xcode 專案，可建置為 iOS 應用程式。它相依於並將 shared 模組作為 iOS 框架使用。
* **desktopApp** 是建置為桌面 JVM 應用程式的模組。它相依於 `shared` 模組。
* **webApp** 是建置為 Web 應用程式（包含 Kotlin/JS 和 Kotlin/Wasm）的模組。

![Compose Multiplatform 專案結構](compose-project-structure.png){width=400}

**shared** 模組包含以下原始碼集：`androidMain`、`commonMain`、`iosMain`、`jsMain`、`jvmMain` 和 `wasmJsMain`（如果您選擇包含測試，則還有以 `-Test` 結尾的伴隨原始碼集）。

「原始碼集」是一個 Gradle 概念，指邏輯上分組在一起的若干檔案，其中每個組都有自己的相依性。在 Kotlin Multiplatform 中，不同的原始碼集通常針對不同的平台。

`commonMain` 原始碼集使用通用 Kotlin 程式碼，而平台原始碼集使用針對每個目標的特定 Kotlin 程式碼：

* `jvmMain` 包含桌面的原始碼檔案，使用 Kotlin/JVM。
* `androidMain` 包含 Android 原始碼檔案並針對 Kotlin/JVM。
* `iosMain` 包含 iOS 的 Kotlin 程式碼並針對 Kotlin/Native。
* `jsMain` 包含 JavaScript 特定的 Kotlin 程式碼並針對 Kotlin/JS。
* `wasmJsMain` 包含 Wasm 特定的 Kotlin 程式碼並針對 Kotlin/Wasm。

當 `shared` 模組建置為 Android 程式庫時，通用的 Kotlin 程式碼會被視為 Kotlin/JVM。當它建置為 iOS 框架時，通用的 Kotlin 程式碼會被視為 Kotlin/Native。當 shared 模組建置為 Web 應用程式時，通用的 Kotlin 程式碼可以根據需要被視為 Kotlin/Wasm 或 Kotlin/JS。

![通用 Kotlin、Kotlin/JVM 與 Kotlin/Native](module-structure.svg){width=700}

通常情況下，盡可能將您的實作撰寫為通用程式碼，以便利用只需實作一次即可在各平台運作的功能。理想情況下，平台特定的原始碼集僅包含平台特定的 API 呼叫和 UX 流程。

在 `shared/src/commonMain/kotlin` 目錄中，開啟 `App.kt` 檔案。它包含 `App()` 函式，實作了一個極簡但完整的 Compose Multiplatform UI：

```kotlin
@Composable
@Preview
fun App() {
    MaterialTheme {
        var showContent by remember { mutableStateOf(false) }
        Column(
            modifier = Modifier
                .background(MaterialTheme.colorScheme.primaryContainer)
                .safeContentPadding()
                .fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Button(onClick = { showContent = !showContent }) {
                Text("Click me!")
            }
            AnimatedVisibility(showContent) {
                val greeting = remember { Greeting().greet() }
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Image(painterResource(Res.drawable.compose_multiplatform), null)
                    Text("Compose: $greeting")
                }
            }
        }
    }
}
```
{id="common-app-composable"}

讓我們在所有支援的平台上執行應用程式。

## 執行您的應用程式

您可以在 Android、iOS、桌面與 Web 上執行應用程式。您不需要按任何特定順序執行應用程式，因此請從您最熟悉的平台開始。

> 提供的執行配置比一般的 Gradle 建置任務更有效率。
> 執行配置僅會觸發對應目標的建置，而預設的 Gradle 任務會建置所有目標的偵錯版本與發佈版本。
>
{style="tip"}

### 在 Android 上執行您的應用程式

1. 在執行配置清單中，選取 **androidApp**。
2. 選擇您的 Android 虛擬裝置，然後按一下 **Run**：如果選取的虛擬裝置已關閉，您的 IDE 會啟動它並執行應用程式。

![在 Android 上執行 Compose Multiplatform 應用程式](compose-run-android.png){width=352}

![Android 上的第一個 Compose Multiplatform 應用程式](first-compose-project-on-android-1.png){width=352}

<snippet id="run_android_other_devices">

#### 在不同的 Android 模擬裝置上執行 {initial-collapse-state="collapsed" collapsible="true"}

了解如何 [配置 Android 模擬器並在不同的模擬裝置上執行您的應用程式](https://developer.android.com/studio/run/emulator#runningapp)。

#### 在實體 Android 裝置上執行 {initial-collapse-state="collapsed" collapsible="true"}

了解如何 [配置並連接硬體裝置並在其上執行您的應用程式](https://developer.android.com/studio/run/device)。

</snippet>

### 在 iOS 上執行您的應用程式

如果您尚未在初始設定中啟動過 Xcode，請在執行 iOS 應用程式之前先啟動。

在 IntelliJ IDEA 中，於執行配置清單中選取 **iosApp**，在執行配置旁選取模擬裝置，然後按一下 **Run**。

![在 iOS 上執行 Compose Multiplatform 應用程式](compose-run-ios.png){width=405}

![iOS 上的第一個 Compose Multiplatform 應用程式](first-compose-project-on-ios-1.png){width=411}

<snippet id="run_ios_other_devices">

#### 在實體 iOS 裝置上執行 {initial-collapse-state="collapsed" collapsible="true"}

您可以在實體 iOS 裝置上執行您的多平台應用程式。在開始之前，您需要設定與您的 [Apple ID](https://support.apple.com/en-us/HT204316) 關聯的團隊 ID。

##### 設定您的團隊 ID

若要首次為您的專案設定新的團隊 ID，請在 Xcode 中開啟專案（**File | Open Project in Xcode**）：

1. 在左側的 Project navigator 中，選取 **iosApp**。
2. 在 **Targets** 下選取 **iosApp**，並切換到 **Signing & Capabilities** 標籤。
3. 在 **Team** 清單中，選取您的團隊。

   如果您尚未設定團隊，請使用 **Team** 清單中的 **Add an Account** 選項，並按照 Xcode 指示操作。

4. 確保套件識別碼是唯一的，且簽署憑證已成功指派。

在 Xcode 中設定好團隊後，您可以在 IntelliJ IDEA 中設定或更改團隊：

1. 編輯 **iosApp** 的執行配置：

   ![編輯 iOS 執行配置](ios-edit-configurations.png){width=450}

2. 切換到 **Options** 標籤，在 **Development team** 下拉選單中進行必要的變更，然後按一下 **OK**。

##### 執行應用程式

使用傳輸線連接您的 iPhone。如果您已經在 Xcode 中註冊過該裝置，IntelliJ IDEA 應該會將其顯示在執行配置清單中。執行對應的 `iosApp` 配置。

如果您尚未在 Xcode 中註冊您的 iPhone，請遵循 [Apple 建議](https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device/)。簡而言之，您應該：

1. 使用傳輸線連接您的 iPhone。
2. 在您的 iPhone 上，於 **設定** | **隱私權與安全性** 中啟用開發者模式。
3. 在 Xcode 中，前往頂部功能表並選擇 **視窗 (Window)** | **裝置與模擬器 (Devices and Simulators)**。
4. 如果您的 iPhone 沒有顯示為已連接，請按一下左下角的加號並選取它。
5. 按照螢幕上的指示完成配對程序。

在 Xcode 中註冊 iPhone 後，當您選取 **iosApp** 執行配置時，它將出現在 IntelliJ IDEA 的可用裝置清單中。

</snippet>

### 在桌面上執行您的應用程式

在執行配置清單中選取 **desktopApp [hot] 🔥**，然後按一下 **Run**。
預設情況下，該執行配置會在自己的作業系統視窗中啟動桌面應用程式，並執行 [Compose 即時重載（Hot Reload）](compose-hot-reload.md)：

![在桌面上執行 Compose Multiplatform 應用程式](compose-run-desktop.png){width=350}

![桌面上的第一個 Compose Multiplatform 應用程式](first-compose-project-on-desktop-1.png){width=500}

### 執行您的 Web 應用程式

1. 在執行配置清單中，選取：

   * **webApp[js]**: 執行您的 Kotlin/JS 應用程式。
   * **webApp[wasmJs]**: 執行您的 Kotlin/Wasm 應用程式。

2. 按一下 **Run**。

Web 應用程式會自動在您的預設瀏覽器中開啟，預設情況下可透過 `http://localhost:8080/` 存取。

> 連接埠號碼可能會有所不同，因為 8080 連接埠可能無法使用。
> 您可以在 Gradle 建置主控台中搜尋 "Project is running at" 字樣來找到實際的連接埠號碼。
>
{style="tip"}

![Compose Web 應用程式](first-compose-project-on-web.png){width=600}

#### Web 目標的相容性模式

您可以為您的 Web 應用程式啟用相容性模式，以確保其開箱即可在所有瀏覽器上運作。
在這種模式下，現代瀏覽器使用 Wasm 版本，而較舊的瀏覽器則回退到 JS 版本。
此模式是透過對 `js` 與 `wasmJs` 目標進行交叉編譯（cross-compilation）來實現的。

要為您的 Web 應用程式啟用相容性模式：

1. 選取 **View | Tool Windows | Gradle** 開啟 Gradle 工具視窗。
2. 在 **ComposeDemo | Tasks | compose** 中，選取並執行 **composeCompatibilityBrowserDistribution** 任務。

   > 您至少需要 Java 11 作為您的 Gradle JVM 才能成功載入任務，我們通常建議在 Compose Multiplatform 專案中使用至少 JetBrains Runtime 17。
   >
   {style="note"}

   ![執行相容性任務](web-compatibility-gradle-task.png){width=500}

   或者，您可以在終端機中從 `ComposeDemo` 根目錄執行以下指令：

    ```bash
    ./gradlew composeCompatibilityBrowserDistribution
    ```

一旦 Gradle 任務完成，相容的產物會產生在
`composeApp/build/dist/composeWebCompatibility/productionExecutable` 目錄中。
您可以使用這些產物來[發佈您的應用程式](https://kotlinlang.org/docs/wasm-get-started.html#publish-the-application)，使其在 `js` 和 `wasmJs` 目標上都能運作。

## 下一步

在教學的下一部分中，您將學習如何實作可組合函式並在每個平台上啟動您的應用程式。

**[繼續前往下一部分](compose-multiplatform-explore-composables.md)**

## 取得協助

* **Kotlin Slack**。取得 [邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up) 並加入
  [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 頻道。
* **Kotlin 問題追蹤器**。[回報新問題](https://youtrack.jetbrains.com/newIssue?project=KT)。