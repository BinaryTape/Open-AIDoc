[//]: # (title: 関数)

<no-index/>

Kotlinでは、`fun`キーワードを使用して独自の関数を宣言できます。

```kotlin
fun hello() {
    return println("Hello, world!")
}

fun main() {
    hello()
    // Hello, world!
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-function-demo"}

Kotlinにおいて：

* 関数のパラメータは丸括弧 `()` 内に記述します。
* 各パラメータには型を指定する必要があり、複数のパラメータはカンマ `,` で区切ります。
* 戻り値の型は、関数の丸括弧 `()` の後にコロン `:` で区切って記述します。
* 関数の本体は波括弧 `{}` 内に記述します。
* `return` キーワードは、関数を終了したり、関数から値を返したりするために使用します。

> 関数が有用な値を返さない場合、戻り値の型と `return` キーワードは省略できます。これについての詳細は、[戻り値のない関数](#戻り値のない関数)で説明します。
>
{style="note"}

以下の例では：

* `x` と `y` は関数のパラメータです。
* `x` と `y` は `Int` 型です。
* 関数の戻り値の型は `Int` です。
* 関数は呼び出されると、`x` と `y` の合計を返します。

```kotlin
fun sum(x: Int, y: Int): Int {
    return x + y
}

fun main() {
    println(sum(1, 2))
    // 3
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-simple-function"}

> [コーディング規約](coding-conventions.md#function-names)では、関数名は小文字で始め、アンダースコアを使用しないキャメルケース（camelCase）を使用することを推奨しています。
> 
{style="note"}

## 名前付き引数

コードを簡潔にするために、関数を呼び出す際にパラメータ名を含める必要はありません。しかし、パラメータ名を含めると、コードが読みやすくなります。これは**名前付き引数** (Named arguments) と呼ばれます。パラメータ名を含める場合は、パラメータを任意の順序で記述できます。

> 以下の例では、パラメータの値にアクセスし、それらを `String` 型に変換して、印刷用に文字列として連結するために、[文字列テンプレート](strings.md#string-templates) ( ) を使用しています。
> 
{style="tip"}

```kotlin
fun printMessageWithPrefix(message: String, prefix: String) {
    println("[$prefix] $message")
}

fun main() {
    // 名前付き引数を使用し、パラメータの順序を入れ替えて呼び出し
    printMessageWithPrefix(prefix = "Log", message = "Hello")
    // [Log] Hello
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-named-arguments-function"}

## デフォルト引数値

関数のパラメータにデフォルト値を定義できます。デフォルト値を持つパラメータは、関数呼び出し時に省略可能です。デフォルト値を宣言するには、型の後に代入演算子 `=` を使用します。

```kotlin
fun printMessageWithPrefix(message: String, prefix: String = "Info") {
    println("[$prefix] $message")
}

fun main() {
    // 両方のパラメータを指定して関数を呼び出し
    printMessageWithPrefix("Hello", "Log") 
    // [Log] Hello
    
    // message パラメータのみを指定して関数を呼び出し
    printMessageWithPrefix("Hello")        
    // [Info] Hello
    
    printMessageWithPrefix(prefix = "Log", message = "Hello")
    // [Log] Hello
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-default-param-function"}

> すべてを省略するのではなく、デフォルト値を持つ特定のパラメータのみをスキップすることもできます。ただし、最初にパラメータをスキップした後は、それ以降のすべてのパラメータに名前を付ける必要があります。
>
{style="note"}

## 戻り値のない関数

関数が有用な値を返さない場合、その戻り値の型は `Unit` になります。`Unit` は `Unit` という1つの値しか持たない型です。関数本体で `Unit` が返されることを明示的に宣言する必要はありません。つまり、`return` キーワードを使用したり、戻り値の型を宣言したりする必要はありません。

```kotlin
fun printMessage(message: String) {
    println(message)
    // `return Unit` または `return` はオプション（省略可能）です
}

fun main() {
    printMessage("Hello")
    // Hello
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-unit-function"}

## 単一式関数

コードをより簡潔にするために、単一式関数 (Single-expression functions) を使用できます。例えば、`sum()` 関数は短縮可能です。

```kotlin
fun sum(x: Int, y: Int): Int {
    return x + y
}

fun main() {
    println(sum(1, 2))
    // 3
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-simple-function-before"}

波括弧 `{}` を取り除き、代入演算子 `=` を使用して関数本体を宣言できます。代入演算子 `=` を使用する場合、Kotlinは型推論を行うため、戻り値の型を省略することもできます。これにより、`sum()` 関数は1行になります。

```kotlin
fun sum(x: Int, y: Int) = x + y

fun main() {
    println(sum(1, 2))
    // 3
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-simple-function-after"}

ただし、他の開発者がコードをすぐに理解できるようにしたい場合は、代入演算子 `=` を使用する場合でも、戻り値の型を明示的に定義するのが良い習慣です。

> 関数本体の宣言に `{}` 波括弧を使用する場合、戻り値の型が `Unit` でない限り、戻り値の型を宣言する必要があります。
> 
{style="note"}

## 関数内での早期リターン

関数のコードがある時点以降処理されないようにするには、`return` キーワードを使用します。この例では、条件式が真である場合に関数から早期リターン (Early return) するために `if` を使用しています。

```kotlin
// 登録済みユーザー名のリスト
val registeredUsernames = mutableListOf("john_doe", "jane_smith")

// 登録済みメールアドレスのリスト
val registeredEmails = mutableListOf("john@example.com", "jane@example.com")

fun registerUser(username: String, email: String): String {
    // ユーザー名が既に使用されている場合は早期リターン
    if (username in registeredUsernames) {
        return "Username already taken. Please choose a different username."
    }

    // メールアドレスが既に登録されている場合は早期リターン
    if (email in registeredEmails) {
        return "Email already registered. Please use a different email."
    }

    // ユーザー名とメールアドレスが使用されていない場合は登録を続行
    registeredUsernames.add(username)
    registeredEmails.add(email)

    return "User registered successfully: $username"
}

fun main() {
    println(registerUser("john_doe", "newjohn@example.com"))
    // Username already taken. Please choose a different username.
    println(registerUser("new_user", "newuser@example.com"))
    // User registered successfully: new_user
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-function-early-return"}

## 関数の練習

### 演習 1 {initial-collapse-state="collapsed" collapsible="true" id="functions-exercise-1"}

円の半径を整数形式でパラメータとして受け取り、その円の面積を出力する `circleArea` という名前の関数を作成してください。

> この演習では、`PI` を介して <math>π</math> の値にアクセスできるようにパッケージをインポートします。パッケージのインポートに関する詳細は、[パッケージとインポート](packages.md)を参照してください。
>
{style="tip"}

<deflist collapsible="true" id="kotlin-tour-functions-exercise-1-hint">
    <def title="ヒント">
        円の面積を計算する公式は <math>πr^2</math> です。ここで <math>r</math> は半径です。
    </def>
</deflist>

|---|---|
```kotlin
import kotlin.math.PI

// ここにコードを書いてください

fun main() {
    println(circleArea(2))
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-functions-exercise-1"}

|---|---|
```kotlin
import kotlin.math.PI

fun circleArea(radius: Int): Double {
    return PI * radius * radius
}

fun main() {
    println(circleArea(2)) // 12.566370614359172
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-functions-solution-1"}

### 演習 2 {initial-collapse-state="collapsed" collapsible="true" id="functions-exercise-2"}

前の演習の `circleArea` 関数を単一式関数として書き直してください。

|---|---|
```kotlin
import kotlin.math.PI

// ここにコードを書いてください

fun main() {
    println(circleArea(2))
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-functions-exercise-2"}

|---|---|
```kotlin
import kotlin.math.PI

fun circleArea(radius: Int): Double = PI * radius * radius

fun main() {
    println(circleArea(2)) // 12.566370614359172
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-functions-solution-2"}

### 演習 3 {initial-collapse-state="collapsed" collapsible="true" id="functions-exercise-3"}

時、分、秒で与えられた時間間隔を秒に変換する関数があります。多くの場合、1つか2つのパラメータのみを渡し、残りは0にする必要があります。デフォルト引数値と名前付き引数を使用して、コードが読みやすくなるように関数とその呼び出しコードを改善してください。

|---|---|
```kotlin
fun intervalInSeconds(hours: Int, minutes: Int, seconds: Int) =
    ((hours * 60) + minutes) * 60 + seconds

fun main() {
    println(intervalInSeconds(1, 20, 15))
    println(intervalInSeconds(0, 1, 25))
    println(intervalInSeconds(2, 0, 0))
    println(intervalInSeconds(0, 10, 0))
    println(intervalInSeconds(1, 0, 1))
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-functions-exercise-3"}

|---|---|
```kotlin
fun intervalInSeconds(hours: Int = 0, minutes: Int = 0, seconds: Int = 0) =
    ((hours * 60) + minutes) * 60 + seconds

fun main() {
    println(intervalInSeconds(1, 20, 15))
    println(intervalInSeconds(minutes = 1, seconds = 25))
    println(intervalInSeconds(hours = 2))
    println(intervalInSeconds(minutes = 10))
    println(intervalInSeconds(hours = 1, seconds = 1))
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-functions-solution-3"}

## ラムダ式

Kotlinでは、ラムダ式 (Lambda expressions) を使用することで、関数をさらに簡潔に記述できます。

例えば、次の `uppercaseString()` 関数を考えます：

```kotlin
fun uppercaseString(text: String): String {
    return text.uppercase()
}
fun main() {
    println(uppercaseString("hello"))
    // HELLO
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-function-before"}

これはラムダ式としても記述できます：

```kotlin
fun main() {
    val upperCaseString = { text: String -> text.uppercase() }
    println(upperCaseString("hello"))
    // HELLO
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-variable"}

ラムダ式は一見難しく見えるかもしれませんが、分解して説明しましょう。ラムダ式は波括弧 `{}` の中に記述されます。

ラムダ式の中には、以下を記述します：

* パラメータと、その後の `->`。
* `->` の後に関数本体。

前の例では：

* `text` は関数のパラメータです。
* `text` は `String` 型です。
* 関数は、`text` に対して呼び出された [`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase.html) 関数の結果を返します。
* ラムダ式全体が、代入演算子 `=` によって `upperCaseString` 変数に代入されています。
* ラムダ式は、変数 `upperCaseString` を関数のよう（関数オブジェクト）に使用し、文字列 `"hello"` をパラメータとして渡すことで呼び出されます。
* `println()` 関数が結果を出力します。

> パラメータのないラムダを宣言する場合、`->` を使用する必要はありません。例：
> ```kotlin
> { println("Log message") }
> ```
>
{style="note"}

ラムダ式はさまざまな方法で使用できます。以下のことが可能です：

* [ラムダ式を別の関数にパラメータとして渡す](#別の関数に渡す)
* [関数からラムダ式を返す](#関数から返す)
* [ラムダ式を単独で呼び出す](#単独で呼び出す)

### 別の関数に渡す

ラムダ式を関数に渡すのが便利な代表例は、コレクションに対して [`.filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html) 関数を使用する場合です。

```kotlin
fun main() {
    //sampleStart
    val numbers = listOf(1, -2, 3, -4, 5, -6)
    
    val positives = numbers.filter ({ x -> x > 0 })
    
    val isNegative = { x: Int -> x < 0 }
    val negatives = numbers.filter(isNegative)
    
    println(positives)
    // [1, 3, 5]
    println(negatives)
    // [-2, -4, -6]
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-filter"}

`.filter()` 関数は述語 (predicate) としてラムダ式を受け取り、それをリストの各要素に適用します。関数は、述語が `true` を返した要素のみを保持します。

* `{ x -> x > 0 }` は、要素が正の場合に `true` を返します。
* `{ x -> x < 0 }` は、要素が負の場合に `true` を返します。

この例では、ラムダ式を関数に渡す2つの方法を示しています。

* 正の数の場合、`.filter()` 関数内に直接ラムダ式を追加しています。
* 負の数の場合、ラムダ式を変数 `isNegative` に代入しています。その後、変数 `isNegative` が `.filter()` 関数の引数として使用されています。この場合、ラムダ式内の関数パラメータ (`x`) の型を指定する必要があります。

> ラムダ式が唯一の関数パラメータである場合、関数の丸括弧 `()` を省略できます：
> 
> ```kotlin
> val positives = numbers.filter { x -> x > 0 }
> ```
> 
> これは[後置ラムダ](#後置ラムダ)の一例であり、この章の最後で詳しく説明します。
>
{style="note"}

もう1つの良い例は、コレクション内のアイテムを変換するために [`.map()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map.html) 関数を使用することです。

```kotlin
fun main() {
    //sampleStart
    val numbers = listOf(1, -2, 3, -4, 5, -6)
    val doubled = numbers.map { x -> x * 2 }
    
    val isTripled = { x: Int -> x * 3 }
    val tripled = numbers.map(isTripled)
    
    println(doubled)
    // [2, -4, 6, -8, 10, -12]
    println(tripled)
    // [3, -6, 9, -12, 15, -18]
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-map"}

`.map()` 関数は、変換関数としてラムダ式を受け取ります。

* `{ x -> x * 2 }` は、リストの各要素を受け取り、その要素に2を掛けた値を返します。
* `{ x -> x * 3 }` は、リストの各要素を受け取り、その要素に3を掛けた値を返します。

### 関数型

関数からラムダ式を返せるようになる前に、まず**関数型** (Function types) を理解する必要があります。

基本の型についてはすでに学びましたが、関数自体も型を持っています。Kotlinの型推論は、パラメータの型から関数の型を推論できます。しかし、関数の型を明示的に指定する必要がある場合もあります。コンパイラは、その関数で何が許可され、何が許可されないかを知るために関数型を必要とします。

関数型の構文は以下の通りです：

* 各パラメータの型を丸括弧 `()` 内に書き、カンマ `,` で区切ります。
* 戻り値の型を `->` の後に書きます。

例：`(String) -> String` や `(Int, Int) -> Int`。

`upperCaseString()` の関数型を定義すると、ラムダ式は以下のようになります：

```kotlin
val upperCaseString: (String) -> String = { text -> text.uppercase() }

fun main() {
    println(upperCaseString("hello"))
    // HELLO
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-function-type"}

ラムダ式にパラメータがない場合、丸括弧 `()` は空のままにします。例：`() -> Unit`

> パラメータと戻り値の型は、ラムダ式内か関数型として宣言する必要があります。そうしないと、コンパイラはラムダ式の型を特定できません。
> 
> 例えば、以下は動作しません：
> 
> `val upperCaseString = { str -> str.uppercase() }`
>
{style="note"}

### 関数から返す

ラムダ式は関数から返すことができます。コンパイラが返されるラムダ式の型を理解できるように、関数型を宣言する必要があります。

以下の例では、`toSeconds()` 関数は常に `Int` 型のパラメータを受け取り `Int` 値を返すラムダ式を返すため、関数型は `(Int) -> Int` です。

この例では、`toSeconds()` が呼び出されたときにどのラムダ式を返すかを決定するために `when` 式を使用しています：

```kotlin
fun toSeconds(time: String): (Int) -> Int = when (time) {
    "hour" -> { value -> value * 60 * 60 }
    "minute" -> { value -> value * 60 }
    "second" -> { value -> value }
    else -> { value -> value }
}

fun main() {
    val timesInMinutes = listOf(2, 10, 15, 1)
    val min2sec = toSeconds("minute")
    val totalTimeInSeconds = timesInMinutes.map(min2sec).sum()
    println("Total time is $totalTimeInSeconds secs")
    // Total time is 1680 secs
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-return-from-function"}

### 単独で呼び出す

ラムダ式は、波括弧 `{}` の後に丸括弧 `()` を付け、その中にパラメータを入れることで、単独で呼び出すことができます。

```kotlin
fun main() {
    //sampleStart
    println({ text: String -> text.uppercase() }("hello"))
    // HELLO
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambda-standalone"}

### 後置ラムダ

すでに見たように、ラムダ式が唯一の関数パラメータである場合、関数の丸括弧 `()` を省略できます。ラムダ式が関数の最後のパラメータとして渡される場合、その式を関数の丸括弧 `()` の外に記述できます。どちらの場合も、この構文は**後置ラムダ** (Trailing lambda) と呼ばれます。

例えば、[`.fold()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/fold.html) 関数は初期値と演算を受け取ります：

```kotlin
fun main() {
    //sampleStart
    // 初期値は0。 
    // 演算は、初期値とリストの各アイテムを累積的に加算します。
    println(listOf(1, 2, 3).fold(0, { x, item -> x + item })) // 6

    // あるいは、後置ラムダの形式で
    println(listOf(1, 2, 3).fold(0) { x, item -> x + item })  // 6
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-trailing-lambda"}

ラムダ式の詳細については、[ラムダ式と匿名関数](lambdas.md#lambda-expressions-and-anonymous-functions)を参照してください。

ツアーの次のステップは、Kotlinの[クラス](kotlin-tour-classes.md)について学ぶことです。

## ラムダ式の練習

### 演習 1 {initial-collapse-state="collapsed" collapsible="true" id="lambdas-exercise-1"}

ウェブサービスでサポートされているアクションのリスト、すべてのリクエストに共通のプレフィックス、および特定のリソースのIDがあります。IDが5のリソースに対してアクション `title` をリクエストするには、次のURLを作成する必要があります：`https://example.com/book-info/5/title`。ラムダ式を使用して、アクションのリストからURLのリストを作成してください。

|---|---|
```kotlin
fun main() {
    val actions = listOf("title", "year", "author")
    val prefix = "https://example.com/book-info"
    val id = 5
    val urls = // ここにコードを書いてください
    println(urls)
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambdas-exercise-1"}

|---|---|
```kotlin
fun main() {
    val actions = listOf("title", "year", "author")
    val prefix = "https://example.com/book-info"
    val id = 5
    val urls = actions.map { action -> "$prefix/$id/$action" }
    println(urls)
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-lambdas-solution-1"}

### 演習 2 {initial-collapse-state="collapsed" collapsible="true" id="lambdas-exercise-2"}

`Int` 値とアクション（型が `() -> Unit` の関数）を受け取り、そのアクションを指定された回数繰り返す関数を書いてください。次に、この関数を使用して "Hello" を 5 回出力してください。

|---|---|
```kotlin
fun repeatN(n: Int, action: () -> Unit) {
    // ここにコードを書いてください
}

fun main() {
    // ここにコードを書いてください
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-lambdas-exercise-2"}

|---|---|
```kotlin
fun repeatN(n: Int, action: () -> Unit) {
    for (i in 1..n) {
        action()
    }
}

fun main() {
    repeatN(5) {
        println("Hello")
    }
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-lambdas-solution-2"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-control-flow.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-classes.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>