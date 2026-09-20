[//]: # (title: Kotlin 2.4.20 新功能)

<show-structure depth="1"/>

<web-summary>閱讀 Kotlin 2.4.20 版本資訊，涵蓋新的實驗性功能，以及標準函式庫、Native、Wasm、JS、Gradle、BTA 和 Kotlin 編譯器的更新</web-summary>

_[發布日期：2026 年 9 月 7 日](releases.md#release-history)_

Kotlin 2.4.20 正式推出！以下為本次發布的重點摘要：

* **標準函式庫：** [支援協同程式堆疊追蹤復原、用於檢查集合元素相等性與唯一性的新函式，以及 `kotlin.test` 判斷提示函式的新多載](#standard-library)
* **Kotlin/Native：** [新增 Swift 匯出功能、改善的增量編譯，以及針對 SwiftPM 相依項自動產生 `Package.swift` 檔案](#kotlin-native)
* **Kotlin/Wasm：** [變更 `@JsFun` 宣告中的頂層 `require()` 呼叫、改進伴隨物件的初始化順序、Kotlin Gradle 外掛程式支援 Wasmtime、新增編譯模式，以及縮減函式介面的二進位大小](#kotlin-wasm)
* **Kotlin/JS：** [用於瀏覽器測試的新 DSL、支援將掛起 Lambda 匯出為非同步函式、改進資料類別的可匯出性](#kotlin-js)
* **Gradle：** [支援 Gradle 9.7.0 並改善 Problems API 中的回報機制](#gradle)
* **Build tools API：** [支援新目標：Kotlin/JS、Kotlin/Wasm 和 Kotlin 中繼資料](#build-tools-api)
* **Kotlin 編譯器：** [`kotlinr` 執行器指令以及獨立的原生映像檔](#kotlin-compiler)

您也可以在此影片中查看更新概覽：

<video src="https://www.youtube.com/v/UhRfN7fx5rs" title="Kotlin 2.4.20 新功能"/>

> 如需有關 Kotlin 發布週期的詳細資訊，請參閱 [Kotlin 發布流程](releases.md)。
>
{style="tip"}

## 更新至 Kotlin 2.4.20 {id="update-to-kotlin-2-4-20"}

最新版本的 Kotlin 已隨附於最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)
與 [Android Studio](https://developer.android.com/studio) 中。

若要更新至新的 Kotlin 版本，請確保您的 IDE 已更新至最新版本，並在組建指令碼中[將 Kotlin 版本變更](releases.md#update-to-a-new-kotlin-version)為 2.4.20。

## 新功能 {id=new-stable-features}
<primary-label ref="stable"/>

Kotlin 2.2.20 引入了在 JVM 21 及更高版本上使用 `invokedynamic` 編譯 `when` 運算式的實驗性支援。

在 Kotlin 2.4.20 中，此功能現已晉升為[穩定版 (Stable)](components-stability.md#stability-levels-explained) 並預設啟用。

如需更多資訊，請參閱[說明文件](control-flow.md#bytecode-generation-on-the-jvm)。

## 新功能 {id=new-experimental-features}
<primary-label ref="experimental-exp"/>

本版本提供以下預覽階段功能，包括處於 [Beta](components-stability.md#stability-levels-explained)、[Alpha](components-stability.md#stability-levels-explained) 和 [Experimental](components-stability.md#stability-levels-explained) 狀態的功能：

* [標準函式庫：支援協同程式堆疊追蹤復原](#support-for-coroutine-stack-trace-recovery)
* [標準函式庫：用於檢查集合元素相等性與唯一性的新函式](#new-functions-to-check-collection-elements-for-equality-and-uniqueness)
* [標準函式庫：`kotlin.test` 判斷提示函式的新多載](#new-overloads-for-kotlin-test-assertion-functions)
* [Kotlin/Native：新增 Swift 匯出功能](#new-swift-export-features)
* [Kotlin/Native：改善 `klib` 建置產物的增量編譯](#improved-incremental-compilation-of-klib-artifacts)
* [Kotlin/JS：用於瀏覽器測試的新 DSL](#a-new-dsl-for-browser-testing)
* [Kotlin/JS：支援將掛起 Lambda 匯出為非同步函式](#support-for-exporting-suspending-lambdas-as-async-functions)
* [Build tools API：支援 Kotlin/JS、Kotlin/Wasm 和 Kotlin 中繼資料](#support-for-kotlin-js-kotlin-wasm-and-kotlin-metadata)
* [Kotlin 編譯器：獨立的原生映像檔](#native-image)

## 標準函式庫 {id="standard-library"}

Kotlin 2.4.20 新增了對協同程式堆疊追蹤復原的支援，並引入了用於檢查集合元素相等性與唯一性的新函式，以及 `kotlin.test` 判斷提示函式的新多載。

### 支援協同程式堆疊追蹤復原 {id="support-for-coroutine-stack-trace-recovery"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin 2.4.20 在標準函式庫中新增了 [`StackTraceRecoverable`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines.debug/-stack-trace-recoverable/) 介面。這改善了與 `kotlinx.coroutines` 函式庫的整合，因為它允許您定義如何建立新的例外狀況執行個體以進行堆疊追蹤復原，而無需新增對 `kotlinx.coroutines` 的相依性。

當一個協同程式擲出例外狀況且另一個協同程式重新擲出它時，堆疊追蹤復原可協助進行偵錯。它讓您能夠查看例外狀況最初發生的位置，以及另一個協同程式在哪裡重新擲出它。

`kotlinx.coroutines` 函式庫透過建立帶有額外協同程式堆疊追蹤資訊的新例外狀況執行個體來執行堆疊追蹤復原。對於建構函式僅接受例外狀況訊息、原因 (cause)、兩者兼有或不接受任何引數的例外狀況，此過程會自動進行。

如果例外狀況建構函式需要額外的必填引數（例如行號或錯誤碼），請實作 `StackTraceRecoverable` 介面來定義 `kotlinx.coroutines` 函式庫如何建立該例外狀況的新執行個體。

若要實作此介面，請覆寫 [`copyForStackTraceRecovery()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines.debug/-stack-trace-recoverable/copy-for-stack-trace-recovery.html) 函式。在覆寫中傳回一個用於堆疊追蹤復原的新例外狀況執行個體；若不希望 `kotlinx.coroutines` 函式庫複製該例外狀況，則傳回 `null`。

> `StackTraceRecoverable` 介面在所有目標上皆可使用，但 `kotlinx.coroutines`
> 函式庫僅在 JVM 上將其用於堆疊追蹤復原。
>
{style="note"}

這些 API 處於[實驗性階段 (Experimental)](components-stability.md#stability-levels-explained)，需要透過 `@OptIn(ExperimentalStdlibCoroutineSupportApi::class)` 註解選擇加入。

以下範例展示了自訂例外狀況在建立用於堆疊追蹤復原的新執行個體時如何保留 `line` 屬性：

```kotlin
import kotlin.coroutines.ExperimentalStdlibCoroutineSupportApi
import kotlin.coroutines.debug.StackTraceRecoverable

@OptIn(ExperimentalStdlibCoroutineSupportApi::class)
class FileEditException
// 該實作需要一個 private 建構函式
// 以便將 cause 傳遞給 IllegalStateException 建構函式
private constructor(
    val line: Int,
    private val detail: String,
    cause: Throwable?,
) : IllegalStateException("When editing line $line: $detail", cause),
    // 實作 StackTraceRecoverable 以支援堆疊追蹤復原
    StackTraceRecoverable<FileEditException> {

    constructor(line: Int, detail: String) : this(line, detail, null)

    // 複製行號與訊息詳細資訊
    override fun copyForStackTraceRecovery(): FileEditException =
        FileEditException(line, detail, this)
    }

fun main() {
    val original = FileEditException(15, "Unexpected token")

    // 通常除非要測試其行為，否則無需直接呼叫此函式
    // kotlinx.coroutines 函式庫會在堆疊追蹤復原期間自動叫用它
    val copy = original.copyForStackTraceRecovery()

    println(copy.message)
    // When editing line 15: Unexpected token

    println(copy.cause == original)
    // true
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.20"}

如需更多資訊，請參閱該功能的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/stdlib/KEEP-0461-stacktrace-recoverable.md)。

歡迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-86595) 中向我們提供回饋。

### 用於檢查集合元素相等性與唯一性的新函式 {id="new-functions-to-check-collection-elements-for-equality-and-uniqueness"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

在 Kotlin 2.4.20 之前，若想檢查集合元素是否全部不同或全部相等，必須使用效率較低的程式碼模式。

Kotlin 2.4.20 引入了實驗性函式來填補這一空白：

| 函式 | 檢查項目 |
|---|---|
| [`allDistinct()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/all-distinct.html) | 集合中的每個值都是唯一的。 |
| [`allDistinctBy()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/all-distinct-by.html) | 每個物件在所選屬性上都具有唯一值。 |
| [`allEqual()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/all-equal.html) | 集合中的每個值都相同。 |
| [`allEqualBy()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/all-equal-by.html) | 每個物件在所選屬性上都具有相同的值。 |

您可以在集合、序列和陣列上使用這些函式。與其他集合操作一樣，它們使用結構相等性來比較元素。

這些函式處於[實驗性階段 (Experimental)](components-stability.md#stability-levels-explained)，需要透過 `@OptIn(ExperimentalStdlibApi::class)` 註解或 `-opt-in=kotlin.ExperimentalStdlibApi` 編譯器選項選擇加入：

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

    // 檢查所有參與者是否給出相同的答案
    println(responses.allEqualBy { it.answer })
    // false

    // 檢查是否有重複的參與者
    println(responses.allDistinctBy { it.participantId })
    // true

    // 檢查所有回應是否在同一日期提交
    println(responses.allEqualBy { it.responseDate })
    // true

    val answers = responses.map { it.answer }

    // 檢查答案是否完全相同
    println(answers.allEqual())
    // false

    // 檢查答案是否互不相同
    println(answers.allDistinct())
    // true
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.20"}

歡迎在 [KEEP](https://github.com/Kotlin/KEEP/discussions/495) 中向我們提供回饋。

### `kotlin.test` 判斷提示函式的新多載 {id="new-overloads-for-kotlin-test-assertion-functions"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="standard-library"/>

Kotlin 2.4.20 為 `kotlin.test` 判斷提示函式新增了多載。它們接受一個延遲產生錯誤訊息的 Lambda，僅在判斷提示失敗時才會執行。

在此之前，像 `assertTrue()` 或 `assertEquals()` 這樣的 `kotlin.test` 判斷提示函式僅接受預先格式化的錯誤訊息，該訊息在每次判斷提示時都會建構，即使判斷提示成功且訊息從未被實際使用時也是如此。

新的多載使 `kotlin.test` API 與 JUnit 5 保持一致，改為透過 Lambda 接收訊息提供程式，而非純字串。這能提升效能，特別是對於會為判斷提示產生詳細錯誤訊息的 [Power-assert 編譯器外掛程式](power-assert.md)而言。

以下判斷提示函式提供了新的多載：

| 函式 | 說明 |
|---|---|
| [`assertTrue()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-true.html) / [`assertFalse()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-false.html) | 檢查值是否為 `true` 或 `false`。 |
| [`assertEquals()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-equals.html) / [`assertNotEquals()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-not-equals.html) | 檢查值是否相等。 |
| [`assertSame()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-same.html) / [`assertNotSame()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-not-same.html) | 檢查值是否參照同一個執行個體。 |
| [`assertIs()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-is.html) / [`assertIsNot()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-is-not.html) | 檢查值是否為指定型別。對於 `assertIs()`，該函式會智慧型轉換為該型別。 |
| [`assertNull()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-null.html) | 檢查值是否為 `null`。 |
| [`assertContains()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-contains.html) | 檢查集合、陣列、序列、區間或 Map 中是否存在該元素（鍵、字元、子字串或正規表示式）。 |
| [`assertContentEquals()`](https://kotlinlang.org/api/core/kotlin-test/kotlin.test/assert-content-equals.html) | 檢查集合、序列或陣列是否包含相同順序的相等元素。 |

若要使用新 API，請使用 `@OptIn(ExperimentalKotlinTestApi::class)` 註解明確選擇加入：

```kotlin
import kotlin.test.ExperimentalKotlinTestApi
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@OptIn(ExperimentalKotlinTestApi::class)
fun testValues(actual: Int, expected: Int, items: List<String>) {
    // 僅在判斷提示失敗時才建構訊息
    assertTrue(actual > 0) { "Expected a positive value but got $actual" }

    // 避免格式化清單，除非判斷提示失敗
    assertEquals(expected, actual) { "Unexpected value for items: ${items.joinToString()}" }
}
```

如需更多資訊，請參閱該功能的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/stdlib/KEEP-0465-kotlin.test-lazy-assertion-messages.md)。

## Kotlin/Native {id="kotlin-native"}

Kotlin 2.4.20 為 Kotlin Multiplatform 專案中的 SwiftPM 相依項帶來了自動產生 `Package.swift` 檔案的功能、新的 Swift 匯出功能（包括對密封類別與跨語言繼承的支援），以及改進的增量編譯。

### 為 SwiftPM 相依項產生 `Package.swift` {id="generated-package-swift-for-swiftpm-dependencies"}
<secondary-label ref="native"/>

匯出相依於 SwiftPM 套件的 XCFramework 時，必須發布產生的 SwiftPM 套件才能使其正確解析。為了解決這個問題，`assembleSharedXCFramework` Gradle 任務現在會產生一個 `Package.swift` 檔案，以便隨 XCFramework 一起發布。

如需詳細資訊，請參閱 [SwiftPM 匯出頁面](https://kotlinlang.org/docs/multiplatform/multiplatform-spm-export.html)。

### 新 Swift 匯出功能 {id="new-swift-export-features"}
<primary-label ref="alpha"/>
<secondary-label ref="native"/>

#### 密封類別 {id="sealed-classes"}

Kotlin 2.4.20 在 Swift 匯出中新增了對密封類別與介面的支援。

以往，針對密封型別進行 `switch` 陳述式比對時，必須為每個陳述式撰寫一個 `default` 條件分支。現在，Kotlin 中定義的密封階層會對應到 Swift 列舉，從而在 Xcode 中實現具有完整自動補全的窮舉性 `switch` 陳述式。

Swift 匯出會在每個密封型別上產生一個 `sealedType()` 方法。該方法會傳回一個 Swift 列舉，其 case 與密封階層的直接子類別相符。您可以巢狀呼叫這些方法，以比對階層中更深層級的子類別。

例如，在 Kotlin 中宣告一個帶有類別階層的密封介面：

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

在 Swift 端，您可以使用窮舉性的 `switch`，而無需撰寫 `default` 分支：

```swift
// Swift
let shape = createCircle()

let name = switch shape.sealedType() {
    case let .circle(type): "It's a \(type.value)"
    case let .rectangle(type): "It's a \(type.value)"
}
// name == "It's a Circle"
```

由於 `switch` 是窮舉性的，如果密封階層中新增了子類別，編譯器將會發出警告，讓您可以立即進行處理，而無需依賴 `default` 分支。

#### Swift 匯出中的跨語言繼承 {id="cross-language-inheritance-in-swift-export"}

Kotlin 2.4.20 在 Swift 匯出中引入了跨語言繼承支援。

此功能常見的使用案例是[反向匯入](native-lib-import-stability.md#swift-library-import)模式：您在 Kotlin 中定義協定 (contract)，並在 Swift 端提供平台專屬的實作。當您需要使用無法直接匯入 Kotlin 的純 Swift 函式庫時，這項功能特別有用。

若要實作此模式，請在 Kotlin 宣告一個供 Swift 實作繼承的超類別以及一個 Kotlin 介面。接著在 Swift 中實作此介面，並將 Swift 物件傳遞給接受該介面的 Kotlin 函式。例如針對 CryptoKit 函式庫：

1. 在 Kotlin 端宣告一個介面、一個接受該介面的函式，以及一個 `open` 基底類別：

   ```kotlin
   // Kotlin
   interface CryptoProvider {
       fun hashMD5(input: String): String
   }

   fun processHash(provider: CryptoProvider, input: String): String = provider.hashMD5(input)

   open class SwiftBase
   ```

2. 在 Swift 端繼承匯出的 `SwiftBase` 類別，使用純 Swift 函式庫實作該介面，並將物件傳回給 Kotlin：

   ```swift
   // Swift
   import CryptoKit

   final class IosCryptoProvider: SwiftBase, CryptoProvider {
       func hashMD5(input: String) -> String {
           guard let data = input.data(using: .utf8) else { return "failed" }
           return Insecure.MD5.hash(data: data).description
       }
   }

   let provider = IosCryptoProvider()

   // 呼叫 Kotlin 函式，該函式會反向呼叫 Swift 中的 hashMD5()
   print(processHash(provider: provider, input: "Hello, world!"))
   ```

當 Kotlin 收到 Swift 物件時，會將其視為一般介面的實作，直接呼叫 Swift 程式碼。

如需有關 Swift 匯出的詳細資訊，請參閱我們的[說明文件](native-swift-export.md)。

### 改善 `klib` 建置產物的增量編譯 {id="improved-incremental-compilation-of-klib-artifacts"}
<primary-label ref="beta"/>
<secondary-label ref="native"/>

Kotlin 2.4.20 帶來了對 `klib` 建置產物增量編譯的穩定性改進，該功能目前已進入 [Beta 階段](components-stability.md#kotlin-native)。

此最佳化最早於 [Kotlin 1.9.20](whatsnew1920.md#incremental-compilation-of-klib-artifacts) 引入，事實證明它可大幅縮短偵錯組建的編譯時間。自那時起，我們修正了許多錯誤並改進了效能。

若要嘗試增量編譯，請將以下選項新增至您的 `gradle.properties` 檔案：

```properties
kotlin.incremental.native=true
```

我們正在積極收集回饋，並計劃在未來的 Kotlin 版本中為所有專案預設啟用增量編譯。如果您遇到任何問題，請回報至我們的[問題追蹤器](https://kotl.in/issue)。

## Kotlin/Wasm {id="kotlin-wasm"}

Kotlin 2.4.20 變更了 Kotlin/Wasm 處理 `@JsFun` 宣告中頂層 `require()` 呼叫的方式、使伴隨物件的初始化順序與 JVM 行為保持一致、縮減了函式介面的二進位大小、引入了新的編譯模式，並在 Kotlin Gradle 外掛程式中新增了對 Wasmtime 作為 `wasmWasi` 目標執行時的支援。

### 變更 `@JsFun` 宣告中的頂層 `require()` 呼叫 {id="changes-to-top-level-require-calls-in-jsfun-declarations"}
<secondary-label ref="wasm"/>

Kotlin/Wasm 現在會在 [`@JsFun`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-js-fun/) 宣告使用頂層 `require()` 函式時回報錯誤。

此前，編譯器會在 `import-object.mjs` 檔案中產生一個 `require` 變數，允許 `@JsFun` 宣告呼叫 `require()`。

這種行為無意間暴露了編譯器的實作細節。為了協助從中遷移，Kotlin/Wasm 移除了此產生的 `require` 宣告，編譯器現在會針對此類呼叫回報錯誤。例如：

```kotlin
// 回報錯誤
@JsFun("(mod) => require(mod)")
external fun loadModule(mod: String): JsAny
```

為適應此項變更，請將 `@JsFun` 宣告中的頂層 `require()` 呼叫替換為 [`@JsModule`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.js/-js-module/) 註解：

```kotlin
@JsModule("module")
external val module: Module

external interface Module {
    // 定義預期的模組成員
}
```

若需動態載入模組，請改用 `import()` 運算式。
新增 `/* webpackIgnore: true */` 魔法註解，以防止 webpack 解析動態匯入：

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

如果您的專案依賴需要頂層 `require()` 函式的相依項，可以將其作為 `globalThis` 的屬性新增以作為變通方案：

```kotlin
@JsFun("""
    ((module) => {
        globalThis.require = module.default.createRequire(import.meta.url)
        return () => {}
    })(await import("node:module"))
""")
external fun defineRequire()
```

如果您遇到任何問題，請在我們的[問題追蹤器](https://youtrack.jetbrains.com/issue/KT-86192)中分享您的回饋。

### 改善伴隨物件初始化順序 {id="improved-companion-object-initialization-order"}
<secondary-label ref="wasm"/>

Kotlin/Wasm 現在會在子類別伴隨物件之前初始化超類別伴隨物件，與 JVM 行為相符。在此之前，初始化順序可能會相反，導致不同平台之間的行為不一致。

此更新改善了跨平台的一致性，並減少了類別初始化行為中的平台專屬差異。它還能正確處理較深繼承階層中的伴隨物件初始化，包括中介類別未宣告伴隨物件的情況。

### Kotlin Gradle 外掛程式支援 Wasmtime {id="support-for-wasmtime-in-the-kotlin-gradle-plugin"}
<secondary-label ref="wasm"/>

Kotlin 2.4.20 引入了對 [Wasmtime](https://docs.wasmtime.dev/) 作為 Kotlin Gradle 外掛程式中 `wasmWasi` 目標執行時的支援。

此前，`wasmWasi` 目標僅支援 Node.js 執行時，其需要 JavaScript 啟動程式 (bootstrap) 來執行 WASI 應用程式。藉由 Wasmtime 支援，您現在可以在獨立的 WebAssembly 執行階段上執行 Kotlin/Wasm 應用程式。

若要在 `wasmWasi` 目標中使用 Wasmtime 作為執行時，請在 Gradle 組建檔案中新增 `wasmtime()`：

```kotlin
kotlin {
    wasmWasi {
        wasmtime()
    }
}
```

歡迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-86633) 中向我們提供回饋。

### 新編譯模式 {id="new-compilation-modes"}
<secondary-label ref="wasm"/>

Kotlin 2.4.20 新增了選擇 Kotlin/Wasm 編譯模式的支援，包括新的多模組模式。在此之前，編譯器使用單一整合式 (monolith) 編譯模式，將專案及其相依項一起編譯並產生單一二進位檔。這使編譯器能夠執行無效程式碼消除並產生最小的輸出。

您現在可以選擇以下其中一種編譯模式：

| 編譯模式 | 編譯方式 | 輸出 | 最佳化行為 |
|---|---|---|---|
| `monolith`（預設） | 將專案及其相依項一起編譯。 | 單一二進位檔 | 移除無法到達的宣告，並對整個程式（包括相依項）套用最佳化。 |
| `multimodule-open-world` | 獨立編譯每個模組，並且僅重新編譯變更的模組。 | 每個模組產生個別、獨立的二進位檔 | 不套用跨模組最佳化，這會導致二進位檔較大。 |
| `multimodule-closed-world` | 在一次叫用中處理所有模組，並且僅重新編譯變更的模組。 | 產生相互依賴的個別二進位檔 | 移除無法到達的宣告，但獨立最佳化每個 Wasm 二進位檔。 |

若要選擇編譯模式，請將 `kotlin.wasm.compilationMode` 屬性新增至您的 `gradle.properties` 檔案中：

```properties
kotlin.wasm.compilationMode=multimodule-open-world
```

您也可以將 Kotlin/Wasm 設定為在開發組建中使用封閉世界多模組編譯，並在正式環境組建中使用單一整合式編譯。這可以減少開發期間的重新編譯時間，並為正式環境組建產生最小的輸出。

若要使用此設定，請將以下屬性新增至您的 `gradle.properties` 檔案：

```properties
kotlin.wasm.compilationMode=multimodule-closed-world-only-in-dev
```

歡迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-86919) 中向我們提供回饋。

### 縮減 Lambda 與函式介面的二進位大小 {id="reduced-binary-size-for-lambdas-and-functional-interfaces"}
<secondary-label ref="wasm"/>

Kotlin 2.4.20 變更了 Kotlin/Wasm 編譯 Lambda 和函式介面的方式。編譯器現在會產生函式並使用共用基底類別，而不是產生個別的匿名類別。

使用 [KotlinConf 應用程式](https://github.com/JetBrains/kotlinconf-app) 進行的測試顯示，此變更可將 Wasm 二進位大小縮減約 5–10%。

由於此變更引入了更多動態呼叫，可能會影響執行階段效能。如果您遇到任何問題，請在我們的[問題追蹤器](https://youtrack.jetbrains.com/issue/KT-83159)中進行回報。

## Kotlin/JS {id="kotlin-js"}

Kotlin 2.4.20 改善了資料類別的可匯出性、引入了用於瀏覽器測試的全新實驗性 DSL，並新增了將掛起 Lambda 匯出為 JavaScript 非同步函式的支援。

### 匯出資料類別上的合成函式具有一致的可匯出性 {id="consistent-exportability-of-synthetic-functions-on-exported-data-classes"}
<secondary-label ref="js"/>

Kotlin 2.4.20 修正了一個導致 `@JsExport.Ignore` 註解無法正確套用於資料類別屬性的問題。

此前，當您使用 `@JsExport` 註解標記資料類別時，由於自動產生的 `copy()` 和 `componentN()` 函式，編譯器仍會回報有關該資料類別可匯出性的警告。即使建構函式和屬性已被明確標記為 `@JsExport.Ignore`，這種情況依然會發生。

例如，考慮匯出至 JavaScript 的 `Session` 資料類別，該類別同時參照了一個不打算匯出的內部 `DatabaseConnection` 型別：

```kotlin
// Kotlin
// 未匯出至 JavaScript 的內部型別
class DatabaseConnection

@JsExport
data class Session @JsExport.Ignore constructor(
    val userId: String,
    @JsExport.Ignore val connection: DatabaseConnection,
)
```

該問題修正後，編譯器會將 `@JsExport.Ignore` 註解納入考量，因此 `Session` 的合成 `copy()` 和 `componentN()` 函式不再觸發有關未匯出型別 `DatabaseConnection` 的警告。這與 [`@ConsistentCopyVisibility` 和 `@ExposedCopyVisibility` 註解](whatsnew2020.md#data-class-copy-function-to-have-the-same-visibility-as-constructor)引入的可見度規則保持一致。

### 用於瀏覽器測試的新 DSL {id="a-new-dsl-for-browser-testing"}
<primary-label ref="experimental-opt-in"/>
<secondary-label ref="js"/>

Kotlin 2.4.20 引入了一個新的實驗性 DSL，用於在瀏覽器環境中執行 Kotlin/JS 測試。

目前，Kotlin Gradle 外掛程式使用 [Karma](https://github.com/karma-runner/karma) 作為瀏覽器啟動器以跨不同瀏覽器執行 JavaScript 測試。Karma 專案已被棄用兩年，促使我們探索支援瀏覽器測試的其他替代途徑。

新的 DSL 旨在取代 Karma 作為底層不同工具的管理器，其中包括：

* [Playwright](https://playwright.dev/)：作為瀏覽器驅動程式和發行管理器，支援 Chromium、Firefox 和 WebKit (Safari) 瀏覽器引擎。
* [Mocha](https://mochajs.org/)：作為測試執行器。
* [webpack](https://webpack.js.org/)：作為打包器（將在[未來版本](https://youtrack.jetbrains.com/issue/KT-48308/)中替換為 [Vite](https://vite.dev/)）。

若要嘗試用於瀏覽器測試的新 DSL，請在 Kotlin/JS 目標的 `browser {}` 內新增選擇加入的 `test {}` 區塊：

```kotlin
import org.jetbrains.kotlin.gradle.ExperimentalJsTestDsl
import kotlin.time.Duration.Companion.seconds

kotlin {
    js {
        browser {
            // 新增並設定新的 test {} 區塊
            @OptIn(ExperimentalJsTestDsl::class)
            test {
                // 為所有執行器設定預設逾時時間
                timeout = 2.seconds
                // 使用 Gradle provider 設定無周邊 (headless) 模式
                headless = providers
                    .environmentVariable("IS_IN_CI")
                    .map { it.toBoolean() }
                    .orElse(false)
                // 啟用並設定 Chromium 測試執行器
                chromium {
                    // 覆寫通用逾時選項
                    timeout = 5.seconds
                    // 新增額外的啟動引數
                    launchArgs.add("--no-sandbox")
                }
                // 啟用 Firefox 測試執行器
                firefox()
                // 啟用 WebKit 測試執行器
                webkit()
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

用於瀏覽器測試的新 DSL 正在積極開發中。歡迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-66897) 中向我們提供回饋。

如需更多資訊，請參閱[在 Kotlin/JS 中執行測試](js-running-tests.md)。

### 支援將掛起 Lambda 匯出為非同步函式 {id="support-for-exporting-suspending-lambdas-as-async-functions"}
<primary-label ref="experimental-general"/>
<secondary-label ref="js"/>

在 Kotlin 2.4.20 中，您現在可以將掛起 [Lambda 運算式](lambdas.md#lambda-expressions-and-anonymous-functions)匯出為 JavaScript `async` 函式。

此前，無法從 Kotlin/JS 函式庫中匯出包含掛起 Lambda 的宣告。現在 Kotlin 編譯器會自動處理 Kotlin 的 `suspend` 函式與 JavaScript 原生 [`async`/`await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) 模型之間的橋接，這對於 Kotlin/TypeScript 混合程式碼庫非常有用。

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

接著，使用 `@JsExport` 標記相關宣告：

```kotlin
// Kotlin
@JsExport
class TaskRunner {
    suspend fun runTask(task: suspend () -> String): String {
        return task()
    }
}
```

在 TypeScript 端，掛起 Lambda 會以一般的 `async` 函式呈現：

```typescript
// TypeScript
import { TaskRunner } from "..."

const runner = new TaskRunner();
const result = await runner.runTask(async () => "done");
console.log(result); // "done"
```

如需有關 `@JsExport` 註解的更多資訊，請參閱我們的[說明文件](js-to-kotlin-interop.md#jsexport-annotation)。

## Gradle {id="gradle"}

Kotlin 2.4.20 與 Gradle 7.6.3 至 9.7.0 完全相容。您也可以使用最新的 Gradle 發布版本。但請注意，這樣做可能會產生棄用警告，且部分 Gradle 新功能可能無法正常運作。

Kotlin 2.4.20 也改善了與 Problems API 的整合。

### 改善 Problems API 中的回報機制 {id="improved-reporting-in-problems-api"}
<secondary-label ref="gradle"/>

Kotlin 2.2.0 是第一個將 [Kotlin Gradle 外掛程式 (KGP) 與 Gradle Problems API 進行整合](whatsnew22.md#integration-of-problems-api-within-kgp-diagnostics)的版本。Kotlin 2.4.0 新增了[針對 Kotlin/JVM 將編譯器訊息寫入 Problems API](whatsnew24.md#compiler-messages-written-to-problems-api-for-kotlin-jvm) 的支援。

Kotlin 2.4.20 在編譯器傳遞給 [Problems API](https://docs.gradle.org/current/kotlin-dsl/gradle/org.gradle.api.problems/index.html) 的資訊中新增了編譯器診斷 ID。它還會按這些 ID 對診斷進行分組，使找出編譯問題的來源變得更加容易。

從 Gradle 8.6 開始，KGP 預設啟用此整合。由於該 API 仍在演進中，建議使用最新的 Gradle 版本以獲得最新的改良功能。

## Build tools API {id="build-tools-api"}

Kotlin 2.4.20 在 build tools API 中新增了對 Kotlin/JS、Kotlin/Wasm 和 Kotlin 中繼資料的實驗性支援。

### 支援 Kotlin/JS、Kotlin/Wasm 和 Kotlin 中繼資料 {id="support-for-kotlin-js-kotlin-wasm-and-kotlin-metadata"}
<primary-label ref="experimental-general"/>
<secondary-label ref="bta"/>

在 [Kotlin 2.2.0](whatsnew22.md#new-experimental-build-tools-api) 中，build tools API (BTA) 開始支援 Kotlin/JVM。Kotlin 2.4.20 邁出了邁向 BTA 穩定化的下一步，新增了對新目標的支援：Kotlin/JS、Kotlin/Wasm 和 Kotlin 中繼資料。

這使得 Kotlin Gradle 外掛程式與編譯器之間的互動更加一致。在某些情況下，您還可以享受到更快、更穩定的編譯體驗。

BTA 是一個通用 API，在建構系統與 Kotlin 編譯器生態系統之間充當抽象層。它有助於在現有的建置工具中支援 Kotlin 功能以及與 Kotlin 編譯器的相容性。

在 Kotlin 2.4.20 中，BTA 針對新目標以選擇加入 (opt-in) 形式提供。若要嘗試此功能，請將相應屬性新增至您的 `gradle.properties` 檔案：

```properties
kotlin.wasm.runViaBuildToolsApi=true
kotlin.js.runViaBuildToolsApi=true
kotlin.metadata.runViaBuildToolsApi=true
```

從 Kotlin 2.5.0 開始，我們計劃在 Kotlin/JS、Kotlin/Wasm 和 Kotlin 中繼資料中預設啟用 BTA。

如果您對 BTA 提案感興趣或想分享回饋，請參閱這份 [KEEP](https://github.com/Kotlin/KEEP/blob/build-tools-api/proposals/extensions/build-tools-api.md)。

## Kotlin 編譯器 {id="kotlin-compiler"}

Kotlin 2.4.20 包含了關於變更 Kotlin 執行器指令 `kotlinr` 的更新，並引入了實驗性的 Kotlin 編譯器原生映像檔。

### 將 Kotlin 執行器指令從 `kotlin` 變更為 `kotlinr` {id="changed-the-kotlin-runner-command-from-kotlin-to-kotlinr"}
<secondary-label ref="compiler"/>

`kotlinr` 指令取代 `kotlin` 作為 Kotlin 執行器指令，以避免與 [Kotlin Toolchain](https://kotlin-toolchain.org/latest/) 中的 `kotlin` 指令發生命名衝突。當您使用 `kotlin` 指令時，Kotlin 執行器也會發出警告，並建議改用 `kotlinr`。

### 原生映像檔 {id="native-image"}
<primary-label ref="experimental-general"/>
<secondary-label ref="compiler"/>

Kotlin 2.4.20 推出了 Kotlin 編譯器原生映像檔的第一個[實驗性 (Experimental)](components-stability.md#stability-levels-explained) 版本。原生映像檔提供了標準 `kotlinc` 命令列工具的即插即用替代方案，同時具有更快的啟動時間與更高的效能。

若要試用原生映像檔，請從 [GitHub Releases](https://github.com/JetBrains/kotlin/releases/tag/v2.4.20) 下載組建。

原生映像檔還搭售了以下編譯器外掛程式，您可以搭配 `-Xplugin` 或 `-Xcompiler-plugin` CLI 選項使用：

* [Serialization](serialization.md)
* [Compose 編譯器](compose-compiler-options.md)
* [All-open](all-open-plugin.md)
* [`no-arg`](no-arg-plugin.md)
* [SAM with receiver](sam-with-receiver-plugin.md)
* [Assignment](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.plugin.assignment)
* [Lombok](lombok.md)
* [Power-assert](power-assert.md)

如需有關 Kotlin 編譯器原生映像檔的更多資訊，請參閱其 [README](https://github.com/JetBrains/kotlin/blob/master/prepare/compiler-native-image/README.md)。

## 破壞性變更與棄用 {id="breaking-changes-and-deprecations"}

本節列出重要的破壞性變更與棄用項目。如需完整概觀，請參閱我們的[相容性指南](compatibility-guide-24.md)。

* 由於 Apple 正在終止對 32 位元 watchOS 目標的支援，`watchosArm32` [Kotlin/Native](native-target-support.md) 目標現已被棄用。計劃在 Kotlin 2.5.0 中將其移除，以確保與 Xcode 27 的相容性。
* 從 Kotlin 2.4.20 開始，Kotlin/Native 編譯器禁止在 `public` 內嵌函式內部，或在從其他檔案呼叫的 `internal` 內嵌函式內部執行 AtomicFU 原子操作。
* Kotlin 2.4.20 將 webpack 的 npm 相依項更新至 5.108.1。這可能會在兩個方面影響您的專案：
  * webpack 已將其內建的 minimizer 相依項從 `terser-webpack-plugin` 遷移到範圍更廣的 [`minimizer-webpack-plugin`](https://www.npmjs.com/package/minimizer-webpack-plugin)。Terser 仍是預設的 JavaScript minimizer，但如果您的專案直接設定或依賴 `terser-webpack-plugin`，您可能需要更新其設定。
  * webpack 在判斷 JavaScript 檔案的模組型別時不再忽略 `import.meta`。如果存在 `import.meta`，webpack 會將該檔案視為 ES 模組，這可能會破壞同時使用 CommonJS 結構的檔案。對於 Kotlin/JS，您[可以使用 `useEsModules()` Gradle DSL 將目標設定為使用 ES 模組](js-modules.md#choose-the-target-module-system)。Kotlin/Wasm 在大多數情況下無需額外設定即可正常運作。如果您在 Kotlin/Wasm 中遇到 `import.meta` 錯誤，請檢查專案的原始碼或直接／傳遞相依項是否使用了 `import.meta`。視需要更新您自己的程式碼。如果是相依項導致此問題，請更新至相容版本（如果有的話），或將問題回報給函式庫維護者。
* 從 Kotlin 2.4.20 開始，Kotlin/Wasm 棄用了產生的 JavaScript `wasmExports` API。編譯器禁止存取除 `wasmExports.memory` 以外的所有匯出項目，後者暫時可用但會伴隨警告。請使用 `kotlin.wasm.unsafe.wasmMemory` 屬性存取模組的 `WebAssembly.Memory` 物件。

## 說明文件更新 {id="documentation-updates"}

自上一個版本以來，我們為 Kotlin 生態系統說明文件新增了新頁面與教學，並修訂了現有內容：

* [設定 iOS 傳遞管線](https://kotlinlang.org/docs/multiplatform/ios-ci-cd-teamcity.html) – 使用 TeamCity 為 Kotlin Multiplatform iOS 應用程式設定持續傳遞。
* Compose Multiplatform 更新：
  * [快顯視窗 (Popups)](https://kotlinlang.org/docs/multiplatform/compose-popups.html) – 了解如何在 Compose Multiplatform 中建立與設定快顯視窗。
  * [視窗與對話方塊 API v2](https://kotlinlang.org/docs/multiplatform/compose-desktop-top-level-windows-management.html#window-and-dialog-api-v2) – 探索在 Compose Multiplatform 桌面端管理視窗與對話方塊的新 API。
  * [系統匣與通知](https://kotlinlang.org/docs/multiplatform/compose-desktop-tray.html) – 了解如何在桌面版 Compose Multiplatform 中將應用程式圖示新增至系統匣並傳送系統通知。
  * [功能表列](https://kotlinlang.org/docs/multiplatform/compose-desktop-menu-bar.html) – 了解如何在桌面版 Compose Multiplatform 中為特定視窗建立功能表列。
  * [拖放操作](https://kotlinlang.org/docs/multiplatform/compose-drag-drop.html#platform-specific-data-handling) – 在 Compose Multiplatform 中實作拖放時處理平台專屬資料。
  * [Liquid Glass 的 UIKit 替代方案](https://kotlinlang.org/docs/multiplatform/ios-liquid-glass.html#alternative-skip-swiftui-and-drive-uikit-from-kotlin) – 探索 Liquid Glass 的替代方法，使用 UIKit 導覽取代 SwiftUI。
  * [適用於 AI Agent 的 MCP 伺服器](https://kotlinlang.org/docs/multiplatform/compose-hot-reload.html#mcp-server-for-ai-agents) – 了解如何使用 Compose Hot Reload 中的 MCP 伺服器將 AI agent 連接到您的開發工作流程中。
* [使用 Spring 進行快取](https://spring.io/guides/gs/caching) – 透過新的 Kotlin 範例了解如何為 Spring 應用程式新增快取機制。
* [Exposed IntelliJ IDEA 外掛程式](https://www.jetbrains.com/help/idea/exposed.html) – 了解如何利用程式碼補全、識別資料庫的檢查以及即時範本，在 IntelliJ IDEA 中使用 Exposed。
* [Kotlin 序列化](serialization.md) – 了解如何序列化 Kotlin 資料、自訂 JSON 結構與型別表示法，以及處理更進階的序列化情境。
* [Flow](coroutines-flow.md) 與 [Flow 運算子](coroutines-flow-operators.md) – 了解如何建立與收集冷流 (cold flow) 及熱流 (hot flow)、處理例外狀況，並使用廣泛的 Flow 運算子。
* [偵錯協同程式](coroutines-debugging.md) – 了解如何在 JVM 上使用偵錯模式、堆疊追蹤復原及偵錯代理程式來偵錯協同程式。
* Lincheck – 了解 Lincheck 中的[模型檢查 (model checking)](lincheck-model-checking.md) 如何運作、如何使用[操作執行選項](lincheck-operation-execution-options.md)，以及如何[驗證](lincheck-results-validation.md)測試結果。
* [kapt 編譯器外掛程式](kapt.md) – 了解如何在 Gradle、Maven 和命令列編譯器中設定 kapt 編譯器外掛程式。
* [Kotlin 專案中的程式碼品質工具](jvm-code-analysis.md) – 探索用於分析 JVM 位元組碼和 Kotlin 程式碼的工具。
* [在 Maven 中使用 Power-assert 外掛程式](jvm-test-maven.md#get-detailed-failure-messages) – 了解如何使用 Power-assert 外掛程式取得更詳細的測試失敗訊息。
* [使用 KSP 進行多輪處理](ksp-multi-round.md) – 探索 KSP 如何跨多個處理輪次運作，包括產生的檔案、延遲符號 (deferred symbols) 與驗證。
* 不可指示型別 (Non-denotable types) – 了解 Kotlin 中的[平台型別](java-interop.md#null-safety-and-platform-types)、[捕獲型別](generics.md#captured-types)與[交集型別](typecasts.md#intersection-types)。
* [型別別名](type-aliases.md) – 了解型別別名的作用域與可見度。
* [This 運算式](this-expressions.md) – 了解隱式 `this` 如何解析，以及何時明確使用 `this` 來參照接收者。
* [字串](strings.md) – 了解字串範本、常見字串操作、建構字串以及型別轉換。
* [套件與匯入](packages.md) – 了解如何使用套件與匯入來組織 Kotlin 程式碼。