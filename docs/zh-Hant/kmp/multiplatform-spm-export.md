[//]: # (title: Swift 套件匯出設定)

<tldr>
   這是一項遠端整合方法。如果您符合以下情況，它可能適合您：<br/>

   * 您希望將最終應用程式的程式碼庫與通用程式碼庫分開。
   * 您已經在本機電腦上設定了以 iOS 為目標的 Kotlin Multiplatform 專案。
   * 您在 iOS 專案中使用 Swift Package Manager 來處理相依性。<br/>

   [選擇最適合您的整合方法](multiplatform-ios-integration-overview.md)
</tldr>

您可以將 Apple 目標的 Kotlin/Native 輸出設定為 Swift Package Manager (SwiftPM) 相依性。

考慮一個具有 iOS 目標的 Kotlin Multiplatform 專案。您可能希望讓這個 iOS 二進位檔案可供處理原生 Swift 專案的 iOS 開發人員作為相依性使用。利用 Kotlin Multiplatform 工具，您可以提供一個能與他們的 Xcode 專案無縫整合的構件。

本教學展示如何透過 Kotlin Gradle 外掛程式建置 [XCFramework](multiplatform-build-native-binaries.md#build-xcframeworks) 來實現這一點。

## 設定遠端整合

若要讓您的架構可供使用，您需要上傳兩個檔案：

* 包含 XCFramework 的 ZIP 封存檔。您需要將其上傳到可直接存取的便利檔案存儲空間（例如，建立一個附加了該封存檔的 GitHub release，或使用 Amazon S3 或 Maven）。
  選擇最容易整合到您工作流程中的選項。
* 描述套件的 `Package.swift` 檔案。您需要將其推送到一個獨立的 Git 存儲庫。

#### 專案配置選項 {initial-collapse-state="collapsed" collapsible="true"}

在本教學中，您將把 XCFramework 作為二進位檔案儲存在您偏好的檔案存儲空間中，並將 `Package.swift` 檔案儲存在獨立的 Git 存儲庫中。

然而，您可以採取不同的方式來配置您的專案。考慮以下組織 Git 存儲庫的選項：

* 將 `Package.swift` 檔案與應封裝到 XCFramework 中的程式碼儲存在不同的 Git 存儲庫中。
  這允許將 Swift 清單檔案與該檔案所描述的專案分開進行版本控制。這是推薦的方法：它允許擴展，且通常更容易維護。
* 將 `Package.swift` 檔案放置在 Kotlin Multiplatform 程式碼旁邊。這是一個更直接的方法，但請記住，在這種情況下，Swift 套件和程式碼將使用相同的版本控制。SwiftPM 使用 Git 標籤（tag）來進行套件的版本控制，這可能會與您專案使用的標籤產生衝突。
* 將 `Package.swift` 檔案儲存在取用者專案的存儲庫中。這有助於避免版本控制和維護問題。
  然而，這種方法可能會導致取用者專案的多存儲庫 SwiftPM 設定及後續自動化出現問題：

  * 在多套件專案中，只有一個取用者套件可以依賴外部模組（以避免專案內的相依性衝突）。因此，所有相依於 Kotlin Multiplatform 模組的邏輯都應封裝在特定的取用者套件中。
  * 如果您使用自動化 CI 程序發佈 Kotlin Multiplatform 專案，該程序需要包含將更新後的 `Package.swift` 檔案發佈到取用者存儲庫。這可能會導致取用者存儲庫的更新衝突，因此 CI 中的此類階段可能難以維護。

### 配置您的多平台專案

在以下範例中，Kotlin Multiplatform 專案的共享程式碼儲存在本機的 `shared` 模組中。
如果您的專案結構不同，請將程式碼和路徑範例中的 "shared" 替換為您的模組名稱。

若要設定 XCFramework 的發佈：

1. 更新您的 `shared/build.gradle.kts` 配置檔案，在 iOS 目標清單中加入 `XCFramework` 呼叫：

   ```kotlin
   import org.jetbrains.kotlin.gradle.plugin.mpp.apple.XCFramework
   
   kotlin {
       // 其他 Kotlin Multiplatform 目標
       // ...
       // 在取用者專案中要匯入的模組名稱
       val xcframeworkName = "Shared"
       val xcf = XCFramework(xcframeworkName)
   
       listOf(
           iosArm64(),
           iosSimulatorArm64(),
       ).forEach { 
           it.binaries.framework {
               baseName = xcframeworkName
               
               // 指定 CFBundleIdentifier 以唯一識別該架構
               binaryOption("bundleId", "org.example.${xcframeworkName}")
               xcf.add(this)
               isStatic = true
           }
       }
       //...
   }
   ```
   
2. 執行 Gradle 任務以建立架構：
   
   ```shell
   ./gradlew :shared:assembleSharedXCFramework
   ```
  
   產生的架構將建立在專案目錄中的 `shared/build/XCFrameworks/release/Shared.xcframework` 目錄。

   > 如果您的專案取用 SwiftPM 相依性，從 Kotlin %kotlinEapVersion% 開始，該任務還會在 XCFramework 旁邊產生一組與 SwiftPM 相關的檔案。
   > 如[下文](#prepare-the-xcframework-and-the-swift-package-manifest)所述，
   > 您可以將產生的 `Package.swift` 與架構一起分發，而無需從頭開始編寫資訊清單。
   >
   {style="note"} 

3. 如果您有多個模組包含想要匯出的共享程式碼（例如，一個共享邏輯模組和一個共享 UI 模組），
   請[將它們組合到一個新的模組中](#exporting-multiple-modules-as-an-xcframework)並改為分佈此傘狀模組。

### 準備 XCFramework 與 Swift 套件資訊清單

1. 將 `Shared.xcframework` 目錄壓縮為 ZIP 檔案，並為產生的封存檔計算校驗碼，例如：
   
   `swift package compute-checksum Shared.xcframework.zip`

2. 將 ZIP 檔案上傳到您選擇的檔案存儲空間。該檔案應可透過直接連結存取。例如，以下是您可以使用 GitHub 中的 releases 來完成的方法：
   
   <deflist collapsible="true">
       <def title="上傳到 GitHub release">
           <list type="decimal">
               <li>前往 <a href="https://github.com">GitHub</a> 並登入您的帳戶。</li>
               <li>導航至您要建立 release 的存儲庫。</li>
               <li>在右側的 <b>Releases</b> 區塊中，點擊 <b>Create a new release</b> 連結。</li>
               <li>填寫 release 資訊，加入或建立新標籤，指定 release 標題並撰寫說明。</li>
               <li>
                   <p>透過底部的 <b>Attach binaries by dropping them here or selecting them</b> 欄位上傳包含 XCFramework 的 ZIP 檔案：</p>
                   <img src="github-release-description.png" alt="填寫 release 資訊" width="700"/>
               </li>
               <li>點擊 <b>Publish release</b>。</li>
               <li>
                   <p>在 release 的 <b>Assets</b> 區塊下方，右鍵點擊 ZIP 檔案並在瀏覽器中選擇 <b>Copy link address</b> 或類似選項：</p>
                   <img src="github-release-link.png" alt="複製上傳檔案的連結" width="500"/>
               </li>
         </list>
       </def>
   </deflist>

3. [建議] 檢查連結是否有效且檔案是否可以下載。在終端機中執行以下指令：

    ```none
    curl <上傳的 XCFramework ZIP 檔案下載連結>
    ```

4. 如果您的專案取用 SwiftPM 相依性，從 Kotlin %kotlinEapVersion% 開始，
   `assembleSharedXCFramework` Gradle 任務會在 XCFramework 旁邊產生一個 `Package.swift` 檔案。

   如果情況並非如此，您可以手動建立一個 `Package.swift` 檔案，使用以下範本：

   ```Swift
   // swift-tools-version:5.3
   import PackageDescription
    
   let package = Package(
      name: "Shared",
      platforms: [
        .iOS(.v14),
      ],
      products: [
         .library(name: "Shared", targets: ["Shared"])
      ],
      targets: [
         .binaryTarget(
            name: "Shared",
            url: "<上傳的 XCFramework ZIP 檔案連結>",
            checksum:"<為該 ZIP 檔案計算的校驗碼>")
      ]
   )
   ```
   
5. 指定缺失的欄位：
   * 在 `url` 欄位中，指定指向包含 XCFramework 的 ZIP 封存檔連結。
   * 在 `checksum` 欄位中，指定稍早為該 ZIP 檔案計算的校驗碼。

6. [建議] 若要驗證產生的清單，您可以在包含 `Package.swift` 檔案的目錄中執行以下命令列指令：

    ```shell
    swift package reset && swift package show-dependencies --format json
    ```
    
    輸出將描述發現的任何錯誤，或者如果清單正確，則顯示成功的下載與剖析結果。

7. 將 `Package.swift` 檔案推送到您的遠端存儲庫。請務必建立並推送一個帶有該套件語意化版本的 Git 標籤。

### 加入套件相依性

現在這兩個檔案都可以存取了，您可以將建立的套件相依性加入到現有的用戶端 iOS 專案中，或者建立一個新專案。若要加入套件相依性：

1. 在 Xcode 中，選擇 **File | Add Package Dependencies**。
2. 在搜尋欄位中，輸入包含 `Package.swift` 檔案的 Git 存儲庫 URL：

   ![指定包含套件檔案的存儲庫](multiplatform-spm-url.png)

3. 點擊 **Add package** 按鈕，然後為套件選擇產品（products）和對應的目標。

   > 如果您正在製作 Swift 套件，對話方塊會有所不同。在這種情況下，點擊 **Copy package** 按鈕。
   > 這會將一行 `.package` 內容放入您的剪貼簿。將此行貼到您自己的 `Package.swift` 檔案中的 [Package.Dependency](https://developer.apple.com/documentation/packagedescription/package/dependency) 區塊，並將必要的產品加入到適當的 `Target.Dependency` 區塊中。
   >
   {style="tip"}

### 檢查您的設定

若要檢查所有設定是否正確，請在 Xcode 中測試匯入：

1. 在您的專案中，導航至您的 UI 視圖檔案，例如 `ContentView.swift`。
2. 將程式碼替換為以下片段：
   
    ```Swift
    import SwiftUI
    import Shared
    
    struct ContentView: View {
        var body: some View {
            VStack {
                Image(systemName: "globe")
                    .imageScale(.large)
                    .foregroundStyle(.tint)
                Text("Hello, world! \(Shared.Platform_iosKt.getPlatform().name)")
            }
            .padding()
        }
    }
    
    #Preview {
        ContentView()
    }
    ```
   
    在此，您匯入 `Shared` XCFramework，然後使用它在 `Text` 欄位中取得平台名稱。

3. 確保預覽已更新為新文字。

## 將多個模組匯出為 XCFramework

若要讓多個 Kotlin Multiplatform 模組的程式碼可作為 iOS 二進位檔案使用，請將這些模組組合在一個單一的傘狀（umbrella）模組中。接著，建置並匯出此傘狀模組的 XCFramework。

例如，您有一個 `network` 和一個 `database` 模組，您將它們組合在一個 `together` 模組中：

1. 在 `together/build.gradle.kts` 檔案中，指定相依性與架構配置：

    ```kotlin
    kotlin {
        val frameworkName = "together"
        val xcf = XCFramework(frameworkName)
    
        listOf(
            iosArm64(),
            iosSimulatorArm64()
        ).forEach { iosTarget ->
            // 與上述範例相同，
            // 增加了相依性的匯出呼叫
            iosTarget.binaries.framework {
                export(projects.network)
                export(projects.database)
    
                baseName = frameworkName
                xcf.add(this)
            }
        }
    
        // 將相依性設定為 "api"（而非 "implementation"）以匯出底層模組
        sourceSets {
            commonMain.dependencies {
                api(projects.network)
                api(projects.database)
            }
        }
    }
    ```

2. 每個包含的模組都應配置其 iOS 目標，例如：

    ```kotlin
    kotlin {
        android {
            //...
        }
        
        iosArm64()
        iosSimulatorArm64()
        
        //...
    }
    ```

3. 在 `together` 資料夾中建立一個空的 Kotlin 檔案，例如 `together/src/commonMain/kotlin/Together.kt`。
   這是一個權宜措施，因為如果匯出的模組不包含任何原始碼，Gradle 指令碼目前無法組建架構。

4. 執行組建架構的 Gradle 任務：

    ```shell
    ./gradlew :together:assembleTogetherReleaseXCFramework
    ```

5. 按照[上一節](#prepare-the-xcframework-and-the-swift-package-manifest)的步驟準備 `together.xcframework`：將其封存、計算校驗碼、將封存的 XCFramework 上傳到檔案存儲空間、建立並推送 `Package.swift` 檔案。

現在，您可以將該相依性匯入到 Xcode 專案中。加入 `import together` 指示詞後，您應該可以在 Swift 程式碼中匯入來自 `network` 和 `database` 模組的類別。