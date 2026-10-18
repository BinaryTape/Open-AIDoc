[//]: # (title: 类)

<no-index/>

Kotlin 通过类和对象支持面向对象编程。对象非常适合在程序中存储数据。
类允许你声明对象的一组特征。当你从类创建对象时，可以节省时间和精力，因为你不必每次都声明这些特征。

要声明一个类，请使用 `class` 关键字：

```kotlin
class Customer
```

## 属性 {id="properties"}

类对象的特征可以在属性中声明。你可以为类声明属性：

* 在类名后的圆括号 `()` 内。
```kotlin
class Contact(val id: Int, var email: String)
```

* 在由花括号 `{}` 定义的类体内。
```kotlin
class Contact(val id: Int, var email: String) {
    val category: String = ""
}
```

我们建议你将属性声明为只读（`val`），除非在创建类的实例后需要对其进行更改。

你可以在圆括号内声明不带 `val` 或 `var` 的属性，但在创建实例后这些属性是无法访问的。

> * 圆括号 `()` 内包含的内容称为**类头**。
> * 声明类属性时可以使用[尾随逗号](coding-conventions.md#trailing-commas)。
>
{style="note"}

就像函数形参一样，类属性也可以具有默认值：
```kotlin
class Contact(val id: Int, var email: String = "example@gmail.com") {
    val category: String = "work"
}
```

## 创建实例 {id="create-instance"}

要从类创建对象，可以使用**构造函数**声明一个类**实例**。

默认情况下，Kotlin 会自动创建一个包含在类头中声明的形参的构造函数。

例如：
```kotlin
class Contact(val id: Int, var email: String)

fun main() {
    val contact = Contact(1, "mary@gmail.com")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-class-create-instance"}

在该示例中：

* `Contact` 是一个类。
* `contact` 是 `Contact` 类的一个实例。
* `id` 和 `email` 是属性。
* `id` 和 `email` 与默认构造函数一起用于创建 `contact`。

Kotlin 类可以有多个构造函数，包括你自己定义的构造函数。要详细了解如何声明多个构造函数，请参阅[构造函数](classes.md#constructors-and-initializer-blocks)。

## 访问属性 {id="access-properties"}

要访问实例的属性，请在实例名称后加上点号 `.` 以及属性名称：

```kotlin
class Contact(val id: Int, var email: String)

fun main() {
    val contact = Contact(1, "mary@gmail.com")
    
    // 打印属性值：email
    println(contact.email)           
    // mary@gmail.com

    // 更新属性值：email
    contact.email = "jane@gmail.com"
    
    // 打印属性的新值：email
    println(contact.email)           
    // jane@gmail.com
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-access-property"}

> 要将属性的值作为字符串的一部分进行串联，可以使用字符串模板（`$`）。
> 例如：
> ```kotlin
> println("Their email address is: ${contact.email}")
> ```
>
{style="tip"}

## 成员函数 {id="member-functions"}

除了将属性声明为对象特征的一部分外，你还可以使用成员函数来定义对象的行为。

在 Kotlin 中，成员函数必须在类体内声明。要调用实例上的成员函数，请在实例名称后加上点号 `.` 以及函数名称。例如：

```kotlin
class Contact(val id: Int, var email: String) {
    fun printId() {
        println(id)
    }
}

fun main() {
    val contact = Contact(1, "mary@gmail.com")
    // 调用成员函数 printId()
    contact.printId()           
    // 1
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-member-function"}

## 数据类 {id="data-classes"}

Kotlin 拥有**数据类**，这在存储数据时特别有用。数据类具有与普通类相同的功能，但它们自动附带额外的成员函数。这些成员函数允许你轻松地将实例打印为易读的输出、比较类的实例、复制实例等。由于这些函数是自动提供的，因此你不必花时间为每个类编写相同的模板代码。

要声明数据类，请使用关键字 `data`：

```kotlin
data class User(val name: String, val id: Int)
```

Kotlin 编译器在生成成员函数时，仅使用在[主构造函数](classes.md#primary-constructor)中定义的属性。如果在数据类体内声明属性，它们将不会包含在生成的函数输出中。

数据类最实用的预定义成员函数是：

| **函数**           | **说明**                                                                                   |
|--------------------|------------------------------------------------------------------------------------------|
| `toString()`       | 打印类实例及其属性的易读字符串。                                                          |
| `equals()` 或 `==` | 比较类的实例。                                                                           |
| `copy()`           | 通过复制另一个实例来创建类实例，可以包含一些不同的属性。                                  |

请参阅以下各节，查看如何使用每个函数的示例：

* [打印为字符串](#print-as-string)
* [比较实例](#compare-instances)
* [复制实例](#copy-instance)

### 打印为字符串 {id="print-as-string"}

要打印类实例的易读字符串，可以显式调用 `toString()` 函数，或者使用自动为你调用 `toString()` 的打印函数（`println()` 和 `print()`）：

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    //sampleStart
    val user = User("Alex", 1)
    
    // 自动使用 toString() 函数，以便输出更易读
    println(user)            
    // User(name=Alex, id=1)
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-data-classes-print-string"}

这在调试或创建日志时尤其有用。

### 比较实例 {id="compare-instances"}

要比较数据类实例，请使用相等运算符 `==`：

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    //sampleStart
    val user = User("Alex", 1)
    val secondUser = User("Alex", 1)
    val thirdUser = User("Max", 2)

    // 将 user 与第二个 user 比较
    println("user == secondUser: ${user == secondUser}") 
    // user == secondUser: true
    
    // 将 user 与第三个 user 比较
    println("user == thirdUser: ${user == thirdUser}")   
    // user == thirdUser: false
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-data-classes-compare-instances"}

### 复制实例 {id="copy-instance"}

要创建数据类实例的完全相同副本，请在实例上调用 `copy()` 函数。

要创建数据类实例的副本**并**更改某些属性，请在实例上调用 `copy()` 函数，**并**添加属性的替换值作为函数实参。

例如：

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    //sampleStart
    val user = User("Alex", 1)

    // 创建 user 的完全副本
    println(user.copy())       
    // User(name=Alex, id=1)

    // 创建 user 的副本，并将 name 设为："Max"
    println(user.copy("Max"))  
    // User(name=Max, id=1)

    // 创建 user 的副本，并将 id 设为：3
    println(user.copy(id = 3)) 
    // User(name=Alex, id=3)
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-data-classes-copy-instance"}

创建实例的副本比修改原始实例更安全，因为任何依赖原始实例的代码都不会受到该副本以及你对其所做操作的影响。

有关数据类的更多信息，请参阅[数据类](data-classes.md)。

本导览的最后一章是关于 Kotlin 的[空安全](kotlin-tour-null-safety.md)。

## 练习 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="声明数据类" id="classes-exercise-1">

定义一个包含两个属性的数据类 `Employee`：一个用于姓名，另一个用于薪水。确保薪水属性是可变的，否则在年底你将无法获得加薪！main 函数演示了如何使用该数据类。

```kotlin
// 在此处编写你的代码

fun main() {
    val emp = Employee("Mary", 20)
    println(emp)
    emp.salary += 10
    println(emp)
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-exercise-1"}

```kotlin
data class Employee(val name: String, var salary: Int)

fun main() {
    val emp = Employee("Mary", 20)
    println(emp)
    emp.salary += 10
    println(emp)
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考解决方案" id="kotlin-tour-classes-solution-1"}

</def>
<def title="声明嵌套数据类" id="classes-exercise-2">

声明使此代码能够编译所需的额外数据类。

```kotlin
data class Person(val name: Name, val address: Address, val ownsAPet: Boolean = true)
// 在此处编写你的代码
// data class Name(...)

fun main() {
    val person = Person(
        Name("John", "Smith"),
        Address("123 Fake Street", City("Springfield", "US")),
        ownsAPet = false
    )
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-exercise-2"}

```kotlin
data class Person(val name: Name, val address: Address, val ownsAPet: Boolean = true)
data class Name(val first: String, val last: String)
data class Address(val street: String, val city: City)
data class City(val name: String, val countryCode: String)

fun main() {
    val person = Person(
        Name("John", "Smith"),
        Address("123 Fake Street", City("Springfield", "US")),
        ownsAPet = false
    )
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考解决方案" id="kotlin-tour-classes-solution-2"}

</def>
<def title="使用类生成随机员工" id="classes-exercise-3">

为了测试代码，你需要一个能够生成随机员工的生成器。定义一个带有固定候选名字列表（在类体内）的 `RandomEmployeeGenerator` 类。为该类配置最低和最高薪水（在类头中）。在类体内定义 `generateEmployee()` 函数。同样地，main 函数演示了如何使用该类。

> 在本练习中，你需要导入一个软件包以便能够使用 [`Random.nextInt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.random/-random/next-int.html) 函数。
> 有关导入软件包的更多信息，请参阅[软件包和导入](packages.md)。
>
{style="tip"}

<deflist collapsible="true" id="kotlin-tour-classes-exercise-3-hint-1">
    <def title="提示 1">
        列表具有一个名为 <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/random.html"><code>.random()</code></a> 的扩展函数，可返回列表中的随机项。
    </def>
</deflist>

<deflist collapsible="true" id="kotlin-tour-classes-exercise-3-hint-2">
    <def title="提示 2">
        <code>Random.nextInt(from = ..., until = ...)</code> 可以返回指定范围内的随机 <code>Int</code> 数字。
    </def>
</deflist>

```kotlin
import kotlin.random.Random

data class Employee(val name: String, var salary: Int)

// 在此处编写你的代码

fun main() {
    val empGen = RandomEmployeeGenerator(10, 30)
    println(empGen.generateEmployee())
    println(empGen.generateEmployee())
    println(empGen.generateEmployee())
    empGen.minSalary = 50
    empGen.maxSalary = 100
    println(empGen.generateEmployee())
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-exercise-3"}

```kotlin
import kotlin.random.Random

data class Employee(val name: String, var salary: Int)

class RandomEmployeeGenerator(var minSalary: Int, var maxSalary: Int) {
    val names = listOf("John", "Mary", "Ann", "Paul", "Jack", "Elizabeth")
    fun generateEmployee() =
        Employee(names.random(),
            Random.nextInt(from = minSalary, until = maxSalary))
}

fun main() {
    val empGen = RandomEmployeeGenerator(10, 30)
    println(empGen.generateEmployee())
    println(empGen.generateEmployee())
    println(empGen.generateEmployee())
    empGen.minSalary = 50
    empGen.maxSalary = 100
    println(empGen.generateEmployee())
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考解决方案" id="kotlin-tour-classes-solution-3"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-functions.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-null-safety.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>