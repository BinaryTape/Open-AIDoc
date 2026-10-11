[//]: # (title: 序列化內建型別)

Kotlin 序列化支援多種內建型別，包括基本型別（例如基元型別和字串），以及特定的標準函式庫類別。
以下章節將詳細介紹這些型別，並展示如何序列化它們。

## 基本型別 {id="basic-types"}

Kotlin 序列化為在序列化資料中表示為單一值的型別提供了內建序列化器。
這包括基元型別、字串和列舉。

例如，以下是如何序列化 `Long` 型別：

```kotlin
// 匯入必要的程式庫宣告
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

### 數字 {id="numbers"}

你可以使用自然的 JSON 表示法來序列化所有 Kotlin 數字型別，包括整數和浮點數：

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

### 無正負號數字 {id="unsigned-numbers"}

Kotlin 序列化支援 Kotlin 的[無正負號整數型別](unsigned-integer-types.md)，例如 `UByte` 和 `UInt`。
在 JSON 中，這些值會被序列化為一般的 JSON 數字，並保留其完整的無正負號範圍：

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

> 雖然 JSON 保留了無正負號數字的完整範圍，但其他序列化格式的處理方式可能有所不同。
> 例如，ProtoBuf 和 CBOR 會使用其有正負號的對應型別來序列化這些型別。
>
{style="note"} 

### 以字串表示 `Long` 數字 {id="long-numbers-as-strings"}

你可以在 JSON 中將 `Long` 數字表示為字串。
這在 JavaScript 環境中非常有用，因為 JavaScript 的 `Number` 型別無法精確表示所有 Kotlin 的 `Long` 值，進而可能導致精度損失。

搭配 `@Serializable` 註解使用 [`LongAsStringSerializer`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization.builtins/-long-as-string-serializer/)，可將 `Long` 值在 JSON 中編碼為字串：

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

> 你也可以為檔案中的所有屬性指定類似 `LongAsStringSerializer` 的序列化器。
> 如需更多資訊，請參閱[為檔案指定序列化器](serialization-create-and-use-serializers.md#specify-a-serializer-for-a-file)。
>
{style="tip"}

### 列舉類別 {id="enum-classes"}

所有 `enum` 類別在預設情況下都可序列化，不需要加上 `@Serializable` 註解。
當在 JSON 中序列化時，`enum` 會被編碼為字串：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 列舉類別不需要 @Serializable 註解
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

> 當以 Kotlin/JS 或 Kotlin/Native 為目標平台時，若要將 `enum` 類別用作根物件（例如在 `encodeToString<Status>(Status.SUPPORTED)` 中），則必須為其加上 `@Serializable` 註解。
>
{style="note"}

#### 自訂列舉項目的序列化名稱 {id="customize-serial-names-of-enum-entries"}

若要自訂列舉項目的序列化名稱，請使用 `@SerialName` 註解，並將列舉類別標記為 `@Serializable`：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 由於使用了 @SerialName，因此需要 @Serializable 註解
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

如需自訂序列化名稱的詳細資訊，請參閱[自訂序列化名稱](serialization-customization-options.md#customize-serial-names)。

## 標準函式庫型別 {id="standard-library-types"}

Kotlin 序列化支援標準函式庫中的多種型別，但部分類別（例如範圍區間和 [`Regex`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-regex/) 類別）不受支援。

### Pair 與 Triple {id="pair-and-triple"}

你可以序列化 Kotlin 標準函式庫中的 [`Pair`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-pair/) 和 [`Triple`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-triple/) 類別：

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

### 集合 {id="collections"}

Kotlin 序列化支援集合型別，包括 [`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/)、[`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/) 和 [`Map`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/) 的唯讀與可變變體。
它也支援具體實作，例如 [`ArrayList`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-array-list/) 和 [`LinkedHashSet`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-linked-hash-set/)，以及泛型和基元陣列型別。
這些集合的表示方式取決於序列化格式。

在 JSON 中，清單與集合會被序列化為 JSON 陣列，而映射則會表示為 JSON 物件。

Kotlin 使用宣告的型別來反序列化 JSON。
在反序列化期間，結果物件的型別由原始碼中指定的靜態型別決定。
此型別可以是屬性的型別，也可以是解碼函式的型別參數。

#### 序列化 List {id="serialize-lists"}

Kotlin 序列化會將 [`List`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/) 型別序列化為 JSON 陣列。
以下是類別清單的範例：

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

#### 序列化 Set {id="serialize-sets"}

[`Set`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-set/) 型別會被序列化為 JSON 陣列，就像 [`List` 型別](#serialize-lists)一樣：

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

> 預設情況下，你可以反序列化包含重複項目的 Set。處理重複項目的行為取決於具體實作。
> 
{style="tip"}

#### 序列化 Map {id="serialize-maps"}

Kotlin 序列化支援具有基元或列舉鍵的 [`Map`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/) 型別：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(val name: String)

fun main() {
    // 建立具有 Int 鍵的 map
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

Map 的序列化取決於格式。
在 JSON 中，Map 會表示為物件。由於 JSON 物件的鍵一律為字串，因此即使鍵在 Kotlin 中是數字，也會被編碼為字串。
其他格式（例如 CBOR）則支援具有非基元鍵的 Map，並按原樣保留。

> JSON 原生不支援複雜或複合鍵。
> 若要將結構化物件編碼為 Map 的鍵，請參閱[允許結構化 Map 鍵](serialization-json-configuration.md#allow-structured-map-keys)。
>
{style="note"}

#### 集合的反序列化行為 {id="deserialization-behavior-of-collections"}

Kotlin 使用宣告的型別來反序列化 JSON。
例如在集合中，`List` 會保留重複項目，而 `Set` 則強制元素具唯一性：

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
    // 重複項目會從 data.b 中移除，因為 Set 型別會強制元素唯一
    println(data)
    // Data(a=[42, 42], b=[42])
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-collections"}

> 如需更多關於 Kotlin 集合的資訊，請參閱[集合概觀](collections-overview.md)。
>
{style="tip"}

### Unit 與單例物件 {id="unit-and-singleton-objects"}

Kotlin 的 [`Unit`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-unit/) 型別與其他單例物件皆可序列化。
[單例](object-declarations.md)是指只有一個執行個體的類別，其狀態由物件本身決定，而非由外部屬性決定。
在 JSON 中，單例物件會被序列化為空結構：

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

> 你可以在[封閉多型階層結構](serialization-polymorphism.md#serialize-closed-polymorphic-classes)中使用序列化的單例物件，
> 來表示沒有額外欄位的情況。
>
{style="tip"}

### Duration 與 Instant {id="duration-and-instant"}

Kotlin 的 [`Duration`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) 型別會使用 ISO-8601-2 格式序列化為字串：

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

你也可以使用 ISO-8601-1 格式將 Kotlin 的 [`Instant`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.time/-instant/) 型別
序列化為代表時間點的字串：

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

[`Nothing`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-nothing.html) 型別預設為可序列化。
由於它沒有任何執行個體，因此對其進行編碼或解碼將會拋出例外。
當某個型別在語法上是必需的，但未參與序列化時，可以使用 `Nothing`，例如在[具有泛型基底型別的多型階層結構](serialization-polymorphism.md#serialize-generic-subtypes-in-a-polymorphic-hierarchy)中：

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

## 後續步驟 {id="what-s-next"}

* 深入探索[序列化類別](serialization-customization-options.md)，了解如何序列化類別以及如何修改 `@Serializable` 註解的預設行為。
* 若要探索更複雜的 JSON 序列化案例，請參閱 [JSON 序列化概觀](serialization-configure-json-serialization.md)。
* 在[序列化多型類別](serialization-polymorphism.md)中，進一步了解多型以及如何透過共用基底型別來序列化不同型別。