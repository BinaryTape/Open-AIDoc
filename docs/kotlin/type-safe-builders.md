[//]: # (title: 类型安全构建器)

通过将命名良好的函数用作构建器，并结合[带接收者的函数字面量](lambdas.md#function-literals-with-receiver)，可以在 Kotlin 中创建类型安全且静态类型的构建器。

类型安全构建器允许创建基于 Kotlin 的领域专用语言 (DSL)，适用于以半声明方式构建复杂的层次结构数据。构建器的示例用例包括：

* 使用 Kotlin 代码生成标记语言，例如 [HTML](https://github.com/Kotlin/kotlinx.html) 或 XML
* 为 Web 服务器配置路由：[Ktor](https://ktor.io/docs/routing.html)

考虑以下代码：

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

            // 一个包含属性和文本内容的元素
            a(href = "http://kotlinlang.org") { +"Kotlin" }

            // 混合内容
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
{collapsible="true" collapsed-title="示例输出"}

## 工作原理 {id="how-it-works"}

假设你需要在一个 Kotlin 中实现一个类型安全构建器。
首先，定义你想要构建的模型。在这种情况下，你需要为 HTML 标签建模。
这一步可以通过一组类轻松完成。
例如，`HTML` 是描述 `<html>` 标签的类，它定义了 `<head>` 和 `<body>` 等子标签。
（参见其[下文](#full-definition-of-the-com-example-html-package)中的完整声明。）

现在，让我们回想一下为什么可以在代码中写出类似这样的内容：

```kotlin
html {
 // ...
}
```

`html` 实际上是一个将 [lambda表达式](lambdas.md) 作为实参的函数调用。该函数的定义如下：

```kotlin
fun html(init: HTML.() -> Unit): HTML {
    val html = HTML()
    html.init()
    return html
}
```

该函数接受一个名为 `init` 的形参，其本身也是一个函数。
该函数的类型是 `HTML.() -> Unit`，这是一种*带接收者的函数类型*。
这意味着你需要向该函数传递一个 `HTML` 类型的实例（*接收者*），并且可以在该函数内部调用该实例的成员。

可以通过 `this` 关键字访问接收者：

```kotlin
html {
    this.head { ... }
    this.body { ... }
}
```

（`head` 和 `body` 是 `HTML` 的成员函数。）

现在，像往常一样可以省略 `this`，这样你就得到了一个看起来非常像构建器的代码：

```kotlin
html {
    head { ... }
    body { ... }
}
```

那么，这个调用做了什么？让我们看一下上面定义的 `html` 函数体。
它创建了一个 `HTML` 的新实例，然后通过调用作为实参传递的函数对其进行初始化（在本例中，这归结为在 `HTML` 实例上调用 `head` 和 `body`），最后返回该实例。这正是构建器应该做的。

`HTML` 类中的 `head` 和 `body` 函数的定义与 `html` 类似。
唯一的区别是它们会将构建的实例添加到封闭的 `HTML` 实例的 `children` 集合中：

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

实际上，这两个函数做的是完全相同的事情，因此你可以编写一个泛型版本 `initTag`：

```kotlin
protected fun <T : Element> initTag(tag: T, init: T.() -> Unit): T {
    tag.init()
    children.add(tag)
    return tag
}
```

现在，你的函数变得非常简单：

```kotlin
fun head(init: Head.() -> Unit) = initTag(Head(), init)

fun body(init: Body.() -> Unit) = initTag(Body(), init)
```

你可以使用它们来构建 `<head>` 和 `<body>` 标签。

这里要讨论的另一件事是如何向标签体添加文本。在上面的示例中，你写了类似以下的内容：

```kotlin
html {
    head {
        title {+"XML encoding with Kotlin"}
    }
    // ...
}
```

基本上，你只是在标签体中放入了一个字符串，但它的前面有一个小小的 `+`，所以这是一个调用前缀 `unaryPlus()` 操作的函数调用。
该操作实际上是由 `TagWithText` 抽象类（`Title` 的父类）的成员扩展函数 `unaryPlus()` 定义的：

```kotlin
operator fun String.unaryPlus() {
    children.add(TextElement(this))
}
```

因此，前缀 `+` 在这里的作用是将字符串包装到 `TextElement` 实例中，并将其添加到 `children` 集合中，从而使其成为标签树的一个正确组成部分。

所有这些都定义在 `com.example.html` 软件包中，该软件包已在上述构建器示例的顶部导入。在最后一节中，你可以阅读该软件包的完整定义。

## 作用域控制：@DslMarker {id="scope-control-dslmarker"}

在使用 DSL 时，可能会遇到上下文内可以调用的函数过多的问题。
你可以在 lambda 内部调用每个可用的 [隐式接收者](lambdas.md#function-literals-with-receiver) 的方法，从而导致不一致的结果，例如在另一个 `head` 内部定义 `head` 标签：

```kotlin
html {
    head {
        head {} // 应该被禁止
    }
    // ...
}
```

在这个例子中，只有最近的隐式接收者 `this@head` 的成员应该是可用的；`head()` 是外部接收者 `this@html` 的成员，因此调用它必须是非法的。

为了解决这个问题，Kotlin 提供了一种控制接收者作用域的特殊机制。

要让编译器开始控制作用域，你只需要为 DSL 中使用的所有接收者类型标注同一个标记注解。
例如，对于 HTML 构建器，你可以声明一个注解 `@HtmlTagMarker`：

```kotlin
@DslMarker
@Target(AnnotationTarget.CLASS)
annotation class HtmlTagMarker
```

如果一个注解类被 `@DslMarker` 注解标注，它就被称为 DSL 标记。

`@Target` 注解限制了 `@HtmlTagMarker` 可以应用的位置。
DSL 标记仅在应用于以下位置时影响作用域控制：

* 类型声明 (`CLASS`)：用作 DSL 接收者的类或接口。
* 类型使用 (`TYPE`)：函数类型签名中的接收者类型。
* 类型别名 (`TYPEALIAS`)：展开为 DSL 接收者类型的类型别名。

将 DSL 标记应用于其他目标（如函数或属性）对作用域控制没有影响。

> 有关 DSL 标记工作原理的更多详情，请参阅相应的 [KEEP 文档](https://github.com/Kotlin/KEEP/blob/main/notes/0005-dsl-marker.md)。
>
{style="note"}

在我们的 DSL 中，所有的标签类都继承自同一个超类 `Tag`。
只需要在超类上标注 `@HtmlTagMarker`，之后 Kotlin 编译器就会将所有继承的类视为已标注：

```kotlin
@HtmlTagMarker
abstract class Tag(val name: String) { ... }
```

你不需要在 `HTML` 或 `Head` 类上标注 `@HtmlTagMarker`，因为它们的超类已经标注过了：

```kotlin
class HTML() : Tag("html") { ... }

class Head() : Tag("head") { ... }
```

添加此注解后，Kotlin 编译器就知道哪些隐式接收者属于同一个 DSL，并仅允许调用最近接收者的成员：

```kotlin
html {
    head {
        head { } // 错误：外部接收者的成员
    }
    // ...
}
```

请注意，仍然可以调用外部接收者的成员，但为此你必须显式指定该接收者：

```kotlin
html {
    head {
        this@html.head { } // 可以
    }
    // ...
}
```

你也可以将 `@DslMarker` 注解直接应用于 [函数类型](lambdas.md#function-types)。
这需要将 `AnnotationTarget.TYPE` 包含在注解目标中：

```kotlin
@DslMarker
@Target(AnnotationTarget.CLASS, AnnotationTarget.TYPE)
annotation class HtmlTagMarker
```

因此，`@DslMarker` 注解可以应用于函数类型，最常见的是带接收者的 lambda。例如：

```kotlin
fun html(init: @HtmlTagMarker HTML.() -> Unit): HTML { ... }

fun HTML.head(init: @HtmlTagMarker Head.() -> Unit): Head { ... }

fun Head.title(init: @HtmlTagMarker Title.() -> Unit): Title { ... }
```

当你调用这些函数时，`@DslMarker` 注解会限制在被其标记的 lambda 体内访问外部接收者，除非你显式指定它们：

```kotlin
html {
    head {
        title {
            // 在这里限制访问 title、head 或外部接收者的其他函数。
        }
    }
}
```

在 lambda 内部仅可访问最近接收者的成员和扩展，从而防止嵌套作用域之间产生非预期的交互。

当隐式接收者的成员和来自 [上下文参数](context-parameters.md) 的声明在同一个作用域内同名时，由于隐式接收者被上下文参数遮蔽，编译器会报告警告。
要解决此问题，请使用 `this` 限定符显式调用接收者，或者使用 `contextOf<T>()` 调用上下文声明：

```kotlin
interface HtmlTag {
    fun setAttribute(name: String, value: String)
}

// 声明一个同名的顶级函数，
// 该函数可以通过上下文参数获得
context(tag: HtmlTag)
fun setAttribute(name: String, value: String) { tag.setAttribute(name, value) }

fun test(head: HtmlTag, extraInfo: HtmlTag) {
    with(head) {
        // 在内部作用域引入相同类型的上下文值
        context(extraInfo) {
            // 报告警告：
            // 使用了被上下文参数遮蔽的隐式接收者
            setAttribute("user", "1234")

            // 显式调用接收者的成员
            this.setAttribute("user", "1234")

            // 显式调用上下文声明
            contextOf<HtmlTag>().setAttribute("user", "1234")
        }
    }
}
```

### com.example.html 软件包的完整定义 {id="full-definition-of-the-com-example-html-package"}

以下是 `com.example.html` 软件包的定义方式（仅包含上述示例中使用的元素）。
它构建了一个 HTML 树。它大量使用了 [扩展函数](extensions.md) 和 [带接收者的 lambda](lambdas.md#function-literals-with-receiver)。

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
