[//]: # (title: JSON 元素)

Kotlin 序列化也支援在結構層級處理 JSON。
你可以使用 [`JsonElement`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-element/) API 在將 JSON 結構轉換為 Kotlin 型別或字串之前，直接對其進行檢查、修改以及建置。

`JsonElement` 有三個代表核心 JSON 結構的直接子型別：

* [`JsonPrimitive`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-primitive/) 處理原始 JSON 元素，例如字串、數字、布林值和 `null`。`null` 值由 `JsonPrimitive` 的特殊子類別 [`JsonNull`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-null/) 表示。
  每個 `JsonPrimitive` 都會儲存其值的字串表示形式，你可以透過其 [`JsonPrimitive.content`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-primitive/content.html) 屬性進行存取。
* [`JsonArray`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-array/) 代表 JSON 陣列。它是一個由 `JsonElement` 項目組成的 Kotlin [`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/)。
* [`JsonObject`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-object/) 代表 JSON 物件。它是一個具有 `String` 鍵和 `JsonElement` 值的 Kotlin [`Map`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/#kotlin.collections.Map)。

## 將字串剖析為 JSON 元素 {id="parse-strings-to-json-elements"}

你可以將字串剖析為 `JsonElement`，以便在將 JSON 結構轉換為 Kotlin 型別或字串之前對其進行處理。

使用 [`Json.parseToJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/parse-to-json-element.html) 函式將輸入剖析為 JSON 元素樹，而無需進行解碼或反序列化：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
fun main() {
    val element = Json.parseToJsonElement("""
        {"name":"kotlinx.serialization","language":"Kotlin"}
    """)
    // JsonElement.toString() gives you a valid JSON string
    println(element)
    // {"name":"kotlinx.serialization","language":"Kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

## 存取 JSON 元素的內容 {id="access-the-contents-of-json-elements"}

你可以直接透過 `JsonElement` API 的擴充屬性來存取 JSON 元素的內容。
這些擴充屬性會將元素轉換為特定的子型別，
如果元素的 JSON 結構不符合預期，則會擲出 `IllegalArgumentException`。

可用的擴充屬性如下：

* [`jsonPrimitive`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/json-primitive.html) 傳回 `JsonPrimitive`。
* [`jsonArray`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/json-array.html) 傳回 `JsonArray`。
* [`jsonObject`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/json-object.html) 傳回 `JsonObject`。

同樣地，[`JsonPrimitive`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-primitive/) 也具有擴充屬性，可將值剖析為 Kotlin 原始型別，例如
[`int`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/int.html)、[`intOrNull`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/int-or-null.html)、[`long`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/long.html) 以及 [`longOrNull`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/long-or-null.html)。

以下範例展示了在處理已知結構的 JSON 資料時，如何使用這些擴充屬性：

```kotlin
// Imports declarations from the serialization library
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
        // Accesses the forks key from the JsonObject
        .jsonObject["forks"]!!

        // Accesses the value as a JsonArray and sums the votes values from each JsonObject as Int
        .jsonArray.sumOf { it.jsonObject["votes"]?.jsonPrimitive?.int ?: 0 }
    println(sum)
    // 9042
}
//sampleEnd
```
{kotlin-runnable="true"}

如果你事先不知道 JSON 結構，可以檢查元素型別並明確處理每個 `JsonElement` 子型別。
例如，你可以使用帶有 `when` 運算式的輔助函式：

```kotlin
fun processElement(element: JsonElement): String = when (element) {
    is JsonObject -> "JsonObject with keys: ${element.keys}"
    is JsonArray -> "JsonArray with ${element.size} elements"
    is JsonPrimitive -> "JsonPrimitive with content: ${element.content}"
}
```

## 建立 JSON 元素 {id="create-json-elements"}

你可以直接建立特定 `JsonElement` 子型別的執行個體。

若要建立 `JsonPrimitive`，請使用 `JsonPrimitive()` 函式：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
fun main() {
    // Creates JsonPrimitive values from different Kotlin primitives
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

你可以透過直接呼叫其建構函式或使用 builder 函式來建立 `JsonArray` 和 `JsonObject` 元素：

* 若要從 `List` 建立 `JsonArray`，請使用 [`JsonArray()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-array/-json-array.html)，或使用 [`buildJsonArray()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/build-json-array.html) builder 函式。
* 若要從 `Map` 建立 `JsonObject`，請使用 [`JsonObject()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-object/-json-object.html)，或使用 [`buildJsonObject()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/build-json-object.html) builder 函式。

Builder 函式提供了類似於 [Kotlin 標準函式庫集合 builder](constructing-collections.md#create-with-collection-builder-functions) 的 DSL，並具有 JSON 特定的多載和內部 builder 函式。

以下範例重點介紹了 JSON builder DSL 的主要功能：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
fun main() {
    val element = buildJsonObject {
        // Adds a simple key-value pair to the JsonObject
        put("name", "kotlinx.serialization")
        // Adds a nested JsonObject under the owner key
        putJsonObject("owner") {
            put("name", "kotlin")
        }
        // Adds a JsonArray with multiple JsonObjects
        putJsonArray("forks") {
            // Adds a JsonObject to the JsonArray
            addJsonObject {
                put("votes", 42)
            }
            addJsonObject {
                put("votes", 9000)
            }
        }
    }
    // Prints the resulting JSON string
    println(element)
    // {"name":"kotlinx.serialization","owner":{"name":"kotlin"},"forks":[{"votes":42},{"votes":9000}]}
}
//sampleEnd
```
{kotlin-runnable="true"}

### 編碼常值 JSON 內容 {id="encode-literal-json-content"}

雖然 JSON 規格沒有限制數字的大小或精準度，但使用 `JsonPrimitive()` 函式序列化任意大小的數字可能會導致一些問題。

例如，如果你對大數使用 [`Double`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-double/)，該值可能會被截斷並遺失精準度。
如果你使用 Kotlin/JVM 的 [`BigDecimal`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/java.math.-big-decimal/)，該值會保持精確，但 `JsonPrimitive()` 會將該值編碼為字串而不是數字：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import java.math.BigDecimal

//sampleStart
val format = Json { prettyPrint = true }

fun main() {
    val pi = BigDecimal("3.141592653589793238462643383279")
    
    // Converts the BigDecimal to a Double, causing potential truncation
    val piJsonDouble = JsonPrimitive(pi.toDouble())
    // Converts the BigDecimal to a String, preserving the precision but treating it as a string in JSON
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

在此範例中，即使 `pi` 定義為具有 30 位小數的數字，產生的 JSON 也無法保留該精準度。
`Double` 值被截斷為 15 位小數，而 `String` 值則被包裹在引號中，因此它變成了 JSON 字串而不是數字。

為了避免這些問題，你可以使用 [`JsonUnquotedLiteral()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-unquoted-literal.html) 函式來編碼任意無引號的值，例如本例中 `pi` 的字串值：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import java.math.BigDecimal

//sampleStart
val format = Json { prettyPrint = true }

fun main() {
    val pi = BigDecimal("3.141592653589793238462643383279")

    // Encodes the raw JSON content using JsonUnquotedLiteral()
    @OptIn(ExperimentalSerializationApi::class)
    val piJsonLiteral = JsonUnquotedLiteral(pi.toString())

    // Converts to Double and String
    val piJsonDouble = JsonPrimitive(pi.toDouble())
    val piJsonString = JsonPrimitive(pi.toString())

    val piObject = buildJsonObject {
        put("pi_literal", piJsonLiteral)
        put("pi_double", piJsonDouble)
        put("pi_string", piJsonString)
    }

    // pi_literal now accurately matches the value defined
    println(format.encodeToString(piObject))
    // "pi_literal": 3.141592653589793238462643383279,
    // "pi_double": 3.141592653589793,
    // "pi_string": "3.141592653589793238462643383279"
}
//sampleEnd
```
{kotlin-runnable="true"}

若要將 `pi` 解碼回 `BigDecimal`，請擷取 `JsonPrimitive` 的字串內容：

```kotlin
// Imports declarations from the serialization library
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

    // Decodes the JSON string into a JsonObject
    val piObject: JsonObject = Json.decodeFromString(piObjectJson)

    // Extracts the string content from the JsonPrimitive
    val piJsonLiteral = piObject["pi_literal"]!!.jsonPrimitive.content

    // Converts the string to a BigDecimal
    val pi = BigDecimal(piJsonLiteral)
    // Prints the decoded value of pi, preserving all 30 decimal places
    println(pi)
    // 3.141592653589793238462643383279
}
//sampleEnd
```
{kotlin-runnable="true"}

> 為了簡潔起見，本範例使用了 `JsonPrimitive`。若要了解更多可重複使用的方法，請參閱
> [轉換 JSON 結構](serialization-transform-json.md)。
>
{style="tip"}

#### JSON null 常值 {id="json-null-literal"}

為了避免產生不一致的狀態，你無法使用 `JsonUnquotedLiteral()` 函式編碼字串 `"null"`。
如果嘗試這樣做，將會擲出例外：

```kotlin
// Imports declarations from the serialization library
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

若要表示 JSON `null` 常值，請使用 [`JsonNull`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-null/)：

```kotlin
// Imports declarations from the serialization library
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

## 解碼 JSON 元素 {id="decode-json-elements"}

若要將 `JsonElement` 類別的執行個體解碼為可序列化物件，請使用
[`Json.decodeFromJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/decode-from-json-element.html) 函式：

```kotlin
// Imports declarations from the serialization library
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

    // Decodes the JsonElement into a Project object
    val data = Json.decodeFromJsonElement<Project>(element)
    println(data)
    // Project(name=kotlinx.serialization, language=Kotlin)
}
//sampleEnd
```
{kotlin-runnable="true"}

## 後續步驟 {id="what-s-next"}

* 探索如何[在序列化與反序列化期間轉換 JSON](serialization-transform-json.md)，以更好地控制你的資料。
* 了解如何[序列化類別](serialization-customization-options.md)，以及如何修改 `@Serializable` 註解的預設行為。