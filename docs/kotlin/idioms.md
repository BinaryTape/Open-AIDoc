[//]: # (title: 习惯用法)

Kotlin 中各种常用习惯用法的集合。如果您有喜欢的习惯用法，欢迎通过发送拉取请求来贡献。

## 创建 DTO（POJO/POCO） {id="create-dtos-pojos-pocos"}

```kotlin
data class Customer(val name: String, val email: String)
```

提供了具有以下功能的 `Customer` 类：

* 所有属性的 getter（对于 `var` 则还有 setter）
* `equals()`
* `hashCode()`
* `toString()`
* `copy()`
* 所有属性对应的 `component1()`、`component2()`……（参见[数据类](data-classes.md)）

## 函数形参的默认值 {id="default-values-for-function-parameters"}

```kotlin
fun foo(a: Int = 0, b: String = "") { ... }
```

## 过滤列表 {id="filter-a-list"}

```kotlin
val positives = list.filter { x -> x > 0 }
```

或者更简短的形式：

```kotlin
val positives = list.filter { it > 0 }
```

了解 [Java 与 Kotlin 过滤的区别](java-to-kotlin-collections-guide.md#filter-elements)。

## 检查集合中是否存在某元素 {id="check-the-presence-of-an-element-in-a-collection"}

```kotlin
if ("john@example.com" in emailsList) { ... }

if ("jane@example.com" !in emailsList) { ... }
```

## 字符串插值 {id="string-interpolation"}

```kotlin
println("Name $name")
```

了解 [Java 与 Kotlin 字符串串联的区别](java-to-kotlin-idioms-strings.md#concatenate-strings)。

## 安全读取标准输入 {id="read-standard-input-safely"}

```kotlin
// 读取一个字符串，如果输入无法转换为整数则返回 null。例如：Hi there!
val wrongInt = readln().toIntOrNull()
println(wrongInt)
// null

// 读取一个可转换为整数的字符串并返回整数。例如：13
val correctInt = readln().toIntOrNull()
println(correctInt)
// 13
```

更多信息请参阅[读取标准输入](read-standard-input.md)。

## 实例检查 {id="instance-checks"}

```kotlin
when (x) {
    is Foo -> ...
    is Bar -> ...
    else   -> ...
}
```

## 只读列表 {id="read-only-list"}

```kotlin
val list = listOf("a", "b", "c")
```
## 只读 Map {id="read-only-map"}

```kotlin
val map = mapOf("a" to 1, "b" to 2, "c" to 3)
```

## 访问 Map 条目 {id="access-a-map-entry"}

```kotlin
println(map["key"])
map["key"] = value
```

## 遍历 Map 或键值对列表 {id="traverse-a-map-or-a-list-of-pairs"}

```kotlin
for ((k, v) in map) {
    println("$k -> $v")
}
```

`k` 和 `v` 可以使用任何方便的名称，例如 `name` 和 `age`。

## 在区间上迭代 {id="iterate-over-a-range"}

```kotlin
for (i in 1..100) { ... }  // 包含 100
for (i in 1..<100) { ... } // 不包含 100
for (x in 2..10 step 2) { ... }
for (x in 10 downTo 1) { ... }
(1..10).forEach { ... }
```

## 延迟加载属性 {id="lazy-property"}

```kotlin
val p: String by lazy { // 仅在首次访问时计算该值
    // 计算字符串
}
```

## 扩展函数 {id="extension-functions"}

```kotlin
fun String.spaceToCamelCase() { ... }

"Convert this to camelcase".spaceToCamelCase()
```

## 创建单例 {id="create-a-singleton"}

```kotlin
object Resource {
    val name = "Name"
}
```

## 使用内联值类实现类型安全的值 {id="use-inline-value-classes-for-type-safe-values"}

```kotlin
@JvmInline
value class EmployeeId(private val id: String)

@JvmInline
value class CustomerId(private val id: String)
```

如果你不小心混淆了 `EmployeeId` 和 `CustomerId`，则会触发编译错误。

> `@JvmInline` 注解仅在 JVM 后端需要。
>
{style="note"}

## 实例化抽象类 {id="instantiate-an-abstract-class"}

```kotlin
abstract class MyAbstractClass {
    abstract fun doSomething()
    abstract fun sleep()
}

fun main() {
    val myObject = object : MyAbstractClass() {
        override fun doSomething() {
            // ...
        }

        override fun sleep() { // ...
        }
    }
    myObject.doSomething()
}
```

## If-not-null 简写 {id="if-not-null-shorthand"}

```kotlin
val files = File("Test").listFiles()

println(files?.size) // 如果 files 不为 null，则输出 size
```

## If-not-null-else 简写 {id="if-not-null-else-shorthand"}

```kotlin
val files = File("Test").listFiles()

// 对于简单的回退值：
println(files?.size ?: "empty") // 如果 files 为 null，则输出 "empty"

// 要在代码块中计算更复杂的回退值，请使用 `run`
val filesSize = files?.size ?: run { 
    val someSize = getSomeSize()
    someSize * 2
}
println(filesSize)
```

## 如果为 null 则执行表达式 {id="execute-an-expression-if-null"}

```kotlin
val values = ...
val email = values["email"] ?: throw IllegalStateException("Email is missing!")
```

## 获取可能为空的集合的第一个元素 {id="get-first-item-of-a-possibly-empty-collection"}

```kotlin
val emails = ... // 可能为空
val mainEmail = emails.firstOrNull() ?: ""
```

了解 [Java 与 Kotlin 获取首个元素的区别](java-to-kotlin-collections-guide.md#get-the-first-and-the-last-items-of-a-possibly-empty-collection)。

## 如果不为 null 则执行 {id="execute-if-not-null"}

```kotlin
val value = ...

value?.let {
    ... // 如果不为 null 则执行此代码块
}
```

## 如果不为 null 则映射可空值 {id="map-nullable-value-if-not-null"}

```kotlin
val value = ...

val mapped = value?.let { transformValue(it) } ?: defaultValue 
// 如果该值或转换结果为 null，则返回 defaultValue。
```

## 在 when 语句中返回 {id="return-on-when-statement"}

```kotlin
fun transform(color: String): Int {
    return when (color) {
        "Red" -> 0
        "Green" -> 1
        "Blue" -> 2
        else -> throw IllegalArgumentException("Invalid color param value")
    }
}
```

## try-catch 表达式 {id="try-catch-expression"}

```kotlin
fun test() {
    val result = try {
        count()
    } catch (e: ArithmeticException) {
        throw IllegalStateException(e)
    }

    // 处理 result
}
```

## if 表达式 {id="if-expression"}

```kotlin
val y = if (x == 1) {
    "one"
} else if (x == 2) {
    "two"
} else {
    "other"
}
```

## 返回 Unit 的方法的 Builder 风格用法 {id="builder-style-usage-of-methods-that-return-unit"}

```kotlin
fun arrayOfMinusOnes(size: Int): IntArray {
    return IntArray(size).apply { fill(-1) }
}
```

## 单表达式函数 {id="single-expression-functions"}

```kotlin
fun theAnswer() = 42
```

这等价于

```kotlin
fun theAnswer(): Int {
    return 42
}
```

这可以与其他习惯用法有效结合，从而写出更简短的代码。例如，结合 `when` 表达式：

```kotlin
fun transform(color: String): Int = when (color) {
    "Red" -> 0
    "Green" -> 1
    "Blue" -> 2
    else -> throw IllegalArgumentException("Invalid color param value")
}
```

## 对一个对象实例调用多个方法（with） {id="call-multiple-methods-on-an-object-instance-with"}

```kotlin
class Turtle {
    fun penDown()
    fun penUp()
    fun turn(degrees: Double)
    fun forward(pixels: Double)
}

val myTurtle = Turtle()
with(myTurtle) { // 绘制一个 100 像素的正方形
    penDown()
    for (i in 1..4) {
        forward(100.0)
        turn(90.0)
    }
    penUp()
}
```

## 配置对象的属性（apply） {id="configure-properties-of-an-object-apply"}

```kotlin
val myRectangle = Rectangle().apply {
    length = 4
    breadth = 5
    color = 0xFAFAFA
}
```

这对于配置对象构造函数中不存在的属性非常有用。

## Java 7 的 try-with-resources {id="java-7-s-try-with-resources"}

```kotlin
val stream = Files.newInputStream(Paths.get("/some/file.txt"))
stream.buffered().reader().use { reader ->
    println(reader.readText())
}
```

## 需要泛型类型信息的泛型函数 {id="generic-function-that-requires-the-generic-type-information"}

```kotlin
//  public final class Gson {
//     ...
//     public <T> T fromJson(JsonElement json, Class<T> classOfT) throws JsonSyntaxException {
//     ...

inline fun <reified T: Any> Gson.fromJson(json: JsonElement): T = this.fromJson(json, T::class.java)
```

## 交换两个变量 {id="swap-two-variables"}

```kotlin
var a = 1
var b = 2
a = b.also { b = a }
```

## 将代码标记为未完成（TODO） {id="mark-code-as-incomplete-todo"}
 
Kotlin 标准库提供了一个 `TODO()` 函数，该函数始终会抛出 `NotImplementedError`。
它的返回值类型为 `Nothing`，因此无论期望类型是什么都可以使用。
它还有一个接受 reason 形参的重载：

```kotlin
fun calcTaxes(): BigDecimal = TODO("Waiting for feedback from accounting")
```

IntelliJ IDEA 的 Kotlin 插件能够理解 `TODO()` 的语义，并在 TODO 工具窗口中自动添加代码指针。

## 下一步 {id="what-s-next"}

* 使用符合 Kotlin 习惯的风格解决 [Advent of Code 谜题](advent-of-code.md)。
* 了解如何在 [Java 和 Kotlin 中执行常见的字符串操作](java-to-kotlin-idioms-strings.md)。
* 了解如何在 [Java 和 Kotlin 中执行常见的集合操作](java-to-kotlin-collections-guide.md)。
* 了解如何在 [Java 和 Kotlin 中处理为 null 性](java-to-nullability-guide.md)。