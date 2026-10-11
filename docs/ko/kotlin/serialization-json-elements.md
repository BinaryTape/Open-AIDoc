[//]: # (title: JSON 요소)

Kotlin serialization은 구조적 수준에서 JSON을 다루는 기능도 지원합니다.
[`JsonElement`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-element/) API를 사용하면 JSON을 Kotlin 타입이나 문자열로 변환하기 전에 해당 구조를 직접 검사, 수정 및 빌드할 수 있습니다.

`JsonElement`에는 핵심 JSON 구조를 나타내는 세 가지 직접 하위 타입이 있습니다.

* [`JsonPrimitive`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-primitive/)는 문자열, 숫자, 불리언 및 `null`과 같은 원시(primitive) JSON 요소를 처리합니다. `null` 값은 `JsonPrimitive`의 특수 하위 클래스인 [`JsonNull`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-null/)로 표현됩니다.
  각 `JsonPrimitive`는 해당 값의 문자열 표현을 저장하며, 이는 [`JsonPrimitive.content`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-primitive/content.html) 프로퍼티를 통해 접근할 수 있습니다.
* [`JsonArray`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-array/)는 JSON 배열을 나타냅니다. `JsonElement` 항목들로 이루어진 Kotlin [`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/)입니다.
* [`JsonObject`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-object/)는 JSON 객체를 나타냅니다. `String` 키와 `JsonElement` 값을 가진 Kotlin [`Map`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/#kotlin.collections.Map)입니다.

## 문자열을 JSON 요소로 파싱하기 {id="parse-strings-to-json-elements"}

문자열을 `JsonElement`로 파싱하여 Kotlin 타입이나 문자열로 변환하기 전에 JSON 구조를 작업할 수 있습니다.

[`Json.parseToJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/parse-to-json-element.html) 함수를 사용하면 입력을 디코딩하거나 역직렬화(deserializing)하지 않고 JSON 요소 트리로 파싱할 수 있습니다.

```kotlin
// serialization 라이브러리에서 선언들을 import합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
fun main() {
    val element = Json.parseToJsonElement("""
        {"name":"kotlinx.serialization","language":"Kotlin"}
    """)
    // JsonElement.toString()은 유효한 JSON 문자열을 반환합니다
    println(element)
    // {"name":"kotlinx.serialization","language":"Kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

## JSON 요소의 내용에 접근하기 {id="access-the-contents-of-json-elements"}

`JsonElement` API의 확장 프로퍼티를 통해 JSON 요소의 내용에 직접 접근할 수 있습니다.
이러한 확장 프로퍼티는 요소를 특정 하위 타입으로 캐스팅하며,
요소가 예상된 JSON 구조를 갖추지 못한 경우 `IllegalArgumentException`을 발생시킵니다.

사용 가능한 확장 프로퍼티는 다음과 같습니다.

* [`jsonPrimitive`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/json-primitive.html)는 `JsonPrimitive`를 반환합니다.
* [`jsonArray`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/json-array.html)는 `JsonArray`를 반환합니다.
* [`jsonObject`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/json-object.html)는 `JsonObject`를 반환합니다.

마찬가지로, [`JsonPrimitive`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-primitive/)에는 값을 [`int`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/int.html), [`intOrNull`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/int-or-null.html), [`long`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/long.html), [`longOrNull`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/long-or-null.html)과 같은 Kotlin 원시 타입으로 파싱하기 위한 확장 프로퍼티가 있습니다.

다음은 알려진 구조를 가진 JSON 데이터를 처리할 때 이러한 확장 프로퍼티를 사용하는 방법을 보여주는 예제입니다.

```kotlin
// serialization 라이브러리에서 선언들을 import합니다
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
        // JsonObject에서 forks 키에 접근합니다
        .jsonObject["forks"]!!

        // 값을 JsonArray로 접근하고 각 JsonObject의 votes 값을 Int로 합산합니다
        .jsonArray.sumOf { it.jsonObject["votes"]?.jsonPrimitive?.int ?: 0 }
    println(sum)
    // 9042
}
//sampleEnd
```
{kotlin-runnable="true"}

JSON 구조를 미리 알 수 없는 경우 요소 타입을 확인하고 각 `JsonElement` 하위 타입을 명시적으로 처리할 수 있습니다.
예를 들어 `when` 식을 사용하는 도우미 함수를 작성할 수 있습니다.

```kotlin
fun processElement(element: JsonElement): String = when (element) {
    is JsonObject -> "JsonObject with keys: ${element.keys}"
    is JsonArray -> "JsonArray with ${element.size} elements"
    is JsonPrimitive -> "JsonPrimitive with content: ${element.content}"
}
```

## JSON 요소 생성하기 {id="create-json-elements"}

특정 `JsonElement` 하위 타입의 인스턴스를 직접 생성할 수 있습니다.

`JsonPrimitive`를 생성하려면 `JsonPrimitive()` 함수를 사용합니다.

```kotlin
// serialization 라이브러리에서 선언들을 import합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
fun main() {
    // 다양한 Kotlin 원시 타입으로부터 JsonPrimitive 값을 생성합니다
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

생성자를 직접 호출하거나 빌더 함수를 사용하여 `JsonArray` 및 `JsonObject` 요소를 생성할 수 있습니다.

* `List`로부터 `JsonArray`를 생성하려면 [`JsonArray()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-array/-json-array.html)를 사용하거나, [`buildJsonArray()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/build-json-array.html) 빌더 함수를 사용합니다.
* `Map`으로부터 `JsonObject`를 생성하려면 [`JsonObject()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-object/-json-object.html)를 사용하거나, [`buildJsonObject()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/build-json-object.html) 빌더 함수를 사용합니다.

빌더 함수는 JSON 전용 오버로드와 내부 빌더 함수를 갖추고 있으며, [Kotlin 표준 라이브러리 컬렉션 빌더](constructing-collections.md#create-with-collection-builder-functions)와 유사한 DSL을 제공합니다.

다음은 JSON 빌더 DSL의 주요 기능을 보여주는 예제입니다.

```kotlin
// serialization 라이브러리에서 선언들을 import합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
fun main() {
    val element = buildJsonObject {
        // JsonObject에 간단한 키-값 쌍을 추가합니다
        put("name", "kotlinx.serialization")
        // owner 키 아래에 중첩된 JsonObject를 추가합니다
        putJsonObject("owner") {
            put("name", "kotlin")
        }
        // 여러 JsonObject를 포함하는 JsonArray를 추가합니다
        putJsonArray("forks") {
            // JsonArray에 JsonObject를 추가합니다
            addJsonObject {
                put("votes", 42)
            }
            addJsonObject {
                put("votes", 9000)
            }
        }
    }
    // 결과 JSON 문자열을 출력합니다
    println(element)
    // {"name":"kotlinx.serialization","owner":{"name":"kotlin"},"forks":[{"votes":42},{"votes":9000}]}
}
//sampleEnd
```
{kotlin-runnable="true"}

### 리터럴 JSON 콘텐츠 인코딩하기 {id="encode-literal-json-content"}

JSON 사양은 숫자의 크기나 정밀도를 제한하지 않지만, 임의의 크기를 가진 숫자를 `JsonPrimitive()` 함수로 직렬화할 때 몇 가지 문제가 발생할 수 있습니다.

예를 들어 큰 숫자에 [`Double`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-double/)을 사용하면 값이 잘려 정밀도를 잃을 수 있습니다.
Kotlin/JVM [`BigDecimal`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/java.math.-big-decimal/)을 사용하는 경우 정밀도는 유지되지만, `JsonPrimitive()`는 값을 숫자가 아닌 문자열로 인코딩합니다.

```kotlin
// serialization 라이브러리에서 선언들을 import합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import java.math.BigDecimal

//sampleStart
val format = Json { prettyPrint = true }

fun main() {
    val pi = BigDecimal("3.141592653589793238462643383279")
    
    // BigDecimal을 Double로 변환하여 잠재적인 잘림(truncation)이 발생합니다
    val piJsonDouble = JsonPrimitive(pi.toDouble())
    // BigDecimal을 String으로 변환하여 정밀도는 유지하지만 JSON에서는 문자열로 취급됩니다
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

이 예제에서 `pi`는 소수점 30자리 숫자로 정의되었지만, 결과 JSON에서는 해당 정밀도가 유지되지 않습니다.
`Double` 값은 소수점 15자리로 잘리고, `String` 값은 따옴표로 묶여 숫자가 아닌 JSON 문자열이 됩니다.

이러한 문제를 방지하려면 [`JsonUnquotedLiteral()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-unquoted-literal.html) 함수를 사용하여 이 예제의 `pi` 문자열 값처럼 따옴표가 붙지 않는 임의의 값을 인코딩할 수 있습니다.

```kotlin
// serialization 라이브러리에서 선언들을 import합니다
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import java.math.BigDecimal

//sampleStart
val format = Json { prettyPrint = true }

fun main() {
    val pi = BigDecimal("3.141592653589793238462643383279")

    // JsonUnquotedLiteral()을 사용하여 원시 JSON 내용을 인코딩합니다
    @OptIn(ExperimentalSerializationApi::class)
    val piJsonLiteral = JsonUnquotedLiteral(pi.toString())

    // Double과 String으로 변환합니다
    val piJsonDouble = JsonPrimitive(pi.toDouble())
    val piJsonString = JsonPrimitive(pi.toString())

    val piObject = buildJsonObject {
        put("pi_literal", piJsonLiteral)
        put("pi_double", piJsonDouble)
        put("pi_string", piJsonString)
    }

    // 이제 pi_literal이 정의된 값과 정확히 일치합니다
    println(format.encodeToString(piObject))
    // "pi_literal": 3.141592653589793238462643383279,
    // "pi_double": 3.141592653589793,
    // "pi_string": "3.141592653589793238462643383279"
}
//sampleEnd
```
{kotlin-runnable="true"}

`pi`를 다시 `BigDecimal`로 디코딩하려면 `JsonPrimitive`의 문자열 내용을 추출합니다.

```kotlin
// serialization 라이브러리에서 선언들을 import합니다
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

    // JSON 문자열을 JsonObject로 디코딩합니다
    val piObject: JsonObject = Json.decodeFromString(piObjectJson)

    // JsonPrimitive에서 문자열 내용을 추출합니다
    val piJsonLiteral = piObject["pi_literal"]!!.jsonPrimitive.content

    // 문자열을 BigDecimal로 변환합니다
    val pi = BigDecimal(piJsonLiteral)
    // 30자리 소수점을 모두 보존한 디코딩된 pi 값을 출력합니다
    println(pi)
    // 3.141592653589793238462643383279
}
//sampleEnd
```
{kotlin-runnable="true"}

> 이 예제는 단순함을 위해 `JsonPrimitive`를 사용합니다. 보다 재사용 가능한 접근 방식은
> [JSON 구조 변환](serialization-transform-json.md)을 참조하세요.
>
{style="tip"}

#### JSON null 리터럴 {id="json-null-literal"}

일관되지 않은 상태가 생성되는 것을 방지하기 위해 `JsonUnquotedLiteral()` 함수로는 `"null"` 문자열을 인코딩할 수 없습니다.
인코딩을 시도하면 예외가 발생합니다.

```kotlin
// serialization 라이브러리에서 선언들을 import합니다
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

JSON `null` 리터럴 값을 나타내려면 [`JsonNull`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-null/)을 사용하세요.

```kotlin
// serialization 라이브러리에서 선언들을 import합니다
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

## JSON 요소 디코딩하기 {id="decode-json-elements"}

`JsonElement` 클래스의 인스턴스를 직렬화 가능한(serializable) 객체로 디코딩하려면
[`Json.decodeFromJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/decode-from-json-element.html) 함수를 사용합니다.

```kotlin
// serialization 라이브러리에서 선언들을 import합니다
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

    // JsonElement를 Project 객체로 디코딩합니다
    val data = Json.decodeFromJsonElement<Project>(element)
    println(data)
    // Project(name=kotlinx.serialization, language=Kotlin)
}
//sampleEnd
```
{kotlin-runnable="true"}

## 다음 단계 {id="what-s-next"}

* 데이터를 더욱 세밀하게 제어할 수 있는 [직렬화 및 역직렬화 중 JSON 변환](serialization-transform-json.md)에 대해 알아보세요.
* [클래스를 직렬화하는 방법](serialization-customization-options.md)과 `@Serializable` 애너테이션의 기본 동작을 수정하는 방법을 알아보세요.