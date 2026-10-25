[//]: # (title: 測試 Compose Multiplatform UI)

Compose Multiplatform 中的 UI 測試是使用與 Jetpack Compose 測試 API 相同的尋找器 (finders)、斷言 (assertions)、動作 (actions) 與比對器 (matchers) 來實作的。如果你對它們還不熟悉，在繼續閱讀本文之前，請先閱讀 [Jetpack Compose 指南](https://developer.android.com/jetpack/compose/testing)。

> 此 API 為[實驗功能 (Experimental)](supported-platforms.md#compose-multiplatform-ui-framework-stability-levels)。
> 未來可能會有所變更。
>
{style="warning"}

## Compose Multiplatform 測試與 Jetpack Compose 有何不同 {id="how-compose-multiplatform-testing-is-different-from-jetpack-compose"}

Compose Multiplatform 的通用測試 API 不依賴 JUnit 的 `TestRule` 類別。相反地，你需要呼叫 `runComposeUiTest` 函式，並在 `ComposeUiTest` 接收者上呼叫測試函式。

不過，基於 JUnit 的 API 仍可用於[桌面目標](compose-desktop-ui-testing.md)。

## 使用 Compose Multiplatform 編寫與執行測試 {id="writing-and-running-tests-with-compose-multiplatform"}

首先，將測試用原始碼集與必要的相依性新增至模組中。接著，編寫並執行範例測試，並嘗試對其進行自訂。

### 建立測試原始碼集並將測試程式庫新增至相依性 {id="create-the-test-source-set-and-add-the-testing-library-to-dependencies"}

為了提供具體範例，本頁的說明遵循由 [Kotlin Multiplatform 精靈](https://kmp.jetbrains.com/) 所產生的專案結構。如果你是要將測試新增至現有專案中，可能需要將路徑和指令中的 `shared` 替換為你正在測試的模組名稱。

當你在 Kotlin Multiplatform 精靈中勾選 **Include tests** 選項時，它會產生測試的基本結構，包括 `*Test` 原始碼集。

設定 UI 測試程式庫：
在 `shared/build.gradle.kts` 檔案中，將 UI 測試程式庫新增至 `commonTest` 原始碼集的相依性中。

```kotlin
kotlin {
    //...
    sourceSets {
        // 新增通用測試相依性
        commonTest.dependencies {
            //...
            implementation("org.jetbrains.compose.ui:ui-test:%org.jetbrains.compose%")
        }

        // 新增桌面測試相依性
        jvmTest.dependencies { 
            implementation(compose.desktop.currentOs)
        }
    }
}
```

如果你需要為 Android 執行插樁（模擬器）測試，請按以下方式修改你的 Gradle 設定：
   
1. 在 `shared/build.gradle.kts` 檔案中，將以下程式碼新增至 `androidLibrary {}` 區塊，以設定插樁測試原始碼集相依於通用測試原始碼集。

   ```kotlin
   kotlin {
       //...
       androidLibrary {
           withDeviceTestBuilder { 
               sourceSetTreeName = "test"
           }
       } 
   }
   ```
   
2. 在 `androidApp/build.gradle.kts` 檔案中，將以下程式碼新增至 `android.defaultConfig {}` 區塊，以設定 Android 測試插樁執行器：

   ```kotlin
   android {
       //...
       defaultConfig {
           //...
           testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
       }
   }
   ```

3. 在 `androidApp/build.gradle.kts` 檔案中，於根層級的 `dependencies {}` 區塊新增所需的相依性：

    ```kotlin
    dependencies { 
        androidTestImplementation("androidx.compose.ui:ui-test-junit4-android:%androidx.compose%")
        debugImplementation("androidx.compose.ui:ui-test-manifest:%androidx.compose%")
    }
    ```
4. 在主選單中選取 **Build | Sync Project with Gradle Files**，或點擊建置指令碼編輯器中的 Gradle 重新整理按鈕。

5. 記得為插樁測試建立 `shared/src/androidDeviceTest` 原始碼集。即使你的大部分測試都位於 `commonTest` 中，`androidDeviceTest` 目錄也至少應該包含一個 `AndroidManifest.xml` 檔案，用以指向測試將使用的一般 Activity：

    ```xml
    <?xml version="1.0" encoding="utf-8"?>
    <manifest xmlns:android="http://schemas.android.com/apk/res/android">
        <application>
            <activity
                    android:name="androidx.activity.ComponentActivity"
                    android:exported="true">
                <intent-filter>
                    <action android:name="android.intent.action.MAIN" />
                    <category android:name="android.intent.category.LAUNCHER" />
                </intent-filter>
            </activity>
        </application>
    </manifest>
    ```
    {collapsible="true" collapsed-title-line-number="5"}

現在，你已經準備好編寫並執行 Compose Multiplatform UI 的通用測試了。

### 編寫並執行通用測試 {id="write-and-run-common-tests"}

在 `shared/src/commonTest/kotlin/<package>` 目錄中建立名為 `ExampleTest.kt` 的檔案，並將以下程式碼複製到其中：

```kotlin
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.test.ExperimentalTestApi
import androidx.compose.ui.test.assertTextEquals
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.v2.runComposeUiTest
import kotlin.test.Test

class ExampleTest {

    @OptIn(ExperimentalTestApi::class)
    @Test
    fun myTest() = runComposeUiTest {
        // 宣告模擬 UI 以示範 API 呼叫
        //
        // 替換為你自己的宣告以測試專案程式碼
        setContent {
            var text by remember { mutableStateOf("Hello") }
            Text(
                text = text,
                modifier = Modifier.testTag("text")
            )
            Button(
                onClick = { text = "Compose" },
                modifier = Modifier.testTag("button")
            ) {
                Text("Click me")
            }
        }

        // 使用 Compose Multiplatform 測試 API 的斷言與動作來測試所宣告的 UI
        onNodeWithTag("text").assertTextEquals("Hello")
        onNodeWithTag("button").performClick()
        onNodeWithTag("text").assertTextEquals("Compose")
    }
}
```

若要執行測試：

<Tabs>
<TabItem title="iOS Simulator">

有兩種方式：
* 在 IntelliJ IDEA 中，你可以點擊 `myTest()` 函式旁邊欄中的綠色執行圖示，選擇 **Run | ExampleTest.myTest**，然後選取測試的 iOS 目標。
* 在終端機中執行以下指令：

   ```shell
   ./gradlew :shared:iosSimulatorArm64Test
   ```

</TabItem>
<TabItem title="Android Emulator">

在終端機中執行此指令：

```shell
./gradlew :shared:connectedAndroidTest
```

目前無法使用 `android (local)` 測試組態來執行通用 Compose Multiplatform 測試，因此舉例來說，Android Studio 中的裝訂邊圖示將無法使用。

</TabItem>
<TabItem title="Desktop">

你有兩種方式：
* 點擊 `myTest()` 函式旁邊欄中的綠色執行圖示並選擇 **Run | ExampleTest.myTest**，然後選取 JVM 目標。
* 在終端機中執行以下指令：

   ```shell
   ./gradlew :shared:jvmTest
   ```

</TabItem>
<TabItem title="Wasm (headless browser)">

在終端機中執行此指令：

```shell
./gradlew :shared:wasmJsTest
```

</TabItem>
</Tabs>

## 後續步驟 {id="what-s-next"}

既然你已經掌握了 Compose Multiplatform UI 測試的訣竅，你可能還想查看更多與測試相關的資源：
* 關於 Kotlin Multiplatform 專案測試的整體概念，請參閱[了解基本專案結構](multiplatform-discover-project.md#integration-with-tests)以及[測試你的多平台應用程式](multiplatform-run-tests.md)教學。
* 關於針對桌面目標設定與執行基於 JUnit 的測試的詳細資料，請參閱[使用 JUnit 測試 Compose Multiplatform UI](compose-desktop-ui-testing.md)。
* 關於在地化測試，請參閱[在不同平台上測試語言區域](compose-localization-tests.md#testing-locales-on-different-platforms)。
* Android Studio 中的進階測試（包含自動化）請參閱 Android Studio 文件中的[測試您的應用程式](https://developer.android.com/studio/test)一文。