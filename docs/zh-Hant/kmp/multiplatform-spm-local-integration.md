[//]: # (title: 從本機 Swift 套件使用 Kotlin)

<tldr>
   這是一種本機整合方法。在以下情況適合你：<br/>

   * 你的 iOS 應用程式包含本機 SwiftPM 模組。
   * 你已經在本機電腦上設定了以 iOS 為目標的 Kotlin Multiplatform 專案。
   * 你現有的 iOS 專案採用靜態連結類型。<br/>

   [選擇最適合你的整合方法](multiplatform-ios-integration-overview.md)
</tldr>

在本教學中，你將學習如何使用 Swift Package Manager (SwiftPM) 將 Kotlin Multiplatform 專案中的 Kotlin 架構整合至本機套件中。

![直接整合圖表](direct-integration-scheme.svg){width=700}

若要設定整合，你將新增一個特殊的指令碼，將 `embedAndSignAppleFrameworkForXcode` Gradle 任務作為專案組建設定中的前置動作（pre-action）。若要在 Xcode 專案中查看通用程式碼所反映的變更，你只需重新組建 Kotlin Multiplatform 專案。

透過這種方式，你可以輕鬆地在本機 Swift 套件中使用 Kotlin 程式碼；相較之下，常規的直接整合方法是將指令碼新增到組建階段（build phase），需要同時重新組建 Kotlin Multiplatform 與 iOS 專案才能套用通用程式碼的變更。

> 如果你不熟悉 Kotlin Multiplatform，請先了解如何[設定環境](quickstart.md)並[從頭建立跨平台應用程式](compose-multiplatform-new-project.md)。
>
{style="tip"}

## 設定專案 {id="set-up-the-project"}

此功能自 Kotlin 2.0.0 起提供。

> 若要檢查 Kotlin 版本，請瀏覽至 Kotlin Multiplatform 專案根目錄中的 `build.gradle(.kts)` 檔案。你可以在檔案頂部的 `plugins {}` 區塊中看到目前版本。
> 
> 或者，也可以查看 `gradle/libs.versions.toml` 檔案中的版本目錄（version catalog）。
> 
{style="tip"}

本教學假設你的專案使用[直接整合](multiplatform-direct-integration.md)方式，並在專案的組建階段中使用了 `embedAndSignAppleFrameworkForXcode` 任務。如果你是透過 CocoaPods 外掛程式或透過帶有 `binaryTarget` 的 Swift 套件連接 Kotlin 架構，請先進行移轉。

### 從 SwiftPM binaryTarget 整合移轉 {initial-collapse-state="collapsed" collapsible="true" id="migrate-from-swiftpm-binarytarget-integration"}

若要從使用 `binaryTarget` 的 SwiftPM 整合移轉：

1. 在 Xcode 中，使用 **Product** | **Clean Build Folder** 或使用 <shortcut>Cmd + Shift + K</shortcut> 快速鍵清除組建目錄。
2. 在每個 `Package.swift` 檔案中，移除對內部包含 Kotlin 架構之套件的相依性，以及對產物的目標相依性。

### 從 CocoaPods 外掛程式移轉 {initial-collapse-state="collapsed" collapsible="true" id="migrate-from-the-cocoapods-plugin"}

> 如果你在 `cocoapods {}` 區塊中對其他 Pod 有相依性，則必須採用 CocoaPods 整合方式。目前在多模組 SwiftPM 專案中，無法同時相依於 Pod 與 Kotlin 架構。
>
{style="warning"}

若要從 CocoaPods 外掛程式移轉：

1. 在 Xcode 中，使用 **Product** | **Clean Build Folder** 或使用 <shortcut>Cmd + Shift + K</shortcut> 快速鍵清除組建目錄。
2. 在包含 Podfile 的目錄中，執行以下指令：

    ```none
   pod deintegrate
   ```

3. 從 `build.gradle(.kts)` 檔案中移除 `cocoapods {}` 區塊。
4. 刪除 `.podspec` 檔案和 Podfile。

## 將架構連接至你的專案

> 目前不支援整合至 `swift build`。
>
{style="note"}

若要在本機 Swift 套件中使用 Kotlin 程式碼，請將多平台專案產生的 Kotlin 架構連接至你的 Xcode 專案：

1. 在 Xcode 中，前往 **Product** | **Scheme** | **Edit scheme**，或點擊頂端列中的配置方案圖示並選取 **Edit scheme**：

   ![編輯配置方案](xcode-edit-schemes.png){width=700}

2. 選取 **Build** | **Pre-actions** 項目，然後點擊 **+** | **New Run Script Action**：

   ![新增執行指令碼動作](xcode-new-run-script-action.png){width=700}

3. 調整以下指令碼並將其新增為操作：

   ```bash
   cd "<Path to the root of the multiplatform project>"
   ./gradlew :<Shared module name>:embedAndSignAppleFrameworkForXcode 
   ```

   * 在 `cd` 指令中，指定 Kotlin Multiplatform 專案的根目錄路徑，例如 `$SRCROOT/..`。
   * 在 `./gradlew` 指令中，指定共享模組的名稱，例如 `:shared` 或 `:sharedLogic`。
  
4. 在 **Provide build settings from** 區段中選擇你的應用程式目標：

   ![填寫完成的執行指令碼動作](xcode-filled-run-script-action.png){width=700}

5. 你現在可以將共享模組匯入到本機 Swift 套件中並使用 Kotlin 程式碼。

   在 Xcode 中，瀏覽至你的本機 Swift 套件，並定義一個帶有模組匯入的函式，例如：

   ```Swift
   import Shared
   
   public func greetingsFromSpmLocalPackage() -> String {
       return Greeting.greet()
   }
   ```

   ![SwiftPM 使用情況](xcode-spm-usage.png){width=700}

6. 在 iOS 專案的 `ContentView.swift` 檔案中，你現在可以透過匯入本機套件來使用此函式：

   ```Swift
   import SwiftUI
   import SpmLocalPackage
   
   struct ContentView: View {
       var body: some View {
           Vstack {
               Image(systemName: "globe")
                   .imageScale(.large)
                   .foregroundStyle(.tint)
               Text(greetingsFromSpmLocalPackage())
           }
           .padding()
       }
   }
   
   #Preview {
       ContentView()
   }
   ```
   
7. 在 Xcode 中組建專案。如果一切設定正確，專案將成功組建。
   
還有幾個值得考慮的因素：

* 如果你擁有不同於預設 `Debug` 或 `Release` 的自訂組建組態，請在 **Build Settings** 標籤頁的 **User-Defined** 下新增 `KOTLIN_FRAMEWORK_BUILD_TYPE` 設定，並將其設為 `Debug` 或 `Release`。
* 如果你遇到指令碼沙盒化（script sandboxing）的錯誤，請按兩下專案名稱開啟 iOS 專案設定，然後在 **Build Settings** 標籤頁的 **Build Options** 下停用 **User Script Sandboxing**。

## 後續步驟 {id="what-s-next"}

* [選擇你的整合方法](multiplatform-ios-integration-overview.md)
* [了解如何設定 Swift 套件匯出](multiplatform-spm-export.md)