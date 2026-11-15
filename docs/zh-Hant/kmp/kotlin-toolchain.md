[//]: # (title: 使用 Kotlin Toolchain 建立並建置 Kotlin Multiplatform 應用程式)

[Kotlin Toolchain](https://kotlin-toolchain.org/) 是 JetBrains 推出的一款工具，用於建立、建置、測試以及執行 Kotlin 專案。
它提供命令列介面（CLI）與宣告式配置，因此你可以在終端、IDE 中工作，或是搭配 AI 輔助開發工具使用。

本頁面將引導你使用 Kotlin Toolchain 從頭開始設定一個 Kotlin Multiplatform 專案。

> Kotlin Toolchain 目前處於 [Alpha](supported-platforms.md#general-kotlin-stability-levels) 階段。
> 歡迎你在你的 Kotlin Multiplatform 專案中試用。
> 我們非常感謝你在 [YouTrack](https://youtrack.jetbrains.com/issues/KTC)
> 和[專屬 Slack 頻道](https://kotlinlang.slack.com/archives/C062WG3A7T8)中提供回饋。
>
{style="note"}

## 先決條件 {id="prerequisites"}

### 安裝 Kotlin Toolchain CLI {id="toolchain-script-install"}

你可以使用 [SDKMAN!](https://sdkman.io/) 安裝 Kotlin Toolchain CLI：

```shell
sdk install kotlintoolchain
```

或透過安裝指令碼：

<Tabs>
<TabItem title="macOS or Linux">

```shell
curl -fsSL https://kotl.in/install.sh | sh

# 重新啟動你的終端或執行此指令
# 以使 'kotlin' 生效
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

### 建置 iOS 應用程式 {id="building-ios-apps"}

若要建置並執行 iOS 應用程式，請安裝 [Xcode](https://apps.apple.com/us/app/xcode/id497799835) 及所需的 SDK。

當實際需要建置或執行模組時，Kotlin Toolchain CLI 會顯示有關如何設定 Xcode 的說明。

## 建立專案 {id="create-a-project"}

若要使用 Kotlin Toolchain 產生新專案：

1. 前往你想要建立專案目錄的所在目錄。
2. 執行以下指令：

   ```shell
   kotlin new
   ```

3. 當系統提示專案路徑時，輸入目錄名稱，例如 `ktc-kmp`。
4. 在出現範本選擇時，選取 **Compose Multiplatform application**。
5. 按 **Enter 鍵**確認目標的預設選擇。
6. 提供一個將在整個專案中用於識別應用程式的專案 ID（系統會根據目錄名稱產生預設值）。
   此 ID 將用於 Kotlin 套件名稱、Android 命名空間與應用程式 ID，以及 iOS bundle ID。

Kotlin Toolchain 會產生專案，包含設定檔、原始碼以及包裝函式指令碼。
預設情況下，它還會初始化 Git 存儲庫。

產生的專案包含數個具有各平台應用程式入口點的 `*App` 模組，以及一個包含共用程式碼的 `shared` 模組。
每個模組都會列在整體的 `project.yaml` 檔案中，並透過其各自的 `module.yaml` 檔案進行設定。
每個應用程式模組都明確相依於 shared 模組，例如：

```yaml
# androidApp/module.yaml
product: android/app

dependencies:
  # Shared 模組相依性
  - //shared
  # Android 專屬相依性
  - $libs.androidx.activity.compose

settings:
  compose: enabled
  android:
    namespace: org.example.toolchainfirst
    applicationId: org.example.toolchainfirst
```

每個模組的基本結構均遵循 [KMP 原始碼集模型](multiplatform-discover-project.md#source-sets)，只是例如將 `androidMain` 改為 `src@android`。

## 執行專案 {id="run-the-project"}

若要執行專案：

1. 前往專案目錄（在上述範例中為 `ktc-kmp`）。
2. 執行 `kotlin run` 以調出可執行的應用程式清單。
   可用的模組對應於你在產生專案時選取的目標：

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
    # 建置並執行桌面 JVM 應用程式
    kotlin run -m desktopApp
    ```

## 在 IntelliJ IDEA 或 Android Studio 中進行專案開發 {id="work-on-a-project-in-intellij-idea-or-android-studio"}

你可以在 IntelliJ IDEA 或 Android Studio 中進行專案開發並執行它。
若要在 Android Studio 上享有完整的 Kotlin Toolchain 功能，請使用最新的穩定版本 [Android Studio Rabbit](https://developer.android.com/studio/releases)。

安裝以下外掛程式以讓你的 IDE 能夠辨識 Kotlin Toolchain 與 Kotlin Multiplatform 專案：

* [Kotlin Multiplatform 外掛程式](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform) 是正確支援 KMP 專案所不可或缺的。
* [Kotlin Toolchain 外掛程式](https://plugins.jetbrains.com/plugin/31850-kotlin-toolchain) 有助於 IDE 辨識 Kotlin Toolchain 專案結構、產生運行配置等。

### 直接在 IDE 中建立專案 {id="create-a-project-directly-in-the-ide"}

在安裝了 Kotlin Multiplatform 與 Kotlin Toolchain 外掛程式後，你也可以直接在 IDE 中建立新專案：

1. 開啟 IntelliJ IDEA 或 Android Studio。
2. 選取 **File** | **New** | **Project**。
3. 選取 **Kotlin Multiplatform**，並在 **Build system** 切換選項中選擇 **Kotlin Toolchain**。
4. 填寫其餘的專案詳細資訊，然後點擊 **Create**。

當專案建立並匯入後，IDE 會自動為所有已宣告的模組註冊運行配置，讓你可以從 IDE 工具列執行相應的應用程式。

## 發佈應用程式 {id="publish-the-applications"}

當你對應用程式的執行情況感到滿意時，就可以發佈這些應用程式。

請參閱 Kotlin Toolchain 文件中關於產生構件的完整說明：

* [發佈 Android 應用程式](https://kotlin-toolchain.org/latest/user-guide/product-types/android-app/#publishing)
* [發佈 iOS 應用程式](https://kotlin-toolchain.org/latest/user-guide/product-types/ios-app/#publishing)

你也可以封裝 JVM 應用程式或 Wasm 應用程式，但目前尚未完全支援針對這些目標的發佈功能。

## 後續步驟 {id="what-s-next"}

* 若要進一步了解什麼是 Kotlin Toolchain 及其用途，請查看[產品常見問題](https://kotlin-toolchain.org/dev/faq/)。
* [從頭開始的教學](https://kotlin-toolchain.org/dev/getting-started/tutorial/)展示了如何建立一個 Kotlin Toolchain 的「Hello, World!」，並逐步將其轉換為具有複雜範本化配置的多平台專案。
* 若要深入探索 Kotlin Toolchain，請查看[使用者指南](https://kotlin-toolchain.org/latest/user-guide/)。