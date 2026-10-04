[//]: # (title: 物件)

<no-index/>

在本章中，你將透過探索物件宣告來擴展對類別的理解。這些知識將幫助你有效率地管理整個專案中的行為。

## 物件宣告 {id="object-declarations"}

在 Kotlin 中，你可以使用**物件宣告**來宣告一個只有單一執行個體的類別。在某種意義上，你是在宣告類別的_同時_建立了該單一執行個體。當你想建立一個類別作為程式的單一參考點，或者在整個系統中協調行為時，物件宣告非常有用。

> 只有一個執行個體且易於存取的類別稱為**單例 (singleton)**。
>
{style="tip"}

Kotlin 中的物件是**延遲載入 (lazy)** 的，這意味著它們只有在被存取時才會被建立。Kotlin 還確保所有物件都是以執行緒安全的方式建立，因此你無需手動檢查這一點。

若要建立物件宣告，請使用 `object` 關鍵字：

```kotlin
object DoAuth {}
```

在 `object` 名稱之後，於花括號 `{}` 定義的物件主體內新增任何屬性或成員函式。

> 物件不能有建構函式，因此它們不像類別那樣擁有標頭。
>
{style="note"}

例如，假設你想建立一個名為 `DoAuth` 的物件，負責處理驗證：

```kotlin
object DoAuth {
    fun takeParams(username: String, password: String) {
        println("input Auth parameters = $username:$password")
    }
}

fun main(){
    // 物件在呼叫 takeParams() 函式時建立
    DoAuth.takeParams("coding_ninja", "N1njaC0ding!")
    // input Auth parameters = coding_ninja:N1njaC0ding!
}
```
{kotlin-runnable="true" id="kotlin-tour-object-declarations"}

該物件具有名為 `takeParams` 的成員函式，接受 `username` 和 `password` 變數作為參數，並將字串列印至主控台。`DoAuth` 物件僅在首次呼叫該函式時才會被建立。

> 物件可以繼承類別和介面。例如：
> 
> ```kotlin
> interface Auth {
>     fun takeParams(username: String, password: String)
> }
>
> object DoAuth : Auth {
>     override fun takeParams(username: String, password: String) {
>         println("input Auth parameters = $username:$password")
>     }
> }
> ```
>
{style="note"}

#### 資料物件 {id="data-objects"}

為了讓列印物件宣告的內容更加容易，Kotlin 提供了**資料**物件。類似於你在初學者導覽中學到的資料類別，資料物件會自動附帶額外的成員函式：`toString()` 和 `equals()`。

> 與資料類別不同的是，資料物件不會自動附帶 `copy()` 成員函式，因為它們只有一個不能被複製的單一執行個體。
>
{type ="note"}

若要建立資料物件，請使用與物件宣告相同的語法，但在前面加上 `data` 關鍵字：

```kotlin
data object AppConfig {}
```

例如：

```kotlin
data object AppConfig {
    var appName: String = "My Application"
    var version: String = "1.0.0"
}

fun main() {
    println(AppConfig)
    // AppConfig
    
    println(AppConfig.appName)
    // My Application
}
```
{kotlin-runnable="true" id="kotlin-tour-data-objects"}

若要了解更多有關資料物件的資訊，請參閱 [](object-declarations.md#data-objects)。

#### 伴隨物件 {id="companion-objects"}

在 Kotlin 中，類別可以擁有一個物件：**伴隨 (companion)** 物件。每個類別只能有**一個**伴隨物件。伴隨物件僅在其所屬類別首次被參照時才會建立。

在伴隨物件內部宣告的任何屬性或函式都會在所有類別執行個體之間共享。

若要在類別中建立伴隨物件，請使用與物件宣告相同的語法，但在前面加上 `companion` 關鍵字：

```kotlin
companion object Bonger {}
```

> 伴隨物件不一定要有名稱。如果未定義名稱，預設為 `Companion`。
> 
{style="note"}

若要存取伴隨物件的任何屬性或函式，請參照類別名稱。例如：

```kotlin
class BigBen {
    companion object Bonger {
        fun getBongs(nTimes: Int) {
            repeat(nTimes) { print("BONG ") }
            }
        }
    }

fun main() {
    // 伴隨物件在該類別首次被參照時建立。
    BigBen.getBongs(12)
    // BONG BONG BONG BONG BONG BONG BONG BONG BONG BONG BONG BONG 
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-companion-object"}

此範例建立了一個名為 `BigBen` 的類別，其中包含名為 `Bonger` 的伴隨物件。伴隨物件具有名為 `getBongs()` 的成員函式，該函式接受一個整數，並將 `"BONG"` 列印至主控台與該整數相同的次數。

在 `main()` 函式中，透過參照類別名稱來呼叫 `getBongs()` 函式。伴隨物件此時被建立。`getBongs()` 函式以參數 `12` 進行呼叫。

若要了解更多資訊，請參閱 [](object-declarations.md#companion-objects)。

## 練習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="實作訂單追蹤的資料物件" id="objects-exercise-1">

你經營一家咖啡店，並且有一個用於追蹤顧客訂單的系統。參考下面的程式碼並完成第二個資料物件的宣告，以便 `main()` 函式中的以下程式碼能順利執行：

```kotlin
interface Order {
    val orderId: String
    val customerName: String
    val orderTotal: Double
}

data object OrderOne: Order {
    override val orderId = "001"
    override val customerName = "Alice"
    override val orderTotal = 15.50
}

data object // 在此處編寫你的程式碼

fun main() {
    // 列印每個資料物件的名稱
    println("Order name: $OrderOne")
    // Order name: OrderOne
    println("Order name: $OrderTwo")
    // Order name: OrderTwo

    // 檢查兩筆訂單是否完全相同
    println("Are the two orders identical? ${OrderOne == OrderTwo}")
    // Are the two orders identical? false

    if (OrderOne == OrderTwo) {
        println("The orders are identical.")
    } else {
        println("The orders are unique.")
        // The orders are unique.
    }

    println("Do the orders have the same customer name? ${OrderOne.customerName == OrderTwo.customerName}")
    // Do the orders have the same customer name? false
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-objects-exercise-1"}

```kotlin
interface Order {
    val orderId: String
    val customerName: String
    val orderTotal: Double
}

data object OrderOne: Order {
    override val orderId = "001"
    override val customerName = "Alice"
    override val orderTotal = 15.50
}

data object OrderTwo: Order {
    override val orderId = "002"
    override val customerName = "Bob"
    override val orderTotal = 12.75
}

fun main() {
    // 列印每個資料物件的名稱
    println("Order name: $OrderOne")
    // Order name: OrderOne
    println("Order name: $OrderTwo")
    // Order name: OrderTwo

    // 檢查兩筆訂單是否完全相同
    println("Are the two orders identical? ${OrderOne == OrderTwo}")
    // Are the two orders identical? false

    if (OrderOne == OrderTwo) {
        println("The orders are identical.")
    } else {
        println("The orders are unique.")
        // The orders are unique.
    }

    println("Do the orders have the same customer name? ${OrderOne.customerName == OrderTwo.customerName}")
    // Do the orders have the same customer name? false
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-objects-solution-1"}

</def>
<def title="建立物件宣告" id="objects-exercise-2">

建立一個繼承自 `Vehicle` 介面的物件宣告，以建立獨特的載具類型：`FlyingSkateboard`。
在你的物件中實作 `name` 屬性和 `move()` 函式，以便 `main()` 函式中的以下程式碼能順利執行：

```kotlin
interface Vehicle {
    val name: String
    fun move(): String
}

object // 在此處編寫你的程式碼

fun main() {
    println("${FlyingSkateboard.name}: ${FlyingSkateboard.move()}")
    // Flying Skateboard: Glides through the air with a hover engine
    println("${FlyingSkateboard.name}: ${FlyingSkateboard.fly()}")
    // Flying Skateboard: Woooooooo
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-objects-exercise-2"}

```kotlin
interface Vehicle {
    val name: String
    fun move(): String
}

object FlyingSkateboard : Vehicle {
    override val name = "Flying Skateboard"
    override fun move() = "Glides through the air with a hover engine"

   fun fly(): String = "Woooooooo"
}

fun main() {
    println("${FlyingSkateboard.name}: ${FlyingSkateboard.move()}")
    // Flying Skateboard: Glides through the air with a hover engine
    println("${FlyingSkateboard.name}: ${FlyingSkateboard.fly()}")
    // Flying Skateboard: Woooooooo
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-objects-solution-2"}

</def>
<def title="在建立使用者之前驗證電子郵件地址" id="objects-exercise-3">

你正在為應用程式建置使用者註冊模組。你希望將電子郵件驗證與 `User` 類別保持關聯，但如果電子郵件地址無效，則不想建立不必要的 `User` 執行個體。

在此練習中，若電子郵件地址同時包含 `@` 和 `.`，則視為有效。完成資料類別，使 `main()` 函式中的以下程式碼能順利執行：

<deflist collapsible="true">
    <def title="提示">
        在 `User` 類別的伴隨物件中新增電子郵件驗證函式，以便可以直接在 `User` 上呼叫該函式。
    </def>
</deflist>

```kotlin
data class User(val name: String, val email: String) {
    // 在此處編寫你的程式碼
}

fun main() {
    val candidates = listOf(
        Pair("Alice", "alice@example.com"),
        Pair("Bob", "bob2example-com")
    )

    for ((name, email) in candidates) {
        if (User.isValidEmail(email)) {
            val user = User(name, email)
            println("Registered: ${user.name}, ${user.email}")
            // Registered: Alice, alice@example.com
        } else {
            println("Error: '${email}' is not valid. The email should contain '@' and '.'")
            // Error: 'bob2example-com' is not valid. The email should contain '@' and '.'
        }
    }
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-objects-exercise-3"}

```kotlin
data class User(val name: String, val email: String) {
    companion object {
        fun isValidEmail(email: String): Boolean =
            email.contains('@') && email.contains('.')
    }
}

fun main() {
    val candidates = listOf(
        Pair("Alice", "alice@example.com"),
        Pair("Bob", "bob2example-com")
    )

    for ((name, email) in candidates) {
        if (User.isValidEmail(email)) {
            val user = User(name, email)
            println("Registered: ${user.name}, ${user.email}")
            // Registered: Alice, alice@example.com
        } else {
            println("Error: '${email}' is not valid. The email should contain '@' and '.'")
            // Error: 'bob2example-com' is not valid. The email should contain '@' and '.'
        }
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-objects-solution-3"}

> 作為本練習的擴展，嘗試使用伴隨物件中的函式作為工廠方法來建構類別的執行個體。有關此模式的範例和更多資訊，請參閱 [](object-declarations.md#companion-objects)。
>
{style="tip"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-classes-interfaces.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-open-special-classes.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>