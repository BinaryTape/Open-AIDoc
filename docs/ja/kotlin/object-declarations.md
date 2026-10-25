[//]: # (title: オブジェクト宣言とオブジェクト式)

Kotlinでは、オブジェクトを使用することで、クラスの定義とそのインスタンスの作成を単一のステップで行うことができます。
これは、再利用可能なシングルトンインスタンスや、使い捨てのワンタイムオブジェクトが必要な場合に役立ちます。
このようなシナリオに対応するため、Kotlinは2つの主要なアプローチを提供しています。シングルトンを作成するための*オブジェクト宣言*（object declaration）と、匿名のワンタイムオブジェクトを作成するための*オブジェクト式*（object expression）です。

> シングルトンは、クラスのインスタンスが1つしか存在しないことを保証し、それに対するグローバルなアクセスポイントを提供します。
> 
{style="tip"}

オブジェクト宣言とオブジェクト式は、次のようなシナリオでの使用に最適です。

* **共有リソースにシングルトンを使用する場合：** アプリケーション全体でクラスのインスタンスが1つだけ存在することを保証する必要がある場合です。例えば、データベース接続プールの管理などが挙げられます。
* **ファクトリメソッドを作成する場合：** インスタンスを効率的に作成するための便利な方法が必要な場合です。[コンパニオンオブジェクト](#companion-objects)を使用すると、クラスに紐づくクラスレベルの関数やプロパティを定義でき、これらのインスタンスの作成と管理を簡素化できます。
* **既存のクラスの振る舞いを一時的に変更する場合：** 新しいサブクラスを作成することなく、既存のクラスの振る舞いを変更したい場合です。例えば、特定の操作のためにオブジェクトへ一時的に機能を追加する場合などが該当します。
* **型安全な設計が必要な場合：** オブジェクト式を使用してインターフェースまたは[抽象クラス](classes.md#abstract-classes)のワンタイム実装が必要な場合です。これは、ボタンクリックのハンドラーなどのシナリオで役立ちます。

## オブジェクト宣言 {id="object-declarations"}
{id="object-declarations-overview"}

Kotlinではオブジェクト宣言を使用してオブジェクトの単一インスタンスを作成できます。オブジェクト宣言では、常に `object` キーワードの後に名前が続きます。
これにより、クラスの定義とそのインスタンスの作成を単一のステップで行うことができ、シングルトンを実装するのに役立ちます。

```kotlin
//sampleStart
// データプロバイダーを管理するシングルトンオブジェクトを宣言
object DataProviderManager {
    private val providers = mutableListOf<DataProvider>()

    // 新しいデータプロバイダーを登録
    fun registerDataProvider(provider: DataProvider) {
        providers.add(provider)
    }

    // 登録されているすべてのデータプロバイダーを取得
    val allDataProviders: Collection<DataProvider> 
        get() = providers
}
//sampleEnd

// データプロバイダーインターフェースの例
interface DataProvider {
    fun provideData(): String
}

// データプロバイダー実装の例
class ExampleDataProvider : DataProvider {
    override fun provideData(): String {
        return "Example data"
    }
}

fun main() {
    // ExampleDataProviderのインスタンスを作成
    val exampleProvider = ExampleDataProvider()

    // オブジェクトを参照するには、その名前を直接使用する
    DataProviderManager.registerDataProvider(exampleProvider)

    // すべてのデータプロバイダーを取得して出力
    println(DataProviderManager.allDataProviders.map { it.provideData() })
    // [Example data]
}
```
{kotlin-runnable="true" id="object-declaration-register-provider"}

> オブジェクト宣言の初期化はスレッドセーフであり、初回アクセス時に行われます。
>
{style="tip"}

この `object` を参照するには、その名前を直接使用します。

```kotlin
DataProviderManager.registerDataProvider(exampleProvider)
```

オブジェクト宣言は、[匿名オブジェクトが既存のクラスを継承したりインターフェースを実装したりできる](#inherit-anonymous-objects-from-supertypes)のと同様に、スーパータイプを持つこともできます。

```kotlin
object DefaultListener : MouseAdapter() {
    override fun mouseClicked(e: MouseEvent) { ... }

    override fun mouseEntered(e: MouseEvent) { ... }
}
```

変数宣言と同様に、オブジェクト宣言は式ではないため、代入文の右辺で使用することはできません。

```kotlin
// 構文エラー：オブジェクト宣言には名前を代入できません。
val myObject = object MySingleton {
    val name = "Singleton"
}
```

オブジェクト宣言は、他のオブジェクト宣言やインナークラス以外のクラスの内部にネストできますが、ローカルにすることはできないため、関数の内部に直接ネストすることはできません。ネストされたオブジェクト宣言もシングルトンであり、それを囲むオブジェクトまたはクラスの名前を介してアクセスできます。

オブジェクト宣言は関数の内部に直接ネストできないため、代わりに[オブジェクト式](#object-expressions)を使用します。このようなオブジェクトは匿名です。ローカル変数に代入することはできますが、`object` キーワードの後に名前を付けることはできません。

```kotlin
// 別のオブジェクト宣言の内部にネストされたオブジェクトを宣言
object Outer {
    val name = "Outer"

    object Nested {
        val name = "Nested in Outer"
    }
}

// クラスの内部にネストされたオブジェクトを宣言
class Server {
    object Config {
        const val port = 8080
    }
}

fun main() {
    // ネストされたオブジェクトにアクセスするには、
    // それを囲むオブジェクトの名前を使用して参照する
    println(Outer.Nested.name)
    // Nested in Outer

    println(Server.Config.port)
    // 8080

    // オブジェクト式は関数の内部にネスト可能
    val local = object {
        val name = "Nested in main()"
    }
    println(local.name)
    // Nested in main()

    // オブジェクト宣言は関数の内部にネストできない
    // object Local {
    //     val name = "Nested in main()"
    // }
}
```
{kotlin-runnable="true" id="object-declaration-nested"}

### データオブジェクト {id="data-objects"}

Kotlinで通常のオブジェクト宣言を出力すると、その文字列表現には名前とその `object` のハッシュコードの両方が含まれます。

```kotlin
object MyObject

fun main() {
    println(MyObject) 
    // MyObject@hashcode
}
```
{kotlin-runnable="true" id="object-declaration-plain"}

しかし、オブジェクト宣言に `data` 修飾子を付けることで、[データクラス](data-classes.md)と同様に、`toString()` の呼び出し時にオブジェクトの実際の名前を返すようにコンパイラに指示できます。

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

さらに、コンパイラは `data object` に対して以下の関数を生成します。

* `toString()`：データオブジェクトの名前を返します
* `equals()`/`hashCode()`：等価性チェックやハッシュベースのコレクションを可能にします

  > `data object` にカスタムの `equals` や `hashCode` 実装を提供することはできません。
  >
  {style="note"}

`data object` の `equals()` 関数は、その `data object` の型を持つすべてのオブジェクトが等しいとみなされることを保証します。`data object` はシングルトンを宣言するため、ほとんどの場合、実行時には `data object` のインスタンスは1つしか存在しません。しかし、実行時に同じ型の別のオブジェクトが生成されるというエッジケース（例えば、`java.lang.reflect` によるプラットフォームのリフレクションや、水面下でこのAPIを使用するJVMシリアライゼーションライブラリを使用した場合など）において、それらのオブジェクトが等しいものとして扱われることが保証されます。

> `data object` の比較は必ず構造的に（`==` 演算子を使用して）行い、決して参照で（`===` 演算子を使用して）比較しないでください。これにより、実行時にデータオブジェクトのインスタンスが複数存在する場合の落とし穴を回避できます。
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

    // ライブラリがMySingletonの2つ目のインスタンスを強制的に作成した場合でも、
    // そのequals()関数はtrueを返す：
    println(MySingleton == evilTwin) 
    // true

    // データオブジェクトの比較に===を使用してはいけない
    println(MySingleton === evilTwin) 
    // false
}

fun createInstanceViaReflection(): MySingleton {
    // Kotlinのリフレクションではデータオブジェクトのインスタンス化は許可されていない。
    // これは（Javaプラットフォームのリフレクションを使用して）"強制的に"新しいMySingletonインスタンスを作成している
    // 自分でこのようなことをしてはいけない！
    return (MySingleton.javaClass.declaredConstructors[0].apply { isAccessible = true } as Constructor<MySingleton>).newInstance()
}
```

生成された `hashCode()` 関数は `equals()` 関数と一貫した動作をするため、`data object` のすべての実行時インスタンスは同じハッシュコードを持ちます。

#### データオブジェクトとデータクラスの違い {id="differences-between-data-objects-and-data-classes"}

`data object` と `data class` の宣言はよく併用され、いくつかの類似点がありますが、`data object` には生成されない関数もあります。

* `copy()` 関数がない。`data object` 宣言はシングルトンとして使用されることを目的としているため、`copy()` 関数は生成されません。シングルトンはクラスのインスタンス化を単一のインスタンスに制限するものであり、インスタンスのコピー作成を許可するとそれに反することになります。
* `componentN()` 関数がない。`data class` とは異なり、`data object` にはデータプロパティがありません。データプロパティを持たないこのようなオブジェクトを分解（destructure）しようとしても意味がないため、`componentN()` 関数は生成されません。

#### sealed 階層でデータオブジェクトを使用する {id="use-data-objects-with-sealed-hierarchies"}

データオブジェクト宣言は、[sealed クラスや sealed インターフェース](sealed-classes.md)のような sealed 階層において特に有用です。オブジェクトと並んで定義された可能性のあるデータクラスとの対称性を維持することができます。

この例では、`EndOfFile` を通常の `object` ではなく `data object` として宣言することで、手動でオーバーライドしなくても `toString()` 関数を取得できることを意味しています。

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

### コンパニオンオブジェクト {id="companion-objects"}

*コンパニオンオブジェクト*（Companion objects）を使用すると、クラスレベルの関数やプロパティを定義できます。これにより、ファクトリメソッドの作成、定数の保持、共有ユーティリティへのアクセスが容易になります。

クラス内のオブジェクト宣言には、`companion` キーワードを付けることができます。

```kotlin
class MyClass {
    companion object Factory {
        fun create(): MyClass = MyClass()
    }
}
```

`companion object` のメンバーは、修飾子としてクラス名を使用するだけで呼び出すことができます。

```kotlin
class User(val name: String) {
    // Userインスタンスを作成するためのファクトリとして機能するコンパニオンオブジェクトを定義
    companion object Factory {
        fun create(name: String): User = User(name)
    }
}

fun main(){
    // クラス名を修飾子として使用してコンパニオンオブジェクトのファクトリメソッドを呼び出す。
    // 新しいUserインスタンスを作成
    val userInstance = User.create("John Doe")
    println(userInstance.name)
    // John Doe
}
```
{kotlin-runnable="true" id="object-expression-companion-object"}

`companion object` の名前は省略可能であり、その場合は `Companion` という名前が使用されます。

```kotlin
class User(val name: String) {
    // 名前のないコンパニオンオブジェクトを定義
    companion object { }
}

// コンパニオンオブジェクトにアクセス
val companionUser = User.Companion
```

クラスのメンバーは、対応する `companion object` の `private` メンバーにアクセスできます。

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

クラス名が単独で使用される場合、コンパニオンオブジェクトに名前が付いているかどうかに関係なく、そのクラスのコンパニオンオブジェクトへの参照として機能します。

```kotlin
//sampleStart
class User1 {
    // 名前付きコンパニオンオブジェクトを定義
    companion object Named {
        fun show(): String = "User1's Named Companion Object"
    }
}

// クラス名を使用してUser1のコンパニオンオブジェクトを参照
val reference1 = User1

class User2 {
    // 名前のないコンパニオンオブジェクトを定義
    companion object {
        fun show(): String = "User2's Companion Object"
    }
}

// クラス名を使用してUser2のコンパニオンオブジェクトを参照
val reference2 = User2
//sampleEnd

fun main() {
    // User1のコンパニオンオブジェクトからshow()関数を呼び出す
    println(reference1.show()) 
    // User1's Named Companion Object

    // User2のコンパニオンオブジェクトからshow()関数を呼び出す
    println(reference2.show()) 
    // User2's Companion Object
}
```
{kotlin-runnable="true" id="object-expression-companion-object-names"}

Kotlinのコンパニオンオブジェクトのメンバーは他の言語の静的メンバーのように見えますが、実際にはコンパニオンオブジェクトのインスタンスメンバーであり、オブジェクト自体に属しています。これにより、コンパニオンオブジェクトはインターフェースを実装できます。

```kotlin
interface Factory<T> {
    fun create(name: String): T
}

class User(val name: String) {
    // Factoryインターフェースを実装するコンパニオンオブジェクトを定義
    companion object : Factory<User> {
        override fun create(name: String): User = User(name)
    }
}

fun main() {
    // コンパニオンオブジェクトをFactoryとして使用
    val userFactory: Factory<User> = User
    val newUser = userFactory.create("Example User")
    println(newUser.name)
    // Example User
}
```
{kotlin-runnable="true" id="object-expression-factory"}

ただし、JVM上では、`@JvmStatic` アノテーションを使用することで、コンパニオンオブジェクトのメンバーを実際の静的メソッドおよびフィールドとして生成させることができます。詳細については、[Javaとの相互運用性](java-to-kotlin-interop.md#static-fields)セクションを参照してください。

## オブジェクト式 {id="object-expressions"}

オブジェクト式はクラスを宣言し、そのクラスのインスタンスを作成しますが、どちらにも名前を付けません。これらのクラスは、一度限りの使用に役立ちます。ゼロから作成することも、既存のクラスから継承することも、インターフェースを実装することもできます。これらのクラスのインスタンスは、名前ではなく式によって定義されるため、*匿名オブジェクト*（anonymous objects）とも呼ばれます。

### ゼロから匿名オブジェクトを作成する {id="create-anonymous-objects-from-scratch"}

オブジェクト式は `object` キーワードで始まります。

オブジェクトがいかなるクラスも拡張せず、インターフェースも実装しない場合は、`object` キーワードの後の波括弧の内側に直接オブジェクトのメンバーを定義できます。

```kotlin
fun main() {
//sampleStart
    val helloWorld = object {
        val hello = "Hello"
        val world = "World"
        // オブジェクト式はAnyクラスを拡張しており、AnyにはすでにtoString()関数があるため、
        // オーバーライドする必要がある
        override fun toString() = "$hello $world"
    }

    print(helloWorld)
    // Hello World
//sampleEnd
}
```
{kotlin-runnable="true" id="object-expression-object"}

### スーパータイプから匿名オブジェクトを継承する {id="inherit-anonymous-objects-from-supertypes"}

ある型（または複数の型）から継承する匿名オブジェクトを作成するには、`object` とコロン `:` の後にその型を指定します。そして、通常の[継承](inheritance.md)と同様に、そのクラスのメンバーを実装またはオーバーライドします。

```kotlin
window.addMouseListener(object : MouseAdapter() {
    override fun mouseClicked(e: MouseEvent) { /*...*/ }

    override fun mouseEntered(e: MouseEvent) { /*...*/ }
})
```

スーパータイプにコンストラクタがある場合は、適切なコンストラクタ引数を渡します。コロンの後にカンマで区切って複数のスーパータイプを指定できます。

```kotlin
//sampleStart
// balanceプロパティを持つopenクラスBankAccountを作成
open class BankAccount(initialBalance: Int) {
    open val balance: Int = initialBalance
}

// execute()関数を持つTransactionインターフェースを定義
interface Transaction {
    fun execute()
}

// BankAccountに対して特別なトランザクションを実行する関数
fun specialTransaction(account: BankAccount) {
    // BankAccountクラスを継承し、Transactionインターフェースを実装する匿名オブジェクトを作成
    // 指定されたアカウントの残高がBankAccountスーパークラスのコンストラクタに渡される
    val temporaryAccount = object : BankAccount(account.balance), Transaction {

        override val balance = account.balance + 500  // 一時的なボーナス

        // Transactionインターフェースのexecute()関数を実装
        override fun execute() {
            println("Executing special transaction. New balance is $balance.")
        }
    }
    // トランザクションを実行
    temporaryAccount.execute()
}
//sampleEnd
fun main() {
    // 初期残高1000でBankAccountを作成
    val myAccount = BankAccount(1000)
    // 作成されたアカウントに対して特別なトランザクションを実行
    specialTransaction(myAccount)
    // Executing special transaction. New balance is 1500.
}
```
{kotlin-runnable="true" id="object-expression-anonymous-object"}

### 匿名オブジェクトを戻り値および値の型として使用する {id="use-anonymous-objects-as-return-and-value-types"}

ローカルまたは[`private`](visibility-modifiers.md#packages)な関数やプロパティから匿名オブジェクトを返す場合、その匿名オブジェクトのすべてのメンバーには、その関数やプロパティを通じてアクセスできます。

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

これにより、特定のプロパティを持つ匿名オブジェクトを返すことができ、独立したクラスを作成することなくデータや振る舞いをカプセル化するシンプルな方法が提供されます。

匿名オブジェクトを返す関数またはプロパティが `public`、`protected`、または `internal` の可視性を持つ場合、その実際の型は次のようになります。

* 匿名オブジェクトに宣言されたスーパータイプがない場合は `Any`。
* 匿名オブジェクトに宣言されたスーパータイプが1つだけ存在する場合は、その宣言されたスーパータイプ。
* 複数のスーパータイプが宣言されている場合は、明示的に宣言された型。

これらのいずれの場合でも、匿名オブジェクト内に追加されたメンバーにはアクセスできません。オーバーライドされたメンバーは、関数またはプロパティの実際の型で宣言されている場合にアクセスできます。例：

```kotlin
//sampleStart
interface Notification {
    // NotificationインターフェースでnotifyUser()を宣言
    fun notifyUser()
}

interface DetailedNotification

class NotificationManager {
    // 戻り値の型はAny。messageプロパティにはアクセスできない。
    // 戻り値の型がAnyの場合、Anyクラスのメンバーにのみアクセスできる。
    fun getNotification() = object {
        val message: String = "General notification"
    }

    // 匿名オブジェクトが1つのインターフェースのみを実装しているため、戻り値の型はNotificationになる
    // notifyUser()関数はNotificationインターフェースの一部であるためアクセス可能
    // messageプロパティはNotificationインターフェースで宣言されていないためアクセスできない
    fun getEmailNotification() = object : Notification {
        override fun notifyUser() {
            println("Sending email notification")
        }
        val message: String = "You've got mail!"
    }

    // 戻り値の型はDetailedNotification。notifyUser()関数とmessageプロパティにはアクセスできない
    // DetailedNotificationインターフェースで宣言されたメンバーにのみアクセス可能
    fun getDetailedNotification(): DetailedNotification = object : Notification, DetailedNotification {
        override fun notifyUser() {
            println("Sending detailed notification")
        }
        val message: String = "Detailed message content"
    }
}
//sampleEnd
fun main() {
    // これは何も出力しない
    val notificationManager = NotificationManager()

    // 戻り値の型がAnyであるため、ここではmessageプロパティにアクセスできない
    // これは何も出力しない
    val notification = notificationManager.getNotification()

    // notifyUser()関数はアクセス可能
    // 戻り値の型がNotificationであるため、ここではmessageプロパティにアクセスできない
    val emailNotification = notificationManager.getEmailNotification()
    emailNotification.notifyUser()
    // Sending email notification

    // 戻り値の型がDetailedNotificationであるため、ここではnotifyUser()関数とmessageプロパティにアクセスできない
    // これは何も出力しない
    val detailedNotification = notificationManager.getDetailedNotification()
}
```
{kotlin-runnable="true" id="object-expression-object-override"}

### 匿名オブジェクトから変数へアクセスする {id="access-variables-from-anonymous-objects"}

オブジェクト式の本体内のコードは、それを囲むスコープの変数にアクセスできます。

```kotlin
import java.awt.event.MouseAdapter
import java.awt.event.MouseEvent

fun countClicks(window: JComponent) {
    var clickCount = 0
    var enterCount = 0

    // MouseAdapterはマウスイベント関数のデフォルト実装を提供する
    // マウスイベントを処理するMouseAdapterをシミュレート
    window.addMouseListener(object : MouseAdapter() {
        override fun mouseClicked(e: MouseEvent) {
            clickCount++
        }

        override fun mouseEntered(e: MouseEvent) {
            enterCount++
        }
    })
    // clickCountおよびenterCount変数はオブジェクト式内からアクセス可能
}
```

## オブジェクト宣言とオブジェクト式の動作の違い {id="behavior-difference-between-object-declarations-and-expressions"}

オブジェクト宣言とオブジェクト式の間には、初期化の動作に違いがあります。

* オブジェクト式は、それらが使用される場所で*即座に*実行（および初期化）されます。
* オブジェクト宣言は、初回アクセス時に*遅延（lazy）*初期化されます。
* コンパニオンオブジェクトは、Javaの静的初期化子（static initializer）のセマンティクスと一致し、対応するクラスがロード（解決）されたときに初期化されます。