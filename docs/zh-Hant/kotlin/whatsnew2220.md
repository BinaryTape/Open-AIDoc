[//]: # (title: Kotlin 2.2.20 的新功能)

<web-summary>閱讀 Kotlin 2.2.20 版本說明，內容涵蓋新的語言特性、Kotlin 多平台、JVM、Native、JS 和 Wasm 的更新，以及對 Gradle 與 Maven 的建置工具支援。</web-summary>

_[發布日期：2025 年 9 月 10 日](releases.md#release-history)_

<tldr>
    <p>有關錯誤修復版本 2.2.21 的詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.2.21">更改清單</a></p>
</tldr>

Kotlin 2.2.20 已經發布，為 Web 開發帶來了重要的變更。[Kotlin/Wasm 現在進入 Beta 階段](#kotlin-wasm)，並改進了 [JavaScript 互通中的例外處理](#improved-exception-handling-in-kotlin-wasm-and-javascript-interop)、[npm 相依性管理](#separated-npm-dependencies)、[內建瀏覽器偵錯支援](#support-for-debugging-in-browsers-without-configuration)，以及為 `js` 與 `wasmJs` 目標提供的全新 [共享原始碼集](#shared-source-set-for-js-and-wasmjs-targets)。

此外，以下是一些主要亮點：

* **Kotlin 多平台**：[預設提供 Swift export](#swift-export-available-by-default)、[Kotlin 程式庫的穩定跨平台編譯](#stable-cross-platform-compilation-for-kotlin-libraries)，以及 [宣告共同相依性的新方法](#new-approach-for-declaring-common-dependencies)。
* **語言**：[改進了將 Lambda 傳遞給具有 suspend 函式型別的多載時的多載解析](#improved-overload-resolution-for-lambdas-with-suspend-function-types)。
* **Kotlin/Native**：[支援 Xcode 26、棧金絲雀 (stack canaries)，以及縮小發布版二進位檔案的大小](#kotlin-native)。
* **Kotlin/JS**：[`Long` 值會編譯為 JavaScript 的 `BigInt`](#usage-of-the-bigint-type-to-represent-kotlin-s-long-type)。

> Compose Multiplatform for web 進入 Beta 階段。欲了解更多資訊，請參閱我們的 [部落格文章](https://blog.jetbrains.com/kotlin/2025/09/compose-multiplatform-1-9-0-compose-for-web-beta/)。
>
{style="note"}

您也可以在此影片中找到更新內容的簡短概述：

<video src="https://www.youtube.com/v/QWpp5-LlTqA" title="Kotlin 2.2.21 的新功能"/>

> 有關 Kotlin 發布週期的資訊，請參閱 [Kotlin 發布流程](releases.md)。
>
{style="tip"}

## IDE 支援

支援 Kotlin 2.2.20 的 Kotlin 外掛程式已隨附在最新版本的 IntelliJ IDEA 和 Android Studio 中。
要更新，您只需在建置腳本中將 Kotlin 版本變更為 2.2.20 即可。

詳情請參閱 [更新至新版本](releases.md#update-to-a-new-kotlin-version)。

## 語言

在 Kotlin 2.2.20 中，您可以嘗試預計在 Kotlin 2.3.0 推出的語言特性，包括
[改進了將 Lambda 傳遞給具有 `suspend` 函式型別的多載時的多載解析](#improved-overload-resolution-for-lambdas-with-suspend-function-types)
以及 [支援在具有明確傳回型別的運算式主體中使用 `return` 陳述式](#support-for-return-statements-in-expression-bodies-with-explicit-return-types)。此版本還包括對
[`when` 表達式窮舉性檢查](#data-flow-based-exhaustiveness-checks-for-when-expressions)、
[具現化 (reified) `Throwable` 捕捉](#support-for-reified-types-in-catch-clauses) 以及 [Kotlin 契約 (contracts)](#improved-kotlin-contracts) 的改進。

### 改進具有 `suspend` 函式型別之 Lambda 的多載解析

以前，當一個函式同時具有一般函式型別與 `suspend` 函式型別的多載時，傳遞 Lambda 會導致歧義錯誤。
您可以使用明確的型別轉換來解決此錯誤，但編譯器會錯誤地報告 `No cast needed` 警告：

```kotlin
// 定義兩個多載
fun transform(block: () -> Int) {}
fun transform(block: suspend () -> Int) {}

fun test() {
    // 失敗並顯示多載解析歧義 (overload resolution ambiguity)
    transform({ 42 })

    // 使用明確轉換，但編譯器會錯誤地報告 
    // "No cast needed" 警告
    transform({ 42 } as () -> Int)
}
```

透過此變更，當您定義了一般與 `suspend` 函式型別的多載時，沒有型別轉換的 Lambda 會解析為一般多載。若要明確解析為 suspend 多載，請使用 `suspend` 關鍵字：

```kotlin
// 解析為 transform(() -> Int)
transform({ 42 })

// 解析為 transform(suspend () -> Int)
transform(suspend { 42 })
```

此行為將在 Kotlin 2.3.0 中預設啟用。若要現在測試，請使用以下編譯器選項將您的語言版本設置為 `2.3`：

```kotlin
-language-version 2.3
```

或在您的 `build.gradle(.kts)` 檔案中配置：

```kotlin
kotlin {
    compilerOptions {
        languageVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_3)
    }
}
```

我們誠摯歡迎您在我們提出的問題追蹤器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-23610) 中提供意見回饋。

### 支援在具有明確傳回型別的運算式主體中使用 `return` 陳述式

以前，在運算式主體中使用 `return` 會導致編譯器錯誤，因為這可能導致函式的傳回型別被推論為 `Nothing`。

```kotlin
fun example() = return 42
// 錯誤：禁止在具有運算式主體的函式中使用 Return
```

透過此變更，只要明確寫出傳回型別，您現在就可以在運算式主體中使用 `return`：

```kotlin
// 明確指定傳回型別
fun getDisplayNameOrDefault(userId: String?): String = getDisplayName(userId ?: return "default")

// 失敗，因為未明確指定傳回型別
fun getDisplayNameOrDefault(userId: String?) = getDisplayName(userId ?: return "default")
```

同樣地，Lambda 內部以及具有運算式主體之函式中的巢狀表達式內的 `return` 陳述式，以前是無意中編譯通過的。Kotlin 現在支援這些情況，前提是明確指定傳回型別。未指定明確傳回型別的情況將在 Kotlin 2.3.0 中被棄用：

```kotlin
// 傳回型別未明確指定，且 return 陳述式在 Lambda 內，
// 這將會被棄用
fun returnInsideLambda() = run { return 42 }

// 傳回型別未明確指定，且 return 陳述式在區域變數的初始設定式內，
// 這將會被棄用
fun returnInsideIf() = when {
    else -> {
        val result = if (someCondition()) return "" else "value"
        result
    }
}
```

此行為將在 Kotlin 2.3.0 中預設啟用。若要現在測試，請使用以下編譯器選項將您的語言版本設置為 `2.3`：

```kotlin
-language-version 2.3
```

或在您的 `build.gradle(.kts)` 檔案中配置：

```kotlin
kotlin {
    compilerOptions {
        languageVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_3)
    }
}
```

我們誠摯歡迎您在我們提出的問題追蹤器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-76926) 中提供意見回饋。

### 基於資料流的 `when` 表達式窮舉性檢查
<primary-label ref="experimental-opt-in"/>

Kotlin 2.2.20 引入了**基於資料流**的 `when` 表達式窮舉性檢查。
以前，編譯器的檢查僅限於 `when` 表達式本身，
通常迫使您添加一個冗餘的 `else` 分支。
透過此更新，編譯器現在會追蹤先前的條件檢查和提早回傳，
因此您可以移除冗餘的 `else` 分支。

例如，編譯器現在可以辨識出當滿足 `if` 條件時函式會回傳，
因此 `when` 表達式只需處理剩餘的情況：

```kotlin
enum class UserRole { ADMIN, MEMBER, GUEST }

fun getPermissionLevel(role: UserRole): Int {
    // 在 when 表達式之外處理 Admin 情況
    if (role == UserRole.ADMIN) return 99

    return when (role) {
        UserRole.MEMBER -> 10
        UserRole.GUEST -> 1
        // 您不再需要包含此 else 分支 
        // else -> throw IllegalStateException()
    }
}
```

此功能為 [實驗性](components-stability.md#stability-levels-explained)。
要啟用它，請在您的 `build.gradle(.kts)` 檔案中添加以下編譯器選項：

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xdata-flow-based-exhaustiveness")
    }
}
```

### 支援在 `catch` 子句中使用具現化型別
<primary-label ref="experimental-opt-in"/>

在 Kotlin 2.2.20 中，編譯器現在允許在 `inline` 函式的 `catch` 子句中使用 [具現化泛型型別參數 (reified generic type parameters)](inline-functions.md#reified-type-parameters)。

這是一個例子：

```kotlin
inline fun <reified ExceptionType : Throwable> handleException(block: () -> Unit) {
    try {
        block()
        // 此變更後現在允許這樣做
    } catch (e: ExceptionType) {
        println("Caught specific exception: ${e::class.simpleName}")
    }
}

fun main() {
    // 嘗試執行可能拋出 IOException 的操作
    handleException<java.io.IOException> {
        throw java.io.IOException("File not found")
    }
    // 捕獲到特定例外：IOException
}
```

以前，嘗試在 `inline` 函式中捕捉具現化的 `Throwable` 型別會導致錯誤。

此行為將在 Kotlin 2.4.0 中預設啟用。
若要現在使用，請在您的 `build.gradle(.kts)` 檔案中添加以下編譯器選項：

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-reified-type-in-catch")
    }
}
```

Kotlin 團隊感謝外部貢獻者 [Iven Krall](https://github.com/kralliv) 的貢獻。

### 改進 Kotlin 契約
<primary-label ref="experimental-opt-in"/>

Kotlin 2.2.20 對 [Kotlin 契約 (contracts)](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.contracts/contract.html) 引入了多項改進，包括：

* [支援契約型別斷言中的泛型](#support-for-generics-in-contract-type-assertions)。
* [支援屬性存取子和特定運算子函式內部的契約](#support-for-contracts-inside-property-accessors-and-specific-operator-functions)。
* [支援契約中的 `returnsNotNull()` 函式](#support-for-the-returnsnotnull-function-in-contracts)，用以確保在滿足條件時傳回非 null 值。
* [新的 `holdsIn` 關鍵字](#new-holdsin-keyword)，允許您假設傳遞到 Lambda 內部的條件為真。

這些改進是 [實驗性](components-stability.md#stability-levels-explained)。要選擇加入，您在宣告契約時仍需使用 `@OptIn(ExperimentalContracts::class)` 註解。`holdsIn` 關鍵字和 `returnsNotNull()` 函式還需要使用 `@OptIn(ExperimentalExtendedContracts::class)` 註解。

要使用這些改進，您還需要添加下面各節中說明的編譯器選項。

我們誠摯歡迎您在我們的 [問題追蹤器](https://kotl.in/issue) 中提供意見回饋。

#### 支援契約型別斷言中的泛型

您現在可以編寫對泛型型別執行型別斷言的契約：

```kotlin
import kotlin.contracts.*

sealed class Failure {
    class HttpError(val code: Int) : Failure()
    // 在此插入其他失敗型別
}

sealed class Result<out T, out F : Failure> {
    class Success<T>(val data: T) : Result<T, Nothing>()
    class Failed<F : Failure>(val failure: F) : Result<Nothing, F>()
}

@OptIn(ExperimentalContracts::class)
// 使用契約來斷言泛型型別
fun <T, F : Failure> Result<T, F>.isHttpError(): Boolean {
    contract {
        returns(true) implies (this@isHttpError is Result.Failed<Failure.HttpError>)
    }
    return this is Result.Failed && this.failure is Failure.HttpError
}
```

在此示例中，契約對 `Result` 物件執行型別斷言，允許編譯器安全地將其 [智慧轉型 (smart cast)](typecasts.md#smart-casts) 為斷言的泛型型別。

此功能為 [實驗性](components-stability.md#stability-levels-explained)。要選擇加入，請在您的 `build.gradle(.kts)` 檔案中添加以下編譯器選項：

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-contracts-on-more-functions")
    }
}
```

#### 支援屬性存取子和特定運算子函式內部的契約

您現在可以在屬性存取子和特定運算子函式內部定義契約。
這讓您可以在更多類型的宣告上使用契約，使其更加靈活。

例如，您可以在 getter 內部使用契約，以便為接收者物件啟用智慧轉型：

```kotlin
import kotlin.contracts.*

val Any.isHelloString: Boolean
    get() {
        @OptIn(ExperimentalContracts::class)
        // 當 getter 傳回 true 時，啟用將接收者智慧轉型為 String 的功能
        contract { returns(true) implies (this@isHelloString is String) }
        return "hello" == this
    }

fun printIfHelloString(x: Any) {
    if (x.isHelloString) {
        // 在接收者智慧轉型為 String 後列印長度
        println(x.length)
        // 5
    }
}
```

此外，您可以在以下運算子函式中使用契約：

* `invoke`
* `contains`
* `rangeTo`, `rangeUntil`
* `componentN`
* `iterator`
* `unaryPlus`, `unaryMinus`, `not`
* `inc`, `dec`

這是在運算子函式中使用契約以確保 Lambda 內部變數初始化的示例：

```kotlin
import kotlin.contracts.*

class Runner {
    @OptIn(ExperimentalContracts::class)
    // 啟用在 Lambda 內部指派的變數初始化
    operator fun invoke(block: () -> Unit) {
        contract {
            callsInPlace(block, InvocationKind.EXACTLY_ONCE)
        }
        block()
    }
}

fun testOperator(runner: Runner) {
    val number: Int
    runner {
        number = 1
    }
    // 列印由契約保證的明確初始化後的值
    println(number)
    // 1
}
```

此功能為 [實驗性](components-stability.md#stability-levels-explained)。要選擇加入，請在您的 `build.gradle(.kts)` 檔案中添加以下編譯器選項：

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-contracts-on-more-functions")
    }
}
```

#### 支援契約中的 `returnsNotNull()` 函式

Kotlin 2.2.20 為契約引入了 [`returnsNotNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.contracts/-contract-builder/returns-not-null.html) 函式。
您可以使用此函式確保當滿足特定條件時，函式會傳回非 null 值。
這透過將獨立的可 null 和非 null 函式多載替換為單個簡潔的函式，簡化了您的程式碼：

```kotlin
import kotlin.contracts.*

@OptIn(ExperimentalContracts::class, ExperimentalExtendedContracts::class)
fun decode(encoded: String?): String? {
    contract {
        // 保證當輸入為非 null 時，傳回值為非 null
        (encoded != null) implies (returnsNotNull())
    }
    if (encoded == null) return null
    return java.net.URLDecoder.decode(encoded, "UTF-8")
}

fun useDecodedValue(s: String?) {
    // 由於傳回值可能為 null，因此使用安全呼叫
    decode(s)?.length
    if (s != null) {
        // 智慧轉型後將傳回值視為非 null
        decode(s).length
    }
}
```

在此示例中，`decode()` 函式中的契約允許編譯器在輸入非 null 時智慧轉型其傳回值，從而消除了額外的 null 檢查或多個多載的需求。

此功能為 [實驗性](components-stability.md#stability-levels-explained)。要選擇加入，請在您的 `build.gradle(.kts)` 檔案中添加以下編譯器選項：

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-condition-implies-returns-contracts")
    }
}
```

#### 新的 `holdsIn` 關鍵字

Kotlin 2.2.20 為契約引入了新的 [`holdsIn`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.contracts/-contract-builder/holds-in.html) 關鍵字。
您可以使用它來確保在特定 Lambda 內部假設布林條件為 `true`。這讓您可以使用契約構建具有條件智慧轉型的 DSL。

這是一個例子：

```kotlin
import kotlin.contracts.*

@OptIn(ExperimentalContracts::class, ExperimentalExtendedContracts::class)
fun <T> T.alsoIf(condition: Boolean, block: (T) -> Unit): T {
    contract {
        // 宣告 Lambda 最多執行一次
        callsInPlace(block, InvocationKind.AT_MOST_ONCE)
        // 宣告在 Lambda 內部假設條件為 true
        condition holdsIn block
    }
    if (condition) block(this)
    return this
}

fun useApplyIf(input: Any) {
    val result = listOf(1, 2, 3)
        .first()
        .alsoIf(input is Int) {
            // 在 Lambda 內部將輸入參數智慧轉型為 Int
            // 列印輸入與第一個列表元素的總和
            println(input + it)
            // 2
        }
        .toString()
}
```

此功能為 [實驗性](components-stability.md#stability-levels-explained)。要選擇加入，請在您的 `build.gradle(.kts)` 檔案中添加以下編譯器選項：

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-holdsin-contract")
    }
}
```

## Kotlin/JVM：在 `when` 表達式中支援 `invokedynamic`
<primary-label ref="experimental-opt-in"/> 

在 Kotlin 2.2.20 中，您現在可以使用 `invokedynamic` 編譯 `when` 表達式。以前，具有多個型別檢查的 `when` 表達式在位元組碼中會編譯成長鏈的 `instanceof` 檢查。

現在，當滿足以下條件時，您可以使用 `invokedynamic` 配合 `when` 表達式來產生較小的位元組碼，類似於 Java `switch` 陳述式產生的位元組碼：

* 除了 `else` 之外的所有條件都是 `is` 或 `null` 檢查。
* 表達式不包含 [防護條件 (`if`)](control-flow.md#guard-conditions-in-when-expressions)。
* 條件不包括無法直接進行型別檢查的型別，例如可變 Kotlin 集合 (`MutableList`) 或函式型別 (`kotlin.Function1`、`kotlin.Function2` 等)。
* 除了 `else` 之外至少有兩個條件。
* 所有分支檢查 `when` 表達式的同一個主體。

例如：

```kotlin
open class Example

class A : Example()
class B : Example()
class C : Example()

fun test(e: Example) = when (e) {
    // 使用 invokedynamic 配合 SwitchBootstraps.typeSwitch
    is A -> 1
    is B -> 2
    is C -> 3
    else -> 0
}
```

啟用新功能後，此示例中的 `when` 表達式將編譯為單個 `invokedynamic` 型別切換，而不是多個 `instanceof` 檢查。

要啟用此功能，請使用 JVM 目標 21 或更高版本編譯您的 Kotlin 程式碼，並添加以下編譯器選項：

```bash
-Xwhen-expressions=indy
```

或將其添加到 `build.gradle(.kts)` 檔案的 `compilerOptions {}` 區塊中：

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xwhen-expressions=indy")
    }
}
```

此功能為 [實驗性](components-stability.md#stability-levels-explained)。我們誠摯歡迎您在我們提出的問題追蹤器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-65688) 中提供意見回饋。

## Kotlin 多平台

Kotlin 2.2.20 為 Kotlin 多平台引入了重大變更：Swift export 已預設可用、新增了共享原始碼集，並且您可以嘗試管理共同相依性的新方法。

### 預設提供 Swift export
<primary-label ref="experimental-general"/> 

Kotlin 2.2.20 引入了對 Swift export 的實驗性支援。它允許您直接匯出 Kotlin 原始碼，並以慣用的方式從 Swift 呼叫 Kotlin 程式碼，從而消除了對 Objective-C 標頭檔的需求。

這應該會顯著改善 Apple 目標的多平台開發。例如，如果您有一個包含頂層函式的 Kotlin 模組，Swift export 可以實現乾淨的、特定於模組的匯入，從而移除混亂的 Objective-C 底線和修飾後的名稱。

關鍵特性包括：

* **多模組支援**。每個 Kotlin 模組都會匯出為一個獨立的 Swift 模組，簡化了函式呼叫。
* **封裝支援**。Kotlin 封裝在匯出期間被明確保留，避免了產生的 Swift 程式碼中的命名衝突。
* **型別別名**。Kotlin 型別別名會被匯出並保留在 Swift 中，提高了可讀性。
* **增強型基元型別可 null 性**。與 Objective-C 互通不同（後者需要將 `Int?` 之類的型別封裝到 `KotlinInt` 之類的包裝類別中以保留可 null 性），Swift export 直接轉換可 null 性資訊。
* **多載**。您可以在 Swift 中呼叫 Kotlin 的多載函式而不會產生歧義。
* **扁平化封裝結構**。您可以將 Kotlin 封裝轉換為 Swift 列舉，從產生的 Swift 程式碼中移除封裝前綴。
* **模組名稱自訂**。您可以在 Kotlin 專案的 Gradle 配置中自訂生成的 Swift 模組名稱。

#### 如何啟用 Swift export

該功能目前為 [實驗性](components-stability.md#stability-levels-explained)，僅適用於使用 [直接整合](https://kotlinlang.org/docs/multiplatform/multiplatform-direct-integration.html) 將 iOS 框架連接到 Xcode 專案的專案中。這是使用 IntelliJ IDEA 中的 Kotlin Multiplatform 外掛程式或透過 [Web 精靈](https://kmp.jetbrains.com/) 建立的多平台專案的標準配置。

要嘗試 Swift export，請配置您的 Xcode 專案：

1. 在 Xcode 中，開啟專案設定。
2. 在 **Build Phases** 索引標籤上，找到帶有 `embedAndSignAppleFrameworkForXcode` 任務的 **Run Script** 階段。
3. 調整腳本，改為在執行腳本階段使用 `embedSwiftExportForXcode` 任務：

   ```bash
   ./gradlew :<共享模組名稱>:embedSwiftExportForXcode
   ```

   ![添加 Swift export 腳本](xcode-swift-export-run-script-phase.png){width=700}

4. 組建專案。Swift 模組會產生在組建輸出目錄中。

該功能已預設可用。如果您已在先前版本中啟用它，現在可以從 `gradle.properties` 檔案中移除 `kotlin.experimental.swift-export.enabled`。

> 為了節省時間，請複製我們已設置好 Swift export 的 [公共範例](https://github.com/Kotlin/swift-export-sample)。
>
{style="tip"}

有關 Swift export 的更多資訊，請參閱我們的 [文件](native-swift-export.md)。

#### 留下意見回饋

我們計劃在未來的 Kotlin 版本中擴展並逐步穩定 Swift export 支援。在 Kotlin 2.2.20 之後，我們將專注於改進 Kotlin 與 Swift 之間的互通性，特別是圍繞協程 (coroutines) 和流程 (flows)。

Swift export 支援是 Kotlin 多平台的一項重大變更。我們誠摯歡迎您的意見回饋：

* 在 Kotlin Slack 直接聯繫開發團隊 – [獲取邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up?_gl=1*ju6cbn*_ga*MTA3MTk5NDkzMC4xNjQ2MDY3MDU4*_ga_9J976DJZ68*MTY1ODMzNzA3OS4xMDAuMS4xNjU4MzQwODEwLjYw) 並加入 [#swift-export](https://kotlinlang.slack.com/archives/C073GUW6WN9) 頻道。
* 在 [YouTrack](https://kotl.in/issue) 中回報您在使用 Swift export 時遇到的任何問題。

### `js` 和 `wasmJs` 目標的共享原始碼集

以前，Kotlin 多平台預設不包含用於 JavaScript (`js`) 和 WebAssembly (`wasmJs`) Web 目標的共享原始碼集。
要在 `js` 和 `wasmJs` 之間共享程式碼，您必須手動配置自訂原始碼集，或者在兩個地方編寫程式碼，
一個版本給 `js`，另一個給 `wasmJs`。例如：

```kotlin
// commonMain
expect suspend fun readCopiedText(): String

// jsMain
external interface Navigator { val clipboard: Clipboard }
// JS 和 Wasm 中不同的互通方式
external interface Clipboard { fun readText(): Promise<String> }
external val navigator: Navigator

suspend fun readCopiedText(): String {
    // JS 和 Wasm 中不同的互通方式
    return navigator.clipboard.readText().await()
}

// wasmJsMain
external interface Navigator { val clipboard: Clipboard }
external interface Clipboard { fun readText(): Promise<JsString> }
external val navigator: Navigator

suspend fun readCopiedText(): String {
    return navigator.clipboard.readText().await().toString()
}
```

從此版本開始，當您使用 [預設階層範本 (default hierarchy template)](https://kotlinlang.org/docs/multiplatform/multiplatform-hierarchy.html#default-hierarchy-template) 時，Kotlin Gradle 外掛程式會添加一個新的 Web 共享原始碼集（包含 `webMain` 和 `webTest`）。

透過此變更，`web` 原始碼集將成為 `js` 和 `wasmJs` 原始碼集的父級。更新後的原始碼集階層如下所示：

![使用 Web 的預設階層範本示例](default-hierarchy-example-with-web.svg)

新的原始碼集允許您為 `js` 和 `wasmJs` 目標編寫同一段程式碼。
您可以將共享程式碼放在 `webMain` 中，它會自動適用於兩者：

```kotlin
// commonMain
expect suspend fun readCopiedText(): String

// webMain
@OptIn(ExperimentalWasmJsInterop::class)
private suspend fun <R : JsAny?> Promise<R>.await(): R = suspendCancellableCoroutine { continuation ->
    this.then(
        onFulfilled = { continuation.resumeWith(Result.success(it)); null },
        onRejected = { continuation.resumeWithException(it.asJsException()); null }
    )
}

external interface Navigator { val clipboard: Clipboard }
external interface Clipboard { fun readText(): Promise<JsString> }
external val navigator: Navigator

actual suspend fun readCopiedText(): String {
    return navigator.clipboard.readText().await().toString()
}
```

此更新簡化了 `js` 和 `wasmJs` 目標之間的程式碼共享。它在兩種情況下特別有用：

* 如果您是程式庫作者，並且希望在不重複程式碼的情況下添加對 `js` 和 `wasmJs` 目標的支援。
* 如果您正在開發針對 Web 的 Compose Multiplatform 應用程式，則可以同時為 `js` 和 `wasmJs` 目標進行交叉編譯，以實現更廣泛的瀏覽器相容性。有了這種回退模式，當您建立網站時，它可以在所有瀏覽器上開箱即用，因為現代瀏覽器使用 `wasmJs`，而舊版瀏覽器使用 `js`。

要嘗試此功能，請在您的 `build.gradle(.kts)` 檔案的 `kotlin {}` 區塊中使用 [預設階層範本](https://kotlinlang.org/docs/multiplatform/multiplatform-hierarchy.html#default-hierarchy-template)：

```kotlin
kotlin {
    js()
    wasmJs()

    // 啟用預設原始碼集階層，包括 webMain 和 webTest
    applyDefaultHierarchyTemplate()
}
```

在使用預設階層之前，請仔細考慮如果您的專案有自訂共享原始碼集，或者如果您已重命名 `js("web")` 目標，是否存在任何潛在衝突。要解決這些衝突，請重命名衝突的原始碼集或目標，或者不要使用預設階層。

### Kotlin 程式庫穩定的跨平台編譯

Kotlin 2.2.20 完成了一個重要的 [路線圖項目](https://youtrack.jetbrains.com/issue/KT-71290)，穩定了 Kotlin 程式庫的跨平台編譯。

您現在可以使用任何 [受支援的主機](native-target-support.md#hosts) 來產出用於發布 Kotlin 程式庫的 `.klib` 構件。這顯著簡化了發布過程，特別是對於以前需要 Mac 電腦的 Apple 目標。

該功能已預設可用。如果您已經使用 `kotlin.native.enableKlibsCrossCompilation=true` 啟用了交叉編譯，現在可以從 `gradle.properties` 檔案中移除它。

遺憾的是，仍然存在一些限制。在以下情況下，您仍需要使用 Mac 電腦：

* 您的程式庫或任何相依模組具有 [cinterop 相依性](native-c-interop.md)。
* 您在專案中設置了 [CocoaPods 整合](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html)。
* 您需要為 Apple 目標組建或測試 [最終二進位檔案](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html)。

有關發布多平台程式庫的更多資訊，請參閱我們的 [文件](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-lib-setup.html)。

### 宣告共同相依性的新方法
<primary-label ref="experimental-opt-in"/>

為了簡化使用 Gradle 設置多平台專案，當您的專案使用 Gradle 8.8 或更高版本時，Kotlin 2.2.20 現在允許您在 `kotlin {}` 區塊中使用頂層 `dependencies {}` 區塊來宣告共同相依性。
這些相依性的行為就像它們是在 `commonMain` 原始碼集中宣告的一樣。此功能的運作方式類似於您用於 Kotlin/JVM 和僅限 Android 專案的相依性區塊，現在它在 Kotlin 多平台中處於 [實驗性](components-stability.md#stability-levels-explained) 階段。

在專案層級宣告共同相依性可以減少原始碼集之間的重複配置，並有助於簡化您的組建設置。您仍可根據需要在每個原始碼集中添加平台特定的相依性。

要嘗試此功能，請在頂層 `dependencies {}` 區塊之前添加 `@OptIn(ExperimentalKotlinGradlePluginApi::class)` 註解以選擇加入。例如：

```kotlin
kotlin {
    @OptIn(ExperimentalKotlinGradlePluginApi::class)
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:%coroutinesVersion%")
    }
}
```

我們誠摯歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-76446) 中提供有關此功能的意見回饋。

### 相依性目標支援的新診斷

在 Kotlin 2.2.20 之前，如果建置腳本中的相依性不支援原始碼集所需的所有目標，Gradle 產生的錯誤訊息會讓人難以理解問題所在。

Kotlin 2.2.20 引入了一種新的診斷方法，可以清楚地顯示每個相依性支援哪些目標，以及不支援哪些目標。

此診斷預設啟用。如果由於某種原因您需要停用它，請在 [YouTrack 問題](https://kotl.in/kmp-dependencies-diagnostic-issue) 的評論中告訴我們。
您可以使用以下 Gradle 屬性在您的 `gradle.properties` 檔案中停用診斷：

| 屬性                                                 | 描述                                                    |
|----------------------------------------------------------|----------------------------------------------------------------|
| `kotlin.kmp.eagerUnresolvedDependenciesDiagnostic=false` | 僅針對中繼資料編譯和匯入執行診斷 |
| `kotlin.kmp.unresolvedDependenciesDiagnostic=false`      | 完全停用診斷                             |

## Kotlin/Native

此版本帶來了對 Xcode 26 的支援、對 Objective-C/Swift 互通性的改進、偵錯功能以及新的二進位選項。

### 支援 Xcode 26

從 Kotlin 2.2.2**1** 開始，Kotlin/Native 編譯器支援 Xcode 26 – Xcode 的最新穩定版本。
您現在可以更新 Xcode 並獲取最新的 API，以繼續在您的 Apple 作業系統 Kotlin 專案中工作。

### 在二進位檔案中支援棧金絲雀 (stack canaries)

從 Kotlin 2.2.20 開始，Kotlin 在生成的 Kotlin/Native 二進位檔案中添加了對棧金絲雀的支援。作為棧保護的一部分，此安全性功能可以防止棧粉碎 (stack smashing)，從而減輕一些常見的應用程式漏洞。
Swift 和 Objective-C 已經具備此功能，現在 Kotlin 也支援了。

Kotlin/Native 中棧保護的實作遵循 [Clang](https://clang.llvm.org/docs/ClangCommandLineReference.html#cmdoption-clang-fstack-protector) 中棧保護程式的行為。

要啟用棧金絲雀，請在您的 `gradle.properties` 檔案中添加以下 [二進位選項](native-binary-options.md)：

```none
kotlin.native.binary.stackProtector=yes
```

該屬性為所有容易受到棧粉碎攻擊的 Kotlin 函式啟用該功能。替代模式包括：

* `kotlin.native.binary.stackProtector=strong`，對容易受到棧粉碎攻擊的函式使用更強的啟發式方法。
* `kotlin.native.binary.stackProtector=all`，為所有函式啟用棧保護。

請注意，在某些情況下，棧保護可能會帶來效能開銷。

### 縮小發布版二進位檔案的大小
<primary-label ref="experimental-opt-in"/> 

Kotlin 2.2.20 引入了 `smallBinary` 選項，可以幫助您減少發布版二進位檔案的大小。
新選項實際上將 `-Oz` 設置為編譯器在 LLVM 編譯階段的預設優化參數。

啟用 `smallBinary` 選項後，您可以縮小發布版二進位檔案並縮短組建時間。但是，在某些情況下，它可能會影響執行階段效能。

這項新功能目前處於 [實驗性](components-stability.md#stability-levels-explained) 階段。要在您的專案中嘗試它，請在您的 `gradle.properties` 檔案中添加以下 [二進位選項](native-binary-options.md)：

```none
kotlin.native.binary.smallBinary=true
```

Kotlin 團隊感謝 [Troels Lund](https://github.com/troelsbjerre) 在實作此功能方面的幫助。

### 改進的偵錯工具物件摘要

Kotlin/Native 現在為 LLDB 和 GDB 等偵錯工具產生更清晰的物件摘要。這提高了生成的偵錯資訊的可讀性，並簡化了您的偵錯體驗。

例如，考慮以下物件：

```kotlin
class Point(val x: Int, val y: Int)
val point = Point(1, 2)
```

以前，檢查只會顯示有限的資訊，包括指向物件記憶體位址的指標：

```none
(lldb) v point
(ObjHeader *) point = [x: ..., y: ...]
(lldb) v point->x
(int32_t *) x = 0x0000000100274048
```

在 Kotlin 2.2.20 中，偵錯工具現在會顯示更豐富的細節，包括實際值：

```none
(lldb) v point
(ObjHeader *) point = Point(x=1, y=2)
(lldb) v point->x
(int32_t) point->x = 1
```

Kotlin 團隊感謝 [Nikita Nazarov](https://github.com/nikita-nazarov) 在實作此功能方面的幫助。

有關 Kotlin/Native 偵錯的更多資訊，請參閱 [文件](native-debugging.md)。

### Objective-C 標頭檔中區塊型別的明確名稱

Kotlin 2.2.20 引入了一個選項，可以為從 Kotlin/Native 專案匯出的 Objective-C 標頭檔中的 Kotlin 函式型別添加明確的參數名稱。參數名稱可以改善 Xcode 中的自動補全建議，並有助於避免 Clang 警告。

以前，生成的 Objective-C 標頭檔中省略了區塊型別中的參數名稱。在這種情況下，Xcode 的自動補全會建議在 Objective-C 區塊中呼叫不帶參數名稱的此類函式。生成的區塊會觸發 Clang 警告。

例如，對於以下 Kotlin 程式碼：

```kotlin
// Kotlin:
fun greetUser(block: (name: String) -> Unit) = block("John")
```

產生的 Objective-C 標頭檔沒有參數名稱：

```objc
// Objective-C:
+ (void)greetUserBlock:(void (^)(NSString *))block __attribute__((swift_name("greetUser(block:)")));
```

因此在 Xcode 中從 Objective-C 呼叫 `greetUserBlock()` 函式時，IDE 建議：

```objc
// Objective-C:
greetUserBlock:^(NSString *) {
    // ...
};
```

建議中缺失的參數名稱 `(NSString *)` 會導致 Clang 警告。

透過新選項，Kotlin 將參數名稱從 Kotlin 函式型別轉發到 Objective-C 區塊型別，因此 Xcode 在建議中使用它們：

```objc
// Objective-C:
greetUserBlock:^(NSString *name) {
    // ...
};
```

要啟用明確參數名稱，請在您的 `gradle.properties` 檔案中添加以下 [二進位選項](native-binary-options.md)：

```none
kotlin.native.binary.objcExportBlockExplicitParameterNames=true
```

Kotlin 團隊感謝 [Yijie Jiang](https://github.com/edisongz) 實作此功能。

### 減小 Kotlin/Native 發行版的體積

Kotlin/Native 發行版以前包含兩個包含編譯器程式碼的 JAR 檔案：

* `konan/lib/kotlin-native.jar`
* `konan/lib/kotlin-native-compiler-embeddable.jar`。

從 Kotlin 2.2.20 開始，不再發布 `kotlin-native.jar`。

移除的 JAR 檔案是可嵌入編譯器的舊版本，已不再需要。此變更顯著減小了發行版的體積。

因此，以下選項現已棄用並移除：

* `kotlin.native.useEmbeddableCompilerJar=false` Gradle 屬性。現在，Kotlin/Native 專案始終使用可嵌入編譯器的 JAR 檔案。
* `KotlinCompilerPluginSupportPlugin.getPluginArtifactForNative()` 函式。現在始終使用 [`getPluginArtifact()`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-compiler-plugin-support-plugin/get-plugin-artifact.html) 函式。

欲了解更多資訊，請參閱 [YouTrack 問題](https://kotl.in/KT-51301)。

### 預設將 KDocs 匯出到 Objective-C 標頭檔

在編譯 Kotlin/Native 最終二進位檔案期間生成 Objective-C 標頭檔時，[KDoc](kotlin-doc.md) 註解現在會預設匯出。

以前，您需要手動將 `-Xexport-kdoc` 選項添加到建置檔案中。現在，它會自動傳遞給編譯任務。

此選項將 KDoc 註解嵌入到 klib 中，並在產出 Apple 框架時從 klib 中提取註解。因此，類別和方法的註解會出現在自動補全期間，例如在 Xcode 中。

您可以在 `build.gradle(.kts)` 檔案的 `binaries {}` 區塊中，停用從 klib 到產出的 Apple 框架的 KDoc 註解匯出：

```kotlin
import org.jetbrains.kotlin.gradle.ExperimentalKotlinGradlePluginApi

kotlin {
    iosArm64 {
        binaries {
            framework { 
                baseName = "sdk"
                @OptIn(ExperimentalKotlinGradlePluginApi::class)
                exportKdoc.set(false)
            }
        }
    }
}
```

有關更多資訊，請參閱 [我們的文件](native-objc-interop.md#provide-documentation-with-kdoc-comments)。

### 棄用 `x86_64` Apple 目標

Apple 幾年前已停止生產搭載 Intel 晶片的裝置，並且 [最近宣布](https://www.youtube.com/live/51iONeETSng?t=3288s) 
macOS Tahoe 26 將是支援 Intel 架構的最後一個作業系統版本。

這使得我們越來越難以在建置代理上妥善測試這些目標，特別是在未來的 Kotlin 版本中，我們將更新支援 macOS 26 隨附的 Xcode 版本。

從 Kotlin 2.2.20 開始，`macosX64` 和 `iosX64` 目標降級為第 2 層支援。這意味著該目標會在 CI 上定期測試以確保其可編譯，但可能不會自動測試以確保其可執行。

我們計劃逐步棄用所有 `x86_64` Apple 目標，並最終在 Kotlin 2.2.20−2.4.0 發布週期內移除對它們的支援。這包括以下目標：

* `macosX64`
* `iosX64`
* `tvosX64`
* `watchosX64`

有關支援層級的更多資訊，請參閱 [Kotlin/Native 目標支援](native-target-support.md)。

## Kotlin/Wasm

Kotlin/Wasm 現在進入 Beta 階段，提供更高的穩定性，並進行了諸如 npm 相依性分離、
[改進了 JavaScript 互通的例外處理](#improved-exception-handling-in-kotlin-wasm-and-javascript-interop)、
[內建瀏覽器偵錯支援](#support-for-debugging-in-browsers-without-configuration) 等改進。

### 分離 npm 相依性

以前，在您的 Kotlin/Wasm 專案中，所有 [npm](https://www.npmjs.com/) 相依性都一起安裝在您的專案資料夾中，
包括 Kotlin 工具相依性與您自己的相依性。它們也一起記錄在您專案的鎖定檔案
(`package-lock.json` 或 `yarn.lock`) 中。

因此，每當 Kotlin 工具相依性更新時，即使您沒有添加或變更任何內容，您也必須更新鎖定檔案。

從 Kotlin 2.2.20 開始，Kotlin 工具 npm 相依性將安裝在您的專案之外。現在，工具和您的（使用者）相依性有不同的目錄：

* **工具相依性目錄：**

  `<kotlin-user-home>/kotlin-npm-tooling/<yarn|npm>/hash/node_modules`

* **使用者相依性目錄：**

  `build/wasm/node_modules`

此外，專案目錄內的鎖定檔案僅包含使用者定義的相依性。

此改進使您的鎖定檔案僅專注於您自己的相依性，有助於保持專案整潔，並減少對檔案的不必要變更。

此變更對 `wasm-js` 目標預設啟用。該變更尚未針對 `js` 目標實作。雖然計劃在未來版本中實作，但在 Kotlin 2.2.20 中，`js` 目標的 npm 相依性行為仍與以前相同。

### 改進 Kotlin/Wasm 和 JavaScript 互通中的例外處理

以前，Kotlin 很難理解 JavaScript (JS) 中拋出的例外（錯誤）並將其跨越到 Kotlin/Wasm 程式碼。

在某些情況下，反方向也會發生問題，即例外從 Wasm 程式碼拋出或傳遞給 JS，並被封裝進 `WebAssembly.Exception` 而沒有任何細節。這些 Kotlin 例外處理問題使得偵錯變得困難。

從 Kotlin 2.2.20 開始，兩個方向的例外處理開發者體驗都有所提升：

* 當例外從 JS 拋出時，您可以在 Kotlin 側看到更多資訊。當此類例外透過 Kotlin 傳回 JS 時，它不再被封裝到 WebAssembly 中。
* 當例外從 Kotlin 拋出時，現在可以在 JS 側作為 JS 錯誤被捕捉。

新的例外處理功能可在支援 [`WebAssembly.JSTag`](https://webassembly.github.io/exception-handling/js-api/#dom-webassembly-jstag) 功能的現代瀏覽器中自動運行：

* Chrome 115+
* Firefox 129+
* Safari 18.4+

在舊版瀏覽器中，例外處理行為保持不變。

### 支援在瀏覽器中無需配置即可進行偵錯

以前，瀏覽器無法自動存取偵錯所需的 Kotlin/Wasm 專案原始碼。
要在瀏覽器中偵錯 Kotlin/Wasm 應用程式，您必須透過在 `build.gradle(.kts)` 檔案中添加以下程式碼片段，手動配置組建以提供這些原始碼：

```kotlin
devServer = (devServer ?: KotlinWebpackConfig.DevServer()).apply {
    static = (static ?: mutableListOf()).apply {
        add(project.rootDir.path)
    }
}
```

從 Kotlin 2.2.20 開始，在 [現代瀏覽器](wasm-configuration.md#browser-versions) 中偵錯您的應用程式可以開箱即用。
當您執行 Gradle 開發任務 (`*DevRun`) 時，Kotlin 會自動將原始檔提供給瀏覽器，讓您可以設置中斷點、檢查變數並單步執行 Kotlin 程式碼，而無需額外設置。

此變更透過移除手動配置的需求來簡化偵錯。所需的配置現在已包含在 Kotlin Gradle 外掛程式中。如果您以前將此配置添加到您的 `build.gradle(.kts)` 檔案中，則應將其移除以避免衝突。

瀏覽器偵錯對所有 Gradle `*DevRun` 任務預設啟用。這些任務不僅提供應用程式，還提供其原始檔，因此請僅將其用於本機開發，並避免在原始碼會公開暴露的雲端或生產環境中執行它們。

#### 處理偵錯期間重複載入的問題

預設提供原始碼可能會導致 [在 Kotlin 編譯和打包完成之前，瀏覽器中的應用程式重複載入](https://youtrack.jetbrains.com/issue/KT-80582/Multiple-reloads-when-using-webpack-dev-server-after-2.2.20-Beta2#focus=Comments-27-12596427.0-0)。
作為權宜之計，請調整您的 webpack 配置以忽略 Kotlin 原始檔，並停用對所提供靜態檔案的監視。
在專案根目錄的 `webpack.config.d` 目錄中添加一個具有以下內容的 `.js` 檔案：

```kotlin
config.watchOptions = config.watchOptions || {
    ignored: ["**/*.kt", "**/node_modules"]
}

if (config.devServer) {
    config.devServer.static = config.devServer.static.map(file => {
        if (typeof file === "string") {
        return { directory: file,
                 watch: false,
        }
    } else {
        return file
    }
    })
}
```

### 消除空的 `yarn.lock` 檔案

以前，Kotlin Gradle 外掛程式 (KGP) 會自動產生一個 `yarn.lock` 檔案，其中包含 Kotlin 工具鏈所需的 npm 套件資訊，以及專案或所使用程式庫中任何現有的 [npm](https://www.npmjs.com/) 相依性。

現在，KGP 會分別管理工具鏈相依性，除非專案具有 npm 相依性，否則不再產生專案層級的 `yarn.lock` 檔案。

當添加 npm 相依性時，KGP 會自動建立 `yarn.lock` 檔案；當移除 npm 相依性時，它會刪除 `yarn.lock` 檔案。

此變更清理了專案結構，並更容易追蹤何時引入了實際的 npm 相依性。

配置此行為不需要額外的步驟。從 Kotlin 2.2.20 開始，它已預設應用於 Kotlin/Wasm 專案。

### 完全限定類名中的新編譯器錯誤

在 Kotlin/Wasm 上，編譯器預設不會在產生的二進位檔案中存儲類別的完全限定名 (FQN)。
這種方法可以避免增加應用程式體積。

因此，在先前的 Kotlin 版本中，呼叫 `KClass::qualifiedName` 屬性會傳回一個空字串，而不是類別的限定名稱。

從 Kotlin 2.2.20 開始，除非您明確啟用完全限定名功能，否則當您在 Kotlin/Wasm 專案中使用 `KClass::qualifiedName` 屬性時，編譯器會報錯。

此變更防止了呼叫 `qualifiedName` 屬性時出現非預期的空字串，並透過在編譯時捕捉問題來提升開發者體驗。

診斷預設啟用，錯誤會自動回報。要停用診斷並允許在 Kotlin/Wasm 中存儲 FQN，請透過在您的 `build.gradle(.kts)` 檔案中添加以下選項，指示編譯器存儲所有類別的完全限定名：

```kotlin
kotlin {
    wasmJs {
        ...
        compilerOptions {
            freeCompilerArgs.add("-Xwasm-kclass-fqn")
        }
    }
}
```

> 請記住，啟用此選項會增加應用程式體積。
>
{style="note"}

## Kotlin/JS

Kotlin 2.2.20 支援使用 `BigInt` 型別來表示 Kotlin 的 `Long` 型別，從而在匯出的宣告中啟用 `Long`。此外，此版本還添加了一個 DSL 函式來清理 Node.js 引數。

### 使用 `BigInt` 型別來表示 Kotlin 的 `Long` 型別
<primary-label ref="experimental-opt-in"/>

在 ES2020 標準之前，JavaScript (JS) 不支援大於 53 位元的精確整數的基元型別。

出於這個原因，Kotlin/JS 以前將 `Long` 值（寬度為 64 位元）表示為包含兩個 `number` 屬性的 JavaScript 物件。這種自訂實作使得 Kotlin 與 JavaScript 之間的互通性更加複雜。

從 Kotlin 2.2.20 開始，當編譯為現代 JavaScript (ES2020) 時，Kotlin/JS 現在使用 JavaScript 內建的 `BigInt` 型別來表示 Kotlin 的 `Long` 值。

此變更啟用了 [將 `Long` 型別匯出到 JavaScript](#usage-of-long-in-exported-declarations) 的功能，這也是 Kotlin 2.2.20 引入的功能。因此，此變更簡化了 Kotlin 與 JavaScript 之間的互通性。

要啟用它，您需要在您的 `build.gradle(.kts)` 檔案中添加以下編譯器選項：

```kotlin
kotlin {
    js {
        ...
        compilerOptions {
            freeCompilerArgs.add("-Xes-long-as-bigint")
        }
    }
}
```

此功能為 [實驗性](components-stability.md#stability-levels-explained)。我們誠摯歡迎您在我們提出的問題追蹤器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-57128) 中提供意見回饋。

#### 在匯出的宣告中使用 `Long`

由於 Kotlin/JS 使用了自訂的 `Long` 表示方式，因此很難提供一種簡單的方法來從 JavaScript 與 Kotlin 的 `Long` 進行互動。因此，您無法將使用 `Long` 型別的 Kotlin 程式碼匯出到 JavaScript。
此問題影響了任何使用 `Long` 的程式碼，例如函式參數、類別屬性或建構函式。

既然 Kotlin 的 `Long` 型別可以編譯為 JavaScript 的 `BigInt` 型別，Kotlin/JS 現在支援將 `Long` 值匯出到 JavaScript，從而簡化了 Kotlin 與 JavaScript 程式碼之間的互通性。

要啟用此功能：

1. 透過在 `build.gradle(.kts)` 檔案中的 `freeCompilerArgs` 屬性添加以下編譯器選項，允許在 Kotlin/JS 中匯出 `Long`：

    ```kotlin
    kotlin {
        js {
            ...
            compilerOptions {                   
                freeCompilerArgs.add("-XXLanguage:+JsAllowLongInExportedDeclarations")
            }
        }
    }
    ```

2. 啟用 `BigInt` 型別。請參閱 [使用 `BigInt` 型別來表示 Kotlin 的 `Long` 型別](#usage-of-the-bigint-type-to-represent-kotlin-s-long-type) 了解如何啟用。

### 用於更整潔引數的新 DSL 函式

使用 Node.js 執行 Kotlin/JS 應用程式時，傳遞給程式的引數 (`args`) 以前包括：

* 可執行檔 `Node` 的路徑。
* 您的腳本路徑。
* 您提供的實際命令列引數。

然而，`args` 的預期行為是僅包含命令列引數。為了實現這一點，您必須在 `build.gradle(.kts)` 檔案中或在 Kotlin 程式碼中使用 `drop()` 函式手動跳過前兩個引數：

```kotlin
fun main(args: Array<String>) {
    println(args.drop(2).joinToString(", "))
}
```

這種解決方法是重複的、容易出錯的，並且在平台之間共享程式碼時效果不佳。

為了修復此問題，Kotlin 2.2.20 引入了一個名為 `passCliArgumentsToMainFunction()` 的新 DSL 函式。

透過此函式，僅包含命令列引數，而排除 `Node` 和腳本路徑：

```kotlin
fun main(args: Array<String>) {
    // 不再需要 drop()，僅包含您的自訂引數 
    println(args.joinToString(", "))
}
```

此變更減少了樣板程式碼，防止了因手動刪除引數而導致的錯誤，並提高了跨平台相容性。

要啟用此功能，請在您的 `build.gradle(.kts)` 檔案中添加以下 DSL 函式：

```kotlin
kotlin {
    js {
        nodejs {
            passCliArgumentsToMainFunction()
        }
    }
}
```

## Gradle

Kotlin 2.2.20 在 Gradle 組建報告中為 Kotlin/Native 任務添加了新的編譯器效能指標，並在增量編譯方面進行了品質改進。

### Kotlin/Native 任務組建報告中的新編譯器效能指標

在 Kotlin 1.7.0 中，我們引入了 [組建報告](gradle-compilation-and-caches.md#build-reports) 來幫助追蹤編譯器效能。從那時起，我們添加了更多指標，使這些報告更加詳細且對調查效能問題更有用。

在 Kotlin 2.2.20 中，組建報告現在包含 Kotlin/Native 任務的編譯器效能指標。

要進一步了解組建報告及其配置方法，請參閱 [啟用組建報告](gradle-compilation-and-caches.md#enabling-build-reports)。

### 預覽 Kotlin/JVM 改進的增量編譯
<primary-label ref="experimental-general"/>

Kotlin 2.0.0 引入了具有優化前端的新 K2 編譯器。Kotlin 2.2.20 在此基礎上，利用新前端改善了 Kotlin/JVM 在某些複雜增量編譯場景下的效能。

在我們努力穩定此行為期間，這些改進預設為停用。要啟用它們，請在您的 `gradle.properties` 檔案中添加以下屬性：

```none
kotlin.incremental.jvm.fir=true
```

目前，[`kapt` 編譯器外掛程式](kapt.md) 與此新行為不相容。我們正努力在未來的 Kotlin 版本中添加支援。

我們誠摯歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-72822) 中提供有關此功能的意見回饋。

### 增量編譯偵測 inline 函式 Lambda 中的變更

在 Kotlin 2.2.20 之前，如果您啟用了增量編譯並變更了 inline 函式中 Lambda 內部的邏輯，編譯器不會重新編譯其他模組中該 inline 函式的呼叫點 (call sites)。結果是，那些呼叫點使用了舊版本的 Lambda，這可能會導致非預期的行為。

在 Kotlin 2.2.20 中，編譯器現在會偵測 inline 函式中 Lambda 的變更，並自動重新編譯其呼叫點。

### 程式庫發布的改進

Kotlin 2.2.20 添加了新的 Gradle 任務，使程式庫發布更加容易。這些任務可以幫助您產生金鑰對、上傳公鑰，並在將其上傳到 Maven Central 儲存庫之前執行本機檢查以確保驗證過程成功。

有關如何將這些任務作為發布過程一部分使用的更多資訊，請參閱 [將您的程式庫發布到 Maven Central](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-libraries.html)。

#### 用於產生和上傳 PGP 金鑰的新 Gradle 任務

在 Kotlin 2.2.20 之前，如果您想將多平台程式庫發布到 Maven Central 儲存庫，您必須安裝像 `gpg` 這樣的第三方程式來產生用於對發布內容進行簽名的金鑰對。現在，Kotlin Gradle 外掛程式隨附了 Gradle 任務，可讓您產生金鑰對並上傳公鑰，因此您不必安裝另一個程式。

##### 產生金鑰對

`generatePgpKeys` 任務會產生金鑰對。執行它時，您必須按以下格式提供私鑰存儲庫的密碼和您的姓名：

```bash
./gradlew -Psigning.password=範例密碼 generatePgpKeys --name "John Smith <john@example.com>"
```

該任務將金鑰對存儲在 `build/pgp` 目錄中。

> 將您的金鑰對移至安全位置，以防止意外刪除或未經授權的存取。
> 
{style="warning"}

##### 上傳公鑰

`uploadPublicPgpKey` 任務將公鑰上傳到 Ubuntu 的金鑰伺服器：`keyserver.ubuntu.com`。執行它時，請提供 `.asc` 格式的公鑰路徑：

```bash
./gradlew uploadPublicPgpKey --keyring /公鑰路徑/build/pgp/public_KEY_ID.asc
```

#### 用於在本機測試驗證的新 Gradle 任務

Kotlin 2.2.20 還添加了 Gradle 任務，用於在將程式庫上傳到 Maven Central 儲存庫之前在本機測試驗證。

如果您同時使用 Kotlin Gradle 外掛程式與 Gradle 的 [Signing Plugin](https://docs.gradle.org/current/userguide/signing_plugin.html) 和 [Maven Publish Plugin](https://docs.gradle.org/current/userguide/publishing_maven.html)，您可以執行 `checkSigningConfiguration` 和 `checkPomFileFor<PUBLICATION_NAME>Publication` 任務來驗證您的設置是否符合 Maven Central 的要求。將 `<PUBLICATION_NAME>` 替換為您的發布名稱。

這些任務不會作為 `build` 或 `check` Gradle 任務的一部分自動執行，因此您需要手動執行它們。例如，如果您有一個 `KotlinMultiplatform` 發布：

```bash
./gradlew checkSigningConfiguration checkPomFileForKotlinMultiplatformPublication
```

`checkSigningConfiguration` 任務會檢查：

* Signing Plugin 是否已配置金鑰。
* 配置的公鑰是否已上傳到 `keyserver.ubuntu.com` 或 `keys.openpgp.org` 金鑰伺服器。
* 所有發布內容是否都啟用了簽名。

如果任何檢查失敗，該任務將傳回錯誤，並附帶如何修正問題的資訊。

`checkPomFileFor<PUBLICATION_NAME>Publication` 任務會檢查 `pom.xml` 檔案是否符合 Maven Central 的 [要求](https://central.sonatype.org/publish/requirements/#required-pom-metadata)。
如果不符合，該任務將傳回錯誤，並詳細說明 `pom.xml` 檔案的哪些部分不合規。

## Maven：`kotlin-maven-plugin` 中支援 Kotlin daemon

Kotlin 2.2.20 透過在 `kotlin-maven-plugin` 中添加對 [Kotlin daemon](kotlin-daemon.md) 的支援，進一步擴展了 [Kotlin 2.2.0 中引入的建置工具 API](whatsnew22.md#new-experimental-build-tools-api)。使用 Kotlin daemon 時，Kotlin 編譯器在一個獨立的隔離程序中執行，這可以防止其他 Maven 外掛程式覆蓋系統屬性。您可以在此 [YouTrack 問題](https://youtrack.jetbrains.com/issue/KT-43894/Maven-Windows-error-RuntimeException-Could-not-find-installation-home-path) 中看到示例。

從 Kotlin 2.2.20 開始，預設使用 Kotlin daemon。如果您想恢復到以前的行為，請在您的 `pom.xml` 檔案中將以下屬性設置為 `false` 來停用它：

```xml
<properties>
    <kotlin.compiler.daemon>false</kotlin.compiler.daemon>
</properties>
```

Kotlin 2.2.20 還引入了一個新的 `jvmArgs` 屬性，您可以使用它來為 Kotlin daemon 自訂預設 JVM 引數。例如，要覆蓋 `-Xmx` 和 `-Xms` 選項，請將以下內容添加到您的 `pom.xml` 檔案中：

```xml
<properties>
    <kotlin.compiler.daemon.jvmArgs>Xmx1500m,Xms500m</kotlin.compiler.daemon.jvmArgs>
</properties>
```

## Kotlin 編譯器選項的新通用架構

Kotlin 2.2.20 為在 [`org.jetbrains.kotlin:kotlin-compiler-arguments-description`](https://central.sonatype.com/artifact/org.jetbrains.kotlin/kotlin-compiler-arguments-description) 下發布的所有編譯器選項引入了一個通用架構。
此構件包括所有編譯器選項的程式碼表示和 JSON 等效項（供非 JVM 使用者使用）、它們的描述以及諸如每個選項引入或穩定版本之類的元資料。您可以使用此架構來產生選項的自訂檢視或根據需要對其進行分析。

## 標準程式庫

此版本在標準程式庫中引入了新的實驗性功能：在 Kotlin/JS 中識別介面型別的反射支援、常用原子型別的更新函式，以及用於陣列大小調整的 `copyOf()` 多載。

### 支援在 Kotlin/JS 中透過反射識別介面型別
<primary-label ref="experimental-opt-in"/>

Kotlin 2.2.20 向 Kotlin/JS 標準程式庫添加了 [實驗性](components-stability.md#stability-levels-explained) [`KClass.isInterface`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/is-interface.html) 屬性。

透過此屬性，您現在可以檢查類別參照是否代表 Kotlin 介面。這使 Kotlin/JS 與 Kotlin/JVM 更加一致，在 Kotlin/JVM 中，您可以使用 `KClass.java.isInterface` 來檢查類別是否代表介面。

要選擇加入，請使用 `@OptIn(ExperimentalStdlibApi::class)` 註解：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun inspect(klass: `KClass<*>`) {
    // 對於介面列印 true
    println(klass.isInterface)
}
```

我們誠摯歡迎您在我們提出的問題追蹤器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-78581) 中提供意見回饋。

### 常用原子型別的新更新函式
<primary-label ref="experimental-opt-in"/>

Kotlin 2.2.20 引入了新的實驗性函式，用於更新常用的原子型別及其對應陣列的元素。
每個函式都會使用其中一個更新函式原子地計算一個新值並替換當前值，傳回值取決於您使用的函式：

* [`update()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/update.html) 和 [`updateAt()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/update-at.html) 設置新值但不傳回結果。
* [`fetchAndUpdate()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/fetch-and-update.html) 和 [`fetchAndUpdateAt()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/fetch-and-update-at.html) 設置新值並傳回變更前的舊值。
* [`updateAndFetch()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/update-and-fetch.html) 和 [`updateAndFetchAt()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent.atomics/update-and-fetch-at.html) 設置新值並傳回變更後的更新值。

您可以使用這些函式來實作開箱即用不支援的原子轉換，例如乘法或按位元運算。
在此變更之前，遞增常用原子型別並讀取舊值需要使用 [`compareAndSet()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.concurrent/-atomic-int/compare-and-set.html) 函式進行迴圈。

與常用原子型別的所有 API 一樣，這些函式也是 [實驗性](components-stability.md#stability-levels-explained)。
要選擇加入，請使用 `@OptIn(ExperimentalAtomicApi::class)` 註解。

這是一個執行不同種類更新並傳回舊值或更新值的程式碼示例：

```kotlin
import kotlin.concurrent.atomics.*
import kotlin.random.Random

@OptIn(ExperimentalAtomicApi::class)
fun main() {
    val counter = AtomicLong(Random.nextLong())
    val minSetBitsThreshold = 20

    // 設置新值而不使用結果
    counter.update { if (it < 0xDECAF) 0xCACA0 else 0xC0FFEE }

    // 檢索當前值，然後對其進行更新
    val previousValue = counter.fetchAndUpdate { 0x1CEDL.shl(Long.SIZE_BITS - it.countLeadingZeroBits()) or it }

    // 更新值，然後檢索結果
    val current = counter.updateAndFetch {
        if (it.countOneBits() < minSetBitsThreshold) it.shl(20) or 0x15BADL else it
    }

    val hexFormat = HexFormat {
        upperCase = true
        number {
            removeLeadingZeros = true
        }
    }
    println("Previous value: ${previousValue.toHexString(hexFormat)}")
    println("Current value: ${current.toHexString(hexFormat)}")
    println("Expected status flag set: ${current and 0xBAD != 0xBADL}")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.2.20"}

我們誠摯歡迎您在我們提出的問題追蹤器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-76389) 中提供意見回饋。

### 支援陣列的 `copyOf()` 多載
<primary-label ref="experimental-opt-in"/>

Kotlin 2.2.20 引入了 [`copyOf()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/copy-of.html) 函式的實驗性多載。
它適用於泛型型別 `Array<T>` 的陣列和所有基元陣列型別。

您可以使用此函式擴大陣列，並使用來自初始設定式 Lambda 的值填充新元素。
這可以幫助您減少自訂樣板程式碼，並修復了調整泛型 `Array<T>` 大小時產生可為 null 結果 (`Array<T?>`) 的常見痛點。

這是一個例子：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val row1: `Array<String>` = arrayOf("one", "two")
    // 調整陣列大小並使用 Lambda 填充新元素
    val row2: `Array<String>` = row1.copyOf(4) { "default" }
    println(row2.contentToString())
    // [one, two, default, default]
}
```

此 API 為 [實驗性](components-stability.md#stability-levels-explained)。要選擇加入，請使用 `@OptIn(ExperimentalStdlibApi::class)` 註解。

我們誠摯歡迎您在我們的 [問題追蹤器](https://youtrack.jetbrains.com/issue/KT-70984) 中提供意見回饋。

## Compose 編譯器

在此版本中，Compose 編譯器透過添加新的警告和改進組建指標的輸出來提升開發品質，使指標更易於閱讀。

### 預設參數的語言版本限制

在此版本中，如果為編譯指定的語言版本低於支援抽象或 open composable 函式中的預設參數所需的版本，Compose 編譯器會報錯。

從 Kotlin 2.1.0 開始，Compose 編譯器支援抽象函式中的預設參數；從 Kotlin 2.2.0 開始，支援 open 函式中的預設參數。當使用較新版本的 Compose 編譯器並針對舊版 Kotlin 語言版本時，程式庫開發人員應注意，即使語言版本不支援，抽象或 open 函式中的預設參數仍可能出現在公開 API 中。

### K2 編譯器的 Composable 目標警告

此版本添加了關於使用 K2 編譯器時 [`@ComposableTarget`](https://developer.android.com/reference/kotlin/androidx/compose/runtime/ComposableTarget) 不相符的警告。

例如：

```text
@Composable fun App() {
  Box { // <-- `Box` 是一個 `@UiComposable`
    Path(...) // <-- `Path` 是一個 `@VectorComposable`
    ^^^^^^^^^
    警告：在預期 UI composable 的位置呼叫了 Vector composable 函式
  }
}
```
### 組建指標中的完全限定名

組建指標中報告的類別和函式名稱現在已完全限定，這使得更容易區分不同封裝中具有相同名稱的宣告。

此外，組建指標不再包含預設參數中複雜表達式的傾印，使其更易於閱讀。

## 重大變更與棄用

本節重點介紹值得注意的重要重大變更和棄用：

* [kapt](kapt.md) 編譯器外掛程式現在預設使用 K2 編譯器。因此，控制外掛程式是否使用 K2 編譯器的 `kapt.use.k2` 屬性現已棄用。如果您將此屬性設置為 `false` 以停用 K2 編譯器，Gradle 將顯示警告。

## 文件更新

Kotlin 文件進行了一些值得注意的變更：

* [Kotlin 路線圖](roadmap.md) – 參閱 Kotlin 在語言和生態系統演進方面的最新優先順序清單。
* [屬性](properties.md) – 了解在 Kotlin 中使用屬性的多種方式。
* [條件與迴圈](control-flow.md) – 了解條件與迴圈在 Kotlin 中如何運作。
* [Kotlin/JavaScript](js-overview.md) – 探索 Kotlin/JS 的使用案例。
* [針對 Web](gradle-configure-project.md#targeting-the-web) – 了解 Gradle 為 Web 開發提供的不同目標。
* [Kotlin daemon](kotlin-daemon.md) – 了解 Kotlin daemon 及其如何與建置系統和 Kotlin 編譯器協作。
* [協程 (Coroutines) 總覽頁面](coroutines-overview.md) – 了解協程概念並開始您的學習之旅。
* [Kotlin/Native 二進位選項](native-binary-options.md) – 了解 Kotlin/Native 的二進位選項以及如何配置它們。
* [偵錯 Kotlin/Native](native-debugging.md) – 探索使用 Kotlin/Native 進行偵錯的不同方式。
* [自訂 LLVM 後端的提示](native-llvm-passes.md) – 了解 Kotlin/Native 如何使用 LLVM 並調整優化階段。
* [開始使用 Exposed 的 DAO API](https://www.jetbrains.com/help/exposed/get-started-with-exposed-dao.html) – 了解如何使用 Exposed 的資料存取物件 (DAO) API 在關聯式資料庫中存儲和檢索資料。
* Exposed 文件中關於 R2DBC 的新頁面：
  * [使用資料庫](https://www.jetbrains.com/help/exposed/working-with-database.html)
  * [使用 ConnectionFactory](https://www.jetbrains.com/help/exposed/working-with-connectionfactory.html)
  * [自訂型別映射](https://www.jetbrains.com/help/exposed/custom-type-mapping.html)
* [HTMX 整合](https://ktor.io/docs/htmx-integration.html) – 了解 Ktor 如何為 HTMX 提供實驗性的頂級支援。

## 如何更新至 Kotlin 2.2.20

Kotlin 外掛程式作為隨附外掛程式分佈在 IntelliJ IDEA 和 Android Studio 中。

要更新至新的 Kotlin 版本，請在您的建置腳本中 [將 Kotlin 版本變更](releases.md#update-to-a-new-kotlin-version) 為 2.2.20。