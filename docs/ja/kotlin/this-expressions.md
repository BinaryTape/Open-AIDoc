[//]: # (title: this 式)

`this` 式は、現在のレシーバー（その関数が動作しているオブジェクト）を指します。`this` をどのように使用するかは、コンテキストによって異なります。

* [クラス](classes.md)のメンバー内では、`this` はそのクラスの現在のオブジェクトを指します。

  例えば、次のコードでは、`this.name` は現在の `Language` オブジェクトの `name` プロパティを意味します。

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

* [拡張関数](extensions.md)または[レシーバー付き関数リテラル](lambdas.md#function-literals-with-receiver)内では、`this` はレシーバーを指します。

  次の例では、`lastCharacter()` が文字列 `"Kotlin"` に対して呼び出されています。したがって、`"Kotlin"` がレシーバーです。拡張関数内では、`this` は `"Kotlin"` を指します。これは、`this.length` が `"Kotlin"` の長さであることを意味します。

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

> シンプルなケースでは、`this` を明示的に記述する必要はありません。Kotlin は現在のスコープからそれを解決します。
> 詳細については、[暗黙の this](#implicit-this) をご覧ください。
> 
{style="tip"}

## 修飾付きの this (Qualified this)

レシーバースコープがネストされている場合、コード内で複数のレシーバーを同時に利用できることがあります。Kotlin は利用可能な任意のレシーバーを使用してそのメンバーに暗黙的にアクセスできますが、内側のスコープのレシーバーがより高い優先度を持ちます。特定のレシーバーを明示的に参照するには、修飾付きの `this` を使用します。これは、複数のレシーバーが同じ名前のメンバーを持っており、外側のレシーバーのメンバーにアクセスする必要がある場合に特に便利です。

修飾付きの `this` を使用するには、[ラベル](returns.md)修飾子を追加します。

```kotlin
this@label
```

ラベルは、どのレシーバーにアクセスするかをコンパイラに伝えます。囲んでいるクラスや拡張関数の名前を使用できます。例えば、`this@foo` は、`foo` という名前の囲んでいる拡張関数のレシーバーを指します。

### インナークラスから外側のクラスにアクセスする

[インナークラス](nested-classes.md#inner-classes)では、修飾子のない `this` はインナークラスのインスタンスを指します。外側のクラスのオブジェクトにアクセスするには、修飾付きの `this` を使用します。

```kotlin
class User(val name: String) {
    inner class Age(val value: Int) {
        fun printInfo() {
            
            // 現在の Age オブジェクトの value プロパティを指す
            println(this.value)
            // 22
            
            // 外側の User オブジェクトの name プロパティを指す
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

> インナークラスのみが外側のクラスのインスタンスへの参照を保持します。通常の[ネストしたクラス](nested-classes.md)（nested classes）は、外側のクラスの `this` にアクセスできません。
> 
{style="note"}

### 拡張関数からクラスにアクセスする

クラス内で拡張関数を宣言すると、2 つのレシーバーが利用可能になります。

* 拡張レシーバー（extension receiver）：拡張関数を呼び出す対象の値。
* ディスパッチレシーバー（dispatch receiver）：拡張関数を宣言しているクラスの現在のオブジェクト。

どちらのレシーバーが必要かを指定するには、修飾付きの `this` を使用します。

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

ここでは：

* `this` は拡張レシーバー（`String`）を指すため、`this.uppercase()` は文字列を大文字に変換します。
* `this@User` は現在の `User` オブジェクトを指します。
* `this@User.prefix` は現在の `User` オブジェクトの `prefix` プロパティにアクセスします。

### ラムダからのアクセス

通常のラムダとは異なり、[レシーバー付きラムダ](lambdas.md#function-literals-with-receiver)はそのスコープにレシーバーを導入します。その結果、ラムダ内の `this` は、囲んでいるスコープのレシーバーではなく、ラムダのレシーバーを指します。レシーバー付きラムダが別のレシーバースコープ内にネストされている場合は、ラムダにラベルを追加し、修飾付きの `this` を使用して、ラムダのレシーバーまたは囲んでいるスコープからのレシーバーを明示的に参照します。

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

ここでは： 

* `stringLabel@` はラムダにラベルを付けています。
* `this@stringLabel` はラムダの文字列レシーバーを指します。
* `this@User` は現在の `User` オブジェクトを指します。

ラベルは何かを呼び出したり、ラムダの動作を変更したりするものではありません。ラムダのレシーバーを参照するのに役立つだけです。

### 匿名オブジェクトまたはその外側のクラスへのアクセス

[匿名オブジェクト](object-declarations.md#object-expressions)には独自のレシーバースコープがあります。オブジェクト本体内では、修飾子のない `this` は匿名オブジェクト自体を指します。ただし、匿名オブジェクトにはクラス名がないため、`this` の修飾子として使用することはできません。したがって、匿名オブジェクトを参照するには、修飾子のない `this` しか使用できません。

```kotlin
interface UserPrinter {
    fun print()
}

fun main() {
    val printer = object : UserPrinter {
        val prefix = "User"
        
        override fun print() {
            // `this` は匿名オブジェクトを指す
            // `this.prefix` はその prefix プロパティにアクセスする
            println(this.prefix)
        }
    }
    printer.print()
    // User
}
```
{kotlin-runnable="true"}

別のクラス内で匿名オブジェクトを宣言した場合は、修飾付きの `this` を使用して、囲んでいるオブジェクトにアクセスできます。

```kotlin

interface UserPrinter {
    fun print()
}

class User(val name: String) {
    fun createPrinter(): UserPrinter {
        return object : UserPrinter {
            override fun print() {
                // `this@User` は囲んでいる User オブジェクトを指す
                // `this@User.name` はその name プロパティにアクセスする
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

## 暗黙の this (Implicit this)

`this` に対してメンバー関数を呼び出す場合、`this.` 修飾子を省略できます。ただし、より近いレキシカルスコープ（_lexical scope_）に同じ名前の別の呼び出し可能なもの（_callable_）がある場合、Kotlin は修飾されていない呼び出しを、メンバー関数ではなくその呼び出し可能なものとして解決します。明示的にメンバー関数を呼び出すには、`this.` 修飾子を使用します。

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