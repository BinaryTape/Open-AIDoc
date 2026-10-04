[//]: # (title: 拡張関数)

<no-index/>

この章では、コードをより簡潔で読みやすくする Kotlin の特別な関数について学びます。これらが効率的なデザインパターンの活用にどのように役立ち、プロジェクトを次のレベルへと引き上げるかを見ていきましょう。

## 拡張関数 {id="extension-functions"}

ソフトウェア開発では、元のソースコードを変更することなくプログラムの動作を変更したい場面がよくあります。
例えば、サードパーティライブラリのクラスに追加機能を持たせたい場合などです。

これは、クラスを拡張する _拡張関数 (extension functions)_ を追加することで実現できます。拡張関数の呼び出しは、ピリオド `.` を使い、クラスのメンバー関数を呼び出すのとまったく同じ方法で行います。

拡張関数の完全な構文を紹介する前に、まず **レシーバー (receiver)** とは何かを理解する必要があります。
レシーバーとは、その関数が呼び出される対象のことです。言い換えれば、レシーバーは情報の共有先や共有相手となる対象です。

![送信者とレシーバーの例](receiver-highlight.png){width="500"}

この例では、`main()` 関数が [`.first()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first.html) 関数を呼び出してリストの最初の要素を返しています。
`.first()` 関数は `readOnlyShapes` 変数**に対して**呼び出されているため、`readOnlyShapes` 変数がレシーバーとなります。

拡張関数を作成するには、拡張したいクラス名に続けて `.` と関数名を記述します。続けて、パラメータや戻り値の型を含む、関数の残りの宣言を記述します。

例:

```kotlin
fun String.bold(): String = "<b>$this</b>"

fun main() {
    // "hello" がレシーバー
    println("hello".bold())
    // <b>hello</b>
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-extension-function"}

この例では:

* `String` が拡張されるクラスです。
* `bold` が拡張関数の名前です。
* `.bold()` 拡張関数の戻り値の型は `String` です。
* `String` のインスタンスである `"hello"` がレシーバーです。
* レシーバーは、関数本体の内部で[キーワード](keyword-reference.md) `this` を使ってアクセスされます。
* `this` の値にアクセスするために文字列テンプレート (`$`) が使用されています。
* `.bold()` 拡張関数は文字列を受け取り、それを太字テキスト用の `<b>` HTML 要素で囲んで返します。

## 拡張指向設計 (Extension-oriented design) {id="extension-oriented-design"}

拡張関数はどこででも定義できるため、拡張指向設計 (extension-oriented design) を実現できます。このアプローチでは、コアとなる機能と、便利ではあるものの必須ではない機能とを分離できるため、コードが読みやすく、保守しやすくなります。

良い例として、ネットワークリクエストの実行をサポートする Ktor ライブラリの [`HttpClient`](https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html) クラスがあります。その機能のコアは、HTTP リクエストに必要なすべての情報を受け取る単一の関数 `request()` です。

```kotlin
class HttpClient {
    fun request(method: String, url: String, headers: Map<String, String>): HttpResponse {
        // ネットワークコード
    }
}
```
{validate="false"}

実際には、最もよく使われる HTTP リクエストは GET や POST リクエストです。ライブラリがこれらの一般的なユースケースに対して、より短い名前の関数を提供するのは理にかなっています。しかし、これらは新しいネットワークコードを書く必要はなく、特定の引数でリクエストを呼び出すだけで済みます。
言い換えれば、独立した `.get()` や `.post()` 拡張関数として定義するのに最適です。

```kotlin
fun HttpClient.get(url: String): HttpResponse = request("GET", url, emptyMap())
fun HttpClient.post(url: String): HttpResponse = request("POST", url, emptyMap())
```
{validate="false"}

これらの `.get()` および `.post()` 関数は `HttpClient` クラスを拡張しています。これらは `HttpClient` クラスのインスタンスをレシーバーとして呼び出されるため、`HttpClient` クラスの `request()` 関数を直接利用できます。これらの拡張関数を使用して適切な HTTP メソッドで `request()` 関数を呼び出すことで、コードがシンプルになり、理解しやすくなります。

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

    // request() を直接使って GET リクエストを送信
    val getResponseWithMember = client.request("GET", "https://example.com", emptyMap())

    // get() 拡張関数を使って GET リクエストを送信
    // client インスタンスがレシーバー
    val getResponseWithExtension = client.get("https://example.com")
}
```
{validate="false"}

この拡張指向のアプローチは、Kotlin の[標準ライブラリ](https://kotlinlang.org/api/latest/jvm/stdlib/)や他のライブラリでも広く使われています。例えば、`String` クラスには文字列の操作を支援する多くの[拡張関数](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/#extension-functions)が用意されています。

拡張関数に関する詳細情報は、[拡張 (Extensions)](extensions.md) を参照してください。

## 練習問題 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="整数が正であるかどうかを判定する" id="extension-functions-exercise-1">

整数を受け取り、それが正であるかどうかを判定する `isPositive` という拡張関数を記述してください。

```kotlin
fun Int.// ここにコードを書いてください

fun main() {
    println(1.isPositive())
    // true
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-extension-functions-exercise-1"}

```kotlin
fun Int.isPositive(): Boolean = this > 0

fun main() {
    println(1.isPositive())
    // true
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-extension-functions-solution-1"}

</def>
<def title="文字列を小文字に変換する" id="extension-functions-exercise-2">

文字列を受け取り、その小文字バージョンを返す `toLowercaseString` という拡張関数を記述してください。

<deflist collapsible="true">
    <def title="ヒント">
        <code>String</code> 型の <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/lowercase.html"> <code>.lowercase()</code>
        </a> 関数を使用してください。
    </def>
</deflist>

```kotlin
fun // ここにコードを書いてください

fun main() {
    println("Hello World!".toLowercaseString())
    // hello world!
}
```
{validate="false" kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-tour-extension-functions-exercise-2"}

```kotlin
fun String.toLowercaseString(): String = this.lowercase()

fun main() {
    println("Hello World!".toLowercaseString())
    // hello world!
}
```
{initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-extension-functions-solution-2"}

</def>
</deflist>

<seealso></seealso>

<list columns="2" id="tour-nav">
  <li>
    <a as="button" href="kotlin-tour-null-safety.md" mode="outline" icon="arrow-left" icon-position="left">前のステップ</a>
  </li>
  <li>
    <a as="button" href="kotlin-tour-intermediate-scope-functions.md" mode="classic" icon="arrow-right" icon-position="right">次のステップ</a>
  </li>
</list>