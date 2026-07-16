[//]: # (title: Kotlin 2.0.0 的新功能)

<web-summary>閱讀 Kotlin 2.0.0 版本說明，涵蓋新語言特性、Kotlin 多平台、JVM、Native、JS 和 Wasm 的更新，以及 Gradle 和 Maven 的組建工具支援。</web-summary>

_[發佈日期：2024 年 5 月 21 日](releases.md#release-history)_

Kotlin 2.0.0 版本已正式發佈，且[新的 Kotlin K2 編譯器](#kotlin-k2-compiler)已進入穩定版 (Stable)！此外，還有以下亮點：

* [新的 Compose 編譯器 Gradle 外掛程式](#new-compose-compiler-gradle-plugin)
* [使用 invokedynamic 產生 lambda 函式](#generation-of-lambda-functions-using-invokedynamic)
* [kotlinx-metadata-jvm 程式庫現已進入穩定版](#the-kotlinx-metadata-jvm-library-is-stable)
* [在 Apple 平台上使用 signposts 監控 Kotlin/Native 的 GC 效能](#monitoring-gc-performance-with-signposts-on-apple-platforms)
* [解決 Kotlin/Native 與 Objective-C 方法的衝突](#resolving-conflicts-with-objective-c-methods)
* [Kotlin/Wasm 支援具名匯出 (named export)](#support-for-named-export)
* [Kotlin/Wasm 在帶有 @JsExport 的函式中支援無符號基本型別](#support-for-unsigned-primitive-types-in-functions-with-jsexport)
* [預設使用 Binaryen 最佳化正式生產環境組建](#optimized-production-builds-by-default-using-binaryen)
* [多平台專案中用於編譯器選項的新 Gradle DSL](#new-gradle-dsl-for-compiler-options-in-multiplatform-projects)
* [列舉類別 values 泛型函式的穩定替代方案](#stable-replacement-of-the-enum-class-values-generic-function)
* [穩定的 AutoCloseable 介面](#stable-autocloseable-interface)

Kotlin 2.0 是 JetBrains 團隊的一個巨大里程碑。此版本是 KotlinConf 2024 的焦點。請觀看開幕主題演講，我們在會中宣佈了令人興奮的更新，並介紹了 Kotlin 語言的近期工作：

<video src="https://www.youtube.com/v/Ar73Axsz2YA" title="KotlinConf'24 - Keynote"/>

> 有關 Kotlin 發佈週期的資訊，請參閱 [Kotlin 發佈流程](releases.md)。
>
{style="tip"}

## IDE 支援

支援 Kotlin 2.0.0 的 Kotlin 外掛程式已隨附在最新版本的 IntelliJ IDEA 和 Android Studio 中。
您不需要在 IDE 中更新 Kotlin 外掛程式。
您只需在組建指令碼中將 [Kotlin 版本更改](releases.md#update-to-a-new-kotlin-version)為 Kotlin 2.0.0 即可。

* 有關 IntelliJ IDEA 對 Kotlin K2 編譯器支援的詳細資訊，請參閱[在 IDE 中的支援](#support-in-ides)。
* 有關 IntelliJ IDEA 對 Kotlin 支援的更多詳細資訊，請參閱 [Kotlin 發佈版本](releases.md#ide-support)。

## Kotlin K2 編譯器

走向 K2 編譯器的道路漫長，但現在 JetBrains 團隊終於準備好宣佈其穩定化。
在 Kotlin 2.0.0 中，預設使用新的 Kotlin K2 編譯器，且它在所有目標平台（JVM、Native、Wasm 和 JS）上均已達至 [穩定 (Stable)](components-stability.md)。新編譯器帶來了重大的效能提升、加快了新語言特性的開發速度、統一了 Kotlin 支援的所有平台，並為多平台專案提供了更好的架構。

JetBrains 團隊透過成功編譯來自精選使用者和內部專案的 1,000 萬行程式碼，確保了新編譯器的品質。18,000 名開發人員參與了穩定化過程，在總共 80,000 個專案中測試了新的 K2 編譯器，並回報了他們發現的所有問題。

為了協助讓遷移到新編譯器的過程盡可能順利，我們建立了 [K2 編譯器遷移指南](k2-compiler-migration-guide.md)。
本指南說明了編譯器的許多優點，強調了您可能會遇到的任何變更，並說明了在必要時如何回復到先前的版本。

在[部落格文章](https://blog.jetbrains.com/kotlin/2024/04/k2-compiler-performance-benchmarks-and-how-to-measure-them-on-your-projects/)中，我們探討了 K2 編譯器在不同專案中的效能。如果您想查看有關 K2 編譯器效能的實際數據，並尋找如何從您自己的專案中收集效能基準測試的說明，請參閱該文章。

您也可以觀看 KotlinConf 2024 的這場演講，主導語言設計師 Michail Zarečenskij 在演講中討論了 Kotlin 中的特性演進和 K2 編譯器：

<video src="https://www.youtube.com/v/tAGJ5zJXJ7w" title="Kotlin Language Features in 2.0 and Beyond"/>

### 當前 K2 編譯器的限制

在您的 Gradle 專案中啟用 K2 存在某些限制，這些限制在以下情況下可能會影響使用 8.3 以下 Gradle 版本的專案：

* 編譯來自 `buildSrc` 的原始碼。
* 在包含的組建 (included builds) 中編譯 Gradle 外掛程式。
* 編譯其他 Gradle 外掛程式（如果它們在 Gradle 版本低於 8.3 的專案中使用）。
* 組建 Gradle 外掛程式相依性。

如果您遇到上述任何問題，可以採取以下步驟來解決：

* 為 `buildSrc`、任何 Gradle 外掛程式及其相依性設定語言版本：

  ```kotlin
  kotlin {
      compilerOptions {
          languageVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_1_9)
          apiVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_1_9)
      }
  }
  ```

  > 如果您為特定任務配置語言和 API 版本，這些值將覆蓋由 `compilerOptions` 擴充套件設定的值。在這種情況下，語言和 API 版本不應高於 1.9。
  >
  {style="note"}

* 將專案中的 Gradle 版本更新為 8.3 或更高版本。

### 智慧轉換改進

Kotlin 編譯器可以在特定情況下自動將物件轉換為某個型別，省去您手動顯式轉換的麻煩。這稱為 [智慧轉換 (smart casting)](typecasts.md#smart-casts)。
Kotlin K2 編譯器現在在比以前更多的情境中執行智慧轉換。

在 Kotlin 2.0.0 中，我們針對以下領域改進了智慧轉換：

* [區域變數與後續作用域](#local-variables-and-further-scopes)
* [使用邏輯或 (or) 運算子的型別檢查](#type-checks-with-logical-or-operator)
* [內嵌函式](#inline-functions)
* [具有函式型別的屬性](#properties-with-function-types)
* [例外處理](#exception-handling)
* [遞增與遞減運算子](#increment-and-decrement-operators)

#### 區域變數與後續作用域

先前，如果一個變數在 `if` 條件內被評估為非 `null`，則該變數會被智慧轉換。有關此變數的資訊接著會在 `if` 區塊的作用域內進一步共享。

然而，如果您在 `if` 條件 **之外** 宣告變數，則在 `if` 條件內將無法獲得有關該變數的資訊，因此無法進行智慧轉換。這種行為也出現在 `when` 運算式和 `while` 迴圈中。

從 Kotlin 2.0.0 開始，如果您在 `if`、`when` 或 `while` 條件中使用變數之前宣告它，那麼編譯器收集到的有關該變數的任何資訊都將在相應的區塊中可用於智慧轉換。

當您想要將布林條件提取到變數中時，這非常有用。然後，您可以為變數提供一個有意義的名稱，這將提高程式碼的可讀性，並使稍後在程式碼中重複使用該變數成為可能。例如：

```kotlin
class Cat {
    fun purr() {
        println("Purr purr")
    }
}

fun petAnimal(animal: Any) {
    val isCat = animal is Cat
    if (isCat) {
        // 在 Kotlin 2.0.0 中，編譯器可以存取
        // 有關 isCat 的資訊，因此它知道
        // animal 已被智慧轉換為 Cat 型別。
        // 因此，可以呼叫 purr() 函式。
        // 在 Kotlin 1.9.20 中，編譯器不知道
        // 智慧轉換，因此呼叫 purr()
        // 函式會觸發錯誤。
        animal.purr()
    }
}

fun main() {
    val kitty = Cat()
    petAnimal(kitty)
    // Purr purr
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-smart-casts-k2-local-variables" validate="false"}

#### 使用邏輯或運算子的型別檢查

在 Kotlin 2.0.0 中，如果您使用 `or` 運算子 (`||`) 組合物件的型別檢查，智慧轉換會將其轉換為最接近的共同超型別 (common supertype)。在此變更之前，智慧轉換總是將其轉換為 `Any` 型別。

在這種情況下，您之後仍必須手動檢查物件型別，然後才能存取其任何屬性或呼叫其函式。例如：

```kotlin
interface Status {
    fun signal() {}
}

interface Ok : Status
interface Postponed : Status
interface Declined : Status

fun signalCheck(signalStatus: Any) {
    if (signalStatus is Postponed || signalStatus is Declined) {
        // signalStatus 被智慧轉換為共同超型別 Status
        signalStatus.signal()
        // 在 Kotlin 2.0.0 之前，signalStatus 被智慧轉換
        // 為 Any 型別，因此呼叫 signal() 函式會觸發
        // Unresolved reference 錯誤。signal() 函式只能
        // 在另一次型別檢查後成功呼叫：

        // check(signalStatus is Status)
        // signalStatus.signal()
    }
}
```

> 共同超型別是聯合型別 (union type) 的一個 **近似值**。Kotlin 不支援 [聯合型別](https://en.wikipedia.org/wiki/Union_type)。
>
{style="note"}

#### 內嵌函式

在 Kotlin 2.0.0 中，K2 編譯器對內嵌函式的處理方式不同，使其能夠結合其他編譯器分析來判斷智慧轉換是否安全。

具體而言，內嵌函式現在被視為具有隱含的 [`callsInPlace`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.contracts/-contract-builder/calls-in-place.html) 合約。這意味著傳遞給內嵌函式的任何 lambda 函式都是就地呼叫的。由於 lambda 函式是就地呼叫的，編譯器知道 lambda 函式不會洩漏對其函式主體內包含的任何變數的參照。

編譯器利用這些知識以及其他編譯器分析來決定智慧轉換任何擷取的變數是否安全。例如：

```kotlin
interface Processor {
    fun process()
}

inline fun inlineAction(f: () -> Unit) = f()

fun nextProcessor(): Processor? = null

fun runProcessor(): Processor? {
    var processor: Processor? = null
    inlineAction {
        // 在 Kotlin 2.0.0 中，編譯器知道 processor 
        // 是一個區域變數，且 inlineAction() 是一個內嵌函式，因此 
        // 對 processor 的參照不會洩漏。因此，智慧轉換 processor 
        // 是安全的。

        // 如果 processor 不為 null，則 processor 會被智慧轉換
        if (processor != null) {
            // 編譯器知道 processor 不為 null，因此不需要 
            // 安全呼叫 (safe call)
            processor.process()

            // 在 Kotlin 1.9.20 中，您必須執行安全呼叫：
            // processor?.process()
        }

        processor = nextProcessor()
    }

    return processor
}
```

#### 具有函式型別的屬性

在舊版本的 Kotlin 中，存在一個錯誤，導致具有函式型別的類別屬性無法進行智慧轉換。我們在 Kotlin 2.0.0 和 K2 編譯器中修正了此行為。例如：

```kotlin
class Holder(val provider: (() -> Unit)?) {
    fun process() {
        // 在 Kotlin 2.0.0 中，如果 provider 不為 null，則
        // provider 會被智慧轉換
        if (provider != null) {
            // 編譯器知道 provider 不為 null
            provider()

            // 在 1.9.20 中，編譯器不知道 provider 不為 
            // null，因此會觸發錯誤：
            // Reference has a nullable type '(() -> Unit)?', use explicit '?.invoke()' to make a function-like call instead
        }
    }
}
```

如果您多載了 `invoke` 運算子，此變更也適用。例如：

```kotlin
interface Provider {
    operator fun invoke()
}

interface Processor : () -> String

class Holder(val provider: Provider?, val processor: Processor?) {
    fun process() {
        if (provider != null) {
            provider()
            // 在 1.9.20 中，編譯器會觸發錯誤： 
            // Reference has a nullable type 'Provider?' use explicit '?.invoke()' to make a function-like call instead
        }
    }
}
```

#### 例外處理

在 Kotlin 2.0.0 中，我們對例外處理進行了改進，以便將智慧轉換資訊傳遞給 `catch` 和 `finally` 區塊。這項變更使您的程式碼更安全，因為編譯器會追蹤您的物件是否具有可 null 型別。例如：

```kotlin
//sampleStart
fun testString() {
    var stringInput: String? = null
    // stringInput 被智慧轉換為 String 型別
    stringInput = ""
    try {
        // 編譯器知道 stringInput 不為 null
        println(stringInput.length)
        // 0

        // 編譯器拒絕先前有關 stringInput 的智慧轉換資訊。 
        // 現在 stringInput 的型別為 String?。
        stringInput = null

        // 觸發一個例外
        if (2 > 1) throw Exception()
        stringInput = ""
    } catch (exception: Exception) {
        // 在 Kotlin 2.0.0 中，編譯器知道 stringInput 
        // 可能為 null，因此 stringInput 保持為可 null。
        println(stringInput?.length)
        // null

        // 在 Kotlin 1.9.20 中，編譯器會說不需要 
        // 安全呼叫，但這是不正確的。
    }
}

//sampleEnd
fun main() {
    testString()
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-smart-casts-k2-exception-handling"}

#### 遞增與遞減運算子

在 Kotlin 2.0.0 之前，編譯器無法理解物件的型別在使用遞增或遞減運算子後可能會發生變化。由於編譯器無法準確追蹤物件型別，您的程式碼可能會導致未解析參照 (unresolved reference) 錯誤。在 Kotlin 2.0.0 中，這已得到修正：

```kotlin
interface Rho {
    operator fun inc(): Sigma = TODO()
}

interface Sigma : Rho {
    fun sigma() = Unit
}

interface Tau {
    fun tau() = Unit
}

fun main(input: Rho) {
    var unknownObject: Rho = input

    // 檢查 unknownObject 是否繼承自 Tau 介面
    // 注意，unknownObject 有可能同時繼承自
    // Rho 和 Tau 介面。
    if (unknownObject is Tau) {

        // 使用來自介面 Rho 的多載 inc() 運算子。
        // 在 Kotlin 2.0.0 中，unknownObject 的型別被智慧轉換為
        // Sigma。
        ++unknownObject

        // 在 Kotlin 2.0.0 中，編譯器知道 unknownObject 型別為
        // Sigma，因此可以成功呼叫 sigma() 函式。
        unknownObject.sigma()

        // 在 Kotlin 1.9.20 中，編譯器在呼叫 inc() 時不會執行 
        // 智慧轉換，因此編譯器仍然認為 
        // unknownObject 型別為 Tau。呼叫 sigma() 函式 
        // 會拋出編譯時期錯誤。
        
        // 在 Kotlin 2.0.0 中，編譯器知道 unknownObject 型別為
        // Sigma，因此呼叫 tau() 函式會拋出編譯時期
        // 錯誤。
        unknownObject.tau()
        // Unresolved reference 'tau'

        // 在 Kotlin 1.9.20 中，由於編譯器錯誤地認為 
        // unknownObject 型別為 Tau，因此可以呼叫 tau() 函式，
        // 但它會拋出 ClassCastException。
    }
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-smart-casts-k2-increment-decrement-operators" validate="false"}

### Kotlin 多平台改進

在 Kotlin 2.0.0 中，我們在 K2 編譯器中針對 Kotlin 多平台在以下領域進行了改進：

* [編譯期間通用與平台來源的分離](#separation-of-common-and-platform-sources-during-compilation)
* [預期宣告與實際宣告的不同可見性層級](#different-visibility-levels-of-expected-and-actual-declarations)

#### 編譯期間通用與平台來源的分離

先前，Kotlin 編譯器的設計使其無法在編譯時期保持通用來源集 (source sets) 與平台來源集的分離。結果是通用程式碼可以存取平台程式碼，這導致了不同平台之間的行為差異。此外，通用程式碼的一些編譯器設定和相依性過去會洩漏到平台程式碼中。

在 Kotlin 2.0.0 中，我們對新 Kotlin K2 編譯器的實作包括了編譯方案的重新設計，以確保通用來源集與平台來源集之間的嚴格分離。當您使用 [預期和實際函式](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html#expected-and-actual-functions) 時，這項變更最為明顯。先前，通用程式碼中的函式呼叫有可能解析為平台程式碼中的函式。例如：

<table>
   <tr>
       <td>通用程式碼</td>
       <td>平台程式碼</td>
   </tr>
   <tr>
<td>

```kotlin
fun foo(x: Any) = println("common foo")

fun exampleFunction() {
    foo(42)
}
```

</td>
<td>

```kotlin
// JVM
fun foo(x: Int) = println("platform foo")

// JavaScript
// 在 JavaScript 平台上沒有 foo() 函式的多載
```

</td>
</tr>
</table>

在此範例中，通用程式碼的行為取決於它在哪個平台上執行：

* 在 JVM 平台上，在通用程式碼中呼叫 `foo()` 函式會導致呼叫平台程式碼中的 `foo()` 函式，結果為 `platform foo`。
* 在 JavaScript 平台上，在通用程式碼中呼叫 `foo()` 函式會導致呼叫通用程式碼中的 `foo()` 函式，結果為 `common foo`，因為平台程式碼中沒有這樣的函式。

在 Kotlin 2.0.0 中，通用程式碼無法存取平台程式碼，因此兩個平台都會成功將 `foo()` 函式解析為通用程式碼中的 `foo()` 函式：`common foo`。

除了提高跨平台行為的一致性之外，我們也努力修正了 IntelliJ IDEA 或 Android Studio 與編譯器之間行為衝突的情況。例如，當您使用 [預期和實際類別](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html#expected-and-actual-classes) 時，會發生以下情況：

<table>
   <tr>
       <td>通用程式碼</td>
       <td>平台程式碼</td>
   </tr>
   <tr>
<td>

```kotlin
expect class Identity {
    fun confirmIdentity(): String
}

fun common() {
    // 在 2.0.0 之前，
    // 這會觸發僅限 IDE 的錯誤
    Identity().confirmIdentity()
    // RESOLUTION_TO_CLASSIFIER : Expected class
    // Identity has no default constructor.
}
```

</td>
<td>

```kotlin
actual class Identity {
    actual fun confirmIdentity() = "expect class fun: jvm"
}
```

</td>
</tr>
</table>

在此範例中，預期類別 `Identity` 沒有預設建構函式，因此無法在通用程式碼中成功呼叫。先前，錯誤僅由 IDE 報告，但程式碼在 JVM 上仍然編譯成功。然而，現在編譯器會正確回報錯誤：

```none
Expected class 'expect class Identity : Any' does not have default constructor
```

##### 解析行為不變的情況

我們仍處於遷移到新編譯方案的過程中，因此當您呼叫不在同一個來源集內的函式時，解析行為仍然相同。當您在通用程式碼中使用來自多平台程式庫的多載時，您會主要注意到這種差異。

假設您有一個程式庫，它有兩個具有不同簽章的 `whichFun()` 函式：

```kotlin
// 範例程式庫

// 模組：common
fun whichFun(x: Any) = println("common function")

// 模組：JVM
fun whichFun(x: Int) = println("platform function")
```

如果您在通用程式碼中呼叫 `whichFun()` 函式，則會解析程式庫中具有最相關引數型別的函式：

```kotlin
// 使用範例程式庫作為 JVM 目標的專案

// 模組：common
fun main() {
    whichFun(2)
    // platform function
}
```

相比之下，如果您在同一個來源集中宣告 `whichFun()` 的多載，則會解析來自通用程式碼的函式，因為您的程式碼無法存取平台特定版本：

```kotlin
// 不使用範例程式庫

// 模組：common
fun whichFun(x: Any) = println("common function")

fun main() {
    whichFun(2)
    // common function
}

// 模組：JVM
fun whichFun(x: Int) = println("platform function")
```

與多平台程式庫類似，由於 `commonTest` 模組位於單獨的來源集中，它仍然可以存取平台特定的程式碼。因此，在 `commonTest` 模組中呼叫函式的解析表現與舊編譯方案中的行為相同。

未來，這些剩餘的情況將與新編譯方案更加一致。

#### 預期宣告與實際宣告的不同可見性層級

在 Kotlin 2.0.0 之前，如果您在 Kotlin 多平台專案中使用 [預期和實際宣告](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)，它們必須具有相同的 [可見性層級](visibility-modifiers.md)。
Kotlin 2.0.0 現在也支援不同的可見性層級，但 **僅限於** 實際宣告比預期宣告更具開放性的情況。例如：

```kotlin
expect internal class Attribute // 可見性為 internal
actual class Attribute          // 可見性預設為 public，
                                // 更具開放性
```

同樣地，如果您在實際宣告中使用 [型別別名 (type alias)](type-aliases.md)，**底層型別** 的可見性應與預期宣告相同或更具開放性。例如：

```kotlin
expect internal class Attribute                 // 可見性為 internal
internal actual typealias Attribute = Expanded

class Expanded                                  // 可見性預設為 public，
                                                // 更具開放性
```

### 編譯器外掛程式支援

目前，Kotlin K2 編譯器支援以下 Kotlin 編譯器外掛程式：

* [`all-open`](all-open-plugin.md)
* [AtomicFU](https://github.com/Kotlin/kotlinx-atomicfu)
* [`jvm-abi-gen`](https://github.com/JetBrains/kotlin/tree/master/plugins/jvm-abi-gen)
* [`js-plain-objects`](https://github.com/JetBrains/kotlin/tree/master/plugins/js-plain-objects)
* [kapt](whatsnew1920.md#preview-kapt-compiler-plugin-with-k2)
* [Lombok](lombok.md)
* [`no-arg`](no-arg-plugin.md)
* [Parcelize](https://plugins.gradle.org/plugin/org.jetbrains.kotlin.plugin.parcelize)
* [具備接收者的 SAM (SAM with receiver)](sam-with-receiver-plugin.md)
* [serialization](serialization.md)
* [Power-assert](power-assert.md)

此外，Kotlin K2 編譯器支援：

* [Jetpack Compose](https://developer.android.com/jetpack/compose) 編譯器外掛程式 2.0.0，該外掛程式已 [移至 Kotlin 存儲庫](https://android-developers.googleblog.com/2024/04/jetpack-compose-compiler-moving-to-kotlin-repository.html)。
* 自 [KSP2](https://android-developers.googleblog.com/2023/12/ksp2-preview-kotlin-k2-standalone.html) 起的 [Kotlin 符號處理 (KSP) 外掛程式](ksp-overview.md)。

> 如果您使用任何額外的編譯器外掛程式，請檢查其文件以查看它們是否與 K2 相容。
>
{style="tip"}

### 實驗性 Kotlin Power-assert 編譯器外掛程式

> Kotlin Power-assert 外掛程式處於 [實驗性階段 (Experimental)](components-stability.md#stability-levels-explained)。它隨時可能發生變化。
>
{style="warning"}

Kotlin 2.0.0 引入了一個實驗性的 Power-assert 編譯器外掛程式。此外掛程式透過在失敗訊息中包含上下文資訊來改善撰寫測試的體驗，使偵錯更容易、更高效。

開發人員通常需要使用複雜的斷言庫來撰寫有效的測試。Power-assert 外掛程式透過自動產生包含斷言運算式中間值的失敗訊息來簡化此過程。這有助於開發人員快速了解測試失敗的原因。

當測試中的斷言失敗時，改進後的錯誤訊息會顯示斷言中所有變數和子運算式的值，從而清楚地指出是哪部分條件導致了失敗。這對於檢查多個條件的複雜斷言特別有用。

要在專案中啟用此外掛程式，請在您的 `build.gradle(.kts)` 檔案中進行配置：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform") version "2.0.0"
    kotlin("plugin.power-assert") version "2.0.0"
}

powerAssert {
    functions = listOf("kotlin.assert", "kotlin.test.assertTrue")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '2.0.0'
    id 'org.jetbrains.kotlin.plugin.power-assert' version '2.0.0'
}

powerAssert {
    functions = ["kotlin.assert", "kotlin.test.assertTrue"]
}
```

</tab>
</tabs>

在 [文件](power-assert.md) 中進一步了解 Kotlin Power-assert 外掛程式。

### 如何啟用 Kotlin K2 編譯器

從 Kotlin 2.0.0 開始，Kotlin K2 編譯器預設啟用。不需要採取額外行動。

### 在 Kotlin Playground 中試用 Kotlin K2 編譯器

Kotlin Playground 支援 2.0.0 版本。[去看看吧！](https://pl.kotl.in/czuoQprce)

### 在 IDE 中的支援

預設情況下，IntelliJ IDEA 和 Android Studio 仍使用之前的編譯器進行程式碼分析、程式碼補全、醒目提示和其他 IDE 相關功能。若要在 IDE 中獲得完整的 Kotlin 2.0 體驗，請啟用 K2 模式。

在您的 IDE 中，前往 **Settings** | **Languages & Frameworks** | **Kotlin** 並選取 **Enable K2 mode** 選項。IDE 將使用其 K2 模式分析您的程式碼。

![啟用 K2 模式](k2-mode.png){width=200}

啟用 K2 模式後，由於編譯器行為的變化，您可能會注意到 IDE 分析方面的差異。請在我們的 [遷移指南](k2-compiler-migration-guide.md) 中了解新 K2 編譯器與前一個編譯器的不同之處。

* 在 [我們的部落格](https://blog.jetbrains.com/idea/2024/11/k2-mode-becomes-stable/) 中進一步了解 K2 模式。
* 我們正在積極收集有關 K2 模式的回饋，因此請在我們的 [公開 Slack 頻道](https://kotlinlang.slack.com/archives/C0B8H786P) 中分享您的想法。

### 對新 K2 編譯器留下您的回饋

我們將非常感謝您可能提供的任何回饋！

* 在 [我們的問題追蹤器](https://kotl.in/issue) 中回報您在使用新 K2 編譯器時遇到的任何問題。
* [啟用 "Send usage statistics" 選項](https://www.jetbrains.com/help/idea/settings-usage-statistics.html) 以允許 JetBrains 收集有關 K2 使用情況的匿名數據。

## Kotlin/JVM

從 2.0.0 版本開始，編譯器可以產生包含 Java 22 位元組碼的類別。
此版本還帶來了以下變更：

* [使用 invokedynamic 產生 lambda 函式](#generation-of-lambda-functions-using-invokedynamic)
* [kotlinx-metadata-jvm 程式庫現已進入穩定版](#the-kotlinx-metadata-jvm-library-is-stable)

### 使用 invokedynamic 產生 lambda 函式

Kotlin 2.0.0 引入了一種新的預設方法，使用 `invokedynamic` 產生 lambda 函式。與傳統的匿名類別產生方式相比，這項變更減少了應用程式的二進位大小。

自第一個版本以來，Kotlin 就將 lambda 產生為匿名類別。然而，從 [Kotlin 1.5.0](whatsnew15.md#lambdas-via-invokedynamic) 開始，透過使用 `-Xlambdas=indy` 編譯器選項，已可以使用 `invokedynamic` 產生的選項。在 Kotlin 2.0.0 中，`invokedynamic` 已成為 lambda 產生的預設方法。此方法產生更輕量級的二進位檔案，並使 Kotlin 與 JVM 最佳化保持一致，確保應用程式從 JVM 效能的持續和未來改進中受益。

目前，與普通的 lambda 編譯相比，它有三個限制：

* 編譯成 `invokedynamic` 的 lambda 不可序列化。
* 實驗性的 [`reflect()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.jvm/reflect.html) API 不支援由 `invokedynamic` 產生的 lambda。
* 在此類 lambda 上呼叫 `.toString()` 會產生較難讀取的字串表示形式：

```kotlin
fun main() {
    println({})

    // 使用 Kotlin 1.9.24 與反射，傳回
    // () -> kotlin.Unit
    
    // 使用 Kotlin 2.0.0，傳回
    // FileKt$Lambda$13/0x00007f88a0004608@506e1b77
}
```

若要保留產生 lambda 函式的舊有行為，您可以：

* 使用 `@JvmSerializableLambda` 註解特定的 lambda。
* 使用編譯器選項 `-Xlambdas=class` 使用舊方法產生模組中的所有 lambda。

### kotlinx-metadata-jvm 程式庫已穩定

在 Kotlin 2.0.0 中，`kotlinx-metadata-jvm` 程式庫已進入 [穩定版 (Stable)](components-stability.md#stability-levels-explained)。由於該程式庫已更改為 `kotlin` 套件和座標，您現在可以將其標識為 `kotlin-metadata-jvm`（不含 "x"）。

先前，`kotlinx-metadata-jvm` 程式庫有其自己的發佈方案和版本。現在，我們將把 `kotlin-metadata-jvm` 更新作為 Kotlin 發佈週期的一部分進行組建和發佈，並提供與 Kotlin 標準函式庫相同的向後相容性保證。

`kotlin-metadata-jvm` 程式庫提供了一個 API，用於讀取和修改由 Kotlin/JVM 編譯器產生的二進位檔案的中繼資料。

<!-- 在 [文件](kotlin-metadata-jvm.md) 中進一步了解 `kotlinx-metadata-jvm` 程式庫。 -->

## Kotlin/Native

此版本帶來了以下變更：

* [使用 signposts 監控 GC 效能](#monitoring-gc-performance-with-signposts-on-apple-platforms)
* [解決與 Objective-C 方法的衝突](#resolving-conflicts-with-objective-c-methods)
* [更改了 Kotlin/Native 中編譯器引數的記錄層級](#changed-log-level-for-compiler-arguments)
* [在 Kotlin/Native 中顯式添加了標準函式庫和平台相依性](#explicitly-added-standard-library-and-platform-dependencies-to-kotlin-native)
* [Gradle 配置快取中的任務錯誤](#tasks-error-in-gradle-configuration-cache)

### 在 Apple 平台上使用 signposts 監控 GC 效能

先前，只能透過查看日誌來監控 Kotlin/Native 垃圾回收器 (GC) 的效能。然而，這些日誌並未與 Xcode Instruments 整合，後者是用於調查 iOS 應用程式效能問題的常用工具組。

自 Kotlin 2.0.0 起，GC 會使用 Instruments 中可用的 signposts 回報暫停。Signposts 允許在應用程式內進行自訂日誌記錄，因此現在在偵錯 iOS 應用程式效能時，您可以檢查 GC 暫停是否與應用程式凍結相對應。

在 [文件](native-memory-manager.md#monitor-gc-performance) 中進一步了解 GC 效能分析。

### 解決與 Objective-C 方法的衝突

Objective-C 方法可以有不同的名稱，但參數的數量和型別相同。例如，[`locationManager:didEnterRegion:`](https://developer.apple.com/documentation/corelocation/cllocationmanagerdelegate/1423560-locationmanager?language=objc) 和 [`locationManager:didExitRegion:`](https://developer.apple.com/documentation/corelocation/cllocationmanagerdelegate/1423630-locationmanager?language=objc)。在 Kotlin 中，這些方法具有相同的簽章，因此嘗試使用它們會觸發衝突的多載錯誤。

先前，您必須手動隱藏衝突的多載以避免此編譯錯誤。為了改進 Kotlin 與 Objective-C 的互通性，Kotlin 2.0.0 引入了新的 `@ObjCSignatureOverride` 註解。

該註解指示 Kotlin 編譯器忽略衝突的多載，以防從 Objective-C 類別繼承了數個具有相同引數型別但引數名稱不同的函式。

應用此註解也比一般的錯誤隱藏更安全。此註解僅能在覆寫 Objective-C 方法的情況下使用，這些方法是受支援且經過測試的，而一般的隱藏可能會掩蓋重要的錯誤並導致程式碼靜默損壞。

### 更改了編譯器引數的記錄層級

在此版本中，Kotlin/Native Gradle 任務（如 `compile`、`link` 和 `cinterop`）中編譯器引數的記錄層級已從 `info` 更改為 `debug`。

將 `debug` 作為其預設值後，記錄層級與其他 Gradle 編譯任務保持一致，並提供詳細的偵錯資訊，包括所有編譯器引數。

### 在 Kotlin/Native 中顯式添加了標準函式庫和平台相依性

先前，Kotlin/Native 編譯器會隱含地解析標準函式庫和平台相依性，這導致 Kotlin Gradle 外掛程式在不同 Kotlin 目標間運作的方式不一致。

現在，每個 Kotlin/Native Gradle 編譯都會透過 `compileDependencyFiles` [編譯參數](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html#compilation-parameters) 在其編譯時期函式庫路徑中顯式包含標準函式庫和平台相依性。

### Gradle 配置快取中的任務錯誤

自 Kotlin 2.0.0 起，您可能會遇到配置快取錯誤，訊息指出：
`invocation of Task.project at execution time is unsupported`。

此錯誤出現在 `NativeDistributionCommonizerTask` 和 `KotlinNativeCompile` 等任務中。

然而，這是一個誤報錯誤。根本原因是存在與 Gradle 配置快取不相容的任務，例如 `publish*` 任務。

這種差異可能不會立即顯現，因為錯誤訊息暗示了不同的根本原因。

由於錯誤報告中未明確指出精確原因，[Gradle 團隊已經在著手處理該問題以修正報告](https://github.com/gradle/gradle/issues/21290)。

## Kotlin/Wasm

Kotlin 2.0.0 改進了效能以及與 JavaScript 的互通性：

* [預設使用 Binaryen 最佳化正式生產環境組建](#optimized-production-builds-by-default-using-binaryen)
* [支援具名匯出](#support-for-named-export)
* [在帶有 `@JsExport` 的函式中支援無符號基本型別](#support-for-unsigned-primitive-types-in-functions-with-jsexport)
* [在 Kotlin/Wasm 中產生 TypeScript 宣告檔案](#generation-of-typescript-declaration-files-in-kotlin-wasm)
* [支援捕捉 JavaScript 例外](#support-for-catching-javascript-exceptions)
* [現在支援新的例外處理提案作為選項](#new-exception-handling-proposal-is-now-supported-as-an-option)
* [將 `withWasm()` 函式拆分為 JS 和 WASI 變體](#the-withwasm-function-is-split-into-js-and-wasi-variants)

### 預設使用 Binaryen 最佳化正式生產環境組建

Kotlin/Wasm 工具鏈現在在對所有專案進行正式生產環境編譯期間套用 [Binaryen](https://github.com/WebAssembly/binaryen) 工具，而不是像先前那樣採用手動設定的方法。根據我們的估計，這應該會提高執行時效能並減小專案的二進位檔案大小。

> 此變更僅影響正式生產環境編譯。開發編譯過程保持不變。
>
{style="note"}

### 支援具名匯出

先前，所有從 Kotlin/Wasm 匯出的宣告都使用預設匯出 (default export) 匯入到 JavaScript 中：

```javascript
//JavaScript:
import Module from "./index.mjs"

Module.add()
```

現在，您可以依名稱匯入每個標記有 `@JsExport` 的 Kotlin 宣告：

```kotlin
// Kotlin:
@JsExport
fun add(a: Int, b: Int) = a + b
```

```javascript
//JavaScript:
import { add } from "./index.mjs"
```

具名匯出使得在 Kotlin 和 JavaScript 模組之間共享程式碼變得更加容易。它們提高了可讀性並幫助您管理模組之間的相依性。

### 在帶有 @JsExport 的函式中支援無符號基本型別

從 Kotlin 2.0.0 開始，您可以在外部宣告和帶有 `@JsExport` 註解的函式中使用 [無符號基本型別](unsigned-integer-types.md)，這使得 Kotlin/Wasm 函式可在 JavaScript 程式碼中使用。

這有助於緩解先前的限制，即防止 [無符號基本型別](unsigned-integer-types.md) 直接在匯出的和外部宣告中使用。現在您可以匯出具有無符號基本型別作為傳回或參數型別的函式，並取用傳回或取用無符號基本型別的外部宣告。

有關 Kotlin/Wasm 與 JavaScript 互通性的更多資訊，請參閱 [文件](wasm-js-interop.md#use-javascript-code-in-kotlin)。

### 在 Kotlin/Wasm 中產生 TypeScript 宣告檔案

> 在 Kotlin/Wasm 中產生 TypeScript 宣告檔案處於 [實驗性階段 (Experimental)](components-stability.md#stability-levels-explained)。它隨時可能被棄用或更改。
>
{style="warning"}

在 Kotlin 2.0.0 中，Kotlin/Wasm 編譯器現在能夠從您的 Kotlin 程式碼中的任何 `@JsExport` 宣告產生 TypeScript 定義。這些定義可供 IDE 和 JavaScript 工具使用，以提供程式碼自動補全、協助進行型別檢查，並使在 JavaScript 中包含 Kotlin 程式碼變得更加容易。

Kotlin/Wasm 編譯器會收集任何標記有 `@JsExport` 的 [頂層函式](wasm-js-interop.md#functions-with-the-jsexport-annotation)，並自動在 `.d.ts` 檔案中產生 TypeScript 定義。

要產生 TypeScript 定義，請在您的 `build.gradle(.kts)` 檔案中的 `wasmJs {}` 區塊中加入 `generateTypeScriptDefinitions()` 函式：

```kotlin
kotlin {
    wasmJs {
        binaries.executable()
        browser {
        }
        generateTypeScriptDefinitions()
    }
}
```

### 支援捕捉 JavaScript 例外

先前，Kotlin/Wasm 程式碼無法捕捉 JavaScript 例外，這使得處理源自程式 JavaScript 端的錯誤變得困難。

在 Kotlin 2.0.0 中，我們實作了在 Kotlin/Wasm 內捕捉 JavaScript 例外的支援。此實作允許您使用 `try-catch` 區塊，配合特定的型別（如 `Throwable` 或 `JsException`），來正確處理這些錯誤。

此外，無論是否發生例外都有助於執行程式碼的 `finally` 區塊也能正確運作。雖然我們引入了捕捉 JavaScript 例外的支援，但在發生 JavaScript 例外（如呼叫堆疊）時並未提供額外資訊。然而，[我們正在著手處理這些實作](https://youtrack.jetbrains.com/issue/KT-68185/WasmJs-Attach-js-exception-object-to-JsException)。

### 現在支援新的例外處理提案作為選項

在此版本中，我們在 Kotlin/Wasm 內引入了對新版 WebAssembly [例外處理提案](https://github.com/WebAssembly/exception-handling/blob/main/proposals/exception-handling/Exceptions.md) 的支援。

此更新確保新提案符合 Kotlin 需求，從而實現在僅支援最新版本提案的虛擬機上使用 Kotlin/Wasm。

透過使用 `-Xwasm-use-new-exception-proposal` 編譯器選項來啟用新的例外處理提案，該選項預設為關閉。

### 將 withWasm() 函式拆分為 JS 和 WASI 變體

先前用於為階層範本提供 Wasm 目標的 `withWasm()` 函式已棄用，取而代之的是專門的 `withWasmJs()` 和 `withWasmWasi()` 函式。

現在，您可以在樹狀定義中的不同群組之間分離 WASI 和 JS 目標。

## Kotlin/JS

在其他變更中，此版本為 Kotlin 帶來了現代化的 JS 編譯，支援更多來自 ES2015 標準的特性：

* [新的編譯目標](#new-compilation-target)
* [Suspend 函式作為 ES2015 產生器 (generators)](#suspend-functions-as-es2015-generators)
* [向 main 函式傳遞引數](#passing-arguments-to-the-main-function)
* [Kotlin/JS 專案的逐檔案編譯](#per-file-compilation-for-kotlin-js-projects)
* [改進的集合互通性](#improved-collection-interoperability)
* [支援 createInstance()](#support-for-createinstance)
* [支援型別安全的純 JavaScript 物件](#support-for-type-safe-plain-javascript-objects)
* [支援 npm 封裝管理員](#support-for-npm-package-manager)
* [編譯任務的變更](#changes-to-compilation-tasks)
* [停止提供舊有的 Kotlin/JS JAR 構件](#discontinuing-legacy-kotlin-js-jar-artifacts)

### 新的編譯目標

在 Kotlin 2.0.0 中，我們為 Kotlin/JS 添加了一個新的編譯目標：`es2015`。這是一種讓您一次啟用 Kotlin 中支援的所有 ES2015 特性的新方法。

您可以像這樣在您的 `build.gradle(.kts)` 檔案中設定它：

```kotlin
kotlin {
    js {
        compilerOptions {
            target.set("es2015")
        }
    }
}
```

新目標會自動開啟 [ES 類別與模組](whatsnew19.md#experimental-support-for-es2015-classes-and-modules) 以及新支援的 [ES 產生器](#suspend-functions-as-es2015-generators)。

### Suspend 函式作為 ES2015 產生器

此版本引入了對 ES2015 產生器的 [實驗性 (Experimental)](components-stability.md#stability-levels-explained) 支援，用於編譯 [suspend 函式](composing-suspending-functions.md)。

使用產生器代替狀態機應能改進專案的最終組合包 (bundle) 大小。例如，JetBrains 團隊透過使用 ES2015 產生器，成功將其 Space 專案的組合包大小減少了 20%。

[在官方文件中進一步了解 ES2015 (ECMAScript 2015, ES6)](https://262.ecma-international.org/6.0/)。

### 向 main 函式傳遞引數

從 Kotlin 2.0.0 開始，您可以為 `main()` 函式指定 `args` 的來源。此特性使得處理命令列並傳遞引數變得更加容易。

要執行此操作，請使用新的 `passAsArgumentToMainFunction()` 函式定義 `js {}` 區塊，該函式會回傳一個字串陣列：

```kotlin
kotlin {
    js {
        binary.executable()
        passAsArgumentToMainFunction("Deno.args")
    }
}
```

該函式在執行階段執行。它接收 JavaScript 運算式，並將其用作 `args: Array<String>` 引數，而不是呼叫 `main()` 函式。

此外，如果您使用 Node.js 執行階段，可以利用特殊的別名。它允許您一次將 `process.argv` 傳遞給 `args` 參數，而不需要每次都手動添加：

```kotlin
kotlin {
    js {
        binary.executable()
        nodejs {
            passProcessArgvToMainFunction()
        }
    }
}
```

### Kotlin/JS 專案的逐檔案編譯

Kotlin 2.0.0 為 Kotlin/JS 專案輸出引入了新的細粒度選項。您現在可以設定逐檔案 (per-file) 編譯，為每個 Kotlin 檔案產生一個 JavaScript 檔案。這有助於顯著最佳化最終組合包的大小並提高程式的載入時間。

先前只有兩種輸出選項。Kotlin/JS 編譯器可以為整個專案產生單一的 `.js` 檔案。然而，這個檔案可能太大且不便於使用。每當您想使用專案中的函式時，都必須將整個 JavaScript 檔案作為相依性包含在內。或者，您可以為每個專案模組配置單獨的 `.js` 檔案編譯。這仍然是預設選項。

由於模組檔案也可能太大，在 Kotlin 2.0.0 中，我們添加了更細粒度的輸出，為每個 Kotlin 檔案產生一個（或兩個，如果該檔案包含匯出的宣告）JavaScript 檔案。要啟用逐檔案編譯模式：

1. 在您的組建檔案中添加 [`useEsModules()`](whatsnew19.md#experimental-support-for-es2015-classes-and-modules) 函式以支援 ECMAScript 模組：

   ```kotlin
   // build.gradle.kts
   kotlin {
       js(IR) {
           useEsModules() // 啟用 ES2015 模組
           browser()
       }
   }
   ```

   您也可以為此使用新的 `es2015` [編譯目標](#new-compilation-target)。

2. 套用 `-Xir-per-file` 編譯器選項，或使用以下內容更新您的 `gradle.properties` 檔案：

   ```none
   # gradle.properties
   kotlin.js.ir.output.granularity=per-file // `per-module` 為預設值
   ```

### 改進的集合互通性

從 Kotlin 2.0.0 開始，可以將簽章內帶有 Kotlin 集合型別的宣告匯出到 JavaScript（和 TypeScript）。這適用於 `Set`、`Map` 和 `List` 集合型別及其可變對應型別。

要在 JavaScript 中使用 Kotlin 集合，請先使用 [`@JsExport`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-js-export/) 註解標記必要的宣告：

```kotlin
// Kotlin
@JsExport
data class User(
    val name: String,
    val friends: `List<User>` = emptyList()
)

@JsExport
val me = User(
    name = "Me",
    friends = listOf(User(name = "Kodee"))
)
```

然後，您可以從 JavaScript 中將它們作為常規 JavaScript 陣列來取用：

```javascript
// JavaScript
import { User, me, KtList } from "my-module"

const allMyFriendNames = me.friends
    .asJsReadonlyArrayView()
    .map(x => x.name) // ['Kodee']
```

> 遺憾的是，目前仍無法從 JavaScript 建立 Kotlin 集合。我們計劃在 Kotlin 2.0.20 中加入此功能。
>
{style="note"}

### 支援 createInstance()

從 Kotlin 2.0.0 開始，您可以使用來自 Kotlin/JS 目標的 [`createInstance()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.full/create-instance.html) 函式。先前，它僅在 JVM 上可用。

此函式來自 [KClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/) 介面，可建立指定類別的新執行個體，這對於獲取 Kotlin 類別的執行階段參照非常有用。

### 支援型別安全的純 JavaScript 物件

> `js-plain-objects` 外掛程式處於 [實驗性階段 (Experimental)](components-stability.md#stability-levels-explained)。它隨時可能被棄用或更改。`js-plain-objects` 外掛程式 **僅** 支援 K2 編譯器。
>
{style="warning"}

為了更輕鬆地使用 JavaScript API，在 Kotlin 2.0.0 中，我們提供了一個新外掛程式：[`js-plain-objects`](https://github.com/JetBrains/kotlin/tree/master/plugins/js-plain-objects)，您可以使用它來建立型別安全的純 JavaScript 物件。該外掛程式會檢查您的程式碼中是否有任何帶有 `@JsPlainObject` 註解的 [外部介面](wasm-js-interop.md#external-interfaces)，並添加：

* 伴隨物件 (companion object) 內的一個內嵌 `invoke` 運算子函式，您可以將其用作建構函式。
* 一個 `.copy()` 函式，您可以使用它來建立物件的複本，同時調整其某些屬性。

例如：

```kotlin
import kotlinx.js.JsPlainObject

@JsPlainObject
external interface User {
    var name: String
    val age: Int
    val email: String?
}

fun main() {
    // 建立一個 JavaScript 物件
    val user = User(name = "Name", age = 10)
    // 複製物件並添加電子郵件
    val copy = user.copy(age = 11, email = "some@user.com")

    println(JSON.stringify(user))
    // { "name": "Name", "age": 10 }
    println(JSON.stringify(copy))
    // { "name": "Name", "age": 11, "email": "some@user.com" }
}
```

使用此方法建立的任何 JavaScript 物件都更安全，因為您不會僅在執行階段看到錯誤，而是在編譯時期就能看到，甚至由您的 IDE 醒目提示。

考慮這個範例，它使用 `fetch()` 函式與 JavaScript API 互動，並使用外部介面來描述 JavaScript 物件的形狀：

```kotlin
import kotlinx.js.JsPlainObject

@JsPlainObject
external interface FetchOptions {
    val body: String?
    val method: String
}

// Window.fetch 的包裝函式
suspend fun fetch(url: String, options: FetchOptions? = null) = TODO("在此添加您的自訂行為")

// 觸發編譯時期錯誤，因為 "metod" 無法識別為 method
fetch("https://google.com", options = FetchOptions(metod = "POST"))
// 觸發編譯時期錯誤，因為 method 是必要的
fetch("https://google.com", options = FetchOptions(body = "SOME STRING")) 
```

相比之下，如果您改用 `js()` 函式來建立 JavaScript 物件，則錯誤僅在執行階段被發現，或者根本不會觸發：

```kotlin
suspend fun fetch(url: String, options: FetchOptions? = null) = TODO("在此添加您的自訂行為")

// 不會觸發錯誤。由於 "metod" 無法識別，因此使用了錯誤的方法 (GET)。
fetch("https://google.com", options = js("{ metod: 'POST' }"))

// 預設情況下使用 GET 方法。觸發執行階段錯誤，因為不應存在 body。
fetch("https://google.com", options = js("{ body: 'SOME STRING' }"))
// TypeError: Window.fetch: HEAD or GET Request cannot have a body
```

要使用 `js-plain-objects` 外掛程式，請在您的 `build.gradle(.kts)` 檔案中添加以下內容：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("plugin.js-plain-objects") version "2.0.0"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id "org.jetbrains.kotlin.plugin.js-plain-objects" version "2.0.0"
}
```

</tab>
</tabs>

### 支援 npm 封裝管理員

先前，Kotlin 多平台 Gradle 外掛程式只能使用 [Yarn](https://yarnpkg.com/lang/en/) 作為封裝管理員來下載和安裝 npm 相依性。從 Kotlin 2.0.0 開始，您可以改用 [npm](https://www.npmjs.com/) 作為您的封裝管理員。使用 npm 作為封裝管理員意味著您在設定期間少了一個需要管理的工具。

為了向後相容，Yarn 仍是預設的封裝管理員。要使用 npm 作為您的封裝管理員，請在您的 `gradle.properties` 檔案中設定以下屬性：

```kotlin
kotlin.js.yarn = false
```

### 編譯任務的變更

先前，`webpack` 和 `distributeResources` 編譯任務都以相同的目錄為目標。此外，`distribution` 任務也將 `dist` 宣告為其輸出目錄。這導致輸出重疊並產生編譯警告。

因此，從 Kotlin 2.0.0 開始，我們實作了以下變更：

* `webpack` 任務現在以一個單獨的資料夾為目標。
* `distributeResources` 任務已完全移除。
* `distribution` 任務現在具有 `Copy` 型別，並以 `dist` 資料夾為目標。

### 停止提供舊有的 Kotlin/JS JAR 構件

從 Kotlin 2.0.0 開始，Kotlin 發行版不再包含副檔名為 `.jar` 的舊有 Kotlin/JS 構件。舊有構件用於不受支援的舊版 Kotlin/JS 編譯器，且對於使用 `klib` 格式的 IR 編譯器來說是不必要的。

## Gradle 改進

Kotlin 2.0.0 完全相容於 Gradle 6.8.3 到 8.5。您也可以使用最高到最新發佈版本的 Gradle 版本，但如果您這樣做，請記住您可能會遇到棄用警告，或者某些新的 Gradle 特性可能無法運作。

此版本帶來了以下變更：

* [多平台專案中用於編譯器選項的新 Gradle DSL](#new-gradle-dsl-for-compiler-options-in-multiplatform-projects)
* [新的 Compose 編譯器 Gradle 外掛程式](#new-compose-compiler-gradle-plugin)
* [區分 JVM 和 Android 發佈函式庫的新屬性](#new-attribute-to-distinguish-jvm-and-android-published-libraries)
* [改進了 Kotlin/Native 中 CInteropProcess 的 Gradle 相依性處理](#improved-gradle-dependency-handling-for-cinteropprocess-in-kotlin-native)
* [Gradle 中的可見性變更](#visibility-changes-in-gradle)
* [Gradle 專案中用於 Kotlin 數據的新目錄](#new-directory-for-kotlin-data-in-gradle-projects)
* [在需要時下載 Kotlin/Native 編譯器](#kotlin-native-compiler-downloaded-when-needed)
* [棄用定義編譯器選項的舊方法](#deprecated-old-ways-of-defining-compiler-options)
* [提升了支援的最低 AGP 版本](#bumped-minimum-supported-agp-version)
* [用於嘗試最新語言版本的新 Gradle 屬性](#new-gradle-property-for-trying-the-latest-language-version)
* [用於組建報告的新 JSON 輸出格式](#new-json-output-format-for-build-reports)
* [kapt 組態從超組態繼承註解處理器](#kapt-configurations-inherit-annotation-processors-from-superconfigurations)
* [Kotlin Gradle 外掛程式不再使用已棄用的 Gradle 慣例](#kotlin-gradle-plugin-no-longer-uses-deprecated-gradle-conventions)

### 多平台專案中用於編譯器選項的新 Gradle DSL

> 此特性處於 [實驗性階段 (Experimental)](components-stability.md#stability-levels-explained)。它隨時可能被棄用或更改。僅用於評估目的。我們非常感謝您在 [YouTrack](https://kotl.in/issue) 上對此提供的回饋。
>
{style="warning"}

在 Kotlin 2.0.0 之前，在 Gradle 多平台專案中配置編譯器選項只能在較低層級進行，例如按任務、編譯或來源集。為了更輕鬆地在您的專案中更通用地配置編譯器選項，Kotlin 2.0.0 隨附了新的 Gradle DSL。

透過這個新的 DSL，您可以在擴充套件層級為所有目標和共享來源集（如 `commonMain`）以及在目標層級為特定目標配置編譯器選項：

```kotlin
kotlin {
    compilerOptions {
        // 擴充套件層級的通用編譯器選項，用作
        // 所有目標和共享來源集的預設值
        allWarningsAsErrors.set(true)
    }
    jvm {
        compilerOptions {
            // 目標層級的 JVM 編譯器選項，用作
            // 此目標中所有編譯的預設值
            noJdk.set(true)
        }
    }
}
```

整體專案配置現在有三個層級。最高的是擴充套件層級，然後是目標層級，最低的是編譯單元（通常是編譯任務）：

![Kotlin 編譯器選項層級](compiler-options-levels.svg){width=700}

較高層級的設定被用作較低層級的慣例（預設值）：

* 擴充套件編譯器選項的值是目標編譯器選項的預設值，包括共享來源集，如 `commonMain`、`nativeMain` 和 `commonTest`。
* 目標編譯器選項的值被用作編譯單元（任務）編譯器選項的預設值，例如 `compileKotlinJvm` 和 `compileTestKotlinJvm` 任務。

反之，在較低層級進行的配置會覆蓋較高層級的相關設定：

* 任務層級的編譯器選項會覆蓋目標或擴充套件層級的相關配置。
* 目標層級的編譯器選項會覆蓋擴充套件層級的相關配置。

配置專案時，請記住某些設定編譯器選項的舊方法已經 [被棄用](#deprecated-old-ways-of-defining-compiler-options)。

我們鼓勵您在多平台專案中嘗試新的 DSL 並在 [YouTrack](https://kotl.in/issue) 中留下回饋，因為我們計劃將此 DSL 作為配置編譯器選項的推薦方法。

### 新的 Compose 編譯器 Gradle 外掛程式

負責將 composables 轉換為 Kotlin 程式碼的 Jetpack Compose 編譯器現已合併到 Kotlin 存儲庫中。這將有助於將 Compose 專案遷移到 Kotlin 2.0.0，因為 Compose 編譯器將始終與 Kotlin 同步發佈。這也將 Compose 編譯器版本提升至 2.0.0。

要在您的專案中使用新的 Compose 編譯器，請在您的 `build.gradle(.kts)` 檔案中套用 `org.jetbrains.kotlin.plugin.compose` Gradle 外掛程式，並將其版本設定為等於 Kotlin 2.0.0。

要了解有關此變更的更多資訊並查看遷移說明，請參閱 [Compose 編譯器](https://kotlinlang.org/docs/multiplatform/compose-compiler.html) 文件。

### 區分 JVM 和 Android 發佈函式庫的新屬性

從 Kotlin 2.0.0 開始，[`org.gradle.jvm.environment`](https://docs.gradle.org/current/userguide/variant_attributes.html#sub:jvm_default_attributes) Gradle 屬性預設隨所有 Kotlin 變體一起發佈。

該屬性有助於區分 Kotlin 多平台函式庫的 JVM 和 Android 變體。它指出某個函式庫變體更適合某種 JVM 環境。目標環境可以是 "android"、"standard-jvm" 或 "no-jvm"。

發佈此屬性應能讓來自非多平台用戶端（如純 Java 專案）取用具有 JVM 和 Android 目標的 Kotlin 多平台函式庫時更加穩健。

如有必要，您可以停用屬性發佈。為此，請將以下 Gradle 選項加入您的 `gradle.properties` 檔案：

```none
kotlin.publishJvmEnvironmentAttribute=false
```

### 改進了 Kotlin/Native 中 CInteropProcess 的 Gradle 相依性處理

在此版本中，我們增強了對 `defFile` 屬性的處理，以確保 Kotlin/Native 專案中更好的 Gradle 任務相依性管理。

在本次更新之前，如果 `defFile` 屬性被指定為另一個尚未執行任務的輸出，則 Gradle 組建可能會失敗。解決此問題的方法是添加對該任務的相依性：

```kotlin
kotlin {
    macosArm64("native") {
        compilations.getByName("main") {
            cinterops {
                val cinterop by creating {
                    defFileProperty.set(createDefFileTask.flatMap { it.defFile.asFile })
                    project.tasks.named(interopProcessingTaskName).configure {
                        dependsOn(createDefFileTask)
                    }
                }
            }
        }
    }
}
```

為了解決這個問題，有一個名為 `definitionFile` 的新 `RegularFileProperty` 屬性。現在，Gradle 會在連接的任務於稍後的組建過程中執行後，延遲驗證 `definitionFile` 屬性的存在。這種新方法消除了對額外相依性的需求。

`CInteropProcess` 任務和 `CInteropSettings` 類別使用 `definitionFile` 屬性，而不是 `defFile` 和 `defFileProperty`：

<tabs group ="build-script">
<tab id="kotlin" title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    macosArm64("native") {
        compilations.getByName("main") {
            cinterops {
                val cinterop by creating {
                    definitionFile.set(project.file("def-file.def"))
                }
            }
        }
    }
}
```

</tab>
<tab id="groovy" title="Groovy" group-key="groovy">

```groovy
kotlin {
    macosArm64("native") {
        compilations.main {
            cinterops {
                cinterop {
                    definitionFile.set(project.file("def-file.def"))
                }
            }
        }
    }
}
```

</tab>
</tabs>

> `defFile` 和 `defFileProperty` 參數已棄用。
>
{style="warning"}

### Gradle 中的可見性變更

> 此變更僅影響 Kotlin DSL 使用者。
>
{style="note"}

在 Kotlin 2.0.0 中，我們修改了 Kotlin Gradle 外掛程式，以便在您的組建指令碼中實現更好的控制和安全性。先前，某些旨在用於特定 DSL 上下文的 Kotlin DSL 函式和屬性會無意中洩漏到其他 DSL 上下文中。這種洩漏可能導致使用錯誤的編譯器選項、重複套用設定以及其他錯誤配置：

```kotlin
kotlin {
    // 目標 DSL 無法存取在 
    // kotlin{} 擴充套件 DSL 中定義的方法和屬性
    jvm {
        // 編譯 DSL 無法存取在 
        // kotlin{} 擴充套件 DSL 和 Kotlin jvm{} 目標 DSL 中定義的方法和屬性
        compilations.configureEach {
            // 編譯任務 DSL 無法存取在 
            // kotlin{} 擴充套件、Kotlin jvm{} 
            // 目標或 Kotlin 編譯 DSL 中定義的方法和屬性
            compileTaskProvider.configure {
                // 例如：
                explicitApi()
                // 錯誤，因為它是在 kotlin{} 擴充套件 DSL 中定義的
                mavenPublication {}
                // 錯誤，因為它是在 Kotlin jvm{} 目標 DSL 中定義的
                defaultSourceSet {}
                // 錯誤，因為它是在 Kotlin 編譯 DSL 中定義的
            }
        }
    }
}
```

為了解決這個問題，我們添加了 `@KotlinGradlePluginDsl` 註解，防止將 Kotlin Gradle 外掛程式 DSL 函式和屬性暴露給不打算使其可用的層級。以下各層級現已相互分離：

* Kotlin 擴充套件
* Kotlin 目標
* Kotlin 編譯
* Kotlin 編譯任務

對於最常見的情況，如果您的組建指令碼配置不正確，我們添加了編譯器警告以及有關如何修復它們的建議。例如：

```kotlin
kotlin {
    jvm {
        sourceSets.getByName("jvmMain").dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core-jvm:1.7.3")
        }
    }
}
```

在這種情況下，`sourceSets` 的警告訊息是：

```none
[DEPRECATION] 'sourceSets: NamedDomainObjectContainer<KotlinSourceSet>' is deprecated. Accessing 'sourceSets' container on the Kotlin target level DSL is deprecated. Consider configuring 'sourceSets' on the Kotlin extension level.
```

我們非常感謝您對此變更的回饋！請直接在我們的 [#gradle Slack 頻道](https://kotlinlang.slack.com/archives/C19FD9681) 中向 Kotlin 開發人員分享您的評論。[獲取 Slack 邀請](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up)。

### Gradle 專案中用於 Kotlin 數據的新目錄

> 請勿將 `.kotlin` 目錄提交到版本控制系統。
> 例如，如果您使用的是 Git，請將 `.kotlin` 加入專案的 `.gitignore` 檔案中。
>
{style="warning"}

在 Kotlin 1.8.20 中，Kotlin Gradle 外掛程式切換為將其數據存儲在 Gradle 專案快取目錄中：`<project-root-directory>/.gradle/kotlin`。然而，`.gradle` 目錄僅預留給 Gradle 使用，因此這不是一個面向未來的做法。

為了解決這個問題，從 Kotlin 2.0.0 開始，我們將預設將 Kotlin 數據存儲在您的 `<project-root-directory>/.kotlin` 中。為了向後相容，我們將繼續在 `.gradle/kotlin` 目錄中存儲部分數據。

您可以配置的新 Gradle 屬性如下：

| Gradle 屬性                                         | 描述                                                                                                        |
|-----------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| `kotlin.project.persistent.dir`                     | 配置存儲專案級別數據的位置。預設值：`<project-root-directory>/.kotlin`       |
| `kotlin.project.persistent.dir.gradle.disableWrite` | 布林值，控制是否停用將 Kotlin 數據寫入 `.gradle` 目錄。預設值：`false` |

將這些屬性加入專案的 `gradle.properties` 檔案中以使其生效。

### 在需要時下載 Kotlin/Native 編譯器

在 Kotlin 2.0.0 之前，如果您在多平台專案的 Gradle 組建指令碼中配置了 [Kotlin/Native 目標](native-target-support.md)，Gradle 總是在 [配置階段 (configuration phase)](https://docs.gradle.org/current/userguide/build_lifecycle.html#sec:configuration) 下載 Kotlin/Native 編譯器。

即使沒有預定在 [執行階段 (execution phase)](https://docs.gradle.org/current/userguide/build_lifecycle.html#sec:execution) 執行的為 Kotlin/Native 目標編譯程式碼的任務，也會發生這種情況。以這種方式下載 Kotlin/Native 編譯器對於只想檢查其專案中 JVM 或 JavaScript 程式碼的使用者來說特別低效。例如，作為 CI 過程的一部分使用其 Kotlin 專案執行測試或檢查。

在 Kotlin 2.0.0 中，我們在 Kotlin Gradle 外掛程式中更改了此行為，以便在 [執行階段](https://docs.gradle.org/current/userguide/build_lifecycle.html#sec:execution) 且 **僅當** 請求為 Kotlin/Native 目標進行編譯時才下載 Kotlin/Native 編譯器。

反過來，Kotlin/Native 編譯器的相依性現在不再作為編譯器的一部分下載，而也是在執行階段下載。

如果您遇到新行為的任何問題，可以透過在 `gradle.properties` 檔案中加入以下 Gradle 屬性來暫時切換回先前的行為：

```none
kotlin.native.toolchain.enabled=false
```

從 Kotlin 1.9.20-Beta 開始，Kotlin/Native 發行版與 CDN 一起發佈到 [Maven Central](https://repo.maven.apache.org/maven2/org/jetbrains/kotlin/kotlin-native-prebuilt/)。

這使我們能夠更改 Kotlin 尋找和下載必要構件的方式。預設情況下，它現在使用您在專案的 `repositories {}` 區塊中指定的 Maven 存儲庫，而不是 CDN。

您可以透過在 `gradle.properties` 檔案中設定以下 Gradle 屬性來暫時切換回此行為：

```none
kotlin.native.distribution.downloadFromMaven=false
```

請向我們的問題追蹤器 [YouTrack](https://kotl.in/issue) 回報任何問題。這兩個更改預設行為的 Gradle 屬性都是暫時的，並將在未來的版本中移除。

### 棄用定義編譯器選項的舊方法

在此版本中，我們繼續完善您設定編譯器選項的方式。它應該能解決不同方法之間的歧義，並使專案配置更加直接。

自 Kotlin 2.0.0 起，以下用於指定編譯器選項的 DSL 已棄用：

* 來自實作所有 Kotlin 編譯任務的 `KotlinCompile` 介面的 `kotlinOptions` DSL。請改用 `KotlinCompilationTask<CompilerOptions>`。
* 來自 `KotlinCompilation` 介面的具有 `HasCompilerOptions` 型別的 `compilerOptions` 屬性。此 DSL 與其他 DSL 不一致，且配置了與 `KotlinCompilation.compileTaskProvider` 編譯任務內部的 `compilerOptions` 相同的 `KotlinCommonCompilerOptions` 物件，這令人困惑。

  相反，我們建議使用來自 Kotlin 編譯任務的 `compilerOptions` 屬性：

  ```kotlin
  kotlinCompilation.compileTaskProvider.configure {
      compilerOptions { ... }
  }
  ```

  例如：

  ```kotlin
  kotlin {
      js(IR) {
          compilations.all {
              compileTaskProvider.configure {
                  compilerOptions.freeCompilerArgs.add("-Xir-minimized-member-names=false")
              }
          }
      }
  }
  ```

* 來自 `KotlinCompilation` 介面的 `kotlinOptions` DSL。
* 來自 `KotlinNativeArtifactConfig` 介面、`KotlinNativeLink` 類別和 `KotlinNativeLinkArtifactTask` 類別的 `kotlinOptions` DSL。請改用 `toolOptions` DSL。
* 來自 `KotlinJsDce` 介面的 `dceOptions` DSL。請改用 `toolOptions` DSL。

有關如何在 Kotlin Gradle 外掛程式中指定編譯器選項的更多資訊，請參閱 [如何定義選項](gradle-compiler-options.md#how-to-define-options)。

### 提升了支援的最低 AGP 版本

從 Kotlin 2.0.0 開始，支援的 Android Gradle 外掛程式最低版本為 7.1.3。

### 用於嘗試最新語言版本的新 Gradle 屬性

在 Kotlin 2.0.0 之前，我們有以下 Gradle 屬性來試用新的 K2 編譯器：`kotlin.experimental.tryK2`。既然 K2 編譯器在 Kotlin 2.0.0 中預設啟用，我們決定將此屬性演進為一種新形式，您可以用它來嘗試專案中的最新語言版本：`kotlin.experimental.tryNext`。當您在 `gradle.properties` 檔案中使用此屬性時，Kotlin Gradle 外掛程式會將語言版本遞增為比您 Kotlin 版本的預設值高一級。例如，在 Kotlin 2.0.0 中，預設語言版本為 2.0，因此該屬性會配置語言版本 2.1。

這個新的 Gradle 屬性在 [組建報告](gradle-compilation-and-caches.md#build-reports) 中產生的指標與先前的 `kotlin.experimental.tryK2` 類似。配置的語言版本包含在輸出中。例如：

```none
##### 'kotlin.experimental.tryNext' results #####
:app:compileKotlin: 2.1 language version
:lib:compileKotlin: 2.1 language version
##### 100% (2/2) tasks have been compiled with Kotlin 2.1 #####
```

要了解更多有關如何啟用組建報告及其內容的資訊，請參閱 [組建報告](gradle-compilation-and-caches.md#build-reports)。

### 用於組建報告的新 JSON 輸出格式

在 Kotlin 1.7.0 中，我們引入了組建報告以協助追蹤編譯器效能。隨著時間的推移，我們添加了更多指標，使這些報告在調查效能問題時更加詳細且實用。先前，本機檔案的唯一輸出格式是 `*.txt` 格式。在 Kotlin 2.0.0 中，我們支援 JSON 輸出格式，以便使用其他工具更輕鬆地進行分析。

要為您的組建報告配置 JSON 輸出格式，請在 `gradle.properties` 檔案中宣告以下屬性：

```none
kotlin.build.report.output=json

// 存儲組建報告的目錄
kotlin.build.report.json.directory=my/directory/path
```

或者，您可以執行以下指令：

```shell
./gradlew assemble -Pkotlin.build.report.output=json -Pkotlin.build.report.json.directory="my/directory/path"
``` 

配置完成後，Gradle 會在您指定的目錄中產生組建報告，名稱格式為：`${project_name}-date-time-<sequence_number>.json`。

以下是 JSON 輸出格式組建報告中的範例片段，包含組建指標和聚合指標：

```json
"buildOperationRecord": [
    {
     "path": ":lib:compileKotlin",
      "classFqName": "org.jetbrains.kotlin.gradle.tasks.KotlinCompile_Decorated",
      "startTimeMs": 1714730820601,
      "totalTimeMs": 2724,
      "buildMetrics": {
        "buildTimes": {
          "buildTimesNs": {
            "CLEAR_OUTPUT": 713417,
            "SHRINK_AND_SAVE_CURRENT_CLASSPATH_SNAPSHOT_AFTER_COMPILATION": 19699333,
            "IR_TRANSLATION": 281000000,
            "NON_INCREMENTAL_LOAD_CURRENT_CLASSPATH_SNAPSHOT": 14088042,
            "CALCULATE_OUTPUT_SIZE": 1301500,
            "GRADLE_TASK": 2724000000,
            "COMPILER_INITIALIZATION": 263000000,
            "IR_GENERATION": 74000000,
...
          }
        }
...
 "aggregatedMetrics": {
    "buildTimes": {
      "buildTimesNs": {
        "CLEAR_OUTPUT": 782667,
        "SHRINK_AND_SAVE_CURRENT_CLASSPATH_SNAPSHOT_AFTER_COMPILATION": 22031833,
        "IR_TRANSLATION": 333000000,
        "NON_INCREMENTAL_LOAD_CURRENT_CLASSPATH_SNAPSHOT": 14890292,
        "CALCULATE_OUTPUT_SIZE": 2370750,
        "GRADLE_TASK": 3234000000,
        "COMPILER_INITIALIZATION": 292000000,
        "IR_GENERATION": 89000000,
...
      }
    }
```

### kapt 組態從超組態繼承註解處理器

在 Kotlin 2.0.0 之前，如果您想在單獨的 Gradle 組態中定義一組通用的註解處理器，並在子專案的 kapt 特定組態中擴充此組態，kapt 會跳過註解處理，因為它找不到任何註解處理器。在 Kotlin 2.0.0 中，kapt 可以成功偵測到對您的註解處理器存在間接相依性。

例如，對於使用 [Dagger](https://dagger.dev/) 的子專案，在您的 `build.gradle(.kts)` 檔案中，使用以下組態：

```kotlin
val commonAnnotationProcessors by configurations.creating
configurations.named("kapt") { extendsFrom(commonAnnotationProcessors) }

dependencies {
    implementation("com.google.dagger:dagger:2.48.1")
    commonAnnotationProcessors("com.google.dagger:dagger-compiler:2.48.1")
}
```

在此範例中，`commonAnnotationProcessors` Gradle 組態是您希望用於所有專案的通用註解處理組態。您使用 [`extendsFrom()`](https://docs.gradle.org/current/dsl/org.gradle.api.artifacts.Configuration.html#org.gradle.api.artifacts.Configuration:extendsFrom) 方法將 `commonAnnotationProcessors` 添加為超組態 (superconfiguration)。kapt 看到 `commonAnnotationProcessors` Gradle 組態對 Dagger 註解處理器有相依性。因此，kapt 在其註解處理組態中包含了 Dagger 註解處理器。

感謝 Christoph Loy 的 [實作](https://github.com/JetBrains/kotlin/pull/5198)！

### Kotlin Gradle 外掛程式不再使用已棄用的 Gradle 慣例

在 Kotlin 2.0.0 之前，如果您使用 Gradle 8.2 或更高版本，Kotlin Gradle 外掛程式會錯誤地使用在 Gradle 8.2 中已棄用的 Gradle 慣例。這導致 Gradle 回報組建棄用警告。在 Kotlin 2.0.0 中，Kotlin Gradle 外掛程式已更新，當您使用 Gradle 8.2 或更高版本時，不再觸發這些棄用警告。

## 標準函式庫

此版本為 Kotlin 標準函式庫帶來了進一步的穩定性，並使更多現有函式在所有平台上通用：

* [列舉類別 values 泛型函式的穩定替代方案](#stable-replacement-of-the-enum-class-values-generic-function)
* [穩定的 AutoCloseable 介面](#stable-autocloseable-interface)
* [通用的 protected 屬性 AbstractMutableList.modCount](#common-protected-property-abstractmutablelist-modcount)
* [通用的 protected 函式 AbstractMutableList.removeRange](#common-protected-function-abstractmutablelist-removerange)
* [通用的 String.toCharArray(destination)](#common-string-tochararray-destination-function)

### 列舉類別 values 泛型函式的穩定替代方案

在 Kotlin 2.0.0 中，`enumEntries<T>()` 函式成為 [穩定版 (Stable)](components-stability.md#stability-levels-explained)。`enumEntries<T>()` 函式是泛型 `enumValues<T>()` 函式的替代品。新函式會傳回給定列舉型別 `T` 的所有列舉成員清單。列舉類別的 `entries` 屬性先前已引入並穩定，用以取代合成的 `values()` 函式。有關 entries 屬性的更多資訊，請參閱 [Kotlin 1.8.20 的新功能](whatsnew1820.md#a-modern-and-performant-replacement-of-the-enum-class-values-function)。

> `enumValues<T>()` 函式仍然受支援，但我們建議您改用 `enumEntries<T>()` 函式，因為它的效能影響較小。每次呼叫 `enumValues<T>()` 時都會建立一個新陣列，而每次呼叫 `enumEntries<T>()` 時都會傳回相同的清單，這要高效得多。
>
{style="tip"}

例如：

```kotlin
enum class RGB { RED, GREEN, BLUE }

inline fun <reified T : Enum<T>> printAllValues() {
    print(enumEntries<T>().joinToString { it.name })
}

printAllValues<RGB>()
// RED, GREEN, BLUE
```

### 穩定的 AutoCloseable 介面

在 Kotlin 2.0.0 中，通用的 [`AutoCloseable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-auto-closeable/) 介面進入 [穩定版 (Stable)](components-stability.md#stability-levels-explained)。它允許您輕鬆關閉資源，並包含幾個實用的函式：

* `use()` 擴充函式，它在選定的資源上執行給定的區塊函式，然後無論是否拋出例外都會正確關閉資源。
* `AutoCloseable()` 建構函式，它會建立 `AutoCloseable` 介面的執行個體。

在下面的範例中，我們定義了 `XMLWriter` 介面，並假設有一個實作它的資源。例如，這個資源可以是一個開啟檔案、寫入 XML 內容然後關閉它的類別：

```kotlin
interface XMLWriter {
    fun document(encoding: String, version: String, content: XMLWriter.() -> Unit)
    fun element(name: String, content: XMLWriter.() -> Unit)
    fun attribute(name: String, value: String)
    fun text(value: String)

    fun flushAndClose()
}

fun writeBooksTo(writer: XMLWriter) {
    val autoCloseable = AutoCloseable { writer.flushAndClose() }
    autoCloseable.use {
        writer.document(encoding = "UTF-8", version = "1.0") {
            element("bookstore") {
                element("book") {
                    attribute("category", "fiction")
                    element("title") { text("Harry Potter and the Prisoner of Azkaban") }
                    element("author") { text("J. K. Rowling") }
                    element("year") { text("1999") }
                    element("price") { text("29.99") }
                }
                element("book") {
                    attribute("category", "programming")
                    element("title") { text("Kotlin in Action") }
                    element("author") { text("Dmitry Jemerov") }
                    element("author") { text("Svetlana Isakova") }
                    element("year") { text("2017") }
                    element("price") { text("25.19") }
                }
            }
        }
    }
}
```

### 通用的 protected 屬性 AbstractMutableList.modCount

在此版本中，`AbstractMutableList` 介面的 [`modCount`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-mutable-list/mod-count.html) `protected` 屬性成為通用屬性。先前，`modCount` 屬性在各個平台上可用，但不可用於通用目標。現在，您可以建立 `AbstractMutableList` 的自訂實作並在通用程式碼中存取該屬性。

該屬性會追蹤對集合進行結構化修改的次數。這包括更改集合大小或以可能導致正在進行的反覆運算傳回不正確結果的方式更改清單的操作。

在實作自訂清單時，您可以使用 `modCount` 屬性來註冊和偵測並行修改。

### 通用的 protected 函式 AbstractMutableList.removeRange

在此版本中，`AbstractMutableList` 介面的 [`removeRange()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-abstract-mutable-list/remove-range.html) `protected` 函式成為通用函式。先前，它在各個平台上可用，但不可用於通用目標。現在，您可以建立 `AbstractMutableList` 的自訂實作並在通用程式碼中覆寫該函式。

該函式會按照指定的範圍從此清單中移除元素。透過覆寫此函式，您可以利用自訂實作並改進清單操作的效能。

### 通用的 String.toCharArray(destination) 函式

此版本引入了通用的 [`String.toCharArray(destination)`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-char-array.html) 函式。先前，它僅在 JVM 上可用。

讓我們將其與現有的 [`String.toCharArray()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/to-char-array.html) 函式進行比較。後者會建立一個包含指定字串中字元的新 `CharArray`。然而，新的通用 `String.toCharArray(destination)` 函式會將 `String` 字元移入現有的目標 `CharArray` 中。如果您已經有一個想要填滿的緩衝區，這會非常有用：

```kotlin
fun main() {
    val myString = "Kotlin is awesome!"
    val destinationArray = CharArray(myString.length)

    // 轉換字串並將其存儲在 destinationArray 中：
    myString.toCharArray(destinationArray)

    for (char in destinationArray) {
        print("$char ")
        // K o t l i n   i s   a w e s o m e ! 
    }
}
```
{kotlin-runnable="true"}

## 安裝 Kotlin 2.0.0

從 IntelliJ IDEA 2023.3 和 Android Studio Iguana (2023.2.1) Canary 15 開始，Kotlin 外掛程式作為隨附外掛程式散佈在您的 IDE 中。這意味著您無法再從 JetBrains Marketplace 安裝該外掛程式。

要更新到新的 Kotlin 版本，請在您的組建指令碼中將 [Kotlin 版本更改](releases.md#update-to-a-new-kotlin-version) 為 2.0.0。