[//]: # (title: 类)

<no-index/>

<tldr>
    <p><img src="icon-1-done.svg" width="20" alt="第一步" /> <a href="kotlin-tour-hello-world.md">Hello world</a><br />
        <img src="icon-2-done.svg" width="20" alt="第二步" /> <a href="kotlin-tour-basic-types.md">基本类型</a><br />
        <img src="icon-3-done.svg" width="20" alt="第三步" /> <a href="kotlin-tour-collections.md">集合</a><br />
        <img src="icon-4-done.svg" width="20" alt="第四步" /> <a href="kotlin-tour-control-flow.md">控制流</a><br />
        <img src="icon-5-done.svg" width="20" alt="第五步" /> <a href="kotlin-tour-functions.md">函数</a><br />
        <img src="icon-6.svg" width="20" alt="第六步" /> <strong>类</strong><br />
        <img src="icon-7-todo.svg" width="20" alt="最后一步" /> <a href="kotlin-tour-null-safety.md">null 安全</a></p>
</tldr>

Kotlin 支持使用类和对象进行面向对象编程。对象对于在程序中存储数据非常有用。
类允许您为对象声明一组特征。从类创建对象时，您可以节省
时间和精力，因为您不必每次都声明这些特征。

要声明类，请使用 `class` 关键字： 

```kotlin
class Customer
```

## 属性

类对象的特征可以在属性中声明。您可以为类声明属性：

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

我们建议您将属性声明为只读 (`val`)，除非在创建类实例后需要对其进行更改。

您可以在圆括号内声明不带 `val` 或 `var` 的属性，但这些属性在创建实例后无法访问。

> * 圆括号 `()` 中包含的内容称为**类头**。
> * 在声明类属性时，您可以使用 [尾随逗号](coding-conventions.md#trailing-commas)。
>
{style="note"}

就像函数参数一样，类属性可以有默认值：
```kotlin
class Contact(val id: Int, var email: String = "example@gmail.com") {
    val category: String = "work"
}
```

## 创建实例

要从类创建对象，您需要使用**构造函数**声明类**实例**。

默认情况下，Kotlin 会自动创建一个构造函数，其参数就是在类头中声明的属性。

例如：
```kotlin
class Contact(val id: Int, var email: String)

fun main() {
    val contact = Contact(1, "mary@gmail.com")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-class-create-instance"}

在此示例中：

* `Contact` 是一个类。
* `contact` 是 `Contact` 类的一个实例。
* `id` 和 `email` 是属性。
* `id` 和 `email` 与默认构造函数一起使用来创建 `contact`。

Kotlin 类可以有多个构造函数，包括您自己定义的构造函数。要了解有关如何声明多个构造函数的更多信息，请参阅 [构造函数](classes.md#constructors-and-initializer-blocks)。

## 访问属性

要访问实例的属性，请在实例名称后加上句点 `.`，然后写上属性名称：

```kotlin
class Contact(val id: Int, var email: String)

fun main() {
    val contact = Contact(1, "mary@gmail.com")
    
    // 打印属性的值：email
    println(contact.email)           
    // mary@gmail.com

    // 更新属性的值：email
    contact.email = "jane@gmail.com"
    
    // 打印属性的新值：email
    println(contact.email)           
    // jane@gmail.com
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-access-property"}

> 要将属性的值作为字符串的一部分进行串联，可以使用字符串模板 (`${}`)。
> 例如：
> ```kotlin
> println("Their email address is: ${contact.email}")
> ```
>
{style="tip"}

## 成员函数

除了将属性声明为对象特征的一部分外，您还可以通过成员函数定义对象的行为。

在 Kotlin 中，成员函数必须在类体内声明。要在实例上调用成员函数，请在实例名称后加上句点 `.`，然后写上函数名称。例如：

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

## 数据类

Kotlin 拥有**数据类**，这在存储数据时特别有用。数据类具有与普通类相同的功能，但它们会自动带有额外的成员函数。这些成员函数允许您轻松地将实例打印为可读输出、比较类的实例、复制实例等。由于这些函数是自动可用的，您不必为每个类编写相同的模板代码。

要声明数据类，请使用关键字 `data`：

```kotlin
data class User(val name: String, val id: Int)
```

Kotlin 编译器在生成成员函数时，仅使用在 [主构造函数](classes.md#primary-constructor) 中定义的属性。如果在数据类体内声明属性，它们将不会包含在生成的函数输出中。

数据类中最有用的预定义成员函数是：

| **函数**           | **说明**                                                                 |
|--------------------|--------------------------------------------------------------------------|
| `toString()`       | 打印类实例及其属性的可读字符串。                                         |
| `equals()` 或 `==` | 比较类的实例。                                                           |
| `copy()`           | 通过复制另一个实例来创建类实例，可以指定某些不同的属性。                 |

请参阅以下各节以了解如何使用这些函数的示例：

* [打印为字符串](#print-as-string)
* [比较实例](#compare-instances)
* [复制实例](#copy-instance)

### 打印为字符串

要打印类实例的可读字符串，您可以显式调用 `toString()` 函数，或使用自动为您调用 `toString()` 的打印函数（`println()` 和 `print()`）：

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    //sampleStart
    val user = User("Alex", 1)
    
    // 自动使用 toString() 函数，使输出易于阅读
    println(user)            
    // User(name=Alex, id=1)
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-data-classes-print-string"}

这在调试或创建日志时特别有用。

### 比较实例

要比较数据类实例，请使用相等运算符 `==`：

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    //sampleStart
    val user = User("Alex", 1)
    val secondUser = User("Alex", 1)
    val thirdUser = User("Max", 2)

    // 比较 user 和 secondUser
    println("user == secondUser: ${user == secondUser}") 
    // user == secondUser: true
    
    // 比较 user 和 thirdUser
    println("user == thirdUser: ${user == thirdUser}")   
    // user == thirdUser: false
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-data-classes-compare-instances"}

### 复制实例

要创建数据类实例的精确副本，请在实例上调用 `copy()` 函数。

要创建数据类实例的副本**并**更改某些属性，请在实例上调用 `copy()` 函数，**并**在函数参数中添加属性的替换值。

例如：

```kotlin
data class User(val name: String, val id: Int)

fun main() {
    //sampleStart
    val user = User("Alex", 1)

    // 创建 user 的精确副本
    println(user.copy())       
    // User(name=Alex, id=1)

    // 创建 name 为 "Max" 的 user 副本
    println(user.copy("Max"))  
    // User(name=Max, id=1)

    // 创建 id 为 3 的 user 副本
    println(user.copy(id = 3)) 
    // User(name=Alex, id=3)
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-data-classes-copy-instance"}

创建实例的副本比修改原始实例更安全，因为任何依赖于原始实例的代码都不会受到副本及其后续操作的影响。

有关数据类的更多信息，请参阅 [数据类](data-classes.md)。

本教程的最后一章关于 Kotlin 的 [null 安全](kotlin-tour-null-safety.md)。

## 练习

### 练习 1 {initial-collapse-state="collapsed" collapsible="true"}

定义一个带有两个属性的数据类 `Employee`：一个是姓名，另一个是薪水。确保薪水属性是可变的，否则在年底你将无法获得加薪！`main` 函数演示了如何使用这个数据类。

|---|---|
```kotlin
// 在此处编写代码

fun main() {
    val emp = Employee("Mary", 20)
    println(emp)
    emp.salary += 10
    println(emp)
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-exercise-1"}

|---|---|
```kotlin
data class Employee(val name: String, var salary: Int)

fun main() {
    val emp = Employee("Mary", 20)
    println(emp)
    emp.salary += 10
    println(emp)
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法" id="kotlin-tour-classes-solution-1"}

### 练习 2 {initial-collapse-state="collapsed" collapsible="true"}

声明使此代码编译所需的额外数据类。

|---|---|
```kotlin
data class Person(val name: Name, val address: Address, val ownsAPet: Boolean = true)
// 在此处编写代码
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

|---|---|
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法" id="kotlin-tour-classes-solution-2"}

### 练习 3 {initial-collapse-state="collapsed" collapsible="true"}

为了测试你的代码，你需要一个可以创建随机员工的生成器。定义一个 `RandomEmployeeGenerator` 类，并在类体内包含一个固定的潜在姓名列表。在类头中为该类配置最小和最大薪水。在类体内，定义 `generateEmployee()` 函数。再次强调，`main` 函数演示了如何使用这个类。

> 在这个练习中，你需要导入一个软件包以便使用 [`Random.nextInt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.random/-random/next-int.html) 函数。
> 有关导入软件包的更多信息，请参阅 [软件包与导入](packages.md)。
>
{style="tip"}

<deflist collapsible="true" id="kotlin-tour-classes-exercise-3-hint-1">
    <def title="提示 1">
        列表有一个名为 <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/random.html"><code>.random()</code></a> 的扩展方法，它会返回列表中的一个随机项。
    </def>
</deflist>

<deflist collapsible="true" id="kotlin-tour-classes-exercise-3-hint-2">
    <def title="提示 2">
        <code>Random.nextInt(from = ..., until = ...)</code> 会返回指定范围内的随机 <code>Int</code> 数字。
    </def>
</deflist>

|---|---|
```kotlin
import kotlin.random.Random

data class Employee(val name: String, var salary: Int)

// 在此处编写代码

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

|---|---|
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="示例解法" id="kotlin-tour-classes-solution-3"}

## 下一步

[null 安全](kotlin-tour-null-safety.md)