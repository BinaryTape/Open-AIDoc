[//]: # (title: Kotlin 與 TeamCity 的持續整合)

在此頁面中，您將學習如何設定 [TeamCity](https://www.jetbrains.com/teamcity/) 來組建 Kotlin 應用程式。
關於 TeamCity 的安裝與基本設定，請參閱 [TeamCity 文件](https://www.jetbrains.com/teamcity/documentation/)。

Kotlin 可直接與 Gradle 和 Maven 等標準建置工具整合，因此在 TeamCity 中設定 Kotlin 組建的工作流程與任何專案完全相同。如果您改為使用 IntelliJ IDEA 組建系統來編譯專案，TeamCity 也提供了專屬的執行器。

## Gradle 與 Maven {id="gradle-and-maven"}

當您使用 Gradle 或 Maven 進行組建時，組建組態檔案（`build.gradle.kts` 或 `pom.xml`）就已經宣告了 Kotlin 相依性與編譯器外掛程式。TeamCity 不需要任何額外的 Kotlin 專屬設定。

對於 Gradle，請在組建組態中新增一個 Gradle 建置步驟，並指定您要執行的 **Step name** 和 **Gradle tasks**。
<img src="teamcity-gradle.png" alt="Gradle Build Step" width="700" border-effect="line"/>

同樣地，對於 Maven，請新增一個 Maven 建置步驟，並指定您要執行的 **Step name** 和 **Goals**。

## IntelliJ IDEA 組建系統 {id="intellij-idea-build-system"}

如果您使用 IntelliJ IDEA 專案檔案來組建專案，TeamCity 中的 Kotlin 版本必須與 IDE 專案中設定的版本相符。您可以使用 TeamCity recipe 來自動下載並設定 Kotlin 編譯器。Recipe 是 meta-runner 的進階演進版：它們的作用相同，但提供了額外的優勢，例如 YAML 支援以及可在 [JetBrains Marketplace](https://plugins.jetbrains.com/teamcity_recipe) 上輕鬆共用。

1. 下載並匯入 recipe。
   * 從 [GitHub](https://github.com/JetBrains/Kotlin.TeamCity) 下載 Kotlin meta-runner 檔案。
   * 將其作為新的 recipe 匯入 TeamCity。如需詳細資訊，請參閱[使用 recipe](https://www.jetbrains.com/help/teamcity/working-with-meta-runner.html)。
  <img src="teamcity-add-recipe.png" alt="TeamCity recipe" width="700" border-effect="line"/>

2. 新增獲取 Kotlin 編譯器步驟。
   * 使用匯入的執行器新增建置步驟。
   * 指定 **Step name** 與所需的 **Kotlin Version**。
  <img src="teamcity-step-name.png" alt="Setup Kotlin Compiler" width="700" border-effect="line"/>

  >在執行組建之前，請將 `system.path.macro.KOTLIN.BUNDLED` 新增為組建組態中的系統參數。
  >您可以指派任何占位符號值，執行器會在組建時將其覆寫為解析出的編譯器路徑。
  >
  > {style="note"}

3. 新增編譯步驟。
   在獲取編譯器步驟之後，新增一個 IntelliJ IDEA Project runner 步驟來編譯專案並產生建置產物。
  <img src="teamcity-intellij-step.png" alt="IntelliJ IDEA Project runner" width="500" border-effect="line"/>

## 其他 CI 伺服器 {id="other-ci-servers"}

如果您使用 TeamCity 以外的 CI 系統，請直接在管線指令碼中呼叫標準的 Gradle 或 Maven 指令。

## 後續步驟 {id="what-s-next"}

* 了解如何[為 Kotlin Multiplatform 應用程式設定 TeamCity](https://kotlinlang.org/docs/multiplatform/configure-teamcity-for-kmp.html)
   以組建、測試及部署 Kotlin Multiplatform 應用程式。
* 按照教學[為您的 Kotlin Multiplatform 專案設定 iOS 交付管線](https://kotlinlang.org/docs/multiplatform/ios-ci-cd-teamcity.html)
   在託管的 macOS 建置代理上執行，並自動部署到 TestFlight。
* 了解如何[將專案設定儲存在版本控制中](https://www.jetbrains.com/help/teamcity/storing-project-settings-in-version-control.html)
   並使用 Kotlin DSL 以程式碼的形式管理您的管線。