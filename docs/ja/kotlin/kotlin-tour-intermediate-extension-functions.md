[//]: # (title: 拡張関数)

<no-index/>

この章では、コードをより簡潔で読みやすくするKotlinの特殊な関数について学習します。プロジェクトを次のレベルに引き上げるために、効率的なデザインパターンを使用するのにこれらがどのように役立つかを学びましょう。

## 拡張関数

ソフトウェア開発では、元のソースコードを変更せずにプログラムの動作を変更したいことがよくあります。例えば、サードパーティ製ライブラリのクラスに機能を追加したい場合などです。

これを行うには、クラスを拡張するための *拡張関数* (extension functions) を追加します。拡張関数は、ドット `.` を使用して、クラスのメンバ関数を呼び出すのと同じ方法で呼び出します。

拡張関数の完全な構文を紹介する前に、**レシーバー** (receiver) とは何かを理解する必要があります。レシーバーとは、その関数が呼び出される対象のことです。言い換えれば、レシーバーは情報が共有される場所や相手を指します。

![送信者とレシーバーの例](receiver-highlight.png){width="500"}

この例では、`main()` 関数が [`.first()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first.html) 関数を呼び出して、リストの最初の要素を返しています。`.first()` 関数は `readOnlyShapes` 変数に**対して**呼び出されているため、`readOnlyShapes` 変数がレシーバーとなります。

拡張関数を作成するには、拡張したいクラス名の後に `.` と関数名を記述します。その後に、引数や戻り値の型を含む関数宣言の残りの部分を続けます。

例えば：

```kotlin
fun String.bold(): String = "<b>$this</b>"

fun main() {
    // "hello" がレシーバーです
    println("hello".bold())
    // <b>hello</b>
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-extension-function"}

この例では：

* `String` は拡張されるクラスです。
* `bold` は拡張関数の名前です。 
* `.bold()` 拡張関数の戻り値の型は `String` です。
* `String` のインスタンスである `"hello"` がレシーバーとなります。
* レシーバーは、[キーワード](keyword-reference.md) `this` を使用してボディ内でアクセスされます。
* 文字列テンプレート (`$this`) が `this` の値にアクセスするために使用されます。
* `.bold()` 拡張関数は文字列を受け取り、それを太字用の `<b>` HTML要素で囲んで返します。

## 拡張指向のデザイン

拡張関数はどこにでも定義できるため、拡張指向のデザイン（extension-oriented designs）を作成できます。これらのデザインは、コア機能と、便利ではあるが必須ではない機能を分離し、コードの読みやすさとメンテナンス性を向上させます。

良い例は、ネットワークリクエストの実行を支援するKtorライブラリの [`HttpClient`](https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html) クラスです。その機能の核となるのは、HTTPリクエストに必要なすべての情報を受け取る単一の関数 `request()` です。

```kotlin
class HttpClient {
    fun request(method: String, url: String, headers: Map<String, String>): HttpResponse {
        // ネットワークコード
    }
}
```
{validate="false"}

実際には、最も一般的なHTTPリクエストは GET または POST リクエストです。ライブラリがこれらの一般的なユースケースに対して、より短い名前を提供することは理にかなっています。しかし、これらは新しいネットワークコードを書く必要はなく、特定の `request` 呼び出しを行うだけです。言い換えれば、これらは個別の `.get()` および `.post()` 拡張関数として定義するのに最適な候補です。

```kotlin
fun HttpClient.get(url: String): HttpResponse = request("GET", url, emptyMap())
fun HttpClient.post(url: String): HttpResponse = request("POST", url, emptyMap())
```
{validate="false"}

これらの `.get()` および `.post()` 関数は `HttpClient` クラスを拡張します。これらは `HttpClient` クラスのインスタンスをレシーバーとして呼び出されるため、`HttpClient` クラスの `request()` 関数を直接使用できます。これらの拡張関数を使用して、適切なHTTPメソッドで `request()` 関数を呼び出すことができ、コードが簡素化され理解しやすくなります。

```kotlin
class HttpClient {
    fun request(method: String, url: String, headers: Map<String, String>): HttpResponse {
        println("Requesting $method to $url with headers: $headers")
        return HttpResponse("Response from $url")
    }
}

fun HttpClient.get(url: String): HttpResponse = request("GET", url, emptyMap())

fun main() {
    val client = HttpClient()

    // request() を直接使用して GET リクエストを行う
    val getResponseWithMember = client.request("GET", "https://example.com", emptyMap())

    // get() 拡張関数を使用して GET リクエストを行う
    // client インスタンスがレシーバーです
    val getResponseWithExtension = client.get("https://example.com")
}
```
{validate="false"}

この拡張指向のアプローチは、Kotlinの[標準ライブラリ](https://kotlinlang.org/api/latest/jvm/stdlib/)や他のライブラリで広く使用されています。例えば、`String` クラスには、文字列の操作を支援する多くの[拡張関数](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/#extension-functions)があります。

拡張関数の詳細については、[Extensions](extensions.md) を参照してください。

## 練習問題 {completion-point="true"}

### 練習問題 1 {initial-collapse-state="collapsed" collapsible="true" id="extension-functions-exercise-1"}

整数を受け取り、それが正の数かどうかをチェックする `isPositive` という名前の拡張関数を記述してください。

|---|---|
```kotlin
fun Int.// ここにコードを書いてください

fun main() {
    println(1.isPositive())
    // true
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-extension-functions-exercise-1"}

|---|---|
```kotlin
fun Int.isPositive(): Boolean = this > 0

fun main() {
    println(1.isPositive())
    // true
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-extension-functions-solution-1"}

### 練習問題 2 {initial-collapse-state="collapsed" collapsible="true" id="extension-functions-exercise-2"}

文字列を受け取り、小文字に変換したバージョンを返す `toLowercaseString` という名前の拡張関数を記述してください。

<deflist collapsible="true">
    <def title="ヒント">
        <code>String</code> 型の <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/lowercase.html"> <code>.lowercase()</code>
        </a> 関数を使用してください。 
    </def>
</deflist>

|---|---|
```kotlin
fun // ここにコードを書いてください

fun main() {
    println("Hello World!".toLowercaseString())
    // hello world!
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-extension-functions-exercise-2"}

|---|---|
```kotlin
fun String.toLowercaseString(): String = this.lowercase()

fun main() {
    println("Hello World!".toLowercaseString())
    // hello world!
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-extension-functions-solution-2"}

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-null-safety.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-scope-functions.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>