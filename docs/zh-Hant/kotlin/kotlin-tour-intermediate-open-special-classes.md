[//]: # (title: Open 與特殊類別)

<no-index/>

在本章中，您將了解 open 類別、它們如何與介面搭配運作，以及 Kotlin 中提供的其他特殊類別型別。

## Open 類別

如果您無法使用介面或抽象類別，可以透過將類別宣告為 **open**，明確地使其可被繼承。
若要執行此操作，請在類別宣告前使用 `open` 關鍵字：

```kotlin
open class Vehicle(val make: String, val model: String)
```

若要建立繼承自另一個類別的類別，請在類別標頭後加上冒號，接著呼叫您要繼承的父類別建構函式。在此範例中，`Car` 類別繼承自 `Vehicle` 類別：

```kotlin
open class Vehicle(val make: String, val model: String)

class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model)

fun main() {
    // 建立 Car 類別的執行個體
    val car = Car("Toyota", "Corolla", 4)

    // 列印汽車的詳細資訊
    println("Car Info: Make - ${car.make}, Model - ${car.model}, Number of doors - ${car.numberOfDoors}")
    // Car Info: Make - Toyota, Model - Corolla, Number of doors - 4
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-open-class"}

就像建立一般的類別執行個體一樣，如果您的類別繼承自父類別，則它必須初始化父類別標頭中宣告的所有參數。因此在範例中，`Car` 類別的 `car` 執行個體初始化了父類別的參數：`make` 與 `model`。

### 覆寫繼承的行為

如果您想繼承一個類別但更改某些行為，可以覆寫繼承的行為。

根據預設，無法覆寫父類別的成員函數或屬性。就像抽象類別一樣，您需要加入特殊的關鍵字。

#### 成員函數

若要允許父類別中的函式被覆寫，請在父類別的宣告前使用 `open` 關鍵字：

```kotlin
open fun displayInfo() {}
```
{validate="false"}

若要覆寫繼承的成員函數，請在子類別的函式宣告前使用 `override` 關鍵字：

```kotlin
override fun displayInfo() {}
```
{validate="false"}

例如：

```kotlin
open class Vehicle(val make: String, val model: String) {
    open fun displayInfo() {
        println("Vehicle Info: Make - $make, Model - $model")
    }
}

class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model) {
    override fun displayInfo() {
        println("Car Info: Make - $make, Model - $model, Number of Doors - $numberOfDoors")
    }
}

fun main() {
    val car1 = Car("Toyota", "Corolla", 4)
    val car2 = Car("Honda", "Civic", 2)

    // 使用覆寫的 displayInfo() 函式
    car1.displayInfo()
    // Car Info: Make - Toyota, Model - Corolla, Number of Doors - 4
    car2.displayInfo()
    // Car Info: Make - Honda, Model - Civic, Number of Doors - 2
}
```
{kotlin-runnable="true" id="kotlin-tour-class-override-function"}

此範例：

* 建立兩個繼承自 `Vehicle` 類別的 `Car` 類別執行個體：`car1` 與 `car2`。
* 覆寫 `Car` 類別中的 `displayInfo()` 函式，使其同時列印車門數量。
* 在 `car1` 與 `car2` 執行個體上呼叫覆寫後的 `displayInfo()` 函式。

#### 屬性

在 Kotlin 中，使用 `open` 關鍵字並在之後覆寫屬性使其可繼承並非通用做法。大多數時候，您會使用屬性預設為可繼承的抽象類別或介面。

open 類別內部的屬性可以被其子類別存取。一般來說，直接存取它們比用新屬性覆寫它們更好。

例如，假設您有一個名為 `transmissionType` 的屬性，您想稍後覆寫它。覆寫屬性的語法與覆寫成員函數完全相同。您可以這樣做：

```kotlin
open class Vehicle(val make: String, val model: String) {
    open val transmissionType: String = "Manual"
}

class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model) {
    override val transmissionType: String = "Automatic"
}
```

然而，這不是良好的實踐方式。相反地，您可以將屬性加入可繼承類別的建構函式中，並在建立 `Car` 子類別時宣告其值：

```kotlin
open class Vehicle(val make: String, val model: String, val transmissionType: String = "Manual")

class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model, "Automatic")
```

直接存取屬性而不是覆寫它們，可以讓程式碼更簡潔且更具可讀性。透過在父類別中宣告一次屬性並透過建構函式傳遞其值，您就不再需要在子類別中進行不必要的覆寫。

如需更多關於類別繼承和覆寫類別行為的資訊，請參閱[繼承](inheritance.md)。

### Open 類別與介面

您可以建立一個繼承自某個類別**且**實作多個介面的類別。在這種情況下，您必須在冒號後先宣告父類別，然後才列出介面：

```kotlin
// 定義介面
interface EcoFriendly {
    val emissionLevel: String
}

interface ElectricVehicle {
    val batteryCapacity: Double
}

// 父類別
open class Vehicle(val make: String, val model: String)

// 子類別
open class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model)

// 繼承自 Car 並實作兩個介面的新類別
class ElectricCar(
    make: String,
    model: String,
    numberOfDoors: Int,
    val capacity: Double,
    val emission: String
) : Car(make, model, numberOfDoors), EcoFriendly, ElectricVehicle {
    override val batteryCapacity: Double = capacity
    override val emissionLevel: String = emission
}
```

## 特殊類別

除了抽象類別、open 類別和資料類別外，Kotlin 還有專為各種目的設計的特殊類別型別，例如限制特定行為或減少建立小物件對效能的影響。

### 密封類別

有時您可能想要限制繼承。您可以使用密封類別（sealed classes）來達成此目的。密封類別是一種特殊型別的[抽象類別](kotlin-tour-intermediate-classes-interfaces.md#abstract-classes)。一旦您宣告類別為 sealed，您只能在同一個套件中建立其子類別。在該範圍之外繼承密封類別是不可能的。

> 套件是具有相關類別和函式的程式碼集合，通常位於一個目錄中。若要了解更多關於 Kotlin 中套件的資訊，請參閱[套件與匯入](packages.md)。
> 
{style="tip"}

若要建立密封類別，請使用 `sealed` 關鍵字：

```kotlin
sealed class Mammal
```

密封類別與 `when` 運算式搭配使用時特別有用。透過使用 `when` 運算式，您可以為所有可能的子類別定義行為。例如：

```kotlin
sealed class Mammal(val name: String)

class Cat(val catName: String) : Mammal(catName)
class Human(val humanName: String, val job: String) : Mammal(humanName)

fun greetMammal(mammal: Mammal): String {
    when (mammal) {
        is Human -> return "Hello ${mammal.name}; You're working as a ${mammal.job}"
        is Cat -> return "Hello ${mammal.name}"   
    }
}

fun main() {
    println(greetMammal(Cat("Snowy")))
    // Hello Snowy
}
```
{kotlin-runnable="true" id="kotlin-tour-sealed-classes"}

在此範例中：

* 有一個名為 `Mammal` 的密封類別，其建構函式中有 `name` 參數。
* `Cat` 類別繼承自 `Mammal` 密封類別，並在其自身的建構函式中使用 `catName` 參數作為 `Mammal` 類別的 `name` 參數。
* `Human` 類別繼承自 `Mammal` 密封類別，並在其自身的建構函式中使用 `humanName` 參數作為 `Mammal` 類別的 `name` 參數。它在建構函式中還有一個 `job` 參數。
* `greetMammal()` 函式接受 `Mammal` 型別的引數並傳回一個字串。
* 在 `greetMammal()` 函式主體中，有一個 `when` 運算式，它使用 [`is` 運算子](typecasts.md#is-and-is-operators) 來檢查 `mammal` 的型別並決定執行哪種操作。
* `main()` 函式呼叫 `greetMammal()` 函式，傳入一個 `Cat` 類別的執行個體，其 `name` 參數為 `Snowy`。

> 本導覽將在[可 Null 性安全](kotlin-tour-intermediate-null-safety.md)章節中更詳細地討論 `is` 運算子。
> 
{style ="tip"}

如需更多關於密封類別及其建議使用案例的資訊，請參閱[密封類別與介面](sealed-classes.md)。

### 列舉類別

當您想在類別中表示有限的唯一值集合時，列舉類別（enum classes）非常有用。列舉類別包含列舉常數，這些常數本身就是列舉類別的執行個體。

若要建立列舉類別，請使用 `enum` 關鍵字：

```kotlin
enum class State
```

假設您想建立一個包含程序不同狀態的列舉類別。每個列舉常數必須以逗號 `,` 分隔：

```kotlin
enum class State {
    IDLE, RUNNING, FINISHED
}
```

`State` 列舉類別具有列舉常數：`IDLE`、`RUNNING` 和 `FINISHED`。若要存取列舉常數，請使用類別名稱，後接 `.` 以及列舉常數的名稱：

```kotlin
val state = State.RUNNING
```

您可以將此列舉類別與 `when` 運算式搭配使用，根據列舉常數的值定義要採取的動作：

```kotlin
enum class State {
    IDLE, RUNNING, FINISHED
}

fun main() {
    val state = State.RUNNING
    val message = when (state) {
        State.IDLE -> "It's idle"
        State.RUNNING -> "It's running"
        State.FINISHED -> "It's finished"
    }
    println(message)
    // It's running
}
```
{kotlin-runnable="true" id="kotlin-tour-enum-classes"}

列舉類別可以像普通類別一樣擁有屬性和成員函數。 

例如，假設您正在處理 HTML，並想建立一個包含某些顏色的列舉類別。 
您希望每種顏色都有一個屬性，我們稱之為 `rgb`，其中包含它們作為十六進位的 RGB 值。 
建立列舉常數時，您必須使用此屬性對其進行初始化：

```kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF),
    YELLOW(0xFFFF00)
}
```

> Kotlin 將十六進位儲存為整數，因此 `rgb` 屬性的型別是 `Int`，而不是 `String`。
>
{style="note"}

若要在此類別中加入成員函數，請使用分號 `;` 將其與列舉常數隔開：

```kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF),
    YELLOW(0xFFFF00);

    fun containsRed() = (this.rgb and 0xFF0000 != 0)
}

fun main() {
    val red = Color.RED
    
    // 在列舉常數上呼叫 containsRed() 函式
    println(red.containsRed())
    // true

    // 透過類別名稱在列舉常數上呼叫 containsRed() 函式
    println(Color.BLUE.containsRed())
    // false
  
    println(Color.YELLOW.containsRed())
    // true
}
```
{kotlin-runnable="true" id="kotlin-tour-interface-enum-classes-members"}

在此範例中，`containsRed()` 成員函數使用 `this` 關鍵字存取列舉常數的 `rgb` 屬性值，並檢查十六進位值的第一個位元是否包含 `FF`，以傳回布林值。

如需更多資訊，請參閱[列舉類別](enum-classes.md)。

### 內嵌值類別

有時在程式碼中，您可能想從類別建立小物件並僅簡短地使用它們。這種方法可能會對效能產生影響。內嵌值類別（inline value classes）是一種特殊的類別，可以避免這種效能影響。然而，它們只能包含值。

若要建立內嵌值類別，請使用 `value` 關鍵字和 `@JvmInline` 註解：

```kotlin
@JvmInline
value class Email
```

> `@JvmInline` 註解指示 Kotlin 在編譯程式碼時進行最佳化。若要了解更多資訊，請參閱[註解](annotations.md)。
> 
{style="tip"}

內嵌值類別**必須**在類別標頭中初始化單一屬性。

假設您想建立一個收集電子郵件地址的類別：

```kotlin
// address 屬性在類別標頭中初始化。
@JvmInline
value class Email(val address: String)

fun sendEmail(email: Email) {
    println("Sending email to ${email.address}")
}

fun main() {
    val myEmail = Email("example@example.com")
    sendEmail(myEmail)
    // Sending email to example@example.com
}
```
{kotlin-runnable="true" id="kotlin-tour-inline-value-class"}

在此範例中：

* `Email` 是一個內嵌值類別，在類別標頭中有一個屬性：`address`。
* `sendEmail()` 函式接受 `Email` 型別的物件，並將字串印出到標準輸出。
* `main()` 函式：
    * 建立一個名為 `myEmail` 的 `Email` 類別執行個體。
    * 在 `myEmail` 物件上呼叫 `sendEmail()` 函式。

透過使用內嵌值類別，您可以使該類別成為內嵌的（inlined），並直接在程式碼中使用它而無需建立物件。這可以顯著減少記憶體佔用並提高程式碼的執行階段效能。

如需更多關於內嵌值類別的資訊，請參閱[內嵌值類別](inline-classes.md)。

## 練習 {completion-point="true"}

### 練習 1 {initial-collapse-state="collapsed" collapsible="true" id="special-classes-exercise-1"}

您管理一家遞送服務，需要一種方法來追蹤包裹狀態。建立一個名為 `DeliveryStatus` 的密封類別，其中包含資料類別以表示以下狀態：`Pending`、`InTransit`、`Delivered`、`Canceled`。完成 `DeliveryStatus` 類別宣告，使 `main()` 函式中的程式碼能成功執行：

|---|---|

```kotlin
sealed class // 在此處編寫您的程式碼

fun printDeliveryStatus(status: DeliveryStatus) {
    when (status) {
        is DeliveryStatus.Pending -> {
            println("The package is pending pickup from ${status.sender}.")
        }
        is DeliveryStatus.InTransit -> {
            println("The package is in transit and expected to arrive by ${status.estimatedDeliveryDate}.")
        }
        is DeliveryStatus.Delivered -> {
            println("The package was delivered to ${status.recipient} on ${status.deliveryDate}.")
        }
        is DeliveryStatus.Canceled -> {
            println("The delivery was canceled due to: ${status.reason}.")
        }
    }
}

fun main() {
    val status1: DeliveryStatus = DeliveryStatus.Pending("Alice")
    val status2: DeliveryStatus = DeliveryStatus.InTransit("2024-11-20")
    val status3: DeliveryStatus = DeliveryStatus.Delivered("2024-11-18", "Bob")
    val status4: DeliveryStatus = DeliveryStatus.Canceled("Address not found")

    printDeliveryStatus(status1)
    // The package is pending pickup from Alice.
    printDeliveryStatus(status2)
    // The package is in transit and expected to arrive by 2024-11-20.
    printDeliveryStatus(status3)
    // The package was delivered to Bob on 2024-11-18.
    printDeliveryStatus(status4)
    // The delivery was canceled due to: Address not found.
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-special-classes-exercise-1"}

|---|---|
```kotlin
sealed class DeliveryStatus {
    data class Pending(val sender: String) : DeliveryStatus()
    data class InTransit(val estimatedDeliveryDate: String) : DeliveryStatus()
    data class Delivered(val deliveryDate: String, val recipient: String) : DeliveryStatus()
    data class Canceled(val reason: String) : DeliveryStatus()
}

fun printDeliveryStatus(status: DeliveryStatus) {
    when (status) {
        is DeliveryStatus.Pending -> {
            println("The package is pending pickup from ${status.sender}.")
        }
        is DeliveryStatus.InTransit -> {
            println("The package is in transit and expected to arrive by ${status.estimatedDeliveryDate}.")
        }
        is DeliveryStatus.Delivered -> {
            println("The package was delivered to ${status.recipient} on ${status.deliveryDate}.")
        }
        is DeliveryStatus.Canceled -> {
            println("The delivery was canceled due to: ${status.reason}.")
        }
    }
}

fun main() {
    val status1: DeliveryStatus = DeliveryStatus.Pending("Alice")
    val status2: DeliveryStatus = DeliveryStatus.InTransit("2024-11-20")
    val status3: DeliveryStatus = DeliveryStatus.Delivered("2024-11-18", "Bob")
    val status4: DeliveryStatus = DeliveryStatus.Canceled("Address not found")

    printDeliveryStatus(status1)
    // The package is pending pickup from Alice.
    printDeliveryStatus(status2)
    // The package is in transit and expected to arrive by 2024-11-20.
    printDeliveryStatus(status3)
    // The package was delivered to Bob on 2024-11-18.
    printDeliveryStatus(status4)
    // The delivery was canceled due to: Address not found.
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解法" id="kotlin-tour-special-classes-solution-1"}

### 練習 2 {initial-collapse-state="collapsed" collapsible="true" id="special-classes-exercise-2"}

在您的程式中，您希望能夠處理不同的狀態和錯誤型別。您有一個密封類別來擷取宣告在資料類別或物件中的不同狀態。透過建立一個名為 `Problem` 的列舉類別來完成下面的程式碼，該類別表示不同的問題型別：`NETWORK`、`TIMEOUT` 和 `UNKNOWN`。

|---|---|

```kotlin
sealed class Status {
    data object Loading : Status()
    data class Error(val problem: Problem) : Status() {
        // 在此處編寫您的程式碼
    }

    data class OK(val data: List<String>) : Status()
}

fun handleStatus(status: Status) {
    when (status) {
        is Status.Loading -> println("Loading...")
        is Status.OK -> println("Data received: ${status.data}")
        is Status.Error -> when (status.problem) {
            Status.Error.Problem.NETWORK -> println("Network issue")
            Status.Error.Problem.TIMEOUT -> println("Request timed out")
            Status.Error.Problem.UNKNOWN -> println("Unknown error occurred")
        }
    }
}

fun main() {
    val status1: Status = Status.Error(Status.Error.Problem.NETWORK)
    val status2: Status = Status.OK(listOf("Data1", "Data2"))

    handleStatus(status1)
    // Network issue
    handleStatus(status2)
    // Data received: [Data1, Data2]
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-special-classes-exercise-2"}

|---|---|
```kotlin
sealed class Status {
    data object Loading : Status()
    data class Error(val problem: Problem) : Status() {
        enum class Problem {
            NETWORK,
            TIMEOUT,
            UNKNOWN
        }
    }

    data class OK(val data: List<String>) : Status()
}

fun handleStatus(status: Status) {
    when (status) {
        is Status.Loading -> println("Loading...")
        is Status.OK -> println("Data received: ${status.data}")
        is Status.Error -> when (status.problem) {
            Status.Error.Problem.NETWORK -> println("Network issue")
            Status.Error.Problem.TIMEOUT -> println("Request timed out")
            Status.Error.Problem.UNKNOWN -> println("Unknown error occurred")
        }
    }
}

fun main() {
    val status1: Status = Status.Error(Status.Error.Problem.NETWORK)
    val status2: Status = Status.OK(listOf("Data1", "Data2"))

    handleStatus(status1)
    // Network issue
    handleStatus(status2)
    // Data received: [Data1, Data2]
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解法" id="kotlin-tour-special-classes-solution-2"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-objects.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-properties.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>