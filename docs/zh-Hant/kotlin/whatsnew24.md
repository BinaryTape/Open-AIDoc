[//]: # (title: Kotlin 2.4.0 的新功能)

<show-structure depth="1"/>

<web-summary>閱讀 Kotlin 2.4.0 版本說明，涵蓋新語言特性、Kotlin Multiplatform、JVM、Native、JS 和 Wasm 的更新，以及 Gradle 和 Maven 的建置工具支援。</web-summary>

<tldr>
    <p>有關錯誤修正版本 2.4.10 的詳細資訊，請參閱 <a href="https://github.com/JetBrains/kotlin/releases/tag/v2.4.10">變更日誌</a></p>
</tldr>

Kotlin 2.4.0 正式發佈！以下是主要的亮點：

* **語言：** [上下文參數、明確支援欄位趨於穩定，以及多項註解使用位址目標特性](#stable-features)
* **標準函式庫：** [穩定支援 UUID API](#stable-uuid-api-in-the-common-kotlin-standard-library) 以及 [支援檢查排序順序](#support-for-checking-sorted-order)
* **Kotlin/JVM：** [支援 Java 26](#support-for-java-26) 並 [預設啟用元資料中的註解](#annotations-in-metadata-enabled-by-default)
* **Kotlin/Native：** [支援 Swift 套件作為相依性、Swift 匯出更新，以及預設啟用 CMS GC](#kotlin-native)
* **Kotlin/Wasm：** [預設啟用累加編譯並支援 WebAssembly 元件模型](#kotlin-wasm)
* **Kotlin/JS**：[支援匯出值類別，以及在 JS 程式碼內嵌中使用 ES2015 特性](#kotlin-js)
* **Gradle：** [相容於 Gradle 9.5.0](#gradle)
* **Maven：** [Java 與 JVM 目標版本自動對齊](#maven)
* **Kotlin 編譯器：** [在 `.klib` 編譯期間內嵌函式的行為更加一致](#consistent-intra-module-function-inlining-during-klib-compilation)

> 有關 Kotlin 發佈週期的資訊，請參閱 [Kotlin 發佈流程](releases.md)。
>
{style="tip"}

## 更新至 Kotlin 2.4.0

最新版本的 Kotlin 已包含在最新版本的 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 和 [Android Studio](https://developer.android.com/studio) 中。

若要更新到新的 Kotlin 版本，請確保您的 IDE 已更新至最新版本，並在您的建置指令碼中將 [Kotlin 版本更改](releases.md#update-to-a-new-kotlin-version)為 2.4.0。

## 新特性 {id=new-stable-features}
<primary-label ref="stable"/>

在之前的 Kotlin 版本中，有幾項新特性是以實驗性 (Experimental) 身份引入的。以下特性現在在 Kotlin 2.4.0 中已晉升為 [Stable (穩定)](components-stability.md#stability-levels-explained)，因此您不再需要選擇性加入 (opt-in) 即可使用它們：

* [上下文參數 (Context parameters)](context-parameters.md)，除了 [上下文引數](#explicit-context-arguments-for-context-parameters) 和 [可呼叫參照](https://github.com/Kotlin/KEEP/blob/context-parameters/proposals/context-parameters.md#callable-references)
* [屬性的 `@all` 元目標](annotations.md#all-meta-target)
* [使用位址註解目標的新預設規則](annotations.md#defaults-when-no-use-site-targets-are-specified)
* [明確支援欄位](properties.md#explicit-backing-fields)
* [通用 Kotlin 標準函式庫中穩定的 UUID API](#stable-uuid-api-in-the-common-kotlin-standard-library)
* [在 JVM 上將無號整數轉換為 `BigInteger` 的新 API](#new-api-for-converting-unsigned-integers-to-biginteger-on-the-jvm)
* [支援檢查排序順序](#support-for-checking-sorted-order)
* [支援將值類別 (value class) 匯出至 JavaScript/TypeScript](#support-for-value-class-export-to-javascript-typescript)
* [內嵌 JS 程式碼時支援 ES2015 特性](#support-for-es2015-features-when-inlining-js-code)
* [Maven：Java 與 JVM 目標版本自動對齊](#automatic-alignment-between-java-and-jvm-target-versions)
* [支援 Maven Toolchains](#support-for-maven-toolchains)

## 新特性 {id=new-experimental-features}
<primary-label ref="experimental-exp"/>

* [上下文參數的明確上下文引數](#explicit-context-arguments-for-context-parameters)
* [支援集合常值 (collection literals)](#support-for-collection-literals)
* [改進的編譯期常數](#improved-compile-time-constants)
* [改進的高階函式未使用結果檢查](#improved-unused-result-checks-for-higher-order-functions) 
* [新的 `@IntroducedAt` 註解，用於為選用參數產生基於版本的多載](#new-introducedat-annotation-to-generate-version-based-overloads-for-optional-parameters)
* [新的 Map 備援函式，用以區分 `null` 值與缺失的鍵](#new-map-fallback-functions-to-distinguish-null-values-and-missing-keys)
* [Swift 套件匯入](#swift-package-import)
* [Swift 匯出進入 Alpha 階段，並改進了並行支援](#swift-export-goes-alpha-with-improved-concurrency-support)
* [支援 WebAssembly 元件模型 (WebAssembly Component Model)](#support-for-the-webassembly-component-model)

## 語言

Kotlin 2.4.0 將上下文參數、明確支援欄位和註解使用位址目標等特性晉升為 [Stable](components-stability.md#stability-levels-explained)。此版本還引入了 [上下文參數的明確上下文引數](#explicit-context-arguments-for-context-parameters)。

### 穩定特性
<secondary-label ref="language"/>

Kotlin 2.2.0 和 2.3.0 以 [Experimental](components-stability.md#stability-levels-explained) 身份引入了幾項語言特性。我們很高興地宣佈，以下語言特性在此版本中已達到 [Stable](components-stability.md#stability-levels-explained)：

* [上下文參數](whatsnew22.md#preview-of-context-parameters)，除了 [上下文引數](#explicit-context-arguments-for-context-parameters) 和 [可呼叫參照](https://github.com/Kotlin/KEEP/blob/context-parameters/proposals/context-parameters.md#callable-references)
* [屬性的 `@all` 元目標](annotations.md#all-meta-target)
* [使用位址註解目標的新預設規則](annotations.md#defaults-when-no-use-site-targets-are-specified)
* [明確支援欄位](properties.md#explicit-backing-fields)

[查看 Kotlin 語言設計特性與提案的完整清單](kotlin-language-features-and-proposals.md)。

### 匯入指令最後一段不再出現棄用警告
<secondary-label ref="language"/>

在之前的 Kotlin 版本中，當匯入一個已棄用的類別時，棄用錯誤會在呼叫點以及匯入指令本身報告。由於無法在匯入時停用棄用錯誤，您可能透過停用整個檔案的棄用報告或使用星號匯入來解決此問題。

由於在大多數情況下，對所調用符號的匯入報告棄用並無用處，Kotlin 2.4.0 在匯入指令最後一段引用已棄用符號時不再發出警告。

更多資訊請參閱 [KT-30155](https://youtrack.jetbrains.com/issue/KT-30155)。

### 上下文參數的明確上下文引數
<primary-label ref="experimental-opt-in"/>

<secondary-label ref="language"/>

> 在 IntelliJ IDEA 中使用上下文參數明確上下文引數的支援將於 2026.2 提供。
> 
{style="note"}

Kotlin 2.4.0 為 [上下文參數](context-parameters.md) 引入了明確上下文引數。

Kotlin 2.3.20 [更改了上下文參數的多載解析](whatsnew2320.md#changes-to-overload-resolution-for-context-parameters)。因此，僅在上下文參數上有所不同的多載呼叫可能會變得模糊。

您現在可以透過在呼叫點傳遞明確的上下文引數來解決此模糊性。

範例如下：

```kotlin
class EmailSender
class SmsSender

context(emailSender: EmailSender)
fun sendNotification() {
    println("Sent email notification")
}

context(smsSender: SmsSender)
fun sendNotification() {
    println("Sent SMS notification")
}

context(defaultEmailSender: EmailSender, defaultSmsSender: SmsSender)
fun notifyUser() {
    
    // 選擇具有 EmailSender 上下文參數的多載
    sendNotification(emailSender = defaultEmailSender)

    // 選擇具有 SmsSender 上下文參數的多載
    sendNotification(smsSender = defaultSmsSender)
}
```

您也可以使用明確上下文引數來代替 `context()` 函式，以減少嵌套並使某些呼叫更易於閱讀。如果您需要在多個呼叫中使用相同的上下文引數，請改用 `context()` 函式。

此特性為 [Experimental](components-stability.md#stability-levels-explained)。若要選擇性加入，請在您的建置檔案中加入以下編譯器選項：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xexplicit-context-arguments")
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
                    <arg>-Xexplicit-context-arguments</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

更多資訊請參閱該特性的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0448-explicit-context-arguments.md)。

### 支援集合常值 (collection literals)
<primary-label ref="experimental-opt-in"/>

<secondary-label ref="language"/>

Kotlin 2.4.0 引入了對集合常值的實驗性支援。您現在可以使用方括號 `[]` 以更簡單、更簡潔的方式建立集合。

例如：

```kotlin
fun main() {
    // 具有明確類型宣告的可變清單
    // val shapes: MutableList<String> = mutableListOf("triangle", "square", "circle")

    // 使用方括號語法的可變清單
    val shapes: MutableList<String> = ["triangle", "square", "circle"]
    println(shapes)
    // [triangle, square, circle]
}
```
{validate="false"}

> 目前，集合常值無法用於建構在 Java 中定義的集合。更多資訊請參閱 [KT-80494](https://youtrack.jetbrains.com/issue/KT-80494)。
>
{style="note"}

如果編譯器沒有足夠的資訊來推論集合類型，它會預設為 `List` 類型：

```kotlin
fun main() {
    val fruit = ["apple", "banana", "cherry"]
    
    println(fruit)
    // [apple, banana, cherry]
}
```
{validate="false"}

您也可以宣告自訂的 `operator fun of` 函式，以便對您自己的類型使用方括號語法。例如，如果您有以下 `DoubleMatrix` 類別：

```kotlin
class DoubleMatrix(vararg val rows: Row) {
    companion object {
        operator fun of(vararg rows: Row) = DoubleMatrix(*rows)
    }
    class Row(vararg val elements: Double) {
        companion object {
            operator fun of(vararg elements: Double) = Row(*elements)
        }
    }
}
```
{validate="false"}

您可以像這樣建立一個 `identityMatrix` 類別執行個體：

```kotlin
fun main() {
    val identityMatrix: DoubleMatrix = [
        [1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 0.0, 1.0],
    ]
}
```
{validate="false"}

在此範例中，編譯器將嵌套的集合常值轉換為對相應 `operator fun of` 函式的呼叫。編譯器遞迴地解析這些呼叫，並使用預期類型來選擇正確的多載。

此特性為 [Experimental](components-stability.md#stability-levels-explained)。若要選擇性加入，請在您的建置檔案中加入以下編譯器選項：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xcollection-literals")
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
                    <arg>-Xcollection-literals</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

更多資訊請參閱該特性的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0416-collection-literals.md)。

### 改進的編譯期常數
<primary-label ref="experimental-opt-in"/>

<secondary-label ref="language"/>

Kotlin 2.4.0 對 [編譯期常數](properties.md#compile-time-constants) 帶來了實驗性改進，使數值和字串類型的支援更加一致且易於使用。這些改進包括支援：

* 無號類型運算。
* 字串的標準函式庫函式，如 `.lowercase()`、`.uppercase()` 和 `.trim()` 函式。
* 對 [列舉常數](enum-classes.md#working-with-enum-constants) 的 `.name` 屬性和 [`KCallable` 介面](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-callable/) 的評估。

為了明確哪些函式是在編譯期評估的，Kotlin 2.4.0 引入了 `IntrinsicConstEvaluation` 註解。有些函式是在編譯期評估的，但尚未加入該註解。以後的版本會將該註解加入剩餘的函式中。如需受支援函式的清單，請參閱 KEEP [附錄](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0444-improve-compile-time-constants.md#appendix)。

此特性為 [Experimental](components-stability.md#stability-levels-explained)。若要選擇性加入，請在您的建置檔案中加入以下編譯器選項：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xintrinsic-const-evaluation")
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
                    <arg>-Xintrinsic-const-evaluation</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

</tab>
</tabs>

更多資訊請參閱該特性的 [KEEP](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0444-improve-compile-time-constants.md)。

### 改進的高階函式未使用結果檢查
<primary-label ref="experimental-opt-in"/>

<secondary-label ref="language"/>

Kotlin 2.4.0 引入了一種新的實驗性 `returnsResultOf()` 合約，以改進 [未使用傳回值檢查器](unused-return-value-checker.md)。

此合約使檢查器能夠區分可以忽略的未使用結果與來自傳回 Lambda 結果的高階函式（例如 `let` 作用域函式）的有意義未使用結果。

> Kotlin 合約是 [Experimental](components-stability.md#stability-levels-explained) 的。若要選擇性加入，請在宣告帶有合約的函式時加入 `@OptIn(ExperimentalContracts::class)` 註解。
>
{style="warning"}

若要使用此特性，請將 `returnsResultOf()` 加入函式的合約中：

```kotlin
import kotlin.contracts.ExperimentalContracts
import kotlin.contracts.contract

@OptIn(ExperimentalContracts::class)
inline fun <T, R> T.customLet(block: (T) -> R): R {
    contract {
        returnsResultOf(block)
    }
    return block(this)
}
```

以下是將自訂 `.customLet()` 函式用於可為 null 值的範例：

```kotlin
fun handleNullablePackageName(packageName: String?, builder: StringBuilder) {
    // 檢查器不會報告警告
    // 因為 append() 函式的傳回值可以忽略
    packageName?.customLet { builder.append(it) }

    // 檢查器報告警告，因為傳回的字串未被使用
    packageName?.customLet { "kotlin.$it" }
}
```

未使用傳回值檢查器是 [Experimental](components-stability.md#stability-levels-explained) 的，且必須啟用才能報告未使用的傳回值。
有關啟用和配置檢查器的更多資訊，請參閱 [未使用傳回值檢查器](unused-return-value-checker.md#configure-the-unused-return-value-checker)。

#### 如何啟用 {id=how-to-enable-unused-return-value-checker}

`returnsResultOf()` 合約是 [Experimental](components-stability.md#stability-levels-explained) 的。請注意，使用它會產生早期版本的 Kotlin 編譯器無法讀取的預發佈二進制檔案。若要選擇性加入，請在您的建置檔案中加入以下編譯器選項：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
// build.gradle(.kts)
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xallow-returns-result-of")
    }
}
```

</tab> <tab title="Maven" group-key="maven">

```xml
<!-- pom.xml -->
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <configuration>
                <args>
                    <arg>-Xallow-returns-result-of</arg>
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```
</tab> 
</tabs>

### 新的 `@IntroducedAt` 註解，用於為選用參數產生基於版本的多載
<primary-label ref="experimental-opt-in"/>

<secondary-label ref="language"/>

Kotlin 2.4.0 引入了 `@IntroducedAt` 註解，用於在向已發佈的 API 加入新的選用參數時保持二進制相容性。

以前，向函式加入選用參數通常需要使用 `@JvmOverloads`，這可能會產生超出需求的多載。或者，為了保持二進制相容性，您需要將舊簽章保留為隱藏的棄用多載。

透過 `@IntroducedAt` 註解，您可以使用新加入的選用參數被引入的版本對其進行標註。編譯器利用此資訊自動產生對應的隱藏多載。

此註解為 [Experimental](components-stability.md#stability-levels-explained)。若要選擇性加入，請使用 `@OptIn(ExperimentalVersionOverloading::class)` 註解。

範例如下：

```kotlin
@OptIn(ExperimentalVersionOverloading::class)
fun Button(
    label: String = "",
    color: Color = DefaultColor,
    @IntroducedAt("1.1") borderColor: Color = DefaultBorderColor,
    @IntroducedAt("1.2") borderStyle: Style = DefaultBorderStyle,
    @IntroducedAt("1.2") borderWidth: Int = 1,
    onClick: () -> Unit
) {
    // 函式主體
}
```

在此範例中，編譯器為舊版本的 `Button()` 函式產生隱藏的多載。

由於 `@IntroducedAt` 和 `@JvmOverloads` 都會產生多載，同時使用它們可能會導致多載衝突。如果您同時使用這兩個註解，編譯器會報告警告。如果您忽略該警告，編譯器將優先考慮從 `@IntroducedAt` 註解產生的多載。

## 標準函式庫

Kotlin 2.4.0 穩定了通用 Kotlin 標準函式庫對 UUID 的支援。它還加入了新的擴充函式，用於在 JVM 上將無號整數轉換為 `BigInteger`，以及支援檢查排序順序。

### 通用 Kotlin 標準函式庫中穩定的 UUID API
<secondary-label ref="standard-library"/>

Kotlin 2.0.20 引入了一個 [用於產生 UUID 的類別](whatsnew2020.md#support-for-uuids-in-the-common-kotlin-standard-library)（通用唯一識別碼），並加入了 Kotlin 與 Java UUID 之間轉換的支援。後續版本逐漸改進了這項實驗性特性，加入了對以下內容的支援：

* [使用 `<` 和 `>` 運算子比較 UUID](whatsnew2120.md#changes-in-uuid-parsing-formatting-and-comparability)
* [從十六進制加連字號以及純文字格式剖析 UUID](uuids.md#parse-uuids)
* [在剖析無效 UUID 時傳回 `null`](whatsnew23.md#support-for-returning-null-when-parsing-invalid-uuids)。

在 Kotlin 2.4.0 中，[`kotlin.uuid.Uuid` API](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.uuid/-uuid/) 成為 [Stable](components-stability.md#stability-levels-explained)。唯一的例外是 [用於產生 V4 和 V7 UUID 的函式](whatsnew23.md#support-for-generating-v7-uuids-for-specific-timestamps)，它們仍保持 [Experimental](components-stability.md#stability-levels-explained) 並仍需選擇性加入。

有關如何使用 UUID 的更多資訊，請參閱 [UUID](uuids.md)。

### 支援檢查排序順序
<secondary-label ref="standard-library"/>

Kotlin 2.4.0 為可迭代對象、陣列和序列加入了新的擴充函式，用於檢查排序順序。

這包括以下擴充函式：

* `.isSorted()`
* `.isSortedDescending()`
* `.isSortedWith(comparator)`
* `.isSortedBy(selector)`
* `.isSortedByDescending(selector)`

您可以使用這些擴充函式來檢查元素是否已經排序，而無需再次排序它們或建立自己的輔助函式。如果元素按指定順序排列，或者元素少於兩個，則傳回 `true`；否則傳回 `false`。這些函式在遇到無序配對時會立即停止，這使得它們對於大型輸入非常有效。

以下是使用 `.isSorted()` 和 `.isSortedBy()` 函式檢查排序順序的範例：

```kotlin
data class User(val name: String, val age: Int)

fun main() {
    val numbers = listOf(1, 2, 3, 4)
    println(numbers.isSorted())
    // true

    val users = listOf(
        User("Alice", 24),
        User("Bob", 31),
        User("Charlie", 29),
    )
    println(users.isSortedBy(User::age))
    // false
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.0-Beta2" id="kotlin-2-4-0-check-sorted-order"}

### 在 JVM 上將無號整數轉換為 `BigInteger` 的新 API
<secondary-label ref="standard-library"/>

Kotlin 2.4.0 在 JVM 上引入了 `UInt.toBigInteger()` 和 `ULong.toBigInteger()` 擴充函式。

以前，將 `UInt` 和 `ULong` 值轉換為 `BigInteger` 需要基於字串的解決方案或自訂轉換邏輯。從 Kotlin 2.4.0 開始，您現在可以直接使用 `.toBigInteger()` 將無號整數值轉換為 `BigInteger`。

範例如下：

```kotlin
fun main() {
    //sampleStart
    val unsignedLong = Long.MAX_VALUE.toULong() + 1uL
    val unsignedInt = UInt.MAX_VALUE

    println(unsignedLong.toBigInteger())
    // 9223372036854775808

    println(unsignedInt.toBigInteger())
    // 4294967295
   //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.0-Beta2" id="kotlin-2-4-0-convert-unsigned-int"}

### 新的 Map 備援函式，用以區分 `null` 值與缺失的鍵
<primary-label ref="experimental-opt-in"/>

<secondary-label ref="standard-library"/>

Kotlin 2.4.0 為具有可為 null 值的 Map 加入了現有 [`.getOrElse()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/get-or-else.html) 和 [`.getOrPut()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/get-or-put.html) [Map 擴充函式](map-operations.md) 的新變體。這些函式檢索鍵的值或使用預設值作為備援。對於具有可為 null 值的 Map，新變體讓您可以選擇存儲的 `null` 值是像缺失的鍵一樣表現，還是像現有的值一樣表現，並在函式名稱中明確了該選擇。

新的擴充函式包括以下內容：

* `.getOrElseIfNull(key, defaultValue)` 和 `.getOrPutIfNull(key, defaultValue)`，如果鍵缺失或值為 `null`，則傳回預設值，這與現有的 `.getOrElse()` 和 `.getOrPut()` 函式類似。
* `.getOrElseIfMissing(key, defaultValue)` 和 `.getOrPutIfMissing(key, defaultValue)`，僅當 Map 不包含指定鍵時才傳回預設值。

這些 API 為 [Experimental](components-stability.md#stability-levels-explained)，且需要使用 `@OptIn(ExperimentalStdlibApi::class)` 註解選擇性加入。

以下範例示範了當鍵存在且值為 `null` 時，`.getOrPutIfNull()` 和 `.getOrPutIfMissing()` 之間的區別：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val mapForNull = mutableMapOf<String, String?>("user" to null)
    val mapForMissing = mutableMapOf<String, String?>("user" to null)

    // 如果 "user" 的值為 null，則替換該值
    mapForNull.getOrPutIfNull("user") { "default_user" }

    println(mapForNull)
    // {user=default_user}

    // 保留 null 值，因為 "user" 在 Map 中存在
    mapForMissing.getOrPutIfMissing("user") { "default_user" }

    println(mapForMissing)
    // {user=null}
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.0" id="kotlin-2-4-0-getorput-diff"}

您也可以將 `.getOrElseIfMissing()` 和 `.getOrPutIfMissing()` 函式用於存儲可為 null 值的快取。如果 `defaultValue` 傳回 `null`，則 Map 會存儲它，並且不會為同一個鍵再次呼叫 `defaultValue`。

範例如下：

```kotlin
data class Response(val body: String)

class Service {
    var queryCount = 0

    fun query(key: String): Response? {
        queryCount += 1
        return null
    }
}

//sampleStart
@OptIn(ExperimentalStdlibApi::class)
fun main() {
    val service = Service()
    val cache = mutableMapOf<String, Response?>()

    fun getCachedResponseOrQuery(key: String): Response? =
        cache.getOrPutIfMissing(key) { service.query(key) }

    // 因為快取不包含 "user"，所以存儲 null
    getCachedResponseOrQuery("user")

    println(cache)
    // {user=null}

    // 使用快取的 null，不再查詢服務
    getCachedResponseOrQuery("user")

    println(service.queryCount)
    // 1
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.0" id="kotlin-2-4-0-getorif-missing"}

我們歡迎您在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-67337) 中提供回饋。

## Kotlin/JVM

Kotlin 2.4.0 支援新的 Java 版本，並預設啟用元資料中的註解。

### 支援 Java 26
<secondary-label ref="jvm"/>

從 Kotlin 2.4.0 開始，編譯器可以產生包含 Java 26 位元組碼的類別。

### 預設啟用元資料中的註解
<secondary-label ref="jvm"/>

Kotlin 2.2.0 中的 Kotlin Metadata JVM 程式庫 [引入了讀取 Kotlin 元資料中存儲的註解的支援](whatsnew22.md#support-for-reading-and-writing-annotations-in-kotlin-metadata)。憑藉這項支援，Kotlin 編譯器將註解與 JVM 位元組碼一起寫入元資料中，使 Kotlin Metadata JVM 程式庫可以存取它們。因此，註解處理器和其他工具可以在元資料層級理解和操作這些註解，而無需使用反射或修改原始碼。

在 Kotlin 2.4.0 中，這項支援已預設啟用。

## Kotlin/Native

從 Kotlin 2.4.0 開始，[Swift 匯出已晉升為 Alpha](#swift-export-goes-alpha-with-improved-concurrency-support)。此版本還帶來了對 [Swift 套件匯入](#swift-package-import) 的支援、Xcode 26.4、記憶體消耗的改進以及垃圾收集。

### 垃圾收集器中預設的並行標記
<secondary-label ref="native"/>

在 Kotlin 2.0.20 中，Kotlin 團隊 [引入了實驗性支援](whatsnew2020.md#concurrent-marking-in-garbage-collector) 於並行標記與清除垃圾收集器 (CMS GC)。在處理了使用者回饋並修復了效能退化後，我們現在準備從 Kotlin 2.4.0 開始預設啟用 CMS。

垃圾收集器中之前的預設並行標記並行清除 (PMCS) 設定在 GC 標記堆積中的物件時必須暫停應用程式執行緒。相比之下，CMS 允許標記階段與應用程式執行緒並行運行。

這顯著改善了 GC 暫停時間和應用程式回應能力，這對於延遲敏感型應用程式的效能至關重要。CMS 已經在使用 [Compose Multiplatform](https://blog.jetbrains.com/kotlin/2024/10/compose-multiplatform-1-7-0-released/#performance-improvements-on-ios) 構建的 UI 應用程式基準測試中證明了其有效性。

如果您遇到問題，可以切換回 PMCS。若要執行此操作，請在您的 `gradle.properties` 檔案中設定以下 [二進制選項](native-binary-options.md)：

```none
kotlin.native.binary.gc=pmcs
```

有關 Kotlin/Native 垃圾收集器的更多資訊，請參閱我們的 [文件](native-memory-manager.md#garbage-collector)。

### 減少虛擬化分析期間的記憶體消耗
<secondary-label ref="native"/>

以前，虛擬化分析 (devirtualization analysis) 是 Kotlin/Native 編譯器中消耗記憶體最多的階段之一。也就是說，連結釋放任務消耗了過多記憶體，尤其是在大型專案中。

Kotlin 2.4.0 引入了改進，有助於減少連結釋放任務期間的峰值記憶體消耗。

根據我們的一位 EAP 使用者的基準測試，改進後的虛擬化分析將連結釋放任務的記憶體消耗減少了一半，節省了至少 13 GB。

### 支援 Xcode 26.4
<secondary-label ref="native"/>

從 Kotlin 2.4.0 開始，Kotlin/Native 編譯器支援 Xcode 26.4 —— Xcode 的最新穩定版本之一。

您現在可以更新您的 Xcode 並存取最新的 API，以繼續為 Apple 作業系統開發您的 Kotlin 專案。

### LLVM 更新至版本 21
<secondary-label ref="native"/>

在 Kotlin 2.4.0 中，我們將 LLVM 從版本 19 更新至 21。新版本包括效能改進，並有助於保持 Kotlin/Native 編譯器最新。

這次更新不應影響您的程式碼，但如果您遇到任何問題，請報告至我們的 [問題追蹤器](http://kotl.in/issue)。

### Apple 目標支援的變更
<secondary-label ref="native"/>

Kotlin 2.4.0 提高了 Apple 目標的預設最低受支援版本：

* iOS 和 tvOS，從 14.0 提高到 15.0。
* macOS，從 11.0 提高到 12.0。
* watchOS，從 7.0 提高到 8.0。

如果您需要在專案中支援比預設版本更低的版本，請在您的建置檔案中使用 `freeCompilerArgs` 選項：

```kotlin
kotlin {
    targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget>().configureEach {
        binaries.configureEach {
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.ios=14.0"
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.macos=11.0"
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.tvos=14.0"
            freeCompilerArgs += "-Xoverride-konan-properties=minVersion.watchos=7.0"
        }
    }
}
```

### Swift 匯出進入 Alpha 階段，並改進了並行支援
<primary-label ref="alpha"/>

<secondary-label ref="native"/>

從 Kotlin 2.4.0 開始，Kotlin 透過 Swift 匯出與 Swift 的互通性正式進入 Alpha 階段！此版本為並行支援帶來了重大改進，為 Swift 匯出加入了原生且直接的結構化並行，以及將 `kotlinx.coroutines` Flow 匯出至 Swift 的能力。

#### 支援結構化並行
您現在可以從 Swift 無縫呼叫掛起 (suspending) 的 Kotlin 程式碼。Kotlin [`suspend` 函式](composing-suspending-functions.md) 和掛起函式類型會被匯出為 Swift 特有的 `async` 對應項：

```kotlin
// Kotlin
suspend fun hello(): String {
    delay(1000)
    return "Hello Swift! This is Kotlin."
}
```

```swift
// Swift
let msg = try await hello()
```
#### 將 Flow 類型匯出至 Swift

此更新還加入了將 `kotlinx.coroutines` Flow 匯出至 Swift 的支援。`kotlinx.coroutines` 中的 Flow 代表一個可以並行發射與消耗的非同步資料流。它們常用於響應式程式設計模式，例如監聽資料庫更新、網路請求或 UI 事件。

以前，將 [`kotlinx.coroutines.flow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow/) 中的 `Flow` 介面暴露給 Swift 的唯一方法是透過第三方解決方案。現在，您可以開箱即用地將 Flow 匯出到 Swift 的特有對應項：[`AsyncSequence`](https://developer.apple.com/documentation/Swift/AsyncSequence)。

此特性預設啟用。您可以將任何具有 `Flow` 類型的公開 API 匯出至 Swift，同時保留類型資訊。例如：

```kotlin
// Kotlin
// 匯出 Flow 時保留了 String 類型
fun flowOfStrings(): Flow<String> = flowOf("hello", "any", "world")
```

```Swift
// Swift
var actual: [String] = []

// 從 Kotlin 正確推論出 String 類型
for try await element in flowOfStrings().asAsyncSequence() {
    actual.append(element)
}
```

有關 Swift 匯出的更多資訊，請參閱我們的 [文件](native-swift-export.md)。

### Swift 套件匯入
<primary-label ref="experimental-general"/>

<secondary-label ref="native"/>

Kotlin Multiplatform 專案現在可以在其 Gradle 配置中宣告 [Swift 套件](https://docs.swift.org/swiftpm/documentation/packagemanagerdocs/) 作為 iOS 應用程式的相依性：

```kotlin
// build.gradle.kts
kotlin {
    swiftPMDependencies {
        swiftPackage(
            url = url("https://github.com/firebase/firebase-ios-sdk.git"),
            version = from("12.11.0"),
            products = listOf(
                product("FirebaseAI"),
                product("FirebaseAnalytics"),
                ...
}
```
{validate="false"}

有關工作範例和更詳細的資訊，請參閱 [SwiftPM 匯入](https://kotlinlang.org/docs/multiplatform/multiplatform-spm-import.html)。

如果您的專案依賴於 CocoaPods 相依性，您可以將當前設定遷移為使用 Swift 套件。KMP 工具考慮到了這種情況，並協助您自動重新配置專案。詳情請參閱我們的 [CocoaPods 遷移指南](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-spm-migration.html)。

## Kotlin/Wasm

Kotlin 2.4.0 預設為 Kotlin/Wasm 啟用了累加編譯，並引入了對 WebAssembly 元件模型的支援。

### 預設啟用累加編譯
<secondary-label ref="wasm"/>

Kotlin/Wasm 在 Kotlin 2.1.0 中引入了累加編譯。從 Kotlin 2.4.0 開始，它已達到 [Stable](components-stability.md#stability-levels-explained) 並預設啟用。透過此特性，編譯器僅重新構建受最近更改影響的檔案，這顯著縮短了建置時間。

若要停用累加編譯，請在專案的 `local.properties` 或 `gradle.properties` 檔案中加入以下行：

```none
# gradle.properties
kotlin.incremental.wasm=false
```

如果您遇到任何問題，請在 [YouTrack](https://kotl.in/issue) 中報告。

### 改進 Chrome DevTools 中內部變數的顯示
<secondary-label ref="wasm"/>

Kotlin 2.4.0 改進了 Kotlin/Wasm 在 Chrome DevTools 中的偵錯體驗，使臨時變數、合成變數和內部變數更容易與使用者定義的變數區分。

Kotlin 編譯器和編譯器外掛程式（例如 Compose）會產生這些變數。它們現在預設使用 `~` 前綴，因此它們會被分組在一起並移動到變數清單的末尾，Chrome DevTools 會依名稱對該清單進行排序。

### 支援 WebAssembly 元件模型
<primary-label ref="experimental-general"/>

<secondary-label ref="wasm"/>

Kotlin/Wasm 在 Kotlin 2.4.0 中更進一步，引入了對 [WebAssembly 元件模型](https://component-model.bytecodealliance.org/) 的實驗性支援。該提案定義了一種透過標準化介面和類型從 Wasm 模組建置元件的方法。這種方法有助於 Wasm 從低階二進制指令格式發展為用於組合成可重複使用的、與語言無關的元件系統。它使 Kotlin/Wasm 能夠超越瀏覽器。例如，Kotlin 和 WebAssembly 非常適合函式即服務（FaaS 或無伺服器）應用程式。

若要嘗試此特性，請查看 [使用 `wasi:http` 構建的簡單伺服器](https://github.com/Kotlin/sample-wasi-http-kotlin/)。

<img src="kotlin-wasm-wasi-http.gif" alt="Kotlin/Wasm with WebAssembly Component Model" width="600"/>

在 [YouTrack](https://youtrack.jetbrains.com/issue/KT-64569/Kotlin-Wasm-Support-Component-Model) 中分享您的回饋。

## Kotlin/JS

Kotlin 2.4.0 進一步改進了對 JavaScript/TypeScript 的匯出，包括支援匯出值類別、介面和類型差異，以及在內嵌 JS 程式碼時支援 ES2015 特性。

### 支援將值類別 (value class) 匯出至 JavaScript/TypeScript
<secondary-label ref="js"/>

以前，只有常規 Kotlin 類別可以匯出到 JavaScript/TypeScript。Kotlin 2.4.0 解除了這項限制。您現在可以將 Kotlin 的 [內值類別 (inline value class)](inline-classes.md) 匯出為常規 TypeScript 類別。

若要匯出值類別，請在 Kotlin 端使用 `@JsExport` 註解對其進行標記：

```Kotlin
// Kotlin
@JsExport
@JvmInline
value class Email(val address: String) {
    init { require(address.contains("@")) { "Invalid email" } }
}

@JsExport
class AuthService {
    suspend fun login(email: Email): String = ...
}
```

在 TypeScript 端，它看起來像一個常規類別：

```TypeScript
// TypeScript
import { AuthService, Email } from "..."
const auth = new AuthService();

console.log(await auth.login(new Email("jane@example.com"))); 
// "Welcome, jane@example.com!"
console.log(await auth.login(new Email("not-an-email"))); 
// "Invalid email"
```

有關更多資訊，請參閱 [`@JsExport` 註解](js-to-kotlin-interop.md#jsexport-annotation)。

### 內嵌 JS 程式碼時支援 ES2015 特性
<secondary-label ref="js"/>

從 Kotlin 2.4.0 開始，JavaScript 程式碼內嵌已完全支援 [ES2015 特性](js-project-setup.md#support-for-es2015-features)。

這對於與第三方程式庫的互通性以及對自動應用程式程式碼產生的直接控制非常有用。

現在您可以在 [`js()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.js/js.html) 呼叫中使用現代 JS 特性，包括：

* `const` 和 `let` 變數宣告
* ES 類別
* 產生器 (Generator)
* Lambda ([箭頭函式](whatsnew21.md#support-for-generating-es2015-arrow-functions))
* 展開與其餘運算子 (Spread and rest operators)
* 範本字串 (Template strings)

請記住，`js()` 函式的參數應為字串常數，因為它是在編譯期剖析並「原樣」翻譯為 JavaScript 程式碼的。例如，若要內嵌展開運算子，請使用：

```kotlin
fun spreadExample(): dynamic = js("""
    const add = (a, b, c) => a + b + c;

    const nums = [1, 2, 3];
    const sum = add(...nums);

    const a = [1, 2, 3];
    const b = [...a, 4, 5, 6];

    return { sum, b: b };
""")
```

有關內嵌 JavaScript 程式碼的更多資訊，請參閱 [我們的文件](js-interop.md#inline-javascript)。

### 匯出至 TypeScript 時保留類型差異 (variance)
<secondary-label ref="js"/>

以前，將類型匯出到 TypeScript 時，泛型位置中的 Kotlin [差異 (variance)](generics.md#variance) 資訊會丟失。

在 Kotlin 2.4.0 中，差異標註現在會在匯出期間保留，並對應到 TypeScript 的 [差異標註 (variance annotations)](https://www.typescriptlang.org/docs/handbook/2/generics.html#variance-annotations)。

在您的 Kotlin 程式碼中，定義泛型類型參數的差異：

```Kotlin
// Kotlin
// 'out' 代表共變性 (該介面僅產出 T)
interface Producer<out T> {
    fun produce(): T
}

// 'in' 代表逆變性 (該介面僅消耗 T)
interface Consumer<in T> {
    fun consume(item: T)
}
```

在 Kotlin 2.4.0 中，`in` 和 `out` 關鍵字會保留在產生的 TypeScript 輸出中：

```TypeScript
// 產生的 .d.ts
export interface Producer<out T> {
    produce(): T;
}

export interface Consumer<in T> {
    consume(item: T): void;
}
```

### 改進將介面匯出至 JavaScript/TypeScript 的方式
<secondary-label ref="js"/>

Kotlin 2.4.0 使得將 Kotlin 介面匯出到 JavaScript/TypeScript 變得更加方便。

新的 `@JsNoRuntime` 註解移除了以前實作 Kotlin 介面所需的元資料，從而允許直接對應到常規 TypeScript 介面，這與外部介面預設的行為類似。

若要匯出 Kotlin 介面（例如在您的 Kotlin Multiplatform 專案中），請在通用程式碼中使用 `@JsNoRuntime` 對其進行標註：

```kotlin
// commonMain
import kotlin.js.JsNoRuntime

@JsNoRuntime
expect interface DataProcessor {
    fun process(data: String): Int 
}
```

然後在您的 JS 特定原始碼中提供實際實作：

```kotlin
// jsMain
@JsNoRuntime
actual interface DataProcessor {
    actual fun process(data: String)
} 
```

由於移除了實作 Kotlin 介面所需的元資料，該介面會對應到常規 TypeScript 介面：

```TypeScript
// 產生的 .d.ts
export interface DataProcessor {
    process(data: string): void;
}
```

`@JsNoRuntime` 註解僅允許用於標準介面，以便 TypeScript 可以將 Kotlin 介面視為常規 TypeScript 介面。因此，禁止執行以下操作：

* `is` 和 `as` 類型檢查。
* 使用 [`::class` 語法](js-reflection.md) 的類別參照。
* 將介面作為具體化 (reified) 類型引數傳遞。

> 避免對外部介面標註 `@JsNoRuntime`，因為這會導致編譯器警告。
>
{type="note"}

### 解除匯出介面的限制
<primary-label ref="experimental-general"/>

<secondary-label ref="js"/>

Kotlin 2.4.0 在 `@JsExport` 穩定化方面又邁出了一步，改進了 Kotlin 介面的匯出方式。

現在您可以匯出帶有巢狀類別和具名伴隨物件的 Kotlin 介面：

```kotlin
@JsExport
interface Identity {
    class Metadata(val tag: String)

    companion object Registry {
        val defaultTag = "GUEST"
    }
}
```

有關更多資訊，請參閱 [`@JsExport` 註解](js-to-kotlin-interop.md#jsexport-annotation)。

## Gradle

Kotlin 2.4.0 與 Gradle 7.6.3 至 9.5.0 完全相容。您也可以使用最高至最新發佈版本的 Gradle。但請注意，這樣做可能會導致棄用警告，且某些新的 Gradle 特性可能無法運作。
Kotlin 2.4.0 還帶來了諸多改進，例如跨平台的一致預設模組名稱，以及將 Kotlin/JVM 的編譯器訊息寫入 Problems API。

### 最低受支援 AGP 版本提升至 8.5.2
<secondary-label ref="gradle"/>

從 Kotlin 2.4.0 開始，最低受支援的 Android Gradle 外掛程式版本為 8.5.2。

### 跨平台的一致模組名稱
<secondary-label ref="gradle"/>

在 Kotlin 2.4.0 之前，預設模組名稱在不同平台之間有所不同。這種不一致性可能會導致命名衝突和解析問題。Kotlin 2.4.0 將所有平台的預設名稱標準化為 `{group}:{project_name}`。

如果您需要將 JVM 模組名稱還原為之前的版本，請在 Kotlin/JVM 專案的 `build.gradle.kts` 檔案中加入以下內容：

```kotlin
kotlin {
    compilerOptions.moduleName(project.name)
}
```

對於多平台專案：

```kotlin
kotlin {
    jvm {
        compilerOptions.moduleName(project.name)
    }
}
```

### 將 Kotlin/JVM 的編譯器訊息寫入 Problems API
<secondary-label ref="gradle"/>

在 Kotlin 2.2.0 中，Kotlin Gradle 外掛程式 (KGP) 開始向 [Gradle 的 Problems API](https://docs.gradle.org/current/userguide/reporting_problems.html) 報告診斷資訊，以便在 Gradle 的 CLI 和 IntelliJ IDEA 中提供一致的體驗。

在 Kotlin 2.4.0 中，該外掛程式還將 Kotlin/JVM 的編譯器訊息寫入 Problems API，使該 API 離成為所有日誌和訊息的單一來源更近了一步。

## Maven

Kotlin 2.4.0 透過支援 Maven Toolchains 以及 Java 與 JVM 目標版本的自動對齊，使專案配置變得更加容易。

### Java 與 JVM 目標版本自動對齊
<secondary-label ref="maven"/>

為了簡化專案配置並防止相容性問題，Kotlin Maven 外掛程式現在會自動將 JVM 目標版本與專案中配置的 Java 編譯器版本對齊。

這可確保 Kotlin 和 Maven 編譯器針對相同的位元組碼版本，從而避免 Kotlin 產生的位元組碼與專案其餘部分或預期部署環境不相容的問題。

啟用 `<extensions>` 選項後，您無需設定 `kotlin.compiler.jvmTarget` 或 `kotlin.compiler.jdkRelease` 選項。如果兩者都未定義， Kotlin Maven 外掛程式會按以下順序自動解析 JVM 目標版本：

1. 作為在專案屬性中或在 `maven-compiler-plugin` 配置中定義的 `maven.compiler.release` 版本。

   在這種情況下，Kotlin 編譯器會同時設定 `jvmTarget` 和 `jdkRelease` 編譯器選項，將 API 限制為特定的 JDK 版本。

2. 如果未設定 Maven release 版本，則作為 `maven.compiler.target` 版本。編譯器目標可以在專案屬性中或在 `maven-compiler-plugin` 配置中定義。

   在這種情況下，僅設定 Kotlin 的 `jvmTarget`，API 不受特定 JDK 版本的限制。

這極大地簡化了您的 Kotlin 專案配置，因此您的 `pom.xml` 檔案可以像這樣：

```xml
<properties>
    <maven.compiler.release>17</maven.compiler.release>
    <kotlin.version>%kotlinVersion%</kotlin.version>
</properties>

<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <version>${kotlin.version}</version>
            <extensions>true</extensions>
        </plugin>
    </plugins>
</build>
```

在建置期間，外掛程式會輸出類似的訊息：

```none
[INFO] Using jvmTarget=17 (derived from maven.compiler.release=17)
```

> `<extensions>` 選項僅檢查專案級屬性和全域 `maven-compiler-plugin` 配置。它不會檢查外掛程式 `<executions>` 部分中定義的配置。
>
{style="note"}

有關自動專案配置的更多資訊，請參閱 [我們的文件](maven-configure-project.md#jvm-target-version)。

### 支援 Maven Toolchains
<secondary-label ref="maven"/>

Kotlin 2.4.0 為 Kotlin Maven 外掛程式引入了對 [Maven Toolchains](https://maven.apache.org/guides/mini/guide-using-toolchains.html) 的支援。

此特性有助於在建置中管理 JDK 版本。透過 Maven Toolchains，您可以指定用於 Kotlin 編譯的 JDK 版本，該版本獨立於運行 Maven 的 JVM 版本（設定在 `JAVA_HOME` 中）。當在建置中配置了 `maven-toolchains-plugin` 時，Kotlin Maven 外掛程式會自動選取選定的 JDK 工具鏈，就像 Maven 編譯器外掛程式和其他 Maven 外掛程式所做的那樣。這允許您配置單個工具鏈來控制建置中所有外掛程式使用的 JDK，包括 Kotlin 編譯：

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-toolchains-plugin</artifactId>
    <version>3.2.0</version>
    <executions>
        <execution>
            <goals>
                <goal>toolchain</goal>
            </goals>
        </execution>
    </executions>
    <configuration>
        <toolchains>
            <jdk>
                <version>21</version>
            </jdk>
        </toolchains>
    </configuration>
</plugin>
```
請記住設定 JDK 版本的不同方式的優先順序：

1. `kotlin-maven-plugin` 配置中的 `jdkHome`。明確設定的 `jdkHome` 選項始終優先於工具鏈版本。 
2. `maven-toolchains-plugin` 中的 JDK 版本。透過 Maven Toolchains 設定的 JDK 版本會覆蓋在 `JAVA_HOME` 路徑中設定的 JDK 版本。
3. `JAVA_HOME` 路徑。

您也可以使用外掛程式專用的 `<jdkToolchain>` 選項直接在 `kotlin-maven-plugin` 的工具鏈中設定 JDK 版本。與使用 `maven-toolchains-plugin` 相比，此參數僅影響 Kotlin 編譯，對建置中的其他外掛程式沒有影響。

> 目前，將 `maven-toolchains-plugin` 設定為使用特定 JDK 版本不會影響 `kotlin-maven-plugin` 的 `kapt` 和 `test-kapt` 目標。若要解決此問題，請在 `JAVA_HOME` 路徑中設定必要的版本。更多詳情請參閱 [KT-79897](https://youtrack.jetbrains.com/issue/KT-79897)。
>
{style="note"}

有關配置 Kotlin Maven 專案的更多資訊，請參閱我們的 [文件](maven-configure-project.md)。

## Build tools API

Kotlin 2.4.0 對 Build tools API (BTA) 進行了多項改進。BTA 現在：

* 為大多數 JVM 和通用編譯器選項引入了新的型別安全抽象。BTA 現在由它處理格式，而不是由客戶端處理，從而降低了錯誤風險並提供了額外的協助。此變更在執行時期是向後相容的，但可能會破壞原始碼相容性。
* 現在可以在累加編譯中追蹤非原始碼變更，例如配置不同的 Kotlin 版本或更改編譯器選項。建置系統可以透過 `BaseIncrementalCompilationConfiguration.TRACK_CONFIGURATION_INPUTS` 選項控制此行為。
* 透過 `AbiValidationToolchain` 支援 [二進制相容性驗證](gradle-binary-compatibility-validation.md)，使其他建置系統更容易加入此功能。
* 引入了一項新特性，以便建置系統可以透過 [`CompilerMessageRenderer`](https://github.com/JetBrains/kotlin/blob/2.4.0/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/CompilerMessageRenderer.kt) 介面和 [`JvmCompilationOperation` 建置器](https://github.com/JetBrains/kotlin/blob/2.4.0/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/jvm/operations/JvmCompilationOperation.kt#L59) 自訂編譯器訊息的顯示方式。
* 引入了配置 [Kotlin daemon](kotlin-daemon.md) 日誌記錄的新選項：
  * `LOGS_PATH` —— Daemon 日誌檔案的目錄。
  * `LOGS_FILE_SIZE_LIMIT` —— 最大日誌檔案大小（位元組）。
  * `LOGS_FILE_COUNT_LIMIT` —— 保留的日誌檔案最大數量。

  預設情況下，限制設定為特定於 Kotlin 編譯器版本的值。若要不設限制，建置工具必須將選項設定為 `null`。

  建置系統可以在配置 [執行策略](https://github.com/JetBrains/kotlin/blob/2.4.0/compiler/build-tools/kotlin-build-tools-api/src/main/kotlin/org/jetbrains/kotlin/buildtools/api/ExecutionPolicy.kt) 時設定該選項：

  ```kotlin
  val executionPolicy = kotlinToolchains.daemonExecutionPolicy {
      set(ExecutionPolicy.WithDaemon.LOGS_PATH, Paths("/var/log/kotlin-daemon"))
      set(ExecutionPolicy.WithDaemon.LOGS_FILE_SIZE_LIMIT, 10_485_760L)
      set(ExecutionPolicy.WithDaemon.LOGS_FILE_COUNT_LIMIT, 10)
  }
  ```

## Kotlin 編譯器

Kotlin 2.4.0 包含在 `.klib` 編譯期間對同一模組中宣告的內嵌函式更一致的行為。

### klib 編譯期間模組內函式內嵌的一致性
<secondary-label ref="compiler"/>

以前，[函式內嵌 (function inlining)](inline-functions.md) 在不同的 Kotlin 平台上的行為並不一致。JetBrains 團隊正努力在所有受支援平台上統一行為，以確保相同的相容性保證。

在 Kotlin/JVM 上，函式內嵌發生在編譯期。因此，當使用 Kotlin/JVM 編譯器編譯 Kotlin 原始碼時，產生的類別檔案在位元組碼中沒有內嵌函式呼叫，因為內嵌函式的主體已被內嵌到其呼叫點，所以其行為在編譯期間已固定。

相反，在 Kotlin/Native、Kotlin/JS 和 Kotlin/Wasm 上，函式內嵌並非發生在從原始碼到 klib 的編譯期間，而是僅在二進制檔案產生期間發生。因此，內嵌函式的行為在 `.klib` 編譯期間並未固定，而且 `.klib` 程式庫對內嵌函式提供的相容性保證與 Kotlin/JVM 不同。

Kotlin 2.4.0 在統一內嵌函式行為方面邁出了第一步，它在產生 `.klib` 成品 (artifact) 時啟用了模組內 (intra-module) 內嵌：

```kotlin
// 現有的 logging.klib 程式庫
inline fun logDebug(message: String) {
    println("[DEBUG] $message")
}
```

```kotlin
// 當前編譯的 App 模組
inline fun greetUser(name: String) {
    println("Hello, $name!")
}

fun main() {
    logDebug("App started") // 未內嵌：在另一個模組中宣告
    greetUser("Alice")      // 已內嵌：在同一個模組中宣告
}
```

當編譯為 `.klib` 時，程式碼看起來像：

```kotlin
// 偽程式碼
fun main() {
    logDebug("App started")  // 未內嵌，在另一個模組中宣告
    val tmp0 = "Alice"
    println("Hello, $tmp0!") // 從 greetUser() 內嵌
}
```

這意謂著在 `.klib` 編譯期間，只有在同一個模組中宣告的內嵌函式才會被內嵌。在這種情況下，其他函式將在產生平台特定二進制檔案期間內嵌。

#### 如何啟用 {id=how-to-enable-intra-module-inlining}

從 2.4.0 開始，Kotlin/Native、Kotlin/JS 和 Kotlin/Wasm 預設啟用模組內內嵌。

如果您在使用此特性時遇到意外問題，可以在命令列中使用以下編譯器選項將其停用：

```bash
-Xklib-ir-inliner=disabled
```

下一步是啟用跨模組 (cross-module) 內嵌，以確保專案中的所有內嵌函式都被一致地內嵌。這項變更計劃在未來的 Kotlin 版本中推出，但您現在已經可以在命令列中使用以下編譯器選項進行嘗試：

```bash
-Xklib-ir-inliner=full
```

請在 [YouTrack](https://kotl.in/issue) 中分享您的回饋並報告任何問題。

### 跨 Kotlin 編譯器的一致部分程式庫連結
<secondary-label ref="compiler"/>

在 Kotlin 1.9.0 中，Kotlin/Native 和 Kotlin/JS 編譯器預設啟用了部分程式庫連結 (partial library linkage)，Kotlin/Wasm 則在 Kotlin 2.0.0 中跟進。此特性有效地使編譯器對待 Kotlin 程式庫中的連結問題與 Kotlin/JVM 保持一致。

自那以後，我們沒有收到負面回饋，也沒有注意到使用者在其專案中停用部分連結。這就是為什麼從 Kotlin 2.4.0 開始，部分連結始終啟用，且 `-Xpartial-linkage` 編譯器選項現在已棄用。

所有 Kotlin 編譯器的預設記錄層級均為 `SILENT`。編譯期間不會報告連結問題。若要在您的專案中更改此行為，請在建置檔案中設定 `-Xpartial-linkage-loglevel` 編譯器選項：

```kotlin
// build.gradle.kts
kotlin {
    macosX64("native") {
        binaries.executable()
        
        compilations.configureEach {
            compilerOptions.configure {
                // 以 "info" 記錄層級報告連結問題：
                freeCompilerArgs.add("-Xpartial-linkage-loglevel=INFO")

                // 將問題報告為錯誤：
                freeCompilerArgs.add("-Xpartial-linkage-loglevel=ERROR")
            }
        }
    }
}
```
{validate="false"}

* `INFO` 以 "info" 記錄層級報告連結問題。
* `WARNING` 在編譯時報告警告，並將其記錄在編譯日誌中。
* `ERROR` 在出現連結問題時允許編譯失敗，並在編譯日誌中報告錯誤。使用此選項可以更仔細地檢查連結問題。

如果您遇到此特性的問題，請在 [我們的問題追蹤器](https://kotl.in/issue) 中報告。

## Kotlin 編譯器外掛程式

在 Kotlin 2.4.0 中，Kotlin 的編譯器外掛程式也獲得了顯著更新。kapt 外掛程式現在可以從編譯類別路徑中排除不必要的註解處理器，而 Power-assert 外掛程式則透過新的執行時程式庫提供了簡化的配置。

### kapt：從編譯類別路徑中排除註解處理器

Kotlin 2.4.0 加入了對註解處理器探索的 `includeCompileClasspath` 配置選項的支援，這與 Kotlin Gradle 外掛程式類似。新選項允許您從編譯類別路徑中排除不必要的註解處理器。

若要在您的建置檔案中配置此項，請在 kapt 外掛程式的 `<execution>` 部分中將 `includeCompileClasspath` 選項設定為 `false`：

```xml
<execution>
    <id>kapt</id>
        <goals><goal>kapt</goal></goals>
        <configuration>
            <!-- 加入新選項 -->
            <includeCompileClasspath>false</includeCompileClasspath> 
            <sourceDirs>...</sourceDirs>
            <annotationProcessorPaths>...</annotationProcessorPaths>
        </configuration>
</execution>
```

或者，您可以在 `<properties>` 部分中使用 `kapt.include.compile.classpath` 執行相同操作：

```xml
<properties>
    <kapt.include.compile.classpath>false</kapt.include.compile.classpath>
</properties>
```

將該選項設定為 `false` 後，kapt 配置的 `<annotationProcessorPaths>` 部分中未包含的註解處理器將從 kapt 處理中排除。

如果未設定 `includeCompileClasspath` 且 kapt 在編譯類別路徑上偵測到未在 `<annotationProcessorPaths>` 部分中明確定義的註解處理器，您將看到以下棄用警告：

```text
[WARNING] Annotation processors discovery from compile classpath is deprecated. Set 'kapt.include.compile.classpath=false' to disable discovery.
```

有關 kapt 配置的更多資訊，請參閱我們的 [文件](kapt.md)。

### Power-assert：新的執行時程式庫

Kotlin 2.4.0 透過新的執行時程式庫，使 Power-assert 相關函式更容易被發現且更容易配置。

以前，採用 Power-assert 需要複雜的建置組態以及函式參數慣例。從此版本開始，具有 Power-assert 能力的函式可以使用新的執行時程式庫直接與編譯器外掛程式轉換整合。

這為外掛程式使用者和程式庫作者帶來了重大改進：

* 新的 `CallExplanation` 資料結構提供有關呼叫點的詳細資訊。這使得斷言失敗時的圖表渲染更加動態，並能與外部工具更好地整合。
* 新的 `@PowerAssert` 註解使斷言函式能夠立即被編譯器外掛程式發現。這樣一來，您現在可以為您的程式庫加入開箱即用的 Power-assert 支援。

> 使用我們的 [範例集合](https://github.com/bnorm/power-assert-examples#power-assert-examples) 作為實驗新特性的遊樂場。
>
{style="tip"}

有關更多資訊，請參閱我們的 [文件](power-assert.md#use-the-power-assert-plugin)。

## Compose 編譯器

透過 Kotlin 2.4.0，Compose 編譯器提供了更一致的累加編譯，並推進了幾個特性標記的棄用週期。

### 內部宣告的一致性累加編譯
<secondary-label ref="compose-compiler"/>

從 Kotlin 2.4.0 開始，Compose 編譯器提供了更一致的累加編譯。不同檔案中內部類型的穩定性現在會在執行時期推論。這允許 Compose 即使在未重新編譯類別用法的情況下也能更新推論出的穩定性值。

作為副作用，每當一個 `@Composable` 函式將來自另一個檔案的 `internal` 類別作為參數使用時，您產出的成品大小可能會增加。這是因為編譯器編碼了穩定和不穩定情況的執行路徑，因為必須在執行時期決定穩定性。這種執行時期穩定性的開銷可以透過執行全應用程式最佳化（例如 R8）的縮減器來消除，因為它們能夠推論出不必要的執行路徑並將其刪除。

此更新不會更改最終的穩定性值，因此 `@Composable` 函式的行為保持不變。

### 特性標記棄用
<secondary-label ref="compose-compiler"/>

Kotlin 2.4.0 推進了已晉升為穩定且現在預設啟用的實驗性特性標記的棄用週期：

* `StrongSkipping`、`IntrinsicRemember` 及其相關的 DSL 屬性已晉升為 `DeprecationLevel.ERROR`。它們將在 Kotlin 2.5.0 中被移除。
* `OptimizeNonSkippingGroups` 和 `PausableComposition` 現在已棄用。它們計劃在 Kotlin 2.6.0 中被移除。

## 破壞性變更與棄用

本節重點介紹重要的破壞性變更和棄用。如需完整概覽，請參閱我們的 [相容性指南](compatibility-guide-24.md)。

* 從 Kotlin 2.4.0 開始，編譯器不再支援 `-language-version=1.9`。因此，不再支援 K1 編譯器。
* Kotlin 2.4.0 簡化了 Kotlin Gradle 外掛程式中二進制相容性驗證的 DSL，並棄用了一些部分。有關最新的 DSL，請參閱 [Kotlin Gradle 外掛程式中的二進制相容性驗證](gradle-binary-compatibility-validation.md)。
* [已移除透過 `KotlinScriptMojo` Maven 外掛程式執行 Kotlin 指令碼的支援](compatibility-guide-22.md#deprecations-to-kotlin-scripting)。

## 文件更新
我們在 Kotlin 生態系統中進行了以下文件更改：

* [Compose Multiplatform 應用程式中的 Liquid Glass](https://kotlinlang.org/docs/multiplatform/ios-liquid-glass.html) – 將 iOS 應用程式從完全由 Compose 驅動的導航遷移到具有 iOS 26 Liquid Glass 樣式的原生 SwiftUI 導航。
* [將 Swift 套件作為相依性加入 KMP 模組](https://kotlinlang.org/docs/multiplatform/multiplatform-spm-import.html) – 了解如何在您的 KMP 專案中設定 SwiftPM 相依性。
* 手動 [將 Kotlin Multiplatform 專案從 CocoaPods 切換為 SwiftPM 相依性](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-spm-migration.html) 或 [使用 Junie](https://kotlinlang.org/docs/multiplatform/multiplatform-cocoapods-spm-migration-ai.html) – 了解如何使用 Junie 和 Kotlin AI 技能使遷移更輕鬆。
* [為 KMP 應用程式配置 TeamCity](https://kotlinlang.org/docs/multiplatform/configure-teamcity-for-kmp.html) – 使用 TeamCity 構建、測試和部署您的 KMP 應用程式。
* [Navigation 3 的推薦序列化方法](https://kotlinlang.org/docs/multiplatform/compose-navigation-3.html#recommended-serialization-approaches) – 尋找在您的 CMP 應用程式中搭配 Navigation 3 使用序列化的最佳方式。
* [Multiplatform ViewModel](https://kotlinlang.org/docs/multiplatform/compose-viewmodel.html) – 了解如何在多平台專案中設定和使用 ViewModel。
* [使用 Kotlin 進行後端開發](server-overview.md) – 探索您可以整合用於後端開發的不同架構。
* [使用 Spring Boot 和 Claude 建立任務管理器應用程式](spring-boot-claude.md) – 了解 Claude 如何協助您從頭開始使用 Spring Boot 建立應用程式。
* [配置 Maven 專案](maven-configure-project.md) – 在現有的 Java Maven 專案或新的 Kotlin Maven 專案中設定 Kotlin 編譯。
* [使用 Maven 測試 Kotlin 專案](jvm-test-maven.md) – 了解如何使用 JUnit 建立測試，並使用 Maven 外掛程式運行單元測試與整合測試。
* [在 Kotlin 專案中使用註解處理器](jvm-annotation-processors.md) – 在 kapt 和 KSP 之間進行選擇，以便在您的後端專案中處理註解。
* [Kotlin AI 技能](kotlin-ai-skills.md) – 使用 Agent 技能協助您執行 Kotlin 專用的任務。
* [Kotlin 語言伺服器](kotlin-lsp.md) – 閱讀有關 JetBrains 對 Kotlin 的語言伺服器協定 (LSP) 的官方實作。
* [數字](numbers.md) – 探索 Kotlin 的數字類型以及如何操作它們。
* [KSP 快速入門](ksp-quickstart.md) – 了解如何將基於 KSP 的處理器加入您的專案或建立您自己的處理器。
* [從 kapt 遷移到 KSP](ksp-kapt-migration.md) – 遷移您的註解處理器，以充分發揮 Kotlin 特性的優勢。
* [Lincheck 概覽](lincheck-guide.md) – 了解 Lincheck 在幕後如何運作以測試 JVM 上的並行程式碼。
* [Lincheck 入門](lincheck-getting-started.md) – 建立專案並使用 Lincheck 運行測試。
* [使用 Lincheck 測試任意程式碼](lincheck-testing-arbitrary-code.md) – 了解如何使用 Lincheck 測試並行程式碼。
* [如何使用 Lincheck 測試資料結構](lincheck-how-to-test-data-structures.md) – 深入了解 Lincheck 的資料結構測試過程。
* [使用 Lincheck 的測試策略](lincheck-testing-strategies.md) – 了解 Lincheck 的測試策略：模型檢查 (model checking) 與壓力測試 (stress testing)。
* [使用 Lincheck 配置測試策略](lincheck-testing-strategies-options.md) – 探索 Lincheck 測試策略的不同選項。
* [使用 Dokku 部署 Ktor 應用程式](https://ktor.io/docs/dokku.html) – 了解使用 Dokku 的部署工作流程。