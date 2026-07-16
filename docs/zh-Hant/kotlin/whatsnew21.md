[//]: # (title: Kotlin 2.1.0 的新功能)

<web-summary>閱讀 Kotlin 2.1.0 版本說明，涵蓋新的語言特性、Kotlin Multiplatform、JVM、Native、JS 與 Wasm 的更新，以及 Gradle 和 Maven 的建置工具支援。</web-summary>

_[發佈日期：2024 年 11 月 27 日](releases.md#release-history)_

Kotlin 2.1.0 正式發佈！以下是主要的重點內容：

* **語言特性預覽**：[具有主體的 `when` 中的防護條件 (Guard conditions)](#guard-conditions-in-when-with-a-subject)、
  [非區域 (non-local) `break` 與 `continue`](#non-local-break-and-continue)，以及 [多錢符號字串插值 (multi-dollar string interpolation)](#multi-dollar-string-interpolation)。
* **K2 編譯器更新**：[編譯器檢查更加靈活](#extra-compiler-checks) 以及 [改進了 kapt 的實作](#improved-k2-kapt-implementation)。
* **Kotlin Multiplatform**：引入了 [Swift 匯出的基礎支援](#basic-support-for-swift-export)、
  [編譯器選項的穩定 Gradle DSL](#new-gradle-dsl-for-compiler-options-in-multiplatform-projects-promoted-to-stable) 等。
* **Kotlin/Native**：[改進了對 `iosArm64` 的支援](#iosarm64-promoted-to-tier-1) 與其他更新。
* **Kotlin/Wasm**：多項更新，包括 [支援增量編譯](#support-for-incremental-compilation)。
* **Gradle 支援**：[改進了與較新版本 Gradle 和 Android Gradle 外掛程式的相容性](#gradle-improvements)，
  以及 [Kotlin Gradle 外掛程式 API 的更新](#new-api-for-kotlin-gradle-plugin-extensions)。
* **文件**：[Kotlin 文件的重大改進](#documentation-updates)。

> 有關 Kotlin 發佈週期的資訊，請參閱 [Kotlin 發佈程序](releases.md)。
>
{style="tip"}

## IDE 支援

支援 2.1.0 的 Kotlin 外掛程式已隨附於最新版本的 IntelliJ IDEA 和 Android Studio 中。
您不需要在 IDE 中更新 Kotlin 外掛程式。
您唯一需要做的就是在組建指令碼中將 Kotlin 版本更改為 2.1.0。

詳情請參閱 [更新至新的 Kotlin 版本](releases.md#update-to-a-new-kotlin-version)。

## 語言

在發佈了帶有 K2 編譯器的 Kotlin 2.0.0 之後，JetBrains 團隊正專注於透過新特性來改進語言。
在此版本中，我們很高興宣佈幾項新的語言設計改進。

這些特性目前提供預覽，我們鼓勵您嘗試並分享您的回饋：

* [具有主體的 `when` 中的防護條件 (Guard conditions)](#guard-conditions-in-when-with-a-subject)
* [非區域 (non-local) `break` 與 `continue`](#non-local-break-and-continue)
* [多錢符號插值：改進字串常值中錢符號 ($) 的處理方式](#multi-dollar-string-interpolation)

> 所有的特性在啟用了 K2 模式的最新 2024.3 版本 IntelliJ IDEA 中都已獲得 IDE 支援。
>
> 進一步了解 [IntelliJ IDEA 2024.3 部落格文章](https://blog.jetbrains.com/idea/2024/11/intellij-idea-2024-3/)。
>
{style="tip"}

[查看 Kotlin 語言設計特性與提案的完整清單](kotlin-language-features-and-proposals.md)。

此版本還帶來了以下語言更新：

* [](#support-for-requiring-opt-in-to-extend-apis)
* [](#improved-overload-resolution-for-functions-with-generic-types)
* [](#improved-exhaustiveness-checks-for-when-expressions-with-sealed-classes)

### 具有主體的 when 中的防護條件

> 此特性處於 [預覽階段](kotlin-evolution-principles.md#pre-stable-features)，
> 且需要選擇性啟用 (opt-in)（詳見下文）。
> 
> 我們誠摯歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-71140) 提供回饋。
>
{style="warning"}

從 2.1.0 開始，您可以在具有主體的 `when` 運算式或陳述式中使用防護條件。

防護條件允許您為 `when` 運算式的分支包含多個條件，
使複雜的控制流程更加明確和簡潔，並能扁平化程式碼結構。

要在分支中包含防護條件，請將其放在主條件之後，並以 `if` 分隔：

```kotlin
sealed interface Animal {
    data class Cat(val mouseHunter: Boolean) : Animal {
        fun feedCat() {}
    }

    data class Dog(val breed: String) : Animal {
        fun feedDog() {}
    }
}

fun feedAnimal(animal: Animal) {
    when (animal) {
        // 僅包含主條件的分支。當 `animal` 為 `Dog` 時呼叫 `feedDog()`
        is Animal.Dog -> animal.feedDog()
        // 同時包含主條件和防護條件的分支。當 `animal` 為 `Cat` 且非 `mouseHunter` 時呼叫 `feedCat()`
        is Animal.Cat if !animal.mouseHunter -> animal.feedCat()
        // 如果以上條件都不匹配，則印出 "Unknown animal"
        else -> println("Unknown animal")
    }
}
```

在單個 `when` 運算式中，您可以結合使用帶有和不帶有防護條件的分支。
帶有防護條件的分支中的程式碼僅在主條件和防護條件均為 `true` 時執行。
如果主條件不匹配，則不會評估防護條件。 
此外，防護條件也支援 `else if`。

要在專案中啟用防護條件，請在命令列使用以下編譯器選項：

```bash
kotlinc -Xwhen-guards main.kt
```

或將其加入到 Gradle 組建檔案的 `compilerOptions {}` 區塊中：

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xwhen-guards")
    }
}
```

### 非區域 break 與 continue

> 此特性處於 [預覽階段](kotlin-evolution-principles.md#pre-stable-features)，
> 且需要選擇性啟用 (opt-in)（詳見下文）。
> 
> 我們誠摯歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-1436) 提供回饋。
>
{style="warning"}

Kotlin 2.1.0 增加了另一個期待已久特性的預覽：使用非區域 (non-local) `break` 與 `continue` 的能力。
此特性擴展了您在內嵌函式範圍內可以使用的工具集，並減少了專案中的樣板程式碼。

以前，您只能使用非區域 return。
現在，Kotlin 也支援非區域的 `break` 與 `continue` [跳轉運算式](returns.md)。
這意味著您可以在傳遞給封裝迴圈的內嵌函式的 Lambda 中套用它們：

```kotlin
fun processList(elements: List<Int>): Boolean {
    for (element in elements) {
        val variable = element.nullableMethod() ?: run {
            log.warning("Element is null or invalid, continuing...")
            continue
        }
        if (variable == 0) return true // 如果變數為零，傳回 true
    }
    return false
}
```

要在專案中嘗試此特性，請在命令列使用 `-Xnon-local-break-continue` 編譯器選項：

```bash
kotlinc -Xnon-local-break-continue main.kt
```

或將其加入到 Gradle 組建檔案的 `compilerOptions {}` 區塊中：

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xnon-local-break-continue")
    }
}
```

我們計劃在未來的 Kotlin 版本中使此特性穩定。 
如果您在使用非區域 `break` 與 `continue`時遇到任何問題， 
請回報至我們的 [問題追蹤器](https://youtrack.jetbrains.com/issue/KT-1436)。

### 多錢符號字串插值

> 此特性處於 [預覽階段](kotlin-evolution-principles.md#pre-stable-features)，
> 且需要選擇性啟用 (opt-in)（詳見下文）。
> 
> 我們誠摯歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-2425) 提供回饋。
>
{style="warning"}

Kotlin 2.1.0 引入了對多錢符號字串插值的支援， 
改進了字串常值中錢符號 (`$`) 的處理方式。
此特性在需要多個錢符號的內容中非常有用，
例如樣板引擎、JSON 架構或其他資料格式。

Kotlin 中的字串插值使用單個錢符號。 
然而，在字串中使用錢符號常值（這在財務資料和樣板系統中很常見）曾需要像 `${'$'}` 這樣的變通方法。
啟用了多錢符號插值特性後，您可以配置多少個錢符號會觸發插值， 
較少數量的錢符號則會被視為字串常值。

以下是使用多錢符號插值產生帶有占位符號的 JSON 架構多行字串的範例：

```kotlin
val `KClass<*>`.jsonSchema : String
    get() = $"""
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "$id": "https://example.com/product.schema.json",
      "$dynamicAnchor": "meta"
      "title": "${simpleName ?: qualifiedName ?: "unknown"}",
      "type": "object"
    }
    """
```

在此範例中，開頭的 `$` 意味著您需要 **兩個錢符號** (`$$`) 才能觸發插值。
它防止了 `$schema`、`$id` 和 `$dynamicAnchor` 被解釋為插值標記。

這種方法對於使用錢符號作為占位符號語法的系統特別有幫助。

要在專案中啟用此特性，請在命令列使用以下編譯器選項：

```bash
kotlinc -Xmulti-dollar-interpolation main.kt
```

或者，更新 Gradle 組建檔案的 `compilerOptions {}` 區塊：

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xmulti-dollar-interpolation")
    }
}
```

如果您的程式碼已經使用帶有單個錢符號的標準字串插值，則無需更改。
每當您在字串中需要錢符號常值時，您可以使用 `$`。

### 支援要求選擇性啟用以擴展 API

Kotlin 2.1.0 引入了 [`@SubclassOptInRequired`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-subclass-opt-in-required/) 註解，
這允許程式庫作者在使用者實作實驗性介面或繼承實驗性類別之前，要求明確的選擇性啟用 (opt-in)。

當程式庫 API 已足夠穩定可供使用，但可能會隨著新的抽象函式而演進時，
此特性非常有用，因為這會使其在繼承方面變得不穩定。

要向 API 元素添加選擇性啟用要求，請使用 `@SubclassOptInRequired`
註解並參照註解類別：

```kotlin
@RequiresOptIn(
level = RequiresOptIn.Level.WARNING,
message = "Interfaces in this library are experimental"
)
annotation class UnstableApi()

@SubclassOptInRequired(UnstableApi::class)
interface CoreLibraryApi
```

在此範例中，`CoreLibraryApi` 介面要求使用者在實作它之前進行選擇性啟用。
使用者可以像這樣選擇性啟用：

```kotlin
@OptIn(UnstableApi::class)
interface MyImplementation: CoreLibraryApi
```

> 當您使用 `@SubclassOptInRequired` 註解要求選擇性啟用時， 
> 該要求不會傳遞給任何 [內部類別或巢狀類別](nested-classes.md)。
>
{style="note"}

有關如何在 API 中使用 `@SubclassOptInRequired` 註解的實際範例，
請查看 `kotlinx.coroutines` 程式庫中的 [`SharedFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/)
介面。

### 改進具有泛型型別的函式的多載解析

以前，如果您為一個函式提供了多個多載，其中一些具有泛型型別的數值參數，
而另一些在相同位置具有函式型別，解析行為有時可能會不一致。

這導致了行為會根據您的多載是成員函數還是擴充方法而有所不同。
例如：

```kotlin
class KeyValueStore<K, V> {
    fun store(key: K, value: V) {} // 1
    fun store(key: K, lazyValue: () -> V) {} // 2
}

fun <K, V> KeyValueStore<K, V>.storeExtension(key: K, value: V) {} // 1 
fun <K, V> KeyValueStore<K, V>.storeExtension(key: K, lazyValue: () -> V) {} // 2

fun test(kvs: KeyValueStore<String, Int>) {
    // 成員函數
    kvs.store("", 1)    // 解析為 1
    kvs.store("") { 1 } // 解析為 2

    // 擴充方法
    kvs.storeExtension("", 1)    // 解析為 1
    kvs.storeExtension("") { 1 } // 無法解析
}
```

在此範例中，`KeyValueStore` 類別對 `store()` 函式有兩個多載，
其中一個多載具有泛型型別 `K` 和 `V` 的函式參數，
另一個具有傳回泛型型別 `V` 的 Lambda 函式。
同樣地，擴充方法 `storeExtension()` 也有兩個多載。

當呼叫 `store()` 函式（帶有或不帶有 Lambda 函式）時，
編譯器成功解析了正確的多載。
然而，當帶有 Lambda 函式呼叫擴充方法 `storeExtension()` 時，
編譯器沒有解析正確的多載，因為它錯誤地認為兩個多載都適用。

為了修復此問題，我們引入了一種新的啟發式方法，以便編譯器在根據其他引數的資訊，
發現具有泛型型別的函式參數無法接受 Lambda 函式時，可以捨棄可能的多載。
此項變更使成員函數和擴充方法的行為保持一致，
並且在 Kotlin 2.1.0 中預設啟用。

### 改進帶有密封類別的 when 運算式的窮舉性檢查

在以前版本的 Kotlin 中，編譯器要求在具有密封上界 (sealed upper bounds) 的型別參數的 `when`
運算式中提供 `else` 分支，即使 `sealed class` 階層結構中的所有情況都已涵蓋也是如此。
此行為在 Kotlin 2.1.0 中得到了解決和改進，
使窮舉性檢查更加強大，並允許您移除冗餘的 `else` 分支，
讓 `when` 運算式保持簡潔且直覺。

以下是示範此變更的範例：

```kotlin
sealed class Result
object Error: Result()
class Success(val value: String): Result()

fun <T : Result> render(result: T) = when (result) {
    Error -> "Error!"
    is Success -> result.value
    // 不需要 else 分支
}
```

## Kotlin K2 編譯器

隨着 Kotlin 2.1.0 的發佈，K2 編譯器現在在 [處理編譯器檢查](#extra-compiler-checks)
和 [警告](#global-warning-suppression) 時提供了更多靈活性，並 [改進了對 kapt 外掛程式的支援](#improved-k2-kapt-implementation)。

### 額外編譯器檢查

在 Kotlin 2.1.0 中，您現在可以在 K2 編譯器中啟用額外的檢查。
這些是額外的宣告、運算式和型別檢查，通常對編譯來說不是至關重要的，
但如果您想驗證以下情況，它們仍然很有用：

| 檢查型別 | 說明 |
|-------------------------------------------------------|------------------------------------------------------------------------------------------|
| `REDUNDANT_NULLABLE` | 使用了 `Boolean??` 而不是 `Boolean?` |
| `PLATFORM_CLASS_MAPPED_TO_KOTLIN` | 使用了 `java.lang.String` 而不是 `kotlin.String` |
| `ARRAY_EQUALITY_OPERATOR_CAN_BE_REPLACED_WITH_EQUALS` | 使用了 `arrayOf("") == arrayOf("")` 而不是 `arrayOf("").contentEquals(arrayOf(""))` |
| `REDUNDANT_CALL_OF_CONVERSION_METHOD` | 使用了 `42.toInt()` 而不是 `42` |
| `USELESS_CALL_ON_NOT_NULL` | 使用了 `"".orEmpty()` 而不是 `""` |
| `REDUNDANT_SINGLE_EXPRESSION_STRING_TEMPLATE` | 使用了 `"$string"` 而不是 `string` |
| `UNUSED_ANONYMOUS_PARAMETER` | 在 Lambda 運算式中傳遞了參數但從未使用 |
| `REDUNDANT_VISIBILITY_MODIFIER` | 使用了 `public class Klass` 而不是 `class Klass` |
| `REDUNDANT_MODALITY_MODIFIER` | 使用了 `final class Klass` 而不是 `class Klass` |
| `REDUNDANT_SETTER_PARAMETER_TYPE` | 使用了 `set(value: Int)` 而不是 `set(value)` |
| `CAN_BE_VAL` | 定義了 `var local = 0` 但從未重新指派，可以改為 `val local = 42` |
| `ASSIGNED_VALUE_IS_NEVER_READ` | 定義了 `val local = 42` 但隨後在程式碼中從未使用過 |
| `UNUSED_VARIABLE` | 定義了 `val local = 0` 但在程式碼中從未使用過 |
| `REDUNDANT_RETURN_UNIT_TYPE` | 使用了 `fun foo(): Unit {}` 而不是 `fun foo() {}` |
| `UNREACHABLE_CODE` | 程式碼陳述式存在但永遠無法執行 |

如果檢查結果為真，您將收到一條編譯器警告，並附帶有關如何修復問題的建議。

額外檢查預設為停用。
要啟用它們，請在命令列使用 `-Wextra` 編譯器選項，或在 Gradle 組建檔案的 `compilerOptions {}` 區塊中指定 `extraWarnings`：

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        extraWarnings.set(true)
    }
}
```

有關如何定義和使用編譯器選項的更多資訊，
請參閱 [Kotlin Gradle 外掛程式中的編譯器選項](gradle-compiler-options.md)。

### 全域警告隱藏

在 2.1.0 中，Kotlin 編譯器獲得了一個強烈要求的特性——全域隱藏警告的能力。

您現在可以透過在命令列使用 `-Xsuppress-warning=WARNING_NAME`
語法，或在組建檔案的 `compilerOptions {}` 區塊中使用 `freeCompilerArgs` 屬性，在整個專案中隱藏特定警告。

例如，如果您在專案中啟用了 [額外編譯器檢查](#extra-compiler-checks)，但想隱藏其中之一，請使用：

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        extraWarnings.set(true)
        freeCompilerArgs.add("-Xsuppress-warning=CAN_BE_VAL")
    }
}
```

如果您想隱藏警告但不知道其名稱，請選取該元素並點擊燈泡圖示（或使用 <shortcut>Cmd + Enter</shortcut>/<shortcut>Alt + Enter</shortcut>）：

![警告名稱意圖](warning-name-intention.png){width=500}

新的編譯器選項目前處於 [實驗性階段](components-stability.md#stability-levels-explained)。
以下細節也值得注意：

* 不允許隱藏錯誤。
* 如果您傳遞了未知的警告名稱，編譯將導致錯誤。
* 您可以一次指定多個警告：
  
   <tabs>
   <tab title="命令列">

   ```bash
   kotlinc -Xsuppress-warning=NOTHING_TO_INLINE -Xsuppress-warning=NO_TAIL_CALLS_FOUND main.kt
   ```

   </tab>
   <tab title="組建檔案">

   ```kotlin
   // build.gradle.kts
   kotlin {
       compilerOptions {
           freeCompilerArgs.addAll(
               listOf(
                   "-Xsuppress-warning=NOTHING_TO_INLINE",
                   "-Xsuppress-warning=NO_TAIL_CALLS_FOUND"
               )
           )
       }
   }
   ```

   </tab>
   </tabs>

### 改進 K2 kapt 實作

> K2 編譯器的 kapt 外掛程式 (K2 kapt) 處於 [Alpha](components-stability.md#stability-levels-explained) 階段。
> 它可能隨時會發生變化。
> 
> 我們誠摯歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-71439/K2-kapt-feedback) 提供回饋。
>
{style="warning"}

目前，使用 [kapt](kapt.md) 外掛程式的專案預設使用 K1 編譯器，支援至 1.9 的 Kotlin 版本。

在 Kotlin 1.9.20 中，我們推出了與 K2 編譯器配合使用的 kapt 外掛程式實驗性實作 (K2 kapt)。
我們現在改進了 K2 kapt 的內部實作，以減輕技術和效能問題。

雖然新的 K2 kapt 實作沒有引入新功能，
但與之前的 K2 kapt 實作相比，其效能已有顯著提升。
此外，K2 kapt 外掛程式的行為現在更接近 K1 kapt。

要使用新的 K2 kapt 外掛程式實作，請像之前啟用 K2 kapt 外掛程式一樣啟用它。
在專案的 `gradle.properties` 檔案中加入以下選項：

```kotlin
kapt.use.k2=true
```

在接下來的版本中，K2 kapt 實作將預設啟用以取代 K1 kapt，
因此您將不再需要手動啟用它。

我們非常感謝您在新的實作穩定之前提供 [回饋](https://youtrack.jetbrains.com/issue/KT-71439/K2-kapt-feedback)。

### 解決無正負號型別與非原始型別之間的多載衝突

此版本解決了在先前版本中，當函式針對無正負號型別和非原始型別進行多載時可能發生的解析多載衝突問題，
如下列範例所示：

#### 多載的擴充方法

```kotlin
fun Any.doStuff() = "Any"
fun UByte.doStuff() = "UByte"

fun main() {
    val uByte: UByte = UByte.MIN_VALUE
    uByte.doStuff() // 在 Kotlin 2.1.0 之前存在多載解析歧義
}
```

在早期版本中，呼叫 `uByte.doStuff()` 會導致歧義，因為 `Any` 和 `UByte` 的擴充都適用。

#### 多載的頂層函式

```kotlin
fun doStuff(value: Any) = "Any"
fun doStuff(value: UByte) = "UByte"

fun main() {
    val uByte: UByte = UByte.MIN_VALUE
    doStuff(uByte) // 在 Kotlin 2.1.0 之前存在多載解析歧義
}
```

同樣地，對 `doStuff(uByte)` 的呼叫也是歧義的，因為編譯器無法決定要使用 `Any` 還是 `UByte` 版本。
從 2.1.0 開始，編譯器現在能正確處理這些情況，透過優先考慮更具體的型別（在此案例中為 `UByte`）來消除歧義。

## Kotlin/JVM

從 2.1.0 版本開始，編譯器可以產生包含 Java 23 機器碼的類別。

### 將 JSpecify 可 null 性不符診斷的嚴重等級變更為 strict

Kotlin 2.1.0 強制嚴格處理來自 `org.jspecify.annotations` 的可 null 性註解，
改進了 Java 互通性的型別安全性。

受影響的可 null 性註解如下：

* `org.jspecify.annotations.Nullable`
* `org.jspecify.annotations.NonNull`
* `org.jspecify.annotations.NullMarked`
* `org.jspecify.nullness` 中的舊版註解（JSpecify 0.2 及更早版本）

從 Kotlin 2.1.0 開始，可 null 性不符預設從警告提升為錯誤。
這確保了 `@NonNull` 和 `@Nullable` 註解在型別檢查期間被強制執行，
防止執行時出現非預期的可 null 性問題。

`@NullMarked` 註解也會影響其範圍內所有成員的可 null 性，
使您在處理帶有註解的 Java 程式碼時，行為更加可預測。

以下範例示範了新的預設行為：

```java
// Java
import org.jspecify.annotations.*;
public class SomeJavaClass {
    @NonNull
    public String foo() { //...
    }

    @Nullable
    public String bar() { //...
    }
}
```

```kotlin
// Kotlin
fun test(sjc: SomeJavaClass) {
    // 存取非 null 結果，這是允許的
    sjc.foo().length

    // 在預設的 strict 模式下會引發錯誤，因為結果是可 null 的
    // 要避免錯誤，請改用 ?.length
    sjc.bar().length
}
```

您可以手動控制這些註解的診斷嚴重等級。
為此，請使用 `-Xnullability-annotations` 編譯器選項來選擇一種模式：

* `ignore`：忽略可 null 性不符。
* `warning`：針對可 null 性不符回報警告。
* `strict`：針對可 null 性不符回報錯誤（預設模式）。

更多資訊請參閱 [可 null 性註解](java-interop.md#nullability-annotations)。

## Kotlin Multiplatform

Kotlin 2.1.0 引入了 [Swift 匯出的基礎支援](#basic-support-for-swift-export)，並使
[發佈 Kotlin Multiplatform 程式庫更加容易](#ability-to-publish-kotlin-libraries-from-any-host)。
它還專注於 Gradle 相關的改進，使 [配置編譯器選項的新 DSL](#new-gradle-dsl-for-compiler-options-in-multiplatform-projects-promoted-to-stable) 趨於穩定，
並帶來了 [Isolated Projects 特性的預覽](#preview-gradle-s-isolated-projects-in-kotlin-multiplatform)。

### 用於多平台專案編譯器選項的新 Gradle DSL 進入穩定版

在 Kotlin 2.0.0 中，[我們引入了新的實驗性 Gradle DSL](whatsnew20.md#new-gradle-dsl-for-compiler-options-in-multiplatform-projects)
來簡化多平台專案中的編譯器選項配置。
在 Kotlin 2.1.0 中，此 DSL 已提升為穩定版 (Stable)。

整體專案組態現在分為三層。最高層是擴充層級 (extension level)， 
接著是目標層級 (target level)，最低層是編譯單元（通常是一個編譯任務）：

![Kotlin 編譯器選項層級](compiler-options-levels.svg){width=700}

要進一步了解不同層級以及如何在它們之間配置編譯器選項， 
請參閱 [編譯器選項](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#compiler-options)。

### 預覽 Gradle 在 Kotlin Multiplatform 中的 Isolated Projects 特性

> 此特性處於 [實驗性階段](components-stability.md#stability-levels-explained)，目前在 Gradle 中處於 pre-Alpha 狀態。
> 僅配合 Gradle 8.10 版本使用，且僅用於評估目的。該特性可能隨時被捨棄或更改。
> 
> 我們誠摯歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-57279/Support-Gradle-Project-Isolation-Feature-for-Kotlin-Multiplatform) 提供回饋。 
> 需要選擇性啟用 (opt-in)（詳見下文）。
>
{style="warning"}

在 Kotlin 2.1.0 中， 
您可以在多平台專案中預覽 Gradle 的 [Isolated Projects](https://docs.gradle.org/current/userguide/isolated_projects.html) 特性。

Gradle 的 Isolated Projects 特性透過「隔離」各個 Gradle 專案的配置來提升建置效能。
每個專案的組建邏輯都被限制為無法直接存取其他專案的可變狀態，
從而允許它們安全地並行執行。
為了支援此特性，我們對 Kotlin Gradle 外掛程式的模型進行了一些更改，
我們非常有興趣在預覽階段聽取您的使用經驗。

有兩種方式可以啟用 Kotlin Gradle 外掛程式的新模型：

* 選項 1：**在不啟用 Isolated Projects 的情況下測試相容性** –
  若要檢查與 Kotlin Gradle 外掛程式新模型的相容性，但不啟用 Isolated Projects 特性，
  請在專案的 `gradle.properties` 檔案中加入以下 Gradle 屬性：

  ```none
  # gradle.properties
  kotlin.kmp.isolated-projects.support=enable
  ```

* 選項 2：**在啟用了 Isolated Projects 的情況下測試** –
  在 Gradle 中啟用 Isolated Projects 特性會自動配置 Kotlin Gradle 外掛程式以使用新模型。
  要啟用 Isolated Projects 特性，請 [設定系統屬性](https://docs.gradle.org/current/userguide/isolated_projects.html#how_do_i_use_it)。
  在這種情況下，您不需要在專案中為 Kotlin Gradle 外掛程式加入 Gradle 屬性。

### Swift 匯出的基礎支援

> 此特性目前處於開發早期階段。它可能隨時被捨棄或更改。
> 需要選擇性啟用 (opt-in)（詳見下文），且您應僅將其用於評估目的。
> 我們誠摯歡迎您在 [YouTrack](https://kotl.in/issue) 提供回饋。
> 
{style="warning"}

2.1.0 版本邁出了在 Kotlin 中提供 Swift 匯出支援的第一步，
允許您直接將 Kotlin 原始碼匯出到 Swift 介面，而無需使用 Objective-C 標頭檔。
這應該會使針對 Apple 目標平台的多平台開發變得更加容易。

目前的基礎支援包括：

* 將多個 Gradle 模組從 Kotlin 直接匯出到 Swift。
* 使用 `moduleName` 屬性定義自訂 Swift 模組名稱。
* 使用 `flattenPackage` 屬性設定套件結構的摺疊規則。

您可以將專案中的下列組建檔案作為設定 Swift 匯出的起點：

```kotlin
// build.gradle.kts 
kotlin {

    iosX64()
    iosArm64()
    iosSimulatorArm64()

    @OptIn(ExperimentalSwiftExportDsl::class)
    swiftExport {
        // 根模組名稱
        moduleName = "Shared"

        // 摺疊規則
        // 從產生的 Swift 程式碼中移除套件前綴
        flattenPackage = "com.example.sandbox"

        // 匯出外部模組
        export(project(":subproject")) {
            // 匯出的模組名稱
            moduleName = "Subproject"
            // 摺疊匯出的相依性規則
            flattenPackage = "com.subproject.library"
        }
    }
}
```

您也可以複製我們已設定好 Swift 匯出的 [公開範例](https://github.com/Kotlin/swift-export-sample)。

編譯器會自動產生所有必要的檔案（包括 `swiftmodule` 檔案、靜態 `a` 程式庫、以及標頭檔與 `modulemap` 檔案），並將它們複製到應用程式的組建目錄中，您可以從 Xcode 存取這些檔案。

#### 如何啟用 Swift 匯出

請記住，此特性目前僅處於開發的早期階段。

Swift 匯出目前適用於使用 [直接整合](https://kotlinlang.org/docs/multiplatform/multiplatform-direct-integration.html) 將 iOS 框架連接到 Xcode 專案的專案。
這是 Android Studio 或透過 [Web 精靈](https://kmp.jetbrains.com/) 建立的 Kotlin Multiplatform 專案的標準配置。

要在專案中嘗試 Swift 匯出：

1. 在 `gradle.properties` 檔案中加入以下 Gradle 選項：

   ```none
   # gradle.properties
   kotlin.experimental.swift-export.enabled=true
   ```

2. 在 Xcode 中開啟專案設定。
3. 在 **Build Phases** 分頁中，找到帶有 `embedAndSignAppleFrameworkForXcode` 任務的 **Run Script** 階段。
4. 調整指令碼，使其在執行指令碼階段改為使用 `embedSwiftExportForXcode` 任務：

   ```bash
   ./gradlew :<Shared 模組名稱>:embedSwiftExportForXcode
   ```

   ![加入 Swift 匯出指令碼](xcode-swift-export-run-script-phase.png){width=700}

#### 針對 Swift 匯出留下回饋

我們計劃在未來的 Kotlin 版本中擴展並穩定 Swift 匯出支援。
請在 [此 YouTrack 問題](https://youtrack.jetbrains.com/issue/KT-64572) 留下您的回饋。

### 從任何主機發佈 Kotlin 程式庫的能力

> 此特性目前處於 [實驗性階段](components-stability.md#stability-levels-explained)。
> 需要選擇性啟用 (opt-in)（詳見下文），且您應僅將其用於評估目的。
> 我們誠摯歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-71290) 提供回饋。
>
{style="warning"}

Kotlin 編譯器會產生 `.klib` 成品以發佈 Kotlin 程式庫。
以前，您公以從任何主機獲取必要的成品，但需要 Mac 電腦的 Apple 平台目標除外。 
這對針對 iOS、macOS、tvOS 和 watchOS 目標的 Kotlin Multiplatform 專案造成了特殊限制。

Kotlin 2.1.0 取消了這項限制，增加了對交叉編譯的支援。
現在您可以使用任何 [受支援的主機](native-target-support.md#hosts) 來產生 `.klib` 成品，
這應能大幅簡化 Kotlin 與 Kotlin Multiplatform 程式庫的發佈流程。

#### 如何啟用從任何主機發佈程式庫

要在專案中嘗試交叉編譯，請在 `gradle.properties` 檔案中加入以下二進制選項：

```none
# gradle.properties
kotlin.native.enableKlibsCrossCompilation=true
```

此特性目前處於實驗性階段且存在一些限制。在下列情況下，您仍需要使用 Mac 電腦：

* 您的程式庫具有 [cinterop 相依性](native-c-interop.md)。
* 您的專案中設定了 [CocoaPods 整合](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-overview.html)。
* 您需要為 Apple 目標編譯或測試 [最終二進位檔](https://kotlinlang.org/docs/multiplatform/multiplatform-build-native-binaries.html)。

#### 針對從任何主機發佈程式庫留下回饋

我們計劃在未來的 Kotlin 版本中穩定此特性並進一步改進程式庫發佈。
請在我們的問題追蹤器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-71290) 留下您的回饋。

更多資訊請參閱 [發佈多平台程式庫](https://kotlinlang.org/docs/multiplatform/multiplatform-publish-lib-setup.html)。

### 支援非打包 klib

Kotlin 2.1.0 讓產生非打包 (non-packed) 的 `.klib` 檔案成品變為可能。
這讓您可以選擇直接配置對 klib 的相依性，而不是先解包它們。

這項變更還可以提升效能，
減少 Kotlin/Wasm、Kotlin/JS 和 Kotlin/Native 專案中的編譯和連結時間。

例如，
我們的效能基準測試顯示，在具有 1 個連結任務和 10 個編譯任務的專案中（該專案組建了一個依賴於 9 個簡化專案的單個原生可執行二進位檔），總建置時間大約提升了 3%。
然而，對建置時間的實際影響取決於子專案的數量及其各自的大小。

#### 如何設定您的專案

預設情況下，Kotlin 編譯和連結任務現在已配置為使用新的非打包成品。

如果您設定了用於解析 klib 的自訂組建邏輯並希望使用新的非打包成品，
您需要在 Gradle 組建檔案中明確指定偏好的 klib 套件解析變體：

```kotlin
// build.gradle.kts
import org.jetbrains.kotlin.gradle.plugin.attributes.KlibPackaging
// ...
val resolvableConfiguration = configurations.resolvable("resolvable") {

    // 針對新的非打包配置：
    attributes.attribute(KlibPackaging.ATTRIBUTE, project.objects.named(KlibPackaging.NON_PACKED))

    // 針對之前的打包配置：
    attributes.attribute(KlibPackaging.ATTRIBUTE, project.objects.named(KlibPackaging.PACKED))
}
```

非打包 `.klib` 檔案產生的路徑與之前打包檔案在專案組建目錄中的路徑相同。
而打包的 klib 現在位於 `build/libs` 目錄中。

如果未指定屬性，則使用打包變體。
您可以使用以下主控台指令檢查可用屬性和變體的清單：

```shell
./gradlew outgoingVariants
```

我們誠摯歡迎您在 [YouTrack](https://kotl.in/issue) 提供關於此特性的回饋。

### 進一步棄用舊的 `android` 目標

在 Kotlin 2.1.0 中，針對舊 `android` 目標名稱的棄用警告已提升為錯誤。

目前，我們建議在針對 Android 的 Kotlin Multiplatform 專案中使用 `androidTarget` 選項。
這是一個臨時解決方案，目的是為了讓 Google 即將推出的 Android/KMP 外掛程式能夠使用 `android` 這個名稱。

當新的外掛程式可用時，我們將提供進一步的遷移說明。
來自 Google 的新 DSL 將成為 Kotlin Multiplatform 中 Android 目標支援的首選選項。

更多資訊請參閱 [Kotlin Multiplatform 相容性指南](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#rename-of-android-target-to-androidtarget)。

### 停止支援宣告多個相同型別的目標

在 Kotlin 2.1.0 之前，您可以在多平台專案中宣告多個相同型別的目標。
然而，這使得區分目標以及有效地支援共享原始碼集 (source set) 變得很具有挑戰性。
在大多數情況下，更簡單的設定（例如使用獨立的 Gradle 專案）效果更好。
有關如何遷移的詳細指導和範例，
請參閱 Kotlin Multiplatform 相容性指南中的 [宣告數個相似目標](https://kotlinlang.org/docs/multiplatform/multiplatform-compatibility-guide.html#declaring-several-similar-targets)。

Kotlin 1.9.20 對於在多平台專案中宣告多個相同型別目標的情況觸發了棄用警告。
在 Kotlin 2.1.0 中，對於除 Kotlin/JS 之外的所有目標，此棄用警告現在已變為錯誤。
要進一步了解為何 Kotlin/JS 目標可以豁免，
請參閱 [YouTrack 中的此問題](https://youtrack.jetbrains.com/issue/KT-47038/KJS-MPP-Split-JS-target-into-JsBrowser-and-JsNode)。

## Kotlin/Native

Kotlin 2.1.0 包含了對 [`iosArm64` 目標支援的升級](#iosarm64-promoted-to-tier-1)、
[改進了 cinterop 快取程序](#changes-to-caching-in-cinterop) 以及其他更新。

### iosArm64 提升至第一層級 (Tier 1)

對於 [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform/get-started.html) 開發至關重要的 `iosArm64` 目標已被提升至第一層級 (Tier 1)。這是 Kotlin/Native 編譯器中的最高支援層級。

這意味著該目標會在 CI 管線上定期測試，以確保其能夠編譯和執行。
我們還會在編譯器版本之間為該目標提供原始碼和二進位制相容性。

有關目標層級的更多資訊，請參閱 [Kotlin/Native 目標支援](native-target-support.md)。

### LLVM 更新從 11.1.0 至 16.0.0

在 Kotlin 2.1.0 中，我們將 LLVM 從 11.1.0 版本更新至 16.0.0。
新版本包含了錯誤修正和安全性更新。
在某些情況下，它還提供編譯器優化和更快的編譯速度。

如果您的專案中有 Linux 目標平台，
請注意 Kotlin/Native 編譯器現在針對所有 Linux 目標預設使用 `lld` 連結器。

此項更新應該不會影響您的程式碼，但如果您遇到任何問題，請回報至我們的 [問題追蹤器](http://kotl.in/issue)。

### cinterop 快取的變更

在 Kotlin 2.1.0 中，我們正對 cinterop 快取程序進行變更。它不再具有
[`CacheableTask`](https://docs.gradle.org/current/javadoc/org/gradle/api/tasks/CacheableTask.html) 註解型別。
新的建議方法是使用 [`cacheIf`](https://docs.gradle.org/current/kotlin-dsl/gradle/org.gradle.api.tasks/-task-outputs/cache-if.html)
輸出型別來快取任務的結果。

這應該會解決 `UP-TO-DATE`
檢查無法偵測到 [定義檔 (definition file)](native-definition-file.md) 中指定的標頭檔變更的問題，
進而防止建置系統重新編譯程式碼。

### 棄用 mimalloc 記憶體分配器

早在 Kotlin 1.9.0 中，我們就引入了新的記憶體分配器，隨後在 Kotlin 1.9.20 中將其設為預設。
新的分配器旨在提高垃圾收集效率並提升 Kotlin/Native 記憶體管理器的執行時期效能。

新的記憶體分配器取代了之前的預設分配器 [mimalloc](https://github.com/microsoft/mimalloc)。
現在，是時候在 Kotlin/Native 編譯器中棄用 mimalloc 了。

您現在可以從組建指令碼中移除 `-Xallocator=mimalloc` 編譯器選項。
如果您遇到任何問題，請回報至我們的 [問題追蹤器](http://kotl.in/issue)。

有關 Kotlin 中記憶體分配器和垃圾收集的更多資訊，
請參閱 [Kotlin/Native 記憶體管理](native-memory-manager.md)。

## Kotlin/Wasm

Kotlin/Wasm 獲得了多項更新以及 [對增量編譯的支援](#support-for-incremental-compilation)。

### 支援增量編譯

以前，當您更改 Kotlin 程式碼中的某些內容時，Kotlin/Wasm 工具鏈必須重新編譯整個程式碼庫。

從 2.1.0 開始，Wasm 目標平台支援增量編譯 (incremental compilation)。
在開發任務中，編譯器現在僅重新編譯與上次編譯後的變更相關的檔案，
這顯著地減少了編譯時間。

這項變更目前使編譯速度提高了一倍，並計劃在未來的版本中進一步改進。

在目前的設定中，Wasm 目標平台的增量編譯預設為停用。
要啟用增量編譯，請在專案的 `local.properties` 或 `gradle.properties` 檔案中加入以下行：

```none
# gradle.properties
kotlin.incremental.wasm=true
```

嘗試使用 Kotlin/Wasm 增量編譯
並 [分享您的回饋](https://youtrack.jetbrains.com/issue/KT-72158/Kotlin-Wasm-incremental-compilation-feedback)。
您的見解將有助於使此特性儘早趨於穩定並預設啟用。

### 瀏覽器 API 已移動至 kotlinx-browser 獨立程式庫

以前，Web API 的宣告和相關目標公用程式是 Kotlin/Wasm 標準程式庫的一部分。

在此版本中，`org.w3c.*`
宣告已從 Kotlin/Wasm 標準程式庫移動到新的 [kotlinx-browser 程式庫](https://github.com/kotlin/kotlinx-browser)。
此程式庫還包含了其他 Web 相關套件，例如 `org.khronos.webgl`、`kotlin.dom` 和 `kotlinx.browser`。

這種分離提供了模組化，使得 Web 相關 API 可以在 Kotlin 發佈週期之外進行獨立更新。
此外，Kotlin/Wasm 標準程式庫現在僅包含在任何 JavaScript 環境中都可用的宣告。

要使用來自已移動套件的宣告，
您需要將 `kotlinx-browser` 相依性加入到專案的組建組態檔案中：

```kotlin
// build.gradle.kts
val wasmJsMain by getting {
    dependencies {
        implementation("org.jetbrains.kotlinx:kotlinx-browser:0.3")
    }
}
```

### 改進 Kotlin/Wasm 的偵錯體驗

以前，在網頁瀏覽器中偵錯 Kotlin/Wasm 程式碼時，您可能會在偵錯介面中遇到
變數值的低階表示形式。這通常使得追蹤應用程式目前狀態變得具有挑戰性。

![Kotlin/Wasm 舊版偵錯工具](wasm-old-debugger.png){width=700}

為了改進此體驗，在變數檢視中加入了自訂格式化程式。
其實作使用了 [自訂格式化程式 API (custom formatters API)](https://firefox-source-docs.mozilla.org/devtools-user/custom_formatters/index.html)，
該 API 已獲得 Firefox 和基於 Chromium 的主要瀏覽器（如 Chrome）支援。

透過這項變更，您現在可以以更友善且易於理解的方式顯示和查找變數值。

![Kotlin/Wasm 改進的偵錯工具](wasm-debugger-improved.png){width=700}

要嘗試新的偵錯體驗：

1. 在 `wasmJs {}` 編譯器選項中加入以下編譯器選項：

   ```kotlin
   // build.gradle.kts
   kotlin {
       wasmJs {
           // ...
   
           compilerOptions {
               freeCompilerArgs.add("-Xwasm-debugger-custom-formatters")
           }
       }
   }
   ```

2. 在瀏覽器中啟用自訂格式化程式：

   * 在 Chrome 開發者工具中，可透過 **Settings | Preferences | Console** 啟用：

     ![在 Chrome 中啟用自訂格式化程式](wasm-custom-formatters-chrome.png){width=700}

   * 在 Firefox 開發者工具中，可透過 **Settings | Advanced settings** 啟用：

     ![在 Firefox 中啟用自訂格式化程式](wasm-custom-formatters-firefox.png){width=700}

### 縮減 Kotlin/Wasm 二進位檔大小

由正式發佈組建產生的 Wasm 二進位檔大小將縮減高達 30%，
且您可能會看到一些效能改進。
這是因為 `--closed-world`、`--type-ssa` 和 `--type-merging`
這幾項 Binaryen 選項現在被認為對所有 Kotlin/Wasm 專案都是安全可用的，並且預設啟用。

### 改進 Kotlin/Wasm 中的 JavaScript 陣列互通性

雖然 Kotlin/Wasm 的標準程式庫提供了用於 JavaScript 陣列的 `JsArray<T>` 型別，
但曾沒有直接的方法可以將 `JsArray<T>` 轉換為 Kotlin 的原生 `Array` 或 `List` 型別。

這種落差曾需要建立自訂的陣列轉換函式，使 Kotlin 與 JavaScript 程式碼之間的互通變得複雜。

此版本引入了一個適配器函式，可以自動將 `JsArray<T>` 轉換為 `Array<T>`，反之亦然，
簡化了陣列操作。

以下是泛型型別之間轉換的範例：將 Kotlin `List<T>` 和 `Array<T>` 轉換為 JavaScript `JsArray<T>`。

```kotlin
val list: `List<JsString>` =
    listOf("Kotlin", "Wasm").map { it.toJsString() }

// 使用 .toJsArray() 將 List 或 Array 轉換為 JsArray
val jsArray: JsArray<JsString> = list.toJsArray()

// 使用 .toArray() 和 .toList() 將其轉回 Kotlin 型別 
val kotlinArray: `Array<JsString>` = jsArray.toArray()
val kotlinList: `List<JsString>` = jsArray.toList()
```

對於將型別化陣列轉換為其對應的 Kotlin 型別（例如 `IntArray` 和 `Int32Array`），也有類似的方法。 
詳細資訊和實作請參閱 [`kotlinx-browser` 儲存庫](https://github.com/Kotlin/kotlinx-browser/blob/dfbdceed314567983c98f1d66e8c2e10d99c5a55/src/wasmJsMain/kotlin/arrayCopy.kt)。

以下是型別化陣列之間轉換的範例：將 Kotlin `IntArray` 轉換為 JavaScript `Int32Array`。

```kotlin
import org.khronos.webgl.*

    // ...

    val intArray: IntArray = intArrayOf(1, 2, 3)
    
    // 使用 .toInt32Array() 將 Kotlin IntArray 轉換為 JavaScript Int32Array
    val jsInt32Array: Int32Array = intArray.toInt32Array()
    
    // 使用 toIntArray() 將 JavaScript Int32Array 轉回 Kotlin IntArray
    val kotlinIntArray: IntArray = jsInt32Array.toIntArray()
```

### 支援在 Kotlin/Wasm 中存取 JavaScript 例外詳情

以前，當 Kotlin/Wasm 中發生 JavaScript 例外時， 
`JsException` 型別僅提供一般訊息，而沒有來自原始 JavaScript 錯誤的詳細資訊。

從 Kotlin 2.1.0 開始，您可以透過啟用特定的編譯器選項，設定 `JsException`
以包含原始錯誤訊息和堆疊追蹤。
這提供了更多上下文來協助診斷源自 JavaScript 的問題。

此行為取決於 `WebAssembly.JSTag` API，該 API 僅在某些瀏覽器中可用：

* **Chrome**：從 115 版本開始支援
* **Firefox**：從 129 版本開始支援
* **Safari**：尚未支援

要啟用此預設停用的特性， 
請在 `build.gradle.kts` 檔案中加入以下編譯器選項：

```kotlin
// build.gradle.kts
kotlin {
    wasmJs {
        compilerOptions {
            freeCompilerArgs.add("-Xwasm-attach-js-exception")
        }
    }
}
```

以下範例示範了新的行為：

```kotlin
external object JSON {
    fun <T: JsAny> parse(json: String): T
}

fun main() {
    try {
        JSON.parse("an invalid JSON")
    } catch (e: JsException) {
        println("Thrown value is: ${e.thrownValue}")
        // Thrown value is: SyntaxError: Unexpected token 'a', "an invalid JSON" is not valid JSON

        println("Message: ${e.message}")
        // Message: Unexpected token 'a', "an invalid JSON" is not valid JSON

        println("Stacktrace:")
        // Stacktrace:

        // 印出完整的 JavaScript 堆疊追蹤 
        e.printStackTrace()
    }
}
```

啟用了 `-Xwasm-attach-js-exception` 選項後，`JsException` 會提供來自 JavaScript 錯誤的具體詳情。
如果不啟用該選項，`JsException` 僅會包含一條一般訊息，說明在執行 JavaScript 程式碼時拋出了例外。

### 棄用預設匯出

作為向命名匯出 (named exports) 遷移的一環，
先前在 JavaScript 中對 Kotlin/Wasm 匯出使用預設匯入 (default import) 時，會向主控台印出錯誤訊息。

在 2.1.0 中，預設匯入已完全移除，以全面支援命名匯出。

針對 Kotlin/Wasm 目標平台編寫 JavaScript 程式碼時，您現在需要使用對應的命名匯入，而不是預設匯入。

這項變更標誌著向命名匯出遷移的棄用週期的最後階段：

**在 2.0.0 版本中：** 向主控台印出了一條警告訊息，說明透過預設匯出 (default exports) 匯出實體已被棄用。

**在 2.0.20 版本中：** 發生錯誤，要求使用對應的命名匯入。

**在 2.1.0 版本中：** 預設匯入的使用已完全移除。

### 子專案特定的 Node.js 設定

您可以透過為 `rootProject` 定義 `NodeJsRootPlugin` 類別的屬性來配置專案的 Node.js 設定。
在 2.1.0 中，您可以使用新類別 `NodeJsPlugin` 為每個子專案配置這些設定。
以下範例示範了如何為子專案設定特定的 Node.js 版本：

```kotlin
// build.gradle.kts
project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
    project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().version = "22.0.0"
}
```

若要在整個專案中使用新類別，請在 `allprojects {}` 區塊中加入相同的程式碼：

```kotlin
// build.gradle.kts
allprojects {
    project.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsPlugin> {
        project.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsEnvSpec>().version = "your Node.js version"
    }
}
```

您也可以使用 Gradle 慣例外掛程式 (convention plugins) 將設定套用至特定的子專案集。

## Kotlin/JS

### 支援屬性中的非識別符字元

Kotlin/JS 以前不允許在帶有反引號的 [測試方法名稱](coding-conventions.md#names-for-test-methods) 中使用空格。

同樣地，存取包含 Kotlin 識別符不允許字元（例如連字號或空格）的 JavaScript 物件屬性也是不可能的：

```kotlin
external interface Headers {
    var accept: String?

    // 由於連字號，在 Kotlin 中是無效的識別符
    var `content-length`: String?
}

val headers: Headers = TODO("value provided by a JS library")
val accept = headers.accept
// 由於屬性名稱中的連字號而導致錯誤
val length = headers.`content-length`
```

這種行為與 JavaScript 和 TypeScript 不同，後者允許使用非識別符字元存取此類屬性。

從 Kotlin 2.1.0 開始，此特性預設啟用。
Kotlin/JS 現在允許您使用反引號 (``) 和 `@JsName` 註解
與包含非識別符字元的 JavaScript 屬性進行互動，並在測試方法中使用這些名稱。

此外，
您可以使用 `@JsName` 和 `@JsQualifier` 註解將 Kotlin 屬性名稱映射到 JavaScript 對應名稱：

```kotlin
object Bar {
    val `property example`: String = "bar"
}

@JsQualifier("fooNamespace")
external object Foo {
    val `property example`: String
}

@JsExport
object Baz {
    val `property example`: String = "bar"
}

fun main() {
    // 在 JavaScript 中，這被編譯為 Bar.property_example_HASH
    println(Bar.`property example`)
    // 在 JavaScript 中，這被編譯為 fooNamespace["property example"]
    println(Foo.`property example`)
    // 在 JavaScript 中，這被編譯為 Baz["property example"]
    println(Baz.`property example`)
}
```

### 支援產生 ES2015 箭頭函式

在 Kotlin 2.1.0 中，Kotlin/JS 引入了對產生 ES2015 箭頭函式（例如 `(a, b) => expression`）而非匿名函式的支援。

使用箭頭函式可以縮減專案的打包大小 (bundle size)，
特別是在使用實驗性的 `-Xir-generate-inline-anonymous-functions` 模式時。
這也使得產生的程式碼更符合現代 JS 的規範。

當針對 ES2015 目標時，此特性預設啟用。
或者，您可以使用 `-Xes-arrow-functions` 命令列引數來啟用它。

進一步了解 [官方文件中的 ES2015 (ECMAScript 2015, ES6)](https://262.ecma-international.org/6.0/)。

## Gradle 改進

Kotlin 2.1.0 與 Gradle 7.6.3 至 8.6 版完全相容。
同時也支援 Gradle 8.7 至 8.10 版，僅有一個例外：
如果您使用 Kotlin Multiplatform Gradle 外掛程式，
在多平台專案中呼叫 JVM 目標平台中的 `withJava()` 函式時，可能會看到棄用警告。
我們計劃儘快修復此問題。

更多資訊請參閱 [YouTrack 中的相關問題](https://youtrack.jetbrains.com/issue/KT-66542)。

您也可以使用最新發佈版本的 Gradle，
但請記住，如果您這樣做，可能會遇到棄用警告，或者某些新的 Gradle 特性可能無法運作。

### 支援的最低 AGP 版本提升至 7.3.1

從 Kotlin 2.1.0 開始，支援的最低 Android Gradle 外掛程式版本為 7.3.1。

### 支援的最低 Gradle 版本提升至 7.6.3

從 Kotlin 2.1.0 開始，支援的最低 Gradle 版本為 7.6.3。

### 用於 Kotlin Gradle 外掛程式擴充的新 API

Kotlin 2.1.0 引入了一個新的 API，使建立用於組建 Kotlin Gradle 外掛程式的自定義外掛程式變得更加容易。
此項變更棄用了 `KotlinTopLevelExtension` 和 `KotlinTopLevelExtensionConfig`
介面，並為外掛程式作者引入了以下介面：

| 名稱 | 說明 |
|--------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `KotlinBaseExtension` | 一種外掛程式 DSL 擴充型別，用於為整個專案組建常用的 Kotlin JVM、Android 和 Multiplatform 外掛程式選項：<list><li>`org.jetbrains.kotlin.jvm`</li><li>`org.jetbrains.kotlin.android`</li><li>`org.jetbrains.kotlin.multiplatform`</li></list> |
| `KotlinJvmExtension` | 一種外掛程式 DSL 擴充型別，用於為整個專案組建 Kotlin **JVM** 外掛程式選項。 |
| `KotlinAndroidExtension` | 一種外掛程式 DSL 擴充型別，用於為整個專案組建 Kotlin **Android** 外掛程式選項。 |

例如，如果您想同時為 JVM 和 Android 專案組建編譯器選項，請使用 `KotlinBaseExtension`：

```kotlin
configure<KotlinBaseExtension> {
    if (this is HasConfigurableKotlinCompilerOptions<*>) {
        with(compilerOptions) {
            if (this is KotlinJvmCompilerOptions) {
                jvmTarget.set(JvmTarget.JVM_17)
            }
        }
    }
}
```

這將 JVM 和 Android 專案的 JVM 目標平台都配置為 17。

若要專門為 JVM 專案配置編譯器選項，請使用 `KotlinJvmExtension`：

```kotlin
configure<KotlinJvmExtension> {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_17)
    }

    target.mavenPublication {
        groupId = "com.example"
        artifactId = "example-project"
        version = "1.0-SNAPSHOT"
    }
}
```

此範例同樣將 JVM 專案的 JVM 目標平台配置為 17。
它還為專案配置了 Maven 發佈，以便將其輸出發佈至 Maven 儲存庫。

您可以以完全相同的方式使用 `KotlinAndroidExtension`。

### 從 Kotlin Gradle 外掛程式 API 中隱藏編譯器符號

以前，KGP 在其執行時期相依性中包含了 `org.jetbrains.kotlin:kotlin-compiler-embeddable`，
這使得內部編譯器符號在組建指令碼類別路徑中可用。
這些符號原本僅供內部使用。

從 Kotlin 2.1.0 開始，KGP 將 `org.jetbrains.kotlin:kotlin-compiler-embeddable` 類別檔案的一個子集打包在其 JAR 檔案中，並逐步移除它們。
此項變更旨在防止相容性問題並簡化 KGP 的維護。

如果您的組建邏輯中其他部分（例如 `kotlinter` 等外掛程式）依賴於與 KGP 隨附版本不同的 `org.jetbrains.kotlin:kotlin-compiler-embeddable` 版本，
則可能會導致衝突和執行時期例外。

為了防止此類問題，如果 `org.jetbrains.kotlin:kotlin-compiler-embeddable` 與 KGP 同時出現在組建類別路徑中，KGP 現在會顯示警告。

作為長期解決方案，如果您是使用 `org.jetbrains.kotlin:kotlin-compiler-embeddable` 類別的外掛程式作者，我們建議在獨立的類別載入器 (classloader) 中執行它們。
例如，您可以使用帶有類別載入器或處理序隔離的 [Gradle Workers API](https://docs.gradle.org/current/userguide/worker_api.html) 來實現。

#### 使用 Gradle Workers API

此範例演示瞭如何在產生 Gradle 外掛程式的專案中安全地使用 Kotlin 編譯器。
首先，在組建指令碼中加入一個僅編譯 (compile-only) 的相依性。
這使得符號僅在編譯時期可用：

```kotlin
// build.gradle.kts
dependencies {
    compileOnly("org.jetbrains.kotlin:kotlin-compiler-embeddable:%kotlinVersion%")
}
```

接著，定義一個 Gradle 工作操作 (work action) 以印出 Kotlin 編譯器版本：

```kotlin
import org.gradle.workers.WorkAction
import org.gradle.workers.WorkParameters
import org.jetbrains.kotlin.config.KotlinCompilerVersion
abstract class ActionUsingKotlinCompiler : WorkAction<WorkParameters.None> {
    override fun execute() {
        println("Kotlin compiler version: ${KotlinCompilerVersion.getVersion()}")
    }
}
```

現在建立一個任務，使用類別載入器隔離將此操作提交給背景工作執行程序 (worker executor)：

```kotlin
import org.gradle.api.DefaultTask
import org.gradle.api.file.ConfigurableFileCollection
import org.gradle.api.tasks.Classpath
import org.gradle.api.tasks.TaskAction
import org.gradle.workers.WorkerExecutor
import javax.inject.Inject
abstract class TaskUsingKotlinCompiler: DefaultTask() {
    @get:Inject
    abstract val executor: WorkerExecutor

    @get:Classpath
    abstract val kotlinCompiler: ConfigurableFileCollection

    @TaskAction
    fun compile() {
        val workQueue = executor.classLoaderIsolation {
            classpath.from(kotlinCompiler)
        }
        workQueue.submit(ActionUsingKotlinCompiler::class.java) {}
    }
}
```

最後，在您的 Gradle 外掛程式中配置 Kotlin 編譯器類別路徑：

```kotlin
import org.gradle.api.Plugin
import org.gradle.api.Project
abstract class MyPlugin: Plugin<Project> {
    override fun apply(target: Project) {
        val myDependencyScope = target.configurations.create("myDependencyScope")
        target.dependencies.add(myDependencyScope.name, "$KOTLIN_COMPILER_EMBEDDABLE:$KOTLIN_COMPILER_VERSION")
        val myResolvableConfiguration = target.configurations.create("myResolvable") {
            extendsFrom(myDependencyScope)
        }
        target.tasks.register("myTask", TaskUsingKotlinCompiler::class.java) {
            kotlinCompiler.from(myResolvableConfiguration)
        }
    }

    companion object {
        const val KOTLIN_COMPILER_EMBEDDABLE = "org.jetbrains.kotlin:kotlin-compiler-embeddable"
        const val KOTLIN_COMPILER_VERSION = "%kotlinVersion%"
    }
}
```

## Compose 編譯器更新

### 支援多個穩定性組態檔案

Compose 編譯器可以解釋多個穩定性組態檔案，
但 Compose 編譯器 Gradle 外掛程式的 `stabilityConfigurationFile` 選項之前僅允許
指定單一檔案。
在 Kotlin 2.1.0 中，此功能經過重新設計，允許您為單一模組使用多個穩定性組態檔案：

* `stabilityConfigurationFile` 選項已被棄用。
* 加入了新選項 `stabilityConfigurationFiles`，型別為 `ListProperty<RegularFile>`。

以下是如何使用新選項向 Compose 編譯器傳遞多個檔案：

```kotlin
// build.gradle.kt
composeCompiler {
    stabilityConfigurationFiles.addAll(
        project.layout.projectDirectory.file("configuration-file1.conf"),
        project.layout.projectDirectory.file("configuration-file2.conf"),
    )
}
```

### 可暫停的組合 (Pausable composition)

可暫停的組合 (Pausable composition) 是一項新的實驗性特性，它改變了編譯器產生可跳過函式的方式。 
啟用了此特性後，組合 (composition) 可以在執行時期於跳過點被暫停，
從而允許將長時間運行的組合程序拆分到多個影格 (frames) 中。
可暫停的組合被用於延遲列表 (lazy lists) 和其他高效能組件中，用於預取內容，
以防止在以阻塞方式執行時導致掉格。

要嘗試可暫停的組合，請在 Compose 編譯器的 Gradle 配置中加入以下特性旗標：

```kotlin
// build.gradle.kts
composeCompiler {
    featureFlags = setOf(
        ComposeFeatureFlag.PausableComposition
    )
}
```

> 此特性的執行時期支援已在 `androidx.compose.runtime` 的 1.8.0-alpha02 版本中加入。
> 該特性旗標在與舊版執行時期版本配合使用時沒有效果。
>
{style="note"}

### 開放與覆寫的 @Composable 函式的變更

虛擬（open、abstract 和覆寫）的 `@Composable` 函式不再具有可重啟性 (restartable)。
可重啟組群的程式碼產生先前產生的呼叫在 [配合繼承時無法正常運作](https://issuetracker.google.com/329477544) ，
導致執行時期崩潰。

這意味著虛擬函式將不會被重啟或跳過：
每當其狀態失效時，執行時期會改為重新組合其父項 composable。
如果您的程式碼對重新組合很敏感，您可能會注意到執行時期行為的變化。

### 效能改進

Compose 編譯器過去會建立模組 IR 的完整副本來轉換 `@Composable` 型別。
除了在複製與 Compose 無關的元素時增加記憶體消耗外，
這種行為還在 [某些邊緣情況](https://issuetracker.google.com/365066530) 下破壞了下游編譯器外掛程式。

此項複製操作已被移除，可能縮短編譯時間。

## 標準程式庫

### 標準程式庫 API 棄用嚴重等級的變更

在 Kotlin 2.1.0 中，我們將多個標準程式庫 API 的棄用嚴重等級從警告 (warning) 提升為錯誤 (error)。
如果您的程式碼依賴這些 API，您需要對其進行更新以確保相容性。
最顯著的變更包括：

* **棄用了用於 `Char` 和 `String` 的文化感知大小寫轉換函式：**
  諸如 `Char.toLowerCase()`、`Char.toUpperCase()`、`String.toUpperCase()`、
  和 `String.toLowerCase()` 等函式現已被棄用，使用它們會導致錯誤。
  請將它們替換為與文化無關的函式替代方案或其他大小寫轉換機制。
  如果您想繼續使用預設文化設定，請將類似 `String.toLowerCase()` 的呼叫
  替換為 `String.lowercase(Locale.getDefault())`，並明確指定文化設定。
  對於與文化無關的轉換，請將其替換為 `String.lowercase()`，它預設使用不變的文化設定 (invariant locale)。

* **棄用了 Kotlin/Native 凍結 (freezing) API：**
  使用先前標記有 `@FreezingIsDeprecated` 註解的凍結相關宣告現在會導致錯誤。
  此項變更反映了 Kotlin/Native 中從舊版記憶體管理器遷移的過程，
  舊版管理器需要凍結物件才能在執行緒之間共享它們。
  要了解如何在新記憶體模型中從凍結相關 API 遷移，
  請參閱 [Kotlin/Native 遷移指南](native-migration-guide.md#update-your-code)。
  更多資訊請參閱 [關於凍結棄用的公告](whatsnew1720.md#freezing)。

* **`appendln()` 已棄用，建議改用 `appendLine()`：**
  `StringBuilder.appendln()` 和 `Appendable.appendln()` 函式現已被棄用，使用它們會導致錯誤。
  要替換它們，請改用 `StringBuilder.appendLine()` 或 `Appendable.appendLine()` 函式。
  `appendln()` 函式之所以被棄用，是因為在 Kotlin/JVM 上，它使用 `line.separator` 系統屬性，
  而該屬性在每個作業系統上的預設值不同。在 Kotlin/JVM 上，此屬性在 Windows 上預設為 `\r
` (CR LF)，而在其他系統上為 `
` (LF)。
  另一方面，`appendLine()` 函式始終使用 `
` (LF) 作為行分隔符，確保了跨平台行為的一致性。

有關此版本中受影響 API 的完整清單，請參閱 [KT-71628](https://youtrack.jetbrains.com/issue/KT-71628) YouTrack 問題。

### 穩定版的 java.nio.file.Path 檔案樹走訪擴充方法

Kotlin 1.7.20 引入了用於 `java.nio.file.Path` 類別的實驗性 [擴充方法](extensions.md#extension-functions)，
允許您走訪檔案樹。
在 Kotlin 2.1.0 中，以下檔案樹走訪擴充方法現已進入 [穩定版 (Stable)](components-stability.md#stability-levels-explained)：

* `walk()` 以延遲方式走訪根植於指定路徑的檔案樹。
* `fileVisitor()` 使得可以單獨建立 `FileVisitor`。 
  `FileVisitor` 指定了在走訪期間對目錄和檔案執行的操作。
* `visitFileTree(fileVisitor: FileVisitor, ...)` 走訪檔案樹，
  對每個遇到的項目調用指定的 `FileVisitor`，它在底層使用 `java.nio.file.Files.walkFileTree()` 函式。
* `visitFileTree(..., builderAction: FileVisitorBuilder.() -> Unit)` 透過提供的 `builderAction` 建立 `FileVisitor`
  並呼叫 `visitFileTree(fileVisitor, ...)` 函式。
* `sealed interface FileVisitorBuilder` 允許您定義自定義的 `FileVisitor` 實作。
* `enum class PathWalkOption` 為 `Path.walk()` 函式提供走訪選項。

下面的範例演示瞭如何使用這些檔案走訪 API 建立自定義的 `FileVisitor` 行為，
這允許您為存取檔案和目錄定義特定的操作。

例如，您可以明確建立一個 `FileVisitor` 並在稍後使用它：

```kotlin
val cleanVisitor = fileVisitor {
    onPreVisitDirectory { directory, attributes ->
        // 占位符號：加入存取目錄時的邏輯
        FileVisitResult.CONTINUE
    }

    onVisitFile { file, attributes ->
        // 占位符號：加入存取檔案時的邏輯
        FileVisitResult.CONTINUE
    }
}

// 占位符號：在此加入走訪前的一般設定邏輯
projectDirectory.visitFileTree(cleanVisitor)
```

您也可以使用 `builderAction` 建立 `FileVisitor` 並立即將其用於走訪：

```kotlin
projectDirectory.visitFileTree {
    // 定義 builderAction：
    onPreVisitDirectory { directory, attributes ->
        // 存取目錄時的一些邏輯
        FileVisitResult.CONTINUE
    }

    onVisitFile { file, attributes ->
        // 存取檔案時的一些邏輯
        FileVisitResult.CONTINUE
    }
}
```

此外，您可以使用 `walk()` 函式走訪根植於指定路徑的檔案樹：

```kotlin
fun traverseFileTree() {
    val cleanVisitor = fileVisitor {
        onPreVisitDirectory { directory, _ ->
            if (directory.name == "build") {
                directory.toFile().deleteRecursively()
                FileVisitResult.SKIP_SUBTREE
            } else {
                FileVisitResult.CONTINUE
            }
        }

        // 刪除副檔名為 .class 的檔案
        onVisitFile { file, _ ->
            if (file.extension == "class") {
                file.deleteExisting()
            }
            FileVisitResult.CONTINUE
        }
    }

    // 設定根目錄與檔案
    val rootDirectory = createTempDirectory("Project")

    // 建立包含 A.kt 和 A.class 檔案的 src 目錄
    rootDirectory.resolve("src").let { srcDirectory ->
        srcDirectory.createDirectory()
        srcDirectory.resolve("A.kt").createFile()
        srcDirectory.resolve("A.class").createFile()
    }

    // 建立包含 Project.jar 檔案的 build 目錄
    rootDirectory.resolve("build").let { buildDirectory ->
        buildDirectory.createDirectory()
        buildDirectory.resolve("Project.jar").createFile()
    }

    // 使用 walk() 函式：
    val directoryStructure = rootDirectory.walk(PathWalkOption.INCLUDE_DIRECTORIES)
        .map { it.relativeTo(rootDirectory).toString() }
        .toList().sorted()
    println(directoryStructure)
    // "[, build, build/Project.jar, src, src/A.class, src/A.kt]"
  
    // 使用 cleanVisitor 走訪檔案樹，套用 rootDirectory.visitFileTree(cleanVisitor) 清理規則
    val directoryStructureAfterClean = rootDirectory.walk(PathWalkOption.INCLUDE_DIRECTORIES)
        .map { it.relativeTo(rootDirectory).toString() }
        .toList().sorted()
    println(directoryStructureAfterClean)
    // "[, src, src/A.kt]"
}
```

## 文件更新

Kotlin 文件已進行了一些值得注意的更改：

### 語言概念

* 改進了 [Null 安全性](null-safety.md) 頁面 – 了解如何在程式碼中安全地處理 `null` 值。
* 改進了 [物件宣告與運算式](object-declarations.md) 頁面 –
  了解如何在單一步驟中定義類別並建立執行個體。
* 改進了 [When 運算式與陳述式](control-flow.md#when-expressions-and-statements) 章節 –
  了解 `when` 條件式以及如何使用它。
* 更新了 [Kotlin 路線圖](roadmap.md)、[Kotlin 演進原則](kotlin-evolution-principles.md)
  以及 [Kotlin 語言特性與提案](kotlin-language-features-and-proposals.md) 頁面 – 
  了解 Kotlin 的計畫、正在進行的開發以及指導原則。

### Compose 編譯器

* [Compose 編譯器文件](compose-compiler-migration-guide.md) 現在位於「編譯器與外掛程式」章節中 –
  了解 Compose 編譯器、編譯器選項以及遷移步驟。

### API 參照

* 新的 [Kotlin Gradle 外掛程式 API 參照](https://kotlinlang.org/api/kotlin-gradle-plugin) –
  探索 Kotlin Gradle 外掛程式與 Compose 編譯器 Gradle 外掛程式的 API 參照。

### 多平台開發

* 新的 [為多平台建立 Kotlin 程式庫](https://kotlinlang.org/docs/api-guidelines-build-for-multiplatform.html) 頁面 –
  了解如何為 Kotlin Multiplatform 設計您的 Kotlin 程式庫。
* 新的 [Kotlin Multiplatform 入門](https://kotlinlang.org/docs/multiplatform/get-started.html) 頁面 – 了解 Kotlin Multiplatform 的核心概念、相依性、程式庫等。
* 新的 [iOS 整合](https://kotlinlang.org/docs/multiplatform/multiplatform-ios-integration-overview.html) 章節 – 了解如何將 Kotlin Multiplatform 共享模組整合到您的 iOS 應用程式中。
* 新的 [Kotlin/Native 定義檔](native-definition-file.md) 頁面 – 了解如何建立定義檔以使用 C 和 Objective-C 程式庫。
* [WASI 入門](wasm-wasi.md) –
  了解如何在各種 WebAssembly 虛擬機中使用 WASI 執行簡單的 Kotlin/Wasm 應用程式。

### 工具

* [新的 Dokka 遷移指南](dokka-migration.md) – 了解如何遷移至 Dokka Gradle 外掛程式 v2。

## Kotlin 2.1.0 相容性指南

Kotlin 2.1.0 是一個特性版本，因此
可能會帶來與您為早期語言版本編寫的程式碼不相容的變更。
請在 [Kotlin 2.1.0 相容性指南](compatibility-guide-21.md) 中找到這些變更的詳細清單。

## 安裝 Kotlin 2.1.0

從 IntelliJ IDEA 2023.3 和 Android Studio Iguana (2023.2.1) Canary 15 開始，Kotlin 外掛程式作為
隨附外掛程式包含在您的 IDE 中。這意味著您無法再從 JetBrains Marketplace 安裝該外掛程式。

要更新至新的 Kotlin 版本，請在組建指令碼中 [將 Kotlin 版本更改](releases.md#update-to-a-new-kotlin-version) 為 2.1.0。