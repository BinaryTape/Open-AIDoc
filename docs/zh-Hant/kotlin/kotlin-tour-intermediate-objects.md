[//]: # (title: 物件)

<no-index/>

在本章節中，您將透過探索物件宣告來擴展對類別的理解。這些知識將幫助您在專案中高效地管理行為。

## 物件宣告

在 Kotlin 中，您可以使用 **物件宣告 (object declarations)** 來宣告一個具有單一執行個體的類別。從某種意義上說，您在宣告類別的「同時」也建立了該單一執行個體。當您想要建立一個類別來作為程式的單一參考點，或是在系統中協調行為時，物件宣告非常有用。

> 只有一個易於存取的執行個體之類別稱為 **單例 (singleton)**。
>
{style="tip"}

Kotlin 中的物件是 **延遲 (lazy)** 載入的，這代表它們只有在被存取時才會被建立。Kotlin 還確保所有物件都以執行緒安全的方式建立，因此您無需手動檢查。

要建立物件宣告，請使用 `object` 關鍵字：

```kotlin
object DoAuth {}
```

在 `object` 名稱之後，於花括號 `{}` 定義的物件主體中加入任何屬性或成員函數。

> 物件不能有建構函式，因此它們不像類別那樣擁有標頭。
>
{style="note"}

例如，假設您想建立一個名為 `DoAuth` 的物件，負責處理驗證：

```kotlin
object DoAuth {
    fun takeParams(username: String, password: String) {
        println("input Auth parameters = $username:$password")
    }
}

fun main(){
    // 物件在 takeParams() 函式被呼叫時建立
    DoAuth.takeParams("coding_ninja", "N1njaC0ding!")
    // input Auth parameters = coding_ninja:N1njaC0ding!
}
```
{kotlin-runnable="true" id="kotlin-tour-object-declarations"}

該物件有一個名為 `takeParams` 的成員函數，它接受 `username` 和 `password` 變數作為參數，並將字串列印到主控台。`DoAuth` 物件僅在該函式第一次被呼叫時才會被建立。

> 物件可以繼承類別與介面。例如：
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

#### 資料物件

為了更輕鬆地列印物件宣告的內容，Kotlin 提供了 **資料 (data)** 物件。與您在初級入門指南中學過的資料類別相似，資料物件會自動附帶額外的成員函數：`toString()` 和 `equals()`。

> 與資料類別不同，資料物件不會自動附帶 `copy()` 成員函數，因為它們只有單一執行個體，無法被複製。
>
{type ="note"}

要建立資料物件，請使用與物件宣告相同的語法，但在前面加上 `data` 關鍵字：

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

有關資料物件的更多資訊，請參閱 [](object-declarations.md#data-objects)。

#### 伴隨物件

在 Kotlin 中，類別可以包含一個物件：**伴隨 (companion)** 物件。每個類別只能有一個伴隨物件。伴隨物件僅在其所屬類別第一次被參照時才會被建立。

在伴隨物件中宣告的任何屬性或函式都會在所有類別執行個體之間共用。

要在類別中建立伴隨物件，請使用與物件宣告相同的語法，但在前面加上 `companion` 關鍵字：

```kotlin
companion object Bonger {}
```

> 伴隨物件不一定要有名稱。如果您沒有定義名稱，預設名稱為 `Companion`。
> 
{style="note"}

要存取伴隨物件的任何屬性或函式，請直接參照類別名稱。例如：

```kotlin
class BigBen {
    companion object Bonger {
        fun getBongs(nTimes: Int) {
            repeat(nTimes) { print("BONG ") }
            }
        }
    }

fun main() {
    // 伴隨物件在類別第一次被參照時建立。
    BigBen.getBongs(12)
    // BONG BONG BONG BONG BONG BONG BONG BONG BONG BONG BONG BONG 
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-companion-object"}

此範例建立了一個名為 `BigBen` 的類別，其中包含一個名為 `Bonger` 的伴隨物件。該伴隨物件有一個名為 `getBongs()` 的成員函數，它接受一個整數，並在主控台上列印與該整數相同次數的 `"BONG"`。

在 `main()` 函式中，透過參照類別名稱來呼叫 `getBongs()` 函式。伴隨物件就在此時被建立。`getBongs()` 函式是以參數 `12` 進行呼叫。

欲了解更多資訊，請參閱 [](object-declarations.md#companion-objects)。

## 練習 {completion-point="true"}

### 練習 1 {initial-collapse-state="collapsed" collapsible="true" id="objects-exercise-1"}

您經營一家咖啡店，並擁有一個用於追蹤客戶訂單的系統。請參考下方的程式碼並完成第二個資料物件的宣告，使 `main()` 函式中的以下程式碼能成功執行：

|---|---|

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

data object // 在此處編寫您的程式碼

fun main() {
    // 列印每個資料物件的名稱
    println("Order name: $OrderOne")
    // Order name: OrderOne
    println("Order name: $OrderTwo")
    // Order name: OrderTwo

    // 檢查訂單是否相同
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

|---|---|
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

    // 檢查訂單是否相同
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

### 練習 2 {initial-collapse-state="collapsed" collapsible="true" id="objects-exercise-2"}

建立一個繼承自 `Vehicle` 介面的物件宣告，以建立一種獨特的交通工具類型：`FlyingSkateboard`。在您的物件中實作 `name` 屬性和 `move()` 函式，使 `main()` 函式中的以下程式碼能成功執行：

|---|---|

```kotlin
interface Vehicle {
    val name: String
    fun move(): String
}

object // 在此處編寫您的程式碼

fun main() {
    println("${FlyingSkateboard.name}: ${FlyingSkateboard.move()}")
    // Flying Skateboard: Glides through the air with a hover engine
    println("${FlyingSkateboard.name}: ${FlyingSkateboard.fly()}")
    // Flying Skateboard: Woooooooo
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-objects-exercise-2"}

|---|---|
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

### 練習 3 {initial-collapse-state="collapsed" collapsible="true" id="objects-exercise-3"}

您有一個想要記錄溫度的應用程式。類別本身以攝氏 (Celsius) 儲存資訊，但您也希望提供一種輕鬆建立華氏 (Fahrenheit) 執行個體的方法。完成該資料類別，使 `main()` 函式中的以下程式碼能成功執行：

<deflist collapsible="true">
    <def title="提示">
        使用伴隨物件。
    </def>
</deflist>

|---|---|
```kotlin
data class Temperature(val celsius: Double) {
    val fahrenheit: Double = celsius * 9 / 5 + 32

    // 在此處編寫您的程式碼
}

fun main() {
    val fahrenheit = 90.0
    val temp = Temperature.fromFahrenheit(fahrenheit)
    println("${temp.celsius}°C is $fahrenheit °F")
    // 32.22222222222222°C is 90.0 °F
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-objects-exercise-3"}

|---|---|
```kotlin
data class Temperature(val celsius: Double) {
    val fahrenheit: Double = celsius * 9 / 5 + 32

    companion object {
        fun fromFahrenheit(fahrenheit: Double): Temperature = Temperature((fahrenheit - 32) * 5 / 9)
    }
}

fun main() {
    val fahrenheit = 90.0
    val temp = Temperature.fromFahrenheit(fahrenheit)
    println("${temp.celsius}°C is $fahrenheit °F")
    // 32.22222222222222°C is 90.0 °F
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-objects-solution-3"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-classes-interfaces.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-open-special-classes.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>