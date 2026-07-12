[//]: # (title: 型別總覽)

在 Kotlin 中，就任何變數都能呼叫其成員函數與屬性而言，萬物皆為物件。雖然某些型別在執行時具有作為基本型別值的最佳化內部表示方式（例如數字、字元和布林），但對您來說，它們的外觀和行為就像常規類別一樣。

本節說明 Kotlin 中使用的基本型別：

* [數字](numbers.md) 及其 [無符號對應型別](unsigned-integer-types.md)
* [布林](booleans.md)
* [字元](characters.md)
* [字串](strings.md)
* [陣列](arrays.md)

若要了解其他 Kotlin 型別，例如 `Nothing`、`Any` 和 `Unit`，請查閱 Kotlin API 參考文件：

* [`Any`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-any/)
* [`Nothing`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-nothing.html)
* [`Unit`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-unit/)

Kotlin 也有不可表示型別 (non-denotable types)。這些型別無法直接在 Kotlin 程式碼中撰寫。相反地，編譯器會在內部使用它們，例如為了與其他語言的互通性。Kotlin 建立不可表示型別來表示比 Kotlin 原始碼語法所允許的更精確的型別資訊。

雖然您無法自行宣告不可表示型別，但您可能會在編譯器診斷、IDE 工具提示或推論型別顯示中遇到它們。進一步了解不可表示型別：

* [平台型別](java-interop.md#null-safety-and-platform-types)
* [](typecasts.md#intersection-types)
* [](numbers.md#integer-literal-types)
* [](generics.md#captured-types)
* [Kotlin 語言規範：型別系統](https://kotlinlang.org/spec/type-system.html)

> [了解如何在 Kotlin 中進行型別檢查與轉換](typecasts.md)。
>
{style="tip"}