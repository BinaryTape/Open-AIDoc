[//]: # (title: 타입 세이프 빌더)

이름을 잘 지은 함수를 [수신 객체 지정 함수 리터럴](lambdas.md#function-literals-with-receiver)과 결합하여 빌더로 사용하면 Kotlin에서 타입 세이프(type-safe)하고 정적 타입 지정(statically-typed)된 빌더를 만들 수 있습니다.

타입 세이프 빌더를 사용하면 복잡한 계층적 데이터 구조를 반선언적(semi-declarative) 방식으로 구축하는 데 적합한 Kotlin 기반의 도메인 특화 언어(DSL)를 만들 수 있습니다. 빌더의 대표적인 사용 사례는 다음과 같습니다:

* [HTML](https://github.com/Kotlin/kotlinx.html) 또는 XML과 같은 마크업을 Kotlin 코드로 생성
* 웹 서버의 라우트 구성: [Ktor](https://ktor.io/docs/routing.html)

다음 코드를 살펴보세요:

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

            // 속성과 텍스트 콘텐츠가 있는 요소
            a(href = "http://kotlinlang.org") { +"Kotlin" }

            // 혼합된 콘텐츠
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
{collapsible="true" collapsed-title="Example output"}

## 동작 원리 {id="how-it-works"}

Kotlin에서 타입 세이프 빌더를 구현해야 한다고 가정해 보겠습니다.
가장 먼저 빌드하려는 모델을 정의해야 합니다. 이 경우 HTML 태그를 모델링해야 합니다.
이는 몇 개의 클래스로 쉽게 할 수 있습니다.
예를 들어, `HTML`은 `<head>`와 `<body>` 같은 자식 요소를 정의하는 `<html>` 태그를 설명하는 클래스입니다.
(해당 선언은 [아래](#com-example-html-패키지의-전체-정의)를 참조하세요.)

이제 코드에서 왜 다음과 같이 작성할 수 있는지 되짚어보겠습니다:

```kotlin
html {
 // ...
}
```

`html`은 실제로는 [람다 표현식](lambdas.md)을 인자로 받는 함수 호출입니다.
이 함수는 다음과 같이 정의됩니다:

```kotlin
fun html(init: HTML.() -> Unit): HTML {
    val html = HTML()
    html.init()
    return html
}
```

이 함수는 `init`이라는 이름의 파라미터를 하나 받으며, 이 파라미터 자체도 함수입니다.
이 함수의 타입은 `HTML.() -> Unit`으로, *수신 객체 지정 함수 타입(function type with receiver)*입니다.
이는 함수에 `HTML` 타입의 인스턴스(*수신 객체*)를 전달해야 하며, 함수 내부에서 해당 인스턴스의 멤버를 호출할 수 있음을 의미합니다.

수신 객체는 `this` 키워드를 통해 접근할 수 있습니다:

```kotlin
html {
    this.head { ... }
    this.body { ... }
}
```

(`head`와 `body`는 `HTML`의 멤버 함수입니다.)

이제 평소와 같이 `this`를 생략할 수 있으며, 그러면 이미 빌더와 매우 유사한 형태가 됩니다:

```kotlin
html {
    head { ... }
    body { ... }
}
```

그렇다면 이 호출은 무엇을 할까요? 위에서 정의한 `html` 함수의 본문을 살펴보겠습니다.
먼저 `HTML`의 새 인스턴스를 생성한 다음, 인자로 전달된 함수를 호출하여 이를 초기화합니다(이 예제에서는 `HTML` 인스턴스에서 `head`와 `body`를 호출하는 것으로 귀결됩니다). 그런 다음 이 인스턴스를 반환합니다. 이것이 바로 빌더가 해야 할 일입니다.

`HTML` 클래스의 `head` 및 `body` 함수도 `html`과 유사하게 정의됩니다. 
유일한 차이점은 빌드된 인스턴스를 이를 둘러싼 `HTML` 인스턴스의 `children` 컬렉션에 추가한다는 점입니다:

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

실제로 이 두 함수는 동일한 작업을 수행하므로 제네릭 버전인 `initTag`를 만들 수 있습니다:

```kotlin
protected fun <T : Element> initTag(tag: T, init: T.() -> Unit): T {
    tag.init()
    children.add(tag)
    return tag
}
```

이제 함수들이 매우 단순해집니다:

```kotlin
fun head(init: Head.() -> Unit) = initTag(Head(), init)

fun body(init: Body.() -> Unit) = initTag(Body(), init)
```

그리고 이를 사용하여 `<head>`와 `<body>` 태그를 빌드할 수 있습니다. 

여기서 논의할 또 다른 한 가지는 태그 본문에 텍스트를 추가하는 방법입니다. 위의 예제에서 다음과 같이 작성했습니다:

```kotlin
html {
    head {
        title {+"XML encoding with Kotlin"}
    }
    // ...
}
```

기본적으로 태그 본문 안에 문자열을 넣은 것이지만, 그 앞에 작은 `+`가 붙어 있습니다.
이는 접두사 `unaryPlus()` 연산을 호출하는 함수 호출입니다.
이 연산은 실제로는 `TagWithText` 추상 클래스(`Title`의 부모 클래스)의 멤버인 확장 함수 `unaryPlus()`에 의해 정의됩니다:

```kotlin
operator fun String.unaryPlus() {
    children.add(TextElement(this))
}
```

따라서 여기서 접두사 `+`가 하는 일은 문자열을 `TextElement` 인스턴스로 감싸고 이를 `children` 컬렉션에 추가하여 태그 트리의 적절한 일부가 되도록 만드는 것입니다.

이 모든 내용은 위의 빌더 예제 상단에서 임포트한 `com.example.html` 패키지에 정의되어 있습니다.
마지막 섹션에서 이 패키지의 전체 정의를 읽어볼 수 있습니다.

## 스코프 제어: @DslMarker {id="scope-control-dslmarker"}

DSL을 사용할 때 컨텍스트 내에서 너무 많은 함수를 호출할 수 있는 문제에 직면할 수 있습니다.
람다 내부에서 사용 가능한 모든 [암시적 수신 객체(implicit receiver)](lambdas.md#function-literals-with-receiver)의 메서드를 호출할 수 있으므로, `head` 태그 안에 또 다른 `head`가 들어가는 것과 같이 일관성 없는 결과가 발생할 수 있습니다:

```kotlin
html {
    head {
        head {} // 금지되어야 함
    }
    // ...
}
```

이 예제에서는 가장 가까운 암시적 수신 객체인 `this@head`의 멤버만 사용할 수 있어야 합니다. `head()`는 외부 수신 객체인 `this@html`의 멤버이므로 이를 호출하는 것은 잘못된 것이어야 합니다.

이 문제를 해결하기 위해 수신 객체 스코프를 제어하는 특별한 메커니즘이 있습니다.

컴파일러가 스코프를 제어하도록 하려면 DSL에서 사용되는 모든 수신 객체의 타입을 동일한 마커 어노테이션으로 표시하기만 하면 됩니다.
예를 들어, HTML 빌더의 경우 `@HtmlTagMarker` 어노테이션을 선언합니다:

```kotlin
@DslMarker
@Target(AnnotationTarget.CLASS)
annotation class HtmlTagMarker
```

어노테이션 클래스가 `@DslMarker` 어노테이션으로 표시되어 있으면 이를 DSL 마커라고 부릅니다.

`@Target` 어노테이션은 `@HtmlTagMarker`가 적용될 수 있는 위치를 제한합니다.
DSL 마커는 다음 항목에 적용될 때만 스코프 제어에 영향을 미칩니다:

* 타입 선언 (`CLASS`): DSL 수신 객체로 사용되는 클래스 또는 인터페이스.
* 타입 사용 (`TYPE`): 함수 타입 시그니처의 수신 객체 타입.
* 타입 별칭 (`TYPEALIAS`): DSL 수신 객체 타입으로 확장되는 타입 별칭.

DSL 마커를 다른 대상(예: 함수나 프로퍼티)에 적용하는 것은 스코프 제어에 영향을 미치지 않습니다.

> DSL 마커가 작동하는 방식에 대한 자세한 내용은 해당 [KEEP 문서](https://github.com/Kotlin/KEEP/blob/main/notes/0005-dsl-marker.md)를 참조하세요.
>
{style="note"}

우리의 DSL에서 모든 태그 클래스는 동일한 슈퍼클래스 `Tag`를 상속합니다.
슈퍼클래스에만 `@HtmlTagMarker`를 표시하면 충분하며, 그 후 Kotlin 컴파일러는 상속된 모든 클래스를 어노테이션이 표시된 것으로 간주합니다:

```kotlin
@HtmlTagMarker
abstract class Tag(val name: String) { ... }
```

`HTML`이나 `Head` 클래스의 슈퍼클래스가 이미 어노테이션되어 있으므로 이 클래스들에 `@HtmlTagMarker`를 표시할 필요가 없습니다:

```kotlin
class HTML() : Tag("html") { ... }

class Head() : Tag("head") { ... }
```

이 어노테이션을 추가하면 Kotlin 컴파일러는 어떤 암시적 수신 객체가 동일한 DSL의 일부인지 알게 되며, 가장 가까운 수신 객체의 멤버만 호출할 수 있도록 허용합니다:

```kotlin
html {
    head {
        head { } // 오류: 외부 수신 객체의 멤버임
    }
    // ...
}
```

외부 수신 객체의 멤버를 호출하는 것이 여전히 가능하지만, 그렇게 하려면 해당 수신 객체를 명시적으로 지정해야 합니다:

```kotlin
html {
    head {
        this@html.head { } // 가능
    }
    // ...
}
```

`@DslMarker` 어노테이션을 [함수 타입(function types)](lambdas.md#function-types)에 직접 적용할 수도 있습니다.
이를 위해서는 어노테이션 타겟에 `AnnotationTarget.TYPE`을 포함해야 합니다:

```kotlin
@DslMarker
@Target(AnnotationTarget.CLASS, AnnotationTarget.TYPE)
annotation class HtmlTagMarker
```

결과적으로 `@DslMarker` 어노테이션을 함수 타입, 가장 일반적으로는 수신 객체가 있는 람다에 적용할 수 있습니다. 예를 들어:

```kotlin
fun html(init: @HtmlTagMarker HTML.() -> Unit): HTML { ... }

fun HTML.head(init: @HtmlTagMarker Head.() -> Unit): Head { ... }

fun Head.title(init: @HtmlTagMarker Title.() -> Unit): Title { ... }
```

이러한 함수를 호출할 때, 명시적으로 지정하지 않는 한 `@DslMarker` 어노테이션이 표시된 람다 본문 내에서 외부 수신 객체에 대한 접근을 제한합니다:

```kotlin
html {
    head {
        title {
            // 여기서는 title, head 또는 외부 수신 객체의 다른 함수에 대한 접근이 제한됩니다.
        }
    }
}
```

람다 내에서는 가장 가까운 수신 객체의 멤버와 확장 함수만 접근할 수 있어, 중첩된 스코프 간의 의도치 않은 상호작용을 방지합니다.

암시적 수신 객체의 멤버와 [컨텍스트 파라미터(context parameter)](context-parameters.md)의 선언이 동일한 이름으로 스코프 내에 있는 경우, 암시적 수신 객체가 컨텍스트 파라미터에 의해 가려지기(shadowed) 때문에 컴파일러가 경고를 보고합니다.
이를 해결하려면 `this` 한정자를 사용하여 수신 객체를 명시적으로 호출하거나, `contextOf<T>()`를 사용하여 컨텍스트 선언을 호출하세요:

```kotlin
interface HtmlTag {
    fun setAttribute(name: String, value: String)
}

// 컨텍스트 파라미터를 통해 사용할 수 있는
// 동일한 이름의 최상위 함수를 선언합니다.
context(tag: HtmlTag)
fun setAttribute(name: String, value: String) { tag.setAttribute(name, value) }

fun test(head: HtmlTag, extraInfo: HtmlTag) {
    with(head) {
        // 내부 스코프에 동일한 타입의 컨텍스트 값을 도입합니다.
        context(extraInfo) {
            // 경고 보고:
            // 컨텍스트 파라미터에 의해 가려진 암시적 수신 객체를 사용함
            setAttribute("user", "1234")

            // 수신 객체의 멤버를 명시적으로 호출
            this.setAttribute("user", "1234")

            // 컨텍스트 선언을 명시적으로 호출
            contextOf<HtmlTag>().setAttribute("user", "1234")
        }
    }
}
```

### com.example.html 패키지의 전체 정의 {id="full-definition-of-the-com-example-html-package"}

`com.example.html` 패키지가 정의되는 방식은 다음과 같습니다(위의 예제에서 사용된 요소들만 포함).
이 패키지는 HTML 트리를 빌드합니다. [확장 함수(extension functions)](extensions.md)와 [수신 객체 지정 람다(lambdas with receiver)](lambdas.md#function-literals-with-receiver)를 적극적으로 사용합니다.

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
