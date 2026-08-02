[//]: # (title: Kotlin %kotlinEapVersion% 的新功能)

<primary-label ref="eap"/>

<show-structure depth="1"/>

<web-summary>閱讀 Kotlin 早期體驗預覽 (EAP) 版本說明，並在正式發佈前試用最新的實驗性 Kotlin 功能。</web-summary>

_[發佈日期：%kotlinEapReleaseDate%](eap.md#build-details)_

> 本文件並未涵蓋早期體驗預覽 (EAP) 發佈版的所有功能，但重點介紹了一些重大改進。
>
> 請參閱 [GitHub 變更日誌](https://github.com/JetBrains/kotlin/releases/tag/v%kotlinEapVersion%) 中的完整變更列表。
>
{style="note"}

Kotlin %kotlinEapVersion% 版本已發佈！以下是此 EAP 版本的一些詳細資訊：

* **標準函式庫**：[支援協同程式堆疊追蹤恢復，以及用於檢查集合元素相等性和唯一性的新功能](#standard-library)
* **Kotlin/Native**：[`klib` 構件預設啟用增量編譯，以及新的 Swift 匯出功能](#kotlin-native)
* **Kotlin/Wasm**：[針對 `@JsFun` 宣告中頂層 `require()` 呼叫的變更、改進的伴隨物件初始化順序，以及 Kotlin Gradle 外掛程式對 Wasmtime 的支援](#kotlin-wasm)
* **Kotlin/JS**：[用於瀏覽器測試的新 DSL，以及支援將 suspend lambda 匯出為 async 函式](#kotlin-js)
* **建置工具 API**：[支援新目標：Kotlin/JS、Kotlin/Wasm 以及 Kotlin 元資料](#build-tools-api)
* **Kotlin 編譯器**：[原生映像（native image）的實驗性版本](#kotlin-compiler-native-image)

> 有關 Kotlin 發佈週期的資訊，請參閱 [Kotlin 發佈程序](releases.md)。
>
{style="tip"}

## 更新到 Kotlin %kotlinEapVersion%

最新版本的 Kotlin 已包含在最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 和 [Android Studio](https://developer.android.com/studio) 中。

若要更新到新的 Kotlin 版本，請確保您的 IDE 已更新至最新版本，並在建置指令碼中[將 Kotlin 版本更改](releases.md#update-to-a-new-kotlin-version)為 %kotlinEapVersion%。

## 新功能 {id=new-experimental-features}
<primary-label ref="experimental-exp"/>

此版本提供以下預覽版（pre-stable）功能。這包括具有 [Beta](components-stability.md#stability-levels-explained)、[Alpha](components-stability.md#stability-levels-explained) 和 [實驗性](components-stability.md#stability-levels-explained) 狀態的功能：

* [標準函式庫：支援協同程式堆疊追蹤恢復](#support-for-coroutine-stack-trace-recovery)
* [標準函式庫：用於檢查集合元素相等性和唯一性的新函式](#new-functions-to-check-collection-elements-for-equality-and-uniqueness)
* [Kotlin/Native：獨立的 Kotlin 編譯器映像](#kotlin-compiler-native-image)
* [Kotlin/JS：用於瀏覽器測試的新 DSL](#new-dsl-for-browser-testing)
* [建置工具 API：支援 Kotlin/JS、Kotlin/Wasm 和 Kotlin 元資料](#build-tools-api)

## 標準函式庫

Kotlin %kotlinEapVersion% 新增了對協同程式堆疊追蹤恢復的支援，並引入了用於檢查集合元素相等性和唯一性的新函式。

### 支援協同程式堆疊追蹤恢復
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin %kotlinEapVersion% 在標準函式庫中新增了 `StackTraceRecoverable` 介面。這改進了與 `kotlinx.coroutines` 程式庫的整合，因為它讓您可以定義如何為堆疊追蹤恢復建立新的例外執行個體，而無需增加對 `kotlinx.coroutines` 的相依性。

當一個協同程式拋出例外，而另一個協同程式重新拋出它時，堆疊追蹤恢復有助於偵錯。它讓您可以查看例外的源頭以及另一個協同程式在哪裡重新拋出它。

`kotlinx.coroutines` 程式庫透過建立一個包含額外協同程式堆疊追蹤資訊的新例外執行個體來執行堆疊追蹤恢復。對於建構函式僅接受例外訊息、原因、兩者皆有或不含參數的例外，這會自動發生。

如果例外建構函式具有額外的必要參數（例如行號或錯誤代碼），請實作 `StackTraceRecoverable` 介面，以定義 `kotlinx.coroutines` 程式庫如何建立該例外的新執行個體。

若要實作此介面，請覆寫 `copyForStackTraceRecovery()` 函式。此函式會回傳一個用於堆疊追蹤恢復的新例外執行個體，如果您不希望 `kotlinx.coroutines` 程式庫複製該例外，則回傳 `null`。

> `StackTraceRecoverable` 介面在所有目標上皆可用，但 `kotlinx.coroutines` 程式庫僅在 JVM 上將其用於堆疊追蹤恢復。
>
{style="note"}

這些 API 處於[實驗性](components-stability.md#stability-levels-explained)階段，需要使用 `@OptIn(ExperimentalStdlibCoroutineSupportApi::class)` 註解進行選擇加入。

以下是一個自訂例外的範例，它在為堆疊追蹤恢復建立新執行個體時會保留 `line` 屬性：

```kotlin
import kotlin.coroutines.ExperimentalStdlibCoroutineSupportApi
import kotlin.coroutines.StackTraceRecoverable

@OptIn(ExperimentalStdlibCoroutineSupportApi::class)
class FileEditException
// 此實作需要一個私有建構函式
// 以便將 cause 傳遞給 IllegalStateException 建構函式
private constructor(
    val line: Int,
    private val detail: String,
    cause: Throwable?,
) : IllegalStateException("When editing line $line: $detail", cause),
    // 實作 StackTraceRecoverable 以進行堆疊追蹤恢復
    StackTraceRecoverable<FileEditException> {

    constructor(line: Int, detail: String) : this(line, detail, null)

    // 複製行號和訊息詳細資訊
    override fun copyForStackTraceRecovery(): FileEditException =
        FileEditException(line, detail, this)
    }

@OptIn(ExperimentalStdlibCoroutineSupportApi::class) 
fun main() {
    val original = FileEditException(15, "Unexpected token")
    val copy = original.copyForStackTraceRecovery()

    println(copy.message)
    // When editing line 15: Unexpected token

    println(copy.cause == original)
    // true
}
```

如需更多資訊，請參閱該功能的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/stdlib/KEEP-0461-stacktrace-recoverable.md)。我們歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-86595) 中向我們提供回饋。

### 用於檢查集合元素相等性和唯一性的新函式
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

在 Kotlin %kotlinEapVersion% 之前，如果您想檢查集合元素是否全部不同或全部相等，必須使用效率較低的程式碼模式。

Kotlin %kotlinEapVersion% 引入了實驗性函式來填補這一空白：

| 函式 | 檢查內容 |
|--------------------|------------------------------------------------------------|
| `.allDistinct()` | 集合中的每個值都是唯一的。 |
| `.allDistinctBy()` | 每個物件在選定的屬性上都具有唯一值。 |
| `.allEqual()` | 集合中的每個值都相同。 |
| `.allEqualBy()` | 每個物件在選定的屬性上都具有相同的值。 |

您可以在集合、序列和陣列上使用這些函式。它們使用結構相等性來比較元素，就像其他集合操作一樣。

這些函式處於[實驗性](components-stability.md#stability-levels-explained)階段，需要使用 `@OptIn(ExperimentalStdlibApi::class)` 註解或 `-opt-in=kotlin.ExperimentalStdlibApi` 編譯器選項進行選擇加入：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    data class Response(
        val participantId: String,
        val answer: String,
        val responseDate: String
    )

    val responses = listOf(
        Response("P001", "Yes", "2026-07-21"),
        Response("P002", "Maybe", "2026-07-21"),
        Response("P003", "No", "2026-07-21")
    )

    // 檢查是否所有參與者都給出了相同的答案
    println(responses.allEqualBy { it.answer })
    // false

    // 檢查重複的參與者
    println(responses.allDistinctBy { it.participantId })
    // true

    // 檢查是否所有回應都在同一日期提交
    println(responses.allEqualBy { it.responseDate })
    // true

    val answers = responses.map { it.answer }

    // 檢查答案是否相同
    println(answers.allEqual())
    // false

    // 檢查答案是否各不相同
    println(answers.allDistinct())
    // true
}
```

我們歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-30270) 中分享您使用這些函式的體驗回饋。

## Kotlin/Native

Kotlin %kotlinEapVersion% 預設啟用了 `klib` 構件的增量編譯，帶來了新的 Swift 匯出功能（包括對密封類別和跨語言繼承的支援），並推出了 Kotlin 編譯器原生映像的第一個發佈版本。

### 預設啟用增量編譯
<secondary-label ref="native"/>

從 %kotlinEapVersion% 開始，`klib` 構件的增量編譯已預設啟用。

透過增量編譯，如果專案模組產生的 `klib` 構件僅有一部分發生變更，則只有 `klib` 中受影響的部分會進一步重新編譯為二進位檔案。

此最佳化最初是在 [Kotlin 1.9.20](whatsnew1920.md#incremental-compilation-of-klib-artifacts) 中引入的，並已證明能大幅縮短偵錯組建的編譯時間。

請注意，在某些情況下，此最佳化可能會對全新組建（clean build）產生效能開銷。

如果您在使用此功能時遇到意外問題，可以手動將其停用。若要停用，請在您的 `gradle.properties` 檔案中設定以下選項：

```none
kotlin.incremental.native=false
```

請在我們的問題追蹤器 [YouTrack](https://kotl.in/issue) 回報任何問題。如需更多關於縮短編譯時間的提示，請參閱我們的[文件](native-improving-compilation-time.md)。

### 新的 Swift 匯出功能
<secondary-label ref="native"/>

#### 密封類別

Kotlin %kotlinEapVersion% 在 Swift 匯出中新增了對密封類別（sealed classes）和介面的支援。

先前，您必須為密封型別的每個 `switch` 陳述式編寫一個 `default` 情況。現在，在 Kotlin 中定義的密封階層結構會對應到 Swift 列舉（enums），從而在 Xcode 中實現具有完整自動補全功能的窮舉 `switch` 陳述式。

Swift 匯出會在每個密封型別上產生一個 `.sealedType()` 方法。此方法會回傳一個 Swift 列舉，其成員與密封階層的直接子類別相符。您可以巢狀呼叫這些方法來匹配更深層的階層結構。

例如，在 Kotlin 中宣告一個具有類別階層的密封介面：

```kotlin
// Kotlin
sealed interface Shape

class Circle : Shape {
   override fun toString(): String = "Circle"
}

class Rectangle : Shape {
   override fun toString(): String = "Rectangle"
}

fun createCircle(): Shape = Circle()
```

在 Swift 端，您可以使用窮舉 `switch` 而無需 `default` 情況：

```swift
// Swift
let shape = createCircle()

let name = switch shape.sealedType() {
   case let .circle(type): "It's a \(type.value)"
   case let .rectangle(type): "It's a \(type.value)"
}
// name == "It's a Circle"
```

由於 `switch` 是窮舉的，如果密封階層中新增了新的子類別，編譯器會警告您，以便您可以立即處理它，而不需要依賴 `default` 情況。

#### Swift 匯出中的跨語言繼承

Kotlin %kotlinEapVersion% 在 Swift 匯出中引入了跨語言繼承支援。

此功能的一個常見使用案例是[反向匯入](native-lib-import-stability.md#swift-library-import)模式，即您在 Kotlin 中定義合約，並在 Swift 端提供平台特定的實作。

例如，您可以宣告一個 Kotlin 介面，在 Swift 中實作它，然後將 Swift 物件傳遞給接受該介面的 Kotlin 函式。當您需要使用無法直接匯入 Kotlin 的純 Swift 程式庫時，這特別有用。

例如，宣告一個 Kotlin 介面和一個接受它的函式：

```kotlin
// Kotlin
interface CryptoProvider {
   fun hashMD5(input: String): String
}

fun processHash(provider: CryptoProvider, input: String): String = provider.hashMD5(input)
```

在 Swift 端，使用純 Swift 程式庫實作此介面並將其傳回 Kotlin：

```swift
// Swift
import CryptoKit

class IosCryptoProvider: KotlinBase & CryptoProvider {
   func hashMD5(input: String) -> String {
       guard let data = input.data(using: .utf8) else { return "failed" }
       return Insecure.MD5.hash(data: data).description
   }
}

let provider = IosCryptoProvider()

// 呼叫被分派到 Swift 實作
print(processHash(provider: provider, input: "Hello, world!"))
```

當 Kotlin 接收到 Swift 物件時，會將其視為一般介面的實作，並執行 Swift 程式碼。

如需更多關於 Swift 匯出的詳細資訊，請參閱我們的[文件](native-swift-export.md)。

### 為 SwiftPM 相依性產生的 `Package.swift`
<secondary-label ref="native"/>

匯出相依於 SwiftPM 套件的 XCFramework 時，您必須發佈生成的 SwiftPM 套件才能正確解析。為了協助此操作，`assembleSharedXCFramework` Gradle 任務現在會產生一個 `Package.swift` 檔案，以便與 XCFramework 一起散佈。

如需詳細資訊，請參閱 [SwiftPM 匯出頁面](https://kotlinlang.org/docs/multiplatform/multiplatform-spm-export.html)。

## Kotlin/Wasm

Kotlin %kotlinEapVersion% 更改了 Kotlin/Wasm 處理 `@JsFun` 宣告中頂層 `require()` 呼叫的方式，使伴隨物件的初始化順序與 JVM 行為一致，並在 Kotlin Gradle 外掛程式中新增了對 Wasmtime 作為 `wasmWasi` 目標執行階段的支援。

### 針對 `@JsFun` 宣告中頂層 `require()` 呼叫的變更
<secondary-label ref="wasm"/>

當 `@JsFun` 宣告使用頂層 `require()` 函式時，Kotlin/Wasm 現在會報錯。

先前，編譯器會在 `import-object.mjs` 檔案中產生一個 `require` 變數，允許 `@JsFun` 宣告呼叫 `require()`。

此行為無意中洩露了編譯器的實作細節。為了支援從中遷移，Kotlin/Wasm 移除了此產生的 `require` 宣告，且編譯器現在會針對此類呼叫報錯。例如：

```kotlin
// 會報錯
@JsFun("(mod) => require(mod)")
external fun loadModule(mod: String): JsAny
```

為了準備應對此變更，請將 `@JsFun` 宣告中的頂層 `require()` 呼叫替換為 `@JsModule` 註解：

```kotlin
@JsModule("module")
external val module: Module

external interface Module {
    // 定義預期的模組成員
}
```

對於動態模組載入，請改用 `import()` 運算式。新增 `/* webpackIgnore: true */` 魔術註解以防止 webpack 解析該動態匯入：

```kotlin
@JsFun("""
    ((module) => () => module)(
        await import(/* webpackIgnore: true */ "module")
    )
""")
private external fun loadModuleDynamically(): JsAny?
```

您也可以有條件地使用 `import()` 運算式。例如，您可以僅在 Node.js 中執行時載入模組：

```kotlin
@JsFun("""
    ((module) => () => module)(
        ((typeof process !== "undefined") && (process.release.name === "node"))
            ? await import(/* webpackIgnore: true */ "module")
            : null
    )
""")
private external fun loadNodeModule(): JsAny?
```

如果您的專案相依於需要頂層 `require()` 函式的相依性，可以將其作為 `globalThis` 的屬性加入作為權宜之計：

```kotlin
@JsFun("""
    ((module) => {
        globalThis.require = module.default.createRequire(import.meta.url)
        return () => {}
    })(await import("node:module"))
""")
external fun defineRequire()
```

如果您遇到任何問題，請在我們的[問題追蹤器](https://youtrack.jetbrains.com/projects/KT/issues/KT-86192)分享您的回饋。

### 改進的伴隨物件初始化順序
<secondary-label ref="wasm"/>

Kotlin/Wasm 現在會在子類別伴隨物件之前初始化父類別伴隨物件，與 JVM 行為一致。先前，初始化順序可能會反過來，導致跨平台行為不一致。

此更新改進了跨平台的一致性，並減少了平台特定的類別初始化行為差異。它還能正確處理更深層繼承階層中的伴隨物件初始化，包括中間類別未宣告伴隨物件的情況。

### Kotlin Gradle 外掛程式對 Wasmtime 的支援
<secondary-label ref="wasm"/>

Kotlin %kotlinEapVersion% 引入了對 [Wasmtime](https://docs.wasmtime.dev/) 作為 Kotlin Gradle 外掛程式中 `wasmWasi` 目標執行階段的支援。

先前，`wasmWasi` 目標僅支援 Node.js 執行階段，這需要 JavaScript 引導才能執行 WASI 應用程式。透過 Wasmtime 支援，您現在可以在獨立的 WebAssembly 執行階段上執行 Kotlin/Wasm 應用程式。

若要使用 Wasmtime 作為 `wasmWasi` 目標的執行階段，請將 `wasmtime()` 新增到您的 Gradle 建置檔案中：

```kotlin
kotlin {
    wasmWasi {
        wasmtime()
    }
}
```

我們歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-86633) 中向我們提供回饋。

## Kotlin/JS

Kotlin %kotlinEapVersion% 引入了一種新的實驗性 DSL 用於瀏覽器測試，並新增了支援將 suspend lambda 匯出為 JavaScript async 函式的功能。

### 用於瀏覽器測試的新 DSL
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="js"/>

Kotlin %kotlinEapVersion% 引入了一種新的實驗性 DSL，用於在瀏覽器環境中執行 Kotlin/JS 測試。

目前，Kotlin Gradle 外掛程式使用 [Karma](https://github.com/karma-runner/karma) 作為瀏覽器啟動器，以便在不同的瀏覽器中執行 JavaScript 測試。Karma 專案已經過時 2 年了，這促使我們探索支援瀏覽器測試的替代方案。

新的 DSL 旨在取代 Karma 作為底層不同工具的管理員，其內容包括：

* [Mocha](https://mochajs.org/) 作為測試執行器。
* [Webpack](https://webpack.js.org/) 作為綑綁器（在[未來版本](https://youtrack.jetbrains.com/issue/KT-48308/)中將被 [Vite](https://vite.dev/) 取代）。
* [Playwright](https://playwright.dev/) 作為瀏覽器驅動程式和發行管理員，支援 Chromium、Firefox 和 WebKit (Safari) 瀏覽器引擎。

若要嘗試新的測試 DSL，請在 Kotlin/JS 目標的 `browser{}` 區塊內新增選擇啟用的 `test{}` 區塊：

```kotlin
kotlin {
    js {
        browser {
            @OptIn(ExperimentalJsTestDsl::class)
            // 新增並設定新的 test{} 區塊
            test {
                // 設定所有瀏覽器通用的選項
                browserDefaults {
                    timeout = Duration.ofSeconds(2)
                    headless = true
                }
                // 啟用 Chromium 測試執行器
                chromium {
                    // 覆寫通用的逾時選項
                    timeout = Duration.ofSeconds(5)
                    launchArgs.add("--no-sandbox")
                }
                // 啟用 Firefox 測試執行器
                firefox()
                // 啟用 WebKit 測試執行器
                webkit { }
                // 啟用並設定額外的 WebKit 測試執行器
                webkit("noheadless") {
                    // 設定自訂選項
                    headless = false
                }
            }
        }
    }
}
```

新的 DSL 正在積極開發中。我們歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-66897) 中向我們提供回饋。

### 支援將 suspend lambda 匯出為 async 函式
<secondary-label ref="js"/>

在 Kotlin %kotlinEapVersion% 中，您現在可以將 suspend lambda 匯出為 JavaScript async 函式。

先前，無法從 Kotlin/JS 程式庫中匯出包含 suspend lambda 的宣告。現在 Kotlin 編譯器會自動處理 Kotlin 的 suspend 函式與原生 JavaScript 的 [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) 模型之間的橋接，這對於混合 Kotlin/TypeScript 的程式碼庫非常有用。

若要啟用此功能，請在您的 `build.gradle.kts` 檔案中新增以下編譯器選項：

```kotlin
kotlin {
    js {
        compilations.all {
            compileTaskProvider.configure {
                compilerOptions {
                    freeCompilerArgs.add("-Xsuspend-lambda-exporting")
                }
            }
        }
    }
}
```

然後，使用 `@JsExport` 標記相關宣告：

```kotlin
// Kotlin
@JsExport
class TaskRunner {
    suspend fun runTask(task: suspend () -> String): String {
        return task()
    }
}
```

在 TypeScript 端，suspend lambda 會顯示為一般的 async 函式：

```typescript
// TypeScript
import { TaskRunner } from "..."

const runner = new TaskRunner();
const result = await runner.runTask(async () => "done");
console.log(result); // "done"
```

如需更多關於 `@JsExport` 註解的資訊，請參閱[我們的文件](js-to-kotlin-interop.md#jsexport-annotation)。

## 建置工具 API

### 支援 Kotlin/JS、Kotlin/Wasm 以及 Kotlin 元資料
<primary-label ref="experimental-general"/>
<secondary-label ref="bta"/>

在 [Kotlin 2.2.0](whatsnew22.md#new-experimental-build-tools-api) 中，建置工具 API (BTA) 已可用於 Kotlin/JVM。Kotlin %kotlinEapVersion% 邁出了 BTA 穩定化的下一步，新增了對新目標的支援：Kotlin/JS、Kotlin/Wasm 以及 Kotlin 元資料。

這使得 Kotlin Gradle 外掛程式與編譯器的互動更加一致。在某些情況下，您還可以受益於更快、更穩定的編譯。

BTA 是一個通用 API，充當建置系統與 Kotlin 編譯器生態系統之間的抽象層。它有助於在現有的建置工具中支援 Kotlin 功能以及與 Kotlin 編譯器的相容性。

我們計劃在 Kotlin Gradle 外掛程式中逐步推出對新目標的 BTA 支援：

* 在 Kotlin 2.4.20-Beta1 中，BTA 在 Kotlin/JS、Kotlin/Wasm 和 Kotlin 元資料中預設啟用以收集回饋。專案不需要進行額外的變更。
* 在 Kotlin 2.4.20-Beta2 與最終的 Kotlin 2.4.20 版本之間，新目標中的 BTA 將作為選擇加入功能提供。若要嘗試，請在您的 `gradle.properties` 檔案中設定對應屬性：

  ```kotlin
  kotlin.wasm.runViaBuildToolsApi = true
  kotlin.js.runViaBuildToolsApi = true
  kotlin.metadata.runViaBuildToolsApi = true
  ```

* 從 Kotlin 2.5.0 開始，BTA 將再次在 Kotlin/JS、Kotlin/Wasm 和 Kotlin 元資料中預設啟用。

如果您對 BTA 提案感興趣或想分享您的回饋，請參閱此 [KEEP](https://github.com/Kotlin/KEEP/blob/build-tools-api/proposals/extensions/build-tools-api.md)。

### Kotlin 編譯器：原生映像
<primary-label ref="experimental-general"/>
<secondary-label ref="compiler"/>

Kotlin %kotlinEapVersion% 推出了 Kotlin 編譯器原生映像（native image）的第一個[實驗性](components-stability.md#stability-levels-explained)版本。原生映像提供了標準 `kotlinc` 命令列工具的直接替代方案，同時提供更快的啟動時間和更高的效能。

若要嘗試原生映像，請從 [GitHub Releases](https://github.com/JetBrains/kotlin/releases/tag/v%kotlinEapVersion%) 下載組建。

原生映像還捆綁了以下編譯器外掛程式，您可以透過 `-Xplugin` 或 `-Xcompiler-plugin` CLI 選項使用它們：

* [Serialization](serialization.md)
* [Compose 編譯器](compose-compiler-options.md)
* [All-open](all-open-plugin.md)
* [`no-arg`](no-arg-plugin.md)
* [SAM with receiver](sam-with-receiver-plugin.md)
* [Assignment](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.plugin.assignment)
* [Lombok](lombok.md)
* [Power-assert](power-assert.md)

如需更多關於 Kotlin 編譯器原生映像的資訊，請參閱其 [README](https://github.com/JetBrains/kotlin/blob/master/prepare/compiler-native-image/README.md)。