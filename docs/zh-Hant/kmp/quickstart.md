[//]: # (title: Kotlin Multiplatform 快速入門)

<web-summary>JetBrains 為 IntelliJ IDEA 與 Android Studio 提供官方的 Kotlin IDE 支援。</web-summary>

在本教學中，您將學習如何建立並執行一個帶有 Compose Multiplatform UI 的簡單 Kotlin Multiplatform 應用程式。

## 設定環境

首先準備 IDE 和必要的 外掛程式：

1. 選擇並安裝 IDE：IntelliJ IDEA 與 Android Studio 均完全支援 Kotlin Multiplatform。
    
    建議使用 [JetBrains Toolbox App](https://www.jetbrains.com/toolbox/app/) 來安裝 IDE。
    它讓您可以管理多個產品或版本，包括 [早期體驗體計劃](https://www.jetbrains.com/resources/eap/) (EAP) 和 Nightly 版本。

    若要進行獨立安裝，請下載 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 或 [Android Studio](https://developer.android.com/studio) 的安裝程式。

    Kotlin Multiplatform 必要的 外掛程式 至少需要 **IntelliJ IDEA 2025.2.2** 或 **Android Studio Otter 2025.2.1**。

2. 安裝 [Kotlin Multiplatform IDE 外掛程式](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)。
    
   IDE 外掛程式 也會安裝您 IDE 尚未具備的所有必要相依性。
    
3. 若您尚未設定 `ANDROID_HOME` 環境變數，請配置您的系統以識別它：

    <Tabs>
    <TabItem title= "Bash or Zsh">
   
    將以下指令新增至您的 `.profile` 或 `.zprofile`：
        
    ```shell
    export ANDROID_HOME=~/Library/Android/sdk
    ```
   
    </TabItem>
    <TabItem title= "Windows PowerShell or CMD">

    對於 PowerShell，您可以使用以下指令新增永久的 環境變數
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

4. 若要建立 iOS 應用程式，您需要一台安裝了 [Xcode](https://apps.apple.com/us/app/xcode/id497799835) 的 macOS 主機。
    您的 IDE 會在後台執行 Xcode 以建置 iOS 框架。

    在開始處理 KMP 專案之前，請務必至少啟動一次 Xcode，使其完成初始設定。

    > 每當 Xcode 更新時，您都需要手動啟動它並下載更新的工具。
    > Kotlin Multiplatform IDE 外掛程式 會進行預先檢查，並在 Xcode 未處於正確狀態時提醒您。
    >
    {style="note"}

## 建立專案 

<Tabs>
<TabItem title= "IntelliJ IDEA">

使用 IDE 精靈 建立新的 KMP 專案：

1. 在主選單中選取 **File** | **New** | **Project**。
2. 在左側清單中選擇 **Kotlin Multiplatform**。
3. 根據需要設定專案的名稱、位置和其他基本屬性。
4. 我們建議選擇一個版本的 [JetBrains Runtime](https://github.com/JetBrains/JetBrainsRuntime) (JBR) 作為專案的 JDK，因為它提供了重要的修正，特別是改善了桌面版 KMP 應用程式的相容性。
   每個 IntelliJ IDEA 發行版本中都包含相關版本的 JBR，因此無需額外設定。
5. 若要建立完整的示範，請選擇所有可用平台：Android、iOS、Desktop、Web 和 Server。
   在可用的地方保持 **Share UI** 選項為選取狀態，以便使用 Compose Multiplatform 作為對應目標平台的 UI 架構。

   > 桌面版目標自動包含 [Compose Hot Reload](compose-hot-reload.md) 功能，讓您在儲存程式碼變更時能立即看到 UI 的變化。
   > 即使您不打算製作桌面應用程式，也可以將桌面目標新增至專案中，以加速 UI 程式碼的迭代。
   > 
   {style="note"}

6. 完成平台選擇後，點擊 **Create** 按鈕，並等待 IDE 產生並匯入專案。

![IntelliJ IDEA 精靈，使用預設設定並選取了 Android、iOS、桌面與 Web 平台](idea-wizard-1step.png){width=600}

</TabItem>
<TabItem title= "Android Studio">

使用 IDE 精靈 建立新的 KMP 專案：

1. 在主選單中選取 **File** | **New** | **New project**。
2. 在預設的 **Phone and Tablet** 樣板類別中選擇 **Kotlin Multiplatform**。

    ![Android Studio 中的第一個新專案步驟](as-wizard-1.png){width="400"}

3. 根據需要設定專案的名稱、位置和其他基本屬性，然後點擊 **Next**。
4. 若要建立完整的示範，請選擇所有可用平台：Android、iOS、Desktop、Web 和 Server。
   在可用的地方保持 **Share UI** 選項為選取狀態，以便使用 Compose Multiplatform 作為對應目標平台的 UI 架構。

   > 桌面版目標自動包含 [Compose Hot Reload](compose-hot-reload.md) 功能，讓您在儲存程式碼變更時能立即看到 UI 的變化。
   > 即使您不打算製作桌面應用程式，也可以將桌面目標新增至專案中，以加速 UI 程式碼的迭代。
   >
   {style="note"}

5. 完成平台選擇後，點擊 **Finish** 按鈕，並等待 IDE 產生並匯入專案。

![Android Studio 精靈的最後一步，選取了 Android、iOS、桌面與 Web 平台](as-wizard-3step.png){width=600}

</TabItem>
</Tabs>

## 參考預先檢查

您可以透過開啟 **Project Environment Preflight Checks** 工具視窗，確保專案設定沒有環境問題：
點擊右側側邊欄或底部列的預先檢查圖示 ![帶有飛機圖示的預先檢查圖示](ide-preflight-checks.png){width="20"}

在此工具視窗中，您可以查看與這些檢查相關的訊息、重新執行檢查或變更其設定。 

預先檢查指令也可在 **Search Everywhere** 對話方塊中使用。
按兩下 <shortcut>Shift 鍵</shortcut> 並搜尋包含「preflight」字詞的指令：

![輸入了「preflight」字詞的 Search Everywhere 選單](double-shift-preflight-checks.png){width=600}

## 執行範例應用程式

由 IDE 精靈 建立的專案包含為 iOS、Android、桌面和 Web 應用程式產生的 运行配置，以及用於執行 server 應用程式的 Gradle 任務。
各平台的具體 Gradle 指令如下所列。

<Tabs>
<TabItem title="Android">

要執行 Android 應用程式，請啟動 **androidApp** 运行配置：

![醒目提示 Android 运行配置的下拉式功能表](run-android-configuration.png){width=250}

若要手動建立 Android 运行配置，請選擇 **Android App** 作為 运行配置 樣板，並選取模組 **[專案名稱].androidApp**。

預設情況下，它會在第一個可用的虛擬裝置上執行：

![在虛擬裝置上執行的 Android 應用程式](run-android-app.png){width=300}

</TabItem>
<TabItem title="iOS">

> 您需要 macOS 主機並安裝 Xcode 來建置 iOS 應用程式。
>
{style="note"}

若您為專案選擇了 iOS 目標，並準備了安裝有 Xcode 的 macOS 電腦，則可以選擇 **iosApp** 运行配置 並選取模擬裝置：

![醒目提示 iOS 运行配置的下拉式功能表](run-ios-configuration.png){width=250}

當您執行 iOS 應用程式時，它會在後台使用 Xcode 建置並在 iOS Simulator 中啟動。
第一次建置會收集用於編譯的原生相依性，並為後續執行進行熱身：

![在虛擬裝置上執行的 iOS 應用程式](run-ios-app.png){width=350}

</TabItem>
<TabItem title="Desktop">

桌面應用程式的預設 运行配置 建立為 **desktopApp [hot] 🔥**：

![醒目提示預設桌面 运行配置 的下拉式功能表](run-desktop-configuration.png){width=250}

若要手動建立帶有 Hot Reload 的桌面 运行配置，請選擇 **Gradle** 运行配置 樣板，並使用以下指令指向 **[應用程式名稱]:desktopApp** Gradle 專案：

```shell
hotRun --mainClass "com.example.demo.MainKt"
```

使用此設定，您可以執行 JVM 桌面應用程式：

![在虛擬裝置上執行的 JVM 應用程式](run-desktop-app.png){width=600}

</TabItem>
<TabItem title="Web">

Web 應用程式的預設 运行配置 建立為 **webApp [wasmJs]**：

![醒目提示預設 Wasm 运行配置 的下拉式功能表](run-wasm-configuration.png){width=250}

若要手動建立 Web 运行配置，請選擇 **Gradle** 运行配置 樣板，並使用以下指令指向 **[應用程式名稱]:webApp** Gradle 專案：

```shell
wasmJsBrowserDevelopmentRun
```

當您執行此配置時，IDE 會建置 Kotlin/Wasm 應用程式並在預設瀏覽器中開啟它：

![在虛擬裝置上執行的 Web 應用程式](run-wasm-app.png){width=600}

</TabItem>
</Tabs>

## 疑難排解

### Java 與 JDK

常見的 Java 問題：

* 某些工具可能找不到要執行的 Java 版本，或使用了錯誤的版本。
  解決方法：
    * 將 `環境變數` `JAVA_HOME` 設定為安裝適當 JDK 的目錄。
  
      > 我們建議使用 [JetBrains Runtime](https://github.com/JetBrains/JetBrainsRuntime)，
      > 這是一個支援類別重新定義的 OpenJDK 分支。
      >
      {style="note"}
  
    * 將 `JAVA_HOME` 內的 `bin` 資料夾路徑附加到 `PATH` 變數中，
      以便在終端機中使用 JDK 包含的工具。
* 若您在 Android Studio 中遇到 Gradle JDK 問題，請確保其配置正確：
  選取 **Settings** | **Build, Execution, Deployment** | **Build Tools** | **Gradle**。

### Android 工具

與 JDK 相同，若您在啟動 `adb` 等 Android 工具時遇到困難，請確保 `ANDROID_HOME/tools`、`ANDROID_HOME/tools/bin` 和 `ANDROID_HOME/platform-tools` 的路徑已新增至您的 `PATH` 環境變數 中。

### Xcode

若您的 iOS 运行配置 報告沒有可執行的虛擬裝置，或預先檢查失敗，請務必啟動 Xcodebing 並查看 iOS 模擬器是否有任何更新。

### 獲取說明

* **Kotlin Slack**。獲取 [邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up) 並加入 [#multiplatform](https://kotlinlang.slack.com/archives/C3PQML5NU) 頻道。
* **Kotlin Multiplatform 工具問題追蹤器**。[報告新問題](https://youtrack.jetbrains.com/newIssue?project=KMT)。

## 下一步

進一步了解 KMP 專案的結構以及編寫共用程式碼：
* 關於使用 Compose Multiplatform 處理共用 UI 程式碼的一系列 教學：[建立您的 Compose Multiplatform 應用程式](compose-multiplatform-create-first-app.md)
* 關於在具有原生 UI 的專案中處理共用程式碼的一系列 教學：[建立您的 Kotlin Multiplatform 應用程式](multiplatform-create-first-app.md)
* 深入研究 Kotlin Multiplatform 文件：
  * [專案配置](multiplatform-project-configuration.md)
  * [處理多平台相依性](https://kotlinlang.org/docs/multiplatform-add-dependencies.html)
* 了解 Compose Multiplatform UI 架構、其基礎知識以及平台特定功能：
    [Compose Multiplatform 與 Jetpack Compose 之間的關係](compose-multiplatform-and-jetpack-compose.md)。

探索已為 KMP 編寫的程式碼：
* 我們的 [範例](multiplatform-samples.md) 頁面，包含官方 JetBrains 範例以及展示 KMP 能力的精選專案清單。
* GitHub 主題：
  * [kotlin-multiplatform](https://github.com/topics/kotlin-multiplatform)，使用 Kotlin Multiplatform 實作的專案。
  * [kotlin-multiplatform-sample](https://github.com/topics/kotlin-multiplatform-sample)，使用 KMP 編寫的範例專案清單。
* [klibs.io](https://klibs.io) – KMP 庫 的搜尋平台，目前已索引超過 2000 個 庫，包括 OkHttp, Ktor, Coil, Koin, SQLDelight 等。