[//]: # (title: 空安全)

空安全是 Kotlin 的一项特性，旨在显著降低出现 null 引用的风险，这也被称为[十亿美元的错误](https://en.wikipedia.org/wiki/Null_pointer#History)。

包括 Java 在内的许多编程语言中最常见的陷阱之一是，访问 null 引用的成员会导致 null 引用异常。在 Java 中，这相当于 `NullPointerException`（简称 NPE）。

Kotlin 将可空性显式支持作为其类型系统的一部分，这意味着你可以显式声明哪些变量或属性允许为 `null`。此外，当你声明不可空变量时，编译器会强制要求这些变量不能持有 `null` 值，从而防止 NPE。

Kotlin 的空安全通过在编译时而非运行时捕获潜在的 null 相关问题，确保了代码更加安全。这一特性通过显式表达 `null` 值，提升了代码的健壮性、可读性和可维护性，使代码更易于理解和管理。

在 Kotlin 中，发生 NPE 的唯一可能原因是：

* 显式调用 [`throw NullPointerException()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-null-pointer-exception/)。
* 使用了[非空断言运算符 `!!`](#not-null-assertion-operator)。
* 初始化期间的数据不一致，例如：
  * 在构造函数中使用了在别处可用的未初始化 `this`（[“泄漏的 `this`”](https://youtrack.jetbrains.com/issue/KTIJ-9751)）。
  * [超类构造函数调用了一个 open 成员](inheritance.md#derived-class-initialization-order)，而该成员在派生类中的实现使用了未初始化的状态。
* Java 互操作：
  * 尝试访问[平台类型](java-interop.md#null-safety-and-platform-types)的 `null` 引用的成员。
  * 泛型类型的可空性问题。例如，一段 Java 代码将 `null` 添加到了 Kotlin 的 `MutableList<String>` 中，而这本应需要 `MutableList<String?>` 才能正确处理。
  * 外部 Java 代码引起的其他问题。

> 除了 NPE 之外，另一个与空安全相关的异常是 [`UninitializedPropertyAccessException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-uninitialized-property-access-exception/)。当你尝试访问尚未初始化的属性时，Kotlin 会抛出此异常，以确保不可空属性在准备就绪前不会被使用。这通常发生在 [`lateinit` 属性](properties.md#late-initialized-properties-and-variables)上。
>
{style="tip"}

## 可空类型与不可空类型

在 Kotlin 中，类型系统区分了可以持有 `null` 的类型（可空类型）和不能持有 `null` 的类型（不可空类型）。例如，一个普通的 `String` 类型变量不能持有 `null`：

```kotlin
fun main() {
//sampleStart
    // 将非空字符串赋值给变量
    var a: String = "abc"
    // 尝试将 null 重新赋值给不可空变量
    a = null
    print(a)
    // Null 不能作为不可空类型 String 的值
//sampleEnd
}
```
{kotlin-runnable="true" validate="false"}

你可以安全地在 `a` 上调用方法或访问属性。这保证了不会引起 NPE，因为 `a` 是一个不可空变量。编译器确保 `a` 始终持有一个有效的 `String` 值，因此在它为 `null` 时不存在访问其属性或方法的风险：

```kotlin
fun main() {
//sampleStart
    // 将非空字符串赋值给变量
    val a: String = "abc"
    // 返回不可空变量的长度
    val l = a.length
    print(l)
    // 3
//sampleEnd
}
```
{kotlin-runnable="true" validate="false"}

若要允许 `null` 值，请在变量类型后面紧跟一个 `?` 符号来声明变量。例如，你可以通过编写 `String?` 来声明一个可空字符串。这个表达式使 `String` 成为一个可以接受 `null` 的类型：

```kotlin
fun main() {
//sampleStart
    // 将可空字符串赋值给变量
    var b: String? = "abc"
    // 成功将 null 重新赋值给可空变量
    b = null
    print(b)
    // null
//sampleEnd
}
```
{kotlin-runnable="true"}

如果你尝试直接在 `b` 上访问 `length`，编译器会报错。这是因为 `b` 被声明为可空变量，可能持有 `null` 值。尝试直接访问可空对象的属性会导致 NPE：

```kotlin
fun main() {
//sampleStart
    // 将可空字符串赋值给变量
    var b: String? = "abc"
    // 将 null 重新赋值给可空变量
    b = null
    // 尝试直接返回可空变量的长度
    val l = b.length
    print(l)
    // 对于类型为 String? 的可空接收器，只允许安全调用 (?.) 或非空断言调用 (!!.)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" validate="false"}

在上面的示例中，编译器要求你在访问属性或执行操作之前使用安全调用来检查可空性。处理可空对象有几种方法：

* [使用 `if` 条件表达式检查 `null`](#check-for-null-with-the-if-conditional)
* [安全调用运算符 `?.`](#safe-call-operator)
* [Elvis 运算符 `?:`](#elvis-operator)
* [非空断言运算符 `!!`](#not-null-assertion-operator)
* [可空接收器](#nullable-receiver)
* [`let` 函数](#let-function)
* [安全转换 `as?`](#safe-casts)
* [可空类型的集合](#collections-of-a-nullable-type)

请阅读以下各节，了解 `null` 处理工具和技术的详细信息及示例。

## 使用 if 条件表达式检查 null

在处理可空类型时，你需要安全地处理可空性以避免 NPE。一种方法是使用 `if` 条件表达式显式检查可空性。

例如，检查 `b` 是否为 `null`，然后访问 `b.length`：

```kotlin
fun main() {
//sampleStart
    // 将 null 赋值给可空变量
    val b: String? = null
    // 先检查可空性，然后访问长度
    val l = if (b != null) b.length else -1
    print(l)
    // -1
//sampleEnd
}
```
{kotlin-runnable="true"}

在上面的示例中，编译器执行了[智能转换](typecasts.md#smart-casts)，将类型从可空 `String?` 更改为不可空 `String`。它还会跟踪你执行的检查信息，并允许在 `if` 条件内部调用 `length`。

同样支持更复杂的条件：

```kotlin
fun main() {
//sampleStart
    // 将可空字符串赋值给变量
    val b: String? = "Kotlin"

    // 先检查可空性，然后访问长度
    if (b != null && b.length > 0) {
        print("String of length ${b.length}")
        // String of length 6
    } else {
        // 如果不满足条件，则提供备选方案
        print("Empty string")
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

请注意，上面的示例仅在编译器能够保证 `b` 在检查和使用之间不发生变化时才有效，这与[智能转换的前提条件](typecasts.md#smart-cast-prerequisites)相同。

## 安全调用运算符

安全调用运算符 `?.` 允许你以更简短的形式安全地处理可空性。如果对象为 `null`，`?.` 运算符不会抛出 NPE，而是简单地返回 `null`：

```kotlin
fun main() {
//sampleStart
    // 将可空字符串赋值给变量
    val a: String? = "Kotlin"
    // 将 null 赋值给可空变量
    val b: String? = null
    
    // 检查可空性并返回长度或 null
    println(a?.length)
    // 6
    println(b?.length)
    // null
//sampleEnd
}
```
{kotlin-runnable="true"}

`b?.length` 表达式会检查可空性，如果 `b` 非空则返回 `b.length`，否则返回 `null`。该表达式的类型是 `Int?`。

你可以在 Kotlin 中对 [`var` 和 `val` 变量](basic-syntax.md#variables)使用 `?.` 运算符：

* 可空 `var` 可以持有 `null`（例如 `var nullableValue: String? = null`）或非空值（例如 `var nullableValue: String? = "Kotlin"`）。如果是非空值，你可以随时将其更改为 `null`。
* 可空 `val` 可以持有 `null`（例如 `val nullableValue: String? = null`）或非空值（例如 `val nullableValue: String? = "Kotlin"`）。如果是非空值，你随后不能将其更改为 `null`。

安全调用在链式调用中非常有用。例如，Bob 是一名员工，他可能会被分配到一个部门（也可能没有）。该部门反过来可能由另一名员工担任部门主管。要获取 Bob 部门主管的名字（如果存在），你可以这样写：

```kotlin
bob?.department?.head?.name
```

如果链中的任何属性为 `null`，则此链式调用将返回 `null`。

你也可以将安全调用放在赋值号的左侧：

```kotlin
person?.department?.head = managersPool.getManager()
```

在上面的示例中，如果安全调用链中的任何一个接收器为 `null`，赋值将被跳过，右侧的表达式根本不会求值。例如，如果 `person` 或 `person.department` 为 `null`，则该函数不会被调用。这等同于使用 `if` 条件表达式进行相同的安全调用：

```kotlin
if (person != null && person.department != null) {
    person.department.head = managersPool.getManager()
}
```

## Elvis 运算符

在处理可空类型时，你可以检查 `null` 并提供一个替代值。例如，如果 `b` 不为 `null`，则访问 `b.length`。否则，返回一个替代值：

```kotlin
fun main() {
//sampleStart
    // 将 null 赋值给可空变量  
    val b: String? = null
    // 检查可空性。如果不为 null，则返回长度。如果为 null，则返回 0
    val l: Int = if (b != null) b.length else 0
    println(l)
    // 0
//sampleEnd
}
```
{kotlin-runnable="true"}

你可以使用 Elvis 运算符 `?:` 以更简洁的方式处理此问题，而不必编写完整的 `if` 表达式：

```kotlin
fun main() {
//sampleStart
    // 将 null 赋值给可空变量  
    val b: String? = null
    // 检查可空性。如果不为 null，则返回长度。如果为 null，则返回一个非空值
    val l = b?.length ?: 0
    println(l)
    // 0
//sampleEnd
}
```
{kotlin-runnable="true"}

如果 `?:` 左侧的表达式不为 `null`，Elvis 运算符将返回该结果。否则，Elvis 运算符将返回右侧的表达式。只有在左侧为 `null` 时，才会对右侧的表达式求值。

由于在 Kotlin 中 `throw` 和 `return` 也是表达式，因此你也可以在 Elvis 运算符的右侧使用它们。这在检查函数参数等场景中非常方便：

```kotlin
fun foo(node: Node): String? {
    // 检查 getParent()。如果不为 null，则将其赋值给 parent。如果为 null，则返回 null
    val parent = node.getParent() ?: return null
    // 检查 getName()。如果不为 null，则将其赋值给 name。如果为 null，则抛出异常
    val name = node.getName() ?: throw IllegalArgumentException("name expected")
    // ...
}
```

## 非空断言运算符

非空断言运算符 `!!` 将任何值转换为不可空类型。

当你对一个值不为 `null` 的变量应用 `!!` 运算符时，它会被安全地视为不可空类型，代码正常执行。但是，如果值为 `null`，`!!` 运算符会强制将其视为不可空，从而导致 NPE。

当 `b` 不为 `null` 且 `!!` 运算符使其返回非空值（在本例中为 `String`）时，它能正确访问 `length`：

```kotlin
fun main() {
//sampleStart
    // 将可空字符串赋值给变量
    val b: String? = "Kotlin"
    // 将 b 视为非空并访问其长度
    val l = b!!.length
    println(l)
    // 6
//sampleEnd
}
```
{kotlin-runnable="true"}

当 `b` 为 `null` 且 `!!` 运算符使其返回其非空值时，会发生 NPE：

```kotlin
fun main() {
//sampleStart
    // 将 null 赋值给可空变量  
    val b: String? = null
    // 将 b 视为非空并尝试访问其长度
    val l = b!!.length
    println(l) 
    // main 线程中出现异常 "java.lang.NullPointerException"
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" validate="false"}

当你确信某个值不为 `null` 且没有发生 NPE 的可能性，但编译器由于某些规则无法保证这一点时，`!!` 运算符特别有用。在这种情况下，你可以使用 `!!` 运算符显式告知编译器该值不为 `null`。

## 可空接收器

你可以对[可空接收器类型](extensions.md#nullable-receivers)使用扩展函数，从而允许在可能为 `null` 的变量上调用这些函数。

通过在可空接收器类型上定义扩展函数，你可以在函数内部处理 `null` 值，而无需在调用函数的每个地方都检查 `null`。

例如，可以在可空接收器上调用 [`.toString()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/to-string.html) 扩展函数。当在 `null` 值上调用时，它会安全地返回字符串 `"null"` 而不会抛出异常：

```kotlin
//sampleStart
fun main() {
    // 将 null 赋值给存储在 person 变量中的可空 Person 对象
    val person: Person? = null

    // 对可空 person 变量应用 .toString 并打印字符串
    println(person.toString())
    // null
}

// 定义一个简单的 Person 类
data class Person(val name: String)
//sampleEnd
```
{kotlin-runnable="true"}

在上面的示例中，即使 `person` 为 `null`，`.toString()` 函数也会安全地返回字符串 `"null"`。这对于调试和日志记录非常有用。

如果你希望 `.toString()` 函数返回一个可空字符串（要么是字符串表示形式，要么是 `null`），请使用[安全调用运算符 `?.`](#safe-call-operator)。`?.` 运算符仅在对象不为 `null` 时才调用 `.toString()`，否则返回 `null`：

```kotlin
//sampleStart
fun main() {
    // 将可空 Person 对象赋值给变量
    val person1: Person? = null
    val person2: Person? = Person("Alice")

    // 如果 person 为 null 则打印 "null"；否则打印 person.toString() 的结果
    println(person1?.toString())
    // null
    println(person2?.toString())
    // Person(name=Alice)
}

// 定义一个 Person 类
data class Person(val name: String)
//sampleEnd
```
{kotlin-runnable="true"}

`?.` 运算符允许你安全地处理潜在的 `null` 值，同时仍能访问可能为 `null` 的对象的属性或函数。

## Let 函数

为了处理 `null` 值并仅对非空类型执行操作，你可以将安全调用运算符 `?.` 与 [`let` 函数](scope-functions.md#let)结合使用。

这种组合对于评估表达式、检查结果是否为 `null` 以及仅在结果不为 `null` 时执行代码非常有用，从而避免了手动 null 检查：

```kotlin
fun main() {
//sampleStart
    // 声明一个包含可空字符串的列表
    val listWithNulls: `List<String?>` = listOf("Kotlin", null)

    // 遍历列表中的每一项
    for (item in listWithNulls) {
        // 检查项是否为 null，仅打印非空值
        item?.let { println(it) }
        //Kotlin 
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

## 安全转换

Kotlin 中用于[类型转换](typecasts.md#unsafe-cast-operator)的常规运算符是 `as` 运算符。然而，如果对象不是目标类型，常规转换可能会导致异常。

你可以使用 `as?` 运算符进行安全转换。它尝试将值转换为指定类型，如果该值不是该类型，则返回 `null`：

```kotlin
fun main() {
//sampleStart
    // 声明一个 Any 类型的变量，它可以持有任何类型的值
    val a: Any = "Hello, Kotlin!"

    // 使用 'as?' 运算符安全转换为 Int
    val aInt: Int? = a as? Int
    // 使用 'as?' 运算符安全转换为 String
    val aString: String? = a as? String

    println(aInt)
    // null
    println(aString)
    // "Hello, Kotlin!"
//sampleEnd
}
```
{kotlin-runnable="true"}

上面的代码打印了 `null`，因为 `a` 不是 `Int`，所以转换安全地失败了。它还打印了 `"Hello, Kotlin!"`，因为它匹配 `String?` 类型，所以安全转换成功。

## 可空类型的集合

如果你有一个包含可空元素的集合，并且只想保留非空元素，请使用 `filterNotNull()` 函数：

```kotlin
fun main() {
//sampleStart
    // 声明一个包含一些 null 和非空整数值的列表
    val nullableList: `List<Int?>` = listOf(1, 2, null, 4)

    // 过滤掉 null 值，得到一个由非空整数组成的列表
    val intList: `List<Int>` = nullableList.filterNotNull()
  
    println(intList)
    // [1, 2, 4]
//sampleEnd
}
```
{kotlin-runnable="true"}

## 下一步是什么？

* 了解如何[处理 Java 和 Kotlin 中的可空性](java-to-kotlin-nullability-guide.md)。
* 了解[绝对不可空](generics.md#definitely-non-nullable-types)的泛型类型。