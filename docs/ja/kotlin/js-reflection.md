[//]: # (title: Kotlin/JS のリフレクション)

Kotlin/JS は、Kotlin の[リフレクション API](reflection.md)を限定的にサポートしています。サポートされている API は以下の部分のみです：

* [クラス参照](reflection.md#class-references) (`::class`)
* [`KType` と `typeof()`](#ktype-and-typeof)
* [`KClass` と `createInstance()`](#kclass-and-createinstance)

## クラス参照 {id="class-references"}

`::class` 構文は、インスタンスのクラス、または指定された型に対応するクラスへの参照を返します。
Kotlin/JS では、`::class` 式の値は、以下のみをサポートする簡略化された [KClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/) 実装となります：
* [simpleName](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/simple-name.html) および [isInstance()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/is-instance.html) メンバ。
* [cast()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/cast.html) および [safeCast()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/safe-cast.html) 拡張関数。

これに加えて、[KClass.js](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/js.html) を使用して、クラスに対応する [JsClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-js-class/index.html) インスタンスにアクセスできます。
`JsClass` インスタンス自体は、コンストラクタ関数への参照です。
これは、コンストラクタへの参照を期待する JS 関数と相互運用するために使用できます。

## KType と typeOf() {id="ktype-and-typeof"}

[`typeof()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/type-of.html) 関数は、指定された型の [`KType`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-type/) インスタンスを構築します。
KType API は、Java 固有の部分を除き、Kotlin/JS で完全にサポートされています。

## KClass と createInstance() {id="kclass-and-createinstance"}

[KClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/) インターフェースの [`createInstance()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.full/create-instance.html) 関数は、指定されたクラスの新しいインスタンスを作成します。これは、Kotlin クラスへの実行時参照を取得するのに便利です。

## 例 {id="example"}

以下は、Kotlin/JS におけるリフレクションの使用例です。

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
