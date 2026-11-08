[//]: # (title: 設定 Kotlin/JS 專案)

Kotlin/JS 專案使用 Gradle 作為建構系統。為了讓開發人員能輕鬆管理其 Kotlin/JS 專案，我們提供了 `kotlin.multiplatform` Gradle 外掛程式，該外掛程式提供專案配置工具以及用於自動化 JavaScript 開發常見常式的幫助任務。

該外掛程式會在背景使用 [npm](https://www.npmjs.com/) 或 [Yarn](https://yarnpkg.com/) 封裝管理員下載 npm 相依性，並使用 [webpack](https://webpack.js.org/) 從 Kotlin 專案建置 JavaScript bundle。
相依性管理和配置調整很大程度上可以直接在 Gradle 建置檔中完成，並可選擇覆寫自動產生的配置以獲得完全掌控權。

你可以手動在 `build.gradle(.kts)` 檔案中將 `org.jetbrains.kotlin.multiplatform` 外掛程式套用至 Gradle 專案：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</tab>
</tabs>

Kotlin Multiplatform Gradle 外掛程式可讓你在建置指令碼的 `kotlin {}` 區塊中管理專案的各個層面：

```groovy
kotlin {
    // ...
}
```

在 `kotlin {}` 區塊內，你可以管理以下各項：

* [目標執行環境](#execution-environments)：瀏覽器或 Node.js 
* [設定 ECMAScript 目標](#set-an-ecmascript-target)：ES5、ES2015 或 ES2020
* [配置輸出粒度](#configure-output-granularity)
* [產生 TypeScript 宣告檔](#generation-of-typescript-declaration-files-d-ts)
* [專案相依性](#dependencies)：Maven 與 npm
* [執行配置](#run-task)
* [測試配置](#test-task)
* 適用於瀏覽器專案的[打包](#webpack-bundling)與 [CSS 支援](#css)
* [目標目錄](#distribution-target-directory)與[模組名稱](#module-name)
* [專案的 `package.json` 檔案](#package-json-customization)

## 執行環境 {id="execution-environments"}

Kotlin/JS 專案可以鎖定兩種不同的執行環境：

* 用於瀏覽器中用戶端指令碼的 Browser
* 用於在瀏覽器外執行 JavaScript 程式碼（例如伺服器端指令碼）的 [Node.js](https://nodejs.org/)。

若要為 Kotlin/JS 專案定義目標執行環境，請新增包含 `browser {}` 或 `nodejs {}` 的 `js {}` 區塊：

```kotlin
kotlin {
    js {
        browser {
        }
        binaries.executable()
    }
}
```

指示詞 `binaries.executable()` 明確指示 Kotlin 編譯器發出可執行的 `.js` 檔案。
省略 `binaries.executable()` 將導致編譯器僅產生 Kotlin 內部程式庫檔案，這些檔案可供其他專案使用，但無法單獨執行。

> 這通常比建立可執行檔更快，
> 在處理專案的非分葉模組（non-leaf modules）時是一種可行的最佳化手段。
>
{style="tip"}

Kotlin Multiplatform 外掛程式會自動為所選環境配置對應的任務。
這包括下載並安裝執行與測試應用程式所需的環境與相依性。
這讓開發人員無需額外配置即可建置、執行和測試簡單專案。也可以選擇使用現有安裝。了解如何[使用預先安裝的 Node.js](#use-pre-installed-node-js)。

## 設定 ECMAScript 目標 {id="set-an-ecmascript-target"}

Kotlin/JS 可針對 ES5、ES2015 和 ES2020 版本的 ECMAScript 標準產生 JavaScript。請選擇目標環境支援的最新版本：

* `es5` 提供與舊版 JavaScript 環境的相容性，並且是預設目標。
* `es2015` 啟用對 ES2015 功能的支援，包括：
    * 簡化程式碼庫並提高可維護性的模組。
    * 允許融入物件導向程式設計（OOP）原則的類別，從而產生更簡潔直觀的程式碼。
    * 用於編譯 [suspend 函式](https://kotlinlang.org/docs/composing-suspending-functions.html)的產生器（Generators），可改善最終套件大小並有助於偵錯。
    * [JavaScript 程式碼內嵌](js-interop.md#inline-javascript)。
* `es2020` 包含所有受支援的 ES2015 功能，並允許編譯器在產生的 JavaScript 程式碼中使用 ECMAScript 2020 功能。例如，它會將 Kotlin 的 `Long` 值編譯為 JavaScript 的 `BigInt` 值。

若要配置 ECMAScript 目標，請在 `build.gradle(.kts)` 檔案中設定 `target` 屬性。例如，要鎖定 ES2020：

```kotlin
tasks.withType<KotlinJsCompile>().configureEach {
    compilerOptions {
        target = "es2020"
    }
}
```

深入了解 [ES5](https://262.ecma-international.org/5.1/)、[ES2015](https://262.ecma-international.org/6.0/) 與 [ES2020](https://262.ecma-international.org/11.0/) 標準。

## 配置輸出粒度 {id="configure-output-granularity"}

你可以選擇編譯器在專案中輸出 `.js` 檔案的方式：

* **每個模組一個檔案（One per module）**。預設情況下，JS 編譯器會為每個專案模組輸出獨立的 `.js` 檔案作為編譯結果。
* **每個專案一個檔案（One per project）**。你可以透過在 `gradle.properties` 檔案中新增以下這行，將整個專案編譯成單一 `.js` 檔案：

  ```properties
  # Default: per-module
  kotlin.js.ir.output.granularity=whole-program
  ```

* **每個檔案一個（One per file）**。你可以設定更細緻的輸出，為每個 Kotlin 檔案產生一個（如果該檔案包含匯出的宣告，則為兩個）JavaScript 檔案。若要啟用逐檔案編譯模式：
  1. 將 `es2015` 或 `es2020` 設為[編譯目標](#set-an-ecmascript-target)，以在專案中支援 ES2015 功能。
  2. 在 `gradle.properties` 檔案中新增以下這行：
  
     ```properties
     # Default: per-module
     kotlin.js.ir.output.granularity=per-file
     ```

## 產生 TypeScript 宣告檔 (`d.ts`) {id="generation-of-typescript-declaration-files-d-ts"}
<primary-label ref="experimental-opt-in"/>

Kotlin/JS 編譯器可從你的 Kotlin 程式碼產生 TypeScript 定義檔。在處理混合應用程式時，JavaScript 工具與 IDE 可以使用這些定義來：

* 提供自動補全
* 支援靜態分析器
* 簡化在 JavaScript 與 TypeScript 專案中新增 Kotlin 程式碼的過程

產生 TypeScript 定義對於[共用商業邏輯的使用案例](js-overview.md#use-cases-for-kotlin-js)特別有價值。

編譯器會收集標記有 [`@JsExport`](js-to-kotlin-interop.md#jsexport-annotation) 的任何最頂層宣告，並自動在 `.d.ts` 檔案中產生 TypeScript 定義。

若要產生 TypeScript 定義，必須在 Gradle 建置檔中明確配置。
在 `build.gradle.kts` 檔案的 [`js {}` 區塊](js-project-setup.md#execution-environments)中新增 `generateTypeScriptDefinitions()` 函式：

```kotlin
kotlin {
    js {
        binaries.executable()
        browser {
        }
        generateTypeScriptDefinitions()
    }
}
```

你可以在 `build/js/packages/<package_name>/kotlin` 目錄中找到這些定義，它們位於對應的未經 webpack 處理的 JavaScript 程式碼旁。

## 相依性 {id="dependencies"}

若要宣告相依性，請在 `build.gradle(.kts)` 檔案的 `jsMain` 原始碼集中使用 `dependencies {}` 區塊：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        jsMain {
            dependencies {
                implementation("org.example.myproject:1.1.0")
            }
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        jsMain {
            dependencies {
                implementation 'org.example.myproject:1.1.0'
            }
        }
    }
}
```

</tab>
</tabs>

只有包含適用於 Kotlin/JS 構件的程式庫才能用作相依性。若要解析相依性，請在 `build.gradle(.kts)` 檔案的 `repositories {}` 區塊中宣告 Gradle 應該在哪裡尋找它們。例如：

```kotlin
repositories {
    mavenCentral()
}
```

如果你新增的程式庫具有對 [npm 套件](#npm-dependencies)的相依性，Gradle 也會自動解析這些傳遞相依性。

### Kotlin 標準程式庫 {id="kotlin-standard-libraries"}

對[標準程式庫](https://kotlinlang.org/api/latest/jvm/stdlib/index.html)的相依性會自動加入。標準程式庫的版本與 Kotlin Multiplatform 外掛程式的版本相同。

針對多平台測試，可以使用 [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) API。建立多平台專案時，可以在 `commonTest` 中使用單一相依性，將測試相依性新增至所有原始碼集：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test")) // Brings all the platform dependencies automatically
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        commonTest {
            dependencies {
                implementation kotlin("test") // Brings all the platform dependencies automatically
            }
        }
    }
}
```

</tab>
</tabs>

### npm 相依性 {id="npm-dependencies"}

在 JavaScript 領域中，最常見的相依性管理方式是 [npm](https://www.npmjs.com/)。
它提供了最大的 JavaScript 模組公共存儲庫。

Kotlin Multiplatform Gradle 外掛程式可讓你在 Gradle 建置指令碼中宣告 npm 相依性，就像宣告任何其他相依性一樣。

若要宣告 npm 相依性，請在相依性宣告中將其名稱與版本傳入 `npm()` 函式。
你也可以根據 [npm 的語意化版本（semver）語法](https://docs.npmjs.com/about-semantic-versioning)指定一個或多個版本範圍。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        jsMain {
            dependencies {
                implementation(npm("core-js", "^3.38.1"))
            }
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        jsMain {
            dependencies {
                implementation npm('core-js', '^3.38.1')
            }
        }
    }
}
```

</tab>
</tabs>

預設情況下，外掛程式使用獨立的 [Yarn](https://yarnpkg.com/lang/en/) 封裝管理員執行個體來下載並安裝 npm 相依性。它開箱即用，無需額外配置，但你可以[根據具體需求進行調整](#yarn)。

你也可以改為直接使用 [npm](https://www.npmjs.com/) 封裝管理員來處理 npm 相依性。
若要使用 npm 作為你的封裝管理員，請在 `gradle.properties` 檔案中設定以下屬性：

```none
kotlin.js.yarn=false
```

除了一般相依性之外，還可以從 Gradle DSL 中使用另外三種類型的相依性。
若要進一步了解每種類型相依性的最佳使用時機，請參閱 npm 連結的官方文件：

* [devDependencies](https://docs.npmjs.com/files/package.json#devdependencies)，透過 `devNpm(...)`，
* [optionalDependencies](https://docs.npmjs.com/files/package.json#optionaldependencies)，透過 `optionalNpm(...)`，以及
* [peerDependencies](https://docs.npmjs.com/files/package.json#peerdependencies)，透過 `peerNpm(...)`。

安裝 npm 相依性後，你可以按照[從 Kotlin 呼叫 JS](js-interop.md) 中所述在其程式碼中使用其 API。

## run 任務 {id="run-task"}

Kotlin Multiplatform Gradle 外掛程式提供了 `jsBrowserDevelopmentRun` 任務，讓你無需額外配置即可執行純 Kotlin/JS 專案。

對於在瀏覽器中執行 Kotlin/JS 專案，此任務是 `browserDevelopmentRun` 任務（該任務在 Kotlin 多平台專案中也可用）的別名。它使用 [webpack-dev-server](https://webpack.js.org/configuration/dev-server/) 來提供你的 JavaScript 構件服務。
如果你想要自訂 `webpack-dev-server` 使用的配置，例如調整伺服器執行的連接埠，請使用 [webpack 設定檔](#webpack-bundling)。

若要執行以 Node.js 為目標的 Kotlin/JS 專案，請使用作為 `nodeRun` 任務別名的 `jsNodeDevelopmentRun` 任務。

若要執行專案，請執行標準生命週期任務 `jsBrowserDevelopmentRun`，或其對應的別名：

```bash
./gradlew jsBrowserDevelopmentRun
```

若要在修改原始程式碼檔案後自動觸發應用程式的重新建置，請使用 Gradle 的[持續建置（continuous build）](https://docs.gradle.org/current/userguide/command_line_interface.html#sec:continuous_build)功能：

```bash
./gradlew jsBrowserDevelopmentRun --continuous
```

或 

```bash
./gradlew jsBrowserDevelopmentRun -t
```

專案建置成功後，`webpack-dev-server` 將自動重新整理瀏覽器頁面。

## test 任務 {id="test-task"}

Kotlin Multiplatform Gradle 外掛程式會自動為專案設定測試基礎結構。它會下載並安裝所需的測試執行器與其他相依性。

對於瀏覽器專案，你可以在 [Karma](#karma) 測試執行器和新的[瀏覽器測試專用 DSL](#dsl-for-browser-testing) 之間進行選擇。
對於 Node.js 專案，可以使用 [Mocha](#node-js) 測試架構。

該外掛程式還提供實用的測試功能，例如：

* 原始碼對應檔產生
* 測試報告產生
* 主控台中的測試執行結果

### Karma {id="karma"}

> Karma 專案已[被棄用](https://github.com/karma-runner/karma#karma)。預期不會再有新功能或錯誤修復。作為瀏覽器測試的替代方案，請嘗試新的[瀏覽器測試專用 DSL](#dsl-for-browser-testing)。
> 
{style="warning"}

若要配置 [Karma](https://karma-runner.github.io/) 測試執行器，請在 `build.gradle(.kts)` 檔案中的瀏覽器 `testTask` 內新增 `useKarma {}` 區塊。例如，若要在特定瀏覽器中執行測試，請使用：

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
        binaries.executable()
        // ...
    }
}
```

或者，你可以在 `gradle.properties` 檔案中新增瀏覽器的測試目標：

```text
kotlin.js.browser.karma.browsers=firefox,safari
```

這可讓你為所有模組定義瀏覽器清單，然後在特定模組的建置檔案中新增特定瀏覽器。

Kotlin Multiplatform Gradle 外掛程式會在建置時自動於 `build/js/packages/projectName-test/karma.conf.js` 產生 Karma 設定檔。該檔案包含你在建置檔的 `useKarma {}` 區塊中指定的設定。

你也可以在專案根目錄的 `karma.config.d` 目錄中放置額外的設定檔。
該目錄中的所有 `.js` 設定檔都會在建置時被自動讀取並合併至產生的 `karma.conf.js` 中。

有關 Karma 配置的更多資訊，請參閱 [Karma 官方文件](https://karma-runner.github.io/6.4/config/configuration-file.html)。

### 瀏覽器測試專用 DSL {id="dsl-for-browser-testing"}
<primary-label ref="experimental-opt-in"/>

Kotlin 提供了一種實驗性的 DSL，用於在瀏覽器環境中執行 Kotlin/JS 測試。它的設計與具體技術無關。
目前的實作底層包含以下工具：

* [Playwright](https://playwright.dev/) 作為瀏覽器驅動程式與發行版本管理器，支援 Chromium、Firefox 和 WebKit (Safari) 瀏覽器引擎。
* [Mocha](https://mochajs.org/) 作為測試執行器。
* [webpack](https://webpack.js.org/) 作為打包工具（在[未來版本](https://youtrack.jetbrains.com/issue/KT-48308/)中將替換為 [Vite](https://vite.dev/)）。

若要嘗試新的瀏覽器測試 DSL，請在 Kotlin/JS 目標的 `browser {}` 內新增需 opt-in 的 `test {}` 區塊：

```kotlin
import org.jetbrains.kotlin.gradle.ExperimentalJsTestDsl
import kotlin.time.Duration.Companion.seconds

kotlin {
    js {
        browser {
            @OptIn(ExperimentalJsTestDsl::class)
            test {
                // Configures the default timeout for all runners with kotlin.Duration
                timeout = 30.seconds
                // Configures headless mode using Gradle providers
                headless = providers
                    .environmentVariable("IS_IN_CI")
                    .map { it.toBoolean() }
                    .orElse(false)
                // Enables and configures a custom Chromium runner
                chromium("chromium-no-webgl2") {
                    // Overrides the default timeout for this runner
                    timeout = 10.seconds

                    // Chromium-specific extra launch argument
                    launchArgs.add("--disable-webgl2")
                }
                // Enables the Firefox runner
                firefox()
                // Enable WebKit (Safari) test runner
                webkit()
                // Enables and configures a custom WebKit runner
                webkit("headful") {
                    headless = false
                }
            }
        }
    }
}
```

有關新瀏覽器測試 DSL 配置的更多資訊，請參閱[在 Kotlin/JS 中執行測試](js-running-tests.md#advanced-configuration)。

### Node.js {id="node-js-test-task"}

對於 Node.js 專案，Kotlin Multiplatform Gradle 外掛程式會自動設定 [Mocha](https://mochajs.org/) 測試架構。

若要指定 Node.js 測試執行器使用的環境變數（例如將外部資訊傳遞給測試，或微調套件解析），請在建置檔的 `testTask {}` 區塊中使用帶有鍵值組的 `environment()` 函式：

```kotlin
kotlin {
    js {
        nodejs {
            testTask {
                environment("key", "value")
            }
        }
    }
}
```

### 執行測試 {id="run-tests"}

預設情況下，Kotlin Multiplatform Gradle 外掛程式使用 [Headless Chrome](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md) 來執行瀏覽器測試。外掛程式未隨附任何瀏覽器；測試執行器對缺少瀏覽器的處理方式有所不同：

* 使用 [Karma](#karma) 時，電腦上應已安裝任何其他瀏覽器，以便外掛程式可以使用它來執行測試。如果你在持續整合伺服器上執行 Kotlin/JS 測試，請確保其上也安裝了你想要測試的瀏覽器。
* 使用新的[瀏覽器測試專用 DSL](#dsl-for-browser-testing) 時，外掛程式會在首次執行時透過 [`playwright install`](https://playwright.dev/docs/browsers#install-browsers) 指令安裝必要的瀏覽器。Playwright 會管理這些瀏覽器的位置，不會使用本機安裝的瀏覽器。

若要執行測試，請執行標準生命週期任務 `check`：

```bash
./gradlew check
```

如果要跳過測試，可以在建置檔的 `testTask {}` 區塊中將其停用：

```kotlin
kotlin {
    js {
        browser {
            testTask {
                enabled.set(false)
            }
        }
        binaries.executable()
        // ...
    }
}
```

## webpack 打包 {id="webpack-bundling"}

對於瀏覽器目標，Kotlin Multiplatform Gradle 外掛程式使用廣為人知的 [webpack](https://webpack.js.org/) 模組打包工具。

### webpack 任務 {id="webpack-task"}

最常見的 webpack 調整可以直接透過 Gradle 建置檔中的 `kotlin.js.browser.webpackTask {}` 配置區塊完成：
* `mainOutputFileName` − 經過 webpack 處理後的輸出檔案名稱。執行 webpack 任務後，它將產生在 `<projectDir>/build/kotlin-webpack/<targetName>/<binaryName>` 中。預設值為專案名稱。
* `output.libraryTarget` − webpack 輸出的模組系統。進一步了解[適用於 Kotlin/JS 專案的可用模組系統](js-modules.md)。預設值為 `umd`。
  
```groovy
webpackTask {
    mainOutputFileName = "mycustomfilename.js"
    output.libraryTarget = "commonjs2"
}
```

你也可以在 `commonWebpackConfig {}` 區塊中配置通用 webpack 設定，以用於打包、執行和測試任務。

### webpack 設定檔 {id="webpack-configuration-file"}

Kotlin Multiplatform Gradle 外掛程式會在建置時自動產生標準的 webpack 設定檔。它位於 `build/js/packages/projectName/webpack.config.js`。

如果你想進一步調整 webpack 配置，請將額外的設定檔放置在專案根目錄下名為 `webpack.config.d` 的目錄中。建置專案時，所有 `.js` 設定檔都會自動合併到 `build/js/packages/projectName/webpack.config.js` 檔案中。
例如，若要新增新的 [webpack loader](https://webpack.js.org/loaders/)，請在 `webpack.config.d` 目錄下的 `.js` 檔案中新增以下內容：

> 在這種情況下，配置物件為全域物件 `config`。你需要在指令碼中對其進行修改。
>
{style="note"}

```groovy
config.module.rules.push({
    test: /\.extension$/,
    loader: 'loader-name'
});
```

所有 webpack 配置功能在其[官方文件](https://webpack.js.org/concepts/configuration/)中皆有詳盡說明。

### 建置可執行檔 {id="building-executables"}

為了透過 webpack 建置可執行的 JavaScript 構件，Kotlin Multiplatform Gradle 外掛程式包含了 `jsBrowserDevelopmentWebpack` 和 `jsBrowserProductionWebpack` Gradle 任務。

* `jsBrowserDevelopmentWebpack` 會建立開發構件，這些構件體積較大但建立時間短。
因此，在主動開發期間請使用 `jsBrowserDevelopmentWebpack` 任務。
* `jsBrowserProductionWebpack` 會對產生的構件套用無效程式碼消除（dead code elimination）並縮減產生的 JavaScript 檔案，這需要更多時間但產生的可執行檔更小。因此，在準備將專案用於實際環境時，請使用 `jsBrowserProductionWebpack` 任務。
 
執行任一任務即可取得用於開發或正式環境的相應構件。除非[另有指定](#distribution-target-directory)，否則產生的檔案將位於 `build/kotlin-webpack`。

```bash
./gradlew jsBrowserProductionWebpack
```

請注意，只有當你的目標配置為產生可執行檔時（透過 `binaries.executable()`），這些任務才可用。

若要在 `build/dist/<targetName>/<binaryName>` 目錄中產生發布版本，請改為執行 `jsBrowserDistribution` 任務：

```bash
./gradlew jsBrowserDistribution
```

此任務會產生包含專案資源的立即可用發行版本。

## CSS {id="css"}

Kotlin Multiplatform Gradle 外掛程式還支援 webpack 的 [CSS](https://webpack.js.org/loaders/css-loader/) 與 [style](https://webpack.js.org/loaders/style-loader/) 載入器（loaders）。雖然可以透過直接修改用於建置專案的 [webpack 設定檔](#webpack-bundling)來更改所有選項，但最常用的設定可以直接從 `build.gradle(.kts)` 檔案中取得。

若要在專案中開啟 CSS 支援，請在 Gradle 建置檔的 `commonWebpackConfig {}` 區塊中設定 `cssSupport.enabled` 選項。使用精靈建立新專案時，此配置預設也是啟用的。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
browser {
    commonWebpackConfig {
        cssSupport {
            enabled.set(true)
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
browser {
    commonWebpackConfig {
        cssSupport {
            it.enabled = true
        }
    }
}
```

</tab>
</tabs>

或者，你可以為 `webpackTask {}`、`runTask {}` 和 `testTask {}` 分別獨立新增 CSS 支援：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
browser {
    webpackTask {
        cssSupport {
            enabled.set(true)
        }
    }
    runTask {
        cssSupport {
            enabled.set(true)
        }
    }
    testTask {
        useKarma {
            // ...
            webpackConfig.cssSupport {
                enabled.set(true)
            }
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
browser {
    webpackTask {
        cssSupport {
            it.enabled = true
        }
    }
    runTask {
        cssSupport {
            it.enabled = true
        }
    }
    testTask {
        useKarma {
            // ...
            webpackConfig.cssSupport {
                it.enabled = true
            }
        }
    }
}
```

</tab>
</tabs>

在專案中啟用 CSS 支援有助於防止嘗試從未配置的專案中使用樣式表時發生的常見錯誤，例如 `Module parse failed: Unexpected character '@' (14:0)`。

你可以使用 `cssSupport.mode` 來指定應如何處理遇到的 CSS。可以使用以下值：

* `"inline"`（預設）：樣式將新增至全域 `<style>` 標籤中。
* `"extract"`：樣式會擷取到單獨的檔案中。然後可以從 HTML 頁面中引入它們。
* `"import"`：樣式作為字串處理。如果你需要從程式碼中存取 CSS，這會很有用（例如 `val styles = require("main.css")`）。

若要在同一專案中使用不同模式，請使用 `cssSupport.rules`。在此處，你可以指定 `KotlinWebpackCssRules` 清單，每個規則定義一種模式以及 [include](https://webpack.js.org/configuration/module/#ruleinclude) 和 [exclude](https://webpack.js.org/configuration/module/#ruleexclude) 模式。

## Node.js {id="node-js"}

對於以 Node.js 為目標的 Kotlin/JS 專案，外掛程式會自動在主機上下載並安裝 Node.js 環境。如果已安裝 Node.js 執行個體，你也可以直接使用現有的。

你可以為每個子專案配置 Node.js 設定，也可以將其套用至整個專案。

### 更改 Node.js 版本 {id="change-node-js-version"}

目前的預設 Node.js 版本為 24.16.0，但你可以為特定子專案使用不同的版本。
請在子專案的 `build.gradle(.kts)` 檔案中新增以下內容。例如：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
    project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().version = "26.2.0"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
project.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin) {
    project.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec).version = "26.2.0"
}
```

</tab>
</tabs>

若要為整個專案（包括所有子專案）設定版本，請將相同的程式碼套用至 `allprojects {}` 區塊。例如：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
allprojects {
    project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
        project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().version = "26.2.0"
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
allprojects {
    project.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin) {
        project.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec).version = "26.2.0"
    }
}
```

</tab>
</tabs>

### 使用預先安裝的 Node.js {id="use-pre-installed-node-js"}

如果建置 Kotlin/JS 專案的主機上已安裝 Node.js，你可以配置 Kotlin Multiplatform Gradle 外掛程式直接使用它，而不是安裝其自帶的 Node.js 執行個體。

若要使用預先安裝的 Node.js 執行個體，請在 `build.gradle(.kts)` 檔案中新增以下內容：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
    // Set to `true` for default behavior
    project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().download = false
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
project.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin) {
    // Set to `true` for default behavior
    project.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec).download = false
}
```

</tab>
</tabs>

## Yarn {id="yarn"}

預設情況下，為了在建置時下載並安裝宣告的相依性，該外掛程式會管理其專屬的 [Yarn](https://yarnpkg.com/lang/en/) 封裝管理員執行個體。它開箱即用，無需額外配置，但你可以對其進行微調或使用主機上已安裝的 Yarn。

### 其他 Yarn 功能：.yarnrc {id="additional-yarn-features-yarnrc"}

若要配置其他 Yarn 功能，請在專案根目錄中放置 `.yarnrc` 檔案。
在建置時，它會被自動讀取。

例如，若要對 npm 套件使用自訂 registry，請在專案根目錄名為 `.yarnrc` 的檔案中新增以下內容：

```text
registry "http://my.registry/api/npm/"
```

若要深入了解 `.yarnrc`，請造訪 [Yarn 官方文件](https://classic.yarnpkg.com/en/docs/yarnrc/)。

### 使用預先安裝的 Yarn {id="use-pre-installed-yarn"}

如果建置 Kotlin/JS 專案的主機上已安裝 Yarn，你可以配置 Kotlin Multiplatform Gradle 外掛程式直接使用它，而不是安裝其自帶的 Yarn 執行個體。

若要使用預先安裝的 Yarn 執行個體，請在 `build.gradle(.kts)` 中新增以下內容：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> {
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootEnvSpec>().download = false
    // "true" for default behavior
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin) {
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootEnvSpec).download = false
}
 
```

</tab>
</tabs>

### 透過 kotlin-js-store 進行版本鎖定 {id="version-locking-via-kotlin-js-store"}

專案根目錄中的 `kotlin-js-store` 目錄是由 Kotlin Multiplatform Gradle 外掛程式自動產生的，用以存放進行版本鎖定所需的 `yarn.lock` 檔案。該 lockfile 完全由 Yarn 外掛程式管理，並在執行 `kotlinNpmInstall` Gradle 任務期間進行更新。

為了遵循[建議的最佳做法](https://classic.yarnpkg.com/blog/2016/11/24/lockfiles-for-all/)，請將 `kotlin-js-store` 及其內容提交到你的版本控制系統中。這可確保你的應用程式在所有電腦上都使用完全相同的相依性樹進行建置。

如果需要，可以在 `build.gradle(.kts)` 中更改目錄和 lockfile 的名稱：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> {
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension>().lockFileDirectory =
        project.rootDir.resolve("my-kotlin-js-store")
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension>().lockFileName = "my-yarn.lock"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin) {
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).lockFileDirectory =
        file("my-kotlin-js-store")
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).lockFileName = 'my-yarn.lock'
}
```

</tab>
</tabs>

> 更改 lockfile 的名稱可能會導致相依性檢查工具無法再辨識該檔案。
> 
{style="warning"}

若要深入了解 `yarn.lock`，請造訪 [Yarn 官方文件](https://classic.yarnpkg.com/lang/en/docs/yarn-lock/)。

### 報告 yarn.lock 已更新 {id="reporting-that-yarn-lock-has-been-updated"}

Kotlin/JS 提供了 Gradle 設定，可在 `yarn.lock` 檔案更新時通知你。
當你希望在 CI 建置過程中 `yarn.lock` 發生無訊息更改時收到通知，可以使用這些設定：

* `YarnLockMismatchReport`：指定如何回報對 `yarn.lock` 檔案的更改。你可以使用以下值之一：
    * `FAIL`：使相應的 Gradle 任務失敗。這是預設值。
    * `WARNING`：將變更資訊寫入警告日誌。
    * `NONE`：停用報告。
* `reportNewYarnLock`：明確報告新建立的 `yarn.lock` 檔案。預設情況下此選項處於停用狀態：首次啟動時產生新的 `yarn.lock` 檔案是常見做法。你可以使用此選項確保檔案已提交至存儲庫。
* `yarnLockAutoReplace`：每次執行 Gradle 任務時自動替換 `yarn.lock`。

若要使用這些選項，請按如下方式更新 `build.gradle(.kts)`：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.targets.js.yarn.YarnLockMismatchReport
import org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension

rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> {
    rootProject.the<YarnRootExtension>().yarnLockMismatchReport =
        YarnLockMismatchReport.WARNING // NONE | FAIL
    rootProject.the<YarnRootExtension>().reportNewYarnLock = false // true
    rootProject.the<YarnRootExtension>().yarnLockAutoReplace = false // true
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.targets.js.yarn.YarnLockMismatchReport
import org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension

rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin) {
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).yarnLockMismatchReport =
        YarnLockMismatchReport.WARNING // NONE | FAIL
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).reportNewYarnLock = false // true
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).yarnLockAutoReplace = false // true
}
```

</tab>
</tabs>

### 預設使用 --ignore-scripts 安裝 npm 相依性 {id="installing-npm-dependencies-with-ignore-scripts-by-default"}

為了降低執行遭入侵 npm 套件中惡意程式碼的風險，Kotlin Multiplatform Gradle 外掛程式預設會在安裝 npm 相依性期間阻止執行[生命週期指令碼](https://docs.npmjs.com/cli/v8/using-npm/scripts#life-cycle-scripts)。

你可以透過在 `build.gradle(.kts)` 中新增以下內容來明確啟用生命週期指令碼的執行：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> { 
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension>().ignoreScripts = false
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin) {
    rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).ignoreScripts = false
}
```

</tab>
</tabs>

## 發行版本目標目錄 {id="distribution-target-directory"}

預設情況下，Kotlin/JS 專案的建置結果位於專案根目錄內的 `/build/dist/<targetName>/<binaryName>` 目錄中。

若要為專案發行檔案設定另一個位置，請在建置指令碼的 `browser {}` 區塊內新增 `distribution {}` 區塊，並使用 `set()` 方法為 `outputDirectory` 屬性指派值。
一旦執行專案建置任務，Gradle 就會將輸出組合包連同專案資源一起儲存到此位置。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    js {
        browser {
            distribution {
                outputDirectory.set(projectDir.resolve("output"))
            }
        }
        binaries.executable()
        // ...
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    js {
        browser {
            distribution {
                outputDirectory = file("$projectDir/output")
            }
        }
        binaries.executable()
        // ...
    }
}
```

</tab>
</tabs>

## 模組名稱 {id="module-name"}

若要調整 JavaScript _模組_的名稱（產生於 `build/js/packages/myModuleName`），包括相應的 `.js` 和 `.d.ts` 檔案，請使用 `outputModuleName` 選項：

```kotlin
kotlin {
    js {
        outputModuleName = "myModuleName"
    }
}
```

請注意，這不會影響 `build/dist` 中的 webpack 輸出。

## 自訂 package.json {id="package-json-customization"}

`package.json` 檔案保存了 JavaScript 套件的元資料。流行的套件註冊庫（如 npm）要求所有發佈的套件都必須具有此檔案。它們用它來追蹤和管理套件發佈。

Kotlin Multiplatform Gradle 外掛程式會在建置期間自動為 Kotlin/JS 專案產生 `package.json`。預設情況下，該檔案包含基本資料：名稱、版本、授權、相依性以及一些其他套件屬性。

除基本套件屬性外，`package.json` 還可以定義 JavaScript 專案的運作方式，例如識別可供執行的指令碼。

你可以透過 Gradle DSL 將自訂項目新增至專案的 `package.json` 中。若要將自訂欄位新增至 `package.json`，請在編譯的 `packageJson` 區塊中使用 `customField()` 函式：

```kotlin
kotlin {
    js {
        compilations["main"].packageJson {
            customField("hello", mapOf("one" to 1, "two" to 2))
        }
    }
}
```

建置專案時，此程式碼會將以下區塊新增至 `package.json` 檔案中：

```json
"hello": {
    "one": 1,
    "two": 2
}
```

在 [npm 文件](https://docs.npmjs.com/cli/v6/configuring-npm/package-json)中進一步了解如何為 npm 註冊庫編寫 `package.json` 檔案。