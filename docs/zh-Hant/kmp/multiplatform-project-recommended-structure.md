[//]: # (title: 建議的 Kotlin Multiplatform 專案結構)
<show-structure for="chapter,procedure" depth="3"/>

[基本](multiplatform-discover-project.md) 與 [進階](multiplatform-advanced-project-structure.md) 專案結構概念的總覽應能讓您了解原始碼集與相依性管理。
那麼負責組織原始碼集並依賴相依性的模組呢？

> 本文專門探討 KMP 專案。
> 如需了解模組化決策的通盤理解，請參閱 [Android 模組化簡介](https://developer.android.com/topic/modularization)。

## 最佳模組結構

最佳模組結構可能會根據您的目標和必要的目標 (target) 而有所不同。
您可以分析 KMP IDE 外掛程式精靈在不同配置與目標設定下的輸出來了解我們預設如何組織專案。

一般方法可概述如下：
* 應用程式的入口點應包含在獨立的模組中，每個入口點模組都依賴於必要的共用程式碼模組。
* 共用程式碼通常分為商務邏輯與 UI，策略是避免不必要的相依性：
  * 如果 KMP 專案產生的所有應用程式都使用共用 UI 程式碼以及共用商務邏輯，則單個用於所有共用程式碼的 `shared` 模組就足夠了。
  * 如果任何一個應用程式的 UI 是使用原生程式碼編寫的（例如，您使用純 Swift 實作了 iOS UI），則將 UI 程式碼與商務邏輯分開是有意義的，以避免在不需要的地方產生 Compose Multiplatform 相依性。
    因此，您可以擁有 `sharedLogic` 和 `sharedUI` 模組，並根據需要將它們作為相依性新增到入口點模組中。
* If 您的專案包含應與用戶端應用程式共用邏輯的伺服器程式碼，建議的結構方式為：
  * 一個 `app` 資料夾，包含上述組織的入口點模組和用戶端通用的程式碼模組。
  * 一個包含伺服器特定程式碼的 `server` 模組。
  * 一個用於伺服器與用戶端之間共用程式碼（例如模型與驗證）的 `core` 模組。

如果您的專案使用舊版結構，即應用程式入口點與共用程式碼包含在單個模組中，您可以按照以下指南將入口點提取到獨立的模組中。

> 如果您打算使用 Android Gradle 外掛程式 9 或更新版本，則必須將 Android 應用程式入口點與通用程式碼分開。
> 詳情請參閱我們的 [AGP 9 遷移文章](multiplatform-project-agp-9-migration.md)。
> 
{style="note"}

## 為應用程式入口點建立獨立模組

我們用來說明轉換至建議結構的範例專案是一個較舊的 Compose Multiplatform 範例，可以在範例存儲庫的 [old-project-structure](https://github.com/kotlin-hands-on/get-started-with-cm/tree/old-project-structure) 分支中找到。

該範例由單個 Gradle 模組 (`composeApp`) 組成，其中包含所有共用程式碼和 KMP 入口點，以及包含 iOS 專案程式碼與配置的 `iosApp` 資料夾。

要將入口點提取到其專屬模組，您需要建立模組、移動程式碼，並相應地調整新模組和通用程式碼模組的配置。

未定義

### 桌面 JVM 應用程式

#### 建立並配置桌面應用程式模組

要建立桌面應用程式模組 (`desktopApp`)：

1. 在專案根目錄建立 `desktopApp` 目錄。
2. 在該目錄內，建立一個空的 `build.gradle.kts` 檔案和 `src` 目錄。
3. 透過在 `settings.gradle.kts` 檔案中新增以下行，將新模組新增至專案設定：

    ```kotlin
    include(":desktopApp")
    ```

#### 為桌面應用程式配置建置指令碼

要使桌面應用程式建置指令碼正常運作：

1. 在 `gradle/libs.versions.toml` 檔案中，將 Kotlin JVM Gradle 外掛程式新增至您的版本目錄 (version catalog)：

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

3. 確保所有這些外掛程式都在 **根** `build.gradle.kts` 檔案中提到：

    ```kotlin
    plugins {
        alias(libs.plugins.kotlinJvm) apply false
        alias(libs.plugins.composeMultiplatform) apply false
        alias(libs.plugins.composeCompiler) apply false
        // ...
    }
    ```

4. 要新增對其他模組的必要相依性，請從 `composeApp` 建置指令碼的 `commonMain.dependencies {}` 和 `jvmMain.dependencies {}` 區塊中複製現有的相依性。在本範例中，最終結果應如下所示：

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

5. 將包含桌面特定配置的 `compose.desktop {}` 區塊從 `composeApp/build.gradle.kts` 檔案複製到 `desktopApp/build.gradle.kts` 檔案：

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
6. 在主功能表中選擇 **Build | Sync Project with Gradle Files**，或點擊編輯器中的 Gradle 重新整理按鈕。

#### 移動程式碼並執行桌面應用程式

配置完成後，將桌面應用程式的程式碼移動到新目錄：

1. 在 `desktopApp/src` 目錄中，建立一個新的 `main` 目錄。
2. 將 `composeApp/src/jvmMain/kotlin` 目錄移動到 `desktopApp/src/main/` 目錄中：
   套件座標與 `compose.desktop {}` 配置保持一致非常重要。
3. 如果一切配置正確，`desktopApp/src/main/.../main.kt` 檔案中的匯入將正常運作，且程式碼可以編譯。
4. 要執行您的桌面應用程式，請修改 **composeApp [jvm]** 运行配置：
   1. 在运行配置下拉清單中，選擇 **Edit Configurations**。
   2. 在 **Gradle** 類別中找到 **composeApp [jvm]** 配置。
   3. 在 **Gradle project** 欄位中，將 `ComposeDemo:composeApp` 更改為 `ComposeDemo:desktopApp`。
5. 啟動更新後的配置以確保應用程式按預期執行。
6. 如果一切運作正常：
   * 刪除 `composeApp/src/jvmMain` 目錄。
   * 在 `composeApp/build.gradle.kts` 檔案中，移除與桌面相關的程式碼：
       * `compose.desktop {}` 區塊，
       * Kotlin `sourceSets {}` 區塊內的 `jvmMain.dependencies {}` 區塊，
       * `kotlin {}` 區塊內的 `jvm()` 目標宣告。

### Web 應用程式

#### 建立並配置 Web 應用程式模組

要建立桌面應用程式模組 (`webApp`)：

1. 在專案根目錄建立 `webApp` 目錄。
2. 在該目錄內，建立一個空的 `build.gradle.kts` 檔案和 `src` 目錄。
3. 透過在檔案末尾新增以下行，將新模組新增至專案設定的 `settings.gradle.kts` 檔案中：

    ```kotlin
    include(":webApp")
    ```

#### 為 Web 應用程式配置建置指令碼

要使桌面應用程式建置指令碼正常運作：

1. 在 `webApp/build.gradle.kts` 檔案中，指定共用 UI 模組所需的外掛程式：

        ```kotlin
        plugins {
           alias(libs.plugins.kotlinMultiplatform)
           alias(libs.plugins.composeMultiplatform)
           alias(libs.plugins.composeCompiler)
        }
        ```

2. 確保所有這些外掛程式都在 **根** `build.gradle.kts` 檔案中提到：

    ```kotlin
    plugins {
        alias(libs.plugins.kotlinMultiplatform) apply false
        alias(libs.plugins.composeMultiplatform) apply false
        alias(libs.plugins.composeCompiler) apply false
        // ...
    }
    ```

3. 將 JavaScript 和 Wasm 目標宣告從 `composeApp/build.gradle.kts` 檔案複製到 `webApp/build.gradle.kts` 檔案的 `kotlin {}` 區塊中：

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

5. 在主功能表中選擇 **Build | Sync Project with Gradle Files**，或點擊編輯器中的 Gradle 重新整理按鈕。

#### 移動程式碼並執行 Web 應用程式

配置完成後，將 Web 應用程式的程式碼移動到新目錄：

1. 將整個 `composeApp/src/webMain` 目錄移動到 `webApp/src` 目錄中。
   如果一切配置正確，`webApp/src/webMain/.../main.kt` 檔案中的匯入將正常運作，且程式碼可以編譯。
2. 在 `webApp/src/webMain/resources/index.html` 檔案中更新指令碼名稱：從 `composeApp.js` 更改為 `webApp.js`。
3. 要執行您的 Web 應用程式，請修改 **composeApp [wasmJs]** 运行配置：
    1. 在运行配置下拉清單中，選擇 **Edit Configurations**。
    2. 在 **Gradle** 類別中找到 **composeApp [wasmJs]** 配置。
    3. 在 **Gradle project** 欄位中，將 `ComposeDemo:composeApp` 更改為 `ComposeDemo:webApp`。
4. 對 **composeApp [js]** 重複上述步驟，以便也能執行 JavaScript 版本。
5. 啟動运行配置以確保應用程式按預期執行。
6. 如果一切運作正常：
    * 刪除 `composeApp/src/webMain` 目錄。
    * 在 `composeApp/build.gradle.kts` 檔案中，移除與 Web 相關的程式碼：
        * Kotlin `sourceSets {}` 區塊內的 `webMain.dependencies {}` 區塊，
        * `kotlin {}` 區塊內的 `js {}` 和 `wasmJs {}` 目標宣告。

### 配置共用模組

在範例應用程式中，UI 和商務邏輯程式碼都在共用，因此它只需要一個共用模組來存放所有通用程式碼：您可以簡單地將 `composeApp` 重新調整為通用程式碼模組。

[//]: # (TODO For an overview of other project configurations and ways of dealing with them, see our blogpost about the new recommended project structure [link])

在 Gradle 配置中，唯一需要調整且與入口點模組連接無關的部分是新的 Android 程式庫 Gradle 外掛程式。
這個新外掛程式專為多平台專案建置，且是使用 AGP 9 及更新版本的必要條件。

以下是必要的更改：

1. 在 `gradle/libs.versions.toml` 中，將 Android-KMP 程式庫外掛程式新增至您的版本目錄 (version catalog)：

    ```toml
    [plugins]
    androidMultiplatformLibrary = { id = "com.android.kotlin.multiplatform.library", version.ref = "agp" }
    ```

2. 在 `composeApp/build.gradle.kts` 檔案中，為共用 UI 模組新增必要的外掛程式：

    ```kotlin
    plugins {
       alias(libs.plugins.kotlinMultiplatform)
       alias(libs.plugins.androidMultiplatformLibrary)
       alias(libs.plugins.composeMultiplatform)
       alias(libs.plugins.composeCompiler)
    }
    ```
3. 在根目錄的 `build.gradle.kts` 檔案中，新增以下行以避免套用外掛程式時發生衝突：

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
5. 從 `composeApp/build.gradle.kts` 檔案中移除根目錄的 `android {}` 區塊。
6. 移除 `androidMain` 相依性，因為所有程式碼都已移動到應用程式模組：
   刪除 `kotlin.sourceSets.androidMain.dependencies {}` 區塊。
7. 檢查 Android 應用程式是否按預期執行。

### （選用）分離共用邏輯與共用 UI {collapsible="true"}

如果專案中的某些目標實作了原生 UI，則將通用程式碼分離為 `sharedLogic` 和 `sharedUI` 模組可能是個好主意，這樣具有原生 UI 的應用程式模組就不需要依賴 Compose Multiplatform 即可使用共用程式碼。

以下是您可以參考的範例，同樣基於同一個範例應用程式。

#### 建立共用邏輯模組

在實際建立模組之前，您需要決定什麼是商務邏輯，哪些程式碼同時具備 UI 無關性和平台無關性。
在此範例中，唯一的候選對象是 `currentTimeAt()` 函式，它會根據位置和時區組合傳回確切時間。
相比之下，`Country` 資料類別依賴於來自 Compose Multiplatform 的 `DrawableResource`，無法與 UI 程式碼分離。

> 如果您的專案已經有一個 `shared` 模組（例如，因為您沒有共用所有 UI 程式碼），
> 那麼您可以使用此模組代替 `sharedLogic`。
> 將其重新命名以更清晰地區分共用邏輯與 UI 也是不錯的選擇。
> 
{style="note"}

將對應的程式碼隔離在 `sharedLogic` 模組中：

1. 在專案根目錄建立 `sharedLogic` 目錄。
2. 在該目錄內，建立一個空的 `build.gradle.kts` 檔案和 `src` 目錄。
3. 透過在檔案末尾新增以下行，將新模組新增至 `settings.gradle.kts`：

    ```kotlin
    include(":sharedLogic")
    ```
4. 為新模組配置 Gradle 建置指令碼。

    1. 在 `gradle/libs.versions.toml` 檔案中，將 Android-KMP 程式庫外掛程式新增至您的版本目錄：

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
    3. 確保在 **根** `build.gradle.kts` 檔案中提到這些外掛程式：

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
            // 不需要 iOS 架構配置，因為 sharedLogic 
            // 不會被匯出為架構，只有 'sharedUI' 會。
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
    5. 對於 Android，將 `androidLibrary {}` 配置新增到 `kotlin {}` 區塊中，而非使用 `androidTarget {}` 區塊：

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
    6. 為通用與 JavaScript 原始碼集新增必要的時區相依性，方式與在 `composeApp` 中的宣告相同：

        ```kotlin
        kotlin {
            sourceSets {
                commonMain.dependencies {
                    implementation("org.jetbrains.kotlinx:kotlinx-datetime:%dateTimeVersion%")
                }
                webMain.dependencies {
                    implementation(npm("@js-joda/timezone", "2.22.0"))
                }
            }
        }
        ```
    7. 在主功能表中選擇 **Build | Sync Project with Gradle Files**，或點擊編輯器中的 Gradle 重新整理按鈕。

5. 移動開頭確定的商務邏輯程式碼：
    1. 在 `sharedLogic/src` 內建立 `commonMain/kotlin` 目錄。
    2. 在 `commonMain/kotlin` 內建立 `CurrentTime.kt` 檔案。
    3. 將 `currentTimeAt` 函式從原本的 `App.kt` 移動到 `CurrentTime.kt`。
6. 使該函式在 `App()` 可組合項的新位置可用。
   為此，請在 `composeApp/build.gradle.kts` 檔案中宣告 `composeApp` 與 `sharedLogic` 之間的相依性：

    ```kotlin
    commonMain.dependencies {
        implementation(projects.sharedLogic)
    }
    ```
7. 再次執行 **Build | Sync Project with Gradle Files** 以套用變更。
8. 在 `composeApp/commonMain/.../App.kt` 檔案中，匯入 `currentTimeAt()` 函式以修正程式碼。
9. 執行應用程式以確保新模組正常運作。

您已成功將共用邏輯隔離到獨立模組中並跨平台使用。下一步：建立共用 UI 模組。

#### 建立共用 UI 模組

在 `sharedUI` 模組中提取實作通用 UI 元素的共用程式碼：

1. 在專案根目錄建立 `sharedUI` 目錄。
2. 在該目錄內，建立一個空的 `build.gradle.kts` 檔案和 `src` 目錄。
3. 透過在檔案末尾新增以下行，將新模組新增至 `settings.gradle.kts`：

    ```kotlin
    include(":sharedUI")
    ```
4. 為新模組配置 Gradle 建置指令碼：

    1. 如果您尚未為 `sharedLogic` 模組執行此操作，請在 `gradle/libs.versions.toml` 中將 Android-KMP 程式庫外掛程式新增至您的版本目錄：

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

    3. 確保在 **根** `build.gradle.kts` 檔案中提到所有這些外掛程式：

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
                    // 這是您將在 Swift 程式碼中匯入的 iOS 架構名稱。
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

    5. 對於 Android，將 `androidLibrary {}` 配置新增到 `kotlin {}` 區塊中，而非使用 `androidTarget {}` 區塊：

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

    6. 為共用 UI 新增必要的相依性，方式與在 `composeApp` 中的宣告相同：

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
    7. 在主功能表中選擇 **Build | Sync Project with Gradle Files**，或點擊編輯器中的 Gradle 重新整理按鈕。
5. 在 `sharedUI/src` 內建立一個新的 `commonMain/kotlin` 目錄。
6. 將資源檔案移動到 `sharedUI` 模組：整個 `composeApp/commonMain/composeResources` 目錄應遷移到 `sharedUI/commonMain/composeResources`。
7. 在 `sharedUI/src/commonMain/kotlin` 目錄中，建立一個新的 `App.kt` 檔案。
8. 將原始 `composeApp/src/commonMain/.../App.kt` 的全部內容複製到新的 `App.kt` 檔案中。
9. 暫時註解掉舊 `App.kt` 檔案中的所有程式碼。
   這將允許您在完全刪除舊程式碼之前，測試共用 UI 模組是否正常運作。
10. 新的 `App.kt` 檔案應如預期運作，但資源匯入除外，因為它們現在位於不同的套件中。
    重新匯入正確路徑下的 `Res` 物件和所有可繪製資源，例如：

    <compare type="top-bottom">
    <code-block lang="kotlin" code="        import demo.composeapp.generated.resources.mx"/>
    <code-block lang="kotlin" code="        import demo.sharedui.generated.resources.mx"/>
    </compare>
11. 要使依賴新的 `App()` 可組合項的應用程式模組入口點能夠存取它，請在對應的 `build.gradle.kts` 檔案中新增相依性：

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
12. 執行您的應用程式，檢查新模組是否能正常為應用程式入口點提供共用 UI 程式碼。
13. 刪除 `composeApp/src/commonMain/.../App.kt` 檔案。

您已成功將跨平台 UI 程式碼移動到專屬模組中。

### 更新 iOS 整合

由於 iOS 應用程式入口點並非建置為獨立的 Gradle 模組，您可以將原始碼嵌入到任何模組中。在本範例中，您可以將其留在 `shared` 內：

1. 將 `composeApp/src/iosMain` 目錄移動到 `shared/src` 目錄中。
2. 配置 Xcode 專案以取用由 `shared` 模組產生的架構：
    1. 選擇 **File | Open Project in Xcode** 功能表項目。
    2. 在 **Project navigator** 工具視窗中點擊 **iosApp** 專案，然後選擇 **Build Phases** 頁籤。
    3. 找到 **Compile Kotlin Framework** 階段。
    4. 找到以 `./gradlew` 開頭的行，將 `composeApp` 替換為 `sharedUi`：

        ```text
        ./gradlew :shared:embedAndSignAppleFrameworkForXcode
        ```
   
    5. 請注意，`ContentView.swift` 檔案中的匯入需要保持不變，因為它與 iOS 目標 Gradle 配置中的 `baseName` 參數相符，而非模組的實際名稱。
       如果您在 `shared/build.gradle.kts` 檔案中更改了架構名稱，則需要相應地更改匯入指令。

3. 從 Xcode 執行應用程式，或使用 IntelliJ IDEA 中的 **iosApp** 运行配置進行執行。
