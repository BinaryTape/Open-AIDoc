[//]: # (title: プロパティ)

Kotlin では、プロパティを使用することで、データへのアクセスや変更のための関数を書くことなくデータを保存および管理できます。
プロパティは、[クラス](classes.md)、[インターフェース](interfaces.md)、[オブジェクト](object-declarations.md)、[コンパニオンオブジェクト](object-declarations.md#companion-objects)のほか、
これらの構造の外側でもトップレベルプロパティとして使用できます。

すべてのプロパティには名前、型、そして自動的に生成されるゲッター（getter）と呼ばれる `get()` 関数があります。ゲッターを使用することで、
プロパティの値を読み取ることができます。プロパティが可変（ミュータブル）な場合は、セッター（setter）と呼ばれる `set()` 関数も持ち、
これによってプロパティの値を変更できます。

> ゲッターとセッターは_アクセサ（accessors）_と呼ばれます。
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

クラス、インターフェース、またはオブジェクトの内部でプロパティを宣言することもできます。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-access-properties"}

Kotlin では、コードの安全性と可読性を保つために、宣言時にプロパティを初期化することを推奨しています。ただし、
特別なケースでは[後から初期化する](#late-initialized-properties-and-variables)ことも可能です。

イニシャライザまたはゲッターの戻り値の型からコンパイラが型を推論できる場合、プロパティの型宣言は省略可能です。

```kotlin
var initialized = 1 // 推論される型は Int
var allByDefault    // エラー: プロパティは初期化されている必要があります。
```
{validate="false"}

## カスタムゲッターとセッター {id="custom-getters-and-setters"}

デフォルトでは、Kotlin は自動的にゲッターとセッターを生成します。バリデーション、フォーマット、他のプロパティに基づく計算など、
追加のロジックが必要な場合は、独自のカスタムアクセサを定義できます。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-custom-getter"}

ゲッターからコンパイラが型を推論できる場合は、型を省略できます。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-custom-setter"}

### 可視性の変更またはアノテーションの追加 {id="changing-visibility-or-adding-annotations"}

Kotlin では、デフォルトの実装を置き換えることなく、アクセサの可視性を変更したり[アノテーション](annotations.md)を追加したりできます。
これらの変更をボディ `{}` 内で行う必要はありません。

アクセサの可視性を変更するには、`get` または `set` キーワードの前に修飾子を置きます。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-private-setter"}

アクセサにアノテーションを付与するには、`get` または `set` キーワードの前にアノテーションを置きます。

```kotlin
// ゲッターに適用可能なアノテーションを定義
@Target(AnnotationTarget.PROPERTY_GETTER)
annotation class Inject

class Service {
    var dependency: String = "Default Service"
        // ゲッターにアノテーションを付与
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

この例では、[リフレクション](reflection.md)を使用して、ゲッターとセッターにどのアノテーションが存在するかを表示しています。

## バッキングフィールド {id="backing-fields"}

コンパイラは、値をメモリに保持する必要がある場合、プロパティ用のバッキングフィールド（Backing field）を自動的に生成します。

たとえば、デフォルトの `get()` および `set()` 関数を使用する場合、これらは格納された値を読み書きするため、コンパイラはバッキングフィールドを作成します。

```kotlin
var count = 0
```

バッキングフィールドには、[カスタム `get()` または `set()` 関数](#custom-getters-and-setters)内で `field` キーワードを使用してアクセスできます。
たとえば、ゲッターやセッターに追加のロジックを加えたり、プロパティが変更されたときに追加のアクションをトリガーしたりできます。

この例では、`score` プロパティの `set()` 関数内でバッキングフィールドを使用し、値の更新時にログイベントもトリガーされるようにしています。

```kotlin
class Scoreboard {
    var score: Int = 0
        set(value) {
            field = value
            // 値の更新時にログ出力を追加
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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-backing-field"}

すべてのプロパティにバッキングフィールドがデフォルトで作成されるわけではありません。必要ない場合があるためです。たとえば、`isEmpty` プロパティは、アクセスされるたびに `size` プロパティから値が計算されるため、バッキングフィールドを持ちません。

```kotlin
val isEmpty: Boolean
    get() = this.size == 0
```

### 明示的なバッキングフィールド {id="explicit-backing-fields"}

内部的にはプロパティを変更できるようにしたいが、外部には公開したくない API がある場合など、より柔軟な対応が必要になることがあります。そのようなケースでは、_明示的なバッキングフィールド（Explicit backing field）_を使用できます。

次の例では、`ShoppingCart` クラスにショッピングカート内のすべてのアイテムを表す `items` プロパティがあります。
このクラスは `items` プロパティを文字列の読み取り専用リストとして公開していますが、内部的には明示的なバッキングフィールドを持つミュータブルリストとしてデータを保持しています。

```kotlin
class ShoppingCart {
    // 明示的なバッキングフィールドを持つパブリックな読み取り専用ビュー
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

この例では、コンパイラは `mutableListOf()` の呼び出しからバッキングフィールドの型（`MutableList<String>`）を推論します。
バッキングフィールドの型を明示的に宣言することもできます。

```kotlin
val items: List<String>
    // 明示的な型を持つ明示的なバッキングフィールド
    field: MutableList<String> = mutableListOf()
```
{validate="false"}

`ShoppingCart` クラスの例では、コンパイラが `items` プロパティを `MutableList<String>` 型にスマートキャストするため、クラスは `add()` および `remove()` 関数を通じてカートにアイテムを追加および削除できます。クラスの外部では、コンパイラは公開されているプロパティの型である `List<String>` を使用するため、API の利用者は `items` リストの内容を読み取ることしかできません。

#### 制限事項 {id="limitations"}

明示的なバッキングフィールドを使用するには、プロパティとそのバッキングフィールド自体が特定のルールに従っている必要があります。プロパティが明示的なバッキングフィールドを持てるのは、以下を満たす場合のみです。

* カスタムゲッターを持たないこと。
* 読み取り専用（`val`）であること。
* `open` でないこと。
* [委譲プロパティ](delegated-properties.md)でないこと。
* [コンパイル時定数](#compile-time-constants)でないこと。

さらに、バッキングフィールドの型はプロパティの型のサブタイプであり、[`private` な可視性](visibility-modifiers.md)を持つ必要があります。

これらの制限は、代わりにバッキングプロパティを使用することで回避できます。

### バッキングプロパティ {id="backing-properties"}

明示的なバッキングフィールドがユースケースに合わない場合は、_バッキングプロパティ（Backing property）_と呼ばれるコーディングパターンを試すことができます。

たとえば、プロパティにカスタムゲッターが必要な場合です。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-backing-property-custom-getter"}

> Kotlin の[コーディング規約](coding-conventions.md#names-for-backing-properties)に従い、バッキングプロパティに名前を付ける際は先頭にアンダースコアを使用してください。
>
{style="tip"}

この例では、`UserDirectory` クラスにディレクトリ内のすべてのユーザーを一覧表示する読み取り専用の `users` プロパティがあります。
`_users` 変数は、実際のリストを保持するプライベートなバッキングプロパティです。パブリックな `users` プロパティのゲッターは、エントリーをソートしてから返します。

## コンパイル時定数 {id="compile-time-constants"}

読み取り専用プロパティの値がコンパイル時に判明している場合は、`const` 修飾子を使用して_コンパイル時定数（compile-time constant）_としてマークします。
コンパイル時定数はコンパイル時にインライン展開されるため、各参照はその実際の値に置き換えられます。ゲッターが呼び出されないため、より効率的にアクセスされます。

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

コンパイル時定数には引き続きバッキングフィールドが存在するため、[リフレクション](reflection.md)を使用して操作できます。

これらのプロパティはアノテーション内でも使用できます。

```kotlin
const val SUBSYSTEM_DEPRECATED: String = "This subsystem is deprecated"

@Deprecated(SUBSYSTEM_DEPRECATED) fun processLegacyOrders() { ... }
```

## 遅延初期化プロパティと変数 {id="late-initialized-properties-and-variables"}

通常、プロパティはコンストラクタで初期化する必要があります。
しかし、これが常に便利であるとは限りません。たとえば、依存性注入（DI）を介してプロパティを初期化したり、ユニットテストのセットアップメソッド内で初期化したりする場合があります。

このような状況に対応するには、プロパティに `lateinit` 修飾子を付けます。

```kotlin
public class OrderServiceTest {
    lateinit var orderService: OrderService

    @SetUp fun setup() {
        orderService = OrderService()
    }

    @Test fun processesOrderSuccessfully() {
        // null や初期化のチェックを行わずに
        // orderService を直接呼び出す
        orderService.processOrder()  
    }
}
```

`lateinit` 修飾子は、以下のように宣言された `var` プロパティで使用できます。

* トップレベルプロパティ
* ローカル変数
* クラス本体内のプロパティ

クラスプロパティの場合：

* プライマリコンストラクタでは宣言できません。
* カスタムゲッターまたはセッターを持っていてはなりません。

すべてのケースにおいて、プロパティまたは変数は null 非許容（non-nullable）でなければならず、[プリミティブ型](types-overview.md)であってはなりません。

`lateinit` プロパティを初期化前にアクセスすると、Kotlin はアクセスされた未初期化プロパティを特定する特定の例外をスローします。

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-lateinit-property" validate="false"}

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
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-lateinit-property-check-initialization"}

プロパティに対して `isInitialized` を使用できるのは、コード内でそのプロパティにすでにアクセス可能な場合のみです。そのプロパティは、同じクラス内、外側のクラス内、または同じファイル内のトップレベルプロパティとして宣言されている必要があります。

## プロパティのオーバーライド {id="overriding-properties"}

[プロパティのオーバーライド](inheritance.md#overriding-properties)を参照してください。

## 委譲プロパティ {id="delegated-properties"}

ロジックを再利用し、コードの重複を減らすために、プロパティの取得と設定の責務を別のオブジェクトに委譲することができます。

アクセサの振る舞いを委譲することで、プロパティのアクセサロジックが一元化され、再利用が容易になります。このアプローチは、次のような振る舞いを実装する場合に役立ちます。

* 値を遅延評価（lazy）で計算する。
* 指定されたキーによってマップから読み取る。
* データベースにアクセスする。
* プロパティがアクセスされたときにリスナーに通知する。

これらの一般的な振る舞いは、ライブラリで独自に実装することも、外部ライブラリが提供する既存のデリゲートを使用することもできます。
詳細については、[委譲プロパティ](delegated-properties.md)を参照してください。