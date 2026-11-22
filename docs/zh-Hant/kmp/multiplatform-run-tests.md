[//]: # (title: 測試您的多平台應用程式 – 教學)

<secondary-label ref="IntelliJ IDEA"/>
<secondary-label ref="Android Studio"/>

<tldr>
<p>本教學使用 IntelliJ IDEA，但您也可以在 Android Studio 中跟著操作——這兩款 IDE 具有相同的核心功能與 Kotlin Multiplatform 支援。</p>
</tldr>

在本教學中，您將學習如何在 Kotlin Multiplatform 應用程式中建立、設定並執行測試。

多平台專案的測試可分為兩種類別：

* 通用程式碼的測試。這些測試可以使用任何受支援的架構在任何平台上執行。
* 平台特定程式碼的測試。這對於測試平台特定邏輯至關重要。它們使用平台特定的架構，並能獲益於其額外功能，例如更豐富的 API 以及更廣泛的斷言。

多平台專案同時支援這兩種類別。本教學將首先向您展示如何在一個簡單的 Kotlin Multiplatform 專案中設定、建立並執行通用程式碼的單元測試。接著，您將處理一個更複雜的範例，該範例同時需要通用程式碼與平台特定程式碼的測試。

> 本教學假設您已熟悉：
> * Kotlin Multiplatform 專案的結構。如果還不熟悉，請在開始之前先完成[本教學](multiplatform-upgrade-app.md)。
> * 常見單元測試架構（例如 [JUnit](https://junit.org/junit5/)）的基本概念。
>
{style="tip"}

## 測試簡單的多平台專案 {id="test-a-simple-multiplatform-project"}

### 建立專案 {id="create-a-project"}

1. 在[快速入門指南](quickstart.md)中，完成[設定 Kotlin Multiplatform 開發環境](quickstart.md#set-up-the-environment)的說明。
2. 在 IntelliJ IDEA 中，選取 **File** | **New** | **Project**。
3. 在左側面板中選取 **Kotlin Multiplatform**。
4. 在 **New Project** 視窗中指定以下欄位：

    * **Name**：KMP testing
    * **Project ID**：kmp.project.testing

5. 選取 **Android** 目標。
   如果您使用的是 Mac，也請選取 **iOS**。請確保選取 **Do not share UI** 選項。
6. 取消選取 **Include tests**，然後點擊 **Create**。

   ![建立簡單的多平台專案](create-test-multiplatform-project.png){width=800}

### 編寫程式碼 {id="write-code"}

在 `sharedLogic/src/commonMain/kotlin` 目錄中，建立一個新的 `common.example.search` 套件。
在此套件中建立一個 Kotlin 檔案 `Grep.kt`，並加入以下函式：

```kotlin
fun grep(lines: List<String>, pattern: String, action: (String) -> Unit) {
    val regex = pattern.toRegex()
    lines.filter(regex::containsMatchIn)
        .forEach(action)
}
```

此函式的設計旨在類似於 [UNIX 的 `grep` 指令](https://en.wikipedia.org/wiki/Grep)。在此，該函式接收多行文字、一個作為正規表示式的模式，以及一個在每當有文字行符合該模式時被叫用的函式。

### 新增測試 {id="add-tests"}

現在，讓我們測試通用程式碼。其中不可或缺的部分是通用測試的原始碼集，它將 [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) API 程式庫作為相依性。

1. 在 `sharedLogic/build.gradle.kts` 檔案中，檢查是否存在對 `kotlin.test` 程式庫的相依性：

    ```kotlin
   sourceSets {
       //...
       commonTest.dependencies {
           implementation(libs.kotlin.test)
       }
   }
   ```
   
2. `commonTest` 原始碼集存放所有的通用測試。您需要在專案中建立一個同名目錄：

    1. 在 `sharedLogic/src` 目錄上按一下滑鼠右鍵，然後選取 **New | Directory**。IDE 會顯示選項清單。
    2. 開始輸入 `commonTest/kotlin` 路徑以縮小選擇範圍，然後從清單中選取它：

      ![建立通用測試目錄](create-common-test-dir.png){width=350}

3. 在 `commonTest/kotlin` 目錄中，建立一個新的 `common.example.search` 套件。
4. 在此套件中建立 `Grep.kt` 檔案，並使用以下單元測試對其進行更新：

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

如您所見，匯入的註解和斷言既非平台特定，也非架構特定。
當您稍後執行此測試時，平台特定的架構將會提供測試執行器。

#### 探索 `kotlin.test` API {initial-collapse-state="collapsed" collapsible="true" id="explore-the-kotlin-test-api"}

[`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) 程式庫提供了與平台無關的註解和斷言供您在測試中使用。例如 `Test` 等註解會對應到所選架構提供的註解或其最接近的對等項目。

斷言是透過 [`Asserter` 介面](https://kotlinlang.org/api/latest/kotlin.test/kotlin.test/-asserter/)的實作來執行的。此介面定義了測試中通常執行的各種檢查。該 API 具有預設實作，但通常您會使用特定於架構的實作。

例如，JVM 上支援 JUnit 4、JUnit 5 和 TestNG 架構。在 Android 上，呼叫 `assertEquals()` 可能會導致呼叫 `asserter.assertEquals()`，其中的 `asserter` 物件是 `JUnit4Asserter` 的執行個體。在 iOS 上，`Asserter` 型別的預設實作會與 Kotlin/Native 測試執行器搭配使用。

### 執行測試 {id="run-tests"}

您可以透過以下方式執行測試：

* 使用邊欄中的 **Run** 圖示執行 `shouldFindMatches()` 測試函式。
* 使用測試檔案的操作功能表執行該測試檔案。
* 使用邊欄中的 **Run** 圖示執行 `GrepTest` 測試類別。

還有一個便捷的快速鍵：<shortcut>⌃ ⇧ F10</shortcut>/<shortcut>Ctrl+Shift+F10</shortcut>。
無論您選擇哪種方式，都會看到用於執行測試的目標清單：

![執行測試任務](run-test-tasks.png){width=300}

對於 `android` 選項，測試會使用 JUnit 4 執行。對於 `iosSimulatorArm64`，Kotlin 編譯器會偵測測試註解並建立一個_測試二進位檔_，該檔案由 Kotlin/Native 自己的測試執行器執行。

以下是成功執行測試所產生的輸出範例：

![測試輸出](run-test-results.png){width=700}

## 處理更複雜的專案 {id="work-with-more-complex-projects"}

### 為通用程式碼編寫測試 {id="write-tests-for-common-code"}

您已經使用 `grep()` 函式建立了通用程式碼的測試。現在，讓我們考慮使用 `CurrentRuntime` 類別進行更進階的通用程式碼測試。此類別包含執行程式碼所在平台的詳細資訊。例如，對於在本地 JVM 上執行的 Android 單元測試，它可能具有值「OpenJDK」和「17.0」。

`CurrentRuntime` 的執行個體應使用平台的名稱與版本（字串形式）來建立，其中版本為可選項目。當版本存在時，您只需要字串開頭的數字（如果有的話）。

1. 在 `commonMain/kotlin` 目錄中，建立一個新的 `org.kmp.testing` 套件。
2. 在此套件中建立 `CurrentRuntime.kt` 檔案，並使用以下實作對其進行更新：

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
4. 在此套件中建立 `CurrentRuntimeTest.kt` 檔案，並使用以下與平台和架構無關的測試對其進行更新：

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

您可以使用 [IDE 中提供的](#run-tests)任何方式來執行此測試。

### 新增平台特定測試 {id="add-platform-specific-tests"}

> 為了簡潔明瞭，此處使用了 [expected 與 actual 宣告機制](multiplatform-connect-to-apis.md)。在更複雜的程式碼中，更好的方法是使用介面與工廠函式。
>
{style="note"}

現在您已經有了編寫通用程式碼測試的經驗，讓我們來探討如何為 Android 和 iOS 編寫平台特定測試。

若要建立 `CurrentRuntime` 的執行個體，請在通用的 `CurrentRuntime.kt` 檔案中宣告一個函式，如下所示：

```kotlin
expect fun determineCurrentRuntime(): CurrentRuntime
```

該函式應針對每個受支援的平台分別提供實作。否則，建置將會失敗。
除了在每個平台上實作此函式外，您還應該提供測試。讓我們為 Android 和 iOS 建立它們。

#### 適用於 Android {id="for-android"}

1. 在 `androidMain/kotlin` 目錄中，建立一個新的 `org.kmp.testing` 套件。
2. 在此套件中建立 `AndroidRuntime.kt` 檔案，並使用 expected 函式 `determineCurrentRuntime()` 的 actual 實作對其進行更新：

    ```kotlin
    actual fun determineCurrentRuntime(): CurrentRuntime {
        val name = System.getProperty("java.vm.name") ?: "Android"
    
        val version = System.getProperty("java.version")
    
        return CurrentRuntime(name, version)
    }
    ```

3. 在 `sharedLogic/src` 目錄中建立測試目錄：
 
   1. 在 `sharedLogic/src` 目錄上按一下滑鼠右鍵，然後選取 **New | Directory**。IDE 會顯示選項清單。
   2. 開始輸入 `androidHostTest/kotlin` 路徑以縮小選擇範圍，然後從清單中選取它：

      ![建立 Android 測試目錄](create-android-test-dir.png){width=350}

4. 在 `androidHostTest/kotlin` 目錄中，建立一個新的 `org.kmp.testing` 套件。
5. 在此套件中建立 `AndroidRuntimeTest.kt` 檔案，並使用以下 Android 測試對其進行更新。
   為了使測試通過，請確保設定執行階段的實際名稱與版本（但觀察測試如何失敗也很有幫助）：

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
   
Android 特定的測試在本機 JVM 上執行可能看起來有些奇怪。這是因為這些測試是作為本機單元測試在當前電腦上執行的。如 [Android Studio 文件](https://developer.android.com/studio/test/test-in-android-studio)中所述，這些測試不同於在裝置或模擬器上執行的檢測設備測試 (Instrumented tests)。

您可以在專案中新增其他類型的測試。若要了解檢測設備測試，請參閱這份 [Touchlab 指南](https://touchlab.co/understanding-and-configuring-your-kmm-test-suite/)。

#### 適用於 iOS {id="for-ios"}

1. 在 `iosMain/kotlin` 目錄中，建立一個新的 `org.kmp.testing` 目錄。
2. 在此目錄中建立 `IOSRuntime.kt` 檔案，並使用 expected 函式 `determineCurrentRuntime()` 的 actual 實作對其進行更新：

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
   2. 開始輸入 `iosTest/kotlin` 路徑以縮小選擇範圍，然後從清單中選取它。

4. 在 `iosTest/kotlin` 目錄中，建立一個新的 `org.kmp.testing` 目錄。
5. 在此目錄中建立 `IOSRuntimeTest.kt` 檔案，並使用以下 iOS 測試對其進行更新：

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

在此階段，您已擁有通用、Android 和 iOS 實作的程式碼及其測試。
專案中的目錄結構應該如下所示：

![整體專案結構](code-and-test-structure.png){width=300}

您可以從操作功能表執行單一測試或使用快速鍵。另一個選項是使用 Gradle 任務。例如，如果您執行 `allTests` Gradle 任務，專案中的每個測試都會使用對應的測試執行器來執行：

![Gradle 測試任務](gradle-alltests.png){width=700}

當您執行測試時，除了 IDE 中的輸出外，還會產生 HTML 報告。您可以在 `sharedLogic/build/reports/tests` 目錄中找到它們：

![多平台測試的 HTML 報告](shared-tests-folder-reports.png){width=300}

執行 `allTests` 任務並檢視其產生的報告：

* `allTests/index.html` 檔案包含通用測試和 iOS 測試的合併報告（iOS 測試相依於通用測試，並在其之後執行）。
* `testDebugUnitTest` 和 `testReleaseUnitTest` 資料夾包含兩種預設 Android 建置變體 (build flavors) 的報告。（目前，Android 測試報告不會自動與 `allTests` 報告合併。）

![多平台測試的 HTML 報告](multiplatform-test-report.png){width=700}

## 在多平台專案中使用測試的規則 {id="rules-for-using-tests-in-multiplatform-projects"}

您現在已在 Kotlin Multiplatform 應用程式中建立、設定並執行了測試。
在未來專案中處理測試時，請記住：

* 為通用程式碼編寫測試時，僅使用多平台程式庫（例如 [kotlin.test](https://kotlinlang.org/api/latest/kotlin.test/)）。將相依性新增至 `commonTest` 原始碼集中。
* 來自 `kotlin.test` API 的 `Asserter` 型別應僅間接使用。雖然 `Asserter` 執行個體是可見的，但您不需要在測試中直接使用它。
* 始終保持在測試程式庫的 API 範圍內。幸運的是，編譯器和 IDE 會防止您使用架構特定的功能。
* 雖然在 `commonTest` 中執行測試使用哪種架構並不重要，但最好使用您打算使用的每個架構來執行測試，以檢查開發環境是否設定正確。
* 考量物理層面的差異。例如，滾動慣性和摩擦力數值因平台和裝置而異，因此設定相同的滾動速度可能會導致不同的滾動位置。請始終在目標平台上測試元件以確保符合預期行為。
* 為平台特定程式碼編寫測試時，您可以使用相應架構的功能（例如註解和擴充套件）。
* 您既可以從 IDE 執行測試，也可以使用 Gradle 任務執行。
* 當您執行測試時，會自動產生 HTML 測試報告。

## 接續閱讀 {id="what-s-next"}

* 在[了解多平台專案結構](multiplatform-discover-project.md)中探索多平台專案的配置。
* [TestBalloon](https://infix-de.github.io/testBalloon/latest/) 是一個多平台測試架構，支援所有 Kotlin Multiplatform 目標以及 [Kotlin Power Assert](https://kotlinlang.org/docs/power-assert.html) 和其他斷言程式庫。
* [Kotest](https://kotest.io/) 是另一個多平台測試架構，允許以多種風格編寫測試，並支援常規測試的補充方法。其中包括[資料驅動](https://kotest.io/docs/framework/datatesting/data-driven-testing.html)和[基於屬性](https://kotest.io/docs/proptest/property-based-testing.html)的測試。