[//]: # (title: 直接整合)

<tldr>
   這是一種本機整合方式。在以下情況下適用：<br/>

   * 您已在本機電腦上設定了以 iOS 為目標的 Kotlin Multiplatform 專案。
   * 您的 Kotlin Multiplatform 專案沒有 CocoaPods 相依性。<br/>

   [選擇最適合您的整合方式](multiplatform-ios-integration-overview.md)
</tldr>

如果您想透過在 Kotlin Multiplatform 專案與 iOS 專案之間共用程式碼來同時開發它們，可以使用特殊的指令碼設定直接整合。

此指令碼會將 Kotlin 框架連接到 Xcode 中的 iOS 專案的流程自動化：

![直接整合圖](direct-integration-scheme.svg){width=700}

該指令碼使用專為 Xcode 環境設計的 `embedAndSignAppleFrameworkForXcode` Gradle 任務。在設定期間，您將其新增到 iOS 應用程式組建的 Run Script 階段中。之後，在執行 iOS 應用程式組建之前，Kotlin 產物將被建置並包含在衍生資料（derived data）中。

大體而言，該指令碼會：

* 將編譯後的 Kotlin 框架複製到 iOS 專案結構內的正確目錄中。
* 處理嵌入式框架的程式碼簽署流程。
* 確保 Kotlin 框架中的程式碼變更會反映在 Xcode 的 iOS 應用程式中。

## 如何設定 {id="how-to-set-up"}

如果您目前使用 CocoaPods 外掛程式來連接 Kotlin 框架，請先進行遷移。如果您的專案沒有 CocoaPods 相依性，請[跳過此步驟](#connect-the-framework-to-your-project)。

### 從 CocoaPods 外掛程式遷移 {id="migrate-from-the-cocoapods-plugin"}

若要從 CocoaPods 外掛程式遷移：

1. 在 Xcode 中，使用 **Product** | **Clean Build Folder** 或 <shortcut>Cmd + Shift + K</shortcut> 快速鍵來清理組建目錄。
2. 在包含 Podfile 的目錄中，執行以下指令：

    ```none
   pod deintegrate
   ```

3. 從您的 `build.gradle(.kts)` 檔案中移除 `cocoapods {}` 區塊。
4. 刪除 `.podspec` 檔案和 Podfile。

### 將框架連接到您的專案

若要將多平台專案產生的 Kotlin 框架連接到您的 Xcode 專案：

1. 只有在宣告了 `binaries.framework` 設定選項時，才會註冊 `embedAndSignAppleFrameworkForXcode` 任務。在您的 Kotlin Multiplatform 專案中，請檢查 `build.gradle.kts` 檔案中的 iOS 目標宣告。
2. 在 Xcode 中，按兩下專案名稱以開啟 iOS 專案設定。
3. 在左側的 **Targets** 區段中選擇您的目標，然後導覽至 **Build Phases** 分頁。
4. 點擊 **+** 並選擇 **New Run Script Phase**。

   ![新增 Run Script 階段](xcode-run-script-phase-1.png){width=700}

5. 調整以下指令碼並將其貼到新階段的指令碼文字欄位中：

   ```bash
   if [ "YES" = "$OVERRIDE_KOTLIN_BUILD_IDE_SUPPORTED" ]; then
       echo "Skipping Gradle build task invocation due to OVERRIDE_KOTLIN_BUILD_IDE_SUPPORTED environment variable set to \"YES\""
       exit 0
   fi
   cd "<Path to the root of the multiplatform project>"
   ./gradlew :<Shared module name>:embedAndSignAppleFrameworkForXcode
   ```

   * 在 `cd` 指令中，指定 Kotlin Multiplatform 專案根目錄的路徑，例如 `$SRCROOT/..`。
   * 在 `./gradlew` 指令中，指定共用模組的名稱，例如 `:shared` 或 `:sharedUI`。
   
   當您啟動 iOS 執行配置時，IntelliJ IDEA 和 Android Studio 會在開始 Xcode 組建之前建置 Kotlin 框架相依性，並將 `OVERRIDE_KOTLIN_BUILD_IDE_SUPPORTED` 環境變數設定為 "YES"。提供的 Shell 指令碼會檢查此變數，並防止從 Xcode 第二次建置 Kotlin 框架。
     
   > 當您為不支援此功能的專案啟動 iOS 執行配置時，IDE 會建議一個快速修正來設定建置防護。
   >
   {style="note"}

6. 停用 **Based on dependency analysis** 選項。

   ![新增指令碼](xcode-run-script-phase-2.png){width=700}

   這可確保 Xcode 在每次組建期間都會執行指令碼，且不會每次都針對遺失的輸出相依性發出警告。

7. 將 **Run Script** 階段向上移動，放置在 **Compile Sources** 階段之前。

   ![拖曳 Run Script 階段](xcode-run-script-phase-3.png){width=700}

8. 在 **Build Settings** 分頁上，停用 **Build Options** 下的 **User Script Sandboxing** 選項：

   ![User Script Sandboxing](disable-sandboxing-in-xcode-project-settings.png){width=700}

   > 如果您在未先停用沙盒化的情況下組建了 iOS 專案，這可能需要重新啟動 Gradle 常駐程式（daemon）。
   > 停止可能已被沙盒化的 Gradle daemon 程序：
   > ```shell
   > ./gradlew --stop
   > ```
   >
   {style="tip"}

9. 在 Xcode 中組建專案。如果一切設定正確，專案將成功組建。

> 如果您有不同於預設 `Debug` 或 `Release` 的自訂組建組態，請在 **Build Settings** 分頁的 **User-Defined** 下新增 `KOTLIN_FRAMEWORK_BUILD_TYPE` 設定，並將其設定為 `Debug` 或 `Release`。
>
{style="note"}

## 後續步驟 {id="what-s-next"}

在使用 Swift Package Manager 時，您也可以利用本機整合。[了解如何在本地套件中新增對 Kotlin 框架的相依性](multiplatform-spm-local-integration.md)。