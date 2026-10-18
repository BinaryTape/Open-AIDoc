[//]: # (title: Kotlin 1.6.20 的新功能)

<web-summary>閱讀 Kotlin 1.6.20 版本資訊，涵蓋新語言特性、Kotlin Multiplatform、JVM、Native、JS 的更新，以及 Gradle 和 Maven 的建置工具支援。</web-summary>

_[發布日期：2022 年 4 月 4 日](releases.md#release-history)_

Kotlin 1.6.20 帶來了未來語言特性的預覽、將階層結構設為多平台專案的預設設定，並為其他組件帶來了漸進式的改進。

您也可以在此影片中查看變更的簡要概述：

<video src="https://www.youtube.com/v/8F19ds109-o" title="What's new in Kotlin 1.6.20"/>

> 有關 Kotlin 發布週期的資訊，請參閱 [Kotlin 發布流程](releases.md)。
>
{style="tip"}

## 語言 {id="language"}

在 Kotlin 1.6.20 中，您可以試用兩個新的語言特性：

* [Kotlin/JVM 的上下文接收器（context receivers）原型](#prototype-of-context-receivers-for-kotlin-jvm)
* [絕對非空型別（Definitely non-nullable types）](#definitely-non-nullable-types)

### Kotlin/JVM 的上下文接收器原型 {id="prototype-of-context-receivers-for-kotlin-jvm"}

> 此功能僅為適用於 Kotlin/JVM 的原型。啟用 `-Xcontext-receivers` 後，
> 編譯器將產生無法用於正式環境程式碼的預發布二進制檔。
> 請僅在您的實驗性專案中使用上下文接收器。
> 歡迎在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 提供您的回饋。
>
{style="warning"}

在 Kotlin 1.6.20 中，您不再受限於只能擁有一個接收器。如果您需要更多接收器，可以在函式、屬性以及類別的宣告中加入上下文接收器，使其成為依賴上下文的（或稱_上下文相關的（contextual）_）。上下文宣告會執行以下操作：

* 要求所有宣告的上下文接收器作為隱式接收器存在於呼叫者的作用域中。
* 將宣告的上下文接收器作為隱式接收器引入其本體作用域中。

```kotlin
interface LoggingContext {
    val log: Logger // 此上下文提供對 logger 的參照 
}

context(LoggingContext)
fun startBusinessOperation() {
    // 您可以存取 log 屬性，因為 LoggingContext 是一個隱式接收器
    log.info("Operation has started")
}

fun test(loggingContext: LoggingContext) {
    with(loggingContext) {
        // 您需要在作用域中將 LoggingContext 作為隱式接收器，
        // 才能呼叫 startBusinessOperation()
        startBusinessOperation()
    }
}
```

要在您的專案中啟用上下文接收器，請使用 `-Xcontext-receivers` 編譯器選項。
您可以在 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/context-receivers.md#detailed-design) 中找到該功能及其語法的詳細說明。

請注意，此實作僅為原型：

* 啟用 `-Xcontext-receivers` 時，編譯器將產生無法在正式環境程式碼中使用的預發布二進制檔
* IDE 目前對上下文接收器的支援極為有限

歡迎在您的實驗專案中試用此功能，並在[此 YouTrack 問題](https://youtrack.jetbrains.com/issue/KT-42435)中與我們分享您的想法與經驗。
如果您遇到任何問題，請[回報新問題](https://kotl.in/issue)。

### 絕對非空型別 {id="definitely-non-nullable-types"}

> 絕對非空型別處於 [Beta](components-stability.md) 階段。它們幾乎已達到穩定狀態，
> 但未來可能需要遷移步驟。
> 我們將盡力將您必須進行的變更降至最低。
>
{style="warning"}

為了在繼承泛型 Java 類別與介面時提供更好的互通性，Kotlin 1.6.20 允許您在呼叫端使用新語法 `T & Any` 將泛型型別參數標記為絕對非空。
此語法形式源自[交集型別 (Intersection type)](https://en.wikipedia.org/wiki/Intersection_type) 的標記法，目前僅限於 `&` 左側為具有可空上限的型別參數，右側為非空的 `Any`：

```kotlin
fun <T> elvisLike(x: T, y: T & Any): T & Any = x ?: y

fun main() {
    // 正常
    elvisLike<String>("", "").length
    // 錯誤：'null' 不能作為非空型別的值
    elvisLike<String>("", null).length

    // 正常
    elvisLike<String?>(null, "").length
    // 錯誤：'null' 不能作為非空型別的值
    elvisLike<String?>(null, null).length
}
```
{validate="false"}

將語言版本設定為 `1.7` 以啟用此功能：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets.all {
        languageSettings.apply {
            languageVersion = "1.7"
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets.all {
        languageSettings {
            languageVersion = '1.7'
        }
    }
}
```

</tab>
</tabs>

在 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/definitely-non-nullable-types.md) 中深入了解絕對非空型別。

## Kotlin/JVM {id="kotlin-jvm"}

Kotlin 1.6.20 帶來了：

* JVM 介面中預設方法的相容性改進：[介面的新 `@JvmDefaultWithCompatibility` 註解](#new-jvmdefaultwithcompatibility-annotation-for-interfaces)以及 [`-Xjvm-default` 模式的相容性變更](#compatibility-changes-in-the-xjvm-default-modes)
* [支援在 JVM 後端中平行編譯單一模組](#support-for-parallel-compilation-of-a-single-module-in-the-jvm-backend)
* [支援對函式介面（Functional Interface）建構函式的可呼叫參照](#support-for-callable-references-to-functional-interface-constructors)

### 介面的新 @JvmDefaultWithCompatibility 註解 {id="new-jvmdefaultwithcompatibility-annotation-for-interfaces"}

Kotlin 1.6.20 引入了新的註解 [`@JvmDefaultWithCompatibility`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-default-with-compatibility/)：將其與 `-Xjvm-default=all` 編譯器選項搭配使用，[為任何 Kotlin 介面中的任何非抽象成員在 JVM 介面中建立預設方法](java-to-kotlin-interop.md#default-methods-in-interfaces)。

若有客戶端使用了未開啟 `-Xjvm-default=all` 選項編譯的 Kotlin 介面，它們可能與使用該選項編譯的程式碼產生二進制不相容。
在 Kotlin 1.6.20 之前，為避免此相容性問題，[建議的方法](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/#JvmDefaultWithoutCompatibility)是使用 `-Xjvm-default=all-compatibility` 模式，並在不需要此類相容性的介面上加上 `@JvmDefaultWithoutCompatibility` 註解。

這種方法有一些缺點：

* 當新增介面時，您很容易忘記加上註解。
* 通常非公開部分的介面數量多於公開 API，因此最終程式碼中的許多地方都會散落著這個註解。

現在，您可以使用 `-Xjvm-default=all` 模式並使用 `@JvmDefaultWithCompatibility` 註解標記介面。
這讓您可以一次性地將此註解新增至公開 API 中的所有介面，而對於新的非公開程式碼則無需使用任何註解。

在[此 YouTrack 票證](https://youtrack.jetbrains.com/issue/KT-48217)中留下您對這個新註解的回饋。

### -Xjvm-default 模式的相容性變更 {id="compatibility-changes-in-the-xjvm-default-modes"}

Kotlin 1.6.20 新增了以預設模式（`-Xjvm-default=disable` 編譯器選項）編譯模組以相容使用 `-Xjvm-default=all` 或 `-Xjvm-default=all-compatibility` 模式編譯模組的選項。
與之前相同，如果所有模組都使用 `-Xjvm-default=all` 或 `-Xjvm-default=all-compatibility` 模式，編譯也會成功。
您可以在此 [YouTrack 問題](https://youtrack.jetbrains.com/issue/KT-47000)中留下您的回饋。

Kotlin 1.6.20 棄用了編譯器選項 `-Xjvm-default` 的 `compatibility` 和 `enable` 模式。
關於相容性，其他模式的說明有所調整，但整體邏輯保持不變。
您可以查看[更新後的說明](java-to-kotlin-interop.md#compatibility-modes-for-default-methods)。

有關 Java 互通中預設方法的詳細資訊，請參閱[互通性文件](java-to-kotlin-interop.md#default-methods-in-interfaces)以及[此部落格文章](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/)。

### 支援在 JVM 後端中平行編譯單一模組 {id="support-for-parallel-compilation-of-a-single-module-in-the-jvm-backend"}

> 支援在 JVM 後端平行編譯單一模組為[實驗功能](components-stability.md)。
> 它可能隨時被移除或變更。需要明確選擇加入（詳見下文），且應僅用於評估目的。
> 歡迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-46085) 上向我們提供回饋。
>
{style="warning"}

我們正持續致力於[改善新 JVM IR 後端的編譯時間](https://youtrack.jetbrains.com/issue/KT-46768)。
在 Kotlin 1.6.20 中，我們新增了實驗性的 JVM IR 後端模式，以平行編譯模組中的所有檔案。
平行編譯最多可將總編譯時間縮短 15%。

透過[編譯器選項](compiler-reference.md#compiler-options) `-Xbackend-threads` 啟用實驗性的平行後端模式。
此選項可使用以下引數：

* `N` 代表您想要使用的執行緒數量。它不應大於您的 CPU 核心數；否則，由於執行緒之間的上下文切換，平行化將失去成效
* `0` 代表為每個 CPU 核心使用單獨的執行緒

[Gradle](gradle.md) 可以平行執行任務，但從 Gradle 的角度來看，當專案（或專案的主要部分）只是一個龐大的任務時，這種類型的平行化並沒有太大幫助。
如果您擁有非常龐大的單體模組，請使用平行編譯來加快編譯速度。
如果您的專案由許多小型模組組成，且建置已由 Gradle 進行平行處理，那麼增加另一層平行化反而可能因為上下文切換而損害效能。

> 平行編譯有一些限制：
> * 它無法與 [kapt](kapt.md) 搭配使用，因為 kapt 會停用 IR 後端
> * 根據設計，它需要更多的 JVM 堆積。堆積量與執行緒數量成正比
>
{style="note"}

### 支援對函式介面建構函式的可呼叫參照 {id="support-for-callable-references-to-functional-interface-constructors"}

> 支援對函式介面建構函式的可呼叫參照為[實驗功能](components-stability.md)。
> 它可能隨時被移除或變更。需要明確選擇加入（詳見下文），且應僅用於評估目的。
> 歡迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-47939) 上向我們提供回饋。
>
{style="warning"}

支援對函式介面建構函式的[可呼叫參照](fun-interfaces.md#migration-from-an-interface-with-constructor-function-to-a-functional-interface)，提供了一種原始碼相容的方式，從帶有建構函式的介面遷移到[函式介面](fun-interfaces.md)。

請考慮以下程式碼：

```kotlin
interface Printer {
    fun print()
}

fun Printer(block: () -> Unit): Printer = object : Printer { override fun print() = block() }
```

啟用對函式介面建構函式的可呼叫參照後，此程式碼可以直接替換為函式介面宣告：

```kotlin
fun interface Printer {
    fun print()
}
```

其建構函式將會隱式建立，任何使用 `::Printer` 函式參照的程式碼都能正常編譯。例如：

```kotlin
documentsStorage.addPrinter(::Printer)
```
{validate="false"}

若要保留二進制相容性，可使用帶有 `DeprecationLevel.HIDDEN` 的 [`@Deprecated`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-deprecated/) 註解標記舊函式 `Printer`：

```kotlin
@Deprecated(message = "Your message about the deprecation", level = DeprecationLevel.HIDDEN)
fun Printer(...) {...}
```
{validate="false"}

使用編譯器選項 `-XXLanguage:+KotlinFunInterfaceConstructorReference` 來啟用此功能。

## Kotlin/Native {id="kotlin-native"}

Kotlin/Native 1.6.20 標誌著其新組件的持續發展。我們朝著在各平台上獲得一致的 Kotlin 體驗又邁進了一步：

* [新記憶體管理員的最新進展](#an-update-on-the-new-memory-manager)
* [新記憶體管理員中清除階段（sweep phase）的並行實作](#concurrent-implementation-for-the-sweep-phase-in-new-memory-manager)
* [註解類別的具現化](#instantiation-of-annotation-classes)
* [與 Swift async/await 互通：傳回 Swift 的 Void 而非 KotlinUnit](#interop-with-swift-async-await-returning-void-instead-of-kotlinunit)
* [透過 libbacktrace 提供更好的堆疊追蹤](#better-stack-traces-with-libbacktrace)
* [支援獨立的 Android 可執行檔](#support-for-standalone-android-executables)
* [效能提升](#performance-improvements)
* [改進匯入 cinterop 模組時的錯誤處理](#improved-error-handling-during-cinterop-modules-import)
* [支援 Xcode 13 程式庫](#support-for-xcode-13-libraries)

### 新記憶體管理員的最新進展 {id="an-update-on-the-new-memory-manager"}

> 新的 Kotlin/Native 記憶體管理員處於 [Alpha](components-stability.md) 階段。
> 它可能會發生不相容的變更，並在未來需要手動遷移。
> 歡迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-48525) 上向我們提供回饋。
>
{style="note"}

在 Kotlin 1.6.20 中，您可以試用新 Kotlin/Native 記憶體管理員的 Alpha 版本。
它消除了 JVM 與 Native 平台之間的差異，在多平台專案中提供一致的開發者體驗。
例如，您在建立可同時在 Android 和 iOS 上運作的全新跨平台行動應用程式時會更加輕鬆。

新的 Kotlin/Native 記憶體管理員解除了執行緒之間物件共享的限制。
它還提供了無洩漏的並行程式設計基本型別，這些基本型別既安全又不需要任何特殊的管理或註解。

新的記憶體管理員將在未來版本中成為預設設定，因此我們鼓勵您現在就嘗試使用它。
請參閱我們的[部落格文章](https://blog.jetbrains.com/kotlin/2021/08/try-the-new-kotlin-native-memory-manager-development-preview/)以進一步了解新的記憶體管理員並探索示範專案，或直接跳至[遷移說明](https://github.com/JetBrains/kotlin/blob/master/kotlin-native/NEW_MM.md)親自嘗試。

嘗試在您的專案中使用新的記憶體管理員以了解其運作方式，並在我們的情緒追蹤器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-48525) 中分享回饋。

### 新記憶體管理員中清除階段的並行實作 {id="concurrent-implementation-for-the-sweep-phase-in-new-memory-manager"}

如果您已經切換到我們[在 Kotlin 1.6 中宣布](whatsnew16.md#preview-of-the-new-memory-manager)的新記憶體管理員，您可能會注意到執行時間的大幅改善：我們的效能基準測試顯示平均提升了 35%。
從 1.6.20 開始，新記憶體管理員還提供了清除階段的並行實作。
這也應該能提高效能並縮短垃圾收集器的暫停時間。

若要為新的 Kotlin/Native 記憶體管理員啟用此功能，請傳遞以下編譯器選項：

```bash
-Xgc=cms 
```

歡迎在[此 YouTrack 問題](https://youtrack.jetbrains.com/issue/KT-48526)中分享您對新記憶體管理員效能的回饋。

### 註解類別的具現化 {id="instantiation-of-annotation-classes"}

在 Kotlin 1.6.0 中，註解類別的具現化在 Kotlin/JVM 和 Kotlin/JS 上已達到[穩定 (Stable)](components-stability.md)。
1.6.20 版本為 Kotlin/Native 提供了支援。

深入了解[註解類別的具現化](annotations.md#instantiation)。

### 與 Swift async/await 互通：傳回 Void 而非 KotlinUnit {id="interop-with-swift-async-await-returning-void-instead-of-kotlinunit"}

> 與 Swift async/await 的並行互通性為[實驗功能](components-stability.md)。它可能隨時被移除或變更。
> 應僅用於評估目的。歡迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-47610) 上向我們提供回饋。
>
{style="warning"}

我們繼續致力於[與 Swift async/await 的實驗性互通](whatsnew1530.md#experimental-interoperability-with-swift-5-5-async-await)（自 Swift 5.5 起可用）。
Kotlin 1.6.20 與先前版本的不同之處在於其處理傳回型別為 `Unit` 的 `suspend` 函式的方式。

以前，此類函式在 Swift 中顯示為傳回 `KotlinUnit` 的 `async` 函式。然而，類似於非掛起函式，它們適當的傳回型別應為 `Void`。

為避免破壞現有程式碼，我們引入了一個 Gradle 屬性，讓編譯器將傳回 `Unit` 的掛起函式轉譯為傳回型別為 `Void` 的 `async` Swift 函式：

```none
# gradle.properties
kotlin.native.binary.unitSuspendFunctionObjCExport=proper
```

我們計劃在未來的 Kotlin 版本中將此行為設為預設。

### 透過 libbacktrace 提供更好的堆疊追蹤 {id="better-stack-traces-with-libbacktrace"}

> 使用 libbacktrace 解析原始碼位置為[實驗功能](components-stability.md)。它可能隨時被移除或變更。
> 應僅用於評估目的。歡迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-48424) 上向我們提供回饋。
>
{style="warning"}

Kotlin/Native 現在能夠產生帶有檔案位置和行號的詳細堆疊追蹤，
以改善 `linux*`（`linuxMips32` 和 `linuxMipsel32` 除外）和 `androidNative*` 目標的偵錯體驗。

此功能在底層使用了 [libbacktrace](https://github.com/ianlancetaylor/libbacktrace) 程式庫。
請參考以下程式碼以查看差異範例：

```kotlin
fun main() = bar()
fun bar() = baz()
inline fun baz() {
    error("")
}
```

* **1.6.20 之前：**

```text
Uncaught Kotlin exception: kotlin.IllegalStateException:
   at 0   example.kexe        0x227190       kfun:kotlin.Throwable#<init>(kotlin.String?){} + 96
   at 1   example.kexe        0x221e4c       kfun:kotlin.Exception#<init>(kotlin.String?){} + 92
   at 2   example.kexe        0x221f4c       kfun:kotlin.RuntimeException#<init>(kotlin.String?){} + 92
   at 3   example.kexe        0x22234c       kfun:kotlin.IllegalStateException#<init>(kotlin.String?){} + 92
   at 4   example.kexe        0x25d708       kfun:#bar(){} + 104
   at 5   example.kexe        0x25d68c       kfun:#main(){} + 12
```
{initial-collapse-state="collapsed" collapsible="true"}

* **使用 libbacktrace 的 1.6.20：**

```text
Uncaught Kotlin exception: kotlin.IllegalStateException:
   at 0   example.kexe        0x229550    kfun:kotlin.Throwable#<init>(kotlin.String?){} + 96 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Throwable.kt:24:37)
   at 1   example.kexe        0x22420c    kfun:kotlin.Exception#<init>(kotlin.String?){} + 92 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:23:44)
   at 2   example.kexe        0x22430c    kfun:kotlin.RuntimeException#<init>(kotlin.String?){} + 92 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:34:44)
   at 3   example.kexe        0x22470c    kfun:kotlin.IllegalStateException#<init>(kotlin.String?){} + 92 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:70:44)
   at 4   example.kexe        0x25fac8    kfun:#bar(){} + 104 [inlined] (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/libraries/stdlib/src/kotlin/util/Preconditions.kt:143:56)
   at 5   example.kexe        0x25fac8    kfun:#bar(){} + 104 [inlined] (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:4:5)
   at 6   example.kexe        0x25fac8    kfun:#bar(){} + 104 (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:2:13)
   at 7   example.kexe        0x25fa4c    kfun:#main(){} + 12 (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:1:14)
```
{initial-collapse-state="collapsed" collapsible="true"}

在 Apple 目標上（其堆疊追蹤中原本就包含檔案位置和行號），libbacktrace 為內嵌函式呼叫提供了更多詳細資訊：

* **1.6.20 之前：**

```text
Uncaught Kotlin exception: kotlin.IllegalStateException:
   at 0   example.kexe    0x10a85a8f8    kfun:kotlin.Throwable#<init>(kotlin.String?){} + 88 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Throwable.kt:24:37)
   at 1   example.kexe    0x10a855846    kfun:kotlin.Exception#<init>(kotlin.String?){} + 86 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:23:44)
   at 2   example.kexe    0x10a855936    kfun:kotlin.RuntimeException#<init>(kotlin.String?){} + 86 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:34:44)
   at 3   example.kexe    0x10a855c86    kfun:kotlin.IllegalStateException#<init>(kotlin.String?){} + 86 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:70:44)
   at 4   example.kexe    0x10a8489a5    kfun:#bar(){} + 117 (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:2:1)
   at 5   example.kexe    0x10a84891c    kfun:#main(){} + 12 (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:1:14)
...
```
{initial-collapse-state="collapsed" collapsible="true"}

* **使用 libbacktrace 的 1.6.20：**

```text
Uncaught Kotlin exception: kotlin.IllegalStateException:
   at 0   example.kexe    0x10669bc88    kfun:kotlin.Throwable#<init>(kotlin.String?){} + 88 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Throwable.kt:24:37)
   at 1   example.kexe    0x106696bd6    kfun:kotlin.Exception#<init>(kotlin.String?){} + 86 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:23:44)
   at 2   example.kexe    0x106696cc6    kfun:kotlin.RuntimeException#<init>(kotlin.String?){} + 86 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:34:44)
   at 3   example.kexe    0x106697016    kfun:kotlin.IllegalStateException#<init>(kotlin.String?){} + 86 (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/kotlin-native/runtime/src/main/kotlin/kotlin/Exceptions.kt:70:44)
   at 4   example.kexe    0x106689d35    kfun:#bar(){} + 117 [inlined] (/opt/buildAgent/work/c3a91df21e46e2c8/kotlin/libraries/stdlib/src/kotlin/util/Preconditions.kt:143:56)
>>  at 5   example.kexe    0x106689d35    kfun:#bar(){} + 117 [inlined] (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:4:5)
   at 6   example.kexe    0x106689d35    kfun:#bar(){} + 117 (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:2:13)
   at 7   example.kexe    0x106689cac    kfun:#main(){} + 12 (/private/tmp/backtrace/src/commonMain/kotlin/app.kt:1:14)
...
```
{initial-collapse-state="collapsed" collapsible="true"}

若要使用 libbacktrace 產生更好的堆疊追蹤，請在 `gradle.properties` 中加入以下內容：

```none
# gradle.properties
kotlin.native.binary.sourceInfoType=libbacktrace
```

歡迎在[此 YouTrack 問題](https://youtrack.jetbrains.com/issue/KT-48424)中告訴我們您使用 libbacktrace 進行 Kotlin/Native 偵錯的體驗。

### 支援獨立的 Android 可執行檔 {id="support-for-standalone-android-executables"}

先前，Kotlin/Native 中的 Android Native 可執行檔實際上不是可執行檔，而是可用作 NativeActivity 的共用程式庫。現在，您可以為 Android Native 目標產生標準的可執行檔。

為此，請在專案的 `build.gradle(.kts)` 部分設定 `androidNative` 目標的 executable 區塊。
新增以下二進制選項：

```kotlin
kotlin {
    androidNativeX64("android") {
        binaries {
            executable {
                binaryOptions["androidProgramType"] = "standalone"
            }
        }
    }
}
```

請注意，此功能將在 Kotlin 1.7.0 中成為預設設定。
如果您想保留目前的行為，請使用以下設定：

```kotlin
binaryOptions["androidProgramType"] = "nativeActivity"
```

感謝 Mattia Iavarone 的[實作](https://github.com/jetbrains/kotlin/pull/4624)！

### 效能提升 {id="performance-improvements"}

我們正在 Kotlin/Native 上努力[加快編譯過程](https://youtrack.jetbrains.com/issue/KT-42294)並改善您的開發體驗。

Kotlin 1.6.20 帶來了一些效能更新和錯誤修復，這些影響了 Kotlin 所產生的 LLVM IR。
根據我們內部專案的效能基準測試，我們平均實現了以下效能提升：

* 執行時間縮短 15%
* Release 和 Debug 二進制檔的程式碼大小均縮小 20%
* Release 二進制檔的編譯時間縮短 26%

這些變更還使大型內部專案中 Debug 二進制檔的編譯時間縮短了 10%。

為了達成此目標，我們為部分由編譯器產生的合成物件實作了靜態初始化、改進了為每個函式組織 LLVM IR 的方式，並最佳化了編譯器快取。

### 改進匯入 cinterop 模組時的錯誤處理 {id="improved-error-handling-during-cinterop-modules-import"}

此版本針對使用 `cinterop` 工具匯入 Objective-C 模組的情況（這在 CocoaPods pods 中很常見）改進了錯誤處理。
以前，如果在嘗試處理 Objective-C 模組時遇到錯誤（例如處理標頭檔中的編譯錯誤時），您會收到不明確的錯誤訊息，例如 `fatal error: could not build module $name`。
我們擴充了 `cinterop` 工具的這部分，因此您將收到帶有詳細描述的錯誤訊息。

### 支援 Xcode 13 程式庫 {id="support-for-xcode-13-libraries"}

隨 Xcode 13 提供的程式庫自此版本起獲得完整支援。
您可以隨時從 Kotlin 程式碼中的任何位置存取它們。

## Kotlin Multiplatform {id="kotlin-multiplatform"}

1.6.20 為 Kotlin Multiplatform 帶來了以下值得注意的更新：

* [所有新的多平台專案現在預設支援階層結構](#hierarchical-structure-support-for-multiplatform-projects)
* [Kotlin CocoaPods Gradle 外掛程式獲得了數個用於 CocoaPods 整合的實用功能](#kotlin-cocoapods-gradle-plugin)

### 多平台專案支援階層結構 {id="hierarchical-structure-support-for-multiplatform-projects"}

Kotlin 1.6.20 預設啟用了階層結構支援。
自從[在 Kotlin 1.4.0 中引入它](whatsnew14.md#sharing-code-in-several-targets-with-the-hierarchical-project-structure)以來，我們顯著改善了前端，並使 IDE 匯入功能保持穩定。

以前，在多平台專案中新增程式碼有兩種方式。第一種是將其插入特定平台的原始碼集中，這受限於單一目標，無法被其他平台重複使用。
第二種是使用在 Kotlin 目前支援的所有平台之間共享的通用原始碼集。

現在，您可以在多個相似的原生目標之間[共用原始碼](#better-code-sharing-in-your-project)，這些目標重複使用了許多通用邏輯和第三方 API。
該技術將提供正確的預設相依性，並找到共用程式碼中可用的確切 API。
這消除了複雜的組建設定，並且無需使用融通方法即可在原生目標之間共用原始碼集時獲得 IDE 支援。
它還有助於防止在非預期的目標上發生不安全的 API 使用。

該技術對[程式庫作者](#more-opportunities-for-library-authors)也將非常有用，因為階層專案結構允許他們發布和取用具有針對部分目標子集通用 API 的程式庫。

預設情況下，使用階層專案結構發布的程式庫僅與具備階層結構的專案相容。

#### 在專案中更好地共用程式碼 {id="better-code-sharing-in-your-project"}

如果沒有階層結構支援，就沒有直接的方法可以在_某些_而非_所有_ [Kotlin 目標](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#targets)之間共用程式碼。
一個常見的例子是在所有 iOS 目標之間共用程式碼，並存取特定於 iOS 的[相依性](https://kotlinlang.org/docs/multiplatform/multiplatform-share-on-platforms.html#connect-platform-specific-libraries)（如 Foundation）。

得益於階層專案結構的支援，您現在可以開箱即用地實現這一點。
在新結構中，原始碼集構成了階層結構。
您可以使用給定原始碼集編譯至的每個目標所提供的平台專用語言特性與相依性。

例如，考慮一個具有兩個目標的典型多平台專案——適用於 iOS 裝置和模擬器的 `iosArm64` 與 `iosX64`。
Kotlin 工具鏈能夠理解這兩個目標具有相同的函式，並允許您從中繼原始碼集 `iosMain` 存取該函式。

![iOS 階層範例](ios-hierarchy-example.jpg){width=700}

Kotlin 工具鏈提供了正確的預設相依性，例如 Kotlin/Native stdlib 或原生程式庫。
此外，Kotlin 工具鏈將盡力找出共用程式碼中可用的確切 API 涵蓋範圍。
這可以防止例如在為 Windows 共用的程式碼中使用 macOS 專用函式的情況。

#### 為程式庫作者提供更多機會 {id="more-opportunities-for-library-authors"}

發布多平台程式庫時，其中繼原始碼集的 API 現在會隨之正確發布，從而可供取用者使用。
同樣地，Kotlin 工具鏈將自動確定取用者原始碼集中可用的 API，同時仔細防範不安全的使用行為，例如在 JS 程式碼中使用專用於 JVM 的 API。
進一步了解[在程式庫中共用程式碼](https://kotlinlang.org/docs/multiplatform/multiplatform-share-on-platforms.html#share-code-in-libraries)。

#### 配置與設定 {id="configuration-and-setup"}

從 Kotlin 1.6.20 開始，所有新的多平台專案都將採用階層專案結構。無需其他額外設定。

* 如果您已經[手動開啟它](https://kotlinlang.org/docs/multiplatform/multiplatform-share-on-platforms.html#share-code-on-similar-platforms)，則可以從 `gradle.properties` 中移除已棄用的選項：

  ```none
  # gradle.properties
  kotlin.mpp.enableGranularSourceSetsMetadata=true
  kotlin.native.enableDependencyPropagation=false // 或 'true'，取決於您先前的設定
  ```

* 對於 Kotlin 1.6.20，我們建議使用 [Android Studio 2021.1.1](https://developer.android.com/studio) (Bumblebee) 或更高版本，以獲得最佳體驗。

* 您也可以選擇退出。若要停用階層結構支援，請在 `gradle.properties` 中設定以下選項：

  ```none
  # gradle.properties
  kotlin.mpp.hierarchicalStructureSupport=false
  ```

#### 提供您的回饋 {id="leave-your-feedback"}

這是對整個生態系統的重大變革。我們非常歡迎您的回饋，以協助我們做得更好。

立即試用並將您遇到的任何問題回報至[我們的問題追蹤器](https://kotl.in/issue)。

### Kotlin CocoaPods Gradle 外掛程式 {id="kotlin-cocoapods-gradle-plugin"}

為了簡化 CocoaPods 整合，Kotlin 1.6.20 提供了以下功能：

* CocoaPods 外掛程式現在具備建置包含所有已註冊目標的 XCFramework 並產生 Podspec 檔案的任務。當您不想直接與 Xcode 整合，但希望建置構件並將其部署到本機 CocoaPods 存儲庫時，這非常有用。
  
  深入了解[建置 XCFramework](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html#build-xcframeworks)。

* 如果您在專案中使用 [CocoaPods 整合](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html)，通常需要為整個 Gradle 專案指定所需的 Pod 版本。現在您有更多選擇：
  * 直接在 `cocoapods` 區塊中指定 Pod 版本
  * 繼續使用 Gradle 專案版本
  
  如果這兩個屬性皆未設定，您將會收到錯誤。

* 您現在可以在 `cocoapods` 區塊中設定 CocoaPod 名稱，而無需更改整個 Gradle 專案的名稱。

* CocoaPods 外掛程式引入了新的 `extraSpecAttributes` 屬性，您可以使用它來設定 Podspec 檔案中先前硬編碼的屬性，例如 `libraries` 或 `vendored_frameworks`。

```kotlin
kotlin {
    cocoapods {
        version = "1.0"
        name = "MyCocoaPod"
        extraSpecAttributes["social_media_url"] = 'https://twitter.com/kotlin'
        extraSpecAttributes["vendored_frameworks"] = 'CustomFramework.xcframework'
        extraSpecAttributes["libraries"] = 'xml'
    }
}
```

查看完整的 Kotlin CocoaPods Gradle 外掛程式 [DSL 參考](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-dsl-reference.html)。

## Kotlin/JS {id="kotlin-js"}

1.6.20 中的 Kotlin/JS 改進主要影響 IR 編譯器：

* [開發二進制檔的增量編譯 (IR)](#incremental-compilation-for-development-binaries-with-ir-compiler)
* [頂層屬性預設採用延遲載入 (IR)](#lazy-initialization-of-top-level-properties-by-default-with-ir-compiler)
* [專案模組預設產生個別的 JS 檔案 (IR)](#separate-js-files-for-project-modules-by-default-with-ir-compiler)
* [Char 類別最佳化 (IR)](#char-class-optimization)
* [匯出改進（IR 和舊版後端）](#improvements-to-export-and-typescript-declaration-generation)
* [針對非同步測試的 @AfterTest 保證](#aftertest-guarantees-for-asynchronous-tests)

### 使用 IR 編譯器對開發二進制檔進行增量編譯 {id="incremental-compilation-for-development-binaries-with-ir-compiler"}

為了使搭配 IR 編譯器的 Kotlin/JS 開發更有效率，我們引入了新的_增量編譯_模式。

在此模式下使用 `compileDevelopmentExecutableKotlinJs` Gradle 任務建置**開發二進制檔**時，編譯器會在模組層級快取先前的編譯結果。
它會在後續編譯中對未變更的原始檔使用快取的編譯結果，從而加快編譯完成的速度，尤其是對於微小的變更。
請注意，此改進專門針對開發流程（縮短編輯-建置-偵錯週期），不會影響正式環境產物的建置。

若要為開發二進制檔啟用增量編譯，請將以下行新增至專案的 `gradle.properties`：

```none
# gradle.properties
kotlin.incremental.js.ir=true // 預設為 false
```

在我們的測試專案中，新模式使增量編譯速度提升高達 30%。然而，由於需要建立並填入快取，在此模式下進行全新建置（clean build）會變慢。

歡迎在[此 YouTrack 問題](https://youtrack.jetbrains.com/issue/KT-50203)中告訴我們您在 Kotlin/JS 專案中使用增量編譯的想法。

### 使用 IR 編譯器將頂層屬性預設設為延遲初始化 {id="lazy-initialization-of-top-level-properties-by-default-with-ir-compiler"}

在 Kotlin 1.4.30 中，我們展示了 JS IR 編譯器中[頂層屬性延遲初始化](whatsnew1430.md#lazy-initialization-of-top-level-properties)的原型。
透過消除應用程式啟動時初始化所有屬性的需求，延遲初始化縮短了啟動時間。
我們的測量結果顯示，在實際的 Kotlin/JS 應用程式中速度約提升了 10%。

現在，經過完善與充分測試，我們將延遲初始化設為 IR 編譯器中頂層屬性的預設設定。

```kotlin
// 延遲初始化
val a = run {
    val result = // 密集運算
        println(result)
    result
} // run 在首次使用該變數時執行
```

如果出於某種原因需要急切初始化（eagerly，在應用程式啟動時）某個屬性，請使用 [`@EagerInitialization`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.native/-eager-initialization/) 註解對其進行標記。

### 使用 IR 編譯器預設為專案模組分離 JS 檔案 {id="separate-js-files-for-project-modules-by-default-with-ir-compiler"}

以前，JS IR 編譯器提供了為專案模組[產生個別 `.js` 檔案的能力](https://youtrack.jetbrains.com/issue/KT-44319)。
這是預設選項（為整個專案產生單一 `.js` 檔案）的替代方案。
該單一檔案可能過大且不便於使用，因為每當您想使用專案中的某個函式時，都必須包含整個 JS 檔案作為相依項。
擁有多個檔案增加了彈性並縮小了此類相依項的大小。此功能先前可透過 `-Xir-per-module` 編譯器選項使用。

從 1.6.20 開始，JS IR 編譯器預設為專案模組產生個別的 `.js` 檔案。

現在可以使用以下 Gradle 屬性將專案編譯為單一 `.js` 檔案：

```none
# gradle.properties
kotlin.js.ir.output.granularity=whole-program // `per-module` 為預設值
```

在先前的版本中，實驗性的逐模組（per-module）模式（透過 `-Xir-per-module=true` 旗標啟用）會調用每個模組中的 `main()` 函式。這與常規的單一 `.js` 模式不一致。從 1.6.20 開始，在這兩種情況下都只會在主模組中調用 `main()` 函式。如果您確實需要在載入模組時執行某些程式碼，可以使用標有 `@EagerInitialization` 註解的頂層屬性。請參閱[頂層屬性預設採用延遲載入 (IR)](#lazy-initialization-of-top-level-properties-by-default-with-ir-compiler)。

### Char 類別最佳化 {id="char-class-optimization"}

現在 Kotlin/JS 編譯器在處理 `Char` 類別時不會引入裝箱（boxing）（類似於[內嵌類別 (inline classes)](inline-classes.md)）。
這加速了 Kotlin/JS 程式碼中字元的操作。

除了效能提升外，這也改變了 `Char` 匯出至 JavaScript 的方式：現在它會被轉譯為 `Number`。

### 匯出及 TypeScript 宣告產生的改進 {id="improvements-to-export-and-typescript-declaration-generation"}

Kotlin 1.6.20 為匯出機制（[`@JsExport`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-js-export/) 註解）帶來了多項修正與改進，包括 [TypeScript 宣告檔案（`.d.ts`）的產生](js-project-setup.md#generation-of-typescript-declaration-files-d-ts)。
我們新增了匯出介面和列舉的功能，並修正了先前向我們回報的一些邊緣情況下的匯出行為。
欲了解更多詳情，請參閱 [YouTrack 中的匯出改進清單](https://youtrack.jetbrains.com/issues?q=Project:%20Kotlin%20issue%20id:%20KT-45434,%20KT-44494,%20KT-37916,%20KT-43191,%20KT-46961,%20KT-40236)。

進一步了解[從 JavaScript 使用 Kotlin 程式碼](js-to-kotlin-interop.md)。

### 針對非同步測試的 @AfterTest 保證 {id="aftertest-guarantees-for-asynchronous-tests"}

Kotlin 1.6.20 使 [`@AfterTest`](https://kotlinlang.org/api/latest/kotlin.test/kotlin.test/-after-test/) 函式能夠在 Kotlin/JS 上的非同步測試中正常運作。
如果測試函式的傳回型別靜態解析為 [`Promise`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-promise/)，編譯器現在會將 `@AfterTest` 函式的執行排程到對應的 [`then()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-promise/then.html) 回呼中。

## 安全性 {id="security"}

Kotlin 1.6.20 引入了幾項功能來提升程式碼的安全性：

* [在 klib 中使用相對路徑](#using-relative-paths-in-klibs)
* [保留 Kotlin/JS Gradle 專案的 yarn.lock](#persisting-yarn-lock-for-kotlin-js-gradle-projects)
* [預設使用 `--ignore-scripts` 安裝 npm 相依性](#installation-of-npm-dependencies-with-ignore-scripts-by-default)

### 在 klib 中使用相對路徑 {id="using-relative-paths-in-klibs"}

`klib` 格式的程式庫[包含](native-libraries.md#library-format)原始碼檔案的序列化 IR 表示形式，其中還包含它們的路徑以產生適當的偵錯資訊。
在 Kotlin 1.6.20 之前，儲存的檔案路徑為絕對路徑。由於程式庫作者可能不想公開絕對路徑，因此 1.6.20 版本提供了一個替代選項。

如果您要發布 `klib` 並且只想在成品中使用原始碼檔案的相對路徑，現在可以傳遞帶有一個或多個原始檔基本路徑的 `-Xklib-relative-path-base` 編譯器選項：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType(org.jetbrains.kotlin.gradle.dsl.KotlinCompile::class).configureEach {
    // $base 為原始碼檔案的基本路徑
    kotlinOptions.freeCompilerArgs += "-Xklib-relative-path-base=$base"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.withType(org.jetbrains.kotlin.gradle.dsl.KotlinCompile).configureEach {
    kotlinOptions {
        // $base 為原始碼檔案的基本路徑
        freeCompilerArgs += "-Xklib-relative-path-base=$base"
    }
}
``` 

</tab>
</tabs>

### 保留 Kotlin/JS Gradle 專案的 yarn.lock {id="persisting-yarn-lock-for-kotlin-js-gradle-projects"}

> 該功能已反向移植到 Kotlin 1.6.10。
>
{style="note"}

Kotlin/JS Gradle 外掛程式現在提供了保留 `yarn.lock` 檔案的功能，讓您無需額外的 Gradle 設定即可鎖定專案的 npm 相依性版本。
該功能透過在專案根目錄中新增自動產生的 `kotlin-js-store` 目錄，為預設專案結構帶來了變更。
該目錄中包含 `yarn.lock` 檔案。

我們強烈建議將 `kotlin-js-store` 目錄及其內容提交到您的版本控制系統中。
將 lockfile 提交到您的版本控制系統是一項[推薦的最佳實務](https://classic.yarnpkg.com/blog/2016/11/24/lockfiles-for-all/)，因為它可確保您的應用程式在所有電腦上使用完全相同的相依性樹進行建置，無論這些電腦是其他機器上的開發環境還是 CI/CD 服務。
Lockfile 還可以防止在新的電腦上檢出專案時靜默更新 npm 相依性，這是一個潛在的安全性問題。

諸如 [Dependabot](https://github.com/dependabot) 之類的工具也可以剖析 Kotlin/JS 專案的 `yarn.lock` 檔案，並在您依賴的任何 npm 套件受到安全威脅時向您發出警告。

如果需要，您可以在組建指令碼中更改目錄名稱和 lockfile 名稱：

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

> 變更 lockfile 的名稱可能會導致相依性檢查工具無法再識別該檔案。
> 
{style="warning"}

### 預設使用 --ignore-scripts 安裝 npm 相依性 {id="installation-of-npm-dependencies-with-ignore-scripts-by-default"}

> 該功能已反向移植到 Kotlin 1.6.10。
>
{style="note"}

Kotlin/JS Gradle 外掛程式現在預設在安裝 npm 相依性期間阻止執行[生命週期指令碼 (lifecycle scripts)](https://docs.npmjs.com/cli/v8/using-npm/scripts#life-cycle-scripts)。
此變更旨在降低執行來自受入侵 npm 套件之惡意程式碼的可能性。

若要回復為先前的設定，您可以透過在 `build.gradle(.kts)` 中新增以下內容來明確啟用生命週期指令碼的執行：

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

深入了解 [Kotlin/JS Gradle 專案的 npm 相依性](js-project-setup.md#npm-dependencies)。

## Gradle {id="gradle"}

Kotlin 1.6.20 為 Kotlin Gradle 外掛程式帶來了以下變更：

* 用於定義 Kotlin 編譯器執行策略的新[屬性 `kotlin.compiler.execution.strategy` 和 `compilerExecutionStrategy`](#properties-for-defining-kotlin-compiler-execution-strategy)
* [棄用選項 `kapt.use.worker.api`、`kotlin.experimental.coroutines` 和 `kotlin.coroutines`](#deprecation-of-build-options-for-kapt-and-coroutines)
* [移除 `kotlin.parallel.tasks.in.project` 建置選項](#removal-of-the-kotlin-parallel-tasks-in-project-build-option)

### 用於定義 Kotlin 編譯器執行策略的屬性 {id="properties-for-defining-kotlin-compiler-execution-strategy"}

在 Kotlin 1.6.20 之前，您使用系統屬性 `-Dkotlin.compiler.execution.strategy` 來定義 Kotlin 編譯器執行策略。
該屬性在某些情況下可能不太方便。
Kotlin 1.6.20 引入了同名的 Gradle 屬性 `kotlin.compiler.execution.strategy` 以及編譯任務屬性 `compilerExecutionStrategy`。

系統屬性仍然有效，但在未來的版本中將會被移除。

目前屬性的優先級如下：

* 任務屬性 `compilerExecutionStrategy` 優先於系統屬性和 Gradle 屬性 `kotlin.compiler.execution.strategy`。
* Gradle 屬性優先於系統屬性。

您可以為這些屬性指派三種編譯器執行策略：

| 策略            | Kotlin 編譯器執行位置                | 增量編譯 | 其他特點                                                               |
|-----------------|--------------------------------------|---------|------------------------------------------------------------------------|
| Daemon          | 在其自有的常駐處理程序（daemon process）內 | 是       | *預設策略*。可以在不同的 Gradle daemon 之間共享                          |
| In process      | 在 Gradle daemon 處理程序內           | 否       | 可能會與 Gradle daemon 共享堆積                                        |
| Out of process  | 每次呼叫都在單獨的處理程序中           | 否       | —                                                                      |

因此，`kotlin.compiler.execution.strategy` 屬性（系統屬性與 Gradle 屬性皆然）的可用值為：
1. `daemon`（預設）
2. `in-process`
3. `out-of-process`

在 `gradle.properties` 中使用 Gradle 屬性 `kotlin.compiler.execution.strategy`：

```none
# gradle.properties
kotlin.compiler.execution.strategy=out-of-process
```

`compilerExecutionStrategy` 任務屬性的可用值為：

1. `org.jetbrains.kotlin.gradle.tasks.KotlinCompilerExecutionStrategy.DAEMON`（預設）
2. `org.jetbrains.kotlin.gradle.tasks.KotlinCompilerExecutionStrategy.IN_PROCESS`
3. `org.jetbrains.kotlin.gradle.tasks.KotlinCompilerExecutionStrategy.OUT_OF_PROCESS`

在 `build.gradle.kts` 建置指令碼中使用任務屬性 `compilerExecutionStrategy`：

```kotlin
import org.jetbrains.kotlin.gradle.dsl.KotlinCompile
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilerExecutionStrategy

// ...

tasks.withType<KotlinCompile>().configureEach {
    compilerExecutionStrategy.set(KotlinCompilerExecutionStrategy.IN_PROCESS)
}
```

請在[此 YouTrack 任務](https://youtrack.jetbrains.com/issue/KT-49299)中留下您的回饋。

### 棄用 kapt 和 coroutines 的建置選項 {id="deprecation-of-build-options-for-kapt-and-coroutines"}

在 Kotlin 1.6.20 中，我們變更了以下屬性的棄用層級：

* 我們棄用了透過帶有 `kapt.use.worker.api` 的 Kotlin daemon 執行 [kapt](kapt.md) 的功能——現在它會向 Gradle 輸出產生警告。
  自 1.3.70 版本起，[kapt 預設一直使用 Gradle workers](kapt.md#run-kapt-tasks-in-parallel)，我們建議堅持使用此方法。

  我們將在未來的版本中移除 `kapt.use.worker.api` 選項。

* 我們棄用了 `kotlin.experimental.coroutines` Gradle DSL 選項以及在 `gradle.properties` 中使用的 `kotlin.coroutines` 屬性。
  只需使用_掛起函式 (suspending functions)_或[將 `kotlinx.coroutines` 相依性新增](gradle-configure-project.md#set-a-dependency-on-a-kotlinx-library)到您的 `build.gradle(.kts)` 檔案中。
  
  在[協同程式指南](coroutines-guide.md)中進一步了解協同程式。

### 移除 kotlin.parallel.tasks.in.project 建置選項 {id="removal-of-the-kotlin-parallel-tasks-in-project-build-option"}

在 Kotlin 1.5.20 中，我們宣布[棄用建置選項 `kotlin.parallel.tasks.in.project`](whatsnew1520.md#deprecation-of-the-kotlin-parallel-tasks-in-project-build-property)。
此選項已在 Kotlin 1.6.20 中移除。

視專案而定，Kotlin daemon 中的平行編譯可能需要更多記憶體。
若要減少記憶體消耗，請[增加 Kotlin daemon 的堆積大小](gradle-compilation-and-caches.md#setting-kotlin-daemon-s-jvm-arguments)。

進一步了解 Kotlin Gradle 外掛程式中[目前支援的編譯器選項](gradle-compiler-options.md)。