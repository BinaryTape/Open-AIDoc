[//]: # (title: 建議的 Kotlin Multiplatform 專案結構)
<show-structure for="chapter,procedure" depth="3"/>

透過[基本](multiplatform-discover-project.md)與[進階](multiplatform-advanced-project-structure.md)專案結構概念的總覽，你應該已經對原始碼集和相依性管理有了基本的認識。
那麼，組織這些原始碼集並仰賴這些相依性的模組又是如何運作的呢？

> 本文專門探討 KMP 專案。
> 如需通盤了解模組化決策的相關知識，請參閱 [Android 模組化簡介](https://developer.android.com/topic/modularization)。

## 最佳模組結構 {id="optimal-module-structure"}

最佳模組結構可能會依據你的目標以及必要的目標平台而有所不同。
你可以分析 KMP IDE 外掛程式精靈在不同配置與目標組合下的輸出，
以了解我們預設是如何組織專案的。

大致的方向可以概述如下：
* 應用程式的入口點應該包含在各自獨立的模組中，且每個模組都相依於必要的共用程式碼模組。
* 共用程式碼通常分為商業邏輯與 UI，採取的策略是避免不必要的相依性：
  * 如果 KMP 專案產生的所有應用程式都同時共用 UI 程式碼與商業邏輯，
    那麼為所有共用程式碼建立單一 `shared` 模組就足夠了。
  * 如果有任何一個應用程式的 UI 是使用原生程式碼撰寫的（例如你使用純 Swift 實作了 iOS UI），
    那麼將 UI 程式碼與商業邏輯分離是合理的做法，這樣可以避免在不需要的地方引入 Compose Multiplatform 相依性。
    因此你可以建立 `sharedLogic` 與 `sharedUI` 模組，並視需要將它們作為相依項新增至入口點模組中。
* 如果你的專案包含應與用戶端應用程式共用邏輯的伺服器程式碼，建議的組織方式如下：
  * 一個 `app` 資料夾，內含如上所述組織的入口點模組與用戶端通用程式碼模組。
  * 一個包含伺服器專屬程式碼的 `server` 模組。
  * 一個 `core` 模組，用於放置伺服器與用戶端之間共用的程式碼，例如模型和驗證邏輯。

如果你的專案採用的是較舊的結構，也就是應用程式入口點與共用程式碼都包含在單一模組中，
你可以按照以下指南將入口點擷取到獨立的模組中。

> 如果你打算使用 Android Gradle Plugin 9 或更新版本，則必須將 Android 應用程式入口點與通用程式碼分開。
> 詳細資訊請參閱我們的 [AGP 9 遷移文章](multiplatform-project-agp-9-migration.md)。
> 
{style="note"}

## 為應用程式入口點建立獨立模組 {id="creating-separate-modules-for-app-entry-points"}

我們用來展示轉換為建議結構的範例專案是一個較舊的 Compose Multiplatform 範例，
可以在範例存放庫的 [old-project-structure](https://github.com/kotlin-hands-on/get-started-with-cm/tree/old-project-structure) 分支中找到。

該範例包含一個單一 Gradle 模組（`composeApp`），其中包含所有共用程式碼和 KMP 入口點，
以及包含 iOS 專案程式碼和配置的 `iosApp` 資料夾。

若要將入口點擷取到其專屬的模組中，你需要建立新模組、移動程式碼，並相應地調整新模組和通用程式碼模組的配置。

### Android 應用程式入口點模組 {id="android-app"}

#### 建立並設定 Android 應用程式模組 {id="create-and-configure-the-android-app-module"}

建立 Android 應用程式模組（`androidApp`）：

1. 在專案根目錄下建立 `androidApp` 目錄。
2. 在該目錄內建立一個空的 `build.gradle.kts` 檔案以及 `src` 目錄。
3. 在 `settings.gradle.kts` 檔案結尾新增以下這行，將新模組新增至專案設定中：

    ```kotlin
    include(":androidApp")
    ```
4. 選取主功能表中的 **Build | Sync Project with Gradle Files**，或點擊編輯器中的 Gradle 重新整理按鈕。

#### 設定 Android 應用程式的建置指令碼 {id="configure-the-build-script-for-the-android-app"}

設定新模組的 Gradle 建置指令碼：

1. 在 `gradle/libs.versions.toml` 檔案中，將 Kotlin Android Gradle 外掛程式新增至版本目錄（version catalog）中：

    ```toml
    [plugins]
    kotlinAndroid = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
    ```

2. 在 `androidApp/build.gradle.kts` 檔案中，指定 Android 應用程式模組所需的外掛程式：

    ```kotlin
    plugins {
       alias(libs.plugins.kotlinAndroid)
       alias(libs.plugins.androidApplication)
       alias(libs.plugins.composeMultiplatform)
       alias(libs.plugins.composeCompiler)
    }
    ```

3. 確保這些外掛程式全部都在**根** `build.gradle.kts` 檔案中被宣告：

    ```kotlin
    plugins {
        alias(libs.plugins.kotlinAndroid) apply false
        alias(libs.plugins.androidApplication) apply false
        alias(libs.plugins.composeMultiplatform) apply false
        alias(libs.plugins.composeCompiler) apply false
        // ...
    }
    ```

4. 若要新增必要的相依性，請從 `composeApp` 建置指令碼的 `androidMain.dependencies {}` 區塊複製現有的相依項，並新增對 `composeApp` 模組本身的相依性。
   在此範例中，結果應如下所示：

   ```kotlin
   kotlin {
       dependencies { 
           implementation(projects.composeApp)
           implementation(libs.androidx.activity.compose)
           implementation(libs.compose.uiToolingPreview)
       }
   }
   ```

5. 將包含 Android 專屬配置的完整 `android {}` 區塊從 `composeApp/build.gradle.kts` 檔案複製到 `androidApp/build.gradle.kts` 檔案中。

6. 將編譯器選項從 `composeApp/build.gradle.kts` 檔案的 `androidTarget {}` 區塊複製到 `androidApp/build.gradle.kts` 檔案的 `target {}` 區塊中：

    ```kotlin
    kotlin {
        target {
            compilerOptions {
                jvmTarget.set(JvmTarget.JVM_11)
            }
        }
    }
    ```

   > 如果在 `composeApp` 建置指令碼中設定了任何其他外掛程式或屬性，
   > 請務必也將它們遷移至 `androidApp` 建置指令碼中。
   >
   {style="note"}

7. 將 `composeApp` 模組的配置從 Android 應用程式（application）更改為 Android 程式庫（library），
   因為它實質上已經轉變為後者。在 `composeApp/build.gradle.kts` 中：
   * 變更對 Gradle 外掛程式的參照：

       <compare type="top-bottom">
          <code-block lang="kotlin" code="              alias(libs.plugins.androidApplication)"/>
          <code-block lang="kotlin" code="              alias(libs.plugins.androidLibrary)"/>
       </compare>

    * 從 `android.defaultConfig {}` 區塊中移除應用程式屬性相關程式碼行：

      <compare type="top-bottom">
          <code-block lang="kotlin" code="              defaultConfig {&#10;                  applicationId = &quot;com.jetbrains.demo&quot;&#10;                  minSdk = libs.versions.android.minSdk.get().toInt()&#10;                  targetSdk = libs.versions.android.targetSdk.get().toInt()&#10;                  versionCode = 1&#10;                  versionName = &quot;1.0&quot;&#10;              }"/>
          <code-block lang="kotlin" code="              defaultConfig {&#10;                  minSdk = libs.versions.android.minSdk.get().toInt()&#10;              }"/>
       </compare>

8. 選取主功能表中的 **Build | Sync Project with Gradle Files**，或點擊編輯器中的 Gradle 重新整理按鈕。

#### 移動程式碼並執行 Android 應用程式 {id="move-the-code-and-run-the-android-app"}

1. 將 `composeApp/src/androidMain` 目錄移動到 `androidApp/src/` 目錄中，
   但請注意應保持跨平台的程式碼：

   * 入口點程式碼（如本範例中的 `MainActivity.kt`）必須位於 `androidApp` 模組中，才能正確建置 Android 應用程式。
   * 所有[預期與實際宣告 (expected and actual declarations)](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)
     都必須保留在通用模組（本範例中的 `composeApp`）的原始碼集中，以便供所有平台使用。
     當你設定好 `androidApp` 對 `composeApp` 的相依性後，這些宣告在入口點程式碼中也同樣可以使用。

2. 將 `androidApp/src/androidMain` 目錄重新命名為 `main`。
3. 如果一切配置正確，`androidApp/src/main/.../MainActivity.kt` 檔案中的匯入應能正常運作且程式碼能夠編譯。
4. 當你使用 IntelliJ IDEA 或 Android Studio 時，IDE 會辨識出新模組並自動建立新的运行配置：**androidApp**。
   如果沒有自動建立，請手動修改 **composeApp** Android 运行配置：
   1. 在运行配置下拉式功能表中，選取 **Edit Configurations**。
   2. 在 **Android** 類別下找到 **composeApp** 配置。
   3. 在 **General | Module** 欄位中，將 `demo.composeApp` 改為 `demo.androidApp`。
5. 啟動新的运行配置，確認應用程式如預期執行。
6. 如果一切運作正常，請在 `composeApp/build.gradle.kts` 檔案中移除 `kotlin.sourceSets.androidMain.dependencies {}` 區塊。

至此，你已經將 Android 入口點擷取到獨立的模組中。
現在更新通用程式碼模組，使其改用新的 Android-KMP 程式庫外掛程式。

### 桌面 JVM 應用程式 {id="desktop-jvm-app"}

#### 建立並設定桌面應用程式模組 {id="create-and-configure-the-desktop-app-module"}

建立桌面應用程式模組（`desktopApp`）：

1. 在專案根目錄下建立 `desktopApp` 目錄。
2. 在該目錄內建立一個空的 `build.gradle.kts` 檔案以及 `src` 目錄。
3. 在 `settings.gradle.kts` 檔案中加入這行程式碼，將新模組新增至專案設定：

    ```kotlin
    include(":desktopApp")
    ```

#### 設定桌面應用程式的建置指令碼 {id="configure-the-build-script-for-the-desktop-app"}

為了使桌面應用程式的建置指令碼正常運作：

1. 在 `gradle/libs.versions.toml` 檔案中，將 Kotlin JVM Gradle 外掛程式新增至版本目錄中：

    ```toml
    [plugins]
    kotlinJvm = { id = "org.jetbrains.kotlin.jvm", version.ref = "kotlin" }
    ```

2. 在 `desktopApp/build.gradle.kts` 檔案中，指定共用 UI 模組所需的外掛程式：

    ```kotlin
    plugins {
       alias(libs.plugins.kotlinJvm)
       alias(libs.plugins.composeMultiplatform)
       alias(libs.plugins.composeCompiler)
    }
    ```

3. 確保這些外掛程式全部都在**根** `build.gradle.kts` 檔案中被宣告：

    ```kotlin
    plugins {
        alias(libs.plugins.kotlinJvm) apply false
        alias(libs.plugins.composeMultiplatform) apply false
        alias(libs.plugins.composeCompiler) apply false
        // ...
    }
    ```

4. 若要新增對其他模組的必要相依性，請從 `composeApp` 建置指令碼的
   `commonMain.dependencies {}` 與 `jvmMain.dependencies {}` 區塊複製現有的相依項。在此範例中，最終結果應如下所示：

   ```kotlin
   kotlin {
       dependencies { 
           implementation(projects.sharedLogic)
           implementation(projects.sharedUI)
           implementation(compose.desktop.currentOs)
           implementation(libs.kotlinx.coroutinesSwing)
       }
   }
   ```

5. 將包含桌面專屬配置的 `compose.desktop {}` 區塊從 `composeApp/build.gradle.kts` 檔案複製到 `desktopApp/build.gradle.kts` 檔案中：

    ```kotlin
    compose.desktop {
        application {
            mainClass = "compose.project.demo.MainKt"

            nativeDistributions {
                targetFormats(TargetFormat.Dmg, TargetFormat.Msi, TargetFormat.Deb)
                packageName = "compose.project.demo"
                packageVersion = "1.0.0"
            }
        }
    }
    ```
6. 選取主功能表中的 **Build | Sync Project with Gradle Files**，或點擊編輯器中的 Gradle 重新整理按鈕。

#### 移動程式碼並執行桌面應用程式 {id="move-the-code-and-run-the-desktop-app"}

完成配置後，將桌面應用程式的程式碼移動到新目錄中：

1. 在 `desktopApp/src` 目錄下建立一個新的 `main` 目錄。
2. 將 `composeApp/src/jvmMain/kotlin` 目錄移動到 `desktopApp/src/main/` 目錄中：
   套件座標必須與 `compose.desktop {}` 配置保持一致，這點非常重要。
3. 如果一切配置正確，`desktopApp/src/main/.../main.kt` 檔案中的匯入應能正常運作且程式碼能夠編譯。
4. 若要執行桌面應用程式，請修改 **composeApp [jvm]** 运行配置：
   1. 在运行配置下拉式功能表中，選取 **Edit Configurations**。
   2. 在 **Gradle** 類別下找到 **composeApp [jvm]** 配置。
   3. 在 **Gradle project** 欄位中，將 `ComposeDemo:composeApp` 改為 `ComposeDemo:desktopApp`。
5. 啟動更新後的配置，確認應用程式如預期執行。
6. 如果一切運作正常：
   * 刪除 `composeApp/src/jvmMain` 目錄。
   * 在 `composeApp/build.gradle.kts` 檔案中移除桌面相關程式碼：
       * `compose.desktop {}` 區塊，
       * Kotlin `sourceSets {}` 區塊內的 `jvmMain.dependencies {}` 區塊，
       * `kotlin {}` 區塊內的 `jvm()` 目標宣告。

### Web 應用程式 {id="web-app"}

#### 建立並設定 Web 應用程式模組 {id="create-and-configure-the-web-app-module"}

建立 Web 應用程式模組（`webApp`）：

1. 在專案根目錄下建立 `webApp` 目錄。
2. 在該目錄內建立一個空的 `build.gradle.kts` 檔案以及 `src` 目錄。
3. 在 `settings.gradle.kts` 檔案結尾加入這行程式碼，將新模組新增至專案設定：

    ```kotlin
    include(":webApp")
    ```

#### 設定 Web 應用程式的建置指令碼 {id="configure-the-build-script-for-the-web-app"}

為了使 Web 應用程式建置指令碼正常運作：

1. 在 `webApp/build.gradle.kts` 檔案中，指定共用 UI 模組所需的外掛程式：

        ```kotlin
        plugins {
           alias(libs.plugins.kotlinMultiplatform)
           alias(libs.plugins.composeMultiplatform)
           alias(libs.plugins.composeCompiler)
        }
        ```

2. 確保這些外掛程式全部都在**根** `build.gradle.kts` 檔案中被宣告：

    ```kotlin
    plugins {
        alias(libs.plugins.kotlinMultiplatform) apply false
        alias(libs.plugins.composeMultiplatform) apply false
        alias(libs.plugins.composeCompiler) apply false
        // ...
    }
    ```

3. 將 JavaScript 和 Wasm 目標宣告從 `composeApp/build.gradle.kts` 檔案複製到 `webApp/build.gradle.kts` 檔案中的 `kotlin {}` 區塊：

    ```kotlin
    kotlin {
        js {
            browser()
            binaries.executable()
        }

        @OptIn(ExperimentalWasmDsl::class)
        wasmJs {
            browser()
            binaries.executable()
        }
    }
    ```

4. 新增對其他模組的必要相依性：

   ```kotlin
   kotlin {
       sourceSets {
           commonMain.dependencies { 
               implementation(projects.sharedLogic)
               // 提供必要的入口點 API
               implementation(compose.ui)
           }
       }
   }
   ```

5. 選取主功能表中的 **Build | Sync Project with Gradle Files**，或點擊編輯器中的 Gradle 重新整理按鈕。

#### 移動程式碼並執行 Web 應用程式 {id="move-the-code-and-run-the-web-app"}

完成配置後，將 Web 應用程式的程式碼移動到新目錄中：

1. 將整個 `composeApp/src/webMain` 目錄移動到 `webApp/src` 目錄中。
   如果一切配置正確，`webApp/src/webMain/.../main.kt` 檔案中的匯入應能正常運作且程式碼能夠編譯。
2. 在 `webApp/src/webMain/resources/index.html` 檔案中更新指令碼名稱：從 `composeApp.js` 改為 `webApp.js`。
3. 若要執行 Web 應用程式，請修改 **composeApp [wasmJs]** 运行配置：
    1. 在运行配置下拉式功能表中，選取 **Edit Configurations**。
    2. 在 **Gradle** 類別下找到 **composeApp [wasmJs]** 配置。
    3. 在 **Gradle project** 欄位中，將 `ComposeDemo:composeApp` 改為 `ComposeDemo:webApp`。
4. 針對 **composeApp [js]** 重複上述步驟，以便也能執行 JavaScript 版本。
5. 啟動这些运行配置，確認應用程式如預期執行。
6. 如果一切運作正常：
    * 刪除 `composeApp/src/webMain` 目錄。
    * 在 `composeApp/build.gradle.kts` 檔案中移除 Web 相關程式碼：
        * Kotlin `sourceSets {}` 區塊內的 `webMain.dependencies {}` 區塊，
        * `kotlin {}` 區塊內的 `js {}` 和 `wasmJs {}` 目標宣告。

### 設定共用模組 {id="configure-the-shared-module"}

在範例應用程式中，UI 和商業邏輯程式碼都是共用的，因此只需要一個單一共用模組即可存放所有通用程式碼：你可以直接將 `composeApp` 改作通用程式碼模組之用。

[//]: # (TODO For an overview of other project configurations and ways of dealing with them, see our blogpost about the new recommended project structure [link])

在 Gradle 配置中，唯一與入口點模組連線無關但需要調整的項目，就是新的 Android Library Gradle 外掛程式。
這個新外掛程式專為多平台專案打造，並且是使用 AGP 9 及更新版本的必要條件。

以下是必要的變更：

1. 在 `gradle/libs.versions.toml` 中，
   將 Android-KMP 程式庫外掛程式新增至你的版本目錄中：

    ```toml
    [plugins]
    androidMultiplatformLibrary = { id = "com.android.kotlin.multiplatform.library", version.ref = "agp" }
    ```

2. 在 `composeApp/build.gradle.kts` 檔案中，新增共用 UI 模組所需的外掛程式：

    ```kotlin
    plugins {
       alias(libs.plugins.kotlinMultiplatform)
       alias(libs.plugins.androidMultiplatformLibrary)
       alias(libs.plugins.composeMultiplatform)
       alias(libs.plugins.composeCompiler)
    }
    ```
3. 在根目錄的 `build.gradle.kts` 檔案中新增以下這行，以避免套用外掛程式時產生衝突：

    ```kotlin
    alias(libs.plugins.androidMultiplatformLibrary) apply false
    ```
4. 在 `composeApp/build.gradle.kts` 檔案中，將 `kotlin.androidTarget {}` 區塊替換為 `kotlin.androidLibrary {}` 區塊：

    ```kotlin
    androidLibrary {
        namespace = "compose.project.demo.composedemo"
        compileSdk = libs.versions.android.compileSdk.get().toInt()
    
        compilerOptions {
            jvmTarget = JvmTarget.JVM_11
        }
    
        androidResources {
            enable = true
        }
    }
    ```
5. 從 `composeApp/build.gradle.kts` 檔案中移除根層級的 `android {}` 區塊。
6. 由於所有程式碼已移動到應用程式模組，請移除 `androidMain` 相依項：
   刪除 `kotlin.sourceSets.androidMain.dependencies {}` 區塊。
7. 檢查 Android 應用程式是否如預期執行。

### (可選) 分離共用邏輯與共用 UI {collapsible="true" id="optional-separate-shared-logic-and-shared-ui"}

如果專案中的某些目標實作了原生 UI，將通用程式碼拆分為 `sharedLogic` 和 `sharedUI` 模組可能是個好主意，這樣使用原生 UI 的應用程式模組在使用共用程式碼時就不需要相依於 Compose Multiplatform。

以下以相同的範例應用程式為基礎，說明如何著手進行：

#### 建立共用邏輯模組 {id="create-a-shared-logic-module"}

在實際建立模組之前，你需要決定什麼是商業邏輯，即哪些程式碼同時與 UI 和平台無關。
在此範例中，唯一的候選對象是 `currentTimeAt()` 函式，它會針對特定地點與時區傳回確切時間。
相比之下，`Country` 資料類別仰賴 Compose Multiplatform 的 `DrawableResource`，無法與 UI 程式碼分離。

> 如果你的專案已經包含一個 `shared` 模組（例如因為你並未共用所有 UI 程式碼），
> 那麼你可以直接使用該模組，而不需要建立 `sharedLogic`。
> 你也可以考慮將其重新命名，以便更清晰地區分共用邏輯與 UI。
> 
{style="note"}

將相應程式碼隔離到 `sharedLogic` 模組中：

1. 在專案根目錄下建立 `sharedLogic` 目錄。
2. 在該目錄內建立一個空的 `build.gradle.kts` 檔案以及 `src` 目錄。
3. 在 `settings.gradle.kts` 結尾加入這行程式碼，將新模組新增至檔案中：

    ```kotlin
    include(":sharedLogic")
    ```
4. 設定新模組的 Gradle 建置指令碼。

    1. 在 `gradle/libs.versions.toml` 檔案中，將 Android-KMP 程式庫外掛程式新增至版本目錄中：

        ```toml
        [plugins]
        androidMultiplatformLibrary = { id = "com.android.kotlin.multiplatform.library", version.ref = "agp" }
        ```

    2. 在 `sharedLogic/build.gradle.kts` 檔案中，指定共用邏輯模組所需的外掛程式：

       ```kotlin
       plugins {
           alias(libs.plugins.kotlinMultiplatform)
           alias(libs.plugins.androidMultiplatformLibrary)
       }
       ```
    3. 確保這些外掛程式在**根** `build.gradle.kts` 檔案中被宣告：

       ```kotlin
       plugins {
         alias(libs.plugins.androidMultiplatformLibrary) apply false
         alias(libs.plugins.kotlinMultiplatform) apply false
         // ...
       }
       ```
    4. 在 `sharedLogic/build.gradle.kts` 檔案中，指定通用模組在此範例中應支援的目標：

        ```kotlin
        kotlin {
            // 不需要 iOS framework 配置，因為 sharedLogic
            // 不會匯出為 framework，只有 'sharedUI' 會。
            iosArm64()
            iosSimulatorArm64()
     
            jvm()
     
            js {
                browser()
            }
     
            @OptIn(ExperimentalWasmDsl::class)
            wasmJs {
                browser()
            }
        }
        ```
    5. 針對 Android，在 `kotlin {}` 區塊中新增 `androidLibrary {}` 配置，以取代 `androidTarget {}` 區塊：

        ```kotlin
        kotlin {
            // ...
            androidLibrary {
                namespace = "com.jetbrains.greeting.demo.sharedLogic"
                compileSdk = libs.versions.android.compileSdk.get().toInt()
                minSdk = libs.versions.android.minSdk.get().toInt()
        
                compilerOptions {
                    jvmTarget = JvmTarget.JVM_11
                }
            }
        }
        ```
    6. 按照在 `composeApp` 中宣告的方式，為通用與 JavaScript 原始碼集新增必要的時間相依性：

        ```kotlin
        kotlin {
            sourceSets {
                commonMain.dependencies {
                    implementation("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%")
                }
                webMain.dependencies {
                    implementation(npm("@js-joda/timezone", "%js-joda-timezone%"))
                }
            }
        }
        ```
    7. 選取主功能表中的 **Build | Sync Project with Gradle Files**，或點擊編輯器中的 Gradle 重新整理按鈕。

5. 移動一開始識別出的商業邏輯程式碼：
    1. 在 `sharedLogic/src` 內建立 `commonMain/kotlin` 目錄。
    2. 在 `commonMain/kotlin` 內建立 `CurrentTime.kt` 檔案。
    3. 將 `currentTimeAt` 函式從原始的 `App.kt` 移動到 `CurrentTime.kt`。
6. 使函式在其新位置上可供 `App()` composable 使用。
   為此，請在 `composeApp/build.gradle.kts` 檔案中宣告 `composeApp` 與 `sharedLogic` 之間的相依性：

    ```kotlin
    commonMain.dependencies {
        implementation(projects.sharedLogic)
    }
    ```
7. 再次執行 **Build | Sync Project with Gradle Files** 以套用變更。
8. 在 `composeApp/commonMain/.../App.kt` 檔案中，匯入 `currentTimeAt()` 函式以修復程式碼。
9. 執行應用程式，確認你的新模組運作正常。

你已成功將共用邏輯隔離到獨立的模組中，並以跨平台方式使用它。
下一步：建立共用 UI 模組。

#### 建立共用 UI 模組 {id="create-a-shared-ui-module"}

將實作通用 UI 元素的共用程式碼擷取至 `sharedUI` 模組：

1. 在專案根目錄下建立 `sharedUI` 目錄。
2. 在該目錄內建立一個空的 `build.gradle.kts` 檔案以及 `src` 目錄。
3. 在 `settings.gradle.kts` 結尾加入這行程式碼，將新模組新增至檔案中：

    ```kotlin
    include(":sharedUI")
    ```
4. 設定新模組的 Gradle 建置指令碼：

    1. 如果你在設定 `sharedLogic` 模組時尚未進行此步驟，請在 `gradle/libs.versions.toml` 中將 Android-KMP 程式庫外掛程式新增至版本目錄中：

        ```toml
        [plugins]
        androidMultiplatformLibrary = { id = "com.android.kotlin.multiplatform.library", version.ref = "agp" }
        ```

    2. 在 `sharedUI/build.gradle.kts` 檔案中，指定共用 UI 模組所需的外掛程式：

        ```kotlin
        plugins {
           alias(libs.plugins.kotlinMultiplatform)
           alias(libs.plugins.androidMultiplatformLibrary)
           alias(libs.plugins.composeMultiplatform)
           alias(libs.plugins.composeCompiler)
        }
        ```

    3. 確保這些外掛程式全部都在**根** `build.gradle.kts` 檔案中被宣告：

        ```kotlin
        plugins {
            alias(libs.plugins.androidMultiplatformLibrary) apply false
            alias(libs.plugins.composeMultiplatform) apply false
            alias(libs.plugins.composeCompiler) apply false
            alias(libs.plugins.kotlinMultiplatform) apply false
            // ...
        }
        ```

    4. 在 `kotlin {}` 區塊中，指定共用 UI 模組在此範例中應支援的目標：

        ```kotlin
        kotlin {
            listOf(
                iosArm64(),
                iosSimulatorArm64()
            ).forEach { iosTarget ->
                iosTarget.binaries.framework {
                    // 這是你將在 Swift 程式碼中
                    // 匯入的 iOS framework 名稱。
                    baseName = "sharedUI"
                    isStatic = true
                }
            }
     
            jvm()
     
            js {
                browser()
                binaries.executable()
            }
     
            @OptIn(ExperimentalWasmDsl::class)
            wasmJs {
                browser()
                binaries.executable()
            }
        }
        ```

    5. 針對 Android，在 `kotlin {}` 區塊中新增 `androidLibrary {}` 配置，以取代 `androidTarget {}` 區塊：

        ```kotlin
        kotlin {
            // ...
            androidLibrary {
                namespace = "com.jetbrains.greeting.demo.sharedUI"
                compileSdk = libs.versions.android.compileSdk.get().toInt()
                minSdk = libs.versions.android.minSdk.get().toInt()
         
                compilerOptions {
                    jvmTarget = JvmTarget.JVM_11
                }
       
                // 允許在 Android 應用程式中使用 Compose Multiplatform 資源
                androidResources {
                    enable = true
                }
            }
        }
        ```

    6. 按照在 `composeApp` 中宣告的方式，為共用 UI 新增必要的相依性：

       ```kotlin
       kotlin {
           sourceSets {
               commonMain.dependencies { 
                   implementation(projects.sharedLogic)
                   implementation(compose.runtime)
                   implementation(compose.foundation)
                   implementation(compose.material3)
                   implementation(compose.ui)
                   implementation(compose.components.resources)
                   implementation(compose.components.uiToolingPreview)
                   implementation(libs.androidx.lifecycle.viewmodelCompose)
                   implementation(libs.androidx.lifecycle.runtimeCompose)
                   implementation("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%")
               }
           }
       }
       ```
    7. 選取主功能表中的 **Build | Sync Project with Gradle Files**，或點擊編輯器中的 Gradle 重新整理按鈕。
5. 在 `sharedUI/src` 內建立一個新的 `commonMain/kotlin` 目錄。
6. 將資源檔案移動到 `sharedUI` 模組：將整個 `composeApp/commonMain/composeResources` 目錄重新放置到 `sharedUI/commonMain/composeResources`。
7. 在 `sharedUI/src/commonMain/kotlin` 目錄中建立一個新的 `App.kt` 檔案。
8. 將原始 `composeApp/src/commonMain/.../App.kt` 的全部內容複製到新的 `App.kt` 檔案中。
9. 暫時將舊 `App.kt` 檔案中的所有程式碼註解掉。
   這樣你就可以在完全移除舊程式碼之前，先測試共用 UI 模組是否能正常運作。
10. 除了位於不同套件的資源匯入之外，新的 `App.kt` 檔案應該都能如預期運作。
    使用正確的路徑重新匯入 `Res` 物件及所有可繪製資源（drawable resources），例如：

    <compare type="top-bottom">
    <code-block lang="kotlin" code="        import demo.composeapp.generated.resources.mx"/>
    <code-block lang="kotlin" code="        import demo.sharedui.generated.resources.mx"/>
    </compare>
11. 若要使新的 `App()` composable 可供仰賴它的應用程式模組入口點使用，
    請在對應的 `build.gradle.kts` 檔案中新增相依性：

    ```kotlin
    kotlin {
        sourceSets {
            commonMain.dependencies {
                implementation(projects.sharedUI)
                // ...
            }
        }
    }
    ```
12. 執行你的應用程式，確認新模組能正常運作並為應用程式入口點提供共用 UI 程式碼。
13. 刪除 `composeApp/src/commonMain/.../App.kt` 檔案。

你已成功將跨平台 UI 程式碼移動至專用模組中。

### 更新 iOS 整合 {id="update-the-ios-integration"}

由於 iOS 應用程式入口點並非建置為獨立的 Gradle 模組，因此你可以將原始碼嵌入到任何模組中。
在此範例中，你可以將其保留在 `shared` 內部：

1. 將 `composeApp/src/iosMain` 目錄移動到 `shared/src` 目錄中。
2. 設定 Xcode 專案以取用由 `shared` 模組產生的 framework：
    1. 選取功能表項目 **File | Open Project in Xcode**。
    2. 在 **Project navigator** 工具視窗中點擊 **iosApp** 專案，然後選取 **Build Phases** 索引標籤。
    3. 找到 **Compile Kotlin Framework** 階段。
    4. 找到以 `./gradlew` 開頭的該行，並將 `composeApp` 替換為 `sharedUi`：

        ```text
        ./gradlew :shared:embedAndSignAppleFrameworkForXcode
        ```
   
    5. 請注意，`ContentView.swift` 檔案中的匯入必須保持不變，因為它符合 iOS 目標 Gradle 配置中的 `baseName` 參數，
       而非模組的實際名稱。
       如果你在 `shared/build.gradle.kts` 檔案中變更了 framework 名稱，則需要相應地變更匯入指示詞。

3. 從 Xcode 執行應用程式，或使用 IntelliJ IDEA 中的 **iosApp** 运行配置執行

<!-- ## What's next -->