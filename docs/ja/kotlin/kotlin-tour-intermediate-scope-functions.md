[//]: # (title: 中級：スコープ関数)

<no-index/>

<tldr>
    <p><img src="icon-1-done.svg" width="20" alt="First step" /> <a href="kotlin-tour-intermediate-extension-functions.md">拡張関数</a><br />
        <img src="icon-2.svg" width="20" alt="Second step" /> <strong>スコープ関数</strong><br />
        <img src="icon-3-todo.svg" width="20" alt="Third step" /> <a href="kotlin-tour-intermediate-lambdas-receiver.md">レシーバー付きラムダ式</a><br />
        <img src="icon-4-todo.svg" width="20" alt="Fourth step" /> <a href="kotlin-tour-intermediate-classes-interfaces.md">クラスとインターフェース</a><br />
        <img src="icon-5-todo.svg" width="20" alt="Fifth step" /> <a href="kotlin-tour-intermediate-objects.md">オブジェクト</a><br />
        <img src="icon-6-todo.svg" width="20" alt="Sixth step" /> <a href="kotlin-tour-intermediate-open-special-classes.md">openクラスと特殊なクラス</a><br />
        <img src="icon-7-todo.svg" width="20" alt="Seventh step" /> <a href="kotlin-tour-intermediate-properties.md">プロパティ</a><br />
        <img src="icon-8-todo.svg" width="20" alt="Eighth step" /> <a href="kotlin-tour-intermediate-null-safety.md">Null安全</a><br />
        <img src="icon-9-todo.svg" width="20" alt="Ninth step" /> <a href="kotlin-tour-intermediate-libraries-and-apis.md">ライブラリとAPI</a></p>
</tldr>

この章では、拡張関数の知識を土台として、より慣用的（idiomatic）なコードを書くための「スコープ関数」の使い方を学びます。

## スコープ関数

プログラミングにおける「スコープ」とは、変数やオブジェクトが認識される範囲のことです。一般的に参照されるスコープには、グローバルスコープとローカルスコープがあります。

* **グローバルスコープ（Global scope）** – プログラム内のどこからでもアクセスできる変数やオブジェクト。
* **ローカルスコープ（Local scope）** – 定義されたブロックまたは関数内でのみアクセスできる変数やオブジェクト。

Kotlinには、オブジェクトの周囲に一時的なスコープを作成し、コードを実行できるようにする「スコープ関数」も用意されています。

スコープ関数を使用すると、その一時的なスコープ内でオブジェクトの名前を繰り返し参照する必要がなくなるため、コードがより簡潔になります。使用するスコープ関数に応じて、オブジェクトにはキーワード `this` でアクセスするか、引数としてキーワード `it` でアクセスします。

Kotlinには、`let`、`apply`、`run`、`also`、`with` の計5つのスコープ関数があります。

各スコープ関数はラムダ式を受け取り、オブジェクト自体、またはラムダ式の結果のいずれかを返します。このツアーでは、それぞれのスコープ関数とその使い方について解説します。

> Kotlin開発者アドボケイトのSebastian Aignerによるスコープ関数のトーク、[Back to the Stdlib: Making the Most of Kotlin's Standard Library](https://youtu.be/DdvgvSHrN9g?feature=shared&t=1511) もあわせてご覧ください。
> 
{style="tip"}

### Let

コード内でNullチェックを行い、その後に返されたオブジェクトを使用してさらにアクションを実行したい場合は、`let` スコープ関数を使用します。

次の例を考えてみましょう：

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

この例には2つの関数があります：
* `sendNotification()`: 関数パラメータ `recipientAddress` を持ち、文字列を返します。
* `getNextAddress()`: 関数パラメータを持たず、文字列を返します。

この例では、Null許容型の `String?` である変数 `address` を作成しています。しかし、`sendNotification()` 関数を呼び出す際に問題が発生します。なぜなら、この関数は `address` が `null` 値であることを想定していないからです。
その結果、コンパイラはエラーを報告します：

```text
Argument type mismatch: actual type is 'String?', but 'String' was expected.
```

ビギナーツアーで学んだように、`if` 条件文でNullチェックを行うか、[エルビス演算子 `?:`](kotlin-tour-null-safety.md#use-elvis-operator) を使用することができます。しかし、後でその返されたオブジェクトを使いたい場合はどうすればよいでしょうか？ `if` 文と `else` ブランチを使って実現することもできます：

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

しかし、より簡潔なアプローチは `let` スコープ関数を使用することです：

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

この例では：
* `address` と `confirm` という変数を作成します。
* `address` 変数に対して `let` スコープ関数を安全な呼び出し（safe call）で使用します。
* `let` スコープ関数内の一時的なスコープを作成します。
* `sendNotification()` 関数をラムダ式として `let` スコープ関数に渡します。
* 一時的なスコープを使用して、`address` 変数を `it` を介して参照します。
* 結果を `confirm` 変数に代入します。

このアプローチにより、`address` 変数が `null` である可能性を適切に処理しつつ、後で `confirm` 変数を使用することができます。

### Apply

オブジェクト（クラスのインスタンスなど）を、作成後ではなく、作成時に初期化したい場合は、`apply` スコープ関数を使用します。このアプローチにより、コードが読みやすく管理しやすくなります。

次の例を考えてみましょう：

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

この例には、`token` というプロパティと、3つのメンバ関数（`connect()`、`authenticate()`、`getData()`）を持つ `Client` クラスがあります。

例では、`client` を `Client` クラスのインスタンスとして作成してから、`main()` 関数内でその `token` プロパティを初期化し、メンバ関数を呼び出しています。

この例はコンパクトですが、現実の世界では、クラスインスタンスを作成してから、その構成やメンバ関数の使用ができるようになるまで、コードが離れてしまうことがあります。しかし、`apply` スコープ関数を使用すれば、クラスインスタンスの作成、構成、およびメンバ関数の使用を、コードの同じ場所ですべて行うことができます：

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

この例では：

* `client` を `Client` クラスのインスタンスとして作成します。
* `client` インスタンスに対して `apply` スコープ関数を使用します。
* `apply` スコープ関数内の一時的なスコープを作成します。これにより、プロパティや関数にアクセスする際に、`client` インスタンスを明示的に参照する必要がなくなります。
* `token` プロパティを更新し、`connect()` および `authenticate()` 関数を呼び出すラムダ式を `apply` スコープ関数に渡します。
* `main()` 関数内で、`client` インスタンスの `getData()` メンバ関数を呼び出します。

見ての通り、この戦略は大きなコードを扱う際に非常に便利です。

### Run

`apply` と同様に、`run` スコープ関数を使用してオブジェクトを初期化できますが、コード内の特定のタイミングでオブジェクトを初期化**し**、即座に結果を計算したい場合には `run` を使うのが最適です。

前の `apply` 関数の例を続けてみましょう。今回は、リクエストのたびに `connect()` と `authenticate()` 関数が呼ばれるようにグループ化したいとします。

例：

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

この例では：

* `client` を `Client` クラスのインスタンスとして作成します。
* `client` インスタンスに対して `apply` スコープ関数を使用します。
* `apply` スコープ関数内の一時的なスコープを作成します。これにより、プロパティや関数にアクセスする際に、`client` インスタンスを明示的に参照する必要がなくなります。
* `token` プロパティを更新するラムダ式を `apply` スコープ関数に渡します。

`main()` 関数内では：

* `String` 型の `result` 変数を作成します。
* `client` インスタンスに対して `run` スコープ関数を使用します。
* `run` スコープ関数内の一時的なスコープを作成します。これにより、プロパティや関数にアクセスする際に、`client` インスタンスを明示的に参照する必要がなくなります。
* `connect()`、`authenticate()`、および `getData()` 関数を呼び出すラムダ式を `run` に渡します。
* 結果を `result` 変数に代入します。

これで、返された結果をコードの後の部分で使用できます。

### Also

ログの書き込みなど、オブジェクトに対して追加のアクションを完了し、その後にオブジェクトを返してコード内で引き続き使用したい場合は、`also` スコープ関数を使用します。

次の例を考えてみましょう：

```kotlin
fun main() {
    val medals: `List<String>` = listOf("Gold", "Silver", "Bronze")
    val reversedLongUppercaseMedals: `List<String>` =
        medals
            .map { it.uppercase() }
            .filter { it.length > 4 }
            .reversed()
    println(reversedLongUppercaseMedals)
    // [BRONZE, SILVER]
}
```
{kotlin-runnable="true" id="kotlin-tour-scope-function-also-before"}

この例では：

* 文字列のリストを含む `medals` 変数を作成します。
* `List<String>` 型の `reversedLongUpperCaseMedals` 変数を作成します。
* `medals` 変数に対して `.map()` 拡張関数を使用します。
* `it` キーワードを介して `medals` を参照し、それに対して `.uppercase()` 拡張関数を呼び出すラムダ式を `.map()` 関数に渡します。
* `medals` 変数に対して `.filter()` 拡張関数を使用します。
* リスト内の項目が4文字より多いかどうかをチェックする述語として、`it` キーワードを介して `medals` を参照するラムダ式を `.filter()` 関数に渡します。
* `medals` 変数に対して `.reversed()` 拡張関数を使用します。
* 結果を `reversedLongUpperCaseMedals` 変数に代入します。
* `reversedLongUpperCaseMedals` 変数に含まれるリストを出力します。

関数呼び出しの間にログを追加して、`medals` 変数に何が起きているかを確認できると便利です。`also` 関数がその助けになります：

```kotlin
fun main() {
    val medals: `List<String>` = listOf("Gold", "Silver", "Bronze")
    val reversedLongUppercaseMedals: `List<String>` =
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

改良された例では：

* `medals` 変数に対して `also` スコープ関数を使用します。
* `also` スコープ関数内の一時的なスコープを作成します。これにより、オブジェクトを関数の引数として使用する際に明示的に参照する必要がなくなります。
* `it` キーワードを介して `medals` 変数を引数として `println()` 関数を呼び出すラムダ式を `also` スコープ関数に渡します。

`also` 関数はオブジェクト自体を返すため、ログ記録だけでなく、デバッグ、複数の操作の連結、およびコードのメインフローに影響を与えないその他の副作用操作を実行するのに便利です。

### With

他のスコープ関数とは異なり、`with` は拡張関数ではないため、構文が異なります。レシーバーオブジェクトを引数として `with` に渡します。

オブジェクトに対して複数の関数を呼び出したい場合は、`with` スコープ関数を使用します。

この例を考えてみましょう：

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

この例では、`rect()`、`circ()`、および `text()` の3つのメンバ関数を持つ `Canvas` クラスを作成しています。これらの各メンバ関数は、提供された関数パラメータから構築されたステートメントを出力します。

例では、`mainMonitorPrimaryBufferBackedCanvas` を `Canvas` クラスのインスタンスとして作成してから、そのインスタンスに対して異なる関数パラメータを使用して一連のメンバ関数を呼び出しています。

このコードは読みにくいことがわかります。`with` 関数を使用すると、コードが整理されます：

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

この例では：
* `mainMonitorSecondaryBufferBackedCanvas` インスタンスをレシーバーとして `with` スコープ関数を使用します。
* `with` スコープ関数内の一時的なスコープを作成します。これにより、メンバ関数を呼び出す際に `mainMonitorSecondaryBufferBackedCanvas` インスタンスを明示的に参照する必要がなくなります。
* 異なるパラメータで一連のメンバ関数を呼び出すラムダ式を `with` スコープ関数に渡します。

これでコードが格段に読みやすくなり、間違いを犯す可能性も低くなります。

## ユースケースの概要

このセクションでは、Kotlinで使用可能なさまざまなスコープ関数と、コードをより慣用的にするための主なユースケースについて説明しました。この表をクイックリファレンスとして使用できます。これらの関数をコードで使用するために、その仕組みを完全に理解している必要はない、ということを覚えておくことが重要です。

| 関数 | `x` へのアクセス方法 | 戻り値 | ユースケース |
|----------|-------------------|---------------|----------------------------------------------------------------------------------------------|
| `let`    | `it`              | ラムダの結果 | コード内でNullチェックを行い、その後に返されたオブジェクトを使用してさらなるアクションを実行する。 |
| `apply`  | `this`            | `x`           | 作成時にオブジェクトを初期化する。 |
| `run`    | `this`            | ラムダの結果 | 作成時にオブジェクトを初期化**し**、かつ結果を計算する。 |
| `also`   | `it`              | `x`           | オブジェクトを返す前に、追加のアクションを完了する。 |
| `with`   | `this`            | ラムダの結果 | オブジェクトに対して複数の関数を呼び出す。 |

スコープ関数の詳細については、[スコープ関数](scope-functions.md)を参照してください。

## 練習問題

### 練習問題 1 {initial-collapse-state="collapsed" collapsible="true" id="scope-functions-exercise-1"}

安全な呼び出し演算子 `?.` と `let` スコープ関数を使用して、`.getPriceInEuros()` 関数を単一式関数として書き換えてください。

<deflist collapsible="true">
    <def title="ヒント">
        安全な呼び出し演算子 <code>?.</code> を使用して、<code>getProductInfo()</code> 関数から <code>priceInDollars</code> プロパティに安全にアクセスします。次に、<code>let</code> スコープ関数を使用して、<code>priceInDollars</code> の値をユーロに変換します。
    </def>
</deflist>

|---|---|
```kotlin
data class ProductInfo(val priceInDollars: Double?)

class Product {
    fun getProductInfo(): ProductInfo? {
        return ProductInfo(100.0)
    }
}

// この関数を書き換えてください
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

|---|---|
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

### 練習問題 2 {initial-collapse-state="collapsed" collapsible="true" id="scope-functions-exercise-2"}

ユーザーのメールアドレスを更新する `updateEmail()` 関数があります。`apply` スコープ関数を使用してメールアドレスを更新し、次に `also` スコープ関数を使用して `Updating email for user with ID: ${it.id}` というログメッセージを出力してください。

|---|---|
```kotlin
data class User(val id: Int, var email: String)

fun updateEmail(user: User, newEmail: String): User = // ここにコードを書いてください

fun main() {
    val user = User(1, "old_email@example.com")
    val updatedUser = updateEmail(user, "new_email@example.com")
    // Updating email for user with ID: 1

    println("Updated User: $updatedUser")
    // Updated User: User(id=1, email=new_email@example.com)
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-scope-functions-exercise-2"}

|---|---|
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

## 次のステップ

[中級：レシーバー付きラムダ式](kotlin-tour-intermediate-lambdas-receiver.md)