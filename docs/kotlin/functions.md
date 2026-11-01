[//]: # (title: 函数)

在 Kotlin 中声明函数：
* 使用 `fun` 关键字。
* 在圆括号 `()` 中指定形参。
* 如果需要，包含[返回值类型](#return-types)。

例如：

```kotlin
//sampleStart
// 'double' 是函数名称
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
{kotlin-runnable="true" validate="false" id="kotlin-function-double"}

## 函数用法 {id="function-usage"}

调用函数采用标准方法：

```kotlin
val result = double(2)
```

调用[成员函数](classes.md)或[扩展函数](extensions.md#extension-functions)时，使用点号 `.`：

```kotlin
// 创建 Stream 类的实例并调用 read()
Stream().read()
```

### 形参 {id="parameters"}

使用 Pascal 表示法声明函数形参：`name: Type`。
必须使用逗号分隔形参，并显式为每个形参指定类型：

```kotlin
fun powerOf(number: Int, exponent: Int): Int { /*...*/ }
```

向函数传递对象时，编译器会传递该对象引用的副本。
复制的引用指向同一个对象，因此函数可以修改该对象的可变状态。

在函数体内，函数形参是只读的（隐式声明为 `val`），因此无法对它们重新赋值：

```kotlin
class Counter(var value: Int)

fun reset(counter: Counter) {
    counter.value = 0    // 允许：修改了对象
    counter = Counter(0) // 错误：无法对 'val' 重新赋值
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
你可以在声明中移动形参，而不必担心哪一个是最后一个。

> Kotlin 函数可以接收其他函数作为形参——也可以作为实参传递。
> 欲了解更多信息，请参阅 [](lambdas.md)。
> 
{style="note"}

### 带默认值的形参 {id="parameters-with-default-values"}

你可以通过为函数形参指定默认值来使其变为可选参数。
如果在调用函数时没有提供与该形参对应的实参，Kotlin 就会使用默认值。
带默认值的形参也称为*可选形参*。

可选形参减少了对重载的需求，因为你无需仅仅为了允许跳过带有合理默认值的形参而声明函数的不同版本。

通过在形参声明后追加 `=` 来设置默认值：

```kotlin
fun read(
    b: ByteArray,
    // 'off' 的默认值为 0
    off: Int = 0,
    // 'len' 的默认值计算为
    // 'b' 数组的大小
    len: Int = b.size,
) { /*...*/ }
```

如果在**没有**默认值的形参之前声明了**带有**默认值的形参，
则只能通过[指定实参名称](#named-arguments)来使用该默认值：

```kotlin
fun greeting(
    userId: Int = 0,
    message: String,
) { /*...*/ }

fun main() {
    // 将 0 用作 'userId' 的默认值
    greeting(message = "Hello!")
    
    // 错误：未向形参 'message' 传递任何值
    greeting("Hello!")
}
```
{kotlin-runnable="true" validate="false" id="default-before-ordinary"}

[尾随 lambda](lambdas.md#passing-trailing-lambdas) 是该规则的一个例外，
因为最后一个形参必须与传递的函数相对应：

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
{kotlin-runnable="true" id="default-before-trailing-lambda"}

[重写方法](inheritance.md#overriding-methods)始终使用基类方法的默认形参值。
重写具有默认形参值的方法时，必须从签名中省略默认形参值：

```kotlin
open class Shape {
    open fun draw(width: Int = 10, height: Int = 5) { /*...*/ }
}

class Rectangle : Shape() {
    // 此处不允许指定默认值
    // 但该函数默认也会为 'width' 使用 10，
    // 为 'height' 使用 5。
    override fun draw(width: Int, height: Int) { /*...*/ }
}
```

#### 非常量表达式作为默认值 {id="non-constant-expressions-as-default-values"}

可以为形参分配非常量的默认值。
例如，默认值可以是函数调用的结果，也可以是使用其他实参值进行的计算，
如本例中的 `len` 形参：

```kotlin
fun read(
    b: ByteArray,
    off: Int = 0,
    len: Int = b.size,
) { /*...*/ }
```

引用其他形参值的形参必须在顺序上声明得更靠后。
在上述示例中，`len` 必须声明在 `b` 之后。

通常，你可以为形参的默认值指定任意表达式。
但是，只有在调用函数时**未提供**相应形参且需要分配默认值时，才会计算默认值。
例如，仅当在未提供 `print` 形参的情况下调用此函数时，它才会打印出一行内容：

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
{kotlin-runnable="true" id="non-constant-default"}

如果函数声明中的最后一个形参是函数类型，
你可以将对应的 [lambda](lambdas.md#lambda-expression-syntax) 实参作为具名实参传递，或者放在[圆括号之外](lambdas.md#passing-trailing-lambdas)传递：

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
    
    // 同时使用两个默认值：'level' 为 0，'code' 为 1
    log(action = { println("Connection established") })
    
    // 等同于前一个调用，同时使用两个默认值
    log { println("Connection established") }
    //sampleEnd
}
```
{kotlin-runnable="true" id="lambda-outside-parentheses"}

### 具名实参 {id="named-arguments"}

调用函数时，可以为一个或多个实参命名。
当函数调用具有许多实参时，这会很有帮助。
在这种情况下，很难将某个值与特定实参关联起来，特别是当该值为 `null` 或布尔值时。

在函数调用中使用具名实参时，可以按任意顺序罗列它们。

以拥有 4 个带默认值实参的 `reformat()` 函数为例：

```kotlin
fun reformat(
    str: String,
    normalizeCase: Boolean = true,
    upperCaseFirstLetter: Boolean = true,
    divideByCamelHumps: Boolean = false,
    wordSeparator: Char = ' ',
) { /*...*/ }
```

调用此函数时，可以为其中部分实参命名：

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
但是，在跳过第一个实参之后，必须命名后续的所有实参：

```kotlin
reformat(
    "This is a short String!",
    upperCaseFirstLetter = false,
    wordSeparator = '_'
)
```

可以通过为相应实参命名来传递[可变实参数量](#variable-number-of-arguments-varargs)（`vararg`）。
在以下示例中，传入的是一个数组：

```kotlin
fun mergeStrings(vararg strings: String) { /*...*/ }

mergeStrings(strings = arrayOf("a", "b", "c"))
```

<!-- Rationale for named arguments interaction with varargs is here https://youtrack.jetbrains.com/issue/KT-52505#focus=Comments-27-6147916.0-0 -->

> 在 JVM 上调用 Java 函数时不能使用具名实参语法，因为 Java 字节码并不总是保留函数形参的名称。
>
{style="note"}

### 返回值类型 {id="return-types"}

声明带有块体（将指令放在花括号 `{}` 中）的函数时，必须始终显式指定返回值类型。唯一的例外是当函数返回 `Unit` 时，[此时显式指定返回值类型是可选的](#unit-returning-functions)。

Kotlin 不会为带有块体的函数推断返回值类型。这些函数的控制流可能非常复杂，这会使返回值类型对读者甚至对编译器来说都不直观。不过，如果未显式指定，Kotlin 可以为[单表达式函数](#single-expression-functions)推断返回值类型。

Kotlin 函数返回单个值，但该值可以包含多项数据。有关表示这些值的方式，请参阅[返回多个值](#return-multiple-values)。

#### 返回多个值 {id="return-multiple-values"}

当需要返回多个具有不同含义的相关值时，请声明一个[数据类](data-classes.md)，即使该类只用于一个函数：

```kotlin
data class OrderSummary(
    val subtotal: Double,
    val tax: Double,
)

fun calculateOrderSummary(prices: List<Double>): OrderSummary {
    val subtotal = prices.sum()
    val tax = subtotal * 0.2
    return OrderSummary(subtotal, tax)
}

fun main() {
    val summary = calculateOrderSummary(listOf(12.50, 8.00, 4.50))

    println(summary.subtotal)
    // 25.0
    println(summary.tax)
    // 5.0
}
```
{kotlin-runnable="true" id="return-multiple-values-data-class"}

当需要返回多个含义不同的值时，数据类非常适用。如果返回的值属于同一类型，并且希望将它们作为一个整体进行处理，请考虑改为返回集合：

```kotlin
data class Person(val name: String)

val friendGroups = listOf(
    listOf(Person("Alice"), Person("Bob")),
    listOf(Person("Charlie"), Person("Diana"), Person("Eve")),
    listOf(Person("Frank"))
)

fun findLargestGroupOfFriends(): List<Person> {
    return friendGroups.maxByOrNull { it.size } ?: emptyList()
}

fun main() {
    val largestGroup = findLargestGroupOfFriends()

    println(largestGroup.map { it.name })
    // [Charlie, Diana, Eve]
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.4" id="return-multiple-values-list"}

如果需要返回固定数量的值，还可以使用标准库中的 [`Pair`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-pair/) 或 [`Triple`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-triple/) 数据类。但是，它们的属性名称比较宽泛，例如 `first`、`second` 和 `third`，这可能会导致结果难以理解。

例如，尽管 `calculateOrderTotals()` 函数返回一个 `Pair`，但并不清楚每个 `Double` 代表什么：

```kotlin
fun calculateOrderTotals(prices: List<Double>): Pair<Double, Double> {
    val subtotal = prices.sum()
    val tax = subtotal * 0.2
    return Pair(subtotal, tax)
}

fun main() {
    val totals = calculateOrderTotals(listOf(12.50, 8.00, 4.50))

    // 'first' 代表什么？
    println(totals.first)
    // 25.0
  
    // 'second' 代表什么？
    println(totals.second)
    // 5.0
}
```
{kotlin-runnable="true" id="return-multiple-values-pair"}

对于具有明确含义的结果，更推荐使用带有描述性属性名称的数据类，如 [`OrderSummary` 数据类示例](#return-multiple-values)中所示。

### 单表达式函数 {id="single-expression-functions"}

当函数体由单个表达式组成时，可以省略花括号，并在 `=` 符号之后指定函数体：

```kotlin
fun double(x: Int): Int = x * 2
```

大多数情况下无需显式声明[返回值类型](#return-types)：

```kotlin
// 编译器会推断该函数返回 Int
fun double(x: Int) = x * 2
```

从单表达式推断返回值类型时，编译器有时可能会遇到问题。
在这些情况下，应显式添加返回值类型。
例如，递归或相互递归（互相调用）的函数，
以及具有无类型表达式（例如 `fun empty() = null`）的函数始终需要显式指定返回值类型。

在使用推断的返回值类型时，请务必检查实际结果，因为编译器推断出的类型可能不如预期有用。
在上面的示例中，如果希望 `double()` 函数返回 `Number` 而非 `Int`，则必须显式声明这一点。

如果在表达式体中使用 `return` 语句，则必须显式指定返回值类型：

```kotlin
fun getDisplayNameOrDefault(userId: String?): String =
    getDisplayName(userId ?: return "default")
```

### 返回 Unit 的函数 {id="unit-returning-functions"}

如果函数具有块体且没有显式返回值类型，编译器会将其返回值类型推断为 `Unit`。

`Unit` 是一种只有一个值的类型，该值也称为 `Unit`。这个值是一个[对象](object-declarations.md)，因此仅存在单个 `Unit` 实例。
与其他编程语言中的 `void` 不同，`Unit` 是一种实际类型，如果代码需要，你可以使用它的值。
这样一来，产生结果的函数与仅执行操作的函数符合相同的类型模型：它们都返回值，并且可以通过函数类型表示或与泛型 API 一起使用。

无需在函数声明中指定 `Unit`，也无需显式返回其值。但是，当 `Unit` 作为函数类型的一部分时（例如 `() -> Unit`），必须显式指定。例如，我们来声明一个不显式返回 `Unit` 的 `printHello()` 函数：

```kotlin
// 函数类型形参（'action'）的声明
// 仍需要显式的返回值类型
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
        // Hello Kodee
        // This runs after the greeting.
    }

    printHello(null) {
        println("No name provided, but action still runs.")
        // Hi there!
        // No name provided, but action still runs.
    }
}
```
{kotlin-runnable="true" validate="false" id="return-unit-implicit"}

这等同于以下更为冗长的声明，其中显式指定了返回值类型和返回值：

```kotlin
//sampleStart
// `Unit` 在 `() -> Unit` 函数类型中是必需的，
// 但将 `: Unit` 声明为 `printHello()` 的返回值类型是可选的
fun printHello(name: String?, action: () -> Unit): Unit {
    if (name != null)
        println("Hello $name")
    else
        println("Hi there!")

    action()
    // 显式返回 `Unit` 值是可选的
    return Unit
}
//sampleEnd
fun main() {
    printHello("Kodee") {
        println("This action runs when a name is given.")
        // Hello Kodee
        // This action runs when a name is given.
    }
    printHello(null) {
        println("This action runs when no name is provided.")
        // Hi there!
        // This action runs when no name is provided.
    }
}
```
{kotlin-runnable="true" validate="false" id="return-unit-explicit"}

### 可变实参数量（vararg） {id="variable-number-of-arguments-varargs"}

若要向函数传递可变数量的实参，可以使用 `vararg` 修饰符标记其形参之一（通常是最后一个）。
在函数内部，类型为 `T` 的 `vararg` 形参可以作为 `T` 类型的数组来使用：

```kotlin
fun <T> asList(vararg ts: T): List<T> {
    val result = ArrayList<T>()
    for (t in ts) // ts 是一个 Array
        result.add(t)
    return result
}
```

随后便可以向该函数传递可变数量的实参：

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
{kotlin-runnable="true" validate="false" id="varargs-aslist"}

只能将一个形参标记为 `vararg`。
如果在形参列表中声明的 `vararg` 形参不是最后一个，则必须使用具名实参为后面的形参传递值。
如果形参具有函数类型，也可以通过将 lambda 放置在圆括号之外来传递其值。

调用 `vararg` 函数时，可以逐个传递实参，例如 `asList(1, 2, 3)`。
如果已有数组并希望将其内容作为 `vararg` 形参（或其一部分）传递给函数，
请使用[扩展运算符](arrays.md#pass-variable-number-of-arguments-to-a-function)，在数组名称前添加 `*` 前缀：

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
{kotlin-runnable="true" validate="false" id="varargs-aslist-with-array"}

如果想将[基本类型数组](arrays.md#primitive-type-arrays)作为 `vararg` 传递，
需要使用 [`.toTypedArray()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/to-typed-array.html) 函数将其转换为常规（类型化）数组：

```kotlin
// 'a' 是一个 IntArray，属于基本类型数组
val a = intArrayOf(1, 2, 3)
val list = asList(-1, 0, *a.toTypedArray(), 4)
```

### 中缀表示法 {id="infix-notation"}

可以使用 `infix` 关键字声明无需圆括号或点号即可调用的函数。
这有助于提高代码中简单函数调用的可读性。

```kotlin
infix fun Int.shl(x: Int): Int { /*...*/ }

// 使用常规表示法调用函数
1.shl(2)

// 使用中缀表示法调用函数
1 shl 2
```

中缀函数必须满足以下要求：

* 必须是类的成员函数或[扩展函数](extensions.md)。
* 必须只有一个形参。
* 该形参不能[接受可变实参数量](#variable-number-of-arguments-varargs)（`vararg`），且不能有[默认值](#parameters-with-default-values)。

> 中缀函数调用的优先级低于算术运算符、类型转换和 `rangeTo` 运算符。
> 以下表达式是等价的：
> * `1 shl 2 + 3` 等价于 `1 shl (2 + 3)`
> * `0 until n * 2` 等价于 `0 until (n * 2)`
> * `xs union ys as Set<*>` 等价于 `xs union (ys as Set<*>)`
>
> 另一方面，中缀函数调用的优先级高于布尔运算符 `&&` 与 `||`、`is` 与 `in` 检查以及某些其他运算符。以下表达式也是等价的：
> * `a && b xor c` 等价于 `a && (b xor c)`
> * `a xor b in c` 等价于 `(a xor b) in c`
>
{style="note"}

请注意，中缀函数始终要求同时指定接收者和形参。
使用中缀表示法在当前接收者上调用方法时，请显式使用 `this`。
这样可以确保解析毫无二义性。

```kotlin
class MyStringCollection {
    val items = mutableListOf<String>()

    infix fun add(s: String) {
        println("Adding: $s")
        items += s
    }

    fun build() {
        add("first")      // 正确：常规函数调用
        this add "second" // 正确：带有显式接收者的中缀调用
        // add "third"    // 编译器错误：需要显式接收者
    }

    fun printAll() = println("Items = $items")
}

fun main() {
    val myStrings = MyStringCollection()
    // 向列表中添加 "first" 和 "second"
    myStrings.build()
      
    myStrings.printAll()
    // Adding: first
    // Adding: second
    // Items = [first, second]
}
```
{kotlin-runnable="true" id="infix-notation-example"}

## 函数作用域 {id="function-scope"}

Kotlin 函数可以直接在文件顶级声明，这意味着无需创建类来容纳函数。
函数还可以在局部声明为*成员函数*或*扩展函数*。

### 局部函数 {id="local-functions"}

Kotlin 支持局部函数，即在其他函数内部声明的函数。
例如，以下代码实现了给定图的深度优先搜索算法。
外部 `dfs()` 函数内的局部 `dfs()` 函数用于隐藏实现并处理递归调用：

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
{kotlin-runnable="true" id="local-functions-dfs"}

局部函数可以访问外部函数的局部变量（闭包）。
在上述示例中，`visited` 函数形参可以改为局部变量：

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
{kotlin-runnable="true" id="local-functions-dfs-with-local-variable"}

### 成员函数 {id="member-functions"}

成员函数是定义在类或对象内部的函数：

```kotlin
class Sample {
    fun foo() { print("Foo") }
}
```

要调用成员函数，请写出实例或对象名称，后接 `.` 并附上函数名称：

```kotlin
// 创建 Stream 类的实例并调用 read()
Stream().read()
```

有关类和重写成员的更多信息，请参阅[类](classes.md)和[继承](classes.md#inheritance)。

## 泛型函数 {id="generic-functions"}

可以通过在函数名称前使用尖括号 `<>` 为函数指定泛型形参：

```kotlin
fun <T> singletonList(item: T): List<T> { /*...*/ }
```

有关泛型函数的更多信息，请参阅[泛型](generics.md)。

## 尾递归函数 {id="tail-recursive-functions"}

Kotlin 支持一种称为[尾递归](https://en.wikipedia.org/wiki/Tail_call)的函数式编程风格。
对于通常使用循环编写的某些算法，可以使用递归函数替代，而无需担心堆栈溢出的风险。
当函数使用 `tailrec` 修饰符标记并满足所需的形式条件时，编译器会优化递归，生成快速高效的基于循环的版本：

```kotlin
import kotlin.math.cos
import kotlin.math.abs

// 任意“足够好”的精度
val eps = 1E-10

tailrec fun findFixPoint(x: Double = 1.0): Double =
    if (abs(x - cos(x)) < eps) x else findFixPoint(cos(x))
```

这段代码计算余弦的不动点（一个数学常数）。
该函数从 `1.0` 开始重复调用 `cos()`，直到结果不再变化为止，在指定的 `eps` 精度下得出的结果为 `0.7390851332151611`。
该代码等价于下面这种更传统的写法：

```kotlin
import kotlin.math.cos
import kotlin.math.abs

// 任意“足够好”的精度
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

只有当函数将自身调用作为其最后的操作时，才能应用 `tailrec` 修饰符。
在递归调用之后还有其他代码、在 [`try`/`catch`/`finally` 块](exceptions.md#handle-exceptions-using-try-catch-blocks)内，或者当函数为 [open](inheritance.md) 时，都不能使用尾递归。

**另请参阅**：
* [内联函数](inline-functions.md)
* [扩展函数](extensions.md)
* [高阶函数与 Lambda](lambdas.md)