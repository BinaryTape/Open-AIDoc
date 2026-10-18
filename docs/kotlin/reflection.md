[//]: # (title: 反射)
[//]: # (description: 了解 Kotlin 内置的反射支持，以及如何使用独立的 kotlin-reflect 库进行完整的运行时内省。)

*反射* 是一组语言和库功能，允许你在运行时内省程序的结构。
例如，你可以读取或更新属性、调用函数，或者调用类构造函数来创建实例。这在编译时未知声明的情况下非常有用。

反射提供了用于描述已编译声明的运行时对象。例如，类由 [`KClass`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/) 表示，类型由 [`KType`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-type/) 表示，而属性或函数则由 [`KCallable`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-callable/) 的子类型表示。
你可以检查这些对象，并使用它们来访问值或调用函数。

## 反射的工作原理 {id="how-reflection-works"}

[反射 API](https://kotlinlang.org/api/core/kotlin-reflect/) 通过诸如 `KClass` 或 `KFunction` 等 Kotlin 类型来表示已编译的声明。
反射对象表示声明本身，而不是所声明对象的值。例如，你可以使用 `KProperty` 获取属性的名称并返回其类型，而无需从对象中实际读取该属性。

Kotlin 提供了一些基本功能（例如类字面值或[可调用引用](lambdas.md#callable-reference)）作为语言和标准库的一部分。要获得更广泛的运行时内省功能，请导入 [`kotlin-reflect`](https://kotlinlang.org/api/core/kotlin-reflect/) 库。

反射 API 由以下软件包组成：

* [`kotlin.reflect`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/) 是标准库的一部分，包含核心反射类型和函数。
* [`kotlin.reflect.full`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/) 包含用于检查 Kotlin 声明的扩展。
* [`kotlin.reflect.jvm`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.jvm/) 包含连接 Kotlin 与 Java 反射的 JVM 专属扩展。

> 各平台之间的反射支持可能有所不同。本页面与 Kotlin/JVM 反射 API 保持一致。详细了解 [Kotlin/JS 中的反射](js-reflection.md)。
> 
{style="note"}

### 与 Java 反射的互操作性 {id="interoperability-with-java-reflection"}

在 JVM 上，`kotlin-reflect` 库在 [`kotlin.reflect.jvm`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.jvm/) 包中提供了扩展，用于在 Kotlin 与 Java 反射对象之间进行转换。例如，你可以找到实现 Kotlin 属性 getter 的 Java 方法以及该属性的支持字段：

```kotlin
import kotlin.reflect.jvm.*

class User(val name: String)

fun main() {
    println(User::name.javaGetter)
    // public final java.lang.String User.getName()

    println(User::name.javaField)
    // private final java.lang.String User.name
}
```

Kotlin 属性并不总是具有对应的 Java 字段或 getter，因此当不存在匹配的 Java 反射对象时，这两个属性均返回 `null`。

你还可以在 Kotlin 的 `KClass` 与 Java 的 `Class` 对象之间进行转换。要获取与 Java 类对应的 Kotlin 类，请使用 `.kotlin` 扩展属性：

```kotlin
fun getKClass(o: Any): KClass<Any> = value.javaClass.kotlin
```

## 获取运行时类 {id="obtain-a-runtime-class"}

大多数反射操作都从 [`KClass`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/) 开始。获取它的方式取决于该类在编译时是否已知：

* 使用 `ClassName::class` 引用在编译时已知的类。
* 使用 `value::class` 获取运行时值的实际类，该类可能比其声明的类型更具体。

```kotlin
import kotlin.reflect.KClass

class User(val name: String)

open class Language
class Kotlin : Language()

fun main() {
    // 返回表示 User 的 KClass。
    val userClass: KClass<User> = User::class
    println(userClass.simpleName)
    // User
    
    val language: Language = Kotlin()

    // 返回表示运行时值的具体类的 KClass
    val runtimeClass: KClass<out Language> = language::class
    println(runtimeClass.simpleName)
    // Kotlin
}
```
{kotlin-runnable="true"}

Kotlin 标准库提供了用于检查类的基本工具。要进行更深入的运行时内省，请添加 `kotlin-reflect` 依赖项并使用其 API。

## 添加 JVM 依赖项 {id="add-the-jvm-dependency"}

在 JVM 平台上，Kotlin 编译器发行版将使用反射功能所需的运行时组件作为单独的构件 `kotlin-reflect.jar` 提供。这使得无需反射功能的应用可以排除此构件，从而缩减运行时类路径的大小。

要在 Gradle 或 Maven 项目中使用反射，请添加对 `kotlin-reflect` 的依赖项：

<tabs group="build-system">
<tab title="Gradle" group-key="gradle">

```kotlin
dependencies {
    implementation(kotlin("reflect"))
}
```

</tab>
<tab title="Maven" group-key="maven">

```xml
<dependencies>
    <dependency>
        <groupId>org.jetbrains.kotlin</groupId>
        <artifactId>kotlin-reflect</artifactId>
        <version>${kotlin.version}</version>
    </dependency>
</dependencies>
```

</tab>
</tabs>

如果你不使用 Gradle 或 Maven，请确保项目的类路径中包含 `kotlin-reflect.jar`。命令行编译器默认会添加该库。若要从类路径中排除它，请使用 `-no-reflect` [编译器选项](compiler-reference.md#compiler-options)。

## 检查类型 {id="inspect-types"}

`KClass` 和 `KType` 表示不同的信息。`KClass` 表示类，但不保留类型实参或为 null 性。例如，`List<String>` 和 `List<Int>` 共享相同的 `List::class` 表示，而 `String` 和 `String?` 共享 `String::class`。因此，请使用 [`typeOf<T>()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/type-of.html) 函数获取静态已知类型 `T` 的 `KType`，其中包括其类型实参和为 null 性。

在以下示例中，`classifier` 属性将类型与其类或类型形参关联起来。`arguments` 集合包含其类型实参。因此，代码可以独立于 `List` 来检查 `String?`：

```kotlin
import kotlin.reflect.typeOf

fun main() {
    val type = typeOf<List<String?>>()

    println(type.classifier)
    // class kotlin.collections.List
    println(type.arguments.single().type)
    // kotlin.String?
}
```

> 在 JVM 上，所创建的类型没有注解，即使你在源代码中为该类型添加了注解也是如此。对类型注解的支持可能会在 `kotlin-reflect` 库的未来版本中添加。
>
{style="note"}

## 检查值 {id="check-values"}

当你在代码中直接编写目标类型时，可以使用 [`is`、`as` 和 `as?` 运算符](typecasts.md)。但是，如果将目标类存储在 `KClass` 中，请使用：

* [`isInstance()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/is-instance.html) 函数，用于检查某个值是否为该类的实例。它返回 `true` 或 `false`。
* [`cast()`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/cast.html) 函数，用于将值转换为目标类型返回。如果值为 `null` 或类型不兼容，则抛出异常。
* [`safeCast()`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/safe-cast.html) 函数，用于将值转换为目标类型返回，如果值为 `null` 或类型不兼容，则返回 `null`。

```kotlin
import kotlin.reflect.cast
import kotlin.reflect.safeCast

fun main() {
    val expectedClass = String::class
    val value: Any = "Kotlin"

    // 检查该值而不对其进行转换
    println(expectedClass.isInstance(value))
    // true

    // 将该值作为 String 返回
    val text = expectedClass.cast(value)
    println(text.length)
    // 6

    // 不兼容的转换会抛出异常
    val failedCast = runCatching {
        Int::class.cast(value)
    }
    println(failedCast.isFailure)
    // true

    // 安全转换对于同样的不匹配情况会返回 null
    val number = Int::class.safeCast(value)
    println(number)
    // null
}
```
{kotlin-runnable="true"}

## 检查类 {id="inspect-a-class"}

获取 `KClass` 后，你可以检查其成员。这样，你就可以在使用声明之前了解存在哪些声明。
使用 [`members`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-class/members.html) 属性可以检查类的函数和属性。它包含一个 `KCallable` 对象集合，涵盖类中可访问的所有声明，包括继承的声明。

例如，以下代码列出了在数据类中可访问的函数和属性：

```kotlin
data class User(val name: String, val age: Int)

fun main() {
    println(User::class.members.map { it.name }.sorted())
    // [age, component1, component2, copy, equals, hashCode, name, toString]
}
```

`kotlin.reflect.full` 包提供了更具体的属性，用于按种类、作用域和接收者筛选声明：

| 属性 | 返回值 |
|---|---|
| [`declaredMembers`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-members.html) | 直接在类中声明的函数和属性，不包括继承的声明 |
| [`functions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/functions.html) | 类中可用的所有函数：类及其超类中的非 static 函数，以及在类中声明的 static 函数 |
| [`declaredFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-functions.html) | 类中声明的所有函数 |
| [`memberFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/member-functions.html) | 类及其超类中声明的非扩展、非 static 函数 |
| [`declaredMemberFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-member-functions.html) | 类中声明的非扩展、非 static 函数 |
| [`memberExtensionFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/member-extension-functions.html) | 声明为类或其超类成员的扩展函数 |
| [`declaredMemberExtensionFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-member-extension-functions.html) | 在类中声明的扩展函数 |
| [`staticFunctions`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/static-functions.html) | 在类中声明的 static 函数 |
| [`memberProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/member-properties.html) | 类及其超类中声明的非扩展属性 |
| [`declaredMemberProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-member-properties.html) | 类中声明的非扩展属性 |
| [`memberExtensionProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/member-extension-properties.html) | 声明为类或其超类成员的扩展属性 |
| [`declaredMemberExtensionProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/declared-member-extension-properties.html) | 声明为类成员的扩展属性。 |
| [`staticProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/static-properties.html) | 表示 Java 类中声明的 static 字段的属性 |

请选择与你的代码所需声明相匹配的最精确属性。例如，序列化程序可能使用 `declaredMemberProperties` 仅处理由特定类引入的属性，而搜索可调用 API 的框架可能还需要继承的 `memberFunctions`。

你还可以通过反射[检查密封子类](sealed-classes.md#inspect-sealed-subclasses-with-reflection)。

## 读取属性 {id="read-a-property"}

反射允许你读取在运行时选定的属性。
例如，你有一个 UI 配置，指定 `name` 作为要从 `User` 对象中显示的属性。
为此，应用程序必须找到匹配的属性声明，然后调用其 getter：

```kotlin
import kotlin.reflect.full.memberProperties

data class User(val name: String, val age: Int)

fun readProperty(instance: Any, propertyName: String): Any? {
    // 检查运行时类
    val runtimeClass = instance::class

    // 查找属性声明
    val property = runtimeClass.memberProperties
        .firstOrNull { it.name == propertyName }
        ?: error("Unknown property: $propertyName")

    // 以该对象作为接收者调用 getter
    return property.getter.call(instance)
}

fun main() {
    val user = User("Jane Doe", 22)

    println(readProperty(user, "name"))
    // Jane Doe
    println(readProperty(user, "age"))
    // 22
}
```

本示例使用 [`memberProperties`](https://kotlinlang.org/api/core/kotlin-reflect/kotlin.reflect.full/member-properties.html) 返回未绑定的属性对象。这些对象描述了属于该类但未附加到特定实例的属性。因此，`getter.call()` 需要 `instance` 作为其接收者。其结果类型为 `Any?`，因为在运行时选定的属性可以返回任何类型。

> 如果属性在编译时已知，请直接访问属性或使用[可调用引用](lambdas.md#callable-reference)，而不是使用反射。
> 
{style="tip"}

## 调用函数 {id="call-a-function"}

动态函数调用遵循与[属性](#读取属性)相同的模式。如果所有实参均按其声明顺序提供，你可以使用 [`call()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-callable/call.html)。先传入对象实例来指定未绑定的成员函数，然后添加其常规实参：

```kotlin
import kotlin.reflect.full.memberFunctions

class Formatter {
    fun format(text: String, uppercase: Boolean): String =
        if (uppercase) text.uppercase() else text
}

fun main() {
    val formatter = Formatter()

    // 在运行时根据名称查找函数
    val function = Formatter::class.memberFunctions
        .single { it.name == "format" }

    // 先提供接收者，然后按顺序提供声明的实参
    val result = function.call(formatter, "Kotlin", true)

    println(result)
    // KOTLIN
}
```

在本例中，该调用包含三个值：`Formatter` 接收者、`text` 以及 `uppercase`。它同样返回 `Any?` 类型，并在运行时报告不兼容的接收者或实参。

你也可以将值与 `KParameter` 对象关联，而不是按位置提供它们。为此，请使用 [`callBy()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.reflect/-k-callable/call-by.html) 函数：

```kotlin
import kotlin.reflect.full.instanceParameter
import kotlin.reflect.full.memberFunctions
import kotlin.reflect.full.valueParameters

class Greeter {
    fun greet(name: String, punctuation: String = "!") =
        "Hello, $name$punctuation"
}

fun main() {
    val greeter = Greeter()
    val function = Greeter::class.memberFunctions
        .single { it.name == "greet" }

    // valueParameters 包含在 greet() 中声明的形参，
    // 但不包含 Greeter 接收者
    val nameParameter = function.valueParameters
        .single { it.name == "name" }

    val result = function.callBy(
        mapOf(
            // 成员函数需要实例接收者
            function.instanceParameter!! to greeter,
            nameParameter to "Kotlin"
        )
    )

    println(result)
    // Hello, Kotlin!
}
```

在此示例中，`instanceParameter` 标识成员函数的接收者，而 `valueParameters` 仅包含在函数签名中声明的形参。

> 当完整的有序实参列表已可用时，请使用 `call()`。
> 
> 当需要将实参匹配到形参对象，或者让可选形参使用其默认值时，请使用 `callBy()`。
> 
{style="tip"}