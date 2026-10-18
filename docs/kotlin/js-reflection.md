[//]: # (title: Kotlin/JS 反射)

Kotlin/JS 对 Kotlin [反射 API](reflection.md) 提供了有限的支持。该 API 中仅支持以下部分：

* [类引用](reflection.md#obtain-a-runtime-class) (`::class`)
* [`KType` 与 `typeof()`](#ktype-and-typeof)
* [`KClass` 与 `createInstance()`](#kclass-and-createinstance)

## 类引用 {id="class-references"}

`::class` 语法返回实例所属类的引用，或与给定类型对应的类的引用。
在 Kotlin/JS 中，`::class` 表达式的值是一个精简版的 [KClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/) 实现，它仅支持：
* [simpleName](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/simple-name.html) 和 [isInstance()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/is-instance.html) 成员。
* [cast()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/cast.html) 与 [safeCast()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/safe-cast.html) 扩展函数。

除此之外，你还可以使用 [KClass.js](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/js.html) 访问与该类对应的 [JsClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-js-class/index.html) 实例。
`JsClass` 实例本身是指向构造函数的引用。
这可用于与需要构造函数引用的 JS 函数进行互操作。

## KType 与 typeOf() {id="ktype-and-typeof"}

[`typeof()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/type-of.html) 函数可为给定类型构造一个 [`KType`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-type/) 实例。
除 Java 特定的部分外，`KType` API 在 Kotlin/JS 中得到了完全支持。

## KClass 与 createInstance() {id="kclass-and-createinstance"}

来自 [KClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/) 接口的 [`createInstance()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.full/create-instance.html) 函数用于创建指定类的新实例，这对于获取 Kotlin 类的运行时引用非常有用。

## 示例 {id="example"}

以下是在 Kotlin/JS 中使用反射的示例。

```kotlin
open class Shape
class Rectangle : Shape()

inline fun <reified T> accessReifiedTypeArg() =
    println(typeOf<T>().toString())

fun main() {
    val s = Shape()
    val r = Rectangle()

    println(r::class.simpleName) // 输出 "Rectangle"
    println(Shape::class.simpleName) // 输出 "Shape"
    println(Shape::class.js.name) // 输出 "Shape"

    println(Shape::class.isInstance(r)) // 输出 "true"
    println(Rectangle::class.isInstance(s)) // 输出 "false"
    val rShape = Shape::class.cast(r) // 将 Rectangle "r" 转换为 Shape

    accessReifiedTypeArg<Rectangle>() // 通过 typeOf() 访问类型。输出 "Rectangle"
}
```