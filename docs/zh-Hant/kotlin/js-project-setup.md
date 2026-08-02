[//]: # (title: 設定 Kotlin/JS 專案)

Kotlin/JS 專案使用 Gradle 作為組建系統。為了讓開發人員輕鬆管理其 Kotlin/JS 專案，我們提供了 `kotlin.multiplatform` Gradle 外掛程式，它提供了專案配置工具以及用於自動化 JavaScript 開發典型常式的輔助任務。

該外掛程式會在背景使用 [npm](https://www.npmjs.com/) 或 [Yarn](https://yarnpkg.com/) 封裝管理員下載 npm 相依性，並使用 [webpack](https://webpack.js.org/) 從 Kotlin 專案建置 JavaScript 組合包。相依性管理和配置調整很大程度可以直接從 Gradle 建置檔案中完成，並提供覆寫自動產生的配置以實現完全控制的選項。

您可以手動在 `build.gradle(.kts)` 檔案中將 `org.jetbrains.kotlin.multiplatform` 外掛程式套用到 Gradle 專案：

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

Kotlin 多平台 Gradle 外掛程式讓您可以在建置指令碼的 `kotlin {}` 區塊中管理專案的各個層面：

```groovy
kotlin {
    // ...
}
```

在 `kotlin {}` 區塊內，您可以管理以下層面：

* [目標執行環境](#execution-environments)：瀏覽器或 Node.js 
* [支援 ES2015 特性](#support-for-es2015-features)：類別、模組和產生器
* [配置輸出粒度](#configure-output-granularity)
* [產生 TypeScript 宣告檔案](#generation-of-typescript-declaration-files-d-ts)
* [專案相依性](#dependencies)：Maven 和 npm
* [執行配置](#run-task)
* [測試配置](#test-task)
* 針對瀏覽器專案的[組合](#webpack-bundling)與 [CSS 支援](#css)
* [目標目錄](#distribution-target-directory)與[模組名稱](#module-name)
* 專案的 [`package.json` 檔案](#package-json-customization)

## 執行環境

Kotlin/JS 專案可以針對兩種不同的執行環境： 

* 瀏覽器：用於瀏覽器中的用戶端腳本
* [Node.js](https://nodejs.org/)：用於在瀏覽器之外執行 JavaScript 程式碼，例如伺服器端腳本。

要為 Kotlin/JS 專案定義目標執行環境，請在內部加入帶有 `browser {}` 或 `nodejs {}` 的 `js {}` 區塊：

```kotlin
kotlin {
    js {
        browser {
        }
        binaries.executable()
    }
}
```

指令 `binaries.executable()` 明確指示 Kotlin 編譯器發出可執行 `.js` 檔案。省略 `binaries.executable()` 將導致編譯器僅產生 Kotlin 內部程式庫檔案，這些檔案可以從其他專案使用，但不能自行執行。

> 這通常比建立可執行檔更快，並且在處理專案的非葉模組時可能是一種最佳化手段。
>
{style="tip"}

Kotlin 多平台外掛程式會自動配置其任務以配合選定的環境。這包括下載和安裝執行與測試應用程式所需的環境與相依性。這讓開發人員無需額外配置即可建置、執行和測試簡單專案。對於針對 Node.js 的專案，還可以選擇使用現有的安裝。了解如何[使用預先安裝的 Node.js](#use-pre-installed-node-js)。

## 支援 ES2015 特性

Kotlin 提供對 ES2015 特性的支援，包括：

* 模組：簡化您的程式碼庫並提高可維護性。
* 類別：允許結合 OOP 原則，產出更簡潔且直觀的程式碼。
* 產生器：用於編譯 [suspend 函式](https://kotlinlang.org/docs/composing-suspending-functions.html)，以改善最終組合包大小並協助偵錯。
* [JavaScript 程式碼內嵌](js-interop.md#inline-javascript)。

您可以透過在 `build.gradle(.kts)` 檔案中新增 `es2015` 編譯目標，一次啟用所有支援的 ES2015 特性：

```kotlin
tasks.withType<KotlinJsCompile>().configureEach {
    compilerOptions {
        target = "es2015"
    }
}
```

[在官方文件中進一步了解 ES2015 (ECMAScript 2015, ES6)](https://262.ecma-international.org/6.0/)。

## 配置輸出粒度

您可以選擇編譯器在專案中輸出 `.js` 檔案的方式：

* **每個模組一個**。預設情況下，JS 編譯器會為每個專案模組輸出個別的 `.js` 檔案作為編譯結果。
* **每個專案一個**。您可以透過在 `gradle.properties` 檔案中加入以下行，將整個專案編譯成單一 `.js` 檔案：

  ```none
  kotlin.js.ir.output.granularity=whole-program // 預設為 'per-module'
  ```

* **每個檔案一個**。您可以配置更細粒度的輸出，為每個 Kotlin 檔案產生一個（或兩個，如果檔案包含匯出的宣告）JavaScript 檔案。要啟用按檔案編譯模式：
  1. 將 `es2015` 設定為[編譯目標](#support-for-es2015-features)，以在您的專案中支援 ES2015 特性。
  2. 在 `gradle.properties` 檔案中加入以下行：
     ```none
     kotlin.js.ir.output.granularity=per-file // 預設為 'per-module'
     ```

## 產生 TypeScript 宣告檔案 (`d.ts`)
<primary-label ref="experimental-opt-in"/>

Kotlin/JS 編譯器可以從您的 Kotlin 程式碼產生 TypeScript 定義。這些定義在處理混合應用程式時，可供 JavaScript 工具和 IDE 用於：

* 提供自動補全
* 支援靜態分析器
* 簡化在 JavaScript 和 TypeScript 專案中加入 Kotlin 程式碼的過程

產生 TypeScript 定義對於[共用業務邏輯的使用案例](js-overview.md#use-cases-for-kotlin-js)特別有價值。

編譯器會收集任何標記有 [`@JsExport`](js-to-kotlin-interop.md#jsexport-annotation) 的頂層宣告，並自動在 `.d.ts` 檔案中產生 TypeScript 定義。

要產生 TypeScript 定義，請在您的 Gradle 建置檔案中明確配置。在您的 `build.gradle.kts` 檔案中的 [`js {}` 區塊](js-project-setup.md#execution-environments)加入 `generateTypeScriptDefinitions()` 函式：

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

您可以在 `build/js/packages/<package_name>/kotlin` 目錄中找到這些定義，以及對應的未經 webpack 處理的 JavaScript 程式碼。

## 相依性

要宣告相依性，請在 `build.gradle(.kts)` 檔案中使用 `jsMain` 原始碼集內的 `dependencies {}` 區塊：

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

只有包含 Kotlin/JS 構件的程式庫才能作為相依性使用。要解決相依性，請在 `build.gradle(.kts)` 檔案的 `repositories {}` 區塊中宣告 Gradle 應在其中尋找它們的存儲庫。例如：

```kotlin
repositories {
    mavenCentral()
}
```

如果您加入的程式庫相依於 [來自 npm 的套件](#npm-dependencies)，Gradle 也會自動解決這些遞移相依性。

### Kotlin 標準函式庫

對 [標準函式庫](https://kotlinlang.org/api/latest/jvm/stdlib/index.html) 的相依性會自動加入。標準函式庫的版本與 Kotlin 多平台外掛程式的版本相同。

對於多平台測試，可以使用 [`kotlin.test`](https://kotlinlang.org/api/latest/kotlin.test/) API。當您建立多平台專案時，可以透過在 `commonTest` 中使用單一相依性，將測試相依性加入到所有原始碼集：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        commonTest.dependencies {
            implementation(kotlin("test")) // 自動帶入所有平台相依性
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
                implementation kotlin("test") // 自動帶入所有平台相依性
            }
        }
    }
}
```

</tab>
</tabs>

### npm 相依性

在 JavaScript 世界中，最常見的相依性管理方式是 [npm](https://www.npmjs.com/)。它提供了最大的 JavaScript 模組公共存儲庫。

Kotlin 多平台 Gradle 外掛程式讓您可以在 Gradle 建置指令碼中宣告 npm 相依性，就像宣告任何其他相依性一樣。

要宣告 npm 相依性，請將其名稱和版本傳遞給相依性宣告內的 `npm()` 函式。您也可以根據 [npm 的語意化版本語法](https://docs.npmjs.com/about-semantic-versioning)指定一個或多個版本範圍。

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

預設情況下，該外掛程式使用 [Yarn](https://yarnpkg.com/lang/en/) 封裝管理員的獨立執行個體來下載和安裝 npm 相依性。它開箱即用，無需額外配置，但您可以[根據特定需求對其進行調整](#yarn)。

您也可以直接使用 [npm](https://www.npmjs.com/) 封裝管理員來處理 npm 相依性。要使用 npm 作為您的封裝管理員，請在您的 `gradle.properties` 檔案中設定以下屬性：

```none
kotlin.js.yarn=false
```

除了常規相依性之外，還有三種其他類型的相依性可以從 Gradle DSL 中使用。要了解何時最適合使用每種類型的相依性，請查看 npm 連結的官方文件：

* [devDependencies](https://docs.npmjs.com/files/package.json#devdependencies)，透過 `devNpm(...)`，
* [optionalDependencies](https://docs.npmjs.com/files/package.json#optionaldependencies)，透過 `optionalNpm(...)`，以及
* [peerDependencies](https://docs.npmjs.com/files/package.json#peerdependencies)，透過 `peerNpm(...)`。

安裝 npm 相依性後，您可以在程式碼中使用其 API，如[在 Kotlin 中呼叫 JS](js-interop.md) 中所述。

## run 任務

Kotlin 多平台 Gradle 外掛程式提供了一個 `jsBrowserDevelopmentRun` 任務，讓您無需額外配置即可執行純 Kotlin/JS 專案。

對於在瀏覽器中執行 Kotlin/JS 專案，此任務是 `browserDevelopmentRun` 任務的別名（該任務在 Kotlin 多平台專案中也可用）。它使用 [webpack-dev-server](https://webpack.js.org/configuration/dev-server/) 來提供您的 JavaScript 構件。如果您想自訂 `webpack-dev-server` 使用的配置，例如調整伺服器執行的連接埠，請使用 [webpack 配置檔案](#webpack-bundling)。

對於針對 Node.js 執行 Kotlin/JS 專案，請使用 `jsNodeDevelopmentRun` 任務，它是 `nodeRun` 任務的別名。

要執行專案，請執行標準生命週期 `jsBrowserDevelopmentRun` 任務或其對應的別名：

```bash
./gradlew jsBrowserDevelopmentRun
```

要在修改原始碼檔案後自動觸發應用程式重新建置，請使用 Gradle [連續建置](https://docs.gradle.org/current/userguide/command_line_interface.html#sec:continuous_build)功能：

```bash
./gradlew jsBrowserDevelopmentRun --continuous
```

或 

```bash
./gradlew jsBrowserDevelopmentRun -t
```

一旦您的專案建置成功，`webpack-dev-server` 將自動重新整理瀏覽器頁面。

## test 任務

Kotlin 多平台 Gradle 外掛程式會自動為專案設定測試基礎結構。對於瀏覽器專案，它會下載並安裝 [Karma](https://karma-runner.github.io/) 測試執行器及其他必要的相依性；對於 Node.js 專案，則使用 [Mocha](https://mochajs.org/) 測試框架。 

該外掛程式還提供了有用的測試功能，例如：

* 產生原始碼對應檔
* 產生測試報告
* 主控台中的測試執行結果

為了執行瀏覽器測試，外掛程式預設使用 [Headless Chrome](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md)。您也可以透過在建置指令碼的 `useKarma {}` 區塊中加入對應的項目，選擇另一個瀏覽器來執行測試：

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

或者，您可以在 `gradle.properties` 檔案中新增瀏覽器的測試目標：

```text
kotlin.js.browser.karma.browsers=firefox,safari
```

這種方法允許您為所有模組定義瀏覽器清單，然後在特定模組的建置指令碼中新增特定的瀏覽器。 

請注意，Kotlin 多平台 Gradle 外掛程式不會自動為您安裝這些瀏覽器，而僅使用其執行環境中可用的瀏覽器。例如，如果您在持續整合伺服器上執行 Kotlin/JS 測試，請確保已安裝您要測試的瀏覽器。

如果您想跳過測試，請將 `enabled = false` 這一行加入到 `testTask {}` 中：

```kotlin
kotlin {
    js {
        browser {
            testTask {
                enabled = false
            }
        }
        binaries.executable()
        // ...
    }
}
```

要執行測試，請執行標準生命週期 `check` 任務：

```bash
./gradlew check
```

要指定 Node.js 測試執行器使用的環境變數（例如，將外部資訊傳遞給測試，或微調套件解析），請在建置指令碼的 `testTask {}` 區塊內使用帶有鍵值對的 `environment()` 函式：

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

### Karma 配置

Kotlin 多平台 Gradle 外掛程式在建置時會自動產生 Karma 配置檔案，其中包含您在 `build.gradle(.kts)` 的 [`kotlin.js.browser.testTask.useKarma {}` 區塊](#test-task) 中的設定。您可以在 `build/js/packages/projectName-test/karma.conf.js` 找到該檔案。要對 Karma 使用的配置進行調整，請將您的額外配置檔案放在專案根目錄下名為 `karma.config.d` 的目錄中。此目錄中的所有 `.js` 配置檔案都將被讀取，並在建置時自動合併到產生的 `karma.conf.js` 中。

Karma 的所有配置功能在 Karma 的 [文件](https://karma-runner.github.io/5.0/config/configuration-file.html) 中都有詳盡描述。

## webpack 組合

對於瀏覽器目標，Kotlin 多平台 Gradle 外掛程式使用廣為人知的 [webpack](https://webpack.js.org/) 模組組合器。

### webpack 任務

最常見的 webpack 調整可以透過 Gradle 建置檔案中的 `kotlin.js.browser.webpackTask {}` 配置區塊直接進行：
* `mainOutputFileName` - webpack 處理後的輸出檔案名稱。執行 webpack 任務後，它將產生在 `<projectDir>/build/kotlin-webpack/<targetName>/<binaryName>` 中。預設值為專案名稱。
* `output.libraryTarget` - webpack 輸出檔案的模組系統。了解更多關於 [Kotlin/JS 專案可用的模組系統](js-modules.md)。預設值為 `umd`。
  
```groovy
webpackTask {
    mainOutputFileName = "mycustomfilename.js"
    output.libraryTarget = "commonjs2"
}
```

您也可以在 `commonWebpackConfig {}` 區塊中配置用於組合、執行和測試任務的通用 webpack 設定。

### webpack 配置檔案 

Kotlin 多平台 Gradle 外掛程式在建置時會自動產生標準的 webpack 配置檔案。它位於 `build/js/packages/projectName/webpack.config.js`。

如果您想對 webpack 配置進行進一步調整，請將您的額外配置檔案放在專案根目錄下名為 `webpack.config.d` 的目錄中。建置專案時，所有 `.js` 配置檔案將自動合併到 `build/js/packages/projectName/webpack.config.js` 檔案中。例如，要加入新的 [webpack 載入器 (loader)](https://webpack.js.org/loaders/)，請將以下內容加入到 `webpack.config.d` 目錄中的 `.js` 檔案：

> 在這種情況下，配置物件是 `config` 全域物件。您需要在指令碼中修改它。
>
{style="note"}

```groovy
config.module.rules.push({
    test: /\.extension$/,
    loader: 'loader-name'
});
```

webpack 的所有配置功能在其 [文件](https://webpack.js.org/concepts/configuration/) 中都有詳盡描述。

### 建置可執行檔

為了透過 webpack 建置可執行 JavaScript 構件，Kotlin 多平台 Gradle 外掛程式包含 `jsBrowserDevelopmentWebpack` 和 `jsBrowserProductionWebpack` Gradle 任務。

* `jsBrowserDevelopmentWebpack` 建立開發構件，雖然檔案體積較大，但建立所需時間較短。因此，在主動開發期間請使用 `jsBrowserDevelopmentWebpack` 任務。
* `jsBrowserProductionWebpack` 對產生的構件套用無效程式碼消除，並縮減產生的 JavaScript 檔案，這需要更多時間，但產生的可執行檔體積較小。因此，在準備將專案用於生產環境時，請使用 `jsBrowserProductionWebpack` 任務。
 
 執行其中任一任務以獲取對應的開發或生產構件。除非[另有指定](#distribution-target-directory)，否則產生的檔案將位於 `build/kotlin-webpack` 中。

```bash
./gradlew jsBrowserProductionWebpack
```

請注意，僅當您的目標配置為產生可執行檔（透過 `binaries.executable()`）時，這些任務才可用。

要將發佈內容產生在 `build/dist/<targetName>/<binaryName>` 目錄中，請改為執行 `jsBrowserDistribution` 任務：

```bash
./gradlew jsBrowserDistribution
```

此任務會產生包含專案資源且可供使用的發佈內容。

## CSS

Kotlin 多平台 Gradle 外掛程式還提供對 webpack 的 [CSS](https://webpack.js.org/loaders/css-loader/) 和 [style](https://webpack.js.org/loaders/style-loader/) 載入器的支援。雖然所有選項都可以透過直接修改用於建置專案的 [webpack 配置檔案](#webpack-bundling) 來更改，但最常用的設定可以直接從 `build.gradle(.kts)` 檔案中取得。

要在專案中開啟 CSS 支援，請在 Gradle 建置檔案的 `commonWebpackConfig {}` 區塊中設定 `cssSupport.enabled` 選項。使用精靈建立新專案時，預設也會啟用此配置。

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

或者，您可以為 `webpackTask {}`、`runTask {}` 和 `testTask {}` 獨立加入 CSS 支援：

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

在專案中啟動 CSS 支援有助於防止從未配置的專案嘗試使用樣式表時發生的常見錯誤，例如 `Module parse failed: Unexpected character '@' (14:0)`。

您可以使用 `cssSupport.mode` 來指定應如何處理遇到的 CSS。可用的值如下：

* `"inline"`（預設）：樣式被加入到全域 `<style>` 標籤中。
* `"extract"`：樣式被提取到單獨的檔案中。然後可以從 HTML 頁面中引入它們。
* `"import"`：樣式被處理為字串。如果您需要從程式碼中存取 CSS（例如 `val styles = require("main.css")`），這會很有用。

要在同一個專案中使用不同的模式，請使用 `cssSupport.rules`。在這裡，您可以指定一個 `KotlinWebpackCssRules` 清單，其中每個規則定義一個模式，以及 [include](https://webpack.js.org/configuration/module/#ruleinclude) 和 [exclude](https://webpack.js.org/configuration/module/#ruleexclude) 模式。

## Node.js

對於針對 Node.js 的 Kotlin/JS 專案，該外掛程式會自動在主機上下載並安裝 Node.js 環境。如果您已經安裝了 Node.js 實體，也可以使用它。

您可以為每個子專案配置 Node.js 設定，也可以為整個專案進行設定。

### 更改 Node.js 版本

預設的 Node.js 版本目前為 24.16.0，但您可以為特定的子專案使用不同的版本。將以下內容加入到您的子專案 `build.gradle(.kts)` 檔案中。例如：

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

要為整個專案（包括所有子專案）設定版本，請將相同的程式碼套用到 `allprojects {}` 區塊。例如：

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

### 使用預先安裝的 Node.js

如果在您建置 Kotlin/JS 專案的主機上已經安裝了 Node.js，您可以配置 Kotlin 多平台 Gradle 外掛程式使用它，而不是安裝自己的 Node.js 實體。

要使用預先安裝的 Node.js 實體，請將以下內容加入到您的 `build.gradle(.kts)` 檔案中：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
    // 設定為 `true` 以使用預設行為
    project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().download = false
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
project.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin) {
    // 設定為 `true` 以使用預設行為
    project.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec).download = false
}
```

</tab>
</tabs>

## Yarn

預設情況下，為了在建置時下載並安裝您宣告的相依性，該外掛程式會管理其自己的 [Yarn](https://yarnpkg.com/lang/en/) 封裝管理員實體。它開箱即用，無需額外配置，但您可以對其進行調整或使用主機上已安裝的 Yarn。

### 額外的 Yarn 特性：.yarnrc

要配置額外的 Yarn 特性，請在專案根目錄中放置一個 `.yarnrc` 檔案。建置時，它會自動被讀取。

例如，要為 npm 套件使用自訂註冊表，請在專案根目錄下名為 `.yarnrc` 的檔案中加入以下行：

```text
registry "http://my.registry/api/npm/"
```

要了解更多關於 `.yarnrc` 的資訊，請造訪 [Yarn 官方文件](https://classic.yarnpkg.com/en/docs/yarnrc/)。

### 使用預先安裝的 Yarn

如果在您建置 Kotlin/JS 專案的主機上已經安裝了 Yarn，您可以配置 Kotlin 多平台 Gradle 外掛程式使用它，而不是安裝自己的 Yarn 實體。

要使用預先安裝的 Yarn 實體，請將以下行加入到 `build.gradle(.kts)` 中：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> {
    rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootEnvSpec>().download = false
    // "true" 為預設行為
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

### 透過 kotlin-js-store 進行版本鎖定

專案根目錄下的 `kotlin-js-store` 目錄由 Kotlin 多平台 Gradle 外掛程式自動產生，用於存放 `yarn.lock` 檔案，這對於版本鎖定是必要的。鎖定檔案完全由 Yarn 外掛程式管理，並在執行 `kotlinNpmInstall` Gradle 任務期間更新。

為了遵循 [推薦實務](https://classic.yarnpkg.com/blog/2016/11/24/lockfiles-for-all/)，請將 `kotlin-js-store` 及其內容提交到您的版本控制系統中。這可確保您的應用程式在所有機器上都使用完全相同的相依性樹進行建置。

如果需要，您可以在 `build.gradle(.kts)` 中更改目錄和鎖定檔案的名稱：

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

> 更改鎖定檔案的名稱可能會導致相依性檢查工具無法再讀取該檔案。
> 
{style="warning"}

要了解更多關於 `yarn.lock` 的資訊，請造訪 [Yarn 官方文件](https://classic.yarnpkg.com/lang/en/docs/yarn-lock/)。

### 回報 yarn.lock 已更新

Kotlin/JS 提供了 Gradle 設定，可以在 `yarn.lock` 檔案更新時通知您。當您希望在 CI 建置過程中如果 `yarn.lock` 被靜默更改時收到通知，可以使用這些設定：

* `YarnLockMismatchReport`：指定如何報告 `yarn.lock` 檔案的更改。您可以使用以下值之一：
    * `FAIL`：使對應的 Gradle 任務失敗。這是預設值。
    * `WARNING`：在警告日誌中寫入關於更改的資訊。
    * `NONE`：停用回報。
* `reportNewYarnLock`：明確回報最近建立的 `yarn.lock` 檔案。預設情況下，此選項是停用的：在第一次啟動時產生新的 `yarn.lock` 檔案是常見做法。您可以使用此選項來確保檔案已提交到您的存儲庫。
* `yarnLockAutoReplace`：每次執行 Gradle 任務時自動替換 `yarn.lock`。

要使用這些選項，請按如下方式更新 `build.gradle(.kts)`：

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

### 預設使用 --ignore-scripts 安裝 npm 相依性

為了減少執行來自受損 npm 套件的惡意程式碼的可能性，Kotlin 多平台 Gradle 外掛程式預設在安裝 npm 相依性期間阻止執行 [生命週期指令碼](https://docs.npmjs.com/cli/v8/using-npm/scripts#life-cycle-scripts)。

您可以透過在 `build.gradle(.kts)` 中加入以下行來明確啟用生命週期指令碼執行：

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

## 發佈目標目錄

預設情況下，Kotlin/JS 專案建置的結果位於專案根目錄內的 `/build/dist/<targetName>/<binaryName>` 目錄中。

要在建置指令碼的 `browser {}` 區塊中為專案發佈檔案設定另一個位置，請加入一個 `distribution {}` 區塊，並使用 `set()` 方法為 `outputDirectory` 屬性指定一個值。一旦您執行專案建置任務，Gradle 將把輸出組合包連同專案資源一起儲存在此位置。

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

## 模組名稱

要調整 JavaScript _模組_ 的名稱（該名稱在 `build/js/packages/myModuleName` 中產生），包括對應的 `.js` 和 `.d.ts` 檔案，請使用 `outputModuleName` 選項：

```kotlin
kotlin {
    js {
        outputModuleName = "myModuleName"
    }
}
```

請注意，這不會影響 `build/dist` 中的 webpack 輸出。

## package.json 自定義

`package.json` 檔案保存了 JavaScript 套件的元資料。受歡迎的套件註冊表（如 npm）要求所有發佈的套件都必須擁有此類檔案。它們使用它來追蹤和管理套件發佈。  

Kotlin 多平台 Gradle 外掛程式在建置期間會自動為 Kotlin/JS 專案產生 `package.json`。預設情況下，該檔案包含基本資料：名稱、版本、授權、相依性以及一些其他套件屬性。

除了基本套件屬性外，`package.json` 還可以定義 JavaScript 專案的行為方式，例如識別可供執行的指令碼。

您可以透過 Gradle DSL 向專案的 `package.json` 加入自訂項目。要在您的 `package.json` 中加入自訂欄位，請在 `jsMain` 原始碼集的 `packageJson` 區塊中使用 `customField()` 函式：

```kotlin
kotlin {
    sourceSets {
        jsMain {
            packageJson {
                customField("hello", mapOf("one" to 1, "two" to 2))
            }
        }
    }
}
```

建置專案時，此程式碼會將以下區塊加入到 `package.json` 檔案中：

```json
"hello": {
    "one": 1,
    "two": 2
}
```

了解更多關於在 [npm 文件](https://docs.npmjs.com/cli/v6/configuring-npm/package-json) 中為 npm 註冊表編寫 `package.json` 檔案的資訊。