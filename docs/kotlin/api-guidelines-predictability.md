[//]: # (title: 可预测性)

要设计一个稳健且用户友好的 Kotlin 库，必须预见常见的用例、允许扩展并强制执行正确的用法。
遵循默认设置、错误处理和状态管理的最佳做法，可以确保用户获得无缝体验，同时维护库的完整性和质量。

## 默认执行正确操作

你的库应该预见每个用例的“正常路径 (happy path)”，并据此提供默认设置。
用户不应该需要提供默认值即可让库正常工作。

例如，当使用 [Ktor `HttpClient`](https://ktor.io/docs/client-create-new-application.html) 时，最常见的用例是向服务器发送 GET 请求。
这可以通过下面的代码完成，其中只需指定必要信息：

```kotlin
val client = HttpClient(CIO)
val response: HttpResponse = client.get("https://ktor.io/")
```

无需为响应中可能的状态码提供强制性的 HTTP 标头值或自定义事件处理程序。

如果某个用例没有明显的“正常路径”，或者某个形参应该有默认值但没有无争议的选项，这可能表明需求分析存在缺陷。

## 提供扩展机会

当无法预见正确的选择时，应允许用户指定他们偏好的方式。
你的库还应该让用户能够提供自己的方案或使用第三方扩展。

例如，对于 [Ktor `HttpClient`](https://ktor.io/docs/client-serialization.html)，鼓励用户在配置客户端时安装内容协商支持，并指定他们偏好的序列化格式：

```kotlin
val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
        })
    }
}
```

用户可以选择安装哪些插件，或者使用[用于定义客户端插件的独立 API](https://ktor.io/docs/client-custom-plugins.html) 来创建自己的插件。

此外，用户可以为库中的类型定义扩展函数和属性。
作为库作者，你可以通过[在设计时考虑扩展](api-guidelines-readability.md#use-extension-functions-and-properties)并确保库的类型具有清晰的核心概念来简化这一过程。

## 防止无用和无效的扩展

用户不应能够以违反原始设计或在问题域规则内不可能实现的方式扩展你的库。

例如，在 JSON 数据的编组与反编组时，输出格式仅支持六种类型：
`object`、`array`、`number`、`string`、`boolean` 和 `null`。

如果你创建一个名为 `JsonElement` 的 open 类或接口，用户可能会创建无效的派生类型，如 `JsonDate`。
相反，你可以将 `JsonElement` 接口设为密封 (sealed)，并为每种类型提供一个实现：

```kotlin
sealed interface JsonElement

class JsonNumber(val value: Number) : JsonElement
class JsonObject(val values: Map<String, JsonElement>) : JsonElement
class JsonArray(val values: List<JsonElement>) : JsonElement
class JsonBoolean(val value: Boolean) : JsonElement
class JsonString(val value: String) : JsonElement
object JsonNull : JsonElement
```

密封类型还使编译器能够确保你的 `when` 表达式是穷举的，而无需 `else` 语句，从而提高可读性和一致性。

## 避免暴露可变状态

在管理多个值时，你的 API 应尽可能接受和/或返回只读集合。
可变集合不是线程安全的，会给你的库引入复杂性和不可预测性。

例如，如果用户修改了从 API 入口点返回的可变集合，将无法确定他们修改的是实现结构还是副本。
同样，如果用户在将集合传递给库后可以修改其中的值，将无法确定这是否会影响实现。

由于数组是可变集合，请避免在你的 API 中使用它们。
如果必须使用数组，请在与用户共享数据之前进行防御性复制。这可以确保你的数据结构保持不被修改。

编译器会自动为 `vararg` 实参执行这种防御性复制策略。
当使用扩展运算符将现有数组传递到预期 `vararg` 实参的位置时，会自动创建该数组的副本。

以下示例演示了这种行为：

```kotlin
fun main() {
    fun demo(vararg input: String): `Array<out String>` = input

    val originalArray = arrayOf("one", "two", "three", "four")
    val newArray = demo(*originalArray)

    originalArray[1] = "ten"

    // 打印 "one, ten, three, four"
    println(originalArray.joinToString())

    // 打印 "one, two, three, four"
    println(newArray.joinToString())
}
```

## 验证输入和状态

在执行实现之前，通过验证输入和现有状态来确保你的库被正确使用。
使用 [`require`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/require.html) 函数验证输入，使用 [`check`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/check.html) 函数验证现有状态。

如果条件为 `false`，`require` 函数会抛出 [`IllegalArgumentException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-argument-exception/#kotlin.IllegalArgumentException)，使函数立即失败并显示相应的错误消息：

```kotlin
fun saveUser(username: String, password: String) {
    require(username.isNotBlank()) { "Username should not be blank" }
    require(username.all { it.isLetterOrDigit() }) {
        "Username can only contain letters and digits, was: $username"
    }
    require(password.isNotBlank()) { "Password should not be blank" }
    require(password.length >= 7) {
        "Password must contain at least 7 characters"
    }

    /* 实现可以继续执行 */
}

```

错误消息应包含相关的输入，以帮助用户确定失败原因，如上所示，针对包含无效字符的最小用户名的错误消息中包含了不正确的用户名。
此做法的一个例外是，如果在错误消息中包含某个值可能会泄露可能被恶意用于安全漏洞的信息，这就是为什么密码长度的错误消息不包含密码输入的原因。

同样，如果条件为 `false`，`check` 函数会抛出 [`IllegalStateException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-state-exception/#kotlin.IllegalStateException)。
使用此函数来验证实例的状态，如下例所示：

```kotlin
class ShoppingCart {
    private val contents = mutableListOf<Item>()

    fun addItem(item: Item) {
       contents.add(item)
    }

    fun purchase(): Amount {
       check(contents.isNotEmpty()) {
           "Cannot purchase an empty cart"
       }
       // 计算并返回金额
    }
}
```

## 下一步

在指南的下一部分中，你将学习调试性。

[继续阅读下一部分](api-guidelines-debuggability.md)