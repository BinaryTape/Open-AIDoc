[//]: # (title: 組建與執行 Kotlin Multiplatform 應用程式)

Kotlin Multiplatform (KMP) 使用 Gradle 作為其建構系統。
適用於 IntelliJ IDEA 和 Android Studio 的 [KMP IDE 外掛程式](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)提供了進一步的支援，
能自動建立量身打造的執行配置、處理 Compose Hot Reload 整合等。

## 組建與執行 KMP 應用程式 {id="build-and-run-kmp-applications"}

要組建您的 KMP 應用程式，您只需要 Gradle 和 Java。
然而，IntelliJ IDEA 和 Android Studio 為 KMP 開發提供了許多便利功能，
涵蓋從環境管理到撰寫建置指令碼與多平台程式碼。

您可以在同一個 IDE 中於任何受支援的平台上執行應用程式：

* Android 應用程式在可用的 Android 虛擬裝置（Android Virtual Device）上執行。
* iOS 應用程式在 Device Hub 中可用的 iOS 模擬器上執行
  （您需要配備 Xcode 的 macOS 電腦才能在 Apple 目標上執行應用程式）。
* 桌面應用程式在系統 JVM 上執行。
* Web 應用程式在預設瀏覽器中執行。

KMP IDE 外掛程式提供的執行配置比一般的 Gradle 組建任務更有效率：
它們只會觸發對應目標的組建，而預設的 Gradle 組建任務
則一律會組建所有目標的偵錯（debug）與發行（release）版本。

### 在 Android 模擬器上執行應用程式 {id="run-your-application-on-android-emulator"}

預設的執行配置會自動建議可用的 Android 虛擬裝置清單。
如果沒有可用的裝置，或者您想要模擬不同的裝置，可以使用 Android Device Manager 設定一個
（在 IntelliJ IDEA 中，前往 **View | Tool Window | Device Manager**，
或遵循 [Android Studio 指南](https://developer.android.com/studio/run/managing-avds)）。

> Android Studio 中的 Device Manager 通常提供更多可選的裝置，
> 但建立裝置後，該裝置即可在全系統範圍使用——包括 IntelliJ IDEA 中的執行配置。
>
{style="tip"}

裝置建立完成後，便會立即出現在執行配置中可供使用。

1. 在執行配置清單中，選取 **androidApp**。
2. 選擇您的 Android 虛擬裝置，然後點擊 **Run**：

![在 Android 上執行 Compose Multiplatform 應用程式](compose-run-android.png){width=352}

您的 IDE 會執行該應用程式；若所選的虛擬裝置尚未開機，則會將其啟動。

### 在實體 Android 裝置上執行 {id="run-on-a-real-android-device"}

若要讓硬體 Android 裝置可用於 KMP 執行配置，
請[設定裝置並將其連接至您的電腦](https://developer.android.com/studio/run/device)。

正確設定後，它將與虛擬裝置一同顯示在可用裝置清單中。

### 在 iOS 模擬器上執行應用程式 {id="run-your-application-on-ios-simulator"}

如果您在初始設定時尚未啟動 Xcode，請在執行 iOS 應用程式之前啟動。
安裝 iOS 平台支援：
在 Xcode 中，檢查 **Xcode | Settings | Components**，確認至少已安裝一個 iOS 模擬器。

在您的 Kotlin Multiplatform IDE 中，於執行配置清單中選取 iOS 項目，
並在其旁的清單中選取模擬裝置，
然後點擊 **Run**：

![在 iOS 上執行 Compose Multiplatform 應用程式](compose-run-ios.png){width=405}

#### 在實體 iOS 裝置上執行 {initial-collapse-state="collapsed" collapsible="true" id="run-on-a-real-ios-device"}

您可以在實體 iOS 裝置上執行您的多平台應用程式。開始之前，
您需要設定與您的 [Apple ID](https://support.apple.com/en-us/HT204316) 關聯的 Team ID。

##### 設定您的 Team ID {id="set-your-team-id"}

若要首次為專案設定新的 Team ID，請在 Xcode 中開啟專案
（**File | Open Project in Xcode**）：

1. 在左側的 Project navigator 中，選取 **iosApp**。
2. 在 **Targets** 下選取 **iosApp**，並切換至 **Signing & Capabilities** 分頁。
3. 在 **Team** 清單中，選取您的團隊。

   如果您尚未設定團隊，請使用 **Team** 清單中的 **Add an Account** 選項，並依照 Xcode 中的指示操作。

4. 確保 Bundle Identifier 具唯一性，且已成功指派 Signing Certificate。

在 Xcode 中設定團隊後，您可以在 IntelliJ IDEA 中設定或變更團隊：

1. 編輯 **iosApp** 的執行配置：

   ![編輯 iOS 執行配置](ios-edit-configurations.png){width=450}

2. 切換至 **Options** 分頁，在 **Development team** 下拉式功能表中進行必要的變更，然後點擊 **OK**。

##### 執行應用程式 {id="run-the-app"}

使用連接線連接您的 iPhone。如果您已經在 Xcode 中註冊該裝置，IntelliJ IDEA 應會在執行配置清單中顯示該裝置。執行對應的 `iosApp` 配置。

如果您尚未在 Xcode 中註冊您的 iPhone，請遵循 [Apple 的建議](https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device/)。
簡而言之，您應進行以下步驟：

1. 使用連接線連接您的 iPhone。
2. 在您的 iPhone 上，於 **Settings** | **Privacy & Security** 中啟用開發者模式。
3. 在 Xcode 中，前往頂端功能表並選擇 **Window** | **Devices and Simulators**。
4. 如果您的 iPhone 未顯示為已連接，請點擊左下角的加號並選取它。
5. 依照螢幕上的指示完成配對程序。

在 Xcode 中註冊 iPhone 後，當您選取 **iosApp** 執行配置時，它就會出現在 IntelliJ IDEA 的可用裝置清單中。

### 在桌面上執行應用程式 {id="run-your-application-on-desktop"}

在執行配置清單中選取 **desktopApp [hot] 🔥**，然後點擊 **Run**：

![在桌面上執行 Compose Multiplatform 應用程式](compose-run-desktop.png){width=350}

預設情況下，應用程式啟動時會同時執行 [Compose Hot Reload](compose-hot-reload.md)。
這可在您手動儲存包含變更的檔案時，近乎即時地重新載入 UI。

### 執行 Web 應用程式 {id="run-your-web-application"}

Web 目標的預設選項為：

* **webApp[js]**：執行您的 Kotlin/JS 應用程式。
* **webApp[wasmJs]**：執行您的 Kotlin/Wasm 應用程式。

Web 應用程式會自動在您的預設瀏覽器中開啟，
且預設可透過 [http://localhost:8080/](http://localhost:8080/) 存取。

> 若連接埠 8080 無法使用，組建將會使用另一個連接埠。
> 您可以在 Gradle 組建主控台中搜尋 `Project is running at` 找到實際的連接埠。
>
{style="note"}

![Compose Web 應用程式](first-compose-project-on-web.png){width=600}

#### Web 目標的相容模式 {id="compatibility-mode-for-web-targets"}

您可以為 Web 應用程式啟用相容模式，確保它能在所有瀏覽器上開箱即用。
在此模式下，現代瀏覽器會使用 Wasm 版本，而較舊的瀏覽器則會退回使用 JS 版本。
此模式是透過同時針對 `js` 與 `wasmJs` 目標進行跨平台編譯來實現的。

若要為您的 Web 應用程式啟用相容模式：

1. 選取 **View | Tool Windows | Gradle** 開啟 Gradle 工具視窗。
2. 在 **ComposeDemo | Tasks | compose** 中，選取並執行 **composeCompatibilityBrowserDistribution** 任務。

   > 您的 Gradle JVM 至少需要 Java 11 才能成功載入這些任務，一般而言，我們建議 Compose Multiplatform 專案至少使用 Java 17。
   >
   {style="note"}

   ![執行相容性任務](web-compatibility-gradle-task.png){width=500}

   或者，您也可以從專案根目錄在終端中執行以下指令：

    ```bash
    ./gradlew composeCompatibilityBrowserDistribution
    ```

Gradle 任務完成後，相容的建置產物將會產生在 Web 應用程式模組目錄中，例如
`webApp/build/dist/composeWebCompatibility/productionExecutable`。
您可以使用這些建置產物來[發佈您的應用程式](https://kotlinlang.org/docs/wasm-get-started.html#publish-the-application)，同時支援 `js` 和 `wasmJs` 目標。