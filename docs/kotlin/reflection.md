[//]: # (title: 反射)

**反射**是一组语言和库功能，允许您在运行时内省程序的结构。在Kotlin中，函数与属性是一等公民，而在使用函数式或响应式风格时，内省它们的能力（例如，在运行时获知属性或函数的名称或类型）至关重要。

> Kotlin/JS 对反射功能提供有限支持。[详细了解 Kotlin/JS 中的反射](js-reflection.md)。
>
{style="note"}

## JVM 依赖项 {id="jvm-dependency"}

在 JVM 平台上，Kotlin 编译器分发包将使用反射功能所需的运行时组件作为一个单独的构件 `kotlin-reflect.jar` 包含在内。这样做是为了减少不使用反射功能的应用程序所需的运行时库大小。

要在 Gradle 或 Maven 项目中使用反射，请添加对 `kotlin-reflect` 的依赖项：

* 在 Gradle 中：

    <tabs group="build-script">
    <tab title="Kotlin" group-key="kotlin">

    ```kotlin
    dependencies {
        implementation(kotlin("reflect"))
    }
    ```

    </tab>
    <tab title="Groovy" group-key="groovy">
    
    ```groovy
    dependencies {
        implementation "org.jetbrains.kotlin:kotlin-reflect:%kotlinVersion%"
    }
    ```

    </tab>
    </tabs>

* 在 Maven 中：
    
    ```xml
    <dependencies>
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-reflect</artifactId>
        </dependency>
    </dependencies>
    ```

如果您不使用 Gradle 或 Maven，请确保您的项目类路径中包含 `kotlin-reflect.jar`。在其他受支持的情况下（使用命令行编译器的 IntelliJ IDEA 项目），它会被默认添加。在命令行编译器中，您可以使用 `-no-reflect` 编译器选项从类路径中排除 `kotlin-reflect.jar`。

## 类引用 {id="class-references"}

最基本的反射功能是获取 Kotlin 类的运行时引用。要获取静态已知的 Kotlin 类的引用，可以使用**类文字**语法：

```kotlin
val c = MyClass::class
```

该引用是一个 [KClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/index.html) 类型的值。

>在 JVM 上：Kotlin 类引用与 Java 类引用并不相同。要获取 Java 类引用，请在 `KClass` 实例上使用 `.java` 属性。
>
{style="note"}

### 绑定的类引用 {id="bound-class-references"}

通过使用对象作为接收者，您可以使用相同的 `::class` 语法获取特定对象所属类的引用：

```kotlin
val widget: Widget = ...
assert(widget is GoodWidget) { "Bad widget: ${widget::class.qualifiedName}" }
```

无论接收者表达式的类型（`Widget`）如何，您都将获得该对象确切类的引用，例如 `GoodWidget` 或 `BadWidget`。

## 可调用引用 {id="callable-references"}

对函数、属性和构造函数的引用也可以被调用，或用作[函数类型](lambdas.md#function-types)的实例。

所有可调用引用的共同超类型是 [`KCallable<out R>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-callable/index.html)，其中 `R` 是返回值类型。对于属性，它是属性类型；对于构造函数，它是所构造的类型。

### 函数引用 {id="function-references"}

当您拥有如下声明的具名函数时，可以直接调用它（`isOdd(5)`）：

```kotlin
fun isOdd(x: Int) = x % 2 != 0
```

或者，您可以将该函数作为函数类型的值使用，即将其传递给另一个函数。为此，请使用 `::` 运算符：

```kotlin
fun isOdd(x: Int) = x % 2 != 0

fun main() {
//sampleStart
    val numbers = listOf(1, 2, 3)
    println(numbers.filter(::isOdd))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

这里的 `::isOdd` 是函数类型 `(Int) -> Boolean` 的一个值。

根据参数数量的不同，函数引用属于 [`KFunction<out R>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-function/index.html) 的子类型之一。例如，`KFunction3<T1, T2, T3, R>`。

当从上下文中已知预期类型时，`::` 可用于重载函数。例如：

```kotlin
fun main() {
//sampleStart
    fun isOdd(x: Int) = x % 2 != 0
    fun isOdd(s: String) = s == "brillig" || s == "slithy" || s == "tove"
    
    val numbers = listOf(1, 2, 3)
    println(numbers.filter(::isOdd)) // 引用 isOdd(x: Int)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

或者，您可以通过将方法引用存储在显式指定类型的变量中来提供必要的上下文：

```kotlin
val predicate: (String) -> Boolean = ::isOdd   // 引用 isOdd(x: String)
```

如果您需要使用类成员或扩展函数，则需要限定名称：`String::toCharArray`。

即使您使用对扩展函数的引用初始化变量，推断出的函数类型也不会包含接收者，但它会有一个接受接收者对象的额外参数。要改为获取带有接收者的函数类型，请显式指定类型：

```kotlin
val isEmptyStringList: List<String>.() -> Boolean = List<String>::isEmpty
```

#### 示例：函数组合 {id="example-function-composition"}

考虑以下函数：

```kotlin
fun <A, B, C> compose(f: (B) -> C, g: (A) -> B): (A) -> C {
    return { x -> f(g(x)) }
}
```

它返回传递给它的两个函数的组合：`compose(f, g) = f(g(*))`。您可以将此函数应用于可调用引用：

```kotlin
fun <A, B, C> compose(f: (B) -> C, g: (A) -> B): (A) -> C {
    return { x -> f(g(x)) }
}

fun isOdd(x: Int) = x % 2 != 0

fun main() {
//sampleStart
    fun length(s: String) = s.length
    
    val oddLength = compose(::isOdd, ::length)
    val strings = listOf("a", "ab", "abc")
    
    println(strings.filter(oddLength))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 属性引用 {id="property-references"}

要在 Kotlin 中将属性作为一等对象访问，请使用 `::` 运算符：

```kotlin
val x = 1

fun main() {
    println(::x.get())
    println(::x.name) 
}
```

表达式 `::x` 求值为 `KProperty0<Int>` 类型的属性对象。您可以使用 `get()` 读取其值，或使用 `name` 属性检索属性名称。有关更多信息，请参阅 [`KProperty` 类的文档](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-property/index.html)。

对于可变属性（例如 `var y = 1`），`::y` 返回 [`KMutableProperty0<Int>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-mutable-property/index.html) 类型的值，该类型具有 `set()` 方法：

```kotlin
var y = 1

fun main() {
    ::y.set(2)
    println(y)
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

属性引用可以用在预期具有单个泛型参数的函数处：

```kotlin
fun main() {
//sampleStart
    val strs = listOf("a", "bc", "def")
    println(strs.map(String::length))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

要访问作为类成员的属性，请按如下方式对其进行限定：

```kotlin
fun main() {
//sampleStart
    class A(val p: Int)
    val prop = A::p
    println(prop.get(A(1)))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

对于扩展属性：

```kotlin
val String.lastChar: Char
    get() = this[length - 1]

fun main() {
    println(String::lastChar.get("abc"))
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 与 Java 反射的互操作性 {id="interoperability-with-java-reflection"}

在 JVM 平台上，标准库包含反射类的扩展，这些扩展提供了与 Java 反射对象的映射（请参阅包 `kotlin.reflect.jvm`）。例如，要查找支持字段或作为 Kotlin 属性 getter 的 Java 方法，您可以编写如下代码：

```kotlin
import kotlin.reflect.jvm.*
 
class A(val p: Int)
 
fun main() {
    println(A::p.javaGetter) // 打印 "public final int A.getP()"
    println(A::p.javaField)  // 打印 "private final int A.p"
}
```

要获取与 Java 类相对应的 Kotlin 类，请使用 `.kotlin` 扩展属性：

```kotlin
fun getKClass(o: Any): KClass<Any> = o.javaClass.kotlin
```

### 构造函数引用 {id="constructor-references"}

可以像引用方法和属性一样引用构造函数。只要程序预期一个函数类型对象，且该对象接受与构造函数相同的参数并返回相应类型的对象，您就可以使用构造函数引用。通过使用 `::` 运算符并添加类名来引用构造函数。考虑以下预期一个不含参数且返回类型为 `Foo` 的函数参数的函数：

```kotlin
class Foo

fun function(factory: () -> Foo) {
    val x: Foo = factory()
}
```

使用 `::Foo`（类 `Foo` 的无参构造函数），您可以像这样调用它：

```kotlin
function(::Foo)
```

根据参数数量的不同，构造函数的可调用引用被归类为 [`KFunction<out R>`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-function/index.html) 的子类型之一。

### 绑定的函数与属性引用 {id="bound-function-and-property-references"}

您可以引用特定对象的实例方法：

```kotlin
fun main() {
//sampleStart
    val numberRegex = "\\d+".toRegex()
    println(numberRegex.matches("29"))
     
    val isNumber = numberRegex::matches
    println(isNumber("29"))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

该示例没有直接调用 `matches` 方法，而是使用了对它的引用。此类引用与其接收者绑定。它可以被直接调用（如上例所示），也可以在预期函数类型表达式时使用：

```kotlin
fun main() {
//sampleStart
    val numberRegex = "\\d+".toRegex()
    val strings = listOf("abc", "124", "a70")
    println(strings.filter(numberRegex::matches))
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

比较绑定引用与未绑定引用的类型。绑定的可调用引用已“附加”了其接收者，因此接收者的类型不再是参数：

```kotlin
val isNumber: (CharSequence) -> Boolean = numberRegex::matches

val matches: (Regex, CharSequence) -> Boolean = Regex::matches
```

属性引用也可以被绑定：

```kotlin
fun main() {
//sampleStart
    val prop = "abc"::length
    println(prop.get())
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

您不需要将 `this` 指定为接收者：`this::foo` 与 `::foo` 是等效的。

### 绑定的构造函数引用 {id="bound-constructor-references"}

通过提供外部类的实例，可以获得[内部类](nested-classes.md#inner-classes)构造函数的绑定可调用引用：

```kotlin
class Outer {
    inner class Inner
}

val o = Outer()
val boundInnerCtor = o::Inner
```
