[//]: # (title: 開放類別與特殊類別)

<no-index/>

在本章中，你將學習開放類別（open classes）、它們如何與介面協同運作，以及 Kotlin 中提供的其他特殊類別型別。

## 開放類別 (Open classes) {id="open-classes"}

如果你無法使用介面或抽象類別，可以透過將類別宣告為 **open** 來明確使其可被繼承。
為此，請在類別宣告前使用 `open` 關鍵字：

```kotlin
open class Vehicle(val make: String, val model: String)
```

若要建立繼承自另一個類別的類別，請在類別頁首後加上冒號，接著呼叫你想要繼承的父類別建構函式。在此範例中，`Car` 類別繼承自 `Vehicle` 類別：

```kotlin
open class Vehicle(val make: String, val model: String)

class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model)

fun main() {
    // Creates an instance of the Car class
    val car = Car("Toyota", "Corolla", 4)

    // Prints the details of the car
    println("Car Info: Make - ${car.make}, Model - ${car.model}, Number of doors - ${car.numberOfDoors}")
    // Car Info: Make - Toyota, Model - Corolla, Number of doors - 4
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-classes-open-class"}

就像建立一般類別執行個體一樣，如果你的類別繼承自父類別，則它必須初始化父類別頁首中宣告的所有參數。因此在範例中，`Car` 類別的 `car` 執行個體初始化了父類別參數：`make` 與 `model`。

### 覆寫繼承的行為 {id="overriding-inherited-behavior"}

如果你想繼承某個類別但變更其部分行為，可以覆寫該繼承的行為。

預設情況下，無法覆寫父類別的成員函式或屬性。就像抽象類別一樣，你需要新增特殊的關鍵字。

#### 成員函式 {id="member-functions"}

若要允許父類別中的函式被覆寫，請在父類別的函式宣告前使用 `open` 關鍵字：

```kotlin
open fun displayInfo() {}
```
{validate="false"}

若要覆寫繼承的成員函式，請在子類別的函式宣告前使用 `override` 關鍵字：

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

    // Uses the overridden displayInfo() function
    car1.displayInfo()
    // Car Info: Make - Toyota, Model - Corolla, Number of Doors - 4
    car2.displayInfo()
    // Car Info: Make - Honda, Model - Civic, Number of Doors - 2
}
```
{kotlin-runnable="true" id="kotlin-tour-class-override-function"}

這個範例：

* 建立繼承自 `Vehicle` 類別的兩個 `Car` 類別執行個體：`car1` 與 `car2`。
* 覆寫 `Car` 類別中的 `displayInfo()` 函式，同時印出車門數量。
* 在 `car1` 與 `car2` 執行個體上呼叫覆寫後的 `displayInfo()` 函式。

#### 屬性 {id="properties"}

在 Kotlin 中，使用 `open` 關鍵字使屬性可被繼承並在之後進行覆寫並不是常見的做法。大多數時候，你會使用抽象類別或介面，其中的屬性預設就是可繼承的。

子類別可以存取開放類別內部的屬性。一般來說，直接存取它們會比使用新屬性覆寫它們更好。

例如，假設你有一個名為 `transmissionType` 的屬性想要稍後覆寫。覆寫屬性的語法與覆寫成員函式完全相同。你可以這樣做：

```kotlin
open class Vehicle(val make: String, val model: String) {
    open val transmissionType: String = "Manual"
}

class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model) {
    override val transmissionType: String = "Automatic"
}
```

然而，這不是一個好做法。相反地，你可以將該屬性新增到可繼承類別的建構函式中，並在建立 `Car` 子類別時宣告其值：

```kotlin
open class Vehicle(val make: String, val model: String, val transmissionType: String = "Manual")

class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model, "Automatic")
```

直接存取屬性而不是覆寫它們，能使程式碼更簡潔、更具可讀性。透過在父類別中宣告一次屬性並透過建構函式傳遞其值，你可以消除子類別中不必要的覆寫。

若要進一步了解類別繼承與覆寫類別行為，請參閱[繼承](inheritance.md)。

### 開放類別與介面 {id="open-classes-and-interfaces"}

你可以建立一個繼承某個類別**且**實作多個介面的類別。在這種情況下，你必須在冒號後先宣告父類別，然後再列出介面：

```kotlin
// Define interfaces
interface EcoFriendly {
    val emissionLevel: String
}

interface ElectricVehicle {
    val batteryCapacity: Double
}

// Parent class
open class Vehicle(val make: String, val model: String)

// Child class
open class Car(make: String, model: String, val numberOfDoors: Int) : Vehicle(make, model)

// New class that inherits from Car and implements two interfaces
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

## 特殊類別 {id="special-classes"}

除了抽象類別、開放類別和資料類別之外，Kotlin 還具有針對各種用途設計的特殊類別型別，例如限制特定行為或減少建立小型物件對效能的影響。

### 密封類別 (Sealed classes) {id="sealed-classes"}

有時你可能會想要限制繼承。你可以使用密封類別來達成此目的。密封類別是一種特殊的[抽象類別](kotlin-tour-intermediate-classes-interfaces.md#abstract-classes)。一旦你將類別宣告為密封類別，就只能在同一個套件內從中建立子類別。無法在此作用域之外繼承該密封類別。

> 套件是包含相關類別和函式的程式碼集合，通常位於一個目錄中。若要進一步了解 Kotlin 中的套件，請參閱[套件與匯入](packages.md)。
> 
{style="tip"}

若要建立密封類別，請使用 `sealed` 關鍵字：

```kotlin
sealed class Mammal
```

密封類別與 `when` 運算式結合使用時特別有用。透過使用 `when` 運算式，你可以為所有可能的子類別定義行為。例如：

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

在範例中：

* 有一個名為 `Mammal` 的密封類別，其建構函式中具有 `name` 參數。
* `Cat` 類別繼承自 `Mammal` 密封類別，並將其自己建構函式中的 `catName` 參數用作 `Mammal` 類別的 `name` 參數。
* `Human` 類別繼承自 `Mammal` 密封類別，並將其自己建構函式中的 `humanName` 參數用作 `Mammal` 類別的 `name` 參數。其建構函式中還具有 `job` 參數。
* `greetMammal()` 函式接受一個 `Mammal` 型別的引數並傳回一個字串。
* 在 `greetMammal()` 函式主體內，有一個 `when` 運算式使用 [`is` 運算子](typecasts.md#is-and-is-operators)來檢查 `mammal` 的型別並決定要執行哪個操作。
* `main()` 函式使用 `Cat` 類別的執行個體和名為 `Snowy` 的 `name` 參數呼叫 `greetMammal()` 函式。

> 本導覽將在[空值安全](kotlin-tour-intermediate-null-safety.md)章節中更詳細地討論 `is` 運算子。
> 
{style ="tip"}

若要進一步了解密封類別及其建議的使用案例，請參閱[密封類別與介面](sealed-classes.md)。

### 列舉類別 (Enum classes) {id="enum-classes"}

當你想在類別中表示一組有限的相異值時，列舉類別非常實用。列舉類別包含列舉常數，這些常數本身就是該列舉類別的執行個體。

若要建立列舉類別，請使用 `enum` 關鍵字：

```kotlin
enum class State
```

假設你想建立一個包含流程不同狀態的列舉類別。每個列舉常數必須以逗號 `,` 分隔：

```kotlin
enum class State {
    IDLE, RUNNING, FINISHED
}
```

`State` 列舉類別具有列舉常數：`IDLE`、`RUNNING` 和 `FINISHED`。若要存取列舉常數，請使用類別名稱後接 `.` 以及列舉常數的名稱：

```kotlin
val state = State.RUNNING
```

你可以將此列舉類別與 `when` 運算式一起使用，以根據列舉常數的值定義要採取的動作：

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

列舉類別可以像一般類別一樣具有屬性和成員函式。

例如，假設你正在處理 HTML，並且想要建立一個包含某些色彩的列舉類別。
你希望每種色彩都有一個名為 `rgb` 的屬性，其中包含以十六進位表示的 RGB 值。
建立列舉常數時，必須使用此屬性對其進行初始化：

```kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF),
    YELLOW(0xFFFF00)
}
```

> Kotlin 將十六進位儲存為整數，因此 `rgb` 屬性是 `Int` 型別，而不是 `String` 型別。
>
{style="note"}

若要為此類別新增成員函式，請使用分號 `;` 將其與列舉常數分隔開：

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
    
    // Calls containsRed() function on enum constant
    println(red.containsRed())
    // true

    // Calls containsRed() function on enum constants via class names
    println(Color.BLUE.containsRed())
    // false
  
    println(Color.YELLOW.containsRed())
    // true
}
```
{kotlin-runnable="true" id="kotlin-tour-interface-enum-classes-members"}

在此範例中，`containsRed()` 成員函式使用 `this` 關鍵字存取列舉常數的 `rgb` 屬性值，並檢查該十六進位值的前幾位元是否包含 `FF`，以傳回布林值。

若要進一步了解，請參閱[列舉類別](enum-classes.md)。

### 內嵌值類別 (Inline value classes) {id="inline-value-classes"}

有時在程式碼中，你可能希望從類別建立小型物件，而且僅短暫使用它們。這種方法可能會對效能產生影響。內嵌值類別是一種特殊的類別型別，可避免這種效能影響。但是，它們只能包含值。

若要建立內嵌值類別，請使用 `value` 關鍵字和 `@JvmInline` 註解：

```kotlin
@JvmInline
value class Email
```

> `@JvmInline` 註解指示 Kotlin 在編譯程式碼時進行最佳化。若要了解更多，請參閱[註解](annotations.md)。
> 
{style="tip"}

內嵌值類別**必須**在類別頁首中初始化單一屬性。

假設你想建立一個收集電子郵件地址的類別：

```kotlin
// The address property is initialized in the class header.
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

在範例中：

* `Email` 是一個內嵌值類別，在類別頁首中有一個屬性：`address`。
* `sendEmail()` 函式接受型別為 `Email` 的物件，並將字串印出至標準輸出。
* `main()` 函式：
    * 建立名為 `myEmail` 的 `Email` 類別執行個體。
    * 在 `myEmail` 物件上呼叫 `sendEmail()` 函式。

透過使用內嵌值類別，可讓該類別被內嵌，且你可以直接在程式碼中使用它而無需建立物件。這可以顯著減少記憶體佔用並提升程式碼的執行階段效能。

若要進一步了解內嵌值類別，請參閱[內嵌值類別](inline-classes.md)。

## 練習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="使用密封類別建立外送狀態模型" id="special-classes-exercise-1">

你管理一項外送服務，需要一種追蹤包裹狀態的方法。建立一個名為 `DeliveryStatus` 的密封類別，其中包含資料類別以表示以下狀態：`Pending`、`InTransit`、`Delivered`、`Canceled`。完成 `DeliveryStatus` 類別宣告，使 `main()` 函式中的程式碼能夠成功執行：

```kotlin
sealed class // Write your code here

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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-special-classes-solution-1"}

</def>
<def title="使用列舉類別定義問題類型" id="special-classes-exercise-2">

在你的程式中，你希望能夠處理不同的狀態與錯誤類型。你有一個密封類別用來擷取在資料類別或物件中宣告的不同狀態。透過建立名為 `Problem` 的列舉類別來表示不同的問題類型：`NETWORK`、`TIMEOUT` 和 `UNKNOWN`，以完成以下程式碼。

```kotlin
sealed class Status {
    data object Loading : Status()
    data class Error(val problem: Problem) : Status() {
        // Write your code here
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
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="範例解答" id="kotlin-tour-special-classes-solution-2"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-objects.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-properties.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>
  </li>
</list>