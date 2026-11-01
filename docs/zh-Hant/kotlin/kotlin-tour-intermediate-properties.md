[//]: # (title: 屬性)

<no-index/>

在初學者導覽中，你學習了如何使用屬性來宣告類別執行個體的特徵，以及如何存取它們。本章節將更深入探討屬性在 Kotlin 中的運作方式，並探索在程式碼中使用它們的其他方式。

## 支援欄位 {id="backing-fields"}

在 Kotlin 中，屬性具有預設的 `get()` 和 `set()` 函式（稱為屬性存取子），用於處理取得與修改其值。雖然這些預設函式在程式碼中不明顯可見，但編譯器會在幕後自動產生它們來管理屬性存取。這些存取子使用**支援欄位** (backing field) 來儲存實際的屬性值。

若符合以下任一情況，支援欄位就會存在：

* 你使用了該屬性的預設 `get()` 或 `set()` 函式。
* 你嘗試在程式碼中藉由使用 `field` 關鍵字存取屬性值。

> `get()` 與 `set()` 函式也被稱為 getter 與 setter。
>
{style="tip"}

例如，以下程式碼包含沒有自訂 `get()` 或 `set()` 函式的 `category` 屬性，因此使用預設實作：

```kotlin
class Contact(val id: Int, var email: String) {
    var category: String = ""
}
```

在底層實作中，這等同於以下虛擬碼：

```kotlin
class Contact(val id: Int, var email: String) {
    var category: String = ""
        get() = field
        set(value) {
            field = value
        }
}
```
{validate="false"}

在此範例中：

* `get()` 函式從欄位取得屬性值：`""`。
* `set()` 函式接受 `value` 作為參數並將其指派給欄位，其中 `value` 為 `""`。 

當你想要在 `get()` 或 `set()` 函式中新增額外邏輯而不造成無窮迴圈時，存取支援欄位非常有用。例如，你有一個包含 `name` 屬性的 `Person` 類別：

```kotlin
class Person {
    var name: String = ""
}
```

你想要確保 `name` 屬性的第一個字母為大寫，因此建立了一個自訂的 `set()` 函式，該函式使用了 [`.replaceFirstChar()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/replace-first-char.html) 和 [`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase-char.html) 擴充函式。但是，如果你在 `set()` 函式中直接參照該屬性，將會造成無窮迴圈並在執行時期看到 `StackOverflowError`：

```kotlin
class Person {
    var name: String = ""
        set(value) {
            // 這會導致執行時期錯誤
            name = value.replaceFirstChar { firstChar -> firstChar.uppercase() }
        }
}

fun main() {
    val person = Person()
    person.name = "kodee"
    println(person.name)
    // Exception in thread "main" java.lang.StackOverflowError
}
```
{validate="false" kotlin-runnable="true" id="kotlin-tour-properties-stackoverflow"}

若要修正此問題，你可以在 `set()` 函式中改為透過 `field` 關鍵字來參照支援欄位：

```kotlin
class Person {
    var name: String = ""
        set(value) {
            field = value.replaceFirstChar { firstChar -> firstChar.uppercase() }
        }
}

fun main() {
    val person = Person()
    person.name = "kodee"
    println(person.name)
    // Kodee
}
```
{kotlin-runnable="true" id="kotlin-tour-properties-backingfield"}

當你想要新增記錄日誌、在屬性值變更時發送通知，或使用比較新舊屬性值的額外邏輯時，支援欄位也非常有用。

若要了解更多，請參閱[支援欄位](properties.md#backing-fields)。

## 擴充屬性 {id="extension-properties"}

就像擴充函式一樣，Kotlin 也有擴充屬性。擴充屬性允許你為現有類別新增新屬性，而無需修改其原始碼。然而，Kotlin 中的擴充屬性**沒有**支援欄位。這意味著你必須自己編寫 `get()` 與 `set()` 函式。此外，缺乏支援欄位意味著它們無法保存任何狀態。

若要宣告擴充屬性，請寫出要擴充的類別名稱，接著加上 `.` 以及屬性名稱。與一般類別屬性相同，你需要為屬性宣告型別。例如：

```kotlin
val String.lastChar: Char
```
{validate="false"}

當你希望屬性包含計算值而無需使用繼承時，擴充屬性最為有用。你可以將擴充屬性想像為一個只有單一參數（即接收者 receiver）的函式。

例如，假設你有一個名為 `Person` 的資料類別，包含兩個屬性：`firstName` 和 `lastName`。

```kotlin
data class Person(val firstName: String, val lastName: String)
```

你希望能夠存取此人的全名，但不想修改 `Person` 資料類別或從中繼承。你可以透過建立一個帶有自訂 `get()` 函式的擴充屬性來實現：

```kotlin
data class Person(val firstName: String, val lastName: String)

// 取得全名的擴充屬性
val Person.fullName: String
    get() = "$firstName $lastName"

fun main() {
    val person = Person(firstName = "John", lastName = "Doe")

    // 使用擴充屬性
    println(person.fullName)
    // John Doe
}
```
{kotlin-runnable="true" id="kotlin-tour-properties-extension"}

> 擴充屬性無法覆寫類別中現有的屬性。
> 
{style="note"}

就像擴充函式一樣，Kotlin 標準函式庫廣泛使用了擴充屬性。例如，參閱 `CharSequence` 的 [`lastIndex` 屬性](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/last-index.html)。

## 委派屬性 {id="delegated-properties"}

你已經在[類別與介面](kotlin-tour-intermediate-classes-interfaces.md#delegation)章節中學習了委派。你也可以在屬性上使用委派，將其屬性存取子委派給另一個物件。當你有單純支援欄位無法處理的更複雜屬性儲存需求時（例如將值儲存在資料庫資料表、瀏覽器工作階段或 Map 中），這將非常有用。使用委派屬性還可以減少樣板程式碼，因為取得和設定屬性的邏輯僅包含在委派的物件中。

其語法類似於在類別中使用委派，但在不同的層級運作。宣告你的屬性，後接 `by` 關鍵字以及你要委派的物件。例如：

```kotlin
val displayName: String by Delegate
```

在這裡，委派屬性 `displayName` 將其屬性存取子參照至 `Delegate` 物件。

你委派的每個物件都**必須**具備一個 `getValue()` 運算子函式，Kotlin 會使用該函式來擷取委派屬性的值。如果該屬性是可變的，它還必須具備一個 `setValue()` 運算子函式，供 Kotlin 設定其值。

預設情況下，`getValue()` 和 `setValue()` 函式具有以下結構：

```kotlin
operator fun getValue(thisRef: Any?, property: KProperty<*>): String {}

operator fun setValue(thisRef: Any?, property: KProperty<*>, value: String) {}
```
{validate="false"}

在這些函式中：

* `operator` 關鍵字將這些函式標記為運算子函式，使它們能夠多載 `get()` 和 `set()` 函式。
* `thisRef` 參數參照**包含**該委派屬性的物件。預設情況下，型別設定為 `Any?`，但你可能需要宣告更具體的型別。
* `property` 參數參照其值被存取或變更的屬性。你可以使用此參數存取屬性名稱或型別等資訊。預設情況下，型別設定為 `KProperty<*>`，但你也可以使用 `Any?`。你不需要擔心在程式碼中修改此項。

`getValue()` 函式預設傳回型別為 `String`，但你可以視需要進行調整。

`setValue()` 函式有一個額外的參數 `value`，用於保存指派給該屬性的新值。

那麼，這在實務上是如何運作的呢？假設你想要一個計算屬性（例如使用者的顯示名稱），因為該運算耗費資源且你的應用程式對效能敏感，所以只計算一次。你可以使用委派屬性來快取顯示名稱，使其僅計算一次，但可以隨時存取而不會影響效能。

首先，你需要建立要委派的物件。在此範例中，該物件將是 `CachedStringDelegate` 類別的執行個體：

```kotlin
class CachedStringDelegate {
    var cachedValue: String? = null
}
```

`cachedValue` 屬性包含快取的值。在 `CachedStringDelegate` 類別內部，將你希望委派屬性的 `get()` 函式執行的行為新增至 `getValue()` 運算子函式主體中：

```kotlin
class CachedStringDelegate {
    var cachedValue: String? = null

    operator fun getValue(thisRef: Any?, property: Any?): String {
        if (cachedValue == null) {
            cachedValue = "Default Value"
            println("Computed and cached: $cachedValue")
        } else {
            println("Accessed from cache: $cachedValue")
        }
        return cachedValue ?: "Unknown"
    }
}
```

`getValue()` 函式會檢查 `cachedValue` 屬性是否為 `null`。如果是，該函式會指派 `"Default value"` 並印出字串以進行記錄。如果 `cachedValue` 屬性已經計算過，該屬性則不為 `null`。在此情況下，會印出另一個字串以供記錄。最後，函式使用 Elvis 運算子傳回快取值，如果值為 `null` 則傳回 `"Unknown"`。

現在你可以將想要快取的屬性 (`val displayName`) 委派給 `CachedStringDelegate` 類別的執行個體：

```kotlin
class CachedStringDelegate {
    var cachedValue: String? = null

    operator fun getValue(thisRef: User, property: Any?): String {
        if (cachedValue == null) {
            cachedValue = "${thisRef.firstName} ${thisRef.lastName}"
            println("Computed and cached: $cachedValue")
        } else {
            println("Accessed from cache: $cachedValue")
        }
        return cachedValue ?: "Unknown"
    }
}

class User(val firstName: String, val lastName: String) {
    val displayName: String by CachedStringDelegate()
}

fun main() {
    val user = User("John", "Doe")

    // 第一次存取會計算並快取該值
    println(user.displayName)
    // Computed and cached: John Doe
    // John Doe

    // 後續存取會從快取中擷取該值
    println(user.displayName)
    // Accessed from cache: John Doe
    // John Doe
}
```
{kotlin-runnable="true" id="kotlin-tour-properties-delegated"}

這個範例：

* 建立一個 `User` 類別，其頁首包含兩個屬性 `firstName` 與 `lastName`，類別主體中包含一個屬性 `displayName`。
* 將 `displayName` 屬性委派給 `CachedStringDelegate` 類別的執行個體。
* 建立一個名為 `user` 的 `User` 類別執行個體。
* 印出在 `user` 執行個體上存取 `displayName` 屬性的結果。

請注意，在 `getValue()` 函式中，`thisRef` 參數的型別從 `Any?` 型別縮小為物件型別：`User`。這樣編譯器才能存取 `User` 類別的 `firstName` 和 `lastName` 屬性。

### 標準委派 {id="standard-delegates"}

Kotlin 標準函式庫為你提供了一些實用的委派，因此你不必每次都從頭開始建立。如果你使用這些委派之一，則不需要定義 `getValue()` 和 `setValue()` 函式，因為標準函式庫會自動提供它們。

#### 延遲載入屬性 {id="lazy-properties"}

若要在屬性首次被存取時才進行初始化，請使用延遲屬性 (lazy property)。標準函式庫提供了 `Lazy` 介面用於委派。

若要建立 `Lazy` 介面的執行個體，請使用 `lazy()` 函式，並向其提供一個在首次呼叫 `get()` 函式時執行的 Lambda 運算式。後續對 `get()` 函式的任何呼叫都會傳回第一次呼叫時提供的相同結果。延遲屬性使用[尾隨 Lambda](kotlin-tour-functions.md#trailing-lambdas) 語法來傳遞 Lambda 運算式。

例如：

```kotlin
class Database {
    fun connect() {
        println("Connecting to the database...")
    }

    fun query(sql: String): List<String> {
        return listOf("Data1", "Data2", "Data3")
    }
}

val databaseConnection: Database by lazy {
    val db = Database()
    db.connect()
    db
}

fun fetchData() {
    val data = databaseConnection.query("SELECT * FROM data")
    println("Data: $data")
}

fun main() {
    // 第一次存取 databaseConnection
    fetchData()
    // Connecting to the database...
    // Data: [Data1, Data2, Data3]

    // 後續存取會使用現有連線
    fetchData()
    // Data: [Data1, Data2, Data3]
}
```
{kotlin-runnable="true" id="kotlin-tour-properties-lazy"}

在此範例中：

* 有一個具有 `connect()` 和 `query()` 成員函式的 `Database` 類別。 
* `connect()` 函式將字串輸出至主控台，而 `query()` 函式接受 SQL 查詢並傳回一個清單。
* 有一個身為延遲屬性的 `databaseConnection` 屬性。
* 提供給 `lazy()` 函式的 Lambda 運算式：
  * 建立 `Database` 類別的執行個體。
  * 在此執行個體 (`db`) 上呼叫 `connect()` 成員函式。
  * 傳回該執行個體。
* 有一個 `fetchData()` 函式：
  * 藉由在 `databaseConnection` 屬性上呼叫 `query()` 函式來建立 SQL 查詢。
  * 將 SQL 查詢指派給 `data` 變數。
  * 將 `data` 變數印出至主控台。
* `main()` 函式呼叫 `fetchData()` 函式。第一次呼叫時，延遲屬性會被初始化。第二次呼叫時，則傳回與第一次呼叫相同的結果。

延遲屬性不僅在初始化需要大量資源時很有用，在程式碼中可能根本不會使用到該屬性時也非常有用。此外，延遲屬性預設是執行緒安全的 (thread-safe)，這在並行環境中特別有益。

若要了解更多，請參閱[延遲屬性](delegated-properties.md#lazy-properties)。

#### 可觀察屬性 {id="observable-properties"}

若要監控屬性的值是否變更，請使用可觀察屬性 (observable property)。當你想要偵測屬性值的變更並利用此資訊觸發反應時，可觀察屬性非常有用。標準函式庫提供了 `Delegates` 物件用於委派。

若要建立可觀察屬性，必須先匯入 `kotlin.properties.Delegates.observable`。接著，使用 `observable()` 函式並為其提供一個在屬性變更時執行的 Lambda 運算式。與延遲屬性相同，可觀察屬性也使用[尾隨 Lambda](kotlin-tour-functions.md#trailing-lambdas) 語法來傳遞 Lambda 運算式。

例如：

```kotlin
import kotlin.properties.Delegates.observable

class Thermostat {
    var temperature: Double by observable(20.0) { _, old, new ->
        if (new > 25) {
            println("Warning: Temperature is too high! ($old°C -> $new°C)")
        } else {
            println("Temperature updated: $old°C -> $new°C")
        }
    }
}

fun main() {
    val thermostat = Thermostat()
    thermostat.temperature = 22.5
    // Temperature updated: 20.0°C -> 22.5°C

    thermostat.temperature = 27.0
    // Warning: Temperature is too high! (22.5°C -> 27.0°C)
}
```
{kotlin-runnable="true" id="kotlin-tour-properties-observable"}

在此範例中：

* 有一個包含可觀察屬性 `temperature` 的 `Thermostat` 類別。
* `observable()` 函式接受 `20.0` 作為參數，並使用它來初始化屬性。
* 提供給 `observable()` 函式的 Lambda 運算式：
  * 具有三個參數：
    * `_`，指涉屬性本身。
    * `old`，屬性的舊值。
    * `new`，屬性的新值。
  * 檢查 `new` 參數是否大於 `25`，並根據結果將字串輸出至主控台。
* `main()` 函式：
  * 建立一個名為 `thermostat` 的 `Thermostat` 類別執行個體。
  * 將該執行個體的 `temperature` 屬性值更新為 `22.5`，這會觸發印出帶有溫度更新的陳述式。
  * 將該執行個體的 `temperature` 屬性值更新為 `27.0`，這會觸發印出帶有警告的陳述式。

可觀察屬性不僅對記錄日誌和偵錯有用。你還可以將其用於更新 UI 或執行額外檢查（例如驗證資料的有效性）等使用案例。

若要了解更多，請參閱[可觀察屬性](delegated-properties.md#observable-properties)。

## 練習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="尋找缺貨書籍" id="properties-exercise-1">

你在一家書店管理庫存系統。庫存儲存在一個清單中，其中每個項目代表特定書籍的數量。例如，`listOf(3, 0, 7, 12)` 表示書店有第一本書 3 本、第二本 0 本、第三本 7 本，以及第四本 12 本。

寫一個名為 `findOutOfStockBooks()` 的函式，傳回所有缺貨書籍的索引清單。

<deflist collapsible="true">
    <def title="提示 1">
        使用標準函式庫中的 <a href="https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/indices.html"><code>indices</code></a> 擴充屬性。
    </def>
</deflist>

<deflist collapsible="true">
    <def title="提示 2">
        你可以使用 <a href="https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/build-list.html"><code>buildList()</code></a> 函式來建立與管理清單，而不是手動建立並傳回可變清單。<code>buildList()</code> 函式使用了帶有接收者的 Lambda，你在前面的章節中已經學習過。
    </def>
</deflist>

```kotlin
fun findOutOfStockBooks(inventory: List<Int>): List<Int> {
    // 在此處編寫你的程式碼
}

fun main() {
    val inventory = listOf(3, 0, 7, 0, 5)
    println(findOutOfStockBooks(inventory))
    // [1, 3]
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/FindOutOfStockBooksTest.kt" validate="false" id="kotlin-tour-properties-exercise-1"}

```kotlin
fun findOutOfStockBooks(inventory: List<Int>): List<Int> {
    val outOfStockIndices = mutableListOf<Int>()
    for (index in inventory.indices) {
        if (inventory[index] == 0) {
            outOfStockIndices.add(index)
        }
    }
    return outOfStockIndices
}

fun main() {
    val inventory = listOf(3, 0, 7, 0, 5)
    println(findOutOfStockBooks(inventory))
    // [1, 3]
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/FindOutOfStockBooksTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答 1" id="kotlin-tour-properties-solution-1-1"}

```kotlin
fun findOutOfStockBooks(inventory: List<Int>): List<Int> = buildList {
    for (index in inventory.indices) {
        if (inventory[index] == 0) {
            add(index)
        }
    }
}

fun main() {
    val inventory = listOf(3, 0, 7, 0, 5)
    println(findOutOfStockBooks(inventory))
    // [1, 3]
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/FindOutOfStockBooksTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答 2" id="kotlin-tour-properties-solution-1-2"}

</def>
<def title="將公里轉換為英里" id="properties-exercise-2">

你有一個旅遊應用程式，需要同時以公里和英里顯示距離。為 `Double` 型別建立一個名為 `asMiles` 的擴充屬性，以將公里距離轉換為英里：

> 將公里轉換為英里的公式為 `miles = kilometers * 0.621371`。
>
{style="note"}

<deflist collapsible="true">
    <def title="提示">
        請記住，擴充屬性需要自訂的 <code>get()</code> 函式。
    </def>
</deflist>

```kotlin
val // 在此處編寫你的程式碼

fun main() {
    val distanceKm = 5.0
    println("$distanceKm km is ${distanceKm.asMiles} miles")
    // 5.0 km is 3.106855 miles

    val marathonDistance = 42.195
    println("$marathonDistance km is ${marathonDistance.asMiles} miles")
    // 42.195 km is 26.218749345 miles
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/AsMilesTest.kt" validate="false" id="kotlin-tour-properties-exercise-2"}

```kotlin
val Double.asMiles: Double
    get() = this * 0.621371

fun main() {
    val distanceKm = 5.0
    println("$distanceKm km is ${distanceKm.asMiles} miles")
    // 5.0 km is 3.106855 miles

    val marathonDistance = 42.195
    println("$marathonDistance km is ${marathonDistance.asMiles} miles")
    // 42.195 km is 26.218749345 miles
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/AsMilesTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-properties-solution-2"}

</def>
<def title="延遲初始化健康檢查" id="properties-exercise-3">

你有一個系統健康檢查程式，可以判斷雲端系統的狀態。但是，它用於執行健康檢查的兩個函式需要大量效能。使用延遲屬性來初始化這些檢查，以便僅在需要時才執行這些耗費資源的函式：

```kotlin
fun checkAppServer(): Boolean {
    println("Performing application server health check...")
    return true
}

fun checkDatabase(): Boolean {
    println("Performing database health check...")
    return false
}

fun main() {
    // 在此處編寫你的程式碼

    when {
        isAppServerHealthy -> println("Application server is online and healthy")
        isDatabaseHealthy -> println("Database is healthy")
        else -> println("System is offline")
    }
    // Performing application server health check...
    // Application server is online and healthy
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/LazyHealthCheckTest.kt" validate="false" id="kotlin-tour-properties-exercise-3"}

```kotlin
fun checkAppServer(): Boolean {
    println("Performing application server health check...")
    return true
}

fun checkDatabase(): Boolean {
    println("Performing database health check...")
    return false
}

fun main() {
    val isAppServerHealthy by lazy { checkAppServer() }
    val isDatabaseHealthy by lazy { checkDatabase() }

    when {
        isAppServerHealthy -> println("Application server is online and healthy")
        isDatabaseHealthy -> println("Database is healthy")
        else -> println("System is offline")
    }
   // Performing application server health check...
   // Application server is online and healthy
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/LazyHealthCheckTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-properties-solution-3"}

</def>
<def title="追蹤預算變更" id="properties-exercise-4">

你正在建置一個簡單的預算追蹤應用程式。該應用程式需要觀察使用者剩餘預算的變更，並在低於特定閾值時通知他們。你有一個 `Budget` 類別，它使用包含初始預算金額的 `totalBudget` 屬性進行初始化。在該類別內部，建立一個名為 `remainingBudget` 的可觀察屬性，該屬性會輸出：

* 當金額低於初始預算的 20% 時發出警告。
* 當預算較前一個值增加時發出激勵訊息。

```kotlin
import kotlin.properties.Delegates.observable

class Budget(val totalBudget: Int) {
    var remainingBudget: Int // 在此處編寫你的程式碼
}

fun main() {
    val myBudget = Budget(totalBudget = 1000)
    myBudget.remainingBudget = 800
    myBudget.remainingBudget = 150
    // Warning: Your remaining budget (150) is below 20% of your total budget.
    myBudget.remainingBudget = 50
    // Warning: Your remaining budget (50) is below 20% of your total budget.
    myBudget.remainingBudget = 300
    // Good news: Your remaining budget increased to 300.
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/BudgetTest.kt" validate="false" id="kotlin-tour-properties-exercise-4"}

```kotlin
import kotlin.properties.Delegates.observable

class Budget(val totalBudget: Int) {
    var remainingBudget: Int by observable(totalBudget) { _, oldValue, newValue ->
        if (newValue < totalBudget * 0.2) {
            println("Warning: Your remaining budget ($newValue) is below 20% of your total budget.")
        } else if (newValue > oldValue) {
            println("Good news: Your remaining budget increased to $newValue.")
        }
    }
}

fun main() {
    val myBudget = Budget(totalBudget = 1000)
    myBudget.remainingBudget = 800
    myBudget.remainingBudget = 150
    // Warning: Your remaining budget (150) is below 20% of your total budget.
    myBudget.remainingBudget = 50
    // Warning: Your remaining budget (50) is below 20% of your total budget.
    myBudget.remainingBudget = 300
    // Good news: Your remaining budget increased to 300.
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/BudgetTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-properties-solution-4"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-open-special-classes.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-null-safety.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>