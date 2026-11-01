[//]: # (title: 型別檢查與轉換)

在 Kotlin 中，您可以在執行時期對型別執行兩件事：檢查物件是否為特定型別，或將其轉換為另一種型別。
型別**檢查**可協助您確認正在處理的物件種類，而型別**轉換**（cast）則會嘗試將物件轉換為另一種型別。

> 若要具體了解**泛型**的型別檢查與轉換（例如 `List<T>`、`Map<K,V>`），請參閱[泛型型別檢查與轉換](generics.md#generics-type-checks-and-casts)。
>
{style="tip"}

## 使用 `is` 與 `!is` 運算子進行檢查 {id="is-and-is-operators"}

使用 `is` 運算子（或用於反向條件的 `!is`）在執行時期檢查物件是否符合某個型別：

```kotlin
fun main() {
    val input: Any = "Hello, Kotlin"

    if (input is String) {
        println("Message length: ${input.length}")
        // Message length: 13
    }

    if (input !is String) { // 等同於 !(input is String)
        println("Input is not a valid message")
    } else {
        println("Processing message: ${input.length} characters")
        // Processing message: 13 characters
    }
}
```
{kotlin-runnable="true" id="kotlin-typecasts-is-operator"}

您也可以使用 `is` 與 `!is` 運算子來檢查物件是否符合某個子型別：

```kotlin
interface Animal {
    val name: String
    fun speak()
}

class Dog(override val name: String) : Animal {
    override fun speak() = println("$name says: Woof!")
}

class Cat(override val name: String) : Animal {
    override fun speak() = println("$name says: Meow!")
}
//sampleStart
fun handleAnimal(animal: Animal) {
    println("Handling animal: ${animal.name}")
    animal.speak()
    
    // 使用 is 運算子檢查子型別
    if (animal is Dog) {
        println("Special care instructions: This is a dog.")
    } else if (animal is Cat) {
        println("Special care instructions: This is a cat.")
    }
}
//sampleEnd
fun main() {
    val pets: List<Animal> = listOf(
        Dog("Buddy"),
        Cat("Whiskers"),
        Dog("Rex")
    )

    for (pet in pets) {
        handleAnimal(pet)
        println("---")
    }
    // Handling animal: Buddy
    // Buddy says: Woof!
    // Special care instructions: This is a dog.
    // ---
    // Handling animal: Whiskers
    // Whiskers says: Meow!
    // Special care instructions: This is a cat.
    // ---
    // Handling animal: Rex
    // Rex says: Woof!
    // Special care instructions: This is a dog.
    // ---
}
```
{kotlin-runnable="true" id="kotlin-typecasts-is-operator-subtype"}

此範例使用 `is` 運算子檢查 `Animal` 類別的執行個體是否為子型別 `Dog` 或 `Cat`，以印出相關的照顧指引。

您可以檢查物件是否為其宣告型別的超型別（supertype），但這沒有意義，因為結果永遠為 true。每個類別執行個體本身就已經是其超型別的執行個體。

> 若要在執行時期識別物件的型別，請參閱[反射](reflection.md)。
> 
{type="tip"}

## 型別轉換 {id="type-casts"}

在 Kotlin 中，將物件的型別轉換為另一種型別稱為**轉換**（casting）。

在某些情況下，編譯器會自動為您轉換物件，這稱為智慧轉換（smart-casting）。

如果您需要明確轉換型別，請使用 `as?` 或 `as` [轉換運算子](#unsafe-cast-operator)。

## 智慧轉換 {id="smart-casts"}

編譯器會追蹤不可變值的型別檢查與[明確轉換](#unsafe-cast-operator)，並自動插入隱式（安全）轉換：

```kotlin
fun logMessage(data: Any) {
    // data 會自動轉換為 String
    if (data is String) {
        println("Received text: ${data.length} characters")
    }
}

fun main() {
    logMessage("Server started")
    // Received text: 14 characters
    logMessage(404)
}
```
{kotlin-runnable="true" id="kotlin-typecasts-smartcast"}

編譯器甚至足夠聰明，能得知若否定檢查會導致返回（return），則後續的轉換是安全的：

```kotlin
fun logMessage(data: Any) {
    // data 會自動轉換為 String
    if (data !is String) return

    println("Received text: ${data.length} characters")
}

fun main() {
    logMessage("User signed in")
    // Received text: 14 characters
    logMessage(true)
}
```
{kotlin-runnable="true" id="kotlin-typecasts-smartcast-negative"}

### 控制流程 {id="control-flow"}

智慧轉換不僅適用於 `if` 條件運算式，也適用於 [`when` 運算式](control-flow.md#when-expressions-and-statements)：

```kotlin
fun processInput(data: Any) {
    when (data) {
        // data 會自動轉換為 Int
        is Int -> println("Log: Assigned new ID ${data + 1}")
        // data 會自動轉換為 String
        is String -> println("Log: Received message \"$data\"")
        // data 會自動轉換為 IntArray
        is IntArray -> println("Log: Processed scores, total = ${data.sum()}")
    }
}

fun main() {
    processInput(1001)
    // Log: Assigned new ID 1002
    processInput("System rebooted")
    // Log: Received message "System rebooted"
    processInput(intArrayOf(10, 20, 30))
    // Log: Processed scores, total = 60
}
```
{kotlin-runnable="true" id="kotlin-typecasts-smartcast-when"}

同時也適用於 [`while` 迴圈](control-flow.md#while-loops)：

```kotlin
sealed interface Status
data class Ok(val currentRoom: String) : Status
data object Error : Status

class RobotVacuum(val rooms: List<String>) {
    var index = 0

    fun status(): Status =
        if (index < rooms.size) Ok(rooms[index])
        else Error

    fun clean(): Status {
        println("Finished cleaning ${rooms[index]}")
        index++
        return status()
    }
}

fun main() {
    //sampleStart
    val robo = RobotVacuum(listOf("Living Room", "Kitchen", "Hallway"))

    var status: Status = robo.status()
    while (status is Ok) {
        // 編譯器會將 status 智慧轉換為 Ok 型別，
        // 因此可以存取 currentRoom 屬性。
        println("Cleaning ${status.currentRoom}...")
        status = robo.clean()
    }
    // Cleaning Living Room...
    // Finished cleaning Living Room
    // Cleaning Kitchen...
    // Finished cleaning Kitchen
    // Cleaning Hallway...
    // Finished cleaning Hallway
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-typecasts-smartcast-while"}

在此範例中，sealed 介面 `Status` 有兩個實作：data class `Ok` 與 data object `Error`。只有 `Ok` data class 具有 `currentRoom` 屬性。當 `while` 迴圈條件求值為 true 時，編譯器會將 `status` 變數智慧轉換為 `Ok` 型別，使 `currentRoom` 屬性可在迴圈主體內被存取。

如果您在 `if`、`when` 或 `while` 條件中使用 `Boolean` 型別變數之前就宣告了該變數，則編譯器收集到的所有關於該變數的資訊，都可以在對應的區塊中用於智慧轉換。

當您想要將布林條件擷取至變數時，這項特性非常實用。您可以為變數提供一個有意義的名稱，以提高程式碼的可讀性，並使該變數稍後可在程式碼中重複使用。例如：

```kotlin
class Cat {
    fun purr() {
        println("Purr purr")
    }
}
//sampleStart
fun petAnimal(animal: Any) {
    val isCat = animal is Cat
    if (isCat) {
        // 編譯器可以存取關於 isCat 的資訊，
        // 因此知道 animal 已被智慧轉換為 Cat 型別。
        // 因此可以呼叫 purr() 函式。
        animal.purr()
    }
}

fun main(){
    val kitty = Cat()
    petAnimal(kitty)
    // Purr purr
}
//sampleEnd
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-smart-casts-local-variables" validate="false"}

### 邏輯運算子 {id="logical-operators"}

如果 `&&` 或 `||` 運算子的左側存在型別檢查（常規檢查或否定檢查），編譯器可以在運算子的右側執行智慧轉換：

```kotlin
// x 在 `||` 右側會自動轉換為 String
if (x !is String || x.length == 0) return

// x 在 `&&` 右側會自動轉換為 String
if (x is String && x.length > 0) {
    print(x.length) // x 自動轉換為 String
}
```

如果您使用 `and` 運算子（`&&`）組合對物件的多個型別檢查，編譯器會同時將該物件智慧轉換為所有已檢查的型別。詳情請參閱[交集型別](#intersection-types)。

如果您使用 `or` 運算子（`||`）組合對物件的型別檢查，則會將其智慧轉換為它們最近的共同超型別：

```kotlin
interface Status {
    fun signal() {}
}

interface Ok : Status
interface Postponed : Status
interface Declined : Status

fun signalCheck(signalStatus: Any) {
    if (signalStatus is Postponed || signalStatus is Declined) {
        // signalStatus 被智慧轉換為共同超型別 Status
        signalStatus.signal()
    }
}
```

> 此共同超型別是[聯合型別](https://en.wikipedia.org/wiki/Union_type)的一種**近似**表示。Kotlin 目前[尚未支援聯合型別](https://youtrack.jetbrains.com/issue/KT-13108/Denotable-union-and-intersection-types)。
>
{style="note"}

### 交集型別 {id="intersection-types"}

當編譯器透過多個 `&&` 檢查對物件進行智慧轉換時，它會推論出一個[*交集型別*](https://kotlinlang.org/spec/type-system.html#intersection-types)。這是一種內部型別，同時滿足所有已檢查的條件約束：

```kotlin
interface Bird {
    fun fly()
}

interface Fish {
    fun swim()
}

fun describe(animal: Any) {
    // 推論出 Bird 與 Fish 型別
    if (animal is Bird && animal is Fish) {
        // 無需額外檢查或轉換即可存取 fly() 與 swim()
        animal.fly()
        animal.swim()
    }
}
```

交集型別是不可表示的（non-denotable）。它們僅存在於編譯器的內部型別系統中，以便在型別檢查期間保留型別資訊。您無法在 Kotlin 程式碼中直接撰寫它們。您可能會在編譯器錯誤訊息和 IDE 工具提示中看到交集型別，通常顯示為 `A & B`。
唯一的例外是用於宣告[絕對非 null 型別](generics.md#definitely-non-nullable-types)的 `T & Any`。此語法專門保留用於將型別參數與 `Any` 結合。

```kotlin
fun  <T> T.assertNotNull(): T & Any = this ?: throw IllegalStateException("null value")
```

### 內嵌函式 {id="inline-functions"}

編譯器可以智慧轉換傳遞給[內嵌函式](inline-functions.md)的 Lambda 函式中所捕獲的變數。

內嵌函式被視為具有隱式的 [`callsInPlace`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.contracts/-contract-builder/calls-in-place.html) 協約。這表示傳遞給內嵌函式的任何 Lambda 函式都會在原地呼叫。由於 Lambda 函式是在原地呼叫，編譯器得知該 Lambda 函式不會外洩其函式主體中所包含的任何變數參考。

編譯器利用這項資訊與其他分析，來決定對任何捕獲的變數進行智慧轉換是否安全。例如：

```kotlin
interface Processor {
    fun process()
}

inline fun inlineAction(f: () -> Unit) = f()

fun nextProcessor(): Processor? = null

fun runProcessor(): Processor? {
    var processor: Processor? = null
    inlineAction {
        // 編譯器知道 processor 是一個區域變數，且 inlineAction() 是一個內嵌函式，
        // 因此 processor 的參考不會外洩。
        // 因此，對 processor 進行智慧轉換是安全的。
      
        // 如果 processor 不是 null，processor 就會被智慧轉換
        if (processor != null) {
            // 編譯器知道 processor 不是 null，因此不需要安全呼叫
            processor.process()
        }

        processor = nextProcessor()
    }

    return processor
}
```

### 例外處理 {id="exception-handling"}

智慧轉換資訊會傳遞至 `catch` 與 `finally` 區塊中。這讓您的程式碼更加安全，因為編譯器會追蹤您的物件是否具有可 null 型別。例如：

```kotlin
//sampleStart
fun testString() {
    var stringInput: String? = null
    // stringInput 被智慧轉換為 String 型別
    stringInput = ""
    try {
        // 編譯器知道 stringInput 不是 null
        println(stringInput.length)
        // 0

        // 編譯器捨棄了 stringInput 先前的智慧轉換資訊。
        // 現在 stringInput 具有 String? 型別。
        stringInput = null

        // 觸發例外
        if (2 > 1) throw Exception()
        stringInput = ""
    } catch (exception: Exception) {
        // 編譯器知道 stringInput 可能為 null，
        // 因此 stringInput 保持為可 null。
        println(stringInput?.length)
        // null
    }
}
//sampleEnd
fun main() {
    testString()
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-smart-casts-exception-handling"}

### 智慧轉換的先決條件 {id="smart-cast-prerequisites"}

僅當編譯器能保證變數在檢查與使用之間不會改變時，智慧轉換才能運作。智慧轉換可在下列條件下使用：

<table style="none">
    <tr>
        <td>
            <code>val</code> 區域變數
        </td>
        <td>
            一律可用，但<a href="delegated-properties.md">區域委託屬性</a>除外。
        </td>
    </tr>
    <tr>
        <td>
            <code>val</code> 屬性
        </td>
        <td>
            如果屬性為 <code>private</code>、<code>internal</code>，或者檢查是在宣告該屬性的同一個<a href="visibility-modifiers.md#modules">模組</a>中執行的。智慧轉換無法用於 <code>open</code> 屬性或具有自訂 getter 的屬性。
        </td>
    </tr>
    <tr>
        <td>
            <code>var</code> 區域變數
        </td>
        <td>
            如果變數在檢查與使用之間未被修改、未在會修改它的 Lambda 中被捕獲，且不是區域委託屬性。
        </td>
    </tr>
    <tr>
        <td>
            <code>var</code> 屬性
        </td>
        <td>
            絕不可用，因為該變數隨時可能被其他程式碼修改。
        </td>
    </tr>
</table>

## `as` 與 `as?` 轉換運算子 {id="unsafe-cast-operator"}

Kotlin 有兩個轉換運算子：`as` 與 `as?`。兩者皆可用於轉換，但行為不同。

如果使用 `as` 運算子轉換失敗，在執行時期會擲出 `ClassCastException`。這就是為什麼它也被稱為**不安全**（unsafe）運算子。您可以在轉換為非 null 型別時使用 `as`：

```kotlin
fun main() {
    val rawInput: Any = "user-1234"

    // 成功轉換為 String
    val userId = rawInput as String
    println("Logging in user with ID: $userId")
    // Logging in user with ID: user-1234

    // 觸發 ClassCastException
    val wrongCast = rawInput as Int
    println("wrongCast contains: $wrongCast")
    // Exception in thread "main" java.lang.ClassCastException
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-unsafe-cast-operator" validate="false"}

若改用 `as?` 運算子，且轉換失敗時，運算子會傳回 `null`。這就是為什麼它也被稱為**安全**（safe）運算子：

```kotlin
fun main() {
    val rawInput: Any = "user-1234"

    // 成功轉換為 String
    val userId = rawInput as? String
    println("Logging in user with ID: $userId")
    // Logging in user with ID: user-1234

    // 將 null 值指派給 wrongCast
    val wrongCast = rawInput as? Int
    println("wrongCast contains: $wrongCast")
    // wrongCast contains: null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-safe-cast-operator"}

若要安全地轉換可 null 型別，請使用 `as?` 運算子，以避免在轉換失敗時觸發 `ClassCastException`。

您**可以**對可 null 型別使用 `as`。這允許結果為 `null`，但如果轉換不成功，仍然會擲出 `ClassCastException`。因此，`as?` 是更安全的選擇：

```kotlin
fun main() {
    val config: Map<String, Any?> = mapOf(
        "username" to "kodee",
        "alias" to null,
        "loginAttempts" to 3
    )

    // 不安全地轉換為可 null 的 String
    val username: String? = config["username"] as String?
    println("Username: $username")
    // Username: kodee

    // 不安全地將 null 值轉換為可 null 的 String
    val alias: String? = config["alias"] as String?
    println("Alias: $alias")
    // Alias: null

    // 轉換為可 null 的 String 失敗並擲出 ClassCastException
    // val unsafeAttempts: String? = config["loginAttempts"] as String?
    // println("Login attempts (unsafe): $unsafeAttempts")
    // Exception in thread "main" java.lang.ClassCastException

    // 轉換為可 null 的 String 失敗並傳回 null
    val safeAttempts: String? = config["loginAttempts"] as? String
    println("Login attempts (safe): $safeAttempts")
    // Login attempts (safe): null
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-cast-nullable-types"}

### 向上與向下轉換 {id="up-and-downcasting"}

在 Kotlin 中，您可以將物件轉換為超型別與子型別。

將物件轉換為其超類別的執行個體稱為**向上轉換**（upcasting）。向上轉換不需要任何特殊語法或轉換運算子。例如：

```kotlin
interface Animal {
    fun makeSound()
}

class Dog : Animal {
    // 實作 makeSound() 的行為
    override fun makeSound() {
        println("Dog says woof!")
    }
}

fun printAnimalInfo(animal: Animal) {
    animal.makeSound()
}

fun main() {
    val dog = Dog()
    // 將 Dog 執行個體向上轉換為 Animal
    printAnimalInfo(dog)  
    // Dog says woof!
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-upcast"}

在此範例中，當使用 `Dog` 執行個體呼叫 `printAnimalInfo()` 函式時，編譯器會將其向上轉換為 `Animal`，因為這是預期的參數型別。由於實際物件仍然是 `Dog` 執行個體，編譯器會動態解析來自 `Dog` 類別的 `makeSound()` 函式，並印出 `"Dog says woof!"`。

您經常會在行為取決於抽象型別的 Kotlin API 中看到明確的向上轉換。在 Jetpack Compose 與 UI 工具包中也很常見，這些工具通常將所有 UI 元素視為超型別，稍後再對特定的子類別進行操作：

```kotlin
    val textView = TextView(this)
    textView.text = "Hello, View!"

    // 從 TextView 向上轉換為 View
    val view: View = textView  

    // 使用 View 函式
    view.setPadding(20, 20, 20, 20)
    // Activity 預期為 View 型別
    setContentView(view)
```

將物件轉換為子類別的執行個體稱為**向下轉換**（downcasting）。由於向下轉換可能不安全，您需要使用明確的轉換運算子。為了避免在轉換失敗時擲出例外，建議使用安全轉換運算子 `as?`，在轉換失敗時傳回 `null`：

```kotlin
interface Animal {
    fun makeSound()
}

class Dog : Animal {
    override fun makeSound() {
        println("Dog says woof!")
    }

    fun bark() {
        println("BARK!")
    }
}

fun main() {
    // 建立具有 Animal 型別的 Dog 執行個體 animal
    val animal: Animal = Dog()
    
    // 安全地將 animal 向下轉換為 Dog 型別
    val dog: Dog? = animal as? Dog

    // 若 dog 不是 null，使用安全呼叫存取 bark()
    dog?.bark()
    // "BARK!"
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-downcast"}

在此範例中，`animal` 被宣告為 `Animal` 型別，但它持有一個 `Dog` 執行個體。程式碼安全地將 `animal` 轉換為 `Dog` 型別，並使用[安全呼叫](null-safety.md#safe-call-operator)（`?.`）存取 `bark()` 函式。

您將會在序列化中，將基底類別還原序列化為特定子型別時使用向下轉換。在處理傳回超型別物件的 Java 程式庫時也很常見，您可能需要在 Kotlin 中對其進行向下轉換。