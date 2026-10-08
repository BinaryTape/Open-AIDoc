[//]: # (title: 高阶函数与 lambda表达式)

Kotlin 函数是[一等公民](https://en.wikipedia.org/wiki/First-class_function)，这意味着它们可以存储在变量和数据结构中，可以作为实参传递给[高阶函数](#高阶函数)，也可以作为其返回值。你可以像对待其他非函数值一样，对函数执行任何操作。

为了实现这一点，作为一种静态类型编程语言，Kotlin 使用一系列[函数类型](#函数类型)来表示函数，并提供了一组专门的语言结构，例如 [lambda表达式](#lambda表达式与匿名函数)。

## 高阶函数 {id="higher-order-functions"}

高阶函数是将函数作为参数或返回函数的函数。

高阶函数的一个典型例子是集合的[函数式编程惯用法 `fold`](https://en.wikipedia.org/wiki/Fold_(higher-order_function))。它接受一个初始累加值和一个组合函数，并通过连续地将当前累加值与每个集合元素组合来构建其返回值，每次都会替换累加值：

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

在上面的代码中，`combine` 参数具有[函数类型](#函数类型) `(R, T) -> R`，因此它接受一个带有两个类型为 `R` 和 `T` 的参数并返回 `R` 类型值的函数。它在 `for` 循环内部被[调用](#调用函数类型实例)，然后将返回值赋值给 `accumulator`。

要调用 `fold`，你需要向其传递一个[函数类型的实例](#实例化函数类型)作为实参，而 lambda表达式（[下文有更详细的描述](#lambda表达式与匿名函数)）在高阶函数调用处被广泛用于此目的：

```kotlin
fun main() {
    //sampleStart
    val items = listOf(1, 2, 3, 4, 5)
    
    // lambda表达式是包裹在花括号中的代码块。
    items.fold(0, { 
        // 当 lambda 具有参数时，它们排在最前面，随后是 '->'
        acc: Int, i: Int -> 
        print("acc = $acc, i = $i, ") 
        val result = acc + i
        println("result = $result")
        // lambda表达式中的最后一个表达式被视为返回值：
        result
    })
    
    // 如果可以推断出 lambda 中的参数类型，则它们是可选的：
    val joinedToString = items.fold("Elements:", { acc, i -> acc + " " + i })
    
    // 函数引用也可以用于高阶函数调用：
    val product = items.fold(1, Int::times)
    //sampleEnd
    println("joinedToString = $joinedToString")
    println("product = $product")
}
```
{kotlin-runnable="true"}

## 函数类型 {id="function-types"}

Kotlin 使用函数类型（如 `(Int) -> String`）进行处理函数的声明：`val onClick: () -> Unit = ...`。

这些类型具有与其函数签名（即参数和返回值）相对应的特殊表示法：

* 所有函数类型都有一个括号括起来的参数类型列表和一个返回值类型：`(A, B) -> C` 表示一个接受两个类型为 `A` 和 `B` 的实参并返回类型为 `C` 的值的类型。参数类型列表可以为空，例如 `() -> A`。[`Unit` 返回值类型](functions.md#unit-returning-functions)不可省略。

* 函数类型可以可选地具有一个额外的 *接收者* 类型，该类型在表示法中的点号之前指定：类型 `A.(B) -> C` 表示可以在接收者对象 `A` 上调用，并带有一个参数 `B` 且返回一个值 `C` 的函数。[带接收者的函数字面量](#带接收者的函数字面量)经常与这些类型一起使用。

* [挂起函数](coroutines-basics.md)属于一种特殊的函数类型，其表示法中带有 *suspend* 修饰符，例如 `suspend () -> Unit` 或 `suspend A.(B) -> C`。

函数类型表示法可以可选地包含函数参数的名称：`(x: Int, y: Int) -> Point`。这些名称可用于记录参数的含义。

要指定函数类型[可为 null](null-safety.md#nullable-types-and-non-nullable-types)，请按如下方式使用圆括号：`((Int, Int) -> Int)?`。

函数类型也可以使用圆括号进行组合：`(Int) -> ((Int) -> Unit)`。

> 箭头表示法是右结合的，`(Int) -> (Int) -> Unit` 与前面的示例等效，但与 `((Int) -> (Int)) -> Unit` 不等效。
>
{style="note"}

你还可以通过使用[类型别名](type-aliases.md)为函数类型提供替代名称：

```kotlin
typealias ClickHandler = (Button, ClickEvent) -> Unit
```

### 实例化函数类型 {id="instantiating-a-function-type"}

有几种方法可以获取函数类型的实例：

* 使用函数字面量内的代码块，采用以下形式之一：
    * [lambda表达式](#lambda表达式与匿名函数)：`{ a, b -> a + b }`
    * [匿名函数](#匿名函数)：`fun(s: String): Int { return s.toIntOrNull() ?: 0 }`

  [带接收者的函数字面量](#带接收者的函数字面量)可用作具有接收者的函数类型的值。

* 使用指向现有声明的可调用引用：
    * 顶层、局部、成员或扩展[函数](reflection.md#function-references)：`::isOdd`、`String::toInt`
    * 顶层、成员或扩展[属性](reflection.md#property-references)：`List<Int>::size`
    * [构造函数](reflection.md#constructor-references)：`::Regex`

  这些包括指向特定实例成员的[绑定可调用引用](reflection.md#bound-function-and-property-references)：`foo::toString`。

* 使用实现函数类型作为接口的自定义类的实例：

```kotlin
class IntTransformer: (Int) -> Int {
    override operator fun invoke(x: Int): Int = TODO()
}

val intFunction: (Int) -> Int = IntTransformer()
```

如果有足够的信息，编译器可以推断变量的函数类型：

```kotlin
val a = { i: Int -> i + 1 } // 推断出的类型为 (Int) -> Int
```

带有和不带接收者的函数类型的*非字面量*值是可以互换的，因此接收者可以代替第一个参数，反之亦然。例如，类型为 `(A, B) -> C` 的值可以传递或赋值给预期为 `A.(B) -> C` 的值，反之亦然：

```kotlin
fun main() {
    //sampleStart
    val repeatFun: String.(Int) -> String = { times -> this.repeat(times) }
    val twoParameters: (String, Int) -> String = repeatFun // 确定
    
    fun runTransformation(f: (String, Int) -> String): String {
        return f("hello", 3)
    }
    val result = runTransformation(repeatFun) // 确定
    //sampleEnd
    println("result = $result")
}
```
{kotlin-runnable="true"}

> 即使变量是使用指向扩展函数的引用初始化的，默认情况下也会推断出不带接收者的函数类型。要更改此行为，请显式指定变量类型。
>
{style="note"}

### 调用函数类型实例 {id="invoking-a-function-type-instance"}

函数类型的值可以通过使用其 [`invoke(...)` 运算符](operator-overloading.md#invoke-operator)来调用：`f.invoke(x)` 或简写为 `f(x)`。

如果该值具有接收者类型，则接收者对象应作为第一个实参传递。调用带接收者的函数类型值的另一种方法是在其前面加上接收者对象，就像该值是一个[扩展函数](extensions.md)一样：`1.foo(2)`。

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
    println(2.intPlus(3)) // 类似扩展的调用
    //sampleEnd
}
```
{kotlin-runnable="true"}

### 内联函数 {id="inline-functions"}

有时，对于高阶函数，使用[内联函数](inline-functions.md)是有益的，它们可以提供灵活的控制流。

## lambda表达式与匿名函数 {id="lambda-expressions-and-anonymous-functions"}

lambda表达式和匿名函数是*函数字面量*。函数字面量是未声明但立即作为表达式传递的函数。请看以下示例：

```kotlin
max(strings, { a, b -> a.length < b.length })
```

函数 `max` 是一个高阶函数，因为它将函数值作为其第二个实参。这第二个实参是一个本身也是函数的表达式，称为函数字面量，它等效于以下命名函数：

```kotlin
fun compare(a: String, b: String): Boolean = a.length < b.length
```

你还可以使用 `suspend` 关键字创建 *挂起 lambda表达式*。挂起 lambda 具有函数类型 `suspend () -> Unit`，并且可以调用其他挂起函数：

```kotlin
val suspendingTask = suspend { doSuspendingWork() }
```

### lambda表达式语法 {id="lambda-expression-syntax"}

lambda表达式的完整语法形式如下：

```kotlin
val sum: (Int, Int) -> Int = { x: Int, y: Int -> x + y }
```

* lambda表达式总是被花括号包裹。
* 完整语法形式中的参数声明放在花括号内，并具有可选的类型注解。
* 代码体放在 `->` 之后。
* 如果推断出的 lambda 返回值类型不是 `Unit`，则 lambda 代码体内的最后一个（或可能是唯一的）表达式将被视为返回值。

如果你省去所有可选注解，剩下的部分如下所示：

```kotlin
val sum = { x: Int, y: Int -> x + y }
```

### 传递尾随 Lambda {id="passing-trailing-lambdas"}

根据 Kotlin 约定，如果函数的最后一个参数是函数，那么作为相应实参传递的 lambda表达式可以放在圆括号之外：

```kotlin
val product = items.fold(1) { acc, e -> acc * e }
```

这种语法也称为*尾随 Lambda*。

如果该 lambda 是该调用中唯一的实参，则可以完全省略圆括号：

```kotlin
run { println("...") }
```

### it：单个参数的隐式名称 {id="it-implicit-name-of-a-single-parameter"}

lambda表达式只有一个参数是非常常见的情况。

如果编译器可以在没有任何参数的情况下解析签名，则不需要声明参数，并且可以省略 `->`。该参数将以名称 `it` 隐式声明：

```kotlin
ints.filter { it > 0 } // 此字面量的类型为 '(it: Int) -> Boolean'
```

### 从 lambda表达式返回值 {id="returning-a-value-from-a-lambda-expression"}

你可以使用[限定的 return](returns.md#return-to-labels) 语法显式地从 lambda 返回值。否则，将隐式返回最后一个表达式的值。

因此，以下两个片段是等效的：

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

这一约定连同[在圆括号外传递 lambda表达式](#传递尾随-lambda)一起，可以实现 [LINQ 风格](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/linq/)的代码：

```kotlin
strings.filter { it.length == 5 }.sortedBy { it }.map { it.uppercase() }
```

### 下划线用于未使用的变量 {id="underscore-for-unused-variables"}

如果 lambda 参数未使用，你可以放置下划线代替其名称：

```kotlin
map.forEach { (_, value) -> println("$value!") }
```

### lambda 中的析构 {id="destructuring-in-lambdas"}

lambda 中的析构作为[析构声明](destructuring-declarations.md#lambda-中的析构)的一部分进行了描述。

### 匿名函数 {id="anonymous-functions"}

上面的 lambda表达式语法缺少一件事——指定函数返回值类型的能力。在大多数情况下，这是不需要的，因为返回值类型可以自动推断。但是，如果你确实需要显式指定它，可以使用另一种语法：*匿名函数*。

```kotlin
fun(x: Int, y: Int): Int = x + y
```

匿名函数看起来非常像常规函数声明，只是省略了它的名称。它的代码体可以是一个表达式（如上所示）或一个代码块：

```kotlin
fun(x: Int, y: Int): Int {
    return x + y
}
```

参数和返回值类型的指定方式与常规函数相同，只是如果可以从上下文中推断出参数类型，则可以省略：

```kotlin
ints.filter(fun(item) = item > 0)
```

匿名函数的返回值类型推断与正常函数完全一样：对于具有表达式体的匿名函数，返回值类型是自动推断的；但对于具有代码块体的匿名函数，必须显式指定返回值类型（或假定为 `Unit`）。

> 当将匿名函数作为参数传递时，请将它们放在圆括号内。允许你将函数留在圆括号之外的简写语法仅适用于 lambda表达式。
>
{style="note"}

lambda表达式和匿名函数之间的另一个区别是[非局部返回](inline-functions.md#返回)的行为。不带标签的 `return` 语句总是从使用 `fun` 关键字声明的函数返回。这意味着 lambda表达式内部的 `return` 将从封闭函数返回，而匿名函数内部的 `return` 将从匿名函数本身返回。

### 闭包 {id="closures"}

lambda表达式或匿名函数（以及[局部函数](functions.md#局部函数)和[对象表达式](object-declarations.md#对象表达式)）可以访问其*闭包*，其中包含在外部作用域中声明的变量。在闭包中捕获的变量可以在 lambda 中修改：

```kotlin
var sum = 0
ints.filter { it > 0 }.forEach {
    sum += it
}
print(sum)
```

### 带接收者的函数字面量 {id="function-literals-with-receiver"}

带有接收者的[函数类型](#函数类型)（如 `A.(B) -> C`）可以使用函数字面量的特殊形式——带接收者的函数字面量来实例化。

如上所述，Kotlin 提供了在提供*接收者对象*的同时[调用](#调用函数类型实例)带接收者的函数类型实例的能力。

在函数字面量的代码体内，传递给调用的接收者对象将成为*隐式* `this`，这样你就可以在没有任何额外限定符的情况下访问该接收者对象的成员，或者使用 [`this` 表达式](this-expressions.md)访问接收者对象。

这种行为类似于[扩展函数](extensions.md)，扩展函数也允许你在函数体内访问接收者对象的成员。

这是一个带接收者的函数字面量及其类型的示例，其中在接收者对象上调用了 `plus`：

```kotlin
val sum: Int.(Int) -> Int = { other -> plus(other) }
```

匿名函数语法允许你直接指定函数字面量的接收者类型。如果你需要声明一个带接收者的函数类型的变量，然后供以后使用，这会非常有用。

```kotlin
val sum = fun Int.(other: Int): Int = this + other
```

当接收者类型可以从上下文中推断出来时，lambda表达式可以用作带接收者的函数字面量。其用法最重要的例子之一是[类型安全构建器](type-safe-builders.md)：

```kotlin
class HTML {
    fun body() { ... }
}

fun html(init: HTML.() -> Unit): HTML {
    val html = HTML()  // 创建接收者对象
    html.init()        // 将接收者对象传递给 lambda
    return html
}

html {       // 带接收者的 lambda 从这里开始
    body()   // 调用接收者对象上的方法
}
```
