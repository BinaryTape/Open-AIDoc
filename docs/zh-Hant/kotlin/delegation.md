[//]: # (title: 委派)

[委派模式](https://en.wikipedia.org/wiki/Delegation_pattern)已被證明是實作繼承的一個良好替代方案，而 Kotlin 原生支援此模式且不需要任何樣板程式碼。

`Derived` 類別可以透過將其所有公有成員委派給指定物件來實作 `Base` 介面：

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

`Derived` 的超型別清單中的 `by` 子句表示 `b` 將在內部儲存於 `Derived` 物件中，且編譯器會產生 `Base` 的所有方法並轉發給 `b`。

## 覆寫透過委派實作的介面成員 {id="overriding-a-member-of-an-interface-implemented-by-delegation"}

[覆寫](inheritance.md#overriding-methods)的運作方式如你預期：編譯器會使用你的 `override` 實作，而非委派物件中的實作。如果你想在 `Derived` 中加入 `override fun printMessage() { print("abc") }`，當呼叫 `printMessage` 時，程式會印出 *abc* 而非 *10*：

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

但請注意，以這種方式覆寫的成員不會從委派物件的成員中被呼叫，委派物件只能存取其自身對介面成員的實作：

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
    // 此屬性無法從 b 的 `print()` 實作中存取
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

進一步了解[委派屬性](delegated-properties.md)。