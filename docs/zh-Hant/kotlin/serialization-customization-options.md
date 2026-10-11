[//]: # (title: 序列化類別)

[`@Serializable`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serializable/) 註解可為所有具有[支援欄位](properties.md#backing-fields)的類別屬性啟用預設序列化。
你可以依據自身特定需求自訂此行為。
本頁面涵蓋各種序列化技術，向你展示如何指定哪些屬性要被序列化，以及如何管理序列化過程。

在開始之前，請確保你已匯入[必要的程式庫相依性](serialization-get-started.md)。

## @Serializable 註解 {id="the-serializable-annotation"}

`@Serializable` 註解可啟用類別屬性的自動序列化，
讓類別能夠與 JSON 等格式互相轉換。

在 Kotlin 中，只有具備支援欄位的屬性才會被序列化：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(
    // 具有支援欄位的屬性 – 會被序列化
    var name: String
) {
    // 具有支援欄位的屬性 – 會被序列化
    var stars: Int = 0

    // 沒有支援欄位的僅 getter 屬性 - 不會被序列化
    val path: String
        get() = "kotlin/$name"

    // 委託屬性 - 不會被序列化
    var id by ::name
}

fun main() {
    val data = Project("kotlinx.serialization").apply { stars = 9000 }
    // 僅印出 name 與 stars 屬性
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","stars":9000}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-annotation-example"}

### 序列化類別參照 {id="serialize-class-references"}

以 `@Serializable` 標記的類別可以包含參照其他類別的屬性。
被參照的類別也必須標記 `@Serializable`。
編碼為 JSON 時，這會產生巢狀的 JSON 物件：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// owner 屬性參照了另一個可序列化的 User 類別
class Project(val name: String, val owner: User)

// 被參照的類別也必須標記 @Serializable
@Serializable
class User(val name: String)

fun main() {
    val owner = User("kotlin")
    val data = Project("kotlinx.serialization", owner)
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","owner":{"name":"kotlin"}}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-class-references-example"}

> 若要參照不可序列化的類別，請使用 [`@Transient`](#exclude-properties-with-the-transient-annotation) 標記對應的屬性，或為其提供[自訂序列化器 (custom serializer)](serialization-create-and-use-serializers.md)。
>
{style="tip"}

### 重複物件參照的序列化 {id="serialization-of-repeated-object-references"}

Kotlin 序列化旨在對純資料進行編碼與解碼。它不支援透過重複的物件參照來重建任意物件圖 (object graphs)。
例如，當序列化一個兩次參照同一執行個體的物件時，它會被編碼兩次：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(val name: String, val owner: User, val maintainer: User)

@Serializable
class User(val name: String)

fun main() {
    val owner = User("kotlin")
    // 參照 owner 兩次
    val data = Project("kotlinx.serialization", owner, owner)
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","owner":{"name":"kotlin"},"maintainer":{"name":"kotlin"}}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-repeated-references"}

> 如果你嘗試序列化循環結構，將導致堆疊溢位 (stack overflow)。
> 若要將參照排除在序列化之外，請使用 [@Transient 註解](#exclude-properties-with-the-transient-annotation)。
>
{style="tip"}

### 序列化泛型類別 {id="serialize-generic-classes"}

Kotlin 中的泛型類別支援型別多型，這在編譯期由 Kotlin 序列化強制實施。例如，考慮一個泛型可序列化類別 `Payload<T>`：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// Payload<T> 類別可以與內建型別（如 Int）搭配使用，
// 或與標記 @Serializable 的使用者自訂型別（如 Repository）搭配使用
class Payload<T>(val value: T)

@Serializable
data class Repository(val name: String, val language: String)

@Serializable
class BackupData(
    val issueCount: Payload<Int>,
    val mainRepo: Payload<Repository>
)

fun main() {
    val backup = BackupData(
        Payload(42),
        Payload(Repository("kotlinx.serialization", "Kotlin"))
    )
    println(Json.encodeToString(backup))
    // {"issueCount":{"value":42},"mainRepo":{"value":{"name":"kotlinx.serialization","language":"Kotlin"}}}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-generic-classes-example"}

當你序列化類似 `Box<T>` 的泛型類別時，JSON 輸出取決於你在編譯期為 `T` 指定的實際型別。
若該型別不可序列化，則會產生編譯期錯誤。

## 可選屬性 {id="optional-properties"}

具有*預設值*的屬性在反序列化期間是可選的，並且在格式已做相應設定的情況下，可以在序列化期間略過。
例如，預設的 JSON 配置會略過編碼預設值。

### 為可選屬性設定預設值 {id="set-default-values-for-optional-properties"}

在 Kotlin 中，唯有當輸入中包含物件的所有屬性時，該物件才能被反序列化。
若要讓屬性在序列化時成為可選項，請設定一個預設值，以便在輸入未提供該值時使用：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// 為可選的 language 屬性設定預設值
data class Project(val name: String, val language: String = "Kotlin")

fun main() {
    val data = Json.decodeFromString<Project>("""
        {"name":"kotlinx.serialization"}
    """)
    println(data)
    // Project(name=kotlinx.serialization, language=Kotlin)
}
//sampleEnd
```
{kotlin-runnable="true" id="deserialize-optional-properties"}

### 序列化可為 null 的屬性 {id="serialize-nullable-properties"}

Kotlin 序列化原生支援可為 null 的屬性。
[與其他預設值相同](#manage-the-serialization-of-default-properties-with-encodedefault)，`null` 值不會被編碼到 JSON 輸出中：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// 定義具有 renamedTo 可為 null 屬性的類別，其預設值為 null
class Project(val name: String, val renamedTo: String? = null)

fun main() {
    val data = Project("kotlinx.serialization")
    // renamedTo 屬性不會被編碼，因為其值為 null
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization"}
}
//sampleEnd
```
{kotlin-runnable="true" id="nullable-properties-example"}

此外，Kotlin 的 [null 安全性](null-safety.md)在反序列化期間會受到嚴格強制執行。
如果 JSON 物件對不可為 null 的屬性包含 `null` 值，即使該屬性具有預設值，也會擲回例外：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Project(val name: String, val language: String = "Kotlin")

fun main() {
    val data = Json.decodeFromString<Project>("""
        {"name":"kotlinx.serialization","language":null}
    """)
    println(data)
    // JsonDecodingException
}
//sampleEnd
```
{kotlin-runnable="true" validate="false" id="deserialize-nullable-exception-example"}

> 如果你需要處理來自第三方 JSON 的 `null` 值，可以[將其強制轉換為預設值](serialization-json-configuration.md#coerce-input-values)。
> 
> 你也可以透過 `explicitNulls` 屬性從已編碼的 JSON 中[省略明確的 `null` 值](serialization-json-configuration.md#omit-explicit-nulls)。
>
{style="tip"}

### 可選屬性中的初始設定式 {id="initializers-in-optional-properties"}

當序列化輸入包含可選屬性的值時，該屬性的初始設定式將不會被呼叫。
因此，請避免在屬性初始設定式中使用帶有副作用的程式碼。

範例如下：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
fun computeLanguage(): String {
    println("Computing")
    return "Kotlin"
}

@Serializable
// 若輸入中存在 language，則略過初始設定式
data class Project(val name: String, val language: String = computeLanguage())

fun main() {
    val data = Json.decodeFromString<Project>("""
        {"name":"kotlinx.serialization","language":"Java"}
    """)
    println(data)
    // Project(name=kotlinx.serialization, language=Java)
}
//sampleEnd
```
{kotlin-runnable="true" id="deserialize-initializer-example"}

在此範例中，由於輸入中已指定 `language` 屬性，因此輸出中不會印出 `Computing` 字串。

### 使用 `@EncodeDefault` 管理預設屬性的序列化 {id="manage-the-serialization-of-default-properties-with-encodedefault"}

預設情況下，JSON 序列化會排除具有預設值的屬性。
這能減少序列化資料的大小，並避免不必要的視覺混亂。

以下範例中，`language` 屬性會從輸出中排除，因為其值等於預設值：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Project(val name: String, val language: String = "Kotlin")

fun main() {
    val data = Project("kotlinx.serialization")
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization"}
}
//sampleEnd
```
{kotlin-runnable="true" id="default-properties-example"}

> 你可以設定 `Json` 執行個體，以預設為所有屬性[編碼預設值](serialization-json-configuration.md#encode-default-values)。
>
{style="tip"}

若要一律序列化某個屬性（無論其值或格式設定為何），請使用 [`@EncodeDefault`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-encode-default/) 註解。
或者，你可以設定 [`EncodeDefault.Mode`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-encode-default/-mode/) 參數來變更此行為。

讓我們來看一個範例：`language` 屬性一律包含在序列化輸出中，而 `projects` 屬性在為空清單時則被排除：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.EncodeDefault.Mode.NEVER

//sampleStart
@Serializable
data class Project(
    val name: String,
    // 一律在序列化輸出中包含 language 屬性，
    // 即使它具有預設值 "Kotlin"
    @EncodeDefault val language: String = "Kotlin"
)

@Serializable
data class User(
    val name: String,
    // 當 projects 為空清單時將其排除，即使它具有預設值
    @EncodeDefault(NEVER) val projects: List<Project> = emptyList()
)

fun main() {
    val adminUser = User("Alice", listOf(Project("kotlinx.serialization")))
    val guestUser = User("Bob")
    // 序列化 projects，因為它包含值
    // language 則一律會被序列化
    println(Json.encodeToString(adminUser))
    // {"name":"Alice","projects":[{"name":"kotlinx.serialization","language":"Kotlin"}]}

    // 排除 projects，因為它是空清單，
    // 且 EncodeDefault.Mode 設定為 NEVER，因此不會被序列化
    println(Json.encodeToString(guestUser))
    // {"name":"Bob"}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-encode-default"}

### 使用 `@Required` 註解將屬性設為必要 {id="make-properties-required-with-the-required-annotation"}

使用 [`@Required`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-required/) 標記屬性，以將其設為輸入中的必要項目。
這會強制要求輸入必須包含該屬性，即使它具有[預設值](#set-default-values-for-optional-properties)：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.Required

//sampleStart
@Serializable
// 將 language 屬性標記為必要
data class Project(val name: String, @Required val language: String = "Kotlin")

fun main() {
    val data = Json.decodeFromString<Project>("""
        {"name":"kotlinx.serialization"}
    """)
    println(data)
    // MissingFieldException
}
//sampleEnd
```
{kotlin-runnable="true" id="required-annotation-example"}

## 自訂類別序列化 {id="customize-class-serialization"}

Kotlin 序列化提供了多種方式來修改類別的序列化方式。
本節涵蓋自訂屬性名稱、控制屬性納入等技巧。

### 自訂序列化名稱 {id="customize-serial-names"}

預設情況下，序列化輸出（如 JSON）中的屬性名稱與原始碼中的名稱一致。

你可以使用 [`@SerialName`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-serial-name/) 註解來自訂這些名稱（稱為*序列化名稱 (serial names)*）。
用它可以讓序列化輸出中的屬性名稱更具描述性：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// 使用 @SerialName 將 lang 屬性變更為 language
class Project(val name: String, @SerialName("language") val lang: String)

fun main() {
    val data = Project("kotlinx.serialization", "Kotlin")
    // 在 JSON 輸出中印出更具描述性的屬性名稱
    println(Json.encodeToString(data))
    // {"name":"kotlinx.serialization","language":"Kotlin"}
}
//sampleEnd
```
{kotlin-runnable="true" id="serial-names"}

### 定義用於序列化的建構函式屬性 {id="define-constructor-properties-for-serialization"}

標記有 `@Serializable` 的類別必須將其主建構函式中的所有參數宣告為屬性。

如果你需要在將值指派給屬性之前執行額外的初始化邏輯，請使用[次建構函式](classes.md#secondary-constructors)。
主建構函式可以保持 `private` 並處理屬性初始化。

以下範例中，次建構函式將字串剖析為兩個值，然後將它們傳遞給主建構函式以進行序列化：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project private constructor(val owner: String, val name: String) {
    // 使用路徑字串建立 Project 物件
    constructor(path: String) : this(
        owner = path.substringBefore('/'),
        name = path.substringAfter('/')
    )

    val path: String
        get() = "$owner/$name"
}
fun main() {
    println(Json.encodeToString(Project("kotlin/kotlinx.serialization")))
    // {"owner":"kotlin","name":"kotlinx.serialization"}
}
//sampleEnd
```
{kotlin-runnable="true" id="serialize-constructor-properties"}

### 在主建構函式中驗證資料 {id="validate-data-in-the-primary-constructor"}

反序列化後，`kotlinx.serialization` 外掛程式會執行類別的[初始化區塊](classes.md#initializer-blocks)，
就像你建立執行個體時一樣。
這讓你在反序列化期間能夠驗證建構函式參數並拒絕無效資料。

範例如下：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
class Project(val name: String) {
    // 驗證 name 是否為非空
    init {
        require(name.isNotEmpty()) { "name cannot be empty" }
    }
}

fun main() {
    val data = Json.decodeFromString<Project>("""
        {"name":""}
    """)
    println(data)
    // Exception in thread "main" java.lang.IllegalArgumentException: name cannot be empty
}
//sampleEnd
```
{kotlin-runnable="true" id="validate-constructor-example"}

### 使用 `@Transient` 註解排除屬性 {id="exclude-properties-with-the-transient-annotation"}

你可以使用 [`@Transient`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-core/kotlinx.serialization/-transient/) 註解將屬性排除在序列化之外。
暫態 (transient) 屬性必須具有預設值。

若你在輸入中明確為暫態屬性指定了值，即使該值與預設值相符，也會擲回 `JsonDecodingException`：

```kotlin
// Imports declarations from the serialization library
import kotlinx.serialization.*
import kotlinx.serialization.Transient
import kotlinx.serialization.json.*

//sampleStart
@Serializable
// 將 language 屬性排除在序列化之外
data class Project(val name: String, @Transient val language: String = "Kotlin")

fun main() {
    // 即使輸入與預設值相符，也會擲回例外
    val data = Json.decodeFromString<Project>("""
        {"name":"kotlinx.serialization","language":"Kotlin"}
    """)
    println(data)
    // JsonDecodingException
}
//sampleEnd
```
{kotlin-runnable="true" validate="false" id="transient-annotation-example"}

> 若要避免未知鍵（包括標記有 `@Transient` 註解的鍵）在 JSON 中引發例外，請啟用 [`ignoreUnknownKeys`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json-builder/ignore-unknown-keys.html) 配置屬性。
> 欲了解更多資訊，請參閱[忽略未知鍵](serialization-json-configuration.md#ignore-unknown-keys)章節。
>
{style="tip"}

## 下一步 {id="what-s-next"}

* 在 [JSON 序列化概觀](serialization-configure-json-serialization.md)中探索更複雜的 JSON 序列化案例。
* 在[建立與使用序列化器](serialization-create-and-use-serializers.md)中了解如何取得產生的序列化器、建立自訂序列化器以及套用序列化器。