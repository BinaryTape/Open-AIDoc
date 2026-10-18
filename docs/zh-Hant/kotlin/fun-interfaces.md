[//]: # (title: 函式式 \(SAM\) 介面)

只有一個抽象成員函式的介面稱為*函式式介面*（functional interface），或稱為*單一抽象方法 (SAM) 介面*。函式式介面可以有多個非抽象成員函式，但只能有一個抽象成員函式。

若要在 Kotlin 中宣告函式式介面，請使用 `fun` 修飾詞。

```kotlin
fun interface KRunnable {
    fun invoke()
}
```

## SAM 轉換 {id="sam-conversions"}

對於函式式介面，你可以使用 SAM 轉換，透過使用 [Lambda 運算式](lambdas.md#lambda-expressions-and-anonymous-functions)使你的程式碼更加簡潔且易讀。

你可以使用 Lambda 運算式，而不是手動建立實作函式式介面的類別。透過 SAM 轉換，Kotlin 可以將任何簽章與該介面的單一方法簽章相符的 Lambda 運算式轉換為動態具現化該介面實作的程式碼。

例如，考慮以下 Kotlin 函式式介面：

```kotlin
fun interface IntPredicate {
    fun accept(i: Int): Boolean
}
```

如果不使用 SAM 轉換，你將需要撰寫如下程式碼：

```kotlin
// 建立類別的執行個體
val isEven = object : IntPredicate {
    override fun accept(i: Int): Boolean {
        return i % 2 == 0
    }
}
```

透過利用 Kotlin 的 SAM 轉換，你可以改寫成以下等效程式碼：

```kotlin
// 使用 lambda 建立執行個體
val isEven = IntPredicate { it % 2 == 0 }
```

簡短的 Lambda 運算式取代了所有不必要的程式碼。

```kotlin
fun interface IntPredicate {
    fun accept(i: Int): Boolean
}

val isEven = IntPredicate { it % 2 == 0 }

fun main() {
    println("Is 7 even? - ${isEven.accept(7)}")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.4"}

你也可以使用[適用於 Java 介面的 SAM 轉換](java-interop.md#sam-conversions)。

### 傳遞可呼叫參照至 SAM 參數 {id="pass-callable-references-to-sam-parameters"}

如果所需的行為已經以具名函式形式存在，你可以傳遞[可呼叫參照](lambdas.md#callable-reference)。Kotlin 會將相容的可呼叫參照調整為預期的函式式介面：

```kotlin
fun interface Action {
    fun run()
}

fun execute(action: Action) {
    action.run()
}

fun start() {
    println("Run from a callable reference")
}

fun main() {
    // Kotlin 將 lambda 轉換為 Action 執行個體
    execute { start() }
    // Run from a callable reference

    // Kotlin 將參照調整為 Action 執行個體
    execute(::start)
    // Run from a callable reference
}
```
{kotlin-runnable="true"}

在 execute `{ start() }` 中的 Lambda 是一個函式常值，因此 Kotlin 使用 SAM 轉換來建立 `Action` 執行個體。在 `execute(::start)` 中，`::start` 是現有 `start()` 函式的可呼叫參照。由於 `execute()` 預期一個 `Action`，編譯器會建立一個相容的 `Action` 執行個體，並將 `start()` 作為 `Action.run()` 的實作。這個過程稱為 *SAM 適配*（SAM adaptation）。

## 從具有建構函式的介面遷移到函式式介面 {id="migration-from-an-interface-with-constructor-function-to-a-functional-interface"}

從 1.6.20 開始，Kotlin 支援對函式式介面建構函式的可呼叫參照，這為從帶有建構函式的介面遷移到函式式介面提供了一種原始碼相容的方式。考慮以下程式碼：

```kotlin
interface Printer { 
    fun print() 
}

fun Printer(block: () -> Unit): Printer = object : Printer {
    override fun print() = block()
}
```

在啟用對函式式介面建構函式的可呼叫參照後，這段程式碼可以僅用一個函式式介面宣告來取代：

```kotlin
fun interface Printer { 
    fun print()
}
```

其建構函式將會隱式建立，並且任何使用 `::Printer` 函式參照的程式碼都能編譯通過。例如：

```kotlin
documentsStorage.addPrinter(::Printer)
```

若要保持二進制相容性，請將舊版函式 `Printer` 標記為帶有 `DeprecationLevel.HIDDEN` 的 [`@Deprecated`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-deprecated/) 註解：

```kotlin
@Deprecated(message = "Your message about the deprecation", level = DeprecationLevel.HIDDEN)
fun Printer(...) {...}
```

## 函式式介面 vs. 型別別名 {id="functional-interfaces-vs-type-aliases"}

你也可以直接使用函式型別的[型別別名](type-aliases.md)來重寫上述內容：

```kotlin
typealias IntPredicate = (i: Int) -> Boolean

val isEven: IntPredicate = { it % 2 == 0 }

fun main() {
    println("Is 7 even? - ${isEven(7)}")
}
```

然而，函式式介面與[型別別名](type-aliases.md)的用途不同。型別別名只是現有型別的名稱——它們不會建立新型別，而函式式介面會。你可以提供特定於特定函式式介面的擴充功能，使其不適用於普通函式或其型別別名。

型別別名只能有一個成員，而函式式介面可以有多個非抽象成員函式和一個抽象成員函式。函式式介面還可以實作和繼承其他介面。

函式式介面比型別別名更靈活且提供更多功能，但它們在語法和執行時期可能代價更高，因為它們可能需要轉換為特定介面。當你在程式碼中選擇使用哪一種時，請考慮你的需求：
* 如果你的 API 需要接受具有某些特定參數和傳回型別的函式（任何函式）——請使用簡單的函式型別，或定義型別別名以為對應的函式型別提供更短的名稱。
* 如果你的 API 接受比函式更複雜的實體——例如，它具有無法在函式型別簽章中表達的非平凡協定和／或操作——請為其宣告一個單獨的函式式介面。