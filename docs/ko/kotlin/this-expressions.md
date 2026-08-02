[//]: # (title: this 표현식)

`this` 표현식은 현재 _수신객체(receiver)_ (함수가 동작하는 대상 객체)를 참조합니다. `this`를 사용하는 방식은 컨텍스트에 따라 달라집니다:

* [클래스](classes.md)의 멤버에서 `this`는 해당 클래스의 현재 객체를 참조합니다.

  예를 들어, 다음 코드에서 `this.name`은 현재 `Language` 객체의 `name` 프로퍼티를 의미합니다.

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

* [확장 함수](extensions.md) 또는 [수신객체가 지정된 함수 리터럴](lambdas.md#function-literals-with-receiver)에서 `this`는 수신객체를 나타냅니다.

  다음 예제에서 `lastCharacter()`는 `"Kotlin"` 문자열에 대해 호출됩니다. 따라서 `"Kotlin"`이 수신객체입니다. 확장 함수 내부에서 `this`는 `"Kotlin"`을 참조합니다. 이는 `this.length`가 `"Kotlin"`의 길이를 의미함을 뜻합니다.

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

> 간단한 경우에는 `this`를 명시적으로 작성할 필요가 없습니다. 코틀린은 현재 스코프에서 이를 해석합니다.
> [암시적인 this](#암시적인-this)에서 더 자세히 알아보세요.
> 
{style="tip"}

## 한정된 this

수신객체 스코프가 중첩된 경우, 여러 수신객체를 동시에 사용할 수 있습니다. 코틀린은 가용한 수신객체를 사용하여 멤버에 암시적으로 접근할 수 있지만, 안쪽 스코프의 수신객체가 더 높은 우선순위를 갖습니다. 특정 수신객체를 명시적으로 참조하려면 한정된 `this(qualified this)`를 사용하세요. 이는 여러 수신객체가 동일한 이름의 멤버를 가지고 있어 외부 수신객체의 멤버에 접근해야 할 때 특히 유용합니다.

한정된 `this`를 사용하려면 [레이블](returns.md) 한정자를 추가하세요:

```kotlin
this@label
```

레이블은 컴파일러에게 어떤 수신객체에 접근할지 알려줍니다. 둘러싸는 클래스나 확장 함수의 이름을 레이블로 사용할 수 있습니다. 예를 들어, `this@foo`는 `foo`라는 이름의 둘러싸는 확장 함수의 수신객체를 참조합니다.

### 내부 클래스에서 외부 클래스에 접근하기

[내부 클래스(inner class)](nested-classes.md#inner-classes)에서 한정되지 않은 `this`는 내부 클래스의 인스턴스를 참조합니다. 외부 클래스 객체에 접근하려면 한정된 `this`를 사용하세요:

```kotlin
class User(val name: String) {
    inner class Age(val value: Int) {
        fun printInfo() {
            
            // 현재 Age 객체의 value 프로퍼티를 참조함
            println(this.value)
            // 22
            
            // 외부 User 객체의 name 프로퍼티를 참조함
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

> 내부 클래스만 외부 클래스 인스턴스에 대한 참조를 유지합니다. 일반적인 [중첩 클래스(nested classes)](nested-classes.md)는 외부 클래스의 `this`에 접근할 수 없습니다.
> 
{style="note"}

### 확장 함수에서 클래스에 접근하기

클래스 내부에서 확장 함수를 선언하면 두 개의 수신객체를 사용할 수 있습니다:

* 확장 수신객체(extension receiver): 확장 함수를 호출한 대상 값.
* 디스패치 수신객체(dispatch receiver): 확장 함수가 선언된 클래스의 현재 객체.

필요한 수신객체를 지정하려면 한정된 `this`를 사용하세요:

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

위 코드에서:

* `this`는 확장 수신객체(`String`)를 참조하므로, `this.uppercase()`는 문자열을 대문자로 변환합니다.
* `this@User`는 현재 `User` 객체를 참조합니다.
* `this@User.prefix`는 현재 `User` 객체의 `prefix` 프로퍼티에 접근합니다.

### 람다에서 접근하기

일반 람다와 달리, [수신객체가 지정된 람다](lambdas.md#function-literals-with-receiver)는 스코프 내에 수신객체를 도입합니다. 결과적으로 람다 내부의 `this`는 둘러싸는 스코프가 아닌 람다의 수신객체를 참조합니다. 수신객체가 지정된 람다가 다른 수신객체 스코프 내에 중첩되어 있다면, 람다에 레이블을 추가하고 한정된 `this`를 사용해 람다의 수신객체나 외부 스코프의 수신객체를 명시적으로 참조할 수 있습니다.

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

위 코드에서: 

* `stringLabel@`은 람다의 레이블입니다.
* `this@stringLabel`은 람다의 문자열 수신객체를 참조합니다.
* `this@User`는 현재 `User` 객체를 참조합니다.

레이블은 호출을 하거나 람다의 동작 방식을 바꾸지 않습니다. 단지 람다의 수신객체를 참조할 수 있도록 도와줄 뿐입니다.

### 익명 객체 또는 외부 클래스에 접근하기

[익명 객체(anonymous object)](object-declarations.md#object-expressions)는 자체 수신객체 스코프를 가집니다. 객체 본문 내부에서 한정되지 않은 `this`는 익명 객체 자신을 참조합니다. 하지만 익명 객체는 클래스 이름이 없으므로 `this` 한정자로 사용할 수 없습니다. 따라서 익명 객체는 오직 한정되지 않은 `this`로만 참조할 수 있습니다:

```kotlin
interface UserPrinter {
    fun print()
}

fun main() {
    val printer = object : UserPrinter {
        val prefix = "User"
        
        override fun print() {
            // `this`는 익명 객체를 참조함
            // `this.prefix`는 익명 객체의 `prefix` 프로퍼티에 접근함
            println(this.prefix)
        }
    }
    printer.print()
    // User
}
```
{kotlin-runnable="true"}

만약 다른 클래스 내부에서 익명 객체를 선언했다면, 한정된 `this`를 사용하여 둘러싸는 객체에 접근할 수 있습니다:

```kotlin

interface UserPrinter {
    fun print()
}

class User(val name: String) {
    fun createPrinter(): UserPrinter {
        return object : UserPrinter {
            override fun print() {
                // `this@User`는 둘러싸는 `User` 객체를 참조함
                // `this@User.name`은 해당 객체의 `name` 프로퍼티에 접근함
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

## 암시적인 this

`this`에서 멤버 함수를 호출할 때 `this.` 한정자를 생략할 수 있습니다. 하지만 더 가까운 렉시컬 스코프(lexical scope)에 이름이 같은 다른 호출 가능한 요소(callable)가 있다면, 코틀린은 한정되지 않은 호출에 대해 멤버 함수 대신 해당 요소를 찾아 호출합니다. 멤버 함수를 명시적으로 호출하려면 `this.` 한정자를 사용하세요:

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