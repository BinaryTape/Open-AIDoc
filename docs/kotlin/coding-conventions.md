[//]: # (title: 编码规范)

通俗易懂且易于遵守的编码规范对于任何编程语言都至关重要。
在此，我们为使用 Kotlin 的项目提供有关代码样式和代码组织的指南。

## 在 IDE 中配置样式

Kotlin 最受支持的两款 IDE —— [IntelliJ IDEA](https://www.jetbrains.com/idea/) 和 [Android Studio](https://developer.android.com/studio/)
为代码样式提供了强大的支持。你可以配置它们自动格式化代码，使其与给定的代码样式保持一致。

### 应用样式指南

1. 转到 **Settings/Preferences | Editor | Code Style | Kotlin**。
2. 点击 **Set from...**。
3. 选择 **Kotlin style guide**。

### 验证代码是否符合样式指南

1. 转到 **Settings/Preferences | Editor | Inspections | General**。
2. 开启 **Incorrect formatting** 检查。
验证样式指南中描述的其他问题（如命名约定）的其他检查默认已启用。

<!-- 当指南移动时，请替换为外部链接 -->

要了解更多信息，请参阅 [Migrate to Kotlin code style with IntelliJ IDEA](code-style-migration-guide.md) 指南。

## 源代码组织

### 目录结构

在纯 Kotlin 项目中，推荐的目录结构遵循软件包结构并省略通用的根软件包。例如，如果项目中的所有代码都位于 `org.example.kotlin` 软件包及其子软件包中，那么带有 `org.example.kotlin` 软件包声明的文件应直接放在源根目录下，而 `org.example.kotlin.network.socket` 中的文件应放在源根目录下的 `network/socket` 子目录中。

> 在 JVM 上：在 Kotlin 与 Java 混合使用的项目中，Kotlin 源文件应与 Java 源文件位于相同的源根目录下，并遵循相同的目录结构：每个文件应存储在与每个软件包语句相对应的目录中。
>
{style="note"}

### 源文件名称

如果一个 Kotlin 文件包含单个类或接口（可能还包含相关的顶层声明），其名称应与类名相同，并附加 `.kt` 扩展名。这适用于所有类型的类和接口。
如果一个文件包含多个类或仅包含顶层声明，请选择一个能够描述文件内容的名称，并相应地命名该文件。
使用[大骆驼拼写法](https://en.wikipedia.org/wiki/Camel_case)，即每个单词的首字母大写。
例如：`ProcessDeclarations.kt`。

文件名称应描述文件中代码的功能。因此，应避免在文件名称中使用诸如 `Util` 之类无意义的词汇。

#### 多平台项目

在多平台项目中，在特定平台源集中包含顶层声明的文件应具有与源集名称关联的后缀。例如：

* **jvm**Main/kotlin/Platform.**jvm**.kt
* **android**Main/kotlin/Platform.**android**.kt
* **ios**Main/kotlin/Platform.**ios**.kt

对于通用（common）源集，包含顶层声明的文件不应有后缀。例如：`commonMain/kotlin/Platform.kt`。

##### 技术细节 {initial-collapse-state="collapsed" collapsible="true"}

由于 JVM 的限制，我们建议在多平台项目遵循此文件命名方案：JVM 不允许顶层成员（函数、属性）。

为了解决这个问题，Kotlin JVM 编译器会创建包装类（即所谓的“文件门面”），其中包含顶层成员声明。文件门面具有从文件名派生的内部名称。

反过来，JVM 不允许具有相同完全限定名称 (FQN) 的多个类。这可能会导致 Kotlin 项目无法编译到 JVM 的情况：

```none
root
|- commonMain/kotlin/myPackage/Platform.kt // 包含 'fun count() { }'
|- jvmMain/kotlin/myPackage/Platform.kt // 包含 'fun multiply() { }'
```

在这里，两个 `Platform.kt` 文件都位于同一个软件包中，因此 Kotlin JVM 编译器会生成两个文件门面，它们的 FQN 均为 `myPackage.PlatformKt`。这会产生“Duplicate JVM classes”错误。

避免该错误最简单的方法是根据上述指南重命名其中一个文件。这种命名方案有助于避免冲突，同时保持代码的可读性。

> 在以下两种情况下，这些建议可能看起来是多余的，但我们仍然建议遵循它们：
> 
> * 非 JVM 平台不存在文件门面重复的问题。但是，此命名方案可以帮助你保持文件命名的一致性。
> * 在 JVM 上，如果源文件没有顶层声明，则不会生成文件门面，你也就不会面临命名冲突。
> 
>   然而，此命名方案可以帮助你避免在进行简单的重构或添加操作（可能包含顶层函数）时导致相同的“Duplicate JVM classes”错误。
> 
{style="tip"}

### 源文件组织

只要多个声明（类、顶层函数或属性）在语义上彼此紧密相关，且文件大小保持在合理范围内（不超过几百行），就鼓励将它们放在同一个 Kotlin 源文件中。

特别地，在为某个类定义对该类的所有客户端都相关的扩展函数时，请将它们与类本身放在同一个文件中。当定义的扩展函数仅对特定客户端有意义时，请将它们放在该客户端的代码附近。避免仅为了存放某个类的所有扩展而创建文件。

### 类布局

类的内容应按以下顺序排列：

1. 属性声明和初始化块
2. 次构造函数
3. 方法声明
4. 伴生对象

不要按字母顺序或可见性对方法声明进行排序，也不要将常规方法与扩展方法分开。相反，应将相关的内容放在一起，以便从上到下阅读类的人能够遵循正在发生的事情的逻辑。选择一种顺序（高级别内容在前，或反之亦然）并坚持执行。

将嵌套类放在使用这些类的代码附近。如果类打算在外部使用且未在类内部引用，请将它们放在最后，位于伴生对象之后。

### 接口实现布局

在实现接口时，保持实现成员的顺序与接口成员的顺序一致（如有必要，可以插入用于实现的额外私有方法）。

### 重载布局

在类中，始终将重载内容放在一起。

## 命名规则

Kotlin 中的软件包和类命名规则非常简单：

* 软件包的名称始终为小写，不使用下划线（`org.example.project`）。通常不鼓励使用多单词名称，但如果确实需要使用多个单词，可以简单地将它们连接在一起，或使用骆驼拼写法（`org.example.myProject`）。

* 类和对象的名称使用大骆驼拼写法：

```kotlin
open class DeclarationProcessor { /*...*/ }

object EmptyDeclarationProcessor : DeclarationProcessor() { /*...*/ }
```

### 函数名称
 
函数、属性和局部变量的名称以小写字母开头，使用骆驼拼写法，不带下划线：

```kotlin
fun processDeclarations() { /*...*/ }
var declarationCount = 1
```

例外情况：用于创建类实例的工厂函数可以与抽象返回值类型具有相同的名称：

```kotlin
interface Foo { /*...*/ }

class FooImpl : Foo { /*...*/ }

fun Foo(): Foo { return FooImpl() }
```

### 测试方法名称

在测试中（且**仅**在测试中），你可以使用包含在反引号中的带空格的方法名。
请注意，此类方法名仅从 API 级别 30 开始受 Android 运行时支持。测试代码中也允许在方法名中使用下划线。

```kotlin
class MyTestCase {
    @Test fun `ensure everything works`() { /*...*/ }

    @Test fun ensureEverythingWorks_onAndroid() { /*...*/ }
}
```

### 属性名称

常量名称（标有 `const` 的属性，或不带自定义 `get` 函数且持有深度不可变数据的顶层或对象 `val` 属性）应遵循[大写蛇形拼写法](https://en.wikipedia.org/wiki/Snake_case) (screaming snake case) 约定，使用全大写并以下划线分隔：

```kotlin
const val MAX_COUNT = 8
val USER_NAME_FIELD = "UserName"
```

持有具有行为的对象或可变数据的顶层或对象属性名称应使用骆驼拼写法名称：

```kotlin
val mutableCollection: MutableSet<String> = HashSet()
```

持有单例对象引用的属性名称可以使用与 `object` 声明相同的命名样式：

```kotlin
val PersonComparator: Comparator<Person> = /*...*/
```

对于枚举常量，根据用法，可以使用全大写、下划线分隔的名称（[大写蛇形拼写法](https://en.wikipedia.org/wiki/Snake_case)）（`enum class Color { RED, GREEN }`）或大骆驼拼写法名称。
   
### 支持属性名称

如果一个类有两个在概念上相同但在其中一个是公共 API 的一部分，另一个是实现细节的属性，请使用下划线作为私有属性名称的前缀：

```kotlin
class C {
    private val _elementList = mutableListOf<Element>()

    val elementList: List<Element>
        get() = _elementList
}
```

### 选择好名称

类的名称通常是名词或名词短语，解释该类“是什么”：`List`、`PersonReader`。

方法的名称通常是动词或动词短语，说明该方法“做什么”：`close`、`readPersons`。
名称还应暗示该方法是修改对象还是返回一个新对象。例如 `sort` 是对集合进行就地排序，而 `sorted` 是返回集合的排序副本。

名称应清楚说明实体的目的，因此最好避免在名称中使用无意义的词汇（`Manager`、`Wrapper`）。

当使用缩略语作为声明名称的一部分时，请遵循以下规则：

* 对于两个字母的缩略语，两个字母都使用大写。例如：`IOStream`。
* 对于超过两个字母的缩略语，仅首字母大写。例如：`XmlFormatter` 或 `HttpInputStream`。

## 格式设置

### 缩进

使用四个空格进行缩进。不要使用制表符（tab）。

对于花括号，将左花括号放在构造开始行的末尾，将右花括号放在单独的一行，并与开始构造水平对齐。

```kotlin
if (elements != null) {
    for (element in elements) {
        // ...
    }
}
```

> 在 Kotlin 中，分号是可选的，因此换行符具有重要意义。语言设计假设采用 Java 风格的花括号，如果你尝试使用不同的格式设置样式，可能会遇到意外行为。
>
{style="note"}

### 水平空格

* 在二元运算符周围放置空格（`a + b`）。例外：不要在“range to”运算符周围放置空格（`0..i`）。
* 不要在一元运算符周围放置空格（`a++`）。
* 在控制流关键字（`if`、`when`、`for` 和 `while`）与相应的左圆括号之间放置空格。
* 不要在主构造函数声明、方法声明或方法调用中的左圆括号之前放置空格。

```kotlin
class A(val x: Int)

fun foo(x: Int) { ... }

fun bar() {
    foo(1)
}
```

* 永远不要在 `(`、`[` 之后或 `]`、`)` 之前放置空格。
* 永远不要在 `.` 或 `?.` 周围放置空格：`foo.bar().filter { it > 2 }.joinToString()`、`foo?.bar()`。
* 在 `//` 之后放置空格：`// This is a comment`。
* 不要在用于指定类型参数的尖括号周围放置空格：`class Map<K, V> { ... }`。
* 不要在 `::` 周围放置空格：`Foo::class`、`String::length`。
* 不要在用于标记可空类型的 `?` 之前放置空格：`String?`。

作为一般规则，应避免任何形式的水平对齐。将标识符重命名为长度不同的名称不应影响声明或任何用法的格式。

### 冒号

在以下场景中，在 `:` 之前放置空格：

* 当它用于分隔类型和超类型时。
* 当委托给超类构造函数或同一类的不同构造函数时。
* 在 `object` 关键字之后。
    
当 `:` 分隔声明及其类型时，不要在其之前放置空格。
 
始终在 `:` 之后放置空格。

```kotlin
abstract class Foo<out T : Any> : IFoo {
    abstract fun foo(a: Int): T
}

class FooImpl : Foo() {
    constructor(x: String) : this(x) { /*...*/ }

    val x = object : IFoo { /*...*/ } 
}
```

### 类头

具有少量主构造函数参数的类可以写成单行：

```kotlin
class Person(id: Int, name: String)
```

具有较长头部的类应进行格式化，使每个主构造函数参数都位于带缩进的单独行中。
此外，右圆括号应位于新行。如果你使用继承，则超类构造函数调用或实现的接口列表应与圆括号位于同一行：

```kotlin
class Person(
    id: Int,
    name: String,
    surname: String
) : Human(id, name) { /*...*/ }
```

对于多个接口，应首先放置超类构造函数调用，然后每个接口应位于不同的行：

```kotlin
class Person(
    id: Int,
    name: String,
    surname: String
) : Human(id, name),
    KotlinMaker { /*...*/ }
```

对于具有较长超类型列表的类，在冒号后换行并水平对齐所有超类型名称：

```kotlin
class MyFavouriteVeryLongClassHolder :
    MyLongHolder<MyFavouriteVeryLongClass>(),
    SomeOtherInterface,
    AndAnotherOne {

    fun foo() { /*...*/ }
}
```

为了在类头很长时清晰地分隔类头和主体，可以在类头后放置一个空行（如上例所示），或者将左花括号放在单独的一行：

```kotlin
class MyFavouriteVeryLongClassHolder :
    MyLongHolder<MyFavouriteVeryLongClass>(),
    SomeOtherInterface,
    AndAnotherOne 
{
    fun foo() { /*...*/ }
}
```

对构造函数参数使用常规缩进（四个空格）。这可以确保在主构造函数中声明的属性与在类主体中声明的属性具有相同的缩进。

### 修饰符顺序

如果一个声明有多个修饰符，请始终按以下顺序排列：

```kotlin
public / protected / private / internal
expect / actual
final / open / abstract / sealed / const
external
override
lateinit
tailrec
vararg
suspend
inner
enum / annotation / fun // 作为 `fun interface` 中的修饰符 
companion
inline / value
infix
operator
data
```

将所有注解放在修饰符之前：

```kotlin
@Named("Foo")
private val foo: Foo
```

除非你正在开发库，否则请省略冗余的修饰符（例如 `public`）。

### 注解

将注解放在其附加的声明之前的单独行上，并使用相同的缩进：

```kotlin
@Target(AnnotationTarget.PROPERTY)
annotation class JsonExclude
```

不带参数的注解可以放在同一行：

```kotlin
@JsonExclude @JvmField
var x: String
```

不带参数的单个注解可以与相应的声明放在同一行：

```kotlin
@Test fun foo() { /*...*/ }
```

### 文件注解

文件注解放在文件注释（如果有）之后、`package` 语句之前，并用空行与 `package` 分隔（以强调它们针对的是文件而不是软件包）。

```kotlin
/** License, copyright and whatever */
@file:JvmName("FooBar")

package foo.bar
```

### 函数

如果函数签名不适合放在单行中，请使用以下语法：

```kotlin
fun longMethodName(
    argument: ArgumentType = defaultValue,
    argument2: AnotherArgumentType,
): ReturnType {
    // body
}
```

对函数参数使用常规缩进（四个空格）。这有助于确保与构造函数参数的一致性。

对于主体由单个表达式组成的函数，优先使用表达式体。

```kotlin
fun foo(): Int {     // 差
    return 1 
}

fun foo() = 1        // 好
```

### 表达式体

如果函数具有表达式体，且其第一行与声明不适合放在同一行，请将 `=` 号放在第一行，并将表达式体缩进四个空格。

```kotlin
fun f(x: String, y: String, z: String) =
    veryLongFunctionCallWithManyWords(andLongParametersToo(), x, y, z)
```

### 属性

对于非常简单的只读属性，考虑单行格式：

```kotlin
val isEmpty: Boolean get() = size == 0
```

对于更复杂的属性，始终将 `get` 和 `set` 关键字放在单独的行上：

```kotlin
val foo: String
    get() { /*...*/ }
```

对于带有初始值设定项的属性，如果初始值设定项较长，请在 `=` 号后换行，并将初始值设定项缩进四个空格：

```kotlin
private val defaultCharset: Charset? =
    EncodingRegistry.getInstance().getDefaultCharsetForPropertiesFiles(file)
```

### 控制流语句

如果 `if` 或 `when` 语句的条件是多行的，请始终在语句主体周围使用花括号。
将条件的每个后续行相对于语句开始处缩进四个空格。
将条件的右圆括号与左花括号一起放在单独的一行：

```kotlin
if (!component.isSyncing &&
    !hasAnyKotlinRuntimeInScope(module)
) {
    return createKotlinNotConfiguredPanel(module)
}
```

这有助于对齐条件和语句主体。

将 `else`、`catch`、`finally` 关键字以及 `do-while` 循环的 `while` 关键字放在与前一个花括号相同的行上：

```kotlin
if (condition) {
    // body
} else {
    // else part
}

try {
    // body
} finally {
    // cleanup
}
```

在 `when` 语句中，如果一个分支超过单行，请考虑用空行将其与相邻的情况块分隔开：

```kotlin
private fun parsePropertyValue(propName: String, token: Token) {
    when (token) {
        is Token.ValueToken ->
            callback.visitValue(propName, token.value)

        Token.LBRACE -> { // ...
        }
    }
}
```

将短分支放在与条件相同的行上，不带花括号。

```kotlin
when (foo) {
    true -> bar() // 好
    false -> { baz() } // 差
}
```

### 方法调用

在长实参列表中，在左圆括号后换行。将实参缩进四个空格。
将多个紧密相关的实参分组在同一行。

```kotlin
drawSquare(
    x = 10, y = 10,
    width = 100, height = 100,
    fill = true
)
```

在分隔实参名称和值的 `=` 号周围放置空格。

### 链式调用换行

当对链式调用进行换行时，将 `.` 字符或 `?.` 运算符放在下一行，并使用单次缩进：

```kotlin
val anchor = owner
    ?.firstChild!!
    .siblings(forward = true)
    .dropWhile { it is PsiComment || it is PsiWhiteSpace }
```

链中的第一个调用通常应在其之前换行，但如果代码那样读起来更合理，也可以省略。

### Lambda表达式

在 lambda表达式中，应在花括号周围以及分隔参数与主体的箭头周围使用空格。如果调用接受单个 lambda，请尽可能将其传递到圆括号外。

```kotlin
list.filter { it > 10 }
```

如果为 lambda 分配标签，请不要在标签和左花括号之间放置空格：

```kotlin
fun foo() {
    ints.forEach lit@{
        // ...
    }
}
```

在多行 lambda 中声明参数名称时，将名称放在第一行，后跟箭头和换行符：

```kotlin
appendCommaSeparated(properties) { prop ->
    val propertyValue = prop.get(obj)  // ...
}
```

如果参数列表太长而无法放在一行中，请将箭头放在单独的一行：

```kotlin
foo {
    context: Context,
    environment: Env
    ->
    context.configureEnv(environment)
}
```

### 尾随逗号

尾随逗号是指在一系列元素中的最后一项之后的逗号符号：

```kotlin
class Person(
    val firstName: String,
    val lastName: String,
    val age: Int, // 尾随逗号
)
```

使用尾随逗号有几个好处：

* 它使版本控制差异更清晰 —— 因为所有的焦点都集中在更改的值上。
* 它使添加和重新排序元素变得容易 —— 如果你操作元素，则无需添加或删除逗号。
* 它简化了代码生成，例如对于对象初始化器。最后一个元素也可以有逗号。

尾随逗号完全是可选的 —— 没有它们你的代码仍然可以工作。Kotlin 样式指南鼓励在声明处使用尾随逗号，并由你自行决定是否在调用处使用。

要在 IntelliJ IDEA 格式化程序中启用尾随逗号，请转到 **Settings/Preferences | Editor | Code Style | Kotlin**，打开 **Other** 选项卡并勾选 **Use trailing comma** 选项。

#### 枚举 {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
enum class Direction {
    NORTH,
    SOUTH,
    WEST,
    EAST, // 尾随逗号
}
```

#### 值参数 {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
fun shift(x: Int, y: Int) { /*...*/ }
shift(
    25,
    20, // 尾随逗号
)
val colors = listOf(
    "red",
    "green",
    "blue", // 尾随逗号
)
```

#### 类属性和参数 {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
class Customer(
    val name: String,
    val lastName: String, // 尾随逗号
)
class Customer(
    val name: String,
    lastName: String, // 尾随逗号
)
```

#### 函数值参数 {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
fun powerOf(
    number: Int, 
    exponent: Int, // 尾随逗号
) { /*...*/ }
constructor(
    x: Comparable<Number>,
    y: Iterable<Number>, // 尾随逗号
) {}
fun print(
    vararg quantity: Int,
    description: String, // 尾随逗号
) {}
```

#### 带有可选类型的参数（包括 setter） {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
val sum: (Int, Int, Int) -> Int = fun(
    x,
    y,
    z, // 尾随逗号
): Int {
    return x + y + x
}
println(sum(8, 8, 8))
```

#### 索引后缀 {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
class Surface {
    operator fun get(x: Int, y: Int) = 2 * x + 4 * y - 10
}
fun getZValue(mySurface: Surface, xValue: Int, yValue: Int) =
    mySurface[
        xValue,
        yValue, // 尾随逗号
    ]
```

#### Lambda 中的参数 {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
fun main() {
    val x = {
            x: Comparable<Number>,
            y: Iterable<Number>, // 尾随逗号
        ->
        println("1")
    }
    println(x)
}
```

#### when 条目 {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
fun isReferenceApplicable(myReference: `KClass<*>`) = when (myReference) {
    Comparable::class,
    Iterable::class,
    String::class, // 尾随逗号
        -> true
    else -> false
}
```

#### 集合字面量（在注解中） {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
annotation class ApplicableFor(val services: Array<String>)
@ApplicableFor([
    "serializer",
    "balancer",
    "database",
    "inMemoryCache", // 尾随逗号
])
fun run() {}
```

#### 类型参数（Type arguments） {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
fun <T1, T2> foo() {}
fun main() {
    foo<
            Comparable<Number>,
            Iterable<Number>, // 尾随逗号
            >()
}
```

#### 类型形参（Type parameters） {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
class MyMap<
        MyKey,
        MyValue, // 尾随逗号
        > {}
```

#### 析构声明 {initial-collapse-state="collapsed" collapsible="true"}

```kotlin
data class Car(val manufacturer: String, val model: String, val year: Int)
val myCar = Car("Tesla", "Y", 2019)
val (
    manufacturer,
    model,
    year, // 尾随逗号
) = myCar
val cars = listOf<Car>()
fun printMeanValue() {
    var meanValue: Int = 0
    for ((
        _,
        _,
        year, // 尾随逗号
    ) in cars) {
        meanValue += year
    }
    println(meanValue/cars.size)
}
printMeanValue()
```

## 文档注释

对于较长的文档注释，将开头的 `/**` 放在单独的一行，并以星号开始后续的每一行：

```kotlin
/**
 * This is a documentation comment
 * on multiple lines.
 */
```

短注释可以放在单行中：

```kotlin
/** This is a short documentation comment. */
```

通常，应避免使用 `@param` 和 `@return` 标签。相反，应将参数和返回值的描述直接合并到文档注释中，并在提到参数的任何地方添加指向参数的链接。仅当需要无法融入正文流程的冗长描述时，才使用 `@param` 和 `@return`。

```kotlin
// 避免这样做：

/**
 * Returns the absolute value of the given number.
 * @param number The number to return the absolute value for.
 * @return The absolute value.
 */
fun abs(number: Int): Int { /*...*/ }

// 推荐这样做：

/**
 * Returns the absolute value of the given [number].
 */
fun abs(number: Int): Int { /*...*/ }
```

## 避免冗余构造

通常，如果 Kotlin 中的某种语法构造是可选的，并且被 IDE 突出显示为冗余，则应在代码中省略它。不要仅仅“为了清晰起见”而将不必要的语法元素留在代码中。

### Unit 返回类型

如果函数返回 Unit，则应省略返回类型：

```kotlin
fun foo() { // 此处省略了 ": Unit"

}
```

### 分号

尽可能省略分号。

### 字符串模板

在将简单变量插入字符串模板时，不要使用花括号。仅对较长的表达式使用花括号：

```kotlin
println("$name has ${children.size} children")
```

作为字符串文字处理，使用[多美元符字符串插值](strings.md#multi-dollar-string-interpolation)来对待美元符号：

```kotlin
val `KClass<*>`.jsonSchema : String
    get() = $"""
        {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "$id": "https://example.com/product.schema.json",
            "$dynamicAnchor": "meta",
            "title": "${simpleName ?: qualifiedName ?: "unknown"}",
            "type": "object"
        }
        """
```

## 语言功能的惯用用法

### 不可变性

优先使用不可变数据而非可变数据。如果局部变量和属性在初始化后未被修改，请始终将其声明为 `val` 而不是 `var`。

始终使用不可变集合接口（`Collection`、`List`、`Set`、`Map`）来声明不被修改的集合。当使用工厂函数创建集合实例时，请尽可能使用返回不可变集合类型的函数：

```kotlin
// 差：对不会被修改的值使用可变集合类型
fun validateValue(actualValue: String, allowedValues: HashSet<String>) { ... }

// 好：改用不可变集合类型
fun validateValue(actualValue: String, allowedValues: Set<String>) { ... }

// 差：arrayListOf() 返回 ArrayList<T>，这是一种可变集合类型
val allowedValues = arrayListOf("a", "b", "c")

// 好：listOf() 返回 List<T>
val allowedValues = listOf("a", "b", "c")
```

### 默认参数值

优先声明带有默认参数值的函数，而不是声明重载函数。

```kotlin
// 差
fun foo() = foo("a")
fun foo(a: String) { /*...*/ }

// 好
fun foo(a: String = "a") { /*...*/ }
```

### 类型别名

如果你有一个函数式类型或带有类型参数的类型在代码库中被多次使用，请优先为其定义类型别名：

```kotlin
typealias MouseClickHandler = (Any, MouseEvent) -> Unit
typealias PersonIndex = Map<String, Person>
```
如果你为了避免名称冲突而使用私有或内部类型别名，请优先使用 [Packages and Imports](packages.md) 中提到的 `import ... as ...`。

### Lambda 参数

在简短且不嵌套的 lambda表达式中，建议使用 `it` 约定，而不是显式声明参数。在带有参数的嵌套 lambda表达式中，始终显式声明参数。

### Lambda 中的返回

避免在 lambda表达式中使用多个带标签的返回。考虑重构 lambda表达式，使其具有单一退出点。
如果这不可能或不够清晰，请考虑将 lambda表达式转换为匿名函数。

不要在 lambda表达式的最后一条语句中使用带标签的返回。

### 具名实参

当方法接受多个相同基元类型的参数时，或者对于 `Boolean` 类型的参数，请使用具名实参语法，除非所有参数的含义在上下文中绝对清晰。

```kotlin
drawSquare(x = 10, y = 10, width = 100, height = 100, fill = true)
```

### 条件语句

优先使用 `try`、`if` 和 `when` 的表达式形式。

```kotlin
return if (x) foo() else bar()
```

```kotlin
return when(x) {
    0 -> "zero"
    else -> "nonzero"
}
```

以上优于：

```kotlin
if (x)
    return foo()
else
    return bar()
```

```kotlin
when(x) {
    0 -> return "zero"
    else -> return "nonzero"
}
```

### if 对比 when

对于二元条件，优先使用 `if` 而不是 `when`。
例如，使用 `if` 语法：

```kotlin
if (x == null) ... else ...
```

而不是使用 `when` 语法：

```kotlin
when (x) {
    null -> // ...
    else -> // ...
}
```

当有三个或更多选项时，优先使用 `when`。

### when 表达式中的守卫条件

在具有[守卫条件](control-flow.md#guard-conditions-in-when-expressions)的 `when` 表达式或语句中组合多个布尔表达式时，请使用圆括号：

```kotlin
when (status) {
    is Status.Ok if (status.info.isEmpty() || status.info.id == null) -> "no information"
}
```

而不是：

```kotlin
when (status) {
    is Status.Ok if status.info.isEmpty() || status.info.id == null -> "no information"
}
```

### 条件中的可空布尔值

如果你需要在条件语句中使用可空的 `Boolean`，请使用 `if (value == true)` 或 `if (value == false)` 检查。

### 循环

优先使用高阶函数（`filter`、`map` 等）而不是循环。例外：`forEach`（除非 `forEach` 的接收者是可空的，或者 `forEach` 作为较长调用链的一部分使用，否则优先使用常规 `for` 循环）。

在包含多个高阶函数的复杂表达式和循环之间进行选择时，请了解每种情况下执行的操作成本，并牢记性能考量。

### 区间循环

使用 `..<` 运算符在开区间上进行循环：

```kotlin
for (i in 0..n - 1) { /*...*/ }  // 差
for (i in 0..<n) { /*...*/ }  // 好
```

### 字符串

优先使用字符串模板而不是字符串串联。

优先使用多行字符串，而不是在常规字符串字面量中嵌入 `
` 转义序列。

要在多行字符串中维护缩进，当结果字符串不需要任何内部缩进时使用 `trimIndent`，或者当需要内部缩进时使用 `trimMargin`：

```kotlin
fun main() {
//sampleStart
    println("""
     Not
     trimmed
     text
     """
    )

    println("""
     Trimmed
     text
     """.trimIndent()
    )

    println()

    val a = """Trimmed to margin text:
            |if(a > 1) {
            |    return a
            |}""".trimMargin()

   println(a)
//sampleEnd
}
```
{kotlin-runnable="true"}

了解 [Java 和 Kotlin 多行字符串](java-to-kotlin-idioms-strings.md#use-multiline-strings)之间的区别。

### 函数 vs 属性

在某些场景中，无参数函数可能与只读属性互换。
虽然语义相似，但在何时选择其中一个而非另一个方面，存在一些样式约定。

当底层算法满足以下条件时，优先选择属性而不是函数：

* 不会抛出异常。
* 计算开销小（或在第一次运行时缓存）。
* 如果对象状态未更改，则在多次调用中返回相同的结果。

### 扩展函数

大胆使用扩展函数。每当你有一个主要处理某个对象的函数时，请考虑将其设为接受该对象作为接收者的扩展函数。为了最大限度地减少 API 污染，请在合理的范围内限制扩展函数的可见性。根据需要，使用局部扩展函数、成员扩展函数或具有私有可见性的顶层扩展函数。

### 中缀函数

仅当函数处理两个扮演相似角色的对象时，才将函数声明为 `infix`。好的例子：`and`、`to`、`zip`。
坏的例子：`add`。

如果方法修改了接收者对象，请不要将其声明为 `infix`。

### 工厂函数

如果你为一个类声明工厂函数，请避免给它与类本身相同的名称。优先使用独特的名称，说明为什么该工厂函数的行为是特殊的。只有在确实没有特殊语义的情况下，你才可以使用与类相同的名称。

```kotlin
class Point(val x: Double, val y: Double) {
    companion object {
        fun fromPolar(angle: Double, radius: Double) = Point(...)
    }
}
```

如果你有一个具有多个重载构造对象的对象，这些构造函数不调用不同的超类构造函数，且无法简化为包含默认值参数的单个构造函数，请优先将重载构造函数替换为工厂函数。

### 平台类型

返回平台类型表达式的公共函数/方法必须显式声明其 Kotlin 类型：

```kotlin
fun apiCall(): String = MyJavaApi.getProperty("name")
```

任何使用平台类型表达式初始化的属性（软件包级或类级）必须显式声明其 Kotlin 类型：

```kotlin
class Person {
    val name: String = MyJavaApi.getProperty("name")
}
```

使用平台类型表达式初始化的局部值可以有也可以没有类型声明：

```kotlin
fun main() {
    val name = MyJavaApi.getProperty("name")
    println(name)
}
```

### 作用域函数 apply/with/run/also/let

Kotlin 提供了一组函数，用于在给定对象的上下文中执行代码块：`let`、`run`、`with`、`apply` 和 `also`。
有关为你的情况选择正确作用域函数的指导，请参阅 [Scope Functions](scope-functions.md)。

## 库的编码规范

在编写库时，建议遵循一组额外的规则以确保 API 稳定性：

 * 始终显式指定成员可见性（以避免意外地将声明暴露为公共 API）。
 * 始终显式指定函数返回类型和属性类型（以避免在实现更改时意外更改返回类型）。
 * 为所有公共成员提供 [KDoc](kotlin-doc.md) 注释，但不需要任何新文档的重写除外（以支持为库生成文档）。

在 [Library authors' guidelines](api-guidelines-introduction.md) 中了解有关编写库 API 时要考虑的最佳做法和想法的更多信息。