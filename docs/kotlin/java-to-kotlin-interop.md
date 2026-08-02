[//]: # (title: 从 Java 调用 Kotlin)

Kotlin 代码可以从 Java 轻松调用。
例如，可以在 Java 方法中无缝创建和操作 Kotlin 类的实例。
然而，在将 Kotlin 代码集成到 Java 时，Java 和 Kotlin 之间存在某些需要注意的差异。
在本页中，我们将介绍定制 Kotlin 代码与其 Java 客户端互操作的方式。

## 属性

Kotlin 属性会被编译为以下 Java 元素：

 * 一个 getter 方法，其名称通过添加 `get` 前缀计算得出。
 * 一个 setter 方法，其名称通过添加 `set` 前缀计算得出（仅限 `var` 属性）。
 * 一个私有字段，其名称与属性名称相同（仅限带支持字段的属性）。

例如，`var firstName: String` 会编译为以下 Java 声明：

```java
private String firstName;

public String getFirstName() {
    return firstName;
}

public void setFirstName(String firstName) {
    this.firstName = firstName;
}
```

如果属性名称以 `is` 开头，则使用不同的名称映射规则：getter 的名称与属性名称相同，而 setter 的名称通过将 `is` 替换为 `set` 获得。
例如，对于属性 `isOpen`，getter 名为 `isOpen()`，setter 名为 `setOpen()`。
此规则适用于任何类型的属性，而不仅仅是 `Boolean`。

## 软件包级函数

在 `org.example` 软件包内的 `app.kt` 文件中声明的所有函数和属性（包括扩展函数），都会被编译为名为 `org.example.AppKt` 的 Java 类的静态方法。

```kotlin
// app.kt
package org.example

class Util

fun getTime() { /*...*/ }

```

```java
// Java
new org.example.Util();
org.example.AppKt.getTime();
```

要为生成的 Java 类设置自定义名称，请使用 `@JvmName` 注解：

```kotlin
@file:JvmName("DemoUtils")

package org.example

class Util

fun getTime() { /*...*/ }

```

```java
// Java
new org.example.Util();
org.example.DemoUtils.getTime();
```

如果多个文件生成的 Java 类名相同（相同的软件包和相同的名称，或相同的 [`@JvmName`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-name/index.html) 注解），通常会导致错误。
但是，编译器可以生成一个具有指定名称的单一 Java 外观类，其中包含来自具有该名称的所有文件的所有声明。
要启用此类外观类的生成，请在所有此类文件中使用 [`@JvmMultifileClass`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-multifile-class/index.html) 注解。

```kotlin
// oldutils.kt
@file:JvmName("Utils")
@file:JvmMultifileClass

package org.example

fun getTime() { /*...*/ }
```

```kotlin
// newutils.kt
@file:JvmName("Utils")
@file:JvmMultifileClass

package org.example

fun getDate() { /*...*/ }
```

```java
// Java
org.example.Utils.getTime();
org.example.Utils.getDate();
```

## 实例字段

如果你需要将 Kotlin 属性公开为 Java 中的字段，请为其添加 [`@JvmField`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-field/index.html) 注解。
该字段的可见性与其底层属性相同。如果满足以下条件，则可以使用 `@JvmField` 注解属性：
* 具有支持字段
* 不是私有的
* 不带有 `open`、`override` 或 `const` 修饰符
* 不是委托属性

```kotlin
class User(id: String) {
    @JvmField val ID = id
}
```

```java

// Java
class JavaClient {
    public String getID(User user) {
        return user.ID;
    }
}
```

[延迟初始化](properties.md#late-initialized-properties-and-variables)的属性也会作为字段公开。
该字段的可见性与 `lateinit` 属性的 setter 的可见性相同。

## 静态字段

在具名对象或伴生对象中声明的 Kotlin 属性具有静态支持字段，这些字段要么位于该具名对象中，要么位于包含伴生对象的类中。

通常这些字段是私有的，但可以通过以下方式之一公开：

 - [`@JvmField`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-field/index.html) 注解
 - `lateinit` 修饰符
 - `const` 修饰符
 
使用 `@JvmField` 注解此类属性会使其成为静态字段，且具有与属性本身相同的可见性。

```kotlin
class Key(val value: Int) {
    companion object {
        @JvmField
        val COMPARATOR: Comparator<Key> = compareBy<Key> { it.value }
    }
}
```

```java
// Java
Key.COMPARATOR.compare(key1, key2);
// Key 类中的 public static final 字段
```

在对象或伴生对象中[延迟初始化](properties.md#late-initialized-properties-and-variables)的属性具有静态支持字段，且可见性与属性的 setter 相同。

```kotlin
object Singleton {
    lateinit var provider: Provider
}
```

```java

// Java
Singleton.provider = new Provider();
// Singleton 类中的 public static non-final 字段
```

声明为 `const` 的属性（在类中以及顶层）在 Java 中会转换为静态字段：

```kotlin
// 文件 example.kt

object Obj {
    const val CONST = 1
}

class C {
    companion object {
        const val VERSION = 9
    }
}

const val MAX = 239
```

在 Java 中：

```java

int constant = Obj.CONST;
int max = ExampleKt.MAX;
int version = C.VERSION;
```

## 静态方法

如上所述，Kotlin 将软件包级函数表示为静态方法。
如果你将函数注解为 [`@JvmStatic`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-static/index.html)，Kotlin 还可以为具名对象或伴生对象中定义的函数生成静态方法。
如果你使用此注解，编译器既会在该对象的封闭类中生成一个静态方法，也会在对象本身中生成一个实例方法。例如：

```kotlin
class C {
    companion object {
        @JvmStatic fun callStatic() {}
        fun callNonStatic() {}
    }
}
```

现在，`callStatic()` 在 Java 中是静态的，而 `callNonStatic()` 则不是：

```java

C.callStatic(); // 运行正常
C.callNonStatic(); // 错误：不是静态方法
C.Companion.callStatic(); // 实例方法依然存在
C.Companion.callNonStatic(); // 唯一的运行方式
```

对于具名对象也类似：

```kotlin
object Obj {
    @JvmStatic fun callStatic() {}
    fun callNonStatic() {}
}
```

在 Java 中：

```java

Obj.callStatic(); // 运行正常
Obj.callNonStatic(); // 错误
Obj.INSTANCE.callNonStatic(); // 正常，通过单例实例调用
Obj.INSTANCE.callStatic(); // 也能运行
```

从 Kotlin 1.3 开始，`@JvmStatic` 也适用于接口的伴生对象中定义的函数。
此类函数会编译为接口中的静态方法。请注意，接口中的静态方法是在 Java 1.8 中引入的，因此请确保使用相应的目标。

```kotlin
interface ChatBot {
    companion object {
        @JvmStatic fun greet(username: String) {
            println("Hello, $username")
        }
    }
}
```

你还可以将 `@JvmStatic` 注解应用于具名对象或伴生对象的属性，使其 getter 和 setter 方法成为该对象或包含该伴生对象的类中的静态成员。

## 接口中的默认方法

当目标平台为 JVM 时，Kotlin 会将接口中声明的函数编译为 [默认方法](https://docs.oracle.com/javase/tutorial/java/IandI/defaultmethods.html)，除非 [另有配置](#compatibility-modes-for-default-methods)。
这些是接口中的具体方法，Java 类可以直接继承而无需重新实现。

这是一个带默认方法的 Kotlin 接口示例：

```kotlin
interface Robot {
    fun move() { println("~walking~") }  // 将成为 Java 接口中的默认方法
    fun speak(): Unit
}
```

默认实现可供实现该接口的 Java 类使用。

```java
//Java 实现
public class C3PO implements Robot {
    // Robot 的 move() 实现隐式可用
    @Override
    public void speak() {
        System.out.println("I beg your pardon, sir");
    }
}
```

```java
C3PO c3po = new C3PO();
c3po.move(); // 来自 Robot 接口的默认实现
c3po.speak();
```

接口的实现可以重写默认方法。

```java
//Java
public class BB8 implements Robot {
    //默认方法的自有实现
    @Override
    public void move() {
        System.out.println("~rolling~");
    }

    @Override
    public void speak() {
        System.out.println("Beep-beep");
    }
}
```

### 默认方法的兼容模式

Kotlin 提供了三种模式，用于控制接口中的函数如何编译为 JVM 默认方法。
这些模式决定了编译器是否在 `DefaultImpls` 类中生成兼容性桥接方法和静态方法。

你可以使用 `-jvm-default` 编译器选项控制此行为：

> `-jvm-default` 编译器选项取代了已弃用的 `-Xjvm-default` 选项。
>
{style="note"}

详细了解兼容模式：

#### enable {initial-collapse-state="collapsed" collapsible="true"}

默认行为。
在接口中生成默认实现，并包括兼容性桥接方法和 `DefaultImpls` 类。
此模式保持与旧版编译的 Kotlin 代码的兼容性。

#### no-compatibility {initial-collapse-state="collapsed" collapsible="true"}

仅在接口中生成默认实现。
跳过兼容性桥接方法和 `DefaultImpls` 类。
对于不与依赖 `DefaultImpls` 类的代码交互的新代码库，请使用此模式。
这可能会破坏与旧版 Kotlin 代码的二进制兼容性。

> 如果使用了接口委托，则会委托所有接口方法。
>
{style="note"}

#### disable {initial-collapse-state="collapsed" collapsible="true"}

禁用接口中的默认实现。
仅生成兼容性桥接方法和 `DefaultImpls` 类。

## 可见性

Kotlin 可见性修饰符以下列方式映射到 Java：

* `private` 成员保持为 `private`。
* `private` 顶层声明在 Java 中变为 `private` 顶层声明。如果从类内部访问，还会包括包级私有访问器。
* `protected` 成员保持为 `protected`。

  请注意，Java 允许从同一软件包中的其他类访问 `protected` 成员，而 Kotlin 不允许。
* `internal` 声明在 Java 中变为 `public`。

  Kotlin 编译器会在字节码中对 `internal` 成员的名称进行修饰（mangle）。这可以防止跨模块的意外重写，例如，当从 Java 扩展 Kotlin 类时，并允许为具有相同签名的成员提供重载。

  请注意，`internal` 类的公共成员名称不会被修饰，并且在 Java 中仍然可以调用。
* `public` 成员保持为 `public`。

## KClass

有时你需要调用一个带有 `KClass` 类型形参的 Kotlin 方法。
从 `Class` 到 `KClass` 没有自动转换，因此你必须通过调用相当于 `Class<T>.kotlin` 扩展属性的以下内容来手动完成：

```kotlin
kotlin.jvm.JvmClassMappingKt.getKotlinClass(MainView.class)
```

## 使用 @JvmName 处理签名冲突

有时我们在 Kotlin 中有一个具名函数，而在字节码中我们需要一个不同的 JVM 名称。
最突出的例子是由于 *类型擦除* 引起的：

```kotlin
fun List<String>.filterValid(): List<String>
fun List<Int>.filterValid(): List<Int>
```

这两个函数不能并排定义，因为它们的 JVM 签名相同：`filterValid(Ljava/util/List;)Ljava/util/List;`。
如果我们确实希望它们在 Kotlin 中具有相同的名称，我们可以使用 [`@JvmName`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-name/index.html) 注解其中一个（或两者），并指定一个不同的名称作为实参：

```kotlin
fun List<String>.filterValid(): List<String>

@JvmName("filterValidInt")
fun List<Int>.filterValid(): List<Int>
```

在 Kotlin 中，它们可以通过相同的名称 `filterValid` 访问，但在 Java 中，它们分别是 `filterValid` 和 `filterValidInt`。

当我们需要同时拥有属性 `x` 和函数 `getX()` 时，同样的技巧也适用：

```kotlin
val x: Int
    @JvmName("getX_prop")
    get() = 15

fun getX() = 10
```

要在没有显式实现 getter 和 setter 的情况下更改属性生成的访问器方法的名称，可以使用 `@get:JvmName` 和 `@set:JvmName`：

```kotlin
@get:JvmName("x")
@set:JvmName("changeX")
var x: Int = 23
```

## 生成重载

通常情况下，如果你编写一个带有默认参数值的 Kotlin 函数，它在 Java 中仅作为完整签名可见，且所有形参都存在。

你可以使用 [`@IntroducedAt`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-introduced-at/) 注解或 [`@JvmOverloads`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-overloads/index.html) 注解来为可选形参生成重载。

当你向已发布的 API 添加新的可选形参，并希望生成的重载反映每个形参引入的版本时，请使用 `@IntroducedAt`。
编译器利用此信息自动生成相应的隐藏重载。

这为你提供了基于版本的重载生成，并有助于为针对库的旧版本编译的调用者保留二进制兼容性。

> `@IntroducedAt` 注解是[实验性的](components-stability.md#stability-levels-explained)。要选择性加入，请使用 `@OptIn(ExperimentalVersionOverloading::class)` 注解。
> 
{style="warning"}

以下是一个示例，其中 `Button()` 函数在多个 API 版本中接收多个可选形参：

```kotlin
@OptIn(ExperimentalVersionOverloading::class)
fun Button(
    label: String = "",
    color: Color = DefaultColor,
    @IntroducedAt("1.1") borderColor: Color = DefaultBorderColor,
    @IntroducedAt("1.2") borderStyle: Style = DefaultBorderStyle,
    @IntroducedAt("1.2") borderWidth: Int = 1,
    onClick: () -> Unit
) {
    // 函数体
}
```

基于这些版本，编译器会为原始 API 以及引入新可选形参的每个 API 版本生成隐藏重载：

```kotlin
// 原始 API
Button(
    label: String,
    color: Color,
    onClick: () -> Unit
)

// 版本 1.1
Button(
    label: String,
    color: Color,
    borderColor: Color,
    onClick: () -> Unit
)

// 版本 1.2
Button(
    label: String,
    color: Color,
    borderColor: Color,
    borderStyle: Style,
    borderWidth: Int,
    onClick: () -> Unit
)
```

如果你希望向 Java 调用者公开多个重载，还可以使用 [`@JvmOverloads`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-overloads/index.html) 注解。

该注解也适用于构造函数、静态方法等。它不能用于抽象方法，包括接口中定义的方法。例如，考虑一个具有默认参数值的 `Circle` 类：

```kotlin
class Circle @JvmOverloads constructor(centerX: Int, centerY: Int, radius: Double = 1.0) {
    @JvmOverloads fun draw(label: String, lineWidth: Int = 1, color: String = "red") { /*...*/ }
}
```

对于每个带有默认值的形参，这都会生成一个额外的重载，该重载会移除此形参及其形参列表中右侧的所有形参。在本例中，将生成以下内容：

```java
// 构造函数：
Circle(int centerX, int centerY, double radius)
Circle(int centerX, int centerY)

// 方法
void draw(String label, int lineWidth, String color) { }
void draw(String label, int lineWidth) { }
void draw(String label) { }
```

由于 `@IntroducedAt` 和 `@JvmOverloads` 注解都会生成重载，同时使用它们可能会产生冲突的重载。
如果你同时使用这两个注解，编译器会报告警告。如果你取消显示该警告，编译器会优先处理由 `@IntroducedAt` 注解生成的重载。

请注意，正如 [次用构造函数](classes.md#secondary-constructors) 中所述，如果一个类的所有构造函数参数都有默认值，则会为其生成一个不带实参的公共构造函数。即使未指定 `@JvmOverloads` 注解，这也有效。

## 受检异常

Kotlin 没有受检异常。
因此，通常 Kotlin 函数的 Java 签名不会声明抛出的异常。
因此，如果你在 Kotlin 中有如下函数：

```kotlin
// example.kt
package demo

fun writeToFile() {
    /*...*/
    throw IOException()
}
```

并且你想从 Java 中调用它并捕获异常：

```java

// Java
try {
    demo.Example.writeToFile();
} catch (IOException e) { 
    // 错误：writeToFile() 未在 throws 列表中声明 IOException
    // ...
}
```

你会收到来自 Java 编译器的错误消息，因为 `writeToFile()` 未声明 `IOException`。
要解决此问题，请在 Kotlin 中使用 [`@Throws`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throws/index.html) 注解：

```kotlin
@Throws(IOException::class)
fun writeToFile() {
    /*...*/
    throw IOException()
}
```

## null 安全

从 Java 调用 Kotlin 函数时，没有人能阻止我们将 `null` 作为非 nullable 形参传递。
这就是为什么 Kotlin 会为所有预期非 null 的公共函数生成运行时检查的原因。
通过这种方式，我们在 Java 代码中会立即收到 `NullPointerException`。

## 变体泛型

当 Kotlin 类使用 [声明处型变](generics.md#declaration-site-variance) 时，Java 代码中看到的使用方式有两种选择。例如，假设你具有以下类和两个使用它的函数：

```kotlin
class Box<out T>(val value: T)

interface Base
class Derived : Base

fun boxDerived(value: Derived): Box<Derived> = Box(value)
fun unboxBase(box: Box<Base>): Base = box.value
```

将这些函数转换为 Java 的一种简单方式如下：

```java
Box<Derived> boxDerived(Derived value) { ... }
Base unboxBase(Box<Base> box) { ... }
```

问题在于，在 Kotlin 中你可以编写 `unboxBase(boxDerived(Derived()))`，但在 Java 中这将是不可能的，因为在 Java 中 `Box` 类在其形参 `T` 上是 *不变的*，因此 `Box<Derived>` 不是 `Box<Base>` 的子类型。
为了在 Java 中使其工作，你必须如下定义 `unboxBase`：

```java
Base unboxBase(Box<? extends Base> box) { ... }  
```

此声明使用 Java 的 *通配符类型* (`? extends Base`) 通过使用处型变来模拟声明处型变，因为这是 Java 唯一拥有的手段。

为了使 Kotlin API 在 Java 中正常工作，当作为 *形参* 出现时，编译器会将协变定义的 `Box` 的 `Box<Super>` 生成为 `Box<? extends Super>`（或者将逆变定义的 `Foo` 生成为 `Foo<? super Bar>`）。当作为返回值时，不会生成通配符，否则 Java 客户端将不得不处理它们（这违反了常见的 Java 编码风格）。因此，我们示例中的函数实际上转换如下：

```java

// 返回值类型 - 无通配符
Box<Derived> boxDerived(Derived value) { ... }
 
// 形参 - 通配符 
Base unboxBase(Box<? extends Base> box) { ... }
```

> 当实参类型为 final 时，通常生成通配符没有意义，因此 `Box<String>` 始终是 `Box<String>`，无论它处于什么位置。
>
{style="note"}

如果你在默认不生成通配符的地方需要通配符，请使用 `@JvmWildcard` 注解：

```kotlin
fun boxDerived(value: Derived): Box<@JvmWildcard Derived> = Box(value)
// 转换为 
// Box<? extends Derived> boxDerived(Derived value) { ... }
```

相反，如果你在生成通配符的地方不需要它们，请使用 `@JvmSuppressWildcards`：

```kotlin
fun unboxBase(box: Box<@JvmSuppressWildcards Base>): Base = box.value
// 转换为 
// Base unboxBase(Box<Base> box) { ... }
```

>`@JvmSuppressWildcards` 不仅可以用于单个类型实参，还可以用于整个声明（如函数或类），从而抑制其中所有的通配符。
>
{style="note"}

### Nothing 类型的转换
 
[`Nothing`](exceptions.md#the-nothing-type) 类型很特殊，因为它在 Java 中没有自然的对应物。实际上，每个 Java 引用类型（包括 `java.lang.Void`）都接受 `null` 作为值，而 `Nothing` 甚至不接受该值。因此，此类型无法在 Java 世界中准确表示。这就是为什么 Kotlin 在使用 `Nothing` 类型实参的地方生成原始类型（raw type）的原因：

```kotlin
fun emptyList(): List<Nothing> = listOf()
// 转换为
// List emptyList() { ... }
```

## 内联值类

<primary-label ref="experimental-general"/>

如果你希望 Java 代码能顺畅地与 Kotlin 的 [内联值类](inline-classes.md) 配合工作，可以使用 [`@JvmExposeBoxed`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.jvm/-jvm-expose-boxed/) 注解或 `-Xjvm-expose-boxed` 编译器选项。这些方法确保 Kotlin 为 Java 互操作性生成必要的装箱表示。

默认情况下，Kotlin 编译内联值类以使用 **未装箱表示**，这在 Java 中通常无法访问。
例如，你无法从 Java 调用 `MyInt` 类的构造函数：

```kotlin
@JvmInline
value class MyInt(val value: Int)
```

因此以下 Java 代码会失败：

```java
MyInt input = new MyInt(5);
```

你可以使用 `@JvmExposeBoxed` 注解，以便 Kotlin 生成一个你可以直接从 Java 调用的公共构造函数。
你可以将注解应用于以下级别，以确保对向 Java 公开的内容进行精细控制：

* 类
* 构造函数
* 函数

在代码中使用 `@JvmExposeBoxed` 注解之前，必须通过使用 `@OptIn(ExperimentalStdlibApi::class)` 进行选择性加入（opt in）。
例如：

```kotlin
@OptIn(ExperimentalStdlibApi::class)
@JvmExposeBoxed
@JvmInline
value class MyInt(val value: Int)

@OptIn(ExperimentalStdlibApi::class)
@JvmExposeBoxed
fun MyInt.timesTwoBoxed(): MyInt = MyInt(this.value * 2)
```

通过这些注解，Kotlin 会为 `MyInt` 类生成一个可供 Java 访问的构造函数，**并**为使用值类的装箱形式的扩展函数生成一个变体。因此，以下 Java 代码可以成功运行：

```java
MyInt input = new MyInt(5);
MyInt output = ExampleKt.timesTwoBoxed(input);
```

要将此行为应用于模块内的所有内联值类及其使用的函数，请使用 `-Xjvm-expose-boxed` 选项进行编译。
使用此选项编译的效果相当于该模块中的每个声明都带有 `@JvmExposeBoxed` 注解。

### 继承的函数

`@JvmExposeBoxed` 注解不会自动为继承的函数生成装箱表示。
 
要为继承的函数生成必要的表示，请在实现类或扩展类中重写它：
 
```kotlin
interface IdTransformer {
    fun transformId(rawId: UInt): UInt = rawId
}

// 不会为 transformId() 函数生成装箱表示
@OptIn(ExperimentalStdlibApi::class)
@JvmExposeBoxed
class LightweightTransformer : IdTransformer

// 会为 transformId() 函数生成装箱表示
@OptIn(ExperimentalStdlibApi::class)
@JvmExposeBoxed
class DefaultTransformer : IdTransformer {
    override fun transformId(rawId: UInt): UInt = super.transformId(rawId)
}
```

要了解 Kotlin 中的继承如何工作，以及如何使用 `super` 关键字调用超类实现，请参阅 [继承](inheritance.md#calling-the-superclass-implementation)。