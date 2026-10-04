[//]: # (title: 型別總覽)

在 Kotlin 中，一切都是物件，這意味著你可以在任何變數上呼叫成員函數和屬性。
某些型別（例如數字、字元和布林）在執行期具有作為原始值（primitive values）的最佳化內部表示形式，但它們在 Kotlin 程式碼中的外觀和行為與一般類別完全相同。

## 基本型別 {id="basic-types"}

本節介紹 Kotlin 中使用的基本型別：

| **類別**                                                  | **基本型別**                       | **定義**                           |
|-----------------------------------------------------------|------------------------------------|------------------------------------|
| [整數](numbers.md#integer-types)                          | `Byte`, `Short`, `Int`, `Long`     | 整數                               |
| [無號整數](unsigned-integer-types.md)                    | `UByte`, `UShort`, `UInt`, `ULong` | 非負整數                           |
| [浮點數](numbers.md#floating-point-types)                 | `Float`, `Double`                  | 帶有小數部分的數字                 |
| [布林](booleans.md)                                       | `Boolean`                          | 邏輯值：`true` 與 `false`          |
| [字元](characters.md)                                     | `Char`                             | 單一字元                           |
| [字串](strings.md)                                        | `String`                           | 字元序列                           |
| [陣列](arrays.md)                                         | `Array<T>`, 基本型別陣列           | 固定大小的值序列                   |

> 預設情況下，所有型別都是不可為 null 的（non-nullable）。若要允許 `null` 值，請在變數型別後方加上 `?` 符號宣告。例如 `String?`。若要了解更多，請參閱 [Null 安全性](null-safety.md#nullable-types-and-non-nullable-types)。
> 
{style="note"}

若要了解其他 Kotlin 型別（例如 `Nothing`、`Any` 和 `Unit`），請瀏覽 Kotlin API 參考文件：

* [`Any`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-any/) – Kotlin 類別階層結構的根。
* [`Nothing`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-nothing.html) – 沒有任何值的型別。
* [`Unit`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-unit/) – 只有一個值（`Unit`）的型別。編譯器會將其推論為具有區塊主體且未明確宣告傳回型別的函式的傳回型別。請參閱 [傳回 Unit 的函式](functions.md#unit-returning-functions)。

## 不可指稱型別 (Non-denotable types) {id="non-denotable-types"}

Kotlin 也具備不可指稱型別。它們是無法直接在 Kotlin 程式碼中撰寫的型別。相反地，編譯器會在內部使用它們，例如用於與其他語言互通。Kotlin 建立不可指稱型別是為了表示比 Kotlin 原始碼語法所允許的更為精確的型別資訊。

即使你無法自行宣告不可指稱型別，但仍可能會在編譯器診斷、IDE 工具提示或推論型別顯示中遇到它們。進一步了解不可指稱型別：

* [平台型別](java-interop.md#null-safety-and-platform-types)
* [](typecasts.md#intersection-types)
* [](numbers.md#integer-literal-types)
* [](generics.md#captured-types)
* [Kotlin 語言規格：型別系統](https://kotlinlang.org/spec/type-system.html)

> [了解如何在 Kotlin 中執行型別檢查與轉換](typecasts.md)。
>
{style="tip"}