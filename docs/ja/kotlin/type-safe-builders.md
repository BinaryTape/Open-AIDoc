[//]: # (title: 型安全なビルダー)

適切に命名された関数をビルダーとして使用し、[レシーバー付き関数リテラル](lambdas.md#function-literals-with-receiver)と組み合わせることで、Kotlin では型安全で静的型付けされたビルダーを作成できます。

型安全なビルダーを使用すると、複雑な階層型データ構造を半宣言的な方法で構築するのに適した、Kotlin ベースのドメイン固有言語（DSL）を作成できます。ビルダーの代表的なユースケースは以下のとおりです。

* [HTML](https://github.com/Kotlin/kotlinx.html) や XML など、Kotlin コードによるマークアップの生成
* Web サーバーのルーティング設定: [Ktor](https://ktor.io/docs/routing.html)

次のコードを考えてみましょう。

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

            // 混在コンテンツ
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
{kotlin-runnable="true" id="kotlin-type-safe-builders"}

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
{collapsible="true" collapsed-title="出力例"}

## 仕組み {id="how-it-works"}

Kotlin で型安全なビルダーを実装する必要があると仮定します。
まず、構築したいモデルを定義します。この場合、HTML タグをモデル化する必要があります。
これはいくつかのクラスを用意するだけで簡単に実現できます。
例えば、`HTML` は `<head>` や `<body>` などの子要素を定義する `<html>` タグを記述するクラスです。
（その宣言については[後述](#full-definition-of-the-com-example-html-package)を参照してください。）

それでは、なぜコード内で次のように記述できるのかを振り返ってみましょう。

```kotlin
html {
 // ...
}
```

`html` は実際には、[ラムダ式](lambdas.md)を引数として受け取る関数呼び出しです。
この関数は次のように定義されています。

```kotlin
fun html(init: HTML.() -> Unit): HTML {
    val html = HTML()
    html.init()
    return html
}
```

この関数は `init` という名前のパラメーターを1つ受け取りますが、それ自体が関数です。
この関数の型は `HTML.() -> Unit` であり、これは*レシーバー付き関数型*です。
これは、関数に `HTML` 型のインスタンス（*レシーバー*）を渡す必要があり、その関数の内部ではそのインスタンスのメンバーを呼び出せることを意味します。

レシーバーには `this` キーワードを使ってアクセスできます。

```kotlin
html {
    this.head { ... }
    this.body { ... }
}
```

（`head` と `body` は `HTML` のメンバー関数です。）

ここで、通常どおり `this` を省略することができ、すでに見るからにビルダーらしい記述が得られます。

```kotlin
html {
    head { ... }
    body { ... }
}
```

では、この呼び出しは何を行うのでしょうか？上で定義された `html` 関数の本体を見てみましょう。
これは `HTML` の新しいインスタンスを作成し、引数として渡された関数を呼び出してそれを初期化し（この例では、`HTML` インスタンスに対して `head` と `body` を呼び出すことになります）、そのインスタンスを返します。
これこそが、まさにビルダーが行うべきことです。

`HTML` クラス内の `head` および `body` 関数も `html` と同様に定義されています。
唯一の違いは、構築されたインスタンスを、それらを囲んでいる `HTML` インスタンスの `children` コレクションに追加することです。

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

実際、これら2つの関数はまったく同じことを行っているため、ジェネリックなバージョンである `initTag` を作成できます。

```kotlin
protected fun <T : Element> initTag(tag: T, init: T.() -> Unit): T {
    tag.init()
    children.add(tag)
    return tag
}
```

これで、関数は非常にシンプルになります。

```kotlin
fun head(init: Head.() -> Unit) = initTag(Head(), init)

fun body(init: Body.() -> Unit) = initTag(Body(), init)
```

そして、これらを使用して `<head>` および `<body>` タグを構築できます。

ここで議論すべきもう1つの点は、タグの本文にテキストを追加する方法です。上記の例では、次のように記述しています。

```kotlin
html {
    head {
        title {+"XML encoding with Kotlin"}
    }
    // ...
}
```

つまり基本的にはタグの本文内に文字列を置くだけですが、その前に小さな `+` が付いています。そのため、これは前置の `unaryPlus()` 操作を呼び出す関数呼び出しになります。
その操作は実際には、`TagWithText` 抽象クラス（`Title` の親クラス）のメンバーである拡張関数 `unaryPlus()` によって定義されています。

```kotlin
operator fun String.unaryPlus() {
    children.add(TextElement(this))
}
```

したがって、ここで前置の `+` が行っているのは、文字列を `TextElement` のインスタンスにラップして `children` コレクションに追加し、タグツリーの適切な一部にすることです。

これらはすべて、上記のビルダーの例の先頭でインポートされている `com.example.html` パッケージで定義されています。
最後のセクションで、このパッケージの完全な定義を確認できます。

## スコープ制御: @DslMarker {id="scope-control-dslmarker"}

DSL を使用していると、そのコンテキスト内で呼び出せる関数が多すぎるという問題に遭遇することがあります。
ラムダの内部では、利用可能なすべての[暗黙のレシーバー](lambdas.md#function-literals-with-receiver)のメソッドを呼び出すことができるため、別の `head` の中に `head` タグを入れてしまうような、一貫性のない結果になる可能性があります。

```kotlin
html {
    head {
        head {} // 禁止されるべき
    }
    // ...
}
```

この例では、最も近い暗黙のレシーバーである `this@head` のメンバーのみが利用可能であるべきです。`head()` は外側のレシーバーである `this@html` のメンバーであるため、これを呼び出すことは不正でなければなりません。

この問題に対処するために、レシーバースコープを制御する特別な仕組みがあります。

コンパイラにスコープの制御を行わせるには、DSL で使用されるすべてのレシーバーの型に同じマーカーアノテーションを付けるだけです。
例えば、HTML ビルダー向けには `@HtmlTagMarker` アノテーションを宣言します。

```kotlin
@DslMarker
@Target(AnnotationTarget.CLASS)
annotation class HtmlTagMarker
```

アノテーションクラスは、`@DslMarker` アノテーションが付けられている場合に DSL マーカーと呼ばれます。

`@Target` アノテーションは、`@HtmlTagMarker` を適用できる場所を制限します。
DSL マーカーは、以下に適用された場合にのみスコープ制御に影響します。

* 型宣言（`CLASS`）：DSL レシーバーとして使用されるクラスまたはインターフェース。
* 型の使用（`TYPE`）：関数型のシグネチャにおけるレシーバー型。
* 型エイリアス（`TYPEALIAS`）：DSL レシーバー型に展開される型エイリアス。

他のターゲット（関数やプロパティなど）に DSL マーカーを適用しても、スコープ制御には何の影響もありません。

> DSL マーカーの動作の詳細については、対応する [KEEP ドキュメント](https://github.com/Kotlin/KEEP/blob/main/notes/0005-dsl-marker.md)を参照してください。
>
{style="note"}

今回の DSL では、すべてのタグクラスが同じスーパークラス `Tag` を継承しています。
スーパークラスのみに `@HtmlTagMarker` を付与すれば十分であり、それにより Kotlin コンパイラは継承されたすべてのクラスをアノテーションが付与されたものとして扱います。

```kotlin
@HtmlTagMarker
abstract class Tag(val name: String) { ... }
```

スーパークラスにすでにアノテーションが付けられているため、`HTML` クラスや `Head` クラスに `@HtmlTagMarker` を付ける必要はありません。

```kotlin
class HTML() : Tag("html") { ... }

class Head() : Tag("head") { ... }
```

このアノテーションを追加すると、Kotlin コンパイラはどの暗黙のレシーバーが同じ DSL の一部であるかを把握し、最も近いレシーバーのメンバーのみの呼び出しを許可するようになります。

```kotlin
html {
    head {
        head { } // エラー: 外側のレシーバーのメンバー
    }
    // ...
}
```

なお、外側のレシーバーのメンバーを呼び出すことは依然として可能ですが、そのためにはそのレシーバーを明示的に指定する必要があります。

```kotlin
html {
    head {
        this@html.head { } // 可能
    }
    // ...
}
```

`@DslMarker` アノテーションは、[関数型](lambdas.md#function-types)に直接適用することもできます。
これには、アノテーションターゲットに `AnnotationTarget.TYPE` を含める必要があります。

```kotlin
@DslMarker
@Target(AnnotationTarget.CLASS, AnnotationTarget.TYPE)
annotation class HtmlTagMarker
```

その結果、`@DslMarker` アノテーションを関数型（最も一般的にはレシーバー付きラムダ）に適用できるようになります。例えば以下のようになります。

```kotlin
fun html(init: @HtmlTagMarker HTML.() -> Unit): HTML { ... }

fun HTML.head(init: @HtmlTagMarker Head.() -> Unit): Head { ... }

fun Head.title(init: @HtmlTagMarker Title.() -> Unit): Title { ... }
```

これらの関数を呼び出す際、`@DslMarker` アノテーションが付与されたラムダの本体内では、明示的に指定しない限り外側のレシーバーへのアクセスが制限されます。

```kotlin
html {
    head {
        title {
            // ここでは、title、head、または外側のレシーバーのその他の関数へのアクセスが制限される
        }
    }
}
```

ラムダ内からは最も近いレシーバーのメンバーおよび拡張のみにアクセス可能となり、ネストされたスコープ間での意図しない相互作用を防ぐことができます。

暗黙のレシーバーのメンバーと [コンテキストパラメーター](context-parameters.md) からの宣言が同じスコープ内に同名で存在する場合、暗黙のレシーバーがコンテキストパラメーターによってシャドウ（隠蔽）されるため、コンパイラは警告を出力します。
これを解決するには、`this` 修飾子を使用してレシーバーを明示的に呼び出すか、`contextOf<T>()` を使用してコンテキスト宣言を呼び出します。

```kotlin
interface HtmlTag {
    fun setAttribute(name: String, value: String)
}

// 同じ名前のトップレベル関数を宣言し、
// コンテキストパラメーターを通じて利用可能にする
context(tag: HtmlTag)
fun setAttribute(name: String, value: String) { tag.setAttribute(name, value) }

fun test(head: HtmlTag, extraInfo: HtmlTag) {
    with(head) {
        // 内側のスコープに同じ型のコンテキスト値を導入する
        context(extraInfo) {
            // 警告が出力される:
            // コンテキストパラメーターによってシャドウされた暗黙のレシーバーを使用している
            setAttribute("user", "1234")

            // レシーバーのメンバーを明示的に呼び出す
            this.setAttribute("user", "1234")

            // コンテキスト宣言を明示的に呼び出す
            contextOf<HtmlTag>().setAttribute("user", "1234")
        }
    }
}
```

### com.example.html パッケージの完全な定義 {id="full-definition-of-the-com-example-html-package"}

以下は、`com.example.html` パッケージがどのように定義されているかを示しています（上記の例で使用されている要素のみ）。
これは HTML ツリーを構築します。[拡張関数](extensions.md)と[レシーバー付きラムダ](lambdas.md#function-literals-with-receiver)を多用しています。

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