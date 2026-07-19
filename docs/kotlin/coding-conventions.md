作为字符串文字处理，使用[多美元符字符串插值](strings.md#multi-dollar-string-interpolation)来处理美元符号：

```kotlin
val KClass<*>.jsonSchema : String
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

在简短且不嵌套的 lambda 表达式中，建议使用 `it` 约定，而不是显式声明参数。在带有参数的嵌套 lambda 表达式中，始终显式声明参数。

### Lambda 中的返回

避免在 lambda 表达式中使用多个带标签的返回。考虑重构 lambda 表达式，使其具有单一退出点。如果这不可能或不够清晰，请考虑将 lambda 表达式转换为匿名函数。

不要在 lambda 表达式的最后一条语句中使用带标签的返回。

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

在某些场景中，无参数函数可能与只读属性互换。虽然语义相似，但在何时选择其中一个而非另一个方面，存在一些样式约定。

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

如果你有一个具有多个重载构造函数的对象，这些构造函数不调用不同的超类构造函数，且无法简化为包含默认参数值的单个构造函数，请优先将重载构造函数替换为工厂函数。

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

Kotlin 提供了一组函数，用于在给定对象的上下文中执行代码块：`let`、`run`、`with`、`apply` 和 `also`。有关为你的情况选择正确作用域函数的指导，请参阅[作用域函数](scope-functions.md)。

## 库的编码规范

在编写库时，建议遵循一组额外的规则以确保 API 稳定性：

 * 始终显式指定成员可见性（以避免意外地将声明暴露为公共 API）。
 * 始终显式指定函数返回类型和属性类型（以避免在实现更改时意外更改返回类型）。
 * 为所有公共成员提供 [KDoc](kotlin-doc.md) 注释，但不需要任何新文档的重写除外（以支持为库生成文档）。

在 [Library authors' guidelines](api-guidelines-introduction.md) 中了解有关编写库 API 时要考虑的最佳做法和想法的更多信息。