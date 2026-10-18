[//]: # (title: 空安全)

<no-index/>

在 Kotlin 中，可能会存在 `null` 值。当某些内容缺失或尚未设置时，Kotlin 会使用 `null` 值。
在[集合](kotlin-tour-collections.md#kotlin-tour-map-no-key)一章中，当你尝试使用 Map 中不存在的键来访问键值对时，就已经见过 Kotlin 返回 `null` 值的示例。虽然以这种方式使用 `null` 值非常有用，但如果你的代码未做好处理它们的准备，可能会遇到问题。

为了防止程序中出现与 `null` 值相关的问题，Kotlin 引入了空安全（Null safety）机制。空安全会在编译时而非运行时检测与 `null` 值相关的潜在问题。

空安全是一组功能的结合，允许你：

* 显式声明程序中何时允许出现 `null` 值。
* 进行 null 检查。
* 对可能包含 `null` 值的属性或函数使用安全调用。
* 声明在检测到 `null` 值时要执行的操作。

## 可空类型 {id="nullable-types"}

Kotlin 支持可空类型，这使得声明的类型有可能具有 `null` 值。默认情况下，类型**不**允许接受 `null` 值。通过在类型声明后显式添加 `?` 来声明可空类型。

例如：

```kotlin
fun main() {
    // neverNull 属于 String 类型
    var neverNull: String = "This can't be null"

    // 抛出编译器错误
    neverNull = null

    // nullable 属于可空的 String 类型
    var nullable: String? = "You can keep a null here"

    // 这是允许的
    nullable = null

    // 默认情况下，不接受 null 值
    var inferredNonNull = "The compiler assumes non-nullable"

    // 抛出编译器错误
    inferredNonNull = null

    // notNull 不接受 null 值
    fun strLength(notNull: String): Int {                 
        return notNull.length
    }

    println(strLength(neverNull)) // 18
    println(strLength(nullable))  // 抛出编译器错误
}
```
{kotlin-runnable="true" validate="false" kotlin-min-compiler-version="1.3" id="kotlin-tour-nullable-type"}

> `length` 是 [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/) 类的一个属性，
> 其中包含字符串中的字符数。
>
{style="tip"}

## 检查 null 值 {id="check-for-null-values"}

你可以在条件表达式中检查是否存在 `null` 值。在以下示例中，`describeString()` 函数包含一个 `if` 语句，用于检查 `maybeString` 是否**不**为 `null` 且其 `length` 是否大于零：

```kotlin
fun describeString(maybeString: String?): String {
    if (maybeString != null && maybeString.length > 0) {
        return "String of length ${maybeString.length}"
    } else {
        return "Empty or null string"
    }
}

fun main() {
    val nullString: String? = null
    println(describeString(nullString))
    // Empty or null string
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-check-nulls"}

## 使用安全调用 {id="use-safe-calls"}

要安全地访问可能包含 `null` 值的对象的属性，请使用安全调用运算符 `?.`。如果对象本身或其访问的属性之一为 `null`，则安全调用运算符将返回 `null`。如果你希望避免代码因出现 `null` 值而引发错误，这将非常有用。

在以下示例中，`lengthString()` 函数使用安全调用来返回字符串的长度或 `null`：

```kotlin
fun lengthString(maybeString: String?): Int? = maybeString?.length

fun main() { 
    val nullString: String? = null
    println(lengthString(nullString))
    // null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-safe-call-property"}

> 安全调用可以链式调用，这样如果对象的任何属性包含 `null` 值，都会直接返回 `null` 而不会抛出错误。例如：
> 
> ```kotlin
>   person.company?.address?.country
> ```
>
{style="tip"}

安全调用运算符还可用于安全调用扩展方法或成员函数。在这种情况下，会在调用函数之前执行 null 检查。如果检查检测到 `null` 值，则会跳过调用并返回 `null`。

在以下示例中，`nullString` 为 `null`，因此跳过了 [`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase.html) 的调用并返回 `null`：

```kotlin
fun main() {
    val nullString: String? = null
    println(nullString?.uppercase())
    // null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-safe-call-function"}

## 使用 Elvis 运算符 {id="use-elvis-operator"}

通过使用 **Elvis 运算符** `?:`，你可以提供在检测到 `null` 值时返回的默认值。

在 Elvis 运算符的左侧编写应该检查是否为 `null` 值的内容。
在 Elvis 运算符的右侧编写如果检测到 `null` 值时应该返回的内容。

在以下示例中，`nullString` 为 `null`，因此访问 `length` 属性的安全调用会返回 `null` 值。
结果，Elvis 运算符返回了 `0`：

```kotlin
fun main() {
    val nullString: String? = null
    println(nullString?.length ?: 0)
    // 0
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-elvis-operator"}

要了解更多关于 Kotlin 空安全的信息，请参阅[空安全](null-safety.md)。

## 练习 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true">
<def title="计算员工薪水" id="null-safety-basics-exercise-1">

你有一个 `employeeById` 函数，可以通过它访问某家公司的员工数据库。不幸的是，该函数返回 `Employee?` 类型的值，因此结果可能为 `null`。你的目标是编写一个函数，在提供员工的 `id` 时返回其薪水；如果数据库中不存在该员工，则返回 `0`。

```kotlin
data class Employee (val name: String, var salary: Int)

fun employeeById(id: Int) = when(id) {
    1 -> Employee("Mary", 20)
    2 -> null
    3 -> Employee("John", 21)
    4 -> Employee("Ann", 23)
    else -> null
}

fun salaryById(id: Int) = // 在此处编写你的代码

fun main() {
    println((1..5).sumOf { id -> salaryById(id) })
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-null-safety-exercise"}

```kotlin
data class Employee (val name: String, var salary: Int)

fun employeeById(id: Int) = when(id) {
    1 -> Employee("Mary", 20)
    2 -> null
    3 -> Employee("John", 21)
    4 -> Employee("Ann", 23)
    else -> null
}

fun salaryById(id: Int) = employeeById(id)?.salary ?: 0

fun main() {
    println((1..5).sumOf { id -> salaryById(id) })
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解决方案" id="kotlin-tour-null-safety-solution"}

</def>
</deflist>

## 下一步？ {id="what-s-next"}

祝贺你！既然你已经完成了初学者导览，接下来通过我们的中级导览将你对 Kotlin 的理解提升到新的层次：

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-classes.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-extension-functions.md" mode="classic" icon="arrow-right" icon-position="right">开始 Kotlin 中级导览</a>
  </li>
</list>