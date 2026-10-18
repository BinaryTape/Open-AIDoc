[//]: # (title: Kotlin 1.7.0 新功能)

<web-summary>閱讀 Kotlin 1.7.0 版本資訊，涵蓋全新語言特性、Kotlin Multiplatform、JVM、Native、JS 的更新，以及 Gradle 和 Maven 的建置工具支援。</web-summary>

<tldr>
   <p>IntelliJ IDEA 2021.2、2021.3 和 2022.1 現已提供對 Kotlin 1.7.0 的 IDE 支援。</p>
</tldr>

_[發佈日期：2022 年 6 月 9 日](releases.md#release-history)_

Kotlin 1.7.0 現已正式發佈。此版本推出了全新 Kotlin/JVM K2 編譯器的 Alpha 版本、穩定了多項語言特性，並為 JVM、JS 和 Native 平台帶來了效能提升。

以下是此版本的主要更新清單：

* [全新的 Kotlin K2 編譯器現已進入 Alpha 階段](#new-kotlin-k2-compiler-for-the-jvm-in-alpha)，它帶來了顯著的效能提升。目前僅適用於 JVM，且包括 kapt 在內的所有編譯器外掛程式皆尚未支援。
* [Gradle 累加編譯的新方法](#a-new-approach-to-incremental-compilation)。累加編譯現在也支援在依賴的非 Kotlin 模組內所做的變更，並且與 Gradle 相容。
* 我們穩定了[選擇加入要求註解](#stable-opt-in-requirements)、[絕對不可為 null 型別](#stable-definitely-non-nullable-types)以及[建構器推論](#stable-builder-inference)。
* [現在為型別引數提供了底線運算子](#underscore-operator-for-type-arguments)。當其他型別已指定時，你可以使用它來自動推論引數的型別。
* [此版本允許委託實作給內嵌類別的內嵌值](#allow-implementation-by-delegation-to-an-inlined-value-of-an-inline-class)。你現在可以建立在大多數情況下不配置記憶體的輕量包裝函式。

你也可以在此影片中找到變更的簡要概述：

<video src="https://www.youtube.com/v/54WEfLKtCGk" title="Kotlin 1.7.0 新功能"/>

> 有關 Kotlin 發佈週期的詳細資訊，請參閱 [Kotlin 發佈流程](releases.md)。
>
{style="tip"}

## 適用於 JVM 的全新 Kotlin K2 編譯器進入 Alpha 階段 {id="new-kotlin-k2-compiler-for-the-jvm-in-alpha"}

此 Kotlin 版本引入了全新 Kotlin K2 編譯器的 **Alpha** 版本。新編譯器旨在加快新語言特性的開發速度、統一 Kotlin 支援的所有平台、帶來效能改進，並為編譯器擴充套件提供 API。

我們已經發佈了關於新編譯器及其優勢的詳細說明：

* [通往全新 Kotlin 編譯器之路 (The Road to the New Kotlin Compiler)](https://www.youtube.com/watch?v=iTdJJq_LyoY)
* [K2 編譯器：由上而下的視角 (K2 Compiler: a Top-Down View)](https://www.youtube.com/watch?v=db19VFLZqJM)

需要指出的是，全新 K2 編譯器的 Alpha 版本主要聚焦於效能提升，且目前僅適用於 JVM 專案。它尚不支援 Kotlin/JS、Kotlin/Native 或其他多平台專案，包括 [kapt](kapt.md) 在內的所有編譯器外掛程式也都暫時無法與之搭配運作。

我們的效能基準測試在內部專案中展示了一些出色的成果：

| 專案 | 目前 Kotlin 編譯器效能 | 全新 K2 Kotlin 編譯器效能 | 效能提升 |
|---------------|-------------------------------------|------------------------------------|-------------------|
| Kotlin        | 2.2 KLOC/s                          | 4.8 KLOC/s                         | ~ x2.2            |
| YouTrack      | 1.8 KLOC/s                          | 4.2 KLOC/s                         | ~ x2.3            |
| IntelliJ IDEA | 1.8 KLOC/s                          | 3.9 KLOC/s                         | ~ x2.2            |
| Space         | 1.2 KLOC/s                          | 2.8 KLOC/s                         | ~ x2.3            |

> KLOC/s 效能數字代表編譯器每秒處理的千行程式碼數。
>
> {style="tip"}

你可以在自己的 JVM 專案上查看效能提升，並與舊編譯器的結果進行比較。若要啟用 Kotlin K2 編譯器，請使用以下編譯器選項：

```bash
-Xuse-k2
```

此外，K2 編譯器[包含許多錯誤修正](https://youtrack.jetbrains.com/issues/KT?q=tag:%20FIR-preview-qa%20%23Resolved)。請注意，此清單中狀態為 **State: Open** 的問題實際上在 K2 中也已修復。

後續的 Kotlin 版本將提升 K2 編譯器的穩定性並提供更多功能，敬請期待！

如果你在使用 Kotlin K2 編譯器時遇到任何效能問題，請[向我們處的問題追蹤器回報](https://kotl.in/issue)。

## 語言 {id="language"}

Kotlin 1.7.0 引入了對委託實作的支援以及用於型別引數的全新底線運算子。它還穩定了先前版本中作為預覽版引入的多項語言特性：

* [委託實作給內嵌類別的內嵌值](#allow-implementation-by-delegation-to-an-inlined-value-of-an-inline-class)
* [型別引數的底線運算子](#underscore-operator-for-type-arguments)
* [穩定的建構器推論](#stable-builder-inference)
* [穩定的選擇加入要求](#stable-opt-in-requirements)
* [穩定的絕對不可為 null 型別](#stable-definitely-non-nullable-types)

### 允許委託實作給內嵌類別的內嵌值 {id="allow-implementation-by-delegation-to-an-inlined-value-of-an-inline-class"}

如果你想為某個值或類別執行個體建立輕量包裝函式，就必須手動實作所有介面方法。透過委託實作可以解決這個問題，但在 1.7.0 之前，它無法與內嵌類別一起使用。此限制現已解除，因此你現在可以建立在大多數情況下不配置記憶體的輕量包裝函式。

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

### 型別引數的底線運算子 {id="underscore-operator-for-type-arguments"}

Kotlin 1.7.0 為型別引數引入了底線運算子 `_`。當指定了其他型別時，你可以使用它來自動推論型別引數：

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
    // 由於 SomeImplementation 衍生自 SomeClass<String>，T 被推論為 String
    val s = Runner.run<SomeImplementation, _>()
    assert(s == "Test")

    // 由於 OtherImplementation 衍生自 SomeClass<Int>，T 被推論為 Int
    val n = Runner.run<OtherImplementation, _>()
    assert(n == 42)
}
```

> 你可以在變數清單中的任何位置使用底線運算子來推論型別引數。
>
{style="note"}

### 穩定的建構器推論 {id="stable-builder-inference"}

建構器推論是一種特殊的型別推論，在呼叫泛型建構器函式時非常有用。它幫助編譯器利用其 Lambda 引數內其他呼叫的型別資訊，來推論該呼叫的型別引數。

從 1.7.0 開始，如果常規型別推論在未指定 `-Xenable-builder-inference` 編譯器選項（[在 1.6.0 中引入](whatsnew16.md#changes-to-builder-inference)）的情況下無法取得足夠的型別資訊，系統會自動啟用建構器推論。

[了解如何撰寫自訂泛型建構器](using-builders-with-builder-inference.md)。

### 穩定的選擇加入要求 {id="stable-opt-in-requirements"}

[選擇加入要求](opt-in-requirements.md)現已[穩定 (Stable)](components-stability.md)，不需要額外的編譯器配置。

在 1.7.0 之前，選擇加入特性本身需要引數 `-opt-in=kotlin.RequiresOptIn` 以避免警告。現在不再需要此引數；但是，你仍然可以使用編譯器引數 `-opt-in` 來為其他註解或[整個模組](opt-in-requirements.md#opt-in-a-module)選擇加入。

### 穩定的絕對不可為 null 型別 {id="stable-definitely-non-nullable-types"}

在 Kotlin 1.7.0 中，絕對不可為 null 型別已升級為[穩定 (Stable)](components-stability.md)。它們在擴充泛型 Java 類別和介面時提供了更好的互通性。

你可以使用新語法 `T & Any` 在使用處將泛型型別參數標記為絕對不可為 null。該語法形式來自[交集型別 (intersection types)](https://en.wikipedia.org/wiki/Intersection_type) 的表示法，目前限制為 `&` 左側為具有可為 null 上界的型別參數，右側為不可為 null 的 `Any`：

```kotlin
fun <T> elvisLike(x: T, y: T & Any): T & Any = x ?: y

fun main() {
    // 正確
    elvisLike<String>("", "").length
    // 錯誤：'null' 不能作為非 null 型別的值
    elvisLike<String>("", null).length

    // 正確
    elvisLike<String?>(null, "").length
    // 錯誤：'null' 不能作為非 null 型別的值
    elvisLike<String?>(null, null).length
}
```

若要深入了解絕對不可為 null 型別，請參閱[此 KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/definitely-non-nullable-types.md)。

## Kotlin/JVM {id="kotlin-jvm"}

此版本帶來了 Kotlin/JVM 編譯器的效能提升和一個全新的編譯器選項。此外，對函式介面建構函式的可呼叫參照已成為穩定特性。請注意，自 1.7.0 起，Kotlin/JVM 編譯的預設目標版本為 `1.8`。

* [編譯器效能最佳化](#compiler-performance-optimizations)
* [新增編譯器選項 `-Xjdk-release`](#new-compiler-option-xjdk-release)
* [對函式介面建構函式的可呼叫參照已穩定](#stable-callable-references-to-functional-interface-constructors)
* [移除了 JVM 目標版本 1.6](#removed-jvm-target-version-1-6)

### 編譯器效能最佳化 {id="compiler-performance-optimizations"}

Kotlin 1.7.0 引入了 Kotlin/JVM 編譯器的效能改進。根據我們的基準測試，與 Kotlin 1.6.0 相比，編譯時間[平均減少了 10%](https://youtrack.jetbrains.com/issue/KT-48233/Switching-to-JVM-IR-backend-increases-compilation-time-by-more-t#focus=Comments-27-6114542.0-0)。得益於位元組碼後處理的改進，大量使用內嵌函式的專案（例如[使用 `kotlinx.html` 的專案](https://youtrack.jetbrains.com/issue/KT-51416/Compilation-of-kotlinx-html-DSL-should-still-be-faster)）編譯速度將會更快。

### 新增編譯器選項：-Xjdk-release {id="new-compiler-option-xjdk-release"}

Kotlin 1.7.0 提供了一個全新的編譯器選項 `-Xjdk-release`。此選項類似於 [javac 的命令列 `--release` 選項](http://openjdk.java.net/jeps/247)。`-Xjdk-release` 選項控制目標位元組碼版本，並將類別路徑中 JDK 的 API 限制為指定的 Java 版本。例如，`kotlinc -Xjdk-release=1.8` 將不允許參照 `java.lang.Module`，即使相依性中的 JDK 版本為 9 或更高版本。

> 此選項[不能保證](https://youtrack.jetbrains.com/issue/KT-29974)對每個 JDK 發行版都有效。
>
{style="note"}

請在[此 YouTrack 票證](https://youtrack.jetbrains.com/issue/KT-29974/Add-a-compiler-option-Xjdk-release-similar-to-javac-s-release-to)中留下你的回饋。

### 穩定的函式介面建構函式可呼叫參照 {id="stable-callable-references-to-functional-interface-constructors"}

對函式介面建構函式的[可呼叫參照](fun-interfaces.md#pass-callable-references-to-sam-parameters)現已[穩定 (Stable)](components-stability.md)。了解如何使用可呼叫參照從具有建構函式的介面[遷移](fun-interfaces.md#migration-from-an-interface-with-constructor-function-to-a-functional-interface)到函式介面。

請在 [YouTrack](https://youtrack.jetbrains.com/newissue?project=kt) 中回報你發現的任何問題。

### 移除了 JVM 目標版本 1.6 {id="removed-jvm-target-version-1-6"}

Kotlin/JVM 編譯的預設目標版本為 `1.8`。`1.6` 目標版本已被移除。

請遷移至 JVM 目標版本 1.8 或更高版本。了解如何更新下列工具的 JVM 目標版本：

* [Gradle](gradle-compiler-options.md#attributes-specific-to-jvm)
* [Maven](maven-kotlin-compiler.md#attributes-specific-to-jvm)
* [命令列編譯器](compiler-reference.md#jvm-target-version)

## Kotlin/Native {id="kotlin-native"}

Kotlin 1.7.0 包含了對 Objective-C 和 Swift 互通性的變更，並穩定了先前版本中引入的功能。它還為新記憶體管理器帶來了效能提升以及其他更新：

* [新記憶體管理器的效能提升](#performance-improvements-for-the-new-memory-manager)
* [與 JVM 和 JS IR 後端統一的編譯器外掛程式 ABI](#unified-compiler-plugin-abi-with-jvm-and-js-ir-backends)
* [支援獨立的 Android 可執行檔](#support-for-standalone-android-executables)
* [與 Swift async/await 的互通性：傳回 `Void` 而非 `KotlinUnit`](#interop-with-swift-async-await-returning-void-instead-of-kotlinunit)
* [禁止透過 Objective-C 橋接未宣告的例外](#prohibited-undeclared-exceptions-through-objective-c-bridges)
* [改進的 CocoaPods 整合](#improved-cocoapods-integration)
* [覆寫 Kotlin/Native 編譯器下載 URL](#overriding-the-kotlin-native-compiler-download-url)

### 新記憶體管理器的效能提升 {id="performance-improvements-for-the-new-memory-manager"}

> 全新的 Kotlin/Native 記憶體管理器處於 [Alpha](components-stability.md) 階段。
> 它未來可能會發生不相容的變更並需要手動遷移。
> 歡迎你在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-48525) 中提供回饋。
>
{style="note"}

新的記憶體管理器仍處於 Alpha 階段，但正在邁向[穩定 (Stable)](components-stability.md)。此版本為新記憶體管理器帶來了顯著的效能提升，特別是在垃圾收集 (GC) 方面。[在 1.6.20 中引入](whatsnew1620.md)的清除階段並行實作現在預設啟用。這有助於減少應用程式因 GC 而暫停的時間。新的 GC 排程器更善於選擇 GC 頻率，尤其是在較大的堆積上。

此外，我們專門最佳化了偵錯二進位檔，確保在記憶體管理器的實作程式碼中使用適當的最佳化層級和連結時期最佳化。這使我們的基準測試中偵錯二進位檔的執行時間縮短了約 30%。

嘗試在你的專案中使用新的記憶體管理器，看看效果如何，並在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-48525) 中與我們分享你的回饋。

### 與 JVM 和 JS IR 後端統一的編譯器外掛程式 ABI {id="unified-compiler-plugin-abi-with-jvm-and-js-ir-backends"}

從 Kotlin 1.7.0 開始，Kotlin Multiplatform Gradle 外掛程式預設使用 Kotlin/Native 的可內嵌編譯器 jar。此[功能在 1.6.0 中作為實驗性功能發佈](whatsnew16.md#unified-compiler-plugin-abi-with-jvm-and-js-ir-backends)，現在它已穩定並可供使用。

這項改進對程式庫作者非常方便，因為它改善了編譯器外掛程式的開發體驗。在此版本之前，你必須為 Kotlin/Native 提供單獨的構件，但現在你可以為 Native 和其他受支援的平台使用相同的編譯器外掛程式構件。

> 此功能可能需要外掛程式開發者針對其現有外掛程式執行遷移步驟。
>
> 了解如何在此 [YouTrack 問題](https://youtrack.jetbrains.com/issue/KT-48595)中為外掛程式更新做好準備。
>
{style="warning"}

### 支援獨立的 Android 可執行檔 {id="support-for-standalone-android-executables"}

Kotlin 1.7.0 提供了針對 Android Native 目標產生標準可執行檔的完整支援。它最初[在 1.6.20 中引入](whatsnew1620.md#support-for-standalone-android-executables)，現在預設啟用。

如果你想回復到先前 Kotlin/Native 產生共用程式庫時的行為，請使用以下設定：

```kotlin
binaryOptions["androidProgramType"] = "nativeActivity"
```

### 與 Swift async/await 的互通性：傳回 Void 而非 KotlinUnit {id="interop-with-swift-async-await-returning-void-instead-of-kotlinunit"}

Kotlin 的 `suspend` 函式在 Swift 中現在傳回 `Void` 型別，而不是 `KotlinUnit`。這是改進與 Swift 的 `async`/`await` 互通性的結果。此特性[在 1.6.20 中引入](whatsnew1620.md#interop-with-swift-async-await-returning-void-instead-of-kotlinunit)，在此版本中預設啟用了該行為。

你不再需要使用 `kotlin.native.binary.unitSuspendFunctionObjCExport=proper` 屬性來為此類函式傳回正確的型別。

### 禁止透過 Objective-C 橋接未宣告的例外 {id="prohibited-undeclared-exceptions-through-objective-c-bridges"}

當你從 Swift/Objective-C 程式碼呼叫 Kotlin 程式碼（反之亦然）且該程式碼擲出例外時，除非你明確允許透過適當的轉換在語言之間轉發例外（例如使用 `@Throws` 註解），否則應由發生例外的程式碼進行處理。

先前，Kotlin 存在另一種非預期的行為，即未宣告的例外在某些情況下可能會從一種語言「洩漏」到另一種語言。Kotlin 1.7.0 修復了該問題，現在此類情況會導致程式終止。

因此，舉例來說，如果你在 Kotlin 中有一個 `{ throw Exception() }` Lambda 並從 Swift 呼叫它，在 Kotlin 1.7.0 中，只要例外到達 Swift 程式碼，程式就會立即終止。在以前的 Kotlin 版本中，此類例外可能會洩漏到 Swift 程式碼中。

`@Throws` 註解將繼續像以前一樣運作。

### 改進的 CocoaPods 整合 {id="improved-cocoapods-integration"}

從 Kotlin 1.7.0 開始，如果你想在專案中整合 CocoaPods，不再需要安裝 `cocoapods-generate` 外掛程式。

先前，你需要同時安裝 CocoaPods 相依性管理器和 `cocoapods-generate` 外掛程式才能使用 CocoaPods，例如在 Kotlin Multiplatform Mobile 專案中處理 [iOS 相依性](https://kotlinlang.org/docs/multiplatform/multiplatform-ios-dependencies.html#with-cocoapods)。

現在設定 CocoaPods 整合變得更加容易，而且我們解決了在 Ruby 3 及更高版本上無法安裝 `cocoapods-generate` 的問題。現在也支援在 Apple M1 上執行效果更好的最新 Ruby 版本。

了解如何設定[初始 CocoaPods 整合](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html#set-up-an-environment-to-work-with-cocoapods)。

### 覆寫 Kotlin/Native 編譯器下載 URL {id="overriding-the-kotlin-native-compiler-download-url"}

從 Kotlin 1.7.0 開始，你可以自訂 Kotlin/Native 編譯器的下載 URL。當 CI 上禁止存取外部連結時，這非常有用。

若要覆寫預設基底 URL `https://download.jetbrains.com/kotlin/native/builds`，請使用以下 Gradle 屬性：

```none
kotlin.native.distribution.baseDownloadUrl=https://example.com
```

> 下載器會將原生版本和目標作業系統附加到此基底 URL，以確保下載實際的編譯器發行套件。
>
{style="note"}

## Kotlin/JS {id="kotlin-js"}

Kotlin/JS 的 [JS IR 編譯器後端](js-ir-compiler.md)獲得了進一步改進，以及其他可以提升開發體驗的更新：

* [新 IR 後端的效能改進](#performance-improvements-for-the-new-ir-backend)
* [使用 IR 時對成員名稱進行縮減](#minification-for-member-names-when-using-ir)
* [透過 IR 後端中的 Polyfill 支援舊版瀏覽器](#support-for-older-browsers-via-polyfills-in-the-ir-backend)
* [從 js 運算式動態載入 JavaScript 模組](#dynamically-load-javascript-modules-from-js-expressions)
* [為 JavaScript 測試執行器指定環境變數](#specify-environment-variables-for-javascript-test-runners)

### 新 IR 後端的效能改進 {id="performance-improvements-for-the-new-ir-backend"}

此版本包含一些重大更新，應該可以改善你的開發體驗：

* Kotlin/JS 的累加編譯效能顯著提高。建置 JS 專案所需的時間更少。在許多情況下，累加重建現在應該大致與舊版後端持平。
* 由於我們顯著減少了最終構件的大小，Kotlin/JS 最終打包檔案所需的空間更小。對於某些大型專案，我們測得生產環境打包大小與舊版後端相比減少了多達 20%。
* 介面的型別檢查效能提升了數個數量級。
* Kotlin 產生更高品質的 JS 程式碼

### 使用 IR 時對成員名稱進行縮減 {id="minification-for-member-names-when-using-ir"}

Kotlin/JS IR 編譯器現在會利用有關 Kotlin 類別和函式之間關係的內部資訊來套用更有效的縮減（Minification），縮短函式、屬性和類別的名稱。這減少了產生的打包應用程式體積。

當你在生產模式下組建 Kotlin/JS 應用程式時，會自動套用這種類型的縮減，並且預設啟用。若要停用成員名稱縮減，請使用 `-Xir-minimized-member-names` 編譯器旗標：

```kotlin
kotlin {
    js(IR) {
        compilations.all {
            compileKotlinTask.kotlinOptions.freeCompilerArgs += listOf("-Xir-minimized-member-names=false")
        }
    }
}
```

### 透過 IR 後端中的 Polyfill 支援舊版瀏覽器 {id="support-for-older-browsers-via-polyfills-in-the-ir-backend"}

Kotlin/JS 的 IR 編譯器後端現在包含與舊版後端相同的 Polyfill。這使得使用新編譯器編譯的程式碼能夠在不支援 Kotlin 標準函式庫所使用的所有 ES2015 方法的舊版瀏覽器中執行。最終打包中僅包含專案實際使用的那些 Polyfill，從而最大限度地減少其對打包大小的潛在影響。

使用 IR 編譯器時，此功能預設啟用，你無需進行設定。

### 從 js 運算式動態載入 JavaScript 模組 {id="dynamically-load-javascript-modules-from-js-expressions"}

在處理 JavaScript 模組時，大多數應用程式使用靜態匯入，其使用方式已在 [JavaScript 模組整合](js-modules.md)中涵蓋。但是，Kotlin/JS 之前缺少在執行階段於應用程式中動態載入 JavaScript 模組的機制。

從 Kotlin 1.7.0 開始，`js` 區塊中支援 JavaScript 的 `import` 陳述式，允許你在執行階段動態地將套件引入應用程式：

```kotlin
val myPackage = js("import('my-package')")
```

### 為 JavaScript 測試執行器指定環境變數 {id="specify-environment-variables-for-javascript-test-runners"}

為了微調 Node.js 套件解析或將外部資訊傳遞給 Node.js 測試，你現在可以指定 JavaScript 測試執行器使用的環境變數。若要定義環境變數，請在建置指令碼的 `testTask` 區塊內使用帶有鍵值組的 `environment()` 函式：

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

## 標準函式庫 {id="standard-library"}

在 Kotlin 1.7.0 中，標準函式庫獲得了一系列的變更和改進。它們引入了新特性、穩定了實驗性特性，並統一了對 Native、JS 和 JVM 的具名捕獲群組支援：

* [min() 和 max() 集合函式傳回不可為 null 型別](#min-and-max-collection-functions-return-as-non-nullable)
* [特定索引處的正規表示式比對](#regular-expression-matching-at-specific-indices)
* [擴充對先前語言和 API 版本的支援](#extended-support-for-previous-language-and-api-versions)
* [透過反射存取註解](#access-to-annotations-via-reflection)
* [穩定的深層遞迴函式](#stable-deep-recursive-functions)
* [預設時間來源基於內嵌類別的時間標記](#time-marks-based-on-inline-classes-for-default-time-source)
* [針對 Java Optional 的全新實驗性擴充函式](#new-experimental-extension-functions-for-java-optionals)
* [支援 JS 和 Native 中的具名捕獲群組](#support-for-named-capturing-groups-in-js-and-native)

### min() 和 max() 集合函式傳回不可為 null 型別 {id="min-and-max-collection-functions-return-as-non-nullable"}

在 [Kotlin 1.4.0](whatsnew14.md) 中，我們將 `min()` 和 `max()` 集合函式重新命名為 `minOrNull()` 和 `maxOrNull()`。這些新名稱更好地反映了它們的行為——如果接收者集合為空，則傳回 null。這也有助於使這些函式的行為與整個 Kotlin 集合 API 中使用的命名慣例保持一致。

`minBy()`、`maxBy()`、`minWith()` 和 `maxWith()` 也是如此，它們都在 Kotlin 1.4.0 中獲得了各自的 *OrNull() 同義詞。受此變更影響的舊版函式已被逐步棄用。

Kotlin 1.7.0 重新引入了原有的函式名稱，但具有不可為 null 的傳回型別。新的 `min()`、`max()`、`minBy()`、`maxBy()`、`minWith()` 和 `maxWith()` 函式現在會嚴格傳回集合元素或擲出例外。

```kotlin
fun main() {
    val numbers = listOf<Int>()
    println(numbers.maxOrNull()) // "null"
    println(numbers.max()) // "Exception in... Collection is empty."
}
```

### 特定索引處的正規表示式比對 {id="regular-expression-matching-at-specific-indices"}

[在 1.5.30 中引入](whatsnew1530.md#matching-with-regex-at-a-particular-position)的 `Regex.matchAt()` 和 `Regex.matchesAt()` 函式現已穩定。它們提供了一種檢查正規表示式是否在 `String` 或 `CharSequence` 的特定位置完全符合的方法。

`matchesAt()` 檢查是否有相符項並傳回布林值結果：

```kotlin
fun main() {
    val releaseText = "Kotlin 1.7.0 is on its way!"
    // 正規表示式：一個數字、點、一個數字、點、一個或多個數字
    val versionRegex = "\\d[.]\\d[.]\\d+".toRegex()

    println(versionRegex.matchesAt(releaseText, 0)) // "false"
    println(versionRegex.matchesAt(releaseText, 7)) // "true"
}
```

`matchAt()` 如果找到相符項則傳回該相符項，如果未找到則傳回 `null`：

```kotlin
fun main() {
    val releaseText = "Kotlin 1.7.0 is on its way!"
    val versionRegex = "\\d[.]\\d[.]\\d+".toRegex()

    println(versionRegex.matchAt(releaseText, 0)) // "null"
    println(versionRegex.matchAt(releaseText, 7)?.value) // "1.7.0"
}
```

歡迎在此 [YouTrack 問題](https://youtrack.jetbrains.com/issue/KT-34021)中向我們提供回饋。

### 擴充對先前語言和 API 版本的支援 {id="extended-support-for-previous-language-and-api-versions"}

為了支援程式庫作者開發可在廣泛的舊版 Kotlin 中使用的程式庫，並應對主要版本更頻繁發佈的情況，我們擴充了對先前語言和 API 版本的支援。

在 Kotlin 1.7.0 中，我們支援前三個語言和 API 版本，而不是前兩個。這意味著 Kotlin 1.7.0 支援開發以低至 1.4.0 的 Kotlin 版本為目標的程式庫。有關回溯相容性的更多資訊，請參閱[相容性選項](kotlin-evolution-principles.md#compatibility-options)。

### 透過反射存取註解 {id="access-to-annotations-via-reflection"}

最初[在 1.6.0 中引入](whatsnew16.md#repeatable-annotations-with-runtime-retention-for-1-8-jvm-target)的擴充函式 [`KAnnotatedElement.findAnnotations()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.full/find-annotations.html) 現已[穩定 (Stable)](components-stability.md)。此[反射](reflection.md)函式會傳回元素上給定型別的所有註解，包括個別套用的和重複的註解。

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

### 穩定的深層遞迴函式 {id="stable-deep-recursive-functions"}

自 [Kotlin 1.4.0](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-rc-debugging-coroutines/#Defining_deep_recursive_functions_using_coroutines) 以來，深層遞迴函式一直作為實驗性功能提供，現在它們在 Kotlin 1.7.0 中已[穩定 (Stable)](components-stability.md)。使用 `DeepRecursiveFunction`，你可以定義一個將其堆疊保留在堆積上而不是使用實際呼叫堆疊的函式。這使你能夠執行非常深階層的遞迴計算。若要呼叫深層遞迴函式，請 `invoke` 它。

在此範例中，使用深層遞迴函式來遞迴計算二元樹的深度。即使此範例函式遞迴呼叫自身 100,000 次，也不會擲出 `StackOverflowError`：

```kotlin
class Tree(val left: Tree?, val right: Tree?)

val calculateDepth = DeepRecursiveFunction<Tree?, Int> { t ->
    if (t == null) 0 else maxOf(
        callRecursive(t.left),
        callRecursive(t.right)
    ) + 1
}

fun main() {
    // 產生深度為 100_000 的樹
    val deepTree = generateSequence(Tree(null, null)) { prev ->
        Tree(prev, null)
    }.take(100_000).last()

    println(calculateDepth(deepTree)) // 100000
}
```

當你的遞迴深度超過 1000 次呼叫時，請考慮在程式碼中使用深層遞迴函式。

### 預設時間來源基於內嵌類別的時間標記 {id="time-marks-based-on-inline-classes-for-default-time-source"}

Kotlin 1.7.0 透過將 `TimeSource.Monotonic` 傳回的時間標記變更為內嵌值類別，提高了時間測量功能的效能。這意味著呼叫 `markNow()`、`elapsedNow()`、`measureTime()` 和 `measureTimedValue()` 等函式時，不會為其 `TimeMark` 執行個體配置包裝類別。特別是在測量屬於作用頻繁路徑 (hot path) 的一部分程式碼時，這有助於最大程度減少測量對效能的影響：

```kotlin
@OptIn(ExperimentalTime::class)
fun main() {
    val mark = TimeSource.Monotonic.markNow() // 傳回的 `TimeMark` 是內嵌類別
    val elapsedDuration = mark.elapsedNow()
}
```

> 只有當取得 `TimeMark` 的時間來源在靜態情況下已知為 `TimeSource.Monotonic` 時，此最佳化才可用。
>
{style="note"}

### 針對 Java Optional 的全新實驗性擴充函式 {id="new-experimental-extension-functions-for-java-optionals"}

Kotlin 1.7.0 隨附了新的便利函式，簡化了在 Java 中使用 `Optional` 類別的作業。這些新函式可用於在 JVM 上解包和轉換可選物件，有助於使 Java API 的使用更加簡潔。

`getOrNull()`、`getOrDefault()` 和 `getOrElse()` 擴充函式允許你在 `Optional` 存在時取得其值。否則，你將分別取得 `null`、預設值或由函式傳回的值：

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

`toList()`、`toSet()` 和 `asSequence()` 擴充函式將存在的 `Optional` 值轉換為清單、集合或序列，否則傳回空集合。`toCollection()` 擴充函式將 `Optional` 值附加到已存在的目標集合中：

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

這些擴充函式在 Kotlin 1.7.0 中作為實驗性功能引入。你可以在[此 KEEP](https://github.com/Kotlin/KEEP/pull/291) 中深入了解 `Optional` 擴充函式。一如既往，歡迎在 [Kotlin 問題追蹤器](https://kotl.in/issue)中提供回饋。

### 支援 JS 和 Native 中的具名捕獲群組 {id="support-for-named-capturing-groups-in-js-and-native"}

從 Kotlin 1.7.0 開始，不僅在 JVM 上，而且在 JS 和 Native 平台上也支援具名捕獲群組。

若要為捕獲群組指定名稱，請在正規表示式中使用 (`?<name>group`) 語法。若要取得群組相符的文字，請呼叫新引入的 [`MatchGroupCollection.get()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/get.html) 函式並傳入群組名稱。

#### 依名稱擷取相符的群組值 {id="retrieve-matched-group-value-by-name"}

以下列比對城市座標的範例為例。若要取得正規表示式比對的群組集合，請使用 [`groups`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-match-result/groups.html)。比較依編號（索引）和使用 `value` 依名稱擷取群組內容的差異：

```kotlin
fun main() {
    val regex = "\\b(?<city>[A-Za-z\\s]+),\\s(?<state>[A-Z]{2}):\\s(?<areaCode>[0-9]{3})\\b".toRegex()
    val input = "Coordinates: Austin, TX: 123"
    val match = regex.find(input)!!
    println(match.groups["city"]?.value) // "Austin" — 依名稱
    println(match.groups[2]?.value) // "TX" — 依編號
}
```

#### 具名反向引用 {id="named-backreferencing"}

你現在還可以在反向引用群組時使用群組名稱。反向引用會比對先前由捕獲群組比對到的相同文字。為此，請在正規表示式中使用 `\k<name>` 語法：

```kotlin
fun backRef() {
    val regex = "(?<title>\\w+), yes \\k<title>".toRegex()
    val match = regex.find("Do you copy? Sir, yes Sir!")!!
    println(match.value) // "Sir, yes Sir"
    println(match.groups["title"]?.value) // "Sir"
}
```

#### 取代運算式中的具名群組 {id="named-groups-in-replacement-expressions"}

具名群組參照可用於取代運算式。考慮將輸入中指定正規表示式的所有出現項目替換為取代運算式的 [`replace()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-regex/replace.html) 函式，以及僅替換第一個相符項的 [`replaceFirst()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-regex/replace-first.html) 函式。

取代字串中出現的 `${name}` 會被替換為對應於具有指定名稱的捕獲群組的子序列。你可以比較依名稱和依索引進行的群組參照取代：

```kotlin
fun dateReplace() {
    val dateRegex = Regex("(?<dd>\\d{2})-(?<mm>\\d{2})-(?<yyyy>\\d{4})")
    val input = "Date of birth: 27-04-2022"
    println(dateRegex.replace(input, "\${yyyy}-\${mm}-\${dd}")) // "Date of birth: 2022-04-27" — 依名稱
    println(dateRegex.replace(input, "\$3-\$2-\$1")) // "Date of birth: 2022-04-27" — 依編號
}
```

## Gradle {id="gradle"}

此版本引入了新的建置報告、對 Gradle 外掛程式變體的支援、kapt 中的新統計資訊等：

* [累加編譯的新方法](#a-new-approach-to-incremental-compilation)
* [用於追蹤編譯器效能的新建置報告](#build-reports-for-kotlin-compiler-tasks)
* [最低支援 Gradle 和 Android Gradle 外掛程式版本的變更](#bumping-minimum-supported-versions)
* [支援 Gradle 外掛程式變體](#support-for-gradle-plugin-variants)
* [Kotlin Gradle 外掛程式 API 的更新](#updates-in-the-kotlin-gradle-plugin-api)
* [可透過外掛程式 API 使用 sam-with-receiver 外掛程式](#the-sam-with-receiver-plugin-is-available-via-the-plugins-api)
* [編譯任務的變更](#changes-in-compile-tasks)
* [kapt 中每個註解處理器產生檔案的新統計資訊](#statistics-of-generated-files-by-each-annotation-processor-in-kapt)
* [棄用 kotlin.compiler.execution.strategy 系統屬性](#deprecation-of-the-kotlin-compiler-execution-strategy-system-property)
* [移除棄用的選項、方法和外掛程式](#removal-of-deprecated-options-methods-and-plugins)

### 累加編譯的新方法 {id="a-new-approach-to-incremental-compilation"}

> 累加編譯的新方法處於[實驗性 (Experimental)](components-stability.md) 階段。它可能隨時被移除或更改。
> 需要選擇加入（詳見下文）。我們鼓勵你僅將其用於評估目的，並歡迎你在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 中提供回饋。
>
{style="warning"}

在 Kotlin 1.7.0 中，我們重構了跨模組變更的累加編譯。現在，在相依的非 Kotlin 模組內所做的變更也支援累加編譯，並且與 [Gradle 建置快取](https://docs.gradle.org/current/userguide/build_cache.html)相容。對編譯規避 (compilation avoidance) 的支援也得到了改進。

如果你使用建置快取或經常在非 Kotlin Gradle 模組中進行變更，我們預期你將看到新方法帶來的最顯著好處。我們在 `kotlin-gradle-plugin` 模組上針對 Kotlin 專案的測試顯示，在快取命中後變更的建置效能提升超過 80%。

若要嘗試這種新方法，請在 `gradle.properties` 中設定以下選項：

```none
kotlin.incremental.useClasspathSnapshot=true
```

> 累加編譯的新方法目前僅適用於 Gradle 建置系統中的 JVM 後端。
>
{style="note"}

在[此部落格文章](https://blog.jetbrains.com/kotlin/2022/07/a-new-approach-to-incremental-compilation-in-kotlin/)中了解累加編譯新方法的底層實作方式。

我們的計畫是穩定這項技術，並增加對其他後端（例如 JS）和建置系統的支援。如果你在此編譯方案中遇到任何問題或異常行為，歡迎向 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 回報。謝謝！

Kotlin 團隊非常感謝 [Ivan Gavrilovic](https://github.com/gavra0)、[Hung Nguyen](https://github.com/hungvietnguyen)、[Cédric Champeau](https://github.com/melix) 以及其他外部貢獻者的協助。

### 用於 Kotlin 編譯器任務的建置報告 {id="build-reports-for-kotlin-compiler-tasks"}

> Kotlin 建置報告處於[實驗性 (Experimental)](components-stability.md) 階段。它們可能隨時被移除或更改。
> 需要選擇加入（詳見下文）。僅供評估使用。我們非常感謝你在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 上提供相關回饋。
>
{style="warning"}

Kotlin 1.7.0 引入了有助於追蹤編譯器效能的建置報告。報告包含不同編譯階段的持續時間以及編譯無法累加的原因。

當你想調查編譯器任務的問題時，建置報告非常有用，例如：

* 當 Gradle 建置耗費太多時間，而你想了解效能低落的根本原因時。
* 當同一個專案的編譯時間不同，有時需要數秒，有時需要數分鐘時。

若要啟用建置報告，請在 `gradle.properties` 中宣告建置報告輸出的儲存位置：

```none
kotlin.build.report.output=file
```

可使用以下值（及其組合）：

* `file` 將建置報告儲存在本機檔案中。
* `build_scan` 將建置報告儲存在 [build scan](https://scans.gradle.com/) 的 `custom values` 區段中。

  > Gradle Enterprise 外掛程式限制了自訂值的數量及其長度。在大型專案中，某些值可能會遺失。
  >
  {style="note"}

* `http` 使用 HTTP(S) 發送建置報告。POST 方法以 JSON 格式發送指標。資料可能會因版本而異。你可以在 [Kotlin 儲存庫](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-plugin/src/common/kotlin/org/jetbrains/kotlin/gradle/report/data/GradleCompileStatisticsData.kt)中查看目前發送資料的版本。

分析長時間運行的編譯的建置報告可以幫助你解決兩種常見情況：

* 建置非累加式。分析原因並解決根本問題。
* 建置是累加式的，但耗費了太多時間。嘗試重新組織原始碼檔案 — 拆分大檔案、將獨立類別儲存在不同檔案中、重構大型類別、在不同檔案中宣告頂層函式等等。

在[此部落格文章](https://blog.jetbrains.com/kotlin/2022/06/introducing-kotlin-build-reports/)中深入了解新的建置報告。

歡迎你在自己的基礎結構中嘗試使用建置報告。如果你有任何回饋、遇到任何問題或想提出改進建議，請隨時向我們的[問題追蹤器](https://youtrack.jetbrains.com/newIssue)回報。謝謝！

### 提高最低支援版本 {id="bumping-minimum-supported-versions"}

從 Kotlin 1.7.0 開始，最低支援的 Gradle 版本為 6.7.1。為了支援 [Gradle 外掛程式變體](#support-for-gradle-plugin-variants)和新的 Gradle API，我們不得不[提高版本要求](https://youtrack.jetbrains.com/issue/KT-49733/Bump-minimal-supported-Gradle-version-to-6-7-1)。未來，得益於 Gradle 外掛程式變體功能，我們應該不需要如此頻繁地提高最低支援版本。

此外，最低支援的 Android Gradle 外掛程式版本現在為 3.6.4。

### 支援 Gradle 外掛程式變體 {id="support-for-gradle-plugin-variants"}

Gradle 7.0 為 Gradle 外掛程式作者引入了一項新功能——[包含變體的外掛程式 (plugins with variants)](https://docs.gradle.org/7.0/userguide/implementing_gradle_plugins.html#plugin-with-variants)。此功能使得在保持對 7.1 以下 Gradle 版本的相容性的同時，更容易加入對新 Gradle 功能的支援。了解更多關於 [Gradle 中的變體選擇 (variant selection)](https://docs.gradle.org/current/userguide/variant_model.html)。

藉助 Gradle 外掛程式變體，我們可以為不同的 Gradle 版本提供不同的 Kotlin Gradle 外掛程式變體。目標是在對應於最舊支援 Gradle 版本的 `main` 變體中支援基本 Kotlin 編譯。每個變體都將包含對應版本 Gradle 功能的實作。最新變體將支援最廣泛的 Gradle 功能集。透過這種方法，我們可以擴充對功能有限的舊版 Gradle 的支援。

目前，Kotlin Gradle 外掛程式只有兩個變體：

* `main` 適用於 Gradle 6.7.1–6.9.3 版本
* `gradle70` 適用於 Gradle 7.0 及更高版本

在未來的 Kotlin 版本中，我們可能會加入更多變體。

若要檢查你的建置使用的是哪個變體，請啟用 [`--info` 記錄等級](https://docs.gradle.org/current/userguide/logging.html#sec:choosing_a_log_level)，並在輸出中尋找以 `Using Kotlin Gradle plugin` 開頭的字串，例如 `Using Kotlin Gradle plugin main variant`。

> 以下是 Gradle 中變體選擇的一些已知問題的暫時解決方案：
> * [pluginManagement 中的 ResolutionStrategy 無法處理多變體外掛程式](https://github.com/gradle/gradle/issues/20545)
> * [當外掛程式作為 `buildSrc` 通用相依性加入時，外掛程式變體會被忽略](https://github.com/gradle/gradle/issues/20847)
>
{style="note"}

歡迎在[此 YouTrack 票證](https://youtrack.jetbrains.com/issue/KT-49227/Support-Gradle-plugins-variants)中留下你的回饋。

### Kotlin Gradle 外掛程式 API 的更新 {id="updates-in-the-kotlin-gradle-plugin-api"}

Kotlin Gradle 外掛程式 API 構件獲得了多項改進：

* 為具有使用者可設定輸入的 Kotlin/JVM 和 Kotlin/kapt 任務提供了新的介面。
* 新增了所有 Kotlin 外掛程式皆繼承的全新 `KotlinBasePlugin` 介面。當套用任何 Kotlin Gradle 外掛程式（JVM、JS、Multiplatform、Native 和其他平台）時，若你想觸發某些設定操作，可以使用此介面：

  ```kotlin
  project.plugins.withType<org.jetbrains.kotlin.gradle.plugin.KotlinBasePlugin>() {
      // 在此配置你的操作
  }
  ```
  你可以在[此 YouTrack 票證](https://youtrack.jetbrains.com/issue/KT-48008/Consider-offering-a-KotlinBasePlugin)中留下關於 `KotlinBasePlugin` 的回饋。

* 我們為 Android Gradle 外掛程式在其內部配置 Kotlin 編譯奠定了基礎，這意味著你無需在建置中加入 Kotlin Android Gradle 外掛程式。
  關注 [Android Gradle 外掛程式版本發佈公告](https://developer.android.com/studio/releases/gradle-plugin)以了解新增的支援並進行嘗試！

### 可透過外掛程式 API 使用 sam-with-receiver 外掛程式 {id="the-sam-with-receiver-plugin-is-available-via-the-plugins-api"}

[sam-with-receiver 編譯器外掛程式](sam-with-receiver-plugin.md)現在可透過 [Gradle plugins DSL](https://docs.gradle.org/current/userguide/plugins.html#sec:plugins_block) 使用：

```kotlin
plugins {
    id("org.jetbrains.kotlin.plugin.sam.with.receiver") version "$kotlin_version"
}
```

### 編譯任務的變更 {id="changes-in-compile-tasks"}

編譯任務在此版本中進行了許多變更：

* Kotlin 編譯任務不再繼承 Gradle 的 `AbstractCompile` 任務。它們僅繼承 `DefaultTask`。
* `AbstractCompile` 任務具有 `sourceCompatibility` 和 `targetCompatibility` 輸入。由於不再繼承 `AbstractCompile` 任務，這些輸入在 Kotlin 使用者的指令碼中已不再可用。
* `SourceTask.stableSources` 輸入不再可用，你應該使用 `sources` 輸入。`setSource(...)` 方法仍然可用。
* 所有編譯任務現在使用 `libraries` 輸入來取得編譯所需的程式庫清單。`KotlinCompile` 任務仍保留已棄用的 Kotlin 屬性 `classpath`，該屬性將在未來版本中移除。
* 編譯任務仍然實作 `PatternFilterable` 介面，允許篩選 Kotlin 原始檔。移除了 `sourceFilesExtensions` 輸入，改為使用 `PatternFilterable` 的方法。
* 棄用的 `Gradle destinationDir: File` 輸出已替換為 `destinationDirectory: DirectoryProperty` 輸出。
* Kotlin/Native 的 `AbstractNativeCompile` 任務現在繼承了 `AbstractKotlinCompileTool` 基底類別。這是將 Kotlin/Native 建置工具整合到所有其他工具中的第一步。

請在[此 YouTrack 票證](https://youtrack.jetbrains.com/issue/KT-32805)中留下你的回饋。

### kapt 中每個註解處理器產生檔案的新統計資訊 {id="statistics-of-generated-files-by-each-annotation-processor-in-kapt"}

`kotlin-kapt` Gradle 外掛程式已經[會回報每個處理器的效能統計資訊](https://github.com/JetBrains/kotlin/pull/4280)。從 Kotlin 1.7.0 開始，它還可以回報每個註解處理器產生的檔案數量的統計資訊。

這對於追蹤建置中是否存在未使用的註解處理器非常有用。你可以使用產生的報告找出觸發非必要註解處理器的模組，並更新這些模組以防止這種情況。

只需兩步即可啟用統計資訊：

* 在你的 `build.gradle.kts` 中將 `showProcessorStats` 旗標設為 `true`：

  ```kotlin
  kapt {
      showProcessorStats = true
  }
  ```

* 在你的 `gradle.properties` 中將 `kapt.verbose` Gradle 屬性設為 `true`：
  
  ```none
  kapt.verbose=true
  ```

> 你也可以使用[命令列選項 `verbose`](kapt.md#cli) 來啟用詳細輸出。
>
{style="note"}

統計資訊將以 `info` 等級顯示在記錄中。你將看到 `Annotation processor stats:` 行，隨後是每個註解處理器執行時間的統計資訊。在這些行之後，將出現 `Generated files report:` 行，隨後是每個註解處理器產生檔案數量的統計資訊。例如：

```text
[INFO] Annotation processor stats:
[INFO] org.mapstruct.ap.MappingProcessor: total: 290 ms, init: 1 ms, 3 round(s): 289 ms, 0 ms, 0 ms
[INFO] Generated files report:
[INFO] org.mapstruct.ap.MappingProcessor: total sources: 2, sources per round: 2, 0, 0
```

請在[此 YouTrack 票證](https://youtrack.jetbrains.com/issue/KT-51132/KAPT-Support-reporting-the-number-of-generated-files-by-each-ann)中留下你的回饋。

### 棄用 kotlin.compiler.execution.strategy 系統屬性 {id="deprecation-of-the-kotlin-compiler-execution-strategy-system-property"}

Kotlin 1.6.20 引入了[用於定義 Kotlin 編譯器執行策略的新屬性](whatsnew1620.md#properties-for-defining-kotlin-compiler-execution-strategy)。在 Kotlin 1.7.0 中，舊系統屬性 `kotlin.compiler.execution.strategy` 已進入棄用週期，由新屬性取而代之。

使用 `kotlin.compiler.execution.strategy` 系統屬性時，你會收到警告。此屬性將在未來版本中刪除。若要保留舊行為，請將該系統屬性替換為同名的 Gradle 屬性。例如，你可以在 `gradle.properties` 中進行設定：

```none
kotlin.compiler.execution.strategy=out-of-process
```

你也可以使用編譯任務屬性 `compilerExecutionStrategy`。在[編譯器執行策略頁面](compiler-execution-strategy.md)上深入了解這一點。

### 移除棄用的選項、方法和外掛程式 {id="removal-of-deprecated-options-methods-and-plugins"}

#### 移除 useExperimentalAnnotation 方法 {id="removal-of-the-useexperimentalannotation-method"}

在 Kotlin 1.7.0 中，我們完成了 `useExperimentalAnnotation` Gradle 方法的棄用週期。請改用 `optIn()` 來選擇在模組中使用 API。

例如，如果你的 Gradle 模組是多平台模組：

```kotlin
sourceSets {
    all {
        languageSettings.optIn("org.mylibrary.OptInAnnotation")
    }
}
```

深入了解 Kotlin 中的[選擇加入要求](opt-in-requirements.md)。

#### 移除棄用的編譯器選項 {id="removal-of-deprecated-compiler-options"}

我們完成了多個編譯器選項的棄用週期：

* 編譯器選項 `kotlinOptions.jdkHome` 已在 1.5.30 中棄用，並在當前版本中移除。如果 Gradle 組建包含此選項，現在將會失敗。我們建議你使用自 Kotlin 1.5.30 起支援的 [Java 工具鏈](whatsnew1530.md#support-for-java-toolchains)。
* 棄用的 `noStdlib` 編譯器選項也已被移除。Gradle 外掛程式使用 `kotlin.stdlib.default.dependency=true` 屬性來控制是否存在 Kotlin 標準函式庫。

> 編譯器引數 `-jdkHome` 和 `-no-stdlib` 仍然可用。
>
{style="note"}

#### 移除棄用的外掛程式 {id="removal-of-deprecated-plugins"}

在 Kotlin 1.4.0 中，`kotlin2js` 和 `kotlin-dce-plugin` 外掛程式已被棄用，並且在此版本中已被移除。請使用新的 `org.jetbrains.kotlin.js` 外掛程式代替 `kotlin2js`。正確配置 Kotlin/JS Gradle 外掛程式後，無效程式碼消除 (DCE) 即可正常運作。

在 Kotlin 1.6.0 中，我們將 `KotlinGradleSubplugin` 類別的棄用等級更改為 `ERROR`。開發者曾使用此類別撰寫編譯器外掛程式。在此版本中，[此類別已被移除](https://youtrack.jetbrains.com/issue/KT-48831/)。請改用 `KotlinCompilerPluginSupportPlugin` 類別。

> 最佳做法是在整個專案中使用版本為 1.7.0 及更高的 Kotlin 外掛程式。
>
{style="tip"}

#### 移除棄用的協同程式 DSL 選項和屬性 {id="removal-of-the-deprecated-coroutines-dsl-option-and-property"}

我們移除了棄用的 `kotlin.experimental.coroutines` Gradle DSL 選項和在 `gradle.properties` 中使用的 `kotlin.coroutines` 屬性。現在你只需使用 _[掛起函式](coroutines-basics.md)_，或在建置指令碼中[加入 `kotlinx.coroutines` 相依性](gradle-configure-project.md#set-a-dependency-on-a-kotlinx-library)。

在[協同程式指南](coroutines-guide.md)中了解關於協同程式的更多資訊。

#### 移除工具鏈擴充方法中的型別轉換 {id="removal-of-the-type-cast-in-the-toolchain-extension-method"}

在 Kotlin 1.7.0 之前，使用 Kotlin DSL 配置 Gradle 工具鏈時，必須型別轉換為 `JavaToolchainSpec` 類別：

```kotlin
kotlin {
    jvmToolchain {
        (this as JavaToolchainSpec).languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
    }
}
```

現在，你可以省略 `(this as JavaToolchainSpec)` 部分：

```kotlin
kotlin {
    jvmToolchain {
        languageVersion.set(JavaLanguageVersion.of(<MAJOR_JDK_VERSION>)
    }
}
```

## 遷移至 Kotlin 1.7.0 {id="migrating-to-kotlin-1-7-0"}

### 安裝 Kotlin 1.7.0 {id="install-kotlin-1-7-0"}

IntelliJ IDEA 2022.1 和 Android Studio Chipmunk (212) 會自動建議將 Kotlin 外掛程式更新至 1.7.0。

> 對於 IntelliJ IDEA 2022.2 以及 Android Studio Dolphin (213) 或 Android Studio Electric Eel (221)，Kotlin 外掛程式 1.7.0 將隨即將推出的 IntelliJ IDEA 和 Android Studio 更新一起提供。
> 
{style="note"}

新的命令列編譯器可在 [GitHub 發佈頁面](https://github.com/JetBrains/kotlin/releases/tag/v1.7.0)下載。

### 遷移現有專案或使用 Kotlin 1.7.0 建立新專案 {id="migrate-existing-or-start-a-new-project-with-kotlin-1-7-0"}

* 若要將現有專案遷移至 Kotlin 1.7.0，請將 Kotlin 版本變更為 `1.7.0` 並重新匯入 Gradle 或 Maven 專案。[了解如何更新至 Kotlin 1.7.0](releases.md#update-to-a-new-kotlin-version)。

* 若要使用 Kotlin 1.7.0 開始新專案，請更新 Kotlin 外掛程式並從 **File** | **New** | **Project** 執行專案精靈。

### Kotlin 1.7.0 相容性指南 {id="compatibility-guide-for-kotlin-1-7-0"}

Kotlin 1.7.0 是一個特性版本，因此可能會帶來與你針對該語言較早版本撰寫的程式碼不相容的變更。在 [Kotlin 1.7.0 相容性指南](compatibility-guide-17.md)中尋找此類變更的詳細清單。