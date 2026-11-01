[//]: # (title: スコープ関数)

<no-index/>

この章では、拡張関数についての理解を深めたうえで、よりKotlinらしい慣用的なコードを書くためのスコープ関数（Scope function）の使い方を学びます。

## スコープ関数 {id="scope-functions"}

プログラミングにおいて、スコープとは変数やオブジェクトが認識（参照）可能な範囲のことです。最もよく知られているスコープとして、グローバルスコープとローカルスコープがあります。

* **グローバルスコープ** – プログラム内のどこからでもアクセスできる変数またはオブジェクト。
* **ローカルスコープ** – それが定義されているブロックまたは関数内からのみアクセスできる変数またはオブジェクト。

Kotlinには、オブジェクトに対して一時的なスコープを作成し、その中でコードを実行できるスコープ関数も用意されています。

スコープ関数を使用すると、一時的なスコープ内でオブジェクトの名前を繰り返し参照する必要がなくなるため、コードをより簡潔に記述できます。スコープ関数によって、オブジェクトへのアクセス方法はキーワード `this` を介して参照するか、キーワード `it` を介して引数として使用するかのいずれかになります。

Kotlinには、`let`、`apply`、`run`、`also`、`with` の計5つのスコープ関数があります。

各スコープ関数はラムダ式を受け取り、オブジェクト自身またはラムダ式の結果のいずれかを返します。このツアーでは、それぞれのスコープ関数とその使い方について説明します。

> KotlinデベロッパーアドボケイトのSebastian Aignerによるスコープ関数の講演、[Back to the Stdlib: Making the Most of Kotlin's Standard Library](https://youtu.be/DdvgvSHrN9g?feature=shared&t=1511) もご覧いただけます。
> 
{style="tip"}

### Let {id="let"}

コード内で null チェックを行い、その後返されたオブジェクトを使って追加のアクションを実行したい場合は、スコープ関数 `let` を使用します。

次の例を考えてみましょう。

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
* `recipientAddress` という関数パラメータを持ち、文字列を返す `sendNotification()`。
* 関数パラメータを持たず、文字列を返す `getNextAddress()`。

この例では、null許容の `String` 型を持つ変数 `address` を作成しています。しかし、`sendNotification()` 関数は `address` が `null` 値になる可能性を想定していないため、これを呼び出す際に問題が発生します。結果としてコンパイラはエラーを報告します。

```text
Argument type mismatch: actual type is 'String?', but 'String' was expected.
```

ビギナーツアーですでに学んだように、if 条件で null チェックを行うか、[エルビス演算子 `?:`](kotlin-tour-null-safety.md#use-elvis-operator) を使用できます。しかし、返されたオブジェクトを後からコード内で使用したい場合はどうすればよいでしょうか？ これは、if 条件**および** else ブランチを使用することで実現できます。

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

しかし、スコープ関数 `let` を使用するほうが、より簡潔なアプローチになります。

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
* `address` 変数に対してスコープ関数 `let` を安全呼び出し（safe call）で使用します。
* スコープ関数 `let` 内に一時的なスコープを作成します。
* ラムダ式として `sendNotification()` 関数をスコープ関数 `let` に渡します。
* 一時的なスコープを利用して、`it` を介して `address` 変数を参照します。
* 結果を `confirm` 変数に代入します。

このアプローチにより、コードは `address` 変数が `null` 値になる可能性を適切に処理でき、さらに後で `confirm` 変数をコード内で利用することができます。

### Apply {id="apply"}

クラスインスタンスなどのオブジェクトを、コードの後の方ではなく生成時に初期化したい場合は、スコープ関数 `apply` を使用します。このアプローチにより、コードの可読性と管理のしやすさが向上します。

次の例を考えてみましょう。

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

この例には、`token` という1つのプロパティと、`connect()`、`authenticate()`、`getData()` という3つのメンバ関数を持つ `Client` クラスがあります。

この例では、`main()` 関数内で、`token` プロパティの初期化やメンバ関数の呼び出しを行う前に、`Client` クラスのインスタンスとして `client` を作成しています。

この例はコンパクトですが、実際の開発では、クラスインスタンスを作成してからそれを設定して（メンバ関数を）使用するまでに間が空いてしまうことがあります。しかし、スコープ関数 `apply` を使用すれば、クラスインスタンスの生成、設定、およびメンバ関数の呼び出しをすべてコードの同じ場所で行うことができます。

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

* `Client` クラスのインスタンスとして `client` を作成します。
* `client` インスタンスに対してスコープ関数 `apply` を使用します。
* スコープ関数 `apply` 内に一時的なスコープを作成し、プロパティや関数にアクセスする際に明示的に `client` インスタンスを参照する必要がないようにします。
* `token` プロパティを更新し、`connect()` および `authenticate()` 関数を呼び出すラムダ式をスコープ関数 `apply` に渡します。
* `main()` 関数内で `client` インスタンスの `getData()` メンバ関数を呼び出します。

ご覧のとおり、この手法は規模の大きいコードを扱う際に便利です。

### Run {id="run"}

`apply` と同様に、スコープ関数 `run` を使用してオブジェクトを初期化することもできますが、`run` はコード内の特定のタイミングでオブジェクトを初期化し、**かつ**直ちに結果を計算したい場合に使用するのに適しています。

先ほどの `apply` 関数の例を続けますが、今回はリクエストごとに呼び出されるように、`connect()` と `authenticate()` 関数をグループ化したいとします。

例えば次のようになります。

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

* `Client` クラスのインスタンスとして `client` を作成します。
* `client` インスタンスに対してスコープ関数 `apply` を使用します。
* スコープ関数 `apply` 内に一時的なスコープを作成し、プロパティや関数にアクセスする際に明示的に `client` インスタンスを参照する必要がないようにします。
* `token` プロパティを更新するラムダ式をスコープ関数 `apply` に渡します。

`main()` 関数では：

* `String` 型の `result` 変数を作成します。
* `client` インスタンスに対してスコープ関数 `run` を使用します。
* スコープ関数 `run` 内に一時的なスコープを作成し、プロパティや関数にアクセスする際に明示的に `client` インスタンスを参照する必要がないようにします。
* `connect()`、`authenticate()`、`getData()` 関数を呼び出すラムダ式をスコープ関数 `run` に渡します。
* 結果を `result` 変数に代入します。

これで、返された結果を後続のコードで利用できます。

### Also {id="also"}

ログの出力など、オブジェクトに対して追加のアクションを実行した上で、コード内でそのオブジェクトを引き続き使用するためにオブジェクト自身を返したい場合は、スコープ関数 `also` を使用します。

次の例を考えてみましょう。

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

この例では：

* 文字列のリストを含む `medals` 変数を作成します。
* `List<String>` 型の `reversedLongUpperCaseMedals` 変数を作成します。
* `medals` 変数に対して `.map()` 拡張関数を使用します。
* `it` キーワードを介して `medals` を参照し、それに対して `.uppercase()` 拡張関数を呼び出すラムダ式を `.map()` 関数に渡します。
* `medals` 変数に対して `.filter()` 拡張関数を使用します。
* `it` キーワードを介して `medals` を参照し、リストの要素が4文字を超えているかどうかをチェックする述語（predicate）としてのラムダ式を `.filter()` 関数に渡します。
* `medals` 変数に対して `.reversed()` 拡張関数を使用します。
* 結果を `reversedLongUpperCaseMedals` 変数に代入します。
* `reversedLongUpperCaseMedals` 変数に含まれるリストを出力します。

関数呼び出しの間にログを追加して、`medals` 変数に何が起きているかを確認できると便利です。`also` 関数はこれに役立ちます。

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

改善された例では：

* `medals` 変数に対してスコープ関数 `also` を使用します。
* スコープ関数 `also` 内に一時的なスコープを作成し、関数パラメータとして使用する際に明示的に `medals` 変数を参照する必要がないようにします。
* `it` キーワードを介して `medals` 変数を関数パラメータとして渡し、`println()` 関数を呼び出すラムダ式をスコープ関数 `also` に渡します。

`also` 関数はオブジェクト自身を返すため、ログ記録だけでなく、デバッグや複数の操作のチェーン、コードのメインフローに影響を与えないその他の副作用操作を実行する場合にも役立ちます。

### With {id="with"}

他のスコープ関数とは異なり、`with` は拡張関数ではないため、構文が異なります。レシーバオブジェクトを引数として `with` に渡します。

オブジェクトに対して複数の関数を呼び出したい場合は、スコープ関数 `with` を使用します。

次の例を考えてみましょう。

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

この例では、`rect()`、`circ()`、`text()` という3つのメンバ関数を持つ `Canvas` クラスを作成しています。これらの各メンバ関数は、指定された関数パラメータから構築された文を出力します。

この例では、`Canvas` クラスのインスタンスとして `mainMonitorPrimaryBufferBackedCanvas` を作成した上で、そのインスタンスに対して異なる関数パラメータを持つ一連のメンバ関数を呼び出しています。

このコードは読みにくいことが分かります。`with` 関数を使用すると、コードがすっきりと整理されます。

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
* `mainMonitorSecondaryBufferBackedCanvas` インスタンスをレシーバとしてスコープ関数 `with` を使用します。
* スコープ関数 `with` 内に一時的なスコープを作成し、メンバ関数を呼び出す際に明示的に `mainMonitorSecondaryBufferBackedCanvas` インスタンスを参照する必要がないようにします。
* 異なる関数パラメータを持つ一連のメンバ関数を呼び出すラムダ式をスコープ関数 `with` に渡します。

これでコードがはるかに読みやすくなり、間違いを犯す可能性も低くなります。

## ユースケースの概要 {id="use-case-overview"}

このセクションでは、Kotlinで使用できるさまざまなスコープ関数と、コードをより慣用的にするための主なユースケースについて説明しました。クイックリファレンスとしてこの表を活用できます。これらの関数をコード内で活用するために、関数の仕組みを完全に理解している必要はない点に留意してください。

| 関数 | `x` へのアクセス方法 | 戻り値 | ユースケース |
|----------|-------------------|---------------|----------------------------------------------------------------------------------------------|
| `let`    | `it`              | ラムダ式の結果 | コード内で null チェックを行い、その後返されたオブジェクトでさらなるアクションを実行する。 |
| `apply`  | `this`            | `x`           | 生成時にオブジェクトを初期化する。 |
| `run`    | `this`            | ラムダ式の結果 | 生成時にオブジェクトを初期化し、**かつ**結果を計算する。 |
| `also`   | `it`              | `x`           | オブジェクトを返す前に追加のアクションを実行する。 |
| `with`   | `this`            | ラムダ式の結果 | オブジェクトに対して複数の関数を呼び出す。 |

スコープ関数の詳細については、[スコープ関数](scope-functions.md)（Scope functions）を参照してください。

## 演習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="安全呼び出しとletを使用して関数を書き直す" id="scope-functions-exercise-1">

安全呼び出し演算子 `?.` とスコープ関数 `let` を使用して、`.getPriceInEuros()` 関数を単一式関数（single-expression function）として書き直してください。

<deflist collapsible="true">
    <def title="ヒント">
        安全呼び出し演算子 <code>?.</code> を使用して、<code>getProductInfo()</code> 関数から <code>priceInDollars</code> プロパティに安全にアクセスします。その後、スコープ関数 <code>let</code> を使用して、<code>priceInDollars</code> の値をユーロに変換します。
    </def>
</deflist>

```kotlin
data class ProductInfo(val priceInDollars: Double?)

class Product {
    fun getProductInfo(): ProductInfo? {
        return ProductInfo(100.0)
    }
}

// この関数を書き直してください
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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/GetPriceInEurosTest.kt" validate="false" id="kotlin-tour-scope-functions-exercise-1"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/GetPriceInEurosTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-scope-functions-solution-1"}

</def>
<def title="apply と also のチェーン" id="scope-functions-exercise-2">

ユーザーのメールアドレスを更新する `updateEmail()` 関数があります。スコープ関数 `apply` を使ってメールアドレスを更新し、その後にスコープ関数 `also` を使ってログメッセージ（`Updating email for user with ID: ${it.id}`）を出力してください。

```kotlin
data class User(val id: Int, var email: String)

fun updateEmail(user: User, newEmail: String): User = TODO("Replace the TODO() function")

fun main() {
    val user = User(1, "old_email@example.com")
    val updatedUser = updateEmail(user, "new_email@example.com")
    // Updating email for user with ID: 1

    println("Updated User: $updatedUser")
    // Updated User: User(id=1, email=new_email@example.com)
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/UpdateEmailTest.kt" validate="false" id="kotlin-tour-scope-functions-exercise-2"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/UpdateEmailTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-scope-functions-solution-2"}

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