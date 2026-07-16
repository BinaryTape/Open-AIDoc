[//]: # (title: HTML DSL)

<var name="artifact_name" value="ktor-server-html-builder"/>
<tldr>
<p>
<b>필수 의존성</b>: <code>io.ktor:%artifact_name%</code>
</p>
<var name="example_name" value="html"/>
<p>
    <b>코드 예제</b>:
    <a href="https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/%example_name%">
        %example_name%
    </a>
</p>
<p>
    <b><Links href="/ktor/server-native" summary="Ktor supports Kotlin/Native and allows you to run a server without an additional runtime or virtual machine.">네이티브 서버(Native server)</Links> 지원</b>: ✅
</p>
</tldr>

HTML DSL은 [kotlinx.html](https://github.com/Kotlin/kotlinx.html) 라이브러리를 Ktor에 통합하여 클라이언트에게 HTML 블록으로 응답할 수 있게 해줍니다. HTML DSL을 사용하면 Kotlin으로 순수 HTML을 작성하고, 변수를 뷰에 보간(interpolate)하며, 템플릿을 사용하여 복잡한 HTML 레이아웃을 빌드할 수도 있습니다.

## 의존성 추가하기 {id="add_dependencies"}
HTML DSL은 별도의 [설치(installation)](server-plugins.md#install)가 필요하지 않지만 `%artifact_name%` 아티팩트가 필요합니다. 다음과 같이 빌드 스크립트에 포함할 수 있습니다.

<Tabs group="languages">
    <TabItem title="Gradle (Kotlin)" group-key="kotlin">
        <code-block lang="Kotlin" code="            implementation(&quot;io.ktor:%artifact_name%:$ktor_version&quot;)"></code-block>
    </TabItem>
    <TabItem title="Gradle (Groovy)" group-key="groovy">
        <code-block lang="Groovy" code="            implementation &quot;io.ktor:%artifact_name%:$ktor_version&quot;"></code-block>
    </TabItem>
    <TabItem title="Maven" group-key="maven">
        <code-block lang="XML" code="            &lt;dependency&gt;&#10;                &lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;                &lt;artifactId&gt;%artifact_name%-jvm&lt;/artifactId&gt;&#10;                &lt;version&gt;${ktor_version}&lt;/version&gt;&#10;            &lt;/dependency&gt;"></code-block>
    </TabItem>
</Tabs>
  

## 응답으로 HTML 보내기 {id="html_response"}
HTML 응답을 보내려면 필요한 [라우트(route)](server-routing.md) 내부에서 [respondHtml](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/respond-html.html) 메서드를 호출하세요.
아래 예제는 샘플 HTML DSL과 클라이언트에 전송될 해당 HTML을 보여줍니다.

<Tabs>
<TabItem title="Kotlin">

```kotlin
import io.ktor.server.application.*
import io.ktor.server.html.*
import io.ktor.http.*
import io.ktor.server.routing.*
import kotlinx.html.*

fun Application.module() {
    routing {
        get("/") {
            val name = "Ktor"
            call.respondHtml(HttpStatusCode.OK) {
                head {
                    title {
                        +name
                    }
                }
                body {
                    h1 {
                        +"Hello from $name!"
                    }
                }
            }
        }
    }
}
```

</TabItem>
<TabItem title="HTML">

```html
<html>
<head>
    <title>Ktor</title>
</head>
<body>
<h1>Hello from Ktor!</h1>
</body>
</html>
```

</TabItem>
</Tabs>

다음 예제는 사용자로부터 [인증 정보(credential information)](server-form-based-auth.md)를 수집하는 데 사용되는 HTML 폼으로 응답하는 방법을 보여줍니다.

<Tabs>
<TabItem title="Kotlin">

```kotlin
get("/login") {
    call.respondHtml {
        body {
            form(action = "/login", encType = FormEncType.applicationXWwwFormUrlEncoded, method = FormMethod.post) {
                p {
                    +"Username:"
                    textInput(name = "username")
                }
                p {
                    +"Password:"
                    passwordInput(name = "password")
                }
                p {
                    submitInput() { value = "Login" }
                }
            }
        }
    }
}
```

</TabItem>
<TabItem title="HTML">

```html
<html>
<body>
<form action="/login" enctype="application/x-www-form-urlencoded" method="post">
    <p>Username:<input type="text" name="username"></p>
    <p>Password:<input type="password" name="password"></p>
    <p><input type="submit" value="Login"></p>
</form>
</body>
</html>
```

</TabItem>
</Tabs>

전체 예제는 [auth-form-html-dsl](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/auth-form-html-dsl)에서 확인할 수 있습니다.

> 서버 측에서 폼 파라미터를 받는 방법에 대해 자세히 알아보려면 [폼 파라미터(Form parameters)](server-requests.md#form_parameters)를 참조하세요.
> 
> kotlinx.html을 사용하여 HTML을 생성하는 방법에 대해 자세히 알아보려면 [kotlinx.html 위키](https://github.com/Kotlin/kotlinx.html/wiki)를 참조하세요.

## HTML 일부(Partial) 보내기 {id="html_fragments"}

전체 HTML 문서를 생성하는 것 외에도 `.respondHtmlFragment()` 함수를 사용하여 HTML 프래그먼트(fragments)로 응답할 수 있습니다.

HTML 프래그먼트는 HTMX와 같은 라이브러리에서 사용하는 동적 업데이트와 같이 전체 `<html>` 문서가 필요하지 않은 부분적인 마크업을 반환할 때 유용합니다.

<Tabs>
<TabItem title="Kotlin">

```kotlin
import io.ktor.server.application.*
import io.ktor.server.html.*
import io.ktor.http.*
import io.ktor.server.routing.*
import kotlinx.html.*

fun Application.module() {
    routing {
        get("/fragment") {
            call.respondHtmlFragment(HttpStatusCode.Created) {
                div("fragment") {
                    span { +"Created!" }
                }
            }
        }
    }
}
```

</TabItem>
<TabItem title="HTML">

```html
<div class="fragment">
    <span>
        Created!
    </span>
</div>

```

</TabItem>
</Tabs>

이 함수는 `.respondHtml()`과 유사하게 작동하지만, 루트 HTML 요소를 추가하지 않고 빌더 내부에서 정의한 콘텐츠만 렌더링합니다.

## 템플릿(Templates) {id="templates"}

일반 HTML 생성 외에도 Ktor는 복잡한 레이아웃을 빌드하는 데 사용할 수 있는 템플릿 엔진을 제공합니다. HTML 페이지의 각 부분에 대해 계층적인 템플릿을 생성할 수 있습니다. 예를 들어, 전체 페이지를 위한 루트 템플릿, 페이지 헤더와 푸터를 위한 자식 템플릿 등을 만들 수 있습니다. Ktor는 템플릿 작업을 위해 다음과 같은 API를 노출합니다.

1. 지정된 템플릿을 기반으로 빌드된 HTML로 응답하려면 [respondHtmlTemplate](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/respond-html-template.html) 메서드를 호출하세요.
2. 템플릿을 만들려면 [Template](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/-template/index.html) 인터페이스를 구현하고 HTML을 제공하는 `Template.apply` 메서드를 오버라이드해야 합니다.
3. 생성된 템플릿 클래스 내부에서 다양한 콘텐츠 유형에 대한 플레이스홀더(placeholders)를 정의할 수 있습니다.
    * [Placeholder](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/-placeholder/index.html)는 콘텐츠를 삽입하는 데 사용됩니다. [PlaceholderList](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/-placeholder-list/index.html)는 여러 번 나타나는 콘텐츠(예: 리스트 항목)를 삽입하는 데 사용할 수 있습니다.
    * [TemplatePlaceholder](https://api.ktor.io/ktor-server-html-builder/io.ktor.server.html/-template-placeholder/index.html)는 자식 템플릿을 삽입하고 중첩된 레이아웃을 생성하는 데 사용할 수 있습니다.
    

### 예제 {id="example"}
템플릿을 사용하여 계층적 레이아웃을 만드는 [예제](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/html-templates)를 살펴보겠습니다. 다음과 같은 HTML이 있다고 가정해 보겠습니다.
```html
<body>
<h1>Ktor</h1>
<article>
    <h2>Hello from Ktor!</h2>
    <p>Kotlin Framework for creating connected systems.</p>
    <ul>
       <li><b>One</b></li>
       <li>Two</li>
    </ul>
</article>
</body>
```
이 페이지의 레이아웃을 두 부분으로 나눌 수 있습니다.
* 페이지 헤더를 위한 루트 레이아웃 템플릿과 본문(article)을 위한 자식 템플릿.
* 본문 콘텐츠를 위한 자식 템플릿.

이러한 레이아웃을 단계별로 구현해 보겠습니다.
  
1. `respondHtmlTemplate` 메서드를 호출하고 템플릿 클래스를 파라미터로 전달합니다. 이 경우 `Template` 인터페이스를 구현해야 하는 `LayoutTemplate` 클래스입니다.
   ```kotlin
   get("/") {
       call.respondHtmlTemplate(LayoutTemplate()) {
           // ...
       }
   }
   ```
   블록 내부에서 템플릿에 액세스하고 해당 프로퍼티 값을 지정할 수 있습니다. 이 값들은 템플릿 클래스에 지정된 플레이스홀더를 대체하게 됩니다. 다음 단계에서 `LayoutTemplate`을 생성하고 해당 프로퍼티를 정의할 것입니다.
  
2. 루트 레이아웃 템플릿은 다음과 같은 모습입니다.
   ```kotlin
   class LayoutTemplate: Template<HTML> {
       val header = Placeholder<FlowContent>()
       val content = TemplatePlaceholder<ArticleTemplate>()
       override fun HTML.apply() {
           body {
               h1 {
                   insert(header)
               }
               insert(ArticleTemplate(), content)
           }
       }
   }
   ```

   이 클래스는 두 개의 프로퍼티를 노출합니다.
   * `header` 프로퍼티는 `h1` 태그 내에 삽입될 콘텐츠를 지정합니다.
   * `content` 프로퍼티는 본문 콘텐츠를 위한 자식 템플릿을 지정합니다.

3. 자식 템플릿은 다음과 같습니다.
   ```kotlin
   class ArticleTemplate : Template<FlowContent> {
       val articleTitle = Placeholder<FlowContent>()
       val articleText = Placeholder<FlowContent>()
       val list = TemplatePlaceholder<ListTemplate>()
       override fun FlowContent.apply() {
           article {
               h2 {
                   insert(articleTitle)
               }
               p {
                   insert(articleText)
               }
               insert(ListTemplate(), list)
           }
       }
   }
   ```

   이 템플릿은 `articleTitle`, `articleText`, `list` 프로퍼티를 노출하며, 그 값들은 `article` 내부에 삽입됩니다.

4. 값 목록을 템플릿으로 제공하려면 다음과 같이 새 클래스를 생성하세요. 
   ```kotlin
   class ListTemplate : Template<FlowContent> {
       val item = PlaceholderList<UL, FlowContent>()
       override fun FlowContent.apply() {
           if (!item.isEmpty()) {
               ul {
                   each(item) {
                       li {
                           if (it.first) {
                               b {
                                   insert(it)
                               }
                           } else {
                               insert(it)
                           }
                       }
                   }
               }
           }
       }
   }
   ```

   이 템플릿은 `PlaceholderList` 클래스를 사용하여 제공된 항목들로부터 순서 없는 리스트(`UL`)를 생성합니다.
   또한 강조를 위해 첫 번째 항목을 `<b>` 요소로 감쌉니다.

5. 이제 지정된 프로퍼티 값을 사용하여 빌드된 HTML을 보낼 준비가 되었습니다.
   ```kotlin
   get("/") {
       call.respondHtmlTemplate(LayoutTemplate()) {
           header {
               +"Ktor"
           }
           content {
               articleTitle {
                   +"Hello from Ktor!"
               }
               articleText {
                   +"Kotlin Framework for creating connected systems."
               }
               list {
                   item { +"One" }
                   item { +"Two" }
               }
           }
       }
   }
   ```

전체 예제는 여기에서 확인할 수 있습니다: [html-templates](https://github.com/ktorio/ktor-documentation/tree/main/codeSnippets/snippets/html-templates).