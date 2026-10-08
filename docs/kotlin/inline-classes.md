[//]: # (title: 内联值类)

有时将值包装在类中以创建更具体的领域特定类型非常有用。然而，由于额外的堆分配，这会引入运行时开销。此外，如果被包装的类型是基元类型，性能损失会非常显著，因为基元类型通常被运行时高度优化，而它们的包装器不会得到任何特殊处理。

为了解决此类问题，Kotlin 引入了一种特殊的类，称为 *内联类 (inline class)*。内联类是 [基于值的类 (value-based classes)](https://github.com/Kotlin/KEEP/blob/master/notes/value-classes.md) 的子集。它们没有标识 (identity)，并且只能持有值。

要声明内联类，请在类名之前使用 `value` 修饰符：

```kotlin
value class Password(private val s: String)
```

要为 JVM 后端声明内联类，请在类声明前使用 `value` 修饰符并配合 `@JvmInline` 注解： 

```kotlin
// 适用于 JVM 后端
@JvmInline
value class Password(private val s: String)
```

内联类必须在主构造函数中初始化单个属性。在运行时，内联类的实例将使用此单个属性表示（详见下文关于运行时[表示](#representation)的内容）：

```kotlin
// 不会发生类 'Password' 的实际实例化
// 在运行时 'securePassword' 仅包含 'String'
val securePassword = Password("Don't try this in production") 
```

这是内联类的主要特征，也是 *内联 (inline)* 这一名称的灵感来源：类的数据被 *内联* 到其使用处（类似于 [内联函数](inline-functions.md) 的内容被内联到调用站点的方式）。

## 成员 {id="members"}

内联类支持常规类的一些功能。特别是，允许它们声明属性和方法，拥有 `init` 块和 [次构造函数](classes.md#secondary-constructors)：

```kotlin
@JvmInline
value class Person(private val fullName: String) {
    init {
        require(fullName.isNotEmpty()) {
            "Full name shouldn't be empty"
        }
    }

    constructor(firstName: String, lastName: String) : this("$firstName $lastName") {
        require(lastName.isNotBlank()) {
            "Last name shouldn't be empty"
        }
    }

    val length: Int
        get() = fullName.length

    fun greet() {
        println("Hello, $fullName")
    }
}

fun main() {
    val name1 = Person("Kotlin", "Mascot")
    val name2 = Person("Kodee")
    name1.greet() // `greet()` 方法作为静态方法被调用
    println(name2.length) // 属性 getter 作为静态方法被调用
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.9"}

内联类属性不能有 [支持字段](properties.md#backing-fields)。它们只能有简单的可计算属性（不能有 `lateinit` 属性或委托属性）。

## 继承 {id="inheritance"}

允许内联类继承自接口：

```kotlin
interface Printable {
    fun prettyPrint(): String
}

@JvmInline
value class Name(val s: String) : Printable {
    override fun prettyPrint(): String = "Let's $s!"
}

fun main() {
    val name = Name("Kotlin")
    println(name.prettyPrint()) // 仍作为静态方法调用
}
```

内联类禁止参与类层次结构。这意味着内联类不能扩展其他类，而且始终是 `final` 的。

## 表示 {id="representation"}

在生成的代码中，Kotlin 编译器为每个内联类保留一个 *包装器 (wrapper)*。内联类实例在运行时可以表示为包装器，也可以表示为底层类型。这类似于 `Int` 如何既可以 [表示](numbers.md#boxing-and-caching-numbers-on-the-java-virtual-machine) 为基元类型 `int`，也可以表示为包装器 `Integer`。

Kotlin 编译器将优先使用底层类型而不是包装器，以生成最自然、性能最强且经过优化的代码。然而，有时保留包装器是必要的。根据经验，每当内联类被用作另一种类型时，它们就会被装箱 (boxed)。

```kotlin
interface I

@JvmInline
value class Foo(val i: Int) : I

fun asInline(f: Foo) {}
fun <T> asGeneric(x: T) {}
fun asInterface(i: I) {}
fun asNullable(i: Foo?) {}

fun <T> id(x: T): T = x

fun main() {
    val f = Foo(42) 
    
    asInline(f)    // 未装箱：作为 Foo 本身使用
    asGeneric(f)   // 已装箱：作为泛型类型 T 使用
    asInterface(f) // 已装箱：作为类型 I 使用
    asNullable(f)  // 已装箱：作为 Foo? 使用，这与 Foo 不同
    
    // 在下文中，'f' 首先被装箱（传递给 'id' 时），然后被拆箱（从 'id' 返回时）
    // 最后，'c' 包含拆箱后的表示（即 '42'），与 'f' 一样
    val c = id(f)  
}
```

因为内联类既可以表示为底层值，也可以表示为包装器，所以 [引用相等性](equality.md#referential-equality) 对于它们来说没有意义，因此是被禁止的。

内联类也可以将泛型类型形参作为底层类型。在这种情况下，编译器将其映射到 `Any?`，或者通常映射到类型形参的上界。

```kotlin
@JvmInline
value class UserId<T>(val value: T)

fun compute(s: UserId<String>) {} // 编译器生成 fun compute-<hashcode>(s: Any?)
```

### 修饰 {id="mangling"}

由于内联类被编译为其底层类型，这可能会导致各种难以发现的错误，例如意外平台签名冲突：

```kotlin
@JvmInline
value class UInt(val x: Int)

// 在 JVM 上表示为 'public final void compute(int x)'
fun compute(x: Int) { }

// 在 JVM 上也表示为 'public final void compute(int x)'！
fun compute(x: UInt) { }
```

为了缓解此类问题，使用内联类的函数会通过在函数名中添加稳定的哈希码来进行 *修饰 (mangled)*。因此，`fun compute(x: UInt)` 将表示为 `public final void compute-<hashcode>(int x)`，从而解决了冲突问题。

### 从 Java 代码中调用 {id="calling-from-java-code"}

你可以从 Java 代码中调用接受内联类的函数。为此，你应该手动禁用修饰：在函数声明前添加 `@JvmName` 注解：

```kotlin
@JvmInline
value class UInt(val x: Int)

fun compute(x: Int) { }

@JvmName("computeUInt")
fun compute(x: UInt) { }
```

默认情况下，Kotlin 使用 **拆箱表示 (unboxed representations)** 编译内联类，这使得它们难以从 Java 访问。要了解如何将内联类编译为可从 Java 访问的 **装箱表示 (boxed representations)**，请参阅 [从 Java 调用 Kotlin](java-to-kotlin-interop.md#inline-value-classes) 指南。

## 内联类与类型别名 {id="inline-classes-vs-type-aliases"}

乍一看，内联类似乎与 [类型别名](type-aliases.md) 非常相似。事实上，两者似乎都引入了一个新类型，并且在运行时都将表示为底层类型。

然而，关键区别在于，类型别名与其底层类型（以及具有相同底层类型的其他类型别名）是 *赋值兼容 (assignment-compatible)* 的，而内联类则不然。

换句话说，内联类引入了一个真正的 *新* 类型，而类型别名仅为现有类型引入了一个替代名称（别名）：

```kotlin
typealias NameTypeAlias = String

@JvmInline
value class NameInlineClass(val s: String)

fun acceptString(s: String) {}
fun acceptNameTypeAlias(n: NameTypeAlias) {}
fun acceptNameInlineClass(p: NameInlineClass) {}

fun main() {
    val nameAlias: NameTypeAlias = ""
    val nameInlineClass: NameInlineClass = NameInlineClass("")
    val string: String = ""

    acceptString(nameAlias) // 成功：传递别名代替底层类型
    acceptString(nameInlineClass) // 失败：不能传递内联类代替底层类型

    // 反之亦然：
    acceptNameTypeAlias(string) // 成功：传递底层类型代替别名
    acceptNameInlineClass(string) // 失败：不能传递底层类型代替内联类
}
```

## 内联类与委托 {id="inline-classes-and-delegation"}

允许通过接口将实现委托给内联类的内联值：

```kotlin
interface MyInterface {
    fun bar()
    fun foo() = "foo"
}

@JvmInline
value class MyInterfaceWrapper(val myInterface: MyInterface) : MyInterface by myInterface

fun main() {
    val my = MyInterfaceWrapper(object : MyInterface {
        override fun bar() {
            // 方法体
        }
    })
    println(my.foo()) // 打印 "foo"
}
```
