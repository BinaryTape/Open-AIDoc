[//]: # (title: 擴充功能)

Kotlin 的「擴充功能 (extensions)」讓您能夠在不使用繼承或「裝飾者 (Decorator)」等設計模式的情況下，為類別或介面擴充新功能。當您使用的第三方程式庫無法直接修改時，這項功能特別實用。建立完成後，您可以像呼叫原始類別或介面的成員一樣呼叫這些擴充。

最常見的擴充形式是[擴充函式](#extension-functions)與[擴充屬性](#extension-properties)。

重要的是，擴充功能並不會修改它們所擴充的類別或介面。定義擴充時，您並不會新增成員，而是使用相同的語法讓新函式變得可呼叫，或是讓新屬性變得可存取。

## 接收者 (Receivers) {id="receivers"}

擴充一律在接收者 (receiver) 上呼叫。接收者必須具有與被擴充的類別或介面相同的型別。
若要使用擴充，請在接收者後加上 `.` 以及函式或屬性名稱作為前綴。

例如，標準函式庫中的 [`.appendLine()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/append-line.html) 擴充函式擴充了 `StringBuilder` 類別。
因此在此情況下，接收者是一個 `StringBuilder` 執行個體，而「接收者型別 (receiver type)」即為 `StringBuilder`：

```kotlin
fun main() { 
//sampleStart
    // builder 是 StringBuilder 的執行個體
    val builder = StringBuilder()
        // 在 builder 上呼叫 .appendLine() 擴充函式
        .appendLine("Hello")
        .appendLine()
        .appendLine("World")
    println(builder.toString())
    // Hello
    //
    // World
}
//sampleEnd
```
{kotlin-runnable="true" id="kotlin-extension-function-stringbuilder"}

## 擴充函式 (Extension functions) {id="extension-functions"}

在建立自己的擴充函式之前，請先確認您所需的功能是否已存在於 Kotlin [標準函式庫](https://kotlinlang.org/api/core/kotlin-stdlib/)中。
標準函式庫針對以下用途提供了許多實用的擴充函式：

* 操作集合：[`.map()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/map.html)、[`.filter()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/filter.html)、[`.reduce()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/reduce.html)、[`.fold()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/fold.html)、[`.groupBy()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/group-by.html)。
* 轉換為字串：[`.joinToString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/join-to-string.html)。
* 處理 null 值：[`.filterNotNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/filter-not-null.html)。

若要建立自己的擴充函式，請在其名稱前加上接收者型別並緊隨一個 `.`。在此範例中，`.truncate()` 函式擴充了 `String` 類別，因此接收者型別為 `String`：

```kotlin
fun String.truncate(maxLength: Int): String {
    return if (this.length <= maxLength) this else take(maxLength - 3) + "..."
}

fun main() {
    val shortUsername = "KotlinFan42"
    val longUsername = "JetBrainsLoverForever"

    println("Short username: ${shortUsername.truncate(15)}") 
    // KotlinFan42
    println("Long username:  ${longUsername.truncate(15)}")
    // JetBrainsLov...
}
```
{kotlin-runnable="true" id="kotlin-extension-function-truncate"}

`.truncate()` 函式會根據 `maxLength` 引數中的數字截斷呼叫它的字串，並附加省略號 `...`。
如果字串長度小於 `maxLength`，該函式將傳回原始字串。

在此範例中，`.displayInfo()` 函式擴充了 `User` 介面：

```kotlin
interface User {
    val name: String
    val email: String
}

fun User.displayInfo(): String = "User(name=$name, email=$email)"

// 繼承並實作 User 介面的屬性
class RegularUser(override val name: String, override val email: String) : User

fun main() {
    val user = RegularUser("Alice", "alice@example.com")
    println(user.displayInfo()) 
    // User(name=Alice, email=alice@example.com)
}
```
{kotlin-runnable="true" id="kotlin-extension-function-interface"}

`.displayInfo()` 函式會傳回包含 `RegularUser` 執行個體的 `name` 與 `email` 的字串。像這樣在介面上定義擴充，非常適合用於一次性為所有實作該介面的型別新增功能。

在此範例中，`.mostVoted()` 函式擴充了 `Map<String, Int>` 類別：

```kotlin
fun Map<String, Int>.mostVoted(): String? {
    return maxByOrNull { (key, value) -> value }?.key
}

fun main() {
    val poll = mapOf(
        "Cats" to 37,
        "Dogs" to 58,
        "Birds" to 22
    )

    println("Top choice: ${poll.mostVoted()}") 
    // Dogs
}
```
{kotlin-runnable="true" id="kotlin-extension-function-mostvoted"}

`.mostVoted()` 函式會遍歷呼叫它的 Map 的鍵值組，並使用 [`maxByOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/max-by-or-null.html) 函式傳回包含最大值的鍵值組的鍵。如果 Map 為空，`maxByOrNull()` 函式會傳回 `null`。`.mostVoted()` 函式使用安全呼叫 `?.`，僅在 `maxByOrNull()` 函式傳回非 null 值時存取 `key` 屬性。

### 泛型擴充函式 (Generic extension functions) {id="generic-extension-functions"}

若要建立泛型擴充函式，請在函式名稱之前宣告泛型型別參數，以便在接收者型別運算式中使用它。在此範例中，`.endpoints()` 函式擴充了 `List<T>`，其中 `T` 可以是任何型別：

```kotlin
fun <T> List<T>.endpoints(): Pair<T, T> {
    return first() to last()
}

fun main() {
    val cities = listOf("Paris", "London", "Berlin", "Prague")
    val temperatures = listOf(21.0, 19.5, 22.3)

    val cityEndpoints = cities.endpoints()
    val tempEndpoints = temperatures.endpoints()

    println("First and last cities: $cityEndpoints")
    // (Paris, Prague)
    println("First and last temperatures: $tempEndpoints") 
    // (21.0, 22.3)
}
```
{kotlin-runnable="true" id="kotlin-extension-function-endpoints"}

`.endpoints()` 函式會傳回包含呼叫它的清單中第一個與最後一個元素的一組 Pair。
在函式主體內，它呼叫了 `first()` 與 `last()` 函式，並使用 `to` 中綴函式將它們的傳回值組合成一個 `Pair`。

有關泛型的更多資訊，請參閱[泛型函式](generics.md)。

### 可為 null 的接收者 (Nullable receivers) {id="nullable-receivers"}

您可以定義具有可為 null 接收者型別的擴充函式，這讓您即使變數的值為 null 也能在其上呼叫擴充。當接收者為 `null` 時，`this` 也會是 `null`。請確保在您的函式內部妥善處理可 null 性。例如，在函式主體內使用 `this == null` 檢查、[安全呼叫 `?.`](null-safety.md#safe-call-operator) 或 [Elvis 運算子 `?:`](null-safety.md#elvis-operator)。

在此範例中，您可以在呼叫 `.toString()` 函式時無需檢查 `null`，因為檢查已經在擴充函式內部完成：

```kotlin
fun main() {
    //sampleStart
    // 可為 null 的 Any 上的擴充函式
    fun Any?.toString(): String {
        if (this == null) return "null"
        // 經過 null 檢查後，`this` 會被智慧轉型為不可為 null 的 Any
        // 因此這個呼叫會解析為一般的 toString() 函式
        return toString()
    }
    
    val number: Int? = 42
    val nothing: Any? = null
    
    println(number.toString())
    // 42
    println(nothing.toString()) 
    // null
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-extension-function-nullable-receiver"}

### 是擴充函式還是成員函式？ {id="extension-or-member-functions"}

由於擴充函式與成員函式的呼叫具有相同的表示法，編譯器如何知道要使用哪一個？
擴充函式是「靜態 (statically)」分派的，這代表編譯器會在編譯期根據接收者型別來決定呼叫哪一個函式。例如：

```kotlin
fun main() {
//sampleStart
    open class Shape
    class Rectangle: Shape()
    
    fun Shape.getName() = "Shape"
    fun Rectangle.getName() = "Rectangle"
    
    fun printClassName(shape: Shape) {
        println(shape.getName())
    }
    
    printClassName(Rectangle())
    // Shape
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-extension-function-shape"}

在此範例中，編譯器會呼叫 `Shape.getName()` 擴充函式，因為參數 `shape` 被宣告為 `Shape` 型別。由於擴充函式是靜態解析的，編譯器會根據宣告的型別而非實際的執行個體來選擇函式。

因此，即使該範例傳入了 `Rectangle` 執行個體，由於該變數宣告為 `Shape` 型別，`.getName()` 函式仍會解析為 `Shape.getName()`。

如果某個類別擁有一個成員函式，且同時存在一個接收者型別相同、名稱相同且引數相容的擴充函式，則成員函式具有優先權。例如：

```kotlin
fun main() {
//sampleStart
    class Example {
        fun printFunctionType() { println("Member function") }
    }
    
    fun Example.printFunctionType() { println("Extension function") }
    
    Example().printFunctionType()
    // Member function
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-extension-function-member-function"}

然而，擴充函式可以多載具有相同名稱但「簽章不同」的成員函式：

```kotlin
fun main() {
//sampleStart
    class Example {
        fun printFunctionType() { println("Member function") }
    }
    
    // 名稱相同但簽章不同
    fun Example.printFunctionType(index: Int) { println("Extension function #$index") }
    
    Example().printFunctionType(1)
    // Extension function #1
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-extension-function-member-function-overload"}

在此範例中，由於傳遞了一個 `Int` 給 `.printFunctionType()` 函式，編譯器會選擇擴充函式，因為它符合簽章。編譯器會忽略不接受引數的成員函式。

### 匿名擴充函式 (Anonymous extension functions) {id="anonymous-extension-functions"}

您可以定義沒有名稱的擴充函式。當您想避免污染全域命名空間，或需要將某些擴充行為作為參數傳遞時，這非常實用。

例如，假設您想為資料類別擴充一個計算運費的一次性函式，且不為其指定名稱：

```kotlin
fun main() {
    //sampleStart
    data class Order(val weight: Double)
    val calculateShipping = fun Order.(rate: Double): Double = this.weight * rate
    
    val order = Order(2.5)
    val cost = order.calculateShipping(3.0)
    println("Shipping cost: $cost") 
    // Shipping cost: 7.5
}
```
{kotlin-runnable="true" id="kotlin-extension-function-anonymous"}

若要將擴充行為作為參數傳遞，請使用帶有型別註解的 [Lambda 運算式](lambdas.md#lambda-expression-syntax)。
例如，假設您想要在不定義具名函式的情況下檢查數字是否在某個範圍內：

```kotlin
fun main() {
    val isInRange: Int.(min: Int, max: Int) -> Boolean = { min, max -> this in min..max }

    println(5.isInRange(1, 10))
    // true
    println(20.isInRange(1, 10))
    // false
}
```
 {kotlin-runnable="true" id="kotlin-extension-function-anonymous-lambda"}

在此範例中，`isInRange` 變數保存了一個型別為 `Int.(min: Int, max: Int) -> Boolean` 的函式。該型別是 `Int` 類別上的擴充函式，接受 `min` 與 `max` 參數並傳回 `Boolean`。

Lambda 主體 `{ min, max -> this in min..max }` 會檢查呼叫該函式的 `Int` 值是否落在 `min` 與 `max` 參數之間的範圍內。如果檢查成功，Lambda 會傳回 `true`。

如需更多資訊，請參閱 [Lambda 運算式與匿名函式](lambdas.md)。

## 擴充屬性 (Extension properties) {id="extension-properties"}

Kotlin 支援擴充屬性，這對於執行資料轉換或建立 UI 顯示幫助程式非常實用，而且不會使您正在處理的類別變得雜亂。

若要建立擴充屬性，請寫入您要擴充的類別名稱，後接 `.` 以及您的屬性名稱。

例如，假設您有一個表示具有名字和姓氏的使用者的資料類別，並且希望建立一個在存取時傳回電子郵件樣式使用者名稱的屬性。您的程式碼可能會像這樣：

```kotlin
data class User(val firstName: String, val lastName: String)

// 用於獲取使用者名稱樣式電子郵件 handle 的擴充屬性
val User.emailUsername: String
    get() = "${firstName.lowercase()}.${lastName.lowercase()}"

fun main() {
    val user = User("Mickey", "Mouse")
    // 呼叫擴充屬性
    println("Generated email username: ${user.emailUsername}")
    // Generated email username: mickey.mouse
}
```
{kotlin-runnable="true" id="kotlin-extension-function-property"}

由於擴充實際上並不會向類別新增成員，因此沒有有效的方法讓擴充屬性擁有[支援欄位](properties.md#backing-fields)。這就是為什麼擴充屬性不允許使用初始設定式。您只能透過明確提供 getter 與 setter 來定義它們的行為。例如：

```kotlin
data class House(val streetName: String)

// 無法編譯，因為沒有 getter 和 setter
// var House.number = 1
// 錯誤：初始設定式不允許用於擴充屬性

// 編譯成功
val houseNumbers = mutableMapOf<House, Int>()
var House.number: Int
    get() = houseNumbers[this] ?: 1
    set(value) {
        println("Setting house number for ${this.streetName} to $value")
        houseNumbers[this] = value
    }

fun main() {
    val house = House("Maple Street")

    // 顯示預設值
    println("Default number: ${house.number} ${house.streetName}") 
    // Default number: 1 Maple Street
    
    house.number = 99
    // Setting house number for Maple Street to 99

    // 顯示更新後的數值
    println("Updated number: ${house.number} ${house.streetName}") 
    // Updated number: 99 Maple Street
}
```
{kotlin-runnable="true" id="kotlin-extension-function-property-error"}

在此範例中，getter 使用 [Elvis 運算子](null-safety.md#elvis-operator)傳回門牌號碼（如果存在於 `houseNumbers` 映射中），否則傳回 `1`。若要深入了解如何編寫 getter 與 setter，請參閱[自訂 getter 與 setter](properties.md#custom-getters-and-setters)。

## 隨伴物件擴充 (Companion object extensions) {id="companion-object-extensions"}

如果類別定義了[隨伴物件](object-declarations.md#companion-objects)，您也可以為該隨伴物件定義擴充函式與屬性。就像隨伴物件的一般成員一樣，您可以僅使用類別名稱作為限定詞來呼叫它們。編譯器預設將隨伴物件命名為 `Companion`：

```kotlin
class Logger {
    companion object { }
}

fun Logger.Companion.logStartupMessage() {
    println("Application started.")
}

fun main() {
    Logger.logStartupMessage()
    // Application started.
}
```
{kotlin-runnable="true" id="kotlin-extension-function-companion-object"}

## 將擴充宣告為成員 (Declaring extensions as members) {id="declaring-extensions-as-members"}

您可以在一個類別內部為另一個類別宣告擴充。像這樣的擴充擁有多個「隱式接收者 (implicit receivers)」。
隱式接收者是指其成員在存取時無需以 [`this`](this-expressions.md#qualified-this) 進行限定的物件：

* 宣告該擴充的類別稱為「分派接收者 (dispatch receiver)」。
* 擴充函式的接收者型別稱為「擴充接收者 (extension receiver)」。

請參考以下範例，其中 `Connection` 類別為 `Host` 類別定義了一個名為 `printConnectionString()` 的擴充函式：

```kotlin
class Host(val hostname: String) {
    fun printHostname() { print(hostname) }
}

class Connection(val host: Host, val port: Int) {
    fun printPort() { print(port) }

    // Host 是擴充接收者
    fun Host.printConnectionString() {
        // 呼叫 Host.printHostname()
        printHostname() 
        print(":")
        // 呼叫 Connection.printPort()
        // Connection 是分派接收者
        printPort()
    }

    fun connect() {
        /*...*/
        // 呼叫擴充函式
        host.printConnectionString() 
    }
}

fun main() {
    Connection(Host("kotl.in"), 443).connect()
    // kotl.in:443
    
    // 會觸發錯誤，因為擴充函式在 Connection 外部無法使用
    // Host("kotl.in").printConnectionString()
    // Unresolved reference 'printConnectionString'.
}
```
{kotlin-runnable="true" id="kotlin-extension-function-members"}

此範例在 `Connection` 類別內部宣告了 `printConnectionString()` 函式，因此 `Connection` 類別是分派接收者。該擴充函式的接收者型別是 `Host` 類別，因此 `Host` 類別是擴充接收者。

如果分派接收者與擴充接收者擁有同名成員，則擴充接收者的成員具有優先權。若要明確存取分派接收者，請使用[限定的 `this` 語法](this-expressions.md#qualified-this)：

```kotlin
class Connection {
    fun Host.getConnectionString() {
        // 呼叫 Host.toString()
        toString()
        // 呼叫 Connection.toString()
        this@Connection.toString()
    }
}
```

### 覆寫成員擴充 (Overriding member extensions) {id="overriding-member-extensions"}

您可以將成員擴充宣告為 `open` 並在子類別中覆寫它們，當您想要針對每個子類別自訂擴充的行為時，這非常有用。編譯器對待每種接收者型別的方式不同：

| 接收者型別 | 解析時機 | 分派型別 |
|---|---|---|
| 分派接收者 | 執行階段 | 虛擬 (Virtual) |
| 擴充接收者 | 編譯期 | 靜態 (Static) |

請參考這個範例，其中 `User` 類別為 `open`，而 `Admin` 類別繼承自它。`NotificationSender` 類別為 `User` 與 `Admin` 類別定義了 `sendNotification()` 擴充函式，而 `SpecialNotificationSender` 類別則覆寫了它們：

```kotlin
open class User

class Admin : User()

open class NotificationSender {
    open fun User.sendNotification() {
        println("Sending user notification from normal sender")
    }

    open fun Admin.sendNotification() {
        println("Sending admin notification from normal sender")
    }

    fun notify(user: User) {
        user.sendNotification()
    }
}

class SpecialNotificationSender : NotificationSender() {
    override fun User.sendNotification() {
        println("Sending user notification from special sender")
    }

    override fun Admin.sendNotification() {
        println("Sending admin notification from special sender")
    }
}

fun main() {
    // 分派接收者是 NotificationSender
    // 擴充接收者是 User
    // 解析為 NotificationSender 中的 User.sendNotification()
    NotificationSender().notify(User())
    // Sending user notification from normal sender
    
    // 分派接收者是 SpecialNotificationSender
    // 擴充接收者是 User
    // 解析為 SpecialNotificationSender 中的 User.sendNotification()
    SpecialNotificationSender().notify(User())
    // Sending user notification from special sender 
    
    // 分派接收者是 SpecialNotificationSender
    // 擴充接收者是 User 而非 Admin
    // notify() 函式將 user 宣告為 User 型別
    // 靜態解析為 SpecialNotificationSender 中的 User.sendNotification()
    SpecialNotificationSender().notify(Admin())
    // Sending user notification from special sender 
}
```
{kotlin-runnable="true" id="kotlin-extension-open"}

分派接收者在執行階段使用虛擬分派解析，這使得 `main()` 函式中的行為更容易理解。可能會讓您感到意外的是，當您在 `Admin` 執行個體上呼叫 `notify()` 函式時，編譯器會根據宣告的型別：`user: User` 來選擇擴充，因為它會靜態解析擴充接收者。

## 擴充與可見性修飾詞 (Extensions and visibility modifiers) {id="extensions-and-visibility-modifiers"}

擴充使用與在相同作用域中宣告的一般函式相同的[可見性修飾詞](visibility-modifiers.md)，包括宣告為其他類別成員的擴充。

例如，在檔案最頂層宣告的擴充可以存取同一檔案中的其他 `private` 頂層宣告：

```kotlin
// 檔案：StringUtils.kt

private fun removeWhitespace(input: String): String {
    return input.replace("\\s".toRegex(), "")
}

fun String.cleaned(): String {
    return removeWhitespace(this)
}

fun main() {
    val rawEmail = "  user @example. com  "
    val cleaned = rawEmail.cleaned()
    println("Raw:     '$rawEmail'")
    // Raw:     '  user @example. com  '
    println("Cleaned: '$cleaned'")
    // Cleaned: 'user@example.com'
    println("Looks like an email: ${cleaned.contains("@") && cleaned.contains(".")}") 
    // Looks like an email: true
}
```
{kotlin-runnable="true" id="kotlin-extension-visibility-top-level"}

如果擴充是宣告在其接收者型別之外，則它無法存取接收者的 `private` 或 `protected` 成員：

```kotlin
class User(private val password: String) {
    fun isLoggedIn(): Boolean = true
    fun passwordLength(): Int = password.length
}

// 宣告在類別外部的擴充
fun User.isSecure(): Boolean {
    // 無法存取 password，因為它是 private：
    // return password.length >= 8

    // 相反地，我們依賴 public 成員：
    return passwordLength() >= 8 && isLoggedIn()
}

fun main() {
    val user = User("supersecret")
    println("Is user secure: ${user.isSecure()}") 
    // Is user secure: true
}
```
{kotlin-runnable="true" id="kotlin-extension-visibility-outside-receiver"}

如果擴充被標記為 `internal`，則只能在其[模組](visibility-modifiers.md#modules)內部進行存取：

```kotlin
// 網路模組
// JsonParser.kt
internal fun String.parseJson(): Map<String, Any> {
    return mapOf("fakeKey" to "fakeValue")
}
```

## 擴充的作用域 (Scope of extensions) {id="scope-of-extensions"}

在大多數情況下，您會在最頂層（即直接在套件底下）定義擴充：

```kotlin
package org.example.declarations

fun List<String>.getLongestString() { /*...*/}
```

若要在宣告擴充的套件之外使用它，請在呼叫點進行匯入：

```kotlin
package org.example.usage

import org.example.declarations.getLongestString

fun main() {
    val list = listOf("red", "green", "blue")
    list.getLongestString()
}
```

如需更多資訊，請參閱[匯入](packages.md#imports)。