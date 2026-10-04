[//]: # (title: 測試你的多平台應用程式 – 教學)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
<p>本教學使用 IntelliJ IDEA，但你也可以在 Android Studio 中跟隨進行 – 兩款 IDE 具有相同的核心功能性與 Kotlin Multiplatform 支援。</p>
</tldr>

在本教學中，你將學習如何在 Kotlin Multiplatform 應用程式中建立、設定與執行測試。

多平台專案的測試可分為兩種類別：

* 共用程式碼的測試。這些測試可以使用任何受支援的架構在任何平台上執行。
* 平台特定程式碼的測試。這些測試對於測試特定於平台的邏輯至關重要。它們使用特定平台的架構，並能受益於其附加功能，例如更豐富的 API 和更廣泛的斷言。

多平台專案支援這兩種類別。本教學將首先向你展示如何在簡單的 Kotlin Multiplatform 專案中設定、建立並執行共用程式碼的單元測試。接著，你將處理一個更複雜的範例，該範例需要針對共用和平台特定程式碼進行測試。

> 本教學假設你已熟悉：
> * Kotlin Multiplatform 專案的配置結構。如果尚未熟悉，請在開始之前先完成[本教學](multiplatform-upgrade-app.md)。
> * 常見單元測試架構的基本概念，例如 [JUnit](https://junit.org/junit5/)。
>
{style="tip"}

## 測試簡單的多平台專案 {id="test-a-simple-multiplatform-project"}

### 建立專案 {id="create-a-project"}

1. 在[快速入門指南](quickstart.md)中，完成[設定 Kotlin Multiplatform 開發環境](quickstart.md#set-up-the-environment)的說明。
2. 在 IntelliJ IDEA 中，選取 **File** | **New** | **Project**。
3. 在左側面板中，選取 **Kotlin Multiplatform**。
4. 在 **New Project** 視窗中指定以下欄位：

    * **Name**：KMP testing
    * **Project ID**：kmp.project.testing

5. 選取 **Android** 目標。
   如果你使用的是 Mac，也請選取 **iOS**。請確保選取 **Do not share UI** 選項。
6. 取消選取 **Include tests**，然後點擊 **Create**。

   ![建立簡單的多平台專案](create-test-multiplatform-project.png){width=800}

### 編寫程式碼 {id="write-code"}

在 `sharedLogic/src/commonMain/kotlin` 目錄中，建立一個新的 `common.example.search` 套件。
在該套件中，建立名為 `Grep.kt` 的 Kotlin 檔案，並包含以下函式：

```kotlin
fun grep(lines: List<String>, pattern: String, action: (String) -> Unit) {
    val regex = pattern.toRegex()
    lines.filter(regex::containsMatchIn)
        .forEach(action)
}
```

此函式的設計旨在類似於 [UNIX `grep` 指令](https://en.wikipedia.org/wiki/Grep)。在此，該函式接收多行文字、一個用作正規表示式的模式，以及一個每當有一行與該模式相符時就會呼叫的函式。

### 新增測試 {id="add-tests"}

現在，讓我們測試共用程式碼。其中不可或缺的一部分是用於共用測試的原始碼集，它將 [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) API 程式庫作為相依性。

1. 在 `sharedLogic/build.gradle.kts` 檔案中，確認已加入對 `kotlin.test` 程式庫的相依性：

    ```kotlin
   sourceSets {
       //...
       commonTest.dependencies {
           implementation(libs.kotlin.test)
       }
   }
   ```
   
2. `commonTest` 原始碼集存放所有的共用測試。你需要在專案中建立同名的目錄：

    1. 在 `sharedLogic/src` 目錄上按一下滑鼠右鍵，然後選取 **New | Directory**。IDE 會顯示選項清單。
    2. 開始鍵入 `commonTest/kotlin` 路徑以縮小選擇範圍，然後從清單中選取它：

      ![建立共用測試目錄](create-common-test-dir.png){width=350}

3. 在 `commonTest/kotlin` 目錄中，建立一個新的 `common.example.search` 套件。
4. 在此套件中，建立 `Grep.kt` 檔案並更新為以下單元測試：

    ```kotlin
    import kotlin.test.Test
    import kotlin.test.assertContains
    import kotlin.test.assertEquals
    
    class GrepTest {
        companion object {
            val sampleData = listOf(
                "123 abc",
                "abc 123",
                "123 ABC",
                "ABC 123"
            )
        }
    
        @Test
        fun shouldFindMatches() {
            val results = mutableListOf<String>()
            grep(sampleData, "[a-z]+") {
                results.add(it)
            }
    
            assertEquals(2, results.size)
            for (result in results) {
                assertContains(result, "abc")
            }
        }
    }
    ```

如你所見，匯入的註解與斷言既不依賴特定平台，也不依賴特定架構。
稍後當你執行此測試時，特定平台的架構將提供測試執行器。

#### 探索 `kotlin.test` API {initial-collapse-state="collapsed" collapsible="true"}

[`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) 程式庫提供了與平台無關的註解和斷言，供你在測試中使用。諸如 `Test` 等註解會對應到所選架構提供的註解或其最接近的對應項目。

斷言是透過 [`Asserter` 介面](https://kotlinlang.org/api/latest/kotlin.test/kotlin.test/-asserter/) 的實作來執行的。該介面定義了測試中常執行的各種檢查。此 API 提供了一個預設實作，但通常你會使用特定於架構的實作。

例如，JVM 上支援 JUnit 4、JUnit 5 和 TestNG 架構。在 Android 上，呼叫 `assertEquals()` 可能會導致呼叫 `asserter.assertEquals()`，其中的 `asserter` 物件是 `JUnit4Asserter` 的執行個體。在 iOS 上，`Asserter` 型別的預設實作則會與 Kotlin/Native 測試執行器搭配使用。

### 執行測試

你可以透過以下方式執行測試：

* 使用邊欄中的 **Run** 圖示執行 `shouldFindMatches()` 測試函式。
* 使用測試檔案的操作功能表執行該檔案。
* 使用邊欄中的 **Run** 圖示執行 `GrepTest` 測試類別。

此外還有一個方便的快速鍵 <shortcut>⌃ ⇧ F10</shortcut>/<shortcut>Ctrl+Shift+F10</shortcut>。
無論你選擇哪種方式，都會看到一個可用於執行測試的目標清單：

![執行測試任務](run-test-tasks.png){width=300}

對於 `android` 選項，測試會使用 JUnit 4 執行。對於 `iosSimulatorArm64`，Kotlin 編譯器會偵測測試註解並建立一個由 Kotlin/Native 自帶的測試執行器執行的*測試二進位檔*。

以下是成功執行測試所產生的輸出範例：

![測試輸出](run-test-results.png){width=700}

## 處理更複雜的專案

### 編寫共用程式碼的測試

你已經針對 `grep()` 函式建立了共用程式碼的測試。現在，讓我們考慮使用 `CurrentRuntime` 類別進行更進階的共用程式碼測試。此類別包含程式碼執行所在平台的詳細資訊。例如，對於在本機 JVM 上執行的 Android 單元測試，它可能包含值 "OpenJDK" 和 "17.0"。

建立 `CurrentRuntime` 的執行個體時，應傳入字串形式的平台名稱與版本，其中版本為選填。當版本存在時，若可能的話，只需取得字串開頭的數字。

1. 在 `commonMain/kotlin` 目錄中，建立一個新的 `org.kmp.testing` 套件。
2. 在此套件中，建立 `CurrentRuntime.kt` 檔案並更新為以下實作：

    ```kotlin
    class CurrentRuntime(val name: String, rawVersion: String?) {
        companion object {
            val versionRegex = Regex("^[0-9]+(\\.[0-9]+)?")
        }
    
        val version = parseVersion(rawVersion)
    
        override fun toString() = "$name version $version"
    
        private fun parseVersion(rawVersion: String?): String {
            val result = rawVersion?.let { versionRegex.find(it) }
            return result?.value ?: "unknown"
        }
    }
    ```

3. 在 `commonTest/kotlin` 目錄中，建立一個新的 `org.kmp.testing` 套件。
4. 在此套件中，建立 `CurrentRuntimeTest.kt` 檔案並更新為以下與平台及架構無關的測試：

    ```kotlin
    import kotlin.test.Test
    import kotlin.test.assertEquals

    class CurrentRuntimeTest {
        @Test
        fun shouldDisplayDetails() {
            val runtime = CurrentRuntime("MyRuntime", "1.1")
            assertEquals("MyRuntime version 1.1", runtime.toString())
        }
    
        @Test
        fun shouldHandleNullVersion() {
            val runtime = CurrentRuntime("MyRuntime", null)
            assertEquals("MyRuntime version unknown", runtime.toString())
        }
    
        @Test
        fun shouldParseNumberFromVersionString() {
            val runtime = CurrentRuntime("MyRuntime", "1.2 Alpha Experimental")
            assertEquals("MyRuntime version 1.2", runtime.toString())
        }
    
        @Test
        fun shouldHandleMissingVersion() {
            val runtime = CurrentRuntime("MyRuntime", "Alpha Experimental")
            assertEquals("MyRuntime version unknown", runtime.toString())
        }
    }
    ```

你可以使用 [IDE 中提供的任何方式](#run-tests)來執行此測試。

### 新增平台特定測試

> 在此，為了簡潔明瞭，使用了 [expected 與 actual 宣告機制](multiplatform-connect-to-apis.md)。在更複雜的程式碼中，更好的做法是使用介面和工廠函式。
>
{style="note"}

現在你已經具備編寫共用程式碼測試的經驗，讓我們來探索如何編寫適用於 Android 和 iOS 的平台特定測試。

若要建立 `CurrentRuntime` 的執行個體，請在共用的 `CurrentRuntime.kt` 檔案中宣告如下函式：

```kotlin
expect fun determineCurrentRuntime(): CurrentRuntime
```

該函式應針對每個受支援的平台提供個別的實作，否則建置將會失敗。除了在每個平台上實作此函式之外，你還應該提供測試。讓我們為 Android 和 iOS 建立它們。

#### 針對 Android {id="for-android"}

1. 在 `androidMain/kotlin` 目錄中，建立一個新的 `org.kmp.testing` 套件。
2. 在此套件中，建立 `AndroidRuntime.kt` 檔案，並以預期之 `determineCurrentRuntime()` 函式的 actual 實作更新它：

    ```kotlin
    actual fun determineCurrentRuntime(): CurrentRuntime {
        val name = System.getProperty("java.vm.name") ?: "Android"
    
        val version = System.getProperty("java.version")
    
        return CurrentRuntime(name, version)
    }
    ```

3. 在 `sharedLogic/src` 目錄內建立一個用於測試的目錄：
 
   1. 在 `sharedLogic/src` 目錄上按一下滑鼠右鍵，然後選取 **New | Directory**。IDE 會顯示選項清單。
   2. 開始鍵入 `androidHostTest/kotlin` 路徑以縮小選擇範圍，然後從清單中選取它：

      ![建立 Android 測試目錄](create-android-test-dir.png){width=350}

4. 在 `androidHostTest/kotlin` 目錄中，建立一個新的 `org.kmp.testing` 套件。
5. 在此套件中，建立 `AndroidRuntimeTest.kt` 檔案並更新為以下 Android 測試。
   為了讓測試通過，請確保設定執行階段（runtime）的實際名稱與版本（但觀察測試失敗的過程也很有幫助）：

    ```kotlin
    import kotlin.test.Test
    import kotlin.test.assertContains
    import kotlin.test.assertEquals
    
    class AndroidRuntimeTest {
        @Test
        fun shouldDetectAndroid() {
            val runtime = determineCurrentRuntime()
            assertContains(runtime.name, "OpenJDK")
            assertEquals(runtime.version, "21.0")
        }
    }
    ```
   
Android 特定的測試在本機 JVM 上執行可能會讓人感到奇怪。這是因為這些測試是作為本機單元測試在當前電腦上執行的。如 [Android Studio 文件](https://developer.android.com/studio/test/test-in-android-studio)中所述，這些測試與在裝置或模擬器上執行的檢測測試（instrumented tests）不同。

你可以在專案中加入其他類型的測試。若要了解檢測測試，請參閱此 [Touchlab 指南](https://touchlab.co/understanding-and-configuring-your-kmm-test-suite/)。

#### 針對 iOS {id="for-ios"}

1. 在 `iosMain/kotlin` 目錄中，建立一個新的 `org.kmp.testing` 目錄。
2. 在此目錄中，建立 `IOSRuntime.kt` 檔案，並以預期之 `determineCurrentRuntime()` 函式的 actual 實作更新它：

    ```kotlin
    import kotlin.experimental.ExperimentalNativeApi
    import kotlin.native.Platform
    
    @OptIn(ExperimentalNativeApi::class)
    actual fun determineCurrentRuntime(): CurrentRuntime {
        val name = Platform.osFamily.name.lowercase()
        return CurrentRuntime(name, null)
    }
    ```

3. 在 `sharedLogic/src` 目錄中建立一個新目錄：
   
   1. 在 `sharedLogic/src` 目錄上按一下滑鼠右鍵，然後選取 **New | Directory**。IDE 會顯示選項清單。
   2. 開始鍵入 `iosTest/kotlin` 路徑以縮小選擇範圍，然後從清單中選取它：

4. 在 `iosTest/kotlin` 目錄中，建立一個新的 `org.kmp.testing` 目錄。
5. 在此目錄中，建立 `IOSRuntimeTest.kt` 檔案並更新為以下 iOS 測試：

    ```kotlin 
    import kotlin.test.Test
    import kotlin.test.assertEquals
    
    class IOSRuntimeTest {
        @Test
        fun shouldDetectOS() {
            val runtime = determineCurrentRuntime()
            assertEquals(runtime.name, "ios")
            assertEquals(runtime.version, "unknown")
        }
    }
    ```

### 執行多個測試並分析報告 {id="run-multiple-tests-and-analyze-reports"}

在此階段，你已具備共用、Android 與 iOS 實作的程式碼及其測試。專案中的目錄結構應該如下所示：

![整體專案結構](code-and-test-structure.png){width=300}

你可以從操作功能表執行個別測試，或使用快速鍵。另一個選項是使用 Gradle 任務。例如，如果你執行 `allTests` Gradle 任務，專案中的每個測試都會使用對應的測試執行器執行：

![Gradle 測試任務](gradle-alltests.png){width=700}

當你執行測試時，除了 IDE 中的輸出之外，還會產生 HTML 報告。你可以在 `sharedLogic/build/reports/tests` 目錄中找到它們：

![多平台測試的 HTML 報告](shared-tests-folder-reports.png){width=300}

執行 `allTests` 任務並檢查其產生的報告：

* `allTests/index.html` 檔案包含共用測試和 iOS 測試的彙整報告（iOS 測試相依於共用測試，並在共用測試之後執行）。
* `testDebugUnitTest` 與 `testReleaseUnitTest` 資料夾包含兩種預設 Android 建置變體（build flavors）的報告。（目前 Android 測試報告不會自動與 `allTests` 報告合併。）

![多平台測試的 HTML 報告](multiplatform-test-report.png){width=700}

## 在多平台專案中使用測試的規則 {id="rules-for-using-tests-in-multiplatform-projects"}

現在你已在 Kotlin Multiplatform 應用程式中建立、設定並執行了測試。在未來的專案中進行測試時，請記住：

* 編寫共用程式碼的測試時，僅使用多平台程式庫，如 [kotlin.test](https://kotlinlang.org/api/latest/kotlin.test/)。將相依性新增至 `commonTest` 原始碼集中。
* 來自 `kotlin.test` API 的 `Asserter` 型別應僅以間接方式使用。雖然 `Asserter` 執行個體可見，但你不需要在測試中直接使用它。
* 請始終保持在測試程式庫 API 的範圍內。所幸，編譯器和 IDE 會阻止你使用特定於架構的功能。
* 雖然使用哪種架構在 `commonTest` 中執行測試並不影響，但最好使用你打算採用的每個架構來執行測試，以確認開發環境是否設定正確。
* 請考量物理特性的差異。例如，捲動慣性與摩擦力數值會因平台和裝置而異，因此設定相同的捲動速度可能會導致不同的捲動位置。請務必在目標平台上測試你的組件，以確保符合預期的行為。
* 編寫平台特定程式碼的測試時，你可以使用對應架構的功能，例如註解與擴充。
* 你既可以從 IDE 執行測試，也可以使用 Gradle 任務執行。
* 當你執行測試時，會自動產生 HTML 測試報告。

## 後續步驟 {id="what-s-next"}

* 在[了解 Multiplatform 專案結構](multiplatform-discover-project.md)中探索多平台專案的配置。
* 參考 [Kotest](https://kotest.io/)，這是 Kotlin 生態系統提供的另一個多平台測試架構。Kotest 允許以多種風格編寫測試，並支援常規測試的互補方法。其中包括[資料驅動](https://kotest.io/docs/framework/datatesting/data-driven-testing.html)和[基於屬性](https://kotest.io/docs/proptest/property-based-testing.html)的測試。