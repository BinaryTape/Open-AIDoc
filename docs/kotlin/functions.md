[//]: # (title: 函数)

要在 Kotlin 中声明一个函数：
* 使用 `fun` 关键字。
* 在圆括号 `()` 中指定形参。
* 如果需要，包含 [返回值类型](#return-types)。

例如：

```kotlin
//sampleStart
// 'double' 是函数的名称
// 'x' 是 Int 类型的形参
// 预期的返回值也是 Int 类型
fun double(x: Int): Int {
    return 2 * x
}
//sampleEnd

fun main() {
    println(double(5))
    // 10
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false" id="kotlin-function-double"}

## 函数用法

调用函数使用标准方式：

```kotlin
val result = double(2)
```

要调用[成员函数](classes.md)或[扩展函数](extensions.md#extension-functions)，请使用点号 `.`：

```kotlin
// 创建 Stream 类的实例并调用 read()
Stream().read()
```

### 形参

使用 Pascal 表示法声明函数形参：`name: Type`。
必须使用逗号分隔形参，并显式给出每个形参的类型：

```kotlin
fun powerOf(number: Int, exponent: Int): Int { /*...*/ }
```

在函数体内，接收到的实参是只读的（隐式声明为 `val`）：

```kotlin
fun powerOf(number: Int, exponent: Int): Int {
    number = 2 // 错误：'val' 不能被重新赋值。
}
```

声明函数形参时可以使用[尾随逗号](coding-conventions.md#trailing-commas)：

```kotlin
fun powerOf(
    number: Int,
    exponent: Int, // 尾随逗号
) { /*...*/ }
```

尾随逗号有助于重构和代码维护：
你可以移动声明中的形参，而无需担心哪个是最后一个。

> Kotlin 函数可以接收其他函数作为形参——并可以作为实参传递。
> 要了解更多信息，请参阅 [](lambdas.md)。
> 
{style="note"}

### 带有默认值的形参 {id="parameters-with-default-values"}

你可以通过为函数形参指定默认值使其成为可选的。
当你调用函数而未提供与该形参对应的实参时，Kotlin 会使用默认值。
带有默认值的形参也称为*可选参数*。

可选参数减少了对多个重载的需求，因为你不需要仅仅为了允许跳过具有合理默认值的形参而声明函数的不同版本。

通过在形参声明后附加 `=` 来设置默认值：

```kotlin
fun read(
    b: ByteArray,
    // 'off' 的默认值为 0
    off: Int = 0,
    // 'len' 的默认值通过计算得出
    // 即 'b' 数组的大小
    len: Int = b.size,
) { /*...*/ }
```

当你在不带默认值的形参之前声明一个**带有**默认值的形参时，只能通过[命名实参](#named-arguments)来使用默认值：

```kotlin
fun greeting(
    userId: Int = 0,
    message: String,
) { /*...*/ }

fun main() {
    // 使用 0 作为 'userId' 的默认值
    greeting(message = "Hello!")
    
    // 错误：未为形参 'message' 传递值
    greeting("Hello!")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false" id="default-before-ordinary"}

[尾随 lambda](lambdas.md#passing-trailing-lambdas) 是此规则的一个例外，
因为最后一个形参必须对应于传递的函数：

```kotlin
fun main () {
//sampleStart    
fun greeting(
    userId: Int = 0,
    message: () -> Unit,
)
{ println(userId)
  message() }
    
// 使用 'userId' 的默认值
greeting() { println ("Hello!") }
// 0
// Hello!
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="default-before-trailing-lambda"}

[重写方法](inheritance.md#overriding-methods)始终使用基方法的默认形参值。
当你重写具有默认形参值的方法时，必须从签名中省略默认形参值：

```kotlin
open class Shape {
    open fun draw(width: Int = 10, height: Int = 5) { /*...*/ }
}

class Rectangle : Shape() {
    // 此处不允许指定默认值
    // 但此函数默认情况下
    // 也会为 'width' 使用 10，为 'height' 使用 5。
    override fun draw(width: Int, height: Int) { /*...*/ }
}
```

#### 非常量表达式作为默认值

你可以为形参分配一个非常量的默认值。
例如，默认值可以是函数调用的结果或使用其他实参值的计算结果，
如本例中的 `len` 形参：

```kotlin
fun read(
    b: ByteArray,
    off: Int = 0,
    len: Int = b.size,
) { /*...*/ }
```

引用其他形参值的形参必须在顺序上声明在后。
在此示例中，`len` 必须声明在 `b` 之后。

通常，你可以分配任何表达式作为形参的默认值。
然而，只有在调用函数**没有**对应形参且需要分配默认值时，才会计算默认值。
例如，此函数仅在调用时不带 `print` 形参时才打印出一行内容：

```kotlin
fun main() {
//sampleStart
    fun read(
        b: Int,
        print: Unit? = println("No argument passed for 'print'")
    ) { println(b) }
    
    // 打印 "No argument passed for 'print'"，然后打印 "1"
    read(1)
    // 仅打印 "1"
    read(1, null)
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="non-constant-default"}

如果函数声明中的最后一个形参是函数类型，
你可以将对应的 [lambda](lambdas.md#lambda-expression-syntax) 实参作为命名实参传递，或在[圆括号之外](lambdas.md#passing-trailing-lambdas)传递：

```kotlin
fun main() {
    //sampleStart
    fun log(
        level: Int = 0,
        code:  Int = 1,
        action: () -> Unit,
    ) { println (level)
        println (code)
        action() }
    
    // 为 'level' 传递 1，并为 'code' 使用默认值 1
    log(1) { println("Connection established") }
    
    // 使用两个默认值，'level' 为 0，'code' 为 1
    log(action = { println("Connection established") })
    
    // 等同于上一个调用，使用两个默认值
    log { println("Connection established") }
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="lambda-outside-parentheses"}

### 命名实参

在调用函数时，你可以命名一个或多个其实参。
当函数调用具有许多实参时，这会很有帮助。
在这些情况下，很难将值与实参关联起来，特别是如果是 `null` 或布尔值。

在函数调用中使用命名实参时，你可以按任何顺序排列它们。

考虑 `reformat()` 函数，它有 4 个带有默认值的实参：

```kotlin
fun reformat(
    str: String,
    normalizeCase: Boolean = true,
    upperCaseFirstLetter: Boolean = true,
    divideByCamelHumps: Boolean = false,
    wordSeparator: Char = ' ',
) { /*...*/ }
```

调用此函数时，你可以命名部分实参：

```kotlin
reformat(
    "String!",
    normalizeCase = false,
    upperCaseFirstLetter = false,
    divideByCamelHumps = true,
    '_'
)
```

你可以跳过所有带有默认值的实参：

```kotlin
reformat("This is a long String!")
```

你也可以跳过*部分*带有默认值的实参，而不是全部省略。
但是，在第一个跳过的实参之后，必须命名所有后续实参：

```kotlin
reformat(
    "This is a short String!",
    upperCaseFirstLetter = false,
    wordSeparator = '_'
)
```

你可以通过命名对应的实参来传递[可变数量实参](#variable-number-of-arguments-varargs) (`vararg`)。
在此示例中，它是一个数组：

```kotlin
fun mergeStrings(vararg strings: String) { /*...*/ }

mergeStrings(strings = arrayOf("a", "b", "c"))
```

<!-- Rationale for named arguments interaction with varargs is here https://youtrack.jetbrains.com/issue/KT-52505#focus=Comments-27-6147916.0-0 -->

> 在 JVM 上调用 Java 函数时，不能使用命名实参语法，因为 Java 字节码并不总是保留函数形参的名称。
>
{style="note"}

### 返回值类型

当你声明具有代码块体的函数时（通过将指令放在花括号 `{}` 中），
必须始终显式指定返回值类型。
唯一的例外是当它们返回 `Unit` 时，
[在这种情况下指定返回值类型是可选的](#unit-returning-functions)。

Kotlin 不会为具有代码块体的函数推断返回值类型。
它们的控制流可能很复杂，这使得返回值类型对阅读者甚至对编译器都不清晰。
但是，如果你不指定，Kotlin 可以为[单表达式函数](#single-expression-functions)推断返回值类型。

### 单表达式函数

当函数体由单个表达式组成时，可以省略花括号并在 `=` 符号后指定主体：

```kotlin
fun double(x: Int): Int = x * 2
```

大多数情况下，你无需显式声明[返回值类型](#return-types)：

```kotlin
// 编译器推断该函数返回 Int
fun double(x: Int) = x * 2
```

编译器在从单个表达式推断返回值类型时有时可能会遇到问题。
在这种情况下，你应该显式添加返回值类型。
例如，递归或互相递归（互相调用）的函数，
以及带有无类型表达式（如 `fun empty() = null`）的函数始终需要返回值类型。

当你使用推断的返回值类型时，
请务必检查实际结果，因为编译器推断出的类型可能对你来说用处不大。
在上面的示例中，如果你希望 `double()` 函数返回 `Number` 而不是 `Int`，
则必须显式声明这一点。

### 返回 Unit 的函数

如果函数具有代码块体（花括号 `{}` 内的指令）并且不返回有用的值，
编译器会假定其返回值类型为 `Unit`。
`Unit` 是一种只有唯一值的类型，该值也称为 `Unit`。

你不需要将 `Unit` 指定为返回值类型，除非是函数类型形参。
你永远不需要显式返回 `Unit`。

例如，你可以声明一个 `printHello()` 函数而不返回 `Unit`：

```kotlin
// 函数类型形参 ('action') 的声明仍然需要显式的返回值类型
fun printHello(name: String?, action: () -> Unit) {
    if (name != null)
        println("Hello $name")
    else
        println("Hi there!")

    action()
}

fun main() {
    printHello("Kodee") {
        println("This runs after the greeting.")
    }
    // Hello Kodee
    // This runs after the greeting.

    printHello(null) {
        println("No name provided, but action still runs.")
    }
    // No name provided, but action still runs
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false" id="return-unit-implicit"}

这等同于以下详细声明：

```kotlin
//sampleStart
fun printHello(name: String?, action: () -> Unit): Unit {
    if (name != null)
        println("Hello $name")
    else
        println("Hi there!")

    action()
    return Unit
}
//sampleEnd
fun main() {
    printHello("Kodee") {
        println("This runs after the greeting.")
    }
    // Hello Kodee
    // This runs after the greeting.

    printHello(null) {
        println("No name provided, but action still runs.")
    }
    // No name provided, but action still runs
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false" id="return-unit-explicit"}

如果显式指定了函数的返回值类型，你可以在表达式体内使用 `return` 语句：

```kotlin
fun getDisplayNameOrDefault(userId: String?): String =
    getDisplayName(userId ?: return "default")
```

### 可变数量实参 (varargs)

要向函数传递可变数量的实参，你可以用 `vararg` 修饰符标记其形参之一
（通常是最后一个）。
在函数内部，你可以将 `T` 类型的 `vararg` 形参用作 `T` 的数组：

```kotlin
fun <T> asList(vararg ts: T): List<T> {
    val result = ArrayList<T>()
    for (t in ts) // ts 是一个 Array
        result.add(t)
    return result
}
```

然后你可以向该函数传递可变数量的实参：

```kotlin
fun <T> asList(vararg ts: T): List<T> {
    val result = ArrayList<T>()
    for (t in ts) // ts 是一个 Array
        result.add(t)
    return result
}

fun main() {
    //sampleStart
    val list = asList(1, 2, 3)
    println(list)
    // [1, 2, 3]
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false" id="varargs-aslist"}

只能有一个形参标记为 `vararg`。
如果你在形参列表的非末位位置声明 `vararg` 形参，则必须使用命名实参为后续形参传递值。
如果形参具有函数类型，你也可以通过将 lambda 放在圆括号外来传递其值。

当你调用 `vararg` 函数时，可以逐个传递实参，如 `asList(1, 2, 3)` 示例中所示。
如果你已经有一个数组并希望将其内容作为 `vararg` 形参或其一部分传递给函数，
请使用[扩展运算符](arrays.md#pass-variable-number-of-arguments-to-a-function)，在数组名称前加 `*`：

```kotlin
fun <T> asList(vararg ts: T): List<T> {
    val result = ArrayList<T>()
    for (t in ts)
        result.add(t)
    return result
}

fun main() {
    //sampleStart
    val a = arrayOf(1, 2, 3)

    // 函数接收数组 [-1, 0, 1, 2, 3, 4]
    list = asList(-1, 0, *a, 4)

    println(list)
    // [-1, 0, 1, 2, 3, 4]
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false" id="varargs-aslist-with-array"}

如果你想将[原生类型数组](arrays.md#primitive-type-arrays)
作为 `vararg` 传递，你需要使用 [`.toTypedArray()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/to-typed-array.html) 函数将其转换为常规（类型化）数组：

```kotlin
// 'a' 是一个 IntArray，它是一个原生类型数组
val a = intArrayOf(1, 2, 3)
val list = asList(-1, 0, *a.toTypedArray(), 4)
```

### 中缀表示法

你可以通过使用 `infix` 关键字声明无需圆括号或点号即可调用的函数。
这有助于使代码中的简单函数调用更容易阅读。

```kotlin
infix fun Int.shl(x: Int): Int { /*...*/ }

// 使用常规表示法调用函数
1.shl(2)

// 使用中缀表示法调用函数
1 shl 2
```

中缀函数必须满足以下要求：

* 它们必须是类的成员函数或[扩展函数](extensions.md)。
* 它们必须具有单个形参。
* 形参不能[接受可变数量的实参](#variable-number-of-arguments-varargs) (`vararg`)，且必须没有[默认值](#parameters-with-default-values)。

> 中缀函数调用的优先级低于算术运算符、类型转换和 `rangeTo` 运算符。
> 以下表达式是等效的：
> * `1 shl 2 + 3` 等同于 `1 shl (2 + 3)`
> * `0 until n * 2` 等同于 `0 until (n * 2)`
> * `xs union ys as Set<*>` 等同于 `xs union (ys as Set<*>)`
>
> 另一方面，中缀函数调用的优先级高于布尔运算符 `&&` 和 `||`、`is` 和 `in` 检查以及某些其他运算符。这些表达式也是等效的：
> * `a && b xor c` 等同于 `a && (b xor c)`
> * `a xor b in c` 等同于 `(a xor b) in c`
>
{style="note"}

请注意，中缀函数始终需要显式指定接收器和形参。
当你使用中缀表示法在当前接收器上调用方法时，请显式使用 `this`。
这可确保解析无歧义。

```kotlin
class MyStringCollection {
    val items = mutableListOf<String>()

    infix fun add(s: String) {
        println("Adding: $s")
        items += s
    }

    fun build() {
        add("first")      // 正确：普通函数调用
        this add "second" // 正确：带有显式接收器的中缀调用
        // add "third"    // 编译器错误：需要显式接收器
    }

    fun printAll() = println("Items = $items")
}

fun main() {
    val myStrings = MyStringCollection()
    // 将 "first" 和 "second" 添加到列表两次
    myStrings.build()
      
    myStrings.printAll()
    // Adding: first
    // Adding: second
    // Items = [first, second]
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="infix-notation-example"}

## 函数作用域

你可以在文件的顶级声明 Kotlin 函数，这意味着你不需要创建一个类来持有函数。
函数也可以在局部声明为*成员函数*或*扩展函数*。

### 局部函数

Kotlin 支持局部函数，即在其他函数内部声明的函数。
例如，以下代码实现了给定图的深度优先搜索算法。
外部 `dfs()` 函数内部的局部 `dfs()` 函数用于隐藏实现并处理递归调用：

```kotlin
class Person(val name: String) {
    val friends = mutableListOf<Person>()
}
class SocialGraph(val people: List<Person>)
//sampleStart
fun dfs(graph: SocialGraph) {
    fun dfs(current: Person, visited: MutableSet<Person>) {
        if (!visited.add(current)) return
        println("Visited ${current.name}")
        for (friend in current.friends)
            dfs(friend, visited)
    }
    dfs(graph.people[0], HashSet())
}
//sampleEnd
fun main() {
    val alice = Person("Alice")
    val bob = Person("Bob")
    val charlie = Person("Charlie")
    alice.friends += bob
    bob.friends += charlie
    charlie.friends += alice
    val network = SocialGraph(listOf(alice, bob, charlie))
    dfs(network)
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="local-functions-dfs"}

局部函数可以访问外部函数的局部变量（闭包）。
在上述情况下，`visited` 函数形参可以是一个局部变量：

```kotlin
class Person(val name: String) {
    val friends = mutableListOf<Person>()
}
class SocialGraph(val people: List<Person>)
//sampleStart
fun dfs(graph: SocialGraph) {
    val visited = HashSet<Person>()
    fun dfs(current: Person) {
        if (!visited.add(current)) return
        println("Visited ${current.name}")
        for (friend in current.friends)
            dfs(friend)
    }
    dfs(graph.people[0])
}
//sampleEnd
fun main() {
    val alice = Person("Alice")
    val bob = Person("Bob")
    val charlie = Person("Charlie")
    alice.friends += bob
    bob.friends += charlie
    charlie.friends += alice
    val network = SocialGraph(listOf(alice, bob, charlie))
    dfs(network)
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="local-functions-dfs-with-local-variable"}

### 成员函数

成员函数是在类或对象内部定义的函数：

```kotlin
class Sample {
    fun foo() { print("Foo") }
}
```

要调用成员函数，请编写实例或对象名称，然后添加 `.` 并编写函数名称：

```kotlin
// 创建 Stream 类的实例并调用 read()
Stream().read()
```

有关类和重写成员的更多信息，请参阅[类](classes.md)和[继承](classes.md#inheritance)。

## 泛型函数

你可以通过在函数名称之前使用尖括号 `<>` 来为函数指定泛型形参：

```kotlin
fun <T> singletonList(item: T): List<T> { /*...*/ }
```

有关泛型函数的更多信息，请参阅[泛型](generics.md)。

## 尾递归函数

Kotlin 支持一种称为[尾递归](https://en.wikipedia.org/wiki/Tail_call)的函数式编程风格。
对于某些通常会使用循环的算法，你可以改用递归函数，而没有栈溢出的风险。
当一个函数被标记为 `tailrec` 修饰符并满足所需的正式条件时，编译器会优化递归，留下一个快速且高效的基于循环的版本：

```kotlin
import kotlin.math.cos
import kotlin.math.abs

// 任意的“足够好”的精度
val eps = 1E-10

tailrec fun findFixPoint(x: Double = 1.0): Double =
    if (abs(x - cos(x)) < eps) x else findFixPoint(cos(x))
```

此代码计算余弦的不动点（一个数学常数）。
该函数从 `1.0` 开始重复调用 `cos()`，直到结果不再变化，
对于指定的 `eps` 精度，结果为 `0.7390851332151611`。
该代码等同于这种更传统的风格：

```kotlin
import kotlin.math.cos
import kotlin.math.abs

// 任意的“足够好”的精度
val eps = 1E-10

private fun findFixPoint(): Double {
    var x = 1.0
    while (true) {
        val y = cos(x)
        if (abs(x - y) < eps) return x
        x = cos(x)
    }
}
```

仅当函数将其自身调用作为其最后一次操作时，才能对该函数应用 `tailrec` 修饰符。
当递归调用之后还有更多代码、在 [`try`/`catch`/`finally` 代码块](exceptions.md#handle-exceptions-using-try-catch-blocks)内、
或当函数是 [open](inheritance.md) 的时候，不能使用尾递归。

**另请参阅**：
* [内联函数](inline-functions.md)
* [扩展函数](extensions.md)
* [高阶函数与 lambda](lambdas.md)