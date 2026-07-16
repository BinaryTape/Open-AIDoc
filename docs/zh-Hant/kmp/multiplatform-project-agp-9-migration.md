[//]: # (title: 更新包含 Android 應用程式的多平台專案以使用 AGP 9)
<show-structure for="chapter,procedure" depth="3"/>

當搭配 Android Gradle plugin 9.0 或更新版本使用時，
Kotlin Multiplatform Gradle 外掛程式將不再相容於 `com.android.application` 和 `com.android.library` 外掛程式。

若要更新您的專案：
* 如果您的 Android 入口點目前是在共用程式碼模組中實作的，
  請將其提取到一個獨立的模組中，以避免 Gradle 外掛程式衝突。
* 將您的共用程式碼模組遷移至使用專為多平台專案建置的新 [Android-KMP 程式庫外掛程式](https://developer.android.com/kotlin/multiplatform/plugin)。

<video src="https://www.youtube.com/v/m0Cq6J-V_RY" title="將 Kotlin 專案遷移至 Android Gradle plugin 9.0"/>

> Android Studio 從 Otter 3 Feature Drop 2025.2.3 開始支援 AGP 9.0.0。
> IntelliJ IDEA 對 AGP 9.0.0 的支援預計於 2026 年第一季推出。
> 
{style="note"}

## 遷移至 Android-KMP 程式庫外掛程式

先前在多平台模組中配置 Android 目標時，您需要同時使用 
KMP 外掛程式 (`org.jetbrains.kotlin.multiplatform`) 
以及 
Android 應用程式 (`com.android.application`) 或 Android 程式庫 (`com.android.library`) 外掛程式。

在 AGP 9.0 中，這些外掛程式不再與 KMP 相容，
因此您需要遷移至專為 KMP 建置的新 Android-KMP 程式庫外掛程式。

### 如何遷移

有關程式庫的遷移步驟，請參閱 [Android 文件中的指南](https://developer.android.com/kotlin/multiplatform/plugin#migrate)。

若要遷移 Android 應用程式專案，您必須將 Android 入口點與共用程式碼放置在正確配置的獨立模組中。
以下是遷移範例應用程式的一般教學，您可以在其中看到：
* [如何將 Android 應用程式入口點提取到獨立模組中](#android-app)
* [如何更新共用模組的配置](#configure-the-shared-module-to-use-the-android-kmp-library-plugin)

> 您可以使用我們[準備好的技能](https://github.com/Kotlin/kotlin-agent-skills/blob/main/skills/kotlin-tooling-agp9-migration/SKILL.md)，將遷移工作交給您選擇的 AI 代理程式 (AI agent)。
> 請記住，AI 處理結果並非完全可預測。
>
{style="note"}

### 在 AGP 10 之前啟用舊版 API

為了讓您的專案在短期內能與 AGP 9.0 搭配運作，您可以手動啟用已棄用的 API。
為此，請在專案的 `gradle.properties` 檔案中加入以下屬性：
`android.enableLegacyVariantApi=true`。

舊版 API 將在 [AGP 10 中被完全移除](https://developer.android.com/build/releases/gradle-plugin-roadmap#agp-10)，
該版本很可能在 2026 年下半年發布。
請確保在此之前完成遷移。

## 範例應用程式的遷移

您將為遷移準備的範例專案是一個 Compose Multiplatform 應用程式，該應用程式是 
[建立您自己的應用程式](compose-multiplatform-new-project.md) 
教學的產出結果。
* 包含需要更新的應用程式範例位於範例存儲庫的 [main](https://github.com/kotlin-hands-on/get-started-with-cm/tree/main) 
  分支。
* 應用程式的最終狀態（已隔離 `androidApp`）可在 [new-project-structure](https://github.com/kotlin-hands-on/get-started-with-cm/tree/new-project-structure) 
  分支中取得。
該分支還包含其他平台隔離應用程式模組的範例。

<!-- When the new structure is implemented in the wizard, this is going to change: 
     following the tutorial will bring you to the new structure already.
     So when the update hits we update with the following:

The sample with an example of older structure is in the [old-project-structure](https://github.com/kotlin-hands-on/get-started-with-cm/tree/old-project-structure)
branch of the sample repository. -->

該範例包含一個 Gradle 模組 (`composeApp`)，其中包含所有共用程式碼與 KMP 入口點，
以及一個包含 iOS 特定程式碼與配置的 `iosApp` 專案。

為了準備 AGP 9.0 的遷移，您將：

* [將 Android 應用程式入口點提取](#android-app)到獨立的 `androidApp` 模組中。
* [重新配置具有共用程式碼的模組](#configure-the-shared-module-to-use-the-android-kmp-library-plugin) (`composeApp`) 以使用 Android-KMP 程式庫外掛程式。

### Android 應用程式入口點模組 {id="android-app"}

#### 建立並配置 Android 應用程式模組

若要建立 Android 應用程式模組 (`androidApp`)：

1. 在專案根目錄建立 `androidApp` 目錄。
2. 在該目錄內，建立一個空的 `build.gradle.kts` 檔案與 `src` 目錄。
3. 在 `settings.gradle.kts` 檔案的末尾加入此行，將新模組加入專案設定：

    ```kotlin
    include(":androidApp")
    ```
4. 在主功能表中選擇 **Build | Sync Project with Gradle Files**，或點擊編輯器中的 Gradle 重新整理按鈕。

#### 配置 Android 應用程式的建置指令碼

為新模組配置 Gradle 建置指令碼：

1. 在 `gradle/libs.versions.toml` 檔案中，將 Kotlin Android Gradle 外掛程式加入您的版本類目：

    ```text
    [plugins]
    kotlinAndroid = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
    ```

2. 在 `androidApp/build.gradle.kts` 檔案中，指定 Android 應用程式模組所需的插件：

    ```kotlin
    plugins {
       alias(libs.plugins.kotlinAndroid)
       alias(libs.plugins.androidApplication)
       alias(libs.plugins.composeMultiplatform)
       alias(libs.plugins.composeCompiler)
    }
    ```

3. 確保所有這些外掛程式都在 **根目錄** 的 `build.gradle.kts` 檔案中被提及：

    ```kotlin
    plugins {
        alias(libs.plugins.kotlinAndroid) apply false
        alias(libs.plugins.androidApplication) apply false
        alias(libs.plugins.composeMultiplatform) apply false
        alias(libs.plugins.composeCompiler) apply false
        // ...
    }
    ```

4. 若要加入必要的相依性，請從 `composeApp` 建置指令碼的 `androidMain.dependencies {}` 區塊中複製現有的相依性，並加入對 `composeApp` 模組本身的相依性。
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

5. 將包含 Android 特定配置的整個 `android {}` 區塊從 `composeApp/build.gradle.kts` 
   檔案複製到 `androidApp/build.gradle.kts` 檔案。 

6. 將編譯器選項從 `composeApp/build.gradle.kts` 檔案的 `androidTarget {}` 區塊複製到 
   `androidApp/build.gradle.kts` 檔案的 `target {}` 區塊：

    ```kotlin
    target {
        compilerOptions {
            jvmTarget.set(JvmTarget.JVM_11)
        }
    }
    ```

   > 如果 `composeApp` 建置指令碼中設定了任何其他外掛程式或屬性，
   > 請確保也將其遷移到 `androidApp` 建置指令碼中。
   >
   {style="note"}

7. 將 `composeApp` 模組的配置從 Android 應用程式更改為 Android 程式庫，
   因為它實際上已經變成了程式庫。在 `composeApp/build.gradle.kts` 中：
   * 更改對 Gradle 外掛程式的引用：

       <compare type="top-bottom">
          <code-block lang="kotlin" code="              alias(libs.plugins.androidApplication)"></code-block>
          <code-block lang="kotlin" code="              alias(libs.plugins.androidLibrary)"></code-block>
       </compare>
   
    * 從 `android.defaultConfig {}` 區塊中移除應用程式屬性行：

      <compare type="top-bottom">
          <code-block lang="kotlin" code="              defaultConfig {&#10;                  applicationId = &quot;com.jetbrains.demo&quot;&#10;                  minSdk = libs.versions.android.minSdk.get().toInt()&#10;                  targetSdk = libs.versions.android.targetSdk.get().toInt()&#10;                  versionCode = 1&#10;                  versionName = &quot;1.0&quot;&#10;              }"></code-block>
          <code-block lang="kotlin" code="              defaultConfig {&#10;                  minSdk = libs.versions.android.minSdk.get().toInt()&#10;              }"></code-block>
       </compare>
   
8. 在主功能表中選擇 **Build | Sync Project with Gradle Files**，或點擊編輯器中的 Gradle 重新整理按鈕。

#### 移動程式碼並執行 Android 應用程式

1. 將 `composeApp/src/androidMain` 目錄移動到 `androidApp/src/` 目錄中，
   但請記住應保持跨平台的程式碼：
   
   * 入口點程式碼（如本範例中的 `MainActivity.kt`）必須位於 `androidApp` 模組中，才能正確組建 Android 應用程式。
   * 所有 [expected 與 actual 宣告](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)
     必須保留在共用模組（本範例中的 `composeApp`）的原始碼集中，以便所有平台使用。
     當您設定 `androidApp` 對 `composeApp` 的相依性時，這些宣告在入口點程式碼中也將可用。
   
2. 將 `androidApp/src/androidMain` 目錄重新命名為 `main`。
3. 如果一切配置正確，`androidApp/src/main/.../MainActivity.kt` 檔案中的匯入將可正常運作且程式碼能成功編譯。
4. 當您使用 IntelliJ IDEA 或 Android Studio 時，IDE 會識別新模組並自動建立一個新的執行配置：**androidApp**。
   如果沒有發生這種情況，請手動修改 **composeApp** Android 執行配置：
   1. 在執行配置下拉式功能表中，選擇 **Edit Configurations**。
   2. 在 **Android** 類別中找到 **composeApp** 配置。
   3. 在 **General | Module** 欄位中，將 `demo.composeApp` 更改為 `demo.androidApp`。
5. 啟動新的執行配置以確保應用程式如預期執行。
6. 如果一切運作正常，請在 `composeApp/build.gradle.kts` 檔案中移除 `kotlin.sourceSets.androidMain.dependencies {}` 區塊。

您已將 Android 入口點提取到獨立模組。
現在請更新共用程式碼模組以使用新的 Android-KMP 程式庫外掛程式。 

### 配置共用模組以使用 Android-KMP 程式庫外掛程式

為了簡單提取 Android 入口點，您在共用 `composeApp` 模組中套用了 `com.android.library` 外掛程式。
現在請遷移至新的多平台程式庫外掛程式：

1. 在 `gradle/libs.versions.toml` 中，
   將 Android-KMP 程式庫外掛程式加入您的版本類目：

    ```text
    [plugins]
    androidMultiplatformLibrary = { id = "com.android.kotlin.multiplatform.library", version.ref = "agp" }
    ```

2. 在 `composeApp/build.gradle.kts` 檔案中，將舊的 Android 程式庫外掛程式更換為新的：

    <compare type="top-bottom">
        <code-block lang="kotlin" code="            alias(libs.plugins.androidLibrary)"></code-block>
        <code-block lang="kotlin" code="            alias(libs.plugins.androidMultiplatformLibrary)"></code-block>
    </compare>
3. 在根目錄的 `build.gradle.kts` 檔案中，加入以下行以避免套用外掛程式時發生衝突：

    ```kotlin
    alias(libs.plugins.androidMultiplatformLibrary) apply false
    ```
4. 在 `composeApp/build.gradle.kts` 檔案中，加入 `kotlin.androidLibrary {}` 區塊來取代 `kotlin.androidTarget {}` 區塊：

    ```kotlin
    androidLibrary {
        namespace = "compose.project.demo.composedemo"
        compileSdk = libs.versions.android.compileSdk.get().toInt()
    
        compilerOptions {
            jvmTarget.set(JvmTarget.JVM_11)
        }
    
        androidResources {
            enable = true
        }
    }
    ```
5. 從 `composeApp/build.gradle.kts` 檔案中移除 `android {}` 區塊，因為它現在已被 `kotlin.androidLibrary {}` 配置取代。
6. 在 `dependencies {}` 區塊中，將 `debugImplementation(libs.compose.uiTooling)` 行替換為
   `androidRuntimeClasspath(libs.compose.uiTooling)`，因為新的 Android KMP 程式庫外掛程式不支援建置變體。
7. 在主功能表中選擇 **Build | Sync Project with Gradle Files**，或點擊編輯器中的 Gradle 重新整理按鈕。
8. 檢查 Android 應用程式是否如預期執行。

### 更新 Android Gradle 外掛程式版本

當您所有的程式碼都能在新的配置下運作時：

1. 如果您遵循了說明，您應該已經擁有適用於新應用程式模組的可用執行配置。
      您可以刪除與 `composeApp` 模組關聯的過時執行配置。
2. 在 `gradle/libs.versions.toml` 檔案中，將 AGP 更新為 9.* 版本，例如：

    ```text
    [versions]
    agp = "9.0.0"
    ```
3. 在 `gradle/wrapper/gradle-wrapper.properties` 檔案中，將 Gradle 版本更新至至少 9.1.0：

    ```text
    distributionUrl=https\://services.gradle.org/distributions/gradle-9.1.0-bin.zip
    ```
4. 從 `androidApp/build.gradle.kts` 檔案中移除此行，因為 [Kotlin 支援已內建於 AGP 9.0](https://developer.android.com/build/migrate-to-built-in-kotlin)，
   不再需要套用 Kotlin Android 外掛程式：

    ```kotlin
    alias(libs.plugins.kotlinAndroid)
    ```
5. 在 `composeApp/build.gradle.kts` 檔案中更新 `kotlin.androidLibrary {}` 區塊內的命名空間，
   使其不會與應用程式的命名空間衝突。例如：

    ```kotlin
    kotlin {
        androidLibrary {
            namespace = "compose.project.demo.composedemolibrary"
            // ...
    ```
   
6. 在建置指令碼編輯器中選擇 **Build | Sync Project with Gradle Files**，或點擊 Gradle 重新整理按鈕。

7. 檢查您的應用程式是否可以使用新的 AGP 版本進行組建與執行。

恭喜！您已成功升級專案以相容於 AGP 9.0。

<!-- Commented out for now
## What's next

Check out the [recommended project structure](multiplatform-project-recommended-structure.md)
which follows the logic of separating entry points for any app target you might have. -->