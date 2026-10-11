[//]: # (title: JSON 序列化概述)

Kotlin serialization 允许你轻松地将 Kotlin 对象与 JSON 进行相互转换。
[`Json`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/) 类是实现此功能的主要工具，它在 JSON 的生成和解析方式上提供了极大的灵活性。
你可以配置 `Json` 实例以处理特定的 JSON 行为，也可以使用其默认实例来处理基础任务。

借助 `Json` 类，你可以：

* 使用 [`encodeToString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/encode-to-string.html) 函数将 Kotlin 对象序列化为 JSON 字符串。
* 使用 [`decodeFromString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/decode-from-string.html) 函数将 JSON 字符串反序列化回 Kotlin 对象。
* 在处理复杂的 JSON 结构时，通过 [`encodeToJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/encode-to-json-element.html) 和 [`decodeFromJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/decode-from-json-element.html) 函数[直接操作 `JsonElement`](serialization-json-elements.md)。
* 使用[实验性](components-stability.md#stability-levels-explained)扩展函数在不创建中间字符串的情况下[序列化和反序列化 I/O 源](serialization-json-io-sources.md)，包括 JVM 流以及 [`kotlinx-io`](https://github.com/Kotlin/kotlinx-io) 和 [Okio](https://square.github.io/okio/) 类型。

在开始之前，请从序列化库中导入以下声明：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*
```

下面是一个使用默认 `Json` 实例展示 Kotlin 中 JSON 序列化如何工作的简单示例：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class User(val name: String, val age: Int)

fun main() {
    // 使用默认的 Json 实例
    val json = Json

    // 创建一个 User 对象
    val user = User("Alice", 30)

    // 将 User 对象转换为 JSON 字符串
    val jsonString = json.encodeToString(user)
    println(jsonString)
    // {"name":"Alice","age":30}

    // 将 JSON 字符串转换回 User 对象
    val deserializedUser = json.decodeFromString<User>(jsonString)
    println(deserializedUser)
    // User(name=Alice, age=30)
}
//sampleEnd
```
{kotlin-runnable="true" id="first-json-example"}

除了使用默认配置外，你还可以针对特定用例[自定义 `Json` 实例](serialization-json-configuration.md)，
例如忽略未知键：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Project(val name: String)

// 配置 Json 实例以忽略未知键
val customJson = Json {
    ignoreUnknownKeys = true
}

fun main() {
    val data = customJson.decodeFromString<Project>("""
        {"name":"kotlinx.serialization","language":"Kotlin"}
    """)
    println(data)
    // Project(name=kotlinx.serialization)
}
//sampleEnd
```
{kotlin-runnable="true" id="first-json-instance-example"}

## 后续步骤 {id="what-s-next"}

* 了解如何[自定义 `Json` 实例](serialization-json-configuration.md)以应对序列化和反序列化的不同用例。
* 探索[高级 JSON 元素处理](serialization-json-elements.md)，以便在解析或序列化之前操作和处理 JSON 数据。
* 了解如何[在序列化和反序列化期间转换 JSON](serialization-transform-json.md)，从而更好地控制你的数据。