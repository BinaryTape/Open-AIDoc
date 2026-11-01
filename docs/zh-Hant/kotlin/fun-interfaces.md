[//]: # (title: 函式 \(SAM\) 介面)

只有一個抽象成員函式的介面稱為*函式介面*（functional interface），或*單一抽象方法 (SAM) 介面*（Single Abstract Method (SAM) interface）。函式介面可以包含多個非抽象成員函式，但只能有一個抽象成員函式。

要在 Kotlin 中宣告函式介面，請使用 `fun` 修飾詞。

```kotlin
fun interface KRunnable {
    fun invoke()
}
```

## SAM 轉換 {id="sam-conversions"}

對於函式介面，你可以使用 SAM 轉換，透過使用 [Lambda 運算式](lambdas.md#lambda-expressions-and-anonymous-functions)使你的程式碼更加簡潔且易讀。

你可以使用 Lambda 運算式，而不是手動建立實作函式介面的類別。透過 SAM 轉換，Kotlin 可以將簽章與介面中單一方法簽章相符的任何 Lambda 運算式轉換為動態具現化該介面實作的程式碼。

例如，考慮以下 Kotlin 函式介面：

```kotlin
fun interface IntPredicate {
    fun accept(i: Int): Boolean
}
```

如果不使用 SAM 轉換，你需要編寫如下程式碼：

```kotlin
// 建立類別的執行個體
val isEven = object : IntPredicate {
    override fun accept(i: Int): Boolean {
        return i % 2 == 0
    }
}
```

透過利用 Kotlin 的 SAM 轉換，你可以改寫成以下程式碼：

```kotlin
// 使用 Lambda 建立執行個體
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

使用 SAM 轉換取代[物件運算式](object-declarations.md#object-expressions)可能會改變物件的識別性（identity）。物件運算式每次求值時都會建立一個新執行個體，而 SAM 轉換則可能會建立新執行個體或重複使用現有執行個體。因此：

* 如果你每次都需要一個不同的執行個體（例如用於每次註冊），請使用物件運算式或明確建立類別的執行個體。
* 如果你稍後需要參照同一個執行個體（例如為了移除接聽程式），請將其存儲在變數中。

你也可以使用[適用於 Java 介面的 SAM 轉換](java-interop.md#sam-conversions)。

### 將可呼叫參照傳遞給 SAM 參數 {id="pass-callable-references-to-sam-parameters"}

如果所需的行為已經以具名函式的形式存在，你可以傳遞[可呼叫參照](lambdas.md#callable-reference)。
Kotlin 會將相容的可呼叫參照適配至預期的函式介面：

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
    // Kotlin 將 Lambda 轉換為 Action 執行個體
    execute { start() }
    // Run from a callable reference

    // Kotlin 將參照適配為 Action 執行個體
    execute(::start)
    // Run from a callable reference
}
```
{kotlin-runnable="true"}

`execute { start() }` 中的 Lambda 是一個函式常值，因此 Kotlin 使用 SAM 轉換來建立 `Action` 執行個體。
在 `execute(::start)` 中，`::start` 是現有 `start()` 函式的可呼叫參照。由於 `execute()` 預期一個 `Action`，編譯器會建立一個相容的 `Action` 執行個體，並將 `start()` 作為 `Action.run()` 的實作。
這個過程稱為 *SAM 適配（SAM adaptation）*。

## 從具有建構函式的介面遷移到函式介面 {id="migration-from-an-interface-with-constructor-function-to-a-functional-interface"}

從 1.6.20 開始，Kotlin 支援對函式介面建構函式的可呼叫參照，這增加了一種原始碼相容的方式，用於從具有建構函式的介面遷移到函式介面。
考慮以下程式碼：

```kotlin
interface Printer { 
    fun print() 
}

fun Printer(block: () -> Unit): Printer = object : Printer {
    override fun print() = block()
}
```

啟用對函式介面建構函式的可呼叫參照後，可以用單純的函式介面宣告來取代這段程式碼：

```kotlin
fun interface Printer { 
    fun print() 
}
```

其建構函式將會被隱式建立，任何使用 `::Printer` 函式參照的程式碼都能編譯成功。例如：

```kotlin
documentsStorage.addPrinter(::Printer)
```

使用具有 `DeprecationLevel.HIDDEN` 的 [`@Deprecated`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-deprecated/) 註解標記舊版函式 `Printer`，以保持二進位相容性：

```kotlin
@Deprecated(message = "Your message about the deprecation", level = DeprecationLevel.HIDDEN)
fun Printer(...) {...}
```

## 函式介面 vs. 型別別名 {id="functional-interfaces-vs-type-aliases"}

你也可以使用函式型別的[型別別名](type-aliases.md)簡單地重寫上述內容：

```kotlin
typealias IntPredicate = (i: Int) -> Boolean

val isEven: IntPredicate = { it % 2 == 0 }

fun main() {
    println("Is 7 even? - ${isEven(7)}")
}
```

然而，函式介面與[型別別名](type-aliases.md)有著不同的用途。
型別別名只是現有型別的名稱——它們不會建立新型別，而函式介面則會。
你可以提供專屬於特定函式介面的擴充功能，使其不適用於一般函式或其型別別名。

型別別名只能有一個成員，而函式介面可以有多個非抽象成員函式和一個抽象成員函式。
函式介面還可以實作和擴充其他介面。

函式介面比型別別名更靈活且提供更多功能，但它們在語法和執行階段可能成本更高，因為它們可能需要轉換為特定介面。
在程式碼中選擇使用哪一個時，請考慮你的需求：
* 如果你的 API 需要接受具有特定參數和傳回型別的函式（任何函式）——請使用簡單的函式型別，或定義型別別名為對應的函式型別指定一個較短的名稱。
* 如果你的 API 接受比函式更複雜的實體——例如，它具有無法在函式型別簽章中表達的非平凡約定及／或操作——請為其宣告一個獨立的函式介面。