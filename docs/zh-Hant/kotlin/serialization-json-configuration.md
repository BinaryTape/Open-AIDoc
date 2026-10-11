[//]: # (title: 自訂 Json 執行個體)

預設的 [`Json`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/-default/) 執行個體嚴格遵循 JSON 規範以及 Kotlin 類別中的宣告。

你可以透過 [`Json()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json.html) 建構函式建立自訂的 `Json` 執行個體，以使用更具彈性的 JSON 功能或型別轉換：

```kotlin
// 基於預設配置建立一個 Json 執行個體，允許特殊浮點值
val customJson = Json {
    allowSpecialFloatingPointValues = true
}

// 使用與預設相同的語法，透過 customJson 執行個體將物件編碼為字串
val jsonString = customJson.encodeToString(Data(Double.NaN))
println(jsonString)
```

以這種方式建立的 `Json` 執行個體是不可變（immutable）且執行緒安全的（thread-safe），因此可以安全地儲存在頂層屬性中以供重複使用。

> 重複使用自訂的 `Json` 執行個體可以快取類別專屬的資訊，進而提升效能。
>
{style="tip"}

你也可以基於現有的 `Json` 執行個體，使用相同的 builder 語法修改其設定來建立新執行個體：

```kotlin
// 基於現有 Json 建立新執行個體
val lenientJson = Json(customJson) {
    isLenient = true
    prettyPrint = true
}
```

## 自訂 JSON 結構 {id="customize-json-structure"}

你可以自訂 `Json` 執行個體在編碼與解碼期間組織結構化資料的方式。
這能讓你控制哪些值會出現在輸出中，以及特定型別如何表示。

### 編碼預設值 {id="encode-default-values"}

預設情況下，JSON 編碼器會省略預設屬性值，因為在解碼時這些值會自動套用至缺失的屬性上。
此行為對於預設值為 null 的可 null 屬性特別有用，因為它可以避免寫入不必要的 `null` 值。
如需更多詳細資訊，請參閱[管理預設屬性的序列化](serialization-customization-options.md#manage-the-serialization-of-default-properties-with-encodedefault)一節。

若要變更此預設行為，請在 `Json` 執行個體中將 [`encodeDefaults`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/encode-defaults.html) 屬性設為 `true`：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 設定 Json 執行個體以編碼預設值
val format = Json { encodeDefaults = true }

@Serializable
class Project(
    val name: String,
    val language: String = "Kotlin",
    val website: String? = null
)

fun main() {
    val data = Project("kotlinx.serialization")

    // 編碼所有屬性值，包含預設值
    println(format.encodeToString(data))
    // {"name":"kotlinx.serialization","language":"Kotlin","website":null}
}
//sampleEnd
```
{kotlin-runnable="true" id="encode-default-values-example"}

### 省略明確的 null {id="omit-explicit-nulls"}

預設情況下，所有 `null` 值都會被編碼到 JSON 輸出中。
若要省略 `null` 值，請在 `Json` 執行個體中將 [`explicitNulls`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/explicit-nulls.html) 屬性設為 `false`：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 設定 Json 執行個體在序列化期間省略 null 值
val format = Json { explicitNulls = false }

@Serializable
data class Project(
    val name: String,
    val language: String,
    val version: String? = "1.2.2",
    val website: String?,
    val description: String? = null
)

fun main() {
    val data = Project("kotlinx.serialization", "Kotlin", null, null, null)
    val json = format.encodeToString(data)

    // 從 JSON 輸出中省略 version、website 和 description 屬性
    println(json)
    // {"name":"kotlinx.serialization","language":"Kotlin"}

    // 將沒有預設值的缺失可 null 屬性視為 null
    // 將具有預設值的屬性填入其預設值
    println(format.decodeFromString<Project>(json))
    // Project(name=kotlinx.serialization, language=Kotlin, version=1.2.2, website=null, description=null)
}
//sampleEnd
```
{kotlin-runnable="true" id="omit-nulls-example"}

當 `explicitNulls` 設為 `false` 時，編碼與解碼可能會呈現不對稱。
在此範例中，`version` 屬性在編碼前為 `null`，但解碼後會變成 `1.2.2`。

> 你可以透過 [`coerceInputValues`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/coerce-input-values.html) 屬性來設定解碼器，將某些無效的輸入值視為缺失屬性處理。
> 欲了解更多資訊，請參閱[強制轉換輸入值](#coerce-input-values)一節。
>
{style="tip"}

### 允許結構化 Map 鍵 {id="allow-structured-map-keys"}

JSON 格式原生不支援具有結構化鍵的 Map，因為 JSON 的鍵必須是僅代表基本型別或列舉的字串。
若要序列化與反序列化以自訂類別作為鍵的 Map，請使用 [`allowStructuredMapKeys`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/allow-structured-map-keys.html) 屬性：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 設定 Json 執行個體以編碼具有結構化鍵的 Map
val format = Json { allowStructuredMapKeys = true }

@Serializable
data class Project(val name: String)

fun main() {
    val map = mapOf(
        Project("kotlinx.serialization") to "Serialization",
        Project("kotlinx.coroutines") to "Coroutines"
    )
    // 將帶有結構化鍵的 Map 序列化為 JSON 陣列：
    // [key1, value1, key2, value2,...]
    println(format.encodeToString(map))
    // [{"name":"kotlinx.serialization"},"Serialization",{"name":"kotlinx.coroutines"},"Coroutines"]
}
//sampleEnd
```
{kotlin-runnable="true" id="allow-structured-map-keys-example"}

### 允許特殊浮點值 {id="allow-special-floating-point-values"}

預設情況下，特殊浮點值（例如 [`Double.NaN`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-double/-na-n.html)
和無限大）在 JSON 中是不受支援的，因為 [JSON 規範](https://datatracker.ietf.org/doc/html/rfc8259#section-6)禁止使用它們。

若要啟用它們的編碼與解碼，請在 `Json` 執行個體中將 [`allowSpecialFloatingPointValues`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/allow-special-floating-point-values.html) 屬性設為 `true`：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 設定 Json 執行個體以允許特殊浮點值
val format = Json { allowSpecialFloatingPointValues = true }

@Serializable
class Data(
    val value: Double
)

fun main() {
    val data = Data(Double.NaN)
    // 產生用於表示特殊浮點值的非標準 JSON 輸出
    println(format.encodeToString(data))
    // {"value":NaN}
}
//sampleEnd
```
{kotlin-runnable="true" id="allow-special-float-point-example"}

### 指定多型類別鑑別器 {id="specify-class-discriminator-for-polymorphism"}

在處理[多型資料](serialization-polymorphism.md)時，你可以使用
[`classDiscriminator`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/class-discriminator.html) 屬性來指定一個鍵名，以識別已序列化多型物件的型別。
結合[透過 `@SerialName` 註解定義的明確序列化名稱](serialization-customization-options.md#customize-serial-names)，
這種方法可以讓你完全掌控最終產生的 JSON 結構：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 設定 Json 執行個體以使用自訂的類別鑑別器
val format = Json { classDiscriminator = "#class" }

@Serializable
sealed class Project {
    abstract val name: String
}

// 為 OwnedProject 類別指定自訂的序列化名稱
@Serializable
@SerialName("owned")
class OwnedProject(override val name: String, val owner: String) : Project()

// 為 SimpleProject 類別指定自訂的序列化名稱
@Serializable
@SerialName("simple")
class SimpleProject(override val name: String) : Project()

fun main() {
    val simpleProject: Project = SimpleProject("kotlinx.serialization")
    val ownedProject: Project = OwnedProject("kotlinx.coroutines", "kotlin")

    // 序列化 SimpleProject，包含 #class: "simple"
    println(format.encodeToString(simpleProject))
    // {"#class":"simple","name":"kotlinx.serialization"}

    // 序列化 OwnedProject，包含 #class: "owned"
    println(format.encodeToString(ownedProject))
    // {"#class":"owned","name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true" id="class-discriminator-example"}

雖然 `Json` 執行個體中的 `classDiscriminator` 屬性可讓你為所有多型型別指定單一鑑別器鍵，但[實驗性](components-stability.md#stability-levels-explained)的 [`@JsonClassDiscriminator`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-class-discriminator/) 註解提供了更大的彈性。
它允許你直接在基底類別上定義自訂鑑別器，並自動由其所有子類別繼承。

> 若要進一步了解可繼承的序列化註解，請參閱 [`@InheritableSerialInfo`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-inheritable-serial-info/)。
> 
{style="tip"}

以下是一個範例：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// @JsonClassDiscriminator 註解是可繼承的，因此 Base 的所有子類別都將具有相同的鑑別器
@Serializable
@OptIn(ExperimentalSerializationApi::class)
@JsonClassDiscriminator("message_type")
sealed class Base

// 從 Base 繼承鑑別器
@Serializable
sealed class ErrorClass: Base()

// 定義一個結合了訊息與可選錯誤的類別
@Serializable
data class Message(val message: Base, val error: ErrorClass?)

@Serializable
@SerialName("my.app.BaseMessage")
data class BaseMessage(val message: String) : Base()

@Serializable
@SerialName("my.app.GenericError")
data class GenericError(@SerialName("error_code") val errorCode: Int) : ErrorClass()

val format = Json { classDiscriminator = "#class" }

fun main() {
    val data = Message(BaseMessage("not found"), GenericError(404))
    // 對所有子類別使用來自 Base 的鑑別器
    println(format.encodeToString(data))
    // {"message":{"message_type":"my.app.BaseMessage","message":"not found"},"error":{"message_type":"my.app.GenericError","error_code":404}}
}
//sampleEnd
```
{kotlin-runnable="true" id="jsonclass-discriminator-example"}

> 你無法在密封基底類別的子類別中指定不同的類別鑑別器。
> 只有具有相異、不重疊子類別的階層結構，才能定義自己的鑑別器。
> 
> 當兩者皆指定了鑑別器時，`@JsonClassDiscriminator` 的優先級高於 `Json` 設定中的設定。
>
{style="note"}

### 設定類別鑑別器輸出模式 {id="set-class-discriminator-output-mode"}

使用 [`JsonBuilder.classDiscriminatorMode`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/class-discriminator-mode.html) 屬性來控制如何將類別鑑別器新增至你的 JSON 輸出中。
預設情況下，[僅為多型型別新增鑑別器](#specify-class-discriminator-for-polymorphism)，這在處理[多型類別階層結構](serialization-polymorphism.md)時非常實用。

若要調整此行為，請將 [`ClassDiscriminatorMode`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-class-discriminator-mode/) 屬性設為下列選項之一：

* [`POLYMORPHIC`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-class-discriminator-mode/-p-o-l-y-m-o-r-p-h-i-c/)：（預設）僅為多型型別新增類別鑑別器。
* [`ALL_JSON_OBJECTS`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-class-discriminator-mode/-a-l-l_-j-s-o-n_-o-b-j-e-c-t-s/)：在可行的情況下，為所有 JSON 物件新增類別鑑別器。
* [`NONE`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-class-discriminator-mode/-n-o-n-e/)：完全省略類別鑑別器。

以下是將 `ClassDiscriminatorMode` 屬性設為 `NONE` 的範例：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 設定 Json 執行個體以從輸出中省略類別鑑別器
val format = Json { classDiscriminatorMode = ClassDiscriminatorMode.NONE }

@Serializable
sealed class Project {
    abstract val name: String
}

@Serializable
class OwnedProject(override val name: String, val owner: String) : Project()

fun main() {
    val data: Project = OwnedProject("kotlinx.coroutines", "kotlin")
    // 序列化時不包含鑑別器
    println(format.encodeToString(data))
    // {"name":"kotlinx.coroutines","owner":"kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true" id="set-classdiscriminatormode-example"}

> 沒有鑑別器時，基底類別的序列化器將無法把輸出還原序列化回適當的型別。
>
{style="note"}

### 美化輸出 (Pretty printing) {id="pretty-printing"}

預設情況下，`Json` 會產生緊湊的單行輸出。

你可以透過在輸出中啟用美化列印來加入縮排和換行，以提高可讀性。
若要執行此操作，請在 `Json` 執行個體中將 [`prettyPrint`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/pretty-print.html) 屬性設為 `true`：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 建立自訂 Json 格式
val format = Json { prettyPrint = true }

@Serializable
data class Project(val name: String, val language: String)

fun main() {
    val data = Project("kotlinx.serialization", "Kotlin")

    // 列印帶有換行與縮排的 JSON 輸出
    println(format.encodeToString(data))
}
//sampleEnd
```
{kotlin-runnable="true" id="pretty-printing-example"}

此範例會列印出下列結果：

```text
{
    "name": "kotlinx.serialization",
    "language": "Kotlin"
}
```

> 你可以使用 [`prettyPrintIndent`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/pretty-print-indent.html) 選項來自訂美化 JSON 中所使用的縮排。
>
> 例如，你可以將預設的四個空格替換為任何允許的空白字元，例如 `\t` 或 `\n`。
>
{style="tip"}

## 自訂 JSON 反序列化 {id="customize-json-deserialization"}

Kotlin 的 `Json` 剖析器提供了數種設定，可讓你自訂 JSON 資料的剖析與反序列化過程。

### 忽略未知鍵 {id="ignore-unknown-keys"}

處理來自第三方服務或其他動態來源的 JSON 資料時，隨著時間推移，JSON 物件中可能會新增新的屬性。

預設情況下，未知的鍵（JSON 輸入中的屬性名稱）在反序列化期間會導致錯誤。
若要防止此情況發生，請在 `Json` 執行個體中將 [`ignoreUnknownKeys`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/ignore-unknown-keys.html) 屬性設為 `true`：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 建立一個忽略未知鍵的 Json 執行個體
val format = Json { ignoreUnknownKeys = true }

@Serializable
data class Project(val name: String)

fun main() {
    val data = format.decodeFromString<Project>("""
        {"name":"kotlinx.serialization","language":"Kotlin"}
    """)
    // language 鍵被忽略，因為它不存在於 Project 類別中
    println(data)
    // Project(name=kotlinx.serialization)
}
//sampleEnd
```
{kotlin-runnable="true" id="ignore-unknown-keys-example"}

#### 針對特定類別忽略未知鍵 {id="ignore-unknown-keys-for-specific-classes"}
<primary-label ref="experimental-opt-in"/>

除了[為所有類別啟用 `ignoreUnknownKeys`](#ignore-unknown-keys) 之外，
你也可以使用 `@JsonIgnoreUnknownKeys` 註解僅針對特定類別忽略未知鍵。
這能讓你在預設情況下維持嚴格的反序列化，僅在需要之處允許寬鬆處理。

`@JsonIgnoreUnknownKeys` 註解為[實驗性](components-stability.md#stability-levels-explained)功能。
若要選擇加入，請使用 `@OptIn(ExperimentalSerializationApi::class)` 註解或編譯器選項 `-opt-in=kotlinx.serialization.ExperimentalSerializationApi`：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@OptIn(ExperimentalSerializationApi::class)
@Serializable
// Outer 中的未知屬性在反序列化期間會被忽略
@JsonIgnoreUnknownKeys
data class Outer(val a: Int, val inner: Inner)

@Serializable
data class Inner(val x: String)

fun main() {
    val outer = Json.decodeFromString<Outer>(
        """{"a":1,"inner":{"x":"value"},"unknownKey":42}"""
    )
    println(outer)
    // Outer(a=1, inner=Inner(x=value))

    // 擲出例外
    // inner 內部的 unknownKey 不會被忽略，因為 Inner 未加上註解
    println(
        Json.decodeFromString<Outer>(
            """{"a":1,"inner":{"x":"value","unknownKey":"unexpected"}}"""
        )
    )
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.2" validate="false" id="ignore-specific-unknown-keys-example"}

在此範例中，`Inner` 會因未知鍵而擲出 `SerializationException`，因為它並未以 `@JsonIgnoreUnknownKeys` 進行註解。

### 強制轉換輸入值 {id="coerce-input-values"}

處理來自第三方服務或其他動態來源的 JSON 資料時，格式可能會發生變更。
當實際值與預期型別不符時，這可能會在解碼期間導致例外。

預設的 `Json` 實作對於[輸入型別非常嚴格](serialization-customization-options.md#the-serializable-annotation)。
若要放寬此限制，請在 `Json` 執行個體中將 [`coerceInputValues`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/coerce-input-values.html) 屬性設為 `true`：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
val format = Json { coerceInputValues = true }

@Serializable
data class Project(val name: String, val language: String = "Kotlin")

fun main() {
    val data = format.decodeFromString<Project>("""
        {"name":"kotlinx.serialization","language":null}
    """)

    // 將 language 的無效 null 值強制轉換為其預設值
    println(data)
    // Project(name=kotlinx.serialization, language=Kotlin)
}
//sampleEnd
```
{kotlin-runnable="true"}

`coerceInputValues` 屬性僅影響解碼。它會將某些無效的輸入值視為對應屬性缺失來處理。
目前，它適用於：

* 非可 null 型別的 `null` 輸入
* 列舉的未知值

> 此清單在未來版本中可能會擴充，透過以預設值或 `null` 取代無效值，
> 讓包含此屬性的 `Json` 執行個體更具寬容性。
>
{style="note"}

若缺少某個值，且存在預設屬性值，則會將其替換為該預設值。

對於列舉，僅在符合以下條件時才會將值替換為 `null`：

* 未定義預設值。
* [`explicitNulls`](#omit-explicit-nulls) 屬性設為 `false`。
* 該屬性為可 null。

你可以結合 `coerceInputValues` 與 `explicitNulls` 屬性來處理無效的列舉值：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
enum class Color { BLACK, WHITE }

@Serializable
data class Brush(val foreground: Color = Color.BLACK, val background: Color?)

val json = Json { 
  coerceInputValues = true
  explicitNulls = false
}

fun main() {

    // 將未知的 foreground 值強制轉換為其預設值，並將 background 強制轉換為 null
    val brush = json.decodeFromString<Brush>("""{"foreground":"pink", "background":"purple"}""")
    println(brush)
    // Brush(foreground=BLACK, background=null)
}
//sampleEnd
```
{kotlin-runnable="true" id="coerce-input-values-example"}

### 允許尾隨逗號 {id="allow-trailing-commas"}

若要在 JSON 輸入中允許尾隨逗號，請將 [`allowTrailingComma`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/allow-trailing-comma.html) 屬性設為 `true`：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 允許 JSON 物件與陣列中出現尾隨逗號
val format = Json { allowTrailingComma = true }

fun main() {
    val numbers = format.decodeFromString<List<Int>>(
        """
            [1, 2, 3,]
        """
    )
    println(numbers)
    // [1, 2, 3]
}
//sampleEnd
```
{kotlin-runnable="true" id="allow-trailing-commas-example"}

### 允許 JSON 中的註解 {id="allow-comments-in-json"}

使用 [`allowComments`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/allow-comments.html) 屬性以允許 JSON 輸入中的註解。
啟用此屬性後，剖析器將接受輸入中以下形式的註解：

* 以換行符號 `\n` 結尾的 `//` 行註解
* `/* */` 區塊註解

以下是一個範例：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 允許 JSON 輸入中的註解
val format = Json { allowComments = true }

fun main() {
    val numbers = format.decodeFromString<List<Int>>(
        """
            [
                // first element
                1,
                /* second element */
                2
            ]
        """
    )
    println(numbers)
    // [1, 2]
}
//sampleEnd
```
{kotlin-runnable="true" id="allow-comments-example"}

### 寬鬆剖析 {id="lenient-parsing"}

預設情況下，`Json` 剖析器會強制執行嚴格的 JSON 規則以確保符合 [RFC-8259](https://www.ietf.org/rfc/rfc8259.txt) 規範，
該規範要求鍵和字串常值必須用引號包裹。

若要放寬這些限制，請在 `Json` 執行個體中將 [`isLenient`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/is-lenient.html) 屬性設為 `true`：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
val format = Json { isLenient = true }

enum class Status { SUPPORTED }

@Serializable
data class Project(val name: String, val status: Status, val votes: Int)

fun main() {
    // 使用寬鬆剖析解碼 JSON 字串
    // 寬鬆剖析允許無引號的鍵、字串與列舉值
    val data = format.decodeFromString<Project>("""
        {
            name   : kotlinx.serialization,
            status : SUPPORTED,
            votes  : "9000"
        }
    """)
    println(data)
    // Project(name=kotlinx.serialization, status=SUPPORTED, votes=9000)
}
//sampleEnd
```
{kotlin-runnable="true" id="lenient-parsing-example"}

## 自訂 JSON 與 Kotlin 之間的名稱對應 {id="customize-name-mapping-between-json-and-kotlin"}

某些 JSON 資料可能無法完全符合 Kotlin 的命名慣例或預期格式。
為了解決這些問題，Kotlin serialization 提供了多種工具來管理命名差異、
處理多個 JSON 屬性名稱，並確保序列化資料具備一致的命名策略。

### 為單一 Kotlin 屬性接受替代的 JSON 屬性名稱 {id="accept-alternative-json-property-names-for-a-single-kotlin-property"}

當 JSON 屬性名稱在不同架構版本之間變更時，
你可以[使用 `@SerialName` 註解來重新命名 JSON 屬性](serialization-customization-options.md#customize-serial-names)。

然而，這會導致無法解碼仍在使用舊屬性名稱的資料。
若要為單一屬性接受替代的 JSON 屬性名稱，請使用 [`@JsonNames`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-names/) 註解：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// 將 name 和 title 這兩個 JSON 屬性皆對應至 name 屬性
data class Project(@JsonNames("title") val name: String)

fun main() {
    val project = Json.decodeFromString<Project>("""{"name":"kotlinx.serialization"}""")
    println(project)
    // Project(name=kotlinx.serialization)

    val oldProject = Json.decodeFromString<Project>("""{"title":"kotlinx.coroutines"}""")
    // name 和 title 這兩個 JSON 屬性皆對應至 name 屬性
    println(oldProject)
    // Project(name=kotlinx.coroutines)
}
//sampleEnd
```
{kotlin-runnable="true" id="accept-alternative-json-property-example"}

> [`JsonBuilder`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/) 中的 [`useAlternativeNames`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/use-alternative-names.html) 屬性用於啟用 `@JsonNames` 註解。
> 此屬性預設為 `true`，允許 `Json` 辨識並解碼單一屬性的多個名稱。
> 
> 如果你沒有使用 `@JsonNames` 且希望提升效能，
> 特別是在使用 `ignoreUnknownKeys` 跳過許多未知屬性時，可以將此屬性設為 `false`。
>
{style="note"}

### 以不區分大小寫的方式解碼列舉 {id="decode-enums-in-a-case-insensitive-manner"}

[Kotlin 的命名慣例](coding-conventions.md#property-names)建議列舉值使用大寫搭配底線，
或使用大駝峰式大小寫（Upper CamelCase）。
預設情況下，`Json` 在解碼時會嚴格比對 Kotlin 列舉常數的名稱。

然而，來自外部資料來源的 JSON 資料可能會使用小寫或混合大小寫的名稱。
若要處理此類情況，請透過 [`JsonBuilder.decodeEnumsCaseInsensitive`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/decode-enums-case-insensitive.html) 屬性將 `Json` 執行個體設定為以不區分大小寫的方式解碼列舉值：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
// 設定 Json 執行個體以不區分大小寫的方式解碼列舉值
val format = Json { decodeEnumsCaseInsensitive = true }

enum class Cases { VALUE_A, @JsonNames("Alternative") VALUE_B }

@Serializable
data class CasesList(val cases: List<Cases>)

fun main() {
    // 解碼列舉值時忽略大小寫，包含替代名稱
    println(format.decodeFromString<CasesList>("""{"cases":["value_A", "alternative"]}""")) 
    // CasesList(cases=[VALUE_A, VALUE_B])
}
//sampleEnd
```
{kotlin-runnable="true" id="decode-enums-caseinsensitive-example"}

> 此屬性同時適用於[序列化名稱](serialization-customization-options.md#customize-serial-names)以及透過 `@JsonNames` 註解指定的[替代名稱](#accept-alternative-json-property-names-for-a-single-kotlin-property)，
> 確保所有值都能成功解碼。此屬性不會影響編碼。
>
{style="note"}

### 套用全域命名策略 {id="apply-a-global-naming-strategy"}

當 JSON 輸入中的屬性名稱與 Kotlin 中的屬性名稱不同時，你可以使用 [`@SerialName`](serialization-customization-options.md#customize-serial-names) 註解明確指定每個屬性的名稱。
但是，從其他架構或舊版程式碼庫遷移時，你可能需要以相同方式轉換每個序列化名稱。

針對這些情境，你可以在 `Json` 執行個體中使用 [JsonBuilder.namingStrategy](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/naming-strategy.html) 屬性指定全域命名策略。
Kotlin serialization 提供了內建策略，例如 [JsonNamingStrategy.SnakeCase](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-naming-strategy/-builtins/-snake-case.html)：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Project(val projectName: String, val projectOwner: String)

// 設定 Json 執行個體以套用 SnakeCase 命名策略
val format = Json { namingStrategy = JsonNamingStrategy.SnakeCase }

fun main() {
    val project = format.decodeFromString<Project>("""{"project_name":"kotlinx.coroutines", "project_owner":"Kotlin"}""")
    // 序列化與反序列化時，所有序列化名稱都會從駝峰式大小寫轉換為蛇形命名法（snake_case）
    println(format.encodeToString(project.copy(projectName = "kotlinx.serialization")))
    // {"project_name":"kotlinx.serialization","project_owner":"Kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true" id="global-naming-strategy-example"}

透過 [`JsonNamingStrategy`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-naming-strategy/) 使用全域命名策略時，請記住以下幾點：

* _轉換會套用至所有屬性_，無論序列化名稱是衍生自屬性名稱，或是使用 [`@SerialName`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serial-name/) 註解明確定義的。
  你無法透過指定序列化名稱來將某個屬性排除於轉換之外。
  若要在序列化期間保持特定名稱不變，請改用 `@JsonNames` 註解。
* 若轉換後的名稱與其他轉換後的屬性名稱發生衝突，或是與 `@JsonNames` 註解指定的替代名稱衝突，
  反序列化將會失敗並擲出例外。
* 全域命名策略是隱式的。
  這會讓單憑檢視類別定義很難確定序列化後的名稱。
  這可能使 IDE 中的**尋找用法**（Find Usages）、**重新命名**（Rename）等工作，或是使用 `grep` 等工具進行全文檢索變得更加困難，進而可能增加錯誤風險與維護成本。

考慮到這些因素，在應用程式中實作全域命名策略之前，請仔細權衡利弊。

## 接續閱讀 {id="what-s-next"}

* 探索[進階 JSON 元素處理](serialization-json-elements.md)，在剖析或序列化之前操作並處理 JSON 資料。
* 了解如何[在序列化與反序列化期間轉換 JSON](serialization-transform-json.md)，以對資料進行更深入的控制。