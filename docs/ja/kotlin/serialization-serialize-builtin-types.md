[//]: # (title: 組み込み型のシリアライズ)

Kotlinシリアライゼーション（Kotlin serialization）は、プリミティブ型や文字列などの基本型や、特定の標準ライブラリのクラスを含む、さまざまな組み込み型をサポートしています。
以下のセクションでは、これらの型について詳しく説明し、シリアライズ方法を示します。

## 基本型 {id="basic-types"}

Kotlinシリアライゼーションは、シリアライズされたデータ内で単一の値として表される型に対して、組み込みのシリアライザーを提供します。
これには、プリミティブ、文字列、列挙型（enum）が含まれます。

例えば、`Long` 型をシリアライズする方法は次のとおりです。

```kotlin
// 必要なライブラリの宣言をインポート
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Data(val signature: Long)

fun main() {
    val data = Data(0x1CAFE2FEED0BABE0)
    println(Json.encodeToString(data))
    // {"signature":2067120338512882656}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-long-class"}

### 数値 {id="numbers"}

整数や浮動小数点数を含むすべてのKotlinの数値型は、JSONの自然な表現を使用してシリアライズできます。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlin.math.PI

//sampleStart
@Serializable
class Data(
    val answer: Int,
    val pi: Double
)                     

fun main() {
    val data = Data(42, PI)
    println(Json.encodeToString(data))
    // {"answer":42,"pi":3.141592653589793}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-numbers"}

### 符号なし数値 {id="unsigned-numbers"}

Kotlinシリアライゼーションは、`UByte` や `UInt` などのKotlinの[符号なし整数型](unsigned-integer-types.md)をサポートしています。
JSONでは、これらの値は通常のJSON数値としてシリアライズされ、完全な符号なしの範囲が保持されます。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Counter(val counted: UByte, val description: String)

fun main() {
    val counted = 239.toUByte()
    println(Json.encodeToString(Counter(counted, "tries")))
    // {"counted":239,"description":"tries"}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-unsigned-numbers"}

> JSONでは符号なし数値の全範囲が保持されますが、他のシリアライゼーションフォーマットでは扱いが異なる場合があります。
> 例えば、ProtoBufやCBORでは、これらの型は対応する符号付きの型を使用してシリアライズされます。
>
{style="note"} 

### 文字列としての `Long` 数値 {id="long-numbers-as-strings"}

JSONで `Long` 数値を文字列として表現できます。
これは、JavaScriptの `Number` 型がKotlinのすべての `Long` 値を正確に表現できず、精度の低下につながる可能性があるJavaScript環境で役立ちます。

[`LongAsStringSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.builtins/-long-as-string-serializer/) を `@Serializable` アノテーションと共に使用することで、JSON内で `Long` 値を文字列としてエンコードします。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.builtins.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Data(
    @Serializable(LongAsStringSerializer::class)
    val signature: Long
)

fun main() {
    val data = Data(0x1CAFE2FEED0BABE0)
    println(Json.encodeToString(data))
    // {"signature":"2067120338512882656"}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-long-as-string"}

> ファイル内のすべてのプロパティに対して `LongAsStringSerializer` などのシリアライザーを指定することもできます。
> 詳細については、[ファイルに対するシリアライザーの指定](serialization-create-and-use-serializers.md#specify-a-serializer-for-a-file)を参照してください。
>
{style="tip"}

### Enum クラス {id="enum-classes"}

すべての `enum` クラスは、`@Serializable` アノテーションがなくてもデフォルトでシリアライズ可能です。
JSONでシリアライズされる場合、`enum` は文字列としてエンコードされます。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// enum クラスには @Serializable アノテーションは不要です
enum class Status { SUPPORTED }

@Serializable
class Project(val name: String, val status: Status) 

fun main() {
    val data = Project("kotlinx.serialization", Status.SUPPORTED)
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","status":"SUPPORTED"}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-enum"}

> Kotlin/JSまたはKotlin/Nativeをターゲットにする場合、`encodeToString<Status>(Status.SUPPORTED)` のように `enum` クラスをルートオブジェクトとして使用するには、その `enum` クラスに `@Serializable` アノテーションを付与する必要があります。
>
{style="note"}

#### Enum エントリのシリアル名のカスタマイズ {id="customize-serial-names-of-enum-entries"}

Enumエントリのシリアル名をカスタマイズするには、`@SerialName` アノテーションを使用し、enumクラスに `@Serializable` を付与します。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// @SerialName を使用するため @Serializable アノテーションが必要です
@Serializable
enum class Status { @SerialName("maintained") SUPPORTED }

@Serializable
class Project(val name: String, val status: Status) 

fun main() {
    val data = Project("kotlinx.serialization", Status.SUPPORTED)
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","status":"maintained"}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-enum-serialname"}

シリアル名のカスタマイズに関する詳細については、[シリアル名のカスタマイズ](serialization-customization-options.md#customize-serial-names)を参照してください。

## 標準ライブラリの型 {id="standard-library-types"}

Kotlinシリアライゼーションは標準ライブラリのいくつかの型をサポートしていますが、範囲（range）や [`Regex`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-regex/) クラスなどの一部のクラスはサポートされていません。

### Pair と Triple {id="pair-and-triple"}

Kotlin標準ライブラリの [`Pair`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-pair/) および [`Triple`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-triple/) クラスをシリアライズできます。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(val name: String)

fun main() {
    val pair = 1 to Project("kotlinx.serialization")
    println(Json.encodeToString(pair))
    // {"first":1,"second":{"name":"kotlinx.serialization"}}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-pair"}

### コレクション {id="collections"}

Kotlinシリアライゼーションは、[`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/)、[`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/)、および [`Map`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/) の読み取り専用および可変バリアントを含むコレクション型をサポートしています。
また、[`ArrayList`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-array-list/) や [`LinkedHashSet`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-linked-hash-set/) などの具象実装、およびジェネリック配列やプリミティブ配列の型もサポートしています。
これらのコレクションがどのように表現されるかは、シリアライゼーションフォーマットに依存します。

JSONでは、リストとセットはJSON配列としてシリアライズされ、マップはJSONオブジェクトとして表現されます。

KotlinはJSONのデシリアライズに宣言された型を使用します。
デシリアライズ中、結果のオブジェクトの型はソースコードで指定された静的型によって決定されます。
この型は、プロパティの型またはデコード関数の型パラメータのいずれかになります。

#### リストのシリアライズ {id="serialize-lists"}

Kotlinシリアライゼーションは、[`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/) 型をJSON配列としてシリアライズします。
クラスのリストの例を以下に示します。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(val name: String)

fun main() {
    val list = listOf(
        Project("kotlinx.serialization"),
        Project("kotlinx.coroutines")    
    )
    println(Json.encodeToString(list))
    // [{"name":"kotlinx.serialization"},{"name":"kotlinx.coroutines"}]
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-list"}

#### セットのシリアライズ {id="serialize-sets"}

[`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/) 型は、[`List` 型](#serialize-lists)と同様にJSON配列としてシリアライズされます。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(val name: String)

fun main() {
    val set = setOf(
        Project("kotlinx.serialization"),
        Project("kotlinx.coroutines")    
    )
    println(Json.encodeToString(set))
    // [{"name":"kotlinx.serialization"},{"name":"kotlinx.coroutines"}]
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-set"}

> デフォルトでは、重複するエントリを含むセットをデシリアライズできます。重複の処理動作は実装によって定義されます。
> 
{style="tip"}

#### マップのシリアライズ {id="serialize-maps"}

Kotlinシリアライゼーションは、プリミティブ型またはenumのキーを持つ [`Map`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/) 型をサポートしています。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(val name: String)

fun main() {
    // Int型のキーを持つマップを作成
    val map = mapOf(
        1 to Project("kotlinx.serialization"),
        2 to Project("kotlinx.coroutines")    
    )
    println(Json.encodeToString(map))
    // {"1":{"name":"kotlinx.serialization"},"2":{"name":"kotlinx.coroutines"}}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-map"}

マップのシリアライゼーションはフォーマットに依存します。
JSONでは、マップはオブジェクトとして表現されます。JSONオブジェクトのキーは常に文字列であるため、Kotlinで数値であってもキーは文字列としてエンコードされます。
CBORなどの他のフォーマットは、非プリミティブキーを持つマップをサポートし、そのまま保持します。

> JSONはネイティブでは複合キー（複雑なキー）をサポートしていません。
> 構造化オブジェクトをマップのキーとしてエンコードする方法については、[構造化されたマップキーの許可](serialization-json-configuration.md#allow-structured-map-keys)を参照してください。
>
{style="note"}

#### コレクションのデシリアライズ動作 {id="deserialization-behavior-of-collections"}

KotlinはJSONのデシリアライズに宣言された型を使用します。
例えばコレクションの場合、`List` は重複を保持しますが、`Set` は一意性を強制します。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Data(
    val a: List<Int>,
    val b: Set<Int>
)

fun main() {
    val data = Json.decodeFromString<Data>("""
        {
            "a": [42, 42],
            "b": [42, 42]
        }
    """)
    // Set型は要素の一意性を強制するため、data.b から重複が削除されます
    println(data)
    // Data(a=[42, 42], b=[42])
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-collections"}

> Kotlinのコレクションに関する詳細については、[コレクションの概要](collections-overview.md)を参照してください。
>
{style="tip"}

### Unit とシングルトンオブジェクト {id="unit-and-singleton-objects"}

Kotlinの [`Unit`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-unit/) 型およびその他のシングルトンオブジェクトはシリアライズ可能です。
[シングルトン](object-declarations.md)とはインスタンスが1つしか存在しないクラスであり、その状態は外部プロパティではなくオブジェクト自体によって定義されます。
JSONでは、シングルトンオブジェクトは空の構造体としてシリアライズされます。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
object SerializationVersion {
    val libraryVersion: String = "1.0.0"
}

fun main() {
    println(Json.encodeToString(SerializationVersion))
    // {}
    println(Json.encodeToString(Unit))
    // {}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-singleton"}

> シリアライズされたシングルトンオブジェクトは、[閉じたポリモーフィック階層](serialization-polymorphism.md#serialize-closed-polymorphic-classes)において、追加フィールドのないケースを表現するために使用できます。
>
{style="tip"}

### Duration と Instant {id="duration-and-instant"}

Kotlinの [`Duration`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) 型は、ISO-8601-2形式を使用して文字列にシリアライズされます。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlin.time.*

//sampleStart
fun main() {
    val duration = 1000.toDuration(DurationUnit.SECONDS)
    println(Json.encodeToString(duration))
    // "PT16M40S"
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-duration"}

Kotlinの [`Instant`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/-instant/) 型も、ISO-8601-1形式を使用して時点を表す文字列としてシリアライズできます。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlin.time.*

//sampleStart
fun main() {
    val instant = Instant.fromEpochMilliseconds(1607505416124)
    println(Json.encodeToString(instant))
    // "2020-12-09T09:16:56.124Z"
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.2" id="serialize-instant"}

### Nothing {id="nothing"}

[`Nothing`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-nothing.html) 型はデフォルトでシリアライズ可能です。
これにはインスタンスが存在しないため、エンコードまたはデコードしようとすると例外がスローされます。
[ジェネリック基底型を持つポリモーフィック階層](serialization-polymorphism.md#serialize-generic-subtypes-in-a-polymorphic-hierarchy)のように、構文上型が必要であってもシリアライゼーションには関与しない場合に `Nothing` を使用します。

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.builtins.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
sealed class ParametrizedParent<out R> {
    @Serializable
    data class ChildWithoutParameter(val value: Int) : ParametrizedParent<Nothing>()
}

fun main() {
    println(Json.encodeToString(ParametrizedParent.ChildWithoutParameter(42)))
    // {"value":42}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-nothing"}

## 次のステップ {id="what-s-next"}

* クラスのシリアライズ方法や、`@Serializable` アノテーションのデフォルトの動作を変更する方法については、[クラスのシリアライズ](serialization-customization-options.md)をご覧ください。
* より複雑なJSONシリアライゼーションのシナリオを探るには、[JSONシリアライゼーションの概要](serialization-configure-json-serialization.md)を参照してください。
* ポリモーフィズムや、共通の基底クラスを通じた異なる型のシリアライズの詳細については、[ポリモーフィックなクラスのシリアライズ](serialization-polymorphism.md)を参照してください。