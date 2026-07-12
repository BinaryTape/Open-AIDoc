[//]: # (title: 泛型：in、out、where)

Kotlin 中的类可以包含类型形参，就像在 Java 中一样：

```kotlin
class Box<T>(t: T) {
    var value = t
}
```

要创建此类的一个实例，只需提供类型实参：

```kotlin
val box: Box<Int> = Box<Int>(1)
```

如果编译器可以推断出类型实参（例如从构造函数实参中推断），则无需显式指定它们：

```kotlin
val box = Box(1) // 1 的类型为 Int，因此编译器可以推断出它是 Box<Int>
```

## 差异

Java 类型系统中最为棘手的方面之一是通配符类型（请参阅 [Java 泛型常见问题解答](http://www.angelikalanger.com/GenericsFAQ/JavaGenericsFAQ.html)）。
Kotlin 中没有这些。相反，Kotlin 拥有声明点差异和类型投影。

### Java 中的差异与通配符

让我们思考一下为什么 Java 需要这些神秘的通配符。首先，Java 中的泛型类型是*不变的*，
这意味着 `List<String>` *不是* `List<Object>` 的子类型。如果 `List` 不是*不变的*，它
就和 Java 的数组没什么两样，因为以下代码虽然能够编译，但会在运行时产生异常：

```java
// Java
List<String> strs = new ArrayList<String>();

// Java 在编译时会在此处报告类型不匹配。
List<Object> objs = strs;

// 如果它不报错会发生什么？
// 我们就能够将一个 Integer 放入一个 String 列表中。
objs.add(1);

// 然后在运行时，Java 会抛出
// ClassCastException：Integer 无法转换为 String
String s = strs.get(0); 
```

Java 禁止此类操作以保证运行时安全性。但这也有一些影响。例如，
考虑 `Collection` 接口中的 `addAll()` 方法。这个方法的签名是什么？直觉上，
你会这样写：

```java
// Java
interface Collection<E> ... {
    void addAll(Collection<E> items);
}
```

但是，你就无法进行以下操作（这原本是完全安全的）：

```java
// Java

// 使用朴素的 addAll 声明，以下代码将无法编译：
// Collection<String> 不是 Collection<Object> 的子类型
void copyAll(Collection<Object> to, Collection<String> from) {
    to.addAll(from);
}
```

这就是为什么 `addAll()` 的实际签名如下：

```java
// Java
interface Collection<E> ... {
    void addAll(Collection<? extends E> items);
}
```

*通配符类型实参* `? extends E` 表示此方法接受 `E` 对象*或* `E` 的*子类型*组成的集合，而不只是 `E` 本身。这意味着你可以安全地从 items 中*读取* `E`（该集合的元素是 E 的子类的实例），但*不能向其写入*，
因为你不知道哪些对象符合 `E` 的那个未知子类型。
作为这种限制的回报，你得到了想要的行为：`Collection<String>` *是* `Collection<? extends Object>` 的子类型。
换句话说，带有 *extends*-限定（*上*界）的通配符使类型变为*协变的*。

理解其运作原理的关键相当简单：如果你只能从集合中*取出*项，
那么使用 `String` 集合并从中读取 `Object` 是没问题的。反之，如果你只能向集合中*放入*项，
那么取一个 `Object` 集合并向其中放入 `String` 也是可以的：在 Java 中有
`List<? super String>`，它接受 `String` 或其任何超类型。

后者被称为*逆变*，对于 `List<? super String>`，你只能调用以 `String` 作为实参的方法
（例如，你可以调用 `add(String)` 或 `set(int, String)`）。如果你调用 `List<T>` 中返回 `T` 的内容，
你得到的不是 `String`，而是一个 `Object`。

Joshua Bloch 在他的《[Effective Java, 3rd Edition](http://www.oracle.com/technetwork/java/effectivejava-136174.html)》一书中很好地解释了这个问题
（第 31 条：“利用有限制通配符来提升 API 的灵活性”）。他将你只能*从中读取*的对象称为*生产者*（Producers），
将你只能*向其写入*的对象称为*消费者*（Consumers）。他建议：

>“为了获得最大的灵活性，在代表生产者或消费者的输入形参上使用通配符类型。”

随后他提出了以下助记符：*PECS* 代表 *Producer-Extends, Consumer-Super*（生产者使用 extends，消费者使用 super）。

> 如果你使用一个生产者对象，比如 `List<? extends Foo>`，你不被允许在此对象上调用 `add()` 或 `set()`，
> 但这并不意味着它是*不可变的*：例如，没有什么能阻止你调用 `clear()`
> 来从列表中移除所有项，因为 `clear()` 根本不带任何形参。
>
> 通配符（或其他类型的差异）唯一保证的是*类型安全*。不可变性完全是另一回事。
>
{style="note"}

### 声明点差异

假设有一个泛型接口 `Source<T>`，它没有任何以 `T` 作为形参的方法，只有返回 `T` 的方法：

```java
// Java
interface Source<T> {
    T nextT();
}
```

那么，将 `Source<String>` 实例的引用存储在 `Source<Object>` 类型的变量中是完全安全的 - 
因为没有消费者方法可以调用。但 Java 并不知道这一点，仍然禁止这样做：

```java
// Java
void demo(Source<String> strs) {
    Source<Object> objects = strs; // !!! Java 中不允许
    // ...
}
```

为了修复这个问题，你应该声明 `Source<? extends Object>` 类型的对象。这样做毫无意义，
因为你可以在此类变量上调用与以前完全相同的所有方法，所以更复杂的类型并没有增加价值。
但编译器并不知情。

在 Kotlin 中，有一种方法可以向编译器解释这类事情。这被称为*声明点差异*：
你可以注解 `Source` 的*类型形参* `T`，以确保它只从 `Source<T>` 的成员中*返回*（产出），
而绝不被消费。
为此，请使用 `out` 修饰符：

```kotlin
interface Source<out T> {
    fun nextT(): T
}

fun demo(strs: Source<String>) {
    val objects: Source<Any> = strs // 这是可以的，因为 T 是一个 out-形参
    // ...
}
```

一般规则是：当类 `C` 的类型形参 `T` 被声明为 `out` 时，它只能出现在 `C` 成员中的 *out*-位置，
但作为回报，`C<Base>` 可以安全地作为 `C<Derived>` 的超类型。

换句话说，你可以说类 `C` 在形参 `T` 上是*协变的*，或者说 `T` 是一个*协变*类型形参。
你可以将 `C` 视为 `T` 的*生产者*，而不是 `T` 的*消费者*。

`out` 修饰符被称为*差异注解*，由于它是在类型形参声明点提供的，
因此它提供了*声明点差异*。
这与 Java 的*使用点差异*相反，在 Java 中，类型使用处的通配符使类型变为协变。

除了 `out`，Kotlin 还提供了一个互补的差异注解：`in`。它使类型形参变为*逆变的*，这意味着
它只能被消费而绝不能被产出。逆变类型的一个很好的例子是 `Comparable`：

```kotlin
interface Comparable<in T> {
    operator fun compareTo(other: T): Int
}

fun demo(x: Comparable<Number>) {
    x.compareTo(1.0) // 1.0 的类型为 Double，它是 Number 的子类型
    // 因此，你可以将 x 赋值给 Comparable<Double> 类型的变量
    val y: Comparable<Double> = x // 成功！
}
```

`in` 和 `out` 这两个词似乎是不言自明的（因为它们已经在 C# 中成功使用了一段时间），
因此上述助记符并不是真正需要的。实际上它可以在更高抽象层面上重新表述：

**[存在主义](https://en.wikipedia.org/wiki/Existentialism) 转型：消费者 in，生产者 out！** :-)

## 类型投影

### 使用点差异：类型投影

将类型形参 `T` 声明为 `out` 并在使用点避免子类型化带来的麻烦非常容易，
但有些类实际上*不能*被限制为仅返回 `T`！
`Array` 就是一个很好的例子：

```kotlin
class Array<T>(val size: Int) {
    operator fun get(index: Int): T { ... }
    operator fun set(index: Int, value: T) { ... }
}
```

该类在 `T` 上既不能是协变的也不能是逆变的。这带来了一些灵活性上的限制。考虑以下函数：

```kotlin
fun copy(from: Array<Any>, to: Array<Any>) {
    assert(from.size == to.size)
    for (i in from.indices)
        to[i] = from[i]
}
```

该函数旨在将项从一个数组复制到另一个数组。让我们尝试在实践中应用它：

```kotlin
val ints: Array<Int> = arrayOf(1, 2, 3)
val any = Array<Any>(3) { "" } 
copy(ints, any)
//   ^ 类型为 Array<Int> 但预期为 Array<Any>
```

在这里你遇到了同样熟悉的问题：`Array<T>` 在 `T` 上是*不变的*，因此 `Array<Int>` 和 `Array<Any>`
都不是对方的子类型。为什么不呢？再次强调，这是因为 `copy` 可能会有非预期的行为，例如，它可能尝试向 `from`
写入一个 `String`，而如果你实际上传递的是一个 `Int` 数组，之后就会抛出 `ClassCastException`。

为了禁止 `copy` 函数向 `from` *写入*，你可以执行以下操作：

```kotlin
fun copy(from: Array<out Any>, to: Array<Any>) { ... }
```

这就是*类型投影*，这意味着 `from` 不是一个简单的数组，而是一个受限的（*投影的*）数组。
你只能调用返回类型形参 `T` 的方法，在这种情况下意味着你只能调用 `get()`。
这就是我们的*使用点差异*方法，它对应于 Java 的 `Array<? extends Object>`，但稍微简单一些。

你也可以使用 `in` 来投影一个类型：

```kotlin
fun fill(dest: Array<in String>, value: String) { ... }
```

`Array<in String>` 对应于 Java 的 `Array<? super String>`。这意味着你可以向 `fill()` 函数传递
`String` 数组、`CharSequence` 数组或 `Object` 数组。

### 星号投影

有时你想要表示你对类型实参一无所知，但仍希望以安全的方式使用它。
这里的安全方式是为泛型类型定义这样一种投影，即该泛型类型的每个具体实例化都将是该投影的子类型。

Kotlin 为此提供了所谓的*星号投影*语法：

- 对于 `Foo<out T : TUpper>`（其中 `T` 是具有上界 `TUpper` 的协变类型形参），`Foo<*>` 
  等同于 `Foo<out TUpper>`。这意味着当 `T` 未知时，你可以安全地从 `Foo<*>` 中*读取* `TUpper` 类型的值。
- 对于 `Foo<in T>`（其中 `T` 是逆变类型形参），`Foo<*>` 等同于 `Foo<in Nothing>`。这意味着
  当 `T` 未知时，没有什么可以安全地*写入* `Foo<*>`。
- 对于 `Foo<T : TUpper>`（其中 `T` 是具有上界 `TUpper` 的不变类型形参），`Foo<*>` 在读取值时等同于
  `Foo<out TUpper>`，在写入值时等同于 `Foo<in Nothing>`。

如果一个泛型类型有多个类型形参，每个形参都可以独立进行投影。
例如，如果类型声明为 `interface Function<in T, out U>`，你可以使用以下星号投影：

* `Function<*, String>` 表示 `Function<in Nothing, String>`。
* `Function<Int, *>` 表示 `Function<Int, out Any?>`。
* `Function<*, *>` 表示 `Function<in Nothing, out Any?>`。

> 星号投影非常类似于 Java 的原生类型，但是是安全的。
>
{style="note"}

### 捕获类型

当你使用类型投影（如 `out T` 或 `in T`）时，编译器在内部会将未知的具体类型表示为[捕获类型](https://kotlinlang.org/spec/type-system.html#type-capturing)。捕获类型是具有已知上界和下界的未知类型。

捕获类型是不可表示的，因此你无法在 Kotlin 代码中直接编写它们。相反，你最常在编译器诊断信息中看到捕获类型，例如 `CapturedType(out X)`。例如，以下类型不匹配诊断信息包含一个捕获类型：

```kotlin
val array: Array<out CharSequence> = arrayOf("str")
val item: Int = array.get(0)
// 初始值设定项类型不匹配：预期为 'Int'，实际为 'CapturedType(out CharSequence)'
```

编译器对读取操作使用捕获类型的上界，并使用其下界来确定哪些值对于写入操作是类型安全的：

```kotlin
// 投影类型为 Array<out CharSequence>
val array: Array<out CharSequence> = arrayOf("Kotlin")

// get() 读取操作使用捕获类型的上界 CharSequence
val item = array.get(0)

// set() 写入操作使用捕获类型的下界 Nothing，这会导致错误
array.set(0, "New value")
// 接收器类型 'Array<out CharSequence>' 包含 out 投影，
// 这禁止使用 'fun set(index: Int, value: T): Unit'
```

在此示例中：

* 变量 `array` 的投影类型为 `Array<out CharSequence>`。编译器将投影类型实参 `out CharSequence` 表示为以 `CharSequence` 为上界、以 `Nothing` 为下界的捕获类型。
* 对于 `get()` 操作，编译器将捕获类型近似为其上界 `CharSequence`，并推断 `item` 的类型为 `CharSequence`。
* 对于 `set()` 操作，捕获类型的下界为 `Nothing`。由于 `Nothing` 没有实例，因此向投影类型写入值不是类型安全的，会导致错误。

## 泛型函数

不仅类可以拥有类型形参，函数也可以。类型形参放在函数名称*之前*：

```kotlin
fun <T> singletonList(item: T): List<T> {
    // ...
}

fun <T> T.basicToString(): String { // 扩展函数
    // ...
}
```

要调用泛型函数，请在调用点函数名称*之后*指定类型实参：

```kotlin
val l = singletonList<Int>(1)
```

如果类型实参可以从上下文中推断出来，则可以省略，因此以下示例同样有效：

```kotlin
val l = singletonList(1)
```

## 泛型约束

可以替换给定类型形参的所有可能类型的集合可以受到*泛型约束*的限制。

### 上界

最常见的约束类型是*上界*，它对应于 Java 的 `extends` 关键字：

```kotlin
fun <T : Comparable<T>> sort(list: List<T>) {  ... }
```

冒号后面指定的类型就是*上界*，表示只有 `Comparable<T>` 的子类型可以替换 `T`。例如：

```kotlin
sort(listOf(1, 2, 3)) // 成功。Int 是 Comparable<Int> 的子类型
sort(listOf(HashMap<Int, String>())) // 错误：HashMap<Int, String> 不是 Comparable<HashMap<Int, String>> 的子类型
```

默认上界（如果未指定）是 `Any?`。在尖括号内只能指定一个上界。
如果同一个类型形参需要多个上界，则需要一个单独的 *where*-子句：

```kotlin
fun <T> copyWhenGreater(list: List<T>, threshold: T): List<String>
    where T : CharSequence,
          T : Comparable<T> {
    return list.filter { it > threshold }.map { it.toString() }
}
```

传递的类型必须同时满足 `where` 子句的所有条件。在上述示例中，`T` 类型
必须*同时*实现 `CharSequence` 和 `Comparable`。

## 绝对不可为空类型

为了更容易地与泛型 Java 类和接口进行互操作，Kotlin 支持将泛型类型形参声明为**绝对不可为空**。 

要将泛型类型 `T` 声明为绝对不可为空，请使用 `& Any` 声明该类型。例如：`T & Any`。

绝对不可为空类型必须具有可为空的 [上界](#upper-bounds)。

声明绝对不可为空类型最常见的用例是当你想要重写一个
包含 `@NotNull` 实参的 Java 方法时。例如，考虑 `load()` 方法：

```java
import org.jetbrains.annotations.*;

public interface Game<T> {
    public T save(T x) {}
    @NotNull
    public T load(@NotNull T x) {}
}
```

要在 Kotlin 中成功重写 `load()` 方法，你需要将 `T1` 声明为绝对不可为空：

```kotlin
interface ArcadeGame<T1> : Game<T1> {
    override fun save(x: T1): T1
    // T1 是绝对不可为空的
    override fun load(x: T1 & Any): T1 & Any
}
```

当仅使用 Kotlin 开发时，你不太可能需要显式声明绝对不可为空类型，因为
Kotlin 的类型推断会为你处理好这一切。

## 类型擦除

Kotlin 为泛型声明使用执行的类型安全检查是在编译时完成的。
在运行时，泛型类型的实例不保存有关其真实类型实参的任何信息。
类型信息被称为被*擦除*了。例如，`Foo<Bar>` 和 `Foo<Baz?>` 的实例都被擦除为
仅 `Foo<*>`。

### 泛型类型检查与转换

由于类型擦除，在运行时没有通用的方法来检查泛型类型的实例是否是使用某些类型实参创建的，
并且编译器禁止此类 `is`-检查，例如
`ints is List<Int>` 或 `list is T`（类型形参）。但是，你可以针对星号投影类型检查实例：

```kotlin
if (something is List<*>) {
    something.forEach { println(it) } // 项的类型为 `Any?`
}
```

同样，当你已经静态地（在编译时）检查了实例的类型实参时，
你可以进行涉及类型非泛型部分的 `is`-检查或转换。请注意，
在这种情况下省略尖括号：

```kotlin
fun handleStrings(list: MutableList<String>) {
    if (list is ArrayList) {
        // `list` 智能转换为 `ArrayList<String>`
    }
}
```

对于不考虑类型实参的转换，可以使用相同的语法但省略类型实参：`list as ArrayList`。

泛型函数调用的类型实参也仅在编译时检查。在函数体内部，
类型形参不能用于类型检查，并且向类型形参的类型转换 (`foo as T`) 是未经检查的。
唯一的例外是具有 [具体化类型形参](inline-functions.md#reified-type-parameters) 的内联函数，
它们在每个调用点都内联了实际的类型实参。这使得可以对类型形参进行类型检查和转换。
但是，上述限制仍然适用于在检查或转换中使用的泛型类型实例。
例如，在类型检查 `arg is T` 中，如果 `arg` 本身是泛型类型的实例，则其类型实参仍然会被擦除。

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
val stringToStringList = somePair.asPairOf<String, List<String>>() // 可编译但破坏了类型安全！
// 展开示例以获取更多详情

//sampleEnd

fun main() {
    println("stringToSomething = " + stringToSomething)
    println("stringToInt = " + stringToInt)
    println("stringToList = " + stringToList)
    println("stringToStringList = " + stringToStringList)
    //println(stringToStringList?.second?.forEach() {it.length}) // 这将抛出 ClassCastException，因为列表项不是 String
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 未检查的转换

在运行时无法检查带有具体类型实参的泛型类型转换，例如 `foo as List<String>`。
当类型安全由高级程序逻辑暗示但无法由编译器直接推断时，
可以使用这些未检查的转换。请参阅下面的示例。

```kotlin
fun readDictionary(file: File): Map<String, *> = file.inputStream().use { 
    TODO("读取字符串到任意元素的映射。")
}

// 我们在这个文件中保存了一个带有 `Int` 的映射
val intsFile = File("ints.dictionary")

// 警告：未检查的转换：`Map<String, *>` 转换为 `Map<String, Int>`
val intsDictionary: Map<String, Int> = readDictionary(intsFile) as Map<String, Int>
```
最后一行中的转换会出现警告。编译器无法在运行时对其进行完全检查，并且
不保证映射中的值是 `Int`。

为了避免未检查的转换，你可以重新设计程序结构。在上面的示例中，你可以使用
`DictionaryReader<T>` 和 `DictionaryWriter<T>` 接口，并为不同类型提供类型安全的实现。
你可以引入合理的抽象，将未检查的转换从调用点移动到实现细节中。
正确使用 [泛型差异](#variance) 也会有所帮助。

对于泛型函数，使用 [具体化类型形参](inline-functions.md#reified-type-parameters) 会使类似于 `arg as T` 的转换
受到检查，除非 `arg` 的类型具有其*自身*被擦除的类型实参。

可以通过使用 `@Suppress("UNCHECKED_CAST")` [注解](annotations.md) 发生转换的语句或声明
来抑制未检查转换警告：

```kotlin
inline fun <reified T> List<*>.asListOfType(): List<T>? =
    if (all { it is T })
        @Suppress("UNCHECKED_CAST")
        this as List<T> else
        null
```

>**在 JVM 上**：[数组类型](arrays.md) (`Array<Foo>`) 保留了有关其元素擦除类型的信息，
>并且向数组类型的类型转换会受到部分检查：元素类型的
>为 null 性和实际类型实参仍然会被擦除。例如，
>如果 `foo` 是一个保存任何 `List<*>` 的数组，无论其是否可为空，转换 `foo as Array<List<String>?>` 都会成功。
>
{style="note"}

## 用于类型实参的下划线运算符

下划线运算符 `_` 可用于类型实参。当显式指定其他类型时，使用它来自动推断该实参的类型：

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