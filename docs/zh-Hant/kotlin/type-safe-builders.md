[//]: # (title: 類型安全構建器)

藉由將命名良好的函式作為構建器，並結合 [帶有接收者的函式字面值](lambdas.md#function-literals-with-receiver)，可以在 Kotlin 中建立類型安全、靜態類型的構建器。

類型安全構建器允許建立基於 Kotlin 的領域特定語言 (DSL)，適合以半宣告式的方式建立複雜的階層式資料結構。構建器的一些範例使用案例包括：

* 使用 Kotlin 程式碼產生標記，例如 [HTML](https://github.com/Kotlin/kotlinx.html) 或 XML
* 為 Web 伺服器配置路由：[Ktor](https://ktor.io/docs/routing.html)

請考慮以下程式碼：

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

            // 一個具有屬性和文字內容的元素
            a(href = "http://kotlinlang.org") { +"Kotlin" }

            // 混合內容
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
{collapsible="true" collapsed-title="範例輸出"}

## 運作原理 {id="how-it-works"}

假設您需要在 Kotlin 中實作一個類型安全構建器。
首先，定義您想要構建的模型。在此範例中，您需要為 HTML 標籤建模。
這可以透過一組類別輕鬆完成。
例如，`HTML` 是一個描述 `<html>` 標籤的類別，定義了像 `<head>` 和 `<body>` 這樣的子項目。
（請參閱其 [下方](#full-definition-of-the-com-example-html-package) 的宣告。）

現在，讓我們回想一下為什麼您可以在程式碼中這樣寫：

```kotlin
html {
 // ...
}
```

`html` 實際上是一個函式呼叫，它接受一個 [Lambda 運算式](lambdas.md) 作為引數。
此函式的定義如下：

```kotlin
fun html(init: HTML.() -> Unit): HTML {
    val html = HTML()
    html.init()
    return html
}
```

此函式接受一個名為 `init` 的參數，其本身就是一個函式。
該函式的型別是 `HTML.() -> Unit`，這是一個 *帶有接收者的函式型別*。
這意味著您需要傳遞一個 `HTML` 型別的執行個體（一個 *接收者*）給該函式，並且您可以在該函式內部呼叫該執行個體的成員。

接收者可以透過 `this` 關鍵字存取：

```kotlin
html {
    this.head { ... }
    this.body { ... }
}
```

（`head` 和 `body` 是 `HTML` 的成員函式。）

現在，如同往常一樣，可以省略 `this`，您會得到一個看起來非常像構建器的東西：

```kotlin
html {
    head { ... }
    body { ... }
}
```

那麼，這個呼叫做了什麼？讓我們看看上面定義的 `html` 函式的內文。
它建立了一個新的 `HTML` 執行個體，然後透過呼叫作為引數傳遞的函式來對其進行初始化（在此範例中，這歸結為在 `HTML` 執行個體上呼叫 `head` 和 `body`），然後回傳此執行個體。
這正是構建器應該做的。

`HTML` 類別中的 `head` 和 `body` 函式的定義與 `html` 類似。
唯一的區別是它們將構建的執行個體加入到封閉的 `HTML` 執行個體的 `children` 集合中：

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

實際上這兩個函式做的是同樣的事情，所以您可以有一個泛型版本，`initTag`：

```kotlin
protected fun <T : Element> initTag(tag: T, init: T.() -> Unit): T {
    tag.init()
    children.add(tag)
    return tag
}
```

所以，現在您的函式變得非常簡單：

```kotlin
fun head(init: Head.() -> Unit) = initTag(Head(), init)

fun body(init: Body.() -> Unit) = initTag(Body(), init)
```

您可以使用它們來構建 `<head>` 和 `<body>` 標籤。

這裡要討論的另一件事是您如何將文字加入標籤主體。在上面的範例中，您這樣寫：

```kotlin
html {
    head {
        title {+"XML encoding with Kotlin"}
    }
    // ...
}
```

所以基本上，您只是在標籤主體中放入一個字串，但它的前面有一個小小的 `+`，
所以這是一個函式呼叫，呼叫了一個前綴 `unaryPlus()` 運算。
該運算實際上是由一個 `unaryPlus()` 擴充函式定義的，它是 `TagWithText` 抽象類別（`Title` 的父類別）的一個成員：

```kotlin
operator fun String.unaryPlus() {
    children.add(TextElement(this))
}
```

因此，這裡的前綴 `+` 所做的是將字串包裝到 `TextElement` 的執行個體中，並將其加入到 `children` 集合中，使其成為標籤樹的適當部分。

這一切都定義在 `com.example.html` 封裝套件中，該套件已在上面的構建器範例頂部匯入。
在最後一節中，您可以閱讀此封裝套件的完整定義。

## 作用域控制：@DslMarker {id="scope-control-dslmarker"}

使用 DSL 時，可能會遇到在內容中可以呼叫太多函式的問題。
您可以在 Lambda 內部呼叫每個可用的 [隱式接收者](lambdas.md#function-literals-with-receiver) 的方法，從而得到不一致的結果，
例如在另一個 `head` 內部的 `head` 標籤：

```kotlin
html {
    head {
        head {} // 應該被禁止
    }
    // ...
}
```

在此範例中，只有最近的隱式接收者 `this@head` 的成員必須可用；`head()` 是外部接收者 `this@html` 的成員，因此呼叫它必須是非法的。

為了處理此問題，有一種特殊的機制來控制接收者作用域。

要讓編譯器開始控制作用域，您只需要使用相同的標記註解來標註 DSL 中使用的所有接收者型別。
例如，對於 HTML 構建器，您宣告一個註解 `@HtmlTagMarker`：

```kotlin
@DslMarker
@Target(AnnotationTarget.CLASS)
annotation class HtmlTagMarker
```

如果一個註解類別被標註了 `@DslMarker` 註解，它就被稱為 DSL 標記。

`@Target` 註解限制了 `@HtmlTagMarker` 可以套用的位置。
DSL 標記僅在套用於以下位置時才影響作用域控制：

* 型別宣告 (`CLASS`)：用作 DSL 接收者的類別或介面。
* 型別使用 (`TYPE`)：函式型別簽章中的接收者型別。
* 型別別名 (`TYPEALIAS`)：展開為 DSL 接收者型別的型別別名。

將 DSL 標記套用於其他目標（例如函式或屬性）對作用域控制沒有影響。

> 有關 DSL 標記如何運作的更多詳細資訊，請參閱相應的 [KEEP 文件](https://github.com/Kotlin/KEEP/blob/main/notes/0005-dsl-marker.md)。
>
{style="note"}

在我們的 DSL 中，所有標籤類別都繼承自同一個超類別 `Tag`。
只需僅使用 `@HtmlTagMarker` 標註超類別，之後 Kotlin 編譯器就會將所有繼承的類別視為已標註：

```kotlin
@HtmlTagMarker
abstract class Tag(val name: String) { ... }
```

您不必使用 `@HtmlTagMarker` 標註 `HTML` 或 `Head` 類別，因為它們的超類別已經標註過：

```kotlin
class HTML() : Tag("html") { ... }

class Head() : Tag("head") { ... }
```

加入此註解後，Kotlin 編譯器知道哪些隱式接收者是同一個 DSL 的一部分，並僅允許呼叫最近接收者的成員：

```kotlin
html {
    head {
        head { } // 錯誤：外部接收者的成員
    }
    // ...
}
```

請注意，仍然可以呼叫外部接收者的成員，但要做到這一點，您必須明確指定此接收者：

```kotlin
html {
    head {
        this@html.head { } // 可以
    }
    // ...
}
```

您也可以將 `@DslMarker` 註解直接套用於 [函式型別](lambdas.md#function-types)。
這需要在註解目標中包含 `AnnotationTarget.TYPE`：

```kotlin
@DslMarker
@Target(AnnotationTarget.CLASS, AnnotationTarget.TYPE)
annotation class HtmlTagMarker
```

因此，`@DslMarker` 註解可以套用於函式型別，最常見於帶有接收者的 Lambda。例如：

```kotlin
fun html(init: @HtmlTagMarker HTML.() -> Unit): HTML { ... }

fun HTML.head(init: @HtmlTagMarker Head.() -> Unit): Head { ... }

fun Head.title(init: @HtmlTagMarker Title.() -> Unit): Title { ... }
```

當您呼叫這些函式時，`@DslMarker` 註解會限制在被其標註的 Lambda 主體中存取外部接收者，除非您明確指定它們：

```kotlin
html {
    head {
        title {
            // 在此處存取 title、head 或外部接收者的其他函式受到限制。
        }
    }
}
```

在 Lambda 內只能存取最近接收者的成員和擴充功能，防止巢狀作用域之間意外的交互作用。

當隱式接收者的成員和來自 [上下文參數](context-parameters.md) 的宣告都在具有相同名稱的作用域中時，編譯器會報告警告，因為隱式接收者被上下文參數遮蔽了。
要解決此問題，請使用 `this` 限定詞來明確呼叫接收者，或使用 `contextOf<T>()` 來呼叫上下文宣告：

```kotlin
interface HtmlTag {
    fun setAttribute(name: String, value: String)
}

// 宣告一個具有相同名稱的頂層函式，
// 該函式可透過上下文參數使用
context(tag: HtmlTag)
fun setAttribute(name: String, value: String) { tag.setAttribute(name, value) }

fun test(head: HtmlTag, extraInfo: HtmlTag) {
    with(head) {
        // 在內部作用域中引入相同型別的上下文值
        context(extraInfo) {
            // 報告警告：
            // 使用了被上下文參數遮蔽的隱式接收者
            setAttribute("user", "1234")

            // 明確呼叫接收者的成員
            this.setAttribute("user", "1234")

            // 明確呼叫上下文宣告
            contextOf<HtmlTag>().setAttribute("user", "1234")
        }
    }
}
```

### com.example.html 封裝套件的完整定義 {id="full-definition-of-the-com-example-html-package"}

這是 `com.example.html` 封裝套件的定義方式（僅包含上述範例中使用的元素）。
它構建了一個 HTML 樹。它大量使用了 [擴充函式](extensions.md) 和 [帶有接收者的 Lambda](lambdas.md#function-literals-with-receiver)。

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
