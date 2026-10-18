[//]: # (title: 高阶函数与 Lambda 表达式)

Kotlin 的函数是[一等公民](https://en.wikipedia.org/wiki/First-class_function)，这意味着它们可以存储在变量与数据结构中，也可以作为实参传递给其他[高阶函数](#higher-order-functions)并从中返回。你可以对函数执行适用于其他非函数值的任何操作。

为了实现这一点，Kotlin 作为一门静态类型编程语言，使用了一族[函数类型](#function-types)来表示函数，并提供了一组专门的语言结构，例如 [Lambda 表达式](#lambda-expressions-and-anonymous-functions)。

## 高阶函数 {id="higher-order-functions"}

高阶函数是将函数用作形参或返回值的函数。

高阶函数的一个典型范例就是集合的[函数式编程惯用法 `fold`](https://en.wikipedia.org/wiki/Fold_(higher-order_function))。它接受一个初始累加器值和一个组合函数，通过连续将当前累加器值与集合中的每个元素进行组合并每次替换累加器值，从而构建出最终的返回值：

```kotlin
fun <T, R> Collection<T>.fold(
    initial: R, 
    combine: (acc: R, nextElement: T) -> R
): R {
    var accumulator: R = initial
    for (element: T in this) {
        accumulator = combine(accumulator, element)
    }
    return accumulator
}
```

在上述代码中，形参 `combine` 具有[函数类型](#function-types) `(R, T) -> R`，因此它接受一个带有两个类型分别为 `R` 和 `T` 的实参并返回类型为 `R` 的值的函数。它在 `for` 循环内部被[调用](#invoking-a-function-type-instance)，随后返回值被赋值给 `accumulator`。

要调用 `fold`，你需要向其传递一个[函数类型的实例](#instantiating-a-function-type)作为实参，而在高阶函数调用站点上，Lambda 表达式（[下文有更详细的描述](#lambda-expressions-and-anonymous-functions)）被广泛用于此目的：

```kotlin
fun main() {
    //sampleStart
    val items = listOf(1, 2, 3, 4, 5)
    
    // Lambdas are code blocks enclosed in curly braces.
    items.fold(0, { 
        // When a lambda has parameters, they go first, followed by '->'
        acc: Int, i: Int -> 
        print("acc = $acc, i = $i, ") 
        val result = acc + i
        println("result = $result")
        // The last expression in a lambda is considered the return value:
        result
    })
    
    // Parameter types in a lambda are optional if they can be inferred:
    val joinedToString = items.fold("Elements:", { acc, i -> acc + " " + i })
    
    // Function references can also be used for higher-order function calls:
    val product = items.fold(1, Int::times)
    //sampleEnd
    println("joinedToString = $joinedToString")
    println("product = $product")
}
```
{kotlin-runnable="true"}

## 函数类型 {id="function-types"}

Kotlin 使用诸如 `(Int) -> String` 等函数类型来处理与函数相关的声明：`val onClick: () -> Unit = ...`。

这些类型具有与函数签名（其形参和返回值）相对应的特殊表示法：

* 所有函数类型都包含一个带有圆括号的形参类型列表和一个返回值类型：`(A, B) -> C` 表示接受两个类型分别为 `A` 和 `B` 的实参并返回类型为 `C` 的值的函数类型。形参类型列表可以为空，例如 `() -> A`。[`Unit` 返回值类型](functions.md#unit-returning-functions)不能省略。

* 函数类型还可以选择包含一个附加的*接收者*（receiver）类型，该类型在表示法中的点号之前指定：类型 `A.(B) -> C` 表示可以在接收者对象 `A` 上调用，带有形参 `B` 并返回类型为 `C` 的值的函数。带有[接收者的函数字面值](#function-literals-with-receiver)通常与这些类型结合使用。

* [挂起函数](coroutines-basics.md)属于一种特殊的函数类型，其表示法中带有 *suspend* 修饰符，例如 `suspend () -> Unit` 或 `suspend A.(B) -> C`。

函数类型表示法还可以选择包含函数形参的名称：`(x: Int, y: Int) -> Point`。这些名称可用于指示形参的语义。

要指定函数类型为[可空](null-safety.md#nullable-types-and-non-nullable-types)，请按如下方式使用圆括号：`((Int, Int) -> Int)?`。

函数类型也可以使用圆括号进行组合：`(Int) -> ((Int) -> Unit)`。

> 箭头表示法是右结合的，`(Int) -> (Int) -> Unit` 与前一个示例等价，但与 `((Int) -> (Int)) -> Unit` 不等价。
>
{style="note"}

你还可以通过使用[类型别名](type-aliases.md)为函数类型提供替代名称：

```kotlin
typealias ClickHandler = (Button, ClickEvent) -> Unit
```

### 实例化函数类型 {id="instantiating-a-function-type"}

有几种方法可以获取函数类型的实例：

* 使用函数字面值中的代码块，形式为以下之一：
    * [Lambda 表达式](#lambda-expressions-and-anonymous-functions)：`{ a, b -> a + b }`，
    * [匿名函数](#anonymous-functions)：`fun(s: String): Int { return s.toIntOrNull() ?: 0 }`

  [带有接收者的函数字面值](#function-literals-with-receiver)可用作带有接收者的函数类型的值。

* 使用指向已有声明的可调用引用：
    * 顶层、局部、成员或扩展[函数](#function-references)：`::isOdd`、`String::toInt`，
    * 顶层、成员或扩展[属性](#property-references)：`List<Int>::size`，
    * [构造函数](#constructor-references)：`::Regex`

  这包括指向特定实例成员的[绑定可调用引用](#bound-and-unbound-references)：`foo::toString`。

* 使用实现了作为接口的函数类型的自定义类实例：

```kotlin
class IntTransformer: (Int) -> Int {
    override operator fun invoke(x: Int): Int = TODO()
}

val intFunction: (Int) -> Int = IntTransformer()
```

如果有足够的信息，编译器可以推断出变量的函数类型：

```kotlin
val a = { i: Int -> i + 1 } // 推断出的类型为 (Int) -> Int
```

带有接收者和不带接收者的函数类型的*非字面值*是可以互换的，因此接收者可以替代第一个形参，反之亦然。例如，在需要 `A.(B) -> C` 类型值的地方，可以传递或赋值 `(A, B) -> C` 类型的值，反之亦然：

```kotlin
fun main() {
    //sampleStart
    val repeatFun: String.(Int) -> String = { times -> this.repeat(times) }
    val twoParameters: (String, Int) -> String = repeatFun // OK
    
    fun runTransformation(f: (String, Int) -> String): String {
        return f("hello", 3)
    }
    val result = runTransformation(repeatFun) // OK
    //sampleEnd
    println("result = $result")
}
```
{kotlin-runnable="true"}

> 即使变量是用对扩展函数的引用进行初始化的，默认情况下推断出的也是不带接收者的函数类型。
> 若要更改该行为，请显式指定变量类型。
>
{style="note"}

### 调用函数类型实例 {id="invoking-a-function-type-instance"}

可以通过使用函数类型的 [`invoke(...)` 运算符](operator-overloading.md#invoke-operator)来调用其值：`f.invoke(x)` 或简写为 `f(x)`。

如果该值具有接收者类型，则应将接收者对象作为第一个实参传递。调用带有接收者的函数类型值的另一种方法是将接收者对象作为前缀，就像该值是一个[扩展函数](extensions.md)一样：`1.foo(2)`。

示例：

```kotlin
fun main() {
    //sampleStart
    val stringPlus: (String, String) -> String = String::plus
    val intPlus: Int.(Int) -> Int = Int::plus
    
    println(stringPlus.invoke("<-", "->"))
    println(stringPlus("Hello, ", "world!"))
    
    println(intPlus.invoke(1, 1))
    println(intPlus(1, 2))
    println(2.intPlus(3)) // 类似扩展函数的调用
    //sampleEnd
}
```
{kotlin-runnable="true"}

### 内联函数 {id="inline-functions"}

有时，对于高阶函数使用[内联函数](inline-functions.md)是有益的，内联函数可以提供灵活的控制流。

## 可调用引用 {id="callable-reference"}

可调用引用允许你引用函数、属性或构造函数，而无需立即调用或访问它。你可以将该引用存储在变量中、将其传递给另一个函数，或者稍后对其进行调用。

要创建可调用引用，请使用 `::` 运算符：

```kotlin
fun isOdd(number: Int) = number % 2 != 0

fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)

    // 传递对 isOdd() 的引用
    println(numbers.filter(::isOdd))
    // [1, 3, 5]
}
```
{kotlin-runnable="true"}

可调用引用对象实现了诸如 `KFunction` 和 `KProperty` 等[反射](reflection.md)接口。

### 函数引用 {id="function-references"}

使用函数引用可以将现有函数作为值进行传递或存储。要引用顶层或局部具名函数，请使用 `::functionName`：

```kotlin
fun calculateLength(text: String) = text.length

fun main() {
    val length: (String) -> Int = ::calculateLength

    println(length("Kotlin"))
    // 6
    println(::calculateLength.name)
    // calculateLength
}
```
{kotlin-runnable="true"}

根据形参数量，函数引用属于 [`KFunction<out R>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-function/) 的子类型之一。例如 `KFunction3<T1, T2, T3, R>`。

如果多个函数同名，编译器会根据预期的函数类型来选择匹配的重载：

```kotlin
fun parse(value: String) = "String: $value"
fun parse(value: Int) = "Int: $value"

fun main() {
    val parseString: (String) -> String = ::parse
    val parseInt: (Int) -> String = ::parse

    println(parseString("Kotlin"))
    // String: Kotlin
    println(parseInt(22))
    // Int: 22
}
```
{kotlin-runnable="true"}

### 属性引用 {id="property-references"}

当你需要传递经过静态检查的属性访问器时，可以使用属性引用。例如，另一个函数可以使用该引用来选择读取或更新哪个值。

要创建属性引用，请使用 `::` 运算符。你可以通过将引用作为函数调用或使用 `get()` 函数来读取属性。可变属性引用还提供了 `set()`：

```kotlin
var greeting = "Hello"

class User(var name: String)

fun main() {
    // 顶层属性引用
    // 不需要接收者
    println(::greeting.get())
    // Hello

    ::greeting.set("Hi")
    println(greeting)
    // Hi

    val user = User("Jane")

    // 未绑定的成员属性引用
    // 显式传递 User 接收者
    val unboundName = User::name
    println(unboundName.get(user))
    // Jane

    unboundName.set(user, "Jane Doe")
    println(user.name)
    // Jane Doe

    // 绑定的成员属性引用
    // 捕获 user 接收者
    val boundName = user::name

    println(boundName.get())
    // Jane Doe

    boundName.set("Jane Smith")
    println(user.name)
    // Jane Smith
}
```
{kotlin-runnable="true"}

属性引用类型指示需要多少个接收者：

* [`KProperty0<V>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-property0/) 不需要接收者。这包括顶层属性以及绑定到对象的属性。
* [`KProperty1<T, V>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-property1/) 需要一个接收者。
* [`KProperty2<D, E, V>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-property2/) 需要两个接收者，表示成员扩展属性：一个接收者用于包含类，另一个用于被扩展的类型。

可变属性具有对应的 [`KMutableProperty0`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-mutable-property0/)、[`KMutableProperty1`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-mutable-property1/) 和 [`KMutableProperty2`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-mutable-property2/) 类型。
通常，你不需要显式编写这些类型，因为编译器可以从引用中推断出它们。

> 要在运行时发现属性，请使用 [Kotlin 反射](reflection.md)。
>
{style="tip"}

### 构造函数引用 {id="constructor-references"}

当 API 需要工厂且现有构造函数已具备所需的形参和返回值类型时，可以使用构造函数引用。构造函数引用允许 API 通过函数值创建新实例。

要创建对构造函数的引用，请使用 `::ClassName`：

```kotlin
data class User(val name: String, val age: Int)

fun createUser(factory: (String, Int) -> User): User =
    factory("Jane Doe", 22)

fun main() {
    val user = createUser(::User)
    println(user)
    // User(name=Jane Doe, age=22)
}
```
{kotlin-runnable="true"}

根据形参数量，对构造函数的可调用引用的类型属于 [`KFunction<out R>`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-function/) 子类型之一。

### 绑定与未绑定引用 {id="bound-and-unbound-references"}

对成员的引用可以是*绑定*（bound）或*未绑定*（unbound）的：

* 绑定引用会捕获特定实例，且只需要函数声明的实参。当每次调用都应使用相同的对象时，请使用绑定引用。
* 未绑定引用不会附加到实例上，因此其函数类型包含接收者。当调用方应当提供对象时，请使用未绑定引用。

```kotlin
class User(val name: String) {
    fun hasName(prefix: String) = name.startsWith(prefix)
}

fun main() {
    // 未绑定引用的第一个形参是 User 接收者
    val unbound: (User, String) -> Boolean = User::hasName
    println(unbound(User("Jane"), "Ja"))
    // true

    val jane = User("Jane")

    // 引用捕获 jane 作为其接收者
    val bound: (String) -> Boolean = jane::hasName
    println(bound("Doe"))
    // false
}
```
{kotlin-runnable="true"}

扩展函数遵循相同的规则。例如，`String::isBlank` 是未绑定的，需要一个 `String` 接收者。而 `"Kotlin"::isBlank` 是绑定的，不接受任何形参。

## Lambda 表达式与匿名函数 {id="lambda-expressions-and-anonymous-functions"}

Lambda 表达式和匿名函数是*函数字面值*。函数字面值是指未声明但作为表达式立即传递的函数。请考虑以下示例：

```kotlin
max(strings, { a, b -> a.length < b.length })
```

函数 `max` 是一个高阶函数，因为它接受一个函数值作为其第二个实参。这第二个实参是一个本身即为函数的表达式，称为函数字面值，它等价于以下具名函数：

```kotlin
fun compare(a: String, b: String): Boolean = a.length < b.length
```

你还可以使用 `suspend` 关键字创建*挂起 Lambda 表达式*。挂起 Lambda 具有函数类型 `suspend () -> Unit`，并且可以调用其他挂起函数：

```kotlin
val suspendingTask = suspend { doSuspendingWork() }
```

### Lambda 表达式语法 {id="lambda-expression-syntax"}

Lambda 表达式的完整语法形式如下：

```kotlin
val sum: (Int, Int) -> Int = { x: Int, y: Int -> x + y }
```

* Lambda 表达式始终由花括号包裹。
* 完整语法形式中的形参声明位于花括号内部，且具有可选的类型注解。
* 函数体位于 `->` 之后。
* 如果 Lambda 推断出的返回值类型不是 `Unit`，则 Lambda 体内的最后一个（或可能仅有的单个）表达式将被视为返回值。

如果省略所有可选注解，剩下的部分如下所示：

```kotlin
val sum = { x: Int, y: Int -> x + y }
```

### 传递尾随闭包 {id="passing-trailing-lambdas"}

根据 Kotlin 惯例，如果函数的最后一个形参是函数，则作为对应实参传递的 Lambda 表达式可以放置在圆括号外部：

```kotlin
val product = items.fold(1) { acc, e -> acc * e }
```

这种语法也称为*尾随闭包*（trailing lambda）。

如果 Lambda 是该调用中的唯一实参，则可以完全省略圆括号：

```kotlin
run { println("...") }
```

### it：单个形参的隐式名称 {id="it-implicit-name-of-a-single-parameter"}

Lambda 表达式只有一个形参是非常常见的情况。

如果编译器能够在没有任何形参的情况下解析签名，则无需声明该形参，并且可以省略 `->`。该形参将被隐式声明为名称 `it`：

```kotlin
ints.filter { it > 0 } // 此字面值的类型为 '(it: Int) -> Boolean'
```

### 从 Lambda 表达式返回值 {id="returning-a-value-from-a-lambda-expression"}

你可以使用[限定返回](returns.md#return-to-labels)语法显式地从 Lambda 返回值。否则，将隐式返回最后一个表达式的值。

因此，以下两个代码段是等价的：

```kotlin
ints.filter {
    val shouldFilter = it > 0
    shouldFilter
}

ints.filter {
    val shouldFilter = it > 0
    return@filter shouldFilter
}
```

该约定连同[在圆括号外传递 Lambda 表达式](#passing-trailing-lambdas)，允许编写 [LINQ 风格](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/linq/)的代码：

```kotlin
strings.filter { it.length == 5 }.sortedBy { it }.map { it.uppercase() }
```

### 用于未使用变量的下划线 {id="underscore-for-unused-variables"}

如果 Lambda 形参未使用，你可以使用下划线代替其名称：

```kotlin
map.forEach { (_, value) -> println("$value!") }
```

### Lambda 中的解构 {id="destructuring-in-lambdas"}

Lambda 中的解构在[解构声明](destructuring-declarations.md#destructuring-in-lambdas)中有相应说明。

### 匿名函数 {id="anonymous-functions"}

上面的 Lambda 表达式语法缺少了一项功能——指定函数返回值类型的能力。在大多数情况下，这是不必要的，因为返回值类型可以自动推断。但是，如果你确实需要显式指定它，可以使用另一种语法：*匿名函数*。

```kotlin
fun(x: Int, y: Int): Int = x + y
```

匿名函数看起来非常像常规函数声明，只是省略了函数名称。其函数体既可以是一个表达式（如上所示），也可以是一个代码块：

```kotlin
fun(x: Int, y: Int): Int {
    return x + y
}
```

形参和返回值类型的指定方式与常规函数相同，但如果形参类型可以从上下文中推断出来，则可以将其省略：

```kotlin
ints.filter(fun(item) = item > 0)
```

匿名函数的返回值类型推断与普通函数完全相同：对于具有表达式体的匿名函数，返回值类型是自动推断的；但对于具有块主体的匿名函数，必须显式指定返回值类型（或者假定为 `Unit`）。

> 当将匿名函数作为形参传递时，请将其放置在圆括号内。允许将函数留在圆括号外的简写语法仅适用于 Lambda 表达式。
>
{style="note"}

Lambda 表达式与匿名函数之间的另一个区别是[非局部返回](inline-functions.md#returns)的行为。不带标签的 `return` 语句始终从使用 `fun` 关键字声明的函数中返回。这意味着 Lambda 表达式内部的 `return` 将从封闭函数返回，而匿名函数内部的 `return` 将从该匿名函数本身返回。

### 闭包 {id="closures"}

Lambda 表达式或匿名函数（以及[局部函数](functions.md#local-functions)和[对象表达式](object-declarations.md#object-expressions)）可以访问其*闭包*，其中包括在外层作用域中声明的变量。在闭包中捕获的变量可以在 Lambda 中进行修改：

```kotlin
var sum = 0
ints.filter { it > 0 }.forEach {
    sum += it
}
print(sum)
```

### 带有接收者的函数字面值 {id="function-literals-with-receiver"}

带有接收者的[函数类型](#function-types)（例如 `A.(B) -> C`）可以通过一种特殊形式的函数字面值进行实例化——即带有接收者的函数字面值。

如上所述，Kotlin 提供了在提供*接收者对象*的同时[调用](#invoking-a-function-type-instance)带有接收者的函数类型实例的能力。

在函数字面值的函数体内，传递给调用的接收者对象会成为*隐式*的 `this`，这样你无需任何附加限定符即可访问该接收者对象的成员，或者使用 [`this` 表达式](this-expressions.md)访问接收者对象。

这种行为类似于[扩展函数](extensions.md)，扩展函数也允许你在函数体内访问接收者对象的成员。

下面是一个带有接收者的函数字面值及其类型的示例，其中在接收者对象上调用了 `plus`：

```kotlin
val sum: Int.(Int) -> Int = { other -> plus(other) }
```

匿名函数语法允许你直接指定函数字面值的接收者类型。如果你需要声明带有接收者的函数类型的变量，并在以后使用它，这会非常有用。

```kotlin
val sum = fun Int.(other: Int): Int = this + other
```

当接收者类型可以从上下文中推断出来时，Lambda 表达式可用作带有接收者的函数字面值。其最重要的用法之一就是[类型安全构建器](type-safe-builders.md)：

```kotlin
class HTML {
    fun body() { ... }
}

fun html(init: HTML.() -> Unit): HTML {
    val html = HTML()  // 创建接收者对象
    html.init()        // 将接收者对象传递给 Lambda
    return html
}

html {       // 带有接收者的 Lambda 从这里开始
    body()   // 调用接收者对象上的方法
}
```