[//]: # (title: 型安全なビルダー)

適切な名前の付いた関数をビルダーとして[レシーバ付き関数リテラル](lambdas.md#function-literals-with-receiver)と組み合わせて使用することで、Kotlinで型安全かつ静的に型付けされたビルダーを作成することが可能です。

型安全なビルダーを使用すると、複雑な階層構造のデータを準宣言的な方法で構築するのに適した、Kotlinベースのドメイン固有言語（DSL）を作成できます。ビルダーの代表的なユースケースは以下の通りです：

* [HTML](https://github.com/Kotlin/kotlinx.html) や XML などのマークアップを Kotlin コードで生成する
* Web サーバーのルートを構成する： [Ktor](https://ktor.io/docs/routing.html)

以下のコードを考えてみましょう：

```kotlin
package html

fun main() {
    //sampleStart
    val result = html {
        head {
            title { +"HTML encoding with Kotlin" }
        }
        body {
            h1 { +"HTML encoding with Kotlin" }
            p {
                +"this format can be used as an"
                +"alternative markup to HTML"
            }

            // 属性とテキストコンテンツを持つ要素
            a(href = "http://kotlinlang.org") { +"Kotlin" }

            // 混合コンテンツ
            p {
                +"This is some"
                b { +"mixed" }
                +"text. For more see the"
                a(href = "http://kotlinlang.org") {
                    +"Kotlin"
                }
                +"project"
            }
            p {
                +"some text"
                ul {
                    for (i in 1..5)
                        li { +"${i}*2 = ${i*2}" }
                }
            }
        }
    }
    //sampleEnd
    println(result)
}

interface Element {
    fun render(builder: StringBuilder, indent: String)
}

class TextElement(val text: String) : Element {
    override fun render(builder: StringBuilder, indent: String) {
        builder.append("$indent$text\n")
    }
}

@DslMarker
annotation class HtmlTagMarker

@HtmlTagMarker
abstract class Tag(val name: String) : Element {
    val children = arrayListOf<Element>()
    val attributes = hashMapOf<String, String>()

    protected fun <T : Element> initTag(tag: T, init: T.() -> Unit): T {
        tag.init()
        children.add(tag)
        return tag
    }

    override fun render(builder: StringBuilder, indent: String) {
        builder.append("$indent<$name${renderAttributes()}>\n")
        for (c in children) {
            c.render(builder, indent + "  ")
        }
        builder.append("$indent</$name>\n")
    }

    private fun renderAttributes(): String {
        val builder = StringBuilder()
        for ((attr, value) in attributes) {
            builder.append(" $attr=\"$value\"")
        }
        return builder.toString()
    }

    override fun toString(): String {
        val builder = StringBuilder()
        render(builder, "")
        return builder.toString()
    }
}

abstract class TagWithText(name: String) : Tag(name) {
    operator fun String.unaryPlus() {
        children.add(TextElement(this))
    }
}
class HTML() : TagWithText("html") {
    fun head(init: Head.() -> Unit) = initTag(Head(), init)
    fun body(init: Body.() -> Unit) = initTag(Body(), init)
}

class Head() : TagWithText("head") {
    fun title(init: Title.() -> Unit) = initTag(Title(), init)
}

class Title() : TagWithText("title")

abstract class BodyTag(name: String) : TagWithText(name) {
    fun b(init: B.() -> Unit) = initTag(B(), init)
    fun p(init: P.() -> Unit) = initTag(P(), init)
    fun h1(init: H1.() -> Unit) = initTag(H1(), init)
    fun ul(init: UL.() -> Unit) = initTag(UL(), init)
    fun a(href: String, init: A.() -> Unit) {
        val a = initTag(A(), init)
        a.href = href
    }
}

class Body() : BodyTag("body")
class UL() : BodyTag("ul") {
    fun li(init: LI.() -> Unit) = initTag(LI(), init)
}

class B() : BodyTag("b")
class LI() : BodyTag("li")
class P() : BodyTag("p")
class H1() : BodyTag("h1")

class A : BodyTag("a") {
    var href: String
        get() = attributes["href"]!!
        set(value) {
            attributes["href"] = value
        }
}

fun html(init: HTML.() -> Unit): HTML {
    val html = HTML()
    html.init()
    return html
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-type-safe-builders"}

```
<html>
  <head>
    <title>
      HTML encoding with Kotlin
    </title>
  </head>
  <body>
    <h1>
      HTML encoding with Kotlin
    </h1>
    <p>
      this format can be used as an
      alternative markup to HTML
    </p>
    <a href="http://kotlinlang.org">
      Kotlin
    </a>
    <p>
      This is some
      <b>
        mixed
      </b>
      text. For more see the
      <a href="http://kotlinlang.org">
        Kotlin
      </a>
      project
    </p>
    <p>
      some text
      <ul>
        <li>
          1*2 = 2
        </li>
        <li>
          2*2 = 4
        </li>
        <li>
          3*2 = 6
        </li>
        <li>
          4*2 = 8
        </li>
        <li>
          5*2 = 10
        </li>
      </ul>
    </p>
  </body>
</html>
```
{collapsible="true" collapsed-title="実行結果の例"}

## 仕組み {id="how-it-works"}

Kotlinで型安全なビルダーを実装する必要があると仮定しましょう。
まず最初に、構築したいモデルを定義します。この例では、HTMLタグをモデル化する必要があります。
これは、いくつかのクラスを定義するだけで簡単に実現できます。
例えば、`HTML` は `<html>` タグを記述するクラスで、`<head>` や `<body>` などの子要素を定義します。
（その宣言については、[後述](#com-example-html-パッケージの完全な定義)のセクションを参照してください。）

次に、なぜコード内で以下のように記述できるのかを思い出してみましょう：

```kotlin
html {
 // ...
}
```

`html` は実際には、[ラムダ式](lambdas.md)を引数として受け取る関数の呼び出しです。
この関数は次のように定義されています：

```kotlin
fun html(init: HTML.() -> Unit): HTML {
    val html = HTML()
    html.init()
    return html
}
```

この関数は `init` という名前のパラメータを1つ受け取ります。この `init` 自体も関数です。
この関数の型は `HTML.() -> Unit` で、これは *レシーバ付き関数型* です。
これは、関数に `HTML` 型のインスタンス（*レシーバ*）を渡す必要があり、その関数の内部でそのインスタンスのメンバを呼び出すことができることを意味します。

レシーバには `this` キーワードを通じてアクセスできます：

```kotlin
html {
    this.head { ... }
    this.body { ... }
}
```

（`head` と `body` は `HTML` のメンバ関数です。）

通常通り、`this` は省略することができ、そうすると既にビルダーのように見えるものが得られます：

```kotlin
html {
    head { ... }
    body { ... }
}
```

では、この呼び出しは何をしているのでしょうか？上記で定義された `html` 関数の本体を見てみましょう。
まず `HTML` の新しいインスタンスを作成し、次に引数として渡された関数を呼び出してそのインスタンスを初期化します（この例では、`HTML` インスタンスに対して `head` と `body` を呼び出すことになります）。そして、そのインスタンスを返します。
これこそがビルダーが行うべきことです。

`HTML` クラス内の `head` 関数と `body` 関数も、`html` と同様に定義されています。
唯一の違いは、構築されたインスタンスを、それを含んでいる `HTML` インスタンスの `children` コレクションに追加することです：

```kotlin
fun head(init: Head.() -> Unit): Head {
    val head = Head()
    head.init()
    children.add(head)
    return head
}

fun body(init: Body.() -> Unit): Body {
    val body = Body()
    body.init()
    children.add(body)
    return body
}
```

実際、これら2つの関数は全く同じことを行っているため、汎用的なバージョンである `initTag` を用意することができます：

```kotlin
protected fun <T : Element> initTag(tag: T, init: T.() -> Unit): T {
    tag.init()
    children.add(tag)
    return tag
}
```

これで、関数は非常にシンプルになります：

```kotlin
fun head(init: Head.() -> Unit) = initTag(Head(), init)

fun body(init: Body.() -> Unit) = initTag(Body(), init)
```

そして、これらを使用して `<head>` タグや `<body>` タグを構築できます。

ここで議論すべきもう一つの事項は、タグの本体にテキストを追加する方法です。上記の例では、次のように記述しています：

```kotlin
html {
    head {
        title {+"XML encoding with Kotlin"}
    }
    // ...
}
```

基本的には、タグの本体の中に文字列を置いているだけですが、その前に小さな `+` が付いています。
これは、接頭辞 `unaryPlus()` 操作を呼び出す関数呼び出しです。
その操作は、実際には `TagWithText` 抽象クラス（`Title` の親クラス）のメンバである拡張関数 `unaryPlus()` によって定義されています：

```kotlin
operator fun String.unaryPlus() {
    children.add(TextElement(this))
}
```

つまり、ここでの接頭辞 `+` が行っているのは、文字列を `TextElement` のインスタンスでラップし、それを `children` コレクションに追加することです。これにより、その文字列がタグツリーの適切な一部となります。

これらすべては、上記のビルダーの例の冒頭でインポートされている `com.example.html` パッケージで定義されています。
最後のセクションで、このパッケージの完全な定義を確認できます。

## スコープ制御： @DslMarker {id="scope-control-dslmarker"}

DSLを使用していると、そのコンテキスト内で呼び出せる関数が多すぎるという問題に遭遇することがあります。
ラムダの内部では、利用可能なすべての[暗黙のレシーバ](lambdas.md#function-literals-with-receiver)のメソッドを呼び出すことができてしまうため、例えば `head` タグの中に別の `head` タグを入れてしまうといった、一貫性のない結果を招く可能性があります。

```kotlin
html {
    head {
        head {} // これは禁止されるべき
    }
    // ...
}
```

この例では、最も近い暗黙のレシーバ `this@head` のメンバのみが利用可能であるべきです。`head()` は外側のレシーバ `this@html` のメンバであるため、これを呼び出すのは不正であるべきです。

この問題に対処するために、レシーバのスコープを制御する特別なメカニズムがあります。

コンパイラにスコープの制御を開始させるには、DSLで使用されるすべてのレシーバの型に、同じマーカーアノテーションを付与するだけです。
例えば、HTMLビルダーの場合は `@HtmlTagMarker` というアノテーションを宣言します：

```kotlin
@DslMarker
@Target(AnnotationTarget.CLASS)
annotation class HtmlTagMarker
```

アノテーションクラスに `@DslMarker` アノテーションが付与されている場合、そのアノテーションクラスは DSL マーカーと呼ばれます。

`@Target` アノテーションは、`@HtmlTagMarker` を適用できる場所を制限します。
DSL マーカーは、以下の場所に適用された場合にのみスコープ制御に影響を与えます：

* 型宣言 (`CLASS`): DSL レシーバとして使用されるクラスまたはインターフェース。
* 型の使用 (`TYPE`): 関数型のシグネチャにおけるレシーバ型。
* 型エイリアス (`TYPEALIAS`): DSL レシーバ型に展開される型エイリアス。

DSL マーカーを他のターゲット（関数やプロパティなど）に適用しても、スコープ制御には影響しません。

> DSL マーカーの仕組みの詳細については、対応する [KEEP ドキュメント](https://github.com/Kotlin/KEEP/blob/main/notes/0005-dsl-marker.md)を参照してください。
>
{style="note"}

この DSL では、すべてのタグクラスが同じスーパークラス `Tag` を継承しています。
スーパークラスにのみ `@HtmlTagMarker` を付与すれば十分であり、そうすると Kotlin コンパイラは継承されたすべてのクラスもアノテーションが付与されているものとして扱います。

```kotlin
@HtmlTagMarker
abstract class Tag(val name: String) { ... }
```

`HTML` クラスや `Head` クラスに `@HtmlTagMarker` を付与する必要はありません。それらのスーパークラスに既にアノテーションが付与されているからです：

```kotlin
class HTML() : Tag("html") { ... }

class Head() : Tag("head") { ... }
```

このアノテーションを追加すると、Kotlin コンパイラはどの暗黙のレシーバが同じ DSL の一部であるかを認識し、最も近いレシーバ의 メンバのみを呼び出せるようにします：

```kotlin
html {
    head {
        head { } // エラー：外側のレシーバのメンバ
    }
    // ...
}
```

なお、外側のレシーバのメンバを呼び出すことは依然として可能ですが、そのためにはそのレシーバを明示的に指定する必要があります：

```kotlin
html {
    head {
        this@html.head { } // 可能
    }
    // ...
}
```

`@DslMarker` アノテーションを直接[関数型](lambdas.md#function-types)に適用することもできます。
これには、アノテーションターゲットに `AnnotationTarget.TYPE` を含める必要があります：

```kotlin
@DslMarker
@Target(AnnotationTarget.CLASS, AnnotationTarget.TYPE)
annotation class HtmlTagMarker
```

その結果、`@DslMarker` アノテーションを関数型に適用できるようになります（最も一般的なのはレシーバ付きラムダです）。例：

```kotlin
fun html(init: @HtmlTagMarker HTML.() -> Unit): HTML { ... }

fun HTML.head(init: @HtmlTagMarker Head.() -> Unit): Head { ... }

fun Head.title(init: @HtmlTagMarker Title.() -> Unit): Title { ... }
```

これらの関数を呼び出す際、明示的に指定しない限り、マークされたラムダの本体内では `@DslMarker` アノテーションによって外側のレシーバへのアクセスが制限されます。

```kotlin
html {
    head {
        title {
            // ここでは、title、head、またはその他の外側のレシーバの関数へのアクセスは制限されます。
        }
    }
}
```

ラムダ内では最も近いレシーバのメンバと拡張機能のみがアクセス可能になり、ネストされたスコープ間での意図しない相互作用を防ぎます。

暗黙のレシーバのメンバと[コンテキストパラメータ](context-parameters.md)からの宣言が同じ名前でスコープ内にある場合、暗黙のレシーバがコンテキストパラメータによってシャドウイングされるため、コンパイラは警告を出します。
これを解決するには、`this` 修飾子を使用して明示的にレシーバを呼び出すか、`contextOf<T>()` を使用してコンテキスト宣言を呼び出します：

```kotlin
interface HtmlTag {
    fun setAttribute(name: String, value: String)
}

// 同じ名前のトップレベル関数を宣言し、
// コンテキストパラメータを介して利用可能にする
context(tag: HtmlTag)
fun setAttribute(name: String, value: String) { tag.setAttribute(name, value) }

fun test(head: HtmlTag, extraInfo: HtmlTag) {
    with(head) {
        // 内側のスコープに同じ型のコンテキスト値を導入する
        context(extraInfo) {
            // 警告が表示される：
            // コンテキストパラメータによってシャドウイングされた暗黙のレシーバを使用している
            setAttribute("user", "1234")

            // レシーバのメンバを明示的に呼び出す
            this.setAttribute("user", "1234")

            // コンテキスト宣言を明示的に呼び出す
            contextOf<HtmlTag>().setAttribute("user", "1234")
        }
    }
}
```

### com.example.html パッケージの完全な定義 {id="full-definition-of-the-com-example-html-package"}

以下は、`com.example.html` パッケージの定義です（上記の例で使用されている要素のみ）。
これは HTML ツリーを構築します。 [拡張関数](extensions.md) と [レシーバ付きラムダ](lambdas.md#function-literals-with-receiver) を多用しています。

```kotlin
package com.example.html

interface Element {
    fun render(builder: StringBuilder, indent: String)
}

class TextElement(val text: String) : Element {
    override fun render(builder: StringBuilder, indent: String) {
        builder.append("$indent$text\n")
    }
}

@DslMarker
@Target(AnnotationTarget.CLASS, AnnotationTarget.TYPE)
annotation class HtmlTagMarker

@HtmlTagMarker
abstract class Tag(val name: String) : Element {
    val children = arrayListOf<Element>()
    val attributes = hashMapOf<String, String>()

    protected fun <T : Element> initTag(tag: T, init: T.() -> Unit): T {
        tag.init()
        children.add(tag)
        return tag
    }

    override fun render(builder: StringBuilder, indent: String) {
        builder.append("$indent<$name${renderAttributes()}>\n")
        for (c in children) {
            c.render(builder, indent + "  ")
        }
        builder.append("$indent</$name>\n")
    }

    private fun renderAttributes(): String {
        val builder = StringBuilder()
        for ((attr, value) in attributes) {
            builder.append(" $attr=\"$value\"")
        }
        return builder.toString()
    }

    override fun toString(): String {
        val builder = StringBuilder()
        render(builder, "")
        return builder.toString()
    }
}

abstract class TagWithText(name: String) : Tag(name) {
    operator fun String.unaryPlus() {
        children.add(TextElement(this))
    }
}

class HTML : TagWithText("html") {
    fun head(init: Head.() -> Unit) = initTag(Head(), init)

    fun body(init: Body.() -> Unit) = initTag(Body(), init)
}

class Head : TagWithText("head") {
    fun title(init: Title.() -> Unit) = initTag(Title(), init)
}

class Title : TagWithText("title")

abstract class BodyTag(name: String) : TagWithText(name) {
    fun b(init: B.() -> Unit) = initTag(B(), init)
    fun p(init: P.() -> Unit) = initTag(P(), init)
    fun h1(init: H1.() -> Unit) = initTag(H1(), init)
    fun a(href: String, init: A.() -> Unit) {
        val a = initTag(A(), init)
        a.href = href
    }
}

class Body : BodyTag("body")
class B : BodyTag("b")
class P : BodyTag("p")
class H1 : BodyTag("h1")

class A : BodyTag("a") {
    var href: String
        get() = attributes["href"]!!
        set(value) {
            attributes["href"] = value
        }
}

fun html(init: HTML.() -> Unit): HTML {
    val html = HTML()
    html.init()
    return html
}
```
