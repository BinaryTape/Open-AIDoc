[//]: # (title: 中階：屬性)

<no-index/>

<tldr>
    <p><img src="icon-1-done.svg" width="20" alt="First step" /> <a href="kotlin-tour-intermediate-extension-functions.md">擴充函式</a><br />
        <img src="icon-2-done.svg" width="20" alt="Second step" /> <a href="kotlin-tour-intermediate-scope-functions.md">作用域函式</a><br />
        <img src="icon-3-done.svg" width="20" alt="Third step" /> <a href="kotlin-tour-intermediate-lambdas-receiver.md">帶接收者的 Lambda 運算式</a><br />
        <img src="icon-4-done.svg" width="20" alt="Fourth step" /> <a href="kotlin-tour-intermediate-classes-interfaces.md">類別與介面</a><br />
        <img src="icon-5-done.svg" width="20" alt="Fifth step" /> <a href="kotlin-tour-intermediate-objects.md">物件</a><br />
        <img src="icon-6-done.svg" width="20" alt="Sixth step" /> <a href="kotlin-tour-intermediate-open-special-classes.md">Open 與特殊類別</a><br />
        <img src="icon-7.svg" width="20" alt="Seventh step" /> <strong>屬性</strong><br />
        <img src="icon-8-todo.svg" width="20" alt="Eighth step" /> <a href="kotlin-tour-intermediate-null-safety.md">空值安全</a><br />
        <img src="icon-9-todo.svg" width="20" alt="Ninth step" /> <a href="kotlin-tour-intermediate-libraries-and-apis.md">程式庫與 API</a></p>
</tldr>

在初學者導覽中，您學習了如何使用屬性來宣告類別執行個體的特性，以及如何存取它們。本章節將深入探討 Kotlin 中屬性的運作方式，並探索您可以在程式碼中使用的其他方式。

## 支援欄位 (Backing fields)

在 Kotlin 中，屬性具有預設的 `get()` 和 `set()` 函式（稱為屬性存取子），用於處理值的檢索和修改。雖然這些預設函式在程式碼中不明顯可見，但編譯器會自動產生它們，以便在後台管理屬性存取。這些存取子使用 **支援欄位** 來儲存實際的屬性值。

如果符合以下任一條件，則會存在支援欄位：

* 您為屬性使用預設的 `get()` 或 `set()` 函式。
* 您嘗試透過在程式碼中使用 `field` 關鍵字來存取屬性值。

> `get()` 和 `set()` 函式也被稱為 getter 和 setter。
>
{style="tip"}

例如，這段程式碼具有 `category` 屬性，它沒有自訂的 `get()` 或 `set()` 函式，因此使用預設實作：

```kotlin
class Contact(val id: Int, var email: String) {
    var category: String = ""
}
```

在底層，這相當於以下虛擬碼：

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

* `get()` 函式從欄位中檢索屬性值：`""`。
* `set()` 函式接受 `value` 作為參數，並將其指派給欄位，其中 `value` 為 `""`。

當您想在 `get()` 或 `set()` 函式中加入額外邏輯而又不造成無窮迴圈時，存取支援欄位非常有用。例如，您有一個帶有 `name` 屬性的 `Person` 類別：

```kotlin
class Person {
    var name: String = ""
}
```

您想要確保 `name` 屬性的首字母大寫，因此您建立了一個自訂的 `set()` 函式，該函式使用 [`.replaceFirstChar()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/replace-first-char.html) 和 [`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase-char.html) 擴充函式。然而，如果您在 `set()` 函式中直接引用屬性，將會建立一個無窮迴圈，並在執行期看到 `StackOverflowError`：

```kotlin
class Person {
    var name: String = ""
        set(value) {
            // 這會導致執行期錯誤
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

要解決此問題，您可以改為在 `set()` 函式中使用支援欄位，透過 `field` 關鍵字引用它：

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

當您想要新增日誌記錄、在屬性值變更時發送通知，或使用比較屬性新舊值的額外邏輯時，支援欄位也很有用。

欲了解更多資訊，請參閱 [支援欄位](properties.md#backing-fields)。

## 擴充屬性 (Extension properties)

就像擴充函式一樣，也存在擴充屬性。擴充屬性允許您在不修改原始碼的情況下，向現有類別新增屬性。然而，Kotlin 中的擴充屬性 **不** 具有支援欄位。這意味著您需要自行撰寫 `get()` 和 `set()` 函式。此外，由於缺乏支援欄位，這意味著它們無法持有任何狀態。

要宣告擴充屬性，請寫下您要擴充的類別名稱，後接一個 `.` 和您的屬性名稱。就像一般類別屬性一樣，您需要為屬性宣告型別。
例如：

```kotlin
val String.lastChar: Char
```
{validate="false"}

當您希望屬性包含計算值而又不使用繼承時，擴充屬性最為有用。您可以將擴充屬性想像成只有一個參數的函式：接收者。

例如，假設您有一個名為 `Person` 的資料類別，具有兩個屬性：`firstName` 和 `lastName`。

```kotlin
data class Person(val firstName: String, val lastName: String)
```

您希望能夠在不修改 `Person` 資料類別或繼承它的情況下，存取人員的全名。您可以透過建立具有自訂 `get()` 函式的擴充屬性來實現此目的：

```kotlin
data class Person(val firstName: String, val lastName: String)

// 擴充屬性以取得全名
val Person.fullName: String
    get() = "$firstName $lastName"

fun main() {
    val person = Person(firstName = "John", lastName = "Doe")

    // 使用擴充屬性
    println(person.fullName)
    // John Doe
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-extension"}

> 擴充屬性無法覆寫類別中既有的屬性。
> 
{style="note"}

就像擴充函式一樣，Kotlin 標準函式庫廣泛使用了擴充屬性。例如，請參閱 `CharSequence` 的 [`lastIndex` 屬性](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/last-index.html)。

## 委派屬性 (Delegated properties)

您已經在[類別與介面](kotlin-tour-intermediate-classes-interfaces.md#delegation)章節中了解過委派。您也可以對屬性使用委派，將其屬性存取子委派給另一個物件。當您對儲存屬性有更複雜的需求，而簡單的支援欄位無法處理時（例如將值儲存在資料庫資料表、瀏覽器工作階段或 Map 中），這非常有用。使用委派屬性還能減少樣板程式碼，因為獲取和設定屬性的邏輯僅包含在您委派給的物件中。

語法類似於對類別使用委派，但運作層級不同。宣告您的屬性，後接 `by` 關鍵字和您要委派給的物件。例如：

```kotlin
val displayName: String by Delegate
```

在這裡，委派屬性 `displayName` 將其屬性存取子指向 `Delegate` 物件。

您委派給的每個物件 **必須** 具有一個 `getValue()` 運算子函式，Kotlin 使用該函式來檢索委派屬性的值。如果屬性是可變的，它還必須具有一個 `setValue()` 運算子函式，供 Kotlin 設定其值。

預設情況下，`getValue()` 和 `setValue()` 函式具有以下結構：

```kotlin
operator fun getValue(thisRef: Any?, property: KProperty<*>): String {}

operator fun setValue(thisRef: Any?, property: KProperty<*>, value: String) {}
```
{validate="false"}

在這些函式中：

* `operator` 關鍵字將這些函式標記為運算子函式，使其能夠多載 `get()` 和 `set()` 函式。
* `thisRef` 參數指的是 **包含** 委派屬性的物件。預設情況下，型別設定為 `Any?`，但您可能需要宣告更具體的型別。
* `property` 參數指的是被存取或更改其值的屬性。您可以使用此參數來存取屬性名稱或型別等資訊。預設情況下，型別設定為 `KProperty<*>`，但您也可以使用 `Any?`。您不需要擔心在程式碼中更改此設定。

`getValue()` 函式預設的傳回型別為 `String`，但您可以根據需要進行調整。

`setValue()` 函式有一個額外的參數 `value`，用於持有被指派給屬性的新值。

那麼，這在實踐中看起來如何？假設您想要一個計算屬性（例如使用者的顯示名稱），該屬性僅計算一次，因為該操作開銷很大且您的應用程式對效能敏感。您可以使用委派屬性來快取顯示名稱，這樣它只會被計算一次，但可以隨時存取而不會影響效能。

首先，您需要建立要委派給的物件。在這種情況下，該物件將是 `CachedStringDelegate` 類別的執行個體：

```kotlin
class CachedStringDelegate {
    var cachedValue: String? = null
}
```

`cachedValue` 屬性包含快取的值。在 `CachedStringDelegate` 類別中，將您希望委派屬性的 `get()` 函式具備的行為，新增到 `getValue()` 運算子函式主體中：

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

`getValue()` 函式檢查 `cachedValue` 屬性是否為 `null`。如果是，則函式會指派 `"Default value"` 並列印一個字串以便記錄。如果 `cachedValue` 屬性已經計算過，則屬性不為 `null`。在這種情況下，會列印另一個字串以便記錄。最後，函式使用 Elvis 運算子傳回快取值，如果值為 `null` 則傳回 `"Unknown"`。

現在，您可以將您想要快取的屬性 (`val displayName`) 委派給 `CachedStringDelegate` 類別的執行個體：

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

    // 第一次存取會計算並快取值
    println(user.displayName)
    // Computed and cached: John Doe
    // John Doe

    // 後續存取則從快取中檢索值
    println(user.displayName)
    // Accessed from cache: John Doe
    // John Doe
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-delegated"}

此範例：

* 建立了一個 `User` 類別，其標頭中有兩個屬性 `firstName` 和 `lastName`，類別主體中有一個屬性 `displayName`。
* 將 `displayName` 屬性委派給 `CachedStringDelegate` 類別的執行個體。
* 建立了 `User` 類別的執行個體 `user`。
* 列印存取 `user` 執行個體上的 `displayName` 屬性的結果。

請注意，在 `getValue()` 函式中，`thisRef` 參數的型別從 `Any?` 型別縮小為物件型別：`User`。這是為了讓編譯器可以存取 `User` 類別的 `firstName` 和 `lastName` 屬性。

### 標準委派

Kotlin 標準函式庫提供了一些有用的委派，因此您不一定總是需要從頭開始建立自己的委派。如果您使用這些委派之一，則不需要定義 `getValue()` 和 `setValue()` 函式，因為標準函式庫會自動提供它們。

#### 延遲載入屬性 (Lazy properties)

要僅在屬性首次被存取時才初始化它，請使用延遲載入屬性。標準函式庫提供了 `Lazy` 介面用於委派。

要建立 `Lazy` 介面的執行個體，請使用 `lazy()` 函式，並提供一個 Lambda 運算式，以便在首次呼叫 `get()` 函式時執行。後續任何對 `get()` 函式的呼叫都會傳回第一次呼叫時提供的相同結果。延遲載入屬性使用[尾隨 Lambda](kotlin-tour-functions.md#trailing-lambdas) 語法來傳遞 Lambda 運算式。

例如：

```kotlin
class Database {
    fun connect() {
        println("Connecting to the database...")
    }

    fun query(sql: String): `List<String>` {
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

    // 後續存取則使用現有連線
    fetchData()
    // Data: [Data1, Data2, Data3]
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-lazy"}

在此範例中：

* 有一個具有 `connect()` 和 `query()` 成員函式的 `Database` 類別。
* `connect()` 函式將字串列印到主控台，而 `query()` 函式接受 SQL 查詢並傳回一個清單。
* 有一個 `databaseConnection` 屬性，它是一個延遲載入屬性。
* 提供給 `lazy()` 函式的 Lambda 運算式：
    * 建立了 `Database` 類別的執行個體。
    * 在此執行個體 (`db`) 上呼叫 `connect()` 成員函式。
    * 傳回該執行個體。
* 有一個 `fetchData()` 函式：
    * 透過在 `databaseConnection` 屬性上呼叫 `query()` 函式來建立 SQL 查詢。
    * 將 SQL 查詢指派給 `data` 變數。
    * 將 `data` 變數列印到主控台。
* `main()` 函式呼叫 `fetchData()` 函式。第一次呼叫時，延遲載入屬性會被初始化。第二次呼叫時，傳回與第一次呼叫相同的結果。

延遲載入屬性不僅在初始化資源密集時很有用，在程式碼中可能不會使用到該屬性時也很有用。此外，延遲載入屬性預設是執行緒安全的，這在您於並行環境中工作時特別有益。

欲了解更多資訊，請參閱 [延遲載入屬性](delegated-properties.md#lazy-properties)。

#### 可觀察屬性 (Observable properties)

要監控屬性值是否發生變化，請使用可觀察屬性。當您想要偵測屬性值的變更並利用此資訊來觸發反應時，可觀察屬性非常有用。標準函式庫提供了 `Delegates` 物件用於委派。

要建立可觀察屬性，您必須先匯入 `kotlin.properties.Delegates.observable`。然後，使用 `observable()` 函式並提供一個 Lambda 運算式，以便在屬性變更時執行。就像延遲載入屬性一樣，可觀察屬性使用[尾隨 Lambda](kotlin-tour-functions.md#trailing-lambdas) 語法來傳遞 Lambda 運算式。

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
        * `_`：指的是屬性本身。
        * `old`：屬性的舊值。
        * `new`：屬性的新值。
    * 檢查 `new` 參數是否大於 `25`，並根據結果將字串列印到主控台。
* `main()` 函式：
    * 建立了一個名為 `thermostat` 的 `Thermostat` 類別執行個體。
    * 將該執行個體的 `temperature` 屬性值更新為 `22.5`，這會觸發包含溫度更新的列印陳述式。
    * 將該執行個體的 `temperature` 屬性值更新為 `27.0`，這會觸發包含警告的列印陳述式。

可觀察屬性不僅對日誌記錄和偵錯有用。您還可以用於像是更新 UI 或執行額外檢查（例如驗證資料有效性）等使用案例。

欲了解更多資訊，請參閱 [可觀察屬性](delegated-properties.md#observable-properties)。

## 練習

### 練習 1 {initial-collapse-state="collapsed" collapsible="true" id="properties-exercise-1"}

您在一家書店管理庫存系統。庫存儲存在一個清單中，每個項目代表特定書籍的數量。例如，`listOf(3, 0, 7, 12)` 表示書店有 3 本第一本書、0 本第二本、7 本第三本以及 12 本第四本。

寫一個名為 `findOutOfStockBooks()` 的函式，傳回所有缺貨書籍的索引清單。

<deflist collapsible="true">
    <def title="提示 1">
        使用標準函式庫中的 <a href="https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/indices.html"><code>indices</code></a> 擴充屬性。
    </def>
</deflist>

<deflist collapsible="true">
    <def title="提示 2">
        您可以使用 <a href="https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/build-list.html"><code>buildList()</code></a> 函式來建立和管理清單，而不是手動建立並傳回一個可變清單。<code>buildList()</code> 函式使用了一個帶接收者的 Lambda，這是在之前的章節中學過的。
    </def>
</deflist>

|--|--|

```kotlin
fun findOutOfStockBooks(inventory: List<Int>): `List<Int>` {
    // 在此處撰寫您的程式碼
}

fun main() {
    val inventory = listOf(3, 0, 7, 0, 5)
    println(findOutOfStockBooks(inventory))
    // [1, 3]
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-properties-exercise-1"}

|---|---|
```kotlin
fun findOutOfStockBooks(inventory: List<Int>): `List<Int>` {
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

|---|---|
```kotlin
fun findOutOfStockBooks(inventory: List<Int>): `List<Int>` = buildList {
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

### 練習 2 {initial-collapse-state="collapsed" collapsible="true" id="properties-exercise-2"}

您有一個旅遊應用程式，需要同時以公里和英里顯示距離。為 `Double` 型別建立一個名為 `asMiles` 的擴充屬性，將以公里為單位的距離轉換為英里：

> 將公里轉換為英里的公式為 `miles = kilometers * 0.621371`。
>
{style="note"}

<deflist collapsible="true">
    <def title="提示">
        請記住，擴充屬性需要自訂的 <code>get()</code> 函式。
    </def>
</deflist>

|---|---|

```kotlin
val // 在此處撰寫您的程式碼

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

|---|---|
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

### 練習 3 {initial-collapse-state="collapsed" collapsible="true" id="properties-exercise-3"}

您有一個系統健康檢查程式，可以判斷雲端系統的狀態。然而，它執行健康檢查的兩個函式效能消耗很大。使用延遲載入屬性來初始化檢查，以便僅在需要時才執行這些高昂的函式：

|---|---|

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
    // 在此處撰寫您的程式碼

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

|---|---|
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

### 練習 4 {initial-collapse-state="collapsed" collapsible="true" id="properties-exercise-4"}

您正在構建一個簡單的預算追蹤應用程式。該應用程式需要觀察使用者剩餘預算的變化，並在預算低於特定門檻時通知他們。您有一個 `Budget` 類別，它使用包含初始預算金額的 `totalBudget` 屬性進行初始化。在類別中，建立一個名為 `remainingBudget` 的可觀察屬性，列印：

* 當值低於初始預算的 20% 時發出警告。
* 當預算比前一個值增加時發出鼓勵訊息。

|---|---|

```kotlin
import kotlin.properties.Delegates.observable

class Budget(val totalBudget: Int) {
    var remainingBudget: Int // 在此處撰寫您的程式碼
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

|---|---|
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

## 下一步

[中階：空值安全](kotlin-tour-intermediate-null-safety.md)