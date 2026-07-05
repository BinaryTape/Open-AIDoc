[//]: # (title: Kotlin 1.7.0 的新功能)

<web-summary>閱讀 Kotlin 1.7.0 發佈說明，內容涵蓋新語言特性、Kotlin Multiplatform、JVM、Native、JS 的更新，以及對 Gradle 和 Maven 的建置工具支援。</web-summary>

<tldr>
   <p>IntelliJ IDEA 2021.2、2021.3 和 2022.1 已提供 Kotlin 1.7.0 的 IDE 支援。</p>
</tldr>

_[發佈日期：2022 年 6 月 9 日](releases.md#release-history)_

Kotlin 1.7.0 正式發佈。此版本揭曉了新 Kotlin/JVM K2 編譯器的 Alpha 版本，穩定了多項語言特性，並為 JVM、JS 和 Native 平台帶來了效能提升。

以下是此版本的主要更新清單：

* [新的 Kotlin K2 編譯器現已進入 Alpha 階段](#new-kotlin-k2-compiler-for-the-jvm-in-alpha)，並提供顯著的效能提升。目前僅適用於 JVM，且包括 kapt 在內的所有編譯器外掛程式均尚不支援。
* [Gradle 增量編譯的新方法](#a-new-approach-to-incremental-compilation)。增量編譯現在也支援在相依的非 Kotlin 模組內所做的變更，且與 Gradle 相容。
* 我們穩定了 [opt-in 需求註解](#stable-opt-in-requirements)、[絕對不可為 null 型別](#stable-definitely-non-nullable-types) 以及 [建構器推論](#stable-builder-inference)。
* [現在型別引數支援底線運算子](#underscore-operator-for-type-arguments)。當指定其他型別時，您可以使用它來自動推論引數的型別。
* [此版本允許透過委任實作內嵌類別的內嵌值](#allow-implementation-by-delegation-to-an-inlined-value-of-an-inline-class)。您現在可以建立輕量級包裝函式，在大多數情況下不會分配記憶體。

您也可以在此影片中找到變更的簡短概述：

<video src="https://www.youtube.com/v/54WEfLKtCGk" title="What's new in Kotlin 1.7.0"/>

> 有關 Kotlin 發佈週期的資訊，請參閱 [Kotlin 發佈程序](releases.md)。
>
{style="tip"}

## 新的 Kotlin K2 編譯器 (JVM) 進入 Alpha 階段

此 Kotlin 版本引入了新 Kotlin K2 編譯器的 **Alpha** 版本。新編譯器的目標是加速新語言特性的開發、統一 Kotlin 支援的所有平台、帶來效能提升，並為編譯器擴充套件提供 API。

我們已經發佈了關於新編譯器及其優勢的一些詳細說明：

* [通往新 Kotlin 編譯器之路](https://www.youtube.com/watch?v=iTdJJq_LyoY)
* [K2 編譯器：由上而下的觀點](https://www.youtube.com/watch?v=db19VFLZqJM)

必須指出的是，在 K2 編譯器的 Alpha 版本中，我們主要關注效能提升，且它僅適用於 JVM 專案。它不支援 Kotlin/JS、Kotlin/Native 或其他多平台專案，且包括 [kapt](kapt.md) 在內的所有編譯器外掛程式均無法與其搭配使用。

我們的基準測試在內部專案上顯示出一些卓越的結果：

| 專案 | 目前 Kotlin 編譯器效能 | 新 K2 Kotlin 編譯器效能 | 效能提升 |
|---------------|-------------------------------------|------------------------------------|-------------------|
| Kotlin        | 2.2 KLOC/s                          | 4.8 KLOC/s                         | ~ x2.2            |
| YouTrack      | 1.8 KLOC/s                          | 4.2 KLOC/s                         | ~ x2.3            |
| IntelliJ IDEA | 1.8 KLOC/s                          | 3.9 KLOC/s                         | ~ x2.2            |
| Space         | 1.2 KLOC/s                          | 2.8 KLOC/s                         | ~ x2.3            |

> KLOC/s 效能數字代表編譯器每秒處理的程式碼行數（以千行為單位）。
>
> {style="tip"}

您可以檢查 JVM 專案的效能提升，並將其與舊編譯器的結果進行比較。要啟用 Kotlin K2 編譯器，請使用以下編譯器選項：

```bash
-Xuse-k2
```

此外，K2 編譯器 [包含許多錯誤修正](https://youtrack.jetbrains.com/issues/KT?q=tag:%20FIR-preview-qa%20%23Resolved)。請注意，即使此清單中標註為 **State: Open** 的問題，實際上在 K2 中也已修復。

接下來的 Kotlin 版本將提升 K2 編譯器的穩定性並提供更多功能，敬請期待！

如果您在使用 Kotlin K2 編譯器時遇到任何效能問題，請 [回報至我們的問題追蹤器](https://kotl.in/issue)。

## 語言

Kotlin 1.7.0 引入了對透過委任實作的支援，以及用於型別引數的新底線運算子。它還穩定了先前版本中作為預覽引入的幾項語言特性：

* [透過委任實作內嵌類別的內嵌值](#allow-implementation-by-delegation-to-an-inlined-value-of-an-inline-class)
* [型別引數的底線運算子](#underscore-operator-for-type-arguments)
* [穩定版建構器推論](#stable-builder-inference)
* [穩定版 opt-in 需求](#stable-opt-in-requirements)
* [穩定版絕對不可為 null 型別](#stable-definitely-non-nullable-types)

### 允許透過委任實作內嵌類別的內嵌值

如果您想為某個值或類別執行個體建立輕量級包裝函式，則必須手動實作所有介面方法。透過委任實作解決了這個問題，但在 1.7.0 之前它不支援內嵌類別。此限制現已移除，因此您現在可以建立輕量級包裝函式，在大多數情況下不會分配記憶體。

```kotlin
interface Bar {
    fun foo() = "foo"
}

@JvmInline
value class BarWrapper(val bar: Bar): Bar by bar

fun main() {
    val bw = BarWrapper(object: Bar {})
    println(bw.foo())
}
```

### 型別引數的底線運算子

Kotlin 1.7.0 為型別引數引入了底線運算子 `_`。當指定其他型別時，您可以使用它來自動推論型別引數：

```kotlin
abstract class SomeClass<T> {
    abstract fun execute(): T
}

class SomeImplementation : SomeClass<String>() {
    override fun execute(): String = "Test"
}

class OtherImplementation : SomeClass<Int>() {
    override fun execute(): Int = 42
}

object Runner {
    inline fun <reified S: SomeClass<T>, T> run(): T {
        return S::class.java.getDeclaredConstructor().newInstance().execute()
    }
}

fun main() {
    // T 被推論為 String，因為 SomeImplementation 衍生自 SomeClass<String>
    val s = Runner.run<SomeImplementation, _>()
    assert(s == "Test")

    // T 被推論為 Int，因為 OtherImplementation 衍生自 SomeClass<Int>
    val n = Runner.run<OtherImplementation, _>()
    assert(n == 42)
}
```

> 您可以在變數清單中的任何位置使用底線運算子來推論型別引數。
>
{style="note"}

### 穩定版建構器推論

建構器推論是一種特殊的型別推論，在呼叫泛型建構器函式時非常有用。它透過使用其 Lambda 引數內其他呼叫的型別資訊，來協助編譯器推論該呼叫的型別引數。

從 1.7.0 開始，如果常規型別推論無法在不指定 `-Xenable-builder-inference` 編譯器選項（該選項於 [1.6.0 中引入](whatsnew16.md#changes-to-builder-inference)）的情況下獲得足夠的型別資訊，則會自動啟用建構器推論。

[了解如何撰寫自訂泛型建構器](using-builders-with-builder-inference.md)。

### 穩定版 opt-in 需求

[Opt-in 需求](opt-in-requirements.md) 現在已進入 [穩定版](components-stability.md)，不再需要額外的編譯器配置。

在 1.7.0 之前，opt-in 功能本身需要引數 `-opt-in=kotlin.RequiresOptIn` 以避免警告。現在不再需要此引數；但是，您仍可以使用編譯器引數 `-opt-in` 來為其他註解或 [模組](opt-in-requirements.md#opt-in-a-module) 啟用 opt-in。

### 穩定版絕對不可為 null 型別

在 Kotlin 1.7.0 中，絕對不可為 null 型別已提升為 [穩定版](components-stability.md)。它們在擴充泛型 Java 類別和介面時提供了更好的互通性。

您可以使用新語法 `T & Any` 在使用處將泛型型別參數標記為絕對不可為 null。該語法形式源自 [交集型別](https://en.wikipedia.org/wiki/Intersection_type) 的表示法，目前僅限於 `&` 左側為具有可為 null 上限的型別參數，右側為不可為 null 的 `Any`：

```kotlin
fun <T> elvisLike(x: T, y: T & Any): T & Any = x ?: y

fun main() {
    // OK
    elvisLike<String>("", "").length
    // 錯誤：'null' 不能是不可為 null 型別的值
    elvisLike<String>("", null).length

    // OK
    elvisLike<String?>(null, "").length
    // 錯誤：'null' 不能是不可為 null 型別的值
    elvisLike<String?>(null, null).length
}
```

在 [此 KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/definitely-non-nullable-types.md) 中了解更多關於絕對不可為 null 型別的資訊。

## Kotlin/JVM

此版本為 Kotlin/JVM 編譯器帶來了效能提升和新的編譯器選項。此外，指向函數式介面建構函式的可呼叫參照已成為穩定版。請注意，自 1.7.0 起，Kotlin/JVM 編譯的預設目標版本為 `1.8`。

* [編譯器效能最佳化](#compiler-performance-optimizations)
* [新編譯器選項 `-Xjdk-release`](#new-compiler-option-xjdk-release)
* [穩定版指向函數式介面建構函式的可呼叫參照](#stable-callable-references-to-functional-interface-constructors)
* [移除了 JVM 目標版本 1.6](#removed-jvm-target-version-1-6)

### 編譯器效能最佳化

Kotlin 1.7.0 引入了 Kotlin/JVM 編譯器的效能提升。根據我們的基準測試，與 Kotlin 1.6.0 相比，編譯時間 [平均減少了 10%](https://youtrack.jetbrains.com/issue/KT-48233/Switching-to-JVM-IR-backend-increases-compilation-time-by-more-t#focus=Comments-27-6114542.0-0)。大量使用內嵌函式的專案，例如 [使用 `kotlinx.html` 的專案](https://youtrack.jetbrains.com/issue/KT-51416/Compilation-of-kotlinx-html-DSL-should-still-be-faster)，由於位元組碼後處理的改進，編譯速度將會更快。

### 新編譯器選項：-Xjdk-release

Kotlin 1.7.0 提供了一個新的編譯器選項 `-Xjdk-release`。此選項與 [javac 的命令列 `--release` 選項](http://openjdk.java.net/jeps/247) 類似。`-Xjdk-release` 選項控制目標位元組碼版本，並將 classpath 中 JDK 的 API 限制為指定的 Java 版本。例如，`kotlinc -Xjdk-release=1.8` 將不允許參照 `java.lang.Module`，即使依賴項中的 JDK 版本為 9 或更高。

> 此選項 [不保證](https://youtrack.jetbrains.com/issue/KT-29974) 對每個 JDK 發行版都有效。
>
{style="note"}

請在 [此 YouTrack 票證](https://youtrack.jetbrains.com/issue/KT-29974/Add-a-compiler-option-Xjdk-release-similar-to-javac-s-release-to) 上留下您的回饋。

### 穩定版指向函數式介面建構函式的可呼叫參照

[可呼叫參照](reflection.md#callable-references) 指向函數式介面建構函式現在已進入 [穩定版](components-stability.md)。了解如何使用可呼叫參照從具有建構函式函式的介面 [遷移](fun-interfaces.md#migration-from-an-interface-with-constructor-function-to-a-functional-interface) 到函數式介面。

請在 [YouTrack](https://youtrack.jetbrains.com/newissue?project=kt) 中回報您發現的任何問題。

### 移除了 JVM 目標版本 1.6

Kotlin/JVM 編譯的預設目標版本為 `1.8`。`1.6` 目標已移除。

請遷移至 JVM 目標 1.8 或更高版本。了解如何更新以下環境的 JVM 目標版本：

* [Gradle](gradle-compiler-options.md#attributes-specific-to-jvm)
* [Maven](maven-kotlin-compiler.md#attributes-specific-to-jvm)
* [命令列編譯器](compiler-reference.md#jvm-target-version)

## Kotlin/Native

Kotlin 1.7.0 包含對 Objective-C 和 Swift 互通性的變更，並穩定了先前版本中引入的功能。它還為新記憶體管理員帶來了效能提升以及其他更新：

* [新記憶體管理員的效能提升](#performance-improvements-for-the-new-memory-manager)
* [與 JVM 和 JS IR 後端統一的編譯器外掛程式 ABI](#unified-compiler-plugin-abi-with-jvm-and-js-ir-backends)
* [支援獨立的 Android 可執行檔](#support-for-standalone-android-executables)
* [與 Swift async/await 的互通性：回傳 Void 而非 KotlinUnit](#interop-with-swift-async-await-returning-void-instead-of-kotlinunit)
* [禁止透過 Objective-C 橋接傳遞未宣告的例外](#prohibited-undeclared-exceptions-through-objective-c-bridges)
* [改進的 CocoaPods 整合](#improved-cocoapods-integration)
* [覆寫 Kotlin/Native 編譯器下載 URL](#overriding-the-kotlin-native-compiler-download-url)

### 新記憶體管理員的效能提升

> 新的 Kotlin/Native 記憶體管理員處於 [Alpha](components-stability.md) 階段。
> 未來可能會發生不相容的變更並需要手動遷移。
> 我們歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-48525) 中提供回饋。
>
{style="note"}

新記憶體管理員仍處於 Alpha 階段，但正朝向 [穩定版](components-stability.md) 邁進。此版本為新記憶體管理員提供了顯著的效能提升，特別是在垃圾回收 (GC) 方面。特別是 [1.6.20 中引入](whatsnew1620.md) 的清除 (sweep) 階段並行實作，現在已預設啟用。這有助於減少應用程式因 GC 而暫停的時間。新的 GC 排程器在選擇 GC 頻率方面表現更好，尤其是對於較大的堆積 (heap)。

此外，我們專門最佳化了偵錯二進位檔，確保在記憶體管理員的實作程式碼中使用適當的最佳化等級和連結時最佳化。這幫助我們在基準測試中將偵錯二進位檔的執行時間縮短了約 30%。

請嘗試在您的專案中使用新的記憶體管理員，看看它的運作情況，並在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-48525) 中與我們分享您的回饋。

### 與 JVM 和 JS IR 後端統一的編譯器外掛程式 ABI

從 Kotlin 1.7.0 開始， Kotlin Multiplatform Gradle 外掛程式預設為 Kotlin/Native 使用可嵌入的編譯器 jar。此 [功能在 1.6.0 中宣佈](whatsnew16.md#unified-compiler-plugin-abi-with-jvm-and-js-ir-backends) 為實驗性功能，現在已成為穩定版並可供使用。

這項改進對程式庫作者非常有用，因為它改進了編譯器外掛程式的開發體驗。在此版本之前，您必須為 Kotlin/Native 提供單獨的構件，但現在您可以為 Native 和其他受支援的平台使用相同的編譯器外掛程式構件。

> 此功能可能需要外掛程式開發人員對其現有外掛程式執行遷移步驟。
>
> 了解如何在 [此 YouTrack 問題](https://youtrack.jetbrains.com/issue/KT-48595) 中為更新準備您的外掛程式。
>
{style="warning"}

### 支援獨立的 Android 可執行檔

Kotlin 1.7.0 全面支援為 Android Native 目標產生標準可執行檔。此功能在 [1.6.20 中引入](whatsnew1620.md#support-for-standalone-android-executables)，現在已預設啟用。

如果您想回復到先前 Kotlin/Native 產生共享程式庫的行為，請使用以下設定：

```kotlin
binaryOptions["androidProgramType"] = "nativeActivity"
```

### 與 Swift async/await 的互通性：回傳 Void 而非 KotlinUnit

Kotlin `suspend` 函式在 Swift 中現在回傳 `Void` 型別而非 `KotlinUnit`。這是與 Swift 的 `async`/`await` 改進互通性的結果。此功能在 [1.6.20 中引入](whatsnew1620.md#interop-with-swift-async-await-returning-void-instead-of-kotlinunit)，且此版本預設啟用了此行為。

您不再需要使用 `kotlin.native.binary.unitSuspendFunctionObjCExport=proper` 屬性來為此類函式回傳正確的型別。

### 禁止透過 Objective-C 橋接傳遞未宣告的例外

當您從 Swift/Objective-C 程式碼呼叫 Kotlin 程式碼（反之亦然）且該程式碼拋出例外時，除非您特別允許在具有正確轉換的語言之間轉發例外（例如，使用 `@Throws` 註解），否則該例外應由發生例外的程式碼處理。

先前，Kotlin 有另一種非預期的行為，即在某些情況下，未宣告的例外可能會從一種語言「洩漏」到另一種語言。Kotlin 1.7.0 修正了該問題，現在此類情況會導致程式終止。

因此，例如，如果您在 Kotlin 中有一個 `{ throw Exception() }` 的 Lambda 並從 Swift 呼叫它，在 Kotlin 1.7.0 中，一旦例外到達 Swift 程式碼，程式就會終止。在先前的 Kotlin 版本中，此類例外可能會洩漏到 Swift 程式碼中。

`@Throws` 註解繼續像以前一樣運作。

### 改進的 CocoaPods 整合

從 Kotlin 1.7.0 開始，如果您想在專案中整合 CocoaPods，不再需要安裝 `cocoapods-generate` 外掛程式。

先前，您需要同時安裝 CocoaPods 相依管理器和 `cocoapods-generate` 外掛程式才能使用 CocoaPods，例如，在 Kotlin Multiplatform Mobile 專案中處理 [iOS 相依性](https://kotlinlang.org/docs/multiplatform/multiplatform-ios-dependencies.html#with-cocoapods)。

現在設定 CocoaPods 整合變得更加容易，且我們解決了在 Ruby 3 及更高版本上無法安裝 `cocoapods-generate` 的問題。現在也支援在 Apple M1 上運作更好的最新 Ruby 版本。

了解如何設定 [初始 CocoaPods 整合](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html#set-up-an-environment-to-work-with-cocoapods)。

### 覆寫 Kotlin/Native 編譯器下載 URL

從 Kotlin 1.7.0 開始，您可以自訂 Kotlin/Native 編譯器的下載 URL。當 CI 上禁止外部連結時，這非常有用。

要覆寫預設的基礎 URL `https://download.jetbrains.com/kotlin/native/builds`，請使用以下 Gradle 屬性：

```none
kotlin.native.distribution.baseDownloadUrl=https://example.com
```

> 下載程式會將原生版本和目標作業系統附加到此基礎 URL，以確保下載實際的編譯器發行版。
>
{style="note"}

## Kotlin/JS

Kotlin/JS 的 [JS IR 編譯器後端](js-ir-compiler.md) 正在接受進一步改進，並隨附其他更新，可提升您的開發體驗：

* [新 IR 後端的效能提升](#performance-improvements-for-the-new-ir-backend)
* [使用 IR 時縮減成員名稱 (Minification)](#minification-for-member-names-when-using-ir)
* [透過 IR 後端中的填充功能 (Polyfills) 支援舊版瀏覽器](#support-for-older-browsers-via-polyfills-in-the-ir-backend)
* [從 js 運算式動態載入 JavaScript 模組](#dynamically-load-javascript-modules-from-js-expressions)
* [為 JavaScript 測試執行器指定環境變數](#specify-environment-variables-for-javascript-test-runners)

### 新 IR 後端的效能提升

此版本包含一些重大更新，應能改善您的開發體驗：

* Kotlin/JS 的增量編譯效能顯著提升。建置 JS 專案所需的時間更短。現在增量重建在許多情況下應與舊版後端大致相當。
* 由於我們顯著減小了最終構件的大小，Kotlin/JS 最終產物 (bundle) 需要的空間更少。對於某些大型專案，我們測量到生產環境產物大小與舊版後端相比減少了多達 20%。
* 介面的型別檢查效能提升了幾個數量級。
* Kotlin 產生更高品質的 JS 程式碼。

### 使用 IR 時縮減成員名稱 (Minification)

Kotlin/JS IR 編譯器現在使用其關於 Kotlin 類別和函式關係的內部資訊來應用更有效的名稱縮減，縮短函式、屬性和類別的名稱。這縮小了生成的產物應用程式體積。

當您在生產模式下建置 Kotlin/JS 應用程式時，會自動應用這種類型的縮減，且預設為啟用。要停用成員名稱縮減，請使用 `-Xir-minimized-member-names` 編譯器旗標：

```kotlin
kotlin {
    js(IR) {
        compilations.all {
            compileKotlinTask.kotlinOptions.freeCompilerArgs += listOf("-Xir-minimized-member-names=false")
        }
    }
}
```

### 透過 IR 後端中的填充功能 (Polyfills) 支援舊版瀏覽器

Kotlin/JS 的 IR 編譯器後端現在包含與舊版後端相同的填充功能 (polyfills)。這允許使用新編譯器編譯的程式碼在不支援 Kotlin 標準程式庫所使用的 ES2015 所有方法的舊版瀏覽器中執行。只有專案實際使用的那些填充功能才會包含在最終產物中，這將其對產物大小的潛在影響降至最低。

使用 IR 編譯器時，此功能預設啟用，您無需配置它。

### 從 js 運算式動態載入 JavaScript 模組

在處理 JavaScript 模組時，大多數應用程式使用靜態匯入，其用法已在 [JavaScript 模組整合](js-modules.md) 中涵蓋。然而，Kotlin/JS 缺少一種在應用程式執行時動態載入 JavaScript 模組的機制。

從 Kotlin 1.7.0 開始， `import` 陳述式從 JavaScript 開始在 `js` 區塊中支援，允許您在執行時將套件動態帶入您的應用程式：

```kotlin
val myPackage = js("import('my-package')")
```

### 為 JavaScript 測試執行器指定環境變數

要調整 Node.js 套件解析或將外部資訊傳遞給 Node.js 測試，您現在可以指定 JavaScript 測試執行器使用的環境變數。要定義環境變數，請在建置指令碼的 `testTask` 區塊內使用帶有鍵值對的 `environment()` 函式：

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

## 標準程式庫

在 Kotlin 1.7.0 中，標準程式庫經歷了一系列的變更和改進。它們引入了新特性，穩定了實驗性特性，並統一了對 Native、JS 和 JVM 的具名擷取群組支援：

* [min() 與 max() 集合函式傳回非 null 值](#min-and-max-collection-functions-return-as-non-nullable)
* [特定索引處的正規表示式比對](#regular-expression-matching-at-specific-indices)
* [對先前語言和 API 版本的擴展支援](#extended-support-for-previous-language-and-api-versions)
* [透過反射存取註解](#access-to-annotations-via-reflection)
* [穩定版深層遞迴函式](#stable-deep-recursive-functions)
* [基於內嵌類別的時間標記（用於預設時間源）](#time-marks-based-on-inline-classes-for-default-time-source)
* [用於 Java Optional 的新實驗性擴充函式](#new-experimental-extension-functions-for-java-optionals)
* [支援 JS 和 Native 中的具名擷取群組](#support-for-named-capturing-groups-in-js-and-native)

### min() 與 max() 集合函式傳回非 null 值

在 [Kotlin 1.4.0](whatsnew14.md) 中，我們將 `min()` 和 `max()` 集合函式重新命名為 `minOrNull()` 和 `maxOrNull()`。這些新名稱更好地反映了它們的行為——如果接收端集合為空，則傳回 null。這也有助於使函式的行為與整個 Kotlin 集合 API 中使用的命名慣例保持一致。

對於 `minBy()`、`maxBy()`、`minWith()` 和 `maxWith()` 也是如此，它們都在 Kotlin 1.4.0 中獲得了 *OrNull() 的同義詞。受此變更影響的舊函式已逐漸被棄用。

Kotlin 1.7.0 重新引入了原始函式名稱，但改為非 null 傳回型別。新的 `min()`、`max()`、`minBy()`、`maxBy()`、`minWith()` 和 `maxWith()` 函式現在嚴格回傳集合元素，否則拋出例外。

```kotlin
fun main() {
    val numbers = listOf<Int>()
    println(numbers.maxOrNull()) // "null"
    println(numbers.max()) // "Exception in... Collection is empty."
}
```

### 特定索引處的正規表示式比對

[1.5.30 中引入](whatsnew1530.md#matching-with-regex-at-a-particular-position) 的 `Regex.matchAt()` 和 `Regex.matchesAt()` 函式現在已成為穩定版。它們提供了一種方法來檢查正規表示式是否在 `String` 或 `CharSequence` 的特定位置完全匹配。

`matchesAt()` 檢查比對並回傳布林值結果：

```kotlin
fun main() {
    val releaseText = "Kotlin 1.7.0 is on its way!"
    // 正規表示式：一個數字、點、一個數字、點、一個或多個數字
    val versionRegex = "\\d[.]\\d[.]\\d+".toRegex()

    println(versionRegex.matchesAt(releaseText, 0)) // "false"
    println(versionRegex.matchesAt(releaseText, 7)) // "true"
}
```

`matchAt()` 如果找到比對則回傳比對結果，否則回傳 `null`：

```kotlin
fun main() {
    val releaseText = "Kotlin 1.7.0 is on its way!"
    val versionRegex = "\\d[.]\\d[.]\\d+".toRegex()

    println(versionRegex.matchAt(releaseText, 0)) // "null"
    println(versionRegex.matchAt(releaseText, 7)?.value) // "1.7.0"
}
```

我們歡迎您在 [此 YouTrack 問題](https://youtrack.jetbrains.com/issue/KT-34021) 上提供回饋。

### 對先前語言和 API 版本的擴展支援

為了支援開發旨在用於各種先前 Kotlin 版本的程式庫作者，並應對 Kotlin 主要版本發佈頻率的增加，我們擴展了對先前語言和 API 版本的支援。

從 Kotlin 1.7.0 開始，我們支援三個先前的語言和 API 版本，而不是兩個。這意味著 Kotlin 1.7.0 支援開發目標版本低至 1.4.0 的程式庫。有關回溯相容性的更多資訊，請參閱 [相容性選項](kotlin-evolution-principles.md#compatibility-options)。

### 透過反射存取註解

首次在 [1.6.0 中引入](whatsnew16.md#repeatable-annotations-with-runtime-retention-for-1-8-jvm-target) 的 [`KAnnotatedElement.findAnnotations()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.full/find-annotations.html) 擴充函式現在已進入 [穩定版](components-stability.md)。此 [反射](reflection.md) 函式回傳元素上指定型別的所有註解，包括個別套用的註解和重複註解。

```kotlin
@Repeatable
annotation class Tag(val name: String)

@Tag("First Tag")
@Tag("Second Tag")
fun taggedFunction() {
    println("I'm a tagged function!")
}

fun main() {
    val x = ::taggedFunction
    val foo = x as KAnnotatedElement
    println(foo.findAnnotations<Tag>()) // [@Tag(name=First Tag), @Tag(name=Second Tag)]
}
```

### 穩定版深層遞迴函式

深層遞迴函式自 [Kotlin 1.4.0](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-rc-debugging-coroutines/#Defining_deep_recursive_functions_using_coroutines) 起作為實驗性功能提供，現在它們在 Kotlin 1.7.0 中已進入 [穩定版](components-stability.md)。使用 `DeepRecursiveFunction`，您可以定義一個將其堆疊保留在堆積 (heap) 上而非使用實際呼叫堆疊的函式。這允許您執行非常深層的遞迴計算。要呼叫深層遞迴函式，請 `invoke` 它。

在此範例中，使用深層遞迴函式遞迴計算二元樹的深度。即使此範例函式遞迴呼叫自身 100,000 次，也不會拋出 `StackOverflowError`：

```kotlin
class Tree(val left: Tree?, val right: Tree?)

val calculateDepth = DeepRecursiveFunction<Tree?, Int> { t ->
    if (t == null) 0 else maxOf(
        callRecursive(t.left),
        callRecursive(t.right)
    ) + 1
}

fun main() {
    // 產生一個深度為 100_000 的樹
    val deepTree = generateSequence(Tree(null, null)) { prev ->
        Tree(prev, null)
    }.take(100_000).last()

    println(calculateDepth(deepTree)) // 100000
}
```

當您的遞迴深度超過 1000 次呼叫時，請考慮在程式碼中使用深層遞迴函式。

### 基於內嵌類別的時間標記（用於預設時間源）

Kotlin 1.7.0 藉由將 `TimeSource.Monotonic` 回傳的時間標記更改為內嵌值類別，改進了時間測量功能的效能。這意指呼叫如 `markNow()`、`elapsedNow()`、`measureTime()` 和 `measureTimedValue()` 等函式時，不會為其 `TimeMark` 執行個體分配包裝類別。特別是在測量處於熱點路徑中的程式碼時，這有助於最大程度地減少測量對效能的影響：

```kotlin
@OptIn(ExperimentalTime::class)
fun main() {
    val mark = TimeSource.Monotonic.markNow() // 回傳的 `TimeMark` 為內嵌類別
    val elapsedDuration = mark.elapsedNow()
}
```

> 只有當獲得 `TimeMark` 的時間源靜態已知為 `TimeSource.Monotonic` 時，此最佳化才可用。
>
{style="note"}

### 用於 Java Optional 的新實驗性擴充函式

Kotlin 1.7.0 附帶了新的便捷函式，簡化了在 Java 中處理 `Optional` 類別的工作。這些新函式可用於在 JVM 上解包和轉換選用物件，並有助於使處理 Java API 更加簡潔。

`getOrNull()`、`getOrDefault()` 和 `getOrElse()` 擴充函式允許您在 `Optional` 存在時獲取其值。否則，您分別獲得 `null`、預設值或由函式回傳的值：

```kotlin
val presentOptional = Optional.of("I'm here!")

println(presentOptional.getOrNull())
// "I'm here!"

val absentOptional = Optional.empty<String>()

println(absentOptional.getOrNull())
// null
println(absentOptional.getOrDefault("Nobody here!"))
// "Nobody here!"
println(absentOptional.getOrElse {
    println("Optional was absent!")
    "Default value!"
})
// "Optional was absent!"
// "Default value!"
```

`toList()`、`toSet()` 和 `asSequence()` 擴充函式將存在的 `Optional` 值轉換為列表、集合或序列，否則回傳空集合。`toCollection()` 擴充函式將 `Optional` 值附加到已存在的目標集合中：

```kotlin
val presentOptional = Optional.of("I'm here!")
val absentOptional = Optional.empty<String>()
println(presentOptional.toList() + "," + absentOptional.toList())
// ["I'm here!"], []
println(presentOptional.toSet() + "," + absentOptional.toSet())
// ["I'm here!"], []
val myCollection = mutableListOf<String>()
absentOptional.toCollection(myCollection)
println(myCollection)
// []
presentOptional.toCollection(myCollection)
println(myCollection)
// ["I'm here!"]
val list = listOf(presentOptional, absentOptional).flatMap { it.asSequence() }
println(list)
// ["I'm here!"]
```

這些擴充函式在 Kotlin 1.7.0 中作為實驗性功能引入。您可以在 [此 KEEP](https://github.com/Kotlin/KEEP/pull/291) 中了解更多關於 `Optional` 擴充的資訊。一如既往，我們歡迎您在 [Kotlin 問題追蹤器](https://kotl.in/issue) 中提供回饋。

### 支援 JS 和 Native 中的具名擷取群組

從 Kotlin 1.7.0 開始，具名擷取群組不僅在 JVM 上受支援，在 JS 和 Native 平台上也受支援。

要為擷取群組命名，請在正規表示式中使用 (`?<name>group`) 語法。要獲取群組比對到的文字，請呼叫新引入的 [`MatchGroupCollection.get()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/get.html) 函式並傳入群組名稱。

#### 透過名稱擷取比對到的群組值

考慮這個比對城市座標的範例。要獲取正規表示式比對到的群組集合，請使用 [`groups`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-match-result/groups.html)。比較透過編號（索引）和透過名稱使用 `value` 來擷取群組內容：

```kotlin
fun main() {
    val regex = "\\b(?<city>[A-Za-z\\s]+),\\s(?<state>[A-Z]{2}):\\s(?<areaCode>[0-9]{3})\\b".toRegex()
    val input = "Coordinates: Austin, TX: 123"
    val match = regex.find(input)!!
    println(match.groups["city"]?.value) // "Austin" — 透過名稱
    println(match.groups[2]?.value) // "TX" — 透過編號
}
```

#### 具名反向參照

您現在還可以在反向參照群組時使用群組名稱。反向參照會比對與先前擷取群組比對到的相同文字。對此，請在正規表示式中使用 `\k<name>` 語法：

```kotlin
fun backRef() {
    val regex = "(?<title>\\w+), yes \\k<title>".toRegex()
    val match = regex.find("Do you copy? Sir, yes Sir!")!!
    println(match.value) // "Sir, yes Sir"
    println(match.groups["title"]?.value) // "Sir"
}
```

#### 具名群組在取代運算式中

具名群組參照可用於取代運算式。考慮 [`replace()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-regex/replace.html) 函式，它將輸入中所有指定的正規表示式出現處替換為取代運算式，以及 [`replaceFirst()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-regex/replace-first.html) 函式，它僅交換第一個比對項。

取代字串中的 `${name}` 出現處將被替換為具有指定名稱的擷取群組對應的子序列。您可以比較群組參照中透過名稱和索引進行的替換：

```kotlin
fun dateReplace() {
    val dateRegex = Regex("(?<dd>\\d{2})-(?<mm>\\d{2})-(?<yyyy>\\d{4})")
    val input = "Date of birth: 27-04-2022"
    println(dateRegex.replace(input, "\${yyyy}-\${mm}-\${dd}")) // "Date of birth: 2022-04-27" — 透過名稱
    println(dateRegex.replace(input, "\$3-\$2-\$1")) // "Date of birth: 2022-04-27" — 透過編號
}
```

## Gradle

此版本引入了新的建置報告、對 Gradle 外掛程式變體的支援、kapt 中的新統計資訊等等：

* [增量編譯的新方法](#a-new-approach-to-incremental-compilation)
* [用於追蹤編譯器效能的新建置報告](#build-reports-for-kotlin-compiler-tasks)
* [Gradle 和 Android Gradle 外掛程式最低受支援版本的變更](#bumping-minimum-supported-versions)
* [支援 Gradle 外掛程式變體](#support-for-gradle-plugin-variants)
* [Kotlin Gradle 外掛程式 API 的更新](#updates-in-the-kotlin-gradle-plugin-api)
* [可透過外掛程式 API 使用 sam-with-receiver 外掛程式](#the-sam-with-receiver-plugin-is-available-via-the-plugins-api)
* [編譯任務的變更](#changes-in-compile-tasks)
* [kapt 中每個註解處理器產生檔案的新統計資訊](#statistics-of-generated-files-by-each-annotation-processor-in-kapt)
* [棄用 kotlin.compiler.execution.strategy 系統屬性](#deprecation-of-the-kotlin-compiler-execution-strategy-system-property)
* [移除棄用的選項、方法和外掛程式](#removal-of-deprecated-options-methods-and-plugins)

### 增量編譯的新方法

> 增量編譯的新方法處於 [實驗性](components-stability.md) 階段。它隨時可能被捨棄或更改。
> 需要 opt-in（詳見下文）。我們鼓勵您僅出於評估目的使用它，我們歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 中提供回饋。
>
{style="warning"}

在 Kotlin 1.7.0 中，我們重新設計了跨模組變更的增量編譯。現在，對於在相依的非 Kotlin 模組內所做的變更也支援增量編譯，並且它與 [Gradle 建置快取](https://docs.gradle.org/current/userguide/build_cache.html) 相容。對編譯規避 (compilation avoidance) 的支援也得到了改進。

我們預計，如果您使用建置快取或經常在非 Kotlin Gradle 模組中進行更改，您將看到新方法最顯著的好處。我們在 `kotlin-gradle-plugin` 模組上對 Kotlin 專案進行的測試顯示，快取命中後的更改改進了 80% 以上。

要嘗試此新方法，請在 `gradle.properties` 中設定以下選項：

```none
kotlin.incremental.useClasspathSnapshot=true
```

> 增量編譯的新方法目前僅適用於 Gradle 建置系統中的 JVM 後端。
>
{style="note"}

在 [此部落格文章](https://blog.jetbrains.com/kotlin/2022/07/a-new-approach-to-incremental-compilation-in-kotlin/) 中了解增量編譯新方法的底層實作方式。

我們的計畫是穩定這項技術，並增加對其他後端（例如 JS）和建置系統的支援。我們歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 中回報您在此編譯方案中遇到的任何問題或異常行為。謝謝！

Kotlin 團隊非常感謝 [Ivan Gavrilovic](https://github.com/gavra0)、[Hung Nguyen](https://github.com/hungvietnguyen)、[Cédric Champeau](https://github.com/melix) 以及其他外部貢獻者的幫助。

### Kotlin 編譯任務的建置報告

> Kotlin 建置報告處於 [實驗性](components-stability.md) 階段。它們隨時可能被捨棄或更改。
> 需要 opt-in（詳見下文）。僅出於評估目的使用它們。我們歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 中對其提供回饋。
>
{style="warning"}

Kotlin 1.7.0 引入了有助於追蹤編譯器效能的建置報告。報告包含不同編譯階段的持續時間以及編譯無法進行增量的原因。

當您想調查編譯任務的問題時，建置報告非常有用，例如：

* 當 Gradle 建置耗時過長，且您想了解效能不佳的根本原因。
* 當同一個專案的編譯時間不同，有時需要幾秒鐘，有時需要幾分鐘。

要啟用建置報告，請在 `gradle.properties` 中宣告建置報告輸出的儲存位置：

```none
kotlin.build.report.output=file
```

可使用以下值（及其組合）：

* `file` 將建置報告儲存在本機檔案中。
* `build_scan` 將建置報告儲存在 [build scan](https://scans.gradle.com/) 的 `custom values` 區塊中。

  > Gradle Enterprise 外掛程式限制了自訂值的數量及其長度。在大型專案中，某些值可能會遺失。
  >
  {style="note"}

* `http` 使用 HTTP(S) 發送建置報告。POST 方法以 JSON 格式發送指標。數據可能會隨版本變更。您可以在 [Kotlin 存儲庫](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-plugin/src/common/kotlin/org/jetbrains/kotlin/gradle/report/data/GradleCompileStatisticsData.kt) 中查看目前版本的發送數據。

分析長時間編譯的建置報告可以幫助您解決兩種常見情況：

* 建置不是增量的。分析原因並修正底層問題。
* 建置是增量的，但耗時過長。嘗試重新組織原始碼檔案——拆分大檔案、將不同的類別儲存在不同的檔案中、重構大型類別、在不同的檔案中宣告頂層函式等等。

在 [此部落格文章](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/) 中了解更多關於新建置報告的資訊。

歡迎您在基礎設施中嘗試使用建置報告。如果您有任何回饋、遇到任何問題或想提出改進建議，請隨時在我們的 [問題追蹤器](https://youtrack.jetbrains.com/newIssue) 中回報。謝謝！

### 提升最低受支援版本

從 Kotlin 1.7.0 開始，最低受支援的 Gradle 版本為 6.7.1。我們必須 [提升版本](https://youtrack.jetbrains.com/issue/KT-49733/Bump-minimal-supported-Gradle-version-to-6-7-1) 以支援 [Gradle 外掛程式變體](#support-for-gradle-plugin-variants) 和新的 Gradle API。未來，得益於 Gradle 外掛程式變體特性，我們應該不需要如此頻繁地提升最低受支援版本。

此外，最低受支援的 Android Gradle 外掛程式版本現在為 3.6.4。

### 支援 Gradle 外掛程式變體

Gradle 7.0 為 Gradle 外掛程式作者引入了一項新功能——[帶有變體的外掛程式](https://docs.gradle.org/7.0/userguide/implementing_gradle_plugins.html#plugin-with-variants)。此功能使得在保持對 7.1 以下 Gradle 版本相容性的同時，更容易增加對新 Gradle 特性的支援。了解更多關於 [Gradle 中的變體選擇](https://docs.gradle.org/current/userguide/variant_model.html)。

藉由 Gradle 外掛程式變體，我們可以為不同的 Gradle 版本提供不同的 Kotlin Gradle 外掛程式變體。目標是在 `main` 變體中支援基礎 Kotlin 編譯，該變體對應於最舊的受支援 Gradle 版本。每個變體將具有對應發佈版本中 Gradle 特性的實作。最新的變體將支援最廣泛的 Gradle 特性集。透過這種方法，我們可以擴展對具有有限功能的舊版 Gradle 版本的支援。

目前，Kotlin Gradle 外掛程式僅有兩個變體：

* `main` 用於 Gradle 版本 6.7.1–6.9.3
* `gradle70` 用於 Gradle 版本 7.0 及更高版本

在未來的 Kotlin 版本中，我們可能會增加更多變體。

要檢查您的組建使用的是哪個變體，請啟用 [`--info` 記錄層級](https://docs.gradle.org/current/userguide/logging.html#sec:choosing_a_log_level) 並在輸出中尋找以 `Using Kotlin Gradle plugin` 開頭的字串，例如 `Using Kotlin Gradle plugin main variant`。

> 以下是 Gradle 中變體選擇的一些已知問題的解決方案：
> * [pluginManagement 中的 ResolutionStrategy 對於具有多變體的外掛程式無效](https://github.com/gradle/gradle/issues/20545)
> * [當外掛程式作為 `buildSrc` 共通相依性加入時，外掛程式變體會被忽略](https://github.com/gradle/gradle/issues/20847)
>
{style="note"}

請在 [此 YouTrack 票證](https://youtrack.jetbrains.com/issue/KT-49227/Support-Gradle-plugins-variants) 上留下您的回饋。

### Kotlin Gradle 外掛程式 API 的更新

Kotlin Gradle 外掛程式 API 構件經歷了多項改進：

* 為 Kotlin/JVM 和 Kotlin/kapt 任務提供了新的介面，具有使用者可配置的輸入。
* 引入了新的 `KotlinBasePlugin` 介面，所有 Kotlin 外掛程式都繼承自該介面。當您想在套用任何 Kotlin Gradle 外掛程式（JVM、JS、Multiplatform、Native 及其他平台）時觸發某些配置操作時，請使用此介面：

  ```kotlin
  project.plugins.withType<org.jetbrains.kotlin.gradle.plugin.KotlinBasePlugin>() {
      // 在此配置您的操作
  }
  ```
  您可以在 [此 YouTrack 票證](https://youtrack.jetbrains.com/issue/KT-48008/Consider-offering-a-KotlinBasePlugin) 中留下關於 `KotlinBasePlugin` 的回饋。

* 我們為 Android Gradle 外掛程式在其內部配置 Kotlin 編譯奠定了基礎，這意指您將不需要在組建中加入 Kotlin Android Gradle 外掛程式。請關注 [Android Gradle 外掛程式發佈公告](https://developer.android.com/studio/releases/gradle-plugin) 以了解新增的支援並嘗試一下！

### 可透過外掛程式 API 使用 sam-with-receiver 外掛程式

[sam-with-receiver 編譯器外掛程式](sam-with-receiver-plugin.md) 現在可透過 [Gradle 外掛程式 DSL](https://docs.gradle.org/current/userguide/plugins.html#sec:plugins_block) 取得：

```kotlin
plugins {
    id("org.jetbrains.kotlin.plugin.sam.with.receiver") version "$kotlin_version"
}
```

### 編譯任務的變更

編譯任務在此版本中經歷了許多變更：

* Kotlin 編譯任務不再繼承 Gradle 的 `AbstractCompile` 任務。它們僅繼承 `DefaultTask`。
* `AbstractCompile` 任務具有 `sourceCompatibility` 和 `targetCompatibility` 輸入。由於不再繼承 `AbstractCompile` 任務，這些輸入在 Kotlin 使用者的指令碼中不再可用。
* `SourceTask.stableSources` 輸入不再可用，您應使用 `sources` 輸入。`setSource(...)` 方法仍可用。
* 所有編譯任務現在都使用 `libraries` 輸入來獲取編譯所需的程式庫清單。`KotlinCompile` 任務仍具有棄用的 Kotlin 屬性 `classpath`，該屬性將在未來版本中移除。
* 編譯任務仍實作 `PatternFilterable` 介面，這允許過濾 Kotlin 原始碼。`sourceFilesExtensions` 輸入已被移除，改為使用 `PatternFilterable` 方法。
* 棄用的 `Gradle destinationDir: File` 輸出已被替換為 `destinationDirectory: DirectoryProperty` 輸出。
* Kotlin/Native 的 `AbstractNativeCompile` 任務現在繼承自 `AbstractKotlinCompileTool` 基底類別。這是將 Kotlin/Native 建置工具整合到所有其他工具中的初步步驟。

請在 [此 YouTrack 票證](https://youtrack.jetbrains.com/issue/KT-32805) 中留下您的回饋。

### kapt 中每個註解處理器產生檔案的統計資訊

`kotlin-kapt` Gradle 外掛程式已經 [回報每個處理器的效能統計資訊](https://github.com/JetBrains/kotlin/pull/4280)。從 Kotlin 1.7.0 開始，它還可以回報每個註解處理器產生的檔案數量的統計資訊。

這對於追蹤組建中是否存在未使用的註解處理器非常有用。您可以使用產生的報告來查找觸發不必要註解處理器的模組，並更新模組以防止這種情況。

透過以下兩個步驟啟用統計資訊：

* 在您的 `build.gradle.kts` 中將 `showProcessorStats` 旗標設定為 `true`：

  ```kotlin
  kapt {
      showProcessorStats = true
  }
  ```

* 在您的 `gradle.properties` 中將 `kapt.verbose` Gradle 屬性設定為 `true`：
  
  ```none
  kapt.verbose=true
  ```

> 您也可以透過 [命令列選項 `verbose`](kapt.md#use-in-cli) 啟用詳細輸出。
>
{style="note"}

統計資訊將出現在 `info` 等級的記錄中。您會看到 `Annotation processor stats:` 行，接著是每個註解處理器執行時間的統計資訊。在這些行之後，將會有 `Generated files report:` 行，接著是每個註解處理器產生檔案數量的統計資訊。例如：

```text
[INFO] Annotation processor stats:
[INFO] org.mapstruct.ap.MappingProcessor: total: 290 ms, init: 1 ms, 3 round(s): 289 ms, 0 ms, 0 ms
[INFO] Generated files report:
[INFO] org.mapstruct.ap.MappingProcessor: total sources: 2, sources per round: 2, 0, 0
```

請在 [此 YouTrack 票證](https://youtrack.jetbrains.com/issue/KT-51132/KAPT-Support-reporting-the-number-of-generated-files-by-each-ann) 上留下您的回饋。

### 棄用 kotlin.compiler.execution.strategy 系統屬性

Kotlin 1.6.20 [引入了用於定義 Kotlin 編譯器執行策略的新屬性](whatsnew1620.md#properties-for-defining-kotlin-compiler-execution-strategy)。在 Kotlin 1.7.0 中，舊的系統屬性 `kotlin.compiler.execution.strategy` 已開始棄用週期，轉而使用新屬性。

使用 `kotlin.compiler.execution.strategy` 系統屬性時，您將收到警告。此屬性將在未來版本中刪除。要保留舊行為，請將系統屬性替換為同名的 Gradle 屬性。例如，您可以在 `gradle.properties` 中執行此操作：

```none
kotlin.compiler.execution.strategy=out-of-process
```

您也可以使用編譯任務屬性 `compilerExecutionStrategy`。在 [編譯器執行策略頁面](compiler-execution-strategy.md) 上了解更多相關資訊。

### 移除棄用的選項、方法和外掛程式

#### 移除 useExperimentalAnnotation 方法

在 Kotlin 1.7.0 中，我們完成了 `useExperimentalAnnotation` Gradle 方法的棄用週期。請改用 `optIn()` 以在模組中啟用某個 API 的 opt-in。

例如，如果您的 Gradle 模組是多平台的：

```kotlin
sourceSets {
    all {
        languageSettings.optIn("org.mylibrary.OptInAnnotation")
    }
}
```

了解更多關於 Kotlin 中的 [opt-in 需求](opt-in-requirements.md) 資訊。

#### 移除棄用的編譯器選項

我們已經完成了幾個編譯器選項的棄用週期：

* `kotlinOptions.jdkHome` 編譯器選項在 1.5.30 中被棄用，並在此版本中被移除。如果 Gradle 組建包含此選項，現在會失敗。我們鼓勵您使用 [Java 工具鏈](whatsnew1530.md#support-for-java-toolchains)，該功能自 Kotlin 1.5.30 起受支援。
* 棄用的 `noStdlib` 編譯器選項也已被移除。Gradle 外掛程式使用 `kotlin.stdlib.default.dependency=true` 屬性來控制 Kotlin 標準程式庫是否存在。

> 編譯器引數 `-jdkHome` 和 `-no-stdlib` 仍可用。
>
{style="note"}

#### 移除棄用的外掛程式

在 Kotlin 1.4.0 中，`kotlin2js` 和 `kotlin-dce-plugin` 外掛程式被棄用，並在此版本中被移除。請使用新的 `org.jetbrains.kotlin.js` 外掛程式來代替 `kotlin2js`。無效程式碼消除 (DCE) 即可運作，當 Kotlin/JS Gradle 外掛程式配置正確時。

精確地說，在 Kotlin 1.6.0 中，我們將 `KotlinGradleSubplugin` 類別的棄用等級更改為 `ERROR`。開發人員使用此類別來撰寫編譯器外掛程式。在此版本中，[此類別已被移除](https://youtrack.jetbrains.com/issue/KT-48831/)。請改用 `KotlinCompilerPluginSupportPlugin` 類別。

> 最佳實務是在整個專案中使用 1.7.0 或更高版本的 Kotlin 外掛程式。
>
{style="tip"}

#### 移除棄用的協同程式 DSL 選項和屬性

我們移除了棄用的 `kotlin.experimental.coroutines` Gradle DSL 選項以及在 `gradle.properties` 中使用的 `kotlin.coroutines` 屬性。現在您可以直接使用 _[暫停函式](coroutines-basics.md)_ 或在組建指令碼中 [加入 `kotlinx.coroutines` 相依性](gradle-configure-project.md#set-a-dependency-on-a-kotlinx-library) 到您的組建指令碼中。

在 [協同程式指南](coroutines-guide.md) 中了解更多關於協同程式的資訊。

#### 移除工具鏈擴充方法中的型別轉換

在 Kotlin 1.7.0 之前，使用 Kotlin DSL 配置 Gradle 工具鏈時，必須將其轉換為 `JavaToolchainSpec` 類別：

```kotlin
kotlin {
    jvmToolchain {
        (this as JavaToolchainSpec).languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
    }
}
```

現在，您可以省略 `(this as JavaToolchainSpec)` 部分：

```kotlin
kotlin {
    jvmToolchain {
        languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
    }
}
```

## 遷移至 Kotlin 1.7.0

### 安裝 Kotlin 1.7.0

IntelliJ IDEA 2022.1 和 Android Studio Chipmunk (212) 會自動建議將 Kotlin 外掛程式更新至 1.7.0。

> 對於 IntelliJ IDEA 2022.2 以及 Android Studio Dolphin (213) 或 Android Studio Electric Eel (221)，Kotlin 外掛程式 1.7.0 將隨即將推出的 IntelliJ IDEA 和 Android Studio 更新一併提供。
> 
{style="note"}

新的命令列編譯器可在 [GitHub 發佈頁面](https://github.com/JetBrains/kotlin/releases/tag/v1.7.0) 下載。

### 遷移現有專案或使用 Kotlin 1.7.0 開始新專案

* 要將現有專案遷移至 Kotlin 1.7.0，請將 Kotlin 版本更改為 `1.7.0` 並重新匯入您的 Gradle 或 Maven 專案。[了解如何更新至 Kotlin 1.7.0](releases.md#update-to-a-new-kotlin-version)。

* 要使用 Kotlin 1.7.0 開始新專案，請更新 Kotlin 外掛程式並從 **File** | **New** | **Project** 執行專案精靈。

### Kotlin 1.7.0 相容性指南

Kotlin 1.7.0 是一個 [特性版本](kotlin-evolution-principles.md#language-and-tooling-releases)，因此可能會帶來與您為早期版本的語言編寫的程式碼不相容的變更。在 [Kotlin 1.7.0 相容性指南](compatibility-guide-17.md) 中查找此類變更的詳細清單。