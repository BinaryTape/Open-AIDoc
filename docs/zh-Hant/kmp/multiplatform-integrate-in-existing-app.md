[//]: # (title: 讓你的 Android 應用程式在 iOS 上運作 – 教學)

<secondary-label ref="Android Studio"/>

本教學展示如何讓現有的 Android 應用程式實現跨平台，使其能同時在 Android 與 iOS 上運作。
你將能夠在同一個地方同時為 Android 和 iOS 編寫程式碼。

本教學使用一個[範例 Android 應用程式](https://github.com/Kotlin/kmp-integration-sample)，該應用程式包含一個用於輸入使用者名稱和密碼的單一螢幕畫面。憑據經過驗證後會儲存至記憶體資料庫中。

要讓你的應用程式同時在 iOS 和 Android 上運作，
你首先需要將部分程式碼移至共用模組，使其具備跨平台能力。
接著，你將在 Android 應用程式中使用這段跨平台程式碼，然後在新的 iOS 應用程式中重複使用相同的程式碼。

> 如果你還不熟悉 Kotlin Multiplatform，請先了解如何[從頭開始建立跨平台應用程式](quickstart.md)。
>
{style="tip"}

## 準備開發環境 {id="prepare-an-environment-for-development"}

1. 在快速入門指南中，完成[設定 Kotlin Multiplatform 開發環境](quickstart.md#set-up-the-environment)的說明。

   > 由於 Apple 的硬體限制與要求，你需要一台搭載 macOS 的 Mac 電腦才能完成本教學中的某些步驟，例如執行 iOS 應用程式。
   >
   {style="note"}

2. 在 Android Studio 中，從版本控制系統建立新專案：

   ```text
   https://github.com/Kotlin/kmp-integration-sample
   ```

   `master` 分支包含專案的初始狀態——一個簡單的 Android 應用程式。
   若要查看包含 iOS 應用程式和共用模組的最終狀態，請切換至 `final` 分支。
   
3. 切換至 **Project** 檢視：

   ![Project 檢視](switch-to-project.png){width="513"}

## 讓你的程式碼實現跨平台 {id="make-your-code-cross-platform"}

要使你的程式碼具備跨平台能力，請遵循以下步驟：

1. [決定哪些程式碼要進行跨平台](#decide-what-code-to-make-cross-platform)
2. [為跨平台程式碼建立共用模組](#create-a-shared-module-for-cross-platform-code)
3. [測試程式碼共用](#add-code-to-the-shared-module)
4. [在你的 Android 應用程式中新增對共用模組的相依性](#add-a-dependency-on-the-shared-module-to-your-android-application)
5. [將商業邏輯改為跨平台](#make-the-business-logic-cross-platform)
6. [在 Android 上執行你的跨平台應用程式](#run-your-cross-platform-application-on-android)

### 決定哪些程式碼要進行跨平台 {id="decide-what-code-to-make-cross-platform"}

決定你的 Android 應用程式中哪些程式碼適合與 iOS 共用，哪些程式碼應保留為原生程式碼。一個簡單的原則是：
盡可能共用你想重複使用的部分。商業邏輯在 Android 和 iOS 上通常是相同的，
因此非常適合作為共用復用的候選對象。

在範例 Android 應用程式中，商業邏輯儲存於套件 `com.jetbrains.simplelogin.androidapp.data` 中。
未來的 iOS 應用程式也將使用相同的邏輯，因此你應該將其改為跨平台程式碼。

![要共用的商業邏輯](business-logic-to-share.png){width=366}

### 為跨平台程式碼建立共用模組 {id="create-a-shared-module-for-cross-platform-code"}

供 iOS 和 Android 共同使用的跨平台程式碼將存儲在共用模組中。
Android Studio 和 IntelliJ IDEA 都提供了建立 Kotlin Multiplatform 共用模組的精靈。

建立一個共用模組，以連接現有的 Android 應用程式和未來的 iOS 應用程式：

1. 在 Android Studio 中，從主選單選擇 **File** | **New** | **New Module**。
2. 在範本清單中，選取 **Kotlin Multiplatform Shared Module**。
   將模組名稱保留為 `shared`，並輸入套件名稱：
   
   ```text
   com.jetbrains.simplelogin.shared
   ```
   
3. 點擊 **Finish**。精靈會建立共用模組、對應地修改組建指令碼，並開始執行 Gradle 同步。
4. 等待同步完成。
   你將會在 `shared` 目錄中看到以下檔案結構：

   ![shared 目錄內的最終檔案結構](shared-directory-structure.png){width="341"}

   若想更深入了解產生的專案配置結構，
   請參閱 [Kotlin Multiplatform 專案結構基礎](multiplatform-discover-project.md)。

5. 將 `shared/build.gradle.kts` 中的 `kotlin.android {}` 區塊取代為以下 `androidLibrary {}` 區塊，
   因為 `shared` 模組將作為 Android 應用程式的程式庫使用：

    ```kotlin
    import org.jetbrains.kotlin.gradle.dsl.JvmTarget

    kotlin {
        androidLibrary {
            namespace = "com.jetbrains.simplelogin.shared"
            compileSdk = libs.versions.android.compileSdk.get().toInt()
            compilerOptions {
                jvmTarget = JvmTarget.JVM_11
            }
        
            androidResources {
                enable = true
            }
        
            withHostTestBuilder {
            }
        
            withDeviceTestBuilder {
                sourceSetTreeName = "test"
            }.configure {
                instrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
            }
        }
        //...
    }
    ```
   
### 將程式碼新增至共用模組 {id="add-code-to-the-shared-module"}

現在你已經有了共用模組，
在 `shared/src/commonMain/kotlin/com.jetbrains.simplelogin.shared` 目錄中新增一些要共用的共用程式碼：

1. 建立一個新的 `Greeting` 類別，並加入以下程式碼：

    ```kotlin
    package com.jetbrains.simplelogin.shared

    class Greeting {
        private val platform = getPlatform()

        fun greet(): String {
            return "Hello, ${platform.name}!"
        }
    }
    ```

2. 將現有檔案中的程式碼取代為以下內容：

     * 在 `commonMain/Platform.kt` 中：

         ```kotlin
         package com.jetbrains.simplelogin.shared
       
         interface Platform {
             val name: String
         }
        
         expect fun getPlatform(): Platform
         ```
     
     * 在 `androidMain/Platform.android.kt` 中：

         ```kotlin
         package com.jetbrains.simplelogin.shared
         
         import android.os.Build

         class AndroidPlatform : Platform {
             override val name: String = "Android ${Build.VERSION.SDK_INT}"
         }

         actual fun getPlatform(): Platform = AndroidPlatform()
         ```
     * 在 `iosMain/Platform.ios.kt` 中：

         ```kotlin
         package com.jetbrains.simplelogin.shared
       
         import platform.UIKit.UIDevice

         class IOSPlatform: Platform {
             override val name: String = UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion
         }

         actual fun getPlatform(): Platform = IOSPlatform()
         ```

現在你有了一個通用的 `getPlatform()` 函式，它會傳回包含平台名稱屬性的平台專用物件。

### 在你的 Android 應用程式中新增對共用模組的相依性 {id="add-a-dependency-on-the-shared-module-to-your-android-application"}

要在 Android 應用程式中使用跨平台程式碼，請連接共用模組，將商業邏輯程式碼移至該處，並使該程式碼具備跨平台能力。

1. 在 `app/build.gradle.kts` 檔案中新增對共用模組的相依性：

    ```kotlin
    dependencies {
        // ...
        implementation(project(":shared"))
    }
    ```

2. 依照 IDE 的提示同步 Gradle 檔案，或使用選單項目 **File** | **Sync Project with Gradle Files**。
3. 在 `app/src/main/java/` 目錄中，開啟 `com.jetbrains.simplelogin.androidapp.ui.login` 套件下的 `LoginActivity.kt` 檔案。
4. 為確保共用模組已成功連接至應用程式，可以在 `onCreate()` 方法中新增 `Log.i()` 呼叫，將 `greet()` 函式的結果寫入記錄中：

    ```kotlin
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        Log.i("Login Activity", "Hello from shared module: " + (Greeting().greet()))
   
        // ...
    }
    ```
5. 依照 IDE 的提示匯入缺少的類別。
6. 在工具列中，點擊執行設定下拉式選單旁的偵錯圖示：

   ![從清單中選取要偵錯的應用程式](app-list-android.png){width="300"}

7. 在 **Logcat** 工具視窗中，於記錄中搜尋「Hello」，你將會看到來自共用模組的問候訊息：

   ![來自共用模組的問候訊息](shared-module-greeting.png){width="700"}

### 將商業邏輯改為跨平台 {id="make-the-business-logic-cross-platform"}

現在你可以將商業邏輯程式碼提取到 Kotlin Multiplatform 共用模組的 `commonMain` 原始碼集中。
這將允許 Android 和 iOS 同時使用該程式碼。

1. 將商業邏輯程式碼 `com.jetbrains.simplelogin.androidapp.data` 從 `app` 目錄移至 `shared/src/commonMain` 目錄下的 `com.jetbrains.simplelogin.shared` 套件中。

   ![拖放包含商業邏輯程式碼的套件](moving-business-logic.png){width=300}

2. 當 Android Studio 詢問你要執行的操作時，選取移動套件並確認重構。

   ![重構商業邏輯套件](refactor-business-logic-package.png){width=300}

3. 忽略所有關於平台相依程式碼的警告，點擊 **Refactor Anyway**。

   ![關於平台相依程式碼的警告](warnings-android-specific-code.png){width=450}

4. 移除 Android 專用程式碼，將其取代為跨平台的 Kotlin 程式碼，或者使用[預期宣告與實際宣告 (expected and actual declarations)](multiplatform-connect-to-apis.md) 連接 Android 專用 API。詳情請參閱以下章節：

   #### 將 Android 專用程式碼取代為跨平台程式碼 {initial-collapse-state="collapsed" collapsible="true" id="replace-android-specific-code-with-cross-platform-code"}
   
   為了讓程式碼在 Android 和 iOS 上都能順暢運作，請盡可能將移動後的 `data` 目錄中所有的 JVM 相依性取代為 Kotlin 相依性。

   1. 在 `LoginDataValidator` 類別中，將 `android.utils` 套件的 `Patterns` 類別替換為符合電子郵件驗證模式的 Kotlin 正規表示式：
   
       ```kotlin
       // Before
       private fun isEmailValid(email: String) = Patterns.EMAIL_ADDRESS.matcher(email).matches()
       ```
   
       ```kotlin
       // After
       private fun isEmailValid(email: String) = emailRegex.matches(email)
       
       companion object {
           private val emailRegex = 
               ("[a-zA-Z0-9\\+\\.\\_\\%\\-\\+]{1,256}" +
                   "\\@" +
                   "[a-zA-Z0-9][a-zA-Z0-9\\-]{0,64}" +
                   "(" +
                   "\\." +
                   "[a-zA-Z0-9][a-zA-Z0-9\\-]{0,25}" +
                   ")+").toRegex()
       }
       ```
   
   2. 移除 `Patterns` 類別的 import 指示詞：
   
       ```kotlin
       import android.util.Patterns
       ```

   3. 在 `LoginDataSource` 類別中，將 `login()` 函式中的 `IOException` 取代為 `RuntimeException`。
      `IOException` 在 Kotlin/JVM 之外的環境不可用。

          ```kotlin
          // Before
          return Result.Error(IOException("Error logging in", e))
          ```

          ```kotlin
          // After
          return Result.Error(RuntimeException("Error logging in", e))
          ```

   4. 同時移除 `IOException` 的 import 指示詞：

       ```kotlin
       import java.io.IOException
       ```

   #### 實作平台專屬的 UUID 產生機制 {initial-collapse-state="collapsed" collapsible="true" id="implement-platform-specific-uuid-generation"}
   
   在 `LoginDataSource` 類別中，`fakeUser` 的通用唯一識別碼 (UUID) 是使用 `java.util.UUID` 類別產生的，但該類別在 iOS 上不可用。
   
   ```kotlin
   val fakeUser = LoggedInUser(java.util.UUID.randomUUID().toString(), "Jane Doe")
   ```
   
   雖然 Kotlin 標準庫提供了[用於 UUID 產生的類別](https://kotlinlang.org/docs/uuids.html)，
   但在此情境中，我們使用平台專屬功能來進行練習。
   
   在共用程式碼中為 `randomUUID()` 函式提供 `expect` 宣告，並在相應的原始碼集中為各個平台（Android 與 iOS）提供其 `actual` 實作。
   你可以進一步了解[連接平台專用 API](multiplatform-connect-to-apis.md)。
   
   1. 將 `login()` 函式中的 `java.util.UUID.randomUUID()` 呼叫變更為 `randomUUID()` 呼叫，你將為每個平台分別實作它：
   
       ```kotlin
       val fakeUser = LoggedInUser(randomUUID(), "Jane Doe")
       ```
   
   2. 在 `shared/src/commonMain` 目錄的 `com.jetbrains.simplelogin.shared` 套件中建立 `Utils.kt` 檔案，並提供 `expect` 宣告：
   
       ```kotlin
       package com.jetbrains.simplelogin.shared
       
       expect fun randomUUID(): String
       ```
   
   3. 在 `shared/src/androidMain` 目錄的 `com.jetbrains.simplelogin.shared` 套件中建立 `Utils.android.kt` 檔案，並提供 Android 的 `randomUUID()` 的 `actual` 實作：
   
       ```kotlin
       package com.jetbrains.simplelogin.shared
       
       import java.util.*
      
       actual fun randomUUID() = UUID.randomUUID().toString()
       ```
   
   4. 在 `shared/src/iosMain` 目錄的 `com.jetbrains.simplelogin.shared` 套件中建立 `Utils.ios.kt` 檔案，並提供 iOS 的 `randomUUID()` 的 `actual` 實作：
   
       ```kotlin
       package com.jetbrains.simplelogin.shared
       
       import platform.Foundation.NSUUID
      
       actual fun randomUUID(): String = NSUUID().UUIDString()
       ```
   
   5. 在 `shared/src/commonMain` 目錄的 `LoginDataSource.kt` 檔案中匯入 `randomUUID` 函式：
   
      ```kotlin
      import com.jetbrains.simplelogin.shared.randomUUID
      ```
   
現在，Kotlin 將會分別在 Android 和 iOS 上使用各自平台特有的 UUID 實作。

### 在 Android 上執行你的跨平台應用程式 {id="run-your-cross-platform-application-on-android"}

執行 `app` 執行配置，以確保 Android 應用程式能像之前一樣正常運作。

![Android 登入應用程式](android-login.png){width=300}

## 讓你的跨平台應用程式在 iOS 上運作 {id="make-your-cross-platform-application-work-on-ios"}

將 Android 應用程式改為跨平台後，你就可以建立 iOS 應用程式並在其中複用共用的商業邏輯。

1. [在 Xcode 中建立 iOS 專案](#create-an-ios-project-in-xcode)
2. [設定 iOS 專案以使用 KMP 框架](#configure-the-ios-project-to-use-a-kmp-framework)
3. [在 Android Studio 中設定 iOS 執行配置](#set-up-an-ios-run-configuration-in-android-studio)
4. [在 iOS 專案中使用共用模組](#use-the-shared-module-in-the-ios-project)

### 在 Xcode 中建立 iOS 專案 {id="create-an-ios-project-in-xcode"}

1. 在 Xcode 中，點擊 **File** | **New** | **Project**。
2. 在對話方塊中，切換至 **iOS** 標籤頁：

   ![iOS 專案範本](ios-project-wizard-1.png){width=700}

3. 選取 **App** 範本，然後點擊 **Next**。

4. 在產品名稱中指定「simpleLoginIOS」，然後點擊 **Next**。

   ![iOS 專案設定](ios-project-wizard-2.png){width=700}

5. 專案位置請選取存放跨平台應用程式的目錄，例如 `kmp-integration-sample`。

    在 Android Studio 中，你將會看到以下結構：
    
    ![Android Studio 中的 iOS 專案](ios-project-in-as.png){width=194}

6. 為了與跨平台專案的其他頂層目錄保持一致，
   請關閉 Xcode 並將 `simpleLoginIOS` 目錄重新命名為 `iosApp`。

   > 如果在開啟 Xcode 的情況下重新命名資料夾，將會收到警告並且可能損壞專案。
   >
   {style="warning"}

   ![Android Studio 中重新命名後的 iOS 專案目錄](ios-directory-renamed-in-as.png){width=194}

### 設定 iOS 專案以使用 KMP 框架 {id="configure-the-ios-project-to-use-a-kmp-framework"}

你可以直接設定 iOS 應用程式與 Kotlin Multiplatform 建置的框架之間的整合。

> 此方法的替代方案（SwiftPM 與 CocoaPods）已在 [iOS 整合方式概覽](multiplatform-ios-integration-overview.md)中介紹。
> 
{style="note"}

1. 在 Android Studio 中，右鍵點擊 `iosApp/simpleLoginIOS.xcodeproj` 目錄並選取
   **Open In** | **Open In Associated Application**，以在 Xcode 中開啟 iOS 專案。
2. 在 Xcode 中，點擊 **Project** 導覽器中的專案名稱以開啟 iOS 專案設定。

3. 在左側的 **Targets** 區段中選取 **simpleLoginIOS**，然後點擊 **Build Phases** 標籤頁。

4. 點擊 **+** 圖示並選取 **New Run Script Phase**。

    ![新增執行指令碼階段](xcode-run-script-phase-1.png){width=700}

5. 將以下指令碼貼入執行指令碼欄位：

    ```bash
    if [ "YES" = "$OVERRIDE_KOTLIN_BUILD_IDE_SUPPORTED" ]; then
        echo "Skipping Gradle build task invocation due to OVERRIDE_KOTLIN_BUILD_IDE_SUPPORTED environment variable set to \"YES\""
        exit 0
    fi
    cd "$SRCROOT/.."
    ./gradlew :shared:embedAndSignAppleFrameworkForXcode
    ```

6. 停用 **Based on dependency analysis** 選項。
   這可確保 Xcode 在每次組建時都會執行該指令碼，且不會每次都針對遺失的輸出相依項發出警告。

   ![新增指令碼](xcode-run-script-phase-2.png){width=700}

7. 將 **Run Script** 階段向上移動，放置在 **Compile Sources** 階段之前：

   ![上移 Run Script 階段](xcode-run-script-phase-3.png){width=700}

8. 在 **Build Settings** 標籤頁中，停用 **Build Options** 下的 **User Script Sandboxing** 選項：

   ![使用者指令碼沙盒化](disable-sandboxing-in-xcode-project-settings.png){width=700}

   > 如果你有不同於預設 `Debug` 或 `Release` 的自訂組建組態，請在 **Build Settings**
   > 標籤頁的 **User-Defined** 下新增 `KOTLIN_FRAMEWORK_BUILD_TYPE` 設定，並將其設定為 `Debug` 或 `Release`。
   >
   {style="note"}

9. 在 **Info** 標籤頁上，新增自訂屬性 `CADisableMinimumFrameDurationOnPhone` 並將其設為 `YES`，
   以在 iOS 上啟用高更新率支援。

10. 在 **Signing & Capabilities** 標籤頁上，選取你的開發團隊，若尚未建立請建立一個。
    這可對 KMP 模組產生的 `shared` 框架進行簽署。

    在此處你還應確保 **Bundle Identifier** 設定為唯一值，否則 Xcode 可能會導致組建失敗。

11. 在 Xcode 中組建專案（主選單中的 **Product** | **Build**）。
    如果一切設定正確，專案應該能成功組建
    （你可以安全地忽略「build phase will be run during every build」警告）
   
    > 如果你在停用 **User Script Sandboxing** 選項之前曾組建專案，組建可能會失敗：
    > Gradle 常駐程式（daemon process）可能已被沙盒化，需要重新啟動。
    > 在再次組建專案之前，請在專案目錄（在我們的範例中為 `kmp-integration-sample`）中執行以下指令來停止它：
    > 
    > ```shell
    > ./gradlew --stop
    > ```
    > 
    {style="note"}

### 在 Android Studio 中設定 iOS 執行配置 {id="set-up-an-ios-run-configuration-in-android-studio"}

確認 Xcode 設定無誤後，返回 Android Studio：

1. 在主選單中選取 **File | Sync Project with Gradle Files**。Android Studio 會自動產生名為 **simpleLoginIOS** 的執行配置。

   Android Studio 會自動產生名為 **simpleLoginIOS** 的執行配置，並將 `iosApp` 目錄標記為已連結的 Xcode 專案。

2. 在執行配置清單中選取 **simpleLoginIOS**。
   選擇一個 iOS 模擬器，然後點擊 **Run** 以檢查 iOS 執行配置是否能正常運作。

   ![執行配置清單中的 iOS 執行配置](ios-run-configuration-simplelogin.png)

### 在 iOS 專案中使用共用模組 {id="use-the-shared-module-in-the-ios-project"}

`shared/build.gradle.kts` 檔案為每個 iOS 目標將 `binaries.framework.baseName`
屬性定義為 `sharedKit`。
這是 Kotlin Multiplatform 建置給 iOS 應用程式使用的框架名稱。

若要測試整合情況，請在 Swift 程式碼中新增對共用程式碼的呼叫：

1. 在 Android Studio 中，開啟 `iosApp/simpleloginIOS/ContentView.swift` 檔案並匯入該框架：

   ```swift
   import sharedKit
   ```

2. 為檢查是否已正確連接，請更新 `ContentView` 結構的程式碼，以使用來自 `shared` 模組的 `greet()` 函式：

   ```swift
   struct ContentView: View {
       var body: some View {
           Text(Greeting().greet())
           .padding()
       }
   }
   ```

3. 使用 Android Studio 的 iOS 執行配置執行應用程式以查看結果：

   ![來自共用模組的問候訊息](xcode-iphone-hello.png){width=300}

4. 再次更新 `ContentView.swift` 檔案中的程式碼，使用共用模組中的商業邏輯來呈現應用程式 UI：

   ```kotlin
   
   ```

5. 在 `simpleLoginIOSApp.swift` 檔案中，匯入 `sharedKit` 模組並指定 `ContentView()` 函式的引數：

    ```swift
    import SwiftUI
    import sharedKit
    
    @main
    struct SimpleLoginIOSApp: App {
        var body: some Scene {
            WindowGroup {
                ContentView(viewModel: .init(loginRepository: LoginRepository(dataSource: LoginDataSource()), loginValidator: LoginDataValidator()))
            }
        }
    }
    ```

6. 再次執行 iOS 執行配置，確認 iOS 應用程式顯示了登入表單。
7. 輸入「Jane」作為使用者名稱，輸入「password」作為密碼。
8. 由於你[先前已設定好整合](#configure-the-ios-project-to-use-a-kmp-framework)，
    iOS 應用程式會使用共用程式碼來驗證輸入內容：

   ![簡單登入應用程式](xcode-iphone-login.png){width=300}

## 享受成果 – 僅需更新一次邏輯 {id="enjoy-the-results-update-the-logic-only-once"}

現在你的應用程式已經實現跨平台。你可以在 `shared` 模組中更新商業邏輯，並同時在 Android 和 iOS 上查看成果。

1. 修改使用者密碼的驗證邏輯：「password」不應是合法的密碼選項。
    若要進行修改，請更新 `LoginDataValidator` 類別的 `checkPassword()` 函式
    （要快速找到它，請按兩下 <shortcut>Shift</shortcut> 鍵，貼上類別名稱，然後切換至 **Classes** 標籤頁）：

   ```kotlin
   package com.jetbrains.simplelogin.shared.data
   
   class LoginDataValidator {
   //...
       fun checkPassword(password: String): Result {
           return when {
               password.length < 5 -> Result.Error("Password must be >5 characters")
               password.lowercase() == "password" -> Result.Error("Password shouldn't be \"password\"")
               else -> Result.Success
           }
       }
   //...
   }
   ```

2. 從 Android Studio 中分別執行 iOS 和 Android 應用程式以查看變更
   （在 iOS 上點擊紅色警告三角形時會顯示錯誤訊息）：

   ![Android 和 iOS 應用程式密碼錯誤畫面](android-iphone-password-error.png){width=600}

你可以檢視[本教學的最終程式碼](https://github.com/Kotlin/kmp-integration-sample/tree/final)。

## 還有什麼可以共用？ {id="what-else-to-share"}

你已經共用了應用程式的商業邏輯，但你也可以決定共用應用程式的其他層級。
例如，[Android](https://github.com/Kotlin/kmp-integration-sample/blob/final/app/src/main/java/com/jetbrains/simplelogin/androidapp/ui/login/LoginViewModel.kt) 和 [iOS 應用程式](https://github.com/Kotlin/kmp-integration-sample/blob/final/iosApp/SimpleLoginIOS/ContentView.swift#L84)中的 `ViewModel` 類別程式碼幾乎相同，
如果你的行動應用程式需要擁有相同的展示層（presentation layer），你也可以將其共用。

## 後續步驟 {id="what-s-next"}

將 Android 應用程式實現跨平台後，你可以繼續進行以下操作：

* [新增對多平台程式庫的相依性](multiplatform-add-dependencies.md)
* [新增 Android 相依性](multiplatform-android-dependencies.md)
* [新增 iOS 相依性](multiplatform-ios-dependencies.md)

你可以使用 Compose Multiplatform 在所有平台上建立統一的 UI：

* [了解 Compose Multiplatform 與 Jetpack Compose](compose-multiplatform-and-jetpack-compose.md)
* [探索 Compose Multiplatform 的可用資源](compose-multiplatform-resources.md)
* [建立具有共用邏輯與 UI 的應用程式](compose-multiplatform-new-project.md)

你也可以參考社群資源：

* [影片：如何將 Android 專案遷移至 Kotlin Multiplatform](https://www.youtube.com/watch?v=vb-Pt8SdfEE&t=1s)
* [影片：讓你的 Kotlin JVM 程式碼為 Kotlin Multiplatform 做好準備的 3 種方法](https://www.youtube.com/watch?v=X6ckI1JWjqo)