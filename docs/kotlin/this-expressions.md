[//]: # (title: This 表达式)

`this` 表达式指向当前的接收者（该函数正在处理的对象）。如何使用 `this` 取决于上下文：

* 在 [类](classes.md) 的成员中，`this` 指向该类的当前对象。

  例如，在以下代码中，`this.name` 表示当前 `Language` 对象的 `name` 属性：

  ```kotlin
  class Language(val name: String) {
      fun printName() {
          println(this.name)
      }
  }

  fun main() {
      val language = Language("Kotlin")
      language.printName()
      // Kotlin
  }
  ```
  {kotlin-runnable="true"}

* 在 [扩展函数](extensions.md) 或 [带接收者的函数字面量](lambdas.md#function-literals-with-receiver) 中，`this` 表示接收者。

  在以下示例中，`lastCharacter()` 在字符串 `"Kotlin"` 上调用。因此，`"Kotlin"` 是接收者。在扩展函数内部，`this` 指向 `"Kotlin"`。这意味着 `this.length` 是 `"Kotlin"` 的长度：

  ```kotlin
  fun String.lastCharacter(): Char {
      println(this.length)
      // 6
      return this[this.length - 1]
  }

  fun main() {
      println("Kotlin".lastCharacter())
      // n
  }
  ```
  {kotlin-runnable="true"}

> 在简单的情况下，你不需要显式编写 `this`。Kotlin 会从当前作用域解析它。
> 详细了解 [隐式 this](#implicit-this)。
> 
{style="tip"}

## 限定的 this

当接收者作用域嵌套时，你的代码中可能同时有多个可用的接收者。Kotlin 能够隐式使用任何可用的接收者来访问其成员，但来自内层作用域的接收者具有更高的优先级。要显式引用特定的接收者，请使用限定的 `this`。当多个接收者拥有同名成员，且你需要访问外层接收者的成员时，这非常有用。

要使用限定的 `this`，请添加 [标签](returns.md) 限定符：

```kotlin
this@label
```

标签告诉编译器要访问哪个接收者。你可以使用外层类或扩展函数的名称。例如，`this@foo` 指向名为 `foo` 的外层扩展函数的接收者。

### 从内部类访问外部类

在 [内部类](nested-classes.md#inner-classes) 中，未限定的 `this` 指向内部类实例。要访问外部类对象，请使用限定的 `this`：

```kotlin
class User(val name: String) {
    inner class Age(val value: Int) {
        fun printInfo() {
            
            // 指向当前 Age 对象的 value 属性
            println(this.value)
            // 22
            
            // 指向外层 User 对象的 name 属性 
            println(this@User.name)
            // Jane Doe
        }
    }
}

fun main() {
    val user = User("Jane Doe")
    val age = user.Age(22)
    age.printInfo()
}
```
{kotlin-runnable="true"}

> 只有内部类持有对外部类实例的引用。常规 [嵌套类](nested-classes.md) 无法访问外部类的 `this`。
> 
{style="note"}

### 从扩展函数访问类

如果你在类内部声明扩展函数，则有两个可用的接收者：

* 扩展接收者：你调用扩展函数时的值。
* 分发接收者：你声明扩展函数所在类的当前对象。

使用限定的 `this` 来指定你需要的接收者：

```kotlin
class User(val name: String) {
    val prefix = "Name"

    fun String.formatName(): String {
        return "${this@User.prefix}: ${this.uppercase()}"
    }

    fun printName() {
        println(name.formatName())
    }
}

fun main() {
    val user = User("Jane Doe")
    user.printName()
    // Name: JANE DOE
}
```
{kotlin-runnable="true"}

在此处：

* `this` 指向扩展接收者 (`String`)，因此 `this.uppercase()` 将字符串转换为大写。
* `this@User` 指向当前的 `User` 对象。
* `this@User.prefix` 访问当前 `User` 对象的 `prefix` 属性。

### 从 lambda 表达式中访问

与常规 lambda 表达式不同，[带接收者的 lambda 表达式](lambdas.md#function-literals-with-receiver) 会在其作用域中引入一个接收者。因此，lambda 内部的 `this` 指向 lambda 的接收者，而不是外层作用域的接收者。
如果带接收者的 lambda 表达式嵌套在另一个接收者作用域内，请为该 lambda 添加标签，并使用限定的 `this` 来显式引用该 lambda 的接收者或外层作用域的接收者：

```kotlin
class User(val name: String) {
    fun printWithPrefix() {
        val printString: String.() -> Unit = stringLabel@ {
            println("${this@stringLabel}: ${this@User.name}")
        }

        printString("User")
    }
}

fun main() {
    val user = User("Jane Doe")
    user.printWithPrefix()
    // User: Jane Doe
}
```
{kotlin-runnable="true"}

在此处： 

* `stringLabel@` 为 lambda 标记标签。
* `this@stringLabel` 指向 lambda 的字符串接收者。
* `this@User` 指向当前的 `User` 对象。

标签不会调用任何内容或改变 lambda 的工作方式。它仅帮助你引用 lambda 的接收者。

### 访问匿名对象或其外部类

[匿名对象](object-declarations.md#object-expressions) 拥有自己的接收者作用域。在对象体内部，未限定的 `this` 指向该匿名对象本身。然而，由于匿名对象没有类名，你不能将它们用作 `this` 限定符。因此，你只能使用未限定的 `this` 来引用匿名对象：

```kotlin
interface UserPrinter {
    fun print()
}

fun main() {
    val printer = object : UserPrinter {
        val prefix = "User"
        
        override fun print() {
            // `this` 指向匿名对象
            // `this.prefix` 访问其 `prefix` 属性
            println(this.prefix)
        }
    }
    printer.print()
    // User
}
```
{kotlin-runnable="true"}

如果你在另一个类内部声明匿名对象，可以使用限定的 `this` 来访问外层对象：

```kotlin

interface UserPrinter {
    fun print()
}

class User(val name: String) {
    fun createPrinter(): UserPrinter {
        return object : UserPrinter {
            override fun print() {
                // `this@User` 指向外层 `User` 对象
                // `this@User.name` 访问其 `name` 属性
                println(this@User.name)
            }
        }
    }
}

fun main() {
    val printer = User("Jane Doe").createPrinter()
    printer.print()
    // Jane Doe
}
```

{kotlin-runnable="true"}

## 隐式 this

当你在 `this` 上调用成员函数时，可以省略 `this.` 限定符。然而，如果更近的词法作用域内有另一个同名的可调用对象，Kotlin 会将不带限定符的调用解析为该对象，而不是成员函数。要显式调用成员函数，请使用 `this.` 限定符：

```kotlin
fun main() {
    class A {
        fun printLine() {
            println("Member function")
        }

        fun invokePrintLine() {
            fun printLine() {
                println("Local function")
            }
         
            printLine()
            // 局部函数
         
            this.printLine()
            // 成员函数
        }
    }

    A().invokePrintLine()
}
```
{kotlin-runnable="true"}