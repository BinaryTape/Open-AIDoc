[//]: # (title: 物件宣告與運算式)

在 Kotlin 中，物件（object）允許你在單一步驟中同時定義類別並建立其實例。
當你需要可重複使用的單例實例或一次性物件時，這項功能非常實用。
為了處理這些情境，Kotlin 提供了兩種核心方式：用於建立單例的 *物件宣告*（object declarations），以及用於建立匿名、一次性物件的 *物件運算式*（object expressions）。

> 單例可確保類別只有一個實例，並為其提供全域存取點。
> 
{style="tip"}

物件宣告與物件運算式最適合用於以下情境：

* **將單例用於共用資源：** 你需要確保整個應用程式中只存在該類別的一個實例。例如管理資料庫連線池。
* **建立工廠方法：** 你需要一種方便且有效率地建立實例的方式。[伴生物件](#companion-objects)允許你定義與類別繫結的類別層級函式與屬性，簡化這些實例的建立與管理。
* **暫時修改現有類別的行為：** 你想要修改現有類別的行為，而不需要建立新的子類別。例如為特定操作暫時為物件新增功能。
* **需要型別安全的設計：** 你需要透過物件運算式來一次性實作介面或[抽象類別](classes.md#abstract-classes)。這在按鈕點擊處理常式等情境中非常有用。

## 物件宣告 {id="object-declarations"}
{id="object-declarations-overview"}

你可以在 Kotlin 中使用物件宣告來建立單一物件實例，物件宣告在 `object` 關鍵字後面一律帶有名稱。
這讓你在單一步驟中定義類別並建立其實例，非常適合用來實作單例：

```kotlin
//sampleStart
// 宣告一個用於管理資料提供者的單例物件
object DataProviderManager {
    private val providers = mutableListOf<DataProvider>()

    // 註冊新的資料提供者
    fun registerDataProvider(provider: DataProvider) {
        providers.add(provider)
    }

    // 擷取所有已註冊的資料提供者
    val allDataProviders: Collection<DataProvider> 
        get() = providers
}
//sampleEnd

// 資料提供者介面範例
interface DataProvider {
    fun provideData(): String
}

// 資料提供者實作範例
class ExampleDataProvider : DataProvider {
    override fun provideData(): String {
        return "Example data"
    }
}

fun main() {
    // 建立 ExampleDataProvider 的實例
    val exampleProvider = ExampleDataProvider()

    // 若要參照該物件，直接使用其名稱即可
    DataProviderManager.registerDataProvider(exampleProvider)

    // 擷取並列印所有資料提供者
    println(DataProviderManager.allDataProviders.map { it.provideData() })
    // [Example data]
}
```
{kotlin-runnable="true" id="object-declaration-register-provider"}

> 物件宣告的初始化是執行緒安全的，並且在首次存取時進行。
>
{style="tip"}

若要參照該 `object`，直接使用其名稱即可：

```kotlin
DataProviderManager.registerDataProvider(exampleProvider)
```

物件宣告也可以擁有超型別，
類似於[匿名物件可以繼承自現有類別或實作介面](#inherit-anonymous-objects-from-supertypes)的方式：

```kotlin
object DefaultListener : MouseAdapter() {
    override fun mouseClicked(e: MouseEvent) { ... }

    override fun mouseEntered(e: MouseEvent) { ... }
}
```

就像變數宣告一樣，物件宣告並不是運算式，因此它們不能用於指派陳述式的右側：

```kotlin
// 語法錯誤：物件運算式無法繫結名稱。
val myObject = object MySingleton {
    val name = "Singleton"
}
```

你可以將物件宣告巢狀放置於其他物件宣告或非內部類別中，但不能直接放在函式內部，因為物件宣告不能是區域性的。巢狀物件宣告仍然是單例，你可以透過其外層物件或類別的名稱來存取它。

由於物件宣告不能直接巢狀放置在函式內部，請改用[物件運算式](#object-expressions)。這類物件是匿名的：你可以將它們指派給區域變數，但不能為 `object` 關鍵字指定名稱：

```kotlin
// 宣告巢狀在另一個物件宣告中的物件
object Outer {
    val name = "Outer"

    object Nested {
        val name = "Nested in Outer"
    }
}

// 宣告巢狀在類別中的物件
class Server {
    object Config {
        const val port = 8080
    }
}

fun main() {
    // 若要存取巢狀物件，
    // 請使用其外層物件的名稱來參照它
    println(Outer.Nested.name)
    // Nested in Outer

    println(Server.Config.port)
    // 8080

    // 物件運算式可以巢狀放置在函式內部
    val local = object {
        val name = "Nested in main()"
    }
    println(local.name)
    // Nested in main()

    // 物件宣告不能巢狀放置在函式內部
    // object Local {
    //     val name = "Nested in main()"
    // }
}
```
{kotlin-runnable="true" id="object-declaration-nested"}

### 資料物件 {id="data-objects"}

在 Kotlin 中列印一般的物件宣告時，字串表示形式會同時包含其名稱與該 `object` 的雜湊碼：

```kotlin
object MyObject

fun main() {
    println(MyObject) 
    // MyObject@hashcode
}
```
{kotlin-runnable="true" id="object-declaration-plain"}

然而，透過為物件宣告加上 `data` 修飾詞，你可以指示編譯器在呼叫 `toString()` 時傳回物件的實際名稱，運作方式就像[資料類別](data-classes.md)一樣：

```kotlin
data object MyDataObject {
    val number: Int = 3
}

fun main() {
    println(MyDataObject) 
    // MyDataObject
}
```
{kotlin-runnable="true" id="object-declaration-dataobject"}

此外，編譯器還會為你的 `data object` 產生數個函式：

* `toString()` 傳回資料物件的名稱
* `equals()`/`hashCode()` 支援相等性檢查與基於雜湊的集合操作

  > 你無法為 `data object` 提供自訂的 `equals` 或 `hashCode` 實作。
  >
  {style="note"}

`data object` 的 `equals()` 函式可確保所有具有該 `data object` 型別的物件都被視為相等。
在大多數情況下，由於 `data object` 宣告的是單例，因此在執行期只會有一個 `data object` 實例。
然而，在執行期產生了相同型別的另一個物件這種極端情況下（例如透過使用 `java.lang.reflect` 的平台反射，或是底層使用此 API 的 JVM 序列化程式庫），這能確保這些物件仍被視為相等。

> 請務必僅在結構上比較 `data objects`（使用 `==` 運算子），而絕不要透過參照比較（使用 `===` 運算子）。
> 這有助於避免在執行期存在多個資料物件實例時踩雷。
>
{style="warning"}

```kotlin
import java.lang.reflect.Constructor

data object MySingleton

fun main() {
    val evilTwin = createInstanceViaReflection()

    println(MySingleton) 
    // MySingleton

    println(evilTwin) 
    // MySingleton

    // 即使程式庫強制建立了 MySingleton 的第二個實例，
    // 其 equals() 函式仍會傳回 true：
    println(MySingleton == evilTwin) 
    // true

    // 請勿使用 === 比較資料物件
    println(MySingleton === evilTwin) 
    // false
}

fun createInstanceViaReflection(): MySingleton {
    // Kotlin 反射不允許將資料物件具現化。
    // 這裡「強制」建立了新的 MySingleton 實例（使用 Java 平台反射）
    // 請勿在正式環境中這樣做！
    return (MySingleton.javaClass.declaredConstructors[0].apply { isAccessible = true } as Constructor<MySingleton>).newInstance()
}
```

產生的 `hashCode()` 函式之行為與 `equals()` 函式保持一致，因此 `data object` 的所有執行期實例都具有相同的雜湊碼。

#### 資料物件與資料類別的差異 {id="differences-between-data-objects-and-data-classes"}

雖然 `data object` 與 `data class` 宣告經常搭配使用並且有一些相似之處，但有些函式並不會為 `data object` 產生：

* 沒有 `copy()` 函式。因為 `data object` 宣告的目的是作為單例使用，所以不會產生 `copy()` 函式。單例將類別的具現化限制為單一實例，而允許建立該實例的副本將會違背此原則。
* 沒有 `componentN()` 函式。與 `data class` 不同，`data object` 沒有任何資料屬性。試圖解構沒有資料屬性的物件毫無意義，因此不會產生 `componentN()` 函式。

#### 在密封階層結構中使用資料物件 {id="use-data-objects-with-sealed-hierarchies"}

資料物件宣告特別適用於如[密封類別或密封介面](sealed-classes.md)等密封階層結構。
它們讓你能與隨物件一起定義的任何資料類別保持對稱性。

在此範例中，將 `EndOfFile` 宣告為 `data object` 而非一般的 `object`，表示它將獲得 `toString()` 函式，而無需手動覆寫：

```kotlin
sealed interface ReadResult
data class Number(val number: Int) : ReadResult
data class Text(val text: String) : ReadResult
data object EndOfFile : ReadResult

fun main() {
    println(Number(7)) 
    // Number(number=7)
    println(EndOfFile) 
    // EndOfFile
}
```
{kotlin-runnable="true" id="data-objects-sealed-hierarchies"}

### 伴生物件 {id="companion-objects"}

*伴生物件*（Companion objects）允許你定義類別層級的函式與屬性。
這使得建立工廠方法、保留常數以及存取共用工具變得輕而易舉。

類別內部的物件宣告可以使用 `companion` 關鍵字標記：

```kotlin
class MyClass {
    companion object Factory {
        fun create(): MyClass = MyClass()
    }
}
```

只需使用類別名稱作為限定詞，即可直接呼叫 `companion object` 的成員：

```kotlin
class User(val name: String) {
    // 定義一個作為建立 User 實例之工廠的伴生物件
    companion object Factory {
        fun create(name: String): User = User(name)
    }
}

fun main(){
    // 使用類別名稱作為限定詞來呼叫伴生物件的工廠方法。
    // 建立新的 User 實例
    val userInstance = User.create("John Doe")
    println(userInstance.name)
    // John Doe
}
```
{kotlin-runnable="true" id="object-expression-companion-object"}

`companion object` 的名稱可以省略，此時會預設使用名稱 `Companion`：

```kotlin
class User(val name: String) {
    // 定義一個不具名稱的伴生物件
    companion object { }
}

// 存取伴生物件
val companionUser = User.Companion
```

類別成員可以存取其對應 `companion object` 的 `private` 成員：

```kotlin
class User(val name: String) {
    companion object {
        private val defaultGreeting = "Hello"
    }

    fun sayHi() {
        println(defaultGreeting)
    }
}
User("Nick").sayHi()
// Hello
```

當單獨使用類別名稱時，它會作為對該類別之伴生物件的參照，無論該伴生物件是否有名稱：

```kotlin
//sampleStart
class User1 {
    // 定義一個具名的伴生物件
    companion object Named {
        fun show(): String = "User1's Named Companion Object"
    }
}

// 使用類別名稱參照 User1 的伴生物件
val reference1 = User1

class User2 {
    // 定義一個未命名的伴生物件
    companion object {
        fun show(): String = "User2's Companion Object"
    }
}

// 使用類別名稱參照 User2 的伴生物件
val reference2 = User2
//sampleEnd

fun main() {
    // 呼叫 User1 伴生物件中的 show() 函式
    println(reference1.show()) 
    // User1's Named Companion Object

    // 呼叫 User2 伴生物件中的 show() 函式
    println(reference2.show()) 
    // User2's Companion Object
}
```
{kotlin-runnable="true" id="object-expression-companion-object-names"}

雖然 Kotlin 中伴生物件的成員看起來像其他語言中的靜態成員，但它們實際上是伴生物件的實例成員，這意味著它們屬於物件本身。
這使得伴生物件能夠實作介面：

```kotlin
interface Factory<T> {
    fun create(name: String): T
}

class User(val name: String) {
    // 定義實作了 Factory 介面的伴生物件
    companion object : Factory<User> {
        override fun create(name: String): User = User(name)
    }
}

fun main() {
    // 將伴生物件作為 Factory 使用
    val userFactory: Factory<User> = User
    val newUser = userFactory.create("Example User")
    println(newUser.name)
    // Example User
}
```
{kotlin-runnable="true" id="object-expression-factory"}

然而，在 JVM 上，如果你使用 `@JvmStatic` 註解，可以讓伴生物件的成員產生為真正的 static 方法和欄位。如需更多詳細資訊，請參閱 [Java 互操作性](java-to-kotlin-interop.md#static-fields)一節。

## 物件運算式 {id="object-expressions"}

物件運算式會宣告類別並建立該類別的實例，但不會為兩者命名。
這些類別適用於一次性使用。它們可以從頭開始建立、繼承自現有類別，或是實作介面。這些類別的實例也稱為 *匿名物件*（anonymous objects），因為它們是由運算式定義，而不是由名稱定義。

### 從頭開始建立匿名物件 {id="create-anonymous-objects-from-scratch"}

物件運算式以 `object` 關鍵字開頭。

如果該物件未擴充任何類別或實作介面，你可以直接在 `object` 關鍵字後面的花括號內定義物件的成員：

```kotlin
fun main() {
//sampleStart
    val helloWorld = object {
        val hello = "Hello"
        val world = "World"
        // 物件運算式繼承自 Any 類別，該類別已經有 toString() 函式，
        // 因此必須覆寫它
        override fun toString() = "$hello $world"
    }

    print(helloWorld)
    // Hello World
//sampleEnd
}
```
{kotlin-runnable="true" id="object-expression-object"}

### 匿名物件繼承超型別 {id="inherit-anonymous-objects-from-supertypes"}

若要建立繼承自某個型別（或多個型別）的匿名物件，請在 `object` 和冒號 `:` 後方指定該型別。然後實作或覆寫該類別的成員，就像你正[繼承](inheritance.md)它一樣：

```kotlin
window.addMouseListener(object : MouseAdapter() {
    override fun mouseClicked(e: MouseEvent) { /*...*/ }

    override fun mouseEntered(e: MouseEvent) { /*...*/ }
})
```

如果超型別具有建構函式，請向其傳遞適當的建構函式參數。
在冒號後方可指定多個超型別，並以逗號分隔：

```kotlin
//sampleStart
// 建立具有 balance 屬性的 open 類別 BankAccount
open class BankAccount(initialBalance: Int) {
    open val balance: Int = initialBalance
}

// 定義具有 execute() 函式的 Transaction 介面
interface Transaction {
    fun execute()
}

// 在 BankAccount 上執行特殊交易的函式
fun specialTransaction(account: BankAccount) {
    // 建立繼承自 BankAccount 類別並實作 Transaction 介面的匿名物件
    // 所提供帳戶的餘額會傳遞給 BankAccount 超類別的建構函式
    val temporaryAccount = object : BankAccount(account.balance), Transaction {

        override val balance = account.balance + 500  // 暫時獎勵

        // 實作 Transaction 介面的 execute() 函式
        override fun execute() {
            println("Executing special transaction. New balance is $balance.")
        }
    }
    // 執行交易
    temporaryAccount.execute()
}
//sampleEnd
fun main() {
    // 建立初始餘額為 1000 的 BankAccount
    val myAccount = BankAccount(1000)
    // 對已建立的帳戶執行特殊交易
    specialTransaction(myAccount)
    // Executing special transaction. New balance is 1500.
}
```
{kotlin-runnable="true" id="object-expression-anonymous-object"}

### 將匿名物件作為傳回型別與數值型別 {id="use-anonymous-objects-as-return-and-value-types"}

當你從區域函式或 [`private`](visibility-modifiers.md#packages) 函式或屬性傳回匿名物件時，該匿名物件的所有成員都可以透過該函式或屬性進行存取：

```kotlin
//sampleStart
class UserPreferences {
    private fun getPreferences() = object {
        val theme: String = "Dark"
        val fontSize: Int = 14
    }

    fun printPreferences() {
        val preferences = getPreferences()
        println("Theme: ${preferences.theme}, Font Size: ${preferences.fontSize}")
    }
}
//sampleEnd

fun main() {
    val userPreferences = UserPreferences()
    userPreferences.printPreferences()
    // Theme: Dark, Font Size: 14
}
```
{kotlin-runnable="true" id="object-expression-object-return"}

這允許你傳回帶有特定屬性的匿名物件，
提供了一種無需建立獨立類別即可封裝資料或行為的簡單方法。

如果傳回匿名物件的函式或屬性具有 `public`、`protected` 或 `internal` 可見度，則其實際型別為：

* 如果匿名物件沒有宣告超型別，則為 `Any`。
* 如果匿名物件恰好只有一個宣告的超型別，則為該超型別。
* 如果有多個宣告的超型別，則為明確宣告的型別。

在所有這些情況下，匿名物件中新增的成員都無法存取。如果覆寫的成員已宣告於該函式或屬性的實際型別中，則可以存取。例如：

```kotlin
//sampleStart
interface Notification {
    // 在 Notification 介面中宣告 notifyUser()
    fun notifyUser()
}

interface DetailedNotification

class NotificationManager {
    // 傳回型別為 Any。無法存取 message 屬性。
    // 當傳回型別為 Any 時，只能存取 Any 類別的成員。
    fun getNotification() = object {
        val message: String = "General notification"
    }

    // 傳回型別為 Notification，因為該匿名物件僅實作了一個介面
    // 可以存取 notifyUser() 函式，因為它是 Notification 介面的一部分
    // 無法存取 message 屬性，因為它未在 Notification 介面中宣告
    fun getEmailNotification() = object : Notification {
        override fun notifyUser() {
            println("Sending email notification")
        }
        val message: String = "You've got mail!"
    }

    // 傳回型別為 DetailedNotification。無法存取 notifyUser() 函式與 message 屬性
    // 只能存取在 DetailedNotification 介面中宣告的成員
    fun getDetailedNotification(): DetailedNotification = object : Notification, DetailedNotification {
        override fun notifyUser() {
            println("Sending detailed notification")
        }
        val message: String = "Detailed message content"
    }
}
//sampleEnd
fun main() {
    // 這不會產生任何輸出
    val notificationManager = NotificationManager()

    // 這裡無法存取 message 屬性，因為傳回型別為 Any
    // 這不會產生任何輸出
    val notification = notificationManager.getNotification()

    // 可以存取 notifyUser() 函式
    // 這裡無法存取 message 屬性，因為傳回型別為 Notification
    val emailNotification = notificationManager.getEmailNotification()
    emailNotification.notifyUser()
    // Sending email notification

    // 這裡無法存取 notifyUser() 函式與 message 屬性，因為傳回型別為 DetailedNotification
    // 這不會產生任何輸出
    val detailedNotification = notificationManager.getDetailedNotification()
}
```
{kotlin-runnable="true" id="object-expression-object-override"}

### 從匿名物件存取變數 {id="access-variables-from-anonymous-objects"}

物件運算式主體內的程式碼可以存取來自外層作用域的變數：

```kotlin
import java.awt.event.MouseAdapter
import java.awt.event.MouseEvent

fun countClicks(window: JComponent) {
    var clickCount = 0
    var enterCount = 0

    // MouseAdapter 為滑鼠事件函式提供預設實作
    // 模擬 MouseAdapter 處理滑鼠事件
    window.addMouseListener(object : MouseAdapter() {
        override fun mouseClicked(e: MouseEvent) {
            clickCount++
        }

        override fun mouseEntered(e: MouseEvent) {
            enterCount++
        }
    })
    // clickCount 與 enterCount 變數可在物件運算式內存取
}
```

## 物件宣告與運算式之間的行為差異 {id="behavior-difference-between-object-declarations-and-expressions"}

物件宣告與物件運算式在初始化行為上存在差異：

* 物件運算式在被使用之處*立即*執行（並初始化）。
* 物件宣告則是*延遲*初始化的，在首次存取時才進行。
* 伴生物件在載入（解析）對應的類別時進行初始化，這符合 Java 靜態初始設定式（static initializer）的語意。