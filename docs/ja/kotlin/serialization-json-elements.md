[//]: # (title: JSON要素)

Kotlin serialization は、構造レベルで JSON を操作することもサポートしています。
[`JsonElement`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-element/) API を使用すると、JSON 構造を Kotlin の型や文字列に変換する前に、直接検査、変更、および構築できます。

`JsonElement` には、コアとなる JSON 構造を表す3つの直接のサブタイプがあります。

* [`JsonPrimitive`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-primitive/) は、文字列、数値、真偽値、および `null` などのプリミティブな JSON 要素を扱います。`null` 値は、[`JsonNull`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-null/) と呼ばれる `JsonPrimitive` の特別なサブクラスによって表されます。
  各 `JsonPrimitive` はその値の文字列表現を保持しており、[`JsonPrimitive.content`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-primitive/content.html) プロパティを通じてアクセスできます。
* [`JsonArray`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-array/) は JSON 配列を表します。これは `JsonElement` 項目の Kotlin [`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/) です。
* [`JsonObject`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-object/) は JSON オブジェクトを表します。これは `String` のキーと `JsonElement` の値を持つ Kotlin [`Map`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/#kotlin.collections.Map) です。

## 文字列をJSON要素にパースする {id="parse-strings-to-json-elements"}

文字列を `JsonElement` にパースすることで、Kotlin の型や文字列に変換する前に JSON 構造を操作できます。

入力を行のデコードやデシリアライズをすることなく JSON 要素ツリーにパースするには、[`Json.parseToJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/parse-to-json-element.html) 関数を使用します。

```kotlin
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
fun main() {
    val element = Json.parseToJsonElement("""
        {"name":"kotlinx.serialization","language":"Kotlin"}
    """)
    // JsonElement.toString() は有効なJSON文字列を返します
    println(element)
    // {"name":"kotlinx.serialization","language":"Kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true"}

## JSON要素のコンテンツにアクセスする {id="access-the-contents-of-json-elements"}

`JsonElement` API の拡張プロパティを通じて、JSON 要素のコンテンツに直接アクセスできます。
これらの拡張プロパティは、要素を特定のサブタイプにキャストし、要素が期待される JSON 構造を持っていない場合は `IllegalArgumentException` をスローします。

利用可能な拡張プロパティは以下のとおりです。

* [`jsonPrimitive`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/json-primitive.html) は `JsonPrimitive` を返します。
* [`jsonArray`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/json-array.html) は `JsonArray` を返します。
* [`jsonObject`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/json-object.html) は `JsonObject` を返します。

同様に、[`JsonPrimitive`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-primitive/) には、値を Kotlin のプリミティブ型としてパースするための拡張プロパティがあります。例えば、[`int`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/int.html)、[`intOrNull`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/int-or-null.html)、[`long`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/long.html)、[`longOrNull`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/long-or-null.html) などです。

構造が既知の JSON データを処理する際に、これらの拡張プロパティをどのように使用できるかの例を以下に示します。

```kotlin
// シリアライゼーションライブラリから宣言をインポート
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
        // JsonObjectからforksキーにアクセス
        .jsonObject["forks"]!!

        // JsonArrayとして値にアクセスし、各JsonObjectからvotesの値をIntとして合計
        .jsonArray.sumOf { it.jsonObject["votes"]?.jsonPrimitive?.int ?: 0 }
    println(sum)
    // 9042
}
//sampleEnd
```
{kotlin-runnable="true"}

事前に JSON の構造がわからない場合は、要素の型をチェックして、各 `JsonElement` のサブタイプを明示的に処理できます。
例えば、`when` 式を使用したヘルパー関数を利用できます。

```kotlin
fun processElement(element: JsonElement): String = when (element) {
    is JsonObject -> "JsonObject with keys: ${element.keys}"
    is JsonArray -> "JsonArray with ${element.size} elements"
    is JsonPrimitive -> "JsonPrimitive with content: ${element.content}"
}
```

## JSON要素を作成する {id="create-json-elements"}

特定の `JsonElement` サブタイプのインスタンスを直接作成できます。

`JsonPrimitive` を作成するには、`JsonPrimitive()` 関数を使用します。

```kotlin
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
fun main() {
    // さまざまなKotlinプリミティブからJsonPrimitive値を作成
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

`JsonArray` および `JsonObject` 要素は、直接コンストラクタを呼び出すか、ビルダー関数を使用して作成できます。

* `List` から `JsonArray` を作成するには、[`JsonArray()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-array/-json-array.html) を使用するか、[`buildJsonArray()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/build-json-array.html) ビルダー関数を使用します。
* `Map` から `JsonObject` を作成するには、[`JsonObject()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-object/-json-object.html) を使用するか、[`buildJsonObject()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/build-json-object.html) ビルダー関数を使用します。

ビルダー関数は、[Kotlin 標準ライブラリのコレクションビルダー](constructing-collections.md#create-with-collection-builder-functions) に似た DSL を提供し、JSON 固有のオーバーロードや内部ビルダー関数を備えています。

以下は、JSON ビルダー DSL の主な機能を示す例です。

```kotlin
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
fun main() {
    val element = buildJsonObject {
        // JsonObjectにシンプルなキー・値のペアを追加
        put("name", "kotlinx.serialization")
        // ownerキーの下にネストされたJsonObjectを追加
        putJsonObject("owner") {
            put("name", "kotlin")
        }
        // 複数のJsonObjectを持つJsonArrayを追加
        putJsonArray("forks") {
            // JsonArrayにJsonObjectを追加
            addJsonObject {
                put("votes", 42)
            }
            addJsonObject {
                put("votes", 9000)
            }
        }
    }
    // 結果のJSON文字列を出力
    println(element)
    // {"name":"kotlinx.serialization","owner":{"name":"kotlin"},"forks":[{"votes":42},{"votes":9000}]}
}
//sampleEnd
```
{kotlin-runnable="true"}

### リテラルJSONコンテンツをエンコードする {id="encode-literal-json-content"}

JSON の仕様では数値のサイズや精度に制限はありませんが、`JsonPrimitive()` 関数を使用して任意のサイズの数値をシリアライズすると、いくつかの問題が発生する可能性があります。

例えば、大きな数値に [`Double`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-double/) を使用すると、値が切り捨てられて精度が失われる可能性があります。
Kotlin/JVM の [`BigDecimal`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/java.math.-big-decimal/) を使用すると、精度は保たれますが、`JsonPrimitive()` はその値を数値としてではなく文字列としてエンコードします。

```kotlin
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import java.math.BigDecimal

//sampleStart
val format = Json { prettyPrint = true }

fun main() {
    val pi = BigDecimal("3.141592653589793238462643383279")
    
    // BigDecimalをDoubleに変換（切り捨てが発生する可能性あり）
    val piJsonDouble = JsonPrimitive(pi.toDouble())
    // BigDecimalをStringに変換（精度は維持されるが、JSONでは文字列として扱われる）
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

この例では、`pi` が小数第30位までの数値として定義されているにもかかわらず、生成された JSON はその精度を保持していません。
`Double` の値は小数第15位までに切り捨てられ、`String` の値は引用符で囲まれるため、数値ではなく JSON 文字列になってしまいます。

これらの問題を回避するために、[`JsonUnquotedLiteral()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-unquoted-literal.html) 関数を使用して、この例の `pi` の文字列値のような、引用符で囲まれていない任意の値をエンコードできます。

```kotlin
// シリアライゼーションライブラリから宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import java.math.BigDecimal

//sampleStart
val format = Json { prettyPrint = true }

fun main() {
    val pi = BigDecimal("3.141592653589793238462643383279")

    // JsonUnquotedLiteral()を使用して生のJSONコンテンツをエンコード
    @OptIn(ExperimentalSerializationApi::class)
    val piJsonLiteral = JsonUnquotedLiteral(pi.toString())

    // DoubleおよびStringに変換
    val piJsonDouble = JsonPrimitive(pi.toDouble())
    val piJsonString = JsonPrimitive(pi.toString())

    val piObject = buildJsonObject {
        put("pi_literal", piJsonLiteral)
        put("pi_double", piJsonDouble)
        put("pi_string", piJsonString)
    }

    // pi_literalは定義された値と正確に一致するようになります
    println(format.encodeToString(piObject))
    // "pi_literal": 3.141592653589793238462643383279,
    // "pi_double": 3.141592653589793,
    // "pi_string": "3.141592653589793238462643383279"
}
//sampleEnd
```
{kotlin-runnable="true"}

`pi` を `BigDecimal` にデコードし直すには、`JsonPrimitive` の文字列コンテンツを抽出します。

```kotlin
// シリアライゼーションライブラリから宣言をインポート
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

    // JSON文字列をJsonObjectにデコード
    val piObject: JsonObject = Json.decodeFromString(piObjectJson)

    // JsonPrimitiveから文字列コンテンツを抽出
    val piJsonLiteral = piObject["pi_literal"]!!.jsonPrimitive.content

    // 文字列をBigDecimalに変換
    val pi = BigDecimal(piJsonLiteral)
    // 30桁すべての小数部を保持した状態でデコードされたpiの値を出力
    println(pi)
    // 3.141592653589793238462643383279
}
//sampleEnd
```
{kotlin-runnable="true"}

> この例では単純化のために `JsonPrimitive` を使用しています。より再利用可能なアプローチについては、[JSON 構造の変換](serialization-transform-json.md) を参照してください。
>
{style="tip"}

#### JSONのnullリテラル {id="json-null-literal"}

不整合な状態の作成を防ぐため、`JsonUnquotedLiteral()` 関数で文字列 `"null"` をエンコードすることはできません。
エンコードしようとすると、例外がスローされます。

```kotlin
// シリアライゼーションライブラリから宣言をインポート
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

JSON の `null` リテラル値を表すには、[`JsonNull`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-null/) を使用します。

```kotlin
// シリアライゼーションライブラリから宣言をインポート
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

## JSON要素をデコードする {id="decode-json-elements"}

`JsonElement` クラスのインスタンスをシリアライズ可能なオブジェクトにデコードするには、[`Json.decodeFromJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/decode-from-json-element.html) 関数を使用します。

```kotlin
// シリアライゼーションライブラリから宣言をインポート
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

    // JsonElementをProjectオブジェクトにデコード
    val data = Json.decodeFromJsonElement<Project>(element)
    println(data)
    // Project(name=kotlinx.serialization, language=Kotlin)
}
//sampleEnd
```
{kotlin-runnable="true"}

## 次のステップ {id="what-s-next"}

* データをより詳細に制御するための [シリアライズおよびデシリアライズ時の JSON 変換](serialization-transform-json.md) について確認してください。
* [クラスのシリアライズ方法](serialization-customization-options.md) および `@Serializable` アノテーションのデフォルトの動作を変更する方法について学習してください。