[//]: # (title: Kotlin 1.5.0 的新特性)

<web-summary>閱讀 Kotlin 1.5.0 版本說明，內容涵蓋新的語言特性、Kotlin 多平台、JVM、Native、JS 的更新，以及 Gradle 和 Maven 的建置工具支援。</web-summary>

_[發佈日期：2021 年 5 月 5 日](releases.md#release-history)_

Kotlin 1.5.0 引入了新的語言特性、穩定的基於 IR 的 JVM 編譯器後端、效能提升，以及演進式變更，例如穩定實驗性功能並棄用過時的功能。

您也可以在 [發佈部落格文章](https://blog.jetbrains.com/kotlin/2021/05/kotlin-1-5-0-released/) 中找到變更概覽。

> 有關 Kotlin 發佈週期的資訊，請參閱 [Kotlin 發佈程序](releases.md)。
>
{style="tip"}

## 語言特性

Kotlin 1.5.0 帶來了在 [1.4.30 預覽](whatsnew1430.md#language-features) 中展示的新語言特性的穩定版本：
* [JVM records 支援](#jvm-records-support)
* [密封介面](#sealed-interfaces) 與 [密封類別改進](#package-wide-sealed-class-hierarchies)
* [內嵌類別](#inline-classes)

這些特性的詳細說明可在 [這篇部落格文章](https://blog.jetbrains.com/kotlin/2021/02/new-language-features-preview-in-kotlin-1-4-30/) 以及對應的 Kotlin 文件頁面中找到。

### JVM records 支援

Java 正在快速演進，為了確保 Kotlin 保持與其互操作性，我們引入了對其最新特性之一——[record 類別](https://openjdk.java.net/jeps/395) 的支援。

Kotlin 對 JVM records 的支援包括雙向互操作性：
* 在 Kotlin 程式碼中，您可以像使用具有屬性的典型類別一樣使用 Java record 類別。
* 要在 Java 程式碼中將 Kotlin 類別作為 record 使用，請將其設為 `data` 類別並使用 `@JvmRecord` 註解進行標記。

```kotlin
@JvmRecord
data class User(val name: String, val age: Int)
```

[進一步了解在 Kotlin 中使用 JVM records](jvm-records.md)。

<video src="https://www.youtube.com/v/iyEWXyuuseU" title="Support for JVM Records in Kotlin 1.5.0"/>

### 密封介面

Kotlin 介面現在可以使用 `sealed` 限定詞，其對介面的作用方式與對類別的作用方式相同：密封介面的所有實作在編譯時都是已知的。

```kotlin
sealed interface Polygon
```

您可以利用這一點，例如編寫窮舉式的 `when` 運算式。

```kotlin
fun draw(polygon: Polygon) = when (polygon) {
   is Rectangle -> // ...
   is Triangle -> // ...
   // 不需要 else - 所有可能的實作都已涵蓋
}

```

此外，密封介面支援更靈活的受限類別階層結構，因為一個類別可以直接繼承多個密封介面。

```kotlin
class FilledRectangle: Polygon, Fillable
```

[進一步了解密封介面](sealed-classes.md)。

<video src="https://www.youtube.com/v/d_Mor21W_60" title="Sealed Interfaces and Sealed Classes Improvements"/>

### 全套件範圍的密封類別階層結構

密封類別現在可以在同一個編譯單元和同一個套件的所有檔案中擁有子類別。以前，所有子類別都必須出現在同一個檔案中。

直接子類別可以是頂層的，也可以巢狀在任何數量的其他命名類別、命名介面或命名物件中。

密封類別的子類別必須具有適當限定的名稱——它們不能是區域或匿名物件。

[進一步了解密封類別階層結構](sealed-classes.md#inheritance)。

### 內嵌類別

內嵌類別是 [基於值（value-based）](https://github.com/Kotlin/KEEP/blob/master/notes/value-classes.md) 類別的一個子集，僅持有值。您可以將它們用作特定型別值的包裝器，而不會產生記憶體分配帶來的額外開銷。

內嵌類別可以使用類別名稱前的 `value` 限定詞來宣告：

```kotlin
value class Password(val s: String)
```

JVM 後端還需要一個特殊的 `@JvmInline` 註解：

```kotlin
@JvmInline
value class Password(val s: String)
```

`inline` 限定詞現在已被棄用並會顯示警告。

[進一步了解內嵌類別](inline-classes.md)。

<video src="https://www.youtube.com/v/LpqvtgibbsQ" title="From Inline to Value Classes"/>

## Kotlin/JVM

Kotlin/JVM 獲得了許多改進，包括內部改進和麵向使用者的改進。以下是其中最值得注意的：

* [穩定的 JVM IR 後端](#stable-jvm-ir-backend)
* [新的預設 JVM 目標版本：1.8](#new-default-jvm-target-1-8)
* [透過 invokedynamic 的 SAM 轉接器](#sam-adapters-via-invokedynamic)
* [透過 invokedynamic 的 Lambda](#lambdas-via-invokedynamic)
* [棄用 @JvmDefault 和舊的 Xjvm-default 模式](#deprecation-of-jvmdefault-and-old-xjvm-default-modes)
* [處理可 null 性註解的改進](#improvements-to-handling-nullability-annotations)

### 穩定的 JVM IR 後端

Kotlin/JVM 編譯器的 [基於 IR 的後端](whatsnew14.md#new-jvm-ir-backend) 現在已達到 [穩定](components-stability.md) 並預設啟用。

從 [Kotlin 1.4.0](whatsnew14.md) 開始，基於 IR 的後端的早期版本已提供預覽，現在它已成為語言版本 `1.5` 的預設設定。舊後端在較早的語言版本中仍預設使用。

您可以在 [這篇部落格文章](https://blog.jetbrains.com/kotlin/2021/02/the-jvm-backend-is-in-beta-let-s-make-it-stable-together/) 中找到有關 IR 後端優點及其未來發展的更多詳細資訊。

如果您需要在 Kotlin 1.5.0 中使用舊後端，可以在專案的組建組態檔案中加入以下行：

* 在 Gradle 中：

 <tabs group="build-script">
 <tab title="Kotlin" group-key="kotlin">

 ```kotlin
 tasks.withType<org.jetbrains.kotlin.gradle.dsl.KotlinJvmCompile> {
   kotlinOptions.useOldBackend = true
 }
 ```

 </tab>
 <tab title="Groovy" group-key="groovy">

 ```groovy
 tasks.withType(org.jetbrains.kotlin.gradle.dsl.KotlinJvmCompile) {
  kotlinOptions.useOldBackend = true
 }
 ```

 </tab>
 </tabs>

* 在 Maven 中：

 ```xml
 <configuration>
     <args>
         <arg>-Xuse-old-backend</arg>
     </args>
 </configuration>
 ```

### 新的預設 JVM 目標版本：1.8

Kotlin/JVM 編譯的預設目標版本現在是 `1.8`。`1.6` 目標版本已被棄用。

如果您需要為 JVM 1.6 進行組建，仍然可以切換到此目標版本。了解如何操作：

* [在 Gradle 中](gradle-compiler-options.md#attributes-specific-to-jvm)
* [在 Maven 中](maven-kotlin-compiler.md#attributes-specific-to-jvm)
* [在命令列編譯器中](compiler-reference.md#jvm-target-version)

### 透過 invokedynamic 的 SAM 轉接器

Kotlin 1.5.0 現在使用動態呼叫 (`invokedynamic`) 來編譯 SAM (Single Abstract Method) 轉換：
* 如果 SAM 型別是 [Java 介面](java-interop.md#sam-conversions)，則適用於任何運算式
* 如果 SAM 型別是 [Kotlin 函式式介面](fun-interfaces.md#sam-conversions)，則適用於 Lambda

新實作使用了 [`LambdaMetafactory.metafactory()`](https://docs.oracle.com/javase/8/docs/api/java/lang/invoke/LambdaMetafactory.html#metafactory-java.lang.invoke.MethodHandles.Lookup-java.lang.String-java.lang.invoke.MethodType-java.lang.invoke.MethodType-java.lang.invoke.MethodHandle-java.lang.invoke.MethodType-)，且編譯期間不再產生輔助包裝類別。這減少了應用程式 JAR 的大小，從而提高了 JVM 啟動效能。

要回復到基於匿名類別產生的舊實作方案，請加入編譯器選項 `-Xsam-conversions=class`。

了解如何在 [Gradle](gradle-compiler-options.md)、[Maven](maven-kotlin-compiler.md#specify-compiler-options) 和 [命令列編譯器](compiler-reference.md#compiler-options) 中加入編譯器選項。

### 透過 invokedynamic 的 Lambda

> 將普通 Kotlin Lambda 編譯為 invokedynamic 是 [實驗性](components-stability.md) 功能。它可能隨時被刪除或更改。需要手動啟用（見下文詳情），且您應僅出於評估目的使用它。我們非常希望在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-45375) 上聽到您對此的回饋。
>
{style="warning"}

Kotlin 1.5.0 引入了將普通 Kotlin Lambda（未轉換為函式式介面執行個體）編譯為動態呼叫 (`invokedynamic`) 的實驗性支援。該實作透過使用 [`LambdaMetafactory.metafactory()`](https://docs.oracle.com/javase/8/docs/api/java/lang/invoke/LambdaMetafactory.html#metafactory-java.lang.invoke.MethodHandles.Lookup-java.lang.String-java.lang.invoke.MethodType-java.lang.invoke.MethodType-java.lang.invoke.MethodHandle-java.lang.invoke.MethodType-) 產生更輕量級的二進位檔，這實際上是在執行階段產生必要的類別。目前與普通 Lambda 編譯相比，它有三個限制：

* 編譯為 invokedynamic 的 Lambda 不可序列化。
* 對此類 Lambda 呼叫 `toString()` 會產生可讀性較差的字串表示形式。
* 實驗性的 [`reflect`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.jvm/reflect.html) API 不支援使用 `LambdaMetafactory` 建立的 Lambda。

要嘗試此功能，請加入 `-Xlambdas=indy` 編譯器選項。如果您能透過此 [YouTrack 票證](https://youtrack.jetbrains.com/issue/KT-45375) 分享您的回饋，我們將不勝感激。

了解如何在 [Gradle](gradle-compiler-options.md)、[Maven](maven-kotlin-compiler.md#specify-compiler-options) 和 [命令列編譯器](compiler-reference.md#compiler-options) 中加入編譯器選項。

### 棄用 @JvmDefault 和舊的 Xjvm-default 模式

在 Kotlin 1.4.0 之前，有 `@JvmDefault` 註解以及 `-Xjvm-default=enable` 和 `-Xjvm-default=compatibility` 模式。它們用於為 Kotlin 介面中的任何特定非抽象成員建立 JVM 預設方法。

在 Kotlin 1.4.0 中，我們 [引入了新的 `Xjvm-default` 模式](https://blog.jetbrains.com/kotlin/2020/07/kotlin-1-4-m3-generating-default-methods-in-interfaces/)，為整個專案開啟預設方法產生功能。

在 Kotlin 1.5.0 中，我們棄用了 `@JvmDefault` 和舊的 Xjvm-default 模式：`-Xjvm-default=enable` 和 `-Xjvm-default=compatibility`。

[進一步了解 Java 互操作中的預設方法](java-to-kotlin-interop.md#default-methods-in-interfaces)。

### 處理可 null 性註解的改進

Kotlin 支援透過 [可 null 性註解](java-interop.md#nullability-annotations) 處理來自 Java 的型別可 null 性資訊。Kotlin 1.5.0 為該特性引入了多項改進：

* 它會讀取作為相依性使用的已編譯 Java 程式庫中型別引數上的可 null 性註解。
* 它支援針對以下目標具有 `TYPE_USE` 的可 null 性註解：
  * 陣列
  * 可變參數 (Varargs)
  * 欄位
  * 型別參數及其邊界
  * 基底類別和介面的型別引數
* 如果一個可 null 性註解有多個適用於某型別的目標，且其中一個目標是 `TYPE_USE`，則優先使用 `TYPE_USE`。
  例如，如果 `@Nullable` 同時支援 `TYPE_USE` 和 `METHOD` 作為目標，則方法簽章 `@Nullable String[] f()` 會變成 `fun f(): Array<String?>!`。

對於這些新支援的情況，從 Kotlin 呼叫 Java 時使用錯誤的型別可 null 性會產生警告。使用 `-Xtype-enhancement-improvements-strict-mode` 編譯器選項可為這些情況啟用嚴格模式（並報告錯誤）。

[進一步了解空值安全性與平台型別](java-interop.md#null-safety-and-platform-types)。

## Kotlin/Native

Kotlin/Native 現在效能更高且更穩定。顯著的變化包括：
* [效能提升](#performance-improvements)
* [停用記憶體洩漏檢查器](#deactivation-of-the-memory-leak-checker)

### 效能提升

在 1.5.0 中，Kotlin/Native 獲得了一系列效能提升，加快了編譯和執行速度。

[編譯器快取](https://blog.jetbrains.com/kotlin/2020/03/kotlin-1-3-70-released/#kotlin-native) 現在在 `linuxX64`（僅限 Linux 主機）和 `iosArm64` 目標的偵錯模式下受支援。啟用編譯器快取後，除了第一次之外，大多數偵錯編譯的速度都會快得多。測量顯示，在我們的測試專案上速度提高了約 200%。

要為新目標使用編譯器快取，請在專案的 `gradle.properties` 中加入以下行來手動啟用：
* 對於 `linuxX64`：`kotlin.native.cacheKind.linuxX64=static`
* 對於 `iosArm64`：`kotlin.native.cacheKind.iosArm64=static`

如果您在啟用編譯器快取後遇到任何問題，請回報至我們的問題追蹤器 [YouTrack](https://kotl.in/issue)。

其他改進加快了 Kotlin/Native 程式碼的執行速度：
* 簡單的屬性存取子會被內嵌。
* 字串常值上的 `trimIndent()` 會在編譯期間求值。

### 停用記憶體洩漏檢查器

內建的 Kotlin/Native 記憶體洩漏檢查器已預設停用。

它最初是為內部使用而設計的，且僅能發現有限情況下的洩漏，而非所有情況。此外，後來發現它存在可能導致應用程式當機的問題。因此，我們決定關閉記憶體洩漏檢查器。

記憶體洩漏檢查器在某些情況下（例如單元測試）仍然有用。對於這些情況，您可以透過加入以下程式碼列來啟用它：

```kotlin
Platform.isMemoryLeakCheckerActive = true
```

請注意，不建議為應用程式執行階段啟用該檢查器。

## Kotlin/JS

Kotlin/JS 在 1.5.0 中獲得了演進式變更。我們正繼續致力於推動 [JS IR 編譯器後端](js-ir-compiler.md) 走向穩定，並發佈了其他更新：

* [將 webpack 升級至版本 5](#upgrade-to-webpack-5)
* [適用於 IR 編譯器的架構與程式庫](#frameworks-and-libraries-for-the-ir-compiler)

### 升級至 webpack 5

Kotlin/JS Gradle 外掛程式現在為瀏覽器目標使用 webpack 5，而非 webpack 4。這是一個重大的 webpack 升級，帶來了不相容的變更。如果您使用的是自訂 webpack 配置，請務必查看 [webpack 5 版本說明](https://webpack.js.org/blog/2020-10-10-webpack-5-release/)。

[進一步了解使用 webpack 打包 Kotlin/JS 專案](js-project-setup.md#webpack-bundling)。

### 適用於 IR 編譯器的架構與程式庫

> Kotlin/JS IR 編譯器處於 [Alpha](components-stability.md) 階段。未來可能會發生不相容的變更，並需要手動遷移。我們非常希望在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 上聽到您對此的回饋。
>
{style="warning"}

在致力於 Kotlin/JS 編譯器的基於 IR 的後端的同時，我們鼓勵並幫助程式庫作者以 `both` 模式建置其專案。這意味著他們能夠為兩種 Kotlin/JS 編譯器產出構件，從而壯大新編譯器的生態系統。

許多知名架構和程式庫已支援 IR 後端：[KVision](https://kvision.io/)、[fritz2](https://www.fritz2.dev/)、[doodle](https://github.com/nacular/doodle) 等。如果您在專案中使用它們，則已經可以使用 IR 後端進行建兒並查看其帶來的優點。

如果您正在編寫自己的程式庫，請以 'both' 模式編譯，以便您的客戶也可以將其與新編譯器一起使用。

## Kotlin 多平台

在 Kotlin 1.5.0 中，[為每個平台選擇測試相依性的操作已簡化](#simplified-test-dependencies-usage-in-multiplatform-projects)，現在由 Gradle 外掛程式自動完成。

新的 [用於獲取字元類別的 API 現在可在多平台專案中使用](#new-api-for-getting-a-char-category-now-available-in-multiplatform-code)。

## 標準函式庫

標準函式庫獲得了一系列變更和改進，從穩定實驗性部分到加入新功能：

* [穩定的無符號整數型別](#stable-unsigned-integer-types)
* [穩定的與區域設定無關的用於大寫/小寫文字的 API](#stable-locale-agnostic-api-for-upper-lowercasing-text)
* [穩定的 Char 到整數轉換 API](#stable-char-to-integer-conversion-api)
* [穩定的 Path API](#stable-path-api)
* [向下取整除法與 mod 運算子](#floored-division-and-the-mod-operator)
* [Duration API 變更](#duration-api-changes)
* [用於獲取字元類別的新 API 現在可在多平台程式碼中使用](#new-api-for-getting-a-char-category-now-available-in-multiplatform-code)
* [新的集合函式 firstNotNullOf()](#new-collections-function-firstnotnullof)
* [嚴格版本的 String?.toBoolean()](#strict-version-of-string-toboolean)

您可以在 [這篇部落格文章](https://blog.jetbrains.com/kotlin/2021/04/kotlin-1-5-0-rc-released) 中進一步了解標準函式庫的變更。

<video src="https://www.youtube.com/v/MyTkiT2I6-8" title="New Standard Library Features"/>

### 穩定的無符號整數型別

`UInt`、`ULong`、`UByte`、`UShort` 無符號整數型別現在已達到 [穩定](components-stability.md)。這些型別上的運算、區間和數列也是如此。無符號陣列及其運算仍處於 Beta 階段。

[進一步了解無符號整數型別](unsigned-integer-types.md)。

### 穩定的與區域設定無關的用於大寫/小寫文字的 API

此版本帶來了新的與區域設定無關的用於大寫/小寫文字轉換的 API。它提供了 `toLowerCase()`、`toUpperCase()`、`capitalize()` 和 `decapitalize()` 等對區域設定敏感的 API 函式的替代方案。新 API 可協助您避免因不同區域設定而產生的錯誤。

Kotlin 1.5.0 提供了以下完全 [穩定](components-stability.md) 的替代方案：

* 對於 `String` 函式：

  |**早期版本**|**1.5.0 替代方案**|
  | --- | --- |
  |`String.toUpperCase()`|`String.uppercase()`|
  |`String.toLowerCase()`|`String.lowercase()`|
  |`String.capitalize()`|`String.replaceFirstChar { it.uppercase() }`|
  |`String.decapitalize()`|`String.replaceFirstChar { it.lowercase() }`|

* 對於 `Char` 函式：

  |**早期版本**|**1.5.0 替代方案**|
  | --- | --- |
  |`Char.toUpperCase()`|`Char.uppercaseChar(): Char`<br/>`Char.uppercase(): String`|
  |`Char.toLowerCase()`|`Char.lowercaseChar(): Char`<br/>`Char.lowercase(): String`|
  |`Char.toTitleCase()`|`Char.titlecaseChar(): Char`<br/>`Char.titlecase(): String`|

> 對於 Kotlin/JVM，還有具有顯式 `Locale` 參數的多載 `uppercase()`、`lowercase()` 和 `titlecase()` 函式。
>
{style="note"}

舊的 API 函式被標記為棄用，並將在未來的版本中移除。

請參閱 [KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/stdlib/locale-agnostic-case-conversions.md) 中文字處理函式變更的完整清單。

### 穩定的 Char 到整數轉換 API

從 Kotlin 1.5.0 開始，新的字元到代碼 (char-to-code) 和字元到數字 (char-to-digit) 轉換函式已達到 [穩定](components-stability.md)。這些函式取代了目前的 API 函式，後者常與類似的字串到整數 (string-to-Int) 轉換混淆。

新 API 消除了這種命名混淆，使程式碼行為更加透明和明確。

此版本引入了 `Char` 轉換，分為以下幾組命名清晰的函式：

* 獲取 `Char` 的整數代碼以及從給定代碼建構 `Char` 的函式：

 ```kotlin
 fun Char(code: Int): Char
 fun Char(code: UShort): Char
 val Char.code: Int
 ```

* 將 `Char` 轉換為其代表的數字值的函式：

 ```kotlin
 fun Char.digitToInt(radix: Int): Int
 fun Char.digitToIntOrNull(radix: Int): Int?
 ```

* `Int` 的擴充函式，用於將其代表的非負單個數字轉換為對應的 `Char` 表示：

 ```kotlin
 fun Int.digitToChar(radix: Int): Char
 ```

舊的轉換 API，包括具有其所有實作（除了 `Int.toChar()` 之外）的 `Number.toChar()` 以及用於轉換為數值型別的 `Char` 擴充（如 `Char.toInt()`），現已棄用。

[進一步了解 KEEP 中的 Char 到整數轉換 API](https://github.com/Kotlin/KEEP/blob/master/proposals/stdlib/char-int-conversions.md)。

### 穩定的 Path API

具有 `java.nio.file.Path` 擴充的 [實驗性 Path API](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io.path/java.nio.file.-path/) 現在已達到 [穩定](components-stability.md)。

```kotlin
// 使用除法 (/) 運算子建構路徑
val baseDir = Path("/base")
val subDir = baseDir / "subdirectory"

// 列出目錄中的檔案
val kotlinFiles: `List<Path>` = Path("/home/user").listDirectoryEntries("*.kt")
```

[進一步了解 Path API](whatsnew1420.md#extensions-for-java-nio-file-path)。

### 向下取整除法與 mod 運算子

標準函式庫中加入了新的模數運算操作：
* `floorDiv()` 傳回 [向下取整除法](https://en.wikipedia.org/wiki/Floor_and_ceiling_functions) 的結果。它適用於整數型別。
* `mod()` 傳回向下取整除法的餘數（_modulus_）。它適用於所有數值型別。

這些運算看起來與現有的 [整數除法](numbers.md#integer-division) 和 [rem()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int/rem.html) 函式（或 `%` 運算子）非常相似，但在負數上的運作方式不同：
* `a.floorDiv(b)` 與一般的 `/` 不同之處在於，`floorDiv` 將結果向下取整（朝向較小的整數），而 `/` 則將結果截斷為更接近 0 的整數。
* `a.mod(b)` 是 `a` 與 `a.floorDiv(b) * b` 之間的差值。它要麼為零，要麼與 `b` 符號相同，而 `a % b` 的符號則可能不同。

```kotlin
fun main() {
//sampleStart
    println("向下取整除法 -5/3: ${(-5).floorDiv(3)}")
    println( "模數 (Modulus): ${(-5).mod(3)}")
    
    println("截斷除法 -5/3: ${-5 / 3}")
    println( "餘數: ${-5 % 3}")
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

### Duration API 變更

> Duration API 是 [實驗性](components-stability.md) 功能。它可能隨時被刪除或更改。僅出於評估目的使用它。我們非常希望在 [YouTrack](https://youtrack.jetbrains.com/issues/KT) 上聽到您對此的回饋。
>
{style="warning"}

有一個實驗性的 [Duration](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) 類別，用於表示不同時間單位下的持續時間量。在 1.5.0 中， Duration API 獲得了以下變更：

* 內部值表示現在使用 `Long` 而非 `Double` 以提供更好的精度。
* 提供了新的 API 用於轉換為特定的 `Long` 型別時間單位。它取代了操作 `Double` 值且現已棄用的舊 API。例如，[`Duration.inWholeMinutes`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/in-whole-minutes.html) 傳回以 `Long` 表示的持續時間值，並取代了 `Duration.inMinutes`。
* 提供了新的伴隨函式用於從數字建構 `Duration`。例如，[`Duration.seconds(Int)`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/seconds.html) 建立一個表示整數秒數的 `Duration` 物件。舊的擴充屬性（如 `Int.seconds`）現已棄用。

```kotlin
import kotlin.time.Duration
import kotlin.time.ExperimentalTime

@ExperimentalTime
fun main() {
//sampleStart
    val duration = Duration.milliseconds(120000)
    println("120000 毫秒中有 ${duration.inWholeSeconds} 秒，即 ${duration.inWholeMinutes} 分鐘")
//sampleEnd
}
```
{validate="false"}

### 用於獲取字元類別的新 API 現在可在多平台程式碼中使用

Kotlin 1.5.0 引入了新的 API，用於在多平台專案中根據 Unicode 獲取字元的類別。現在所有平台和共同程式碼中都可以使用多個函式。

檢查字元是否為字母或數字的函式：
* [`Char.isDigit()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-digit.html)
* [`Char.isLetter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-letter.html)
* [`Char.isLetterOrDigit()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-letter-or-digit.html)

```kotlin
fun main() {
//sampleStart
    val chars = listOf('a', '1', '+')
    val (letterOrDigitList, notLetterOrDigitList) = chars.partition { it.isLetterOrDigit() }
    println(letterOrDigitList) // [a, 1]
    println(notLetterOrDigitList) // [+]
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

檢查字元大小寫的函式：
* [`Char.isLowerCase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-lower-case.html)
* [`Char.isUpperCase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-upper-case.html)
* [`Char.isTitleCase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-title-case.html)

```kotlin
fun main() {
//sampleStart
    val chars = listOf('ǅ', 'ǈ', 'ǋ', 'ǲ', '1', 'A', 'a', '+')
    val (titleCases, notTitleCases) = chars.partition { it.isTitleCase() }
    println(titleCases) // [ǅ, ǈ, ǋ, ǲ]
    println(notTitleCases) // [1, A, a, +]
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

其他一些函式：
* [`Char.isDefined()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-defined.html)
* [`Char.isISOControl()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-i-s-o-control.html)

屬性 [`Char.category`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/category.html) 及其回傳型別列舉類別 [`CharCategory`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-char-category/)（指示字元根據 Unicode 的一般類別）現在也可用於多平台專案中。

[進一步了解字元](characters.md)。

### 新的集合函式 firstNotNullOf()

新的 [`firstNotNullOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-not-null-of.html) 和 [`firstNotNullOfOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-not-null-of-or-null.html) 函式結合了 [`mapNotNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map-not-null.html) 與 [`first()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first.html) 或 [`firstOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/first-or-null.html)。它們使用自訂選擇器函式映射原始集合，並傳回第一個非 null 值。如果沒有這樣的值，`firstNotNullOf()` 會拋出例外，而 `firstNotNullOfOrNull()` 會傳回 null。

```kotlin
fun main() {
//sampleStart
    val data = listOf("Kotlin", "1.5")
    println(data.firstNotNullOf(String::toDoubleOrNull))
    println(data.firstNotNullOfOrNull(String::toIntOrNull))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

### 嚴格版本的 String?.toBoolean()

兩個新函式引入了現有 [String?.toBoolean()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-boolean.html) 的區分大小寫嚴格版本：
* [`String.toBooleanStrict()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-boolean-strict.html) 對除了常值 `true` 和 `false` 之外的所有輸入拋出例外。
* [`String.toBooleanStrictOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-boolean-strict-or-null.html) 對除了常值 `true` 和 `false` 之外的所有輸入傳回 null。

```kotlin
fun main() {
//sampleStart
    println("true".toBooleanStrict())
    println("1".toBooleanStrictOrNull())
    // println("1".toBooleanStrict()) // 例外
//sampleEnd    
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

## kotlin-test 程式庫
[kotlin-test](https://kotlinlang.org/api/latest/kotlin.test/) 程式庫引入了一些新功能：
* [簡化多平台專案中的測試相依性使用](#simplified-test-dependencies-usage-in-multiplatform-projects)
* [自動為 Kotlin/JVM 原始碼集選擇測試框架](#automatic-selection-of-a-testing-framework-for-kotlin-jvm-source-sets)
* [斷言函式更新](#assertion-function-updates)

### 簡化多平台專案中的測試相依性使用

現在您可以使用 `kotlin-test` 相依性在 `commonTest` 原始碼集中加入測試相依性，Gradle 外掛程式將為每個測試原始碼集推斷對應的平台相依性：
* 對於 JVM 原始碼集使用 `kotlin-test-junit`，請參閱 [自動選擇 Kotlin/JVM 原始碼集的測試框架](#automatic-selection-of-a-testing-framework-for-kotlin-jvm-source-sets)
* 對於 Kotlin/JS 原始碼集使用 `kotlin-test-js`
* 對於共同原始碼集使用 `kotlin-test-common` 和 `kotlin-test-annotations-common`
* 對於 Kotlin/Native 原始碼集不需要額外的構件

此外，您可以在任何共享或特定於平台的原始碼集中使用 `kotlin-test` 相依性。

現有的具有明確相依性的 kotlin-test 設定將繼續在 Gradle 和 Maven 中運作。

進一步了解 [在測試程式庫上設定相依性](gradle-configure-project.md#set-dependencies-on-test-libraries)。

### 自動為 Kotlin/JVM 原始碼集選擇測試框架

Gradle 外掛程式現在會自動選擇並加入測試框架的相依性。您只需要在共同原始碼集中加入相依性 `kotlin-test` 即可。

Gradle 預設使用 JUnit 4。因此，`kotlin("test")` 相依性會解析為 JUnit 4 的變體，即 `kotlin-test-junit`：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        val commonTest by getting {
            dependencies {
                implementation(kotlin("test")) // 這會傳遞性地引入
                                               // 對 JUnit 4 的相依性
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
        commonTest {
            dependencies {
                implementation kotlin("test") // 這會傳遞性地引入 
                                              // 對 JUnit 4 的相依性
            }
        }
    }
}
```

</tab>
</tabs>

您可以透過在測試任務中呼叫 [`useJUnitPlatform()`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useJUnitPlatform) 或 [`useTestNG()`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/testing/Test.html#useTestNG) 來選擇 JUnit 5 或 TestNG：

```groovy
tasks {
    test {
        // 啟用 TestNG 支援
        useTestNG()
        // 或
        // 啟用 JUnit Platform (亦稱 JUnit 5) 支援
        useJUnitPlatform()
    }
}
```

您可以透過在專案的 `gradle.properties` 中加入 `kotlin.test.infer.jvm.variant=false` 來停用自動測試框架選擇。

進一步了解 [在測試程式庫上設定相依性](gradle-configure-project.md#set-dependencies-on-test-libraries)。

###  斷言函式更新

此版本帶來了新的斷言函式並改進了現有的函式。

`kotlin-test` 程式庫現在具有以下功能：

* **檢查值的型別**

  您可以使用新的 `assertIs<T>` 和 `assertIsNot<T>` 來檢查值的型別：

  ```kotlin
  @Test
  fun testFunction() {
      val s: Any = "test"
      assertIs<String>(s)  // 如果斷言失敗，則拋出提及 s 實際型別的 AssertionError
      // 由於 assertIs 中的契約，現在可以列印 s.length
      println("${s.length}")
  }
  ```

  由於型別抹除，在以下範例中，此斷言函式僅檢查 `value` 是否為 `List` 型別，而不檢查它是否為特定 `String` 元素型別的列表：`assertIs<List<String>>(value)`。

* **比較陣列、序列和任意可迭代物件的容器內容**

  為了解決不實作 [結構相等性](equality.md#structural-equality) 的不同集合比較內容的需求，提供了一組新的多載 `assertContentEquals()` 函式：

  ```kotlin
  @Test
  fun test() {
      val expectedArray = arrayOf(1, 2, 3)
      val actualArray = Array(3) { it + 1 }
      assertContentEquals(expectedArray, actualArray)
  }
  ```

* **為 `Double` 和 `Float` 數字新增 `assertEquals()` 和 `assertNotEquals()` 的多載**

  `assertEquals()` 函式新增了多載，使得以絕對精度比較兩個 `Double` 或 `Float` 數字成為可能。精度值指定為函式的第三個參數：

  ```kotlin
   @Test
  fun test() {
      val x = sin(PI)

      // 精度參數
      val tolerance = 0.000001

      assertEquals(0.0, x, tolerance)
  }
  ```

* **用於檢查集合和元素內容的新函式**

  您現在可以使用 `assertContains()` 函式來檢查集合或元素是否包含某些內容。您可以將其與具有 `contains()` 運算子的 Kotlin 集合和元素（如 `IntRange`、`String` 等）搭配使用：

  ```kotlin
  @Test
  fun test() {
      val sampleList = listOf<String>("sample", "sample2")
      val sampleString = "sample"
      assertContains(sampleList, sampleString)  // 集合中的元素
      assertContains(sampleString, "amp")       // 字串中的子字串
  }
  ```

* **`assertTrue()`、`assertFalse()`、`expect()` 函式現在是內嵌的**

  從現在開始，您可以將這些作為內嵌函式使用，因此可以在 Lambda 運算式內部呼叫 [暫停函式](composing-suspending-functions.md)：

  ```kotlin
  @Test
  fun test() = runBlocking<Unit> {
      val deferred = async { "Kotlin is nice" }
      assertTrue("Kotlin substring should be present") {
          deferred.await() .contains("Kotlin")
      }
  }
  ```

## kotlinx 程式庫

隨同 Kotlin 1.5.0，我們正在發佈新版本的 kotlinx 程式庫：
* `kotlinx.coroutines` [1.5.0-RC](#coroutines-1-5-0-rc)
* `kotlinx.serialization` [1.2.1](#serialization-1-2-1)
* `kotlinx-datetime` [0.2.0](#datetime-0-2-0)

### Coroutines 1.5.0-RC

`kotlinx.coroutines` [1.5.0-RC](https://github.com/Kotlin/kotlinx.coroutines/releases/tag/1.5.0-RC) 已推出，包含：
* [新的通道 API](channels.md)
* 穩定的 [反應式整合](async-programming.md#reactive-extensions)
* 以及更多內容

從 Kotlin 1.5.0 開始，[實驗性協同程式](whatsnew14.md#exclusion-of-the-deprecated-experimental-coroutines) 已停用，且不再支援 `-Xcoroutines=experimental` 旗標。

在 [變更日誌](https://github.com/Kotlin/kotlinx.coroutines/releases/tag/1.5.0-RC) 和 [`kotlinx.coroutines` 1.5.0 發佈部落格文章](https://blog.jetbrains.com/kotlin/2021/05/kotlin-coroutines-1-5-0-released/) 中了解更多資訊。

<video src="https://www.youtube.com/v/EVLnWOcR0is" title="kotlinx.coroutines 1.5.0"/>

### Serialization 1.2.1

`kotlinx.serialization` [1.2.1](https://github.com/Kotlin/kotlinx.serialization/releases/tag/v1.2.1) 已推出，包含：
* JSON 序列化效能的改進
* JSON 序列化中對多個名稱的支援
* 從 `@Serializable` 類別產生實驗性的 .proto 結構定義
* 以及更多內容

在 [變更日誌](https://github.com/Kotlin/kotlinx.serialization/releases/tag/v1.2.1) 和 [`kotlinx.serialization` 1.2.1 發佈部落格文章](https://blog.jetbrains.com/kotlin/2021/05/kotlinx-serialization-1-2-released/) 中了解更多資訊。

<video src="https://www.youtube.com/v/698I_AH8h6s" title="kotlinx.serialization 1.2.1"/>

### dateTime 0.2.0

`kotlinx-datetime` [0.2.0](https://github.com/Kotlin/kotlinx-datetime/releases/tag/v0.2.0) 已推出，包含：
* `@Serializable` 的 Datetime 物件
* 歸一化的 `DateTimePeriod` 和 `DatePeriod` API
* 以及更多內容

在 [變更日誌](https://github.com/Kotlin/kotlinx-datetime/releases/tag/v0.2.0) 和 [`kotlinx-datetime` 0.2.0 發佈部落格文章](https://blog.jetbrains.com/kotlin/2021/05/kotlinx-datetime-0-2-0-is-out/) 中了解更多資訊。

## 遷移至 Kotlin 1.5.0

IntelliJ IDEA 和 Android Studio 將在 Kotlin 外掛程式 1.5.0 可用時建議更新。

要將現有專案遷移至 Kotlin 1.5.0，只需將 Kotlin 版本更改為 `1.5.0` 並重新匯入您的 Gradle 或 Maven 專案。[了解如何更新至 Kotlin 1.5.0](releases.md#update-to-a-new-kotlin-version)。

要使用 Kotlin 1.5.0 開始新專案，請更新 Kotlin 外掛程式並從 **File** | **New** | **Project** 執行專案精靈。

新的命令列編譯器可在 [GitHub 發佈頁面](https://github.com/JetBrains/kotlin/releases/tag/v1.5.0) 下載。

Kotlin 1.5.0 是一個 [功能版本](kotlin-evolution-principles.md#language-and-tooling-releases)，因此可能會為語言帶來不相容的變更。在 [Kotlin 1.5 相容性指南](compatibility-guide-15.md) 中可以找到此類變更的詳細清單。