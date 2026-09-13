[//]: # (title: 未使用的傳回值檢查器)

<primary-label ref="experimental-general"/>

> 此功能計畫在未來的 Kotlin 版本中穩定並改進。
> 歡迎在我們的問題追蹤器 [YouTrack](https://youtrack.jetbrains.com/issue/KT-12719) 中提供您的回饋。
> 
> 若要了解更多資訊，請參閱相關的 [KEEP 提案](https://github.com/Kotlin/KEEP/blob/main/proposals/KEEP-0412-unused-return-value-checker.md)。
>
{style="note"}

未使用的傳回值檢查器讓您可以偵測 *被忽略的結果*。
這些是從運算式傳回的值，其產出的內容不是
`Unit`、`Nothing` 或 `Nothing?`，且未被：

* 儲存在變數或屬性中。
* 傳回或拋出。
* 作為引數傳遞給另一個函式。
* 在呼叫或安全呼叫中用作接收者。
* 在 `if`、`when` 或 `while` 等條件中進行檢查。
* 用作 Lambda 的最後一個陳述式。

檢查器不會報告遞增作業（如 `++` 和 `--`）中被忽略的結果，
也不會報告右側會結束目前函式的布林捷徑，例如 `condition || return`。

您可以使用未使用的傳回值檢查器來找出那些函式呼叫產出了有意義的結果、但該結果卻被無聲丟棄的錯誤。
這有助於防止非預期的行為，並使此類問題更容易追蹤。

以下是一個範例，其中建立了一個字串但從未被使用，因此檢查器將其報告為被忽略的結果：

```kotlin
fun formatGreeting(name: String): String {
    if (name.isBlank()) return "Hello, anonymous user!"
    if (!name.contains(' ')) {
        // 檢查器會報告一條警告，指出此結果被忽略：
        // "Unused return value of 'plus'."
        "Hello, " + name.replaceFirstChar(Char::titlecase) + "!"
    }
    val (first, last) = name.split(' ')
    return "Hello, $first! Or should I call you Dr. $last?"
}
```

## 設定未使用的傳回值檢查器 {id="configure-the-unused-return-value-checker"}

您可以使用 `-Xreturn-value-checker` 編譯器選項來控制編譯器如何報告被忽略的結果。

它具有以下模式：

* `disable` 停用未使用的傳回值檢查器（預設）。
* `check` 啟用檢查器，並針對來自[已標記函式](#mark-functions-to-check-ignored-results)的被忽略結果報告警告。
* `full` 啟用檢查器，將專案中的所有函式視為[已標記](#mark-functions-to-check-ignored-results)，並報告被忽略結果的警告。

> 所有標記的函式都會依此傳遞，如果在將您的程式碼作為相依性使用的專案中啟用了檢查器，則會報告被忽略的結果。
> 
{style="note"}

要在您的專案中使用未使用的傳回值檢查器，請將編譯器選項新增到您的組建組態檔案中：

<tabs>
<tab id="kotlin" title="Gradle">

```kotlin
// build.gradle(.kts)
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xreturn-value-checker=check")
    }
}
```
</tab>

<tab id="maven" title="Maven">

```xml
<!-- pom.xml -->
<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    ..
    <configuration>
        <args>
            <arg>-Xreturn-value-checker=check</arg>
        </args>
    </configuration>
</plugin>
```

</tab>
</tabs>

## 標記函式以檢查被忽略的結果 {id="mark-functions-to-check-ignored-results"}

當您將 [`-Xreturn-value-checker` 編譯器選項](#configure-the-unused-return-value-checker)設定為 `check` 時，
檢查器僅會報告來自已標記運算式的被忽略結果，例如 Kotlin 標準函式庫中的大多數函式。

要標記您自己的程式碼，
請使用 [`@MustUseReturnValues`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-must-use-return-values/) 註解。
您可以根據想要檢查器涵蓋的作用域，將其套用於檔案、類別或函式。

例如，您可以標記整個檔案：

```kotlin
// 標記此檔案中的所有函式和類別，以便檢查器報告未使用的傳回值
@file:MustUseReturnValues

package my.project

fun someFunction(): String
```

或標記特定的類別：

```kotlin
// 標記此類別中的所有函式，以便檢查器報告未使用的傳回值
@MustUseReturnValues
class Greeter {
    fun greet(name: String): String = "Hello, $name"
}

fun someFunction(): Int = ...
```

> 您可以透過將 `-Xreturn-value-checker` 編譯器選項設定為 `full` 來將檢查器套用到整個專案。
> 使用此選項，您不必在程式碼中標註 `@MustUseReturnValues`。
>
{style="note"}

## 隱藏被忽略結果的報告 {id="suppress-reports-for-ignored-results"}

您可以透過在特定函式上加上 [`@IgnorableReturnValue`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-ignorable-return-value/) 註解來隱藏其報告。
請在那些忽略傳回值是常見且預期的函式上加上註解，例如 `MutableList.add`：

```kotlin
@IgnorableReturnValue
fun <T> MutableList<T>.addAndIgnoreResult(element: T): Boolean {
    return add(element)
}
```

您可以在不註解函式本身的情況下隱藏警告。
若要執行此操作，請使用底線語法 (`_`) 將結果指派給特殊的無名變數：

```kotlin
// 非可忽略的函式
fun computeValue(): Int = 42

fun main() {

    // 報告警告：結果被忽略
    computeValue()

    // 僅在此呼叫點使用特殊的未使用變數來隱藏警告
    val _ = computeValue()
}
```

### 函式覆寫中被忽略的結果 {id="ignored-results-in-function-overrides"}

當您覆寫一個函式時，該覆寫會繼承基底宣告上註解所定義的報告規則。
這也適用於基底宣告屬於 Kotlin 標準函式庫或其他函式庫相依性的情況，因此檢查器會針對 `Any.hashCode()` 等函式的覆寫報告被忽略的結果。

此外，您不能使用另一個[要求必須使用其傳回值的函式](#mark-functions-to-check-ignored-results)來覆寫標記有 `@IgnorableReturnValue` 的函式。
然而，當結果可以被安全忽略時，您可以在標記有 `@MustUseReturnValues` 的類別或介面中，將覆寫標記為 `@IgnorableReturnValue`：

```kotlin
@MustUseReturnValues
interface Greeter {
    fun greet(name: String): String
}

object SilentGreeter : Greeter {
    @IgnorableReturnValue
    override fun greet(name: String): String = ""
}

fun check(g: Greeter) {
    // 報告警告：未使用的傳回值
    g.greet("John")

    // 沒有警告
    SilentGreeter.greet("John")
}
```

## 在高階函數中檢查未使用的結果 {id="check-for-unused-results-in-higher-order-functions"}

某些高階函數（例如 `let` 作用域函式）會傳回 Lambda 的結果。
要檢查高階函數中未使用的 Lambda 結果，請將[實驗性](components-stability.md#stability-levels-explained) `returnsResultOf()` 合約新增到該函式的合約中。

> Kotlin 合約目前處於實驗性階段。要啟用此功能，請在宣告帶有合約的函式時新增 `@OptIn(ExperimentalContracts::class)` 註解。
>
{style="warning"}

以下是一個範例：

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

接著您可以使用帶有此合約的函式（例如 `.customLet()`）來檢查 Lambda 結果是否被使用：

```kotlin
fun handleNullablePackageName(packageName: String?, builder: StringBuilder) {
    // 檢查器不會報告警告，因為 append() 的傳回值可以被忽略
    packageName?.customLet { builder.append(it) }

    // 檢查器會報告警告，因為傳回的字串未被使用
    packageName?.customLet { "kotlin.$it" }
}
```

> `returnsResultOf()` 合約需要單獨的編譯器選項才能啟用。
> 請注意，使用它會產出預發佈二進位檔，早於 2.4.0 版的 Kotlin 編譯器版本將無法讀取這些檔案。
>
{style="warning"}

要在您的專案中啟用此功能，請將以下編譯器選項新增到您的組建檔案中：

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

</tab> 
<tab title="Maven" group-key="maven">

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

## 與 Java 註解的互通性 {id="interoperability-with-java-annotations"}

某些 Java 函式庫使用類似的機制但使用不同的註解。
未使用的傳回值檢查器將以下註解視為等同於使用 `@MustUseReturnValues`：

* [`com.google.errorprone.annotations.CheckReturnValue`](https://errorprone.info/api/latest/com/google/errorprone/annotations/CheckReturnValue.html)
* [`edu.umd.cs.findbugs.annotations.CheckReturnValue`](https://findbugs.sourceforge.net/api/edu/umd/cs/findbugs/annotations/CheckReturnValue.html)
* [`org.jetbrains.annotations.CheckReturnValue`](https://javadoc.io/doc/org.jetbrains/annotations/latest/org/jetbrains/annotations/CheckReturnValue.html)
* [`org.springframework.lang.CheckReturnValue`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/lang/CheckReturnValue.html)
* [`org.jooq.CheckReturnValue`](https://www.jooq.org/javadoc/latest/org.jooq/org/jooq/CheckReturnValue.html)

它也將 [`com.google.errorprone.annotations.CanIgnoreReturnValue`](https://errorprone.info/api/latest/com/google/errorprone/annotations/CanIgnoreReturnValue.html) 視為等同於使用 `@IgnorableReturnValue`。