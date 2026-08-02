[//]: # (title: this 表達式)

`this` 表達式指的是目前的 receiver（函式運作時所在的物件）。您如何使用 `this` 取決於上下文：

* 在 [類別](classes.md) 的成員中，`this` 指的是該類別的目前物件。

  例如，在下列程式碼中，`this.name` 表示目前的 `Language` 物件的 `name` 屬性：

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

* 在 [擴充方法](extensions.md) 或 [帶有接收者的函式常值](lambdas.md#function-literals-with-receiver) 中，`this` 指的是 receiver。 

  在下列範例中，`lastCharacter()` 在字串 `"Kotlin"` 上被呼叫。因此，`"Kotlin"` 就是 receiver。在擴充方法內部，`this` 指的是 `"Kotlin"`。這代表 `this.length` 是 `"Kotlin"` 的長度：

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

> 在簡單的情況下，您不需要明確撰寫 `this`。Kotlin 會從目前的作用域解析它。
> 進一步了解 [](#implicit-this)。
> 
{style="tip"}

## 限定的 this

當 receiver 的作用域巢狀（nested）時，您的程式碼可能同時有多個可用的 receiver。Kotlin 可以隱式使用任何可用的 receiver 來存取其成員，但來自內層作用域的 receiver 具有較高優先級。若要明確參考特定的 receiver，請使用限定的 `this`。當多個 receiver 具有相同名稱的成員，且您需要存取外層 receiver 的成員時，這特別有用。

若要使用限定的 `this`，請加上 [標籤](returns.md) 限定詞：

```kotlin
this@label
```

標籤會告訴編譯器要存取哪個 receiver。您可以使用封閉類別或擴充方法的名稱。例如，`this@foo` 指的是名為 `foo` 的封閉擴充方法的 receiver。

### 從內部類別存取外層類別

在 [內部類別](nested-classes.md#inner-classes) 中，不帶限定詞的 `this` 指的是內部類別的執行個體。若要存取外層類別物件，請使用限定的 `this`：

```kotlin
class User(val name: String) {
    inner class Age(val value: Int) {
        fun printInfo() {
            
            // 指的是目前 Age 物件的 value 屬性
            println(this.value)
            // 22
            
            // 指的是外層 User 物件的 name 屬性 
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

> 只有內部類別會持有外層類別執行個體的參考。一般的 [巢狀類別](nested-classes.md) 無法存取外層類別的 `this`。
> 
{style="note"}

### 從擴充方法存取類別

如果您在類別內部宣告擴充方法，則有兩個可用的 receiver：

* extension receiver：呼叫擴充方法的那個值。
* dispatch receiver：宣告擴充方法的類別之目前物件。

使用限定的 `this` 來指定您需要的 receiver：

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

此處：

* `this` 指的是 extension receiver (`String`)，因此 `this.uppercase()` 會將字串轉換為大寫。
* `this@User` 指的是目前的 `User` 物件。
* `this@User.prefix` 會存取目前 `User` 物件的 `prefix` 屬性。

### 從 Lambda 存取

與一般的 Lambda 不同，[帶有接收者的 Lambda](lambdas.md#function-literals-with-receiver) 會在其作用域內引入一個 receiver。因此，Lambda 內部的 `this` 指的是該 Lambda 的 receiver，而非來自封閉作用域的 receiver。
如果帶有接收者的 Lambda 巢狀於另一個 receiver 作用域內，請為該 Lambda 加入標籤，並使用限定的 `this` 來明確參考該 Lambda 的 receiver 或封閉作用域的 receiver：

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

此處： 

* `stringLabel@` 為 Lambda 加入標籤。
* `this@stringLabel` 指的是該 Lambda 的字串 receiver。
* `this@User` 指的是目前的 `User` 物件。

標籤不會進行任何呼叫，也不會改變 Lambda 的運作方式。它僅協助您參考該 Lambda 的 receiver。

### 存取匿名物件或其外層類別

[匿名物件](object-declarations.md#object-expressions) 擁有自己的 receiver 作用域。在物件主體內部，不帶限定詞的 `this` 指的是匿名物件本身。然而，由於匿名物件沒有類別名稱，您不能將它們用作 `this` 限定詞。因此，您只能使用不帶限定詞的 `this` 來參考匿名物件：

```kotlin
interface UserPrinter {
    fun print()
}

fun main() {
    val printer = object : UserPrinter {
        val prefix = "User"
        
        override fun print() {
            // `this` 指的是匿名物件
            // `this.prefix` 存取其 `prefix` 屬性
            println(this.prefix)
        }
    }
    printer.print()
    // User
}
```
{kotlin-runnable="true"}

如果您在另一個類別中宣告匿名物件，您可以使用限定的 `this` 來存取封閉物件：

```kotlin

interface UserPrinter {
    fun print()
}

class User(val name: String) {
    fun createPrinter(): UserPrinter {
        return object : UserPrinter {
            override fun print() {
                // `this@User` 指的是封閉的 `User` 物件
                // `this@User.name` 存取其 `name` 屬性
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

## 隱式 this

當您在 `this` 上呼叫成員函數時，可以省略 `this.` 限定詞。然而，如果另一個具有相同名稱的可呼叫物件在更近的語法作用域內可用，Kotlin 會將不帶限定詞的呼叫解析為該物件，而非成員函數。若要明確呼叫成員函數，請使用 `this.` 限定詞：

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
            // Local function
         
            this.printLine()
            // Member function
        }
    }

    A().invokePrintLine()
}
```
{kotlin-runnable="true"}