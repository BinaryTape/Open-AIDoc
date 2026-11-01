[//]: # (title: 数据类)

Kotlin 中的数据类主要用于保存数据。对于每个数据类，编译器都会自动生成额外的成员函数，以便将实例输出为具有可读性的字符串、比较实例、复制实例等。
数据类使用 `data` 标记：

```kotlin
data class User(val name: String, val age: Int)
```

编译器会从主构造函数中声明的所有属性自动派生出以下成员：

* `equals()`/`hashCode()` 对。
* 形式为 `"User(name=John, age=42)"` 的 `toString()`。
* 与属性声明顺序对应的 [`componentN()` 函数](destructuring-declarations.md)。
* [`copy()` 函数](#copying)。

为确保所生成代码的一致性与有意义的行为，数据类必须满足以下要求：

* 主构造函数必须至少包含一个形参。
* 主构造函数的所有形参必须标记为 `val` 或 `var`。
* 数据类不能是 abstract、open、sealed 或 inner 类。

此外，关于成员的继承，数据类成员的生成遵循以下规则：

* 如果在数据类主体中存在 `equals()`、`hashCode()` 或 `toString()` 的显式实现，或者在超类中存在 `final` 实现，则不会生成这些函数，而是使用现有的实现。
* 如果超类型具有 `open` 且返回兼容类型的 `componentN()` 函数，则会为该数据类生成相应的函数并重写超类型中的对应函数。如果由于签名不兼容或因其为 final 而导致无法重写超类型的函数，则会报错。
* 不允许为 `componentN()` 和 `copy()` 函数提供显式实现。

数据类可以继承其他类（示例请参见[密封类](sealed-classes.md)）。

> 在 JVM 上，如果生成的类需要包含无参构造函数，则必须为属性指定默认值（参见[构造函数](classes.md#constructors-and-initializer-blocks)）：
> 
> ```kotlin
> data class User(val name: String = "", val age: Int = 0)
> ```
>
{style="note"}

## 类主体中声明的属性 {id="properties-declared-in-the-class-body"}

编译器仅使用在主构造函数内定义的属性来自动生成函数。若要从生成的实现中排除某个属性，请在类主体中声明它：

```kotlin
data class Person(val name: String) {
    var age: Int = 0
}
```

在下面的示例中，`toString()`、`equals()`、`hashCode()` 以及 `copy()` 的实现默认仅使用 `name` 属性，并且只有一个 component 函数：`component1()`。
`age` 属性在类主体中声明并被排除在外。
因此，具有相同 `name` 但不同 `age` 值的两个 `Person` 对象被视为相等，因为 `equals()` 仅对来自主构造函数的属性进行求值：

```kotlin
data class Person(val name: String) {
    var age: Int = 0
}
fun main() {
//sampleStart
    val person1 = Person("John")
    val person2 = Person("John")
    person1.age = 10
    person2.age = 20

    println("person1 == person2: ${person1 == person2}")
    // person1 == person2: true
  
    println("person1 with age ${person1.age}: ${person1}")
    // person1 with age 10: Person(name=John)
  
    println("person2 with age ${person2.age}: ${person2}")
    // person2 with age 20: Person(name=John)
//sampleEnd
}
```
{kotlin-runnable="true"}

## 复制 {id="copying"}

使用 `copy()` 函数复制对象，允许您更改其中的_部分_属性，同时保持其余属性不变。
上述 `User` 类的该函数实现如下所示：

```kotlin
fun copy(name: String = this.name, age: Int = this.age) = User(name, age)
```

随后您可以像这样编写代码：

```kotlin
val jack = User(name = "Jack", age = 1)
val olderJack = jack.copy(age = 2)
```

`copy()` 函数创建实例的_浅拷贝（shallow copy）_。换言之，它不会递归复制组件。因此，对其他对象的引用是共享的。

例如，如果某个属性包含一个可变列表，则通过“原始”值所做的更改也会反映在副本中，而通过副本所做的更改也会反映在原始对象中：

```kotlin
data class Employee(val name: String, val roles: MutableList<String>)

fun main() {
    val original = Employee("Jamie", mutableListOf("developer"))
    val duplicate = original.copy()

    duplicate.roles.add("team lead")

    println(original) 
    // Employee(name=Jamie, roles=[developer, team lead])
    println(duplicate) 
    // Employee(name=Jamie, roles=[developer, team lead])
}
```
{kotlin-runnable="true"}

可以看到，修改 `duplicate.roles` 属性同时也会更改 `original.roles` 属性，因为这两个属性共享同一个列表引用。

## 数据类与析构声明 {id="data-classes-and-destructuring-declarations"}

为数据类生成的_组件函数（Component functions）_使其能够用于[析构声明](destructuring-declarations.md)：

```kotlin
val jane = User("Jane", 35)
val (name, age) = jane
println("$name, $age years of age") 
// Jane, 35 years of age
```

## 标准数据类 {id="standard-data-classes"}

标准库提供了 `Pair` 和 `Triple` 类。不过在大多数情况下，具名数据类是更好的设计选择，因为它们通过为属性提供有意义的名称使代码更具可读性。