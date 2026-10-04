[//]: # (title: Compose Hot Reload)

Compose Hot Reload 可協助你在開發 Compose Multiplatform 專案時，視覺化並嘗試調整 UI 變更。
與標準的 [Compose 預覽](compose-previews.md)（適合用於透過測試資料檢視獨立元件）不同，
Compose Hot Reload 會直接將你的程式碼變更套用至執行中的應用程式。

隨附的 Compose Hot Reload Gradle 外掛程式需要 Kotlin 2.1.20+ 以及與 Java 21 或更早版本相容的 JVM 目標。
為了使用 Compose Hot Reload 的完整功能，
我們建議安裝 [Kotlin Multiplatform IDE 外掛程式](https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform)，
該外掛程式自 IntelliJ IDEA 2025.2.2 版本與 Android Studio Otter 2025.2.1 版本起提供支援。

在我們持續探索支援其他目標平台的同時，你已經可以將桌面應用程式作為沙盒，
在不中斷開發流程的情況下，快速在共用程式碼中嘗試 UI 變更。

<img src="KotlinConf-hot-reload.animated.gif" alt="Compose Hot Reload" width="600" preview-src="KotlinConf-hot-reload.png"/>

## 將 Compose Hot Reload 新增至你的專案 {id="add-compose-hot-reload-to-your-project"}

可以透過以下兩種方式新增 Compose Hot Reload：

* [在 IntelliJ IDEA 或 Android Studio 中從頭建立專案](#from-scratch)
* [將 Gradle 外掛程式新增至現有專案](#to-an-existing-project)

### 從頭開始 {id="from-scratch"}

本節將引導你完成在 IntelliJ IDEA 和 Android Studio 中建立包含桌面目標的多平台專案的步驟。建立專案時，將會自動新增 Compose Hot Reload。

1. 在[快速入門指南](quickstart.md)中，完成[設定 Kotlin Multiplatform 開發環境](quickstart.md#set-up-the-environment)的指示。
2. 在 IDE 中，選取 **File** | **New** | **Project**。
3. 在左側面板中，選取 **Kotlin Multiplatform**。
4. 在 **New Project** 視窗中指定 **Name**、**Group** 與 **Artifact** 欄位。
5. 選取 **Desktop** 目標，然後點擊 **Create**。
   ![建立包含桌面目標的多平台專案](create-desktop-project.png){width=600 style="block"}

### 至現有專案 {id="to-an-existing-project"}

從 Compose Multiplatform 1.10.0 開始，
Compose Hot Reload 外掛程式已[內建隨附](whats-new-compose-110.md#compose-hot-reload-integration)，
且對所有包含**桌面目標**的專案預設啟用。

如果你的專案已經包含桌面目標，
你可以升級至 Compose Multiplatform 1.10.0 或更新版本，即可開箱即用享受 Compose Hot Reload 功能。

雖然它是預設啟用的，
但你仍然可以明確宣告 Compose Hot Reload 外掛程式以使用特定的舊版本。

#### 較早版本的 Compose Multiplatform {initial-collapse-state="collapsed" collapsible="true" id="earlier-versions-of-compose-multiplatform"}

對於使用 1.10.0 之前版本的 Compose Multiplatform 專案，
你必須設定桌面目標，然後明確新增 Compose Hot Reload 外掛程式。
以下步驟參考自[快速入門指南](quickstart.md)教學中的專案。

1. 導入桌面目標：建立 `desktopApp` 目錄、定義 `main()` 函式，
   並提供 `actual` 實作。
   如果你的專案已包含桌面目標，可以跳過此步驟。
   如需參考範例，請參閱[新增 JVM 入口點](migrate-from-android.md#optional-add-a-jvm-entry-point)。
 
2. 使用最新版本的 Compose Hot Reload 更新版本目錄（version catalog，請參閱 [Releases](https://github.com/JetBrains/compose-hot-reload/releases)）。
   在 `gradle/libs.versions.toml` 中新增以下程式碼：
   ```toml
   composeHotReload = { id = "org.jetbrains.compose.hot-reload", version.ref = "composeHotReload"}
   ```

   > 若要進一步了解如何使用版本目錄在整個專案中集中管理相依性，請參閱我們的 [Gradle 最佳實務](https://kotlinlang.org/gradle-best-practices.html)。

3. 在父專案的 `build.gradle.kts`（`ComposeDemo/build.gradle.kts`）中，將以下程式碼新增至你的 `plugins {}` 區塊：
   ```kotlin
   plugins {
       alias(libs.plugins.composeHotReload) apply false
   }
   ```
   這可防止 Compose Hot Reload 外掛程式在每個子專案中被重複載入。

4. 在包含多平台應用程式的子專案 `build.gradle.kts`（`ComposeDemo/sharedUI/build.gradle.kts`）中，將以下程式碼新增至你的 `plugins {}` 區塊：
   ```kotlin
   plugins { 
       alias(libs.plugins.composeHotReload)
   }
   ```

5. 你的專案必須在 [JetBrains Runtime](https://github.com/JetBrains/JetBrainsRuntime) (JBR) 上執行，這是一個支援增強型類別重新定義的 OpenJDK 分支版本。
   Compose Hot Reload 可以自動為你的專案佈建相容的 JBR。

   > 最新版的 JetBrains Runtime 僅支援 Java 21：
   > 如果你將 Compose Hot Reload 新增至僅相容於 Java 22 或更新版本的專案，
   > 執行專案時會導致連結錯誤（linkage error）。
   > 
   {style="warning"}

   若要允許自動佈建，請將以下 Gradle 外掛程式新增至你的 `settings.gradle.kts` 檔案中：

   ```kotlin
   plugins {
       id("org.gradle.toolchains.foojay-resolver-convention") version "%foojayResolverConventionVersion%"
   }
   ```

6. 點擊 **Sync Gradle Changes** 按鈕以同步 Gradle 檔案：![同步 Gradle 檔案](gradle-sync.png){width=50}

## 使用 Compose Hot Reload {id="use-compose-hot-reload"}

1. 在 `desktopApp` 原始碼集中，開啟 `main.kt` 檔案並更新 `main()` 函式：
   ```kotlin
   fun main() = application {
       Window(
           onCloseRequest = ::exitApplication,
           alwaysOnTop = true,
           title = "composedemo",
       ) {
           App()
       }
   }
   ```
   透過將 `alwaysOnTop` 變數設為 `true`，產生的桌面應用程式將保持在所有視窗的最上層，讓你能更輕鬆地編輯程式碼並即時檢視變更。

2. 開啟 `App.kt` 檔案並更新 `Button` 可組合項（composable）：
   ```kotlin
   Button(onClick = { showContent = !showContent }) {
       Column {
           Text(Greeting().greet())
       }
   }
   ```
   現在，按鈕的文字由 `greet()` 函式控制。

3. 開啟 `Greeting.kt` 檔案並更新 `greet()` 函式：
   ```kotlin
    fun greet(): String {
        return "Hello!"
    }
   ```

4. 開啟 `main.kt` 檔案，然後點擊邊欄中的 **Run** 圖示。
   選取 **Run 'desktopApp' with Compose Hot Reload**。

   ![從邊欄執行 Compose Hot Reload](compose-hot-reload-gutter-run.png){width=350 border-effect="line"}

   ![在桌面應用程式上首次執行 Compose Hot Reload](compose-hot-reload-hello.png){width=500 border-effect="line"}

5. 更新 `greet()` 函式傳回的字串，然後儲存所有檔案（<shortcut>⌘ S</shortcut> / <shortcut>Ctrl+S</shortcut>），即可看到桌面應用程式自動更新。

   ![Compose Hot Reload](compose-hot-reload.animated.gif){width=500 preview-src="compose-hot-reload.png"}

   或者，你也可以按指派的快速鍵或點擊 **Reload UI** 按鈕來明確觸發重新載入。
   你可以在 **Settings | Tools | Compose Hot Reload** 頁面中修改觸發行為。

恭喜！你已經看到 Compose Hot Reload 的實際運作了。現在你可以自由嘗試變更文字、圖片、格式、UI 結構等，而不需要在每次變更後都重新啟動桌面執行配置。

## 用於 AI Agent 的 MCP 伺服器 {id="mcp-server-for-ai-agents"}
<primary-label ref="Experimental"/>

從 Compose Multiplatform 1.12.0 開始，Compose Hot Reload 內建了
[Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 伺服器。
MCP 伺服器允許 AI 程式碼編寫代理（coding agent）與你正在執行的 Compose 應用程式互動：
觸發 Compose Hot Reload、檢視算繪後的 UI、檢查語意結構、模擬使用者輸入以及讀取執行時期記錄（runtime logs）。
對於包含多個視窗的應用程式，agent 可以列出所有視窗並以其中任何一個為操作目標。

這為 AI agent 在編輯 Compose 程式碼時閉合了回饋循環。
不需要仰賴你在每次編輯後手動檢查結果，agent 就能自主迭代你的程式碼並驗證每個變更。

### 連接 AI Agent {id="connect-an-ai-agent"}

若要連接 AI agent，請設定 MCP 用戶端以執行 `hotMcpServer` Gradle 任務。
例如在 `.mcp.json` 中：

```json
{
  "mcpServers": {
    "compose-hot-reload": {
      "command": "./gradlew",
      "args": [
        "--no-daemon",
        "--quiet",
        "--console=plain",
        "hotMcpServer"
      ]
    }
  }
}
```

Gradle 會在所有子專案中搜尋任務，並將簡短名稱 `hotMcpServer` 配對到特定目標的變體，
例如 `hotMcpServerJvm` 或 `hotMcpServerDesktop`。

如果你的模組定義了多個 JVM 目標，
請指定完整限定的任務名稱以避免混淆：`:<module>:hotMcpServer<Target>`，
例如 `:app:hotMcpServerDesktop` 或 `:composeApp:hotMcpServerJvm`。

### 可用的 MCP 工具 {id="available-mcp-tools"}

MCP 伺服器公開了一系列 agent 可叫用的工具，包括：

* `reload` — 重新編譯專案並熱重載變更的類別。
* `take_screenshot` — 擷取應用程式視窗的目前狀態。
* `get_semantic_tree` — 傳回 Compose [語意樹](compose-accessibility.md#semantic-properties)，以便 agent 理解 UI 結構。
* `get_logs` — 傳回執行中應用程式的近期記錄輸出，包括執行時期例外狀況。
* `click`、`type_text` 和 `scroll` — 模擬使用者輸入以測試互動流程。

有關 MCP 工具及其參數的完整清單，請參閱
[Compose Hot Reload README](https://github.com/JetBrains/compose-hot-reload#mcp-server-for-ai-agents)。

## 取得協助 {id="get-help"}

如果你在使用 Compose Hot Reload 時遇到任何問題，請透過[建立 GitHub issue](https://github.com/JetBrains/compose-hot-reload/issues) 讓我們知道。