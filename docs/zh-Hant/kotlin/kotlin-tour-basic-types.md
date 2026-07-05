[//]: # (title: 基本型別)

<no-index/>

<tldr>
    <p><img src="icon-1-done.svg" width="20" alt="第一步" /> <a href="kotlin-tour-hello-world.md">Hello world</a><br />
        <img src="icon-2.svg" width="20" alt="第二步" /> <strong>基本型別</strong><br />
        <img src="icon-3-todo.svg" width="20" alt="第三步" /> <a href="kotlin-tour-collections.md">集合</a><br />
        <img src="icon-4-todo.svg" width="20" alt="第四步" /> <a href="kotlin-tour-control-flow.md">控制流</a><br />
        <img src="icon-5-todo.svg" width="20" alt="第五步" /> <a href="kotlin-tour-functions.md">函式</a><br />
        <img src="icon-6-todo.svg" width="20" alt="第六步" /> <a href="kotlin-tour-classes.md">類別</a><br />
        <img src="icon-7-todo.svg" width="20" alt="最後一步" /> <a href="kotlin-tour-null-safety.md">Null 安全</a></p>
</tldr>

Kotlin 中的每個變數與資料結構都有一個型別。型別非常重要，因為它們會告訴編譯器你被允許對該變數或資料結構執行哪些操作。換句話說，即它具有哪些函式與屬性。

在上一章，Kotlin 能夠在先前的範例中判斷出 `customers` 的型別為 [`Int`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int/)。
Kotlin **推論**型別的能力被稱為**型別推論**。`customers` 被指派了一個整數值。由此，Kotlin 推論出 `customers` 具有數值型別 `Int`。因此，編譯器知道你可以對 `customers` 執行算術運算：

```kotlin
fun main() {
//sampleStart
    var customers = 10

    // 有些顧客離開了隊列
    customers = 8

    customers = customers + 3 // 加法範例：11
    customers += 7            // 加法範例：18
    customers -= 3            // 減法範例：15
    customers *= 2            // 乘法範例：30
    customers /= 3            // 除法範例：10

    println(customers) // 10
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-basic-types-arithmetic"}

> `+=`、`-=`、`*=`、`/=` 與 `%=` 是複合指派運算子。若要了解更多資訊，請參閱 [Augmented assignments](operator-overloading.md#augmented-assignments)。
> 
{style="tip"}

總體而言，Kotlin 具有以下基本型別：

| **類別** | **基本型別** | **範例程式碼** |
|-----------------------------------------------------------|------------------------------------|-------------------------------------------------------------------|
| [整數](numbers.md#integer-types) | `Byte`, `Short`, `Int`, `Long` | `val year: Int = 2020`<br/> `val amount: Long = 350_000_000` |
| [無符號整數](unsigned-integer-types.md) | `UByte`, `UShort`, `UInt`, `ULong` | `val score: UInt = 100u` |
| [浮點數](numbers.md#floating-point-types) | `Float`, `Double` | `val currentTemp: Float = 24.5f`<br/> `val price: Double = 19.99` |
| [布林值](booleans.md) | `Boolean` | `val isEnabled: Boolean = true` |
| [字元](characters.md) | `Char` | `val separator: Char = ','` |
| [字串](strings.md) | `String` | `val message: String = "Hello, world!"` |

有關基本型別及其屬性的更多資訊，請參閱 [Types overview](types-overview.md)。

掌握了這些知識，你就可以宣告變數並在稍後進行初始化。只要變數在第一次讀取前完成初始化，Kotlin 就能處理這種情況。

要宣告一個變數而不初始化它，請使用 `:` 指定其型別。例如：

```kotlin
fun main() {
//sampleStart
    // 宣告變數但未初始化
    val d: Int
    // 變數已初始化
    d = 3

    // 變數已明確指定型別並初始化
    val e: String = "hello"

    // 變數可以被讀取，因為它們已經完成初始化
    println(d) // 3
    println(e) // hello
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-basic-types-initialization"}

如果你在讀取變數之前未對其進行初始化，你將會看到錯誤：

```kotlin
fun main() {
//sampleStart
    // 宣告變數但未初始化
    val d: Int
    
    // 觸發錯誤
    println(d)
    // 變數 'd' 必須被初始化
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-basic-types-no-initialization" validate="false"}

現在你已經知道如何宣告基本型別，接著該來學習[集合](kotlin-tour-collections.md)了。

## 練習

### 練習題 {initial-collapse-state="collapsed" collapsible="true"}

為每個變數明確宣告正確的型別：

|---|---|
```kotlin
fun main() {
    val a: Int = 1000 
    val b = "log message"
    val c = 3.14
    val d = 100_000_000_000_000
    val e = false
    val f = '
'
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-basic-types-exercise"}

|---|---|
```kotlin
fun main() {
    val a: Int = 1000
    val b: String = "log message"
    val c: Double = 3.14
    val d: Long = 100_000_000_000_000
    val e: Boolean = false
    val f: Char = '
'
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-basic-types-solution"}

## 下一步

[集合](kotlin-tour-collections.md)