[//]: # (title: 作用域函数)

Kotlin 标准库包含若干个函数，其唯一目的就是在对象的上下文中执行代码块。当你在对象上调用此类函数并提供一个 [lambda 表达式](lambdas.md)时，它会形成一个临时作用域。在此作用域中，你可以访问该对象而无需使用其名称。这类函数被称为_作用域函数_。共有五个此类函数：[`let`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/let.html)、[`run`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/run.html)、[`with`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/with.html)、[`apply`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/apply.html) 以及 [`also`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/also.html)。

从本质上讲，这些函数都执行相同的操作：在对象上执行代码块。不同之处在于该对象在块内部如何变得可用，以及整个表达式的结果是什么。

下面是使用作用域函数的一个典型示例：

```kotlin
data class Person(var name: String, var age: Int, var city: String) {
    fun moveTo(newCity: String) { city = newCity }
    fun incrementAge() { age++ }
}

fun main() {
//sampleStart
    Person("Alice", 20, "Amsterdam").let {
        println(it)
        it.moveTo("London")
        it.incrementAge()
        println(it)
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

如果不使用 `let` 编写相同的代码，你必须引入一个新变量，并在每次使用时重复其名称。 

```kotlin
data class Person(var name: String, var age: Int, var city: String) {
    fun moveTo(newCity: String) { city = newCity }
    fun incrementAge() { age++ }
}

fun main() {
//sampleStart
    val alice = Person("Alice", 20, "Amsterdam")
    println(alice)
    alice.moveTo("London")
    alice.incrementAge()
    println(alice)
//sampleEnd
}
```
{kotlin-runnable="true"}

作用域函数并没有引入任何新的技术能力，但它们可以使你的代码更加简洁且易读。

由于作用域函数之间存在诸多相似之处，为你的用例选择合适的作用域函数可能会有些棘手。选择主要取决于你的意图以及在项目中的使用一致性。下面我们详细介绍作用域函数之间的区别及其约定。

## 函数选择 {id="function-selection"}

为了帮助你根据目的选择合适的作用域函数，我们提供了下表，总结了它们之间的关键差异。

| 函数                                                                       | 对象引用         | 返回值         | 是否为扩展函数                                 |
|---------------------------------------------------------------------------|------------------|----------------|----------------------------------------------|
| [`let`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/let.html)     | `it`             | Lambda 结果    | 是                                           |
| [`run`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/run.html)     | `this`           | Lambda 结果    | 是                                           |
| [`run`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/run.html)     | -                | Lambda 结果    | 否：调用时无需上下文对象                       |
| [`with`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/with.html)   | `this`           | Lambda 结果    | 否：将上下文对象作为实参接收。                 |
| [`apply`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/apply.html) | `this`           | 上下文对象     | 是                                           |
| [`also`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/also.html)   | `it`             | 上下文对象     | 是                                           |

有关这些函数的详细信息，请参阅下面的专门章节。

以下是根据预期目的选择作用域函数的简要指南：

* 在非空对象上执行 lambda：`let`
* 将表达式作为局部作用域中的变量引入：`let`
* 对象配置：`apply`
* 对象配置并计算结果：`run`
* 在需要表达式的位置运行语句：非扩展 `run`
* 附加效果：`also`
* 在对象上组合函数调用：`with`

不同作用域函数的用例存在重叠，因此你可以根据项目或团队中使用的特定约定来选择使用哪些函数。

虽然作用域函数可以使代码更简洁，但请避免过度使用它们：过度使用会使代码难以阅读并导致错误。我们还建议避免嵌套使用作用域函数，并且在链式调用它们时要格外小心，因为这样很容易混淆当前上下文对象以及 `this` 或 `it` 的值。

## 差异 {id="distinctions"}

由于作用域函数在本质上很相似，因此了解它们之间的差异非常重要。每个作用域函数之间主要存在两点差异： 
* 它们引用上下文对象的方式。
* 它们的返回值。

### 上下文对象：this 还是 it {id="context-object-this-or-it"}

在传递给作用域函数的 lambda 内部，可以通过简短的引用而不是其实际名称来访问上下文对象。每个作用域函数都采用两种方式之一来引用上下文对象：作为 lambda [接收者](lambdas.md#function-literals-with-receiver)（`this`）或作为 lambda 实参（`it`）。两者提供了相同的功能，因此我们针对不同的用例描述了各自的优缺点，并提供了使用建议。

```kotlin
fun main() {
    val str = "Hello"
    // this
    str.run {
        println("The string's length: $length")
        //println("The string's length: ${this.length}") // 效果相同
    }

    // it
    str.let {
        println("The string's length is ${it.length}")
    }
}
```
{kotlin-runnable="true"}

#### this {id="this"}

`run`、`with` 和 `apply` 通过关键字 `this` 将上下文对象引用为 lambda [接收者](lambdas.md#function-literals-with-receiver)。因此，在它们的 lambda 中，该对象可以像在普通类函数中一样可用。 

在大多数情况下，访问接收者对象的成员时可以省略 `this`，从而使代码更简短。另一方面，如果省略了 `this`，可能会难以区分接收者成员与外部对象或函数。因此，对于主要通过调用对象的函数或为属性赋值来操作其成员的 lambda，建议将上下文对象作为接收者（`this`）。

```kotlin
data class Person(var name: String, var age: Int = 0, var city: String = "")

fun main() {
//sampleStart
    val adam = Person("Adam").apply { 
        age = 20                       // 与 this.age = 20 相同
        city = "London"
    }
    println(adam)
//sampleEnd
}
```
{kotlin-runnable="true"}

#### it {id="it"}

相应地，`let` 和 `also` 将上下文对象作为 lambda [实参](lambdas.md#lambda-expression-syntax)进行引用。如果未指定实参名称，则通过隐式默认名称 `it` 访问该对象。`it` 比 `this` 更简短，且带有 `it` 的表达式通常更易读。 

然而，在调用对象的函数或属性时，你无法像使用 `this` 那样隐式访问该对象。因此，当对象主要用作函数调用中的实参时，通过 `it` 访问上下文对象会更好。如果你在代码块中使用了多个变量，`it` 也是更好的选择。

```kotlin
import kotlin.random.Random

fun writeToLog(message: String) {
    println("INFO: $message")
}

fun main() {
//sampleStart
    fun getRandomInt(): Int {
        return Random.nextInt(100).also {
            writeToLog("getRandomInt() generated value $it")
        }
    }
    
    val i = getRandomInt()
    println(i)
//sampleEnd
}
```
{kotlin-runnable="true"}

下面的示例演示了将上下文对象作为 lambda 实参并指定实参名称为 `value` 的用法。

```kotlin
import kotlin.random.Random

fun writeToLog(message: String) {
    println("INFO: $message")
}

fun main() {
//sampleStart
    fun getRandomInt(): Int {
        return Random.nextInt(100).also { value ->
            writeToLog("getRandomInt() generated value $value")
        }
    }
    
    val i = getRandomInt()
    println(i)
//sampleEnd
}
```
{kotlin-runnable="true"}

### 返回值 {id="return-value"}

作用域函数根据其返回的结果有所不同：
* `apply` 和 `also` 返回上下文对象。
* `let`、`run` 和 `with` 返回 lambda 结果。

你应根据后续代码的操作仔细考虑所需的返回值。这有助于你选择最合适的作用域函数。

#### 上下文对象 {id="context-object"}

`apply` 和 `also` 的返回值是上下文对象本身。因此，它们可以作为_辅助步骤_包含在调用链中：你可以继续在同一个对象上连续链式调用函数。  

```kotlin
fun main() {
//sampleStart
    val numberList = mutableListOf<Double>()
    numberList.also { println("Populating the list") }
        .apply {
            add(2.71)
            add(3.14)
            add(1.0)
        }
        .also { println("Sorting the list") }
        .sort()
//sampleEnd
    println(numberList)
}
```
{kotlin-runnable="true"}

它们还可以用于返回上下文对象的函数的 return 语句中。

```kotlin
import kotlin.random.Random

fun writeToLog(message: String) {
    println("INFO: $message")
}

fun main() {
//sampleStart
    fun getRandomInt(): Int {
        return Random.nextInt(100).also {
            writeToLog("getRandomInt() generated value $it")
        }
    }
    
    val i = getRandomInt()
//sampleEnd
}
```
{kotlin-runnable="true"}

#### Lambda 结果 {id="lambda-result"}

`let`、`run` 和 `with` 返回 lambda 结果。因此，你可以在将结果赋值给变量、对结果链接后续操作等场景下使用它们。

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three")
    val countEndsWithE = numbers.run { 
        add("four")
        add("five")
        count { it.endsWith("e") }
    }
    println("There are $countEndsWithE elements that end with e.")
//sampleEnd
}
```
{kotlin-runnable="true"}

此外，你可以忽略返回值，使用作用域函数为局部变量创建临时作用域。 

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three")
    with(numbers) {
        val firstItem = first()
        val lastItem = last()        
        println("First item: $firstItem, last item: $lastItem")
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

## 各函数详解 {id="functions"}

为了帮助你为自己的用例选择合适的作用域函数，我们将详细介绍它们并提供使用建议。从技术上讲，作用域函数在很多情况下是可以互换的，因此这些示例展示了使用它们的一般约定。 

### let {id="let"}

- **上下文对象**作为实参（`it`）可用。
- **返回值**是 lambda 结果。

[`let`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/let.html) 可用于在调用链的结果上调用一个或多个函数。例如，以下代码打印对集合执行两次操作后的结果：

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four", "five")
    val resultList = numbers.map { it.length }.filter { it > 3 }
    println(resultList)    
//sampleEnd
}
```
{kotlin-runnable="true"}

使用 `let`，你可以重写上述示例，从而无需将列表操作的结果赋值给变量：

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four", "five")
    numbers.map { it.length }.filter { it > 3 }.let { 
        println(it)
        // 如果需要，还可以调用更多函数
    } 
//sampleEnd
}
```
{kotlin-runnable="true"}

如果传递给 `let` 的代码块包含以 `it` 作为实参的单个函数，则可以使用方法引用（`::`）代替 lambda 实参：

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three", "four", "five")
    numbers.map { it.length }.filter { it > 3 }.let(::println)
//sampleEnd
}
```
{kotlin-runnable="true"}

`let` 通常用于执行包含非空值的代码块。如需在可空对象上执行操作，请对其使用[安全调用运算符 `?.`](null-safety.md#safe-call-operator)，并在其 lambda 中调用包含这些操作的 `let`。

```kotlin
fun processNonNullString(str: String) {}

fun main() {
//sampleStart
    val str: String? = "Hello"   
    //processNonNullString(str)       // 编译错误：str 可能为 null
    val length = str?.let { 
        println("let() called on $it")        
        processNonNullString(it)      // 正确：在 '?.let { }' 内部 'it' 不为 null
        it.length
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

你还可以使用 `let` 引入作用域受限的局部变量，以使代码更易读。要为上下文对象定义新变量，请将其名称作为 lambda 实参提供，以便用其代替默认的 `it`。

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four")
    val modifiedFirstItem = numbers.first().let { firstItem ->
        println("The first item of the list is '$firstItem'")
        if (firstItem.length >= 5) firstItem else "!" + firstItem + "!"
    }.uppercase()
    println("First item after modifications: '$modifiedFirstItem'")
//sampleEnd
}
```
{kotlin-runnable="true"}

### with {id="with"}

- **上下文对象**作为接收者（`this`）可用。
- **返回值**是 lambda 结果。

由于 [`with`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/with.html) 不是扩展函数：上下文对象作为实参传递，但在 lambda 内部，它作为接收者（`this`）可用。

当你不需要使用返回结果时，建议使用 `with` 调用上下文对象上的函数。在代码中，`with` 可以理解为“*对于此对象，执行以下操作。*”

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three")
    with(numbers) {
        println("'with' is called with argument $this")
        println("It contains $size elements")
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

你还可以使用 `with` 引入一个辅助对象，其属性或函数用于计算值。

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three")
    val firstAndLast = with(numbers) {
        "The first element is ${first()}," +
        " the last element is ${last()}"
    }
    println(firstAndLast)
//sampleEnd
}
```
{kotlin-runnable="true"}

### run {id="run"}

- **上下文对象**作为接收者（`this`）可用。 
- **返回值**是 lambda 结果。

[`run`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/run.html) 的功能与 `with` 相同，但它是作为扩展函数实现的。因此与 `let` 一样，你可以使用点标记法在上下文对象上调用它。

当你的 lambda 既要初始化对象又要计算返回值时，`run` 非常有用。

```kotlin
class MultiportService(var url: String, var port: Int) {
    fun prepareRequest(): String = "Default request"
    fun query(request: String): String = "Result for query '$request'"
}

fun main() {
//sampleStart
    val service = MultiportService("https://example.kotlinlang.org", 80)

    val result = service.run {
        port = 8080
        query(prepareRequest() + " to port $port")
    }
    
    // 使用 let() 函数编写的相同代码：
    val letResult = service.let {
        it.port = 8080
        it.query(it.prepareRequest() + " to port ${it.port}")
    }
//sampleEnd
    println(result)
    println(letResult)
}
```
{kotlin-runnable="true"}

你还可以将 `run` 作为非扩展函数调用。非扩展形式的 `run` 没有上下文对象，但它仍然返回 lambda 结果。非扩展 `run` 允许你在需要表达式的位置执行由多个语句组成的代码块。在代码中，非扩展 `run` 可以理解为“*运行代码块并计算结果。*”

```kotlin
fun main() {
//sampleStart
    val hexNumberRegex = run {
        val digits = "0-9"
        val hexDigits = "A-Fa-f"
        val sign = "+-"
        
        Regex("[$sign]?[$digits$hexDigits]+")
    }
    
    for (match in hexNumberRegex.findAll("+123 -FFFF !%*& 88 XYZ")) {
        println(match.value)
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

### apply {id="apply"}

- **上下文对象**作为接收者（`this`）可用。 
- **返回值**是对象本身。

由于 [`apply`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/apply.html) 返回上下文对象本身，因此我们建议将其用于不返回值且主要操作接收者对象成员的代码块。`apply` 最常见的用例是对象配置。此类调用可以理解为“*将以下赋值应用于该对象。*”

```kotlin
data class Person(var name: String, var age: Int = 0, var city: String = "")

fun main() {
//sampleStart
    val adam = Person("Adam").apply {
        age = 32
        city = "London"        
    }
    println(adam)
//sampleEnd
}
```
{kotlin-runnable="true"}

`apply` 的另一个用例是将 `apply` 包含在多个调用链中以进行更复杂的处理。

### also {id="also"}

- **上下文对象**作为实参（`it`）可用。 
- **返回值**是对象本身。

[`also`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/also.html) 适用于执行将上下文对象作为实参的一些操作。对于需要引用对象本身而不是其属性和函数的操作，或者当你不希望遮蔽来自外部作用域的 `this` 引用时，请使用 `also`。

在代码中看到 `also` 时，可以将其理解为“*并且还对该对象执行以下操作。*”

```kotlin
fun main() {
//sampleStart
    val numbers = mutableListOf("one", "two", "three")
    numbers
        .also { println("The list elements before adding new one: $it") }
        .add("four")
//sampleEnd
}
```
{kotlin-runnable="true"}

## takeIf 与 takeUnless {id="takeif-and-takeunless"}

除了作用域函数外，标准库还包含函数 [`takeIf`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/take-if.html) 和 [`takeUnless`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/take-unless.html)。这些函数允许你在调用链中嵌入对对象状态的检查。 

当在对象上调用并传入谓词时，如果该对象满足给定的谓词，`takeIf` 将返回该对象；否则返回 `null`。因此，`takeIf` 是针对单个对象的过滤函数。

`takeUnless` 与 `takeIf` 的逻辑相反。当在对象上调用并传入谓词时，如果该对象满足给定的谓词，`takeUnless` 将返回 `null`；否则返回该对象。

使用 `takeIf` 或 `takeUnless` 时，该对象作为 lambda 实参（`it`）可用。

```kotlin
import kotlin.random.*

fun main() {
//sampleStart
    val number = Random.nextInt(100)

    val evenOrNull = number.takeIf { it % 2 == 0 }
    val oddOrNull = number.takeUnless { it % 2 == 0 }
    println("even: $evenOrNull, odd: $oddOrNull")
//sampleEnd
}
```
{kotlin-runnable="true"}

> 在 `takeIf` 和 `takeUnless` 之后链接其他函数时，不要忘记执行 null 检查或使用安全调用（`?.`），因为它们的返回值是可空的。
>
{style="tip"}

```kotlin
fun main() {
//sampleStart
    val str = "Hello"
    val caps = str.takeIf { it.isNotEmpty() }?.uppercase()
   //val caps = str.takeIf { it.isNotEmpty() }.uppercase() // 编译错误
    println(caps)
//sampleEnd
}
```
{kotlin-runnable="true"}

`takeIf` 和 `takeUnless` 与作用域函数结合使用时特别有用。例如，你可以将 `takeIf` 和 `takeUnless` 与 `let` 链接，以便在与给定谓词匹配的对象上运行代码块。为此，请在对象上调用 `takeIf`，然后通过安全调用（`?.`）调用 `let`。对于与谓词不匹配的对象，`takeIf` 返回 `null`，并且不会调用 `let`。

```kotlin
fun main() {
//sampleStart
    fun displaySubstringPosition(input: String, sub: String) {
        input.indexOf(sub).takeIf { it >= 0 }?.let {
            println("The substring $sub is found in $input.")
            println("Its start position is $it.")
        }
    }

    displaySubstringPosition("010000011", "11")
    displaySubstringPosition("010000011", "12")
//sampleEnd
}
```
{kotlin-runnable="true"}

作为对比，以下示例展示了在不使用 `takeIf` 或作用域函数的情况下如何编写相同的函数：

```kotlin
fun main() {
//sampleStart
    fun displaySubstringPosition(input: String, sub: String) {
        val index = input.indexOf(sub)
        if (index >= 0) {
            println("The substring $sub is found in $input.")
            println("Its start position is $index.")
        }
    }

    displaySubstringPosition("010000011", "11")
    displaySubstringPosition("010000011", "12")
//sampleEnd
}
```
{kotlin-runnable="true"}