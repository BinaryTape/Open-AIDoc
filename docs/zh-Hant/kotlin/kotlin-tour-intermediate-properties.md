[//]: # (title: 屬性)

<no-index/>

在初學者導覽中，你已經學習了如何使用屬性來宣告類別執行個體的特徵，以及如何存取它們。本章節將深入探討屬性在 Kotlin 中的運作方式，並探索在程式碼中使用它們的其他方式。

## 支援欄位 (Backing fields) {id="backing-fields"}

在 Kotlin 中，屬性具有預設的 `get()` 與 `set()` 函式，稱為屬性存取子，負責處理屬性值的擷取與修改。雖然這些預設函式在程式碼中不明顯可見，但編譯器會在幕後自動產生它們來管理屬性存取。這些存取子使用**支援欄位**來儲存實際的屬性值。

若符合以下任一條件，支援欄位便會存在：

* 你為該屬性使用了預設的 `get()` 或 `set()` 函式。
* 你嘗試在程式碼中使用 `field` 關鍵字存取屬性值。

> `get()` 與 `set()` 函式也被稱為 getter 與 setter。
>
{style="tip"}

例如，以下程式碼中的 `category` 屬性沒有自訂的 `get()` 或 `set()` 函式，因此使用預設實作：

```kotlin
class Contact(val id: Int, var email: String) {
    var category: String = ""
}
```

在底層，這等同於以下虛擬碼：

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

* `get()` 函式從欄位中擷取屬性值：`""`。
* `set()` 函式接受 `value` 作為參數並將其指派給欄位，其中 `value` 為 `""`。 

當你想在 `get()` 或 `set()` 函式中加入額外邏輯而不造成無窮迴圈時，存取支援欄位非常有用。例如，你有一個帶有 `name` 屬性的 `Person` 類別：

```kotlin
class Person {
    var name: String = ""
}
```

你想確保 `name` 屬性的首字母大寫，因此建立了一個使用 [`.replaceFirstChar()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/replace-first-char.html) 和 [`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase-char.html) 擴充函式的自訂 `set()` 函式。然而，如果你在 `set()` 函式中直接參照該屬性，將會建立一個無窮迴圈，並在執行時期看到 `StackOverflowError`：

```kotlin
class Person {
    var name: String = ""
        set(value) {
            // This causes a runtime error
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
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-stackoverflow"}

若要修正此問題，可以在 `set()` 函式中改為使用 `field` 關鍵字參照支援欄位：

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-backingfield"}

當你想要新增記錄 (logging)、在屬性值變更時傳送通知，或是使用額外邏輯來比較新舊屬性值時，支援欄位也十分有用。

如需更多資訊，請參閱[支援欄位](properties.md#backing-fields)。

## 擴充屬性 {id="extension-properties"}

就像擴充函式一樣，Kotlin 也提供擴充屬性。擴充屬性可讓你在不修改現有類別原始碼的情況下，為其新增屬性。但是，Kotlin 中的擴充屬性**沒有**支援欄位。這意味著你必須自行撰寫 `get()` 與 `set()` 函式。此外，缺乏支援欄位也意味著它們無法保存任何狀態。

若要宣告擴充屬性，請寫出要擴充的類別名稱，接著加上 `.` 和屬性名稱。與一般類別屬性相同，你必須為屬性宣告型別。例如：

```kotlin
val String.lastChar: Char
```
{validate="false"}

當你希望屬性包含計算值而無需使用繼承時，擴充屬性最為實用。你可以將擴充屬性想像為只有一個參數（接收者，receiver）的函式。

例如，假設你有一個名為 `Person` 的資料類別，包含兩個屬性：`firstName` 和 `lastName`。

```kotlin
data class Person(val firstName: String, val lastName: String)
```

你希望能夠存取該人物的全名，但不想修改 `Person` 資料類別或繼承它。你可以透過建立帶有自訂 `get()` 函式的擴充屬性來達成：

```kotlin
data class Person(val firstName: String, val lastName: String)

// Extension property to get the full name
val Person.fullName: String
    get() = "$firstName $lastName"

fun main() {
    val person = Person(firstName = "John", lastName = "Doe")

    // Use the extension property
    println(person.fullName)
    // John Doe
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-extension"}

> 擴充屬性無法覆寫類別現有的屬性。
> 
{style="note"}

就像擴充函式一樣，Kotlin 標準程式庫廣泛使用了擴充屬性。例如，請參閱 `CharSequence` 的 [`lastIndex` 屬性](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/last-index.html)。

## 委託屬性 (Delegated properties) {id="delegated-properties"}

你已經在[類別與介面](kotlin-tour-intermediate-classes-interfaces.md#delegation)章節中學習了委託。你也可以將委託與屬性結合使用，將其屬性存取子委託給另一個物件。當你有更複雜的屬性儲存需求，而簡單的支援欄位無法處理時（例如將值儲存在資料庫資料表、瀏覽器工作階段或 Map 中），這會非常有用。使用委託屬性還可以減少樣板程式碼，因為取得與設定屬性的邏輯僅包含在委託對象中。

其語法類似於類別委託，但在不同的層級運作。宣告屬性後，加上 `by` 關鍵字以及你要委託的物件。例如：

```kotlin
val displayName: String by Delegate
```

在此，委託屬性 `displayName` 將其屬性存取子委託給 `Delegate` 物件。

每個受委託的物件**必須**具備 `getValue()` 運算子函式，Kotlin 會使用該函式來擷取委託屬性的值。如果該屬性是可變的 (mutable)，它還必須具備 `setValue()` 運算子函式，以便 Kotlin 設定其值。

預設情況下，`getValue()` 和 `setValue()` 函式具有以下結構：

```kotlin
operator fun getValue(thisRef: Any?, property: KProperty<*>): String {}

operator fun setValue(thisRef: Any?, property: KProperty<*>, value: String) {}
```
{validate="false"}

在這些函式中：

* `operator` 關鍵字將這些函式標記為運算子函式，使它們能夠多載 `get()` 和 `set()` 函式。
* `thisRef` 參數代表**包含**委託屬性的物件。預設情況下，型別設定為 `Any?`，但你可能需要宣告更具體的型別。
* `property` 參數代表被存取或變更值的屬性。你可以使用此參數存取屬性名稱或型別等資訊。預設情況下，型別設定為 `KProperty<*>`，但你也可以使用 `Any?`。你不需要擔心在程式碼中修改它。

`getValue()` 函式預設的傳回型別為 `String`，但你可以依需求進行調整。

`setValue()` 函式有一個額外的參數 `value`，用於保存指派給該屬性的新值。

那麼，這在實務上是如何運作的？假設你需要一個計算屬性（例如使用者的顯示名稱），因為該運算開銷較大且應用程式對效能較為敏感，因此只計算一次。你可以使用委託屬性來快取顯示名稱，使其只計算一次，之後便可隨時存取而不會影響效能。

首先，你需要建立委託對象。在此例中，該物件將是 `CachedStringDelegate` 類別的執行個體：

```kotlin
class CachedStringDelegate {
    var cachedValue: String? = null
}
```

`cachedValue` 屬性包含快取的值。在 `CachedStringDelegate` 類別內，將委託屬性的 `get()` 函式所需的行為加入到 `getValue()` 運算子函式的主體中：

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

`getValue()` 函式檢查 `cachedValue` 屬性是否為 `null`。如果是，該函式會指派 `"Default value"` 並印出字串以供記錄之用。如果 `cachedValue` 屬性已經計算過，該屬性便不是 `null`。在此情況下，會印出另一個字串以供記錄。最後，函式使用 Elvis 運算子傳回快取的值，若值為 `null` 則傳回 `"Unknown"`。

現在你可以將想要快取的屬性 (`val displayName`) 委託給 `CachedStringDelegate` 類別的執行個體：

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

    // First access computes and caches the value
    println(user.displayName)
    // Computed and cached: John Doe
    // John Doe

    // Subsequent accesses retrieve the value from cache
    println(user.displayName)
    // Accessed from cache: John Doe
    // John Doe
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-delegated"}

此範例：

* 建立了一個 `User` 類別，其標頭中有兩個屬性 `firstName` 與 `lastName`，類別主體中有一個屬性 `displayName`。
* 將 `displayName` 屬性委託給 `CachedStringDelegate` 類別的執行個體。
* 建立了名為 `user` 的 `User` 類別執行個體。
* 印出存取 `user` 執行個體上 `displayName` 屬性的結果。

請注意，在 `getValue()` 函式中，`thisRef` 參數的型別從 `Any?` 型別縮小為物件型別：`User`。這樣編譯器才能存取 `User` 類別的 `firstName` 和 `lastName` 屬性。

### 標準委託 {id="standard-delegates"}

Kotlin 標準程式庫提供了一些好用的委託，因此你不必總是從頭建立。如果你使用這些委託之一，則不需要定義 `getValue()` 和 `setValue()` 函式，因為標準程式庫會自動提供它們。

#### 延遲載入屬性 (Lazy properties) {id="lazy-properties"}

若要在屬性首次被存取時才進行初始化，請使用延遲屬性。標準程式庫提供了 `Lazy` 介面以供委託使用。

若要建立 `Lazy` 介面的執行個體，請使用 `lazy()` 函式，並向其提供一個 Lambda 運算式，以便在首次呼叫 `get()` 函式時執行。之後對 `get()` 函式的任何呼叫都會傳回首次呼叫時提供的相同結果。延遲屬性使用[尾隨 Lambda](kotlin-tour-functions.md#trailing-lambdas) 語法來傳遞 Lambda 運算式。

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
    // First time accessing databaseConnection
    fetchData()
    // Connecting to the database...
    // Data: [Data1, Data2, Data3]

    // Subsequent access uses the existing connection
    fetchData()
    // Data: [Data1, Data2, Data3]
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-lazy"}

在此範例中：

* 有一個具有 `connect()` 和 `query()` 成員函式的 `Database` 類別。
* `connect()` 函式向主控台印出字串，而 `query()` 函式接受 SQL 查詢並傳回清單。
* 有一個 `databaseConnection` 屬性，它是一個延遲屬性。
* 提供給 `lazy()` 函式的 Lambda 運算式：
  * 建立 `Database` 類別的執行個體。
  * 在此執行個體 (`db`) 上呼叫 `connect()` 成員函式。
  * 傳回該執行個體。
* 有一個 `fetchData()` 函式：
  * 透過在 `databaseConnection` 屬性上呼叫 `query()` 函式來建立 SQL 查詢。
  * 將 SQL 查詢指派給 `data` 變數。
  * 將 `data` 變數印出至主控台。
* `main()` 函式呼叫 `fetchData()` 函式。首次呼叫時，延遲屬性會被初始化。第二次呼叫時，會傳回與首次呼叫相同的結果。

延遲屬性不僅在初始化耗費資源時很有用，在程式碼中可能根本不會使用到該屬性時也非常有用。此外，延遲屬性預設是執行緒安全 (thread-safe) 的，如果你在並行環境中工作，這會特別有益。

如需更多資訊，請參閱[延遲屬性](delegated-properties.md#lazy-properties)。

#### 可觀察屬性 (Observable properties) {id="observable-properties"}

若要監控屬性的值是否變更，請使用可觀察屬性。當你想要偵測屬性值的變更並利用該資訊觸發反應時，可觀察屬性非常有用。標準程式庫提供了 `Delegates` 物件以供委託使用。

若要建立可觀察屬性，必須先匯入 `kotlin.properties.Delegates.observable`。然後，使用 `observable()` 函式並向其提供一個 Lambda 運算式，以便在屬性每次變更時執行。與延遲屬性一樣，可觀察屬性也使用[尾隨 Lambda](kotlin-tour-functions.md#trailing-lambdas) 語法來傳遞 Lambda 運算式。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-observable"}

在此範例中：

* 有一個 `Thermostat` 類別，包含一個可觀察屬性：`temperature`。
* `observable()` 函式接受 `20.0` 作為參數，並用它來初始化屬性。
* 提供給 `observable()` 函式的 Lambda 運算式：
  * 具有三個參數：
    * `_`，代表屬性本身。
    * `old`，代表屬性的舊值。
    * `new`，代表屬性的新值。
  * 檢查 `new` 參數是否大於 `25`，並根據結果向主控台印出字串。
* `main()` 函式：
  * 建立名為 `thermostat` 的 `Thermostat` 類別執行個體。
  * 將執行個體的 `temperature` 屬性值更新為 `22.5`，這會觸發印出溫度更新的陳述式。
  * 將執行個體的 `temperature` 屬性值更新為 `27.0`，這會觸發印出警告的陳述式。

可觀察屬性不僅對記錄和偵錯很有用。你還可以將它們用於更新 UI 或執行額外檢查（例如驗證資料的有效性）等使用案例。

如需更多資訊，請參閱[可觀察屬性](delegated-properties.md#observable-properties)。

## 練習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="尋找缺貨書籍" id="properties-exercise-1">

你正在管理書店的庫存系統。庫存儲存在一個清單中，其中每個項目代表特定書籍的數量。例如，`listOf(3, 0, 7, 12)` 表示書店有 3 本第一本書、0 本第二本書、7 本第三本書，以及 12 本第四本書。

撰寫一個名為 `findOutOfStockBooks()` 的函式，傳回所有缺貨書籍的索引清單。

<deflist collapsible="true">
    <def title="提示 1">
        使用標準程式庫中的 <a href="https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/indices.html"><code>indices</code></a> 擴充屬性。
    </def>
</deflist>

<deflist collapsible="true">
    <def title="提示 2">
        你可以使用 <a href="https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/build-list.html"><code>buildList()</code></a> 函式來建立和管理清單，而無需手動建立並傳回可變清單。<code>buildList()</code> 函式使用了帶有接收者的 Lambda，這已在前面的章節中介紹過。
    </def>
</deflist>

```kotlin
fun findOutOfStockBooks(inventory: List<Int>): List<Int> {
    // Write your code here
}

fun main() {
    val inventory = listOf(3, 0, 7, 0, 5)
    println(findOutOfStockBooks(inventory))
    // [1, 3]
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-exercise-1"}

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答 1" id="kotlin-tour-properties-solution-1-1"}

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答 2" id="kotlin-tour-properties-solution-1-2"}

</def>
<def title="將公里轉換為英哩" id="properties-exercise-2">

你有一個旅遊應用程式，需要同時以公里和英哩顯示距離。為 `Double` 型別建立一個名為 `asMiles` 的擴充屬性，將以公里為單位的距離轉換為英哩：

> 將公里轉換為英哩的公式為 `miles = kilometers * 0.621371`。
>
{style="note"}

<deflist collapsible="true">
    <def title="提示">
        請記住擴充屬性需要自訂的 <code>get()</code> 函式。
    </def>
</deflist>

```kotlin
val // Write your code here

fun main() {
    val distanceKm = 5.0
    println("$distanceKm km is ${distanceKm.asMiles} miles")
    // 5.0 km is 3.106855 miles

    val marathonDistance = 42.195
    println("$marathonDistance km is ${marathonDistance.asMiles} miles")
    // 42.195 km is 26.218757 miles
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-exercise-2"}

```kotlin
val Double.asMiles: Double
    get() = this * 0.621371

fun main() {
    val distanceKm = 5.0
    println("$distanceKm km is ${distanceKm.asMiles} miles")
    // 5.0 km is 3.106855 miles

    val marathonDistance = 42.195
    println("$marathonDistance km is ${marathonDistance.asMiles} miles")
    // 42.195 km is 26.218757 miles
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-properties-solution-2"}

</def>
<def title="延遲初始化健康檢查" id="properties-exercise-3">

你有一個系統健康檢查器，可以判斷雲端系統的狀態。但是，它執行健康檢查的兩個函式需要消耗大量效能。使用延遲屬性來初始化這些檢查，以便僅在需要時才執行高開銷的函式：

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
    // Write your code here

    when {
        isAppServerHealthy -> println("Application server is online and healthy")
        isDatabaseHealthy -> println("Database is healthy")
        else -> println("System is offline")
    }
    // Performing application server health check...
    // Application server is online and healthy
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-exercise-3"}

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-properties-solution-3"}

</def>
<def title="追蹤預算變更" id="properties-exercise-4">

你正在建置一個簡易的預算追蹤應用程式。該應用程式需要觀察使用者剩餘預算的變更，並在低於特定閾值時通知他們。你有一個使用 `totalBudget` 屬性初始化的 `Budget` 類別，該屬性包含初始預算金額。在類別內建立一個名為 `remainingBudget` 的可觀察屬性，用於印出：

* 當金額低於初始預算的 20% 時顯示警告。
* 當預算相較於前一次增加時顯示鼓勵訊息。

```kotlin
import kotlin.properties.Delegates.observable

class Budget(val totalBudget: Int) {
    var remainingBudget: Int // Write your code here
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
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-exercise-4"}

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-properties-solution-4"}

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