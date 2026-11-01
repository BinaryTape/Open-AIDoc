[//]: # (title: 拡張（Extensions）)

Kotlin の _拡張（extensions）_ を使用すると、継承を行ったり _Decorator_ のようなデザインパターンを使ったりすることなく、クラスやインターフェースを新しい機能で拡張できます。直接変更できないサードパーティ製ライブラリを扱う場合に特に便利です。作成した拡張は、まるで元のクラスやインターフェースのメンバーであるかのように呼び出すことができます。

最も一般的な拡張の形式は、[_拡張関数（extension functions）_](#extension-functions) と [_拡張プロパティ（extension properties）_](#extension-properties) です。

重要な点として、拡張は拡張対象のクラスやインターフェースを変更するわけではありません。拡張を定義しても、新しいメンバーが追加されるわけではありません。同じ構文を使って、新しい関数を呼び出し可能にしたり、新しいプロパティにアクセス可能にしたりするだけです。

## レシーバー {id="receivers"}

拡張は常にレシーバーに対して呼び出されます。レシーバーは、拡張対象のクラスまたはインターフェースと同じ型を持つ必要があります。
拡張を使用するには、レシーバーの後に `.` と関数名またはプロパティ名を続けます。

例えば、標準ライブラリの [`.appendLine()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.text/append-line.html) 拡張関数は `StringBuilder` クラスを拡張しています。
したがって、この場合レシーバーは `StringBuilder` のインスタンスであり、_レシーバー型（receiver type）_ は `StringBuilder` です。

```kotlin
fun main() { 
//sampleStart
    // builder は StringBuilder のインスタンス
    val builder = StringBuilder()
        // builder に対して .appendLine() 拡張関数を呼び出す
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

## 拡張関数 {id="extension-functions"}

独自の拡張関数を作成する前に、求めている機能が Kotlin の[標準ライブラリ（standard library）](https://kotlinlang.org/api/core/kotlin-stdlib/)ですでに提供されていないか確認してください。
標準ライブラリには、以下のような便利な拡張関数が数多く用意されています。

* コレクションの操作：[`.map()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/map.html)、[`.filter()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/filter.html)、[`.reduce()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/reduce.html)、[`.fold()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/fold.html)、[`.groupBy()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/group-by.html)
* 文字列への変換：[`.joinToString()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/join-to-string.html)
* null 値の処理：[`.filterNotNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/filter-not-null.html)

独自の拡張関数を作成するには、関数名の前にレシーバー型と `.` を付けます。この例では、`.truncate()` 関数が `String` クラスを拡張しているため、レシーバー型は `String` です。

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

`.truncate()` 関数は、それが呼び出された任意の文字列を `maxLength` 引数の数値で切り詰め、省略記号 `...` を付加します。
文字列が `maxLength` より短い場合、関数は元の文字列を返します。

次の例では、`.displayInfo()` 関数が `User` インターフェースを拡張しています。

```kotlin
interface User {
    val name: String
    val email: String
}

fun User.displayInfo(): String = "User(name=$name, email=$email)"

// User インターフェースを継承し、そのプロパティを実装する
class RegularUser(override val name: String, override val email: String) : User

fun main() {
    val user = RegularUser("Alice", "alice@example.com")
    println(user.displayInfo()) 
    // User(name=Alice, email=alice@example.com)
}
```
{kotlin-runnable="true" id="kotlin-extension-function-interface"}

`.displayInfo()` 関数は、`RegularUser` インスタンスの `name` と `email` を含む文字列を返します。このようにインターフェースに対して拡張を定義すると、そのインターフェースを実装するすべての型に対して機能を一度に追加したい場合に便利です。

次の例では、`.mostVoted()` 関数が `Map<String, Int>` クラスを拡張しています。

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

`.mostVoted()` 関数は呼び出し元のマップのキーと値のペアを反復処理し、[`maxByOrNull()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/max-by-or-null.html) 関数を使用して最も大きな値を持つペアのキーを返します。マップが空の場合、`maxByOrNull()` 関数は `null` を返します。`mostVoted()` 関数は安全呼び出し `?.` を使用して、`maxByOrNull()` 関数が null 以外の値を返した場合にのみ `key` プロパティにアクセスします。

### ジェネリック拡張関数 {id="generic-extension-functions"}

ジェネリックな拡張関数を作成するには、関数名の前にジェネリック型パラメータを宣言し、レシーバー型の式の中で使用できるようにします。この例では、`.endpoints()` 関数が `T` が任意の型になり得る `List<T>` を拡張しています。

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

`.endpoints()` 関数は、それが呼び出されたリストの最初と最後の要素を含むペアを返します。
関数本体内では `first()` 関数と `last()` 関数を呼び出し、中置関数 `to` を使ってそれらの戻り値を `Pair` にまとめます。

ジェネリクスの詳細については、[ジェネリック関数](generics.md)を参照してください。

### null 許容レシーバー {id="nullable-receivers"}

null 許容レシーバー型（nullable receiver type）を持つ拡張関数を定義することもできます。これにより、変数の値が null であってもその関数を呼び出すことができます。レシーバーが `null` の場合、`this` も `null` になります。関数内では null 許容性を適切に処理するようにしてください。例えば、関数本体内で `this == null` チェックを使用したり、[安全呼び出し `?.`](null-safety.md#safe-call-operator) や [Elvis 演算子 `?:`](null-safety.md#elvis-operator) を使用したりします。

この例では、チェックがすでに拡張関数の内部で行われているため、`null` チェックなしで `.toString()` 関数を呼び出すことができます。

```kotlin
fun main() {
    //sampleStart
    // null 許容 Any に対する拡張関数
    fun Any?.toString(): String {
        if (this == null) return "null"
        // null チェックの後、`this` はスマートキャストされて非 null の Any になる
        // そのため、この呼び出しは通常の toString() 関数へと解決される
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

### 拡張関数かメンバー関数か？ {id="extension-or-member-functions"}

拡張関数とメンバー関数の呼び出し構文は同じですが、コンパイラはどちらを使用するかをどのようにして知るのでしょうか？
拡張関数は _静的（statically）_ にディスパッチされます。つまり、コンパイラはコンパイル時のレシーバー型に基づいて呼び出すべき関数を決定します。例えば：

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

この例では、パラメータ `shape` が `Shape` 型として宣言されているため、コンパイラは `Shape.getName()` 拡張関数を呼び出します。拡張関数は静的に解決されるため、コンパイラは実際のインスタンスではなく、宣言された型に基づいて関数を選択します。

したがって、この例で `Rectangle` インスタンスを渡していても、変数が `Shape` 型として宣言されているため、`.getName()` 関数は `Shape.getName()` に解決されます。

クラスにメンバー関数があり、同じレシーバー型、同じ名前、互換性のある引数を持つ拡張関数が存在する場合、メンバー関数が優先されます。例えば：

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

ただし、拡張関数は、名前が同じでもシグネチャが _異なる_ メンバー関数をオーバーロードすることができます。

```kotlin
fun main() {
//sampleStart
    class Example {
        fun printFunctionType() { println("Member function") }
    }
    
    // 同じ名前だがシグネチャが異なる
    fun Example.printFunctionType(index: Int) { println("Extension function #$index") }
    
    Example().printFunctionType(1)
    // Extension function #1
//sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-extension-function-member-function-overload"}

この例では、`.printFunctionType()` 関数に `Int` が渡されているため、シグネチャが一致する拡張関数がコンパイラによって選択されます。コンパイラは引数を取らないメンバー関数を無視します。

### 匿名拡張関数 {id="anonymous-extension-functions"}

拡張関数に名前を付けずに定義することもできます。これは、グローバル名前空間を乱雑にしたくない場合や、拡張の振る舞いをパラメータとして渡す必要がある場合に便利です。

例えば、データクラスを、名前を付けずに送料を計算する使い捨ての関数で拡張したいとします。

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

拡張の振る舞いをパラメータとして渡すには、型注釈を付けた [ラムダ式](lambdas.md#lambda-expression-syntax) を使用します。
例えば、名前付き関数を定義せずに、数値が特定の範囲内にあるかどうかを確認したいとします。

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

この例では、`isInRange` 変数は `Int.(min: Int, max: Int) -> Boolean` 型の関数を保持しています。この型は、`min` と `max` のパラメータを取り、`Boolean` を返す `Int` クラスの拡張関数です。

ラムダ本体 `{ min, max -> this in min..max }` は、関数が呼び出された `Int` 値が `min` パラメータと `max` パラメータの間の範囲内にあるかどうかをチェックします。チェックが成功した場合、ラムダは `true` を返します。

詳細については、[ラムダ式と匿名関数](lambdas.md) を参照してください。

## 拡張プロパティ {id="extension-properties"}

Kotlin は拡張プロパティ（extension properties）もサポートしています。これは、対象のクラスを乱雑にすることなく、データ変換を実行したり UI 表示ヘルパーを作成したりするのに便利です。

拡張プロパティを作成するには、拡張したいクラスの名前を書き、その後に `.` とプロパティ名を記述します。

例えば、名（first name）と姓（last name）を持つユーザーを表すデータクラスがあり、アクセスされたときにメールスタイルのユーザー名を返すプロパティを作成したいとします。コードは次のようになります。

```kotlin
data class User(val firstName: String, val lastName: String)

// ユーザー名スタイルのメールハンドルを取得する拡張プロパティ
val User.emailUsername: String
    get() = "${firstName.lowercase()}.${lastName.lowercase()}"

fun main() {
    val user = User("Mickey", "Mouse")
    // 拡張プロパティを呼び出す
    println("Generated email username: ${user.emailUsername}")
    // Generated email username: mickey.mouse
}
```
{kotlin-runnable="true" id="kotlin-extension-function-property"}

拡張は実際にはクラスにメンバーを追加しないため、拡張プロパティが [バッキングフィールド（backing field）](properties.md#backing-fields) を持つ効率的な方法はありません。そのため、拡張プロパティでは初期化子（initializer）が許可されていません。拡張プロパティの動作は、ゲッターとセッターを明示的に指定することによってのみ定義できます。例えば：

```kotlin
data class House(val streetName: String)

// ゲッターとセッターがないためコンパイルできない
// var House.number = 1
// Error: Initializers are not allowed for extension properties

// 正常にコンパイルできる
val houseNumbers = mutableMapOf<House, Int>()
var House.number: Int
    get() = houseNumbers[this] ?: 1
    set(value) {
        println("Setting house number for ${this.streetName} to $value")
        houseNumbers[this] = value
    }

fun main() {
    val house = House("Maple Street")

    // デフォルト値を表示
    println("Default number: ${house.number} ${house.streetName}") 
    // Default number: 1 Maple Street
    
    house.number = 99
    // Setting house number for Maple Street to 99

    // 更新された数値を表示
    println("Updated number: ${house.number} ${house.streetName}") 
    // Updated number: 99 Maple Street
}
```
{kotlin-runnable="true" id="kotlin-extension-function-property-error"}

この例では、ゲッターは [Elvis 演算子](null-safety.md#elvis-operator) を使用して、`houseNumbers` マップに存在する場合は番地を返し、存在しない場合は `1` を返します。ゲッターとセッターの記述方法について詳しくは、[カスタムゲッターとセッター](properties.md#custom-getters-and-setters) を参照してください。

## コンパニオンオブジェクトの拡張 {id="companion-object-extensions"}

クラスが [コンパニオンオブジェクト（companion object）](object-declarations.md#companion-objects) を定義している場合、そのコンパニオンオブジェクトに対する拡張関数や拡張プロパティを定義することもできます。コンパニオンオブジェクトの通常のメンバーと同様に、クラス名のみを修飾子として使用して呼び出すことができます。コンパイラはコンパニオンオブジェクトにデフォルトで `Companion` という名前を付けます。

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

## メンバーとしての拡張の宣言 {id="declaring-extensions-as-members"}

あるクラスの中で、別のクラスのための拡張を宣言することができます。このような拡張には、複数の _暗黙のレシーバー（implicit receivers）_ が存在します。
暗黙のレシーバーとは、[`this`](this-expressions.md#qualified-this) で修飾することなくメンバーにアクセスできるオブジェクトのことです。

* 拡張を宣言しているクラスは _ディスパッチレシーバー（dispatch receiver）_ です。
* 拡張関数のレシーバー型は _拡張レシーバー（extension receiver）_ です。

`Connection` クラスが `Host` クラス用の拡張関数 `printConnectionString()` を持っている次の例を考えてみましょう。

```kotlin
class Host(val hostname: String) {
    fun printHostname() { print(hostname) }
}

class Connection(val host: Host, val port: Int) {
    fun printPort() { print(port) }

    // Host が拡張レシーバー
    fun Host.printConnectionString() {
        // Host.printHostname() を呼び出す
        printHostname() 
        print(":")
        // Connection.printPort() を呼び出す
        // Connection がディスパッチレシーバー
        printPort()
    }

    fun connect() {
        /*...*/
        // 拡張関数を呼び出す
        host.printConnectionString() 
    }
}

fun main() {
    Connection(Host("kotl.in"), 443).connect()
    // kotl.in:443
    
    // Connection の外部では拡張関数が利用できないため、エラーになる
    // Host("kotl.in").printConnectionString()
    // Unresolved reference 'printConnectionString'.
}
```
{kotlin-runnable="true" id="kotlin-extension-function-members"}

この例では、`Connection` クラスの内部で `printConnectionString()` 関数を宣言しているため、`Connection` クラスがディスパッチレシーバーになります。拡張関数のレシーバー型は `Host` クラスであるため、`Host` クラスが拡張レシーバーになります。

ディスパッチレシーバーと拡張レシーバーに同じ名前のメンバーがある場合は、拡張レシーバーのメンバーが優先されます。ディスパッチレシーバーに明示的にアクセスするには、[修飾された `this` 構文](this-expressions.md#qualified-this) を使用します。

```kotlin
class Connection {
    fun Host.getConnectionString() {
        // Host.toString() を呼び出す
        toString()
        // Connection.toString() を呼び出す
        this@Connection.toString()
    }
}
```

### メンバー拡張のオーバーライド {id="overriding-member-extensions"}

メンバー拡張を `open` として宣言し、サブクラスでオーバーライドすることができます。これは、サブクラスごとに拡張の動作をカスタマイズしたい場合に役立ちます。コンパイラは、レシーバー型ごとに異なる処理を行います。

| レシーバー型 | 解決されるタイミング | ディスパッチの種類 |
|---|---|---|
| ディスパッチレシーバー | 実行時 | 仮想（Virtual） |
| 拡張レシーバー | コンパイル時 | 静的（Static） |

`User` クラスが `open` であり、`Admin` クラスがそれを継承している次の例を考えてみましょう。`NotificationSender` クラスは `User` クラスと `Admin` クラスの両方に対して `sendNotification()` 拡張関数を定義しており、`SpecialNotificationSender` クラスがそれらをオーバーライドしています。

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
    // ディスパッチレシーバーは NotificationSender
    // 拡張レシーバーは User
    // NotificationSender 内の User.sendNotification() に解決される
    NotificationSender().notify(User())
    // Sending user notification from normal sender
    
    // ディスパッチレシーバーは SpecialNotificationSender
    // 拡張レシーバーは User
    // SpecialNotificationSender 内の User.sendNotification() に解決される
    SpecialNotificationSender().notify(User())
    // Sending user notification from special sender 
    
    // ディスパッチレシーバーは SpecialNotificationSender
    // 拡張レシーバーは Admin ではなく User
    // notify() 関数は user を User 型として宣言している
    // SpecialNotificationSender 内の User.sendNotification() に静的に解決される
    SpecialNotificationSender().notify(Admin())
    // Sending user notification from special sender 
}
```
{kotlin-runnable="true" id="kotlin-extension-open"}

ディスパッチレシーバーは仮想ディスパッチを使用して実行時に解決されるため、`main()` 関数内の動作を直感的に追うことができます。予期しない動作に見えるかもしれないのは、`Admin` インスタンスに対して `notify()` 関数を呼び出した場合でも、コンパイラが拡張レシーバーを静的に解決するため、宣言された型である `user: User` に基づいて拡張が選択されるという点です。

## 拡張と可視性修飾子 {id="extensions-and-visibility-modifiers"}

拡張には、同じスコープで宣言された通常の関数と同じ [可視性修飾子（visibility modifiers）](visibility-modifiers.md) が適用されます（他のクラスのメンバーとして宣言された拡張も含まれます）。

例えば、ファイルのトップレベルで宣言された拡張は、同じファイル内の他の `private` トップレベル宣言にアクセスできます。

```kotlin
// ファイル: StringUtils.kt

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

また、レシーバー型の外部で拡張が宣言されている場合、そのレシーバーの `private` または `protected` メンバーにはアクセスできません。

```kotlin
class User(private val password: String) {
    fun isLoggedIn(): Boolean = true
    fun passwordLength(): Int = password.length
}

// クラスの外部で宣言された拡張
fun User.isSecure(): Boolean {
    // password は private のためアクセスできない:
    // return password.length >= 8

    // 代わりに公開（public）メンバーを利用する:
    return passwordLength() >= 8 && isLoggedIn()
}

fun main() {
    val user = User("supersecret")
    println("Is user secure: ${user.isSecure()}") 
    // Is user secure: true
}
```
{kotlin-runnable="true" id="kotlin-extension-visibility-outside-receiver"}

拡張に `internal` のマークが付けられている場合、その拡張はその [モジュール](visibility-modifiers.md#modules) 内からのみアクセス可能です。

```kotlin
// ネットワーキングモジュール
// JsonParser.kt
internal fun String.parseJson(): Map<String, Any> {
    return mapOf("fakeKey" to "fakeValue")
}
```

## 拡張のスコープ {id="scope-of-extensions"}

ほとんどの場合、拡張はパッケージ直下のトップレベルで定義します。

```kotlin
package org.example.declarations

fun List<String>.getLongestString() { /*...*/}
```

宣言されているパッケージの外部で拡張を使用するには、呼び出し側でインポートします。

```kotlin
package org.example.usage

import org.example.declarations.getLongestString

fun main() {
    val list = listOf("red", "green", "blue")
    list.getLongestString()
}
```

詳細については、[インポート](packages.md#imports) を参照してください。