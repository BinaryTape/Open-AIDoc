[//]: # (title: 编码规范)

众所周知且易于遵循的编码规范对任何编程语言都至关重要。
本文为使用 Kotlin 的项目提供有关代码样式和代码组织的指导准则。

## 在 IDE 中配置代码样式 {id="configure-style-in-ide"}

最流行的两款 Kotlin IDE —— [IntelliJ IDEA](https://www.jetbrains.com/idea/) 与 [Android Studio](https://developer.android.com/studio/)
提供了对代码样式的强大支持。你可以对它们进行配置，以使其按照指定的代码样式自动格式化你的代码。
 
### 应用样式指南 {id="apply-the-style-guide"}

1. 转到 **Settings/Preferences | Editor | Code Style | Kotlin**。
2. 点击 **Set from...**。
3. 选择 **Kotlin style guide**。

### 验证代码是否遵循样式指南 {id="verify-that-your-code-follows-the-style-guide"}

1. 转到 **Settings/Preferences | Editor | Inspections | General**。
2. 开启 **Incorrect formatting** 检查。
用于验证样式指南中描述的其他问题（例如命名约定）的其他检查已默认启用。

<!-- Replace with an external link when the guide is moved -->

要了解更多信息，请参阅[使用 IntelliJ IDEA 迁移到 Kotlin 代码样式](code-style-migration-guide.md)指南。

## 源代码组织 {id="source-code-organization"}

### 目录结构 {id="directory-structure"}

在纯 Kotlin 项目中，推荐的目录结构应遵循包结构，并省略公共根包。例如，如果项目中的所有代码都位于 `org.example.kotlin` 包及其子包中，则属于 `org.example.kotlin` 包的文件应直接放置在源根目录（source root）下，而属于 `org.example.kotlin.network.socket` 的文件应放置在源根目录的 `network/socket` 子目录中。

>在 JVM 上：在 Kotlin 与 Java 混用的项目中，Kotlin 源文件应与 Java 源文件存放在同一个源根目录下，并遵循相同的目录结构：每个文件都应存储在与各 package 语句相对应的目录中。
>
{style="note"}

### 源文件名 {id="source-file-names"}

如果一个 Kotlin 文件包含单个类或接口（可能还带有相关的顶层声明），则其名称应与该类的名称相同，并附加 `.kt` 扩展名。这适用于所有类型的类与接口。
如果一个文件包含多个类，或者仅包含顶层声明，请选择一个描述该文件所含内容的名称，并相应地为文件命名。
请使用[大驼峰拼写法](https://en.wikipedia.org/wiki/Camel_case)（Upper Camel Case，每个单词的首字母大写）。
例如，`ProcessDeclarations.kt`。

文件名应描述文件中代码的作用。因此，应避免在文件名中使用无意义的词汇，如 `Util`。

#### 多平台项目 {id="multiplatform-projects"}

在多平台项目中，平台特定源集中包含顶层声明的文件应带有与源集名称关联的后缀。例如：

* **jvm**Main/kotlin/Platform.**jvm**.kt
* **android**Main/kotlin/Platform.**android**.kt
* **ios**Main/kotlin/Platform.**ios**.kt

至于公共源集（common source set），包含顶层声明的文件不应带有后缀。例如 `commonMain/kotlin/Platform.kt`。

##### 技术细节 {initial-collapse-state="collapsed" collapsible="true" id="technical-details"}

由于 JVM 的限制，我们建议在多平台项目中遵循这种文件命名方案：JVM 不允许顶层成员（函数、属性）。

为了解决这个问题，Kotlin JVM 编译器会创建包含顶层成员声明的包装类（所谓的“文件外观”，file facade）。文件外观具有根据文件名生成的内部名称。

反过来，JVM 不允许存在多个具有相同完全限定名称（FQN）的类。这可能会导致 Kotlin 项目无法编译到 JVM 的情况：

```none
root
|- commonMain/kotlin/myPackage/Platform.kt // 包含 'fun count() { }'
|- jvmMain/kotlin/myPackage/Platform.kt // 包含 'fun multiply() { }'
```

此时，两个 `Platform.kt` 文件位于同一个包中，因此 Kotlin JVM 编译器会生成两个文件外观，两者的完全限定名称均为 `myPackage.PlatformKt`。这会导致“Duplicate JVM classes”错误。

避免该错误的最简单方法是根据上述准则重命名其中一个文件。这种命名方案有助于在保留代码可读性的同时避免冲突。

> 在以下两种场景中，这些建议可能看似多余，但我们仍然建议遵循它们：
> 
> * 非 JVM 平台不存在文件外观重复的问题。但是，此命名方案有助于保持文件命名的一致性。
> * 在 JVM 上，如果源文件没有顶层声明，则不会生成文件外观，也就不会遇到命名冲突。
> 
>   然而，这种命名方案可以帮助你避免在进行简单重构或添加顶层函数时产生相同的“Duplicate JVM classes”错误。
> 
{style="tip"}

### 源文件组织 {id="source-file-organization"}

只要多个声明（类、顶层函数或属性）在语义上紧密相关，且文件大小保持在合理范围内（不超过几百行），我们鼓励将它们放置在同一个 Kotlin 源文件中。

特别是，当为某个类定义与该类的所有客户端都相关的扩展函数时，请将它们与该类本身放在同一个文件中。当定义的扩展函数仅对特定客户端有意义时，请将其放置在该客户端的代码旁边。避免仅仅为了容纳某个类的所有扩展而创建文件。

### 类布局 {id="class-layout"}

类的内容应按以下顺序排列：

1. 属性声明和初始值设定项代码块
2. 次构造函数
3. 方法声明
4. 伴生对象（companion object）

不要按字母顺序或按可见性对方法声明进行排序，也不要将普通方法与扩展方法分开。相反，应将相关内容放在一起，以便从上到下阅读类代码的人能够顺畅理解其执行逻辑。选择一种顺序（例如高层内容在前，反之亦然）并坚持使用。

将嵌套类放在使用这些类的代码旁边。如果这些类打算在外部使用且在类内部没有被引用，请将它们放在最后，紧随伴生对象之后。

### 接口实现布局 {id="interface-implementation-layout"}

实现接口时，保持实现成员的顺序与接口成员的顺序一致（如有必要，可在其中穿插用于实现的私有方法）。

### 重载布局 {id="overload-layout"}

始终在类中将重载放在一起。

## 命名规则 {id="naming-rules"}

包名与类名的命名规则在 Kotlin 中非常简单：

* 包名始终为全小写且不使用下划线（`org.example.project`）。通常不建议使用由多个单词组成的名称，但如果确实需要使用多个单词，可以直接将它们拼接在一起或使用骆驼拼写法（`org.example.myProject`）。

* 类和对象的名称使用大驼峰拼写法：

```kotlin
open class DeclarationProcessor { /*...*/ }

object EmptyDeclarationProcessor : DeclarationProcessor() { /*...*/ }
```

### 函数名 {id="function-names"}
 
函数、属性和局部变量的名称以小写字母开头，并使用不带下划线的骆驼拼写法：

```kotlin
fun processDeclarations() { /*...*/ }
var declarationCount = 1
```

### 类似类的函数名称 {id="names-for-class-like-functions"}

有两种例外情况，函数名称应遵循类的命名约定。这种函数通常定义在顶层。

* 用于创建类实例的工厂函数，其名称可以与抽象返回值类型相同：

   ```kotlin
   interface Foo { /*...*/ }

   class FooImpl : Foo { /*...*/ }

   fun Foo(): Foo { return FooImpl() }
   ```

* 返回 `Unit` 的 `@Composable` 函数：

   ```kotlin
   @Composable fun TabHeader { /*...*/ }
   ```

### 测试方法的名称 {id="names-for-test-methods"}

在测试中（且**仅**在测试中），可以使用反引号括起来包含空格的方法名。请注意，此类方法名仅从 API 级别 30 开始由 Android 运行时支持。测试代码中也允许在方法名中使用下划线。

```kotlin
class MyTestCase {
    @Test fun `ensure everything works`() { /*...*/ }

    @Test fun ensureEverythingWorks_onAndroid() { /*...*/ }
}
```

### 属性名 {id="property-names"}

常量（带有 `const` 标记的属性，或持有深层不可变数据且没有自定义 `get` 函数的顶层或对象 `val` 属性）的名称应遵循全大写、下划线分隔的命名规范（[大写下划线命名法 / screaming snake case](https://en.wikipedia.org/wiki/Snake_case)）：

```kotlin
const val MAX_COUNT = 8
val USER_NAME_FIELD = "UserName"
```

持有带行为对象或可变数据的顶层或对象属性的名称应使用骆驼拼写法：

```kotlin
val mutableCollection: MutableSet<String> = HashSet()
```

持有单例对象引用的属性名称可以使用与 `object` 声明相同的命名样式：

```kotlin
val PersonComparator: Comparator<Person> = /*...*/
```

对于枚举常量，可以使用全大写、下划线分隔的名称（[大写下划线命名法](https://en.wikipedia.org/wiki/Snake_case)）（`enum class Color { RED, GREEN }`），也可以使用大驼峰拼写法名称，具体取决于使用场景。
   
### 支持属性的名称 {id="names-for-backing-properties"}

如果一个类有两个概念上相同但在公开 API 中暴露一个、作为实现细节保留另一个的属性，请使用下划线作为私有属性名称的前缀：

```kotlin
class C {
    private val _elementList = mutableListOf<Element>()

    val elementList: List<Element>
        get() = _elementList
}
```

### 选择良好的名称 {id="choose-good-names"}

类的名称通常是名词或名词短语，用于解释该类“是什么”：`List`、`PersonReader`。

方法的名称通常是动词或动词短语，用于说明该方法“做什么”：`close`、`readPersons`。该名称还应暗示该方法是就地修改对象还是返回一个新对象。例如，`sort` 是对集合进行就地排序，而 `sorted` 则是返回该集合的已排序副本。

名称应清楚地表明实体的用途，因此最好避免在名称中使用无意义的词（`Manager`、`Wrapper`）。

当使用缩写词作为声明名称的一部分时，请遵循以下规则：

* 对于两个字母的缩写词，两个字母均使用大写。例如 `IOStream`。
* 对于超过两个字母的缩写词，仅将首字母大写。例如 `XmlFormatter` 或 `HttpInputStream`。

## 格式设置 {id="formatting"}

### 缩进 {id="indentation"}

使用四个空格进行缩进。不要使用制表符（tab）。

对于花括号，将左花括号放在结构开头的行末，并将右花括号放在单独的一行，与开始结构水平对齐。

```kotlin
if (elements != null) {
    for (element in elements) {
        // ...
    }
}
```

>在 Kotlin 中，分号是可选的，因此换行符具有重要意义。该语言的设计假定采用 Java 风格的花括号，如果你尝试使用其他格式设置样式，可能会遇到意料之外的行为。
>
{style="note"}

### 水平空格 {id="horizontal-whitespace"}

* 在二元运算符周围放置空格（`a + b`）。例外：不要在“范围到”运算符（`0..i`）周围放置空格。
* 不要在单元运算符周围放置空格（`a++`）。
* 在控制流关键字（`if`、`when`、`for` 和 `while`）与对应的左圆括号之间放置空格。
* 不要在主构造函数声明、方法声明或方法调用中的左圆括号之前放置空格。

```kotlin
class A(val x: Int)

fun foo(x: Int) { ... }

fun bar() {
    foo(1)
}
```

* 绝不要在 `(`、`[` 之后或 `]`、`)` 之前放置空格。
* 绝不要在 `.` 或 `?.` 周围放置空格：`foo.bar().filter { it > 2 }.joinToString()`、`foo?.bar()`。
* 在 `//` 之后放置空格：`// This is a comment`。
* 不要在用于指定类型形参的尖括号周围放置空格：`class Map<K, V> { ... }`。
* 不要在 `::` 周围放置空格：`Foo::class`、`String::length`。
* 不要在用于标记可空类型的 `?` 之前放置空格：`String?`。

作为一般规则，避免任何形式的水平对齐。将标识符重命名为不同长度的名称不应影响声明或任何用例的格式设置。

### 冒号 {id="colon"}

在以下场景中，在 `:` 之前放置空格：

* 用于分隔类型与超类型时。
* 委托给超类构造函数或同类的其他构造函数时。
* 在 `object` 关键字之后。
    
当 `:` 分隔声明及其类型时，不要在其前面放置空格。
 
始终在 `:` 后面放置空格。

```kotlin
abstract class Foo<out T : Any> : IFoo {
    abstract fun foo(a: Int): T
}

class FooImpl : Foo() {
    constructor(x: String) : this(x) { /*...*/ }

    val x = object : IFoo { /*...*/ } 
}
```

### 类标头 {id="class-headers"}

主构造函数形参较少的类可以写成单行：

```kotlin
class Person(id: Int, name: String)
```

标头较长的类应该进行格式设置，使每个主构造函数形参都位于单独缩进的一行中。此外，右圆括号应放在新行上。如果使用继承，超类构造函数调用或已实现的接口列表应与右圆括号位于同一行：

```kotlin
class Person(
    id: Int,
    name: String,
    surname: String
) : Human(id, name) { /*...*/ }
```

对于多个接口，超类构造函数调用应位于第一位，然后每个接口应位于不同的行中：

```kotlin
class Person(
    id: Int,
    name: String,
    surname: String
) : Human(id, name),
    KotlinMaker { /*...*/ }
```

对于具有长超类型列表的类，在冒号后换行并将所有超类型名称水平对齐：

```kotlin
class MyFavouriteVeryLongClassHolder :
    MyLongHolder<MyFavouriteVeryLongClass>(),
    SomeOtherInterface,
    AndAnotherOne {

    fun foo() { /*...*/ }
}
```

要在类标头较长时清楚地分隔类标头和类主体，可以在类标头后留出一个空行（如上例所示），或者将左花括号放在单独的一行上：

```kotlin
class MyFavouriteVeryLongClassHolder :
    MyLongHolder<MyFavouriteVeryLongClass>(),
    SomeOtherInterface,
    AndAnotherOne 
{
    fun foo() { /*...*/ }
}
```

构造函数形参使用常规缩进（四个空格）。这确保了在主构造函数中声明的属性与在类主体中声明的属性具有相同的缩进。

### 修饰符顺序 {id="modifiers-order"}

如果一个声明具有多个修饰符，请始终按以下顺序排列：

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
enum / annotation / fun // 在 `fun interface` 中作为修饰符
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

除非是在开发库，否则请省略冗余修饰符（例如 `public`）。

### 注解 {id="annotations"}

将注解放置在所依附声明之前的单独行上，并保持相同的缩进：

```kotlin
@Target(AnnotationTarget.PROPERTY)
annotation class JsonExclude
```

没有实参的注解可以放在同一行：

```kotlin
@JsonExclude @JvmField
var x: String
```

没有实参的单个注解可以与相应声明放在同一行：

```kotlin
@Test fun foo() { /*...*/ }
```

### 文件注解 {id="file-annotations"}

文件注解放置在文件注释（如果有）之后、`package` 语句之前，并用空行与 `package` 分隔（以强调它们的目标是文件而不是包）。

```kotlin
/** License, copyright and whatever */
@file:JvmName("FooBar")

package foo.bar
```

### 函数 {id="functions"}

如果函数签名无法容纳在单行中，请使用以下语法：

```kotlin
fun longMethodName(
    argument: ArgumentType = defaultValue,
    argument2: AnotherArgumentType,
): ReturnType {
    // 主体
}
```

函数形参使用常规缩进（四个空格）。这有助于确保与构造函数形参保持一致。

对于主体由单个表达式组成的函数，优先使用表达式体。

```kotlin
fun foo(): Int {     // 不推荐
    return 1 
}

fun foo() = 1        // 推荐
```

### 表达式体 {id="expression-bodies"}

如果函数的表达式体的第一行无法与声明放在同一行，请将 `=` 符号放在第一行，并将表达式体缩进四个空格。

```kotlin
fun f(x: String, y: String, z: String) =
    veryLongFunctionCallWithManyWords(andLongParametersToo(), x, y, z)
```

### 属性 {id="properties"}

对于非常简单的只读属性，请考虑单行格式设置：

```kotlin
val isEmpty: Boolean get() = size == 0
```

对于更复杂的属性，始终将 `get` 和 `set` 关键字放在单独的行上：

```kotlin
val foo: String
    get() { /*...*/ }
```

对于带有初始值设定项的属性，如果初始值设定项较长，请在 `=` 符号后换行，并将初始值设定项缩进四个空格：

```kotlin
private val defaultCharset: Charset? =
    EncodingRegistry.getInstance().getDefaultCharsetForPropertiesFiles(file)
```

### 控制流语句 {id="control-flow-statements"}

如果 `if` 或 `when` 语句的条件是多行的，请始终在该语句的主体周围使用花括号。
将条件的每个后续行相对于语句开头缩进四个空格。
将条件的右圆括号与左花括号一起放在单独的一行：

```kotlin
if (!component.isSyncing &&
    !hasAnyKotlinRuntimeInScope(module)
) {
    return createKotlinNotConfiguredPanel(module)
}
```

这有助于对齐条件与语句主体。

将 `else`、`catch`、`finally` 关键字以及 `do-while` 循环的 `while` 关键字与前面的花括号放在同一行：

```kotlin
if (condition) {
    // 主体
} else {
    // else 部分
}

try {
    // 主体
} finally {
    // 清理
}
```

在 `when` 语句中，如果分支超过一行，请考虑使用空行将其与相邻的分支块分隔开：

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

将简短的分支与条件放在同一行，不使用花括号。

```kotlin
when (foo) {
    true -> bar() // 推荐
    false -> { baz() } // 不推荐
}
```

### 方法调用 {id="method-calls"}

在长实参列表中，在左圆括号后换行。将实参缩进四个空格。将多个紧密相关的实参组合在同一行上。

```kotlin
drawSquare(
    x = 10, y = 10,
    width = 100, height = 100,
    fill = true
)
```

在分隔实参名称和实参值的 `=` 符号周围放置空格。

### 链式调用换行 {id="wrap-chained-calls"}

对链式调用进行换行时，将 `.` 字符或 `?.` 运算符放在下一行，并单层缩进：

```kotlin
val anchor = owner
    ?.firstChild!!
    .siblings(forward = true)
    .dropWhile { it is PsiComment || it is PsiWhiteSpace }
```

链中的第一个调用之前通常应该换行，但如果这样代码更具可读性，也可以将其省略。

### Lambda 表达式 {id="lambdas"}

在 lambda 表达式中，花括号周围以及用于分隔形参和主体代码的箭头周围都应使用空格。如果调用只接受单个 lambda，请尽可能将其传递在圆括号外部。

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

在多行 lambda 中声明形参名称时，将名称放在第一行，后跟箭头和换行符：

```kotlin
appendCommaSeparated(properties) { prop ->
    val propertyValue = prop.get(obj)  // ...
}
```

如果形参列表过长无法容纳在一行中，请将箭头放在单独的一行：

```kotlin
foo {
    context: Context,
    environment: Env
    ->
    context.configureEnv(environment)
}
```

### 尾随逗号 {id="trailing-commas"}

尾随逗号是一系列元素中最后一项后面的逗号符号：

```kotlin
class Person(
    val firstName: String,
    val lastName: String,
    val age: Int, // 尾随逗号
)
```

使用尾随逗号有若干好处：

* 使版本控制的差异（diff）更清晰 —— 因为所有的焦点都集中在更改的值上。
* 使添加和重新排序元素变得容易 —— 在操作元素时无需添加或删除逗号。
* 简化代码生成，例如针对对象初始值设定项。最后一个元素也可以带有逗号。

尾随逗号是完全可选的 —— 没有它们你的代码仍然可以正常工作。Kotlin 样式指南鼓励在声明处使用尾随逗号，而调用处则由你自行决定。

要在 IntelliJ IDEA 格式化程序中启用尾随逗号，请转到 **Settings/Preferences | Editor | Code Style | Kotlin**，打开 **Other** 选项卡并选择 **Use trailing comma** 选项。

#### 枚举 {initial-collapse-state="collapsed" collapsible="true" id="enumerations"}

```kotlin
enum class Direction {
    NORTH,
    SOUTH,
    WEST,
    EAST, // 尾随逗号
}
```

#### 值实参 {initial-collapse-state="collapsed" collapsible="true" id="value-arguments"}

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

#### 类属性与形参 {initial-collapse-state="collapsed" collapsible="true" id="class-properties-and-parameters"}

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

#### 函数值形参 {initial-collapse-state="collapsed" collapsible="true" id="function-value-parameters"}

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

#### 带有可选类型的形参（包括 setter） {initial-collapse-state="collapsed" collapsible="true" id="parameters-with-optional-type-including-setters"}

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

#### 索引后缀 {initial-collapse-state="collapsed" collapsible="true" id="indexing-suffix"}

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

#### Lambda 中的形参 {initial-collapse-state="collapsed" collapsible="true" id="parameters-in-lambdas"}

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

#### when 条目 {initial-collapse-state="collapsed" collapsible="true" id="when-entry"}

```kotlin
fun isReferenceApplicable(myReference: KClass<*>) = when (myReference) {
    Comparable::class,
    Iterable::class,
    String::class, // 尾随逗号
        -> true
    else -> false
}
```

#### 集合字面量（注解中） {initial-collapse-state="collapsed" collapsible="true" id="collection-literals-in-annotations"}

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

#### 类型实参 {initial-collapse-state="collapsed" collapsible="true" id="type-arguments"}

```kotlin
fun <T1, T2> foo() {}
fun main() {
    foo<
            Comparable<Number>,
            Iterable<Number>, // 尾随逗号
            >()
}
```

#### 类型形参 {initial-collapse-state="collapsed" collapsible="true" id="type-parameters"}

```kotlin
class MyMap<
        MyKey,
        MyValue, // 尾随逗号
        > {}
```

#### 析构声明 {initial-collapse-state="collapsed" collapsible="true" id="destructuring-declarations"}

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

## 文档注释 {id="documentation-comments"}

对于较长的文档注释，将开头的 `/**` 放在单独的一行，随后的每一行均以星号开头：

```kotlin
/**
 * 这是一个
 * 多行文档注释。
 */
```

简短的注释可以放在单行中：

```kotlin
/** 这是一个简短的文档注释。 */
```

通常，避免使用 `@param` 和 `@return` 标记。相反，应将形参和返回值的描述直接合并到文档注释中，并在提及形参的任何地方添加指向形参的链接。仅在需要不适合正文流程的冗长描述时，才使用 `@param` 和 `@return`。

```kotlin
// 避免这样做：

/**
 * 返回给定数字的绝对值。
 * @param number 要返回绝对值的数字。
 * @return 绝对值。
 */
fun abs(number: Int): Int { /*...*/ }

// 推荐这样做：

/**
 * 返回给定 [number] 的绝对值。
 */
fun abs(number: Int): Int { /*...*/ }
```

## 避免冗余结构 {id="avoid-redundant-constructs"}

一般来说，如果 Kotlin 中的某个语法结构是可选的，并且被 IDE 高亮显示为冗余，则应在代码中将其省略。不要仅仅“为了清晰起见”在代码中保留不必要的语法元素。

### Unit 返回值类型 {id="unit-return-type"}

如果函数返回 Unit，则应省略返回值类型：

```kotlin
fun foo() { // 此处省略了 ": Unit"

}
```

### 分号 {id="semicolons"}

尽可能省略分号。

### 字符串模板 {id="string-templates"}

将简单变量插入字符串模板时不要使用花括号。仅对较长的表达式使用花括号：

```kotlin
println("$name has ${children.size} children")
```

使用[多美元符号字符串插值](strings.md#multi-dollar-string-interpolation)将美元符号字符 `$` 视为字符串文字：

```kotlin
val KClass<*>.jsonSchema : String
    get() = $$"""
        {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "$id": "https://example.com/product.schema.json",
            "$dynamicAnchor": "meta",
            "title": "$${simpleName ?: qualifiedName ?: "unknown"}",
            "type": "object"
        }
        """
```

## 惯用语言特性的使用 {id="idiomatic-use-of-language-features"}

### 不可变性 {id="immutability"}

优先使用不可变数据而不是可变数据。如果在初始化后未对其进行修改，请始终将局部变量和属性声明为 `val` 而不是 `var`。

始终使用不可变集合接口（`Collection`、`List`、`Set`、`Map`）来声明不会被修改的集合。使用工厂函数创建集合实例时，尽可能使用返回不可变集合类型的函数：

```kotlin
// 不推荐：对于不会修改的值使用可变集合类型
fun validateValue(actualValue: String, allowedValues: HashSet<String>) { ... }

// 推荐：改用不可变集合类型
fun validateValue(actualValue: String, allowedValues: Set<String>) { ... }

// 不推荐：arrayListOf() 返回 ArrayList<T>，这是一种可变集合类型
val allowedValues = arrayListOf("a", "b", "c")

// 推荐：listOf() 返回 List<T>
val allowedValues = listOf("a", "b", "c")
```

### 默认形参值 {id="default-parameter-values"}

优先声明带有默认形参值的函数，而不是声明重载函数。

```kotlin
// 不推荐
fun foo() = foo("a")
fun foo(a: String) { /*...*/ }

// 推荐
fun foo(a: String = "a") { /*...*/ }
```

### 类型别名 {id="type-aliases"}

如果在代码库中多次使用函数类型或带有类型形参的类型，建议为其定义类型别名：

```kotlin
typealias MouseClickHandler = (Any, MouseEvent) -> Unit
typealias PersonIndex = Map<String, Person>
```
如果使用 private 或 internal 类型别名来避免名称冲突，建议使用[包和导入](packages.md)中提到的 `import ... as ...`。

### Lambda 形参 {id="lambda-parameters"}

在简短且未嵌套的 lambda 中，建议使用 `it` 约定而不是显式声明形参。在带有形参的嵌套 lambda 中，始终显式声明形参。

### Lambda 中的 return {id="returns-in-a-lambda"}

避免在 lambda 中使用多个带标签的 return。考虑重构 lambda，使其具有单个退出点。如果不可行或不够清晰，请考虑将 lambda 转换为匿名函数。

不要在 lambda 的最后一条语句中使用带标签的 return。

### 具名实参 {id="named-arguments"}

当方法接受相同基元类型的多个形参或接受 `Boolean` 类型的形参时，请使用具名实参语法，除非所有形参的含义从上下文中都已完全明确。

```kotlin
drawSquare(x = 10, y = 10, width = 100, height = 100, fill = true)
```

### 条件语句 {id="conditional-statements"}

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

上述写法优于：

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

### if 与 when 的取舍 {id="if-versus-when"}

二元条件优先使用 `if` 而不是 `when`。
例如，使用带有 `if` 的语法：

```kotlin
if (x == null) ... else ...
```

而不是带有 `when` 的这种写法：

```kotlin
when (x) {
    null -> // ...
    else -> // ...
}
```

如果有三个或更多选项，优先使用 `when`。

### when 表达式中的保护条件 {id="guard-conditions-in-when-expression"}

在带有[保护条件](control-flow.md#guard-conditions-in-when-expressions)的 `when` 表达式或语句中组合多个布尔表达式时，请使用圆括号：

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

### 条件中的可空布尔值 {id="nullable-boolean-values-in-conditions"}

如果需要在条件语句中使用可空的 `Boolean`，请使用 `if (value == true)` 或 `if (value == false)` 进行检查。

### 循环 {id="loops"}

优先使用高阶函数（`filter`、`map` 等）而不是循环。例外：`forEach`（优先使用常规 `for` 循环，除非 `forEach` 的接收者可为 null 或者 `forEach` 作为较长调用链的一部分使用）。

在选择使用多个高阶函数的复杂表达式与循环之间进行权衡时，请了解在每种情况下所执行操作的开销，并兼顾性能考量。

### 区间上的循环 {id="loops-on-ranges"}

使用 `..<` 运算符对具有开区间上限的区间进行循环：

```kotlin
for (i in 0..n - 1) { /*...*/ }  // 不推荐
for (i in 0..<n) { /*...*/ }  // 推荐
```

### 字符串 {id="strings"}

优先使用字符串模板而不是字符串串联。

优先使用多行字符串，而不是将 `\n` 转义序列嵌入到常规字符串文字中。

要在多行字符串中保持缩进，当生成的字符串不需要任何内部缩进时使用 `trimIndent`，当需要内部缩进时使用 `trimMargin`：

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

了解 [Java 和 Kotlin 多行字符串的区别](java-to-kotlin-idioms-strings.md#use-multiline-strings)。

### 函数与属性的取舍 {id="functions-vs-properties"}

在某些场景下，无参函数可能与只读属性互换使用。尽管语义相似，但在何时偏向于使用哪一个存在一些代码风格约定。

当底层算法满足以下条件时，优先使用属性而不是函数：

* 不会抛出异常。
* 计算开销低廉（或在首次运行时已缓存）。
* 在对象状态未更改的情况下，多次调用返回相同的结果。

### 扩展函数 {id="extension-functions"}

自由地使用扩展函数。每当有主要针对某个对象的函数时，考虑将其设为接受该对象作为接收者的扩展函数。为了尽量减少 API 污染，应尽可能限制扩展函数的可见性。根据需要，使用局部扩展函数、成员扩展函数或具有私有可见性的顶层扩展函数。

### 中缀函数 {id="infix-functions"}

仅当函数对扮演相似角色的两个对象进行操作时，才将其声明为 `infix`。好的示例：`and`、`to`、`zip`。不好的示例：`add`。

如果方法会修改接收者对象，请勿将其声明为 `infix`。

### 工厂函数 {id="factory-functions"}

如果为类声明工厂函数，请避免将其命名为与类本身相同的名称。建议使用不同的名称，以明确为何该工厂函数的行为是特殊的。仅当确实没有特殊语义时，才可以使用与类相同的名称。

```kotlin
class Point(val x: Double, val y: Double) {
    companion object {
        fun fromPolar(angle: Double, radius: Double) = Point(...)
    }
}
```

如果有一个包含多个重载构造函数的对象，而这些构造函数既不调用不同的超类构造函数，又无法归约为包含带默认值形参的单个构造函数，建议使用工厂函数替换这些重载构造函数。

### 平台类型 {id="platform-types"}

返回平台类型表达式的 public 函数/方法必须显式声明其 Kotlin 类型：

```kotlin
fun apiCall(): String = MyJavaApi.getProperty("name")
```

使用平台类型表达式初始化的任何属性（包级别或类级别）都必须显式声明其 Kotlin 类型：

```kotlin
class Person {
    val name: String = MyJavaApi.getProperty("name")
}
```

使用平台类型表达式初始化的局部变量可以有也可以没有类型声明：

```kotlin
fun main() {
    val name = MyJavaApi.getProperty("name")
    println(name)
}
```

### 作用域函数 apply/with/run/also/let {id="scope-functions-apply-with-run-also-let"}

Kotlin 提供了一组在给定对象上下文中执行代码块的函数：`let`、`run`、`with`、`apply` 和 `also`。有关针对具体情况选择合适作用域函数的指导，请参阅[作用域函数](scope-functions.md)。

## 针对库的编码规范 {id="coding-conventions-for-libraries"}

编写库时，建议遵循一组额外的规则以确保 API 稳定性：

 * 始终显式指定成员可见性（以避免意外将声明暴露为公开 API）。
 * 始终显式指定函数返回值类型和属性类型（以避免在实现发生更改时意外更改返回值类型）。
 * 为所有公开成员提供 [KDoc](kotlin-doc.md) 注释，不需要任何新文档的重写方法除外（以支持为库生成文档）。

要详细了解在为库编写 API 时要考虑的最佳做法与思路，请参阅[库作者指南](api-guidelines-introduction.md)。