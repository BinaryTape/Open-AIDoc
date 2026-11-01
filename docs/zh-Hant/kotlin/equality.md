[//]: # (title: 相等)

在 Kotlin 中，有兩種類型的相等：

* _結構_相等 (`==`) - 檢查 `equals()` 函式
* _參照_相等 (`===`) - 檢查兩個參照是否指向同一個物件

## 結構相等 {id="structural-equality"}

結構相等會驗證兩個物件是否具有相同的內容或結構。結構相等是透過 `==` 操作及其對應的否定操作 `!=` 來檢查。
按照慣例，像 `a == b` 這樣的運算式會被轉譯為：

```kotlin
a?.equals(b) ?: (b === null)
```

如果 `a` 不是 `null`，它會呼叫 `equals(Any?)` 函式。否則（`a` 為 `null`），它會檢查 `b` 是否在參照上等於 `null`：

```kotlin
fun main() {
    var a = "hello"
    var b = "hello"
    var c = null
    var d = null
    var e = d

    println(a == b)
    // true
    println(a == c)
    // false
    println(c == e)
    // true
}
```
{kotlin-runnable="true" validate="false"}

請注意，在明確與 `null` 比較時，最佳化程式碼是沒有意義的：
`a == null` 會被自動轉譯為 `a === null`。

在 Kotlin 中，所有類別都從 `Any` 類別繼承了 `equals()` 函式。預設情況下，`equals()` 函式實作的是[參照相等](#referential-equality)。然而，Kotlin 中的類別可以覆寫 `equals()` 函式以提供自訂的相等邏輯，並透過這種方式實作結構相等。

值類別 (Value classes) 與資料類別 (data classes) 是兩種會自動覆寫 `equals()` 函式的特定 Kotlin 型別。這就是為什麼它們預設實作結構相等。

然而，在資料類別的情況下，如果父類別中的 `equals()` 函式被標記為 `final`，其行為將保持不變。

與之不同的是，非資料類別（未宣告 `data` 修飾詞的類別）預設不會覆寫 `equals()` 函式。相反地，非資料類別實作了從 `Any` 類別繼承的參照相等行為。若要實作結構相等，非資料類別需要自訂相等邏輯來覆寫 `equals()` 函式。

若要提供自訂的 equals 檢查實作，請覆寫
[`equals(other: Any?): Boolean`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-any/equals.html) 函式：

```kotlin
class Point(val x: Int, val y: Int) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Point) return false

        // Compares properties for structural equality
        return this.x == other.x && this.y == other.y
    }
}
```
> 覆寫 equals() 函式時，你也應該覆寫 [hashCode() 函式](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-any/hash-code.html)，以保持相等性與雜湊之間的一致性，並確保這些函式的正常運作。
>
{style="note"}

具有相同名稱但簽章不同（例如 `equals(other: Foo)`）的函式不會影響運算子 `==` 和 `!=` 的相等檢查。

結構相等與 `Comparable<...>` 介面所定義的比較無關，因此只有自訂的 `equals(Any?)` 實作才會影響該運算子的行為。 

## 參照相等 {id="referential-equality"}

參照相等會驗證兩個物件的記憶體位址，以判斷它們是否為同一個執行個體。

參照相等是透過 `===` 操作及其對應的否定操作 `!==` 來檢查。當且僅當 `a` 和 `b` 指向同一個物件時，`a === b` 的求值結果才為 true： 

```kotlin
fun main() {
    var a = "Hello"
    var b = a
    var c = "world"
    var d = "world"

    println(a === b)
    // true
    println(a === c)
    // false
    println(c === d)
    // true

}
```
{kotlin-runnable="true" validate="false"}

對於在執行時期以基本型別表示的值（例如 `Int`），`===` 相等檢查等同於 `==` 檢查。

> 在 Kotlin/JS 中，參照相等的實作方式有所不同。如需更多關於相等的資訊，請參閱 [Kotlin/JS](js-interop.md#equality) 文件。
>
{style="tip"}

## 浮點數相等 {id="floating-point-numbers-equality"}

當靜態已知相等檢查的運算元為 `Float` 或 `Double`（無論是否可為 null）時，該檢查遵循 [IEEE 754 浮點運算標準](https://en.wikipedia.org/wiki/IEEE_754)。

對於未以靜態型別宣告為浮點數的運算元，其行為會有所不同。在這些情況下，實作的是結構相等。因此，對未以靜態型別宣告為浮點數的運算元進行檢查會與 IEEE 標準有所差異。在此情境下：

* `NaN` 等於其自身
* `NaN` 大於任何其他元素（包含 `POSITIVE_INFINITY`） 
* `-0.0` 不等於 `0.0`

如需更多資訊，請參閱[浮點數比較](numbers.md#floating-point-number-comparison)。

## 陣列相等 {id="array-equality"}

若要比較兩個陣列是否以相同順序包含相同的元素，請使用 [`contentEquals()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/content-equals.html)。

如需更多資訊，請參閱[比較陣列](arrays.md#compare-arrays)。