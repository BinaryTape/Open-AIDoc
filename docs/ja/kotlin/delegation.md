[//]: # (title: 委譲)

[委譲パターン (Delegation pattern)](https://en.wikipedia.org/wiki/Delegation_pattern) は、実装継承に代わる優れた手法であることが証明されており、Kotlin はボイラープレートコードを一切必要とせずにこれをネイティブにサポートしています。

クラス `Derived` は、指定されたオブジェクトにすべての公開メンバを委譲することで、インターフェース `Base` を実装できます。

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

`Derived` のスーパータイプリストにある `by` 句は、`b` が `Derived` オブジェクトの内部に格納され、コンパイラが `Base` のすべてのメソッドを `b` へ転送するように生成することを表します。

## 委譲によって実装されたインターフェースのメンバのオーバーライド {id="overriding-a-member-of-an-interface-implemented-by-delegation"}

[オーバーライド](inheritance.md#overriding-methods)は期待通りに動作します。コンパイラは委譲先オブジェクト内の実装ではなく、あなたの `override` 実装を使用します。`Derived` に `override fun printMessage() { print("abc") }` を追加した場合、`printMessage` が呼び出されると、プログラムは *10* ではなく *abc* を出力します。

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

ただし、このようにオーバーライドされたメンバは、委譲先オブジェクトのメンバからは呼び出されないことに注意してください。委譲先オブジェクトは、インターフェースメンバの自身の内部実装にしかアクセスできません。

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
    // このプロパティは、b の `print()`
    // 実装からはアクセスできません
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

[委譲プロパティ (delegated properties)](delegated-properties.md) についての詳細も参照してください。