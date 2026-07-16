[//]: # (title: 注解)

注解是您可以用来将元数据附加到代码元素的标签。工具和框架会在编译和运行时处理这些元数据，并据此执行不同的操作。

您可以为代码添加注解，以简化并自动化常见任务，例如生成模板代码、强制执行编码标准或编写文档。

> 如果您想开发自己的注解处理器，可以使用 [Kotlin Symbol Processing (KSP)](ksp-overview.md) API。
>
{style="tip"}

## 声明

注解是一种特殊的类。要声明注解，请在类声明前使用 `annotation` 关键字：

```kotlin
annotation class Fancy
```

可以通过使用元注解为注解类添加注解，来指定注解的其他属性：

  * [`@Target`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-target/index.html) 指定可以用该注解进行注解的元素类型（例如类、函数、属性和表达式）；
  * [`@Retention`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-retention/index.html) 指定注解是否存储在编译后的类文件中，以及在运行时通过反射是否可见（默认情况下，两者均为 true）；
  * [`@Repeatable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-repeatable/index.html) 允许在单个元素上多次使用同一个注解；
  * [`@MustBeDocumented`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-must-be-documented/index.html) 指定该注解是公共 API 的一部分，应包含在生成的 API 文档中显示的类或方法签名中。

```kotlin
@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION,
        AnnotationTarget.TYPE_PARAMETER, AnnotationTarget.VALUE_PARAMETER,
        AnnotationTarget.EXPRESSION)
@Retention(AnnotationRetention.SOURCE)
@MustBeDocumented
annotation class Fancy
```

## 用法

```kotlin
@Fancy class Foo {
    @Fancy fun baz(@Fancy foo: Int): Int {
        return (@Fancy 1)
    }
}
```

如果您需要为类的主构造函数添加注解，则需要在构造函数声明中添加 `constructor` 关键字，并在其之前添加注解：

```kotlin
class Foo @Inject constructor(dependency: MyDependency) { ... }
```

您还可以为属性访问器添加注解：

```kotlin
class Foo {
    var x: MyDependency? = null
        @Inject set
}
```

## 构造函数

注解可以拥有接受参数的构造函数。

```kotlin
annotation class Special(val why: String)

@Special("example") class Foo {}
```

允许的参数类型有：

 * 与 Java 原生类型相对应的类型（Int、Long 等）
 * 字符串
 * 类（`Foo::class`）
 * 枚举
 * 其他注解
 * 上述类型的数组

注解参数不能具有可为 null 的类型，因为 JVM 不支持将 `null` 作为注解属性的值进行存储。

如果将一个注解用作另一个注解的参数，其名称前不加 `@` 字符：

```kotlin
annotation class ReplaceWith(val expression: String)

annotation class Deprecated(
        val message: String,
        val replaceWith: ReplaceWith = ReplaceWith(""))

@Deprecated("This function is deprecated, use === instead", ReplaceWith("this === other"))
```

如果您需要将一个类指定为注解的实参，请使用 Kotlin 类 ([KClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/index.html))。Kotlin 编译器会自动将其转换为 Java 类，以便 Java 代码可以正常访问注解和实参。

```kotlin

import kotlin.reflect.KClass

annotation class Ann(val arg1: `KClass<*>`, val arg2: KClass<out Any>)

@Ann(String::class, Int::class) class MyClass
```

## 实例化

在 Java 中，注解类型是接口的一种形式，因此您可以实现它并使用实例。作为该机制的替代方案，Kotlin 允许您在任意代码中调用注解类的构造函数，并同样使用生成的实例。

```kotlin
annotation class InfoMarker(val info: String)

fun processInfo(marker: InfoMarker): Unit = TODO()

fun main(args: Array<String>) {
    if (args.isNotEmpty())
        processInfo(getAnnotationReflective(args))
    else
        processInfo(InfoMarker("default"))
}
```

在 [此 KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/annotation-instantiation.md) 中了解更多关于注解类实例化的信息。

## Lambda 表达式

注解也可以用于 lambda 表达式。它们将被应用于生成 lambda 表达式体的 `invoke()` 方法。这对于像 [Quasar](https://docs.paralleluniverse.co/quasar/) 这样的框架非常有用，该框架使用注解进行并发控制。

```kotlin
annotation class Suspendable

val f = @Suspendable { Fiber.sleep(10) }
```

## 注解使用处目标

当您为属性或主构造函数形参添加注解时，会从相应的 Kotlin 元素生成多个 Java 元素，因此在生成的 Java 字节码中注解可能有多个可能的位置。要指定注解具体应如何生成，请使用以下语法：

```kotlin
class Example(@field:Ann val foo,    // 仅注解 Java 字段
              @get:Ann val bar,      // 仅注解 Java getter
              @param:Ann val quux)   // 仅注解 Java 构造函数形参
```

同样的语法可以用于为整个文件添加注解。为此，请在文件的顶层，在 package 指令之前，或者如果文件在默认包中则在所有 import 之前，放置一个带有 `file` 目标的注解：

```kotlin
@file:JvmName("Foo")

package org.jetbrains.demo
```

如果您有多个具有相同目标的注解，可以通过在目标后添加方括号并将所有注解放在方括号内来避免重复目标（`all` 元目标除外）：

```kotlin
class Example {
     @set:[Inject VisibleForTesting]
     var collaborator: Collaborator
}
```

支持的使用处目标完整列表如下：

  * `file`
  * `field`
  * `property`（具有此目标的注解对 Java 不可见）
  * `get`（属性 getter）
  * `set`（属性 setter）
  * `all`（属性的实验性元目标，有关其用途和用法请参见[下文](#all-meta-target)）
  * `receiver`（扩展函数或属性的接收者形参）

    要为扩展函数的接收者形参添加注解，请使用以下语法：

    ```kotlin
    fun @receiver:Fancy String.myExtension() { ... }
    ```

  * `param`（构造函数形参）
  * `setparam`（属性 setter 形参）
  * `delegate`（存储委托属性的委托实例的字段）

### 未指定使用处目标时的默认情况

如果您不指定使用处目标，则会根据所使用注解的 `@Target` 注解来选择目标。如果有多个适用的目标，则使用下表中的第一个适用目标：

* `param`
* `property`
* `field`

让我们使用来自 [Jakarta Bean Validation 的 `@Email` 注解](https://jakarta.ee/specifications/bean-validation/3.0/apidocs/jakarta/validation/constraints/email)：

```java
@Target(value={METHOD,FIELD,ANNOTATION_TYPE,CONSTRUCTOR,PARAMETER,TYPE_USE})
public @interface Email { }
```

对于此注解，请考虑以下示例：

```kotlin
data class User(val username: String,
                // @Email 相当于 @param:Email
                @Email val email: String) {
    // @Email 相当于 @field:Email
    @Email val secondaryEmail: String? = null
}
```

Kotlin 2.2.0 引入了一项实验性的默认规则，该规则应当使注解向形参、字段和属性的传播更加可预测。

根据新规则，如果有多个适用的目标，则按如下方式选择一个或多个目标：

* 如果构造函数形参目标 (`param`) 适用，则使用它。
* 如果属性目标 (`property`) 适用，则使用它。
* 如果字段目标 (`field`) 在 `property` 不适用时适用，则使用 `field`。

使用相同的示例：

```kotlin
data class User(val username: String,
                // @Email 现在相当于 @param:Email @field:Email
                @Email val email: String) {
    // @Email 仍然相当于 @field:Email
    @Email val secondaryEmail: String? = null
}
```

如果有多个目标，且 `param`、`property` 或 `field` 均不适用，则该注解无效。

要启用新的默认规则，请在您的 Gradle 配置中使用以下行：

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xannotation-default-target=param-property")
    }
}
```

每当您想使用旧的行为时，您可以：

* 在特定情况下，显式指定所需的目标，例如，使用 `@param:Annotation` 代替 `@Annotation`。
* 对于整个项目，在您的 Gradle 构建文件中使用此标志：

    ```kotlin
    // build.gradle.kts
    kotlin {
        compilerOptions {
            freeCompilerArgs.add("-Xannotation-default-target=first-only")
        }
    }
    ```

### `all` 元目标

<primary-label ref="experimental-opt-in"/>

使用 `all` 目标可以更轻松地将同一个注解不仅应用于形参和属性或字段，还应用于相应的 getter 和 setter。

具体而言，标记为 `all` 的注解如果适用，将传播到：

* 构造函数形参 (`param`)，如果属性是在主构造函数中定义的。
* 属性本身 (`property`)。
* 支持字段 (`field`)，如果属性拥有一个支持字段。
* Getter (`get`)。
* Setter 形参 (`setparam`)，如果属性定义为 `var`。
* 仅限 Java 的目标 `RECORD_COMPONENT`，如果类具有 `@JvmRecord` 注解。

让我们使用来自 [Jakarta Bean Validation 的 `@Email` 注解](https://jakarta.ee/specifications/bean-validation/3.0/apidocs/jakarta/validation/constraints/email)，其定义如下：

```java
@Target(value={METHOD,FIELD,ANNOTATION_TYPE,CONSTRUCTOR,PARAMETER,TYPE_USE})
public @interface Email { }
```

在下面的示例中，此 `@Email` 注解应用于所有相关目标：

```kotlin
data class User(
    val username: String,
    // 将 @Email 应用于 param、field 和 get
    @all:Email val email: String,
    // 将 @Email 应用于 param、field、get 和 setparam
    @all:Email var name: String,
) {
    // 将 @Email 应用于 field 和 getter（不包括 param，因为它不在构造函数中）
    @all:Email val secondaryEmail: String? = null
}
```

您可以将 `all` 元目标用于任何属性，无论是在主构造函数内部还是外部。

#### 限制

`all` 目标存在一些限制：

* 它不会将注解传播到类型、潜在的扩展接收者、上下文接收者或形参。
* 它不能与多个注解一起使用：
    ```kotlin
    @all:[A B] // 禁止使用，请改用 @all:A @all:B
    val x: Int = 5
    ```
* 它不能与 [委托属性](delegated-properties.md) 一起使用。

#### 如何启用

要在项目中启用 `all` 元目标，请在命令行中使用以下编译器选项：

```Bash
-Xannotation-target-all
```

或者将其添加到 Gradle 构建文件的 `compilerOptions {}` 块中：

```kotlin
// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xannotation-target-all")
    }
}
```

## Java 注解

Java 注解与 Kotlin 100% 兼容：

```kotlin
import org.junit.Test
import org.junit.Assert.*
import org.junit.Rule
import org.junit.rules.*

class Tests {
    // 将 @Rule 注解应用于属性 getter
    @get:Rule val tempFolder = TemporaryFolder()

    @Test fun simple() {
        val f = tempFolder.newFile()
        assertEquals(42, getTheAnswer())
    }
}
```

由于 Java 编写的注解的参数顺序未定义，因此您不能使用常规函数调用语法来传递实参。相反，您需要使用具名参数语法：

``` java
// Java
public @interface Ann {
    int intValue();
    String stringValue();
}
```

```kotlin
// Kotlin
@Ann(intValue = 1, stringValue = "abc") class C
```

与 Java 一样，特殊情况是 `value` 参数；其值可以在没有显式名称的情况下指定：

``` java
// Java
public @interface AnnWithValue {
    String value();
}
```

```kotlin
// Kotlin
@AnnWithValue("abc") class C
```

### 数组作为注解参数

如果 Java 中的 `value` 实参具有数组类型，它在 Kotlin 中会变成一个 `vararg` 参数：

``` java
// Java
public @interface AnnWithArrayValue {
    String[] value();
}
```

```kotlin
// Kotlin
@AnnWithArrayValue("abc", "foo", "bar") class C
```

对于具有数组类型的其他实参，您需要使用数组字面量语法或 `arrayOf(...)`：

``` java
// Java
public @interface AnnWithArrayMethod {
    String[] names();
}
```

```kotlin
@AnnWithArrayMethod(names = ["abc", "foo", "bar"])
class C
```

### 访问注解实例的属性

注解实例的值会作为属性暴露给 Kotlin 代码：

``` java
// Java
public @interface Ann {
    int value();
}
```

```kotlin
// Kotlin
fun foo(ann: Ann) {
    val i = ann.value
}
```

### 能够不生成 JVM 1.8+ 注解目标

如果 Kotlin 注解在其 Kotlin 目标中包含 `TYPE`，则该注解在其 Java 注解目标列表中映射为 `java.lang.annotation.ElementType.TYPE_USE`。这就像 `TYPE_PARAMETER` Kotlin 目标映射到 `java.lang.annotation.ElementType.TYPE_PARAMETER` Java 目标一样。对于 API 级别低于 26 的 Android 客户端来说，这是一个问题，因为它们的 API 中没有这些目标。

要避免生成 `TYPE_USE` 和 `TYPE_PARAMETER` 注解目标，请使用新的编译器参数 `-Xno-new-java-annotation-targets`。

## 可重复注解

与 [Java 中](https://docs.oracle.com/javase/tutorial/java/annotations/repeating.html)一样，Kotlin 拥有可重复注解，可以多次应用于单个代码元素。要使您的注解可重复，请使用 [`@kotlin.annotation.Repeatable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-repeatable/) 元注解标记其声明。这将使其在 Kotlin 和 Java 中都是可重复的。Kotlin 端也支持 Java 可重复注解。

与 Java 中使用的方案的主要区别在于不存在“包含注解”，Kotlin 编译器会自动生成具有预定义名称的包含注解。对于下例中的注解，它将生成包含注解 `@Tag.Container`：

```kotlin
@Repeatable
annotation class Tag(val name: String)

// 编译器生成 @Tag.Container 包含注解
```

您可以通过应用 [`@kotlin.jvm.JvmRepeatable`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/-jvm-repeatable/) 元注解并传递显式声明的包含注解类作为实参，来为包含注解设置自定义名称：

```kotlin
@JvmRepeatable(Tags::class)
annotation class Tag(val name: String)

annotation class Tags(val value: Array<Tag>)
```

要通过反射提取 Kotlin 或 Java 可重复注解，请使用 [`KAnnotatedElement.findAnnotations()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.full/find-annotations.html) 函数。

在 [此 KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/repeatable-annotations.md) 中了解有关 Kotlin 可重复注解的更多信息。