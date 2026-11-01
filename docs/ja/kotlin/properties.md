[//]: # (title: プロパティ)

Kotlin では、プロパティを使用することで、データへのアクセスや変更のための関数を記述することなく、データを保存および管理できます。
プロパティは、[クラス](classes.md)、[インターフェース](interfaces.md)、[オブジェクト](object-declarations.md)、[コンパニオンオブジェクト](object-declarations.md#companion-objects)内だけでなく、これらの構造の外側でもトップレベルプロパティとして使用できます。

すべてのプロパティには名前、型、そしてゲッター（getter）と呼ばれる自動生成される `get()` 関数があります。ゲッターを使用してプロパティの値を読み取ることができます。プロパティが可変（mutable）である場合は、セッター（setter）と呼ばれる `set()` 関数も持ち、プロパティの値を変更できます。

> ゲッターとセッターは*アクセサ（accessor）*と呼ばれます。
> 
{style="tip"}

## プロパティの宣言 {id="declaring-properties"}

プロパティには、可変（`var`）または読み取り専用（`val`）があります。
`.kt` ファイル内でトップレベルプロパティとして宣言できます。トップレベルプロパティは、パッケージに属するグローバル変数のようなものと考えることができます。

```kotlin
// File: Constants.kt
package my.app

val pi = 3.14159
var counter = 0
```

また、クラス、インターフェース、またはオブジェクトの内部でプロパティを宣言することもできます。

```kotlin
// プロパティを持つクラス
class Address {
    var name: String = "Holmes, Sherlock"
    var street: String = "Baker"
    var city: String = "London"
}

// プロパティを持つインターフェース
interface ContactInfo {
    val email: String
}

// プロパティを持つオブジェクト
object Company {
    var name: String = "Detective Inc."
    val country: String = "UK"
}

// インターフェースを実装するクラス
class PersonContact : ContactInfo {
    override val email: String = "sherlock@example.com"
}
```

プロパティを使用するには、その名前で参照します。

```kotlin
class Address {
    var name: String = "Holmes, Sherlock"
    var street: String = "Baker"
    var city: String = "London"
}

interface ContactInfo {
    val email: String
}

object Company {
    var name: String = "Detective Inc."
    val country: String = "UK"
}

class PersonContact : ContactInfo {
    override val email: String = "sherlock@example.com"
}

//sampleStart
fun copyAddress(address: Address): Address {
    val result = Address()
    // result インスタンスのプロパティにアクセス
    result.name = address.name
    result.street = address.street
    result.city = address.city
    return result
}

fun main() {
    val sherlockAddress = Address()
    val copy = copyAddress(sherlockAddress)
    // copy インスタンスのプロパティにアクセス
    println("Copied address: ${copy.name}, ${copy.street}, ${copy.city}")
    // Copied address: Holmes, Sherlock, Baker, London

    // Company オブジェクトのプロパティにアクセス
    println("Company: ${Company.name} in ${Company.country}")
    // Company: Detective Inc. in UK
    
    val contact = PersonContact()
    // contact インスタンスのプロパティにアクセス
    println("Email: ${contact.email}")
    // Email: sherlock@email.com
}
//sampleEnd
```
{kotlin-runnable="true" id="kotlin-access-properties"}

Kotlin では、コードの安全性と可読性を保つために、プロパティを宣言時に初期化することを推奨しています。ただし、特別なケースでは[後から初期化](#late-initialized-properties-and-variables)することもできます。

コンパイラが初期化子やゲッターの戻り値の型から型を推論できる場合、プロパティの型の宣言は省略可能です。

```kotlin
var initialized = 1 // 推論される型は Int
var allByDefault    // エラー: Property must be initialized.
```
{validate="false"}

## カスタムゲッターとセッター {id="custom-getters-and-setters"}

デフォルトでは、Kotlin は自動的にゲッターとセッターを生成します。バリデーション、フォーマット、他のプロパティに基づいた計算などの追加ロジックが必要な場合は、独自のカスタムアクセサを定義できます。

カスタムゲッターは、プロパティにアクセスされるたびに実行されます。

```kotlin
//sampleStart
class Rectangle(val width: Int, val height: Int) {
    val area: Int
        get() = this.width * this.height
}
//sampleEnd
fun main() {
    val rectangle = Rectangle(3, 4)
    println("Width=${rectangle.width}, height=${rectangle.height}, area=${rectangle.area}")
}
```
{kotlin-runnable="true" id="kotlin-custom-getter"}

コンパイラがゲッターから型を推論できる場合は、型を省略できます。

```kotlin
val area get() = this.width * this.height
```

カスタムセッターは、初期化時を除き、プロパティに値を代入するたびに実行されます。
慣例としてセッターのパラメータ名は `value` ですが、別の名前を選択することもできます。

```kotlin
class Point(var x: Int, var y: Int) {
    var coordinates: String
        get() = "$x,$y"
        set(value) {
            val parts = value.split(",")
            x = parts[0].toInt()
            y = parts[1].toInt()
        }
}

fun main() {
    val location = Point(1, 2)
    println(location.coordinates) 
    // 1,2

    location.coordinates = "10,20"
    println("${location.x}, ${location.y}") 
    // 10, 20
}
```
{kotlin-runnable="true" id="kotlin-custom-setter"}

### 可視性の変更またはアノテーションの追加 {id="changing-visibility-or-adding-annotations"}

Kotlin では、デフォルトの実装を置き換えることなく、アクセサの可視性を変更したり[アノテーション](annotations.md)を追加したりできます。
これらの変更をボディ `{}` 内で行う必要はありません。

アクセサの可視性を変更するには、`get` または `set` キーワードの前に修飾子を記述します。

```kotlin
class BankAccount(initialBalance: Int) {
    var balance: Int = initialBalance
        // クラス内からのみ残高を変更可能
        private set 

    fun deposit(amount: Int) {
        if (amount > 0) balance += amount
    }

    fun withdraw(amount: Int) {
        if (amount > 0 && amount <= balance) balance -= amount
    }
}

fun main() {
    val account = BankAccount(100)
    println("Initial balance: ${account.balance}") 
    // 100

    account.deposit(50)
    println("After deposit: ${account.balance}") 
    // 150

    account.withdraw(70)
    println("After withdrawal: ${account.balance}") 
    // 80

    // account.balance = 1000  
    // エラー: セッターが private であるため代入できません
}
```
{kotlin-runnable="true" id="kotlin-private-setter"}

アクセサにアノテーションを付けるには、`get` または `set` キーワードの前にアノテーションを記述します。

```kotlin
// ゲッターに適用可能なアノテーションを定義
@Target(AnnotationTarget.PROPERTY_GETTER)
annotation class Inject

class Service {
    var dependency: String = "Default Service"
        // ゲッターにアノテーションを付加
        @Inject get 
}

fun main() {
    val service = Service()
    println(service.dependency)
    // Default service
    println(service::dependency.getter.annotations)
    // [@Inject()]
    println(service::dependency.setter.annotations)
    // []
}
```
{validate="false"}

この例では、[リフレクション](reflection.md)を使用してゲッターとセッターにどのアノテーションが存在するかを示しています。

## バッキングフィールド {id="backing-fields"}

メモリに値を保存する必要がある場合、コンパイラはプロパティに対して自動的にバッキングフィールド（Backing field）を生成します。

例えば、デフォルトの `get()` および `set()` 関数を使用する場合、それらは保存された値を読み書きするため、コンパイラはバッキングフィールドを作成します。

```kotlin
var count = 0
```

バッキングフィールドには、[カスタム `get()` または `set()` 関数](#custom-getters-and-setters)内で `field` キーワードを使用してアクセスできます。
例えば、ゲッターやセッターに追加のロジックを加えたり、プロパティが変更されたときに追加入力をトリガーしたりできます。

次の例では、`score` プロパティが `set()` 関数内でバッキングフィールドを使用しており、値を更新するとログ出力イベントもトリガーされます。

```kotlin
class Scoreboard {
    var score: Int = 0
        set(value) {
            field = value
            // 値の更新時にロギングを追加
            println("Score updated to $field")
        }
}

fun main() {
    val board = Scoreboard()
    board.score = 10  
    // Score updated to 10
    board.score = 20  
    // Score updated to 20
}
```
{kotlin-runnable="true" id="kotlin-backing-field"}

すべてのプロパティにバッキングフィールドがデフォルトで作成されるわけではありません。必要ない場合があるためです。例えば、`isEmpty` プロパティは、アクセスされるたびに `size` プロパティから値が計算されるため、バッキングフィールドを持ちません。

```kotlin
val isEmpty: Boolean
    get() = this.size == 0
```

### 明示的なバッキングフィールド {id="explicit-backing-fields"}

より高い柔軟性が必要になる場合もあります。例えば、内部的にはプロパティを変更可能にしつつ、外部に対しては変更できないようにしたい API があるとします。そのような場合は、*明示的なバッキングフィールド（explicit backing field）*を使用できます。

次の例では、`ShoppingCart` クラスにショッピングカート内のすべてのアイテムを表す `items` プロパティがあります。このクラスは `items` プロパティを読み取り専用の文字列リストとして公開しますが、内部的には明示的なバッキングフィールドを持つ可変リストにデータを保存します。

```kotlin
class ShoppingCart {
    // 明示的なバッキングフィールドを持つ公開された読み取り専用ビュー
    val items: List<String>
        field = mutableListOf()
    
    fun addItem(item: String) {
        items.add(item)
    }

    fun removeItem(item: String) {
        items.remove(item)
    }
}

fun main() {
    val cart = ShoppingCart()
    cart.addItem("Apple")
    cart.addItem("Banana")

    println(cart.items) 
    // [Apple, Banana]
    
    cart.removeItem("Apple")
    println(cart.items) 
    // [Banana]
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.4" id="kotlin-explicit-backing-field"}

この例では、コンパイラは `mutableListOf()` の呼び出しからバッキングフィールドの型を `MutableList<String>` と推論します。バッキングフィールドの型を明示的に宣言することもできます。

```kotlin
val items: List<String>
    // 明示的な型を持つ明示的なバッキングフィールド
    field: MutableList<String> = mutableListOf()
```
{validate="false"}

この `ShoppingCart` クラスの例では、コンパイラが `items` プロパティを `MutableList<String>` 型にスマートキャストするため、クラスは `add()` および `remove()` 関数を通じてカートにアイテムを追加および削除できます。クラスの外部では、コンパイラは公開されているプロパティの型である `List<String>` を使用するため、API の利用者は `items` リストの内容を読み取ることしかできません。

#### 制限事項 {id="limitations"}

明示的なバッキングフィールドを使用するには、そのプロパティおよびバッキングフィールド自体が特定のルールに従う必要があります。プロパティが明示的なバッキングフィールドを持てるのは、以下の条件を満たす場合のみです。

* カスタムゲッターを持たない。
* 読み取り専用（`val`）である。
* `open` ではない。
* [委譲プロパティ](delegated-properties.md)ではない。
* [コンパイル時定数](#compile-time-constants)ではない。

さらに、バッキングフィールドの型はプロパティの型のサブタイプであり、[`private` な可視性](visibility-modifiers.md)を持っていなければなりません。

これらの制限は、代わりにバッキングプロパティを使用することで回避できます。

### バッキングプロパティ {id="backing-properties"}

明示的なバッキングフィールドがユースケースに合わない場合は、*バッキングプロパティ（backing property）*と呼ばれるコーディングパターンを試すことができます。

例えば、プロパティにカスタムゲッターが必要な場合です。

```kotlin
class UserDirectory {
    private val _users = mutableListOf(
        "sarah",
        "mike",
        "emma"
    )

    val users: List<String>
        get() = _users.sorted()

    fun addUser(username: String) {
        _users.add(username)
    }
}

fun main() {
    val directory = UserDirectory()

    directory.addUser("alex")
    println(directory.users)
    // [alex, emma, mike, sarah]
}
```
{kotlin-runnable="true" id="kotlin-backing-property-custom-getter"}

> Kotlin の[コーディング規約](coding-conventions.md#names-for-backing-properties)に従い、バッキングプロパティの名前には先頭にアンダースコアを使用してください。
>
{style="tip"}

この例では、`UserDirectory` クラスにはディレクトリ内のすべてのユーザーをリストする読み取り専用の `users` プロパティがあります。`_users` 変数は、実際のリストを保持する private なバッキングプロパティです。公開されている `users` プロパティのゲッターは、エントリをソートしてから返します。

## コンパイル時定数 {id="compile-time-constants"}

読み取り専用プロパティの値がコンパイル時に判明している場合は、`const` 修飾子を使用して*コンパイル時定数（compile-time constant）*としてマークします。
コンパイル時定数はコンパイル時にインライン化されるため、各参照はその実際の値に置き換えられます。ゲッターが呼び出されないため、より効率的にアクセスされます。

```kotlin
// File: AppConfig.kt
package com.example

// コンパイル時定数
const val MAX_LOGIN_ATTEMPTS = 3
```

コンパイル時定数は以下の要件を満たす必要があります。

* トップレベルプロパティであるか、[`object` 宣言](object-declarations.md#object-declarations-overview)または[コンパニオンオブジェクト](object-declarations.md#companion-objects)のメンバーであること。
* `String` 型または[プリミティブ型](types-overview.md)の値で初期化されていること。
* カスタムゲッターを持たないこと。

コンパイル時定数は依然としてバッキングフィールドを持つため、[リフレクション](reflection.md)を使用して操作できます。

これらのプロパティはアノテーション内でも使用できます。

```kotlin
const val SUBSYSTEM_DEPRECATED: String = "This subsystem is deprecated"

@Deprecated(SUBSYSTEM_DEPRECATED) fun processLegacyOrders() { ... }
```

## 遅延初期化プロパティと変数 {id="late-initialized-properties-and-variables"}

通常、プロパティはコンストラクタで初期化する必要があります。
しかし、これが常に都合が良いとは限りません。例えば、依存性注入（DI）を介してプロパティを初期化したり、ユニットテストのセットアップメソッド内で初期化したりすることがあります。

このような状況に対処するには、プロパティを `lateinit` 修飾子でマークします。

```kotlin
public class OrderServiceTest {
    lateinit var orderService: OrderService

    @SetUp fun setup() {
        orderService = OrderService()
    }

    @Test fun processesOrderSuccessfully() {
        // null チェックや初期化チェックを行わずに
        // orderService を直接呼び出す
        orderService.processOrder()  
    }
}
```

`lateinit` 修飾子は、以下のように宣言された `var` プロパティで使用できます。

* トップレベルプロパティ
* ローカル変数
* クラスのボディ内のプロパティ

クラスプロパティの場合：

* プライマリコンストラクタでは宣言できません。
* カスタムゲッターやセッターを持っていてはいけません。

いずれの場合も、プロパティまたは変数は null 非許容（non-nullable）でなければならず、[プリミティブ型](types-overview.md)であってはなりません。

初期化する前に `lateinit` プロパティにアクセスした場合、Kotlin はアクセスされた未初期化プロパティを特定する特定の例外をスローします。

```kotlin
class ReportGenerator {
    lateinit var report: String

    fun printReport() {
        // 初期化前にアクセスされたため
        // 例外をスローする
        println(report)
    }
}

fun main() {
    val generator = ReportGenerator()
    generator.printReport()
    // Exception in thread "main" kotlin.UninitializedPropertyAccessException: lateinit property report has not been initialized
}
```
{kotlin-runnable="true" id="kotlin-lateinit-property" validate="false"}

`lateinit var` がすでに初期化されているかどうかを確認するには、その[プロパティへの参照](lambdas.md#property-references)に対して [`isInitialized`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/is-initialized.html) プロパティを使用します。

```kotlin
class WeatherStation {
    lateinit var latestReading: String

    fun printReading() {
        // プロパティが初期化されているか確認
        if (this::latestReading.isInitialized) {
            println("Latest reading: $latestReading")
        } else {
            println("No reading available")
        }
    }
}

fun main() {
    val station = WeatherStation()

    station.printReading()
    // No reading available
    station.latestReading = "22°C, sunny"
    station.printReading()
    // Latest reading: 22°C, sunny
}
```
{kotlin-runnable="true" id="kotlin-lateinit-property-check-initialization"}

`isInitialized` をプロパティに対して使用できるのは、コード内でそのプロパティにすでにアクセスできる場合のみです。そのプロパティは、同じクラス内、外側のクラス内、または同じファイル内のトップレベルプロパティとして宣言されている必要があります。

## プロパティのオーバーライド {id="overriding-properties"}

[プロパティのオーバーライド](inheritance.md#overriding-properties)を参照してください。

## 委譲プロパティ {id="delegated-properties"}

ロジックを再利用しコードの重複を減らすために、プロパティの取得および設定の責務を別のオブジェクトに委譲することができます。

アクセサの振る舞いを委譲することで、プロパティのアクセサロジックが一箇所に集約され、再利用が容易になります。このアプローチは、以下のような振る舞いを実装する際に役立ちます。

* 値を遅延（lazy）計算する。
* 指定されたキーによってマップから読み取る。
* データベースにアクセスする。
* プロパティがアクセスされたときにリスナーに通知する。

これらの一般的な振る舞いは、ライブラリ内で自身で実装することも、外部ライブラリが提供する既存のデリゲートを使用することもできます。
詳細については、[委譲プロパティ](delegated-properties.md)を参照してください。