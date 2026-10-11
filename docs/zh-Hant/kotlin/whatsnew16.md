[//]: # (title: Kotlin 1.6.0 的新功能)

<web-summary>閱讀 Kotlin 1.6.0 版本資訊，涵蓋新語言特性、Kotlin Multiplatform、JVM、Native、JS 的更新，以及對 Gradle 和 Maven 的建置工具支援。</web-summary>

_[發布日期：2021 年 11 月 16 日](releases.md#release-history)_

Kotlin 1.6.0 引入了新的語言特性、對現有功能的最佳化與改進，以及對 Kotlin 標準程式庫的大量增強。

你也可以在[發布部落格文章](https://blog.jetbrains.com/kotlin/2021/11/kotlin-1-6-0-is-released/)中找到變更的概覽。

> 有關 Kotlin 發布週期的資訊，請參閱 [Kotlin 發布流程](releases.md)。
>
{style="tip"}

## 語言 {id="language"}

Kotlin 1.6.0 穩定了先前在 1.5.30 版本中提供預覽的幾項語言特性：
* [穩定的 enum、sealed 和布林主詞窮舉 when 陳述式](#stable-exhaustive-when-statements-for-enum-sealed-and-boolean-subjects)
* [穩定的掛起函式作為超類型](#stable-suspending-functions-as-supertypes)
* [穩定的 suspend 轉換](#stable-suspend-conversions)
* [穩定的註解類別具現化](#stable-instantiation-of-annotation-classes)

它還包含多種型別推論改進以及對類別型別參數上註解的支援：
* [改進遞迴泛型型別的型別推論](#improved-type-inference-for-recursive-generic-types)
* [Builder 推論的變更](#changes-to-builder-inference)
* [支援類別型別參數上的註解](#support-for-annotations-on-class-type-parameters)

### 穩定的 enum、sealed 和布林主詞窮舉 when 陳述式 {id="stable-exhaustive-when-statements-for-enum-sealed-and-boolean-subjects"}

一個*窮舉（exhaustive）*的 [`when`](control-flow.md#when-expressions-and-statements) 陳述式包含其主詞所有可能型別或值的分支，或者包含某些型別加上一個 `else` 分支。它涵蓋了所有可能的情況，使你的程式碼更加安全。

我們很快將禁止非窮舉的 `when` 陳述式，以使其行為與 `when` 運算式保持一致。
為了確保平滑移轉，Kotlin 1.6.0 對帶有 enum、sealed 或布林主詞的非窮舉 `when` 陳述式發出警告。
這些警告將在未來的版本中變為錯誤。

```kotlin
sealed class Contact {
    data class PhoneCall(val number: String) : Contact()
    data class TextMessage(val number: String) : Contact()
}

fun Contact.messageCost(): Int =
    when(this) { // 錯誤：'when' 運算式必須是窮舉的
        is Contact.PhoneCall -> 42
    }

fun sendMessage(contact: Contact, message: String) {
    // 從 1.6.0 開始

    // 警告：布林上的非窮舉 'when' 陳述式將在 1.7 中被禁止，
    // 請改為新增 'false' 分支或 'else' 分支
    when(message.isEmpty()) {
        true -> return
    }
    // 警告：sealed 類別/介面上的非窮舉 'when' 陳述式將在 1.7 中被禁止，
    // 請改為新增 'is TextMessage' 分支或 'else' 分支
    when(contact) {
        is Contact.PhoneCall -> TODO()
    }
}
```

有關該變更及其影響的更詳細說明，請參閱[此 YouTrack 票證](https://youtrack.jetbrains.com/issue/KT-47709)。

### 穩定的掛起函式作為超類型 {id="stable-suspending-functions-as-supertypes"}

掛起函式型別的實作在 Kotlin 1.6.0 中已達到[穩定 (Stable)](components-stability.md)。
該功能曾在 [1.5.30 中](whatsnew1530.md#suspending-functions-as-supertypes)提供預覽。

在設計使用 Kotlin 協同程式並接受掛起函式型別的 API 時，此特性非常有用。
你現在可以透過將所需行為封裝在實作掛起函式型別的單獨類別中，從而簡化程式碼。

```kotlin
class MyClickAction : suspend () -> Unit {
    override suspend fun invoke() { TODO() }
}

fun launchOnClick(action: suspend () -> Unit) {}
```

你可以在先前僅允許 Lambda 和掛起函式參照的地方使用該類別的執行個體：`launchOnClick(MyClickAction())`。

目前由於實作細節存在兩個限制：
* 不能在超類型列表中混用普通函式型別和掛起函式型別。
* 不能使用多個掛起函式超類型。

### 穩定的 suspend 轉換 {id="stable-suspend-conversions"}

Kotlin 1.6.0 引入了從常規函式型別到掛起函式型別的[穩定 (Stable)](components-stability.md)轉換。
從 1.4.0 開始，該特性支援函式常值和可呼叫參照。
在 1.6.0 中，它適用於任何形式的運算式。作為呼叫引數，你現在可以在預期為掛起型別的地方傳遞任何合適的常規函式型別運算式。
編譯器將自動執行隱式轉換。

```kotlin
fun getSuspending(suspending: suspend () -> Unit) {}

fun suspending() {}

fun test(regular: () -> Unit) {
    getSuspending { }           // 正確
    getSuspending(::suspending) // 正確
    getSuspending(regular)      // 正確
}
```

### 穩定的註解類別具現化 {id="stable-instantiation-of-annotation-classes"}

Kotlin 1.5.30 在 JVM 平台上[引入了](whatsnew1530.md#instantiation-of-annotation-classes)對註解類別具現化的實驗性支援。
在 1.6.0 中，該特性在 Kotlin/JVM 和 Kotlin/JS 上預設皆可用。

若要進一步了解註解類別的具現化，請參閱[此 KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/annotation-instantiation.md)。

### 改進遞迴泛型型別的型別推論 {id="improved-type-inference-for-recursive-generic-types"}

Kotlin 1.5.30 引入了對遞迴泛型型別的型別推論改進，允許僅根據相應型別參數的上限來推論其型別引數。
該改進先前可透過編譯器選項使用。在 1.6.0 及更新版本中，它預設啟用。

```kotlin
// 1.5.30 之前
val containerA = PostgreSQLContainer<Nothing>(DockerImageName.parse("postgres:13-alpine")).apply {
  withDatabaseName("db")
  withUsername("user")
  withPassword("password")
  withInitScript("sql/schema.sql")
}

// 在 1.5.30 中使用編譯器選項，或從 1.6.0 開始預設支援
val containerB = PostgreSQLContainer(DockerImageName.parse("postgres:13-alpine"))
  .withDatabaseName("db")
  .withUsername("user")
  .withPassword("password")
  .withInitScript("sql/schema.sql")
```

### Builder 推論的變更 {id="changes-to-builder-inference"}

Builder 推論是一種型別推論風格，在呼叫泛型 builder 函式時非常有用。它可以借助其 Lambda 引數內部呼叫的型別資訊來推論呼叫的型別引數。

我們正在進行多項變更，使我們更接近完全穩定的 builder 推論。從 1.6.0 開始：
* 你可以在 builder Lambda 內部進行傳回尚未推論型別之執行個體的呼叫，而無需指定在 [1.5.30 中引入](whatsnew1530.md#eliminating-builder-inference-restrictions)的 `-Xunrestricted-builder-inference` 編譯器選項。
* 透過 `-Xenable-builder-inference`，你可以撰寫自己的 builder，而無需套用 [`@BuilderInference`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-builder-inference/) 註解。

    > 請注意，這些 builder 的使用者也需要指定相同的 `-Xenable-builder-inference` 編譯器選項。
    >
    {style="warning"}

* 使用 `-Xenable-builder-inference` 時，如果常規型別推論無法獲取有關型別的足夠資訊，builder 推論將自動啟動。

[了解如何撰寫自訂泛型 builder](using-builders-with-builder-inference.md)。

### 支援類別型別參數上的註解 {id="support-for-annotations-on-class-type-parameters"}

對類別型別參數註解的支援如下所示：

```kotlin
@Target(AnnotationTarget.TYPE_PARAMETER)
annotation class BoxContent

class Box<@BoxContent T> {}
```

所有型別參數上的註解都會發射到 JVM 位元組碼中，以便註解處理器可以使用它們。

有關具體的使用案例動機，請參閱此 [YouTrack 票證](https://youtrack.jetbrains.com/issue/KT-43714)。

進一步了解[註解](annotations.md)。

## 更長時間支援先前的 API 版本 {id="supporting-previous-api-versions-for-a-longer-period"}

從 Kotlin 1.6.0 開始，除了當前穩定版本外，我們將支援先前三個 API 版本的開發，而不是先前的兩個。目前，我們支援 1.3、1.4、1.5 和 1.6 版本。

## Kotlin/JVM {id="kotlin-jvm"}

對於 Kotlin/JVM，從 1.6.0 開始，編譯器可以產生對應於 JVM 17 位元組碼版本的類別。新的語言版本還包括最佳化的委託屬性和可重複註解，這些都在我們的藍圖中：
* [適用於 1.8 JVM 目標且具備執行時期保留的可重複註解](#repeatable-annotations-with-runtime-retention-for-1-8-jvm-target)
* [最佳化在給定 KProperty 執行個體上呼叫 get/set 的委託屬性](#optimize-delegated-properties-which-call-get-set-on-the-given-kproperty-instance)

### 適用於 1.8 JVM 目標且具備執行時期保留的可重複註解 {id="repeatable-annotations-with-runtime-retention-for-1-8-jvm-target"}

Java 8 引入了[可重複註解](https://docs.oracle.com/javase/tutorial/java/annotations/repeating.html)，可以多次套用至單個程式碼元素。
該功能要求在 Java 程式碼中存在兩個宣告：標記有 [`@java.lang.annotation.Repeatable`](https://docs.oracle.com/javase/8/docs/api/java/lang/annotation/Repeatable.html) 的可重複註解本身，以及用於保存其值的容器註解。

Kotlin 也有可重複註解，但僅需在註解宣告上存在 [`@kotlin.annotation.Repeatable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-repeatable/) 即可使其可重複。
在 1.6.0 之前，該功能僅支援 `SOURCE` 保留，並且與 Java 的可重複註解不相容。
Kotlin 1.6.0 移除了這些限制。`@kotlin.annotation.Repeatable` 現在接受任何保留政策，並使該註解在 Kotlin 和 Java 中皆可重複。
現在 Kotlin 端也支援 Java 的可重複註解。

雖然你可以宣告容器註解，但這並非必需。例如：
* 如果註解 `@Tag` 標記有 `@kotlin.annotation.Repeatable`，Kotlin 編譯器會自動產生名為 `@Tag.Container` 的容器註解類別：

    ```kotlin
    @Repeatable 
    annotation class Tag(val name: String)

    // 編譯器會產生 @Tag.Container 容器註解
    ```

* 若要為容器註解設定自訂名稱，請套用 [`@kotlin.jvm.JvmRepeatable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvmrepeatable/) 中繼註解，並將明確宣告的容器註解類別作為引數傳遞：

    ```kotlin
    @JvmRepeatable(Tags::class)
    annotation class Tag(val name: String)
    
    annotation class Tags(val value: Array<Tag>)
    ```

Kotlin 反射現在透過新函式 [`KAnnotatedElement.findAnnotations()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.full/find-annotations.html) 同時支援 Kotlin 和 Java 的可重複註解。

若要進一步了解 Kotlin 可重複註解，請參閱[此 KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/repeatable-annotations.md)。

### 最佳化在給定 KProperty 執行個體上呼叫 get/set 的委託屬性 {id="optimize-delegated-properties-which-call-get-set-on-the-given-kproperty-instance"}

我們透過省略 `$delegate` 欄位並產生對受參照屬性的直接存取，最佳化了產生的 JVM 位元組碼。

例如，在以下程式碼中：

```kotlin
class Box<T> {
    private var impl: T = ...

    var content: T by ::impl
}
```

Kotlin 不再產生 `content$delegate` 欄位。
`content` 變數的屬性存取子會直接呼叫 `impl` 變數，跳過委託屬性的 `getValue`/`setValue` 運算子，從而避免對 [`KProperty`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-property/index.html) 型別的屬性參照物件的需求。

感謝我們 Google 同事的實作！

進一步了解[委託屬性](delegated-properties.md)。

## Kotlin/Native {id="kotlin-native"}

Kotlin/Native 獲得了多項改進和組件更新，其中一些處於預覽狀態：
* [新記憶體管理器的預覽](#preview-of-the-new-memory-manager)
* [支援 Xcode 13](#support-for-xcode-13)
* [在任何主機上編譯 Windows 目標](#compilation-of-windows-targets-on-any-host)
* [LLVM 和連結器更新](#llvm-and-linker-updates)
* [效能改進](#performance-improvements)
* [與 JVM 和 JS IR 後端統一的編譯器外掛程式 ABI](#unified-compiler-plugin-abi-with-jvm-and-js-ir-backends)
* [針對 klib 連結失敗的詳細錯誤訊息](#detailed-error-messages-for-klib-linkage-failures)
* [重構未處理例外狀況處理 API](#reworked-unhandled-exception-handling-api)

### 新記憶體管理器的預覽 {id="preview-of-the-new-memory-manager"}

> 新的 Kotlin/Native 記憶體管理器處於[實驗性 (Experimental)](components-stability.md)階段。
> 它可能隨時被放棄或變更。需要明確選擇加入（詳見下文），且僅應用於評估目的。
> 歡迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-48525) 中向我們提供回饋。
>
{style="warning"}

透過 Kotlin 1.6.0，你可以試用新 Kotlin/Native 記憶體管理器的開發預覽版。
它讓我們更接近消除 JVM 和 Native 平台之間的差異，以在多平台專案中提供一致的開發人員體驗。

顯著的變化之一是頂層屬性的延遲載入，就像在 Kotlin/JVM 中一樣。當同一個檔案中的頂層屬性或函式首次被存取時，頂層屬性才會被初始化。
該模式還包含全域跨程序最佳化（僅針對 release 二進位檔啟用），可移除多餘的初始化檢查。

我們最近發布了一篇關於新記憶體管理器的[部落格文章](https://blog.jetbrains.com/kotlin/2021/08/try-the-new-kotlin-native-memory-manager-development-preview/)。
閱讀該文章以了解新記憶體管理器的當前狀態並找到一些示範專案，或者直接跳轉到[移轉說明](https://github.com/JetBrains/kotlin/blob/master/kotlin-native/NEW_MM.md)親自嘗試。
請在你的專案中檢查新記憶體管理器的運作情況，並在我們處於 [YouTrack](https://youtrack.jetbrains.com/issue/KT-48525) 的問題追蹤器中分享回饋。

### 支援 Xcode 13 {id="support-for-xcode-13"}

Kotlin/Native 1.6.0 支援 Xcode 13 – Xcode 的最新版本。歡迎更新你的 Xcode 並繼續在 Apple 作業系統上開發你的 Kotlin 專案。

> Xcode 13 中新增的程式庫在 Kotlin 1.6.0 中尚無法使用，但我們計劃在即將推出的版本中新增對它們的支援。
>
{style="note"}

### 在任何主機上編譯 Windows 目標 {id="compilation-of-windows-targets-on-any-host"}

從 1.6.0 開始，你不需要 Windows 主機即可編譯 Windows 目標 `mingwX64` 和 `mingwX86`。它們可以在支援 Kotlin/Native 的任何主機上編譯。

### LLVM 和連結器更新 {id="llvm-and-linker-updates"}

我們重構了 Kotlin/Native 底層使用的 LLVM 相依性。這帶來了多種好處，包括：
* 將 LLVM 版本更新至 11.1.0。
* 縮小了相依性大小。例如，在 macOS 上，現在大約為 300 MB，而上一版本為 1200 MB。
* [排除了對 `ncurses5` 程式庫的相依性](https://youtrack.jetbrains.com/issue/KT-42693)，該程式庫在現代 Linux 發行版中已不可用。

除 LLVM 更新外，Kotlin/Native 現在對 MinGW 目標使用 [LLD](https://lld.llvm.org/) 連結器（來自 LLVM 專案的連結器）。
與先前使用的 ld.bfd 連結器相比，它提供了多種優勢，並將使我們能夠提高產生之二進位檔的執行時期效能，並支援 MinGW 目標的編譯器快取。
請注意，LLD [需要匯入程式庫來進行 DLL 連結](whatsnew1530.md#deprecation-of-linkage-against-dlls-without-import-libraries-for-mingw-targets)。
在[此 Stack Overflow 討論串](https://stackoverflow.com/questions/3573475/how-does-the-import-library-work-details/3573527/#3573527)中了解更多資訊。

### 效能改進 {id="performance-improvements"}

Kotlin/Native 1.6.0 帶來了以下效能改進：

* 編譯時間：針對 `linuxX64` 和 `iosArm64` 目標預設啟用編譯器快取。
這加快了偵錯模式下的大多數編譯速度（第一次除外）。在我們的測試專案中，測量顯示速度提升了約 200%。
自 Kotlin 1.5.0 起，就可透過[額外的 Gradle 屬性](whatsnew15.md#performance-improvements)對這些目標使用編譯器快取；你現在可以將它們移除。
* 執行時期：由於產生的 LLVM 程式碼得到了最佳化，使用 `for` 迴圈遍歷陣列的速度現在最高提升了 12%。

### 與 JVM 和 JS IR 後端統一的編譯器外掛程式 ABI {id="unified-compiler-plugin-abi-with-jvm-and-js-ir-backends"}

> 在 Kotlin/Native 中使用通用 IR 編譯器外掛程式 ABI 的選項處於[實驗性 (Experimental)](components-stability.md)階段。
> 它可能隨時被放棄或變更。需要明確選擇加入（詳見下文），且僅應用於評估目的。
> 歡迎在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-48595) 中向我們提供回饋。
>
{style="warning"}

在先前的版本中，由於 ABI 的差異，編譯器外掛程式的作者必須為 Kotlin/Native 提供單獨的產物。

從 1.6.0 開始，Kotlin Multiplatform Gradle 外掛程式能夠為 Kotlin/Native 使用可內嵌的編譯器 jar（embeddable compiler jar）– 即用於 JVM 和 JS IR 後端的 jar。
這是朝著統一編譯器外掛程式開發體驗邁出的一步，因為你現在可以對 Native 和其他支援的平台使用相同的編譯器外掛程式產物。

這是此類支援的預覽版本，需要明確選擇加入。
若要開始對 Kotlin/Native 使用通用的編譯器外掛程式產物，請將以下行新增至 `gradle.properties`：`kotlin.native.useEmbeddableCompilerJar=true`。

我們計劃未來在 Kotlin/Native 中預設使用可內嵌的編譯器 jar，因此了解預覽版對你的運作情況對我們至關重要。

如果你是編譯器外掛程式的作者，請嘗試此模式並檢查它是否適用於你的外掛程式。
請注意，根據外掛程式的結構，可能需要執行移轉步驟。請參閱[此 YouTrack 問題](https://youtrack.jetbrains.com/issue/KT-48595)以獲取移轉說明，並在評論中留下你的回饋。

### 針對 klib 連結失敗的詳細錯誤訊息 {id="detailed-error-messages-for-klib-linkage-failures"}

Kotlin/Native 編譯器現在為 klib 連結錯誤提供詳細的錯誤訊息。
訊息現在具有清晰的錯誤描述，並且還包含有關可能原因以及修復方法的資訊。

例如：
* 1.5.30：

    ```text
    e: java.lang.IllegalStateException: IrTypeAliasSymbol expected: Unbound public symbol for public kotlinx.coroutines/CancellationException|null[0]
    <stack trace>
    ```

* 1.6.0：

    ```text
    e: The symbol of unexpected type encountered during IR deserialization: IrClassPublicSymbolImpl, kotlinx.coroutines/CancellationException|null[0].
    IrTypeAliasSymbol is expected.
    
    This could happen if there are two libraries, where one library was compiled against the different version of the other library than the one currently used in the project.
    Please check that the project configuration is correct and has consistent versions of dependencies.
    
    The list of libraries that depend on "org.jetbrains.kotlinx:kotlinx-coroutines-core (org.jetbrains.kotlinx:kotlinx-coroutines-core-macosx64)" and may lead to conflicts:
    <list of libraries and potential version mismatches>
    
    Project dependencies:
    <dependencies tree>
    ```

### 重構未處理例外狀況處理 API {id="reworked-unhandled-exception-handling-api"}

我們統一了整個 Kotlin/Native 執行時期中未處理例外狀況的處理，並公開了預設處理作為函式 `processUnhandledException(throwable: Throwable)`，以供自訂執行環境（如 `kotlinx.coroutines`）使用。
此處理也適用於逸出 `Worker.executeAfter()` 操作的例外狀況，但僅適用於新的[記憶體管理器](#preview-of-the-new-memory-manager)。

API 改進還影響了透過 `setUnhandledExceptionHook()` 設定的掛鉤（hook）。以前，在 Kotlin/Native 執行時期使用未處理例外狀況呼叫該掛鉤後，此類掛鉤會被重設，程式隨後總是會立即終止。
現在這些掛鉤可以多次使用，如果你希望程式在遇到未處理例外狀況時始終終止，要麼不要設定未處理例外狀況掛鉤（`setUnhandledExceptionHook()`），要麼確保在掛鉤結尾呼叫 `terminateWithUnhandledException()`。
這將幫助你將例外狀況發送到第三方當機報告服務（例如 Firebase Crashlytics），然後終止程式。
逸出 `main()` 的例外狀況和跨越互通邊界的例外狀況將始終終止程式，即使掛鉤沒有呼叫 `terminateWithUnhandledException()`。

## Kotlin/JS {id="kotlin-js"}

我們繼續致力於穩定 Kotlin/JS 編譯器的 IR 後端。
Kotlin/JS 現在提供了一個[停用下載 Node.js 和 Yarn 的選項](#option-to-use-pre-installed-node-js-and-yarn)。

### 停用下載預先安裝之 Node.js 和 Yarn 的選項 {id="option-to-use-pre-installed-node-js-and-yarn"}

建置 Kotlin/JS 專案時，你現在可以停用下載 Node.js 和 Yarn，並使用主機上已安裝的執行個體。
這對於在沒有網際網路連線的伺服器（例如 CI 伺服器）上進行建置非常有用。

若要停用下載外部組件，請將以下幾行新增至你的 `build.gradle(.kts)`：

* Yarn：

    <tabs group="build-script">
    <tab title="Kotlin" group-key="kotlin">
    
    ```kotlin
    rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> {
        rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension>().download = false // 或設為 true 以使用預設行為
    }
    ```
    
    </tab>
    <tab title="Groovy" group-key="groovy">
    
    ```groovy
    rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin) {
        rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).download = false
    }
    ```
    
    </tab>
    </tabs>

* Node.js：

    <tabs group="build-script">
    <tab title="Kotlin" group-key="kotlin">
    
    ```kotlin
    rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsRootPlugin> {
        rootProject.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsRootExtension>().download = false // 或設為 true 以使用預設行為
    }
     
    ```
    
    </tab>
    <tab title="Groovy" group-key="groovy">
    
    ```groovy
    rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsRootPlugin) {
        rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsRootExtension).download = false
    }
    ```
    
    </tab>
    </tabs>

## Kotlin Gradle 外掛程式 {id="kotlin-gradle-plugin"}

在 Kotlin 1.6.0 中，我們將 `KotlinGradleSubplugin` 類別的棄用等級變更為「ERROR」。
該類別曾用於撰寫編譯器外掛程式。在後續版本中，我們將移除該類別。請改用 `KotlinCompilerPluginSupportPlugin` 類別。

我們移除了 `kotlin.useFallbackCompilerSearch` 組建選項以及 `noReflect` 和 `includeRuntime` 編譯器選項。
`useIR` 編譯器選項已被隱藏，並將在即將推出的版本中移除。

進一步了解 Kotlin Gradle 外掛程式中[目前支援的編譯器選項](gradle-compiler-options.md)。

## 標準程式庫 {id="standard-library"}

標準程式庫的新 1.6.0 版本穩定了實驗性功能、引入了新功能，並統一了跨平台的行為：

* [新的 readline 函式](#new-readline-functions)
* [穩定的 typeOf()](#stable-typeof)
* [穩定的集合 builder](#stable-collection-builders)
* [穩定的 Duration API](#stable-duration-api)
* [將 Regex 拆分為序列](#splitting-regex-into-a-sequence)
* [整數上的位元旋轉操作](#bit-rotation-operations-on-integers)
* [JS 中 replace() 和 replaceFirst() 的變更](#changes-for-replace-and-replacefirst-in-js)
* [對現有 API 的改進](#improvements-to-the-existing-api)
* [棄用項](#deprecations)

### 新的 readline 函式 {id="new-readline-functions"}

Kotlin 1.6.0 提供了處理標準輸入的新函式：[`readln()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/readln.html) 和 [`readlnOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/readln-or-null.html)。

> 目前，新函式僅適用於 JVM 和 Native 目標平台。
>
{style="note"}

|**早期版本**|**1.6.0 替代方案**|**用法**|
| --- | --- | --- |
|`readLine()!!`|`readln()`| 從 stdin 讀取一行並傳回它，或者如果已達到 EOF 則拋出 `RuntimeException`。 |
|`readLine()`|`readlnOrNull()`| 從 stdin 讀取一行並傳回它，或者如果已達到 EOF 則傳回 `null`。 |

我們相信，在讀取行時消除使用 `!!` 的需求將改善新手的體驗並簡化 Kotlin 的教學。
為了使讀行操作名稱與對應的 `println()` 保持一致，我們決定將新函式的名稱縮短為 'ln'。

```kotlin
println("What is your nickname?")
val nickname = readln()
println("Hello, $nickname!")
```

```kotlin
fun main() {
//sampleStart
    var sum = 0
    while (true) {
        val nextLine = readlnOrNull().takeUnless { 
            it.isNullOrEmpty() 
        } ?: break
        sum += nextLine.toInt()
    }
    println(sum)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.6"}

現有的 `readLine()` 函式在 IDE 程式碼補全中的優先順序將低於 `readln()` 和 `readlnOrNull()`。
IDE 檢查還將建議使用新函式而不是舊版的 `readLine()`。

我們計劃在未來的版本中逐步棄用 `readLine()` 函式。

### 穩定的 typeOf() {id="stable-typeof"}

1.6.0 版本帶來了[穩定 (Stable)](components-stability.md)的 [`typeOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/type-of.html) 函式，完成了[主要藍圖項目](https://youtrack.jetbrains.com/issue/KT-45396)之一。

[自 1.3.40 起](https://blog.jetbrains.com/kotlin/2019/06/kotlin-1-3-40-released/)，`typeOf()` 就作為實驗性 API 在 JVM 平台上可用。
現在你可以在任何 Kotlin 平台上使用它，並取得編譯器可以推論出的任何 Kotlin 型別的 [`KType`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-type/#kotlin.reflect.KType) 表示形式：

```kotlin
inline fun <reified T> renderType(): String {
    val type = typeOf<T>()
    return type.toString()
}

fun main() {
    val fromExplicitType = typeOf<Int>()
    val fromReifiedType = renderType<List<Int>>()
}
```

### 穩定的集合 builder {id="stable-collection-builders"}

在 Kotlin 1.6.0 中，集合 builder 函式已晉升為[穩定 (Stable)](components-stability.md)。集合 builder 傳回的集合現在在其唯讀狀態下是可序列化的。

你現在可以使用 [`buildMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-map.html)、
[`buildList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-list.html) 和 [`buildSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-set.html)，而無需宣告選擇加入註解：

```kotlin
fun main() {
//sampleStart
    val x = listOf('b', 'c')
    val y = buildList {
        add('a')
        addAll(x)
        add('d')
    }
    println(y)  // [a, b, c, d]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5" validate="false"}

### 穩定的 Duration API {id="stable-duration-api"}

用於表示不同時間單位持續時間量的 [Duration](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) 類別已晉升為[穩定 (Stable)](components-stability.md)。在 1.6.0 中，Duration API 獲得了以下變更：

* 將持續時間分解為天、小時、分鐘、秒和奈秒的 [`toComponents()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/to-components.html) 函式的第一個組件現在具有 `Long` 型別而不是 `Int`。
  先前，如果該值不符合 `Int` 範圍，它會被強制限制在該範圍內。使用 `Long` 型別後，你可以分解持續時間範圍內的任何值，而不會截斷不符合 `Int` 的值。

* `DurationUnit` 列舉現在是獨立的，不再是 JVM 上 `java.util.concurrent.TimeUnit` 的型別別名。
  我們沒有發現任何讓 `typealias DurationUnit = TimeUnit` 變得有用的令人信服的案例。此外，透過型別別名公開 `TimeUnit` API 可能會讓 `DurationUnit` 的使用者感到困惑。

* 響應社群回饋，我們重新帶回了諸如 `Int.seconds` 之類的擴充屬性。但我們希望限制它們的適用範圍，因此將它們放入了 `Duration` 類別的伴生物件中。
  雖然 IDE 仍可以在補全中建議擴充功能並自動從伴生物件插入匯入，但未來我們計劃將此行為限制在預期為 `Duration` 型別的情況下。

  ```kotlin
  import kotlin.time.Duration.Companion.seconds
  
  fun main() {
  //sampleStart
      val duration = 10000
      println("There are ${duration.seconds.inWholeMinutes} minutes in $duration seconds")
      // There are 166 minutes in 10000 seconds
  //sampleEnd
  }
  ```
  {kotlin-runnable="true" kotlin-min-compiler-version="1.5" validate="false"}
  
  我們建議將先前引入的伴生函式（例如 `Duration.seconds(Int)`）和已棄用的頂層擴充（如 `Int.seconds`）替換為 `Duration.Companion` 中的新擴充。

  > 這種替換可能會導致舊頂層擴充與新伴生擴充之間產生歧義。
  > 在執行自動移轉之前，請確保使用 kotlin.time 套件的萬用字元匯入 – `import kotlin.time.*`。
  >
  {style="note"}

### 將 Regex 拆分為序列 {id="splitting-regex-into-a-sequence"}

`Regex.splitToSequence(CharSequence)` 和 `CharSequence.splitToSequence(Regex)` 函式晉升為[穩定 (Stable)](components-stability.md)。
它們圍繞給定正規表示式的相符項分割字串，但將結果作為[序列 (Sequence)](sequences.md)傳回，以便對該結果的所有操作都延遲執行：

```kotlin
fun main() {
//sampleStart
    val colorsText = "green, red, brown&blue, orange, pink&green"
    val regex = "[,\\s]+".toRegex()
    val mixedColor = regex.splitToSequence(colorsText)
    // 或
    // val mixedColor = colorsText.splitToSequence(regex)
        .onEach { println(it) }
        .firstOrNull { it.contains('&') }
    println(mixedColor) // "brown&blue"
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5" validate="false"}

### 整數上的位元旋轉操作 {id="bit-rotation-operations-on-integers"}

在 Kotlin 1.6.0 中，用於位元操作的 `rotateLeft()` 和 `rotateRight()` 函式變為[穩定 (Stable)](components-stability.md)。
這些函式將數字的二進位表示形式向左或向右旋轉指定的位元數：

```kotlin
fun main() {
//sampleStart
    val number: Short = 0b10001
    println(number
        .rotateRight(2)
        .toString(radix = 2)) // 100000000000100
    println(number
        .rotateLeft(2)
        .toString(radix = 2))  // 1000100
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.6"}

### JS 中 replace() 和 replaceFirst() 的變更 {id="changes-for-replace-and-replacefirst-in-js"}

在 Kotlin 1.6.0 之前，當替換字串包含群組參照時，[`replace()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-regex/replace.html) 和 [`replaceFirst()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-regex/replace-first.html) 正規表示式函式在 Java 和 JS 中的行為有所不同。
為了使所有目標平台的行為一致，我們更改了它們在 JS 中的實作。

替換字串中出現的 `${name}` 或 `$index` 將被替換為與具有指定索引或名稱的擷取群組相對應的子序列：
* `$index` – '$' 後面的第一個數字始終被視為群組參照的一部分。只有當後續數字形成有效的群組參照時，它們才會併入 `index`。只有數字 '0'–'9' 被視為群組參照的潛在組件。請注意，擷取群組的索引從 '1' 開始。
  索引為 '0' 的群組代表整個相符項。
* `${name}` – `name` 可以由拉丁字母 'a'–'z'、'A'–'Z' 或數字 '0'–'9' 組成。第一個字元必須是字母。

    > 替換模式中的命名群組目前僅在 JVM 上受支援。
    >
    {style="note"}

* 若要在替換字串中將後續字元作為常值包含，請使用反斜線字元 `\`：

    ```kotlin
    fun main() {
    //sampleStart
        println(Regex("(.+)").replace("Kotlin", """\$ $1""")) // $ Kotlin
        println(Regex("(.+)").replaceFirst("1.6.0", """\\ $1""")) // \ 1.6.0
    //sampleEnd
    }
    ```
    {kotlin-runnable="true" kotlin-min-compiler-version="1.6"}

    如果替換字串必須作為常值字串處理，可以使用 [`Regex.escapeReplacement()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-regex/escape-replacement.html)。

### 對現有 API 的改進 {id="improvements-to-the-existing-api"}

* 1.6.0 版本為 `Comparable.compareTo()` 新增了中綴擴充函式。你現在可以使用中綴形式來比較兩個物件的順序：

    ```kotlin
     class WrappedText(val text: String) : Comparable<WrappedText> {
         override fun compareTo(other: WrappedText): Int =
             this.text compareTo other.text
    }
    ```

* JS 中的 `Regex.replace()` 現在也改為非內嵌，以統一其在所有平台上的實作。
* `compareTo()` 和 `equals()` 字串函式以及 `isBlank()` CharSequence 函式現在在 JS 中的行為與在 JVM 上的行為完全相同。
  先前在涉及非 ASCII 字元時存在偏差。

### 棄用項 {id="deprecations"}

在 Kotlin 1.6.0 中，我們開始對某些僅限 JS 的 stdlib API 進入帶有警告的棄用週期。

#### concat()、match() 和 matches() 字串函式 {id="concat-match-and-matches-string-functions"}

* 若要將字串與給定另一個物件的字串表示形式串聯，請使用 `plus()` 而不是 `concat()`。
* 若要尋找輸入中正規表示式的所有相符項目，請使用 Regex 類別的 `findAll()`，而不是 `String.match(regex: String)`。
* 若要檢查正規表示式是否與整個輸入相符，請使用 Regex 類別的 `matches()`，而不是 `String.matches(regex: String)`。

#### 陣列上接受比較函式的 sort() {id="sort-on-arrays-taking-comparison-functions"}

我們棄用了 `Array<out T>.sort()` 函式以及內嵌函式 `ByteArray.sort()`、`ShortArray.sort()`、
`IntArray.sort()`、`LongArray.sort()`、`FloatArray.sort()`、`DoubleArray.sort()` 和 `CharArray.sort()`，這些函式依據比較函式傳遞的順序對陣列進行排序。
陣列排序請改用其他標準程式庫函式。

請參閱[集合排序](collection-ordering.md)部分作為參考。

## 工具 {id="tools"}

### Kover – Kotlin 的程式碼涵蓋率工具 {id="kover-a-code-coverage-tool-for-kotlin"}

> Kover Gradle 外掛程式處於實驗性階段。歡迎在 [GitHub](https://github.com/Kotlin/kotlinx-kover/issues) 中向我們提供回饋。
>
{style="warning"}

在 Kotlin 1.6.0 中，我們推出了 Kover – 一個適用於 [IntelliJ](https://github.com/JetBrains/intellij-coverage) 和 [JaCoCo](https://github.com/jacoco/jacoco) Kotlin 程式碼涵蓋率代理的 Gradle 外掛程式。
它適用於所有語言結構，包括內嵌函式。

若要進一步了解 Kover，請造訪其 [GitHub 儲存庫](https://github.com/Kotlin/kotlinx-kover)或觀看此影片：

<video src="https://www.youtube.com/v/jNu5LY9HIbw" title="Kover – 程式碼涵蓋率外掛程式"/>

## Coroutines 1.6.0-RC {id="coroutines-1-6-0-rc"}

`kotlinx.coroutines` [1.6.0-RC](https://github.com/Kotlin/kotlinx.coroutines/releases/tag/1.6.0-RC) 現已發布，帶來多項新功能與改進：

* 支援[新的 Kotlin/Native 記憶體管理器](#preview-of-the-new-memory-manager)
* 引入了分派器 _views_ API，允許在不建立額外執行緒的情況下限制並行度
* 目標平台從 Java 6 移轉到 Java 8
* 帶來重構的新 API 和多平台支援的 `kotlinx-coroutines-test`
* 引入了 [`CopyableThreadContextElement`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-copyable-thread-context-element/index.html)，它為協同程式提供了對 [`ThreadLocal`](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/lang/ThreadLocal.html) 變數的執行緒安全寫入存取權限

在[變更記錄](https://github.com/Kotlin/kotlinx.coroutines/releases/tag/1.6.0-RC)中了解更多資訊。

## 移轉至 Kotlin 1.6.0 {id="migrating-to-kotlin-1-6-0"}

IntelliJ IDEA 和 Android Studio 將在 Kotlin 外掛程式 1.6.0 發布後建議進行更新。

若要將現有專案移轉至 Kotlin 1.6.0，請將 Kotlin 版本變更為 `1.6.0`，然後重新匯入你的 Gradle 或 Maven 專案。[了解如何更新至 Kotlin 1.6.0](releases.md#update-to-a-new-kotlin-version)。

若要使用 Kotlin 1.6.0 建立新專案，請更新 Kotlin 外掛程式，然後從 **File** | **New** | **Project** 執行專案精靈。

新的命令列編譯器可在 [GitHub 發布頁面](https://github.com/JetBrains/kotlin/releases/tag/v1.6.0)上下載。

Kotlin 1.6.0 是一個功能發布版本，因此可能會帶來與你為早期語言版本編寫的程式碼不相容的變更。
在 [Kotlin 1.6 相容性指南](compatibility-guide-16.md)中尋找此類變更的詳細清單。