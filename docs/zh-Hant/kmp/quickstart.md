[//]: # (title: Kotlin Multiplatform 快速入門)

<web-summary>JetBrains 為 IntelliJ IDEA 和 Android Studio 提供官方 Kotlin IDE 支援。</web-summary>

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

在本教學中，你將學習如何建置並執行一個帶有 Compose Multiplatform UI 的簡易 Kotlin Multiplatform 應用程式。

## 選擇建置工具 {id="choose-a-build-tool"}

本快速入門指南使用 Gradle 在 IDE 中建立並執行新的 Kotlin Multiplatform 專案。
Gradle 同時支援新專案以及已在使用它的既有專案。
本快速入門專為想要將 Kotlin Multiplatform 引入其專案、或僅僅希望在熟悉環境中操作的 Gradle 使用者而設計。

對於全新專案，你也可以嘗試 Kotlin Toolchain，
這是 JetBrains 專為 Kotlin Multiplatform 打造的工具。
它提供 CLI 和透明的設定格式，非常適合 AI 工作流程。

<Links href="/kmp/kotlin-toolchain" summary="undefined">使用 Kotlin Toolchain 開始使用 KMP</Links>

## 設定環境 {id="set-up-the-environment"}

設定 IntelliJ IDEA 或 Android Studio、`ANDROID_HOME` 環境變數以及 Xcode：

1. 選擇並安裝 IDE：IntelliJ IDEA 和 Android Studio 均完整支援 KMP。
    
    我們建議使用 [JetBrains Toolbox 應用程式](https://www.jetbrains.com/toolbox/app/) 安裝 IDE。
    若要進行獨立安裝，請下載 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 
    或 [Android Studio](https://developer.android.com/studio) 的安裝程式。

    為獲得最佳效果，請使用最新的穩定版本。

2. 安裝 Kotlin Multiplatform IDE 外掛程式。
   你可以在外掛程式市場中找到它（**Settings | Plugins | Marketplace**），
   或從[外掛程式網頁](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)安裝。
    
3. 如果你尚未設定 `ANDROID_HOME` 環境變數，請設定系統以識別它：

    <Tabs>
    <TabItem title= "Bash or Zsh">
   
    將以下指令新增至你的 `.profile` 或 `.zprofile`：
        
    ```shell
    export ANDROID_HOME=~/Library/Android/sdk
    ```
   
    </TabItem>
    <TabItem title= "Windows PowerShell or CMD">

    對於 PowerShell，你可以使用以下指令新增永久環境變數
    （詳情請參閱 [PowerShell 文件](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_environment_variables)）：

    ```shell
    [Environment]::SetEnvironmentVariable('ANDROID_HOME', '<path to the SDK>', 'Machine')
    ```

    對於 CMD，請使用 [`setx`](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/setx) 指令：
    
    ```shell
    setx ANDROID_HOME "<path to the SDK>"
    ```
    </TabItem>
    </Tabs>

4. 若要建立 iOS 應用程式，你需要一台安裝了 [Xcode](https://apps.apple.com/us/app/xcode/id497799835) 的 macOS 電腦。
    你的 IDE 會在底層執行 Xcode 來建置 iOS 框架。

    在開始處理 KMP 專案之前，請確保至少啟動 Xcode 一次，以便它完成
    初始設定。

    > 每次 Xcode 更新時，你都必須手動啟動它並下載更新的工具集。
    > Kotlin Multiplatform IDE 外掛程式會執行預先檢查（Preflight Checks），並在 Xcode 設定不正確時發出警示。
    >
    {style="note"}

## 建立專案 {id="create-a-project"}

<Tabs>
<TabItem title= "IntelliJ IDEA">

使用 Kotlin Multiplatform 產生器建立專案：

1. 在主功能表中選取 **File** | **New** | **Project**。
2. 在左側清單中選擇 **Kotlin Multiplatform**。
   依需求設定 **Name** 和 **Location**。
   **Project ID** 會根據名稱自動產生。
3. 本頁其餘部分描述的是 **Gradle** 專案：請確保在 **Build system** 切換開關中選中了它以繼續。
4. 若要體驗所有支援的平台，請選取 Android、iOS、Desktop、Web 和 Server。
   在 **UI implementation** 選項中，保留選取 **Share UI**，以便在對應的目標平台中使用 Compose Multiplatform 作為 UI 架構。

   > Desktop 目標會自動包含 [Compose Hot Reload](compose-hot-reload.md) 功能，讓你在程式碼中儲存變更後，
   > 即可立即看到 UI 的變化。
   > 即使你目前不打算開發桌面應用程式，也可以在專案中新增 Desktop 目標，以加快
   > UI 程式碼的迭代速度。
   > 
   {style="note"}

5. 點擊 **Create** 按鈕，等待 IDE 產生並匯入專案。

![IntelliJ IDEA 精靈，採用預設設定並選取了 Android、iOS、Desktop 和 Web 平台](idea-wizard-1step.png){width=600}

</TabItem>
<TabItem title= "Android Studio">

使用精靈建立新專案：

1. 在主功能表中選取 **File** | **New** | **New project**。
2. 在預設的 **Phone and Tablet** 範本類別中選擇 **Kotlin Multiplatform**。

    ![Android Studio 中的建立新專案第一步](as-wizard-1.png){width="400"}

3. 依需求設定專案名稱、套件名稱和儲存位置，然後點擊 **Next**。
   **Build configuration language** 應保持設定為 Kotlin DSL。
4. 若要建立完整的示範，請選擇所有可用平台：Android、iOS、Desktop、Web 和 Server。
   在有提供的地方保留選取 **Share UI** 選項，以便在對應的目標平台中使用 Compose Multiplatform 作為 UI 架構。

   > Desktop 目標會自動包含 [Compose Hot Reload](compose-hot-reload.md) 功能，讓你在程式碼中儲存變更後，
   > 即可立即看到 UI 的變化。
   > 即使你目前不打算開發桌面應用程式，也可以在專案中新增 Desktop 目標，以加快
   > UI 程式碼的迭代速度。
   >
   {style="note"}

5. 點擊 **Finish** 按鈕，等待 IDE 產生並匯入專案。

![Android Studio 精靈的最後一步，選取了 Android、iOS、Desktop 和 Web 平台](as-wizard-3step.png){width=600}

</TabItem>
</Tabs>

你可以在 `shared` 模組中找到跨平台共享的程式碼。
`Platform.kt` 檔案包含用於取得平台名稱的 [`expect`](multiplatform-expect-actual.md) 宣告。

當你為不同平台執行應用程式時，可以看到相同的 UI 配置，但顯示由原生呼叫所提供的不同平台名稱。

## 查閱預先檢查 {id="consult-the-preflight-checks"}

為確保專案設定不存在環境問題，
請開啟 **Project Environment Preflight Checks** 工具視窗：
點擊右側邊欄或底列上的預先檢查圖示 ![帶有飛機圖示的 Project Environment Preflight Checks 圖示](ide-preflight-checks.png){width="20"}。

在此工具視窗中，你可以檢視哪些檢查已通過、重新執行檢查或變更其設定。
通常，該視窗在偵測到問題時會自動開啟，否則會保持隱藏。

預先檢查指令也可在 **Search Everywhere** 對話方塊中使用。
按兩下 <shortcut>Shift 鍵</shortcut> 並搜尋包含「preflight」單字的指令：

![輸入了「preflight」單字的 Search Everywhere 功能表](double-shift-preflight-checks.png){width=600}

## 產生的專案中的模組 {id="modules-in-the-generated-project"}

根據你在 Kotlin Multiplatform 精靈中選取的平台組合，
在 IDE 匯入專案後，你會看到以下模組：

* **androidApp** 是建置 Android 應用程式的模組。
* **desktopApp** 是建置桌面 JVM 應用程式的模組。
* **iosApp** 是一個用於建置 iOS 應用程式的 Xcode 專案。它相依於 **shared** 模組並將其作為 iOS 框架使用。
* **shared** 是一個 Kotlin Multiplatform 模組，包含 Android、Desktop、iOS 和 Web 應用程式的通用程式碼。
* **webApp** 是建置 Web 應用程式的模組，同時支援 Kotlin/JS 與 Kotlin/Wasm。
* **server** 和 **core** 模組僅在選擇了 Server 平台時才會建立：
  **core** 保存伺服器與用戶端應用程式之間共用的程式碼；
  **server** 設定端點。

  > 當選取 Server 平台時，IDE 會將應用程式入口點歸類在 `app` 目錄下。
  > 否則，app 模組將直接建立在專案根目錄中。
  >
  {style="tip"} 

`shared` 模組會針對每個目標分別進行編譯。
例如，在建置 Android 應用程式時，它會被視為 Kotlin/JVM 模組；在建置 iOS 應用程式時，則被視為 Kotlin/Native。

## 執行範例應用程式 {id="run-the-sample-apps"}

IDE 精靈建立的專案包含了為 iOS、Android、
Desktop 和 Web 應用程式產生的运行配置，以及用於執行伺服器應用程式的 Gradle 任務。

若要啟動运行配置，請在 IDE 右上角找到下拉式功能表，
然後點擊 **Run** 按鈕：

<Tabs>
<TabItem title="Android">

若要執行 Android 應用程式，請啟動 **androidApp** 运行配置：

![醒目顯示 Android 运行配置的下拉式選單](run-android-configuration.png){width=250}

預設情況下，它會在第一個可用的虛擬裝置上執行：

![在虛擬裝置上執行的 Android 應用程式](run-android-app.png){width=300}

若要手動建立 Android 运行配置（**Run | Edit Configurations**），
請選擇 **Android App** 作為运行配置範本，並選取模組 **[專案名稱].androidApp**。

</TabItem>
<TabItem title="iOS">

> 你需要一台安裝了 Xcode 的 macOS 電腦來建置 iOS 應用程式。
>
{style="note"}

選取 **iosApp** 运行配置及模擬裝置：

![醒目顯示 iOS 运行配置的下拉式選單](run-ios-configuration.png){width=250}

該运行配置會在底層使用 Xcode 建置 iOS 應用程式，並使用 iOS 模擬器啟動它。
首次建置會收集原生相依性並快取建置資料，以便加快後續執行的速度：

![在虛擬裝置上執行的 iOS 應用程式](run-ios-app.png){width=350}

</TabItem>
<TabItem title="Desktop">

桌面應用程式的預設运行配置會建立為 **desktopApp [hot] 🔥**：

![醒目顯示預設桌面运行配置的下拉式選單](run-desktop-configuration.png){width=250}

透過此配置，你可以執行 JVM 桌面應用程式：

![JVM 應用程式](run-desktop-app.png){width=600}

若要手動建立支援 Hot Reload 的桌面运行配置（**Run | Edit Configurations**），
請選擇 **Gradle** 运行配置範本，並使用以下指令指向 **[應用程式名稱]:desktopApp** Gradle 專案：

```shell
hotRun --mainClass "com.example.demo.MainKt"
```

</TabItem>
<TabItem title="Web">

預設情況下，會為 Web 建立兩個运行配置：**webApp [wasmJs]** 和 **webApp [js]**。
兩者執行的是同一個應用程式，分別透過 Kotlin/Wasm 或 Kotlin/JS 建置：

![醒目顯示預設 Wasm 运行配置的下拉式選單](run-wasm-configuration.png){width=250}

當你執行此配置時，IDE 會建置 Kotlin/Wasm 應用程式並在預設瀏覽器中開啟它：

![瀏覽器中的 Web 應用程式](run-wasm-app.png){width=600}

若要手動建立 Web 运行配置，請選擇 **Gradle** 运行配置範本，並使用 `wasmJsBrowserDevelopmentRun` 任務指向
**[應用程式名稱]:webApp** Gradle 專案；若為 Kotlin/JS 版本，則使用 `jsBrowserDevelopmentRun` 任務。

</TabItem>
</Tabs>

## 疑難排解 {id="troubleshooting"}

Kotlin Multiplatform 設定的問題通常發生在 Java、Android SDK 或 Xcode 未正確配置的情況下。  

### Java 與 JDK {id="java-and-jdk"}

以下是與 Java 設定相關的最常見問題：

* 某些工具可能找不到 Java 安裝，或使用了錯誤的版本。
  若要解決此問題，請將 `JAVA_HOME` 環境變數設定為安裝適當 JDK 的目錄
  （我們建議使用 [JetBrains Runtime](https://github.com/JetBrains/JetBrainsRuntime)），
  然後將 `JAVA_HOME` 內的 `bin` 資料夾路徑附加到 `PATH` 變數中。
* 如果你在 Android Studio 中遇到 Gradle JDK 的問題，請確保其設定正確：
  選取 **Settings** | **Build, Execution, Deployment** | **Build Tools** | **Gradle**。

### Android 工具 {id="android-tools"}

如果你在啟動 `adb` 等 Android 工具時遇到問題，
請確保將 `ANDROID_HOME/tools`、`ANDROID_HOME/tools/bin` 和
`ANDROID_HOME/platform-tools` 的路徑新增至你的 `PATH` 環境變數中。

### Xcode {id="xcode"}

如果你的 iOS 运行配置回報沒有可供執行的虛擬裝置，或者預先檢查失敗，
請確保啟動 Xcode 並檢查是否有 iOS SDK 更新。

### 尋求協助 {id="get-help"}

* **Kotlin Slack**：取得[邀請函](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)並加入 [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 頻道。
* **Kotlin Multiplatform Tooling 問題追蹤器**：[回報新問題](https://youtrack.jetbrains.com/newIssue?project=KMT)。

## 後續步驟 {id="what-s-next"}

進一步了解 KMP 專案的結構以及編寫共享程式碼：

* [完全共享程式碼：時區選擇器應用程式](compose-multiplatform-new-project.md)：初學者教學，指導你如何使用 Compose Multiplatform 處理共享 UI 程式碼。
* [原生 UI：REST API 請求的共用邏輯](multiplatform-upgrade-app.md)：初學者教學，指導如何在具有原生 UI 程式碼的多平台專案中處理共用程式碼。 

深入探討特定的 Kotlin Multiplatform 使用案例：

* [處理多平台相依性](multiplatform-add-dependencies.md)
* [圍繞多平台構件組織程式碼和構件](multiplatform-project-configuration.md)
* 了解 Compose Multiplatform UI 架構及其在 Compose 生態系統中的定位：[Compose Multiplatform 與 Jetpack Compose 的關係](compose-multiplatform-and-jetpack-compose.md)

探索已為 KMP 編寫的程式碼：

* [範例](multiplatform-samples.md)：官方 JetBrains 範例，以及展示 KMP 功能的精選專案清單。
* GitHub 主題：
  * [kotlin-multiplatform](https://github.com/topics/kotlin-multiplatform)：使用 Kotlin Multiplatform 實作的專案。
  * [kotlin-multiplatform-sample](https://github.com/topics/kotlin-multiplatform-sample)：使用 KMP 編寫的範例專案清單。
* [klibs.io](https://klibs.io)：KMP 程式庫搜尋平台。
  它對 GitHub 專案和 Maven Central 構件建立索引，允許對搜尋結果進行精細篩選，
  並提供[對 AI 工作流程的支援](https://klibs.io/ai)。