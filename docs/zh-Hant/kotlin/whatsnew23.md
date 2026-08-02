[//]: # (title: Kotlin 2.3.0 的新功能)

<web-summary>閱讀 Kotlin 2.3.0 發佈說明，涵蓋新語言特性、Kotlin Multiplatform、JVM、Native、JS 與 Wasm 的更新，以及 Gradle 與 Maven 的建置工具支援。</web-summary>

_[發佈日期：2025 年 12 月 16 日](releases.md#release-history)_

<tldr>
    <p>有關錯誤修正版本 2.3.10 的詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.3.10">變更日誌</a></p>
</tldr>

Kotlin 2.3.0 版本已正式發佈！以下是主要的亮點：

* **語言**：[更多穩定且預設的功能、未使用的傳回值檢查器、明確支援欄位，以及內容感知的解析變更](#language)。
* **Kotlin/JVM**：[支援 Java 25](#kotlin-jvm-support-for-java-25)。
* **Kotlin/Native**：[透過 Swift 匯出改進互通性、加速發佈任務的建置時間、Beta 版的 C 與 Objective-C 程式庫匯入](#kotlin-native)。
* **Kotlin/Wasm**：[預設啟用完全限定名稱與新的例外處理提案，以及新的 Latin-1 字元緊湊儲存方式](#kotlin-wasm)。
* **Kotlin/JS**：[新的實驗性 suspend 函式匯出、`LongArray` 表示法、統一的隨伴物件存取等](#kotlin-js)。
* **Gradle**：[與 Gradle 9.0 的相容性，以及用於註冊產生的原始碼的新 API](#gradle)。
* **Compose 編譯器**：[縮減後的 Android 應用程式堆疊追蹤](#compose-compiler-stack-traces-for-minified-android-applications)。
* **標準函式庫**：[穩定的時間追蹤功能以及改進的 UUID 產生與剖析](#standard-library)。

您也可以在下方的影片中查看更新概覽：

<video src="https://www.youtube.com/v/_6PSSkqwbp8" title="Hands-on with Kotlin 2.3"/>

> 有關 Kotlin 發佈週期的資訊，請參閱 [Kotlin 發佈流程](releases.md)。
> 
{style="tip"}

## IDE 支援

支援 2.3.0 的 Kotlin 外掛程式已隨附於最新版本的 IntelliJ IDEA 和 Android Studio 中。
您不需要更新 IDE 中的 Kotlin 外掛程式。
您只需在建置指令碼中[將 Kotlin 版本更改](releases.md#update-to-a-new-kotlin-version)為 2.3.0 即可。

詳情請參閱[更新至新版本](releases.md#update-to-a-new-kotlin-version)。

## 語言

Kotlin 2.3.0 專注於功能的穩定化，引入了偵測未使用傳回值的新機制，並改進了內容感知的解析。

### 穩定功能

在之前的 Kotlin 版本中，有幾個新的語言特性是以 Experimental（實驗性）和 Beta（測試版）形式引入的。
以下功能在 Kotlin 2.3.0 中已晉升為 [Stable (穩定)](components-stability.md#stability-levels-explained)：

* [支援巢狀型別別名](whatsnew22.md#support-for-nested-type-aliases)
* [基於資料流的 `when` 運算式窮舉性檢查](whatsnew2220.md#data-flow-based-exhaustiveness-checks-for-when-expressions)

### 預設啟用的功能

在 Kotlin 2.3.0 中，對於[具有明確傳回型別的運算式主體中的 `return` 陳述式](whatsnew2220.md#support-for-return-statements-in-expression-bodies-with-explicit-return-types)的支援現在已預設啟用。

[查看 Kotlin 語言特性與提案的完整清單](kotlin-language-features-and-proposals.md)。

### 未使用的傳回值檢查器
<primary-label ref="experimental-general"/>

Kotlin 2.3.0 引入了未使用的傳回值檢查器，以協助防止結果被忽略。
每當運算式傳回 `Unit` 或 `Nothing` 以外的值，且該值未傳遞給函式、未在條件中檢查或未以其他方式使用時，它都會發出警告。

該檢查器有助於捕捉因函式呼叫產生的有意義結果被無意中捨棄而導致的錯誤，這類錯誤可能會導致非預期的行為或難以追蹤的問題。

> 檢查器會忽略從遞增運算（如 `++` 和 `--`）傳回的值。
>
{style="note"}

請考慮以下範例：

```kotlin
fun formatGreeting(name: String): String {
    if (name.isBlank()) return "Hello, anonymous user!"
    if (!name.contains(' ')) {
        // 檢查器會回報一則警告，提示此結果被忽略
        "Hello, " + name.replaceFirstChar(Char::titlecase) + "!"
    }
    val (first, last) = name.split(' ')
    return "Hello, $first! Or should I call you Dr. $last?"
}
```

在此範例中，建立了一個字串但從未被使用，因此檢查器將其回報為被忽略的結果。

此功能目前為 [Experimental (實驗性)](components-stability.md#stability-levels-explained)。
若要啟用，請在您的建置檔案中加入以下編譯器選項：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xreturn-value-checker=check")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xreturn-value-checker=check</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

使用此選項時，檢查器僅會回報來自已標記之運算式的被忽略結果，例如 Kotlin 標準函式庫中的大多數函式。

若要標記您的函式，請使用 `@MustUseReturnValues` 註解來標記您希望檢查器回報未使用傳回值的範圍。

例如，您可以標記整個檔案：

```kotlin
// 標記此檔案中的所有函式和類別，以便檢查器回報未使用的傳回值
@file:MustUseReturnValues

package my.project

fun someFunction(): String
```

或者，您可以標記特定的類別：

```kotlin
// 標記此類別中的所有函式，以便檢查器回報未使用的傳回值
@MustUseReturnValues
class Greeter {
    fun greet(name: String): String = "Hello, $name"
}

fun someFunction(): Int = ...
```
{validate="false"}

您也可以透過在建置檔案中加入以下編譯器選項來標記整個專案：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xreturn-value-checker=full")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xreturn-value-checker=full</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

使用此設定後，Kotlin 會自動將您的編譯檔案視為已使用 `@MustUseReturnValues` 標記，且檢查器會回報專案中函式的所有傳回值。

您可以透過使用 `@IgnorableReturnValue` 註解來隱藏特定函式的警告。
請在忽略傳回值是常見且預期的函式上使用此註解，例如 `MutableList.add`：

```kotlin
@IgnorableReturnValue
fun <T> MutableList<T>.addAndIgnoreResult(element: T): Boolean {
    return add(element)
}
```

您也可以在不將函式本身標記為可忽略的情況下隱藏警告。
若要執行此操作，請將結果指派給帶有底線 (`_`) 的特殊匿名變數：

```kotlin
// 不可忽略的函式
fun computeValue(): Int = 42

fun main() {
    // 會回報一則警告：結果被忽略
    computeValue()

    // 僅在此呼叫點使用特殊的未使用變數來隱藏警告
    val _ = computeValue()
}
```

如需更多資訊，請參閱該特性的 [KEEP]( https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0412-unused-return-value-checker.md)。

我們歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-12719) 中提供意見回饋。

### 明確支援欄位
<primary-label ref="experimental-opt-in"/>

Kotlin 2.3.0 引入了明確支援欄位 (explicit backing fields) —— 這是一種用於明確宣告持有屬性值的底層欄位的新語法，與現有的隱式支援欄位形成對比。

您可以在下方的影片中查看此功能的概覽：

<video src="https://www.youtube.com/v/PU-VdH8HhVA" title="Explicit Backing Fields are experimental in Kotlin 2.3"/>

當屬性的內部型別與其公開的 API 型別不同時，新的明確語法簡化了常見的支援屬性 (backing properties) 模式。例如，您可能會使用 `ArrayList`，但將其公開為唯讀的 `List` 或 `MutableList`。以前這需要一個額外的私有屬性。

透過明確支援欄位，`field` 的實作型別會直接在屬性的作用域內定義。這消除了對單獨私有屬性的需求，並允許編譯器在同一個私有作用域內自動對支援欄位的型別進行智慧轉換 (smart casting)。

之前：

```kotlin
private val _city = MutableStateFlow<String>("")
val city: StateFlow<String> get() = _city

fun updateCity(newCity: String) {
    _city.value = newCity
}
```

之後：

```kotlin
val city: StateFlow<String>
    field = MutableStateFlow("")

fun updateCity(newCity: String) {
    // 智慧轉換會自動運作
    city.value = newCity
}
```

此功能目前為 [Experimental (實驗性)](components-stability.md#stability-levels-explained)。
若要啟用，請在您的建置檔案中加入以下編譯器選項：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xexplicit-backing-fields")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xexplicit-backing-fields</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

如需更多資訊，請參閱該特性的 [KEEP](https://github.com/Kotlin/KEEP/blob/explicit-backing-fields/proposals/explicit-backing-fields.md)。

我們歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-14663) 中提供意見回饋。

### 內容感知的解析變更
<primary-label ref="experimental-general"/>

內容感知的解析 (Context-sensitive resolution) 仍處於 [Experimental (實驗性)](components-stability.md#stability-levels-explained) 階段，但我們正根據使用者回饋持續改進該功能：

* 當前型別的密封 (sealed) 與封閉 (enclosing) 超型別現在被視為搜尋內容範圍的一部分。
  不考慮其他超型別範圍。請參閱 [KT-77823](https://youtrack.jetbrains.com/issue/KT-77823) YouTrack 問題以了解動機與範例。
* 當涉及型別運算子與相等性時，如果使用內容感知的解析導致解析歧義，編譯器現在會回報警告。例如，當匯入了一個名稱衝突的類別宣告時，可能會發生這種情況。
  請參閱 [KT-77821](https://youtrack.jetbrains.com/issue/KT-77821) YouTrack 問題以了解動機與範例。

請參閱 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0379-context-sensitive-resolution.md) 中的當前提案全文。

## Kotlin/JVM：支援 Java 25

從 Kotlin 2.3.0 開始，編譯器可以產生包含 Java 25 位元組碼的類別。

## Kotlin/Native

Kotlin 2.3.0 改進了 Swift 匯出支援以及 C 與 Objective-C 程式庫的匯入，並增強了發佈任務的建置時間。

### 透過 Swift 匯出改進互通性
<primary-label ref="experimental-general"/>

Kotlin 2.3.0 透過 Swift 匯出進一步改進了 Kotlin 與 Swift 的互通性，增加了對原生列舉類別與可變參數函式參數的支持。

以前，Kotlin 列舉會被匯出為普通的 Swift 類別。現在對應是直接的，您可以使用規則的原生 Swift 列舉。例如：

```kotlin
// Kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF)
}

val color = Color.RED
```

```Swift
// Swift
public enum Color: Swift.CaseIterable, Swift.LosslessStringConvertible, Swift.RawRepresentable {
    case RED, GREEN, BLUE

    var rgb: Int { get }
}
```

此外，Kotlin 的 [`vararg`](functions.md#variable-number-of-arguments-varargs) 函式現在直接對應到 Swift 的可變參數函式參數。

此類函式允許您傳遞可變數量的引數。這在您事先不知道引數數量，或想要在不指定型別的情況下建立或傳遞集合時非常有用。例如：

```kotlin
// Kotlin
fun log(vararg messages: String)
```

```Swift
// Swift
public func log(messages: Swift.String...)
```

> 目前尚不支援可變參數函式參數中的泛型型別。
>
{style="note"}

### C 與 Objective-C 程式庫匯入進入 Beta 版
<primary-label ref="beta"/>

在 Kotlin/Native 專案中[匯入 C](native-c-interop.md) 與 [Objective-C](native-objc-interop.md) 程式庫的支援目前處於 [Beta (測試版)](components-stability.md#stability-levels-explained)。

目前仍無法保證與不同版本的 Kotlin、相依性以及 Xcode 完全相容，但編譯器現在會在發生二進位不相容問題時發出更好的診斷資訊。

該匯入功能尚未達到穩定狀態，在專案中使用 C 與 Objective-C 程式庫進行某些與 C 和 Objective-C 互通性相關的操作時，仍需使用 `@ExperimentalForeignApi` 啟用註解，包括：

* `kotlinx.cinterop.*` 套件中的某些 API，在處理原生程式庫或記憶體時需要用到。
* 原生程式庫中的所有宣告，但[平台程式庫](native-platform-libs.md)除外。

為了保持相容性並防止您必須更改原始碼，新的穩定狀態並未反映在註解名稱中。

如需更多資訊，請參閱 [C 與 Objective-C 程式庫匯入的穩定性](native-lib-import-stability.md)。

### Objective-C 標頭中區塊型別的預設明確名稱

在 Kotlin 2.2.20 中引入的 Kotlin 函式型別中的[明確參數名稱](whatsnew2220.md#explicit-names-in-block-types-for-objective-c-headers)，現在是從 Kotlin/Native 專案匯出的 Objective-C 標頭的預設設定。這些參數名稱改進了 Xcode 中的自動補全建議，並有助於避免 Clang 警告。

請考慮以下 Kotlin 程式碼：

```kotlin
// Kotlin:
fun greetUser(block: (name: String) -> Unit) = block("John")
```

Kotlin 會將參數名稱從 Kotlin 函式型別轉發到 Objective-C 區塊型別，使 Xcode 能夠在建議中使用它們：

```ObjC
// Objective-C:
greetUserBlock:^(NSString *name) {
    // ...
};
```

如果您遇到問題，可以停用明確參數名稱。
若要執行此操作，請在您的 `gradle.properties` 檔案中加入以下[二進位選項](native-binary-options.md)：

```none
kotlin.native.binary.objcExportBlockExplicitParameterNames=false
```

請在 [YouTrack](https://kotl.in/issue) 中回報任何問題。

### 發佈任務的建置時間更快

Kotlin/Native 在 2.3.0 中獲得了多項效能改進。這使得發佈任務（如 `linkRelease*`，例如 `linkReleaseFrameworkIosArm64`）的建置時間更快。

根據我們的基準測試，根據專案大小，發佈版本的建置速度最多可提高 40%。這些改進在針對 iOS 的 Kotlin Multiplatform 專案中尤為明顯。

有關提高專案編譯時間的更多提示，請參閱[文件](native-improving-compilation-time.md)。

### Apple 目標支援變更

Kotlin 2.3.0 提高了 Apple 目標的最低支援版本：

* iOS 與 tvOS：從 12.0 提高到 14.0。
* watchOS：從 5.0 提高到 7.0。

根據公開資料，舊版本的使用已非常有限。此變更簡化了我們對 Apple 目標的整體維護，並為在 Kotlin/Native 中支援 [Mac Catalyst](https://developer.apple.com/documentation/uikit/mac-catalyst) 提供了機會。

如果您必須在專案中保留舊版本，請在建置檔案中加入以下內容：

```kotlin
kotlin {
    targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget>().configureEach {
        binaries.configureEach {
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.ios=12.0"
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.tvos=12.0"
        }
    }
}
```

請注意，這類設定不保證能成功編譯，且可能會在建置或執行時造成應用程式崩潰。

此版本也進入了 [Intel 晶片型 Apple 目標棄用週期](whatsnew2220.md#deprecation-of-x86-64-apple-targets)的下一步。

從 Kotlin 2.3.0 開始，`macosX64`、`iosX64`、`tvosX64` 與 `watchosX64` 目標已降級至第 3 級支援層級。這意味著不保證會在 CI 上進行測試，且可能不提供不同編譯器版本之間的原始碼與二進位相容性。我們計畫最終在 Kotlin 2.4.0 中移除對 `x86_64` Apple 目標的支援。

如需更多資訊，請參閱 [Kotlin/Native 目標支援](native-target-support.md)。

## Kotlin/Wasm

Kotlin 2.3.0 預設啟用了 Kotlin/Wasm 目標的完全限定名稱、`wasmWasi` 目標的新例外處理提案，並引入了 Latin-1 字元的緊湊儲存方式。

### 預設啟用完全限定名稱

在 Kotlin/Wasm 目標上，完全限定名稱 (FQN) 在執行時預設不啟用。
您必須手動啟用對 `KClass.qualifiedName` 屬性的支援才能使用 FQN。

以前只能存取類別名稱（不含套件），這對從 JVM 移植到 Wasm 目標的程式碼或在執行時預期完全限定名稱的程式庫造成了問題。

在 Kotlin 2.3.0 中，`KClass.qualifiedName` 屬性在 Kotlin/Wasm 目標上預設啟用。
這意指 FQN 在執行時無需任何額外配置即可使用。

預設啟用 FQN 改進了程式碼的可移植性，並透過顯示完全限定名稱使執行時錯誤更具資訊性。

此變更不會增加編譯後的 Wasm 二進位檔案大小，這要歸功於編譯器優化，該優化透過對 Latin-1 字串常值使用緊湊儲存來減少元資料。

### Latin-1 字元的緊湊儲存方式

以前，Kotlin/Wasm 會按原樣儲存字串常值資料，這意味著每個字元都以 UTF-16 編碼。這對於僅包含或主要包含 Latin-1 字元的文字來說並非最佳方案。

從 Kotlin 2.3.0 開始，Kotlin/Wasm 編譯器會將僅包含 Latin-1 字元的字串常值以 UTF-8 格式儲存。

根據 JetBrains [KotlinConf 應用程式](https://github.com/JetBrains/kotlinconf-app)的實驗，此優化顯著減少了元資料。其結果如下：

* 與未經優化的建置相比，Wasm 二進位檔案縮小了高達 13%。
* 與不儲存完全限定名稱的早期版本相比，即使啟用了完全限定名稱，Wasm 二進位檔案仍縮小了高達 8%。

這種緊湊儲存對於下載與啟動時間至關重要的 Web 環境非常重要。此外，
此優化消除了以前阻礙儲存[類別完全限定名稱並預設啟用 `KClass.qualifiedName`](#fully-qualified-names-enabled-by-default) 的大小障礙。

此變更預設啟用，無需進一步操作。

### `wasmWasi` 預設啟用新的例外處理提案

以前，Kotlin/Wasm 對所有目標（包括 [`wasmWasi`](wasm-overview.md#kotlin-wasm-and-wasi)）使用[舊版例外處理提案](https://github.com/WebAssembly/exception-handling/blob/master/proposals/exception-handling/legacy/Exceptions.md)。然而，大多數獨立的 WebAssembly 虛擬機 (VM) 正朝著[新版例外處理提案](https://github.com/WebAssembly/exception-handling/blob/main/proposals/exception-handling/Exceptions.md)看齊。

從 Kotlin 2.3.0 開始，新的 WebAssembly 例外處理提案在 `wasmWasi` 目標上預設啟用，確保與現代 WebAssembly 執行環境有更好的相容性。

對於 `wasmWasi` 目標，提早引入此變更是安全的，因為針對該目標的應用程式通常在多樣性較低的執行環境中運行（通常在單一特定 VM 上運行），這通常由使用者控制，從而降低了相容性問題的風險。

新的例外處理提案在 [`wasmJs` 目標](wasm-overview.md#kotlin-wasm-and-compose-multiplatform)上仍預設關閉。
您可以使用 `-Xwasm-use-new-exception-proposal` 編譯器選項手動啟用它。

## Kotlin/JS

Kotlin 2.3.0 為將 suspend 函式匯出至 JavaScript 提供了實驗性支援，並使用 `BigInt64Array` 型別來表示 Kotlin 的 `LongArray` 型別。

在此版本中，您現在可以以統一的方式存取介面內部的隨伴物件，在帶有隨伴物件的介面中使用 `@JsStatic` 註解，在個別函式與類別中使用 `@JsQualifier` 註解，並透過新註解 `@JsExport.Default` 支援預設匯出。

### 使用 `JsExport` 匯出 suspend 函式的新方式
<primary-label ref="experimental-opt-in"/>

以前，`@JsExport` 註解不允許將 suspend 函式（或包含此類函式的類別與介面）匯出到 JavaScript。您必須手動封裝每個 suspend 函式，這既繁瑣又容易出錯。

從 Kotlin 2.3.0 開始，可以使用 `@JsExport` 註解將 suspend 函式直接匯出至 JavaScript。

啟用 suspend 函式匯出減少了樣板程式碼，並改進了 Kotlin/JS 與 JavaScript/TypeScript (JS/TS) 之間的互通性。Kotlin 的非同步函式現在可以直接從 JS/TS 呼叫，無需額外程式碼。

若要啟用此功能，請在您的 `build.gradle.kts` 檔案中加入以下編譯器選項：

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xenable-suspend-function-exporting")
    }
}
```

啟用後，標記有 `@JsExport` 註解的類別與函式可以包含 suspend 函式，且無需額外的包裝。

它們可以作為一般的 JavaScript 非同步函式使用，也可以作為非同步函式被覆寫：

```kotlin
@JsExport
open class Foo {
    suspend fun foo() = "Foo"
}
```

```typescript
class Bar extends Foo {
    override async foo(): Promise<string> {
        return "Bar"
    }
}
```

此功能目前為 [Experimental (實驗性)](components-stability.md#stability-levels-explained)。我們歡迎您在我們的問題追蹤器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-56281/KJS-Cant-export-suspend-functions) 提供意見回饋。

### 使用 `BigInt64Array` 型別表示 Kotlin 的 `LongArray` 型別
<primary-label ref="experimental-opt-in"/>

以前，Kotlin/JS 將其 `LongArray` 表示為 JavaScript 的 `Array<bigint>`。這種方法雖然可行，但對於預期使用型別化陣列 (typed arrays) 的 JavaScript API 來說並不理想。

從此版本開始，Kotlin/JS 在編譯為 JavaScript 時，現在使用 JavaScript 內建的 `BigInt64Array` 型別來表示 Kotlin 的 `LongArray` 值。

使用 `BigInt64Array` 簡化了與使用型別化陣列的 JavaScript API 的互通性。它還允許接受或傳回 `LongArray` 的 API 能更自然地從 Kotlin 匯出到 JavaScript。

若要啟用此功能，請在您的 `build.gradle.kts` 檔案中加入以下編譯器選項：

```kotlin
kotlin {
    js {
        // ...
        compilerOptions {
            freeCompilerArgs.add("-Xes-long-as-bigint")
        }
    }
}
```

此功能目前為 [Experimental (實驗性)](components-stability.md#stability-levels-explained)。我們歡迎您在我們的問題追蹤器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-79284/Use-BigInt64Array-for-LongArray) 提供意見回饋。

### 跨 JS 模組系統的統一隨伴物件存取

以前，當您使用 `@JsExport` 註解將帶有隨伴物件的 Kotlin 介面匯出到 JavaScript/TypeScript 時，在 TypeScript 中使用該介面的方式，ES 模組與其他模組系統會有所不同。

因此，您必須根據模組系統調整 TypeScript 端的輸出使用方式。

請考慮這段 Kotlin 程式碼：

```kotlin
@JsExport
interface Foo {
    companion object {
        fun bar() = "OK"
    }
}
```

您必須根據模組系統以不同方式呼叫它：

```kotlin
// 適用於 CommonJS, AMD, UMD, 與無模組
Foo.bar()

// 適用於 ES 模組
Foo.getInstance().bar() 
```

在此版本中，Kotlin 統一了所有 JavaScript 模組系統的隨伴物件匯出方式。

現在，對於每個模組系統（ES 模組, CommonJS, AMD, UMD, 無模組），存取介面內部的隨伴物件方式皆相同（就像類別中的隨伴物件一樣）：

```kotlin
// 適用於所有模組系統
Foo.Companion.bar()
```

此改進還修復了集合的互通性。以前，存取集合工廠函式的方式會因模組系統而異：

```kotlin
// 適用於 CommonJS, AMD, UMD, 與無模組
KtList.fromJsArray([1, 2, 3])

// 適用於 ES 模組
KtList.getInstance().fromJsArray([1, 2, 3])
```

現在，存取集合工廠函式在所有模組系統中都是相似的：

```kotlin
// 適用於所有模組系統
KtList.fromJsArray([1, 2, 3])
```

此變更減少了模組系統之間行為不一致的情況，並避免了錯誤與互通性問題。

此功能已預設啟用。

### 支援在帶有隨伴物件的介面中使用 `@JsStatic` 註解

以前，匯出的帶有隨伴物件的介面中不允許使用 `@JsStatic` 註解。

例如，以下程式碼會產生錯誤，因為只有類別隨伴物件的成員才能標記為 `@JsStatic`：

```kotlin
@JsExport
interface Foo {
    companion object {
        @JsStatic // 錯誤
        fun bar() = "OK"
    }
}
```

在這種情況下，您必須捨棄 `@JsStatic` 註解，並透過以下方式從 JavaScript (JS) 存取隨伴物件：

```kotlin
// 適用於所有模組系統
Foo.Companion.bar()
```

現在，帶有隨伴物件的介面已支援 `@JsStatic` 註解。
您可以在此類隨伴物件上使用此註解，並直接從 JS 呼叫該函式，就像對待類別一樣：

```kotlin
// 適用於所有模組系統
Foo.bar()
```

此變更簡化了 JS 中的 API 使用方式，允許在介面上使用靜態工廠方法，並消除了類別與介面之間的不一致性。

此功能已預設啟用。

### 允許在個別函式與類別中使用 `@JsQualifier` 註解

以前，您只能在檔案層級套用 `@JsQualifier` 註解，這要求所有外部 JavaScript (JS) 宣告都必須放置在不同的檔案中。

從 Kotlin 2.3.0 開始，您可以直接將 `@JsQualifier` 註解套用於個別函式與類別，就像 `@JsModule` 與 `@JsNonModule` 註解一樣。

例如，現在您可以在同一個檔案中將以下外部函式程式碼寫在一般 Kotlin 宣告旁邊：

```kotlin
@JsQualifier("jsPackage")
private external fun jsFun()
```

此變更簡化了 Kotlin/JS 的互通性，使專案結構更簡潔，並讓 Kotlin/JS 與其他平台處理外部宣告的方式保持一致。

此功能已預設啟用。

### 支援 JavaScript 預設匯出

以前，Kotlin/JS 無法從 Kotlin 程式碼產生 JavaScript 的預設匯出。相反地，Kotlin/JS 僅會產生具名匯出，例如：

```javascript
export { SomeDeclaration };
```

如果您需要預設匯出，則必須使用編譯器內部的因應措施，例如將 `@JsName` 註解與 `default` 加上空格作為引數：

```kotlin
@JsExport
@JsName("default ")
class SomeDeclaration
```

Kotlin/JS 現在透過一個新註解直接支援預設匯出：

```kotlin
@JsExport.Default
```

當您將此註解套用於 Kotlin 宣告（類別、物件、函式或屬性）時，
產生的 JavaScript 會自動為 ES 模組包含一個 `export default` 陳述式：

```javascript
export default HelloWorker;
```

> 對於 ES 模組以外的模組系統，新的 `@JsExport.Default` 註解運作方式與一般的 `@JsExport` 註解類似。
>
{style="note"}

此變更使 Kotlin 程式碼符合 JavaScript 慣例，對於 Cloudflare Workers 等平台或 `React.lazy` 等框架尤為重要。

此功能已預設啟用。您只需使用 `@JsExport.Default` 註解即可。

## Gradle

Kotlin 2.3.0 與 Gradle 7.6.3 到 9.0.0 完全相容。您也可以使用到最新版本的 Gradle。但請注意，這樣做可能會導致棄用警告，且某些新的 Gradle 功能可能無法運作。

此外，最低支援的 Android Gradle plugin 版本現在為 8.2.2，最高支援版本為 8.13.0。

Kotlin 2.3.0 還引入了一個新的 API，用於在您的 Gradle 專案中註冊產生的原始碼。

### 用於在 Gradle 專案中註冊產生的原始碼的新 API
<primary-label ref="experimental-general"/>

Kotlin 2.3.0 在 [`KotlinSourceSet`](https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.plugin/-kotlin-source-set/)
介面中引入了一個新的 [Experimental (實驗性)](components-stability.md#stability-levels-explained) API，您可以使用它在 Gradle 專案中註冊產生的原始碼。

這個新 API 是一項易用性改進，有助於 IDE 區分產生的程式碼與一般的原始碼檔案。
該 API 允許 IDE 在 UI 中以不同方式醒目提示產生的程式碼，並在匯入專案時觸發產生任務。我們目前正致力於在 IntelliJ IDEA 中加入此支援。此 API 對於產生程式碼的第三方外掛程式或工具也非常有用，例如 [KSP](ksp-overview.md) (Kotlin Symbol Processing)。

如需更多資訊，請參閱[註冊產生的原始碼](gradle-configure-project.md#register-generated-sources)。

## 標準函式庫

Kotlin 2.3.0 穩定了新的時間追蹤功能 [`kotlin.time.Clock` 與 `kotlin.time.Instant`](whatsnew2120.md#new-time-tracking-functionality)，並對實驗性 UUID API 進行了多項改進。

### 改進的 UUID 產生與剖析
<primary-label ref="experimental-opt-in"/>

Kotlin 2.3.0 對 UUID API 引入了多項改進，包括：

* [剖析無效 UUID 時支援傳回 `null`](#support-for-returning-null-when-parsing-invalid-uuids)
* [用於產生 v4 與 v7 UUID 的新函式](#new-functions-to-generate-v4-and-v7-uuids)
* [支援為特定時間戳記產生 v7 UUID](#support-for-generating-v7-uuids-for-specific-timestamps)

標準函式庫中的 UUID 支援目前為 [Experimental (實驗性)](components-stability.md#stability-levels-explained)，但[計畫在未來穩定化](https://youtrack.jetbrains.com/issue/KT-81395)。
若要啟用，請使用 `@OptIn(ExperimentalUuidApi::class)` 註解或在建置檔案中加入以下編譯器選項：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-opt-in=kotlin.uuid.ExperimentalUuidApi")
    }
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-opt-in=kotlin.uuid.ExperimentalUuidApi</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

我們歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-81395) 或[相關 Slack 頻道](https://slack-chats.kotlinlang.org/c/uuid)中提供意見回饋。

#### 剖析無效 UUID 時支援傳回 `null`

Kotlin 2.3.0 引入了從字串建立 `Uuid` 執行個體的新函式，如果該字串不是有效的 UUID，則會傳回 `null` 而不是拋出例外。

這些函式包括：

* `Uuid.parseOrNull()` – 剖析十六進位加連字號 (hex-and-dash) 或純十六進位格式的 UUID。
* `Uuid.parseHexDashOrNull()` – 僅剖析十六進位加連字號格式的 UUID，否則傳回 `null`。
* `Uuid.parseHexOrNull()` – 僅剖析純十六進位格式的 UUID，否則傳回 `null`。

範例如下：

```kotlin
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@OptIn(ExperimentalUuidApi::class)
fun main() {
    val valid = Uuid.parseOrNull("550e8400-e29b-41d4-a716-446655440000")
    println(valid)
    // 550e8400-e29b-41d4-a716-446655440000

    val invalid = Uuid.parseOrNull("not-a-uuid")
    println(invalid)
    // null

    val hexDashValid = Uuid.parseHexDashOrNull("550e8400-e29b-41d4-a716-446655440000")
    println(hexDashValid)
    // 550e8400-e29b-41d4-a716-446655440000

    val hexDashInvalid = Uuid.parseHexDashOrNull("550e8400e29b41d4a716446655440000")
    println(hexDashInvalid)
    // null
}
```
{kotlin-runnable="true"}

#### 用於產生 v4 與 v7 UUID 的新函式

Kotlin 2.3.0 引入了兩個用於產生 UUID 的新函式：`Uuid.generateV4()` 與 `Uuid.generateV7()`。

使用 `Uuid.generateV4()` 函式產生第 4 版 UUID，或使用 `Uuid.generateV7()` 函式產生第 7 版 UUID。

> `Uuid.random()` 函式保持不變，且仍會產生第 4 版 UUID，就像 `Uuid.generateV4()` 一樣。
>
{style="note"}

範例如下：

```kotlin
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@OptIn(ExperimentalUuidApi::class)
fun main() {
    // 產生 v4 UUID
    val v4 = Uuid.generateV4()
    println(v4)

    // 產生 v7 UUID
    val v7 = Uuid.generateV7()
    println(v7)

    // 產生 v4 UUID
    val random = Uuid.random()
    println(random)
}
```
{kotlin-runnable="true"}

#### 支援為特定時間戳記產生 v7 UUID

Kotlin 2.3.0 引入了新的 `Uuid.generateV7NonMonotonicAt()` 函式，
您可以用它來為特定的時間點產生第 7 版 UUID。

> 與 `Uuid.generateV7()` 不同，`Uuid.generateV7NonMonotonicAt()` 不保證單調排序，
> 因此為同一個時間戳記建立的多個 UUID 可能不是循序的。
>
{style="note"}

當您需要與已知時間戳記綁定的識別碼時，請使用此函式，例如重建事件 ID 或產生反映某事最初發生時間的資料庫條目時。

例如，要為特定的瞬時時間建立第 7 版 UUID，請使用以下程式碼：

```kotlin
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid
import kotlin.time.ExperimentalTime
import kotlin.time.Instant

@OptIn(ExperimentalUuidApi::class, ExperimentalTime::class)
fun main() {
    val timestamp = Instant.fromEpochMilliseconds(1577836800000) // 2020-01-01T00:00:00Z

    // 為指定的時間戳記產生 v7 UUID（不保證單調性）
    val v7AtTimestamp = Uuid.generateV7NonMonotonicAt(timestamp)
    println(v7AtTimestamp)
}
```
{kotlin-runnable="true"}

## Compose 編譯器：縮減後的 Android 應用程式堆疊追蹤

從 Kotlin 2.3.0 開始，當應用程式經由 R8 縮減時，編譯器會針對 Compose 堆疊追蹤輸出 ProGuard 對應。這擴充了以前僅在可偵錯變體中可用的實驗性堆疊追蹤功能。

發佈版本的堆疊追蹤包含群組金鑰 (group keys)，可用於在縮減後的應用程式中識別可組合函式，而無需在執行時記錄原始碼資訊的開銷。群組金鑰堆疊追蹤要求您的應用程式使用 Compose runtime 1.10 或更新版本建置。

若要啟用群組金鑰堆疊追蹤，請在初始化任何 `@Composable` 內容之前加入以下程式碼：

```kotlin
Composer.setDiagnosticStackTraceMode(ComposeStackTraceMode.GroupKeys)
```

啟用這些堆疊追蹤後，Compose runtime 在組合、測量或繪製過程中擷取到崩潰時，將會附加其自身的堆疊追蹤，即使應用程式已縮減：

```text
java.lang.IllegalStateException: <message>
        at <original trace>
    Suppressed: androidx.compose.runtime.DiagnosticComposeException: Composition stack when thrown:
        at $compose.m$123(SourceFile:1)
        at $compose.m$234(SourceFile:1)
        ...
```

Jetpack Compose 1.10 在此模式下產生的堆疊追蹤僅包含仍需反混淆的群組金鑰。Kotlin 2.3.0 版本透過 Compose Compiler Gradle 外掛程式解決了這個問題，該外掛程式現在會將群組金鑰條目附加到 R8 產生的 ProGuard 對應檔案中。如果您在編譯器無法為某些函式建立對應時看到新的警告，請向 [Google IssueTracker](https://issuetracker.google.com/issues/new?component=610764&template=1424126) 回報。

> 由於對 R8 對應檔案的相容性，Compose Compiler Gradle 外掛程式僅在為組建啟用 R8 時才會建立群組金鑰堆疊追蹤的反混淆對應。
>
{style="note"}

預設情況下，無論您是否啟用追蹤，Gradle 的對應檔案任務都會執行。如果它們導致您的建置出現問題，您可以完全停用此功能。在 Gradle 配置的 `composeCompiler {}` 區塊中加入以下屬性：

```kotlin
composeCompiler {
    includeComposeMappingFile.set(false)
}
```

> 已知問題：某些程式碼在 Android Gradle plugin 提供的專案檔案的堆疊追蹤中不會顯示：[KT-83099](https://youtrack.jetbrains.com/issue/KT-83099)。
>
{style="warning"}

請向 [Google IssueTracker](https://issuetracker.google.com/issues/new?component=610764&template=1424126) 回報遇到的任何問題。

## 重大變更與棄用

本節重點介紹重要的重大變更與棄用。
如需完整概覽，請參閱我們的[相容性指南](compatibility-guide-23.md)。

* 從 Kotlin 2.3.0 開始，編譯器[不再支援 `-language-version=1.8`](compatibility-guide-23.md#drop-support-in-language-version-for-1-8-and-1-9)。
  在非 JVM 平台上也不支援 `-language-version=1.9`。
* 不支援早於 2.0 的語言特性集（JVM 平台不包含 1.9），但語言本身仍與 Kotlin 1.0 完全向後相容。

  如果您在 Gradle 專案中同時使用 `kotlin-dsl` **與** `kotlin("jvm")` 外掛程式，您可能會看到有關不支援的 Kotlin 外掛程式版本的 Gradle 警告。請參閱我們的[相容性指南](compatibility-guide-23.md#unsupported-kgp-version-warning-when-using-kotlin-dsl-and-kotlin-jvm-plugins)以獲取遷移步驟指南。

* 在 Kotlin Multiplatform 中，對 Android 目標的支援現在可透過 Google 的 [`com.android.kotlin.multiplatform.library` 外掛程式](https://developer.android.com/kotlin/multiplatform/plugin)獲得。
  請將帶有 Android 目標的專案遷移到新外掛程式，並將您的 `androidTarget` 區塊重新命名為 `android`。

* 如果您繼續在 Android Gradle plugin (AGP) 9.0.0 或更新版本中使用 Kotlin Multiplatform Gradle 外掛程式處理 Android 目標，當使用 `androidTarget` 區塊時會看到配置錯誤，以及提供遷移指南的診斷訊息。您可以透過使用 AGP 8.x 並更新至 Kotlin 2.3.10 來避免此錯誤，或者遷移至 [Google 的 Android 目標外掛程式](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#migrate-to-google-s-plugin-for-android-targets)。

* AGP 9.0.0 包含了[內建的 Kotlin 支援](https://developer.android.com/build/releases/agp-preview#android-gradle-plugin-built-in-kotlin)。
  從 Kotlin 2.3.0 開始，[如果您將此版本的 AGP 與 `kotlin-android` 外掛程式配合使用，會看到配置錯誤](compatibility-guide-23.md#deprecate-kotlin-android-plugin-for-agp-versions-9-0-0-and-later)，
  因為該外掛程式已不再需要。系統提供新的診斷訊息來協助您進行遷移。
  如果您使用較舊的 AGP 版本，會看到棄用警告。

* 不再支援 Ant 建置系統。

## 文件更新

Kotlin Multiplatform 文件已移至 kotlinlang.org。現在您可以在同一個地方切換 Kotlin 與 KMP 文件。
我們也更新了語言指南的目錄，並引入了新的導覽。

自上次 Kotlin 發佈以來其他值得注意的變更：

* [KMP 概覽](https://kotlinlang.org/docs/multiplatform/kmp-overview.html) —— 在單一頁面上探索 Kotlin Multiplatform 生態系統。
* [Kotlin Multiplatform 快速入門](https://kotlinlang.org/docs/multiplatform/quickstart.html) —— 了解如何使用 KMP IDE 外掛程式設定環境。
* [Compose Multiplatform 1.9.3 的新功能](https://kotlinlang.org/docs/multiplatform/whats-new-compose-190.html) —— 
  了解最新版本的亮點。
* [開始使用 Kotlin/JS](js-get-started.md) —— 使用 Kotlin/JavaScript 為瀏覽器建立 Web 應用程式。
* [類別](classes.md) —— 了解在 Kotlin 中使用類別的基礎知識與最佳實務。
* [擴充功能](extensions.md) —— 了解如何在 Kotlin 中擴充類別與介面。
* [協同程式基礎知識](coroutines-basics.md) —— 探索關鍵的協同程式概念，並學習如何建立您的第一個協同程式。
* [取消與超時](coroutines-cancellation.md) —— 了解協同程式取消如何運作，以及如何讓協同程式響應取消。
* [Kotlin/Native 程式庫](native-libraries.md) —— 了解如何產生 `klib` 程式庫產物。
* [Kotlin Notebook 概覽](kotlin-notebook-overview.md) —— 使用 Kotlin Notebook 外掛程式建立互動式筆記本文件。
* [將 Kotlin 加入 Java 專案](mixing-java-kotlin-intellij.md) —— 配置 Java 專案以同時使用 Kotlin 與 Java。
* [使用 Kotlin 測試 Java 程式碼](jvm-test-using-junit.md) —— 使用 JUnit 測試混合 Java-Kotlin 專案。
* [新的案例研究頁面](https://kotlinlang.org/case-studies/) —— 探索不同公司如何應用 Kotlin。

## 如何更新至 Kotlin 2.3.0

Kotlin 外掛程式作為隨附外掛程式散佈於 IntelliJ IDEA 與 Android Studio 中。

若要更新至新的 Kotlin 版本，[將 Kotlin 版本更改](releases.md#update-to-a-new-kotlin-version)為 2.3.0 在您的建置指令碼中。