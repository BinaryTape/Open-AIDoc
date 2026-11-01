[//]: # (title: 関数)

<no-index/>

Kotlinでは、`fun` キーワードを使用して独自の関数を宣言できます。

```kotlin
fun hello() {
    return println("Hello, world!")
}

fun main() {
    hello()
    // Hello, world!
}
```
{kotlin-runnable="true" id="kotlin-tour-function-demo"}

Kotlinにおける関数の特徴：

* 関数のパラメータは丸括弧 `()` 内に記述します。
* 各パラメータには型が必要であり、複数のパラメータはカンマ `,` で区切る必要があります。
* 戻り値の型は、関数の丸括弧 `()` の後にコロン `:` で区切って記述します。
* 関数の本体（ボディ）は中括弧 `{}` 内に記述します。
* `return` キーワードは、関数を終了したり、関数から値を返したりするために使用します。

> 関数が有用な値を返さない場合、戻り値の型と `return` キーワードは省略できます。詳細については、[戻り値のない関数](#functions-without-return)を参照してください。
>
{style="note"}

次の例では：

* `x` と `y` は関数のパラメータです。
* `x` と `y` は `Int` 型です。
* 関数の戻り値の型は `Int` です。
* この関数は呼び出されると、`x` と `y` の合計を返します。

```kotlin
fun sum(x: Int, y: Int): Int {
    return x + y
}

fun main() {
    println(sum(1, 2))
    // 3
}
```
{kotlin-runnable="true" id="kotlin-tour-simple-function"}

> [コーディング規約](coding-conventions.md#function-names)では、関数名を小文字で始め、アンダースコアを使用しないキャメルケース（camelCase）にすることを推奨しています。
> 
{style="note"}

## 名前付き引数 {id="named-arguments"}

コードを簡潔にするため、関数を呼び出す際にパラメータ名を含める必要はありません。しかし、パラメータ名を含めるとコードが読みやすくなります。これは**名前付き引数**（named arguments）の使用と呼ばれます。パラメータ名を含める場合、パラメータを任意の順序で記述できます。

> 次の例では、[文字列テンプレート](strings.md#string-templates)（`$`）を使用してパラメータの値にアクセスし、それらを `String` 型に変換した上で、出力用の文字列に連結しています。
> 
{style="tip"}

```kotlin
fun printMessageWithPrefix(message: String, prefix: String) {
    println("[$prefix] $message")
}

fun main() {
    // パラメータの順序を入れ替えて名前付き引数を使用
    printMessageWithPrefix(prefix = "Log", message = "Hello")
    // [Log] Hello
}
```
{kotlin-runnable="true" id="kotlin-tour-named-arguments-function"}

## デフォルト引数値 {id="default-parameter-values"}

関数のパラメータにはデフォルト値を定義できます。デフォルト値を持つパラメータは、関数の呼び出し時に省略できます。デフォルト値を宣言するには、型の後に代入演算子 `=` を使用します。

```kotlin
fun printMessageWithPrefix(message: String, prefix: String = "Info") {
    println("[$prefix] $message")
}

fun main() {
    // 両方のパラメータを指定して関数を呼び出し
    printMessageWithPrefix("Hello", "Log") 
    // [Log] Hello
    
    // messageパラメータのみを指定して関数を呼び出し
    printMessageWithPrefix("Hello")        
    // [Info] Hello
    
    printMessageWithPrefix(prefix = "Log", message = "Hello")
    // [Log] Hello
}
```
{kotlin-runnable="true" id="kotlin-tour-default-param-function"}

> デフォルト値を持つ特定のパラメータのみをスキップし、他のパラメータを省略しないことも可能です。ただし、最初にスキップしたパラメータ以降のパラメータは、すべて名前を指定して呼び出す必要があります。
>
{style="note"}

## 戻り値のない関数 {id="functions-without-return"}

関数が有用な値を返さない場合、その戻り値の型は `Unit` になります。`Unit` は1つの値（`Unit`）しか持たない型です。関数本体で `Unit` が返されることを明示的に宣言する必要はありません。つまり、`return` キーワードを使用したり、戻り値の型を宣言したりする必要はありません。

```kotlin
fun printMessage(message: String) {
    println(message)
    // `return Unit` または `return` は任意です
}

fun main() {
    printMessage("Hello")
    // Hello
}
```
{kotlin-runnable="true" id="kotlin-tour-unit-function"}

## 単一式関数 {id="single-expression-functions"}

コードをより簡潔にするために、単一式関数（single-expression functions）を使用できます。例えば、`sum()` 関数は短縮できます。

```kotlin
fun sum(x: Int, y: Int): Int {
    return x + y
}

fun main() {
    println(sum(1, 2))
    // 3
}
```
{kotlin-runnable="true" id="kotlin-tour-simple-function-before"}

中括弧 `{}` を削除し、代入演算子 `=` を使用して関数本体を宣言できます。代入演算子 `=` を使用すると、Kotlinは型推論を行うため、戻り値の型も省略できます。これにより、`sum()` 関数は1行になります。

```kotlin
fun sum(x: Int, y: Int) = x + y

fun main() {
    println(sum(1, 2))
    // 3
}
```
{kotlin-runnable="true" id="kotlin-tour-simple-function-after"}

ただし、他の開発者がコードを素早く理解できるようにしたい場合は、代入演算子 `=` を使用する場合でも戻り値の型を明示的に定義することをお勧めします。

> 中括弧 `{}` を使用して関数本体を宣言する場合は、`Unit` 型でない限り戻り値の型を宣言する必要があります。
> 
{style="note"}

## 関数における早期リターン {id="early-returns-in-functions"}

関数のコードがある特定のポイント以降処理されないようにするには、`return` キーワードを使用します。この例では、条件式が真（true）と判定された場合に関数から早期リターン（early return）するために `if` を使用しています。

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

    // ユーザー名とメールアドレスが使用されていなければ登録を処理
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
{kotlin-runnable="true" id="kotlin-tour-function-early-return"}

## 練習問題：関数 {id="practice-functions"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="円の面積を計算する" id="functions-exercise-1">

整数の半径をパラメータとして受け取り、その円の面積を出力する `circleArea` という関数を作成してください。

> この練習問題では、`PI` を介して <math>π</math> の値にアクセスできるようにパッケージをインポートします。パッケージのインポートに関する詳細は、[パッケージとインポート](packages.md)を参照してください。
>
{style="tip"}

<deflist collapsible="true" id="kotlin-tour-functions-exercise-1-hint">
    <def title="ヒント">
        円の面積を計算する公式は <math>πr^2</math> です。ここで <math>r</math> は半径です。
    </def>
</deflist>

```kotlin
import kotlin.math.PI

// ここにコードを書いてください

fun main() {
    println(circleArea(2))
}
```
{validate="false" kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/CircleAreaTest.kt" id="kotlin-tour-functions-exercise-1"}

```kotlin
import kotlin.math.PI

fun circleArea(radius: Int): Double {
    return PI * radius * radius
}

fun main() {
    println(circleArea(2)) // 12.566370614359172
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/CircleAreaTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-functions-solution-1"}

</def>
<def title="単一式関数として書き直す" id="functions-exercise-2">

前の練習問題の `circleArea` 関数を単一式関数として書き直してください。

```kotlin
import kotlin.math.PI

//sampleStart
// ここにコードを書いてください
//sampleEnd

fun main() {
    println(circleArea(2))
}
```
{validate="false" kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/CircleAreaTest.kt" folded-button="false" id="kotlin-tour-functions-exercise-2"}

```kotlin
import kotlin.math.PI

fun circleArea(radius: Int): Double = PI * radius * radius

fun main() {
    println(circleArea(2)) // 12.566370614359172
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/CircleAreaTest.kt" folded-button="false" initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-functions-solution-2"}

</def>
<def title="デフォルト引数と名前付き引数を使用して関数をリファクタリングする" id="functions-exercise-3">

時間、分、秒で指定された時間間隔を秒に変換する関数があります。多くの場合、渡す必要があるパラメータは1つか2つだけで、残りは0になります。コードを読みやすくするために、デフォルト引数値と名前付き引数を使用して、この関数とそれを呼び出すコードを改善してください。

```kotlin
// この関数をリファクタリングする：hours、minutes、secondsにデフォルト値0を指定する
fun intervalInSeconds(hours: Int, minutes: Int, seconds: Int) =
    ((hours * 60) + minutes) * 60 + seconds

fun main() {
    // 可能な場合は名前付き引数を使用してこれらの呼び出しを簡潔にする
    println(intervalInSeconds(1, 20, 15))
    println(intervalInSeconds(0, 1, 25))
    println(intervalInSeconds(2, 0, 0))
    println(intervalInSeconds(0, 10, 0))
    println(intervalInSeconds(1, 0, 1))
}
```
{validate="false" kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/IntervalInSecondsTest.kt" id="kotlin-tour-functions-exercise-3"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/IntervalInSecondsTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-functions-solution-3"}

</def>
</deflist>

## ラムダ式 {id="lambda-expressions"}

Kotlinでは、ラムダ式を使用することで、関数をさらに簡潔に記述できます。

例えば、次の `uppercaseString()` 関数は：

```kotlin
fun uppercaseString(text: String): String {
    return text.uppercase()
}
fun main() {
    println(uppercaseString("hello"))
    // HELLO
}
```
{kotlin-runnable="true" id="kotlin-tour-lambda-function-before"}

ラムダ式として記述することもできます。

```kotlin
fun main() {
    val upperCaseString = { text: String -> text.uppercase() }
    println(upperCaseString("hello"))
    // HELLO
}
```
{kotlin-runnable="true" id="kotlin-tour-lambda-variable"}

ラムダ式は一見すると理解しづらいかもしれませんので、分解して見ていきましょう。ラムダ式は中括弧 `{}` 内に記述します。

ラムダ式の中には、次のように記述します。

* パラメータと、それに続く `->`。
* `->` の後に関数本体。

先ほどの例では：

* `text` は関数のパラメータです。
* `text` は `String` 型です。
* この関数は、`text` に対して呼び出された [`.uppercase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/uppercase.html) 関数の結果を返します。
* ラムダ式全体が、代入演算子 `=` によって `upperCaseString` 変数に代入されています。
* ラムダ式は、変数 `upperCaseString` を関数のように使い、文字列 `"hello"` をパラメータとして渡すことで呼び出されます。
* `println()` 関数が結果を出力します。

> パラメータのないラムダを宣言する場合、`->` を使用する必要はありません。例えば：
> ```kotlin
> { println("Log message") }
> ```
>
{style="note"}

ラムダ式はさまざまな方法で使用できます。以下のことが可能です。

* [ラムダ式を別の関数にパラメータとして渡す](#pass-to-another-function)
* [関数からラムダ式を返す](#return-from-a-function)
* [ラムダ式を単独で呼び出す](#invoke-separately)

### 別の関数への受け渡し {id="pass-to-another-function"}

ラムダ式を関数に渡すと便利な好例として、コレクションに対する [`.filter()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/filter.html) 関数の使用が挙げられます。

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
{kotlin-runnable="true" id="kotlin-tour-lambda-filter"}

`.filter()` 関数は、条件述語（述語）としてラムダ式を受け取り、リストの各要素にそれを適用します。この関数は、条件述語が `true` を返した要素のみを保持します。

* `{ x -> x > 0 }` は、要素が正の場合に `true` を返します。
* `{ x -> x < 0 }` は、要素が負の場合に `true` を返します。

この例は、ラムダ式を関数に渡す2つの方法を示しています。

* 正の数の場合、例では `.filter()` 関数内に直接ラムダ式を記述しています。
* 負の数の場合、例ではラムダ式を変数 `isNegative` に代入しています。その後、`isNegative` 変数を `.filter()` 関数のパラメータとして使用しています。この場合、ラムダ式内の関数パラメータ（`x`）の型を指定する必要があります。

> ラムダ式が関数唯一のパラメータである場合、関数の丸括弧 `()` を省略できます。
> 
> ```kotlin
> val positives = numbers.filter { x -> x > 0 }
> ```
> 
> これは[末尾ラムダ](#trailing-lambdas)の例であり、本章の最後で詳しく説明します。
>
{style="note"}

もう1つの好例は、コレクション内の要素を変換する [`.map()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/map.html) 関数の使用です。

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
{kotlin-runnable="true" id="kotlin-tour-lambda-map"}

`.map()` 関数は、変換関数としてラムダ式を受け取ります。

* `{ x -> x * 2 }` はリストの各要素を受け取り、その要素を2倍した値を返します。
* `{ x -> x * 3 }` はリストの各要素を受け取り、その要素を3倍した値を返します。

### 関数型 {id="function-types"}

関数からラムダ式を返せるようにするには、まず**関数型**（function types）を理解する必要があります。

基本的な型についてはすでに学びましたが、関数自体にも型があります。Kotlinの型推論は、パラメータの型から関数の型を推論できます。ただし、関数型を明示的に指定する必要がある場合もあります。コンパイラはその関数に対して何が許可され、何が許可されないのかを把握するために関数型を必要とします。

関数型の構文は以下のとおりです。

* 各パラメータの型を丸括弧 `()` 内にカンマ `,` で区切って記述します。
* `->` の後に戻り値の型を記述します。

例えば、`(String) -> String` や `(Int, Int) -> Int` のようになります。

`upperCaseString()` の関数型を定義した場合、ラムダ式は次のようになります。

```kotlin
val upperCaseString: (String) -> String = { text -> text.uppercase() }

fun main() {
    println(upperCaseString("hello"))
    // HELLO
}
```
{kotlin-runnable="true" id="kotlin-tour-lambda-function-type"}

ラムダ式にパラメータがない場合、丸括弧 `()` は空のままにします。例：`() -> Unit`

> パラメータと戻り値の型は、ラムダ式内または関数型としてのいずれかで宣言する必要があります。そうしないと、コンパイラはラムダ式がどのような型であるかを認識できません。
> 
> 例えば、以下のような記述は機能しません。
> 
> `val upperCaseString = { str -> str.uppercase() }`
>
{style="note"}

### 関数から返す {id="return-from-a-function"}

ラムダ式は関数から返すことができます。コンパイラが返されたラムダ式の型を理解できるように、関数型を宣言する必要があります。

次の例では、`toSeconds()` 関数は `Int` 型のパラメータを受け取り `Int` の値を返すラムダ式を常に返すため、関数型は `(Int) -> Int` になります。

この例では、`when` 式を使用して、`toSeconds()` が呼び出されたときにどのラムダ式を返すかを決定しています。

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
{kotlin-runnable="true" id="kotlin-tour-lambda-return-from-function"}

### 単独での呼び出し {id="invoke-separately"}

ラムダ式は、中括弧 `{}` の後に丸括弧 `()` を追加し、括弧内に引数を含めることで、単独で呼び出すことができます。

```kotlin
fun main() {
    //sampleStart
    println({ text: String -> text.uppercase() }("hello"))
    // HELLO
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-lambda-standalone"}

### 末尾ラムダ {id="trailing-lambdas"}

すでに見てきたように、ラムダ式が関数の唯一のパラメータである場合、関数の丸括弧 `()` を省略できます。ラムダ式が関数の最後のパラメータとして渡される場合、その式を関数の丸括弧 `()` の外側に記述できます。どちらの場合も、この構文は**末尾ラムダ**（trailing lambda）と呼ばれます。

例えば、[`.fold()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.sequences/fold.html) 関数は初期値と操作（operation）を受け取ります。

```kotlin
fun main() {
    //sampleStart
    // 初期値は0です。 
    // この操作により、初期値にリストの各要素が累積加算されます。
    println(listOf(1, 2, 3).fold(0, { x, item -> x + item })) // 6

    // または、末尾ラムダの形式で記述することもできます
    println(listOf(1, 2, 3).fold(0) { x, item -> x + item })  // 6
    //sampleEnd
}
```
{kotlin-runnable="true" id="kotlin-tour-trailing-lambda"}

ラムダ式の詳細については、[ラムダ式と匿名関数](lambdas.md#lambda-expressions-and-anonymous-functions)を参照してください。

ツアーの次のステップでは、Kotlinの[クラス](kotlin-tour-classes.md)について学びます。

## 練習問題：ラムダ式 {completion-point="true" id="practice-lambda-expressions"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="ラムダ式を使用してURLのリストを作成する" id="lambdas-exercise-1">

Webサービスでサポートされているアクションのリスト、すべてのリクエストに共通のプレフィックス、および特定のリソースのIDがあります。
ID: 5 のリソースに対してアクション `title` をリクエストするには、`https://example.com/book-info/5/title` というURLを作成する必要があります。
ラムダ式を使用して、アクションのリストからURLのリストを作成してください。

```kotlin
fun buildUrls(actions: List<String>, prefix: String, id: Int): List<String> {
    return TODO() // ここにコードを書いてください
}

fun main() {
    val actions = listOf("title", "year", "author")
    val urls = buildUrls(actions, "https://example.com/book-info", 5)
    println(urls)
}
```
{validate="false" kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/LambdasExercise1Test.kt" id="kotlin-tour-lambdas-exercise-1"}

```kotlin
fun buildUrls(actions: List<String>, prefix: String, id: Int): List<String> {
    return actions.map { action -> "$prefix/$id/$action" }
}

fun main() {
    val actions = listOf("title", "year", "author")
    val urls = buildUrls(actions, "https://example.com/book-info", 5)
    println(urls)
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/LambdasExercise1Test.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-lambdas-solution-1"}

</def>
<def title="アクションを複数回繰り返す" id="lambdas-exercise-2">

`Int` の値とアクション（型が `() -> Unit` の関数）を受け取り、そのアクションを指定された回数だけ繰り返す関数を作成してください。その後、この関数を使用して「Hello」を5回出力してください。

```kotlin
fun repeatN(n: Int, action: () -> Unit) {
    // ここにコードを書いてください
}

fun main() {
    // ここにコードを書いてください
}
```
{validate="false" kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/LambdasExercise2Test.kt" id="kotlin-tour-lambdas-exercise-2"}

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
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/basics/LambdasExercise2Test.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-lambdas-solution-2"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-control-flow.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-classes.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>