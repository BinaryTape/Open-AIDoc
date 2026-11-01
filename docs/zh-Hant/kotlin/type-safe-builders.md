[//]: # (title: 型別安全建構器)

透過將命名良好的函式作為建構器，並結合[帶有接收者的函式常值](lambdas.md#function-literals-with-receiver)，可以在 Kotlin 中建立型別安全、靜態型別的建構器。

型別安全建構器允許建立基於 Kotlin 的領域特定語言 (DSL)，非常適合以半宣告式的方式建構複雜的階層式資料結構。建構器的範例使用案例包括：

* 使用 Kotlin 程式碼產生標記，例如 [HTML](https://github.com/Kotlin/kotlinx.html) 或 XML
* 為 Web 伺服器配置路由：[Ktor](https://ktor.io/docs/routing.html)

請參考以下程式碼：

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

            // 具有屬性與文字內容的元素
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
{collapsible="true" collapsed-title="範例輸出"}

## 運作原理 {id="how-it-works"}

假設你需要在 Kotlin 中實作一個型別安全建構器。
首先，定義你想要建構的模型。在此案例中，你需要為 HTML 標籤建立模型。
這可以透過幾個類別輕鬆完成。
例如，`HTML` 是一個描述 `<html>` 標籤的類別，定義了像 `<head>` 和 `<body>` 這樣的子元素。
（請參閱[下方](#full-definition-of-the-com-example-html-package)的宣告。）

現在，讓我們回想一下為什麼可以在程式碼中這樣寫：

```kotlin
html {
 // ...
}
```

`html` 實際上是一個接受 [Lambda 運算式](lambdas.md)作為引數的函式呼叫。
該函式定義如下：

```kotlin
fun html(init: HTML.() -> Unit): HTML {
    val html = HTML()
    html.init()
    return html
}
```

這個函式接受一個名為 `init` 的參數，該參數本身也是一個函式。
該函式的型別為 `HTML.() -> Unit`，這是一個*帶有接收者的函式型別*。
這意味著你需要將一個 `HTML` 型別的執行個體（*接收者*）傳遞給該函式，並且可以在該函式內部呼叫該執行個體的成員。

可以透過 `this` 關鍵字存取接收者：

```kotlin
html {
    this.head { ... }
    this.body { ... }
}
```

（`head` 與 `body` 是 `HTML` 的成員函式。）

現在，照常可以省略 `this`，這樣你就會得到看起來非常像建構器的程式碼：

```kotlin
html {
    head { ... }
    body { ... }
}
```

那麼，這個呼叫做了什麼？讓我們看看上面定義的 `html` 函式主體。
它建立一個新的 `HTML` 執行個體，接著透過呼叫傳入作為引數的函式來初始化它（在此範例中，這歸結為在 `HTML` 執行個體上呼叫 `head` 和 `body`），然後傳回此執行個體。這正是建構器應該做的事情。

`HTML` 類別中的 `head` 和 `body` 函式之定義方式與 `html` 類似。
唯一的區別在於，它們會將建構好的執行個體新增到外層 `HTML` 執行個體的 `children` 集合中：

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

實際上，這兩個函式做的事情完全相同，因此你可以擁有一個泛型版本 `initTag`：

```kotlin
protected fun <T : Element> initTag(tag: T, init: T.() -> Unit): T {
    tag.init()
    children.add(tag)
    return tag
}
```

現在，你的函式變得非常簡單：

```kotlin
fun head(init: Head.() -> Unit) = initTag(Head(), init)

fun body(init: Body.() -> Unit) = initTag(Body(), init)
```

你可以使用它們來建構 `<head>` 和 `<body>` 標籤。

這裡要討論的另一件事是，如何將文字新增到標籤主體中。在上述範例中，你寫了類似這樣的程式碼：

```kotlin
html {
    head {
        title {+"XML encoding with Kotlin"}
    }
    // ...
}
```

基本上，你只是在標籤主體中放入一個字串，但是在它前面有一個小小的 `+`，因此它是一個叫用前綴 `unaryPlus()` 運算的函式呼叫。
該運算實際上是由擴充函式 `unaryPlus()` 定義的，該函式是 `TagWithText` 抽象類別（`Title` 的父類別）的成員：

```kotlin
operator fun String.unaryPlus() {
    children.add(TextElement(this))
}
```

因此，前綴 `+` 在這裡的作用是將字串包裝成 `TextElement` 的執行個體，並將其新增到 `children` 集合中，使其成為標籤樹的正式組成部分。

所有這些都定義在 `com.example.html` 套件中，該套件已在上方建構器範例的開頭匯入。
在最後一節中，你可以完整閱讀該套件的定義。

## 作用域控制：@DslMarker {id="scope-control-dslmarker"}

使用 DSL 時，可能會遇到在上下文中可以呼叫太多函式的問題。
你可以在 Lambda 內部呼叫每個可用的[隱式接收者](lambdas.md#function-literals-with-receiver)的方法，從而產生不一致的結果，例如在另一個 `head` 內部呼叫 `head` 標籤：

```kotlin
html {
    head {
        head {} // 應被禁止
    }
    // ...
}
```

在此範例中，應該只有最近的隱式接收者 `this@head` 的成員可用；`head()` 是外層接收者 `this@html` 的成員，因此呼叫它應該是非法的。

為了解決這個問題，Kotlin 提供了一種控制接收者作用域的特殊機制。

要讓編譯器開始控制作用域，你只需要使用相同的標記註解來標註 DSL 中使用的所有接收者型別即可。
例如，對於 HTML 建構器，你可以宣告一個註解 `@HtmlTagMarker`：

```kotlin
@DslMarker
@Target(AnnotationTarget.CLASS)
annotation class HtmlTagMarker
```

如果一個註解類別被標註了 `@DslMarker` 註解，則該註解類別被稱為 DSL 標記 (DSL marker)。

`@Target` 註解限制了 `@HtmlTagMarker` 可以套用的位置。
DSL 標記僅在套用於以下位置時才會影響作用域控制：

* 型別宣告 (`CLASS`)：用作 DSL 接收者的類別或介面。
* 型別使用 (`TYPE`)：函式型別簽章中的接收者型別。
* 型別別名 (`TYPEALIAS`)：展開為 DSL 接收者型別的型別別名。

將 DSL 標記套用到其他目標（例如函式或屬性）對作用域控制沒有任何效果。

> 若要進一步了解 DSL 標記的運作方式，請參閱相應的 [KEEP 文件](https://github.com/Kotlin/KEEP/blob/main/notes/0005-dsl-marker.md)。
>
{style="note"}

在我們的 DSL 中，所有標籤類別都繼承自同一個超類別 `Tag`。
只需使用 `@HtmlTagMarker` 標註超類別就足夠了，之後 Kotlin 編譯器會將所有繼承的類別都視為已標註：

```kotlin
@HtmlTagMarker
abstract class Tag(val name: String) { ... }
```

你不需要使用 `@HtmlTagMarker` 標註 `HTML` 或 `Head` 類別，因為它們的超類別已經被標註了：

```kotlin
class HTML() : Tag("html") { ... }

class Head() : Tag("head") { ... }
```

新增此註解後，Kotlin 編譯器便知道哪些隱式接收者是同一個 DSL 的一部分，並且僅允許呼叫最近接收者的成員：

```kotlin
html {
    head {
        head { } // 錯誤：外層接收者的成員
    }
    // ...
}
```

請注意，仍然可以呼叫外層接收者的成員，但要做到這一點，你必須明確指定該接收者：

```kotlin
html {
    head {
        this@html.head { } // 可行
    }
    // ...
}
```

你也可以直接將 `@DslMarker` 註解套用到[函式型別](lambdas.md#function-types)。
這需要在註解目標中包含 `AnnotationTarget.TYPE`：

```kotlin
@DslMarker
@Target(AnnotationTarget.CLASS, AnnotationTarget.TYPE)
annotation class HtmlTagMarker
```

因此，`@DslMarker` 註解可以套用到函式型別，最常見的是帶有接收者的 Lambda。例如：

```kotlin
fun html(init: @HtmlTagMarker HTML.() -> Unit): HTML { ... }

fun HTML.head(init: @HtmlTagMarker Head.() -> Unit): Head { ... }

fun Head.title(init: @HtmlTagMarker Title.() -> Unit): Title { ... }
```

當你呼叫這些函式時，`@DslMarker` 註解會限制在以其標記的 Lambda 主體中存取外層接收者，除非你明確指定它們：

```kotlin
html {
    head {
        title {
            // 此處限制存取 title、head 或外層接收者的其他函式。
        }
    }
}
```

在 Lambda 內只能存取最近接收者的成員和擴充，從而防止巢狀作用域之間產生非預期的互動。

當隱式接收者的成員與來自[上下文參數](context-parameters.md)的宣告在同一個作用域中同名時，編譯器會回報警告，因為隱式接收者被上下文參數遮蔽了。
若要解決此問題，請使用 `this` 限定詞明確呼叫接收者，或使用 `contextOf<T>()` 呼叫上下文宣告：

```kotlin
interface HtmlTag {
    fun setAttribute(name: String, value: String)
}

// 宣告一個同名的頂層函式，
// 該函式可透過上下文參數使用
context(tag: HtmlTag)
fun setAttribute(name: String, value: String) { tag.setAttribute(name, value) }

fun test(head: HtmlTag, extraInfo: HtmlTag) {
    with(head) {
        // 在內層作用域中引入同型別的上下文值
        context(extraInfo) {
            // 回報警告：
            // 使用被上下文參數遮蔽的隱式接收者
            setAttribute("user", "1234")

            // 明確呼叫接收者的成員
            this.setAttribute("user", "1234")

            // 明確呼叫上下文宣告
            contextOf<HtmlTag>().setAttribute("user", "1234")
        }
    }
}
```

### com.example.html 套件的完整定義 {id="full-definition-of-the-com-example-html-package"}

這就是 `com.example.html` 套件的定義方式（僅包含上述範例中使用的元素）。
它建構了一個 HTML 樹，並大量使用了[擴充函式](extensions.md)和[帶有接收者的 Lambda](lambdas.md#function-literals-with-receiver)。

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