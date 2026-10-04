[//]: # (title: 基本型別)

<no-index/>

Kotlin 中的每個變數與資料結構都有型別。型別非常重要，因為它們會告訴編譯器你被允許對該變數或資料結構執行哪些操作。換句話說，也就是它擁有那些函式與屬性。

在上一章的前述範例中，Kotlin 能夠判斷出 `customers` 的型別為 [`Int`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-int/)。
Kotlin **推論**型別的能力稱為**型別推論**。`customers` 被指派了一個整數值，Kotlin 藉此推論出 `customers` 具有數值型別 `Int`。因此，編譯器知道你可以對 `customers` 執行算術運算：

```kotlin
fun main() {
//sampleStart
    var customers = 10

    // 部分顧客離開排隊隊伍
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

> `+=`、`-=`、`*=`、`/=` 與 `%=` 是複合指派運算子。若要了解更多，請參閱[複合指派](operator-overloading.md#augmented-assignments)。
> 
{style="tip"}

總體而言，Kotlin 具有以下基本型別：

| **類別**                                                  | **基本型別**                       | **程式碼範例**                                                     |
|-----------------------------------------------------------|------------------------------------|-------------------------------------------------------------------|
| [整數](numbers.md#integer-types)                          | `Byte`, `Short`, `Int`, `Long`     | `val year: Int = 2020`<br/> `val amount: Long = 350_000_000`      |
| [無正負號整數](unsigned-integer-types.md)                | `UByte`, `UShort`, `UInt`, `ULong` | `val score: UInt = 100u`                                          |
| [浮點數](numbers.md#floating-point-types)                 | `Float`, `Double`                  | `val currentTemp: Float = 24.5f`<br/> `val price: Double = 19.99` |
| [布林值](booleans.md)                                     | `Boolean`                          | `val isEnabled: Boolean = true`                                   |
| [字元](characters.md)                                     | `Char`                             | `val separator: Char = ','`                                       |
| [字串](strings.md)                                         | `String`                           | `val message: String = "Hello, world!"`                           |

若要了解更多關於基本型別及其屬性的資訊，請參閱[型別概觀](types-overview.md)。

有了這些知識，你就可以先宣告變數並在稍後進行初始化。只要變數在第一次讀取前完成初始化，Kotlin 就能妥善處理。

若要宣告變數而不進行初始化，請使用 `:` 指定其型別。例如：

```kotlin
fun main() {
//sampleStart
    // 宣告變數但未初始化
    val d: Int
    // 初始化變數
    d = 3

    // 明確指定型別並初始化的變數
    val e: String = "hello"

    // 變數已初始化，因此可以讀取
    println(d) // 3
    println(e) // hello
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-basic-types-initialization"}

如果在讀取變數前尚未將其初始化，你將會看到錯誤：

```kotlin
fun main() {
//sampleStart
    // 宣告變數但未初始化
    val d: Int
    
    // 觸發錯誤
    println(d)
    // Variable 'd' must be initialized
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-basic-types-no-initialization" validate="false"}

現在你已經知道如何宣告基本型別，接下來該了解[集合](kotlin-tour-collections.md)了。

## 練習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true">
<def title="為變數宣告明確型別">

明確為每個變數宣告正確的型別：

```kotlin
fun main() {
    val a: Int = 1000 
    val b = "log message"
    val c = 3.14
    val d = 100_000_000_000_000
    val e = false
    val f = '\n'
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-basic-types-exercise"}

```kotlin
fun main() {
    val a: Int = 1000
    val b: String = "log message"
    val c: Double = 3.14
    val d: Long = 100_000_000_000_000
    val e: Boolean = false
    val f: Char = '\n'
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="參考解答" id="kotlin-tour-basic-types-solution"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-hello-world.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-collections.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>