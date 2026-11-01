[//]: # (title: 泛型：in、out、where)

与 Java 一样，Kotlin 中的类可以拥有类型形参：

```kotlin
class Box<T>(t: T) {
    var value = t
}
```

要创建此类的一个实例，只需提供类型实参：

```kotlin
val box: Box<Int> = Box<Int>(1)
```

如果编译器可以推断出类型实参（例如从构造函数实参推断），则无需显式指定它们：

```kotlin
val box = Box(1) // 1 的类型为 Int，因此编译器可以推断出它是 Box<Int>
```

## 差异 {id="variance"}

Java 类型系统中最棘手的方面之一就是通配符类型（参见 [Java Generics FAQ](http://www.angelikalanger.com/GenericsFAQ/JavaGenericsFAQ.html)）。
Kotlin 中没有通配符类型。作为替代，Kotlin 提供了声明处差异（declaration-site variance）与类型投影。

### Java 中的差异与通配符 {id="variance-and-wildcards-in-java"}

我们来思考一下为什么 Java 需要这些神秘的通配符。首先，Java 中的泛型类型是_不型变_（invariant）的，
这意味着 `List<String>` _不是_ `List<Object>` 的子类型。如果 `List` 不是_不型变_的，它并不会比
Java 的数组好到哪里去，因为以下代码可以通过编译，但在运行时会引发异常：

```java
// Java
List<String> strs = new ArrayList<String>();

// Java 会在编译时报告类型不匹配。
List<Object> objs = strs;

// 如果没有报错会怎样？
// 我们就可以将一个 Integer 放入 String 列表中。
objs.add(1);

// 然后在运行时，Java 会抛出
// ClassCastException: Integer cannot be cast to String
String s = strs.get(0); 
```

Java 禁止此类操作以确保运行时安全。但这会带来一些影响。例如，
考虑 `Collection` 接口中的 `addAll()` 方法。该方法的签名是什么？凭直觉，
你会这样写：

```java
// Java
interface Collection<E> ... {
    void addAll(Collection<E> items);
}
```

但这样一来，你将无法执行以下操作（而这原本是完全安全的操作）：

```java
// Java

// 使用朴素的 addAll 声明时，以下代码将无法编译：
// Collection<String> 不是 Collection<Object> 的子类型
void copyAll(Collection<Object> to, Collection<String> from) {
    to.addAll(from);
}
```

这就是为什么 `addAll()` 的实际签名是这样的：

```java
// Java
interface Collection<E> ... {
    void addAll(Collection<? extends E> items);
}
```

_通配符类型实参_ `? extends E` 表示该方法接受由 `E` _或 `E` 的子类型_构成的对象集合，
而不仅仅是 `E` 本身。这意味着你可以安全地从条目中_读取_ `E`
（该集合的元素是 E 的子类的实例），但_不能写入_
它，因为你不知道符合该未知 `E` 子类型的具体对象是什么。
换取这种限制的代价是，你获得了期望的行为：`Collection<String>` _是_ `Collection<? extends Object>` 的子类型。
换言之，带有 _extends_ 边界（_上_界）的通配符使该类型变为_协变_（covariant）。

理解其工作原理的关键相当简单：如果你只能从集合中_获取_元素，
那么使用 `String` 集合并从中读取 `Object` 是完全没有问题的。反之，如果你只能将元素_放入_
集合中，那么取一个 `Object` 集合并将 `String` 放入其中也是完全可行的：在 Java 中有
`List<? super String>`，它接受 `String` 或其任何超类型。

后者被称为_逆变_（contravariance），对于 `List<? super String>`，你只能调用以 `String` 作为实参的方法
（例如，你可以调用 `add(String)` 或 `set(int, String)`）。如果在 `List<T>` 中调用返回 `T` 的方法，
你得到的不是 `String`，而是一个 `Object`。

Joshua Bloch 在其著作《[Effective Java（第 3 版）](http://www.oracle.com/technetwork/java/effectivejava-136174.html)》中对该问题进行了精彩的解释
（第 31 条：“利用有限制通配符来提升 API 的灵活性”）。他将只能_从中读取_的对象称为_生产者_（Producer），
将只能_向其写入_的对象称为_消费者_（Consumer）。他建议：

>“为了获得最大的灵活性，应在表示生产者或消费者的输入参数上使用通配符类型。”

接着，他提出了以下记忆口诀：_PECS_ 代表 _Producer-Extends, Consumer-Super_。

> 如果你使用一个生产者对象，例如 `List<? extends Foo>`，你将不被允许在该对象上调用 `add()` 或 `set()`，
> 但这并不意味着它是_不可变_的：例如，没有任何东西能阻止你调用 `clear()`
> 来从列表中移除所有元素，因为 `clear()` 根本不接受任何参数。
>
> 通配符（或其他类型的差异）唯一保证的是_类型安全_。不可变性则是完全不同的另一回事。
>
{style="note"}

### 声明处差异 {id="declaration-site-variance"}

假设有一个泛型接口 `Source<T>`，它没有任何以 `T` 作为参数的方法，只有返回 `T` 的方法：

```java
// Java
interface Source<T> {
    T nextT();
}
```

那么，在 `Source<Object>` 类型的变量中存储对 `Source<String>` 实例的引用是完全安全的——因为根本没有消费者方法可供调用。但 Java 并不知道这一点，并且仍然禁止这样做：

```java
// Java
void demo(Source<String> strs) {
    Source<Object> objects = strs; // !!! 在 Java 中不允许
    // ...
}
```

为了解决这个问题，你必须声明 `Source<? extends Object>` 类型的对象。这样做是没有意义的，
因为你在这样的变量上能够调用的方法与之前完全相同，更复杂的类型并没有带来任何附加价值。
但编译器并不知道这一点。

在 Kotlin 中，有一种向编译器解释这类事情的方法。这被称为_声明处差异_（declaration-site variance）：
你可以注解 `Source` 的_类型形参_ `T`，以确保它仅从 `Source<T>` 的成员中_返回_（生产），
而绝不会被消费。
为此，请使用 `out` 修饰符：

```kotlin
interface Source<out T> {
    fun nextT(): T
}

fun demo(strs: Source<String>) {
    val objects: Source<Any> = strs // 没问题，因为 T 是一个 out 形参
    // ...
}
```

一般规则是：当类 `C` 的类型形参 `T` 被声明为 `out` 时，它只能出现在 `C` 成员的 _out_ 位置，
但作为回报，`C<Base>` 可以安全地作为 `C<Derived>` 的超类型。

换句话说，你可以说类 `C` 在形参 `T` 上是_协变_的，或者说 `T` 是一个_协变_类型形参。
你可以将 `C` 视为 `T` 的_生产者_，而不是 `T` 的_消费者_。

`out` 修饰符被称为_差异注解_，由于它是在类型形参声明处提供的，
因此它提供了_声明处差异_。
这与 Java 的_使用处差异_（use-site variance）形成了对比，在 Java 中，是类型使用处的通配符使类型变得协变。

除了 `out` 之外，Kotlin 还提供了互补的差异注解：`in`。它使类型形参变得_逆变_（contravariant），这意味着
它只能被消费，而绝不能被生产。逆变类型的一个典型示例是 `Comparable`：

```kotlin
interface Comparable<in T> {
    operator fun compareTo(other: T): Int
}

fun demo(x: Comparable<Number>) {
    x.compareTo(1.0) // 1.0 的类型为 Double，它是 Number 的子类型
    // 因此，你可以将 x 赋值给 Comparable<Double> 类型的变量
    val y: Comparable<Double> = x // 没问题！
}
```

_in_ 和 _out_ 这两个词似乎是不言自明的（因为它们已经在 C# 中成功使用了相当长的时间），
因此上面提到的记忆口诀其实并不需要。实际上可以在更高的抽象层次上重新表述它：

**[存在主义](https://en.wikipedia.org/wiki/Existentialism)转换：Consumer in, Producer out!** :-)

## 类型投影 {id="type-projections"}

### 使用处差异：类型投影 {id="use-site-variance-type-projections"}

将类型形参 `T` 声明为 `out` 从而避免使用处的子类型化问题非常容易，
但某些类在实际上_无法_被限制为仅返回 `T`！
`Array` 就是一个极佳的例子：

```kotlin
class Array<T>(val size: Int) {
    operator fun get(index: Int): T { ... }
    operator fun set(index: Int, value: T) { ... }
}
```

该类在 `T` 上既不能是协变的，也不能是逆变的。这会带来某些不灵活性。考虑以下函数：

```kotlin
fun copy(from: Array<Any>, to: Array<Any>) {
    assert(from.size == to.size)
    for (i in from.indices)
        to[i] = from[i]
}
```

该函数本应将元素从一个数组复制到另一个数组。让我们尝试在实践中应用它：

```kotlin
val ints: Array<Int> = arrayOf(1, 2, 3)
val any = Array<Any>(3) { "" } 
copy(ints, any)
//   ^ 类型为 Array<Int>，但预期为 Array<Any>
```

在这里你遇到了熟悉的相同问题：`Array<T>` 在 `T` 上是_不型变_的，因此 `Array<Int>` 和 `Array<Any>`
都不是对方的子类型。为什么不是？同样，这是因为 `copy` 可能会有非预期的行为，例如，它可能尝试
向 `from` 中写入一个 `String`，而如果你实际上传入了一个 `Int` 数组，稍后就会抛出 `ClassCastException`。

为了禁止 `copy` 函数向 `from` _写入_，你可以执行以下操作：

```kotlin
fun copy(from: Array<out Any>, to: Array<Any>) { ... }
```

这就是_类型投影_，这意味着 `from` 不是一个单纯的数组，而是一个受限制的（_受投影的_）数组。
你只能调用返回类型形参 `T` 的方法，在当前情况下，这意味着你只能调用 `get()`。
这是我们实现_使用处差异_的方法，它对应于 Java 的 `Array<? extends Object>`，但更加简洁。

你也可以使用 `in` 来投影一个类型：

```kotlin
fun fill(dest: Array<in String>, value: String) { ... }
```

`Array<in String>` 对应于 Java 的 `Array<? super String>`。这意味着你可以将 `String`、`CharSequence`
或 `Object` 的数组传递给 `fill()` 函数。

### 星号投影 {id="star-projections"}

有时你可能想表明自己对类型实参一无所知，但仍希望以安全的方式使用它。
这里的安全方式是为该泛型类型定义一个投影，使该泛型类型的每个具体实例化都是该投影的子类型。

为此，Kotlin 提供了所谓的_星号投影_（star-projection）语法：

- 对于 `Foo<out T : TUpper>`，其中 `T` 是具有上界 `TUpper` 的协变类型形参，`Foo<*>` 等价于
  `Foo<out TUpper>`。这意味着当 `T` 未知时，你可以安全地从 `Foo<*>` _读取_ `TUpper` 的值。
- 对于 `Foo<in T>`，其中 `T` 是逆变类型形参，`Foo<*>` 等价于 `Foo<in Nothing>`。这意味着
  当 `T` 未知时，你无法以安全的方式向 `Foo<*>` _写入_任何内容。
- 对于 `Foo<T : TUpper>`，其中 `T` 是具有上界 `TUpper` 的不型变类型形参，读取值时 `Foo<*>` 等价于
  `Foo<out TUpper>`，写入值时等价于 `Foo<in Nothing>`。

如果泛型类型具有多个类型形参，则每个类型形参都可以单独投影。
例如，如果类型声明为 `interface Function<in T, out U>`，你可以使用以下星号投影：

* `Function<*, String>` 表示 `Function<in Nothing, String>`。
* `Function<Int, *>` 表示 `Function<Int, out Any?>`。
* `Function<*, *>` 表示 `Function<in Nothing, out Any?>`。

> 星号投影非常类似于 Java 的原始类型（raw types），但更加安全。
>
{style="note"}

### 捕获类型 {id="captured-types"}

当你使用诸如 `out T` 或 `in T` 的类型投影时，编译器内部会将未知的具体类型表示为[*捕获类型*](https://kotlinlang.org/spec/type-system.html#type-capturing)（captured type）。捕获类型是具有已知上界和下界的未知类型。

捕获类型是不可指称的（non-denotable），因此你无法在 Kotlin 代码中直接编写它们。相反，你最常在编译器诊断信息中看到捕获类型，例如 `CapturedType(out X)`。例如，以下类型不匹配诊断就包含了一个捕获类型：

```kotlin
val array: Array<out CharSequence> = arrayOf("str")
val item: Int = array.get(0)
// Initializer type mismatch: expected 'Int', actual 'CapturedType(out CharSequence)'
```

编译器使用捕获类型的上界进行读取操作，并使用其下界来确定哪些值对于写入操作是类型安全的：

```kotlin
// 投影类型为 Array<out CharSequence>
val array: Array<out CharSequence> = arrayOf("Kotlin")

// get() 读取操作使用捕获类型的上界 CharSequence
val item = array.get(0)

// set() 写入操作使用捕获类型的下界 Nothing，
// 这将导致错误
array.set(0, "New value")
// Receiver type 'Array<out CharSequence>' contains out projection
// which prohibits the use of 'fun set(index: Int, value: T): Unit'
```

在此示例中：

* 变量 `array` 的投影类型为 `Array<out CharSequence>`。编译器将投影类型实参 `out CharSequence` 表示为以 `CharSequence` 为上界、以 `Nothing` 为下界的捕获类型。
* 对于 `get()` 操作，编译器将捕获类型近似为其上界 `CharSequence`，并将 `item` 的类型推断为 `CharSequence`。
* 对于 `set()` 操作，捕获类型的下界为 `Nothing`。由于 `Nothing` 不存在任何实例，向投影类型写入值不是类型安全的，从而导致错误。

## 泛型函数 {id="generic-functions"}

不仅类可以声明类型形参，函数也可以。类型形参放置在函数名称_之前_：

```kotlin
fun <T> singletonList(item: T): List<T> {
    // ...
}

fun <T> T.basicToString(): String { // 扩展函数
    // ...
}
```

要调用泛型函数，请在调用站点上的函数名称_之后_指定类型实参：

```kotlin
val l = singletonList<Int>(1)
```

如果可以从上下文中推断出类型实参，则可以将其省略，因此以下示例同样有效：

```kotlin
val l = singletonList(1)
```

## 泛型约束 {id="generic-constraints"}

可以替换给定类型形参的所有可能类型的集合，可以通过_泛型约束_进行限制。

### 上界 {id="upper-bounds"}

最常见的约束类型是_上界_，对应于 Java 的 `extends` 关键字：

```kotlin
fun <T : Comparable<T>> sort(list: List<T>) {  ... }
```

冒号后面指定的类型即为_上界_，表示只有 `Comparable<T>` 的子类型才可以替换 `T`。例如：

```kotlin
sort(listOf(1, 2, 3)) // 正确。Int 是 Comparable<Int> 的子类型
sort(listOf(HashMap<Int, String>())) // 错误：HashMap<Int, String> 不是 Comparable<HashMap<Int, String>> 的子类型
```

默认的上界（如果未指定）是 `Any?`。在尖括号内只能指定一个上界。
如果同一个类型形参需要多个上界，则需要一个单独的 _where_ 子句：

```kotlin
fun <T> copyWhenGreater(list: List<T>, threshold: T): List<String>
    where T : CharSequence,
          T : Comparable<T> {
    return list.filter { it > threshold }.map { it.toString() }
}
```

传入的类型必须同时满足 `where` 子句的所有条件。在上述示例中，`T` 类型必须_同时_实现 `CharSequence` 和 `Comparable`。

## 绝对不可空类型 {id="definitely-non-nullable-types"}

为了使与 Java 泛型类和接口的互操作更加容易，Kotlin 支持将泛型类型形参声明为**绝对不可空**（definitely non-nullable）。

要将泛型类型 `T` 声明为绝对不可空，请使用 `& Any` 声明该类型。例如：`T & Any`。

绝对不可空类型必须具有可空的[上界](#upper-bounds)。

声明绝对不可空类型最常见的用例是当你想要重写包含 `@NotNull` 作为实参的 Java 方法时。例如，考虑 `load()` 方法：

```java
import org.jetbrains.annotations.*;

public interface Game<T> {
    public T save(T x) {}
    @NotNull
    public T load(@NotNull T x) {}
}
```

要在 Kotlin 中成功重写 `load()` 方法，需要将 `T1` 声明为绝对不可空：

```kotlin
interface ArcadeGame<T1> : Game<T1> {
    override fun save(x: T1): T1
    // T1 是绝对不可空的
    override fun load(x: T1 & Any): T1 & Any
}
```

当仅使用 Kotlin 开发时，通常不需要显式声明绝对不可空类型，因为 Kotlin 的类型推断会为你处理好这些。

## 类型擦除 {id="type-erasure"}

Kotlin 对泛型声明用法执行的类型安全检查是在编译时完成的。
在运行时，泛型类型的实例不保留关于其实际类型实参的任何信息。
这种类型信息被称为被_擦除_。例如，`Foo<Bar>` 和 `Foo<Baz?>` 的实例都会被擦除为仅剩 `Foo<*>`。

### 泛型类型检查与转换 {id="generics-type-checks-and-casts"}

由于类型擦除的存在，在运行时没有通用的方法来检查泛型类型的实例是否是使用特定的类型实参创建的，并且编译器会禁止此类 `is` 检查，例如
`ints is List<Int>` 或 `list is T`（类型形参）。但是，你可以针对星号投影类型检查实例：

```kotlin
if (something is List<*>) {
    something.forEach { println(it) } // 元素的类型为 `Any?`
}
```

同样，当你已经在静态阶段（编译时）检查了实例的类型实参时，
你可以执行涉及该类型非泛型部分的 `is` 检查或类型转换。请注意，
在这种情况下，尖括号会被省略：

```kotlin
fun handleStrings(list: MutableList<String>) {
    if (list is ArrayList) {
        // `list` 智能转换为 `ArrayList<String>`
    }
}
```

相同的省略类型实参的语法也可用于不考虑类型实参的类型转换：`list as ArrayList`。

泛型函数调用的类型实参也仅在编译时进行检查。在函数体内部，
类型形参不能用于类型检查，并且针对类型形参的类型转换（`foo as T`）是未受检的。
唯一的例外是带有[具体化类型形参](inline-functions.md#reified-type-parameters)的内联函数，
它们会在每个调用站点内联其实际类型实参。这使得可以对类型形参进行类型检查和类型转换。
但是，上述限制仍然适用于在检查或转换内部使用的泛型类型的实例。
例如，在类型检查 `arg is T` 中，如果 `arg` 本身就是一个泛型类型的实例，它的类型实参仍然会被擦除。

```kotlin
//sampleStart
inline fun <reified A, reified B> Pair<*, *>.asPairOf(): Pair<A, B>? {
    if (first !is A || second !is B) return null
    return first as A to second as B
}

val somePair: Pair<Any?, Any?> = "items" to listOf(1, 2, 3)

val stringToSomething = somePair.asPairOf<String, Any>()
val stringToInt = somePair.asPairOf<String, Int>()
val stringToList = somePair.asPairOf<String, List<*>>()
val stringToStringList = somePair.asPairOf<String, List<String>>() // 可通过编译但破坏了类型安全！
// 展开示例以获取更多详细信息

//sampleEnd

fun main() {
    println("stringToSomething = " + stringToSomething)
    println("stringToInt = " + stringToInt)
    println("stringToList = " + stringToList)
    println("stringToStringList = " + stringToStringList)
    //println(stringToStringList?.second?.forEach() {it.length}) // 这将抛出 ClassCastException，因为列表项不是 String
}
```
{kotlin-runnable="true"}

### 未受检转换 {id="unchecked-casts"}

针对具有具体类型实参的泛型类型的类型转换，例如 `foo as List<String>`，无法在运行时进行检查。  
当高级程序逻辑蕴含了类型安全，但无法被编译器直接推断时，
可以使用这些未受检转换。请参见下面的示例。

```kotlin
fun readDictionary(file: File): Map<String, *> = file.inputStream().use { 
    TODO("Read a mapping of strings to arbitrary elements.")
}

// 我们将包含 `Int` 的 Map 保存到了该文件中
val intsFile = File("ints.dictionary")

// 警告：Unchecked cast: `Map<String, *>` to `Map<String, Int>`
val intsDictionary: Map<String, Int> = readDictionary(intsFile) as Map<String, Int>
```
最后一行中的转换会出现警告。编译器无法在运行时对其进行完全检查，并且
不能保证 Map 中的值均为 `Int`。

为了避免未受检转换，你可以重新设计程序结构。在上述示例中，你可以使用
`DictionaryReader<T>` 和 `DictionaryWriter<T>` 接口，为不同的类型提供类型安全的实现。
你可以引入合理的抽象，将未受检转换从调用站点转移到实现细节中。
正确使用[泛型差异](#variance)也会有所帮助。

对于泛型函数，使用[具体化类型形参](inline-functions.md#reified-type-parameters)可以使类似 `arg as T` 的转换成为受检转换，
除非 `arg` 的类型拥有*其自身*被擦除的类型实参。

可以通过使用 `@Suppress("UNCHECKED_CAST")` [注解](annotations.md)该语句或
发生转换的声明来抑制未受检转换警告：

```kotlin
inline fun <reified T> List<*>.asListOfType(): List<T>? =
    if (all { it is T })
        @Suppress("UNCHECKED_CAST")
        this as List<T> else
        null
```

>**在 JVM 上**：[数组类型](arrays.md)（`Array<Foo>`）会保留有关其元素被擦除类型的信息，并且针对数组类型的类型转换是部分受检的：
>元素类型的为 null 性和实际类型实参仍然会被擦除。例如，
>如果 `foo` 是一个容纳任意 `List<*>` 的数组，无论其是否可空，转换 `foo as Array<List<String>?>` 都会成功。
>
{style="note"}

## 用于类型实参的下划线运算符 {id="underscore-operator-for-type-arguments"}

下划线运算符 `_` 可用于类型实参。当其他类型已被显式指定时，可以使用它来自动推断该实参的类型：

```kotlin
abstract class SomeClass<T> {
    abstract fun execute() : T
}

class SomeImplementation : SomeClass<String>() {
    override fun execute(): String = "Test"
}

class OtherImplementation : SomeClass<Int>() {
    override fun execute(): Int = 42
}

object Runner {
    inline fun <reified S: SomeClass<T>, T> run() : T {
        return S::class.java.getDeclaredConstructor().newInstance().execute()
    }
}

fun main() {
    // T 被推断为 String，因为 SomeImplementation 派生自 SomeClass<String>
    val s = Runner.run<SomeImplementation, _>()
    assert(s == "Test")

    // T 被推断为 Int，因为 OtherImplementation 派生自 SomeClass<Int>
    val n = Runner.run<OtherImplementation, _>()
    assert(n == 42)
}
```