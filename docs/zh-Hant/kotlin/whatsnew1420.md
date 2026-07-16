[//]: # (title: Kotlin 1.4.20 新功能)

<web-summary>閱讀 Kotlin 1.4.20 版本說明，涵蓋新的語言特性、Kotlin Multiplatform、JVM、Native、JS 的更新，以及對 Gradle 和 Maven 的建置工具支援。</web-summary>

_[發佈日期：2020 年 11 月 23 日](releases.md#release-history)_

Kotlin 1.4.20 提供了許多新的實驗功能，並針對現有功能（包括 1.4.0 中新增的功能）進行了修復與改進。

您也可以在[這篇部落格文章](https://blog.jetbrains.com/kotlin/2020/11/kotlin-1-4-20-released/)中透過更多範例了解新功能。

> 有關 Kotlin 發佈週期的資訊，請參閱 [Kotlin 發佈流程](releases.md)。
>
{style="tip"}

## Kotlin/JVM

Kotlin/JVM 的改進旨在跟上現代 Java 版本的特性：

- [Java 15 目標](#java-15-target)
- [invokedynamic 字串連接](#invokedynamic-string-concatenation)

### Java 15 目標

現在 Java 15 已可作為 Kotlin/JVM 的目標。

### invokedynamic 字串連接

> `invokedynamic` 字串連接是 [實驗性](components-stability.md) 的。它可能隨時被刪除或更改。需要選擇性啟用（詳情見下文）。僅用於評估目的。歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 中提供回饋。
>
{style="warning"}

Kotlin 1.4.20 可以將字串連接編譯為 JVM 9+ 目標上的 [動態呼叫 (dynamic invocations)](https://docs.oracle.com/javase/7/docs/technotes/guides/vm/multiple-language-support.html#invokedynamic)，從而提高效能。

目前，此功能處於實驗階段，涵蓋以下情況：
- 運算子 (`a + b`)、明確呼叫 (`a.plus(b)`) 和參照 (`(a::plus)(b)`) 形式的 `String.plus`。
- inline 類別與 data class 上的 `toString`。
- 除具有單個非固定引數（參見 [KT-42457](https://youtrack.jetbrains.com/issue/KT-42457)）之外的字串範本。

要啟用 `invokedynamic` 字串連接，請加入 `-Xstring-concat` 編譯器選項目，並使用以下值之一：
- `indy-with-constants`：使用 [StringConcatFactory.makeConcatWithConstants()](https://docs.oracle.com/javase/9/docs/api/java/lang/invoke/StringConcatFactory.html#makeConcatWithConstants-java.lang.invoke.MethodHandles.Lookup-java.lang.String-java.lang.invoke.MethodType-java.lang.String-java.lang.Object...-) 對字串執行 `invokedynamic` 連接。
- `indy`：使用 [StringConcatFactory.makeConcat()](https://docs.oracle.com/javase/9/docs/api/java/lang/invoke/StringConcatFactory.html#makeConcat-java.lang.invoke.MethodHandles.Lookup-java.lang.String-java.lang.invoke.MethodType-) 對字串執行 `invokedynamic` 連接。
- `inline`：切換回透過 `StringBuilder.append()` 執行的傳統連接。

## Kotlin/JS

Kotlin/JS 持續快速演進，在 1.4.20 中您可以發現許多實驗功能與改進：

- [Gradle DSL 變更](#gradle-dsl-changes)
- [新精靈範本](#new-wizard-templates)
- [使用 IR 編譯器忽略編譯錯誤](#ignoring-compilation-errors-with-ir-compiler)

### Gradle DSL 變更

Kotlin/JS 的 Gradle DSL 獲得了多項更新，簡化了專案設定與自訂。這包括 webpack 配置調整、自動產生的 `package.json` 檔案修改，以及對傳遞相依性更完善的控制。

#### webpack 配置的單一入口

針對 browser 目標提供了一個新的配置區塊 `commonWebpackConfig`。在其中，您可以從單一位置調整常用設定，而無需為 `webpackTask`、`runTask` 和 `testTask` 重複配置。

若要預設為這三個任務啟用 CSS 支援，請在專案的 `build.gradle(.kts)` 中加入以下程式碼片段：

```groovy
browser {
    commonWebpackConfig {
        cssSupport.enabled = true
    }
    binaries.executable()
}
```

進一步了解 [配置 webpack 統合 (bundling)](js-project-setup.md#webpack-bundling)。

#### 從 Gradle 自訂 package.json

為了更精確地控制 Kotlin/JS 套件管理與散佈，您現在可以透過 Gradle DSL 向專案檔案 [`package.json`](https://nodejs.dev/learn/the-package-json-guide) 加入屬性。

若要向您的 `package.json` 加入自訂欄位，請在編譯的 `packageJson` 區塊中使用 `customField` 函式：

```kotlin
kotlin {
    js(BOTH) {
        compilations["main"].packageJson {
            customField("hello", mapOf("one" to 1, "two" to 2))
        }
    }
}
```

進一步了解 [`package.json` 自訂](js-project-setup.md#package-json-customization)。

#### 選擇性 yarn 相依性解析

> 支援選擇性 yarn 相依性解析是 [實驗性](components-stability.md) 的。它可能隨時被刪除或更改。僅用於評估目的。歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 中提供回饋。
>
{style="warning"}

Kotlin 1.4.20 提供了一種配置 Yarn [選擇性相依性解析 (selective dependency resolutions)](https://classic.yarnpkg.com/en/docs/selective-version-resolutions/) 的方式，這是一種覆蓋您所相依套件之相依性的機制。

您可以透過 Gradle 中 `YarnPlugin` 內的 `YarnRootExtension` 來使用它。若要影響專案中套件的解析版本，請使用 `resolution` 函式，傳入套件名稱選取器（如 Yarn 所指定）以及應解析到的版本。

```kotlin
rootProject.plugins.withType<YarnPlugin> {
    rootProject.the<YarnRootExtension>().apply {
        resolution("react", "16.0.0")
        resolution("processor/decamelize", "3.0.0")
    }
}
```

如此一來，您所有需要 `react` 的 npm 相依性都將獲得 `16.0.0` 版本，而 `processor` 將獲得其 `3.0.0` 版本的 `decamelize` 相依性。

#### 停用細粒度工作區 (granular workspaces)

> 停用細粒度工作區是 [實驗性](components-stability.md) 的。它可能隨時被刪除或更改。僅用於評估目的。歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 中提供回饋。
>
{style="warning"}

為了加快建置時間，Kotlin/JS Gradle 外掛程式僅安裝特定 Gradle 任務所需的相依性。例如，`webpack-dev-server` 套件僅在您執行 `*Run` 任務之一時安裝，而在執行 assemble 任務時不安裝。這種行為在平行執行多個 Gradle 程序時可能會帶來問題。當相依性需求發生衝突時，兩次 npm 套件安裝可能會導致錯誤。

為了解決此問題，Kotlin 1.4.20 包含了一個選項來停用這些所謂的「細粒度工作區」。此功能目前可透過 Gradle 中 `YarnPlugin` 內的 `YarnRootExtension` 使用。要使用它，請將以下程式碼片段加入您的 `build.gradle.kts` 檔案：

```kotlin
rootProject.plugins.withType<YarnPlugin> {
    rootProject.the<YarnRootExtension>().disableGranularWorkspaces()
}
```

### 新精靈範本

為了讓您在建立專案期間有更方便的方式進行自訂，Kotlin 的專案精靈為 Kotlin/JS 應用程式帶來了新的範本：
- **Browser Application** – 一個在瀏覽器中運行的最小 Kotlin/JS Gradle 專案。
- **React Application** – 一個使用適當 `kotlin-wrappers` 的 React 應用程式。它提供了啟用樣式表、導覽組件或狀態容器整合的選項。
- **Node.js Application** – 一個在 Node.js 執行階段運行的最小專案。它可以選擇直接包含實驗性的 `kotlinx-nodejs` 套件。

### 使用 IR 編譯器忽略編譯錯誤

> 「忽略編譯錯誤」模式是 [實驗性](components-stability.md) 的。它可能隨時被刪除或更改。需要選擇性啟用（詳情見下文）。僅用於評估目的。歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 中提供回饋。
>
{style="warning"}

Kotlin/JS 的 [IR 編譯器](js-ir-compiler.md) 附帶了一個新的實驗模式：帶錯誤編譯。在此模式下，即使程式碼包含錯誤，您也可以執行程式碼，例如，如果您想在整個應用程式尚未就緒時嘗試某些部分。

此模式有兩種容錯策略：
- `SEMANTIC`：編譯器將接受語法正確但在語義上不通的程式碼，例如 `val x: String = 3`。

- `SYNTAX`：編譯器將接受任何程式碼，即使包含語法錯誤。

要允許帶錯誤編譯，請加入 `-Xerror-tolerance-policy=` 編譯器選項，並使用上述值之一。

[進一步了解 Kotlin/JS IR 編譯器](js-ir-compiler.md)。

## Kotlin/Native

Kotlin/Native 在 1.4.20 中的優先事項是效能與現有功能的打磨。以下是顯著的改進：
  
- [逃逸分析 (Escape analysis)](#escape-analysis)
- [效能改進與錯誤修正](#performance-improvements-and-bug-fixes)
- [選擇性啟用 Objective-C 例外包裝](#opt-in-wrapping-of-objective-c-exceptions)
- [CocoaPods 外掛程式改進](#cocoapods-plugin-improvements)
- [支援 Xcode 12 程式庫](#support-for-xcode-12-libraries)

### 逃逸分析 (Escape analysis)

> 逃逸分析機制是 [實驗性](components-stability.md) 的。它可能隨時被刪除或更改。僅用於評估目的。歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 中提供回饋。
>
{style="warning"}

Kotlin/Native 獲得了新逃逸分析機器的原型。它透過將某些物件分配在堆疊而非堆積上來提高執行階段效能。此機制在我們的效能基準測試中顯示出平均 10% 的效能提升，我們將繼續改進它以進一步加速程式運行。

逃逸分析在發佈組建（使用 `-opt` 編譯器選項）的獨立編譯階段執行。

如果您想停用逃逸分析階段，請使用 `-Xdisable-phases=EscapeAnalysis` 編譯器選項。

### 效能改進與錯誤修正

Kotlin/Native 在各個組件中都獲得了效能改進與錯誤修正，包括 1.4.0 中加入的功能，例如 [程式碼共享機制](https://kotlinlang.org/docs/multiplatform/multiplatform-share-on-platforms.html#share-code-on-similar-platforms)。

### 選擇性啟用 Objective-C 例外包裝

> Objective-C 例外包裝機制是 [實驗性](components-stability.md) 的。它可能隨時被刪除或更改。需要選擇性啟用（詳情見下文）。僅用於評估目的。歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 中提供回饋。
>
{style="warning"}

Kotlin/Native 現在可以處理執行階段從 Objective-C 程式碼拋出的例外，以避免程式當機。

您可以選擇將 `NSException` 包裝成 `ForeignException` 類型的 Kotlin 例外。它們持有對原始 `NSException` 的參照。這讓您可以獲取有關根本原因的資訊並正確處理它。

要啟用 Objective-C 例外包裝，請在 `cinterop` 呼叫中指定 `-Xforeign-exception-mode objc-wrap` 選項，或將 `foreignExceptionMode = objc-wrap` 屬性加入 `.def` 檔案。如果您使用 [CocoaPods 整合](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html)，請在相依性的 `pod {}` 建置指令碼區塊中指定選項，如下所示：

```kotlin
pod("foo") {
    extraOpts = listOf("-Xforeign-exception-mode", "objc-wrap")
}
```

預設行為保持不變：當從 Objective-C 程式碼拋出例外時，程式將終止。

### CocoaPods 外掛程式改進

Kotlin 1.4.20 繼續對 CocoaPods 整合進行一系列改進。具體而言，您可以嘗試以下新功能：

- [改進任務執行](#improved-task-execution)
- [擴充 DSL](#extended-dsl)
- [更新與 Xcode 的整合](#updated-integration-with-xcode)

#### 改進任務執行

CocoaPods 外掛程式獲得了改進的任務執行流程。例如，如果您加入新的 CocoaPods 相依性，現有的相依性不會重新組建。加入額外的目標也不會影響現有目標的相依性重新組建。

#### 擴充 DSL

向 Kotlin 專案加入 [CocoaPods](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html) 相依性的 DSL 獲得了新能力。

除了本機 Pod 和來自 CocoaPods 存儲庫的 Pod 之外，您還可以加入對以下類型程式庫的相依性：
* 來自自訂 spec 存儲庫的程式庫。
* 來自 Git 存儲庫的遠端程式庫。
* 來自封存檔（也可透過任意 HTTP 地址獲取）的程式庫。
* 靜態程式庫。
* 具有自訂 cinterop 選項的程式庫。

進一步了解在 Kotlin 專案中 [加入 CocoaPods 相依性](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-libraries.html)。在 [Kotlin with CocoaPods 範例](https://github.com/Kotlin/kmm-with-cocoapods-sample) 中尋找範例。

#### 更新與 Xcode 的整合

為了與 Xcode 正確運作，Kotlin 需要對 Podfile 進行一些變更：

* 如果您的 Kotlin Pod 有任何 Git、HTTP 或 specRepo Pod 相依性，您也應該在 Podfile 中指定它。
* 當您從自訂 spec 加入程式庫時，您還應該在 Podfile 的開頭指定 spec 的 [位置](https://guides.cocoapods.org/syntax/podfile.html#source)。

現在，整合錯誤在 IDEA 中有詳細說明。因此，如果您在 Podfile 上遇到問題，您會立即知道如何修復。

進一步了解 [建立 Kotlin pods](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-xcode.html)。

### 支援 Xcode 12 程式庫
    
我們加入了對隨 Xcode 12 交付之新程式庫的支援。現在您可以在 Kotlin 程式碼中使用它們。

## Kotlin Multiplatform

### 更新多平台程式庫發佈結構

從 Kotlin 1.4.20 開始，不再有獨立的元資料發佈。元資料構件現在包含在「根」發佈中，該發佈代表整個程式庫，並且在作為相依性加入通用原始碼集時，會自動解析為適當的平台特定構件。

進一步了解 [發佈多平台程式庫](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-lib-setup.html)。

#### 與早期版本的相容性

結構的這種變化打破了具有 [分層專案結構 (hierarchical project structure)](https://kotlinlang.org/docs/multiplatform/multiplatform-share-on-platforms.html#share-code-on-similar-platforms) 的專案之間的相容性。如果一個多平台專案及其相依的程式庫都具有分層專案結構，那麼您需要同時將它們更新到 Kotlin 1.4.20 或更高版本。使用 Kotlin 1.4.20 發佈的程式庫無法供使用早期版本發佈的專案使用。

沒有分層專案結構的專案和程式庫保持相容。

## 標準程式庫

Kotlin 1.4.20 的標準程式庫提供了用於處理檔案的新擴充功能，並具備更好的效能。

- [java.nio.file.Path 的擴充功能](#extensions-for-java-nio-file-path)
- [改進 String.replace 函式的效能](#improved-string-replace-function-performance)

### java.nio.file.Path 的擴充功能

> `java.nio.file.Path` 的擴充功能是 [實驗性](components-stability.md) 的。它們可能隨時被刪除或更改。需要選擇性啟用（詳情見下文）。僅用於評估目的。歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 中提供回饋。
>
{style="warning"}

現在標準程式庫為 `java.nio.file.Path` 提供了實驗性擴充功能。以慣用的 Kotlin 方式使用現代 JVM 檔案 API，現在類似於使用 `kotlin.io` 套件中的 `java.io.File` 擴充功能。

```kotlin
// 使用 div (/) 運算子建構路徑
val baseDir = Path("/base")
val subDir = baseDir / "subdirectory" 

// 列出目錄中的檔案
val kotlinFiles: `List<Path>` = Path("/home/user").listDirectoryEntries("*.kt")
```

這些擴充功能在 `kotlin-stdlib-jdk7` 模組的 `kotlin.io.path` 套件中提供。要使用這些擴充功能，請 [選擇性啟用](opt-in-requirements.md) 實驗性註解 `@ExperimentalPathApi`。

### 改進 String.replace 函式的效能

`String.replace()` 的新實作加快了函式執行速度。區分大小寫的變體使用基於 `indexOf` 的手動替換迴圈，而不區分大小寫的變體則使用正規表示式比對。

## Kotlin Android Extensions

在 1.4.20 中，Kotlin Android Extensions 外掛程式已棄用，且 `Parcelable` 實作產生器已移至獨立的外掛程式。

- [棄用 synthetic views](#deprecation-of-synthetic-views)
- [Parcelable 實作產生器的新外掛程式](#new-plugin-for-parcelable-implementation-generator)

### 棄用 synthetic views

「Synthetic views」在很久以前就出現在 Kotlin Android Extensions 外掛程式中，目的是簡化與 UI 元素的互動並減少樣板程式碼。現在 Google 提供了一個原生的機制來執行相同的操作：Android Jetpack 的 [view bindings](https://developer.android.com/topic/libraries/view-binding)，而我們正棄用 synthetic views 以轉向使用後者。

我們將 Parcelable 實作產生器從 `kotlin-android-extensions` 中提取出來，並開始對其餘部分（即 synthetic views）進行棄用週期。目前，它們仍可運作但會顯示棄用警告。未來，您需要將專案切換到其他解決方案。這裡有 [指引](https://goo.gle/kotlin-android-extensions-deprecation) 可協助您將 Android 專案從 synthetics 遷移到 view bindings。

### Parcelable 實作產生器的新外掛程式

`Parcelable` 實作產生器現在可在新的 `kotlin-parcelize` 外掛程式中使用。請套用此外掛程式而非 `kotlin-android-extensions`。

>`kotlin-parcelize` 與 `kotlin-android-extensions` 無法在同一個模組中同時套用。
>
{style="note"}

`@Parcelize` 註解已移至 `kotlinx.parcelize` 套件。

在 [Android 文件](https://developer.android.com/kotlin/parcelize) 中進一步了解 `Parcelable` 實作產生器。