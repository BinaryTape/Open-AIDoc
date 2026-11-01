[//]: # (title: 相等)

在 Kotlin 中，有两种类型的相等性：

* _结构_ 相等（`==`）—— 对 `equals()` 函数的检查
* _引用_ 相等（`===`）—— 检查两个引用是否指向同一个对象

## 结构相等 {id="structural-equality"}

结构相等用于验证两个对象是否具有相同的内容或结构。结构相等通过 `==` 操作及其求反的对应操作 `!=` 来检查。
按照约定，形如 `a == b` 的表达式会被转换为：

```kotlin
a?.equals(b) ?: (b === null)
```

如果 `a` 不为 `null`，则调用 `equals(Any?)` 函数。否则（`a` 为 `null`），检查 `b` 是否在引用上等于 `null`：

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

请注意，在显式与 `null` 比较时，尝试优化代码是没有意义的：
`a == null` 会自动转换为 `a === null`。

在 Kotlin 中，所有类都从 `Any` 类继承了 `equals()` 函数。默认情况下，`equals()` 函数实现的是[引用相等](#referential-equality)。不过，Kotlin 中的类可以重写 `equals()` 函数以提供自定义相等性逻辑，并通过这种方式实现结构相等。

Value 类与数据类（data class）是两种会自动重写 `equals()` 函数的特定 Kotlin 类型。
这就是它们默认实现结构相等的原因。

但是，对于数据类，如果在父类中 `equals()` 函数被标记为 `final`，则其行为保持不变。

与之不同的是，非数据类（未声明 `data` 修饰符的类）默认不会重写 `equals()` 函数。相反，非数据类实现的是从 `Any` 类继承的引用相等行为。
要实现结构相等，非数据类需要通过自定义相等性逻辑来重写 `equals()` 函数。

若要提供自定义的 equals 检查实现，请重写 [`equals(other: Any?): Boolean`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-any/equals.html) 函数：

```kotlin
class Point(val x: Int, val y: Int) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Point) return false

        // 比较属性以进行结构相等判断
        return this.x == other.x && this.y == other.y
    }
}
```
> 重写 equals() 函数时，还应当重写 [hashCode() 函数](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-any/hash-code.html)，以保持相等性与哈希之间的一致性，并确保这些函数的行为正确。
>
{style="note"}

具有相同名称但签名不同（如 `equals(other: Foo)`）的函数不会影响使用运算符 `==` 和 `!=` 进行的相等性检查。

结构相等与 `Comparable<...>` 接口定义的比较无关，因此只有自定义的 `equals(Any?)` 实现才会影响该运算符的行为。

## 引用相等 {id="referential-equality"}

引用相等用于验证两个对象的内存地址，以确定它们是否为同一个实例。

引用相等通过 `===` 操作及其求反的对应操作 `!==` 来检查。当且仅当 `a` 和 `b` 指向同一个对象时，`a === b` 的求值结果才为 true：

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

对于在运行时由原生类型（例如 `Int`）表示的值，`===` 相等性检查等同于 `==` 检查。

> 引用相等在 Kotlin/JS 中的实现有所不同。有关相等性的更多信息，请参阅 [Kotlin/JS](js-interop.md#equality) 文档。
>
{style="tip"}

## 浮点数相等 {id="floating-point-numbers-equality"}

当相等性检查的操作数静态已知为 `Float` 或 `Double`（无论是否可空）时，该检查遵循 [IEEE 754 浮点数算术标准](https://en.wikipedia.org/wiki/IEEE_754)。

对于未静态类型化为浮点数的操作数，其行为有所不同。在这些情况下，实现的是结构相等。因此，未静态类型化为浮点数的操作数的检查与 IEEE 标准有所差异。在这种情况下：

* `NaN` 等于其自身
* `NaN` 大于任何其他元素（包括 `POSITIVE_INFINITY`）
* `-0.0` 不等于 `0.0`

更多信息请参阅[浮点数比较](numbers.md#floating-point-number-comparison)。

## 数组相等 {id="array-equality"}

若要比较两个数组是否包含相同顺序的相同元素，请使用 [`contentEquals()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/content-equals.html)。

更多信息请参阅[比较数组](arrays.md#compare-arrays)。