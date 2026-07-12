[//]: # (title: 软件包与导入)

在 Kotlin 项目中，代码使用软件包和导入进行组织：

* **软件包 (package)** 是一个或多个 Kotlin 文件的容器。文件通过 `package` 标头链接到软件包。
* **导入 (import)** 是一条指令，它使来自其他软件包的实体在当前文件中可用。

## 软件包标头

源文件可以以软件包标头开头：

```kotlin
package org.example

fun printMessage() { /*...*/ }
class Message(val text: String) { /*...*/ }
```

源文件的所有内容（例如类和函数）都属于该软件包。
它们的完全限定名称由软件包名称与实体的名称组合而成。
在此示例中：

* `printMessage()` 的完全限定名称是 `org.example.printMessage`。
* `Message` 的完全限定名称是 `org.example.Message`。

如果文件没有软件包标头，则其内容属于根软件包。

## 导入

要使用来自其他软件包文件中定义的实体，请使用 `import` 指令。
除了默认导入之外，每个文件还可以声明自己的导入。

### 导入单个实体

导入特定的实体，以便您无需限定符即可使用它：

```kotlin
// 无需限定符即可访问 Message
import org.example.Message 

fun main() {
    val message = Message("Hello")
    println(message.text)
}
```

### 导入作用域的内容

星号导入（以星号 `*` 结尾）会导入相应作用域内的所有命名实体：

```kotlin
// org.example 中的所有内容都变得可访问
import org.example.* 

fun main() {
    printMessage()
    val message = Message("Hi")
}
```

如果您同时通过星号导入和显式导入了同一个实体，在重载解析期间显式导入具有更高优先级。

### 使用别名解决名称冲突

如果两个导入的实体具有相同的名称，请使用 `as` 关键字对其中一个进行本地重命名：

```kotlin
// Message 指代 org.example.Message
import org.example.Message

// TestMessage 指代 org.test.Message
import org.test.Message as TestMessage

fun main() {
    val a = Message("from example")
    val b = TestMessage("from test")
}
```

### 可以导入的内容

`import` 关键字不仅限于类。您可以导入以下任何实体，无论它们来自软件包、类、对象还是枚举：

* 直接在软件包内声明的顶层函数和属性：
    ```kotlin
    import org.example.printMessage // 顶层函数
    import org.example.VERSION      // 顶层属性
    ```
* 来自[对象声明](object-declarations.md#object-declarations-overview)的函数和属性：
    ```kotlin
    import org.example.Config.DEFAULT_TIMEOUT // 来自对象的属性
    import org.example.Config.loadSettings    // 来自对象的方法
    ```
* [伴生对象](object-declarations.md#companion-objects)的成员，通过其所属类的名称引用：
    ```kotlin
    import org.example.MyClass.create // 指代 MyClass.Companion.create
    ```
* [枚举常量](enum-classes.md)：
    ```kotlin
    import org.example.Color.RED
    import org.example.Color.GREEN
    ```
* 嵌套类：
    ```kotlin
    import org.example.Outer.Nested
    ```

## 默认导入

默认情况下，Kotlin 包含以下导入：

* [kotlin.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/index.html)
* [kotlin.annotation.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.annotation/index.html)
* [kotlin.collections.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/index.html)
* [kotlin.comparisons.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.comparisons/index.html)
* [kotlin.io.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.io/index.html)
* [kotlin.ranges.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.ranges/index.html)
* [kotlin.sequences.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.sequences/index.html)
* [kotlin.text.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/index.html)
* [kotlin.math.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.math/index.html)

根据目标平台的不同，Kotlin 会导入其他软件包：

* JVM:
  * [java.lang.*](https://docs.oracle.com/javase/8/docs/api/java/lang/package-summary.html)
  * [kotlin.jvm.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/index.html)

* JS:
  * [kotlin.js.*](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.js/index.html)

## 可见性与导入

能否导入某个实体取决于其[可见性修饰符](visibility-modifiers.md)：

* `public` 实体可以在任何地方导入。
* `internal` 实体只能在同一个模块内导入。
* `protected` 实体无法导入。
* 顶层 `private` 实体仅在其声明的文件内可访问。
* 其他 `private` 实体无法导入。