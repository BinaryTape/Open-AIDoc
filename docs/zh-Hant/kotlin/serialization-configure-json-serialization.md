[//]: # (title: JSON 序列化概觀)

Kotlin 序列化讓您能夠輕鬆地在 Kotlin 物件與 JSON 之間相互轉換。
[`Json`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/) 類別是實現此功能的主要工具，它為 JSON 的產生與剖析方式提供了極大的彈性。
您可以設定 `Json` 執行個體以處理特定的 JSON 行為，或在處理基本任務時使用其預設執行個體。

透過 `Json` 類別，您可以：

* 使用 [`encodeToString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/encode-to-string.html) 函式將 Kotlin 物件序列化為 JSON 字串。
* 使用 [`decodeFromString()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/-json/decode-from-string.html) 函式將 JSON 字串還原序列化為 Kotlin 物件。
* 在處理複雜的 JSON 結構時，透過 [`encodeToJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/encode-to-json-element.html) 和 [`decodeFromJsonElement()`](https://kotlinlang.org/api/kotlinx.serialization/kotlinx-serialization-json/kotlinx.serialization.json/decode-from-json-element.html) 函式[直接操作 `JsonElement`](serialization-json-elements.md)。
* 使用[實驗性](components-stability.md#stability-levels-explained)擴充函式來[序列化與還原序列化 I/O 來源](serialization-json-io-sources.md)，而無需建立中介字串，包括 JVM 串流以及 [`kotlinx-io`](https://github.com/Kotlin/kotlinx-io) 和 [Okio](https://square.github.io/okio/) 型別。

在開始之前，請從序列化程式庫匯入以下宣告：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*
```

以下是一個使用預設 `Json` 執行個體展示 Kotlin 中 JSON 序列化運作方式的簡單範例：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class User(val name: String, val age: Int)

fun main() {
    // 使用預設的 Json 執行個體
    val json = Json

    // 建立 User 物件
    val user = User("Alice", 30)

    // 將 User 物件轉換為 JSON 字串
    val jsonString = json.encodeToString(user)
    println(jsonString)
    // {"name":"Alice","age":30}

    // 將 JSON 字串轉換回 User 物件
    val deserializedUser = json.decodeFromString<User>(jsonString)
    println(deserializedUser)
    // User(name=Alice, age=30)
}
//sampleEnd
```
{kotlin-runnable="true" id="first-json-example"}

除了使用預設設定外，您還可以針對特定使用案例[自訂 `Json` 執行個體](serialization-json-configuration.md)，例如忽略未知的索引鍵：

```kotlin
// 從序列化程式庫匯入宣告
import kotlinx.serialization.*
import kotlinx.serialization.json.*

//sampleStart
@Serializable
data class Project(val name: String)

// 設定 Json 執行個體以忽略未知索引鍵
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

## 後續步驟 {id="what-s-next"}

* 了解如何[自訂 `Json` 執行個體](serialization-json-configuration.md)，以應對序列化與還原序列化的不同使用案例。
* 探索[進階 JSON 元素處理](serialization-json-elements.md)，以便在剖析或序列化 JSON 資料之前對其進行操作與處理。
* 了解如何[在序列化與還原序列化期間轉換 JSON](serialization-transform-json.md)，進一步掌控您的資料。