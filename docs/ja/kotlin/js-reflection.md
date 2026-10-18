[//]: # (title: Kotlin/JS のリフレクション)

Kotlin/JS では、Kotlin の[リフレクション API](reflection.md) に対する限定的なサポートを提供しています。サポートされている API の部分は以下のみです：

* [クラス参照](reflection.md#obtain-a-runtime-class) (`::class`)
* [`KType` と `typeof()`](#ktype-and-typeof)
* [`KClass` と `createInstance()`](#kclass-and-createinstance)

## クラス参照 {id="class-references"}

`::class` 構文は、インスタンスのクラス、または指定された型に対応するクラスへの参照を返します。
Kotlin/JS において、`::class` 式の値は機能を絞り込んだ [KClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/) の実装であり、以下のみをサポートしています：
* [simpleName](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/simple-name.html) および [isInstance()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/is-instance.html) メンバー。
* [cast()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/cast.html) および [safeCast()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/safe-cast.html) 拡張関数。

それに加えて、[KClass.js](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/js.html) を使用して、そのクラスに対応する [JsClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-js-class/index.html) インスタンスにアクセスできます。
`JsClass` インスタンス自体はコンストラクタ関数への参照です。
これは、コンストラクタへの参照を期待する JS 関数と相互運用するために使用できます。

## KType and typeOf() {id="ktype-and-typeof"}

[`typeof()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/type-of.html) 関数は、指定された型に対する [`KType`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-type/) のインスタンスを構築します。
`KType` API は、Java 固有の部分を除き、Kotlin/JS で完全にサポートされています。

## KClass and createInstance() {id="kclass-and-createinstance"}

[KClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/) インターフェースの [`createInstance()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.full/create-instance.html) 関数は、指定されたクラスの新しいインスタンスを作成します。これは、Kotlin クラスへの実行時参照を取得する際に役立ちます。

## 例 {id="example"}

Kotlin/JS でのリフレクションの使用例を以下に示します。

```kotlin
open class Shape
class Rectangle : Shape()

inline fun <reified T> accessReifiedTypeArg() =
    println(typeOf<T>().toString())

fun main() {
    val s = Shape()
    val r = Rectangle()

    println(r::class.simpleName) // "Rectangle" を出力
    println(Shape::class.simpleName) // "Shape" を出力
    println(Shape::class.js.name) // "Shape" を出力

    println(Shape::class.isInstance(r)) // "true" を出力
    println(Rectangle::class.isInstance(s)) // "false" を出力
    val rShape = Shape::class.cast(r) // Rectangle "r" を Shape にキャスト

    accessReifiedTypeArg<Rectangle>() // typeOf() 経由で型にアクセス。"Rectangle" を出力
}
```