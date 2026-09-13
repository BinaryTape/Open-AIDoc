[//]: # (title: 委托)

[委托模式](https://en.wikipedia.org/wiki/Delegation_pattern)已被证明是实现继承的一个很好的替代方案，Kotlin 原生支持该模式且无需任何模板代码。

类 `Derived` 可以实现接口 `Base`，通过将其所有的公有成员委托给一个指定对象：

```kotlin
interface Base {
    fun print()
}

class BaseImpl(val x: Int) : Base {
    override fun print() { print(x) }
}

class Derived(b: Base) : Base by b

fun main() {
    val base = BaseImpl(10)
    val derived = Derived(base) 
    
    derived.print()
    // 10
}
```
{kotlin-runnable="true"}

`Derived` 的超类型列表中的 `by` 子句表示 `b` 将被存储在 `Derived` 对象的内部，并且编译器将生成 `Base` 的所有方法并转发给 `b`。

## 重写通过委托实现的接口成员 {id="overriding-a-member-of-an-interface-implemented-by-delegation"}

[重写](inheritance.md#overriding-methods)的工作方式与预期一致：编译器将使用你的 `override` 实现，而不是委托对象中的实现。如果你想向 `Derived` 添加 `override fun printMessage() { print("abc") }`，那么在调用 `printMessage` 时，程序将打印 *abc* 而不是 *10*：

```kotlin
interface Base {
    fun printMessage()
    fun printMessageLine()
}

class BaseImpl(val x: Int) : Base {
    override fun printMessage() { print(x) }
    override fun printMessageLine() { println(x) }
}

class Derived(b: Base) : Base by b {
    override fun printMessage() { println("abc") }
}

fun main() {
    val base = BaseImpl(10)
    val derived = Derived(base)

    derived.printMessage()
    // abc
    derived.printMessageLine()
    // 10
}
```
{kotlin-runnable="true"}

但请注意，以这种方式重写的成员不会从委托对象的成员中被调用，委托对象只能访问其自身对接口成员的实现：

```kotlin
interface Base {
    val message: String
    fun print()
}

class BaseImpl(x: Int) : Base {
    override val message = "BaseImpl: x = $x"
    override fun print() { println(message) }
}

class Derived(b: Base) : Base by b {
    // 无法从 b 的 `print()` 实现中
    // 访问此属性
    override val message = "Message of Derived"
}

fun main() {
    val base = BaseImpl(10)
    val derived = Derived(base)
    
    derived.print()
    // BaseImpl: x = 10
    println(derived.message)
    // Message of Derived
}
```
{kotlin-runnable="true"}

详细了解 [委托属性](delegated-properties.md)。