[//]: # (title: スコープ関数)

<no-index/>

この章では、拡張関数の理解を深め、よりイディオマティック（Kotlinらしい）なコードを書くためのスコープ関数の使い方を学びます。

## スコープ関数 {id="scope-functions"}

プログラミングにおいて、スコープとは変数やオブジェクトが認識される範囲のことです。最も一般的に言及されるスコープは、グローバルスコープとローカルスコープです。

* **グローバルスコープ** – プログラム内のどこからでもアクセスできる変数やオブジェクト。
* **ローカルスコープ** – 定義されたブロックまたは関数内でのみアクセスできる変数やオブジェクト。

Kotlinには、オブジェクトの周りに一時的なスコープを作成し、何らかのコードを実行できるようにするスコープ関数もあります。

スコープ関数を使用すると、一時的なスコープ内でオブジェクトの名前を直接参照する必要がなくなるため、コードをより簡潔に書くことができます。スコープ関数によって、キーワード `this` 経由で参照するか、キーワード `it` 経由で引数として使用することでオブジェクトにアクセスできます。

Kotlinには、`let`、`apply`、`run`、`also`、`with` の計5つのスコープ関数があります。

各スコープ関数はラムダ式を受け取り、オブジェクト自体またはラムダ式の結果のいずれかを返します。このツアーでは、各スコープ関数とその使い方を説明します。

> Kotlin Developer AdvocateのSebastian Aignerによるスコープ関数に関するトーク、[Back to the Stdlib: Making the Most of Kotlin's Standard Library](https://youtu.be/DdvgvSHrN9g?feature=shared&t=1511) もご覧いただけます。
> 
{style="tip"}

### Let {id="let"}

コード内でnullチェックを行い、その後返されたオブジェクトに対してさらにアクションを実行したい場合は、`let` スコープ関数を使用します。

以下の例を考えてみましょう。

```kotlin
fun sendNotification(recipientAddress: String): String {
    println("Yo $recipientAddress!")
    return "Notification sent!"
}

fun getNextAddress(): String {
    return "sebastian@jetbrains.com"
}

fun main() {
    val address: String? = getNextAddress()
    sendNotification(address)
}
```
{validate = "false"}

この例には2つの関数があります。
* `sendNotification()`: 関数パラメータ `recipientAddress` を受け取り、文字列を返します。
* `getNextAddress()`: 関数パラメータはなく、文字列を返します。

この例では、nullableな `String` 型を持つ変数 `address` を作成しています。しかし、`sendNotification()` 関数は `address` が `null` 値になる可能性を想定していないため、この関数を呼び出す際に問題が発生します。その結果、コンパイラはエラーを報告します。

```text
Argument type mismatch: actual type is 'String?', but 'String' was expected.
```

初級ツアーで学んだように、if条件でnullチェックを実行するか、[Elvis演算子 `?:`](kotlin-tour-null-safety.md#use-elvis-operator) を使用できます。しかし、返されたオブジェクトをコードの後半で使用したい場合はどうすればよいでしょうか？ これは、if条件**および**elseブランチを使用することで実現できます。

```kotlin
fun sendNotification(recipientAddress: String): String {
    println("Yo $recipientAddress!")
    return "Notification sent!"
}

fun getNextAddress(): String {
    return "sebastian@jetbrains.com"
}

fun main() { 
    //sampleStart
    val address: String? = getNextAddress()
    val confirm = if(address != null) {
        sendNotification(address)
    } else { null }
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-let-non-null-if"}

しかし、より簡潔なアプローチは `let` スコープ関数を使用することです。

```kotlin
fun sendNotification(recipientAddress: String): String {
    println("Yo $recipientAddress!")
    return "Notification sent!"
}

fun getNextAddress(): String {
    return "sebastian@jetbrains.com"
}

fun main() {
    //sampleStart
    val address: String? = getNextAddress()
    val confirm = address?.let {
        sendNotification(it)
    }
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-let-non-null"}

この例では以下の処理を行っています。
* `address` と `confirm` という変数を作成します。
* `address` 変数に対して `let` スコープ関数をセーフコール（安全呼び出し）で使用します。
* `let` スコープ関数内に一時的なスコープを作成します。
* `let` スコープ関数に `sendNotification()` 関数をラムダ式として渡します。
* 一時的なスコープを利用して、`it` 経由で `address` 変数を参照します。
* 結果を `confirm` 変数に代入します。

このアプローチにより、コードは `address` 変数が `null` 値になる可能性を適切に処理でき、`confirm` 変数をコードの後半で使用できるようになります。

### Apply {id="apply"}

クラスインスタンスなどのオブジェクトを、コードの後半ではなく作成時に初期化するには、`apply` スコープ関数を使用します。このアプローチにより、コードが読みやすく、管理しやすくなります。

以下の例を考えてみましょう。

```kotlin
class Client() {
    var token: String? = null
    fun connect() = println("connected!")
    fun authenticate() = println("authenticated!")
    fun getData() : String {
        println("getting data!")
        return "Mock data"
    }
}

val client = Client()

fun main() {
    client.token = "asdf"
    client.connect()
    // connected!
    client.authenticate()
    // authenticated!
    client.getData()
    // getting data!
}
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-apply-before"}

この例には、`token` という1つのプロパティと、`connect()`、`authenticate()`、`getData()` という3つのメンバ関数を含む `Client` クラスがあります。

この例では、`Client` クラスのインスタンスとして `client` を作成してから、`main()` 関数内でその `token` プロパティを初期化し、メンバ関数を呼び出しています。

この例はコンパクトですが、実際の開発では、クラスインスタンスを作成してからそれを設定して使用する（およびそのメンバ関数を呼び出す）までに時間が空くことがあります。しかし、`apply` スコープ関数を使用すれば、クラスインスタンスの作成、設定、メンバ関数の呼び出しをすべてコード内の同じ場所で行うことができます。

```kotlin
class Client() {
    var token: String? = null
    fun connect() = println("connected!")
    fun authenticate() = println("authenticated!")
    fun getData() : String {
        println("getting data!")
        return "Mock data"
    }
}
//sampleStart
val client = Client().apply {
    token = "asdf"
    connect()
    // connected!
    authenticate()
    // authenticated!
}

fun main() {
    client.getData()
    // getting data!
}
//sampleEnd
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-apply-after"}

この例では以下の処理を行っています。

* `Client` クラスのインスタンスとして `client` を作成します。
* `client` インスタンスに対して `apply` スコープ関数を使用します。
* `apply` スコープ関数内に一時的なスコープを作成することで、プロパティや関数にアクセスする際に `client` インスタンスを明示的に参照する必要をなくします。
* `apply` スコープ関数にラムダ式を渡し、`token` プロパティを更新して `connect()` および `authenticate()` 関数を呼び出します。
* `main()` 関数で `client` インスタンスの `getData()` メンバ関数を呼び出します。

このように、この戦略は大規模なコードを扱う際に非常に便利です。

### Run {id="run"}

`apply` と同様に、`run` スコープ関数を使用してオブジェクトを初期化できますが、コード内の特定のタイミングでオブジェクトを初期化**し**、即座に結果を計算したい場合は `run` を使用する方が適しています。

前の `apply` 関数の例を続けますが、今回はリクエストごとに `connect()` と `authenticate()` 関数がまとめて呼び出されるようにしたいとします。

例:

```kotlin
class Client() {
    var token: String? = null
    fun connect() = println("connected!")
    fun authenticate() = println("authenticated!")
    fun getData() : String {
        println("getting data!")
        return "Mock data"
    }
}

//sampleStart
val client: Client = Client().apply {
    token = "asdf"
}

fun main() {
    val result: String = client.run {
        connect()
        // connected!
        authenticate()
        // authenticated!
        getData()
        // getting data!
    }
}
//sampleEnd
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-run"}

この例では以下の処理を行っています。

* `Client` クラスのインスタンスとして `client` を作成します。
* `client` インスタンスに対して `apply` スコープ関数を使用します。
* `apply` スコープ関数内に一時的なスコープを作成し、プロパティや関数にアクセスする際に `client` インスタンスを明示的に参照する必要をなくします。
* `apply` スコープ関数にラムダ式を渡して `token` プロパティを更新します。

`main()` 関数では以下の処理を行っています。

* `String` 型の `result` 変数を作成します。
* `client` インスタンスに対して `run` スコープ関数を使用します。
* `run` スコープ関数内に一時的なスコープを作成し、プロパティや関数にアクセスする際に `client` インスタンスを明示的に参照する必要をなくします。
* `run` スコープ関数にラムダ式を渡し、`connect()`、`authenticate()`、`getData()` 関数を呼び出します。
* その結果を `result` 変数に代入します。

これで、返された結果をコードの後半でさらに活用できるようになります。

### Also {id="also"}

ログ出力のように、オブジェクトに対して追加のアクションを実行した後、そのオブジェクトを返してコード内で引き続き使用したい場合は、`also` スコープ関数を使用します。

以下の例を考えてみましょう。

```kotlin
fun main() {
    val medals: List<String> = listOf("Gold", "Silver", "Bronze")
    val reversedLongUppercaseMedals: List<String> =
        medals
            .map { it.uppercase() }
            .filter { it.length > 4 }
            .reversed()
    println(reversedLongUppercaseMedals)
    // [BRONZE, SILVER]
}
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-also-before"}

この例では以下の処理を行っています。

* 文字列のリストを含む `medals` 変数を作成します。
* `List<String>` 型を持つ `reversedLongUpperCaseMedals` 変数を作成します。
* `medals` 変数に対して `.map()` 拡張関数を使用します。
* `.map()` 関数にラムダ式を渡し、`it` キーワード経由で `medals` を参照してその要素に対して `.uppercase()` 拡張関数を呼び出します。
* `medals` 変数に対して `.filter()` 拡張関数を使用します。
* `.filter()` 関数に述語（predicate）としてラムダ式を渡し、`it` キーワード経由で参照してリストのアイテムが4文字より長いかどうかをチェックします。
* `medals` 変数に対して `.reversed()` 拡張関数を使用します。
* その結果を `reversedLongUpperCaseMedals` 変数に代入します。
* `reversedLongUpperCaseMedals` 変数に含まれるリストを出力します。

関数呼び出しの合間にログ出力を追加して、`medals` 変数に何が起きているかを確認できると便利です。`also` 関数はそれに役立ちます。

```kotlin
fun main() {
    val medals: List<String> = listOf("Gold", "Silver", "Bronze")
    val reversedLongUppercaseMedals: List<String> =
        medals
            .map { it.uppercase() }
            .also { println(it) }
            // [GOLD, SILVER, BRONZE]
            .filter { it.length > 4 }
            .also { println(it) }
            // [SILVER, BRONZE]
            .reversed()
    println(reversedLongUppercaseMedals)
    // [BRONZE, SILVER]
}
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-also-after"}

更新後の例では以下の処理を行っています。

* `medals` 変数に対して `also` スコープ関数を使用します。
* `also` スコープ関数内に一時的なスコープを作成し、関数パラメータとして使用する際に `medals` 変数を明示的に参照する必要をなくします。
* `also` スコープ関数にラムダ式を渡し、`it` キーワード経由で `medals` 変数を関数パラメータとして使用して `println()` 関数を呼び出します。

`also` 関数はオブジェクト自体を返すため、ログ出力だけでなく、デバッグ、複数の操作のチェーン、およびコードのメインフローに影響を与えないその他の副作用（side effect）操作を実行するのにも役立ちます。

### With {id="with"}

他のスコープ関数とは異なり、`with` は拡張関数ではないため、構文が異なります。レシーバオブジェクトを引数として `with` に渡します。

オブジェクトに対して複数の関数を呼び出したい場合は、`with` スコープ関数を使用します。

この例を考えてみましょう。

```kotlin
class Canvas {
    fun rect(x: Int, y: Int, w: Int, h: Int): Unit = println("$x, $y, $w, $h")
    fun circ(x: Int, y: Int, rad: Int): Unit = println("$x, $y, $rad")
    fun text(x: Int, y: Int, str: String): Unit = println("$x, $y, $str")
}

fun main() {
    val mainMonitorPrimaryBufferBackedCanvas = Canvas()

    mainMonitorPrimaryBufferBackedCanvas.text(10, 10, "Foo")
    mainMonitorPrimaryBufferBackedCanvas.rect(20, 30, 100, 50)
    mainMonitorPrimaryBufferBackedCanvas.circ(40, 60, 25)
    mainMonitorPrimaryBufferBackedCanvas.text(15, 45, "Hello")
    mainMonitorPrimaryBufferBackedCanvas.rect(70, 80, 150, 100)
    mainMonitorPrimaryBufferBackedCanvas.circ(90, 110, 40)
    mainMonitorPrimaryBufferBackedCanvas.text(35, 55, "World")
    mainMonitorPrimaryBufferBackedCanvas.rect(120, 140, 200, 75)
    mainMonitorPrimaryBufferBackedCanvas.circ(160, 180, 55)
    mainMonitorPrimaryBufferBackedCanvas.text(50, 70, "Kotlin")
}
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-with-before"}

この例では、`rect()`、`circ()`、`text()` の3つのメンバ関数を持つ `Canvas` クラスを作成しています。これらの各メンバ関数は、渡された関数パラメータから構築された文を出力します。

この例では、`Canvas` クラスのインスタンスとして `mainMonitorPrimaryBufferBackedCanvas` を作成してから、そのインスタンスに対して異なる関数パラメータで一連のメンバ関数を呼び出しています。

このコードは読みにくいことがわかります。`with` 関数を使用すれば、コードをすっきりと整理できます。

```kotlin
class Canvas {
    fun rect(x: Int, y: Int, w: Int, h: Int): Unit = println("$x, $y, $w, $h")
    fun circ(x: Int, y: Int, rad: Int): Unit = println("$x, $y, $rad")
    fun text(x: Int, y: Int, str: String): Unit = println("$x, $y, $str")
}

fun main() {
    //sampleStart
    val mainMonitorSecondaryBufferBackedCanvas = Canvas()
    with(mainMonitorSecondaryBufferBackedCanvas) {
        text(10, 10, "Foo")
        rect(20, 30, 100, 50)
        circ(40, 60, 25)
        text(15, 45, "Hello")
        rect(70, 80, 150, 100)
        circ(90, 110, 40)
        text(35, 55, "World")
        rect(120, 140, 200, 75)
        circ(160, 180, 55)
        text(50, 70, "Kotlin")
    }
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-with-after"}

この例では以下の処理を行っています。
* `mainMonitorSecondaryBufferBackedCanvas` インスタンスをレシーバとして `with` スコープ関数を使用します。
* `with` スコープ関数内に一時的なスコープを作成し、メンバ関数を呼び出す際に `mainMonitorSecondaryBufferBackedCanvas` インスタンスを明示的に参照する必要をなくします。
* `with` スコープ関数にラムダ式を渡し、異なる関数パラメータで一連のメンバ関数を呼び出します。

これでコードがはるかに読みやすくなり、ミスを犯す可能性が低くなります。

## ユースケースの概要 {id="use-case-overview"}

このセクションでは、Kotlinで使用できるさまざまなスコープ関数と、コードをよりイディオマティックにするための主なユースケースについて説明しました。この表をクイックリファレンスとして使用できます。これらの関数をコードで使用するために、その仕組みを完全に理解している必要はない点に留意してください。

| 関数 | `x` へのアクセス方法 | 戻り値 | ユースケース |
|---|---|---|---|
| `let` | `it` | ラムダ式の結果 | コード内でnullチェックを行い、その後返されたオブジェクトに対してさらにアクションを実行する。 |
| `apply` | `this` | `x` | 作成時にオブジェクトを初期化する。 |
| `run` | `this` | ラムダ式の結果 | 作成時にオブジェクトを初期化し、**かつ**結果を計算する。 |
| `also` | `it` | `x` | オブジェクトを返す前に追加のアクションを実行する。 |
| `with` | `this` | ラムダ式の結果 | オブジェクトに対して複数の関数を呼び出す。 |

スコープ関数の詳細については、[スコープ関数](scope-functions.md)を参照してください。

## 練習問題 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="セーフコールとletを使用して関数を書き換える" id="scope-functions-exercise-1">

`.getPriceInEuros()` 関数を、セーフコール演算子 `?.` と `let` スコープ関数を使用する単一式関数（single-expression function）として書き換えてください。

<deflist collapsible="true">
    <def title="ヒント">
        セーフコール演算子 <code>?.</code> を使用して、<code>getProductInfo()</code> 関数から <code>priceInDollars</code> プロパティに安全にアクセスします。次に、<code>let</code> スコープ関数を使用して <code>priceInDollars</code> の値をユーロに変換します。
    </def>
</deflist>

```kotlin
data class ProductInfo(val priceInDollars: Double?)

class Product {
    fun getProductInfo(): ProductInfo? {
        return ProductInfo(100.0)
    }
}

// Rewrite this function
fun Product.getPriceInEuros(): Double? {
    val info = getProductInfo()
    if (info == null) return null
    val price = info.priceInDollars
    if (price == null) return null
    return convertToEuros(price)
}

fun convertToEuros(dollars: Double): Double {
    return dollars * 0.85
}

fun main() {
    val product = Product()
    val priceInEuros = product.getPriceInEuros()

    if (priceInEuros != null) {
        println("Price in Euros: €$priceInEuros")
        // Price in Euros: €85.0
    } else {
        println("Price information is not available.")
    }
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-scope-functions-exercise-1"}

```kotlin
data class ProductInfo(val priceInDollars: Double?)

class Product {
    fun getProductInfo(): ProductInfo? {
        return ProductInfo(100.0)
    }
}

fun Product.getPriceInEuros() = getProductInfo()?.priceInDollars?.let { convertToEuros(it) }

fun convertToEuros(dollars: Double): Double {
    return dollars * 0.85
}

fun main() {
    val product = Product()
    val priceInEuros = product.getPriceInEuros()

    if (priceInEuros != null) {
        println("Price in Euros: €$priceInEuros")
        // Price in Euros: €85.0
    } else {
        println("Price information is not available.")
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-scope-functions-solution-1"}

</def>
<def title="applyとalsoをチェーンする" id="scope-functions-exercise-2">

ユーザーのメールアドレスを更新する `updateEmail()` 関数があります。`apply` スコープ関数を使用してメールアドレスを更新し、次に `also` スコープ関数を使用してログメッセージ `Updating email for user with ID: ${it.id}` を出力してください。

```kotlin
data class User(val id: Int, var email: String)

fun updateEmail(user: User, newEmail: String): User = // Write your code here

fun main() {
    val user = User(1, "old_email@example.com")
    val updatedUser = updateEmail(user, "new_email@example.com")
    // Updating email for user with ID: 1

    println("Updated User: $updatedUser")
    // Updated User: User(id=1, email=new_email@example.com)
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-scope-functions-exercise-2"}

```kotlin
data class User(val id: Int, var email: String)

fun updateEmail(user: User, newEmail: String): User = user.apply {
    this.email = newEmail
}.also { println("Updating email for user with ID: ${it.id}") }

fun main() {
    val user = User(1, "old_email@example.com")
    val updatedUser = updateEmail(user, "new_email@example.com")
    // Updating email for user with ID: 1

    println("Updated User: $updatedUser")
    // Updated User: User(id=1, email=new_email@example.com)
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-scope-functions-solution-2"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-intermediate-extension-functions.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-lambdas-receiver.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>