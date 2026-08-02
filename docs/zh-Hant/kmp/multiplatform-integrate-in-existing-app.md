[//]: # (title: 讓您的 Android 應用程式在 iOS 上運作 – 教學)

<secondary-label ref="Android Studio"/>

本教學將展示如何讓現有的 Android 應用程式成為跨平台應用程式，使其能在 Android 和 iOS 上運作。您將能夠在同一個地方同時為 Android 和 iOS 編寫程式碼。

本教學使用一個[範例 Android 應用程式](https://github.com/Kotlin/kmp-integration-sample)，該應用程式具有一個用於輸入使用者名稱和密碼的單一畫面。憑據會經過驗證並儲存到記憶體資料庫中。

為了讓您的應用程式在 iOS 和 Android 上都能運作，您首先需要將部分程式碼移至共享模組（shared module），使您的程式碼具備跨平台能力。之後，您將在 Android 應用程式中使用您的跨平台程式碼，然後在新的 iOS 應用程式中使用相同的程式碼。

> 如果您不熟悉 Kotlin Multiplatform，請先了解如何[從頭開始建立跨平台應用程式](quickstart.md)。
>
{style="tip"}

## 準備開發環境

1. 在快速入門指南中，完成[設定 Kotlin Multiplatform 開發環境](quickstart.md#set-up-the-environment)的說明。

   > 您需要一台裝有 macOS 的 Mac 才能完成本教學中的某些步驟，例如執行 iOS 應用程式。這是由於 Apple 的限制。 
   >
   {style="note"}

2. 在 Android Studio 中，從版本控制建立一個新專案：

   ```text
   https://github.com/Kotlin/kmp-integration-sample
   ```

   `master` 分支包含專案的初始狀態 – 一個簡單的 Android 應用程式。要查看包含 iOS 應用程式和共享模組的最終狀態，請切換至 `final` 分支。
   
3. 切換至 **Project** 檢視：

   ![Project 檢視](switch-to-project.png){width="513"}

## 讓您的程式碼具備跨平台能力

要使您的程式碼具備跨平台能力，您將遵循以下步驟：

1. [決定哪些程式碼要跨平台](#decide-what-code-to-make-cross-platform)
2. [為跨平台程式碼建立共享模組](#create-a-shared-module-for-cross-platform-code)
3. [測試程式碼共享](#add-code-to-the-shared-module)
4. [在您的 Android 應用程式中新增對共享模組的相依性](#add-a-dependency-on-the-shared-module-to-your-android-application)
5. [使商業邏輯具備跨平台能力](#make-the-business-logic-cross-platform)
6. [在 Android 上執行您的跨平台應用程式](#run-your-cross-platform-application-on-android)

### 決定哪些程式碼要跨平台

決定 Android 應用程式中的哪些程式碼較適合與 iOS 共享，以及哪些程式碼應保持原生。一個簡單的規則是：盡可能共享您想要重複使用的內容。商業邏輯在 Android 和 iOS 上通常是相同的，因此它是重複使用的絕佳候選者。

在您的範例 Android 應用程式中，商業邏輯儲存在 `com.jetbrains.simplelogin.androidapp.data` 套件中。您未來的 iOS 應用程式將使用相同的邏輯，因此您也應該使其具備跨平台能力。

![要共享的商業邏輯](business-logic-to-share.png){width=366}

### 為跨平台程式碼建立共享模組

用於 iOS 和 Android 的跨平台程式碼將儲存在共享模組中。Android Studio 和 IntelliJ IDEA 都提供了為 Kotlin Multiplatform 建立共享模組的精靈。

建立一個共享模組以連接現有的 Android 應用程式和您未來的 iOS 應用程式：

1. 在 Android Studio 中，從主選單中選取 **File** | **New** | **New Module**。
2. 在範本清單中，選取 **Kotlin Multiplatform Shared Module**。將模組名稱保留為 `shared` 並輸入套件名稱：
   
   ```text
   com.jetbrains.simplelogin.shared
   ```
   
3. 點擊 **Finish**。精靈會建立共享模組，相應地更改建置腳本，並開始 Gradle 同步。
4. 等待同步完成。您將在 `shared` 目錄中看到以下檔案結構：

   ![shared 目錄內的最終檔案結構](shared-directory-structure.png){width="341"}

   如果您想更深入了解產出專案的配置，請參閱 [Kotlin Multiplatform 專案結構基礎](multiplatform-discover-project.md)。

5. 將 `shared/build.gradle.kts` 中的 `kotlin.android {}` 區塊替換為以下 `androidLibrary {}` 區塊，因為 `shared` 模組將作為 Android 應用程式的程式庫使用：

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
   
### 將程式碼新增至共享模組

現在您已有共享模組，請在 `shared/src/commonMain/kotlin/com.jetbrains.simplelogin.shared` 目錄中新增一些要共享的通用程式碼：

1. 建立一個帶有以下程式碼的新 `Greeting` 類別：

    ```kotlin
    package com.jetbrains.simplelogin.shared

    class Greeting {
        private val platform = getPlatform()

        fun greet(): String {
            return "Hello, ${platform.name}!"
        }
    }
    ```

2. 將現有檔案中的程式碼替換為以下內容：

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

現在您有一個通用的 `getPlatform()` 函式，它會傳回一個包含平台名稱屬性的平台特定物件。

### 在您的 Android 應用程式中新增對共享模組的相依性

要在您的 Android 應用程式中使用跨平台程式碼，請將共享模組連接至該程式碼，將商業邏輯程式碼移至該處，並使此程式碼具備跨平台能力。

1. 在 `app/build.gradle.kts` 檔案中新增對共享模組的相依性：

    ```kotlin
    dependencies {
        // ...
        implementation(project(":shared"))
    }
    ```

2. 按照 IDE 的建議同步 Gradle 檔案，或使用 **File** | **Sync Project with Gradle Files** 選單項目。
3. 在 `app/src/main/java/` 目錄中，開啟 `com.jetbrains.simplelogin.androidapp.ui.login` 套件下的 `LoginActivity.kt` 檔案。
4. 為了確保共享模組已成功連接到您的應用程式，透過在 `onCreate()` 方法中新增 `Log.i()` 呼叫，將 `greet()` 函式的結果寫入記錄中：

    ```kotlin
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        Log.i("Login Activity", "Hello from shared module: " + (Greeting().greet()))
   
        // ...
    }
    ```
5. 遵循 IDE 的建議匯入缺失的類別。
6. 在工具列中，點擊執行配置下拉選單旁邊的偵錯圖示：

   ![從清單中選取要偵錯的應用程式](app-list-android.png){width="300"}

7. 在 **Logcat** 工具視窗中，在記錄中搜尋 "Hello"，您將找到來自共享模組的問候語：

   ![來自共享模組的問候語](shared-module-greeting.png){width="700"}

### 使商業邏輯具備跨平台能力

您現在可以將商業邏輯程式碼提取到 Kotlin Multiplatform 共享模組中的 `commonMain` 原始碼集。這將允許在 Android 和 iOS 上使用該程式碼。

1. 將商業邏輯程式碼 `com.jetbrains.simplelogin.androidapp.data` 從 `app` 目錄移動到 `shared/src/commonMain` 目錄下的 `com.jetbrains.simplelogin.shared` 套件。

   ![拖放包含商業邏輯程式碼的套件](moving-business-logic.png){width=300}

2. 當 Android Studio 詢問您想做什麼時，選取移動套件，然後核准重構作業。

   ![重構商業邏輯套件](refactor-business-logic-package.png){width=300}

3. 忽略所有關於平台相關程式碼的警告，然後點擊 **Refactor Anyway**。

   ![關於平台相關程式碼的警告](warnings-android-specific-code.png){width=450}

4. 移除 Android 特有的程式碼，將其替換為跨平台 Kotlin 程式碼，或使用 [expect 和 actual 宣告](multiplatform-connect-to-apis.md)連接至 Android 特有的 API。詳情請參閱以下章節：

   #### 將 Android 特有的程式碼替換為跨平台程式碼 {initial-collapse-state="collapsed" collapsible="true"}
   
   為了讓您的程式碼在 Android 和 iOS 上都能良好運作，請盡可能在移動後的 `data` 目錄中將所有 JVM 相依性替換為 Kotlin 相依性。

   1. 在 `LoginDataValidator` 類別中，將 `android.utils` 套件中的 `Patterns` 類別替換為與電子郵件驗證模式相符的 Kotlin 正規表示式：
   
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
   
   2. 移除 `Patterns` 類別的匯入指示詞：
   
       ```kotlin
       import android.util.Patterns
       ```

   3. 在 `LoginDataSource` 類別中，將 `login()` 函式中的 `IOException` 替換為 `RuntimeException`。`IOException` 在 Kotlin/JVM 之外不可用。

          ```kotlin
          // Before
          return Result.Error(IOException("Error logging in", e))
          ```

          ```kotlin
          // After
          return Result.Error(RuntimeException("Error logging in", e))
          ```

   4. 同時移除 `IOException` 的匯入指示詞：

       ```kotlin
       import java.io.IOException
       ```

   #### 實作特定平台的 UUID 產生 {initial-collapse-state="collapsed" collapsible="true"}
   
   在 `LoginDataSource` 類別中，`fakeUser` 的通用唯一識別碼 (UUID) 是使用 `java.util.UUID` 類別產生的，該類別在 iOS 中不可用。
   
   ```kotlin
   val fakeUser = LoggedInUser(java.util.UUID.randomUUID().toString(), "Jane Doe")
   ```
   
   儘管 Kotlin 標準函式庫提供了一個[用於產生 UUID 的類別](https://kotlinlang.org/docs/uuids.html)，但讓我們以此案例練習使用特定平台功能。
   
   在共享程式碼中為 `randomUUID()` 函式提供 `expect` 宣告，並在對應的原始碼集中為每個平台（Android 和 iOS）提供其 `actual` 實作。您可以進一步了解有關[連接到平台特定 API](multiplatform-connect-to-apis.md) 的資訊。
   
   1. 將 `login()` 函式中的 `java.util.UUID.randomUUID()` 呼叫更改為 `randomUUID()` 呼叫，您將為每個平台實作該呼叫：
   
       ```kotlin
       val fakeUser = LoggedInUser(randomUUID(), "Jane Doe")
       ```
   
   2. 在 `shared/src/commonMain` 目錄的 `com.jetbrains.simplelogin.shared` 套件中建立 `Utils.kt` 檔案，並提供 `expect` 宣告：
   
       ```kotlin
       package com.jetbrains.simplelogin.shared
       
       expect fun randomUUID(): String
       ```
   
   3. 在 `shared/src/androidMain` 目錄的 `com.jetbrains.simplelogin.shared` 套件中建立 `Utils.android.kt` 檔案，並提供 Android 中 `randomUUID()` 的 `actual` 實作：
   
       ```kotlin
       package com.jetbrains.simplelogin.shared
       
       import java.util.*
      
       actual fun randomUUID() = UUID.randomUUID().toString()
       ```
   
   4. 在 `shared/src/iosMain` 目錄的 `com.jetbrains.simplelogin.shared` 目錄中建立 `Utils.ios.kt` 檔案，並提供 iOS 中 `randomUUID()` 的 `actual` 實作：
   
       ```kotlin
       package com.jetbrains.simplelogin.shared
       
       import platform.Foundation.NSUUID
      
       actual fun randomUUID(): String = NSUUID().UUIDString()
       ```
   
   5. 在 `shared/src/commonMain` 目錄的 `LoginDataSource.kt` 檔案中匯入 `randomUUID` 函式：
   
      ```kotlin
      import com.jetbrains.simplelogin.shared.randomUUID
      ```
   
現在，Kotlin 將為 Android 和 iOS 使用特定平台的 UUID 實作。

### 在 Android 上執行您的跨平台應用程式

執行 `app` 執行配置，以確保 Android 應用程式的運作與之前相同。

![Android 登入應用程式](android-login.png){width=300}

## 讓您的跨平台應用程式在 iOS 上運作

一旦您使 Android 應用程式具備跨平台能力，您就可以建立一個 iOS 應用程式並在其中重複使用共享的商業邏輯。

1. [在 Xcode 中建立 iOS 專案](#create-an-ios-project-in-xcode)
2. [設定 iOS 專案以使用 KMP 架構](#configure-the-ios-project-to-use-a-kmp-framework)
3. [在 Android Studio 中設定 iOS 運行配置](#set-up-an-ios-run-configuration-in-android-studio)
4. [在 iOS 專案中使用共享模組](#use-the-shared-module-in-the-ios-project)

### 在 Xcode 中建立 iOS 專案

1. 在 Xcode 中，點擊 **File** | **New** | **Project**。
2. 在對話方塊中，切換至 **iOS** 標籤：

   ![iOS 專案範本](ios-project-wizard-1.png){width=700}

3. 選取 **App** 範本，然後點擊 **Next**。

4. 產品名稱指定為 "simpleLoginIOS"，然後點擊 **Next**。

   ![iOS 專案設定](ios-project-wizard-2.png){width=700}

5. 選擇儲存跨平台應用程式的目錄作為專案位置，例如 `kmp-integration-sample`。

    在 Android Studio 中，您將得到以下結構：
    
    ![Android Studio 中的 iOS 專案](ios-project-in-as.png){width=194}

6. 為了與跨平台專案的其他頂層目錄保持一致，請關閉 Xcode 並將 `simpleLoginIOS` 目錄重新命名為 `iosApp`。

   > 如果在 Xcode 開啟時重新命名資料夾，您將收到警告並可能損壞專案。
   >
   {style="warning"}

   ![Android Studio 中重新命名後的 iOS 專案目錄](ios-directory-renamed-in-as.png){width=194}

### 設定 iOS 專案以使用 KMP 架構

您可以直接在 iOS 應用程式與 Kotlin Multiplatform 建置的架構（framework）之間設定整合。

> 此方法的替代方案（SwiftPM 和 CocoaPods）已在 [iOS 整合方法概覽](multiplatform-ios-integration-overview.md)中涵蓋。
> 
{style="note"}

1. 在 Android Studio 中，右鍵點擊 `iosApp/simpleLoginIOS.xcodeproj` 目錄，選取 **Open In** | **Open In Associated Application** 以在 Xcode 中開啟 iOS 專案。
2. 在 Xcode 中，點擊 **Project** 導航器中的專案名稱來開啟 iOS 專案設定。

3. 在左側的 **Targets** 區段中，選取 **simpleLoginIOS**，然後點擊 **Build Phases** 標籤。

4. 點擊 **+** 圖示並選取 **New Run Script Phase**。

    ![新增執行指令碼階段](xcode-run-script-phase-1.png){width=700}

5. 在執行指令碼欄位中貼上以下指令碼：

    ```bash
    if [ "YES" = "$OVERRIDE_KOTLIN_BUILD_IDE_SUPPORTED" ]; then
        echo "Skipping Gradle build task invocation due to OVERRIDE_KOTLIN_BUILD_IDE_SUPPORTED environment variable set to \"YES\""
        exit 0
    fi
    cd "$SRCROOT/.."
    ./gradlew :shared:embedAndSignAppleFrameworkForXcode
    ```

6. 停用 **Based on dependency analysis** 選項。
   這可確保 Xcode 在每次組建期間都執行該指令碼，並且不會在每次都發出缺少輸出相依性的警告。

   ![新增指令碼](xcode-run-script-phase-2.png){width=700}

7. 將 **Run Script** 階段向上移動，置於 **Compile Sources** 階段之前：

   ![移動 Run Script 階段](xcode-run-script-phase-3.png){width=700}

8. 在 **Build Settings** 標籤上，停用 **Build Options** 下的 **User Script Sandboxing** 選項：

   ![使用者指令碼沙盒化](disable-sandboxing-in-xcode-project-settings.png){width=700}

   > 如果您有不同於預設 `Debug` 或 `Release` 的自訂組建組態，請在 **Build Settings** 標籤上的 **User-Defined** 下新增 `KOTLIN_FRAMEWORK_BUILD_TYPE` 設定，並將其設定為 `Debug` 或 `Release`。
   >
   {style="note"}

9. 在 **Info** 標籤上，新增一個自訂的 `CADisableMinimumFrameDurationOnPhone` 屬性，並將其設定為 `YES` 以在 iOS 上啟用高重新整理率。

10. 在 **Signing & Capabilities** 標籤上，選取您的開發團隊，或者如果您尚未建立，請建立一個。這將允許對 KMP 模組產出的 `shared` 架構進行簽署。

    在這裡您還應確保 **Bundle Identifier** 設定為唯一值，否則 Xcode 可能會導致組建失敗。

11. 在 Xcode 中組建專案（主選單中的 **Product** | **Build**）。
    如果一切配置正確，專案應該組建成功 
    （您可以放心地忽略 "build phase will be run during every build" 警告）
   
    > 如果您在停用 **User Script Sandboxing** 選項之前組建了專案，組建可能會失敗：
    > Gradle 精靈程序（daemon）可能已被沙盒化，需要重新啟動。
    > 在組建專案之前，先在專案目錄（在我們的範例中為 `kmp-integration-sample`）中執行此指令以停止精靈程序：
    > 
    > ```shell
    > ./gradlew --stop
    > ```
    > 
    {style="note"}

### 在 Android Studio 中設定 iOS 運行配置

確保 Xcode 設定正確後，返回 Android Studio：

1. 在主選單中選取 **File | Sync Project with Gradle Files**。Android Studio 會自動產生一個名為 **simpleLoginIOS** 的運行配置。

   Android Studio 自動產生一個名為 **simpleLoginIOS** 的運行配置，並將 `iosApp` 目錄標記為連結的 Xcode 專案。

2. 在運行配置清單中，選取 **simpleLoginIOS**。
   選擇一個 iOS 模擬器，然後點擊 **Run** 以檢查 iOS 運行配置是否正常運作。

   ![運行配置清單中的 iOS 運行配置](ios-run-configuration-simplelogin.png)

### 在 iOS 專案中使用共享模組

`shared/build.gradle.kts` 檔案為每個 iOS 目標將 `binaries.framework.baseName` 屬性定義為 `sharedKit`。
這是 Kotlin Multiplatform 為 iOS 應用程式組建以供取用的架構名稱。

要測試整合，請在 Swift 程式碼中新增對通用程式碼的呼叫：

1. 在 Android Studio 中，開啟 `iosApp/simpleloginIOS/ContentView.swift` 檔案並匯入架構：

   ```swift
   import sharedKit
   ```

2. 為了檢查它是否已正確連接，請更新 `ContentView` 結構的程式碼，以使用來自 `shared` 模組的 `greet()` 函式：

   ```swift
   struct ContentView: View {
       var body: some View {
           Text(Greeting().greet())
           .padding()
       }
   }
   ```

3. 使用 Android Studio 的 iOS 運行配置執行應用程式以查看結果：

   ![來自共享模組的問候語](xcode-iphone-hello.png){width=300}

4. 再次更新 `ContentView.swift` 檔案中的程式碼，以使用共享模組中的商業邏輯來渲染應用程式 UI：

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

6. 再次執行 iOS 運行配置，確認 iOS 應用程式顯示了登入表單。
7. 輸入 "Jane" 作為使用者名稱，"password" 作為密碼。
8. 由於您[之前已設定整合](#configure-the-ios-project-to-use-a-kmp-framework)，iOS 應用程式會使用通用程式碼驗證輸入：

   ![簡單登入應用程式](xcode-iphone-login.png){width=300}

## 享受成果 – 僅需更新一次邏輯

現在您的應用程式已成為跨平台應用程式。您可以在 `shared` 模組中更新商業邏輯，並在 Android 和 iOS 上都能看到結果。

1. 更改使用者密碼的驗證邏輯："password" 不應該是一個有效的選項。
    為此，請更新 `LoginDataValidator` 類別的 `checkPassword()` 函式
    （要快速找到它，請按兩次 <shortcut>Shift</shortcut> 鍵，貼上類別名稱，然後切換到 **Classes** 標籤）：

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

2. 從 Android Studio 執行 iOS 和 Android 應用程式以查看變更
   （當您點擊紅色警告三角形時，會出現 iOS 錯誤訊息）：

   ![Android 和 iOS 應用程式密碼錯誤](android-iphone-password-error.png){width=600}

您可以查閱[本教學的最終程式碼](https://github.com/Kotlin/kmp-integration-sample/tree/final)。

## 還有什麼可以共享的？

您已經共享了應用程式的商業邏輯，但您也可以決定共享應用程式的其他層級。
例如，`ViewModel` 類別程式碼在 [Android](https://github.com/Kotlin/kmp-integration-sample/blob/final/app/src/main/java/com/jetbrains/simplelogin/androidapp/ui/login/LoginViewModel.kt)
和 [iOS 應用程式](https://github.com/Kotlin/kmp-integration-sample/blob/final/iosApp/SimpleLoginIOS/ContentView.swift#L84)中幾乎相同，
如果您的行動應用程式應該具有相同的展示層（presentation layer），您可以將其共享。

## 下一步是什麼？

一旦您使 Android 應用程式具備跨平台能力，您可以繼續進行：

* [新增對多平台程式庫的相依性](multiplatform-add-dependencies.md)
* [新增 Android 相依性](multiplatform-android-dependencies.md)
* [新增 iOS 相依性](multiplatform-ios-dependencies.md)

您可以使用 Compose Multiplatform 在所有平台建立統一的 UI：

* [了解 Compose Multiplatform 和 Jetpack Compose](compose-multiplatform-and-jetpack-compose.md)
* [探索 Compose Multiplatform 的可用資源](compose-multiplatform-resources.md)
* [建立一個具有共享邏輯和 UI 的應用程式](compose-multiplatform-create-first-app.md)

您也可以查看社群資源：

* [影片：如何將 Android 專案遷移到 Kotlin Multiplatform](https://www.youtube.com/watch?v=vb-Pt8SdfEE&t=1s)
* [影片：讓您的 Kotlin JVM 程式碼為 Kotlin Multiplatform 做好準備的 3 種方法](https://www.youtube.com/watch?v=X6ckI1JWjqo)