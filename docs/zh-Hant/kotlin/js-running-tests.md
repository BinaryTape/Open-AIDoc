[//]: # (title: 在 Kotlin/JS 中執行測試)

Kotlin 多平台 Gradle 外掛程式允許您透過各種測試執行器執行測試，這些執行器可以透過 Gradle 組建組態進行指定。

在 Kotlin/JS 中執行測試的一般工作流程為：新增測試相依性、在建置檔案中設定測試任務、新增測試，然後執行它們。

對於瀏覽器測試，您可以在下列兩者之間進行選擇：

* [Karma](https://karma-runner.github.io/) 測試執行器。
* 用於瀏覽器測試的新 DSL。

> Karma 專案已被[棄用](https://github.com/karma-runner/karma#karma)。預計不會再有新功能或錯誤修復。作為替代方案，請嘗試用於瀏覽器測試的新 Kotlin DSL。
>
> 用於瀏覽器測試的新 DSL 目前處於[實驗階段](components-stability.md#stability-levels-explained)。它隨時可能會有所變更。需要使用 `@OptIn(ExperimentalJsTestDsl::class)` 註解選擇加入 (Opt-in)。
>
{style="warning"}

## 新增測試相依性 {id="add-test-dependencies"}

當您建立多平台專案時，可以使用 `commonTest` 中的單個相依性，將測試相依性新增至所有原始碼集（包括 JavaScript 目標）：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
// build.gradle.kts
kotlin {
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test")) // 這讓測試註解和功能在 JS 中可用
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
// build.gradle
kotlin {
    sourceSets {
        commonTest {
            dependencies {
                implementation kotlin("test") // 這讓測試註解和功能在 JS 中可用
            }
        }
    }
}
```

</tab>
</tabs>

## 設定瀏覽器 {id="configure-browsers"}

您可以在 Kotlin/JS 中針對特定瀏覽器執行測試。若要執行此操作，請調整 Gradle 建置檔案中 `browser {}` 設定區塊內的設定。

預設情況下，此外掛程式使用 [Headless Chrome](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md) 來執行瀏覽器測試。預設情況下，Kotlin 多平台 Gradle 外掛程式並未隨附任何瀏覽器。若要啟用其他瀏覽器，請針對 Karma 使用 `testTask {}` 區塊，針對用於瀏覽器測試的新 DSL 使用 `test {}` 區塊。在此查看所有可用選項：

<tabs group="js-test-dsl">
<tab title="Karma" group-key="karma">

```kotlin
kotlin {
    js {
        browser {
            testTask {
                useKarma {
                    useIe()
                    useSafari()
                    useFirefox()
                    useChrome()
                    useChromeCanary()
                    useChromeHeadless()
                    usePhantomJS()
                    useOpera()
                }
            }
        }
    }
}
```

使用 Karma 時，您需要在目標系統（本機或 CI 中）上安裝所有必要的瀏覽器。

有關 Karma 功能的詳細資訊，請參閱[設定 Kotlin/JS 專案](js-project-setup.md#karma)。

</tab>
<tab title="用於瀏覽器測試的 DSL" group-key="Browser-test-dsl">

```kotlin
import org.jetbrains.kotlin.gradle.ExperimentalJsTestDsl

kotlin {
    js {
        browser {
            @OptIn(ExperimentalJsTestDsl::class)
            test {
                chromium()
                firefox()
                webkit() // Safari 瀏覽器
            }
        }
    }
}
```

使用瀏覽器測試的新 DSL 時，Kotlin 多平台 Gradle 外掛程式會在首次執行時使用 [`playwright install`](https://playwright.dev/docs/browsers#install-browsers) 指令安裝必要的瀏覽器。隨後 Playwright 會管理這些瀏覽器的位置，且不會使用本機安裝的瀏覽器。

有關用於瀏覽器測試的新 DSL 中可用的其他設定，請參閱[進階設定](#advanced-configuration)。

</tab>
</tabs>

## 新增測試 {id="add-a-test"}

若要檢查測試是否正確執行，請建立包含以下內容的檔案 `src/jsTest/kotlin/AppTest.kt`：

```kotlin
import kotlin.test.Test
import kotlin.test.assertEquals

@Test
fun thingsShouldWork() {
    assertEquals(listOf(3,2,1), listOf(1,2,3).reversed())
}

@Test
fun thingsShouldBreak() {
    assertEquals(listOf(1,2,3), listOf(1,2,3).reversed())
}
```

## 執行測試 {id="run-tests"}

若要在瀏覽器中執行測試，請執行 `jsBrowserTest` 任務，或使用 IntelliJ IDEA 中的裝訂邊圖示來執行全部或個別測試：

![Gradle browserTest 任務](browsertest-task.png){width=700}

或者，如果您想透過命令列執行測試，請使用 Gradle 包裝函式：

```bash
./gradlew jsBrowserTest
```

在 IntelliJ IDEA 中執行測試後，**執行**工具視窗將顯示測試結果。您可以點擊失敗的測試以查看其堆疊追蹤，並透過按兩下跳轉到對應的測試實作。

![IntelliJ IDEA 中的測試結果](test-stacktrace-ide.png){width=700}

在每次測試執行後，無論您如何執行測試，都可以在 `build/reports/tests/jsBrowserTest/index.html` 中找到由 Gradle 產生的格式正確的測試報告。在瀏覽器中開啟此檔案以查看測試結果的另一個總覽：

![Gradle 測試摘要](test-summary.png){width=700}

如果您使用上述程式碼片段中顯示的範例測試集，則一個測試會通過，另一個測試會失敗，這會導致 50% 的成功率。若要獲取有關個別測試案例的更多資訊，請使用提供的連結：

![Gradle 摘要中失敗測試的堆疊追蹤](failed-test.png){width=700}

## 進階設定 {id="advanced-configuration"}
<primary-label ref="experimental-opt-in"/>

> 本節僅適用於用於瀏覽器測試的新實驗性 DSL。
>
{style="note"}

用於瀏覽器測試的新 DSL 旨在實現極簡化且與工具無關。目前的實作包含：

* [Playwright](https://playwright.dev/) 作為瀏覽器驅動程式與發行版本管理器，支援 Chromium、Firefox 和 WebKit (Safari) 瀏覽器引擎。
* [Mocha](https://mochajs.org/) 作為測試執行器。
* [webpack](https://webpack.js.org/) 作為打包器（將在[未來的版本](https://youtrack.jetbrains.com/issue/KT-48308/)中替換為 [Vite](https://vite.dev/)）。

該 DSL 將逾時、無頭模式和個別執行器選項公開為 Gradle 屬性，因此您可以在各執行器之間共用預設值、為特定瀏覽器覆寫它們，並使用 provider 延遲計算值：

```kotlin
import org.jetbrains.kotlin.gradle.ExperimentalJsTestDsl
import kotlin.time.Duration.Companion.seconds

kotlin {
    js {
        browser {
            @OptIn(ExperimentalJsTestDsl::class)
            test {
                // 使用 kotlin.Duration 設定所有執行器的預設逾時
                timeout = 30.seconds

                // 使用 Gradle provider 設定無頭模式
                headless = providers
                    .environmentVariable("IS_IN_CI")
                    .map { it.toBoolean() }
                    .orElse(false)

                // 啟用並使用自訂名稱設定 Chromium 執行器
                chromium("chromium-no-webgl2") {
                    // 覆寫此執行器的預設逾時
                    timeout = 10.seconds

                    // Chromium 專屬的額外啟動引數
                    launchArgs.add("--disable-webgl2")
                }

                // 啟用 Firefox 執行器
                firefox()

                // 啟用並設定 WebKit 執行器
                webkit("safari") {
                    timeout = 35.seconds
                }
            }
        }
    }
}
```

您可以直接在 `test {}` 區塊中為所有測試執行器設定選項。若要為特定執行器覆寫這些通用選項，請為其使用自訂名稱，並在該執行器區塊內部提供不同的值。在此範例中，Chromium 和 WebKit (Safari) 瀏覽器分別使用 10 秒和 35 秒的逾時，而 Firefox 則使用通用逾時 30 秒。

每個執行器都以各自的名稱註冊，因此測試報告會告訴您特定結果來自哪一個瀏覽器。

## 外掛程式作者的設定 {id="configuration-for-plugin-authors"}
<primary-label ref="experimental-opt-in"/>

> 本節僅適用於用於瀏覽器測試的新實驗性 DSL。
>
{style="note"}

如果您在 Kotlin 多平台 Gradle 外掛程式之上編寫 Gradle 外掛程式，用於瀏覽器測試的新 DSL 還能讓您存取瀏覽器執行器以及產生的測試 bundle 的位置。

Kotlin 會使用預設的[測試執行器頁面](https://github.com/Kotlin/kotlin-web-helpers/blob/main/static/test.html)產生用於執行瀏覽器測試的測試 bundle。您可以透過在 `testsLocation` 屬性中指向不同的位置來取代它：

```kotlin
kotlin {
    js {
        browser {
            @OptIn(ExperimentalJsTestDsl::class)
            test {
                // 實作 customJsTestsLocation 以修改或取代預設的 JS 測試 bundle
                @OptIn(DelicateKotlinGradlePluginApi::class)
                testsLocation = customJsTestsLocation(extendFrom = defaultTestsLocationProvider)

                chromium()
            }
        }
    }
}
```

您的自訂測試打包器可以包含您自己的開發伺服器、打包器或測試執行器。`defaultTestsLocationProvider` 屬性允許您存取預設位置，因此您可以以此為基礎進行建構，而無需從頭開始實作所有內容。

每個測試位置都透過 `KotlinJsTestsLocation` 介面公開包含產生的測試 bundle 的目錄 (`bundleLocation`)、測試頁面的名稱 (`testHtmlFileName`) 以及瀏覽器開啟的 URL (`url`)。

透過存取這些 API，您可以：

* 自訂瀏覽器開啟的 URL。每個瀏覽器執行器都有其獨立的測試位置，因此您可以在 `test {}` 區塊中為所有執行器進行覆寫，也可以針對特定執行器進行覆寫。
* 覆寫 bundle 位置本身，例如向 bundle 新增額外檔案。
* 對產生的測試 bundle 進行後續處理。註冊您自己的任務，並在瀏覽器開啟這些檔案之前對其進行修改，例如將您自己的設定注入到 `test.html` 中。

使用這些 API 建置外掛程式時，請牢記以下限制：

* 設定 `subtarget.test` 會啟用新的測試管線並停用 Karma。目前沒有可靠的方法來偵測使用者選擇了哪種管線。
* 沒有可靠的方法可以延遲設定特定的瀏覽器執行器，因此設定必須在 `afterEvaluate` 中進行。建議考慮要求使用者明確設定測試位置，或者公開裝飾函式（例如 `myPluginChromium()`）。

## 提供回饋 {id="leave-feedback"}

用於瀏覽器測試的新 DSL 正處於積極開發階段。我們計劃在接下來的 Kotlin 版本中推出新功能，例如偵錯。

歡迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-66897) 或 [#javascript](https://kotlinlang.slack.com/archives/C0B8L3U69) Slack 頻道中提供您的回饋。