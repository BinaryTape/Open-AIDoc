[//]: # (title: 可預測性)

要設計一個穩健且易於使用的 Kotlin 程式庫，關鍵在於預見常見的使用案例、允許擴充性並強制執行正確的使用方式。
遵循預設設定、錯誤處理和狀態管理的最佳實務，能確保使用者獲得無縫的體驗，同時維護程式庫的完整性與品質。

## 預設執行正確的操作

您的程式庫應預見每個使用案例的「正常路徑 (happy path)」，並據此提供預設設定。
使用者不應需要提供預設值才能讓程式庫正常運作。

例如，使用 [Ktor `HttpClient`](https://ktor.io/docs/client-create-new-application.html) 時，最常見的使用案例是向伺服器發送 GET 請求。
這可以透過下方的程式碼完成，其中僅需指定必要的資訊：

```kotlin
val client = HttpClient(CIO)
val response: HttpResponse = client.get("https://ktor.io/")
```

沒有必要為必要的 HTTP 標頭提供值，或為回應中可能出現的狀態碼提供自訂事件處理常式。

如果某個使用案例沒有明顯的「正常路徑」，或者某個參數應該有預設值但卻沒有無爭議的選項，這通常表示需求分析存在缺陷。

## 提供擴充的機會

當無法預見正確的選擇時，應允許使用者指定他們偏好的做法。
您的程式庫也應讓使用者提供自己的做法或使用第三方擴充。

例如，在 [Ktor `HttpClient`](https://ktor.io/docs/client-serialization.html) 中，鼓勵使用者在配置用戶端時安裝內容協商 (content negotiation) 支援，並指定其偏好的序列化格式：

```kotlin
val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
        })
    }
}
```

使用者可以選擇安裝哪些外掛程式，或使用[定義用戶端外掛程式的獨立 API](https://ktor.io/docs/client-custom-plugins.html) 來建立自己的外掛程式。

此外，使用者可以為程式庫中的型別定義擴充函式和屬性。
作為程式庫作者，您可以透過[考慮擴充的設計](api-guidelines-readability.md#use-extension-functions-and-properties)並確保程式庫的型別具有清晰的核心概念，使這一點變得更容易。

## 防止不需要且無效的擴充

使用者不應能夠以違反原始設計或在問題領域規則中不可能實現的方式來擴充您的程式庫。

例如，在對 JSON 進行編組 (marshaling) 時，輸出格式僅支援六種型別：
`object`、`array`、`number`、`string`、`boolean` 和 `null`。

如果您建立一個名為 `JsonElement` 的 `open` 類別或介面，使用者可能會建立無效的衍生型別，例如 `JsonDate`。
相反地，您可以將 `JsonElement` 介面設為 `sealed` (密封)，並為每種型別提供實作：

```kotlin
sealed interface JsonElement

class JsonNumber(val value: Number) : JsonElement
class JsonObject(val values: Map<String, JsonElement>) : JsonElement
class JsonArray(val values: List<JsonElement>) : JsonElement
class JsonBoolean(val value: Boolean) : JsonElement
class JsonString(val value: String) : JsonElement
object JsonNull : JsonElement
```

密封型別還能讓編譯器確保您的 `when` 運算式是窮舉的 (exhaustive)，而不需要 `else` 陳述式，從而提高可讀性與一致性。

## 避免公開可變狀態

在管理多個值時，您的 API 應盡可能接受及／或傳回唯讀集合。
可變集合並非執行緒安全，且會為您的程式庫引入複雜性與不可預測性。

例如，如果使用者修改了從 API 進入點傳回的可變集合，將無法確定他們是在修改實作結構還是修改複本。
同樣地，如果使用者在將集合傳遞給程式庫後可以修改集合內的值，也將無法確定這是否會影響實作。

由於陣列是可變集合，請避免在您的 API 中使用它們。
如果必須使用陣列，請在與使用者共享資料之前進行防禦性複製。這可確保您的資料結構保持不被修改。

編譯器會針對 `vararg` 引數自動執行這種防禦性複製政策。
當使用展開運算子傳遞現有陣列到預期為 `vararg` 引數的位置時，系統會自動建立陣列的複本。

下列範例示範了此行為：

```kotlin
fun main() {
    fun demo(vararg input: String): `Array<out String>` = input

    val originalArray = arrayOf("one", "two", "three", "four")
    val newArray = demo(*originalArray)

    originalArray[1] = "ten"

    //印出 "one, ten, three, four"
    println(originalArray.joinToString())

    //印出 "one, two, three, four"
    println(newArray.joinToString())
}
```

## 驗證輸入與狀態

在執行實作之前，透過驗證輸入與現有狀態來確保程式庫被正確使用。
使用 [`require`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/require.html) 函式來驗證輸入，並使用 [`check`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/check.html) 函式來驗證現有狀態。

如果 `require` 函式的條件為 `false`，它會拋出 [`IllegalArgumentException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-argument-exception/#kotlin.IllegalArgumentException)，使函式立即失敗並顯示適當的錯誤訊息：

```kotlin
fun saveUser(username: String, password: String) {
    require(username.isNotBlank()) { "Username should not be blank" }
    require(username.all { it.isLetterOrDigit() }) {
        "Username can only contain letters and digits, was: $username"
    }
    require(password.isNotBlank()) { "Password should not be blank" }
    require(password.length >= 7) {
        "Password must contain at least 7 characters"
    }

    /* 實作可以繼續進行 */
}

```

錯誤訊息應包含相關的輸入，以協助使用者確定失敗的原因，如上方針對包含無效字元的使用者名稱所顯示的錯誤訊息，其中包含了不正確的使用者名稱。
此做法的一個例外是，當在錯誤訊息中包含某個值可能會洩漏可用於惡意安全性攻擊的資訊時；這就是為什麼密碼長度的錯誤訊息不包含密碼輸入的原因。

同樣地，如果 `check` 函式的條件為 `false`，它會拋出 [`IllegalStateException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-illegal-state-exception/#kotlin.IllegalStateException)。
使用此函式來驗證執行個體的狀態，如下例所示：

```kotlin
class ShoppingCart {
    private val contents = mutableListOf<Item>()

    fun addItem(item: Item) {
       contents.add(item)
    }

    fun purchase(): Amount {
       check(contents.isNotEmpty()) {
           "Cannot purchase an empty cart"
       }
       // 計算並傳回金額
    }
}
```

## 下一步

在指南的下一部分中，您將學習關於可偵錯性的內容。

[繼續進行下一部分](api-guidelines-debuggability.md)