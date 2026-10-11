[//]: # (title: JSON 元素)

Kotlin serialization 还支持在结构层面操作 JSON。
你可以使用 [`JsonElement`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-element/) API 在将 JSON 结构转换为 Kotlin 类型或字符串之前，直接对其进行检查、修改与构建。

`JsonElement` 有三个直接子类型，分别代表核心的 JSON 结构：

* [`JsonPrimitive`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-primitive/) 处理基本 JSON 元素，例如字符串、数字、布尔值和 `null`。`null` 值由 `JsonPrimitive` 的一个特殊子类 [`JsonNull`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-null/) 表示。
  每个 `JsonPrimitive` 都存储其值的字符串表示形式，你可以通过其 [`JsonPrimitive.content`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-primitive/content.html) 属性进行访问。
* [`JsonArray`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-array/) 表示 JSON 数组。它是包含 `JsonElement` 项的 Kotlin [`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/)。
* [`JsonObject`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-object/) 表示 JSON 对象。它是键为 `String`、值为 `JsonElement` 的 Kotlin [`Map`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/#kotlin.collections.Map)。

## 将字符串解析为 JSON 元素 {id="parse-strings-to-json-elements"}

你可以将字符串解析为 `JsonElement`，以便在将其转换为 Kotlin 类型或字符串之前先处理 JSON 结构。

使用 [`Json.parseToJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/parse-to-json-element.html) 函数将输入解析为 JSON 元素树，而无需对其进行解码或反序列化：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
fun main() {
    val element = Json.parseToJsonElement("""
        {"name":"kotlinx.serialization","language":"Kotlin"}
    """)
    // JsonElement.toString() 会生成一个有效的 JSON 字符串
    println(element)
    // {"name":"kotlinx.serialization","language":"Kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

## 访问 JSON 元素的内容 {id="access-the-contents-of-json-elements"}

你可以直接通过 `JsonElement` API 的扩展属性访问 JSON 元素的内容。
这些扩展属性会将元素转换为特定的子类型，
如果该元素不具备预期的 JSON 结构，则会抛出 `IllegalArgumentException`。

可用的扩展属性包括：

* [`jsonPrimitive`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/json-primitive.html) 返回一个 `JsonPrimitive`。
* [`jsonArray`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/json-array.html) 返回一个 `JsonArray`。
* [`jsonObject`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/json-object.html) 返回一个 `JsonObject`。

类似地，[`JsonPrimitive`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-primitive/) 也提供了用于将值解析为 Kotlin 基本类型的扩展属性，例如
[`int`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/int.html)、[`intOrNull`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/int-or-null.html)、[`long`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/long.html) 以及 [`longOrNull`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/long-or-null.html)。

以下示例展示了在处理已知结构的 JSON 数据时如何使用这些扩展属性：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
fun main() {
    val element = Json.parseToJsonElement("""
        {
            "name": "kotlinx.serialization",
            "forks": [{"votes": 42}, {"votes": 9000}, {}]
        }
    """)
    val sum = element
        // 从 JsonObject 访问 forks 键
        .jsonObject["forks"]!!

        // 作为 JsonArray 访问该值，并将每个 JsonObject 的 votes 值求和为 Int
        .jsonArray.sumOf { it.jsonObject["votes"]?.jsonPrimitive?.int ?: 0 }
    println(sum)
    // 9042
}
//sampleEnd
```
{kotlin-runnable="true"}

如果你预先不知道 JSON 的结构，可以检查元素类型并显式处理每个 `JsonElement` 子类型。
例如，你可以使用带有 `when` 表达式的帮助函数：

```kotlin
fun processElement(element: JsonElement): String = when (element) {
    is JsonObject -> "JsonObject with keys: ${element.keys}"
    is JsonArray -> "JsonArray with ${element.size} elements"
    is JsonPrimitive -> "JsonPrimitive with content: ${element.content}"
}
```

## 创建 JSON 元素 {id="create-json-elements"}

你可以直接创建特定 `JsonElement` 子类型的实例。

要创建 `JsonPrimitive`，请使用 `JsonPrimitive()` 函数：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
fun main() {
    // 从不同的 Kotlin 基本类型创建 JsonPrimitive 值
    val number = JsonPrimitive(42)
    val text = JsonPrimitive("kotlinx.serialization")

    println(number)
    // 42
    println(text)
    // "kotlinx.serialization"
}
//sampleEnd
```
{kotlin-runnable="true"}

你可以通过直接调用构造函数或使用构建器函数来创建 `JsonArray` 和 `JsonObject` 元素：

* 要从 `List` 创建 `JsonArray`，可以使用 [`JsonArray()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-array/-json-array.html)，或者使用 [`buildJsonArray()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/build-json-array.html) 构建器函数。
* 要从 `Map` 创建 `JsonObject`，可以使用 [`JsonObject()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-object/-json-object.html)，或者使用 [`buildJsonObject()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/build-json-object.html) 构建器函数。

这些构建器函数提供了类似于 [Kotlin 标准库集合构建器](constructing-collections.md#create-with-collection-builder-functions)的 DSL，并包含 JSON 特有的重载和内部构建器函数。

以下示例突显了 JSON 构建器 DSL 的主要功能：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
fun main() {
    val element = buildJsonObject {
        // 向 JsonObject 添加一个简单的键值对
        put("name", "kotlinx.serialization")
        // 在 owner 键下添加一个嵌套的 JsonObject
        putJsonObject("owner") {
            put("name", "kotlin")
        }
        // 添加一个包含多个 JsonObject 的 JsonArray
        putJsonArray("forks") {
            // 向 JsonArray 添加一个 JsonObject
            addJsonObject {
                put("votes", 42)
            }
            addJsonObject {
                put("votes", 9000)
            }
        }
    }
    // 输出生成的 JSON 字符串
    println(element)
    // {"name":"kotlinx.serialization","owner":{"name":"kotlin"},"forks":[{"votes":42},{"votes":9000}]}
}
//sampleEnd
```
{kotlin-runnable="true"}

### 编码 JSON 字面量内容 {id="encode-literal-json-content"}

虽然 JSON 规范没有限制数字的大小或精度，但使用 `JsonPrimitive()` 函数序列化任意大小的数字可能会引发一些问题。

例如，如果对大数字使用 [`Double`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-double/)，该值可能会被截断，从而丢失精度。
如果使用 Kotlin/JVM 的 [`BigDecimal`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/java.math.-big-decimal/)，精度得以保留，但 `JsonPrimitive()` 会将该值编码为字符串而不是数字：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import java.math.BigDecimal

//sampleStart
val format = Json { prettyPrint = true }

fun main() {
    val pi = BigDecimal("3.141592653589793238462643383279")
    
    // 将 BigDecimal 转换为 Double，可能导致截断
    val piJsonDouble = JsonPrimitive(pi.toDouble())
    // 将 BigDecimal 转换为 String，保留了精度，但在 JSON 中会被视作字符串
    val piJsonString = JsonPrimitive(pi.toString())
  
    val piObject = buildJsonObject {
        put("pi_double", piJsonDouble)
        put("pi_string", piJsonString)
    }

    println(format.encodeToString(piObject))
    // "pi_double": 3.141592653589793,
    // "pi_string": "3.141592653589793238462643383279"
}
//sampleEnd
```
{kotlin-runnable="true"}

在本例中，即使 `pi` 被定义为带有 30 位小数的数字，生成的 JSON 也无法保留该精度。
`Double` 值被截断为 15 位小数，而 `String` 值则被包裹在引号中，因此它变成了 JSON 字符串而非数字。

为了避免这些问题，你可以使用 [`JsonUnquotedLiteral()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-unquoted-literal.html) 函数来编码任意未加引号的值（如本例中 `pi` 的字符串值）：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import java.math.BigDecimal

//sampleStart
val format = Json { prettyPrint = true }

fun main() {
    val pi = BigDecimal("3.141592653589793238462643383279")

    // 使用 JsonUnquotedLiteral() 编码原始 JSON 内容
    @OptIn(ExperimentalSerializationApi::class)
    val piJsonLiteral = JsonUnquotedLiteral(pi.toString())

    // 转换为 Double 和 String
    val piJsonDouble = JsonPrimitive(pi.toDouble())
    val piJsonString = JsonPrimitive(pi.toString())

    val piObject = buildJsonObject {
        put("pi_literal", piJsonLiteral)
        put("pi_double", piJsonDouble)
        put("pi_string", piJsonString)
    }

    // pi_literal 现在精确匹配所定义的值
    println(format.encodeToString(piObject))
    // "pi_literal": 3.141592653589793238462643383279,
    // "pi_double": 3.141592653589793,
    // "pi_string": "3.141592653589793238462643383279"
}
//sampleEnd
```
{kotlin-runnable="true"}

要将 `pi` 解码回 `BigDecimal`，请提取 `JsonPrimitive` 的字符串内容：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import java.math.BigDecimal

//sampleStart
fun main() {
    val piObjectJson = """
          {
              "pi_literal": 3.141592653589793238462643383279
          }
      """.trimIndent()

    // 将 JSON 字符串解码为 JsonObject
    val piObject: JsonObject = Json.decodeFromString(piObjectJson)

    // 从 JsonPrimitive 提取字符串内容
    val piJsonLiteral = piObject["pi_literal"]!!.jsonPrimitive.content

    // 将字符串转换为 BigDecimal
    val pi = BigDecimal(piJsonLiteral)
    // 输出解码后的 pi 值，保留全部 30 位小数
    println(pi)
    // 3.141592653589793238462643383279
}
//sampleEnd
```
{kotlin-runnable="true"}

> 本例为简单起见使用了 `JsonPrimitive`。关于更具可复用性的方法，请参阅[转换 JSON 结构](serialization-transform-json.md)。
>
{style="tip"}

#### JSON null 字面量 {id="json-null-literal"}

为避免产生不一致的状态，你不能使用 `JsonUnquotedLiteral()` 函数编码字符串 `"null"`。
如果尝试这样做，则会抛出异常：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@OptIn(ExperimentalSerializationApi::class)
fun main() {
    JsonUnquotedLiteral("null")
    // Exception in thread "main" kotlinx.serialization.json.internal.JsonEncodingException
}
//sampleEnd
```
{kotlin-runnable="true" validate="false"}

要表示 JSON `null` 字面量值，请使用 [`JsonNull`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-null/)：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
fun main() {
    val possiblyNull = JsonNull
  
    println(possiblyNull)
    // null
}
//sampleEnd
```
{kotlin-runnable="true"}

## 解码 JSON 元素 {id="decode-json-elements"}

要将 `JsonElement` 类的实例解码为可序列化对象，请使用 [`Json.decodeFromJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/decode-from-json-element.html) 函数：

```kotlin
// 从序列化库导入声明
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Project(val name: String, val language: String)

fun main() {
    val element = buildJsonObject {
        put("name", "kotlinx.serialization")
        put("language", "Kotlin")
    }

    // 将 JsonElement 解码为 Project 对象
    val data = Json.decodeFromJsonElement<Project>(element)
    println(data)
    // Project(name=kotlinx.serialization, language=Kotlin)
}
//sampleEnd
```
{kotlin-runnable="true"}

## 下一步 {id="what-s-next"}

* 了解如何[在序列化和反序列化期间转换 JSON](serialization-transform-json.md)，从而更好地掌控你的数据。
* 了解如何[序列化类](serialization-customization-options.md)以及如何修改 `@Serializable` 注解的默认行为。