[//]: # (title: 拡張関数)

<no-index/>

この章では、コードをより簡潔で読みやすくするKotlinの特別な関数について見ていきます。これらが効率的なデザインパターンを活用し、プロジェクトを次のレベルへと引き上げるのにどのように役立つかを学びましょう。

## 拡張関数 {id="extension-functions"}

ソフトウェア開発では、元のソースコードを変更することなくプログラムの動作を変更したい場面がよくあります。例えば、サードパーティ製ライブラリのクラスに追加機能を持たせたい場合などです。

これは、クラスを拡張する _拡張関数 (extension functions)_ を追加することで実現できます。拡張関数は、ピリオド `.` を使用して、クラスのメンバ関数を呼び出すのと同じ方法で呼び出します。

拡張関数の完全な構文を紹介する前に、**レシーバ (receiver)** とは何かを理解する必要があります。レシーバとは、関数が呼び出される対象のことです。言い換えれば、レシーバは情報が共有される場所や相手のことです。

![送信側とレシーバの例](receiver-highlight.png){width="500"}

この例では、`main()` 関数が [`.first()`](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/first.html) 関数を呼び出してリストの最初の要素を返します。`.first()` 関数は `readOnlyShapes` 変数に**対して**呼び出されるため、`readOnlyShapes` 変数がレシーバになります。

拡張関数を作成するには、拡張したいクラス名に続けて `.` と関数名を記述します。その後は、パラメータや戻り値の型を含む残りの関数宣言を続けます。

例:

```kotlin
fun String.bold(): String = "<b>$this</b>"

fun main() {
    // "hello" がレシーバ
    println("hello".bold())
    // <b>hello</b>
}
```
{kotlin-runnable="true" id="kotlin-tour-extension-function"}

この例では:

* `String` が拡張されるクラスです。
* `bold` が拡張関数の名前です。 
* 拡張関数 `.bold()` の戻り値の型は `String` です。
* `String` のインスタンスである `"hello"` がレシーバです。
* 関数本体の内部では、[キーワード](keyword-reference.md) `this` によってレシーバにアクセスします。
* 文字列テンプレート（`$`）を使用して `this` の値にアクセスしています。
* 拡張関数 `.bold()` は文字列を受け取り、太字用の `<b>` HTML要素で囲んで返します。

## 拡張指向の設計 {id="extension-oriented-design"}

拡張関数はどこでも定義できるため、拡張指向設計（extension-oriented designs）を行うことができます。このような設計では、コア機能と、便利ではあるものの必須ではない機能を分離できるため、コードが読みやすく、保守しやすくなります。

良い例として、ネットワークリクエストの実行に役立つKtorライブラリの [`HttpClient`](https://api.ktor.io/ktor-client-core/io.ktor.client/-http-client/index.html) クラスがあります。その機能のコアは、HTTPリクエストに必要なすべての情報を受け取る単一の関数 `request()` です。

```kotlin
class HttpClient {
    fun request(method: String, url: String, headers: Map<String, String>): HttpResponse {
        // ネットワークコード
    }
}
```
{validate="false"}

実際には、最もよく使われるHTTPリクエストはGETまたはPOSTリクエストです。ライブラリがこれらの一般的なユースケースに対してより短い名前を提供するのは理にかなっています。しかし、これらは新しいネットワークコードを書く必要はなく、特定の `request` 呼び出しを行うだけで済みます。つまり、これらは独立した `.get()` および `.post()` 拡張関数として定義するのにうってつけの候補です。

```kotlin
fun HttpClient.get(url: String): HttpResponse = request("GET", url, emptyMap())
fun HttpClient.post(url: String): HttpResponse = request("POST", url, emptyMap())
```
{validate="false"}

これらの `.get()` および `.post()` 関数は `HttpClient` クラスを拡張しています。これらは `HttpClient` クラスのインスタンスをレシーバとして呼び出されるため、`HttpClient` クラスの `request()` 関数を直接使用できます。これらの拡張関数を使用して適切なHTTPメソッドで `request()` 関数を呼び出すことで、コードがシンプルになり、理解しやすくなります。

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

    // request() を直接使用してGETリクエストを行う
    val getResponseWithMember = client.request("GET", "https://example.com", emptyMap())

    // get() 拡張関数を使用してGETリクエストを行う
    // client インスタンスがレシーバ
    val getResponseWithExtension = client.get("https://example.com")
}
```
{validate="false"}

このような拡張指向のアプローチは、Kotlinの[標準ライブラリ](https://kotlinlang.org/api/latest/jvm/stdlib/)やその他のライブラリで広く使用されています。例えば、`String` クラスには文字列の操作に役立つ多くの[拡張関数](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/#extension-functions)があります。

拡張関数の詳細については、[Extensions](extensions.md) を参照してください。

## 演習 {completion-point="true" id="practice"}

<deflist appearance="clear" collapsible="true" numbered="true">
<def title="整数が正であるかどうかを判定する" id="extension-functions-exercise-1">

整数を受け取り、それが正であるかどうかを判定する `isPositive` という拡張関数を作成してください。

```kotlin
fun Int.// ここにコードを記述してください

fun main() {
    println(1.isPositive())
    // true
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/IsPositiveTest.kt" validate="false" id="kotlin-tour-extension-functions-exercise-1"}

```kotlin
fun Int.isPositive(): Boolean = this > 0

fun main() {
    println(1.isPositive())
    // true
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/IsPositiveTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-extension-functions-solution-1"}

</def>
<def title="文字列を小文字に変換する" id="extension-functions-exercise-2">

文字列を受け取り、それを小文字にしたものを返す `toLowercaseString` という拡張関数を作成してください。

<deflist collapsible="true">
    <def title="ヒント">
        <code>String</code> 型の <a href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/lowercase.html"> <code>.lowercase()</code>
        </a> 関数を使用してください。 
    </def>
</deflist>

```kotlin
fun // ここにコードを記述してください

fun main() {
    println("Hello World!".toLowercaseString())
    // hello world!
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/ToLowercaseStringTest.kt" validate="false" id="kotlin-tour-extension-functions-exercise-2"}

```kotlin
fun String.toLowercaseString(): String = this.lowercase()

fun main() {
    println("Hello World!".toLowercaseString())
    // hello world!
}
```
{kotlin-runnable="true" kotlin-target-platform="exercise" kotlin-hidden-files="ExerciseUtils.kt,tour/intermediate/ToLowercaseStringTest.kt" initial-collapse-state="collapsed" collapsible="true" collapsed-title="解答例" id="kotlin-tour-extension-functions-solution-2"}

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