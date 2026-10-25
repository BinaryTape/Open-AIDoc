[//]: # (title: 使用 Kotlin Toolchain 建立並建構 Kotlin Multiplatform 應用程式)

[Kotlin Toolchain](https://kotlin-toolchain.org/) 是 JetBrains 推出的一款用於建立、建構、測試及執行 Kotlin 專案的工具。
它提供 CLI 與宣告式配置，因此你可以透過終端、IDE 或 AI 輔助開發工具進行工作。

本頁面將引導你使用 Kotlin Toolchain 從頭開始設定 Kotlin Multiplatform 專案。

> Kotlin Toolchain 目前處於 [Alpha](supported-platforms.md#general-kotlin-stability-levels) 階段。
> 歡迎你在自己的 Kotlin Multiplatform 專案中試用。
> 我們非常感謝你在 [YouTrack](https://youtrack.jetbrains.com/issues/KTC) 中提供回饋。
>
{style="note"}

## 先決條件 {id="prerequisites"}

### 安裝 Kotlin Toolchain CLI {id="toolchain-script-install"}

你可以使用 [SDKMAN!](https://sdkman.io/) 安裝 Kotlin Toolchain CLI：

```shell
sdk install kotlintoolchain
```

或者透過安裝指令碼：

<Tabs>
<TabItem title="macOS 或 Linux">

```shell
curl -fsSL https://kotl.in/install.sh | sh

# Restart your terminal or run this command
# to make 'kotlin' available
exec $SHELL
```

</TabItem>

<TabItem title="Windows">

```shell
powershell -ExecutionPolicy ByPass -c "irm 'https://kotl.in/install.ps1' | iex"
```

</TabItem>
</Tabs>

透過執行 `kotlin --version` 檢查 CLI 是否可用。

### 建構 iOS 應用程式 {id="building-ios-apps"}

若要建構與執行 iOS 應用程式，請安裝 [Xcode](https://apps.apple.com/us/app/xcode/id497799835) 以及必要的 SDK。

當實際需要建構或執行某個模組時，Kotlin Toolchain CLI 會顯示如何設定 Xcode 的說明。

## 建立專案 {id="create-a-project"}

若要使用 Kotlin Toolchain 產生新專案：

1. 導覽至你想要建立專案目錄的目錄。
2. 執行以下指令：

   ```shell
   kotlin new
   ```

3. 當系統提示專案路徑時輸入目錄名稱，例如 `ktc-kmp`。
4. 當出現樣板選擇清單時，選取 **Compose Multiplatform application**。
5. 按下 **Enter 鍵**確認預設選取的目標。
6. 提供一個將在整個專案中用於識別應用程式的專案 ID（會依據目錄名稱自動產生預設值）。
   此 ID 用於 Kotlin 套件名稱、Android 命名空間與應用程式 ID，以及 iOS bundle ID。

Kotlin Toolchain 會產生專案，包含配置檔案、原始碼與包裝函式指令碼。
預設情況下，它也會初始化 Git 存儲庫。

最終產生的專案包含數個針對各平台應用程式入口點的 `*App` 模組，以及一個包含共用程式碼的 `shared` 模組。
每個模組都會列在整體的 `project.yaml` 檔案中，並由各自的 `module.yaml` 檔案進行配置。
每個應用程式模組皆明確相依於 shared 模組，例如：

```yaml
# androidApp/module.yaml
product: android/app

dependencies:
  # Shared module dependency
  - //shared
  # Android-specific dependency
  - $libs.androidx.activity.compose

settings:
  compose: enabled
  android:
    namespace: org.example.toolchainfirst
    applicationId: org.example.toolchainfirst
```

每個模組的基本結構遵循 [KMP 原始碼集模型](multiplatform-discover-project.md#source-sets)，
只是例如原本的 `androidMain` 變成了 `src@android`。

## 執行專案 {id="run-the-project"}

若要執行專案：

1. 導覽至專案目錄（在上述範例中為 `ktc-kmp`）。
2. 執行 `kotlin run` 以調出可執行的可用應用程式清單。
   可用的模組對應於你在產生專案時所選取的目標：

    ```shell
    $ kotlin run
    
    Multiple modules are available to run, please choose:
    ❯ desktopApp (with Hot Reload 🔥)
    androidApp
    iosApp    
    webApp
    ```

3. 你也可以使用 `-m`（`--module`）選項直接執行模組，例如：

    ```shell
    # Build and run the desktop JVM app
    kotlin run -m desktopApp
    ```

## 在 IntelliJ IDEA 或 Android Studio 中進行專案開發 {id="work-on-a-project-in-intellij-idea-or-android-studio"}

你可以在 IntelliJ IDEA 或 Android Studio 中處理專案並加以執行。
若要在 Android Studio 上享有完整的 Kotlin Toolchain 功能性，請使用最新的穩定版本 [Android Studio Rabbit](https://developer.android.com/studio/releases)。

安裝以下外掛程式以使你的 IDE 能夠辨識 Kotlin Toolchain 與 Kotlin Multiplatform 專案：

* [Kotlin Multiplatform 外掛程式](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)：為妥善支援 KMP 專案所必需。
* [Kotlin Toolchain 外掛程式](https://plugins.jetbrains.com/plugin/31850-kotlin-toolchain)：協助 IDE 辨識 Kotlin Toolchain 專案結構、產生运行配置等。

### 直接在 IDE 中建立專案 {id="create-a-project-directly-in-the-ide"}

安裝 Kotlin Multiplatform 與 Kotlin Toolchain 外掛程式後，
你也可以直接在 IDE 中建立新專案：

1. 開啟 IntelliJ IDEA 或 Android Studio。
2. 選取 **File** | **New** | **Project**。
3. 選取 **Kotlin Multiplatform**，並在 **Build system** 切換開關中選擇 **Kotlin Toolchain**。
4. 填寫其餘的專案詳細資料，然後點擊 **Create**。

建立並匯入專案後，IDE 會自動為所有已宣告的模組註冊运行配置，
以便你可以從 IDE 工具列執行對應的應用程式。

## 發佈應用程式 {id="publish-the-applications"}

當你對應用程式的執行效果感到滿意時，便可以發佈這些應用程式。

請參閱 Kotlin Toolchain 文件中關於產生成品的完整說明：

* [發佈 Android 應用程式](https://kotlin-toolchain.org/latest/user-guide/product-types/android-app/#publishing)
* [發佈 iOS 應用程式](https://kotlin-toolchain.org/latest/user-guide/product-types/ios-app/#publishing)

你也可以封裝 JVM 應用程式或 Wasm 應用程式，但目前尚未完全支援針對這些目標的發佈。

## 接續步驟 {id="what-s-next"}

* 若要進一步了解 Kotlin Toolchain 的定義與用途，請參閱[產品常見問題](https://kotlin-toolchain.org/dev/faq/)。
* [從頭開始教學](https://kotlin-toolchain.org/dev/getting-started/tutorial/)展示如何建立 Kotlin Toolchain 的「Hello, World!」，並逐步將其轉換為具有複雜範本配置的多平台專案。
* 若要深入了解 Kotlin Toolchain，請參閱[使用者指南](https://kotlin-toolchain.org/latest/user-guide/)。