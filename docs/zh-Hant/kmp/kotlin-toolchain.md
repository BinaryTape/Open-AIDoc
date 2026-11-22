[//]: # (title: 使用 Kotlin Toolchain 建立並發佈 Kotlin Multiplatform 應用程式)

[Kotlin Toolchain](https://kotlin-toolchain.org/) 是 JetBrains 推出的一款工具，用於組建、測試、執行以及發佈 Kotlin 專案。
它提供 CLI 和宣告式配置，因此你可以透過終端機、IDE 或 AI 輔助開發工具進行操作：
Kotlin Toolchain 讓你的編碼代理只需最少的設定與配置，就能從全新專案一路完成應用程式的發佈。

[Kotlin AI 技能官方存儲庫](https://github.com/Kotlin/kotlin-agent-skills/tree/main)包含專為 Kotlin Toolchain 設計的技能。

本頁面將引導你使用 Kotlin Toolchain 從頭開始設定 Kotlin Multiplatform 專案。

你也可以直接向你的代理提出需求：

```text
Create a new Kotlin Multiplatform app for Android, iOS, desktop, and web with the Kotlin Toolchain CLI (https://kotlin-toolchain.org/latest).
```

> Kotlin Toolchain 目前處於 [Alpha](supported-platforms.md#general-kotlin-stability-levels) 階段。
> 歡迎你在 Kotlin Multiplatform 專案中試用。
> 我們非常感謝你在 [YouTrack](https://youtrack.jetbrains.com/issues/KTC) 以及[專屬 Slack 頻道](https://kotlinlang.slack.com/archives/C062WG3A7T8)中提供回饋。
>
{style="note"}

## 前置需求 {id="prerequisites"}

### 安裝 Kotlin Toolchain CLI {id="toolchain-script-install"}

你的代理可以自行安裝 Kotlin Toolchain，但你也可以使用安裝指令碼手動安裝：

<Tabs>
<TabItem title="macOS or Linux">

```shell
curl -fsSL https://kotl.in/install.sh | sh
```

</TabItem>

<TabItem title="Windows">

```shell
powershell -ExecutionPolicy ByPass -c "irm 'https://kotl.in/install.ps1' | iex"
```

</TabItem>
</Tabs>

安裝指令碼會下載 Kotlin Toolchain CLI，將其放置在 `~/.local/bin` 中，並確保已加入你的 `PATH`。
無需使用 `sudo` 指令。

透過執行 `kotlin --version` 檢查 CLI 是否可用。

### 建置 iOS 應用程式 {id="building-ios-apps"}

透過 Kotlin Toolchain，你可以直接從 CLI 或 IDE 處理大部分的 iOS 開發工作流程，包括建置、執行與發佈應用程式，無需開啟 Xcode。

當需要 Xcode 時，Kotlin Toolchain 會提示安裝並說明如何設定。
建議的安裝方式是從 [App Store](https://apps.apple.com/us/app/xcode/id497799835) 安裝 Xcode。

必須安裝 Xcode，才能為 Kotlin Toolchain 提供用於 iOS 建置的 CLI 以及處理專案特定的特殊工作流程。

## 建立專案 {id="create-a-project"}

若要使用 Kotlin Toolchain 產生新專案：

1. 導覽至你希望 Kotlin Toolchain 建立專案的目錄，例如 **Projects**。
2. 執行以下指令：

   ```shell
   kotlin new
   ```

3. 系統提示輸入專案路徑時，輸入目錄名稱，例如 `ktc-kmp`。
4. 在範本清單中，選取 **Kotlin Multiplatform application**。
5. 使用 **空白鍵** 選取或取消選取目標平台。按下 **Enter 鍵** 確認。

   > 即使最終應用程式僅以 Android 和 iOS 為目標，也建議考慮加入桌面端（desktop）目標。
   > 它能實現更快的開發與反覆運算循環，並支援 [Compose Hot Reload](compose-hot-reload.md)，
   > 讓你不需重新啟動應用程式即可查看 UI 變更。
   >
   {style="tip"}

6. 輸入專案 ID，或保留空白以根據目錄名稱產生預設 ID。

   此 ID 將在整個專案中用於識別應用程式：包含 Kotlin 套件名稱、Android 命名空間與應用程式 ID，以及 iOS bundle ID。

7. 確認安裝 AI 代理配置：這將建立包含一般建議和 MCP 伺服器配置的專案專用 AGENTS.md。
8. 使用 **空白鍵** 選取你偏好的 AI 代理。按下 **Enter 鍵** 確認。

Kotlin Toolchain 會產生專案，包含組態檔案、原始碼以及包裝函式指令碼。
預設情況下，它還會初始化 Git 存儲庫。

產生的專案包含數個具有各平台應用程式入口點的 `*App` 模組，以及一個包含共用程式碼的 `shared` 模組。
每個模組都會列在整體的 `project.yaml` 檔案中，並透過各自的 `module.yaml` 檔案進行配置。
每個應用程式模組都明確相依於 `shared` 模組。以 Android 模組為例：

```yaml
# androidApp/module.yaml
product: android/app

dependencies:
  # Shared module dependency
  - //shared
  # Android-specific dependency
  - $libs.androidx.activity.compose
  - $compose.preview
  - $compose.uiTooling

settings:
  compose: enabled
  android:
    namespace: org.example.ktckmp
    applicationId: org.example.ktckmp
```

每個模組的基本結構均遵循 [KMP 原始碼集模型](multiplatform-discover-project.md#source-sets)，只不過例如 `androidMain` 在這裡改為 `src@android`。

## 執行專案 {id="run-the-project"}

若要執行專案：

1. 導覽至專案目錄（在上述範例中為 `ktc-kmp`）。
2. 執行 `kotlin run` 以顯示可執行應用程式的清單。
   可用模組對應於你在產生專案時所選取的目標平台：

    ```shell
    $ kotlin run
    
    Multiple modules are available to run, please choose:
    ❯ desktopApp (with Hot Reload 🔥)
    androidApp
    iosApp    
    webApp
    ```

3. 你也可以使用 `-m`（`--module`）選項直接執行特定模組，例如：

    ```shell
    # Build and run the desktop JVM app
    kotlin run -m desktopApp
    ```

## 發佈應用程式 {id="publish-the-applications"}

當你對應用程式的執行效果感到滿意時，就可以發佈應用程式。

### 適用於 iOS {id="for-ios"}

Kotlin Toolchain 能協助你簡化發佈至 [TestFlight](https://developer.apple.com/testflight/) 的設定程序。
若要發佈 iOS 應用程式，請執行：

```shell
kotlin publish testflight
```

該指令會啟動一個包含詳細說明的精靈。它將引導你以最少的手動操作，使用 [App Store Connect](https://appstoreconnect.apple.com/login) API 金鑰設定發佈程序。
對於後續的版本發佈，使用相同的指令即可自動執行。

有關手動設定和發佈的說明，請參閱 [Kotlin Toolchain 文件](https://kotlin-toolchain.org/latest/user-guide/publishing/ios-application)。

### 適用於 Android {id="for-android"}

若要設定並發佈 Android 應用程式，請依照 [Kotlin Toolchain 文件](https://kotlin-toolchain.org/latest/user-guide/publishing/android-application)中的說明操作。

### 其他目標平台 {id="other-target-platforms"}

你也可以打包 [JVM 應用程式](https://kotlin-toolchain.org/latest/user-guide/product-types/jvm-app/#packaging)或 [Wasm 應用程式](https://kotlin-toolchain.org/latest/user-guide/product-types/wasm-js-app/#packaging)，但目前尚未完全支援針對這些平台的發佈功能。

## 在 IntelliJ IDEA 或 Android Studio 中開發專案 {id="work-on-a-project-in-intellij-idea-or-android-studio"}

你可以在 IntelliJ IDEA 或 Android Studio 中處理專案並加以執行。

> 若要在 Android Studio 中使用完整的 Kotlin Toolchain 功能，請使用[最新穩定版本](https://developer.android.com/studio/releases)（至少為 Android Studio Rabbit）。
>
{style="tip"}

安裝 [Kotlin Multiplatform 外掛程式](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)以加入 IDE 對 Kotlin Multiplatform 專案的支援，以及對 Kotlin Toolchain 專案結構和執行配置的支援。

### 直接在 IDE 中建立專案 {id="create-a-project-directly-in-the-ide"}

在安裝 Kotlin Multiplatform 和 Kotlin Toolchain 外掛程式後，你也可以直接在 IDE 中建立新專案：

1. 開啟 IntelliJ IDEA 或 Android Studio。
2. 選取 **File** | **New** | **Project**。
3. 選取 **Kotlin Multiplatform**，並在 **Build system** 切換選單中選擇 **Kotlin Toolchain**。
4. 填寫其餘的專案詳細資訊，然後點擊 **Create**。

建立並匯入專案後，IDE 會自動為所有已宣告的模組註冊執行配置，以便你可以從 IDE 工具列直接執行相應的應用程式。

## 後續步驟 {id="what-s-next"}

* 若要進一步了解 Kotlin Toolchain 是什麼及其用途，請查看[產品常見問題 (FAQ)](https://kotlin-toolchain.org/latest/faq/)。
* [從零開始教學](https://kotlin-toolchain.org/latest/getting-started/tutorial/)示範了如何建立 Kotlin Toolchain "Hello, World!"，並逐步將其轉換為具有複雜範本化配置的多平台專案。
* 若要深入了解 Kotlin Toolchain，請查看[使用者指南](https://kotlin-toolchain.org/latest/user-guide/)。