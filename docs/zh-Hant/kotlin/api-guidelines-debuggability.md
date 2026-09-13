[//]: # (title: 偵錯便利性)

您程式庫的使用者會基於其功能進行建置，而他們建置的功能可能會包含需要識別與解決的錯誤。
此錯誤解決過程可能會在開發期間透過偵錯工具進行，或是在正式環境中使用日誌與觀測性工具。
您的程式庫可以遵循以下最佳實務，讓偵錯變得更容易。

## 為具狀態型別提供 toString 方法 {id="provide-a-tostring-method-for-stateful-types"}

針對每個包含狀態的型別，請提供有意義的 `toString` 實作。
此實作應傳回該執行個體目前內容的清晰表示，即使是內部型別也是如此。

由於型別的 `toString` 表示通常會寫入日誌，實作此方法時請考量安全性，並
避免傳回敏感的使用者資料。

確保描述狀態的格式在程式庫中的不同型別間盡可能保持一致。
當此格式作為 API 實作契約的一部分時，應對其進行明確描述與完整文件化。
`toString` 方法的輸出可能支援剖析，例如在自動化測試套件中。

例如，考慮以下來自支援服務訂閱程式庫的型別：

```kotlin
enum class SubscriptionResultReason {
    Success, InsufficientFunds, IncompatibleAccount
}

class SubscriptionResult(
    val result: Boolean,
    val reason: SubscriptionResultReason,
    val description: String
)
```

若沒有 `toString` 方法，列印 `SubscriptionResult` 執行個體並不實用：

```kotlin
fun main() {
    val result = SubscriptionResult(
       false,
       IncompatibleAccount,
       "Users account does not support this type of subscription"
    )
    
    //印出 'org.example.SubscriptionResult@13221655'
    println(result)
}
```

偵錯工具中也不會直接顯示該資訊：

![偵錯工具中的結果](debugger-result.png){width=500}

加入簡單的 `toString` 實作後，在兩種情況下的輸出都能顯著改善：

```kotlin
//印出 'Subscription failed (reason=IncompatibleAccount, description="Users 
// account does not support this type of subscription")'
override fun toString(): String {
    val resultText = if(result) "succeeded" else "failed"
    return "Subscription $resultText (reason=$reason, description=\"$description\")"
}
```

![加入 toString 產生了更好的結果](debugger-result-tostring.png){width=700}

雖然使用資料類別來自動取得 `toString` 方法可能很有吸引力，但基於回溯相容性的考量，不建議這樣做。
資料類別會在 [在您的 API 中避免使用資料類別](api-guidelines-backward-compatibility.md#avoid-using-data-classes-in-your-api) 章節中進行更詳細的討論。

請注意，`toString` 方法中描述的狀態不一定非得是問題領域的資訊。
它可以與進行中請求的狀態（如上述範例）、連線至外部服務的健全狀況，
或是進行中作業的過渡狀態有關。

例如，考慮以下產生器型別：

```kotlin
class Person(
    val name: String?,
    val age: Int?,
    val children: List<Person>
) {
    override fun toString(): String =
        "Person(name=$name, age=$age, children=$children)"
}

class PersonBuilder {
    var name: String? = null
    var age: Int? = null
    val children = arrayListOf<Person>()

    fun child(personBuilder: PersonBuilder.() -> Unit = {}) {
       children.add(person(personBuilder))
    }
    fun build(): Person = Person(name, age, children)
}

fun person(personBuilder: PersonBuilder.() -> Unit = {}): Person = 
    PersonBuilder().apply(personBuilder).build()
```

這是您會使用此型別的方式：

![使用產生器型別範例](halt-breakpoint.png){width=500}

如果您在上方圖片顯示的中斷點處停止程式執行，顯示的資訊將毫無幫助：

![在中斷點停止程式碼的結果](halt-result.png){width=500}

加入簡單的 `toString` 實作會產生更有幫助的輸出：

```kotlin
override fun toString(): String =
    "PersonBuilder(name=$name, age=$age, children=$children)"
```

加入後，偵錯工具會顯示：

![在停止點加入 toString](halt-tostring-result.png){width=700}

如此一來，您可以立即查看哪些欄位已設定，哪些尚未設定。

## 採用並文件化處理例外的政策 {id="adopt-and-document-a-policy-for-handling-exceptions"}

正如 [選擇適當的錯誤處理機制](api-guidelines-consistency.md#choose-the-appropriate-error-handling-mechanism) 章節中所討論的，
在某些情況下，您的程式庫適合透過拋出例外來發出錯誤訊號。
您可以為此目的建立自己的例外型別。

抽象化並簡化底層 API 的程式庫也需要處理其相依項拋出的例外。
程式庫可以選擇隱藏例外、按原樣傳遞、將其轉換為不同的例外型別，
或是以不同的方式向使用者發送錯誤訊號。

根據上下文，這些選項都可能是有效的。例如：

* 如果使用者採用程式庫 A 純粹是為了簡化程式庫 B，那麼程式庫 A 在不進行修改的情況下重新拋出程式庫 B 產生的任何例外可能是合適的。
* 如果程式庫 A 採用程式庫 B 純粹是作為內部的實作細節，那麼程式庫 B 拋出的特定程式庫例外絕不應暴露給程式庫 A 的使用者。

您必須採用並文件化一致的例外處理方法，以便使用者能有效地利用您的程式庫。
這對於偵錯尤為重要。您程式庫的使用者應該能夠在偵錯工具和日誌中，識別出
例外是否源自於您的程式庫。

例外的型別應指出錯誤的類型，且例外中的資料應協助使用者定位
問題的根本原因。
一種常見的模式是將底層例外包裝在特定於程式庫的例外中，並透過 `cause` 存取原始例外。

## 為自訂例外支援協同程式堆疊追蹤復原 {id="support-coroutine-stack-trace-recovery-for-custom-exceptions"}
<primary-label ref="experimental-general"/>

您可以為程式庫中的自訂例外型別新增協同程式[堆疊追蹤復原](coroutines-debugging.md#stack-trace-recovery)的支援，讓它們更容易偵錯。
這能提升您的程式庫對 `kotlinx.coroutines` 程式庫及 Kotlin 中其他非同步執行階段的支援。

當一個協同程式透過掛起函式接收到來自另一個協同程式的例外時，堆疊追蹤復原會建立該例外的複本，並附帶指向該函式呼叫的堆疊訊框。

對於建構函式僅接受例外訊息、cause、兩者皆有或不帶引數的例外，`kotlinx.coroutines` 程式庫會自動執行堆疊追蹤復原。
如果您的程式庫中的例外型別需要額外的建構函式引數（例如行號或錯誤碼），請實作 [`StackTraceRecoverable`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines.debug/-stack-trace-recoverable/) 介面。

若要實作該介面，請覆寫 [`copyForStackTraceRecovery()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.coroutines.debug/-stack-trace-recoverable/copy-for-stack-trace-recovery.html) 函式。
在覆寫中，傳回用於堆疊追蹤復原的新例外執行個體，或者如果您不希望 `kotlinx.coroutines` 程式庫複製該例外，則傳回 `null`。

`StackTraceRecoverable` 介面是 Kotlin 標準程式庫的一部分，因此實作它不會增加對 `kotlinx.coroutines` 程式庫的相依性。

以下是一個自訂例外的範例，它在為堆疊追蹤復原建立新執行個體時保留了 `line` 屬性：

```kotlin
import kotlin.coroutines.ExperimentalStdlibCoroutineSupportApi
import kotlin.coroutines.debug.StackTraceRecoverable

@OptIn(ExperimentalStdlibCoroutineSupportApi::class)
class FileEditException
// 實作需要一個 private 建構函式，
// 以便將 cause 傳遞給 IllegalStateException 建構函式
private constructor(
    val line: Int,
    private val detail: String,
    cause: Throwable?,
) : IllegalStateException("When editing line $line: $detail", cause),
    // 實作 StackTraceRecoverable 以進行堆疊追蹤復原
    StackTraceRecoverable<FileEditException> {

    constructor(line: Int, detail: String) : this(line, detail, null)

    // 複製行號與訊息詳細資訊
    override fun copyForStackTraceRecovery(): FileEditException =
        FileEditException(line, detail, this)
    }

fun main() {
    val original = FileEditException(15, "Unexpected token")
    
    // 通常您不需要直接呼叫此函式，除非您正在測試其行為
    // kotlinx.coroutines 程式庫會在堆疊追蹤復原期間自動叫用它
    val copy = original.copyForStackTraceRecovery()

    println(copy.message)
    // When editing line 15: Unexpected token

    println(copy.cause == original)
    // true
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4.20"}

## 下一步 {id="next-step"}

在指南的下一部分中，您將學習測試便利性。

[繼續進行下一部分](api-guidelines-testability.md)