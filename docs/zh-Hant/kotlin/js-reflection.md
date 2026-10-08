[//]: # (title: Kotlin/JS 反射)

Kotlin/JS 對於 Kotlin [反射 API](reflection.md) 提供有限的支援。API 中僅支援以下部分：

* [類別參考](reflection.md#class-references) (`::class`)
* [`KType` 與 `typeof()`](#ktype-and-typeof)
* [`KClass` 與 `createInstance()`](#kclass-and-createinstance)

## 類別參考 {id="class-references"}

`::class` 語法會傳回執行個體的類別參考，或是與指定型別對應的類別。
在 Kotlin/JS 中，`::class` 運算式的值是一個精簡版的 [KClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/)
實作，僅支援：
* [simpleName](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/simple-name.html)
以及 [isInstance()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/is-instance.html) 成員。
* [cast()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/cast.html) 與 
[safeCast()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/safe-cast.html) 擴充函式。

除此之外，您可以使用 [KClass.js](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/js.html) 來存取與類別對應的
[JsClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-js-class/index.html) 執行個體。
`JsClass` 執行個體本身是對建構函式的參考。
這可以用來與需要建構函式參考的 JS 函式進行互通。

## KType 與 typeOf() {id="ktype-and-typeof"}

[`typeof()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/type-of.html) 函式會為指定型別建構一個
[`KType`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-type/) 執行個體。
除了 Java 特有的部分外，Kotlin/JS 完整支援 `KType` API。

## KClass 與 createInstance() {id="kclass-and-createinstance"}

來自 [KClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/) 介面的 [`createInstance()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.full/create-instance.html) 函式
會建立指定類別的新執行個體，這對於取得 Kotlin 類別的執行階段參考非常有用。

## 範例 {id="example"}

以下是 Kotlin/JS 中使用反射的一個範例。

```kotlin
open class Shape
class Rectangle : Shape()

inline fun <reified T> accessReifiedTypeArg() =
    println(typeOf<T>().toString())

fun main() {
    val s = Shape()
    val r = Rectangle()

    println(r::class.simpleName) // 印出 "Rectangle"
    println(Shape::class.simpleName) // 印出 "Shape"
    println(Shape::class.js.name) // 印出 "Shape"

    println(Shape::class.isInstance(r)) // 印出 "true"
    println(Rectangle::class.isInstance(s)) // 印出 "false"
    val rShape = Shape::class.cast(r) // 將 Rectangle "r" 轉換為 Shape

    accessReifiedTypeArg<Rectangle>() // 透過 typeOf() 存取型別。印出 "Rectangle"
}
```
